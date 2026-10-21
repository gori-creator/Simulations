# Prüfprotokoll: `lage-abstaende` – Lagebeziehungen und Abstände im Raum

Prüfer: Paket 1 (Befunde B) · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` · Bogen: `scratchpad/shots/g-*.png` (außerhalb des Repos)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-3.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert („+ −0,5 · t“ im Ergebnis; Hinweis auf weit entfernte Schnittpunkte in Ausprobieren 4 und 5).

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. g: (0|0|1) + t · (4|0|−0,5), E: x₃ = 0: 1 − 0,5t = 0 → t = 2, D(8|0|0); sin φ = 0,5/(1 · √16,25) ≈ 0,124 → φ ≈ 7,1° ✓. Ergebnis jetzt „1 − 0,5 · t = 0“ (vorher „1 + −0,5 · t“), wie in der Karte.
  2. Ausprobieren 4: 1 + 0,5s = 0 → s = −2, t = −2, S(−12|0|0); cos φ = 36/(6 · √36,25) ≈ 0,9965 → φ ≈ 4,8° ✓.
  3. Ausprobieren 5: 1 + 0,5t = 0 → t = −2, D(−8|0|0) ✓.
  4. Start (windschief): d = |4|/3 ≈ 1,33 ✓ (Ergebnis).
- **Neue/ergänzte Tests:** keine (nur Anzeige).

## 2. Aufgaben und Texte (DE und EN)
- **Ausprobieren 4/5:** ergänzt „Der Schnittpunkt liegt außerhalb der gezeichneten Achsen – lies ihn in den Ergebnissen ab.“ bzw. sinngemäß für D.
- **„Beispiel laden“ geklickt:** Start, Gerade – Ebene mit n · u < 0, Ausprobieren 4 und 5 ✓.

## 3. Geräte
- **1360 px hell/dunkel, 390 px:** in Ordnung, kein Überlauf, keine Konsolenfehler.

## 4. Barrierefreiheit
- Unverändert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/lage-abstaende/index.ts` | Ergebnis „Rechnung“ (Gerade – Ebene) mit richtigem Vorzeichen (± \|n · u\|) |
| `src/content/simulations/de/lage-abstaende.md` | Ausprobieren 4 und 5: Hinweis auf das Ablesen in den Ergebnissen |

## 6. Für den Kern (nicht selbst ändern)
–

## 7. Entscheidungen
- **„außerhalb der gezeichneten Achsen“ statt „außerhalb des Bildes“:** S(−12|0|0) und D(−8|0|0) werden bei 1360 und 390 px noch als Punkt mit Beschriftung gezeichnet, liegen aber jenseits der Achsenskala. Die Formulierung des Befunds trifft so nicht zu; der Hinweis zum Ablesen in den Ergebnissen bleibt.
- **Kein Helfer:** Das Vorzeichen wird wie in der Karte (Z. ~1294) direkt gesetzt; einen Helfer `dotTerms`/`signed` gibt es in dieser Simulation nicht.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3371/3371 grün (148 Dateien), Build ok.
