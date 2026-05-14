# SEO – Stand und offene Punkte

Kurzüberblick für Entwicklungsraum Fussball: Was im Repo schon steckt, was extern oder inhaltlich noch zu tun ist.

## Bereits umgesetzt (im Repo)

- `robots.txt` mit `Allow` und Verweis auf die Sitemap
- `sitemap.xml` für Startseite und Seiten unter `recht/`
- Startseite `index.html`: Canonical-URL, Open-Graph- und Twitter-Meta, JSON-LD (`LocalBusiness` + `WebSite`)

Basis-URL überall: `https://www.entwicklungsraum-fussball.de` — bei abweichender Live-Domain (z. B. ohne `www`) **einheitlich** in `robots.txt`, `sitemap.xml` und im `<head>` von `index.html` anpassen.

---

## Live-Site (Stand Prüfung)

Geprüft per HTTP-Abruf am **14.05.2026** gegen [https://www.entwicklungsraum-fussball.de/index.html](https://www.entwicklungsraum-fussball.de/index.html) (und Kurzvergleich mit `/`).

**Wichtig:** Die öffentlich ausgelieferte Startseite ist **eine andere technische Variante** als dieses Repo: Live nutzt u. a. `style.css`, Google Fonts, Font Awesome (CDN) und **eigene HTML-Seiten** (`angebot.html`, `ueber-mich.html`, `anfrage.html`). Dieses Repo ist ein **Onepager** mit anderem Asset-Pfad (`css/site.css` usw.). Die SEO-Maßnahmen im Repo wirken erst, wenn **dieser Stand** auf den Webspace **deployt** und `robots.txt` / `sitemap.xml` im Document Root liegen.

### Live: bereits positiv

- `lang="de"`, Charset, Viewport
- sinnvolle **Überschriftenhierarchie** (`h1` im Hero, `h2`/`h3` in Sektionen)
- **interne Navigation** zu weiteren Seiten
- Logo mit **kurzem `alt`**

### Live: Lücken (Abgleich mit Repo-Ziel)

| Thema | Befund auf der Live-`index.html` |
|--------|----------------------------------|
| Meta-Description | fehlt |
| Canonical | fehlt |
| Open Graph / Twitter Cards | fehlen |
| JSON-LD (z. B. LocalBusiness) | nicht vorhanden |
| `/robots.txt` | **404** |
| `/sitemap.xml` | **404** |
| Drittanbieter | Google Fonts + cdnjs (Performance/Datenschutz nebenbei beachten) |

**Folge:** Inhaltlich brauchbar, technisches SEO und Discovery **deutlich hinter** dem, was im Repo bereits vorbereitet ist — bis zum nächsten Deploy bleibt die Live-Domain unteroptimiert.

---

## Offen (Checkliste)

### Technik & Messbarkeit

- [ ] **Google Search Console**: Property anlegen, Domain-/URL-Präfix bestätigen, `sitemap.xml` einreichen und auf Crawling-/Indexierungsmeldungen achten.
- [ ] **Kanonische URL prüfen**: Im Browser testen, ob immer `www` oder nie `www` erreicht wird; Redirect beim Hoster setzen; Canonical und Sitemap daran angleichen.
- [ ] **Bing Webmaster Tools** (optional): Sitemap einreichen, falls Bing-Relevanz gewünscht ist.

### Inhalt & Struktur

- [ ] **Title und Meta-Description**: Auf echte Suchbegriffe feilen (z. B. Fußballtraining Hamburg, Kleingruppentraining, Jugend, ggf. Bondenwald) — kurz, einzigartig, ohne Keyword-Stuffing.
- [ ] **Zusätzliche indexierbare Unterseiten** (für **dieses Repo**, Onepager): Eine starke Startseite mit `#`-Abschnitten; für weitere Suchintentionen eigene URLs (z. B. Konzept, Standort, Trainer) mit eigenem `<title>` und `<h1>` können zusätzliche Rankingslots schaffen. *(Die aktuelle **Live**-Site hat bereits getrennte HTML-Seiten — nach Umstellung auf den Repo-Stand entfällt das oder wird neu bewertet.)*
- [ ] **FAQ-Bereich** (optional): Häufige Elternfragen beantworten; nur bei sachlicher Passung und Einhaltung der Google-Richtlinien mit `FAQPage`-Markup denken.
- [ ] **Bilder**: Überall sinnvolle `alt`-Texte (beschreibend, nicht nur „Bild“).

### Social & Rich Results

- [ ] **Eigenes OG-/Share-Bild** (ca. 1200×630 px): Statt oder zusätzlich zur Profilkarte; in `index.html` bei `og:image` und `twitter:image` (und ggf. in JSON-LD `image`) auf die finale absolute URL setzen.

### Lokales SEO (stark empfohlen, außerhalb des Repos)

- [ ] **Google-Unternehmensprofil** vollständig pflegen (Kategorie, Beschreibung, Fotos, Link zur Website, ggf. Trainings-/Kontaktinfos).

### Rechtliches / Indexierung

- [ ] **`recht/*`-Seiten**: Derzeit `noindex` — bewusst entscheiden: bei `index` können Impressum/Datenschutz/AGB in der Suche erscheinen (meist unkritisch); bei `noindex` bleibt das Ranking-Gewicht auf der Startseite.
- [ ] **Datenschutz**: Platzhalter bei Hosting (Abschnitt 2) noch ausfüllen, wenn der Hoster feststeht.

### Performance & Qualität

- [ ] **Core Web Vitals** (PageSpeed Insights / Search Console): LCP, CLS, INP beobachten; große Assets und unnötiges CSS/JS prüfen.
- [ ] **Favicon** und ggf. **Apple Touch Icon** ergänzen (stärkt Wiedererkennung in Tabs und Lesezeichen, wenig direktes Ranking, aber professioneller Auftritt).

### Pflege

- [ ] **`sitemap.xml`**: `lastmod` bei größeren Änderungen aktualisieren oder Automatisierung einplanen, falls der Build später dynamisch wird.

---

## Relevante Dateien

| Datei | Rolle |
|--------|--------|
| `index.html` | Canonical, OG/Twitter, JSON-LD |
| `robots.txt` | Crawling-Hinweise, Sitemap-URL |
| `sitemap.xml` | URL-Liste für Suchmaschinen |

Bei Domain- oder Pfadänderungen diese drei Stellen plus alle **absoluten** URLs in Meta und JSON-LD synchron halten.

Nach jedem Deploy: kurz prüfen, ob **Live** unter derselben Domain die erwarteten Dateien ausliefert (`curl -sSI https://www.entwicklungsraum-fussball.de/robots.txt` bzw. `…/sitemap.xml`) und ob der Quelltext der Startseite Meta-Tags und JSON-LD enthält.
