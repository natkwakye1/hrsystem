"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Download, Eye, Wallet, AlertTriangle, CheckCircle2, CreditCard,
  Users, Filter, X, ChevronDown, ChevronUp, Loader2, Building2,
  Banknote,
} from "lucide-react";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 7, border: "0.5px solid var(--border)",
  background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12,
  cursor: "pointer", outline: "none", fontFamily: "inherit",
};

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Pending:    { bg: BLUE[50],  color: BLUE[500] },
  Processing: { bg: BLUE[100], color: BLUE[700] },
  Processed:  { bg: BLUE[200], color: BLUE[700] },
  Rejected:   { bg: BLUE[200], color: BLUE[900] },
  Paid:       { bg: BLUE[200], color: BLUE[700] },
};

interface BankAccount { bankName: string; accountNumber: string; accountType?: string; isPrimary: boolean; }
interface Employee {
  firstName: string; lastName: string; employeeId: string;
  department?: string; bankAccounts: BankAccount[];
}
interface Payroll {
  id: string; period: string; netPay: number; basicSalary: number;
  allowances: number; deductions: number; tax: number;
  status: string; paymentDate?: string; employee: Employee;
}
interface PaymentRun {
  period: string;
  payrolls: Payroll[];
  totalNet: number;
  processed: number;
  pending: number;
  rejected: number;
  processing: number;
  missingBank: number;
}

function maskAccount(num: string) {
  if (num.length <= 4) return num;
  return "•••• " + num.slice(-4);
}

function StatusPill({ status }: { status: string }) {
  const sc = STATUS_COLOR[status] ?? STATUS_COLOR.Pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: sc.bg, color: sc.color, whiteSpace: "nowrap",
    }}>
      {status === "Processing" && <Loader2 size={9} style={{ animation: "spin 1s linear infinite" }} />}
      {status}
    </span>
  );
}

export default function FinancePaymentsPage() {
  const [payrolls,    setPayrolls]    = useState<Payroll[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [periodFilter, setPeriodFilter] = useState("");
  const [expanded,    setExpanded]    = useState<string | null>(null);
  const [detailRun,   setDetailRun]   = useState<PaymentRun | null>(null);
  const [exporting,   setExporting]   = useState<string | null>(null);
  const [exported,    setExported]    = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payroll")
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── Group payrolls into payment runs by period ── */
  const runs = useMemo<PaymentRun[]>(() => {
    const map = new Map<string, Payroll[]>();
    payrolls.forEach(p => {
      if (!map.has(p.period)) map.set(p.period, []);
      map.get(p.period)!.push(p);
    });
    return Array.from(map.entries())
      .map(([period, list]) => ({
        period,
        payrolls: list,
        totalNet:    list.reduce((s, p) => s + p.netPay, 0),
        processed:   list.filter(p => p.status === "Processed" || p.status === "Paid").length,
        pending:     list.filter(p => p.status === "Pending").length,
        rejected:    list.filter(p => p.status === "Rejected").length,
        processing:  list.filter(p => p.status === "Processing").length,
        missingBank: list.filter(p => p.employee.bankAccounts.length === 0).length,
      }))
      .sort((a, b) => b.period.localeCompare(a.period));
  }, [payrolls]);

  const filtered = useMemo(() => {
    if (!periodFilter) return runs;
    return runs.filter(r => r.period === periodFilter);
  }, [runs, periodFilter]);

  /* ── KPI totals ── */
  const totalDisbursed = useMemo(() =>
    payrolls.filter(p => p.status === "Processed" || p.status === "Paid").reduce((s, p) => s + p.netPay, 0),
    [payrolls]);
  const totalProcessed  = useMemo(() => payrolls.filter(p => p.status === "Processed" || p.status === "Paid").length, [payrolls]);
  const totalMissing    = useMemo(() => payrolls.filter(p => p.employee.bankAccounts.length === 0).length, [payrolls]);
  const avgNet          = useMemo(() => payrolls.length ? payrolls.reduce((s, p) => s + p.netPay, 0) / payrolls.length : 0, [payrolls]);
  const allMissingNames = useMemo(() =>
    [...new Map(
      payrolls
        .filter(p => p.employee.bankAccounts.length === 0)
        .map(p => [p.employee.employeeId, `${p.employee.firstName} ${p.employee.lastName}`])
    ).values()],
    [payrolls]);

  const handleExport = async (run: PaymentRun) => {
    setExporting(run.period);
    try {
      const q = new URLSearchParams({ status: "Processed", period: run.period });
      const res = await fetch(`/api/payroll/export?${q}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `payment-run-${run.period}.csv`;
      a.click(); URL.revokeObjectURL(url);
      setExported(run.period);
      setTimeout(() => setExported(null), 3000);
    } finally { setExporting(null); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 120, 400].map((h, i) => (
        <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
    </div>
  );

  return (
    <>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Bulk Payments</h1>
          </div>
          <button
            onClick={() => {
              const q = new URLSearchParams({ status: "Processed" });
              if (periodFilter) q.set("period", periodFilter);
              window.location.href = `/api/payroll/export?${q}`;
            }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}
          >
            <Download size={14} /> Export All CSV
          </button>
        </div>

        {/* ── KPI Strip ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14 }}>
          {[
            { icon: Banknote,      label: "Total Disbursed",   value: `$${totalDisbursed.toLocaleString()}`,          sub: "processed payrolls",          iconBg: BLUE[100],  iconColor: BLUE[600]  },
            { icon: Users,         label: "Processed Records", value: String(totalProcessed),                         sub: `of ${payrolls.length} total`,  iconBg: "#eff6ff",  iconColor: "#1d4ed8"  },
            { icon: CreditCard,    label: "Avg. Net Pay",      value: `$${Math.round(avgNet).toLocaleString()}`,       sub: "per employee",                 iconBg: "#eff6ff",  iconColor: "#2563eb"  },
            { icon: AlertTriangle, label: "Missing Bank Info", value: String(totalMissing),                           sub: "accounts not on file",         iconBg: "#fef9c3",  iconColor: "#b45309"  },
          ].map(s => (
            <div key={s.label} style={{ ...cardBase, padding: "20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <s.icon size={18} color={s.iconColor} strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px", letterSpacing: -0.5 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Missing bank warning ── */}
        {allMissingNames.length > 0 && (
          <div style={{ padding: "13px 16px", borderRadius: 10, background: BLUE[50], border: `1px solid ${BLUE[200]}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
            <AlertTriangle size={16} style={{ color: BLUE[600], flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 12, fontWeight: 600, color: BLUE[900], margin: "0 0 2px" }}>
                {allMissingNames.length} employee{allMissingNames.length > 1 ? "s" : ""} missing bank account
              </p>
              <p style={{ fontSize: 11, color: BLUE[700], margin: 0 }}>
                {allMissingNames.join(", ")} — these employees will be excluded from CSV exports.
              </p>
            </div>
          </div>
        )}

        {/* ── Payment Runs Table ── */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          {/* Filter bar */}
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Filter size={14} style={{ color: "var(--text-muted)" }} />
            <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={inp}>
              <option value="">All Periods</option>
              {runs.map(r => <option key={r.period} value={r.period}>{r.period}</option>)}
            </select>
            <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
              {filtered.length} payment run{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Column headers */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--bg-body)" }}>
                  {["", "Period", "Employees", "Total Net Pay", "Processed", "Pending", "Rejected", "Missing Bank", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: 48, textAlign: "center" }}>
                      <Wallet size={32} style={{ color: "var(--border)", display: "block", margin: "0 auto 10px" }} />
                      <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>No payment runs found</p>
                    </td>
                  </tr>
                ) : filtered.map((run, i) => {
                  const isOpen = expanded === run.period;
                  const isFullyProcessed = run.processed === run.payrolls.length;
                  const hasIssues = run.missingBank > 0 || run.pending > 0;
                  return (
                    <React.Fragment key={run.period}>
                      <tr
                        style={{
                          borderTop: "0.5px solid var(--border)",
                          background: isOpen ? "var(--accent-light)" : i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)",
                          cursor: "pointer",
                          transition: "background 0.12s",
                        }}
                        onClick={() => setExpanded(isOpen ? null : run.period)}
                      >
                        {/* Expand toggle */}
                        <td style={{ padding: "14px 10px 14px 16px", width: 32 }}>
                          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 22, height: 22, borderRadius: 6, background: "var(--bg-hover)", color: "var(--text-muted)" }}>
                            {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </span>
                        </td>
                        {/* Period */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 34, height: 34, borderRadius: 9, background: isFullyProcessed ? "#eff6ff" : "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Banknote size={14} style={{ color: isFullyProcessed ? "#1d4ed8" : "var(--accent)" }} />
                            </div>
                            <div>
                              <p style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{run.period}</p>
                              <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "1px 0 0" }}>
                                {isFullyProcessed ? "Fully processed" : hasIssues ? "Action needed" : "In progress"}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Count */}
                        <td style={{ padding: "14px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Users size={12} style={{ color: "var(--text-muted)" }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{run.payrolls.length}</span>
                          </div>
                        </td>
                        {/* Total */}
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>${run.totalNet.toLocaleString()}</span>
                        </td>
                        {/* Processed */}
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: BLUE[700], background: BLUE[200], padding: "2px 9px", borderRadius: 4 }}>{run.processed}</span>
                        </td>
                        {/* Pending */}
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: run.pending > 0 ? BLUE[500] : "var(--text-muted)", background: run.pending > 0 ? BLUE[50] : "transparent", padding: "2px 9px", borderRadius: 4 }}>{run.pending}</span>
                        </td>
                        {/* Rejected */}
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: run.rejected > 0 ? BLUE[900] : "var(--text-muted)", background: run.rejected > 0 ? BLUE[200] : "transparent", padding: "2px 9px", borderRadius: 4 }}>{run.rejected}</span>
                        </td>
                        {/* Missing bank */}
                        <td style={{ padding: "14px 14px" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: run.missingBank > 0 ? BLUE[700] : "var(--text-muted)", background: run.missingBank > 0 ? BLUE[100] : "transparent", padding: "2px 9px", borderRadius: 4 }}>{run.missingBank}</span>
                        </td>
                        {/* Actions */}
                        <td style={{ padding: "14px 14px" }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setDetailRun(run)}
                              style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, background: "var(--bg-body)", border: "0.5px solid var(--border)", color: "var(--text-secondary)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                            >
                              <Eye size={12} /> View
                            </button>
                            <button
                              onClick={() => handleExport(run)}
                              disabled={exporting === run.period || run.processed === 0}
                              style={{
                                display: "flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7,
                                background: exported === run.period ? "#eff6ff" : "var(--accent)",
                                color: exported === run.period ? "#1d4ed8" : "#fff",
                                border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer",
                                opacity: (exporting === run.period || run.processed === 0) ? 0.55 : 1,
                              }}
                            >
                              {exporting === run.period
                                ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
                                : exported === run.period
                                  ? <CheckCircle2 size={11} />
                                  : <Download size={11} />}
                              {exported === run.period ? "Done!" : "Export"}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* ── Expanded inline detail ── */}
                      {isOpen && (
                        <tr style={{ borderTop: "0.5px solid var(--border)" }}>
                          <td colSpan={9} style={{ padding: 0 }}>
                            <div style={{ background: "var(--bg-body)", borderBottom: "0.5px solid var(--border)" }}>
                              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                  <tr>
                                    {["Employee", "Department", "Bank", "Account", "Net Pay", "Status"].map(h => (
                                      <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", background: "var(--bg-body)" }}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {run.payrolls.map((p, j) => {
                                    const bank = p.employee.bankAccounts.find(b => b.isPrimary) ?? p.employee.bankAccounts[0];
                                    return (
                                      <tr key={p.id} style={{ borderTop: "0.5px solid var(--border)", background: j % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                                        <td style={{ padding: "10px 14px" }}>
                                          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1px" }}>{p.employee.firstName} {p.employee.lastName}</p>
                                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>ID: {p.employee.employeeId}</p>
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{p.employee.department || "—"}</td>
                                        <td style={{ padding: "10px 14px" }}>
                                          {bank
                                            ? <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Building2 size={12} style={{ color: "var(--text-muted)" }} />
                                                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{bank.bankName}</span>
                                              </div>
                                            : <span style={{ fontSize: 11, fontWeight: 600, color: BLUE[700], background: BLUE[100], padding: "2px 8px", borderRadius: 4 }}>Missing</span>
                                          }
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                                          {bank ? maskAccount(bank.accountNumber) : "—"}
                                        </td>
                                        <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>${p.netPay.toLocaleString()}</td>
                                        <td style={{ padding: "10px 14px" }}><StatusPill status={p.status} /></td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Detail Modal ── */}
      {detailRun && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", padding: 20 }}
          onClick={() => setDetailRun(null)}
        >
          <div
            style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 780, maxHeight: "88vh", display: "flex", flexDirection: "column", boxShadow: "var(--shadow-xl)" }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)", flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>Payment Run — {detailRun.period}</h3>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{detailRun.payrolls.length} employees · ${detailRun.totalNet.toLocaleString()} total net pay</p>
              </div>
              <button onClick={() => setDetailRun(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4 }}><X size={18} /></button>
            </div>

            {/* Summary chips */}
            <div style={{ padding: "14px 24px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", flexShrink: 0 }}>
              {[
                { label: "Processed",    count: detailRun.processed,   bg: BLUE[200], color: BLUE[700] },
                { label: "Pending",      count: detailRun.pending,      bg: BLUE[50],  color: BLUE[500] },
                { label: "Rejected",     count: detailRun.rejected,     bg: BLUE[200], color: BLUE[900] },
                { label: "Missing Bank", count: detailRun.missingBank,  bg: BLUE[100], color: BLUE[700] },
              ].map(c => c.count > 0 && (
                <span key={c.label} style={{ fontSize: 11, fontWeight: 600, padding: "4px 12px", borderRadius: 999, background: c.bg, color: c.color }}>
                  {c.count} {c.label}
                </span>
              ))}
              <button
                onClick={() => handleExport(detailRun)}
                disabled={exporting === detailRun.period || detailRun.processed === 0}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 7, background: "var(--accent)", color: "#fff", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: (exporting === detailRun.period || detailRun.processed === 0) ? 0.6 : 1 }}
              >
                {exporting === detailRun.period
                  ? <Loader2 size={11} style={{ animation: "spin 1s linear infinite" }} />
                  : <Download size={11} />}
                Export CSV
              </button>
            </div>

            {/* Table */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, background: "var(--bg-body)", zIndex: 1 }}>
                  <tr>
                    {["Employee", "Department", "Bank", "Account No.", "Basic", "Net Pay", "Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", whiteSpace: "nowrap", borderBottom: "0.5px solid var(--border)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detailRun.payrolls.map((p, i) => {
                    const bank = p.employee.bankAccounts.find(b => b.isPrimary) ?? p.employee.bankAccounts[0];
                    return (
                      <tr key={p.id} style={{ borderBottom: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1px" }}>{p.employee.firstName} {p.employee.lastName}</p>
                          <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{p.employee.employeeId}</p>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>{p.employee.department || "—"}</td>
                        <td style={{ padding: "12px 16px" }}>
                          {bank
                            ? <div>
                                <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 1px" }}>{bank.bankName}</p>
                                <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{bank.accountType || "Savings"}</p>
                              </div>
                            : <span style={{ fontSize: 11, fontWeight: 600, color: BLUE[700], background: BLUE[100], padding: "3px 8px", borderRadius: 4, display: "inline-flex", alignItems: "center", gap: 4 }}>
                                <AlertTriangle size={9} /> Missing
                              </span>
                          }
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)", fontFamily: "monospace" }}>
                          {bank ? maskAccount(bank.accountNumber) : "—"}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "var(--text-secondary)" }}>${p.basicSalary.toLocaleString()}</td>
                        <td style={{ padding: "12px 16px", fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>${p.netPay.toLocaleString()}</td>
                        <td style={{ padding: "12px 16px" }}><StatusPill status={p.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal footer */}
            <div style={{ padding: "14px 24px", borderTop: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0, background: "var(--bg-body)", borderRadius: "0 0 16px 16px" }}>
              <div style={{ display: "flex", gap: 20 }}>
                <div>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 1px" }}>Total Net</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", margin: 0 }}>${detailRun.totalNet.toLocaleString()}</p>
                </div>
                <div>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 1px" }}>Employees</p>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{detailRun.payrolls.length}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailRun(null)}
                style={{ padding: "8px 20px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
