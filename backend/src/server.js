const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { pool } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test DB connection
    const connection = await pool.getConnection();
    console.log('MySQL Database connected successfully!');
    connection.release();

    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` AI Helpdesk Backend Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
      console.log(`===============================================`);
    });
  } catch (error) {
    console.error('Failed to connect to MySQL database:', error.message);
    process.exit(1);
  }
}

startServer();
