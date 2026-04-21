import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = ({ onLogout }) => {
  const location = useLocation();

  return (
    <nav className="sidebar">
      <div className="sidebar-brand">
        <h2>💸 Money Record</h2>
      </div>

      <div className="sidebar-menu">
        <Link
          to="/"
          className={`menu-item ${location.pathname === "/" ? "active" : ""}`}
        >
          Dashboard
        </Link>
        <Link
          to="/report"
          className={`menu-item ${location.pathname === "/report" ? "active" : ""}`}
        >
          Laporan
        </Link>
        <Link
          to="/profile"
          className={`menu-item ${location.pathname === "/profile" ? "active" : ""}`}
        >
          Profil
        </Link>
      </div>
      {/* Tombol Logout */}
      <button onClick={onLogout} className="menu-item logout-btn">
        Keluar
      </button>
    </nav>
  );
};

export default Sidebar;
