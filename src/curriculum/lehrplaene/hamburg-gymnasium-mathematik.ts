import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Bildungspläne der Freien und Hansestadt Hamburg. Die Bildungspläne nennen
 * „www.hamburg.de/bildungsplaene“; ein Link zur einzelnen Datei steht im Dokument nicht.
 * Verlinkt ist diese Adresse mit https.
 */
const SOURCE = 'https://www.hamburg.de/bildungsplaene';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/hamburg-gymnasium-mathematik.md, Teil E).
const KS_5_6 = L(
  'Doppeljahrgang 5/6: Der Bildungsplan gliedert das Kerncurriculum in Unterrichtsmodule je Doppeljahrgang; innerhalb von 5/6 ist die Reihenfolge frei. Die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Die Nummern sind die Modulnummern des Bildungsplans.',
  'Grades 5/6: the curriculum divides the core content into teaching modules for each pair of grades; within 5/6 the order is free. The units are therefore the same for grades 5 and 6 and are shown as one stage. The numbers are the module numbers of the curriculum.',
);

const KS_7_8 = L(
  'Doppeljahrgang 7/8: Unterrichtsmodule des Kerncurriculums, innerhalb des Doppeljahrgangs in freier Reihenfolge; die Lernbereiche stehen deshalb bei 7 und 8 gleich und werden als eine Stufe gezeigt. Die Nummern sind die Modulnummern des Bildungsplans.',
  'Grades 7/8: teaching modules of the core curriculum, in any order within the two grades; the units are therefore the same for grades 7 and 8 and are shown as one stage. The numbers are the module numbers of the curriculum.',
);

const KS_9_10 = L(
  'Doppeljahrgang 9/10: Die Unterrichtsmodule sind in der angegebenen Reihenfolge zu erarbeiten; die Lernbereiche stehen bei 9 und 10 gleich und werden als eine Stufe gezeigt. Die Module 9 und 10 tragen im Bildungsplan beide den Titel „Exponentielles Wachstum“. Die Nummern sind die Modulnummern des Bildungsplans.',
  'Grades 9/10: the teaching modules are to be covered in the given order; the units are the same for grades 9 and 10 and are shown as one stage. Modules 9 and 10 both carry the title “Exponential growth” in the curriculum. The numbers are the module numbers of the curriculum.',
);

const S_11 = L(
  'Studienstufe, erstes Jahr (S1/S2; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 11): Module 1.1, 1.2, 2 und 3. Modul 1.2 kann auch vor Modul 4 unterrichtet werden, die Binomialverteilung aus Modul 5 schon nach Modul 2. eA = nur auf erhöhtem Anforderungsniveau. Die Nummern sind die Modulnummern des Bildungsplans.',
  'Studienstufe, first year (S1/S2; at the Gymnasium with Abitur after grade 12: grade 11): modules 1.1, 1.2, 2 and 3. Module 1.2 may also be taught before module 4, and the binomial distribution from module 5 right after module 2. eA = higher level only. The numbers are the module numbers of the curriculum.',
);

const S_12 = L(
  'Studienstufe, zweites Jahr (S3/S4; am Gymnasium: Jahrgangsstufe 12): Module 4 und 5 sowie eines der Wahlpflichtmodule 6 (Analytische Geometrie) und 7 (Lineare Algebra). eA = nur auf erhöhtem Anforderungsniveau. Die Nummern sind die Modulnummern des Bildungsplans.',
  'Studienstufe, second year (S3/S4; at the Gymnasium: grade 12): modules 4 and 5 and one of the elective modules 6 (analytic geometry) and 7 (linear algebra). eA = higher level only. The numbers are the module numbers of the curriculum.',
);

/** Doppeljahrgang 5/6, Module 1–16 (Kap. 2.3). */
const KS_5_6_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Beschreibende Statistik I', 'Descriptive statistics I'),
    summary: L(
      'Daten sammeln und ordnen, Strich- und Ranglisten, Umfragen, Häufigkeitstabellen und Diagramme, Durchschnitt und Zentralwert.',
      'Collecting and ordering data, tally and rank lists, surveys, frequency tables and charts, mean and median.',
    ),
    simulations: ['diagramme'],
  },
  {
    code: '2',
    title: L('Natürliche Zahlen', 'Natural numbers'),
    summary: L(
      'Stellenwertsystem bis eine Million, Zahlenstrahl, Runden, Quadratzahlen und Potenzschreibweise, Grundrechenarten, Rechenregeln und Rechenbäume, erste negative Zahlen.',
      'The place value system up to one million, the number line, rounding, square numbers and powers, the four operations, rules of arithmetic and calculation trees, first negative numbers.',
    ),
    simulations: ['stellenwerte', 'zahlengerade', 'termbaum', 'zehnerpotenzen'],
  },
  {
    code: '3',
    title: L('Teilbarkeit', 'Divisibility'),
    summary: L(
      'Gerade und ungerade Zahlen, Teiler und Teilbarkeitsregeln mit Begründung, Primzahlen.',
      'Even and odd numbers, divisors and divisibility rules with reasons, prime numbers.',
    ),
    simulations: ['primfaktoren'],
  },
  {
    code: '4',
    title: L('Ebene Figuren und Koordinatensystem', 'Plane figures and the coordinate system'),
    summary: L(
      'Punkt, Strecke, Strahl und Gerade, parallel und senkrecht, Punkte und Figuren im Koordinatensystem, Lagepläne, Parallelogramm, Rechteck und Quadrat.',
      'Point, segment, ray and line, parallel and perpendicular, points and figures in the coordinate system, site plans, parallelogram, rectangle and square.',
    ),
    simulations: ['koordinaten-lage', 'vierecke'],
  },
  {
    code: '5',
    title: L('Körper', 'Solids'),
    summary: L(
      'Kopfgeometrie und Würfelbauten, Körper unterscheiden und beschreiben, Netze, Schrägbilder und Modelle von Würfel, Quader und Dreiecksprisma.',
      'Mental geometry and cube buildings, telling solids apart and describing them, nets, oblique drawings and models of cube, cuboid and triangular prism.',
    ),
    simulations: ['koerpernetze'],
  },
  {
    code: '6',
    title: L('Brüche, Anteile und Prozente', 'Fractions, parts and percentages'),
    summary: L(
      'Brüche als Anteile, am Bruchstreifen und Zahlenstrahl, ordnen und vergleichen, kürzen und erweitern, Prozentdarstellung und Prozentstreifen.',
      'Fractions as parts, on fraction strips and the number line, ordering and comparing, simplifying and expanding, percentages and percentage strips.',
    ),
    simulations: ['bruchteile', 'brueche-vergleichen', 'prozentstreifen'],
  },
  {
    code: '7',
    title: L('Positive Zahlen in Dezimalschreibweise', 'Positive numbers in decimal notation'),
    summary: L(
      'Stellenwertsystem nach rechts erweitern, Dezimalzahlen am Zahlenstrahl, ordnen, runden, addieren und subtrahieren.',
      'Extending place value to the right, decimals on the number line, ordering, rounding, adding and subtracting.',
    ),
    simulations: ['dezimalbrueche', 'zahlengerade'],
  },
  {
    code: '8',
    title: L('Mit Größen in Kontexten rechnen', 'Calculating with quantities in context'),
    summary: L(
      'Zeit, Länge und Masse messen und schätzen, Einheiten umformen, Vorsätze von Nano bis Giga und Zehnerpotenzen, maßstabsgetreues Zeichnen und Entfernungen auf Karten.',
      'Measuring and estimating time, length and mass, converting units, prefixes from nano to giga and powers of ten, drawing to scale and distances on maps.',
    ),
    simulations: ['einheiten', 'massstab', 'zehnerpotenzen'],
  },
  {
    code: '9',
    title: L('Flächeninhalt', 'Area'),
    summary: L(
      'Flächen messen, Flächeneinheiten, Umfang und Flächeninhalt von Quadrat, Rechteck und rechtwinkligem Dreieck.',
      'Measuring area, units of area, perimeter and area of square, rectangle and right triangle.',
    ),
    simulations: ['umfang-flaeche'],
  },
  {
    code: '10',
    title: L('Rauminhalt', 'Volume'),
    summary: L(
      'Volumen messen, Volumeneinheiten, Volumen und Oberfläche von Würfel und Quader mit Einheitswürfeln und Netz.',
      'Measuring volume, units of volume, volume and surface area of cube and cuboid with unit cubes and nets.',
    ),
    simulations: ['quader-volumen'],
  },
  {
    code: '11',
    title: L('Rechnen mit Brüchen', 'Calculating with fractions'),
    summary: L(
      'Brüche am Bruchstreifen und Rechteckfeld addieren, subtrahieren, multiplizieren und dividieren, Sachaufgaben mit Brüchen.',
      'Adding, subtracting, multiplying and dividing fractions with fraction strips and rectangles, word problems with fractions.',
    ),
    simulations: ['brueche-rechnen'],
  },
  {
    code: '12',
    title: L('Winkel und Kreis', 'Angles and circles'),
    summary: L(
      'Winkel erkennen, benennen, schätzen, messen und zeichnen, Winkelarten, Kreise mit Mittelpunkt, Radius und Durchmesser.',
      'Recognising, naming, estimating, measuring and drawing angles, types of angle, circles with centre, radius and diameter.',
    ),
    simulations: ['winkel-messen'],
  },
  {
    code: '13',
    title: L('Abbildungen und Symmetrien', 'Transformations and symmetry'),
    summary: L(
      'Achsen-, Punkt- und Drehsymmetrie, Spiegeln an Achse und Punkt, Verschieben, eigene symmetrische Muster.',
      'Line, point and rotational symmetry, reflecting in a line and a point, translation, own symmetric patterns.',
    ),
    simulations: ['spiegelung'],
  },
  {
    code: '14',
    title: L('In Dezimalschreibweise rechnen', 'Calculating in decimal notation'),
    summary: L(
      'Multiplizieren und dividieren mit Zehnerpotenzen und Dezimalzahlen, schriftlich und im Kopf, Überschlag, Wechsel zwischen Bruch- und Dezimalschreibweise.',
      'Multiplying and dividing with powers of ten and decimals, on paper and mentally, estimating, switching between fraction and decimal notation.',
    ),
    simulations: ['dezimalbrueche', 'zehnerpotenzen'],
  },
  {
    code: '15',
    title: L('Schaubilder', 'Graphs'),
    summary: L(
      'Zusammenhänge zwischen zwei Größen aus dem Alltag, Wertepaare eintragen und ablesen, Skalierung, Verlauf von Graphen qualitativ beschreiben.',
      'Relationships between two everyday quantities, plotting and reading pairs of values, scaling, describing the shape of graphs qualitatively.',
    ),
    simulations: ['funktion-zuordnung'],
  },
  {
    code: '16',
    title: L('Zufall und Statistik', 'Chance and statistics'),
    summary: L(
      'Sicher, unmöglich, wahrscheinlich, Zufallsexperimente planen und durchführen, relative Häufigkeiten und Kreisdiagramme, Vorhersagen bei großen Wurfzahlen.',
      'Certain, impossible, likely, planning and carrying out random experiments, relative frequencies and pie charts, predictions for many throws.',
    ),
    simulations: ['gesetz-grosse-zahlen', 'diagramme'],
  },
];

/** Doppeljahrgang 7/8, Module 1–14. */
const KS_7_8_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Positive und negative rationale Zahlen', 'Positive and negative rational numbers'),
    summary: L(
      'Negative Zahlen im Alltag und am Zahlenstrahl, Vorzeichen und Betrag, ordnen, die vier Grundrechenarten mit Vorzeichenregeln.',
      'Negative numbers in everyday life and on the number line, sign and absolute value, ordering, the four operations with sign rules.',
    ),
    simulations: ['zahlengerade'],
  },
  {
    code: '2',
    title: L('Funktionen und Dreisatz', 'Functions and the rule of three'),
    summary: L(
      'Abhängige Größen messen und darstellen, proportionale und antiproportionale Zuordnungen, Darstellungswechsel zwischen Sprache, Tabelle, Graph und Term, Dreisatz.',
      'Measuring and showing dependent quantities, proportional and inversely proportional relationships, switching between words, table, graph and term, the rule of three.',
    ),
    simulations: ['proportional', 'funktion-zuordnung', 'hyperbel'],
  },
  {
    code: '3',
    title: L('Prozent- und Zinsrechnung', 'Percentages and interest'),
    summary: L(
      'Grundwert, Prozentwert und Prozentsatz am Prozentstreifen, Rabatte, prozentuale Zu- und Abnahme, Zinsen und Zinseszins.',
      'Base value, percentage value and rate on a percentage strip, discounts, percentage increase and decrease, simple and compound interest.',
    ),
    simulations: ['prozentstreifen'],
  },
  {
    code: '4',
    title: L('Wahrscheinlichkeitsrechnung I', 'Probability I'),
    summary: L(
      'Laplace-Experimente, Ergebnisse abzählen, Gegenwahrscheinlichkeit, zweistufige Baumdiagramme, Erwartungswert und faire Spiele, Simulation am Rechner.',
      'Laplace experiments, counting outcomes, complementary probability, two-stage tree diagrams, expected value and fair games, computer simulation.',
    ),
    simulations: ['zaehlprinzip', 'gesetz-grosse-zahlen', 'baumdiagramm'],
  },
  {
    code: '5',
    title: L('Dreiecksgeometrie', 'Triangle geometry'),
    summary: L(
      'Winkel an Geradenkreuzungen, Innenwinkelsumme, Dreiecksarten, Höhen, Mittelsenkrechten und Winkelhalbierende mit Um- und Inkreis, Konstruktionen und Kongruenz, Satz des Thales.',
      'Angles at intersecting lines, the angle sum, types of triangle, altitudes, perpendicular and angle bisectors with circumcircle and incircle, constructions and congruence, Thales’ theorem.',
    ),
    simulations: ['winkel-geradenkreuzung', 'winkelsumme', 'dreieckskonstruktion', 'mittelsenkrechte', 'besondere-linien', 'thales'],
  },
  {
    code: '6',
    title: L('Terme und Gleichungen I', 'Terms and equations I'),
    summary: L(
      'Variablen und Terme in verschiedenen Zusammenhängen aufstellen und deuten.',
      'Setting up and interpreting variables and terms in different contexts.',
    ),
    simulations: ['termbaum'],
  },
  {
    code: '7',
    title: L('Vierecke', 'Quadrilaterals'),
    summary: L(
      'Vierecksarten und ihre Eigenschaften, Vierecke im Koordinatensystem, Flächeninhalt von Parallelogramm und Trapez herleiten.',
      'Types of quadrilateral and their properties, quadrilaterals in the coordinate system, deriving the area of parallelogram and trapezium.',
    ),
    simulations: ['vierecke', 'flaechen-zerlegen'],
  },
  {
    code: '8',
    title: L('Lineare Funktionen', 'Linear functions'),
    summary: L(
      'Gleichmäßige Änderungen, konstante Änderungsrate und Startwert, Steigung und y-Achsenabschnitt, Terme und Graphen linearer Funktionen.',
      'Uniform change, constant rate of change and starting value, slope and y-intercept, terms and graphs of linear functions.',
    ),
    simulations: ['lineare-funktion', 'funktionsplotter'],
  },
  {
    code: '9',
    title: L('Kreis', 'Circle'),
    summary: L(
      'Umfang und Flächeninhalt von Kreisen messen und berechnen, π empirisch gewinnen, Kreisteile, Näherung krummlinig begrenzter Flächen.',
      'Measuring and calculating the circumference and area of circles, finding π by experiment, parts of circles, approximating curved areas.',
    ),
    simulations: ['kreiszahl-pi', 'monte-carlo-pi'],
  },
  {
    code: '10',
    title: L('Terme und Gleichungen II', 'Terms and equations II'),
    summary: L(
      'Lineare Gleichungen aufstellen und mit Äquivalenzumformungen lösen, nichtlineare Gleichungen und Ungleichungen, Terme umformen, binomische Formeln.',
      'Setting up linear equations and solving them by equivalent transformations, non-linear equations and inequalities, rearranging terms, binomial formulas.',
    ),
    simulations: ['waagemodell', 'binomische-formeln', 'gleichungen-grafisch'],
  },
  {
    code: '11',
    title: L('Körper – Prisma und Zylinder', 'Solids – prism and cylinder'),
    summary: L(
      'Netze, Schrägbilder und Modelle von Prismen und Zylindern, Oberflächeninhalt und Volumen, zusammengesetzte Körper.',
      'Nets, oblique drawings and models of prisms and cylinders, surface area and volume, composite solids.',
    ),
    simulations: ['prisma-zylinder', 'koerpernetze'],
  },
  {
    code: '12',
    title: L('Statistik', 'Statistics'),
    summary: L(
      'Statistische Erhebungen planen, Daten darstellen und kritisch lesen, Kenngrößen mit Median und Quartilen, Boxplots und Manipulation von Darstellungen.',
      'Planning statistical surveys, showing data and reading it critically, measures including median and quartiles, box plots and misleading charts.',
    ),
    simulations: ['boxplot', 'diagramme'],
  },
  {
    code: '13',
    title: L('Lineare Funktionen und Gleichungssysteme', 'Linear functions and systems of equations'),
    summary: L(
      'Lineare Gleichungssysteme mit zwei Variablen aufstellen, grafisch und rechnerisch lösen, Lösbarkeit untersuchen, digitale Werkzeuge.',
      'Setting up systems of linear equations in two variables, solving them graphically and algebraically, examining solvability, digital tools.',
    ),
    simulations: ['lgs-grafisch'],
  },
  {
    code: '14',
    title: L('Reelle Zahlen', 'Real numbers'),
    summary: L(
      'Irrationale Zahlen, Näherungsverfahren am Rechner, Quadrat- und Kubikwurzeln schätzen, ordnen und berechnen, die Zahlbereiche ℕ, ℤ, ℚ und ℝ.',
      'Irrational numbers, approximation procedures on the computer, estimating, ordering and calculating square and cube roots, the number sets ℕ, ℤ, ℚ and ℝ.',
    ),
    simulations: ['quadratwurzel'],
  },
];

/** Doppeljahrgang 9/10, Module 1–13. */
const KS_9_10_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Satz des Pythagoras', 'Pythagoras’ theorem'),
    summary: L(
      'Satz des Pythagoras und Umkehrung, Seitenlängen berechnen, Anwendungen und Beweis.',
      'Pythagoras’ theorem and its converse, calculating side lengths, applications and proof.',
    ),
    simulations: ['pythagoras'],
  },
  {
    code: '2',
    title: L('Körper – Pyramide, Kegel und Kugel', 'Solids – pyramid, cone and sphere'),
    summary: L(
      'Netze und Schrägbilder, Oberflächeninhalt und Volumen von Pyramide, Kegel und Kugel, Satz von Cavalieri, Herleitung der Volumenformeln.',
      'Nets and oblique drawings, surface area and volume of pyramid, cone and sphere, Cavalieri’s principle, deriving the volume formulas.',
    ),
    simulations: ['pyramide-kegel-kugel', 'cavalieri'],
  },
  {
    code: '3',
    title: L('Quadratische Funktionen und Gleichungen', 'Quadratic functions and equations'),
    summary: L(
      'Quadratische Funktionen in Sachsituationen, Formen des Funktionsterms und Einfluss der Parameter, quadratische Gleichungen numerisch, grafisch und rechnerisch lösen.',
      'Quadratic functions in context, forms of the term and the effect of parameters, solving quadratic equations numerically, graphically and algebraically.',
    ),
    simulations: ['quadratische-funktion', 'parabel-drei-punkte', 'extremwert-parabel', 'gleichungen-grafisch'],
  },
  {
    code: '4',
    title: L('Potenzgesetze', 'Laws of exponents'),
    summary: L(
      'Zehnerpotenzschreibweise, Potenzgesetze erklären und beweisen, negative und rationale Exponenten, Wurzeln als Potenzen.',
      'Scientific notation, explaining and proving the laws of exponents, negative and rational exponents, roots as powers.',
    ),
    simulations: ['quadratwurzel'],
  },
  {
    code: '5',
    title: L('Wahrscheinlichkeitsrechnung II', 'Probability II'),
    summary: L(
      'Mehrstufige Zufallsexperimente mit Pfadregeln, Gegenwahrscheinlichkeit und Erwartungswert, Zählprinzipien, bedingte Wahrscheinlichkeiten mit Vierfeldertafeln und Baumdiagrammen.',
      'Multi-stage random experiments with path rules, complementary probability and expected value, counting principles, conditional probability with two-way tables and tree diagrams.',
    ),
    simulations: ['zaehlprinzip', 'baumdiagramm', 'geburtstagsproblem', 'vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
  },
  {
    code: '6',
    title: L('Ähnlichkeit', 'Similarity'),
    summary: L(
      'Ähnlichkeit und Kongruenz, Skalierungsfaktoren für Strecken, Flächen und Körper, ähnliche Dreiecke, Strahlensätze.',
      'Similarity and congruence, scale factors for lengths, areas and solids, similar triangles, intercept theorems.',
    ),
    simulations: ['strahlensaetze', 'vergroessern'],
  },
  {
    code: '7',
    title: L('Trigonometrie', 'Trigonometry'),
    summary: L(
      'Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Winkel und Seiten berechnen, Zusammenhänge in allgemeinen Dreiecken.',
      'Sine, cosine and tangent in right triangles, calculating angles and sides, relationships in general triangles.',
    ),
    simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz'],
  },
  {
    code: '8',
    title: L('Periodische Vorgänge', 'Periodic processes'),
    summary: L(
      'Kreisbewegungen und ihre Projektionen, Sinus- und Kosinusfunktion, Einfluss der Parameter, periodische Vorgänge beschreiben.',
      'Circular motion and its projections, the sine and cosine functions, the effect of parameters, describing periodic processes.',
    ),
    simulations: ['einheitskreis', 'sinusfunktion'],
  },
  {
    code: '9',
    title: L('Exponentielles Wachstum', 'Exponential growth'),
    summary: L(
      'Lineares und exponentielles Wachstum unterscheiden, Exponentialfunktionen in Sachsituationen und ihre Darstellungen, Logarithmus als Umkehrung des Potenzierens.',
      'Telling linear and exponential growth apart, exponential functions in context and how to represent them, the logarithm as the inverse of taking powers.',
    ),
    simulations: ['logarithmus', 'exponentielles-wachstum'],
  },
  {
    code: '10',
    title: L('Exponentielles Wachstum (Funktionen der Form a · bˣ)', 'Exponential growth (functions of the form a · bˣ)'),
    summary: L(
      'Exponentialfunktionen der Form f(x) = a · bˣ in Sachsituationen, Darstellungswechsel und Merkmale, Logarithmen mit dem Taschenrechner.',
      'Exponential functions of the form f(x) = a · bˣ in context, switching representations and features, logarithms on the calculator.',
    ),
    simulations: ['logarithmus', 'exponentielles-wachstum'],
  },
  {
    code: '11',
    title: L('Üben und Vertiefen', 'Practice and consolidation'),
    summary: L(
      'Üben und Vertiefen zu allen Leitideen und prozessbezogenen Kompetenzen mit Blick auf die Prüfung.',
      'Practice and consolidation across all key ideas and process skills with a view to the exam.',
    ),
  },
  {
    code: '12',
    title: L('Funktionsklassen', 'Classes of functions'),
    summary: L(
      'Bekannte und neue Funktionen vergleichen, ganzrationale und einfache gebrochenrationale Funktionen, Nullstellen und Substitution, Wurzelfunktion als Umkehrfunktion.',
      'Comparing known and new functions, polynomial and simple rational functions, zeros and substitution, the square root function as an inverse function.',
    ),
    simulations: ['funktionsplotter', 'hyperbel', 'potenzfunktionen', 'ganzrationale-funktionen', 'transformationen', 'umkehrfunktion'],
  },
  {
    code: '13',
    title: L('Einführung in die Differentialrechnung', 'Introduction to differential calculus'),
    summary: L(
      'Mittlere und lokale Änderungsrate, Tangentensteigung über den Differenzenquotienten, Ableitungsfunktion, Tangentengleichung und Steigungswinkel.',
      'Average and local rate of change, the slope of the tangent from the difference quotient, the derivative function, the tangent equation and angle of slope.',
    ),
    simulations: ['sekante-tangente', 'ableitungsfunktion'],
  },
];

/** Studienstufe, erstes Jahr (S1/S2): Module 1.1, 1.2, 2 und 3. */
const S_11_UNITS: CurriculumUnit[] = [
  {
    code: '1.1',
    title: L('Von der Änderungsrate zum Bestand (Analysis)', 'From rate of change to total (analysis)'),
    summary: L(
      'Ganzrationale, einfache gebrochenrationale und Wurzelfunktionen mit Parametern, Symmetrie, Verhalten im Unendlichen und Asymptoten, Ableitungsregeln, Kurvendiskussion und Optimierung, Integral, Stammfunktion und Hauptsatz; eA: Funktionsscharen, Rotationskörper.',
      'Polynomial, simple rational and root functions with parameters, symmetry, behaviour at infinity and asymptotes, rules of differentiation, curve sketching and optimisation, the integral, antiderivatives and the fundamental theorem; eA: families of functions, solids of revolution.',
    ),
    simulations: [
      'funktionsplotter',
      'polstellen-asymptoten',
      'ganzrationale-funktionen',
      'transformationen',
      'grenzverhalten',
      'sekante-tangente',
      'ableitungsfunktion',
      'kurvendiskussion',
      'extremwertprobleme',
      'funktionenscharen',
      'stammfunktion-grafisch',
      'ober-untersummen',
      'hauptsatz',
      'aenderungsrate',
      'rotationskoerper',
    ],
  },
  {
    code: '1.2',
    title: L('Von der Änderungsrate zum Bestand (trigonometrische Funktionen)', 'From rate of change to total (trigonometric functions)'),
    summary: L(
      'Sinus- und Kosinusfunktionen mit Parametern in Sachsituationen, ihre Ableitungen und Stammfunktionen, Produkt- und Kettenregel, Flächeninhalte.',
      'Sine and cosine functions with parameters in context, their derivatives and antiderivatives, the product and chain rules, areas.',
    ),
    simulations: ['sinusfunktion', 'transformationen'],
  },
  {
    code: '2',
    title: L('Der Zufall steht Modell (Stochastik)', 'Modelling chance (stochastics)'),
    summary: L(
      'Relative Häufigkeit und Wahrscheinlichkeit, Lage- und Streumaße mit Varianz und Standardabweichung, Baumdiagramme und Vierfeldertafeln, stochastische Unabhängigkeit, Simulationen.',
      'Relative frequency and probability, measures of centre and spread with variance and standard deviation, tree diagrams and two-way tables, stochastic independence, simulations.',
    ),
    simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'geburtstagsproblem', 'ziegenproblem', 'galtonbrett'],
  },
  {
    code: '3',
    title: L('Koordinatengeometrie', 'Coordinate geometry'),
    summary: L(
      'Vektoren in Ebene und Raum, Ortsvektoren, Punkte und Objekte im Koordinatensystem, Rechnen mit Vektoren; eA: Betrag und Skalarprodukt.',
      'Vectors in the plane and in space, position vectors, points and objects in the coordinate system, calculating with vectors; eA: magnitude and dot product.',
    ),
    simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt'],
  },
];

/** Studienstufe, zweites Jahr (S3/S4): Module 4 und 5, Wahlpflichtmodule 6 und 7. */
const S_12_UNITS: CurriculumUnit[] = [
  {
    code: '4',
    title: L('Änderungsraten und Bestände (Exponentialfunktionen)', 'Rates of change and totals (exponential functions)'),
    summary: L(
      'Wachstumsmodelle mit e-Funktionen, Eulersche Zahl, ln-Funktion als Umkehrfunktion, Ableitungen und Integrale als Bestandsänderungen; eA: Funktionsscharen, numerische Nullstellenbestimmung.',
      'Growth models with exponential functions, Euler’s number, the ln function as the inverse, derivatives and integrals as changes in totals; eA: families of functions, finding zeros numerically.',
    ),
    simulations: ['logarithmus', 'umkehrfunktion', 'e-funktion', 'newton-verfahren', 'kurvendiskussion', 'funktionenscharen', 'aenderungsrate'],
  },
  {
    code: '5',
    title: L('Anwendungsprobleme der Stochastik', 'Applied problems in stochastics'),
    summary: L(
      'Diskrete Zufallsgrößen, Binomialverteilung mit Erwartungswert, Standardabweichung und Sigma-Regeln; eA: Hypothesentests und Normalverteilung.',
      'Discrete random variables, the binomial distribution with expected value, standard deviation and sigma rules; eA: hypothesis tests and the normal distribution.',
    ),
    simulations: ['galtonbrett', 'binomialverteilung', 'signifikanztest', 'normalverteilung'],
  },
  {
    code: '6',
    title: L('Analytische Geometrie (Wahlpflichtmodul)', 'Analytic geometry (elective module)'),
    summary: L(
      'Geraden und Ebenen mit Vektoren, Ebenengleichungen, Spurpunkte, Lagebeziehungen, Schnittpunkte und Winkel, Normalenvektoren, Spiegelung; eA: Abstände, Gauß-Verfahren.',
      'Lines and planes with vectors, plane equations, trace points, relative positions, intersections and angles, normal vectors, reflection; eA: distances, Gaussian elimination.',
    ),
    simulations: ['skalar-vektorprodukt', 'geraden-ebenen', 'lage-abstaende'],
  },
  {
    code: '7',
    title: L('Lineare Algebra (Wahlpflichtmodul)', 'Linear algebra (elective module)'),
    summary: L(
      'Lineare Gleichungssysteme mit dem Gauß-Verfahren, Wachstums- und Umverteilungsprozesse mit Übergangsmatrizen, Matrixpotenzen, Fixvektoren und Langzeitverhalten.',
      'Systems of linear equations with Gaussian elimination, growth and redistribution processes with transition matrices, matrix powers, fixed vectors and long-term behaviour.',
    ),
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(mathematik, n, units),
});

/**
 * Mathematik am Gymnasium in Hamburg (G8, Abitur nach Jahrgangsstufe 12) nach
 * - „Bildungsplan Gymnasium Sekundarstufe I, Mathematik“, Behörde für Schule und Berufsbildung,
 *   Hamburg 2022, und
 * - „Bildungsplan Studienstufe, Mathematik“, Behörde für Schule und Berufsbildung, Hamburg 2022.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/hamburg-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Sek. I nach den Unterrichtsmodulen der Doppeljahrgänge 5/6, 7/8 und 9/10,
 * Studienstufe nach den Modulen des ersten (11) und zweiten Jahres (12).
 *
 * Überschriften entsprechen den Bildungsplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const hamburgGymnasiumMathematik: StateCurriculum = {
  id: 'hamburg-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('hamburg-gymnasium', 'hamburg-gymnasium'),
  state: L('Hamburg', 'Hamburg'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Bildungsplan',
  grades: [
    grade(5, KS_5_6, KS_5_6_UNITS),
    grade(6, KS_5_6, KS_5_6_UNITS),
    grade(7, KS_7_8, KS_7_8_UNITS),
    grade(8, KS_7_8, KS_7_8_UNITS),
    grade(9, KS_9_10, KS_9_10_UNITS),
    grade(10, KS_9_10, KS_9_10_UNITS),
    grade(11, S_11, S_11_UNITS),
    grade(12, S_12, S_12_UNITS),
  ],
};
