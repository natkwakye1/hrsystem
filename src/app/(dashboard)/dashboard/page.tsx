"use client";

import { useEffect, useState } from "react";
import {
  Users, UserPlus, CalendarDays, Briefcase,
  ArrowUpRight, ArrowDownRight, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ─────────────────────────────────────────
   Palette
───────────────────────────────────────── */
const BLUE = {
  900: "#1e3a8a",
  700: "#1d4ed8",
  600: "#2563eb",
  500: "#3b82f6",
  400: "#60a5fa",
  300: "#93c5fd",
  200: "#bfdbfe",
  100: "#dbeafe",
  50:  "#eff6ff",
};

const PIE_COLORS = [
  BLUE[600], BLUE[500], BLUE[400], BLUE[300], BLUE[200],
];

/* ─────────────────────────────────────────
   Avatar pool
───────────────────────────────────────── */
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

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface DashboardData {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  totalPayroll: number;
  pendingLeaves: number;
  openPositions: number;
  recentEmployees: Array<{
    id: string; firstName: string; lastName: string;
    position: string; department: string; status: string; hireDate: string;
  }>;
  departmentCounts: Array<{ name: string; count: number }>;
  recentLeaves: Array<{
    id: string; employeeName: string; leaveType: string; days: number; status: string;
  }>;
}

/* ─────────────────────────────────────────
   Static chart data
───────────────────────────────────────── */
const payrollTrend = [
  { month: "Sep", value: 28000 },
  { month: "Oct", value: 32000 },
  { month: "Nov", value: 29000 },
  { month: "Dec", value: 35000 },
  { month: "Jan", value: 38000 },
  { month: "Feb", value: 42000 },
  { month: "Mar", value: 45000 },
];

const weeklyHours = [
  { day: "Mon", hours: 42 },
  { day: "Tue", hours: 38 },
  { day: "Wed", hours: 45 },
  { day: "Thu", hours: 40 },
  { day: "Fri", hours: 36 },
];

const headcountTrend = [
  { month: "Sep", actual: 218, target: 220 },
  { month: "Oct", actual: 224, target: 226 },
  { month: "Nov", actual: 228, target: 230 },
  { month: "Dec", actual: 232, target: 235 },
  { month: "Jan", actual: 236, target: 240 },
  { month: "Feb", actual: 242, target: 245 },
  { month: "Mar", actual: 248, target: 250 },
];

const attendanceRates = [
  { dept: "Engineering", rate: 94 },
  { dept: "Sales",       rate: 87 },
  { dept: "Design",      rate: 96 },
  { dept: "Operations",  rate: 81 },
  { dept: "Other",       rate: 78 },
];

/* ─────────────────────────────────────────
   Leave status tag config
───────────────────────────────────────── */
const LEAVE_STATUS: Record<string, { bg: string; color: string }> = {
  Approved: { bg: BLUE[100], color: BLUE[700] },
  Pending:  { bg: BLUE[50],  color: BLUE[500] },
  Rejected: { bg: BLUE[200], color: BLUE[900] },
  Declined: { bg: BLUE[200], color: BLUE[900] },
};

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

interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  trend: { value: number; up: boolean };
  accentColor: string;
}

function KpiCard({ icon: Icon, label, value, trend, accentColor }: KpiCardProps) {
  return (
    <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon size={16} color={accentColor} strokeWidth={2} />
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3,
          fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4,
          background: trend.up ? BLUE[100] : BLUE[50],
          color: trend.up ? BLUE[700] : BLUE[500],
        }}>
          {trend.up
            ? <ArrowUpRight size={10} />
            : <ArrowDownRight size={10} />}
          {trend.up ? "+" : "-"}{trend.value}
        </span>
      </div>
      <div>
        <SectionLabel>{label}</SectionLabel>
        <p style={{ fontSize: 28, fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1 }}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface RowItemProps {
  children: React.ReactNode;
  first?: boolean;
}

function RowItem({ children, first }: RowItemProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: first ? "0 0 8px" : "8px 0",
      borderBottom: "0.5px solid var(--border)",
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────
   Skeleton
───────────────────────────────────────── */
function SkeletonLoader() {
  const pulse: React.CSSProperties = {
    background: "var(--border)",
    borderRadius: 14,
    animation: "pulse 1.4s ease-in-out infinite",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[1, 2, 3, 4].map(i => <div key={i} style={{ ...pulse, height: 110 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr 2fr", gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ ...pulse, height: 320 }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 2fr 1.4fr", gap: 16 }}>
        {[1, 2, 3].map(i => <div key={i} style={{ ...pulse, height: 280 }} />)}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function DashboardPage() {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}`;

  const pieData     = data?.departmentCounts?.slice(0, 5) || [];
  const topEmployee = data?.recentEmployees?.[0];

  return (
    <>
      {/* ── Font import ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');
        .db-root, .db-root * { font-family: 'DM Sans', sans-serif !important; }

        /* CSS custom properties — override in your global CSS / theme */
        .db-root {
          --bg-card:        #ffffff;
          --bg-hover:       #f8fafc;
          --border:         rgba(0,0,0,0.07);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }

        @media (prefers-color-scheme: dark) {
          .db-root {
            --bg-card:        #0f172a;
            --bg-hover:       #1e293b;
            --border:         rgba(255,255,255,0.08);
            --text-primary:   #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted:     #475569;
          }
        }

        /* Responsive grid helpers */
        .grid-r4   { display: grid; grid-template-columns: repeat(4, 1fr);    gap: 16px; }
        .grid-r322 { display: grid; grid-template-columns: 3fr 2fr 2fr;       gap: 16px; }
        .grid-r221 { display: grid; grid-template-columns: 2fr 2fr 1.4fr;     gap: 16px; }
        .grid-r21  { display: grid; grid-template-columns: 2fr 1fr;           gap: 16px; }

        @media (max-width: 1100px) {
          .grid-r4   { grid-template-columns: repeat(2, 1fr); }
          .grid-r322 { grid-template-columns: 1fr 1fr; }
          .grid-r221 { grid-template-columns: 1fr 1fr; }
          .grid-r21  { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .grid-r4, .grid-r322, .grid-r221, .grid-r21 { grid-template-columns: 1fr; }
        }

        .tag {
          font-size: 10px; font-weight: 600; padding: 2px 8px;
          border-radius: 4px; white-space: nowrap; display: inline-block;
        }
        .tag-blue { background: ${BLUE[100]}; color: ${BLUE[700]}; }
        .tag-mid  { background: ${BLUE[200]}; color: ${BLUE[900]}; }
        .tag-lo   { background: ${BLUE[50]};  color: ${BLUE[600]}; }

        .row-item-last { border-bottom: none !important; padding-bottom: 0 !important; }

        .bar-wrap { flex:1; height:4px; background:var(--border); border-radius:2px; overflow:hidden; }
        .bar-fill { height:100%; border-radius:2px; }
      `}</style>

      <div className="db-root animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {loading ? <SkeletonLoader /> : (
          <>
            {/* ── Header ── */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <SectionLabel>Workforce Intelligence</SectionLabel>
                <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: -0.5, color: "var(--text-primary)" }}>
                  Dashboard
                </h1>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>March 2026</span>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: BLUE[600] }} />
                <span style={{ fontSize: 12, color: BLUE[600], fontWeight: 500 }}>Live</span>
              </div>
            </div>

            {/* ── KPI Row ── */}
            <div className="grid-r4">
              <KpiCard icon={Users}        label="Total Employees" value={data?.totalEmployees ?? 0}          trend={{ value: 5,  up: true  }} accentColor={BLUE[600]} />
              <KpiCard icon={UserPlus}     label="New Hires"       value={data?.recentEmployees?.length ?? 0} trend={{ value: 2,  up: true  }} accentColor={BLUE[500]} />
              <KpiCard icon={CalendarDays} label="Pending Leaves"  value={data?.pendingLeaves ?? 0}           trend={{ value: 3,  up: false }} accentColor={BLUE[400]} />
              <KpiCard icon={Briefcase}    label="Open Positions"  value={data?.openPositions ?? 0}           trend={{ value: 12, up: true  }} accentColor={BLUE[700]} />
            </div>

            {/* ── Row 2: Payroll · Donut · Top Performer ── */}
            <div className="grid-r322">

              {/* Payroll area chart */}
              <div style={cardBase}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <SectionLabel>Monthly Summary</SectionLabel>
                  <span className="tag tag-blue">+2.45% MoM</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 18 }}>
                  <span style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, color: "var(--text-primary)" }}>
                    {fmt(data?.totalPayroll ?? 0)}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>This month</span>
                </div>
                <CardTitle style={{ margin: "0 0 14px" }}>Payroll overview</CardTitle>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={payrollTrend}>
                    <defs>
                      <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={BLUE[600]} stopOpacity={0.14} />
                        <stop offset="95%" stopColor={BLUE[600]} stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickStyle} />
                    <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `$${v / 1000}K`} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`$${Number(value).toLocaleString()}`, "Payroll"]}
                    />
                    <Area
                      type="monotone" dataKey="value"
                      stroke={BLUE[600]} strokeWidth={2}
                      fill="url(#payGrad)" dot={false}
                      activeDot={{ r: 4, fill: BLUE[600], stroke: "#fff", strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Donut — dept distribution */}
              <div style={cardBase}>
                <SectionLabel>Departments</SectionLabel>
                <CardTitle>Headcount split</CardTitle>

                {/* Donut with centered label */}
                <div style={{ position: "relative", display: "flex", justifyContent: "center", marginBottom: 14 }}>
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie
                        data={pieData.length ? pieData : [{ name: "N/A", count: 1 }]}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={60}
                        paddingAngle={3} dataKey="count"
                        startAngle={90} endAngle={-270}
                      >
                        {(pieData.length ? pieData : [{ name: "N/A", count: 1 }]).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%, -50%)", textAlign: "center", pointerEvents: "none",
                  }}>
                    <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.5, color: "var(--text-primary)" }}>
                      {data?.totalEmployees ?? 0}
                    </div>
                    <div style={{ fontSize: 9, color: "var(--text-muted)" }}>total</div>
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {pieData.map((item, i) => (
                    <div key={item.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 11 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0, display: "inline-block" }} />
                        <span style={{ color: "var(--text-secondary)" }}>{item.name}</span>
                      </span>
                      <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Performer */}
              <div style={{ ...cardBase, display: "flex", flexDirection: "column" }}>
                <SectionLabel>This Month</SectionLabel>
                <CardTitle>Top performer</CardTitle>

                {topEmployee ? (
                  <>
                    <div style={{
                      background: "var(--bg-hover)", borderRadius: 10,
                      padding: 14, marginBottom: 16, textAlign: "center",
                    }}>
                      <img
                        src={getAvatar(topEmployee.firstName, topEmployee.lastName)}
                        alt={`${topEmployee.firstName} ${topEmployee.lastName}`}
                        style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: `2px solid var(--border)`, display: "block", margin: "0 auto 10px" }}
                      />
                      <p style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--text-primary)" }}>
                        {topEmployee.firstName} {topEmployee.lastName}
                      </p>
                      <p style={{ fontSize: 11, color: BLUE[600], margin: "3px 0 0", fontWeight: 500 }}>
                        {topEmployee.position}
                      </p>
                    </div>

                    {[
                      { label: "Department", val: topEmployee.department || "N/A" },
                      { label: "Hire Date",  val: topEmployee.hireDate   || "N/A" },
                    ].map((r, idx, arr) => (
                      <div key={r.label} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: idx < arr.length - 1 ? "0.5px solid var(--border)" : "none",
                      }}>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{r.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: "var(--text-primary)" }}>{r.val}</span>
                      </div>
                    ))}

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 8 }}>
                      <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Status</span>
                      <span className="tag tag-blue">{topEmployee.status}</span>
                    </div>
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>No employee data</p>
                )}
              </div>
            </div>

            {/* ── Row 3: Weekly Hours · Leave Requests · Recent Hires ── */}
            <div className="grid-r221">

              {/* Weekly hours bar */}
              <div style={cardBase}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <SectionLabel>This Week</SectionLabel>
                  <span className="tag tag-mid">201 hrs total</span>
                </div>
                <CardTitle>Work hours by day</CardTitle>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={weeklyHours} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={tickStyle} />
                    <YAxis hide />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="hours" fill={BLUE[600]} radius={[6, 6, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Leave requests */}
              <div style={cardBase}>
                <SectionLabel>Approvals</SectionLabel>
                <CardTitle>Recent leave requests</CardTitle>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {(data?.recentLeaves ?? []).slice(0, 5).map((leave, idx, arr) => {
                    const s = LEAVE_STATUS[leave.status] ?? { bg: BLUE[50], color: BLUE[600] };
                    const [fn = "A", ln = "B"] = leave.employeeName.split(" ");
                    return (
                      <div
                        key={leave.id}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: idx === 0 ? "0 0 8px" : "8px 0",
                          borderBottom: idx < arr.length - 1 ? "0.5px solid var(--border)" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img
                            src={getAvatar(fn, ln)}
                            alt={leave.employeeName}
                            style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
                          />
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: "var(--text-primary)" }}>{leave.employeeName}</p>
                            <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>{leave.leaveType} · {leave.days} days</p>
                          </div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: s.bg, color: s.color, whiteSpace: "nowrap" }}>
                          {leave.status}
                        </span>
                      </div>
                    );
                  })}
                  {(!data?.recentLeaves || data.recentLeaves.length === 0) && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>No recent requests</p>
                  )}
                </div>
              </div>

              {/* Recent hires */}
              <div style={cardBase}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                  <SectionLabel>Latest</SectionLabel>
                  <TrendingUp size={13} color="var(--text-muted)" />
                </div>
                <CardTitle>Recent hires</CardTitle>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {(data?.recentEmployees ?? []).slice(0, 5).map((emp, idx, arr) => (
                    <div
                      key={emp.id}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: idx === 0 ? "0 0 8px" : "8px 0",
                        borderBottom: idx < arr.length - 1 ? "0.5px solid var(--border)" : "none",
                      }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 600, color: idx === 0 ? BLUE[600] : "var(--text-muted)", minWidth: 16 }}>
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <img
                        src={getAvatar(emp.firstName, emp.lastName)}
                        alt={`${emp.firstName} ${emp.lastName}`}
                        style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--border)", flexShrink: 0 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 500, margin: 0, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p style={{ fontSize: 10, color: "var(--text-secondary)", margin: 0 }}>{emp.position}</p>
                      </div>
                      <span className="tag tag-lo" style={{ fontSize: 9 }}>{emp.department}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Row 4: Headcount Trend · Attendance Rates ── */}
            <div className="grid-r21">

              {/* Headcount vs target dual-line */}
              <div style={cardBase}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <SectionLabel>Growth</SectionLabel>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-secondary)" }}>
                      <span style={{ width: 20, height: 2, background: BLUE[600], borderRadius: 1, display: "inline-block" }} />
                      Headcount
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, color: "var(--text-secondary)" }}>
                      <span style={{ width: 20, height: 2, background: BLUE[300], borderRadius: 1, display: "inline-block", borderTop: `2px dashed ${BLUE[300]}` }} />
                      Target
                    </span>
                  </div>
                </div>
                <CardTitle>Headcount vs. hiring target</CardTitle>
                <ResponsiveContainer width="100%" height={130}>
                  <LineChart data={headcountTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={tickStyle} />
                    <YAxis axisLine={false} tickLine={false} tick={tickStyle} domain={["auto", "auto"]} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Line type="monotone" dataKey="actual" stroke={BLUE[600]} strokeWidth={2} dot={{ r: 3, fill: BLUE[600], stroke: "#fff", strokeWidth: 1.5 }} />
                    <Line type="monotone" dataKey="target" stroke={BLUE[300]} strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Attendance rate bars */}
              <div style={cardBase}>
                <SectionLabel>Attendance</SectionLabel>
                <CardTitle>Rate by department</CardTitle>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {attendanceRates.map((item, i) => {
                    const colors = [BLUE[700], BLUE[600], BLUE[500], BLUE[400], BLUE[300]];
                    return (
                      <div key={item.dept}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                          <span style={{ color: "var(--text-secondary)" }}>{item.dept}</span>
                          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{item.rate}%</span>
                        </div>
                        <div className="bar-wrap">
                          <div className="bar-fill" style={{ width: `${item.rate}%`, background: colors[i] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}