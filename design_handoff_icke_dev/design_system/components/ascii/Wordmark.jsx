import React from "react";

export const WORDMARK = [
  " ██╗ ██████╗██╗  ██╗███████╗   ██████╗ ███████╗██╗   ██╗",
  " ██║██╔════╝██║ ██╔╝██╔════╝   ██╔══██╗██╔════╝██║   ██║",
  " ██║██║     █████╔╝ █████╗     ██║  ██║█████╗  ██║   ██║",
  " ██║██║     ██╔═██╗ ██╔══╝     ██║  ██║██╔══╝  ╚██╗ ██╔╝",
  " ██║╚██████╗██║  ██╗███████╗██╗██████╔╝███████╗ ╚████╔╝",
  " ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝╚═════╝ ╚══════╝  ╚═══╝",
].join("\n");

/* The wordmark is type, not an image: ASCII block letters, cyan, glowing. */
export function Wordmark({ size = "var(--wordmark-size)", glow = true, color = "var(--cyan)", style }) {
  return (
    <pre
      aria-label="icke.dev"
      style={{
        margin: 0,
        font: "var(--weight-bold) " + size + "/var(--leading-tight) var(--font-mono)",
        color,
        textShadow: glow ? "var(--glow-cyan)" : "none",
        ...style,
      }}
    >
      {WORDMARK}
    </pre>
  );
}
