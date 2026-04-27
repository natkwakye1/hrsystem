"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, TrendingUp, LayoutDashboard, ChevronRight, ArrowLeft, Sparkles } from "lucide-react";

const portals = [
  {
    key: "admin",
    icon: LayoutDashboard,
    title: "Admin Portal",
    subtitle: "Human Resources",
    desc: "Full control of your HR system. Manage employees, payroll, recruitment, leave approvals, onboarding, and system settings.",
    gradient: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 60%, #1e3a8a 100%)",
    glow: "rgba(37,99,235,0.25)",
    features: ["Employee management", "Payroll processing", "Recruitment pipeline", "Reports & analytics"],
    loginHref: "/login",
    registerHref: "/onboarding",
    badge: "Full Access",
  },
  {
    key: "finance",
    icon: TrendingUp,
    title: "Finance Portal",
    subtitle: "Finance Management",
    desc: "Dedicated finance workspace for payroll runs, budget tracking, bulk payments, deductions, and financial reporting.",
    gradient: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #1d4ed8 100%)",
    glow: "rgba(15,23,42,0.3)",
    features: ["Payroll management", "Budget tracking", "Bulk payments", "Audit logs"],
    loginHref: "/finance/login",
    registerHref: "/finance/register",
    badge: "Finance Team",
  },
  {
    key: "employee",
    icon: Users,
    title: "Employee Portal",
    subtitle: "Self-Service",
    desc: "Your personal HR hub. View payslips, submit leave requests, track benefits, manage your profile and requests.",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 60%, #1d4ed8 100%)",
    glow: "rgba(59,130,246,0.25)",
    features: ["View payslips", "Leave requests", "Benefits overview", "Profile management"],
    loginHref: "/employee-portal/login",
    registerHref: "/employee-portal/register",
    badge: "All Employees",
  },
];

export default function GetStartedPage() {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-body)",
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes orb1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.1)} 66%{transform:translate(-30px,50px) scale(0.95)} }
        @keyframes orb2 { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(-80px,30px) scale(1.08)} 70%{transform:translate(40px,-60px) scale(0.92)} }
        @keyframes float3d { 0%,100%{transform:translateY(0) rotateX(0deg)} 50%{transform:translateY(-8px) rotateX(2deg)} }
        .gs-card { transition: transform 0.3s cubic-bezier(.4,0,.2,1), box-shadow 0.3s; cursor: default; }
        .gs-card:hover { transform: translateY(-8px) scale(1.01); }
        .gs-btn-primary { transition: all 0.2s; }
        .gs-btn-primary:hover { filter: brightness(1.1); transform: translateY(-1px); box-shadow: 0 6px 20px rgba(37,99,235,0.35); }
        .gs-btn-secondary { transition: all 0.2s; }
        .gs-btn-secondary:hover { background: var(--bg-hover) !important; transform: translateY(-1px); }
        .gs-enter { opacity: 0; transform: translateY(40px); transition: opacity 0.7s cubic-bezier(.4,0,.2,1), transform 0.7s cubic-bezier(.4,0,.2,1); }
        .gs-enter.show { opacity: 1; transform: translateY(0); }
        .gs-enter.d1 { transition-delay: 0.1s; }
        .gs-enter.d2 { transition-delay: 0.22s; }
        .gs-enter.d3 { transition-delay: 0.34s; }
        .gs-enter.d4 { transition-delay: 0.46s; }
        @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
        .gs-badge { animation: badgePulse 2.5s ease-in-out infinite; }
      `}</style>

      {/* Background orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", animation: "orb1 18s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)", animation: "orb2 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 60%)" }} />
      </div>

      {/* Top bar */}
      <div style={{ position: "relative", zIndex: 10, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)", textDecoration: "none", fontSize: 14, fontWeight: 500, transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <ArrowLeft size={16} /> Back to home
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>N</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)" }}>NeraAdmin</span>
        </div>
      </div>

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "20px 24px 80px" }}>
        {/* Heading */}
        <div className={`gs-enter${visible ? " show" : ""}`} style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px", borderRadius: 20, background: "var(--accent-light)", border: "0.5px solid var(--border)", fontSize: 11, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 20 }}>
            <Sparkles size={12} /> Choose Your Portal
          </div>
          <h1 style={{ fontSize: 44, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 14px", letterSpacing: -1.5, lineHeight: 1.1 }}>
            How would you like to<br />
            <span style={{ color: "#2563eb" }}>use NeraAdmin?</span>
          </h1>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", maxWidth: 480, margin: "0 auto", lineHeight: 1.75 }}>
            Select your portal to sign in or create a new account. Each portal is isolated and secure.
          </p>
        </div>

        {/* Portal cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 40 }}>
          {portals.map((p, i) => {
            const Icon = p.icon;
            const isHovered = hovered === p.key;
            return (
              <div
                key={p.key}
                className={`gs-card gs-enter d${i + 1}${visible ? " show" : ""}`}
                onMouseEnter={() => setHovered(p.key)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  background: "var(--bg-card)",
                  borderRadius: 20,
                  border: `1px solid ${isHovered ? "#2563eb44" : "var(--border)"}`,
                  overflow: "hidden",
                  boxShadow: isHovered ? `0 20px 60px ${p.glow}` : "var(--shadow-card)",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Card top gradient */}
                <div style={{ background: p.gradient, padding: "28px 24px 24px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
                  <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                      <Icon size={22} color="#fff" strokeWidth={2} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{p.title}</h3>
                      <span className="gs-badge" style={{ fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 10, background: "rgba(255,255,255,0.2)", color: "#fff", letterSpacing: "0.06em", textTransform: "uppercase" }}>{p.badge}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{p.subtitle}</p>
                  </div>
                </div>

                {/* Card body */}
                <div style={{ padding: "20px 24px", flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                    {p.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <ChevronRight size={9} style={{ color: "var(--accent)" }} />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card actions */}
                <div style={{ padding: "16px 24px 20px", display: "flex", flexDirection: "column", gap: 8, borderTop: "0.5px solid var(--border)" }}>
                  <Link
                    href={p.loginHref}
                    className="gs-btn-primary"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "11px 16px", borderRadius: 10, background: "#2563eb", color: "#fff", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
                  >
                    Sign In <ChevronRight size={13} />
                  </Link>
                  <Link
                    href={p.registerHref}
                    className="gs-btn-secondary"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "10px 16px", borderRadius: 10, background: "var(--bg-body)", color: "var(--text-secondary)", fontWeight: 500, fontSize: 13, textDecoration: "none", border: "0.5px solid var(--border)" }}
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer note */}
        <p className={`gs-enter d4${visible ? " show" : ""}`} style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
          Each portal is independently secured. Credentials do not cross between portals.
        </p>
      </div>
    </div>
  );
}
