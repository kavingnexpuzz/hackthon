const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getStaffDashboard = async (req, res) => {
  try {
    const staffId = req.user.id;

    // Complaints assigned to this staff member
    const complaintStats = await query(
      `SELECT 
        COUNT(*) AS total_assigned,
        SUM(CASE WHEN status IN ('Assigned', 'Open') THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status IN ('Resolved', 'Closed') THEN 1 ELSE 0 END) AS completed
       FROM complaints WHERE assigned_to = ?`,
      [staffId]
    );

    // Requests assigned to this staff member
    const requestStats = await query(
      `SELECT 
        COUNT(*) AS total_assigned,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed
       FROM requests WHERE assigned_to = ?`,
      [staffId]
    );

    // Active assigned complaints
    const assignedComplaints = await query(
      `SELECT c.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone 
       FROM complaints c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.assigned_to = ? AND c.status NOT IN ('Resolved', 'Closed') 
       ORDER BY c.created_at DESC 
       LIMIT 10`,
      [staffId]
    );

    // Active assigned requests
    const assignedRequests = await query(
      `SELECT r.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone 
       FROM requests r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.assigned_to = ? AND r.status NOT IN ('Completed', 'Rejected') 
       ORDER BY r.created_at DESC 
       LIMIT 10`,
      [staffId]
    );

    return successResponse(res, 'Staff dashboard data retrieved', {
      complaints: complaintStats[0],
      requests: requestStats[0],
      assignedComplaints,
      assignedRequests,
    });
  } catch (error) {
    console.error('Staff dashboard error:', error);
    return errorResponse(res, 'Failed to retrieve staff dashboard data', 500);
  }
};

module.exports = {
  getStaffDashboard,
};
