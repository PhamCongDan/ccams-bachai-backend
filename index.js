var sql = require('mssql');
const express = require('express');
const cors = require('cors');
const path = require('path');
var bodyParser = require('body-parser')
require('dotenv').config({ path: path.resolve(__dirname, './.env') })

const jsonParser = bodyParser.json()

// Create an Express application
const app = express();
const router = require('./src/routers');

// Configure the app port
const port = process.env.PORT || 5000;
app.set('port', port);

app.use(cors());
app.use(jsonParser);

// app.use((req, res, next) => {
//   return res.status(200).json({
//     test: 'hello world'
//   })
// })

app.listen(port)
app.use(router)
