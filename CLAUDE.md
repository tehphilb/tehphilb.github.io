# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Local development

No build step. Serve the files directly:

```sh
python3 -m http.server 4321 --bind 127.0.0.1
```

Then open http://127.0.0.1:4321/

## Architecture

Static site with no framework, no package manager, no bundler. Three HTML pages, two JS files, one CSS file.

**Data flow via `site.json`**  
`site.json` holds the owner's name, address, and email. `legal.js` (loaded first, before `script.js`) fetches this file on every page load and injects values into the DOM wherever `data-site="<key>"` or `data-site-mailto="<key>"` attributes appear. This means `impressum.html` and `datenschutz.html` never hardcode personal data — they just carry those attributes and `legal.js` fills them in.

**`script.js` responsibilities**  
- `PROJECTS` array at the top — add/remove projects here  
- ASCII mesh background (`renderMesh`), ASCII card chrome (`renderChrome`), and ASCII project boxes (`renderProjects`) — all use box-drawing characters and recalculate on resize  
- Typewriter animation (`typeLede`) driven by the `LEDE` constant  
- Live UTC clock (`tickClock`)  
- Number-key shortcuts — pressing `1` opens project 1, etc.  
- Contact form dialog (`bindTouchForm`) — submits via `<form target="touch-frame">` POST to a Google Apps Script web app; URL is `CONTACT_WEBAPP_URL` in `script.js`

**Contact form backend**  
`contact.gs` is a Google Apps Script that receives the POST and sends mail via the owner's Gmail. To wire it up: deploy `contact.gs` as a Google Web App (run as: me, access: anyone) and paste the `/exec` URL into `CONTACT_WEBAPP_URL` in `script.js`. After changes to `contact.gs`, redeploy at script.google.com.

**Fonts**  
IBM Plex Mono (400 + 600 weights) is self-hosted in `fonts/` — no external font requests, no cookie banner needed.

**Legal pages**  
`impressum.html` and `datenschutz.html` are standalone pages that both load `legal.js` to hydrate `data-site` placeholders. They link back to each other and to the contact form's Datenschutzerklärung.
