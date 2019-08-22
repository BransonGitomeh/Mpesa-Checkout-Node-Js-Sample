# About

This project was used to setup safaricom daraja and run a server than can confirm requests and get called back by daraja after successfull stk push requests

# Configuration

Add a .env file with the following variables

```
CONSUMER_KEY=HuE6cuvwTLzxxxxxxSL2g1WieR
CONSUMER_SECRET=3GyaNxxxxx9b

# for whatever reason, daraja wants this codes like this. all other combinations fail
SHORT_CODE=174379
REGISTRATION_SHORT_CODE=600730

# get this two from this link
SECURITY_CREDENTIAL=Safaricom007@
PASS_KEY=bfb279fxxxxxxxxxxxxxxxxxxxxxxxda1ed2c919

# this callbacks will be used when the user mannually innitiates the tx
CONFIRMATION_CALLBACK=https://yourserver.com/confirmation
VALIDATION_CALLBACK=https://yourserver.com/validation

# this callback will be used when you send the tx to the user (STK push)
LIPA_NA_MPESA_CALLBACK=http://yourserver.com/lipaCallback

MSISDN=2547xxxxxx2
```

# Code setup
The code is all in node js, and using babel and webpack to be compatible with most nodejs environments. It has been deployed to a cloud function on GCP with ease and hence the deploy command. 

# Get started
Start, run and debug
```
$ yarn # to get all the deps
$ yarn start # to start in dev mode to expose the endpoints
$ yarn test # to run the tests to setup safaricom daraja stuff
$ yarn deploy # to deploy compiled code to gcp to make the endpoints available for daraja
```

tests are present for the following 

```
  Setup
    Health
GET /health 200 2 - 2.761 ms
      ✓ Health should return 200
    Safaricom Setup
      ✓ It should get an access_token (113ms)
      ✓ Encode base64 using credentials
      ✓ Send request to register a url (910ms)
      ✓ Send request to process a transaction (409ms)


  5 passing (2s)
```