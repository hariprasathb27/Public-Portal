import { useState, useEffect } from "react";
import { 
  LayoutDashboard, List, CheckCircle2, 
  Clock, AlertCircle, X, ShieldCheck, Users
} from "lucide-react";
import api from "./api";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("all");
  const [complaints, setComplaints] = useState([]);
  const [officersList, setOfficersList] = useState([]); // Puthu state for officers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Assign State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [assignForm, setAssignForm] = useState({ officerId: "", remarks: "" });
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchAllComplaints();
    fetchOfficers(); // Load officers on mount
  }, []);

  async function fetchAllComplaints() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/complaints");
      setComplaints(response.data);
    } catch (err) {
      setError("Failed to load all complaints. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // Puthu function to get officers list
  async function fetchOfficers() {
    try {
      const response = await api.get("/admin/officers");
      setOfficersList(response.data);
    } catch (err) {
      console.error("Failed to load officers list", err);
    }
  }

  async function viewDetails(complaint) {
    setSelectedComplaint(complaint);
    setAssignForm({ officerId: complaint.assignedOfficerId || "", remarks: "" });
    setLoadingHistory(true);
    try {
      const response = await api.get(`/complaints/${complaint.id}/history`);
      setHistory(response.data);
    } catch (err) {
      alert("Failed to load complaint history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleAssignOfficer(e) {
    e.preventDefault();
    if (!assignForm.officerId) {
      alert("Please select an Officer.");
      return;
    }
    
    setAssigning(true);
    try {
      await api.patch(`/complaints/${selectedComplaint.id}/assign`, {
        officerId: parseInt(assignForm.officerId),
        remarks: assignForm.remarks || "Assigned by Admin"
      });
      
      await fetchAllComplaints();
      
      const updatedComplaint = { ...selectedComplaint, assignedOfficerId: assignForm.officerId, status: "ASSIGNED" };
      setSelectedComplaint(updatedComplaint);
      
      const histResponse = await api.get(`/complaints/${selectedComplaint.id}/history`);
      setHistory(histResponse.data);
      
      setAssignForm(prev => ({ ...prev, remarks: "" }));
      alert("Officer successfully assigned!");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign officer.");
    } finally {
      setAssigning(false);
    }
  }

  const total = complaints.length;
  const unassigned = complaints.filter(c => c.status === "SUBMITTED" && !c.assignedOfficerId).length;
  const resolved = complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;

  if (loading) {
    return (
      <div className="dashboard-layout glass-panel placeholder">
        <Clock size={40} className="spin" />
        <h2>Loading system data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout glass-panel placeholder">
        <AlertCircle size={40} style={{ color: "#fca5a5" }} />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchAllComplaints}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout glass-panel">
      <aside className="dashboard-sidebar">
        <h3>Admin Menu</h3>
        <nav>
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            <LayoutDashboard size={18} /> System Overview
          </button>
          <button className={activeTab === "all" ? "active" : ""} onClick={() => setActiveTab("all")}>
            <List size={18} /> All Complaints
          </button>
        </nav>
      </aside>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="fade-in">
            <h2 className="dashboard-title">System Overview</h2>
            <div className="stat-grid">
              <div className="stat-card">
                <ShieldCheck size={24} />
                <div>
                  <h4>Total Complaints</h4>
                  <span>{total}</span>
                </div>
              </div>
              <div className="stat-card pending">
                <Users size={24} />
                <div>
                  <h4>Needs Assignment</h4>
                  <span>{unassigned}</span>
                </div>
              </div>
              <div className="stat-card resolved">
                <CheckCircle2 size={24} />
                <div>
                  <h4>Fully Resolved</h4>
                  <span>{resolved}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "all" && (
          <div className="fade-in">
            <h2 className="dashboard-title">All System Complaints</h2>
            {complaints.length === 0 ? (
              <p className="empty-state">No complaints have been filed in the system yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Officer</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td>{c.complaintNumber.split("-")[1].slice(-6)}</td>
                        <td>{c.title}</td>
                        <td>{c.categoryName}</td>
                        <td>
                          <span className={`status-badge ${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.assignedOfficerName || <span style={{color:"#fca5a5"}}>Unassigned</span>}</td>
                        <td>
                          <button className="btn-link" onClick={() => viewDetails(c)}>Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h2>{selectedComplaint.title}</h2>
              <button className="btn-close" onClick={() => setSelectedComplaint(null)}><X size={24} /></button>
            </div>
            
            <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              <div>
                <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div><strong>ID:</strong> {selectedComplaint.complaintNumber}</div>
                  <div><strong>Reported By:</strong> {selectedComplaint.userName}</div>
                  <div><strong>Category:</strong> {selectedComplaint.categoryName}</div>
                  <div><strong>Location:</strong> {selectedComplaint.location}</div>
                  <div>
                    <strong>Status:</strong>{" "}
                    <span className={`status-badge ${selectedComplaint.status.toLowerCase()}`}>
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>
                <p className="detail-desc">{selectedComplaint.description}</p>
                
                <hr className="divider" style={{ margin: "20px 0" }} />
                
                <h3>Status History</h3>
                {loadingHistory ? <p>Loading history...</p> : (
                  <div className="history-timeline" style={{ maxHeight: "250px", overflowY: "auto", paddingRight: "10px" }}>
                    {history.length === 0 ? <p>No status updates yet.</p> : history.map(h => (
                      <div key={h.id} className="history-item">
                        <div className="history-dot"></div>
                        <div className="history-text">
                          <strong>{h.newStatus}</strong> by {h.changedByName}
                          <span>{new Date(h.createdAt).toLocaleString()}</span>
                          {h.remarks && <blockquote>"{h.remarks}"</blockquote>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "12px" }}>
                <h3>Assign to Officer</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Dispatch this complaint to a specific officer for resolution.
                </p>
                
                <form onSubmit={handleAssignOfficer} className="auth-form">
                  <label>Select Officer
                    {/* Ippa input ku bathila Dropdown vechachu */}
                    <select 
                      className="form-select"
                      required
                      value={assignForm.officerId}
                      onChange={e => setAssignForm({...assignForm, officerId: e.target.value})}
                    >
                      <option value="">-- Choose an Officer --</option>
                      {officersList.map(officer => (
                        <option key={officer.id} value={officer.id}>
                          {officer.name} (ID: {officer.id})
                        </option>
                      ))}
                    </select>
                  </label>
                  
                  <label>Assignment Remarks
                    <textarea 
                      rows="3"
                      placeholder="Optional instructions for the officer..."
                      value={assignForm.remarks}
                      onChange={e => setAssignForm({...assignForm, remarks: e.target.value})}
                    ></textarea>
                  </label>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: "100%", marginTop: "10px" }}
                    disabled={assigning}
                  >
                    {assigning ? "Assigning..." : "Assign Officer"}
                  </button>
                </form>

                {selectedComplaint.assignedOfficerName && (
                  <div style={{ marginTop: "20px", padding: "12px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", borderRadius: "8px" }}>
                    <strong style={{ color: "#6ee7b7", fontSize: "13px" }}>Currently Assigned To:</strong>
                    <p style={{ margin: "4px 0 0", fontSize: "14px" }}>{selectedComplaint.assignedOfficerName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}