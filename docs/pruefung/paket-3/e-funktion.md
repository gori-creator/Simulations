# Prüfprotokoll: `e-funktion` – Die natürliche Exponentialfunktion

Prüfer: Paket 3, Befunde B (Paket 4) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: simshot 1360 hell/dunkel, 390 (hell/dunkel), EN, alle Aufgabenlinks

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-4.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. x₀ = 1: m = f′(1) = f(1) = e ≈ 2,718; Tangente y = e · (x − 1 + 1) = e · x, Nullstelle x₀ − 1 = 0 ✓ (Anzeige „≈ 2,718 · x“, „= 0“).
  2. x₀ = 0: m = e⁰ = 1, Tangente y = x + 1, Nullstelle −1 ✓.
  3. x₀ = 2: f(2) = e² = 7,389 ⇒ „P(2 | 7,389)“ ✓.
- **Rundung/„=“:** **Behoben:** Ergebnis „m = f′(1) = e¹ ≈ 2,718 = f(1)“ (das „= f(1)“ hing an der gerundeten Zahl) ⇒ „m = f′(1) = f(1) = e¹ ≈ 2,718“; bei x₀ = 0 „= 1“ statt „≈ 1“. Ebenso Tangente bei x₀ = 0: „= x + 1“ statt „≈ 1 · x + 1“ (bei der Sichtprüfung gefunden).
- **Neue/ergänzte Tests:** keine (nur Anzeige).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgabenlinks:** 3 DE, 2 EN geladen; Ableitung, Steigung, Tangente und Nullstelle verdeckt, im Bild „P“, „N“, „f(x₀)“ ohne Zahlen ✓.
- **EN-Punktschreibweise:** Der Prüfer wollte „(0 | 1)“ ⇒ „(0, 1)“ nur, wenn das Projekt in EN nicht überwiegend „( | )“ nutzt. Ergebnis der Zählung: EN-Lernmaterial ungefähr gleich verteilt (21 Dateien mit `\mid`, darunter auch P(A | B), gegenüber rund 17 mit Kommapunkten), der Kern-Helfer `fmt.point` schreibt EN verbindlich „(1.5, 2)“, und diese Simulation nutzte ihn schon für P′ – sie war also in sich uneinheitlich. Entscheidung: EN durchgehend „(a, b)“ wie `fmt.point` (Lernmaterial, Hilfetexte, Beispiel „Tangent at (0, 1)“, Ergebnisse und Bildbeschriftungen über einen lokalen Helfer `pt`), DE unverändert „(a | b)“.
- **Texte:** EN-Steckbrief „S_{y}(0 | 1), no zero“ ⇒ „y-intercept (0, 1), no zero“; Steckbrief EN „D = ℝ, W = ℝ⁺“ ⇒ „domain ℝ, range (0, ∞)“ (Bild und Lernmaterial); DE Ideen: „Zuordnung bitte am Lehrplan prüfen“ gestrichen.

## 3. Geräte
- 1360 hell/dunkel, 390 hell/dunkel, EN: Steckbrief-Zeilen passen in die Karte, keine Überlappung, kein Überlauf, keine Konsolenfehler. Kleinigkeit (unverändert): Die Pille oben links berührt bei 390 px die y-Achsenbeschriftung.

## 4. Barrierefreiheit
- Keine Änderung in diesem Durchgang.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/e-funktion/index.ts` | EN-Punkte „(a, b)“ (Helfer `pt`), EN-Steckbrief, „m = f′(x₀) = f(x₀) = e^x₀ ≈ …“, „=“ bei x₀ = 0 |
| `src/content/simulations/en/e-funktion.md` | Punkte „(a, b)“, „domain ℝ, range (0, ∞)“ |
| `src/content/simulations/de/e-funktion.md` | Lehrplan-Vermerk gestrichen |

## 6. Für den Kern
- Projektweite Regel für EN-Punkte (Komma wie `fmt.point`) festlegen; andere Simulationen nutzen in EN noch „( | )“.

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0; Tests 3374/3376 – die zwei Fehlschläge sind Zeitüberschreitungen (5 s) in `tests/grenzverhalten.test.ts` auf dem ausgelasteten Rechner, unabhängig von diesem Durchgang (Datei und Simulation unverändert); alle Tests dieser Simulation grün; Build ok (396 Seiten).
