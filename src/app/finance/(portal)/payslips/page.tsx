"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { FileText, Download, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 15;

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6",
  400: "#60a5fa", 200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  padding: "7px 10px", borderRadius: 7, border: "0.5px solid var(--border)",
  background: "var(--bg-input)", color: "var(--text-primary)", fontSize: 12,
  outline: "none", fontFamily: "inherit",
};

interface Employee { firstName: string; lastName: string; employeeId: string; department?: string; }
interface Payroll {
  id: string; period: string; basicSalary: number; allowances: number;
  deductions: number; tax: number; netPay: number; status: string;
  paymentDate?: string; employee: Employee;
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Pending:    { bg: BLUE[50],  color: BLUE[500] },
  Processing: { bg: BLUE[100], color: BLUE[700] },
  Processed:  { bg: BLUE[200], color: BLUE[700] },
  Rejected:   { bg: BLUE[200], color: BLUE[900] },
  Paid:       { bg: BLUE[200], color: BLUE[700] },
  Approved:   { bg: BLUE[100], color: BLUE[700] },
};

function generatePayslipHTML(p: Payroll, companyName: string): string {
  return `
<html><head><title>Payslip - ${p.employee.firstName} ${p.employee.lastName}</title>
<style>
  body { font-family: sans-serif; margin: 40px; color: #1e293b; }
  h2 { color: #2563eb; } table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  td, th { padding: 10px 14px; border-bottom: 1px solid #e2e8f0; text-align: left; }
  th { background: #eff6ff; font-size: 12px; text-transform: uppercase; color: #64748b; }
  .net { font-size: 18px; font-weight: 700; color: #2563eb; }
  .header { display: flex; justify-content: space-between; }
</style></head><body>
<div class="header">
  <div><h2>${companyName} HR</h2><p>Payslip for ${p.period}</p></div>
  <div style="text-align:right"><p><strong>${p.employee.firstName} ${p.employee.lastName}</strong></p>
  <p>ID: ${p.employee.employeeId}</p><p>${p.employee.department || ""}</p></div>
</div>
<table>
  <tr><th>Component</th><th>Amount</th></tr>
  <tr><td>Basic Salary</td><td>$${p.basicSalary.toLocaleString()}</td></tr>
  <tr><td>Allowances</td><td>+$${p.allowances.toLocaleString()}</td></tr>
  <tr><td>Deductions</td><td>-$${p.deductions.toLocaleString()}</td></tr>
  <tr><td>Tax (PAYE)</td><td>-$${p.tax.toLocaleString()}</td></tr>
  <tr><td><strong>Net Pay</strong></td><td class="net">$${p.netPay.toLocaleString()}</td></tr>
</table>
<p style="margin-top:20px;color:#64748b;font-size:12px">Status: ${p.status}${p.paymentDate ? ` · Paid: ${p.paymentDate}` : ""}</p>
</body></html>`;
}

export default function FinancePayslipsPage() {
  const pathname = usePathname();
  const [payrolls,    setPayrolls]    = useState<Payroll[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [period,      setPeriod]      = useState("");
  const [status,      setStatus]      = useState("");
  const [page,        setPage]        = useState(1);
  const [companyName, setCompanyName] = useState("Company");

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts.length >= 2 && parts[1] === "finance" ? parts[0] : "";
    if (!slug) return;
    fetch(`/api/company/info?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { if (d.company?.name) setCompanyName(d.company.name); })
      .catch(() => {});
  }, [pathname]);

  const load = (p = period, s = status) => {
    const q = new URLSearchParams();
    if (p) q.set("period", p);
    if (s) q.set("status", s);
    fetch(`/api/payroll?${q}`)
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const downloadPayslip = (p: Payroll) => {
    const html = generatePayslipHTML(p, companyName);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `payslip-${p.employee.employeeId}-${p.period}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 400].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const periods  = [...new Set(payrolls.map(p => p.period))].sort().reverse();
  const filtered = payrolls.filter(p => {
    const name = `${p.employee.firstName} ${p.employee.lastName}`.toLowerCase();
    return !search || name.includes(search.toLowerCase()) || p.employee.employeeId.toLowerCase().includes(search.toLowerCase());
  });

  useEffect(() => { setPage(1); }, [search, period, status]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Payslip Management</h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Payslips", value: payrolls.length },
          { label: "Processed",      value: payrolls.filter(p => p.status === "Processed" || p.status === "Paid").length },
          { label: "Pending",        value: payrolls.filter(p => p.status === "Pending").length },
          { label: "Periods",        value: periods.length },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <Filter size={14} style={{ color: "var(--text-muted)" }} />
          <div style={{ position: "relative" }}>
            <Search size={12} style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input placeholder="Search employee..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft: 26, width: 200 }} />
          </div>
          <select value={period} onChange={e => { setPeriod(e.target.value); load(e.target.value, status); }} style={inp}>
            <option value="">All Periods</option>
            {periods.map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={status} onChange={e => { setStatus(e.target.value); load(period, e.target.value); }} style={inp}>
            <option value="">All Statuses</option>
            {["Pending","Processing","Processed","Rejected"].map(s => <option key={s}>{s}</option>)}
          </select>
          <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{filtered.length} payslips</span>

        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-body)" }}>
                {["Employee", "Department", "Period", "Gross", "Tax", "Deductions", "Net Pay", "Status", ""].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  <FileText size={28} style={{ display: "block", margin: "0 auto 8px", opacity: 0.4 }} />
                  No payslips found
                </td></tr>
              ) : paginated.map((p, i) => {
                const sc = STATUS_COLOR[p.status] ?? STATUS_COLOR.Pending;
                const gross = p.basicSalary + p.allowances;
                return (
                  <tr key={p.id} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                    <td style={{ padding: "11px 14px" }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>{p.employee.firstName} {p.employee.lastName}</p>
                      <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>ID: {p.employee.employeeId}</p>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>{p.employee.department || "—"}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.period}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-primary)", fontWeight: 500 }}>${gross.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>${p.tax.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--text-secondary)" }}>${p.deductions.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--accent)" }}>${p.netPay.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{p.status}</span>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <button onClick={() => downloadPayslip(p)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, background: "var(--accent-light)", color: "var(--accent)", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                        <Download size={11} /> Download
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{filtered.length}</strong> payslips
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
    </div>
  );
}
