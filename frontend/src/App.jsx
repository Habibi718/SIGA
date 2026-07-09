import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import StudentWizard from "./pages/StudentWizard";
import StudentAIMentor from "./pages/StudentAIMentor";
import StudentPortfolio from "./pages/StudentPortfolio";
import Settings from "./pages/Settings";
import FacultyDashboard from "./pages/FacultyDashboard";
import HODDashboard from "./pages/HODDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if session exists in localStorage
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user, token) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading SIGA...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route
          path="/login"
          element={
            token ? (
              user?.role === "student" ? (
                <Navigate to="/student-dashboard" replace />
              ) : user?.role === "faculty" ? (
                <Navigate to="/faculty-dashboard" replace />
              ) : (
                <Navigate to="/hod-dashboard" replace />
              )
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        {/* STUDENT ROUTES */}
        <Route
          path="/student-dashboard"
          element={
            token && user?.role === "student" ? (
              <StudentDashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/student-portfolio"
          element={
            token && user?.role === "student" ? (
              <StudentPortfolio user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/student-wizard"
          element={
            token && user?.role === "student" ? (
              <StudentWizard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/student-ai-mentor"
          element={
            token && user?.role === "student" ? (
              <StudentAIMentor user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            token && user?.role === "student" ? (
              <Settings user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* FACULTY ROUTES */}
        <Route
          path="/faculty-dashboard"
          element={
            token && user?.role === "faculty" ? (
              <FacultyDashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/faculty-students"
          element={
            token && user?.role === "faculty" ? (
              <FacultyDashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* HOD ROUTES */}
        <Route
          path="/hod-dashboard"
          element={
            token && user?.role === "hod" ? (
              <HODDashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/hod-analytics"
          element={
            token && user?.role === "hod" ? (
              <HODDashboard user={user} token={token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* FALLBACK REDIRECT */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
