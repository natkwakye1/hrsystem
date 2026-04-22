"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function EmployeeLoginPage() {
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
      const res  = await fetch("/api/portal/employee/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); return; }
      router.push("/employee-portal");
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
        className="ep-left-panel"
        style={{
          width: 520, flexDirection: "column", justifyContent: "space-between",
          position: "relative", overflow: "hidden", display: "none",
          background: "linear-gradient(135deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%)",
        }}
      >
        <div style={{ position: "absolute", top: -80,   left: -80,  width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,0.1)"  }} />
        <div style={{ position: "absolute", bottom: -120, right: -60, width: 400, height: 400, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", top: "40%", right: -40,  width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>N</span>
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 700, lineHeight: 1.2, marginBottom: 18 }}>
            Employee<br />Self-Service<br />Portal
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.7, maxWidth: 380 }}>
            Access your payslips, manage leave requests, review your benefits,
            and keep your personal information up to date — all in one place.
          </p>
        </div>

        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
            {[{ val: "Leave", label: "Requests" }, { val: "Pay", label: "Slips" }, { val: "Benefits", label: "Overview" }].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 24 }}>
                {i > 0 && <div style={{ width: 1, height: 40, backgroundColor: "rgba(255,255,255,0.2)" }} />}
                <div style={{ textAlign: "center" }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 18, margin: 0 }}>{s.val}</p>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: "4px 0 0" }}>{s.label}</p>
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
          <div style={{ marginBottom: 28, textAlign: "center" }} className="ep-mobile-brand">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>N</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>NeraAdmin</span>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Employee Sign In</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Enter your work email and password to continue</p>
            </div>

            {error && (
              <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 13 }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Work Email</label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><Mail size={17} /></div>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required style={inputStyle} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Password / Employee ID</label>
                <div style={{ position: "relative" }}>
                  <div style={iconWrap}><Lock size={17} /></div>
                  <input type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Password or Employee ID" required style={{ ...inputStyle, paddingLeft: 44, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShow(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
                  First time? Use your Employee ID as your password.
                </p>
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "11px 16px", borderRadius: 10,
                color: "#fff", fontWeight: 600, fontSize: 14, border: "none",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: "var(--accent)", transition: "all 0.2s", marginTop: 8,
              }}>
                {loading
                  ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
                  : <><LogIn size={16} /> Sign In</>}
              </button>
            </form>

            <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
              Admin?{" "}
              <a href="/login" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Admin Portal</a>
              {" · "}
              <a href="/finance/login" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Finance Portal</a>
            </p>
          </div>

          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
            NeraAdmin v1.0 — Employee Self-Service Portal
          </p>
        </div>
      </div>

      <style>{`
        @media(min-width: 1024px) {
          .ep-left-panel { display: flex !important; }
          .ep-mobile-brand { display: none !important; }
        }
      `}</style>
    </div>
  );
}
