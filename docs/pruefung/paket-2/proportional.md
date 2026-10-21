# Prüfprotokoll: `proportional` – Direkte und indirekte Proportionalität

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `1677912` (Basis) · Bogen: `scratchpad/pruefung/proportional/proportional.png` (nicht im Repo)

## Ergebnis
korrigiert

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Äpfel: 4 kg ≙ 10 € → 1 kg ≙ 10 € : 4 = 2,50 € → 7 kg ≙ 7 · 2,50 € = 17,50 €. Probe 17,50 : 7 = 2,5 = 10 : 4. Anzeige (Waage, Tabelle, Dreisatz, Ergebnisse) stimmt.
  2. Pumpen: 3 Pumpen · 4 h = 12 → 1 Pumpe 12 h → 4 Pumpen 12 h : 4 = 3 h (x · y = 12); 9 Pumpen 12 : 9 = 1,33… h = 1 h 20 min. Anzeige stimmt.
  3. Becken: 6 Pumpen · 10 h = 60 h → 1 Pumpe 60 h → 4 Pumpen 60 h : 4 = 15 h; 5 Pumpen 12 h. Dreisatz-Karte zeigt links „: 6 / · 4“, rechts „· 6 / : 4“ (Gegenrichtung) ✓.
  4. Taxi: 3 € + 10 · 2 € = 23 € (nicht 13 € · 2 = 26 €); Quotienten 13 : 5 = 2,6 und 23 : 10 = 2,3; Faktor 23 : 13 ≈ 1,77 ✓.
  5. Testtabellen: (1|3),(2|6),(5|15): Quotienten 3; 3; 3 → direkt, k = 3. (2|12),(3|8),(6|4): Produkte 24; 24; 24 → indirekt, k = 24. (1|5),(2|7),(3|9): Quotienten 5; 3,5; 3, Produkte 5; 14; 27 → keines. 120-km-Tabelle: Produkte 120 → indirekt ✓.
- **Sonderfälle:** indirekt bei x = 0 → NaN, aber x wird für Pumpen auf 1…12 geklemmt, x/x₀ für Äpfel/Taxi auf 0,5…10 (Regler bis 12 wird geklemmt). x₀ = x = 0,5 → Dreisatz „0,5 kg → 1 kg → 0,5 kg“, sinnvoll. Reglergrenzen (k = 0,5…5 €/kg, 6…60 h, 0,5…4 €/km, b = 1…6 €) liefern endliche, positive Werte (neuer Test).
- **Einheiten, Vorzeichen, Dezimalkomma, Rundung:** Geld mit Cent, Zeiten bis 2 Stellen und als h/min; Dezimalkomma über `ctx.fmt`. Korrigiert: gerundete Werte erschienen als „y = ≈ 1,33 h“ und „9 Pumpen ≙ ≈ 1,33 h“; Produktkette „9 · 1,33 = 12“ war rechnerisch ungenau; Taxi-Quotienten „≈ 2,6“ obwohl exakt; Quotienten der 120-km-Tabelle auf 2 Stellen gerundet (0,08; 0,03; 0,02; 0,01 – der letzte wirkte wie 1/100).
- **Begriffe wie im Unterricht:** quotientengleich, produktgleich, Proportionalitätsfaktor, Hyperbelast, Dreisatz, gleiche Richtung/Gegenrichtung ✓.
- **Neue/ergänzte Tests:** `tests/proportional.test.ts` – Block „Sonderfälle (Prüfrunde)“: x = 0, leere Tabelle, Reglergrenzen, x₀ = x, kleine Quotienten der 120-km-Tabelle, Ergebnis aller sechs Testtabellen, Werte aus dem Lernmaterial (2,4 h; 1 h 20 min; 12 h).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** Aufgabe 1 (17,50 €), 2 (15 h, 12 h), 3 (2 h; 1 h 20 min), 4 (23 €, nicht 26 €), 5 (s. o.), 6 (120 : 50 = 2,4 h = 2 h 24 min; 120 : 90 = 1 h 20 min) – alle richtig, keine Abweichung.
- **„Beispiel laden“ geklickt:** alle DE-Links (Ausprobieren 1–6, Aufgaben laden und Lösung zeigen, (a)/(b)/(c)), dazu EN Taxi. Alle laden ohne Fehler; `show=0`/`_hide=1` verdecken die Ergebnisse.
- **Texte korrigiert:**
  - EN war deutlich kürzer als DE (3 statt 6 Aufgaben, kein Dreisatz-Vergleich, keine Taxi-Aufgabe, Ideen gekürzt) → EN inhaltlich an DE angeglichen.
  - DE „der rote Punkt „26 €?““ → „der Punkt „26 €?““ (Farbe ist Theme-Reihe 2, im Dunkelmodus rosa).
  - Testtexte in der Simulation: doppelte Doppelpunkte („Pizza teilen: 24 Pizzastücke werden gerecht verteilt: …“, „120 km Fahrt: Dieselbe Strecke von 120 km: …“, ebenso Eintrittskarten, Nur Zahlen) umformuliert, DE und EN.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Karten vorhanden, lesbar, kein Überlauf.
- **Überlappungen:** bekannte offene Punkte bestätigt, nicht umgebaut: (1) Handy-Test „Alter und Größe“: Punktlabel „(1 | 75)“ wird vom Punkt (2 | 87) teilweise verdeckt bzw. die Urteils-Pille überlappt ein Punktlabel; (2) Beschriftungen unten links eng bei x = 0,5; (3) Pfeilbeschriftungen „·2“/„·3“ in der Tabelle dicht; (4) bei show=0 verrät die y-Achse die Größenordnung des Ergebnisses. Kleinigkeit: In der Wertetabelle erscheint eine Spalte doppelt (blass), wenn P auf einer Tabellenspalte liegt (z. B. x = 9) – gewollte Hervorhebung, aber leicht verwirrend.
- **Touch (Ziehen) und Maus:** P auf dem Graphen ziehbar (Achse x, Rasterung 0,5 bzw. ganze Pumpen), Tabellenspalten antippbar; im Test die Vermutungs-Kärtchen.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (Prüfbogen).
- **Tastatur:** Tab-Reihenfolge laut JSON regulär; alle Regler/Aktionen über Kernsteuerung bedienbar. Vermutung im Test nur per Tippen auf die Zeichenfläche – per Tastatur geht nur „Tabelle prüfen“ (ohne vorherige Vermutung).
- **Namen, Beschreibung:** keine Bedienelemente ohne Namen ✓; Alt-Text beschreibt Szene, Graph, Tabelle, Dreisatz, Test (DE/EN) ✓.
- **Farben:** Größen über `theme.series`; Test-Ergebnis zusätzlich mit ✓/✗ und Text, Taxi-Fehlwert mit „✗“ und Durchstreichung – nicht nur Rot/Grün ✓. Karten-, Halo-, Waagen-, Taxi- und Apfelfarben sind feste Hex-Werte (hell/dunkel unterschieden) – siehe „Für den Kern“.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/proportional/index.ts` | Chip „y = ≈ …“ → „y ≈ …“; Dreisatz-Ergebnis gerundet als „≙ 1,33 h (gerundet)“; Produktketten mit „1,33…“; Taxi-Quotienten „=“ statt „≈“, wenn exakt; Quotienten/Produkte < 0,1 mit 3 Stellen (Tabelle, P-Spalte, Ergebnisse); Testtexte ohne doppelte Doppelpunkte (DE/EN) |
| `src/content/simulations/en/proportional.md` | an DE angeglichen (Erklärung, Dreisatz-Tabelle, 6 Ausprobieren-Schritte, 6 Aufgaben, Unterrichtsideen) |
| `src/content/simulations/de/proportional.md` | „roter Punkt“ → „Punkt“ |
| `tests/proportional.test.ts` | Sonderfälle und Werte aus dem Lernmaterial |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `einheiten`/`massstab`: Theme-Farbe für Karten/Flächen (`surface`) und für Halos fehlt; die Simulation trägt `#ffffff`/`#151c27` u. a. fest ein. Gegenstandsfarben (Waage, Taxi, Äpfel, Wasser) bewusst zulassen.
- Tastaturbedienung für Tipp-Ziele auf der Zeichenfläche (`TapTarget`) wäre wünschenswert (hier: Vermutung im Test, Tabellenspalten).

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Das Kärtchen „x · y = 12 h“ gibt dem Produkt die Einheit h (Pumpen · h); fachlich wäre „k = 12 h (Zeit mit einer Pumpe)“ sauberer. Belassen.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2949/2949 grün (126 Dateien), Build ok.
