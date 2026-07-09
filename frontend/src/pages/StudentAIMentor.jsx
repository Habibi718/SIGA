import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function StudentAIMentor({ user, token, onLogout }) {
  const [portfolio, setPortfolio] = useState(null);
  const [chatBox, setChatBox] = useState([
    { sender: "bot", text: "Hello! I am your AI Mentor. Ask me anything about projects, hackathons, papers, or career recommendations." },
  ]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/portfolio/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPortfolio(res.data);
      } catch (err) {
        console.error("Error loading student profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatBox]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!message.trim() || sending) return;

    const userQuery = message.trim();
    setChatBox((prev) => [...prev, { sender: "user", text: userQuery }]);
    setMessage("");
    setSending(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/ai/ask`,
        { message: userQuery },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setChatBox((prev) => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setChatBox((prev) => [...prev, { sender: "bot", text: "Unable to connect to the AI Mentor server right now." }]);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Accessing neural link...</div>;
  }

  const score = portfolio?.innovationScore || 0;

  return (
    <div className="student-ai-mentor-scope">
      <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1", display: "flex", flexDirection: "column" }}>
          
          {/* TOPBAR */}
          <header className="topbar" style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "700" }}>
              <i className="fas fa-robot" style={{ marginRight: "12px", color: "var(--purple)" }}></i>
              AI Mentor Advisor
            </h1>
            <p style={{ color: "var(--text2)", fontSize: "14px" }}>Personalized career and innovation recommendations</p>
          </header>

          {/* METRICS HEADER CARDS */}
          <section className="stats" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", marginBottom: "24px" }}>
            <div className="stat-card innovation">
              <i className="fas fa-bolt"></i>
              <h4>Innovation Score</h4>
              <h2>{score}%</h2>
            </div>
            <div className="stat-card projects">
              <i className="fas fa-folder-open"></i>
              <h4>Projects</h4>
              <h2>{portfolio?.projects?.length || 0}</h2>
            </div>
            <div className="stat-card certificates">
              <i className="fas fa-award"></i>
              <h4>Certificates</h4>
              <h2>{portfolio?.certificates?.length || 0}</h2>
            </div>
            <div className="stat-card hackathons">
              <i className="fas fa-trophy"></i>
              <h4>Hackathons</h4>
              <h2>{portfolio?.hackathons?.length || 0}</h2>
            </div>
          </section>

          {/* PROFILE ANALYSIS BOX */}
          <section className="ai-analysis" style={{ marginBottom: "28px" }}>
            <div className="analysis-card" style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
              <h2 style={{ fontSize: "16px", marginBottom: "12px" }}>
                <i className="fas fa-chart-line" style={{ marginRight: "8px", color: "var(--purple)" }}></i>
                Innovation Strength Analysis
              </h2>
              <p className="welcome" style={{ fontSize: "14px", color: "var(--text2)", marginBottom: "16px" }}>
                Hello {portfolio?.fullName || user?.fullName}, here is my custom assessment of your growth path:
              </p>

              <div className="analysis-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="box strengths" style={{ background: "rgba(107,203,119,0.06)", border: "1px solid rgba(107,203,119,0.15)", padding: "16px", borderRadius: "8px" }}>
                  <h3 style={{ fontSize: "14px", color: "#6BCB77", marginBottom: "8px" }}>
                    <i className="fas fa-check" style={{ marginRight: "6px" }}></i>
                    Strengths
                  </h3>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text)", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {score >= 80 ? <li>Excellent overall Innovation score ({score}%)</li> : <li>Steady growth path</li>}
                    {portfolio?.academics?.cgpa >= 8 ? <li>Strong Academic Performance (CGPA: {portfolio.academics.cgpa})</li> : null}
                    {portfolio?.projects?.length > 0 ? <li>Active project developer</li> : null}
                    {portfolio?.certificates?.length > 0 ? <li>Good certification portfolio</li> : null}
                  </ul>
                </div>

                <div className="box improvements" style={{ background: "rgba(255,107,107,0.04)", border: "1px solid rgba(255,107,107,0.15)", padding: "16px", borderRadius: "8px" }}>
                  <h3 style={{ fontSize: "14px", color: "#FF6B6B", marginBottom: "8px" }}>
                    <i className="fas fa-exclamation-triangle" style={{ marginRight: "6px" }}></i>
                    Areas to Improve
                  </h3>
                  <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text)", display: "flex", flexDirection: "column", gap: "4px" }}>
                    {portfolio?.internships?.length === 0 && <li>Complete at least one industry internship</li>}
                    {portfolio?.projects?.length < 3 && <li>Add more project items (target at least 3)</li>}
                    {portfolio?.hackathons?.length === 0 && <li>Participate in national level hackathons</li>}
                    {portfolio?.research?.length === 0 && <li>Co-author or publish a research paper</li>}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CHAT INTERACTIVE WINDOW */}
          <section className="chat-section" style={{ flex: 1, background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: "16px", display: "flex", flexDirection: "column", overflow: "hidden", minHeight: "350px" }}>
            <div className="chat-header" style={{ padding: "14px 20px", borderBottom: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "600" }}>
                <i className="fas fa-comments" style={{ marginRight: "8px" }}></i>
                Ask AI Mentor
              </h2>
            </div>

            {/* CHAT MESSAGES PANEL */}
            <div className="chat-box" style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
              {chatBox.map((chat, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: chat.sender === "user" ? "flex-end" : "flex-start" }}>
                  {chat.sender !== "user" && (
                    <div className="bot-avatar" style={{ marginRight: "10px", fontSize: "16px", background: "linear-gradient(135deg, var(--purple), var(--cyan))", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <i className="fas fa-robot"></i>
                    </div>
                  )}
                  <div
                    className="msg-bubble"
                    style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: "12px",
                      fontSize: "13px",
                      lineHeight: "1.5",
                      whiteSpace: "pre-line",
                      background: chat.sender === "user" ? "var(--purple)" : "var(--bg3)",
                      color: "#fff",
                      border: chat.sender === "user" ? "none" : "1px solid var(--border)",
                    }}
                  >
                    {chat.text}
                  </div>
                </div>
              ))}
              {sending && (
                <div style={{ display: "flex" }}>
                  <div className="bot-avatar" style={{ marginRight: "10px", fontSize: "16px", background: "linear-gradient(135deg, var(--purple), var(--cyan))", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <i className="fas fa-robot"></i>
                  </div>
                  <div className="msg-bubble" style={{ padding: "12px 16px", borderRadius: "12px", fontSize: "13px", background: "var(--bg3)", border: "1px solid var(--border)", color: "var(--text2)" }}>
                    Analyzing metrics and generating advice...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* INPUT FORM */}
            <form onSubmit={handleSendMessage} style={{ display: "flex", borderTop: "1px solid var(--border)", padding: "12px 16px", gap: "12px", background: "var(--bg)" }}>
              <input
                type="text"
                placeholder="Ask your AI Mentor about career advice, project reviews, or hackathons..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{
                  flex: 1,
                  background: "var(--bg3)",
                  border: "1px solid var(--border)",
                  color: "#fff",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <button type="submit" disabled={sending || !message.trim()} style={{ background: "linear-gradient(135deg, var(--purple), var(--cyan))", color: "#fff", border: "none", width: "45px", height: "45px", borderRadius: "8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </section>

        </main>
      </div>
    </div>
  );
}
