const express = require('express');
const {
  departmentLogin,
  getDepartmentDashboard,
} = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public login for department staff
router.post('/login', departmentLogin);

// Protected department endpoints
router.get('/dashboard', authenticate, authorize(['staff', 'admin']), getDepartmentDashboard);

module.exports = router;
