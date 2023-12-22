const express = require('express');
const router = require('./routers');
const dotenv = require('dotenv');

const app = express();

dotenv.config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(router);

module.exports = app;
