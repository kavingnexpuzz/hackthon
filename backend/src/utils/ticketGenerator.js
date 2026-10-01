const { query } = require('../config/db');

async function generateTicketNumber(prefix = 'CMP') {
  const currentYear = new Date().getFullYear();
  const searchPattern = `${prefix}-${currentYear}-%`;

  let tableName = 'complaints';
  let columnName = 'ticket_number';

  if (prefix === 'REQ') {
    tableName = 'requests';
    columnName = 'request_number';
  }

  const rows = await query(
    `SELECT ${columnName} AS code FROM ${tableName} WHERE ${columnName} LIKE ? ORDER BY id DESC LIMIT 1`,
    [searchPattern]
  );

  let nextSequence = 1;

  if (rows.length > 0 && rows[0].code) {
    const parts = rows[0].code.split('-');
    if (parts.length === 3) {
      const lastSeq = parseInt(parts[2], 10);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }
  }

  const formattedSeq = String(nextSequence).padStart(4, '0');
  return `${prefix}-${currentYear}-${formattedSeq}`;
}

module.exports = {
  generateTicketNumber,
};
