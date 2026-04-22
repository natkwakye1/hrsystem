"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { Users, Plus, X, Loader2, ArrowLeft, Star, ChevronDown } from "lucide-react";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50: "#eff6ff",
};

const cardBase: React.CSSProperties = {
  background: "var(--bg-card)", borderRadius: 14, border: "0.5px solid var(--border)",
};
const inp: React.CSSProperties = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "0.5px solid var(--border)", background: "var(--bg-input)",
  color: "var(--text-primary)", fontSize: 13, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600, color: "var(--text-muted)",
  letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5,
};

const STAGES = ["Applied", "Screened", "Interview", "Offered", "Rejected", "Hired"];
const STAGE_COLOR: Record<string, { bg: string; color: string }> = {
  Applied:   { bg: BLUE[50],   color: BLUE[500]  },
  Screened:  { bg: BLUE[100],  color: BLUE[700]  },
  Interview: { bg: "#fef9c3",  color: "#a16207"  },
  Offered:   { bg: "#d1fae5",  color: "#065f46"  },
  Rejected:  { bg: "#fee2e2",  color: "#b91c1c"  },
  Hired:     { bg: "#dcfce7",  color: "#15803d"  },
};

interface Job {
  id: string; jobTitle: string; department: string; location?: string;
  employmentType?: string; status: string; salaryMin?: number; salaryMax?: number; requirements?: string;
}
interface Applicant {
  id: string; firstName: string; lastName: string; email: string; phone?: string;
  skills?: string; experience?: number; education?: string; status: string; score?: number; notes?: string; createdAt: string;
}

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color = score >= 75 ? "#15803d" : score >= 50 ? "#a16207" : "#b91c1c";
  const bg    = score >= 75 ? "#dcfce7" : score >= 50 ? "#fef9c3" : "#fee2e2";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700, background: bg, color }}>
      <Star size={9} /> {score.toFixed(0)}%
    </span>
  );
}

export default function ApplicantsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job,        setJob]        = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [updating,   setUpdating]   = useState<string | null>(null);
  const [statusOpen, setStatusOpen] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState("All");
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "",
    skills: "", experience: "", education: "", coverLetter: "", notes: "",
  });

  const load = () => {
    Promise.all([
      fetch(`/api/recruitment/${id}`).then(r => r.json()),
      fetch(`/api/recruitment/${id}/applicants`).then(r => r.json()),
    ]).then(([jobData, appData]) => {
      setJob(jobData);
      setApplicants(appData.applicants ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/recruitment/${id}/applicants`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      load();
      setModal(false);
      setForm({ firstName: "", lastName: "", email: "", phone: "", skills: "", experience: "", education: "", coverLetter: "", notes: "" });
    } finally { setSaving(false); }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdating(appId);
    try {
      await fetch(`/api/recruitment/${id}/applicants/${appId}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } finally { setUpdating(null); setStatusOpen(null); }
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[80, 300, 300].map((h, i) => <div key={i} style={{ height: h, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
    </div>
  );

  if (!job) return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <p style={{ color: "var(--text-muted)" }}>Job not found.</p>
      <Link href="/recruitment" style={{ color: "var(--accent)", fontSize: 13 }}>Back to Recruitment</Link>
    </div>
  );

  const filtered = stageFilter === "All" ? applicants : applicants.filter(a => a.status === stageFilter);
  const stageCounts = STAGES.reduce((acc, s) => ({ ...acc, [s]: applicants.filter(a => a.status === s).length }), {} as Record<string, number>);

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Header */}
        <div>
          <Link href="/recruitment" style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "var(--text-muted)", textDecoration: "none", marginBottom: 12 }}>
            <ArrowLeft size={13} /> Back to Recruitment
          </Link>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>ATS · {job.department}</p>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 4px", letterSpacing: -0.4 }}>{job.jobTitle}</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[
                  { label: job.status, color: BLUE[700], bg: BLUE[100] },
                  { label: job.employmentType ?? "", color: "var(--text-secondary)", bg: "var(--bg-body)" },
                  ...(job.salaryMin ? [{ label: `$${(job.salaryMin/1000).toFixed(0)}K–$${(job.salaryMax!/1000).toFixed(0)}K`, color: BLUE[600], bg: BLUE[50] }] : []),
                ].filter(b => b.label).map(b => (
                  <span key={b.label} style={{ padding: "2px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: b.bg, color: b.color, border: "0.5px solid var(--border)" }}>{b.label}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setModal(true)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" }}>
              <Plus size={14} /> Add Applicant
            </button>
          </div>
        </div>

        {/* Pipeline stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 10 }}>
          {[{ label: "All", count: applicants.length }, ...STAGES.map(s => ({ label: s, count: stageCounts[s] }))].map(s => {
            const sc = STAGE_COLOR[s.label] ?? { bg: "var(--bg-body)", color: "var(--text-secondary)" };
            return (
              <button
                key={s.label}
                onClick={() => setStageFilter(s.label)}
                style={{ padding: "10px 12px", borderRadius: 10, border: stageFilter === s.label ? `2px solid ${BLUE[500]}` : "0.5px solid var(--border)", background: stageFilter === s.label ? BLUE[50] : "var(--bg-card)", cursor: "pointer", textAlign: "left" }}
              >
                <p style={{ fontSize: 10, fontWeight: 600, color: stageFilter === s.label ? BLUE[600] : "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 4px" }}>{s.label}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: stageFilter === s.label ? BLUE[600] : "var(--text-primary)", margin: 0 }}>{s.count}</p>
              </button>
            );
          })}
        </div>

        {/* Applicant cards */}
        {filtered.length === 0 ? (
          <div style={{ ...cardBase, padding: "48px 0", textAlign: "center" }}>
            <Users size={32} style={{ color: "var(--border)", marginBottom: 10 }} />
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{stageFilter === "All" ? "No applicants yet" : `No ${stageFilter} applicants`}</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {filtered.map(a => {
              const sc = STAGE_COLOR[a.status] ?? STAGE_COLOR.Applied;
              return (
                <div key={a.id} style={{ ...cardBase, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 2px" }}>{a.firstName} {a.lastName}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>{a.email}</p>
                    </div>
                    <ScoreBadge score={a.score} />
                  </div>

                  {a.skills && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {a.skills.split(",").slice(0, 4).map(s => s.trim()).filter(Boolean).map(s => (
                        <span key={s} style={{ padding: "2px 7px", borderRadius: 4, background: BLUE[50], color: BLUE[600], fontSize: 10, fontWeight: 600 }}>{s}</span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: 12, fontSize: 11, color: "var(--text-secondary)" }}>
                    {a.experience != null && <span>{a.experience}yr exp</span>}
                    {a.education && <span>{a.education}</span>}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "0.5px solid var(--border)" }}>
                    <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(a.createdAt).toLocaleDateString()}</span>
                    <div style={{ position: "relative" }}>
                      <button
                        onClick={() => setStatusOpen(statusOpen === a.id ? null : a.id)}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 6, background: sc.bg, color: sc.color, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                      >
                        {a.status} {updating === a.id ? <Loader2 size={10} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronDown size={10} />}
                      </button>
                      {statusOpen === a.id && (
                        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: 4, background: "var(--bg-card)", border: "0.5px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-card)", zIndex: 20, minWidth: 140 }}>
                          {STAGES.map(stage => (
                            <button
                              key={stage}
                              onClick={() => updateStatus(a.id, stage)}
                              style={{ display: "block", width: "100%", padding: "8px 14px", background: "none", border: "none", textAlign: "left", fontSize: 12, color: stage === a.status ? "var(--accent)" : "var(--text-primary)", fontWeight: stage === a.status ? 700 : 400, cursor: "pointer" }}
                            >
                              {stage}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Applicant Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.4)", padding: 20, overflowY: "auto" }}>
          <div style={{ background: "var(--bg-card)", borderRadius: 16, width: "100%", maxWidth: 560, boxShadow: "var(--shadow-xl)", margin: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "0.5px solid var(--border)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Add Applicant</h3>
              <button onClick={() => setModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
            </div>
            <form onSubmit={handleAdd} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div><label style={lbl}>First Name</label><input required value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Last Name</label><input required value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Email</label><input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Phone</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} style={inp} /></div>
                <div><label style={lbl}>Experience (years)</label><input type="number" min="0" value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} style={inp} placeholder="0" /></div>
                <div><label style={lbl}>Education</label><input value={form.education} onChange={e => setForm(f => ({ ...f, education: e.target.value }))} style={inp} placeholder="e.g. Bachelor's in CS" /></div>
              </div>
              <div><label style={lbl}>Skills (comma-separated)</label><input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} style={inp} placeholder="React, TypeScript, Node.js" /></div>
              <div><label style={lbl}>Cover Letter</label><textarea value={form.coverLetter} onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))} rows={3} style={{ ...inp, resize: "none" }} /></div>
              <div><label style={lbl}>Internal Notes</label><textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ ...inp, resize: "none" }} placeholder="Recruiter notes..." /></div>
              <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>The ATS will automatically score this applicant based on skills match, experience, and education against the job requirements.</p>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 12, borderTop: "0.5px solid var(--border)" }}>
                <button type="button" onClick={() => setModal(false)} style={{ padding: "9px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: "var(--text-secondary)", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 20px", borderRadius: 8, background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", opacity: saving ? 0.75 : 1 }}>
                  {saving ? <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> : <Plus size={13} />} Add Applicant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
