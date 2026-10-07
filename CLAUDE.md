# CLAUDE.md

Interaktive MINT-Simulationen (Mathe/Physik, später Chemie) für Schulen. Statische Astro-Seite, TypeScript, Canvas. Hauptsprache Deutsch, zusätzlich Englisch.

## Befehle

- `npm run dev` – Entwicklungsserver
- `npm run verify` – Typprüfung (`astro check`), Tests (`vitest`) und Build; vor jedem Commit ausführen
- `npm run new:sim -- <id> --subject <fach> [--animated]` – neue Simulation anlegen (siehe `docs/NEUE-SIMULATION.md`)

## Aufbau

- `src/curriculum/*.ts` – Lehrplan (einzige Quelle für Fächer, Bereiche, Themen, Simulationen; Status `planned`/`ready`)
- `src/lib/routes.ts` – alle Seiten/Adressen; interne Links immer über `href()`/`withBase()`
- `src/sim-core/` – Kern (Host, Regler, URL-Zustand, Plot/Surface, Format, Uhr). Simulationen importieren nur aus `src/sim-core/index.ts`
- `src/simulations/<fach>/<id>/` – Umsetzung (`index.ts`), Rechenlogik (`model.ts`); Registrierung in `registry.ts`
- `src/content/simulations/{de,en}/<id>.md` – Lernmaterial; `src/content/pages/{de,en}/` – Infoseiten
- `src/i18n/ui.ts` – alle UI-Texte (DE ist Referenz, EN muss alle Schlüssel haben)
- Details: `docs/ARCHITEKTUR.md`

## Konventionen

- Code-Kommentare und Dokumentation auf Deutsch; Bezeichner auf Englisch.
- Keine externen Ressourcen zur Laufzeit (CDNs, Webfonts, Analytics) – Datenschutz an Schulen.
- Texte immer zweisprachig (`L('de', 'en')`); deutsche Zahlen mit Dezimalkomma über `ctx.fmt`/`formatNumber`, Minus als `−`.
- Farben in Simulationen nur über `ctx.theme` (CSS-Variablen `--plot-*`, `--series-*`).
- Parameter-Schlüssel kurz, stabil (stehen in geteilten Links), nie mit `_` beginnend (`_lock`, `_hide` sind reserviert).
- Beim ersten `update()` keine abgeleiteten Werte per `ctx.set()` überschreiben (geteilte Links!).
- Neue Rechenlogik mit Tests in `tests/` absichern; Konsistenztests nicht abschwächen.
- KMK-Zuordnungen und fachliche Inhalte sorgfältig formulieren; Unsicheres als Entwurf kennzeichnen.
