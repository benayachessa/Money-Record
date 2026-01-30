const mysql = require("mysql2");

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test the database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error("GAGAL Connect ke database:", err.message);
  } else {
    console.log("Berhasil Connect ke database");
    connection.release();
  }
});

module.exports = db.promise(); // export mode Promise biar bisa pakai async/await nanti
