"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  LayoutDashboard, Users, Wallet, CalendarDays, Heart, Briefcase,
  ClipboardCheck, Settings, BarChart3, LogOut, Search,
  ChevronDown, ChevronRight, Inbox,
} from "lucide-react";

const FONT_URL =
  "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";

const COLLAPSED_W = 62;
const EXPANDED_W  = 256;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

function extractCompanySlug(pathname: string): string {
  // Pathname is /{companySlug}/admin/... — extract slug from part[1]
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[1] === "admin") return parts[0];
  return "";
}

function buildGroups(slug: string) {
  const base = slug ? `/${slug}/admin` : "";
  return [
    {
      label: "Administrative",
      items: [
        { label: "Dashboard",           href: `${base}`,                icon: LayoutDashboard, exact: true  },
        { label: "Employees",           href: `${base}/employees`,      icon: Users            },
        { label: "Payroll",             href: `${base}/payroll`,        icon: Wallet           },
        { label: "Leave Management",    href: `${base}/leave`,          icon: CalendarDays     },
        { label: "HR Requests",         href: `${base}/requests`,       icon: Inbox            },
        { label: "Reports & Analytics", href: `${base}/reports`,        icon: BarChart3        },
      ],
    },
    {
      label: "Talent & Growth",
      items: [
        { label: "Recruitment",           href: `${base}/recruitment`,         icon: Briefcase    },
        { label: "Onboarding",            href: `${base}/onboarding-tracker`,  icon: ClipboardCheck },
        { label: "Benefits & Deductions", href: `${base}/benefits`,            icon: Heart        },
        { label: "Settings",              href: `${base}/settings`,            icon: Settings     },
      ],
    },
  ];
}

export default function Sidebar({ isOpen, onClose, collapsed, onToggleCollapse }: Props) {
  const pathname    = usePathname();
  const companySlug = extractCompanySlug(pathname);
  const groups      = buildGroups(companySlug);
  const allItems    = groups.flatMap(g => g.items);
  const [query, setQuery] = useState("");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    if (!companySlug) return;
    fetch(`/api/company/info?slug=${encodeURIComponent(companySlug)}`)
      .then(r => r.json())
      .then(d => { if (d.company?.name) setCompanyName(d.company.name); })
      .catch(() => {});
  }, [companySlug]);

  const baseAdmin = companySlug ? `/${companySlug}/admin` : "";

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href || pathname === `/${companySlug}/admin`;
    return pathname.startsWith(href) && href.length > 1;
  };

  const logout = () => {
    document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const loginPath = companySlug ? `/${companySlug}/login` : "/login";
    window.location.href = loginPath;
  };

  const filtered = query.trim()
    ? groups
        .map(g => ({
          ...g,
          items: g.items.filter(i => i.label.toLowerCase().includes(query.toLowerCase())),
        }))
        .filter(g => g.items.length > 0)
    : groups;

  useEffect(() => {
    if (collapsed) setQuery("");
  }, [collapsed]);

  const w = collapsed ? COLLAPSED_W : EXPANDED_W;

  return (
    <>
      <style>{`
        @import url('${FONT_URL}');
        .nera-sidebar, .nera-sidebar * { font-family: 'Poppins', sans-serif !important; }
        .nera-sidebar { transition: width 0.26s cubic-bezier(.4,0,.2,1), transform 0.26s cubic-bezier(.4,0,.2,1); }
        .nera-link { transition: background 0.15s, color 0.15s; text-decoration: none; display: flex; align-items: center; border-radius: 9px; position: relative; cursor: pointer; }
        .nera-link:hover:not(.active-link) { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .nera-link.active-link { background: var(--accent) !important; color: #fff !important; }
        .rail-icon { transition: background 0.15s, color 0.15s; display: flex; align-items: center; justify-content: center; border-radius: 9px; text-decoration: none; cursor: pointer; }
        .rail-icon:hover:not(.rail-active) { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .rail-icon.rail-active { background: var(--accent) !important; color: #fff !important; }
        .nera-logout:hover { background: var(--bg-hover) !important; color: var(--text-primary) !important; }
        .nera-search:focus { border-color: var(--accent) !important; outline: none; }
        .rail-tooltip { position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%); background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border); padding: 5px 10px; border-radius: 7px; font-size: 11px; font-weight: 600; white-space: nowrap; pointer-events: none; opacity: 0; transition: opacity 0.15s; z-index: 200; }
        .rail-icon:hover .rail-tooltip { opacity: 1; }
      `}</style>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="lg:hidden"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40, backdropFilter: "blur(3px)" }}
        />
      )}

      <aside
        className={`nera-sidebar ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
        style={{ position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 50, width: w, background: "var(--bg-sidebar)", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {collapsed ? (
          <>
            {/* Collapsed: icon rail */}
            <div style={{ height: 62, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <Link href={baseAdmin || "/dashboard"} style={{ textDecoration: "none" }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{companyName.charAt(0).toUpperCase() || "N"}</span>
                </div>
              </Link>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "10px 0", gap: 2, overflowY: "auto" }}>
              {allItems.map(item => {
                const active = isActive(item.href, (item as any).exact);
                const Icon   = item.icon;
                return (
                  <Link key={item.href} href={item.href} className={`rail-icon${active ? " rail-active" : ""}`}
                    style={{ width: 38, height: 38, color: active ? "#fff" : "var(--text-muted)", background: active ? "var(--accent)" : "transparent", position: "relative" }} title={item.label}>
                    {active && <span style={{ position: "absolute", left: -11, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 3px 3px 0", background: "var(--accent)" }} />}
                    <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
                    <span className="rail-tooltip">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div style={{ borderTop: "1px solid var(--border)", padding: "10px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <button onClick={logout} className="rail-icon" title="Log Out"
                style={{ width: 38, height: 38, border: "none", cursor: "pointer", background: "transparent", color: "var(--text-muted)", position: "relative" }}>
                <LogOut size={15} strokeWidth={1.8} />
                <span className="rail-tooltip">Log Out</span>
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Expanded sidebar */}
            <div style={{ height: 62, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
              <Link href={baseAdmin || "/dashboard"} style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>{companyName.charAt(0).toUpperCase() || "N"}</span>
                </div>
                <div>
                  <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--text-primary)", letterSpacing: -0.3, lineHeight: 1.2 }}>{companyName || "Loading…"}</p>
                  <p style={{ margin: 0, fontSize: 9.5, fontWeight: 500, color: "var(--text-muted)" }}>Admin Portal</p>
                </div>
              </Link>
              <div />
            </div>

            {/* Company / admin badge */}
            <div style={{ padding: "12px 12px 6px" }}>
              <div style={{ padding: "9px 10px", borderRadius: 10, background: "var(--bg-hover)", display: "flex", alignItems: "center", gap: 9, cursor: "pointer", border: "1px solid transparent", transition: "border-color 0.15s" }}
                onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)")}
                onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.borderColor = "transparent")}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
                    {companySlug ? companySlug.slice(0, 2).toUpperCase() : "NA"}
                  </div>
                  <span style={{ position: "absolute", bottom: 0, right: 0, width: 8, height: 8, borderRadius: "50%", background: "#2563eb", border: "2px solid var(--bg-sidebar)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 10, color: "var(--text-muted)", margin: 0 }}>Logged in as</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)", margin: "1px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Administrator</p>
                </div>
                <ChevronDown size={13} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
              </div>
            </div>

            {/* Search */}
            <div style={{ padding: "4px 12px 8px", position: "relative" }}>
              <Search size={12} style={{ position: "absolute", left: 22, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }} />
              <input type="text" placeholder="Search menu..." value={query} onChange={e => setQuery(e.target.value)} className="nera-search"
                style={{ width: "100%", padding: "7px 9px 7px 28px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg-input)", fontSize: 11, fontWeight: 400, color: "var(--text-primary)", boxSizing: "border-box", transition: "border-color 0.15s" }} />
            </div>

            <div style={{ height: 1, background: "var(--border)", margin: "0 12px 4px" }} />

            {/* Nav */}
            <nav style={{ flex: 1, overflowY: "auto", padding: "4px 0 8px" }}>
              {filtered.map(g => (
                <div key={g.label} style={{ marginBottom: 2 }}>
                  <p style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.09em", padding: "10px 16px 4px", textTransform: "uppercase", margin: 0 }}>{g.label}</p>
                  {g.items.map(item => {
                    const active = isActive(item.href, (item as any).exact);
                    const Icon   = item.icon;
                    return (
                      <Link key={item.href} href={item.href} onClick={onClose}
                        className={`nera-link${active ? " active-link" : ""}`}
                        style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 10px 7px 12px", margin: "1px 8px", fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#fff" : "var(--text-secondary)", background: active ? "var(--accent)" : "transparent" }}>
                        {active && <span style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", width: 3, height: 18, borderRadius: "0 3px 3px 0", background: "var(--accent)" }} />}
                        <span style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(255,255,255,0.18)" : "var(--bg-hover)", flexShrink: 0 }}>
                          <Icon size={13} strokeWidth={active ? 2.3 : 1.8} />
                        </span>
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {active && <ChevronRight size={12} style={{ opacity: 0.7 }} />}
                      </Link>
                    );
                  })}
                </div>
              ))}
              {filtered.length === 0 && (
                <div style={{ padding: "28px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0 }}>No results for &ldquo;{query}&rdquo;</p>
                </div>
              )}
            </nav>

            <div style={{ height: 1, background: "var(--border)", margin: "0 12px" }} />

            {/* Logout */}
            <div style={{ padding: "8px 8px 16px" }}>
              <button onClick={logout} className="nera-link nera-logout"
                style={{ display: "flex", alignItems: "center", gap: 9, width: "100%", padding: "8px 10px 8px 12px", fontSize: 12, fontWeight: 500, color: "var(--text-secondary)", background: "none", border: "none", cursor: "pointer", textAlign: "left", transition: "background 0.15s, color 0.15s" }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-hover)", flexShrink: 0 }}>
                  <LogOut size={13} strokeWidth={1.8} />
                </span>
                <span>Log Out</span>
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
