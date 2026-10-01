const express = require('express');
const { chat, getChatHistory, clearChatHistory } = require('../controllers/aiController');

const router = express.Router();

// Public chat routes (No login required)
router.post('/chat', chat);
router.get('/history', getChatHistory);
router.post('/clear', clearChatHistory);

module.exports = router;
