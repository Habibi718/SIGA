import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function Settings({ user, token, onLogout }) {
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/portfolio/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setEmail(res.data.personalInfo?.email || "");
          setPhone(res.data.personalInfo?.phone || "");
          setFullName(res.data.fullName || user?.fullName || "");
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // 1. Save personal info update
      const res = await axios.get(`${API_URL}/api/portfolio/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentPayload = res.data || {};
      
      const updatedPayload = {
        ...currentPayload,
        fullName,
        personalInfo: {
          ...(currentPayload.personalInfo || {}),
          email,
          phone,
        }
      };

      await axios.post(`${API_URL}/api/portfolio/save`, updatedPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("🎉 Account settings successfully updated!");
    } catch (err) {
      console.error("Error updating settings:", err);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: "#fff", display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>Accessing core preferences...</div>;
  }

  return (
    <div className="settings-page-scope">
      <div className="dashboard">
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content" style={{ padding: "32px 40px", flex: "1" }}>
          
          <header className="topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
            <div>
              <h1 style={{ fontSize: "28px", fontWeight: "700" }}>Profile Settings</h1>
              <p style={{ color: "var(--text2)", fontSize: "14px" }}>Configure your personal coordinates and credentials</p>
            </div>
          </header>

          <div className="form-card" style={{ maxWidth: "680px" }}>
            <div className="form-card-header">
              <span>🛠️ Manage Account Preferences</span>
            </div>
            
            <form onSubmit={handleSave} className="form-card-body">
              <div className="form-row">
                <label>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>

              <div className="form-row" style={{ marginTop: "12px" }}>
                <label>Email Address</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="form-row" style={{ marginTop: "12px" }}>
                <label>Phone Number</label>
                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>

              <div className="form-row" style={{ marginTop: "12px" }}>
                <label>New Password (Optional)</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button type="submit" disabled={saving} className="btn-primary" style={{ cursor: "pointer", padding: "12px 24px" }}>
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

        </main>
      </div>
    </div>
  );
}
