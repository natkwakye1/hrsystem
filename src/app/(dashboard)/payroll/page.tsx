"use client";

import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Table from "@/components/Table";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&fit=crop&crop=face",
];

function getAvatar(firstName: string, lastName: string): string {
  const key = (firstName[0] + lastName[0]).toUpperCase();
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netPay: number;
  status: string;
  paymentDate: string;
  paymentMethod: string;
  employee: {
    firstName: string; lastName: string;
    employeeId: string; department: string; position: string;
  };
}

interface Summary {
  totalBasic: number;
  totalAllowances: number;
  totalDeductions: number;
  totalTax: number;
  totalNet: number;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Processed: { bg: BLUE[100], color: BLUE[700] },
  Pending:   { bg: BLUE[50],  color: BLUE[500] },
  Failed:    { bg: BLUE[200], color: BLUE[900] },
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 14,
  border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 12, outline: "none",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
};

function KpiCard({
  icon: Icon, label, value, accentBg, accentColor,
}: {
  icon: React.ElementType; label: string; value: string | number;
  accentBg: string; accentColor: string;
}) {
  return (
    <div style={{ ...cardBase, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={accentColor} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
          {label}
        </p>
        <p style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1, color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

const PAGE_SIZE = 15;

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [period,   setPeriod]   = useState("");
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (period) params.set("period", period);
    fetch(`/api/payroll?${params}`)
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls || []); setSummary(d.summary || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  // Reset to page 1 whenever filter changes
  useEffect(() => { setPage(1); }, [period]);

  const periods     = useMemo(() => [...new Set(payrolls.map(p => p.period))].sort().reverse(), [payrolls]);
  const totalPages  = Math.max(1, Math.ceil(payrolls.length / PAGE_SIZE));
  const paginated   = useMemo(() => payrolls.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [payrolls, page]);
  const startEntry  = payrolls.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry    = Math.min(page * PAGE_SIZE, payrolls.length);

  const columns = [
    {
      key: "employee",
      label: "Employee",
      render: (p: PayrollRecord) => (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src={getAvatar(p.employee.firstName, p.employee.lastName)}
            alt={`${p.employee.firstName} ${p.employee.lastName}`}
            style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, objectFit: "cover", border: "2px solid var(--border)" }}
          />
          <div>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {p.employee.firstName} {p.employee.lastName}
            </p>
            <p style={{ margin: "1px 0 0", fontSize: 10, color: "var(--text-muted)" }}>{p.employee.employeeId}</p>
          </div>
        </div>
      ),
    },
    {
      key: "department",
      label: "Department",
      render: (p: PayrollRecord) => (
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-secondary)" }}>{p.employee.department}</span>
      ),
      className: "hidden md:table-cell",
    },
    {
      key: "basicSalary",
      label: "Basic",
      render: (p: PayrollRecord) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
          ${p.basicSalary.toLocaleString()}
        </span>
      ),
      className: "hidden lg:table-cell",
    },
    {
      key: "allowances",
      label: "Allowances",
      render: (p: PayrollRecord) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: BLUE[600] }}>
          +${p.allowances.toLocaleString()}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
    {
      key: "tax",
      label: "Tax",
      render: (p: PayrollRecord) => (
        <span style={{ fontSize: 12, fontWeight: 600, color: BLUE[400] }}>
          -${p.tax.toLocaleString()}
        </span>
      ),
      className: "hidden xl:table-cell",
    },
    {
      key: "netPay",
      label: "Net Pay",
      render: (p: PayrollRecord) => (
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>
          ${p.netPay.toLocaleString()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p: PayrollRecord) => {
        const s = STATUS_CONFIG[p.status] ?? { bg: "var(--bg-hover)", color: "var(--text-muted)" };
        return (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: s.bg, color: s.color, letterSpacing: 0.2 }}>
            {p.status}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .payroll-page * { font-family: 'DM Sans', sans-serif !important; }
        .export-btn:hover { opacity: 0.85; }
        .payroll-page {
          --bg-card: #ffffff; --bg-hover: #f8fafc; --bg-input: #f8fafc;
          --border: rgba(0,0,0,0.08);
          --text-primary: #0f172a; --text-secondary: #64748b; --text-muted: #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .payroll-page {
            --bg-card: #0f172a; --bg-hover: #1e293b; --bg-input: #1e293b;
            --border: rgba(255,255,255,0.08);
            --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #475569;
          }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .skeleton { background: var(--border); animation: pulse 1.4s ease-in-out infinite; border-radius: 8px; }
      `}</style>

      <div className="payroll-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance</p>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>Payroll</h1>
          </div>
          <button
            className="export-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", transition: "opacity 0.15s" }}
          >
            <Download size={13} /> Export
          </button>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard icon={DollarSign}  label="Total Net Pay"    value={`$${((summary?.totalNet || 0) / 1000).toFixed(1)}K`}        accentBg={BLUE[50]}  accentColor={BLUE[600]} />
          <KpiCard icon={TrendingUp}  label="Total Allowances" value={`$${((summary?.totalAllowances || 0) / 1000).toFixed(1)}K`} accentBg={BLUE[100]} accentColor={BLUE[700]} />
          <KpiCard icon={TrendingDown}label="Total Tax"        value={`$${((summary?.totalTax || 0) / 1000).toFixed(1)}K`}        accentBg={BLUE[200]} accentColor={BLUE[900]} />
          <KpiCard icon={FileText}   label="Records"          value={payrolls.length}                                             accentBg={BLUE[50]}  accentColor={BLUE[500]} />
        </div>

        {/* Summary strip */}
        {summary && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12 }}>
            {[
              { label: "Basic Salary", value: summary.totalBasic,      color: "var(--text-primary)" },
              { label: "Allowances",   value: summary.totalAllowances, color: BLUE[600] },
              { label: "Deductions",   value: summary.totalDeductions, color: BLUE[400] },
              { label: "Tax",          value: summary.totalTax,        color: BLUE[300] },
              { label: "Net Pay",      value: summary.totalNet,        color: BLUE[700] },
            ].map(item => (
              <div key={item.label} style={{ ...cardBase, padding: "14px 16px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 16, fontWeight: 600, color: item.color, margin: 0, letterSpacing: -0.3 }}>
                  ${(item.value / 1000).toFixed(1)}K
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 2px" }}>Records</p>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.2 }}>Payroll Entries</h3>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <select
                value={period} onChange={e => setPeriod(e.target.value)}
                style={{ ...inp, width: "auto", padding: "6px 28px 6px 10px", fontSize: 11, cursor: "pointer", appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
              >
                <option value="">All Periods</option>
                {periods.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 5, background: BLUE[50], color: BLUE[600] }}>
                {payrolls.length} record{payrolls.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
          <Table columns={columns} data={paginated} loading={loading} emptyMessage="No payroll records found" />

          {/* Pagination footer */}
          {!loading && payrolls.length > 0 && (
            <div style={{ padding: "12px 20px", borderTop: "0.5px solid var(--border)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
                Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{payrolls.length}</strong> records
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {/* Prev */}
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                >
                  <ChevronLeft size={14} />
                </button>

                {/* Page numbers */}
                {(() => {
                  const items: (number | "...")[] = [];
                  if (totalPages <= 5) {
                    for (let i = 1; i <= totalPages; i++) items.push(i);
                  } else {
                    items.push(1);
                    if (page > 3) items.push("...");
                    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
                    if (page < totalPages - 2) items.push("...");
                    items.push(totalPages);
                  }
                  return items.map((item, i) =>
                    item === "..." ? (
                      <span key={`d${i}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>…</span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item as number)}
                        style={{ width: 32, height: 32, borderRadius: 8, border: page === item ? `0.5px solid ${BLUE[400]}` : "0.5px solid transparent", background: page === item ? BLUE[50] : "transparent", color: page === item ? BLUE[600] : "var(--text-secondary)", fontSize: 12, fontWeight: page === item ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
                      >
                        {item}
                      </button>
                    )
                  );
                })()}

                {/* Next */}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </>
  );
}