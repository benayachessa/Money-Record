import React, { useState, useEffect } from "react";
import ExpenseChart from "./components/ExpenseChart";

function App() {
  const [expenses, setExpenses] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  // Hitung Total Otomatis
  const totalExpense = expenses.reduce((acc, curr) => {
    return acc + Number(curr.amount);
  }, 0);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        fetchExpenses();
        setFormData({ title: "", amount: "", category: "", date: "" });
      }
    } catch (error) {
      console.error("Gagal simpan:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Hapus data ini?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/expenses/${id}`, {
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

  // --- TAMPILAN BARU (CLEAN UI) ---
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
      <ExpenseChart expenses={expenses} />

      {/* Form Input */}
      <div className="form-card">
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

          <button type="submit" className="btn-save">
            Simpan Transaksi
          </button>
        </form>
      </div>

      {/* Daftar Transaksi (Bukan Tabel Lagi, tapi List Card) */}
      <div className="transaction-list">
        {expenses.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            Belum ada data transaksi.
          </p>
        ) : (
          expenses.map((item) => (
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
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-delete"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
