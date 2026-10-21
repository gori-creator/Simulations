# Prüfprotokoll: `funktionenscharen` – Funktionenscharen

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 5) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: eigener Ordner im Scratchpad (`shots/funktionenscharen-*.png`, nicht committet)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-5.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. f_k(x) = (x − k) · eˣ: f_{k₁}(x) − f_{k₂}(x) = (x − k₁)eˣ − (x − k₂)eˣ = (k₂ − k₁) · eˣ ≠ 0 für k₁ ≠ k₂ ⇒ kein gemeinsamer Punkt ✓ (neuer Test).
  2. Dieselbe Schar, k = 1: f′ = (x − k + 1)eˣ = x · eˣ = 0 ⇒ x = 0, y = (0 − 1) · 1 = −1 ⇒ Tiefpunkt (0 | −1) (Karte „Min(0, −1)“, Ergebnis „minimum (0, −1)“) ✓; Wendepunkt x = k − 2 = −1, y = −2e⁻¹ ≈ −0,736 (Ergebnis −0,74) ✓.
  3. x³ − kx, k = 0: f′ = 3x² ≥ 0 ohne Vorzeichenwechsel ⇒ Terrassenpunkt (0 | 0), kein Extrempunkt ✓.
- **Begriffe:** EN „saddle point“ statt „terrace point“; Kürzel EN Max, Min, SP, I (DE unverändert H, T, TP, W).
- **Neue/ergänzte Tests:** `tests/funktionenscharen.test.ts` um 2 Tests ergänzt (Differenz zweier Scharkurven von (x − k)eˣ; k = 0 bei x³ − kx nur Terrassenpunkt).

## 2. Aufgaben und Texte (DE und EN)
- **Befunde umgesetzt (im Code bestätigt):**
  1. „Die Kurven sind gegeneinander verschoben.“ (Karte und Kommentar in `model.ts`) war fachlich unscharf ⇒ „Zwei Scharkurven unterscheiden sich überall um (k₂ − k₁) · eˣ ≠ 0.“ / „Two members always differ by (k₂ − k₁) · eˣ ≠ 0.“ – vorher am Term (x − k) · eˣ geprüft (s. o.).
  2. EN „terrace point“ ⇒ „saddle point“ (Fallunterscheidung, Kurzform, Ergebnis, EN-Material „a saddle point (no extremum)“). Gleiche Wortwahl wie in `stammfunktion-grafisch`.
  3. EN-Kürzel im Bild und in den Karten: H/T/TP/W ⇒ Max/Min/SP/I; das verdeckte „E(¿)“ heißt im EN „Ext(¿)“ (Entscheidung: der Befund nennt E, aber kein Ziel; „Ext“ für „extremum“ ist eindeutig). Im EN-Material H/T in den Lösungen ⇒ Max/Min.
  4. Ergebnis „Extrempunkte: Terrassenpunkt (0 | 0)“ ⇒ „Extrempunkte: keine (Terrassenpunkt (0 | 0))“ / „Extrema: none (saddle point (0, 0))“.
  5. EN „k ∈ [−3; 3]“ ⇒ „[−3, 3]“ (DE bleibt mit Semikolon).
- **Aufgabenlinks geprüft:** alle 5 DE- und 3 EN-Aufgabenlinks: Ableitungen, Punkte, Ortskurve und gemeinsame Punkte verdeckt ✓.

## 3. Geräte
- **1360 hell, 1360 dunkel, 390, EN 1360 (auch dunkel mit k = 0 und (x − k)eˣ):** kein Überlauf, keine Konsolenfehler; neue Hinweiszeile bricht sauber um.

## 4. Barrierefreiheit
- Keine Änderung.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/funktionenscharen/index.ts` | Hinweis zu (k₂ − k₁) · eˣ; EN saddle point, Kürzel Max/Min/SP/I/Ext, [−3, 3]; Ergebnis „keine (Terrassenpunkt …)“ |
| `src/simulations/mathematik/funktionenscharen/model.ts` | Kommentar angepasst |
| `src/content/simulations/en/funktionenscharen.md` | saddle point, Max/Min |
| `tests/funktionenscharen.test.ts` | 2 Tests ergänzt |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3380/3380 grün (148 Dateien), Build ok.
