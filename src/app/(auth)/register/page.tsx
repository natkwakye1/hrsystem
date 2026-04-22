"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed."); setLoading(false); return; }
      router.push("/dashboard");
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", paddingLeft: 44, paddingRight: 16, paddingTop: 11, paddingBottom: 11,
    borderRadius: 10, border: "1px solid var(--border)", backgroundColor: "var(--bg-input)",
    color: "var(--text-primary)", fontSize: 14, transition: "all 0.2s",
  };
  const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-primary)", marginBottom: 6 };
  const iconWrap: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--icon-color)" };

  return (
    <div className="animate-fade-in">
      <div style={{ display: "block", marginBottom: 28, textAlign: "center" }} className="lg:hidden">
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--accent)" }}>
            <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>N</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "var(--text-primary)" }}>NeraAdmin</span>
        </div>
      </div>

      <div style={{ backgroundColor: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-card)", padding: "28px 32px", border: "1px solid var(--border)" }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Create Account</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 13 }}>Fill in your details to get started with NeraAdmin</p>
        </div>

        {error && (
          <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, backgroundColor: "var(--danger-light)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 13 }}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Full Name</label>
            <div style={{ position: "relative" }}>
              <div style={iconWrap}><User size={17} /></div>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email</label>
            <div style={{ position: "relative" }}>
              <div style={iconWrap}><Mail size={17} /></div>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inputStyle} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <div style={iconWrap}><Lock size={17} /></div>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" required minLength={6} style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Confirm Password</label>
            <div style={{ position: "relative" }}>
              <div style={iconWrap}><Lock size={17} /></div>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" required minLength={6} style={{ ...inputStyle, paddingRight: 44 }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--icon-color)", padding: 0, display: "flex" }}>
                {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", marginBottom: 20 }}>
            <input type="checkbox" required style={{ width: 15, height: 15, marginTop: 2, cursor: "pointer" }} />
            <span style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>
              By creating an account, you agree to the{" "}
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>Terms of Service</span> and{" "}
              <span style={{ color: "var(--accent)", fontWeight: 500 }}>Privacy Policy</span>
            </span>
          </label>

          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px 16px", borderRadius: 10,
            color: "#fff", fontWeight: 600, fontSize: 14, border: "none",
            cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: "var(--accent)", transition: "all 0.2s",
          }}>
            {loading ? (
              <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Creating account...</>
            ) : (
              <><UserPlus size={16} /> Create Account</>
            )}
          </button>
        </form>

        <p style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ fontWeight: 600, color: "var(--accent)", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>

      <p style={{ marginTop: 20, textAlign: "center", fontSize: 11, color: "var(--text-muted)" }}>
        NeraAdmin v1.0 - Human Capital Management & Payroll System
      </p>
    </div>
  );
}
