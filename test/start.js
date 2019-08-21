// Import the dependencies for testing
import chai from "chai";
import chaiHttp from "chai-http";
var rimraf = require("rimraf");

var request = require("request-promise");

function pad2(n) {
  return n < 10 ? "0" + n : n;
}

import app from "../src/server.js";

const {
  CONSUMER_KEY,
  CONSUMER_SECRET,
  SHORT_CODE,
  REGISTRATION_SHORT_CODE,
  SECURITY_CREDENTIAL,
  PASS_KEY,
  CONFIRMATION_CALLBACK,
  VALIDATION_CALLBACK,
  LIPA_NA_MPESA_CALLBACK,
  MSISDN
} = process.env;

chai.use(chaiHttp);
chai.should();
var expect = chai.expect;

const sharedInfo = {};

describe("Setup", () => {
  before(function(done) {
    this.timeout(1000); // wait for db connections etc.

    setTimeout(done, 500);
  });

  describe("Health", function() {
    // Test to get all students record
    it("Health should return 200", done => {
      chai
        .request(app)
        .get("/health")
        .end((err, res) => {
          res.should.have.status(200);

          done();
        });
    });
  });

  describe("Safaricom Setup", function() {
    // Test to get all students record
    it("It should get an access_token", async () => {
      try {
        const res = await request({
          url:
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          auth: {
            user: CONSUMER_KEY,
            pass: CONSUMER_SECRET
          }
        });

        const { access_token, expires_in } = JSON.parse(res);

        expect(access_token).to.exist;
        expect(expires_in).to.exist;

        Object.assign(sharedInfo, { access_token });
      } catch (err) {
        console.log(err);
        throw err;
      }
    });
    it("Encode base64 using credentials", async () => {
      var date = new Date();
      const timestamp =
        date.getFullYear().toString() +
        pad2(date.getMonth() + 1) +
        pad2(date.getDate()) +
        pad2(date.getHours()) +
        pad2(date.getMinutes()) +
        pad2(date.getSeconds());

      const originCredentials = `${SHORT_CODE}${PASS_KEY}${timestamp}`;
      const credentials = Buffer.from(originCredentials).toString("base64");

      Object.assign(sharedInfo, { timestamp, credentials });
    });

    it("Send request to register a url", async () => {
      const body = {
        ShortCode: REGISTRATION_SHORT_CODE,
        ResponseType: "Cancelled",
        ConfirmationURL: CONFIRMATION_CALLBACK,
        ValidationURL: VALIDATION_CALLBACK
      };

      // console.log(body);

      await request({
        url: "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
        method: "post",
        headers: {
          Authorization: `Bearer ${sharedInfo.access_token}`
        },
        body,
        json: true
      });

      // console.log(res);
    });

    it("Send request to process a transaction", async () => {
      const high = 8;
      const low = 5;

      const Amount = Math.floor(Math.random() * high) + low;

      /* 
        generate a unique id for this tx so saf can send it back 
        and you will know which tx they are paying for and clean out garbage tx's from bad actors
      */
      const uuidv4 = require("uuid/v4");
      const CallBackURL = `${LIPA_NA_MPESA_CALLBACK}/${uuidv4()}`;

      const body = {
        BusinessShortCode: SHORT_CODE,
        Password: sharedInfo.credentials,
        Timestamp: sharedInfo.timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount,
        PartyA: MSISDN,
        PartyB: SHORT_CODE,
        PhoneNumber: MSISDN,
        CallBackURL,
        AccountReference: "1232",
        TransactionDesc: "TESTING"
      };

      // console.log(body);

      try {
        const {
          MerchantRequestID,
          CheckoutRequestID,
          ResponseCode,
          ResponseDescription,
          CustomerMessage
        } = await request({
          url:
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
          method: "post",
          headers: {
            Authorization: `Bearer ${sharedInfo.access_token}`
          },
          body,
          json: true
        });

        expect(ResponseDescription).to.equal(
          "Success. Request accepted for processing"
        );
        expect(CustomerMessage).to.equal(
          "Success. Request accepted for processing"
        );
      } catch (err) {
        throw err;
      }
    });
  });
});
