const { query } = require('../config/db');
const {
  analyzeComplaintWithGemini,
  registerCollegeComplaint,
} = require('../services/aiService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Pre-submission AI Analysis with Gemini
const analyzeComplaint = async (req, res) => {
  try {
    const { problem, location, priority, additionalDetails } = req.body;
    if (!problem) {
      return errorResponse(res, 'Problem description is required for AI analysis', 400);
    }

    const analysis = await analyzeComplaintWithGemini({
      problem: problem.trim(),
      location: location ? location.trim() : 'Campus',
      priority: priority || 'Medium',
      additionalDetails: additionalDetails ? additionalDetails.trim() : '',
    });

    return successResponse(res, 'Complaint analyzed successfully by Gemini', analysis);
  } catch (err) {
    console.error('Analyze complaint error:', err);
    return errorResponse(res, 'Failed to analyze complaint', 500);
  }
};

// 2. Register Complaint (Public, Student Identification with Roll Number)
const createComplaint = async (req, res) => {
  try {
    const {
      roll_number,
      student_name,
      student_department,
      student_email,
      student_phone,
      problem,
      location,
      priority,
      additional_details,
      ai_analysis,
    } = req.body;

    if (!roll_number || !student_name || !student_department || !problem || !location) {
      return errorResponse(
        res,
        'Roll number, student name, department, problem, and location are required fields',
        400
      );
    }

    const complaintData = await registerCollegeComplaint({
      rollNumber: roll_number.trim().toUpperCase(),
      studentName: student_name.trim(),
      studentDepartment: student_department.trim(),
      studentEmail: student_email ? student_email.trim() : null,
      studentPhone: student_phone ? student_phone.trim() : null,
      problem: problem.trim(),
      location: location.trim(),
      priority: priority || 'Medium',
      additionalDetails: additional_details ? additional_details.trim() : '',
      aiAnalysis: ai_analysis || null,
    });

    return successResponse(res, 'Complaint registered successfully', complaintData, 201);
  } catch (err) {
    console.error('Create complaint error:', err);
    return errorResponse(res, 'Failed to register complaint', 500);
  }
};

// 3. Track Complaint (Public with Roll Number + Ticket Number verification)
const trackComplaint = async (req, res) => {
  try {
    const { ticketNumber, rollNumber } = req.body;

    if (!ticketNumber || !rollNumber) {
      return errorResponse(res, 'Both Ticket Number and Roll Number are required to track status', 400);
    }

    const rows = await query(
      `SELECT c.*, d.department_name, d.email AS department_email, d.phone AS department_phone, 
              s.name AS staff_name, s.email AS staff_email 
       FROM complaints c 
       LEFT JOIN departments d ON c.responsible_department_id = d.id 
       LEFT JOIN users s ON c.assigned_staff_id = s.id 
       WHERE UPPER(c.ticket_number) = ? AND UPPER(c.roll_number) = ?`,
      [ticketNumber.trim().toUpperCase(), rollNumber.trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return errorResponse(
        res,
        'No complaint found matching the provided Ticket Number and Roll Number. Please check your credentials.',
        404
      );
    }

    const complaint = rows[0];

    // Fetch timeline history
    const history = await query(
      `SELECT id, old_status, new_status, changed_by, comment, created_at 
       FROM complaint_history 
       WHERE complaint_id = ? 
       ORDER BY created_at ASC`,
      [complaint.id]
    );

    return successResponse(res, 'Complaint tracked successfully', {
      complaint,
      history,
    });
  } catch (err) {
    console.error('Track complaint error:', err);
    return errorResponse(res, 'Failed to track complaint', 500);
  }
};

// 4. Get complaints by student Roll Number
const getComplaintsByRollNumber = async (req, res) => {
  try {
    const { rollNumber } = req.params;
    if (!rollNumber) {
      return errorResponse(res, 'Roll number is required', 400);
    }

    const complaints = await query(
      `SELECT c.*, d.department_name 
       FROM complaints c 
       LEFT JOIN departments d ON c.responsible_department_id = d.id 
       WHERE UPPER(c.roll_number) = ? 
       ORDER BY c.created_at DESC`,
      [rollNumber.trim().toUpperCase()]
    );

    return successResponse(res, 'Student complaints retrieved', complaints);
  } catch (err) {
    console.error('Get student complaints error:', err);
    return errorResponse(res, 'Failed to retrieve complaints', 500);
  }
};

// 5. Get Complaints (Admin & Department Staff view)
const getComplaints = async (req, res) => {
  try {
    const { status, departmentId, priority, search, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const conditions = [];
    const params = [];

    // Role-based visibility
    if (req.user && req.user.role === 'staff' && req.user.department_id) {
      conditions.push('c.responsible_department_id = ?');
      params.push(req.user.department_id);
    } else if (req.user && req.user.role !== 'admin' && req.user.role !== 'staff') {
      // Regular student or employee: show only complaints matching user_id or email
      conditions.push('(c.user_id = ? OR c.student_email = ?)');
      params.push(req.user.id, req.user.email);
    } else if (departmentId && departmentId !== 'All') {
      conditions.push('c.responsible_department_id = ?');
      params.push(departmentId);
    }

    if (status && status !== 'All') {
      conditions.push('c.status = ?');
      params.push(status);
    }

    if (priority && priority !== 'All') {
      conditions.push('c.priority = ?');
      params.push(priority);
    }

    if (search && search.trim() !== '') {
      conditions.push(
        '(c.ticket_number LIKE ? OR c.roll_number LIKE ? OR c.student_name LIKE ? OR c.problem LIKE ? OR c.location LIKE ?)'
      );
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s, s);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await query(`SELECT COUNT(*) AS total FROM complaints c ${where}`, params);
    const total = countRes[0]?.total || 0;

    const sql = `
      SELECT c.*, d.department_name, s.name AS staff_name 
      FROM complaints c 
      LEFT JOIN departments d ON c.responsible_department_id = d.id 
      LEFT JOIN users s ON c.assigned_staff_id = s.id 
      ${where} 
      ORDER BY c.created_at DESC 
      LIMIT ? OFFSET ?
    `;

    const complaints = await query(sql, [...params, parseInt(limit, 10), offset]);

    return successResponse(res, 'Complaints retrieved successfully', {
      complaints,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    });
  } catch (err) {
    console.error('Get complaints error:', err);
    return errorResponse(res, 'Failed to retrieve complaints', 500);
  }
};

// 6. Get Single Complaint Details
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;

    const rows = await query(
      `SELECT c.*, d.department_name, d.email AS department_email, d.phone AS department_phone, 
              s.name AS staff_name, s.email AS staff_email 
       FROM complaints c 
       LEFT JOIN departments d ON c.responsible_department_id = d.id 
       LEFT JOIN users s ON c.assigned_staff_id = s.id 
       WHERE c.id = ? OR c.ticket_number = ?`,
      [id, id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Complaint not found', 404);
    }

    const complaint = rows[0];

    // Fetch timeline history
    const history = await query(
      `SELECT id, old_status, new_status, changed_by, comment, created_at 
       FROM complaint_history 
       WHERE complaint_id = ? 
       ORDER BY created_at ASC`,
      [complaint.id]
    );

    return successResponse(res, 'Complaint details retrieved', {
      complaint,
      history,
    });
  } catch (err) {
    console.error('Get complaint details error:', err);
    return errorResponse(res, 'Failed to retrieve complaint details', 500);
  }
};

// 7. Update Complaint Status & Add to Timeline History
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, resolution_notes, comment } = req.body;

    const validStatuses = ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    const existing = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Complaint not found', 404);
    }

    const current = existing[0];
    const oldStatus = current.status;

    let resolvedAt = current.resolved_at;
    if (status === 'Resolved' || status === 'Closed') {
      resolvedAt = new Date();
    } else if (status === 'Open' || status === 'In Progress') {
      resolvedAt = null;
    }

    // Update status in complaints
    await query(
      `UPDATE complaints 
       SET status = ?, resolution_notes = COALESCE(?, resolution_notes), resolved_at = ? 
       WHERE id = ?`,
      [status, resolution_notes || null, resolvedAt, id]
    );

    // Insert record in complaint_history
    const changedByName = req.user ? req.user.name : 'Helpdesk Staff';
    const historyComment = comment || resolution_notes || `Status changed from ${oldStatus} to ${status}`;

    await query(
      `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, oldStatus, status, changedByName, historyComment]
    );

    return successResponse(res, `Complaint status updated to ${status}`);
  } catch (err) {
    console.error('Update status error:', err);
    return errorResponse(res, 'Failed to update complaint status', 500);
  }
};

// 8. Assign Complaint to Department and/or Staff
const assignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { department_id, assigned_staff_id, comment } = req.body;

    const existing = await query('SELECT * FROM complaints WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Complaint not found', 404);
    }

    const complaint = existing[0];
    const targetDeptId = department_id !== undefined ? department_id : complaint.responsible_department_id;
    const targetStaffId = assigned_staff_id !== undefined ? assigned_staff_id : complaint.assigned_staff_id;

    let newStatus = complaint.status;
    if (targetStaffId && complaint.status === 'Open') {
      newStatus = 'Assigned';
    }

    await query(
      `UPDATE complaints 
       SET responsible_department_id = ?, assigned_staff_id = ?, status = ? 
       WHERE id = ?`,
      [targetDeptId || null, targetStaffId || null, newStatus, id]
    );

    const changedByName = req.user ? req.user.name : 'Administrator';
    const note = comment || `Ticket assigned to department and/or technician.`;

    await query(
      `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, comment) 
       VALUES (?, ?, ?, ?, ?)`,
      [id, complaint.status, newStatus, changedByName, note]
    );

    return successResponse(res, 'Complaint assignment updated successfully');
  } catch (err) {
    console.error('Assign complaint error:', err);
    return errorResponse(res, 'Failed to update complaint assignment', 500);
  }
};

module.exports = {
  analyzeComplaint,
  createComplaint,
  trackComplaint,
  getComplaintsByRollNumber,
  getComplaints,
  getComplaintById,
  updateComplaintStatus,
  assignComplaint,
};
