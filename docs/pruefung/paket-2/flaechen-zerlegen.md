# Prüfprotokoll: `flaechen-zerlegen` – Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `c76756c` · Bogen: `scratchpad/pruefung/flaechen-zerlegen/flaechen-zerlegen.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Parallelogramm g = 6 cm, h = 4 cm, s = 2: A = g · h = 6 · 4 = 24 cm². Schuhbandformel A(0|0), B(6|0), C(8|4), D(2|4): ½ · (0 + 6·4 + (8·4 − 2·4) + 0) = ½ · 48 = 24 ✓. Abgeschnittenes Dreieck ½ · 2 · 4 = 4 cm² wird um g = 6 nach rechts verschoben ✓. Anzeige „A = 24 cm²“, Rechteck 6 × 4 = 24 Kästchen ✓.
  2. Dreieck g = 6 cm, h = 4 cm, C(2|4): A = 6 · 4 : 2 = 12 cm². Kopie um 180° um M = Mitte von BC = (4|2): A′ = (8|4), B′ = (2|4), C′ = (6|0) → Parallelogramm (0|0), (6|0), (8|4), (2|4) mit 24 cm², das Dreieck die Hälfte ✓. Zählen: „24 : 2 = 12 Kästchen“ ✓.
  3. Trapez a = 7 cm, c = 3 cm, h = 4 cm: A = (7 + 3) · 4 : 2 = 20 cm²; Kopie ergänzt zu Grundseite a + c = 10 cm, 10 · 4 = 40 cm², Hälfte 20 ✓. Zwei Dreiecke (s = 2): 7 · 4 : 2 + 3 · 4 : 2 = 14 + 6 = 20 ✓.
  4. Lot außerhalb: stumpfwinkliges Dreieck g = 4, h = 3, C(7|3): Fußpunkt (7|0) außerhalb, Grundseite wird gestrichelt verlängert, A = 4 · 3 : 2 = 6 cm²; Verdoppeln + Umlegen ergibt 4 · 3 = 12 cm² ✓. Stark geneigtes Parallelogramm g = 3, h = 4, s = 7: 3 Schnitte, 4 Teile, Rechteck bei x = 1 … 4, 12 cm² ✓.
- **Grenzfall Lot außerhalb:** Die Zerlegung in senkrechte Streifen (Abstand G, Verschiebung um Vielfache von G) ist für jedes s korrekt (Streifen x ↦ Rest mod G – bijektiv auf das Zielrechteck; Zufallstest mit 400 Figuren). **Befund:** Bei Neigung nach links (s < 0, z. B. s = −2) blieb das kleine Dreieck liegen und das große Trapez wurde um g verschoben, obwohl der Schritt „das Dreieck auf die andere Seite schieben“ ansagt. Korrigiert (siehe 5.).
- **Sonderfälle:** s = 0 (Rechteck, kein Schnitt, Hinweis), s = g und s = −g (zwei gleich große Dreiecke), Trapez c = 0 (Hinweis „Trapez ist ein Dreieck“, C = D) und c = a (Parallelogramm), Reglergrenzen g, a 1 … 10, c 0 … 10, h 1 … 8, s −5 … 10: keine Division durch 0 (G ≥ 1).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm/cm² überall, „−3“ mit echtem Minus, Punkte A(0 | 0) über `fmt.point`, Zahlen über `fmt.num`.
- **Begriffe wie im Unterricht:** Grundseite g, Höhe h, Fußpunkt, Trapez mit Grundseiten a und c; Dreiecksformel als g · h : 2 (in Bayern Jgst. 6 üblich), im Lernmaterial zusätzlich als Bruch.
- **Neue/ergänzte Tests:** Neigung nach links (nur das kleine Dreieck wird verschoben, Schnitt bei x = 4), Grenzfall s = −g, stumpfwinkliges Dreieck C(−3|4) mit Lot außerhalb (24 cm² / 12 cm²); Zufallstest prüft jetzt die Lage des Zielrechtecks für s < 0 und dass genau ein Streifen liegen bleibt.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 5 · 3 = 15 cm² ✓; A2 8 · 5 : 2 = 20 cm² ✓; A3 4 · 3 : 2 = 6 cm² ✓; A4 (9 + 5) · 4 : 2 = 28 = 18 + 10 ✓; A5 (g, h) ∈ {(3, 8), (4, 6), (6, 4), (8, 3)} ✓; A6 h = 30 · 2 : 12 = 5 cm ✓.
- **„Beispiel laden“ / Links:** alle 6 Beispiele und die Lösungslinks (Parallelogramm → Rechteck, steil, Dreieck verdoppeln, stumpf, Trapez Kopie/zwei Dreiecke, c = 0, Scherung) geladen und angesehen – Werte und Ergebnisliste stimmen.
- **Texte korrigiert:**
  - A5 DE: „mit ganzzahligen Seiten“ → „mit ganzzahliger Grundseite und Höhe“ (die schrägen Seiten sind bei Versatz meist nicht ganzzahlig).
  - Ausprobieren 4: Frage nach zerschnittenen Kästchen ergänzt (passt zur Färbung, s. u.).
  - EN war deutlich gekürzt (Aufgaben „Dreieck“ und „Gleich groß, verschieden geformt“, Ausprobieren 6–7, Beispiel 20 cm², Stolpersteine fehlten). EN inhaltlich an DE angeglichen.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden, Karten auf Tablet vollständig; Handy zeigt nur den aktuellen Herleitungsschritt (gewollt).
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf. Bei „2 Dreiecke“ lag die Seite c (Markierung + Beschriftung) nur senkrecht, nicht waagerecht mit dem abgerückten Dreieck BCD versetzt – korrigiert. Auf dem Handy entfallen die Pillen A₁/A₂ aus Platzgründen (Werte stehen in der Formelkarte).
- **Touch (Ziehen) und Maus:** per Code geprüft: Trefferradius 22 px (Handy) / 18 px, Ziehen nur in der Ausgangsfigur, Werte rasten auf Gitterpunkte, Scherung hält h fest.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Glide-Dauer 0, Herleitungen springen, Zählen sofort fertig).
- **Tastatur:** alle Funktionen über Regler/Knöpfe erreichbar; Tab-Reihenfolge laut JSON regulär.
- **Namen, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text beschreibt Figur, Zerlegen/Ergänzen und Formel.
- **Farben:** Figur/Kopie Blau/Grün (series[0]/[2]), Grundseite/Höhe zusätzlich beschriftet – nichts nur über Rot/Grün. Papier, Kachelfüllung und Kartenverlauf nutzen einige feste Hex-Werte (`#fffefb`, `#131a26`, `#0e1420`, `#ffffff`) – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/flaechen-zerlegen/model.ts` | `targetRect`: bei s < 0 gespiegelte Lage (−G < x0 ≤ 0), damit bei Neigung nach links das abgeschnittene Dreieck wandert und nicht das große Teil (passt jetzt zum Schritttext). |
| `src/simulations/mathematik/flaechen-zerlegen/index.ts` | Kontrolle-Karte: Kästchen werden nach ihrer Mitte gefärbt (z. B. 10 blau / 14 grün beim Dreieck 6 × 4) – Text „Blaue Kästchen: Dreieck“ war irreführend → „Blau: Dreieck, grün: Kopie – zerschnittene Kästchen gehören zu beiden“ (EN „original“ → „triangle/trapezium“). |
| `src/simulations/mathematik/flaechen-zerlegen/index.ts` | „2 Dreiecke“: Seite c wird mit dem abgerückten Dreieck BCD vollständig (x und y) versetzt. |
| `tests/flaechen-zerlegen.test.ts` | 2 neue Tests (s < 0, s = −g, Dreieck mit Lot außerhalb), Zufallstest erweitert. |
| `src/content/simulations/de/flaechen-zerlegen.md` | A5-Formulierung, Ausprobieren 4. |
| `src/content/simulations/en/flaechen-zerlegen.md` | an DE angeglichen (fehlende Aufgaben, Ausprobieren, Stolpersteine). |

## 6. Für den Kern (nicht selbst ändern)
- Ein Theme-Token für „Papier“ (Kästchenpapier hell/dunkel) und für Text auf farbigen Flächen wäre hilfreich; die Simulation nutzt dafür feste Hex-Werte.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Keine fachlichen. Didaktisch: Die Kästchen beim Zählen werden nach ihrer Mitte Dreieck oder Kopie zugeordnet; eine Darstellung zerschnittener Kästchen (z. B. geteilt gefärbt) wäre anschaulicher, wäre aber ein größerer Umbau der Zählgrafik.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2937/2937 grün (126 Dateien), Build ok.
