const { default: router } = require("../index");
var express = require("express");
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

export default app;
