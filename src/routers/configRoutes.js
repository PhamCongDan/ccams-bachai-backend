const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unit')
const GradeController = require('../controllers/grade')

router.route(`/unit/:unit`)
  .get(UnitController.getUnit)

router.route(`/grade`)
  .get(GradeController.getClass)

module.exports = router