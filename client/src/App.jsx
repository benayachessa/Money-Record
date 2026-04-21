import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

function App() {
  const [authToken, setAuthToken] = useState(localStorage.getItem("token"));

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setAuthToken(token);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthToken(null);
  };

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!authToken ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
      />
      <Route 
        path="/register" 
        element={!authToken ? <Register /> : <Navigate to="/" />} 
      />

      <Route
        path="/*"
        element={
          authToken ? (
            <div className="app-layout">
              <Sidebar onLogout={handleLogout} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/report" element={<Report />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;