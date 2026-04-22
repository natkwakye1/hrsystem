"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Wallet, Users, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ─────────────────────────────────────────
   Palette — blue only, matching admin
───────────────────────────────────────── */
const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const PIE_COLORS = [BLUE[600], BLUE[500], BLUE[400], BLUE[300], BLUE[200]];

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface PayrollRecord {
  id: string; status: string; period: string;
  basicSalary: number; allowances: number;
  deductions: number; tax: number; netPay: number;
  paymentMethod?: string;
  employee: { firstName: string; lastName: string; employeeId: string; department: string; };
}
interface Summary {
  totalBasic: number; totalAllowances: number;
  totalDeductions: number; totalTax: number; totalNet: number;
}

/* ─────────────────────────────────────────
   Shared style helpers
───────────────────────────────────────── */
const cardBase: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 14,
  padding: 20,
  border: "0.5px solid var(--border)",
};

const tooltipStyle: React.CSSProperties = {
  background: "var(--bg-card)",
  border: "0.5px solid var(--border)",
  borderRadius: 8,
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  color: "var(--text-primary)",
};

const tickStyle = {
  fontSize: 10,
  fill: "var(--text-secondary)",
  fontFamily: "'DM Sans', sans-serif",
};

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontSize: 10, fontWeight: 600, letterSpacing: "0.07em",
      textTransform: "uppercase", color: "var(--text-muted)", margin: "0 0 3px",
    }}>
      {children}
    </p>
  );
}

function CardTitle({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{
      fontSize: 14, fontWeight: 600, color: "var(--text-primary)",
      margin: "0 0 16px", letterSpacing: -0.2, ...style,
    }}>
      {children}
    </h3>
  );
}

function KpiCard({ icon: Icon, label, value, trend, accentColor }: {
  icon: React.ElementType; label: string; value: number | string;
  trend: { value: number; up: boolean }; accentColor: string;
}) {
  return (
    <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={16} color={accentColor} strokeWidth={2} />
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
          background: trend.up ? BLUE[100] : BLUE[50],
          color: trend.up ? BLUE[700] : BLUE[500],
        }}>
          {trend.up ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trend.up ? "+" : "-"}{trend.value}%
        </span>
      </div>
      <div>
        <SectionLabel>{label}</SectionLabel>
        <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1, color: "var(--text-primary)" }}>
          {value}
        </p>
      </div>
    </div>
  );
}

function SkeletonLoader() {
  const pulse: React.CSSProperties = {
    background: "var(--border)", borderRadius: 14,
    animation: "pulse 1.4s ease-in-out infinite",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ ...pulse, height: 110 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr", gap: 16 }}>
        {[1,2,3].map(i => <div key={i} style={{ ...pulse, height: 300 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
        {[1,2].map(i => <div key={i} style={{ ...pulse, height: 240 }} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function FinanceOverview() {
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>([]);
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/payroll")
      .then(r => r.json())
      .then(d => { setPayrolls(d.payrolls ?? []); setSummary(d.summary ?? null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── derived data ── */
  const periodTrend = useMemo(() => {
    const map = new Map<string, number>();
    payrolls.forEach(p => map.set(p.period, (map.get(p.period) ?? 0) + p.netPay));
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, value]) => ({ period, value }));
  }, [payrolls]);

  const deptData = useMemo(() => {
    const map = new Map<string, number>();
    payrolls.forEach(p => {
      const d = p.employee?.department || "Unknown";
      map.set(d, (map.get(d) ?? 0) + p.netPay);
    });
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a).slice(0, 6)
      .map(([dept, value]) => ({ dept: dept.length > 12 ? dept.slice(0, 12) + "…" : dept, value }));
  }, [payrolls]);

  const componentData = useMemo(() => [
    { name: "Basic Salary",  value: summary?.totalBasic      ?? 0 },
    { name: "Allowances",    value: summary?.totalAllowances ?? 0 },
    { name: "Tax Withheld",  value: summary?.totalTax        ?? 0 },
    { name: "Deductions",    value: summary?.totalDeductions ?? 0 },
  ].filter(d => d.value > 0), [summary]);

  const paid       = payrolls.filter(p => p.status === "Processed" || p.status === "Paid").length;
  const pending    = payrolls.filter(p => p.status === "Pending").length;
  const processing = payrolls.filter(p => p.status === "Processing").length;
  const gross      = (summary?.totalBasic ?? 0) + (summary?.totalAllowances ?? 0);
  const fmt        = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .fin-root, .fin-root * { font-family: 'DM Sans', sans-serif !important; }

        .grid-r4   { display: grid; grid-template-columns: repeat(4, 1fr);  gap: 16px; }
        .grid-r322 { display: grid; grid-template-columns: 3fr 2fr 2fr;     gap: 16px; }
        .grid-r21  { display: grid; grid-template-columns: 2fr 1fr;         gap: 16px; }

        @media (max-width: 1100px) {
          .grid-r4   { grid-template-columns: repeat(2, 1fr); }
          .grid-r322 { grid-template-columns: 1fr 1fr; }
          .grid-r21  { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .grid-r4, .grid-r322, .grid-r21 { grid-template-columns: 1fr; }
        }

        .tag { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 4px; white-space: nowrap; display: inline-block; }
        .tag-blue { background: ${BLUE[100]}; color: ${BLUE[700]}; }
        .tag-mid  { background: ${BLUE[200]}; color: ${BLUE[900]}; }
        .tag-lo   { background: ${BLUE[50]};  color: ${BLUE[600]}; }

        .bar-wrap { flex:1; height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
        .bar-fill { height:100%; border-radius:2px; }
      `}</style>

      <div className="fin-root" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {loading ? <SkeletonLoader /> : (
          <>
            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <SectionLabel>Finance Portal</SectionLabel>
                <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: -0.5, color: "var(--text-primary)" }}>Overview</h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{payrolls.length} records</span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE[600] }} />
                <span style={{ fontSize: 12, color: BLUE[600], fontWeight: 500 }}>Live</span>
              </div>
            </div>

            {/* ── KPI Row ── */}
            <div className="grid-r4">
              <KpiCard icon={Wallet}       label="Total Net Payroll" value={fmt(summary?.totalNet ?? 0)}  trend={{ value: 3.2, up: true  }} accentColor={BLUE[600]} />
              <KpiCard icon={TrendingUp}   label="Total Gross"       value={fmt(gross)}                   trend={{ value: 1.8, up: true  }} accentColor={BLUE[500]} />
              <KpiCard icon={TrendingDown} label="Tax Withheld"      value={fmt(summary?.totalTax ?? 0)}  trend={{ value: 0.4, up: false }} accentColor={BLUE[400]} />
              <KpiCard icon={Users}        label="Payroll Records"   value={payrolls.length}              trend={{ value: 2,   up: true  }} accentColor={BLUE[700]} />
            </div>

            {/* ── Row 2: Period trend · Donut · Status ── */}
            <div className="grid-r322">

              {/* Period area chart */}
              <div style={cardBase}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <SectionLabel>Net Pay by Period</SectionLabel>
                  <span className="tag tag-blue">+{periodTrend.length} runs</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, color: "var(--text-primary)" }}>
                    {fmt(summary?.totalNet ?? 0)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>total disbursed</span>
                </div>
                <CardTitle style={{ margin: "0 0 14px" }}>Payroll trend</CardTitle>
                {periodTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={periodTrend}>
                      <defs>
                        <linearGradient id="finGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor={BLUE[600]} stopOpacity={0.14} />
                          <stop offset="95%" stopColor={BLUE[600]} stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={tickStyle} />
                      <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `$${Number(v) / 1000}K`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${Number(v).toLocaleString()}`, "Net Pay"]} />
                      <Area type="monotone" dataKey="value" stroke={BLUE[600]} strokeWidth={2} fill="url(#finGrad)" dot={false} activeDot={{ r: 4, fill: BLUE[600], stroke: "#fff", strokeWidth: 2 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No payroll data yet</p>
                  </div>
                )}
              </div>

              {/* Donut — payroll components */}
              <div style={cardBase}>
                <SectionLabel>Composition</SectionLabel>
                <CardTitle>Payroll breakdown</CardTitle>

                <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie
                        data={componentData.length ? componentData : [{ name: "N/A", value: 1 }]}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={60}
                        paddingAngle={3} dataKey="value"
                        startAngle={90} endAngle={-270}
                      >
                        {(componentData.length ? componentData : [{ name: "N/A", value: 1 }]).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${Number(v).toLocaleString()}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                    <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.5, color: "var(--text-primary)" }}>
                      {fmt(summary?.totalNet ?? 0)}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>net</div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {componentData.map((item, i) => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0, display: "inline-block" }} />
                        <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                      </span>
                      <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>${item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status summary */}
              <div style={{ ...cardBase, display: "flex", flexDirection: "column" }}>
                <SectionLabel>This Month</SectionLabel>
                <CardTitle>Payroll status</CardTitle>

                <div style={{ background: "var(--bg-hover)", borderRadius: 10, padding: 14, marginBottom: 16, textAlign: "center" }}>
                  <p style={{ fontSize: 36, fontWeight: 600, letterSpacing: -1.5, margin: "0 0 2px", color: "var(--text-primary)" }}>{paid}</p>
                  <p style={{ fontSize: 11, color: BLUE[600], fontWeight: 500, margin: 0 }}>records processed</p>
                </div>

                {[
                  { label: "Processed", value: paid,       tag: "tag-blue" },
                  { label: "Pending",   value: pending,    tag: "tag-lo"   },
                  { label: "Processing", value: processing, tag: "tag-mid"  },
                ].map((r, idx, arr) => (
                  <div key={r.label} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: idx === 0 ? "0 0 8px" : "8px 0",
                    borderBottom: idx < arr.length - 1 ? "0.5px solid var(--border)" : "none",
                  }}>
                    <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.label}</span>
                    <span className={`tag ${r.tag}`}>{r.value}</span>
                  </div>
                ))}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Total periods</span>
                  <span className="tag tag-blue">{new Set(payrolls.map(p => p.period)).size}</span>
                </div>
              </div>
            </div>

            {/* ── Row 3: Dept bar · Progress breakdown ── */}
            <div className="grid-r21">

              {/* Department bar chart */}
              <div style={cardBase}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <SectionLabel>Spend</SectionLabel>
                  <span className="tag tag-mid">{deptData.length} departments</span>
                </div>
                <CardTitle>Net pay by department</CardTitle>
                {deptData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={deptData} barCategoryGap="30%">
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                      <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={tickStyle} />
                      <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `$${Number(v) / 1000}K`} />
                      <Tooltip contentStyle={tooltipStyle} formatter={v => [`$${Number(v).toLocaleString()}`, "Net Pay"]} />
                      <Bar dataKey="value" fill={BLUE[600]} radius={[6, 6, 0, 0]} barSize={22} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No department data yet</p>
                  </div>
                )}
              </div>

              {/* Payroll component breakdown progress bars */}
              <div style={cardBase}>
                <SectionLabel>Allocation</SectionLabel>
                <CardTitle>Cost breakdown</CardTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {componentData.length > 0 ? (() => {
                    const total = componentData.reduce((s, d) => s + d.value, 0) || 1;
                    const colors = [BLUE[700], BLUE[600], BLUE[400], BLUE[300]];
                    return componentData.map((item, i) => (
                      <div key={item.name}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}>
                          <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{Math.round((item.value / total) * 100)}%</span>
                        </div>
                        <div className="bar-wrap">
                          <div className="bar-fill" style={{ width: `${(item.value / total) * 100}%`, background: colors[i] }} />
                        </div>
                      </div>
                    ));
                  })() : (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No data available</p>
                  )}

                  {componentData.length > 0 && (
                    <div style={{ marginTop: 4, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                        <span style={{ color: "var(--text-secondary)" }}>Avg. net per employee</span>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                          {payrolls.length ? fmt(Math.round((summary?.totalNet ?? 0) / payrolls.length)) : "—"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
