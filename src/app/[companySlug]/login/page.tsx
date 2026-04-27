"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, Building2, ArrowRight } from "lucide-react";

interface CompanyInfo { name: string; slug: string; emailDomain: string; industry?: string; }

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
  if (!industry) return "photo-1560472354-b33ff0c44a43";
  return INDUSTRY_IMAGES[industry] || "photo-1497366216548-37526070297c";
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return name.substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

function splitName(name: string): { first: string; rest: string } {
  const parts = name.trim().split(/\s+/);
  return { first: parts[0].toUpperCase(), rest: parts.slice(1).join(" ").toUpperCase() };
}

export default function CompanyLoginPage() {
  const router     = useRouter();
  const params     = useParams();
  const slug       = (params?.companySlug as string) || "";

  const [company,  setCompany]  = useState<CompanyInfo | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [infoLoad, setInfoLoad] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/company/info?slug=${encodeURIComponent(slug)}`)
      .then(r => r.json())
      .then(d => {
        if (d.company) setCompany(d.company);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setInfoLoad(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/unified-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, companySlug: slug }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); setLoading(false); return; }

      const { role, companySlug: returnedSlug } = data;
      const cs = returnedSlug || slug;

      if (role === "admin")         router.push(`/${cs}/admin`);
      else if (role === "finance")  router.push(`/${cs}/finance`);
      else if (role === "employee") router.push(`/${cs}/employee`);
      else router.push(`/${cs}/admin`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 14, transition: "all 0.2s", outline: "none",
  };
  const ico: React.CSSProperties = {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none", color: "var(--icon-color)",
  };

  if (infoLoad) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-body)" }}>
      <div style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-body)", padding: 24 }}>
      <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--danger-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Building2 size={28} color="var(--danger)" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 8px" }}>Workspace not found</h2>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px" }}>
          No company with the URL <strong>/{slug}</strong> exists. Check the link or create a new workspace.
        </p>
        <a href="/onboarding" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
          Create a workspace <ArrowRight size={14} />
        </a>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>

      {/* Left panel */}
      <div className="hidden lg:flex" style={{
        width: 480, flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background image */}
        <img
          src={`https://images.unsplash.com/${getIndustryImage(company?.industry)}?w=1200&q=80&fit=crop`}
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          {/* Stylish company logo — Elite Drive Motors style */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
            <div style={{
              width: 50, height: 50, borderRadius: 15,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(14px)",
              border: "1.5px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 18px rgba(0,0,0,0.18)",
            }}>
              <span style={{ color: "#fff", fontWeight: 900, fontSize: 19, letterSpacing: -1 }}>
                {getInitials(company?.name || "N")}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 1 }}>
              {company?.name ? (() => {
                const { first, rest } = splitName(company.name);
                return (
                  <>
                    <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 2, textTransform: "uppercase" }}>{first}</span>
                    {rest && <span style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600, fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase", marginTop: 3 }}>{rest}</span>}
                    {!rest && company?.industry && <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 3 }}>{company.industry}</span>}
                  </>
                );
              })() : <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: 2 }}>WORKSPACE</span>}
            </div>
          </div>

          <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, lineHeight: 1.25, marginBottom: 14, letterSpacing: -0.5 }}>
            Welcome back
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 14, lineHeight: 1.75, maxWidth: 340, marginBottom: 32 }}>
            Sign in with your work credentials. You will be taken to the right portal automatically based on your role.
          </p>

          {/* Workspace info card */}
          {company?.industry && (
            <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 12, padding: "14px 18px" }}>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Industry</p>
              <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 13, fontWeight: 500, margin: 0 }}>{company.industry}</p>
            </div>
          )}
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 18px" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 3px" }}>Work email domain</p>
            <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 14, fontWeight: 600, margin: 0, letterSpacing: 0.2 }}>@{company?.emailDomain}</p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-body)", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: "block", marginBottom: 24, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(145deg,#1e3a8a,#2563eb)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 3px 12px rgba(37,99,235,0.30)" }}>
                <span style={{ color: "#fff", fontWeight: 900, fontSize: 15, letterSpacing: -0.5 }}>{getInitials(company?.name || "N")}</span>
              </div>
              {company?.name ? (() => {
                const { first, rest } = splitName(company.name);
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0, lineHeight: 1, textAlign: "left" }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "var(--text-primary)", letterSpacing: 1.5, textTransform: "uppercase" }}>{first}</span>
                    {rest && <span style={{ fontWeight: 600, fontSize: 9, color: "var(--text-muted)", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>{rest}</span>}
                  </div>
                );
              })() : <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text-primary)" }}>Workspace</span>}
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Sign In</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                Signing in to <strong>{company?.name}</strong> — you will be routed to your portal automatically.
              </p>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>Email</label>
                <div style={{ position: "relative" }}>
                  <div style={ico}><Mail size={16} /></div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={`you@${company?.emailDomain || "yourcompany.com"}`} required style={inp} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <div style={ico}><Lock size={16} /></div>
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required style={{ ...inp, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* First-time employee hint */}
              <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", margin: "0 0 2px" }}>First time signing in?</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                  Employees: use your <strong>Employee ID</strong> (e.g. <code style={{ fontSize: 11, background: "var(--border)", padding: "1px 5px", borderRadius: 4 }}>EMP-001</code>) as your password.<br />
                  Finance &amp; Admin: use the password set during account creation.
                </p>
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                color: "#fff", fontWeight: 600, fontSize: 14, border: "none",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "var(--accent)", transition: "all 0.2s",
              }}>
                {loading
                  ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Signing in…</>
                  : <><LogIn size={15} /> Sign In to {company?.name}</>
                }
              </button>
            </form>

            <p style={{ marginTop: 20, textAlign: "center", fontSize: 12, color: "var(--text-secondary)" }}>
              Wrong workspace?{" "}
              <a href="/login" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>Go to global login</a>
            </p>
          </div>

          <p style={{ marginTop: 14, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
            Powered by NeraAdmin — Human Capital Management &amp; Payroll System
          </p>
        </div>
      </div>
    </div>
  );
}
