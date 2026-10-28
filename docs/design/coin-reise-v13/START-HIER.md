# Scitura – Übergabe an den Main Manager in Claude Code

Stand: 27. Oktober 2026. Maßgeblich ist dieser Ordner `docs/design/coin-reise-v13/`, einschließlich des zuletzt bestätigten dunklen Logos 01. Frühere V2–V12-Entwürfe und die acht alternativen Einstiegstexte sind keine neue Gestaltungsaufgabe.

## Auftrag und Status

Der Nutzer hat das Startseiten-Design iterativ ausgewählt und den Namen **Scitura** sowie **Logo 01 in dunklem Blau** bestätigt. Jetzt soll der Main Manager den vorliegenden Entwurf in das bestehende Astro-Projekt integrieren. Dies ist eine funktionsfähige lokale Designreferenz; die produktiven Dateien unter `src/` wurden hier noch nicht ersetzt. Ein Upload dieses Ordners allein ändert die öffentlich sichtbare Startseite noch nicht.

1. Lies die aktuellen Projektregeln (`CLAUDE.md`, gegebenenfalls `AGENTS.md`) und `INTEGRATION.md`.
2. Öffne die mitgelieferte Vorschau bzw. `referenz/01-Startseite.png`. Erhalte den ausgewählten Aufbau und die Animationen.
3. Übernimm die Gestaltung in die aktuellen Astro-Komponenten. Arbeite mit dem aktuellen Repository, ohne ältere Projektdateien aus dem Designstand zurückzuspielen.
4. Nutze Curriculum, Routing, Übersetzungen, Simulationskern und vorhandene Energieerhaltungssimulation als Quelle.
5. Prüfe die Integration gemäß `ABNAHME.md`; vor einem Commit verlangt das ursprüngliche Projekt `npm run verify`.

## Verbindliche Designentscheidungen des Nutzers

- Website: **Scitura**, Deutsch und Englisch.
- Logo: **01**, dunkles Marineblau, an den Experimentbereich (#183365) angelehnt. `assets/scitura-logo-master.png` ist die aktuelle transparente Masterdatei; `scitura-logo.png` die Webdatei, `scitura-icon.png` das Browser-Icon. Auf der Münze wird das Zeichen hell dargestellt.
- Heller Einstieg, links klare Typografie und zwei Zugänge **Mathe-Simulationen / Physik-Simulationen**, rechts die körnige blaue Orbit-Skulptur. Keine zusätzlichen Werbeslogans oder Kennzahlen-Kacheln.
- Skulptur mit vollständig sichtbarem Sockel; begrenzter Schwenk, damit sie nicht zeitweise wie ein schmales Oval erscheint. Satelliten bewegen sich auf Umlaufbahnen.
- Münze trägt das Logo und bewegt sich auf einer nachvollziehbaren Bahn. Am Desktop (ab 1024 px) begleitet die Spur links die gesamte Seite; mobil Übergang zum Experiment.
- Darunter ein vollbreiter dunkelblauer Bereich mit echter, bedienbarer Achterbahn/Energieerhaltung. Starthöhe, Reibung, Masse, eigene Bahnpunkte, Pause und Reset bleiben bedienbar.
- Anschließend eine ruhige vollständige Simulationsliste mit Original-Vorschaubildern, Fach-/Klassenfiltern und Suche. Keine neue Marketing-Zwischensektion.

## Vorschau

Die vollständige Website ist zusätzlich als `Scitura-Vorschau.zip` im Gesamtpaket enthalten. Entpacken, Node.js installieren/vorhanden haben, im entpackten Ordner `node preview-server.cjs` ausführen und `http://127.0.0.1:4181/` öffnen. Unter Windows alternativ `Vorschau-starten.cmd`. Ist der Port belegt, anderen Port über `PORT` wählen. Alte Vorschauen auf 4176–4180 sind nicht diese Übergabekopie.

Im Originalprojekt kann die Vorschau mit `node docs/design/coin-reise-v13/export-preview.cjs` aus einem vorhandenen `dist/` erneut erstellt werden. Die optionalen Regenerationsschritte stehen in `INTEGRATION.md`. Für eine Sichtprüfung benötigt man weder Python noch Codex noch externe Dienste.

## Dateien

| Datei | Zweck |
|---|---|
| `index.html`, `style.css` | Ausgewählter Aufbau und Gestaltung |
| `app.js` | DE/EN, Navigation, Katalog, Münzpfad, Bewegungspause |
| `sculpture.js` | WebGL-Skulptur und Satelliten |
| `stage.ts` | Lesbarer Adapter zur bestehenden Energieerhaltungssimulation |
| `stage.js` | Bereits erzeugtes Browser-Bundle des Adapters |
| `catalog.js` | Katalog-Snapshot aus dem ursprünglichen Curriculum |
| `build-preview.cjs` | Katalog/Experiment aus dem Originalprojekt regenerieren |
| `export-preview.cjs` | Vorschau aus `dist/` plus diesen Quellen zusammenstellen |
| `assets/scitura-*` | Bestätigtes dunkles Logo und abgeleitete PNGs |
| `referenz/` | Screenshots und Prüfnachweise |
| `variants.*` | Frühere Textalternativen, nur zum Nachschlagen |

Die alten internen Bezeichner `MINT_CATALOG`, `MintPreview`, `MintJourney` und `mint:*` sind technische Namen, keine sichtbare Marke. Bei einer Umbenennung müssen alle Verbraucher gemeinsam angepasst werden.

Die ursprüngliche Projektbasis hatte Commit `c312098a2cf0f8a8c5918846c58cb1cdd819ef51`. Aktuellere Änderungen im Zielrepository haben Vorrang. Keine neuen Accounts, Analytics, externen Fonts oder CDN-Abhängigkeiten einführen.
