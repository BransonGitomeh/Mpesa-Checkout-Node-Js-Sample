require("source-map-support");
require("dotenv").config();
require("babel-polyfill");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
var router = express.Router();

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

/*
  if you innitiated the transaction to his device directly...then the bellow endpoint gets called
*/
router.use("/lipaCallback/:txid", function(req, res) {
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

  let message = {
    ResponseCode: "00000000",
    ResponseDesc: "success"
  };

  // respond to safaricom servers with a success message
  res.json(message);
});

export default router;
