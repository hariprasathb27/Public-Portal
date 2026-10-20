import { useState, useEffect } from "react";
import { 
  LayoutDashboard, List, CheckCircle2, 
  Clock, AlertCircle, X, ShieldAlert 
} from "lucide-react";
import api from "./api";

export default function OfficerDashboard() {
  const [activeTab, setActiveTab] = useState("assigned");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Update State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [statusForm, setStatusForm] = useState({ newStatus: "", remarks: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  async function fetchAssignedComplaints() {
    try {
      setLoading(true);
      setError("");
      // Using the exact endpoint from your OfficerController
      const response = await api.get("/officers/my-complaints");
      setComplaints(response.data);
    } catch (err) {
      setError("Failed to load assigned complaints. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function viewDetails(complaint) {
    setSelectedComplaint(complaint);
    setStatusForm({ newStatus: complaint.status, remarks: "" });
    setLoadingHistory(true);
    try {
      // History is fetched from the standard ComplaintController
      const response = await api.get(`/complaints/${complaint.id}/history`);
      setHistory(response.data);
    } catch (err) {
      alert("Failed to load complaint history.");
    } finally {
      setLoadingHistory(false);
    }
  }

  async function handleStatusUpdate(e) {
    e.preventDefault();
    if (statusForm.newStatus === selectedComplaint.status) {
      alert("Please select a different status to update.");
      return;
    }
    
    setUpdating(true);
    try {
      // Using the exact patch endpoint from your OfficerController
      await api.patch(`/officers/complaints/${selectedComplaint.id}/status`, {
        newStatus: statusForm.newStatus,
        remarks: statusForm.remarks
      });
      
      // Refresh data
      await fetchAssignedComplaints();
      
      // Update local selected complaint to reflect new status immediately
      const updatedComplaint = { ...selectedComplaint, status: statusForm.newStatus };
      setSelectedComplaint(updatedComplaint);
      
      // Reload history
      const histResponse = await api.get(`/complaints/${selectedComplaint.id}/history`);
      setHistory(histResponse.data);
      
      setStatusForm(prev => ({ ...prev, remarks: "" }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdating(false);
    }
  }

  // Calculate stats for the overview
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const pending = total - resolved;

  if (loading) {
    return (
      <div className="dashboard-layout glass-panel placeholder">
        <Clock size={40} className="spin" />
        <h2>Loading your assignments...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout glass-panel placeholder">
        <AlertCircle size={40} style={{ color: "#fca5a5" }} />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchAssignedComplaints}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout glass-panel">
      <aside className="dashboard-sidebar">
        <h3>Officer Menu</h3>
        <nav>
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            <LayoutDashboard size={18} /> Overview
          </button>
          <button className={activeTab === "assigned" ? "active" : ""} onClick={() => setActiveTab("assigned")}>
            <List size={18} /> My Assignments
          </button>
        </nav>
      </aside>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="fade-in">
            <h2 className="dashboard-title">Officer Overview</h2>
            <div className="stat-grid">
              <div className="stat-card">
                <ShieldAlert size={24} />
                <div>
                  <h4>Total Assigned</h4>
                  <span>{total}</span>
                </div>
              </div>
              <div className="stat-card pending">
                <Clock size={24} />
                <div>
                  <h4>Action Required</h4>
                  <span>{pending}</span>
                </div>
              </div>
              <div className="stat-card resolved">
                <CheckCircle2 size={24} />
                <div>
                  <h4>Resolved Tasks</h4>
                  <span>{resolved}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assigned" && (
          <div className="fade-in">
            <h2 className="dashboard-title">My Assignments</h2>
            {complaints.length === 0 ? (
              <p className="empty-state">You currently have no assigned complaints.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints.map(c => (
                      <tr key={c.id}>
                        <td>{c.complaintNumber.split("-")[1].slice(-6)}</td>
                        <td>{c.title}</td>
                        <td>{c.location}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
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

      {/* Details & Status Update Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel" style={{ maxWidth: "800px" }}>
            <div className="modal-header">
              <h2>{selectedComplaint.title}</h2>
              <button className="btn-close" onClick={() => setSelectedComplaint(null)}><X size={24} /></button>
            </div>
            
            <div className="modal-body" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
              {/* Left Column: Complaint Details & History */}
              <div>
                <div className="detail-grid" style={{ gridTemplateColumns: "1fr" }}>
                  <div><strong>ID:</strong> {selectedComplaint.complaintNumber}</div>
                  <div><strong>Reported By:</strong> {selectedComplaint.userName}</div>
                  <div><strong>Category:</strong> {selectedComplaint.categoryName}</div>
                  <div><strong>Location:</strong> {selectedComplaint.location}</div>
                  <div>
                    <strong>Current Status:</strong>{" "}
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

              {/* Right Column: Update Status Form */}
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "24px", borderRadius: "12px" }}>
                <h3>Update Resolution Status</h3>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>
                  Log your progress and inform the citizen of any updates.
                </p>
                
                <form onSubmit={handleStatusUpdate} className="auth-form">
                  <label>New Status
                    <select 
                      className="form-select" 
                      value={statusForm.newStatus}
                      onChange={e => setStatusForm({...statusForm, newStatus: e.target.value})}
                    >
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN PROGRESS</option>
                      <option value="RESOLVED">RESOLVED</option>
                      <option value="CLOSED">CLOSED</option>
                    </select>
                  </label>
                  
                  <label>Official Remarks (Visible to Citizen)
                    <textarea 
                      required
                      rows="4"
                      placeholder="E.g., Team dispatched to location. Repairs will be completed by 5 PM."
                      value={statusForm.remarks}
                      onChange={e => setStatusForm({...statusForm, remarks: e.target.value})}
                    ></textarea>
                  </label>
                  
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: "100%", marginTop: "10px" }}
                    disabled={updating || statusForm.newStatus === selectedComplaint.status}
                  >
                    {updating ? "Saving Update..." : "Update Status"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}