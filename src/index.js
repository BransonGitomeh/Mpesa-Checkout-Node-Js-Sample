require("source-map-support");
require("dotenv").config();
require("babel-polyfill");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var router = express.Router();
var fetch = require("node-fetch");
var request = require("request");

router.use(
  morgan("tiny"),
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true })
);

router.use("/health", function(req, res) {
  res.send("OK");
});

/* 
  If the customer innitiates the transaction manually from his phone... the two endpoints bellow get to be used
*/
router.use("/confirmation", function(req, res) {
  console.log(JSON.stringify(req.body, null, "\t"));

  let message = {
    ResponseCode: "00000000",
    ResponseDesc: "success"
  };

  // respond to safaricom servers with a success message
  res.json(message);
});

router.use("/validation", function(req, res) {
  console.log(JSON.stringify(req.body, null, "\t"));

  let message = {
    ResponseCode: "00000000",
    ResponseDesc: "success"
  };

  // respond to safaricom servers with a success message
  res.json(message);
});

const listener = body =>
  new Promise((resolve, reject) => {
    var jar = request.jar();
    jar.setCookie(
      request.cookie(
        "private_content_version=ed15a9754b79c1b14d43d74a61fee6aa"
      ),
      "https://www.domeyacademy.net/safaricommpesa/mpesa/stkpushlistener"
    );
    jar.setCookie(
      request.cookie(
        "mage-messages=%255B%257B%2522type%2522%253A%2522error%2522%252C%2522text%2522%253A%2522Invalid%2BForm%2BKey.%2BPlease%2Brefresh%2Bthe%2Bpage.%2522%257D%252C%257B%2522type%2522%253A%2522error%2522%252C%2522text%2522%253A%2522Invalid%2BForm%2BKey.%2BPlease%2Brefresh%2Bthe%2Bpage.%2522%257D%252C%257B%2522type%2522%253A%2522error%2522%252C%2522text%2522%253A%2522Invalid%2BForm%2BKey.%2BPlease%2Brefresh%2Bthe%2Bpage.%2522%257D%252C%257B%2522type%2522%253A%2522error%2522%252C%2522text%2522%253A%2522Invalid%2BForm%2BKey.%2BPlease%2Brefresh%2Bthe%2Bpage.%2522%257D%255D"
      ),
      "https://www.domeyacademy.net/safaricommpesa/mpesa/stkpushlistener"
    );

    var options = {
      method: "POST",
      url: "https://www.domeyacademy.net/safaricommpesa/mpesa/stkpushlistener",
      headers: {
        "content-type": "application/json",
        "x-requested-with": "XMLHttpRequest"
      },
      body,
      json: true,
      jar: "JAR"
    };

    request(options, function(error, response, body) {
      if (error) throw new Error(error);

      // console.log({
      //   error,
      //   response,
      //   body
      // });
      resolve(body);
    });
  });

const confirm = ({ m_id, c_id }) =>
  new Promise((resolve, reject) => {
    fetch("https://www.domeyacademy.net/safaricommpesa/mpesa/confirmpayment", {
      method: "POST",
      headers: {
        cookie:
          "mage-translation-storage=%7B%7D; mage-translation-file-version=%7B%7D; mage-cache-storage=%7B%7D; mage-cache-storage-section-invalidation=%7B%7D; recently_viewed_product=%7B%7D; recently_viewed_product_previous=%7B%7D; recently_compared_product=%7B%7D; recently_compared_product_previous=%7B%7D; product_data_storage=%7B%7D; mage-messages=; form_key=Pqjb5QK9ITP3h6C6; mage-cache-sessid=true; PHPSESSID=4lshc43j770di62crfp6kmq8uo; private_content_version=8a84f7c353fb63b0ad821495f93f164a; section_data_ids=%7B%22cart%22%3A1574835656%2C%22directory-data%22%3A1574835656%2C%22customer%22%3A1574835656%2C%22compare-products%22%3A1574835656%2C%22last-ordered-items%22%3A1574835656%2C%22instant-purchase%22%3A1574835656%2C%22captcha%22%3A1574835656%2C%22persistent%22%3A1574835656%2C%22review%22%3A1574835656%2C%22wishlist%22%3A1574835656%2C%22recently_viewed_product%22%3A1574835656%2C%22recently_compared_product%22%3A1574835656%2C%22product_data_storage%22%3A1574835656%2C%22paypal-billing-agreement%22%3A1574835656%2C%22checkout-fields%22%3A1574835656%2C%22collection-point-result%22%3A1574835656%2C%22pickup-location-result%22%3A1574835656%2C%22messages%22%3A1574835827%7D",
        connection: "keep-alive",
        accept: "*/*",
        origin: "https://www.domeyacademy.net",
        "x-requested-with": "XMLHttpRequest",
        "user-agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36",
        dnt: "1",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        "sec-fetch-site": "same-origin",
        "sec-fetch-mode": "cors",
        referer: "https://www.domeyacademy.net/checkout/",
        "accept-encoding": "gzip, deflate, br",
        "accept-language":
          "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,fr;q=0.6,ar;q=0.5"
      },
      body: {
        m_id,
        c_id
      }
    })
      .then(response => response.json())
      .then(response => {
        // console.log(response);
        resolve(response);
      })
      .catch(err => {
        console.log(err);
      });
  });
/*
  if you innitiated the transaction to his device directly...then the bellow endpoint gets called
*/
router.use("/lipaCallback/:txid", async function(req, res) {
  /*
    Also just to be clear, if someone got hold of your callback url they can 
    totally send you garbage transactions because there is no way to know its big brother safaricom calling

    so use the txid's to check if you are the one who innitiated that call and mark if the txid doesnt exist.
    then get a human to check them manually
  */
  console.log(JSON.stringify(req.body, null, "\t"));

  // you will recieve
  // {
  //   "Body": {
  //     "stkCallback": {
  //       "MerchantRequestID": "23386-22xxx5994-1",
  //       "CheckoutRequestID": "ws_CO_DMZ_395996794_2108xxxxxx0548221",
  //       "ResultCode": 0,
  //       "ResultDesc": "The service request is processed successfully.",
  //       "CallbackMetadata": {
  //         "Item": [
  //           {
  //             "Name": "Amount",
  //             "Value": 7
  //           },
  //           {
  //             "Name": "MpesaReceiptNumber",
  //             "Value": "NHL533VVY3"
  //           },
  //           {
  //             "Name": "Balance"
  //           },
  //           {
  //             "Name": "TransactionDate",
  //             "Value": 20190821220551
  //           },
  //           {
  //             "Name": "PhoneNumber",
  //             "Value": 2547xxxxx108
  //           }
  //         ]
  //       }
  //     }
  //   }
  // }

  const listenerRes = await listener(req.body);

  // console.log({ listenerRes });

  // const confirmRes = await confirm({
  //   c_id: listenerRes.MerchantRequestID,
  //   m_id: listenerRes.CheckoutRequestID
  // });

  // console.log({ confirmRes });

  let message = {
    ResponseCode: "00000000",
    ResponseDesc: "success"
  };

  // respond to safaricom servers with a success message
  res.json(message);
});

export default router;
