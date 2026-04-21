import React, { useEffect, useState } from "react";

const Profile = () => {
  const [user, setUser] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetch(`${API_URL}/profile`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => res.json())
      .then(data => setUser(data.user));
  }, []);

  if (!user) return <p>Loading profil...</p>;

  return (
    <div className="dashboard-container">
      <h2 style={{ color: "#111c43" }}>👤 Profil Pengguna</h2>
      <div className="form-card" style={{ maxWidth: "500px", marginTop: "20px" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{ width: "80px", height: "80px", background: "#4361ee", borderRadius: "50%", margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", color: "white", fontSize: "2rem" }}>
            {user.username.charAt(0).toUpperCase()}
          </div>
        </div>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Bergabung Sejak:</strong> {new Date(user.created_at).toLocaleDateString("id-ID")}</p>
        <hr style={{ border: "0.5px solid #eee", margin: "20px 0" }} />
        <p style={{ fontSize: "0.85rem", color: "#a3aed1" }}>ID Akun: #MR-{user.id}</p>
      </div>
    </div>
  );
};

export default Profile;