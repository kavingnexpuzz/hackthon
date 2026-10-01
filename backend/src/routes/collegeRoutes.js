const express = require('express');
const {
  getCollegeInfo,
  getCourses,
  getDepartments,
  getFaqs,
} = require('../controllers/collegeController');

const router = express.Router();

router.get('/info', getCollegeInfo);
router.get('/courses', getCourses);
router.get('/departments', getDepartments);
router.get('/faqs', getFaqs);

module.exports = router;
