# Niedersachsen · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarbereich I | Gymnasiale Oberstufe |
|---|---|---|
| Bundesland | Niedersachsen | Niedersachsen |
| Schulart | Gymnasium, Schuljahrgänge 5–10 | gymnasiale Oberstufe von Gymnasium und Gesamtschule, Berufliches Gymnasium, Abendgymnasium, Kolleg (abgebildet: Lernbereiche für Gymnasium, Gesamtschule, Abendgymnasium und Kolleg) |
| Fach | Mathematik | Mathematik |
| Name des Lehrplans | „Kerncurriculum für das Gymnasium, Schuljahrgänge 5–10, Mathematik“, Niedersächsisches Kultusministerium | „Kerncurriculum für das Gymnasium – gymnasiale Oberstufe, die Gesamtschule – gymnasiale Oberstufe, das Berufliche Gymnasium, das Abendgymnasium, das Kolleg: Mathematik“, Niedersächsisches Kultusministerium |
| Jahr / Stand | herausgegeben 2015 | herausgegeben 2018 (Dateiname der gelieferten Fassung: `…_2019`) |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `ma_gym_si_kc_druck.pdf` (61 Seiten) | `ma_go_kc_druck_2019.pdf` (75 Seiten) |
| Link laut Dokument | „http://www.cuvo.nibis.de“ (NIBIS) | „http://www.cuvo.nibis.de“; in `sourceUrl` als `https://cuvo.nibis.de/` (der Test verlangt https; aus dem Container nicht erreichbar, also ungeprüft) |
| G8/G9 | G9 (Schuljahrgänge 5–10) | Einführungsphase = Schuljahrgang 11, Qualifikationsphase = 12/13 (siehe Teil E) |
| Niveaus / Wahl | keine | Qualifikationsphase: eigene Lernbereiche für grundlegendes (gA) und erhöhtes Anforderungsniveau (eA) |
| Struktur | Doppelschuljahrgänge 5/6, 7/8, 9/10 → Lernbereiche (Kap. 3.3) → „Kern“ mit Punkten, „fakultative Erweiterungen“ | Einführungsphase: 3 Lernbereiche; Qualifikationsphase: 5 Lernbereiche gA, 5 Lernbereiche eA → „Kern“ |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Unterbereiche mit Simulation | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Doppelschuljahrgang 5/6 | 5, 6 | 7 | 24 | 21 | 23 |
| Doppelschuljahrgang 7/8 | 7, 8 | 8 | 26 | 24 | 23 |
| Doppelschuljahrgang 9/10 | 9, 10 | 7 | 23 | 22 | 24 |
| Einführungsphase | 11 | 3 | 9 | 7 | 11 |
| Qualifikationsphase – Lernbereiche gA und eA | 12, 13 | 10 | 24 | 24 | 22 |

Insgesamt verwendet: **87 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `polstellen-asymptoten`, `monte-carlo-pi`, `signifikanztest`, `newton-verfahren`, `taylor-polynome`, `fourier-reihen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Doppelschuljahrgang 5/6  
*Double grade 5/6*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: KC Mathematik Sek. I (2015), Kap. 3.3.1, S. 37–43)

> Doppelschuljahrgang 5/6: Das Kerncurriculum beschreibt Lernbereiche für die Schuljahrgänge 5 und 6 gemeinsam; sie stehen deshalb bei beiden Jahrgängen gleich. Reihenfolge und Zuschnitt legt die Schule fest. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Unterbereiche sind die Punkte des „Kerns“ (und gegebenenfalls die fakultativen Erweiterungen); die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.

### 1 Umgang mit natürlichen Zahlen
*EN: Working with natural numbers*

- Kurz (DE): Sicher mündlich und schriftlich rechnen, Rechenregeln nutzen, Zahlen an Zahlengerade und Stellenwerttafel darstellen, Teiler, Vielfache und Primzahlen, runden und schätzen.
- Kurz (EN): Calculating confidently mentally and in writing, using rules of arithmetic, representing numbers on the number line and in the place-value chart, divisors, multiples and primes, rounding and estimating.
- Simulationen: `termbaum`, `stellenwerte`, `zehnerpotenzen`, `primfaktoren`
- Unterbereiche:
  - 1.1 Mit natürlichen Zahlen rechnen · *Calculating with natural numbers* – Kurz: Grundrechenarten und ihre Umkehrungen, Rechenregeln zum vorteilhaften Rechnen. · *EN: The four operations and their inverses, rules of arithmetic for clever calculation.* – Simulationen: `termbaum`
  - 1.2 Natürliche Zahlen darstellen und ordnen · *Representing and ordering natural numbers* – Kurz: Zahlengerade, Stellenwertsystem und Bilder; Vielfache, Teiler und Primzahlen. · *EN: Number line, place-value system and pictures; multiples, divisors and primes.* – Simulationen: `stellenwerte` (5), `zehnerpotenzen`, `primfaktoren`
  - 1.3 Runden und schätzen · *Rounding and estimating* – Kurz: Runden, Überschlag und Plausibilität. · *EN: Rounding, estimation and plausibility checks.* – Simulationen: `stellenwerte` (5)

### 2 Körper und Figuren
*EN: Solids and figures*

- Kurz (DE): Körper und Figuren beschreiben und herstellen, parallele und senkrechte Geraden, Schrägbilder und Netze, Längen, Flächen- und Rauminhalte sowie Winkel und Winkelsummen.
- Kurz (EN): Describing and making solids and figures, parallel and perpendicular lines, oblique drawings and nets, lengths, areas and volumes, and angles and angle sums.
- Simulationen: `vierecke`, `koerpernetze`, `koordinaten-lage`, `umfang-flaeche`, `winkel-messen`, `quader-volumen`, `winkel-geradenkreuzung`, `winkelsumme`
- Unterbereiche:
  - 2.1 Formen in Raum und Ebene erkunden · *Exploring shapes in space and the plane* – Kurz: Grundformen von Körpern und Figuren beschreiben und in der Umwelt finden. · *EN: Describing basic solids and figures and finding them in the environment.* – Simulationen: `vierecke`, `koerpernetze`
  - 2.2 Parallele und senkrechte Geraden · *Parallel and perpendicular lines* – Kurz: Zueinander parallele und senkrechte Geraden erkennen und zeichnen. · *EN: Recognising and drawing parallel and perpendicular lines.* – Simulationen: `koordinaten-lage` (5)
  - 2.3 Räumliche Objekte darstellen · *Representing solids* – Kurz: Schrägbilder und Modelle von Würfel und Quader, Netze. · *EN: Oblique drawings and models of cubes and cuboids, nets.* – Simulationen: `koerpernetze`
  - 2.4 Längen, Flächen- und Rauminhalte ermitteln · *Finding lengths, areas and volumes* – Kurz: Vergleichen, schätzen und berechnen, Formeln entwickeln. · *EN: Comparing, estimating and calculating, developing formulas.* – Simulationen: `umfang-flaeche` (5), `quader-volumen` (6)
  - 2.5 Winkel erkunden · *Exploring angles* – Kurz: Winkel schätzen, messen und zeichnen; Neben-, Scheitel- und Stufenwinkel. · *EN: Estimating, measuring and drawing angles; adjacent, vertical and corresponding angles.* – Simulationen: `winkel-messen` (5), `winkel-geradenkreuzung` (6)
  - 2.6 Winkelsummensatz · *Angle sum theorem* – Kurz: Innenwinkelsumme in Dreieck und Viereck begründen und anwenden. · *EN: Justifying and using the interior angle sum in triangles and quadrilaterals.* – Simulationen: `winkelsumme` (6)

### 3 Umgang mit Brüchen
*EN: Working with fractions*

- Kurz (DE): Brüche im Alltag als Anteile, Maßstäbe, Prozente und Verhältnisse, Brüche darstellen, vergleichen, kürzen und erweitern und mit einfachen Brüchen rechnen.
- Kurz (EN): Fractions in everyday life as parts, scales, percentages and ratios, representing, comparing, simplifying and expanding fractions and calculating with simple fractions.
- Simulationen: `massstab`, `bruchteile`, `prozentstreifen`, `brueche-vergleichen`, `brueche-rechnen`
- Unterbereiche:
  - 3.1 Brüche im Alltag erkunden · *Exploring fractions in everyday life* – Kurz: Anteile, Maßstäbe, Prozente und Verhältnisse. · *EN: Parts of a whole, scales, percentages and ratios.* – Simulationen: `massstab` (5), `bruchteile` (6), `prozentstreifen` (6)
  - 3.2 Bruchdarstellungen verwenden · *Using representations of fractions* – Kurz: Bildlich, sprachlich, geometrisch und algebraisch; vergleichen, kürzen und erweitern. · *EN: Pictorial, verbal, geometric and algebraic; comparing, simplifying and expanding.* – Simulationen: `bruchteile` (6), `brueche-vergleichen` (6)
  - 3.3 Mit Brüchen rechnen · *Calculating with fractions* – Kurz: Grundrechenarten mit einfachen Brüchen und einfache Gleichungen durch Umkehren. · *EN: The four operations with simple fractions and simple equations by working backwards.* – Simulationen: `brueche-rechnen` (6)

### 4 Planung und Durchführung statistischer Erhebungen
*EN: Planning and carrying out statistical surveys*

- Kurz (DE): Eine Befragung, Beobachtung oder ein Experiment planen, Hypothesen aufstellen, Daten in Strichlisten und Tabellen festhalten und die Hypothesen prüfen.
- Kurz (EN): Planning a survey, observation or experiment, stating hypotheses, recording data in tally charts and tables and checking the hypotheses.
- Simulationen: –
- Unterbereiche:
  - 4.1 Befragung oder Beobachtung · *Survey or observation* – Kurz: Merkmal und Stichprobe festlegen, Strichlisten anlegen, Hypothesen prüfen. · *EN: Defining the characteristic and sample, keeping tally charts, checking hypotheses.* – Simulationen: –
  - 4.2 Experiment · *Experiment* – Kurz: Durchführung planen, Daten in Tabellen festhalten, Hypothesen prüfen. · *EN: Planning the procedure, recording data in tables, checking hypotheses.* – Simulationen: –

### 5 Umgang mit Dezimalzahlen
*EN: Working with decimals*

- Kurz (DE): Dezimalzahlen an Zahlengerade, Stellenwerttafel und als Bruch darstellen, mit ihnen rechnen, runden und Größen umrechnen.
- Kurz (EN): Representing decimals on the number line, in the place-value chart and as fractions, calculating with them, rounding and converting quantities.
- Simulationen: `stellenwerte`, `einheiten`, `dezimalbrueche`
- Unterbereiche:
  - 5.1 Dezimalzahlen darstellen · *Representing decimals* – Kurz: Zahlengerade, Stellenwertsystem und Bruchdarstellung. · *EN: Number line, place-value system and fraction form.* – Simulationen: `stellenwerte` (5), `dezimalbrueche` (6)
  - 5.2 Mit Dezimalzahlen rechnen · *Calculating with decimals* – Kurz: Grundrechenarten, auch verknüpft mit dem Bruchrechnen. · *EN: The four operations, also linked to calculating with fractions.* – Simulationen: `dezimalbrueche` (6)
  - 5.3 Runden und schätzen · *Rounding and estimating* – Kurz: Näherungswerte und Überschlag. · *EN: Approximations and estimates.* – Simulationen: –
  - 5.4 Größen umrechnen · *Converting quantities* – Kurz: Zeit, Masse, Geld, Längen, Flächen- und Rauminhalte. · *EN: Time, mass, money, length, area and volume.* – Simulationen: `einheiten` (5)

### 6 Symmetrien
*EN: Symmetry*

- Kurz (DE): Achsen-, Punkt-, Dreh- und Ebenensymmetrie, Verschieben, Spiegeln und Drehen, Dreiecke und Vierecke nach Symmetrie ordnen sowie Kreis, Mittelsenkrechte und Winkelhalbierende als Ortslinien.
- Kurz (EN): Line, point, rotational and plane symmetry, translating, reflecting and rotating, classifying triangles and quadrilaterals by symmetry, and the circle, perpendicular bisector and angle bisector as loci.
- Simulationen: `vierecke`, `spiegelung`, `mittelsenkrechte`
- Unterbereiche:
  - 6.1 Symmetrien beschreiben · *Describing symmetry* – Kurz: Ebenen-, Achsen-, Punkt- und Drehsymmetrie, auch im Raum. · *EN: Plane, line, point and rotational symmetry, also in space.* – Simulationen: `spiegelung` (6)
  - 6.2 Verschiebungen, Spiegelungen und Drehungen · *Translations, reflections and rotations* – Kurz: Abbildungen in der Ebene durchführen und Muster erzeugen. · *EN: Carrying out transformations in the plane and creating patterns.* – Simulationen: `spiegelung` (6)
  - 6.3 Dreiecke und Vierecke nach Symmetrien ordnen · *Classifying triangles and quadrilaterals by symmetry* – Kurz: Gleichschenklige und gleichseitige Dreiecke, Haus der Vierecke. · *EN: Isosceles and equilateral triangles, the hierarchy of quadrilaterals.* – Simulationen: `vierecke`
  - 6.4 Kreise beschreiben und nutzen · *Describing and using circles* – Kurz: Kreis als Ortslinie, Mittelsenkrechte und Winkelhalbierende als Symmetrieachsen. · *EN: The circle as a locus, perpendicular bisectors and angle bisectors as axes of symmetry.* – Simulationen: `mittelsenkrechte` (6)

### 7 Maßzahlen statistischer Erhebungen
*EN: Measures of statistical surveys*

- Kurz (DE): Häufigkeiten in Säulen- und Kreisdiagrammen darstellen und kritisch lesen, relative Häufigkeit, arithmetisches Mittel, Modalwert und Spannweite.
- Kurz (EN): Showing frequencies in bar and pie charts and reading them critically, relative frequency, mean, mode and range.
- Simulationen: `diagramme`, `boxplot`
- Unterbereiche:
  - 7.1 Häufigkeitsverteilungen grafisch darstellen · *Graphing frequency distributions* – Kurz: Säulendiagramme erstellen und bewerten, Kreisdiagramme lesen. · *EN: Making and judging bar charts, reading pie charts.* – Simulationen: `diagramme` (6)
  - 7.2 Zwei Häufigkeitsverteilungen vergleichen · *Comparing two frequency distributions* – Kurz: Relative Häufigkeit, arithmetisches Mittel, Modalwert und Spannweite. · *EN: Relative frequency, mean, mode and range.* – Simulationen: `boxplot` (6)

## Doppelschuljahrgang 7/8  
*Double grade 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: KC Mathematik Sek. I (2015), Kap. 3.3.2, S. 44–51)

> Doppelschuljahrgang 7/8: Das Kerncurriculum beschreibt Lernbereiche für die Schuljahrgänge 7 und 8 gemeinsam; sie stehen deshalb bei beiden Jahrgängen gleich. Reihenfolge und Zuschnitt legt die Schule fest. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Unterbereiche sind die Punkte des „Kerns“ (und gegebenenfalls die fakultativen Erweiterungen); die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.

### 8 Umgang mit negativen Zahlen
*EN: Working with negative numbers*

- Kurz (DE): Negative Zahlen an der Zahlengeraden, Addieren und Subtrahieren am Temperaturmodell, Multiplizieren und Dividieren mit Vorzeichenregeln.
- Kurz (EN): Negative numbers on the number line, adding and subtracting with the temperature model, multiplying and dividing with sign rules.
- Simulationen: `zahlengerade`, `termbaum`
- Unterbereiche:
  - 8.1 Positive und negative Zahlen an der Zahlengeraden · *Positive and negative numbers on the number line* – Kurz: Zahlen darstellen und ordnen. · *EN: Representing and ordering numbers.* – Simulationen: `zahlengerade` (7)
  - 8.2 Addieren und subtrahieren · *Adding and subtracting* – Kurz: Realitätsnah, etwa am Temperaturmodell, und mit Mustern in Rechenreihen. · *EN: In real contexts such as temperatures, and with patterns in sequences of calculations.* – Simulationen: `zahlengerade` (7)
  - 8.3 Multiplizieren und dividieren · *Multiplying and dividing* – Kurz: Schuldenmodell, Permanenzprinzip und Vorzeichenregeln. · *EN: Debt model, permanence principle and sign rules.* – Simulationen: –
  - 8.4 Klammern und Rechenregeln · *Brackets and rules of arithmetic* – Kurz: Vor- und Rechenzeichen, vorteilhaft rechnen. · *EN: Signs and operation symbols, calculating cleverly.* – Simulationen: `termbaum` (7)

### 9 Wahrscheinlichkeit
*EN: Probability*

- Kurz (DE): Versuchsreihen mit teil-, un- und vollsymmetrischen Objekten, Wahrscheinlichkeit als Prognose relativer Häufigkeiten, Laplace-Wahrscheinlichkeit, Gesetz der großen Zahlen, Additions- und Komplementärregel.
- Kurz (EN): Series of trials with partly symmetric, asymmetric and fully symmetric objects, probability as a prediction of relative frequency, Laplace probability, the law of large numbers, the addition and complement rules.
- Simulationen: `gesetz-grosse-zahlen`
- Unterbereiche:
  - 9.1 Versuchsreihen mit teil- und unsymmetrischen Objekten · *Trials with partly symmetric and asymmetric objects* – Kurz: Quader oder Reißzwecke: Wahrscheinlichkeit als Prognose, Gesetz der großen Zahlen qualitativ. · *EN: Cuboids or drawing pins: probability as a prediction, the law of large numbers qualitatively.* – Simulationen: `gesetz-grosse-zahlen`
  - 9.2 Versuchsreihen mit vollsymmetrischen Objekten · *Trials with fully symmetric objects* – Kurz: Laplace-Wahrscheinlichkeit gegen relative Häufigkeit abgrenzen. · *EN: Distinguishing Laplace probability from relative frequency.* – Simulationen: `gesetz-grosse-zahlen`
  - 9.3 Additions- und Komplementärregel · *Addition and complement rules* – Kurz: Regeln begründen und anwenden. · *EN: Justifying and applying the rules.* – Simulationen: –

### 10 Proportionale und antiproportionale Zusammenhänge
*EN: Proportional and inversely proportional relationships*

- Kurz (DE): Zuordnungen in Worten, Tabellen und Graphen, proportionale und antiproportionale Zusammenhänge mit Dreisatz sowie Prozent- und Zinsrechnung.
- Kurz (EN): Relationships in words, tables and graphs, proportional and inversely proportional relationships with the rule of three, and percentages and interest.
- Simulationen: `proportional`, `prozentstreifen`, `funktion-zuordnung`, `hyperbel`
- Unterbereiche:
  - 10.1 Zuordnungen erfassen · *Understanding relationships* – Kurz: Worte, Tabellen und Graphen und der Wechsel zwischen ihnen. · *EN: Words, tables and graphs and switching between them.* – Simulationen: `proportional`, `funktion-zuordnung` (8)
  - 10.2 Proportionale Zusammenhänge erfassen · *Proportional relationships* – Kurz: Erkennen, Dreisatz, Quotient als „Betrag pro Einheit“. · *EN: Recognising them, the rule of three, the quotient as an amount per unit.* – Simulationen: `proportional`
  - 10.3 Antiproportionale Zusammenhänge erfassen · *Inversely proportional relationships* – Kurz: Erkennen, Dreisatz, Produkt als „Gesamtgröße“. · *EN: Recognising them, the rule of three, the product as a total.* – Simulationen: `hyperbel` (8)
  - 10.4 Prozent- und Zinsrechnung · *Percentages and interest* – Kurz: Mithilfe des Dreisatzes. · *EN: Using the rule of three.* – Simulationen: `prozentstreifen` (7)

### 11 Längen, Flächen- und Rauminhalte und deren Terme
*EN: Lengths, areas and volumes and their terms*

- Kurz (DE): Umfang und Flächeninhalt von Dreieck, Parallelogramm und Trapez, Oberfläche und Volumen des Prismas, Schrägbilder und Netze.
- Kurz (EN): Perimeter and area of triangles, parallelograms and trapezia, surface area and volume of prisms, oblique drawings and nets.
- Simulationen: `flaechen-zerlegen`, `koerpernetze`, `prisma-zylinder`
- Unterbereiche:
  - 11.1 Dreieck, Parallelogramm und Trapez · *Triangle, parallelogram and trapezium* – Kurz: Formeln für Umfang und Flächeninhalt begründen und anwenden. · *EN: Justifying and using formulas for perimeter and area.* – Simulationen: `flaechen-zerlegen`
  - 11.2 Oberflächen- und Rauminhalt des Prismas · *Surface area and volume of prisms* – Kurz: Vergleichen, schätzen, berechnen und Formeln begründen. · *EN: Comparing, estimating, calculating and justifying formulas.* – Simulationen: `koerpernetze`, `prisma-zylinder` (8)
  - 11.3 Mit Schrägbildern und Netzen umgehen · *Working with oblique drawings and nets* – Kurz: Vergleichen und zwischen Darstellungen wechseln. · *EN: Comparing and switching between representations.* – Simulationen: `koerpernetze`

### 12 Elementare Termumformungen
*EN: Elementary transformations of terms*

- Kurz (DE): Zusammenfassen, Ausmultiplizieren und Ausklammern, binomische Formeln sowie einfache lineare und Verhältnisgleichungen lösen.
- Kurz (EN): Collecting like terms, expanding and factorising, binomial formulas, and solving simple linear and proportion equations.
- Simulationen: `termbaum`, `binomische-formeln`, `waagemodell`
- Unterbereiche:
  - 12.1 Einfache Termumformungen · *Simple transformations of terms* – Kurz: Zusammenfassen, Ausmultiplizieren und Ausklammern. · *EN: Collecting like terms, expanding and factorising.* – Simulationen: `termbaum` (7)
  - 12.2 Summen multiplizieren · *Multiplying sums* – Kurz: Ausmultiplizieren, binomische Formeln als Spezialfall. · *EN: Expanding brackets, binomial formulas as a special case.* – Simulationen: `binomische-formeln` (7)
  - 12.3 Einfache lineare Gleichungen und Verhältnisgleichungen lösen · *Solving simple linear and proportion equations* – Kurz: Ohne Rechner umformen. · *EN: Transforming by hand.* – Simulationen: `waagemodell` (7)

### 13 Entdeckungen an Dreiecken – Konstruktionen und besondere Linien
*EN: Discoveries in triangles – constructions and special lines*

- Kurz (DE): Dreiecke mit den vier Grundkonstruktionen konstruieren, Kongruenz, Satz des Thales sowie Mittelsenkrechten, Winkelhalbierende, Seitenhalbierende und Höhen als Ortslinien.
- Kurz (EN): Constructing triangles with the four basic constructions, congruence, Thales’ theorem, and perpendicular bisectors, angle bisectors, medians and altitudes as loci.
- Simulationen: `dreieckskonstruktion`, `thales`, `besondere-linien`, `mittelsenkrechte`
- Unterbereiche:
  - 13.1 Dreiecke konstruieren · *Constructing triangles* – Kurz: Vier Grundkonstruktionen und Kongruenz. · *EN: Four basic constructions and congruence.* – Simulationen: `dreieckskonstruktion` (7)
  - 13.2 Satz des Thales · *Thales’ theorem* – Kurz: Begründen und anwenden. · *EN: Justifying and applying it.* – Simulationen: `thales` (7)
  - 13.3 Transversalen erkunden · *Exploring special lines* – Kurz: Mittelsenkrechte, Winkelhalbierende, Seitenhalbierende und Höhen konstruieren, Schnittpunkte begründen; fakultativ Umkreis und Inkreis. · *EN: Constructing perpendicular bisectors, angle bisectors, medians and altitudes and justifying their intersections; optionally circumcircle and incircle.* – Simulationen: `besondere-linien`, `mittelsenkrechte` (7)

### 14 Ein- und mehrstufige Zufallsversuche
*EN: Single- and multi-stage random experiments*

- Kurz (DE): Häufigkeiten prognostizieren, durchführen und simulieren, Variabilität erleben, Baumdiagramme und Pfadregeln mit absoluten Häufigkeiten begründen und anwenden.
- Kurz (EN): Predicting, carrying out and simulating frequencies, experiencing variability, justifying and using tree diagrams and path rules with absolute frequencies.
- Simulationen: `gesetz-grosse-zahlen`, `zaehlprinzip`, `baumdiagramm`, `geburtstagsproblem`
- Unterbereiche:
  - 14.1 Einstufige Zufallsexperimente · *Single-stage random experiments* – Kurz: Absolute Häufigkeiten prognostizieren und mit Versuchsreihen vergleichen; Gesetz der großen Zahlen. · *EN: Predicting absolute frequencies and comparing them with series of trials; the law of large numbers.* – Simulationen: `gesetz-grosse-zahlen`
  - 14.2 Zwei- und mehrstufige Zufallsexperimente · *Two- and multi-stage random experiments* – Kurz: Baumdiagramm, Ziehen mit und ohne Zurücklegen, Pfadregeln begründen und anwenden. · *EN: Tree diagrams, drawing with and without replacement, justifying and using path rules.* – Simulationen: `zaehlprinzip`, `baumdiagramm` (8), `geburtstagsproblem` (8)

### 15 Lineare Zusammenhänge
*EN: Linear relationships*

- Kurz (DE): Lineare Funktionen in allen Darstellungen, Steigung als konstante Änderungsrate, Ausgleichsgeraden sowie lineare Gleichungen und Gleichungssysteme mit zwei Variablen lösen.
- Kurz (EN): Linear functions in all representations, slope as a constant rate of change, lines of best fit, and solving linear equations and systems with two variables.
- Simulationen: `lineare-funktion`, `waagemodell`, `funktionsplotter`, `gleichungen-grafisch`, `lgs-grafisch`
- Unterbereiche:
  - 15.1 Lineare Zusammenhänge identifizieren und darstellen · *Identifying and representing linear relationships* – Kurz: Text, Diagramm, Tabelle, Koordinatensystem und Gleichung. · *EN: Text, diagram, table, coordinate system and equation.* – Simulationen: `lineare-funktion`, `funktionsplotter` (8)
  - 15.2 Lineare Funktionen analysieren · *Analysing linear functions* – Kurz: Steigungsdreieck, y-Achsenabschnitt, Nullstelle, Parametervariation und Geraden durch zwei Punkte. · *EN: Slope triangle, y-intercept, zero, varying parameters and lines through two points.* – Simulationen: `lineare-funktion`
  - 15.3 Lineare Gleichungen lösen · *Solving linear equations* – Kurz: Probieren, Rückwärtsarbeiten, von Hand und mit digitalen Werkzeugen. · *EN: Trial, working backwards, by hand and with digital tools.* – Simulationen: `waagemodell` (7), `gleichungen-grafisch` (8)
  - 15.4 Lineare Gleichungssysteme mit zwei Variablen · *Linear systems with two variables* – Kurz: Grafisch, durch Einsetzen und Gleichsetzen; Lösbarkeit am Graphen. · *EN: Graphically, by substitution and equating; solvability from the graph.* – Simulationen: `lgs-grafisch` (8)

## Doppelschuljahrgang 9/10  
*Double grade 9/10*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: KC Mathematik Sek. I (2015), Kap. 3.3.3, S. 52–58)

> Doppelschuljahrgang 9/10: Das Kerncurriculum beschreibt Lernbereiche für die Schuljahrgänge 9 und 10 gemeinsam; sie stehen deshalb bei beiden Jahrgängen gleich. Reihenfolge und Zuschnitt legt die Schule fest. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Unterbereiche sind die Punkte des „Kerns“ (und gegebenenfalls die fakultativen Erweiterungen); die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.

### 16 Baumdiagramme und Vierfeldertafeln
*EN: Tree diagrams and two-way tables*

- Kurz (DE): Daten mit zwei Merkmalen und zweistufige Zufallsexperimente in Baumdiagramm und Vierfeldertafel darstellen und unbekannte Wahrscheinlichkeiten ermitteln, als Vorbereitung der bedingten Wahrscheinlichkeit.
- Kurz (EN): Representing data with two characteristics and two-stage random experiments in tree diagrams and two-way tables and finding unknown probabilities, preparing conditional probability.
- Simulationen: `vierfeldertafel`, `baumdiagramm`, `bedingte-wahrscheinlichkeit`
- Unterbereiche:
  - 16.1 Daten mit zwei Merkmalen · *Data with two characteristics* – Kurz: Einträge vervollständigen und zwischen den Darstellungen wechseln. · *EN: Completing entries and switching between representations.* – Simulationen: `vierfeldertafel`
  - 16.2 Zweistufige Zufallsexperimente · *Two-stage random experiments* – Kurz: Darstellen und analysieren in Baumdiagramm und Vierfeldertafel. · *EN: Representing and analysing them in tree diagrams and two-way tables.* – Simulationen: `baumdiagramm`, `vierfeldertafel`
  - 16.3 Unbekannte Wahrscheinlichkeiten ermitteln · *Finding unknown probabilities* – Kurz: Mit absoluten Häufigkeiten ermitteln und deuten. · *EN: Finding and interpreting them using absolute frequencies.* – Simulationen: `bedingte-wahrscheinlichkeit` (10)

### 17 Entdeckungen an rechtwinkligen Dreiecken und Ähnlichkeit
*EN: Discoveries in right triangles and similarity*

- Kurz (DE): Ähnliche Dreiecke, Satzgruppe des Pythagoras, Wurzeln als Umkehrung des Quadrierens, Sinus, Kosinus und Tangens sowie Sinus- und Kosinussatz.
- Kurz (EN): Similar triangles, Pythagoras’ theorem and related theorems, roots as the inverse of squaring, sine, cosine and tangent, and the laws of sines and cosines.
- Simulationen: `strahlensaetze`, `vergroessern`, `pythagoras`, `quadratwurzel`, `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`
- Unterbereiche:
  - 17.1 Ähnlichkeit · *Similarity* – Kurz: Ähnliche Dreiecke erkennen, Ähnlichkeitssätze, Längen berechnen. · *EN: Recognising similar triangles, similarity theorems, calculating lengths.* – Simulationen: `strahlensaetze` (9), `vergroessern` (9)
  - 17.2 Satzgruppe des Pythagoras · *Pythagoras’ theorem and related theorems* – Kurz: Begründen und anwenden. · *EN: Justifying and applying them.* – Simulationen: `pythagoras` (9)
  - 17.3 Mit Wurzeln umgehen · *Working with roots* – Kurz: Wurzelziehen als Umkehroperation, Rechengesetze, Streckenberechnung. · *EN: Taking roots as an inverse operation, laws, calculating lengths.* – Simulationen: `quadratwurzel` (9)
  - 17.4 Trigonometrische Beziehungen · *Trigonometric relationships* – Kurz: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Tangens als Steigungsmaß. · *EN: Sine, cosine and tangent in right triangles, tangent as a measure of slope.* – Simulationen: `sin-cos-tan-dreieck`
  - 17.5 Berechnungen an allgemeinen Dreiecken · *Calculations in general triangles* – Kurz: Sinussatz und Kosinussatz. · *EN: Law of sines and law of cosines.* – Simulationen: `sinussatz-kosinussatz`

### 18 Quadratische Zusammenhänge
*EN: Quadratic relationships*

- Kurz (DE): Quadratische Funktionen in allgemeiner, faktorisierter und Scheitelpunktform, quadratische Gleichungen lösen, Optimierung und Ausgleichsparabeln sowie die Parabel als Ortslinie.
- Kurz (EN): Quadratic functions in general, factorised and vertex form, solving quadratic equations, optimisation and parabolas of best fit, and the parabola as a locus.
- Simulationen: `quadratische-funktion`, `funktionsplotter`, `gleichungen-grafisch`, `extremwert-parabel`, `parabel-drei-punkte`
- Unterbereiche:
  - 18.1 Quadratische Funktionen untersuchen · *Investigating quadratic functions* – Kurz: Parametervariation und Wechsel zwischen den drei Termformen. · *EN: Varying parameters and switching between the three forms.* – Simulationen: `quadratische-funktion`, `funktionsplotter`
  - 18.2 Quadratische Gleichungen · *Quadratic equations* – Kurz: Lösungen mit Graph und Termstruktur verknüpfen, p-q-Formel. · *EN: Linking solutions to the graph and the structure of the term, the quadratic formula.* – Simulationen: `gleichungen-grafisch` (9)
  - 18.3 Quadratische Zusammenhänge modellieren · *Modelling quadratic relationships* – Kurz: Optimierungsprobleme, Nullstellensuche und Ausgleichsparabeln. · *EN: Optimisation problems, finding zeros and parabolas of best fit.* – Simulationen: `extremwert-parabel` (9), `parabel-drei-punkte` (9)
  - 18.4 Parabel als Ortslinie · *The parabola as a locus* – Kurz: Gleicher Abstand zu einem Punkt und einer Geraden. · *EN: Equal distance from a point and a line.* – Simulationen: –

### 19 Kreis- und Körperberechnungen
*EN: Calculations with circles and solids*

- Kurz (DE): Kreiszahl π durch Näherung, Umfang, Fläche, Bogen und Kreisausschnitt sowie Oberfläche und Volumen von Zylinder, Pyramide, Kegel und Kugel.
- Kurz (EN): The number π by approximation, circumference, area, arcs and sectors, and surface area and volume of cylinders, pyramids, cones and spheres.
- Simulationen: `kreiszahl-pi`, `prisma-zylinder`, `pyramide-kegel-kugel`, `cavalieri`
- Unterbereiche:
  - 19.1 Flächeninhalt und Umfang des Kreises · *Area and circumference of the circle* – Kurz: Weg zur Kreiszahl π, Bogenlänge, Kreisausschnitt und Bogenmaß. · *EN: The path to π, arc length, sectors and radians.* – Simulationen: `kreiszahl-pi` (9)
  - 19.2 Maßzahlen ausgewählter Körper · *Measures of selected solids* – Kurz: Oberfläche und Volumen von Zylinder, Pyramide, Kegel und Kugel. · *EN: Surface area and volume of cylinders, pyramids, cones and spheres.* – Simulationen: `prisma-zylinder` (9), `pyramide-kegel-kugel` (10)
  - 19.3 Fakultative Erweiterungen · *Optional extensions* – Kurz: Weg zum Volumen von Pyramide, Kegel und Kugel und zur Oberfläche von Kegel und Kugel. · *EN: Deriving the volume of pyramids, cones and spheres and the surface area of cones and spheres.* – Simulationen: `cavalieri` (10)

### 20 Exponentielle Zusammenhänge
*EN: Exponential relationships*

- Kurz (DE): Exponentielles Wachstum und Abnahme iterativ und explizit, begrenztes Wachstum, Exponentialfunktionen mit Parametern sowie Potenzgesetze, Wurzelziehen und Logarithmieren.
- Kurz (EN): Exponential growth and decay iteratively and explicitly, limited growth, exponential functions with parameters, laws of exponents, taking roots and logarithms.
- Simulationen: `exponentielles-wachstum`, `logarithmus`
- Unterbereiche:
  - 20.1 Wachstums- und Abnahmeprozesse modellieren · *Modelling growth and decay* – Kurz: Linear und exponentiell abgrenzen, Überlagerung und Grenze beim begrenzten Wachstum. · *EN: Distinguishing linear and exponential, combinations and the limit of limited growth.* – Simulationen: `exponentielles-wachstum` (10)
  - 20.2 Exponentialfunktionen untersuchen · *Investigating exponential functions* – Kurz: Parametervariation, Graphen skizzieren, Gleichung aus zwei Punkten. · *EN: Varying parameters, sketching graphs, the equation from two points.* – Simulationen: `exponentielles-wachstum` (10)
  - 20.3 Mit Potenzen rechnen · *Calculating with powers* – Kurz: Potenzgesetze begründen, Gleichungen auch durch Logarithmieren lösen. · *EN: Justifying laws of exponents, solving equations also by taking logarithms.* – Simulationen: `logarithmus` (10)

### 21 Periodische Zusammenhänge
*EN: Periodic relationships*

- Kurz (DE): Sinus und Kosinus am Einheitskreis, Grad- und Bogenmaß, Parameter der allgemeinen Sinusfunktion und periodische Vorgänge modellieren.
- Kurz (EN): Sine and cosine on the unit circle, degrees and radians, parameters of the general sine function and modelling periodic processes.
- Simulationen: `einheitskreis`, `sinusfunktion`, `transformationen`
- Unterbereiche:
  - 21.1 Sinus- und Kosinusfunktion als periodische Funktion · *Sine and cosine as periodic functions* – Kurz: Definition am Einheitskreis, Grad- und Bogenmaß. · *EN: Definition on the unit circle, degrees and radians.* – Simulationen: `einheitskreis`
  - 21.2 Sinusfunktion untersuchen · *Investigating the sine function* – Kurz: Parameter von f(x) = a · sin(b · (x − c)) + d. · *EN: Parameters of f(x) = a · sin(b · (x − c)) + d.* – Simulationen: `sinusfunktion` (10), `transformationen` (10)
  - 21.3 Periodische Zusammenhänge modellieren · *Modelling periodic relationships* – Kurz: Ebbe und Flut, Tageslänge, Temperatur. · *EN: Tides, day length, temperature.* – Simulationen: `sinusfunktion` (10)

### 22 Näherungsverfahren als Grenzprozesse – Zahlbereichserweiterungen
*EN: Approximation as limiting processes – extending the number system*

- Kurz (DE): Grenzprozesse vergleichen: Annäherung an Quadratwurzeln und π, 0,9 periodisch gleich 1, Zerfall und begrenztes Wachstum, Graph von 1/x; Irrationalität und reelle Zahlen.
- Kurz (EN): Comparing limiting processes: approximating square roots and π, 0.9 recurring equals 1, decay and limited growth, the graph of 1/x; irrationality and the real numbers.
- Simulationen: `quadratwurzel`, `kreiszahl-pi`, `grenzverhalten`
- Unterbereiche:
  - 22.1 Grenzprozesse beschreiben · *Describing limiting processes* – Kurz: Näherung irrationaler Quadratwurzeln, Kreiszahl π, exponentieller Zerfall und Grenzverhalten von 1/x. · *EN: Approximating irrational square roots, the number π, exponential decay and the limiting behaviour of 1/x.* – Simulationen: `quadratwurzel` (9), `kreiszahl-pi` (9), `grenzverhalten` (10)
  - 22.2 Zahlbereichserweiterungen erläutern · *Explaining extensions of the number system* – Kurz: Eine Irrationalitätsbegründung und die reellen Zahlen. · *EN: A proof of irrationality and the real numbers.* – Simulationen: `quadratwurzel` (9)

## Einführungsphase  
*Introductory phase*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: KC Mathematik Sek. II (2018), Kap. 3.2.1 und 3.3.1, S. 21–22 und 38–42)

> Einführungsphase der gymnasialen Oberstufe (G9: Schuljahrgang 11). Reihung und Zuschnitt der drei Lernbereiche sind laut Kerncurriculum ein Vorschlag; Unterbereiche sind die Punkte des „Kerns“. Die Codes sind von uns vergeben.

### EF-1 Beschreibende Statistik
*EN: Descriptive statistics*

- Kurz (DE): Daten erheben und klassieren, Säulendiagramme und Kenngrößen wie Mittelwert, Median, Modalwert, Spannweite, Varianz und Standardabweichung.
- Kurz (EN): Collecting and grouping data, bar charts and measures such as mean, median, mode, range, variance and standard deviation.
- Simulationen: –
- Unterbereiche:
  - EF-1.1 Datenerhebung · *Collecting data* – Kurz: Merkmale, Klassierung, Repräsentativität und Säulendiagramme. · *EN: Characteristics, grouping, representativeness and bar charts.* – Simulationen: –
  - EF-1.2 Kenngrößen · *Measures* – Kurz: Lage- und Streumaße deuten und Datensätze vergleichen; fakultativ Boxplots. · *EN: Interpreting measures of centre and spread and comparing data sets; optionally box plots.* – Simulationen: –

### EF-2 Elementare Funktionenlehre
*EN: Elementary functions*

- Kurz (DE): Potenz- und Wurzelfunktionen, Parametervariation bei Potenz-, Exponential- und Sinusfunktionen im Vergleich und ganzrationale Funktionen mit Nullstellen, Symmetrie und Globalverhalten.
- Kurz (EN): Power and root functions, comparing parameter variation for power, exponential and sine functions, and polynomial functions with zeros, symmetry and end behaviour.
- Simulationen: `potenzfunktionen`, `transformationen`, `sinusfunktion`, `ganzrationale-funktionen`, `grenzverhalten`, `funktionsplotter`, `umkehrfunktion`
- Unterbereiche:
  - EF-2.1 Potenzfunktionen · *Power functions* – Kurz: Graphen skizzieren, Globalverhalten und Symmetrie, Wurzelfunktionen. · *EN: Sketching graphs, end behaviour and symmetry, root functions.* – Simulationen: `potenzfunktionen`
  - EF-2.2 Vergleich von Potenz-, Exponential- und Sinusfunktionen · *Comparing power, exponential and sine functions* – Kurz: Parametervariation a · f(b · (x − c)) + d für verschiedene Funktionsklassen. · *EN: Parameter variation a · f(b · (x − c)) + d for different classes of functions.* – Simulationen: `transformationen`, `sinusfunktion`
  - EF-2.3 Ganzrationale Funktionen · *Polynomial functions* – Kurz: Als Summe von Potenzfunktionen deuten, modellieren, Nullstellen und faktorisierte Form, Globalverhalten und Symmetrie. · *EN: Seen as sums of power functions, modelling, zeros and factorised form, end behaviour and symmetry.* – Simulationen: `ganzrationale-funktionen`, `grenzverhalten`, `funktionsplotter`
  - EF-2.4 Fakultative Erweiterungen · *Optional extensions* – Kurz: Wurzelfunktion und Kehrwertfunktion als Umkehrfunktion. · *EN: The root function and the reciprocal function as inverse functions.* – Simulationen: `umkehrfunktion`

### EF-3 Ableitungen
*EN: Derivatives*

- Kurz (DE): Von der mittleren zur lokalen Änderungsrate, Ableitungsfunktion grafisch und mit Regeln, Tangenten, Monotonie, Extrem- und Wendestellen sowie Optimierungsprobleme.
- Kurz (EN): From average to instantaneous rate of change, the derivative function graphically and with rules, tangents, monotonicity, extrema and points of inflection, and optimisation problems.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `kurvendiskussion`, `extremwertprobleme`
- Unterbereiche:
  - EF-3.1 Ableitung an einer Stelle · *Derivative at a point* – Kurz: Differenzenquotient, Sekanten- und Tangentensteigung, Grenzwertschreibweise. · *EN: Difference quotient, slope of secant and tangent, limit notation.* – Simulationen: `sekante-tangente`
  - EF-3.2 Ableitungsfunktion · *Derivative function* – Kurz: Graph und Ableitungsgraph auseinander entwickeln, Summen- und Faktorregel, Ableitung von Potenz-, Sinus- und Kosinusfunktion. · *EN: Developing graph and derivative graph from each other, sum and constant-multiple rules, derivatives of power, sine and cosine functions.* – Simulationen: `ableitungsfunktion`
  - EF-3.3 Verwendung von Ableitungen · *Using derivatives* – Kurz: Tangenten und Normalen, Monotonie, Extrem- und Wendestellen, Optimierungsprobleme. · *EN: Tangents and normals, monotonicity, extrema and points of inflection, optimisation problems.* – Simulationen: `kurvendiskussion`, `extremwertprobleme`

## Qualifikationsphase – Lernbereiche gA und eA  
*Qualification phase – learning areas at basic and higher level*  
Jahrgangsstufe(n) im JSON: 12, 13  
(Quelle: KC Mathematik Sek. II (2018), Kap. 3.2.2.1 und 3.3.2.1, S. 23–28 und 43–54)

> Qualifikationsphase (G9: Schuljahrgänge 12 und 13). Das Kerncurriculum hat eigene Lernbereiche für das grundlegende (gA) und das erhöhte Anforderungsniveau (eA) und verteilt sie nicht auf die Jahre; sie stehen deshalb als Doppeljahrgang bei 12 und 13 gleich. Die Codes sind von uns vergeben.

### gA-1 Kurvenanpassung mit ganzrationalen Funktionen (gA)
*EN: Curve fitting with polynomial functions (basic level)*

- Kurz (DE): Aus Eigenschaften Bedingungen für den Funktionsterm aufstellen, lineare Gleichungssysteme algorithmisch lösen und einen Parameter an eine Eigenschaft anpassen.
- Kurz (EN): Turning properties into conditions on the function term, solving linear systems algorithmically and adjusting a parameter to a given property.
- Simulationen: `funktionenscharen`

### gA-2 Von der Änderung zum Bestand – Integralrechnung (gA)
*EN: From change to total – integral calculus (basic level)*

- Kurz (DE): Bestände aus Änderungsraten rekonstruieren, Integral als Grenzwert von Produktsummen, Hauptsatz, Flächen zwischen Graphen und Stammfunktionen.
- Kurz (EN): Reconstructing totals from rates of change, the integral as a limit of Riemann sums, the fundamental theorem, areas bounded by graphs and antiderivatives.
- Simulationen: `ober-untersummen`, `aenderungsrate`, `hauptsatz`, `stammfunktion-grafisch`
- Unterbereiche:
  - gA-2.1 Bestimmtes Integral · *Definite integral* – Kurz: Rekonstruierter Bestand, Produktsummen, Hauptsatz und Flächeninhalte. · *EN: Reconstructed totals, Riemann sums, the fundamental theorem and areas.* – Simulationen: `ober-untersummen`, `aenderungsrate`, `hauptsatz`
  - gA-2.2 Stammfunktion · *Antiderivative* – Kurz: Stammfunktionen angeben, entwickeln und mit den Ableitungsregeln prüfen. · *EN: Stating, developing and checking antiderivatives with the rules of differentiation.* – Simulationen: `stammfunktion-grafisch`

### gA-3 Die e-Funktion (gA)
*EN: The exponential function e^x (basic level)*

- Kurz (DE): Die Basis e über (eˣ)′ = eˣ, Verknüpfung und Verkettung mit anderen Funktionen, Produkt- und Kettenregel, Exponentialgleichungen und begrenztes Wachstum.
- Kurz (EN): The base e via (eˣ)′ = eˣ, combining and composing with other functions, product and chain rules, exponential equations and limited growth.
- Simulationen: `e-funktion`, `logarithmus`

### gA-4 Raumanschauung und Koordinatisierung (gA)
*EN: Spatial visualisation and coordinates (basic level)*

- Kurz (DE): Punkte und Vektoren im Raum, Vektoroperationen, Geraden und Ebenen in Parameterform, Abstände zwischen Punkten, Skalarprodukt, Winkel und Lage von Geraden.
- Kurz (EN): Points and vectors in space, vector operations, lines and planes in parametric form, distances between points, the dot product, angles and relative positions of lines.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `geraden-ebenen`, `lage-abstaende`, `skalar-vektorprodukt`, `kugeln`
- Unterbereiche:
  - gA-4.1 Raumanschauung und Koordinatisierung · *Spatial visualisation and coordinates* – Kurz: Punkte und Vektoren als Tupel, Addition und Vervielfachung, Kollinearität, Geraden und Ebenen in Parameterform. · *EN: Points and vectors as tuples, addition and scalar multiplication, collinearity, lines and planes in parametric form.* – Simulationen: `koordinaten-3d` (12), `vektoren-3d` (12), `geraden-ebenen`
  - gA-4.2 Maße und Lagen · *Measures and positions* – Kurz: Abstände zwischen Punkten, Skalarprodukt und Orthogonalität, Winkel, Lage und Schnittpunkte von Geraden. · *EN: Distances between points, dot product and orthogonality, angles, relative positions and intersections of lines.* – Simulationen: `lage-abstaende`, `skalar-vektorprodukt` (12)
  - gA-4.3 Fakultative Erweiterungen · *Optional extensions* – Kurz: Lage von Geraden und Ebenen, Normalenform, Kreis- und Kugelgleichung. · *EN: Lines and planes, normal form, equations of circles and spheres.* – Simulationen: `kugeln` (13)

### gA-5 Daten und Zufall (gA)
*EN: Data and chance (basic level)*

- Kurz (DE): Bedingte Wahrscheinlichkeit und Unabhängigkeit, Erwartungswert und Standardabweichung, Binomialverteilung mit Prognoseintervallen und Simulationen.
- Kurz (EN): Conditional probability and independence, expected value and standard deviation, the binomial distribution with prediction intervals and simulations.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `binomialverteilung`, `galtonbrett`
- Unterbereiche:
  - gA-5.1 Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit · *Conditional probability and stochastic independence* – Kurz: Mit Baumdiagramm und Vierfeldertafel erarbeiten, Teilvorgänge auf Unabhängigkeit prüfen. · *EN: Developing it with tree diagrams and two-way tables, checking stages for independence.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem` (12)
  - gA-5.2 Erwartungswert und Standardabweichung diskreter Zufallsgrößen · *Expected value and standard deviation of discrete random variables* – Kurz: Kenngrößen berechnen und deuten, faire Spiele. · *EN: Calculating and interpreting measures, fair games.* – Simulationen: `binomialverteilung`
  - gA-5.3 Binomialverteilung · *Binomial distribution* – Kurz: Modell beurteilen, Wahrscheinlichkeiten und Kenngrößen berechnen, Histogramme deuten, Prognoseintervalle und Verträglichkeit einer Stichprobe. · *EN: Judging the model, calculating probabilities and measures, interpreting histograms, prediction intervals and whether a sample is compatible.* – Simulationen: `binomialverteilung`, `galtonbrett` (12)

### eA-1 Von der Änderung zum Bestand – Integralrechnung (eA)
*EN: From change to total – integral calculus (higher level)*

- Kurz (DE): Wie gA, dazu Integralfunktion, ln als Stammfunktion von 1/x, Rotationskörper und uneigentliche Integrale.
- Kurz (EN): As at basic level, plus the integral function, ln as an antiderivative of 1/x, solids of revolution and improper integrals.
- Simulationen: `ober-untersummen`, `aenderungsrate`, `hauptsatz`, `stammfunktion-grafisch`, `rotationskoerper`
- Unterbereiche:
  - eA-1.1 Bestimmtes Integral · *Definite integral* – Kurz: Rekonstruierter Bestand, Produktsummen, Hauptsatz und Flächeninhalte. · *EN: Reconstructed totals, Riemann sums, the fundamental theorem and areas.* – Simulationen: `ober-untersummen`, `aenderungsrate`, `hauptsatz`
  - eA-1.2 Integral- und Stammfunktion · *Integral function and antiderivative* – Kurz: Integralfunktion als Bestands- oder Flächeninhaltsfunktion, Stammfunktionen einschließlich ln. · *EN: The integral function as accumulation or area function, antiderivatives including ln.* – Simulationen: `stammfunktion-grafisch`, `hauptsatz`
  - eA-1.3 Vertiefungen · *Further topics* – Kurz: Volumen von Rotationskörpern um die x-Achse, uneigentliche Integrale. · *EN: Volumes of solids of revolution about the x-axis, improper integrals.* – Simulationen: `rotationskoerper`

### eA-2 Wachstumsmodelle – Exponentialfunktion (eA)
*EN: Growth models – exponential function (higher level)*

- Kurz (DE): Begrenztes und logistisches Wachstum vergleichen, Differentialgleichungen als Modelle, die e-Funktion mit Ableitung, Verknüpfung und Verkettung sowie Exponentialgleichungen.
- Kurz (EN): Comparing limited and logistic growth, differential equations as models, the exponential function with its derivative, combinations and compositions, and exponential equations.
- Simulationen: `grenzverhalten`, `e-funktion`, `logarithmus`
- Unterbereiche:
  - eA-2.1 Untersuchung von Wachstumsprozessen · *Investigating growth processes* – Kurz: Begrenztes und logistisches Wachstum, asymptotisches Verhalten, Differentialgleichungen. · *EN: Limited and logistic growth, asymptotic behaviour, differential equations.* – Simulationen: `grenzverhalten` (12)
  - eA-2.2 e-Funktion · *Exponential function e^x* – Kurz: Basis e, Ableitungen, Produkt- und Kettenregel, Exponentialgleichungen und Scharparameter. · *EN: The base e, derivatives, product and chain rules, exponential equations and family parameters.* – Simulationen: `e-funktion` (12), `logarithmus` (12)

### eA-3 Raumanschauung und Koordinatisierung (eA)
*EN: Spatial visualisation and coordinates (higher level)*

- Kurz (DE): Wie gA, dazu Projektion in die Ebene mit Matrizen, Ebenen in Normalen- und Koordinatenform, Abstände zwischen Punkten, Geraden und Ebenen und der Gauß-Algorithmus.
- Kurz (EN): As at basic level, plus projection onto the plane with matrices, planes in normal and coordinate form, distances between points, lines and planes, and Gaussian elimination.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `geraden-ebenen`, `lage-abstaende`, `skalar-vektorprodukt`, `matrix-abbildungen`, `kugeln`
- Unterbereiche:
  - eA-3.1 Raumanschauung und Koordinatisierung · *Spatial visualisation and coordinates* – Kurz: Punkte und Vektoren, Vektoroperationen, Kollinearität und Schrägbilder mit Projektionsmatrizen. · *EN: Points and vectors, vector operations, collinearity and oblique drawings with projection matrices.* – Simulationen: `koordinaten-3d` (12), `vektoren-3d` (12)
  - eA-3.2 Darstellungsformen · *Forms of representation* – Kurz: Geraden und Ebenen in Parameter-, Normalen- und Koordinatenform. · *EN: Lines and planes in parametric, normal and coordinate form.* – Simulationen: `geraden-ebenen`
  - eA-3.3 Maße und Lagen · *Measures and positions* – Kurz: Abstände, Skalarprodukt, Winkel, Lagebeziehungen von Geraden und Ebenen und der Gauß-Algorithmus. · *EN: Distances, dot product, angles, relative positions of lines and planes, and Gaussian elimination.* – Simulationen: `lage-abstaende`, `skalar-vektorprodukt` (12)
  - eA-3.4 Fakultative Erweiterungen · *Optional extensions* – Kurz: Vektoren in anderen Zusammenhängen, weitere Abbildungsmatrizen, Kreis- und Kugelgleichung. · *EN: Vectors in other contexts, further transformation matrices, equations of circles and spheres.* – Simulationen: `matrix-abbildungen`, `kugeln` (13)

### eA-4 Kurvenanpassung und Funktionsscharen (eA)
*EN: Curve fitting and families of functions (higher level)*

- Kurz (DE): Funktionen nach globalen Eigenschaften einordnen und an Daten anpassen, abschnittsweise definierte Funktionen sowie Scharen ganzrationaler und e-Funktionen.
- Kurz (EN): Classifying functions by global properties and fitting them to data, piecewise functions, and families of polynomial and exponential functions.
- Simulationen: `grenzverhalten`, `funktionenscharen`
- Unterbereiche:
  - eA-4.1 Kurvenanpassung · *Curve fitting* – Kurz: Symmetrie, Verhalten für große |x|, Asymptoten und Periodizität nutzen, Bedingungen aufstellen, Stetigkeit und Differenzierbarkeit. · *EN: Using symmetry, behaviour for large |x|, asymptotes and periodicity, setting up conditions, continuity and differentiability.* – Simulationen: `grenzverhalten` (12)
  - eA-4.2 Funktionenscharen · *Families of functions* – Kurz: Einfluss des Scharparameters und Anpassung an Eigenschaften. · *EN: The effect of the family parameter and fitting to properties.* – Simulationen: `funktionenscharen`

### eA-5 Daten und Zufall (eA)
*EN: Data and chance (higher level)*

- Kurz (DE): Wie gA, dazu kausale und stochastische Unabhängigkeit, Normalverteilung, Näherung der Binomialverteilung und Konfidenzintervalle.
- Kurz (EN): As at basic level, plus causal and stochastic independence, the normal distribution, approximating the binomial distribution and confidence intervals.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `binomialverteilung`, `galtonbrett`, `normalverteilung`
- Unterbereiche:
  - eA-5.1 Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit · *Conditional probability and stochastic independence* – Kurz: Baumdiagramm und Vierfeldertafel, kausale und stochastische Unabhängigkeit. · *EN: Tree diagrams and two-way tables, causal and stochastic independence.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem` (12)
  - eA-5.2 Erwartungswert und Standardabweichung diskreter Zufallsgrößen · *Expected value and standard deviation of discrete random variables* – Kurz: Kenngrößen berechnen und deuten, faire Spiele. · *EN: Calculating and interpreting measures, fair games.* – Simulationen: `binomialverteilung`
  - eA-5.3 Binomialverteilung · *Binomial distribution* – Kurz: Modell, Wahrscheinlichkeiten, Kenngrößen, Histogramme, Prognoseintervalle und Simulationen. · *EN: The model, probabilities, measures, histograms, prediction intervals and simulations.* – Simulationen: `binomialverteilung`, `galtonbrett` (12)
  - eA-5.4 Normalverteilung · *Normal distribution* – Kurz: Diskrete und stetige Zufallsgrößen, Parameter der Normalverteilung. · *EN: Discrete and continuous random variables, parameters of the normal distribution.* – Simulationen: `normalverteilung` (13)
  - eA-5.5 Binomial- und Normalverteilung · *Binomial and normal distribution* – Kurz: Näherung der Binomialverteilung, σ-Umgebungen und Konfidenzintervalle. · *EN: Approximating the binomial distribution, sigma intervals and confidence intervals.* – Simulationen: `galtonbrett` (12), `normalverteilung` (13)

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `niedersachsen-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/niedersachsen-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `polstellen-asymptoten` | Gebrochenrationale Funktionen mit Pol- und Nullstellen stehen nicht im Kerncurriculum. Es gibt nur die Kehrwertfunktion als fakultative Erweiterung (EF) und das Grenzverhalten von 1/x (Lernbereich 22). |
| `newton-verfahren` | Nicht im Kerncurriculum. Näherungsverfahren gibt es nur für Quadratwurzeln (Heron, Lernbereich 22). |
| `monte-carlo-pi` | Kein passender Lernbereich. Die Kreiszahl wird über Vielecke angenähert (Lernbereich 19), Simulationen dienen dem Gesetz der großen Zahlen. |
| `signifikanztest` | Hypothesentests mit Fehlern 1. und 2. Art stehen nicht im Kerncurriculum. Es gibt Prognoseintervalle und die Frage, ob eine Stichprobe mit einem Wert von p „verträglich“ ist. |
| `taylor-polynome` | nicht im Kerncurriculum (Hochschule) |
| `fourier-reihen` | nicht im Kerncurriculum (Hochschule) |

## D.2 Unterbereiche ohne passende Simulation

- **5/6:** 4.1 Befragung oder Beobachtung, 4.2 Experiment (Lernbereich 4 vollständig); 5.3 Runden und schätzen
- **7/8:** 8.3 Multiplizieren und dividieren (negative Zahlen); 9.3 Additions- und Komplementärregel
- **9/10:** 18.4 Parabel als Ortslinie
- **Einführungsphase:** EF-1 Beschreibende Statistik vollständig (`boxplot` und `diagramme` sind für Klasse 6–7 gedacht)

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Eigene Umfrage auswerten | Fragebogen planen, Strichliste führen, Hypothese prüfen | 4 |
| Vorzeichenregeln mit Mustern | Rechenreihen fortsetzen (Permanenzprinzip) | 8.3 |
| Parabel als Ortslinie | Punkt mit gleichem Abstand zu Brennpunkt und Leitgerade ziehen | 18.4 |
| Kenngrößen und Streuung | Varianz und Standardabweichung von Datensätzen, Vergleich zweier Klassen | EF-1 |

# Teil E – Einordnung und Unklarheiten

Festlegung der Projektleitung (27.10.2026): Nennt der Lehrplan keine genauen Jahrgänge, werden Doppeljahrgangsstufen verwendet.

1. **Sekundarbereich I.** Das Kerncurriculum gliedert selbst in Doppelschuljahrgänge 5/6, 7/8 und 9/10. Die Lernbereiche stehen deshalb bei beiden Jahrgängen gleich. Laut Kap. 3.3 sind sie keine Unterrichtseinheiten und dürfen anders zugeschnitten werden.
2. **Oberstufe.** Einführungsphase = Schuljahrgang 11 (G9). Die Qualifikationsphase verteilt das Kerncurriculum nicht auf die Jahre; sie steht als Doppeljahrgang 12/13. Abgebildet sind die Lernbereiche für Gymnasium, Gesamtschule, Abendgymnasium und Kolleg (Kap. 3.3.2.1), nicht die des Beruflichen Gymnasiums.
3. **gA und eA getrennt.** Die Lernbereiche unterscheiden sich, zum Beispiel „Die e-Funktion“ (gA) gegenüber „Wachstumsmodelle – Exponentialfunktion“ (eA). Sie stehen deshalb getrennt mit „(gA)“ bzw. „(eA)“ im Titel.
4. **Nummern.** Lernbereiche und Kernpunkte sind im Original nicht nummeriert. Die Nummern 1–22 laufen über die drei Doppeljahrgänge durch. EF-, gA- und eA-Codes und die Nummern der Unterbereiche sind von uns. Wo die Kernpunkte keine Oberpunkte haben (gA-1, gA-3), steht der Lernbereich ohne Unterbereiche.
5. **Fakultative Erweiterungen.** Sie gehören zum Kerncurriculum, sind aber nicht verbindlich. Sie stehen als eigener Unterbereich nur dort, wo eine Simulation passt:
   - 19.3: `cavalieri`
   - EF-2.4: `umkehrfunktion`
   - gA-4.3: `kugeln`
   - eA-3.4: `matrix-abbildungen`, `kugeln`
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`), weil Niedersachsen das Thema in einem anderen Jahrgang unterrichtet:

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `winkel-geradenkreuzung` | 7–7 | 6–7 | 2.5 Winkel erkunden (5/6) | Sek. I Kap. 3.3.1, Körper und Figuren: Neben-, Scheitel- und Stufenwinkel |
   | `winkelsumme` | 7–7 | 6–7 | 2.6 Winkelsummensatz (5/6) | Sek. I Kap. 3.3.1, Körper und Figuren: Winkelsummensatz für Drei- und Vierecke |
   | `mittelsenkrechte` | 7–7 | 6–7 | 6.4 Kreise beschreiben und nutzen (5/6) | Sek. I Kap. 3.3.1, Symmetrien: Mittelsenkrechte und Winkelhalbierende als Symmetrieachsen, Kreis als Ortslinie |
   | `geburtstagsproblem` | 10–13 | 8–13 | 14.2 Zwei- und mehrstufige Zufallsexperimente (7/8) | Sek. I Kap. 3.3.2: mehrstufige Zufallsexperimente, Pfadregeln |
   | `ziegenproblem` | 10–10 | 10–12 | gA-5.1/eA-5.1 Bedingte Wahrscheinlichkeit | Sek. II Kap. 3.3.2.1, Daten und Zufall: bedingte Wahrscheinlichkeit erst in der Qualifikationsphase |

   `geburtstagsproblem` steht im Thema „Wahrscheinlichkeit“ jetzt vor `ziegenproblem`, damit die Sortierung nach Klassenstufe stimmt.
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `zehnerpotenzen` bei 1.2: Das Stellenwertsystem passt, die Zehnerpotenzschreibweise selbst steht nicht in 5/6.
   - `zaehlprinzip` und `geburtstagsproblem` bei 14.2: Gezählt wird im Baumdiagramm; Kombinatorik ist kein eigener Kernpunkt.
   - `bedingte-wahrscheinlichkeit` schon bei 16.3 (Klasse 10): Das Kerncurriculum bereitet die bedingte Wahrscheinlichkeit dort mit absoluten Häufigkeiten vor.
   - `parabel-drei-punkte` bei 18.3 (Ausgleichsparabeln).
   - `transformationen` bei 21.2 und EF-2.2 (Parametervariation).
   - `funktionenscharen` bei gA-1 (Anpassung eines Parameters).
   - `grenzverhalten` bei eA-2.1 und eA-4.1 (asymptotisches Verhalten).
   - `matrix-abbildungen` bei eA-3.4: Der Kern nennt nur Projektionsmatrizen, die Erweiterung „weitere Abbildungsmatrizen“.
8. **Nicht abgebildet:** die prozessbezogenen Kompetenzbereiche, die Kompetenztabellen in Kap. 3.2 (sie decken sich laut Kerncurriculum mit den Lernbereichen) und die Hinweise zu digitalen Werkzeugen.
