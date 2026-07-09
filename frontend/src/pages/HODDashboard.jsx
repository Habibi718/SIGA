import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import TrendChart from "../components/TrendChart";

export default function HODDashboard({ user, token, onLogout }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeNlQuery, setActiveNlQuery] = useState("");
  const [nlResponse, setNlResponse] = useState("");

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/hod/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error("Error loading HOD analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token]);

  const nlResponses = {
    "Students with no activity in Sem 3": "Students with no recorded activities in Semester 3:\n• Aditya Kulkarni (PRN: 241003) – 0 records\n• Sneha Mane (PRN: 241005) – 0 records\n• Vishal Deshpande (PRN: 241009) – 0 records\nRecommended nudge: Send automated alert via Faculty advisor.",
    "Ready for startup incubation": "Top 3 Student Prototypes recommended for Incubation Cell:\n1. Rahul Patil – 'AI Face Recognition Attendance' (Innovation index: 88)\n2. Priya Nair – 'IoT Smart Dustbin' (Patent filed, index: 82)\n3. Sneha Joshi – 'Campus Maps Nav' (Ready prototype, index: 76)",
    "Greatest innovation growth": "Greatest Innovation Index growth rate this quarter:\n• Rahul Patil (+18% points growth)\n• Priya Nair (+12% points growth)\n• Amit Desai (+9% points growth)\nBased on verified project submissions.",
    "Compare FY vs TY innovation": "Average Innovation Index Comparison:\n• First Year (FY) Avg Index: 68.2 (Focus on skill certifications)\n• Third Year (TY) Avg Index: 84.8 (Focus on patents, national hackathons)",
    "Recommend for national hackathon": "Top 5 students recommended for national hackathons:\n1. Rahul Patil – AI/ML domain strength\n2. Priya Nair – Prior finalist experience\n3. Amit Desai – Strong team player\n4. Sneha Joshi – Cloud & Data specialization\n5. Ananya Rao – Emerging talent, IoT projects",
    "Predict paper publishers": "AI prediction: likely to publish research papers before graduation:\n• Rahul Patil (92% confidence) – Active draft\n• Priya Nair (87%) – Prior conference paper\n• Sneha Joshi (71%) – High research interest score",
  };

  const handleNlQuery = (query) => {
    setActiveNlQuery(query);
    setNlResponse(nlResponses[query] || "Executing AI analyzer query...");
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Loading institutional database...</div>;
  }

  const { summary, departmentStats } = analytics || {
    summary: { totalStudents: 312, totalFaculty: 18, averageInnovationScore: 84, researchPapers: 46 },
    departmentStats: [
      { name: "AI & ML", count: 120, avgScore: 87, status: "Excellent" },
      { name: "Data Science", count: 102, avgScore: 82, status: "Good" },
      { name: "Cyber Security", count: 90, avgScore: 79, status: "Average" },
    ],
  };

  return (
    <div className="hod-dashboard-scope">
      <div className="container" style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          
          {/* HEADER */}
          <div className="page-header">
            <div>
              <h1>HOD Analytics Dashboard</h1>
              <p className="subtitle">Department of Computer Science · Institutional Growth Panel</p>
            </div>
          </div>

          {/* KPI METRICS ROW */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val">{summary.totalStudents}</div>
              <div className="kpi-label">Total Students</div>
            </div>
            <div className="kpi-card accent">
              <div className="kpi-val">{summary.averageInnovationScore}%</div>
              <div className="kpi-label">Dept Innovation Index</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">{summary.researchPapers}</div>
              <div className="kpi-label">Research Papers</div>
            </div>
            <div className="kpi-card accent2">
              <div className="kpi-val">{summary.totalFaculty}</div>
              <div className="kpi-label">Total Faculty Advisors</div>
            </div>
          </div>

          {/* HEAT MAP & FIVE YEAR TREND */}
          <div className="charts-row">
            {/* Heat Map */}
            <div className="chart-card">
              <div className="card-header">
                <h3>
                  <i className="fas fa-fire" style={{ color: "var(--red)", marginRight: "8px" }}></i>
                  Innovation Heat Map
                </h3>
              </div>
              <div className="heatmap">
                <div className="hm-row" style={{ "--level": 0.45 }}>
                  <span>Sem 1</span>
                  <div className="hm-bar"><div className="hm-fill"></div></div>
                  <span>45% (Low)</span>
                </div>
                <div className="hm-row" style={{ "--level": 0.62 }}>
                  <span>Sem 2</span>
                  <div className="hm-bar"><div className="hm-fill"></div></div>
                  <span>62% (Medium)</span>
                </div>
                <div className="hm-row" style={{ "--level": 0.74 }}>
                  <span>Sem 3</span>
                  <div className="hm-bar"><div className="hm-fill"></div></div>
                  <span>74% (High)</span>
                </div>
                <div className="hm-row" style={{ "--level": 0.84 }}>
                  <span>Sem 4</span>
                  <div className="hm-bar"><div className="hm-fill"></div></div>
                  <span>84% (Excellent)</span>
                </div>
                <div className="hm-row" style={{ "--level": 0.89 }}>
                  <span>Sem 5</span>
                  <div className="hm-bar"><div className="hm-fill"></div></div>
                  <span>89% (Incubate)</span>
                </div>
                <div className="hm-row" style={{ "--level": 0.94 }}>
                  <span>Sem 6</span>
                  <div className="hm-bar"><div className="hm-fill"></div></div>
                  <span>94% (Incubate)</span>
                </div>
              </div>
            </div>

            {/* 5-Year Trend */}
            <div className="chart-card wide" style={{ minWidth: "0" }}>
              <div className="card-header">
                <h3>
                  <i className="fas fa-chart-line" style={{ color: "var(--cyan)", marginRight: "8px" }}></i>
                  5-Year Innovation Trend
                </h3>
              </div>
              <div style={{ height: "250px", position: "relative" }}>
                <TrendChart />
              </div>
            </div>
          </div>

          {/* AI NL QUERY BOX */}
          <div className="chart-card full" style={{ marginTop: "24px" }}>
            <div className="card-header">
              <h3>
                <i className="fas fa-robot" style={{ color: "var(--purple)", marginRight: "8px" }}></i>
                AI Natural Language Query Console
              </h3>
            </div>
            <div className="nl-query-box">
              <div className="quick-queries">
                <button onClick={() => handleNlQuery("Students with no activity in Sem 3")}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: "6px" }}></i> Advisors alert (Sem 3)
                </button>
                <button onClick={() => handleNlQuery("Ready for startup incubation")}>
                  <i className="fas fa-rocket" style={{ marginRight: "6px" }}></i> Incubation recommendation
                </button>
                <button onClick={() => handleNlQuery("Greatest innovation growth")}>
                  <i className="fas fa-chart-line" style={{ marginRight: "6px" }}></i> Growth trajectories
                </button>
                <button onClick={() => handleNlQuery("Compare FY vs TY innovation")}>
                  <i className="fas fa-chart-bar" style={{ marginRight: "6px" }}></i> FY vs TY compare
                </button>
                <button onClick={() => handleNlQuery("Recommend for national hackathon")}>
                  <i className="fas fa-trophy" style={{ marginRight: "6px" }}></i> Hackathon recommendation
                </button>
                <button onClick={() => handleNlQuery("Predict paper publishers")}>
                  <i className="fas fa-file-alt" style={{ marginRight: "6px" }}></i> Predict publishers
                </button>
              </div>

              {activeNlQuery && (
                <div className={`nl-result ${activeNlQuery ? "visible" : ""}`} style={{ marginTop: "16px", whiteSpace: "pre-line" }}>
                  <strong style={{ color: "var(--cyan)", display: "block", marginBottom: "8px" }}>Query: "{activeNlQuery}"</strong>
                  <p>{nlResponse}</p>
                </div>
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
