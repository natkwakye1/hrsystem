"use client";

import { useEffect, useState } from "react";
import {
  UserCircle, Mail, Phone, Briefcase, CreditCard, Users,
  FolderOpen, Download, FileText, Shield, CalendarDays,
  Wallet, BookOpen, Heart, Star,
} from "lucide-react";

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
];
function getAvatar(firstName: string, lastName: string): string {
  const key = `${firstName}${lastName}`; let hash = 0;
  for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_POOL[Math.abs(hash) % AVATAR_POOL.length];
}

const BLUE = { 900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb", 500: "#3b82f6", 100: "#dbeafe", 50: "#eff6ff" };

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)", overflow: "hidden",
};

const COMPANY_DOCS = [
  { title: "Employee Handbook",        type: "Policy",   description: "Company policies, code of conduct, and guidelines",         icon: BookOpen    },
  { title: "Benefits Guide 2024",      type: "Benefits", description: "Full overview of health, insurance, and allowance benefits", icon: Heart       },
  { title: "IT Security Policy",       type: "Policy",   description: "Acceptable use of company systems and data",               icon: Shield      },
  { title: "Leave Policy",             type: "Policy",   description: "Leave entitlements, types, and application procedures",    icon: CalendarDays },
  { title: "Payroll Schedule",         type: "Finance",  description: "Monthly payroll processing and payment dates",             icon: Wallet      },
  { title: "Performance Review Guide", type: "HR",       description: "How to prepare for and participate in reviews",            icon: Star        },
];

const DOC_TYPE_COLOR: Record<string, { bg: string; color: string }> = {
  Policy:   { bg: "var(--accent-light)", color: "var(--accent)"  },
  Benefits: { bg: "#f0fdf4",             color: "#16a34a"         },
  Finance:  { bg: "#fefce8",             color: "#ca8a04"         },
  HR:       { bg: "#fdf4ff",             color: "#9333ea"         },
};

interface BankAccount { id: string; bankName: string; accountNumber: string; accountType?: string; isPrimary: boolean; }
interface Contact     { id: string; name: string; relationship: string; phone: string; email?: string; isPrimary: boolean; }
interface Doc         { id: string; title: string; type: string; status: string; createdAt: string; }
interface Employee {
  id: string; employeeId: string; firstName: string; lastName: string;
  email: string; phone?: string; dateOfBirth?: string; gender?: string;
  maritalStatus?: string; nationality?: string; address?: string; city?: string;
  state?: string; country?: string; department?: string; position?: string;
  employmentType: string; status: string; hireDate: string; salary: number;
  bankAccounts: BankAccount[]; contacts: Contact[];
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 13, fontWeight: 500, color: value ? "var(--text-primary)" : "var(--text-muted)", margin: 0 }}>{value || "Not provided"}</p>
    </div>
  );
}

type TabKey = "personal" | "work" | "bank" | "contacts" | "documents";

export default function ProfilePage() {
  const [emp,     setEmp]     = useState<Employee | null>(null);
  const [docs,    setDocs]    = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<TabKey>("personal");

  useEffect(() => {
    fetch("/api/portal/employee/me")
      .then(r => r.json())
      .then(async d => {
        setEmp(d.employee);
        if (d.employee?.id) {
          const dr = await fetch(`/api/employees/${d.employee.id}/documents`).catch(() => null);
          const dd = dr ? await dr.json().catch(() => ({})) : {};
          setDocs(dd.documents ?? []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[140, 320].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );
  if (!emp) return <p style={{ color: "var(--text-muted)" }}>Could not load profile.</p>;

  const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "personal",  label: "Personal Info",      icon: UserCircle  },
    { key: "work",      label: "Work Details",       icon: Briefcase   },
    { key: "bank",      label: "Bank Accounts",      icon: CreditCard  },
    { key: "contacts",  label: "Emergency Contacts", icon: Users       },
    { key: "documents", label: "Documents",          icon: FolderOpen  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>Self-Service</p>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0, letterSpacing: -0.4 }}>My Profile</h1>
      </div>

      {/* Profile card */}
      <div style={{ background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)", padding: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
          <img src={getAvatar(emp.firstName, emp.lastName)} alt="" style={{ width: 76, height: 76, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px" }}>{emp.firstName} {emp.lastName}</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 10px" }}>{emp.position || "—"} · {emp.department || "—"}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {[
                { label: `ID: ${emp.employeeId}`, color: "var(--accent)", bg: "var(--accent-light)" },
                { label: emp.status,              color: BLUE[700],        bg: BLUE[100]             },
                { label: emp.employmentType,      color: "var(--text-secondary)", bg: "var(--bg-body)" },
              ].map(b => (
                <span key={b.label} style={{ display: "inline-block", padding: "3px 12px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: b.bg, color: b.color, border: "0.5px solid var(--border)" }}>{b.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-card)", borderRadius: 11, border: "0.5px solid var(--border)", overflowX: "auto" }}>
        {TABS.map(t => {
          const Icon   = t.icon;
          const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, whiteSpace: "nowrap", fontSize: 12, fontWeight: active ? 600 : 400, border: "none", cursor: "pointer", background: active ? "var(--accent)" : "transparent", color: active ? "#fff" : "var(--text-secondary)", transition: "background 0.15s" }}>
              <Icon size={13} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div style={{ ...cardBase }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", borderBottom: "0.5px solid var(--border)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {(() => { const Icon = TABS.find(t => t.key === tab)!.icon; return <Icon size={14} style={{ color: "var(--accent)" }} />; })()}
          </div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{TABS.find(t => t.key === tab)!.label}</h3>
        </div>
        <div style={{ padding: 20 }}>

          {tab === "personal" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <Field label="First Name"     value={emp.firstName}     />
              <Field label="Last Name"      value={emp.lastName}      />
              <Field label="Email"          value={emp.email}         />
              <Field label="Phone"          value={emp.phone}         />
              <Field label="Date of Birth"  value={emp.dateOfBirth}   />
              <Field label="Gender"         value={emp.gender}        />
              <Field label="Marital Status" value={emp.maritalStatus} />
              <Field label="Nationality"    value={emp.nationality}   />
              <Field label="Address"        value={emp.address}       />
              <Field label="City"           value={emp.city}          />
              <Field label="State"          value={emp.state}         />
              <Field label="Country"        value={emp.country}       />
            </div>
          )}

          {tab === "work" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
              <Field label="Employee ID"     value={emp.employeeId}     />
              <Field label="Department"      value={emp.department}     />
              <Field label="Position"        value={emp.position}       />
              <Field label="Employment Type" value={emp.employmentType} />
              <Field label="Status"          value={emp.status}         />
              <Field label="Hire Date"       value={emp.hireDate}       />
            </div>
          )}

          {tab === "bank" && (
            emp.bankAccounts.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No bank accounts on file.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {emp.bankAccounts.map(a => (
                    <div key={a.id} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--bg-body)", border: "0.5px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 3px" }}>{a.bankName}</p>
                        <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>{a.accountType ?? "Account"} · •••• {a.accountNumber.slice(-4)}</p>
                      </div>
                      {a.isPrimary && <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--accent-light)", color: "var(--accent)" }}>Primary</span>}
                    </div>
                  ))}
                </div>
          )}

          {tab === "contacts" && (
            emp.contacts.length === 0
              ? <p style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>No emergency contacts on file.</p>
              : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {emp.contacts.map(c => (
                    <div key={c.id} style={{ padding: "14px 16px", borderRadius: 10, background: "var(--bg-body)", border: "0.5px solid var(--border)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{c.name}</p>
                        <span style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--accent-light)", color: "var(--accent)" }}>{c.relationship}</span>
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><Phone size={11} />{c.phone}</span>
                        {c.email && <span style={{ fontSize: 12, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4 }}><Mail size={11} />{c.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
          )}

          {tab === "documents" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Company documents */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 12px" }}>Company Documents</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {COMPANY_DOCS.map(doc => {
                    const tc   = DOC_TYPE_COLOR[doc.type] ?? DOC_TYPE_COLOR.Policy;
                    const Icon = doc.icon;
                    return (
                      <div key={doc.title} style={{ padding: "12px 14px", borderRadius: 10, border: "0.5px solid var(--border)", background: "var(--bg-body)", display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: tc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={15} style={{ color: tc.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{doc.title}</p>
                            <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 4, background: tc.bg, color: tc.color, fontWeight: 600, flexShrink: 0, marginLeft: 6 }}>{doc.type}</span>
                          </div>
                          <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: "0 0 8px", lineHeight: 1.4 }}>{doc.description}</p>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 5, background: "var(--accent-light)", color: "var(--accent)", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            <Download size={10} /> Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* My uploaded documents */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 12px" }}>My Documents</p>
                {docs.length === 0 ? (
                  <div style={{ padding: "28px 0", textAlign: "center", borderRadius: 10, border: "0.5px dashed var(--border)", background: "var(--bg-body)" }}>
                    <FileText size={26} style={{ color: "var(--border)", marginBottom: 8 }} />
                    <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "0 0 2px" }}>No documents on file</p>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>Contact HR to upload your documents</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {docs.map(d => (
                      <div key={d.id} style={{ padding: "11px 14px", borderRadius: 9, border: "0.5px solid var(--border)", background: "var(--bg-body)", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 7, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FileText size={13} style={{ color: "var(--accent)" }} />
                          </div>
                          <div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "0 0 1px" }}>{d.title}</p>
                            <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>{d.type} · {new Date(d.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ padding: "2px 8px", borderRadius: 999, fontSize: 10, fontWeight: 600, background: d.status === "Approved" ? "#dcfce7" : "var(--bg-card)", color: d.status === "Approved" ? "#15803d" : "var(--text-muted)", border: "0.5px solid var(--border)" }}>{d.status}</span>
                          <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 9px", borderRadius: 5, background: "var(--accent-light)", color: "var(--accent)", border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                            <Download size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
