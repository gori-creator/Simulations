# Rheinland-Pfalz · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I und gymnasiale Oberstufe (Mainzer Studienstufe) |
|---|---|
| Bundesland | Rheinland-Pfalz |
| Schulart | Gymnasium, Klassenstufen 5–10 und Jahrgangsstufen 11–13 |
| Fach | Mathematik |
| Name des Lehrplans (Sek. I) | „Rahmenlehrplan Mathematik (Klassenstufen 5 – 9/10)“, Ministerium für Bildung, Wissenschaft, Jugend und Kultur Rheinland-Pfalz, ISBN 3-981-0390-4-1; gilt für alle Schularten der Sekundarstufe I |
| Jahr / Stand (Sek. I) | Stand Mai 2007 |
| Name des Lehrplans (Oberstufe) | „Lehrplan Mathematik, Grund- und Leistungsfach in der gymnasialen Oberstufe (Mainzer Studienstufe)“, Ministerium für Bildung, Wissenschaft, Weiterbildung und Kultur; Fassung von 1998, angepasst an die Bildungsstandards für die Allgemeine Hochschulreife (KMK 18.10.2012) |
| Jahr / Stand (Oberstufe) | Erscheinungstermin Oktober 2014, „Anpassung an die Bildungsstandards für die allgemeine Hochschulreife, Stand März 2015“ |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `Mathe_rp_sek1_teil_1.pdf` (50 Seiten, Titel bis S. 46) und `Mathe_rp_sek1_teil_2.pdf` (66 Seiten, S. 47–110 und Rückseite), zusammen der vollständige Rahmenlehrplan; `Mathematik_LPErgaenzung_SekII.pdf` (82 Seiten, Oberstufe) |
| Link laut Dokument | Sek. I: keiner. Oberstufe: „www.mbwwk.rlp.de“ (das damalige Ministerium). In `sourceUrl` steht die Startseite des heutigen Ministeriums für Bildung, `https://bm.rlp.de/`; kein Link zur einzelnen Datei (Vermerk im Pull Request) |
| G8/G9 | G9: Abitur nach Jahrgangsstufe 13; Mainzer Studienstufe 11–13 |
| Niveaus / Wahl | Sek. I: Inhalte mit B (Basis), E (Erweiterung) und V (Vertiefung, für den Übergang in die Oberstufe), am Gymnasium alle verbindlich; Orientierungsstufe mit nicht verbindlichen Addita (+). Oberstufe: Grundfach und Leistungsfach; Wahlpflichtgebiete in Linearer Algebra/Analytischer Geometrie (A1 oder A2) und im Grundfach in Stochastik 2 (B1 oder B2) |
| Struktur | Sek. I: Doppelklassenstufen 5/6 (Orientierungsstufe), 7/8, 9/10 → Leitideen L1–L5, teils in mehrere Inhaltsbereiche geteilt → Abschnitte in Großbuchstaben; keine Nummern unterhalb der Leitideen. Oberstufe: Grundfach und Leistungsfach → Themenbereiche mit nummerierten Zielen; keine Zuordnung zu Jahrgangsstufen |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Orientierungsstufe (Klassenstufen 5/6) | 5, 6 | 7 | 13 | 13 | 22 |
| Klassenstufen 7/8 | 7, 8 | 7 | 14 | 14 | 26 |
| Klassenstufen 9/10 (Mittlerer Schulabschluss) | 9, 10 | 6 | 18 | 18 | 29 |
| Mainzer Studienstufe (Jahrgangsstufen 11–13) – Grundfach und Leistungsfach | 11, 12, 13 | 13 | 6 | 16 | 34 |

Insgesamt verwendet: **91 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `taylor-polynome`, `fourier-reihen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Orientierungsstufe (Klassenstufen 5/6)  
*Orientation stage (grades 5/6)*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Rahmenlehrplan Mathematik (Stand Mai 2007), Kap. 6.3, S. 15–36)

> Orientierungsstufe (Klassenstufen 5 und 6): Der Rahmenlehrplan beschreibt beide Klassenstufen gemeinsam und ohne Reihenfolge; die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Lernbereiche sind die Inhaltsbereiche der Leitideen L1–L5, Unterbereiche ihre Abschnitte; die Nummern sind von uns vergeben. Mit (+) gekennzeichnete Addita sind nicht verbindlich.

### 1 Zahl und Zahlbereiche: Natürliche Zahlen
*EN: Number and number sets: natural numbers*

- Kurz (DE): Den Zahlenraum über eine Million hinaus erweitern, im Kopf, schriftlich und mit Überschlag rechnen, Terme strukturieren und Teilbarkeit untersuchen.
- Kurz (EN): Extending the number range beyond one million, mental, written and estimated calculation, structuring terms and examining divisibility.
- Simulationen: `stellenwerte`, `zehnerpotenzen`, `termbaum`, `primfaktoren`
- Unterbereiche:
  - 1.1 Natürliche Zahlen darstellen · *Representing natural numbers* – Kurz: Große Zahlen lesen und schreiben, das Stellenwertsystem erklären, Zahlen ordnen, runden und am Zahlenstrahl zeigen; Binärsystem als Additum. · *EN: Reading and writing large numbers, explaining the place-value system, ordering, rounding and showing numbers on the number line; the binary system as an optional extra.* – Simulationen: `stellenwerte` (5)
  - 1.2 Rechnen mit natürlichen Zahlen · *Calculating with natural numbers* – Kurz: Kopfrechnen und schriftliche Verfahren, einfache Potenzen, Überschlag, Terme mit Rechenbäumen strukturieren, einfache Gleichungen lösen und Rechengesetze nutzen. · *EN: Mental and written methods, simple powers, estimating, structuring terms with calculation trees, solving simple equations and using the laws of arithmetic.* – Simulationen: `zehnerpotenzen`, `termbaum`
  - 1.3 Teilbarkeit · *Divisibility* – Kurz: Teilbarkeitsregeln für 2, 3, 4, 5, 9 und 10 anwenden, Primzahlen als Bausteine der natürlichen Zahlen kennenlernen. · *EN: Applying divisibility rules for 2, 3, 4, 5, 9 and 10 and meeting prime numbers as the building blocks of natural numbers.* – Simulationen: `primfaktoren`

### 2 Zahl und Zahlbereiche: Ganze Zahlen
*EN: Number and number sets: integers*

- Kurz (DE): Negative Zahlen aus dem Alltag deuten, an der Zahlengeraden ordnen und Zustandsänderungen berechnen.
- Kurz (EN): Interpreting negative numbers from everyday life, ordering them on the number line and calculating changes of state.
- Simulationen: `zahlengerade`, `termbaum`
- Unterbereiche:
  - 2.1 Ganze Zahlen darstellen · *Representing integers* – Kurz: Zahlen mit Vorzeichen in Sachzusammenhängen wie Temperatur oder Kontostand deuten, an der Zahlengeraden ordnen und im Koordinatensystem darstellen. · *EN: Interpreting signed numbers in contexts such as temperature or bank balance, ordering them on the number line and plotting them in the coordinate system.* – Simulationen: `zahlengerade`
  - 2.2 Rechnen mit ganzen Zahlen · *Calculating with integers* – Kurz: Sachaufgaben als Änderung von einem Anfangs- zu einem Endzustand lösen, einfache Terme auswerten und Gleichungen lösen; der zweite Operand bleibt positiv. · *EN: Solving word problems as a change from a starting state to an end state, evaluating simple terms and solving equations; the second operand stays positive.* – Simulationen: `zahlengerade`, `termbaum`

### 3 Zahl und Zahlbereiche: Bruchzahlen
*EN: Number and number sets: fractions*

- Kurz (DE): Einen tragfähigen Bruchbegriff aufbauen, Bruchzahlen in Bruch-, Dezimal- und Prozentschreibweise darstellen und mit positiven Bruchzahlen rechnen.
- Kurz (EN): Building a sound concept of fractions, writing them as fractions, decimals and percentages, and calculating with positive fractions.
- Simulationen: `bruchteile`, `brueche-vergleichen`, `dezimalbrueche`, `prozentstreifen`, `brueche-rechnen`
- Unterbereiche:
  - 3.1 Bruchzahlen darstellen · *Representing fractions* – Kurz: Brüche als Maßzahl und Operator deuten, Anteile berechnen, als Bruch, Dezimalbruch und Prozent schreiben, erweitern, kürzen, vergleichen und ordnen. · *EN: Interpreting fractions as measures and operators, calculating parts, writing them as fractions, decimals and percentages, expanding, simplifying, comparing and ordering.* – Simulationen: `bruchteile`, `brueche-vergleichen`, `dezimalbrueche` (6), `prozentstreifen` (6)
  - 3.2 Rechnen mit Bruchzahlen · *Calculating with fractions* – Kurz: Brüche und Dezimalbrüche addieren, subtrahieren, multiplizieren und dividieren, den Bruchoperator als Faktor deuten und in Sachsituationen anwenden. · *EN: Adding, subtracting, multiplying and dividing fractions and decimals, reading the fraction operator as a factor and applying it in real contexts.* – Simulationen: `brueche-rechnen` (6), `dezimalbrueche` (6)

### 4 Messen und Größen
*EN: Measurement and quantities*

- Kurz (DE): Messen als Vergleichen mit einer Einheit, Länge, Masse, Zeit, Winkel, Fläche und Volumen; Formeln für Rechteck und Quader; Rechnen mit Größen und Maßstab.
- Kurz (EN): Measuring as comparing with a unit: length, mass, time, angle, area and volume; formulas for rectangle and cuboid; calculating with quantities and scale.
- Simulationen: `winkel-messen`, `umfang-flaeche`, `quader-volumen`, `einheiten`, `massstab`
- Unterbereiche:
  - 4.1 Grundprinzip Messen · *The principle of measuring* – Kurz: Längen, Massen, Zeitspannen, Winkel, Flächen und Volumen mit Einheiten messen und schätzen; Umfang und Flächeninhalt des Rechtecks sowie Volumen und Oberfläche des Quaders herleiten. · *EN: Measuring and estimating lengths, masses, time spans, angles, areas and volumes with units; deriving perimeter and area of the rectangle and volume and surface area of the cuboid.* – Simulationen: `winkel-messen` (5), `umfang-flaeche` (5), `quader-volumen`
  - 4.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Größen in andere Einheiten umrechnen, mit Vorsilben und Kommaschreibweise umgehen, in Sachsituationen sinnvoll runden, Maßstäbe und Formeln anwenden. · *EN: Converting quantities between units, using prefixes and decimal notation, rounding sensibly in real contexts, applying scales and formulas.* – Simulationen: `einheiten` (5), `massstab`

### 5 Raum und Form
*EN: Space and shape*

- Kurz (DE): Symmetrische Figuren erkennen und erzeugen, Winkel und Kreise zeichnen, Körper und Vierecke beschreiben, Netze und Schrägbilder, Koordinatensystem.
- Kurz (EN): Recognising and creating symmetric figures, drawing angles and circles, describing solids and quadrilaterals, nets and oblique drawings, coordinate system.
- Simulationen: `spiegelung`, `koordinaten-lage`, `winkel-messen`, `koerpernetze`, `vierecke`
- Unterbereiche:
  - 5.1 Symmetrische Figuren · *Symmetric figures* – Kurz: Achsen- und Drehsymmetrie, parallel und senkrecht, Gerade, Strecke und Abstand, Winkel schätzen, messen und klassifizieren, Kreise zeichnen. · *EN: Line and rotational symmetry, parallel and perpendicular, lines, segments and distance, estimating, measuring and classifying angles, drawing circles.* – Simulationen: `spiegelung`, `koordinaten-lage` (5), `winkel-messen` (5)
  - 5.2 Formen und Beziehungen in Raum und Ebene · *Shapes and relations in space and the plane* – Kurz: Würfel, Quader, Pyramide, Zylinder, Kegel, Kugel und Prisma erkennen, Vierecke beschreiben und zeichnen, Netze und Schrägbilder herstellen, im Koordinatensystem arbeiten. · *EN: Recognising cubes, cuboids, pyramids, cylinders, cones, spheres and prisms, describing and drawing quadrilaterals, making nets and oblique drawings, working in the coordinate system.* – Simulationen: `koerpernetze`, `vierecke`, `koordinaten-lage` (5)

### 6 Funktionaler Zusammenhang
*EN: Functional relationships*

- Kurz (DE): Wird in der Orientierungsstufe nicht eigens unterrichtet: Zahlenfolgen, Terme, Operatormodell, Formeln, Maßstab und Datendarstellungen bereiten die funktionale Sichtweise in den anderen Leitideen vor.
- Kurz (EN): Not taught separately in the orientation stage: sequences, terms, the operator model, formulas, scale and data displays prepare the functional view within the other key ideas.
- Simulationen: –

### 7 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Abzählen mit Baumdiagrammen sowie Daten erheben, mit Häufigkeiten und Mittelwert auswerten und in Diagrammen darstellen.
- Kurz (EN): Counting with tree diagrams, and collecting data, analysing it with frequencies and the mean and showing it in charts.
- Simulationen: `zaehlprinzip`, `diagramme`, `boxplot`
- Unterbereiche:
  - 7.1 Zählstrategien · *Counting strategies* – Kurz: In konkreten Situationen wie Zahlenschlössern Abzählverfahren entwickeln und im Baumdiagramm darstellen. · *EN: Developing counting methods in concrete situations such as combination locks and showing them in tree diagrams.* – Simulationen: `zaehlprinzip`
  - 7.2 Daten · *Data* – Kurz: Datenerhebungen planen und auswerten, absolute und relative Häufigkeit, arithmetisches Mittel, Diagramme lesen und auf Manipulation prüfen. · *EN: Planning and analysing surveys, absolute and relative frequency, the arithmetic mean, reading charts and checking them for manipulation.* – Simulationen: `diagramme` (6), `boxplot` (6)

## Klassenstufen 7/8  
*Grades 7/8*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: Rahmenlehrplan Mathematik (Stand Mai 2007), Kap. 7.4, S. 40–65)

> Klassenstufen 7 und 8: Der Rahmenlehrplan beschreibt beide Klassenstufen gemeinsam; die Lernbereiche stehen deshalb bei 7 und 8 gleich und werden als eine Stufe gezeigt. Er gilt für alle Schularten und kennzeichnet Inhalte als Basis (B), Erweiterung (E) und Vertiefung (V); V bereitet auf die gymnasiale Oberstufe vor, am Gymnasium gelten also alle drei. Die Nummern sind von uns vergeben.

### 1 Zahl und Zahlbereiche: Prozent- und Zinsrechnung
*EN: Number and number sets: percentages and interest*

- Kurz (DE): Prozentbegriff, Grundaufgaben mit Grundwert, Prozentsatz und Prozentwert sowie Zinsrechnung, auch in komplexeren Sachsituationen.
- Kurz (EN): The concept of percentage, basic problems with base, rate and percentage value, and interest, also in more complex contexts.
- Simulationen: `prozentstreifen`
- Unterbereiche:
  - 1.1 Prozent- und Zinsrechnung · *Percentages and interest* – Kurz: Prozentangaben mit Streifen- und Kreisdiagrammen veranschaulichen, Grundaufgaben lösen, Zinsen berechnen, Prozentpunkte unterscheiden; vermehrter und verminderter Grundwert (E). · *EN: Illustrating percentages with bar and pie charts, solving basic problems, calculating interest, distinguishing percentage points; increased and reduced base values (E).* – Simulationen: `prozentstreifen` (7)

### 2 Zahl und Zahlbereiche: Rationale Zahlen
*EN: Number and number sets: rational numbers*

- Kurz (DE): Negative Bruchzahlen darstellen und ordnen, Betrag, und mit rationalen Zahlen in allen Grundrechenarten rechnen.
- Kurz (EN): Representing and ordering negative fractions, absolute value, and all four operations with rational numbers.
- Simulationen: `zahlengerade`, `termbaum`
- Unterbereiche:
  - 2.1 Rationale Zahlen darstellen · *Representing rational numbers* – Kurz: Negative Zahlen im Sachzusammenhang deuten, auf der Zahlengeraden ordnen, als Pfeile darstellen und den Betrag als Abstand von null verstehen. · *EN: Interpreting negative numbers in context, ordering them on the number line, showing them as arrows and understanding absolute value as distance from zero.* – Simulationen: `zahlengerade` (7)
  - 2.2 Mit rationalen Zahlen rechnen · *Calculating with rational numbers* – Kurz: Zustandsänderungen berechnen; addieren und subtrahieren auch mit negativem zweitem Operanden, multiplizieren und dividieren, Terme auswerten, Rechengesetze nutzen (E). · *EN: Calculating changes of state; adding and subtracting with a negative second operand, multiplying and dividing, evaluating terms, using the laws of arithmetic (E).* – Simulationen: `zahlengerade` (7), `termbaum` (7)

### 3 Messen und Größen
*EN: Measurement and quantities*

- Kurz (DE): Flächeninhalte von Parallelogramm, Dreieck, Trapez und Kreis sowie Volumen und Oberfläche gerader Prismen und Zylinder.
- Kurz (EN): Areas of parallelograms, triangles, trapezia and circles, and volume and surface area of right prisms and cylinders.
- Simulationen: `flaechen-zerlegen`, `kreiszahl-pi`, `prisma-zylinder`, `koerpernetze`
- Unterbereiche:
  - 3.1 Berechnungen an ebenen Figuren · *Calculations with plane figures* – Kurz: Flächeninhalte durch Zerlegen und Ergänzen auf bekannte Figuren zurückführen, Formeln herleiten, Kreisumfang und Kreisfläche mit π als Proportionalitätsfaktor bestimmen. · *EN: Reducing areas to known figures by dissection and completion, deriving formulas, determining circumference and area of a circle with π as the constant of proportionality.* – Simulationen: `flaechen-zerlegen`, `kreiszahl-pi` (8)
  - 3.2 Berechnungen an Körpern · *Calculations with solids* – Kurz: Volumen und Oberflächeninhalt gerader Prismen und Zylinder bestimmen, das Prinzip Grundfläche mal Höhe herausarbeiten, zusammengesetzte Körper berechnen. · *EN: Finding volume and surface area of right prisms and cylinders, working out the principle of base area times height, calculating composite solids.* – Simulationen: `prisma-zylinder`, `koerpernetze`

### 4 Raum und Form
*EN: Space and shape*

- Kurz (DE): Netze und Schrägbilder, Grundkonstruktionen, symmetrische und kongruente Figuren, Winkelsätze und Satz des Thales sowie Kongruenzabbildungen.
- Kurz (EN): Nets and oblique drawings, basic constructions, symmetric and congruent figures, angle theorems and Thales’ theorem, and congruence transformations.
- Simulationen: `koerpernetze`, `mittelsenkrechte`, `besondere-linien`, `vierecke`, `dreieckskonstruktion`, `winkelsumme`, `winkel-geradenkreuzung`, `thales`, `spiegelung`
- Unterbereiche:
  - 4.1 Eigenschaften und Beziehungen geometrischer Objekte · *Properties and relations of geometric objects* – Kurz: Netze und Schrägbilder von Prismen und Zylindern, Mittelsenkrechte und Winkelhalbierende mit Um- und Inkreis, symmetrische Drei- und Vierecke, „Haus der Vierecke“ (E), Dreiecke konstruieren und Kongruenzsätze nutzen. · *EN: Nets and oblique drawings of prisms and cylinders, perpendicular and angle bisectors with circumcircle and incircle, symmetric triangles and quadrilaterals, the “house of quadrilaterals” (E), constructing triangles and using congruence criteria.* – Simulationen: `koerpernetze`, `mittelsenkrechte` (7), `besondere-linien`, `vierecke` (7), `dreieckskonstruktion` (7)
  - 4.2 Sätze der ebenen Geometrie · *Theorems of plane geometry* – Kurz: Winkelsumme in Dreieck und Viereck, Winkelsätze an Geradenkreuzungen (E), den Satz des Thales begründen und anwenden (E), seine Umkehrung (V). · *EN: Angle sum in triangles and quadrilaterals, angle theorems at intersecting lines (E), justifying and applying Thales’ theorem (E), its converse (V).* – Simulationen: `winkelsumme` (7), `winkel-geradenkreuzung` (7), `thales` (7)
  - 4.3 Geometrische Abbildungen · *Geometric transformations* – Kurz: Drehungen und Verschiebungen im Koordinatensystem ausführen; Abbildungen nach Achse, Zentrum, Winkel und Pfeil untersuchen, Fixelemente und Kongruenzabbildungen (E). · *EN: Performing rotations and translations in the coordinate system; examining transformations by axis, centre, angle and arrow, fixed elements and congruence transformations (E).* – Simulationen: `spiegelung` (7)

### 5 Funktionaler Zusammenhang: Zuordnungen und Funktionen
*EN: Functional relationships: mappings and functions*

- Kurz (DE): Zuordnungen im Alltag darstellen und deuten, Funktionen als eindeutige Zuordnungen, proportionale, antiproportionale und lineare Funktionen.
- Kurz (EN): Showing and interpreting everyday mappings, functions as unique mappings, proportional, inversely proportional and linear functions.
- Simulationen: `funktion-zuordnung`, `proportional`, `lineare-funktion`, `hyperbel`, `funktionsplotter`
- Unterbereiche:
  - 5.1 Grundlagen · *Basics* – Kurz: Zuordnungen in Worten, Tabellen und Graphen darstellen und auf Eindeutigkeit prüfen; eindeutige Zuordnungen als Funktionen mit Funktionsterm (E). · *EN: Showing mappings in words, tables and graphs and checking whether they are unique; unique mappings as functions with a function term (E).* – Simulationen: `funktion-zuordnung`
  - 5.2 Besondere Zuordnungen und Funktionen · *Special mappings and functions* – Kurz: Proportionale und antiproportionale Zuordnungen erkennen und mit dem Dreisatz lösen; lineare Funktionen mit Steigung und y-Achsenabschnitt, Graphen als Gerade und Hyperbel (E). · *EN: Recognising direct and inverse proportion and solving with the rule of three; linear functions with slope and y-intercept, graphs as straight lines and hyperbolas (E).* – Simulationen: `proportional`, `lineare-funktion`, `hyperbel` (8), `funktionsplotter` (8)

### 6 Funktionaler Zusammenhang: Terme und Gleichungen
*EN: Functional relationships: terms and equations*

- Kurz (DE): Terme aufstellen und umformen, lineare Gleichungen und Ungleichungen lösen, Formeln umstellen, Produkte von Summen und binomische Formeln.
- Kurz (EN): Setting up and transforming terms, solving linear equations and inequalities, rearranging formulas, products of sums and binomial formulas.
- Simulationen: `termbaum`, `waagemodell`, `gleichungen-grafisch`, `binomische-formeln`
- Unterbereiche:
  - 6.1 Terme und Gleichungen Teil I · *Terms and equations part I* – Kurz: Terme zu Sachproblemen aufstellen und ausrechnen, einfache lineare Gleichungen lösen, auch an Waage und Zahlengerade; Ungleichungen und funktionale Deutung von Termen (E). · *EN: Setting up and evaluating terms for real problems, solving simple linear equations, also with a balance and the number line; inequalities and the functional view of terms (E).* – Simulationen: `termbaum` (7), `waagemodell` (7), `gleichungen-grafisch` (8)
  - 6.2 Terme und Gleichungen Teil II · *Terms and equations part II* – Kurz: Formeln mit Parametern nach einer Variablen auflösen; Produkte von Summen ausmultiplizieren und binomische Formeln in beide Richtungen nutzen (E). · *EN: Solving formulas with parameters for one variable; expanding products of sums and using binomial formulas in both directions (E).* – Simulationen: `binomische-formeln`

### 7 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Daten mit Spannweite, Median und Boxplot auswerten, Erhebungen hinterfragen, Wahrscheinlichkeiten aus langen Versuchsreihen schätzen und bei Laplace-Experimenten berechnen.
- Kurz (EN): Analysing data with range, median and box plot, questioning surveys, estimating probabilities from long series of trials and calculating them for Laplace experiments.
- Simulationen: `boxplot`, `diagramme`, `gesetz-grosse-zahlen`
- Unterbereiche:
  - 7.1 Daten · *Data* – Kurz: Daten grafisch aufbereiten und auswerten, Spannweite, Median und Boxplot, irreführende Darstellungen erkennen und Erhebungen auf Repräsentativität prüfen. · *EN: Displaying and analysing data, range, median and box plot, spotting misleading displays and checking surveys for representativeness.* – Simulationen: `boxplot`, `diagramme`
  - 7.2 Zufällige Erscheinungen · *Random phenomena* – Kurz: Einstufige Zufallsexperimente beschreiben, Wahrscheinlichkeiten über relative Häufigkeiten langer Versuchsreihen schätzen, auch mit dem Computer, und Laplace-Wahrscheinlichkeiten berechnen. · *EN: Describing single-stage random experiments, estimating probabilities from relative frequencies over long series of trials, also by computer, and calculating Laplace probabilities.* – Simulationen: `gesetz-grosse-zahlen`

## Klassenstufen 9/10 (Mittlerer Schulabschluss)  
*Grades 9/10 (intermediate school certificate)*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: Rahmenlehrplan Mathematik (Stand Mai 2007), Kap. 9.3, S. 83–110)

> Klassenstufen 9 und 10 (Mittlerer Schulabschluss): Der Rahmenlehrplan beschreibt beide Klassenstufen gemeinsam; die Lernbereiche stehen deshalb bei 9 und 10 gleich und werden als eine Stufe gezeigt. Am Gymnasium gelten Basis (B), Erweiterung (E) und Vertiefung (V); der eigene Teil „Klassenstufe 9 (Qualifikation der Berufsreife)“ gilt nicht für das Gymnasium und ist nicht abgebildet. Die Nummern sind von uns vergeben.

### 1 Zahl und Zahlbereiche
*EN: Number and number sets*

- Kurz (DE): Quadratwurzeln und reelle Zahlen, Näherungsverfahren für Wurzeln und π sowie Potenzen mit ganzen und gebrochenen Exponenten, n-te Wurzel und Logarithmus.
- Kurz (EN): Square roots and real numbers, approximation methods for roots and π, and powers with integer and fractional exponents, nth roots and logarithms.
- Simulationen: `quadratwurzel`, `kreiszahl-pi`, `logarithmus`
- Unterbereiche:
  - 1.1 Quadratwurzeln – reelle Zahlen · *Square roots – real numbers* – Kurz: Quadratwurzeln als Umkehrung des Quadrierens bestimmen und abschätzen, Wurzelgesetze anwenden, irrationale und reelle Zahlen einführen (E). · *EN: Finding and estimating square roots as the inverse of squaring, applying the laws of roots, introducing irrational and real numbers (E).* – Simulationen: `quadratwurzel` (9)
  - 1.2 Näherungsverfahren · *Approximation methods* – Kurz: Ein Iterationsverfahren für irrationale Wurzeln und eines für π begründen und ausführen, auch mit Software (E); Merkmale eines Algorithmus (V). · *EN: Justifying and carrying out an iterative method for irrational roots and one for π, also with software (E); features of an algorithm (V).* – Simulationen: `quadratwurzel` (9), `kreiszahl-pi` (9)
  - 1.3 Potenzieren und entsprechende Umkehrungen · *Powers and their inverses* – Kurz: Potenzen auf negative und gebrochene Exponenten erweitern, Zehnerpotenzschreibweise, Potenzgesetze, n-te Wurzel und Logarithmus als Umkehrungen (E). · *EN: Extending powers to negative and fractional exponents, scientific notation, the laws of exponents, nth roots and logarithms as inverses (E).* – Simulationen: `logarithmus`

### 2 Messen und Größen
*EN: Measurement and quantities*

- Kurz (DE): Strahlensätze und Bruchgleichungen, Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Bogenmaß sowie Volumen und Oberfläche von Pyramide, Kegel und Kugel.
- Kurz (EN): Intercept theorems and fractional equations, sine, cosine and tangent in right triangles, radians, and volume and surface area of pyramids, cones and spheres.
- Simulationen: `strahlensaetze`, `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`, `pyramide-kegel-kugel`, `cavalieri`
- Unterbereiche:
  - 2.1 Strahlensätze · *Intercept theorems* – Kurz: Streckenverhältnisse bei zentrisch gestreckten Figuren mit den Strahlensätzen berechnen und für Messungen im Gelände nutzen, einfache Bruchgleichungen lösen (E). · *EN: Calculating length ratios in centrally enlarged figures with the intercept theorems and using them for measurements outdoors, solving simple fractional equations (E).* – Simulationen: `strahlensaetze` (9)
  - 2.2 Trigonometrische Beziehungen · *Trigonometric relations* – Kurz: Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck, Beziehungen zwischen ihnen und Sachaufgaben; Sinus- oder Kosinussatz kann exemplarisch erarbeitet werden (E). · *EN: Sine, cosine and tangent as side ratios in right triangles, relations between them and word problems; the sine or cosine rule can be worked out as an example (E).* – Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `einheitskreis`
  - 2.3 Bogenmaß · *Radians* – Kurz: Winkel vom Gradmaß ins Bogenmaß umrechnen und umgekehrt und Sinus, Kosinus und Tangens für Winkel im Bogenmaß angeben (V). · *EN: Converting angles between degrees and radians and giving sine, cosine and tangent for angles in radians (V).* – Simulationen: `einheitskreis`
  - 2.4 Berechnungen an Körpern · *Calculations with solids* – Kurz: Volumen und Oberfläche der Pyramide, von Kegel und Kugel (E) berechnen, auch zusammengesetzte Körper; Formeln herleiten, etwa mit dem Satz von Cavalieri (E). · *EN: Calculating volume and surface area of pyramids, cones and spheres (E), including composite solids; deriving formulas, for example with Cavalieri’s principle (E).* – Simulationen: `pyramide-kegel-kugel`, `cavalieri` (10)

### 3 Raum und Form
*EN: Space and shape*

- Kurz (DE): Ähnliche Figuren und zentrische Streckung, die Satzgruppe des Pythagoras sowie Schrägbilder und Netze von Pyramide und Kegel.
- Kurz (EN): Similar figures and central enlargement, the Pythagorean group of theorems, and oblique drawings and nets of pyramids and cones.
- Simulationen: `vergroessern`, `pythagoras`, `pyramide-kegel-kugel`
- Unterbereiche:
  - 3.1 Geometrische Abbildungen · *Geometric transformations* – Kurz: Ähnliche Figuren durch Vergrößern und Verkleinern erzeugen, die Wirkung auf Winkel, Längen und Flächeninhalt untersuchen; zentrische Streckung (E), Ähnlichkeitsabbildungen (V). · *EN: Creating similar figures by enlarging and reducing, examining the effect on angles, lengths and area; central enlargement (E), similarity transformations (V).* – Simulationen: `vergroessern` (9)
  - 3.2 Satzgruppe des Pythagoras · *The Pythagorean group of theorems* – Kurz: Den Satz des Pythagoras begründen und anwenden, einen Beweis erarbeiten, Umkehrung, Kathetensatz und Höhensatz (E), weiteren Beweis vergleichen (V). · *EN: Justifying and applying Pythagoras’ theorem, working out a proof, the converse, the leg theorem and the altitude theorem (E), comparing another proof (V).* – Simulationen: `pythagoras` (9)
  - 3.3 Körper und ihre Darstellungen · *Solids and their representations* – Kurz: Schrägbilder und Netze von Pyramide und Kegel zeichnen und mit dem Körper in Beziehung setzen. · *EN: Drawing oblique views and nets of pyramids and cones and relating them to the solid.* – Simulationen: `pyramide-kegel-kugel`

### 4 Funktionaler Zusammenhang: Nicht-lineare Funktionen
*EN: Functional relationships: non-linear functions*

- Kurz (DE): Quadratische Funktionen, Potenz-, Exponential- und trigonometrische Funktionen in Sachsituationen erkennen, ihre Graphen beschreiben und den Einfluss der Parameter untersuchen.
- Kurz (EN): Recognising quadratic, power, exponential and trigonometric functions in real contexts, describing their graphs and examining the effect of parameters.
- Simulationen: `quadratische-funktion`, `extremwert-parabel`, `funktionsplotter`, `transformationen`, `umkehrfunktion`, `potenzfunktionen`, `hyperbel`, `logarithmus`, `exponentielles-wachstum`, `einheitskreis`, `sinusfunktion`
- Unterbereiche:
  - 4.1 Quadratische Funktionen · *Quadratic functions* – Kurz: Parabeln mit Symmetrie, Nullstellen und Scheitelpunkt, Verschieben und Strecken der Normalparabel, Sachsituationen (E); Umkehrung mit Wurzelfunktion (V). · *EN: Parabolas with symmetry, zeros and vertex, shifting and stretching the standard parabola, real contexts (E); inversion with the square-root function (V).* – Simulationen: `quadratische-funktion`, `extremwert-parabel` (9), `funktionsplotter`, `transformationen` (10), `umkehrfunktion` (10)
  - 4.2 Potenzfunktionen · *Power functions* – Kurz: Graphen von Potenzfunktionen mit natürlichen und ganzzahligen Exponenten mit Symmetrie, Monotonie und Asymptoten beschreiben, f(x) = a(x + b)ᶻ + c (E); Potenzgleichungen (V). · *EN: Describing graphs of power functions with natural and integer exponents by symmetry, monotonicity and asymptotes, f(x) = a(x + b)ᶻ + c (E); power equations (V).* – Simulationen: `potenzfunktionen`, `hyperbel`, `transformationen` (10)
  - 4.3 Exponentialfunktionen · *Exponential functions* – Kurz: Wachstums- und Zerfallsprozesse mit Exponentialfunktionen beschreiben, Eigenschaften der Graphen, einfache Exponentialgleichungen lösen (E); Logarithmusfunktion als Umkehrung (V). · *EN: Describing growth and decay with exponential functions, properties of the graphs, solving simple exponential equations (E); the logarithmic function as the inverse (V).* – Simulationen: `logarithmus`, `exponentielles-wachstum` (10), `umkehrfunktion` (10)
  - 4.4 Trigonometrische Funktionen · *Trigonometric functions* – Kurz: Periodische Vorgänge erkennen, Kreisbewegungen mit Sinus- und Kosinusfunktion am Einheitskreis beschreiben, Symmetrie, Nullstellen, Periode (E); im Bogenmaß (V). · *EN: Recognising periodic processes, describing circular motion with sine and cosine on the unit circle, symmetry, zeros, period (E); in radians (V).* – Simulationen: `einheitskreis`, `sinusfunktion` (10)

### 5 Funktionaler Zusammenhang: Terme und Gleichungen
*EN: Functional relationships: terms and equations*

- Kurz (DE): Lineare Gleichungssysteme mit zwei Variablen und quadratische Gleichungen grafisch und rechnerisch lösen und ihre Lösbarkeit untersuchen.
- Kurz (EN): Solving linear systems with two variables and quadratic equations graphically and algebraically and examining their solvability.
- Simulationen: `lgs-grafisch`, `parabel-drei-punkte`, `gleichungen-grafisch`, `quadratische-funktion`
- Unterbereiche:
  - 5.1 Lineare Gleichungssysteme · *Linear systems of equations* – Kurz: Systeme mit zwei Gleichungen und zwei Variablen grafisch und rechnerisch lösen, Lösbarkeit untersuchen, Sachaufgaben (E); einfache Systeme mit drei Variablen (V). · *EN: Solving systems of two equations in two variables graphically and algebraically, examining solvability, word problems (E); simple systems in three variables (V).* – Simulationen: `lgs-grafisch`, `parabel-drei-punkte`
  - 5.2 Quadratische Gleichungen · *Quadratic equations* – Kurz: Quadratische Gleichungen grafisch und mit der Lösungsformel lösen, Lösbarkeit mit der Diskriminante untersuchen (E); mit Parameter (V). · *EN: Solving quadratic equations graphically and with the quadratic formula, examining solvability with the discriminant (E); with a parameter (V).* – Simulationen: `gleichungen-grafisch` (9), `quadratische-funktion`

### 6 Daten und Zufall
*EN: Data and chance*

- Kurz (DE): Statistische Daten mit Vierfeldertafeln darstellen, Wahrscheinlichkeiten zweistufiger Zufallsexperimente mit Baumdiagramm und Pfadregeln bestimmen und Zufall simulieren.
- Kurz (EN): Showing statistical data in two-way tables, finding probabilities of two-stage experiments with tree diagrams and path rules, and simulating chance.
- Simulationen: `vierfeldertafel`, `diagramme`, `baumdiagramm`, `geburtstagsproblem`, `monte-carlo-pi`, `ziegenproblem`
- Unterbereiche:
  - 6.1 Daten · *Data* – Kurz: Statistische Daten aus Quellen entnehmen, darstellen und deuten, auch in Vierfeldertafeln. · *EN: Taking statistical data from sources, displaying and interpreting it, also in two-way tables.* – Simulationen: `vierfeldertafel`, `diagramme` (9)
  - 6.2 Zufällige Erscheinungen · *Random phenomena* – Kurz: Wahrscheinlichkeiten zweistufiger Zufallsexperimente mit Baumdiagramm und Pfadregeln bestimmen (E) und mit Simulationen ermitteln, etwa nach dem Monte-Carlo-Verfahren (V). · *EN: Finding probabilities of two-stage random experiments with tree diagrams and path rules (E) and determining them by simulation, for example with the Monte Carlo method (V).* – Simulationen: `baumdiagramm`, `geburtstagsproblem`, `monte-carlo-pi`, `ziegenproblem` (10)

## Mainzer Studienstufe (Jahrgangsstufen 11–13) – Grundfach und Leistungsfach  
*Mainz upper secondary (grades 11–13) – basic and advanced course*  
Jahrgangsstufe(n) im JSON: 11, 12, 13  
(Quelle: Lehrplan Mathematik Grund- und Leistungsfach (Stand März 2015), Grundfach S. 20–36, Leistungsfach S. 37–56)

> Mainzer Studienstufe (Jahrgangsstufen 11 bis 13): Der Lehrplan ordnet den Pflichtstoff keinen Schuljahren oder Halbjahren zu; die Lernbereiche stehen deshalb bei 11, 12 und 13 gleich und werden als eine Stufe gezeigt. GF = Grundfach, LF = Leistungsfach. In Linearer Algebra/Analytischer Geometrie (beide Fächer) und in Stochastik 2 (Grundfach) ist je eines der Wahlpflichtgebiete zu behandeln. Die Nummern sind von uns vergeben.

### GF-1 Grenzwerte (Grundfach)
*EN: Limits (basic course)*

- Kurz (DE): Zahlenfolgen explizit und rekursiv beschreiben, eine inhaltliche Vorstellung vom Grenzwert gewinnen, Grenzwertsätze anwenden und Grenzwerte bestimmen.
- Kurz (EN): Describing sequences explicitly and recursively, gaining an intuitive idea of a limit, applying limit laws and finding limits.
- Simulationen: `grenzverhalten`
- Jahrgänge je Simulation: `grenzverhalten` (11, 12)

### GF-2 Differentialrechnung (Grundfach)
*EN: Differential calculus (basic course)*

- Kurz (DE): Ableitung als Grenzwert von Sekantensteigungen und momentane Änderungsrate, Ableitungsregeln, Ableitungsgraph skizzieren, Monotonie und Extrema, ganzrationale Funktionen auch mit Parametern untersuchen und bestimmen, Extremwertaufgaben.
- Kurz (EN): The derivative as the limit of secant slopes and as the instantaneous rate of change, differentiation rules, sketching the derivative graph, monotonicity and extrema, analysing and finding polynomial functions, also with parameters, optimisation problems.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `kurvendiskussion`, `ganzrationale-funktionen`, `parabel-drei-punkte`, `extremwertprobleme`, `funktionsplotter`, `funktionenscharen`
- Jahrgänge je Simulation: `sekante-tangente` (11), `ableitungsfunktion` (11, 12), `kurvendiskussion` (11, 12), `ganzrationale-funktionen` (11), `parabel-drei-punkte` (11), `extremwertprobleme`, `funktionsplotter`, `funktionenscharen` (12, 13)

### GF-3 Integralrechnung (Grundfach)
*EN: Integral calculus (basic course)*

- Kurz (DE): Flächen mit Rechtecksummen annähern, das Integral als rekonstruierten Bestand deuten, Integrationsregeln, Hauptsatz und Stammfunktionen, Sachaufgaben bis zum Volumen von Rotationskörpern.
- Kurz (EN): Approximating areas with rectangle sums, reading the integral as a reconstructed total, integration rules, the fundamental theorem and antiderivatives, applications up to the volume of solids of revolution.
- Simulationen: `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`, `aenderungsrate`, `rotationskoerper`
- Jahrgänge je Simulation: `ober-untersummen` (12, 13), `hauptsatz` (12, 13), `stammfunktion-grafisch` (12, 13), `aenderungsrate` (12, 13), `rotationskoerper` (12, 13)

### GF-4 Exponentialfunktionen (Grundfach)
*EN: Exponential functions (basic course)*

- Kurz (DE): Die e-Funktion, f(x) = a · eᵏˣ und ihre Ableitung, ln als Umkehrung der e-Funktion sowie Sachaufgaben zu Wachstum und Zerfall.
- Kurz (EN): The natural exponential function, f(x) = a · eᵏˣ and its derivative, ln as the inverse of the exponential function, and growth and decay problems.
- Simulationen: `logarithmus`, `umkehrfunktion`, `e-funktion`
- Jahrgänge je Simulation: `logarithmus` (11, 12), `umkehrfunktion` (11, 12), `e-funktion` (12)

### GF-5 Lineare Algebra/Analytische Geometrie (Grundfach)
*EN: Linear algebra/analytic geometry (basic course)*

- Kurz (DE): Gemeinsamer Kern: lineare Gleichungssysteme aufstellen und lösen, mit Vektoren rechnen; dann eines der beiden Wahlpflichtgebiete.
- Kurz (EN): Common core: setting up and solving linear systems and calculating with vectors; then one of the two elective areas.
- Simulationen: `matrix-abbildungen`, `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`, `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - GF-5.1 Wahlpflichtgebiet A1: Matrizen in praktischen Anwendungen · *Elective A1: matrices in practical applications* – Kurz: Matrizen mit Vektoren und miteinander multiplizieren, Potenzen und Inverse, Anwendungen wie Produktionsprozesse und Übergänge; exemplarisch Matrizen als geometrische Abbildungen. · *EN: Multiplying matrices with vectors and with each other, powers and inverses, applications such as production processes and transitions; matrices as geometric transformations as an example.* – Simulationen: `matrix-abbildungen` (12, 13)
  - GF-5.2 Wahlpflichtgebiet A2: Geraden und Ebenen im Raum · *Elective A2: lines and planes in space* – Kurz: Linearkombination, Geraden und Ebenen in Parameterform, ihre gegenseitige Lage, Zeichnen im Koordinatensystem, Skalarprodukt und Normalengleichung der Ebene. · *EN: Linear combination, lines and planes in parametric form, their relative position, drawing in the coordinate system, the dot product and the normal equation of a plane.* – Simulationen: `koordinaten-3d` (11, 12), `vektoren-3d` (11, 12), `skalar-vektorprodukt` (11, 12), `geraden-ebenen`, `lage-abstaende`

### GF-6 Stochastik 1 (Grundfach)
*EN: Probability and statistics 1 (basic course)*

- Kurz (DE): Wahrscheinlichkeiten bestimmen und deuten, Pfadregeln und Unabhängigkeit, Zufallsexperimente mit Zufallszahlen simulieren, Bernoullikette und Binomialverteilung mit Erwartungswert und Standardabweichung.
- Kurz (EN): Finding and interpreting probabilities, path rules and independence, simulating random experiments with random numbers, Bernoulli chains and the binomial distribution with expected value and standard deviation.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`, `galtonbrett`, `binomialverteilung`
- Jahrgänge je Simulation: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`, `galtonbrett` (11, 12), `binomialverteilung`

### GF-7 Stochastik 2 (Grundfach)
*EN: Probability and statistics 2 (basic course)*

- Kurz (DE): Beurteilende Statistik in einem der beiden Wahlpflichtgebiete: Konfidenzintervalle oder Hypothesentests.
- Kurz (EN): Inferential statistics in one of the two elective areas: confidence intervals or hypothesis tests.
- Simulationen: `binomialverteilung`, `normalverteilung`, `signifikanztest`
- Unterbereiche:
  - GF-7.1 Wahlpflichtgebiet B1: Schätzen von Wahrscheinlichkeiten · *Elective B1: estimating probabilities* – Kurz: Binomialwahrscheinlichkeiten mit der Standard-Normalverteilung annähern, Konfidenzintervalle für eine unbekannte Wahrscheinlichkeit bestimmen und ihre Länge mit dem Stichprobenumfang vergleichen. · *EN: Approximating binomial probabilities with the standard normal distribution, finding confidence intervals for an unknown probability and relating their length to the sample size.* – Simulationen: `binomialverteilung`, `normalverteilung` (12, 13)
  - GF-7.2 Wahlpflichtgebiet B2: Testen von Hypothesen · *Elective B2: testing hypotheses* – Kurz: Das Vorgehen beim Hypothesentest verstehen, Fehlentscheidungen und ihre Wahrscheinlichkeiten bestimmen und einen Test zu einem Sachproblem entwerfen. · *EN: Understanding the procedure of a hypothesis test, finding wrong decisions and their probabilities and designing a test for a real problem.* – Simulationen: `signifikanztest` (12, 13)

### LF-1 Grenzwerte (Leistungsfach)
*EN: Limits (advanced course)*

- Kurz (DE): Folgen und Funktionen auf Monotonie und Beschränktheit untersuchen, Grenzwerte für x → ±∞ und x → x₀, Stetigkeit, Grenzwertsätze beweisen und anwenden.
- Kurz (EN): Examining sequences and functions for monotonicity and boundedness, limits as x → ±∞ and x → x₀, continuity, proving and applying limit laws.
- Simulationen: `grenzverhalten`, `polstellen-asymptoten`
- Jahrgänge je Simulation: `grenzverhalten` (11, 12), `polstellen-asymptoten` (11, 12)

### LF-2 Differentialrechnung (Leistungsfach)
*EN: Differential calculus (advanced course)*

- Kurz (DE): Wie im Grundfach, zusätzlich Differenzierbarkeit, Beweise von Ableitungsregeln und Kriterien, Ableitungsgraph in beide Richtungen und ein Iterationsverfahren zur Nullstellenbestimmung.
- Kurz (EN): As in the basic course, plus differentiability, proofs of rules and criteria, derivative graphs in both directions and an iterative method for finding zeros.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `kurvendiskussion`, `ganzrationale-funktionen`, `parabel-drei-punkte`, `extremwertprobleme`, `newton-verfahren`, `funktionsplotter`, `funktionenscharen`
- Jahrgänge je Simulation: `sekante-tangente` (11), `ableitungsfunktion` (11, 12), `kurvendiskussion` (11, 12), `ganzrationale-funktionen` (11), `parabel-drei-punkte` (11), `extremwertprobleme`, `newton-verfahren` (11, 12), `funktionsplotter`, `funktionenscharen` (12, 13)

### LF-3 Integralrechnung (Leistungsfach)
*EN: Integral calculus (advanced course)*

- Kurz (DE): Rechtecksummen und eine Definition des Integrals, Integralfunktion und Stammfunktion, Hauptsatz mit Beweis, ein numerisches Verfahren und Sachaufgaben bis zu Rotationskörpern.
- Kurz (EN): Rectangle sums and a definition of the integral, integral function and antiderivative, the fundamental theorem with proof, a numerical method and applications up to solids of revolution.
- Simulationen: `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`, `aenderungsrate`, `rotationskoerper`
- Jahrgänge je Simulation: `ober-untersummen` (12, 13), `hauptsatz` (12, 13), `stammfunktion-grafisch` (12, 13), `aenderungsrate` (12, 13), `rotationskoerper` (12, 13)

### LF-4 Weiterführung der Differential- und Integralrechnung (Leistungsfach)
*EN: Further differential and integral calculus (advanced course)*

- Kurz (DE): Produkt-, Quotienten- und Kettenregel, gebrochen-rationale Funktionen, Ableitung von Sinus, Kosinus und Tangens, e-Funktion und ln, Substitution und partielle Integration sowie Beispiele für Differentialgleichungen.
- Kurz (EN): Product, quotient and chain rules, rational functions, derivatives of sine, cosine and tangent, the exponential function and ln, substitution and integration by parts, and examples of differential equations.
- Simulationen: `polstellen-asymptoten`, `logarithmus`, `umkehrfunktion`, `e-funktion`
- Jahrgänge je Simulation: `polstellen-asymptoten` (11, 12), `logarithmus` (11, 12), `umkehrfunktion` (11, 12), `e-funktion` (12)

### LF-5 Lineare Algebra/Analytische Geometrie (Leistungsfach)
*EN: Linear algebra/analytic geometry (advanced course)*

- Kurz (DE): Gemeinsamer Kern: Gleichungssysteme mit Gauß-Verfahren, Vektoralgebra mit linearer Abhängigkeit und Skalarprodukt; dann eines der beiden Wahlpflichtgebiete.
- Kurz (EN): Common core: linear systems with Gaussian elimination, vector algebra with linear dependence and the dot product; then one of the two elective areas.
- Simulationen: `vektoren-3d`, `skalar-vektorprodukt`, `matrix-abbildungen`, `koordinaten-3d`, `geraden-ebenen`, `lage-abstaende`, `kugeln`
- Unterbereiche:
  - LF-5.1 Wahlpflichtgebiet A1: Vektoren und Matrizen · *Elective A1: vectors and matrices* – Kurz: Vektoralgebra und Skalarprodukt, Matrizenoperationen, affine Abbildungen mit Fixelementen und Invarianten, Kongruenz- und Ähnlichkeitsabbildungen sowie nichtgeometrische Anwendungen von Matrizen. · *EN: Vector algebra and the dot product, matrix operations, affine transformations with fixed elements and invariants, congruence and similarity transformations, and non-geometric applications of matrices.* – Simulationen: `vektoren-3d` (11, 12), `skalar-vektorprodukt` (11, 12), `matrix-abbildungen` (12, 13)
  - LF-5.2 Wahlpflichtgebiet A2: Geraden und Ebenen im Raum · *Elective A2: lines and planes in space* – Kurz: Geraden und Ebenen in Parameter- und Normalenform, Lagebeziehungen mit Begründung, Hessesche Normalenform, Winkel und Abstände, Kreis- und Kugelgleichung sowie Vektorprodukt. · *EN: Lines and planes in parametric and normal form, relative positions with justification, the Hesse normal form, angles and distances, equations of circles and spheres, and the cross product.* – Simulationen: `koordinaten-3d` (11, 12), `vektoren-3d` (11, 12), `skalar-vektorprodukt` (11, 12), `geraden-ebenen`, `lage-abstaende`, `kugeln` (13)

### LF-6 Stochastik (Leistungsfach)
*EN: Probability and statistics (advanced course)*

- Kurz (DE): Rechenregeln und Simulationen, bedingte Wahrscheinlichkeit und Unabhängigkeit, Zufallsgrößen mit Erwartungswert und Streuung, Binomialverteilung, Näherung durch die Normalverteilung, Konfidenzintervalle und Hypothesentests.
- Kurz (EN): Rules and simulations, conditional probability and independence, random variables with expected value and spread, the binomial distribution, approximation by the normal distribution, confidence intervals and hypothesis tests.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `geburtstagsproblem`, `galtonbrett`, `binomialverteilung`, `normalverteilung`, `signifikanztest`
- Jahrgänge je Simulation: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem` (11, 12), `geburtstagsproblem`, `galtonbrett` (11, 12), `binomialverteilung`, `normalverteilung` (12, 13), `signifikanztest` (12, 13)

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `rheinland-pfalz-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/rheinland-pfalz-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `taylor-polynome` | nicht im Lehrplan (Hochschule); das Leistungsfach deutet die Ableitung nur als lineare Näherung (Kompetenz 4.13e) |
| `fourier-reihen` | nicht im Lehrplan (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **5/6:** 6 Funktionaler Zusammenhang – wird laut Lehrplan in der Orientierungsstufe nicht eigens unterrichtet, sondern steckt in den anderen Leitideen; der Lernbereich steht nur zur Orientierung da.

Alle anderen Lern- und Unterbereiche haben mindestens eine Simulation. Schwach abgedeckt sind die Zinsrechnung (7/8 1.1, nur `prozentstreifen`), die Kongruenzabbildungen mit Drehung und Verschiebung (7/8 4.3, nur `spiegelung`), Formeln mit Parametern (7/8 6.2) und die Folgen und Rekursionen in GF-1 und LF-1 (nur `grenzverhalten`).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Drehen und Verschieben | Figur im Koordinatensystem drehen und verschieben, Bestimmungsstücke ablesen, zwei Spiegelungen verketten | 7/8 4.3 |
| Zahlenfolgen und Grenzwert | Folgenglieder explizit und rekursiv berechnen, im Diagramm zeigen, ε-Streifen ziehen | GF-1, LF-1 |
| Zinseszins und Sparpläne | Kapital, Zinssatz und Laufzeit ändern, Zinsen pro Jahr als Säulen | 7/8 1.1 |

# Teil E – Einordnung und Unklarheiten

1. **Zwei Lehrpläne, G9.** Für die Sekundarstufe I gilt der Rahmenlehrplan von 2007 für alle Schularten; er ist in die Doppelklassenstufen 5/6 (Orientierungsstufe), 7/8 und 9/10 gegliedert. Für die Mainzer Studienstufe (11–13) gilt der Lehrplan Grund- und Leistungsfach in der Anpassung an die Bildungsstandards (Stand März 2015). Abitur nach Jahrgangsstufe 13.
2. **Teil „Klassenstufe 9 (Qualifikation der Berufsreife)“ nicht abgebildet.** Der Rahmenlehrplan hat dafür einen eigenen Teil (Kap. 8) für Lernende, die nach Klasse 9 abgehen. Am Gymnasium gilt Kap. 9 (Klassenstufen 9 und 10, Mittlerer Schulabschluss).
3. **B, E und V.** In 7/8 und 9/10 sind die Inhalte als Basis (B), Erweiterung (E) und Vertiefung (V) gekennzeichnet; V ist für den Übergang in die gymnasiale Oberstufe gedacht. Für das Gymnasium sind deshalb alle drei abgebildet; in den Kurzbeschreibungen steht die Kennzeichnung in Klammern. Die Addita (+) der Orientierungsstufe sind nicht verbindlich und nur in den Kurzbeschreibungen erwähnt.
4. **Doppelklassenstufen aus dem Lehrplan.** 5/6, 7/8 und 9/10 beschreibt der Rahmenlehrplan jeweils gemeinsam und ausdrücklich ohne Reihenfolge. Sie stehen deshalb mit gleichen Lernbereichen bei beiden Jahrgängen; eine Simulation steht nur bei den Jahrgängen, die in ihre Klassenstufen fallen.
5. **Oberstufe als eine Stufe 11–13.** Der Oberstufenlehrplan sagt: „Eine Zuordnung des Pflichtstoffs zu Schuljahren oder Halbjahren erfolgt nicht.“ Die Lernbereiche stehen deshalb bei 11, 12 und 13 gleich; die Seite zeigt sie als Stufe „11–13“. Grundfach (GF-…) und Leistungsfach (LF-…) stehen nebeneinander. Die „Wiederholung von Grundlagen“ zu Beginn von 11 ist nicht abgebildet, weil sie nur bei Bedarf vorgesehen ist.
6. **Nummern selbst vergeben.** Unterhalb der Leitideen nummeriert der Rahmenlehrplan nicht; die Nummern folgen der Reihenfolge im Lehrplan (Inhaltsbereich.Abschnitt). Weil die Leitidee L1 in der Orientierungsstufe und in 7/8 mehrere Inhaltsbereiche hat, sind die Lernbereiche fortlaufend nummeriert und nicht nach L1–L5. In der Oberstufe sind die Themenbereiche mit GF-/LF- und fortlaufender Nummer versehen, die Wahlpflichtgebiete als Unterbereiche.
7. **`sourceUrl`.** Kein Dokument nennt einen Link zur Datei. Der Oberstufenlehrplan nennt „www.mbwwk.rlp.de“ (Ministerium für Bildung, Wissenschaft, Weiterbildung und Kultur); das Ministerium heißt heute Ministerium für Bildung. Verwendet ist dessen Startseite `https://bm.rlp.de/` (so nennt sie auch der Physik-Oberstufenlehrplan von 2022). Erreichbarkeit hier nicht geprüft.
8. **Erweiterte Klassenstufen:** keine. Alle Zuordnungen passen zu den bestehenden Klassenstufen der Simulationen.
9. **Bewusst nicht zugeordnet:**
   - `bedingte-wahrscheinlichkeit` nicht in 9/10: Der Rahmenlehrplan sagt ausdrücklich, dass Formalisierungen wie bedingte Wahrscheinlichkeit oder Satz von Bayes der Oberstufe des Gymnasiums vorbehalten bleiben.
   - `exponentielles-wachstum` (10–10) nicht in der Oberstufe: Sie steht schon in 9/10 4.3; die Oberstufe behandelt Wachstum mit der e-Funktion.
   - `galtonbrett` nicht in 9/10: Dort gibt es nur zweistufige Zufallsexperimente; die Bernoullikette folgt in der Oberstufe.
10. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
    - `bedingte-wahrscheinlichkeit` und `vierfeldertafel` bei GF-6 Stochastik 1: Das Grundfach nennt bedingte Wahrscheinlichkeit nicht als eigenes Ziel, verweist aber bei den Zielen auf die Kompetenz 5.02g („Baumdiagramme oder Vierfeldertafeln … im Kontext bedingter Wahrscheinlichkeiten“).
    - `geburtstagsproblem` und `ziegenproblem` bei 9/10 6.2: Beide nennt der Lehrplan nur in der Hinweisspalte als Beispiele.
    - `monte-carlo-pi` bei 9/10 6.2: Der Lehrplan nennt in der Hinweisspalte zur Vertiefung „Monte-Carlo-Verfahren, z. B. zur Annäherung von π“.
    - `sinussatz-kosinussatz` bei 9/10 2.2: Sinus- oder Kosinussatz „können … exemplarisch erarbeitet“ werden (Hinweisspalte), sind also nicht verpflichtend.
    - `cavalieri` bei 9/10 2.4: Der Satz von Cavalieri steht als Beispiel („z. B. mithilfe des Satzes von Cavalieri“) für die Herleitung des Pyramidenvolumens.
    - `parabel-drei-punkte` bei 9/10 5.1 (Gleichungssysteme mit drei Variablen, V) und bei GF-2/LF-2 (Funktionsgleichungen aus vorgegebenen Eigenschaften bestimmen).
    - `rotationskoerper` bei GF-3: Im Grundfach steht das Volumen von Rotationskörpern nur in der Beispielliste der Hinweise; im Leistungsfach ist es Ziel.
    - `matrix-abbildungen` bei GF-5.1 und LF-5.1: nur im jeweiligen Wahlpflichtgebiet A1.
    - `kugeln` bei LF-5.2: Kreis- und Kugelgleichung stehen nur im Leistungsfach, Wahlpflichtgebiet A2.
    - `funktionsplotter` bei 7/8 5.2, 9/10 4.1, GF-2 und LF-2: Der Lehrplan empfiehlt an diesen Stellen Funktionsplotter.
