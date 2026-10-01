const axios = require('axios');

/**
 * Official WhatsApp Business / Cloud API notification abstraction.
 * If credentials are not configured, logs message to console and marks status as 'Logged (Demo Mode)'.
 * Never throws or interrupts the complaint registration process.
 */
async function sendWhatsAppNotification({
  departmentWhatsApp,
  ticketNumber,
  studentName,
  rollNumber,
  problem,
  location,
  priority,
}) {
  const apiUrl = process.env.WHATSAPP_API_URL;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  const messageText = `
*New College Complaint Received*
*Ticket:* ${ticketNumber}
*Student:* ${studentName}
*Roll No:* ${rollNumber}
*Problem:* ${problem}
*Location:* ${location}
*Priority:* ${priority}

Please check the complaint and assign a technician.
  `.trim();

  // If WhatsApp API is not configured, log message for presentation
  if (!apiUrl || !token || !phoneId || token.includes('your_token')) {
    console.log(`[WhatsApp Notification (Demo Mode)] To: ${departmentWhatsApp || 'Admin Hotline'}`);
    console.log(`[WhatsApp Message]:\n${messageText}`);
    return {
      success: true,
      status: 'Logged (Demo Mode)',
    };
  }

  try {
    const endpoint = `${apiUrl.replace(/\/+$/, '')}/${phoneId}/messages`;
    await axios.post(
      endpoint,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: departmentWhatsApp,
        type: 'text',
        text: { body: messageText },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    console.log(`[WhatsApp Notification] Message successfully sent to ${departmentWhatsApp}`);
    return {
      success: true,
      status: 'Sent',
    };
  } catch (error) {
    console.warn(`[WhatsApp Notification Warning] Could not deliver: ${error.message}`);
    return {
      success: false,
      status: 'Failed (Logged)',
      error: error.message,
    };
  }
}

module.exports = {
  sendWhatsAppNotification,
};
