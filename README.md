# MINT-Simulationen

Kostenlose, interaktive Simulationen für den **Mathematik- und Physikunterricht** – für den Beamer, das Tablet und das Lernen zu Hause. Zuerst auf Deutsch, nach und nach auch auf Englisch. Chemie und Hochschulthemen folgen später.

> „MINT-Simulationen“ ist ein Arbeitstitel. Der Name lässt sich zentral in `src/config/site.ts` ändern.

## Was die Seite kann

- **Bibliothek entlang des Lehrplans:** Mathematik und Physik, gegliedert nach Themen (KMK-Bildungsstandards) und Klassenstufen (5–13, teils Uni). Alle geplanten Simulationen (aktuell 129, davon 93 in Mathematik) sind bereits im Katalog eingetragen und werden nach und nach umgesetzt.
- **Nach Jahrgangsstufe:** Für Mathematik am bayerischen Gymnasium (LehrplanPLUS, Jgst. 5–13) gibt es eine Ansicht pro Jahrgangsstufe mit allen Lernbereichen und passenden Simulationen.
- **Fertige Simulationen (20):**
  - Mathematik – Zahlen und Terme: Bruchteile (Pizza, Kuchen, Strecke), binomische Formeln (animiertes Flächenmodell)
  - Mathematik – Geometrie: Satz des Thales, Satz des Pythagoras (mit Puzzle-Beweis), Kreiszahl π (Abrollen, Umlegen, Archimedes)
  - Mathematik – Funktionen: lineare Funktion, quadratische Funktion, Einheitskreis, allgemeine Sinusfunktion, exponentielles Wachstum
  - Mathematik – Daten und Zufall: Gesetz der großen Zahlen, Ziegenproblem (spielbar), Monte-Carlo-Methode für π, Galtonbrett
  - Mathematik – Analysis: von der Sekante zur Tangente, Ober- und Untersummen
  - Physik: schiefer Wurf (Erde, Mond, Mars, Luftwiderstand), Fadenpendel, Energieerhaltung an der Achterbahn, Brechung und Totalreflexion
- **Optionale Bilder:** Simulationen können Fotos nutzen (Liste mit Bild-Prompts in [`docs/BILDER.md`](docs/BILDER.md)); fehlt ein Bild, wird eine gezeichnete Ersatzgrafik verwendet.
- **Regler, Schalter und ziehbare Punkte** – mit Maus, Stift oder Finger; Zoomen und Verschieben.
- **Teilen per Link und QR-Code:** Jede Einstellung steckt in der Adresse. Optional mit **gesperrten Reglern** oder **verdeckten Ergebnissen** (Aufgabenmodus).
- **Lernmaterial zu jeder Simulation:** Erklärung mit Formeln, Ausprobier-Aufträge, Aufgaben mit Lösungen, Hinweise für Lehrkräfte.
- **Vollbild für den Beamer**, **Export als Bild**, **Hell-/Dunkelmodus**.
- **Datenschutz:** keine Konten, keine Cookies, kein Tracking, keine externen Server oder Schriftarten.
- **Offline-fähig:** Nach dem ersten Besuch funktioniert alles auch ohne WLAN (Service Worker).
- **Zweisprachig** (DE/EN) mit sprachabhängigen Adressen und Dezimalkomma im Deutschen.

## Schnellstart

Voraussetzung: [Node.js](https://nodejs.org) 22.12 oder neuer.

```bash
npm install
npm run dev        # Entwicklungsserver auf http://localhost:4321
```

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver mit Live-Reload |
| `npm run build` | Statische Seite nach `dist/` bauen |
| `npm run preview` | Gebaute Seite lokal ansehen (inkl. Offline-Modus) |
| `npm run check` | Typprüfung (TypeScript + Astro) |
| `npm test` | Unit- und Konsistenztests (Vitest) |
| `npm run verify` | Alles zusammen: Typprüfung, Tests, Build |
| `npm run new:sim -- <id> --subject <fach> [--animated]` | Grundgerüst für eine neue Simulation anlegen |

## Projektstruktur

```
src/
  config/site.ts          Name, Beschreibung, Repository-Link
  i18n/                   Sprachen, UI-Texte (ui.ts), Hilfsfunktionen
  curriculum/             Lehrplan: Fächer → Bereiche → Themen → Simulationen, KMK-Bezüge
  curriculum/lehrplaene/  Länder-Lehrpläne (Bayern, Gymnasium): Jahrgangsstufe → Lernbereich → Simulationen
  lib/routes.ts           Alle Seiten und ihre Adressen je Sprache
  sim-core/               Simulations-Kern (Koordinatensystem, Regler, Teilen, Animation …)
  simulations/            Umsetzungen der Simulationen + registry.ts
  content/simulations/    Lernmaterial je Sprache (Markdown mit Formeln)
  content/pages/          Infoseiten (Für Lehrkräfte, Über, Impressum, Datenschutz)
  components/ layouts/ views/ pages/   Astro-Seiten und Bausteine
  styles/global.css       Design-System (Farben, Hell/Dunkel, Bedienelemente)
tooling/                  Build-Erweiterungen (Service Worker, Formeln)
scripts/new-simulation.mjs
tests/                    Vitest-Tests
docs/                     Architektur und Anleitungen
```

Mehr dazu:

- [docs/ARCHITEKTUR.md](docs/ARCHITEKTUR.md) – wie alles zusammenspielt
- [docs/NEUE-SIMULATION.md](docs/NEUE-SIMULATION.md) – Schritt für Schritt zur neuen Simulation

## Veröffentlichen (GitHub Pages)

Bei jedem Push auf `main` baut `.github/workflows/deploy.yml` die Seite und veröffentlicht sie über GitHub Pages. Einmalig nötig:

1. Im Repository **Settings → Pages** öffnen.
2. Unter **Build and deployment → Source** „**GitHub Actions**“ wählen.

Der Basis-Pfad (z. B. `/Simulations/`) wird automatisch gesetzt. Für andere Anbieter genügt `npm run build` und das Hochladen von `dist/`; über die Umgebungsvariablen `SITE_URL` und `BASE_PATH` lassen sich Domain und Unterpfad festlegen.

**Vor dem Veröffentlichen:** Impressum und Datenschutzerklärung (`src/content/pages/de/imprint.md`, `privacy.md`) sind Vorlagen und müssen mit echten Angaben ergänzt und geprüft werden.

## Offene Entscheidungen

- **Lizenz:** noch nicht festgelegt. Ein gängiger Weg für freie Bildungsprojekte ist MIT (Code) plus CC BY 4.0 oder CC BY-SA 4.0 (Texte).
- **Name und Domain** des Projekts.
- **Weitere Länder-Lehrpläne:** Bayern (Gymnasium, Mathematik) ist hinterlegt; Physik und andere Bundesländer bzw. Schularten folgen.
