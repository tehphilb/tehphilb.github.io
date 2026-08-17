import React from "react";

/* Uppercase label + input/textarea. */
export function Field({ label, id, type = "text", rows, value, onChange, placeholder, required = false }) {
  const box = {
    background: "var(--surface-input)",
    border: "var(--border-width) solid var(--border-input)",
    borderRadius: "var(--radius)",
    color: "var(--text-body)",
    font: "var(--weight-regular) var(--text-base)/var(--leading-snug) var(--font-mono)",
    padding: "var(--pad-input)",
    resize: "none",
    width: "100%",
    boxSizing: "border-box",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
      <label
        htmlFor={id}
        style={{
          font: "var(--weight-regular) var(--text-xs)/1.4 var(--font-mono)",
          letterSpacing: "var(--tracking-label)",
          textTransform: "uppercase",
          color: "var(--text-accent)",
        }}
      >
        {label}
      </label>
      {rows ? (
        <textarea id={id} rows={rows} value={value} onChange={onChange} placeholder={placeholder} required={required} style={box} />
      ) : (
        <input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={box} />
      )}
    </div>
  );
}
