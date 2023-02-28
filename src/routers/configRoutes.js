const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unit')
const GradeController = require('../controllers/grade')
const AttendanceController = require('../controllers/attendance')

router.route(`/unit/:unit`)
  .get(UnitController.getUnit)

router.route(`/grade`)
  .get(GradeController.getClass)

router.route(`/attendance`)
  .post(AttendanceController.getAttendanceData)

module.exports = router