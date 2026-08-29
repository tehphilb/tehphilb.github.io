# icke.dev

Eine Seite, ein Inhalt: die E-Mail und das eine Projekt. Lokal ansehen:

```sh
python3 -m http.server 4321 --bind 127.0.0.1
```

http://127.0.0.1:4321/

## Kontakt

Kein Formular, kein Backend. Die E-Mail-Adresse ist ein `mailto:`-Link und kommt aus `site.json`.

## DSGVO / Impressum

Kein Cookie-Banner (keine Tracker, Schriften lokal). Pflichtseiten:

- `site.json` — Name, Anschrift und E-Mail eintragen; Startseite, Impressum und Datenschutz lesen das automatisch (via `legal.js`)
