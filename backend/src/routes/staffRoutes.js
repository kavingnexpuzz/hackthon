const express = require('express');
const { getStaffDashboard } = require('../controllers/staffController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize(['staff', 'admin']));

router.get('/dashboard', getStaffDashboard);

module.exports = router;
