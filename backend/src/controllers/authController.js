const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'supersecret_ai_helpdesk_jwt_token_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    secret,
    { expiresIn }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, phone, password, department, role } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Name, email, and password are required', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters long', 400);
    }

    // Security check: Normal users cannot register as admin
    let assignedRole = (role || 'student').toLowerCase();
    if (assignedRole === 'admin') {
      return errorResponse(res, 'Administrator accounts cannot be registered publicly', 403);
    }
    if (!['student', 'employee', 'staff'].includes(assignedRole)) {
      assignedRole = 'student';
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this email already exists', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await query(
      `INSERT INTO users (name, email, phone, password, department, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        hashedPassword,
        department ? department.trim() : 'General',
        assignedRole,
      ]
    );

    const newUser = {
      id: result.insertId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      department: department || 'General',
      role: assignedRole,
    };

    const token = generateToken(newUser);

    return successResponse(
      res,
      'Registration successful',
      {
        user: newUser,
        token,
      },
      201
    );
  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed. Please try again.', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const user = users[0];

    if (user.status !== 'active') {
      return errorResponse(res, 'Your account has been deactivated. Please contact administrator.', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const userProfile = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      department: user.department,
      role: user.role,
      status: user.status,
    };

    const token = generateToken(userProfile);

    return successResponse(res, 'Login successful', {
      user: userProfile,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed. Please try again.', 500);
  }
};

const getMe = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch complaint metrics for this user
    const complaintStats = await query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_count,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_count,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_count
       FROM complaints WHERE user_id = ?`,
      [userId]
    );

    // Fetch request metrics
    const requestStats = await query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed_count
       FROM requests WHERE user_id = ?`,
      [userId]
    );

    // Fetch unread notifications count
    const unreadNotif = await query(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND is_read = FALSE`,
      [userId]
    );

    return successResponse(res, 'User profile fetched successfully', {
      user: req.user,
      stats: {
        complaints: complaintStats[0] || { total: 0, open_count: 0, in_progress_count: 0, resolved_count: 0 },
        requests: requestStats[0] || { total: 0, pending_count: 0, completed_count: 0 },
        unreadNotifications: unreadNotif[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    return errorResponse(res, 'Failed to retrieve profile', 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
};
