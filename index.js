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

var config = {
  server: process.env.SERVER_NAME, 
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER_NAME,
  password: process.env.DATABASE_PASSWORD,
  trustServerCertificate: true,
  options: {
    encrypt: true,
  }
};

// Configure the app port
const port = process.env.PORT || 9999;
app.set('port', port);

app.use(cors());
app.use(jsonParser);

// app.use((req, res, next) => {
//   return res.status(200).json({
//     test: 'hello world'
//   })
// })

app.listen(port, () => console.log(`App started on port ${port}.`))
app.use(router)

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL')
    return pool
  })
  .catch(err => console.log('Database Connection Failed! Bad Config: ', err))