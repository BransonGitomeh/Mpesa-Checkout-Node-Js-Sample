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