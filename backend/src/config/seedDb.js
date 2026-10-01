const bcrypt = require('bcryptjs');
const { query } = require('./db');

async function seedDatabase() {
  console.log('[Seed] Seeding college departments, knowledge base, courses, staff, and complaints...');

  const hashedPassword = await bcrypt.hash('Password@123', 10);

  // 1. Seed Departments
  console.log('[Seed] Seeding departments...');
  const departments = [
    {
      name: 'IT Support',
      code: 'IT-SUP',
      email: 'itsupport@campus.edu',
      phone: '+1-555-0199',
      whatsapp: '+15550199000',
      head: 'Alex Turner',
      location: 'Central IT Center Ground Floor',
    },
    {
      name: 'Computer Science Department',
      code: 'CSE',
      email: 'cse.dept@campus.edu',
      phone: '+1-555-0191',
      whatsapp: '+15550191000',
      head: 'Dr. Alan Turing',
      location: 'CSE Block Floor 2',
    },
    {
      name: 'Electrical Maintenance',
      code: 'ELEC-MAINT',
      email: 'electrical@campus.edu',
      phone: '+1-555-0192',
      whatsapp: '+15550192000',
      head: 'Marcus Vance',
      location: 'Maintenance Workshop Block M',
    },
    {
      name: 'Civil Maintenance',
      code: 'CIVIL-MAINT',
      email: 'civil.maint@campus.edu',
      phone: '+1-555-0193',
      whatsapp: '+15550193000',
      head: 'David Miller',
      location: 'Works Division Block W',
    },
    {
      name: 'Administration',
      code: 'ADMIN-OFFICE',
      email: 'admin.office@campus.edu',
      phone: '+1-555-0194',
      whatsapp: '+15550194000',
      head: 'Registrar Office',
      location: 'Administrative Block Ground Floor',
    },
    {
      name: 'Examination Cell',
      code: 'EXAM-CELL',
      email: 'examcell@campus.edu',
      phone: '+1-555-0195',
      whatsapp: '+15550195000',
      head: 'Controller of Examinations',
      location: 'Academic Block A, Room 102',
    },
    {
      name: 'Library',
      code: 'LIB',
      email: 'library@campus.edu',
      phone: '+1-555-0196',
      whatsapp: '+15550196000',
      head: 'Chief Librarian',
      location: 'Central Library Building',
    },
    {
      name: 'Hostel',
      code: 'HOSTEL',
      email: 'hostel@campus.edu',
      phone: '+1-555-0197',
      whatsapp: '+15550197000',
      head: 'Chief Warden',
      location: 'Hostel Block H-1 Office',
    },
    {
      name: 'Transport',
      code: 'TRANS',
      email: 'transport@campus.edu',
      phone: '+1-555-0198',
      whatsapp: '+15550198000',
      head: 'Transport Coordinator',
      location: 'Admin Block Room 12',
    },
    {
      name: 'Security',
      code: 'SEC',
      email: 'security@campus.edu',
      phone: '+1-555-0190',
      whatsapp: '+15550190000',
      head: 'Chief Security Officer',
      location: 'Main Campus Gate 1',
    },
  ];

  for (const dept of departments) {
    const existing = await query('SELECT id FROM departments WHERE code = ?', [dept.code]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO departments (department_name, code, email, phone, whatsapp_number, head_of_department, location) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [dept.name, dept.code, dept.email, dept.phone, dept.whatsapp, dept.head, dept.location]
      );
    }
  }

  // Get department map
  const deptRows = await query('SELECT id, code, department_name FROM departments');
  const deptMap = {};
  deptRows.forEach((d) => {
    deptMap[d.code] = d.id;
    deptMap[d.department_name] = d.id;
  });

  // 2. Seed Users
  console.log('[Seed] Seeding users & department staff...');
  const users = [
    {
      name: 'System Administrator',
      email: 'admin@campus.edu',
      phone: '+1-555-0100',
      password: hashedPassword,
      department_id: deptMap['ADMIN-OFFICE'],
      role: 'admin',
    },
    {
      name: 'Alex Turner (IT Support)',
      email: 'staff.it@campus.edu',
      phone: '+1-555-0101',
      password: hashedPassword,
      department_id: deptMap['IT-SUP'],
      role: 'staff',
    },
    {
      name: 'Marcus Vance (Electrical)',
      email: 'staff.facilities@campus.edu',
      phone: '+1-555-0102',
      password: hashedPassword,
      department_id: deptMap['ELEC-MAINT'],
      role: 'staff',
    },
    {
      name: 'Priya Sharma (Student)',
      email: 'student@campus.edu',
      phone: '+1-555-0103',
      password: hashedPassword,
      department_id: deptMap['CSE'],
      role: 'student',
    },
    {
      name: 'Dr. John Doe (Faculty)',
      email: 'john.doe@campus.edu',
      phone: '+1-555-0104',
      password: hashedPassword,
      department_id: deptMap['CSE'],
      role: 'employee',
    },
  ];

  for (const user of users) {
    const existing = await query('SELECT id FROM users WHERE email = ?', [user.email]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO users (name, email, phone, password, department_id, role) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, user.phone, user.password, user.department_id, user.role]
      );
    }
  }

  // 3. Seed College Knowledge Base (college_info)
  console.log('[Seed] Seeding College Information Knowledge Base...');
  const collegeInfo = [
    {
      key: 'general_info',
      title: 'College Overview & Accreditation',
      category: 'College Information',
      content:
        'Apex Institute of Technology & Science is a premier autonomous institution established in 1998, accredited with Grade A++ by NAAC and ranked among the top regional engineering colleges.',
    },
    {
      key: 'timings',
      title: 'College Working Hours & Timings',
      category: 'Timings',
      content:
        'Our regular college working hours are 9:00 AM to 4:00 PM from Monday to Friday, and 9:00 AM to 1:00 PM on working Saturdays. Laboratories remain open for research students until 6:30 PM.',
    },
    {
      key: 'admissions',
      title: 'Admission Requirements & Process',
      category: 'Admissions',
      content:
        'Admissions for B.Sc, BCA, B.Com, and BBA require a minimum of 55% in Higher Secondary (+2) examinations. Applications open online via the college portal each year in May. Direct counseling is conducted in June.',
    },
    {
      key: 'library',
      title: 'Central Library Timings & Services',
      category: 'Library',
      content:
        'The Central Library operates Monday through Saturday from 8:00 AM to 8:00 PM. Book lending is available until 6:00 PM. Digital library terminals provide access to IEEE, Springer, and ACM digital libraries.',
    },
    {
      key: 'hostel',
      title: 'Hostel Facilities & Accommodation',
      category: 'Hostel',
      content:
        'On-campus air-conditioned and non-AC hostel rooms are available for boys (Blocks A, B) and girls (Blocks C, D). Facilities include 24/7 Wi-Fi, hygienic cafeteria, gym, indoor games, and round-the-clock medical care.',
    },
    {
      key: 'transport',
      title: 'Campus Transport & Bus Routes',
      category: 'Transport',
      content:
        'A fleet of 35 college buses covers all major city routes starting at 7:15 AM. Bus passes are issued semester-wise through the Transport Office in Administrative Block Room 12.',
    },
    {
      key: 'examination',
      title: 'Examination Cell Location & Contacts',
      category: 'Examination',
      content:
        'The Examination Cell is located in Academic Block A, Room 102. Contact email: examcell@campus.edu, internal extension: 401. Office hours: 9:30 AM to 3:30 PM on weekdays.',
    },
    {
      key: 'placement',
      title: 'Placement & Career Opportunities',
      category: 'Placement',
      content:
        'The Corporate Relations & Placement Cell boasts a 94% placement record with top recruiters including Google, Microsoft, Infosys, TCS, and Wipro. The average package is 8.5 LPA, with highest package reaching 44 LPA.',
    },
    {
      key: 'contacts',
      title: 'Key Campus Contacts & Helpdesks',
      category: 'Contact Information',
      content:
        'Principal Office: principal@campus.edu | Administration: admin.office@campus.edu | IT Support: itsupport@campus.edu (Ext: 199) | Emergency Ambulance Hotline: +1-555-0911.',
    },
  ];

  for (const info of collegeInfo) {
    const existing = await query('SELECT id FROM college_info WHERE info_key = ?', [info.key]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO college_info (info_key, title, category, content) VALUES (?, ?, ?, ?)`,
        [info.key, info.title, info.category, info.content]
      );
    }
  }

  // 4. Seed Courses
  console.log('[Seed] Seeding academic courses...');
  const courses = [
    {
      name: 'B.Sc Computer Science',
      code: 'BSC-CS',
      dept_id: deptMap['CSE'],
      degree: 'Undergraduate',
      duration: '3 Years',
      eligibility: '10+2 with Mathematics/Computer Science (Min 55%)',
      fees: '$3,200 / Year',
      desc: 'Focuses on software engineering, data structures, algorithms, cloud computing, and AI foundations.',
    },
    {
      name: 'BCA (Bachelor of Computer Applications)',
      code: 'BCA',
      dept_id: deptMap['CSE'],
      degree: 'Undergraduate',
      duration: '3 Years',
      eligibility: '10+2 in any stream with Mathematics or Business Maths',
      fees: '$3,000 / Year',
      desc: 'Hands-on practical program in web development, database management, and enterprise programming.',
    },
    {
      name: 'B.Com (Bachelor of Commerce)',
      code: 'BCOM',
      dept_id: deptMap['ADMIN-OFFICE'],
      degree: 'Undergraduate',
      duration: '3 Years',
      eligibility: '10+2 with Commerce / Mathematics (Min 50%)',
      fees: '$2,400 / Year',
      desc: 'Comprehensive accounting, financial management, taxation, and business law curriculum.',
    },
    {
      name: 'BBA (Bachelor of Business Administration)',
      code: 'BBA',
      dept_id: deptMap['ADMIN-OFFICE'],
      degree: 'Undergraduate',
      duration: '3 Years',
      eligibility: '10+2 in any stream (Min 50%)',
      fees: '$2,800 / Year',
      desc: 'Develops managerial expertise, strategic thinking, marketing, and entrepreneurship skills.',
    },
    {
      name: 'M.Sc Computer Science',
      code: 'MSC-CS',
      dept_id: deptMap['CSE'],
      degree: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'B.Sc CS / BCA / B.Tech (Min 60%)',
      fees: '$3,800 / Year',
      desc: 'Advanced research specialization in machine learning, distributed networks, and cyber security.',
    },
    {
      name: 'MCA (Master of Computer Applications)',
      code: 'MCA',
      dept_id: deptMap['CSE'],
      degree: 'Postgraduate',
      duration: '2 Years',
      eligibility: 'Graduation with Mathematics at +2 or Degree level',
      fees: '$4,000 / Year',
      desc: 'Professional full-stack application architecture, AI engineering, and systems development.',
    },
  ];

  for (const c of courses) {
    const existing = await query('SELECT id FROM courses WHERE code = ?', [c.code]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO courses (course_name, code, department_id, degree_type, duration, eligibility, fees_per_year, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [c.name, c.code, c.dept_id, c.degree, c.duration, c.eligibility, c.fees, c.desc]
      );
    }
  }

  // 5. Seed FAQs
  console.log('[Seed] Seeding FAQs...');
  const faqs = [
    {
      question: 'What are the college timings?',
      answer: 'Our regular college working hours are 9:00 AM to 4:00 PM from Monday to Friday.',
      category: 'Timings',
      keywords: 'timing, working hours, open, close, schedule, hours',
    },
    {
      question: 'What courses are available?',
      answer: 'We currently offer B.Sc Computer Science, BCA, B.Com, BBA, M.Sc Computer Science, and MCA programs. Would you like information about a particular course?',
      category: 'Courses',
      keywords: 'course, programs, bsc, bca, bcom, bba, mca, msc, degrees',
    },
    {
      question: 'When does the library close?',
      answer: 'The Central Library is open from 8:00 AM to 8:00 PM Monday through Saturday. Book circulation counters close at 6:00 PM.',
      category: 'Library',
      keywords: 'library, books, reading room, closing time, borrow',
    },
    {
      question: 'How can I contact the examination cell?',
      answer: 'The Examination Cell is located in Academic Block A, Room 102. You can contact them via email at examcell@campus.edu or call internal extension 401.',
      category: 'Examination',
      keywords: 'exam cell, results, marksheet, hall ticket, backlog, revaluation',
    },
    {
      question: 'What are the hostel facilities?',
      answer: 'Our college provides separate boys and girls hostels with 24/7 security, Wi-Fi, hygienic mess meals, and recreational rooms. Applications open at the start of each semester.',
      category: 'Hostel',
      keywords: 'hostel, room, dorm, accommodation, warden, mess',
    },
    {
      question: 'How do I report a Wi-Fi or classroom issue?',
      answer: 'You can report any problem directly in this AI chat by saying "The projector is not working" or "Wi-Fi is down". The AI will help you register a tracked complaint ticket instantly.',
      category: 'Support',
      keywords: 'wifi, projector, problem, complaint, repair, report issue',
    },
  ];

  for (const faq of faqs) {
    const existing = await query('SELECT id FROM faq WHERE question = ?', [faq.question]);
    if (existing.length === 0) {
      await query(
        `INSERT INTO faq (question, answer, category, keywords) VALUES (?, ?, ?, ?)`,
        [faq.question, faq.answer, faq.category, faq.keywords]
      );
    }
  }

  // 6. Seed Sample Complaints with History
  console.log('[Seed] Seeding sample complaints and status timelines...');
  const sampleComplaints = [
    {
      ticket_number: 'CMP-2026-0001',
      roll_number: '23CS001',
      student_name: 'Kavin',
      student_department: 'Computer Science',
      student_email: 'kavin@campus.edu',
      student_phone: '+1-555-0211',
      category: 'IT Equipment',
      problem: 'Projector in CSE Block Room 204 is flickering and has no HDMI signal.',
      location: 'CSE Block Room 204',
      priority: 'High',
      ai_summary: 'Projector malfunction in CSE Block Room 204 requiring HDMI inspection.',
      suggested_action: 'Dispatch technician with replacement HDMI cable and lamp unit.',
      responsible_dept_id: deptMap['IT-SUP'],
      status: 'In Progress',
      resolution_notes: 'Technician inspected unit; replacement parts on order.',
    },
    {
      ticket_number: 'CMP-2026-0002',
      roll_number: '23CS042',
      student_name: 'Ananya Roy',
      student_department: 'Computer Science',
      student_email: 'ananya@campus.edu',
      student_phone: '+1-555-0212',
      category: 'Network',
      problem: 'Campus Wi-Fi AP-04 disconnecting every 5 minutes in Library 2nd Floor.',
      location: 'Library Floor 2',
      priority: 'Medium',
      ai_summary: 'Wi-Fi connectivity drop on 2nd floor access point.',
      suggested_action: 'Reboot and reconfigure access point channel.',
      responsible_dept_id: deptMap['IT-SUP'],
      status: 'Open',
    },
    {
      ticket_number: 'CMP-2026-0003',
      roll_number: '23EE015',
      student_name: 'Rahul Verma',
      student_department: 'Electrical Engineering',
      student_email: 'rahul.v@campus.edu',
      student_phone: '+1-555-0213',
      category: 'Electrical Maintenance',
      problem: 'Ceiling fan making loud grinding noise and running extremely slow in Seminar Hall A.',
      location: 'Seminar Hall A',
      priority: 'Medium',
      ai_summary: 'Ceiling fan bearing failure in Seminar Hall A.',
      suggested_action: 'Replace capacitor and lubricate motor bearing.',
      responsible_dept_id: deptMap['ELEC-MAINT'],
      status: 'Resolved',
      resolution_notes: 'Fan motor bearing replaced and re-lubricated. Running smoothly.',
      resolved_at: new Date(Date.now() - 3600000),
    },
  ];

  for (const cmp of sampleComplaints) {
    const existing = await query('SELECT id FROM complaints WHERE ticket_number = ?', [cmp.ticket_number]);
    let complaintId;
    if (existing.length === 0) {
      const result = await query(
        `INSERT INTO complaints 
         (ticket_number, roll_number, student_name, student_department, student_email, student_phone, 
          category, problem, location, priority, ai_summary, suggested_action, responsible_department_id, 
          status, resolution_notes, resolved_at, email_notification_status, whatsapp_notification_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Sent', 'Logged (Demo Mode)')`,
        [
          cmp.ticket_number,
          cmp.roll_number,
          cmp.student_name,
          cmp.student_department,
          cmp.student_email,
          cmp.student_phone,
          cmp.category,
          cmp.problem,
          cmp.location,
          cmp.priority,
          cmp.ai_summary,
          cmp.suggested_action,
          cmp.responsible_dept_id,
          cmp.status,
          cmp.resolution_notes || null,
          cmp.resolved_at || null,
        ]
      );
      complaintId = result.insertId;

      // Seed timeline history for the sample complaint
      await query(
        `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, comment, created_at) 
         VALUES (?, NULL, 'Open', 'Student Registration', 'Complaint registered via AI Helpdesk', DATE_SUB(NOW(), INTERVAL 4 HOUR))`,
        [complaintId]
      );

      if (cmp.status === 'In Progress' || cmp.status === 'Resolved') {
        await query(
          `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, comment, created_at) 
           VALUES (?, 'Open', 'In Progress', 'IT Support Staff', 'Technician dispatched to inspect site', DATE_SUB(NOW(), INTERVAL 2 HOUR))`,
          [complaintId]
        );
      }

      if (cmp.status === 'Resolved') {
        await query(
          `INSERT INTO complaint_history (complaint_id, old_status, new_status, changed_by, comment, created_at) 
           VALUES (?, 'In Progress', 'Resolved', 'Maintenance Staff', 'Repairs completed successfully', NOW())`,
          [complaintId]
        );
      }
    }
  }

  console.log('[Seed] Database successfully populated with realistic college data!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
