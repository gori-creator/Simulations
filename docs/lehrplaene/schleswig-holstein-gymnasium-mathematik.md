# Schleswig-Holstein · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I und Sekundarstufe II (ein Dokument) |
|---|---|
| Bundesland | Schleswig-Holstein |
| Schulart | Gymnasium (die Fachanforderungen gelten für alle allgemeinbildenden Schulen), Jahrgangsstufen 5–13 |
| Fach | Mathematik |
| Name des Lehrplans | „Fachanforderungen Mathematik, Allgemeinbildende Schulen, Sekundarstufe I, Sekundarstufe II“, Herausgeber: Ministerium für Allgemeine und Berufliche Bildung, Wissenschaft, Forschung und Kultur des Landes Schleswig-Holstein |
| Jahr / Stand | 2. überarbeitete Auflage, Kiel, Juni 2024 |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `Fachanforderungen_Mathematik_Sekundarstufe_2024_barrierearm.pdf` (88 Seiten; Sek. I Teil II, S. 16–53; Sek. II Teil III, S. 54–81) |
| Link laut Dokument | „www.fachanforderungen.de“ (Bestellungen) und „www.schleswig-holstein.de“; in `sourceUrl` `https://www.fachanforderungen.de/`; kein Link zur einzelnen Datei (Vermerk im Pull Request) |
| G8/G9 | G9 abgebildet: Abitur nach Jahrgangsstufe 13, Einführungsjahr 11. Für den achtjährigen Bildungsgang (G8) sind die Inhalte der Jahrgänge 7–10 in 6–9 zu behandeln |
| Niveaus / Wahl | Sek. I: drei Anforderungsebenen (Erster allgemeinbildender Schulabschluss, Mittlerer Schulabschluss, Allgemeine Hochschulreife), am Gymnasium gelten alle. Sek. II: grundlegendes und erhöhtes Anforderungsniveau in einer Tabelle (erhöht grau und fett) |
| Struktur | Sek. I: Kerninhalte nach fünf Leitideen (Kap. II.2.2) und verbindliche Verteilung auf die Jahrgänge 5/6, 7/8/9 und 10 (Kap. II.3). Sek. II: Kerninhalte nach fünf Leitideen (Kap. III.2.2) und Themenübersicht nach Sachgebieten Analysis, Geometrie, Stochastik für Einführungsjahr, 1. und 2. Jahr der Qualifikationsphase (Kap. III.3); keine Nummern |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Jahrgangsstufen 5/6 | 5, 6 | 5 | 13 | 12 | 20 |
| Jahrgangsstufen 7/8/9 | 7, 8, 9 | 5 | 30 | 29 | 40 |
| Jahrgangsstufe 10 | 10 | 3 | 9 | 9 | 11 |
| Einführungsjahr (Jahrgangsstufe 11) | 11 | 3 | 8 | 8 | 19 |
| 1. Jahr der Qualifikationsphase (Jahrgangsstufe 12) | 12 | 3 | 12 | 10 | 17 |
| 2. Jahr der Qualifikationsphase (Jahrgangsstufe 13) | 13 | 3 | 5 | 5 | 10 |

Insgesamt verwendet: **87 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `cavalieri`, `polstellen-asymptoten`, `taylor-polynome`, `fourier-reihen`, `kugeln`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Jahrgangsstufen 5/6  
*Grades 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Fachanforderungen Mathematik (2024), Kap. II.3, S. 45, mit den Kerninhalten aus Kap. II.2.2, S. 26–43)

> Jahrgangsstufen 5 und 6: Die Fachanforderungen geben die Verteilung der Inhalte auf die Jahrgänge 5/6, 7/8/9 und 10 als verbindlichen Rahmen vor; innerhalb dieses Rahmens entscheidet die Fachschaft. Die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Lernbereiche sind die fünf Leitideen, Unterbereiche die Themen der Verteilungstabelle; die Nummern sind von uns vergeben.

### 1 Zahl und Operation
*EN: Number and operation*

- Kurz (DE): Natürliche Zahlen mit Stellenwerttafel und Teilbarkeit, positive Bruchzahlen und Dezimalzahlen.
- Kurz (EN): Natural numbers with the place-value chart and divisibility, positive fractions and decimals.
- Simulationen: `stellenwerte`, `termbaum`, `primfaktoren`, `bruchteile`, `brueche-vergleichen`, `brueche-rechnen`, `dezimalbrueche`
- Unterbereiche:
  - 1.1 natürliche Zahlen · *natural numbers* – Kurz: Zahlenstrahl, Stellenwerttafel und Runden, Rechenverfahren und Terme ohne Variablen mit Vorrang- und Klammerregeln, Teiler, Vielfache, Primzahlen und Primfaktorzerlegung. · *EN: Number line, place-value chart and rounding, written methods and terms without variables with order of operations and brackets, divisors, multiples, primes and prime factorisation.* – Simulationen: `stellenwerte` (5), `termbaum`, `primfaktoren`
  - 1.2 positive Bruchzahlen · *positive fractions* – Kurz: Brüche als Anteile, Größen, Verhältnisse und Operatoren, erweitern und kürzen, an der Zahlengeraden ordnen und mit ihnen rechnen. · *EN: Fractions as parts, quantities, ratios and operators, expanding and simplifying, ordering on the number line and calculating with them.* – Simulationen: `bruchteile`, `brueche-vergleichen`, `brueche-rechnen` (6)
  - 1.3 Dezimalzahlen · *decimals* – Kurz: Abbrechende und einfache periodische Dezimalbrüche in der Stellenwerttafel, runden und rechnen. · *EN: Terminating and simple recurring decimals in the place-value chart, rounding and calculating.* – Simulationen: `dezimalbrueche` (6)

### 2 Größen und Messen
*EN: Quantities and measurement*

- Kurz (DE): Grundgrößen messen, schätzen und umrechnen, Winkel, Maßstab sowie Flächeninhalt von Rechtecken und Volumen von Quadern.
- Kurz (EN): Measuring, estimating and converting basic quantities, angles, scale, and the area of rectangles and the volume of cuboids.
- Simulationen: `einheiten`, `winkel-messen`, `massstab`, `umfang-flaeche`, `quader-volumen`
- Unterbereiche:
  - 2.1 Grundgrößen · *basic quantities* – Kurz: Länge, Masse, Geld, Zeit, Flächeninhalt und Volumen mit Einheiten, Winkel zeichnen und messen, maßstäbliche Umrechnungen. · *EN: Length, mass, money, time, area and volume with units, drawing and measuring angles, converting with scales.* – Simulationen: `einheiten` (5), `winkel-messen` (5), `massstab`
  - 2.2 Flächenberechnung an Rechtecken · *area of rectangles* – Kurz: Flächen mit Einheitsquadraten auslegen, Umfang und Flächeninhalt von Rechteck und Quadrat bestimmen und aus Rechtecken zusammengesetzte Figuren vergleichen. · *EN: Covering areas with unit squares, finding perimeter and area of rectangles and squares and comparing figures made of rectangles.* – Simulationen: `umfang-flaeche` (5)
  - 2.3 Volumenberechnung an Quadern · *volume of cuboids* – Kurz: Rauminhalte mit Einheitswürfeln bestimmen und das Volumen von Quader und Würfel berechnen. · *EN: Finding volumes with unit cubes and calculating the volume of cuboids and cubes.* – Simulationen: `quader-volumen`

### 3 Strukturen und funktionaler Zusammenhang
*EN: Structures and functional relationships*

- Kurz (DE): Einfache Zuordnungen in Tabellen und Diagrammen.
- Kurz (EN): Simple relationships in tables and charts.
- Simulationen: `diagramme`, `funktion-zuordnung`
- Unterbereiche:
  - 3.1 einfache Zuordnungen in Tabellen und Diagrammen · *simple relationships in tables and charts* – Kurz: Informationen aus Tabellen, Säulen-, Balken- und Kreisdiagrammen entnehmen, Daten darstellen und Zuordnungen beschreiben. · *EN: Reading information from tables, bar and pie charts, displaying data and describing relationships.* – Simulationen: `diagramme` (6), `funktion-zuordnung` (6)

### 4 Raum und Form
*EN: Space and shape*

- Kurz (DE): Einfache Figuren und Körper, Symmetrie und Grundkonstruktionen mit Zirkel und Geodreieck.
- Kurz (EN): Simple figures and solids, symmetry and basic constructions with compasses and set square.
- Simulationen: `koordinaten-lage`, `vierecke`, `koerpernetze`, `spiegelung`, `mittelsenkrechte`
- Unterbereiche:
  - 4.1 einfache geometrische Figuren und Körper · *simple geometric figures and solids* – Kurz: Strecke, Gerade, Winkel, Abstand und Kreis, parallel und senkrecht, Koordinatensystem, besondere Dreiecke und Vierecke, Körper mit Netzen und Schrägbildern. · *EN: Segments, lines, angles, distance and circles, parallel and perpendicular, the coordinate system, special triangles and quadrilaterals, solids with nets and oblique drawings.* – Simulationen: `koordinaten-lage` (5), `vierecke`, `koerpernetze`
  - 4.2 Symmetrie · *symmetry* – Kurz: Achsen- und Punktsymmetrie erkennen und Figuren spiegeln, drehen und verschieben. · *EN: Recognising line and point symmetry and reflecting, rotating and translating figures.* – Simulationen: `spiegelung`
  - 4.3 geometrische Konstruktionen · *geometric constructions* – Kurz: Grundkonstruktionen mit Zirkel und Lineal, Mittelsenkrechte und Winkelhalbierende, auch mit dynamischer Geometriesoftware. · *EN: Basic constructions with compasses and ruler, perpendicular and angle bisectors, also with dynamic geometry software.* – Simulationen: `mittelsenkrechte` (6)

### 5 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Einfache Erhebungen, Abzählen von Möglichkeiten und einstufige Zufallsexperimente.
- Kurz (EN): Simple surveys, counting possibilities and single-stage random experiments.
- Simulationen: `diagramme`, `zaehlprinzip`
- Unterbereiche:
  - 5.1 einfache statistische Erhebungen · *simple statistical surveys* – Kurz: Daten mit Strichliste und Tabelle erheben und in Säulendiagrammen darstellen. · *EN: Collecting data with tally charts and tables and showing it in bar charts.* – Simulationen: `diagramme` (6)
  - 5.2 einfache kombinatorische Fragestellungen · *simple counting problems* – Kurz: Möglichkeiten systematisch abzählen, auch mit Baumdiagrammen. · *EN: Counting possibilities systematically, also with tree diagrams.* – Simulationen: `zaehlprinzip`
  - 5.3 einstufige Zufallsexperimente · *single-stage random experiments* – Kurz: Zufallsexperimente, Versuche, Ergebnisse und Ergebnismengen beschreiben. · *EN: Describing random experiments, trials, outcomes and sample spaces.* – Simulationen: –

## Jahrgangsstufen 7/8/9  
*Grades 7/8/9*  
Jahrgangsstufe(n) im JSON: 7, 8, 9  
(Quelle: Fachanforderungen Mathematik (2024), Kap. II.3, S. 45, mit Kap. II.2.2, S. 26–43)

> Jahrgangsstufen 7 bis 9: Die Fachanforderungen fassen die Inhalte der Jahrgänge 7, 8 und 9 zusammen; die Lernbereiche stehen deshalb bei 7, 8 und 9 gleich und werden als eine Stufe gezeigt. Mit * gekennzeichnete Themen können in Klasse 10 vertieft werden. Im achtjährigen Bildungsgang (G8) sind die Inhalte der Jahrgänge 7–10 in 6–9 zu behandeln; abgebildet ist G9. Die Nummern sind von uns vergeben.

### 1 Zahl und Operation
*EN: Number and operation*

- Kurz (DE): Ganze und rationale Zahlen, Prozente und Zinsen, Quadratwurzeln, reelle Zahlen und Potenzen.
- Kurz (EN): Integers and rational numbers, percentages and interest, square roots, real numbers and powers.
- Simulationen: `zahlengerade`, `termbaum`, `prozentstreifen`, `quadratwurzel`, `zehnerpotenzen`
- Unterbereiche:
  - 1.1 ganze Zahlen · *integers* – Kurz: Betrag und Vorzeichen, ganze Zahlen an der Zahlengeraden ordnen und mit ihnen rechnen. · *EN: Absolute value and sign, ordering integers on the number line and calculating with them.* – Simulationen: `zahlengerade` (7)
  - 1.2 rationale Zahlen · *rational numbers* – Kurz: Zahlbereichserweiterung begründen, mit rationalen Zahlen rechnen und Rechengesetze nutzen. · *EN: Justifying the extension of the number system, calculating with rational numbers and using the laws of arithmetic.* – Simulationen: `zahlengerade` (7), `termbaum` (7)
  - 1.3 Prozente und Zinsen · *percentages and interest* – Kurz: Grundwert, Prozentwert und Prozentsatz, Darstellung mit Prozentstreifen, Kapital, Zinsen und Zinseszins. · *EN: Base, percentage value and rate, the percentage bar, capital, interest and compound interest.* – Simulationen: `prozentstreifen` (7)
  - 1.4 Ziehen von Quadratwurzeln als Rechenoperation · *square roots as an operation* – Kurz: Quadrat- und Kubikwurzeln mit dem Taschenrechner und im Kopf bestimmen. · *EN: Finding square and cube roots with a calculator and mentally.* – Simulationen: `quadratwurzel`
  - 1.5 reelle Zahlen · *real numbers* – Kurz: Irrationale Zahlen als nicht abbrechende, nicht periodische Dezimalzahlen, Näherungsverfahren wie Intervallschachtelung und Heron-Verfahren. · *EN: Irrational numbers as non-terminating, non-recurring decimals, approximation methods such as nested intervals and Heron’s method.* – Simulationen: `quadratwurzel`
  - 1.6 Potenzen · *powers* – Kurz: Potenzgesetze, negative und gebrochene Exponenten und die wissenschaftliche Schreibweise. · *EN: Laws of exponents, negative and fractional exponents and scientific notation.* – Simulationen: `zehnerpotenzen` (7)

### 2 Größen und Messen
*EN: Quantities and measurement*

- Kurz (DE): Flächeninhalte von n-Ecken, Kreis und Kreiszahl, Körperberechnungen, Sachaufgaben sowie zentrische Streckungen oder Strahlensätze.
- Kurz (EN): Areas of polygons, the circle and π, calculations with solids, word problems, and central enlargement or the intercept theorems.
- Simulationen: `flaechen-zerlegen`, `kreiszahl-pi`, `monte-carlo-pi`, `prisma-zylinder`, `pyramide-kegel-kugel`, `koerpernetze`, `strahlensaetze`, `vergroessern`
- Unterbereiche:
  - 2.1 Flächenberechnung an n-Ecken · *area of polygons* – Kurz: Dreiecke, Parallelogramm, Trapez, Drachen und Raute auf flächengleiche Rechtecke zurückführen, n-Ecke zerlegen und ergänzen. · *EN: Reducing triangles, parallelograms, trapezia, kites and rhombuses to rectangles of equal area, dissecting and completing polygons.* – Simulationen: `flaechen-zerlegen` (7, 8)
  - 2.2 einfache Berechnungen am Kreis · *simple calculations with circles* – Kurz: Kreisumfang und Kreisfläche, einen Näherungswert für π bestimmen. · *EN: Circumference and area of a circle, finding an approximation for π.* – Simulationen: `kreiszahl-pi` (8, 9), `monte-carlo-pi` (8, 9)
  - 2.3 Berechnungen an Körpern · *calculations with solids* – Kurz: Oberfläche und Volumen von Quader, Würfel, Prisma, Pyramide, Zylinder, Kegel und Kugel sowie zusammengesetzten Körpern. · *EN: Surface area and volume of cuboids, cubes, prisms, pyramids, cylinders, cones and spheres and of composite solids.* – Simulationen: `prisma-zylinder`, `pyramide-kegel-kugel`, `koerpernetze` (7, 8)
  - 2.4 Sachaufgaben · *word problems* – Kurz: Größen in Sachzusammenhängen bestimmen und Ergebnisse und Lösungsweg bewerten. · *EN: Finding quantities in real contexts and evaluating results and methods.* – Simulationen: –
  - 2.5 zentrische Streckungen oder Strahlensätze* · *central enlargement or intercept theorems** – Kurz: Streckenlängen mit Strahlensätzen oder zentrischer Streckung berechnen; der Streckfaktor geht in Längen, Flächen und Volumina linear, quadratisch oder kubisch ein. · *EN: Calculating lengths with the intercept theorems or central enlargement; the scale factor enters lengths, areas and volumes linearly, squared or cubed.* – Simulationen: `strahlensaetze` (8, 9), `vergroessern` (8, 9)

### 3 Strukturen und funktionaler Zusammenhang
*EN: Structures and functional relationships*

- Kurz (DE): Variablen und Terme, Funktionen mit ihren Darstellungsformen, proportionale, antiproportionale, lineare und quadratische Funktionen sowie lineare und quadratische Gleichungen.
- Kurz (EN): Variables and terms, functions and their representations, proportional, inversely proportional, linear and quadratic functions, and linear and quadratic equations.
- Simulationen: `termbaum`, `binomische-formeln`, `funktion-zuordnung`, `funktionsplotter`, `proportional`, `hyperbel`, `waagemodell`, `gleichungen-grafisch`, `lgs-grafisch`, `lineare-funktion`, `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`
- Unterbereiche:
  - 3.1 Variablen und Terme · *variables and terms* – Kurz: Terme aufstellen, berechnen und umformen, Summen multiplizieren, faktorisieren, binomische Formeln und quadratische Ergänzung. · *EN: Setting up, evaluating and transforming terms, multiplying sums, factorising, binomial formulas and completing the square.* – Simulationen: `termbaum` (7), `binomische-formeln` (7, 8)
  - 3.2 Funktionen und ihre Darstellungsformen · *functions and their representations* – Kurz: Zuordnungen und Funktionen in Text, Tabelle, Graph und Term, Schreibweise f(x), Definitions- und Wertemenge. · *EN: Relationships and functions in words, tables, graphs and terms, the notation f(x), domain and range.* – Simulationen: `funktion-zuordnung` (7, 8), `funktionsplotter` (8, 9)
  - 3.3 proportionale Funktionen · *proportional functions* – Kurz: Proportionale Zuordnungen mit Quotientengleichheit und Proportionalitätsfaktor. · *EN: Direct proportion with equal quotients and the constant of proportionality.* – Simulationen: `proportional` (7, 8)
  - 3.4 antiproportionale Funktionen · *inversely proportional functions* – Kurz: Antiproportionale Zuordnungen mit Produktgleichheit und ihre Graphen. · *EN: Inverse proportion with equal products and its graphs.* – Simulationen: `proportional` (7, 8), `hyperbel` (8, 9)
  - 3.5 Dreisatz · *rule of three* – Kurz: Sachprobleme mit Dreisatz und umgekehrtem Dreisatz lösen. · *EN: Solving real problems with the rule of three and its inverse.* – Simulationen: `proportional` (7, 8)
  - 3.6 lineare Gleichungen · *linear equations* – Kurz: Gleichungen durch Probieren, Umkehren und Äquivalenzumformungen lösen, auch als Schnittpunkt von Graphen; einfache Ungleichungen. · *EN: Solving equations by trial, inverse operations and equivalent transformations, also as intersections of graphs; simple inequalities.* – Simulationen: `waagemodell` (7), `gleichungen-grafisch` (8, 9)
  - 3.7 lineare Gleichungssysteme · *linear systems of equations* – Kurz: Systeme mit zwei Variablen lösen, auch über- und unterbestimmte. · *EN: Solving systems in two variables, including over- and underdetermined ones.* – Simulationen: `lgs-grafisch` (8, 9)
  - 3.8 lineare Funktionen · *linear functions* – Kurz: Gerade mit Steigung, Steigungsdreieck und Achsenschnittpunkten, lineares Wachstum, Bedeutung der Parameter. · *EN: Straight lines with slope, slope triangle and intercepts, linear growth, the meaning of the parameters.* – Simulationen: `lineare-funktion`, `funktionsplotter` (8, 9)
  - 3.9 quadratische Funktionen* · *quadratic functions** – Kurz: Parabeln mit Scheitelpunkt, Symmetrie und Achsenschnittpunkten, Normal-, Scheitelpunkts- und faktorisierte Form, Verschieben, Strecken und Spiegeln. · *EN: Parabolas with vertex, symmetry and intercepts, standard, vertex and factorised form, shifting, stretching and reflecting.* – Simulationen: `funktionsplotter` (8, 9), `quadratische-funktion` (9), `parabel-drei-punkte` (9), `extremwert-parabel` (9)
  - 3.10 quadratische Gleichungen* · *quadratic equations** – Kurz: Quadratische Gleichungen rechnerisch und grafisch lösen. · *EN: Solving quadratic equations algebraically and graphically.* – Simulationen: `gleichungen-grafisch` (8, 9), `quadratische-funktion` (9)

### 4 Raum und Form
*EN: Space and shape*

- Kurz (DE): Winkelsätze und Geometrie an Dreiecken, Vierecken und am Kreis, Kongruenz, Abbildungen, Satz des Pythagoras und Körper.
- Kurz (EN): Angle theorems and geometry of triangles, quadrilaterals and circles, congruence, transformations, Pythagoras’ theorem and solids.
- Simulationen: `winkel-geradenkreuzung`, `winkelsumme`, `besondere-linien`, `mittelsenkrechte`, `thales`, `vierecke`, `dreieckskonstruktion`, `spiegelung`, `pythagoras`, `koerpernetze`
- Unterbereiche:
  - 4.1 Geometrie an Dreiecken, Vierecken und am Kreis · *geometry of triangles, quadrilaterals and circles* – Kurz: Neben-, Scheitel-, Stufen- und Wechselwinkel, Innenwinkelsumme, Basiswinkelsatz, besondere Linien im Dreieck und der Satz des Thales. · *EN: Adjacent, vertical, corresponding and alternate angles, angle sum, base angle theorem, special lines in triangles and Thales’ theorem.* – Simulationen: `winkel-geradenkreuzung` (7), `winkelsumme` (7), `besondere-linien` (7, 8), `mittelsenkrechte` (7), `thales` (7), `vierecke` (7)
  - 4.2 Kongruenzsätze · *congruence criteria* – Kurz: Kongruenzsätze SSS, SWS, WSW und SSW und Dreieckskonstruktionen. · *EN: The congruence criteria SSS, SAS, ASA and SSA and constructing triangles.* – Simulationen: `dreieckskonstruktion` (7)
  - 4.3 Abbildungsgeometrie · *transformation geometry* – Kurz: Achsenspiegelung, Drehung, Punktspiegelung und Verschiebung. · *EN: Line reflection, rotation, point reflection and translation.* – Simulationen: `spiegelung` (7)
  - 4.4 Flächensätze am rechtwinkligen Dreieck · *area theorems in right triangles* – Kurz: Satz des Pythagoras und seine Umkehrung, pythagoreische Tripel; Höhen- und Kathetensatz zur Differenzierung. · *EN: Pythagoras’ theorem and its converse, Pythagorean triples; the altitude and leg theorems for differentiation.* – Simulationen: `pythagoras` (8, 9)
  - 4.5 Körper · *solids* – Kurz: Prismen, Pyramiden, Zylinder, Kegel und Kugeln mit Netzen und Schrägbildern. · *EN: Prisms, pyramids, cylinders, cones and spheres with nets and oblique drawings.* – Simulationen: `koerpernetze` (7, 8)

### 5 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Häufigkeiten und Wahrscheinlichkeit, mehrstufige Zufallsexperimente und beschreibende Statistik.
- Kurz (EN): Frequencies and probability, multi-stage random experiments and descriptive statistics.
- Simulationen: `gesetz-grosse-zahlen`, `diagramme`, `zaehlprinzip`, `baumdiagramm`, `geburtstagsproblem`, `boxplot`
- Unterbereiche:
  - 5.1 Häufigkeit · *frequency* – Kurz: Absolute und relative Häufigkeiten in Häufigkeitstabellen, Kreisdiagrammen und Histogrammen. · *EN: Absolute and relative frequencies in frequency tables, pie charts and histograms.* – Simulationen: `gesetz-grosse-zahlen`, `diagramme`
  - 5.2 Wahrscheinlichkeit · *probability* – Kurz: Wahrscheinlichkeit über das empirische Gesetz der großen Zahlen, Ereignisse und Laplace-Experimente. · *EN: Probability via the empirical law of large numbers, events and Laplace experiments.* – Simulationen: `gesetz-grosse-zahlen`
  - 5.3 mehrstufige Zufallsexperimente · *multi-stage random experiments* – Kurz: Zwei- und mehrstufige Zufallsexperimente im Baumdiagramm mit Additions- und Multiplikationsregel. · *EN: Two- and multi-stage experiments in tree diagrams with the sum and product rules.* – Simulationen: `zaehlprinzip`, `baumdiagramm` (8, 9), `geburtstagsproblem` (8, 9)
  - 5.4 Beschreibende Statistik · *descriptive statistics* – Kurz: Median und arithmetisches Mittel, Diagramme auswerten und kritisch prüfen. · *EN: Median and arithmetic mean, analysing charts and checking them critically.* – Simulationen: `boxplot`, `diagramme`

## Jahrgangsstufe 10  
*Grade 10*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Fachanforderungen Mathematik (2024), Kap. II.3, S. 45, mit Kap. II.2.2, S. 26–43)

> Jahrgangsstufe 10: Trigonometrie, Kreis und Körper auf höherem Niveau, trigonometrische und Exponentialfunktionen, Logarithmen und Ähnlichkeit. Die Leitideen Zahl und Operation sowie Daten und Zufall haben in der Verteilungstabelle für 10 keine eigenen Themen. Die Nummern sind von uns vergeben.

### 2 Größen und Messen
*EN: Quantities and measurement*

- Kurz (DE): Trigonometrie, Kreise und Kreissektoren und vertiefte Körperberechnungen.
- Kurz (EN): Trigonometry, circles and sectors, and further calculations with solids.
- Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`, `pyramide-kegel-kugel`
- Unterbereiche:
  - 2.1 Trigonometrie · *trigonometry* – Kurz: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck und am Einheitskreis, Sinussatz und Kosinussatz. · *EN: Sine, cosine and tangent in right triangles and on the unit circle, the sine rule and the cosine rule.* – Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`
  - 2.2 Berechnungen an Kreisen und Kreissektoren · *calculations with circles and sectors* – Kurz: Umfang und Flächeninhalt von Kreissektoren und zusammengesetzten Figuren, Bogenmaß. · *EN: Arc length and area of sectors and composite figures, radians.* – Simulationen: `einheitskreis`
  - 2.3 Vertiefung der Berechnungen an Körpern · *further calculations with solids* – Kurz: Körperberechnungen auf höherem Niveau, auch zusammengesetzte Körper mit Kegeln oder Kugeln. · *EN: Calculations with solids at a higher level, including composite solids with cones or spheres.* – Simulationen: `pyramide-kegel-kugel`

### 3 Strukturen und funktionaler Zusammenhang
*EN: Structures and functional relationships*

- Kurz (DE): Trigonometrische Funktionen, Exponentialfunktionen, Exponentialgleichungen und Logarithmen; Vertiefung der mit * gekennzeichneten Themen.
- Kurz (EN): Trigonometric functions, exponential functions, exponential equations and logarithms; deepening the topics marked *.
- Simulationen: `einheitskreis`, `sinusfunktion`, `transformationen`, `exponentielles-wachstum`, `grenzverhalten`, `logarithmus`, `quadratische-funktion`
- Unterbereiche:
  - 3.1 trigonometrische Funktionen · *trigonometric functions* – Kurz: Periodische Vorgänge, Projektion am Einheitskreis, Bogenmaß und die Bedeutung der Parameter a, b, c. · *EN: Periodic processes, projection on the unit circle, radians and the meaning of the parameters a, b, c.* – Simulationen: `einheitskreis`, `sinusfunktion`, `transformationen`
  - 3.2 Exponentialfunktionen · *exponential functions* – Kurz: Exponentielles Wachstum, Monotonie, Verdopplungs- und Halbwertszeit, asymptotisches Verhalten und Parameter. · *EN: Exponential growth, monotonicity, doubling time and half-life, asymptotic behaviour and parameters.* – Simulationen: `exponentielles-wachstum`, `grenzverhalten`, `transformationen`
  - 3.3 Exponentialgleichungen · *exponential equations* – Kurz: Exponentialgleichungen durch Probieren, grafisch und mit Logarithmen lösen. · *EN: Solving exponential equations by trial, graphically and with logarithms.* – Simulationen: `exponentielles-wachstum`, `logarithmus`
  - 3.4 Logarithmen · *logarithms* – Kurz: Den Logarithmus als Umkehrung des Potenzierens verstehen und nutzen. · *EN: Understanding and using the logarithm as the inverse of taking powers.* – Simulationen: `logarithmus`
  - 3.5 Vertiefung: quadratische Funktionen und Gleichungen* · *Deepening: quadratic functions and equations** – Kurz: Die mit * gekennzeichneten Themen aus 7–9 können in Klasse 10 vertieft werden. · *EN: The topics from grades 7–9 marked * can be deepened in grade 10.* – Simulationen: `quadratische-funktion`

### 4 Raum und Form
*EN: Space and shape*

- Kurz (DE): Ähnlichkeit von Figuren und Ähnlichkeitssatz für Dreiecke.
- Kurz (EN): Similarity of figures and the similarity criterion for triangles.
- Simulationen: `vergroessern`
- Unterbereiche:
  - 4.1 Ähnlichkeit · *similarity* – Kurz: Ähnliche Figuren und der Ähnlichkeitssatz für Dreiecke; Wirkung des Streckfaktors auf Längen, Flächen und Volumina. · *EN: Similar figures and the similarity criterion for triangles; the effect of the scale factor on lengths, areas and volumes.* – Simulationen: `vergroessern`

## Einführungsjahr (Jahrgangsstufe 11)  
*Introductory year (grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Fachanforderungen Mathematik (2024), Kap. III.3, S. 74, mit den Kerninhalten aus Kap. III.2.2, S. 60–73)

> Einführungsjahr der Oberstufe (G9: Jahrgangsstufe 11). Die Fachanforderungen ordnen die Themen der Sachgebiete Analysis, Geometrie und Stochastik den drei Oberstufenjahren zu; im Einführungsjahr ist die Zuordnung verbindlich. Die Nummern sind von uns vergeben.

### A Analysis
*EN: Calculus*

- Kurz (DE): Differenzialrechnung mit Extrem- und Wendepunkten.
- Kurz (EN): Differential calculus with extreme and inflection points.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `ganzrationale-funktionen`, `potenzfunktionen`, `transformationen`, `grenzverhalten`, `newton-verfahren`, `parabel-drei-punkte`, `funktionsplotter`, `kurvendiskussion`, `extremwertprobleme`
- Unterbereiche:
  - A.1 Differenzialrechnung · *differential calculus* – Kurz: Mittlere und lokale Änderungsrate, Differenzialquotient und Tangente, Ableitungsfunktion und grafisches Differenzieren, Ableitungsregeln, Funktionsklassen mit ihren Eigenschaften, Newton-Verfahren und Funktionen aus Bedingungen bestimmen. · *EN: Average and instantaneous rate of change, the derivative and tangent, the derivative function and graphical differentiation, differentiation rules, function classes and their properties, Newton’s method and finding functions from conditions.* – Simulationen: `sekante-tangente`, `ableitungsfunktion`, `ganzrationale-funktionen`, `potenzfunktionen`, `transformationen`, `grenzverhalten`, `newton-verfahren`, `parabel-drei-punkte`, `funktionsplotter`
  - A.2 Extrempunkte · *extreme points* – Kurz: Monotonie, Hoch- und Tiefpunkte mit notwendiger und hinreichender Bedingung, Rand- und globale Extrema, Optimierungsprobleme. · *EN: Monotonicity, maxima and minima with necessary and sufficient conditions, boundary and global extrema, optimisation problems.* – Simulationen: `kurvendiskussion`, `extremwertprobleme`
  - A.3 Wendepunkte · *inflection points* – Kurz: Zweite Ableitung, Links- und Rechtskrümmung, Wendepunkte, Wendetangente und Sattelpunkt. · *EN: The second derivative, concavity, inflection points, inflectional tangent and saddle point.* – Simulationen: `kurvendiskussion`

### G Geometrie
*EN: Geometry*

- Kurz (DE): Vektoren in der Ebene und im Raum, Geraden und ihre Lagebeziehungen.
- Kurz (EN): Vectors in the plane and in space, lines and their relative positions.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - G.1 Vektoren im ℝ² und ℝ³ · *vectors in ℝ² and ℝ³* – Kurz: Punkte und Körper im Koordinatensystem, Vektoren addieren und vervielfachen, Linearkombination und lineare Abhängigkeit. · *EN: Points and solids in the coordinate system, adding and scaling vectors, linear combinations and linear dependence.* – Simulationen: `koordinaten-3d`, `vektoren-3d`
  - G.2 Geraden · *lines* – Kurz: Geraden im Raum in Parameterform beschreiben, auch als Bewegungen. · *EN: Describing lines in space in parametric form, also as motions.* – Simulationen: `geraden-ebenen`
  - G.3 Lagebeziehungen von Geraden · *relative position of lines* – Kurz: Geraden auf Schnittpunkt, Parallelität und Windschiefe untersuchen. · *EN: Examining lines for intersection, parallelism and skewness.* – Simulationen: `lage-abstaende`

### S Stochastik
*EN: Probability and statistics*

- Kurz (DE): Grundbegriffe der Wahrscheinlichkeitsrechnung und bedingte Wahrscheinlichkeit.
- Kurz (EN): Basic concepts of probability and conditional probability.
- Simulationen: `geburtstagsproblem`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`
- Unterbereiche:
  - S.1 Grundbegriffe der Stochastik · *basic concepts of probability* – Kurz: Ergebnisse, Ereignisse und Gegenereignis, Vereinigung und Schnitt, relative Häufigkeit und Rechenregeln für Wahrscheinlichkeiten; Simulation mit dem Computer. · *EN: Outcomes, events and complements, union and intersection, relative frequency and rules of probability; simulation by computer.* – Simulationen: `geburtstagsproblem`
  - S.2 bedingte Wahrscheinlichkeit · *conditional probability* – Kurz: Bedingte Wahrscheinlichkeiten mit Vierfeldertafel, Baumdiagramm und inversem Baumdiagramm, stochastische Unabhängigkeit. · *EN: Conditional probabilities with two-way tables, tree diagrams and reversed tree diagrams, stochastic independence.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`

## 1. Jahr der Qualifikationsphase (Jahrgangsstufe 12)  
*First year of the qualification phase (grade 12)*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: Fachanforderungen Mathematik (2024), Kap. III.3, S. 74, mit Kap. III.2.2, S. 60–73)

> Erstes Jahr der Qualifikationsphase (G9: Jahrgangsstufe 12). Innerhalb der Qualifikationsphase dürfen Themen zwischen den beiden Jahren verschoben werden. Inhalte, die über das grundlegende Anforderungsniveau hinausgehen, sind für das erhöhte Niveau verbindlich. Die Nummern sind von uns vergeben.

### A Analysis
*EN: Calculus*

- Kurz (DE): Integralrechnung, e-Funktion und Vertiefung der Differenzial- und Integralrechnung.
- Kurz (EN): Integral calculus, the natural exponential function and further differential and integral calculus.
- Simulationen: `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`, `aenderungsrate`, `rotationskoerper`, `e-funktion`, `logarithmus`, `umkehrfunktion`, `kurvendiskussion`, `extremwertprobleme`, `ableitungsfunktion`
- Unterbereiche:
  - A.1 Integralrechnung · *integral calculus* – Kurz: Flächen mit Rechteckstreifen annähern, bestimmtes Integral als rekonstruierter Bestand, Integral- und Stammfunktion, Hauptsatz, Mittelwerte und Rotationskörper. · *EN: Approximating areas with rectangles, the definite integral as a reconstructed total, integral function and antiderivative, the fundamental theorem, mean values and solids of revolution.* – Simulationen: `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`, `aenderungsrate`, `rotationskoerper`
  - A.2 e-Funktion · *the natural exponential function* – Kurz: Die e-Funktion als ihre eigene Ableitung, ln als Umkehrfunktion und als Stammfunktion von 1/x, Exponentialgleichungen. · *EN: The exponential function as its own derivative, ln as its inverse and as an antiderivative of 1/x, exponential equations.* – Simulationen: `e-funktion`, `logarithmus`, `umkehrfunktion`
  - A.3 Vertiefung der Differenzial- und Integralrechnung · *further differential and integral calculus* – Kurz: Produkt- und Kettenregel, Untersuchung zusammengesetzter Funktionen, Optimierung und Integrationsregeln. · *EN: Product and chain rules, analysing combined functions, optimisation and integration rules.* – Simulationen: `kurvendiskussion`, `extremwertprobleme`, `ableitungsfunktion`

### G Geometrie
*EN: Geometry*

- Kurz (DE): Skalar- und Vektorprodukt, Ebenen, Lagebeziehungen und Abstände.
- Kurz (EN): Dot and cross product, planes, relative positions and distances.
- Simulationen: `skalar-vektorprodukt`, `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - G.1 Skalarprodukt · *dot product* – Kurz: Betrag von Vektoren, Winkel zwischen Vektoren, Geraden und Ebenen, Orthogonalität. · *EN: Length of vectors, angles between vectors, lines and planes, orthogonality.* – Simulationen: `skalar-vektorprodukt`
  - G.2 Ebenen · *planes* – Kurz: Ebenen in Parameter-, Koordinaten- und Normalenform. · *EN: Planes in parametric, coordinate and normal form.* – Simulationen: `geraden-ebenen`
  - G.3 Vektorprodukt · *cross product* – Kurz: Vektorprodukt für Normalenvektoren, Flächeninhalte von Dreiecken und Parallelogrammen und Spatvolumen. · *EN: The cross product for normal vectors, areas of triangles and parallelograms and the volume of a parallelepiped.* – Simulationen: `skalar-vektorprodukt`
  - G.4 Lagebeziehungen zwischen Geraden und Ebenen und zwischen Ebenen · *relative position of lines and planes and of two planes* – Kurz: Schnittmengen von Geraden und Ebenen und von Ebenen bestimmen, Lösen linearer Gleichungssysteme als Schnittproblem. · *EN: Finding intersections of lines and planes and of planes, solving linear systems as an intersection problem.* – Simulationen: `lage-abstaende`, `geraden-ebenen`
  - G.5 Abstände · *distances* – Kurz: Abstände zwischen Punkten, Geraden und Ebenen, Lotfußpunktverfahren. · *EN: Distances between points, lines and planes, the foot of the perpendicular.* – Simulationen: `lage-abstaende`

### S Stochastik
*EN: Probability and statistics*

- Kurz (DE): Zufallsgrößen mit Kenngrößen, Binomial-, hypergeometrische und Normalverteilung.
- Kurz (EN): Random variables and their parameters, binomial, hypergeometric and normal distributions.
- Simulationen: `galtonbrett`, `binomialverteilung`, `normalverteilung`
- Unterbereiche:
  - S.1 Zufallsgröße, Erwartungswert, Streuungsmaße · *random variable, expected value, measures of spread* – Kurz: Wahrscheinlichkeitsverteilungen als Prognose, Erwartungswert, Varianz und Standardabweichung, faires Spiel. · *EN: Probability distributions as predictions, expected value, variance and standard deviation, fair games.* – Simulationen: –
  - S.2 Binomialverteilung · *binomial distribution* – Kurz: Bernoulli-Ketten, Binomialkoeffizient, Binomialverteilung mit Erwartungswert und Standardabweichung, Sigma-Regeln. · *EN: Bernoulli chains, the binomial coefficient, the binomial distribution with expected value and standard deviation, sigma rules.* – Simulationen: `galtonbrett`, `binomialverteilung`
  - S.3 Hypergeometrische Verteilung · *hypergeometric distribution* – Kurz: Ziehen ohne Zurücklegen mit der hypergeometrischen Verteilung beschreiben. · *EN: Describing sampling without replacement with the hypergeometric distribution.* – Simulationen: –
  - S.4 Normalverteilung · *normal distribution* – Kurz: Dichtefunktion und Glockenkurve, Bedeutung von μ und σ, Näherung der Binomialverteilung nach Moivre-Laplace. · *EN: Density function and bell curve, the meaning of μ and σ, approximating the binomial distribution by de Moivre–Laplace.* – Simulationen: `normalverteilung`

## 2. Jahr der Qualifikationsphase (Jahrgangsstufe 13)  
*Second year of the qualification phase (grade 13)*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: Fachanforderungen Mathematik (2024), Kap. III.3, S. 74, mit Kap. III.2.2, S. 60–73)

> Zweites Jahr der Qualifikationsphase (G9: Jahrgangsstufe 13). Innerhalb der Qualifikationsphase dürfen Themen zwischen den beiden Jahren verschoben werden. Die Nummern sind von uns vergeben.

### A Analysis
*EN: Calculus*

- Kurz (DE): Funktionenscharen und Vertiefung der Differenzial- und Integralrechnung.
- Kurz (EN): Families of functions and further differential and integral calculus.
- Simulationen: `funktionenscharen`, `extremwertprobleme`, `hauptsatz`, `stammfunktion-grafisch`, `rotationskoerper`
- Unterbereiche:
  - A.1 Funktionenscharen · *families of functions* – Kurz: Funktionen mit Parameter untersuchen, Ortskurven charakteristischer Punkte. · *EN: Analysing functions with a parameter, loci of characteristic points.* – Simulationen: `funktionenscharen`
  - A.2 Vertiefung der Differenzial- und Integralrechnung · *further differential and integral calculus* – Kurz: Anwendungen der Analysis in Sachzusammenhängen, uneigentliche Integrale und Rotationskörper. · *EN: Applications of calculus in real contexts, improper integrals and solids of revolution.* – Simulationen: `extremwertprobleme`, `hauptsatz`, `stammfunktion-grafisch`, `rotationskoerper`

### G Geometrie
*EN: Geometry*

- Kurz (DE): Vertiefung der analytischen Geometrie.
- Kurz (EN): Further analytic geometry.
- Simulationen: `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - G.1 Vertiefung der analytischen Geometrie · *further analytic geometry* – Kurz: Geraden- und Ebenenscharen, Bewegungen im Raum und komplexere Lage- und Abstandsprobleme. · *EN: Families of lines and planes, motion in space and more complex problems of position and distance.* – Simulationen: `geraden-ebenen`, `lage-abstaende`

### S Stochastik
*EN: Probability and statistics*

- Kurz (DE): Signifikanztests und Schätzen von Wahrscheinlichkeiten.
- Kurz (EN): Significance tests and estimating probabilities.
- Simulationen: `signifikanztest`, `binomialverteilung`, `normalverteilung`
- Unterbereiche:
  - S.1 Signifikanztest · *significance test* – Kurz: Zwei- und einseitige Hypothesentests, Nullhypothese, Signifikanzniveau, Verwerfungsbereich und Fehler 1. und 2. Art. · *EN: Two- and one-sided hypothesis tests, null hypothesis, significance level, rejection region and type I and type II errors.* – Simulationen: `signifikanztest`
  - S.2 Schätzen von Wahrscheinlichkeiten · *estimating probabilities* – Kurz: Prognose- und Konfidenzintervalle aus einem Stichprobenergebnis durch systematisches Probieren bestimmen. · *EN: Finding prediction and confidence intervals from a sample result by systematic trial.* – Simulationen: `binomialverteilung`, `normalverteilung`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `schleswig-holstein-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/schleswig-holstein-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `cavalieri` | Das Prinzip von Cavalieri steht nicht in den Fachanforderungen. |
| `polstellen-asymptoten` | Gebrochenrationale Funktionen mit Polstellen sind nicht genannt; die Oberstufe nennt ganzrationale, Wurzel-, Potenz-, Exponential-, Logarithmus- und trigonometrische Funktionen sowie Verknüpfungen und Verkettungen. |
| `kugeln` | Kugeln kommen nur als Körper in der Sek. I vor; Kugelgleichung und Tangentialebene stehen nicht in den Fachanforderungen. |
| `matrix-abbildungen` | Matrizen nur als Koeffizientenmatrix beim Lösen linearer Gleichungssysteme (Gauß-Verfahren), keine Abbildungsmatrizen. |
| `taylor-polynome` | nicht in den Fachanforderungen (Hochschule); die Oberstufe nennt nur die lokale lineare Approximation |
| `fourier-reihen` | nicht in den Fachanforderungen (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **5/6:** 5.3 einstufige Zufallsexperimente
- **7–9:** 2.4 Sachaufgaben (übergreifend, kein eigenes Thema für eine Simulation)
- **12:** S.1 Zufallsgröße, Erwartungswert, Streuungsmaße; S.3 Hypergeometrische Verteilung

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Glücksrad und Laplace-Würfel | Einstufige Zufallsexperimente durchführen, Ergebnismenge und relative Häufigkeit ablesen | 5/6 5.3 |
| Erwartungswert beim Glücksspiel | Gewinnplan aufstellen, Verteilung als Säulendiagramm, Erwartungswert als Schwerpunkt, faires Spiel | 12 S.1 |
| Ziehen ohne Zurücklegen | Urne mit Kugeln, hypergeometrische und Binomialverteilung im Vergleich | 12 S.3 |

# Teil E – Einordnung und Unklarheiten

1. **Ein Dokument, G9.** Die Fachanforderungen gelten schulartübergreifend für Sek. I und Sek. II. Abgebildet ist das Gymnasium mit G9 (Abitur nach Jahrgangsstufe 13). Für G8 sagt die Verteilungstabelle, dass die Inhalte der Jahrgänge 7–10 in 6–9 zu behandeln sind; das ist nicht eigens abgebildet.
2. **Stufen aus der Verteilungstabelle.** Kap. II.3 gibt den verbindlichen Rahmen für die Verteilung der Inhalte vor: Jahrgänge 5/6, 7/8/9 und 10. Innerhalb dieses Rahmens entscheidet die Fachschaft. Deshalb stehen 5 und 6 sowie 7, 8 und 9 mit gleichen Lernbereichen; die Seite zeigt sie als „5/6“ und „7–9“. Für die Oberstufe ordnet Kap. III.3 die Themen dem Einführungsjahr und dem 1. und 2. Jahr der Qualifikationsphase zu; im G9 sind das die Jahrgangsstufen 11, 12 und 13 (Annahme, im Dokument steht keine Jahrgangszahl). In der Qualifikationsphase dürfen Themen zwischen den Jahren verschoben werden.
3. **Lernbereiche und Nummern.** Lernbereiche der Sek. I sind die fünf Leitideen (1 Zahl und Operation, 2 Größen und Messen, 3 Strukturen und funktionaler Zusammenhang, 4 Raum und Form, 5 Daten und Zufall), Unterbereiche die Themen der Verteilungstabelle. In Klasse 10 fehlen die Leitideen 1 und 5, weil die Tabelle dort nichts nennt; die Nummern der übrigen bleiben gleich. Oberstufe: A Analysis, G Geometrie, S Stochastik wie in der Themenübersicht. Die Kurzbeschreibungen fassen die Kerninhalte aus Kap. II.2.2 bzw. III.2.2 zusammen, die zu dem Thema gehören. Die Nummern sind selbst vergeben.
4. **10, 3.5 „Vertiefung: quadratische Funktionen und Gleichungen*“.** Die Tabelle sagt, die mit * gekennzeichneten Themen können in Klasse 10 vertieft werden. Dafür steht ein eigener Unterbereich, damit `quadratische-funktion` auch dort erscheint; die zentrischen Streckungen und Strahlensätze (*) sind über `vergroessern` bei 4.1 Ähnlichkeit vertreten.
5. **`sourceUrl`.** Das Dokument nennt keinen Link zur Datei. Verwendet ist `https://www.fachanforderungen.de/`, die Adresse, die das Impressum für Bestellungen nennt. Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`):

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `zehnerpotenzen` | 5–6 | 5–7 | 7–9 1.6 Potenzen | Kap. II.3: Potenzen in 7/8/9; Kap. II.2.2: Potenzgesetze, negative Exponenten, wissenschaftliche Schreibweise |
   | `vergroessern` | 8–9 | 8–10 | 10 4.1 Ähnlichkeit | Kap. II.3: Ähnlichkeit in 10; Kap. II.2.2: Ähnlichkeitssatz für Dreiecke, Wirkung des Streckfaktors auf Längen, Flächen und Volumina |

   Die Sortierung nach Klassenstufe ändert sich nicht, weil nur das Ende der Bereiche verschoben ist.
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `monte-carlo-pi` bei 7–9 2.2: Der Lehrplan verlangt einen Näherungswert für π und erlaubt auf der oberen Anforderungsebene verschiedene Approximationsverfahren; die Monte-Carlo-Methode nennt er nicht.
   - `geburtstagsproblem` bei 7–9 5.3 und 11 S.1: mehrstufige Zufallsexperimente bzw. Simulation mit dem Computer; das Problem selbst ist nicht genannt.
   - `ziegenproblem` bei 11 S.2: klassisches Beispiel für bedingte Wahrscheinlichkeit, nicht genannt.
   - `boxplot` bei 7–9 5.4: Median und Mittelwert stehen im Lehrplan, der Boxplot nicht.
   - `hyperbel` bei 7–9 3.4: der Graph antiproportionaler Funktionen; das Wort Hyperbel steht nicht im Lehrplan.
   - `zahlengerade` nur bei 7–9: Ganze Zahlen stehen in 7/8/9; die Fachschaft darf aber entscheiden, ob zuerst die positiven Bruchzahlen oder die ganzen Zahlen kommen.
   - `potenzfunktionen` und `transformationen` bei 11 A.1: Die Oberstufe nennt Potenzfunktionen f(x) = xq und das Verschieben, Strecken und Spiegeln von Graphen ohne Jahresangabe; sie stehen beim Einführungsjahr, weil die Differenzialrechnung dort beginnt.
   - `grenzverhalten` bei 10 3.2 (asymptotisches Verhalten von Exponentialfunktionen) und 11 A.1 (Grenzwerte).
   - `massstab` bei 5/6 2.1: maßstäbliche Umrechnungen stehen bei Größen und Messen ohne Jahr.
   - `rotationskoerper` bei 12 A.1 und 13 A.2: Rotationskörper stehen unter Messen in der Oberstufe ohne Jahr.
