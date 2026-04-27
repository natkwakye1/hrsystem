"use client";

import { useEffect, useState } from "react";
import { Plus, X, Loader2, CheckCircle2, Inbox } from "lucide-react";

const BLUE = {
  700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

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

const REQUEST_TYPES = ["Salary Advance", "Loan", "Payroll Correction", "Document Request", "Other"];

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Pending:  { bg: BLUE[50],  color: BLUE[500] },
  Approved: { bg: "#eff6ff", color: "#1d4ed8" },
  Rejected: { bg: "#fee2e2", color: "#b91c1c" },
};

interface EmployeeRequest {
  id: string; type: string; subject: string; description?: string;
  amount?: number; status: string; reviewNote?: string; createdAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<EmployeeRequest[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);
  const [form, setForm] = useState({ type: "Salary Advance", subject: "", description: "", amount: "" });

  const load = () => {
    fetch("/api/portal/employee/requests")
      .then(r => r.json())
      .then(d => { setRequests(d.requests ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/portal/employee/requests", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newReq = await res.json();
        setRequests(prev => [newReq, ...prev]);
        setSaved(true);
        setTimeout(() => { setSaved(false); setModal(false); setForm({ type: "Salary Advance", subject: "", description: "", amount: "" }); }, 1400);
      }
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const pending  = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>My Requests</h1>
          </div>
          <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
            <Plus size={14} /> New Request
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }}>
          {[
            { label: "Total",    value: requests.length },
            { label: "Pending",  value: pending  },
            { label: "Approved", value: approved },
            { label: "Rejected", value: requests.filter(r => r.status === "Rejected").length },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Request list */}
        {requests.length === 0 ? (
          <div style={{ ...cardBase, padding: "48px 0", textAlign: "center" }}>
            <Inbox size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No requests submitted yet</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.map(r => {
              const sc = STATUS_COLOR[r.status] ?? STATUS_COLOR.Pending;
              return (
                <div key={r.id} style={{ ...cardBase, padding: "16px 20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 5, background: BLUE[50], color: BLUE[600], fontSize: 10, fontWeight: 600 }}>{r.type}</span>
                        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{r.status}</span>
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{r.subject}</p>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {r.amount && <p style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)", margin: "0 0 2px" }}>${r.amount.toLocaleString()}</p>}
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {r.description && <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 6px" }}>{r.description}</p>}
                  {r.reviewNote && (
                    <div style={{ padding: "8px 12px", borderRadius: 7, background: "var(--bg-body)", borderLeft: "3px solid var(--accent)", marginTop: 8 }}>
                      <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}><strong>HR Note:</strong> {r.reviewNote}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>New Request</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={lbl}>Request Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inp}>
                  {REQUEST_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Subject</label>
                <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} style={inp} placeholder="Brief description of your request" />
              </div>
              {(form.type === "Salary Advance" || form.type === "Loan") && (
                <div>
                  <label style={lbl}>Amount Requested ($)</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} style={inp} placeholder="0.00" />
                </div>
              )}
              <div>
                <label style={lbl}>Details (optional)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inp, resize: "none" }} placeholder="Additional context..." />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: saving ? 0.75 : 1 }}>
                  {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <><CheckCircle2 size={13} /> Submitted</> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
