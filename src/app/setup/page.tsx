"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Users, Shield, CheckCircle2,
  Plus, X, ChevronRight, ArrowLeft, Sparkles,
  Briefcase, Code2, Megaphone, Calculator,
  HeartPulse, ShoppingCart, Truck, Headphones,
} from "lucide-react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";

const B = {
  900:"#1e3a8a",800:"#1e40af",700:"#1d4ed8",600:"#2563eb",500:"#3b82f6",
  400:"#60a5fa",300:"#93c5fd",200:"#bfdbfe",100:"#dbeafe",50:"#eff6ff",
};

const PRESET_DEPTS = [
  { name: "Engineering",        icon: Code2 },
  { name: "Human Resources",    icon: Users },
  { name: "Finance",            icon: Calculator },
  { name: "Marketing",          icon: Megaphone },
  { name: "Sales",              icon: ShoppingCart },
  { name: "Operations",         icon: Truck },
  { name: "Customer Support",   icon: Headphones },
  { name: "Health & Safety",    icon: HeartPulse },
  { name: "Product",            icon: Briefcase },
];

const STEPS = [
  { id: 1, label: "Welcome",     icon: Sparkles },
  { id: 2, label: "Departments", icon: Building2 },
  { id: 3, label: "Permissions", icon: Shield },
  { id: 4, label: "Done",        icon: CheckCircle2 },
];

type Perms = {
  employeeLeave: boolean; employeePayslips: boolean; employeeProfile: boolean;
  employeeRequests: boolean; employeeBenefits: boolean;
  financePayroll: boolean; financeBudgets: boolean; financeReports: boolean;
};

const DEFAULT_PERMS: Perms = {
  employeeLeave: true, employeePayslips: true, employeeProfile: true,
  employeeRequests: true, employeeBenefits: true,
  financePayroll: true, financeBudgets: true, financeReports: true,
};

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [departments, setDepts] = useState<string[]>([]);
  const [deptInput, setDeptInput]   = useState("");
  const [deptError, setDeptError]   = useState("");
  const [perms, setPerms]       = useState<Perms>(DEFAULT_PERMS);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.replace("/login"); return; }
        if (d.user.role !== "admin") { router.replace("/login"); return; }
        if (d.isOnboarded === true) { router.replace("/employees"); return; }
        if (d.user.name) setCompanyName(d.user.name);
      })
      .catch(() => router.replace("/login"));
  }, [router]);

  useEffect(() => {
    if (step === 2) inputRef.current?.focus();
  }, [step]);

  function addDept(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (departments.map(d => d.toLowerCase()).includes(trimmed.toLowerCase())) {
      setDeptError("Already added");
      return;
    }
    setDepts(prev => [...prev, trimmed]);
    setDeptInput("");
    setDeptError("");
  }

  function removeDept(name: string) {
    setDepts(prev => prev.filter(d => d !== name));
  }

  async function saveDepartments() {
    for (const name of departments) {
      await fetch("/api/company/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
    }
  }

  async function finish() {
    setSaving(true);
    setError("");
    try {
      await saveDepartments();
      const res = await fetch("/api/company/complete-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: perms }),
      });
      if (!res.ok) throw new Error("Setup failed");
      setStep(4);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  /* ─── Shared card style ─── */
  const card: React.CSSProperties = {
    background: "#fff",
    borderRadius: 20,
    boxShadow: "0 2px 40px rgba(30,58,138,0.08), 0 1px 8px rgba(0,0,0,0.05)",
    border: "1px solid #e2e8f0",
    padding: "40px 44px",
    width: "100%",
    maxWidth: 580,
    fontFamily: "Poppins, sans-serif",
  };

  /* ─── Toggle row ─── */
  function ToggleRow({ label, sub, checked, onChange }: {
    label: string; sub: string; checked: boolean; onChange: (v: boolean) => void;
  }) {
    return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 14px", borderRadius:10, background: checked ? B[50] : "#f8fafc", border:`1px solid ${checked ? B[200] : "#e2e8f0"}`, marginBottom:8, transition:"all 0.15s" }}>
        <div>
          <p style={{ margin:0, fontSize:13, fontWeight:600, color: checked ? B[800] : "#374151" }}>{label}</p>
          <p style={{ margin:"2px 0 0", fontSize:11, color:"#6b7280" }}>{sub}</p>
        </div>
        <button
          onClick={() => onChange(!checked)}
          style={{ width:42, height:24, borderRadius:12, background: checked ? B[600] : "#d1d5db", border:"none", cursor:"pointer", position:"relative", transition:"background 0.18s", flexShrink:0 }}
        >
          <span style={{ position:"absolute", top:3, left: checked ? 21 : 3, width:18, height:18, borderRadius:"50%", background:"#fff", transition:"left 0.18s", boxShadow:"0 1px 4px rgba(0,0,0,0.18)" }}/>
        </button>
      </div>
    );
  }

  /* ─── Step indicator ─── */
  const StepBar = () => (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:36 }}>
      {STEPS.map((s, i) => {
        const done  = step > s.id;
        const active = step === s.id;
        return (
          <div key={s.id} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length-1 ? 1 : "unset" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{
                width:34, height:34, borderRadius:"50%",
                background: done ? B[600] : active ? B[600] : "#e2e8f0",
                color: done||active ? "#fff" : "#9ca3af",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, flexShrink:0,
                boxShadow: active ? `0 0 0 4px ${B[100]}` : "none",
                transition:"all 0.2s",
              }}>
                {done ? <CheckCircle2 size={16}/> : <s.icon size={14}/>}
              </div>
              <span style={{ fontSize:10, fontWeight: active?700:500, color: active?B[700]:"#9ca3af", whiteSpace:"nowrap" }}>{s.label}</span>
            </div>
            {i < STEPS.length-1 && (
              <div style={{ flex:1, height:2, background: done ? B[400] : "#e2e8f0", margin:"0 6px", marginBottom:18, transition:"background 0.2s" }}/>
            )}
          </div>
        );
      })}
    </div>
  );

  /* ─── Step 1: Welcome ─── */
  if (step === 1) return (
    <Page>
      <div style={card}>
        <StepBar/>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:18, background:`linear-gradient(145deg,${B[800]},${B[500]})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            <Sparkles size={28} color="#fff"/>
          </div>
          <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>Welcome to NeraAdmin</h1>
          <p style={{ margin:"10px 0 0", fontSize:14, color:"#64748b", lineHeight:1.6 }}>
            Let's get your workspace configured so your team can start on day one.
          </p>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:32 }}>
          {[
            { icon: Building2, title: "Set up departments",      sub: "Organise your team structure", required: true  },
            { icon: Shield,    title: "Configure portal access", sub: "Control what staff can see",   required: false },
          ].map(({ icon: Icon, title, sub, required }) => (
            <div key={title} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, background:B[50], border:`1px solid ${B[100]}` }}>
              <div style={{ width:38, height:38, borderRadius:10, background:B[100], border:`1px solid ${B[200]}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={16} color={B[700]}/>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ margin:0, fontSize:13, fontWeight:700, color:B[900] }}>{title}</p>
                <p style={{ margin:"2px 0 0", fontSize:11.5, color:"#64748b" }}>{sub}</p>
              </div>
              {required
                ? <span style={{ fontSize:10, fontWeight:700, color:B[700], background:B[100], padding:"2px 8px", borderRadius:20 }}>Required</span>
                : <span style={{ fontSize:10, fontWeight:600, color:"#94a3b8", background:"#f1f5f9", padding:"2px 8px", borderRadius:20 }}>Optional</span>
              }
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep(2)}
          style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${B[700]},${B[500]})`, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 4px 14px ${B[300]}` }}
        >
          Let&apos;s Get Started <ChevronRight size={16}/>
        </button>
      </div>
    </Page>
  );

  /* ─── Step 2: Departments ─── */
  if (step === 2) return (
    <Page>
      <div style={card}>
        <StepBar/>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:-0.4 }}>Add your departments</h2>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"#64748b" }}>
            At least one department is required. Employees will be assigned to these.
          </p>
        </div>

        {/* Input row */}
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <input
            ref={inputRef}
            value={deptInput}
            onChange={e => { setDeptInput(e.target.value); setDeptError(""); }}
            onKeyDown={e => e.key === "Enter" && addDept(deptInput)}
            placeholder="e.g. Legal, R&D, Procurement…"
            style={{ flex:1, padding:"10px 14px", borderRadius:10, border:`1.5px solid ${deptError ? "#ef4444" : "#e2e8f0"}`, fontSize:13, fontFamily:"Poppins,sans-serif", outline:"none", color:"#0f172a" }}
          />
          <button
            onClick={() => addDept(deptInput)}
            style={{ padding:"10px 18px", borderRadius:10, border:"none", background:B[600], color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}
          >
            <Plus size={14}/> Add
          </button>
        </div>
        {deptError && <p style={{ margin:"-10px 0 10px", fontSize:11.5, color:"#ef4444" }}>{deptError}</p>}

        {/* Presets */}
        <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Quick add</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:7, marginBottom:20 }}>
          {PRESET_DEPTS.map(({ name, icon: Icon }) => {
            const added = departments.map(d=>d.toLowerCase()).includes(name.toLowerCase());
            return (
              <button
                key={name}
                onClick={() => !added && addDept(name)}
                disabled={added}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", borderRadius:20, border:`1px solid ${added ? B[200] : "#e2e8f0"}`, background: added ? B[50] : "#f8fafc", color: added ? B[600] : "#374151", fontSize:11.5, fontWeight:500, cursor: added?"default":"pointer", transition:"all 0.15s", opacity: added ? 0.8 : 1 }}
              >
                <Icon size={11}/> {name}
                {added && <CheckCircle2 size={10} color={B[500]}/>}
              </button>
            );
          })}
        </div>

        {/* Added list */}
        {departments.length > 0 && (
          <div style={{ marginBottom:24 }}>
            <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:600, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Added ({departments.length})</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>
              {departments.map(d => (
                <span key={d} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 12px", borderRadius:20, background:B[100], border:`1px solid ${B[200]}`, fontSize:12, fontWeight:600, color:B[800] }}>
                  {d}
                  <button onClick={() => removeDept(d)} style={{ background:"none", border:"none", cursor:"pointer", color:B[500], padding:0, display:"flex", alignItems:"center", marginLeft:2 }}><X size={11}/></button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={() => setStep(1)}
            style={{ padding:"12px 20px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
          >
            <ArrowLeft size={14}/> Back
          </button>
          <button
            onClick={() => {
              if (departments.length === 0) { setDeptError("Add at least one department to continue"); return; }
              setStep(3);
            }}
            style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background: departments.length > 0 ? `linear-gradient(135deg,${B[700]},${B[500]})` : "#e2e8f0", color: departments.length > 0 ? "#fff" : "#9ca3af", fontSize:13, fontWeight:700, cursor: departments.length > 0 ? "pointer" : "not-allowed", display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"all 0.2s", boxShadow: departments.length > 0 ? `0 4px 14px ${B[300]}` : "none" }}
          >
            Continue <ChevronRight size={15}/>
          </button>
        </div>
        {deptError && departments.length === 0 && <p style={{ margin:"8px 0 0", fontSize:11.5, color:"#ef4444", textAlign:"center" }}>{deptError}</p>}
      </div>
    </Page>
  );

  /* ─── Step 3: Permissions ─── */
  if (step === 3) return (
    <Page>
      <div style={card}>
        <StepBar/>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:-0.4 }}>Configure portal access</h2>
          <p style={{ margin:"6px 0 0", fontSize:13, color:"#64748b" }}>
            Choose what your employees and finance team can access. You can change this anytime in Settings.
          </p>
        </div>

        <div style={{ marginBottom:20 }}>
          <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Employee Portal</p>
          <ToggleRow label="Leave Requests"    sub="Employees can submit and track leave"         checked={perms.employeeLeave}     onChange={v=>setPerms(p=>({...p,employeeLeave:v}))}/>
          <ToggleRow label="Payslips"          sub="Employees can view their payslips"            checked={perms.employeePayslips}  onChange={v=>setPerms(p=>({...p,employeePayslips:v}))}/>
          <ToggleRow label="Profile"           sub="Employees can update their own profile"       checked={perms.employeeProfile}   onChange={v=>setPerms(p=>({...p,employeeProfile:v}))}/>
          <ToggleRow label="HR Requests"       sub="Employees can raise HR requests"              checked={perms.employeeRequests}  onChange={v=>setPerms(p=>({...p,employeeRequests:v}))}/>
          <ToggleRow label="Benefits"          sub="Employees can view their benefits"            checked={perms.employeeBenefits}  onChange={v=>setPerms(p=>({...p,employeeBenefits:v}))}/>
        </div>

        <div style={{ marginBottom:28 }}>
          <p style={{ margin:"0 0 10px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.07em" }}>Finance Portal</p>
          <ToggleRow label="Payroll Management" sub="Finance can process and view payroll"       checked={perms.financePayroll}    onChange={v=>setPerms(p=>({...p,financePayroll:v}))}/>
          <ToggleRow label="Budget Reports"     sub="Finance can access budget and reports"      checked={perms.financeBudgets}    onChange={v=>setPerms(p=>({...p,financeBudgets:v}))}/>
          <ToggleRow label="Finance Reports"    sub="Finance can generate payroll reports"       checked={perms.financeReports}    onChange={v=>setPerms(p=>({...p,financeReports:v}))}/>
        </div>

        {error && <p style={{ margin:"-12px 0 12px", fontSize:12, color:"#ef4444", textAlign:"center" }}>{error}</p>}

        <div style={{ display:"flex", gap:10 }}>
          <button
            onClick={() => setStep(2)}
            style={{ padding:"12px 20px", borderRadius:10, border:"1px solid #e2e8f0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:6 }}
          >
            <ArrowLeft size={14}/> Back
          </button>
          <button
            onClick={finish}
            disabled={saving}
            style={{ flex:1, padding:"12px", borderRadius:10, border:"none", background:`linear-gradient(135deg,${B[700]},${B[500]})`, color:"#fff", fontSize:13, fontWeight:700, cursor: saving?"wait":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6, boxShadow:`0 4px 14px ${B[300]}`, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "Saving…" : <><CheckCircle2 size={15}/> Finish Setup</>}
          </button>
        </div>
        <p style={{ margin:"16px 0 0", fontSize:11.5, color:"#94a3b8", textAlign:"center" }}>
          You can skip and use defaults — everything can be changed in Settings later.
        </p>
      </div>
    </Page>
  );

  /* ─── Step 4: Done ─── */
  return (
    <Page>
      <div style={{ ...card, textAlign:"center" }}>
        <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(145deg,${B[600]},${B[400]})`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:`0 8px 24px ${B[200]}` }}>
          <CheckCircle2 size={34} color="#fff"/>
        </div>
        <h1 style={{ margin:0, fontSize:24, fontWeight:800, color:"#0f172a", letterSpacing:-0.5 }}>You&apos;re all set!</h1>
        <p style={{ margin:"10px 0 32px", fontSize:14, color:"#64748b", lineHeight:1.7 }}>
          Your workspace is configured and ready.<br/>
          Start by adding employees or inviting your team.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:8 }}>
          <button
            onClick={() => router.replace("/employees")}
            style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:`linear-gradient(135deg,${B[700]},${B[500]})`, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8, boxShadow:`0 4px 14px ${B[300]}` }}
          >
            <Users size={16}/> Go to Employees
          </button>
          <button
            onClick={() => router.replace("/settings")}
            style={{ width:"100%", padding:"13px", borderRadius:12, border:`1px solid ${B[200]}`, background:B[50], color:B[700], fontSize:13, fontWeight:600, cursor:"pointer" }}
          >
            Configure More Settings
          </button>
        </div>
      </div>
    </Page>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        * { box-sizing: border-box; }
        body { margin: 0; background: linear-gradient(135deg, ${B[50]} 0%, #f0f4ff 50%, ${B[50]} 100%); }
      `}</style>
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"32px 16px", fontFamily:"Poppins,sans-serif" }}>
        {children}
      </div>
    </>
  );
}
