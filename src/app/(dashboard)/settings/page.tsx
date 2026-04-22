"use client";

import { useEffect, useState } from "react";
import { Settings, Building2, Wallet, CalendarDays, Save, Loader2, CheckCircle2 } from "lucide-react";

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
  transition: "border-color 0.15s",
};

const lbl: React.CSSProperties = {
  display: "block", fontSize: 10, fontWeight: 600,
  color: "var(--text-muted)", letterSpacing: "0.07em",
  textTransform: "uppercase", marginBottom: 5,
};

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
interface SettingItem { key: string; value: string; group: string; }

const settingGroups = [
  { key: "general", label: "Company Information", icon: Building2   },
  { key: "payroll", label: "Payroll Settings",    icon: Wallet      },
  { key: "leave",   label: "Leave Policy",        icon: CalendarDays },
];

const settingLabels: Record<string, string> = {
  company_name:      "Company Name",
  company_email:     "Company Email",
  company_phone:     "Phone Number",
  company_address:   "Address",
  currency:          "Currency",
  pay_cycle:         "Pay Cycle",
  tax_year:          "Tax Year",
  leave_year_start:  "Leave Year Start",
  annual_leave_days: "Annual Leave Days",
  sick_leave_days:   "Sick Leave Days",
};

/* ─────────────────────────────────────────
   Page
───────────────────────────────────────── */
export default function SettingsPage() {
  const [settings,    setSettings]    = useState<SettingItem[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [activeGroup, setActiveGroup] = useState("general");

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then(d => { setSettings(d.settings || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value } : s));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const groupSettings = settings.filter(s => s.group === activeGroup);
      await fetch("/api/settings", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: groupSettings }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const groupSettings    = settings.filter(s => s.group === activeGroup);
  const activeGroupLabel = settingGroups.find(g => g.key === activeGroup)?.label;
  const ActiveIcon       = settingGroups.find(g => g.key === activeGroup)?.icon ?? Settings;

  /* ── Loading skeleton ── */
  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      <div style={{ height: 54, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ height: 360, borderRadius: 14, background: "var(--border)", animation: "pulse 1.4s ease-in-out infinite" }} />
    </div>
  );

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .settings-page * { font-family: 'DM Sans', sans-serif !important; }
        .settings-inp:focus { border-color: ${BLUE[400]} !important; }
        .tab-btn:hover:not(.tab-active) { background: var(--bg-hover) !important; }

        .settings-page {
          --bg-card:   #ffffff;
          --bg-hover:  #f8fafc;
          --bg-input:  #f8fafc;
          --border:    rgba(0,0,0,0.08);
          --text-primary:   #0f172a;
          --text-secondary: #64748b;
          --text-muted:     #94a3b8;
        }
        @media (prefers-color-scheme: dark) {
          .settings-page {
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

      <div className="settings-page" style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Header ── */}
        <div>
          <p style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", margin: "0 0 3px" }}>
            Configuration
          </p>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: "var(--text-primary)", margin: 0, letterSpacing: -0.5 }}>
            Settings
          </h1>
        </div>

        {/* ── Tabs + Save row ── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          {/* Tabs */}
          <div style={{ display: "flex", gap: 3, padding: 4, background: "var(--bg-card)", borderRadius: 11, border: "0.5px solid var(--border)", overflowX: "auto" }}>
            {settingGroups.map(group => {
              const Icon  = group.icon;
              const isAct = activeGroup === group.key;
              return (
                <button
                  key={group.key}
                  className={`tab-btn${isAct ? " tab-active" : ""}`}
                  onClick={() => setActiveGroup(group.key)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 8, whiteSpace: "nowrap", fontSize: 12, fontWeight: isAct ? 600 : 400, border: "none", cursor: "pointer", background: isAct ? BLUE[600] : "transparent", color: isAct ? "#fff" : "var(--text-secondary)", transition: "background 0.15s, color 0.15s" }}
                >
                  <Icon size={13} /> {group.label}
                </button>
              );
            })}
          </div>

          {/* Save */}
          <button
            onClick={handleSave} disabled={saving}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saved ? BLUE[700] : BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, opacity: saving ? 0.7 : 1, transition: "background 0.2s, opacity 0.15s" }}
          >
            {saving  ? <Loader2 size={13} className="animate-spin" />
             : saved ? <CheckCircle2 size={13} />
             :         <Save size={13} />}
            {saved ? "Saved" : "Save Changes"}
          </button>
        </div>

        {/* ── Form card ── */}
        <div style={{ ...cardBase, padding: 24 }}>
          {/* Card header */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 18, borderBottom: "0.5px solid var(--border)" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: BLUE[50], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <ActiveIcon size={18} style={{ color: BLUE[500] }} />
            </div>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: BLUE[500], textTransform: "uppercase", letterSpacing: "0.07em" }}>
                {activeGroup}
              </p>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: "var(--text-primary)", letterSpacing: -0.3 }}>
                {activeGroupLabel}
              </h3>
            </div>
          </div>

          {/* Fields grid */}
          {groupSettings.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No settings found for this group.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
              {groupSettings.map(setting => (
                <div key={setting.key} style={{ display: "flex", flexDirection: "column" }}>
                  <label style={lbl}>{settingLabels[setting.key] || setting.key}</label>

                  {setting.key === "company_address" ? (
                    <textarea
                      value={setting.value}
                      onChange={e => handleChange(setting.key, e.target.value)}
                      rows={3}
                      className="settings-inp"
                      style={{ ...inp, resize: "none" }}
                    />
                  ) : setting.key === "currency" ? (
                    <select value={setting.value} onChange={e => handleChange(setting.key, e.target.value)} className="settings-inp" style={{ ...inp, cursor: "pointer" }}>
                      <option value="USD">USD — US Dollar</option>
                      <option value="EUR">EUR — Euro</option>
                      <option value="GBP">GBP — British Pound</option>
                      <option value="GHS">GHS — Ghana Cedi</option>
                    </select>
                  ) : setting.key === "pay_cycle" ? (
                    <select value={setting.value} onChange={e => handleChange(setting.key, e.target.value)} className="settings-inp" style={{ ...inp, cursor: "pointer" }}>
                      <option value="Weekly">Weekly</option>
                      <option value="Bi-Weekly">Bi-Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                  ) : (
                    <input
                      type={setting.key.includes("days") || setting.key === "tax_year" ? "number" : "text"}
                      value={setting.value}
                      onChange={e => handleChange(setting.key, e.target.value)}
                      className="settings-inp"
                      style={inp}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bottom save */}
          <div style={{ marginTop: 24, paddingTop: 18, borderTop: "0.5px solid var(--border)", display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSave} disabled={saving}
              style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 18px", borderRadius: 8, border: "none", cursor: saving ? "not-allowed" : "pointer", background: saved ? BLUE[700] : BLUE[600], color: "#fff", fontSize: 12, fontWeight: 600, opacity: saving ? 0.7 : 1, transition: "background 0.2s, opacity 0.15s" }}
            >
              {saving  ? <Loader2 size={13} className="animate-spin" />
               : saved ? <CheckCircle2 size={13} />
               :         <Save size={13} />}
              {saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>

      </div>
    </>
  );
}