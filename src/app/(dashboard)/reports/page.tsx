"use client";

import { useEffect, useState } from "react";
import { Users, DollarSign, Briefcase, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const PIE_COLORS = [BLUE[600], BLUE[500], BLUE[400], BLUE[300], BLUE[200], BLUE[700]];

const LEAVE_COLORS: Record<string, string> = {
  Approved: BLUE[700],
  Pending:  BLUE[500],
  Rejected: BLUE[300],
};

interface ReportData {
  totalEmployees: number;
  activeEmployees: number;
  totalPayroll: number;
  avgSalary: number;
  openPositions: number;
  departmentStats: Array<{ department: string; count: number; avgSalary: number }>;
  leaveStats: Array<{ leaveType: string; total: number; approved: number; pending: number; rejected: number }>;
  genderBreakdown: Array<{ gender: string; count: number }>;
  employmentTypeStats: Array<{ type: string; count: number }>;
}

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 14,
  border: "0.5px solid var(--border)",
  padding: 20,
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
  fill: "var(--text-secondary)" as string,
  fontFamily: "'DM Sans', sans-serif",
};

function KpiCard({
  icon: Icon, label, value, accentBg, accentColor, badge,
}: {
  icon: React.ElementType; label: string; value: string | number;
  accentBg: string; accentColor: string; badge?: string;
}) {
  return (
    <div style={{ ...cardBase, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ width: 34, height: 34, borderRadius: 8, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={15} color={accentColor} strokeWidth={2} />
        </div>
        {badge && (
          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 4, background: BLUE[100], color: BLUE[700] }}>
            {badge}
          </span>
        )}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>
      {children}
    </p>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 18px", letterSpacing: -0.2 }}>
      {children}
    </h3>
  );
}

export default function ReportsPage() {
  const [data,    setData]    = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[1, 2, 3, 4].map(i => <div key={i} style={{ height: 110, borderRadius: 14, background: "rgba(0,0,0,0.06)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 320, borderRadius: 14, background: "rgba(0,0,0,0.06)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[1, 2, 3].map(i => <div key={i} style={{ height: 260, borderRadius: 14, background: "rgba(0,0,0,0.06)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .reports-page * { font-family: 'DM Sans', sans-serif !important; }
        .reports-page {
          --bg-card: #ffffff; --bg-hover: #f8fafc;
          --border: rgba(0,0,0,0.08);
          --text-primary: #0f172a; --text-secondary: #64748b; --text-muted: #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .reports-page {
            --bg-card: #0f172a; --bg-hover: #1e293b;
            --border: rgba(255,255,255,0.08);
            --text-primary: #f1f5f9; --text-secondary: #94a3b8; --text-muted: #475569;
          }
        }
      `}</style>

      <div className="reports-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Header */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
            Insights
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Reports & Analytics
          </h1>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard icon={Users}      label="Total Employees" value={data.totalEmployees}                           accentBg={BLUE[50]}  accentColor={BLUE[600]} badge="+8.5%" />
          <KpiCard icon={DollarSign} label="Monthly Payroll" value={`$${(data.totalPayroll / 1000).toFixed(1)}K`} accentBg={BLUE[100]} accentColor={BLUE[700]} />
          <KpiCard icon={TrendingUp} label="Avg. Salary"     value={`$${(data.avgSalary / 1000).toFixed(0)}K`}   accentBg={BLUE[50]}  accentColor={BLUE[500]} />
          <KpiCard icon={Briefcase}  label="Open Positions"  value={data.openPositions}                          accentBg={BLUE[200]} accentColor={BLUE[900]} />
        </div>

        {/* Row 1: Dept Headcount + Avg Salary */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: 16 }}>

          {/* Dept Headcount — horizontal bar */}
          <div style={cardBase}>
            <SectionLabel>Workforce</SectionLabel>
            <CardTitle>Department headcount</CardTitle>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.departmentStats} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={tickStyle} />
                <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={tickStyle} width={100} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill={BLUE[600]} radius={[0, 7, 7, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Avg Salary by dept — vertical bar */}
          <div style={cardBase}>
            <SectionLabel>Compensation</SectionLabel>
            <CardTitle>Average salary by department</CardTitle>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.departmentStats} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="department" axisLine={false} tickLine={false} tick={tickStyle} angle={-35} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `$${v / 1000}K`} />
                <Tooltip contentStyle={tooltipStyle} formatter={value => [`$${Number(value).toLocaleString()}`, "Avg Salary"]} />
                <defs>
                  <linearGradient id="salaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={BLUE[400]} />
                    <stop offset="100%" stopColor={BLUE[600]} />
                  </linearGradient>
                </defs>
                <Bar dataKey="avgSalary" fill={`url(#salaryGrad)`} radius={[7, 7, 0, 0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Three donuts */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>

          {/* Gender */}
          <div style={cardBase}>
            <SectionLabel>Diversity</SectionLabel>
            <CardTitle>Gender distribution</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.genderBreakdown} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={4} dataKey="count" nameKey="gender">
                  {data.genderBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={value => (
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{value}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Leave by status — derived from leaveStats */}
          <div style={cardBase}>
            <SectionLabel>Approvals</SectionLabel>
            <CardTitle>Leave requests by status</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={[
                    { status: "Approved", count: data.leaveStats.reduce((s, l) => s + l.approved, 0) },
                    { status: "Pending",  count: data.leaveStats.reduce((s, l) => s + l.pending,  0) },
                    { status: "Rejected", count: data.leaveStats.reduce((s, l) => s + l.rejected, 0) },
                  ].filter(d => d.count > 0)}
                  cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={4} dataKey="count" nameKey="status"
                >
                  {["Approved","Pending","Rejected"].map((s, i) => (
                    <Cell key={i} fill={LEAVE_COLORS[s] || PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={value => (
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{value}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Employment types */}
          <div style={cardBase}>
            <SectionLabel>Contracts</SectionLabel>
            <CardTitle>Employment types</CardTitle>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={data.employmentTypeStats} cx="50%" cy="50%" innerRadius={46} outerRadius={68} paddingAngle={4} dataKey="count" nameKey="type">
                  {data.employmentTypeStats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} formatter={value => (
                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{value}</span>
                )} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </>
  );
}