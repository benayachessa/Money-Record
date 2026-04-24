import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";

const Profile = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  // State dengan nilai awal object kosong agar aman dari error undefined
  const [profile, setProfile] = useState({});
  const [editName, setEditName] = useState("");
  const [previewAvatar, setPreviewAvatar] = useState("");
  const [loading, setLoading] = useState(true);

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();

      // === TRIK DEWA: DETEKSI OTOMATIS FORMAT DATA ===
      let userData = null;

      // KITA TAMBAHKAN PENANGKAP 'data.user' DI SINI BOS! 👇
      if (data.success && data.user) {
        userData = data.user;
      } else if (data.success && data.data) {
        userData = data.data;
      } else if (data.username) {
        userData = data;
      } else if (Array.isArray(data) && data.length > 0) {
        userData = data[0];
      }

      // Jika data berhasil ditangkap
      if (userData) {
        setProfile(userData);
        setEditName(userData.username || "");
        setPreviewAvatar(userData.avatar || "");
      } else {
        console.error("❌ DATA DARI SERVER KOSONG ATAU FORMAT ANEH:", data);
      }
    } catch (error) {
      console.error("❌ ERROR JARINGAN:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        Swal.fire("Kegedean Bos!", "Maksimal ukuran foto 2MB ya.", "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ username: editName, avatar: previewAvatar }),
      });
      const data = await response.json();
      if (data.success) {
        Swal.fire({
          icon: "success",
          title: "Profil Diperbarui!",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchProfile();
      } else {
        Swal.fire("Gagal", data.message || "Gagal menyimpan data", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Gagal menghubungi server", "error");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire("Oops!", "Konfirmasi password tidak cocok!", "warning");
      return;
    }
    try {
      const response = await fetch(`${API_URL}/profile/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          oldPassword: passwords.oldPassword,
          newPassword: passwords.newPassword,
        }),
      });
      const data = await response.json();
      if (data.success) {
        Swal.fire("Berhasil!", "Password sudah diganti.", "success");
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        Swal.fire("Gagal", data.message, "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server tidak merespons", "error");
    }
  };

  // Tampilan layar memuat data
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px", color: "#a3aed1" }}>
        <h3>Membaca data profil...</h3>
      </div>
    );
  }

  // Safely format tanggal (Mencegah crash kalau created_at tidak ada)
  const joinDate = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "-";

  return (
    <div className="dashboard-container">
      <header style={{ marginBottom: "30px" }}>
        <h2 style={{ color: "#111c43", margin: 0 }}>Pengaturan Profil</h2>
        <p style={{ color: "#a3aed1", marginTop: "5px" }}>
          Kelola identitas dan keamanan akunmu.
        </p>
      </header>

      <div className="main-grid" style={{ alignItems: "start" }}>
        <div className="left-column">
          <div
            className="form-card"
            style={{ textAlign: "center", padding: "40px 20px" }}
          >
            <div
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                margin: "0 auto 20px auto",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  backgroundColor: "#4361ee",
                  color: "white",
                  fontSize: "3rem",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundImage: previewAvatar
                    ? `url(${previewAvatar})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  overflow: "hidden",
                  border: "4px solid #f4f7fe",
                  boxShadow: "0 10px 25px rgba(67, 97, 238, 0.2)",
                }}
              >
                {!previewAvatar &&
                  (profile.username
                    ? profile.username.charAt(0).toUpperCase()
                    : "U")}
              </div>
              <label
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: "#fca311",
                  color: "white",
                  width: "35px",
                  height: "35px",
                  borderRadius: "50%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  cursor: "pointer",
                  border: "3px solid white",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                }}
              >
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
            <h2 style={{ color: "#111c43", margin: "0 0 5px 0" }}>
              {profile.username || "User"}
            </h2>
            <p style={{ color: "#a3aed1", margin: 0, fontSize: "0.9rem" }}>
              Bergabung: {joinDate}
            </p>
            <div
              style={{
                background: "#f8f9fa",
                padding: "10px",
                borderRadius: "10px",
                marginTop: "20px",
                border: "1px dashed #c1c9d2",
              }}
            >
              <span
                style={{
                  color: "#8d99ae",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                }}
              >
                ID Akun: #MR-{profile.id || "-"}
              </span>
            </div>
          </div>
        </div>

        <div className="right-column">
          <div className="form-card" style={{ marginBottom: "25px" }}>
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#111c43",
                borderBottom: "1px solid #e0e5f2",
                paddingBottom: "15px",
              }}
            >
              👤 Informasi Dasar
            </h3>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label
                  style={{
                    fontSize: "0.85rem",
                    color: "#8d99ae",
                    fontWeight: "600",
                    display: "block",
                    marginBottom: "5px",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-save"
                style={{ background: "#4361ee", width: "100%" }}
              >
                💾 Simpan Perubahan
              </button>
            </form>
          </div>

          <div className="form-card">
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#111c43",
                borderBottom: "1px solid #e0e5f2",
                paddingBottom: "15px",
              }}
            >
              🔒 Keamanan Akun
            </h3>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <input
                  type="password"
                  name="oldPassword"
                  placeholder="Password Lama"
                  value={passwords.oldPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, oldPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="Password Baru"
                  value={passwords.newPassword}
                  onChange={(e) =>
                    setPasswords({ ...passwords, newPassword: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi Password Baru"
                  value={passwords.confirmPassword}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-save"
                style={{ background: "#f72585", width: "100%" }}
              >
                🔑 Ganti Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
