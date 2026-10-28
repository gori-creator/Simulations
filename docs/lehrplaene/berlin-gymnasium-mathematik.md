# Berlin · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I (Rahmenlehrplan 1–10) und gymnasiale Oberstufe |
|---|---|
| Bundesland | Berlin (der Rahmenlehrplan 1–10 gilt gemeinsam für Berlin und Brandenburg) |
| Schulart | Gymnasium, Jahrgangsstufen 5–12 (5 und 6 nur an Gymnasien, die mit Klasse 5 beginnen) |
| Fach | Mathematik |
| Name des Lehrplans (Sek. I) | „Rahmenlehrplan für die Jahrgangsstufen 1–10, Teil C Mathematik“, erarbeitet vom LISUM, Herausgeber: Senatsverwaltung für Bildung, Jugend und Familie Berlin und Ministerium für Bildung, Jugend und Sport des Landes Brandenburg |
| Jahr / Stand (Sek. I) | Berlin, Potsdam 2023; in Berlin gültig ab 1. August 2024 (beginnend mit 1–3 und 7/8), ab dem Schuljahr 2025/26 für alle Jahrgangsstufen 1–10 |
| Name des Lehrplans (Oberstufe) | „Rahmenlehrplan für die gymnasiale Oberstufe, Teil C Mathematik“ (LISUM) mit dem Blatt „Inkraftsetzung der Teile A und B – Fach Mathematik“ (2022; fachliche Vorgaben unverändert) |
| Jahr / Stand (Oberstufe) | gültig ab 1. August 2014 (Qualifikationsphase ab 2015/16); Teile A und B 2021/2022 |
| Dateien (von der Projektleitung geliefert, nicht im Repository) | `sek_1_berlin_mathematik.pdf` (66 Seiten) und `rahmenlehrplan-mathematik_go-teil-c.pdf` (42 Seiten) |
| Link laut Dokument | nur die Lizenz (creativecommons.org); in `sourceUrl` die Startseite des Bildungsservers Berlin-Brandenburg `https://bildungsserver.berlin-brandenburg.de/` (Vermerk im Pull Request) |
| G8/G9 | G8 am Gymnasium: Abitur nach Jahrgangsstufe 12; Jahrgangsstufe 10 erreicht Niveaustufe H (Eingangsvoraussetzung der Qualifikationsphase), Qualifikationsphase 11/12 (Q1–Q4). Die Einführungsphase des Oberstufenlehrplans gilt für dreijährige Oberstufen (ISS, Gemeinschaftsschule) und ist nicht abgebildet |
| Niveaus / Wahl | Sek. I: Niveaustufen A–H, kumulativ; Gymnasium 7 = E, 8 = F, 9 = G, 10 = H; Jahrgangsstufe 5 = C–D, 6 = D (in Teilen E). Oberstufe: Grund- und Leistungskurs (LK-Inhalte zusätzlich), Zusatzkurse als Angebot der Schule |
| Struktur | Sek. I: fünf Themenbereiche mit je zwei Themen, Inhalte je Niveaustufe (Kap. 3.1–3.5). Oberstufe: Standards nach Leitideen mit Zuordnung zu Kurshalbjahren (Kap. 3.2.2), Inhalte der Kurshalbjahre Q1–Q4 (Kap. 4), Zusatzkurse ma-Z1 bis ma-Z11 (Kap. 5.2) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Bereiche mit Simulation (Unterbereiche bzw. Lernbereiche ohne Unterbereiche) | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Jahrgangsstufe 5 (Niveaustufen C–D) | 5 | 5 | 10 | 8 | 15 |
| Jahrgangsstufe 6 (Niveaustufe D, in Teilen E) | 6 | 5 | 10 | 9 | 15 |
| Jahrgangsstufe 7 (Niveaustufe E) | 7 | 5 | 10 | 10 | 24 |
| Jahrgangsstufe 8 (Niveaustufe F) | 8 | 5 | 10 | 8 | 18 |
| Jahrgangsstufe 9 (Niveaustufe G) | 9 | 5 | 10 | 9 | 19 |
| Jahrgangsstufe 10 (Niveaustufe H) | 10 | 5 | 10 | 7 | 22 |
| Qualifikationsphase Q1/Q2 (Jahrgangsstufe 11) | 11 | 2 | 4 | 4 | 23 |
| Qualifikationsphase Q3/Q4 (Jahrgangsstufe 12) und Zusatzkurse | 12 | 3 | 5 | 5 | 14 |

Insgesamt verwendet: **88 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `strahlensaetze`, `newton-verfahren`, `fourier-reihen`, `kugeln`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Jahrgangsstufe 5 (Niveaustufen C–D)  
*Grade 5 (levels C–D)*  
Jahrgangsstufe(n) im JSON: 5  
(Quelle: Rahmenlehrplan 1–10, Teil C Mathematik (2023), Kap. 2, S. 14, und Kap. 3.1–3.5, S. 38–65)

> Jahrgangsstufe 5: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; für weiterführende Schulen mit den Jahrgangsstufen 5 und 6 gilt in Jahrgangsstufe 5 die Niveaustufe C–D. In Berlin beginnt das Gymnasium meist mit Klasse 7; grundständige Gymnasien beginnen mit 5. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Zahlen und Operationen (Niveaustufen C–D)
*EN: Numbers and operations (levels C–D)*

- Simulationen: `stellenwerte`, `primfaktoren`, `bruchteile`, `brueche-vergleichen`, `termbaum`
- Unterbereiche:
  - 1.1 Zahlvorstellungen · *Understanding numbers* – Kurz: Große natürliche Zahlen in der Stellenwerttafel, Teilbarkeitsregeln, Primzahlen, Vielfache und Teiler; Brüche als Anteile, erweitern, kürzen, vergleichen und am Zahlenstrahl ordnen; Dezimalzahlen. · *EN: Large natural numbers in the place-value chart, divisibility rules, primes, multiples and divisors; fractions as parts, expanding, simplifying, comparing and ordering them on the number line; decimals.* – Simulationen: `stellenwerte`, `primfaktoren`, `bruchteile`, `brueche-vergleichen`
  - 1.2 Operationsvorstellungen und Rechenstrategien · *Understanding operations and calculation strategies* – Kurz: Grundrechenarten mit gebrochenen Zahlen verstehen und ausführen, Brüche als Operator, Punkt-vor-Strich und Klammern, schriftliche Verfahren und Überschlag. · *EN: Understanding and carrying out the four operations with fractions, fractions as operators, order of operations and brackets, written methods and estimating.* – Simulationen: `termbaum`

### 2 Größen und Messen (Niveaustufen C–D)
*EN: Quantities and measurement (levels C–D)*

- Simulationen: `einheiten`, `winkel-messen`, `umfang-flaeche`, `quader-volumen`
- Unterbereiche:
  - 2.1 Größenvorstellungen und Messen · *Understanding quantities and measuring* – Kurz: Längen, Flächen, Volumen und Winkel unterscheiden, messen und schätzen, Einheiten umwandeln und Größen in Dezimalschreibweise angeben. · *EN: Distinguishing, measuring and estimating lengths, areas, volumes and angles, converting units and giving quantities as decimals.* – Simulationen: `einheiten`, `winkel-messen`
  - 2.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Umfang von Vielecken, Flächeninhalt von Rechtecken und Volumen von Quadern berechnen, auch zusammengesetzt; Größen in Sachaufgaben. · *EN: Calculating the perimeter of polygons, the area of rectangles and the volume of cuboids, also composite ones; quantities in word problems.* – Simulationen: `umfang-flaeche`, `quader-volumen`

### 3 Raum und Form (Niveaustufen C–D)
*EN: Space and shape (levels C–D)*

- Simulationen: `koordinaten-lage`, `vierecke`, `winkel-geradenkreuzung`, `koerpernetze`, `spiegelung`
- Unterbereiche:
  - 3.1 Geometrische Objekte · *Geometric objects* – Kurz: Körper, Winkel und Dreiecke beschreiben, Vierecke und ihre Beziehungen („Haus der Vierecke“), Winkel an geschnittenen Geraden, Körpernetze, Zeichnen im Koordinatensystem. · *EN: Describing solids, angles and triangles, quadrilaterals and how they relate (“house of quadrilaterals”), angles at intersecting lines, nets, drawing in the coordinate system.* – Simulationen: `koordinaten-lage`, `vierecke`, `winkel-geradenkreuzung`, `koerpernetze`
  - 3.2 Geometrische Abbildungen · *Geometric transformations* – Kurz: Kongruente Figuren erkennen, Spiegelungen und Verschiebungen zeichnen, Parkette herstellen. · *EN: Recognising congruent figures, drawing reflections and translations, making tessellations.* – Simulationen: `spiegelung`

### 4 Gleichungen und Funktionen (Niveaustufen C–D)
*EN: Equations and functions (levels C–D)*

- Simulationen: `termbaum`
- Unterbereiche:
  - 4.1 Terme und Gleichungen · *Terms and equations* – Kurz: Sachverhalte durch Zahlenterme und Gleichungen darstellen, Variablen als Platzhalter, Rechengesetze nutzen und einfache Gleichungen mit der Umkehroperation lösen. · *EN: Representing situations by numerical terms and equations, variables as placeholders, using the laws of arithmetic and solving simple equations with the inverse operation.* – Simulationen: `termbaum`
  - 4.2 Zuordnungen und Funktionen · *Relationships and functions* – Kurz: Direkt proportionale Zuordnungen beschreiben, in Tabelle, Text und Koordinatensystem darstellen und mit dem Dreisatz rechnen. · *EN: Describing direct proportion, showing it in tables, words and the coordinate system and using the rule of three.* – Simulationen: –

### 5 Daten und Zufall (Niveaustufen C–D)
*EN: Data and chance (levels C–D)*

- Simulationen: `zaehlprinzip`
- Unterbereiche:
  - 5.1 Daten · *Data* – Kurz: Messwerte erfassen und in Tabellen und Diagrammen darstellen, Minimum, Maximum und Spannweite ermitteln. · *EN: Recording measurements and showing them in tables and charts, finding minimum, maximum and range.* – Simulationen: –
  - 5.2 Zählstrategien und Wahrscheinlichkeiten · *Counting strategies and probabilities* – Kurz: Kombinatorische Fragen systematisch lösen, relative Häufigkeiten bei einstufigen Zufallsexperimenten als Bruch angeben. · *EN: Solving counting problems systematically, giving relative frequencies of single-stage experiments as fractions.* – Simulationen: `zaehlprinzip`

## Jahrgangsstufe 6 (Niveaustufe D, in Teilen E)  
*Grade 6 (level D, partly E)*  
Jahrgangsstufe(n) im JSON: 6  
(Quelle: Rahmenlehrplan 1–10, Teil C Mathematik (2023), Kap. 2, S. 14, und Kap. 3.1–3.5, S. 38–65)

> Jahrgangsstufe 6: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; in Jahrgangsstufe 6 gilt die Niveaustufe D, in Teilen E. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Zahlen und Operationen (Niveaustufe D, in Teilen E)
*EN: Numbers and operations (level D, partly E)*

- Simulationen: `primfaktoren`, `bruchteile`, `brueche-vergleichen`, `dezimalbrueche`, `brueche-rechnen`, `termbaum`
- Unterbereiche:
  - 1.1 Zahlvorstellungen · *Understanding numbers* – Kurz: Große natürliche Zahlen in der Stellenwerttafel, Teilbarkeitsregeln, Primzahlen, Vielfache und Teiler; Brüche als Anteile, erweitern, kürzen, vergleichen und am Zahlenstrahl ordnen; Dezimalzahlen. · *EN: Large natural numbers in the place-value chart, divisibility rules, primes, multiples and divisors; fractions as parts, expanding, simplifying, comparing and ordering them on the number line; decimals.* – Simulationen: `primfaktoren`, `bruchteile`, `brueche-vergleichen`, `dezimalbrueche`
  - 1.2 Operationsvorstellungen und Rechenstrategien · *Understanding operations and calculation strategies* – Kurz: Grundrechenarten mit gebrochenen Zahlen verstehen und ausführen, Brüche als Operator, Punkt-vor-Strich und Klammern, schriftliche Verfahren und Überschlag. · *EN: Understanding and carrying out the four operations with fractions, fractions as operators, order of operations and brackets, written methods and estimating.* – Simulationen: `brueche-rechnen`, `termbaum`

### 2 Größen und Messen (Niveaustufe D, in Teilen E)
*EN: Quantities and measurement (level D, partly E)*

- Simulationen: `quader-volumen`
- Unterbereiche:
  - 2.1 Größenvorstellungen und Messen · *Understanding quantities and measuring* – Kurz: Längen, Flächen, Volumen und Winkel unterscheiden, messen und schätzen, Einheiten umwandeln und Größen in Dezimalschreibweise angeben. · *EN: Distinguishing, measuring and estimating lengths, areas, volumes and angles, converting units and giving quantities as decimals.* – Simulationen: –
  - 2.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Umfang von Vielecken, Flächeninhalt von Rechtecken und Volumen von Quadern berechnen, auch zusammengesetzt; Größen in Sachaufgaben. · *EN: Calculating the perimeter of polygons, the area of rectangles and the volume of cuboids, also composite ones; quantities in word problems.* – Simulationen: `quader-volumen`

### 3 Raum und Form (Niveaustufe D, in Teilen E)
*EN: Space and shape (level D, partly E)*

- Simulationen: `vierecke`, `winkel-geradenkreuzung`, `koerpernetze`, `spiegelung`
- Unterbereiche:
  - 3.1 Geometrische Objekte · *Geometric objects* – Kurz: Körper, Winkel und Dreiecke beschreiben, Vierecke und ihre Beziehungen („Haus der Vierecke“), Winkel an geschnittenen Geraden, Körpernetze, Zeichnen im Koordinatensystem. · *EN: Describing solids, angles and triangles, quadrilaterals and how they relate (“house of quadrilaterals”), angles at intersecting lines, nets, drawing in the coordinate system.* – Simulationen: `vierecke`, `winkel-geradenkreuzung`, `koerpernetze`
  - 3.2 Geometrische Abbildungen · *Geometric transformations* – Kurz: Kongruente Figuren erkennen, Spiegelungen und Verschiebungen zeichnen, Parkette herstellen. · *EN: Recognising congruent figures, drawing reflections and translations, making tessellations.* – Simulationen: `spiegelung`

### 4 Gleichungen und Funktionen (Niveaustufe D, in Teilen E)
*EN: Equations and functions (level D, partly E)*

- Simulationen: `termbaum`, `proportional`, `funktion-zuordnung`
- Unterbereiche:
  - 4.1 Terme und Gleichungen · *Terms and equations* – Kurz: Sachverhalte durch Zahlenterme und Gleichungen darstellen, Variablen als Platzhalter, Rechengesetze nutzen und einfache Gleichungen mit der Umkehroperation lösen. · *EN: Representing situations by numerical terms and equations, variables as placeholders, using the laws of arithmetic and solving simple equations with the inverse operation.* – Simulationen: `termbaum`
  - 4.2 Zuordnungen und Funktionen · *Relationships and functions* – Kurz: Direkt proportionale Zuordnungen beschreiben, in Tabelle, Text und Koordinatensystem darstellen und mit dem Dreisatz rechnen. · *EN: Describing direct proportion, showing it in tables, words and the coordinate system and using the rule of three.* – Simulationen: `proportional`, `funktion-zuordnung`

### 5 Daten und Zufall (Niveaustufe D, in Teilen E)
*EN: Data and chance (level D, partly E)*

- Simulationen: `diagramme`, `zaehlprinzip`
- Unterbereiche:
  - 5.1 Daten · *Data* – Kurz: Messwerte erfassen und in Tabellen und Diagrammen darstellen, Minimum, Maximum und Spannweite ermitteln. · *EN: Recording measurements and showing them in tables and charts, finding minimum, maximum and range.* – Simulationen: `diagramme`
  - 5.2 Zählstrategien und Wahrscheinlichkeiten · *Counting strategies and probabilities* – Kurz: Kombinatorische Fragen systematisch lösen, relative Häufigkeiten bei einstufigen Zufallsexperimenten als Bruch angeben. · *EN: Solving counting problems systematically, giving relative frequencies of single-stage experiments as fractions.* – Simulationen: `zaehlprinzip`

## Jahrgangsstufe 7 (Niveaustufe E)  
*Grade 7 (level E)*  
Jahrgangsstufe(n) im JSON: 7  
(Quelle: Rahmenlehrplan 1–10, Teil C Mathematik (2023), Kap. 2, S. 15, und Kap. 3.1–3.5, S. 38–65)

> Jahrgangsstufe 7: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; für das Gymnasium gilt in Jahrgangsstufe 7 die Niveaustufe E; E und F sind in 7/8 zu verzahnen. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Zahlen und Operationen (Niveaustufe E)
*EN: Numbers and operations (level E)*

- Simulationen: `zahlengerade`, `prozentstreifen`, `termbaum`
- Unterbereiche:
  - 1.1 Zahlvorstellungen · *Understanding numbers* – Kurz: Prozente als Darstellung gebrochener Zahlen, negative Zahlen und rationale Zahlen an der Zahlengeraden, Betrag und Gegenzahl, periodische Dezimalzahlen. · *EN: Percentages as another way of writing fractions, negative and rational numbers on the number line, absolute value and opposite, recurring decimals.* – Simulationen: `zahlengerade`, `prozentstreifen`
  - 1.2 Operationsvorstellungen und Rechenstrategien · *Understanding operations and calculation strategies* – Kurz: Grundrechenarten mit rationalen Zahlen als Zustandsänderung deuten, Prozentrechnung mit Prozentstreifen, Dreisatz und Verhältnisgleichungen. · *EN: Interpreting the four operations with rational numbers as changes of state, percentages with the percentage bar, rule of three and proportions.* – Simulationen: `zahlengerade`, `prozentstreifen`, `termbaum`

### 2 Größen und Messen (Niveaustufe E)
*EN: Quantities and measurement (level E)*

- Simulationen: `massstab`, `flaechen-zerlegen`, `kreiszahl-pi`, `prisma-zylinder`, `pythagoras`
- Unterbereiche:
  - 2.1 Größenvorstellungen und Messen · *Understanding quantities and measuring* – Kurz: Größen und Einheiten, auch a, ha und km², umwandeln, Maße aus Skizzen und Zeichnungen mit Maßstab entnehmen und Messungen durchführen. · *EN: Converting quantities and units, including ares, hectares and km², taking measurements from sketches and scale drawings and measuring.* – Simulationen: `massstab`
  - 2.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Umfang und Flächeninhalt von Dreiecken, Vierecken und Kreisen durch Zerlegen und Ergänzen, Volumen und Oberfläche von Prismen und Zylindern, Satz des Pythagoras. · *EN: Perimeter and area of triangles, quadrilaterals and circles by dissection and completion, volume and surface area of prisms and cylinders, Pythagoras’ theorem.* – Simulationen: `flaechen-zerlegen`, `kreiszahl-pi`, `prisma-zylinder`, `pythagoras`, `massstab`

### 3 Raum und Form (Niveaustufe E)
*EN: Space and shape (level E)*

- Simulationen: `winkelsumme`, `besondere-linien`, `mittelsenkrechte`, `thales`, `dreieckskonstruktion`, `winkel-geradenkreuzung`, `vierecke`, `koerpernetze`, `spiegelung`
- Unterbereiche:
  - 3.1 Geometrische Objekte · *Geometric objects* – Kurz: Dreiecksarten und besondere Linien, Innenwinkelsumme, Sätze von Thales und Pythagoras, Netze und Schrägbilder von Prismen und Zylindern, Konstruktionen nach den Kongruenzsätzen. · *EN: Types of triangle and special lines, angle sum, the theorems of Thales and Pythagoras, nets and oblique drawings of prisms and cylinders, constructions using the congruence criteria.* – Simulationen: `winkelsumme`, `besondere-linien`, `mittelsenkrechte`, `thales`, `dreieckskonstruktion`, `winkel-geradenkreuzung`, `vierecke`, `koerpernetze`
  - 3.2 Geometrische Abbildungen · *Geometric transformations* – Kurz: Kongruente und ähnliche Figuren erkennen, Eigenschaften von Kongruenz- und Ähnlichkeitsabbildungen beschreiben, maßstäblich vergrößern und verkleinern. · *EN: Recognising congruent and similar figures, describing congruence and similarity transformations, enlarging and reducing to scale.* – Simulationen: `spiegelung`

### 4 Gleichungen und Funktionen (Niveaustufe E)
*EN: Equations and functions (level E)*

- Simulationen: `waagemodell`, `termbaum`, `proportional`, `funktion-zuordnung`
- Unterbereiche:
  - 4.1 Terme und Gleichungen · *Terms and equations* – Kurz: Terme, lineare Gleichungen und Verhältnisgleichungen aufstellen und durch Probieren, grafisch und mit Äquivalenzumformungen lösen; Formeln umstellen. · *EN: Setting up terms, linear equations and proportions and solving them by trial, graphically and by equivalent transformations; rearranging formulas.* – Simulationen: `waagemodell`, `termbaum`
  - 4.2 Zuordnungen und Funktionen · *Relationships and functions* – Kurz: Direkt und indirekt proportionale Zuordnungen unterscheiden und in allen vier Quadranten darstellen, auch bei Maßstab und Prozentrechnung. · *EN: Distinguishing direct and inverse proportion and showing them in all four quadrants, also with scales and percentages.* – Simulationen: `proportional`, `funktion-zuordnung`

### 5 Daten und Zufall (Niveaustufe E)
*EN: Data and chance (level E)*

- Simulationen: `boxplot`, `diagramme`, `gesetz-grosse-zahlen`, `zaehlprinzip`
- Unterbereiche:
  - 5.1 Daten · *Data* – Kurz: Erhebungen planen, Daten auch in Kreisdiagrammen darstellen, arithmetisches Mittel, Modalwert und Median vergleichen. · *EN: Planning surveys, showing data in pie charts too, comparing mean, mode and median.* – Simulationen: `boxplot`, `diagramme`
  - 5.2 Zählstrategien und Wahrscheinlichkeiten · *Counting strategies and probabilities* – Kurz: Ergebnismenge und Ereignisse, relative Häufigkeiten auch zweistufiger Experimente, Gesetz der großen Zahlen und Laplace-Regel. · *EN: Sample spaces and events, relative frequencies also of two-stage experiments, the law of large numbers and the Laplace rule.* – Simulationen: `gesetz-grosse-zahlen`, `zaehlprinzip`

## Jahrgangsstufe 8 (Niveaustufe F)  
*Grade 8 (level F)*  
Jahrgangsstufe(n) im JSON: 8  
(Quelle: Rahmenlehrplan 1–10, Teil C Mathematik (2023), Kap. 2, S. 15, und Kap. 3.1–3.5, S. 38–65)

> Jahrgangsstufe 8: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; für das Gymnasium gilt in Jahrgangsstufe 8 die Niveaustufe F; Vorgriffe auf G und H sind möglich. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Zahlen und Operationen (Niveaustufe F)
*EN: Numbers and operations (level F)*

- Simulationen: `zehnerpotenzen`, `quadratwurzel`
- Unterbereiche:
  - 1.1 Zahlvorstellungen · *Understanding numbers* – Kurz: Potenzen und Zehnerpotenzen mit natürlichem Exponenten, rationale Zahlen ordnen und runden. · *EN: Powers and powers of ten with natural exponents, ordering and rounding rational numbers.* – Simulationen: `zehnerpotenzen`
  - 1.2 Operationsvorstellungen und Rechenstrategien · *Understanding operations and calculation strategies* – Kurz: Potenzen als fortgesetzte Multiplikation, Quadrat- und Kubikwurzel als Umkehrung, Prozentrechnung mit Rabatt und Zinsen. · *EN: Powers as repeated multiplication, square and cube roots as inverses, percentages with discounts and interest.* – Simulationen: `quadratwurzel`, `zehnerpotenzen`

### 2 Größen und Messen (Niveaustufe F)
*EN: Quantities and measurement (level F)*

- Simulationen: `flaechen-zerlegen`, `prisma-zylinder`, `pyramide-kegel-kugel`, `kreiszahl-pi`
- Unterbereiche:
  - 2.1 Größenvorstellungen und Messen · *Understanding quantities and measuring* – Kurz: Einheitenvorsätze von Milli bis Kilo mit Zehnerpotenzen, Größen in berufsorientierten Kontexten. · *EN: Unit prefixes from milli to kilo with powers of ten, quantities in work-related contexts.* – Simulationen: –
  - 2.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Flächeninhalt zusammengesetzter Figuren, Volumen und Oberfläche von Körpern auch mit quadratischen Pyramiden, zusammengesetzte Körper. · *EN: Area of composite figures, volume and surface area of solids including square pyramids, composite solids.* – Simulationen: `flaechen-zerlegen`, `prisma-zylinder`, `pyramide-kegel-kugel`, `kreiszahl-pi`

### 3 Raum und Form (Niveaustufe F)
*EN: Space and shape (level F)*

- Simulationen: `koerpernetze`, `pyramide-kegel-kugel`
- Unterbereiche:
  - 3.1 Geometrische Objekte · *Geometric objects* – Kurz: Teilkörper und Teilflächen beschreiben, Lage- und Größenbeziehungen für Berechnungen nutzen, Netze und Schrägbilder auch von Pyramiden. · *EN: Describing parts of solids and figures, using position and size relations for calculations, nets and oblique drawings also of pyramids.* – Simulationen: `koerpernetze`, `pyramide-kegel-kugel`
  - 3.2 Geometrische Abbildungen · *Geometric transformations* – Kurz: Abbildungen in Sachaufgaben anwenden und mit Geometriesoftware konstruieren. · *EN: Applying transformations in word problems and constructing them with geometry software.* – Simulationen: –

### 4 Gleichungen und Funktionen (Niveaustufe F)
*EN: Equations and functions (level F)*

- Simulationen: `binomische-formeln`, `lgs-grafisch`, `gleichungen-grafisch`, `lineare-funktion`, `funktion-zuordnung`, `funktionsplotter`
- Unterbereiche:
  - 4.1 Terme und Gleichungen · *Terms and equations* – Kurz: Terme mit dem Distributivgesetz umformen, lineare Gleichungen mit Klammern und lineare Gleichungssysteme mit zwei Variablen grafisch und durch Probieren lösen. · *EN: Transforming terms with the distributive law, solving linear equations with brackets and linear systems in two variables graphically and by trial.* – Simulationen: `binomische-formeln`, `lgs-grafisch`, `gleichungen-grafisch`
  - 4.2 Zuordnungen und Funktionen · *Relationships and functions* – Kurz: Lineare Funktionen y = ax + b mit Steigung, Änderungsrate, Nullstelle und y-Achsenabschnitt, Einfluss der Parameter. · *EN: Linear functions y = ax + b with slope, rate of change, zero and y-intercept, the effect of the parameters.* – Simulationen: `lineare-funktion`, `funktion-zuordnung`, `funktionsplotter`

### 5 Daten und Zufall (Niveaustufe F)
*EN: Data and chance (level F)*

- Simulationen: `boxplot`, `diagramme`, `zaehlprinzip`, `gesetz-grosse-zahlen`, `baumdiagramm`
- Unterbereiche:
  - 5.1 Daten · *Data* – Kurz: Stichproben und Merkmale wählen, Daten in Klassen, Boxplots und Histogrammen darstellen und vergleichen. · *EN: Choosing samples and variables, showing data in classes, box plots and histograms and comparing them.* – Simulationen: `boxplot`, `diagramme`
  - 5.2 Zählstrategien und Wahrscheinlichkeiten · *Counting strategies and probabilities* – Kurz: Kombinatorische Fragen und Zufallsexperimente vertiefen. · *EN: Deepening counting problems and random experiments.* – Simulationen: `zaehlprinzip`, `gesetz-grosse-zahlen`, `baumdiagramm`

## Jahrgangsstufe 9 (Niveaustufe G)  
*Grade 9 (level G)*  
Jahrgangsstufe(n) im JSON: 9  
(Quelle: Rahmenlehrplan 1–10, Teil C Mathematik (2023), Kap. 2, S. 15, und Kap. 3.1–3.5, S. 38–65)

> Jahrgangsstufe 9: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; für das Gymnasium gilt in Jahrgangsstufe 9 die Niveaustufe G; G und H sind in 9/10 zu verzahnen. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Zahlen und Operationen (Niveaustufe G)
*EN: Numbers and operations (level G)*

- Simulationen: `quadratwurzel`
- Unterbereiche:
  - 1.1 Zahlvorstellungen · *Understanding numbers* – Kurz: π und Quadratwurzeln als irrationale Zahlen, Näherungswerte für reelle Zahlen, die Zahlenbereiche bis zu den reellen Zahlen. · *EN: π and square roots as irrational numbers, approximations of real numbers, the number sets up to the real numbers.* – Simulationen: `quadratwurzel`
  - 1.2 Operationsvorstellungen und Rechenstrategien · *Understanding operations and calculation strategies* – Kurz: Potenzen mit negativen Exponenten, Potenzgesetze für ganzzahlige Exponenten, Zusammenhang von Potenzieren und Radizieren. · *EN: Powers with negative exponents, laws of exponents for integer exponents, the link between powers and roots.* – Simulationen: `quadratwurzel`

### 2 Größen und Messen (Niveaustufe G)
*EN: Quantities and measurement (level G)*

- Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `pyramide-kegel-kugel`
- Unterbereiche:
  - 2.1 Größenvorstellungen und Messen · *Understanding quantities and measuring* – Kurz: Einheitenvorsätze von Nano bis Tera, Maße aus technischen Zeichnungen entnehmen. · *EN: Unit prefixes from nano to tera, taking measurements from technical drawings.* – Simulationen: –
  - 2.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Volumen und Oberfläche von Pyramide, Kegel und Kugel, Sinussatz und Kosinussatz. · *EN: Sine, cosine and tangent in right triangles, volume and surface area of pyramids, cones and spheres, the sine rule and the cosine rule.* – Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`, `pyramide-kegel-kugel`

### 3 Raum und Form (Niveaustufe G)
*EN: Space and shape (level G)*

- Simulationen: `pythagoras`, `pyramide-kegel-kugel`, `vergroessern`
- Unterbereiche:
  - 3.1 Geometrische Objekte · *Geometric objects* – Kurz: Differenz- und Teilkörper beschreiben, Schrägbilder von Kegeln, Zylindern und Pyramiden, Konstruktionen mit den Sätzen von Thales und Pythagoras. · *EN: Describing composite and hollow solids, oblique drawings of cones, cylinders and pyramids, constructions with the theorems of Thales and Pythagoras.* – Simulationen: `pythagoras`, `pyramide-kegel-kugel`
  - 3.2 Geometrische Abbildungen · *Geometric transformations* – Kurz: Abbildungen in komplexen Sachzusammenhängen nutzen, Körper maßstäblich vergrößern und verkleinern. · *EN: Using transformations in complex contexts, enlarging and reducing solids to scale.* – Simulationen: `vergroessern`

### 4 Gleichungen und Funktionen (Niveaustufe G)
*EN: Equations and functions (level G)*

- Simulationen: `binomische-formeln`, `gleichungen-grafisch`, `lgs-grafisch`, `quadratische-funktion`, `extremwert-parabel`, `parabel-drei-punkte`, `funktionsplotter`
- Unterbereiche:
  - 4.1 Terme und Gleichungen · *Terms and equations* – Kurz: Terme mit binomischen Formeln umformen, quadratische Gleichungen und lineare Gleichungssysteme rechnerisch und grafisch lösen und ihre Lösbarkeit untersuchen. · *EN: Transforming terms with binomial formulas, solving quadratic equations and linear systems algebraically and graphically and examining their solvability.* – Simulationen: `binomische-formeln`, `gleichungen-grafisch`, `lgs-grafisch`
  - 4.2 Zuordnungen und Funktionen · *Relationships and functions* – Kurz: Quadratische Funktionen y = a(x + d)² + e, trigonometrische Funktionen y = a·sin(bx) und Exponentialfunktionen mit Parametern, Symmetrie und Scheitelpunkt; Modellieren. · *EN: Quadratic functions y = a(x + d)² + e, trigonometric functions y = a·sin(bx) and exponential functions with parameters, symmetry and vertex; modelling.* – Simulationen: `quadratische-funktion`, `extremwert-parabel`, `parabel-drei-punkte`, `funktionsplotter`

### 5 Daten und Zufall (Niveaustufe G)
*EN: Data and chance (level G)*

- Simulationen: `diagramme`, `boxplot`, `baumdiagramm`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`
- Unterbereiche:
  - 5.1 Daten · *Data* – Kurz: Erhebungen selbstständig planen und auswerten, Trends erkennen, Manipulationen in Diagrammen aufdecken. · *EN: Planning and evaluating surveys independently, recognising trends, exposing manipulation in charts.* – Simulationen: `diagramme`, `boxplot`
  - 5.2 Zählstrategien und Wahrscheinlichkeiten · *Counting strategies and probabilities* – Kurz: Mehrstufige Zufallsexperimente mit Baumdiagramm, Pfadregeln, Vierfeldertafel und Urnenmodell, auch bedingte Wahrscheinlichkeiten. · *EN: Multi-stage experiments with tree diagrams, path rules, two-way tables and urn models, including conditional probabilities.* – Simulationen: `baumdiagramm`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`

## Jahrgangsstufe 10 (Niveaustufe H)  
*Grade 10 (level H)*  
Jahrgangsstufe(n) im JSON: 10  
(Quelle: Rahmenlehrplan 1–10, Teil C Mathematik (2023), Kap. 2, S. 15, und Kap. 3.1–3.5, S. 38–65)

> Jahrgangsstufe 10: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; für das Gymnasium gilt in Jahrgangsstufe 10 die Niveaustufe H, die Eingangsvoraussetzungen für die Qualifikationsphase. Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.

### 1 Zahlen und Operationen (Niveaustufe H)
*EN: Numbers and operations (level H)*

- Simulationen: `logarithmus`
- Unterbereiche:
  - 1.1 Zahlvorstellungen · *Understanding numbers* – Kurz: Zahlen situationsgerecht darstellen, ganze, rationale und reelle Zahlen angemessen verwenden, Einschachtelung von Quadratwurzeln oder π. · *EN: Representing numbers to suit the situation, using integers, rational and real numbers appropriately, nesting intervals for square roots or π.* – Simulationen: –
  - 1.2 Operationsvorstellungen und Rechenstrategien · *Understanding operations and calculation strategies* – Kurz: Potenzen mit rationalen Exponenten und Wurzelgesetze, Logarithmen als Umkehrung des Potenzierens. · *EN: Powers with rational exponents and laws of roots, logarithms as the inverse of taking powers.* – Simulationen: `logarithmus`

### 2 Größen und Messen (Niveaustufe H)
*EN: Quantities and measurement (level H)*

- Simulationen: `einheitskreis`, `cavalieri`, `sinussatz-kosinussatz`, `pyramide-kegel-kugel`
- Unterbereiche:
  - 2.1 Größenvorstellungen und Messen · *Understanding quantities and measuring* – Kurz: Bogen- und Gradmaß am Einheitskreis, krummlinig begrenzte Figuren näherungsweise bestimmen. · *EN: Radians and degrees on the unit circle, approximating figures with curved boundaries.* – Simulationen: `einheitskreis`
  - 2.2 Rechnen mit Größen · *Calculating with quantities* – Kurz: Volumen schiefer Prismen, Zylinder und Pyramiden mit dem Satz von Cavalieri, Kosinussatz auch für Winkel. · *EN: Volume of oblique prisms, cylinders and pyramids with Cavalieri’s principle, the cosine rule also for angles.* – Simulationen: `cavalieri`, `sinussatz-kosinussatz`, `pyramide-kegel-kugel`

### 3 Raum und Form (Niveaustufe H)
*EN: Space and shape (level H)*

- Simulationen: `sin-cos-tan-dreieck`
- Unterbereiche:
  - 3.1 Geometrische Objekte · *Geometric objects* – Kurz: Eigenschaften geometrischer Objekte mit Symmetrie, Winkelsätzen, trigonometrischen Beziehungen und den Sätzen von Thales und Pythagoras begründen. · *EN: Justifying properties of geometric objects with symmetry, angle theorems, trigonometric relations and the theorems of Thales and Pythagoras.* – Simulationen: `sin-cos-tan-dreieck`
  - 3.2 Geometrische Abbildungen · *Geometric transformations* – Kurz: Eigenschaften geometrischer Objekte mit Kongruenz und Ähnlichkeit begründen. · *EN: Justifying properties of geometric objects with congruence and similarity.* – Simulationen: –

### 4 Gleichungen und Funktionen (Niveaustufe H)
*EN: Equations and functions (level H)*

- Simulationen: `parabel-drei-punkte`, `logarithmus`, `lgs-grafisch`, `quadratische-funktion`, `sinusfunktion`, `einheitskreis`, `potenzfunktionen`, `hyperbel`, `exponentielles-wachstum`, `umkehrfunktion`, `transformationen`, `ganzrationale-funktionen`, `sekante-tangente`, `ableitungsfunktion`, `funktionsplotter`
- Unterbereiche:
  - 4.1 Terme und Gleichungen · *Terms and equations* – Kurz: Quadratische Ergänzung, Exponentialgleichungen mit Logarithmus, Gleichungen höheren Grades und lineare Gleichungssysteme mit drei Variablen, etwa zur Rekonstruktion quadratischer Funktionen. · *EN: Completing the square, exponential equations with logarithms, higher-degree equations and linear systems in three variables, for example to reconstruct quadratic functions.* – Simulationen: `parabel-drei-punkte`, `logarithmus`, `lgs-grafisch`
  - 4.2 Zuordnungen und Funktionen · *Relationships and functions* – Kurz: Quadratische, trigonometrische, Potenz- und Exponentialfunktionen mit Parametern, Umkehrfunktionen, mittlere und lokale Änderungsrate ganzrationaler Funktionen und Skizze der Ableitungsfunktion. · *EN: Quadratic, trigonometric, power and exponential functions with parameters, inverse functions, average and local rate of change of polynomial functions and a sketch of the derivative.* – Simulationen: `quadratische-funktion`, `sinusfunktion`, `einheitskreis`, `potenzfunktionen`, `hyperbel`, `exponentielles-wachstum`, `umkehrfunktion`, `transformationen`, `ganzrationale-funktionen`, `sekante-tangente`, `ableitungsfunktion`, `funktionsplotter`

### 5 Daten und Zufall (Niveaustufe H)
*EN: Data and chance (level H)*

- Simulationen: `geburtstagsproblem`, `monte-carlo-pi`, `bedingte-wahrscheinlichkeit`
- Unterbereiche:
  - 5.1 Daten · *Data* – Kurz: Mittelwerte und Streumaße wie Spannweite und Boxbreite analysieren und interpretieren. · *EN: Analysing and interpreting averages and measures of spread such as range and box width.* – Simulationen: –
  - 5.2 Zählstrategien und Wahrscheinlichkeiten · *Counting strategies and probabilities* – Kurz: Anzahlen mit Fakultät und Binomialkoeffizient, Wahrscheinlichkeiten über relative Häufigkeiten und Simulationen schätzen und Häufigkeiten vorhersagen. · *EN: Counting with factorials and binomial coefficients, estimating probabilities from relative frequencies and simulations and predicting frequencies.* – Simulationen: `geburtstagsproblem`, `monte-carlo-pi`, `bedingte-wahrscheinlichkeit`

## Qualifikationsphase Q1/Q2 (Jahrgangsstufe 11)  
*Qualification phase Q1/Q2 (grade 11)*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Rahmenlehrplan gymnasiale Oberstufe, Teil C Mathematik, Kap. 3.2.2, S. 24–28, und Kap. 4, S. 29–31)

> Qualifikationsphase, 1. und 2. Kurshalbjahr (Q1, Q2; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 11). Der Rahmenlehrplan ordnet die Standards den Kurshalbjahren schwerpunktmäßig zu; Verschiebungen zwischen Q1 und Q2 sowie zwischen Q2 und Q4 sind zulässig. LK = nur im Leistungskurs. Die Nummern sind von uns vergeben.

### Q1 1. Kurshalbjahr: Analysis (Differentialrechnung)
*EN: First half-year: calculus (differential calculus)*

- Kurz (DE): Mittlere und lokale Änderungsrate, Ableitung und Ableitungsregeln, Kurvenuntersuchung und Modellieren mit Potenz-, ganzrationalen und Exponentialfunktionen.
- Kurz (EN): Average and local rate of change, derivative and differentiation rules, analysing graphs and modelling with power, polynomial and exponential functions.
- Simulationen: `sekante-tangente`, `ableitungsfunktion`, `grenzverhalten`, `e-funktion`, `kurvendiskussion`, `ganzrationale-funktionen`, `potenzfunktionen`, `transformationen`, `parabel-drei-punkte`, `extremwertprobleme`, `polstellen-asymptoten`, `funktionenscharen`, `funktionsplotter`
- Unterbereiche:
  - Q1.1 Ableitung und Ableitungsfunktion · *The derivative and the derivative function* – Kurz: Sekanten- und Tangentensteigung, Ableitung als lokale Änderungsrate, Ableitungsfunktion, Konstanten-, Potenz-, Faktor-, Summen-, Produkt- und Kettenregel; Ableitungsgraph aus dem Funktionsgraphen und umgekehrt. · *EN: Secant and tangent slopes, the derivative as the local rate of change, the derivative function, constant, power, factor, sum, product and chain rules; derivative graph from the graph of the function and vice versa.* – Simulationen: `sekante-tangente`, `ableitungsfunktion`, `grenzverhalten`, `e-funktion`
  - Q1.2 Funktionsuntersuchung und Modellieren · *Analysing functions and modelling* – Kurz: Monotonie, Extrema und Wendepunkte, Rekonstruktion von Funktionsgleichungen und Extremalprobleme mit Potenz-, ganzrationalen und Exponentialfunktionen; LK: gebrochenrationale und weitere Funktionen, Asymptoten und Funktionenscharen. · *EN: Monotonicity, extrema and inflection points, reconstructing equations and optimisation problems with power, polynomial and exponential functions; LK: rational and further functions, asymptotes and families of functions.* – Simulationen: `kurvendiskussion`, `ganzrationale-funktionen`, `potenzfunktionen`, `transformationen`, `parabel-drei-punkte`, `extremwertprobleme`, `polstellen-asymptoten`, `funktionenscharen`, `funktionsplotter`

### Q2 2. Kurshalbjahr: Analysis (Integralrechnung) und Stochastik (Wahrscheinlichkeitsrechnung)
*EN: Second half-year: calculus (integral calculus) and probability*

- Kurz (DE): Bestimmtes Integral, Hauptsatz und Stammfunktionen; Lage- und Streumaße, bedingte Wahrscheinlichkeit, Unabhängigkeit, Urnenmodell und Simulationen.
- Kurz (EN): The definite integral, the fundamental theorem and antiderivatives; measures of centre and spread, conditional probability, independence, urn models and simulations.
- Simulationen: `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`, `aenderungsrate`, `logarithmus`, `umkehrfunktion`, `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `geburtstagsproblem`
- Unterbereiche:
  - Q2.1 Analysis (Integralrechnung) · *Calculus (integral calculus)* – Kurz: Bestände aus Änderungsraten rekonstruieren, Flächen mit bestimmten Integralen, Hauptsatz geometrisch begründen, Stammfunktionen; LK: ln als Stammfunktion von 1/x, uneigentliche Integrale und Rotationskörper. · *EN: Reconstructing totals from rates of change, areas with definite integrals, justifying the fundamental theorem geometrically, antiderivatives; LK: ln as an antiderivative of 1/x, improper integrals and solids of revolution.* – Simulationen: `ober-untersummen`, `hauptsatz`, `stammfunktion-grafisch`, `aenderungsrate`, `logarithmus`, `umkehrfunktion`
  - Q2.2 Stochastik (Wahrscheinlichkeitsrechnung) · *Probability* – Kurz: Erhebungen auswerten, Baumdiagramm und Vierfeldertafel bei bedingten Wahrscheinlichkeiten, stochastische Unabhängigkeit, Urnenmodell mit und ohne Zurücklegen und Simulationen. · *EN: Evaluating surveys, tree diagrams and two-way tables for conditional probabilities, stochastic independence, urn models with and without replacement and simulations.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`, `geburtstagsproblem`

## Qualifikationsphase Q3/Q4 (Jahrgangsstufe 12) und Zusatzkurse  
*Qualification phase Q3/Q4 (grade 12) and additional courses*  
Jahrgangsstufe(n) im JSON: 12  
(Quelle: Rahmenlehrplan gymnasiale Oberstufe, Teil C Mathematik, Kap. 3.2.2, S. 24–28, Kap. 4, S. 29–31, und Kap. 5.2, S. 32–34)

> Qualifikationsphase, 3. und 4. Kurshalbjahr (Q3, Q4; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 12). Q4 dient auch der Vertiefung und Verknüpfung aller drei Sachgebiete. LK = nur im Leistungskurs. Die Nummern sind von uns vergeben.

### Q3 3. Kurshalbjahr: Analytische Geometrie
*EN: Third half-year: analytic geometry*

- Kurz (DE): Koordinatisieren, Vektoren, Skalarprodukt, Geraden und Ebenen mit Lagebeziehungen, Winkeln und Abständen.
- Kurz (EN): Coordinates, vectors, the dot product, lines and planes with relative positions, angles and distances.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`, `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - Q3.1 Vektoren und Skalarprodukt · *Vectors and the dot product* – Kurz: Geometrische Sachverhalte koordinatisieren, mit Vektoren rechnen, auf Kollinearität prüfen und das Skalarprodukt für Längen und Winkel nutzen. · *EN: Describing geometry with coordinates, calculating with vectors, testing for collinearity and using the dot product for lengths and angles.* – Simulationen: `koordinaten-3d`, `vektoren-3d`, `skalar-vektorprodukt`
  - Q3.2 Geraden und Ebenen · *Lines and planes* – Kurz: Geraden und Ebenen in Parameter-, Koordinaten- und Normalenform, Lagebeziehungen und Abstände; LK: auch Scharen und Abstände Punkt-Gerade und Gerade-Gerade. · *EN: Lines and planes in parametric, coordinate and normal form, relative positions and distances; LK: also families and distances point–line and line–line.* – Simulationen: `geraden-ebenen`, `lage-abstaende`

### Q4 4. Kurshalbjahr: Analysis, Stochastik und Aufgaben aus allen Sachgebieten
*EN: Fourth half-year: calculus, probability and tasks from all areas*

- Kurz (DE): Binomialverteilung mit Kenngrößen, Schluss von der Stichprobe auf die Gesamtheit, Hypothesentests (LK) und Normalverteilung (LK) sowie Vertiefung der Analysis.
- Kurz (EN): The binomial distribution with its parameters, inferring from the sample to the population, hypothesis tests (LK) and the normal distribution (LK), and further calculus.
- Simulationen: `extremwertprobleme`, `rotationskoerper`, `funktionenscharen`, `hauptsatz`, `galtonbrett`, `binomialverteilung`, `signifikanztest`, `normalverteilung`
- Unterbereiche:
  - Q4.1 Analysis (Vertiefung) · *Calculus (further study)* – Kurz: Vertiefen und Verknüpfen der Differential- und Integralrechnung; LK: Rotationskörper und uneigentliche Integrale. · *EN: Deepening and linking differential and integral calculus; LK: solids of revolution and improper integrals.* – Simulationen: `extremwertprobleme`, `rotationskoerper`, `funktionenscharen`, `hauptsatz`
  - Q4.2 Stochastik (Binomialverteilung, beurteilende Statistik) · *Probability (binomial distribution, inferential statistics)* – Kurz: Binomialverteilung mit Erwartungswert und Standardabweichung, k-σ-Intervalle und Signifikanzbegriff; LK: Hypothesentests mit Fehlern 1. und 2. Art, Glockenform der Normalverteilung. · *EN: The binomial distribution with expected value and standard deviation, k-σ intervals and significance; LK: hypothesis tests with type I and type II errors, the bell shape of the normal distribution.* – Simulationen: `galtonbrett`, `binomialverteilung`, `signifikanztest`, `normalverteilung`
  - Q4.3 Komplexe Aufgabenstellungen aus allen drei Sachgebieten · *Complex tasks from all three areas* – Kurz: Aufgaben, die Analysis, analytische Geometrie und Stochastik verknüpfen. · *EN: Tasks that link calculus, analytic geometry and probability.* – Simulationen: –

### Z Zusatzkurse (Angebot der Schule)
*EN: Additional courses (offered by the school)*

- Kurz (DE): Mögliche Zusatzkurse: nichteuklidische Geometrie, Logik, Zahlentheorie, numerische Mathematik, Differentialgleichungen, Folgen und Reihen mit Taylor-Reihen, Markowketten, Funktionentheorie, Kegelschnitte, Vertiefung der Analysis, Begründen und Beweisen.
- Kurz (EN): Possible additional courses: non-Euclidean geometry, logic, number theory, numerical mathematics, differential equations, sequences and series with Taylor series, Markov chains, complex analysis, conic sections, further calculus, reasoning and proof.
- Simulationen: `taylor-polynome`

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `berlin-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/berlin-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `strahlensaetze` | Die Strahlensätze stehen nicht im Rahmenlehrplan; er behandelt Ähnlichkeit über Ähnlichkeitsabbildungen und Längenverhältnisse (Niveaustufe E) und maßstäbliche Vergrößerung. |
| `newton-verfahren` | Das Newton-Verfahren steht nicht im Rahmenlehrplan; die Oberstufe verlangt nur, „geeignete Verfahren zur Lösung von Gleichungen“ auszuwählen. |
| `kugeln` | Kugeln kommen nur als Körper in der Sek. I vor; Kugelgleichungen stehen nicht im Rahmenlehrplan (der Zusatzkurs Kegelschnitte nennt Dandelinsche Kugeln, aber keine Kugelgleichung). |
| `matrix-abbildungen` | Matrizen nur als Koeffizientenmatrizen und Tabellen; Übergangsmatrizen im Zusatzkurs Markowketten sind keine Abbildungsmatrizen. |
| `fourier-reihen` | nicht im Rahmenlehrplan (Hochschule) |

## D.2 Lern- und Unterbereiche ohne passende Simulation

- **5:** 4.2 Zuordnungen und Funktionen und 5.1 Daten – die passenden Simulationen (`proportional`, `funktion-zuordnung`, `diagramme`) beginnen nach Klassenstufen erst mit 6.
- **6, 8, 9:** 2.1 Größenvorstellungen und Messen (Einheiten und Einheitenvorsätze; `einheiten` ist für Klasse 5).
- **8, 10:** 3.2 Geometrische Abbildungen (Abbildungen in Sachaufgaben, Begründen mit Kongruenz und Ähnlichkeit).
- **10:** 1.1 Zahlvorstellungen (Einschachtelung von √2 oder π; `quadratwurzel` und `kreiszahl-pi` enden mit 9), 5.1 Daten (Streumaße; `boxplot` endet mit 9).
- **12:** Q4.3 Komplexe Aufgabenstellungen (übergreifend).

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Einheitenvorsätze von Nano bis Tera | Größen vom Atom bis zur Galaxie auf einer logarithmischen Skala, Vorsätze und Zehnerpotenzen umrechnen | 8 und 9, 2.1 |
| Intervallschachtelung | √2 oder π schrittweise einschachteln, Intervallbreite und Stellen ablesen | 10, 1.1 |

# Teil E – Einordnung und Unklarheiten

1. **Zwei Lehrpläne, G8.** Für die Jahrgangsstufen 1–10 gilt der gemeinsame Rahmenlehrplan Berlin-Brandenburg (Teil C Mathematik, 2023), für die Qualifikationsphase der Rahmenlehrplan für die gymnasiale Oberstufe (Teil C Mathematik, gültig ab 2014). Am Gymnasium führt die Schulzeit nach 12 Jahren zum Abitur.
2. **Niveaustufen statt Jahrgänge.** Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert. Für das Gymnasium legt er fest: Jahrgangsstufe 7 = E, 8 = F, 9 = G, 10 = H. Für Schulen mit den Jahrgangsstufen 5 und 6 gilt: 5 = C–D, 6 = D, in Teilen E. Jede Jahrgangsstufe zeigt deshalb die Inhalte ihrer Niveaustufe; die Niveaustufe steht im Titel jedes Lernbereichs. Weil die Inhalte kumulativ sind, gelten die früheren Stufen weiter. Für 5 und 6 sind die Inhalte der Stufe D (mit Bezügen zu C) abgebildet. In Berlin beginnt das Gymnasium meist mit Klasse 7.
3. **Oberstufe.** Die Standards sind den Kurshalbjahren Q1–Q4 schwerpunktmäßig zugeordnet; Verschiebungen zwischen Q1 und Q2 und zwischen Q2 und Q4 sind zulässig. Am Gymnasium (Abitur nach 12) sind Q1/Q2 die Jahrgangsstufe 11 und Q3/Q4 die Jahrgangsstufe 12. Die Einführungsphase des Oberstufenlehrplans gilt für Schulen mit dreijähriger Oberstufe; am Gymnasium übernimmt Jahrgangsstufe 10 mit Niveaustufe H diese Rolle, deshalb ist sie nicht eigens abgebildet. LK-Inhalte sind in den Kurzbeschreibungen mit „LK“ gekennzeichnet. Die Zusatzkurse (ma-Z1 bis ma-Z11) stehen als Lernbereich Z bei 12.
4. **Nummern.** Sek. I: Themenbereiche 1–5 und ihre Themen (1.1 usw.) in der Reihenfolge des Lehrplans. Oberstufe: Q1–Q4 mit Unterbereichen nach Sachgebiet bzw. Schwerpunkt. Die Nummern sind selbst vergeben.
5. **`sourceUrl`.** Die Dokumente nennen keinen Link zur Datei. Verwendet ist die Startseite des Bildungsservers Berlin-Brandenburg, `https://bildungsserver.berlin-brandenburg.de/` (dort veröffentlicht das LISUM die Rahmenlehrpläne). Erreichbarkeit hier nicht geprüft.
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`), weil Berlin das Thema in diesem Jahrgang unterrichtet:

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `pythagoras` | 8–9 | 7–9 | 7, 2.2 und 3.1 (Niveaustufe E) | Kap. 3.2/3.3, Stufe E: Satz des Pythagoras und Umkehrung |
   | `kreiszahl-pi` | 8–9 | 7–9 | 7, 2.2 (E) | Kap. 3.2, Stufe E: Umfang und Flächeninhalt von Kreisen mit π |
   | `zehnerpotenzen` | 5–7 | 5–8 | 8, 1.1 und 1.2 (F) | Kap. 3.1, Stufe F: Potenzen und Zehnerpotenzen mit natürlichem Exponenten |
   | `binomische-formeln` | 7–8 | 7–9 | 9, 4.1 (G) | Kap. 3.4, Stufe G: Umformen von Termen unter Nutzung der binomischen Formeln |
   | `bedingte-wahrscheinlichkeit` | 10–13 | 9–13 | 9, 5.2 (G) | Kap. 3.5, Stufe G: auch bedingte Wahrscheinlichkeiten mit Vierfeldertafeln |
   | `sekante-tangente` | 11–11 | 10–11 | 10, 4.2 (H) | Kap. 3.4, Stufe H: mittlere und lokale Änderungsrate ganzrationaler Funktionen |
   | `ableitungsfunktion` | 11–12 | 10–12 | 10, 4.2 (H) | Kap. 3.4, Stufe H: Skizze der Ableitungsfunktion |
   | `e-funktion` | 12–12 | 11–12 | 11, Q1.1 | Kap. 3.2.2: Exponentialfunktionen ableiten (Q1) |
   | `funktionenscharen` | 12–13 | 11–13 | 11, Q1.2 | Kap. 3.2.2: LK, Scharen von Funktionen (Q1) |
   | `ober-untersummen` | 12–13 | 11–13 | 11, Q2.1 | Kap. 3.2.2 und 4: Integralrechnung in Q2 |
   | `hauptsatz` | 12–13 | 11–13 | 11, Q2.1 | Kap. 3.2.2: Hauptsatz geometrisch anschaulich begründen (Q2) |
   | `aenderungsrate` | 12–13 | 11–13 | 11, Q2.1 | Kap. 3.2.2: Bestände aus Änderungsraten berechnen (Q2) |
   | `stammfunktion-grafisch` | 12–13 | 11–13 | 11, Q2.1 | Kap. 3.2.2: Ableitungsgraphen aus Funktionsgraphen und umgekehrt (Q1/2), Stammfunktionen (Q2) |
   | `taylor-polynome` | 13–14 | 12–14 | 12, Z Zusatzkurse | Kap. 5.2: Zusatzkurs ma-Z6 Folgen und Reihen mit Taylor-Reihen |

   Damit die Sortierung nach Klassenstufe stimmt, steht `ableitungsfunktion` jetzt vor `newton-verfahren`. Mehrere Erweiterungen kommen daher, dass Berlin mit G8 die Integralrechnung in Q2, also schon in Jahrgangsstufe 11, unterrichtet.
7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `taylor-polynome` beim Lernbereich Z: nur im wählbaren Zusatzkurs ma-Z6, nicht im Grund- oder Leistungskurs.
   - `skalar-vektorprodukt` bei Q3.1: Der Lehrplan nennt nur das Skalarprodukt; die Simulation zeigt auch das Vektorprodukt.
   - `monte-carlo-pi` bei 10, 5.2: Simulationen zum Schätzen von Wahrscheinlichkeiten; π mit Zufall ist nicht genannt.
   - `geburtstagsproblem` bei 9 und 10, 5.2 und Q2.2: Urnenmodell, Fakultät und Simulation; das Problem selbst ist nicht genannt.
   - `ziegenproblem` bei Q2.2: klassisches Beispiel für bedingte Wahrscheinlichkeit, nicht genannt.
   - `boxplot` bei 7 (E): Median und Mittelwerte stehen in E, Boxplots erst in F.
   - `hyperbel` bei 10, 4.2: Potenzfunktionen mit ganzzahligem Exponenten (H); indirekt proportionale Zuordnungen stehen schon in E, die Simulation passt nach Klassenstufen aber erst ab 8.
   - `polstellen-asymptoten` bei Q1.2: nur im LK (gebrochenrationale Funktionen, Asymptoten).
   - `vergroessern` bei 9, 3.2: maßstäbliches Vergrößern von Körpern (G); die Wirkung auf Fläche und Volumen nennt der Lehrplan nicht ausdrücklich.
