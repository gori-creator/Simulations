# Prüfprotokoll: `kreiszahl-pi` – Kreisumfang, Kreisfläche und die Zahl π

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-pi.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (fachlich richtig; Texte, englische Formelzeichen und Grafikbeschreibung verbessert)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Standard d = 2 cm: U = π · 2 cm ≈ 6,283 cm ✓ (Anzeige „U = π · 2 cm ≈ 6,283 cm“, EN „C = π · 2 cm ≈ 6.283 cm“).
  2. Sechseck: untere Schranke 6 · sin 30° = 3, obere 6 · tan 30° = 2√3 ≈ 3,4641 ✓ (Anzeige „3 < π < 3,4641“). Selbst nachgerechnet.
  3. 96-Eck: 96 · sin(1,875°) ≈ 3,14103 und 96 · tan(1,875°) ≈ 3,14271 ✓, passt zu Archimedes' 3 10/71 ≈ 3,1408 < π < 3 1/7 ≈ 3,1429.
  4. Aufgabe 1: π · 70 cm ≈ 219,9 cm; 1000 m : 2,199 m ≈ 454,7 → etwa 455 Umdrehungen ✓ (aus der Befundliste, selbst bestätigt).
- **Sonderfälle:** Reglergrenzen d = 1 und 4 cm, m = 3 bis 96; „Eckenzahl verdoppeln“ ist über 48 gesperrt ✓.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** über `fmt.num`, Nullen werden nicht angehängt („3 < π“) ✓.
- **Begriffe:** EN nutzt jetzt durchgehend C (circumference) statt U, auch in den Ergebnissen (vorher „U : d = π“ im Englischen).
- **Neue/ergänzte Tests:** keine (keine neue Rechenlogik).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 (siehe oben), A2 (706,9 cm² gegen 628,3 cm²) ✓, A3 ✓, A4 (6r = 3d) ✓.
- **„Beispiel laden“:** Sechseck, 48 Sektoren und „Abrollen“ (EN) angesehen, Anzeigen wie beschrieben.
- **Texte korrigiert:** DE A1 mit Einheiten und Zwischenwert 454,7; A4 „3 < π < 3,4641 (die Simulation zeigt diese Werte)“ und schärfere Begründung (Kreisbogen länger als Sechseckseite); Verweis auf `docs/BILDER.md` aus dem Lernmaterial gestrichen. EN: C statt U, A1-Lösung mit Rechenweg. Fehlende EN-Aufgaben nicht nachübersetzt (Projektregel).

## 3. Geräte
- **1360 hell/dunkel, 390 hell:** vollständig, keine Überlappungen, kein Überlauf, keine Konsolenfehler.
- **Touch/Maus:** keine Ziehpunkte, Bedienung über Knöpfe.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** unverändert (Tweens springen ans Ende).
- **Beschreibung der Grafik:** um den Archimedes-Modus ergänzt („… oder der zwischen zwei Vielecke eingeschlossen wird“ / „… or which is trapped between two polygons“).
- **Farben:** nur `ctx.theme` ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/kreiszahl-pi/index.ts` | EN-Ergebnisse mit C; Grafikbeschreibung DE/EN um Archimedes ergänzt |
| `src/content/simulations/de/kreiszahl-pi.md` | A1 Einheiten/Rundung, A4 Schranke 3,4641 und Begründung, Bilder-Verweis gestrichen |
| `src/content/simulations/en/kreiszahl-pi.md` | C statt U, A1 mit Rechenweg |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.
