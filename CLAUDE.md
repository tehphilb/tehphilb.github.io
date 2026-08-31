# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

No build step. Serve the files directly:

```sh
python3 -m http.server 4321 --bind 127.0.0.1
```

Then open http://127.0.0.1:4321/

## Architecture

Static site with no framework, no package manager, and no bundler. Three HTML pages, JS/CSS, self-hosted fonts, and a vendored three.js for the flock.

**Data flow via `site.json`**
`site.json` holds the owner's name, address, and email. `legal.js` fetches this file on every page load and injects values into the DOM wherever `data-site="<key>"` or `data-site-mailto="<key>"` attributes appear. This means `index.html`, `impressum.html`, and `datenschutz.html` never hardcode personal data — they just carry those attributes and `legal.js` fills them in.

**`index.html`**
Deliberately minimal: the email address as a giant `mailto:` hero (with a CSS-only blinking caret) and a single project link (entwicklungsraum-fussball.de). Contact happens via `mailto:` — there is no contact form and no backend.

**`phosphor.js` (three.js flock)**
Three.js is self-hosted in `vendor/` (no CDN). `phosphor.js` prefers the WebGL [GPGPU birds + GLTF](https://threejs.org/examples/webgl_gpgpu_birds_gltf.html) path with `models/Parrot.glb` (baked wing morphs, mouse scatter). If that fails it falls back to a CPU instanced flock. `prefers-reduced-motion` freezes the flock; the loop pauses when the tab is hidden.

**Design tokens**
All colors live as custom properties at the top of `style.css` (`--bg`, `--ink`, `--mute`, `--faint`, `--line`, `--accent`). Single accent color (orange) used only for interaction states, the caret, and the header dot.

**Fonts**
IBM Plex Mono (400 + 600 weights) is self-hosted in `fonts/` — no external font requests, no cookie banner needed.

**Legal pages**
`impressum.html` and `datenschutz.html` are standalone pages that load `legal.js` to hydrate `data-site` placeholders. They share the `.stage` / `.legal-page` styles in `style.css`.
