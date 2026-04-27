"use client";

import { useEffect, useState } from "react";
import {
  Settings, Building2, Wallet, CalendarDays, Save, Loader2,
  CheckCircle2, Shield, Users, ToggleLeft, ToggleRight,
  KeyRound, RefreshCw, Trash2, Mail,
} from "lucide-react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 200: "#bfdbfe",
  100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14,
  border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 12, outline: "none",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
  transition: "border-color 0.15s",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--text-muted)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

interface SettingItem { key: string; value: string; group: string; }

interface Permissions {
  employeeLeave:    boolean;
  employeePayslips: boolean;
  employeeProfile:  boolean;
  employeeRequests: boolean;
  employeeBenefits: boolean;
  financePayroll:   boolean;
  financeBudgets:   boolean;
  financeReports:   boolean;
}

interface PortalUser {
  id: string; name: string; email: string; role: string; createdAt: string;
}

const PERMISSION_GROUPS = [
  {
    label: "Employee Portal",
    icon: Users,
    color: "#60a5fa",
    items: [
      { key: "employeeLeave",    label: "Leave Requests",    desc: "Employees can submit and view leave requests" },
      { key: "employeePayslips", label: "View Payslips",     desc: "Employees can access their payslip history" },
      { key: "employeeProfile",  label: "Edit Profile",      desc: "Employees can update their personal information" },
      { key: "employeeRequests", label: "Send Requests",     desc: "Employees can send HR requests and queries" },
      { key: "employeeBenefits", label: "View Benefits",     desc: "Employees can view their benefit packages" },
    ],
  },
  {
    label: "Finance Portal",
    icon: Wallet,
    color: "#3b82f6",
    items: [
      { key: "financePayroll",  label: "Payroll Management", desc: "Finance team can process and manage payroll" },
      { key: "financeBudgets",  label: "Budget Access",      desc: "Finance team can view and manage budgets" },
      { key: "financeReports",  label: "Financial Reports",  desc: "Finance team can generate and export reports" },
    ],
  },
];

const settingGroups = [
  { key: "general",     label: "Company Information", icon: Building2   },
  { key: "payroll",     label: "Payroll Settings",    icon: Wallet      },
  { key: "leave",       label: "Leave Policy",        icon: CalendarDays },
  { key: "permissions", label: "Permissions",         icon: Shield      },
  { key: "users",       label: "User Management",     icon: Users       },
];

const settingLabels: Record<string, string> = {
  company_name:      "Company Name",
  company_email:     "Company Email",
  company_phone:     "Phone Number",
  company_address:   "Address",
  currency:          "Currency",
  pay_cycle:         "Pay Cycle",
  tax_year:          "Tax Year",
  leave_year_start:  "Leave Year Start",
  annual_leave_days: "Annual Leave Days",
  sick_leave_days:   "Sick Leave Days",
};

export default function SettingsPage() {
  const [settings,     setSettings]     = useState<SettingItem[]>([]);
  const [permissions,  setPermissions]  = useState<Permissions | null>(null);
  const [permLoading,  setPermLoading]  = useState(false);
  const [permSaved,    setPermSaved]    = useState(false);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [activeGroup,  setActiveGroup]  = useState("general");
  const [users,        setUsers]        = useState<PortalUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [resetingId,   setResetingId]   = useState<string | null>(null);
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [userMsg,      setUserMsg]      = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { setSettings(d.settings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (activeGroup !== "permissions") return;
    if (permissions) return;
    setPermLoading(true);
    fetch("/api/company/permissions")
      .then(r => r.json())
      .then(d => { setPermissions(d.permissions); setPermLoading(false); })
      .catch(() => setPermLoading(false));
  }, [activeGroup, permissions]);

  useEffect(() => {
    if (activeGroup !== "users") return;
    setUsersLoading(true);
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(d => { setUsers(d.users || []); setUsersLoading(false); })
      .catch(() => setUsersLoading(false));
  }, [activeGroup]);

  async function handleResetPassword(userId: string) {
    if (!confirm("Reset this user's password? A new password will be emailed to them.")) return;
    setResetingId(userId); setUserMsg("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset-password" }),
      });
      const data = await res.json();
      if (!res.ok) { setUserMsg(data.error || "Failed to reset password."); return; }
      setUserMsg("Password reset and new credentials emailed successfully.");
      setTimeout(() => setUserMsg(""), 4000);
    } catch { setUserMsg("Network error."); }
    finally   { setResetingId(null); }
  }

  async function handleDeleteUser(userId: string, name: string) {
    if (!confirm(`Remove ${name}'s portal access? This cannot be undone.`)) return;
    setDeletingId(userId); setUserMsg("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { setUserMsg(data.error || "Failed to remove user."); return; }
      setUsers(prev => prev.filter(u => u.id !== userId));
      setUserMsg(`${name}'s account has been removed.`);
      setTimeout(() => setUserMsg(""), 3000);
    } catch { setUserMsg("Network error."); }
    finally   { setDeletingId(null); }
  }

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const groupSettings = settings.filter(s => s.group === activeGroup);
      await fetch("/api/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: groupSettings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const togglePermission = async (key: keyof Permissions) => {
    if (!permissions) return;
    const updated = { ...permissions, [key]: !permissions[key] };
    setPermissions(updated);
    setPermSaved(false);
    try {
      await fetch("/api/company/permissions", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: updated }),
      });
      setPermSaved(true);
      setTimeout(() => setPermSaved(false), 2000);
    } catch { /* silently fail */ }
  };

  const groupSettings    = settings.filter(s => s.group === activeGroup);
  const activeGroupLabel = settingGroups.find(g => g.key === activeGroup)?.label;
  const ActiveIcon       = settingGroups.find(g => g.key === activeGroup)?.icon ?? Settings;

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ height: 54, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ height: 360, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .settings-page * { font-family: 'DM Sans', sans-serif !important; }
        .settings-inp:focus { border-color: ${BLUE[400]} !important; }
        .tab-btn:hover:not(.tab-active) { background: var(--bg-hover) !important; }
        .perm-toggle { cursor:pointer; background:none; border:none; padding:0; display:flex; align-items:center; }
        .perm-row { display:flex; align-items:center; justify-content:space-between; padding:14px 0; border-bottom:0.5px solid var(--border); transition:background 0.15s; }
        .perm-row:last-child { border-bottom:none; }

        .settings-page {
          --bg-card:   #ffffff;
          --bg-hover:  #f8fafc;
          --bg-input:  #f8fafc;
          --border:    rgba(0,0,0,0.08);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .settings-page {
            --bg-card:   #0f172a;
            --bg-hover:  #1e293b;
            --bg-input:  #1e293b;
            --border:    rgba(255,255,255,0.08);
            --text-primary:   #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted:     #475569;
          }
        }
      `}</style>

      <div className="settings-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Configuration</p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>Settings</h1>
        </div>

        {/* Tabs + Save row */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-card)", borderRadius: 11, border: "0.5px solid var(--border)", overflowX: "auto" }}>
            {settingGroups.map(group => {
              const Icon  = group.icon;
              const isAct = activeGroup === group.key;
              return (
                <button key={group.key} className={`tab-btn${isAct ? " tab-active" : ""}`} onClick={() => setActiveGroup(group.key)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, whiteSpace: "nowrap", fontSize: 12, fontWeight: isAct ? 600 : 400, border: "none", cursor: "pointer", background: isAct ? BLUE[600] : "transparent", color: isAct ? "#fff" : "var(--text-secondary)", transition: "background 0.15s, color 0.15s" }}>
                  <Icon size={13} /> {group.label}
                  {group.key === "permissions" && <span style={{ background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 4, marginLeft: 2 }}>NEW</span>}
                </button>
              );
            })}
          </div>

          {activeGroup !== "permissions" && activeGroup !== "users" && (
            <button onClick={handleSave} disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saved ? BLUE[700] : BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, opacity: saving ? 0.7 : 1, transition: "background 0.2s, opacity 0.15s" }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
              {saved ? "Saved" : "Save Changes"}
            </button>
          )}
        </div>

        {/* ── Permissions tab ── */}
        {activeGroup === "permissions" && (
          <div style={{ ...cardBase, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8, paddingBottom: 18, borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Shield size={18} style={{ color: BLUE[500] }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: BLUE[500], textTransform: "uppercase", letterSpacing: "0.07em" }}>access control</p>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.3 }}>Role Permissions</h3>
                </div>
              </div>
              {permSaved && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#3b82f6", fontSize: 12, fontWeight: 600 }}>
                  <CheckCircle2 size={14} /> Saved
                </div>
              )}
            </div>

            {permLoading ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading permissions…</div>
            ) : !permissions ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 12px" }}>No company permissions found. Create your company workspace to manage permissions.</p>
                <a href="/onboarding" style={{ fontSize: 13, color: BLUE[600], fontWeight: 600, textDecoration: "none" }}>Set up company →</a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                {PERMISSION_GROUPS.map(group => {
                  const Icon = group.icon;
                  return (
                    <div key={group.label}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: `${group.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={14} style={{ color: group.color }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-primary)" }}>{group.label}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 12px 36px" }}>
                        Toggle which features are accessible to this portal&apos;s users.
                      </p>
                      <div style={{ paddingLeft: 36 }}>
                        {group.items.map(item => {
                          const isOn = permissions[item.key as keyof Permissions];
                          return (
                            <div key={item.key} className="perm-row">
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{item.label}</p>
                                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>{item.desc}</p>
                              </div>
                              <button className="perm-toggle" onClick={() => togglePermission(item.key as keyof Permissions)} title={isOn ? "Click to disable" : "Click to enable"}>
                                {isOn
                                  ? <ToggleRight size={32} style={{ color: BLUE[600] }} />
                                  : <ToggleLeft  size={32} style={{ color: "#cbd5e1" }} />}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                <div style={{ background: "#fef9ec", border: "1px solid #fcd34d", borderRadius: 10, padding: "12px 16px" }}>
                  <p style={{ fontSize: 12, color: "#92400e", margin: 0, lineHeight: 1.7 }}>
                    <strong>⚠ Note:</strong> Disabling a feature removes access immediately. Employees won&apos;t be able to use that feature until you re-enable it here.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── User Management tab ── */}
        {activeGroup === "users" && (
          <div style={{ ...cardBase, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 18, borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Users size={18} style={{ color: BLUE[500] }} />
                </div>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: BLUE[500], textTransform: "uppercase", letterSpacing: "0.07em" }}>access control</p>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.3 }}>User Management</h3>
                </div>
              </div>
              {userMsg && (
                <div style={{ fontSize: 12, color: userMsg.toLowerCase().includes("error") || userMsg.toLowerCase().includes("fail") ? "var(--danger)" : "#3b82f6", fontWeight: 500 }}>
                  {userMsg}
                </div>
              )}
            </div>

            {usersLoading ? (
              <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>Loading users…</div>
            ) : users.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 13, margin: "0 0 12px" }}>No portal users found.</p>
                <a href="/onboarding/team" style={{ fontSize: 13, color: BLUE[600], fontWeight: 600, textDecoration: "none" }}>Add team members →</a>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 120px", gap: 12, padding: "8px 12px", marginBottom: 4 }}>
                  {["Name / Email", "Role", "Joined", "Actions"].map(h => (
                    <p key={h} style={{ margin: 0, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
                  ))}
                </div>

                {users.map(u => {
                  const roleColor = u.role === "admin" ? BLUE[600] : u.role === "finance" ? "#3b82f6" : "#2563eb";
                  const roleBg    = u.role === "admin" ? BLUE[50]  : u.role === "finance" ? "#dbeafe"  : "#eff6ff";
                  return (
                    <div key={u.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 120px", gap: 12, padding: "12px 12px", borderRadius: 10, alignItems: "center", transition: "background 0.12s" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>

                      <div>
                        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{u.name}</p>
                        <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
                          <Mail size={10} /> {u.email}
                        </p>
                      </div>

                      <div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: roleBg, color: roleColor }}>
                          {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                        </span>
                      </div>

                      <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </p>

                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleResetPassword(u.id)}
                          disabled={resetingId === u.id}
                          title="Reset password"
                          style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-input)", cursor: resetingId === u.id ? "not-allowed" : "pointer", color: BLUE[600], fontSize: 11, fontWeight: 600, opacity: resetingId === u.id ? 0.6 : 1 }}>
                          {resetingId === u.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <KeyRound size={11} />}
                          Reset
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          disabled={deletingId === u.id || u.role === "admin"}
                          title={u.role === "admin" ? "Cannot remove admin" : "Remove user"}
                          style={{ display: "inline-flex", alignItems: "center", padding: "5px 8px", borderRadius: 7, border: "0.5px solid var(--border)", background: "var(--bg-input)", cursor: (deletingId === u.id || u.role === "admin") ? "not-allowed" : "pointer", color: u.role === "admin" ? "var(--text-muted)" : "var(--danger)", fontSize: 11, opacity: (deletingId === u.id || u.role === "admin") ? 0.4 : 1 }}>
                          {deletingId === u.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <Trash2 size={11} />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "0.5px solid var(--border)", display: "flex", gap: 10 }}>
              <a href="/onboarding/team" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: `0.5px solid ${BLUE[200]}`, background: BLUE[50], color: BLUE[600], fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                <RefreshCw size={12} /> Add More Users
              </a>
              <div style={{ background: "var(--bg-input)", borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
                <KeyRound size={11} /> Only you (the admin) can reset passwords for all accounts.
              </div>
            </div>
          </div>
        )}

        {/* ── Normal settings tab ── */}
        {activeGroup !== "permissions" && activeGroup !== "users" && (
          <div style={{ ...cardBase, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: "0.5px solid var(--border)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <ActiveIcon size={18} style={{ color: BLUE[500] }} />
              </div>
              <div>
                <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: BLUE[500], textTransform: "uppercase", letterSpacing: "0.07em" }}>{activeGroup}</p>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.3 }}>{activeGroupLabel}</h3>
              </div>
            </div>

            {groupSettings.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No settings found for this group.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
                {groupSettings.map(setting => (
                  <div key={setting.key} style={{ display: "flex", flexDirection: "column" }}>
                    <label style={lbl}>{settingLabels[setting.key] || setting.key}</label>
                    {setting.key === "company_address" ? (
                      <textarea value={setting.value} onChange={e => handleChange(setting.key, e.target.value)} rows={3} className="settings-inp" style={{ ...inp, resize: "none" }} />
                    ) : setting.key === "currency" ? (
                      <select value={setting.value} onChange={e => handleChange(setting.key, e.target.value)} className="settings-inp" style={{ ...inp, cursor: "pointer" }}>
                        <option value="USD">USD — US Dollar</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                        <option value="GHS">GHS — Ghana Cedi</option>
                      </select>
                    ) : setting.key === "pay_cycle" ? (
                      <select value={setting.value} onChange={e => handleChange(setting.key, e.target.value)} className="settings-inp" style={{ ...inp, cursor: "pointer" }}>
                        <option value="Weekly">Weekly</option>
                        <option value="Bi-Weekly">Bi-Weekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    ) : (
                      <input type={setting.key.includes("days") || setting.key === "tax_year" ? "number" : "text"} value={setting.value} onChange={e => handleChange(setting.key, e.target.value)} className="settings-inp" style={inp} />
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: 24, paddingTop: 18, borderTop: "0.5px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={handleSave} disabled={saving}
                style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saved ? BLUE[700] : BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, opacity: saving ? 0.7 : 1, transition: "background 0.2s, opacity 0.15s" }}>
                {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <CheckCircle2 size={13} /> : <Save size={13} />}
                {saved ? "Saved!" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
