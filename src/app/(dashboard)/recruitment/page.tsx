"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Briefcase, MapPin, Users, Clock, Plus, Loader2,
  DollarSign, ChevronRight, ChevronLeft, Search,
} from "lucide-react";

const PAGE_SIZE = 15;
import Modal from "@/components/Modal";

/* ─────────────────────────────────────────
   Font + Palette
───────────────────────────────────────── */
const FONT_URL =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";

const BLUE = {
  900: "#1e3a8a", 700: "#1d4ed8", 600: "#2563eb",
  500: "#3b82f6", 400: "#60a5fa", 300: "#93c5fd",
  200: "#bfdbfe", 100: "#dbeafe", 50:  "#eff6ff",
};

const STATUS_CONFIG: Record<string, { bg: string; color: string }> = {
  Open:      { bg: BLUE[100], color: BLUE[700] },
  Closed:    { bg: BLUE[200], color: BLUE[900] },
  "On Hold": { bg: BLUE[50],  color: BLUE[500] },
};

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
   Dept icon accent color
───────────────────────────────────────── */
const DEPT_SHADES = [BLUE[600], BLUE[700], BLUE[500], BLUE[400], BLUE[300], BLUE[200]];
function deptColor(dept: string) {
  let h = 0;
  for (let i = 0; i < dept.length; i++) h = dept.charCodeAt(i) + ((h << 5) - h);
  return DEPT_SHADES[Math.abs(h) % DEPT_SHADES.length];
}

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
interface Job {
  id: string; jobTitle: string; department: string; location: string;
  employmentType: string; description: string; requirements: string;
  salaryMin: number; salaryMax: number; status: string;
  applicants: number; postedDate: string; closingDate: string;
}

/* ─────────────────────────────────────────
   KPI mini-card
───────────────────────────────────────── */
function KpiCard({
  icon: Icon, label, value, accentBg, accentColor,
}: {
  icon: React.ElementType; label: string; value: string | number;
  accentBg: string; accentColor: string;
}) {
  return (
    <div style={{ ...cardBase, padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 8, background: accentBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={15} color={accentColor} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 3px" }}>{label}</p>
        <p style={{ fontSize: 26, fontWeight: 600, letterSpacing: -1, margin: 0, lineHeight: 1, color: "var(--text-primary)" }}>{value}</p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function RecruitmentPage() {
  const [jobs,       setJobs]       = useState<Job[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [query,      setQuery]      = useState("");
  const [page,       setPage]       = useState(1);
  const [form, setForm] = useState({
    jobTitle: "", department: "", location: "", employmentType: "Full-time",
    description: "", requirements: "", salaryMin: "", salaryMax: "", closingDate: "",
  });

  const fetchJobs = () => {
    setLoading(true);
    fetch("/api/recruitment")
      .then(r => r.json())
      .then(d => { setJobs(d || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const res = await fetch("/api/recruitment", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({ jobTitle: "", department: "", location: "", employmentType: "Full-time", description: "", requirements: "", salaryMin: "", salaryMax: "", closingDate: "" });
        fetchJobs();
      }
    } finally { setSubmitting(false); }
  };

  const handleStatusToggle = async (job: Job) => {
    const newStatus = job.status === "Open" ? "Closed" : "Open";
    await fetch(`/api/recruitment/${job.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...job, status: newStatus }),
    });
    fetchJobs();
  };

  const openJobs        = jobs.filter(j => j.status === "Open").length;
  const totalApplicants = jobs.reduce((s, j) => s + j.applicants, 0);
  const avgSalary       = jobs.length
    ? `$${Math.round(jobs.reduce((s, j) => s + (j.salaryMin + j.salaryMax) / 2, 0) / jobs.length / 1000)}K`
    : "$0K";

  const filtered = query.trim()
    ? jobs.filter(j =>
        j.jobTitle.toLowerCase().includes(query.toLowerCase()) ||
        j.department.toLowerCase().includes(query.toLowerCase())
      )
    : jobs;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { setPage(1); }, [query]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const startEntry = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endEntry   = Math.min(page * PAGE_SIZE, filtered.length);

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[1,2,3,4].map(i => <div key={i} style={{ height: 100, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 16 }}>
        {[1,2,3,4,5,6].map(i => <div key={i} style={{ height: 220, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />)}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .recruit-page * { font-family: 'DM Sans', sans-serif !important; }
        .job-card:hover { border-color: ${BLUE[300]} !important; }
        .job-card:hover .job-arrow { opacity: 1 !important; transform: translateX(0) !important; }
        .add-btn:hover { opacity: 0.85; }

        .recruit-page {
          --bg-card:   #ffffff;
          --bg-hover:  #f8fafc;
          --bg-input:  #f8fafc;
          --border:    rgba(0,0,0,0.08);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .recruit-page {
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

      <div className="recruit-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
              Talent Acquisition
            </p>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
              Recruitment
            </h1>
          </div>
          <button
            className="add-btn"
            onClick={() => setShowModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "opacity 0.15s" }}
          >
            <Plus size={14} /> Post New Job
          </button>
        </div>

        {/* ── KPI row ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
          <KpiCard icon={Briefcase}  label="Total Positions"   value={jobs.length}       accentBg={BLUE[50]}  accentColor={BLUE[600]} />
          <KpiCard icon={Clock}      label="Open Positions"    value={openJobs}           accentBg={BLUE[100]} accentColor={BLUE[700]} />
          <KpiCard icon={Users}      label="Total Applicants"  value={totalApplicants}    accentBg={BLUE[50]}  accentColor={BLUE[500]} />
          <KpiCard icon={DollarSign} label="Avg. Salary Range" value={avgSalary}          accentBg={BLUE[200]} accentColor={BLUE[900]} />
        </div>

        {/* ── Toolbar: search + status strip ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 320 }}>
            <Search size={12} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
            <input
              type="text" placeholder="Search positions…"
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ ...inp, paddingLeft: 30 }}
            />
          </div>

          {/* Status counts */}
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { label: "Open",    count: jobs.filter(j => j.status === "Open").length,    bg: BLUE[100], color: BLUE[700] },
              { label: "On Hold", count: jobs.filter(j => j.status === "On Hold").length, bg: BLUE[50],  color: BLUE[500] },
              { label: "Closed",  count: jobs.filter(j => j.status === "Closed").length,  bg: BLUE[200], color: BLUE[900] },
            ].map(s => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 7, background: s.bg }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0, display: "inline-block" }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.count} {s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Job cards grid ── */}
        {filtered.length === 0 ? (
          <div style={{ ...cardBase, padding: "48px 20px", textAlign: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
              <Briefcase size={18} style={{ color: BLUE[500] }} />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
              {query ? `No positions match "${query}"` : "No positions posted yet"}
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16 }}>
            {paginated.map(job => {
              const badge     = STATUS_CONFIG[job.status] || { bg: BLUE[50], color: BLUE[600] };
              const iconColor = deptColor(job.department || "x");
              return (
                <div
                  key={job.id}
                  className="job-card"
                  style={{ ...cardBase, padding: 20, display: "flex", flexDirection: "column", gap: 0, transition: "border-color 0.18s", cursor: "default" }}
                >
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${iconColor}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Briefcase size={16} style={{ color: iconColor }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span
                        onClick={() => handleStatusToggle(job)}
                        title="Click to toggle status"
                        style={{ fontSize: 10, fontWeight: 600, padding: "2px 9px", borderRadius: 5, background: badge.bg, color: badge.color, cursor: "pointer", letterSpacing: 0.2, userSelect: "none", transition: "opacity 0.15s" }}
                        onMouseEnter={e => ((e.currentTarget as HTMLSpanElement).style.opacity = "0.7")}
                        onMouseLeave={e => ((e.currentTarget as HTMLSpanElement).style.opacity = "1")}
                      >
                        {job.status}
                      </span>
                      <ChevronRight
                        className="job-arrow"
                        size={14}
                        style={{ color: BLUE[400], opacity: 0, transform: "translateX(-4px)", transition: "opacity 0.18s, transform 0.18s" }}
                      />
                    </div>
                  </div>

                  {/* Title + dept */}
                  <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.2 }}>{job.jobTitle}</p>
                  <p style={{ margin: "0 0 14px", fontSize: 11, fontWeight: 500, color: BLUE[500] }}>{job.department}</p>

                  {/* Meta */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                    {[
                      { icon: MapPin, text: job.location || "Not specified" },
                      { icon: Clock,  text: job.employmentType },
                      { icon: Users,  text: `${job.applicants} applicant${job.applicants !== 1 ? "s" : ""}` },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 22, height: 22, borderRadius: 6, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={10} style={{ color: BLUE[500] }} />
                        </div>
                        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>{text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "0.5px solid var(--border)", marginTop: "auto" }}>
                    <div>
                      <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Salary</p>
                      <p style={{ margin: "2px 0 0", fontSize: 13, fontWeight: 600, color: BLUE[600], letterSpacing: -0.2 }}>
                        ${(job.salaryMin / 1000).toFixed(0)}K – ${(job.salaryMax / 1000).toFixed(0)}K
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0, fontSize: 9.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Posted</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, fontWeight: 500, color: "var(--text-secondary)" }}>{job.postedDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "4px 0" }}>
            <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0 }}>
              Showing <strong>{startEntry}–{endEntry}</strong> of <strong>{filtered.length}</strong> positions
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === 1 ? "var(--text-muted)" : "var(--text-primary)", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronLeft size={14} />
              </button>
              {(() => {
                const items: (number | "...")[] = [];
                if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) items.push(i); }
                else {
                  items.push(1);
                  if (page > 3) items.push("...");
                  for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) items.push(i);
                  if (page < totalPages - 2) items.push("...");
                  items.push(totalPages);
                }
                return items.map((item, i) => item === "..." ? (
                  <span key={`d${i}`} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "var(--text-muted)" }}>…</span>
                ) : (
                  <button key={item} onClick={() => setPage(item as number)}
                    style={{ width: 32, height: 32, borderRadius: 8, border: page === item ? `0.5px solid ${BLUE[400]}` : "0.5px solid transparent", background: page === item ? BLUE[50] : "transparent", color: page === item ? BLUE[600] : "var(--text-secondary)", fontSize: 12, fontWeight: page === item ? 600 : 400, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {item}
                  </button>
                ));
              })()}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ width: 32, height: 32, borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-card)", color: page === totalPages ? "var(--text-muted)" : "var(--text-primary)", cursor: page === totalPages ? "not-allowed" : "pointer", opacity: page === totalPages ? 0.45 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Modal ── */}
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Post new job" size="lg">
          <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={lbl}>Job Title <span style={{ color: BLUE[500] }}>*</span></label>
                <input required value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} style={inp} placeholder="e.g. Senior Engineer" />
              </div>
              <div>
                <label style={lbl}>Department</label>
                <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} style={inp}>
                  <option value="">Select</option>
                  {["Engineering","Design","Marketing","Human Resources","Finance","Sales","Operations","Product","Legal","Support"].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={lbl}>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} style={inp} placeholder="e.g. Remote, New York" />
              </div>
              <div>
                <label style={lbl}>Employment Type</label>
                <select value={form.employmentType} onChange={e => setForm({ ...form, employmentType: e.target.value })} style={inp}>
                  {["Full-time","Part-time","Contract","Intern"].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>Min Salary</label>
                <input type="number" value={form.salaryMin} onChange={e => setForm({ ...form, salaryMin: e.target.value })} style={inp} placeholder="50000" />
              </div>
              <div>
                <label style={lbl}>Max Salary</label>
                <input type="number" value={form.salaryMax} onChange={e => setForm({ ...form, salaryMax: e.target.value })} style={inp} placeholder="90000" />
              </div>
            </div>
            <div>
              <label style={lbl}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...inp, resize: "none" }} placeholder="Role description…" />
            </div>
            <div>
              <label style={lbl}>Closing Date</label>
              <input type="date" value={form.closingDate} onChange={e => setForm({ ...form, closingDate: e.target.value })} style={{ ...inp, maxWidth: 200 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 14, borderTop: "0.5px solid var(--border)" }}>
              <button type="button" onClick={() => setShowModal(false)} style={{ padding: "8px 16px", borderRadius: 8, border: "0.5px solid var(--border)", background: "var(--bg-hover)", color: "var(--text-secondary)", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", background: BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, transition: "opacity 0.15s" }}>
                {submitting && <Loader2 size={13} className="animate-spin" />}
                Post Job
              </button>
            </div>
          </form>
        </Modal>

      </div>
    </>
  );
}