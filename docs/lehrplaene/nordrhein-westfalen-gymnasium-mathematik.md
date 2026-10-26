# Nordrhein-Westfalen · Gymnasium · Mathematik – Lehrplan-Aufbereitung mit Simulationszuordnung

# Teil A – Überblick

| Merkmal | Sekundarstufe I | Gymnasiale Oberstufe |
|---|---|---|
| Bundesland | Nordrhein-Westfalen | Nordrhein-Westfalen |
| Schulart | Gymnasium (Sekundarstufe I) | gymnasiale Oberstufe von Gymnasium und Gesamtschule |
| Fach | Mathematik | Mathematik |
| Name des Lehrplans | „Kernlehrplan für die Sekundarstufe I – Gymnasium in Nordrhein-Westfalen, Mathematik“, Schriftenreihe „Schule in NRW“, Heft 3401, Ministerium für Schule und Bildung NRW | „Kernlehrplan für die Sekundarstufe II – Gymnasium/Gesamtschule in Nordrhein-Westfalen, Mathematik“, Ministerium für Schule und Bildung NRW |
| Jahr / Stand | 1. Auflage 2019; RdErl. vom 23.06.2019 (526-6.03.13.02-143664), in Kraft ab 01.08.2019 für die Klassen 5 und 6 aufsteigend | RdErl. vom 07.08.2026 (526-2026-0003217), ABl. NRW. 08/26; in Kraft ab 01.08.2027 beginnend mit der Einführungsphase. Der bisherige Kernlehrplan (Heft 4720, 24.05.2023) tritt mit Ablauf des 31.07.2027 auslaufend außer Kraft und ist hier nicht abgebildet |
| Datei (von der Projektleitung geliefert, nicht im Repository) | `g9_m_klp_3401_2019_06_23_0.pdf` (40 Seiten) | `gost_klp_m_2026_08_24.pdf` (44 Seiten) |
| Link laut Dokument | „www.lehrplannavigator.nrw.de“ (Online-Fassung) | „https://www.schulentwicklung.nrw.de/lehrplaene/“ (Lehrplannavigator); in `sourceUrl` verwendet |
| G8/G9 | G9 (Sekundarstufe I bis Klasse 10, „neues G9“) | G9 (Einführungsphase = Jahrgangsstufe 11, Annahme siehe Teil E) |
| Niveaus / Wahl | keine | Qualifikationsphase: Grundkurs und Leistungskurs mit eigenen Kompetenzerwartungen |
| Struktur | Erprobungsstufe, erste Stufe, zweite Stufe → je vier Inhaltsfelder (Arithmetik/Algebra, Funktionen, Geometrie, Stochastik) → inhaltliche Schwerpunkte (ohne Nummern im Original) | Einführungsphase: Inhaltsfelder A und G; Qualifikationsphase: A, G und S, jeweils für Grund- und Leistungskurs → inhaltliche Schwerpunkte (ohne Nummern) |

| Stufe (Lehrplan) | JSON-Jahrgang | Lernbereiche | Unterbereiche | Unterbereiche mit Simulation | zugeordnete Simulationen (verschieden) |
|---|---|---|---|---|---|
| Erprobungsstufe – „Kompetenzerwartungen … bis zum Ende der Erprobungsstufe“ | 5, 6 | 4 | 14 | 13 | 23 |
| Erste Stufe – „bis zum Ende der Sekundarstufe I“ | 7, 8 | 4 | 13 | 12 | 21 |
| Zweite Stufe – „bis zum Ende der Sekundarstufe I“ | 9, 10 | 4 | 14 | 12 | 24 |
| Einführungsphase | 11 | 2 | 11 | 11 | 13 |
| Qualifikationsphase – Grundkurs und Leistungskurs | 12, 13 | 3 | 16 | 13 | 22 |

Insgesamt verwendet: **85 von 93** fertigen Simulationen für Mathematik.

Nicht zugeordnet (Grund siehe Teil D): `polstellen-asymptoten`, `monte-carlo-pi`, `signifikanztest`, `newton-verfahren`, `taylor-polynome`, `fourier-reihen`, `kugeln`, `matrix-abbildungen`

# Teil B – Lehrplan im Detail

Simulationen stehen bei allen Jahrgängen einer Stufe, sofern nicht in Klammern einzelne Jahrgänge genannt sind (dann passt die Simulation nach ihren Klassenstufen nur dort).

## Erprobungsstufe – „Kompetenzerwartungen … bis zum Ende der Erprobungsstufe“  
*Orientation stage*  
Jahrgangsstufe(n) im JSON: 5, 6  
(Quelle: Kernlehrplan Sek. I Mathematik (Heft 3401), Kap. 2.3, S. 23–27)

> Erprobungsstufe (Klassen 5 und 6): Der Kernlehrplan nennt die Kompetenzerwartungen „bis zum Ende der Erprobungsstufe“; die Lernbereiche stehen deshalb bei 5 und 6 gleich. Jede Simulation steht bei dem Jahrgang, für den sie gedacht ist; beim anderen führt ein Verweis dorthin. Die Inhaltsfelder und Schwerpunkte sind im Lehrplan nicht nummeriert; die Nummern sind von uns vergeben und laufen über alle Stufen der Sekundarstufe I durch.

### 1 Arithmetik/Algebra
*EN: Arithmetic/algebra*

- Kurz (DE): Rechnen mit natürlichen Zahlen, einfachen Brüchen und Dezimalzahlen, Rechengesetze und Teilbarkeit, Brüche als Anteile sowie Größen und Einheiten.
- Kurz (EN): Calculating with natural numbers, simple fractions and decimals, laws of arithmetic and divisibility, fractions as parts of a whole, and quantities and units.
- Simulationen: `termbaum`, `primfaktoren`, `zahlengerade`, `stellenwerte`, `zehnerpotenzen`, `einheiten`, `brueche-rechnen`, `dezimalbrueche`, `bruchteile`, `brueche-vergleichen`, `prozentstreifen`
- Unterbereiche:
  - 1.1 Grundrechenarten · *The four operations* – Kurz: Die vier Grundrechenarten mit natürlichen Zahlen, einfachen Brüchen und endlichen Dezimalzahlen, auch schriftlich dividieren. · *EN: The four operations with natural numbers, simple fractions and terminating decimals, including long division.* – Simulationen: `brueche-rechnen` (6), `dezimalbrueche` (6)
  - 1.2 Gesetze und Regeln · *Laws and rules* – Kurz: Kommutativ-, Assoziativ- und Distributivgesetz für vorteilhaftes Rechnen sowie Teilbarkeitsregeln. · *EN: Commutative, associative and distributive laws for clever calculation, and divisibility rules.* – Simulationen: `termbaum`, `primfaktoren`
  - 1.3 Begriffsbildung · *Concepts* – Kurz: Primzahlen und Primfaktorzerlegung, Anteile und Bruchteile von Größen, Kürzen und Erweitern, Rechenterme mit Fachbegriffen. · *EN: Prime numbers and prime factorisation, parts and fractions of quantities, simplifying and expanding fractions, arithmetic expressions with technical terms.* – Simulationen: `primfaktoren`, `termbaum`, `bruchteile` (6), `brueche-vergleichen` (6)
  - 1.4 Zahlbereichserweiterung · *Extending the number system* – Kurz: Positive rationale Zahlen; ganze Zahlen darstellen und für Zustände, Veränderungen und Koordinaten nutzen. · *EN: Positive rational numbers; representing integers and using them for states, changes and coordinates.* – Simulationen: `zahlengerade`
  - 1.5 Darstellung · *Representation* – Kurz: Stellenwerttafel, Zahlenstrahl, Wortform, Bruch, endliche und periodische Dezimalzahl und Prozentzahl, Runden und Überschlag. · *EN: Place-value chart, number line, words, fractions, terminating and recurring decimals and percentages, rounding and estimation.* – Simulationen: `stellenwerte` (5), `zehnerpotenzen`, `dezimalbrueche` (6), `prozentstreifen` (6)
  - 1.6 Größen und Einheiten · *Quantities and units* – Kurz: Länge, Flächeninhalt, Volumen, Zeit, Geld und Masse schätzen, passend wählen und umrechnen. · *EN: Estimating, choosing and converting length, area, volume, time, money and mass.* – Simulationen: `einheiten` (5)

### 2 Funktionen
*EN: Functions*

- Kurz (DE): Zusammenhänge zwischen Größen in Worten, Tabellen und Diagrammen beschreiben, Dreisatz, Zahlenmuster und Maßstab.
- Kurz (EN): Describing relationships between quantities in words, tables and diagrams, the rule of three, number patterns and scale.
- Simulationen: `massstab`, `proportional`
- Unterbereiche:
  - 2.1 Zusammenhang zwischen Größen · *Relationships between quantities* – Kurz: Diagramm, Tabelle, Wortform, Maßstab und Dreisatzverfahren. · *EN: Diagrams, tables, verbal descriptions, scale and the rule of three.* – Simulationen: `massstab` (5), `proportional` (6)

### 3 Geometrie
*EN: Geometry*

- Kurz (DE): Ebene Figuren und Körper beschreiben und zeichnen, Winkel messen, Symmetrie und Abbildungen sowie Umfang, Flächeninhalt, Oberfläche und Volumen einfacher Figuren.
- Kurz (EN): Describing and drawing plane figures and solids, measuring angles, symmetry and transformations, as well as perimeter, area, surface area and volume of simple shapes.
- Simulationen: `koordinaten-lage`, `winkel-messen`, `vierecke`, `umfang-flaeche`, `koerpernetze`, `flaechen-zerlegen`, `quader-volumen`, `spiegelung`
- Unterbereiche:
  - 3.1 Ebene Figuren · *Plane figures* – Kurz: Kreis, besondere Dreiecke und Vierecke, Winkel, Strecke, Gerade, Koordinatensystem; Umfang und Flächeninhalt von Rechteck und rechtwinkligem Dreieck, Zerlegen und Ergänzen. · *EN: Circles, special triangles and quadrilaterals, angles, segments, lines, the coordinate system; perimeter and area of rectangles and right triangles, decomposing and completing.* – Simulationen: `koordinaten-lage` (5), `winkel-messen` (5), `vierecke`, `umfang-flaeche` (5), `flaechen-zerlegen` (6)
  - 3.2 Körper · *Solids* – Kurz: Quader, Pyramide, Zylinder, Kegel und Kugel erkennen; Netze und Schrägbilder von Quader und Würfel, ihre Oberfläche und ihr Volumen. · *EN: Recognising cuboids, pyramids, cylinders, cones and spheres; nets and oblique drawings of cuboids and cubes, their surface area and volume.* – Simulationen: `koerpernetze`, `quader-volumen` (6)
  - 3.3 Lagebeziehung und Symmetrie · *Relative position and symmetry* – Kurz: Parallelität, Orthogonalität, Punkt- und Achsensymmetrie. · *EN: Parallel and perpendicular lines, point and line symmetry.* – Simulationen: `koordinaten-lage` (5), `spiegelung` (6)
  - 3.4 Abbildungen · *Transformations* – Kurz: Verschiebungen, Drehungen, Punkt- und Achsenspiegelungen, auch im Koordinatensystem. · *EN: Translations, rotations, point and line reflections, also in the coordinate system.* – Simulationen: `spiegelung` (6)

### 4 Stochastik
*EN: Stochastics*

- Kurz (DE): Daten erheben und in Listen, Tabellen und Diagrammen darstellen, Häufigkeiten und Kenngrößen bestimmen und Darstellungen kritisch lesen.
- Kurz (EN): Collecting data and presenting it in lists, tables and diagrams, determining frequencies and statistical measures and reading diagrams critically.
- Simulationen: `diagramme`, `boxplot`
- Unterbereiche:
  - 4.1 Statistische Daten · *Statistical data* – Kurz: Datenerhebung, Ur- und Strichlisten, Klasseneinteilung, Säulen- und Kreisdiagramme und Boxplots. · *EN: Collecting data, raw data and tally charts, grouping into classes, bar and pie charts and box plots.* – Simulationen: `diagramme` (6), `boxplot` (6)
  - 4.2 Begriffsbildung · *Concepts* – Kurz: Absolute und relative Häufigkeit. · *EN: Absolute and relative frequency.* – Simulationen: –
  - 4.3 Kenngrößen · *Statistical measures* – Kurz: Arithmetisches Mittel, Median, Spannweite und Quartile, auch wie einzelne Daten sie verändern. · *EN: Mean, median, range and quartiles, including how single data points change them.* – Simulationen: `boxplot` (6)

## Erste Stufe – „bis zum Ende der Sekundarstufe I“  
*First stage up to the end of lower secondary*  
Jahrgangsstufe(n) im JSON: 7, 8  
(Quelle: Kernlehrplan Sek. I Mathematik (Heft 3401), Kap. 2.4.1, S. 28–31)

> Erste Stufe bis zum Ende der Sekundarstufe I. Der Kernlehrplan nennt für die erste und zweite Stufe keine Jahrgänge; die Einordnung bei den Klassen 7 und 8 ist eine Annahme (G9). Die Lernbereiche stehen bei 7 und 8 gleich; jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben.

### 5 Arithmetik/Algebra
*EN: Arithmetic/algebra*

- Kurz (DE): Rationale Zahlen und Vorzeichenregeln, Variablen und Terme umformen, binomische Formeln sowie lineare Gleichungen, Gleichungssysteme mit zwei Variablen und einfache Bruchgleichungen lösen.
- Kurz (EN): Rational numbers and sign rules, variables and transforming terms, binomial formulas, and solving linear equations, systems with two variables and simple fractional equations.
- Simulationen: `zahlengerade`, `termbaum`, `binomische-formeln`, `waagemodell`, `lgs-grafisch`, `gleichungen-grafisch`
- Unterbereiche:
  - 5.1 Zahlbereichserweiterung · *Extending the number system* – Kurz: Rationale Zahlen an der Zahlengeraden darstellen und ordnen; warum man Zahlbereiche erweitert. · *EN: Representing and ordering rational numbers on the number line; why number systems are extended.* – Simulationen: `zahlengerade` (7)
  - 5.2 Term und Variable · *Term and variable* – Kurz: Variable als Veränderliche, Platzhalter und Unbekannte; Terme aufstellen und zielgerichtet umformen. · *EN: Variables as changing quantities, placeholders and unknowns; setting up and purposefully transforming terms.* – Simulationen: `termbaum` (7)
  - 5.3 Gesetze und Regeln · *Laws and rules* – Kurz: Vorzeichenregeln, Rechengesetze für rationale Zahlen und binomische Formeln. · *EN: Sign rules, laws of arithmetic for rational numbers and binomial formulas.* – Simulationen: `zahlengerade` (7), `binomische-formeln` (7), `termbaum` (7)
  - 5.4 Lösungsverfahren · *Solution methods* – Kurz: Algebraische und grafische Verfahren für lineare Gleichungen, lineare Gleichungssysteme mit zwei Variablen und einfache Bruchgleichungen. · *EN: Algebraic and graphical methods for linear equations, linear systems with two variables and simple fractional equations.* – Simulationen: `waagemodell` (7), `lgs-grafisch` (8), `gleichungen-grafisch` (8)

### 6 Funktionen
*EN: Functions*

- Kurz (DE): Proportionale und antiproportionale Zuordnungen, der Funktionsbegriff, lineare Funktionen mit Steigung und Achsenabschnitt sowie Prozent- und Zinsrechnung.
- Kurz (EN): Proportional and inversely proportional relationships, the concept of a function, linear functions with slope and intercept, and percentages and interest.
- Simulationen: `proportional`, `lineare-funktion`, `prozentstreifen`, `hyperbel`, `funktion-zuordnung`, `funktionsplotter`
- Unterbereiche:
  - 6.1 Proportionale und antiproportionale Zuordnung · *Proportional and inversely proportional relationships* – Kurz: Zuordnungsvorschrift, Graph, Tabelle, Quotienten- und Produktgleichheit, Proportionalitätsfaktor und Dreisatz; Funktionen als eindeutige Zuordnungen. · *EN: Rule of assignment, graph, table, equal quotients and equal products, constant of proportionality and rule of three; functions as unique assignments.* – Simulationen: `proportional`, `hyperbel` (8), `funktion-zuordnung` (8)
  - 6.2 Lineare Funktionen · *Linear functions* – Kurz: Funktionsterm, Graph, Tabelle und Wortform, Achsenabschnitte, Steigung und Steigungsdreieck, auch mit Funktionenplotter. · *EN: Function term, graph, table and verbal form, intercepts, slope and slope triangle, also with a function plotter.* – Simulationen: `lineare-funktion`, `funktionsplotter` (8)
  - 6.3 Prozent- und Zinsrechnung · *Percentages and interest* – Kurz: Grundwert, Prozentwert und Prozentsatz, prozentuale Veränderung und Wachstumsfaktor, Zinsen. · *EN: Base value, percentage value and rate, percentage change and growth factor, interest.* – Simulationen: `prozentstreifen` (7)

### 7 Geometrie
*EN: Geometry*

- Kurz (DE): Flächeninhalte von Dreiecken, Vierecken und zusammengesetzten Figuren, Winkelsätze, Kongruenzsätze und Satz des Thales sowie Konstruktionen mit Zirkel und Lineal.
- Kurz (EN): Areas of triangles, quadrilaterals and composite figures, angle theorems, congruence theorems and Thales’ theorem, and constructions with compass and ruler.
- Simulationen: `flaechen-zerlegen`, `winkel-geradenkreuzung`, `winkelsumme`, `dreieckskonstruktion`, `thales`, `mittelsenkrechte`, `besondere-linien`
- Unterbereiche:
  - 7.1 Umfang und Flächeninhalt · *Perimeter and area* – Kurz: Dreieck, Viereck und zusammengesetzte Figuren, Höhe und Grundseite. · *EN: Triangles, quadrilaterals and composite figures, height and base.* – Simulationen: `flaechen-zerlegen`
  - 7.2 Geometrische Sätze · *Geometric theorems* – Kurz: Neben-, Scheitel-, Stufen- und Wechselwinkel, Innen-, Außen- und Basiswinkelsatz, Kongruenzsätze und Satz des Thales. · *EN: Adjacent, vertical, corresponding and alternate angles, interior, exterior and base angle theorems, congruence theorems and Thales’ theorem.* – Simulationen: `winkel-geradenkreuzung` (7), `winkelsumme` (7), `dreieckskonstruktion` (7), `thales` (7)
  - 7.3 Konstruktion · *Construction* – Kurz: Dreiecke, Mittelsenkrechte, Seitenhalbierende, Winkelhalbierende, Inkreis, Umkreis, Thaleskreis und Schwerpunkt. · *EN: Triangles, perpendicular bisectors, medians, angle bisectors, incircle, circumcircle, Thales circle and centroid.* – Simulationen: `dreieckskonstruktion` (7), `mittelsenkrechte` (7), `besondere-linien`, `thales` (7)

### 8 Stochastik
*EN: Stochastics*

- Kurz (DE): Ein- und zweistufige Zufallsversuche mit Baumdiagramm, Wahrscheinlichkeiten aus langen Versuchsreihen schätzen, Laplace-Wahrscheinlichkeit und Pfadregeln.
- Kurz (EN): One- and two-stage random experiments with tree diagrams, estimating probabilities from long series of trials, Laplace probability and path rules.
- Simulationen: `gesetz-grosse-zahlen`, `baumdiagramm`
- Unterbereiche:
  - 8.1 Wahrscheinlichkeiten und Zufallsexperimente · *Probabilities and random experiments* – Kurz: Ein- und zweistufige Zufallsversuche und Baumdiagramm. · *EN: One- and two-stage random experiments and tree diagrams.* – Simulationen: `baumdiagramm` (8)
  - 8.2 Stochastische Regeln · *Rules of probability* – Kurz: Empirisches Gesetz der großen Zahlen, Laplace-Wahrscheinlichkeit und Pfadregeln. · *EN: Empirical law of large numbers, Laplace probability and path rules.* – Simulationen: `gesetz-grosse-zahlen`, `baumdiagramm` (8)
  - 8.3 Begriffsbildung · *Concepts* – Kurz: Ergebnis, Ereignis und Wahrscheinlichkeit. · *EN: Outcome, event and probability.* – Simulationen: –

## Zweite Stufe – „bis zum Ende der Sekundarstufe I“  
*Second stage up to the end of lower secondary*  
Jahrgangsstufe(n) im JSON: 9, 10  
(Quelle: Kernlehrplan Sek. I Mathematik (Heft 3401), Kap. 2.4.2, S. 32–35)

> Zweite Stufe bis zum Ende der Sekundarstufe I. Die Einordnung bei den Klassen 9 und 10 ist eine Annahme (G9, Ende der Sekundarstufe I nach Klasse 10). Die Lernbereiche stehen bei 9 und 10 gleich; jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben.

### 9 Arithmetik/Algebra
*EN: Arithmetic/algebra*

- Kurz (DE): Reelle Zahlen, Potenzen, Wurzeln und Logarithmen mit ihren Gesetzen, Näherungsverfahren sowie quadratische Gleichungen und Exponentialgleichungen lösen.
- Kurz (EN): Real numbers, powers, roots and logarithms with their laws, approximation methods, and solving quadratic and exponential equations.
- Simulationen: `quadratwurzel`, `gleichungen-grafisch`, `logarithmus`
- Unterbereiche:
  - 9.1 Zahlbereichserweiterung · *Extending the number system* – Kurz: Reelle Zahlen; rationale und irrationale Zahlen unterscheiden. · *EN: Real numbers; distinguishing rational and irrational numbers.* – Simulationen: `quadratwurzel` (9)
  - 9.2 Begriffsbildung · *Concepts* – Kurz: Potenzen, Wurzeln und Logarithmen, Zehnerpotenzschreibweise. · *EN: Powers, roots and logarithms, scientific notation.* – Simulationen: `quadratwurzel` (9), `logarithmus` (10)
  - 9.3 Gesetze und Regeln · *Laws and rules* – Kurz: Potenzgesetze und Wurzelgesetze, Wurzel- und Potenzschreibweise. · *EN: Laws of exponents and of roots, root and power notation.* – Simulationen: –
  - 9.4 Lösungsverfahren und Algorithmen · *Solution methods and algorithms* – Kurz: Näherungsverfahren für Quadratwurzeln, quadratische Gleichungen mit quadratischer Ergänzung, p-q-Formel und Satz von Vieta, Exponentialgleichungen durch Probieren und Logarithmieren. · *EN: Approximating square roots, quadratic equations by completing the square, the p-q formula and Vieta’s theorem, exponential equations by trial and by taking logarithms.* – Simulationen: `quadratwurzel` (9), `gleichungen-grafisch` (9), `logarithmus` (10)

### 10 Funktionen
*EN: Functions*

- Kurz (DE): Quadratische Funktionen in verschiedenen Termformen, exponentielles Wachstum und Sinusfunktionen für periodische Vorgänge; Parameter deuten und Modelle auswählen.
- Kurz (EN): Quadratic functions in different forms, exponential growth and sine functions for periodic processes; interpreting parameters and choosing models.
- Simulationen: `quadratische-funktion`, `parabel-drei-punkte`, `extremwert-parabel`, `funktionsplotter`, `einheitskreis`, `exponentielles-wachstum`, `sinusfunktion`
- Unterbereiche:
  - 10.1 Quadratische Funktionen · *Quadratic functions* – Kurz: Normal-, Scheitelpunkt- und faktorisierte Form, Scheitelpunkt, Symmetrie, Öffnung, Nullstellen, Verschieben und Strecken der Normalparabel und Extremwertprobleme. · *EN: Standard, vertex and factorised form, vertex, symmetry, opening, zeros, shifting and stretching the standard parabola, and optimisation problems.* – Simulationen: `quadratische-funktion`, `parabel-drei-punkte` (9), `extremwert-parabel` (9), `funktionsplotter`
  - 10.2 Exponentielle Funktionen · *Exponential functions* – Kurz: Anfangswert, Wachstumsfaktor und -rate, Verdopplungs- und Halbwertszeit, langfristige Entwicklung im Vergleich mit linearem Wachstum. · *EN: Initial value, growth factor and rate, doubling time and half-life, long-term behaviour compared with linear growth.* – Simulationen: `exponentielles-wachstum` (10)
  - 10.3 Sinusfunktionen · *Sine functions* – Kurz: Sinus und Kosinus am Einheitskreis, Grad- und Bogenmaß, Amplitude und Periode zeitlich periodischer Vorgänge. · *EN: Sine and cosine on the unit circle, degrees and radians, amplitude and period of processes that repeat in time.* – Simulationen: `einheitskreis`, `sinusfunktion` (10)

### 11 Geometrie
*EN: Geometry*

- Kurz (DE): Kreis und Kreisteile, Oberfläche und Volumen von Prisma, Zylinder, Pyramide, Kegel und Kugel, zentrische Streckung und Ähnlichkeit, Satz des Pythagoras, Kosinussatz und Trigonometrie.
- Kurz (EN): Circles and sectors, surface area and volume of prisms, cylinders, pyramids, cones and spheres, enlargement and similarity, Pythagoras’ theorem, the law of cosines and trigonometry.
- Simulationen: `kreiszahl-pi`, `prisma-zylinder`, `strahlensaetze`, `vergroessern`, `pythagoras`, `sinussatz-kosinussatz`, `sin-cos-tan-dreieck`, `pyramide-kegel-kugel`, `cavalieri`
- Unterbereiche:
  - 11.1 Kreis · *Circle* – Kurz: Umfang und Flächeninhalt von Kreis, Kreisbogen und Kreissektor, Herleitung durch Näherung, Tangente. · *EN: Circumference and area of circles, arcs and sectors, derived by approximation, tangents.* – Simulationen: `kreiszahl-pi` (9)
  - 11.2 Körper · *Solids* – Kurz: Oberfläche und Volumen von Kugel, Zylinder, Prisma, Kegel und Pyramide; Prinzip von Cavalieri. · *EN: Surface area and volume of spheres, cylinders, prisms, cones and pyramids; Cavalieri’s principle.* – Simulationen: `prisma-zylinder` (9), `pyramide-kegel-kugel` (10), `cavalieri` (10)
  - 11.3 Abbildung/Lagebeziehung · *Transformation/relative position* – Kurz: Zentrische Streckungen mit Zentrum und Streckfaktor, ähnliche Figuren. · *EN: Enlargements with centre and scale factor, similar figures.* – Simulationen: `strahlensaetze` (9), `vergroessern` (9)
  - 11.4 Geometrische Sätze · *Geometric theorems* – Kurz: Satz des Pythagoras mit Beweis, Kosinussatz als seine Verallgemeinerung. · *EN: Pythagoras’ theorem with proof, the law of cosines as its generalisation.* – Simulationen: `pythagoras` (9), `sinussatz-kosinussatz`
  - 11.5 Trigonometrie · *Trigonometry* – Kurz: Sinus, Kosinus und Tangens als Seitenverhältnisse ähnlicher rechtwinkliger Dreiecke; Längen und Winkel berechnen. · *EN: Sine, cosine and tangent as side ratios of similar right triangles; calculating lengths and angles.* – Simulationen: `sin-cos-tan-dreieck`, `sinussatz-kosinussatz`

### 12 Stochastik
*EN: Stochastics*

- Kurz (DE): Statistische Erhebungen planen und Manipulationen in Diagrammen erkennen; bedingte Wahrscheinlichkeit, Unabhängigkeit, Vierfeldertafel, Baumdiagramm und Kombinatorik.
- Kurz (EN): Planning statistical surveys and spotting manipulated diagrams; conditional probability, independence, two-way tables, tree diagrams and combinatorics.
- Simulationen: `vierfeldertafel`, `baumdiagramm`, `zaehlprinzip`, `bedingte-wahrscheinlichkeit`, `ziegenproblem`
- Unterbereiche:
  - 12.1 Statistische Daten · *Statistical data* – Kurz: Erhebungen mit digitalen Werkzeugen planen und auswerten, Diagramme kritisch prüfen und Manipulationen erkennen. · *EN: Planning and evaluating surveys with digital tools, checking diagrams critically and spotting manipulation.* – Simulationen: –
  - 12.2 Wahrscheinlichkeiten und Zufallsexperimente · *Probabilities and random experiments* – Kurz: Bedingte Wahrscheinlichkeit, stochastische Unabhängigkeit, Vierfeldertafel, Baumdiagramme und Pfadregeln sowie Anzahlen durch kombinatorische Überlegungen. · *EN: Conditional probability, stochastic independence, two-way tables, tree diagrams and path rules, as well as counting with combinatorial reasoning.* – Simulationen: `vierfeldertafel`, `baumdiagramm`, `zaehlprinzip` (9), `bedingte-wahrscheinlichkeit` (10), `ziegenproblem` (10)

## Einführungsphase  
*Introductory phase*  
Jahrgangsstufe(n) im JSON: 11  
(Quelle: Kernlehrplan Sek. II Mathematik (2026), Kap. 2.3)

> Einführungsphase der gymnasialen Oberstufe (G9: Jahrgangsstufe 11). Die Buchstaben A und G stehen im Lehrplan für die Inhaltsfelder; die Nummern der Schwerpunkte sind von uns vergeben. Kernlehrplan Sekundarstufe II von 2026, in Kraft ab 1. August 2027 beginnend mit der Einführungsphase; der Kernlehrplan von 2023 läuft aus und ist hier nicht abgebildet.

### EF-A Funktionen und Analysis (A)
*EN: Functions and calculus (A)*

- Kurz (DE): Potenzfunktionen und ganzrationale Funktionen, Transformationen, der Übergang von der mittleren zur lokalen Änderungsrate und die Untersuchung von Graphen mit der Ableitung.
- Kurz (EN): Power functions and polynomial functions, transformations, the step from average to instantaneous rate of change and analysing graphs with the derivative.
- Simulationen: `potenzfunktionen`, `ganzrationale-funktionen`, `funktionsplotter`, `grenzverhalten`, `transformationen`, `sinusfunktion`, `sekante-tangente`, `ableitungsfunktion`, `kurvendiskussion`
- Unterbereiche:
  - EF-A.1 Funktionen · *Functions* – Kurz: Potenzfunktionen mit ganzzahligen Exponenten und ganzrationale Funktionen; Polynomgleichungen durch Ausklammern lösen. · *EN: Power functions with integer exponents and polynomial functions; solving polynomial equations by factoring out.* – Simulationen: `potenzfunktionen`, `ganzrationale-funktionen`, `funktionsplotter`
  - EF-A.2 Eigenschaften von Funktionen · *Properties of functions* – Kurz: Verlauf des Graphen, Definitions- und Wertebereich, Nullstellen, Symmetrie und Verhalten für große x. · *EN: Shape of the graph, domain and range, zeros, symmetry and behaviour for large x.* – Simulationen: `ganzrationale-funktionen`, `grenzverhalten`
  - EF-A.3 Transformationen · *Transformations* – Kurz: Spiegeln, Verschieben und Strecken an beiden Achsen, auch bei der Sinusfunktion; Parameter deuten. · *EN: Reflecting, shifting and stretching along both axes, including the sine function; interpreting parameters.* – Simulationen: `transformationen`, `sinusfunktion`
  - EF-A.4 Grundverständnis des Ableitungsbegriffs · *Basic understanding of the derivative* – Kurz: Mittlere und lokale Änderungsrate, Sekante und Tangente, graphisches Ableiten. · *EN: Average and instantaneous rate of change, secant and tangent, sketching the derivative graphically.* – Simulationen: `sekante-tangente`, `ableitungsfunktion`
  - EF-A.5 Differentialrechnung · *Differential calculus* – Kurz: Potenz-, Summen- und Faktorregel, Monotonie, lokale und globale Extrema, Krümmung und Wendepunkte. · *EN: Power, sum and constant-multiple rules, monotonicity, local and global extrema, curvature and points of inflection.* – Simulationen: `kurvendiskussion`, `ableitungsfunktion`

### EF-G Analytische Geometrie und Lineare Algebra (G)
*EN: Analytic geometry and linear algebra (G)*

- Kurz (DE): Punkte und Vektoren im räumlichen Koordinatensystem, mit Vektoren rechnen, Geraden in Parameterform und ihre Lagebeziehungen.
- Kurz (EN): Points and vectors in a three-dimensional coordinate system, calculating with vectors, lines in parametric form and their relative positions.
- Simulationen: `koordinaten-3d`, `vektoren-3d`, `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - EF-G.1 Koordinatisierungen des Raumes · *Coordinates in space* – Kurz: Punkte, Ortsvektoren und Vektoren im räumlichen Koordinatensystem. · *EN: Points, position vectors and vectors in a three-dimensional coordinate system.* – Simulationen: `koordinaten-3d`, `vektoren-3d`
  - EF-G.2 Vektoroperationen · *Vector operations* – Kurz: Addition und Multiplikation mit einem Skalar. · *EN: Addition and multiplication by a scalar.* – Simulationen: `vektoren-3d`
  - EF-G.3 Eigenschaften von Vektoren · *Properties of vectors* – Kurz: Länge und Abstand mit dem Satz des Pythagoras, Kollinearität. · *EN: Length and distance using Pythagoras’ theorem, collinearity.* – Simulationen: `koordinaten-3d`, `vektoren-3d`
  - EF-G.4 Geraden und Strecken · *Lines and segments* – Kurz: Parameterform und Deutung der Parameter im Sachkontext. · *EN: Parametric form and interpreting the parameters in context.* – Simulationen: `geraden-ebenen`
  - EF-G.5 Lagebeziehung von Geraden · *Relative position of lines* – Kurz: Identisch, parallel, windschief oder sich schneidend. · *EN: Identical, parallel, skew or intersecting.* – Simulationen: `lage-abstaende`
  - EF-G.6 Schnittpunkte · *Points of intersection* – Kurz: Schnittpunkte von Geraden über lineare Gleichungssysteme. · *EN: Intersections of lines using systems of linear equations.* – Simulationen: `lage-abstaende`

## Qualifikationsphase – Grundkurs und Leistungskurs  
*Qualification phase – basic and advanced course*  
Jahrgangsstufe(n) im JSON: 12, 13  
(Quelle: Kernlehrplan Sek. II Mathematik (2026), Kap. 2.4.1 (Grundkurs) und 2.4.2 (Leistungskurs))

> Qualifikationsphase (G9: Jahrgangsstufen 12 und 13). Der Kernlehrplan unterscheidet Grundkurs und Leistungskurs, verteilt die Inhalte aber nicht auf Halbjahre; die Lernbereiche stehen deshalb bei 12 und 13 gleich. Abgebildet sind die Schwerpunkte des Leistungskurses; „Nur LK“ kennzeichnet, was im Grundkurs fehlt. Die Buchstaben A, G und S stehen im Lehrplan; die Nummern sind von uns vergeben.

### Q-A Funktionen und Analysis (A)
*EN: Functions and calculus (A)*

- Kurz (DE): Exponentialfunktionen und die e-Funktion, Produkt- und Kettenregel, Extremwertprobleme und Steckbriefaufgaben sowie Integralrechnung bis zum Hauptsatz.
- Kurz (EN): Exponential functions and the natural exponential function, product and chain rules, optimisation and reconstructing functions from conditions, and integral calculus up to the fundamental theorem.
- Simulationen: `e-funktion`, `logarithmus`, `funktionsplotter`, `grenzverhalten`, `umkehrfunktion`, `extremwertprobleme`, `funktionenscharen`, `kurvendiskussion`, `ober-untersummen`, `aenderungsrate`, `stammfunktion-grafisch`, `hauptsatz`, `rotationskoerper`
- Unterbereiche:
  - Q-A.1 Funktionen · *Functions* – Kurz: Ganzrationale Funktionen und Exponentialfunktionen; nur LK: allgemeine Sinus- und Kosinusfunktionen und die natürliche Logarithmusfunktion. · *EN: Polynomial and exponential functions; advanced course only: general sine and cosine functions and the natural logarithm.* – Simulationen: `e-funktion` (12), `logarithmus` (12), `funktionsplotter`
  - Q-A.2 Eigenschaften von Funktionen · *Properties of functions* – Kurz: Verlauf, Definitions- und Wertebereich, Nullstellen, Symmetrie, Verhalten für große x und Umkehrfunktionen (GK an der Wurzelfunktion). · *EN: Shape, domain and range, zeros, symmetry, behaviour for large x and inverse functions (basic course using the square root function).* – Simulationen: `grenzverhalten` (12), `umkehrfunktion` (12)
  - Q-A.3 Fortführung der Differentialrechnung · *Differential calculus continued* – Kurz: Produkt- und Kettenregel, Extremwertprobleme mit Nebenbedingung, Steckbriefaufgaben und Funktionen mit Parametern (im LK als Funktionsscharen). · *EN: Product and chain rules, optimisation with constraints, reconstructing functions from conditions and functions with parameters (families of functions in the advanced course).* – Simulationen: `extremwertprobleme`, `funktionenscharen`, `kurvendiskussion` (12)
  - Q-A.4 Integralrechnung · *Integral calculus* – Kurz: Produktsumme, orientierte Fläche, Bestands-, Integral- und Stammfunktion, bestimmtes Integral und Hauptsatz; nur LK: uneigentliche Integrale und Rotationsvolumen. · *EN: Riemann sums, signed area, accumulation, integral and antiderivative functions, definite integral and the fundamental theorem; advanced course only: improper integrals and volumes of revolution.* – Simulationen: `ober-untersummen`, `aenderungsrate`, `stammfunktion-grafisch`, `hauptsatz`, `rotationskoerper`

### Q-G Analytische Geometrie und Lineare Algebra (G)
*EN: Analytic geometry and linear algebra (G)*

- Kurz (DE): Skalarprodukt, Ebenen in Parameter- und Koordinatenform, Schnittpunkte und Schnittwinkel, lineare Gleichungssysteme und im Leistungskurs Lagebeziehungen und Abstände.
- Kurz (EN): Dot product, planes in parametric and coordinate form, intersections and angles, systems of linear equations, and in the advanced course relative positions and distances.
- Simulationen: `skalar-vektorprodukt`, `geraden-ebenen`, `lage-abstaende`
- Unterbereiche:
  - Q-G.1 Vektoroperation · *Vector operation* – Kurz: Skalarprodukt: Orthogonalität, Betrag und Winkel zwischen Vektoren. · *EN: Dot product: orthogonality, magnitude and angle between vectors.* – Simulationen: `skalar-vektorprodukt` (12)
  - Q-G.2 Ebenen · *Planes* – Kurz: Parameterform, Koordinatenform und Normalenvektor (LK: Normalenform), Orientierung im Raum. · *EN: Parametric form, coordinate form and normal vector (advanced course: normal form), orientation in space.* – Simulationen: `geraden-ebenen`
  - Q-G.3 Schnittwinkel · *Angles of intersection* – Kurz: Winkel zwischen Geraden, zwischen Gerade und Ebene und zwischen Ebenen. · *EN: Angles between lines, between a line and a plane, and between planes.* – Simulationen: `lage-abstaende`
  - Q-G.4 Schnittpunkte · *Points of intersection* – Kurz: Schnittpunkte von Geraden und Ebenen. · *EN: Intersections of lines and planes.* – Simulationen: `lage-abstaende`, `geraden-ebenen`
  - Q-G.5 Lagebeziehungen und Abstände · *Relative positions and distances* – Kurz: Nur LK: Lage und Abstände von Punkten, Geraden und Ebenen in allen Kombinationen, Spiegelungen an Ebenen. · *EN: Advanced course only: positions and distances of points, lines and planes in all combinations, reflections in planes.* – Simulationen: `lage-abstaende`
  - Q-G.6 Lineare Gleichungssysteme · *Systems of linear equations* – Kurz: Ein algorithmisches Lösungsverfahren für bis zu drei Unbekannte, Lösungsmengen deuten. · *EN: An algorithmic method for up to three unknowns, interpreting solution sets.* – Simulationen: –

### Q-S Stochastik (S)
*EN: Stochastics (S)*

- Kurz (DE): Mehrstufige Zufallsexperimente und bedingte Wahrscheinlichkeiten, Zufallsgrößen mit Erwartungswert und Streuung, Binomialverteilung und im Leistungskurs Prognose- und Konfidenzintervalle sowie die Normalverteilung.
- Kurz (EN): Multi-stage random experiments and conditional probabilities, random variables with expectation and spread, the binomial distribution, and in the advanced course prediction and confidence intervals and the normal distribution.
- Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`, `binomialverteilung`, `galtonbrett`, `normalverteilung`
- Unterbereiche:
  - Q-S.1 Mehrstufige Zufallsexperimente · *Multi-stage random experiments* – Kurz: Urnenmodelle, Baumdiagramme, Vierfeldertafeln, Gegenereignis, bedingte Wahrscheinlichkeiten, Unabhängigkeit und Pfadregeln. · *EN: Urn models, tree diagrams, two-way tables, complementary events, conditional probabilities, independence and path rules.* – Simulationen: `vierfeldertafel`, `bedingte-wahrscheinlichkeit`, `geburtstagsproblem`
  - Q-S.2 Kenngrößen · *Measures* – Kurz: Erwartungswert, Varianz und Standardabweichung. · *EN: Expected value, variance and standard deviation.* – Simulationen: `binomialverteilung`
  - Q-S.3 Diskrete Zufallsgrößen · *Discrete random variables* – Kurz: Wahrscheinlichkeitsverteilungen und ihre Kenngrößen. · *EN: Probability distributions and their measures.* – Simulationen: –
  - Q-S.4 Binomialverteilung · *Binomial distribution* – Kurz: Kenngrößen und Histogramme, Einfluss von n und p; nur LK: Binomialkoeffizient und σ-Regeln. · *EN: Measures and histograms, the effect of n and p; advanced course only: binomial coefficient and sigma rules.* – Simulationen: `binomialverteilung`, `galtonbrett` (12)
  - Q-S.5 Beurteilende Statistik · *Inferential statistics* – Kurz: Nur LK: Prognoseintervall, Konfidenzintervall und nötiger Stichprobenumfang. · *EN: Advanced course only: prediction interval, confidence interval and required sample size.* – Simulationen: –
  - Q-S.6 Normalverteilung · *Normal distribution* – Kurz: Nur LK: Dichtefunktion (Gauß’sche Glockenkurve), Parameter μ und σ und Verteilungsfunktion als Integralfunktion. · *EN: Advanced course only: density function (Gaussian bell curve), parameters μ and σ and the cumulative distribution function as an integral function.* – Simulationen: `normalverteilung` (13)

# Teil C – JSON

Die vollständige JSON-Datei liegt separat bei: `nordrhein-westfalen-gymnasium-mathematik.json` (erzeugt aus `src/curriculum/lehrplaene/nordrhein-westfalen-gymnasium-mathematik.ts`, dieselben Daten).

# Teil D – Lücken und Vorschläge

## D.1 Nicht zugeordnete Simulationen (Ausnahmen in `NOT_IN_CURRICULUM`)

| Simulation | Grund |
|---|---|
| `polstellen-asymptoten` | Gebrochenrationale Funktionen mit Pol- und Nullstellen kommen im Kernlehrplan nicht vor. Die Oberstufe nennt nur Potenzfunktionen (im LK mit rationalem Exponenten) und das Verhalten für x → ±∞. |
| `newton-verfahren` | Das Newton-Verfahren wird nicht genannt. Die Sek. I hat nur ein Näherungsverfahren für Quadratwurzeln, die Oberstufe (LK) deutet die Ableitung als lineare Näherung. |
| `monte-carlo-pi` | Kein passender Schwerpunkt. Simulationen von Zufallsvorgängen stehen in der ersten Stufe (Klassen 7/8) und in der Qualifikationsphase, eine Flächen- bzw. π-Schätzung nicht. |
| `signifikanztest` | Hypothesentests stehen nicht im Kernlehrplan 2026. Die beurteilende Statistik (nur LK) umfasst Prognose- und Konfidenzintervalle. |
| `kugeln` | Kugeln (Kugelgleichung, Tangentialebene) stehen nicht im Kernlehrplan der Oberstufe. |
| `taylor-polynome` | nicht im Kernlehrplan (Hochschule) |
| `fourier-reihen` | nicht im Kernlehrplan (Hochschule) |
| `matrix-abbildungen` | Matrizen und Übergangsprozesse stehen nicht im Kernlehrplan 2026. |

## D.2 Unterbereiche ohne passende Simulation

- **Erprobungsstufe:** 4.2 Begriffsbildung (absolute und relative Häufigkeit)
- **Erste Stufe:** 8.3 Begriffsbildung (Ergebnis, Ereignis, Wahrscheinlichkeit)
- **Zweite Stufe:** 9.3 Gesetze und Regeln (Potenz- und Wurzelgesetze); 12.1 Statistische Daten (Erhebung, Manipulation)
- **Qualifikationsphase:** Q-G.6 Lineare Gleichungssysteme (Gauß-Verfahren); Q-S.3 Diskrete Zufallsgrößen; Q-S.5 Beurteilende Statistik (nur LK)

## D.3 Vorschläge für neue Simulationen

| Vorschlag (Titel) | Idee | schließt Lücke in |
|---|---|---|
| Potenzgesetze sehen | Produkte und Quotienten von Potenzen als Faktorketten legen und kürzen. | 9.3 |
| Gauß-Verfahren | Ein LGS mit drei Unbekannten Schritt für Schritt umformen, dazu die drei Ebenen im Raum. | Q-G.6 |
| Zufallsgröße und Erwartungswert | Glücksspiel mit Gewinnplan: Verteilung, Erwartungswert und Streuung, „faires Spiel“. | Q-S.2, Q-S.3 |
| Prognose- und Konfidenzintervall | Stichproben ziehen, σ-Intervalle einzeichnen und sehen, wie oft p getroffen wird. | Q-S.5 |
| Irreführende Diagramme | Achsen abschneiden, Flächen verzerren: dieselben Daten wirken anders. | 12.1 (teilweise schon `diagramme`, aber nur für Klasse 6–7 gedacht) |

# Teil E – Annahmen und Unklarheiten

1. **Jahrgänge der Sekundarstufe I.** Der Kernlehrplan nennt nur die Erprobungsstufe (Klassen 5 und 6 laut Erlass) sowie eine erste und eine zweite Stufe „bis zum Ende der Sekundarstufe I“. Erste Stufe = Klassen 7/8 und zweite Stufe = Klassen 9/10 ist eine **Annahme** (G9, Ende der Sek. I nach Klasse 10). Bitte am Lehrplan bzw. Lehrplannavigator prüfen.
2. **Oberstufe ohne Jahrgänge.** Einführungsphase = 11, Qualifikationsphase = 12 und 13 (G9) ist eine Annahme; der Lehrplan verteilt die Qualifikationsphase nicht auf Halbjahre, deshalb stehen die Lernbereiche bei 12 und 13 gleich.
3. **Fassung der Oberstufe.** Abgebildet ist der Kernlehrplan von 2026, der ab 01.08.2027 mit der Einführungsphase gilt (Vorgabe der Projektleitung). Bis dahin unterrichten die Schulen nach dem Kernlehrplan von 2023, der hier nicht vorliegt.
4. **Grund- und Leistungskurs zusammengefasst.** Die Schwerpunkte des Grundkurses sind im Leistungskurs enthalten; abgebildet sind die LK-Schwerpunkte, mit „nur LK“ für Zusätze (z. B. Q-G.5 Lagebeziehungen und Abstände, Q-S.5 Beurteilende Statistik, Q-S.6 Normalverteilung, Rotationskörper). Die Unterschiede in der Tiefe (z. B. Kettenregel im GK nur mit linearer innerer Funktion und e-Funktion) stehen nur im Lehrplan.
5. **Nummern.** Inhaltsfelder und Schwerpunkte der Sek. I sind im Original nicht nummeriert. Die Nummern 1–12 sind von uns vergeben und laufen über die drei Stufen durch (1–4 Erprobungsstufe, 5–8 erste Stufe, 9–12 zweite Stufe), damit gleichnamige Inhaltsfelder verschiedener Stufen nicht verwechselt werden. In der Oberstufe stammen die Buchstaben A, G, S aus dem Lehrplan; „EF-“ und „Q-“ sowie die Nummern der Schwerpunkte sind von uns.
6. **Erweiterte Klassenstufen** (in `src/curriculum/mathematik.ts`), weil NRW das Thema in einem anderen Jahrgang unterrichtet:

   | ID | bisher | neu | Lernbereich | Fundstelle |
   |---|---|---|---|---|
   | `zahlengerade` | 5–5 | 5–7 | 5.1 Zahlbereichserweiterung, 5.3 Gesetze und Regeln (Klasse 7) | Sek. I, Kap. 2.4.1, Arithmetik/Algebra (1) und (3): rationale Zahlen an der Zahlengeraden, Vorzeichenregeln zur Addition |
   | `zaehlprinzip` | 5–8 | 5–9 | 12.2 Wahrscheinlichkeiten und Zufallsexperimente (Klasse 9) | Sek. I, Kap. 2.4.2, Stochastik (4): kombinatorische Überlegungen |
   | `potenzfunktionen` | 9–10 | 9–11 | EF-A.1 Funktionen | Sek. II, Kap. 2.3, A: Potenzfunktionen mit ganzzahligen Exponenten (in der Sek. I nicht genannt) |

7. **Unsichere Zuordnungen (Entwurf, bitte am Lehrplan prüfen):**
   - `zehnerpotenzen` bei 1.5 Darstellung (Klassen 5/6): Die Zehnerpotenzschreibweise steht erst in der zweiten Stufe (9.2); in der Erprobungsstufe nur Stellenwerttafel und Potenzschreibweise bei Primfaktoren. Die Simulation ist für Klasse 5–6 gedacht, deshalb nicht erweitert.
   - `prozentstreifen` auch bei 1.5 Darstellung (Prozentzahl als Darstellung); die Prozentrechnung selbst steht in 6.3.
   - `ziegenproblem` bei 12.2 (bedingte Wahrscheinlichkeit, Klasse 10); der Lehrplan nennt das Problem nicht.
   - `geburtstagsproblem` bei Q-S.1 (Pfadregeln und Gegenereignis).
   - `binomialverteilung` auch bei Q-S.2 Kenngrößen (Erwartungswert und Standardabweichung am Beispiel der Binomialverteilung).
   - `umkehrfunktion` bei Q-A.2; der GK behandelt die Umkehrfunktion nur an der Wurzelfunktion.
   - `logarithmus` bei Q-A.1: Die natürliche Logarithmusfunktion steht nur im LK.
   - `skalar-vektorprodukt` bei Q-G.1: Der Lehrplan nennt nur das Skalarprodukt, nicht das Vektorprodukt.
   - `sinussatz-kosinussatz` bei 11.4/11.5: Der Lehrplan nennt nur den Kosinussatz.
8. **Nicht abgebildet:** die prozessbezogenen Kompetenzen (Operieren, Modellieren, Problemlösen, Argumentieren, Kommunizieren) und die Vorgaben zu digitalen Werkzeugen.
