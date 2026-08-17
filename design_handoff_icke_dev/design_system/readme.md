# icke.dev ASCII Design System

The visual system behind the icke.dev redesign: a monospace, terminal-native personal site. Everything sits on a character grid — one font, square corners, box-drawing glyphs instead of icons, and an animated ASCII character field as the only "imagery".

## Sources

- Live site: https://icke.dev (plus /impressum.html, /datenschutz.html) — read as text; the wordmark and German copy come from there verbatim.
- Redesign concepts: `icke.dev redesign.dc.html` in this project (options 1a terminal, 1b letterpress, 1c ASCII field). **Option 1c / 2a is the chosen direction and the basis of this system.**
- Standalone build of 2a: `icke-dev-2a/index.html`.
- No codebase, Figma file, or brand guidelines were provided. No logo files exist: the wordmark IS ASCII text (`assets/wordmark.txt`).

## Content fundamentals

- **Language:** German, informal, lowercase. ASCII-only transliteration for umlauts — "oeffnet", "uebermittelt", "Datenschutzerklaerung" — matching the live site.
- **Casing:** interface labels are lowercase ("email", "anliegen", "senden"); CSS uppercases eyebrows. Sentence case for prose, never Title Case.
- **Actions are bracketed:** `[ get in touch ]`, `[ senden ]`, `[ abbrechen ]`, `[ projekt oeffnen ↗ ]`. The brackets are part of the label.
- **Machine voice for structure:** `// projects`, `portfolio / card`, `● online`, `┌ get in touch ───`. Section headings read like comments or prompts.
- **Names are paths:** projects are lowercase-hyphenated like directories ("projekt-eins"), numbered `01 ·`, tagged with stack and year ("go · docker · 2024").
- **Terse:** one line of bio, two or three lines per project. No marketing adjectives, no exclamation marks.
- **No emoji, ever.** Status and affordances use Unicode glyphs: ● ▸ ↗ · —
- **Legal copy is verbatim** from the live site's consent text; do not rewrite it.

## Visual foundations

- **Colour:** near-black void (#08080c) with two accents — cyan #57e0d9 for structure, labels, links and the wordmark; pink #ff5fa2 for actions and status. Text is a cool near-white (#dff5f3) used through an alpha ramp (72/60/35%) instead of extra greys. `--cyan-dim` #194a47 is reserved for the background character field.
- **Type:** Space Mono, 400 and 700, one family for everything. Scale 10 → 16px. Eyebrows are 11px uppercase at .2em tracking; the wordmark is 700 at 10px with 1.06 line-height. Body 14/1.6, lead 15/1.75.
- **Backgrounds:** never a flat colour. A full-viewport `<pre>` of animated box-drawing characters, redrawn every 110ms, overlaid with `--veil` (a radial gradient from 5% to 93% void) so text stays legible. No photography, no illustration, no gradients as decoration.
- **Layout:** 460px fixed sidebar (wordmark, bio, facts, CTA, legal) plus a fluid project column, 56px gutter, 1280px max width, 44/52px page padding. Collapses to one column under 900px. Content sits in a z-index sandwich: field (0) → veil (1) → content (2).
- **Panels/cards:** 1px cyan-30 border, translucent dark fill (`rgba(10,24,26,.6)`), **no radius, no shadow**. Depth comes from transparency over the field, never from elevation. Expanded content is separated by a 1px *dashed* border.
- **Transparency & blur:** transparency everywhere (panels, inputs, scrim). Blur is optional and light (≤2px backdrop-filter); prefer transparency alone.
- **Borders & radii:** `--border-width: 1px`, `--radius: 0`. Square corners are non-negotiable — the grid has no curves.
- **Hover:** fill inverts (pink outline → pink fill, dark text) or the panel border goes full cyan and the fill brightens. **Press:** no scale, no shadow — colour only. **Focus:** border to full cyan, native outline removed.
- **Animation:** three durations only — 110ms field tick, 150ms linear state swaps, 1s stepped cursor blink. Nothing eases, slides, or bounces. Reduced-motion hides the field entirely.
- **Glow:** `--glow-cyan` text-shadow on the wordmark and on cyan ASCII art only; never on body text or UI.

## Iconography

There is no icon set and none should be added. Affordances are Unicode characters in the body font: box drawing (─ │ ┌ ┐ ├ ═ ║ ╔ ╬), block and shade characters (░ ▒ ▓ █ ▁▂▃), and a few marks — ● (status), ▸ (expand), ↗ (external), · (separator), // (section), [ ] (action). No icon font, no SVG icons, no PNGs, no emoji. Project thumbnails are shade-block ASCII tiles (see `guidelines/ascii-glyphs.html`).

## Fonts

Space Mono is loaded from Google Fonts via `@import` in `tokens/typography.css` — no font binaries were provided. **If icke.dev is licensed for a different mono (e.g. Berkeley Mono, JetBrains Mono), send the files and I'll swap them in.**

## Index

- `styles.css` — entry point; imports all token files.
- `tokens/` — `typography.css`, `colors.css`, `spacing.css`, `motion.css`.
- `components/core/` — `Button`, `Panel`, `Field`, `ProjectRow`.
- `components/ascii/` — `AsciiField` (animated background), `Wordmark`.
- `ui_kits/website/` — the full icke.dev card page (`index.html` + README).
- `guidelines/` — 11 specimen cards: Colors (core, surfaces, text ramp), Type (scale, wordmark, eyebrows & rules), Spacing (scale, page layout), Brand (states, glyph set, motion).
- `assets/wordmark.txt` — the ASCII wordmark, source of truth.

### Intentional additions

- `AsciiField` and `Wordmark` are components rather than assets, because the background texture and the logo are both generated type rather than image files.
- No slide templates: none were provided and a personal site has no deck.
