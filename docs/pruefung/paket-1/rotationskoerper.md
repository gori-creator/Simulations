# Prüfprotokoll: `rotationskoerper` – Rotationskörper

Prüfer: Paket 1 (Befunde B) · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` · Bogen: `scratchpad/shots/r-*.png` (außerhalb des Repos)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-3.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert (Ausprobieren 5 verlangte „f verdoppeln“ am Kegelstumpf, der Griff ändert aber nur m; m² und k² auf 3 Stellen gerundet; „kleinster/größter Wert“ statt Radius).

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Kegel m = 0,5 auf [0; 4]: V = π ∫₀⁴ 0,25x² dx = π · 0,25 · 64/3 = 16π/3 ≈ 16,76 ✓; mit m = 1: 64π/3 ≈ 67,02 = 4 · 16,76 ✓ (Ausprobieren 5).
  2. Paraboloid k = 1,35: k² = 1,8225 (vorher als „1,823“ angezeigt) → V = π · 1,8225 · 8 ≈ 45,80 ✓; A(0,8) = π · 1,8225 · 0,8 ≈ 4,58 ✓.
  3. Kegel m = 1, 4 innere Scheiben: π · (0 + 1 + 4 + 9) · 1 = 14π ≈ 43,98, also −34,4 % gegenüber 67,02 ✓.
  4. Kugel r = 2: 32π/3 ≈ 33,51 ✓.
- **Einheiten, Rundung:** Koeffizienten von (f(x))² jetzt mit bis zu 4 Stellen (Schrittweite 0,05 → 0,05² = 0,0025).
- **Begriffe:** Auswahl „kleinster Radius (innen)“ / „größter Radius (außen)“ (Radius = |f(x)|, siehe `radiusRange` in `model.ts`).
- **Neue/ergänzte Tests:** keine (Rechenlogik unverändert).

## 2. Aufgaben und Texte (DE und EN)
- **Ausprobieren 5:** jetzt „Ziehe am grünen Griff in der Seitenansicht, bis m doppelt so groß ist (m = 1) …“ mit Link `?fn=kegel&m=0.5&a=0&b=4` – Keys `fn`, `m`, `a`, `b` geprüft, Link geladen ✓.
- **Ausprobieren 3 und Einführung:** „kleinster Radius (innen)“; „kleinster/größter Wert von |f(x)|“.
- **„Beispiel laden“ geklickt:** Start (Kugel), Kegel, Paraboloid mit k = 1,35, Kegel in 4 Scheiben ✓.

## 3. Geräte
- **1360 px hell/dunkel, 390 px:** in Ordnung, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/rotationskoerper/index.ts` | `coef(v, d)`: m² und k² mit 4 Stellen; Auswahl „kleinster/größter Radius“ |
| `src/content/simulations/de/rotationskoerper.md` | Ausprobieren 5 (Kegel, m verdoppeln), Ausprobieren 3, Einführung mit \|f(x)\| |

## 6. Für den Kern (nicht selbst ändern)
–

## 7. Entscheidungen
- **Kegel statt Kegelstumpf in Ausprobieren 5:** Nur bei f(x) = m · x verdoppelt das Verdoppeln von m die ganze Funktion.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3371/3371 grün (148 Dateien), Build ok.
