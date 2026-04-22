"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Building2, Briefcase,
  CreditCard, Users, FileText, Edit3, Trash2, Loader2, Save, X,
  Plus, User, Globe, Hash, DollarSign, Heart, Flag, Home, Shield,
} from "lucide-react";
import Modal from "@/components/Modal";

/* ─────────────────────────────────────────
   Font + Palette
───────────────────────────────────────── */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

/* ─────────────────────────────────────────
   Status badge colours
───────────────────────────────────────── */
function statusBadge(s: string): React.CSSProperties {
  switch (s) {
    case "Active": case "Approved": case "Processed":
      return { background: BLUE[100], color: BLUE[700] };
    case "On Leave": case "Pending":
      return { background: BLUE[50], color: BLUE[500] };
    case "Terminated": case "Rejected": case "Expired":
      return { background: BLUE[200], color: BLUE[900] };
    case "Probation":
      return { background: BLUE[50], color: BLUE[400] };
    default:
      return { background: "var(--bg-hover)", color: "var(--text-muted)" };
  }
}

/* ─────────────────────────────────────────
   Avatar pool
───────────────────────────────────────── */
const AVATAR_POOL = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1537511446984-935f663eb1f4?w=160&q=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=160&q=80&fit=crop&crop=face",
];

function getAvatar(first: string, last: string) {
  const key = `${first}${last}`; let h = 0;
  for (let i = 0; i < key.length; i++) h = key.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_POOL[Math.abs(h) % AVATAR_POOL.length];
}

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface BankAccount {
  id: string; bankName: string; accountNumber: string;
  accountType: string | null; branchName: string | null;
  routingNumber: string | null; isPrimary: boolean;
}
interface Contact {
  id: string; name: string; relationship: string; phone: string;
  email: string | null; address: string | null; isPrimary: boolean; category: string;
}
interface Document {
  id: string; title: string; type: string; fileUrl: string | null;
  fileSize: string | null; status: string; expiryDate: string | null; createdAt: string;
}
interface LeaveRequest {
  id: string; leaveType: string; startDate: string;
  endDate: string; days: number; status: string;
}
interface PayrollRecord { id: string; period: string; netPay: number; status: string; }
interface Employee {
  id: string; employeeId: string; firstName: string; lastName: string;
  email: string; phone: string | null; dateOfBirth: string | null;
  gender: string | null; maritalStatus: string | null; nationality: string | null;
  address: string | null; city: string | null; state: string | null;
  country: string | null; postalCode: string | null; department: string | null;
  position: string | null; employmentType: string; status: string;
  hireDate: string; salary: number;
  bankAccounts: BankAccount[]; contacts: Contact[];
  documents: Document[]; leaveRequests: LeaveRequest[]; payrolls: PayrollRecord[];
}

/* ─────────────────────────────────────────
   Tabs
───────────────────────────────────────── */
const TABS = [
  { key: "overview",  label: "Overview",      icon: Building2  },
  { key: "bank",      label: "Bank Accounts", icon: CreditCard },
  { key: "contacts",  label: "Contacts",      icon: Users      },
  { key: "documents", label: "Documents",     icon: FileText   },
] as const;

/* ─────────────────────────────────────────
   Shared styles
───────────────────────────────────────── */
const cardBase: React.CSSProperties = {
  background: "var(--bg-card)",
  borderRadius: 14,
  border: "0.5px solid var(--border)",
};

const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 12, outline: "none",
  fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box",
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--text-muted)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
function fmt(d: string | null | undefined) {
  if (!d) return "--";
  try { return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
  catch { return d; }
}

function InfoRow({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value?: string | number | null }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "10px 0", borderBottom: "0.5px solid var(--border)",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8, background: BLUE[50],
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <span style={{ color: BLUE[500] }}>{icon}</span>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
        <p style={{ margin: "2px 0 0", fontSize: 12, fontWeight: 500, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "--"}
        </p>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-secondary)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
      {children}
    </p>
  );
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 16px", letterSpacing: -0.2 }}>
      {children}
    </h3>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "36px 16px", gap: 10 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: BLUE[400] }}>{icon}</span>
      </div>
      <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>{message}</p>
    </div>
  );
}

function SectionCard({
  label, title, children, onAdd,
}: { label: string; title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div style={{ ...cardBase, padding: 20 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <SectionLabel>{label}</SectionLabel>
          <CardTitle>{title}</CardTitle>
        </div>
        {onAdd && (
          <button onClick={onAdd} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "6px 12px", borderRadius: 7, border: "none",
            background: BLUE[600], color: "#fff", fontSize: 11,
            fontWeight: 600, cursor: "pointer",
          }}>
            <Plus size={11} /> Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function ModalFooter({ onCancel, btnLabel, submitting }: { onCancel: () => void; btnLabel: string; submitting: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "0.5px solid var(--border)", marginTop: 4 }}>
      <button type="button" onClick={onCancel} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
        Cancel
      </button>
      <button type="submit" disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1 }}>
        {submitting ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        {btnLabel}
      </button>
    </div>
  );
}

function EditField({
  labelText, fieldKey, type = "text", options, value, onChange,
}: {
  labelText: string; fieldKey: string; type?: string; options?: string[];
  value: string; onChange: (key: string, val: string) => void;
}) {
  return (
    <div>
      <label style={lbl}>{labelText}</label>
      {options ? (
        <select value={value} onChange={e => onChange(fieldKey, e.target.value)} style={inp}>
          <option value="">Select…</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(fieldKey, e.target.value)} style={inp} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router  = useRouter();

  const [employee,          setEmployee]          = useState<Employee | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [activeTab,         setActiveTab]         = useState("overview");
  const [editing,           setEditing]           = useState(false);
  const [saving,            setSaving]            = useState(false);
  const [editForm,          setEditForm]          = useState<Partial<Employee>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting,          setDeleting]          = useState(false);
  const [showBankModal,     setShowBankModal]     = useState(false);
  const [showContactModal,  setShowContactModal]  = useState(false);
  const [showDocModal,      setShowDocModal]      = useState(false);
  const [submitting,        setSubmitting]        = useState(false);

  const [bankForm,    setBankForm]    = useState({ bankName: "", accountNumber: "", accountType: "Checking", branchName: "", routingNumber: "", isPrimary: false });
  const [contactForm, setContactForm] = useState({ name: "", relationship: "", phone: "", email: "", address: "", category: "Emergency", isPrimary: false });
  const [docForm,     setDocForm]     = useState({ title: "", type: "ID", fileUrl: "", status: "Pending", expiryDate: "" });

  const fetchEmployee = useCallback(() => {
    setLoading(true);
    fetch(`/api/employees/${id}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setEmployee(d); setEditForm(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => { fetchEmployee(); }, [fetchEmployee]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm),
      });
      if (res.ok) { const u = await res.json(); setEmployee(p => p ? { ...p, ...u } : p); setEditing(false); }
    } finally { setSaving(false); }
  };

  const handleCancelEdit = () => { setEditForm(employee || {}); setEditing(false); };

  const handleDelete = async () => {
    setDeleting(true);
    try { await fetch(`/api/employees/${id}`, { method: "DELETE" }); router.push("/employees"); }
    catch { setDeleting(false); }
  };

  const handleAddBank = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${id}/bank-accounts`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bankForm),
      });
      if (res.ok) {
        const c = await res.json();
        setEmployee(p => p ? { ...p, bankAccounts: [...p.bankAccounts, c] } : p);
        setShowBankModal(false);
        setBankForm({ bankName: "", accountNumber: "", accountType: "Checking", branchName: "", routingNumber: "", isPrimary: false });
      }
    } finally { setSubmitting(false); }
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${id}/contacts`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        const c = await res.json();
        setEmployee(p => p ? { ...p, contacts: [...p.contacts, c] } : p);
        setShowContactModal(false);
        setContactForm({ name: "", relationship: "", phone: "", email: "", address: "", category: "Emergency", isPrimary: false });
      }
    } finally { setSubmitting(false); }
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${id}/documents`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(docForm),
      });
      if (res.ok) {
        const c = await res.json();
        setEmployee(p => p ? { ...p, documents: [...p.documents, c] } : p);
        setShowDocModal(false);
        setDocForm({ title: "", type: "ID", fileUrl: "", status: "Pending", expiryDate: "" });
      }
    } finally { setSubmitting(false); }
  };

  const updateEditField = (key: string, val: string | number) =>
    setEditForm(p => ({ ...p, [key]: val }));

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[{ h: 32, w: 160 }, { h: 200 }, { h: 48 }, { h: 260 }].map((s, i) => (
        <div key={i} style={{ height: s.h, width: s.w, borderRadius: 12, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
      ))}
    </div>
  );

  /* ── Not found ── */
  if (!employee) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "80px 20px", gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center" }}>
        <User size={20} style={{ color: BLUE[500] }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-secondary)" }}>Employee not found</p>
      <button onClick={() => router.push("/employees")} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
        <ArrowLeft size={13} /> Back to Employees
      </button>
    </div>
  );

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .emp-detail * { font-family: 'DM Sans', sans-serif !important; }
        .tab-btn:hover:not(.tab-active) { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .list-row:hover { background: var(--bg-hover) !important; }
        .del-btn:hover { background: ${BLUE[100]} !important; }

        /* CSS vars — plug into your theme or globals.css */
        .emp-detail {
          --bg-card:   #ffffff;
          --bg-hover:  #f8fafc;
          --bg-input:  #f8fafc;
          --border:    rgba(0,0,0,0.08);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .emp-detail {
            --bg-card:   #0f172a;
            --bg-hover:  #1e293b;
            --bg-input:  #1e293b;
            --border:    rgba(255,255,255,0.08);
            --text-primary:   #f1f5f9;
            --text-secondary: #94a3b8;
            --text-muted:     #475569;
          }
        }
      `}</style>

      <div className="emp-detail" style={{ display: "flex", flexDirection: "column", gap: 20, width: "100%" }}>

        {/* ── Back button ── */}
        <button
          onClick={() => router.push("/employees")}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", padding: 0, width: "fit-content" }}
        >
          <ArrowLeft size={14} style={{ color: "var(--text-muted)" }} /> Back to Employees
        </button>

        {/* ══════════════════════════════════
            PROFILE HEADER
        ══════════════════════════════════ */}
        <div style={{ ...cardBase, padding: "22px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 18 }}>

            {/* Avatar + name + chips */}
            <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
              <img
                src={getAvatar(employee.firstName, employee.lastName)}
                alt={`${employee.firstName} ${employee.lastName}`}
                style={{ width: 80, height: 80, borderRadius: 16, objectFit: "cover", objectPosition: "top center", border: `2px solid ${BLUE[100]}`, flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 3 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>
                    {employee.firstName} {employee.lastName}
                  </h2>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 9px", borderRadius: 6, letterSpacing: 0.2, ...statusBadge(employee.status) }}>
                    {employee.status}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: "0 0 12px" }}>
                  {employee.position || "No position"} · {employee.department || "No department"}
                </p>

                {/* Chip row */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {[
                    { icon: <Hash size={10} />,        val: employee.employeeId },
                    { icon: <Mail size={10} />,        val: employee.email },
                    { icon: <Phone size={10} />,       val: employee.phone },
                    { icon: <Calendar size={10} />,    val: employee.hireDate ? `Hired ${fmt(employee.hireDate)}` : null },
                    { icon: <DollarSign size={10} />,  val: employee.salary ? `$${employee.salary.toLocaleString()}` : null },
                    { icon: <Shield size={10} />,      val: employee.employmentType },
                  ].filter(p => p.val).map((p, i) => (
                    <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", borderRadius: 99, background: "var(--bg-hover)", border: "0.5px solid var(--border)" }}>
                      <span style={{ color: BLUE[500], flexShrink: 0 }}>{p.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 500, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>{p.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: `0.5px solid ${BLUE[200]}`, background: BLUE[50], color: BLUE[600], fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                >
                  <Edit3 size={13} /> Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancelEdit}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    <X size={13} /> Cancel
                  </button>
                  <button
                    onClick={handleSave} disabled={saving}
                    style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
                  >
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save
                  </button>
                </>
              )}
              <button
                className="del-btn"
                onClick={() => setShowDeleteConfirm(true)}
                style={{ width: 34, height: 34, borderRadius: 8, border: `0.5px solid ${BLUE[200]}`, background: BLUE[50], color: BLUE[400], display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════
            TABS
        ══════════════════════════════════ */}
        <div style={{ ...cardBase, padding: 5, display: "flex", gap: 3, overflowX: "auto" }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isAct = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                className={`tab-btn${isAct ? " tab-active" : ""}`}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", borderRadius: 8, fontSize: 12,
                  fontWeight: isAct ? 600 : 400, border: "none", cursor: "pointer",
                  whiteSpace: "nowrap",
                  background: isAct ? BLUE[600] : "transparent",
                  color: isAct ? "#fff" : "var(--text-secondary)",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* ══════════════════════════════════
            OVERVIEW TAB
        ══════════════════════════════════ */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Row 1: Personal + Employment */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

              {/* Personal */}
              <SectionCard label="Profile" title="Personal information">
                {editing ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <EditField labelText="First Name" fieldKey="firstName" value={String((editForm as Record<string,string>).firstName || "")} onChange={updateEditField} />
                    <EditField labelText="Last Name"  fieldKey="lastName"  value={String((editForm as Record<string,string>).lastName  || "")} onChange={updateEditField} />
                    <EditField labelText="Email"      fieldKey="email"     type="email" value={String((editForm as Record<string,string>).email || "")} onChange={updateEditField} />
                    <EditField labelText="Phone"      fieldKey="phone"     type="tel"   value={String((editForm as Record<string,string>).phone || "")} onChange={updateEditField} />
                    <EditField labelText="Date of Birth" fieldKey="dateOfBirth" type="date" value={String((editForm as Record<string,string>).dateOfBirth || "")} onChange={updateEditField} />
                    <EditField labelText="Gender"     fieldKey="gender"    options={["Male", "Female", "Other"]} value={String((editForm as Record<string,string>).gender || "")} onChange={updateEditField} />
                    <EditField labelText="Marital Status" fieldKey="maritalStatus" options={["Single", "Married", "Divorced", "Widowed"]} value={String((editForm as Record<string,string>).maritalStatus || "")} onChange={updateEditField} />
                    <EditField labelText="Nationality" fieldKey="nationality" value={String((editForm as Record<string,string>).nationality || "")} onChange={updateEditField} />
                  </div>
                ) : (
                  <div>
                    <InfoRow icon={<Mail size={13} />}     label="Email"          value={employee.email} />
                    <InfoRow icon={<Phone size={13} />}    label="Phone"          value={employee.phone} />
                    <InfoRow icon={<Calendar size={13} />} label="Date of birth"  value={fmt(employee.dateOfBirth)} />
                    <InfoRow icon={<User size={13} />}     label="Gender"         value={employee.gender} />
                    <InfoRow icon={<Heart size={13} />}    label="Marital status" value={employee.maritalStatus} />
                    <InfoRow icon={<Flag size={13} />}     label="Nationality"    value={employee.nationality} />
                  </div>
                )}
              </SectionCard>

              {/* Employment */}
              <SectionCard label="Work" title="Employment details">
                {editing ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <EditField labelText="Department" fieldKey="department" value={String((editForm as Record<string,string>).department || "")} onChange={updateEditField} />
                    <EditField labelText="Position"   fieldKey="position"   value={String((editForm as Record<string,string>).position   || "")} onChange={updateEditField} />
                    <EditField labelText="Employment Type" fieldKey="employmentType" options={["Full-time", "Part-time", "Contract", "Intern"]} value={String((editForm as Record<string,string>).employmentType || "")} onChange={updateEditField} />
                    <EditField labelText="Status" fieldKey="status" options={["Active", "On Leave", "Terminated", "Probation"]} value={String((editForm as Record<string,string>).status || "")} onChange={updateEditField} />
                    <EditField labelText="Hire Date" fieldKey="hireDate" type="date" value={String((editForm as Record<string,string>).hireDate || "")} onChange={updateEditField} />
                    <EditField labelText="Salary"    fieldKey="salary"   type="number" value={String((editForm as Record<string,number>).salary   || "")} onChange={updateEditField} />
                  </div>
                ) : (
                  <div>
                    <InfoRow icon={<Hash size={13} />}       label="Employee ID"     value={employee.employeeId} />
                    <InfoRow icon={<Building2 size={13} />}  label="Department"      value={employee.department} />
                    <InfoRow icon={<Briefcase size={13} />}  label="Position"        value={employee.position} />
                    <InfoRow icon={<Shield size={13} />}     label="Employment type" value={employee.employmentType} />
                    <InfoRow icon={<Calendar size={13} />}   label="Hire date"       value={fmt(employee.hireDate)} />
                    <InfoRow icon={<DollarSign size={13} />} label="Salary"          value={employee.salary ? `$${employee.salary.toLocaleString()}` : "--"} />
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Row 2: Address + Payroll */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>

              {/* Address */}
              <SectionCard label="Location" title="Address">
                {editing ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <EditField labelText="Street Address" fieldKey="address" value={String((editForm as Record<string,string>).address || "")} onChange={updateEditField} />
                    </div>
                    <EditField labelText="City"        fieldKey="city"       value={String((editForm as Record<string,string>).city       || "")} onChange={updateEditField} />
                    <EditField labelText="State"       fieldKey="state"      value={String((editForm as Record<string,string>).state      || "")} onChange={updateEditField} />
                    <EditField labelText="Country"     fieldKey="country"    value={String((editForm as Record<string,string>).country    || "")} onChange={updateEditField} />
                    <EditField labelText="Postal Code" fieldKey="postalCode" value={String((editForm as Record<string,string>).postalCode || "")} onChange={updateEditField} />
                  </div>
                ) : (
                  <div>
                    <InfoRow icon={<MapPin size={13} />} label="Street address" value={employee.address} />
                    <InfoRow icon={<Home size={13} />}   label="City"           value={employee.city} />
                    <InfoRow icon={<Globe size={13} />}  label="State"          value={employee.state} />
                    <InfoRow icon={<Globe size={13} />}  label="Country"        value={employee.country} />
                    <InfoRow icon={<Hash size={13} />}   label="Postal code"    value={employee.postalCode} />
                  </div>
                )}
              </SectionCard>

              {/* Payroll */}
              <SectionCard label="Finance" title="Recent payroll">
                {employee.payrolls.length === 0 ? (
                  <EmptyState icon={<DollarSign size={16} />} message="No payroll records yet" />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {employee.payrolls.slice(0, 6).map(p => (
                      <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 9, border: "0.5px solid var(--border)", background: "var(--bg-hover)" }}>
                        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-primary)" }}>{p.period}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: BLUE[600] }}>${p.netPay.toLocaleString()}</span>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, ...statusBadge(p.status) }}>{p.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            {/* Row 3: Leave requests — full width */}
            <div style={{ ...cardBase, padding: 20 }}>
              <SectionLabel>Time Off</SectionLabel>
              <CardTitle>Recent leave requests</CardTitle>
              {employee.leaveRequests.length === 0 ? (
                <EmptyState icon={<Calendar size={16} />} message="No leave requests yet" />
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
                  {employee.leaveRequests.slice(0, 6).map(lr => (
                    <div key={lr.id} style={{ padding: "14px 16px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-hover)" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{lr.leaveType}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, ...statusBadge(lr.status) }}>{lr.status}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>
                        {fmt(lr.startDate)} – {fmt(lr.endDate)}<br />
                        <span style={{ fontWeight: 600 }}>{lr.days} day{lr.days !== 1 ? "s" : ""}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════
            BANK TAB
        ══════════════════════════════════ */}
        {activeTab === "bank" && (
          <div style={{ ...cardBase, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <SectionLabel>Finance</SectionLabel>
                <CardTitle>Bank accounts</CardTitle>
              </div>
              <button onClick={() => setShowBankModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "none", background: BLUE[600], color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={11} /> Add
              </button>
            </div>
            {employee.bankAccounts.length === 0 ? (
              <EmptyState icon={<CreditCard size={16} />} message="No bank accounts on file" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {employee.bankAccounts.map(ba => (
                  <div key={ba.id} className="list-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 9, border: "0.5px solid var(--border)", background: "var(--bg-hover)", transition: "background 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <CreditCard size={15} style={{ color: BLUE[500] }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{ba.bankName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{ba.accountNumber} · {ba.accountType || "N/A"}{ba.branchName ? ` · ${ba.branchName}` : ""}</p>
                      </div>
                    </div>
                    {ba.isPrimary && (
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: BLUE[100], color: BLUE[700] }}>Primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            CONTACTS TAB
        ══════════════════════════════════ */}
        {activeTab === "contacts" && (
          <div style={{ ...cardBase, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <SectionLabel>People</SectionLabel>
                <CardTitle>Emergency & other contacts</CardTitle>
              </div>
              <button onClick={() => setShowContactModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "none", background: BLUE[600], color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={11} /> Add
              </button>
            </div>
            {employee.contacts.length === 0 ? (
              <EmptyState icon={<Users size={16} />} message="No contacts on file" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {employee.contacts.map(ct => (
                  <div key={ct.id} className="list-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 9, border: "0.5px solid var(--border)", background: "var(--bg-hover)", transition: "background 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Users size={15} style={{ color: BLUE[500] }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{ct.name}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>{ct.relationship} · {ct.phone}{ct.email ? ` · ${ct.email}` : ""}</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 7 }}>
                      {ct.isPrimary && <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, background: BLUE[100], color: BLUE[700] }}>Primary</span>}
                      <span style={{ fontSize: 10, fontWeight: 500, padding: "2px 8px", borderRadius: 5, background: "var(--bg-hover)", border: "0.5px solid var(--border)", color: "var(--text-secondary)" }}>{ct.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            DOCUMENTS TAB
        ══════════════════════════════════ */}
        {activeTab === "documents" && (
          <div style={{ ...cardBase, padding: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <SectionLabel>Files</SectionLabel>
                <CardTitle>Documents</CardTitle>
              </div>
              <button onClick={() => setShowDocModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", borderRadius: 7, border: "none", background: BLUE[600], color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={11} /> Add
              </button>
            </div>
            {employee.documents.length === 0 ? (
              <EmptyState icon={<FileText size={16} />} message="No documents on file" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {employee.documents.map(doc => (
                  <div key={doc.id} className="list-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", borderRadius: 9, border: "0.5px solid var(--border)", background: "var(--bg-hover)", transition: "background 0.15s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <FileText size={15} style={{ color: BLUE[500] }} />
                      </div>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{doc.title}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)", margin: "2px 0 0" }}>
                          {doc.type}{doc.expiryDate ? ` · Expires: ${fmt(doc.expiryDate)}` : ""}{doc.createdAt ? ` · Added: ${fmt(doc.createdAt)}` : ""}
                        </p>
                      </div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 5, ...statusBadge(doc.status) }}>{doc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════
            MODALS
        ══════════════════════════════════ */}

        {/* Delete confirm */}
        <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete employee" size="sm">
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={20} style={{ color: BLUE[500] }} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 8px" }}>Are you sure?</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "0 0 24px", lineHeight: 1.7 }}>
              This will permanently delete <strong>{employee.firstName} {employee.lastName}</strong> and all associated data.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: "7px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, border: `0.5px solid ${BLUE[200]}`, background: BLUE[50], color: BLUE[700], fontSize: 12, fontWeight: 600, cursor: deleting ? "not-allowed" : "pointer", opacity: deleting ? 0.7 : 1 }}>
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
              </button>
            </div>
          </div>
        </Modal>

        {/* Add Bank Account */}
        <Modal isOpen={showBankModal} onClose={() => setShowBankModal(false)} title="Add bank account" size="md">
          <form onSubmit={handleAddBank} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Bank Name <span style={{ color: BLUE[500] }}>*</span></label>
                <input required value={bankForm.bankName} onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })} style={inp} placeholder="Bank name" />
              </div>
              <div>
                <label style={lbl}>Account Number <span style={{ color: BLUE[500] }}>*</span></label>
                <input required value={bankForm.accountNumber} onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })} style={inp} placeholder="Account number" />
              </div>
              <div>
                <label style={lbl}>Account Type</label>
                <select value={bankForm.accountType} onChange={e => setBankForm({ ...bankForm, accountType: e.target.value })} style={inp}>
                  {["Checking", "Savings", "Current"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Branch</label>
                <input value={bankForm.branchName} onChange={e => setBankForm({ ...bankForm, branchName: e.target.value })} style={inp} placeholder="Branch name" />
              </div>
              <div>
                <label style={lbl}>Routing Number</label>
                <input value={bankForm.routingNumber} onChange={e => setBankForm({ ...bankForm, routingNumber: e.target.value })} style={inp} placeholder="Routing number" />
              </div>
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" id="bp" checked={bankForm.isPrimary} onChange={e => setBankForm({ ...bankForm, isPrimary: e.target.checked })} style={{ accentColor: BLUE[600] }} />
                <label htmlFor="bp" style={{ fontSize: 12, color: "var(--text-secondary)" }}>Set as primary account</label>
              </div>
            </div>
            <ModalFooter onCancel={() => setShowBankModal(false)} btnLabel="Add account" submitting={submitting} />
          </form>
        </Modal>

        {/* Add Contact */}
        <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Add contact" size="md">
          <form onSubmit={handleAddContact} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Name <span style={{ color: BLUE[500] }}>*</span></label>
                <input required value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} style={inp} placeholder="Full name" />
              </div>
              <div>
                <label style={lbl}>Relationship <span style={{ color: BLUE[500] }}>*</span></label>
                <input required value={contactForm.relationship} onChange={e => setContactForm({ ...contactForm, relationship: e.target.value })} style={inp} placeholder="e.g. Spouse" />
              </div>
              <div>
                <label style={lbl}>Phone <span style={{ color: BLUE[500] }}>*</span></label>
                <input required type="tel" value={contactForm.phone} onChange={e => setContactForm({ ...contactForm, phone: e.target.value })} style={inp} placeholder="Phone number" />
              </div>
              <div>
                <label style={lbl}>Email</label>
                <input type="email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} style={inp} placeholder="Email" />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Address</label>
                <input value={contactForm.address} onChange={e => setContactForm({ ...contactForm, address: e.target.value })} style={inp} placeholder="Address" />
              </div>
              <div>
                <label style={lbl}>Category</label>
                <select value={contactForm.category} onChange={e => setContactForm({ ...contactForm, category: e.target.value })} style={inp}>
                  {["Emergency", "Family", "Reference", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 18 }}>
                <input type="checkbox" id="cp" checked={contactForm.isPrimary} onChange={e => setContactForm({ ...contactForm, isPrimary: e.target.checked })} style={{ accentColor: BLUE[600] }} />
                <label htmlFor="cp" style={{ fontSize: 12, color: "var(--text-secondary)" }}>Primary contact</label>
              </div>
            </div>
            <ModalFooter onCancel={() => setShowContactModal(false)} btnLabel="Add contact" submitting={submitting} />
          </form>
        </Modal>

        {/* Add Document */}
        <Modal isOpen={showDocModal} onClose={() => setShowDocModal(false)} title="Add document" size="md">
          <form onSubmit={handleAddDocument} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={lbl}>Document Title <span style={{ color: BLUE[500] }}>*</span></label>
                <input required value={docForm.title} onChange={e => setDocForm({ ...docForm, title: e.target.value })} style={inp} placeholder="Title" />
              </div>
              <div>
                <label style={lbl}>Type <span style={{ color: BLUE[500] }}>*</span></label>
                <select value={docForm.type} onChange={e => setDocForm({ ...docForm, type: e.target.value })} style={inp}>
                  {["ID", "Contract", "Certificate", "Resume", "Tax", "Medical", "Other"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Status</label>
                <select value={docForm.status} onChange={e => setDocForm({ ...docForm, status: e.target.value })} style={inp}>
                  {["Pending", "Approved", "Rejected", "Expired"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>File URL</label>
                <input value={docForm.fileUrl} onChange={e => setDocForm({ ...docForm, fileUrl: e.target.value })} style={inp} placeholder="https://…" />
              </div>
              <div>
                <label style={lbl}>Expiry Date</label>
                <input type="date" value={docForm.expiryDate} onChange={e => setDocForm({ ...docForm, expiryDate: e.target.value })} style={inp} />
              </div>
            </div>
            <ModalFooter onCancel={() => setShowDocModal(false)} btnLabel="Add document" submitting={submitting} />
          </form>
        </Modal>

      </div>
    </>
  );
}