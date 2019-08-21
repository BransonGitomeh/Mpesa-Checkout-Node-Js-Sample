require("source-map-support").install();
(function(e, a) { for(var i in a) e[i] = a[i]; }(this, /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/server.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
__webpack_require__(/*! source-map-support */ "source-map-support");
__webpack_require__(/*! dotenv */ "dotenv").config();
__webpack_require__(/*! babel-polyfill */ "babel-polyfill");
const express = __webpack_require__(/*! express */ "express");
const morgan = __webpack_require__(/*! morgan */ "morgan");
const bodyParser = __webpack_require__(/*! body-parser */ "body-parser");
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

/* harmony default export */ __webpack_exports__["default"] = (router);


/***/ }),

/***/ "./src/server.js":
/*!***********************!*\
  !*** ./src/server.js ***!
  \***********************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
const { default: router } = __webpack_require__(/*! ./index */ "./src/index.js");
var express = __webpack_require__(/*! express */ "express");
var app = express();

const { NODE_ENV } = process.env;

app.use("/", router);

if (NODE_ENV !== "test") {
  const server = app.listen(5000, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log(`server listening on port ${port}`);
  });
}

/* harmony default export */ __webpack_exports__["default"] = (app);


/***/ }),

/***/ "babel-polyfill":
/*!*********************************!*\
  !*** external "babel-polyfill" ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("babel-polyfill");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("body-parser");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "morgan":
/*!*************************!*\
  !*** external "morgan" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),

/***/ "source-map-support":
/*!*************************************!*\
  !*** external "source-map-support" ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("source-map-support");

/***/ })

/******/ })));
//# sourceMappingURL=index.js.map