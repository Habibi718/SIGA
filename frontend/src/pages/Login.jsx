import { API_URL } from "../config";
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

  // Signup states
  const [isSignup, setIsSignup] = useState(false);
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("Sem 4");

  const navigate = useNavigate();

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setIsSignup(false); // Reset to login mode when switching roles
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
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password,
      });

      const { token, user } = res.data;

      if (user.role !== selectedRole) {
        setError(`This credential belongs to a ${user.role}. Please select the correct tab.`);
        setLoading(false);
        return;
      }

      onLoginSuccess(user, token);

      if (user.role === "student") {
        try {
          const portRes = await axios.get(`${API_URL}/api/portfolio/my`, {
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
      } else if (user.role === "admin") {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error(err);
      let errMsg = err.response?.data?.msg || "Authentication failed. Check your connection.";
      if (selectedRole === "student" && errMsg === "Invalid Credentials") {
        errMsg = "Invalid credentials. If you are a new student, please click 'Create an account' below to sign up!";
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!username || !password || !fullName) {
      setError("Please fill in all required fields.");
      return;
    }

    // Validate college-affiliated email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      setError("Please enter a valid college email address (e.g. name@jspm.edu.in)");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        password,
        role: "student",
        fullName,
        department,
        semester,
      });

      const { token, user } = res.data;
      onLoginSuccess(user, token);
      
      // Redirect new students to the Portfolio Wizard to complete profile
      navigate("/student-wizard");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || "Registration failed. Try again.");
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

        {/* RIGHT LOGIN / SIGNUP CARD */}
        <div className="right">
          <div className="login-card">
            <div className="brand-header">
              <p className="university-name">JSPM UNIVERSITY</p>
              <h2>
                {isSignup 
                  ? "Student Registration" 
                  : `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Login`
                }
              </h2>
              <p className="subtitle">
                {isSignup 
                  ? "Create a new student account using your college email" 
                  : selectedRole === "student" 
                    ? "Login using your PRN or email" 
                    : selectedRole === "admin"
                      ? "System Administrator Login"
                      : `${selectedRole.toUpperCase()} Login`
                }
              </p>
            </div>

            {/* Role Tabs - Only visible in Login Mode */}
            {!isSignup && (
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
                <div className={`role ${selectedRole === "admin" ? "active" : ""}`} onClick={() => handleRoleChange("admin")}>
                  <i className="fa-solid fa-user-shield"></i> Admin
                </div>
              </div>
            )}

            {error && <div className="error-alert" style={{ color: "#FF6B6B", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{error}</div>}

            <form onSubmit={isSignup ? handleSignup : handleLogin}>
              {isSignup && (
                <div className="input-box">
                  <label>Full Name</label>
                  <input
                    type="text"
                    placeholder="E.g. Rahul Patil"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="input-box">
                <label>{isSignup ? "College Email" : "User ID / Email"}</label>
                <input
                  type="text"
                  placeholder={isSignup 
                    ? "E.g. rahul.patil@jspm.edu.in" 
                    : selectedRole === "student"
                      ? "PRN or College Email"
                      : selectedRole === "admin"
                        ? "Admin Username"
                        : "Employee ID"
                  }
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              {isSignup && (
                <>
                  <div className="input-box">
                    <label>Department</label>
                    <input
                      type="text"
                      placeholder="E.g. AI & ML"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    />
                  </div>
                  <div className="input-box">
                    <label>Semester</label>
                    <select value={semester} onChange={(e) => setSemester(e.target.value)}>
                      <option value="Sem 1">Semester 1</option>
                      <option value="Sem 2">Semester 2</option>
                      <option value="Sem 3">Semester 3</option>
                      <option value="Sem 4">Semester 4</option>
                      <option value="Sem 5">Semester 5</option>
                      <option value="Sem 6">Semester 6</option>
                      <option value="Sem 7">Semester 7</option>
                      <option value="Sem 8">Semester 8</option>
                    </select>
                  </div>
                </>
              )}

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

              {!isSignup && (
                <div className="remember">
                  <label>
                    <input type="checkbox" style={{ marginRight: "6px" }} /> Remember me
                  </label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
                </div>
              )}

              <button className="login-btn" type="submit" disabled={loading}>
                {loading 
                  ? "Processing..." 
                  : isSignup 
                    ? "Register & Sign Up" 
                    : "Login"
                }
              </button>

              {/* Signup toggles - only for Student role */}
              {selectedRole === "student" && (
                <div style={{ textAlign: "center", marginTop: "16px", fontSize: "14px" }}>
                  {isSignup ? (
                    <span style={{ color: "#cbd5e1" }}>
                      Already have an account?{" "}
                      <a href="#login" onClick={(e) => { e.preventDefault(); setIsSignup(false); setError(""); }} style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>
                        Log in here
                      </a>
                    </span>
                  ) : (
                    <span style={{ color: "#cbd5e1" }}>
                      New Student?{" "}
                      <a href="#signup" onClick={(e) => { e.preventDefault(); setIsSignup(true); setError(""); }} style={{ color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>
                        Create an account
                      </a>
                    </span>
                  )}
                </div>
              )}
            </form>

            <div className="footer">Innovation Starts Here 🚀</div>
          </div>
        </div>
      </div>
    </div>
  );
}
