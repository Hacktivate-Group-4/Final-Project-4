const express = require('express');
const router = require('./routers');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

const port = process.env.PORT;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

module.exports = app;
