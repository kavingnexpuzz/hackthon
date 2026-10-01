const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getCollegeInfo = async (req, res) => {
  try {
    const info = await query('SELECT * FROM college_info ORDER BY category ASC, id ASC');
    return successResponse(res, 'College information retrieved', info);
  } catch (err) {
    console.error('Get college info error:', err);
    return errorResponse(res, 'Failed to retrieve college information', 500);
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await query(
      `SELECT c.*, d.department_name, d.code AS department_code 
       FROM courses c 
       LEFT JOIN departments d ON c.department_id = d.id 
       ORDER BY c.degree_type ASC, c.course_name ASC`
    );
    return successResponse(res, 'Courses retrieved', courses);
  } catch (err) {
    console.error('Get courses error:', err);
    return errorResponse(res, 'Failed to retrieve courses', 500);
  }
};

const getDepartments = async (req, res) => {
  try {
    const departments = await query(
      'SELECT id, department_name, code, email, phone, whatsapp_number, head_of_department, location FROM departments WHERE is_active = TRUE ORDER BY department_name ASC'
    );
    return successResponse(res, 'Departments retrieved', departments);
  } catch (err) {
    console.error('Get departments error:', err);
    return errorResponse(res, 'Failed to retrieve departments', 500);
  }
};

const getFaqs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== 'All') {
      conditions.push('category = ?');
      params.push(category);
    }
    if (search && search.trim() !== '') {
      conditions.push('(question LIKE ? OR answer LIKE ? OR keywords LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const faqs = await query(`SELECT * FROM faq ${where} ORDER BY category ASC, id ASC`, params);

    return successResponse(res, 'FAQs retrieved', faqs);
  } catch (err) {
    console.error('Get FAQs error:', err);
    return errorResponse(res, 'Failed to retrieve FAQs', 500);
  }
};

module.exports = {
  getCollegeInfo,
  getCourses,
  getDepartments,
  getFaqs,
};
