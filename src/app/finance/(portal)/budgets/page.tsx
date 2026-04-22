"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

interface DeptStat { department: string; count: number; avgSalary: number; totalSalary: number; }
interface ReportsData { departmentStats: DeptStat[]; totalEmployees?: number; }

export default function FinanceBudgetsPage() {
  const [stats,   setStats]   = useState<DeptStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then(r => r.json())
      .then((d: ReportsData) => { setStats(d.departmentStats ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 320, 280].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  const budgetData = stats.map(s => ({
    name:      s.department,
    budget:    Math.round((s.totalSalary > 0 ? s.totalSalary : s.avgSalary * s.count) * 1.25),
    actual:    s.totalSalary > 0 ? s.totalSalary : Math.round(s.avgSalary * s.count),
    headcount: s.count,
  }));

  const totalBudget = budgetData.reduce((s, d) => s + d.budget, 0);
  const totalActual = budgetData.reduce((s, d) => s + d.actual, 0);
  const utilization = totalBudget > 0 ? Math.round((totalActual / totalBudget) * 100) : 0;
  const variance    = totalBudget - totalActual;

  const tooltipStyle: React.CSSProperties = {
    background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 8, fontSize: 12,
    color: "var(--text-primary)",
  };
  const tickStyle = { fill: "var(--text-muted)" as string, fontSize: 11 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Finance Portal</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>Budget Management</h1>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: 14 }}>
        {[
          { label: "Total Budget",    value: `$${totalBudget.toLocaleString()}`, valueColor: "var(--text-primary)" },
          { label: "Actual Spend",    value: `$${totalActual.toLocaleString()}`, valueColor: "var(--accent)"       },
          { label: "Utilization",     value: `${utilization}%`,                  valueColor: "var(--text-primary)" },
          { label: "Budget Variance", value: `$${variance.toLocaleString()}`,    valueColor: variance >= 0 ? BLUE[700] : "var(--danger)" },
        ].map(s => (
          <div key={s.label} style={{ ...cardBase, padding: "16px 18px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{s.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: s.valueColor, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div style={{ ...cardBase, padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 4px" }}>Budget vs Actual by Department</h3>
        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "0 0 20px" }}>Allocated budget compared to actual salary spend</p>
        {budgetData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={budgetData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={tickStyle} />
              <YAxis axisLine={false} tickLine={false} tick={tickStyle} tickFormatter={v => `$${Number(v)/1000}K`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="budget" name="Budget" fill={BLUE[200]} radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" name="Actual" fill={BLUE[600]} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No department data available.</p>
          </div>
        )}
      </div>

      {/* Department breakdown table */}
      <div style={{ ...cardBase, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Department Breakdown</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--bg-body)" }}>
                {["Department", "Headcount", "Avg Salary", "Budget", "Actual Spend", "Utilization"].map(h => (
                  <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {budgetData.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No data available.</td></tr>
              ) : budgetData.map((d, i) => {
                const util = d.budget > 0 ? Math.round((d.actual / d.budget) * 100) : 0;
                return (
                  <tr key={d.name} style={{ borderTop: "0.5px solid var(--border)", background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-body)" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "var(--text-primary)" }}>{d.name}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>{d.headcount}</td>
                    <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>${Math.round(stats[i]?.avgSalary ?? 0).toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>${d.budget.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 500, color: "var(--text-primary)" }}>${d.actual.toLocaleString()}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 6, borderRadius: 3, background: BLUE[100], overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(util, 100)}%`, borderRadius: 3, background: util > 95 ? "var(--danger)" : "var(--accent)", transition: "width 0.3s" }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: util > 95 ? "var(--danger)" : "var(--accent)", minWidth: 32 }}>{util}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
