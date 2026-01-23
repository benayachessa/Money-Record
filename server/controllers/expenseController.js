// server/controllers/expenseController.js
const db = require("../config/db");

//Logika 1: Ambil Semua Data (GET)
exports.getAllExpences = async (req, res) => {
  try {
    //Perintah SQL untuk ambil semua data dari tabel expenses
    const [rows] = await db.query("SELECT * FROM expenses");

    //kirim response ke user (JSON)
    res.status(200).json({
      success: true,
      message: "Data berhasil diambil",
      data: rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

//Logika 2: Tambah Data Baru (POST)
exports.createExpense = async (req, res) => {
    //Ambil data yang dikirim oleh user
    const { title, amount, category, date } = req.body;
    
    try{
        // Queri untuk memasukkan data baru ke tabel expenses
        // tanda tanya (?) adalah cara untuk mencegah SQL Injection
        const command = 'INSERT INTO expenses (title, amount, category, date) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(command, [title, amount, category, date]);

        //Kirim response sukses ke user
        res.status(201).json({
            success: true,
            message: "Data berhasil ditambahkan",
            id: result.insertId //mengirimkan id dari data yang baru ditambahkan
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal Menyimpan Data",
            error: error.message
        });
    }
}

//Logika 3: Update Data (PUT/PATCH)
//Logika 4: Hapus Data (DELETE)
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;

    try {
        const command = 'DELETE FROM expenses WHERE id = ?';
        const [result] = await db.query(command, [id]);

        // Cek apakah ada data yang dihapus?
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Data Tidak Ditemukan"
            });
        }

        res.status(200).json({
            success: true,
            message: "Data dengan ID ${id} Berhasil Dihapus!", 
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Gagal Menghapus Data",
            error: error.message
        });
    }
};