import { API_URL } from "../config";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import "../styles/admin-dashboard.css";

export default function AdminDashboard({ user, token, onLogout }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Selected user details (for edit or delete)
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Fields
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formFullName, setFormFullName] = useState("");
  const [formRole, setFormRole] = useState("student");
  const [formDepartment, setFormDepartment] = useState("");
  const [formSemester, setFormSemester] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
      setFilteredUsers(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.msg || "Failed to load users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Handle local searching/filtering
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (u) =>
          u.username.toLowerCase().includes(query) ||
          u.fullName.toLowerCase().includes(query) ||
          u.role.toLowerCase().includes(query) ||
          (u.department && u.department.toLowerCase().includes(query))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  // Calculate stats
  const totalUsers = users.length;
  const totalStudents = users.filter((u) => u.role === "student").length;
  const totalFaculty = users.filter((u) => u.role === "faculty").length;
  const totalHODs = users.filter((u) => u.role === "hod").length;

  // Open add user modal
  const openAddModal = () => {
    setFormUsername("");
    setFormPassword("");
    setFormFullName("");
    setFormRole("student");
    setFormDepartment("");
    setFormSemester("");
    setFormError("");
    setFormSuccess("");
    setShowAddModal(true);
  };

  // Open edit user modal
  const openEditModal = (u) => {
    setSelectedUser(u);
    setFormUsername(u.username);
    setFormPassword(""); // Leave password blank unless updating
    setFormFullName(u.fullName);
    setFormRole(u.role);
    setFormDepartment(u.department || "");
    setFormSemester(u.semester || "");
    setFormError("");
    setFormSuccess("");
    setShowEditModal(true);
  };

  // Open delete user modal
  const openDeleteModal = (u) => {
    setSelectedUser(u);
    setShowDeleteModal(true);
  };

  // Submit new user
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formUsername || !formPassword || !formFullName || !formRole) {
      setFormError("Please fill out all required fields.");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/admin/users`,
        {
          username: formUsername,
          password: formPassword,
          role: formRole,
          fullName: formFullName,
          department: formDepartment,
          semester: formRole === "student" ? formSemester : undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormSuccess("User created successfully!");
      setTimeout(() => {
        setShowAddModal(false);
        fetchUsers();
      }, 1000);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.msg || "Error creating user.");
    }
  };

  // Submit edit user
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formUsername || !formFullName || !formRole) {
      setFormError("Username, Full Name, and Role are required.");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/admin/users/${selectedUser._id}`,
        {
          username: formUsername,
          fullName: formFullName,
          role: formRole,
          department: formDepartment,
          semester: formRole === "student" ? formSemester : "",
          password: formPassword || undefined, // Only send if updating password
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFormSuccess("User updated successfully!");
      setTimeout(() => {
        setShowEditModal(false);
        fetchUsers();
      }, 1000);
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.msg || "Error updating user.");
    }
  };

  // Delete user
  const handleDeleteUserConfirm = async () => {
    try {
      await axios.delete(`${API_URL}/api/admin/users/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Error deleting user.");
    }
  };

  return (
    <div className="admin-dashboard-scope">
      <div className="container">
        <Sidebar user={user} onLogout={onLogout} />

        <main className="main-content">
          {/* HEADER */}
          <div className="page-header">
            <h1>Administrative Control Center</h1>
            <p className="subtitle">Manage user accounts, roles, and platform permissions</p>
          </div>

          {error && (
            <div style={{ background: "rgba(244,63,94,0.1)", border: "1px solid #f43f5e", padding: "16px", borderRadius: "12px", color: "#f43f5e", marginBottom: "24px" }}>
              {error}
            </div>
          )}

          {/* KPI STATS CARDS */}
          <div className="kpi-row">
            <div className="kpi-card">
              <div className="kpi-val">{totalUsers}</div>
              <div className="kpi-label">Total Registered Users</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">{totalStudents}</div>
              <div className="kpi-label">Students</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">{totalFaculty}</div>
              <div className="kpi-label">Faculty Advisors</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-val">{totalHODs}</div>
              <div className="kpi-label">Heads of Dept (HOD)</div>
            </div>
          </div>

          {/* CONTROLS ROW */}
          <div className="controls-panel">
            <div className="search-bar">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, ID, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-primary" onClick={openAddModal}>
              <i className="fas fa-plus"></i> Add New User
            </button>
          </div>

          {/* USERS DATA TABLE */}
          {loading ? (
            <div style={{ color: "#94a3b8", textAlign: "center", padding: "40px" }}>Loading platform users list...</div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>User ID / PRN</th>
                    <th>Full Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Semester</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u._id}>
                        <td style={{ fontWeight: "600", color: "white" }}>{u.username}</td>
                        <td>{u.fullName}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>{u.role}</span>
                        </td>
                        <td>{u.department || "—"}</td>
                        <td>{u.role === "student" ? u.semester || "—" : "—"}</td>
                        <td>
                          <div className="actions-col">
                            <button className="btn-icon edit" onClick={() => openEditModal(u)} title="Edit User">
                              <i className="fas fa-edit"></i>
                            </button>
                            {u._id !== user.id && (
                              <button className="btn-icon delete" onClick={() => openDeleteModal(u)} title="Delete User">
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create User Account</h3>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            {formError && <div style={{ color: "#f43f5e", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{formError}</div>}
            {formSuccess && <div style={{ color: "#10b981", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{formSuccess}</div>}
            <form onSubmit={handleAddUserSubmit}>
              <div className="form-group">
                <label>Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Advisor</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>User ID / Username</label>
                <input
                  type="text"
                  placeholder={formRole === "student" ? "PRN (e.g. 241010)" : "Username (e.g. employee_id)"}
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="E.g. Prof. Rajesh Patil"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  placeholder="Set initial password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  placeholder="E.g. AI & ML"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                />
              </div>
              {formRole === "student" && (
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    placeholder="E.g. Sem 4"
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User Account</h3>
              <button className="btn-close" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            {formError && <div style={{ color: "#f43f5e", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{formError}</div>}
            {formSuccess && <div style={{ color: "#10b981", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>{formSuccess}</div>}
            <form onSubmit={handleEditUserSubmit}>
              <div className="form-group">
                <label>Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty Advisor</option>
                  <option value="hod">Head of Department (HOD)</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>
              <div className="form-group">
                <label>User ID / Username</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={formFullName}
                  onChange={(e) => setFormFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="Enter new password to change"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input
                  type="text"
                  value={formDepartment}
                  onChange={(e) => setFormDepartment(e.target.value)}
                />
              </div>
              {formRole === "student" && (
                <div className="form-group">
                  <label>Semester</label>
                  <input
                    type="text"
                    value={formSemester}
                    onChange={(e) => setFormSemester(e.target.value)}
                  />
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm User Deletion</h3>
              <button className="btn-close" onClick={() => setShowDeleteModal(false)}>&times;</button>
            </div>
            <div style={{ color: "#cbd5e1", marginBottom: "24px", lineHeight: "1.6" }}>
              Are you sure you want to delete user <strong style={{ color: "white" }}>{selectedUser?.fullName} ({selectedUser?.username})</strong>?
              {selectedUser?.role === "student" && (
                <div style={{ marginTop: "12px", background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)", padding: "12px", borderRadius: "8px", color: "#f43f5e" }}>
                  <i className="fas fa-exclamation-triangle" style={{ marginRight: "8px" }}></i>
                  <strong>Warning:</strong> Deleting this student will also delete their entire portfolio record. This action is permanent!
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDeleteUserConfirm}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
