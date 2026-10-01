const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const DB_NAME = process.env.DB_NAME || 'ai_helpdesk';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3307', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || 'Admin@1234';

async function initDatabase() {
  console.log(`[Database Init] Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
    });

    console.log(`[Database Init] Ensuring database "${DB_NAME}" exists...`);
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    await connection.query(`USE \`${DB_NAME}\`;`);

    console.log('[Database Init] Creating or migrating tables...');

    // 1. Departments Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        department_name VARCHAR(150) NOT NULL UNIQUE,
        code VARCHAR(20) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL,
        phone VARCHAR(30) DEFAULT NULL,
        whatsapp_number VARCHAR(30) DEFAULT NULL,
        head_of_department VARCHAR(100) DEFAULT NULL,
        location VARCHAR(100) DEFAULT 'Main Campus',
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_dept_name (department_name),
        INDEX idx_dept_code (code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 2. Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        phone VARCHAR(30) DEFAULT NULL,
        password VARCHAR(255) NOT NULL,
        department_id INT DEFAULT NULL,
        role ENUM('student', 'employee', 'staff', 'admin') NOT NULL DEFAULT 'student',
        status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_user_email (email),
        INDEX idx_user_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 3. College Information Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS college_info (
        id INT AUTO_INCREMENT PRIMARY KEY,
        info_key VARCHAR(100) NOT NULL UNIQUE,
        title VARCHAR(200) NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General',
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_info_category (category),
        INDEX idx_info_key (info_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 4. Courses Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_name VARCHAR(150) NOT NULL,
        code VARCHAR(30) NOT NULL UNIQUE,
        department_id INT DEFAULT NULL,
        degree_type ENUM('Undergraduate', 'Postgraduate', 'Diploma', 'Doctorate') NOT NULL DEFAULT 'Undergraduate',
        duration VARCHAR(50) NOT NULL DEFAULT '4 Years',
        eligibility TEXT DEFAULT NULL,
        fees_per_year VARCHAR(50) DEFAULT NULL,
        description TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
        INDEX idx_course_name (course_name),
        INDEX idx_course_dept (department_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. FAQs Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS faq (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question VARCHAR(255) NOT NULL,
        answer TEXT NOT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'General',
        keywords VARCHAR(255) DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_faq_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Complaints Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticket_number VARCHAR(50) NOT NULL UNIQUE,
        roll_number VARCHAR(50) NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        student_department VARCHAR(100) NOT NULL,
        student_email VARCHAR(150) DEFAULT NULL,
        student_phone VARCHAR(30) DEFAULT NULL,
        category VARCHAR(100) NOT NULL DEFAULT 'Other',
        problem TEXT NOT NULL,
        location VARCHAR(150) NOT NULL,
        priority ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
        ai_summary TEXT DEFAULT NULL,
        suggested_action TEXT DEFAULT NULL,
        responsible_department_id INT DEFAULT NULL,
        assigned_staff_id INT DEFAULT NULL,
        status ENUM('Open', 'Assigned', 'In Progress', 'Resolved', 'Closed', 'Rejected') NOT NULL DEFAULT 'Open',
        resolution_notes TEXT DEFAULT NULL,
        resolved_at TIMESTAMP NULL DEFAULT NULL,
        email_notification_status VARCHAR(50) DEFAULT 'Pending',
        whatsapp_notification_status VARCHAR(50) DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (responsible_department_id) REFERENCES departments(id) ON DELETE SET NULL,
        FOREIGN KEY (assigned_staff_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_cmp_ticket (ticket_number),
        INDEX idx_cmp_roll (roll_number),
        INDEX idx_cmp_status (status),
        INDEX idx_cmp_dept (responsible_department_id),
        INDEX idx_cmp_priority (priority),
        INDEX idx_cmp_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // Ensure columns exist on complaints if table existed previously
    const [cols] = await connection.query(`DESCRIBE complaints`);
    const colNames = cols.map((c) => c.Field);

    if (!colNames.includes('roll_number')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN roll_number VARCHAR(50) DEFAULT '23CS001' AFTER ticket_number`);
    }
    if (!colNames.includes('student_name')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN student_name VARCHAR(100) DEFAULT 'Student' AFTER roll_number`);
    }
    if (!colNames.includes('student_department')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN student_department VARCHAR(100) DEFAULT 'Computer Science' AFTER student_name`);
    }
    if (!colNames.includes('student_email')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN student_email VARCHAR(150) DEFAULT NULL AFTER student_department`);
    }
    if (!colNames.includes('student_phone')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN student_phone VARCHAR(30) DEFAULT NULL AFTER student_email`);
    }
    if (!colNames.includes('problem')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN problem TEXT DEFAULT NULL AFTER category`);
      await connection.query(`UPDATE complaints SET problem = description WHERE problem IS NULL`);
    }
    if (!colNames.includes('ai_summary')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN ai_summary TEXT DEFAULT NULL AFTER priority`);
    }
    if (!colNames.includes('suggested_action')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN suggested_action TEXT DEFAULT NULL AFTER ai_summary`);
    }
    if (!colNames.includes('responsible_department_id')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN responsible_department_id INT DEFAULT NULL AFTER suggested_action`);
    }
    if (!colNames.includes('assigned_staff_id')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN assigned_staff_id INT DEFAULT NULL AFTER responsible_department_id`);
    }
    if (!colNames.includes('email_notification_status')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN email_notification_status VARCHAR(50) DEFAULT 'Sent'`);
    }
    if (!colNames.includes('whatsapp_notification_status')) {
      await connection.query(`ALTER TABLE complaints ADD COLUMN whatsapp_notification_status VARCHAR(50) DEFAULT 'Logged (Demo Mode)'`);
    }

    // 7. Complaint History Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS complaint_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id INT NOT NULL,
        old_status VARCHAR(50) DEFAULT NULL,
        new_status VARCHAR(50) NOT NULL,
        changed_by VARCHAR(100) DEFAULT 'System',
        comment TEXT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
        INDEX idx_hist_cmp (complaint_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 8. Notifications
    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        department_id INT DEFAULT NULL,
        title VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL DEFAULT 'complaint',
        reference_id VARCHAR(50) DEFAULT NULL,
        is_read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
        INDEX idx_notif_dept (department_id),
        INDEX idx_notif_read (is_read)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 9. Chat Messages
    await connection.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(100) DEFAULT NULL,
        user_id INT DEFAULT NULL,
        sender ENUM('user', 'ai', 'system') NOT NULL,
        message TEXT NOT NULL,
        metadata JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_chat_session (session_id),
        INDEX idx_chat_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    console.log('[Database Init] All tables created or updated successfully!');
  } catch (error) {
    console.error('[Database Init] Error initializing database:', error);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('[Database Init] Finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Database Init] Failed:', err);
      process.exit(1);
    });
}

module.exports = initDatabase;
