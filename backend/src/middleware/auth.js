const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing or invalid',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'supersecret_ai_helpdesk_jwt_token_key_2026';

    const decoded = jwt.verify(token, secret);

    const users = await query(
      'SELECT id, name, email, role, department, department_id, phone, status FROM users WHERE id = ?',
      [decoded.id]
    );

    if (users.length === 0 || users[0].status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account not found or deactivated',
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired, please log in again',
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
    });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${req.user.role}' lacks permission for this action`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  authorize,
};
