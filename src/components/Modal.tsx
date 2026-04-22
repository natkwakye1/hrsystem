"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const maxWidths = { sm: 448, md: 512, lg: 672, xl: 896 };

export default function Modal({ isOpen, onClose, title, children, size = "md" }: ModalProps) {
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div
        className="animate-fade-in"
        style={{
          position: "relative", width: "100%", maxWidth: maxWidths[size], margin: "0 16px",
          background: "var(--bg-card)", borderRadius: 16, boxShadow: "var(--shadow-xl)",
          maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 24px", borderBottom: "1px solid var(--border)",
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              padding: 6, borderRadius: 8, background: "none", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--icon-color)",
            }}
          >
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 24, overflowY: "auto", flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
