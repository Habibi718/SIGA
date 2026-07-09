import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import ThreeGrowthChart from "../components/ThreeGrowthChart";
import RadarChart from "../components/RadarChart";

export default function StudentDashboard({ user, token, onLogout }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

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

  useEffect(() => {
    if (!canvasRef.current || !portfolio) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const cx = 90, cy = 90, r = 72;
    const score = portfolio.innovationScore || 0;
    const pct = score / 100;

    ctx.clearRect(0, 0, 180, 180);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 14;
    ctx.stroke();

    // Gradient Arc
    const grad = ctx.createLinearGradient(0, 0, 180, 180);
    grad.addColorStop(0, "#6C63FF");
    grad.addColorStop(1, "#00D4FF");
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.strokeStyle = "rgba(0,212,255,0.2)";
    ctx.lineWidth = 22;
    ctx.lineCap = "round";
    ctx.stroke();
  }, [portfolio]);

  const handleAction = (step) => {
    navigate(`/student-wizard?step=${step}`);
  };

  const renderStars = () => {
    const score = portfolio?.innovationScore || 0;
    const count = score >= 90 ? 5 : score >= 80 ? 4 : score >= 60 ? 3 : 2;
    return (
      <div style={{ display: "flex", gap: "4px", color: "var(--yellow)", fontSize: "16px" }}>
        {[...Array(5)].map((_, i) => (
          <i key={i} className={i < count ? "fas fa-star" : "far fa-star"}></i>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        Rerouting to galaxy...
      </div>
    );
  }

  const score = portfolio?.innovationScore || 0;
  const badgeLabel = score >= 90 ? "Elite Innovator" : score >= 80 ? "Advanced Innovator" : score >= 60 ? "Growing Innovator" : "Beginner Innovator";
  const nextGoalText = score >= 90 ? "Incubation target or patent file" : score >= 80 ? "Participate in National Hackathons" : "Add more projects and verify certifications";

  const metrics = portfolio?.radarMetrics || {
    research: 74,
    technicalSkills: 85,
    entrepreneurship: 67,
    collaboration: 91,
    creativity: 82,
    leadership: 79,
  };

  return (
    <div className="student-dashboard-scope">
      <div className="dashboard">
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>Innovation Dashboard</h1>
              <p className="subtitle">
                Welcome back, {portfolio?.fullName || user?.fullName}{" "}
                <i className="far fa-hand-paper" style={{ color: "var(--yellow)", marginLeft: "4px" }}></i>
              </p>
            </div>
            <div className="header-actions">
              <button className="btn-primary" onClick={() => navigate("/student-wizard")}>
                <i className="fas fa-plus-circle" style={{ marginRight: "8px" }}></i> Update Portfolio
              </button>
            </div>
          </div>

          {/* SCORE HERO CARD */}
          <div className="hero-card">
            <div className="hero-left">
              <div className="score-ring-container">
                <canvas ref={canvasRef} id="scoreRing" width="180" height="180"></canvas>
                <div className="score-center">
                  <span className="score-number">{score}</span>
                  <span className="score-label">/ 100</span>
                </div>
              </div>
              <div className="hero-info">
                <div className="stars">{renderStars()}</div>
                <div className="level-badge">{badgeLabel}</div>
                <p className="next-goal">
                  <i className="fas fa-bullseye" style={{ color: "var(--red)", marginRight: "8px" }}></i>
                  {nextGoalText}
                </p>
              </div>
            </div>
            <div className="hero-right">
              <div className="index-grid">
                <div className="index-card" style={{ "--c": "#6C63FF" }}>
                  <div className="index-val">{metrics.creativity}</div>
                  <div className="index-name">Innovation</div>
                </div>
                <div className="index-card" style={{ "--c": "#FF6B6B" }}>
                  <div className="index-val">{metrics.research}</div>
                  <div className="index-name">Research</div>
                </div>
                <div className="index-card" style={{ "--c": "#FFD93D" }}>
                  <div className="index-val">{metrics.entrepreneurship}</div>
                  <div className="index-name">Entrepreneurship</div>
                </div>
                <div className="index-card" style={{ "--c": "#6BCB77" }}>
                  <div className="index-val">{metrics.collaboration}</div>
                  <div className="index-name">Collaboration</div>
                </div>
                <div className="index-card" style={{ "--c": "#4D96FF" }}>
                  <div className="index-val">{metrics.technicalSkills}</div>
                  <div className="index-name">Skill</div>
                </div>
                <div className="index-card" style={{ "--c": "#FF922B" }}>
                  <div className="index-val">{metrics.leadership}</div>
                  <div className="index-name">Leadership</div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "var(--purple)" }}>
                <i className="fas fa-folder-open"></i>
              </div>
              <div className="stat-val">{portfolio?.projects?.length || 0}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "var(--cyan)" }}>
                <i className="fas fa-laptop-code"></i>
              </div>
              <div className="stat-val">{portfolio?.hackathons?.length || 0}</div>
              <div className="stat-label">Hackathons</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "var(--red)" }}>
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="stat-val">{portfolio?.research?.length || 0}</div>
              <div className="stat-label">Research Papers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "var(--yellow)" }}>
                <i className="fas fa-medal"></i>
              </div>
              <div className="stat-val">{portfolio?.achievements?.length || 0}</div>
              <div className="stat-label">Patents</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "var(--green)" }}>
                <i className="fas fa-building"></i>
              </div>
              <div className="stat-val">{portfolio?.internships?.length || 0}</div>
              <div className="stat-label">Internships</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "var(--blue)" }}>
                <i className="fas fa-graduation-cap"></i>
              </div>
              <div className="stat-val">{portfolio?.certificates?.length || 0}</div>
              <div className="stat-label">Certifications</div>
            </div>
          </div>

          {/* CHARTS ROW */}
          <div className="charts-row">
            <div className="chart-card wide" style={{ minWidth: "0" }}>
              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-line" style={{ color: "var(--purple)", marginRight: "8px" }}></i>
                  Semester Growth (3D)
                </h3>
                <span className="badge">Innovation Score</span>
              </div>
              <div style={{ height: "320px" }}>
                <ThreeGrowthChart semesterScores={portfolio?.semesterScores} />
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-compass" style={{ color: "var(--cyan)", marginRight: "8px" }}></i>
                  Innovation Wheel
                </h3>
              </div>
              <div style={{ height: "280px" }}>
                <RadarChart metrics={metrics} />
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="chart-card full">
            <div className="card-header">
              <h3>
                <i className="fas fa-history" style={{ color: "var(--yellow)", marginRight: "8px" }}></i>
                Achievement Timeline
              </h3>
            </div>
            <div className="timeline">
              <div className="timeline-item done">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 1</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "var(--green)" }}><i className="fas fa-check-circle"></i></span> Python Certificate · Web Dev Bootcamp
                </div>
              </div>
              <div className="timeline-item done">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 2</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "var(--cyan)" }}><i className="fas fa-tools"></i></span> Smart Dustbin IoT Project · Cloud Foundations
                </div>
              </div>
              <div className="timeline-item done">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 3</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "var(--yellow)" }}><i className="fas fa-trophy"></i></span> Smart India Hackathon – Finalist · 3 Certifications
                </div>
              </div>
              <div className="timeline-item active">
                <div className="tl-dot pulse"></div>
                <div className="tl-sem">Sem 4</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "var(--red)" }}><i className="fas fa-file-contract"></i></span>{" "}
                  {portfolio?.projects?.length > 0 
                    ? `${portfolio.projects[0].title} · ${portfolio.certificates?.length || 0} Certifications`
                    : "Research Paper Submitted · AI/ML Internship"
                  }
                </div>
              </div>
              <div className="timeline-item upcoming">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 5</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "var(--yellow)" }}><i className="fas fa-lightbulb"></i></span> Patent Filing Planned
                </div>
              </div>
              <div className="timeline-item upcoming">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 6</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "var(--green)" }}><i className="fas fa-rocket"></i></span> Startup Incubation Target
                </div>
              </div>
            </div>
          </div>

          {/* AI ADVISORY & RECENT ACTIVITIES */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-robot" style={{ color: "var(--cyan)", marginRight: "8px" }}></i>
                  AI Mentor Insights
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {score < 85 ? (
                  <>
                    <p style={{ display: "flex", gap: "10px", color: "var(--text)" }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: "#FFD93D" }}></i> Improve entrepreneurship metrics by validating a prototype.
                    </p>
                    <p style={{ display: "flex", gap: "10px", color: "var(--text)" }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: "#FFD93D" }}></i> Complete an industry certification to level up technical scores.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ display: "flex", gap: "10px", color: "var(--text)" }}>
                      <i className="fas fa-check-circle" style={{ color: "#6BCB77" }}></i> Portfolio ready for internship reviews. Excellent growth profile.
                    </p>
                    <p style={{ display: "flex", gap: "10px", color: "var(--text)" }}>
                      <i className="fas fa-check-circle" style={{ color: "#6BCB77" }}></i> Apply to college incubator cell for startup funding opportunities.
                    </p>
                  </>
                )}
                <p style={{ display: "flex", gap: "10px", color: "var(--text2)" }}>
                  <i className="fas fa-arrow-right"></i> Register for upcoming regional Hackathons.
                </p>
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-list-ul" style={{ color: "var(--purple)", marginRight: "8px" }}></i>
                  Recent Activity Logs
                </h3>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                {portfolio?.projects?.length > 0 ? (
                  portfolio.projects.slice(0, 3).map((p, idx) => (
                    <li key={idx} style={{ color: "var(--text)", fontSize: "14px", display: "flex", alignItems: "center" }}>
                      <i className="fas fa-check" style={{ color: "var(--green)", marginRight: "8px" }}></i>
                      Added project: <strong style={{ color: "var(--purple)", marginLeft: "4px" }}>{p.title}</strong>
                    </li>
                  ))
                ) : (
                  <li style={{ color: "var(--text2)", fontSize: "14px" }}>No recent records found. Update your profile.</li>
                )}
                {portfolio?.hackathons?.length > 0 && (
                  <li style={{ color: "var(--text)", fontSize: "14px", display: "flex", alignItems: "center" }}>
                    <i className="fas fa-trophy" style={{ color: "var(--yellow)", marginRight: "8px" }}></i>
                    Participated in: <strong style={{ color: "var(--cyan)", marginLeft: "4px" }}>{portfolio.hackathons[0].name}</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="chart-card full">
            <div className="card-header">
              <h3>
                <i className="fas fa-bolt" style={{ color: "var(--yellow)", marginRight: "8px" }}></i>
                Quick Actions
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <button className="btn-secondary" onClick={() => handleAction("projects")} style={{ background: "rgba(108,99,255,0.1)", border: "1px solid rgba(108,99,255,0.2)", color: "var(--purple)", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-plus-circle"></i> Add Project
              </button>
              <button className="btn-secondary" onClick={() => handleAction("certificates")} style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--cyan)", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-award"></i> Upload Certificate
              </button>
              <button className="btn-secondary" onClick={() => handleAction("hackathons")} style={{ background: "rgba(255,217,61,0.1)", border: "1px solid rgba(255,217,61,0.2)", color: "var(--yellow)", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-laptop-code"></i> Join Hackathon
              </button>
              <button className="btn-secondary" onClick={() => navigate("/student-ai-mentor")} style={{ background: "rgba(107,203,119,0.1)", border: "1px solid rgba(107,203,119,0.2)", color: "var(--green)", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-robot"></i> Ask AI Mentor
              </button>
              <button className="btn-secondary" onClick={() => navigate("/student-portfolio")} style={{ background: "rgba(255,107,107,0.1)", border: "1px solid rgba(255,107,107,0.2)", color: "var(--red)", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-chart-bar"></i> View Portfolio
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
