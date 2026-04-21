// server/index.js
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config(); // Pastikan file .env terbaca

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const app = express();
const port = process.env.PORT || 5000;

// Middleware Global
app.use(cors());
app.use(express.json());

// --- MIDDLEWARE SATPAM TOKEN ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Token Tidak Ditemukan di Header!");
    return res.status(401).json({ message: "Akses ditolak, token hilang!" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token Error:", err.message);
      return res.status(403).json({ message: "Token tidak valid!" });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// RUTE AUTENTIKASI (LOGIN & REGISTER)
// ==========================================

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);
    res.json({ success: true, message: "User berhasil dibuat!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Username sudah dipakai Bos!" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0) return res.status(404).json({ success: false, message: "User tidak ketemu!" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Password salah, Bos!" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login gagal total!" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, username, created_at FROM users WHERE id = ?", [req.user.id]);
    res.json({ success: true, user: users[0] });
  } catch (error) {
    res.status(500).send(error);
  }
});

// ==========================================
// RUTE PENGELUARAN (EXPENSES)
// ==========================================

// GET: Ambil data khusus milik user yang login
app.get("/expenses", authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM expenses WHERE user_id = ?", [req.user.id]);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).send(error);
  }
});

// POST: Simpan data dengan user_id dari token
app.post("/expenses", authenticateToken, async (req, res) => {
  const { title, amount, category, date } = req.body;
  console.log("Data User dari Token:", req.user); // Buat mantau di terminal

  try {
    const query = "INSERT INTO expenses (title, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)";
    const values = [title, amount, category, date, req.user.id];

    await db.query(query, values);
    res.json({ success: true, message: "Berhasil simpan data!" });
  } catch (error) {
    console.error("Gagal Simpan ke DB:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT: Update/Edit data (Hanya bisa edit milik sendiri)
app.put("/expenses/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, amount, category, date } = req.body;

  try {
    // Perhatikan: Kita cocokan 'id' transaksi DAN 'user_id' pemiliknya
    const query = "UPDATE expenses SET title = ?, amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?";
    const values = [title, amount, category, date, id, req.user.id];
    
    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan atau bukan milik Bos!" });
    }

    res.json({ success: true, message: "Berhasil diupdate!" });
  } catch (error) {
    console.error("Gagal Update:", error);
    res.status(500).json({ success: false, message: "Server error saat update." });
  }
});

// DELETE: Hapus data (Hanya bisa hapus milik sendiri)
app.delete("/expenses/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM expenses WHERE id = ? AND user_id = ?";
    const [result] = await db.query(query, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Data tidak ditemukan atau bukan milik Bos!" });
    }

    res.json({ success: true, message: "Berhasil dihapus!" });
  } catch (error) {
    console.error("Gagal Hapus:", error);
    res.status(500).json({ success: false, message: "Server error saat hapus." });
  }
});

// ==========================================
// RUTE AI FINANCIAL ADVISOR
// ==========================================

// WAJIB pakai authenticateToken agar AI hanya baca data user terkait
app.get("/ai-tips", authenticateToken, async (req, res) => {
  try {
    // Perbaikan: Hanya ambil expense milik user ini
    const [expenses] = await db.query("SELECT * FROM expenses WHERE user_id = ?", [req.user.id]);

    if (expenses.length === 0) {
      return res.json({ success: true, tip: "Belum ada transaksi bulan ini. Yuk catat dulu biar bisa aku analisis!" });
    }

    let totalExpense = 0;
    let categoryTotals = {};
    expenses.forEach((item) => {
      const amount = Number(item.amount);
      totalExpense += amount;
      categoryTotals[item.category] = (categoryTotals[item.category] || 0) + amount;
    });

    const promptText = `Kamu penasihat keuangan. Pengeluaran klien Rp ${totalExpense} dengan rincian: ${JSON.stringify(categoryTotals)}. Berikan 2 kalimat saran santai.`;
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiText = data.candidates[0].content.parts[0].text;
      res.json({ success: true, tip: aiText });
    } else {
      console.error("Detail Error Google:", data);
      res.json({ success: false, tip: "AI sedang sinkronisasi, coba lagi sekejap lagi." });
    }
  } catch (error) {
    console.error("Gagal memanggil AI:", error);
    res.status(500).json({ success: false, message: "Koneksi server AI gagal." });
  }
});

// ==========================================
// MENYALAKAN SERVER (HANYA ADA SATU DI BAWAH)
// ==========================================
app.listen(port, () => {
  console.log(`Server lari kencang di port ${port}`);
});

module.exports = app;