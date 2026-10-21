# Prüfprotokoll: `matrix-abbildungen` – Matrizen als lineare Abbildungen

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 6) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: Scratchpad `shots/ma/`

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-6.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. A = (1 2; 3 4), B = (0 1; 1 0): A·B = (1·0 + 2·1, 1·1 + 2·0; 3·0 + 4·1, 3·1 + 4·0) = (2 1; 4 3), B·A = (3 4; 1 2) ✓; det A = 4 − 6 = −2 ✓ (Ergebnis „Produkt“: „A·B = …; B·A = …; also A·B ≠ B·A“).
  2. Kundenwanderung A = (0,9 0,2; 0,1 0,8), x₀ = (1 | 0): x₁ = (0,9 | 0,1), x₂ = (0,81 + 0,02 | 0,09 + 0,08) = (0,83 | 0,17); stationär 0,9p + 0,2q = p ⇒ p = 2q ⇒ (2/3 | 1/3) ✓.
  3. Population wachsend (0 2; 0,5 0,5): λ² − 0,5λ − 1 = 0 ⇒ λ = (0,5 ± √4,25)/2 = 1,2808 bzw. −0,7808; betragsgrößter Eigenwert 1,28, J : E = 2/λ ≈ 1,56 ✓.
- **Trenner:** `det`, `eig`, `lim`, `prod` mit „;“.
- **Begriffe:** Karte „Langfristig“: „betragsgrößter Eigenwert“ / „dominant eigenvalue“; Beispieltext Population „Der betragsgrößte Eigenwert …“.
- **Tests:** Rechenlogik unverändert.

## 2. Aufgaben und Texte (DE und EN)
- **Rückfrage Aufgabe 6 (`ex=market` mit `n=2`):** im Browser geprüft – `ex` lädt seine Werte nur bei Bedienung (`source === 'input'`), der Link zeigt x₂ (n = 2) ✓. **Aber:** Die Beispielkarte verriet mit „Langfristig hat P 2/3 und Q 1/3 der Kunden“ die gesuchte stationäre Verteilung. Ergebnis-Sätze der Beispiele (Kundenwanderung, beide Populationen) stehen jetzt in einem eigenen Feld und erscheinen nur bei „Werte zeigen“. Link bleibt unverändert.
- **Alle Aufgabenlinks DE/EN geladen:** Ergebnisse verdeckt, im Bild „?“ ✓ (Produkt, Determinante, Eigenwerte, Inverse, Iteration).
- **Texte:** EN „Rotations by φ ≠ 0°, 180° have non-real eigenvalues.“; EN „the eigenvalue of largest absolute value decides …“; DE Ausprobieren 4 „Grundseite · Höhe des Parallelogramms“ statt „g · h“.

## 3. Geräte
- 1360 hell/dunkel, 390 dunkel, EN 1360 dunkel: kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Keine Änderung nötig.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/matrix-abbildungen/index.ts` | `prod` mit „also“; Trenner „;“; betragsgrößter Eigenwert; Ergebnis-Sätze der Beispiele nur bei „Werte zeigen“ |
| `src/content/simulations/en/matrix-abbildungen.md` | Eigenwert-Sätze korrigiert |
| `src/content/simulations/de/matrix-abbildungen.md` | Ausprobieren 4 |

## 6. Für den Kern
– 

## 7. Rückfragen
- Der Fixpunkt der Iteration (Kreis) und die Eigenrichtung bleiben bei show=0 im Bild sichtbar, ohne Zahlen (Werkzeug).

## Prüfung
`npm run verify`: astro check 0/0/0, Tests grün, Build ok.
