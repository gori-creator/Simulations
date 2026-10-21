# Prüfprotokoll: `zehnerpotenzen` – Potenzen, Zehnerpotenzen und Größenordnungen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `ca412bc` · Bogen: `scratchpad/pruefung/zehnerpotenzen/zehnerpotenzen.png` (außerhalb des Repos)

## Ergebnis
korrigiert (eine Rückfrage zur Lehrplan-Einordnung negativer Hochzahlen offen)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. 2⁵ = 2 · 2 · 2 · 2 · 2 = 4 · 2 · 2 · 2 = 8 · 2 · 2 = 16 · 2 = 32; 3⁴ = 3 · 3 · 3 · 3 = 9 · 9 = 81. Anzeige: „2 · 16 = 32“ (Würfelbau), „3⁴ = 81“, Zwischenprodukte 3, 9, 27, 81 ✓. 10⁹ = 1 mit 9 Nullen = 1 000 000 000 („eine Milliarde · 9 Nullen“) ✓; 10⁰ = 1 („kein Faktor“), 10¹ = 10 ✓.
  2. Wissenschaftliche Schreibweise: 1 270 000 → Komma 6 Stellen nach links → 1,27 · 10⁶, Probe 1,27 · 1 000 000 = 1 270 000 ✓. Erde–Sonne 149 600 000 → 8 Stellen → 1,496 · 10⁸ ✓. 12 742 000 → 1,2742 · 10⁷ ✓. 0,0042 → 3 Stellen nach rechts → 4,2 · 10⁻³, Probe 4,2 · 0,001 = 0,0042 ✓.
  3. Zoom, Faktor 10 pro Stufe: 10¹ m = 10 m = 1 000 cm = 0,01 km ✓; 10⁻³ m = 1 mm = 0,1 cm ✓; 10⁷ m = 10 000 km = 10 000 000 m ✓. Erde 12 742 km : 10 000 km ≈ 1,27 Kästchen – im Bild ≈ 1,3 Kästchen breit ✓; Haus bei 1 Kästchen = 10 m genau ein Kästchen hoch ✓.
  4. Vergleichssätze: Marienkäfer 7 mm : 1 mm = 7 ✓; Apfel 8 cm : 0,7 cm ≈ 11 („gut zehn“) ✓; Kind 1,4 m : 0,08 m ≈ 18 ✓; Haus 10 m : 1,4 m ≈ 7 ✓; Zugspitze 2 962 m : 105 m ≈ 28 ✓; Flugzeug 10 000 m : 2 962 m ≈ 3,4 („mehr als dreimal“) ✓.
- **Reale Größen:** Sandkorn ≈ 1 mm, Kind (5. Klasse) ≈ 1,4 m, Fußballfeld 105 m, Zugspitze 2 962 m, Reiseflughöhe ≈ 10 km, Grenze zum Weltraum ≈ 100 km, ISS ≈ 400 km, Erddurchmesser ≈ 12 742 km – plausibel, Näherungen mit „≈“.
- **Sonderfälle:** Zahl 0 → „0 geht nicht“ mit Erklärung; ungültige Eingabe → Hinweis; Hochzahl 0 → „kein Faktor, b⁰ = 1“; Reglergrenzen 10⁻³ / 10⁷: „Ausschnitt · 10“ bzw. „Ausschnitt : 10“ deaktiviert; Grundzahl 10, Hochzahl 9 (größter Wert 10⁹) exakt.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** echtes Minus in Hochzahlen (10⁻³), Dezimalkomma DE / Punkt EN, Dreiergruppen mit schmalem Leerzeichen ✓.
- **Begriffe wie im Unterricht:** Grundzahl/Hochzahl (Basis/Exponent), „zehn hoch sechs“, wissenschaftliche Schreibweise a · 10ⁿ mit 1 ≤ a < 10 ✓.
- **Neue/ergänzte Tests:** `tests/zehnerpotenzen.test.ts`, Test „Prüfrunde“: reale Größen (Sandkorn, Kind, Zugspitze, Erde), Faktor 10 je Stufe von 10⁻³ bis 10⁷, 149 600 000 = 1,496 · 10⁸, 10¹ = 10, 10⁰ = 1.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** alle 6 DE-Aufgaben stimmen (10⁴ = 10 000, 2⁵ = 32, 3⁴ = 81; 10⁹ : 10⁶ = 10³; 10 : 1,4 ≈ 7; 1 km = 10⁶ mm; 35 000 = 3,5 · 10⁴, 1 270 000 = 1,27 · 10⁶; 0,0042 = 4,2 · 10⁻³).
- **„Beispiel laden“ geklickt:** alle Aufgaben- und Lösungslinks sowie die Beispiele (Sandkorn, Erde, 10⁶, 3⁴, 35 000) geladen, Anzeigen passen. Fund: Bei Aufgabe 3 (`show=0`) verriet der Vergleichssatz im Bild die Lösung („Etwa sieben Kinder …“); bei anderen Objekten nennt er Größen (105 m, 10 km, 400 km) → behoben.
- **Texte korrigiert:**
  - EN hatte nur 3 von 6 Aufgaben und 4 von 6 Versuchen, Aufgabe 2 ohne „Load task“ → EN an DE angeglichen (Aufgaben 1–6, Versuche 1–6, Ausblick, Einsatz).
  - DE „Worum geht es?“: „im Unterricht der 5. und 6. Klasse nur ein Ausblick“ widersprach der eigenen Lehrplan-Zuordnung (Bayern Jgst. 6, LB 1.4 „Potenzen, auch mit negativen Exponenten“) → „In der 5. Klasse ein Ausblick, in der 6. Klasse lernst du sie genauer kennen.“; „Einsatz“ entsprechend ergänzt (mit „bitte am Lehrplan prüfen“).
  - Aufgabe 3 neu formuliert (die Frage verriet schon „etwa ein Kästchen hoch“).
  - „Ideen für den Unterricht“: „eignet sich vielleicht“ / „könnten die Kinder“ → klare Aussagen.
  - Beispiel „Licht pro Sekunde“ (300 000 km, tatsächlich ≈ 299 792 km) → „Licht in 1 s (rund, in km)“.
  - EN „one square on graph paper“ → „one small square on millimetre graph paper“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Karten vorhanden, Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Auf dem Handy (360 px) klebten die Einheiten „1 mm“ und „1 cm“ unter dem Größenstrahl aneinander → ein Einheiten-Schild wird ausgelassen, wenn es den Nachbarn berühren würde. Bei 1024 px passt im Wissenschafts-Modus das dritte Beispiel (Sandkorn) nicht mehr in die Seitenkarte – es wird sauber weggelassen, nichts abgeschnitten.
- **Touch (Ziehen) und Maus:** Ziehen in der Bühne / auf dem Größenstrahl, Antippen von Objekten, Mausrad – im Code geprüft, `ctx.locked` beachtet.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (laut JSON; „Reise starten“ springt bei reduzierter Bewegung direkt auf 10⁷, kein automatisches Zoomen; Übergänge ohne Dauer).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge der Seite regulär; alles auch über Regler, Auswahl und Aktionsknöpfe bedienbar.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt alle drei Ansichten (statisch, nicht abhängig von der gewählten Ansicht).
- **Farben:** nur `ctx.theme` (Hochzahl in Akzentfarbe, Grundzahl in Serie 0); Objektpunkte zusätzlich beschriftet, nichts nur über Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/zehnerpotenzen/index.ts` | Vergleichssatz im Bild bei ausgeschalteten Ergebnissen ausgeblendet (verriet Größen bzw. Lösung) |
| `src/simulations/mathematik/zehnerpotenzen/index.ts` | Einheiten unter dem Größenstrahl überlappen auf schmalen Handys nicht mehr |
| `src/simulations/mathematik/zehnerpotenzen/index.ts` | Beispiel „Licht in 1 s (rund, in km)“; EN-Text Millimeterpapier |
| `src/content/simulations/de/zehnerpotenzen.md` | Ausblick/Einsatz zu negativen Hochzahlen an Lehrplan-Zuordnung angepasst, Aufgabe 3 umformuliert, Lehrkräfte-Abschnitt ohne „vielleicht/könnten“ |
| `src/content/simulations/en/zehnerpotenzen.md` | an DE angeglichen: 6 Versuche, 6 Aufgaben mit Ladelinks, Ausblick, Einsatz |
| `tests/zehnerpotenzen.test.ts` | Test zu realen Größen, Faktor 10 pro Stufe, Erde–Sonne, 10¹, 10⁰ |

## 6. Für den Kern (nicht selbst ändern)
- Keine.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Negative Hochzahlen: Die Lehrplan-Zuordnung (`bayern-gymnasium-mathematik.ts`, Jgst. 6, LB 1.4) nennt „Potenzen, auch mit negativen Exponenten“. Das Lernmaterial behandelt 10⁻³ = 0,001 jetzt als Ausblick in Jgst. 5 und als Stoff in Jgst. 6 – bitte am LehrplanPLUS prüfen. Die Simulation zeigt negative Hochzahlen im Zoom (bis 10⁻³ m) und im Wissenschafts-Modus (mit Hinweis „Ausblick“ im Bild). Falls sie in Jgst. 6 vorgesehen sind, könnte „Ausblick“ im Bild entfallen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2888/2888 grün (davon 19 für `zehnerpotenzen`), Build ok.
