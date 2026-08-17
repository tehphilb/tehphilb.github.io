# Handoff: icke.dev redesign (ASCII card)

## Overview

A redesign of https://icke.dev — a one-screen personal portfolio "card". The page shows an ASCII block wordmark, a one-line bio, three contact facts, an expandable list of projects, and a contact form in a modal dialog, all over an animated ASCII character field. German copy, ASCII-only transliteration (oe/ue/ae), no emoji, no icon set.

Chosen direction: option **2a** (an expansion of concept 1c) from `icke.dev redesign.dc.html`.

## About the design files

The files in this bundle are **design references created in HTML** — prototypes of the intended look and behaviour, not production code to copy verbatim. The task is to **recreate them in the target codebase's environment** (Astro/Next/Svelte/plain static — whatever icke.dev runs on) using its established patterns. `prototype/index.html` is deliberately dependency-free so it can also be shipped nearly as-is for a static site; `design_system/components/*.jsx` are React translations of the same UI if the target is React.

If no environment exists yet: this page is static and needs no framework. Plain HTML + CSS + ~40 lines of JS is the appropriate choice; the prototype is already that.

## Fidelity

**High fidelity.** Colours, type scale, spacing, states and animation timings are final. Recreate pixel-perfectly. The only placeholder content is the project data and the bio line (see "Content still needed").

## Screens / views

### 1. Card (the only page)

**Purpose:** a visitor reads who this is, scans three projects, and sends a message.

**Layout**
- Root: `body` on `#08080c`, `overflow-x:hidden`, min-height 100vh.
- Layer 0 — `pre#rain`: `position:fixed; inset:0`, monospace 13px/1.06, letter-spacing 2px, colour `#194a47`, `pointer-events:none`, `user-select:none`, `z-index:0`.
- Layer 1 — `div#veil`: `position:fixed; inset:0`, `radial-gradient(110% 70% at 30% 0%, rgba(8,8,12,.05), rgba(8,8,12,.93) 65%)`, `pointer-events:none`, `z-index:1`.
- Layer 2 — `main`: `z-index:2`, `max-width:1280px`, centred, `display:grid`, `grid-template-columns: minmax(320px,460px) minmax(360px,1fr)`, `gap:56px`, `padding:44px 52px`.
- Left column (flex column, `gap:26px`): meta row → `h1` wordmark → bio → facts → bottom block (pushed down with `margin-top:auto`) containing the CTA and legal lines.
- Right column (flex column, `gap:14px`): `// projects` rule → `ol` of three project rows (`gap:14px`) → footnote at `margin-top:auto`.
- ≤1150px: single column, `gap:34px`. ≤900px: `padding:28px 20px`, wordmark font-size 6.4px, rain 11px/letter-spacing 1px.

**Components**

1. **Meta row** — flex, space-between. Left "portfolio / card", right "● online". Both 11px, uppercase, letter-spacing .2em; left `#57e0d9`, right `#ff5fa2`.
2. **Wordmark** (`h1 > pre`) — the six-line ASCII block art in `assets/wordmark.txt`, verbatim. Space Mono 700, 10px, line-height 1.06, colour `#57e0d9`, `text-shadow: 0 0 22px rgba(87,224,217,.45)`. `aria-label="icke.dev"`. Never redraw as SVG or webfont display type.
3. **Bio** — 15px/1.75, `rgba(223,245,243,.72)`, `max-width:420px`, `text-wrap:pretty`.
4. **Facts list** — three rows, flex, `gap:14px`, 12.5px, `rgba(223,245,243,.45)`; label span is `#57e0d9`, `width:74px` (mail / stack / status).
5. **CTA button** — text `[ get in touch ]` (brackets are part of the label). Transparent, `1px solid #ff5fa2`, colour `#ff5fa2`, padding `14px 22px`, font 14px, letter-spacing .08em, **border-radius 0**. Hover/focus-visible: background `#ff5fa2`, colour `#08080c`; transition `background .15s linear, color .15s linear`. No scale, no shadow.
6. **Legal block** — 11px, `rgba(223,245,243,.35)`, line-height 2. Links `rgba(223,245,243,.5)`, no underline, hover `#57e0d9`. Targets `/impressum.html`, `/datenschutz.html` (existing pages, not part of this redesign). Second line: "Taste 1 oeffnet das Projekt".
7. **Section rule** — flex, `gap:14px`: label `// projects` (11px uppercase, .2em, `#ff5fa2`), then a flexible `1px` bar with `linear-gradient(90deg, rgba(255,95,162,.6), transparent)`, then the count `03` in `rgba(223,245,243,.35)`.
8. **Project row** — a full-width `button` inside `li`. `1px solid rgba(87,224,217,.3)`, background `rgba(10,24,26,.6)`, padding `18px 20px`, radius 0, left-aligned text, `color:inherit`. Header: flex space-between baseline, `gap:16px` — name (16px, 700, `white-space:nowrap`, format `01 · projekt-eins`) and tags (12.5px, `#57e0d9`, format `go · docker · 2024`).
   - Hover **and** expanded: border `#57e0d9`, background `rgba(14,40,42,.78)`; transition .15s linear.
   - Body (shown only when `aria-expanded="true"`): `margin-top:14px`, `border-top:1px dashed rgba(87,224,217,.3)`, `padding-top:14px`, flex `gap:22px`, 13px `rgba(223,245,243,.6)`. Contains an optional 4-line shade-block ASCII tile (11px/1.1, `rgba(87,224,217,.55)`) and the description, ending in a link `[ projekt oeffnen ↗ ]` (`#ff5fa2`, hover `#57e0d9`, `margin-top:10px`).
9. **Footnote** — 11.5px, `rgba(223,245,243,.3)`.
10. **Contact dialog** (native `<dialog>`) — width 620px, `max-width:calc(100vw - 32px)`, background `#0a0a12`, `1px solid #ff5fa2`, padding `26px 28px`, radius 0. `::backdrop` `rgba(4,4,8,.72)`.
    - Frame line: `┌ get in touch ─────────────────────────────────` in `#ff5fa2`, 13px, letter-spacing .06em, `white-space:nowrap; overflow:hidden`.
    - Hint paragraph: 11.5px/1.7, `rgba(223,245,243,.5)`, verbatim: "Pflichtfelder: E-Mail und Anliegen. Die Nachricht wird an info@icke.dev ueber Google (USA) zugestellt. Details in der Datenschutzerklaerung." (last words link to `/datenschutz.html`).
    - Fields: label 11px uppercase .18em `#57e0d9`; input/textarea background `rgba(87,224,217,.06)`, `1px solid rgba(87,224,217,.35)`, colour `#dff5f3`, padding `11px 13px`, `resize:none`; focus border `#57e0d9`, outline none. Fields: `email` (type email, placeholder "du@beispiel.de", required) and `anliegen` (textarea rows 4, placeholder "worum geht es?", required).
    - Consent checkbox: `accent-color:#ff5fa2`, 11px/1.7 label, copy verbatim from the live site: "Ich willige ein, dass meine Angaben zur Bearbeitung der Anfrage verarbeitet und an info@icke.dev uebermittelt werden. Die Einwilligung kann ich jederzeit per E-Mail widerrufen." Required.
    - Actions: `[ senden ]` (filled `#ff5fa2`, text `#08080c`, hover swaps to `#57e0d9`) and `[ abbrechen ]` (`1px solid rgba(223,245,243,.25)`, `rgba(223,245,243,.6)`, hover border/colour `#dff5f3`).

## Interactions & behaviour

- **ASCII field:** every 110ms a full frame is regenerated as text. Grid size derived from viewport: `cols = ceil(innerWidth / (13*0.6 + 2)) + 2`, `rows = ceil(innerHeight / (13*1.06)) + 2`. Per cell: `v = sin(x*0.7 + y*0.31 + t*0.22) * cos(x*0.13 - t*0.05)`; if `v > 0.55` emit `CHARS[(x*7 + y*3 + t) % CHARS.length]`, else a space. `CHARS = "▁▂▃░▒▓│┤╡╢╖╕║╗╝┐└┴┬├─┼╞╟╚╔╩╦╠═╬01<>/\\{}[]#*.·"`. Interval cleared on `document.hidden`, restarted on return. Skipped entirely under `prefers-reduced-motion: reduce` (CSS also hides `#rain`).
- **Project rows:** accordion, one open at a time; clicking an open row closes it. State lives in `aria-expanded` on the button, and CSS hides `.body` when `aria-expanded="false"`.
- **Keyboard:** pressing 1, 2 or 3 toggles the matching row and focuses it. Ignored while an input/textarea is focused or the dialog is open.
- **Dialog:** `showModal()` from the CTA; `[ abbrechen ]` calls `close()`; Escape is native. Form uses native HTML validation (`required`, `type=email`) — no custom error UI in the prototype; on submit the real site must POST to the existing mail endpoint and show a plain success line in the dialog ("danke — nachricht ist raus.") plus an error line on failure.
- **Responsive:** ≤1150px single column; ≤900px reduced padding and smaller wordmark/field type.
- **Motion inventory:** 110ms field tick, .15s linear colour/border transitions, 1s stepped cursor blink (used only in the terminal concept 1a, not on this page). Nothing eases, slides, scales or bounces.

## State management

Three pieces of state, no library needed:
- `openProject: 0 | 1 | 2 | 3` — which row is expanded (0 = none). Triggers: row click, keys 1–3.
- `contactOpen: boolean` — dialog visibility. Triggers: CTA click, cancel click, Escape, successful submit.
- `formState: "idle" | "sending" | "sent" | "error"` — needed once the form is wired to the mail endpoint; the prototype stops at `idle`.
- Field values (`email`, `anliegen`, `consent`) if the target framework controls inputs; the prototype leaves them uncontrolled.
- Data fetching: none for page render. Project data is static content (Markdown/JSON/collection in the target codebase).

## Design tokens

Full definitions in `design_system/tokens/`; `design_system/styles.css` is the entry point.

**Colours** — `--void #08080c` (page) · `--void-2 #0a0a12` (dialog) · `--cyan #57e0d9` (structure, labels, links, wordmark) · `--cyan-dim #194a47` (ASCII field) · `--pink #ff5fa2` (actions, status) · `--paper #dff5f3` (text).
Alpha ramp: `rgba(223,245,243,…)` at .72 / .60 / .50 / .35 / .25; `rgba(87,224,217,…)` at .35 / .30 / .06; `rgba(255,95,162,.6)`.
Surfaces: panel `rgba(10,24,26,.6)`; panel hover `rgba(14,40,42,.78)`; input `rgba(87,224,217,.06)`; scrim `rgba(4,4,8,.72)`.
Effects: `--glow-cyan 0 0 22px rgba(87,224,217,.45)`; `--veil` radial gradient (above); `--rule-pink` linear gradient (above).

**Spacing** — 5, 8, 10, 14, 18, 22, 26, 34, 44, 56px. Composites: panel padding `18px 20px`; button `14px 22px`; input `11px 13px`; page `44px 52px`. Column gap 56px, stack gap 14px, left-column gap 26px.

**Typography** — Space Mono 400/700, single family (fallback `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`). Sizes 10 / 11 / 12.5 / 14 / 15 / 16px; wordmark 10px 700. Line-heights 1.06 (ASCII art), 1.6 (body), 1.75 (lead). Tracking .2em (eyebrows), .18em (labels), .08em (buttons), 2px (ASCII field letter-spacing).

**Radius / borders / shadows** — `--radius: 0` everywhere; `--border-width: 1px`; **no box-shadows anywhere** (the only shadow is the wordmark's text-shadow glow). Expanded-row separator is 1px dashed.

**Motion** — `--tick-field 110ms`, `--dur-state .15s`, `--ease-state linear`, `--blink 1s steps(1)`.

## Assets

- `design_system/assets/wordmark.txt` — the ASCII wordmark, taken verbatim from the current icke.dev. This is the logo; there is no image file and none should be produced.
- Fonts: **Space Mono via Google Fonts** (`@import` in `tokens/typography.css`). No font binaries were supplied. If icke.dev is licensed for another mono (Berkeley Mono, JetBrains Mono, Commit Mono), swap the `@font-face`/`@import` and self-host — everything else is size- and grid-agnostic.
- Icons: none. All affordances are Unicode box-drawing/block characters in the body font (─ │ ┌ ═ ░ ▒ ▓ █ ● ▸ ↗ · // [ ]). Do not introduce an icon library or emoji.
- No photography or illustration.

## Content still needed

Everything marked "Platzhalter" is placeholder German copy: the bio line, the three project names/stacks/years/descriptions and their links. Real project data replaces `projekt-eins/zwei/drei`. The layout supports any number of rows; the `03` count in the section rule must match.

## Files

- `prototype/index.html` — the full page: HTML, CSS and vanilla JS, links the design system's `styles.css`. This is the reference implementation.
- `design_system/styles.css` + `design_system/tokens/*.css` — the token layer to port into the codebase.
- `design_system/components/core/{Button,Panel,Field,ProjectRow}.{jsx,d.ts,prompt.md}` — React versions of the primitives, each with its props contract and usage notes.
- `design_system/components/ascii/{AsciiField,Wordmark}.{jsx,d.ts,prompt.md}` — the background field and the wordmark.
- `design_system/readme.md` — the full design guide: content fundamentals (German, lowercase, bracketed actions), visual foundations, iconography rules.
- `design_system/SKILL.md` — drop this folder into `.claude/skills/icke-dev-design/` to make the system available to Claude Code as a skill.
- In the source project (not bundled): `icke.dev redesign.dc.html` holds all four explorations (1a terminal, 1b letterpress, 1c ASCII field, 2a the chosen full page).

## Suggested prompt for Claude Code

> Read `design_handoff_icke_dev/README.md` and `design_system/readme.md`. Recreate `prototype/index.html` in this codebase using its existing patterns: port the token files first, then build the page. Keep the ASCII wordmark and all German copy verbatim, keep every corner square, and wire the contact form to the existing mail endpoint. Replace the placeholder project rows with the real project data.
