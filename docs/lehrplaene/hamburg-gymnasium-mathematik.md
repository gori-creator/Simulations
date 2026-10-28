# Hamburg · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Bildungspläne Sekundarstufe I und Studienstufe |
|---|---|
| Bundesland | Hamburg |
| Schulart | Gymnasium, Jahrgangsstufen 5–12 |
| Fach | Mathematik |
| Name des Lehrplans (Sek. I) | „Bildungsplan Gymnasium Sekundarstufe I, Mathematik“, Herausgeber: Freie und Hansestadt Hamburg, Behörde für Schule und Berufsbildung |
| Jahr / Stand (Sek. I) | Hamburg 2022 |
| Name des Lehrplans (Studienstufe) | „Bildungsplan Studienstufe, Mathematik“, Behörde für Schule und Berufsbildung |
| Jahr / Stand (Studienstufe) | Hamburg 2022 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `hamburg_mathe_sek_1.pdf` (S. 1–50) und `hamburg_mathe_sek_1_teil_2.pdf` (S. 51–97), `mathematik-gyo-2022-data.pdf` (39 Seiten) |
| Link laut Dokument | „www.hamburg.de/bildungsplaene“ (letzte Seite); in `sourceUrl` `https://www.hamburg.de/bildungsplaene`, kein Link zur einzelnen Datei |
| G8/G9 | G8 am Gymnasium: Sek. I 5–10 („Kerncurriculum für die Jahrgangsstufen 5 bis 10 des Gymnasiums“), Studienstufe zwei Jahre, hier 11 und 12 |
| Niveaus / Wahl | Sek. I: ein Kerncurriculum. Studienstufe: grundlegendes und erhöhtes Anforderungsniveau (eA kursiv); im zweiten Jahr eines der Wahlpflichtmodule 6 (Analytische Geometrie) oder 7 (Lineare Algebra) |
| Struktur | Sek. I: Unterrichtsmodule je Doppeljahrgang (5/6: 16, 7/8: 14, 9/10: 13), nach Leitideen gegliedert, in 9/10 in fester Reihenfolge (Kap. 2.3). Studienstufe: Module 1.1, 1.2, 2, 3 im ersten Jahr, 4, 5 und 6 oder 7 im zweiten Jahr (Kap. 2.3) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Doppeljahrgang 5/6 | 5, 6 | 16 | 0 | 16 | 22 |
| Doppeljahrgang 7/8 | 7, 8 | 14 | 0 | 14 | 30 |
| Doppeljahrgang 9/10 | 9, 10 | 13 | 0 | 12 | 30 |
| Studienstufe, erstes Jahr (S1/S2, Jahrgangsstufe 11) | 11 | 4 | 0 | 4 | 24 |
| Studienstufe, zweites Jahr (S3/S4, Jahrgangsstufe 12) | 12 | 4 | 0 | 3 | 14 |

Insgesamt verwendet: **89 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `taylor-polynome`, `fourier-reihen`, `kugeln`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Doppeljahrgang 5/6  
*Grades 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Bildungsplan Gymnasium Sek. I Mathematik (2022), Kap. 2.3, S. 43–59)

> Doppeljahrgang 5/6: Der Bildungsplan gliedert das Kerncurriculum in Unterrichtsmodule je Doppeljahrgang; innerhalb von 5/6 ist die Reihenfolge frei. Die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Die Nummern sind die Modulnummern des Bildungsplans.

### 1 Beschreibende Statistik I
*EN: Descriptive statistics I*

- Kurz (DE): Daten sammeln und ordnen, Strich- und Ranglisten, Umfragen, Häufigkeitstabellen und Diagramme, Durchschnitt und Zentralwert.
- Kurz (EN): Collecting and ordering data, tally and rank lists, surveys, frequency tables and charts, mean and median.
- Simulationen: `diagramme`
- Jahrgänge je Simulation: `diagramme` (6)

### 2 Natürliche Zahlen
*EN: Natural numbers*

- Kurz (DE): Stellenwertsystem bis eine Million, Zahlenstrahl, Runden, Quadratzahlen und Potenzschreibweise, Grundrechenarten, Rechenregeln und Rechenbäume, erste negative Zahlen.
- Kurz (EN): The place value system up to one million, the number line, rounding, square numbers and powers, the four operations, rules of arithmetic and calculation trees, first negative numbers.
- Simulationen: `stellenwerte`, `zahlengerade`, `termbaum`, `zehnerpotenzen`
- Jahrgänge je Simulation: `stellenwerte` (5), `zahlengerade`, `termbaum`, `zehnerpotenzen`

### 3 Teilbarkeit
*EN: Divisibility*

- Kurz (DE): Gerade und ungerade Zahlen, Teiler und Teilbarkeitsregeln mit Begründung, Primzahlen.
- Kurz (EN): Even and odd numbers, divisors and divisibility rules with reasons, prime numbers.
- Simulationen: `primfaktoren`

### 4 Ebene Figuren und Koordinatensystem
*EN: Plane figures and the coordinate system*

- Kurz (DE): Punkt, Strecke, Strahl und Gerade, parallel und senkrecht, Punkte und Figuren im Koordinatensystem, Lagepläne, Parallelogramm, Rechteck und Quadrat.
- Kurz (EN): Point, segment, ray and line, parallel and perpendicular, points and figures in the coordinate system, site plans, parallelogram, rectangle and square.
- Simulationen: `koordinaten-lage`, `vierecke`
- Jahrgänge je Simulation: `koordinaten-lage` (5), `vierecke`

### 5 Körper
*EN: Solids*

- Kurz (DE): Kopfgeometrie und Würfelbauten, Körper unterscheiden und beschreiben, Netze, Schrägbilder und Modelle von Würfel, Quader und Dreiecksprisma.
- Kurz (EN): Mental geometry and cube buildings, telling solids apart and describing them, nets, oblique drawings and models of cube, cuboid and triangular prism.
- Simulationen: `koerpernetze`

### 6 Brüche, Anteile und Prozente
*EN: Fractions, parts and percentages*

- Kurz (DE): Brüche als Anteile, am Bruchstreifen und Zahlenstrahl, ordnen und vergleichen, kürzen und erweitern, Prozentdarstellung und Prozentstreifen.
- Kurz (EN): Fractions as parts, on fraction strips and the number line, ordering and comparing, simplifying and expanding, percentages and percentage strips.
- Simulationen: `bruchteile`, `brueche-vergleichen`, `prozentstreifen`
- Jahrgänge je Simulation: `bruchteile`, `brueche-vergleichen`, `prozentstreifen` (6)

### 7 Positive Zahlen in Dezimalschreibweise
*EN: Positive numbers in decimal notation*

- Kurz (DE): Stellenwertsystem nach rechts erweitern, Dezimalzahlen am Zahlenstrahl, ordnen, runden, addieren und subtrahieren.
- Kurz (EN): Extending place value to the right, decimals on the number line, ordering, rounding, adding and subtracting.
- Simulationen: `zahlengerade`, `dezimalbrueche`
- Jahrgänge je Simulation: `zahlengerade`, `dezimalbrueche` (6)

### 8 Mit Größen in Kontexten rechnen
*EN: Calculating with quantities in context*

- Kurz (DE): Zeit, Länge und Masse messen und schätzen, Einheiten umformen, Vorsätze von Nano bis Giga und Zehnerpotenzen, maßstabsgetreues Zeichnen und Entfernungen auf Karten.
- Kurz (EN): Measuring and estimating time, length and mass, converting units, prefixes from nano to giga and powers of ten, drawing to scale and distances on maps.
- Simulationen: `einheiten`, `massstab`, `zehnerpotenzen`
- Jahrgänge je Simulation: `einheiten` (5), `massstab`, `zehnerpotenzen`

### 9 Flächeninhalt
*EN: Area*

- Kurz (DE): Flächen messen, Flächeneinheiten, Umfang und Flächeninhalt von Quadrat, Rechteck und rechtwinkligem Dreieck.
- Kurz (EN): Measuring area, units of area, perimeter and area of square, rectangle and right triangle.
- Simulationen: `umfang-flaeche`
- Jahrgänge je Simulation: `umfang-flaeche` (5)

### 10 Rauminhalt
*EN: Volume*

- Kurz (DE): Volumen messen, Volumeneinheiten, Volumen und Oberfläche von Würfel und Quader mit Einheitswürfeln und Netz.
- Kurz (EN): Measuring volume, units of volume, volume and surface area of cube and cuboid with unit cubes and nets.
- Simulationen: `quader-volumen`

### 11 Rechnen mit Brüchen
*EN: Calculating with fractions*

- Kurz (DE): Brüche am Bruchstreifen und Rechteckfeld addieren, subtrahieren, multiplizieren und dividieren, Sachaufgaben mit Brüchen.
- Kurz (EN): Adding, subtracting, multiplying and dividing fractions with fraction strips and rectangles, word problems with fractions.
- Simulationen: `brueche-rechnen`
- Jahrgänge je Simulation: `brueche-rechnen` (6)

### 12 Winkel und Kreis
*EN: Angles and circles*

- Kurz (DE): Winkel erkennen, benennen, schätzen, messen und zeichnen, Winkelarten, Kreise mit Mittelpunkt, Radius und Durchmesser.
- Kurz (EN): Recognising, naming, estimating, measuring and drawing angles, types of angle, circles with centre, radius and diameter.
- Simulationen: `winkel-messen`
- Jahrgänge je Simulation: `winkel-messen` (5)

### 13 Abbildungen und Symmetrien
*EN: Transformations and symmetry*

- Kurz (DE): Achsen-, Punkt- und Drehsymmetrie, Spiegeln an Achse und Punkt, Verschieben, eigene symmetrische Muster.
- Kurz (EN): Line, point and rotational symmetry, reflecting in a line and a point, translation, own symmetric patterns.
- Simulationen: `spiegelung`

### 14 In Dezimalschreibweise rechnen
*EN: Calculating in decimal notation*

- Kurz (DE): Multiplizieren und dividieren mit Zehnerpotenzen und Dezimalzahlen, schriftlich und im Kopf, Überschlag, Wechsel zwischen Bruch- und Dezimalschreibweise.
- Kurz (EN): Multiplying and dividing with powers of ten and decimals, on paper and mentally, estimating, switching between fraction and decimal notation.
- Simulationen: `zehnerpotenzen`, `dezimalbrueche`
- Jahrgänge je Simulation: `zehnerpotenzen`, `dezimalbrueche` (6)

### 15 Schaubilder
*EN: Graphs*

- Kurz (DE): Zusammenhänge zwischen zwei Größen aus dem Alltag, Wertepaare eintragen und ablesen, Skalierung, Verlauf von Graphen qualitativ beschreiben.
- Kurz (EN): Relationships between two everyday quantities, plotting and reading pairs of values, scaling, describing the shape of graphs qualitatively.
- Simulationen: `funktion-zuordnung`
- Jahrgänge je Simulation: `funktion-zuordnung` (6)

### 16 Zufall und Statistik
*EN: Chance and statistics*

- Kurz (DE): Sicher, unmöglich, wahrscheinlich, Zufallsexperimente planen und durchführen, relative Häufigkeiten und Kreisdiagramme, Vorhersagen bei großen Wurfzahlen.
- Kurz (EN): Certain, impossible, likely, planning and carrying out random experiments, relative frequencies and pie charts, predictions for many throws.
- Simulationen: `gesetz-grosse-zahlen`, `diagramme`
- Jahrgänge je Simulation: `gesetz-grosse-zahlen` (6), `diagramme` (6)

## Doppeljahrgang 7/8  
*Grades 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: Bildungsplan Gymnasium Sek. I Mathematik (2022), Kap. 2.3, S. 60–79)

> Doppeljahrgang 7/8: Unterrichtsmodule des Kerncurriculums, innerhalb des Doppeljahrgangs in freier Reihenfolge; die Lernbereiche stehen deshalb bei 7 und 8 gleich und werden als eine Stufe gezeigt. Die Nummern sind die Modulnummern des Bildungsplans.

### 1 Positive und negative rationale Zahlen
*EN: Positive and negative rational numbers*

- Kurz (DE): Negative Zahlen im Alltag und am Zahlenstrahl, Vorzeichen und Betrag, ordnen, die vier Grundrechenarten mit Vorzeichenregeln.
- Kurz (EN): Negative numbers in everyday life and on the number line, sign and absolute value, ordering, the four operations with sign rules.
- Simulationen: `zahlengerade`
- Jahrgänge je Simulation: `zahlengerade` (7)

### 2 Funktionen und Dreisatz
*EN: Functions and the rule of three*

- Kurz (DE): Abhängige Größen messen und darstellen, proportionale und antiproportionale Zuordnungen, Darstellungswechsel zwischen Sprache, Tabelle, Graph und Term, Dreisatz.
- Kurz (EN): Measuring and showing dependent quantities, proportional and inversely proportional relationships, switching between words, table, graph and term, the rule of three.
- Simulationen: `proportional`, `funktion-zuordnung`, `hyperbel`
- Jahrgänge je Simulation: `proportional`, `funktion-zuordnung`, `hyperbel` (8)

### 3 Prozent- und Zinsrechnung
*EN: Percentages and interest*

- Kurz (DE): Grundwert, Prozentwert und Prozentsatz am Prozentstreifen, Rabatte, prozentuale Zu- und Abnahme, Zinsen und Zinseszins.
- Kurz (EN): Base value, percentage value and rate on a percentage strip, discounts, percentage increase and decrease, simple and compound interest.
- Simulationen: `prozentstreifen`
- Jahrgänge je Simulation: `prozentstreifen` (7)

### 4 Wahrscheinlichkeitsrechnung I
*EN: Probability I*

- Kurz (DE): Laplace-Experimente, Ergebnisse abzählen, Gegenwahrscheinlichkeit, zweistufige Baumdiagramme, Erwartungswert und faire Spiele, Simulation am Rechner.
- Kurz (EN): Laplace experiments, counting outcomes, complementary probability, two-stage tree diagrams, expected value and fair games, computer simulation.
- Simulationen: `zaehlprinzip`, `gesetz-grosse-zahlen`, `baumdiagramm`
- Jahrgänge je Simulation: `zaehlprinzip`, `gesetz-grosse-zahlen`, `baumdiagramm` (8)

### 5 Dreiecksgeometrie
*EN: Triangle geometry*

- Kurz (DE): Winkel an Geradenkreuzungen, Innenwinkelsumme, Dreiecksarten, Höhen, Mittelsenkrechten und Winkelhalbierende mit Um- und Inkreis, Konstruktionen und Kongruenz, Satz des Thales.
- Kurz (EN): Angles at intersecting lines, the angle sum, types of triangle, altitudes, perpendicular and angle bisectors with circumcircle and incircle, constructions and congruence, Thales’ theorem.
- Simulationen: `winkel-geradenkreuzung`, `winkelsumme`, `dreieckskonstruktion`, `mittelsenkrechte`, `besondere-linien`, `thales`
- Jahrgänge je Simulation: `winkel-geradenkreuzung` (7), `winkelsumme` (7), `dreieckskonstruktion` (7), `mittelsenkrechte` (7), `besondere-linien`, `thales` (7)

### 6 Terme und Gleichungen I
*EN: Terms and equations I*

- Kurz (DE): Variablen und Terme in verschiedenen Zusammenhängen aufstellen und deuten.
- Kurz (EN): Setting up and interpreting variables and terms in different contexts.
- Simulationen: `termbaum`
- Jahrgänge je Simulation: `termbaum` (7)

### 7 Vierecke
*EN: Quadrilaterals*

- Kurz (DE): Vierecksarten und ihre Eigenschaften, Vierecke im Koordinatensystem, Flächeninhalt von Parallelogramm und Trapez herleiten.
- Kurz (EN): Types of quadrilateral and their properties, quadrilaterals in the coordinate system, deriving the area of parallelogram and trapezium.
- Simulationen: `vierecke`, `flaechen-zerlegen`
- Jahrgänge je Simulation: `vierecke` (7), `flaechen-zerlegen`

### 8 Lineare Funktionen
*EN: Linear functions*

- Kurz (DE): Gleichmäßige Änderungen, konstante Änderungsrate und Startwert, Steigung und y-Achsenabschnitt, Terme und Graphen linearer Funktionen.
- Kurz (EN): Uniform change, constant rate of change and starting value, slope and y-intercept, terms and graphs of linear functions.
- Simulationen: `lineare-funktion`, `funktionsplotter`
- Jahrgänge je Simulation: `lineare-funktion`, `funktionsplotter` (8)

### 9 Kreis
*EN: Circle*

- Kurz (DE): Umfang und Flächeninhalt von Kreisen messen und berechnen, π empirisch gewinnen, Kreisteile, Näherung krummlinig begrenzter Flächen.
- Kurz (EN): Measuring and calculating the circumference and area of circles, finding π by experiment, parts of circles, approximating curved areas.
- Simulationen: `kreiszahl-pi`, `monte-carlo-pi`
- Jahrgänge je Simulation: `kreiszahl-pi`, `monte-carlo-pi` (8)

### 10 Terme und Gleichungen II
*EN: Terms and equations II*

- Kurz (DE): Lineare Gleichungen aufstellen und mit Äquivalenzumformungen lösen, nichtlineare Gleichungen und Ungleichungen, Terme umformen, binomische Formeln.
- Kurz (EN): Setting up linear equations and solving them by equivalent transformations, non-linear equations and inequalities, rearranging terms, binomial formulas.
- Simulationen: `waagemodell`, `binomische-formeln`, `gleichungen-grafisch`
- Jahrgänge je Simulation: `waagemodell` (7), `binomische-formeln`, `gleichungen-grafisch` (8)

### 11 Körper – Prisma und Zylinder
*EN: Solids – prism and cylinder*

- Kurz (DE): Netze, Schrägbilder und Modelle von Prismen und Zylindern, Oberflächeninhalt und Volumen, zusammengesetzte Körper.
- Kurz (EN): Nets, oblique drawings and models of prisms and cylinders, surface area and volume, composite solids.
- Simulationen: `prisma-zylinder`, `koerpernetze`

### 12 Statistik
*EN: Statistics*

- Kurz (DE): Statistische Erhebungen planen, Daten darstellen und kritisch lesen, Kenngrößen mit Median und Quartilen, Boxplots und Manipulation von Darstellungen.
- Kurz (EN): Planning statistical surveys, showing data and reading it critically, measures including median and quartiles, box plots and misleading charts.
- Simulationen: `boxplot`, `diagramme`

### 13 Lineare Funktionen und Gleichungssysteme
*EN: Linear functions and systems of equations*

- Kurz (DE): Lineare Gleichungssysteme mit zwei Variablen aufstellen, grafisch und rechnerisch lösen, Lösbarkeit untersuchen, digitale Werkzeuge.
- Kurz (EN): Setting up systems of linear equations in two variables, solving them graphically and algebraically, examining solvability, digital tools.
- Simulationen: `lgs-grafisch`
- Jahrgänge je Simulation: `lgs-grafisch` (8)

### 14 Reelle Zahlen
*EN: Real numbers*

- Kurz (DE): Irrationale Zahlen, Näherungsverfahren am Rechner, Quadrat- und Kubikwurzeln schätzen, ordnen und berechnen, die Zahlbereiche ℕ, ℤ, ℚ und ℝ.
- Kurz (EN): Irrational numbers, approximation procedures on the computer, estimating, ordering and calculating square and cube roots, the number sets ℕ, ℤ, ℚ and ℝ.
- Simulationen: `quadratwurzel`

## Doppeljahrgang 9/10  
*Grades 9/10*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: Bildungsplan Gymnasium Sek. I Mathematik (2022), Kap. 2.3, S. 80–96)

> Doppeljahrgang 9/10: Die Unterrichtsmodule sind in der angegebenen Reihenfolge zu erarbeiten; die Lernbereiche stehen bei 9 und 10 gleich und werden als eine Stufe gezeigt. Die Module 9 und 10 tragen im Bildungsplan beide den Titel „Exponentielles Wachstum“. Die Nummern sind die Modulnummern des Bildungsplans.

### 1 Satz des Pythagoras
*EN: Pythagoras’ theorem*

- Kurz (DE): Satz des Pythagoras und Umkehrung, Seitenlängen berechnen, Anwendungen und Beweis.
- Kurz (EN): Pythagoras’ theorem and its converse, calculating side lengths, applications and proof.
- Simulationen: `pythagoras`
- Jahrgänge je Simulation: `pythagoras` (9)

### 2 Körper – Pyramide, Kegel und Kugel
*EN: Solids – pyramid, cone and sphere*

- Kurz (DE): Netze und Schrägbilder, Oberflächeninhalt und Volumen von Pyramide, Kegel und Kugel, Satz von Cavalieri, Herleitung der Volumenformeln.
- Kurz (EN): Nets and oblique drawings, surface area and volume of pyramid, cone and sphere, Cavalieri’s principle, deriving the volume formulas.
- Simulationen: `pyramide-kegel-kugel`, `cavalieri`
- Jahrgänge je Simulation: `pyramide-kegel-kugel`, `cavalieri` (10)

### 3 Quadratische Funktionen und Gleichungen
*EN: Quadratic functions and equations*

- Kurz (DE): Quadratische Funktionen in Sachsituationen, Formen des Funktionsterms und Einfluss der Parameter, quadratische Gleichungen numerisch, grafisch und rechnerisch lösen.
- Kurz (EN): Quadratic functions in context, forms of the term and the effect of parameters, solving quadratic equations numerically, graphically and algebraically.
- Simulationen: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`, `gleichungen-grafisch`
- Jahrgänge je Simulation: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel` (9), `gleichungen-grafisch` (9)

### 4 Potenzgesetze
*EN: Laws of exponents*

- Kurz (DE): Zehnerpotenzschreibweise, Potenzgesetze erklären und beweisen, negative und rationale Exponenten, Wurzeln als Potenzen.
- Kurz (EN): Scientific notation, explaining and proving the laws of exponents, negative and rational exponents, roots as powers.
- Simulationen: `quadratwurzel`
- Jahrgänge je Simulation: `quadratwurzel` (9)

### 5 Wahrscheinlichkeitsrechnung II
*EN: Probability II*

- Kurz (DE): Mehrstufige Zufallsexperimente mit Pfadregeln, Gegenwahrscheinlichkeit und Erwartungswert, Zählprinzipien, bedingte Wahrscheinlichkeiten mit Vierfeldertafeln und Baumdiagrammen.
- Kurz (EN): Multi-stage random experiments with path rules, complementary probability and expected value, counting principles, conditional probability with two-way tables and tree diagrams.
- Simulationen: `zaehlprinzip`, `baumdiagramm`, `geburtstagsproblem`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`
- Jahrgänge je Simulation: `zaehlprinzip` (9), `baumdiagramm`, `geburtstagsproblem`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem` (10)

### 6 Ähnlichkeit
*EN: Similarity*

- Kurz (DE): Ähnlichkeit und Kongruenz, Skalierungsfaktoren für Strecken, Flächen und Körper, ähnliche Dreiecke, Strahlensätze.
- Kurz (EN): Similarity and congruence, scale factors for lengths, areas and solids, similar triangles, intercept theorems.
- Simulationen: `strahlensaetze`, `vergroessern`
- Jahrgänge je Simulation: `strahlensaetze` (9), `vergroessern`

### 7 Trigonometrie
*EN: Trigonometry*

- Kurz (DE): Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Winkel und Seiten berechnen, Zusammenhänge in allgemeinen Dreiecken.
- Kurz (EN): Sine, cosine and tangent in right triangles, calculating angles and sides, relationships in general triangles.
- Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`

### 8 Periodische Vorgänge
*EN: Periodic processes*

- Kurz (DE): Kreisbewegungen und ihre Projektionen, Sinus- und Kosinusfunktion, Einfluss der Parameter, periodische Vorgänge beschreiben.
- Kurz (EN): Circular motion and its projections, the sine and cosine functions, the effect of parameters, describing periodic processes.
- Simulationen: `einheitskreis`, `sinusfunktion`
- Jahrgänge je Simulation: `einheitskreis`, `sinusfunktion` (10)

### 9 Exponentielles Wachstum
*EN: Exponential growth*

- Kurz (DE): Lineares und exponentielles Wachstum unterscheiden, Exponentialfunktionen in Sachsituationen und ihre Darstellungen, Logarithmus als Umkehrung des Potenzierens.
- Kurz (EN): Telling linear and exponential growth apart, exponential functions in context and how to represent them, the logarithm as the inverse of taking powers.
- Simulationen: `logarithmus`, `exponentielles-wachstum`
- Jahrgänge je Simulation: `logarithmus`, `exponentielles-wachstum` (10)

### 10 Exponentielles Wachstum (Funktionen der Form a · bˣ)
*EN: Exponential growth (functions of the form a · bˣ)*

- Kurz (DE): Exponentialfunktionen der Form f(x) = a · bˣ in Sachsituationen, Darstellungswechsel und Merkmale, Logarithmen mit dem Taschenrechner.
- Kurz (EN): Exponential functions of the form f(x) = a · bˣ in context, switching representations and features, logarithms on the calculator.
- Simulationen: `logarithmus`, `exponentielles-wachstum`
- Jahrgänge je Simulation: `logarithmus`, `exponentielles-wachstum` (10)

### 11 Üben und Vertiefen
*EN: Practice and consolidation*

- Kurz (DE): Üben und Vertiefen zu allen Leitideen und prozessbezogenen Kompetenzen mit Blick auf die Prüfung.
- Kurz (EN): Practice and consolidation across all key ideas and process skills with a view to the exam.
- Simulationen: –

### 12 Funktionsklassen
*EN: Classes of functions*

- Kurz (DE): Bekannte und neue Funktionen vergleichen, ganzrationale und einfache gebrochenrationale Funktionen, Nullstellen und Substitution, Wurzelfunktion als Umkehrfunktion.
- Kurz (EN): Comparing known and new functions, polynomial and simple rational functions, zeros and substitution, the square root function as an inverse function.
- Simulationen: `funktionsplotter`, `hyperbel`, `potenzfunktionen`, `ganzrationale-funktionen`, `transformationen`, `umkehrfunktion`
- Jahrgänge je Simulation: `funktionsplotter`, `hyperbel`, `potenzfunktionen`, `ganzrationale-funktionen` (10), `transformationen` (10), `umkehrfunktion` (10)

### 13 Einführung in die Differentialrechnung
*EN: Introduction to differential calculus*

- Kurz (DE): Mittlere und lokale Änderungsrate, Tangentensteigung über den Differenzenquotienten, Ableitungsfunktion, Tangentengleichung und Steigungswinkel.
- Kurz (EN): Average and local rate of change, the slope of the tangent from the difference quotient, the derivative function, the tangent equation and angle of slope.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`
- Jahrgänge je Simulation: `sekante-tangente` (10), `ableitungsfunktion` (10)

## Studienstufe, erstes Jahr (S1/S2, Jahrgangsstufe 11)  
*Studienstufe, first year (S1/S2, grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Bildungsplan Studienstufe Mathematik (2022), Kap. 2.3, S. 25–32)

> Studienstufe, erstes Jahr (S1/S2; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 11): Module 1.1, 1.2, 2 und 3. Modul 1.2 kann auch vor Modul 4 unterrichtet werden, die Binomialverteilung aus Modul 5 schon nach Modul 2. eA = nur auf erhöhtem Anforderungsniveau. Die Nummern sind die Modulnummern des Bildungsplans.

### 1.1 Von der Änderungsrate zum Bestand (Analysis)
*EN: From rate of change to total (analysis)*

- Kurz (DE): Ganzrationale, einfache gebrochenrationale und Wurzelfunktionen mit Parametern, Symmetrie, Verhalten im Unendlichen und Asymptoten, Ableitungsregeln, Kurvendiskussion und Optimierung, Integral, Stammfunktion und Hauptsatz; eA: Funktionsscharen, Rotationskörper.
- Kurz (EN): Polynomial, simple rational and root functions with parameters, symmetry, behaviour at infinity and asymptotes, rules of differentiation, curve sketching and optimisation, the integral, antiderivatives and the fundamental theorem; eA: families of functions, solids of revolution.
- Simulationen: `funktionsplotter`, `polstellen-asymptoten`, `ganzrationale-funktionen`, `transformationen`, `grenzverhalten`, `sekante-tangente`, `ableitungsfunktion`, `kurvendiskussion`, `extremwertprobleme`, `funktionenscharen`, `stammfunktion-grafisch`, `ober-untersummen`, `hauptsatz`, `aenderungsrate`, `rotationskoerper`

### 1.2 Von der Änderungsrate zum Bestand (trigonometrische Funktionen)
*EN: From rate of change to total (trigonometric functions)*

- Kurz (DE): Sinus- und Kosinusfunktionen mit Parametern in Sachsituationen, ihre Ableitungen und Stammfunktionen, Produkt- und Kettenregel, Flächeninhalte.
- Kurz (EN): Sine and cosine functions with parameters in context, their derivatives and antiderivatives, the product and chain rules, areas.
- Simulationen: `sinusfunktion`, `transformationen`

### 2 Der Zufall steht Modell (Stochastik)
*EN: Modelling chance (stochastics)*

- Kurz (DE): Relative Häufigkeit und Wahrscheinlichkeit, Lage- und Streumaße mit Varianz und Standardabweichung, Baumdiagramme und Vierfeldertafeln, stochastische Unabhängigkeit, Simulationen.
- Kurz (EN): Relative frequency and probability, measures of centre and spread with variance and standard deviation, tree diagrams and two-way tables, stochastic independence, simulations.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`, `ziegenproblem`, `galtonbrett`

### 3 Koordinatengeometrie
*EN: Coordinate geometry*

- Kurz (DE): Vektoren in Ebene und Raum, Ortsvektoren, Punkte und Objekte im Koordinatensystem, Rechnen mit Vektoren; eA: Betrag und Skalarprodukt.
- Kurz (EN): Vectors in the plane and in space, position vectors, points and objects in the coordinate system, calculating with vectors; eA: magnitude and dot product.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`

## Studienstufe, zweites Jahr (S3/S4, Jahrgangsstufe 12)  
*Studienstufe, second year (S3/S4, grade 12)*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: Bildungsplan Studienstufe Mathematik (2022), Kap. 2.3, S. 33–39)

> Studienstufe, zweites Jahr (S3/S4; am Gymnasium: Jahrgangsstufe 12): Module 4 und 5 sowie eines der Wahlpflichtmodule 6 (Analytische Geometrie) und 7 (Lineare Algebra). eA = nur auf erhöhtem Anforderungsniveau. Die Nummern sind die Modulnummern des Bildungsplans.

### 4 Änderungsraten und Bestände (Exponentialfunktionen)
*EN: Rates of change and totals (exponential functions)*

- Kurz (DE): Wachstumsmodelle mit e-Funktionen, Eulersche Zahl, ln-Funktion als Umkehrfunktion, Ableitungen und Integrale als Bestandsänderungen; eA: Funktionsscharen, numerische Nullstellenbestimmung.
- Kurz (EN): Growth models with exponential functions, Euler’s number, the ln function as the inverse, derivatives and integrals as changes in totals; eA: families of functions, finding zeros numerically.
- Simulationen: `logarithmus`, `umkehrfunktion`, `e-funktion`, `newton-verfahren`, `kurvendiskussion`, `funktionenscharen`, `aenderungsrate`

### 5 Anwendungsprobleme der Stochastik
*EN: Applied problems in stochastics*

- Kurz (DE): Diskrete Zufallsgrößen, Binomialverteilung mit Erwartungswert, Standardabweichung und Sigma-Regeln; eA: Hypothesentests und Normalverteilung.
- Kurz (EN): Discrete random variables, the binomial distribution with expected value, standard deviation and sigma rules; eA: hypothesis tests and the normal distribution.
- Simulationen: `galtonbrett`, `binomialverteilung`, `signifikanztest`, `normalverteilung`

### 6 Analytische Geometrie (Wahlpflichtmodul)
*EN: Analytic geometry (elective module)*

- Kurz (DE): Geraden und Ebenen mit Vektoren, Ebenengleichungen, Spurpunkte, Lagebeziehungen, Schnittpunkte und Winkel, Normalenvektoren, Spiegelung; eA: Abstände, Gauß-Verfahren.
- Kurz (EN): Lines and planes with vectors, plane equations, trace points, relative positions, intersections and angles, normal vectors, reflection; eA: distances, Gaussian elimination.
- Simulationen: `skalar-vektorprodukt`, `geraden-ebenen`, `lage-abstaende`

### 7 Lineare Algebra (Wahlpflichtmodul)
*EN: Linear algebra (elective module)*

- Kurz (DE): Lineare Gleichungssysteme mit dem Gauß-Verfahren, Wachstums- und Umverteilungsprozesse mit Übergangsmatrizen, Matrixpotenzen, Fixvektoren und Langzeitverhalten.
- Kurz (EN): Systems of linear equations with Gaussian elimination, growth and redistribution processes with transition matrices, matrix powers, fixed vectors and long-term behaviour.
- Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `hamburg-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/hamburg-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `kugeln` | Kugeln nur als Körper (Oberfläche und Volumen) in 9/10; Kugelgleichungen stehen nicht im Bildungsplan. |
| `matrix-abbildungen` | Matrizen nur als Übergangsmatrizen für Wachstums- und Umverteilungsprozesse im Wahlpflichtmodul Lineare Algebra, nicht als Abbildungen. |
| `taylor-polynome` | nicht im Bildungsplan (Hochschule); genannt ist nur die Deutung der Ableitung über die Näherung durch lineare Funktionen |
| `fourier-reihen` | nicht im Bildungsplan (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **9/10:** 11 Üben und Vertiefen (übergreifend).
- **12:** 7 Lineare Algebra (Übergangsmatrizen, Fixvektoren, Langzeitverhalten).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Übergangsmatrizen und Langzeitverhalten | Population oder Marktanteile mit einer Übergangsmatrix Schritt für Schritt fortschreiben, Fixvektor ablesen | 12, 7 |
| Zinseszins | Kapital über Jahre wachsen lassen, iterativ und mit Potenz, Vergleich mit linearem Wachstum | 7/8, 3 |

# Teil E – Einordnung und Unklarheiten

1. **Zwei Bildungspläne, G8.** Für 5–10 gilt der Bildungsplan Gymnasium Sekundarstufe I (2022), für die Oberstufe der Bildungsplan Studienstufe (2022). Der Sek.-I-Plan nennt sich „Kerncurriculum für die Jahrgangsstufen 5 bis 10 des Gymnasiums“; die Studienstufe hat zwei Jahre. Ich habe sie als 11 und 12 eingetragen (Abitur nach Klasse 12). Die Dokumente nennen für die Studienstufe keine Jahrgangszahlen.
2. **Module als Lernbereiche.** Die Lernbereiche sind die Unterrichtsmodule mit den Nummern des Bildungsplans. In 5/6 und 7/8 ist die Reihenfolge frei, in 9/10 fest. Die Lernbereiche stehen deshalb für beide Jahrgänge eines Doppeljahrgangs gleich und werden als eine Stufe gezeigt.
3. **Studienstufe.** Erstes Jahr: Module 1.1, 1.2, 2 und 3; zweites Jahr: Module 4 und 5 und eines der Wahlpflichtmodule 6 oder 7. Modul 1.2 darf auch vor Modul 4 kommen, die Binomialverteilung aus Modul 5 auch direkt nach Modul 2. Inhalte auf erhöhtem Anforderungsniveau sind in den Kurzbeschreibungen mit „eA“ gekennzeichnet.
4. **Auffälligkeiten im Dokument.**
   - Die Module 9 und 10 in 9/10 tragen beide den Titel „Exponentielles Wachstum“. Modul 10 behandelt Funktionen der Form f(x) = a · bˣ; ich habe den Titel um diesen Zusatz ergänzt.
   - In Kap. 1 des Sek.-I-Plans steht „Der Mathematikunterricht in der Stadtteilschule …“, obwohl der Plan für das Gymnasium gilt. Für die Zuordnung spielt das keine Rolle.
5. **`sourceUrl`.** Die Dokumente nennen „www.hamburg.de/bildungsplaene“, aber keinen Link zur Datei. Eingetragen ist `https://www.hamburg.de/bildungsplaene`. Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `rotationskoerper` | 12–13 | 11–13 | 11, 1.1 (eA) | Bildungsplan Studienstufe, Modul 1.1: Volumen von Rotationskörpern (erstes Jahr) |

   Die Sortierung im Bereich ändert sich dadurch nicht.
7. **Unsichere Zuordnungen (Entwurf, bitte am Bildungsplan prüfen):**
   - `monte-carlo-pi` bei 7/8, 9 Kreis: „Pi empirisch gewinnen“; ob mit Zufall, sagt der Plan nicht.
   - `hyperbel` bei 7/8, 2: antiproportionale Zuordnungen, nicht ausdrücklich als Graph.
   - `quadratwurzel` bei 9/10, 4 Potenzgesetze: Wurzeln als Potenzen mit rationalem Exponenten.
   - `geburtstagsproblem` und `ziegenproblem` bei 9/10, 5 und 11, 2: Zählprinzipien, bedingte Wahrscheinlichkeiten und Simulationen; die Probleme selbst sind nicht genannt.
   - `galtonbrett` bei 11, 2: nur weil die Binomialverteilung schon nach Modul 2 kommen darf.
   - `skalar-vektorprodukt` bei 11, 3 und 12, 6: nur das Skalarprodukt ist genannt (eA in Modul 3).
   - `newton-verfahren` bei 12, 4: „numerische Bestimmung von Nullstellen“ (eA), das Verfahren ist nicht genannt.
   - `transformationen` bei 11, 1.2: Parameter von Sinus- und Kosinusfunktionen.
