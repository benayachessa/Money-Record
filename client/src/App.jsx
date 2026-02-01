import React, { useState, useEffect } from "react";
import ExpenseChart from "./components/ExpenseChart";

function App() {
  //Panggil alamat API dari file .env
  const API_URL = import.meta.env.VITE_API_URL;

  const [expenses, setExpenses] = useState([]);

  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  //Wadah Filter
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`);
      const data = await response.json();
      setExpenses(data.data);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditClick = (item) => {
    setEditId(item.id); //aktifkan mode edit
    setFormData({
      //isi formulir dengan data lama
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: item.date.split("T")[0], //format tanggal agar pas di input date
    });
    //scroll atas agar perubahan terlihat
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditId(null); //nonaktif tombol edit
    setFormData({ title: "", amount: "", category: "", date: "" }); //bersihkan form
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editId) {
        // Mode Edit(PUT)
        const response = await fetch(`${API_URL}/expenses/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();

        // Cek Console
        console.log("Hasil Update:", result);

        if (result.success) {
          alert("Data berhasil diupdate!");
          setEditId(null); //nonaktifkan mode edit
        }
      } else {
        const response = await fetch(`${API_URL}/expenses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const result = await response.json();
        if (result.success) {
          alert("Data berhasil disimpan!");
        }
      }

      // Refresh data dan bersihkan form
      fetchExpenses();
      setFormData({ title: "", amount: "", category: "", date: "" });
    } catch (error) {
      console.error("Gagal simpan:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Hapus data ini?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        setExpenses(expenses.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Gagal hapus:", error);
    }
  };

  // Saring data dan simpan di variabel
  const filteredExpenses = expenses.filter((item) => {
    const isCategoryMatch =
      filterCategory === "All" || item.category === filterCategory;
    const isDateMatch =
      filterDate === "" || item.date.split("T")[0] === filterDate;
    return isCategoryMatch && isDateMatch;
  });

  // Hitung Total dari data yang disaring
  const totalExpense = filteredExpenses.reduce((acc, curr) => {
    return acc + Number(curr.amount);
  }, 0);

  // --- TAMPILAN ---
  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <h2>Money Record 💸</h2>
      </div>

      {/* Kartu Total */}
      <div className="total-card">
        <h3>Total Pengeluaran</h3>
        <h1>Rp {totalExpense.toLocaleString("id-ID")}</h1>
      </div>

      {/* Chart Pengeluaran */}
      <ExpenseChart expenses={filteredExpenses} />

      {/* Form Input */}
      <div className="form-card">
        {/* Judul Form Dinamis */}
        <h3 style={{ marginBottom: "15px", color: "#555" }}>
          {editId ? "Edit Transaksi" : "Tambah Transaksi Baru"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              placeholder="Untuk beli apa?"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group form-row">
            <input
              type="number"
              name="amount"
              placeholder="Harga (Rp)"
              value={formData.amount}
              onChange={handleChange}
              required
            />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Kategori</option>
              <option value="Makan">Makan</option>
              <option value="Minuman">Minuman</option>
              <option value="Transport">Transport</option>
              <option value="Belanja">Belanja</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>

          <div className="form-group">
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="submit"
              className="btn-save"
              style={{ flex: 1, background: editId ? "#fca311" : "#4361ee" }}
            >
              {editId ? "Update Transaksi" : "Simpan Transaksi"}
            </button>

            {/* Tombol Batal muncul waktu edit */}
            {editId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: "12px",
                  background: "#e9ecef",
                  border: "none",
                  borderRadius: "10px",
                  cursor: "pointer",
                  color: "#333",
                }}
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/*--- AREA FILTER ---*/}
      <div
        className="filter-section"
        style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
      >
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        >
          <option value="All">Semua Kategori</option>
          <option value="Makan">Makan</option>
          <option value="Minuman">Minuman</option>
          <option value="Transport">Transport</option>
          <option value="Belanja">Belanja</option>
          <option value="Lainnya">Lainnya</option>
        </select>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />
      </div>

      {/* Daftar Transaksi (Bukan Tabel Lagi, tapi List Card) */}
      <div className="transaction-list">
        {filteredExpenses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            Belum ada data transaksi.
          </p>
        ) : (
          filteredExpenses.map((item) => (
            <div key={item.id} className="transaction-item">
              <div className="t-info">
                <h4>{item.title}</h4>
                <span className="t-category">
                  {item.category} • {item.date.split("T")[0]}
                </span>
              </div>
              <div className="t-amount-action">
                <span className="t-price">
                  - Rp {Number(item.amount).toLocaleString("id-ID")}
                </span>

                <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
                  {/* Tombol Edit */}
                  <button
                    onClick={() => handleEditClick(item)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#fca311",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                      fontweight: "500",
                    }}
                  >
                    Edit
                  </button>
                  {/* Tombol Hapus */}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-delete"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
