# Prüfprotokoll: `boxplot` – Mittelwert, Median und Boxplot

Prüfer: Paket 2 · Datum: 21.10.2026 · Stand: Commit `c4cb101` (Merge binomische-formeln), darauf dieser Durchgang · Bogen: `scratchpad/pruefung/boxplot/boxplot.png` (außerhalb des Repos)

## Ergebnis
korrigiert, Rückfrage offen (Quartil-Festlegung in Bayern)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mit Rechnung):**
  1. Median: 2, 3, 5, 8, 9 → n = 5, 3. Wert = 5 ✓. 2, 3, 5, 8 → (3 + 5) : 2 = 4 ✓. Mittelwerte 27 : 5 = 5,4 und 18 : 4 = 4,5 ✓ (Anzeige).
  2. Quartile 1, …, 9: Median 5 (5. Wert), untere Hälfte 1, 2, 3, 4 → Q₁ = (2 + 3) : 2 = 2,5; obere Hälfte 6, 7, 8, 9 → Q₃ = 7,5. Spannweite 9 − 1 = 8, Quartilsabstand 7,5 − 2,5 = 5, Mittel 45 : 9 = 5. Anzeige stimmt. Die Simulation verwendet konsequent „Median der Hälften **ohne** den Median“ (Modell, Rangplatz-Markierung in der geordneten Liste, „Schritt für Schritt“, Lernmaterial). Andere Festlegung (kleinster Wert, bis zu dem mindestens 25 % reichen; oder Hälften mit Median) ergäbe Q₁ = 3.
  3. Ausreißer 1, 2, 3, 4, 100: Summe 110, x̄ = 110 : 5 = 22; Median 3 ✓. Q₁ = (1 + 2) : 2 = 1,5, Q₃ = (4 + 100) : 2 = 52, IQR 50,5, obere Grenze 52 + 1,5 · 50,5 = 127,75 → 100 wird bei nur 5 Werten **nicht** als Ausreißer gekennzeichnet (korrekt nach der Regel; jetzt im Lernmaterial erklärt).
  4. Probe 7a: Summe 9 + 12 + … + 28 = 295, x̄ = 19,67; Q₁ = 16 (4. Wert), Me = 20 (8.), Q₃ = 24 (12.). 7b: Summe ebenfalls 295, Q₁ = 13, Me = 20, Q₃ = 27, IQR 14 ✓.
  5. Weitsprung (n = 12): Me = (3,6 + 3,7) : 2 = 3,65; Q₁ = (3,2 + 3,4) : 2 = 3,3; Q₃ = (3,9 + 4,0) : 2 = 3,95 ✓. Taschengeld: 355 : 11 ≈ 32,27; Grenze 35 + 1,5 · 15 = 57,5 → 90 Ausreißer, Antenne endet bei 40 ✓.
- **Sonderfälle** (im Browser geladen): ein Wert (7) → alle fünf Kennwerte 7, Spannweite/IQR 0 ✓; zwei Werte (2; 6) → Q₁ = 2, Me = 4, Q₃ = 6 ✓ (Hälften je ein Wert); alle gleich (5; 5; 5; 5) → Box zu einem Strich, Spannweite/IQR 0, keine Ausreißer ✓; leere/ungültige Eingabe → „–“, „Schritt für Schritt“ gesperrt ✓; negative Werte (−3; −1,5; 0; 2) → Q₁ −2,25, Me −0,75, Q₃ 1, x̄ −0,625 ✓; 30 Werte Höchstgrenze (Hinzufügen gesperrt) ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** Dezimalkomma und `−` über `fmt`/`formatData`. Gefunden und korrigiert: „Spannweite 2,0 − −3,0“ (doppeltes Minus) → jetzt „2,0 − (−3,0)“; Mittelwert immer mit „≈“, auch wenn exakt (z. B. 45/9 ≈ 5) → jetzt „=“ bei exakten Werten; Kennwerte mit uneinheitlichen Stellen (Q₃ „1“ neben Max „2,0“) → Kennwerte haben jetzt mindestens die Stellen der Daten.
- **Begriffe wie im Unterricht:** Urliste, Rangliste/geordnete Liste, Median (Zentralwert), arithmetisches Mittel, unteres/oberes Quartil, Spannweite, Quartilsabstand, Antennen (Whisker), Ausreißer ✓. Kürzel „Me“ für den Median ist gebräuchlich.
- **Neue/ergänzte Tests:** 6 Tests in `tests/boxplot.test.ts` (Median 2,3,5,8,9 / 2,3,5,8; Quartile 1…9 inkl. Rangplätze; Ausreißer 1,2,3,4,100 inkl. „nicht gekennzeichnet“; drei Werte, alle gleich, negative Werte; Aufgabe 6; Taschengeld ohne 90 €).

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** DE 1–6 alle richtig (s. o.; Aufgabe 4: ≤ 15 min sind 7 von 12 ≈ „etwa die Hälfte“, > 22,5 min 3 von 12 = 25 %; Aufgabe 6: 5 + 8 + 10 + 12 + 65 = 100, Median 10).
- **„Beispiel laden“ geklickt:** alle Ausprobieren-, Aufgaben- und Lösungslinks (DE) sowie der neue EN-Link geladen; die Beispiele entsprechen diesen Links – keine Konsolenfehler, Werte wie im Text. Aufgaben-Links mit `show=0` verbergen Kennwerte im Panel, in der Liste („?“) und in der neuen Bildschirmleser-Beschreibung.
- **Texte vereinfacht/korrigiert:**
  - EN war deutlich kürzer (3 statt 6 Aufgaben, 4 statt 7 Versuche, keine Formel, keine Unterrichtsideen in voller Länge) → auf DE-Umfang gebracht.
  - DE/EN: Beispiel 1, …, 9 für die Quartile; Zahlenbeispiel 1, 2, 3, 4, 100 (Mittel 22, Median 3); Unterrichtsidee „Ausreißer bei wenigen Werten“ mit Link; Hinweis auf die andere Quartil-Festlegung (Q₁ = 3).
  - DE Ausprobieren 1: „höchsten Punkt“ (mehrdeutig: oben im Stapel?) → „Punkt mit dem größten Wert“.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten vollständig; schmal: Kennwerte-Karte unter dem Zahlenstrahl; Beamer gut lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein Überlauf (JSON). Bei einem Wert/allen gleichen Werten liegen Min/Q₁/Me/Q₃/Max-Beschriftungen nebeneinander aufgefächert mit Hilfslinien – lesbar.
- **Touch (Ziehen) und Maus:** Maus: Punkt 24 → 26 gezogen, Kennwerte folgen ✓. Finger (CDP-Touch, 414 px): Punkt nach rechts gezogen (24 → 30), Kennwerte folgen ✓. Antippen einer freien Stelle ergänzt einen Wert ✓.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** Tab-Reihenfolge regulär; alle Bedienelemente benannt. Ziehen nur mit Zeiger, aber Werte lassen sich über das Textfeld und die Knöpfe „Wert hinzufügen/entfernen“ vollständig per Tastatur ändern.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** vorher nur die allgemeine Beschreibung → jetzt zusätzlich Sachzusammenhang, Anzahl und (nur wenn „Kennwerte anzeigen“ an ist, damit Aufgaben nichts verraten) Min, Q₁, Median, Q₃, Max und Mittelwert je Gruppe.
- **Farben:** Reihenfarben aus `ctx.theme`; Median/Mittelwert/Quartile zusätzlich über Form (Strich, Dreieck, Raute) und Beschriftung unterschieden. Einzelne Kartenhintergründe im hellen Modus fest `#ffffff` (wie in vielen Simulationen) – unkritisch, belassen.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/mathematik/boxplot/index.ts` | Negative Subtrahenden eingeklammert; „=“ statt „≈“ bei exaktem Mittelwert; Kennwerte mit mindestens den Stellen der Daten; dynamische Beschreibung der Zeichenfläche (aria-label) |
| `tests/boxplot.test.ts` | 6 Tests (Prüfwerte, Sonderfälle) |
| `src/content/simulations/de/boxplot.md` | Quartil-Beispiel 1…9, Ausreißer-Zahlenbeispiel, andere Festlegung, Ausreißer bei wenigen Werten, Ausprobieren 1 eindeutig |
| `src/content/simulations/en/boxplot.md` | auf DE-Umfang gebracht |

## 6. Für den Kern (nicht selbst ändern)
- Wie bei `diagramme`: eine Kern-Funktion für die dynamische Beschreibung der Zeichenfläche wäre einheitlicher als `surface.canvas.setAttribute('aria-label', …)`.
- Ein Theme-Wert für die Kartenfläche (statt `'#ffffff'` im hellen Modus) wäre sauberer.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- **Quartil-Festlegung in Bayern:** Die Simulation nimmt Q₁/Q₃ als Median der unteren/oberen Hälfte ohne den Median (1…9 → Q₁ = 2,5). In bayerischen Schulbüchern ist (nach meinem Kenntnisstand, unsicher) auch die Festlegung „Q₁ ist der kleinste Wert, bis zu dem mindestens 25 % der Werte reichen“ verbreitet (1…9 → Q₁ = 3, immer ein Datenwert). Bitte klären, welche im bayerischen Gymnasium (Jgst. 7) üblich ist; ggf. wäre eine umschaltbare Festlegung (neuer Parameter) ein kleiner Umbau. Bis dahin ist die verwendete Festlegung im Lernmaterial erklärt und die andere genannt.

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2968/2968 grün (128 Dateien), Build ok.
