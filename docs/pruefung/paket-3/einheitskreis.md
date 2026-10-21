# Prüfprotokoll: `einheitskreis` – Einheitskreis

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `45d979b` · Bogen: `/tmp/boegen3/einheitskreis.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. α = 40° (Beispiel „Mit Tangens“): 40° · π/180° = 0,6981 ⇒ Anzeige „α = 40° ≙ 0,698“; sin 40° = 0,6428, cos 40° = 0,7660, tan 40° = 0,6428 : 0,7660 = 0,8391 ⇒ „≈ 0,643“, „≈ 0,766“, „≈ 0,839“; sin² + cos² = 0,4132 + 0,5868 = 1 ⇒ „0,413 + 0,587 = 1“ ✓
  2. α = 225°: 225° = 5 · 45° ⇒ 5π/4 = 3,927; P liegt im III. Quadranten, Spiegelung von 45° am Ursprung ⇒ sin = cos = −√2/2 ≈ −0,707, tan = (−√2/2) : (−√2/2) = 1. Anzeige „5π/4 ≈ 3,927“, „sin α = −√2/2 ≈ −0,707“, „tan α = 1“, „III. Quadrant (sin α < 0, cos α < 0)“, „0,5 + 0,5 = 1“ ✓. Im Bild schneidet die Gerade OP die Tangente x = 1 bei y = 1 ✓
  3. α = 80°: sin 80° = 0,9848, cos 80° = 0,1736, tan 80° = 5,671 ⇒ „≈ 0,985“, „≈ 0,174“, „≈ 5,671“; 0,9698 + 0,0302 ⇒ „0,97 + 0,03 = 1“ ✓
  4. α = 330° ≙ 11π/6 (330 : 180 = 11/6) ≈ 5,760 ⇒ „≈ 5,76“; sin = −1/2, cos = √3/2 ≈ 0,866 ✓. α = 90° im Bogenmaß: „α = π/2 ≈ 1,571 ≙ 90°“, Graph-Achse mit π/2, π, 3π/2, 2π ✓
- **Sonderfälle:** 0° und 360° (Regler-Grenzen): „Punkt liegt auf einer Achse“, cos = 1; 90°/270°: „tan α: nicht definiert (cos α = 0)“, im Bild keine Tangensstrecke, im Graphen kein Tangenspunkt; 80° mit tan ≈ 5,67: Strecke auf x = 1 bei ±3 begrenzt. Ganze Liste der besonderen Winkel (Vielfache von 30° und 45°) gegen Math.sin/cos/tan geprüft (Test). Rundungsprobe: Für alle 721 Reglerwerte (0 … 360°, Schritt 0,5°) ergeben die auf 3 Stellen gerundeten sin² und cos² zusammen genau 1, die Anzeige „… = 1“ stimmt also immer auch mit den gezeigten Summanden.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma, echtes Minus, ° und ≙ korrekt. **Fehler behoben:** Bei exakten Dezimalwerten stand „≈“, z. B. „sin α = 1/2 ≈ 0,5“ und „cos α = −1/2 ≈ −0,5“ → jetzt „1/2 = 0,5“; bei √-Werten weiter „√3/2 ≈ 0,866“.
- **Begriffe wie im Unterricht:** Einheitskreis, Gradmaß/Bogenmaß, Quadrant (römisch), trigonometrischer Pythagoras – passend. **Englisch behoben:** Die Quadrant-Anzeige lautete „II. quadrant“ → jetzt „Quadrant II“; „the point lies …“ → „The point lies on an axis“.
- **Neue/ergänzte Tests:** Neue Datei `tests/einheitskreis.test.ts` (6 Tests): alle exakten Werte gegen Math.sin/cos/tan, echtes Minus, 360° wie 0°, `null` für 30,5°/40°, die Werte aus den Aufgaben (sin 120°, cos 120°, sin 150°), Quadranten inkl. Achsen und Rand 0,5°/359,5°, Tangens nicht definiert bei 90°/270°.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 sin 120° = sin 60° = √3/2, cos 120° = −cos 60° = −1/2 ✓; A2 sin α = 0,5 ⇒ 30° und 180° − 30° = 150° ✓; A3 45° = π/4, 225° = 5π/4, 3π/2 = 270°, 2π/3 = 120° ✓; A4 cos 90° = 0 ⇒ Division durch 0, Gerade OP parallel zu x = 1 ✓. Tabelle im Lernmaterial (0° … 360°) ✓. Lehrplanbezug (Jgst. 9 LB 7.2, Jgst. 10 LB 3) stimmt mit `lehrplaene/bayern-gymnasium-mathematik.ts` überein.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele (30°, 45°, 60°, 150°, Bogenmaß, Mit Tangens) und alle Links im Lernmaterial (30°, 150°, Tangens bei 80°, Bogenmaß bei 90°, 120°) mit simshot geladen – Zustände passen zum Text.
- **Texte vereinfacht/korrigiert:**
  - DE/EN Tangens: „Länge des Abschnitts auf der Tangente x = 1“ war ungenau (Vorzeichen, II./III. Quadrant) → „Die Gerade durch O und P schneidet die Tangente x = 1; die y-Koordinate des Schnittpunkts ist tan α (unterhalb der x-Achse negativ).“
  - DE/EN Ausprobieren 1 bezog sich nur auf die waagerechte Hilfslinie, die es am Handy (Kreis über dem Graphen) nicht gibt → „Verfolge die Höhe von P und den Punkt auf der Sinuskurve … Auf breiten Bildschirmen verbindet eine waagerechte Hilfslinie die beiden Punkte.“
  - DE Aufgabe 4: „Gerade durch den Ursprung O und P“ (O ist im Bild nicht beschriftet).
  - EN war unvollständig (Tabelle Gradmaß/Bogenmaß, Ausprobieren 5 „Bogenmaß“, Fragen in 2 und 4, Aufgaben 3 und 4, Lösungslinks in A2, Stolpersteine, Lehrplanhinweis fehlten) → auf den Stand der DE-Fassung gebracht.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Unter 600 px Kreis über dem Graphen, ab 600 px nebeneinander; Hauptsache groß, keine Karten, die wegfallen könnten. Kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink). Dunkelmodus gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:**
  - **Behoben:** Die Beschriftung „tan α“ im Kreis stand bei t/2 und verschwand bei α nahe 90° (z. B. 80°, Link aus „Ausprobieren 4“) aus dem Bild → auf |y| ≤ 1,15 begrenzt.
  - Verbleibend (klein): Bei α = 90° steht „sin α“ direkt neben der Achsenzahl 0,5; am Handy bei 225° berührt „sin α“ den Kreis, und die neue Kurvenbeschriftung „tan α“ liegt dort zufällig neben dem Tangenspunkt. Lesbar, daher belassen.
- **Touch (Ziehen) und Maus:** Beide Maßstäbe sind fest (kein Neueinpassen beim Ziehen). Gemessen bei 1360 px ohne Einrasten: Graph-Griff +179 px ⇒ 182,5° (erwartet ≈ 183°), +85 px ⇒ 102,5° (erwartet ≈ 103°); Kreisgriff von P(30°) auf (−1 | 0) ⇒ 180°. Mit Einrasten 5°-Schritte. **Behoben:** Waren Sinus und Kosinus ausgeblendet, saß der Graph-Griff auf der unsichtbaren Sinuskurve → jetzt auf der α-Achse.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut Bogen in Ordnung; Winkel auch über Regler und Zahlenfeld einstellbar (Ziehen ist Zusatz).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. `strings.canvas` war knapp und nannte den Tangens nicht → beschreibt jetzt P (cos α | sin α), Winkel, Strecken für Sinus/Kosinus/Tangens, die Graphen und die gestrichelte Linie beim aktuellen Winkel (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Alle Farben aus `ctx.theme` (series, text, muted, grid). **Behoben:** Im Graphen waren Sinus (rot) und Kosinus (blau) bzw. Tangens (grün) nur über die Farbe unterscheidbar → Kurvennamen „sin α“ (am Hochpunkt bei 90°), „cos α“ (am Tiefpunkt bei 180°) und „tan α“ (bei 225°). Im Kreis waren die Strecken schon beschriftet.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/einheitskreis/index.ts` | „=“ statt „≈“ bei exakten Dezimalwerten (1/2 = 0,5) |
| `src/simulations/mathematik/einheitskreis/index.ts` | Kurvennamen im Graphen (nicht nur Farbe) |
| `src/simulations/mathematik/einheitskreis/index.ts` | „tan α“ im Kreis bleibt im Bild (nahe 90°) |
| `src/simulations/mathematik/einheitskreis/index.ts` | Graph-Griff auf der α-Achse, wenn Sinus und Kosinus ausgeblendet sind |
| `src/simulations/mathematik/einheitskreis/index.ts` | EN-Quadrant „Quadrant II“, „The point lies on an axis“; ausführlicher Alt-Text der Zeichenfläche |
| `tests/einheitskreis.test.ts` | neu, 6 Tests (exakte Werte, Minus, Quadranten, Tangens) |
| `src/content/simulations/de/einheitskreis.md` | Tangens am Einheitskreis genauer, Ausprobieren 1 auch fürs Handy, „Ursprung O“ |
| `src/content/simulations/en/einheitskreis.md` | auf den Stand der DE-Fassung gebracht |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2881/2881 grün (126 Dateien), Build ok.
