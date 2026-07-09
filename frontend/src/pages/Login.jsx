import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";

export default function Login({ onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState("student");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please enter User ID and Password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Connect to MERN auth endpoint
      const res = await axios.post("http://localhost:5001/api/auth/login", {
        username,
        password,
      });

      const { token, user } = res.data;

      // Verify that user role matches chosen role (safety check)
      if (user.role !== selectedRole) {
        setError(`This credential belongs to a ${user.role}. Please select the correct tab.`);
        setLoading(false);
        return;
      }

      onLoginSuccess(user, token);

      // Routing logic
      if (user.role === "student") {
        // Fetch portfolio to check if completed
        try {
          const portRes = await axios.get("http://localhost:5001/api/portfolio/my", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const hasDetails = portRes.data?.personalInfo?.email !== "";
          if (hasDetails) {
            navigate("/student-dashboard");
          } else {
            navigate("/student-wizard");
          }
        } catch (portErr) {
          navigate("/student-wizard");
        }
      } else if (user.role === "faculty") {
        navigate("/faculty-dashboard");
      } else if (user.role === "hod") {
        navigate("/hod-dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Authentication failed. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-scope" style={{ minHeight: "100vh", display: "flex", alignItems: "center", width: "100%" }}>
      <div className="background">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="blob blob3"></div>
      </div>

      <div className="container" style={{ width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        {/* LEFT BRAND SECTION */}
        <div className="left">
          <div className="brand">
            <h1>SIGA</h1>
            <h2>Student Innovation Growth Agent</h2>
            <p>
              Empowering Innovation.<br />
              Tracking Excellence.
            </p>
          </div>

          <div className="stats">
            <div className="card">
              <h3>650+</h3>
              <span>Students</span>
            </div>
            <div className="card">
              <h3>220+</h3>
              <span>Projects</span>
            </div>
            <div className="card">
              <h3>98+</h3>
              <span>Research Papers</span>
            </div>
            <div className="card">
              <h3>5000+</h3>
              <span>Certificates</span>
            </div>
          </div>
        </div>

        {/* RIGHT LOGIN CARD */}
        <div className="right">
          <div className="login-card">
            <div className="brand-header">
              <p className="university-name">JSPM UNIVERSITY</p>
              <h2>
                {selectedRole === "student" && "Student Login"}
                {selectedRole === "faculty" && "Faculty Login"}
                {selectedRole === "hod" && "HOD Login"}
              </h2>
              <p className="subtitle">
                {selectedRole === "student" && "Login using your PRN"}
                {selectedRole === "faculty" && "Login using Employee ID"}
                {selectedRole === "hod" && "Head of Department Login"}
              </p>
            </div>

            <div className="roles">
              <div className={`role ${selectedRole === "student" ? "active" : ""}`} onClick={() => handleRoleChange("student")}>
                <i className="fa-solid fa-user-graduate"></i> Student
              </div>
              <div className={`role ${selectedRole === "faculty" ? "active" : ""}`} onClick={() => handleRoleChange("faculty")}>
                <i className="fa-solid fa-chalkboard-user"></i> Faculty
              </div>
              <div className={`role ${selectedRole === "hod" ? "active" : ""}`} onClick={() => handleRoleChange("hod")}>
                <i className="fa-solid fa-building-columns"></i> HOD
              </div>
            </div>

            {error && <div className="error-alert" style={{ color: "#FF6B6B", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="input-box">
                <label>User ID</label>
                <input
                  type="text"
                  placeholder={selectedRole === "student" ? "PRN (e.g. 241001)" : "Employee ID (e.g. faculty)"}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-box">
                <label>Password</label>
                <div className="password">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <i
                    className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer" }}
                  ></i>
                </div>
              </div>

              <div className="remember">
                <label>
                  <input type="checkbox" style={{ marginRight: "6px" }} /> Remember me
                </label>
                <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
              </div>

              <button className="login-btn" type="submit" disabled={loading}>
                {loading ? "Authenticating..." : "Login"}
              </button>
            </form>

            <div className="footer">Innovation Starts Here 🚀</div>
          </div>
        </div>
      </div>
    </div>
  );
}
