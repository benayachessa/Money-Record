const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "money_record_db",
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
