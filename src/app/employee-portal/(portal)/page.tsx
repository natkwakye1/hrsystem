"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarDays, Wallet, Heart, TrendingUp, ArrowRight, Clock } from "lucide-react";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa",
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
  const key = `${firstName}${lastName}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  Approved: { bg: BLUE[100], color: BLUE[700] },
  Pending:  { bg: BLUE[50],  color: BLUE[500] },
  Rejected: { bg: BLUE[200], color: BLUE[900] },
  Paid:     { bg: BLUE[100], color: BLUE[700] },
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};

function Badge({ status }: { status: string }) {
  const s = STATUS_COLOR[status] ?? STATUS_COLOR.Pending;
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {status}
    </span>
  );
}

interface LeaveRequest { id: string; leaveType: string; startDate: string; endDate: string; days: number; status: string; }
interface Payroll      { id: string; period: string; basicSalary: number; allowances: number; deductions: number; tax: number; netPay: number; status: string; }
interface Benefit      { id: string; status: string; benefit: { name: string; type: string; amount?: number }; }
interface Employee {
  id: string; firstName: string; lastName: string; email: string;
  position?: string; department?: string; employmentType: string;
  status: string; hireDate: string; salary: number; employeeId: string;
  leaveRequests: LeaveRequest[];
  payrolls: Payroll[];
  benefits: Benefit[];
}

export default function EmployeeDashboard() {
  const [emp,     setEmp]     = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portal/employee/me")
      .then(r => r.json())
      .then(d => { setEmp(d.employee); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ height: 140, borderRadius: 16, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 100, borderRadius: 12, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
      </div>
      <div style={{ height: 300, borderRadius: 16, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
    </div>
  );

  if (!emp) return <p style={{ color: "var(--text-muted)" }}>Could not load your data.</p>;

  const hour      = new Date().getHours();
  const greeting  = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const avatarSrc = getAvatar(emp.firstName, emp.lastName);

  const approvedLeaves = emp.leaveRequests.filter(l => l.status === "Approved");
  const pendingLeaves  = emp.leaveRequests.filter(l => l.status === "Pending").length;
  const daysUsed       = approvedLeaves.reduce((s, l) => s + l.days, 0);
  const latestPay      = emp.payrolls[0];
  const activeBenefits = emp.benefits.filter(b => b.status === "Active").length;
  const recentLeaves   = emp.leaveRequests.slice(0, 4);
  const recentPayrolls = emp.payrolls.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Welcome banner */}
      <div style={{
        borderRadius: 16, overflow: "hidden",
        background: "#2563eb",
        padding: "28px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap",
      }}>
        <div>
          <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.75)", margin: "0 0 5px" }}>{greeting}</p>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", margin: "0 0 10px", letterSpacing: -0.5 }}>
            {emp.firstName} {emp.lastName}
          </h1>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {[emp.position, emp.department, `ID: ${emp.employeeId}`].filter(Boolean).map(label => (
              <span key={label} style={{ fontSize: 11, fontWeight: 600, color: "#fff", background: "rgba(255,255,255,0.18)", border: "0.5px solid rgba(255,255,255,0.3)", padding: "3px 10px", borderRadius: 999 }}>
                {label}
              </span>
            ))}
          </div>
        </div>
        <img
          src={avatarSrc} alt={`${emp.firstName} ${emp.lastName}`}
          style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,0.4)", flexShrink: 0 }}
        />
      </div>

      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16 }}>
        {[
          { icon: CalendarDays, label: "Leave Days Used", value: String(daysUsed),   sub: `${pendingLeaves} pending`,                                        color: BLUE[600] },
          { icon: Wallet,       label: "Last Net Pay",    value: latestPay ? `$${latestPay.netPay.toLocaleString()}` : "—", sub: latestPay?.period ?? "No payslips", color: BLUE[500] },
          { icon: Heart,        label: "Active Benefits", value: String(activeBenefits), sub: "enrolled & active",                                          color: BLUE[400] },
          { icon: TrendingUp,   label: "Base Salary",     value: `$${emp.salary.toLocaleString()}`, sub: emp.employmentType,                                color: BLUE[700] },
        ].map(kpi => (
          <div key={kpi.label} style={{ ...cardBase, padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>{kpi.label}</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px", letterSpacing: -0.5 }}>{kpi.value}</p>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{kpi.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: leave + payslips */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>

        {/* Recent leave */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Leave Requests</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{emp.leaveRequests.length} total requests</p>
            </div>
            <Link href="/employee-portal/leave" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {recentLeaves.length === 0 ? (
              <div style={{ padding: "28px 0", textAlign: "center" }}>
                <CalendarDays size={28} style={{ color: "var(--border)", marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No leave requests yet</p>
              </div>
            ) : recentLeaves.map(l => (
              <div key={l.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "var(--bg-body)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CalendarDays size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{l.leaveType}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{l.startDate} · {l.days} day{l.days !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <Badge status={l.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Recent payslips */}
        <div style={{ ...cardBase, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Pay Slips</h3>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{emp.payrolls.length} total records</p>
            </div>
            <Link href="/employee-portal/payslips" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {recentPayrolls.length === 0 ? (
              <div style={{ padding: "28px 0", textAlign: "center" }}>
                <Wallet size={28} style={{ color: "var(--border)", marginBottom: 8 }} />
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No payslips yet</p>
              </div>
            ) : recentPayrolls.map(p => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: 10, background: "var(--bg-body)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Wallet size={14} style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{p.period}</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Basic: ${p.basicSalary.toLocaleString()}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "var(--accent)", margin: "0 0 2px" }}>${p.netPay.toLocaleString()}</p>
                  <Badge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Quick actions */}
      <div style={{ ...cardBase, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 16px" }}>Quick Actions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { label: "Request Leave",  href: "/employee-portal/leave",    icon: CalendarDays, desc: "Submit a new leave request"  },
            { label: "View Pay Slips", href: "/employee-portal/payslips", icon: Wallet,       desc: "Check your earnings history" },
            { label: "My Benefits",    href: "/employee-portal/benefits", icon: Heart,        desc: "View active enrollments"     },
            { label: "My Profile",     href: "/employee-portal/profile",  icon: Clock,        desc: "Manage your personal info"   },
          ].map(a => (
            <Link key={a.href} href={a.href} style={{ display: "flex", flexDirection: "column", gap: 10, padding: 16, borderRadius: 12, border: "0.5px solid var(--border)", background: "var(--accent-light)", textDecoration: "none" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <a.icon size={16} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", margin: "0 0 2px" }}>{a.label}</p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
