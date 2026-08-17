# icke.dev

ASCII-Karte. Lokal ansehen:

```sh
python3 -m http.server 4321 --bind 127.0.0.1
```

http://127.0.0.1:4321/

## Kontaktformular

Formsubmit liefert oft keine Aktivierungsmail. Der Versand laeuft deshalb ueber dein eigenes Gmail (Google Apps Script). Kein Mailprogramm, kein Formsubmit-Account.

1. Oeffne [script.google.com](https://script.google.com) mit deinem Google-Konto.
2. Neues Projekt, Inhalt von `contact.gs` einfügen.
3. **Bereitstellen → Neue Bereitstellung → Web-App**.
4. Ausführen als: **Ich**. Zugriff: **Jeder**.
5. Beim ersten Mal Google-Berechtigung fuer Gmail erlauben.
6. Die Web-App-URL (`…/exec`) in `script.js` bei `CONTACT_WEBAPP_URL` eintragen.

Danach sendet das Formular direkt an info@icke.dev.

## DSGVO / Impressum

Kein Cookie-Banner (keine Tracker, Schriften lokal). Pflichtseiten:

- `site.json` — Name, Anschrift und E-Mail eintragen; Impressum, Datenschutz und Kontaktformular lesen das automatisch

Nach Aenderungen an `contact.gs` das Script bei Google speichern (Einwilligungsfeld `consent`).
