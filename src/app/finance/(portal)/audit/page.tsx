"use client";

import { useEffect, useState, useMemo } from "react";
import { Shield, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

const BLUE = {
  700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 7, border: "0.5px solid var(--border)",
  background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12,
  outline: "none", fontFamily: "inherit",
};

const ACTION_COLOR: Record<string, { bg: string; color: string }> = {
  "Run Payroll":  { bg: BLUE[100], color: BLUE[700] },
  "Approve":      { bg: BLUE[100], color: BLUE[700] },
  "Reject":       { bg: BLUE[200], color: BLUE[900] },
};

interface AuditLog {
  id: string; userEmail: string; action: string; entity: string;
  entityId?: string; details?: string; createdAt: string;
}

export default function FinanceAuditPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [entity,  setEntity]  = useState("");
  const [page,    setPage]    = useState(1);

  const load = (e = entity) => {
    const q = new URLSearchParams();
    if (e) q.set("entity", e);
    fetch(`/api/audit-logs?${q}`)
      .then(r => r.json())
      .then(d => { setLogs(d.logs ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [entity]);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const paginated  = useMemo(() => logs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [logs, page]);
  const startEntry = logs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, logs.length);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 400].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const entities = [...new Set(logs.map(l => l.entity))];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Audit Log</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Events",    value: logs.length },
          { label: "Payroll Actions", value: logs.filter(l => l.action.toLowerCase().includes("payroll")).length },
          { label: "Today",           value: logs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Log table */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <select value={entity} onChange={e => { setEntity(e.target.value); load(e.target.value); }} style={inp}>
            <option value="">All Entities</option>
            {entities.map(e => <option key={e}>{e}</option>)}
          </select>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{logs.length} events</span>
        </div>

        {logs.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center" }}>
            <Shield size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No audit events recorded yet</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--bg-body)" }}>
                  {["Timestamp", "User", "Action", "Entity", "Details"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l, i) => {
                  const ac = Object.entries(ACTION_COLOR).find(([key]) => l.action.includes(key))?.[1] ?? { bg: "var(--bg-body)", color: "var(--text-secondary)" };
                  return (
                    <tr key={l.id} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                        {new Date(l.createdAt).toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>{l.userEmail}</td>
                      <td style={{ padding: "10px 14px" }}>
                        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: ac.bg, color: ac.color }}>{l.action}</span>
                      </td>
                      <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{l.entity}</td>
                      <td style={{ padding: "10px 14px", fontSize: 11, color: "var(--text-muted)", maxWidth: 300 }}>{l.details || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
