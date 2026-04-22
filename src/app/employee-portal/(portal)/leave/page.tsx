"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, X, Loader2, CheckCircle2 } from "lucide-react";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const LEAVE_TYPES = ["Annual Leave","Sick Leave","Maternity Leave","Paternity Leave","Compassionate Leave","Study Leave","Unpaid Leave"];

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Approved: { bg: BLUE[100], color: BLUE[700] },
  Pending:  { bg: BLUE[50],  color: BLUE[500] },
  Rejected: { bg: BLUE[200], color: BLUE[900] },
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 13, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--text-muted)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

interface LeaveRequest {
  id: string; leaveType: string; startDate: string; endDate: string;
  days: number; status: string; reason?: string;
}
interface Employee { id: string; leaveRequests: LeaveRequest[]; }

export default function LeavePage() {
  const [emp,     setEmp]     = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [err,     setErr]     = useState("");
  const [form, setForm] = useState({ leaveType: "Annual Leave", startDate: "", endDate: "", reason: "" });

  useEffect(() => {
    fetch("/api/portal/employee/me").then(r => r.json()).then(d => { setEmp(d.employee); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const calcDays = () => {
    if (!form.startDate || !form.endDate) return 0;
    return Math.max(1, Math.ceil((new Date(form.endDate).getTime() - new Date(form.startDate).getTime()) / 86400000) + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!emp) return;
    setErr(""); setSaving(true);
    try {
      const res = await fetch("/api/leave", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: emp.id, ...form, days: calcDays() }),
      });
      if (!res.ok) { setErr("Failed to submit request."); return; }
      const newLeave = await res.json();
      setEmp(p => p ? { ...p, leaveRequests: [newLeave, ...p.leaveRequests] } : p);
      setSaved(true);
      setTimeout(() => { setSaved(false); setModal(false); setForm({ leaveType: "Annual Leave", startDate: "", endDate: "", reason: "" }); }, 1400);
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const leaves   = emp?.leaveRequests ?? [];
  const pending  = leaves.filter(l => l.status === "Pending").length;
  const approved = leaves.filter(l => l.status === "Approved");
  const rejected = leaves.filter(l => l.status === "Rejected").length;
  const daysUsed = approved.reduce((s, l) => s + l.days, 0);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Leave Requests</h1>
          </div>
          <button
            onClick={() => setModal(true)}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            <Plus size={14} /> Request Leave
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 14 }}>
          {[
            { label: "Total Requests", value: leaves.length },
            { label: "Days Used",      value: daysUsed      },
            { label: "Pending",        value: pending        },
            { label: "Rejected",       value: rejected       },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
              <p style={{ ...lbl, marginBottom: 6 }}>{s.label}</p>
              <p style={{ fontSize: 26, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>All Leave Requests</h3>
          </div>
          {leaves.length === 0 ? (
            <div style={{ padding: "48px 0", textAlign: "center" }}>
              <CalendarDays size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No leave requests yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "var(--bg-body)" }}>
                    {["Type","Start Date","End Date","Days","Reason","Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((l, i) => {
                    const sc = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.Pending;
                    return (
                      <tr key={l.id} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{l.leaveType}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{l.startDate}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{l.endDate}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{l.days}</td>
                        <td style={{ padding: "12px 16px", color: "var(--text-muted)", maxWidth: 200 }}>{l.reason || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{l.status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 480, boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Request Leave</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: 24 }}>
              {err && <div style={{ padding: "10px 14px", borderRadius: 8, background: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", marginBottom: 16, fontSize: 12, color: "var(--danger)" }}>{err}</div>}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={lbl}>Leave Type</label>
                  <select value={form.leaveType} onChange={e => setForm(f => ({ ...f, leaveType: e.target.value }))} style={{ ...inp, cursor: "pointer" }}>
                    {LEAVE_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={lbl}>Start Date</label>
                    <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>End Date</label>
                    <input type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inp} />
                  </div>
                </div>
                {form.startDate && form.endDate && (
                  <p style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, margin: 0 }}>Duration: {calcDays()} day{calcDays() !== 1 ? "s" : ""}</p>
                )}
                <div>
                  <label style={lbl}>Reason (optional)</label>
                  <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} rows={3} style={{ ...inp, resize: "none" }} placeholder="Brief description..." />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "0.5px solid var(--border)" }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-card)", fontSize: 13, fontWeight: 500, cursor: "pointer", color: "var(--text-secondary)" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: saving ? 0.75 : 1 }}>
                  {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : saved ? <><CheckCircle2 size={13} /> Submitted</> : "Submit Request"}
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
