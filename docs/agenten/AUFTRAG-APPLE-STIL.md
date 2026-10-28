# Auftrag: Webseite im cleanen Apple-Stil (Entwurf zur Abnahme)

Stand: 28.10.2026 · Auftraggeber: Projektinhaber · Ausführung: eigene Claude-Sitzung (anderes Konto)

## Worum es geht

Auf der Startseite umrahmt ein Fenster im macOS-Stil die Achterbahn-Simulation im dunkelblauen Bereich. Es hat Glas, Transparenz und einen dezenten Regenbogenrand. Umgesetzt ist es in `src/components/home/HomeExperiment.astro` und `src/styles/home.css` (Klassen `.home-experiment__window`, `__titlebar`, `__aurora`).

Das gefällt dem Inhaber sehr. Die **ganze Webseite** soll mehr in diesem cleanen, modernen Apple-Stil wirken: ruhig, hochwertig, viel Luft, feine Glas- und Lichteffekte. Bunt oder verspielt soll sie nicht werden.

## Vor dem Start lesen

- `CLAUDE.md`, `docs/ARCHITEKTUR.md`, `docs/agenten/ZUSAMMENARBEIT.md`, `docs/agenten/QUALITAETSSICHERUNG.md`
- Entwurf der Startseite: `docs/design/coin-reise-v13/UMSETZUNG.md`

## Aufgabe

1. **Vorschläge sammeln (8–12 Stück).** Für jeden Vorschlag angeben:
   - was geändert wird und wo (Dateien)
   - Aufwand
   - Risiken: Lesbarkeit, Kontrast, Barrierefreiheit, Leistung auf schwachen Schulrechnern, `prefers-reduced-motion`, `prefers-reduced-transparency`

   Mögliche Bereiche:
   - Kopfzeile: Glas/Blur
   - Karten im Katalog und auf den Fachseiten
   - Simulationsseite: Rahmen um Bühne und Bedienfeld; die neuen Reiter „Einstellungen · Beispiele · Ergebnisse“ als Segmented Control
   - Buttons, Typografie, Abstände, sanfte Übergänge
   - Dunkelmodus, Fußzeile, Infoseiten
2. **Die 3–5 überzeugendsten Vorschläge einbauen**, damit der Inhaber sie ansehen kann.
3. **Vorher-/Nachher-Bilder** machen:
   - Seiten: Startseite `/de/`, Fachseite `/de/physik/`, Simulationsseite `/de/physik/mechanik/energieerhaltung-achterbahn/`
   - Breiten 1360 px und 390 px, jeweils hell und dunkel
4. **Nichts zusammenführen.** Die Arbeit kommt auf einen eigenen Zweig (z. B. `design/apple-stil`) mit einem Pull Request nach `main`, der als **Entwurf** markiert ist. Darin stehen die Vorschlagsliste und die Bilder. Gemergt wird erst, wenn der Inhaber zustimmt.

## Grenzen

- Nur Optik (CSS und Markup). Keine Rechenlogik der Simulationen ändern.
- Inhalte der Bühne (`[data-sim-stage]`) nicht verändern, denn die Bildtests fotografieren sie (`docs/BILDTESTS.md`). Rahmen, Schatten und Abstände außen herum sind erlaubt.
- Bedienfeld (`src/components/SimulationShell.astro`, `src/sim-core/host.ts`, `src/sim-core/controls.ts`): Diese Funktionen müssen erhalten bleiben:
  - Reiter mit Tastaturbedienung
  - einklappbare Gruppen mit Kurzfassung
  - ⓘ-Hinweise
  - Sperre über `_lock=1`
  - Aufgabenmodus über `_hide=1`
  - Teilen/QR
  - Vollbild
  - auf dem Handy die haftende Reiterleiste
- Keine externen Ressourcen zur Laufzeit: keine CDNs, keine Webfonts, kein Analytics (Datenschutz an Schulen).
- Kontrast mindestens WCAG AA, in Hell und Dunkel. `backdrop-filter` sparsam einsetzen und immer mit einer deckenden Ersatzfarbe.
- Bewegung nur bei `prefers-reduced-motion: no-preference`. Den Bewegungsschalter der Startseite (`src/lib/home/motion.ts`) beachten.
- CSP: `style`-Attribute sind erlaubt, `<style>`-Elemente brauchen Hashes. Am besten CSS in `src/styles/`.
- Texte immer zweisprachig über `src/i18n/ui.ts`. Kommentare und Doku auf Deutsch.

## Prüfen vor dem Pull Request

- Astro braucht Node ≥ 22.23.4: `export PATH=$(dirname $(npx -y -p node@22 which node)):$PATH`
- `npm run verify` muss melden: 0 Fehler, 0 Warnungen, 0 Hinweise, alle Tests grün, Build fertig.
- `npm run bildtests` darf sich nicht ändern.
- Im Browser prüfen:
  - Startseite mit Münzbahn und Achterbahn-Fenster
  - Katalogsuche
  - eine Simulation mit Reitern, gesperrt (`?_lock=1`) und im Aufgabenmodus (`?_hide=1`)
  - Handy 390 px
  - Dunkelmodus

## Bericht an den Inhaber

Kurz und auf Deutsch:
- Vorschlagsliste mit Kennzeichnung, was eingebaut ist
- Link zum Entwurfs-Pull-Request
- Vorher-/Nachher-Bilder
- offene Fragen
