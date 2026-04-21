import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const Report = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [expenses, setExpenses] = useState([]);
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    const response = await fetch(`${API_URL}/expenses`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    setExpenses(data.data);
  };

  const filtered = expenses.filter((i) => {
    const catMatch = filterCategory === "All" || i.category === filterCategory;
    const dateMatch = filterDate === "" || i.date.split("T")[0] === filterDate;
    return catMatch && dateMatch;
  });

  const handleExport = () => {
    const data = filtered.map((i) => ({
      Tanggal: i.date.split("T")[0],
      Keterangan: i.title,
      Kategori: i.category,
      Nominal: Number(i.amount),
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, "Laporan_Keuangan.xlsx");
  };

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#111c43", margin: 0 }}>Arsip Laporan</h2>
        <p style={{ color: "#a3aed1", margin: "5px 0 0 0" }}>
          Saring dan unduh data transaksi Anda.
        </p>
      </header>

      <div className="filter-section">
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "10px",
                border: "1px solid #e0e5f2",
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
                borderRadius: "10px",
                border: "1px solid #e0e5f2",
              }}
            />
          </div>
          <button
            onClick={handleExport}
            className="btn-save"
            style={{ background: "#20c997", padding: "10px 20px" }}
          >
            📥 Download Excel
          </button>
        </div>
      </div>

      <div
        className="total-card"
        style={{
          background: "linear-gradient(135deg, #20c997 0%, #0ca678 100%)",
        }}
      >
        <h3>Total Terfilter</h3>
        <h1>
          Rp{" "}
          {filtered
            .reduce((a, b) => a + Number(b.amount), 0)
            .toLocaleString("id-ID")}
        </h1>
      </div>

      <div className="transaction-list">
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center", color: "#888" }}>
            Data tidak ditemukan.
          </p>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="transaction-item"
              style={{ borderLeftColor: "#20c997" }}
            >
              <div className="t-info">
                <h4>{item.title}</h4>
                <span className="t-category">
                  {item.category} • {item.date.split("T")[0]}
                </span>
              </div>
              <div className="t-price" style={{ color: "#2b3674" }}>
                Rp {Number(item.amount).toLocaleString("id-ID")}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Report;
