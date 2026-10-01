const express = require('express');
const {
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
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Staff list for assigning
router.get('/staff', getStaffMembers);

// User Management (CRUD)
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/status', toggleUserStatus);
router.delete('/users/:id', deleteUser);

// Department Management (CRUD)
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.put('/departments/:id', updateDepartment);
router.patch('/departments/:id/status', toggleDepartmentStatus);
router.delete('/departments/:id', deleteDepartment);

// College Info Knowledge Base CRUD
router.post('/college-info', createCollegeInfo);
router.put('/college-info/:id', updateCollegeInfo);

// Courses CRUD
router.post('/courses', createCourse);
router.put('/courses/:id', updateCourse);
router.delete('/courses/:id', deleteCourse);

// Notifications
router.get('/notifications', getAdminNotifications);

module.exports = router;
