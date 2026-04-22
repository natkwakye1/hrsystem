"use client";

import { useEffect, useState } from "react";
import { FileText, Users, TrendingUp, DollarSign } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const PIE_COLORS = [BLUE[600], BLUE[400], BLUE[300], BLUE[200], BLUE[700]];

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

interface DeptStat       { department: string; count: number; avgSalary: number; totalSalary: number; }
interface EmploymentStat { type: string; count: number; }
interface LeaveStat      { leaveType: string; total: number; approved: number; pending: number; rejected: number; }
interface ReportsData {
  totalEmployees: number; totalPayroll: number; avgSalary: number;
  departmentStats: DeptStat[];
  employmentTypeStats: EmploymentStat[];
  leaveStats: LeaveStat[];
}

export default function FinanceReportsPage() {
  const [data,    setData]    = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 200, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  if (!data) return <p style={{ color: "var(--text-muted)" }}>Could not load report data.</p>;

  const tooltipStyle: React.CSSProperties = {
    background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 8, fontSize: 12,
    color: "var(--text-primary)",
  };
  const tickStyle = { fill: "var(--text-muted)" as string, fontSize: 11 };

  const salaryByDept = (data.departmentStats ?? []).map(d => ({
    name: d.department, avgSalary: Math.round(d.avgSalary),
  }));

  const empTypeData = (data.employmentTypeStats ?? []).map(e => ({
    name: e.type, value: e.count,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Reports</h1>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Employees", value: data.totalEmployees,                icon: Users,       fmt: (v: number) => String(v)                            },
          { label: "Total Payroll",   value: data.totalPayroll,                  icon: DollarSign,  fmt: (v: number) => `$${v.toLocaleString()}`             },
          { label: "Average Salary",  value: data.avgSalary,                     icon: TrendingUp,  fmt: (v: number) => `$${Math.round(v).toLocaleString()}` },
          { label: "Departments",     value: data.departmentStats?.length ?? 0,  icon: FileText,    fmt: (v: number) => String(v)                            },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "16px 18px", display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <s.icon size={16} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>{s.label}</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.fmt(s.value)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
        {/* Avg salary by dept */}
        <div style={{ ...cardBase, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Average Salary by Department</h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 20px" }}>Mean salary per department</p>
          {salaryByDept.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={salaryByDept} layout="vertical" margin={{ top: 0, right: 10, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `$${Number(v)/1000}K`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} width={60} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Avg Salary"]} />
                <Bar dataKey="avgSalary" name="Avg Salary" fill={BLUE[600]} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No data available.</p>
            </div>
          )}
        </div>

        {/* Employment type */}
        <div style={{ ...cardBase, padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Employment Type Distribution</h3>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 20px" }}>Breakdown by contract type</p>
          {empTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={empTypeData} dataKey="value" cx="50%" cy="50%" outerRadius={80} innerRadius={45}>
                  {empTypeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Leave summary */}
      {(data.leaveStats?.length ?? 0) > 0 && (
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Leave Request Summary</h3>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, padding: 20 }}>
            {data.leaveStats.map(l => (
              <div key={l.leaveType} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--bg-body)", border: "0.5px solid var(--border)" }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>{l.leaveType}</p>
                <div style={{ display: "flex", gap: 12 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px" }}>Total</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{l.total}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px" }}>Approved</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "var(--accent)", margin: 0 }}>{l.approved}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: "var(--text-muted)", margin: "0 0 2px" }}>Pending</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: BLUE[400], margin: 0 }}>{l.pending}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
