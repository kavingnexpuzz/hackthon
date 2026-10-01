const nodemailer = require('nodemailer');

/**
 * Sends email notification to responsible department and administrator.
 * Falls back gracefully to logged demo mode if SMTP credentials are not configured.
 */
async function sendComplaintEmailNotification({ complaint, departmentEmail, adminEmail }) {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);

  const subject = `New Complaint - ${complaint.ticket_number}`;
  const recipients = [departmentEmail, adminEmail || 'admin.office@campus.edu'].filter(Boolean).join(', ');

  const textBody = `
New college complaint received.

Ticket Number: ${complaint.ticket_number}
Student: ${complaint.student_name}
Roll Number: ${complaint.roll_number}
Department: ${complaint.student_department}
Category: ${complaint.category}
Problem: ${complaint.problem}
Location: ${complaint.location}
Priority: ${complaint.priority}
Suggested Action: ${complaint.suggested_action || 'Inspect and resolve'}

Please review and take appropriate action.
Campus Helpdesk Automated Notification System
  `.trim();

  // If SMTP is not configured, log and return success status gracefully
  if (!host || !user || !pass || host.includes('your_smtp') || user.includes('your_user')) {
    console.log(`[Email Notification (Demo Mode)] To: ${recipients} | Subject: ${subject}`);
    console.log(`[Email Notification Body]:\n${textBody}`);
    return {
      success: true,
      status: 'Sent (Simulated)',
    };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"Campus Helpdesk" <${user}>`,
      to: recipients,
      subject,
      text: textBody,
    });

    console.log(`[Email Notification] Successfully dispatched to ${recipients}`);
    return {
      success: true,
      status: 'Sent',
    };
  } catch (error) {
    console.warn(`[Email Notification Error] Could not send email: ${error.message}`);
    return {
      success: false,
      status: 'Failed (Logged)',
      error: error.message,
    };
  }
}

module.exports = {
  sendComplaintEmailNotification,
};
