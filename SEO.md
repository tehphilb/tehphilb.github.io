# SEO – Was tun, wie, wo

Arbeitsanleitung für [entwicklungsraum-fussball.de](https://www.entwicklungsraum-fussball.de/).  
Stand Prüfung: **22.08.2026**. Dieses Repo **ist** die Live-Seite (Onepager).

Die technischen Basics liegen schon im Code (Canonical, Open Graph, Twitter, JSON-LD, `robots.txt`). Trotzdem ist die Seite fast unsichtbar: Google indexiert sie kaum, die Sitemap antwortet live mit Fehler, Title/H1 treffen nicht die Suchbegriffe der Eltern, und es fehlt ein Google-Unternehmensprofil.

**Reihenfolge nicht ändern.** Erst Indexierung und Maps, dann Texte, dann neue Seiten.

| Prio | Aufgabe | Wo | Aufwand |
|------|---------|-----|---------|
| 1 | Search Console + Sitemap reparieren | Google + Repo | 1–2 h |
| 2 | Google-Unternehmensprofil | Google, nicht im Repo | 2–4 h |
| 3 | Title, Meta, H1 umschreiben | `index.html`, `content/site-config.json` | 1 h |
| 4 | Startseite konkret machen | `index.html`, `content/site-config.json` | halber Tag |
| 5 | Unterseiten + FAQ | neue HTML-Dateien + Nav | 1–2 Tage |
| 6 | Schema, Favicon, OG-Bild | `index.html`, `assets/` | 2–3 h |
| 7 | Bewertungen und Erwähnungen | Maps, Vereine, Verzeichnisse | laufend |

Basis-URL überall: `https://www.entwicklungsraum-fussball.de`  
Weicht die Live-Domain ab (ohne `www`), **überall** gleichziehen: `robots.txt`, `sitemap.xml`, `<head>` und JSON-LD in `index.html`.

---

## 1. Google Search Console und Sitemap

Ziel: Google kennt die Domain, kann die Sitemap lesen und nimmt die Startseite in den Index.

### 1.1 Search Console anlegen

1. Öffnen: [https://search.google.com/search-console](https://search.google.com/search-console)
2. Property-Typ **Domain** wählen: `entwicklungsraum-fussball.de`  
   Das erfasst `www` und ohne `www` in einem Konto.
3. DNS-TXT-Eintrag beim Domain-Anbieter setzen (Bestätigung).  
   Alternative, falls DNS nicht geht: Property-Typ **URL-Präfix** `https://www.entwicklungsraum-fussball.de/` und HTML-Datei ins Repo-Root legen, committen, deployen, dann in Search Console bestätigen.
4. Zusätzlich **Bing Webmaster Tools**: [https://www.bing.com/webmasters](https://www.bing.com/webmasters) — Domain importieren, dieselbe Sitemap einreichen.

### 1.2 Sitemap reparieren (Repo)

Live-Abruf am 22.08.2026: `https://www.entwicklungsraum-fussball.de/sitemap.xml` → **HTTP 500**.  
Ursache sehr wahrscheinlich: GitHub Pages behandelt das Repo als Jekyll-Projekt. Es fehlt `.nojekyll`.

**Datei anlegen:** `.nojekyll` (leer) im Repo-Root, neben `index.html`.

**Datei ändern:** `sitemap.xml`

- Nur indexierbare Seiten auflisten. Recht-Seiten haben `noindex` — die **rausnehmen**.
- `lastmod` auf das Datum der letzten inhaltlichen Änderung setzen.

Zielstand:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.entwicklungsraum-fussball.de/</loc>
    <lastmod>2026-08-22</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

Später jede neue Unterseite (z. B. `/angebot.html`) als weiteren `<url>`-Block ergänzen.

**Datei prüfen:** `robots.txt` — die Zeile muss bleiben:

```
Sitemap: https://www.entwicklungsraum-fussball.de/sitemap.xml
```

### 1.3 CNAME prüfen

**Datei:** `CNAME` im Repo-Root  
Aktuell steht dort `icke.dev`. Die öffentliche Domain ist `entwicklungsraum-fussball.de`.

1. In GitHub: Repo → Settings → Pages → Custom domain ablesen.
2. `CNAME` auf genau diese Domain setzen, z. B. `www.entwicklungsraum-fussball.de` (eine Zeile, kein `https://`).
3. Beim DNS-Anbieter: `www` als CNAME auf `username.github.io`, Apex-Domain per A/ALIAS laut GitHub-Hinweisen.

### 1.4 Nach dem Deploy prüfen

Im Terminal:

```bash
curl -sSI https://www.entwicklungsraum-fussball.de/robots.txt
curl -sSI https://www.entwicklungsraum-fussball.de/sitemap.xml
curl -sSI https://entwicklungsraum-fussball.de/
```

Erwartet:

- `robots.txt` und `sitemap.xml`: **200**, `Content-Type` Text/XML bzw. Text
- Domain ohne `www` leitet auf `https://www.entwicklungsraum-fussball.de/` um (301/302)
- Quelltext der Startseite enthält `<link rel="canonical">` und `application/ld+json`

Dann in Search Console: **Sitemaps** → `https://www.entwicklungsraum-fussball.de/sitemap.xml` einreichen.  
**URL-Prüfung** für `https://www.entwicklungsraum-fussball.de/` → Indexierung beantragen.

Kontrolle nach einigen Tagen: Google-Suche `site:entwicklungsraum-fussball.de` — mindestens die Startseite muss erscheinen.

---

## 2. Google-Unternehmensprofil

Ziel: In Google Maps und der lokalen Suche erscheinen. Für dieses Angebot oft wirksamer als die Website.

Nicht im Repo. Öffnen: [https://business.google.com](https://business.google.com)

1. Unternehmen erstellen: **Entwicklungsraum Fussball** (Schreibweise wie Impressum und Schema).
2. Kategorie: zuerst **Fußballverein** oder **Sportunterricht** / **Sportschule**, je nachdem was Google anbietet. Zweite Kategorie nur setzen, wenn sie wirklich passt.
3. Adresse **identisch** zu Impressum und JSON-LD:
   - Michael Fraenkel
   - Lohkoppelstraße 50
   - 22083 Hamburg
   - Telefon: `+49 176 62532567` bzw. Anzeige `0176 625 32567`
   - Website: `https://www.entwicklungsraum-fussball.de/`
4. Wenn am Wohnsitz kein Publikumsverkehr stattfindet: in Google als **dienstleistungsorientiert** / Einzugsgebiet **Hamburg** markieren. Den echten Trainingsplatz zusätzlich in der Beschreibung und später auf der Website nennen.
5. Beschreibung (ca. 250–750 Zeichen), Suchbegriffe natürlich einbauen, kein Keyword-Stuffing. Vorschlag:

   > Individuelles Kleingruppentraining Fußball für Kinder und Jugendliche in Hamburg. 4–8 Spieler pro Gruppe, ergänzend zum Vereinstraining. Leitung: Michael Fraenkel, DFB B+ / UEFA Youth B.

6. Fotos: Logo, Porträt Michael, 6–10 Trainingsfotos (Platz, Gruppe, Ballarbeit). Keine reinen Stockfotos.
7. Eintrag verifizieren (Postkarte, Telefon oder Video).
8. Nach der Freischaltung: 8–12 echte Eltern um eine Bewertung bitten. Keine gekauften oder getauschten Bewertungen.

NAP (Name, Adresse, Telefon) muss **buchstabengleich** sein in:

- `recht/impressum.html`
- JSON-LD in `index.html` (`streetAddress`, `telephone`, `email`)
- Google-Unternehmensprofil
- optional: Bing Places, Apple Karten, regionale Sportverzeichnisse

---

## 3. Title, Meta-Description und H1

Ziel: Die Seite antwortet auf das, was Eltern tippen — nicht nur auf den Markennamen.

**Wichtig:** `js/site.js` überschreibt `document.title` und `meta description` aus `content/site-config.json`. Beide Dateien **und** die Open-Graph-/Twitter-Tags in `index.html` müssen denselben Text haben, sonst sieht Google einen String und Nutzer nach dem Laden einen anderen.

### 3.1 Texte (zum Übernehmen)

**Title** (ca. 50–60 Zeichen):

```
Kleingruppentraining Fußball Hamburg | Entwicklungsraum Fußball
```

**Meta-Description** (ca. 140–155 Zeichen):

```
Individuelles Fußball-Kleingruppentraining für Kinder und Jugendliche in Hamburg. 4–8 Spieler, ergänzend zum Verein, mit DFB-B+-Trainer. Unverbindlich anfragen.
```

**H1** (sichtbare Hauptüberschrift):

```
Kleingruppentraining Fußball in Hamburg
```

Der Slogan „Talent fördern. Spiel verstehen. Entwicklung ermöglichen.“ bleibt als Unterzeile (`hero-sub` oder zweite Zeile), nicht als einziges `h1`.

### 3.2 Wo ändern

**Datei:** `content/site-config.json`

```json
"meta": {
  "title": "Kleingruppentraining Fußball Hamburg | Entwicklungsraum Fußball",
  "description": "Individuelles Fußball-Kleingruppentraining für Kinder und Jugendliche in Hamburg. 4–8 Spieler, ergänzend zum Verein, mit DFB-B+-Trainer. Unverbindlich anfragen."
}
```

**Datei:** `index.html`, Block `<head>` (Zeilen 6–42)

- `<title>`
- `<meta name="description">`
- `og:title`, `og:description`
- `twitter:title`, `twitter:description`

**Datei:** `index.html`, Hero (ca. Zeile 214)

Aktuell:

```html
<h1>
  Talent<br /><span class="accent">fördern.</span
  ><br />Spiel<br />verstehen.<br />Entwicklung<br />ermöglichen.
</h1>
```

Ersetzen durch ein `h1` mit dem Angebot, Slogan darunter in `p.hero-sub`. Layout-Klassen (`accent`, `br`) dürfen bleiben, der **erste sichtbare Satz** muss „Kleingruppentraining“ und „Hamburg“ enthalten.

**Datei:** `index.html`, JSON-LD `LocalBusiness.description` (ca. Zeile 51)  
 denselben Kern wie die Meta-Description verwenden.

Nach dem Deploy: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results) und „Seite wie Google“ in Search Console — Title und Description müssen dem neuen Text entsprechen.

---

## 4. Startseite konkret machen

Ziel: Eltern und Google erfahren Alter, Ort, Ablauf. Philosophie bleibt, bekommt aber Fakten.

### 4.1 Standort-Text

**Datei:** `content/site-config.json` → `locationLabel`  
**Datei:** `index.html` → `#contact-location-text` (ca. Zeile 1478)  
**Datei:** `index.html` → Footer `.footer-bottom-loc`

Nicht nur `Hamburg & Umgebung`. Sobald der Platz feststeht, z. B.:

```
Hamburg-Barmbek / Hamburg-Nord
```

oder mit Platzname. Stadtteile, die ihr wirklich bedient, im Fließtext nennen (Barmbek, Winterhude, Uhlenhorst, …) — nur echte Einzugsgebiete, keine erfundenen Listen.

### 4.2 Faktenblock auf die Startseite

**Datei:** `index.html`, sinnvoll nach dem Hero oder in `#angebot` (Sektion ab ca. Zeile 357).

Als kurze Liste oder Tabelle, in normalem HTML (nicht nur in Bildern):

- Alter / Jahrgänge (z. B. 7–16 Jahre — nur schreiben, was gilt)
- Gruppengröße 4–8 (steht schon, beibehalten)
- Ergänzung zum Vereinstraining (steht schon)
- Wo: Platz, Stadtteil, Hallenoption falls vorhanden
- Wann: Wochentage und grobe Uhrzeiten
- Leitung: Michael Fraenkel, DFB B+, UEFA Youth B

### 4.3 FAQ auf der Startseite (schnell) oder als eigene URL (besser)

Häufige Elternfragen als `<h2>` oder `<h3>` plus Antwortabsatz. Beispiele:

- Für welches Alter ist das Training?
- Ist das eine Fußballschule?
- Wie groß ist die Gruppe?
- Wo findet das Training statt?
- Was kostet es? (Preisspanne oder „auf Anfrage“, keine Fantasiepreise)
- Kann mein Kind einmal reinschnuppern?
- Braucht es Vereinszugehörigkeit?

Wenn die FAQ auf der Startseite bleibt: JSON-LD `FAQPage` in denselben `<script type="application/ld+json">`-Graph in `index.html` ergänzen (siehe Abschnitt 6).  
Besser mittelfristig: eigene Datei `faq.html` (Abschnitt 5).

### 4.4 Bilder

**Datei:** `index.html`, alle `<img>`

| Bild | Aktuelles `alt` | Soll |
|------|-----------------|------|
| Logo Nav/Footer | `Entwicklungsraum Fussball` | so lassen |
| Trainerfoto ca. Zeile 716 | `Michael Fraenkel, Trainer und Gründer` | so lassen oder um Lizenz ergänzen |
| B42-Mockup ca. Zeile 1055 | `B42 App auf Smartphone und Desktop` | so lassen |
| zwei Bilder ca. Zeile 1066 / 1075 | `alt=""` | entweder weglassen (`alt=""` nur bei rein dekorativ) oder beschreiben |

Keine Keyword-Listen in `alt`. Dateinamen der Trainingsfotos sprechend wählen, z. B. `kleingruppentraining-hamburg.jpg`.

---

## 5. Eigene Unterseiten

Eine URL kann nicht gleichzeitig für Angebot, Trainer, Standort und FAQ ranken. Jede neue Seite braucht eigenen `<title>`, eigene Meta-Description, eigenes `<h1>`, Canonical und einen Eintrag in `sitemap.xml`.

Im Repo-Root anlegen, analog zu `index.html` (gleiches CSS, gleiche Nav):

| Datei | Title | H1 | Inhalt |
|-------|--------|----|--------|
| `angebot.html` | `Kleingruppentraining Fußball Hamburg \| Ablauf und Gruppengröße` | `Kleingruppentraining als Ergänzung zum Verein` | Format, 4–8, Technik/Spielintelligenz, was es nicht ist |
| `trainer.html` | `Michael Fraenkel — Fußballtrainer Hamburg \| DFB B+` | `Michael Fraenkel, Trainer und Gründer` | Lizenzen, Stationen, Ansatz. Person-Schema. |
| `hamburg.html` | `Fußballtraining in Hamburg-Nord und Umgebung` | `Training in Hamburg` | Stadtteile, Platz, Anfahrt, Einzugsgebiet |
| `faq.html` | `Häufige Fragen zum Kleingruppentraining` | `Fragen von Eltern` | Fragen als Überschriften, FAQPage-Schema |

**Navigation:** `index.html` Nav (ca. Zeile 97) und Footer (ca. Zeile 1550) um echte Links ergänzen, z. B. `<a href="angebot.html">Angebot</a>` — nicht nur `#angebot`.

**Sitemap:** für jede neue Datei einen `<url>`-Block in `sitemap.xml`.  
**Search Console:** nach Deploy jede neue URL prüfen und indexieren lassen.

Nicht anlegen: dünne Seiten ohne eigenen Inhalt. Lieber drei substanzielle Seiten als acht leere.

---

## 6. Schema, Favicon, Share-Bild

### 6.1 JSON-LD erweitern

**Datei:** `index.html`, `<script type="application/ld+json">` (ab Zeile 43).

Bestehende Typen `LocalBusiness` und `WebSite` behalten. Ergänzen:

1. **`geo`** im LocalBusiness, sobald die Koordinaten des Trainings- oder Geschäftsortes feststehen:

   ```json
   "geo": {
     "@type": "GeoCoordinates",
     "latitude": 53.577,
     "longitude": 10.034
   }
   ```

   Werte nicht schätzen — aus Google Maps „Was ist hier?“ oder dem verifizierten Unternehmensprofil übernehmen.

2. **`sameAs`**: Profile, die wirklich existieren (Instagram, LinkedIn, Unternehmensprofil-URL).

3. **`Person`** für Michael Fraenkel, verknüpft als `employee` / `founder`.

4. **`Service`**: Name `Kleingruppentraining Fußball`, `areaServed` Hamburg, `provider` = LocalBusiness-`@id`.

5. **`FAQPage`**, nur für Fragen, die sichtbar auf der Seite stehen. Text in Markup und HTML muss übereinstimmen.

Prüfen: [https://search.google.com/test/rich-results](https://search.google.com/test/rich-results) mit der Live-URL.

### 6.2 Open-Graph-Bild

Aktuell: Hochformat-Porträt `assets/michael-fraenkel-profilkarte.jpg` (schlecht für Shares).

1. Bild **1200×630 px** anlegen, z. B. `assets/og-entwicklungsraum-fussball.jpg`.
2. Motiv: Logo + kurzer Angebotstext („Kleingruppentraining Fußball Hamburg“), kein kleines Textwirrwarr.
3. In `index.html` ersetzen:

   - `og:image`
   - `twitter:image`
   - JSON-LD `image` (zusätzlich darf das Porträt als zweites Bild im Array bleiben)

4. Ergänzen:

   ```html
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   ```

5. Nach Deploy Cache leeren: [https://developers.facebook.com/tools/debug/](https://developers.facebook.com/tools/debug/)

### 6.3 Favicon

Im Repo-Root bzw. unter `assets/`:

- `favicon.ico` oder `favicon.svg`
- `apple-touch-icon.png` 180×180

In `index.html` `<head>`:

```html
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml" />
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
```

Kein Ranking-Faktor, aber Wiedererkennung in Tabs und auf dem Handy.

---

## 7. Recht-Seiten und Indexierung

**Dateien:** `recht/impressum.html`, `recht/datenschutz.html`, `recht/agb.html`  
Zeile 7 jeweils: `<meta name="robots" content="noindex, follow" />`

**Empfehlung:** `noindex` **lassen**. Ranking-Gewicht bleibt auf der Startseite. Deshalb gehören diese URLs auch **nicht** in `sitemap.xml`.

`recht/datenschutz.html`: Hosting-Platzhalter (Abschnitt 2) ausfüllen, sobald der Hoster feststeht — das ist rechtlich, nicht SEO, blockiert aber einen sauberen Auftritt.

---

## 8. Außerhalb der Website (laufend)

Ohne Erwähnungen und Bewertungen bleibt eine neue Marke unsichtbar, auch mit perfektem HTML.

- Eltern nach dem ersten Block um eine **Google-Bewertung** bitten (Link zum Unternehmensprofil).
- Vereine, HFV, NTSV, DFB-Umfeld: Website-Link oder kurze Erwähnung, wo es sachlich passt.
- Einheitliche NAP in lokalen Verzeichnissen, keine Fantasie-Einträge.
- Kein Linkkauf, keine PBNs, keine Massenverzeichnisse.

---

## 9. Nach jedem Deploy

1. Live-Quelltext: Title, Description, Canonical, JSON-LD vorhanden?
2. `curl` auf `robots.txt` und `sitemap.xml` → 200
3. Search Console → URL-Prüfung der geänderten Seiten
4. `sitemap.xml` → `lastmod` angepasst?
5. PageSpeed Insights: [https://pagespeed.web.dev/](https://pagespeed.web.dev/) für Mobil — LCP/CLS nur beobachten, nicht als Erstes optimieren

---

## Dateien in diesem Repo

| Datei | SEO-Rolle | Typische Änderung |
|--------|-----------|-------------------|
| `index.html` | Title, Meta, Canonical, OG, H1, JSON-LD, sichtbare Texte | Abschnitte 3, 4, 6 |
| `content/site-config.json` | Title, Description, Telefon, Standortlabel | Abschnitte 3 und 4; `js/site.js` liest das zur Laufzeit |
| `js/site.js` | überschreibt Title/Description aus der JSON | nur anfassen, wenn die Überschreibung stört |
| `sitemap.xml` | URL-Liste für Google | Abschnitte 1 und 5 |
| `robots.txt` | Crawling + Sitemap-Hinweis | nur bei Domainwechsel |
| `CNAME` | GitHub-Pages-Domain | Abschnitt 1.3 |
| `.nojekyll` | verhindert Jekyll auf Pages | anlegen, Abschnitt 1.2 |
| `recht/*.html` | `noindex`, NAP im Impressum | Abschnitt 7 |
| `assets/` | OG-Bild, Favicon, Trainingsfotos | Abschnitt 6 |

Absolute URLs bei Domain- oder Pfadwechsel **synchron** halten: `index.html` (Meta + JSON-LD), `robots.txt`, `sitemap.xml`.
