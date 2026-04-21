import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const Register = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        Swal.fire({ icon: "success", title: "Akun Terdaftar!", text: "Silakan login Bos.", timer: 2000 });
        navigate("/login");
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: data.message });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error!", text: "Gagal terhubung ke server." });
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f4f7FE" }}>
      <div className="form-card" style={{ width: "100%", maxWidth: "400px", padding: "40px" }}>
        <h2 style={{ textAlign: "center", color: "#111c43", marginBottom: "30px" }}>Buat Akun Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>Pilih Username</label>
            <input type="text" placeholder="Contoh: chesa_kece" onChange={(e) => setFormData({...formData, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>Password</label>
            <input type="password" placeholder="Minimal 6 karakter" onChange={(e) => setFormData({...formData, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn-save" style={{ width: "100%", marginTop: "10px", background: "#20c997" }}>Daftar Akun</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.9rem", color: "#a3aed1" }}>
          Sudah punya akun? <Link to="/login" style={{ color: "#4361ee", fontWeight: "bold", textDecoration: "none" }}>Login di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;