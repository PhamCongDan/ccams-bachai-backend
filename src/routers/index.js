const express = require('express');
const unitRoute = require('./unit');

const router = express.Router();

router.use(`${process.env.PREFIX_API}unit`, unitRoute);

module.exports = router
