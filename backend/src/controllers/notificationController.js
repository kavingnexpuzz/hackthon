const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');

const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;

    const data = await getUserNotifications(userId, limit);
    return successResponse(res, 'Notifications retrieved', data);
  } catch (error) {
    console.error('Get notifications error:', error);
    return errorResponse(res, 'Failed to retrieve notifications', 500);
  }
};

const markOneAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await markAsRead(id, userId);
    return successResponse(res, 'Notification marked as read');
  } catch (error) {
    console.error('Mark read error:', error);
    return errorResponse(res, 'Failed to update notification', 500);
  }
};

const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await markAllAsRead(userId);
    return successResponse(res, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all read error:', error);
    return errorResponse(res, 'Failed to update notifications', 500);
  }
};

module.exports = {
  getNotifications,
  markOneAsRead,
  markAllRead,
};
