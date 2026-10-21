# Prüfprotokoll: `diagramme` – Diagramme lesen und kritisch prüfen

Prüfer: Paket 2 · Datum: 20.10.2026 · Stand: Commit `52e6b06` (Zwischenstand, darauf dieser Durchgang) · Bogen: `scratchpad/pruefung/diagramme/diagramme.png` (außerhalb des Repos)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Kreis, 6 von 24: 6/24 = 1/4 = 25 %, Winkel 0,25 · 360° = 90°. Lieblingssport 8, 6, 4, 3, 3 (Summe 24): 120° + 90° + 60° + 45° + 45° = 360°; Prozent 33,3 / 25 / 16,7 / 12,5 / 12,5. Anzeige und Tabelle stimmen.
  2. 8 von 30: 8/30 = 26,7 %, Winkel 8/30 · 360° = 96° (neuer Test).
  3. Wahl 95, 100, 92 (Summe 287): exakt 119,16° / 125,44° / 115,40°. Abgerundet 119 + 125 + 115 = 359°, der übrige Grad geht an den größten Rest (Jonas) → 119°, 126°, 115°. Tabelle zeigt genau das, Summe 360°. Prozent 33,1 / 34,8 / 32,1 = 100,0.
  4. Abgeschnittene Achse ab 40, Werte 52 und 48: Säulenhöhen 12 und 8 → wirkt 12 : 8 = 1,5-fach, echt 52 : 48 ≈ 1,08-fach. Anzeige: „Jonas wirkt wie 67 % von Mia, echt sind es 92 %“ (8/12 = 0,667; 48/52 = 0,923) ✓. Standardfall ab 90: 5/10 = 50 % gegen 95 % ✓.
  5. Ein Wert 0 (8, 6, 4, 3, 0 → Summe 21): 8/21 = 38,1 % → 137,1°; 6/21 = 28,6 % → 102,9°; 4/21 = 19,0 % → 68,6°; 3/21 = 14,3 % → 51,4°. Größte Reste: 137 + 103 + 69 + 51 + 0 = 360 ✓. Der leere Sektor wird nicht beschriftet.
  6. Flächen-Piktogramm 8 : 4: Höhe 2-fach, Fläche 2 · 2 = 4-fach ✓. Summe-≠-100-%-Plakat: durch 20 statt 24 → 40 + 30 + 20 + 15 + 15 = 120 % ✓.
- **Sonderfälle:**
  - Alle Werte 0: Modell liefert überall 0 (keine Division durch 0). Anzeige vorher widersprüchlich: Ergebnis „0 Kinder = 100 % = 360°“, leerer Kreis ohne Erklärung; in der Summen-Täuschung „ergeben zusammen 0 % … durch 1 statt durch 0 geteilt“. → korrigiert (Hinweis „Alle Werte sind 0 …“, Ergebnis „0 Kinder – keine Anteile“, Summen-Täuschung ohne Unsinnstext).
  - Flächen-Piktogramm, wenn der kleinste Wert 0 ist: Text rechnete mit `max(1, 0)` und behauptete z. B. „Fußball ist 8-mal so hoch wie Reiten, Fläche 64-mal“ (Reiten hat 0, also gar keine Figur). → korrigiert: Vergleich mit dem kleinsten Wert über 0 (Text, Meter, Ergebnis).
  - Abgeschnittene Achse mit einem Wert 0: `effectiveCut` setzt den Beginn auf 0, keine Täuschung – sinnvoll.
  - Temperaturen als Kreis/Streifen: Hinweis „Passt hier nicht: … keine Teile eines Ganzen“ ✓. Sport als Linie: Hinweis „kein Dazwischen – die Linie täuscht einen Verlauf vor“ ✓.
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** Dezimalkomma über `fmt`, Einheiten min/°C, Achsentitel „Anzahl der Kinder“, „Zeit in min“, „Temperatur in °C“. Kreis-Beschriftung rundet einzeln (z. B. 3 · 33,3 % = 99,9 %), die Ergebnistabelle nach dem Verfahren der größten Reste auf genau 100 % und 360°. Im Lernmaterial ist die Rundungsdifferenz erwähnt (jetzt mit Beispiel).
- **Begriffe wie im Unterricht:** Säulen-, Balken-, Linien-, Streifen-, Kreisdiagramm, Piktogramm, Strichliste, Mittelpunktswinkel, Anteil, Grundwert ✓.
- **Neue/ergänzte Tests:** 6 neue Tests in `tests/diagramme.test.ts`: 8 von 30 → 96°; Wahl 287 → 119°/126°/115° und Prozent mit Summe 100; Achse ab 40 bei 52/48 (1,5- statt 1,08-fach); ein Wert 0; alle Werte 0; `minPositiveIndex`.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** DE 1–6 alle richtig (4/24 ≈ 16,7 %; 120°/45°, Summe 360°; Samstag 120 min, Do→Sa +60 min; 50 % gegen 95 %; Fläche 4-fach, Kinder 2-fach; 120 %, richtig 33,3/25/16,7/12,5/12,5 %).
- **„Beispiel laden“ geklickt:** alle 6 Beispiele und alle 7 „Ausprobieren“-Links sowie alle Aufgaben- und Lösungslinks geladen und angesehen – keine Auffälligkeiten, keine Konsolenfehler.
- **Texte vereinfacht/korrigiert:**
  - EN war deutlich kürzer als DE (3 statt 6 Aufgaben, 5 statt 7 Versuche, fehlende Rundungs- und Unterrichtshinweise). EN jetzt inhaltlich gleich zu DE; Meter-Bezeichnungen wie in der Simulation („looks“/„real“).
  - DE/EN: Achsenbruch (Zickzacklinie) als Kennzeichnung einer nicht bei 0 beginnenden Achse ergänzt; Rundungsdifferenz mit Beispiel (3 · 33,3 % = 99,9 %).

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig, Infokarte neben bzw. unter dem Diagramm, Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (JSON), keine Überlappungen gesehen. Kreis mit leerem Sektor: keine Beschriftung für 0 (keine Überlappung).
- **Touch (Ziehen) und Maus:** Säulen, Balken und Linienpunkte ziehbar (Hinweis im Panel); Antippen liest ab.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge laut JSON regulär (Kopfleiste → Simulation); alle Bedienelemente haben einen Namen.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** vorher nur der allgemeine Name der Zeichenfläche. → korrigiert: Beschreibung mit Diagrammart, Titel und allen Werten, im Täuschungsmodus mit Name der Täuschung; im Detektiv-Modus nur „Detektiv-Fall n“ (verrät die Lösung nicht).
- **Farben:** nur aus `ctx.theme`; Täuschung/ehrlich zusätzlich mit Text („Täuschung“, „ehrlich dargestellt“, „im Bild“/„echt“) unterschieden, nicht allein über Rot/Grün.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/diagramme/index.ts` | Hinweis bei Summe 0 (Darstellen); Ergebnis „Summe“ ohne „= 100 % = 360°“ bei Summe 0; Summen-Täuschung bei Summe 0 ohne Unsinnstext/-ergebnis; Flächen-Piktogramm vergleicht mit dem kleinsten Wert über 0 (Text, Meter, Ergebnis); Beschreibung der Zeichenfläche (aria-label); ungenutzte Variable entfernt |
| `src/simulations/mathematik/diagramme/model.ts` | `minPositiveIndex()` ergänzt |
| `tests/diagramme.test.ts` | 6 Tests (Prüfwerte, Sonderfälle 0) |
| `src/content/simulations/de/diagramme.md` | Achsenbruch, Rundungsbeispiel |
| `src/content/simulations/en/diagramme.md` | auf DE-Umfang gebracht (alle 6 Aufgaben, 7 Versuche, Unterrichtsideen) |

## 6. Für den Kern (nicht selbst ändern)
- Keine Pflichtpunkte. Anregung: Eine Kern-Funktion für eine dynamische Beschreibung der Zeichenfläche (statt `surface.canvas.setAttribute('aria-label', …)` in jeder Simulation) wäre einheitlicher.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Kreisbeschriftung im Diagramm rundet jede Angabe einzeln (Summe kann 99,9 % sein), die Ergebnistabelle nach größten Resten (Summe genau 100 %). Das ist so gewollt und im Text erklärt; bei 1, 1, 1 steht im Bild 33,3 %, in der Tabelle einmal 33,4 %. Belassen.
- Die Kategorie-Achse hat keinen eigenen Achsentitel (z. B. „Sportart“, „Tag“); die Kategorien sind beschriftet und der Diagrammtitel nennt den Inhalt. Belassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2935/2935 grün (126 Dateien), Build ok.
