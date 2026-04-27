"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  Users, Wallet, CalendarDays, Briefcase, BarChart3, Shield,
  ArrowRight, CheckCircle2, Zap, Sun, Moon, ChevronRight,
  TrendingUp, Award, Clock, UserPlus, FileText, Settings2,
  Star, Quote, MapPin, Mail, Phone,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

/* ─────────────────────────────────────────
   Palette
───────────────────────────────────────── */
const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Team", href: "#team" },
  { label: "Testimonials", href: "#testimonials" },
];

const features = [
  { icon: Users,       title: "Employee Management",  desc: "Complete employee lifecycle from hire to retire with detailed profiles, documents, and emergency contacts.",         accentBg: BLUE[50],  accentColor: BLUE[600] },
  { icon: Wallet,      title: "Payroll Processing",   desc: "Automated salary calculations, deductions, tax computation, and multi-method payment tracking.",                    accentBg: BLUE[100], accentColor: BLUE[700] },
  { icon: CalendarDays,title: "Leave Management",     desc: "Streamlined leave requests, multi-stage approvals, and real-time balance tracking for your entire workforce.",       accentBg: BLUE[50],  accentColor: BLUE[500] },
  { icon: Briefcase,   title: "Recruitment",          desc: "Post jobs, track applicants, manage your hiring pipeline, and toggle job status in a single click.",                 accentBg: BLUE[200], accentColor: BLUE[900] },
  { icon: BarChart3,   title: "Reports & Analytics",  desc: "Real-time dashboards with department stats, payroll trends, gender breakdown, and workforce insights.",             accentBg: BLUE[100], accentColor: BLUE[700] },
  { icon: Shield,      title: "Benefits & Deductions",desc: "Configure and manage employee benefits, insurance, retirement plans, and statutory deductions with ease.",           accentBg: BLUE[50],  accentColor: BLUE[600] },
  { icon: UserPlus,    title: "Onboarding",           desc: "Structured onboarding checklists, progress tracking, and automated task assignment for every new hire.",             accentBg: BLUE[100], accentColor: BLUE[500] },
  { icon: FileText,    title: "Document Management",  desc: "Centralized document storage with expiry tracking, status management, and easy retrieval for every employee.",      accentBg: BLUE[50],  accentColor: BLUE[700] },
  { icon: Settings2,   title: "System Settings",      desc: "Customizable company settings, payroll cycles, leave policies, and currency preferences for your organization.",    accentBg: BLUE[200], accentColor: BLUE[900] },
];

const stats = [
  { value: "500+", label: "Employees Managed",  icon: Users    },
  { value: "12",   label: "Departments",         icon: Briefcase },
  { value: "98%",  label: "Satisfaction Rate",   icon: Award    },
  { value: "24/7", label: "System Uptime",       icon: Clock    },
];

const steps = [
  { num: "01", title: "Create your account",       desc: "Sign up in seconds. No credit card required. Your workspace is ready immediately." },
  { num: "02", title: "Add your employees",         desc: "Import or manually add employees with full profiles, departments, and salary details." },
  { num: "03", title: "Configure your policies",   desc: "Set up leave policies, payroll cycles, benefits, and deductions to match your company." },
  { num: "04", title: "Run your HR operations",    desc: "Process payroll, approve leaves, manage recruitment, and get insights from day one." },
];

const teamMembers = [
  { name: "Sarah Mitchell",  role: "HR Director",        dept: "Human Resources", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&fit=crop" },
  { name: "James Okafor",    role: "Payroll Manager",    dept: "Finance",         img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80&fit=crop" },
  { name: "Amelia Chen",     role: "Talent Acquisition", dept: "Recruitment",     img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80&fit=crop" },
  { name: "David Mensah",    role: "Benefits Analyst",   dept: "Operations",      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&fit=crop" },
  { name: "Efua Darko",      role: "Systems Lead",       dept: "Engineering",     img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&fit=crop" },
  { name: "Kwame Asante",    role: "Finance Controller", dept: "Finance",         img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&fit=crop" },
];

const testimonials = [
  { name: "Rachel Owusu",   role: "CEO, Horizon Ventures",    text: "NeraAdmin cut our payroll processing time by 70%. The interface is clean, fast, and our HR team loves it.",      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&fit=crop&crop=face", rating: 5 },
  { name: "Marcus Boateng", role: "COO, Solis Technologies",  text: "The onboarding module alone saved us countless hours. Every new hire gets a structured, consistent experience.",  avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80&fit=crop&crop=face", rating: 5 },
  { name: "Ama Sarpong",    role: "HR Manager, CrestLine",    text: "Reporting and analytics changed how we make workforce decisions. The department breakdown charts are invaluable.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face", rating: 5 },
];

const whyChoose = [
  "No separate database server needed",
  "Dark and light theme support",
  "Fully responsive on all devices",
  "Real-time analytics dashboard",
  "Secure session-based authentication",
  "Complete payroll automation",
  "Built-in document expiry tracking",
  "Structured onboarding checklists",
];

/* ─────────────────────────────────────────
   Shared section heading
───────────────────────────────────────── */
function SectionHeading({ eyebrow, title, sub, center }: { eyebrow: string; title: string; sub?: string; center?: boolean }) {
  return (
    <div style={{ marginBottom: 48, textAlign: center ? "center" : "left" }}>
      <p style={{ fontSize: 11, fontWeight: 600, color: BLUE[600], letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: 32, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 12px", letterSpacing: -0.8, maxWidth: center ? 560 : 480, marginLeft: center ? "auto" : undefined, marginRight: center ? "auto" : undefined }}>
        {title}
      </h2>
      {sub && (
        <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.75, maxWidth: center ? 520 : 480, marginLeft: center ? "auto" : undefined, marginRight: center ? "auto" : undefined }}>
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function LandingPage() {
  const { theme, toggle } = useTheme();

  useEffect(() => {
    /* Observe every element that carries an animation class.
       .anim-scale elements may also carry .anim — dedup via Set. */
    const els = document.querySelectorAll<Element>(".anim, .anim-left, .anim-scale");
    const seen = new Set<Element>();
    const animObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("anim-in");
          animObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.07, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => { if (!seen.has(el)) { seen.add(el); animObs.observe(el); } });

    const sections = ["features", "how", "team", "testimonials"];
    const sectionEls = sections.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const links = document.querySelectorAll<HTMLAnchorElement>(".landing-link[data-spy]");

    const spyObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector<HTMLAnchorElement>(`.landing-link[data-spy="${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.remove("nav-active"));
          link.classList.add("nav-active");
        }
      });
    }, { threshold: 0.3 });
    sectionEls.forEach(el => spyObs.observe(el));

    return () => { animObs.disconnect(); spyObs.disconnect(); };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      {/* ══════════════════════════════════
          NAVIGATION
      ══════════════════════════════════ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');

        /* ── Orbs ── */
        @keyframes orb-drift-a { 0%,100%{transform:translate(0,0) scale(1)} 40%{transform:translate(80px,-60px) scale(1.1)} 70%{transform:translate(-40px,40px) scale(0.95)} }
        @keyframes orb-drift-b { 0%,100%{transform:translate(0,0)} 35%{transform:translate(-60px,50px)} 65%{transform:translate(50px,-30px)} }

        /* ── Nav ── */
        .landing-link { border-radius:8px; transition: background 0.15s, color 0.15s; }
        .landing-link:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .landing-link.nav-active { color: #2563eb !important; font-weight: 600 !important; }
        .nav-cta-btn { transition: opacity 0.15s, transform 0.15s; }
        .nav-cta-btn:hover { opacity: 0.88 !important; transform: translateY(-1px); }
        .nav-sign-in { transition: background 0.15s, color 0.15s; }
        .nav-sign-in:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .nav-theme-btn { transition: background 0.15s, color 0.15s; }
        .nav-theme-btn:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }

        /* ── Card hover lift ── */
        .hover-lift { transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s; }
        .hover-lift:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(30,58,138,0.10); }

        /* ══════════════════════════
           HERO ENTRANCE ANIMATIONS
        ══════════════════════════ */
        @keyframes hero-badge  { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hero-h1     { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hero-para   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hero-btns   { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hero-right  { from{opacity:0;transform:translateX(44px) scale(0.96)} to{opacity:1;transform:translateX(0) scale(1)} }

        .hero-a1 { animation: hero-badge 0.55s cubic-bezier(0.16,1,0.3,1) 0.10s both; }
        .hero-a2 { animation: hero-h1    0.65s cubic-bezier(0.16,1,0.3,1) 0.22s both; }
        .hero-a3 { animation: hero-para  0.60s cubic-bezier(0.16,1,0.3,1) 0.38s both; }
        .hero-a4 { animation: hero-btns  0.55s cubic-bezier(0.16,1,0.3,1) 0.52s both; }
        .hero-a5 { animation: hero-right 0.80s cubic-bezier(0.16,1,0.3,1) 0.14s both; }

        /* ── Floating hero cards ── */
        @keyframes float-a { 0%,100%{transform:translateY(0px)}  50%{transform:translateY(-11px)} }
        @keyframes float-b { 0%,100%{transform:translateY(0px)}  50%{transform:translateY(-8px)}  }
        .float-card      { animation: float-a 4.2s ease-in-out 1.4s infinite; }
        .float-card-slow { animation: float-b 5.4s ease-in-out 0.9s infinite; }

        /* ══════════════════════════
           SCROLL-TRIGGERED ANIMATIONS
           IntersectionObserver adds .anim-in when element enters viewport
        ══════════════════════════ */

        /* Slide up (default) */
        .anim {
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.62s cubic-bezier(0.16,1,0.3,1),
                      transform 0.62s cubic-bezier(0.16,1,0.3,1);
        }
        /* Slide from left */
        .anim-left {
          opacity: 0;
          transform: translateX(-34px);
          transition: opacity 0.62s cubic-bezier(0.16,1,0.3,1),
                      transform 0.62s cubic-bezier(0.16,1,0.3,1);
        }
        /* Scale up */
        .anim-scale {
          opacity: 0;
          transform: scale(0.93);
          transition: opacity 0.60s cubic-bezier(0.16,1,0.3,1),
                      transform 0.60s cubic-bezier(0.16,1,0.3,1);
        }
        /* Revealed state */
        .anim.anim-in,
        .anim-left.anim-in,
        .anim-scale.anim-in {
          opacity: 1;
          transform: none;
        }

        /* Staggered delays for grid children */
        .anim-d1 { transition-delay: 0.04s; }
        .anim-d2 { transition-delay: 0.11s; }
        .anim-d3 { transition-delay: 0.18s; }
        .anim-d4 { transition-delay: 0.25s; }
        .anim-d5 { transition-delay: 0.32s; }
        .anim-d6 { transition-delay: 0.39s; }
      `}</style>

      {/* Background animated orbs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "5%", left: "10%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)", animation: "orb-drift-a 20s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "5%", right: "10%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)", animation: "orb-drift-b 26s ease-in-out infinite" }} />
      </div>

      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
        background: theme === "dark" ? "rgba(8,12,24,0.92)" : "rgba(255,255,255,0.94)",
        borderBottom: "1px solid var(--border)",
      }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 5%", width: "100%", height: 64, boxSizing: "border-box" }}>

          {/* Logo — stacked like Elite Drive Motors */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 11,
              background: `linear-gradient(145deg, ${BLUE[900]}, ${BLUE[600]})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 3px 14px rgba(30,58,138,0.40)`,
              flexShrink: 0,
            }}>
              <Users size={17} color="#fff" strokeWidth={2.2} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 2, textTransform: "uppercase" }}>Nera</span>
              <span style={{ fontSize: 9, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 3, textTransform: "uppercase", marginTop: 2 }}>Admin</span>
            </div>
          </Link>

          {/* Nav links — center */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {navLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                className="landing-link"
                data-spy={link.href.replace("#", "")}
                style={{
                  padding: "7px 18px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-secondary)",
                  textDecoration: "none",
                  letterSpacing: 0.1,
                  display: "block",
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <button
              onClick={toggle}
              className="nav-theme-btn"
              title="Toggle theme"
              style={{
                width: 36, height: 36, borderRadius: 8,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-muted)",
              }}
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            <Link
              href="/login"
              className="nav-sign-in"
              style={{
                padding: "7px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: "var(--text-secondary)",
                textDecoration: "none",
                background: "transparent",
                letterSpacing: 0.1,
                whiteSpace: "nowrap",
              }}
            >
              Sign In
            </Link>

            <Link
              href="/onboarding"
              className="nav-cta-btn"
              style={{
                padding: "9px 20px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
                background: theme === "dark" ? "#fff" : "#0f172a",
                color: theme === "dark" ? "#0f172a" : "#fff",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: 0.1,
                whiteSpace: "nowrap",
              }}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "80px 40px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }} className="landing-hero-grid">
        {/* Left */}
        <div>
          <div className="hero-a1" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "5px 14px 5px 8px", borderRadius: 24, background: `linear-gradient(135deg, ${BLUE[50]}, ${BLUE[100]})`, border: `1px solid ${BLUE[200]}`, fontSize: 11.5, fontWeight: 600, color: BLUE[700], marginBottom: 24, boxShadow: `0 2px 12px rgba(37,99,235,0.12)` }}>
            <span style={{ width: 20, height: 20, borderRadius: "50%", background: BLUE[600], display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Zap size={10} color="#fff" fill="#fff" />
            </span>
            Intelligent HR &amp; Payroll for Modern Teams
          </div>
          <h1 className="hero-a2 landing-hero-h1" style={{ fontSize: 52, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 18, letterSpacing: -2 }}>
            Manage Your<br />
            <span style={{ color: BLUE[600] }}>Workforce</span><br />
            With Confidence
          </h1>
          <p className="hero-a3" style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 440, marginBottom: 34 }}>
            A complete HR platform for employee management, payroll processing, leave tracking, recruitment, and real-time workforce analytics — all in one place.
          </p>
          <div className="hero-a4" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: BLUE[600] }}>
              Get started <ArrowRight size={14} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--text-primary)", textDecoration: "none", background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              Sign in
            </Link>
          </div>
          {/* Social proof */}
          <div className="hero-a4" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80&fit=crop"].map((src, i) => (
                <img key={i} src={src} alt="user" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--bg-card)", marginLeft: i > 0 ? -8 : 0 }} />
              ))}
            </div>
            <div>
              <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                {[1,2,3,4,5].map(s => <Star key={s} size={11} style={{ color: BLUE[500], fill: BLUE[500] }} />)}
              </div>
              <p style={{ margin: 0, fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>Trusted by 500+ users</p>
            </div>
          </div>
        </div>

        {/* Right: hero visual */}
        <div className="hero-a5 landing-hero-right" style={{ position: "relative", height: 440 }}>
          {/* Main image */}
          <div style={{ position: "absolute", top: 0, left: 40, right: 0, height: 310, borderRadius: 18, overflow: "hidden", border: `0.5px solid ${BLUE[100]}`, boxShadow: "0 24px 64px rgba(37,99,235,0.12)" }}>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&fit=crop" alt="Team collaborating" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${BLUE[600]}22, transparent)` }} />
          </div>
          {/* Floating efficiency card */}
          <div className="float-card" style={{ position: "absolute", bottom: 70, left: 0, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 180, boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={16} style={{ color: BLUE[600] }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5 }}>+24%</p>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text-secondary)" }}>HR Efficiency Gain</p>
            </div>
          </div>
          {/* Floating employee count card */}
          <div className="float-card-slow" style={{ position: "absolute", bottom: 70, right: 0, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)" }}>
            <div style={{ display: "flex", marginBottom: 6 }}>
              {["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&q=80&fit=crop"].map((src, i) => (
                <img key={i} src={src} alt="team" style={{ width: 26, height: 26, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--bg-card)", marginLeft: i > 0 ? -7 : 0 }} />
              ))}
            </div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: "var(--text-primary)" }}>500+ active users</p>
            <p style={{ margin: "1px 0 0", fontSize: 10, color: "var(--text-secondary)" }}>across 12 departments</p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          STATS ROW
      ══════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 72px" }}>
        <div className="landing-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {stats.map((s, si) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`anim anim-d${si + 1} hover-lift`} style={{ padding: "22px 20px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} style={{ color: BLUE[600] }} />
                </div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "2px 0 0" }}>{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════
          FEATURES
      ══════════════════════════════════ */}
      <section id="features" style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="anim"><SectionHeading
          eyebrow="Platform Features"
          title="Everything Your HR Team Needs"
          sub="A comprehensive suite of HR tools designed to streamline your workforce operations from day one."
        /></div>
        <div className="landing-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {features.map((f, fi) => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                className={`anim anim-d${(fi % 3) + 1} hover-lift`}
                style={{ padding: "24px 22px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", cursor: "default" }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 11, background: f.accentBg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                  <Icon size={20} style={{ color: f.accentColor }} />
                </div>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════ */}
      <section id="how" style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="anim"><SectionHeading
          eyebrow="How it works"
          title="Up and Running in Minutes"
          sub="Getting started with NeraAdmin is simple. Follow four steps and your HR operations are live."
          center
        /></div>
        <div className="landing-steps" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, position: "relative" }}>
          {/* Connector line */}
          <div style={{ position: "absolute", top: 28, left: "12.5%", right: "12.5%", height: "0.5px", background: `linear-gradient(to right, ${BLUE[200]}, ${BLUE[400]}, ${BLUE[200]})`, zIndex: 0 }} />
          {steps.map((step, i) => (
            <div key={step.num} className={`anim anim-d${i + 1} hover-lift`} style={{ padding: "24px 20px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", position: "relative", zIndex: 1, textAlign: "center" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: i === 0 ? BLUE[600] : BLUE[50], border: i === 0 ? "none" : `0.5px solid ${BLUE[200]}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? "#fff" : BLUE[600] }}>{step.num}</span>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", marginBottom: 8 }}>{step.title}</h3>
              <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          TEAM
      ══════════════════════════════════ */}
      <section id="team" style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="anim"><SectionHeading eyebrow="Our Team" title="The People Behind NeraAdmin" sub="A dedicated team of HR, finance, and engineering professionals building the future of workforce management." /></div>
        <div className="landing-6col" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
          {teamMembers.map((member, mi) => (
            <div key={member.name}
              className={`anim anim-d${(mi % 6) + 1} hover-lift`}
              style={{ borderRadius: 14, overflow: "hidden", background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
            >
              <div style={{ height: 160, overflow: "hidden" }}>
                <img src={member.img} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", transition: "transform 0.4s" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1.06)")}
                  onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = "scale(1)")}
                />
              </div>
              <div style={{ padding: "12px 14px" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{member.name}</p>
                <p style={{ margin: "2px 0 0", fontSize: 10, color: BLUE[600], fontWeight: 500 }}>{member.role}</p>
                <span style={{ display: "inline-block", marginTop: 6, fontSize: 9, fontWeight: 600, padding: "1px 7px", borderRadius: 4, background: BLUE[50], color: BLUE[700] }}>{member.dept}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════ */}
      <section id="testimonials" style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="anim"><SectionHeading eyebrow="Testimonials" title="What Our Users Say" sub="Hear from the HR professionals and business leaders who rely on NeraAdmin every day." center /></div>
        <div className="landing-3col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {testimonials.map((t, ti) => (
            <div key={t.name} className={`anim anim-scale anim-d${ti + 1}`} style={{ padding: "24px 22px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 0 }}>
              <Quote size={20} style={{ color: BLUE[300], marginBottom: 14 }} />
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, margin: "0 0 20px", flex: 1 }}>"{t.text}"</p>
              <div style={{ display: "flex", gap: 2, marginBottom: 14 }}>
                {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={11} style={{ color: BLUE[500], fill: BLUE[500] }} />)}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, borderTop: "0.5px solid var(--border)" }}>
                <img src={t.avatar} alt={t.name} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: `2px solid ${BLUE[100]}`, flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{t.name}</p>
                  <p style={{ margin: 0, fontSize: 10, color: "var(--text-secondary)" }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════
          WHY CHOOSE — full-bleed blue
      ══════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <div className="anim landing-why" style={{ borderRadius: 20, background: BLUE[600], position: "relative", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 360 }}>
          {/* Decorative orbs */}
          <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -100, left: -50, width: 350, height: 350, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />

          {/* Left */}
          <div style={{ padding: "52px 48px", position: "relative", zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
              Why NeraAdmin
            </p>
            <h2 style={{ fontSize: 30, fontWeight: 700, color: "#fff", margin: "0 0 14px", letterSpacing: -0.8, lineHeight: 1.2 }}>
              Built for Modern<br />HR Teams
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.8, margin: "0 0 32px", maxWidth: 340 }}>
              Reliable, fast, and intuitive — NeraAdmin scales with your business from your first hire to your five-hundredth.
            </p>
            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, color: BLUE[600], textDecoration: "none", background: "#fff" }}>
              Get started free <ArrowRight size={13} />
            </Link>
          </div>

          {/* Right: checklist */}
          <div style={{ padding: "52px 48px", position: "relative", zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
            {whyChoose.map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(255,255,255,0.14)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={13} style={{ color: BLUE[200] }} />
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          CTA BANNER
      ══════════════════════════════════ */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px", textAlign: "center" }}>
        <div className="anim anim-scale" style={{ padding: "64px 40px", borderRadius: 20, background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: BLUE[600], letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 12px" }}>
            Ready to start?
          </p>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px", letterSpacing: -0.8 }}>
            Transform Your HR Operations Today
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 auto 32px", maxWidth: 460, lineHeight: 1.75 }}>
            Join hundreds of businesses already using NeraAdmin to manage their workforce smarter, faster, and with less friction.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Link href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: BLUE[600] }}>
              Get started <ArrowRight size={14} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--text-primary)", textDecoration: "none", background: "transparent", border: "0.5px solid var(--border)" }}>
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          FOOTER
      ══════════════════════════════════ */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "0.5px solid var(--border)", padding: "0 40px 0", maxWidth: 1260, margin: "0 auto" }}>
        {/* Top footer */}
        <div className="landing-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, padding: "48px 0 40px", borderBottom: "0.5px solid var(--border)" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(145deg, ${BLUE[900]}, ${BLUE[600]})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 10px rgba(30,58,138,0.30)` }}>
                <Users size={16} color="#fff" strokeWidth={2.2} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", letterSpacing: 2, textTransform: "uppercase" }}>Nera</span>
                <span style={{ fontSize: 8, fontWeight: 600, color: "var(--text-muted)", letterSpacing: 3, textTransform: "uppercase", marginTop: 2 }}>Admin</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.75, maxWidth: 280, margin: "0 0 18px" }}>
              A complete HR management system for modern teams. Employee records, payroll, leave, recruitment, and more.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { icon: Mail,  text: "hello@neraadmin.com"  },
                { icon: Phone, text: "+1 (555) 000-0000"    },
                { icon: MapPin, text: "Accra, Ghana"         },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Icon size={12} style={{ color: BLUE[400], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>Product</p>
            {["Features", "How it works", "Pricing", "Changelog", "Roadmap"].map(l => (
              <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 8, fontWeight: 400 }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
              >
                {l}
              </a>
            ))}
          </div>

          {/* Company */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>Company</p>
            {["About us", "Blog", "Careers", "Press", "Partners"].map(l => (
              <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 8 }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
              >
                {l}
              </a>
            ))}
          </div>

          {/* Legal */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px" }}>Legal</p>
            {["Privacy Policy", "Terms of Use", "Cookie Policy", "Security", "GDPR"].map(l => (
              <a key={l} href="#" style={{ display: "block", fontSize: 13, color: "var(--text-secondary)", textDecoration: "none", marginBottom: 8 }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
              >
                {l}
              </a>
            ))}
          </div>
        </div>

        {/* Bottom footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 0", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
            © 2026 NeraAdmin. All rights reserved. Human Capital Management & Payroll System v1.0
          </p>
          <div style={{ display: "flex", gap: 16 }}>
            {navLinks.map(link => (
              <a key={link.label} href={link.href} style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "none" }}
                onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)")}
                onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)")}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}