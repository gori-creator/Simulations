# Scitura

Kostenlose, interaktive Simulationen für den **Mathematik- und Physikunterricht** – für den Beamer, das Tablet und das Lernen zu Hause. Zuerst auf Deutsch, nach und nach auch auf Englisch. Chemie und Hochschulthemen folgen später.

**Scitura ist Open Source und eine offene Bildungsressource (OER).** Jede und jeder kann mitmachen: Fehler melden, Texte verbessern oder eigene Simulationen beitragen – auch mit KI-Assistent und fertigen Prompts.

- 🌐 Website: <https://scitura.de> · 🎮 Lernspiel: [Zahlenfabrik](https://scitura.de/de/zahlenfabrik/)
- 🤝 Mitmachen: [`CONTRIBUTING.md`](CONTRIBUTING.md) · Simulation mit KI bauen: [`docs/MITMACHEN-SIMULATION.md`](docs/MITMACHEN-SIMULATION.md)
- ⚖️ Lizenz: Code [MIT](LICENSE), Inhalte [CC BY-SA 4.0](LICENSE-INHALTE.md)
- 🔒 Sicherheit: [`SECURITY.md`](SECURITY.md) · Umgang miteinander: [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)

> *English:* Scitura is an open-source collection of interactive maths and physics simulations for schools (German and English). Code MIT, content CC BY-SA 4.0. Contributions welcome – see [CONTRIBUTING.md](CONTRIBUTING.md).

> Die Website heißt seit 27.10.2026 **Scitura** (vorher Arbeitstitel „MINT-Simulationen“). Der Name steht zentral in `src/config/site.ts`.

## Was die Seite kann

- **179 fertige Simulationen** (103 Mathematik, 76 Physik) entlang der KMK-Bildungsstandards, Klassen 5–13 und teils Uni – von Bruchteilen und Satz des Pythagoras über Funktionen, Stochastik und Analysis bis zu Mechanik, Optik, Elektrizität, Schwingungen und Quantenphysik.
- **Länder-Lehrpläne:** Gymnasium, Mathematik und Physik, für 14 Bundesländer (alle außer Thüringen und Mecklenburg-Vorpommern) – mit Ansicht nach Jahrgangsstufe und Lernbereich.
- **Lernspiel Zahlenfabrik:** Fabrik-Spiel zum Rechnen für Klasse 5–9 mit über 30 Kapiteln, Tagesrätsel, eigenem Level-Baukasten und offener Welt (`src/spiele/`).
- **Optionale Bilder:** Simulationen können Fotos nutzen (Liste mit Bild-Prompts in [`docs/BILDER.md`](docs/BILDER.md)); fehlt ein Bild, wird eine gezeichnete Ersatzgrafik verwendet.
- **Regler, Schalter und ziehbare Punkte** – mit Maus, Stift oder Finger; Zoomen und Verschieben.
- **Teilen per Link und QR-Code:** Jede Einstellung steckt in der Adresse. Optional mit **gesperrten Reglern** oder **verdeckten Ergebnissen** (Aufgabenmodus).
- **Lernmaterial zu jeder Simulation:** Erklärung mit Formeln, Ausprobier-Aufträge, Aufgaben mit Lösungen, Ideen für den Unterricht.
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

## Stand der Entscheidungen

- **Lizenz (entschieden 20.11.2026):** Open Source und OER – Code unter [MIT](LICENSE), Texte, Aufgaben und Bilder unter [CC BY-SA 4.0](LICENSE-INHALTE.md); Name und Logo „Scitura“ ausgenommen. Fremde Bestandteile (KaTeX, qrcode-generator, Astro; MIT) stehen in `public/lizenzen.txt`.
- **Name und Domain (entschieden 27.10.2026):** Scitura, <https://scitura.de> (Hosting bei STRATO).
- **Länder-Lehrpläne:** 14 von 16 Bundesländern sind hinterlegt (Gymnasium, Mathematik und Physik). Offen: Thüringen und Mecklenburg-Vorpommern (zurückgestellt), später andere Schularten.
