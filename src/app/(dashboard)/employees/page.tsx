"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, ChevronLeft, ChevronRight, Loader2, Users, Eye,
  User, Briefcase, CreditCard, Phone, FileText, CheckCircle2,
} from "lucide-react";
import Modal from "@/components/Modal";

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  Active:     { bg: BLUE[100], color: BLUE[700] },
  "On Leave": { bg: BLUE[50],  color: BLUE[500] },
  Terminated: { bg: BLUE[200], color: BLUE[900] },
  Probation:  { bg: BLUE[50],  color: BLUE[400] },
};

const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=80&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=80&q=80&fit=crop&crop=face",
];

function getAvatar(firstName: string, lastName: string): string {
  const key = `${firstName}${lastName}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

const DEPARTMENTS      = ["Engineering","Design","Marketing","Human Resources","Finance","Sales","Operations","Product","Legal","Support"];
const STATUS_OPTIONS   = ["Active","On Leave","Terminated","Probation"];
const EMP_TYPES        = ["Full-time","Part-time","Contract","Intern"];
const GENDERS          = ["Male","Female","Other"];
const MARITAL_STATUSES = ["Single","Married","Divorced","Widowed","Other"];
const ACCOUNT_TYPES    = ["Savings","Current","Checking"];
const RELATIONSHIPS    = ["Spouse","Parent","Sibling","Child","Friend","Other"];
const DOC_TYPES        = ["National ID","Passport","Driver's License","Tax Certificate","Work Permit","Education Certificate","Employment Contract","Other"];

interface Employee {
  id: string; employeeId: string;
  firstName: string; lastName: string;
  email: string; phone: string;
  department: string; position: string;
  status: string; employmentType: string;
  hireDate: string; salary: number; gender: string;
}

/* ── Wizard step forms ── */
interface PersonalForm   { firstName: string; lastName: string; email: string; phone: string; gender: string; dateOfBirth: string; maritalStatus: string; nationality: string; address: string; city: string; country: string; }
interface EmploymentForm { department: string; position: string; employmentType: string; salary: string; hireDate: string; status: string; }
interface BankForm       { bankName: string; accountNumber: string; accountType: string; branchName: string; routingNumber: string; isPrimary: boolean; skip: boolean; }
interface ContactForm    { name: string; relationship: string; phone: string; email: string; address: string; isPrimary: boolean; skip: boolean; }
interface DocumentForm   { title: string; type: string; fileUrl: string; expiryDate: string; skip: boolean; }

const INIT_PERSONAL:   PersonalForm   = { firstName:"",lastName:"",email:"",phone:"",gender:"",dateOfBirth:"",maritalStatus:"",nationality:"",address:"",city:"",country:"" };
const INIT_EMPLOYMENT: EmploymentForm = { department:"",position:"",employmentType:"Full-time",salary:"",hireDate:"",status:"Active" };
const INIT_BANK:       BankForm       = { bankName:"",accountNumber:"",accountType:"Savings",branchName:"",routingNumber:"",isPrimary:true,skip:false };
const INIT_CONTACT:    ContactForm    = { name:"",relationship:"Spouse",phone:"",email:"",address:"",isPrimary:true,skip:false };
const INIT_DOCUMENT:   DocumentForm   = { title:"",type:"National ID",fileUrl:"",expiryDate:"",skip:false };

function formatDate(d: string): string {
  if (!d) return "--";
  try { return new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }); }
  catch { return d; }
}

/* ── Shared styles ── */
const cardBase: React.CSSProperties = { background:"var(--bg-card)", borderRadius:14, border:"0.5px solid var(--border)" };
const inp: React.CSSProperties = { background:"var(--bg-input)", border:"0.5px solid var(--border)", color:"var(--text-primary)", borderRadius:8, fontSize:12, width:"100%", padding:"9px 12px", outline:"none", fontFamily:"'DM Sans',sans-serif", boxSizing:"border-box" };
const sel: React.CSSProperties = { ...inp, cursor:"pointer", appearance:"none" as const, backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat:"no-repeat", backgroundPosition:"right 10px center", paddingRight:28 };
const lbl: React.CSSProperties = { display:"block", fontSize:10, fontWeight:600, color:"var(--text-muted)", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:5 };
const grid2: React.CSSProperties = { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 };

/* ── Step indicator ── */
const STEPS = [
  { icon: User,        label: "Personal"   },
  { icon: Briefcase,   label: "Employment" },
  { icon: CreditCard,  label: "Bank"       },
  { icon: Phone,       label: "Contact"    },
  { icon: FileText,    label: "Documents"  },
];

function StepBar({ current }: { current: number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:0, marginBottom:24 }}>
      {STEPS.map((s, i) => {
        const done   = i < current;
        const active = i === current;
        const Icon   = s.icon;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{
                width:32, height:32, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center",
                background: done ? BLUE[600] : active ? BLUE[50] : "var(--bg-hover)",
                border: active ? `2px solid ${BLUE[600]}` : done ? `2px solid ${BLUE[600]}` : "2px solid var(--border)",
                transition:"all 0.2s",
              }}>
                {done
                  ? <CheckCircle2 size={14} color="#fff" />
                  : <Icon size={13} color={active ? BLUE[600] : "var(--text-muted)"} />
                }
              </div>
              <span style={{ fontSize:9, fontWeight:600, color: active ? BLUE[600] : done ? BLUE[600] : "var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{ flex:1, height:2, background: done ? BLUE[600] : "var(--border)", margin:"0 4px", marginBottom:18, transition:"background 0.2s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Skip toggle ── */
function SkipToggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", borderRadius:8, background:"var(--bg-hover)", border:"0.5px solid var(--border)", marginBottom:16 }}>
      <span style={{ fontSize:12, color:"var(--text-secondary)" }}>{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        style={{ fontSize:11, fontWeight:600, padding:"3px 12px", borderRadius:999, border:"none", cursor:"pointer", background: checked ? "var(--bg-hover)" : BLUE[50], color: checked ? "var(--text-muted)" : BLUE[600] }}
      >
        {checked ? "Add now" : "Skip for now"}
      </button>
    </div>
  );
}

/* ════════════════════════════════════════
   Page
════════════════════════════════════════ */
export default function EmployeesPage() {
  const router = useRouter();

  /* list state */
  const [employees,    setEmployees]    = useState<Employee[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [search,       setSearch]       = useState("");
  const [department,   setDepartment]   = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const limit = 15;

  /* wizard state */
  const [showModal,  setShowModal]  = useState(false);
  const [step,       setStep]       = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState("");
  const [createdId,  setCreatedId]  = useState<string | null>(null);

  const [personal,   setPersonal]   = useState<PersonalForm>(INIT_PERSONAL);
  const [employment, setEmployment] = useState<EmploymentForm>(INIT_EMPLOYMENT);
  const [bank,       setBank]       = useState<BankForm>(INIT_BANK);
  const [contact,    setContact]    = useState<ContactForm>(INIT_CONTACT);
  const [document,   setDocument]   = useState<DocumentForm>(INIT_DOCUMENT);

  /* ── fetch ── */
  const fetchEmployees = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams();
    if (search)       p.set("search",     search);
    if (department)   p.set("department", department);
    if (statusFilter) p.set("status",     statusFilter);
    p.set("page", String(page)); p.set("limit", String(limit));
    fetch(`/api/employees?${p}`)
      .then(r => r.json())
      .then(d => { setEmployees(d.employees||[]); setTotal(d.total||0); setTotalPages(d.pages||1); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, department, statusFilter, page]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { setPage(1); }, [search, department, statusFilter]);

  /* ── open / close wizard ── */
  const openModal = () => {
    setStep(0); setFormError(""); setCreatedId(null);
    setPersonal(INIT_PERSONAL); setEmployment(INIT_EMPLOYMENT);
    setBank(INIT_BANK); setContact(INIT_CONTACT); setDocument(INIT_DOCUMENT);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); };

  /* ── Step 0 → 1: create employee ── */
  const handlePersonalNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!personal.firstName.trim() || !personal.lastName.trim() || !personal.email.trim()) {
      setFormError("First name, last name and email are required."); return;
    }
    setStep(1);
  };

  /* ── Step 1 → 2: create employee record ── */
  const handleEmploymentNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/employees", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // personal
          firstName:     personal.firstName,
          lastName:      personal.lastName,
          email:         personal.email,
          phone:         personal.phone,
          gender:        personal.gender,
          dateOfBirth:   personal.dateOfBirth,
          maritalStatus: personal.maritalStatus,
          nationality:   personal.nationality,
          address:       personal.address,
          city:          personal.city,
          country:       personal.country,
          // employment
          department:     employment.department,
          position:       employment.position,
          employmentType: employment.employmentType,
          status:         employment.status,
          hireDate:       employment.hireDate,
          salary:         employment.salary ? parseFloat(employment.salary) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error || "Failed to create employee."); return; }
      setCreatedId(data.id);
      // Show assigned email if auto-generated
      if (data.assignedEmail && data.assignedEmail !== personal.email) {
        setFormError(`✓ Employee email set to: ${data.assignedEmail}. Credentials sent!`);
        setTimeout(() => setFormError(""), 5000);
      }
      setStep(2);
    } catch { setFormError("Network error. Please try again."); }
    finally  { setSubmitting(false); }
  };

  /* ── Step 2 → 3: bank account ── */
  const handleBankNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!bank.skip) {
      if (!bank.bankName.trim() || !bank.accountNumber.trim()) {
        setFormError("Bank name and account number are required."); return;
      }
      setSubmitting(true);
      try {
        await fetch(`/api/employees/${createdId}/bank-accounts`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bank),
        });
      } catch { /* non-blocking */ }
      finally { setSubmitting(false); }
    }
    setStep(3);
  };

  /* ── Step 3 → 4: emergency contact ── */
  const handleContactNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!contact.skip) {
      if (!contact.name.trim() || !contact.phone.trim()) {
        setFormError("Contact name and phone are required."); return;
      }
      setSubmitting(true);
      try {
        await fetch(`/api/employees/${createdId}/contacts`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...contact, category: "Emergency" }),
        });
      } catch { /* non-blocking */ }
      finally { setSubmitting(false); }
    }
    setStep(4);
  };

  /* ── Step 4: documents → finish ── */
  const handleDocumentFinish = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!document.skip) {
      if (!document.title.trim()) {
        setFormError("Document title is required."); return;
      }
      setSubmitting(true);
      try {
        await fetch(`/api/employees/${createdId}/documents`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(document),
        });
      } catch { /* non-blocking */ }
      finally { setSubmitting(false); }
    }
    closeModal();
    fetchEmployees();
  };

  const startEntry = total === 0 ? 0 : (page - 1) * limit + 1;
  const endEntry   = Math.min(page * limit, total);

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .emp-list * { font-family: 'DM Sans', sans-serif !important; }
        .emp-row:hover  { background: var(--bg-hover) !important; }
        .view-btn:hover { background: ${BLUE[50]} !important; color: ${BLUE[600]} !important; border-color: ${BLUE[200]} !important; }
        .add-btn:hover  { opacity: 0.85; }
        .pg-btn:hover   { background: var(--bg-hover) !important; }
        .emp-list {
          --bg-card:#ffffff; --bg-hover:#f8fafc; --bg-input:#f8fafc;
          --border:rgba(0,0,0,0.08);
          --text-primary:#0f172a; --text-secondary:#64748b; --text-muted:#94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .emp-list {
            --bg-card:#0f172a; --bg-hover:#1e293b; --bg-input:#1e293b;
            --border:rgba(255,255,255,0.08);
            --text-primary:#f1f5f9; --text-secondary:#94a3b8; --text-muted:#475569;
          }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .skeleton { background:var(--border); animation:pulse 1.4s ease-in-out infinite; border-radius:8px; }
        @media(max-width:900px)  { .col-dept  { display:none !important; } }
        @media(max-width:1100px) { .col-pos   { display:none !important; } }
        @media(max-width:1280px) { .col-hired { display:none !important; } }
      `}</style>

      <div className="emp-list animate-fade-in" style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:14 }}>
          <div>
            <p style={{ fontSize:10, fontWeight:600, color:"var(--text-muted)", letterSpacing:"0.07em", textTransform:"uppercase", margin:"0 0 3px" }}>HR Management</p>
            <h1 style={{ fontSize:22, fontWeight:600, color:"var(--text-primary)", margin:0, letterSpacing:-0.5 }}>Employees</h1>
          </div>
          <button className="add-btn" onClick={openModal} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 16px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", transition:"opacity 0.15s" }}>
            <Plus size={14} /> Add Employee
          </button>
        </div>

        {/* ── Filters ── */}
        <div style={{ ...cardBase, padding:"12px 16px", display:"flex", flexWrap:"wrap", alignItems:"center", gap:10 }}>
          <div style={{ position:"relative", flex:"1 1 240px", maxWidth:360 }}>
            <Search size={12} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--text-muted)", pointerEvents:"none" }} />
            <input type="text" placeholder="Search by name, email, or ID…" value={search} onChange={e => setSearch(e.target.value)} style={{ ...inp, paddingLeft:30 }} />
          </div>
          <select value={department} onChange={e => setDepartment(e.target.value)} style={{ ...sel, flex:"0 1 160px" }}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...sel, flex:"0 1 140px" }}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:26, height:26, borderRadius:7, background:BLUE[50], display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Users size={12} style={{ color:BLUE[600] }} />
            </div>
            <span style={{ fontSize:12, fontWeight:600, color:"var(--text-secondary)" }}>{total} employee{total !== 1 ? "s" : ""}</span>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ ...cardBase, overflow:"hidden" }}>
          {loading ? (
            <div>
              <div style={{ height:44, background:"var(--bg-hover)", borderBottom:"0.5px solid var(--border)" }} />
              {Array.from({ length:6 }).map((_, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"12px 20px", borderBottom: i < 5 ? "0.5px solid var(--border)" : "none" }}>
                  <div className="skeleton" style={{ width:36, height:36, borderRadius:"50%", flexShrink:0 }} />
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
                    <div className="skeleton" style={{ width:"30%", height:10 }} />
                    <div className="skeleton" style={{ width:"18%", height:8  }} />
                  </div>
                  <div className="skeleton" style={{ width:80, height:10 }} />
                  <div className="skeleton" style={{ width:56, height:20, borderRadius:5 }} />
                </div>
              ))}
            </div>
          ) : employees.length === 0 ? (
            <div style={{ padding:"56px 20px", textAlign:"center" }}>
              <div style={{ width:48, height:48, borderRadius:12, background:BLUE[50], display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 14px" }}>
                <Users size={20} style={{ color:BLUE[500] }} />
              </div>
              <p style={{ fontSize:14, fontWeight:600, color:"var(--text-primary)", margin:0 }}>No employees found</p>
              <p style={{ fontSize:12, color:"var(--text-muted)", margin:"4px 0 0" }}>
                {search||department||statusFilter ? "Try adjusting your search or filters" : "Get started by adding your first employee"}
              </p>
              {!search && !department && !statusFilter && (
                <button onClick={openModal} style={{ marginTop:14, display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                  <Plus size={13} /> Add Employee
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"0.5px solid var(--border)" }}>
                    {[{label:"Employee",cls:""},{label:"Department",cls:"col-dept"},{label:"Position",cls:"col-pos"},{label:"Status",cls:""},{label:"Hire Date",cls:"col-hired"},{label:"",cls:""}].map((h,i) => (
                      <th key={i} className={h.cls} style={{ textAlign:"left", padding:"10px 20px", fontSize:10, fontWeight:600, color:"var(--text-muted)", textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap", background:"var(--bg-hover)" }}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp, idx) => {
                    const badge = STATUS_BADGE[emp.status] || { bg:BLUE[50], color:BLUE[600] };
                    return (
                      <tr key={emp.id} className="emp-row" onClick={() => router.push(`/employees/${emp.id}`)}
                        style={{ borderBottom: idx < employees.length-1 ? "0.5px solid var(--border)" : "none", cursor:"pointer", background:"transparent", transition:"background 0.15s" }}>
                        <td style={{ padding:"10px 20px" }}>
                          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                            <img src={getAvatar(emp.firstName, emp.lastName)} alt="" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:"2px solid var(--border)", flexShrink:0 }} />
                            <div style={{ minWidth:0 }}>
                              <p style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", margin:0, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{emp.firstName} {emp.lastName}</p>
                              <p style={{ fontSize:10, color:"var(--text-muted)", margin:"1px 0 0" }}>{emp.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="col-dept" style={{ padding:"10px 20px", fontSize:12, color:"var(--text-primary)", fontWeight:500 }}>{emp.department||"--"}</td>
                        <td className="col-pos"  style={{ padding:"10px 20px", fontSize:12, color:"var(--text-secondary)" }}>{emp.position||"--"}</td>
                        <td style={{ padding:"10px 20px" }}>
                          <span style={{ display:"inline-block", padding:"2px 9px", borderRadius:6, fontSize:10, fontWeight:600, background:badge.bg, color:badge.color }}>{emp.status}</span>
                        </td>
                        <td className="col-hired" style={{ padding:"10px 20px", fontSize:12, color:"var(--text-secondary)" }}>{formatDate(emp.hireDate)}</td>
                        <td style={{ padding:"10px 20px", textAlign:"right" }}>
                          <button className="view-btn" onClick={e => { e.stopPropagation(); router.push(`/employees/${emp.id}`); }}
                            style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:28, height:28, borderRadius:7, border:"0.5px solid var(--border)", background:"transparent", cursor:"pointer", color:"var(--text-muted)", transition:"all 0.15s" }}>
                            <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {!loading && total > 0 && (
          <div style={{ ...cardBase, padding:"10px 16px", display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"space-between", gap:12 }}>
            <p style={{ fontSize:12, color:"var(--text-secondary)", margin:0 }}>
              Showing <strong style={{ color:"var(--text-primary)" }}>{startEntry}–{endEntry}</strong> of <strong style={{ color:"var(--text-primary)" }}>{total}</strong> employee{total !== 1 ? "s" : ""}
            </p>
            {totalPages > 1 && (
              <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                <button className="pg-btn" onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  style={{ width:32, height:32, borderRadius:8, border:"0.5px solid var(--border)", background:"var(--bg-card)", color:page===1?"var(--text-muted)":"var(--text-primary)", cursor:page===1?"not-allowed":"pointer", opacity:page===1?0.5:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ChevronLeft size={14} />
                </button>
                {(() => {
                  const pages: (number|"...")[] = [];
                  if (totalPages<=5) { for (let i=1;i<=totalPages;i++) pages.push(i); }
                  else {
                    pages.push(1);
                    if (page>3) pages.push("...");
                    for (let i=Math.max(2,page-1);i<=Math.min(totalPages-1,page+1);i++) pages.push(i);
                    if (page<totalPages-2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return pages.map((p,i) => p==="..." ? (
                    <span key={`d${i}`} style={{ width:32, height:32, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"var(--text-muted)" }}>…</span>
                  ) : (
                    <button key={p} className="pg-btn" onClick={() => setPage(p as number)}
                      style={{ width:32, height:32, borderRadius:8, border:page===p?`0.5px solid ${BLUE[400]}`:"0.5px solid transparent", background:page===p?BLUE[50]:"transparent", color:page===p?BLUE[600]:"var(--text-secondary)", fontSize:12, fontWeight:page===p?600:400, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {p}
                    </button>
                  ));
                })()}
                <button className="pg-btn" onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  style={{ width:32, height:32, borderRadius:8, border:"0.5px solid var(--border)", background:"var(--bg-card)", color:page===totalPages?"var(--text-muted)":"var(--text-primary)", cursor:page===totalPages?"not-allowed":"pointer", opacity:page===totalPages?0.5:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          ADD EMPLOYEE WIZARD MODAL
      ══════════════════════════════════════ */}
      <Modal isOpen={showModal} onClose={closeModal} title="Add New Employee" size="xl">
        <StepBar current={step} />

        {formError && (
          <div style={{ padding:"10px 14px", borderRadius:8, background:BLUE[50], border:`0.5px solid ${BLUE[200]}`, color:BLUE[700], fontSize:12, fontWeight:500, marginBottom:16 }}>
            {formError}
          </div>
        )}

        {/* ── STEP 0: Personal ── */}
        {step === 0 && (
          <form onSubmit={handlePersonalNext} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--bg-hover)", border:"0.5px solid var(--border)", marginBottom:4 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", margin:"0 0 2px" }}>Personal Information</p>
              <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>Basic identity and contact details</p>
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>First Name <span style={{ color:BLUE[500] }}>*</span></label>
                <input required placeholder="First name" value={personal.firstName} onChange={e => setPersonal(p => ({...p, firstName:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Last Name <span style={{ color:BLUE[500] }}>*</span></label>
                <input required placeholder="Last name" value={personal.lastName} onChange={e => setPersonal(p => ({...p, lastName:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Email Address <span style={{ color:BLUE[500] }}>*</span></label>
                <input required type="email" placeholder="employee@company.com" value={personal.email} onChange={e => setPersonal(p => ({...p, email:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Phone Number</label>
                <input type="tel" placeholder="+1 (555) 000-0000" value={personal.phone} onChange={e => setPersonal(p => ({...p, phone:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Gender</label>
                <select value={personal.gender} onChange={e => setPersonal(p => ({...p, gender:e.target.value}))} style={sel}>
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Date of Birth</label>
                <input type="date" value={personal.dateOfBirth} onChange={e => setPersonal(p => ({...p, dateOfBirth:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Marital Status</label>
                <select value={personal.maritalStatus} onChange={e => setPersonal(p => ({...p, maritalStatus:e.target.value}))} style={sel}>
                  <option value="">Select status</option>
                  {MARITAL_STATUSES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Nationality</label>
                <input placeholder="e.g. American, Ghanaian…" value={personal.nationality} onChange={e => setPersonal(p => ({...p, nationality:e.target.value}))} style={inp} />
              </div>
              <div style={{ gridColumn:"span 2" }}>
                <label style={lbl}>Residential Address</label>
                <input placeholder="Street address" value={personal.address} onChange={e => setPersonal(p => ({...p, address:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>City</label>
                <input placeholder="City" value={personal.city} onChange={e => setPersonal(p => ({...p, city:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Country</label>
                <input placeholder="Country" value={personal.country} onChange={e => setPersonal(p => ({...p, country:e.target.value}))} style={inp} />
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", paddingTop:8, borderTop:"0.5px solid var(--border)" }}>
              <button type="submit" style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                Next: Employment <ChevronRight size={13} />
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 1: Employment ── */}
        {step === 1 && (
          <form onSubmit={handleEmploymentNext} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--bg-hover)", border:"0.5px solid var(--border)", marginBottom:4 }}>
              <p style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", margin:"0 0 2px" }}>Employment Details</p>
              <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>Role, compensation, and contract information</p>
            </div>
            <div style={grid2}>
              <div>
                <label style={lbl}>Department</label>
                <select value={employment.department} onChange={e => setEmployment(p => ({...p, department:e.target.value}))} style={sel}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Job Position / Title</label>
                <input placeholder="e.g. Software Engineer" value={employment.position} onChange={e => setEmployment(p => ({...p, position:e.target.value}))} style={inp} />
              </div>
              <div>
                <label style={lbl}>Employment Type</label>
                <select value={employment.employmentType} onChange={e => setEmployment(p => ({...p, employmentType:e.target.value}))} style={sel}>
                  {EMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={employment.status} onChange={e => setEmployment(p => ({...p, status:e.target.value}))} style={sel}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Basic Salary (monthly)</label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", fontSize:12, color:"var(--text-muted)", fontWeight:600 }}>$</span>
                  <input type="number" min="0" step="0.01" placeholder="0.00" value={employment.salary} onChange={e => setEmployment(p => ({...p, salary:e.target.value}))} style={{ ...inp, paddingLeft:22 }} />
                </div>
              </div>
              <div>
                <label style={lbl}>Hire Date</label>
                <input type="date" value={employment.hireDate} onChange={e => setEmployment(p => ({...p, hireDate:e.target.value}))} style={inp} />
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setStep(0)} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"0.5px solid var(--border)", background:"var(--bg-hover)", color:"var(--text-secondary)", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                <ChevronLeft size={13} /> Back
              </button>
              <button type="submit" disabled={submitting} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", opacity:submitting?0.7:1 }}>
                {submitting ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> : null}
                {submitting ? "Saving…" : <>Next: Bank Account <ChevronRight size={13} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 2: Bank Account ── */}
        {step === 2 && (
          <form onSubmit={handleBankNext} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SkipToggle label="Add bank account for salary payments?" checked={bank.skip} onChange={v => setBank(p => ({...p, skip:v}))} />

            {!bank.skip && (
              <>
                <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--bg-hover)", border:"0.5px solid var(--border)", marginBottom:4 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", margin:"0 0 2px" }}>Bank Account Details</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>Used for payroll direct deposits and bulk payments</p>
                </div>
                <div style={grid2}>
                  <div>
                    <label style={lbl}>Bank Name <span style={{ color:BLUE[500] }}>*</span></label>
                    <input required={!bank.skip} placeholder="e.g. First National Bank" value={bank.bankName} onChange={e => setBank(p => ({...p, bankName:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Account Number <span style={{ color:BLUE[500] }}>*</span></label>
                    <input required={!bank.skip} placeholder="0000000000" value={bank.accountNumber} onChange={e => setBank(p => ({...p, accountNumber:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Account Type</label>
                    <select value={bank.accountType} onChange={e => setBank(p => ({...p, accountType:e.target.value}))} style={sel}>
                      {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Branch Name</label>
                    <input placeholder="e.g. Downtown Branch" value={bank.branchName} onChange={e => setBank(p => ({...p, branchName:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Routing / Sort Code</label>
                    <input placeholder="000000000" value={bank.routingNumber} onChange={e => setBank(p => ({...p, routingNumber:e.target.value}))} style={inp} />
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, paddingTop:20 }}>
                    <input
                      type="checkbox" id="isPrimary" checked={bank.isPrimary}
                      onChange={e => setBank(p => ({...p, isPrimary:e.target.checked}))}
                      style={{ width:14, height:14, accentColor:BLUE[600], cursor:"pointer" }}
                    />
                    <label htmlFor="isPrimary" style={{ fontSize:12, color:"var(--text-secondary)", cursor:"pointer" }}>Set as primary payment account</label>
                  </div>
                </div>
              </>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setStep(1)} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"0.5px solid var(--border)", background:"var(--bg-hover)", color:"var(--text-secondary)", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                <ChevronLeft size={13} /> Back
              </button>
              <button type="submit" disabled={submitting} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", opacity:submitting?0.7:1 }}>
                {submitting ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> : null}
                {submitting ? "Saving…" : <>{bank.skip ? "Skip" : "Save & Continue"} <ChevronRight size={13} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 3: Emergency Contact ── */}
        {step === 3 && (
          <form onSubmit={handleContactNext} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SkipToggle label="Add emergency contact?" checked={contact.skip} onChange={v => setContact(p => ({...p, skip:v}))} />

            {!contact.skip && (
              <>
                <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--bg-hover)", border:"0.5px solid var(--border)", marginBottom:4 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", margin:"0 0 2px" }}>Emergency Contact</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>Person to contact in case of emergency</p>
                </div>
                <div style={grid2}>
                  <div>
                    <label style={lbl}>Full Name <span style={{ color:BLUE[500] }}>*</span></label>
                    <input required={!contact.skip} placeholder="Contact full name" value={contact.name} onChange={e => setContact(p => ({...p, name:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Relationship</label>
                    <select value={contact.relationship} onChange={e => setContact(p => ({...p, relationship:e.target.value}))} style={sel}>
                      {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>Phone Number <span style={{ color:BLUE[500] }}>*</span></label>
                    <input required={!contact.skip} type="tel" placeholder="+1 (555) 000-0000" value={contact.phone} onChange={e => setContact(p => ({...p, phone:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Email Address</label>
                    <input type="email" placeholder="contact@email.com" value={contact.email} onChange={e => setContact(p => ({...p, email:e.target.value}))} style={inp} />
                  </div>
                  <div style={{ gridColumn:"span 2" }}>
                    <label style={lbl}>Address</label>
                    <input placeholder="Street, City, Country" value={contact.address} onChange={e => setContact(p => ({...p, address:e.target.value}))} style={inp} />
                  </div>
                </div>
              </>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setStep(2)} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"0.5px solid var(--border)", background:"var(--bg-hover)", color:"var(--text-secondary)", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                <ChevronLeft size={13} /> Back
              </button>
              <button type="submit" disabled={submitting} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:8, border:"none", background:BLUE[600], color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", opacity:submitting?0.7:1 }}>
                {submitting ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> : null}
                {submitting ? "Saving…" : <>{contact.skip ? "Skip" : "Save & Continue"} <ChevronRight size={13} /></>}
              </button>
            </div>
          </form>
        )}

        {/* ── STEP 4: Documents ── */}
        {step === 4 && (
          <form onSubmit={handleDocumentFinish} style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <SkipToggle label="Add an employee document?" checked={document.skip} onChange={v => setDocument(p => ({...p, skip:v}))} />

            {!document.skip && (
              <>
                <div style={{ padding:"10px 14px", borderRadius:8, background:"var(--bg-hover)", border:"0.5px solid var(--border)", marginBottom:4 }}>
                  <p style={{ fontSize:12, fontWeight:600, color:"var(--text-primary)", margin:"0 0 2px" }}>Employee Document</p>
                  <p style={{ fontSize:11, color:"var(--text-muted)", margin:0 }}>ID, contract, certificates or other records</p>
                </div>
                <div style={grid2}>
                  <div>
                    <label style={lbl}>Document Title <span style={{ color:BLUE[500] }}>*</span></label>
                    <input required={!document.skip} placeholder="e.g. National ID Card" value={document.title} onChange={e => setDocument(p => ({...p, title:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Document Type</label>
                    <select value={document.type} onChange={e => setDocument(p => ({...p, type:e.target.value}))} style={sel}>
                      {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={lbl}>File URL / Reference</label>
                    <input placeholder="https://… or reference number" value={document.fileUrl} onChange={e => setDocument(p => ({...p, fileUrl:e.target.value}))} style={inp} />
                  </div>
                  <div>
                    <label style={lbl}>Expiry Date</label>
                    <input type="date" value={document.expiryDate} onChange={e => setDocument(p => ({...p, expiryDate:e.target.value}))} style={inp} />
                  </div>
                </div>
              </>
            )}

            {/* Success preview */}
            <div style={{ padding:"14px 16px", borderRadius:10, background:"#eff6ff", border:"1px solid #bfdbfe", display:"flex", alignItems:"center", gap:12 }}>
              <CheckCircle2 size={18} style={{ color:"#2563eb", flexShrink:0 }} />
              <div>
                <p style={{ fontSize:12, fontWeight:600, color:"#1d4ed8", margin:"0 0 1px" }}>Almost done!</p>
                <p style={{ fontSize:11, color:"#2563eb", margin:0 }}>
                  Employee record created. {document.skip ? "Click Finish to complete." : "Add a document and click Finish."}
                </p>
              </div>
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8, borderTop:"0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setStep(3)} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 16px", borderRadius:8, border:"0.5px solid var(--border)", background:"var(--bg-hover)", color:"var(--text-secondary)", fontSize:12, fontWeight:500, cursor:"pointer" }}>
                <ChevronLeft size={13} /> Back
              </button>
              <button type="submit" disabled={submitting} style={{ display:"inline-flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:8, border:"none", background:"#2563eb", color:"#fff", fontSize:12, fontWeight:600, cursor:"pointer", opacity:submitting?0.7:1 }}>
                {submitting ? <Loader2 size={13} style={{ animation:"spin 1s linear infinite" }} /> : <CheckCircle2 size={13} />}
                {submitting ? "Saving…" : "Finish & Add Employee"}
              </button>
            </div>
          </form>
        )}

        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </Modal>
    </>
  );
}
