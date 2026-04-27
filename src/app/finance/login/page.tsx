"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function FinanceLoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/portal/finance/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); return; }
      router.push("/finance");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 14, transition: "all 0.2s", outline: "none",
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6,
  };
  const iconWrap: React.CSSProperties = {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
    pointerEvents: "none", color: "var(--icon-color)",
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Left panel */}
      <div
        className="fin-left-panel"
        style={{
          width: 520, flexDirection: "column", justifyContent: "space-between",
          position: "relative", overflow: "hidden", display: "none",
        }}
      >
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80&fit=crop"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 18 }}>N</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 18, letterSpacing: -1 }}>
            Finance<br />Management<br />Portal
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, lineHeight: 1.8, maxWidth: 360 }}>
            Process payroll runs, monitor budgets, and generate financial reports for your entire organization.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ display: "flex", gap: 0, alignItems: "center", background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 14, padding: "18px 20px" }}>
            {[{ val: "Payroll", label: "Management" }, { val: "Budgets", label: "Tracking" }, { val: "Reports", label: "Analytics" }].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                {i > 0 && <div style={{ width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.2)", marginRight: 20 }} />}
                <div style={{ textAlign: "center", flex: 1 }}>
                  <p style={{ color: "#fff", fontWeight: 800, fontSize: 16, margin: 0, letterSpacing: -0.3 }}>{s.val}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: "3px 0 0", fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        backgroundColor: "var(--bg-body)", padding: "40px 24px",
      }}>
        <div style={{ width: "100%", maxWidth: 460 }}>

          {/* Mobile brand */}
          <div style={{ marginBottom: 28, textAlign: "center" }} className="fin-mobile-brand">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>N</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>NeraAdmin</span>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Finance Sign In</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Enter your finance team credentials to access the portal</p>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><Mail size={17} /></div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="finance@nera.com" required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><Lock size={17} /></div>
                  <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required style={{ ...inputStyle, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShow(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Demo hint */}
              <div style={{ marginBottom: 20, padding: "10px 14px", borderRadius: 10, backgroundColor: "var(--accent-light)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)", margin: "0 0 3px" }}>Demo Credentials</p>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>Email: finance@nera.com &nbsp;·&nbsp; Password: finance123</p>
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                color: "#fff", fontWeight: 600, fontSize: 14, border: "none",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "var(--accent)", transition: "all 0.2s",
              }}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
                  : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>

            <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
              Don&apos;t have an account?{" "}
              <a href="/finance/register" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Create one</a>
            </p>
            <p style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: "var(--text-muted)" }}>
              <a href="/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Admin Portal</a>
              {" · "}
              <a href="/employee-portal/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Employee Portal</a>
              {" · "}
              <a href="/get-started" style={{ color: "var(--text-muted)", textDecoration: "none" }}>Choose portal</a>
            </p>
          </div>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
            NeraAdmin v1.0 — Finance Management Portal
          </p>
        </div>
      </div>

      <style>{`
        @media(min-width: 1024px) {
          .fin-left-panel { display: flex !important; }
          .fin-mobile-brand { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
