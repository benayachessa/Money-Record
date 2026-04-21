import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import ExpenseChart from "../components/ExpenseChart";

const Home = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [expenses, setExpenses] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    date: "",
  });

  // State khusus untuk AI
  const [aiTip, setAiTip] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);

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
      console.error("Error:", error);
    }
  };

  // --- FUNGSI MENGHUBUNGI AI (Sudah Bawa Token) ---
  const fetchAiTip = async () => {
    setIsLoadingAi(true);
    setAiTip("Hmm.. sebentar, AI sedang menganalisis catatan keuanganmu...");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/ai-tips`, {
        headers: {
          Authorization: `Bearer ${token}`, // PERBAIKAN: Tambah token ke AI
        },
      });
      const data = await response.json();

      if (data.success) {
        setAiTip(data.tip);
      } else {
        setAiTip("Waduh, AI lagi ngambek. Coba lagi nanti ya.");
      }
    } catch (error) {
      console.error("Gagal konek AI:", error);
      setAiTip(
        "Koneksi ke otak AI terputus. Pastikan server nyala dan internet jalan.",
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Logika Form & CRUD
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditClick = (item) => {
    setEditId(item.id);
    setFormData({
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: item.date.split("T")[0],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- FUNGSI BATAL EDIT ---
  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: "", amount: "", category: "", date: "" });
  };

  // --- FUNGSI SUBMIT (DUA MODE: POST & PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      if (editId) {
        // MODE EDIT (PUT)
        const response = await fetch(`${API_URL}/expenses/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Berhasil diupdate!",
            timer: 1500,
            showConfirmButton: false,
          });
          setEditId(null); // Keluar dari mode edit
        }
      } else {
        // MODE TAMBAH BARU (POST)
        const response = await fetch(`${API_URL}/expenses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          Swal.fire({
            icon: "success",
            title: "Berhasil disimpan!",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      }

      // Refresh data & bersihkan form
      fetchExpenses();
      setFormData({ title: "", amount: "", category: "", date: "" });
    } catch (error) {
      console.error("Gagal simpan:", error);
    }
  };

  // --- FUNGSI HAPUS ---
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin mau hapus?",
      text: "Data yang dihapus nggak bisa balik lagi lho!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef233c",
      cancelButtonColor: "#8d99ae",
      confirmButtonText: "Ya, Hapus!",
    });

    if (confirm.isConfirmed) {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_URL}/expenses/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          Swal.fire("Terhapus!", "Datamu sudah lenyap.", "success");
          fetchExpenses();
        }
      } catch (error) {
        console.error("Gagal hapus:", error);
      }
    }
  };

  // Kalkulasi Statistik
  const totalExpense = expenses.reduce(
    (acc, curr) => acc + Number(curr.amount),
    0,
  );
  const avgExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
  const maxExpense =
    expenses.length > 0
      ? Math.max(...expenses.map((e) => Number(e.amount)))
      : 0;

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#111c43", margin: 0 }}>Ringkasan Keuangan</h2>
        <p style={{ color: "#a3aed1" }}>
          Kelola pengeluaran harian dengan cerdas.
        </p>
      </header>

      {/* Grid Statistik Atas */}
      <div className="stats-grid">
        <div className="total-card">
          <h3>Total Pengeluaran</h3>
          <h1>Rp {totalExpense.toLocaleString("id-ID")}</h1>
        </div>
        <div
          className="form-card"
          style={{ borderLeft: "5px solid #4cc9f0", marginBottom: 0 }}
        >
          <h3 style={{ fontSize: "0.85rem", color: "#a3aed1" }}>
            Rata-rata Transaksi
          </h3>
          <h2 style={{ color: "#2b3674" }}>
            Rp{" "}
            {avgExpense.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </h2>
        </div>
        <div
          className="form-card"
          style={{ borderLeft: "5px solid #f72585", marginBottom: 0 }}
        >
          <h3 style={{ fontSize: "0.85rem", color: "#a3aed1" }}>
            Transaksi Terbesar
          </h3>
          <h2 style={{ color: "#2b3674" }}>
            Rp {maxExpense.toLocaleString("id-ID")}
          </h2>
        </div>
      </div>

      {/* Grid Utama: Chart, AI, & Form */}
      <div className="main-grid">
        <div className="left-column">
          <ExpenseChart expenses={expenses} />

          {/* AI Financial Tips */}
          <div
            className="form-card"
            style={{ background: "#f0f3ff", border: "1px dashed #4361ee" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h3
                style={{
                  color: "#4361ee",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                ✨ AI Advisor
              </h3>

              <button
                onClick={fetchAiTip}
                disabled={isLoadingAi}
                style={{
                  background: isLoadingAi ? "#a3aed1" : "#4361ee",
                  color: "white",
                  border: "none",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  cursor: isLoadingAi ? "not-allowed" : "pointer",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  boxShadow: "0 2px 5px rgba(67, 97, 238, 0.2)",
                }}
              >
                {isLoadingAi ? "Mikir..." : "Analisis Sekarang"}
              </button>
            </div>

            <p
              style={{
                fontSize: "0.95rem",
                color: "#2b3674",
                lineHeight: "1.6",
                margin: 0,
                fontStyle: aiTip ? "normal" : "italic",
              }}
            >
              {aiTip ||
                "Klik tombol 'Analisis Sekarang' untuk mendapatkan *insight* langsung dari AI berdasarkan riwayat pengeluaranmu."}
            </p>
          </div>
        </div>

        <div className="right-column">
          <div className="form-card">
            <h3 style={{ marginBottom: "20px", color: "#111c43" }}>
              {editId ? "✏️ Edit Data" : "➕ Input Data"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  name="title"
                  placeholder="Keterangan"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="number"
                  name="amount"
                  placeholder="Nominal"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
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

              {/* PERBAIKAN: Tombol Batal muncul saat mode edit */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  className="btn-save"
                  style={{
                    flex: 1,
                    background: editId ? "#fca311" : "#4361ee",
                  }}
                >
                  {editId ? "Update Data" : "Simpan"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="btn-save"
                    style={{
                      flex: 0.5,
                      background: "#8d99ae",
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Riwayat Transaksi */}
      <div className="transaction-list" style={{ marginTop: "30px" }}>
        <h3 style={{ color: "#111c43", marginBottom: "15px" }}>
          Aktivitas Terbaru
        </h3>
        {expenses.map((item) => (
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
                <button
                  onClick={() => handleEditClick(item)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fca311",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-delete"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
