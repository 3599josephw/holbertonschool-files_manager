const express = require('express')
const app = express()

let port;
if (process.env.PORT) {
  port = process.env.PORT;
} else {
  port = 5000;
}

app.listen(port);

module.exports = app;
