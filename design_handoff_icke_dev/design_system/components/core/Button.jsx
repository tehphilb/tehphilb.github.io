import React from "react";

/* Bracket button. Text always carries its own [ ] brackets. */
export function Button({ children, variant = "action", onClick, type = "button", disabled = false, style }) {
  const base = {
    font: "var(--weight-regular) var(--text-base)/1 var(--font-mono)",
    letterSpacing: "var(--tracking-button)",
    padding: "var(--pad-button)",
    borderRadius: "var(--radius)",
    borderStyle: "solid",
    borderWidth: "var(--border-width)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.4 : 1,
    transition: "background var(--dur-state) var(--ease-state), color var(--dur-state) var(--ease-state), border-color var(--dur-state) var(--ease-state)",
    ...style,
  };
  const variants = {
    action: { background: "transparent", color: "var(--text-action)", borderColor: "var(--pink)" },
    solid: { background: "var(--pink)", color: "var(--void)", borderColor: "var(--pink)" },
    quiet: { background: "transparent", color: "var(--text-muted)", borderColor: "var(--border-quiet)" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>
      {children}
    </button>
  );
}
