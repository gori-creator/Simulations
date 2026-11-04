# Auftrag: Zahlenfabrik fertig ausbauen

Briefing der Projektleitung (Stand 04.11.2026) für einen Claude-Agenten mit GitHub-Zugriff auf `gori-creator/Simulations`. Du arbeitest **nur** an der Zahlenfabrik. Lies zuerst `CLAUDE.md`, dann diese Datei, dann `docs/ZAHLENFABRIK-KONZEPT.md`.

## Zusammenarbeit

- Eigener Zweig von `main`, z. B. `spiel/zahlenfabrik`. Kleine, abgeschlossene Schritte; je Schritt ein Pull Request nach `main`. **Nicht selbst mergen**, außer die Projektleitung erlaubt es ausdrücklich.
- Vor jedem Commit: `npm run verify` (0 Fehler, alle Tests grün, Build ok). Node ≥ 22.23.4.
- Die Projektleitung ist Schüler, liest auf dem Handy: Berichte **deutsch, kurz, ohne Fachjargon**, mit dem Link zum Ausprobieren.
- Nach dem Merge landet `main` automatisch auf https://scitura.de (Upload dauert etwa 8 Minuten). Spiel: https://scitura.de/de/zahlenfabrik/

## Was die Zahlenfabrik ist

Ein Fabrik-Spiel mit Zahlen für die Schule (ab Klasse 5): Zahlenquellen geben Zahlen aus, Förderbänder bringen sie Feld für Feld weiter, Rechenmaschinen (+n, −n, ×n, ÷n) verrechnen sie, ein Lager bzw. die Basis sammelt sie. Ziel: Rechnen, Umkehroperationen, Teilbarkeit, Primzahlen, später Terme und Funktionen – spielerisch, mit echtem Factory-Game-Gefühl. **Keine Spielfigur**: Man sieht die Fabrik von oben.

## Stand (fertig, in `main`)

- Code: `src/spiele/zahlenfabrik/`
  - `model.ts`: Takt-Simulation der Level (eine Quelle, ein Lager, Fehler stoppen den Lauf), `shortestPath`, Sterne.
  - `levels.ts`: Welt 1 „Grundrechnen“, 6 Level auf freien Karten mit Felsen; Level 4 hat eine vorgegebene Maschine (🔒).
  - `world.ts`: **offene Welt** (40 × 28, 20 Quellen ohne Ende, Felsgruppen, Basis 3 × 3; gesammelt wird die Summe; verlorene Zahlen gehen weg, das Spiel läuft weiter).
  - `game.ts`: Oberfläche für beides – Karte verschieben (✋ Hand, zwei Finger), zoomen (Mausrad, +/−, ⌖), Band über Kästchen ziehen, Maschinen aus dem Inventar ziehen oder antippen, nochmal antippen dreht, Abbauen; Start/Pause/Takt/Schnell/Stopp. Bänder sind ein schmaler, laufender Streifen (SVG, auch Kurven). Spielstand im Local Storage (`spiel:zahlenfabrik`, `spiel:zahlenfabrik:welt`).
- Seite: `src/views/SpielView.astro`, Stil `src/styles/zahlenfabrik.css`, Liste der Spiele `src/spiele/index.ts` (`GAMES_PUBLIC = false`: nicht verlinkt, `noindex`), Route `game` in `src/lib/routes.ts`.
- Tests: `tests/zahlenfabrik.test.ts`, `tests/zahlenfabrik-welt.test.ts`.

## Wünsche der Projektleitung (in dieser Reihenfolge)

1. **Offene Welt ausbauen** (Hauptziel): „viele Zahlen-Spawner überall, irgendwo die eigene Basis, möglichst viele Zahlen sammeln“.
   - **Münzen und Kaufen:** Gesammelte Zahlen bringen Münzen. Maschinen und Bänder kosten Münzen (Inventar mit Preisen); bessere Maschinen werden nach und nach freigeschaltet.
   - **Aufträge an der Basis**, z. B. „Liefere 50-mal die 12“, „Liefere nur Primzahlen“ – geben Belohnungen und schalten Neues frei (so bleibt Mathe im Mittelpunkt).
   - Größere bzw. später erweiterbare Karte; Quellen weiter weg geben größere Zahlen.
   - Weitere Bauteile: **Weichen** (gerade/ungerade, „teilbar durch n“, „Primzahl?“, „größer als n“), **Zusammenführen** (zwei Zahlen → Summe oder Produkt), **Tunnel/Brücke** zum Kreuzen.
   - Mehrere Zahlen auf einem Feld sauber regeln (Stau statt Überlappen), Leistung bei vielen Zahlen prüfen.
2. **Level-Welten 2–6** wie im Konzept (Rückwärts, Sortieren, Primzahlen, Terme, Funktionen), je 6–8 Level, jede mit Lösung im Test und Teile-Ziel = kürzester Weg (Vorbild `tests/zahlenfabrik.test.ts`).
3. **Aussehen und Gefühl:** Maschinen und Quellen schöner (eigene, gezeichnete Grafik, keine fremden Bilder), sanfte Animationen, kurze Einführung beim ersten Start (ohne Figur), optional Töne (standardmäßig aus).
4. **Bedienung mit der Tastatur** (Feld wählen mit Pfeiltasten, Teil setzen/drehen) und Barrierefreiheit (Beschriftungen, Kontrast hell/dunkel).
5. Wenn die Projektleitung zustimmt: `GAMES_PUBLIC = true`, Link in Kopfleiste/Startseite.

Unklar ist, ob die offene Welt die Level ersetzt: **Level bleiben** (als Einstieg), die offene Welt ist ein eigener Modus.

## Regeln (verbindlich)

- Alles aus `CLAUDE.md`: Texte immer Deutsch **und** Englisch (`L('de', 'en')`), Kommentare/Doku deutsch, Bezeichner englisch, keine externen Ressourcen (keine CDNs, Webfonts, Tracking), deutsche Zahlen mit Dezimalkomma und echtem Minus `−`.
- Farben über CSS-Variablen mit hellem und dunklem Wert (`:root` und `:root[data-theme='dark']`); die Seite startet immer hell.
- Content-Security-Policy: keine Inline-Skripte, keine `<style>`-Elemente; `style`-Attribute bzw. `el.style.setProperty` sind erlaubt.
- Rechenlogik ohne Oberfläche in eigenen Dateien und **mit Tests** (nachgerechnete Werte, Sonderfälle). Tests nie abschwächen.
- **Recht:** Ideen und Mechaniken von Factory-Games sind frei; nicht übernehmen: fremde Namen, Logos, Grafiken, Texte, Level oder Code; keine 1:1-Nachbildung.
- Fremde Dateien (Kurse, Simulationen, Startseite) nicht ändern, außer es ist für die Zahlenfabrik nötig – dann im Pull Request begründen.

## Prüfen vor jedem Pull Request

- `npm run verify` grün.
- Im Browser durchspielen (Playwright ist vorinstalliert, `require('playwright')`, `chromium.launch()`): Desktop 1360 px hell, Handy 390 px dunkel **mit Touch**, Tablet 1024 px. Keine Konsolenfehler, kein horizontaler Überlauf, alles bedienbar (Ziehen, Verschieben, Zoomen). Screenshots ansehen.
- Dunkelmodus in Tests: `localStorage.setItem('theme', 'dark')` vor dem Laden (die Systemeinstellung zählt nicht).
- `docs/ZAHLENFABRIK-KONZEPT.md` und `docs/AUFGABEN.md` aktuell halten.

## Bericht an die Projektleitung (nach jedem Schritt)

Was ist neu (3–5 Punkte), Link zum Spielen, was geprüft wurde, was offen ist, was als Nächstes kommt.
