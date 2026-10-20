# Prüfprotokoll: `zahlengerade` – Ganze Zahlen an der Zahlengeraden addieren und subtrahieren

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `cb83d45` (vor den Korrekturen) · Bogen: `scratchpad/pruefung/zahlengerade/zahlengerade.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. −4 + 7: Start bei −4, Blick nach rechts, 7 Schritte vorwärts → −4 + 7 = 3 ✓ (Anzeige „−4 + 7 = 3“).
  2. 2 − 9 = 2 + (−9): umdrehen, 9 Schritte vorwärts nach links → −7 ✓; Umformung „= 2 + (−9)“ ✓.
  3. −6 − (−2) = −6 + 2 = −4 ✓ (Pfeil +2 nach rechts, Anzeige „−6 − (−2) = −4“).
  4. −3 − (−5) = −3 + 5 = 2 ✓: gestrichelter Pfeil (−5) nach links, klappt beim Umdrehen zu +5 nach rechts, Frosch landet bei 2 (Bild geprüft).
  5. 5 + (−8) = 5 − 8 = −3 ✓ (Klammer um −8, Umformung „= 5 − 8“).
  6. Grenze −20 − 20 = −20 + (−20) = −40 ✓, Ausschnitt −45 … 25, Betrag 40, Gegenzahl von −20 ist 20 ✓.
  7. Ziehen: Startpunkt bei −3 − (−5) auf 1 gezogen → 1 − (−5) = 6 ✓; Pfeilspitze auf −5 gezogen → b = −3 − (−5) = 2, also −3 − 2 = −5 ✓.
- **Pfeil-/Laufmodell:** Änderung = b bei „+“, Gegenzahl von b bei „−“; positive Änderung nach rechts bzw. oben, negative nach links bzw. unten ✓. Rechenzeichen = Blickrichtung (− umdrehen), Vorzeichen = vorwärts/rückwärts ✓.
- **Sonderfälle:** 0 + 0 (stehen bleiben, Betrag/Gegenzahl 0), b = 0 bei „−“ (Umformung „a + 0“), Reglergrenzen ±20 (Ergebnis ±40), Meer: Pinguin bei −40 m. Keine Division.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** nur ganze Zahlen; überall echtes `−`, negative Zahlen hinter Rechenzeichen in Klammern; Thermometer „−5 °C“, Meer „8 m unter dem Meeresspiegel“ bzw. Schild „−8 m“, Konto „Kontostand −15 €“ (EN „−€15“) ✓.
- **Begriffe wie im Unterricht:** Gegenzahl, Betrag, Rechenzeichen/Vorzeichen, Guthaben/Schulden, Gefrierpunkt, Meeresspiegel ✓. Temperaturänderung jetzt „Es wird um 9 °C kälter“ (wie in Aufgabe 2 „um 10 °C wärmer“).
- **Neue/ergänzte Tests:** Prüfwerte (−4 + 7, 2 − 9, −6 − (−2), −3 − (−5), 5 + (−8)), Richtung im Pfeilmodell, echtes Minus und Klammern in Termen, Sachsituationen (−2 °C DE/EN, 120 m unter dem Meeresspiegel, Meereshöhe 0, Konto −15 € / −€15, „nichts gebucht“).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** 1 a) −7 + 12 = 5, b) 3 − 9 = −6, c) −4 − (−6) = 2, d) −2 + (−5) = −7; 2) 4 − (−6) = 10; 3) 7 − 15 = −8 (8 m unter dem Meeresspiegel); 4) −12 − 9 = −21, −21 + 30 = 9; 5) 5 − (−3) = 8 = 5 + 3; 6) ±7; −2 … 2 ✓.
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle Links aus „Ausprobieren“ und den Lösungen geladen (inkl. `show=0` vor/während/nach „Los!“, `_hide=1`, `abs=1`) – passend zum Text, keine Auffälligkeiten.
- **Texte:** EN-Lernmaterial war stark gekürzt (ohne Pfeilmodell-Absatz, nur 4 Ausprobieren-Punkte, 3 statt 6 Aufgaben, kurze Lehrkräfte-Hinweise ohne Lehrplanbezug) → vollständig an DE angeglichen. DE unverändert.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** Gleichung, Zahlengerade, Schrittschilder vollständig; schmal werden die Schritte untereinander gesetzt. Zusätzlich Thermometer, Meer und Konto bei 400 px (hell/dunkel) geprüft: Szene oben, Text darunter, nichts abgeschnitten. Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** keine. Beim Meer mit sehr tiefem Ausschnitt (−45 … 0) liegt der Eisberggipfel außerhalb des Bildes – gewollt (Ausschnitt).
- **Touch (Ziehen) und Maus:** Startpunkt und Pfeilspitze per Maus gezogen (siehe oben), Ausschnitt bleibt beim Ziehen fest. Touch über Pointer-Events des Kerns.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓; „Los!“ springt sofort ans Ziel (`finishWalk`), Ausschnitt- und Pop-Tweens enden sofort.
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** alle Werte über Regler/Auswahl einstellbar, Ziehen ist nur Zusatz.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine unbenannten Bedienelemente. Die Erklärung beim Kontostand nannte nur das Laufmodell; die Sachsituation (Schulden/Guthaben) stand nur auf der Zeichenfläche → jetzt auch in der Ausgabe „Erklärung“. Alt-Text statisch (nennt immer Zahlengerade und Figur).
- **Farben:** nur aus `ctx.theme` (Fotos/Eis/Wasser fest, wie in anderen Szenen). Schulden/Guthaben (Rosa/Grün) sind zusätzlich beschriftet; Start/Ergebnis zusätzlich als Zahlen-Schilder.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/zahlengerade/index.ts` | Ausgabe „Erklärung“ beim Kontostand mit Sachsituation (Schulden/Guthaben, Buchung) vor den Laufschritten |
| `src/simulations/mathematik/zahlengerade/model.ts` | Temperaturtext „Es wird um … °C wärmer/kälter.“ |
| `tests/zahlengerade.test.ts` | Prüfwerte, Pfeilrichtung, Minus/Klammern, Sachsituationen mit Vorzeichen und Einheiten |
| `src/content/simulations/en/zahlengerade.md` | an DE angeglichen (Pfeilmodell, 8 Ausprobieren, 6 Aufgaben, Lehrkräfte-Hinweise) |

## 6. Für den Kern (nicht selbst ändern)
- Beschreibung der Zeichenfläche (`aria-label`) nur beim Start setzbar; zur Laufzeit wäre z. B. „Thermometer“/„Meeresspiegel“/„Kontostand“ und die aktuelle Rechnung hilfreich (wie bei `winkel-messen`).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- keine

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2883/2883 grün (125 Dateien), Build ok.
