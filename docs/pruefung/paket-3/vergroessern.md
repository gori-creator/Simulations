# Prüfprotokoll: `vergroessern` – Ähnliche Figuren: Wie wachsen Fläche und Volumen?

Prüfer: Paket 3 · Datum: 20.10.2026 · Stand: Commit `5c90420` · Bogen: `/tmp/boegen3/vergroessern.png`

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Beispiel „Quader, k = 1,5“: Rechteck 2 cm² · 1,5² = 2 · 2,25 = 4,5 cm²; Quader 1 × 2 × 1 cm ⇒ 1,5 × 3 × 1,5 cm, V = 2 cm³ · 1,5³ = 2 · 3,375 = 6,75 cm³; O = 2 · (2 + 1 + 2) = 10 cm² ⇒ 10 · 2,25 = 22,5 cm². Anzeige „2 cm² → 4,5 cm² (· 2,25)“, „10 cm² → 22,5 cm²“, „2 cm³ → 6,75 cm³ (· 3,375)“, Zähler „Bild = 2,25 × Original“ und „3,375 × Original“ ✓
  2. Dreieck (gleichseitig, Seite 2 cm), k = 3: A = √3/4 · 2² = √3 ≈ 1,73 cm² ⇒ 9 · √3 ≈ 15,59 cm²; 9 Kopien, davon 3 auf dem Kopf (6 aufrecht + 3 umgedreht); Würfel 1 cm³ ⇒ 27 cm³, O = 6 · 9 = 54 cm². Anzeige „≈ 1,73 cm² → ≈ 15,59 cm² (· 9)“, „54 cm²“, „27 cm³“ ✓
  3. Pizza 20 cm / 30 cm: A₁ = π · 10² ≈ 314,16 cm², A₂ = π · 15² ≈ 706,86 cm², 706,86 : 314,16 = 2,25 = 1,5²; „Durchmesser + 50 %, Fläche + 125 %“ ✓. Gezogen auf 35 cm: (35 : 20)² = 1,75² = 3,0625 ⇒ Anzeige „≈ 3,063 (314 cm² → 962 cm²)“, π · 17,5² = 962,1 ✓
  4. Rückwärts: k³ = 27 ⇒ ∛27 = 3 (Probe 3³ = 27); k² = 2 ⇒ √2 ≈ 1,414 (Probe 1,414² ≈ 1,999 ≈ 2); Linie auf 11,2 gezogen ⇒ ∛11,2 ≈ 2,237 (2,237³ = 11,19) ✓
  5. Modell 1 : 10, Auto 4,5 m: Länge 45 cm, Lack · 1/100, Masse · 1/1000; 1 : 5 ⇒ 90 cm, 1/25, 1/125; 1 : 20 ⇒ 22,5 cm, 1/400, 1/8000 ✓. O : V beim Würfel a = 2 cm: 24 cm² : 8 cm³ = 3 = 6/a; zerteilt in 8 Würfel mit 1 cm ⇒ O = 8 · 6 = 48 cm², V bleibt 8 cm³ ✓
- **Sonderfälle:** k = 1 („kongruent“ im Merksatz); k < 1 (Verkleinern: Original wird mit Bildern ausgelegt, Faktoren als Stammbruch ¼, ⅛); Reglergrenzen k = 0,2 (25 bzw. 125 Bilder) und k = 4 (16 bzw. 64 Kopien) für alle Figuren und Körper; Rückwärts-Faktor 0,1 (k < 1) und 64 (k = 4 bzw. 8); `kFromFactor(0)` liefert NaN, ist aber durch die Reglergrenze f ≥ 0,1 ausgeschlossen; Würfel zerteilen für alle a = 0,5 … 5 cm (ganzzahlig: 1-cm-Würfel, sonst Halbierung in 8 Teile).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** cm, cm², cm³, m beim Auto; „≈“ beim Dreieck und Kreis. **Fehler behoben:** In der Animation „k suchen“ stand die Probe-Pille immer mit „≈“, also auch „2³ ≈ 8“ bei exaktem k → jetzt „=“, wenn k und der Faktor exakt sind (bei √2 weiterhin „≈“).
- **Begriffe wie im Unterricht:** Streckfaktor, ähnlich, kongruent/deckungsgleich, Quadrat-/Kubikwurzel, Oberfläche, Maßstab 1 : m – passend.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/vergroessern.test.ts`: Reglergrenzen k = 0,2 und k = 4 (Auslegen aller Figuren und Körper, Stammbrüche 1/25, 1/125); Würfel zerteilen über den ganzen Regler; Pizza an den Reglergrenzen (10 → 40 cm = 16-fach); Rückwärts an den Grenzen (64, 0,1).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 3 cm, 54 cm², 27 cm³ ✓; A2 1,5 cm², 0,125 cm³ ✓; A3 3 × 1,5 × 1,5 cm, 6,75 cm³, 22,5 cm² ✓; A4a k = 3, O · 9 ✓; A4b k = √2 ≈ 1,41 ✓; A5 8 € : 314 cm² ≈ 2,5 ct/cm², 15 € : 707 cm² ≈ 2,1 ct/cm² ✓; A6 O : V = 6, 3, 2; 54 → 162 cm² ✓. Keine Rechenfehler.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links im Lernmaterial (7 Ausprobieren-Punkte, 7 Aufgaben-Links mit `show=0&_hide=1`, Lösungslinks) mit simshot geladen und die Aktionen („Kopien auslegen“, „k suchen“, „Große Pizza aufteilen“, „Lack verteilen“, „Würfel zerteilen“) ablaufen lassen – Zustände passen zum Text; mit `show=0` stehen „?“ statt der Werte.
- **Texte vereinfacht/korrigiert:** DE Ausprobieren 7 „drücke jeweils die Aktion“ → „den Knopf unter der Zeichenfläche“. EN war deutlich kürzer (4 statt 6 Aufgaben, Aufgabe „Halbe Kante“, 4a und „O : V“ fehlten; 5 statt 7 Ausprobieren-Punkte; Erklärung ohne Kreis-Sektoren, Oberfläche und „k³ < k² < k“; Ideen ohne Lehrplanhinweis) → vollständig auf den Stand der DE-Fassung gebracht.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Layout passt (Handy: Bühne über den Karten; ab Tablet nebeneinander). Kein Überlauf, keine Konsolenfehler (nur 403 bei Schriften über den Symlink). Alle fünf Themen bei 360 px und 1024 px zusätzlich angesehen.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:**
  - Die Karte „Merke“ fiel bei 1360 px weg, sobald ihr Text länger ist (k = 0,5, k = 3 mit Dreieck). Jetzt wird das Diagramm „Wie schnell wächst was?“ bei Bedarf flacher (bis 126 px), damit „Merke“ Platz hat. Auf iPad hoch/quer reicht auch das nicht – dort fehlen weiter „Merke“ und im Thema O : V die dritte Karte „Kleine Körper, große Oberfläche“. Vertretbar: Das Lernmaterial verweist auf keine der beiden Karten, ihr Inhalt steht im Text (Erklärung, Aufgabe 6, Stolpersteine).
  - Verbleibend (klein): Im Wachstumsdiagramm stehen der Kurvenname „k³“ und die Wert-Pille „8“ bei k = 2 eng beieinander; im Rückwärts-Diagramm verdeckt der Griff die Achsenzahl auf seiner Höhe.
- **Touch (Ziehen) und Maus – behoben:** Beim Ziehen lief der Maßstab unter dem Zeiger weg, weil Strecke und Fläche (Spannweite max(k, 2)), Pizza (größerer Durchmesser), Rückwärts-Diagramm (y-Bereich 1,4 · f) und 3D-Ausschnitt während des Ziehens neu eingepasst wurden. Gemessen vorher: Streckengriff bei k = 3 um 60 px nach links ⇒ k = 1,6 statt ≈ 2,5; bei k = 2 um 25 px nach rechts ⇒ k = 2,5 statt ≈ 2,1. Jetzt bleiben alle Maßstäbe beim Ziehen fest und werden erst nach dem Loslassen weich neu eingepasst; der Zeiger wird auf das jeweilige Feld begrenzt. Nachgeprüft bei 1360 px: Strecke 60 px nach links ⇒ k = 2,5, 25 px nach rechts ⇒ k = 2,1; Quadratecke (−55 | +55) px ⇒ k = 1,4 (erwartet 1,45); Pizzarand 30 cm um +20 px ⇒ 35 cm, um −30 px ⇒ 22 cm (7,4 px/cm); Faktor-Linie über den oberen Rand ⇒ f = 11,2 (Diagrammobergrenze), danach Neueinpassung. Modellauto: Griff rechnet jetzt direkt aus der Lage (Griff bei a + Länge/(2m)) statt aus einer mitwandernden Position; +16 px ⇒ 1 : 5 ✓. Trefferradius 22 px bei Touch.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (neue Maßstabs-Übergänge springen bei reduzierter Bewegung sofort)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Reihenfolge Kopfzeile → Aktionen → Beispiele → Regler laut Bogen; alles auch über Regler erreichbar (Ziehen ist Zusatz).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente; `strings.canvas` beschreibt die drei Ebenen, das Auslegen, Karten, Diagramm und die weiteren Themen (DE/EN).
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Bedeutungsfarben aus `ctx.theme.series`. Karten- und Papierhintergrund, Rahmen, Pillen, Punkt-Umrandung im Diagramm, Kästchen der Quadrat-/Kubikzahlen und Fugen zwischen den Kopien waren feste Hex-/rgba-Werte → jetzt aus `bg`, `text`, `grid` des Themes. Fest bleiben Materialfarben (Pizza, Auto, Lackdose, Glanzlichter) ohne Bedeutung. Länge/Fläche/Volumen (blau/grün/lila) sind zusätzlich durch Beschriftung („Länge · k“, „Fläche · k²“, „Volumen · k³“) und Ebene unterscheidbar.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/vergroessern/index.ts` | Maßstäbe (Strecke/Fläche, Pizza, Rückwärts-Diagramm, 3D-Ausschnitt) beim Ziehen fest, danach weich neu eingepasst; Zeiger auf das Feld begrenzt; Modellauto-Griff direkt aus der Lage |
| `src/simulations/mathematik/vergroessern/index.ts` | Wachstumsdiagramm wird flacher, damit „Merke“ auf dem Laptop nicht wegfällt |
| `src/simulations/mathematik/vergroessern/index.ts` | „2³ = 8“ statt „2³ ≈ 8“ in der Animation „k suchen“ |
| `src/simulations/mathematik/vergroessern/index.ts` | neutrale Hintergrund-/Rahmenfarben aus dem Theme statt fester Werte |
| `tests/vergroessern.test.ts` | 4 neue Tests (Reglergrenzen k, Würfel zerteilen, Pizza, Rückwärts) |
| `src/content/simulations/de/vergroessern.md` | „den Knopf unter der Zeichenfläche“ |
| `src/content/simulations/en/vergroessern.md` | auf den Stand der DE-Fassung gebracht (Erklärung, 7 Ausprobieren-Punkte, 6 Aufgaben, Ideen für den Unterricht) |

## 6. Für den Kern (nicht selbst ändern)
- `withAlpha` (`src/sim-core/draw.ts`) gibt Farben, die nicht als `#rrggbb` vorliegen, ohne Transparenz zurück (wie schon bei `strahlensaetze` gemeldet). Für die neuen Theme-Farben wurde `mixColor(…, alpha)` verwendet.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Lehrplanbezug (Jgst. 9, Ähnlichkeit/zentrische Streckung) steht im Text bereits mit „bitte am Lehrplan prüfen“ – unverändert gelassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2875/2875 grün (125 Dateien), Build ok.
