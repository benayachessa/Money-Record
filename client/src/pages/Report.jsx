import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import ExpenseChart from "../components/ExpenseChart";

const Report = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [expenses, setExpenses] = useState([]);

  const [filterCategory, setFilterCategory] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch(`${API_URL}/expenses`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      setExpenses(data.data);
    } catch (error) {
      console.error("Gagal ambil data laporan:", error);
    }
  };

  const filtered = expenses.filter((i) => {
    const itemDate = i.date.split("T")[0];
    const catMatch = filterCategory === "All" || i.category === filterCategory;
    const startMatch = startDate === "" || itemDate >= startDate;
    const endMatch = endDate === "" || itemDate <= endDate;
    return catMatch && startMatch && endMatch;
  });

  const handleResetFilter = () => {
    setFilterCategory("All");
    setStartDate("");
    setEndDate("");
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      alert("Nggak ada data yang mau di-download, Bos!");
      return;
    }

    const data = filtered.map((i) => ({
      Tanggal: i.date.split("T")[0],
      Keterangan: i.title,
      Kategori: i.category,
      Nominal: Number(i.amount),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = [{ wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan");

    const fileName =
      startDate && endDate
        ? `Laporan_${startDate}_sd_${endDate}.xlsx`
        : "Laporan_Semua_Keuangan.xlsx";

    XLSX.writeFile(wb, fileName);
  };

  const totalFiltered = filtered.reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="dashboard-container report-dashboard">
      {/* =========================================================
          SULAP CSS KHUSUS PENGURUTAN MOBILE & FIX TINGGI CHART
          ========================================================= */}
      <style>
        {`
          .mobile-download-btn { display: none; }

          /* Trik Dewa: Memaksa ExpenseChart meregang tingginya (100%) menyamai kotak hijau */
          .chart-stretcher > * {
            height: 100% !important;
            margin: 0 !important;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          @media (max-width: 768px) {
            .report-dashboard {
              display: flex;
              flex-direction: column;
            }
            .rm-main-grid { display: contents !important; }

            .rm-header         { order: 1; }
            .rm-total-card     { order: 2; margin-bottom: 20px !important; width: 100%; }
            .rm-chart-card     { order: 3; margin-bottom: 20px !important; width: 100%; }
            .rm-filter-section { order: 4; margin-bottom: 20px !important; }
            .mobile-download-btn { order: 5; display: block; margin-bottom: 30px; }
            .rm-list           { order: 6; }

            .desktop-download-btn { display: none !important; }
          }
        `}
      </style>

      {/* --- HEADER --- */}
      <header
        className="rm-header"
        style={{
          marginBottom: "25px",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "15px",
          alignItems: "center",
        }}
      >
        <div>
          <h2 style={{ color: "#111c43", margin: 0 }}>Arsip Laporan</h2>
          <p style={{ color: "#a3aed1", margin: "5px 0 0 0" }}>
            Analisis dan unduh riwayat transaksimu.
          </p>
        </div>
        <button
          onClick={handleExport}
          className="btn-save desktop-download-btn"
          style={{ background: "#20c997", padding: "12px 20px" }}
        >
          📥 Download Excel
        </button>
      </header>

      {/* --- KOTAK FILTER --- */}
      <div
        className="filter-section rm-filter-section"
        style={{ borderTop: "4px solid #4361ee" }}
      >
        <h4 style={{ margin: "0 0 15px 0", color: "#111c43" }}>
          🔍 Filter Data Laporan
        </h4>
        <div className="form-row">
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label
              style={{
                fontSize: "0.85rem",
                color: "#8d99ae",
                fontWeight: "600",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Kategori
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="All">Semua Kategori</option>
              <option value="Makan">Makan</option>
              <option value="Minuman">Minuman</option>
              <option value="Transport">Transport</option>
              <option value="Belanja">Belanja</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label
              style={{
                fontSize: "0.85rem",
                color: "#8d99ae",
                fontWeight: "600",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Dari Tanggal
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ flex: 1, margin: 0 }}>
            <label
              style={{
                fontSize: "0.85rem",
                color: "#8d99ae",
                fontWeight: "600",
                display: "block",
                marginBottom: "5px",
              }}
            >
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <button
              onClick={handleResetFilter}
              className="btn-save"
              style={{ background: "#ffe3e3", color: "#ef233c", width: "100%" }}
            >
              ✖ Reset
            </button>
          </div>
        </div>
      </div>

      {/* --- TOMBOL DOWNLOAD MOBILE --- */}
      <div className="mobile-download-btn">
        <button
          onClick={handleExport}
          className="btn-save"
          style={{
            background: "#20c997",
            width: "100%",
            padding: "16px",
            fontSize: "1.1rem",
          }}
        >
          📥 Download Excel Laporan
        </button>
      </div>

      {/* --- GRID TENGAH (ALIGN STRETCH) --- */}
      <div
        className="main-grid rm-main-grid"
        style={{ marginBottom: "30px", alignItems: "stretch" }}
      >
        {/* Kolom Kiri: Chart (Dihapus class form-card-nya biar tidak double card) */}
        <div
          className="rm-chart-card"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {filtered.length > 0 ? (
            <div
              className="chart-stretcher"
              style={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
            >
              <ExpenseChart expenses={filtered} />
            </div>
          ) : (
            <div
              className="form-card"
              style={{
                flexGrow: 1,
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <p style={{ color: "#888", fontStyle: "italic" }}>
                Tidak ada data pada filter ini.
              </p>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Card Total */}
        <div
          className="total-card rm-total-card"
          style={{
            background: "linear-gradient(135deg, #20c997 0%, #0ca678 100%)",
            margin: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <h3 style={{ opacity: 0.9 }}>Total Transaksi (Filter)</h3>
          <h1 style={{ fontSize: "2.2rem", margin: "10px 0 0 0" }}>
            Rp {totalFiltered.toLocaleString("id-ID")}
          </h1>
          <p style={{ margin: "10px 0 0 0", opacity: 0.8, fontWeight: "500" }}>
            Dari total {filtered.length} catatan.
          </p>
        </div>
      </div>

      {/* --- LIST DATA --- */}
      <div className="transaction-list rm-list">
        <h3 style={{ color: "#111c43", marginBottom: "15px" }}>Rincian Data</h3>
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              background: "white",
              borderRadius: "15px",
              border: "1px dashed #c1c9d2",
            }}
          >
            <p style={{ color: "#888", margin: 0 }}>
              Data tidak ditemukan pada filter ini.
            </p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="transaction-item"
              style={{ borderLeftColor: "#20c997" }}
            >
              <div className="t-info">
                <h4
                  style={{
                    margin: "0 0 5px 0",
                    fontSize: "1.05rem",
                    color: "#2b3674",
                  }}
                >
                  {item.title}
                </h4>
                <span
                  className="t-category"
                  style={{ fontSize: "0.85rem", color: "#a3aed1" }}
                >
                  {item.category} • {item.date.split("T")[0]}
                </span>
              </div>
              <div className="t-amount-action">
                <span
                  className="t-price"
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#2b3674",
                  }}
                >
                  Rp {Number(item.amount).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Report;
