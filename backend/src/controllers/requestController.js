const { query } = require('../config/db');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');

// 1. Create Request
const createRequest = async (req, res) => {
  try {
    const { request_type, subject, description, priority } = req.body;
    const userId = req.user.id;

    if (!description) {
      return errorResponse(res, 'Request description is required', 400);
    }

    const requestNumber = await generateTicketNumber('REQ');
    const validPriority = priority || 'Medium';
    const validSubject = subject || `Request for ${request_type || 'Service'}`;
    const validType = request_type || 'Other';

    const result = await query(
      `INSERT INTO requests 
       (request_number, user_id, request_type, subject, description, priority, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
      [requestNumber, userId, validType, validSubject, description, validPriority]
    );

    // Notify user
    await createNotification({
      userId,
      title: 'Request Submitted',
      message: `Your service request ${requestNumber} for ${validType} has been submitted successfully.`,
      type: 'request',
      referenceId: requestNumber,
    });

    const newRequest = {
      id: result.insertId,
      request_number: requestNumber,
      user_id: userId,
      request_type: validType,
      subject: validSubject,
      description,
      priority: validPriority,
      status: 'Pending',
      created_at: new Date().toISOString(),
    };

    return successResponse(res, 'Service request submitted successfully', newRequest, 201);
  } catch (error) {
    console.error('Create request error:', error);
    return errorResponse(res, 'Failed to create service request', 500);
  }
};

// 2. Get Requests (with RBAC, Filter & Search)
const getRequests = async (req, res) => {
  try {
    const { status, type, priority, search, page = 1, limit = 10, assignedTo } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const params = [];
    const conditions = [];

    // RBAC
    if (req.user.role === 'student' || req.user.role === 'employee') {
      conditions.push('r.user_id = ?');
      params.push(req.user.id);
    } else if (req.user.role === 'staff') {
      if (assignedTo === 'me' || (!assignedTo && !req.query.all)) {
        conditions.push('r.assigned_to = ?');
        params.push(req.user.id);
      }
    }

    if (status && status !== 'all') {
      conditions.push('r.status = ?');
      params.push(status);
    }

    if (type && type !== 'all') {
      conditions.push('r.request_type = ?');
      params.push(type);
    }

    if (priority && priority !== 'all') {
      conditions.push('r.priority = ?');
      params.push(priority);
    }

    if (search && search.trim() !== '') {
      conditions.push('(r.request_number LIKE ? OR r.subject LIKE ? OR r.description LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT COUNT(*) AS total FROM requests r ${whereClause}`;
    const totalResult = await query(countSql, params);
    const total = totalResult[0]?.total || 0;

    const sql = `
      SELECT 
        r.id, r.request_number, r.user_id, r.request_type, r.subject, r.description,
        r.priority, r.status, r.assigned_to, r.admin_notes, r.completed_at,
        r.created_at, r.updated_at,
        u.name AS user_name, u.email AS user_email, u.department AS user_department,
        s.name AS staff_name, s.email AS staff_email
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN users s ON r.assigned_to = s.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const dataParams = [...params, parseInt(limit, 10), offset];
    const requests = await query(sql, dataParams);

    return successResponse(res, 'Requests retrieved successfully', {
      requests,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10)) || 1,
      },
    });
  } catch (error) {
    console.error('Get requests error:', error);
    return errorResponse(res, 'Failed to retrieve requests', 500);
  }
};

// 3. Get Single Request Details
const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        r.*, 
        u.name AS user_name, u.email AS user_email, u.department AS user_department, u.phone AS user_phone,
        s.name AS staff_name, s.email AS staff_email, s.phone AS staff_phone
      FROM requests r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN users s ON r.assigned_to = s.id
      WHERE r.id = ? OR r.request_number = ?
    `;

    const rows = await query(sql, [id, id]);
    if (rows.length === 0) {
      return errorResponse(res, 'Request not found', 404);
    }

    const request = rows[0];

    // Check RBAC
    if (req.user.role === 'student' || req.user.role === 'employee') {
      if (request.user_id !== req.user.id) {
        return errorResponse(res, 'Unauthorized to view this service request', 403);
      }
    }

    // Fetch comments
    const comments = await query(
      `SELECT tc.id, tc.comment, tc.is_internal, tc.created_at, u.name AS user_name, u.role AS user_role 
       FROM ticket_comments tc 
       JOIN users u ON tc.user_id = u.id 
       WHERE tc.ticket_type = 'request' AND tc.ticket_id = ? 
       ORDER BY tc.created_at ASC`,
      [request.id]
    );

    return successResponse(res, 'Service request details retrieved', {
      request,
      comments,
    });
  } catch (error) {
    console.error('Get request by ID error:', error);
    return errorResponse(res, 'Failed to retrieve request details', 500);
  }
};

// 4. Update Request (Admin / Staff)
const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { request_type, subject, description, priority, assigned_to } = req.body;

    const existing = await query('SELECT * FROM requests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Request not found', 404);
    }

    const request = existing[0];

    if (req.user.role !== 'admin' && req.user.id !== request.assigned_to) {
      return errorResponse(res, 'Forbidden: Insufficient privileges', 403);
    }

    let assignedStaff = request.assigned_to;
    if (req.user.role === 'admin' && assigned_to !== undefined) {
      assignedStaff = assigned_to ? parseInt(assigned_to, 10) : null;
      if (assignedStaff && assignedStaff !== request.assigned_to) {
        const staffUser = await query('SELECT name FROM users WHERE id = ?', [assignedStaff]);
        const staffName = staffUser[0]?.name || 'a staff officer';

        await createNotification({
          userId: assignedStaff,
          title: 'Service Request Assigned',
          message: `Request ${request.request_number} (${request.request_type}) has been assigned to you.`,
          type: 'request',
          referenceId: request.request_number,
        });

        await createNotification({
          userId: request.user_id,
          title: 'Request Assigned',
          message: `Your request ${request.request_number} is now being processed by ${staffName}.`,
          type: 'request',
          referenceId: request.request_number,
        });
      }
    }

    await query(
      `UPDATE requests 
       SET request_type = ?, subject = ?, description = ?, priority = ?, assigned_to = ? 
       WHERE id = ?`,
      [
        request_type || request.request_type,
        subject || request.subject,
        description || request.description,
        priority || request.priority,
        assignedStaff,
        id,
      ]
    );

    return successResponse(res, 'Service request updated successfully');
  } catch (error) {
    console.error('Update request error:', error);
    return errorResponse(res, 'Failed to update request', 500);
  }
};

// 5. Update Request Status (Admin / Staff)
const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_notes, assigned_to } = req.body;

    const validStatuses = ['Pending', 'In Progress', 'Completed', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, `Invalid status. Valid values: ${validStatuses.join(', ')}`, 400);
    }

    const existing = await query('SELECT * FROM requests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Request not found', 404);
    }

    const request = existing[0];

    if (req.user.role === 'staff' && request.assigned_to !== req.user.id) {
      return errorResponse(res, 'Forbidden: You can only update requests assigned to you', 403);
    }

    let completedAt = request.completed_at;
    if (status === 'Completed') {
      completedAt = new Date();
    } else if (status === 'Pending' || status === 'In Progress') {
      completedAt = null;
    }

    let targetAssignedTo = request.assigned_to;
    if (req.user.role === 'admin' && assigned_to !== undefined) {
      targetAssignedTo = assigned_to ? parseInt(assigned_to, 10) : null;
    }

    await query(
      `UPDATE requests 
       SET status = ?, admin_notes = COALESCE(?, admin_notes), completed_at = ?, assigned_to = ? 
       WHERE id = ?`,
      [status, admin_notes || null, completedAt, targetAssignedTo, id]
    );

    // Notify ticket owner
    await createNotification({
      userId: request.user_id,
      title: `Service Request: ${status}`,
      message: `Your request ${request.request_number} (${request.request_type}) is now "${status}".${
        admin_notes ? ' Remarks: ' + admin_notes : ''
      }`,
      type: 'request',
      referenceId: request.request_number,
    });

    return successResponse(res, `Request status updated to ${status}`);
  } catch (error) {
    console.error('Update request status error:', error);
    return errorResponse(res, 'Failed to update request status', 500);
  }
};

// 6. Add Comment
const addRequestComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, is_internal = false } = req.body;
    const userId = req.user.id;

    if (!comment || comment.trim() === '') {
      return errorResponse(res, 'Comment text is required', 400);
    }

    const existing = await query('SELECT * FROM requests WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Request not found', 404);
    }

    const request = existing[0];

    if (
      req.user.role !== 'admin' &&
      request.user_id !== userId &&
      request.assigned_to !== userId
    ) {
      return errorResponse(res, 'Forbidden: You cannot comment on this request', 403);
    }

    const result = await query(
      `INSERT INTO ticket_comments (ticket_type, ticket_id, user_id, comment, is_internal) 
       VALUES ('request', ?, ?, ?, ?)`,
      [request.id, userId, comment.trim(), Boolean(is_internal)]
    );

    return successResponse(
      res,
      'Comment added',
      {
        id: result.insertId,
        comment: comment.trim(),
        user_name: req.user.name,
        user_role: req.user.role,
        created_at: new Date().toISOString(),
      },
      201
    );
  } catch (error) {
    console.error('Add request comment error:', error);
    return errorResponse(res, 'Failed to add comment', 500);
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  updateRequestStatus,
  addRequestComment,
};
