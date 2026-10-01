const express = require('express');
const { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } = require('../controllers/faqController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Public / Authenticated read
router.get('/', getAllFAQs);

// Admin-only management
router.post('/', authenticate, authorize('admin'), createFAQ);
router.put('/:id', authenticate, authorize('admin'), updateFAQ);
router.delete('/:id', authenticate, authorize('admin'), deleteFAQ);

module.exports = router;
