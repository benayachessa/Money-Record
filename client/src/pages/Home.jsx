import React, { useState, useEffect, useRef } from "react";
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

  // --- STATE KHUSUS FLOATING AI CHAT ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Halo Bos! Ada yang bisa dibantu soal keuangan hari ini?",
    },
  ]);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

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

  const sendMessageToAi = async (textMessage) => {
    if (!textMessage.trim()) return;

    const newMessages = [...messages, { sender: "user", text: textMessage }];
    setMessages(newMessages);
    setChatInput("");
    setIsLoadingAi(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/ai-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: textMessage }),
      });
      const data = await response.json();

      if (data.success) {
        setMessages([...newMessages, { sender: "ai", text: data.reply }]);
      } else {
        setMessages([...newMessages, { sender: "ai", text: data.reply }]);
      }
    } catch (error) {
      setMessages([
        ...newMessages,
        { sender: "ai", text: "Ups, koneksi ke otak AI terputus." },
      ]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });
  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: "", amount: "", category: "", date: "" });
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId
        ? `${API_URL}/expenses/${editId}`
        : `${API_URL}/expenses`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: editId ? "Berhasil diupdate!" : "Berhasil disimpan!",
          timer: 1500,
          showConfirmButton: false,
        });
        if (editId) setEditId(null);
        fetchExpenses();
        setFormData({ title: "", amount: "", category: "", date: "" });
      }
    } catch (error) {
      console.error("Gagal simpan:", error);
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Yakin mau hapus?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef233c",
      confirmButtonText: "Ya, Hapus!",
    });
    if (confirm.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/expenses/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
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
    <div className="dashboard-container" style={{ position: "relative" }}>
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#111c43", margin: 0 }}>Ringkasan Keuangan</h2>
        <p style={{ color: "#a3aed1", marginTop: "5px" }}>
          Kelola pengeluaran harian dengan cerdas.
        </p>
      </header>

      {/* --- GRID STATISTIK ATAS (SUDAH DISERAGAMKAN) --- */}
      <div className="stats-grid" style={{ alignItems: "stretch" }}>
        {/* Card Biru */}
        <div
          className="total-card"
          style={{
            marginBottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "25px",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              margin: 0,
              opacity: 0.9,
              fontWeight: 500,
            }}
          >
            Total Pengeluaran
          </h3>
          <h1 style={{ fontSize: "2.2rem", margin: "10px 0 0 0" }}>
            Rp {totalExpense.toLocaleString("id-ID")}
          </h1>
        </div>

        {/* Card Putih 1 */}
        <div
          className="form-card"
          style={{
            borderLeft: "5px solid #4cc9f0",
            marginBottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "25px",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              color: "#a3aed1",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Rata-rata Transaksi
          </h3>
          <h1
            style={{
              color: "#2b3674",
              fontSize: "2.2rem",
              margin: "10px 0 0 0",
            }}
          >
            Rp{" "}
            {avgExpense.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
          </h1>
        </div>

        {/* Card Putih 2 */}
        <div
          className="form-card"
          style={{
            borderLeft: "5px solid #f72585",
            marginBottom: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "25px",
          }}
        >
          <h3
            style={{
              fontSize: "0.95rem",
              color: "#a3aed1",
              margin: 0,
              fontWeight: 600,
            }}
          >
            Transaksi Terbesar
          </h3>
          <h1
            style={{
              color: "#2b3674",
              fontSize: "2.2rem",
              margin: "10px 0 0 0",
            }}
          >
            Rp {maxExpense.toLocaleString("id-ID")}
          </h1>
        </div>
      </div>

      {/* --- GRID UTAMA (CHART & FORM) --- */}
      <div className="main-grid" style={{ alignItems: "stretch" }}>
        {/* Kolom Kiri: Chart */}
        <div className="left-column">
          <div
            className="form-card"
            style={{
              height: "100%",
              margin: 0,
              display: "flex",
              flexDirection: "column",
              padding: "25px",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#111c43",
                textAlign: "center",
              }}
            >
              📊 Statistik Pengeluaran
            </h3>
            <div
              style={{
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {expenses.length > 0 ? (
                <div style={{ width: "100%" }}>
                  <ExpenseChart expenses={expenses} />
                </div>
              ) : (
                <p style={{ color: "#888", fontStyle: "italic" }}>
                  Belum ada data untuk ditampilkan.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Form Input */}
        <div className="right-column">
          <div
            className="form-card"
            style={{ height: "100%", margin: 0, padding: "25px" }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#111c43",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {editId ? "✏️ Edit Data" : "➕ Input Data"}
            </h3>
            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <input
                  type="text"
                  name="title"
                  placeholder="Keterangan"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <input
                  type="number"
                  name="amount"
                  placeholder="Nominal"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
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
              <div className="form-group" style={{ margin: 0 }}>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
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
                    style={{ flex: 0.5, background: "#8d99ae" }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* --- RIWAYAT TRANSAKSI --- */}
      <div className="transaction-list" style={{ marginTop: "30px" }}>
        <h3 style={{ color: "#111c43", marginBottom: "20px" }}>
          Aktivitas Terbaru
        </h3>
        {expenses.map((item) => (
          <div
            key={item.id}
            className="transaction-item"
            style={{ padding: "15px 20px" }}
          >
            {/* Kiri: Info Transaksi */}
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

            {/* Kanan: Harga & Tombol Aksi */}
            <div
              className="t-amount-action"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              <span
                className="t-price"
                style={{
                  margin: 0,
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  color: "#ef233c",
                }}
              >
                - Rp {Number(item.amount).toLocaleString("id-ID")}
              </span>
              <div
                style={{ display: "flex", gap: "12px", alignItems: "center" }}
              >
                <button
                  onClick={() => handleEditClick(item)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#fca311",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem",
                    padding: 0,
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn-delete"
                  style={{
                    padding: "5px 12px",
                    fontSize: "0.8rem",
                    borderRadius: "6px",
                  }}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ==================================================== */}
      {/* FLOATING AI CHAT WIDGET (TIDAK ADA YANG DIUBAH) */}
      {/* ==================================================== */}
      {isChatOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "90px",
            right: "30px",
            width: "350px",
            height: "500px",
            background: "white",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(17,28,67,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 1000,
            overflow: "hidden",
            border: "1px solid #e0e5f2",
          }}
        >
          <div
            style={{
              background: "#4361ee",
              padding: "15px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              ✨ AI Advisor
            </h4>
            <button
              onClick={() => setIsChatOpen(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              ✖
            </button>
          </div>
          <div
            style={{
              padding: "10px",
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              background: "#f8f9fa",
              borderBottom: "1px solid #e0e5f2",
            }}
          >
            <button
              onClick={() =>
                sendMessageToAi(
                  "Tolong analisis total pengeluaran saya bulan ini dan beri masukan.",
                )
              }
              style={{
                padding: "6px 12px",
                fontSize: "0.75rem",
                borderRadius: "20px",
                border: "1px solid #4361ee",
                background: "white",
                color: "#4361ee",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              📊 Analisis Pengeluaran
            </button>
            <button
              onClick={() =>
                sendMessageToAi(
                  "Di kategori mana saya paling boros? Kasih tips hemat dong.",
                )
              }
              style={{
                padding: "6px 12px",
                fontSize: "0.75rem",
                borderRadius: "20px",
                border: "1px solid #f72585",
                background: "white",
                color: "#f72585",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              💸 Cek Keborosan
            </button>
          </div>
          <div
            style={{
              flex: 1,
              padding: "15px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              background: "#f4f7fe",
            }}
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "85%",
                }}
              >
                <div
                  style={{
                    background: msg.sender === "user" ? "#4361ee" : "white",
                    color: msg.sender === "user" ? "white" : "#2b3674",
                    padding: "10px 15px",
                    borderRadius: "15px",
                    borderBottomRightRadius: msg.sender === "user" ? 0 : "15px",
                    borderBottomLeftRadius: msg.sender === "ai" ? 0 : "15px",
                    boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoadingAi && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "white",
                  padding: "10px 15px",
                  borderRadius: "15px",
                  borderBottomLeftRadius: 0,
                  fontSize: "0.9rem",
                  color: "#8d99ae",
                }}
              >
                AI sedang mengetik...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessageToAi(chatInput);
            }}
            style={{
              padding: "10px",
              background: "white",
              borderTop: "1px solid #e0e5f2",
              display: "flex",
              gap: "10px",
            }}
          >
            <input
              type="text"
              placeholder="Tanya sesuatu..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "20px",
                border: "1px solid #e0e5f2",
                outline: "none",
                fontSize: "0.9rem",
              }}
            />
            <button
              type="submit"
              disabled={isLoadingAi || !chatInput.trim()}
              style={{
                background: "#4361ee",
                color: "white",
                border: "none",
                padding: "0 15px",
                borderRadius: "20px",
                cursor: isLoadingAi ? "not-allowed" : "pointer",
              }}
            >
              Kirim
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #4361ee 0%, #3f37c9 100%)",
          color: "white",
          borderRadius: "50%",
          border: "none",
          boxShadow: "0 5px 20px rgba(67,97,238,0.4)",
          fontSize: "1.8rem",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
      >
        {isChatOpen ? "✖" : "✨"}
      </button>
    </div>
  );
};

export default Home;
