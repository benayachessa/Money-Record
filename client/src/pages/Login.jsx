import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (data.success) {
        // Panggil fungsi dari App.jsx (Ini kuncinya!)
        onLogin(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          timer: 1000,
          showConfirmButton: false,
        });
        navigate("/");
      } else {
        Swal.fire({ icon: "error", title: "Gagal!", text: data.message });
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "#f4f7FE",
      }}
    >
      <div
        className="form-card"
        style={{ width: "100%", maxWidth: "400px", padding: "40px" }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "#111c43",
            marginBottom: "30px",
          }}
        >
          💸 Money Record
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="Masukkan username"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              required
            />
          </div>
          <div className="form-group">
            <label style={{ fontSize: "0.9rem", fontWeight: "600" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Masukkan password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="btn-save"
            style={{ width: "100%", marginTop: "10px", background: "#4361ee" }}
          >
            Masuk Sekarang
          </button>
        </form>
        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "0.9rem",
            color: "#a3aed1",
          }}
        >
          Belum punya akun?{" "}
          <Link
            to="/register"
            style={{
              color: "#4361ee",
              fontWeight: "bold",
              textDecoration: "none",
            }}
          >
            Daftar
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
