const express = require('express');
const {
  getNotifications,
  markOneAsRead,
  markAllRead,
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markOneAsRead);
router.patch('/read-all', markAllRead);

module.exports = router;
