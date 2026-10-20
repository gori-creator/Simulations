# Hessen · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I | Gymnasiale Oberstufe |
|---|---|---|
| Bundesland | Hessen | Hessen |
| Schulart | Gymnasium (Sekundarstufe I) | gymnasiale Oberstufe (gilt laut Dokument auch für das berufliche Gymnasium) |
| Fach | Mathematik | Mathematik |
| Name des Lehrplans | „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, MATHEMATIK“, Hessisches Kultusministerium | „Kerncurriculum gymnasiale Oberstufe MATHEMATIK“, Hessisches Ministerium für Kultus, Bildung und Chancen (HMKB) |
| Jahr / Stand | im Dokument nicht angegeben (siehe Teil E) | Ausgabe 2024, Stand 01.08.2025; KC seit Schuljahr 2016/17 in Kraft, 2024 wegen Abiturrelevanz von Q4 angepasst |
| gültig für | Jahrgangsstufen 5 bis 9/10, gegliedert in Doppeljahrgangsstufen 5/6, 7/8, 9/10 | Einführungsphase (E1/E2) und Qualifikationsphase (Q1–Q4) |
| G8/G9 | keine ausdrückliche Unterscheidung; Endpunkt wird als „Jahrgangsstufe 9/10“ angegeben | keine Angabe; nur Kurshalbjahre. Im JSON angenommen: E = 11, Q1/Q2 = 12, Q3/Q4 = 13 (G9) |
| Niveaus / Wahl | keine Niveaus | Qualifikationsphase: grundlegendes Niveau (GK + LK) und erhöhtes Niveau (nur LK); verbindliche und nicht verbindliche Themenfelder |
| Struktur | 5 Leitideen → 11 Inhaltsfelder → inhaltliche Schwerpunkte je Doppeljahrgangsstufe (ohne Nummern im Original) | Kurshalbjahr → Themenfeld (nummeriert, z. B. Q1.2) → inhaltliche Aspekte (ohne Nummern im Original) |

| Jahrgangsstufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Unterbereiche mit Simulation | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Jahrgangsstufe 5/6 (Doppeljahrgangsstufe) | 5, 6 | 10 | 42 | 31 | 21 |
| Jahrgangsstufe 7/8 (Doppeljahrgangsstufe) | 7, 8 | 11 | 41 | 34 | 32 |
| Jahrgangsstufe 9/10 (Doppeljahrgangsstufe) | 9, 10 | 6 | 16 | 15 | 19 |
| Einführungsphase E1/E2 – „Grundlagen der Analysis“ | 11 | 7 | 21 | 14 | 17 |
| Qualifikationsphase Q1 – „Analysis“ | 12 | 5 | 22 | 9 | 10 |
| Qualifikationsphase Q2 – „Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis“ | 12 | 5 | 36 | 22 | 12 |
| Qualifikationsphase Q3 – „Stochastik“ | 13 | 5 | 24 | 13 | 10 |
| Qualifikationsphase Q4 – „Funktionenscharen, Problemlösen und Argumentieren“ | 13 | 3 | 14 | 4 | 3 |

Insgesamt verwendet: **87 von 93** Simulationen der Liste für Mathematik.

Nicht zugeordnet (passt zu keinem Lernbereich dieses Lehrplans oder nur „irgendwie verwandt“): `parabel-drei-punkte`, `monte-carlo-pi`, `ziegenproblem`, `kugeln`, `taylor-polynome`, `fourier-reihen`

# Teil B – Lehrplan im Detail

## Jahrgangsstufe 5/6 (Doppeljahrgangsstufe)  
*Grades 5/6 (double grade level)*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, MATHEMATIK“ (Datei kerncurriculum_mathematik_gymnasium.pdf), S. 18–21 (Kap. 6), 22–23 (Kap. 7.1), 26–29 (Kap. 7.3); Internet laut Impressum: www.kultusministerium.hessen.de)

> Doppeljahrgangsstufe 5/6: Die Inhalte gelten für das Ende der Jahrgangsstufe 6 und sind bei Jahrgangsstufe 5 und 6 gleich eingetragen. Codes: erste Ziffer = Leitidee (1 Zahl und Operation, 2 Raum und Form, 3 Größen und Messen, 4 Funktionaler Zusammenhang, 5 Daten und Zufall), zweite = Inhaltsfeld, dritte = inhaltlicher Schwerpunkt; die Nummerierung stammt nicht aus dem Lehrplan.

**Leitidee: Zahl und Operation** · *Guiding idea: Number and operation*

### 1.1 Zahlen
*EN: Numbers*

- Kurz (DE): Aufbau tragfähiger Zahlvorstellungen: natürliche Zahlen, erste negative Zahlen, Brüche in ihren verschiedenen Bedeutungen und Dezimalbrüche. Zahlen werden verglichen, geordnet, gerundet und auf Teilbarkeit untersucht.
- Kurz (EN): Building solid number sense: natural numbers, first negative numbers, fractions in their different meanings and decimals. Numbers are compared, ordered, rounded and examined for divisibility.
- Simulationen: `stellenwerte`, `zahlengerade`, `bruchteile`, `dezimalbrueche`, `prozentstreifen`, `brueche-vergleichen`, `primfaktoren`
- Unterbereiche:
  - 1.1.1 Natürliche Zahlen · *Natural numbers* – Kurz: Große Zahlen im Stellenwertsystem lesen, schreiben und verstehen. · *EN: Reading, writing and understanding large numbers in the place-value system.* – Simulationen: `stellenwerte`
  - 1.1.2 Vorstellungsaufbau im Bereich der negativen Zahlen · *Building an understanding of negative numbers* – Kurz: Erste Vorstellungen von Zahlen unter null, z. B. an Temperatur oder Kontostand. · *EN: First ideas of numbers below zero, e.g. temperature or account balance.* – Simulationen: `zahlengerade`
  - 1.1.3 Brüche als Teil eines Ganzen, als Teil mehrerer Ganzer, als Maßzahl und zur Beschreibung von Verhältnissen · *Fractions as part of a whole, as part of several wholes, as a measure and to describe ratios* – Kurz: Brüche in ihren unterschiedlichen Grundvorstellungen deuten und darstellen. · *EN: Interpreting and representing fractions in their different basic meanings.* – Simulationen: `bruchteile`
  - 1.1.4 Dezimalbrüche (abbrechend, periodisch) und Begründung für Abbruch bzw. Periodizität · *Decimals (terminating, repeating) and reasons for termination or periodicity* – Kurz: Brüche in Dezimalschreibweise umwandeln und erklären, wann die Darstellung endet oder sich wiederholt. · *EN: Converting fractions to decimals and explaining when the expansion terminates or repeats.* – Simulationen: `dezimalbrueche`
  - 1.1.5 Einfache Prozentangaben · *Simple percentages* – Kurz: Anteile als Prozentsätze verstehen und einfache Prozentangaben deuten. · *EN: Understanding parts as percentages and interpreting simple percentage statements.* – Simulationen: `prozentstreifen`
  - 1.1.6 Vergleichen, Ordnen von natürlichen und gebrochenen Zahlen (gewöhnliche Brüche, Dezimalbrüche) · *Comparing and ordering natural numbers and fractions (common fractions, decimals)* – Kurz: Zahlen der Größe nach ordnen, auch über Erweitern und Kürzen. · *EN: Ordering numbers by size, also by expanding and simplifying fractions.* – Simulationen: `brueche-vergleichen`
  - 1.1.7 Runden von natürlichen Zahlen und Dezimalbrüchen · *Rounding natural numbers and decimals* – Kurz: Zahlen sinnvoll auf eine Stelle runden. · *EN: Rounding numbers sensibly to a given place.* – Simulationen: `stellenwerte`
  - 1.1.8 Teilbarkeit, Teiler und Vielfache (ggT, kgV, Primzahlen) · *Divisibility, divisors and multiples (gcd, lcm, prime numbers)* – Kurz: Teilbarkeitsregeln, Primzahlen sowie größter gemeinsamer Teiler und kleinstes gemeinsames Vielfaches. · *EN: Divisibility rules, prime numbers, greatest common divisor and least common multiple.* – Simulationen: `primfaktoren`
  - 1.1.9 Darstellungen (Zahlenstrahl, Kreisdiagramm) · *Representations (number ray, pie chart)* – Kurz: Zahlen und Anteile am Zahlenstrahl und im Kreisdiagramm veranschaulichen. · *EN: Visualising numbers and parts on the number ray and in pie charts.* – Simulationen: –

### 1.2 Operationen und ihre Eigenschaften
*EN: Operations and their properties*

- Kurz (DE): Sicheres Rechnen mit natürlichen Zahlen und Brüchen unter Nutzung der Rechengesetze sowie erste Grundaufgaben der Bruch- und Prozentrechnung.
- Kurz (EN): Confident calculation with natural numbers and fractions using the laws of arithmetic, plus first basic tasks with fractions and percentages.
- Simulationen: `brueche-rechnen`, `termbaum`, `prozentstreifen`
- Unterbereiche:
  - 1.2.1 Grundrechenarten und Rechengesetze für natürliche und gebrochene Zahlen · *Basic operations and arithmetic laws for natural numbers and fractions* – Kurz: Die vier Grundrechenarten mit ganzen Zahlen und Brüchen ausführen und Gesetze wie Kommutativ- und Distributivgesetz nutzen. · *EN: Carrying out the four basic operations with whole numbers and fractions and using laws such as commutativity and distributivity.* – Simulationen: `brueche-rechnen`, `termbaum`
  - 1.2.2 Strategien zum vorteilhaften Rechnen · *Strategies for efficient calculation* – Kurz: Rechnungen geschickt umstellen und zusammenfassen, um einfacher zu rechnen. · *EN: Rearranging and grouping calculations cleverly to make them easier.* – Simulationen: –
  - 1.2.3 Grundaufgaben der Bruchrechnung und der Prozentrechnung · *Basic tasks in fraction and percentage calculation* – Kurz: Anteil, Ganzes und Teil bei Brüchen und Prozenten bestimmen. · *EN: Finding part, whole and rate for fractions and percentages.* – Simulationen: `brueche-rechnen`, `prozentstreifen`

**Leitidee: Raum und Form** · *Guiding idea: Space and shape*

### 2.1 Ebene Figuren
*EN: Plane figures*

- Kurz (DE): Grundfiguren wie Quadrat, Rechteck, Dreieck und Kreis erkennen, konstruieren und auf Symmetrie untersuchen; erste Orientierung im Koordinatensystem.
- Kurz (EN): Recognising, constructing and examining basic figures such as square, rectangle, triangle and circle for symmetry; first orientation in the coordinate system.
- Simulationen: `umfang-flaeche`, `spiegelung`, `koordinaten-lage`
- Unterbereiche:
  - 2.1.1 Grundfiguren (Quadrat, Rechteck, Dreieck, Kreis) und zusammengesetzte Flächen · *Basic figures (square, rectangle, triangle, circle) and composite shapes* – Kurz: Grundfiguren benennen, beschreiben und zu neuen Flächen zusammensetzen. · *EN: Naming and describing basic figures and combining them into new shapes.* – Simulationen: `umfang-flaeche`
  - 2.1.2 Konstruktion von Figuren und Mustern · *Constructing figures and patterns* – Kurz: Figuren und Muster mit Lineal, Geodreieck und Zirkel zeichnen. · *EN: Drawing figures and patterns with ruler, set square and compass.* – Simulationen: –
  - 2.1.3 Symmetrieeigenschaften (Achsen- und Drehsymmetrie) von Grundfiguren · *Symmetry properties (line and rotational symmetry) of basic figures* – Kurz: Symmetrieachsen und Drehsymmetrie bei Grundfiguren erkennen und erzeugen. · *EN: Recognising and creating lines of symmetry and rotational symmetry in basic figures.* – Simulationen: `spiegelung`
  - 2.1.4 Kartesisches Koordinatensystem im ersten Quadranten · *Cartesian coordinate system in the first quadrant* – Kurz: Punkte mit positiven Koordinaten eintragen und ablesen. · *EN: Plotting and reading points with positive coordinates.* – Simulationen: `koordinaten-lage`

### 2.2 Körper
*EN: Solids*

- Kurz (DE): Quader, Würfel und daraus zusammengesetzte Körper werden über Modelle, Schrägbilder und Netze erfasst; Volumen und Oberfläche werden beschrieben.
- Kurz (EN): Cuboids, cubes and composite solids are explored using models, oblique drawings and nets; volume and surface area are described.
- Simulationen: `quader-volumen`, `koerpernetze`
- Unterbereiche:
  - 2.2.1 Grundkörper (Quader, Würfel) und zusammengesetzte Körper · *Basic solids (cuboid, cube) and composite solids* – Kurz: Quader und Würfel erkennen und zusammengesetzte Körper beschreiben. · *EN: Recognising cuboids and cubes and describing composite solids.* – Simulationen: `quader-volumen`
  - 2.2.2 Beschreibung von Volumen und Oberflächeninhalt der Grundkörper · *Describing volume and surface area of the basic solids* – Kurz: Rauminhalt mit Einheitswürfeln und Oberfläche über die Seitenflächen erfassen. · *EN: Capturing volume with unit cubes and surface area via the faces.* – Simulationen: `quader-volumen`, `koerpernetze`
  - 2.2.3 Modelle, Schrägbilder und Netze der Grundkörper · *Models, oblique drawings and nets of the basic solids* – Kurz: Körper bauen, im Schrägbild zeichnen und Netze falten bzw. erkennen. · *EN: Building solids, drawing oblique views and folding or identifying nets.* – Simulationen: `koerpernetze`

### 2.3 Beziehungen zwischen geometrischen Objekten
*EN: Relationships between geometric objects*

- Kurz (DE): Lagebeziehungen wie parallel und senkrecht sowie Abbildungen (Drehen, Spiegeln, Verschieben) von Figuren werden beschrieben.
- Kurz (EN): Positional relationships such as parallel and perpendicular, and mappings of figures (rotation, reflection, translation) are described.
- Simulationen: `koordinaten-lage`, `spiegelung`
- Unterbereiche:
  - 2.3.1 Fachbegriffe parallel, senkrecht, Abstand · *Technical terms parallel, perpendicular, distance* – Kurz: Parallele und senkrechte Geraden erkennen, zeichnen und Abstände messen. · *EN: Recognising and drawing parallel and perpendicular lines and measuring distances.* – Simulationen: `koordinaten-lage`
  - 2.3.2 Bewegungen von Figuren: Drehungen, Spiegelungen, Verschiebungen · *Movements of figures: rotations, reflections, translations* – Kurz: Figuren drehen, spiegeln und verschieben und die Ergebnisse vergleichen. · *EN: Rotating, reflecting and translating figures and comparing the results.* – Simulationen: `spiegelung`

**Leitidee: Größen und Messen** · *Guiding idea: Quantities and measuring*

### 3.1 Umgang mit Größen
*EN: Working with quantities*

- Kurz (DE): Aufbau von Größenvorstellungen, Schätzen und Überschlagen sowie Umrechnen von Einheiten mit Vorsilben.
- Kurz (EN): Developing a feel for quantities, estimating and approximating, and converting units with prefixes.
- Simulationen: `umfang-flaeche`, `quader-volumen`, `stellenwerte`, `einheiten`, `zehnerpotenzen`
- Unterbereiche:
  - 3.1.1 Größenvorstellungen · *Sense of quantities* – Kurz: Typische Repräsentanten für Längen, Massen, Zeiten usw. kennen. · *EN: Knowing typical benchmarks for lengths, masses, times etc.* – Simulationen: –
  - 3.1.2 Einheitsquadrat, Einheitswürfel · *Unit square, unit cube* – Kurz: Flächen und Rauminhalte durch Auslegen mit Einheitsquadraten bzw. -würfeln erfassen. · *EN: Measuring areas and volumes by covering/filling with unit squares or cubes.* – Simulationen: `umfang-flaeche`, `quader-volumen`
  - 3.1.3 Repräsentanten, Schätzungen und Überschlagsrechnungen · *Benchmarks, estimates and rough calculations* – Kurz: Größen begründet schätzen und Ergebnisse überschlagen. · *EN: Estimating quantities with reasons and checking results by rough calculation.* – Simulationen: –
  - 3.1.4 Runden · *Rounding* – Kurz: Größenangaben situationsgerecht runden. · *EN: Rounding quantities appropriately for the situation.* – Simulationen: `stellenwerte`
  - 3.1.5 Umrechnung von Größen · *Converting quantities* – Kurz: Zwischen Einheiten einer Größe umrechnen. · *EN: Converting between units of one quantity.* – Simulationen: `einheiten`
  - 3.1.6 Vorsilben von Einheiten · *Unit prefixes* – Kurz: Vorsilben wie Milli-, Zenti-, Kilo- verstehen und nutzen. · *EN: Understanding and using prefixes such as milli-, centi-, kilo-.* – Simulationen: `einheiten`, `zehnerpotenzen`

### 3.2 Messvorgänge
*EN: Measuring processes*

- Kurz (DE): Messen und Berechnen von Länge, Masse, Geld, Zeit und Winkel sowie Umfang, Fläche und Volumen einfacher Figuren und Körper.
- Kurz (EN): Measuring and calculating length, mass, money, time and angle as well as perimeter, area and volume of simple figures and solids.
- Simulationen: `einheiten`, `massstab`, `winkel-messen`, `umfang-flaeche`, `quader-volumen`, `koerpernetze`
- Unterbereiche:
  - 3.2.1 Länge · *Length* – Kurz: Längen messen, umrechnen und z. B. auf Karten mit Maßstab bestimmen. · *EN: Measuring and converting lengths, e.g. on maps with a scale.* – Simulationen: `einheiten`, `massstab`
  - 3.2.2 Masse/Gewichte · *Mass/weights* – Kurz: Massen messen und in passenden Einheiten angeben. · *EN: Measuring masses and stating them in suitable units.* – Simulationen: `einheiten`
  - 3.2.3 Währung/Geld · *Currency/money* – Kurz: Mit Geldbeträgen in Euro und Cent rechnen. · *EN: Calculating with amounts of money in euros and cents.* – Simulationen: –
  - 3.2.4 Zeitspanne · *Time span* – Kurz: Zeitpunkte und Zeitspannen unterscheiden und berechnen. · *EN: Distinguishing and calculating points in time and time spans.* – Simulationen: –
  - 3.2.5 Winkel · *Angle* – Kurz: Winkel schätzen, messen und zeichnen. · *EN: Estimating, measuring and drawing angles.* – Simulationen: `winkel-messen`
  - 3.2.6 Flächeninhalt und Umfang von Quadrat und Rechteck · *Area and perimeter of square and rectangle* – Kurz: Umfang und Flächeninhalt von Rechteck und Quadrat bestimmen. · *EN: Finding perimeter and area of rectangles and squares.* – Simulationen: `umfang-flaeche`
  - 3.2.7 Volumen und Oberflächeninhalt der Grundkörper · *Volume and surface area of the basic solids* – Kurz: Volumen und Oberfläche von Quader und Würfel berechnen. · *EN: Calculating volume and surface area of cuboids and cubes.* – Simulationen: `quader-volumen`, `koerpernetze`

**Leitidee: Funktionaler Zusammenhang** · *Guiding idea: Functional relationship*

### 4.1 Zuordnungen und ihre Darstellungen
*EN: Assignments (mappings) and their representations*

- Kurz (DE): Erste Erfahrungen mit Zuordnungen zwischen Größen und deren Darstellung in Worten, Tabellen und Schaubildern.
- Kurz (EN): First experiences with assignments between quantities and representing them in words, tables and charts.
- Simulationen: –
- Unterbereiche:
  - 4.1.1 Grundvorstellungen zu Zuordnungen von Größen · *Basic ideas of assigning quantities* – Kurz: Verstehen, dass einer Größe eine andere zugeordnet wird (z. B. Menge → Preis). · *EN: Understanding that one quantity is assigned to another (e.g. amount → price).* – Simulationen: –
  - 4.1.2 Darstellung der Zuordnungen in Schaubildern und Tabellen und in sprachlicher Form · *Representing assignments in charts, tables and in words* – Kurz: Zuordnungen in Tabellen, Schaubildern und mit Worten beschreiben. · *EN: Describing assignments in tables, charts and in words.* – Simulationen: –

**Leitidee: Daten und Zufall** · *Guiding idea: Data and chance*

### 5.1 statistische Erhebungen und ihre Auswertung
*EN: Statistical surveys and their evaluation*

- Kurz (DE): Eigene Umfragen planen und auswerten, Daten in Listen und Diagrammen darstellen und mit einfachen Kenngrößen beschreiben.
- Kurz (EN): Planning and evaluating own surveys, presenting data in lists and diagrams and describing them with simple statistics.
- Simulationen: `boxplot`, `diagramme`
- Unterbereiche:
  - 5.1.1 Umfragen und Erhebungen (Planung, Durchführung und statistische Auswertung) · *Surveys and data collection (planning, carrying out and statistical evaluation)* – Kurz: Eine Datenerhebung von der Frage bis zur Auswertung durchführen. · *EN: Carrying out a data collection from the question to the evaluation.* – Simulationen: –
  - 5.1.2 Kenngrößen (Häufigkeiten, Median, arithmetisches Mittel, Spannweite) · *Statistics (frequencies, median, arithmetic mean, range)* – Kurz: Häufigkeiten, Mittelwert, Median und Spannweite bestimmen und deuten. · *EN: Determining and interpreting frequencies, mean, median and range.* – Simulationen: `boxplot`
  - 5.1.3 Darstellung von Daten (Listen und Diagramme) · *Presenting data (lists and diagrams)* – Kurz: Daten in Strichlisten, Tabellen und Diagrammen darstellen und ablesen. · *EN: Presenting and reading data in tally charts, tables and diagrams.* – Simulationen: `diagramme`

### 5.2 Umgang mit dem Zufall
*EN: Dealing with chance*

- Kurz (DE): Zufall im Alltag erkennen und erste Wahrscheinlichkeitsvorstellungen über Häufigkeiten aufbauen.
- Kurz (EN): Recognising chance in everyday life and building first ideas of probability via frequencies.
- Simulationen: `gesetz-grosse-zahlen`
- Unterbereiche:
  - 5.2.1 Zufallserscheinungen in alltäglichen Situationen · *Random phenomena in everyday situations* – Kurz: Zufällige Ereignisse im Alltag erkennen und beschreiben. · *EN: Recognising and describing random events in everyday life.* – Simulationen: –
  - 5.2.2 Verschiedene Vorstellungen vom Wahrscheinlichkeitsbegriff · *Different notions of probability* – Kurz: Wahrscheinlichkeit als Erwartung (Symmetrie) und als langfristige relative Häufigkeit kennenlernen. · *EN: Getting to know probability as expectation (symmetry) and as long-run relative frequency.* – Simulationen: `gesetz-grosse-zahlen`
  - 5.2.3 Absolute und relative Häufigkeiten · *Absolute and relative frequencies* – Kurz: Häufigkeiten aus Versuchen bestimmen und als Anteil angeben. · *EN: Determining frequencies from experiments and stating them as proportions.* – Simulationen: `gesetz-grosse-zahlen`

## Jahrgangsstufe 7/8 (Doppeljahrgangsstufe)  
*Grades 7/8 (double grade level)*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, MATHEMATIK“ (Datei kerncurriculum_mathematik_gymnasium.pdf), S. 18–21 (Kap. 6), 24–25 (Kap. 7.2), 26–29 (Kap. 7.3); Internet laut Impressum: www.kultusministerium.hessen.de)

> Doppeljahrgangsstufe 7/8: Die Inhalte gelten für das Ende der Jahrgangsstufe 8 und sind bei Jahrgangsstufe 7 und 8 gleich eingetragen. Codes: erste Ziffer = Leitidee (1 Zahl und Operation, 2 Raum und Form, 3 Größen und Messen, 4 Funktionaler Zusammenhang, 5 Daten und Zufall), zweite = Inhaltsfeld, dritte = inhaltlicher Schwerpunkt; die Nummerierung stammt nicht aus dem Lehrplan. Kumulativ: Inhalte früherer Doppeljahrgangsstufen werden vorausgesetzt; Verschiebungen über Jahrgangsgrenzen sind erlaubt, solange die Ziele am Ende von 9/10 erreicht werden.

**Leitidee: Zahl und Operation** · *Guiding idea: Number and operation*

### 1.1 Zahlen
*EN: Numbers*

- Kurz (DE): Erweiterung auf rationale und reelle Zahlen (Wurzeln, π); Zahlen werden an der Zahlengeraden und als Dezimalbrüche dargestellt, verglichen und gerundet; Orientierung im ganzen Koordinatensystem.
- Kurz (EN): Extension to rational and real numbers (roots, π); numbers are shown on the number line and as decimals, compared and rounded; orientation in the full coordinate system.
- Simulationen: `zahlengerade`, `quadratwurzel`, `kreiszahl-pi`, `dezimalbrueche`
- Unterbereiche:
  - 1.1.1 Rationale Zahlen · *Rational numbers* – Kurz: Positive und negative Brüche und Dezimalzahlen als ein Zahlbereich. · *EN: Positive and negative fractions and decimals as one number set.* – Simulationen: `zahlengerade`
  - 1.1.2 Reelle Zahlen (Wurzeln und die Zahl π als Proportionalitätsfaktor) · *Real numbers (roots and the number π as a proportionality factor)* – Kurz: Irrationale Zahlen wie Quadratwurzeln und π kennenlernen und näherungsweise bestimmen. · *EN: Getting to know irrational numbers such as square roots and π and approximating them.* – Simulationen: `quadratwurzel`, `kreiszahl-pi`
  - 1.1.3 Darstellungen (Zahlengerade, Dezimalbrüche) · *Representations (number line, decimals)* – Kurz: Rationale und reelle Zahlen an der Zahlengeraden und in Dezimalschreibweise darstellen. · *EN: Representing rational and real numbers on the number line and in decimal notation.* – Simulationen: `zahlengerade`, `dezimalbrueche`
  - 1.1.4 Vergleichen, Ordnen und Runden von rationalen und reellen Zahlen · *Comparing, ordering and rounding rational and real numbers* – Kurz: Zahlen beider Vorzeichen ordnen und sinnvoll runden. · *EN: Ordering numbers of both signs and rounding sensibly.* – Simulationen: –
  - 1.1.5 Orientierung im zweidimensionalen Koordinatensystem · *Orientation in the two-dimensional coordinate system* – Kurz: Punkte in allen vier Quadranten eintragen und ablesen. · *EN: Plotting and reading points in all four quadrants.* – Simulationen: –

### 1.2 Operationen und ihre Eigenschaften
*EN: Operations and their properties*

- Kurz (DE): Rechnen mit rationalen und reellen Zahlen, Terme mit Variablen und Klammern umformen, Potenzen sowie Prozent- und Zinsrechnung in Sachsituationen.
- Kurz (EN): Calculating with rational and real numbers, transforming terms with variables and brackets, powers, and percentage and interest calculations in real-life contexts.
- Simulationen: `zahlengerade`, `binomische-formeln`, `termbaum`, `prozentstreifen`
- Unterbereiche:
  - 1.2.1 Rechenverfahren, Rechengesetze und deren Verknüpfungen im Bereich der rationalen und reellen Zahlen · *Calculation methods, arithmetic laws and their combination for rational and real numbers* – Kurz: Vorzeichenregeln und Rechengesetze sicher anwenden. · *EN: Applying sign rules and arithmetic laws confidently.* – Simulationen: `zahlengerade`
  - 1.2.2 Klammern, Binome · *Brackets, binomials* – Kurz: Klammern auflösen, ausklammern und binomische Formeln nutzen. · *EN: Expanding and factorising brackets and using the binomial formulas.* – Simulationen: `binomische-formeln`, `termbaum`
  - 1.2.3 Potenzen mit rationalen Exponenten · *Powers with rational exponents* – Kurz: Potenzschreibweise auf negative und gebrochene Exponenten ausweiten. · *EN: Extending power notation to negative and fractional exponents.* – Simulationen: –
  - 1.2.4 Terme und Variable · *Terms and variables* – Kurz: Terme mit Variablen aufstellen, strukturieren und umformen. · *EN: Setting up, structuring and transforming terms with variables.* – Simulationen: `termbaum`
  - 1.2.5 Grundaufgaben der Prozent- und Zinsrechnung · *Basic tasks of percentage and interest calculation* – Kurz: Grundwert, Prozentwert, Prozentsatz und Zinsen berechnen. · *EN: Calculating base value, percentage value, rate and interest.* – Simulationen: `prozentstreifen`
  - 1.2.6 Prozentrechnen mit erhöhtem und vermindertem Grundwert · *Percentages with increased and decreased base value* – Kurz: Preiserhöhungen und Rabatte über Wachstums- bzw. Abnahmefaktoren berechnen. · *EN: Calculating price increases and discounts using growth or decay factors.* – Simulationen: `prozentstreifen`
  - 1.2.7 Prozente von Prozenten · *Percentages of percentages* – Kurz: Mehrere prozentuale Änderungen nacheinander verknüpfen. · *EN: Combining several successive percentage changes.* – Simulationen: –

**Leitidee: Raum und Form** · *Guiding idea: Space and shape*

### 2.1 Ebene Figuren
*EN: Plane figures*

- Kurz (DE): Vierecke und Kreis werden klassifiziert und konstruiert, auch mit dynamischer Geometriesoftware; Symmetrie und alle vier Quadranten des Koordinatensystems.
- Kurz (EN): Quadrilaterals and circles are classified and constructed, also with dynamic geometry software; symmetry and all four quadrants of the coordinate system.
- Simulationen: `vierecke`, `dreieckskonstruktion`, `mittelsenkrechte`, `besondere-linien`, `spiegelung`
- Unterbereiche:
  - 2.1.1 Grundfiguren (Parallelogramm, Trapez, Raute, Drachen, Kreis) · *Basic figures (parallelogram, trapezium, rhombus, kite, circle)* – Kurz: Weitere Grundfiguren und ihre Eigenschaften kennenlernen. · *EN: Getting to know further basic figures and their properties.* – Simulationen: `vierecke`
  - 2.1.2 Haus der Vierecke · *Hierarchy of quadrilaterals* – Kurz: Vierecke nach Eigenschaften ordnen und Beziehungen zwischen ihnen begründen. · *EN: Ordering quadrilaterals by properties and justifying relationships between them.* – Simulationen: `vierecke`
  - 2.1.3 Konstruktionen mit Zeichengeräten und dynamischer Geometriesoftware · *Constructions with drawing instruments and dynamic geometry software* – Kurz: Dreiecke, Mittelsenkrechten, Winkelhalbierende u. a. konstruieren. · *EN: Constructing triangles, perpendicular bisectors, angle bisectors and more.* – Simulationen: `dreieckskonstruktion`, `mittelsenkrechte`, `besondere-linien`
  - 2.1.4 Symmetrieeigenschaften von Figuren · *Symmetry properties of figures* – Kurz: Achsen- und Punktsymmetrie von Figuren untersuchen. · *EN: Examining line and point symmetry of figures.* – Simulationen: `spiegelung`
  - 2.1.5 Kartesisches Koordinatensystem in allen vier Quadranten · *Cartesian coordinate system in all four quadrants* – Kurz: Figuren im vollständigen Koordinatensystem darstellen. · *EN: Representing figures in the full coordinate system.* – Simulationen: –

### 2.2 Körper
*EN: Solids*

- Kurz (DE): Prisma und Kreiszylinder: Darstellung durch Modelle, Schrägbilder und Netze sowie Beschreibung von Volumen und Oberfläche.
- Kurz (EN): Prism and circular cylinder: representation by models, oblique drawings and nets, and description of volume and surface area.
- Simulationen: `prisma-zylinder`, `koerpernetze`
- Unterbereiche:
  - 2.2.1 Grundkörper (Prisma, Kreiszylinder) · *Basic solids (prism, circular cylinder)* – Kurz: Prismen und Zylinder erkennen und ihre Eigenschaften beschreiben. · *EN: Recognising prisms and cylinders and describing their properties.* – Simulationen: `prisma-zylinder`
  - 2.2.2 Beschreibung von Volumen und Oberflächeninhalt beim Prisma · *Describing volume and surface area of the prism* – Kurz: Volumen als Grundfläche mal Höhe und Oberfläche über das Netz verstehen. · *EN: Understanding volume as base times height and surface area via the net.* – Simulationen: `prisma-zylinder`
  - 2.2.3 Modelle, Schrägbilder und Netze bekannter Körper · *Models, oblique drawings and nets of known solids* – Kurz: Bekannte Körper in verschiedenen Darstellungen zeichnen und erkennen. · *EN: Drawing and recognising known solids in different representations.* – Simulationen: `koerpernetze`

### 2.3 Beziehungen zwischen geometrischen Objekten
*EN: Relationships between geometric objects*

- Kurz (DE): Kongruenz und Symmetrie, Satzgruppe des Pythagoras mit Beweisen, Satz des Thales sowie Ähnlichkeit, zentrische Streckung und Strahlensätze.
- Kurz (EN): Congruence and symmetry, Pythagorean theorem with proofs, Thales' theorem, similarity, central dilation and intercept theorems.
- Simulationen: `dreieckskonstruktion`, `spiegelung`, `pythagoras`, `thales`, `strahlensaetze`, `vergroessern`
- Unterbereiche:
  - 2.3.1 Fachbegriffe (Kongruenz, Symmetrie) · *Technical terms (congruence, symmetry)* – Kurz: Deckungsgleichheit und Symmetrie begrifflich fassen, z. B. über Kongruenzsätze. · *EN: Defining congruence and symmetry, e.g. via congruence theorems.* – Simulationen: `dreieckskonstruktion`, `spiegelung`
  - 2.3.2 Satz des Pythagoras und seine Umkehrung einschließlich exemplarischer vollständiger Beweise · *Pythagorean theorem and its converse including exemplary complete proofs* – Kurz: Den Satz begründen, beweisen und zur Berechnung von Seitenlängen nutzen. · *EN: Justifying and proving the theorem and using it to calculate side lengths.* – Simulationen: `pythagoras`
  - 2.3.3 Satz des Thales · *Thales' theorem* – Kurz: Rechte Winkel im Halbkreis entdecken und begründen. · *EN: Discovering and justifying right angles in a semicircle.* – Simulationen: `thales`
  - 2.3.4 Ähnlichkeit, zentrische Streckungen, Strahlensätze · *Similarity, central dilations, intercept theorems* – Kurz: Figuren maßstäblich vergrößern/verkleinern und Streckenverhältnisse berechnen. · *EN: Enlarging/reducing figures to scale and calculating ratios of segments.* – Simulationen: `strahlensaetze`, `vergroessern`

**Leitidee: Größen und Messen** · *Guiding idea: Quantities and measuring*

### 3.1 Umgang mit Größen
*EN: Working with quantities*

- Kurz (DE): Umgang mit zusammengesetzten Figuren und Winkelgrößen sowie Winkelsätze.
- Kurz (EN): Working with composite figures and angle measures, and angle theorems.
- Simulationen: `flaechen-zerlegen`, `winkelsumme`, `winkel-geradenkreuzung`
- Unterbereiche:
  - 3.1.1 Zusammengesetzte Figuren · *Composite figures* – Kurz: Flächen in bekannte Teilfiguren zerlegen bzw. ergänzen. · *EN: Dissecting or completing areas into known component figures.* – Simulationen: `flaechen-zerlegen`
  - 3.1.2 Größen von Winkeln (Minuten, Sekunden) · *Sizes of angles (minutes, seconds)* – Kurz: Winkel genauer in Grad, Minuten und Sekunden angeben. · *EN: Stating angles more precisely in degrees, minutes and seconds.* – Simulationen: –
  - 3.1.3 Winkelsummensatz und die Winkelsätze an Geradenkreuzungen · *Angle sum theorem and angle theorems at intersecting lines* – Kurz: Innenwinkelsumme sowie Scheitel-, Neben-, Stufen- und Wechselwinkel nutzen. · *EN: Using the interior angle sum and vertical, adjacent, corresponding and alternate angles.* – Simulationen: `winkelsumme`, `winkel-geradenkreuzung`

### 3.2 Messvorgänge
*EN: Measuring processes*

- Kurz (DE): Flächeninhalt und Umfang weiterer Vielecke und des Kreises sowie Volumen und Oberfläche des Prismas.
- Kurz (EN): Area and perimeter of further polygons and the circle, and volume and surface area of the prism.
- Simulationen: `flaechen-zerlegen`, `kreiszahl-pi`, `prisma-zylinder`
- Unterbereiche:
  - 3.2.1 Flächeninhalt und Umfang von Dreieck, Parallelogramm, Trapez, Raute, Drachen, Kreis · *Area and perimeter of triangle, parallelogram, trapezium, rhombus, kite, circle* – Kurz: Flächenformeln durch Zerlegen und Ergänzen herleiten; Kreisumfang und -fläche mit π. · *EN: Deriving area formulas by dissection and completion; circumference and area of the circle with π.* – Simulationen: `flaechen-zerlegen`, `kreiszahl-pi`
  - 3.2.2 Volumen und Oberflächeninhalt beim Prisma · *Volume and surface area of the prism* – Kurz: Volumen und Oberfläche von Prismen berechnen. · *EN: Calculating volume and surface area of prisms.* – Simulationen: `prisma-zylinder`

**Leitidee: Funktionaler Zusammenhang** · *Guiding idea: Functional relationship*

### 4.1 Zuordnungen und ihre Darstellungen
*EN: Assignments (mappings) and their representations*

- Kurz (DE): Proportionale und antiproportionale Zuordnungen erkennen, mit Dreisatz lösen und in Text, Tabelle und Graph darstellen.
- Kurz (EN): Recognising proportional and inversely proportional assignments, solving them with the rule of three and representing them in text, table and graph.
- Simulationen: `proportional`, `hyperbel`, `funktion-zuordnung`
- Unterbereiche:
  - 4.1.1 Proportionale und antiproportionale Zuordnungen und ihre Eigenschaften · *Proportional and inversely proportional assignments and their properties* – Kurz: Quotienten- bzw. Produktgleichheit erkennen und nutzen. · *EN: Recognising and using constant quotients or constant products.* – Simulationen: `proportional`, `hyperbel`
  - 4.1.2 Dreisatzmethoden · *Rule-of-three methods* – Kurz: Fehlende Werte schrittweise über eine Einheit berechnen. · *EN: Calculating missing values step by step via one unit.* – Simulationen: `proportional`
  - 4.1.3 Darstellung der proportionalen und antiproportionalen Zuordnungen in sprachlicher, tabellarischer und graphischer Form · *Representing proportional and inversely proportional assignments in words, tables and graphs* – Kurz: Zwischen Text, Wertetabelle und Graph wechseln. · *EN: Switching between text, table of values and graph.* – Simulationen: `proportional`, `funktion-zuordnung`

### 4.2 Funktionen und Gleichungen
*EN: Functions and equations*

- Kurz (DE): Lineare Gleichungen und Ungleichungen lösen, Lösungswege vergleichen und lineare Funktionen mit ihren Eigenschaften untersuchen.
- Kurz (EN): Solving linear equations and inequalities, comparing solution methods and investigating linear functions and their properties.
- Simulationen: `waagemodell`, `gleichungen-grafisch`, `lineare-funktion`
- Unterbereiche:
  - 4.2.1 Lösen von linearen Gleichungen · *Solving linear equations* – Kurz: Gleichungen durch Äquivalenzumformungen lösen. · *EN: Solving equations by equivalent transformations.* – Simulationen: `waagemodell`
  - 4.2.2 Vergleich des Vorgehens beim Lösen von linearen Gleichungen · *Comparing approaches to solving linear equations* – Kurz: Probieren, Umformen und grafisches Lösen gegenüberstellen. · *EN: Contrasting trial-and-error, algebraic transformation and graphical solution.* – Simulationen: `waagemodell`, `gleichungen-grafisch`
  - 4.2.3 Lineare Funktionen und ihre Eigenschaften · *Linear functions and their properties* – Kurz: Steigung und y-Achsenabschnitt deuten und Graphen zeichnen. · *EN: Interpreting slope and y-intercept and drawing graphs.* – Simulationen: `lineare-funktion`
  - 4.2.4 Lösen von Ungleichungen · *Solving inequalities* – Kurz: Lineare Ungleichungen lösen und Lösungsmengen angeben. · *EN: Solving linear inequalities and stating solution sets.* – Simulationen: –

**Leitidee: Daten und Zufall** · *Guiding idea: Data and chance*

### 5.1 statistische Erhebungen und ihre Auswertung
*EN: Statistical surveys and their evaluation*

- Kurz (DE): Daten in Boxplots, Säulen- und Kreisdiagrammen darstellen und mit Lage- und Streumaßen beurteilen.
- Kurz (EN): Presenting data in box plots, bar and pie charts and assessing them with measures of centre and spread.
- Simulationen: `boxplot`, `diagramme`
- Unterbereiche:
  - 5.1.1 Darstellung von Daten in Diagrammen (Boxplot, Säulendiagramm, Kreisdiagramm) und Tabellen · *Presenting data in diagrams (box plot, bar chart, pie chart) and tables* – Kurz: Passende Diagrammart wählen, erstellen und kritisch lesen. · *EN: Choosing, creating and critically reading a suitable type of diagram.* – Simulationen: `boxplot`, `diagramme`
  - 5.1.2 Lage- und Streumaße · *Measures of centre and spread* – Kurz: Mittelwert, Median, Quartile und Spannweite bestimmen und vergleichen. · *EN: Determining and comparing mean, median, quartiles and range.* – Simulationen: `boxplot`

### 5.2 Umgang mit dem Zufall
*EN: Dealing with chance*

- Kurz (DE): Zweistufige Zufallsexperimente mit Baumdiagrammen, Vierfeldertafeln und Pfadregeln beschreiben und berechnen.
- Kurz (EN): Describing and calculating two-stage random experiments with tree diagrams, two-way tables and path rules.
- Simulationen: `baumdiagramm`, `zaehlprinzip`, `vierfeldertafel`
- Unterbereiche:
  - 5.2.1 Zweistufige Zufallsexperimente · *Two-stage random experiments* – Kurz: Experimente aus zwei Teilschritten untersuchen und Ergebnisse abzählen. · *EN: Investigating experiments with two steps and counting outcomes.* – Simulationen: `baumdiagramm`, `zaehlprinzip`
  - 5.2.2 Baumdiagramme und Vierfeldertafeln · *Tree diagrams and two-way tables* – Kurz: Wahrscheinlichkeiten in Baumdiagrammen und Vierfeldertafeln darstellen. · *EN: Representing probabilities in tree diagrams and two-way tables.* – Simulationen: `baumdiagramm`, `vierfeldertafel`
  - 5.2.3 Pfadregeln · *Path rules* – Kurz: Produkt- und Summenregel anwenden. · *EN: Applying the product and sum rules.* – Simulationen: `baumdiagramm`

## Jahrgangsstufe 9/10 (Doppeljahrgangsstufe)  
*Grades 9/10 (double grade level)*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen, Sekundarstufe I – Gymnasium, MATHEMATIK“ (Datei kerncurriculum_mathematik_gymnasium.pdf), S. 16–21 (Kap. 6), 26–29 (Kap. 7.3); Internet laut Impressum: www.kultusministerium.hessen.de)

> Doppeljahrgangsstufe 9/10: Die Inhalte gelten für das Ende der Jahrgangsstufe 10 und sind bei Jahrgangsstufe 9 und 10 gleich eingetragen. Codes: erste Ziffer = Leitidee (1 Zahl und Operation, 2 Raum und Form, 3 Größen und Messen, 4 Funktionaler Zusammenhang, 5 Daten und Zufall), zweite = Inhaltsfeld, dritte = inhaltlicher Schwerpunkt; die Nummerierung stammt nicht aus dem Lehrplan. Kumulativ: Inhalte früherer Doppeljahrgangsstufen werden vorausgesetzt; Verschiebungen über Jahrgangsgrenzen sind erlaubt, solange die Ziele am Ende von 9/10 erreicht werden.

**Leitidee: Raum und Form** · *Guiding idea: Space and shape*

### 2.2 Körper
*EN: Solids*

- Kurz (DE): Pyramide, Kegel und Kugel sowie Körper aus Technik und Alltag: Darstellung und Berechnung von Volumen und Oberfläche.
- Kurz (EN): Pyramid, cone and sphere as well as solids from technology and everyday life: representation and calculation of volume and surface area.
- Simulationen: `pyramide-kegel-kugel`, `cavalieri`, `koerpernetze`
- Unterbereiche:
  - 2.2.1 Grundkörper (Pyramide, Kegel, Kugel) · *Basic solids (pyramid, cone, sphere)* – Kurz: Spitze und runde Körper und ihre Eigenschaften kennenlernen. · *EN: Getting to know pointed and round solids and their properties.* – Simulationen: `pyramide-kegel-kugel`
  - 2.2.2 Körper aus der Technik und der Lebensumwelt · *Solids from technology and everyday life* – Kurz: Reale Gegenstände als Kombination von Grundkörpern modellieren. · *EN: Modelling real objects as combinations of basic solids.* – Simulationen: –
  - 2.2.3 Beschreibung von Volumen und Oberflächeninhalt bei Pyramide, Kegel, Kugel · *Describing volume and surface area of pyramid, cone, sphere* – Kurz: Volumenformeln begründen (z. B. Cavalieri) und anwenden. · *EN: Justifying volume formulas (e.g. Cavalieri) and applying them.* – Simulationen: `pyramide-kegel-kugel`, `cavalieri`
  - 2.2.4 Modelle, Schrägbilder und Netze bekannter Körper · *Models, oblique drawings and nets of known solids* – Kurz: Auch Pyramiden und Kegel in Netz und Schrägbild darstellen. · *EN: Representing pyramids and cones as nets and oblique drawings too.* – Simulationen: `koerpernetze`

### 2.3 Beziehungen zwischen geometrischen Objekten
*EN: Relationships between geometric objects*

- Kurz (DE): Trigonometrie: Sinus, Kosinus und Tangens in rechtwinkligen und allgemeinen Dreiecken.
- Kurz (EN): Trigonometry: sine, cosine and tangent in right-angled and general triangles.
- Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`
- Unterbereiche:
  - 2.3.1 Trigonometrischen Beziehungen (sin, cos, tan) bei rechtwinkligen und allgemeinen Dreiecken · *Trigonometric relationships (sin, cos, tan) in right-angled and general triangles* – Kurz: Seitenverhältnisse als sin, cos, tan; Sinus- und Kosinussatz für beliebige Dreiecke. · *EN: Side ratios as sin, cos, tan; law of sines and law of cosines for any triangle.* – Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`

**Leitidee: Größen und Messen** · *Guiding idea: Quantities and measuring*

### 3.2 Messvorgänge
*EN: Measuring processes*

- Kurz (DE): Berechnungen an Dreiecken und Vielecken in Anwendungen sowie Volumen und Oberfläche von Pyramide, Kegel, Zylinder und Kugel.
- Kurz (EN): Calculations in triangles and polygons in applications, and volume and surface area of pyramid, cone, cylinder and sphere.
- Simulationen: `pythagoras`, `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `pyramide-kegel-kugel`, `prisma-zylinder`
- Unterbereiche:
  - 3.2.1 Berechnungen in Dreiecken und Vielecken (Anwendungen aus Technik und Physik) · *Calculations in triangles and polygons (applications from technology and physics)* – Kurz: Strecken und Winkel in Sachaufgaben mit Pythagoras und Trigonometrie berechnen. · *EN: Calculating lengths and angles in applied problems with Pythagoras and trigonometry.* – Simulationen: `pythagoras`, `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`
  - 3.2.2 Volumen und Oberflächeninhalt bei Pyramide, Kegel, Zylinder, Kugel · *Volume and surface area of pyramid, cone, cylinder, sphere* – Kurz: Formeln für Volumen und Oberfläche anwenden und vergleichen. · *EN: Applying and comparing formulas for volume and surface area.* – Simulationen: `pyramide-kegel-kugel`, `prisma-zylinder`

**Leitidee: Funktionaler Zusammenhang** · *Guiding idea: Functional relationship*

### 4.1 Zuordnungen und ihre Darstellungen
*EN: Assignments (mappings) and their representations*

- Kurz (DE): Nicht-proportionale funktionale Zusammenhänge verstehen und in Worten, Tabellen und Graphen darstellen.
- Kurz (EN): Understanding non-proportional functional relationships and representing them in words, tables and graphs.
- Simulationen: `funktion-zuordnung`, `funktionsplotter`
- Unterbereiche:
  - 4.1.1 Grundvorstellungen zu nicht-proportionalen funktionalen Zusammenhängen · *Basic ideas of non-proportional functional relationships* – Kurz: Erkennen, wann ein Zusammenhang eine Funktion ist und wie er sich verändert. · *EN: Recognising when a relationship is a function and how it changes.* – Simulationen: `funktion-zuordnung`
  - 4.1.2 Darstellung der Zuordnungen in sprachlicher, tabellarischer oder graphischer Form · *Representing assignments in words, tables or graphs* – Kurz: Zusammenhänge flexibel in verschiedenen Darstellungen beschreiben. · *EN: Describing relationships flexibly in different representations.* – Simulationen: `funktionsplotter`

### 4.2 Funktionen und Gleichungen
*EN: Functions and equations*

- Kurz (DE): Quadratische Gleichungen und lineare 2×2-Systeme lösen; Potenz-, Exponential- und Sinusfunktionen (laut Inhaltsfeldbeschreibung auch quadratische Funktionen) zum Modellieren nutzen.
- Kurz (EN): Solving quadratic equations and linear 2×2 systems; using power, exponential and sine functions (according to the content-area description also quadratic functions) for modelling.
- Simulationen: `quadratische-funktion`, `extremwert-parabel`, `gleichungen-grafisch`, `lgs-grafisch`, `potenzfunktionen`, `exponentielles-wachstum`, `sinusfunktion`, `einheitskreis`, `funktionsplotter`
- Unterbereiche:
  - 4.2.1 Lösen von quadratischen Gleichungen · *Solving quadratic equations* – Kurz: Quadratische Gleichungen rechnerisch und grafisch lösen. · *EN: Solving quadratic equations algebraically and graphically.* – Simulationen: `quadratische-funktion`, `gleichungen-grafisch`
  - 4.2.2 Lösen von linearen 2×2-Gleichungssystemen · *Solving linear 2×2 systems of equations* – Kurz: Systeme aus zwei Gleichungen rechnerisch und als Geradenschnitt lösen. · *EN: Solving systems of two equations algebraically and as intersecting lines.* – Simulationen: `lgs-grafisch`
  - 4.2.3 Einfache Potenzfunktionen · *Simple power functions* – Kurz: Graphen von y = a·xⁿ untersuchen. · *EN: Investigating graphs of y = a·xⁿ.* – Simulationen: `potenzfunktionen`
  - 4.2.4 Exponentialfunktionen · *Exponential functions* – Kurz: Wachstums- und Zerfallsvorgänge mit Exponentialfunktionen beschreiben. · *EN: Describing growth and decay processes with exponential functions.* – Simulationen: `exponentielles-wachstum`
  - 4.2.5 Sinusfunktion und ihre wesentlichen Eigenschaften · *Sine function and its main properties* – Kurz: Die Sinusfunktion am Einheitskreis entwickeln; Periode und Amplitude. · *EN: Developing the sine function on the unit circle; period and amplitude.* – Simulationen: `sinusfunktion`, `einheitskreis`
  - 4.2.6 Darstellung von Funktionen (Funktionsgleichung, Tabelle, Graph) · *Representing functions (equation, table, graph)* – Kurz: Zwischen Term, Tabelle und Graph wechseln, auch mit Software. · *EN: Switching between term, table and graph, also with software.* – Simulationen: `funktionsplotter`

**Leitidee: Daten und Zufall** · *Guiding idea: Data and chance*

### 5.2 Umgang mit dem Zufall
*EN: Dealing with chance*

- Kurz (DE): Mehrstufige Zufallsexperimente beschreiben und Wahrscheinlichkeiten berechnen.
- Kurz (EN): Describing multi-stage random experiments and calculating probabilities.
- Simulationen: `baumdiagramm`, `galtonbrett`
- Unterbereiche:
  - 5.2.1 Mehrstufige Zufallsexperimente · *Multi-stage random experiments* – Kurz: Wahrscheinlichkeiten bei mehr als zwei Stufen mit Baumdiagramm und Pfadregeln bestimmen. · *EN: Finding probabilities for more than two stages with tree diagrams and path rules.* – Simulationen: `baumdiagramm`, `galtonbrett`

## Einführungsphase E1/E2 – „Grundlagen der Analysis“  
*Introductory phase E1/E2 – “Foundations of calculus”*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: „Kerncurriculum gymnasiale Oberstufe MATHEMATIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), S. 27, 30–34; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahre E1/E2 „Grundlagen der Analysis“. Verbindlich: Themenfelder E.1–E.5 (Teile von E.4 oder E.5 dürfen nach Q1 verschoben werden); E.6 und E.7 sind nicht verbindlich. Keine Unterscheidung nach Grund-/Leistungskurs in der Einführungsphase. Die Zuordnung zu Jahrgangsstufe 11 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### E.1 Funktionen und ihre Darstellung
*EN: Functions and their representation*

- Kurz (DE): [verbindlich] Wiederholung und Vertiefung des Funktionsbegriffs an ganzrationalen Funktionen: Eigenschaften, besondere Punkte und Modellieren mit linearen und quadratischen Funktionen.
- Kurz (EN): [mandatory] Revisiting and deepening the concept of function using polynomial functions: properties, special points and modelling with linear and quadratic functions.
- Simulationen: `ganzrationale-funktionen`, `transformationen`, `grenzverhalten`, `gleichungen-grafisch`, `lineare-funktion`, `quadratische-funktion`
- Unterbereiche:
  - E.1.1 Erarbeiten grundlegender Begriffe und Eigenschaften anhand von ganzrationalen Funktionen · *Developing basic concepts and properties using polynomial functions* – Kurz: Definitions- und Wertemenge, Symmetrie, Verhalten für große |x| sowie Verschieben und Strecken von Graphen. · *EN: Domain and range, symmetry, behaviour for large |x|, and shifting and stretching graphs.* – Simulationen: `ganzrationale-funktionen`, `transformationen`, `grenzverhalten`
  - E.1.2 Bestimmen besonderer Punkte · *Determining special points* – Kurz: Achsenschnittpunkte und Schnittpunkte zweier Graphen grafisch und rechnerisch finden. · *EN: Finding axis intercepts and intersections of two graphs graphically and algebraically.* – Simulationen: `gleichungen-grafisch`
  - E.1.3 Modellieren von Realsituationen durch geeignete Funktionsklassen · *Modelling real situations with suitable classes of functions* – Kurz: Sachsituationen vor allem mit linearen und quadratischen Funktionen beschreiben. · *EN: Describing real situations mainly with linear and quadratic functions.* – Simulationen: `lineare-funktion`, `quadratische-funktion`

### E.2 Einführung des Ableitungsbegriffs
*EN: Introduction of the derivative*

- Kurz (DE): [verbindlich] Von der mittleren zur lokalen Änderungsrate: Sekante wird zur Tangente, Ableitung an einer Stelle und Ableitungsfunktion, erste Ableitungsregeln.
- Kurz (EN): [mandatory] From average to instantaneous rate of change: secant becomes tangent, derivative at a point and derivative function, first differentiation rules.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `stammfunktion-grafisch`
- Unterbereiche:
  - E.2.1 Bedeutung der Ableitung als lokale Änderungsrate und als Tangentensteigung · *Meaning of the derivative as instantaneous rate of change and as slope of the tangent* – Kurz: Änderungsraten in Sachkontexten deuten, besonders Durchschnitts- und Momentangeschwindigkeit. · *EN: Interpreting rates of change in context, especially average and instantaneous velocity.* – Simulationen: `sekante-tangente`
  - E.2.2 Ableitung einer Funktion an einer Stelle · *Derivative of a function at a point* – Kurz: Grenzübergang vom Differenzen- zum Differenzialquotienten mit propädeutischem Grenzwertbegriff; Tangente und Normale. · *EN: Limit from difference quotient to differential quotient using an intuitive notion of limit; tangent and normal.* – Simulationen: `sekante-tangente`
  - E.2.3 Zusammenhang von Ableitungs- und Funktionsgraphen · *Relationship between graphs of a function and its derivative* – Kurz: Grafisch ableiten, Graphen von f und f′ einander begründet zuordnen; Begriff der Stammfunktion. · *EN: Differentiating graphically, matching graphs of f and f′ with reasons; concept of an antiderivative.* – Simulationen: `ableitungsfunktion`, `stammfunktion-grafisch`
  - E.2.4 Ableitungsregeln · *Differentiation rules* – Kurz: Potenz-, Faktor- und Summenregel begründen und ganzrationale Funktionen ableiten. · *EN: Justifying the power, constant-factor and sum rules and differentiating polynomials.* – Simulationen: –

### E.3 Anwendungen des Ableitungsbegriffs
*EN: Applications of the derivative*

- Kurz (DE): [verbindlich] Kurvendiskussion ganzrationaler Funktionen, Rekonstruktion von Funktionen aus Eigenschaften und Lösen von Extremalproblemen.
- Kurz (EN): [mandatory] Curve sketching of polynomial functions, reconstructing functions from properties and solving optimisation problems.
- Simulationen: `kurvendiskussion`, `ganzrationale-funktionen`, `extremwertprobleme`
- Unterbereiche:
  - E.3.1 Funktionsuntersuchung bei ganzrationalen Funktionen · *Analysis of polynomial functions* – Kurz: Monotonie, Krümmung, Extrem- und Wendestellen mit notwendigen und hinreichenden Kriterien bestimmen. · *EN: Determining monotonicity, concavity, extrema and inflection points with necessary and sufficient conditions.* – Simulationen: `kurvendiskussion`, `ganzrationale-funktionen`
  - E.3.2 Rekonstruktion von ganzrationalen Funktionen anhand ihrer Eigenschaften · *Reconstructing polynomial functions from their properties* – Kurz: Aus Bedingungen (z. B. Extrempunkt, knickfreier Anschluss) eine passende Funktionsgleichung bestimmen. · *EN: Finding a suitable function equation from conditions (e.g. extreme point, smooth join).* – Simulationen: –
  - E.3.3 Extremalprobleme · *Optimisation problems* – Kurz: Inner- und außermathematische Optimierungsaufgaben mit der Ableitung lösen. · *EN: Solving optimisation problems inside and outside mathematics with the derivative.* – Simulationen: `extremwertprobleme`

### E.4 Exponentialfunktionen
*EN: Exponential functions*

- Kurz (DE): [verbindlich] Exponentielles Wachstum und exponentieller Zerfall, die e-Funktion und ihre Ableitung, Produkt- und Kettenregel sowie Lösen von Exponentialgleichungen.
- Kurz (EN): [mandatory] Exponential growth and decay, the natural exponential function and its derivative, product and chain rule, and solving exponential equations.
- Simulationen: `exponentielles-wachstum`, `e-funktion`, `logarithmus`
- Unterbereiche:
  - E.4.1 Wachstums- und Zerfallsprozesse · *Growth and decay processes* – Kurz: Parameter in f(x) = a·bˣ + c deuten, Halbwerts- und Verdopplungszeit, Modellieren mit Daten. · *EN: Interpreting parameters in f(x) = a·bˣ + c, half-life and doubling time, modelling with data.* – Simulationen: `exponentielles-wachstum`
  - E.4.2 die (natürliche) Exponentialfunktion f(x) = eˣ · *the (natural) exponential function f(x) = eˣ* – Kurz: Die Zahl e und die Ableitung von eˣ anschaulich herleiten; Basiswechsel zur Basis e. · *EN: Deriving the number e and the derivative of eˣ intuitively; changing to base e.* – Simulationen: `e-funktion`
  - E.4.3 Produkt- und Kettenregel · *Product and chain rule* – Kurz: Produkte und Verkettungen aus ganzrationalen und Exponentialfunktionen ableiten. · *EN: Differentiating products and compositions of polynomial and exponential functions.* – Simulationen: –
  - E.4.4 Exponentialgleichungen · *Exponential equations* – Kurz: Exponentialgleichungen über das Logarithmieren algebraisch lösen. · *EN: Solving exponential equations algebraically using logarithms.* – Simulationen: `logarithmus`

### E.5 Trigonometrische Funktionen
*EN: Trigonometric functions*

- Kurz (DE): [verbindlich] Periodische Vorgänge mit Sinus- und Kosinusfunktionen beschreiben, Parameter deuten und die Ableitungen dieser Funktionen bestimmen.
- Kurz (EN): [mandatory] Describing periodic processes with sine and cosine functions, interpreting parameters and finding the derivatives of these functions.
- Simulationen: `sinusfunktion`, `einheitskreis`, `ableitungsfunktion`
- Unterbereiche:
  - E.5.1 periodische Prozesse · *periodic processes* – Kurz: Bogenmaß, Bedeutung der Parameter in a·sin[b·(x − c)] + d, Periode, Amplitude und Modellieren mit Daten. · *EN: Radians, meaning of the parameters in a·sin[b·(x − c)] + d, period, amplitude and modelling with data.* – Simulationen: `sinusfunktion`, `einheitskreis`
  - E.5.2 Ableitung der Sinus- und der Kosinusfunktion · *Derivative of the sine and cosine functions* – Kurz: Ableitungen durch grafisches Differenzieren begründen. · *EN: Justifying the derivatives by graphical differentiation.* – Simulationen: `ableitungsfunktion`
  - E.5.3 Ableitung von f(x) = a·sin[b·(x − c)] + d beziehungsweise f(x) = a·cos[b·(x − c)] + d · *Derivative of f(x) = a·sin[b·(x − c)] + d or f(x) = a·cos[b·(x − c)] + d* – Kurz: Mit der Kettenregel ableiten und Ableitungswerte im Sachkontext deuten; Tangenten und Normalen. · *EN: Differentiating with the chain rule and interpreting derivative values in context; tangents and normals.* – Simulationen: –

### E.6 Weitere Verfahren zum Lösen von Gleichungen
*EN: Further methods for solving equations*

- Kurz (DE): [nicht verbindlich] Polynomdivision zur Nullstellensuche und numerische Näherungsverfahren für Gleichungen.
- Kurz (EN): [optional] Polynomial division to find zeros and numerical approximation methods for equations.
- Simulationen: `newton-verfahren`
- Unterbereiche:
  - E.6.1 Polynomdivision · *Polynomial division* – Kurz: Polynome faktorisieren, um Nullstellen zu bestimmen. · *EN: Factorising polynomials to determine zeros.* – Simulationen: –
  - E.6.2 numerische Lösungsverfahren · *numerical solution methods* – Kurz: Bisektion, Newton-Verfahren und Regula falsi vergleichen, inklusive Konvergenz und Grenzen. · *EN: Comparing bisection, Newton's method and regula falsi, including convergence and limitations.* – Simulationen: `newton-verfahren`

### E.7 Folgen und Reihen
*EN: Sequences and series*

- Kurz (DE): [nicht verbindlich] Arithmetische und geometrische Folgen und Reihen sowie deren Grenzwerte.
- Kurz (EN): [optional] Arithmetic and geometric sequences and series and their limits.
- Simulationen: –
- Unterbereiche:
  - E.7.1 Folgen · *Sequences* – Kurz: Konvergenz und Divergenz begründen und Grenzwerte mit Grenzwertsätzen bestimmen. · *EN: Justifying convergence and divergence and finding limits with limit laws.* – Simulationen: –
  - E.7.2 Reihen · *Series* – Kurz: Arithmetische und geometrische Reihen und ihre Grenzwerte untersuchen. · *EN: Investigating arithmetic and geometric series and their limits.* – Simulationen: –

## Qualifikationsphase Q1 – „Analysis“  
*Qualification phase Q1 – “Calculus”*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: „Kerncurriculum gymnasiale Oberstufe MATHEMATIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), S. 27, 35–38; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q1 „Analysis“. Verbindlich: Themenfelder Q1.1–Q1.3; Q1.4 und Q1.5 sind nicht verbindlich. Die Zuordnung zu Jahrgangsstufe 12 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q1.1 Einführung in die Integralrechnung
*EN: Introduction to integral calculus*

- Kurz (DE): [verbindlich] Das Integral als rekonstruierter Bestand und als orientierter Flächeninhalt, Rechtecksummen, Hauptsatz und erste Integrationsregeln.
- Kurz (EN): [mandatory] The integral as reconstructed total and as signed area, rectangle sums, fundamental theorem and first integration rules.
- Simulationen: `aenderungsrate`, `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`
- Unterbereiche:
  - Q1.1.1 Bedeutung des Integrals als Bestandsgröße und als orientierter Flächeninhalt · *Meaning of the integral as accumulated quantity and as signed area* – Kurz: Aus Änderungsrate und Anfangswert den Bestand rekonstruieren; Integral als Produktsumme. · *EN: Reconstructing a total from rate of change and initial value; integral as a sum of products.* – Simulationen: `aenderungsrate`, `ober-untersummen`
  - Q1.1.2 Flächen unter einem Funktionsgraphen · *Areas under a function graph* – Kurz: Flächen mit Ober- und Untersummen annähern und per Grenzwert zum bestimmten Integral übergehen. · *EN: Approximating areas with upper and lower sums and passing to the definite integral via a limit.* – Simulationen: `ober-untersummen`
  - Q1.1.3 Hauptsatz der Differenzial- und Integralrechnung · *Fundamental theorem of calculus* – Kurz: Zusammenhang von Ableiten und Integrieren anschaulich begründen; Funktion und Stammfunktion grafisch. · *EN: Justifying the link between differentiation and integration intuitively; function and antiderivative graphically.* – Simulationen: `hauptsatz`, `stammfunktion-grafisch`
  - Q1.1.4 Entwickeln der Integrationsregeln mithilfe der Ableitungsregeln · *Developing integration rules from differentiation rules* – Kurz: Stammfunktionen von Potenzen, eˣ, sin x und cos x; Faktor- und Summenregel. · *EN: Antiderivatives of powers, eˣ, sin x and cos x; constant-factor and sum rule.* – Simulationen: –
  - Q1.1.5 Integrieren von e^(ax+b), sin[b·(x − c)], cos[b·(x − c)] · *Integrating e^(ax+b), sin[b·(x − c)], cos[b·(x − c)]* – Kurz: Stammfunktionen von linear verketteten Funktionen bestimmen. · *EN: Finding antiderivatives of functions with a linear inner function.* – Simulationen: –
  - Q1.1.6 Integrieren von (ax + b)^r mit r ∈ ℚ \ {−1}, Integrieren von g(x) = f′(x)·e^f(x) **[nur LK]** · *Integrating (ax + b)^r with r ∈ ℚ \ {−1}, integrating g(x) = f′(x)·e^f(x)* – Kurz: Nur LK (erhöhtes Niveau): Weitere Stammfunktionen über die Umkehrung der Kettenregel. · *EN: Advanced course only (higher level): Further antiderivatives by reversing the chain rule.* – Simulationen: –

### Q1.2 Anwendungen der Integralrechnung
*EN: Applications of integral calculus*

- Kurz (DE): [verbindlich] Flächeninhalte zwischen Graphen, Bestände und Mittelwerte in Sachkontexten; im LK zusätzlich Rotationskörper und uneigentliche Integrale.
- Kurz (EN): [mandatory] Areas between graphs, totals and mean values in context; in the advanced course also solids of revolution and improper integrals.
- Simulationen: `aenderungsrate`, `rotationskoerper`
- Unterbereiche:
  - Q1.2.1 Flächeninhaltsberechnung · *Calculating areas* – Kurz: Flächen zwischen Graphen und Achsenparallelen berechnen, auch rückwärts (Grenze oder Parameter gesucht). · *EN: Calculating areas between graphs and lines parallel to the axes, also backwards (unknown bound or parameter).* – Simulationen: –
  - Q1.2.2 Anwenden des Integrals für Berechnungen in Sachzusammenhängen · *Applying the integral to calculations in context* – Kurz: Rekonstruierter Bestand, mittlerer Bestand und mittlere Änderungsrate. · *EN: Reconstructed total, mean value and average rate of change.* – Simulationen: `aenderungsrate`
  - Q1.2.3 Argumentieren und Begründen anhand von Integral-Termen · *Reasoning and justifying with integral expressions* – Kurz: Integralausdrücke im Sachzusammenhang deuten und Aussagen begründen. · *EN: Interpreting integral expressions in context and justifying statements.* – Simulationen: –
  - Q1.2.4 Rotationskörper **[nur LK]** · *Solids of revolution* – Kurz: Nur LK (erhöhtes Niveau): Volumenformel begründen und Volumina von Rotationskörpern um die x-Achse berechnen. · *EN: Advanced course only (higher level): Justifying the volume formula and calculating volumes of solids of revolution about the x-axis.* – Simulationen: `rotationskoerper`
  - Q1.2.5 uneigentliche Integrale **[nur LK]** · *improper integrals* – Kurz: Nur LK (erhöhtes Niveau): Unendlich ausgedehnte Flächen auf endlichen Inhalt untersuchen. · *EN: Advanced course only (higher level): Examining infinitely extended regions for finite area.* – Simulationen: –

### Q1.3 Vertiefung der Differenzial- und Integralrechnung
*EN: Deepening differential and integral calculus*

- Kurz (DE): [verbindlich] Sicherer Umgang mit den Inhalten der Einführungsphase, verknüpfte Exponentialfunktionen und Wachstumsmodelle; im LK Funktionen mit Parametern und logistisches Wachstum.
- Kurz (EN): [mandatory] Confident use of the introductory-phase content, combined exponential functions and growth models; in the advanced course functions with parameters and logistic growth.
- Simulationen: `kurvendiskussion`, `e-funktion`, `exponentielles-wachstum`, `logarithmus`, `funktionenscharen`
- Unterbereiche:
  - Q1.3.1 verständiges Umgehen mit den in der Einführungsphase erarbeiteten Inhalten · *competent use of the content developed in the introductory phase* – Kurz: Funktionen, Ableitung und Ableitungsregeln vernetzt anwenden. · *EN: Applying functions, derivatives and differentiation rules in an integrated way.* – Simulationen: `kurvendiskussion`
  - Q1.3.2 Untersuchen von Exponentialfunktionen, die mit ganzrationalen Funktionen verknüpft sind · *Investigating exponential functions combined with polynomial functions* – Kurz: Summen, Produkte und Verkettungen aus e-Funktion und Polynomen untersuchen, auch im Sachkontext. · *EN: Investigating sums, products and compositions of exponential functions and polynomials, also in context.* – Simulationen: `e-funktion`
  - Q1.3.3 Wachstums- und Zerfallsprozesse · *Growth and decay processes* – Kurz: Exponentielles und begrenztes Wachstum mit Messdaten modellieren; Exponentialgleichungen lösen. · *EN: Modelling exponential and bounded growth with measured data; solving exponential equations.* – Simulationen: `exponentielles-wachstum`, `logarithmus`
  - Q1.3.4 Untersuchung von Funktionen mit Parametern, bei denen Exponentialfunktionen mit ganzrationalen Funktionen verknüpft sind, sowie von Kettenlinien und Glockenkurven **[nur LK]** · *Investigating functions with parameters combining exponential and polynomial functions, as well as catenaries and bell curves* – Kurz: Nur LK (erhöhtes Niveau): Einfluss von Parametern auf verknüpfte Exponentialfunktionen untersuchen. · *EN: Advanced course only (higher level): Investigating the influence of parameters on combined exponential functions.* – Simulationen: `funktionenscharen`
  - Q1.3.5 logistisches Wachstum **[nur LK]** · *logistic growth* – Kurz: Nur LK (erhöhtes Niveau): Logistische Wachstumsmodelle anwenden (ohne Herleitung aus der Differenzialgleichung). · *EN: Advanced course only (higher level): Applying logistic growth models (without deriving them from the differential equation).* – Simulationen: –

### Q1.4 Integrationsmethoden
*EN: Integration techniques*

- Kurz (DE): [nicht verbindlich] Weitere Verfahren zum Finden von Stammfunktionen.
- Kurz (EN): [optional] Further methods for finding antiderivatives.
- Simulationen: –
- Unterbereiche:
  - Q1.4.1 Ermitteln einer Stammfunktion durch Formansatz mit Koeffizientenvergleich · *Finding an antiderivative by an ansatz with comparison of coefficients* – Kurz: Stammfunktion mit passendem Ansatz und Koeffizientenvergleich bestimmen. · *EN: Determining an antiderivative with a suitable ansatz and comparison of coefficients.* – Simulationen: –
  - Q1.4.2 partielle Integration **[nur LK]** · *integration by parts* – Kurz: Nur LK (erhöhtes Niveau): Produktintegrale mit partieller Integration lösen. · *EN: Advanced course only (higher level): Solving integrals of products by integration by parts.* – Simulationen: –
  - Q1.4.3 Integration durch Substitution **[nur LK]** · *integration by substitution* – Kurz: Nur LK (erhöhtes Niveau): Integrale durch Substitution vereinfachen. · *EN: Advanced course only (higher level): Simplifying integrals by substitution.* – Simulationen: –

### Q1.5 Gewöhnliche Differenzialgleichungen
*EN: Ordinary differential equations*

- Kurz (DE): [nicht verbindlich] Wachstumsmodelle mit Differenzialgleichungen beschreiben und Gleichungen erster Ordnung lösen.
- Kurz (EN): [optional] Describing growth models with differential equations and solving first-order equations.
- Simulationen: –
- Unterbereiche:
  - Q1.5.1 Beschreiben und Entwickeln von Modellen für Wachstums- und Zerfallsprozesse mithilfe von Differenzialgleichungen · *Describing and developing models for growth and decay with differential equations* – Kurz: Wachstumsannahmen in Differenzialgleichungen übersetzen. · *EN: Translating growth assumptions into differential equations.* – Simulationen: –
  - Q1.5.2 Lösungsverfahren für Differenzialgleichungen erster Ordnung · *Solution methods for first-order differential equations* – Kurz: Richtungsfelder, Trennung der Variablen und weitere elementare Methoden. · *EN: Slope fields, separation of variables and other elementary methods.* – Simulationen: –
  - Q1.5.3 Untersuchen von Differenzialgleichungen zweiter Ordnung **[nur LK]** · *Investigating second-order differential equations* – Kurz: Nur LK (erhöhtes Niveau): Differenzialgleichungen zweiter Ordnung, etwa bei periodischen Vorgängen. · *EN: Advanced course only (higher level): Second-order differential equations, e.g. for periodic processes.* – Simulationen: –

## Qualifikationsphase Q2 – „Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis“  
*Qualification phase Q2 – “Analytic geometry, linear algebra and deepening of calculus”*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: „Kerncurriculum gymnasiale Oberstufe MATHEMATIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), S. 28, 39–44; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q2 „Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis“. Verbindlich: Themenfelder Q2.1–Q2.3; Q2.4 und Q2.5 sind nicht verbindlich. Die Zuordnung zu Jahrgangsstufe 12 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q2.1 Vertiefung der Analysis
*EN: Deepening of calculus*

- Kurz (DE): [verbindlich] Weitere Funktionsklassen (einfache gebrochen-rationale und Wurzelfunktionen), Transformationen von Graphen und Umkehrfunktionen; im LK die ln-Funktion und Verkettungen.
- Kurz (EN): [mandatory] Further function classes (simple rational and root functions), graph transformations and inverse functions; in the advanced course the natural logarithm and compositions.
- Simulationen: `polstellen-asymptoten`, `grenzverhalten`, `transformationen`, `umkehrfunktion`, `logarithmus`, `funktionsplotter`
- Unterbereiche:
  - Q2.1.1 einfache gebrochen rationale und einfache Wurzelfunktionen · *simple rational functions and simple root functions* – Kurz: Eigenschaften und Ableitungen von f(x) = 1/xⁿ und f(x) = √x. · *EN: Properties and derivatives of f(x) = 1/xⁿ and f(x) = √x.* – Simulationen: `polstellen-asymptoten`, `grenzverhalten`
  - Q2.1.2 Verschiebung und Streckung · *Shifting and stretching* – Kurz: Graphen verschieben, strecken und spiegeln; g(x) = a·f(b·(x − c)) + d deuten. · *EN: Shifting, stretching and reflecting graphs; interpreting g(x) = a·f(b·(x − c)) + d.* – Simulationen: `transformationen`
  - Q2.1.3 Umkehrfunktion · *Inverse function* – Kurz: Umkehrfunktion aufstellen und als Spiegelung an y = x deuten; Definitions- und Wertemenge. · *EN: Finding the inverse and interpreting it as reflection in y = x; domain and range.* – Simulationen: `umkehrfunktion`
  - Q2.1.4 die natürliche Logarithmusfunktion f(x) = ln(x) **[nur LK]** · *the natural logarithm function f(x) = ln(x)* – Kurz: Nur LK (erhöhtes Niveau): ln als Umkehrfunktion der e-Funktion beschreiben und transformieren. · *EN: Advanced course only (higher level): Describing ln as the inverse of the exponential function and transforming it.* – Simulationen: `umkehrfunktion`, `logarithmus`
  - Q2.1.5 die natürliche Logarithmusfunktion als Stammfunktion von 1/x **[nur LK]** · *the natural logarithm as antiderivative of 1/x* – Kurz: Nur LK (erhöhtes Niveau): ln(x) als Stammfunktion von 1/x nutzen. · *EN: Advanced course only (higher level): Using ln(x) as the antiderivative of 1/x.* – Simulationen: –
  - Q2.1.6 Verknüpfen und Verketten von Funktionen **[nur LK]** · *Combining and composing functions* – Kurz: Nur LK (erhöhtes Niveau): Eigenschaften von Summen, Produkten und Verkettungen anhand der Graphen begründen. · *EN: Advanced course only (higher level): Justifying properties of sums, products and compositions from the graphs.* – Simulationen: `funktionsplotter`

### Q2.2 Orientieren und Bewegen im Raum
*EN: Orientation and movement in space*

- Kurz (DE): [verbindlich] Räumliches Koordinatensystem, Vektoren, Skalarprodukt und Winkel sowie Untersuchung einfacher Körper und Figuren im Raum.
- Kurz (EN): [mandatory] Spatial coordinate system, vectors, dot product and angles, and investigation of simple solids and figures in space.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`
- Unterbereiche:
  - Q2.2.1 räumliche Koordinatensysteme · *spatial coordinate systems* – Kurz: Punkte und Körper im 3D-Koordinatensystem darstellen, auch mit Software. · *EN: Representing points and solids in a 3D coordinate system, also with software.* – Simulationen: `koordinaten-3d`
  - Q2.2.2 Vektoren · *Vectors* – Kurz: Verschiebungen als Vektoren, Rechnen mit Vektoren, Kollinearität, Betrag und Abstand. · *EN: Translations as vectors, vector arithmetic, collinearity, magnitude and distance.* – Simulationen: `vektoren-3d`
  - Q2.2.3 Winkel · *Angles* – Kurz: Skalarprodukt, Orthogonalität und Winkel zwischen Vektoren. · *EN: Dot product, orthogonality and angles between vectors.* – Simulationen: `skalar-vektorprodukt`
  - Q2.2.4 einfache geometrische Körper und Figuren im Raum · *simple geometric solids and figures in space* – Kurz: Würfel, Prismen, Pyramiden und ebene Figuren im Raum untersuchen und berechnen. · *EN: Investigating and calculating cubes, prisms, pyramids and plane figures in space.* – Simulationen: `koordinaten-3d`

### Q2.3 Geraden und Ebenen im Raum
*EN: Lines and planes in space*

- Kurz (DE): [verbindlich] Lineare Gleichungssysteme, Geraden und Ebenen in verschiedenen Darstellungen, Lagebeziehungen, Winkel, Abstände und Anwendungen wie Schattenwurf.
- Kurz (EN): [mandatory] Systems of linear equations, lines and planes in different forms, relative positions, angles, distances and applications such as shadows.
- Simulationen: `geraden-ebenen`, `lage-abstaende`, `skalar-vektorprodukt`
- Unterbereiche:
  - Q2.3.1 systematisches Lösen von linearen Gleichungssystemen (auch über- und unterbestimmte) · *systematic solution of systems of linear equations (including over- and underdetermined)* – Kurz: Gleichungssysteme algorithmisch lösen und Lösungsmengen geometrisch deuten. · *EN: Solving systems algorithmically and interpreting solution sets geometrically.* – Simulationen: –
  - Q2.3.2 Parameterdarstellungen · *Parametric representations* – Kurz: Geraden und Strecken mit Parametergleichungen, Punktprobe und Spurpunkte. · *EN: Lines and segments with parametric equations, point test and trace points.* – Simulationen: `geraden-ebenen`
  - Q2.3.3 Lagebeziehung von Geraden · *Relative position of lines* – Kurz: Schneiden, parallel, identisch oder windschief; Schnittpunkt und Schnittwinkel. · *EN: Intersecting, parallel, identical or skew; intersection point and angle.* – Simulationen: `geraden-ebenen`, `lage-abstaende`
  - Q2.3.4 Anwendung auf geradlinige Bewegungen · *Application to linear motion* – Kurz: Bewegungen mit Geraden beschreiben; Richtungsvektor als Geschwindigkeit. · *EN: Describing motion with lines; direction vector as velocity.* – Simulationen: `geraden-ebenen`
  - Q2.3.5 Ebenen in verschiedenen Darstellungsformen · *Planes in different forms* – Kurz: Parameter- und Koordinatenform, Normalenvektor. · *EN: Parametric and coordinate form, normal vector.* – Simulationen: `geraden-ebenen`
  - Q2.3.6 Darstellen von Ebenen und von begrenzten Flächen (insbesondere Dreieck, Parallelogramm) im Raum mit Parametergleichung · *Representing planes and bounded regions (especially triangle, parallelogram) in space with a parametric equation* – Kurz: Punktprobe und Spurpunkte von Ebenen. · *EN: Point test and trace points of planes.* – Simulationen: `geraden-ebenen`
  - Q2.3.7 Umwandeln der verschiedenen Darstellungsformen einer Ebene ineinander · *Converting between the forms of a plane* – Kurz: Formen umwandeln; Lage von Gerade und Ebene und Durchstoßpunkte bestimmen. · *EN: Converting forms; determining the position of a line relative to a plane and intersection points.* – Simulationen: `geraden-ebenen`, `lage-abstaende`
  - Q2.3.8 Berechnung des Winkels zwischen Gerade und Ebene sowie zwischen Ebene und Ebene · *Calculating the angle between line and plane and between two planes* – Kurz: Schnittwinkel mithilfe von Richtungs- und Normalenvektoren. · *EN: Intersection angles using direction and normal vectors.* – Simulationen: –
  - Q2.3.9 Untersuchung von Winkeln (insbesondere auf Orthogonalität und Parallelität) sowie von den genannten Lagebeziehungen jeweils in Abhängigkeit von einem (zusätzlichen) Parameter · *Investigating angles (especially orthogonality and parallelism) and the relative positions mentioned, each depending on an (additional) parameter* – Kurz: Lage und Winkel abhängig von einem Parameter untersuchen. · *EN: Investigating positions and angles depending on a parameter.* – Simulationen: –
  - Q2.3.10 Spiegelung und orthogonale Projektion · *Reflection and orthogonal projection* – Kurz: Punkt an Ebene spiegeln; Lotfußpunktverfahren für den Abstand Punkt–Ebene. · *EN: Reflecting a point in a plane; foot-of-perpendicular method for point–plane distance.* – Simulationen: `lage-abstaende`
  - Q2.3.11 Anwendung in Sachzusammenhängen · *Application in context* – Kurz: Schattenwürfe, Projektionen auf Koordinatenebenen und Flächenberechnungen. · *EN: Shadows, projections onto coordinate planes and area calculations.* – Simulationen: –
  - Q2.3.12 Normalenform einer Ebene **[nur LK]** · *Normal form of a plane* – Kurz: Nur LK (erhöhtes Niveau): Ebenen über Normalenvektor und Aufpunkt beschreiben. · *EN: Advanced course only (higher level): Describing planes via normal vector and position vector.* – Simulationen: `geraden-ebenen`
  - Q2.3.13 weitere Lagebeziehungen und Abstandsbestimmungen **[nur LK]** · *further relative positions and distance calculations* – Kurz: Nur LK (erhöhtes Niveau): Lage zweier Ebenen, Schnittgeraden, Abstände zwischen Punkten, Geraden und Ebenen, allgemeine Spiegelungen. · *EN: Advanced course only (higher level): Position of two planes, lines of intersection, distances between points, lines and planes, general reflections.* – Simulationen: `lage-abstaende`
  - Q2.3.14 Vektorprodukt **[nur LK]** · *Cross product* – Kurz: Nur LK (erhöhtes Niveau): Vektorprodukt für Normalenvektoren und Flächeninhalte nutzen. · *EN: Advanced course only (higher level): Using the cross product for normal vectors and areas.* – Simulationen: `skalar-vektorprodukt`
  - Q2.3.15 Geradenscharen **[nur LK]** · *Families of lines* – Kurz: Nur LK (erhöhtes Niveau): Geraden mit Parameter untersuchen. · *EN: Advanced course only (higher level): Investigating lines with a parameter.* – Simulationen: –
  - Q2.3.16 Ebenenscharen, insbesondere in der Darstellung durch eine Koordinatengleichung **[nur LK]** · *Families of planes, especially in coordinate form* – Kurz: Nur LK (erhöhtes Niveau): Ebenen mit Parameter untersuchen. · *EN: Advanced course only (higher level): Investigating planes with a parameter.* – Simulationen: –
  - Q2.3.17 Darstellung von Parabelbahnen mithilfe von Parametern **[nur LK]** · *Representing parabolic trajectories using parameters* – Kurz: Nur LK (erhöhtes Niveau): Flugbahnen (z. B. eines Balls) parametrisch beschreiben. · *EN: Advanced course only (higher level): Describing trajectories (e.g. of a ball) parametrically.* – Simulationen: –

### Q2.4 Matrizen zur Beschreibung von Übergangsprozessen
*EN: Matrices for describing transition processes*

- Kurz (DE): [nicht verbindlich] Übergangsprozesse mit Graphen, Zustandsvektoren und Übergangsmatrizen modellieren, Matrizenrechnung und Markov-Ketten.
- Kurz (EN): [optional] Modelling transition processes with graphs, state vectors and transition matrices; matrix arithmetic and Markov chains.
- Simulationen: –
- Unterbereiche:
  - Q2.4.1 Beschreiben von Übergangsprozessen mithilfe von Zustands- beziehungsweise Übergangsgraphen, Zustandsvektoren und Übergangsmatrizen · *Describing transition processes using state/transition graphs, state vectors and transition matrices* – Kurz: Z. B. Populationen, Wählerwanderung oder Kundenströme modellieren. · *EN: Modelling e.g. populations, voter movements or customer flows.* – Simulationen: –
  - Q2.4.2 Rechnen mit Matrizen · *Calculating with matrices* – Kurz: Skalar-, Matrix-Vektor- und Matrixmultiplikation, Addition, einfache Inverse. · *EN: Scalar, matrix–vector and matrix multiplication, addition, simple inverses.* – Simulationen: –
  - Q2.4.3 Markov-Ketten · *Markov chains* – Kurz: Zustände schrittweise (auch rückwärts) berechnen und stabile Zustände über Fixvektoren finden. · *EN: Calculating states step by step (also backwards) and finding stable states via fixed vectors.* – Simulationen: –
  - Q2.4.4 Bestimmen und Interpretieren von Matrixeinträgen bei Potenzen von Matrizen · *Determining and interpreting entries of matrix powers* – Kurz: Einträge von M² usw. im Kontext deuten. · *EN: Interpreting entries of M² etc. in context.* – Simulationen: –
  - Q2.4.5 langfristige Entwicklung von Übergangsprozessen **[nur LK]** · *long-term development of transition processes* – Kurz: Nur LK (erhöhtes Niveau): Matrixpotenzen, Grenzprozesse und Grenzmatrizen interpretieren. · *EN: Advanced course only (higher level): Interpreting matrix powers, limiting processes and limit matrices.* – Simulationen: –

### Q2.5 Matrizen zur Darstellung linearer geometrischer Abbildungen
*EN: Matrices for representing linear geometric transformations*

- Kurz (DE): [nicht verbindlich] Geometrische Abbildungen wie Spiegelungen, Projektionen und Streckungen mit Matrizen darstellen und verketten.
- Kurz (EN): [optional] Representing and composing geometric transformations such as reflections, projections and dilations with matrices.
- Simulationen: `matrix-abbildungen`
- Unterbereiche:
  - Q2.5.1 Beschreiben von geometrischen Abbildungen mithilfe von Matrizen · *Describing geometric transformations using matrices* – Kurz: Z. B. Schattenwürfe als Abbildung mit einer Matrix beschreiben. · *EN: Describing e.g. shadows as a mapping given by a matrix.* – Simulationen: `matrix-abbildungen`
  - Q2.5.2 Rechnen mit Matrizen · *Calculating with matrices* – Kurz: Matrizen addieren, multiplizieren und einfache Inverse bestimmen. · *EN: Adding and multiplying matrices and finding simple inverses.* – Simulationen: –
  - Q2.5.3 Darstellen linearer geometrischer Abbildungen mit Matrizen · *Representing linear geometric transformations with matrices* – Kurz: Abbildungsmatrizen für Spiegelungen, Parallelprojektionen, zentrische Streckungen und deren Verkettung. · *EN: Transformation matrices for reflections, parallel projections, central dilations and their compositions.* – Simulationen: `matrix-abbildungen`
  - Q2.5.4 Darstellen linearer geometrischer Abbildungen im dreidimensionalen euklidischen Raum ℝ³ mit Matrizen **[nur LK]** · *Representing linear geometric transformations in three-dimensional Euclidean space ℝ³ with matrices* – Kurz: Nur LK (erhöhtes Niveau): Drehungen um Koordinatenachsen, Projektionen auf beliebige Ursprungsebenen, Fixpunkte. · *EN: Advanced course only (higher level): Rotations about coordinate axes, projections onto arbitrary planes through the origin, fixed points.* – Simulationen: `matrix-abbildungen`

## Qualifikationsphase Q3 – „Stochastik“  
*Qualification phase Q3 – “Probability and statistics”*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: „Kerncurriculum gymnasiale Oberstufe MATHEMATIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), S. 28, 45–49; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q3 „Stochastik“. Verbindlich: Themenfelder Q3.1–Q3.2 im Grundkurs, Q3.1–Q3.3 im Leistungskurs; übrige Themenfelder nicht verbindlich. Die Zuordnung zu Jahrgangsstufe 13 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q3.1 Grundlegende Begriffe und Methoden der Stochastik
*EN: Basic concepts and methods of probability*

- Kurz (DE): [verbindlich] Wahrscheinlichkeitsbegriff, mehrstufige Experimente, Ereignisse und Mengen, bedingte Wahrscheinlichkeit, Unabhängigkeit und Kombinatorik.
- Kurz (EN): [mandatory] Concept of probability, multi-stage experiments, events and sets, conditional probability, independence and combinatorics.
- Simulationen: `gesetz-grosse-zahlen`, `baumdiagramm`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `zaehlprinzip`, `geburtstagsproblem`
- Unterbereiche:
  - Q3.1.1 statistischer Wahrscheinlichkeitsbegriff · *statistical concept of probability* – Kurz: Absolute und relative Häufigkeit sowie empirisches Gesetz der großen Zahlen. · *EN: Absolute and relative frequency and the empirical law of large numbers.* – Simulationen: `gesetz-grosse-zahlen`
  - Q3.1.2 Grundlagen der Wahrscheinlichkeitstheorie · *Foundations of probability theory* – Kurz: Ergebnis, Ereignis, Laplace-Wahrscheinlichkeit und Vergleich mit Versuchsergebnissen. · *EN: Outcome, event, Laplace probability and comparison with experimental results.* – Simulationen: –
  - Q3.1.3 Bestimmen von Wahrscheinlichkeiten bei mehrstufigen Zufallsexperimenten · *Determining probabilities in multi-stage random experiments* – Kurz: Baumdiagramme und Pfadregeln anwenden. · *EN: Using tree diagrams and path rules.* – Simulationen: `baumdiagramm`
  - Q3.1.4 Verknüpfung von Ereignissen · *Combining events* – Kurz: Und-, Oder- und Gegenereignis, Mengendarstellung, auch mit Vierfeldertafel. · *EN: And, or and complementary events, set notation, also with a two-way table.* – Simulationen: `vierfeldertafel`
  - Q3.1.5 bedingte Wahrscheinlichkeiten · *conditional probabilities* – Kurz: Bedingte Wahrscheinlichkeiten in Baumdiagrammen und Mehrfeldertafeln; stochastische Unabhängigkeit. · *EN: Conditional probabilities in tree diagrams and contingency tables; stochastic independence.* – Simulationen: `bedingte-wahrscheinlichkeit`, `vierfeldertafel`
  - Q3.1.6 Lösen kombinatorischer Zählprobleme · *Solving combinatorial counting problems* – Kurz: Produktregel, Stichproben mit/ohne Zurücklegen, Fakultät, Binomialkoeffizient. · *EN: Product rule, samples with/without replacement, factorial, binomial coefficient.* – Simulationen: `zaehlprinzip`
  - Q3.1.7 Bestimmen von Laplace-Wahrscheinlichkeiten mithilfe von Zählverfahren · *Determining Laplace probabilities with counting methods* – Kurz: Urnenmodelle mit und ohne Zurücklegen (z. B. Lotto) vergleichen. · *EN: Comparing urn models with and without replacement (e.g. lottery).* – Simulationen: `zaehlprinzip`, `geburtstagsproblem`

### Q3.2 Wahrscheinlichkeitsverteilungen
*EN: Probability distributions*

- Kurz (DE): [verbindlich] Zufallsgrößen mit Erwartungswert und Streuung, Bernoulli-Ketten und Binomialverteilung; im LK zusätzlich die Normalverteilung.
- Kurz (EN): [mandatory] Random variables with expected value and spread, Bernoulli chains and binomial distribution; in the advanced course also the normal distribution.
- Simulationen: `binomialverteilung`, `galtonbrett`, `normalverteilung`
- Unterbereiche:
  - Q3.2.1 Erarbeiten grundlegender Begriffe · *Developing basic concepts* – Kurz: Zufallsgröße, Verteilung im Histogramm, Erwartungswert, Varianz, Standardabweichung; faire Spiele. · *EN: Random variable, distribution as histogram, expected value, variance, standard deviation; fair games.* – Simulationen: –
  - Q3.2.2 Bernoulli-Ketten · *Bernoulli chains* – Kurz: Formel von Bernoulli begründen und in Sachkontexten anwenden; Modellgrenzen. · *EN: Justifying Bernoulli's formula and applying it in context; limits of the model.* – Simulationen: `binomialverteilung`, `galtonbrett`
  - Q3.2.3 binomialverteilte Zufallsgrößen · *binomially distributed random variables* – Kurz: Kenngrößen, Histogramme und kumulierte Wahrscheinlichkeiten, auch inverse Fragestellungen. · *EN: Parameters, histograms and cumulative probabilities, including inverse problems.* – Simulationen: `binomialverteilung`
  - Q3.2.4 normalverteilte Zufallsgrößen, Wahrscheinlichkeitsdichte der Normalverteilung **[nur LK]** · *normally distributed random variables, probability density of the normal distribution* – Kurz: Nur LK (erhöhtes Niveau): Dichtefunktion, Glockenform, μ und σ, Hoch- und Wendepunkte. · *EN: Advanced course only (higher level): Density function, bell shape, μ and σ, maximum and inflection points.* – Simulationen: `normalverteilung`
  - Q3.2.5 Wahrscheinlichkeiten normalverteilter Zufallsgrößen **[nur LK]** · *probabilities of normally distributed random variables* – Kurz: Nur LK (erhöhtes Niveau): Verteilungsfunktion, Sigma-Regeln und inverse Fragestellungen. · *EN: Advanced course only (higher level): Cumulative distribution function, sigma rules and inverse problems.* – Simulationen: `normalverteilung`

### Q3.3 Hypothesentests
*EN: Hypothesis tests*

- Kurz (DE): [verbindlich nur im Leistungskurs (im Grundkurs nicht verbindlich)] Signifikanztests für binomialverteilte Zufallsgrößen mit Entscheidungsregel, Fehlern 1. und 2. Art; im LK zusätzlich Operationscharakteristik.
- Kurz (EN): [mandatory in the advanced course only (optional in the basic course)] Significance tests for binomially distributed random variables with decision rule and type I and II errors; in the advanced course also the operating characteristic.
- Simulationen: `signifikanztest`
- Unterbereiche:
  - Q3.3.1 Hypothesentests (rechtsseitige, linksseitige und zweiseitige Signifikanztests) für binomialverteilte Zufallsgrößen · *Hypothesis tests (right-, left- and two-tailed significance tests) for binomially distributed random variables* – Kurz: Hypothesen festlegen, Ablehnungsbereich bestimmen, Fehler 1. und 2. Art berechnen. · *EN: Setting hypotheses, finding the rejection region, calculating type I and II errors.* – Simulationen: `signifikanztest`
  - Q3.3.2 Grafische Darstellung der Wahrscheinlichkeiten für das Beibehalten beziehungsweise Verwerfen der Nullhypothese in Abhängigkeit vom wahren Wert der Trefferwahrscheinlichkeit p **[nur LK]** · *Graphical representation of the probabilities of keeping or rejecting the null hypothesis depending on the true value of the success probability p* – Kurz: Nur LK (erhöhtes Niveau): Operationscharakteristik bzw. Gütefunktion darstellen und deuten. · *EN: Advanced course only (higher level): Plotting and interpreting the operating characteristic or power function.* – Simulationen: –

### Q3.4 Prognose- und Konfidenzintervalle
*EN: Prediction and confidence intervals*

- Kurz (DE): [nicht verbindlich] Mit Sigma-Regeln von der Grundgesamtheit auf die Stichprobe schließen und umgekehrt.
- Kurz (EN): [optional] Using sigma rules to infer from population to sample and vice versa.
- Simulationen: –
- Unterbereiche:
  - Q3.4.1 Prognoseintervalle für relative Häufigkeiten · *Prediction intervals for relative frequencies* – Kurz: Erwartete Bereiche für Stichprobenergebnisse bestimmen. · *EN: Determining expected ranges for sample results.* – Simulationen: –
  - Q3.4.2 Konfidenzintervalle für Wahrscheinlichkeiten · *Confidence intervals for probabilities* – Kurz: Aus einer Stichprobe einen Bereich für die unbekannte Wahrscheinlichkeit schätzen. · *EN: Estimating a range for the unknown probability from a sample.* – Simulationen: –
  - Q3.4.3 Konfidenzdiagramme (Konfidenzellipse) **[nur LK]** · *Confidence diagrams (confidence ellipse)* – Kurz: Nur LK (erhöhtes Niveau): Konfidenzbereiche grafisch darstellen. · *EN: Advanced course only (higher level): Representing confidence regions graphically.* – Simulationen: –
  - Q3.4.4 Stichprobenumfänge **[nur LK]** · *Sample sizes* – Kurz: Nur LK (erhöhtes Niveau): Nötigen Stichprobenumfang für ein Konfidenzniveau berechnen. · *EN: Advanced course only (higher level): Calculating the sample size needed for a confidence level.* – Simulationen: –

### Q3.5 Statistik und weitere Wahrscheinlichkeitsverteilungen
*EN: Statistics and further probability distributions*

- Kurz (DE): [nicht verbindlich] Eigene Datenerhebungen und Simulationen, empirische Kennwerte, Poisson-Verteilung; im LK Näherungen und weitere stetige Verteilungen.
- Kurz (EN): [optional] Own data collection and simulations, empirical statistics, Poisson distribution; in the advanced course approximations and further continuous distributions.
- Simulationen: `gesetz-grosse-zahlen`, `normalverteilung`, `galtonbrett`
- Unterbereiche:
  - Q3.5.1 statistischer Wahrscheinlichkeitsbegriff · *statistical concept of probability* – Kurz: Eigene Zufallsexperimente durchführen und mit Software simulieren. · *EN: Carrying out own random experiments and simulating them with software.* – Simulationen: `gesetz-grosse-zahlen`
  - Q3.5.2 Umgang mit Daten · *Working with data* – Kurz: Eigene Daten mit Mittelwert, empirischer Varianz und Standardabweichung beurteilen. · *EN: Assessing own data with mean, empirical variance and standard deviation.* – Simulationen: –
  - Q3.5.3 Poisson-Verteilung · *Poisson distribution* – Kurz: Seltene Ereignisse mit der Poisson-Verteilung berechnen. · *EN: Calculating rare events with the Poisson distribution.* – Simulationen: –
  - Q3.5.4 Normalverteilung als Näherung der Binomialverteilung **[nur LK]** · *Normal distribution as approximation of the binomial distribution* – Kurz: Nur LK (erhöhtes Niveau): Binomial-Histogramme bei großer Streuung durch die Glockenkurve annähern. · *EN: Advanced course only (higher level): Approximating binomial histograms with large spread by the bell curve.* – Simulationen: `normalverteilung`, `galtonbrett`
  - Q3.5.5 Poisson-Verteilung als Näherung der Binomialverteilung bei konstantem Erwartungswert **[nur LK]** · *Poisson distribution as approximation of the binomial distribution with constant expected value* – Kurz: Nur LK (erhöhtes Niveau): Grenzübergang für n → ∞ beweisen. · *EN: Advanced course only (higher level): Proving the limit as n → ∞.* – Simulationen: –
  - Q3.5.6 weitere stetige Verteilungen **[nur LK]** · *further continuous distributions* – Kurz: Nur LK (erhöhtes Niveau): Z. B. die Exponentialverteilung. · *EN: Advanced course only (higher level): E.g. the exponential distribution.* – Simulationen: –

## Qualifikationsphase Q4 – „Funktionenscharen, Problemlösen und Argumentieren“  
*Qualification phase Q4 – “Families of functions, problem solving and reasoning”*  
Jahrgangsstufe(n) im JSON: 13  
(Quelle: „Kerncurriculum gymnasiale Oberstufe MATHEMATIK, Ausgabe 2024 (Stand 01.08.2025)“ (Datei kerncurriculum_gymnasiale_oberstufe-mathematik.pdf), S. 28, 50–52; Internet laut Impressum: https://kultus.hessen.de)

> Kurshalbjahr Q4 „Funktionenscharen, Problemlösen und Argumentieren“. Verbindlich: Themenfeld Q4.1; Q4.2 und Q4.3 sind nicht verbindlich. Die Zuordnung zu Jahrgangsstufe 13 ist eine Annahme (G9-Zählung) – der Lehrplan nennt nur Kurshalbjahre. In der Qualifikationsphase gilt: Unterbereiche ohne Zusatz gehören zum grundlegenden Niveau (Grund- und Leistungskurs), „Nur LK“ markiert das erhöhte Niveau. Nummerierung der Unterbereiche (dritte Stelle) nicht aus dem Lehrplan.

### Q4.1 Funktionenscharen
*EN: Families of functions*

- Kurz (DE): [verbindlich] Funktionen mit Parameter untersuchen und integrieren, besonders ganzrationale und mit Exponentialfunktionen verknüpfte Scharen; im LK Ortskurven.
- Kurz (EN): [mandatory] Investigating and integrating functions with a parameter, especially polynomial families and families combined with exponential functions; in the advanced course loci.
- Simulationen: `funktionenscharen`, `transformationen`
- Unterbereiche:
  - Q4.1.1 Untersuchen und Integrieren von Funktionenscharen ganzrationaler Funktionen, Bedeutung des Parameters für den Graphen · *Investigating and integrating families of polynomial functions, meaning of the parameter for the graph* – Kurz: Einfluss des Parameters auf Nullstellen, Extrema und Flächen. · *EN: Influence of the parameter on zeros, extrema and areas.* – Simulationen: `funktionenscharen`
  - Q4.1.2 Untersuchen von Funktionenscharen, bei denen Exponentialfunktionen mit ganzrationalen Funktionen verknüpft sind · *Investigating families combining exponential and polynomial functions* – Kurz: Scharen aus e-Funktion und Polynomen untersuchen und integrieren. · *EN: Investigating and integrating families built from exponential functions and polynomials.* – Simulationen: `funktionenscharen`
  - Q4.1.3 Untersuchen von Funktionenscharen aller weiteren bekannten Funktionsklassen, falls der Parameter ausschließlich eine Streckung oder Verschiebung bewirkt · *Investigating families of all other known function classes if the parameter only causes a stretch or shift* – Kurz: Parameter als Verschiebung oder Streckung des Graphen deuten. · *EN: Interpreting the parameter as a shift or stretch of the graph.* – Simulationen: `funktionenscharen`, `transformationen`
  - Q4.1.4 Ortskurven **[nur LK]** · *Loci* – Kurz: Nur LK (erhöhtes Niveau): Ortskurven von Extrem- und Wendepunkten bestimmen. · *EN: Advanced course only (higher level): Determining the loci of extreme and inflection points.* – Simulationen: –

### Q4.2 Problemlösen und Argumentieren
*EN: Problem solving and reasoning*

- Kurz (DE): [nicht verbindlich] Prozessbezogenes Themenfeld: Probleme erkennen, heuristische Strategien nutzen und Argumentationen entwickeln, angewandt auf frei gewählte Inhalte aller Sachgebiete.
- Kurz (EN): [optional] Process-oriented topic area: recognising problems, using heuristic strategies and developing arguments, applied to freely chosen content from all areas.
- Simulationen: `signifikanztest`
- Unterbereiche:
  - Q4.2.1 Erkennen und Formulieren mathematischer Probleme · *Recognising and formulating mathematical problems* – Kurz: Fragestellungen mathematisch fassen. · *EN: Framing questions mathematically.* – Simulationen: –
  - Q4.2.2 Anwenden heuristischer Strategien und Prinzipien zur Lösung mathematischer Probleme · *Applying heuristic strategies and principles to solve mathematical problems* – Kurz: Z. B. Vorwärts-/Rückwärtsarbeiten, systematisches Probieren, Extremal- und Symmetrieprinzip. · *EN: E.g. working forwards/backwards, systematic trial, extremal and symmetry principles.* – Simulationen: –
  - Q4.2.3 Beurteilen vorgegebener Aussagen oder Stellung nehmen zu vorgegebenen Aussagen · *Assessing given statements or commenting on them* – Kurz: Aussagen prüfen und begründet bewerten. · *EN: Checking statements and evaluating them with reasons.* – Simulationen: –
  - Q4.2.4 Nachvollziehen, Erläutern und Entwickeln von Argumentationen und logischen Schlussfolgerungen · *Following, explaining and developing arguments and logical conclusions* – Kurz: Argumentationsketten verstehen und selbst aufbauen. · *EN: Understanding chains of reasoning and building them oneself.* – Simulationen: –
  - Q4.2.5 Anwendung auf exemplarisch durch die Lehrkraft ausgewählte Themenfelder · *Application to topic areas chosen by the teacher as examples* – Kurz: Beispiele aus Analysis, Analytischer Geometrie, Linearer Algebra und Stochastik. · *EN: Examples from calculus, analytic geometry, linear algebra and probability.* – Simulationen: –
  - Q4.2.6 Stochastik **[nur LK]** · *Probability and statistics* – Kurz: Nur LK (erhöhtes Niveau): Strategien für Hypothesen und kritische Werte; Einfluss von n auf die Operationscharakteristik. · *EN: Advanced course only (higher level): Strategies for hypotheses and critical values; influence of n on the operating characteristic.* – Simulationen: `signifikanztest`

### Q4.3 Komplexe Zahlen
*EN: Complex numbers*

- Kurz (DE): [nicht verbindlich] Rechnen mit komplexen Zahlen in algebraischer und Polarform und Lösen von Gleichungen in ℂ.
- Kurz (EN): [optional] Calculating with complex numbers in algebraic and polar form and solving equations in ℂ.
- Simulationen: –
- Unterbereiche:
  - Q4.3.1 algebraische Form · *algebraic form* – Kurz: Real- und Imaginärteil, Grundrechenarten. · *EN: Real and imaginary part, basic operations.* – Simulationen: –
  - Q4.3.2 Polarform · *polar form* – Kurz: Darstellung in der Gaußschen Zahlenebene und geometrische Deutung der Rechenarten. · *EN: Representation in the complex plane and geometric interpretation of the operations.* – Simulationen: –
  - Q4.3.3 Lösen von Gleichungen in der Menge ℂ der komplexen Zahlen · *Solving equations in the set ℂ of complex numbers* – Kurz: Gleichungen lösen, die in ℝ keine Lösung haben. · *EN: Solving equations that have no solution in ℝ.* – Simulationen: –
  - Q4.3.4 Darstellen der komplexen Zahlen mit 2x2-Matrizen **[nur LK]** · *Representing complex numbers with 2×2 matrices* – Kurz: Nur LK (erhöhtes Niveau): Komplexe Zahlen als Drehstreckungsmatrizen. · *EN: Advanced course only (higher level): Complex numbers as rotation-dilation matrices.* – Simulationen: –

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `hessen-gymnasium-mathematik.json` (validiert, nur IDs aus der Liste).

# Teil D – Lücken und Vorschläge

## D.1 Lernbereiche ohne passende Simulation

- **5/6:** 4.1 Zuordnungen und ihre Darstellungen
- **E1/E2:** E.7 Folgen und Reihen
- **Q1:** Q1.4 Integrationsmethoden; Q1.5 Gewöhnliche Differenzialgleichungen
- **Q2:** Q2.4 Matrizen zur Beschreibung von Übergangsprozessen
- **Q3:** Q3.4 Prognose- und Konfidenzintervalle
- **Q4:** Q4.3 Komplexe Zahlen

## D.2 Unterbereiche ohne passende Simulation (in Lernbereichen, die sonst abgedeckt sind)

- **5/6:** 1.1.9 Darstellungen (Zahlenstrahl, Kreisdiagramm); 1.2.2 Strategien zum vorteilhaften Rechnen; 2.1.2 Konstruktion von Figuren und Mustern; 3.1.1 Größenvorstellungen; 3.1.3 Repräsentanten, Schätzungen und Überschlagsrechnungen; 3.2.3 Währung/Geld; 3.2.4 Zeitspanne; 5.1.1 Umfragen und Erhebungen (Planung, Durchführung und statistische Auswertung); 5.2.1 Zufallserscheinungen in alltäglichen Situationen
- **7/8:** 1.1.4 Vergleichen, Ordnen und Runden von rationalen und reellen Zahlen; 1.1.5 Orientierung im zweidimensionalen Koordinatensystem; 1.2.3 Potenzen mit rationalen Exponenten; 1.2.7 Prozente von Prozenten; 2.1.5 Kartesisches Koordinatensystem in allen vier Quadranten; 3.1.2 Größen von Winkeln (Minuten, Sekunden); 4.2.4 Lösen von Ungleichungen
- **9/10:** 2.2.2 Körper aus der Technik und der Lebensumwelt
- **E1/E2:** E.2.4 Ableitungsregeln; E.3.2 Rekonstruktion von ganzrationalen Funktionen anhand ihrer Eigenschaften; E.4.3 Produkt- und Kettenregel; E.5.3 Ableitung von f(x) = a·sin[b·(x − c)] + d beziehungsweise f(x) = a·cos[b·(x − c)] + d; E.6.1 Polynomdivision
- **Q1:** Q1.1.4 Entwickeln der Integrationsregeln mithilfe der Ableitungsregeln; Q1.1.5 Integrieren von e^(ax+b), sin[b·(x − c)], cos[b·(x − c)]; Q1.1.6 Integrieren von (ax + b)^r mit r ∈ ℚ \ {−1}, Integrieren von g(x) = f′(x)·e^f(x); Q1.2.1 Flächeninhaltsberechnung; Q1.2.3 Argumentieren und Begründen anhand von Integral-Termen; Q1.2.5 uneigentliche Integrale; Q1.3.5 logistisches Wachstum
- **Q2:** Q2.1.5 die natürliche Logarithmusfunktion als Stammfunktion von 1/x; Q2.3.1 systematisches Lösen von linearen Gleichungssystemen (auch über- und unterbestimmte); Q2.3.8 Berechnung des Winkels zwischen Gerade und Ebene sowie zwischen Ebene und Ebene; Q2.3.9 Untersuchung von Winkeln (insbesondere auf Orthogonalität und Parallelität) sowie von den genannten Lagebeziehungen jeweils in Abhängigkeit von einem (zusätzlichen) Parameter; Q2.3.11 Anwendung in Sachzusammenhängen; Q2.3.15 Geradenscharen; Q2.3.16 Ebenenscharen, insbesondere in der Darstellung durch eine Koordinatengleichung; Q2.3.17 Darstellung von Parabelbahnen mithilfe von Parametern; Q2.5.2 Rechnen mit Matrizen
- **Q3:** Q3.1.2 Grundlagen der Wahrscheinlichkeitstheorie; Q3.2.1 Erarbeiten grundlegender Begriffe; Q3.3.2 Grafische Darstellung der Wahrscheinlichkeiten für das Beibehalten beziehungsweise Verwerfen der Nullhypothese in Abhängigkeit vom wahren Wert der Trefferwahrscheinlichkeit p; Q3.5.2 Umgang mit Daten; Q3.5.3 Poisson-Verteilung; Q3.5.5 Poisson-Verteilung als Näherung der Binomialverteilung bei konstantem Erwartungswert; Q3.5.6 weitere stetige Verteilungen
- **Q4:** Q4.1.4 Ortskurven; Q4.2.1 Erkennen und Formulieren mathematischer Probleme; Q4.2.2 Anwenden heuristischer Strategien und Prinzipien zur Lösung mathematischer Probleme; Q4.2.3 Beurteilen vorgegebener Aussagen oder Stellung nehmen zu vorgegebenen Aussagen; Q4.2.4 Nachvollziehen, Erläutern und Entwickeln von Argumentationen und logischen Schlussfolgerungen; Q4.2.5 Anwendung auf exemplarisch durch die Lehrkraft ausgewählte Themenfelder

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Zahlenstrahl & Kreisdiagramm | Eine Zahl bzw. einen Anteil gleichzeitig am Zahlenstrahl und als Kreissektor einstellen und vergleichen. | 5/6: 1.1.9 |
| Koordinatensystem mit vier Quadranten | Punkte mit negativen Koordinaten setzen, Figuren spiegeln und verschieben (Koordinaten-Schatzsuche). | 7/8: 1.1.5, 2.1.5 |
| Rationale und reelle Zahlen ordnen | Zoombare Zahlengerade, auf der Brüche, Dezimalzahlen, Wurzeln und π einsortiert und gerundet werden. | 7/8: 1.1.4 |
| Potenzgesetze und rationale Exponenten | Potenzen mit negativen und gebrochenen Exponenten über Muster (Halbieren, Wurzelziehen) entdecken. | 7/8: 1.2.3 |
| Prozente von Prozenten & Zinseszins | Mehrere prozentuale Änderungen als Kette von Faktoren hintereinanderschalten und mit einer Gesamtänderung vergleichen. | 7/8: 1.2.7 |
| Ungleichungen am Zahlenstrahl | Lösungsmengen linearer Ungleichungen als Bereiche auf dem Zahlenstrahl sichtbar machen, inkl. Umkehr des Zeichens bei Multiplikation mit negativen Zahlen. | 7/8: 4.2.4 |
| Zuordnungen entdecken | Alltagssituationen (Menge–Preis, Zeit–Temperatur) als Tabelle und Schaubild erzeugen und beschreiben. | 5/6: 4.1 |
| Größen schätzen | Schätzspiel mit Referenzgrößen für Länge, Masse, Geld und Zeitspannen, inkl. Überschlagsrechnung. | 5/6: 3.1.1, 3.1.3, 3.2.3, 3.2.4 |
| Vorteilhaft rechnen | Rechenausdrücke per Drag-and-drop umsortieren und zeigen, welche Umformung die Rechnung erleichtert. | 5/6: 1.2.2 |
| Umfrage-Labor | Eigene Umfrage planen, simulierte Antworten sammeln und auswerten; Zufall im Alltag erkunden. | 5/6: 5.1.1, 5.2.1 |
| Konstruieren mit Zirkel und Lineal | Figuren und Muster Schritt für Schritt mit virtuellen Zeichengeräten konstruieren. | 5/6: 2.1.2 |
| Alltagskörper zerlegen | Ein Objekt (Silo, Turm, Flasche) aus Grundkörpern zusammensetzen und Volumen/Oberfläche berechnen. | 9/10: 2.2.2 |
| Steckbriefaufgaben | Bedingungen (Punkt, Extremum, Wendepunkt) per Klick setzen und die passende ganzrationale Funktion entstehen lassen. | E1/E2: E.3.2 |
| Ableitungsregeln sichtbar | Produkt- und Kettenregel an Graphen und Flächen-/Streckmodellen veranschaulichen. | E1/E2: E.2.4, E.4.3, E.5.3 |
| Folgen und Grenzwerte | Folgenglieder als Punkte plotten, ε-Schlauch verschieben und Konvergenz von Reihen beobachten. | E1/E2: E.7 |
| Fläche zwischen Graphen | Zwei Funktionsgraphen wählen, Schnittstellen bestimmen und die eingeschlossene Fläche berechnen, auch mit unbeschränkten Grenzen. | Q1: Q1.2.1, Q1.2.3, Q1.2.5 |
| Begrenztes und logistisches Wachstum | Wachstumsmodelle mit Schranke vergleichen und an Messdaten anpassen. | Q1: Q1.3.3, Q1.3.5 |
| Richtungsfelder | Richtungsfeld einer Differenzialgleichung zeichnen und Lösungskurven durch Startpunkte legen. | Q1: Q1.5 |
| Integrationsmethoden Schritt für Schritt | Partielle Integration und Substitution interaktiv durchlaufen. | Q1: Q1.1.4–Q1.1.6, Q1.4 |
| Gauß-Algorithmus | Lineare Gleichungssysteme schrittweise umformen und die Lösungsmenge als Schnitt von Ebenen im Raum sehen. | Q2: Q2.3.1 |
| Winkel und Scharen im Raum | Schnittwinkel von Geraden/Ebenen und Geraden- bzw. Ebenenscharen mit Parameter-Schieberegler untersuchen. | Q2: Q2.3.8, Q2.3.9, Q2.3.15, Q2.3.16 |
| Schattenwurf im Raum | Lichtrichtung einstellen und Schatten eines Körpers auf eine Ebene projizieren. | Q2: Q2.3.11 |
| Übergangsmatrizen und Markov-Ketten | Übergangsgraph bauen, Zustände iterieren und den stabilen Zustand finden. | Q2: Q2.4 |
| Erwartungswert und faire Spiele | Glücksspiele simulieren und Durchschnittsgewinn mit dem Erwartungswert vergleichen. | Q3: Q3.2.1 |
| Operationscharakteristik | Wahrscheinlichkeit für Annahme der Nullhypothese in Abhängigkeit vom wahren p plotten, n variieren. | Q3: Q3.3.2 |
| Konfidenzintervalle simulieren | Viele Stichproben ziehen und zeigen, wie oft das Intervall das wahre p trifft. | Q3: Q3.4 |
| Poisson-Verteilung | Seltene Ereignisse simulieren und Binomial- mit Poisson-Verteilung vergleichen. | Q3: Q3.5.3, Q3.5.5 |
| Ortskurven | Parameter einer Funktionenschar laufen lassen und die Spur der Extrem-/Wendepunkte zeichnen. | Q4: Q4.1.4 |
| Gaußsche Zahlenebene | Komplexe Zahlen als Pfeile addieren und multiplizieren (Drehstreckung). | Q4: Q4.3 |

# Teil E – Unklarheiten

1. **Keine Nummerierung im Sek-I-Lehrplan.** Leitideen, Inhaltsfelder und Schwerpunkte sind im Original nicht nummeriert. Die Codes (z. B. 2.3.4) sind von mir vergeben: Leitidee.Inhaltsfeld.Schwerpunkt, Reihenfolge wie im Dokument. Innerhalb jeder Doppeljahrgangsstufe beginnt die Zählung der Schwerpunkte neu.
2. **Erscheinungsjahr Sek I fehlt.** Im Mathematik-Dokument steht kein Jahr. Die PDF-Metadaten (Titel „KC Mathematik ÜSekII 201102“, erstellt 28.02.2011) deuten auf 2011 hin; das ist nicht aus dem Text belegt.
3. **G8/G9 Sek I.** Das Dokument nennt nur „Jahrgangsstufe 9/10“ als Ende der Sekundarstufe I und unterscheidet G8/G9 nicht ausdrücklich. Wie die Inhalte bei G8 bzw. G9 auf Klasse 9 und 10 verteilt werden, ist offen; im JSON sind die 9/10-Inhalte bei beiden Jahrgängen eingetragen.
4. **Leere Spalten 9/10.** Für die Inhaltsfelder Zahlen, Operationen und ihre Eigenschaften, Ebene Figuren, Umgang mit Größen und statistische Erhebungen enthält die Tabelle (S. 26–29) keine Einträge für 9/10. Reelle Zahlen (Wurzeln, π) und Potenzen mit rationalen Exponenten stehen bereits bei 7/8.
5. **Quadratische Funktionen.** Die Tabelle für 9/10 nennt nur das Lösen quadratischer Gleichungen; quadratische Funktionen werden aber in der Inhaltsfeldbeschreibung „Funktionen und Gleichungen“ (S. 20) genannt. Deshalb sind `quadratische-funktion` und `extremwert-parabel` auf Ebene des Lernbereichs 4.2 (9/10) zugeordnet, nicht einem einzelnen Schwerpunkt. `parabel-drei-punkte` wurde nicht zugeordnet.
6. **Kompetenzerwartungen nicht übernommen.** Die prozessbezogenen Kompetenzbereiche (Darstellen, Kommunizieren, Argumentieren, … bzw. in der Oberstufe K1–K6) sind keine Inhaltsbereiche und wurden nicht als Lernbereiche aufgenommen.
7. **Oberstufe ohne Jahrgangsangaben.** Der Lehrplan nennt nur Kurshalbjahre (E1/E2, Q1–Q4). Die JSON-Zuordnung E → 11, Q1/Q2 → 12, Q3/Q4 → 13 ist eine Annahme (G9-Zählung). Bei G8 wäre es E → 10, Q1/Q2 → 11, Q3/Q4 → 12. Bitte vor dem Einbau bestätigen.
8. **Titel der Unterbereiche in der Oberstufe.** Die inhaltlichen Aspekte sind im Original Spiegelstriche ohne Nummer. Als „Überschrift“ wurde der Text vor dem Doppelpunkt übernommen. Wo es keinen Doppelpunkt gibt, wurde der Spiegelstrich-Text übernommen und bei Q2.3.6 und Q4.2.2 um „zum Beispiel“-Klammern bzw. Detailangaben gekürzt. Bei Q1.1.5/1.1.6, E.4.2, E.5.3 und Q2.1 wurden Formeln aus der PDF-Darstellung in Unicode übertragen.
9. **Erlass-Schwerpunkte.** Laut Lehrplan können für das Abitur durch Erlass Schwerpunkte und Konkretisierungen innerhalb der Themenfelder festgelegt werden. Diese Erlasse liegen nicht vor und sind nicht berücksichtigt.
10. **Q3.3 Hypothesentests** ist nur im Leistungskurs verbindlich (im Grundkurs Q3.1–Q3.2). Das steht im Summary des Themenfelds; das JSON-Schema hat dafür kein eigenes Feld.
11. **GK/LK im JSON.** Das Schema hat kein Feld für das Anforderungsniveau. LK-Unterbereiche sind daher im `summary` mit „Nur LK (erhöhtes Niveau):“ bzw. „Advanced course only (higher level):“ markiert. Der Verbindlichkeitsstatus steht als „[verbindlich]“ / „[nicht verbindlich]“ am Anfang des Themenfeld-Summarys.
12. **Unsichere Simulationszuordnungen (bitte gegen den tatsächlichen Inhalt prüfen):** `koordinaten-lage` nur nach Titel/ID zugeordnet (Koordinatensystem 1. Quadrant, parallel/senkrecht). `zahlengerade` behandelt laut Titel ganze Zahlen, ist aber auch bei „Rationale Zahlen“ (7/8) zugeordnet. `einheitskreis` ist bei der Trigonometrie in allgemeinen Dreiecken (stumpfe Winkel) zugeordnet. Bei `matrix-abbildungen` ist offen, ob die Simulation 3D abdeckt (Q2.5.4). `signifikanztest` ist laut Titel einseitig; der Lehrplan verlangt auch zweiseitige Tests (Q3.3.1). Ob `funktionenscharen` Ortskurven zeigt (Q4.1.4), ist offen; deshalb nicht zugeordnet.
13. **Klassenstufen der Plattform weichen ab.** Einige Simulationen sind für andere Klassen ausgewiesen als im hessischen Lehrplan, z. B. `pythagoras` (Kl. 8–9 → Hessen 7/8), `strahlensaetze` und `vergroessern` (Kl. 9 → Hessen 7/8), `quadratwurzel` (Kl. 9 → Hessen 7/8), `proportional` (Kl. 6–8 → Hessen 7/8), `spiegelung` (Kl. 7 → Hessen auch 5/6), `boxplot` (Kl. 7 → Hessen auch 5/6 für Mittelwert/Median), `pyramide-kegel-kugel`/`cavalieri` (Kl. 10 → Hessen 9/10). Zugeordnet wurde nach Inhalt, nicht nach Klassenangabe.
14. **Bewusst nicht zugeordnet:** `taylor-polynome`, `fourier-reihen` und `kugeln` haben keinen Bezug im hessischen Lehrplan; Kugeln im Raum kommen in Q2 nicht vor. `monte-carlo-pi`, `ziegenproblem` und `parabel-drei-punkte` sind nur „verwandt“, aber keinem Schwerpunkt direkt zuzuordnen.
15. **Logarithmus.** Der Lehrplan verlangt Logarithmen nur zum Lösen von Exponentialgleichungen (Logarithmengesetze ausdrücklich nicht erforderlich, E.4.4 und Q1.3.3). Ob die geplante Simulation `logarithmus` diesen Umfang trifft, ist offen.
