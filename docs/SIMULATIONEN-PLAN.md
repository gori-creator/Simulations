# Plan: Simulationen für alle Lehrplan-Themen

Stand 22.11.2026. Grundlage: `docs/LEHRPLAN-LUECKEN.md` (407 Lernbereiche ohne Simulation in 14 Ländern, Mathematik und Physik am Gymnasium; Bayern Mathematik ist schon vollständig). Jeder dieser Lernbereiche steht unten an mindestens einer Stelle – so ist nach diesem Plan **jedes** Lehrplan-Thema abgedeckt.

**Stand 22.11.2026, später:** Teil B ist erledigt (PR #184): 87 Lernbereiche haben jetzt eine vorhandene Simulation, offen sind noch 320 (`docs/LEHRPLAN-LUECKEN.md`). Einige Zeilen in Teil B wurden bewusst nicht eingetragen, weil der Inhalt in der Simulation fehlt (winkel-messen: Minuten/Sekunden, lorentzkraft: Hall-Effekt, geraden-ebenen: Scharen, brechung: Wellenmodell LK 13, teilchenmodell: innere Energie Kl. 11). Die ersten zehn Simulationen je Fach aus Teil A sind als Aufträge vergeben: `docs/agenten/AUFTRAG-LUECKEN-MATHE.md` und `docs/agenten/AUFTRAG-LUECKEN-PHYSIK.md`.

**Entwurf:** Die Zuordnung ist ein Vorschlag (aus Titel und Kurzbeschreibung der Lernbereiche) und vor dem Eintragen in `src/curriculum/lehrplaene/` fachlich zu prüfen.

| Teil | Was | Anzahl |
| --- | --- | --- |
| A | Neue Simulationen (Mathematik 41, Physik 52) | 93 |
| B | Vorhandene Simulationen passen schon – nur in den Länder-Lehrplänen eintragen | 38 Simulationen für 62 Lernbereiche |
| C | Keine Simulation sinnvoll (Methoden, Praktika, Wahl- und Projektthemen) | 38 Lernbereiche |

Abkürzungen der Länder: BW Baden-Württemberg, BY Bayern, BE Berlin, BB Brandenburg, HB Bremen, HH Hamburg, HE Hessen, NI Niedersachsen, NW Nordrhein-Westfalen, RP Rheinland-Pfalz, SL Saarland, SN Sachsen, ST Sachsen-Anhalt, SH Schleswig-Holstein. Dahinter die Nummer des Lernbereichs im Lehrplan.

Reihenfolge in Teil A: zuerst die Simulationen, die in den meisten Ländern fehlen.

## A · Neue Simulationen: Mathematik (41)

| # | Simulation (Vorschlag für die Kennung) | Klasse | Was man darin macht | Länder | Deckt ab |
| --- | --- | --- | --- | --- | --- |
| 1 | **Gauß-Verfahren** (`gauss-verfahren`) | 11–13 | Gleichungssystem Schritt für Schritt auf Stufenform bringen; eine, keine oder unendlich viele Lösungen, geometrisch als Ebenen. | 5 | BW 3.6.1 (9)–(10), HB LA, HH 7, HE Q2.3.1, NW Q-G.6 |
| 2 | **Zufallsexperimente und Laplace** (`zufallsexperimente`) | 5–8 | Würfel, Münze und Glücksrad: Ergebnis, Ereignis, Laplace-Wahrscheinlichkeit, Additions- und Komplementärregel. | 4 | HE 5.2.1, HE Q3.1.2, NI 9.3, NW 8.3, SH 5.3 |
| 3 | **Zufallsgröße und Erwartungswert** (`zufallsgroesse`) | 10–13 | Verteilung als Histogramm, Erwartungswert, Varianz, Standardabweichung; faires Spiel einstellen. | 4 | HE Q3.2.1, NW Q-S.3, ST 3.1, SH S.1 |
| 4 | **Übergangsmatrizen (Markov-Ketten)** (`uebergangsmatrizen`) | 11–13 | Zustandsgraph und Matrix, Verteilung Schritt für Schritt, Matrixpotenzen, stabile Verteilung (Fixvektor). | 3 | HB LA, HH 7, HE Q2.4.1, HE Q2.4.3, HE Q2.4.4, HE Q2.4.5 |
| 5 | **Daten erheben und darstellen** (`daten-erheben`) | 5–11 | Strichliste, Häufigkeitstabelle, Klassen, passende Diagramme; irreführende Diagramme erkennen. | 3 | HE 5.1.1, NI 4.1, NI 4.2, NI EF-1.1, NW 12.1 |
| 6 | **Potenz- und Wurzelgesetze** (`potenzgesetze`) | 9–10 | Potenzgesetze sichtbar machen, negative und gebrochene Exponenten als Wurzeln. | 3 | BW 3.3.1 (1)–(3), HE 1.2.3, NW 9.3 |
| 7 | **Schrägbild und Dreitafelbild** (`schraegbild`) | 7–10 | Körper drehen, Schrägbild, Grund-, Auf- und Seitenriss; wahre Größen ablesen. | 3 | BW 3.3.3 (1), HE 2.2.4, SN W3 |
| 8 | **Ableitungsregeln** (`ableitungsregeln`) | 11–12 | Summen-, Faktor-, Potenz-, Produkt- und Kettenregel am Graphen: Teile einzeln ableiten und zusammensetzen, auch sin, cos und eˣ. | 2 | BW 3.4.1 (2)–(3), BW 3.5.1 (3)–(4), BW 3.6.1 (2)–(3), HE E.2.4, HE E.4.3, HE E.5.3 |
| 9 | **Komplexe Zahlen** (`komplexe-zahlen`) | 10–13 | Gaußsche Zahlenebene, Rechnen als Verschieben und Drehstrecken, Polarform, Lösungen von x² = −1, Matrixdarstellung. | 2 | HE Q4.3.1, HE Q4.3.2, HE Q4.3.3, HE Q4.3.4, SN W1 |
| 10 | **Prognose- und Konfidenzintervalle** (`konfidenzintervall`) | 12–13 | Viele Stichproben ziehen, Intervalle sehen, die p treffen oder verfehlen; Konfidenzellipse, nötiger Stichprobenumfang. | 2 | HE Q3.4.1, HE Q3.4.2, HE Q3.4.3, HE Q3.4.4, NW Q-S.5 |
| 11 | **Richtungsfeld und Differenzialgleichungen** (`richtungsfeld`) | 12 | Richtungsfeld zeichnen, Lösungskurven durch Startpunkte, Wachstum und Schwingung (2. Ordnung). | 2 | HE Q1.5.1, HE Q1.5.2, HE Q1.5.3, SN GK-W6, SN LK-W6 |
| 12 | **Kegelschnitte als Ortslinien** (`kegelschnitte`) | 9–12 | Parabel, Ellipse und Hyperbel als Ortslinien und als Schnitt eines Kegels; Gärtnerkonstruktion. | 2 | NI 18.4, SN GK-W1, SN LK-W1 |
| 13 | **Wachstumsmodelle** (`wachstumsmodelle`) | 10–12 | Linear, exponentiell, beschränkt und logistisch im Vergleich, explizit und rekursiv. | 2 | HE Q1.3.5, HE Q1.5.1, SN W2 |
| 14 | **Mittelwert, Median und Streuung** (`kenngroessen`) | 7–13 | Datenpunkte ziehen, Mittelwert, Median, Spannweite und Standardabweichung verändern sich mit. | 2 | HE Q3.5.2, NI EF-1.2 |
| 15 | **Parameterkurven und Polarkoordinaten** (`parameterkurven`) | 10–12 | Kurven mit Parameter t zeichnen lassen (Wurfbahn, Kreis, Spirale), Polarkoordinaten. | 2 | HE Q2.3.17, SN W3 |
| 16 | **Ungleichungen** (`ungleichungen`) | 5–8 | Lösungsmenge am Zahlenstrahl, Umformen und Umdrehen des Zeichens bei Multiplikation mit einer negativen Zahl. | 2 | HE 4.2.4, ST 1.2 |
| 17 | **Vorzeichenregeln** (`vorzeichenregeln`) | 6–7 | Multiplizieren und Dividieren mit negativen Zahlen: Schuldenmodell und Permanenzprinzip. | 2 | HE 1.2.1, NI 8.3 |
| 18 | **Zahlensysteme** (`zahlensysteme`) | 5–8 | Stellenwertsysteme mit anderer Basis (Binär, Hexadezimal, römisch), umrechnen. | 2 | SL 6, SN W3 |
| 19 | **Integrationsregeln** (`integrationsregeln`) | 12 | Stammfunktionen aus den Ableitungsregeln, lineare Verkettung, Formansatz, partielle Integration und Substitution mit Probe durch Ableiten. | 1 | HE Q1.1.4, HE Q1.1.5, HE Q1.1.6, HE Q1.4.1, HE Q1.4.2, HE Q1.4.3 |
| 20 | **Fläche zwischen Graphen** (`flaeche-zwischen-graphen`) | 12 | Fläche zwischen zwei Graphen, Grenze oder Parameter rückwärts suchen, uneigentliche Integrale, Integral als Bestand deuten. | 1 | HE Q1.2.1, HE Q1.2.3, HE Q1.2.5 |
| 21 | **Poisson- und Exponentialverteilung** (`poisson-verteilung`) | 13 | Seltene Ereignisse, Poisson als Näherung der Binomialverteilung, Wartezeiten. | 1 | HE Q3.5.3, HE Q3.5.5, HE Q3.5.6 |
| 22 | **Chaos und Fraktale** (`chaos-fraktale`) | 11–13 | Feigenbaum-Diagramm, Sierpinski-Dreieck und Koch-Kurve, empfindliche Abhängigkeit vom Startwert. | 1 | SN GK-W3, SN LK-W3 |
| 23 | **Folgen und Reihen** (`folgen-reihen`) | 11 | Arithmetische und geometrische Folgen und Reihen, Grenzwert mit ε-Streifen. | 1 | HE E.7.1, HE E.7.2 |
| 24 | **Geld und Zeitspannen** (`geld-und-zeit`) | 5 | Zeitstrahl für Zeitpunkte und Zeitspannen, Geldbeträge in Euro und Cent. | 1 | HE 3.2.3, HE 3.2.4 |
| 25 | **Kreise in der analytischen Geometrie** (`kreisgleichung`) | 11–12 | Kreisgleichung, Lage von Punkt, Gerade und zweitem Kreis, Tangenten. | 1 | ST gA-2.2, ST eA-2.2 |
| 26 | **Räuber-Beute-Modell** (`raeuber-beute`) | 11–13 | Zwei Populationen beeinflussen sich, Zeitverlauf und Phasendiagramm. | 1 | SN GK-W3, SN LK-W3 |
| 27 | **Aussagenlogik** (`aussagenlogik`) | 8 | Wahrheitstafeln und Logikgatter (UND, ODER, NICHT, NAND, NOR). | 1 | SL 7 |
| 28 | **Funktionen an Daten anpassen** (`funktion-anpassen`) | 10–11 | Messpunkte eintragen, lineare oder quadratische Funktion anpassen, Modell bewerten. | 1 | HE E.1.3 |
| 29 | **Funktionen mit zwei Variablen** (`funktion-zwei-variablen`) | 12 | Fläche im Raum, Schnitte und Höhenlinien, partielle Ableitungen. | 1 | SN LK-W4 |
| 30 | **Goldener Schnitt** (`goldener-schnitt`) | 9 | Teilungsverhältnis, Konstruktion, goldenes Rechteck und Spirale. | 1 | SN W1 |
| 31 | **Gütefunktion beim Hypothesentest** (`guetefunktion`) | 13 | Wahrscheinlichkeit für Beibehalten oder Verwerfen abhängig vom wahren p (Operationscharakteristik). | 1 | HE Q3.3.2 |
| 32 | **Hypergeometrische Verteilung** (`hypergeometrisch`) | 12 | Ziehen ohne Zurücklegen (Lotto, Qualitätskontrolle), Vergleich mit der Binomialverteilung. | 1 | SH S.3 |
| 33 | **Lineare Optimierung** (`lineare-optimierung`) | 8 | Bedingungen als Halbebenen, Zielgerade verschieben bis zum Optimum. | 1 | SN W2 |
| 34 | **Mathematische Strategiespiele** (`strategiespiele`) | 5 | Nim und ähnliche Spiele: Gewinnstrategie finden. | 1 | SN W2 |
| 35 | **Optische Täuschungen** (`optische-taeuschungen`) | 6 | Gleich lange Linien, die verschieden wirken, unmögliche Figuren, nachmessen. | 1 | SN W2 |
| 36 | **Platonische Körper** (`platonische-koerper`) | 7 | Die fünf regulären Polyeder drehen und abzählen, Eulerscher Polyedersatz. | 1 | SN W3 |
| 37 | **Polynomdivision** (`polynomdivision`) | 11 | Polynom durch (x − a) teilen, Schritt für Schritt; abgespaltene Nullstelle am Graphen. | 1 | HE E.6.1 |
| 38 | **Rechengesetze** (`rechengesetze`) | 5–6 | Vertauschen, Klammern, Ausklammern am Punktefeld; geschicktes Rechnen. | 1 | HE 1.2.2 |
| 39 | **Schattenwurf und Projektion** (`schattenwurf`) | 12–13 | Schatten eines Körpers auf eine Ebene bei Parallel- und Punktlicht, Projektion auf Koordinatenebenen. | 1 | HE Q2.3.11 |
| 40 | **Steckbriefaufgaben** (`steckbrief`) | 11–12 | Aus Bedingungen (Punkt, Extrempunkt, Steigung) eine ganzrationale Funktion bestimmen; Bedingungen ziehen den Graphen. | 1 | HE E.3.2 |
| 41 | **Zusammengesetzte Körper** (`zusammengesetzte-koerper`) | 9–10 | Alltagsgegenstände aus Grundkörpern zusammensetzen, Volumen und Oberfläche. | 1 | HE 2.2.2 |

## A · Neue Simulationen: Physik (52)

| # | Simulation (Vorschlag für die Kennung) | Klasse | Was man darin macht | Länder | Deckt ab |
| --- | --- | --- | --- | --- | --- |
| 1 | **Magnete und Kompass** (`magnete`) | 5–7 | Pole, Anziehung und Abstoßung, Feldlinien mit Kompassnadeln, Elementarmagnete, Erdmagnetfeld. | 7 | BW 3.1.8, BY 1.1, HE 7.1, NI 1, NW 2.3, NW 2.4, ST 5, SH 2.2 |
| 2 | **Zeitdilatation und Längenkontraktion** (`zeitdilatation`) | 11–13 | Lichtuhr im fahrenden Zug, Gleichzeitigkeit, Massenzunahme und E = m·c². | 6 | BY 3.2, HE Q4.4.1, HE Q4.4.2, HE Q4.4.4, NW EF-2.3, RP GF-W.17, RP GF-W.18, RP LF-W.15, RP LF-W.16, SN GK-W3, SN LK-W1, ST eA-3.1 |
| 3 | **Energieversorgung** (`energieversorgung`) | 7–13 | Kraftwerke und erneuerbare Quellen, Strommix über den Tag, Speicher, Netz und Hochspannung. | 6 | BY 3.3, HE 8.1, HE 8.2, HE 8.3, HE 8.4, NW 11.2, RP GF-W.16, RP LF-W.14, SN W2, SH 1.3 |
| 4 | **Sterne und Hertzsprung-Russell-Diagramm** (`hr-diagramm`) | 7–13 | Leuchtkraft und Temperatur, Lebensweg eines Sterns, Entfernung in Lichtjahren, Parallaxe. | 6 | BW 3.5.7, BY A4, HH 4.2, HE Q4.6.4, HE Q4.6.5, NW 6.2, RP GF-W.19, RP LF-W.17 |
| 5 | **Elektromagnetische Wellen und Spektrum** (`em-spektrum`) | 10–13 | Vom Radio bis Gamma: Wellenlänge, Frequenz, Anwendungen; Antenne und Modulation. | 6 | HB 4, HE Q3.1.1, NW GK-4.1, RP GF-W.5, RP LF-W.5, SL 3.4, SN W2 |
| 6 | **Wärmeleitung, Strömung und Strahlung** (`waermetransport`) | 5–9 | Wärme fließt vom Warmen zum Kalten, Dämmstoffe vergleichen, Haus dämmen. | 6 | BW 3.1.4, BY 3.2, HE 5.1, NW 1.2, RP 8, SN W2 |
| 7 | **Diode und Transistor** (`diode-transistor`) | 9–13 | Kennlinien aufnehmen, Gleichrichter, Transistor als Schalter und Verstärker. | 5 | BY 5.1, HE Q4.5.2, HE Q4.5.4, NI 8, RP GF-W.7, RP LF-W.7, SN 1, SN GK-W1, SN LK-W2 |
| 8 | **Alpha-, Beta- und Gammastrahlung** (`strahlungsarten`) | 9–13 | Reichweite und Abschirmung, Geiger-Müller-Zählrohr, Dosis und Strahlenschutz. | 5 | HE 9.2, HE Q4.3.1, NI Q-5.2, NW 10.2, NW GK-4.1, NW LK-4.2, RP GF-W.12, SH 5.1 |
| 9 | **Dichte, Schwimmen und Auftrieb** (`dichte-auftrieb`) ✅ fertig (PR #203) | 7–8 | Körper ins Wasser legen: Schwimmen, Schweben, Sinken; Archimedes, Heißluftballon. | 5 | BY 1.1, HE 1.1, HE 7.2, SN 1, SN W1, ST 4, SH 4.1 |
| 10 | **Expandierendes Universum** (`hubble`) | 11–13 | Rotverschiebung und Hubble-Beziehung, Alter des Universums, Hintergrundstrahlung. | 5 | BW 3.5.7, BY A5, HH 4.2, HE Q4.6.2, HE Q4.6.3, RP GF-W.20, RP LF-W.18 |
| 11 | **Druck in Flüssigkeiten und Gasen** (`druck`) | 7–9 | Schweredruck und Tiefe, Luftdruck, Druck messen, Wetter als Ausgleich von Druckunterschieden. | 5 | HE 5.6, HE 5.3, NW 8.2, SL 3, SN 1, ST 4 |
| 12 | **Treibhauseffekt und Strahlungsbilanz** (`treibhauseffekt`) | 9–11 | Ein- und ausgehende Strahlung, Albedo, Treibhausgase, Gleichgewichtstemperatur, Rückkopplungen. | 5 | BW 3.2.6, BY 3.2, BY 4.1, NI EF-2.4, ST 4, SH 3.5 |
| 13 | **Messen und Messunsicherheit** (`messunsicherheit`) | 5–13 | Größen mit Einheiten messen, Messreihe, Mittelwert, Streuung und Fehlerbalken, Ausgleichsgerade. | 4 | BW 3.1.1, BW 3.2.1, HE 1.2, HE 1.2, SN GK-2, SN LK-3, ST 1, ST 5, ST gA-4.1, ST eA-4.1 |
| 14 | **Einzelne Photonen im Interferometer** (`mach-zehnder`) | 12–13 | Mach-Zehnder-Interferometer mit einzelnen Photonen: Welcher-Weg-Information, Superposition, Delayed Choice. | 4 | BY 1.2, BY E1.2, HE Q4.1.3, HE Q4.1.5, HE Q4.1.7, NI Q-3.2, NW GK-2.3 |
| 15 | **Magnetfeld von Leiter und Spule** (`magnetfeld-spule`) | 8–12 | Feld um Leiter und in Spulen, Flussdichte, Elektromagnet, Relais und Elektromotor. | 4 | HH 1.3, HE 7.3, HE Q1.2.1, HE Q1.2.2, SL 1.3, SN GK-3, SN LK-6 |
| 16 | **Schall: Tonhöhe und Lautstärke** (`schall`) | 5–11 | Schwingung auf dem Oszilloskop, Frequenz und Amplitude, Schallausbreitung, Sender und Empfänger, Lärm. | 4 | BW 3.1.2, HE 2.1, HE 2.2, HE 2.1, NI EF-2.1, NW 3.1, NW 3.2 |
| 17 | **Teilchen im Potenzialtopf** (`potentialtopf`) | 12–13 | Stehende Wellen im Topf, Energieniveaus, Aufenthaltswahrscheinlichkeit, Orbitale; Nukleonen im Kern. | 4 | BY 4.1, BY E4.1, HE Q4.1.1, HE Q4.1.4, HE Q4.3.5, NI Q-5.2, SH Q.2 |
| 18 | **Bindungsenergie, Kernspaltung und Fusion** (`kernspaltung`) | 9–13 | Bindungsenergie je Nukleon, Massendefekt, Kettenreaktion, Fusion in der Sonne. | 4 | BY 4.1, HE Q4.3.3, HE Q4.6.4, NW 10.3, NW LK-4.4, SH 5.3 |
| 19 | **Wärmekraftmaschine und Entropie** (`waermekraftmaschine`) | 11–13 | Kreisprozess, Wirkungsgrad nach Carnot, Wärmepumpe und Kühlschrank, umkehrbare und nicht umkehrbare Vorgänge. | 4 | BY 3.3, HE E.6.2, HE E.6.3, HE E.6.4, RP GF-W.14, SN W2 |
| 20 | **Erwärmen: spezifische Wärmekapazität** (`waermekapazitaet`) | 5–9 | Temperatur und Wärme, verschiedene Stoffe erwärmen, innere Energie. | 4 | BW 3.2.6, BY 3.2, HE E.6.1, NW 1.1 |
| 21 | **Leiter, Halbleiter und Bändermodell** (`baendermodell`) | 11–13 | Bänder und Lücke, Dotierung, Leitfähigkeit und Temperatur, Supraleitung qualitativ. | 3 | HE Q4.5.1, HE Q4.5.3, HE Q4.5.5, RP GF-W.8, RP LF-W.8, SN GK-W1, SN LK-W2 |
| 22 | **Methode der kleinen Schritte** (`methode-kleine-schritte`) | 10–12 | Bewegungen schrittweise berechnen: Fall mit Luftwiderstand, Reibung, Grenzgeschwindigkeit; mit Messdaten vergleichen. | 3 | BY 4.1, HE E.1.5, HE E.4.2, HE E.4.3, SN GK-W2, SN LK-4 |
| 23 | **Energieketten und Entwertung** (`energieketten`) | 5–8 | Energieflussdiagramm (Sankey): Energie bleibt erhalten, ein Teil geht als Wärme in die Umgebung. | 3 | BW 3.1.4, HE 3.1, HE 3.2, HE 3.3, NI 4 |
| 24 | **Farben und Farbmischung** (`farben`) | 5–10 | Prisma, additive (RGB) und subtraktive (CMYK) Mischung, Bildschirmpixel, Infrarot und UV. | 3 | NW 5.3, SN W3, SN W3, SH 3.4 |
| 25 | **Standardmodell der Teilchen** (`standardmodell`) | 12–13 | Quarks, Leptonen und Austauschteilchen, Teilchen aus Quarks zusammensetzen, Paarbildung. | 3 | BY E3, HB 8, RP GF-W.13, RP LF-W.13 |
| 26 | **Strömung und Tragflügel** (`stroemung`) | 7–13 | Kontinuitätsgleichung, Bernoulli, Anstellwinkel und dynamischer Auftrieb. | 3 | RP GF-W.22, RP LF-W.20, SN W3, ST 4 |
| 27 | **Elektromagnetischer Schwingkreis** (`schwingkreis`) | 11–13 | Energie pendelt zwischen Kondensator und Spule, Thomson-Gleichung, Dämpfung, Vergleich mit dem Federpendel. | 2 | HB 4, HE Q2.2.5, HE Q2.2.9, HE Q2.2.10 |
| 28 | **Newtonsche Gesetze** (`newtonsche-gesetze`) | 9–11 | Wagen auf der Fahrbahn: Trägheit, F = m·a, Kraft und Gegenkraft. | 2 | HE 6.1, HE 6.2, HE E.2.1, NI EF-1.2 |
| 29 | **Raum-Zeit-Diagramm** (`minkowski`) | 12–13 | Minkowski-Diagramm, Lorentz-Transformation, Addition von Geschwindigkeiten. | 2 | HE Q4.4.3, RP GF-W.17, RP LF-W.2, RP LF-W.15 |
| 30 | **Doppelpendel und Chaos** (`doppelpendel`) | 12–13 | Zwei fast gleiche Starts laufen auseinander: begrenzte Vorhersagbarkeit, Attraktoren. | 2 | RP GF-W.21, RP LF-W.19, SN LK-W2 |
| 31 | **Generator und Transformator** (`generator-transformator`) | 9–12 | Drehende Spule erzeugt Wechselspannung, Transformator mit Windungszahlen, Hochspannungsleitung. | 2 | HE 8.3, HE Q2.2.4, NI 8 |
| 32 | **Ladungen und Coulomb-Gesetz** (`ladungen-coulomb`) | 8–12 | Aufladen, Anziehung und Abstoßung, Elektroskop, Kraft zwischen Punktladungen. | 2 | HE 4.3, HE Q1.1.4, NW 9.1 |
| 33 | **Solarzelle** (`solarzelle`) | 8–11 | U-I-Kennlinie, Punkt maximaler Leistung, Reihe und parallel, Neigung und Schatten. | 2 | BY 4.1, BY 4.2, SN W2 |
| 34 | **Wechselstromkreise** (`wechselstrom`) | 12–13 | Effektivwerte, Widerstand von Spule und Kondensator, Phasenverschiebung im Zeigerdiagramm. | 2 | RP GF-W.6, RP LF-W.6, ST eA-2.4 |
| 35 | **Elektrische Energie und Leistung** (`elektrische-leistung`) | 8–9 | Geräte vergleichen, Leistung, Energie und Stromkosten, Wirkungsgrad. | 2 | BY 1.2, NW 9.3 |
| 36 | **Nuklidkarte und Zerfallsreihen** (`nuklidkarte`) | 12–13 | Nuklide auf der Karte, Zerfallsarten als Sprünge, Zerfallsreihen. | 2 | BY E4.1, NI Q-5.2 |
| 37 | **Röntgenstrahlung** (`roentgen`) | 12–13 | Röntgenröhre, Bremsspektrum und charakteristische Linien, Moseley-Gesetz, Bragg-Reflexion. | 2 | BY E3, HE Q3.3.4 |
| 38 | **Sensoren** (`sensoren`) | 8–10 | Temperatur, Licht oder Druck werden zu Spannung: Kennlinie eines Sensors nutzen. | 2 | RP 11, SN W3 |
| 39 | **Unbestimmtheitsrelation** (`unschaerfe`) | 12–13 | Engerer Spalt, breiteres Beugungsbild: Ort und Impuls nicht gleichzeitig scharf. | 2 | BY E1.2, HE Q4.1.6 |
| 40 | **Weltbilder und Schleifenbahnen** (`weltbilder`) | 11–13 | Geo- und heliozentrisches Modell, Schleifenbahn des Mars am Himmel, Sternbilder. | 2 | BY A1, NW EF-2.3 |
| 41 | **Wirkungen des Stroms und Sicherung** (`stromwirkungen`) | 5–8 | Wärme-, Licht- und magnetische Wirkung, Kurzschluss, Sicherung, Gefahren. | 2 | HE 4.3, NW 2.2 |
| 42 | **Selbstinduktion** (`selbstinduktion`) | 12 | Ein- und Ausschalten einer Spule, Induktivität, Energie im Magnetfeld. | 1 | HE Q2.2.3, HE Q2.2.7, HE Q2.2.8 |
| 43 | **Drehimpuls und Trägheitsmoment** (`drehimpuls`) | 11 | Pirouette: Arme anziehen, schneller drehen; Trägheitsmoment verschiedener Körper. | 1 | HE E.7.2, HE E.7.3 |
| 44 | **Geladene Teilchen im elektrischen Feld** (`teilchen-im-e-feld`) | 12 | Beschleunigen und Ablenken im Kondensator, Millikan-Versuch, Vergleich mit dem waagerechten Wurf. | 1 | HE Q1.1.5, HE Q1.1.9 |
| 45 | **Tunneleffekt** (`tunneleffekt`) | 13 | Teilchen an einer Barriere, Rastertunnelmikroskop, Alphazerfall. | 1 | HE Q4.2.2, HE Q4.3.5 |
| 46 | **Wärmeausdehnung und Anomalie des Wassers** (`waermeausdehnung`) | 6–8 | Stoffe dehnen sich beim Erwärmen aus; Wasser ist bei 4 °C am dichtesten, Folgen für Seen. | 1 | HE 5.4, HE 5.5 |
| 47 | **Arbeit und Leistung** (`arbeit-leistung`) | 8–10 | Eigene Leistung beim Treppensteigen bestimmen, mit Maschinen vergleichen. | 1 | HE 6.4 |
| 48 | **Compton-Effekt** (`compton`) | 13 | Photon stößt Elektron, Wellenlänge des Photons ändert sich mit dem Winkel. | 1 | HE Q3.2.3 |
| 49 | **Einzelspalt und Interferometer** (`einzelspalt`) | 12–13 | Beugungsbild am Einzelspalt, Michelson-Interferometer. | 1 | HE Q3.1.5 |
| 50 | **Laser** (`laser`) | 13 | Besetzungsinversion, stimulierte Emission, Lichtverstärkung im Resonator. | 1 | HE Q4.2.1 |
| 51 | **Mondphasen und Finsternisse** (`mondphasen`) | 5–7 | Sonne, Erde und Mond bewegen: Phasen, Sonnen- und Mondfinsternis. | 1 | HE 2.5 |
| 52 | **Polarisation und Totalreflexion** (`polarisation`) | 12–13 | Polarisationsfilter drehen, Totalreflexion im Lichtleiter. | 1 | HE Q3.1.2 |

## B · Vorhandene Simulationen, die schon passen

Hier fehlt nur der Eintrag im Länder-Lehrplan (`simulations: [...]`). Bei „prüfen“ zuerst nachsehen, ob die Simulation den Punkt wirklich zeigt, sonst erweitern.

| Simulation | Deckt ab | Hinweis |
| --- | --- | --- |
| `baumdiagramm` | HE Q3.1.3 |  |
| `boxplot` | BE 5.1, BB 5.1 |  |
| `brechung` | HE Q3.1.4 |  |
| `cavalieri` | SL 2 | zusammen mit prisma-zylinder und pyramide-kegel-kugel |
| `diagramme` | BE 5.1, HE 1.1.9 |  |
| `doppelspalt` | HE Q4.1.2 |  |
| `dreieckskonstruktion` | HE 2.1.2 |  |
| `e-funktion` | HE E.4.2 |  |
| `einheiten` | BE 2.1, BE 2.1, BB 2.1, HE 3.1.1, HE 3.1.3 |  |
| `exponentielles-wachstum` | HE E.4.1 |  |
| `federpendel` | HE Q2.1.3, HE Q2.1.5 | prüfen: Dämpfung einstellbar? |
| `feldlinien` | HE Q1.1.8 |  |
| `funktion-zuordnung` | HE 4.1.1, HE 4.1.2, HE 4.1.1 |  |
| `funktionenscharen` | HE Q4.1.4 |  |
| `geraden-ebenen` | HE Q2.3.15, HE Q2.3.16 | prüfen: Scharen |
| `gesetz-grosse-zahlen` | HE Q3.1.1, HE Q3.5.1, NW 4.2 |  |
| `gleichungen-grafisch` | HE E.1.2 |  |
| `koordinaten-lage` | HE 1.1.5, HE 2.1.5 |  |
| `kreisbewegung` | SN W3 |  |
| `lage-abstaende` | HE Q2.3.8, HE Q2.3.9 | prüfen: Schnittwinkel, Parameter |
| `licht-schatten` | NW 4.1 | prüfen: Lochkamera |
| `linienspektren` | BY 2, SH W.4 |  |
| `linsen` | NI EF-2.3 |  |
| `logarithmus` | HE Q2.1.5 |  |
| `lorentzkraft` | HE Q1.2.5, HE Q1.2.6 | prüfen: Hall-Effekt, Zyklotron |
| `matrix-abbildungen` | HE Q2.4.2, HE Q2.5.2 |  |
| `planetenbahnen` | HE E.5.1 |  |
| `proportional` | BE 4.2 |  |
| `prozentstreifen` | HE 1.2.7 | prüfen: mehrere Änderungen nacheinander? |
| `quadratwurzel` | BE 1.1, BB 1.1 | zusammen mit kreiszahl-pi |
| `spiegelung` | BE 3.2, BB 3.2 |  |
| `transformationen` | HE Q2.1.2 |  |
| `vergroessern` | BE 3.2, BB 3.2 |  |
| `wellen-ausbreitung` | HE Q2.3.3 |  |
| `winkel-messen` | HE 3.1.2 | prüfen: Minuten und Sekunden? |
| `zaehlprinzip` | HE Q3.1.6 |  |
| `zahlengerade` | HE 1.1.9, HE 1.1.1, HE 1.1.3, HE 1.1.4, NI 5.3 |  |
| `zehnerpotenzen` | BE 2.1, BB 2.1 |  |

## C · Keine Simulation sinnvoll

Methoden, Praktika, Wahl- und Projektthemen ohne festen Inhalt. Vorschlag: im Lehrplan als „Methode“ kennzeichnen, damit sie nicht mehr als Lücke zählen.

| Land | Nr. | Lernbereich |
| --- | --- | --- |
| BW | 3.2.2 | Leitidee Messen (keine Inhalte in den Klassen 7/8) |
| BW | 3.5.3 (8) | vektorielle Darstellungen beim Beweisen nutzen |
| BW | 3.4.1 | Denk- und Arbeitsweisen der Physik (Basisfach mit Schwerpunkt Quantenphysik) |
| BW | 3.5.1 | Denk- und Arbeitsweisen der Physik (Basisfach mit Schwerpunkt Astrophysik) |
| BW | 3.6.1 | Denk- und Arbeitsweisen der Physik (nur Leistungsfach) |
| BW | 3.6.7 | Vertiefendes Themengebiet (nur Leistungsfach) |
| BY | 4.2 | Vertiefung prozessbezogener Kompetenzen anhand ausgewählter weiterer Inhalte |
| BY | 4.3 | Außerunterrichtliche Aktivität |
| BE | Q4.3 | Komplexe Aufgabenstellungen aus allen drei Sachgebieten |
| BB | Q4.3 | Komplexe Aufgabenstellungen aus allen drei Sachgebieten |
| HH | 11 | Üben und Vertiefen |
| HE | Q4.2.1 | Erkennen und Formulieren mathematischer Probleme |
| HE | Q4.2.2 | Anwenden heuristischer Strategien und Prinzipien zur Lösung mathematischer Probleme |
| HE | Q4.2.3 | Beurteilen vorgegebener Aussagen oder Stellung nehmen zu vorgegebenen Aussagen |
| HE | Q4.2.4 | Nachvollziehen, Erläutern und Entwickeln von Argumentationen und logischen Schlussfolgerungen |
| HE | Q4.2.5 | Anwendung auf exemplarisch durch die Lehrkraft ausgewählte Themenfelder |
| HE | 9.1 | Verantwortung gegenüber der Umwelt |
| HE | 9.2 | Rolle der Physik bei Umwelt- und Naturereignissen |
| HE | 1.1 | Besonderheiten und Gemeinsamkeiten der Physik, Chemie und Biologie |
| HE | 9.3 | Konsequenzen der Nutzung physikalischer Forschungsergebnisse |
| RP | 6 | Funktionaler Zusammenhang |
| RP | 7 | Kosmos und Forschung |
| RP | 12 | Praxis und Forschung |
| RP | GF-W.23 | Physik als sich weiterentwickelnde Wissenschaft |
| RP | GF-W.24 | Individuelles Thema |
| RP | LF-W.21 | Individuelles Thema |
| SL | 8 | Vertiefung der regulären Themenfelder (nur Informatik-Zweig) |
| SL | 6 | Wahlthema oder Praktikum |
| SL | 3 | Wahlthema oder Praktikum |
| SN | W1 | Dynamisieren geometrischer Objekte (Wahlbereich) |
| SN | W1 | Finden von Vermutungen mit dynamischer Geometrie (Wahlbereich) |
| SN | W1 | Tabellenkalkulation – ein mathematisches Werkzeug (Wahlbereich) |
| SN | 5 | Vernetzung: Heuristische Strategien |
| SN | W1 | Programmierung mathematischer Algorithmen (Wahlbereich) |
| SN | 5 | Vernetzung: Mathematik und moderne Rechentechnik |
| ST | gA-4.2 | Aufgabenpraktikum |
| ST | eA-4.2 | Aufgabenpraktikum |
| SH | 2.4 | Sachaufgaben |

