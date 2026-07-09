import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function StudentPortfolio({ user, token, onLogout }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/portfolio/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolio(res.data);
      } catch (err) {
        console.error("Error loading portfolio:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [token]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading profile portfolio...</div>;
  }

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  const score = portfolio?.innovationScore || 0;
  const ratingText = score >= 90 ? "Excellent" : score >= 80 ? "Strong" : score >= 60 ? "Average" : "Beginner";
  const cgpaVal = portfolio?.academics?.cgpa || 0;
  const cgpaRating = cgpaVal >= 9 ? "Excellent" : cgpaVal >= 8 ? "Strong" : cgpaVal >= 6 ? "Good" : "Average";

  return (
    <div className="student-portfolio-scope">
      <div className="dashboard">
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          
          {/* PROFILE SUMMARY CARD */}
          <div className="hero-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "24px", marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
              <div className="bot-avatar" style={{ width: "90px", height: "90px", fontSize: "36px", fontWeight: "700" }}>
                {getInitials(portfolio?.fullName || user?.fullName)}
              </div>
              <div>
                <h1 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "6px" }}>{portfolio?.fullName || user?.fullName}</h1>
                <p style={{ color: "var(--cyan)", fontSize: "14px", fontWeight: "600", marginBottom: "8px" }}>
                  Student · {portfolio?.academics?.semester || "Sem 4"} · {user?.department || "Computer Science"}
                </p>
                <div style={{ display: "flex", gap: "16px", color: "var(--text2)", fontSize: "13px" }}>
                  <span><i className="fas fa-envelope"></i> {portfolio?.personalInfo?.email || "No email registered"}</span>
                  <span><i className="fas fa-phone"></i> {portfolio?.personalInfo?.phone || "No phone registered"}</span>
                  <span><i className="fas fa-map-marker-alt"></i> Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button className="btn-secondary" onClick={() => navigate("/student-wizard")} style={{ cursor: "pointer", padding: "12px 18px", borderRadius: "8px", background: "var(--bg3)", border: "1px solid var(--border)", color: "#fff", fontWeight: "600" }}>
                Edit Profile
              </button>
              <button className="btn-primary" onClick={handlePrint} style={{ cursor: "pointer", padding: "12px 18px", borderRadius: "8px" }}>
                Download Resume
              </button>
            </div>
          </div>

          {/* OVERVIEW METRICS GRID */}
          <div className="index-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "32px" }}>
            <div className="index-card" style={{ "--c": "#6BCB77" }}>
              <div className="index-val">{score}%</div>
              <div className="index-name">Innovation Score</div>
              <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "4px" }}>Rating: {ratingText}</div>
            </div>
            <div className="index-card" style={{ "--c": "#4D96FF" }}>
              <div className="index-val">{cgpaVal}</div>
              <div className="index-name">CGPA</div>
              <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "4px" }}>Rating: {cgpaRating}</div>
            </div>
            <div className="index-card" style={{ "--c": "#6C63FF" }}>
              <div className="index-val">{portfolio?.projects?.length || 0}</div>
              <div className="index-name">Projects</div>
              <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "4px" }}>Active</div>
            </div>
            <div className="index-card" style={{ "--c": "#FFD93D" }}>
              <div className="index-val">{portfolio?.hackathons?.length || 0}</div>
              <div className="index-name">Hackathons</div>
              <div style={{ fontSize: "11px", color: "var(--text2)", marginTop: "4px" }}>Participated</div>
            </div>
          </div>

          {/* TAB HEADERS */}
          <div className="tabs-header" style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "24px", gap: "24px" }}>
            {["overview", "projects", "certificates", "hackathons", "achievements"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "12px 6px",
                  color: activeTab === tab ? "var(--purple)" : "var(--text2)",
                  fontWeight: activeTab === tab ? "600" : "500",
                  fontSize: "15px",
                  borderBottom: activeTab === tab ? "3px solid var(--purple)" : "3px solid transparent",
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s"
                }}
              >
                {tab === "certificates" ? "Certifications" : tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENTS */}
          <div className="tab-contents">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="form-card">
                <div className="form-card-body">
                  <h3 style={{ color: "var(--purple)", marginBottom: "12px" }}>Academic Summary</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div style={{ background: "var(--bg3)", padding: "16px", borderRadius: "8px" }}>
                      <span style={{ display: "block", color: "var(--text2)", fontSize: "12px" }}>Current Semester</span>
                      <strong style={{ fontSize: "16px" }}>{portfolio?.academics?.semester || "Sem 4"}</strong>
                    </div>
                    <div style={{ background: "var(--bg3)", padding: "16px", borderRadius: "8px" }}>
                      <span style={{ display: "block", color: "var(--text2)", fontSize: "12px" }}>Current SGPA</span>
                      <strong style={{ fontSize: "16px" }}>{portfolio?.academics?.sgpa || 0}</strong>
                    </div>
                    <div style={{ background: "var(--bg3)", padding: "16px", borderRadius: "8px" }}>
                      <span style={{ display: "block", color: "var(--text2)", fontSize: "12px" }}>Attendance Percentage</span>
                      <strong style={{ fontSize: "16px" }}>{portfolio?.academics?.attendance || 0}%</strong>
                    </div>
                  </div>
                  <h3 style={{ color: "var(--cyan)", marginBottom: "12px", marginTop: "12px" }}>Online Footprints</h3>
                  <div style={{ display: "flex", gap: "16px" }}>
                    {portfolio?.personalInfo?.gitHub && (
                      <a href={portfolio.personalInfo.gitHub} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg3)", padding: "10px 16px", borderRadius: "8px", color: "var(--text)", textDecoration: "none", border: "1px solid var(--border)" }}>
                        <i className="fab fa-github"></i> GitHub Profile
                      </a>
                    )}
                    {portfolio?.personalInfo?.linkedIn && (
                      <a href={portfolio.personalInfo.linkedIn} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg3)", padding: "10px 16px", borderRadius: "8px", color: "var(--text)", textDecoration: "none", border: "1px solid var(--border)" }}>
                        <i className="fab fa-linkedin"></i> LinkedIn Connect
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <div className="portfolio-items" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {portfolio?.projects?.length > 0 ? (
                  portfolio.projects.map((p, idx) => (
                    <div key={idx} className="portfolio-item" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px" }}>
                      <div>
                        <div className="pi-title" style={{ fontSize: "16px", color: "var(--purple)" }}>{p.title}</div>
                        <div className="pi-meta" style={{ marginTop: "4px", fontSize: "12px", color: "var(--text2)" }}>
                          Tech Stack: <span style={{ color: "var(--cyan)" }}>{p.techStack}</span>
                        </div>
                        <p style={{ color: "var(--text)", fontSize: "13px", marginTop: "10px", lineHeight: "1.6" }}>{p.description}</p>
                        {p.githubLink && (
                          <a href={p.githubLink} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: "12px", fontSize: "13px", color: "var(--cyan)", textDecoration: "underline" }}>
                            <i className="fab fa-github"></i> Repository Link
                          </a>
                        )}
                      </div>
                      <span className={`tag ${p.verificationStatus === "Approved" ? "accepted" : p.verificationStatus === "Pending" ? "pending" : "rejected"}`}>
                        {p.verificationStatus || "Pending"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="form-card"><div className="form-card-body" style={{ color: "var(--text2)" }}>No projects uploaded yet.</div></div>
                )}
              </div>
            )}

            {/* CERTIFICATES TAB */}
            {activeTab === "certificates" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                {portfolio?.certificates?.length > 0 ? (
                  portfolio.certificates.map((c, idx) => (
                    <div key={idx} className="portfolio-item" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="pi-title" style={{ fontSize: "15px", color: "var(--purple)" }}>{c.name}</div>
                        <div style={{ color: "var(--text2)", fontSize: "13px", marginTop: "4px" }}>Issuer: {c.issuer}</div>
                        <div style={{ color: "var(--text3)", fontSize: "12px", marginTop: "4px" }}>Issued: {c.date}</div>
                      </div>
                      <span className="tag" style={{ background: "rgba(0,212,255,0.12)", color: "var(--cyan)" }}>Verified</span>
                    </div>
                  ))
                ) : (
                  <div className="form-card" style={{ gridColumn: "span 2" }}><div className="form-card-body" style={{ color: "var(--text2)" }}>No certifications uploaded yet.</div></div>
                )}
              </div>
            )}

            {/* HACKATHONS TAB */}
            {activeTab === "hackathons" && (
              <div className="portfolio-items" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {portfolio?.hackathons?.length > 0 ? (
                  portfolio.hackathons.map((h, idx) => (
                    <div key={idx} className="portfolio-item won" style={{ padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div className="pi-title" style={{ fontSize: "16px", color: "var(--yellow)" }}>{h.name}</div>
                        <div style={{ color: "var(--text2)", fontSize: "13px", marginTop: "4px" }}>
                          Role: {h.role} {h.projectTitle && `· Built: "${h.projectTitle}"`}
                        </div>
                      </div>
                      <span className="tag win" style={{ fontSize: "12px", padding: "6px 12px" }}>
                        <i className="fas fa-trophy" style={{ marginRight: "6px" }}></i> {h.achievement || "Participant"}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="form-card"><div className="form-card-body" style={{ color: "var(--text2)" }}>No hackathon achievements uploaded yet.</div></div>
                )}
              </div>
            )}

            {/* ACHIEVEMENTS TAB */}
            {activeTab === "achievements" && (
              <div className="portfolio-items" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {portfolio?.achievements?.length > 0 ? (
                  portfolio.achievements.map((a, idx) => (
                    <div key={idx} className="portfolio-item" style={{ padding: "20px" }}>
                      <div className="pi-title" style={{ fontSize: "15px", color: "var(--purple)" }}>{a.title}</div>
                      <div style={{ color: "var(--text3)", fontSize: "12px", marginTop: "2px", marginBottom: "8px" }}>Date: {a.date}</div>
                      <p style={{ color: "var(--text2)", fontSize: "13px", lineHeight: "1.5" }}>{a.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="form-card"><div className="form-card-body" style={{ color: "var(--text2)" }}>No achievements uploaded yet.</div></div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
