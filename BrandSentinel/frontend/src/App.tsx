import { useEffect, useState, type FormEvent } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  FileCheck,
  Settings,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  Clock,
  Menu,
  X,
  Trash2,
  Plus,
  RefreshCw,
  History as HistoryIcon,
  Eye,
  Bell,
  Pencil,
  Save,
} from "lucide-react";
import "./App.css";

const API = "http://127.0.0.1:8000";

type AuthUser = { id: number; email: string; name: string; role: "admin" | "user" };

function apiFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem("brandsentinel_token");
  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return fetch(url, { ...options, headers });
}

type Page =
  | "Dashboard"
  | "Content Review"
  | "Brand Guidelines"
  | "Approvals"
  | "Review History"
  | "Users";

type Finding = {
  issue: string;
  explanation: string;
  severity: string;
  suggestion: string;
  evidence?: string;
};

type ReviewResult = {
  total_issues: number;
  findings: Finding[];
  message: string;
};

type Guidelines = {
  brand_name: string;
  preferred_tone: string;
  avoid_words: string[];
  preferred_words: string[];
  tagline: string;
};

type Approval = {
  id: number;
  content: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewer: string;
  user_id?: number | null;
  user_email?: string;
  user_name?: string;
  created_at: string;
};

type AppUser = { id: number; name: string; email: string; role: "admin" | "user"; created_at: string };
type AdminNotification = { id: number; approval_id: number | null; title: string; message: string; is_read: boolean; created_at: string };

type ReviewHistory = {
  id: number;
  content: string;
  total_issues: number;
  findings: Finding[];
  created_at: string;
  user_id?: number | null;
  user_email?: string;
  user_name?: string;
};

const emptyGuidelines: Guidelines = {
  brand_name: "",
  preferred_tone: "Professional and friendly",
  avoid_words: [],
  preferred_words: [],
  tagline: "",
};

function App() {
  const [activePage, setActivePage] = useState<Page>("Dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authRole, setAuthRole] = useState<"admin" | "user">("user");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  // Content review state
  const [content, setContent] = useState("");
  const [reviewResult, setReviewResult] =
    useState<ReviewResult | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [deepReviewLoading, setDeepReviewLoading] = useState(false);
  const [reviewDuration, setReviewDuration] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState("");

  // Guidelines state
  const [guidelines, setGuidelines] =
    useState<Guidelines>(emptyGuidelines);
  const [avoidInput, setAvoidInput] = useState("");
  const [preferredInput, setPreferredInput] = useState("");
  const [guidelinesLoading, setGuidelinesLoading] = useState(false);
  const [guidelinesMessage, setGuidelinesMessage] = useState("");

  // Approval and dashboard statistics state
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [reviews, setReviews] = useState<ReviewHistory[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewHistory | null>(null);
  const [historyFilter, setHistoryFilter] = useState<"all" | "issues">("all");
  const [dashboardError, setDashboardError] = useState("");
  const [approvalMessage, setApprovalMessage] = useState("");
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalsFetching, setApprovalsFetching] = useState(false);
  const [historyFetching, setHistoryFetching] = useState(false);
  const [usersFetching, setUsersFetching] = useState(false);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState<"admin" | "user">("user");
  const [userActionBusy, setUserActionBusy] = useState(false);

  // Restore a valid login session when the app opens.
  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem("brandsentinel_token");
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const response = await apiFetch(`${API}/api/auth/me`);
        if (!response.ok) throw new Error("Session expired");
        setAuthUser(await response.json());
      } catch {
        localStorage.removeItem("brandsentinel_token");
        setAuthUser(null);
      } finally {
        setAuthLoading(false);
      }
    }
    restoreSession();
  }, []);

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");
    try {
      if (authMode === "register") {
        const registerResponse = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ full_name: authName, email: authEmail, password: authPassword }),
        });
        const registerData = await registerResponse.json();
        if (!registerResponse.ok) throw new Error(registerData.detail || "Registration failed");
        setAuthMode("login");
        setAuthMessage("Account created. Please log in.");
        setAuthPassword("");
      } else {
        const loginResponse = await fetch(`${API}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const loginData = await loginResponse.json();
        if (!loginResponse.ok) throw new Error(loginData.detail || "Login failed");
        if (loginData.user.role !== authRole) {
          throw new Error(
            authRole === "admin"
              ? "This account is not an administrator. Choose User Login."
              : "This is an administrator account. Choose Admin Login."
          );
        }
        localStorage.setItem("brandsentinel_token", loginData.access_token);
        setAuthUser(loginData.user);
        setActivePage("Dashboard");
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setAuthBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("brandsentinel_token");
    setAuthUser(null);
    setApprovals([]);
    setReviews([]);
    setReviewResult(null);
    setActivePage("Dashboard");
  }

  // Load brand guidelines
  useEffect(() => {
    if (!authUser || authUser.role !== "admin") return;
    async function loadGuidelines() {
      try {
        const response = await apiFetch(`${API}/api/guidelines`);

        if (!response.ok) {
          throw new Error("Could not load guidelines");
        }

        const data: Guidelines = await response.json();
        setGuidelines(data);
        setGuidelinesMessage("");
      } catch {
        setGuidelinesMessage(
          "Could not load guidelines. Check that the backend is running."
        );
      }
    }

    loadGuidelines();
  }, [authUser]);

  // Refresh dashboard statistics whenever the Dashboard page opens
  useEffect(() => {
    if (authUser?.role === "admin" && activePage === "Dashboard") {
      loadDashboardData();
    }
  }, [activePage, authUser]);

  // Load approval and review records when their admin pages open.
  useEffect(() => {
    if (authUser?.role === "admin" && activePage === "Approvals") {
      loadApprovals();
    }
    if (authUser?.role === "admin" && activePage === "Review History") {
      loadDashboardData();
    }
    if (authUser?.role === "admin" && activePage === "Users") {
      loadUsers();
    }
  }, [activePage, authUser]);

  // Fast content review: this endpoint uses local rules and does not wait for Ollama.
  async function handleReview() {
    if (!content.trim()) return;

    const startedAt = performance.now();
    setReviewLoading(true);
    setReviewError("");
    setReviewResult(null);
    setReviewDuration(null);
    setApprovalMessage("");

    try {
      const response = await apiFetch(`${API}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Quick review request failed");
      }

      const data: ReviewResult = await response.json();
      setReviewResult(data);
      setReviewDuration(Math.round(performance.now() - startedAt));
    } catch {
      setReviewError(
        "Could not connect to BrandSentinel backend. Check that FastAPI is running."
      );
    } finally {
      setReviewLoading(false);
    }
  }

  // Optional deeper AI review: this calls Ollama and may take longer.
  async function handleDeepReview() {
    if (!content.trim()) return;

    setDeepReviewLoading(true);
    setReviewError("");

    try {
      const response = await apiFetch(`${API}/api/review/deep`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        let detail = "Deep AI review failed.";
        try {
          const errorData = await response.json();
          if (errorData.detail) detail = String(errorData.detail);
        } catch {
          // Keep the default error message.
        }
        throw new Error(detail);
      }

      const data: ReviewResult = await response.json();
      setReviewResult(data);
      setReviewDuration(null);
    } catch (error) {
      setReviewError(
        error instanceof Error
          ? error.message
          : "Deep AI review could not be completed."
      );
    } finally {
      setDeepReviewLoading(false);
    }
  }

  // Add words to brand guidelines
  function addWord(type: "avoid_words" | "preferred_words") {
    const value =
      type === "avoid_words"
        ? avoidInput.trim()
        : preferredInput.trim();

    if (!value) return;

    setGuidelines((previous) => ({
      ...previous,
      [type]: previous[type].some(
        (word) => word.toLowerCase() === value.toLowerCase()
      )
        ? previous[type]
        : [...previous[type], value],
    }));

    if (type === "avoid_words") {
      setAvoidInput("");
    } else {
      setPreferredInput("");
    }
  }

  // Remove words from brand guidelines
  function removeWord(
    type: "avoid_words" | "preferred_words",
    index: number
  ) {
    setGuidelines((previous) => ({
      ...previous,
      [type]: previous[type].filter((_, i) => i !== index),
    }));
  }

  // Save brand guidelines
  async function saveGuidelines() {
    if (!guidelines.brand_name.trim()) {
      setGuidelinesMessage("Please enter your brand name.");
      return;
    }

    setGuidelinesLoading(true);
    setGuidelinesMessage("");

    try {
      const response = await apiFetch(`${API}/api/guidelines`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(guidelines),
      });

      if (!response.ok) {
        throw new Error("Could not save guidelines");
      }

      setGuidelinesMessage(
        "Brand guidelines saved successfully!"
      );
    } catch {
      setGuidelinesMessage(
        "Could not save guidelines. Check your backend connection."
      );
    } finally {
      setGuidelinesLoading(false);
    }
  }

  // Load all registered accounts for the Admin users page.
  async function loadUsers() {
    setUsersFetching(true);
    setUsersError("");
    try {
      const response = await apiFetch(`${API}/api/users`);
      if (!response.ok) throw new Error("Could not load users");
      setUsers(await response.json());
    } catch {
      setUsersError("Could not load users. Check your backend connection.");
    } finally {
      setUsersFetching(false);
    }
  }

  // Admin receives a persistent notification whenever a user submits a request.
  async function loadAdminNotifications() {
    try {
      const response = await apiFetch(`${API}/api/admin/notifications`);
      if (!response.ok) throw new Error("Could not load admin notifications");
      setAdminNotifications(await response.json());
    } catch {
      setAdminNotifications([]);
    }
  }

  useEffect(() => {
    if (authUser?.role === "admin") loadAdminNotifications();
  }, [authUser]);

  function beginEditUser(item: AppUser) {
    setEditingUser(item);
    setEditUserName(item.name);
    setEditUserEmail(item.email);
    setEditUserRole(item.role);
    setUsersError("");
  }

  async function saveUserChanges() {
    if (!editingUser) return;
    setUserActionBusy(true);
    setUsersError("");
    try {
      const response = await apiFetch(`${API}/api/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: editUserName, email: editUserEmail, role: editUserRole }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not update user.");
      setEditingUser(null);
      await loadUsers();
      if (authUser?.id === editingUser.id) {
        const updated = data.user;
        setAuthUser({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
      }
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Could not update user.");
    } finally {
      setUserActionBusy(false);
    }
  }

  async function deleteUserAccount(item: AppUser) {
    if (!window.confirm(`Delete ${item.name} (${item.email})? Their saved review and approval history will be retained.`)) return;
    setUserActionBusy(true);
    setUsersError("");
    try {
      const response = await apiFetch(`${API}/api/users/${item.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Could not delete user.");
      if (editingUser?.id === item.id) setEditingUser(null);
      await loadUsers();
    } catch (error) {
      setUsersError(error instanceof Error ? error.message : "Could not delete user.");
    } finally {
      setUserActionBusy(false);
    }
  }

  async function openAdminNotification(note: AdminNotification) {
    if (!note.is_read) {
      await apiFetch(`${API}/api/admin/notifications/${note.id}/read`, { method: "POST" });
      setAdminNotifications(previous => previous.map(item => item.id === note.id ? { ...item, is_read: true } : item));
    }
    setNotificationsOpen(false);
    if (note.approval_id) {
      setActivePage("Approvals");
      await loadApprovals();
    }
  }

  // Load approvals
  async function loadApprovals() {
    setApprovalsFetching(true);
    setApprovalMessage("");

    try {
      const response = await apiFetch(`${API}/api/approvals`);

      if (!response.ok) {
        throw new Error("Could not load approvals");
      }

      const data: Approval[] = await response.json();
      setApprovals(data);
    } catch {
      setApprovalMessage(
        "Could not load approval records. Check your backend."
      );
    } finally {
      setApprovalsFetching(false);
    }
  }

  // Load review history and approval records for dashboard statistics
  async function loadDashboardData() {
    setHistoryFetching(true);
    setDashboardError("");

    try {
      const [reviewsResponse, approvalsResponse] = await Promise.all([
        apiFetch(`${API}/api/reviews`),
        apiFetch(`${API}/api/approvals`),
      ]);

      if (!reviewsResponse.ok || !approvalsResponse.ok) {
        throw new Error("Could not load dashboard data");
      }

      const reviewsData: ReviewHistory[] = await reviewsResponse.json();
      const approvalsData: Approval[] = await approvalsResponse.json();

      setReviews(reviewsData);
      setApprovals(approvalsData);
    } catch {
      setDashboardError(
        "Could not load review history or dashboard statistics. Check that the backend is running."
      );
    } finally {
      setHistoryFetching(false);
    }
  }

  // Submit reviewed content for approval
  async function submitForApproval() {
    if (!reviewResult || !content.trim()) return;

    setApprovalLoading(true);
    setApprovalMessage("");

    try {
      const response = await apiFetch(`${API}/api/approvals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          status: "Pending",
          reviewer: authUser?.name || "User",
        }),
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      await response.json();

      setApprovalMessage("Content submitted for approval!");
      if (authUser?.role === "admin") {
        await loadApprovals();
        setActivePage("Approvals");
      }
    } catch {
      setApprovalMessage(
        "Could not submit content for approval."
      );
    } finally {
      setApprovalLoading(false);
    }
  }

  // Approve or reject a request
  async function changeApprovalStatus(
    id: number,
    status: "Approved" | "Rejected"
  ) {
    setApprovalMessage("");

    try {
      const response = await apiFetch(
        `${API}/api/approvals/${id}?status=${status}`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Status update failed");
      }

      await loadApprovals();
      setApprovalMessage(`Content marked as ${status}.`);
    } catch {
      setApprovalMessage(
        "Could not update approval status."
      );
    }
  }

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Content Review", icon: FileCheck },
    ...(authUser?.role === "admin"
      ? [
          { name: "Review History", icon: HistoryIcon },
          { name: "Brand Guidelines", icon: Settings },
          { name: "Approvals", icon: ClipboardCheck },
          { name: "Users", icon: Eye },
        ]
      : []),
  ] as const;

  const pendingCount = approvals.filter(
    (item) => item.status === "Pending"
  ).length;

  const approvedCount = approvals.filter(
    (item) => item.status === "Approved"
  ).length;

  const rejectedCount = approvals.filter(
    (item) => item.status === "Rejected"
  ).length;

  const totalReviews = reviews.length;
  const totalIssues = reviews.reduce(
    (total, review) => total + review.total_issues,
    0
  );

  if (authLoading) {
    return <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading BrandSentinel...</div>;
  }

  if (!authUser) {
    return (
      <div className="auth-screen">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <section className="auth-card">
          <div className="auth-brand">
            <div className="auth-brand-icon"><ShieldCheck size={34} /></div>
            <div>
              <h1>BrandSentinel</h1>
              <p>Protect your brand before publication</p>
            </div>
          </div>

          <div className="auth-heading">
            <span className="auth-eyebrow">SECURE WORKSPACE</span>
            <h2>{authMode === "register" ? "Create your account" : "Welcome back"}</h2>
            <p>{authMode === "register"
              ? "Create a user account to review and submit content."
              : "Choose how you want to access BrandSentinel."}</p>
          </div>

          {authMode === "login" && (
            <div className="login-choice-grid">
              <button
                type="button"
                className={`login-choice admin-choice ${authRole === "admin" ? "selected" : ""}`}
                onClick={() => {
                  setAuthRole("admin");
                  setAuthEmail("admin@123");
                  setAuthPassword("admin");
                  setAuthMessage("");
                }}
              >
                <span className="choice-icon"><ShieldCheck size={23} /></span>
                <span><strong>Admin Login</strong><small>Manage guidelines and approvals</small></span>
                <span className="choice-arrow">→</span>
              </button>
              <button
                type="button"
                className={`login-choice user-choice ${authRole === "user" ? "selected" : ""}`}
                onClick={() => {
                  setAuthRole("user");
                  setAuthEmail("");
                  setAuthPassword("");
                  setAuthMessage("");
                }}
              >
                <span className="choice-icon"><LayoutDashboard size={23} /></span>
                <span><strong>User Login</strong><small>Review and submit your content</small></span>
                <span className="choice-arrow">→</span>
              </button>
            </div>
          )}

          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label className="auth-field">
                <span>Full name</span>
                <input required minLength={2} value={authName} onChange={e => setAuthName(e.target.value)} placeholder="Your name" autoComplete="name" />
              </label>
            )}
            <label className="auth-field">
              <span>Email / Username</span>
              <input required type="text" value={authEmail} onChange={e => setAuthEmail(e.target.value)} placeholder={authRole === "admin" && authMode === "login" ? "admin@123" : "you@example.com"} autoComplete="username" />
            </label>
            <label className="auth-field">
              <span>Password</span>
              <input required minLength={authMode === "register" ? 8 : 1} type="password" value={authPassword} onChange={e => setAuthPassword(e.target.value)} placeholder={authMode === "register" ? "At least 8 characters" : "Enter your password"} autoComplete={authMode === "register" ? "new-password" : "current-password"} />
            </label>
            {authMessage && <div className={`auth-message ${authMessage.includes("created") ? "success" : "error"}`}>{authMessage}</div>}
            <button className="auth-submit" type="submit" disabled={authBusy}>
              {authBusy ? <><RefreshCw size={17} className="spin-icon" /> Please wait...</> : authMode === "register" ? "Create User Account" : `Continue as ${authRole === "admin" ? "Admin" : "User"}`}
            </button>
          </form>

          {authMode === "login" && authRole === "admin" && (
            <div className="demo-credentials">
              <strong>Demo admin credentials</strong>
              <span>Username: <b>admin@123</b></span>
              <span>Password: <b>admin</b></span>
            </div>
          )}

          <div className="auth-switch">
            {authMode === "login" ? (
              <>New to BrandSentinel? <button type="button" onClick={() => { setAuthMode("register"); setAuthRole("user"); setAuthEmail(""); setAuthPassword(""); setAuthMessage(""); }}>Create a user account</button></>
            ) : (
              <>Already registered? <button type="button" onClick={() => { setAuthMode("login"); setAuthRole("user"); setAuthMessage(""); }}>Back to login</button></>
            )}
          </div>
        </section>
        <p className="auth-footer">BrandSentinel · Explainable AI brand governance</p>
      </div>
    );
  }

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>
        <div className="brand-logo">
          <ShieldCheck size={30} />
          <span>BrandSentinel</span>

          <button
            className="mobile-close"
            onClick={() => setMobileMenu(false)}
          >
            <X />
          </button>
        </div>

        <p className="sidebar-label">WORKSPACE</p>

        <nav>
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${
                  activePage === item.name ? "active" : ""
                }`}
                onClick={() => {
                  setActivePage(item.name);
                  setMobileMenu(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <ShieldCheck size={18} />
          <span>Brand protection workspace</span>
        </div>
      </aside>

      {/* MAIN AREA */}
      <main className="main-area">

        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMobileMenu(true)}
          >
            <Menu />
          </button>

          <div>
            <span className="breadcrumb">Workspace / </span>
            <strong>{activePage}</strong>
          </div>

          <div className="user-profile">
            {authUser.role === "admin" && (
              <div className="notification-wrap">
                <button className="notification-button" aria-label="Admin notifications" title="Approval notifications" onClick={() => {
                  const nextOpen = !notificationsOpen;
                  setNotificationsOpen(nextOpen);
                  if (nextOpen) loadAdminNotifications();
                }}>
                  <Bell size={19} />
                  {adminNotifications.filter(note => !note.is_read).length > 0 &&
                    <i>{adminNotifications.filter(note => !note.is_read).length}</i>}
                </button>
                {notificationsOpen && (
                  <div className="notification-popover">
                    <div className="notification-title">
                      <span>Approval requests</span>
                      <button type="button" className="notification-close" onClick={() => setNotificationsOpen(false)} aria-label="Close notifications"><X size={16} /></button>
                    </div>
                    {adminNotifications.length === 0 ? <p className="notification-empty">No approval requests yet.</p> : adminNotifications.map(note => (
                      <button className={`notification-item admin-notification-item ${note.is_read ? "read" : "unread"}`} key={note.id} onClick={() => openAdminNotification(note)}>
                        <strong>{note.title}</strong>
                        <p>{note.message}</p>
                        <small>{new Date(note.created_at).toLocaleString()}</small>
                        <span className="notification-action">{note.approval_id ? "View approval →" : "Open notification"}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="avatar">BS</div>
            <span>{authUser.name} ({authUser.role})</span>
            <button onClick={logout} style={{ marginLeft: 12, border: "1px solid #dbe2ef", background: "white", borderRadius: 7, padding: "7px 10px", cursor: "pointer" }}>Logout</button>
          </div>
        </header>

        <div className="page-content page-enter">

          {/* DASHBOARD */}
          {activePage === "Dashboard" && (
            <>
              <div className="welcome-section">
                <div>
                  <h1>Welcome to BrandSentinel</h1>
                  <p>
                    Monitor your brand consistency before publication.
                  </p>
                </div>

                <span className="status-label">
                  <span className="status-dot"></span>
                  System Active
                </span>
              </div>

              {dashboardError && (
                <p style={{ color: "red", marginTop: 12 }}>{dashboardError}</p>
              )}

              {authUser.role === "admin" && <div className="stats-grid">

                <button className="stat-card stat-card-action" onClick={() => { setHistoryFilter("all"); setSelectedReview(null); setActivePage("Review History"); }}>
                  <div className="stat-icon blue">
                    <FileCheck />
                  </div>
                  <p>Total Reviews</p>
                  <h2>{totalReviews}</h2>
                  <span>Saved content reviews · View history</span>
                </button>

                <button className="stat-card stat-card-action" onClick={() => { setHistoryFilter("issues"); setSelectedReview(null); setActivePage("Review History"); }}>
                  <div className="stat-icon orange">
                    <AlertTriangle />
                  </div>
                  <p>Issues Detected</p>
                  <h2>{totalIssues}</h2>
                  <span>Issues across saved reviews · View details</span>
                </button>

                <div className="stat-card">
                  <div className="stat-icon green">
                    <CheckCircle />
                  </div>
                  <p>Approved Content</p>
                  <h2>{approvedCount}</h2>
                  <span>Items approved by admin</span>
                </div>

                <div className="stat-card">
                  <div className="stat-icon purple">
                    <Clock />
                  </div>
                  <p>Pending Reviews</p>
                  <h2>{pendingCount}</h2>
                  <span>Awaiting admin decision</span>
                </div>

              </div>}

              {authUser.role === "admin" && <div className="dashboard-panel">
                <h2>Quick Actions</h2>
                <p>Choose what you want to do next.</p>

                <div className="quick-actions">

                  <button
                    onClick={() => setActivePage("Content Review")}
                  >
                    <FileCheck />
                    <span>
                      <strong>Review Content</strong>
                      <small>Check marketing content for risks</small>
                    </span>
                  </button>

                  <button onClick={() => { setHistoryFilter("all"); setSelectedReview(null); setActivePage("Review History"); }}>
                    <HistoryIcon />
                    <span>
                      <strong>Review History</strong>
                      <small>See submitted content and detected issues</small>
                    </span>
                  </button>

                  <button
                    onClick={() => setActivePage("Brand Guidelines")}
                  >
                    <Settings />
                    <span>
                      <strong>Manage Guidelines</strong>
                      <small>Configure your brand rules</small>
                    </span>
                  </button>

                  <button
                    onClick={() => setActivePage("Approvals")}
                  >
                    <ClipboardCheck />
                    <span>
                      <strong>View Approvals</strong>
                      <small>Manage content approval status</small>
                    </span>
                  </button>

                </div>
              </div>}
              {authUser.role === "user" && <div className="dashboard-panel"><h2>User Workspace</h2><p>Use Content Review to check marketing content and submit it for administrator approval.</p><button className="primary-button" onClick={() => setActivePage("Content Review")}>Start Content Review</button></div>}
            </>
          )}

          {/* CONTENT REVIEW */}
          {activePage === "Content Review" && (
            <div className="dashboard-panel">

              <h1>Content Review</h1>

              <p>
                Check your marketing content against your brand guidelines.
              </p>

              <label htmlFor="marketing-content">
                Marketing Content
              </label>

              <textarea
                id="marketing-content"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setReviewResult(null);
                  setReviewDuration(null);
                  setReviewError("");
                }}
                placeholder="Enter your advertisement, social media caption or marketing content..."
                rows={8}
                style={{
                  width: "100%",
                  padding: 15,
                  marginTop: 12,
                  border: "1px solid #dce2ed",
                  borderRadius: 9,
                  fontSize: 15,
                  resize: "vertical",
                }}
              />

              <button
                className="primary-button"
                onClick={handleReview}
                disabled={reviewLoading || !content.trim()}
              >
                {reviewLoading ? "Reviewing..." : "Review Content"}
              </button>

              {reviewError && (
                <p style={{ color: "red" }}>{reviewError}</p>
              )}

              {reviewResult && (
                <div style={{ marginTop: 25 }}>

                  <h2>Review Results</h2>

                  <h3>
                    Total Issues Found: {reviewResult.total_issues}
                  </h3>

                  <p>{reviewResult.message}</p>

                  {reviewDuration !== null && (
                    <p style={{ color: "#15803d", fontWeight: 600 }}>
                      Quick review completed in {reviewDuration} ms.
                    </p>
                  )}

                  {authUser.role === "admin" && (
                    <button
                      className="primary-button"
                      onClick={handleDeepReview}
                      disabled={deepReviewLoading}
                      style={{ margin: "8px 0 18px" }}
                    >
                      {deepReviewLoading ? "Running deeper AI review..." : "Run Deeper AI Review (may take longer)"}
                    </button>
                  )}

                  {reviewResult.findings.length === 0 ? (
                    <p>
                      No issues detected by the current checks.
                    </p>
                  ) : (
                    reviewResult.findings.map((finding, index) => (
                      <div
                        key={index}
                        style={{
                          border: "1px solid #e1e6ef",
                          borderRadius: 10,
                          padding: 18,
                          marginBottom: 15,
                          background: "#fafbfe",
                        }}
                      >
                        <h3>{finding.issue}</h3>

                        <p>{finding.explanation}</p>

                        {finding.evidence && (
                          <div
                            style={{
                              marginTop: 12,
                              padding: 12,
                              borderLeft: "4px solid #d97706",
                              borderRadius: 6,
                              background: "#fff7ed",
                            }}
                          >
                            <strong>Evidence detected:</strong>
                            <p style={{ margin: "6px 0 0", color: "#9a3412" }}>
                              “{finding.evidence}”
                            </p>
                          </div>
                        )}

                        <p>
                          <strong>Severity:</strong>{" "}
                          {finding.severity}
                        </p>

                        <p>
                          <strong>Suggested Correction:</strong>{" "}
                          {finding.suggestion}
                        </p>
                      </div>
                    ))
                  )}

                  <button
                    className="primary-button"
                    onClick={submitForApproval}
                    disabled={approvalLoading}
                  >
                    {approvalLoading
                      ? "Submitting..."
                      : "Submit for Approval"}
                  </button>

                  {approvalMessage && (
                    <p>{approvalMessage}</p>
                  )}

                </div>
              )}
            </div>
          )}

          {/* BRAND GUIDELINES */}
          {activePage === "Brand Guidelines" && (
            <div className="dashboard-panel">

              <h1>Brand Guidelines</h1>

              <p>
                Define the rules that your marketing content should follow.
              </p>

              <label htmlFor="brand-name">Brand Name</label>

              <input
                id="brand-name"
                value={guidelines.brand_name}
                onChange={(e) =>
                  setGuidelines({
                    ...guidelines,
                    brand_name: e.target.value,
                  })
                }
                placeholder="Enter brand name"
                className="guideline-input"
              />

              <label htmlFor="brand-tone">Preferred Tone</label>

              <select
                id="brand-tone"
                value={guidelines.preferred_tone}
                onChange={(e) =>
                  setGuidelines({
                    ...guidelines,
                    preferred_tone: e.target.value,
                  })
                }
                className="guideline-input"
              >
                <option>Professional and friendly</option>
                <option>Formal</option>
                <option>Friendly and conversational</option>
                <option>Bold and confident</option>
                <option>Simple and informative</option>
              </select>

              <label htmlFor="brand-tagline">Brand Tagline</label>

              <input
                id="brand-tagline"
                value={guidelines.tagline}
                onChange={(e) =>
                  setGuidelines({
                    ...guidelines,
                    tagline: e.target.value,
                  })
                }
                placeholder="Enter brand tagline"
                className="guideline-input"
              />

              <h3>Words to Avoid</h3>

              <p>
                Add words that should not appear in your content.
              </p>

              <div className="word-input-row">
                <input
                  value={avoidInput}
                  onChange={(e) => setAvoidInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addWord("avoid_words");
                  }}
                  placeholder="Example: cheap"
                />

                <button onClick={() => addWord("avoid_words")}>
                  <Plus size={17} /> Add
                </button>
              </div>

              <div className="word-list">
                {guidelines.avoid_words.map((word, index) => (
                  <div
                    className="word-chip avoid-chip"
                    key={`${word}-${index}`}
                  >
                    {word}

                    <button
                      onClick={() => removeWord("avoid_words", index)}
                      aria-label={`Remove ${word}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <h3>Preferred Words</h3>

              <p>
                Add words that represent your brand.
              </p>

              <div className="word-input-row">
                <input
                  value={preferredInput}
                  onChange={(e) => setPreferredInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addWord("preferred_words");
                  }}
                  placeholder="Example: reliable"
                />

                <button onClick={() => addWord("preferred_words")}>
                  <Plus size={17} /> Add
                </button>
              </div>

              <div className="word-list">
                {guidelines.preferred_words.map((word, index) => (
                  <div
                    className="word-chip preferred-chip"
                    key={`${word}-${index}`}
                  >
                    {word}

                    <button
                      onClick={() =>
                        removeWord("preferred_words", index)
                      }
                      aria-label={`Remove ${word}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <button
                className="primary-button"
                onClick={saveGuidelines}
                disabled={
                  guidelinesLoading || !guidelines.brand_name.trim()
                }
              >
                {guidelinesLoading
                  ? "Saving..."
                  : "Save Brand Guidelines"}
              </button>

              {guidelinesMessage && (
                <p style={{ marginTop: 18 }}>
                  {guidelinesMessage}
                </p>
              )}

            </div>
          )}

          {/* ADMIN REVIEW HISTORY */}
          {activePage === "Review History" && authUser.role === "admin" && (
            <div className="dashboard-panel review-history-panel">
              <div className="history-heading">
                <div>
                  <h1>Review History</h1>
                  <p>See the exact content users reviewed, who submitted it, and every detected issue.</p>
                </div>
                <button className="primary-button" onClick={loadDashboardData} disabled={historyFetching} aria-label="Refresh review history">
                  <RefreshCw size={15} className={historyFetching ? "spin-icon" : ""} />
                  {historyFetching ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="history-toolbar">
                <button className={historyFilter === "all" ? "filter-button active" : "filter-button"} onClick={() => { setHistoryFilter("all"); setSelectedReview(null); }}>All reviews ({reviews.length})</button>
                <button className={historyFilter === "issues" ? "filter-button active" : "filter-button"} onClick={() => { setHistoryFilter("issues"); setSelectedReview(null); }}>Reviews with issues ({reviews.filter(r => r.total_issues > 0).length})</button>
              </div>

              {dashboardError && <p className="error-text">{dashboardError}</p>}
              {historyFetching && reviews.length === 0 && !dashboardError && (
                <p className="empty-state">Loading review history...</p>
              )}

              {selectedReview ? (
                <section className="review-detail-card">
                  <div className="history-heading">
                    <div><h2>Review #{selectedReview.id}</h2><p>{new Date(selectedReview.created_at).toLocaleString()}</p></div>
                    <button className="filter-button" onClick={() => setSelectedReview(null)}>Back to history</button>
                  </div>
                  <div className="review-owner"><strong>Submitted by:</strong> {selectedReview.user_name || "Previous user"} · {selectedReview.user_email || "Owner not recorded"}</div>
                  <h3>Original content</h3>
                  <pre className="review-original-content">{selectedReview.content}</pre>
                  <h3>{selectedReview.total_issues} detected issue(s)</h3>
                  {selectedReview.findings?.length ? selectedReview.findings.map((finding, index) => (
                    <article className="finding-detail" key={`${selectedReview.id}-${index}`}>
                      <div className="finding-title-row"><strong>{finding.issue}</strong><span className={`severity-pill ${finding.severity.toLowerCase()}`}>{finding.severity}</span></div>
                      <p>{finding.explanation}</p>
                      {finding.evidence && <p><strong>Evidence:</strong> {finding.evidence}</p>}
                      <p><strong>Suggested correction:</strong> {finding.suggestion}</p>
                    </article>
                  )) : <p>No issues were detected in this review.</p>}
                </section>
              ) : (
                <div className="history-list">
                  {(historyFilter === "issues" ? reviews.filter(r => r.total_issues > 0) : reviews).length === 0
                    ? <p className="empty-state">No saved reviews found for this filter.</p>
                    : (historyFilter === "issues" ? reviews.filter(r => r.total_issues > 0) : reviews).map(review => (
                      <article className="history-card" key={review.id}>
                        <div className="history-card-top">
                          <div><strong>Review #{review.id}</strong><span>{new Date(review.created_at).toLocaleString()}</span></div>
                          <span className="issue-count">{review.total_issues} issue(s)</span>
                        </div>
                        <p className="history-owner"><strong>User:</strong> {review.user_name || "Previous user"} · {review.user_email || "Owner not recorded"}</p>
                        <p className="history-content-preview">{review.content}</p>
                        <button className="filter-button" onClick={() => setSelectedReview(review)}><Eye size={15} /> View content and findings</button>
                      </article>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* ADMIN USER DIRECTORY */}
          {activePage === "Users" && authUser.role === "admin" && (
            <div className="dashboard-panel">
              <div className="history-heading">
                <div><h1>Registered Users</h1><p>See who has an account and identify users who submit reviews and approvals.</p></div>
                <button className="primary-button" onClick={loadUsers} disabled={usersFetching} aria-label="Refresh users">
                  <RefreshCw size={15} className={usersFetching ? "spin-icon" : ""} />
                  {usersFetching ? "Refreshing..." : "Refresh"}
                </button>
              </div>
              {usersError && <p className="error-text">{usersError}</p>}
              <div className="users-summary"><strong>{users.length}</strong><span>Registered accounts</span></div>
              {editingUser && (
                <div className="user-edit-panel">
                  <h3>Edit account</h3>
                  <div className="user-edit-grid">
                    <label>Name<input value={editUserName} onChange={event => setEditUserName(event.target.value)} /></label>
                    <label>Email<input type="email" value={editUserEmail} onChange={event => setEditUserEmail(event.target.value)} /></label>
                    <label>Role<select value={editUserRole} onChange={event => setEditUserRole(event.target.value as "admin" | "user")}><option value="user">User</option><option value="admin">Admin</option></select></label>
                  </div>
                  <div className="user-edit-actions">
                    <button className="primary-button" onClick={saveUserChanges} disabled={userActionBusy || !editUserName.trim() || !editUserEmail.trim()}><Save size={15} /> Save changes</button>
                    <button className="filter-button" onClick={() => setEditingUser(null)} disabled={userActionBusy}>Cancel</button>
                  </div>
                </div>
              )}
              <div className="users-table-wrap">
                <table className="users-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.map(item => <tr key={item.id}>
                      <td>{item.name}</td><td>{item.email}</td>
                      <td><span className={item.role === "admin" ? "role-admin" : "role-user"}>{item.role}</span></td>
                      <td>{new Date(item.created_at).toLocaleDateString()}</td>
                      <td className="user-actions-cell">
                        <button className="filter-button" onClick={() => beginEditUser(item)} disabled={userActionBusy}><Pencil size={14} /> Edit</button>
                        <button className="user-delete-button" onClick={() => deleteUserAccount(item)} disabled={userActionBusy || item.id === authUser.id || (item.role === "admin" && users.filter(u => u.role === "admin").length <= 1)}><Trash2 size={14} /> Delete</button>
                      </td>
                    </tr>)}
                    {users.length === 0 && <tr><td colSpan={5}>No registered accounts found.</td></tr>}
                  </tbody>
                </table>
              </div>
              <p className="users-help-text">Your own Admin account cannot be deleted. Review and approval history is retained if a user account is deleted.</p>
            </div>
          )}

          {/* APPROVAL MANAGEMENT */}
          {activePage === "Approvals" && (
            <div className="dashboard-panel">

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div>
                  <h1>Approval Management</h1>
                  <p>
                    Review submitted marketing content before publication.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={loadApprovals}
                  disabled={approvalsFetching}
                  aria-label="Refresh approvals"
                >
                  <RefreshCw size={15} className={approvalsFetching ? "spin-icon" : ""} />
                  {approvalsFetching ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <div className="approval-summary">
                <div>
                  <span>Pending</span>
                  <strong>{pendingCount}</strong>
                </div>

                <div>
                  <span>Approved</span>
                  <strong>{approvedCount}</strong>
                </div>

                <div>
                  <span>Rejected</span>
                  <strong>{rejectedCount}</strong>
                </div>
              </div>

              {approvalMessage && (
                <p>{approvalMessage}</p>
              )}

              {approvalsFetching && approvals.length === 0 ? (
                <p className="empty-state">Loading approval requests...</p>
              ) : approvals.length === 0 ? (
                <p>No approval requests yet.</p>
              ) : (
                approvals.map((item) => (
                  <div
                    key={item.id}
                    className="approval-card"
                  >
                    <h3>Request #{item.id}</h3>

                    <p>{item.content}</p>

                    <p>
                      <strong>Submitted by:</strong> {item.user_name || item.reviewer} · {item.user_email || "Email not recorded"}
                    </p>

                    <p>
                      <strong>Status:</strong>{" "}
                      <span
                        className={`approval-status ${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </p>

                    <p>
                      <strong>Submitted:</strong>{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </p>

                    {authUser.role === "admin" && item.status === "Pending" && (
                      <div className="approval-actions">

                        <button
                          className="approve-button"
                          onClick={() =>
                            changeApprovalStatus(item.id, "Approved")
                          }
                        >
                          <CheckCircle size={16} /> Approve
                        </button>

                        <button
                          className="reject-button"
                          onClick={() =>
                            changeApprovalStatus(item.id, "Rejected")
                          }
                        >
                          <X size={16} /> Reject
                        </button>

                      </div>
                    )}
                  </div>
                ))
              )}

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

export default App;
