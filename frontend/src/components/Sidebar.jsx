import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Sidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (path) => {
    navigate(path);
  };

  const activeClass = (path) => {
    return location.pathname === path ? "nav-item active" : "nav-item";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">
          <i className="fas fa-bolt" style={{ color: "#fff" }}></i>
        </div>
        <span className="logo-text">SIGA</span>
      </div>

      <ul className="nav-links">
        {user?.role === "student" && (
          <>
            <li className={activeClass("/student-dashboard")} onClick={() => handleNav("/student-dashboard")}>
              <i className="fas fa-home nav-icon"></i>
              <span>Dashboard</span>
            </li>
            <li className={activeClass("/student-portfolio")} onClick={() => handleNav("/student-portfolio")}>
              <i className="fas fa-user nav-icon"></i>
              <span>View Portfolio</span>
            </li>
            <li className={activeClass("/student-wizard")} onClick={() => handleNav("/student-wizard")}>
              <i className="fas fa-user-edit nav-icon"></i>
              <span>Edit Portfolio</span>
            </li>
            <li className={activeClass("/student-ai-mentor")} onClick={() => handleNav("/student-ai-mentor")}>
              <i className="fas fa-brain nav-icon"></i>
              <span>Ask AI Mentor</span>
            </li>
            <li className={activeClass("/settings")} onClick={() => handleNav("/settings")}>
              <i className="fas fa-cog nav-icon"></i>
              <span>Settings</span>
            </li>
          </>
        )}

        {user?.role === "faculty" && (
          <>
            <li className={activeClass("/faculty-dashboard")} onClick={() => handleNav("/faculty-dashboard")}>
              <i className="fas fa-chart-line nav-icon"></i>
              <span>Dashboard</span>
            </li>
          </>
        )}

        {user?.role === "hod" && (
          <>
            <li className={activeClass("/hod-dashboard")} onClick={() => handleNav("/hod-dashboard")}>
              <i className="fas fa-chart-line nav-icon"></i>
              <span>Dashboard</span>
            </li>
          </>
        )}

        {/* Separator / Logout */}
        <li className="nav-item" onClick={onLogout} style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
          <i className="fas fa-sign-out-alt nav-icon"></i>
          <span>Logout</span>
        </li>
      </ul>

      <div className="sidebar-footer">
        <div className="user-avatar">{getInitials(user?.fullName)}</div>
        <div>
          <div className="user-name">{user?.fullName || "User Name"}</div>
          <div className="user-info">
            {user?.role?.toUpperCase()} {user?.semester ? `• ${user.semester}` : ""}
          </div>
        </div>
      </div>
    </aside>
  );
}
