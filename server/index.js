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

// ==========================================
// MIDDLEWARE (AUTHENTICATE TOKEN)
// ==========================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Ambil token di sebelah tulisan "Bearer"

  if (!token) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Akses ditolak! Token tidak ditemukan.",
      });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Token palsu atau sudah kadaluarsa!",
        });
    }

    // INI KUNCI UTAMANYA BOS!
    // Kita simpan isi token (id dan username) ke dalam req.user agar bisa dibaca oleh rute Profil
    req.user = decoded;

    next(); // Silakan masuk!
  });
};

// ==========================================
// RUTE AUTENTIKASI (LOGIN & REGISTER)
// ==========================================

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
      username,
      hashedPassword,
    ]);
    res.json({ success: true, message: "User berhasil dibuat!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Username sudah dipakai Bos!" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (users.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User tidak ketemu!" });

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Password salah, Bos!" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, username: user.username },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Login gagal total!" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, username, created_at FROM users WHERE id = ?",
      [req.user.id],
    );
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
    const [rows] = await db.query("SELECT * FROM expenses WHERE user_id = ?", [
      req.user.id,
    ]);
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
    const query =
      "INSERT INTO expenses (title, amount, category, date, user_id) VALUES (?, ?, ?, ?, ?)";
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
    const query =
      "UPDATE expenses SET title = ?, amount = ?, category = ?, date = ? WHERE id = ? AND user_id = ?";
    const values = [title, amount, category, date, id, req.user.id];

    const [result] = await db.query(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan atau bukan milik Bos!",
      });
    }

    res.json({ success: true, message: "Berhasil diupdate!" });
  } catch (error) {
    console.error("Gagal Update:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error saat update." });
  }
});

// DELETE: Hapus data (Hanya bisa hapus milik sendiri)
app.delete("/expenses/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM expenses WHERE id = ? AND user_id = ?";
    const [result] = await db.query(query, [id, req.user.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan atau bukan milik Bos!",
      });
    }

    res.json({ success: true, message: "Berhasil dihapus!" });
  } catch (error) {
    console.error("Gagal Hapus:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error saat hapus." });
  }
});

// ==========================================
// RUTE PROFIL PENGGUNA (VERSI ANTI-GAGAL)
// ==========================================

// 1. Ambil Data Profil
app.get("/profile", authenticateToken, async (req, res) => {
  try {
    // === PASANG RADAR DISINI BOS! ===
    console.log("🔍 ISI TOKEN DARI FRONTEND:", req.user);

    const userId = req.user.id || req.user.userId;

    // ... sisa kode di bawahnya biarkan sama ...

    const [users] = await db.query(
      "SELECT id, username, avatar, created_at FROM users WHERE id = ?",
      [userId],
    );

    if (users.length > 0) {
      res.json({ success: true, data: users[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan di Database" });
    }
  } catch (error) {
    console.error("Error Get Profile:", error);
    res
      .status(500)
      .json({ success: false, message: "Server gagal mengambil data profil" });
  }
});

// 2. Update Username & Avatar
app.put("/profile", authenticateToken, async (req, res) => {
  const { username, avatar } = req.body;
  try {
    const userId = req.user.id || req.user.userId;

    await db.query("UPDATE users SET username = ?, avatar = ? WHERE id = ?", [
      username,
      avatar,
      userId,
    ]);
    res.json({ success: true, message: "Profil berhasil diperbarui!" });
  } catch (error) {
    console.error("Error Update Profile:", error);
    res.status(500).json({ success: false, message: "Gagal update profil" });
  }
});

// 3. Update Password
app.put("/profile/password", authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const userId = req.user.id || req.user.userId;

    // Cari user dulu
    const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (users.length === 0)
      return res
        .status(404)
        .json({ success: false, message: "User tidak ditemukan" });

    const user = users[0];

    // Cek kecocokan password lama
    const validPassword = await bcrypt.compare(oldPassword, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Password lama salah!" });
    }

    // Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Simpan ke database
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);
    res.json({ success: true, message: "Password berhasil diubah!" });
  } catch (error) {
    console.error("Error Update Password:", error);
    res.status(500).json({ success: false, message: "Gagal ganti password" });
  }
});

// ==========================================
// RUTE AI FINANCIAL ADVISOR
// ==========================================
app.post("/ai-chat", authenticateToken, async (req, res) => {
  const { message } = req.body; // Menangkap pesan ketikan user

  try {
    const [expenses] = await db.query(
      "SELECT * FROM expenses WHERE user_id = ?",
      [req.user.id],
    );

    let totalExpense = 0;
    let categoryTotals = {};
    expenses.forEach((item) => {
      const amount = Number(item.amount);
      totalExpense += amount;
      categoryTotals[item.category] =
        (categoryTotals[item.category] || 0) + amount;
    });

    // Kita bekali AI dengan data keuangan user sebagai "Konteks Rahasia"
    const context = `Data keuangan klien saat ini: Total pengeluaran Rp ${totalExpense}. Rincian kategori: ${JSON.stringify(categoryTotals)}.`;

    // Gabungkan konteks dengan pertanyaan user
    const promptText = `Kamu adalah penasihat keuangan pribadi. ${context}\n\nPertanyaan/Perintah Klien: "${message}". Jawablah dengan santai, ramah, ringkas (maksimal 3 paragraf), dan berikan saran yang masuk akal.`;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash-001:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] }),
    });

    const data = await response.json();

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      res.json({
        success: true,
        reply: data.candidates[0].content.parts[0].text,
      });
    } else {
      res.json({
        success: false,
        reply: "Maaf Bos, sistem AI sedang sibuk. Coba lagi sekejap ya.",
      });
    }
  } catch (error) {
    console.error("Gagal memanggil AI:", error);
    res.status(500).json({ success: false, reply: "Koneksi server AI gagal." });
  }
});

// ==========================================
// MENYALAKAN SERVER (HANYA ADA SATU DI BAWAH)
// ==========================================
app.listen(port, () => {
  console.log(`Server lari kencang di port ${port}`);
});

module.exports = app;
