const { processPublicChatMessage } = require('../services/aiService');
const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const chat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim() === '') {
      return errorResponse(res, 'Message text is required', 400);
    }

    const aiResult = await processPublicChatMessage(message.trim(), sessionId || null);
    return successResponse(res, 'AI response generated', aiResult);
  } catch (error) {
    console.error('Public AI chat error:', error);
    return errorResponse(res, 'AI service is temporarily unavailable. Please try again.', 500);
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId) {
      return successResponse(res, 'Empty session history', []);
    }

    const history = await query(
      `SELECT id, sender, message, metadata, created_at 
       FROM chat_messages 
       WHERE session_id = ? 
       ORDER BY created_at ASC 
       LIMIT 50`,
      [sessionId]
    );

    const formatted = history.map((item) => {
      let parsed = null;
      if (item.metadata) {
        try {
          parsed = typeof item.metadata === 'string' ? JSON.parse(item.metadata) : item.metadata;
        } catch (e) {
          parsed = null;
        }
      }
      return {
        id: item.id,
        sender: item.sender,
        message: item.message,
        metadata: parsed,
        createdAt: item.created_at,
      };
    });

    return successResponse(res, 'Chat history retrieved', formatted);
  } catch (error) {
    console.error('Get chat history error:', error);
    return errorResponse(res, 'Failed to retrieve chat history', 500);
  }
};

const clearChatHistory = async (req, res) => {
  try {
    const { sessionId } = req.body;
    if (sessionId) {
      await query('DELETE FROM chat_messages WHERE session_id = ?', [sessionId]);
    }
    return successResponse(res, 'Chat history cleared successfully');
  } catch (error) {
    console.error('Clear chat error:', error);
    return errorResponse(res, 'Failed to clear chat', 500);
  }
};

module.exports = {
  chat,
  getChatHistory,
  clearChatHistory,
};
