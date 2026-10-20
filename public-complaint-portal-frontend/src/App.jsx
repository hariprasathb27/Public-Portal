import { useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useLocation
} from "react-router-dom";
import {
  ShieldCheck,
  LayoutDashboard,
  ClipboardList,
  LogIn,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  LogOut,
  Users,
  UserCheck
} from "lucide-react";
import api from "./api";
import "./index.css";
import CitizenDashboard from "./CitizenDashboard";
import OfficerDashboard from "./OfficerDashboard";
import AdminDashboard from "./AdminDashboard";

function getRolePath(role) {
  switch (role) {
    case "CITIZEN": return "/citizen";
    case "OFFICER": return "/officer";
    case "ADMIN": return "/admin";
    default: return "/login";
  }
}

function Navbar() {
  const token = sessionStorage.getItem("accessToken");

  function logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("userRole");
    window.location.assign("/");
  }

  return (
    <header className="navbar glass-panel">
      <NavLink to="/" className="brand">
        <div className="brand-icon"><ShieldCheck size={22} /></div>
        <span>Public<span className="brand-accent">Portal</span></span>
      </NavLink>

      <nav className="nav-links">
        <NavLink to="/" end>Home</NavLink>
        {!token && <NavLink to="/login">Login</NavLink>}
        {!token && <NavLink to="/register" className="nav-btn">Get Started</NavLink>}
        {token && (
          <button className="nav-logout" onClick={logout}>
            <LogOut size={16} /> Logout
          </button>
        )}
      </nav>
    </header>
  );
}

function Home() {
  const token = sessionStorage.getItem("accessToken");
  const role = sessionStorage.getItem("userRole");

  return (
    <main className="hero">
      <div className="hero-content">
        <div className="eyebrow glass-panel">
          <span className="status-dot" />
          SYSTEM LIVE & OPERATIONAL
        </div>

        <h1>
          A clearer way to report <br />
          <span className="text-highlight">community issues.</span>
        </h1>

        <p className="hero-description">
          A dedicated portal for citizens to log public complaints, track progress in real-time, and ensure accountability from local departments.
        </p>

        <div className="hero-actions">
          {!token ? (
            <>
              <NavLink to="/register" className="btn btn-primary">
                Submit Complaint <ArrowRight size={18} />
              </NavLink>
              <NavLink to="/login" className="btn btn-secondary glass-panel">
                Login to Portal
              </NavLink>
            </>
          ) : (
            <NavLink to={getRolePath(role)} className="btn btn-primary">
              Go to Dashboard <ArrowRight size={18} />
            </NavLink>
          )}
        </div>

        <div className="feature-row glass-panel">
          <div className="feature">
            <LayoutDashboard size={22} className="feature-icon" />
            <div>
              <strong>Centralized Dashboard</strong>
              <span>Manage all reports in one place</span>
            </div>
          </div>
          <div className="feature">
            <ClipboardList size={22} className="feature-icon" />
            <div>
              <strong>Real-time Tracking</strong>
              <span>Follow the status of your issue</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-visual">
        <div className="visual-card glass-panel">
          <div className="visual-card-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Live status updates</p>
            </div>
            <span className="badge">Updated just now</span>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon blue"><Clock size={16} /></div>
              <div className="activity-details">
                <strong>Streetlight Malfunction</strong>
                <span>Assigned to Electrical Dept.</span>
              </div>
              <span className="activity-time">2m ago</span>
            </div>
            <div className="activity-item">
              <div className="activity-icon green"><CheckCircle2 size={16} /></div>
              <div className="activity-details">
                <strong>Water Irrigation Issue</strong>
                <span>Status changed to Resolved</span>
              </div>
              <span className="activity-time">1h ago</span>
            </div>
            <div className="activity-item">
              <div className="activity-icon purple"><MessageSquare size={16} /></div>
              <div className="activity-details">
                <strong>Road Damage</strong>
                <span>New complaint submitted</span>
              </div>
              <span className="activity-time">3h ago</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// --- NEW PORTAL SELECTION SCREEN ---
function LoginSelector() {
  return (
    <main className="placeholder">
      <div className="placeholder-card glass-panel" style={{ maxWidth: "500px", padding: "40px" }}>
        <div className="placeholder-icon"><LogIn size={28} /></div>
        <h2>Select Login Portal</h2>
        <p style={{ marginBottom: "32px" }}>Please select your authorized account type to continue.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <NavLink to="/login/citizen" className="btn btn-secondary" style={{ height: "60px", justifyContent: "flex-start", paddingLeft: "24px" }}>
            <Users size={20} style={{ marginRight: "12px", color: "#60a5fa" }} /> 
            Citizen Portal
          </NavLink>
          
          <NavLink to="/login/officer" className="btn btn-secondary" style={{ height: "60px", justifyContent: "flex-start", paddingLeft: "24px" }}>
            <UserCheck size={20} style={{ marginRight: "12px", color: "#34d399" }} /> 
            Officer Portal
          </NavLink>
          
          <NavLink to="/login/admin" className="btn btn-secondary" style={{ height: "60px", justifyContent: "flex-start", paddingLeft: "24px" }}>
            <ShieldCheck size={20} style={{ marginRight: "12px", color: "#f87171" }} /> 
            Admin Secure Portal
          </NavLink>
        </div>
      </div>
    </main>
  );
}

// --- UPDATED AUTH FORM (Handles strict role checks) ---
function AuthForm({ isRegister = false, portalType = "CITIZEN" }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      if (isRegister) {
        await api.post("/auth/register", {
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim(),
        });
        setSuccess("Registration successful! You can now log in.");
        setTimeout(() => navigate("/login/citizen"), 1500);
      } else {
        const response = await api.post("/auth/login", {
          email: form.email.trim(),
          password: form.password,
        });

        const { token, role } = response.data;
        if (!token || !role) throw new Error("Invalid login response.");

        // STRICT SEPARATION CHECK: Verify the user is logging into the correct portal!
        if (role !== portalType) {
          throw new Error(`Access Denied: You are trying to log into the ${portalType} portal using a ${role} account.`);
        }

        sessionStorage.setItem("accessToken", token);
        sessionStorage.setItem("userRole", role);
        navigate(getRolePath(role), { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      if (err.message.includes("Access Denied")) setError(err.message);
      else if (status === 401) setError("Incorrect email or password.");
      else if (status === 403) setError("You are not permitted to perform this action.");
      else if (status === 409) setError("An account with this email already exists.");
      else if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response) setError(`Request failed (${status}). Please check your details.`);
      else setError("Cannot connect to the backend. Check that Spring Boot is running.");
    } finally {
      setLoading(false);
    }
  }

  // Dynamic titles based on the portal
  const portalTitles = {
    CITIZEN: "Citizen Login",
    OFFICER: "Officer Portal",
    ADMIN: "Admin Access"
  };

  return (
    <main className="auth-page">
      <section className="auth-card glass-panel">
        <div className="placeholder-icon">
          {portalType === "ADMIN" ? <ShieldCheck size={28} color="#f87171" /> : 
           portalType === "OFFICER" ? <UserCheck size={28} color="#34d399" /> : 
           <Users size={28} color="#60a5fa" />}
        </div>
        
        <h1>{isRegister ? "Create Citizen Account" : portalTitles[portalType]}</h1>
        <p className="auth-subtitle">
          {isRegister
            ? "Register to report and track public complaints."
            : `Sign in to access your authorized ${portalType.toLowerCase()} dashboard.`}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegister && (
            <label>Full name
              <input name="name" value={form.name} onChange={handleChange} placeholder="Enter your full name" required />
            </label>
          )}
          <label>Email address
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
          </label>
          {isRegister && (
            <label>Phone number
              <input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="Enter your phone number" required />
            </label>
          )}
          <label>Password
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Enter your password" minLength={isRegister ? 8 : undefined} required />
          </label>

          {error && <p className="auth-error">{error}</p>}
          {success && <p className="auth-success">{success}</p>}

          <button className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Please wait..." : isRegister ? "Create account" : "Secure Login"}
          </button>
        </form>

        {/* Only show registration link for Citizens */}
        {portalType === "CITIZEN" && (
          <p className="auth-switch">
            {isRegister ? "Already registered?" : "New to the portal?"}{" "}
            <NavLink to={isRegister ? "/login/citizen" : "/register"}>
              {isRegister ? "Login here" : "Create an account"}
            </NavLink>
          </p>
        )}
        
        {/* Navigation back to selection screen */}
        {!isRegister && (
          <p className="auth-switch" style={{ marginTop: "16px" }}>
            <NavLink to="/login" style={{ color: "var(--text-muted)", fontWeight: "normal" }}>
              ← Change Portal Type
            </NavLink>
          </p>
        )}
      </section>
    </main>
  );
}

function ProtectedRoute({ allowedRole, children }) {
  const token = sessionStorage.getItem("accessToken");
  const role = sessionStorage.getItem("userRole");

  if (!token) return <Navigate to="/login" replace />;
  if (role !== allowedRole) return <Navigate to={getRolePath(role)} replace />;
  
  return children;
}

function Layout() {
  const location = useLocation();

  const getBackgroundImage = () => {
    if (location.pathname.includes("/admin") || location.pathname.includes("/officer")) {
      return 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop")';
    }
    switch (location.pathname) {
      case '/': return 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop")';
      case '/login': return 'url("https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2000&auto=format&fit=crop")';
      case '/register': return 'url("https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2000&auto=format&fit=crop")';
      default: return 'url("https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop")';
    }
  };

  return (
    <div className="page-wrapper" style={{ backgroundImage: getBackgroundImage() }}>
      <div className="page-overlay">
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            
            {/* NEW ROUTING SETUP FOR SEPARATE LOGINS */}
            <Route path="/login" element={sessionStorage.getItem("accessToken") ? <Navigate to={getRolePath(sessionStorage.getItem("userRole"))} replace /> : <LoginSelector />} />
            <Route path="/login/citizen" element={sessionStorage.getItem("accessToken") ? <Navigate to={getRolePath(sessionStorage.getItem("userRole"))} replace /> : <AuthForm portalType="CITIZEN" />} />
            <Route path="/login/officer" element={sessionStorage.getItem("accessToken") ? <Navigate to={getRolePath(sessionStorage.getItem("userRole"))} replace /> : <AuthForm portalType="OFFICER" />} />
            <Route path="/login/admin" element={sessionStorage.getItem("accessToken") ? <Navigate to={getRolePath(sessionStorage.getItem("userRole"))} replace /> : <AuthForm portalType="ADMIN" />} />
            
            <Route path="/register" element={sessionStorage.getItem("accessToken") ? <Navigate to={getRolePath(sessionStorage.getItem("userRole"))} replace /> : <AuthForm isRegister portalType="CITIZEN" />} />
            
            {/* Dashboard Routes */}
            <Route path="/citizen" element={<ProtectedRoute allowedRole="CITIZEN"><CitizenDashboard /></ProtectedRoute>} />
            <Route path="/officer" element={<ProtectedRoute allowedRole="OFFICER"><OfficerDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <footer className="site-footer glass-panel">
            <div className="footer-content">
              <span>Public Complaint Portal &copy; 2026</span>
              <span className="footer-links">Securely managed by role-based access.</span>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;