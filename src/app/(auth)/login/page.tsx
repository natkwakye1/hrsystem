"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Invalid credentials."); setLoading(false); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12,
    borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 14, transition: "all 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6,
  };

  const iconWrap: React.CSSProperties = {
    position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--icon-color)",
  };

  return (
    <div className="animate-fade-in">
      {/* Mobile brand */}
      <div style={{ display: "block", marginBottom: 28, textAlign: "center" }} className="lg:hidden">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>N</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>NeraAdmin</span>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Sign In</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Enter your credentials to access the dashboard</p>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 13 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Email</label>
            <div style={{ position: "relative" }}>
              <div style={iconWrap}><Mail size={17} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@hrsystem.com" required style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <div style={iconWrap}><Lock size={17} /></div>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required minLength={6} style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13, color: "var(--text-secondary)" }}>
              <input type="checkbox" style={{ width: 15, height: 15, cursor: "pointer" }} />
              Keep me logged in
            </label>
            <button type="button" style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)", background: "none", border: "none", cursor: "pointer" }}>
              Forgot password?
            </button>
          </div>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            color: "#fff", fontWeight: 600, fontSize: 14, border: "none",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "var(--accent)", transition: "all 0.2s",
          }}>
            {loading ? (
              <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</>
            ) : (
              <><LogIn size={16} /> Sign In</>
            )}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Don&apos;t have an account?{" "}
          <Link href="/register" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Create account</Link>
        </p>
      </div>

      <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
        NeraAdmin v1.0 - Human Capital Management & Payroll System
      </p>
    </div>
  );
}
