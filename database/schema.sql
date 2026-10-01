-- AI Campus & College Helpdesk Database Schema
CREATE DATABASE IF NOT EXISTS ai_helpdesk CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ai_helpdesk;

-- 1. Departments Table
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

-- 2. Users Table (Admin, Department Staff, Students)
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

-- 3. College Information Table (Configurable Knowledge Base)
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

-- 4. Courses Table
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

-- 5. FAQs Knowledge Base Table
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

-- 6. Complaints Table
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

-- 7. Complaint History / Audit Timeline Table
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

-- 8. Notifications Table
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

-- 9. Chat Messages History Table
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
