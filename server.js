const express = require('express');
const routes = require('./routes/index');

const app = express();

let port;
if (process.env.PORT) {
  port = process.env.PORT;
} else {
  port = 5000;
}

app.use(express.json());
app.use(routes);
app.listen(port);
