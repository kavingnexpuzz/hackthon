const express = require('express');
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  addRequestComment,
} = require('../controllers/requestController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.post('/', createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.put('/:id', authorize(['admin', 'staff']), updateRequest);
router.patch('/:id/status', authorize(['admin', 'staff']), updateRequestStatus);
router.post('/:id/comments', addRequestComment);

module.exports = router;
