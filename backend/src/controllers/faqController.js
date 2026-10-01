const { query } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/response');

const getAllFAQs = async (req, res) => {
  try {
    const { category, search } = req.query;
    const conditions = [];
    const params = [];

    if (category && category !== 'all') {
      conditions.push('category = ?');
      params.push(category);
    }

    if (search && search.trim() !== '') {
      conditions.push('(question LIKE ? OR answer LIKE ? OR keywords LIKE ?)');
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `SELECT * FROM faq ${whereClause} ORDER BY category ASC, id ASC`;
    const faqs = await query(sql, params);

    // Fetch list of distinct categories for filters
    const categoriesResult = await query('SELECT DISTINCT category FROM faq ORDER BY category ASC');
    const categories = categoriesResult.map((c) => c.category);

    return successResponse(res, 'FAQs fetched successfully', {
      faqs,
      categories,
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    return errorResponse(res, 'Failed to retrieve FAQs', 500);
  }
};

const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, keywords } = req.body;

    if (!question || !answer) {
      return errorResponse(res, 'Question and answer are required', 400);
    }

    const result = await query(
      'INSERT INTO faq (question, answer, category, keywords) VALUES (?, ?, ?, ?)',
      [question.trim(), answer.trim(), category ? category.trim() : 'General', keywords || '']
    );

    const newFaq = {
      id: result.insertId,
      question: question.trim(),
      answer: answer.trim(),
      category: category ? category.trim() : 'General',
      keywords: keywords || '',
      created_at: new Date().toISOString(),
    };

    return successResponse(res, 'FAQ item created successfully', newFaq, 201);
  } catch (error) {
    console.error('Create FAQ error:', error);
    return errorResponse(res, 'Failed to create FAQ item', 500);
  }
};

const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const { question, answer, category, keywords } = req.body;

    const existing = await query('SELECT * FROM faq WHERE id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'FAQ item not found', 404);
    }

    const current = existing[0];

    await query(
      'UPDATE faq SET question = ?, answer = ?, category = ?, keywords = ? WHERE id = ?',
      [
        question ? question.trim() : current.question,
        answer ? answer.trim() : current.answer,
        category ? category.trim() : current.category,
        keywords !== undefined ? keywords : current.keywords,
        id,
      ]
    );

    return successResponse(res, 'FAQ item updated successfully');
  } catch (error) {
    console.error('Update FAQ error:', error);
    return errorResponse(res, 'Failed to update FAQ item', 500);
  }
};

const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM faq WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'FAQ item not found', 404);
    }
    return successResponse(res, 'FAQ item deleted successfully');
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return errorResponse(res, 'Failed to delete FAQ item', 500);
  }
};

module.exports = {
  getAllFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
};
