const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unit')

router.route(`/:grade`)
  .get(UnitController.getGrade)

  module.exports = router