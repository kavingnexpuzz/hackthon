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
      department_id: user.department_id,
      name: user.name,
    },
    secret,
    { expiresIn }
  );
};

const departmentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return errorResponse(res, 'Email and password are required', 400);
    }

    const rows = await query(
      `SELECT u.*, d.department_name, d.code AS department_code 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.email = ?`,
      [email.trim().toLowerCase()]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const user = rows[0];
    if (user.role !== 'staff' && user.role !== 'admin') {
      return errorResponse(res, 'Access denied: Only department staff and administrators can access this portal', 403);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user);

    return successResponse(res, 'Department staff login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        department_id: user.department_id,
        department_name: user.department_name,
        department_code: user.department_code,
      },
      token,
    });
  } catch (err) {
    console.error('Department login error:', err);
    return errorResponse(res, 'Login failed', 500);
  }
};

const getDepartmentDashboard = async (req, res) => {
  try {
    const deptId = req.user.department_id;
    if (!deptId && req.user.role !== 'admin') {
      return errorResponse(res, 'No department assigned to this user', 400);
    }

    const deptFilter = deptId ? 'WHERE responsible_department_id = ?' : '';
    const params = deptId ? [deptId] : [];

    const stats = await query(
      `SELECT 
        COUNT(*) AS total_complaints,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_complaints,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) AS assigned_complaints,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_complaints,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_complaints,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed_complaints,
        SUM(CASE WHEN priority = 'Critical' AND status NOT IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS critical_complaints
       FROM complaints ${deptFilter}`,
      params
    );

    const recentComplaints = await query(
      `SELECT c.*, s.name AS staff_name 
       FROM complaints c 
       LEFT JOIN users s ON c.assigned_staff_id = s.id 
       ${deptFilter} 
       ORDER BY c.created_at DESC 
       LIMIT 10`,
      params
    );

    // Fetch department details
    let department = null;
    if (deptId) {
      const d = await query('SELECT * FROM departments WHERE id = ?', [deptId]);
      department = d[0] || null;
    }

    return successResponse(res, 'Department dashboard data retrieved', {
      department,
      stats: stats[0],
      recentComplaints,
    });
  } catch (err) {
    console.error('Department dashboard error:', err);
    return errorResponse(res, 'Failed to retrieve department metrics', 500);
  }
};

module.exports = {
  departmentLogin,
  getDepartmentDashboard,
};
