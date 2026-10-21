# Prüfprotokoll: `pythagoras` – Satz des Pythagoras

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-py.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (fachlich richtig; Texte und Grafikbeschreibung verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. 3-4-5: 9 + 16 = 25 = 5², Anzeige „a = 3, b = 4, c = 5“ und „a² + b² = 9 + 16 = 25 = c²“ ✓.
  2. Gleichschenklig a = b = 3: c = √18 ≈ 4,243, Anzeige „c ≈ 4,243“ und c² = 18 ✓. Selbst nachgerechnet.
  3. Aufgabe 1: √(2,25 + 4) = √6,25 = 2,5 cm ✓; EN Leiter √(25 − 1,96) = √23,04 = 4,8 m ✓; 7-24-25: 49 + 576 = 625 ✓, 5-6-8: 61 ≠ 64 ✓.
- **Rückfrage „c = 5,000“:** trifft nicht zu. `fmt.num` hängt keine Nullen an, die Anzeige lautet bereits „c = 5“ (bei nicht exaktem c „≈“ mit 3 Stellen). Nicht geändert.
- **Sonderfälle:** Reglergrenzen 1 und 6, flaches Dreieck 1,5/5 im Puzzle ✓.
- **Neue/ergänzte Tests:** keine (keine neue Rechenlogik).

## 2. Aufgaben und Texte (DE und EN)
- **Ziehbare Ecken geprüft:** Es gibt genau zwei, A (auf der x-Achse, Farbe von b) und B (auf der y-Achse, Farbe von a). Daher „Ziehe die beiden farbigen Eckpunkte …“.
- **Texte korrigiert:** DE Ausprobieren 1 („Beim 3-4-5-Dreieck geht das genau. Gilt a² + b² = c² auch beim gleichschenkligen Dreieck?“). EN: Satz mit Voraussetzung („In every right triangle …“), Umkehrung mit „right angle opposite c“, Ausprobieren 1 an DE angeglichen. Fehlende EN-Aufgaben nicht nachübersetzt.

## 3. Geräte
- **1360 hell, 1360 dunkel (Puzzle), 390 hell (gleichschenklig):** vollständig, keine Überlappungen, kein Überlauf, keine Konsolenfehler.
- **Touch/Maus:** Ziehpunkte über den Kern-Griff wie bisher.

## 4. Barrierefreiheit
- **Beschreibung der Grafik:** deckt jetzt beide Ansichten ab: „Rechtwinkliges Dreieck mit Quadraten über den drei Seiten oder Puzzle-Beweis mit vier Dreiecken im Quadrat mit der Seite a + b“ (EN entsprechend). Die Beschreibung wird beim Start einmal gesetzt, deshalb ein Satz für beide Ansichten.
- **Farben:** nur `ctx.theme`; Quadrate zusätzlich mit a², b², c² beschriftet ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/pythagoras/index.ts` | Grafikbeschreibung DE/EN für beide Ansichten |
| `src/content/simulations/de/pythagoras.md` | Ausprobieren 1 präzisiert |
| `src/content/simulations/en/pythagoras.md` | Satz und Umkehrung mit Voraussetzung, Ausprobieren 1 |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
