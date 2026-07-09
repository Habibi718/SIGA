import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function FacultyDashboard({ user, token, onLogout }) {
  const [students, setStudents] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStudentsData = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/portfolio/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(res.data);

      // Parse all pending items across all portfolios
      const pending = [];
      res.data.forEach((student) => {
        const types = ["projects", "hackathons", "research", "internships", "certificates", "achievements"];
        types.forEach((type) => {
          if (student[type]) {
            student[type].forEach((item) => {
              if (item.verificationStatus === "Pending") {
                pending.push({
                  studentId: student.studentId,
                  studentName: student.fullName,
                  itemType: type,
                  itemId: item._id,
                  title: item.title || item.name || "Achievement Item",
                  detail: item.techStack || item.issuer || item.company || item.description || "",
                });
              }
            });
          }
        });
      });
      setPendingItems(pending);
    } catch (err) {
      console.error("Error loading students list:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsData();
  }, [token]);

  const handleVerify = async (studentId, itemType, itemId, status) => {
    try {
      await axios.post(
        `${API_URL}/api/portfolio/verify-item`,
        { studentId, itemType, itemId, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Item successfully ${status === "Approved" ? "approved" : "rejected"}!`);
      fetchStudentsData();
    } catch (err) {
      console.error("Verification failed:", err);
      alert("Verification update failed.");
    }
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading faculty database...</div>;
  }

  // Summary Metrics
  const totalCount = students.length;
  const pendingCount = pendingItems.length;
  const avgScore = totalCount > 0 ? Math.round(students.reduce((acc, curr) => acc + curr.innovationScore, 0) / totalCount) : 0;

  const getLevelClass = (score) => {
    if (score >= 90) return "level-expert";
    if (score >= 80) return "level-advanced";
    if (score >= 60) return "level-growing";
    return "level-beginner";
  };

  const getLevelLabel = (score) => {
    if (score >= 90) return "Expert";
    if (score >= 80) return "Advanced";
    if (score >= 60) return "Growing";
    return "Beginner";
  };

  return (
    <div className="faculty-dashboard-scope">
      <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>Faculty Dashboard</h1>
              <p className="subtitle">Division A · Computer Science · Semester 4</p>
            </div>
            <div className="filter-bar">
              <select style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "#fff", padding: "8px", borderRadius: "6px" }}>
                <option>All Divisions</option>
                <option>Div A</option>
                <option>Div B</option>
              </select>
              <select style={{ background: "var(--bg3)", border: "1px solid var(--border)", color: "#fff", padding: "8px", borderRadius: "6px", marginLeft: "12px" }}>
                <option>Sem 4</option>
                <option>Sem 3</option>
                <option>Sem 2</option>
              </select>
            </div>
          </div>

          {/* KPI METRICS ROW */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val">{totalCount}</div>
              <div className="kpi-label">Total Students</div>
            </div>
            <div className="kpi-card accent">
              <div className="kpi-val">{avgScore}%</div>
              <div className="kpi-label">Avg Innovation Index</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">{students.filter(s => s.innovationScore >= 80).length}</div>
              <div className="kpi-label">High Innovators</div>
            </div>
            <div className="kpi-card danger">
              <div className="kpi-val">{students.filter(s => s.innovationScore < 60).length}</div>
              <div className="kpi-label">Need Mentoring</div>
            </div>
          </div>

          {/* RANKINGS TABLE */}
          <div className="chart-card full" style={{ marginBottom: "32px" }}>
            <div className="card-header">
              <h3>
                <i className="fas fa-list-ol" style={{ color: "var(--purple)", marginRight: "8px" }}></i>
                Student Rankings
              </h3>
              <span className="badge">Innovation Score</span>
            </div>
            <table className="rank-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Level</th>
                  <th>Projects</th>
                  <th>Papers</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s, idx) => (
                  <tr key={s._id}>
                    <td>
                      {idx === 0 ? (
                        <i className="fas fa-trophy" style={{ color: "var(--yellow)" }}></i>
                      ) : idx === 1 ? (
                        <i className="fas fa-medal" style={{ color: "#bdc3c7" }}></i>
                      ) : idx === 2 ? (
                        <i className="fas fa-medal" style={{ color: "#cd7f32" }}></i>
                      ) : (
                        idx + 1
                      )}
                    </td>
                    <td style={{ fontWeight: "600" }}>{s.fullName}</td>
                    <td style={{ color: "var(--cyan)", fontWeight: "700" }}>{s.innovationScore}%</td>
                    <td>
                      <span className={`level-pill ${getLevelClass(s.innovationScore)}`}>
                        {getLevelLabel(s.innovationScore)}
                      </span>
                    </td>
                    <td>{s.projects?.length || 0}</td>
                    <td>{s.research?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* VERIFICATION QUEUE */}
          <div className="chart-card full" style={{ marginBottom: "32px" }}>
            <div className="card-header">
              <h3>
                <i className="fas fa-check-double" style={{ color: "var(--green)", marginRight: "8px" }}></i>
                Verification Queue
              </h3>
              <span className="badge pending-badge">{pendingCount} Pending</span>
            </div>
            <div className="verify-list">
              {pendingItems.length > 0 ? (
                pendingItems.map((item, idx) => (
                  <div key={idx} className="verify-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: "8px", marginBottom: "12px" }}>
                    <div className="verify-info">
                      <strong style={{ color: "var(--cyan)" }}>{item.studentName}</strong> —{" "}
                      <span style={{ textTransform: "capitalize", color: "var(--purple)", fontWeight: "600" }}>{item.itemType}</span>: "{item.title}" ({item.detail})
                    </div>
                    <div className="verify-actions" style={{ display: "flex", gap: "12px" }}>
                      <button className="btn-approve" onClick={() => handleVerify(item.studentId, item.itemType, item.itemId, "Approved")} style={{ background: "#6BCB77", border: "none", color: "#fff", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                        ✓ Approve
                      </button>
                      <button className="btn-reject" onClick={() => handleVerify(item.studentId, item.itemType, item.itemId, "Rejected")} style={{ background: "transparent", border: "1px solid #FF6B6B", color: "#FF6B6B", padding: "8px 14px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}>
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: "var(--text2)", fontSize: "14px" }}>No items pending verification. Queue is clean!</p>
              )}
            </div>
          </div>

          {/* STUDENTS NEEDING MENTORING */}
          <div className="chart-card full">
            <div className="card-header">
              <h3>
                <i className="fas fa-exclamation-triangle" style={{ color: "var(--red)", marginRight: "8px" }}></i>
                Students Requiring Mentoring
              </h3>
            </div>
            <div className="alert-students" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {students.filter(s => s.innovationScore < 60).map((s, idx) => (
                <div key={idx} className="alert-student" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,107,107,0.06)", border: "1px solid rgba(255,107,107,0.15)", borderRadius: "8px", padding: "16px" }}>
                  <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                    <div className="alert-avatar" style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#FF6B6B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "700" }}>
                      {s.fullName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <strong>{s.fullName}</strong>
                      <p style={{ color: "var(--text2)", fontSize: "13px", marginTop: "4px" }}>
                        Innovation score is low ({s.innovationScore}%). Needs project submission or certs nudge.
                      </p>
                    </div>
                  </div>
                  <button className="btn-sm" onClick={() => alert(`Nudge successfully sent to ${s.fullName}!`)} style={{ background: "rgba(255,255,255,0.08)", border: "1px solid var(--border)", color: "#fff", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>
                    Send Nudge
                  </button>
                </div>
              ))}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
