const axios = require('axios');

const initializeTransaction = (body, access_token) => async () => {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + access_token
    };
    try {
        const response = await axios.post("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest", body, { headers });
        const resultData = response.data;

        if (resultData.fault) {
            throw new Error(resultData.fault);
        }
        return resultData;
    } catch (error) {
        throw new Error(error.response ? error.response.data : error.message);
    }
};

function createCircuitBreaker(failureThreshold = 5, cooldownPeriod = 10000) {
    let circuitState = 'CLOSED';
    let failureCount = 0;

    function executeWithCircuitBreaker(func) {
        return async (...args) => {
            if (circuitState === 'OPEN') {
                throw new Error('Circuit is OPEN. Request declined.');
            }

            try {
                const result = await func(...args);
                handleSuccess();
                return result;
            } catch (error) {
                handleFailure();
                throw error;
            }
        };
    }

    function handleSuccess() {
        if (circuitState === 'HALF_OPEN') {
            circuitState = 'CLOSED';
            failureCount = 0;
        }
    }

    function handleFailure() {
        failureCount++;

        if (failureCount >= failureThreshold) {
            circuitState = 'OPEN';
            setTimeout(() => {
                circuitState = 'HALF_OPEN';
            }, cooldownPeriod);
        }
    }

    return {
        execute: executeWithCircuitBreaker,
    };
}

async function delayAsync(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function retryWithExponentialBackoffAndCircuitBreaker(func, maxRetries = 3) {
  let retries = 0;
  const circuitBreaker = createCircuitBreaker();

  while (retries < maxRetries) {
      try {
          const result = await circuitBreaker.execute(func)();
          return result;
      } catch (error) {
          retries++;
          const delay = Math.pow(1.2, retries) * 1000; // Fixed the exponential backoff calculation
          console.log(`Retrying after ${delay} milliseconds...`);
          await delayAsync(delay);
      }
  }

  throw new Error(`Max retries (${maxRetries}) exceeded. Request failed.`);
}


module.exports = {
  retryWithExponentialBackoffAndCircuitBreaker,
  initializeTransaction
}


// it("Send request to process a transaction", function(done) {
//     this.timeout(100000);
//     /* 
//       generate a unique id for this tx so saf can send it back 
//       and you will know which tx they are paying for and clean out garbage tx's from bad actors
//     */
//     const uuidv4 = require("uuid/v4");
//     const CallBackURL = `${LIPA_NA_MPESA_CALLBACK}/${uuidv4()}`;

//     const body = {
//       "BusinessShortCode": 174379,
//       "Password": "MTc0Mzc*********wMjQwNDE4MTUzNzEy",
//       "Timestamp": "202*****3712",
//       "TransactionType": "CustomerPayBillOnline",
//       "Amount": 1,
//       "PartyA": 25****149,
//       "PartyB": 17**79,
//       "PhoneNumber": 25*****74149,
//       CallBackURL,
//       "AccountReference": "CompanyXLTD",
//       "TransactionDesc": "Payment of X" 
//     }

//     retryWithExponentialBackoffAndCircuitBreaker(initializeTransaction(body, sharedInfo.access_token), 50)
//       .then(data => {
//         console.log('Transaction data:', data);
//         done()
//       })
//       .catch(error => {
//         console.error('Failed to innitialize transaction:', error);
//       });
//   });