"use client";

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function Table<T extends { id?: string }>({
  columns, data, loading, emptyMessage = "No data found", onRowClick,
}: TableProps<T>) {
  if (loading) {
    return (
      <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)", overflow: "hidden" }}>
        <div style={{ opacity: 0.5 }}>
          <div style={{ height: 48, background: "var(--bg-hover)" }} />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ height: 60, borderBottom: "1px solid var(--border)" }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius)", boxShadow: "var(--shadow-card)", overflow: "hidden", border: "1px solid var(--border)" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {columns.map((col) => (
                <th key={col.key} style={{
                  textAlign: "left", padding: "14px 20px", fontSize: 11, fontWeight: 600,
                  color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap",
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: "48px 20px", textAlign: "center", fontSize: 14, color: "var(--text-secondary)" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  onClick={() => onRowClick?.(item)}
                  style={{
                    borderBottom: idx < data.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.15s", cursor: onRowClick ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={(e) => { if (onRowClick) e.currentTarget.style.background = "transparent"; }}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={{ padding: "14px 20px", fontSize: 13, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
