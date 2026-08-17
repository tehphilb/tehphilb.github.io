import React from "react";

/* Translucent bordered panel — the container for everything on the page. */
export function Panel({ children, active = false, as = "div", style, ...rest }) {
  const Tag = as;
  return (
    <Tag
      {...rest}
      style={{
        border: "var(--border-width) solid " + (active ? "var(--border-panel-active)" : "var(--border-panel)"),
        background: active ? "var(--surface-panel-hover)" : "var(--surface-panel)",
        borderRadius: "var(--radius)",
        padding: "var(--pad-panel)",
        color: "var(--text-body)",
        font: "var(--weight-regular) var(--text-base)/var(--leading-snug) var(--font-mono)",
        transition: "background var(--dur-state) var(--ease-state), border-color var(--dur-state) var(--ease-state)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
