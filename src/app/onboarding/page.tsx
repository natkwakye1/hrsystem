"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, User, Shield, ChevronRight, ChevronLeft,
  Eye, EyeOff, CheckCircle2, Loader2, Globe, Phone,
  MapPin, Mail, Lock, Briefcase,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Company Info",    icon: Building2 },
  { id: 2, label: "Admin Account",   icon: User      },
  { id: 3, label: "Review & Launch", icon: Shield    },
];

const INDUSTRIES = [
  "Technology", "Finance & Banking", "Healthcare", "Education",
  "Manufacturing", "Retail", "Logistics", "Real Estate",
  "Hospitality", "Legal", "Construction", "Media", "Other",
];

const INDUSTRY_IMAGES: Record<string, string> = {
  "Technology":        "photo-1518770660439-4636190af475",
  "Finance & Banking": "photo-1554224155-6726b3ff858f",
  "Healthcare":        "photo-1576091160399-112ba8d25d1d",
  "Education":         "photo-1523050854058-8df90110c9f1",
  "Manufacturing":     "photo-1565193566173-7a0ee3dbe261",
  "Retail":            "photo-1472851294608-062f824d29cc",
  "Logistics":         "photo-1586528116311-ad8dd3c8310d",
  "Real Estate":       "photo-1560472354-b33ff0c44a43",
  "Hospitality":       "photo-1566073771259-6a8506099945",
  "Legal":             "photo-1589829545856-d10d557cf95f",
  "Construction":      "photo-1504307651254-35680f356dfd",
  "Media":             "photo-1598899134739-24c46f58b8c0",
  "Other":             "photo-1497366216548-37526070297c",
};

function getIndustryImage(industry?: string): string {
  if (!industry) return "photo-1522071820081-009f0129c71c";
  return INDUSTRY_IMAGES[industry] || "photo-1497366216548-37526070297c";
}

const SIZE_OPTIONS = [
  { value: "1",   label: "1 – 5 employees",    badge: "Free",       color: "#3b82f6" },
  { value: "10",  label: "6 – 50 employees",   badge: "Pro",        color: "#2563eb" },
  { value: "100", label: "51 – 200 employees", badge: "Pro",        color: "#2563eb" },
  { value: "500", label: "200+ employees",     badge: "Enterprise", color: "#2563eb" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep]           = useState(1);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showPass2, setShowPass2] = useState(false);
  const [done, setDone]           = useState(false);
  const [companySlug, setCompanySlug] = useState("");

  const [form, setForm] = useState({
    companyName: "", industry: "", size: "1",
    website: "", phone: "", address: "",
    adminName: "", adminEmail: "",
    adminPassword: "", adminConfirm: "",
  });

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function validateStep1() {
    if (!form.companyName.trim()) return "Company name is required.";
    return "";
  }
  function validateStep2() {
    if (!form.adminName.trim())   return "Your full name is required.";
    if (!form.adminEmail.trim())  return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.adminEmail)) return "Enter a valid email.";
    if (form.adminPassword.length < 8)  return "Password must be at least 8 characters.";
    if (form.adminPassword !== form.adminConfirm) return "Passwords do not match.";
    return "";
  }

  function nextStep() {
    const err = step === 1 ? validateStep1() : step === 2 ? validateStep2() : "";
    if (err) { setError(err); return; }
    setError("");
    setStep(s => s + 1);
  }

  async function handleSubmit() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/company/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName, industry: form.industry, size: form.size,
          website: form.website, phone: form.phone, address: form.address,
          adminName: form.adminName, adminEmail: form.adminEmail, adminPassword: form.adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }
      setCompanySlug(data.slug);
      setDone(true);
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  }

  const selectedSize = SIZE_OPTIONS.find(o => o.value === form.size) || SIZE_OPTIONS[0];
  const slugPreview  = form.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: "1px solid var(--border)", backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 13, outline: "none", transition: "all 0.2s",
  };
  const inputWithIcon: React.CSSProperties = { ...inputStyle, paddingLeft: 38 };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", marginBottom: 6,
  };
  const iconWrap: React.CSSProperties = {
    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none", color: "var(--icon-color)",
  };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");

  const workspaceUrl = `${appUrl}/${companySlug}/login`;
  const teamUrl = `/onboarding/team?company=${encodeURIComponent(form.companyName)}&domain=${encodeURIComponent(companySlug + ".com")}&slug=${encodeURIComponent(companySlug)}`;

  /* ── Success screen ── */
  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-body)", padding: 24 }}>
      <div style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 20, boxShadow: "var(--shadow-card)", padding: "40px 36px", maxWidth: 520, width: "100%" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={28} color="#2563eb" />
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px", letterSpacing: -0.5 }}>
            {form.companyName} is live!
          </h2>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
            Credentials sent to <strong>{form.adminEmail}</strong>
          </p>
        </div>

        {/* Portal URLs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: 0 }}>
            Share these login links with your team
          </p>

          {[
            { label: "Admin Portal", role: "Admin", color: "#1d4ed8", bg: "linear-gradient(135deg,#1e3a8a,#2563eb)", url: `${appUrl}/${companySlug}/login` },
            { label: "Finance Portal", role: "Finance team", color: "#1e3a8a", bg: "linear-gradient(135deg,#1e3a8a,#2563eb)", url: `${appUrl}/${companySlug}/login` },
            { label: "Employee Portal", role: "Employees", color: "#1d4ed8", bg: "linear-gradient(135deg,#1e3a8a,#2563eb)", url: `${appUrl}/${companySlug}/login` },
          ].map(p => (
            <div key={p.label} style={{ background: p.bg, borderRadius: 12, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 3px" }}>{p.label}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, wordBreak: "break-all" as const }}>{p.url}</p>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(p.url)}
                  style={{ flexShrink: 0, marginLeft: 12, padding: "5px 12px", borderRadius: 7, background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}
                >
                  Copy
                </button>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", margin: 0 }}>For: {p.role} — auto-routed to their portal after sign in</p>
            </div>
          ))}
        </div>

        {/* Email domain */}
        <div style={{ backgroundColor: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" as const, letterSpacing: "0.07em", margin: "0 0 4px" }}>Work email domain</p>
          <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 2px" }}>@{companySlug}.com</p>
          <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>All staff accounts use this domain automatically.</p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => router.push(teamUrl)}
            style={{ padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer", background: "var(--accent)", color: "#fff", fontSize: 14, fontWeight: 600 }}>
            Continue → Add team members
          </button>
          <button onClick={() => router.push(`/${companySlug}/admin`)}
            style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid var(--border)", cursor: "pointer", background: "transparent", color: "var(--text-secondary)", fontSize: 13 }}>
            Skip — Go to Admin Portal
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex" style={{ width: 520, flexDirection: "column", justifyContent: "space-between", position: "relative", overflow: "hidden" }}>
        {/* Background image — changes with selected industry */}
        <img
          key={getIndustryImage(form.industry)}
          src={`https://images.unsplash.com/${getIndustryImage(form.industry)}?w=1200&q=80&fit=crop`}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", transition: "opacity 0.4s" }}
        />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>N</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>

          <h1 style={{ color: "#fff", fontSize: 30, fontWeight: 800, lineHeight: 1.2, marginBottom: 14, letterSpacing: -0.8 }}>
            Set up your<br />company workspace
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.75, maxWidth: 360, marginBottom: 40 }}>
            Takes less than 3 minutes. Your entire team receives their login credentials automatically.
          </p>

          {/* Steps */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {STEPS.map(s => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isDone   = step > s.id;
              return (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, background: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)", backdropFilter: isActive ? "blur(8px)" : "none", border: isActive ? "1px solid rgba(255,255,255,0.2)" : "1px solid transparent", transition: "all 0.2s" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: isDone ? "rgba(255,255,255,0.95)" : isActive ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)", flexShrink: 0 }}>
                    {isDone ? <CheckCircle2 size={15} color="#2563eb" /> : <Icon size={13} color="#fff" />}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Step {s.id}</p>
                    <p style={{ margin: 0, fontSize: 13.5, color: isActive ? "#fff" : "rgba(255,255,255,0.65)", fontWeight: isActive ? 700 : 400 }}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "16px 20px", border: "1px solid rgba(255,255,255,0.15)" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Free plan includes</p>
            <p style={{ color: "rgba(255,255,255,0.82)", fontSize: 13, margin: 0, lineHeight: 1.7 }}>
              Up to 5 employees · Full HR features · Payroll management · Leave tracking
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-body)", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Mobile logo */}
          <div style={{ display: "block", marginBottom: 28, textAlign: "center" }} className="lg:hidden">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>N</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>NeraAdmin</span>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>

            {/* Progress bar */}
            <div style={{ height: 3, background: "var(--border)", borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((step - 1) / (STEPS.length - 1)) * 100}%`, background: "var(--accent)", borderRadius: 3, transition: "width 0.4s ease" }} />
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--danger)", fontSize: 13, lineHeight: 1.6 }}>
                <strong style={{ display: "block", marginBottom: 2 }}>Error</strong>
                {error}
              </div>
            )}

            {/* ── Step 1 ── */}
            {step === 1 && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Company information</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>This sets up your workspace and email domain.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Company Name *</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Building2 size={14} /></div>
                      <input style={inputWithIcon} placeholder="Acme Corp" value={form.companyName} onChange={e => set("companyName", e.target.value)} />
                    </div>
                    {form.companyName && (
                      <p style={{ fontSize: 11, color: "var(--accent)", margin: "4px 0 0" }}>
                        Email domain: @{slugPreview}.com
                      </p>
                    )}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Industry</label>
                      <select style={{ ...inputStyle, cursor: "pointer" }} value={form.industry} onChange={e => set("industry", e.target.value)}>
                        <option value="">Select…</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Website</label>
                      <div style={{ position: "relative" }}>
                        <div style={iconWrap}><Globe size={14} /></div>
                        <input style={inputWithIcon} placeholder="www.acme.com" value={form.website} onChange={e => set("website", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <div style={{ position: "relative" }}>
                        <div style={iconWrap}><Phone size={14} /></div>
                        <input style={inputWithIcon} placeholder="+1 234 567 8900" value={form.phone} onChange={e => set("phone", e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>Address</label>
                      <div style={{ position: "relative" }}>
                        <div style={iconWrap}><MapPin size={14} /></div>
                        <input style={inputWithIcon} placeholder="123 Main St, City" value={form.address} onChange={e => set("address", e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Team Size</label>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {SIZE_OPTIONS.map(opt => (
                        <label key={opt.value} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 10, border: `1px solid ${form.size === opt.value ? "var(--accent)" : "var(--border)"}`, background: form.size === opt.value ? "var(--accent-soft)" : "var(--bg-input)", cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <input type="radio" name="size" value={opt.value} checked={form.size === opt.value} onChange={() => set("size", opt.value)} style={{ accentColor: "var(--accent)" }} />
                            <span style={{ fontSize: 13, color: "var(--text-primary)", fontWeight: form.size === opt.value ? 500 : 400 }}>{opt.label}</span>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: opt.color }}>{opt.badge}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Admin account</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                    You will use these credentials to manage <strong>{form.companyName}</strong>.
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><User size={14} /></div>
                      <input style={inputWithIcon} placeholder="John Smith" value={form.adminName} onChange={e => set("adminName", e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Email Address *</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Mail size={14} /></div>
                      <input style={inputWithIcon} type="email" placeholder="john@yourcompany.com" value={form.adminEmail} onChange={e => set("adminEmail", e.target.value)} />
                    </div>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "4px 0 0" }}>Your login credentials will be sent here.</p>
                  </div>

                  <div>
                    <label style={labelStyle}>Password *</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Lock size={14} /></div>
                      <input style={{ ...inputWithIcon, paddingRight: 40 }} type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.adminPassword} onChange={e => set("adminPassword", e.target.value)} />
                      <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    {form.adminPassword && (
                      <div style={{ height: 3, background: "var(--border)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 3, transition: "width 0.3s", background: form.adminPassword.length < 8 ? "#ef4444" : form.adminPassword.length < 12 ? "#f59e0b" : "#3b82f6", width: form.adminPassword.length < 8 ? "33%" : form.adminPassword.length < 12 ? "66%" : "100%" }} />
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={labelStyle}>Confirm Password *</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Lock size={14} /></div>
                      <input style={{ ...inputWithIcon, paddingRight: 40 }} type={showPass2 ? "text" : "password"} placeholder="Repeat your password" value={form.adminConfirm} onChange={e => set("adminConfirm", e.target.value)} />
                      <button type="button" onClick={() => setShowPass2(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                        {showPass2 ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Review &amp; launch</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Everything look good? Hit launch to create your workspace.</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "var(--bg-input)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Building2 size={14} color="var(--accent)" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Company</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                      {[
                        ["Name", form.companyName],
                        ["Industry", form.industry || "—"],
                        ["Team size", selectedSize.label],
                        ["Plan", selectedSize.badge],
                        ["Email domain", `@${slugPreview}.com`],
                        ["Website", form.website || "—"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</p>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-input)", borderRadius: 12, padding: "14px 16px", border: "1px solid var(--border)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                      <Briefcase size={14} color="var(--accent)" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Admin Account</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 16px" }}>
                      {[
                        ["Name", form.adminName],
                        ["Email", form.adminEmail],
                        ["Role", "Admin (Full Access)"],
                        ["Password", "••••••••"],
                      ].map(([k, v]) => (
                        <div key={k}>
                          <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</p>
                          <p style={{ margin: 0, fontSize: 13, color: "var(--text-primary)", fontWeight: 500 }}>{v}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: "var(--bg-input)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)", fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.7 }}>
                    Login credentials will be emailed to <strong>{form.adminEmail}</strong>.<br />
                    Finance and employee accounts can be added from your admin portal.<br />
                    Only the admin can reset passwords for all accounts.
                  </div>
                </div>
              </>
            )}

            {/* ── Navigation ── */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
              {step > 1 ? (
                <button onClick={() => { setStep(s => s - 1); setError(""); }}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border)", cursor: "pointer", background: "transparent", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>
                  <ChevronLeft size={15} /> Back
                </button>
              ) : (
                <button onClick={() => router.push("/login")}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 9, border: "1px solid var(--border)", cursor: "pointer", background: "transparent", color: "var(--text-secondary)", fontSize: 13, fontWeight: 500 }}>
                  Cancel
                </button>
              )}

              {step < 3 ? (
                <button onClick={nextStep}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", cursor: "pointer", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600 }}>
                  Continue <ChevronRight size={15} />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 20px", borderRadius: 9, border: "none", cursor: loading ? "not-allowed" : "pointer", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                  {loading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Launching…</> : <>Launch Workspace <ChevronRight size={15} /></>}
                </button>
              )}
            </div>
          </div>

          <p style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <a href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}
