"use client";

import { useEffect, useState } from "react";
import { Lock, User, CheckCircle2, Loader2 } from "lucide-react";

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5,
};

interface Session { name: string; email: string; firstName?: string; lastName?: string; }

export default function SettingsPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [pwForm, setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch("/api/portal/employee/me")
      .then(r => r.json())
      .then(d => {
        setSession({ name: d.session?.name, email: d.session?.email, firstName: d.employee?.firstName, lastName: d.employee?.lastName });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/portal/employee/settings", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update password");
        return;
      }
      setSaved(true);
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 250].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Settings</h1>
      </div>

      {/* Account Info */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={14} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Account Information</h3>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
          <div>
            <p style={{ ...lbl, marginBottom: 3 }}>Full Name</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{session?.name || "—"}</p>
          </div>
          <div>
            <p style={{ ...lbl, marginBottom: 3 }}>Email</p>
            <p style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{session?.email || "—"}</p>
          </div>
          <div>
            <p style={{ ...lbl, marginBottom: 3 }}>Portal Access</p>
            <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--accent-light)", color: "var(--accent)" }}>Employee</span>
          </div>
        </div>
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-body)", border: "0.5px solid var(--border)" }}>
            <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
              To update your personal details (name, phone, address), please contact HR or visit your Profile page. Settings here manage your account security only.
            </p>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={14} style={{ color: "var(--accent)" }} />
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} style={{ padding: 20 }}>
          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16, fontSize: 12, color: "var(--danger)" }}>{error}</div>
          )}
          {saved && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #86efac", marginBottom: 16, fontSize: 12, color: "#16a34a", display: "flex", alignItems: "center", gap: 6 }}>
              <CheckCircle2 size={13} /> Password updated successfully
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
            <div>
              <label style={lbl}>Current Password</label>
              <input
                type="password" required value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                style={inp} placeholder="Your current password"
              />
            </div>
            <div>
              <label style={lbl}>New Password</label>
              <input
                type="password" required value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                style={inp} placeholder="At least 6 characters"
              />
            </div>
            <div>
              <label style={lbl}>Confirm New Password</label>
              <input
                type="password" required value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                style={inp} placeholder="Repeat new password"
              />
            </div>
            <div>
              <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: saving ? 0.75 : 1 }}>
                {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Lock size={13} />}
                Update Password
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
