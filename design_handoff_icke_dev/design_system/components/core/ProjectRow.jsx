import React from "react";
import { Panel } from "./Panel.jsx";

/* Numbered, expandable project row. */
export function ProjectRow({ index, name, tags, description, href, open = false, onToggle }) {
  const num = String(index).padStart(2, "0");
  return (
    <Panel as="div" active={open} style={{ cursor: "pointer" }} onClick={onToggle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)" }}>
        <span style={{ fontWeight: "var(--weight-bold)", fontSize: "var(--text-lg)" }}>{num} · {name}</span>
        <span style={{ color: "var(--text-accent)", fontSize: "var(--text-sm)" }}>{tags}</span>
      </div>
      {open && (
        <div
          style={{
            marginTop: "var(--space-4)",
            borderTop: "var(--border-width) dashed var(--border-panel)",
            paddingTop: "var(--space-4)",
            fontSize: "12.5px",
            color: "var(--text-muted)",
            textWrap: "pretty",
          }}
        >
          {description}
          {href && (
            <div style={{ marginTop: "var(--space-3)" }}>
              <a href={href} style={{ color: "var(--text-action)", textDecoration: "none" }}>[ projekt oeffnen ↗ ]</a>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}
