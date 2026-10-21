# Prüfprotokoll: `prisma-zylinder` – Prisma und Zylinder: Oberfläche und Volumen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-pz.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (fachlich richtig; Rundungszeichen, Hilfetext, englische Formelzeichen, Texte und eine abgeschnittene Zeile auf dem Handy verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Dreiecksprisma g = 4, h_g = 3, h = 5: G = ½ · 4 · 3 = 6 cm², Schenkel √(2² + 3²) = √13 ≈ 3,606 cm, u ≈ 4 + 7,211 ≈ 11,21 cm, V = 30 cm³, O = 12 + 11,21 · 5 ≈ 68,06 cm² ✓ (Anzeige „u ≈ 4 cm + 2 · 3,61 cm ≈ 11,21 cm“, „≈ 68,06 cm²“). Selbst nachgerechnet.
  2. Sechseckprisma r = 2, h = 4: ρ = √3 ≈ 1,732, G = 6 · ½ · 2 · √3 ≈ 10,39 cm², V ≈ 41,57 cm³, u = 12 cm, M = 48 cm², O ≈ 68,78 cm² ✓.
  3. Vergleich: Anteil n · sin(360°/n) : (2π); n = 6: 82,70 %, n = 25: 98,95 %, n = 26: 99,03 % ✓ (Aufgabe 5 / EN Task 3).
- **„3,0 Schichten“:** trifft nicht zu. `fmt.num(3, 1)` ergibt „3“, die Anzeige lautet „3 Schichten“ bzw. bei h = 4,5 „4,5 Schichten“. Nicht geändert.
- **Rundungszeichen:** Umfang des Dreiecks begann mit „u = 4 cm + 2 · 3,61 cm“, obwohl 3,61 gerundet ist. Jetzt „u ≈ …“ (Anzeige und DE Aufgabe 1).
- **Neue/ergänzte Tests:** keine (keine neue Rechenlogik; Prüfwerte stehen schon in `tests/prisma-zylinder.test.ts`).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 30 cm³ / ≈ 68 cm² ✓, A2 16π ≈ 50,27 cm³ / 24π ≈ 75,40 cm² ✓, A3 M = 48 cm² ✓, A4 M ≈ 241,9 cm², V ≈ 423,3 cm³ ✓, A5 n = 26 ✓.
- **„Aufgabe laden“:** EN Task 3 (`?n=6&ghost=1&_hide=1`) neu und geprüft, Ergebnisse verdeckt.
- **Texte korrigiert:** DE Einleitung (Grundfläche und Deckfläche, deckungsgleich); A3 Begründung über gleichschenklige Teildreiecke und Basiswinkel (180° − 60°) : 2 = 60°; Stolperstein „Man erwartet … Tatsächlich wird es viermal so groß.“; Bedienweg „Anzeige → Rechnung im Bild“ (in Links `calc=0`). EN: Task 3 neu formuliert mit Ladelink, M und O mit Erklärung von u und G.

## 3. Geräte
- **1360 hell (Dreieck), 1360 dunkel (Stapeln), 390 hell/dunkel (Netz), EN 1360:** vollständig, kein Überlauf, keine Konsolenfehler.
- **Behoben:** Mit den längeren EN-Zeilen („Lateral area: M = u · h (u = perimeter of the base) …“) lief die Rechnung im Bild auf 390 px unter die Zoom-Knöpfe. Auf schmaler Bühne (< 560 px) stehen jetzt Kurzformen ohne Klammererklärung („Lateral: M = u · h …“, „Surface area: O = 2 · G + M …“); die Erklärung steht in den Ergebnissen und im Hilfetext. Neuer Screenshot geprüft.

## 4. Barrierefreiheit
- **Hilfetext zu r:** ergänzt um „In der Rechnung ist s die Seitenlänge und ρ der Inkreisradius (Höhe der Teildreiecke).“ / EN entsprechend.
- **Farben:** nur `ctx.theme` ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/prisma-zylinder/index.ts` | Hilfetext r; „u ≈“ beim Dreieck; EN-Bildtexte mit Erklärung von u und G, Kurzformen für schmale Bühne |
| `src/content/simulations/de/prisma-zylinder.md` | Einleitung, A1 „≈“, A3 Begründung, Bedienweg calc, Stolperstein |
| `src/content/simulations/en/prisma-zylinder.md` | Task 3 mit Ladelink, M/O mit Erklärung |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
