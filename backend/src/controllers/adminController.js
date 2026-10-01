const bcrypt = require('bcryptjs');
const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const complaintStats = await query(`
      SELECT 
        COUNT(*) AS total_complaints,
        SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_complaints,
        SUM(CASE WHEN status = 'Assigned' THEN 1 ELSE 0 END) AS assigned_complaints,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress_complaints,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) AS resolved_complaints,
        SUM(CASE WHEN status = 'Closed' THEN 1 ELSE 0 END) AS closed_complaints,
        SUM(CASE WHEN priority = 'Critical' AND status NOT IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS critical_complaints
      FROM complaints
    `);

    // Distribution by Department
    const byDepartment = await query(`
      SELECT COALESCE(d.department_name, 'Unassigned') AS department_name, COUNT(c.id) AS count 
      FROM complaints c 
      LEFT JOIN departments d ON c.responsible_department_id = d.id 
      GROUP BY d.department_name 
      ORDER BY count DESC
    `);

    // Distribution by Category
    const byCategory = await query(`
      SELECT category, COUNT(*) AS count 
      FROM complaints 
      GROUP BY category 
      ORDER BY count DESC
    `);

    // Distribution by Priority
    const byPriority = await query(`
      SELECT priority, COUNT(*) AS count 
      FROM complaints 
      GROUP BY priority
    `);

    // Recent complaints (10)
    const recentComplaints = await query(`
      SELECT c.*, d.department_name, s.name AS staff_name 
      FROM complaints c 
      LEFT JOIN departments d ON c.responsible_department_id = d.id 
      LEFT JOIN users s ON c.assigned_staff_id = s.id 
      ORDER BY c.created_at DESC 
      LIMIT 10
    `);

    return successResponse(res, 'Admin stats retrieved', {
      complaints: complaintStats[0],
      byDepartment,
      byCategory,
      byPriority,
      recentComplaints,
    });
  } catch (err) {
    console.error('Admin dashboard stats error:', err);
    return errorResponse(res, 'Failed to retrieve admin stats', 500);
  }
};

// 2. Department Management (CRUD)
const getDepartments = async (req, res) => {
  try {
    const depts = await query(`
      SELECT 
        d.*, 
        COUNT(u.id) AS member_count 
      FROM departments d 
      LEFT JOIN users u ON u.department_id = d.id 
      GROUP BY d.id 
      ORDER BY d.department_name ASC
    `);
    return successResponse(res, 'Departments retrieved', depts);
  } catch (err) {
    console.error('Get departments error:', err);
    return errorResponse(res, 'Failed to retrieve departments', 500);
  }
};

const createDepartment = async (req, res) => {
  try {
    const {
      department_name,
      code,
      description,
      email,
      phone,
      whatsapp_number,
      head_of_department,
      location,
      programs_offered,
      faculty_count,
      student_count,
      is_active,
    } = req.body;
    if (!department_name || !code || !email) {
      return errorResponse(res, 'Department name, code, and email are required', 400);
    }

    const result = await query(
      `INSERT INTO departments (department_name, code, description, email, phone, whatsapp_number, head_of_department, location, programs_offered, faculty_count, student_count, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        department_name.trim(),
        code.trim().toUpperCase(),
        description ? description.trim() : null,
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        whatsapp_number ? whatsapp_number.trim() : null,
        head_of_department ? head_of_department.trim() : null,
        location ? location.trim() : 'Main Campus',
        programs_offered ? programs_offered.trim() : null,
        faculty_count !== undefined ? parseInt(faculty_count, 10) : 12,
        student_count !== undefined ? parseInt(student_count, 10) : 250,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    );

    return successResponse(res, 'Department created successfully', { id: result.insertId }, 201);
  } catch (err) {
    console.error('Create department error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      return errorResponse(res, 'A department with this name or code already exists', 409);
    }
    return errorResponse(res, 'Failed to create department', 500);
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      department_name,
      code,
      description,
      email,
      phone,
      whatsapp_number,
      head_of_department,
      location,
      programs_offered,
      faculty_count,
      student_count,
      is_active,
    } = req.body;

    await query(
      `UPDATE departments 
       SET department_name = COALESCE(?, department_name), 
           code = COALESCE(?, code), 
           description = COALESCE(?, description), 
           email = COALESCE(?, email), 
           phone = COALESCE(?, phone), 
           whatsapp_number = COALESCE(?, whatsapp_number), 
           head_of_department = COALESCE(?, head_of_department), 
           location = COALESCE(?, location), 
           programs_offered = COALESCE(?, programs_offered), 
           faculty_count = COALESCE(?, faculty_count), 
           student_count = COALESCE(?, student_count), 
           is_active = COALESCE(?, is_active) 
       WHERE id = ?`,
      [
        department_name ? department_name.trim() : null,
        code ? code.trim().toUpperCase() : null,
        description !== undefined ? description : null,
        email ? email.trim().toLowerCase() : null,
        phone !== undefined ? phone : null,
        whatsapp_number !== undefined ? whatsapp_number : null,
        head_of_department !== undefined ? head_of_department : null,
        location !== undefined ? location : null,
        programs_offered !== undefined ? programs_offered : null,
        faculty_count !== undefined ? parseInt(faculty_count, 10) : null,
        student_count !== undefined ? parseInt(student_count, 10) : null,
        is_active !== undefined ? (is_active ? 1 : 0) : null,
        id,
      ]
    );

    return successResponse(res, 'Department updated successfully');
  } catch (err) {
    console.error('Update department error:', err);
    return errorResponse(res, 'Failed to update department', 500);
  }
};

const toggleDepartmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE departments SET is_active = NOT is_active WHERE id = ?', [id]);
    const updated = await query('SELECT id, department_name, is_active FROM departments WHERE id = ?', [id]);
    return successResponse(res, 'Department status updated', updated[0]);
  } catch (err) {
    console.error('Toggle department status error:', err);
    return errorResponse(res, 'Failed to toggle department status', 500);
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    // Safe deletion: reset assigned members' department_id to NULL to preserve users
    await query('UPDATE users SET department_id = NULL WHERE department_id = ?', [id]);
    // Also reset complaints responsible department if needed
    await query('UPDATE complaints SET responsible_department_id = NULL WHERE responsible_department_id = ?', [id]);
    // Delete the department
    await query('DELETE FROM departments WHERE id = ?', [id]);

    return successResponse(res, 'Department safely deleted and references detached');
  } catch (err) {
    console.error('Delete department error:', err);
    return errorResponse(res, 'Failed to delete department', 500);
  }
};

// 3. User Management (CRUD)
const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let sql = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.phone, 
        u.role, 
        u.status, 
        u.department_id,
        u.created_at,
        COALESCE(d.department_name, u.department, 'General') AS department_name,
        d.code AS department_code
      FROM users u
      LEFT JOIN departments d ON u.department_id = d.id
    `;
    const params = [];

    if (search && search.trim() !== '') {
      const q = `%${search.trim()}%`;
      sql += ` WHERE (u.name LIKE ? OR u.email LIKE ? OR COALESCE(d.department_name, u.department) LIKE ?)`;
      params.push(q, q, q);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const users = await query(sql, params);
    return successResponse(res, 'Users retrieved successfully', { users });
  } catch (err) {
    console.error('Get users error:', err);
    return errorResponse(res, 'Failed to retrieve users', 500);
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, status, department_id } = req.body;

    if (!name || !email) {
      return errorResponse(res, 'Full Name and Email are required', 400);
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return errorResponse(res, 'An account with this email address already exists', 409);
    }

    let deptName = 'General';
    let validDeptId = department_id ? parseInt(department_id, 10) : null;

    if (validDeptId) {
      const d = await query('SELECT department_name FROM departments WHERE id = ?', [validDeptId]);
      if (d.length > 0) {
        deptName = d[0].department_name;
      } else {
        validDeptId = null;
      }
    }

    const plainPassword = password && password.trim() ? password.trim() : 'Password@123';
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, department, department_id, role, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        hashedPassword,
        deptName,
        validDeptId,
        role || 'student',
        status || 'active',
      ]
    );

    return successResponse(res, 'Member created successfully', { id: result.insertId }, 201);
  } catch (err) {
    console.error('Create user error:', err);
    return errorResponse(res, 'Failed to create member', 500);
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, status, department_id } = req.body;

    let deptName = null;
    let validDeptId = department_id !== undefined ? (department_id ? parseInt(department_id, 10) : null) : undefined;

    if (validDeptId) {
      const d = await query('SELECT department_name FROM departments WHERE id = ?', [validDeptId]);
      if (d.length > 0) {
        deptName = d[0].department_name;
      }
    }

    await query(
      `UPDATE users 
       SET name = COALESCE(?, name), 
           email = COALESCE(?, email), 
           role = COALESCE(?, role), 
           status = COALESCE(?, status), 
           department_id = COALESCE(?, department_id),
           department = COALESCE(?, department)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        email ? email.trim().toLowerCase() : null,
        role || null,
        status || null,
        validDeptId,
        deptName,
        id,
      ]
    );

    return successResponse(res, 'Member updated successfully');
  } catch (err) {
    console.error('Update user error:', err);
    return errorResponse(res, 'Failed to update member', 500);
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await query('SELECT id, status, role FROM users WHERE id = ?', [id]);
    if (target.length === 0) {
      return errorResponse(res, 'User not found', 404);
    }

    const newStatus = target[0].status === 'active' ? 'inactive' : 'active';
    await query('UPDATE users SET status = ? WHERE id = ?', [newStatus, id]);

    return successResponse(res, `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`, {
      id,
      status: newStatus,
    });
  } catch (err) {
    console.error('Toggle user status error:', err);
    return errorResponse(res, 'Failed to update status', 500);
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user && req.user.id === parseInt(id, 10)) {
      return errorResponse(res, 'Security restriction: You cannot delete your own active administrator account', 403);
    }

    // Safely delete notifications or nullify complaints assigned to this user
    await query('UPDATE complaints SET assigned_staff_id = NULL WHERE assigned_staff_id = ?', [id]);
    await query('DELETE FROM notifications WHERE user_id = ?', [id]);
    await query('DELETE FROM users WHERE id = ?', [id]);

    return successResponse(res, 'Member deleted successfully');
  } catch (err) {
    console.error('Delete user error:', err);
    return errorResponse(res, 'Failed to delete member', 500);
  }
};

// 3. College Info Knowledge Base Management (CRUD)
const createCollegeInfo = async (req, res) => {
  try {
    const { info_key, title, category, content } = req.body;
    if (!info_key || !title || !content) {
      return errorResponse(res, 'Key, title, and content are required', 400);
    }
    const result = await query(
      'INSERT INTO college_info (info_key, title, category, content) VALUES (?, ?, ?, ?)',
      [info_key.trim(), title.trim(), category || 'General', content.trim()]
    );
    return successResponse(res, 'College info added', { id: result.insertId }, 201);
  } catch (err) {
    console.error('Add info error:', err);
    return errorResponse(res, 'Failed to create college info', 500);
  }
};

const updateCollegeInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, content } = req.body;
    await query(
      'UPDATE college_info SET title = COALESCE(?, title), category = COALESCE(?, category), content = COALESCE(?, content) WHERE id = ?',
      [title, category, content, id]
    );
    return successResponse(res, 'College info updated');
  } catch (err) {
    console.error('Update info error:', err);
    return errorResponse(res, 'Failed to update college info', 500);
  }
};

// 4. Course Management (CRUD)
const createCourse = async (req, res) => {
  try {
    const { course_name, code, department_id, degree_type, duration, eligibility, fees_per_year, description } = req.body;
    if (!course_name || !code) {
      return errorResponse(res, 'Course name and code are required', 400);
    }
    const result = await query(
      `INSERT INTO courses (course_name, code, department_id, degree_type, duration, eligibility, fees_per_year, description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [course_name, code, department_id || null, degree_type || 'Undergraduate', duration || '3 Years', eligibility || null, fees_per_year || null, description || null]
    );
    return successResponse(res, 'Course created', { id: result.insertId }, 201);
  } catch (err) {
    console.error('Create course error:', err);
    return errorResponse(res, 'Failed to create course', 500);
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { course_name, department_id, degree_type, duration, eligibility, fees_per_year, description } = req.body;
    await query(
      `UPDATE courses 
       SET course_name = COALESCE(?, course_name), 
           department_id = COALESCE(?, department_id), 
           degree_type = COALESCE(?, degree_type), 
           duration = COALESCE(?, duration), 
           eligibility = COALESCE(?, eligibility), 
           fees_per_year = COALESCE(?, fees_per_year), 
           description = COALESCE(?, description) 
       WHERE id = ?`,
      [course_name, department_id, degree_type, duration, eligibility, fees_per_year, description, id]
    );
    return successResponse(res, 'Course updated');
  } catch (err) {
    console.error('Update course error:', err);
    return errorResponse(res, 'Failed to update course', 500);
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM courses WHERE id = ?', [id]);
    return successResponse(res, 'Course deleted');
  } catch (err) {
    console.error('Delete course error:', err);
    return errorResponse(res, 'Failed to delete course', 500);
  }
};

// 5. Notifications
const getAdminNotifications = async (req, res) => {
  try {
    const notifs = await query('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50');
    return successResponse(res, 'Notifications retrieved', notifs);
  } catch (err) {
    console.error('Get notifs error:', err);
    return errorResponse(res, 'Failed to retrieve notifications', 500);
  }
};

// Staff list for assigning
const getStaffMembers = async (req, res) => {
  try {
    const staff = await query(
      `SELECT u.id, u.name, u.email, u.role, d.department_name 
       FROM users u 
       LEFT JOIN departments d ON u.department_id = d.id 
       WHERE u.role IN ('staff', 'admin') AND u.status = 'active' 
       ORDER BY u.name ASC`
    );
    return successResponse(res, 'Staff list retrieved', staff);
  } catch (err) {
    console.error('Get staff error:', err);
    return errorResponse(res, 'Failed to retrieve staff members', 500);
  }
};

module.exports = {
  getDashboardStats,
  getDepartments,
  createDepartment,
  updateDepartment,
  toggleDepartmentStatus,
  deleteDepartment,
  getUsers,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  createCollegeInfo,
  updateCollegeInfo,
  createCourse,
  updateCourse,
  deleteCourse,
  getAdminNotifications,
  getStaffMembers,
};
