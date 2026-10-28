# Bremen · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Bildungspläne Gymnasium Sekundarstufe I (5–9) und Gymnasiale Oberstufe |
|---|---|
| Bundesland | Bremen |
| Schulart | Gymnasium (Abitur nach Jahrgangsstufe 12), Jahrgangsstufen 5–12 |
| Fach | Mathematik |
| Name des Bildungsplans (Sek. I) | „Die Sekundarstufe I im Land Bremen – Mathematik – Bildungsplan für das Gymnasium“, Der Senator für Kinder und Bildung; Curriculumentwicklung: Landesinstitut für Schule |
| Jahr / Stand (Sek. I) | Stand 08/2026 (Datei vom 30.07.2026) |
| Name des Bildungsplans (Oberstufe) | „Die Gymnasiale Oberstufe im Land Bremen – Mathematik – Bildungsplan für die Gymnasiale Oberstufe – Einführungsphase und Qualifikationsphase –“ |
| Jahr / Stand (Oberstufe) | Stand Juli 2026 (Bildungsplan 2022, Vorwort 2026 geändert) |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `20260730_Mathematik_BP_GY_final_Druck.pdf` (43 Seiten) und `GyO_Mathematik_2022_Änderung_Vorwort_2026.pdf` (56 Seiten) |
| Link laut Dokument | „http://www.bildung.bremen.de“ (Herausgeber) und „http://www.lis.bremen.de“ (Bezugsadresse); in `sourceUrl` `https://www.bildung.bremen.de`, kein Link zur einzelnen Datei |
| G8/G9 | Gymnasium: Sek. I 5–9, Oberstufe drei Jahre: Einführungsphase 10, Qualifikationsphase 11/12 |
| Niveaus / Wahl | Sek. I: Module für Oberschule und Gymnasium nebeneinander, abgebildet die Gymnasium-Spalte. Oberstufe: Grund- und Leistungskurs ([LK: …]); in Linearer Algebra / Analytischer Geometrie einer der Schwerpunkte LA oder AG |
| Struktur | Sek. I: Module A1–A11, G1–G14, F1–F6, S1–S7 mit Anforderungen am Ende der Jahrgangsstufen 6 und 9 (Kap. 2 und 3.2). Oberstufe: Einführungsphase BM 1–3 und A 1 (Kap. 3.1), Qualifikationsphase A 2, A 3, S 1–S 3, LA 1–4 bzw. AG 1–5 (Kap. 3.2) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Jahrgangsstufen 5/6 | 5, 6 | 16 | 0 | 16 | 23 |
| Jahrgangsstufen 7–9 | 7, 8, 9 | 21 | 0 | 21 | 34 |
| Einführungsphase (Jahrgangsstufe 10) | 10 | 4 | 0 | 4 | 17 |
| Qualifikationsphase (Jahrgangsstufen 11/12) | 11, 12 | 8 | 0 | 7 | 25 |

Insgesamt verwendet: **86 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `strahlensaetze`, `sinussatz-kosinussatz`, `cavalieri`, `taylor-polynome`, `fourier-reihen`, `kugeln`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Jahrgangsstufen 5/6  
*Grades 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Bildungsplan Mathematik Gymnasium, Kap. 2 (S. 10–12) und 3.2.1 (S. 19–27))

> Jahrgangsstufen 5 und 6: Der Bildungsplan beschreibt Anforderungen am Ende der Jahrgangsstufe 6; die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Die Reihenfolge der Module ist nicht festgelegt. Die Codes sind die Modulnummern des Bildungsplans (A Arithmetik/Algebra, G Geometrie, F Funktionale Zusammenhänge, S Stochastik).

### A1 Natürliche Zahlen
*EN: Natural numbers*

- Kurz (DE): Natürliche Zahlen in Stellenwerttafel und an der Zahlengeraden, Grundvorstellungen der Grundrechenarten, Kopf- und schriftliches Rechnen, Teiler und Primzahlen.
- Kurz (EN): Natural numbers in the place value table and on the number line, the meaning of the four operations, mental and written arithmetic, divisors and prime numbers.
- Simulationen: `stellenwerte`, `zahlengerade`, `termbaum`, `primfaktoren`, `zehnerpotenzen`
- Jahrgänge je Simulation: `stellenwerte` (5), `zahlengerade`, `termbaum`, `primfaktoren`, `zehnerpotenzen`

### A2 Brüche
*EN: Fractions*

- Kurz (DE): Brüche in Rechteck- und Streifenbildern und am Zahlenstrahl, gleichwertige Brüche durch Kürzen und Erweitern, ordnen und vergleichen, erste Rechnungen mit Brüchen.
- Kurz (EN): Fractions in rectangle and strip diagrams and on the number line, equivalent fractions by simplifying and expanding, ordering and comparing, first calculations with fractions.
- Simulationen: `bruchteile`, `brueche-vergleichen`, `brueche-rechnen`
- Jahrgänge je Simulation: `bruchteile`, `brueche-vergleichen`, `brueche-rechnen` (6)

### A3 Dezimalzahlen
*EN: Decimals*

- Kurz (DE): Dezimalzahlen in Stellenwerttafel und an der Zahlengeraden, Grundrechenarten im Kopf und schriftlich, Runden und Überschlag.
- Kurz (EN): Decimals in the place value table and on the number line, the four operations mentally and in writing, rounding and estimating.
- Simulationen: `zahlengerade`, `dezimalbrueche`
- Jahrgänge je Simulation: `zahlengerade`, `dezimalbrueche` (6)

### A4 Umgang mit Größen
*EN: Working with quantities*

- Kurz (DE): Größen schätzen, messen und in Einheiten umrechnen.
- Kurz (EN): Estimating and measuring quantities and converting units.
- Simulationen: `einheiten`
- Jahrgänge je Simulation: `einheiten` (5)

### A5 Rationale Zahlen
*EN: Rational numbers*

- Kurz (DE): Negative Zahlen im Alltag, Zahlbereichserweiterung bis ℚ, ordnen, Vorzeichenregeln und Grundrechenarten.
- Kurz (EN): Negative numbers in everyday life, extending the number system to ℚ, ordering, sign rules and the four operations.
- Simulationen: `zahlengerade`

### A6 Vertiefte Bruchrechnung
*EN: Further fraction arithmetic*

- Kurz (DE): Verhältnisse als Brüche, Multiplikation und Division von Brüchen mit Grundvorstellungen.
- Kurz (EN): Ratios as fractions, multiplying and dividing fractions with their meaning.
- Simulationen: `brueche-rechnen`
- Jahrgänge je Simulation: `brueche-rechnen` (6)

### G1 Formen in Ebene und Raum I
*EN: Shapes in the plane and in space I*

- Kurz (DE): Vierecksarten benennen und systematisieren, Körper mit Netzen und Schrägbildern, Modelle von Körpern.
- Kurz (EN): Naming and classifying quadrilaterals, solids with nets and oblique drawings, models of solids.
- Simulationen: `vierecke`, `koerpernetze`

### G2 Geometrische Grundbegriffe
*EN: Basic geometric terms*

- Kurz (DE): Figuren und Körper mit Grundbegriffen beschreiben, senkrechte und parallele Linien.
- Kurz (EN): Describing figures and solids with basic terms, perpendicular and parallel lines.
- Simulationen: `vierecke`

### G3 Umfänge und Flächeninhalte sowie Volumina und Oberflächeninhalte I
*EN: Perimeter, area, volume and surface area I*

- Kurz (DE): Messen mit Einheiten, Umfang und Flächeninhalt von Rechtecken, Volumen und Oberflächeninhalt von Quadern.
- Kurz (EN): Measuring with units, perimeter and area of rectangles, volume and surface area of cuboids.
- Simulationen: `umfang-flaeche`, `quader-volumen`
- Jahrgänge je Simulation: `umfang-flaeche` (5), `quader-volumen`

### G4 Winkel
*EN: Angles*

- Kurz (DE): Winkel benennen, Winkelarten, Winkel schätzen, messen und zeichnen.
- Kurz (EN): Naming angles, types of angle, estimating, measuring and drawing angles.
- Simulationen: `winkel-messen`
- Jahrgänge je Simulation: `winkel-messen` (5)

### G5 Winkelsumme und Winkelsätze
*EN: Angle sum and angle theorems*

- Kurz (DE): Winkelsummensatz im Dreieck, Neben-, Scheitel- und Stufenwinkel.
- Kurz (EN): The angle sum in triangles, adjacent, vertical and corresponding angles.
- Simulationen: `winkel-geradenkreuzung`, `winkelsumme`
- Jahrgänge je Simulation: `winkel-geradenkreuzung`, `winkelsumme` (6)

### G6 Geometrische Abbildungen
*EN: Geometric transformations*

- Kurz (DE): Figuren im Koordinatensystem verschieben und an achsenparallelen Geraden spiegeln.
- Kurz (EN): Translating figures in the coordinate system and reflecting them in lines parallel to the axes.
- Simulationen: `koordinaten-lage`, `spiegelung`
- Jahrgänge je Simulation: `koordinaten-lage` (5), `spiegelung`

### F1 Maßstab
*EN: Scale*

- Kurz (DE): Größen mit Repräsentanten schätzen, Größen aus maßstäblichen Zeichnungen entnehmen, maßstabsgerecht zeichnen.
- Kurz (EN): Estimating quantities with reference objects, reading quantities from scale drawings, drawing to scale.
- Simulationen: `massstab`

### F2 Zeit-Weg-Diagramme
*EN: Distance–time graphs*

- Kurz (DE): Koordinatensysteme mit passender Skalierung, Wertepaare eintragen und ablesen, Zeit-Weg-Diagramme erstellen und deuten.
- Kurz (EN): Coordinate systems with suitable scales, plotting and reading pairs of values, drawing and interpreting distance–time graphs.
- Simulationen: `koordinaten-lage`, `funktion-zuordnung`
- Jahrgänge je Simulation: `koordinaten-lage` (5), `funktion-zuordnung` (6)

### S1 Statistik I
*EN: Statistics I*

- Kurz (DE): Befragungen planen, Daten in Listen und Tabellen, Säulen- und Balkendiagramme, Median und Spannweite.
- Kurz (EN): Planning surveys, data in lists and tables, bar charts, median and range.
- Simulationen: `diagramme`
- Jahrgänge je Simulation: `diagramme` (6)

### S2 Wahrscheinlichkeitsrechnung I
*EN: Probability I*

- Kurz (DE): Zufallsexperimente und erste Wahrscheinlichkeiten.
- Kurz (EN): Random experiments and first probabilities.
- Simulationen: `gesetz-grosse-zahlen`
- Jahrgänge je Simulation: `gesetz-grosse-zahlen` (6)

## Jahrgangsstufen 7–9  
*Grades 7–9*  
Jahrgangsstufe(n) im JSON: 7, 8, 9  
(Quelle: Bildungsplan Mathematik Gymnasium, Kap. 2 (S. 10–12) und 3.2.2 (S. 28–36))

> Jahrgangsstufen 7 bis 9 (Gymnasium mit Abitur nach Klasse 12): Der Bildungsplan beschreibt Anforderungen am Ende der Jahrgangsstufe 9; die Lernbereiche stehen deshalb bei 7, 8 und 9 gleich und werden als eine Stufe gezeigt. Die Reihenfolge der Module ist nicht festgelegt. Die Codes sind die Modulnummern des Bildungsplans.

### A7 Prozentrechnung
*EN: Percentages*

- Kurz (DE): Prozentrechnung mit Grundwert, Prozentwert und Prozentsatz, Zinsrechnung.
- Kurz (EN): Percentages with base value, percentage value and rate, interest.
- Simulationen: `prozentstreifen`
- Jahrgänge je Simulation: `prozentstreifen` (7)

### A8 Terme und lineare Gleichungen
*EN: Terms and linear equations*

- Kurz (DE): Zusammenhänge mit Variablen und Termen beschreiben, Terme umformen und binomische Formeln, lineare Gleichungen numerisch, algebraisch und grafisch lösen.
- Kurz (EN): Describing relationships with variables and terms, rearranging terms and binomial formulas, solving linear equations numerically, algebraically and graphically.
- Simulationen: `termbaum`, `waagemodell`, `binomische-formeln`
- Jahrgänge je Simulation: `termbaum` (7), `waagemodell` (7), `binomische-formeln`

### A9 Potenzen und Wurzeln
*EN: Powers and roots*

- Kurz (DE): Quadratwurzeln, Zehnerpotenzschreibweise, Heron-Verfahren oder Intervallschachtelung mit digitalen Werkzeugen, Erweiterung zu den reellen Zahlen.
- Kurz (EN): Square roots, scientific notation, Heron’s method or nested intervals with digital tools, extending to the real numbers.
- Simulationen: `quadratwurzel`, `zehnerpotenzen`
- Jahrgänge je Simulation: `quadratwurzel`, `zehnerpotenzen` (7, 8)

### A10 Lineare Gleichungssysteme
*EN: Systems of linear equations*

- Kurz (DE): Lineare Gleichungssysteme numerisch, grafisch und mit Einsetzungs-, Gleichsetzungs- und Additionsverfahren lösen, Lösbarkeit untersuchen.
- Kurz (EN): Solving systems of linear equations numerically, graphically and by substitution, equating and elimination, examining solvability.
- Simulationen: `lgs-grafisch`
- Jahrgänge je Simulation: `lgs-grafisch` (8, 9)

### A11 Quadratische Gleichungen
*EN: Quadratic equations*

- Kurz (DE): Quadratische Gleichungen numerisch, algebraisch und grafisch lösen, Lösbarkeit und Anwendungen.
- Kurz (EN): Solving quadratic equations numerically, algebraically and graphically, solvability and applications.
- Simulationen: `gleichungen-grafisch`
- Jahrgänge je Simulation: `gleichungen-grafisch` (8, 9)

### G7 Formen in Ebene und Raum II
*EN: Shapes in the plane and in space II*

- Kurz (DE): Besondere Dreiecke und regelmäßige Vielecke, Schrägbilder und Netze von Prismen.
- Kurz (EN): Special triangles and regular polygons, oblique drawings and nets of prisms.
- Simulationen: `koerpernetze`, `prisma-zylinder`
- Jahrgänge je Simulation: `koerpernetze` (7, 8), `prisma-zylinder`

### G8 Geometrische Konstruktionen, Symmetrieeigenschaften und Kongruenz
*EN: Geometric constructions, symmetry and congruence*

- Kurz (DE): Dreiecke konstruieren, Mittelsenkrechten und Winkelhalbierende, Lösbarkeit von Konstruktionen, Kongruenz und Symmetrie begründen.
- Kurz (EN): Constructing triangles, perpendicular and angle bisectors, solvability of constructions, justifying congruence and symmetry.
- Simulationen: `dreieckskonstruktion`, `mittelsenkrechte`, `besondere-linien`
- Jahrgänge je Simulation: `dreieckskonstruktion` (7, 8), `mittelsenkrechte` (7), `besondere-linien` (7, 8)

### G9 Umfänge und Flächeninhalte sowie Volumina und Oberflächeninhalte II
*EN: Perimeter, area, volume and surface area II*

- Kurz (DE): Umfang und Flächeninhalt von Dreiecken, Parallelogrammen und Trapezen, Oberfläche und Volumen gerader Prismen.
- Kurz (EN): Perimeter and area of triangles, parallelograms and trapeziums, surface area and volume of right prisms.
- Simulationen: `flaechen-zerlegen`, `prisma-zylinder`
- Jahrgänge je Simulation: `flaechen-zerlegen` (7, 8), `prisma-zylinder`

### G10 Formen in Ebene und Raum III
*EN: Shapes in the plane and in space III*

- Kurz (DE): Pyramiden, Zylinder, Kegel und Kugeln beschreiben, Schrägbilder und Netze.
- Kurz (EN): Describing pyramids, cylinders, cones and spheres, oblique drawings and nets.
- Simulationen: `pyramide-kegel-kugel`

### G11 Ähnlichkeit
*EN: Similarity*

- Kurz (DE): Zentrische Streckungen, Eigenschaften von Figuren mit Ähnlichkeitsbeziehungen begründen.
- Kurz (EN): Enlargements, justifying properties of figures with similarity.
- Simulationen: `vergroessern`
- Jahrgänge je Simulation: `vergroessern` (8, 9)

### G12 Umfänge und Flächeninhalte sowie Volumina und Oberflächeninhalte III
*EN: Perimeter, area, volume and surface area III*

- Kurz (DE): Umfang und Flächeninhalt von Kreisen, Oberfläche und Volumen von Pyramiden, Zylindern, Kegeln, Kugeln und zusammengesetzten Körpern.
- Kurz (EN): Circumference and area of circles, surface area and volume of pyramids, cylinders, cones, spheres and composite solids.
- Simulationen: `kreiszahl-pi`, `prisma-zylinder`, `pyramide-kegel-kugel`

### G13 Satz des Pythagoras und Satz des Thales
*EN: Pythagoras’ theorem and Thales’ theorem*

- Kurz (DE): Satz des Pythagoras begründen und anwenden, auch im Raum, Rechtwinkligkeit mit dem Satz des Thales begründen.
- Kurz (EN): Justifying and applying Pythagoras’ theorem, also in space, justifying right angles with Thales’ theorem.
- Simulationen: `thales`, `pythagoras`
- Jahrgänge je Simulation: `thales` (7), `pythagoras`

### G14 Trigonometrische Beziehungen
*EN: Trigonometric relationships*

- Kurz (DE): Sinus, Kosinus und Tangens im rechtwinkligen Dreieck.
- Kurz (EN): Sine, cosine and tangent in right triangles.
- Simulationen: `sin-cos-tan-dreieck`
- Jahrgänge je Simulation: `sin-cos-tan-dreieck` (9)

### F4 Proportionale und antiproportionale Zuordnungen
*EN: Proportional and inversely proportional relationships*

- Kurz (DE): Zuordnungen in Worten, Tabellen und Graphen, Gesetzmäßigkeiten erkennen, Berechnungen im Alltag.
- Kurz (EN): Relationships in words, tables and graphs, recognising patterns, everyday calculations.
- Simulationen: `proportional`, `funktion-zuordnung`, `hyperbel`
- Jahrgänge je Simulation: `proportional` (7, 8), `funktion-zuordnung` (7, 8), `hyperbel`

### F5 Lineare Funktionen
*EN: Linear functions*

- Kurz (DE): Lineare Zusammenhänge in Worten, Tabelle, Term und Graph, Steigung und Merkmale, Anwendungen mit digitalen Werkzeugen.
- Kurz (EN): Linear relationships in words, tables, terms and graphs, slope and features, applications with digital tools.
- Simulationen: `lineare-funktion`, `funktionsplotter`
- Jahrgänge je Simulation: `lineare-funktion`, `funktionsplotter` (8, 9)

### F6 Quadratische Funktionen
*EN: Quadratic functions*

- Kurz (DE): Quadratische Funktionen in Normal-, Scheitelpunkt- und faktorisierter Form, Bedeutung der Parameter, Schnittpunkte und Anwendungen.
- Kurz (EN): Quadratic functions in standard, vertex and factored form, meaning of the parameters, intersections and applications.
- Simulationen: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`
- Jahrgänge je Simulation: `quadratische-funktion` (9), `parabel-drei-punkte` (9), `extremwert-parabel` (9)

### S3 Häufigkeiten
*EN: Frequencies*

- Kurz (DE): Daten kritisch lesen, Manipulationen erkennen, absolute und relative Häufigkeiten, Kreisdiagramme, Mittelwert, Median, Quartile und Boxplots.
- Kurz (EN): Reading data critically, spotting manipulation, absolute and relative frequencies, pie charts, mean, median, quartiles and box plots.
- Simulationen: `diagramme`, `boxplot`

### S4 Wahrscheinlichkeitsrechnung II
*EN: Probability II*

- Kurz (DE): Laplace-Regel, mehrstufige Laplace-Experimente, Chancen und Risiken, Gesetz der großen Zahlen und Simulationen.
- Kurz (EN): The Laplace rule, multi-stage Laplace experiments, chances and risks, the law of large numbers and simulations.
- Simulationen: `gesetz-grosse-zahlen`, `monte-carlo-pi`
- Jahrgänge je Simulation: `gesetz-grosse-zahlen`, `monte-carlo-pi` (8, 9)

### S5 Statistik II
*EN: Statistics II*

- Kurz (DE): Baumdiagramme für zwei- und mehrstufige Zufallsversuche.
- Kurz (EN): Tree diagrams for two- and multi-stage random experiments.
- Simulationen: `baumdiagramm`
- Jahrgänge je Simulation: `baumdiagramm` (8, 9)

### S6 Kombinatorik
*EN: Combinatorics*

- Kurz (DE): Zählstrategien und systematisches Zählen.
- Kurz (EN): Counting strategies and systematic counting.
- Simulationen: `zaehlprinzip`

### S7 Wahrscheinlichkeitsrechnung III
*EN: Probability III*

- Kurz (DE): Wahrscheinlichkeiten mehrstufiger Zufallsexperimente mit Pfadregeln.
- Kurz (EN): Probabilities of multi-stage experiments with the path rules.
- Simulationen: `baumdiagramm`
- Jahrgänge je Simulation: `baumdiagramm` (8, 9)

## Einführungsphase (Jahrgangsstufe 10)  
*Introductory phase (grade 10)*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Bildungsplan Mathematik Gymnasiale Oberstufe, Kap. 3.1, S. 17–22)

> Einführungsphase der gymnasialen Oberstufe (am Gymnasium Jahrgangsstufe 10): Basismodule BM 1 bis BM 3 und Modul A 1. Die Codes sind die Modulnummern des Bildungsplans.

### BM 1 Grundlagen aus der Algebra
*EN: Basics of algebra*

- Kurz (DE): Binomische Formeln, Potenz- und Logarithmusgesetze, lineare, quadratische, Potenz-, Bruch-, Wurzel-, Exponential- und trigonometrische Gleichungen, auch näherungsweise.
- Kurz (EN): Binomial formulas, laws of powers and logarithms, linear, quadratic, power, fractional, radical, exponential and trigonometric equations, also approximately.
- Simulationen: `logarithmus`

### BM 2 Geometrie
*EN: Geometry*

- Kurz (DE): Figuren im Koordinatensystem, Sinus, Kosinus und Tangens im rechtwinkligen Dreieck und ihre Symmetrien.
- Kurz (EN): Figures in the coordinate system, sine, cosine and tangent in right triangles and their symmetries.
- Simulationen: `sin-cos-tan-dreieck`, `einheitskreis`

### BM 3 Grundlagen zu Funktionen
*EN: Basics of functions*

- Kurz (DE): Funktionsbegriff und Darstellungen, Nullstellen und Schnittpunkte, Symmetrie, Transformationen, Grenzwerte und Asymptoten, Umkehrfunktionen; ganzrationale, Exponential-, Sinus- und Kosinusfunktionen, Wurzelfunktion und 1/x.
- Kurz (EN): The concept of function and its representations, zeros and intersections, symmetry, transformations, limits and asymptotes, inverse functions; polynomial, exponential, sine and cosine functions, the square root function and 1/x.
- Simulationen: `funktionsplotter`, `hyperbel`, `polstellen-asymptoten`, `potenzfunktionen`, `einheitskreis`, `sinusfunktion`, `exponentielles-wachstum`, `ganzrationale-funktionen`, `transformationen`, `grenzverhalten`, `umkehrfunktion`

### A 1 Einführung in die Differentialrechnung
*EN: Introduction to differential calculus*

- Kurz (DE): Mittlere und lokale Änderungsrate, Tangente und Ableitungsfunktion, Ableitungsregeln, Monotonie, Krümmung, Extrem- und Wendepunkte, Steckbriefaufgaben; Newton-Verfahren als Anregung.
- Kurz (EN): Average and local rate of change, tangent and derivative function, rules of differentiation, monotonicity, curvature, extreme and inflection points, reconstructing functions; Newton’s method as a suggestion.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `newton-verfahren`, `kurvendiskussion`

## Qualifikationsphase (Jahrgangsstufen 11/12)  
*Qualification phase (grades 11/12)*  
Jahrgangsstufe(n) im JSON: 11, 12  
(Quelle: Bildungsplan Mathematik Gymnasiale Oberstufe, Kap. 3.2, S. 23–43)

> Qualifikationsphase (am Gymnasium Jahrgangsstufen 11 und 12): Der Bildungsplan ordnet die Module nicht einzelnen Jahrgängen zu; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. In Linearer Algebra / Analytischer Geometrie wird einer der beiden Schwerpunkte LA oder AG unterrichtet. LK = nur im Leistungskurs. Die Codes sind die Modulnummern des Bildungsplans.

### A 2 Einführung in die Integralrechnung
*EN: Introduction to integral calculus*

- Kurz (DE): Integral als rekonstruierter Bestand und Flächeninhalt, Hauptsatz, Stammfunktionen; LK: Ober- und Untersummen, Mittelwerte, Rotationskörper.
- Kurz (EN): The integral as reconstructed total and area, the fundamental theorem, antiderivatives; LK: upper and lower sums, mean values, solids of revolution.
- Simulationen: `stammfunktion-grafisch`, `ober-untersummen`, `hauptsatz`, `aenderungsrate`, `rotationskoerper`

### A 3 Fortführung der Analysis
*EN: Further analysis*

- Kurz (DE): Natürliche Exponentialfunktion und Logarithmus, verknüpfte und verkettete Funktionen, Funktionen mit Parametern, Anwendungen und begrenztes Wachstum; LK: Funktionenscharen, ln-Funktion, logistisches Wachstum.
- Kurz (EN): The natural exponential function and logarithm, combined and composite functions, functions with parameters, applications and limited growth; LK: families of functions, the ln function, logistic growth.
- Simulationen: `funktionsplotter`, `logarithmus`, `umkehrfunktion`, `e-funktion`, `kurvendiskussion`, `extremwertprobleme`, `funktionenscharen`

### S 1 Grundlagen der Statistik und der Wahrscheinlichkeitsrechnung
*EN: Basics of statistics and probability*

- Kurz (DE): Kombinatorik, Baumdiagramme und Vierfeldertafeln, bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit; LK: Satz der totalen Wahrscheinlichkeit und Satz von Bayes.
- Kurz (EN): Combinatorics, tree diagrams and two-way tables, conditional probability and stochastic independence; LK: law of total probability and Bayes’ theorem.
- Simulationen: `geburtstagsproblem`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`

### S 2 Die Binomialverteilung als spezielle diskrete Wahrscheinlichkeitsverteilung
*EN: The binomial distribution as a discrete probability distribution*

- Kurz (DE): Binomialverteilung mit Erwartungswert und Standardabweichung, Anwendbarkeit; LK: Signifikanztests.
- Kurz (EN): The binomial distribution with expected value and standard deviation, when it applies; LK: significance tests.
- Simulationen: `galtonbrett`, `binomialverteilung`, `signifikanztest`
- Jahrgänge je Simulation: `galtonbrett`, `binomialverteilung`, `signifikanztest` (12)

### S 3 Normalverteilungen (LK)
*EN: Normal distributions (LK)*

- Kurz (DE): LK: stetige Zufallsgrößen, Gaußsche Glockenkurve, Näherung der Binomialverteilung, σ-Umgebungen.
- Kurz (EN): LK: continuous random variables, the Gaussian bell curve, approximating the binomial distribution, σ intervals.
- Simulationen: `normalverteilung`
- Jahrgänge je Simulation: `normalverteilung` (12)

### LA/AG Vektoren in geometrischen Zusammenhängen (LA 1 bzw. AG 2)
*EN: Vectors in geometric contexts (LA 1 or AG 2)*

- Kurz (DE): Vektoren als Zahlentupel, Rechnen mit Vektoren, Betrag und Skalarprodukt; im Schwerpunkt AG auch das Vektorprodukt.
- Kurz (EN): Vectors as tuples, calculating with vectors, magnitude and dot product; in the AG focus also the cross product.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`

### LA Schwerpunkt Lineare Algebra (LA 2 bis LA 4)
*EN: Focus linear algebra (LA 2 to LA 4)*

- Kurz (DE): Lineare Gleichungssysteme und Matrizenkalkül, Umverteilungen und Populationsentwicklungen mit Übergangs- und Populationsmatrizen, Fixvektoren und Langzeitverhalten; LK: Eigenvektoren.
- Kurz (EN): Systems of linear equations and matrix calculus, redistribution and population models with transition and population matrices, fixed vectors and long-term behaviour; LK: eigenvectors.
- Simulationen: –

### AG Schwerpunkt Analytische Geometrie (AG 1, AG 3 bis AG 5)
*EN: Focus analytic geometry (AG 1, AG 3 to AG 5)*

- Kurz (DE): Lineare Gleichungssysteme, Geraden und Ebenen, Lagebeziehungen, Projektionen, Spiegelungen, Abstände und Winkel.
- Kurz (EN): Systems of linear equations, lines and planes, relative positions, projections, reflections, distances and angles.
- Simulationen: `geraden-ebenen`, `lage-abstaende`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `bremen-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/bremen-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `strahlensaetze` | Strahlensätze nicht im Bildungsplan; G11 nennt nur zentrische Streckungen und Ähnlichkeitsbeziehungen. |
| `cavalieri` | Prinzip von Cavalieri nicht genannt. |
| `sinussatz-kosinussatz` | Trigonometrie nur im rechtwinkligen Dreieck (G14, BM 2). |
| `kugeln` | Kugeln nur als Körper; „es sind keine vektoriellen Kugeln gefordert“ (AG 4). |
| `matrix-abbildungen` | Matrizen nur als Übergangs- und Populationsmatrizen im Schwerpunkt Lineare Algebra, nicht als Abbildungen. |
| `taylor-polynome` | nicht im Bildungsplan (Hochschule) |
| `fourier-reihen` | nicht im Bildungsplan (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **11/12:** Schwerpunkt Lineare Algebra (LA 2 bis LA 4: Umverteilungen und Populationsentwicklungen mit Matrizen).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Übergangsmatrizen und Langzeitverhalten | Umverteilung oder Population mit einer Matrix Schritt für Schritt fortschreiben, Fixvektor und Grenzmatrix ablesen | 11/12, LA |
| Muster in Zahlenfolgen | Folgen aus Punktmustern fortsetzen, Term für das n-te Glied finden | 5/6, F3 |

# Teil E – Einordnung und Unklarheiten

1. **Gymnasium mit Abitur nach 12.** Der Sek.-I-Plan gilt „für die Jahrgänge 5 bis 9“ des Gymnasiums; die Oberstufe umfasst drei Jahrgänge. Eingetragen sind Einführungsphase = 10 und Qualifikationsphase = 11/12.
2. **Sek. I nach zwei Zeitpunkten.** Der Bildungsplan formuliert Anforderungen am Ende der Jahrgangsstufen 6 und 9. Die Module stehen deshalb in den Stufen 5/6 und 7–9. Die Zuordnung habe ich aus den Kapiteln 3.2.1 und 3.2.2 übernommen, weil die Farbmarkierung der Modultabellen (Kap. 2) im Text nicht erhalten ist.
3. **Modul F3 „Muster in Zahlenfolgen“.** Es steht in der Modultabelle des Gymnasiums, hat aber in den Standards (Kap. 3.2) keine eigenen Anforderungen. Ich habe es deshalb nicht als Lernbereich aufgenommen (bitte prüfen).
4. **Qualifikationsphase.** Der Bildungsplan ordnet die Module nicht einzelnen Jahrgängen zu, deshalb eine Stufe 11/12. Im Sachgebiet Lineare Algebra / Analytische Geometrie wird einer der beiden Schwerpunkte unterrichtet; gemeinsame Inhalte (Vektoren, LA 1 bzw. AG 2) stehen als eigener Lernbereich. Inhalte nur für den Leistungskurs sind in den Kurzbeschreibungen mit „LK“ gekennzeichnet.
5. **`sourceUrl`.** Eingetragen ist `https://www.bildung.bremen.de` (im Dokument als http angegeben). Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `kurvendiskussion` | 11–12 | 10–12 | 10, A 1 | Einführungsphase, A 1.7–A 1.9: Monotonie, Krümmung, Extrem- und Wendepunkte |
   | `newton-verfahren` | 11–12 | 10–12 | 10, A 1 | Einführungsphase, Kommentar zu A 1.4 und BM 1.2: Newton-Verfahren |
   | `polstellen-asymptoten` | 11–13 | 10–13 | 10, BM 3 | Einführungsphase, BM 3.5: waagerechte und senkrechte Asymptoten |

   Die Sortierung in den Bereichen ändert sich dadurch nicht.
7. **Unsichere Zuordnungen (Entwurf, bitte am Bildungsplan prüfen):**
   - `newton-verfahren` bei 10, A 1: nur im Kommentar („bietet sich an“).
   - `polstellen-asymptoten` bei 10, BM 3: Asymptoten werden genannt, gebrochenrationale Funktionen nur mit dem Term 1/x.
   - `monte-carlo-pi` bei 7–9, S4: Simulationen sind im Kommentar genannt, π mit Zufall nicht.
   - `geburtstagsproblem` und `ziegenproblem` bei 11/12, S 1: Kombinatorik und bedingte Wahrscheinlichkeit; die Probleme sind nicht genannt.
   - `hyperbel` bei 7–9, F4: antiproportionale Zuordnungen als Graph.
   - `skalar-vektorprodukt` bei 11/12: das Vektorprodukt nur im Schwerpunkt AG (AG 2.7).
