# Prüfprotokoll: `gleichungen-grafisch` – Gleichungen grafisch lösen: Schnittpunkte von Graphen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-gg.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (Fehler in Aufgabe 4 und im Hinweis bei a = 0 behoben, Texte ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Intervallhalbierung x² = 3, h(x) = x² − 3, Start [1; 2]: h(1,5) < 0, h(1,75) = 0,0625 > 0, h(1,625) < 0, h(1,6875) < 0 → [1,6875; 1,75]; 1,6875 → 1,7, aber 1,75 → 1,8, also noch nicht sicher. h(1,71875) = 2,9541 − 3 < 0 → [1,71875; 1,75]; h(1,734375) = 3,0081 − 3 > 0 → [1,71875; 1,734375], beide Grenzen → 1,7 ✓. Mit dem Modell (`agreedDigits`) bestätigt: erst nach 6 Schritten 1 Stelle sicher; in der Simulation geladen, Anzeige „Sicher: x₂ ≈ 1,7“. Selbst nachgerechnet.
  2. x² = 2: zwei Stellen (1,41) laut Modell erst nach 11 Schritten bei [1,4140625; 1,41455078125] ✓, obwohl die Breite schon nach 7 Schritten 1/128 < 0,01 ist.
  3. f mit a = 0 (Parabel): −1 = 0,5x + 2 ⇒ x = −6 ✓; Hyperbel mit a = 0, d = 1, e = 1: 1 = 0,5x + 2 ⇒ x = −2 ≠ 1, liegt in D = ℝ \ {1} ✓.
  4. Aufgabe 3: 4/x = x + 3 ⇒ x² + 3x − 4 = (x + 4)(x − 1) = 0 ⇒ −4 und 1, beide ≠ 0 ✓.
- **Fehler (behoben):** Aufgabe 4 (DE) / Task 3 (EN) hörte nach 4 Schritten auf und behauptete, alle Zahlen in [1,6875; 1,75] runden auf 1,7. Jetzt mit Schritt 5 und 6.
- **Fehler (behoben):** Hinweis bei a = 0 lautete „kein Parabel/Hyperbel“. Jetzt „Der Graph ist keine Parabel / kein Betragsgraph, sondern eine Parallele zur x-Achse“. Bei der Hyperbel besteht die Lücke wirklich (`poleOf` gibt d auch bei a = 0 zurück, D = ℝ \ {d}), daher eigener Satz mit dem Wert: „… keine Hyperbel, sondern eine Parallele zur x-Achse mit Lücke bei x = 1“. EN analog („the graph is not a parabola but …“).
- **Neue/ergänzte Tests:** `tests/gleichungen-grafisch.test.ts`: „Lernmaterial: Intervallhalbierung bei x² = 3 und x² = 2“ (Intervall nach 4 Schritten noch unsicher, sicher nach 6 Schritten bei [1,71875; 1,734375]; x² = 2 zwei Stellen nach 11 Schritten).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 L = {−2; 3} ✓, A2 keine / {2} / {−2; 2} ✓, A3 ✓, A4 ✓ (neu), A5 {−5; 1} ✓, A6 ✓.
- **„Aufgabe laden“:** A4 geladen und 7-mal „Intervall halbieren“ gedrückt, Tabelle stimmt mit der Lösung überein.
- **Texte korrigiert:** Tabelle „Wie viele Lösungen?“ um „genau einem Punkt“ und „drei Punkten“ ergänzt (beides kommt in der Simulation vor); A3 „(erlaubt, da x ≠ 0) … Beide Lösungen liegen in D.“; neuer Unterrichtsideen-Punkt zu den gesicherten Stellen bei x² = 2. EN: Task 3 mit Schritten 5 und 6; Auswahl „Absolute value“ statt nur „|x|“; y-Achsenabschnitt `t` wie in lgs-grafisch (nur Beschriftung).

## 3. Geräte
- **1360 hell/dunkel, 390 hell, EN 1360:** vollständig, kein Überlauf, keine Konsolenfehler. Die neuen a = 0-Hinweise passen in die Lösungskarte. In EN bricht die Funktionsart-Auswahl wegen „Absolute value“ in eine zweite Zeile um; gut lesbar.

## 4. Barrierefreiheit
- **Farben:** nur `ctx.theme` ✓. Aufgabenmodus (`show`, `_hide`) unverändert ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/gleichungen-grafisch/index.ts` | Hinweis a = 0 (DE/EN), eigener Satz für Hyperbel mit Lücke; EN „Absolute value“, t |
| `src/content/simulations/de/gleichungen-grafisch.md` | Tabelle, A3, A4 neu, Unterrichtsidee x² = 2 |
| `src/content/simulations/en/gleichungen-grafisch.md` | Task 3 neu |
| `tests/gleichungen-grafisch.test.ts` | Test Intervallhalbierung x² = 3 / x² = 2 |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
