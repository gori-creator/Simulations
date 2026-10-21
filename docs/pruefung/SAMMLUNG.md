# Sammlung aus der Prüfrunde: „Für den Kern“ und Rückfragen

Hier sammelt die Vertretung der Projektleitung, was die Prüfer nicht selbst ändern dürfen, also Kern, `ui.ts` und Lehrplan, und was fachlich entschieden werden muss. Die Punkte werden gebündelt erledigt.

**20.10.:** Die Projektleitung hat alle Vorschläge der Vertretung zu den Rückfragen übernommen. Umsetzung auf dem Zweig `pruefen/paket-1`. **Ab sofort gilt:** Alles, was falsch ist oder besser werden soll, wird automatisch umgesetzt, ohne Rückfrage. Das betrifft auch die Kern-Punkte und die vorgemerkten Erweiterungen.

## Für den Kern

| Quelle | Datei | Vorschlag | Stand |
|---|---|---|---|
| licht-schatten | `src/curriculum/physik.ts` (summary EN) | Im englischen Text „full shadow and half shadow“ durch „umbra and penumbra“ ersetzen, wie in der Simulation und im Lernmaterial | erledigt (Kern) |
| reflexion | `src/sim-core/` (Zeichenfläche) | Die Bilder im Winkelspiegel lassen sich nur mit Maus oder Finger antippen. Allgemeine Tastaturbedienung für antippbare Objekte auf der Zeichenfläche ergänzen, z. B. Pfeiltasten wechseln die Auswahl und Enter wählt aus. | erledigt (Kern) |
| hebelgesetz | `src/sim-core/draw.ts` | Gemeinsamer Helfer für Text mit tiefgestelltem Index auf der Zeichenfläche. Bisher baut jede Simulation ihren eigenen (`richDraw` in hebelgesetz, `richText` in energieerhaltung, `arrow` in hookesches-gesetz). | erledigt (Kern) |
| teilchenmodell | `src/sim-core/format.ts` bzw. Ergebnis-Ausgabe im Host | Geschütztes Leerzeichen zwischen Zahl und Einheit allgemein setzen, damit die Zeile nicht vor „m/s“ oder „°C“ umbricht. | erledigt (Kern) |
| ohmsches-gesetz | `src/sim-core/` (Host) | Simulationen sollen abfragen können, ob der Aufgabenmodus (`_hide`) aktiv ist, damit sie gezielt einzelne Teile verdecken können statt ganzer Tabellen. | erledigt (Kern) |
| ohmsches-gesetz | `src/components/SimulationShell.astro` / `ui.ts` | Der Tipp „Die markierten Punkte lassen sich … ziehen“ passt nicht überall. Einen eigenen Tipptext pro Simulation ermöglichen, z. B. ein optionales Feld `hint` in der Definition. | erledigt (Kern) |
| schiefe-ebene | `src/sim-core/plot.ts` | `Plot.text` soll `_` als tiefgestellten Index setzen wie `subText`. | erledigt (Kern) |
| schiefe-ebene | `src/sim-core/` (Regler) | Regler-Beschriftungen zeigen „F_Z“ und „μ_H“ mit Unterstrich. Index tiefstellen (z. B. per Unicode-Tiefzeichen oder HTML `<sub>`). | erledigt (Kern) |
| schiefe-ebene | `src/sim-core/plot.ts` | Die Achsbeschriftung (z. B. „α in °“) liegt auf dem Kurvenende, wenn eine Kurve bei x_max auf 0 fällt. Beschriftung ausweichen lassen. | erledigt (Kern) |
| freier-fall | `src/sim-core/types.ts`, Host | `hint` soll auch als Funktion der Parameter erlaubt sein (Tipp je Modus, z. B. Reaktionstest; auch gasgesetze und radioaktiver-zerfall). Ebenso `help` an Reglern abhängig vom Zustand. | erledigt (Kern): `hint` und `help` dürfen `(v) => L(…)` sein (`null` blendet aus), Host aktualisiert bei jeder Änderung |
| radioaktiver-zerfall | `src/sim-core/key-targets.ts` | Bei nur einem Ziel soll `setKeyTargets` dieses beim Fokus gleich auswählen, damit ein Enter genügt. | erledigt (Kern): bei genau einem Ziel ist es beim Fokussieren gleich ausgewählt (`KeyTargetNav.focus()`) |
| radioaktiver-zerfall | `src/sim-core/` (Auswahl) | Optionen einer `choice`-Auswahl sollen im Aufgabenmodus Zusatzangaben verbergen können (z. B. die Halbwertszeit in der Nuklid-Auswahl). | erledigt (Kern): Optionsfeld `detail` (z. B. „Rn-220 (T½ = 55,6 s)“, im Aufgabenmodus „Rn-220“); Simulationen werden einzeln umgestellt |
| kreisbewegung | `src/sim-core/` (Host, Ergebnisse) | Ergebnistexte (`ctx.readout` als reiner Text) sollen `_` als Index setzen, z. B. „F_max“, wie Regler-Beschriftungen. | offen |
| energieerhaltung | `scripts/agenten/simshot.cjs` | Tastenschritte wie `["key","ArrowRight"]` erlauben, damit die Tastaturbedienung ohne eigenes Skript geprüft werden kann. | offen |
| schiefer-wurf | `src/sim-core/plot.ts` | `Plot.axes()` braucht einen Sperrbereich für Achsenzahlen (dort, wo Anzeigen liegen); die Achsbeschriftung „x in m“ soll auch der letzten Achsenzahl ausweichen. | offen |

## Rückfragen an die Projektleitung

| Quelle | Frage | Vorschlag der Vertretung | Entscheidung |
|---|---|---|---|
| licht-schatten | Das Lernmaterial ordnet die Simulation Bayern Gymnasium, Jgst. 7 zu, als Entwurf gekennzeichnet. Im Repo gibt es dafür nur eine Zuordnung für Hessen. | Mit dem Lehrplan Bayern Physik abgleichen, sobald der da ist (Mängelliste Punkt 5). | Vorschlag übernommen (Projektleitung, 20.10.) |
| licht-schatten | Steht der Schirm hinter der Spitze des Kernschattens, zeigt die Formel einen negativen Wert („≈ −20 cm → kein Kernschatten“). | Für Jgst. 6/7 nur „kein Kernschatten“ zeigen und die negative Zahl weglassen. | Vorschlag übernommen (Projektleitung, 20.10.) – umgesetzt |
| reflexion | Lehrplanbezug Bayern Jgst. 7 „Natur und Technik“ (Entwurf) | Abgleichen, sobald der Lehrplan Bayern Physik vorliegt. | Vorschlag übernommen (Projektleitung, 20.10.) |
| reflexion | Diagramm „Anzahl der Bilder bei anderen Winkeln“: Ist 360° : φ ungerade, hängt die Zahl von der Lage der Figur ab. Für Jgst. 7 evtl. zu schwer. | Für Jgst. 7 nur die geraden Fälle zeigen, die anderen ausgegraut mit „hängt von der Lage ab“. | Vorschlag übernommen (Projektleitung, 20.10.) – umgesetzt |
| einfacher-stromkreis | „Batterie verkehrt herum“ und „Lampe defekt“ gibt es nicht. Die defekte Lampe wäre ein gutes Beispiel für einen offenen Stromkreis trotz geschlossenem Schalter. | Als spätere Erweiterung vormerken, nicht in der Prüfrunde. | Vorschlag übernommen (Projektleitung, 20.10.) |
| einfacher-stromkreis | Das Schaltzeichen der Klingel hat die Schulbuchform. | Gegen DIN EN 60617 prüfen. Die Schulbuchform ist im Unterricht üblich, darum vorerst so lassen. | Vorschlag übernommen (Projektleitung, 20.10.) |
| hebelgesetz | Die Goldene Regel wird in Joule angezeigt („≈ 32,96 J“). Arbeit kommt vermutlich erst in Jgst. 8, und zwei Nachkommastellen wirken zu genau. | Auf eine Nachkommastelle runden; den Bezug zum Lehrplan Bayern beim Abgleich prüfen. | Vorschlag übernommen (Projektleitung, 20.10.) – umgesetzt (Rundung; Lehrplanabgleich Bayern noch offen) |
| hebelgesetz | Bei der Wippe heißt es „Der Hebel kippt …“. | Bei der Wippe „Die Wippe kippt …“ schreiben (kleine Textänderung). | Vorschlag übernommen (Projektleitung, 20.10.) – umgesetzt |
| hookesches-gesetz | Das Modell fürs Überdehnen ist stark vereinfacht: Grenze bei 25 cm, danach halbe Federhärte. | Für Jgst. 7/8 so lassen; das Lernmaterial sagt bereits, dass es ein vereinfachtes Modell ist (beim Abgleich prüfen). | Vorschlag übernommen (Projektleitung, 20.10.) |
| hookesches-gesetz | Die automatische Messreihe trägt den Nullpunkt (0 \| 0) in die Tabelle ein. | Lassen: Der Nullpunkt ist ein echter Messpunkt und zeigt die Ursprungsgerade. | Vorschlag übernommen (Projektleitung, 20.10.) |
| teilchenmodell | Beim schnellen Schmelzen (1000 W) zeigt das Histogramm kurz Ø 640 m/s statt 570 m/s. Das widerspricht leicht der Aussage „die Energie macht die Teilchen nicht schneller“. | Thermostat beim Wechsel des Zustands straffer einstellen (kleine Änderung in der Simulation, beim nächsten Durchgang). | Vorschlag übernommen (Projektleitung, 20.10.) – umgesetzt |
| teilchenmodell | Das Ergebnis „Temperatur und Teilchenbewegung“ ist jetzt `spoiler`. | So lassen: Verdeckt wird es nur im Aufgabenmodus bzw. mit dem Schalter „Ergebnisse“. | Vorschlag übernommen (Projektleitung, 20.10.) |
| bewegungsdiagramme | Aufgabe 2 („Lies im t-s-Diagramm ab …“) wird im Aufgabenmodus sofort durch das Ergebnis „Bewegungsgesetz“ und die Etiketten im Bild beantwortet. | „Bewegungsgesetz“ als `spoiler` markieren und die Etiketten im Aufgabenmodus ausblenden (beim nächsten Durchgang). | Vorschlag übernommen (Projektleitung, 20.10.) – umgesetzt („Bewegungsgesetz“ als `spoiler`; Etiketten im Bild werden über `ctx.hidden` ausgeblendet (Kern)) |
| bewegungsdiagramme | Aus dem Stand mit a < 0 fährt das Auto rückwärts los (steht im Hilfetext). | So lassen. Ab Jgst. 9 ist das sinnvoll; das Lernmaterial erklärt es. | Vorschlag übernommen (Projektleitung, 20.10.) |
| ohmsches-gesetz | Die Messgeräte wählen ihren Messbereich selbst. „Messbereich überschritten“ und falsche Polung lassen sich nicht vorführen. | So lassen. Als spätere Erweiterung vormerken (Messbereich von Hand wählen). | Vorschlag übernommen (Projektleitung, 20.10.) |
| ohmsches-gesetz | Glühlampenmodell (R ~ T^1,2), im Lernmaterial als Modell gekennzeichnet. | So lassen. | Vorschlag übernommen (Projektleitung, 20.10.) |
| reihe-parallel | Kurzschluss bzw. „Lampe überbrücken“ ist nicht möglich. Das ist ein häufiger Versuch in Jgst. 8–9 (in Reihe wird die andere Lampe dann heller). | Als Erweiterung vormerken, sinnvoll. | Vorschlag übernommen (Projektleitung, 20.10.) |
| reihe-parallel | Bei 2 V glühen die Lampen nur sehr schwach (Modell P ~ T⁴). | So lassen, fachlich plausibel. | Vorschlag übernommen (Projektleitung, 20.10.) |

## Nachbesserungen (werden automatisch erledigt)

| Quelle | Was | Stand |
|---|---|---|
| kraefteaddition | Der Schalter `vals=0` verdeckt jetzt auch die Federwaagen. Beschriftung anpassen: „Beträge anzeigen (Pfeile und Federwaagen)“, EN entsprechend. | erledigt: DE „Beträge anzeigen (Pfeile und Federwaagen)“, EN „Show magnitudes (arrows and spring scales)“; Schlüssel bleibt `vals`. |
| kraefteaddition | Die Beschriftung „Richtung 2“ kann eine Komponentenbeschriftung berühren, wenn deren Spitze am Richtungsgriff liegt. Beschriftung ausweichen lassen. | erledigt: „Richtung 1/2“ weicht den Beschriftungen an den Pfeilspitzen und den Pfeilen aus (z. B. F = 5 N bei 150°: „Richtung 2“ steht jetzt weiter außen auf der Geraden). Standardansichten unverändert (Pixelvergleich 0). |
| kraefteaddition | Bei α = 2° liegen die Pfeile am Knoten auf dem Handy eng zusammen. Beschriftungen versetzen. | erledigt: „F_G = …“, „F₁“, „F₂“ suchen am Knoten freie Stellen (keine Überlappung mit Pillen, α-Beschriftung, Pfeilen und Seilen; F₁/F₂ symmetrisch). Bei α = 2° auf dem Handy überlappt nichts mehr; Standardansicht unverändert (Pixelvergleich 0). |
| linsen | Bei der Zerstreuungslinse stehen „virtuelles Bild“ und „B“ dicht an den gestrichelten Linien. Etwas versetzen. | erledigt: beide Beschriftungen suchen sich die freieste Stelle nah am Bild (Abstand ≥ 5 px zu allen Strahlen, gestrichelten Linien, Achse, F-Marken und G); „B“ steht bei kleinen Bildern unter dem Fußpunkt. |
| linsen | Auf dem Handy liegen auf der optischen Bank bei g ≈ 13 cm „F“ und der Kerzenfuß eng beieinander. Beschriftung ausweichen lassen. | erledigt: „F“/„2F“ weicht seitlich am Kerzenteller vorbei aus. |
| teilchenmodell | Beim schnellen Abkühlen der Flüssigkeit (100 → 0 °C) hängt die mittlere Geschwindigkeit deutlich nach (z. B. 650 m/s bei 23 °C statt 592 m/s). Regelung auch außerhalb der Plateaus nachziehen. | erledigt: Thermostat mit Vorsteuerung (Geschwindigkeiten skalieren mit √(kT/kT_alt)) und Integralanteil (vorher dauerhaft ≈ +5 % in der Flüssigkeit), Anzeige glättet das Verhältnis zum Sollwert. Browser, 2000 W, 100 → 0 °C: größte Abweichung vorher 14,6 % (z. B. 667 statt 590 m/s bei 23 °C), nachher 1,6 %; Handy 1000 W 3,2 % (Zufallsschwankung). Neue Tests. |
| reflexion | Die Bilder im Winkelspiegel per Tastatur bedienbar machen (`ctx.setKeyTargets`, neuer Kern-Helfer). | erledigt: jedes Bild ist ein Tastaturziel (Name „Spiegelbild n: k Spiegelung(en), Spiegel 1 → 2“, Rahmen um das Bild, Enter wählt es wie Antippen). Im Browser geprüft (Desktop und Handy): Tab erreicht die Bühne, Pfeiltasten wechseln, Enter zeigt den Lichtweg. |
| hebelgesetz, energieerhaltung, hookesches-gesetz, kraefteaddition | Lokale Lösungen für tiefgestellte Indizes (`richDraw`, `richText`, `arrow`, `richParts`) auf den Kern-Helfer `subText`/`measureSubText` umstellen, sofern ohne sichtbare Änderung. | erledigt: alle vier umgestellt. Pixelvergleich vorher/nachher (je 2–3 Ansichten): hebelgesetz, energieerhaltung, kraefteaddition 0 Pixel Unterschied (Haken/Feder/rechter Winkel im Hebel setzen runde Ecken jetzt selbst, vorher zufällig vom Text übernommen); hookesches-gesetz mit Gewichten 1173 bzw. 346 Kantenpixel der Pfeilschrift verschieden (Indexgröße im Kern auf halbe Pixel gerundet), nicht sichtbar. Leerzeichen-Lösungen (NBSP) unverändert gelassen. |
| schiefe-ebene | Liegt der Klotz unten am Anschlag, rücken „α“, „F_H“ und „F_R“ eng an ihn heran. | offen |
| schiefe-ebene | Auf dem Handy ist die Szene klein, weil Platz für 70° freigehalten wird. Den Ausschnitt an den aktuellen Winkel anpassen (mit Übergang). | offen |
| freier-fall | Auf dem Mond mit Δt = 0,4 s fehlen die Zahlen „1“ und „3“ an der Δs-Leiste, weil die ersten Abschnitte zu kurz sind. Zahlen seitlich versetzt trotzdem zeigen. | offen |
| freier-fall | Im Reaktionstest berühren die ms-Zahlen am Lineal knapp die Finger. | offen |
| planetenbahnen | Der Hilfetext zeigt „v_K“ mit Unterstrich (Hilfetexte sind vom Index-Kern bewusst ausgenommen). In der Simulation „v<sub>K</sub>“ bzw. „v_K“ als Unicode schreiben, sobald planetenbahnen geprüft wird. | offen |
| radioaktiver-zerfall | Die EN-Zählrate „≈ 4.9/10⁹ a“ ist knapp formuliert; ausschreiben, z. B. „≈ 4.9 per 10⁹ years“. | offen |
| gasgesetze | Die Zahl „20“ an der Glasskala wird teils von Teilchen bzw. dem Wasserspiegel überdeckt. | offen |
| gasgesetze | Der Hinweis „Messwerte aufnehmen …“ liegt im Diagramm auf Gitterlinien; mit Hintergrund zeichnen. | offen |
| gasgesetze | Während die Temperatur noch angleicht, zeigt die Kopfzeile kurz z. B. „100 °C / 373,07 K“. Anzeige an die gerundete °C-Angabe koppeln. | offen |
| kreisbewegung | Auf dem Handy liegen im Auto-Diagramm „Schnee“ und „Eis“ knapp neben „v in m/s“. | offen |
| kreisbewegung | „r = 0,8 m“ liegt dicht neben der Beschriftung „F_Z = …“. | offen |
| radioaktiver-zerfall | Neue Kern-Funktionen nutzen: Tipp „… Enter drücken, bis ein Kern markiert ist“ anpassen (ein Enter genügt jetzt); Halbwertszeiten in der Nuklid-Auswahl als `detail`, damit sie im Aufgabenmodus verdeckt sind; `hint` je Versuch. | offen |
| energieerhaltung | Die Starthöhen-Beschriftung steht auf der eigenen Bahn bei manchen Formen nah am Wagen; der Tipp unter der Bühne ist auf dem Handy vier Zeilen lang (kürzen, ggf. je Ansicht über `hint`-Funktion). | offen |
| schiefer-wurf | In der schmalen Zerlegungs-Szene (iPad, Handy) liegen Pfeilbeschriftungen teils über den Stroboskop-Punkten; das Etikett „x = …“ deckt die Achsenzahl darunter ab. | offen |
| freier-fall, gasgesetze, kreisbewegung | `hint` bzw. Regler-`help` je Versuch über die neue Funktionsschreibweise (Reaktionstest; Kolben nur isotherm ziehbar; Kugel nur im Schnur-Versuch ziehbar). | offen |
| kraefteaddition | Aufgabe 3 lädt mit sichtbarer Resultierender (als Hilfe gedacht). Entscheidung der Vertretung: so lassen. | entschieden |
