# Prüfprotokoll: `gleichungen-grafisch` – Gleichungen grafisch lösen: Schnittpunkte von Graphen

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `0ed8bd9` (Basis) · Bogen: `scratchpad/shots/sheet-gg.png` (nicht im Repo)

Fach/Aufgaben/Texte: externer Prüfer ohne GitHub (Befunde in `docs/pruefung/befunde-b/paket-1.md`), Umsetzung und Geräte/Barrierefreiheit: Projektleitung

## Ergebnis
korrigiert (Fehler in Aufgabe 4 und im Hinweis bei a = 0 behoben, Texte ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Intervallhalbierung x² = 3, h(x) = x² − 3, Start [1; 2]: h(1,5) < 0, h(1,75) = 0,0625 > 0, h(1,625) < 0, h(1,6875) < 0 → [1,6875; 1,75]; 1,6875 → 1,7, aber 1,75 → 1,8, also noch nicht sicher. h(1,71875) = 2,9541 − 3 < 0 → [1,71875; 1,75]; h(1,734375) = 3,0081 − 3 > 0 → [1,71875; 1,734375], beide Grenzen → 1,7 ✓. Mit dem Modell (`agreedDigits`) bestätigt: erst nach 6 Schritten 1 Stelle sicher; in der Simulation geladen, Anzeige „Sicher: x₂ ≈ 1,7“. Selbst nachgerechnet.
  2. x² = 2: zwei Stellen (1,41) laut Modell erst nach 11 Schritten bei [1,4140625; 1,41455078125] ✓, obwohl die Breite schon nach 7 Schritten 1/128 < 0,01 ist.
  3. f mit a = 0 (Parabel): −1 = 0,5x + 2 ⇒ x = −6 ✓; Hyperbel mit a = 0, d = 1, e = 1: 1 = 0,5x + 2 ⇒ x = −2 ≠ 1, liegt in D = ℝ \ {1} ✓.
  4. Aufgabe 3: 4/x = x + 3 ⇒ x² + 3x − 4 = (x + 4)(x − 1) = 0 ⇒ −4 und 1, beide ≠ 0 ✓.
- **Fehler (behoben):** Aufgabe 4 (DE) / Task 3 (EN) hörte nach 4 Schritten auf und behauptete, alle Zahlen in [1,6875; 1,75] runden auf 1,7. Jetzt mit Schritt 5 und 6.
- **Fehler (behoben):** Hinweis bei a = 0 lautete „kein Parabel/Hyperbel“. Jetzt „Der Graph ist keine Parabel / kein Betragsgraph, sondern eine Parallele zur x-Achse“. Bei der Hyperbel besteht die Lücke wirklich (`poleOf` gibt d auch bei a = 0 zurück, D = ℝ \ {d}), daher eigener Satz mit dem Wert: „… keine Hyperbel, sondern eine Parallele zur x-Achse mit Lücke bei x = 1“. EN analog („the graph is not a parabola but …“).
- **Neue/ergänzte Tests:** `tests/gleichungen-grafisch.test.ts`: „Lernmaterial: Intervallhalbierung bei x² = 3 und x² = 2“ (Intervall nach 4 Schritten noch unsicher, sicher nach 6 Schritten bei [1,71875; 1,734375]; x² = 2 zwei Stellen nach 11 Schritten).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 L = {−2; 3} ✓, A2 keine / {2} / {−2; 2} ✓, A3 ✓, A4 ✓ (neu), A5 {−5; 1} ✓, A6 ✓.
- **„Aufgabe laden“:** A4 geladen und 7-mal „Intervall halbieren“ gedrückt, Tabelle stimmt mit der Lösung überein.
- **Texte korrigiert:** Tabelle „Wie viele Lösungen?“ um „genau einem Punkt“ und „drei Punkten“ ergänzt (beides kommt in der Simulation vor); A3 „(erlaubt, da x ≠ 0) … Beide Lösungen liegen in D.“; neuer Unterrichtsideen-Punkt zu den gesicherten Stellen bei x² = 2. EN: Task 3 mit Schritten 5 und 6; Auswahl „Absolute value“ statt nur „|x|“; y-Achsenabschnitt `t` wie in lgs-grafisch (nur Beschriftung).

## 3. Geräte
- **1360 hell/dunkel, 390 hell, EN 1360:** vollständig, kein Überlauf, keine Konsolenfehler. Die neuen a = 0-Hinweise passen in die Lösungskarte. In EN bricht die Funktionsart-Auswahl wegen „Absolute value“ in eine zweite Zeile um; gut lesbar.

## 4. Barrierefreiheit
- **Farben:** nur `ctx.theme` ✓. Aufgabenmodus (`show`, `_hide`) unverändert ✓.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/gleichungen-grafisch/index.ts` | Hinweis a = 0 (DE/EN), eigener Satz für Hyperbel mit Lücke; EN „Absolute value“, t |
| `src/content/simulations/de/gleichungen-grafisch.md` | Tabelle, A3, A4 neu, Unterrichtsidee x² = 2 |
| `src/content/simulations/en/gleichungen-grafisch.md` | Task 3 neu |
| `tests/gleichungen-grafisch.test.ts` | Test Intervallhalbierung x² = 3 / x² = 2 |

## 6. Für den Kern (nicht selbst ändern)
– 

## 7. Rückfragen
– 

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 3370/3370 grün (148 Dateien), Build ok.

## Zweite Prüfung (Paket 2, 25.10.2026)

Unabhängiger zweiter Durchgang auf dem Zweig `pruefung/paket-2`, danach mit dem Stand oben zusammengeführt (beide Korrekturen sind enthalten).

Prüfer: Paket 2 · Datum: 25.10.2026 · Stand: Commit `48375ac` (pruefung/paket-2), darauf dieser Durchgang · Bogen: `scratchpad/pruef/gleichungen-grafisch/gleichungen-grafisch.png` (außerhalb des Repos)

### Ergebnis
korrigiert (Rechenlogik fehlerfrei; Lösung zu Aufgabe 4 passte nicht zur Simulation, Aufgabe 4 verriet die Lösung im Bild, EN-Lernmaterial war stark gekürzt)

### 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):**
  1. Startbeispiel x² − 1 = 0,5x + 2 ⇒ x² − 0,5x − 3 = 0 ⇒ x = (0,5 ± √(0,25 + 12)) : 2 = (0,5 ± 3,5) : 2 ⇒ x = 2 bzw. −1,5; f(−1,5) = 2,25 − 1 = 1,25. Anzeige „L = {−1,5; 2}“, Probe „f(−1,5) = 1,25 und g(−1,5) = 1,25 ✓“ ✓.
  2. 2/(x − 1) = x ⇒ 2 = x² − x ⇒ (x − 2)(x + 1) = 0 ⇒ L = {−1; 2}, D = ℝ \ {1}. Anzeige ✓.
  3. 1/x = x² − 2 ⇒ x³ − 2x − 1 = 0 ⇒ (x + 1)(x² − x − 1) = 0 ⇒ x = −1, (1 ± √5) : 2 ≈ 1,618 bzw. −0,618. Anzeige „L = {−1; ≈ −0,62; ≈ 1,62}“ ✓ (−1 exakt erkannt).
  4. |x − 1| = 0,5x + 1: x ≥ 1: x − 1 = 0,5x + 1 ⇒ x = 4; x < 1: 1 − x = 0,5x + 1 ⇒ x = 0. Anzeige „L = {0; 4}“ ✓. |x − 1| = −x + 1: für x ≤ 1 identisch, für x > 1: x − 1 = 1 − x ⇒ x = 1 (Rand). Anzeige „L = {x | x ≤ 1}“ ✓.
  5. Intervallhalbierung x² = 3: [1; 2] → h(1,5) = −0,75 → [1,5; 2] → h(1,75) = 0,0625 → [1,5; 1,75] → h(1,625) ≈ −0,359 → [1,625; 1,75] → h(1,6875) ≈ −0,152 → [1,6875; 1,75] → h(1,71875) ≈ −0,046 → [1,71875; 1,75] → h(1,734375) ≈ 0,008 → [1,71875; 1,734375]. Tabelle in der Simulation identisch ✓.
- **Sonderfälle:** Berührpunkt x² = 2x − 1 ⇒ „eine Lösung (Berührpunkt)“, Intervallhalbierung gesperrt ✓; Scheinlösung 1/(x − 1) + 1 = 1/(x − 1) ⇒ L = { } ✓; Polstelle: `evalFn` liefert NaN, Startintervall meidet Polstellen ✓; 1/x = 0 ⇒ keine Lösung ✓; Lösung auf dem Raster (2/(x − 1) = x bei x = −1) ⇒ „Treffer“ im ersten Schritt ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** echtes Minus, Dezimalkomma (DE) bzw. Punkt (EN), „≈“ nur bei gerundeten Werten, Schulrundung (−1,5 → −2). Die Anzeige „Sicher“ prüft das geschlossene Intervall (vorsichtig, aber korrekt).
- **Begriffe wie im Unterricht:** Lösungsmenge L (EN S), Definitionsmenge D, Berührpunkt, Differenzfunktion, Intervallhalbierung ✓; Gerade mx + t (EN mx + c) ✓.
- **Neue/ergänzte Tests:** `tests/gleichungen-grafisch.test.ts`: neuer Block „Lernmaterial“ (3 Tests) – alle Aufgaben- und Ausprobier-Beispiele (inkl. Betrag mit Bereich x ≤ 1, Gleichung 3. Grades, Scheinlösung) und Aufgabe 4 (erst nach 6 Schritten erste Nachkommastelle sicher). 16/16 grün.

### 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 L = {−2; 3} ✓; A2 (a) (x − 0,5)² + 0,75 > 0 ⇒ keine, (b) (x − 2)² = 0 ⇒ Berührpunkt (2|4), (c) x² = 4 ⇒ ±2 ✓; A3 x² + 3x − 4 = (x + 4)(x − 1) ✓; A5 |x + 2| = 3 ⇒ −5; 1 ✓; A6 ✓.
  **A4 fehlerhaft:** Die Lösung endete nach 4 Schritten bei [1,6875; 1,75] mit „Alle Zahlen in diesem Intervall runden auf 1,7“ – 1,75 rundet aber auf 1,8; die Simulation zeigt dort „Sicher: x₂ ≈ 2“. Lösung auf 6 Schritte bis [1,71875; 1,734375] erweitert („Sicher: x₂ ≈ 1,7“).
- **„Beispiel laden“ geklickt:** alle Einstellungen der Links (DE) mit simshot geladen und angesehen (bei „In der Simulation zeigen“ dieselbe Einstellung wie „Aufgabe laden“ ohne `show=0`; x² = 2 über das Modell geprüft: zweite Nachkommastelle erst nach 11 Schritten sicher, MAX_STEPS = 14 reicht), Anzeigen passen. A4 lud ohne `show=0` – die Lösungskarte zeigte „x₂ = √3 ≈ 1,73“ und verriet damit die Aufgabe; `show=0` ergänzt (Intervallhalbierung funktioniert damit, geprüft). EN geprüft mit 1/x = x² − 2 (dunkel).
- **Texte vereinfacht/korrigiert:** EN war deutlich kürzer: fehlten Tabelle zur Anzahl der Lösungen, Abschnitt Bruchgleichungen, Details zur Intervallhalbierung, Ausprobieren 5 und 6, Frage in Ausprobieren 3, Aufgaben 2 (Anzahl), 5 (Betrag), 6 (1/x = 0), alle „Show in the simulation“-Links und mehrere Stolpersteine (Scheinlösung), Lehrplanbezug. EN jetzt inhaltlich gleich zu DE.

### 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alles vorhanden; Handy: Koordinatensystem über den Karten, Tablet quer und Desktop: Karten rechts daneben ✓; Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf, keine abgeschnittenen Beschriftungen. Auswahl „Funktionsart“ bricht „Betrag“ in der schmalen Seitenleiste in eine zweite Zeile um – lesbar.
- **Touch (Ziehen) und Maus:** Ziehpunkte über Plot-Handles des Kerns (Pointer-Events), Antippen der Schnittpunkte per `TapTarget`; Ziehen in der Differenzdarstellung bewusst gesperrt.

### 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Pulsieren abgeschaltet, Tweens des Kerns)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON regulär; Regler, Schalter und Aktionen per Tastatur bedienbar; Auswahl eines anderen Schnittpunkts nur per Zeigegerät (Standardauswahl genügt für alle Aufgaben).
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen ✓; Alt-Text beschreibt Inhalt allgemein, Gleichung, Lösungsmenge, Probe und Halbierungstabelle stehen als Text in den Ergebnissen ✓.
- **Farben** (nur aus `ctx.theme`, nicht allein Rot/Grün unterscheidend), **Kontrast:** Graphen f/g aus `series[0]`/`series[1]`, zusätzlich mit „f“/„g“ beschriftet; Vorzeichen in der Halbierung zusätzlich mit „+“/„−“. Kartenhintergründe und Schatten mit festen Hex-/rgba-Werten (wie in vielen Simulationen), siehe „Für den Kern“.

### 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/content/simulations/de/gleichungen-grafisch.md` | Aufgabe 4: Lösung auf 6 Schritte erweitert (1,75 rundet auf 1,8), Link mit `show=0` |
| `src/content/simulations/en/gleichungen-grafisch.md` | vollständig an DE angeglichen (fehlende Abschnitte, Ausprobieren 5–6, Aufgaben 2, 5, 6, Links, Stolpersteine), Aufgabe 4 wie DE |
| `tests/gleichungen-grafisch.test.ts` | 3 Tests zum Lernmaterial ergänzt |

### 6. Für den Kern (nicht selbst ändern)
- Wie bei anderen Simulationen: Theme-Farbe für Kartenflächen (`surface`) fehlt; die Simulation trägt `#ffffff`/`#151c27` u. Ä. fest ein.
- Handy-Screenshot nach Aktion: Die fixierte Kopfzeile der Seite überdeckt beim Scrollen zur Aktion den oberen Rand der Zeichenfläche (Seiten-Layout, betrifft vermutlich alle Simulationen; nur im simshot gesehen).

### 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Keine. Hinweis: Die Anzeige „Sicher“ wertet das abgeschlossene Intervall aus. Streng genommen liegt die Lösung im offenen Intervall (h ≠ 0 an den Grenzen), so dass bei x² = 3 schon nach 4 Schritten 1,7 feststünde. Die vorsichtigere Anzeige ist korrekt und wurde belassen; das Lernmaterial folgt ihr jetzt.

### Prüfung
`npm run verify`: astro check 0/0/0, Tests 3033/3033 grün (131 Dateien), Build ok.
