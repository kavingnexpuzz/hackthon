const { GoogleGenerativeAI } = require('@google/generative-ai');
const { query } = require('../config/db');
const { generateTicketNumber } = require('../utils/ticketGenerator');
const { sendComplaintEmailNotification } = require('./emailService');
const { sendWhatsAppNotification } = require('./whatsAppService');

const SYSTEM_PROMPT = `You are the Official AI College Assistant for VET Institute of Arts and Science.
Your job is to answer student and visitor questions accurately using the college knowledge base, or detect when the user is reporting a problem/complaint.

INTENT CLASSIFICATIONS:
1. "CREATE_COMPLAINT": The user is describing a broken, malfunctioning, or faulty item or problem on campus (e.g. projector broken, fan not working, wifi down, water leak, dirty classroom, AC not cooling, ID card issue, transport issue).
   Extract:
   - "problem": Short clear description of the defect
   - "location": Exact room, block, lab, or area
   - "priority": Low, Medium, High, or Critical
   - "response": "It sounds like you are reporting a college-related problem. Would you like to register this as a complaint?"

2. "COURSE_INFORMATION": Asking about academic programs, degrees, B.Sc, BCA, B.Com, BBA, M.Sc, MCA, eligibility, duration, fees.
3. "TIMING_INFORMATION": Asking about college hours, office timings, library hours, working Saturdays.
4. "CONTACT_INFORMATION": Asking for examination cell, administration office, principal, helpline, or phone numbers.
5. "COMPLAINT_STATUS": Inquiring about an existing complaint or ticket number (e.g., CMP-2026-0001). Extract "ticket_number".
6. "DEPARTMENT_INFORMATION": Asking about departments, faculty heads, locations.
7. "GENERAL_COLLEGE_QUERY": Asking general questions about hostel, transport, placements, admissions, rules.
8. "UNKNOWN": Unrelated or gibberish.

CRITICAL RULES:
- Never invent facts, contact numbers, or ticket statuses.
- If user mentions a complaint, always set is_complaint = true and recommend registering a complaint.
- Output MUST be valid JSON only.

JSON Output Schema:
{
  "intent": "GENERAL_COLLEGE_QUERY" | "CREATE_COMPLAINT" | "COMPLAINT_STATUS" | "COURSE_INFORMATION" | "TIMING_INFORMATION" | "CONTACT_INFORMATION" | "DEPARTMENT_INFORMATION" | "UNKNOWN",
  "is_complaint": boolean,
  "problem": string | null,
  "location": string | null,
  "priority": "Low" | "Medium" | "High" | "Critical",
  "ticket_number": string | null,
  "search_query": string | null,
  "response": string
}
`;

/**
 * Intelligent fallback parser when Gemini API key is missing or offline
 */
function fallbackPublicIntentExtractor(message) {
  const msg = message.trim();
  const lower = msg.toLowerCase();

  // 1. Ticket status check
  const cmpMatch = msg.match(/CMP-\d{4}-\d{3,4}/i);
  if (cmpMatch || ((lower.includes('status') || lower.includes('track')) && (lower.includes('complaint') || lower.includes('ticket')))) {
    return {
      intent: 'COMPLAINT_STATUS',
      is_complaint: false,
      ticket_number: cmpMatch ? cmpMatch[0].toUpperCase() : null,
      search_query: cmpMatch ? cmpMatch[0].toUpperCase() : lower,
      response: cmpMatch
        ? `Checking live database status for ${cmpMatch[0].toUpperCase()}...`
        : 'To track your complaint status, please provide your Ticket Number (e.g., CMP-2026-0001) or Roll Number.',
    };
  }

  // 2. Complaint Detection Keywords
  const defectKeywords = [
    'not working',
    'broken',
    'faulty',
    'damaged',
    'leak',
    'leaking',
    'issue',
    'problem',
    'complaint',
    'repair',
    'flicker',
    'flickering',
    'noise',
    'stopped',
    'no power',
    'no signal',
    'slow wifi',
    'wifi down',
    'dirty',
    'garbage',
    'cleaning',
    'smell',
    'jammed',
    'water cooler',
  ];

  const hasDefect = defectKeywords.some((w) => lower.includes(w));
  if (hasDefect) {
    let location = 'Campus / Classroom';
    const locMatch = msg.match(/(?:in|at|room|block|hall|lab|floor)\s+([A-Za-z0-9\s\-]+?)(?=[.,;]|$)/i) ||
                     msg.match(/(?:CSE|ECE|MECH|CIVIL|IT|BCA)\s+(?:Block\s+)?(?:Room\s+)?[A-Za-z0-9\-]+/i) ||
                     msg.match(/Room\s+[A-Za-z0-9\-]+/i) ||
                     msg.match(/Lab\s+[A-Za-z0-9\-]+/i);

    if (locMatch) {
      location = locMatch[0].trim();
    }

    let priority = 'Medium';
    if (lower.includes('urgent') || lower.includes('emergency') || lower.includes('critical') || lower.includes('danger')) {
      priority = 'Critical';
    } else if (lower.includes('high') || lower.includes('exam') || lower.includes('lecture')) {
      priority = 'High';
    } else if (lower.includes('minor') || lower.includes('low')) {
      priority = 'Low';
    }

    return {
      intent: 'CREATE_COMPLAINT',
      is_complaint: true,
      problem: msg,
      location,
      priority,
      response: 'It sounds like you are reporting a college-related problem. Would you like to register this as a complaint?',
    };
  }

  // 3. Course Queries
  if (lower.includes('course') || lower.includes('program') || lower.includes('degree') || lower.includes('b.sc') || lower.includes('bca') || lower.includes('b.com') || lower.includes('bba') || lower.includes('mca') || lower.includes('m.sc')) {
    return {
      intent: 'COURSE_INFORMATION',
      is_complaint: false,
      search_query: msg,
      response: 'Searching academic courses...',
    };
  }

  // 4. Timings
  if (lower.includes('timing') || lower.includes('time') || lower.includes('hour') || lower.includes('open') || lower.includes('close') || lower.includes('schedule')) {
    return {
      intent: 'TIMING_INFORMATION',
      is_complaint: false,
      search_query: msg,
      response: 'Our regular college working hours are 9:00 AM to 4:00 PM from Monday to Friday.',
    };
  }

  // 5. Contacts
  if (lower.includes('contact') || lower.includes('phone') || lower.includes('email') || lower.includes('exam cell') || lower.includes('principal') || lower.includes('office')) {
    return {
      intent: 'CONTACT_INFORMATION',
      is_complaint: false,
      search_query: msg,
      response: 'Retrieving official contact information...',
    };
  }

  // Default to General Query
  return {
    intent: 'GENERAL_COLLEGE_QUERY',
    is_complaint: false,
    search_query: msg,
    response: 'Searching the college knowledge base...',
  };
}

/**
 * Calls Gemini for public message intent parsing
 */
async function analyzePublicMessageWithGemini(userMessage) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini')) {
    return fallbackPublicIntentExtractor(userMessage);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `User Message: "${userMessage}"` },
    ]);

    const parsed = JSON.parse(result.response.text());
    return parsed;
  } catch (err) {
    console.warn('[AI Service] Gemini call failed, using fallback:', err.message);
    return fallbackPublicIntentExtractor(userMessage);
  }
}

/**
 * Searches the College Knowledge Base (courses, college_info, faq)
 */
async function queryCollegeKnowledgeBase(queryText, intent) {
  const clean = queryText.toLowerCase().trim();

  // 1. If Course inquiry, query courses table
  if (intent === 'COURSE_INFORMATION' || clean.includes('course') || clean.includes('degree') || clean.includes('program')) {
    const courses = await query('SELECT course_name, code, degree_type, duration, eligibility, fees_per_year, description FROM courses');
    if (courses.length > 0) {
      const courseList = courses.map((c) => `• **${c.course_name}** (${c.degree_type}, ${c.duration}) - Eligibility: ${c.eligibility}`).join('\n');
      return `We currently offer the following programs:\n\n${courseList}\n\nWould you like more details on admission requirements, fees, or course curriculum?`;
    }
  }

  // 2. Query college_info table
  const infoMatches = await query(
    `SELECT title, content, category FROM college_info 
     WHERE content LIKE ? OR title LIKE ? OR category LIKE ? 
     LIMIT 2`,
    [`%${clean}%`, `%${clean}%`, `%${clean}%`]
  );

  if (infoMatches.length > 0) {
    return infoMatches[0].content;
  }

  // 3. Query FAQs table
  const terms = clean.split(' ').filter((w) => w.length > 2);
  if (terms.length > 0) {
    const conditions = terms.map(() => '(question LIKE ? OR keywords LIKE ? OR answer LIKE ?)').join(' OR ');
    const params = [];
    terms.forEach((t) => params.push(`%${t}%`, `%${t}%`, `%${t}%`));

    const faqs = await query(`SELECT question, answer FROM faq WHERE ${conditions} LIMIT 1`, params);
    if (faqs.length > 0) {
      return faqs[0].answer;
    }
  }

  // 4. Default answer
  return "I'm your AI College Assistant. You can ask about our available courses, admission guidelines, college timings (9:00 AM to 4:00 PM), library hours, examination cell contacts, or report any maintenance issue on campus.";
}

/**
 * Gemini Complaint Analyzer:
 * Determines category, recommends responsible department (validated against MySQL), priority, summary, suggested action.
 */
async function analyzeComplaintWithGemini({ problem, location, priority, additionalDetails }) {
  // Fetch available active departments from MySQL
  const depts = await query('SELECT id, department_name, code FROM departments WHERE is_active = TRUE');
  const validDeptNames = depts.map((d) => d.department_name);

  const fallbackAnalysis = () => {
    let category = 'Other';
    let targetDept = 'Administration';
    const lower = (problem + ' ' + (location || '')).toLowerCase();

    if (lower.includes('projector') || lower.includes('computer') || lower.includes('wifi') || lower.includes('internet') || lower.includes('pc') || lower.includes('lab') || lower.includes('software')) {
      category = 'IT Equipment';
      targetDept = 'IT Support';
    } else if (lower.includes('fan') || lower.includes('light') || lower.includes('ac') || lower.includes('switch') || lower.includes('power') || lower.includes('electricity')) {
      category = 'Electrical Maintenance';
      targetDept = 'Electrical Maintenance';
    } else if (lower.includes('water') || lower.includes('leak') || lower.includes('cooler') || lower.includes('tap') || lower.includes('pipe') || lower.includes('toilet') || lower.includes('washroom') || lower.includes('bench') || lower.includes('door') || lower.includes('window')) {
      category = 'Civil Maintenance';
      targetDept = 'Civil Maintenance';
    } else if (lower.includes('exam') || lower.includes('marksheet') || lower.includes('hall ticket')) {
      category = 'Academic / Exam';
      targetDept = 'Examination Cell';
    } else if (lower.includes('hostel') || lower.includes('mess') || lower.includes('room')) {
      category = 'Hostel';
      targetDept = 'Hostel';
    } else if (lower.includes('bus') || lower.includes('transport') || lower.includes('driver')) {
      category = 'Transport';
      targetDept = 'Transport';
    }

    // Match department from DB
    const matched = depts.find((d) => d.department_name.toLowerCase() === targetDept.toLowerCase()) || depts[0];

    return {
      category,
      department_id: matched.id,
      department_name: matched.department_name,
      priority: priority || 'Medium',
      summary: `${problem} at ${location}`,
      suggested_action: 'Technical inspection and rectification required by assigned personnel.',
    };
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('your_gemini')) {
    return fallbackAnalysis();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const prompt = `You are a College Facilities Expert. Analyze this student complaint and route it to the exact responsible department from this list:
${JSON.stringify(validDeptNames)}

Complaint Details:
- Problem: "${problem}"
- Location: "${location}"
- Stated Priority: "${priority}"
- Extra Info: "${additionalDetails || ''}"

Return JSON:
{
  "category": "IT Equipment" | "Network" | "Electrical Maintenance" | "Civil Maintenance" | "Sanitation" | "Academic" | "Hostel" | "Transport" | "Security" | "Other",
  "department": string (MUST EXACTLY MATCH ONE FROM THE LIST ABOVE),
  "priority": "Low" | "Medium" | "High" | "Critical",
  "summary": string,
  "suggested_action": string
}`;

    const res = await model.generateContent(prompt);
    const parsed = JSON.parse(res.response.text());

    // Strict validation: Validate department against MySQL
    const matchedDept = depts.find(
      (d) => d.department_name.toLowerCase() === (parsed.department || '').toLowerCase()
    );

    const safeDept = matchedDept || depts.find((d) => d.department_name === 'IT Support') || depts[0];

    return {
      category: parsed.category || 'Other',
      department_id: safeDept.id,
      department_name: safeDept.department_name,
      priority: parsed.priority || priority || 'Medium',
      summary: parsed.summary || `${problem} at ${location}`,
      suggested_action: parsed.suggested_action || 'Inspect and take corrective measures.',
    };
  } catch (err) {
    console.warn('[Gemini Complaint Analysis Fallback]:', err.message);
    return fallbackAnalysis();
  }
}

/**
 * Creates Complaint in MySQL + Sends Email & WhatsApp + Writes History
 */
async function registerCollegeComplaint({
  rollNumber,
  studentName,
  studentDepartment,
  studentEmail,
  studentPhone,
  problem,
  location,
  priority = 'Medium',
  additionalDetails,
  aiAnalysis,
}) {
  const ticketNumber = await generateTicketNumber('CMP');

  // Fallback analysis if not pre-computed
  const analysis = aiAnalysis || (await analyzeComplaintWithGemini({ problem, location, priority, additionalDetails }));

  const category = analysis.category || 'Other';
  const assignedDeptId = analysis.department_id;
  const summary = analysis.summary || problem;
  const suggestedAction = analysis.suggested_action || 'Inspect site';

  // 1. Insert Complaint
  const result = await query(
    `INSERT INTO complaints 
     (ticket_number, roll_number, student_name, student_department, student_email, student_phone, 
      category, problem, location, priority, ai_summary, suggested_action, responsible_department_id, 
      status, email_notification_status, whatsapp_notification_status) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', 'Pending', 'Pending')`,
    [
      ticketNumber,
      rollNumber,
      studentName,
      studentDepartment,
      studentEmail || null,
      studentPhone || null,
      category,
      problem,
      location,
      priority,
      summary,
      suggestedAction,
      assignedDeptId,
    ]
  );

  const complaintId = result.insertId;

  // 2. Insert Timeline History
  await query(
    `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, comment) 
     VALUES (?, NULL, 'Open', ?, 'Complaint registered via College AI Portal')`,
    [complaintId, studentName]
  );

  // 3. Fetch Department details for notification
  const deptData = await query('SELECT department_name, email, whatsapp_number FROM departments WHERE id = ?', [
    assignedDeptId,
  ]);
  const deptInfo = deptData[0] || {};

  // 4. Send Email Notification
  const emailRes = await sendComplaintEmailNotification({
    complaint: {
      ticket_number: ticketNumber,
      student_name: studentName,
      roll_number: rollNumber,
      student_department: studentDepartment,
      category,
      problem,
      location,
      priority,
      suggested_action: suggestedAction,
    },
    departmentEmail: deptInfo.email,
  });

  // 5. Send WhatsApp Notification
  const waRes = await sendWhatsAppNotification({
    departmentWhatsApp: deptInfo.whatsapp_number,
    ticketNumber,
    studentName,
    rollNumber,
    problem,
    location,
    priority,
  });

  // Update notification statuses in DB
  await query(
    `UPDATE complaints SET email_notification_status = ?, whatsapp_notification_status = ? WHERE id = ?`,
    [emailRes.status || 'Sent', waRes.status || 'Logged', complaintId]
  );

  // Insert in-app notification for the department
  await query(
    `INSERT INTO notifications (department_id, title, message, type, reference_id) 
     VALUES (?, 'New Complaint Assigned', ?, 'complaint', ?)`,
    [
      assignedDeptId,
      `New ${priority} priority complaint ${ticketNumber} (${problem}) reported at ${location}.`,
      ticketNumber,
    ]
  );

  return {
    id: complaintId,
    ticket_number: ticketNumber,
    roll_number: rollNumber,
    student_name: studentName,
    student_department: studentDepartment,
    category,
    problem,
    location,
    priority,
    status: 'Open',
    responsible_department_id: assignedDeptId,
    department_name: deptInfo.department_name || 'IT Support',
    created_at: new Date().toISOString(),
    email_status: emailRes.status,
    whatsapp_status: waRes.status,
  };
}

/**
 * Public AI Chat Pipeline
 */
async function processPublicChatMessage(message, sessionId = null) {
  // 1. Analyze user message
  const aiResult = await analyzePublicMessageWithGemini(message);

  let responseText = '';
  let showComplaintPrompt = false;
  let extractedComplaint = null;

  if (aiResult.is_complaint) {
    showComplaintPrompt = true;
    extractedComplaint = {
      problem: aiResult.problem || message,
      location: aiResult.location || 'Classroom / Campus',
      priority: aiResult.priority || 'Medium',
    };
    responseText =
      aiResult.response ||
      'It sounds like you are reporting a college-related problem. Would you like to register this as a complaint?';
  } else if (aiResult.intent === 'COMPLAINT_STATUS') {
    if (aiResult.ticket_number) {
      const tickets = await query(
        `SELECT c.*, d.department_name, s.name AS staff_name 
         FROM complaints c 
         LEFT JOIN departments d ON c.responsible_department_id = d.id 
         LEFT JOIN users s ON c.assigned_staff_id = s.id 
         WHERE c.ticket_number = ?`,
        [aiResult.ticket_number]
      );

      if (tickets.length > 0) {
        const t = tickets[0];
        const staffStr = t.staff_name ? ` (Technician: **${t.staff_name}**)` : '';
        const notesStr = t.resolution_notes ? `\n- **Resolution Notes:** ${t.resolution_notes}` : '';
        responseText = `Complaint **${t.ticket_number}** is currently **${t.status}** and has been assigned to the **${t.department_name || 'General Support'}** department.${staffStr}\n- **Problem:** ${t.problem}\n- **Location:** ${t.location}${notesStr}\n\nYou can view full history on the **Track Complaint** page with your Roll Number.`;
      } else {
        responseText = `I could not locate any ticket with number **${aiResult.ticket_number}** in the database. Please verify your ticket number.`;
      }
    } else {
      responseText =
        'To track your complaint status, please provide your Ticket Number (e.g., CMP-2026-0001) or visit the **Track Complaint** tab and enter your Roll Number.';
    }
  } else {
    // Knowledge Base Search
    responseText = await queryCollegeKnowledgeBase(message, aiResult.intent);
  }

  // Save chat turn
  try {
    await query(
      `INSERT INTO chat_messages (session_id, sender, message, metadata) VALUES (?, 'user', ?, ?)`,
      [sessionId, message, JSON.stringify({ intent: aiResult.intent })]
    );
    await query(
      `INSERT INTO chat_messages (session_id, sender, message, metadata) VALUES (?, 'ai', ?, ?)`,
      [sessionId, responseText, JSON.stringify({ intent: aiResult.intent, showComplaintPrompt, extractedComplaint })]
    );
  } catch (err) {
    console.error('Failed to log public chat message:', err.message);
  }

  return {
    response: responseText,
    intent: aiResult.intent,
    showComplaintPrompt,
    extractedComplaint,
  };
}

module.exports = {
  analyzePublicMessageWithGemini,
  analyzeComplaintWithGemini,
  queryCollegeKnowledgeBase,
  registerCollegeComplaint,
  processPublicChatMessage,
};
