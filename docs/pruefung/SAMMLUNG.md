# Sammlung aus der Prüfrunde: „Für den Kern“ und Rückfragen

Hier sammelt die Vertretung der Projektleitung, was die Prüfer nicht selbst ändern dürfen, also Kern, `ui.ts` und Lehrplan, und was fachlich entschieden werden muss. Die Punkte werden gebündelt erledigt.

**20.10.:** Die Projektleitung hat alle Vorschläge der Vertretung zu den Rückfragen übernommen. Umsetzung auf dem Zweig `pruefen/paket-1`.

## Für den Kern

| Quelle | Datei | Vorschlag | Stand |
|---|---|---|---|
| licht-schatten | `src/curriculum/physik.ts` (summary EN) | Im englischen Text „full shadow and half shadow“ durch „umbra and penumbra“ ersetzen, wie in der Simulation und im Lernmaterial | offen |
| reflexion | `src/sim-core/` (Zeichenfläche) | Die Bilder im Winkelspiegel lassen sich nur mit Maus oder Finger antippen. Allgemeine Tastaturbedienung für antippbare Objekte auf der Zeichenfläche ergänzen, z. B. Pfeiltasten wechseln die Auswahl und Enter wählt aus. | erledigt (Kern) |
| hebelgesetz | `src/sim-core/draw.ts` | Gemeinsamer Helfer für Text mit tiefgestelltem Index auf der Zeichenfläche. Bisher baut jede Simulation ihren eigenen (`richDraw` in hebelgesetz, `richText` in energieerhaltung, `arrow` in hookesches-gesetz). | erledigt (Kern) |
| teilchenmodell | `src/sim-core/format.ts` bzw. Ergebnis-Ausgabe im Host | Geschütztes Leerzeichen zwischen Zahl und Einheit allgemein setzen, damit die Zeile nicht vor „m/s“ oder „°C“ umbricht. | erledigt (Kern) |
| ohmsches-gesetz | `src/sim-core/` (Host) | Simulationen sollen abfragen können, ob der Aufgabenmodus (`_hide`) aktiv ist, damit sie gezielt einzelne Teile verdecken können statt ganzer Tabellen. | erledigt (Kern) |
| ohmsches-gesetz | `src/components/SimulationShell.astro` / `ui.ts` | Der Tipp „Die markierten Punkte lassen sich … ziehen“ passt nicht überall. Einen eigenen Tipptext pro Simulation ermöglichen, z. B. ein optionales Feld `hint` in der Definition. | offen |

## Rückfragen an die Projektleitung

| Quelle | Frage | Vorschlag der Vertretung | Entscheidung |
|---|---|---|---|
| licht-schatten | Das Lernmaterial ordnet die Simulation Bayern Gymnasium, Jgst. 7 zu, als Entwurf gekennzeichnet. Im Repo gibt es dafür nur eine Zuordnung für Hessen. | Mit dem Lehrplan Bayern Physik abgleichen, sobald der da ist (Mängelliste Punkt 5). || Vorschlag übernommen (Projektleitung, 20.10.) |
| licht-schatten | Steht der Schirm hinter der Spitze des Kernschattens, zeigt die Formel einen negativen Wert („≈ −20 cm → kein Kernschatten“). | Für Jgst. 6/7 nur „kein Kernschatten“ zeigen und die negative Zahl weglassen. || Vorschlag übernommen (Projektleitung, 20.10.) |
| reflexion | Lehrplanbezug Bayern Jgst. 7 „Natur und Technik“ (Entwurf) | Abgleichen, sobald der Lehrplan Bayern Physik vorliegt. || Vorschlag übernommen (Projektleitung, 20.10.) |
| reflexion | Diagramm „Anzahl der Bilder bei anderen Winkeln“: Ist 360° : φ ungerade, hängt die Zahl von der Lage der Figur ab. Für Jgst. 7 evtl. zu schwer. | Für Jgst. 7 nur die geraden Fälle zeigen, die anderen ausgegraut mit „hängt von der Lage ab“. || Vorschlag übernommen (Projektleitung, 20.10.) |
| einfacher-stromkreis | „Batterie verkehrt herum“ und „Lampe defekt“ gibt es nicht. Die defekte Lampe wäre ein gutes Beispiel für einen offenen Stromkreis trotz geschlossenem Schalter. | Als spätere Erweiterung vormerken, nicht in der Prüfrunde. || Vorschlag übernommen (Projektleitung, 20.10.) |
| einfacher-stromkreis | Das Schaltzeichen der Klingel hat die Schulbuchform. | Gegen DIN EN 60617 prüfen. Die Schulbuchform ist im Unterricht üblich, darum vorerst so lassen. || Vorschlag übernommen (Projektleitung, 20.10.) |
| hebelgesetz | Die Goldene Regel wird in Joule angezeigt („≈ 32,96 J“). Arbeit kommt vermutlich erst in Jgst. 8, und zwei Nachkommastellen wirken zu genau. | Auf eine Nachkommastelle runden; den Bezug zum Lehrplan Bayern beim Abgleich prüfen. || Vorschlag übernommen (Projektleitung, 20.10.) |
| hebelgesetz | Bei der Wippe heißt es „Der Hebel kippt …“. | Bei der Wippe „Die Wippe kippt …“ schreiben (kleine Textänderung). || Vorschlag übernommen (Projektleitung, 20.10.) |
| hookesches-gesetz | Das Modell fürs Überdehnen ist stark vereinfacht: Grenze bei 25 cm, danach halbe Federhärte. | Für Jgst. 7/8 so lassen; das Lernmaterial sagt bereits, dass es ein vereinfachtes Modell ist (beim Abgleich prüfen). || Vorschlag übernommen (Projektleitung, 20.10.) |
| hookesches-gesetz | Die automatische Messreihe trägt den Nullpunkt (0 \| 0) in die Tabelle ein. | Lassen: Der Nullpunkt ist ein echter Messpunkt und zeigt die Ursprungsgerade. || Vorschlag übernommen (Projektleitung, 20.10.) |
| teilchenmodell | Beim schnellen Schmelzen (1000 W) zeigt das Histogramm kurz Ø 640 m/s statt 570 m/s. Das widerspricht leicht der Aussage „die Energie macht die Teilchen nicht schneller“. | Thermostat beim Wechsel des Zustands straffer einstellen (kleine Änderung in der Simulation, beim nächsten Durchgang). || Vorschlag übernommen (Projektleitung, 20.10.) |
| teilchenmodell | Das Ergebnis „Temperatur und Teilchenbewegung“ ist jetzt `spoiler`. | So lassen: Verdeckt wird es nur im Aufgabenmodus bzw. mit dem Schalter „Ergebnisse“. || Vorschlag übernommen (Projektleitung, 20.10.) |
| bewegungsdiagramme | Aufgabe 2 („Lies im t-s-Diagramm ab …“) wird im Aufgabenmodus sofort durch das Ergebnis „Bewegungsgesetz“ und die Etiketten im Bild beantwortet. | „Bewegungsgesetz“ als `spoiler` markieren und die Etiketten im Aufgabenmodus ausblenden (beim nächsten Durchgang). || Vorschlag übernommen (Projektleitung, 20.10.) |
| bewegungsdiagramme | Aus dem Stand mit a < 0 fährt das Auto rückwärts los (steht im Hilfetext). | So lassen. Ab Jgst. 9 ist das sinnvoll; das Lernmaterial erklärt es. || Vorschlag übernommen (Projektleitung, 20.10.) |
| ohmsches-gesetz | Die Messgeräte wählen ihren Messbereich selbst. „Messbereich überschritten“ und falsche Polung lassen sich nicht vorführen. | So lassen. Als spätere Erweiterung vormerken (Messbereich von Hand wählen). || Vorschlag übernommen (Projektleitung, 20.10.) |
| ohmsches-gesetz | Glühlampenmodell (R ~ T^1,2), im Lernmaterial als Modell gekennzeichnet. | So lassen. || Vorschlag übernommen (Projektleitung, 20.10.) |
| reihe-parallel | Kurzschluss bzw. „Lampe überbrücken“ ist nicht möglich. Das ist ein häufiger Versuch in Jgst. 8–9 (in Reihe wird die andere Lampe dann heller). | Als Erweiterung vormerken, sinnvoll. || Vorschlag übernommen (Projektleitung, 20.10.) |
| reihe-parallel | Bei 2 V glühen die Lampen nur sehr schwach (Modell P ~ T⁴). | So lassen, fachlich plausibel. || Vorschlag übernommen (Projektleitung, 20.10.) |
