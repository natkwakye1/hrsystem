"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: { value: number; up: boolean };
  color?: string;
}

export default function StatsCard({ label, value, sub, icon: Icon, trend, color = "var(--accent)" }: Props) {
  return (
    <div style={{
      background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border)",
      padding: "20px 20px", display: "flex", alignItems: "flex-start", justifyContent: "space-between",
      boxShadow: "var(--shadow-card)", minWidth: 0,
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)", margin: 0, marginBottom: 8 }}>{label}</p>
        <p style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: 0, lineHeight: 1.1 }}>{value}</p>
        {trend && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 8 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 2, fontSize: 11, fontWeight: 600,
              padding: "2px 6px", borderRadius: 6,
              color: trend.up ? "var(--success)" : "var(--danger)",
              background: trend.up ? "var(--success-light)" : "var(--danger-light)",
            }}>
              {trend.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
              {trend.value}%
            </span>
          </div>
        )}
        {sub && <p style={{ fontSize: 11, color: "var(--text-muted)", margin: 0, marginTop: 6, lineHeight: 1.4 }}>{sub}</p>}
      </div>
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: color === "var(--accent)" ? "var(--accent-light)" : `${color}14`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
  );
}
