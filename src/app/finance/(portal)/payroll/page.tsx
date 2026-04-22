"use client";

import { useEffect, useState, useMemo } from "react";
import { Wallet, CheckCircle2, XCircle, Loader2, Filter, Play, X, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 7, border: "0.5px solid var(--border)",
  background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12,
  cursor: "pointer", outline: "none", fontFamily: "inherit",
};

interface Employee { firstName: string; lastName: string; department?: string; position?: string; employeeId: string; }
interface Payroll {
  id: string; period: string; basicSalary: number; allowances: number;
  deductions: number; tax: number; netPay: number; status: string;
  paymentDate?: string; employee: Employee;
}
interface Summary { totalBasic: number; totalAllowances: number; totalDeductions: number; totalTax: number; totalNet: number; }

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Pending:    { bg: BLUE[50],  color: BLUE[500] },
  Processing: { bg: BLUE[100], color: BLUE[700] },
  Processed:  { bg: BLUE[200], color: BLUE[700] },
  Rejected:   { bg: BLUE[200], color: BLUE[900] },
  Approved:   { bg: BLUE[100], color: BLUE[700] },
  Paid:       { bg: BLUE[200], color: BLUE[700] },
};

export default function FinancePayrollPage() {
  const [payrolls,  setPayrolls]  = useState<Payroll[]>([]);
  const [summary,   setSummary]   = useState<Summary | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [period,    setPeriod]    = useState("");
  const [status,    setStatus]    = useState("");
  const [page,      setPage]      = useState(1);
  const [updating,  setUpdating]  = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [runModal,  setRunModal]  = useState(false);
  const [running,   setRunning]   = useState(false);
  const [runResult, setRunResult] = useState<{ created: number; period: string } | null>(null);
  const [runForm,   setRunForm]   = useState({ period: new Date().toISOString().slice(0, 7), taxRate: "15" });

  const loadData = (p = period, s = status) => {
    const q = new URLSearchParams();
    if (p) q.set("period", p);
    if (s) q.set("status", s);
    fetch(`/api/payroll?${q.toString()}`)
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls ?? []); setSummary(d.summary ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);
  useEffect(() => { setPage(1); }, [period, status]);

  const totalPages = Math.max(1, Math.ceil(payrolls.length / PAGE_SIZE));
  const paginated  = useMemo(() => payrolls.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [payrolls, page]);
  const startEntry = payrolls.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, payrolls.length);

  const handleRunPayroll = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setRunning(true);
    try {
      const res = await fetch("/api/payroll/run", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: runForm.period, taxRate: parseFloat(runForm.taxRate) / 100 }),
      });
      const data = await res.json();
      setRunResult({ created: data.created, period: runForm.period });
      loadData();
    } finally { setRunning(false); }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "Processing") {
      // Step 1: set to Processing immediately
      setUpdating(id);
      setProcessingIds(prev => new Set(prev).add(id));
      await fetch(`/api/payroll/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Processing" }),
      });
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "Processing" } : p));
      setUpdating(null);

      // Step 2: simulate bank transfer delay then auto-complete to Processed
      setTimeout(async () => {
        await fetch(`/api/payroll/${id}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Processed", paymentDate: new Date().toISOString() }),
        });
        setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: "Processed" } : p));
        setProcessingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
      }, 3000);
      return;
    }

    setUpdating(id);
    try {
      await fetch(`/api/payroll/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } finally { setUpdating(null); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 400].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const periods = [...new Set(payrolls.map(p => p.period))].sort().reverse();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Payroll Management</h1>
        </div>
        <button
          onClick={() => { setRunModal(true); setRunResult(null); }}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
        >
          <Play size={14} /> Run Payroll
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
        {[
          { label: "Net Payroll",  value: summary?.totalNet        ?? 0 },
          { label: "Gross Total",  value: (summary?.totalBasic ?? 0) + (summary?.totalAllowances ?? 0) },
          { label: "Tax Withheld", value: summary?.totalTax        ?? 0 },
          { label: "Deductions",   value: summary?.totalDeductions ?? 0 },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>${s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        {/* Filter bar */}
        <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <select value={period} onChange={e => { setPeriod(e.target.value); loadData(e.target.value, status); }} style={inp}>
            <option value="">All Periods</option>
            {periods.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); loadData(period, e.target.value); }} style={inp}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Processed">Processed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{payrolls.length} records · page {page}/{totalPages}</span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-body)" }}>
                {["Employee", "Department", "Period", "Basic", "Allowances", "Tax", "Net Pay", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No payroll records found.</td></tr>
              ) : paginated.map((p, i) => {
                const sc = STATUS_COLOR[p.status] ?? STATUS_COLOR.Pending;
                return (
                  <tr key={p.id} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{p.employee.firstName} {p.employee.lastName}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>ID: {p.employee.employeeId}</p>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{p.employee.department || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.period}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>${p.basicSalary.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>${p.allowances.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>${p.tax.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>${p.netPay.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>
                        {p.status === "Processing" && <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} />}
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {p.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            onClick={() => updateStatus(p.id, "Processing")}
                            disabled={updating === p.id}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: BLUE[100], color: BLUE[700], border: `1px solid ${BLUE[200]}`, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          >
                            {updating === p.id ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> : <CheckCircle2 size={11} />} Approve
                          </button>
                          <button
                            onClick={() => updateStatus(p.id, "Rejected")}
                            disabled={updating === p.id}
                            style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: BLUE[200], color: BLUE[900], border: `1px solid ${BLUE[300]}`, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                          >
                            <XCircle size={11} /> Reject
                          </button>
                        </div>
                      )}
                      {p.status === "Processing" && (
                        <span style={{ fontSize: 11, color: BLUE[600], display: "flex", alignItems: "center", gap: 4 }}>
                          <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} /> Transferring...
                        </span>
                      )}
                      {(p.status === "Processed" || p.status === "Paid") && (
                        <span style={{ fontSize: 11, color: BLUE[700], display: "flex", alignItems: "center", gap: 4 }}>
                          <CheckCircle2 size={11} /> Transfer complete
                        </span>
                      )}
                      {p.status === "Rejected" && (
                        <span style={{ fontSize: 11, color: BLUE[900], display: "flex", alignItems: "center", gap: 4 }}>
                          <XCircle size={11} /> Rejected
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && payrolls.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{payrolls.length}</strong> records
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={14} />
              </button>
              {(() => {
                const items: (number | "...")[] = [];
                if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) items.push(i); }
                else { items.push(1); if (page > 3) items.push("..."); for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i); if (page < totalPages - 2) items.push("..."); items.push(totalPages); }
                return items.map((item, idx) => item === "..." ? (
                  <span key={`d${idx}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>…</span>
                ) : (
                  <button key={item} onClick={() => setPage(item as number)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: page === item ? `0.5px solid ${BLUE[400]}` : "0.5px solid transparent", background: page === item ? BLUE[50] : "transparent", color: page === item ? BLUE[600] : "var(--text-secondary)", fontSize: 12, fontWeight: page === item ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item}
                  </button>
                ));
              })()}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Run Payroll Modal */}
      {runModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", padding: 20 }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 440, boxShadow: "var(--shadow-xl)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Run Batch Payroll</h3>
              <button onClick={() => setRunModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            {runResult ? (
              <div style={{ padding: 24, textAlign: "center" }}>
                <CheckCircle2 size={40} style={{ color: BLUE[600], marginBottom: 12 }} />
                <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 6px" }}>Payroll Complete!</p>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 20px" }}>
                  {runResult.created} payroll records created for period <strong>{runResult.period}</strong>.
                  {runResult.created === 0 && " All employees were already processed for this period."}
                </p>
                <button onClick={() => setRunModal(false)} style={{ padding: "9px 24px", borderRadius: 8, background: "var(--accent)", color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleRunPayroll} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ padding: "12px 14px", borderRadius: 8, background: "var(--accent-light)", border: "0.5px solid var(--border)", fontSize: 12, color: "var(--accent)" }}>
                  This will generate payroll records for all active employees for the selected period. Employees already processed will be skipped.
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>
                    Payroll Period
                  </label>
                  <input
                    type="month" required value={runForm.period}
                    onChange={e => setRunForm(f => ({ ...f, period: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5 }}>
                    Tax Rate (PAYE %)
                  </label>
                  <input
                    type="number" min="0" max="50" step="0.5" required value={runForm.taxRate}
                    onChange={e => setRunForm(f => ({ ...f, taxRate: e.target.value }))}
                    style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 13, outline: "none", fontFamily: "inherit", boxSizing: "border-box" as const }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
                  <button type="button" onClick={() => setRunModal(false)} style={{ padding: "9px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={running} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: running ? 0.75 : 1 }}>
                    {running ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Play size={13} />}
                    {running ? "Processing..." : "Run Payroll"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
