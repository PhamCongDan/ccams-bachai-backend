const express = require('express');
// const unitRoute = require('./unit');
// const gradeRoute = require('./grade');
const configRoute = require('./configRoutes');

const router = express.Router();

router.use(`${process.env.PREFIX_API}`, configRoute);
// router.use(`${process.env.PREFIX_API}grade`, gradeRoute);

module.exports = router
