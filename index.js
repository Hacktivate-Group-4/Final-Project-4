const express = require('express');
const app = express();
const router = require('./routers');

require('dotenv').config();

const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

module.exports = app;
