const express = require('express');
const router = express.Router();
const UnitController = require('../controllers/unit')
const GradeController = require('../controllers/grade')
const AttendanceController = require('../controllers/attendance')
const SearchController = require('../controllers/search')

router.route(`/unit/:unit`)
  .get(UnitController.getUnit)

router.route(`/grade`)
  .get(GradeController.getClass)

router.route(`/attendance`)
  .post(AttendanceController.getAttendanceData)

router.route(`/attendance/search`)
  .post(SearchController.searchStudent)

module.exports = router