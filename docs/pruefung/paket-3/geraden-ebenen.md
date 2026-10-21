# Prüfprotokoll: `geraden-ebenen` – Geraden und Ebenen im Raum

Prüfer: Paket 3 (Befunde Abschnitt B, Paket 5) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: eigener Ordner im Scratchpad (`shots/geraden-ebenen-*.png`, nicht committet)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-5.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert (nur Lernmaterial)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. Startzustand g: x = (1 | 2 | 3) + t · (2 | −1 | 1), t = 1,5: X = (1 + 3 | 2 − 1,5 | 3 + 1,5) = (4 | 0,5 | 4,5) (Karte) ✓.
  2. Spurpunkt S₁₂: 3 + t = 0 ⇒ t = −3 ⇒ (1 − 6 | 2 + 3 | 0) = (−5 | 5 | 0) ✓; S₂₃: 1 + 2t = 0 ⇒ t = −0,5 ⇒ (0 | 2,5 | 2,5) ✓.
- **Neue/ergänzte Tests:** keine (keine Rechenlogik geändert).

## 2. Aufgaben und Texte (DE und EN)
- **Befund umgesetzt:** „Ist eine Komponente von u null, verläuft g parallel zur zugehörigen Koordinatenebene – dort gibt es keinen Spurpunkt.“ war ungenau (welche Ebene „zugehörig“ ist, blieb offen; g kann auch in der Ebene liegen) ⇒ DE „Ist z. B. u₃ = 0, verläuft g parallel zur x₁x₂-Ebene oder liegt in ihr. Dann gibt es mit dieser Ebene keinen Spurpunkt (oder g liegt ganz in ihr).“, EN entsprechend.
- **Aufgabenlinks geprüft:** alle 5 DE- und 2 EN-Aufgabenlinks: Spurpunkte, Ortsvektor X, Normalenvektor und Koordinatenform verdeckt ✓.

## 3. Geräte
- **1360 hell, 1360 dunkel, 390, EN 1360:** kein Überlauf, keine Konsolenfehler, keine Überlappungen.

## 4. Barrierefreiheit
- Keine Änderung.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/content/simulations/de/geraden-ebenen.md` | Satz zu u₃ = 0 präzisiert |
| `src/content/simulations/en/geraden-ebenen.md` | ebenso |

## 6. Für den Kern (nicht selbst ändern)
- keine

## 7. Rückfragen
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3380/3380 grün (148 Dateien), Build ok.
