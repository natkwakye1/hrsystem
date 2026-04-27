"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, Users, Info } from "lucide-react";

export default function EmployeeRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "", confirm: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ name: string } | null>(null);

  const inp: React.CSSProperties = {
    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const lbl: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 };
  const iconWrap: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--icon-color)" };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/portal/employee/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); return; }
      setSuccess({ name: data.user?.name ?? "there" });
      setTimeout(() => router.push("/employee-portal"), 2500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left panel */}
      <div className="ep-reg-left" style={{
        width: 520, flexDirection: "column", justifyContent: "space-between",
        position: "relative", overflow: "hidden", display: "none",
      }}>
        {/* Background image */}
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80&fit=crop"
          alt=""
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }}
        />
        {/* Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.38)" }} />

        <div style={{ position: "relative", zIndex: 10, padding: "48px 40px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={18} color="#fff" />
            </div>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>NeraAdmin</span>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 24px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <h1 style={{ color: "#fff", fontSize: 34, fontWeight: 800, lineHeight: 1.2, marginBottom: 18, letterSpacing: -0.5 }}>
            Set Up Your<br />Employee<br />Account
          </h1>
          <p style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, lineHeight: 1.8, maxWidth: 340 }}>
            Register with your work email to access payslips, submit leave, and manage your HR profile — all in one place.
          </p>
          <div style={{ marginTop: 32, display: "flex", flexDirection: "column", gap: 12 }}>
            {["View your payslips", "Submit leave requests", "Track your benefits", "Manage your profile"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={14} style={{ color: "rgba(255,255,255,0.75)", flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 10, padding: "0 40px 40px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, padding: "14px 16px" }}>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", margin: "0 0 3px" }}>Employee Portal</p>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 500, margin: 0 }}>Self-service HR access for your team</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "var(--bg-body)", padding: "40px 24px" }}>
        <div style={{ width: "100%", maxWidth: 460 }}>
          {/* Mobile brand */}
          <div className="ep-reg-mobile-brand" style={{ marginBottom: 28, textAlign: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
                <Users size={15} color="#fff" />
              </div>
              <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>NeraAdmin</span>
            </div>
          </div>

          <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>
            {success ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                  <CheckCircle2 size={28} style={{ color: "#2563eb" }} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", marginBottom: 8 }}>Welcome, {success.name}!</h2>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 4 }}>Your employee portal account is ready.</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Check your email for your credentials. Redirecting to your portal…</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Employee Registration</h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Use your official work email to register</p>
                </div>

                {/* Info box */}
                <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "var(--accent-light)", border: "1px solid var(--border)", display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <Info size={14} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, lineHeight: 1.6 }}>
                    Your email must match the address registered in your employee record by HR. Contact your HR admin if you have issues.
                  </p>
                </div>

                {error && (
                  <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 13 }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={lbl}>Work Email</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Mail size={16} /></div>
                      <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@company.com" style={inp} />
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Create Password</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Lock size={16} /></div>
                      <input type={show.password ? "text" : "password"} required minLength={6} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" style={{ ...inp, paddingRight: 44 }} />
                      <button type="button" onClick={() => setShow(s => ({ ...s, password: !s.password }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                        {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={lbl}>Confirm Password</label>
                    <div style={{ position: "relative" }}>
                      <div style={iconWrap}><Lock size={16} /></div>
                      <input type={show.confirm ? "text" : "password"} required value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} placeholder="Re-enter password" style={{ ...inp, paddingRight: 44 }} />
                      <button type="button" onClick={() => setShow(s => ({ ...s, confirm: !s.confirm }))} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                        {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} style={{ width: "100%", padding: "11px 16px", borderRadius: 10, color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "var(--accent)", marginTop: 4 }}>
                    {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating account…</> : "Create Employee Account"}
                  </button>
                </form>

                <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
                  Already registered?{" "}
                  <Link href="/employee-portal/login" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Sign in</Link>
                </p>
                <p style={{ marginTop: 6, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
                  Wrong portal?{" "}
                  <Link href="/get-started" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Choose portal</Link>
                </p>
              </>
            )}
          </div>
          <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
            NeraAdmin v1.0 — Employee Portal Registration
          </p>
        </div>
      </div>

      <style>{`
        @media(min-width: 1024px) {
          .ep-reg-left { display: flex !important; }
          .ep-reg-mobile-brand { display: none !important; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
