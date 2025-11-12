const mysql = require('mysql2');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'realestate',
  waitForConnections: true, // Wait for a connection if all are in use
  connectionLimit: 10,      // Maximum number of connections in the pool
  queueLimit: 0,            // Unlimited queued requests (0 means no limit)r
});

// Optional: Test the pool by getting a connection
connection.getConnection((err, conn) => {
  if (err) {
    console.error('Database  connection failed:', err);
    return;
  }
  console.log('Database  connected successfully');
  conn.release(); // Release the connection back to the pool
});

module.exports = connection;
