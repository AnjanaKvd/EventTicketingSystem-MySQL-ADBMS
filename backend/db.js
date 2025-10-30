require('dotenv').config();

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true, 
    connectionLimit: 10,     
    queueLimit: 0,      
    multipleStatements: true
});


async function checkConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Database connection pool established successfully. ✅');
        connection.release(); 
    } catch (err) {
        console.error('[FATAL] Database connection failed:', err.message);
        process.exit(1); 
    }
}

checkConnection();

module.exports = pool;