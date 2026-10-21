# Prüfprotokoll: `hebelgesetz` – Hebelgesetz

Prüfer: Paket 1 (Vertretung) · Datum: 20.10.2026 · Stand: Commit `c62c4d6` · Bogen: `scratchpad/boegen/hebelgesetz.png` (außerhalb des Repos)

## Ergebnis
korrigiert (Formelzeichen im Bild mit echtem Index statt „F_K“, Hinweise für Last/Kraftmesser an der Drehachse und für eine zu nahe Sitzposition auf der Wippe, kein „−0“ bei der Ausgleichskraft, Lernmaterial EN auf DE-Umfang ergänzt, Hinweis auf g ≈ 10 N/kg, Tests ergänzt)

## 1. Fach (Rechenlogik, Formeln, Anzeigen)
- **Nachgerechnet (mindestens 3 Werte, mit Rechnung):** Massestück 50 g, g = 9,81 N/kg → F = 0,05 kg · 9,81 N/kg = 0,4905 N ≈ 0,49 N; Lochabstand 5 cm.
  1. Beispiel „3 · 4 = 2 · 6“: links 3 · 0,4905 N · 0,20 m = 0,2943 N·m, rechts 2 · 0,4905 N · 0,30 m = 0,2943 N·m → Anzeige „1,47 N · 0,20 m = 0,294 N·m“ auf beiden Seiten, „Gleichgewicht“, Hebel waagerecht ✓.
  2. Schräg ziehen (Aufgabe 4): wirksamer Kraftarm a = 0,30 m · sin 60° = 0,2598 m → „a_K = 26 cm“ ✓; F = 0,2943 N·m / 0,2598 m = 1,133 N → mit 1,13 N Gleichgewicht ✓ (Rest 0,0007 N·m < Reibung 0,003 N·m); mit 0,98 N: 0,98 N · 0,2598 m = 0,255 N·m, Überschuss links 0,040 N·m → „kippt nach links … um 0,040 N·m“ ✓.
  3. Einseitiger Hebel (Aufgabe 3): 4 · 0,4905 N = 1,962 N; 1,962 N · 0,25 m = 0,4905 N·m; / 0,45 m = 1,090 N → „1,09 N“, Anzeige 0,491 N·m = 0,491 N·m ✓.
  4. Schubkarre (Aufgabe 5): 80 kg · 9,81 N/kg = 784,8 N; · 50/140 = 280,3 N → „280 N“ ✓; · 30/140 = 168,2 N → „168 N“ ✓. Goldene Regel mit Standardwerten: 168,2 N · 0,196 m = 32,96 J = 588,6 N · 0,056 m ✓.
  5. Wippe: 40 kg · 9,81 N/kg · 1,5 m = 588,6 N·m, 30 kg · 9,81 N/kg · 1,5 m = 441,5 N·m, Unterschied 147,2 N·m ✓; Gleichgewicht bei a₂ = 40 · 1,5 m / 30 = 2 m ✓.
  6. Grenzfall 8 Stück an Stelle 10 links, Kraftmesser an Stelle 1 nach unten: nötig 8 · 0,4905 N · 0,50 m / 0,05 m = 39,24 N → „Nötig wären 39,24 N – mehr als der Messbereich von 5 N“ ✓.
  - Drehmoment am geneigten Hebel geprüft (Kreuzprodukt): Kraftmesser x · F · sin(β − φ), Massestücke −F · x · cos φ ✓; Rückstellmoment −0,075 N·m · sin φ sorgt für stabiles Gleichgewicht ✓.
- **Sonderfälle:** Massestücke an der Drehachse (x = 0) erzeugen kein Drehmoment, standen aber in keiner Liste → jetzt Hinweis „An der Drehachse ist der Kraftarm 0 …“ im Ergebnis. Kraftmesser an der Drehachse: die Anzeige sagte „In dieser Zugrichtung lässt sich der Hebel nicht ins Gleichgewicht bringen“ (irreführend) → eigener Text „hängt an der Drehachse: Kraftarm 0 …“. Zug entlang des Hebels (0°/180°) und Zug in die falsche Richtung → keine Lösung ✓. Ausgleichskraft bei schon ausgeglichenem Hebel war −0 → jetzt 0. Wippe: Eine Gleichgewichtsstelle unter 0,5 m (z. B. 15 kg bei 0,5 m gegen 80 kg → 0,09 m) wurde als erreichbar gemeldet, der Regler beginnt aber bei 0,5 m → neuer Text „so nah an der Drehachse kann das rechte Kind nicht sitzen“. Größte Werte: Anschlag bei 13°, nie darüber ✓; Messbereich 5 N ✓. Division durch 0: `effortForce` mit a_K = 0 → ∞, die Regler lassen das nicht zu ✓.
- **Einheiten, Vorzeichen (−), Dezimalkomma, Rundung:** N, m, cm, N·m, J; Dezimalkomma über `fmt` ✓; Drehmomente mit drei Nachkommastellen, Kräfte mit zwei ✓; Zugrichtung „−90°“ mit echtem Minus ✓.
- **g:** durchgehend 9,81 N/kg (Modell, Ergebnistext, Lernmaterial), also einheitlich. Für Klassen, die mit g ≈ 10 N/kg rechnen, steht jetzt ein Hinweis im Lernmaterial.
- **Begriffe wie im Unterricht:** Drehachse, Kraftarm/Lastarm, Drehmoment, links-/rechtsdrehend, ein-/zweiseitiger Hebel, Wirkungslinie, wirksamer Kraftarm, Goldene Regel der Mechanik ✓.
- **Neue/ergänzte Tests:** 4 neue Tests in `tests/hebelgesetz.test.ts` (alle Aufgaben des Lernmaterials, Drehachse/Kraftarm 0 und g = 9,81, größte Werte mit Anschlag und 39,24 N, Wippe); jetzt 12 Tests.

## 2. Aufgaben und Texte (DE und EN)
- **Aufgaben selbst gerechnet:** A1 4 · 15 cm = 3 · a₂ → 20 cm, Stelle 4 ✓; A2 2,943 N · 0,10 m / 0,40 m = 0,736 N ≈ 0,74 N ✓ (Link mit 0,74 N zeigt Gleichgewicht); A3 1,09 N ✓; A4 1,13 N und 26 cm ✓; A5 280 N/168 N ✓; A6 300 N · 4/16 = 75 N, Hand 4 mm, 75 N · 4 mm = 300 N · 1 mm ✓. Alle Links laden die beschriebenen Zustände (mit simshot geprüft).
- **„Beispiel laden“ geklickt:** alle sechs (Gleichgewicht finden, 3 · 4 = 2 · 6, Einseitiger Hebel mit Kraftmesser, Schräg ziehen, Schubkarre mit „Anheben“, Nussknacker) – passen zu Bild und Ergebnissen.
- **Texte vereinfacht/korrigiert:** DE in Ordnung, nur der Modell-Hinweis zu g ≈ 10 N/kg kam dazu. EN war etwa halb so lang (Einführung ohne Rechenbeispiel, 4 statt 8 Ausprobieren-Punkte, 3 statt 6 Aufgaben, knappe Unterrichtsideen) → auf DE-Umfang ergänzt, dazu eine Erklärung der Indizes K/L.

## 3. Geräte (Prüfbogen)
- **Handy klein/groß, iPad hoch/quer, Laptop, 1920, Beamer, hell/dunkel:** alle Ansichten in Ordnung; der Hebel ist groß und mittig, die Drehmoment-Karten sind lesbar.
- **Überlauf / Überlappungen / abgeschnittene Beschriftungen:** kein waagerechter Überlauf. Im Bild standen die Formelzeichen als „F_K“, „a_L“, „s_K“ mit sichtbarem Unterstrich (Schubkarre, Flaschenöffner, Nussknacker, Kraftmesser, Kopfzeile) → jetzt mit kleinem, tiefgestelltem Index gezeichnet (auch bei Breitenmessung und Randklemmung).
- **Touch (Ziehen) und Maus:** mit der Maus geprüft: Stapel von Stelle 6 auf Stelle 4 verschoben ✓, Massestück aus dem Kasten auf einen Stapel gezogen (2 → 3 Stück) ✓, Antippen eines Stapels nimmt ein Stück ab ✓. Der Ring des Kraftmessers und die Punkte an Schubkarre und Wippe sind als Ziehpunkte markiert.

## 4. Barrierefreiheit
- **Reduzierte Bewegung:** steht still ✓ (der Hebel springt direkt in die Ruhelage)
- **Tastatur (Tab-Reihenfolge, sichtbarer Fokus):** laut JSON in Ordnung; alles, was man ziehen kann, lässt sich auch über Regler einstellen.
- **Namen für Bildschirmleser, Beschreibung der Grafik:** keine Bedienelemente ohne Namen; Canvas-Beschreibung vorhanden; Drehmomente, Ergebnis und nötige Kraft stehen als Text in den Ergebnissen.
- **Farben:** Pfeile und Bemaßungen aus `ctx.theme.series`; das Gleichgewicht ist zusätzlich mit „=“, „<“, „>“ und Text gekennzeichnet, also nicht nur über die Farbe. Massestücke und Schubkarre sind Fotos mit festen Materialfarben.

## 5. Korrekturen in diesem Durchgang
| Datei | Änderung |
|---|---|
| `src/simulations/physik/hebelgesetz/index.ts` | Beschriftungen im Bild mit tiefgestelltem Index (`richParts`/`richWidth`/`richDraw` in `haloText` und `pill`) |
| `src/simulations/physik/hebelgesetz/index.ts` | Hinweis „Kraftarm 0“ für Massestücke/Kraftmesser an der Drehachse (`atAxis`, `needAxis`) |
| `src/simulations/physik/hebelgesetz/index.ts` | Wippe: eigener Text, wenn die Gleichgewichtsstelle näher als 0,5 m an der Achse läge (`seesawClose`) |
| `src/simulations/physik/hebelgesetz/model.ts` | `balancingForce` liefert 0 statt −0 |
| `src/content/simulations/en/hebelgesetz.md` | auf DE-Umfang ergänzt (Einführung, 8 Ausprobieren-Punkte, 6 Aufgaben, Unterrichtsideen) |
| `src/content/simulations/de/hebelgesetz.md` | Modell: Hinweis zu g ≈ 10 N/kg |
| `tests/hebelgesetz.test.ts` | 4 neue Tests mit den nachgerechneten Werten |

## 6. Für den Kern (nicht selbst ändern)
- Text mit tiefgestelltem Index im Canvas wird in mehreren Simulationen eigens gebaut (hier `richDraw`, in `energieerhaltung` `richText` mit `_{…}`). Ein gemeinsamer Helfer in `src/sim-core/draw.ts` wäre sinnvoll.

## 7. Rückfragen (fachlich unsicher, nicht stillschweigend geändert)
- Die Goldene Regel wird mit der Einheit Joule angezeigt („≈ 32,96 J“). Arbeit und Joule kommen je nach Lehrplan erst nach dem Hebel (Bayern: Jgst. 8, bitte am Lehrplan prüfen). So belassen? Zwei Nachkommastellen bei J wirken außerdem etwas genau.
- Der Ergebnistext der Wippe lautet „Der Hebel kippt nach links …“. Das ist fachlich richtig. Ist „Die Wippe kippt …“ gewünscht?

## Prüfung
`npm run verify`: astro check 0/0/0, Tests 2884/2884 grün (125 Dateien), Build ok.
