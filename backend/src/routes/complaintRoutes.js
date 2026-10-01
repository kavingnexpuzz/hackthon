const express = require('express');
const {
  analyzeComplaint,
  createComplaint,
  trackComplaint,
  getComplaintsByRollNumber,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
} = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes (No login required for students)
router.post('/analyze', analyzeComplaint);
router.post('/', createComplaint);
router.post('/track', trackComplaint);
router.get('/student/:rollNumber', getComplaintsByRollNumber);
router.get('/:id', getComplaintById);

// Protected routes (Admin, Department Staff, and Authenticated Users)
router.get('/', authenticate, getComplaints);
router.patch('/:id/status', authenticate, authorize(['admin', 'staff']), updateComplaintStatus);
router.patch('/:id/assign', authenticate, authorize('admin'), assignComplaint);

module.exports = router;
