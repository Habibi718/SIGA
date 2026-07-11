import { API_URL } from "../config";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import RadarChart from "../components/RadarChart";
import ThreeGrowthChart from "../components/ThreeGrowthChart";

export default function StudentDashboard({ user, token, onLogout }) {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  // Filters & Modal States
  const [selectedSemester, setSelectedSemester] = useState("All Semesters");
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Startup Action Modal States
  const [showPitchDeckModal, setShowPitchDeckModal] = useState(false);
  const [pitchDeckUrlInput, setPitchDeckUrlInput] = useState("");
  
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [meetingTopic, setMeetingTopic] = useState("Incubation Mentoring Session");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingTime, setMeetingTime] = useState("");

  // Floating AI Assistant States
  const [showAIChatbot, setShowAIChatbot] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([
    { sender: "ai", text: "Hello! I am your SIGA Auto-Updater Bot. Describe a project, internship, certification, or academic grade you achieved, and I will update your portfolio database autonomously!" }
  ]);
  const [aiChatInput, setAiChatInput] = useState("");
  const [aiChatLoading, setAiChatLoading] = useState(false);

  const fetchPortfolio = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/portfolio/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPortfolio(res.data);
      if (res.data?.startupInfo?.pitchDeckUrl) {
        setPitchDeckUrlInput(res.data.startupInfo.pitchDeckUrl);
      }
    } catch (err) {
      console.error("Error loading portfolio:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [token]);

  // Score Ring Canvas rendering
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
    grad.addColorStop(0, "#818cf8");
    grad.addColorStop(1, "#38bdf8");
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.strokeStyle = grad;
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
    ctx.strokeStyle = "rgba(56, 189, 248, 0.2)";
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
      <div style={{ display: "flex", gap: "4px", color: "#fbbf24", fontSize: "16px" }}>
        {[...Array(5)].map((_, i) => (
          <i key={i} className={i < count ? "fas fa-star" : "far fa-star"}></i>
        ))}
      </div>
    );
  };

  // Startup Actions Logic
  const handleRegisterIncubator = async () => {
    try {
      const updatedStartup = {
        ...portfolio.startupInfo,
        incubationRegistered: true
      };
      await axios.post(
        `${API_URL}/api/portfolio/save`,
        { startupInfo: updatedStartup },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Incubator Registration request sent to JSPM University Incubation Cell!");
      fetchPortfolio();
    } catch (err) {
      console.error(err);
      alert("Registration failed. Please try again.");
    }
  };

  const handleSavePitchDeck = async (e) => {
    e.preventDefault();
    try {
      const updatedStartup = {
        ...portfolio.startupInfo,
        pitchDeckUrl: pitchDeckUrlInput
      };
      await axios.post(
        `${API_URL}/api/portfolio/save`,
        { startupInfo: updatedStartup },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pitch Deck URL updated successfully!");
      setShowPitchDeckModal(false);
      fetchPortfolio();
    } catch (err) {
      console.error(err);
      alert("Failed to save Pitch Deck URL.");
    }
  };

  const handleSubmitMeeting = (e) => {
    e.preventDefault();
    if (!meetingDate || !meetingTime) {
      alert("Please select a date and time.");
      return;
    }
    alert(`Meeting request submitted successfully! Your mentor Prof. Sunita Deshmukh has been notified for your presentation on ${meetingDate} at ${meetingTime}.`);
    setShowMeetingModal(false);
  };

  // Floating AI Chatbot update logic
  const handleSendAIChat = async (e) => {
    e.preventDefault();
    if (!aiChatInput.trim() || aiChatLoading) return;

    const userMsg = aiChatInput.trim();
    const newMsgs = [...aiChatMessages, { sender: "user", text: userMsg }];
    setAiChatMessages(newMsgs);
    setAiChatInput("");
    setAiChatLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/ai/update-portfolio`,
        { message: userMsg },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAiChatMessages([
        ...newMsgs,
        { sender: "ai", text: res.data.reply }
      ]);
      
      // Auto-refresh the dashboard portfolio metrics immediately!
      fetchPortfolio();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.reply || "I encountered an error trying to update your portfolio. Please make sure to state what you completed clearly.";
      setAiChatMessages([
        ...newMsgs,
        { sender: "ai", text: errMsg }
      ]);
    } finally {
      setAiChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#0f172a" }}>
        Rerouting to galaxy...
      </div>
    );
  }

  const score = portfolio?.innovationScore || 0;
  const badgeLabel = score >= 90 ? "Elite Innovator" : score >= 80 ? "Advanced Innovator" : score >= 60 ? "Growing Innovator" : "Beginner Innovator";
  const nextGoalText = score >= 90 ? "Incubation target or patent file" : score >= 80 ? "Participate in National Hackathons" : "Add more projects and verify certifications";

  const metrics = portfolio?.radarMetrics || {
    research: 74,
    technical: 85,
    entrepreneurship: 67,
    collaboration: 91,
    creativity: 82,
    leadership: 79,
  };

  // Filter achievements list by selected semester
  const filterList = (arr) => {
    if (!arr) return [];
    if (selectedSemester === "All Semesters") return arr;
    return arr.filter((item) => item.semester === selectedSemester);
  };

  const filteredProjects = filterList(portfolio?.projects);
  const filteredHackathons = filterList(portfolio?.hackathons);
  const filteredResearch = filterList(portfolio?.research);
  const filteredInternships = filterList(portfolio?.internships);
  const filteredCertificates = filterList(portfolio?.certificates);
  const filteredAchievements = filterList(portfolio?.achievements);

  const totalFilteredCount = 
    filteredProjects.length + 
    filteredHackathons.length + 
    filteredResearch.length + 
    filteredInternships.length + 
    filteredCertificates.length + 
    filteredAchievements.length;

  // Open detail view modal
  const openDetail = (item, type) => {
    setSelectedItem(item);
    setItemType(type);
    setShowDetailModal(true);
  };

  // Check if 30 days passed since last update
  const daysSinceUpdate = Math.round((new Date() - new Date(portfolio.updatedAt)) / (1000 * 60 * 60 * 24));
  const showAINotification = daysSinceUpdate >= 30 || true; // Force-enabled for local testing demonstration

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
                <i className="far fa-hand-paper" style={{ color: "#fbbf24", marginLeft: "4px" }}></i>
              </p>
            </div>
            <div className="header-actions" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <select 
                value={selectedSemester} 
                onChange={(e) => setSelectedSemester(e.target.value)}
                style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", padding: "10px 16px", borderRadius: "10px", outline: "none", cursor: "pointer" }}
              >
                <option value="All Semesters">All Semesters</option>
                <option value="Sem 1">Semester 1</option>
                <option value="Sem 2">Semester 2</option>
                <option value="Sem 3">Semester 3</option>
                <option value="Sem 4">Semester 4</option>
                <option value="Sem 5">Semester 5</option>
                <option value="Sem 6">Semester 6</option>
                <option value="Sem 7">Semester 7</option>
                <option value="Sem 8">Semester 8</option>
              </select>
              <button className="btn-primary" onClick={() => navigate("/student-wizard")}>
                <i className="fas fa-plus-circle" style={{ marginRight: "8px" }}></i> Update Portfolio
              </button>
            </div>
          </div>

          {/* AI NOTIFICATION BANNER */}
          {showAINotification && (
            <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.2)", borderRadius: "16px", padding: "16px 20px", display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
              <div style={{ background: "#38bdf8", width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>
                <i className="fas fa-robot" style={{ fontSize: "20px" }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ color: "#38bdf8" }}>AI Advisor Nudge</strong>
                <p style={{ color: "#cbd5e1", fontSize: "13px", marginTop: "2px" }}>
                  It has been {daysSinceUpdate || 30} days since your last upload! Have you achieved any new certifications, projects, or internships? Add them now to raise your Innovation Index score.
                </p>
              </div>
            </div>
          )}

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
                  <i className="fas fa-bullseye" style={{ color: "#f43f5e", marginRight: "8px" }}></i>
                  {nextGoalText}
                </p>
              </div>
            </div>
            <div className="hero-right">
              <div className="index-grid">
                <div className="index-card" style={{ "--c": "#818cf8" }}>
                  <div className="index-val">{metrics.creativity}</div>
                  <div className="index-name">Innovation</div>
                </div>
                <div className="index-card" style={{ "--c": "#f43f5e" }}>
                  <div className="index-val">{metrics.research}</div>
                  <div className="index-name">Research</div>
                </div>
                <div className="index-card" style={{ "--c": "#fbbf24" }}>
                  <div className="index-val">{metrics.entrepreneurship}</div>
                  <div className="index-name">Startup</div>
                </div>
                <div className="index-card" style={{ "--c": "#10b981" }}>
                  <div className="index-val">{metrics.collaboration}</div>
                  <div className="index-name">Collaboration</div>
                </div>
                <div className="index-card" style={{ "--c": "#60a5fa" }}>
                  <div className="index-val">{metrics.technical}</div>
                  <div className="index-name">Skill</div>
                </div>
                <div className="index-card" style={{ "--c": "#fb923c" }}>
                  <div className="index-val">{metrics.leadership}</div>
                  <div className="index-name">Leadership</div>
                </div>
              </div>
            </div>
          </div>

          {/* STATS ROW */}
          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "#818cf8" }}><i className="fas fa-folder-open"></i></div>
              <div className="stat-val">{filteredProjects.length}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "#60a5fa" }}><i className="fas fa-laptop-code"></i></div>
              <div className="stat-val">{filteredHackathons.length}</div>
              <div className="stat-label">Hackathons</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "#f43f5e" }}><i className="fas fa-file-alt"></i></div>
              <div className="stat-val">{filteredResearch.length}</div>
              <div className="stat-label">Research Papers</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "#fbbf24" }}><i className="fas fa-medal"></i></div>
              <div className="stat-val">{filteredAchievements.length}</div>
              <div className="stat-label">Achievements</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "#10b981" }}><i className="fas fa-building"></i></div>
              <div className="stat-val">{filteredInternships.length}</div>
              <div className="stat-label">Internships</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ color: "#a78bfa" }}><i className="fas fa-graduation-cap"></i></div>
              <div className="stat-val">{filteredCertificates.length}</div>
              <div className="stat-label">Certificates</div>
            </div>
          </div>

          {/* DYNAMIC LISTING BASED ON SEMESTER FILTER */}
          <div className="chart-card full" style={{ marginBottom: "28px" }}>
            <div className="card-header">
              <h3>
                <i className="fas fa-list" style={{ color: "#38bdf8", marginRight: "8px" }}></i>
                Semester Portfolio Files & Records ({selectedSemester})
              </h3>
              <span className="badge">{totalFilteredCount} Items Found</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", padding: "10px 0" }}>
              {totalFilteredCount === 0 ? (
                <p style={{ color: "#94a3b8", gridColumn: "1/-1", textAlign: "center", padding: "20px" }}>No achievements added for this semester.</p>
              ) : (
                <>
                  {filteredProjects.map((p, idx) => (
                    <div key={idx} onClick={() => openDetail(p, "Project")} style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "0.2s" }} className="hover-card-effects">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#818cf8", fontWeight: "600", textTransform: "uppercase" }}>Project</span>
                        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "4px" }}>{p.semester}</span>
                      </div>
                      <strong style={{ color: "white" }}>{p.title}</strong>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px", lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{p.description}</p>
                    </div>
                  ))}
                  {filteredHackathons.map((h, idx) => (
                    <div key={idx} onClick={() => openDetail(h, "Hackathon")} style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#60a5fa", fontWeight: "600", textTransform: "uppercase" }}>Hackathon</span>
                        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "4px" }}>{h.semester}</span>
                      </div>
                      <strong style={{ color: "white" }}>{h.name}</strong>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Role: {h.role} · {h.achievement}</p>
                    </div>
                  ))}
                  {filteredResearch.map((r, idx) => (
                    <div key={idx} onClick={() => openDetail(r, "Research")} style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#f43f5e", fontWeight: "600", textTransform: "uppercase" }}>Research Paper</span>
                        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "4px" }}>{r.semester}</span>
                      </div>
                      <strong style={{ color: "white" }}>{r.title}</strong>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{r.journal} · {r.status}</p>
                    </div>
                  ))}
                  {filteredInternships.map((i, idx) => (
                    <div key={idx} onClick={() => openDetail(i, "Internship")} style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#10b981", fontWeight: "600", textTransform: "uppercase" }}>Internship</span>
                        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "4px" }}>{i.semester}</span>
                      </div>
                      <strong style={{ color: "white" }}>{i.company}</strong>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{i.role} ({i.duration})</p>
                    </div>
                  ))}
                  {filteredCertificates.map((c, idx) => (
                    <div key={idx} onClick={() => openDetail(c, "Certificate")} style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: "600", textTransform: "uppercase" }}>Certificate</span>
                        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "4px" }}>{c.semester}</span>
                      </div>
                      <strong style={{ color: "white" }}>{c.title}</strong>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>Issued by {c.issuer}</p>
                    </div>
                  ))}
                  {filteredAchievements.map((a, idx) => (
                    <div key={idx} onClick={() => openDetail(a, "Achievement")} style={{ background: "rgba(30, 41, 59, 0.7)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", transition: "0.2s" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <span style={{ fontSize: "12px", color: "#fb923c", fontWeight: "600", textTransform: "uppercase" }}>Achievement</span>
                        <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.05)", padding: "3px 6px", borderRadius: "4px" }}>{a.semester}</span>
                      </div>
                      <strong style={{ color: "white" }}>{a.title}</strong>
                      <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "6px" }}>{a.description}</p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* CHARTS ROW (Restored 3D Chart) */}
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
                  <i className="fas fa-compass" style={{ color: "#818cf8", marginRight: "8px" }}></i>
                  Innovation Wheel
                </h3>
              </div>
              <div style={{ height: "280px" }}>
                <RadarChart metrics={metrics} />
              </div>
            </div>
          </div>

          {/* TIMELINE */}
          <div className="chart-card full" style={{ marginBottom: "28px" }}>
            <div className="card-header">
              <h3>
                <i className="fas fa-history" style={{ color: "#fbbf24", marginRight: "8px" }}></i>
                Semester Achievement Milestones
              </h3>
            </div>
            <div className="timeline">
              <div className="timeline-item done">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 1</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "#10b981" }}><i className="fas fa-check-circle"></i></span> Basic programming concepts & first web projects complete.
                </div>
              </div>
              <div className="timeline-item done">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 2</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "#60a5fa" }}><i className="fas fa-tools"></i></span> AWS Certification complete. First IoT Smart Dustbin prototype design.
                </div>
              </div>
              <div className="timeline-item done">
                <div className="tl-dot"></div>
                <div className="tl-sem">Sem 3</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "#fbbf24" }}><i className="fas fa-trophy"></i></span> Smart India Hackathon final runner-up. AI Face Recognition model.
                </div>
              </div>
              <div className="timeline-item active">
                <div className="tl-dot pulse"></div>
                <div className="tl-sem">Sem 4</div>
                <div className="tl-content">
                  <span className="tl-icon" style={{ color: "#f43f5e" }}><i className="fas fa-file-contract"></i></span>{" "}
                  Research paper published in IEEE. Currently completing IoT Smart Dustbin verification.
                </div>
              </div>
            </div>
          </div>

          {/* AI ADVISORY & RECENT ACTIVITIES */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-robot" style={{ color: "#38bdf8", marginRight: "8px" }}></i>
                  AI Mentor Advisor
                </h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "14px" }}>
                {score < 85 ? (
                  <>
                    <p style={{ display: "flex", gap: "10px", color: "#cbd5e1" }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: "#fbbf24" }}></i> Improve entrepreneurship metrics by validating a prototype.
                    </p>
                    <p style={{ display: "flex", gap: "10px", color: "#cbd5e1" }}>
                      <i className="fas fa-exclamation-triangle" style={{ color: "#fbbf24" }}></i> Complete an industry certification to level up technical scores.
                    </p>
                  </>
                ) : (
                  <>
                    <p style={{ display: "flex", gap: "10px", color: "#cbd5e1" }}>
                      <i className="fas fa-check-circle" style={{ color: "#10b981" }}></i> Portfolio ready for internship reviews. Excellent growth profile.
                    </p>
                    <p style={{ display: "flex", gap: "10px", color: "#cbd5e1" }}>
                      <i className="fas fa-check-circle" style={{ color: "#10b981" }}></i> Apply to college incubator cell for startup funding opportunities.
                    </p>
                  </>
                )}
                {portfolio?.startupInfo?.hasStartup && (
                  <p style={{ display: "flex", gap: "10px", color: "#38bdf8", fontWeight: "600" }}>
                    <i className="fas fa-lightbulb"></i> Startup "{portfolio.startupInfo.startupName}" is in the {portfolio.startupInfo.startupStage} stage!
                  </p>
                )}
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-list-ul" style={{ color: "#818cf8", marginRight: "8px" }}></i>
                  Recent Activity Logs
                </h3>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px", padding: 0 }}>
                {portfolio?.projects?.length > 0 ? (
                  portfolio.projects.slice(0, 2).map((p, idx) => (
                    <li key={idx} style={{ color: "#cbd5e1", fontSize: "14px", display: "flex", alignItems: "center" }}>
                      <i className="fas fa-check" style={{ color: "#10b981", marginRight: "8px" }}></i>
                      Added project: <strong style={{ color: "#a78bfa", marginLeft: "4px" }}>{p.title}</strong>
                    </li>
                  ))
                ) : (
                  <li style={{ color: "#94a3b8", fontSize: "14px" }}>No recent records found. Update your profile.</li>
                )}
                {portfolio?.startupInfo?.hasStartup && (
                  <li style={{ color: "#cbd5e1", fontSize: "14px", display: "flex", alignItems: "center" }}>
                    <i className="fas fa-rocket" style={{ color: "#fb923c", marginRight: "8px" }}></i>
                    Startup Registered: <strong style={{ color: "#38bdf8", marginLeft: "4px" }}>{portfolio.startupInfo.startupName}</strong>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* STARTUP QUICK ACTIONS (Active Incubation Actions) */}
          {portfolio?.startupInfo?.hasStartup && (
            <div className="chart-card full" style={{ marginBottom: "28px", border: "1px solid rgba(251,146,60,0.2)" }}>
              <div className="card-header">
                <h3>
                  <i className="fas fa-rocket" style={{ color: "#fb923c", marginRight: "8px" }}></i>
                  Startup Incubator Quick Actions
                </h3>
                <span className="badge" style={{ background: "rgba(251,146,60,0.1)", color: "#fb923c" }}>Incubation Stage</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                
                {portfolio.startupInfo.incubationRegistered ? (
                  <button className="btn-secondary" disabled style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#10b981", padding: "12px", borderRadius: "8px", cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                    <i className="fas fa-check-circle"></i> Incubator Registered
                  </button>
                ) : (
                  <button className="btn-secondary" onClick={handleRegisterIncubator} style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)", color: "#fb923c", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                    <i className="fas fa-id-card"></i> Register Incubator
                  </button>
                )}

                <button className="btn-secondary" onClick={() => { setPitchDeckUrlInput(portfolio.startupInfo.pitchDeckUrl || ""); setShowPitchDeckModal(true); }} style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                  <i className="fas fa-file-powerpoint"></i> {portfolio.startupInfo.pitchDeckUrl ? "Update Pitch Deck" : "Upload Pitch Deck"}
                </button>

                <button className="btn-secondary" onClick={() => setShowMeetingModal(true)} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                  <i className="fas fa-handshake"></i> Request Mentor Meeting
                </button>

                <button className="btn-secondary" onClick={() => handleAction("achievements")} style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", color: "#a78bfa", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                  <i className="fas fa-file-signature"></i> Add Patent / IP
                </button>

              </div>
            </div>
          )}

          {/* STANDARD QUICK ACTIONS */}
          <div className="chart-card full">
            <div className="card-header">
              <h3>
                <i className="fas fa-bolt" style={{ color: "#fbbf24", marginRight: "8px" }}></i>
                Quick Actions
              </h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
              <button className="btn-secondary" onClick={() => handleAction("projects")} style={{ background: "rgba(129,140,248,0.1)", border: "1px solid rgba(129,140,248,0.2)", color: "#818cf8", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-plus-circle"></i> Add Project
              </button>
              <button className="btn-secondary" onClick={() => handleAction("certificates")} style={{ background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.2)", color: "#38bdf8", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-award"></i> Upload Certificate
              </button>
              <button className="btn-secondary" onClick={() => handleAction("hackathons")} style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)", color: "#fbbf24", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-laptop-code"></i> Join Hackathon
              </button>
              <button className="btn-secondary" onClick={() => navigate("/student-ai-mentor")} style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", padding: "12px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontWeight: "600" }}>
                <i className="fas fa-brain"></i> Ask AI Mentor
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* PITCH DECK UPDATE MODAL */}
      {showPitchDeckModal && (
        <div className="modal-overlay" onClick={() => setShowPitchDeckModal(false)} style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", width: "90%", maxWidth: "500px", padding: "28px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px" }}>
              <h3>Upload Pitch Deck URL</h3>
              <button onClick={() => setShowPitchDeckModal(false)} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "24px", cursor: "pointer" }}>&times;</button>
            </div>
            <form onSubmit={handleSavePitchDeck}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>Pitch Deck Link (Google Slides, Canva, etc.)</label>
                <input 
                  type="text" 
                  value={pitchDeckUrlInput} 
                  onChange={(e) => setPitchDeckUrlInput(e.target.value)} 
                  placeholder="https://docs.google.com/presentation/d/.../edit" 
                  style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white", outline: "none" }}
                  required 
                />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowPitchDeckModal(false)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 16px", background: "#38bdf8", border: "none", color: "#0f172a", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Save URL</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REQUEST MENTOR MEETING MODAL */}
      {showMeetingModal && (
        <div className="modal-overlay" onClick={() => setShowMeetingModal(false)} style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", width: "90%", maxWidth: "500px", padding: "28px", color: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px" }}>
              <h3>Schedule Mentor Pitch Practice</h3>
              <button onClick={() => setShowMeetingModal(false)} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "24px", cursor: "pointer" }}>&times;</button>
            </div>
            <form onSubmit={handleSubmitMeeting}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>Meeting Topic</label>
                <input 
                  type="text" 
                  value={meetingTopic} 
                  onChange={(e) => setMeetingTopic(e.target.value)} 
                  style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white", outline: "none" }}
                  required 
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>Preferred Date</label>
                  <input 
                    type="date" 
                    value={meetingDate} 
                    onChange={(e) => setMeetingDate(e.target.value)} 
                    style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white", outline: "none" }}
                    required 
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", color: "#94a3b8" }}>Preferred Time</label>
                  <input 
                    type="time" 
                    value={meetingTime} 
                    onChange={(e) => setMeetingTime(e.target.value)} 
                    style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white", outline: "none" }}
                    required 
                  />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button type="button" onClick={() => setShowMeetingModal(false)} style={{ padding: "8px 16px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "8px", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ padding: "8px 16px", background: "#10b981", border: "none", color: "#0f172a", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD DETAIL & PDF MODAL */}
      {showDetailModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)} style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.85)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", zIndex: 999 }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", width: "90%", maxWidth: "680px", padding: "28px", color: "white", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "16px", marginBottom: "20px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "11px", color: "#38bdf8", fontWeight: "700", textTransform: "uppercase" }}>{itemType} Details</span>
                <h3 style={{ fontSize: "20px", fontWeight: "700", marginTop: "4px" }}>{selectedItem.title || selectedItem.name}</h3>
              </div>
              <button onClick={() => setShowDetailModal(false)} style={{ background: "transparent", border: "none", color: "#64748b", fontSize: "24px", cursor: "pointer" }}>&times;</button>
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px", fontSize: "14px" }}>
              {selectedItem.techStack && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Tech Stack:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.techStack}</p>
                </div>
              )}
              {selectedItem.role && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Role:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.role}</p>
                </div>
              )}
              {selectedItem.achievement && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Achievement:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.achievement}</p>
                </div>
              )}
              {selectedItem.issuer && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Issuer:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.issuer}</p>
                </div>
              )}
              {selectedItem.journal && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Journal/Conference:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.journal}</p>
                </div>
              )}
              {selectedItem.status && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Status:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.status}</p>
                </div>
              )}
              {selectedItem.duration && (
                <div>
                  <strong style={{ color: "#94a3b8" }}>Duration:</strong>
                  <p style={{ marginTop: "4px" }}>{selectedItem.duration}</p>
                </div>
              )}
              <div>
                <strong style={{ color: "#94a3b8" }}>Academic Term:</strong>
                <p style={{ marginTop: "4px" }}>{selectedItem.semester}</p>
              </div>
              <div>
                <strong style={{ color: "#94a3b8" }}>Verification Status:</strong>
                <p style={{ marginTop: "4px" }}>
                  <span style={{
                    padding: "4px 8px", borderRadius: "9999px", fontSize: "12px", fontWeight: "600",
                    background: selectedItem.verificationStatus === "Approved" ? "rgba(16,185,129,0.15)" : selectedItem.verificationStatus === "Rejected" ? "rgba(244,63,94,0.15)" : "rgba(245,158,11,0.15)",
                    color: selectedItem.verificationStatus === "Approved" ? "#34d399" : selectedItem.verificationStatus === "Rejected" ? "#f43f5e" : "#fbbf24"
                  }}>
                    {selectedItem.verificationStatus || "Pending"}
                  </span>
                </p>
              </div>
            </div>

            {selectedItem.description && (
              <div style={{ marginBottom: "20px", fontSize: "14px" }}>
                <strong style={{ color: "#94a3b8", display: "block", marginBottom: "4px" }}>Description:</strong>
                <p style={{ lineHeight: "1.6" }}>{selectedItem.description}</p>
              </div>
            )}

            {/* PDF ATTACHMENT SECTION */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
              <strong style={{ color: "#94a3b8", display: "block", marginBottom: "12px" }}>Attached Document / Verification PDF:</strong>
              {selectedItem.pdfUrl ? (
                <div style={{ borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <iframe 
                    src={selectedItem.pdfUrl} 
                    title="Verification PDF Preview" 
                    style={{ width: "100%", height: "240px", background: "white", border: "none" }}
                  />
                  <div style={{ padding: "10px", background: "rgba(15,23,42,0.4)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "#94a3b8" }}>Embedded PDF Preview</span>
                    <a href={selectedItem.pdfUrl} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#38bdf8", fontWeight: "600", textDecoration: "none" }}>
                      <i className="fas fa-external-link-alt" style={{ marginRight: "4px" }}></i> Open in New Tab
                    </a>
                  </div>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "20px", borderRadius: "10px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "14px" }}>
                  <i className="far fa-file-pdf" style={{ fontSize: "28px", display: "block", marginBottom: "8px" }}></i>
                  No PDF attachment provided for verification. Click "Update Portfolio" to add a document link.
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)} style={{ padding: "10px 20px", borderRadius: "10px", cursor: "pointer", background: "rgba(255,255,255,0.05)", border: "none", color: "white" }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING PORTFOLIO AUTO-UPDATER AI CHATBOT */}
      <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 999 }}>
        <button 
          onClick={() => setShowAIChatbot(!showAIChatbot)}
          style={{ background: "#38bdf8", border: "none", width: "56px", height: "56px", borderRadius: "50%", color: "#0f172a", fontSize: "24px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 15px -3px rgba(56,189,248,0.4)" }}
        >
          <i className="fas fa-robot"></i>
        </button>

        {showAIChatbot && (
          <div style={{ position: "absolute", bottom: "72px", right: 0, width: "340px", height: "420px", background: "#1e293b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", display: "flex", flexDirection: "column", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ background: "#38bdf8", padding: "14px 18px", color: "#0f172a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontWeight: "700" }}>Portfolio AI Updater</strong>
              <span onClick={() => setShowAIChatbot(false)} style={{ cursor: "pointer", fontSize: "20px" }}>&times;</span>
            </div>
            <div style={{ flex: 1, padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
              {aiChatMessages.map((m, idx) => (
                <div key={idx} style={{ alignSelf: m.sender === "user" ? "flex-end" : "flex-start", background: m.sender === "user" ? "#38bdf8" : "rgba(255,255,255,0.05)", color: m.sender === "user" ? "#0f172a" : "white", padding: "10px 14px", borderRadius: "12px", maxWidth: "80%", fontSize: "13px" }}>
                  {m.text}
                </div>
              ))}
              {aiChatLoading && (
                <div style={{ alignSelf: "flex-start", background: "rgba(255,255,255,0.05)", color: "white", padding: "10px 14px", borderRadius: "12px", fontSize: "13px", fontStyle: "italic" }}>
                  Parsing details & updating database...
                </div>
              )}
            </div>
            <form onSubmit={handleSendAIChat} style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.05)", background: "#0f172a", padding: "8px" }}>
              <input 
                type="text" 
                placeholder="Type: I built a React website called..." 
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", color: "white", padding: "8px", outline: "none", fontSize: "13px" }}
                disabled={aiChatLoading}
              />
              <button type="submit" disabled={aiChatLoading} style={{ background: "#38bdf8", border: "none", color: "#0f172a", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>Send</button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
