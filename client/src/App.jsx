import React, { useState, useEffect } from "react";

function App() {
  const [expenses, setExpenses] = useState([]);

  //Rumus Hitung Total
  // acc= akumulasi, curr= current item (yang sedang dihitung)
  const totalExpense = expenses.reduce((acc, curr) => {
    return acc + Number(curr.amount);
  }, 0);

  // 1. STATE UNTUK FORM INPUT
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  // Ambil data saat website dibuka
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch("http://localhost:5000/expenses");
      const data = await response.json();
      setExpenses(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // 2. LOGIKA MENANGANI KETIKAN USER
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3. LOGIKA SAAT TOMBOL SIMPAN DITEKAN (POST)
  const handleSubmit = async (e) => {
    e.preventDefault(); // Mencegah website refresh sendiri

    try {
      const response = await fetch("http://localhost:5000/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Kirim data form ke backend
      });

      const result = await response.json();

      if (result.success) {
        alert("Berhasil disimpan! ✅");
        fetchExpenses(); // Refresh tabel otomatis
        setFormData({ title: "", amount: "", category: "", date: "" }); // Kosongkan form lagi
      }
    } catch (error) {
      console.error("Gagal simpan:", error);
    }
  };

  // 4. Logika Hapus Data (DELETE)
  const handleDelete = async (id) => {
    // Popup Confirm
    const confirmDelete = window.confirm("Yakin mau dihapus?");
    if (!confirmDelete) return;

    try {
      // Panggil API DELETE
      const response = await fetch(`http://localhost:5000/expenses/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // Update Layar: Hapus id dari state expenses
        setExpenses(expenses.filter((item) => item.id !== id));
        alert("Berhasil dihapus! ✅");
      }
    } catch (error) {
      console.error("Gagal hapus:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "30px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333" }}>
        💰 Aplikasi Money Record
      </h1>

      {/* --- BAGIAN TOTAL PENGELUARAN --- */}
      <div
        style={{
          textAlign: "center",
          background: "#d1ecf1",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          border: "1px solid #bee5eb",
        }}
      >
        <h3 style={{ margin: 0 }}>Total Pengeluaran</h3>
        <h1 style={{ margin: "10px 0 0 0", fontSize: "36px" }}>
          Rp {totalExpense.toLocaleString("id-ID")}
        </h1>
      </div>

      {/* --- BAGIAN FORMULIR --- */}
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h3>Tambah Pengeluaran Baru</h3>
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
          <input
            type="text"
            name="title"
            placeholder="Beli apa hari ini?"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ padding: "8px" }}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number"
              name="amount"
              placeholder="Harga (Rp)"
              value={formData.amount}
              onChange={handleChange}
              required
              style={{ flex: 1, padding: "8px" }}
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{ flex: 1, padding: "8px" }}
            >
              <option value="">Pilih Kategori</option>
              <option value="Makanan">Makanan</option>
              <option value="Transport">Transport</option>
              <option value="Hiburan">Hiburan</option>
              <option value="Tagihan">Tagihan</option>
            </select>
          </div>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={{ padding: "8px" }}
          />

          <button
            type="submit"
            style={{
              padding: "10px",
              background: "#28a745",
              color: "white",
              border: "none",
              cursor: "pointer",
              borderRadius: "5px",
            }}
          >
            + Simpan Transaksi
          </button>
        </form>
      </div>

      {/* --- BAGIAN TABEL DATA --- */}
      <table
        border="1"
        style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}
      >
        <thead style={{ background: "#007bff", color: "white" }}>
          <tr>
            <th style={{ padding: "10px" }}>Judul</th>
            <th style={{ padding: "10px" }}>Kategori</th>
            <th style={{ padding: "10px" }}>Tanggal</th>
            <th style={{ padding: "10px" }}>Harga</th>
            <th style={{ padding: "10px" }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "10px" }}>{item.title}</td>
              <td style={{ padding: "10px" }}>
                <span
                  style={{
                    background: "#eee",
                    padding: "2px 8px",
                    borderRadius: "10px",
                    fontSize: "12px",
                  }}
                >
                  {item.category}
                </span>
              </td>
              <td style={{ padding: "10px" }}>{item.date.split("T")[0]}</td>
              <td style={{ padding: "10px", fontWeight: "bold" }}>
                Rp {Number(item.amount).toLocaleString("id-ID")}
              </td>
              <td style={{ padding: "10px", textAlign: "center" }}>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
