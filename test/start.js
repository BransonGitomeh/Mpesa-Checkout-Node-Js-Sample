// Import the dependencies for testing
import chai from "chai";
import chaiHttp from "chai-http";
var rimraf = require("rimraf");

var request = require("request-promise");
var { retryWithExponentialBackoffAndCircuitBreaker, initializeTransaction } = require("./darajaExponentialBackoffAndCircuitBreaker.js")

// const  = exportTest

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
  before(function (done) {
    this.timeout(1000); // wait for db connections etc.

    setTimeout(done, 500);
  });

  describe("Health", function () {
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

  describe("Safaricom Setup", function () {
    // Test to get all students record
    it("It should get an access_token", async () => {
      try {
        const requestOptions = {
          url:
            "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
          auth: {
            user: CONSUMER_KEY,
            pass: CONSUMER_SECRET
          }
        }

        console.log(requestOptions)

        const res = await request(requestOptions);

        const { access_token, expires_in } = JSON.parse(res);

        console.log(access_token, expires_in)

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

      Object.assign(sharedInfo, { timestamp, credentials, originCredentials });

      console.log(sharedInfo)
    });

    // it("Send request to register a url", async () => {
    //   const body = {
    //     ShortCode: REGISTRATION_SHORT_CODE,
    //     ResponseType: "Cancelled",
    //     ConfirmationURL: CONFIRMATION_CALLBACK,
    //     ValidationURL: VALIDATION_CALLBACK
    //   };

    //   console.log(JSON.stringify(body, null,'\t'));

    //   const requestOptions = {
    //     url: "https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl",
    //     method: "post",
    //     headers: {
    //       Authorization: `Basic ${sharedInfo.access_token}`,
    //       'Content-Type': 'application/json',
    //     },
    //     body,
    //     json: true
    //   }

    //   console.log(requestOptions)

    //   await request(requestOptions);

    //   // console.log(res);
    // });

    it("Send request to process a transaction", function(done) {
      this.timeout(100000);

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


      retryWithExponentialBackoffAndCircuitBreaker(initializeTransaction(body, sharedInfo.access_token), 50)
        .then(data => {
          console.log('Transaction data:', data);
          done()
        })
        .catch(error => {
          console.error('Failed to innitialize transaction:', error);
        });
    });
  });
});




// Headers
// Key: Authorization
// Value: Basic bnhTT2tDRWtzYVE4dlkwSU90MmtCZ2Z4M1E2aG5RaUE6cjdQQkVaaGVvcnNVdU9jQw==
// ​
// Body
//   {
//     "BusinessShortCode": 174379,
//     "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjQwNDE4MTUwODA5",
//     "Timestamp": "20240418150809",
//     "TransactionType": "CustomerPayBillOnline",
//     "Amount": 1,
//     "PartyA": 254708374149,
//     "PartyB": 174379,
//     "PhoneNumber": 254741147930,
//     "CallBackURL": "https://seal-app-elywd.ondigitalocean.app/billing/confirmation",
//     "AccountReference": "CompanyXLTD",
//     "TransactionDesc": "Payment of X" 
//   }



// let headers = new Headers();
// headers.append("Content-Type", "application/json");
// headers.append("Authorization", "Bearer hoOhSuuCAwZGNVarDHnLGfnqTDiY");
// ​
// fetch("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", {
//   method: 'POST',
//   headers,
//   body: JSON.stringify({
//     "BusinessShortCode": 174379,
//     "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjQwNDE4MTUzNzEy",
//     "Timestamp": "20240418153712",
//     "TransactionType": "CustomerPayBillOnline",
//     "Amount": 1,
//     "PartyA": 254708374149,
//     "PartyB": 174379,
//     "PhoneNumber": 254708374149,
//     "CallBackURL": "https://mydomain.com/path",
//     "AccountReference": "CompanyXLTD",
//     "TransactionDesc": "Payment of X" 
//   })
// })
//   .then(response => response.text())
//   .then(result => console.log(result))
//   .catch(error => console.log(error));