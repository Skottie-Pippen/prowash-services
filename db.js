/**
 * db.js – MySQL connection pool
 * Uses mysql2/promise for async/await support.
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME     || 'eneb453_lab4',
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0
});

module.exports = pool;
