const { query } = require('../config/db');

async function createNotification({ userId, title, message, type = 'system', referenceId = null }) {
  try {
    const result = await query(
      `INSERT INTO notifications (user_id, title, message, type, reference_id, is_read) 
       VALUES (?, ?, ?, ?, ?, FALSE)`,
      [userId, title, message, type, referenceId]
    );
    return result.insertId;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
}

async function getUserNotifications(userId, limit = 20) {
  const notifications = await query(
    `SELECT id, user_id, title, message, type, reference_id, is_read, created_at 
     FROM notifications 
     WHERE user_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [userId, limit]
  );

  const unreadCountResult = await query(
    `SELECT COUNT(*) AS unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
    [userId]
  );

  return {
    notifications,
    unreadCount: unreadCountResult[0]?.unread_count || 0,
  };
}

async function markAsRead(notificationId, userId) {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
    [notificationId, userId]
  );
}

async function markAllAsRead(userId) {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`,
    [userId]
  );
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
