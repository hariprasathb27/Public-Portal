import { useState, useEffect } from "react";
import { 
  BarChart3, List, PlusCircle, AlertCircle, 
  CheckCircle2, Clock, FileText, X 
} from "lucide-react";
import api from "./api";

export default function CitizenDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form State
  const [form, setForm] = useState({ title: "", description: "", location: "", categoryId: 1 });
  const [submitting, setSubmitting] = useState(false);

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  async function fetchComplaints() {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/complaints/my");
      setComplaints(response.data);
    } catch (err) {
      setError("Failed to load complaints. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/complaints", form);
      setForm({ title: "", description: "", location: "", categoryId: 1 });
      await fetchComplaints();
      setActiveTab("list");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit complaint.");
    } finally {
      setSubmitting(false);
    }
  }

  async function viewDetails(complaint) {
    setSelectedComplaint(complaint);
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

  // Calculate stats
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length;
  const pending = total - resolved;

  if (loading) {
    return (
      <div className="dashboard-layout glass-panel placeholder">
        <Clock size={40} className="spin" />
        <h2>Loading your data...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout glass-panel placeholder">
        <AlertCircle size={40} style={{ color: "#fca5a5" }} />
        <h2>Connection Error</h2>
        <p>{error}</p>
        <button className="btn btn-secondary" onClick={fetchComplaints}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout glass-panel">
      <aside className="dashboard-sidebar">
        <h3>Citizen Menu</h3>
        <nav>
          <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
            <BarChart3 size={18} /> Overview
          </button>
          <button className={activeTab === "list" ? "active" : ""} onClick={() => setActiveTab("list")}>
            <List size={18} /> My Complaints
          </button>
          <button className={activeTab === "submit" ? "active" : ""} onClick={() => setActiveTab("submit")}>
            <PlusCircle size={18} /> New Complaint
          </button>
        </nav>
      </aside>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="fade-in">
            <h2 className="dashboard-title">Dashboard Overview</h2>
            <div className="stat-grid">
              <div className="stat-card">
                <FileText size={24} />
                <div>
                  <h4>Total Filed</h4>
                  <span>{total}</span>
                </div>
              </div>
              <div className="stat-card pending">
                <Clock size={24} />
                <div>
                  <h4>In Progress</h4>
                  <span>{pending}</span>
                </div>
              </div>
              <div className="stat-card resolved">
                <CheckCircle2 size={24} />
                <div>
                  <h4>Resolved</h4>
                  <span>{resolved}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "list" && (
          <div className="fade-in">
            <h2 className="dashboard-title">My Complaints</h2>
            {complaints.length === 0 ? (
              <p className="empty-state">You have not filed any complaints yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
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
                        <td>{c.categoryName || `Category ${c.categoryId}`}</td>
                        <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge ${c.status.toLowerCase()}`}>
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <button className="btn-link" onClick={() => viewDetails(c)}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "submit" && (
          <div className="fade-in max-w-form">
            <h2 className="dashboard-title">Report a New Issue</h2>
            <form onSubmit={handleSubmit} className="auth-form">
              <label>Complaint Title
                <input name="title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="E.g., Broken streetlight on Main St" />
              </label>
              <label>Location
                <input name="location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required placeholder="Specific address or landmark" />
              </label>
              <label>Category
                <select name="categoryId" value={form.categoryId} onChange={e => setForm({...form, categoryId: parseInt(e.target.value)})} className="form-select">
                  <option value={1}>Roads & Infrastructure</option>
                  <option value={2}>Water & Sanitation</option>
                  <option value={3}>Electricity & Lighting</option>
                  <option value={4}>Public Safety</option>
                </select>
              </label>
              <label>Description
                <textarea name="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows="4" placeholder="Provide detailed information about the issue..."></textarea>
              </label>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedComplaint && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>{selectedComplaint.title}</h2>
              <button className="btn-close" onClick={() => setSelectedComplaint(null)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div><strong>Complaint ID:</strong> {selectedComplaint.complaintNumber}</div>
                <div><strong>Status:</strong> <span className={`status-badge ${selectedComplaint.status.toLowerCase()}`}>{selectedComplaint.status}</span></div>
                <div><strong>Location:</strong> {selectedComplaint.location}</div>
                <div><strong>Assigned To:</strong> {selectedComplaint.assignedOfficerName || "Pending Assignment"}</div>
              </div>
              <p className="detail-desc">{selectedComplaint.description}</p>
              
              <hr className="divider" />
              <h3>Status History</h3>
              {loadingHistory ? <p>Loading history...</p> : (
                <div className="history-timeline">
                  {history.length === 0 ? <p>No status updates yet.</p> : history.map(h => (
                    <div key={h.id} className="history-item">
                      <div className="history-dot"></div>
                      <div className="history-text">
                        <strong>Changed to {h.newStatus}</strong> by {h.changedByName}
                        <span>{new Date(h.createdAt).toLocaleString()}</span>
                        {h.remarks && <blockquote>"{h.remarks}"</blockquote>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}