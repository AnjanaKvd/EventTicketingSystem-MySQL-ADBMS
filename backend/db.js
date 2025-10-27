// Load environment variables from the .env file
require('dotenv').config();

// We use 'mysql2/promise' to use modern async/await syntax
const mysql = require('mysql2/promise');

// Create the connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, // Wait for a connection to be available
    connectionLimit: 10,      // Max number of connections in the pool
    queueLimit: 0,             // No limit on the number of waiting requests
    multipleStatements: true
});

// A simple function to test the connection on startup
async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection pool established successfully. ✅');
        connection.release(); // Return the connection to the pool
    } catch (err) {
        console.error('[FATAL] Database connection failed:', err.message);
        // Exit the process if the DB connection fails on start
        process.exit(1); 
    }
}

// Run the connection check
checkConnection();

// Export the pool so our API routes can use it
module.exports = pool;