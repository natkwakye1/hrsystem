"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Wallet, TrendingUp, TrendingDown, DollarSign, Download } from "lucide-react";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 100: "#dbeafe", 50: "#eff6ff",
};

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Paid:       { bg: BLUE[100], color: BLUE[700] },
  Approved:   { bg: BLUE[100], color: BLUE[700] },
  Pending:    { bg: BLUE[50],  color: BLUE[500] },
  Processed:  { bg: "#eff6ff", color: "#1d4ed8" },
  Processing: { bg: "#fef9c3", color: "#854d0e" },
  Rejected:   { bg: "#fee2e2", color: "#b91c1c" },
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

interface Payroll {
  id: string; period: string; basicSalary: number; allowances: number;
  deductions: number; tax: number; netPay: number; status: string; paymentDate?: string;
}
interface Employee {
  firstName: string; lastName: string; employeeId: string; department?: string; position?: string;
  payrolls: Payroll[];
}

function generatePayslipHTML(p: Payroll, emp: Employee, companyName: string): string {
  return `<html><head><title>Payslip ${p.period}</title>
<style>body{font-family:sans-serif;margin:40px;color:#1e293b}h2{color:#2563eb}
table{width:100%;border-collapse:collapse;margin-top:20px}
td,th{padding:10px 14px;border-bottom:1px solid #e2e8f0;text-align:left}
th{background:#eff6ff;font-size:12px;text-transform:uppercase;color:#64748b}
.net{font-size:18px;font-weight:700;color:#2563eb}.hdr{display:flex;justify-content:space-between}</style></head>
<body><div class="hdr"><div><h2>${companyName} HR</h2><p>Payslip for <strong>${p.period}</strong></p></div>
<div style="text-align:right"><p><strong>${emp.firstName} ${emp.lastName}</strong></p>
<p>ID: ${emp.employeeId}</p><p>${emp.department ?? ""}${emp.position ? " · " + emp.position : ""}</p></div></div>
<table><tr><th>Component</th><th>Amount</th></tr>
<tr><td>Basic Salary</td><td>$${p.basicSalary.toLocaleString()}</td></tr>
<tr><td>Allowances</td><td>+$${p.allowances.toLocaleString()}</td></tr>
<tr><td>Deductions</td><td>-$${p.deductions.toLocaleString()}</td></tr>
<tr><td>Tax (PAYE)</td><td>-$${p.tax.toLocaleString()}</td></tr>
<tr><td><strong>Net Pay</strong></td><td class="net">$${p.netPay.toLocaleString()}</td></tr></table>
<p style="margin-top:20px;color:#64748b;font-size:12px">Status: ${p.status}${p.paymentDate ? " · Paid: " + new Date(p.paymentDate).toLocaleDateString() : ""}</p>
</body></html>`;
}

export default function PayslipsPage() {
  const pathname = usePathname();
  const [emp,         setEmp]         = useState<Employee | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("Company");

  useEffect(() => {
    const parts = pathname.split("/").filter(Boolean);
    const slug = parts.length >= 2 && parts[1] === "employee" ? parts[0] : "";
    if (!slug) return;
    fetch(`/api/company/info?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => { if (d.company?.name) setCompanyName(d.company.name); })
      .catch(() => {});
  }, [pathname]);

  const downloadPayslip = (p: Payroll) => {
    if (!emp) return;
    const html = generatePayslipHTML(p, emp, companyName);
    const blob = new Blob([html], { type: "text/html" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `payslip-${emp.employeeId}-${p.period}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  useEffect(() => {
    fetch("/api/portal/employee/me").then(r => r.json()).then(d => { setEmp(d.employee); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 340].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const payrolls = emp?.payrolls ?? [];
  const ytdGross = payrolls.reduce((s, p) => s + p.basicSalary + p.allowances, 0);
  const ytdTax   = payrolls.reduce((s, p) => s + p.tax, 0);
  const ytdNet   = payrolls.reduce((s, p) => s + p.netPay, 0);
  const ytdDed   = payrolls.reduce((s, p) => s + p.deductions, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Pay Slips</h1>
      </div>

      {/* YTD summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
        {[
          { label: "YTD Gross",      value: ytdGross, icon: TrendingUp  },
          { label: "YTD Tax",        value: ytdTax,   icon: TrendingDown },
          { label: "YTD Deductions", value: ytdDed,   icon: TrendingDown },
          { label: "YTD Net Pay",    value: ytdNet,   icon: DollarSign  },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "18px 20px", display: "flex", gap: 14, alignItems: "flex-start" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={17} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>${s.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Payslip cards */}
      {payrolls.length === 0 ? (
        <div style={{ ...cardBase, padding: "48px 0", textAlign: "center" }}>
          <Wallet size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No payslips available yet</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {payrolls.map(p => {
            const sc  = STATUS_CONFIG[p.status] ?? STATUS_CONFIG.Pending;
            const sel = selected === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelected(sel ? null : p.id)}
                style={{ ...cardBase, padding: "20px", cursor: "pointer", border: sel ? `1.5px solid var(--accent)` : "0.5px solid var(--border)", boxShadow: sel ? "var(--shadow-card)" : "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 3px" }}>{p.period}</p>
                    {p.paymentDate && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Paid: {p.paymentDate}</p>}
                  </div>
                  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: sc.bg, color: sc.color }}>{p.status}</span>
                </div>
                <div style={{ borderTop: "0.5px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { label: "Basic Salary",  value: `$${p.basicSalary.toLocaleString()}` },
                    { label: "Allowances",    value: `+$${p.allowances.toLocaleString()}`  },
                    { label: "Deductions",    value: `-$${p.deductions.toLocaleString()}`  },
                    { label: "Tax",           value: `-$${p.tax.toLocaleString()}`         },
                  ].map(row => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{row.label}</span>
                      <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, borderTop: "0.5px solid var(--border)", marginTop: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>Net Pay</span>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>${p.netPay.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); downloadPayslip(p); }}
                    style={{ marginTop: 14, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 0", borderRadius: 8, background: "var(--accent-light)", color: "var(--accent)", border: "0.5px solid var(--border)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    <Download size={13} /> Download Payslip
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
