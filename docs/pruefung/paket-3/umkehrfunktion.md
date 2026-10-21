# Prüfprotokoll: `umkehrfunktion` – Umkehrfunktionen: Spiegeln an y = x

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 5) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: eigener Ordner im Scratchpad (`shots/umkehrfunktion-*.png`, nicht committet)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-5.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. Aufgabe 5, f(x) = x² (x ≥ 0), a = 1,5: f′(1,5) = 2 · 1,5 = 3, b = 2,25, (f⁻¹)′(2,25) = 1/3 ≈ 0,333; Probe 1/(2√2,25) = 1/3. Karte nach dem Aufdecken: „m = f′(1,5) = 3“, „(f⁻¹)′(2,25) = 1/3 ≈ 0,333“ ✓.
  2. Steigungsdreieck dort: Δx = 0,51 (gerundet) ⇒ Δy = 3 · 0,507 ≈ 1,52; an P′ getauscht Δx = 1,52, Δy = 0,51 ✓. Mittelpunkt M((1,5 + 2,25)/2 | …) = M(1,875 | 1,875) ≈ M(1,88 | 1,88) ✓.
  3. Aufgabe 6, f(x) = 0,5x³: f′(0) = 0 (senkrechte Tangente an f⁻¹), f(2) = 4, f′(2) = 1,5 · 4 = 6 ⇒ (f⁻¹)′(4) = 1/6 ≈ 0,167 ✓.
- **Sonderfälle:** waagrechte Tangente (f′(a) = 0) bei 0,5x³ an der Stelle 0 ✓; x² auf ℝ und sin auf ℝ „nicht umkehrbar“ ✓; 1/x: linker Ast nur negative, rechter nur positive Funktionswerte (geprüft, neuer Test).
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** unverändert in Ordnung.
- **Begriffe wie im Unterricht:** DE W_f (Wertemenge); EN jetzt R_f (range).
- **Neue/ergänzte Tests:** `tests/umkehrfunktion.test.ts` um 2 Tests ergänzt (Vorzeichen der Äste von 1/x; (f⁻¹)′ = 1/3 bzw. 1/6 und f′(0) = 0 bei 0,5x³).

## 2. Aufgaben und Texte (DE und EN)
- **Befunde umgesetzt (im Code bestätigt):**
  1. Aufgabe 3 (`dom=all&show=0`): Die Karte „Definitionsmenge einschränken“ verdeckte nur die gewählte Zeile; die Zeilen „x ≥ 0 → f⁻¹(x) = √x“ und „x ≤ 0 → −√x“ standen offen ⇒ alle Zeilen der Umkehrfunktion bei `show=0` verdeckt.
  2. Aufgabe 5: Steigung „m = f′(1,5) = 3“, der Bruch „1/3“ in (f⁻¹)′ und Δx/Δy in der Steigungsdreieck-Karte waren sichtbar ⇒ bei `show=0` „= ?“. Ebenso im Bild die Pillen „m = f′(a) …“, die Kathetenlängen an P und P′ und „m′ = 1/…“.
  3. Aufgabe 6: „f′(0) = 0 ⇒ senkrechte Tangente in P′(0 | 0)“, „f⁻¹ ist dort nicht differenzierbar“, der Hinweis „Division durch 0“ (Steigungsdreieck) und die Bildpille „senkrechte Tangente“ verrieten die Lösung ⇒ bei `show=0` einheitlich „m = f′(0) = ?“, „(f⁻¹)′(0) = ?“, „Δx = ?, Δy = ?“, „m′ = ?“. Damit verrät die Karte auch nicht mehr, ob der Sonderfall vorliegt.
  4. „Die Äste haben verschiedene Vorzeichen.“ ⇒ „Auf dem linken Ast sind alle Funktionswerte negativ, auf dem rechten positiv.“ (EN entsprechend); inhaltlich für 1/x geprüft.
  5. EN: W_f ⇒ R_f (range) in Karten, Achsenpillen, Rechenweg und Ergebnis „Domain and range“; im EN-Material erklärt (R_f = range, deutsch W_f für „Wertemenge“), dazu D_f = ℝ, R_f = ℝ⁺ für eˣ.
- **Bewusst sichtbar gelassen:** „f′(x) = 2x“ bzw. „f′(x) = 1,5x²“ (Werkzeug, nicht die gefragte Zahl) und die gezeichneten Tangenten/Graphen.
- **Aufgabenlinks geprüft:** alle 6 DE- und 3 EN-Aufgabenlinks bei 1360 px: keine Lösung sichtbar.

## 3. Geräte
- **1360 hell, 1360 dunkel, 390, EN 1360:** keine Überlappungen, kein Überlauf, keine Konsolenfehler (simshot). Geänderte Zustände (Aufgabe 3, 5, 6 verdeckt und aufgedeckt, 1/x EN dunkel mit R_f) angesehen ✓.
- **Touch/Maus:** nicht verändert.

## 4. Barrierefreiheit
- Keine Änderung an Bewegung, Tastatur oder Farben; die neuen „?“-Zeilen nutzen dieselben Theme-Farben.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/umkehrfunktion/index.ts` | `show=0`: alle f⁻¹-Zeilen, m, (f⁻¹)′, Δx/Δy, Sonderfall „senkrechte Tangente“ in Karten und Bild verdeckt |
| `src/simulations/mathematik/umkehrfunktion/index.ts` | Text zu 1/x präzisiert; EN R_f statt W_f |
| `src/content/simulations/en/umkehrfunktion.md` | R_f erklärt |
| `tests/umkehrfunktion.test.ts` | 2 Tests ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3380/3380 grün (148 Dateien), Build ok.
