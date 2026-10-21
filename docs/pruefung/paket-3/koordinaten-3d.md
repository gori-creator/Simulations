# Prüfprotokoll: `koordinaten-3d` – Punkte und Körper im räumlichen Koordinatensystem

Prüfer: Paket 3, Befunde B (Paket 4) · Datum: 21.10.2026 · Stand: Commit `0f21aca` (Ausgangsstand) · Bilder: simshot 1360 hell/dunkel, 390 (hell/dunkel), EN, alle Aufgabenlinks

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-4.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung.

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet:**
  1. P(3 | 4 | 2), Q(−1 | 1 | −2): Δ = (−4, −3, −4), 16 + 9 + 16 = 41, √41 = 6,403 ⇒ „|PQ| = √41 ≈ 6,40“ ✓.
  2. Quader 4 × 3 × 2: AC = √(16 + 9) = 5 ⇒ jetzt „√(4² + 3²) = 5“; AG = √29 = 5,385 ⇒ „≈ 5,39“; V = 24 ✓.
  3. P(2 | 2 | 1) zum Ursprung: √9 = 3 ⇒ jetzt „= 3“ statt „≈ 3“ ✓. Oktant von (2 | −3 | 2): Vorzeichen (+ − +) ⇒ IV ✓.
- **„=“/„≈“ (behoben):** Abstände, Flächen- und Raumdiagonale standen immer mit „≈“, auch wenn exakt (√25 = 5). Jetzt „=“, wenn der auf 2 Stellen gezeigte Wert exakt ist, sonst „≈“ mit Endnull („≈ 6,40“ statt „≈ 6,4“) – an allen 10 Stellen (Bild, Tafel, Ergebnisse).
- **Neue/ergänzte Tests:** keine (nur Anzeige; Rechenlogik in `model.ts` unverändert).

## 2. Aufgaben und Texte (DE und EN)
- **Oktanten-Tafel im Aufgabenmodus (Fehler, behoben):** Bei `show=0` (DE Aufgabe 5, EN Task 4) zeigte die Tafel „P liegt in IV“, die Vorzeichen „+ | − | +“, die Zelle IV hervorgehoben und im Bild den Oktanten als Kasten. Jetzt: „P liegt im Oktanten ?“, Vorzeichen „? | ? | ?“, keine Zelle und kein Kasten hervorgehoben, Oktantnamen alle gleich. Mit Bild (1360 hell, 390 dunkel) geprüft.
- **Texte:** „P liegt in IV“ ⇒ „P liegt im Oktanten IV“ / „P is in octant IV“; DE Aufgabe 2 ⇒ „Ein achsenparalleler Quader ABCDEFGH hat die Ecken A(0 | 0 | 0) und G(4 | 3 | 2). …“.
- **Aufgabenlinks:** alle 4 DE und 4 EN geladen, Ergebnisse verdeckt ✓.

## 3. Geräte
- 1360 hell/dunkel, 390 hell/dunkel, EN: Tafel-Kopf „P liegt im Oktanten ?“ passt auch bei 390 px; kein Überlauf, keine Konsolenfehler. Hinweis: Kurz nach dem Laden des Quaders (600 ms) überlagern sich während der Einstiegsanimation die Beschriftungen; nach 4 s steht das Bild sauber.

## 4. Barrierefreiheit
- Keine Änderung in diesem Durchgang.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/koordinaten-3d/index.ts` | Oktanten-Tafel und -Bild beachten `show`; „im Oktanten“; „=“/„≈“ mit Endnull (`rel2`, `val2`) |
| `src/content/simulations/de/koordinaten-3d.md` | Aufgabe 2 präzisiert |

## 6. Für den Kern
- nichts

## 7. Rückfragen
- Die Ergebnisüberschrift heißt im Modus „Abstand“ weiter „Abstand vom Ursprung“, obwohl |PQ| gezeigt wird (eine Beschriftung je Schlüssel). Nicht geändert, da ein neuer Ergebnisschlüssel nötig wäre.

## Prüfung
`npm run verify`: astro check 0/0/0; Tests 3374/3376 – die zwei Fehlschläge sind Zeitüberschreitungen (5 s) in `tests/grenzverhalten.test.ts` auf dem ausgelasteten Rechner, unabhängig von diesem Durchgang (Datei und Simulation unverändert); alle Tests dieser Simulation grün; Build ok (396 Seiten).
