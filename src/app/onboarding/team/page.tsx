"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Users, Wallet, ChevronRight, CheckCircle2,
  Loader2, Mail, User, X, Plus, Copy, Check,
  Building2, ArrowRight,
} from "lucide-react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";

const B = {
  900:"#1e3a8a", 800:"#1e40af", 700:"#1d4ed8", 600:"#2563eb", 500:"#3b82f6",
  400:"#60a5fa", 300:"#93c5fd", 200:"#bfdbfe", 100:"#dbeafe", 50:"#eff6ff",
};

interface AddedUser { name: string; email: string; role: string }

function TeamSetupContent() {
  const router = useRouter();
  const params = useSearchParams();
  const companyName = params.get("company") || "Your Company";
  const domain      = params.get("domain")  || "";
  const slug        = params.get("slug")    || "";

  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [added,      setAdded]      = useState<AddedUser[]>([]);
  const [activeForm, setActiveForm] = useState<"finance"|"employee"|null>(null);
  const [form,       setForm]       = useState({ name: "", personalEmail: "" });
  const [copied,     setCopied]     = useState<string|null>(null);

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  function previewEmail(name: string) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
    const last  = parts[parts.length-1]?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";
    return parts.length >= 2 ? `${first}.${last}@${domain}` : `${first}@${domain}`;
  }

  function copyUrl(url: string, key: string) {
    navigator.clipboard.writeText(url).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  async function handleAdd() {
    if (!form.name.trim() || !activeForm) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/add-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, role: activeForm, personalEmail: form.personalEmail }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to create account."); return; }
      setAdded(prev => [...prev, { name: form.name, email: data.workEmail, role: activeForm! }]);
      setForm({ name: "", personalEmail: "" });
      setActiveForm(null);
    } catch { setError("Network error. Please try again."); }
    finally   { setLoading(false); }
  }

  const origin  = typeof window !== "undefined" ? window.location.origin : "";
  const loginUrl = `${origin}/${slug}/login`;

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px 10px 36px", borderRadius: 10,
    border: `1.5px solid #e2e8f0`, background: "#f8fafc",
    color: "#0f172a", fontSize: 13, outline: "none",
    fontFamily: "Poppins,sans-serif", boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin:0; background:#f1f5f9; }
        .role-btn:hover { border-color:${B[300]} !important; background:${B[50]} !important; }
        .copy-btn:hover { background:rgba(255,255,255,0.25) !important; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fade-up { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ display:"flex", minHeight:"100vh", fontFamily:"Poppins,sans-serif" }}>

        {/* ── Left panel (desktop) ── */}
        <div style={{ width:500, flexShrink:0, display:"none", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" }}
          className="left-panel">
          <style>{`.left-panel{display:none!important} @media(min-width:1024px){.left-panel{display:flex!important}}`}</style>
          <img
            src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80&fit=crop&crop=faces"
            alt=""
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
          />
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, rgba(15,23,42,0.82) 0%, rgba(30,58,138,0.70) 100%)" }}/>

          {/* Top */}
          <div style={{ position:"relative", zIndex:10, padding:"44px 40px 0" }}>
            {/* Logo */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:40 }}>
              <div style={{ width:38, height:38, borderRadius:11, background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)", border:"1px solid rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Users size={17} color="#fff"/>
              </div>
              <div>
                <p style={{ margin:0, fontSize:14, fontWeight:800, color:"#fff", letterSpacing:1.5, textTransform:"uppercase" }}>NERA</p>
                <p style={{ margin:0, fontSize:9, fontWeight:600, color:"rgba(255,255,255,0.55)", letterSpacing:3, textTransform:"uppercase" }}>ADMIN</p>
              </div>
            </div>

            {/* Company chip */}
            <div style={{ display:"inline-flex", alignItems:"center", gap:9, background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,0.18)", borderRadius:10, padding:"9px 14px", marginBottom:30 }}>
              <Building2 size={14} color="rgba(255,255,255,0.7)"/>
              <div>
                <p style={{ margin:0, fontSize:11, fontWeight:700, color:"#fff", letterSpacing:-0.2 }}>{companyName}</p>
                {domain && <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.55)" }}>@{domain}</p>}
              </div>
            </div>

            <h1 style={{ color:"#fff", fontSize:30, fontWeight:800, lineHeight:1.22, margin:"0 0 14px", letterSpacing:-0.6 }}>
              Build your<br/>team today
            </h1>
            <p style={{ color:"rgba(255,255,255,0.68)", fontSize:13.5, lineHeight:1.8, maxWidth:340, margin:0 }}>
              Add team members now. Everyone receives their login credentials automatically — no manual setup required.
            </p>
          </div>

          {/* Bottom checklist */}
          <div style={{ position:"relative", zIndex:10, padding:"0 40px 44px" }}>
            <div style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.13)", borderRadius:14, padding:"18px 20px", display:"flex", flexDirection:"column", gap:11 }}>
              {[
                "Work email auto-generated from name",
                "Credentials delivered instantly by email",
                "Admin controls all user access",
              ].map(t => (
                <div key={t} style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:20, height:20, borderRadius:6, background:"rgba(255,255,255,0.15)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <CheckCircle2 size={11} color={B[300]}/>
                  </div>
                  <span style={{ fontSize:12.5, color:"rgba(255,255,255,0.78)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 20px", background:"#f1f5f9" }}>
          <div style={{ width:"100%", maxWidth:500 }}>

            {/* Mobile logo */}
            <div style={{ textAlign:"center", marginBottom:24 }} className="mob-logo">
              <style>{`.mob-logo{display:block!important} @media(min-width:1024px){.mob-logo{display:none!important}}`}</style>
              <div style={{ display:"inline-flex", alignItems:"center", gap:10 }}>
                <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(145deg,${B[900]},${B[600]})`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Users size={16} color="#fff"/>
                </div>
                <div style={{ textAlign:"left" }}>
                  <p style={{ margin:0, fontSize:12, fontWeight:800, color:B[900], letterSpacing:2, textTransform:"uppercase" }}>NERA</p>
                  <p style={{ margin:0, fontSize:8.5, fontWeight:600, color:B[400], letterSpacing:3, textTransform:"uppercase" }}>ADMIN</p>
                </div>
              </div>
            </div>

            {/* Portal URL cards */}
            {slug && (
              <div style={{ marginBottom:16, background:"#fff", borderRadius:14, border:`1px solid ${B[100]}`, padding:"16px 18px", boxShadow:"0 1px 8px rgba(30,58,138,0.06)" }}>
                <p style={{ margin:"0 0 10px", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>Share portal links with your team</p>
                {[
                  { label:"Admin Portal",    url: loginUrl },
                  { label:"Finance Portal",  url: loginUrl },
                  { label:"Employee Portal", url: loginUrl },
                ].map(({ label, url }) => (
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:9, background:B[50], border:`1px solid ${B[100]}`, marginBottom:6 }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ margin:0, fontSize:9.5, fontWeight:700, color:B[500], textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</p>
                      <p style={{ margin:"1px 0 0", fontSize:11.5, fontWeight:500, color:B[800], overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{url}</p>
                    </div>
                    <button
                      className="copy-btn"
                      onClick={() => copyUrl(url, label)}
                      style={{ flexShrink:0, width:28, height:28, borderRadius:7, border:`1px solid ${B[200]}`, background:copied===label ? B[100] : "#fff", color: copied===label ? B[600] : "#94a3b8", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.15s" }}
                    >
                      {copied===label ? <Check size={11}/> : <Copy size={11}/>}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Main card */}
            <div style={{ background:"#fff", borderRadius:16, boxShadow:"0 2px 24px rgba(30,58,138,0.07), 0 1px 6px rgba(0,0,0,0.04)", border:"1px solid #e2e8f0", padding:"28px 28px 24px", fontFamily:"Poppins,sans-serif" }}>

              {/* Header */}
              <div style={{ marginBottom:22 }}>
                <h2 style={{ margin:0, fontSize:19, fontWeight:800, color:"#0f172a", letterSpacing:-0.4 }}>Add team members</h2>
                <p style={{ margin:"5px 0 0", fontSize:12.5, color:"#64748b", lineHeight:1.6 }}>
                  Add finance and employee accounts.{domain && <> Work emails end in <strong style={{ color:B[700] }}>@{domain}</strong>.</>}
                </p>
              </div>

              {/* Error */}
              {error && (
                <div style={{ marginBottom:16, padding:"10px 14px", borderRadius:10, background:"#fef2f2", border:"1px solid rgba(239,68,68,0.2)", color:"#dc2626", fontSize:12.5, fontWeight:500 }}>
                  {error}
                </div>
              )}

              {/* Added users */}
              {added.length > 0 && (
                <div style={{ marginBottom:18 }}>
                  <p style={{ margin:"0 0 9px", fontSize:10, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.08em" }}>Added ({added.length})</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
                    {added.map((u, i) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"9px 13px", borderRadius:10, background:B[50], border:`1px solid ${B[100]}`, animation:"fade-up 0.2s ease" }}>
                        <div style={{ width:30, height:30, borderRadius:8, background: u.role==="finance" ? B[100] : B[50], border:`1px solid ${B[200]}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          {u.role==="finance" ? <Wallet size={13} color={B[700]}/> : <Users size={13} color={B[700]}/>}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:12.5, fontWeight:700, color:"#0f172a" }}>{u.name}</p>
                          <p style={{ margin:0, fontSize:11, color:B[500] }}>{u.email}</p>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 9px", borderRadius:20, background: u.role==="finance" ? B[100] : B[50], color:B[700], border:`1px solid ${B[200]}` }}>
                          {u.role==="finance" ? "Finance" : "Employee"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Role selector */}
              {!activeForm && (
                <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:20 }}>
                  {([
                    { role:"finance"  as const, icon:Wallet, label:"Add Finance Member",    sub:"Payroll, budgets, financial reports" },
                    { role:"employee" as const, icon:Users,  label:"Add Employee",           sub:"Leave, payslips, HR portal access"  },
                  ]).map(({ role, icon:Icon, label, sub }) => (
                    <button
                      key={role}
                      className="role-btn"
                      onClick={() => setActiveForm(role)}
                      style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 15px", borderRadius:12, border:"1.5px solid #e2e8f0", background:"#f8fafc", cursor:"pointer", textAlign:"left", transition:"all 0.15s", width:"100%" }}
                    >
                      <div style={{ width:38, height:38, borderRadius:10, background:B[100], border:`1px solid ${B[200]}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <Icon size={16} color={B[700]}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ margin:0, fontSize:13, fontWeight:700, color:"#0f172a" }}>{label}</p>
                        <p style={{ margin:"2px 0 0", fontSize:11.5, color:"#64748b" }}>{sub}</p>
                      </div>
                      <Plus size={15} color="#94a3b8"/>
                    </button>
                  ))}
                </div>
              )}

              {/* Add form */}
              {activeForm && (
                <div style={{ border:`1.5px solid ${B[200]}`, borderRadius:13, padding:"16px 17px", marginBottom:20, background:B[50] }}>
                  {/* Form header */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:B[100], border:`1px solid ${B[200]}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {activeForm==="finance" ? <Wallet size={13} color={B[700]}/> : <Users size={13} color={B[700]}/>}
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:B[800] }}>
                        New {activeForm==="finance" ? "Finance Member" : "Employee"}
                      </span>
                    </div>
                    <button
                      onClick={() => { setActiveForm(null); setForm({ name:"", personalEmail:"" }); setError(""); }}
                      style={{ width:26, height:26, borderRadius:7, border:"1px solid #e2e8f0", background:"#fff", cursor:"pointer", color:"#94a3b8", display:"flex", alignItems:"center", justifyContent:"center" }}
                    >
                      <X size={13}/>
                    </button>
                  </div>

                  <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
                    {/* Name */}
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>Full Name *</label>
                      <div style={{ position:"relative" }}>
                        <div style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#94a3b8" }}><User size={13}/></div>
                        <input
                          style={inp}
                          placeholder="e.g. Jane Smith"
                          value={form.name}
                          onChange={e => set("name", e.target.value)}
                          onKeyDown={e => e.key==="Enter" && handleAdd()}
                          autoFocus
                        />
                      </div>
                      {form.name.trim() && domain && (
                        <p style={{ margin:"4px 0 0", fontSize:11, color:B[600], fontWeight:500 }}>
                          Work email: <strong>{previewEmail(form.name)}</strong>
                        </p>
                      )}
                    </div>

                    {/* Personal email */}
                    <div>
                      <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#64748b", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.07em" }}>Personal Email <span style={{ textTransform:"none", fontWeight:400 }}>(optional — for credential delivery)</span></label>
                      <div style={{ position:"relative" }}>
                        <div style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"#94a3b8" }}><Mail size={13}/></div>
                        <input
                          style={inp}
                          type="email"
                          placeholder="personal@gmail.com"
                          value={form.personalEmail}
                          onChange={e => set("personalEmail", e.target.value)}
                        />
                      </div>
                      <p style={{ margin:"3px 0 0", fontSize:11, color:"#94a3b8" }}>Leave blank to send credentials to their work email.</p>
                    </div>

                    <button
                      onClick={handleAdd}
                      disabled={loading || !form.name.trim()}
                      style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7, padding:"11px 18px", borderRadius:10, border:"none", cursor: (loading||!form.name.trim()) ? "not-allowed" : "pointer", background: (!form.name.trim()) ? "#e2e8f0" : `linear-gradient(135deg,${B[700]},${B[500]})`, color: (!form.name.trim()) ? "#94a3b8" : "#fff", fontSize:13, fontWeight:700, transition:"all 0.15s", boxShadow: form.name.trim() ? `0 4px 12px ${B[300]}` : "none", opacity: loading ? 0.75 : 1 }}
                    >
                      {loading
                        ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Creating…</>
                        : <>Create Account &amp; Send Credentials <ArrowRight size={13}/></>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* Footer CTA */}
              <div style={{ paddingTop:16, borderTop:"1px solid #e2e8f0", display:"flex", flexDirection:"column", gap:9 }}>
                <button
                  onClick={() => router.push(slug ? `/${slug}/admin` : "/employees")}
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"13px", borderRadius:11, border:"none", cursor:"pointer", background:`linear-gradient(135deg,${B[700]},${B[500]})`, color:"#fff", fontSize:13.5, fontWeight:700, boxShadow:`0 4px 14px ${B[300]}` }}
                >
                  {added.length > 0 ? <><CheckCircle2 size={15}/> Done — Go to Admin Portal</> : <>Skip — Go to Admin Portal <ChevronRight size={15}/></>}
                </button>
                {added.length === 0 && (
                  <p style={{ textAlign:"center", fontSize:11.5, color:"#94a3b8", margin:0 }}>
                    You can add team members anytime from the admin portal.
                  </p>
                )}
              </div>
            </div>

            <p style={{ marginTop:16, textAlign:"center", fontSize:11, color:"#94a3b8" }}>
              NeraAdmin · Human Capital Management &amp; Payroll System
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TeamSetupPage() {
  return (
    <Suspense>
      <TeamSetupContent/>
    </Suspense>
  );
}
