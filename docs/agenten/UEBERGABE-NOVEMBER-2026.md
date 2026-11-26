# Übergabe (Stand 26.11.2026)

Für eine neue Claude-Code-Sitzung, auch in einem anderen Account. Erst ganz lesen, dann `CLAUDE.md`, `docs/agenten/QUALITAETSSICHERUNG.md` und `docs/agenten/SPICKZETTEL.md`. Die ältere `UEBERGABE.md` beschreibt den Stand von Oktober (Bauphase der geplanten Simulationen) und gilt nur noch als Hintergrund.

## 1. Stand

- `main` enthält 164 Simulationen (105 Mathe, 59 Physik), rund 470 000 Zeilen Code und knapp 40 000 Zeilen Tests.
- **Ausbau „Erste Wahl“ ist fertig:** 15 kleine Simulationen wurden auf je 6–8 Ansichten ausgebaut (PR #307–#326). Danach kam das „Nachlegen“ für die elf kürzesten davon (PR #328–#338): Jede bekam zwei Alltags- oder Animationsansichten, zwei Übungsarten, vier Beispiele, Lernmaterial DE/EN und Tests. Jetzt haben alle 15 zwischen 1350 und 2150 Zeilen.
- **Offen:** „Zweite Wahl“ und „Kann warten“ in `docs/agenten/AUSBAU-BRETT.md` (34 Aufgaben, z. B. Treibhauseffekt, Wärmekraftmaschine, Wechselstrom, Strahlenschutz). Die kürzesten Simulationen auf `main` sind zurzeit sinusfunktion (≈ 580 Zeilen), quadratische-funktion, einheitskreis, galtonbrett, sekante-tangente, monte-carlo-pi (≈ 820–910).
- Keine Routine, kein Wecker und kein offener PR aus dieser Sitzung.

## 2. Wünsche der Person (verbindlich)

- Antworten auf Deutsch, kurz, ohne Fachjargon. Die Person liest oft am Handy.
- **Ein Zweig und ein PR pro Schritt** (z. B. `nachlegen/<id>` von `main`, PR-Titel „Nachlegen: <Name>“).
- **Nie mergen, bevor die Person „merge“ sagt.** Danach mergt man per Squash.
- Vor jedem Push muss `npm run verify` grün sein. Danach folgt eine Sichtprüfung bei 390, 1024 und 1360 px, hell und dunkel.
- Der letzte gepushte Commit eines PR enthält `[bilder erneuern]`, damit die Bildtests neue Referenzbilder erzeugen.
- Keine Modellbezeichnung in Commits, PRs oder Dateien. Persönliche Daten der Person (E-Mail) nie verwenden.
- Kein Force-Push, kein Rebase fremder Zweige, keine leeren Commits.
- Zahlen in README und „Über uns“ ändern sich nur, wenn eine neue Simulation dazukommt.
- Sparsam arbeiten: Automatische Wecker oder Routinen nur auf ausdrücklichen Wunsch und nach getaner Arbeit wieder abschalten.

## 3. Ablauf „Nachlegen“ (bewährt, etwa 1 Stunde pro Simulation)

1. `git fetch origin main && git checkout -B nachlegen/<id> origin/main`
2. Bestand ansehen: `wc -l src/simulations/<fach>/<id>/*.ts`, in `model.ts` die Typen `TaskKind` und `kinds`, in `index.ts` die Modi, Presets, Strings, `updateReadouts`, `render` und `tick`.
3. **Modell** (`model.ts`): neue Rechenfunktionen mit kurzem deutschem Kommentar. Zwei neue Aufgabenarten an `TaskKind` und `kinds` anhängen. Den neuen Zweig in `makeTask` *vor* den letzten Rückfall-Zweig setzen.
4. **Ansicht** (`index.ts`): Den neuen Modus in die `mode`-Auswahl eintragen, dazu Parameter mit `visibleIf`, Hinweistext, vier Presets und den Übungs-Preset-Text („Üben: zehn Aufgabenarten“). Strings DE und EN anlegen, auch `aria-label`. Die Anzeige kommt in `updateReadouts` vor die anderen Zweige, und `draw…()` wird in `render` aufgerufen.
5. **Animation:** Bei `source === 'init'` oder einem Moduswechsel `ctx.clock.play()` aufrufen. Bei `prefersReducedMotion()` gleich den Endzustand zeigen. In `tick` die Uhr anhalten, wenn nichts mehr passiert.
6. **Tests** (`tests/<id>.test.ts`): Die neuen Funktionen und Aufgaben prüfen. Den Test für die Anzahl der Aufgabenarten anpassen (z. B. `length: 16 … toBe(8)`), aber nie abschwächen.
7. **Lernmaterial** (`src/content/simulations/{de,en}/<id>.md`): Je Ansicht einen Abschnitt `###` vor „## Ausprobieren“ / „## Try it“ einfügen und Links wie `[Text](?mode=…&key=…)` setzen. Wahrheitswerte schreibt man in Links als `1` oder `0`.
8. Prüfen:
   - `npx prettier --single-quote --print-width 200 --write <dateien>`. Das Repository hat keine Prettier-Konfiguration, ohne diese Optionen entstehen doppelte Anführungszeichen.
   - `npx tsc --noEmit -p .`
   - Screenshots mit `scripts/agenten/canvas-shot.cjs`
   - `npm run verify`
   - Beispiele und Material-Links mit `scripts/agenten/beispiele-pruefen.cjs` durchklicken (Erwartung „issues 0“).
9. Committen (Schlusszeilen nach Vorgabe der Sitzung), pushen, PR anlegen, PR abonnieren.

## 4. Stolperfallen

- Node: `export PATH=$(dirname $(npx -y -p node@22 which node)):$PATH`
- Den Dev-Server vor `npm run verify` beenden (`pkill -f "astro dev"` als eigenen Befehl, nicht in einer Kette mit dem Muster).
- Die Seiten-URL ist nicht die ID: Sie steht in der Startseite, z. B. `curl -s localhost:4323/de/ | grep -o 'href="/de/physik/[^"]*"'`.
- Strings: In EN darf kein `\d,\d` vorkommen, in DE kein `\d\.\d` (Konsistenztest). Ein doppelter Schlüssel im strings-Objekt erzeugt den Fehler TS1117.
- `text()` aus sim-core bricht nicht um. Lange Meldungen mit der eigenen `wrap()`-Funktion umbrechen und vorher `g.font` setzen. Auf 390 px wird es fast immer eng.
- Plot: Die y-Achse liegt bei x = 0. Bei Log-Achsen oder Achsen, die nicht bei 0 beginnen, die Daten verschieben (z. B. `x = log + 2`) oder `from: max(0, …)` nehmen.
- Farben nur über `ctx.theme`. Für helle oder dunkle Unterschiede steht `th.dark` zur Verfügung.
- Simulationen benutzen kein `innerHTML`, kein Netzwerk und keinen Speicher (Sicherheitstest).
- Beim Wechsel zwischen Zweigen nichts Uncommittetes mitschleppen. Im Zweifel `git stash` oder erst committen.

## 5. Ideen für die nächsten Schritte

- **Zweite Wahl** vom Ausbau-Brett nach `docs/agenten/AUFTRAG-AUSBAU.md` bearbeiten. Zum Reservieren den Zweig `ausbau/<id>` pushen.
- Die kürzesten Mathe-Simulationen (Liste in 1.) nach dem Muster aus 3. nachlegen.
- Bewährte Ideen für Alltagsansichten:
  - Physik: Heißluftballon, Eis, Verkupfern, Schrottkran, Polfilter am Himmel, 3D-Kino, Kleidung und Wind, Sonnenkollektor, Strohhalm, Blutdruck.
  - Mathe: Rechenpfade mit Karten, Klammer-Auflösen Schritt für Schritt.

## 6. Startnachricht für einen neuen Chat

> Lies `docs/agenten/UEBERGABE-NOVEMBER-2026.md`, dann `CLAUDE.md`, `docs/agenten/QUALITAETSSICHERUNG.md` und `docs/agenten/SPICKZETTEL.md`. Arbeite eine Simulation nach der anderen ab (Zweig und PR je Schritt), merge nur auf mein „merge“, antworte knapp auf Deutsch. Fang mit <Aufgabe> an.
