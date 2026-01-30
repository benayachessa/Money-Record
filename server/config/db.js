const mysql = require("mysql2");

const db = mysql.createPool({
  host: 'bejhwzru2sc4mrduyt02-mysql.services.clever-cloud.com',
  user: 'ulgfwyy4de4scoli',
  password: 'ViVHzurRynkS6HKpFx08',
  database: 'bejhwzru2sc4mrduyt02',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
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
