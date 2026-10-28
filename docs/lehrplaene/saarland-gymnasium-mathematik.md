# Saarland · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Lehrpläne neunjähriges Gymnasium (5–10) und gymnasiale Oberstufe |
|---|---|
| Bundesland | Saarland |
| Schulart | Gymnasium (neunjähriges Gymnasium, eingeführt zum Schuljahr 2023/24), Klassenstufen 5–13 |
| Fach | Mathematik |
| Name der Lehrpläne (Sek. I) | „Mathematik, Lehrplan, Neunjähriges Gymnasium“, je ein Heft für Klassenstufen 5 und 6, 7, 8, 9 und 10 |
| Jahr / Stand (Sek. I) | 5 und 6: Juli 2023; 7: Juli 2023; 8: 2024; 9: 2024 (Titelblatt; Dateiname 2025); 10: 2026 |
| Name der Lehrpläne (Oberstufe) | „Lehrplan Mathematik, Gymnasiale Oberstufe, Einführungsphase“ (Erprobungsphase); „Lehrplan Mathematik für den G-Kurs der gymnasialen Oberstufe Saar“ (Hauptphase); „Lehrplan Mathematik, Hauptphase, Leistungskurs“ |
| Jahr / Stand (Oberstufe) | Einführungsphase 2014; Hauptphase G-Kurs 2016, Stand 2019; Hauptphase LK Juli 2019 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `LP_MA_gym9_5und6_2023.pdf` (63 S.), `LP_MA_gym9_7_2023.pdf` (42 S.), `LP_MA_gym9_8_2024.pdf` (52 S.), `LP_MA_gym9_9_2025.pdf` (37 S.), `LP_MA_gym9_10_2026.pdf` (43 S.), `LP_Ma_EP_GOS_2014.pdf` (31 S.), `LP_Ma_GOS_HP_G-Kurs_2016_Stand_2019.pdf` (50 S.), `LP_Ma_LK_HP_2019.pdf` (62 S.) |
| Link laut Dokument | kein Link zum Ministerium oder zur Datei; in `sourceUrl` die Startseite des Ministeriums für Bildung und Kultur, `https://www.saarland.de/mbk` (Vermerk im Pull Request) |
| G8/G9 | G9: Sek. I 5–10, Oberstufe hier Einführungsphase 11 und Hauptphase 12/13. Die Oberstufenlehrpläne sind älter als G9 und für das achtjährige Gymnasium geschrieben |
| Niveaus / Wahl | Sek. I: ein Lehrplan; in Klasse 8 zusätzliche Themenfelder für den Informatik-Zweig. Hauptphase: G-Kurs und Leistungskurs; Pflichtbereich mit wechselnden Themen, die die Schulaufsicht festlegt |
| Struktur | Sek. I: nummerierte Themenfelder mit Zeitanteilen je Klassenstufe. Einführungsphase: Lernbereiche 1–6. Hauptphase: Lernbereiche 1–5 im 1./2. Halbjahr, 6–8 im 3./4. Halbjahr, Pflichtbereich 9 im zweiten Jahr |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Klassenstufen 5/6 | 5, 6 | 11 | 0 | 11 | 19 |
| Klassenstufe 7 | 7 | 7 | 0 | 7 | 15 |
| Klassenstufe 8 | 8 | 8 | 0 | 5 | 9 |
| Klassenstufe 9 | 9 | 5 | 0 | 5 | 10 |
| Klassenstufe 10 | 10 | 6 | 0 | 6 | 14 |
| Einführungsphase (hier Klassenstufe 11) | 11 | 6 | 0 | 5 | 11 |
| Hauptphase, 1./2. Halbjahr (hier Klassenstufe 12) | 12 | 5 | 0 | 5 | 20 |
| Hauptphase, 3./4. Halbjahr (hier Klassenstufe 13) | 13 | 4 | 0 | 4 | 8 |

Insgesamt verwendet: **90 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `taylor-polynome`, `fourier-reihen`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Klassenstufen 5/6  
*Grades 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Lehrplan Mathematik 5 und 6 (2023), Themenfelder 1–11, S. 10–63)

> Klassenstufen 5 und 6 (neunjähriges Gymnasium): Der Lehrplan gilt für beide Klassenstufen zusammen; die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Die Reihenfolge der Themenfelder ist nur verbindlich, soweit es sachlogisch nötig ist. Die Nummern sind die des Lehrplans.

### 1 Natürliche Zahlen
*EN: Natural numbers*

- Kurz (DE): Daten und Diagramme, Dezimalsystem mit Stellenwerttafel und Runden, Dualsystem und römische Zahlen, Mengen, Zahlenstrahl und Anordnung.
- Kurz (EN): Data and charts, the decimal system with place value table and rounding, the binary system and Roman numerals, sets, the number line and order.
- Simulationen: `stellenwerte`, `zahlengerade`, `diagramme`
- Jahrgänge je Simulation: `stellenwerte` (5), `zahlengerade`, `diagramme` (6)

### 2 Rechnen mit natürlichen Zahlen
*EN: Calculating with natural numbers*

- Kurz (DE): Grundrechenarten und ihre Fachbegriffe, Rechengesetze, Terme mit Klammern, Potenzen, figurierte Zahlen.
- Kurz (EN): The four operations and their terms, laws of arithmetic, terms with brackets, powers, figurate numbers.
- Simulationen: `termbaum`, `zehnerpotenzen`

### 3 Größen im Alltag
*EN: Quantities in everyday life*

- Kurz (DE): Größen mit Maßzahl und Einheit, Umrechnen zwischen Einheiten, Zeitpunkte und Zeitspannen.
- Kurz (EN): Quantities with value and unit, converting between units, points in time and time spans.
- Simulationen: `einheiten`
- Jahrgänge je Simulation: `einheiten` (5)

### 4 Figuren und Körper
*EN: Figures and solids*

- Kurz (DE): Punkt, Strecke, Strahl und Gerade, parallel und senkrecht, Koordinatensystem, Vierecke, Körper mit Netz und Schrägbild.
- Kurz (EN): Point, segment, ray and line, parallel and perpendicular, the coordinate system, quadrilaterals, solids with nets and oblique drawings.
- Simulationen: `koordinaten-lage`, `vierecke`, `koerpernetze`
- Jahrgänge je Simulation: `koordinaten-lage` (5), `vierecke`, `koerpernetze`

### 5 Flächeninhalt und Volumen
*EN: Area and volume*

- Kurz (DE): Umfang und Flächeninhalt von Rechteck und Quadrat, Flächen- und Volumeneinheiten, Volumen und Oberflächeninhalt von Quader und Würfel.
- Kurz (EN): Perimeter and area of rectangle and square, units of area and volume, volume and surface area of cuboid and cube.
- Simulationen: `umfang-flaeche`, `quader-volumen`
- Jahrgänge je Simulation: `umfang-flaeche` (5), `quader-volumen`

### 6 Teilbarkeit der natürlichen Zahlen
*EN: Divisibility of natural numbers*

- Kurz (DE): Teiler und Vielfache, Teilbarkeitsregeln, Primzahlen und Primfaktorzerlegung, ggT und kgV.
- Kurz (EN): Divisors and multiples, divisibility rules, prime numbers and prime factorisation, gcd and lcm.
- Simulationen: `primfaktoren`

### 7 Brüche
*EN: Fractions*

- Kurz (DE): Brüche als Anteile, Bruchzahlen am Zahlenstrahl, kürzen und erweitern, vergleichen, Dezimalbrüche und periodische Dezimalzahlen.
- Kurz (EN): Fractions as parts, fractions on the number line, simplifying and expanding, comparing, decimals and recurring decimals.
- Simulationen: `bruchteile`, `brueche-vergleichen`, `dezimalbrueche`
- Jahrgänge je Simulation: `bruchteile`, `brueche-vergleichen`, `dezimalbrueche` (6)

### 8 Rechnen mit Brüchen
*EN: Calculating with fractions*

- Kurz (DE): Die vier Grundrechenarten mit Brüchen und Dezimalzahlen, Kehrbruch und Doppelbruch, Kommaverschiebung.
- Kurz (EN): The four operations with fractions and decimals, reciprocals and complex fractions, moving the decimal point.
- Simulationen: `brueche-rechnen`, `dezimalbrueche`
- Jahrgänge je Simulation: `brueche-rechnen` (6), `dezimalbrueche` (6)

### 9 Kreis, Winkel, Symmetrie
*EN: Circle, angle, symmetry*

- Kurz (DE): Kreis mit Radius und Durchmesser, Winkel messen und zeichnen, Achsen-, Punkt- und Drehsymmetrie, Spiegelung, Drehung und Verschiebung, Basiswinkelsatz.
- Kurz (EN): The circle with radius and diameter, measuring and drawing angles, line, point and rotational symmetry, reflection, rotation and translation, the base angle theorem.
- Simulationen: `winkel-messen`, `spiegelung`
- Jahrgänge je Simulation: `winkel-messen` (5), `spiegelung`

### 10 Statistische Daten
*EN: Statistical data*

- Kurz (DE): Absolute und relative Häufigkeit, Kreisdiagramme, Minimum, Maximum, Spannweite, Median und Quartile, Boxplot.
- Kurz (EN): Absolute and relative frequency, pie charts, minimum, maximum, range, median and quartiles, box plots.
- Simulationen: `diagramme`, `boxplot`
- Jahrgänge je Simulation: `diagramme` (6), `boxplot` (6)

### 11 Ganze Zahlen
*EN: Integers*

- Kurz (DE): Negative Zahlen im Alltag, Zahlengerade und Vorzeichen, Koordinatensystem mit vier Quadranten, Rechnen mit ganzen Zahlen.
- Kurz (EN): Negative numbers in everyday life, the number line and signs, the coordinate system with four quadrants, calculating with integers.
- Simulationen: `zahlengerade`, `koordinaten-lage`
- Jahrgänge je Simulation: `zahlengerade`, `koordinaten-lage` (5)

## Klassenstufe 7  
*Grade 7*  
Jahrgangsstufe(n) im JSON: 7  
(Quelle: Lehrplan Mathematik 7 (2023), Themenfelder 1–7, S. 10–42)

> Klassenstufe 7 (neunjähriges Gymnasium): Themenfelder des Lehrplans; die Reihenfolge ist nur verbindlich, soweit es sachlogisch nötig ist. Die Nummern sind die des Lehrplans.

### 1 Rationale Zahlen
*EN: Rational numbers*

- Kurz (DE): Negative Brüche an der Zahlengeraden, Gegenzahl und Betrag, die vier Grundrechenarten mit rationalen Zahlen.
- Kurz (EN): Negative fractions on the number line, opposite and absolute value, the four operations with rational numbers.
- Simulationen: `zahlengerade`

### 2 Terme, Gleichungen und Ungleichungen
*EN: Terms, equations and inequalities*

- Kurz (DE): Aussagen und Aussageformen, Grund- und Lösungsmenge, Äquivalenzumformungen bei Gleichungen und Ungleichungen.
- Kurz (EN): Statements and open sentences, domain and solution set, equivalent transformations of equations and inequalities.
- Simulationen: `termbaum`, `waagemodell`

### 3 Zuordnungen
*EN: Relationships*

- Kurz (DE): Zuordnungen in Tabelle und Graph, proportionale und umgekehrt proportionale Zuordnungen mit Ursprungsgerade und Hyperbel, Dreisatz.
- Kurz (EN): Relationships in tables and graphs, proportional and inversely proportional relationships with line through the origin and hyperbola, the rule of three.
- Simulationen: `proportional`, `funktion-zuordnung`, `hyperbel`

### 4 Geometrische Konstruktionen
*EN: Geometric constructions*

- Kurz (DE): Lot, Mittelsenkrechte und Winkelhalbierende, Umkreis und Inkreis von Dreiecken.
- Kurz (EN): Perpendiculars, perpendicular bisectors and angle bisectors, circumcircle and incircle of triangles.
- Simulationen: `mittelsenkrechte`, `besondere-linien`, `dreieckskonstruktion`

### 5 Prozentrechnung
*EN: Percentages*

- Kurz (DE): Grundwert, Prozentwert und Prozentsatz, Zu- und Abnahme, Rabatt und Mehrwertsteuer, Zinsen und Zinseszins.
- Kurz (EN): Base value, percentage value and rate, increase and decrease, discount and VAT, simple and compound interest.
- Simulationen: `prozentstreifen`

### 6 Einführung in die Stochastik
*EN: Introduction to probability*

- Kurz (DE): Zufallsexperimente mit Ergebnissen und Ereignissen, Laplace-Wahrscheinlichkeit, Simulationen.
- Kurz (EN): Random experiments with outcomes and events, Laplace probability, simulations.
- Simulationen: `zaehlprinzip`, `gesetz-grosse-zahlen`

### 7 Winkel in Figuren
*EN: Angles in figures*

- Kurz (DE): Neben-, Scheitel-, Stufen- und Wechselwinkel, Winkelsummen, Sekante und Tangente, Satz des Thales, Kehrsatz.
- Kurz (EN): Adjacent, vertical, corresponding and alternate angles, angle sums, secant and tangent, Thales’ theorem, converse.
- Simulationen: `winkel-geradenkreuzung`, `winkelsumme`, `thales`

## Klassenstufe 8  
*Grade 8*  
Jahrgangsstufe(n) im JSON: 8  
(Quelle: Lehrplan Mathematik 8 (2024), Themenfelder 1–8, S. 10–52)

> Klassenstufe 8 (neunjähriges Gymnasium): Themenfelder des Lehrplans; die Reihenfolge ist nur verbindlich, soweit es sachlogisch nötig ist. Die Themenfelder 6 bis 8 gelten nur im Informatik-Zweig. Die Nummern sind die des Lehrplans.

### 1 Kongruenz und Dreieckskonstruktionen
*EN: Congruence and triangle constructions*

- Kurz (DE): Kongruenzsätze und Dreieckskonstruktionen, Dreiecksungleichung, Höhen und Seitenhalbierende mit Schwerpunkt.
- Kurz (EN): Congruence theorems and triangle constructions, the triangle inequality, altitudes and medians with centroid.
- Simulationen: `dreieckskonstruktion`, `besondere-linien`

### 2 Terme
*EN: Terms*

- Kurz (DE): Terme umformen und faktorisieren, binomische Formeln und Pascalsches Dreieck, Bruchterme und Bruchgleichungen, Potenzregeln.
- Kurz (EN): Rearranging and factorising terms, binomial formulas and Pascal’s triangle, algebraic fractions and fractional equations, laws of powers.
- Simulationen: `binomische-formeln`

### 3 Vielecke und Prismen
*EN: Polygons and prisms*

- Kurz (DE): Haus der Vierecke, Flächeninhalte über Zerlegung und Ergänzung, Prismen mit Oberfläche und Volumen.
- Kurz (EN): The family of quadrilaterals, areas by dissection and completion, prisms with surface area and volume.
- Simulationen: `flaechen-zerlegen`, `prisma-zylinder`, `koerpernetze`

### 4 Lineare Funktionen
*EN: Linear functions*

- Kurz (DE): Funktionsbegriff, lineare Funktionen mit Steigung und y-Achsenabschnitt, Änderungsrate, parallele und orthogonale Geraden.
- Kurz (EN): The concept of function, linear functions with slope and y-intercept, rate of change, parallel and perpendicular lines.
- Simulationen: `lineare-funktion`, `funktionsplotter`

### 5 Kreis und Zylinder
*EN: Circle and cylinder*

- Kurz (DE): Kreiszahl π, Umfang und Flächeninhalt von Kreis, Kreisbogen und Kreissegment, Oberfläche und Volumen des Zylinders.
- Kurz (EN): The number π, circumference and area of circles, arcs and segments, surface area and volume of cylinders.
- Simulationen: `kreiszahl-pi`, `prisma-zylinder`

### 6 Rechnen in anderen Zahlensystemen (nur Informatik-Zweig)
*EN: Calculating in other number systems (computer science branch only)*

- Kurz (DE): Binär- und Hexadezimalsystem, Umrechnen und Rechnen, geometrische Summenformel.
- Kurz (EN): Binary and hexadecimal systems, converting and calculating, the geometric series formula.
- Simulationen: –

### 7 Aussagenlogik (nur Informatik-Zweig)
*EN: Propositional logic (computer science branch only)*

- Kurz (DE): Aussagen und Wahrheitswerte, Verknüpfungen wie Konjunktion, Disjunktion, NAND und NOR, Wahrheitstafeln.
- Kurz (EN): Statements and truth values, connectives such as conjunction, disjunction, NAND and NOR, truth tables.
- Simulationen: –

### 8 Vertiefung der regulären Themenfelder (nur Informatik-Zweig)
*EN: Deepening the regular topic fields (computer science branch only)*

- Kurz (DE): Vertiefungen zu den Themenfeldern 1 bis 5, zum Beispiel Mittelwerte, Parkettierungen und Füllgraphen.
- Kurz (EN): Deepening topic fields 1 to 5, for example means, tilings and filling graphs.
- Simulationen: –

## Klassenstufe 9  
*Grade 9*  
Jahrgangsstufe(n) im JSON: 9  
(Quelle: Lehrplan Mathematik 9 (2024), Themenfelder 1–5, S. 9–37)

> Klassenstufe 9 (neunjähriges Gymnasium): Themenfelder des Lehrplans; die Reihenfolge ist nur verbindlich, soweit es sachlogisch nötig ist. Die Nummern sind die des Lehrplans.

### 1 Lineare Gleichungen und Gleichungssysteme
*EN: Linear equations and systems of equations*

- Kurz (DE): Lineare Gleichungen mit zwei Variablen, Gleichungssysteme grafisch und mit Gleichsetzungs-, Einsetzungs- und Additionsverfahren lösen.
- Kurz (EN): Linear equations in two variables, solving systems graphically and by equating, substitution and elimination.
- Simulationen: `lgs-grafisch`

### 2 Quadratwurzeln und reelle Zahlen
*EN: Square roots and real numbers*

- Kurz (DE): Quadratwurzeln, Heron- und Intervallhalbierungsverfahren, Intervallschachtelung, irrationale und reelle Zahlen, Wurzelgesetze.
- Kurz (EN): Square roots, Heron’s method and bisection, nested intervals, irrational and real numbers, laws of roots.
- Simulationen: `quadratwurzel`

### 3 Satzgruppe des Pythagoras
*EN: Pythagoras’ group of theorems*

- Kurz (DE): Satz des Pythagoras und Höhensatz, Hypotenusenabschnitte, pythagoreische Zahlentripel, Anwendungen.
- Kurz (EN): Pythagoras’ theorem and the altitude theorem, segments of the hypotenuse, Pythagorean triples, applications.
- Simulationen: `pythagoras`

### 4 Quadratische Funktionen und Gleichungen
*EN: Quadratic functions and equations*

- Kurz (DE): Parabeln verschieben, strecken und spiegeln, Scheitelpunkt- und Nullstellenform, quadratische Gleichungen mit p-q-Formel und Satz von Vieta, Extremwertaufgaben.
- Kurz (EN): Translating, stretching and reflecting parabolas, vertex and factored form, quadratic equations with the quadratic formula and Vieta’s theorem, optimisation problems.
- Simulationen: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`, `gleichungen-grafisch`

### 5 Ähnlichkeit
*EN: Similarity*

- Kurz (DE): Zentrische Streckung, Ähnlichkeitssätze, Strahlensätze, maßstäbliches Vergrößern und Verkleinern.
- Kurz (EN): Enlargement, similarity theorems, intercept theorems, scaling up and down.
- Simulationen: `strahlensaetze`, `vergroessern`, `massstab`

## Klassenstufe 10  
*Grade 10*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Lehrplan Mathematik 10 (2026), Themenfelder 1–6, S. 9–43)

> Klassenstufe 10 (neunjähriges Gymnasium): Themenfelder des Lehrplans; die Reihenfolge ist nur verbindlich, soweit es sachlogisch nötig ist. Die Nummern sind die des Lehrplans.

### 1 Trigonometrie
*EN: Trigonometry*

- Kurz (DE): Sinus, Kosinus und Tangens im rechtwinkligen Dreieck und am Einheitskreis, Steigungswinkel, Sinus- und Kosinussatz.
- Kurz (EN): Sine, cosine and tangent in right triangles and on the unit circle, angle of slope, the sine and cosine rules.
- Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`

### 2 Potenzen und Potenzfunktionen
*EN: Powers and power functions*

- Kurz (DE): Potenzen und n-te Wurzeln, wissenschaftliche Notation, Potenzfunktionen mit Symmetrie, Monotonie und asymptotischem Verhalten.
- Kurz (EN): Powers and nth roots, scientific notation, power functions with symmetry, monotonicity and asymptotic behaviour.
- Simulationen: `potenzfunktionen`

### 3 Mehrstufige Zufallsexperimente
*EN: Multi-stage random experiments*

- Kurz (DE): Baumdiagramme und Pfadregeln, Urnenmodell und Tupel, Ereignisse mit Venn-Diagramm und Vierfeldertafel, bedingte Wahrscheinlichkeit.
- Kurz (EN): Tree diagrams and path rules, urn models and tuples, events with Venn diagrams and two-way tables, conditional probability.
- Simulationen: `baumdiagramm`, `geburtstagsproblem`, `monte-carlo-pi`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`

### 4 Wachstumsprozesse und Exponentialfunktionen (Teil I)
*EN: Growth processes and exponential functions (part I)*

- Kurz (DE): Lineares und exponentielles Wachstum, prozentuale Wachstumsrate, Halbwerts- und Verdopplungszeit, Exponentialgleichungen.
- Kurz (EN): Linear and exponential growth, percentage growth rate, half-life and doubling time, exponential equations.
- Simulationen: `exponentielles-wachstum`

### 5 Pyramide, Kegel, Kugel
*EN: Pyramid, cone, sphere*

- Kurz (DE): Pyramide, Kegel und ihre Stümpfe, Kugel, Satz des Cavalieri, Oberfläche und Volumen.
- Kurz (EN): Pyramids, cones and their frustums, spheres, Cavalieri’s principle, surface area and volume.
- Simulationen: `pyramide-kegel-kugel`, `cavalieri`

### 6 Trigonometrische Funktionen (Teil I)
*EN: Trigonometric functions (part I)*

- Kurz (DE): Bogenmaß, Sinusfunktion als periodische Funktion mit Periode und Amplitude.
- Kurz (EN): Radians, the sine function as a periodic function with period and amplitude.
- Simulationen: `einheitskreis`, `sinusfunktion`

## Einführungsphase (hier Klassenstufe 11)  
*Introductory phase (here grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Lehrplan Mathematik Einführungsphase (2014), Lernbereiche 1–6, S. 10–31)

> Einführungsphase der gymnasialen Oberstufe (hier Klassenstufe 11): Lehrplan von 2014 (Erprobungsphase), geschrieben für das achtjährige Gymnasium. Einige Inhalte (Sinusfunktion, Körper, Exponentialfunktionen) behandelt das neunjährige Gymnasium schon in Klasse 10. Die Nummern sind die des Lehrplans.

### 1 Allgemeine Sinusfunktion
*EN: General sine function*

- Kurz (DE): Periodizität, Sinusfunktion und Operationen mit ihr: Verschieben, Strecken und Stauchen.
- Kurz (EN): Periodicity, the sine function and operations on it: translating, stretching and compressing.
- Simulationen: `sinusfunktion`, `transformationen`

### 2 Stereometrie
*EN: Solid geometry*

- Kurz (DE): Prisma und Zylinder, Pyramide und Kegel, Prinzip von Cavalieri, Halbkugel und Kugel.
- Kurz (EN): Prism and cylinder, pyramid and cone, Cavalieri’s principle, hemisphere and sphere.
- Simulationen: –

### 3 Exponentialfunktionen
*EN: Exponential functions*

- Kurz (DE): Exponentielles Wachstum, Exponentialfunktionen der Form x ↦ a · bˣ, Logarithmen und Logarithmengesetze.
- Kurz (EN): Exponential growth, exponential functions of the form x ↦ a · bˣ, logarithms and the laws of logarithms.
- Simulationen: `logarithmus`

### 4 Stetigkeit
*EN: Continuity*

- Kurz (DE): Grenzwert, lokale und globale Stetigkeit, Monotonie, Eigenschaften stetiger Funktionen.
- Kurz (EN): Limits, local and global continuity, monotonicity, properties of continuous functions.
- Simulationen: `grenzverhalten`

### 5 Einstieg in die Differentialrechnung
*EN: Introduction to differential calculus*

- Kurz (DE): Globale und lokale Änderungsrate, Differenzierbarkeit und Ableitung; fakultativ das Newtonverfahren.
- Kurz (EN): Average and local rate of change, differentiability and the derivative; optionally Newton’s method.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `newton-verfahren`

### 6 Ganzrationale Funktionen
*EN: Polynomial functions*

- Kurz (DE): Ganzrationale Funktionen und ihre Nullstellen, Untersuchung mit erster und zweiter Ableitung, Anwendungen.
- Kurz (EN): Polynomial functions and their zeros, analysis with the first and second derivative, applications.
- Simulationen: `funktionsplotter`, `ganzrationale-funktionen`, `kurvendiskussion`, `extremwertprobleme`

## Hauptphase, 1./2. Halbjahr (hier Klassenstufe 12)  
*Main phase, half-years 1/2 (here grade 12)*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: Lehrpläne Hauptphase G-Kurs (2016/2019) und LK (2019), Lernbereiche 1–5)

> Hauptphase, 1. und 2. Halbjahr (hier Klassenstufe 12): Lernbereiche 1 bis 5 für Grund- und Leistungskurs; LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.

### 1 Grundlegende Funktionen und Ableitungen
*EN: Basic functions and derivatives*

- Kurz (DE): Ganzrationale und weitere Grundfunktionen, Verknüpfung und Verkettung, Ableitungsregeln, Umkehrfunktionen; LK: Funktionenscharen.
- Kurz (EN): Polynomial and other basic functions, combining and composing functions, rules of differentiation, inverse functions; LK: families of functions.
- Simulationen: `funktionsplotter`, `umkehrfunktion`, `kurvendiskussion`, `funktionenscharen`

### 2 Integralrechnung
*EN: Integral calculus*

- Kurz (DE): Flächeninhalte und Rekonstruktion von Beständen, Integralfunktion und Hauptsatz, Integrationsregeln, Anwendungen bis zu Rotationskörpern.
- Kurz (EN): Areas and reconstructing totals, the integral function and the fundamental theorem, rules of integration, applications including solids of revolution.
- Simulationen: `stammfunktion-grafisch`, `ober-untersummen`, `hauptsatz`, `aenderungsrate`, `rotationskoerper`

### 3 Wahrscheinlichkeiten
*EN: Probabilities*

- Kurz (DE): Grundlagen der Wahrscheinlichkeitsrechnung aus der Sekundarstufe I vertieft, Bernoulli-Experimente.
- Kurz (EN): Deepening the basics of probability from lower secondary, Bernoulli experiments.
- Simulationen: `geburtstagsproblem`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `galtonbrett`, `ziegenproblem`, `binomialverteilung`

### 4 Vektoren
*EN: Vectors*

- Kurz (DE): Punkte im Raum, Vektoren als Verschiebungen, Rechnen mit Vektoren, Betrag und Skalarprodukt; LK: Vektorprodukt.
- Kurz (EN): Points in space, vectors as translations, calculating with vectors, magnitude and dot product; LK: cross product.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`

### 5 Vektorielle Untersuchung geometrischer Strukturen
*EN: Vector analysis of geometric structures*

- Kurz (DE): Linearkombination, Geraden und Ebenen, Lagebeziehungen, Anwendungen; im Grundkurs je nach Länge der Halbjahre zum Teil im 3. Halbjahr.
- Kurz (EN): Linear combinations, lines and planes, relative positions, applications; in the basic course partly in the third half-year, depending on its length.
- Simulationen: `geraden-ebenen`, `lage-abstaende`

## Hauptphase, 3./4. Halbjahr (hier Klassenstufe 13)  
*Main phase, half-years 3/4 (here grade 13)*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: Lehrpläne Hauptphase G-Kurs (2016/2019) und LK (2019), Lernbereiche 6–9)

> Hauptphase, 3. und 4. Halbjahr (hier Klassenstufe 13): Lernbereiche 6 bis 8 und der Pflichtbereich mit wechselnden Themen, die die Schulaufsicht vor Beginn der Hauptphase festlegt. LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.

### 6 Die e-Funktion und die ln-Funktion
*EN: The exponential and the natural logarithm function*

- Kurz (DE): Exponentielles Wachstum mit der e-Funktion, Exponentialgleichungen, ln-Funktion als Umkehrfunktion, zusammengesetzte Funktionen.
- Kurz (EN): Exponential growth with the exponential function, exponential equations, the ln function as the inverse, composite functions.
- Simulationen: `e-funktion`

### 7 Modellieren
*EN: Modelling*

- Kurz (DE): Sachprobleme mit Funktionen modellieren, Modelle prüfen und bewerten.
- Kurz (EN): Modelling real problems with functions, checking and judging models.
- Simulationen: `extremwertprobleme`, `funktionenscharen`

### 8 Zufallsgrößen
*EN: Random variables*

- Kurz (DE): Diskrete Zufallsgrößen mit Erwartungswert und Standardabweichung, Binomialverteilung; LK: stetige Zufallsgrößen, Normalverteilung und Hypothesentests.
- Kurz (EN): Discrete random variables with expected value and standard deviation, the binomial distribution; LK: continuous random variables, the normal distribution and hypothesis tests.
- Simulationen: `binomialverteilung`, `signifikanztest`, `normalverteilung`

### 9 Pflichtbereich (wechselnde Themen)
*EN: Compulsory area (changing topics)*

- Kurz (DE): Themen nach Festlegung der Schulaufsicht: gebrochenrationale Funktionen, Kreis und Kugel, ln-Funktion; im LK auch vollständige Induktion.
- Kurz (EN): Topics set by the school authority: rational functions, circle and sphere, the ln function; in the LK also mathematical induction.
- Simulationen: `polstellen-asymptoten`, `kugeln`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `saarland-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/saarland-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `matrix-abbildungen` | Matrizen nur als Schreibweise für lineare Gleichungssysteme (Leistungskurs), nicht als Abbildungen. |
| `taylor-polynome` | nicht im Lehrplan (Hochschule) |
| `fourier-reihen` | nicht im Lehrplan (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **8:** 6 Rechnen in anderen Zahlensystemen, 7 Aussagenlogik, 8 Vertiefung (alle nur Informatik-Zweig).
- **11:** 2 Stereometrie – die Körpersimulationen enden nach Klassenstufen mit 10; im neunjährigen Gymnasium steht das Thema schon in Klasse 10 (Themenfeld 5).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Zahlensysteme | Eine Zahl gleichzeitig dezimal, binär und hexadezimal zeigen, Stellen einzeln umschalten | 5/6, 1 und 8, 6 |
| Wahrheitstafeln | Aussagen mit UND, ODER, NAND, NOR verknüpfen und die Tafel live füllen | 8, 7 |

# Teil E – Einordnung und Unklarheiten

1. **Neunjähriges Gymnasium.** Das Saarland hat das neunjährige Gymnasium zum Schuljahr 2023/24 eingeführt. Für 5–10 gibt es je Klassenstufe ein Heft (5 und 6 zusammen).
2. **Oberstufe aus dem achtjährigen Gymnasium (Annahme, bitte prüfen).** Die gelieferten Oberstufenlehrpläne stammen von 2014 (Einführungsphase), 2016/2019 (Hauptphase G-Kurs) und 2019 (Hauptphase LK), sind also älter als G9. Ich habe sie als Einführungsphase = 11 und Hauptphase = 12/13 eingetragen: 1./2. Halbjahr = 12, 3./4. Halbjahr = 13. Einige Inhalte der Einführungsphase (Sinusfunktion, Stereometrie, Exponentialfunktionen) stehen im neuen G9-Lehrplan schon in Klasse 10. Sobald es eigene G9-Oberstufenlehrpläne gibt, sollte die Oberstufe neu aufbereitet werden.
3. **Nummern.** Sek. I: die Nummern der Themenfelder; Oberstufe: die Nummern der Lernbereiche. Der Pflichtbereich (9) hat wechselnde Themen (gebrochenrationale Funktionen, Kreis und Kugel, ln-Funktion, im LK auch vollständige Induktion); die Schulaufsicht legt vor der Hauptphase fest, welche gelten. Er soll im zweiten Jahr der Hauptphase unterrichtet werden.
4. **Informatik-Zweig.** In Klasse 8 gibt es drei zusätzliche Themenfelder nur für den Informatik-Zweig; sie stehen als eigene Lernbereiche ohne Simulation.
5. **`sourceUrl`.** Die Lehrpläne nennen keinen Link zur Datei und keine Adresse des Ministeriums. Eingetragen ist `https://www.saarland.de/mbk`. Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `hyperbel` | 8–10 | 7–10 | 7, 3 Zuordnungen | Lehrplan 7, Themenfeld 3: umgekehrt proportionale Zuordnungen, Basisbegriff Hyperbel |
   | `dreieckskonstruktion` | 6–7 | 6–8 | 8, 1 Kongruenz und Dreieckskonstruktionen | Lehrplan 8, Themenfeld 1 |
   | `massstab` | 5–7 | 5–9 | 9, 5 Ähnlichkeit | Lehrplan 9, Themenfeld 5: Maßstab, maßstabsgerechtes Vergrößern und Verkleinern |
   | `e-funktion` | 11–12 | 11–13 | 13, 6 e- und ln-Funktion | Hauptphase, Lernbereich 6 (3./4. Halbjahr) |
   | `polstellen-asymptoten` | 11–12 | 11–13 | 13, 9 Pflichtbereich | Hauptphase, Pflichtbereich Thema „Gebrochenrationale Funktionen“ (zweites Jahr) |

   Die Sortierung in den Bereichen ändert sich dadurch nicht.
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `monte-carlo-pi`, `ziegenproblem` bei 10, 3: in den Hinweisen genannt (Bestimmung von π mit einer Monte-Carlo-Simulation, Ziegenproblem als Forscheraufgabe), nicht im verbindlichen Teil.
   - `geburtstagsproblem` bei 10, 3 und 12, 3: Urnenmodell und Tupel; das Problem selbst ist nicht genannt.
   - `newton-verfahren` bei 11, 5: nur als fakultativer Inhalt.
   - `funktionenscharen` bei 12, 1: nur im LK; im G-Kurs ausdrücklich nicht vorgesehen.
   - `kugeln` und `polstellen-asymptoten` bei 13, 9: nur wenn die Schulaufsicht diese Themen des Pflichtbereichs festlegt.
   - `galtonbrett` und `binomialverteilung` bei 12, 3: Bernoulli-Experimente; die Binomialverteilung steht ausführlich erst in Lernbereich 8.
   - `zaehlprinzip` bei 7, 6: Ergebnismengen abzählen.
