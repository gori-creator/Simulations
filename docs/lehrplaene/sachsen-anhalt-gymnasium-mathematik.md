# Sachsen-Anhalt · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I und gymnasiale Oberstufe (ein Dokument) |
|---|---|
| Bundesland | Sachsen-Anhalt |
| Schulart | Gymnasium, Schuljahrgänge 5–12 |
| Fach | Mathematik |
| Name des Lehrplans | „Fachlehrplan Gymnasium Mathematik“, Herausgeber: Ministerium für Bildung des Landes Sachsen-Anhalt; „Der Lehrplan für das Gymnasium ist eine Einheit aus Grundsatzband und Fachlehrplänen“ (der Grundsatzband lag nicht vor und wird nicht gebraucht) |
| Jahr / Stand | Stand 01.08.2022; „In Kraft seit 2015, Anpassung 2022“ (angepasst an die Oberstufenverordnung von 2013 mit Änderungen 2016 und 2019 sowie an die Schwerpunkte Nachhaltigkeit, Bildung in der digitalen Welt und Bildungssprache) |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `FLP_Mathe_Gym_010822_swd.pdf` (70 Seiten) |
| Link laut Dokument | „Quelle: Landesportal Sachsen-Anhalt (http://www.lisa.sachsen-anhalt.de)“ in der Fußzeile jeder Seite; in `sourceUrl` als `https://www.lisa.sachsen-anhalt.de/` (der Test verlangt https; Erreichbarkeit hier nicht prüfbar, der Proxy sperrt die Seite). Kein Link zur einzelnen Datei; Vermerk statt `ABGABE.md` hier und im Pull Request |
| Lizenz laut Dokument | Creative Commons CC BY-SA 3.0 |
| G8/G9 | G8: Abitur nach Schuljahrgang 12; Schuljahrgang 10 ist die Einführungsphase, 11/12 die Qualifikationsphase |
| Niveaus / Wahl | Qualifikationsphase mit grundlegendem (gA) und erhöhtem Anforderungsniveau (eA) in getrennten Kapiteln |
| Struktur | Schuljahrgänge 5/6, 7/8, 9, 10, 11/12 → Inhaltsbereich (Sek. I: Zahlen und Größen, Raum und Form, Zuordnungen und Funktionen, Daten und Zufall; ab 10: Analysis, Analytische Geometrie, Stochastik) → Kompetenzschwerpunkt mit inhaltsbezogenen Kompetenzen und grundlegenden Wissensbeständen; keine Nummern |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Schuljahrgänge 5/6 | 5, 6 | 4 | 13 | 12 | 27 |
| Schuljahrgänge 7/8 | 7, 8 | 4 | 12 | 12 | 25 |
| Schuljahrgang 9 | 9 | 4 | 4 | 4 | 12 |
| Schuljahrgang 10 (Einführungsphase) | 10 | 3 | 3 | 2 | 14 |
| Schuljahrgänge 11/12 (Qualifikationsphase) – grundlegendes und erhöhtes Anforderungsniveau | 11, 12 | 6 | 15 | 13 | 24 |

Insgesamt verwendet: **87 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `cavalieri`, `signifikanztest`, `taylor-polynome`, `fourier-reihen`, `kugeln`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Schuljahrgänge 5/6  
*Grades 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Fachlehrplan Gymnasium Mathematik (Stand 01.08.2022), Kap. 3.2, S. 35–42)

> Schuljahrgänge 5/6: Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam; die Lernbereiche stehen deshalb bei 5 und 6 gleich, und beide werden als eine Stufe gezeigt. Lernbereiche sind die Inhaltsbereiche mit ihren Kompetenzschwerpunkten; der Lehrplan nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Zahlen und Größen
*EN: Numbers and quantities*

- Kurz (DE): Natürliche Zahlen und Teilbarkeit, erste Gleichungen, Brüche und Dezimalbrüche, Größen mit ihren Einheiten sowie das Rechnen mit gebrochenen Zahlen.
- Kurz (EN): Natural numbers and divisibility, first equations, fractions and decimals, quantities with their units, and calculating with non-negative rational numbers.
- Simulationen: `stellenwerte`, `zehnerpotenzen`, `primfaktoren`, `termbaum`, `zahlengerade`, `einheiten`, `massstab`, `bruchteile`, `brueche-vergleichen`, `brueche-rechnen`, `dezimalbrueche`
- Unterbereiche:
  - 1.1 Natürliche Zahlen · *Natural numbers* – Kurz: Große Zahlen lesen, ordnen und runden, im Kopf und schriftlich rechnen, Potenzen bilden, Teiler und Primfaktoren bestimmen; erste negative Zahlen an der Zahlengeraden. · *EN: Reading, ordering and rounding large numbers, mental and written arithmetic, powers, divisors and prime factors; first negative numbers on the number line.* – Simulationen: `stellenwerte` (5), `zehnerpotenzen`, `primfaktoren`, `termbaum`, `zahlengerade`
  - 1.2 Gleichungen und Ungleichungen · *Equations and inequalities* – Kurz: Begriffe Variable, Gleichung und Lösung; einfache Gleichungen und Ungleichungen durch Überlegen oder mit Umkehroperationen lösen und die Probe machen. · *EN: The terms variable, equation and solution; solving simple equations and inequalities by reasoning or with inverse operations, and checking the result.* – Simulationen: –
  - 1.3 Brüche · *Fractions* – Kurz: Brüche als Teile eines Ganzen darstellen, erweitern und kürzen, gleichnamige Brüche vergleichen und addieren, Dezimalbrüche in der Stellenwerttafel. · *EN: Showing fractions as parts of a whole, expanding and simplifying them, comparing and adding like fractions, decimals in the place-value chart.* – Simulationen: `bruchteile` (6), `brueche-vergleichen` (6)
  - 1.4 Größen · *Quantities* – Kurz: Längen, Flächen, Volumen, Massen, Zeit und Geld messen, schätzen und in andere Einheiten umrechnen; Maßstab. · *EN: Measuring and estimating length, area, volume, mass, time and money and converting between units; scale.* – Simulationen: `einheiten` (5), `massstab` (5)
  - 1.5 Gebrochene Zahlen · *Non-negative rational numbers* – Kurz: Mit gemeinen Brüchen und Dezimalbrüchen in allen Grundrechenarten rechnen, beide Schreibweisen umwandeln und periodische Dezimalbrüche kennenlernen; Zahlenbereiche vergleichen. · *EN: All four operations with fractions and decimals, converting between both notations and meeting recurring decimals; comparing number sets.* – Simulationen: `zahlengerade`, `brueche-rechnen` (6), `dezimalbrueche` (6)

### 2 Raum und Form
*EN: Space and shape*

- Kurz (DE): Grundbegriffe der Geometrie und Abbildungen, Winkel an Geraden, Umfang, Flächeninhalt und Volumen sowie Dreiecke und Vierecke.
- Kurz (EN): Basic geometric concepts and transformations, angles at lines, perimeter, area and volume, and triangles and quadrilaterals.
- Simulationen: `koordinaten-lage`, `winkel-messen`, `umfang-flaeche`, `koerpernetze`, `vierecke`, `spiegelung`, `winkel-geradenkreuzung`, `quader-volumen`, `winkelsumme`, `dreieckskonstruktion`, `besondere-linien`, `mittelsenkrechte`, `flaechen-zerlegen`
- Unterbereiche:
  - 2.1 Geometrische Grundbegriffe und Abbildungen · *Basic geometric concepts and transformations* – Kurz: Punkte, Geraden und Strecken, parallel und senkrecht, Koordinatensystem, Winkel messen und zeichnen; Achsensymmetrie, Spiegelung, Verschiebung und Drehung. · *EN: Points, lines and segments, parallel and perpendicular, coordinate system, measuring and drawing angles; line symmetry, reflection, translation and rotation.* – Simulationen: `koordinaten-lage` (5), `winkel-messen` (5), `spiegelung` (6)
  - 2.2 Winkelbeziehungen · *Angle relationships* – Kurz: Neben-, Scheitel-, Stufen- und Wechselwinkel erkennen und damit Winkel berechnen und Aussagen begründen. · *EN: Recognising adjacent, vertical, corresponding and alternate angles and using them to calculate angles and justify statements.* – Simulationen: `winkel-geradenkreuzung` (6)
  - 2.3 Umfang, Flächeninhalt und Volumen · *Perimeter, area and volume* – Kurz: Umfang und Flächeninhalt von Rechtecken, Netze und Schrägbilder von Quadern, Oberflächeninhalt und Volumen von Quader und Würfel. · *EN: Perimeter and area of rectangles, nets and oblique drawings of cuboids, surface area and volume of cuboids and cubes.* – Simulationen: `umfang-flaeche` (5), `koerpernetze`, `quader-volumen` (6)
  - 2.4 Dreiecke · *Triangles* – Kurz: Dreiecksarten, Innenwinkelsatz, Kongruenzsätze und Dreieckskonstruktionen; Höhen, Winkelhalbierende und Mittelsenkrechte mit Inkreis und Umkreis; Umfang und Flächeninhalt. · *EN: Types of triangle, the angle sum, congruence criteria and constructions; altitudes, angle bisectors and perpendicular bisectors with incircle and circumcircle; perimeter and area.* – Simulationen: `winkelsumme` (6), `dreieckskonstruktion` (6), `besondere-linien` (6), `mittelsenkrechte` (6), `flaechen-zerlegen` (6)
  - 2.5 Vierecke · *Quadrilaterals* – Kurz: Vierecksarten und ihre Beziehungen, Eigenschaften von Seiten, Diagonalen und Winkeln, Vierecke konstruieren, Umfang und Flächeninhalt besonderer Vierecke. · *EN: Types of quadrilateral and how they relate, properties of sides, diagonals and angles, constructing quadrilaterals, perimeter and area of special quadrilaterals.* – Simulationen: `vierecke`, `flaechen-zerlegen` (6)

### 3 Zuordnungen und Funktionen
*EN: Relationships and functions*

- Kurz (DE): Zuordnungen in Alltag und Mathematik beschreiben und direkt oder indirekt proportionale Zusammenhänge erkennen.
- Kurz (EN): Describing relationships in everyday life and mathematics and recognising direct and inverse proportion.
- Simulationen: `proportional`
- Unterbereiche:
  - 3.1 Zuordnungen, direkte und indirekte Proportionalität · *Relationships, direct and inverse proportion* – Kurz: Zuordnungen in Tabelle, Diagramm und Pfeilbild darstellen, auf Proportionalität prüfen und mit dem Dreisatz rechnen. · *EN: Showing relationships in tables, graphs and arrow diagrams, testing them for proportionality and using the rule of three.* – Simulationen: `proportional` (6)

### 4 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Daten erheben, übersichtlich darstellen und mit Kenngrößen wie dem Mittelwert auswerten.
- Kurz (EN): Collecting data, presenting it clearly and analysing it with measures such as the mean.
- Simulationen: `diagramme`, `boxplot`
- Unterbereiche:
  - 4.1 Erfassen, Darstellen und Auswerten von Daten · *Collecting, displaying and analysing data* – Kurz: Erhebungen planen, Daten in Strichlisten und Häufigkeitstabellen erfassen und als Säulen- oder Balkendiagramm darstellen und lesen. · *EN: Planning surveys, recording data in tally charts and frequency tables, and drawing and reading bar charts.* – Simulationen: `diagramme` (6)
  - 4.2 Kenngrößen von Daten · *Statistical measures* – Kurz: Arithmetisches Mittel berechnen und deuten, dazu Modalwert, Median und Spannweite. · *EN: Calculating and interpreting the mean, together with mode, median and range.* – Simulationen: `boxplot` (6)

## Schuljahrgänge 7/8  
*Grades 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: Fachlehrplan Gymnasium Mathematik (Stand 01.08.2022), Kap. 3.3, S. 43–49)

> Schuljahrgänge 7/8: Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam; die Lernbereiche stehen deshalb bei 7 und 8 gleich, und beide werden als eine Stufe gezeigt. Lernbereiche sind die Inhaltsbereiche mit ihren Kompetenzschwerpunkten; der Lehrplan nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Zahlen und Größen
*EN: Numbers and quantities*

- Kurz (DE): Prozent- und Zinsrechnung, rationale Zahlen und Quadratwurzeln, Gleichungen mit Äquivalenzumformungen und das Umformen von Termen.
- Kurz (EN): Percentages and interest, rational numbers and square roots, equations solved by equivalent transformations, and rearranging terms.
- Simulationen: `prozentstreifen`, `zahlengerade`, `waagemodell`, `termbaum`, `binomische-formeln`, `quadratwurzel`
- Unterbereiche:
  - 1.1 Prozentrechnung · *Percentages* – Kurz: Grundwert, Prozentwert und Prozentsatz bestimmen, auch bei Rabatt, Zinsen und Zinseszins; Prozente im Kreisdiagramm. · *EN: Finding base value, percentage value and rate, including discounts, interest and compound interest; percentages in pie charts.* – Simulationen: `prozentstreifen` (7)
  - 1.2 Rationale Zahlen und Wurzeln · *Rational numbers and roots* – Kurz: Mit positiven und negativen Zahlen rechnen, Zahlenbereiche unterscheiden, Wurzeln ziehen und erkennen, dass √2 nicht rational ist. · *EN: Calculating with positive and negative numbers, distinguishing number sets, taking roots and seeing that √2 is not rational.* – Simulationen: `zahlengerade` (7), `quadratwurzel` (8)
  - 1.3 Gleichungen und Ungleichungen · *Equations and inequalities* – Kurz: Lineare Gleichungen, Verhältnisgleichungen und Ungleichungen mit Äquivalenzumformungen lösen, Formeln umstellen und Sachaufgaben damit lösen. · *EN: Solving linear equations, proportions and inequalities by equivalent transformations, rearranging formulas and applying them to word problems.* – Simulationen: `waagemodell` (7)
  - 1.4 Arbeiten mit Variablen · *Working with variables* – Kurz: Termstrukturen erkennen, ausmultiplizieren, ausklammern und mit den binomischen Formeln umformen; einfache Beweise mit Variablen. · *EN: Recognising term structure, expanding, factoring and using the binomial formulas; simple proofs with variables.* – Simulationen: `termbaum` (7), `binomische-formeln` (7)

### 2 Raum und Form
*EN: Space and shape*

- Kurz (DE): Kreise und Winkelsätze am Kreis, Darstellung und Berechnung von Körpern, Ähnlichkeit und die Satzgruppe des Pythagoras.
- Kurz (EN): Circles and circle angle theorems, drawing and calculating solids, similarity and the Pythagorean group of theorems.
- Simulationen: `thales`, `koerpernetze`, `kreiszahl-pi`, `prisma-zylinder`, `pyramide-kegel-kugel`, `strahlensaetze`, `vergroessern`, `pythagoras`
- Unterbereiche:
  - 2.1 Kreise · *Circles* – Kurz: Kreis und Gerade, Tangenten, Peripherie- und Zentriwinkelsatz, Satz des Thales; Umfang und Flächeninhalt mit der Kreiszahl π. · *EN: Circles and lines, tangents, inscribed and central angle theorems, Thales’ theorem; circumference and area with π.* – Simulationen: `thales` (7), `kreiszahl-pi` (8)
  - 2.2 Körperdarstellung · *Representing solids* – Kurz: Prismen, Pyramiden, Zylinder und Kegel erkennen, als Netz, Schrägbild und Zweitafelbild darstellen. · *EN: Recognising prisms, pyramids, cylinders and cones and drawing them as nets, oblique drawings and two-view projections.* – Simulationen: `koerpernetze`
  - 2.3 Körperberechnung · *Calculating solids* – Kurz: Oberflächeninhalt und Volumen von Prisma, Zylinder, Pyramide, Kegel und Kugel berechnen, auch bei zusammengesetzten Körpern. · *EN: Calculating surface area and volume of prisms, cylinders, pyramids, cones and spheres, including composite solids.* – Simulationen: `prisma-zylinder` (8), `pyramide-kegel-kugel` (8)
  - 2.4 Ähnlichkeit · *Similarity* – Kurz: Streckenverhältnisse und Maßstab, zentrische Streckung, ähnliche Figuren erkennen und Längen über Ähnlichkeit berechnen. · *EN: Ratios of lengths and scale, enlargement from a centre, recognising similar figures and calculating lengths using similarity.* – Simulationen: `strahlensaetze` (8), `vergroessern` (8)
  - 2.5 Satzgruppe des Pythagoras · *Pythagorean group of theorems* – Kurz: Satz des Pythagoras, Höhensatz und Kathetensatz aufstellen und damit Seiten in rechtwinkligen Dreiecken berechnen. · *EN: Setting up Pythagoras’ theorem, the altitude theorem and Euclid’s leg theorem and using them to find sides of right triangles.* – Simulationen: `pythagoras` (8)

### 3 Zuordnungen und Funktionen
*EN: Relationships and functions*

- Kurz (DE): Der Funktionsbegriff am Beispiel linearer Funktionen mit ihren Darstellungen und Eigenschaften.
- Kurz (EN): The concept of a function, using linear functions with their representations and properties.
- Simulationen: `lineare-funktion`, `funktion-zuordnung`, `lgs-grafisch`, `gleichungen-grafisch`, `funktionsplotter`
- Unterbereiche:
  - 3.1 Lineare Funktionen · *Linear functions* – Kurz: Funktionsbegriff und Darstellungsformen, Steigung und y-Achsenabschnitt, Nullstellen und Schnittpunkte zweier Geraden rechnerisch und grafisch. · *EN: The concept of a function and its representations, slope and y-intercept, zeros and the intersection of two lines, by calculation and graphically.* – Simulationen: `lineare-funktion`, `funktion-zuordnung` (8), `lgs-grafisch` (8), `gleichungen-grafisch` (8), `funktionsplotter` (8)

### 4 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Zufallsversuche, Häufigkeiten und Wahrscheinlichkeiten, auch bei mehrstufigen Versuchen mit Baumdiagramm.
- Kurz (EN): Random experiments, frequencies and probabilities, including multi-stage experiments with tree diagrams.
- Simulationen: `gesetz-grosse-zahlen`, `zaehlprinzip`, `monte-carlo-pi`, `vierfeldertafel`, `baumdiagramm`, `geburtstagsproblem`
- Unterbereiche:
  - 4.1 Zufällige Ereignisse, Häufigkeiten, Wahrscheinlichkeiten · *Random events, frequencies, probabilities* – Kurz: Zufallsversuche durchführen und simulieren, relative Häufigkeiten als Schätzwerte nutzen, Ereignisse mit Mengendiagramm und Vierfeldertafel darstellen, Laplace-Wahrscheinlichkeiten berechnen. · *EN: Carrying out and simulating random experiments, using relative frequencies as estimates, showing events in Venn diagrams and two-way tables, calculating Laplace probabilities.* – Simulationen: `gesetz-grosse-zahlen`, `monte-carlo-pi` (8), `vierfeldertafel` (8)
  - 4.2 Mehrstufige Zufallsversuche und Wahrscheinlichkeiten · *Multi-stage random experiments and probabilities* – Kurz: Mehrstufige Versuche im Baumdiagramm darstellen, Pfadregeln anwenden, Urnenmodelle mit und ohne Zurücklegen nutzen. · *EN: Showing multi-stage experiments in tree diagrams, applying the path rules, using urn models with and without replacement.* – Simulationen: `zaehlprinzip`, `baumdiagramm` (8), `geburtstagsproblem` (8)

## Schuljahrgang 9  
*Grade 9*  
Jahrgangsstufe(n) im JSON: 9  
(Quelle: Fachlehrplan Gymnasium Mathematik (Stand 01.08.2022), Kap. 3.4, S. 50–52)

> Schuljahrgang 9. Lernbereiche sind die Inhaltsbereiche mit ihren Kompetenzschwerpunkten; der Lehrplan nummeriert sie nicht, die Nummern sind von uns vergeben.

### 1 Zahlen und Größen
*EN: Numbers and quantities*

- Kurz (DE): Potenzen mit rationalen Exponenten, Wurzeln und Logarithmen.
- Kurz (EN): Powers with rational exponents, roots and logarithms.
- Simulationen: `quadratwurzel`, `logarithmus`
- Unterbereiche:
  - 1.1 Potenzen und Logarithmen · *Powers and logarithms* – Kurz: Potenz-, Wurzel- und Logarithmengesetze anwenden, die drei Schreibweisen ineinander übersetzen und Zahlen mit abgetrennten Zehnerpotenzen schreiben. · *EN: Applying the laws of powers, roots and logarithms, translating between the three notations and writing numbers in scientific notation.* – Simulationen: `quadratwurzel`, `logarithmus`

### 2 Raum und Form
*EN: Space and shape*

- Kurz (DE): Berechnungen an Dreiecken mit Sinus, Kosinus und Tangens.
- Kurz (EN): Calculations in triangles with sine, cosine and tangent.
- Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`
- Unterbereiche:
  - 2.1 Trigonometrie · *Trigonometry* – Kurz: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Sinussatz, Kosinussatz und Flächeninhaltssatz für beliebige Dreiecke. · *EN: Sine, cosine and tangent in right triangles, the sine rule, cosine rule and area formula for any triangle.* – Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`

### 3 Zuordnungen und Funktionen
*EN: Relationships and functions*

- Kurz (DE): Quadratische Gleichungen und Funktionen und ihre Anwendung.
- Kurz (EN): Quadratic equations and functions and their applications.
- Simulationen: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`, `gleichungen-grafisch`
- Unterbereiche:
  - 3.1 Quadratische Gleichungen und quadratische Funktionen · *Quadratic equations and quadratic functions* – Kurz: Quadratische Gleichungen lösen und ihre Lösbarkeit untersuchen, Parabeln zeichnen, Scheitelpunkt und Nullstellen bestimmen und den Einfluss der Parameter beschreiben. · *EN: Solving quadratic equations and examining how many solutions they have, drawing parabolas, finding vertex and zeros and describing the effect of the parameters.* – Simulationen: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`, `gleichungen-grafisch`

### 4 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Häufigkeitsverteilungen darstellen und mit Lage- und Streumaßen beschreiben.
- Kurz (EN): Displaying frequency distributions and describing them with measures of centre and spread.
- Simulationen: `boxplot`, `gesetz-grosse-zahlen`, `galtonbrett`
- Unterbereiche:
  - 4.1 Häufigkeitsverteilungen · *Frequency distributions* – Kurz: Daten in Klassen einteilen und als Histogramm oder Boxplot darstellen, Lage- und Streumaße bestimmen und Verteilungen auch durch Simulation erzeugen. · *EN: Grouping data into classes and showing them as histograms or box plots, finding measures of centre and spread and also creating distributions by simulation.* – Simulationen: `boxplot`, `gesetz-grosse-zahlen`, `galtonbrett`

## Schuljahrgang 10 (Einführungsphase)  
*Grade 10 (introductory phase)*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Fachlehrplan Gymnasium Mathematik (Stand 01.08.2022), Kap. 3.5, S. 53–56)

> Schuljahrgang 10 ist in Sachsen-Anhalt die Einführungsphase der gymnasialen Oberstufe (Abitur nach Klasse 12). Die Inhaltsbereiche heißen ab hier Analysis, Analytische Geometrie und Stochastik; die Nummern sind von uns vergeben.

### 1 Analysis
*EN: Calculus*

- Kurz (DE): Wichtige Funktionsklassen mit Graphen, Eigenschaften und Parametern als Grundlage der Analysis.
- Kurz (EN): Important families of functions with their graphs, properties and parameters as a basis for calculus.
- Simulationen: `potenzfunktionen`, `hyperbel`, `ganzrationale-funktionen`, `exponentielles-wachstum`, `logarithmus`, `einheitskreis`, `sinusfunktion`, `transformationen`, `umkehrfunktion`, `grenzverhalten`, `funktionsplotter`
- Unterbereiche:
  - 1.1 Funktionsklassen · *Families of functions* – Kurz: Potenz-, Exponential-, Sinus- und Kosinusfunktionen, in einfachen Fällen auch Wurzel- und Logarithmusfunktionen: Graphen, Eigenschaften, Einfluss der Parameter, Umkehrfunktionen, Wachstum und periodische Vorgänge. · *EN: Power, exponential, sine and cosine functions, and in simple cases root and logarithmic functions: graphs, properties, effect of parameters, inverse functions, growth and periodic processes.* – Simulationen: `potenzfunktionen`, `hyperbel`, `ganzrationale-funktionen`, `exponentielles-wachstum`, `logarithmus`, `einheitskreis`, `sinusfunktion`, `transformationen`, `umkehrfunktion`, `grenzverhalten`, `funktionsplotter`

### 2 Analytische Geometrie
*EN: Analytic geometry*

- Kurz (DE): Vektoren im räumlichen Koordinatensystem und das Rechnen mit ihnen.
- Kurz (EN): Vectors in the 3D coordinate system and calculating with them.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`
- Unterbereiche:
  - 2.1 Vektoren · *Vectors* – Kurz: Räumliches Koordinatensystem, Vektoren addieren und vervielfachen, lineare Abhängigkeit, Gleichungssysteme mit drei Variablen, Skalarprodukt, Winkel und Vektorprodukt. · *EN: The 3D coordinate system, adding and scaling vectors, linear dependence, systems of equations in three variables, dot product, angles and cross product.* – Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`

### 3 Stochastik
*EN: Probability and statistics*

- Kurz (DE): Zufallsgrößen mit Verteilung, Erwartungswert und Standardabweichung.
- Kurz (EN): Random variables with their distribution, expected value and standard deviation.
- Simulationen: –
- Unterbereiche:
  - 3.1 Zufallsgrößen · *Random variables* – Kurz: Ereignisse mit Zufallsgrößen beschreiben, Wahrscheinlichkeitsverteilungen aufstellen, Erwartungswert und Standardabweichung berechnen und deuten. · *EN: Describing events with random variables, setting up probability distributions, calculating and interpreting expected value and standard deviation.* – Simulationen: –

## Schuljahrgänge 11/12 (Qualifikationsphase) – grundlegendes und erhöhtes Anforderungsniveau  
*Grades 11/12 (qualification phase) – basic and higher level*  
Jahrgangsstufe(n) im JSON: 11, 12  
(Quelle: Fachlehrplan Gymnasium Mathematik (Stand 01.08.2022), Kap. 3.6.1, S. 58–63, und 3.6.2, S. 64–70)

> Qualifikationsphase (Schuljahrgänge 11/12): Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam, getrennt nach grundlegendem (gA) und erhöhtem Anforderungsniveau (eA). Die Lernbereiche stehen deshalb bei 11 und 12 gleich, und beide werden als eine Stufe gezeigt. Die Nummern sind von uns vergeben.

### gA-1 Analysis (grundlegendes Anforderungsniveau)
*EN: Calculus (basic level)*

- Kurz (DE): Grenzwerte und Ableitung, Untersuchung von Funktionen und Integralrechnung im grundlegenden Anforderungsniveau.
- Kurz (EN): Limits and derivatives, analysing functions and integral calculus at the basic level.
- Simulationen: `grenzverhalten`, `polstellen-asymptoten`, `sekante-tangente`, `ableitungsfunktion`, `ganzrationale-funktionen`, `kurvendiskussion`, `extremwertprobleme`, `e-funktion`, `stammfunktion-grafisch`, `ober-untersummen`, `hauptsatz`, `aenderungsrate`
- Unterbereiche:
  - gA-1.1 Grundlagen der Infinitesimalrechnung · *Foundations of calculus* – Kurz: Verhalten von Funktionen im Unendlichen und an einer Stelle, Grenzwerte, mittlere und lokale Änderungsrate, Ableitung als Tangentensteigung. · *EN: Behaviour of functions at infinity and near a point, limits, average and instantaneous rate of change, the derivative as the slope of the tangent.* – Simulationen: `grenzverhalten`, `polstellen-asymptoten`, `sekante-tangente` (11), `ableitungsfunktion`
  - gA-1.2 Differentialrechnung · *Differential calculus* – Kurz: Ableitungsregeln für ganzrationale Funktionen, die e-Funktion sowie Sinus und Kosinus; Monotonie, Krümmung, Extrem- und Wendepunkte, Tangenten und Extremwertaufgaben. · *EN: Differentiation rules for polynomials, the natural exponential function and sine and cosine; monotonicity, curvature, extreme and inflection points, tangents and optimisation problems.* – Simulationen: `ganzrationale-funktionen` (11), `ableitungsfunktion`, `kurvendiskussion`, `extremwertprobleme`, `e-funktion` (12), `stammfunktion-grafisch` (12)
  - gA-1.3 Integralrechnung · *Integral calculus* – Kurz: Stammfunktionen, das bestimmte Integral als rekonstruierter Bestand und als Flächeninhalt, Hauptsatz der Differential- und Integralrechnung. · *EN: Antiderivatives, the definite integral as a reconstructed total and as an area, the fundamental theorem of calculus.* – Simulationen: `ober-untersummen` (12), `hauptsatz` (12), `aenderungsrate` (12), `stammfunktion-grafisch` (12)

### gA-2 Analytische Geometrie (grundlegendes Anforderungsniveau)
*EN: Analytic geometry (basic level)*

- Kurz (DE): Geraden, Ebenen und Kreise mit Gleichungen beschreiben und ihre Lage untersuchen.
- Kurz (EN): Describing lines, planes and circles by equations and examining how they lie.
- Simulationen: `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - gA-2.1 Geraden und Ebenen · *Lines and planes* – Kurz: Geraden und Ebenen durch Gleichungen beschreiben, Lage von Gerade und Gerade oder Gerade und Ebene untersuchen, Schnittpunkte, Winkel und Abstände berechnen. · *EN: Describing lines and planes by equations, examining how two lines or a line and a plane lie, calculating intersections, angles and distances.* – Simulationen: `geraden-ebenen`, `lage-abstaende`
  - gA-2.2 Kreise · *Circles* – Kurz: Kreise in der Ebene durch Gleichungen beschreiben und die Lage von Punkt oder Gerade zum Kreis untersuchen. · *EN: Describing circles in the plane by equations and examining how a point or a line lies relative to the circle.* – Simulationen: –

### gA-3 Stochastik (grundlegendes Anforderungsniveau)
*EN: Probability and statistics (basic level)*

- Kurz (DE): Bedingte Wahrscheinlichkeit und Binomialverteilung.
- Kurz (EN): Conditional probability and the binomial distribution.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `galtonbrett`, `binomialverteilung`
- Unterbereiche:
  - gA-3.1 Bedingte Wahrscheinlichkeit · *Conditional probability* – Kurz: Zweistufige Versuche mit der Vierfeldertafel beschreiben, bedingte Wahrscheinlichkeiten berechnen und deuten, Ereignisse auf Unabhängigkeit prüfen. · *EN: Describing two-stage experiments with two-way tables, calculating and interpreting conditional probabilities, testing events for independence.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`
  - gA-3.2 Binomialverteilung · *Binomial distribution* – Kurz: Bernoulli-Ketten, binomialverteilte Zufallsgrößen mit ihren Kenngrößen, typische Gestalt der Verteilung und Vertrauensintervalle. · *EN: Bernoulli chains, binomially distributed random variables and their parameters, the typical shape of the distribution and confidence intervals.* – Simulationen: `galtonbrett`, `binomialverteilung`

### eA-1 Analysis (erhöhtes Anforderungsniveau)
*EN: Calculus (higher level)*

- Kurz (DE): Grenzwerte und Ableitung, Untersuchung von Funktionen und Integralrechnung im erhöhten Anforderungsniveau, mit Funktionsscharen und Rotationskörpern.
- Kurz (EN): Limits and derivatives, analysing functions and integral calculus at the higher level, with families of functions and solids of revolution.
- Simulationen: `grenzverhalten`, `polstellen-asymptoten`, `sekante-tangente`, `ableitungsfunktion`, `ganzrationale-funktionen`, `kurvendiskussion`, `extremwertprobleme`, `logarithmus`, `newton-verfahren`, `e-funktion`, `funktionenscharen`, `stammfunktion-grafisch`, `ober-untersummen`, `hauptsatz`, `aenderungsrate`, `rotationskoerper`
- Unterbereiche:
  - eA-1.1 Grundlagen der Infinitesimalrechnung · *Foundations of calculus* – Kurz: Wie im grundlegenden Niveau, zusätzlich Grenzwertsätze und lineare Näherung einer Funktion an einer Stelle. · *EN: As at the basic level, plus limit laws and the linear approximation of a function at a point.* – Simulationen: `grenzverhalten`, `polstellen-asymptoten`, `sekante-tangente` (11), `ableitungsfunktion`
  - eA-1.2 Differentialrechnung · *Differential calculus* – Kurz: Wie im grundlegenden Niveau, zusätzlich Logarithmusfunktionen, Kettenregel, Newtonverfahren sowie Funktionsscharen und Ortskurven. · *EN: As at the basic level, plus logarithmic functions, the chain rule, Newton’s method and families of functions with their loci.* – Simulationen: `ganzrationale-funktionen` (11), `ableitungsfunktion`, `kurvendiskussion`, `extremwertprobleme`, `logarithmus`, `newton-verfahren`, `e-funktion` (12), `funktionenscharen` (12), `stammfunktion-grafisch` (12)
  - eA-1.3 Integralrechnung · *Integral calculus* – Kurz: Wie im grundlegenden Niveau, zusätzlich lineare Substitution, ln als Stammfunktion von 1/x und das Volumen von Rotationskörpern. · *EN: As at the basic level, plus linear substitution, ln as an antiderivative of 1/x and the volume of solids of revolution.* – Simulationen: `ober-untersummen` (12), `hauptsatz` (12), `aenderungsrate` (12), `stammfunktion-grafisch` (12), `rotationskoerper` (12)

### eA-2 Analytische Geometrie (erhöhtes Anforderungsniveau)
*EN: Analytic geometry (higher level)*

- Kurz (DE): Geraden, Ebenen und Kreise im erhöhten Anforderungsniveau, auch Ebene-Ebene und Tangenten an Kreise.
- Kurz (EN): Lines, planes and circles at the higher level, including two planes and tangents to circles.
- Simulationen: `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - eA-2.1 Geraden und Ebenen · *Lines and planes* – Kurz: Wie im grundlegenden Niveau, zusätzlich die Lage zweier Ebenen mit Schnittgerade sowie Abstände zwischen Punkt und Gerade und zwischen zwei Geraden im Raum. · *EN: As at the basic level, plus the position of two planes with their line of intersection and distances between a point and a line and between two lines in space.* – Simulationen: `geraden-ebenen`, `lage-abstaende`
  - eA-2.2 Kreise · *Circles* – Kurz: Wie im grundlegenden Niveau, zusätzlich die Lage zweier Kreise und Tangenten an einen Kreis, auch von einem Punkt außerhalb. · *EN: As at the basic level, plus the position of two circles and tangents to a circle, including from an outside point.* – Simulationen: –

### eA-3 Stochastik (erhöhtes Anforderungsniveau)
*EN: Probability and statistics (higher level)*

- Kurz (DE): Bedingte Wahrscheinlichkeit, Binomial- und Normalverteilung und beurteilende Statistik.
- Kurz (EN): Conditional probability, binomial and normal distributions and inferential statistics.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `galtonbrett`, `binomialverteilung`, `normalverteilung`
- Unterbereiche:
  - eA-3.1 Bedingte Wahrscheinlichkeit · *Conditional probability* – Kurz: Vierfeldertafel, bedingte Wahrscheinlichkeiten und stochastische Unabhängigkeit wie im grundlegenden Niveau. · *EN: Two-way tables, conditional probabilities and independence, as at the basic level.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`
  - eA-3.2 Binomial- und Normalverteilung · *Binomial and normal distribution* – Kurz: Binomialverteilte Zufallsgrößen mit Kenngrößen und σ-Umgebungen; diskrete und stetige Zufallsgrößen, Normalverteilung mit der Gaußschen Dichtefunktion. · *EN: Binomially distributed random variables with their parameters and σ-intervals; discrete and continuous random variables, the normal distribution with the Gaussian density.* – Simulationen: `galtonbrett`, `binomialverteilung`, `normalverteilung` (12)
  - eA-3.3 Beurteilende Statistik · *Inferential statistics* – Kurz: Mit Simulationen Stichproben erkunden, von der Grundgesamtheit auf Stichproben schließen, unbekannte Wahrscheinlichkeiten schätzen und Prognose- und Vertrauensintervalle angeben. · *EN: Exploring samples with simulations, inferring from the population to samples, estimating unknown probabilities and giving prediction and confidence intervals.* – Simulationen: `binomialverteilung`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `sachsen-anhalt-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/sachsen-anhalt-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `cavalieri` | Das Prinzip von Cavalieri steht nicht im Fachlehrplan; die Volumenformeln für Pyramide, Kegel und Kugel werden in 7/8 ohne es eingeführt. |
| `kugeln` | Kugeln kommen nur als Körper in 7/8 vor. Kugelgleichung und Tangentialebene stehen nicht im Fachlehrplan; die analytische Geometrie behandelt nur Kreise in der Ebene. |
| `matrix-abbildungen` | Matrizen stehen nicht im Fachlehrplan. |
| `signifikanztest` | Hypothesentests stehen nicht im Fachlehrplan. Die beurteilende Statistik (nur eA) hat Punkt- und Intervallschätzung, Prognose- und Vertrauensintervalle. |
| `taylor-polynome` | nicht im Fachlehrplan (Hochschule); die lineare Näherung im eA ist nur der erste Schritt |
| `fourier-reihen` | nicht im Fachlehrplan (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **5/6:** 1.2 Gleichungen und Ungleichungen (inhaltliches Lösen, noch ohne Äquivalenzumformungen; `waagemodell` ist für Klasse 7)
- **10:** 3.1 Zufallsgrößen (Wahrscheinlichkeitsverteilung, Erwartungswert, Standardabweichung)
- **11/12:** gA-2.2 und eA-2.2 Kreise (Kreisgleichung, Lage von Punkt, Gerade und Kreis)

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Gleichungen durch Überlegen lösen | Rückwärtsrechnen mit Umkehroperationen, Lösung einsetzen und prüfen | 5/6 1.2 |
| Erwartungswert beim Glücksspiel | Gewinnplan aufstellen, Verteilung als Säulendiagramm, Erwartungswert als Schwerpunkt, Streuung | 10 3.1 |
| Kreis und Gerade in Koordinaten | Kreis durch Mittelpunkt und Radius ziehen, Gerade verschieben, Schnittpunkte und Tangenten berechnen | gA-2.2, eA-2.2 |

# Teil E – Einordnung und Unklarheiten

1. **Ein Dokument, G8.** Der Fachlehrplan umfasst die Schuljahrgänge 5–12. Schuljahrgang 10 ist die Einführungsphase der gymnasialen Oberstufe, 11/12 die Qualifikationsphase; das Abitur folgt nach Klasse 12.
2. **Doppeljahrgänge aus dem Lehrplan.** Die Schuljahrgänge 5/6, 7/8 und 11/12 beschreibt der Lehrplan jeweils gemeinsam. Sie stehen deshalb mit gleichen Lernbereichen bei beiden Jahrgängen und erscheinen auf der Seite als eine Stufe; eine Simulation steht nur bei den Jahrgängen, die in ihre Klassenstufen fallen. Das ist keine Annahme, sondern die Gliederung des Lehrplans.
3. **Nummern selbst vergeben.** Inhaltsbereiche und Kompetenzschwerpunkte sind im Lehrplan nicht nummeriert. Die Nummern (Inhaltsbereich.Kompetenzschwerpunkt) sind von uns vergeben, in der Reihenfolge des Lehrplans. In der Qualifikationsphase stehen gA- und eA-Teil getrennt mit den Präfixen gA- bzw. eA-; die Niveaus stehen auch im Titel.
4. **Nicht abgebildet:** die allgemeinen mathematischen Kompetenzen, die Verflechtungsmatrizen, die Kompetenzen in der digitalen Welt und das Aufgabenpraktikum (Kap. 2.5). Das Aufgabenpraktikum steht in der Übersicht bei jeder Stufe, hat aber keine eigenen Inhalte, sondern vernetzt die Kompetenzschwerpunkte.
5. **`sourceUrl`.** Der Lehrplan nennt in der Fußzeile nur „http://www.lisa.sachsen-anhalt.de“ (Landesinstitut für Schulqualität und Lehrerbildung). Verwendet ist dieselbe Adresse mit https, weil die Tests https verlangen. Ob sie erreichbar ist, ließ sich hier nicht prüfen (der Proxy sperrt die Seite).
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`), weil Sachsen-Anhalt das Thema in diesem Jahrgang unterrichtet:

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `dreieckskonstruktion` | 7–7 | 6–7 | 5/6 2.4 Dreiecke | Kap. 3.2: Dreiecke konstruieren, Kongruenzsätze, Ausführbarkeit und Eindeutigkeit |
   | `besondere-linien` | 7–8 | 6–8 | 5/6 2.4 Dreiecke | Kap. 3.2: Höhen, Winkelhalbierende und Mittelsenkrechte konstruieren; Inkreis und Umkreis |
   | `pyramide-kegel-kugel` | 10–10 | 8–10 | 7/8 2.3 Körperberechnung | Kap. 3.3: Oberflächeninhalt und Volumen von Kreiskegeln, Pyramiden und Kugeln berechnen |
   | `monte-carlo-pi` | 10–10 | 8–10 | 7/8 4.1 Zufällige Ereignisse | Kap. 3.3: Zufallsversuche simulieren; Zufallszahlen |
   | `vierfeldertafel` | 9–13 | 8–13 | 7/8 4.1 Zufällige Ereignisse | Kap. 3.3: Mengendiagramm und Vierfeldertafel; Ereignisse mit Schnitt- und Vereinigungsmengen |
   | `logarithmus` | 10–12 | 9–12 | 9 1.1 Potenzen und Logarithmen | Kap. 3.4: Logarithmengesetze, dekadischer und natürlicher Logarithmus |
   | `boxplot` | 6–7 | 6–9 | 9 4.1 Häufigkeitsverteilungen | Kap. 3.4: Histogramm, Boxplot; Lage- und Streumaße |
   | `hyperbel` | 8–9 | 8–10 | 10 1.1 Funktionsklassen | Kap. 3.5: Potenzfunktionen, Einfluss der Parameter, Asymptoten |
   | `koordinaten-3d` | 11–12 | 10–12 | 10 2.1 Vektoren | Kap. 3.5: räumliches kartesisches Koordinatensystem, Punkte von Körpern koordinatisieren |
   | `vektoren-3d` | 11–12 | 10–12 | 10 2.1 Vektoren | Kap. 3.5: Vektoraddition, skalare Multiplikation, Linearkombination |
   | `skalar-vektorprodukt` | 12–12 | 10–12 | 10 2.1 Vektoren | Kap. 3.5: Skalarprodukt, Winkel zwischen Vektoren, Vektorprodukt für Normalenvektoren |
   | `normalverteilung` | 13–13 | 12–13 | 11/12 eA-3.2 Binomial- und Normalverteilung | Kap. 3.6.2: normalverteilte Zufallsgrößen, Gaußsche Dichtefunktion |

   Damit die Sortierung nach Klassenstufe stimmt, stehen `besondere-linien` jetzt vor `thales`, `monte-carlo-pi` vor `ziegenproblem` und `logarithmus` vor `exponentielles-wachstum`. Die Klassenstufen der Themen ergeben sich daraus von selbst („Exponentialfunktionen und Logarithmus“ ab 9, „Verknüpfte Ereignisse“ ab 8, „Vektoren im Raum“ ab 10).
7. **Bewusst nicht erweitert:**
   - `funktion-zuordnung` (8–8): Pfeildarstellung und Eindeutigkeit von Zuordnungen stehen schon in 5/6; die Simulation führt aber zum Funktionsbegriff und steht deshalb bei den linearen Funktionen in 7/8.
   - `exponentielles-wachstum` (10–10): Zinseszins wird in 7/8 nur als Begriff der Prozentrechnung genannt; exponentielles Wachstum ist Thema von Klasse 10.
   - `waagemodell` (7–7) bei 5/6 1.2: dort werden Gleichungen inhaltlich gelöst, Äquivalenzumformungen erst in 7/8.
8. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `monte-carlo-pi` bei 7/8 4.1: Der Lehrplan verlangt, Zufallsversuche zu simulieren; die Schätzung von π ist ein Beispiel dafür, steht aber nicht im Lehrplan.
   - `geburtstagsproblem` bei 7/8 4.2: Pfadregeln und Gegenereignis reichen; das Problem selbst nennt der Lehrplan nicht.
   - `ziegenproblem` bei gA-3.1 und eA-3.1: klassisches Beispiel für bedingte Wahrscheinlichkeit, nicht im Lehrplan genannt.
   - `galtonbrett` bei 9 4.1: als Häufigkeitsverteilung, die durch Simulation entsteht; die Binomialverteilung selbst folgt in 11/12.
   - `hyperbel` bei 10 1.1: Der Lehrplan nennt Potenzfunktionen allgemein; ob negative Exponenten gemeint sind, sagt er nicht ausdrücklich.
   - `polstellen-asymptoten` bei gA-1.1 und eA-1.1: Verhalten bei Annäherung an eine Stelle; gebrochenrationale Funktionen nennt der Lehrplan nicht eigens.
   - `einheitskreis` bei 9 2.1 und 10 1.1: Beziehungen wie sin(180° − α) in 9, Bogenmaß in 10.
   - `binomialverteilung` bei eA-3.3: Prognose- und Vertrauensintervalle lassen sich am Histogramm ablesen; eine eigene Simulation zur beurteilenden Statistik gibt es nicht.
9. **Verhältnis zu Sachsen** ([gori-creator/Simulations#73](https://github.com/gori-creator/Simulations/pull/73), noch offen): Dort sind teils dieselben Simulationen erweitert. Gleiche Änderungen (`dreieckskonstruktion`, `besondere-linien`, `monte-carlo-pi`, `boxplot`, `normalverteilung` und die Umsortierungen) sind wortgleich; bei `pyramide-kegel-kugel` gilt nach beiden Merges der weitere Bereich (7–10).
