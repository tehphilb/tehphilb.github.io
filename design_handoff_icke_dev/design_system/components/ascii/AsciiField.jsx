import React from "react";

const CHARS = "▁▂▃░▒▓│┤╡╢╖╕║╗╝┐└┴┬├─┼╞╟╚╔╩╦╠═╬01<>/\\{}[]#*.·";

/* Animated character field. Fixed behind all content; decorative only. */
export function AsciiField({ cols = 100, rows = 66, interval = 110, running = true, style }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!running || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let t = 0;
    const tick = () => {
      t++;
      let out = "";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = Math.sin(x * 0.7 + y * 0.31 + t * 0.22) * Math.cos(x * 0.13 - t * 0.05);
          out += v > 0.55 ? CHARS[(x * 7 + y * 3 + t) % CHARS.length] : " ";
        }
        out += "\n";
      }
      if (ref.current) ref.current.textContent = out;
    };
    tick();
    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [cols, rows, interval, running]);

  return (
    <pre
      ref={ref}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        margin: 0,
        font: "var(--weight-regular) 13px/var(--leading-tight) var(--font-mono)",
        color: "var(--cyan-dim)",
        letterSpacing: "var(--tracking-field)",
        pointerEvents: "none",
        userSelect: "none",
        overflow: "hidden",
        ...style,
      }}
    />
  );
}
