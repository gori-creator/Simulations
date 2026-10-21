# Prüfprotokoll: `brueche-rechnen` – Brüche multiplizieren und dividieren am Rechteckmodell

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `b412aa0` (Basis), Korrekturen ab `87b0eb7` · Bogen: `/tmp/claude-0/-home-user-Simulations/8f85f9ae-3f3f-5aef-94a3-e731ae416460/scratchpad/pruefung/brueche-rechnen/brueche-rechnen.png`

## Ergebnis
korrigiert (Texte und Anzeigen in der Simulation, Lernmaterial DE/EN, Tests ergänzt); Rechenlogik war fehlerfrei

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung, jeweils geladen und mit der Anzeige verglichen):**
  1. 2/3 · 3/4: Zähler · Zähler = 2 · 3 = 6, Nenner · Nenner = 3 · 4 = 12 → 6/12; ggT(6, 12) = 6 → 1/2. Rechteck: 12 Felder je Ganzes, 6 lila. Anzeige „2/3 · 3/4 = (2·3)/(3·4) = 6/12 = 1/2“, „2/3 von 3/4 ist 1/2“ ✓.
  2. 3/4 : 1/8: gleichnamig 6/8 : 1/8 = 6 : 1 = 6; Kehrwert 3/4 · 8 = 24/4 = 6. Anzeige „1/8 passt genau 6-mal in 3/4“, 6 Streifen ✓.
  3. 2/3 : 4/5: 2/3 · 5/4 = 10/12 = 5/6 (< 1); gleichnamig 10/15 : 12/15 = 10 : 12. Anzeige „4/5 passt nicht ganz in 2/3 – nur 5/6 des Streifens“ ✓.
  4. 3 : 1/4: 3 · 4 = 12; gleichnamig 12/4 : 1/4 = 12 : 1 ✓.
  5. 3/4 : 2/3 (Ergebnis > 1 mit Rest): 9/12 : 8/12 = 9 : 8 = 9/8 = 1 1/8; der Streifen passt 1-mal, Rest 1/8 des Streifens ✓.
  6. Kürzen vor dem Multiplizieren: 4/9 · 3/8 → 4 und 8 durch 4, 3 und 9 durch 3 → (1·1)/(3·2) = 1/6 ✓; 5/12 · 9/10 → (1·3)/(4·2) = 3/8 ✓. Ergebnis immer vollständig gekürzt (Test über den ganzen Reglerbereich).
- **Sonderfälle:**
  - Division durch 0: Zähler-Regler beginnen bei 1; Link `?mode=durch&z2=0` wird vom Kern auf z2 = 1 gesetzt → Divisor nie 0 ✓.
  - Ganze Zahlen (Nenner 1): 2 · 3 zeigte im Ergebnisfeld „6/1 = 6“ und in der Rechenzeile doppelt „= 6 = 6“ → behoben.
  - Ergebnis ganzzahlig nach Kürzen (3/4 : 1/8): Kehrwert-Zeile übersprang den Zwischenschritt 24/4 → jetzt „(3·8)/(4·1) = 24/4 = 6“, ebenso im Ergebnisfeld „Quotient“.
  - Reglergrenzen: Zähler 1…36, Nenner 1…12, je Bruch höchstens 3 Ganze (Eingabe wird begrenzt) ✓. 3 : 1/12 = 36 Streifen ✓.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** nur ganze Zahlen und Brüche, exakt gerechnet; keine negativen Werte. Divisionszeichen DE „:“, EN „÷“ ✓.
- **Begriffe wie im Unterricht:** Zähler, Nenner, Kehrwert, Divisor, gleichnamig, über Kreuz kürzen, „von“ ✓. Korrigiert: „1/8 sind 1 Achtel“ → „1/8 ist 1 Achtel“; „1 Halbe“ → „1 Halbes“; „Sechszehntel“ → „Sechzehntel“ (Code-Pfad); „20-tel“ → „20stel“; EN „1 eighths“ → „1 eighth“, „21ths“ → „21sts“, „fits 1 times“ → „fits once“; „1 Felder“ → „1 Feld“ (Bild und Ergebnisfeld).
- **Neue/ergänzte Tests:** `tests/brueche-rechnen.test.ts` um 4 Tests ergänzt (jetzt 13): 3/4 : 1/8 = 6, 2/3 : 4/5 = 10/12 = 5/6, 3 : 1/4 = 12, 9/8 = 1 1/8, Kürzen vor dem Multiplizieren liefert über den ganzen Reglerbereich ein vollständig gekürztes Ergebnis, Kehrwert vom Kehrwert / Bruch · Kehrwert = 1.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 6/15 = 2/5, 12/20 = 3/5 ✓; A2 3/8, 2/3 ✓; A3 1/2 ✓; A4 3 Portionen, 2 ✓; A5 5/4 = 1 1/4 auf beiden Wegen ✓; A7 (Knobel) 3/2 ✓. Neu A6 (3/4 : 1/8 = 6, 2/3 : 4/5 = 5/6, 3 : 1/4 = 12).
- **„Beispiel laden“ / Links:** alle 6 Beispiele und alle 22 Links im DE-Lernmaterial geladen; Anzeigen stimmen mit den Lösungen überein; `_hide` blendet die Ergebnisse aus.
- **Texte korrigiert:**
  - DE: Aufgabe 6 „Wie oft passt es hinein?“ neu (bisherige 6 → 7); Hinweis, dass eine Division durch 0 nicht vorkommt.
  - EN war stark gekürzt (3 von 6 Aufgaben, 4 von 9 Ausprobier-Punkten, Stolpersteine nur in einem Satz) → inhaltlich an DE angeglichen.
  - EN-Karte im Bild: Zeilenbeschriftung „COMMON DENOMINATOR“ überlappte die Rechnung (feste Breite 130 px) → Breite nach der längsten Beschriftung.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden; Handy: Rechnung oben, Bild darunter; ab 600 px Bild links, Karte rechts. Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine (nach der EN-Korrektur der Divisionskarte). Lange Rechenzeilen werden verkleinert.
- **Touch (Ziehen) und Maus:** Maus: Griff des ersten Bruchs von 2/3 auf 3/3, Griff des zweiten Bruchs von 3/4 auf 4/4 gezogen → Anzeige 12/12 = 1 ✓. Finger (CDP-Touch): Griff des ersten Bruchs auf 3/3 gezogen ✓. Griffe rasten in 1/b bzw. 1/d ein.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Tweens springen über den Kern sofort ans Ende, Gleiten der Werte abgeschaltet).
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** unauffällig; alles auch über Regler und Knöpfe bedienbar (Ziehen ist nur eine Abkürzung).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Alt-Text allgemein („Rechteckmodell … bzw. Messen mit Streifen …“), die konkrete Rechnung steht in den Ergebnisfeldern als Text.
- **Farben:** nur `ctx.theme.series[0/3/4]` (blau/orange/lila) plus Weiß für Linien und Nummern auf farbigen Flächen; kein Rot/Grün-Gegensatz. Rest-Streifen zusätzlich schraffiert und gestrichelt, Produkt zusätzlich umrandet und nummeriert.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/brueche-rechnen/index.ts` | Namen der Bruchteile nach Anzahl (Ganzes/Halbes, EN Einzahl), „Sechzehntel“, „20stel“/„21sts“; „ist“ statt „sind“ bei 1 Stück; EN „fits once“; „1 Feld“/„1 cell“ in Bild und Ergebnisfeld; doppeltes „= 6 = 6“ bzw. „6/1“ bei ganzen Zahlen; Zwischenschritt 24/4 in Kehrwert-Zeile und Quotient; Breite der Zeilenbeschriftung der Divisionskarte (EN) |
| `src/content/simulations/de/brueche-rechnen.md` | Aufgabe 6 neu (3/4 : 1/8, 2/3 : 4/5, 3 : 1/4), Hinweis Division durch 0 |
| `src/content/simulations/en/brueche-rechnen.md` | inhaltlich an DE angeglichen (alle Aufgaben, Ausprobieren, Ideen) |
| `tests/brueche-rechnen.test.ts` | 4 Tests ergänzt (13 statt 9) |

## 6. Für den Kern (nicht selbst ändern)
- `dragHint` ist nur `boolean`: Der Tipp „Die markierten Punkte lassen sich … ziehen“ steht auch im Modus „Dividieren“, in dem es nichts zu ziehen gibt. Vorschlag: `dragHint` auch als Funktion der Parameter zulassen (z. B. `(v) => v.mode === 'mal'`).
- Prüfbogen-Werkzeug: Die Tab-Reihenfolge in der JSON endet nach 12 Einträgen im Seitenkopf (wie bei `bruchteile`).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2920/2920 grün (brueche-rechnen 13/13), Build ok.
