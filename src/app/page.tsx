"use client";

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

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-body)", color: "var(--text-primary)", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

      {/* ══════════════════════════════════
          NAVIGATION
      ══════════════════════════════════ */}
      <header style={{ position: "sticky", top: 0, zIndex: 100, borderBottom: "0.5px solid var(--border)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: "rgba(255,255,255,0.88)" }}>
        <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 40px", maxWidth: 1260, margin: "0 auto" }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: BLUE[600], display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: -0.5 }}>N</span>
            </div>
            <span style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navLinks.map(link => (
              <a key={link.label} href={link.href} style={{ padding: "6px 14px", borderRadius: 7, fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", textDecoration: "none", transition: "color 0.18s, background 0.18s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)"; (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-card)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <button onClick={toggle} style={{ width: 34, height: 34, borderRadius: 8, background: "var(--bg-card)", border: "0.5px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }} title="Toggle theme">
              {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            </button>
            <Link href="/login" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "var(--text-primary)", textDecoration: "none", border: "0.5px solid var(--border)", background: "var(--bg-card)" }}>
              Sign in
            </Link>
            <Link href="/register" style={{ padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#fff", textDecoration: "none", background: BLUE[600], display: "inline-flex", alignItems: "center", gap: 5 }}>
              Get started <ChevronRight size={12} />
            </Link>
          </div>
        </nav>
      </header>

      {/* ══════════════════════════════════
          HERO
      ══════════════════════════════════ */}
      <section style={{ maxWidth: 1260, margin: "0 auto", padding: "80px 40px 64px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        {/* Left */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: BLUE[50], border: `0.5px solid ${BLUE[200]}`, fontSize: 11, fontWeight: 600, color: BLUE[600], marginBottom: 22 }}>
            <Zap size={11} /> Human Capital Management System
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 700, color: "var(--text-primary)", lineHeight: 1.1, marginBottom: 18, letterSpacing: -2 }}>
            Manage Your<br />
            <span style={{ color: BLUE[600] }}>Workforce</span><br />
            With Confidence
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.8, maxWidth: 440, marginBottom: 34 }}>
            A complete HR platform for employee management, payroll processing, leave tracking, recruitment, and real-time workforce analytics — all in one place.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 36 }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: BLUE[600] }}>
              Start free trial <ArrowRight size={14} />
            </Link>
            <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 26px", borderRadius: 10, fontSize: 14, fontWeight: 500, color: "var(--text-primary)", textDecoration: "none", background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
              Sign in
            </Link>
          </div>
          {/* Social proof */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ display: "flex" }}>
              {["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1560250097-0b93528c311a?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1580489944761-15a19d654956?w=60&q=80&fit=crop","https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&q=80&fit=crop"].map((src, i) => (
                <img key={i} src={src} alt="user" style={{ width: 30, height: 30, borderRadius: "50%", objectFit: "cover", border: "2px solid #fff", marginLeft: i > 0 ? -8 : 0 }} />
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
        <div style={{ position: "relative", height: 440 }}>
          {/* Main image */}
          <div style={{ position: "absolute", top: 0, left: 40, right: 0, height: 310, borderRadius: 18, overflow: "hidden", border: `0.5px solid ${BLUE[100]}` }}>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80&fit=crop" alt="Team collaborating" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${BLUE[600]}22, transparent)` }} />
          </div>
          {/* Floating efficiency card */}
          <div style={{ position: "absolute", bottom: 70, left: 0, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 180 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={16} style={{ color: BLUE[600] }} />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.5 }}>+24%</p>
              <p style={{ margin: 0, fontSize: 10, color: "var(--text-secondary)" }}>HR Efficiency Gain</p>
            </div>
          </div>
          {/* Floating employee count card */}
          <div style={{ position: "absolute", bottom: 70, right: 0, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 12, padding: "12px 16px" }}>
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
      <section style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {stats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} style={{ padding: "22px 20px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", alignItems: "center", gap: 14 }}>
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
      <section id="features" style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <SectionHeading
          eyebrow="Platform Features"
          title="Everything Your HR Team Needs"
          sub="A comprehensive suite of HR tools designed to streamline your workforce operations from day one."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {features.map(f => {
            const Icon = f.icon;
            return (
              <div key={f.title}
                style={{ padding: "24px 22px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", transition: "transform 0.2s, border-color 0.2s", cursor: "default" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.borderColor = BLUE[300]; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
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
      <section id="how" style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <SectionHeading
          eyebrow="How it works"
          title="Up and Running in Minutes"
          sub="Getting started with NeraAdmin is simple. Follow four steps and your HR operations are live."
          center
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, position: "relative" }}>
          {/* Connector line */}
          <div style={{ position: "absolute", top: 28, left: "12.5%", right: "12.5%", height: "0.5px", background: `linear-gradient(to right, ${BLUE[200]}, ${BLUE[400]}, ${BLUE[200]})`, zIndex: 0 }} />
          {steps.map((step, i) => (
            <div key={step.num} style={{ padding: "24px 20px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", position: "relative", zIndex: 1, textAlign: "center" }}>
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
      <section id="team" style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <SectionHeading eyebrow="Our Team" title="The People Behind NeraAdmin" sub="A dedicated team of HR, finance, and engineering professionals building the future of workforce management." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 14 }}>
          {teamMembers.map(member => (
            <div key={member.name}
              style={{ borderRadius: 14, overflow: "hidden", background: "var(--bg-card)", border: "0.5px solid var(--border)", transition: "transform 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLDivElement).style.borderColor = BLUE[300]; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
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
      <section id="testimonials" style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <SectionHeading eyebrow="Testimonials" title="What Our Users Say" sub="Hear from the HR professionals and business leaders who rely on NeraAdmin every day." center />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
          {testimonials.map(t => (
            <div key={t.name} style={{ padding: "24px 22px", borderRadius: 14, background: "var(--bg-card)", border: "0.5px solid var(--border)", display: "flex", flexDirection: "column", gap: 0 }}>
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
      <section style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px" }}>
        <div style={{ borderRadius: 20, background: BLUE[600], position: "relative", overflow: "hidden", display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 360 }}>
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
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 9, fontSize: 13, fontWeight: 600, color: BLUE[600], textDecoration: "none", background: "#fff" }}>
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
      <section style={{ maxWidth: 1260, margin: "0 auto", padding: "0 40px 80px", textAlign: "center" }}>
        <div style={{ padding: "64px 40px", borderRadius: 20, background: "var(--bg-card)", border: "0.5px solid var(--border)" }}>
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
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 10, fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", background: BLUE[600] }}>
              Create your account <ArrowRight size={14} />
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
      <footer style={{ borderTop: "0.5px solid var(--border)", padding: "0 40px 0", maxWidth: 1260, margin: "0 auto" }}>
        {/* Top footer */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, padding: "48px 0 40px", borderBottom: "0.5px solid var(--border)" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 14 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: BLUE[600], display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>N</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>NeraAdmin</span>
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