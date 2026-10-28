import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Der Senator für Kinder und Bildung, Bremen. Die Bildungspläne nennen
 * „http://www.bildung.bremen.de“ als Herausgeber-Adresse; ein Link zur einzelnen Datei steht
 * im Dokument nicht. Verlinkt ist diese Adresse mit https.
 */
const SOURCE = 'https://www.bildung.bremen.de';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/bremen-gymnasium-mathematik.md, Teil E).
const KS_5_6 = L(
  'Jahrgangsstufen 5 und 6: Der Bildungsplan beschreibt Anforderungen am Ende der Jahrgangsstufe 6; die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Die Reihenfolge der Module ist nicht festgelegt. Die Codes sind die Modulnummern des Bildungsplans (A Arithmetik/Algebra, G Geometrie, F Funktionale Zusammenhänge, S Stochastik).',
  'Grades 5 and 6: the curriculum describes requirements at the end of grade 6, so the units are the same for grades 5 and 6 and are shown as one stage. The order of the modules is not fixed. The codes are the module numbers of the curriculum (A arithmetic/algebra, G geometry, F functions, S stochastics).',
);

const KS_7_9 = L(
  'Jahrgangsstufen 7 bis 9 (Gymnasium mit Abitur nach Klasse 12): Der Bildungsplan beschreibt Anforderungen am Ende der Jahrgangsstufe 9; die Lernbereiche stehen deshalb bei 7, 8 und 9 gleich und werden als eine Stufe gezeigt. Die Reihenfolge der Module ist nicht festgelegt. Die Codes sind die Modulnummern des Bildungsplans.',
  'Grades 7 to 9 (Gymnasium with Abitur after grade 12): the curriculum describes requirements at the end of grade 9, so the units are the same for grades 7, 8 and 9 and are shown as one stage. The order of the modules is not fixed. The codes are the module numbers of the curriculum.',
);

const EP = L(
  'Einführungsphase der gymnasialen Oberstufe (am Gymnasium Jahrgangsstufe 10): Basismodule BM 1 bis BM 3 und Modul A 1. Die Codes sind die Modulnummern des Bildungsplans.',
  'Introductory phase of upper secondary (at the Gymnasium grade 10): basic modules BM 1 to BM 3 and module A 1. The codes are the module numbers of the curriculum.',
);

const QP = L(
  'Qualifikationsphase (am Gymnasium Jahrgangsstufen 11 und 12): Der Bildungsplan ordnet die Module nicht einzelnen Jahrgängen zu; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. In Linearer Algebra / Analytischer Geometrie wird einer der beiden Schwerpunkte LA oder AG unterrichtet. LK = nur im Leistungskurs. Die Codes sind die Modulnummern des Bildungsplans.',
  'Qualification phase (at the Gymnasium grades 11 and 12): the curriculum does not assign the modules to single grades, so the units are the same for grades 11 and 12 and are shown as one stage. In linear algebra / analytic geometry one of the two focuses LA or AG is taught. LK = advanced course only. The codes are the module numbers of the curriculum.',
);

/** Anforderungen am Ende der Jahrgangsstufe 6 (Kap. 3.2.1). */
const KS_5_6_UNITS: CurriculumUnit[] = [
  {
    code: 'A1',
    title: L('Natürliche Zahlen', 'Natural numbers'),
    summary: L('Natürliche Zahlen in Stellenwerttafel und an der Zahlengeraden, Grundvorstellungen der Grundrechenarten, Kopf- und schriftliches Rechnen, Teiler und Primzahlen.', 'Natural numbers in the place value table and on the number line, the meaning of the four operations, mental and written arithmetic, divisors and prime numbers.'),
    simulations: ['stellenwerte', 'zahlengerade', 'termbaum', 'primfaktoren', 'zehnerpotenzen'],
  },
  {
    code: 'A2',
    title: L('Brüche', 'Fractions'),
    summary: L('Brüche in Rechteck- und Streifenbildern und am Zahlenstrahl, gleichwertige Brüche durch Kürzen und Erweitern, ordnen und vergleichen, erste Rechnungen mit Brüchen.', 'Fractions in rectangle and strip diagrams and on the number line, equivalent fractions by simplifying and expanding, ordering and comparing, first calculations with fractions.'),
    simulations: ['bruchteile', 'brueche-vergleichen', 'brueche-rechnen'],
  },
  {
    code: 'A3',
    title: L('Dezimalzahlen', 'Decimals'),
    summary: L('Dezimalzahlen in Stellenwerttafel und an der Zahlengeraden, Grundrechenarten im Kopf und schriftlich, Runden und Überschlag.', 'Decimals in the place value table and on the number line, the four operations mentally and in writing, rounding and estimating.'),
    simulations: ['dezimalbrueche', 'zahlengerade'],
  },
  {
    code: 'A4',
    title: L('Umgang mit Größen', 'Working with quantities'),
    summary: L('Größen schätzen, messen und in Einheiten umrechnen.', 'Estimating and measuring quantities and converting units.'),
    simulations: ['einheiten'],
  },
  {
    code: 'A5',
    title: L('Rationale Zahlen', 'Rational numbers'),
    summary: L('Negative Zahlen im Alltag, Zahlbereichserweiterung bis ℚ, ordnen, Vorzeichenregeln und Grundrechenarten.', 'Negative numbers in everyday life, extending the number system to ℚ, ordering, sign rules and the four operations.'),
    simulations: ['zahlengerade'],
  },
  {
    code: 'A6',
    title: L('Vertiefte Bruchrechnung', 'Further fraction arithmetic'),
    summary: L('Verhältnisse als Brüche, Multiplikation und Division von Brüchen mit Grundvorstellungen.', 'Ratios as fractions, multiplying and dividing fractions with their meaning.'),
    simulations: ['brueche-rechnen'],
  },
  {
    code: 'G1',
    title: L('Formen in Ebene und Raum I', 'Shapes in the plane and in space I'),
    summary: L('Vierecksarten benennen und systematisieren, Körper mit Netzen und Schrägbildern, Modelle von Körpern.', 'Naming and classifying quadrilaterals, solids with nets and oblique drawings, models of solids.'),
    simulations: ['vierecke', 'koerpernetze'],
  },
  {
    code: 'G2',
    title: L('Geometrische Grundbegriffe', 'Basic geometric terms'),
    summary: L('Figuren und Körper mit Grundbegriffen beschreiben, senkrechte und parallele Linien.', 'Describing figures and solids with basic terms, perpendicular and parallel lines.'),
    simulations: ['vierecke'],
  },
  {
    code: 'G3',
    title: L('Umfänge und Flächeninhalte sowie Volumina und Oberflächeninhalte I', 'Perimeter, area, volume and surface area I'),
    summary: L('Messen mit Einheiten, Umfang und Flächeninhalt von Rechtecken, Volumen und Oberflächeninhalt von Quadern.', 'Measuring with units, perimeter and area of rectangles, volume and surface area of cuboids.'),
    simulations: ['umfang-flaeche', 'quader-volumen'],
  },
  {
    code: 'G4',
    title: L('Winkel', 'Angles'),
    summary: L('Winkel benennen, Winkelarten, Winkel schätzen, messen und zeichnen.', 'Naming angles, types of angle, estimating, measuring and drawing angles.'),
    simulations: ['winkel-messen'],
  },
  {
    code: 'G5',
    title: L('Winkelsumme und Winkelsätze', 'Angle sum and angle theorems'),
    summary: L('Winkelsummensatz im Dreieck, Neben-, Scheitel- und Stufenwinkel.', 'The angle sum in triangles, adjacent, vertical and corresponding angles.'),
    simulations: ['winkel-geradenkreuzung', 'winkelsumme'],
  },
  {
    code: 'G6',
    title: L('Geometrische Abbildungen', 'Geometric transformations'),
    summary: L('Figuren im Koordinatensystem verschieben und an achsenparallelen Geraden spiegeln.', 'Translating figures in the coordinate system and reflecting them in lines parallel to the axes.'),
    simulations: ['koordinaten-lage', 'spiegelung'],
  },
  {
    code: 'F1',
    title: L('Maßstab', 'Scale'),
    summary: L('Größen mit Repräsentanten schätzen, Größen aus maßstäblichen Zeichnungen entnehmen, maßstabsgerecht zeichnen.', 'Estimating quantities with reference objects, reading quantities from scale drawings, drawing to scale.'),
    simulations: ['massstab'],
  },
  {
    code: 'F2',
    title: L('Zeit-Weg-Diagramme', 'Distance–time graphs'),
    summary: L('Koordinatensysteme mit passender Skalierung, Wertepaare eintragen und ablesen, Zeit-Weg-Diagramme erstellen und deuten.', 'Coordinate systems with suitable scales, plotting and reading pairs of values, drawing and interpreting distance–time graphs.'),
    simulations: ['koordinaten-lage', 'funktion-zuordnung'],
  },
  {
    code: 'S1',
    title: L('Statistik I', 'Statistics I'),
    summary: L('Befragungen planen, Daten in Listen und Tabellen, Säulen- und Balkendiagramme, Median und Spannweite.', 'Planning surveys, data in lists and tables, bar charts, median and range.'),
    simulations: ['diagramme'],
  },
  {
    code: 'S2',
    title: L('Wahrscheinlichkeitsrechnung I', 'Probability I'),
    summary: L('Zufallsexperimente und erste Wahrscheinlichkeiten.', 'Random experiments and first probabilities.'),
    simulations: ['gesetz-grosse-zahlen'],
  },
];

/** Anforderungen am Ende der Jahrgangsstufe 9 (Kap. 3.2.2). */
const KS_7_9_UNITS: CurriculumUnit[] = [
  {
    code: 'A7',
    title: L('Prozentrechnung', 'Percentages'),
    summary: L('Prozentrechnung mit Grundwert, Prozentwert und Prozentsatz, Zinsrechnung.', 'Percentages with base value, percentage value and rate, interest.'),
    simulations: ['prozentstreifen'],
  },
  {
    code: 'A8',
    title: L('Terme und lineare Gleichungen', 'Terms and linear equations'),
    summary: L('Zusammenhänge mit Variablen und Termen beschreiben, Terme umformen und binomische Formeln, lineare Gleichungen numerisch, algebraisch und grafisch lösen.', 'Describing relationships with variables and terms, rearranging terms and binomial formulas, solving linear equations numerically, algebraically and graphically.'),
    simulations: ['termbaum', 'waagemodell', 'binomische-formeln'],
  },
  {
    code: 'A9',
    title: L('Potenzen und Wurzeln', 'Powers and roots'),
    summary: L('Quadratwurzeln, Zehnerpotenzschreibweise, Heron-Verfahren oder Intervallschachtelung mit digitalen Werkzeugen, Erweiterung zu den reellen Zahlen.', 'Square roots, scientific notation, Heron’s method or nested intervals with digital tools, extending to the real numbers.'),
    simulations: ['quadratwurzel', 'zehnerpotenzen'],
  },
  {
    code: 'A10',
    title: L('Lineare Gleichungssysteme', 'Systems of linear equations'),
    summary: L('Lineare Gleichungssysteme numerisch, grafisch und mit Einsetzungs-, Gleichsetzungs- und Additionsverfahren lösen, Lösbarkeit untersuchen.', 'Solving systems of linear equations numerically, graphically and by substitution, equating and elimination, examining solvability.'),
    simulations: ['lgs-grafisch'],
  },
  {
    code: 'A11',
    title: L('Quadratische Gleichungen', 'Quadratic equations'),
    summary: L('Quadratische Gleichungen numerisch, algebraisch und grafisch lösen, Lösbarkeit und Anwendungen.', 'Solving quadratic equations numerically, algebraically and graphically, solvability and applications.'),
    simulations: ['gleichungen-grafisch'],
  },
  {
    code: 'G7',
    title: L('Formen in Ebene und Raum II', 'Shapes in the plane and in space II'),
    summary: L('Besondere Dreiecke und regelmäßige Vielecke, Schrägbilder und Netze von Prismen.', 'Special triangles and regular polygons, oblique drawings and nets of prisms.'),
    simulations: ['koerpernetze', 'prisma-zylinder'],
  },
  {
    code: 'G8',
    title: L('Geometrische Konstruktionen, Symmetrieeigenschaften und Kongruenz', 'Geometric constructions, symmetry and congruence'),
    summary: L('Dreiecke konstruieren, Mittelsenkrechten und Winkelhalbierende, Lösbarkeit von Konstruktionen, Kongruenz und Symmetrie begründen.', 'Constructing triangles, perpendicular and angle bisectors, solvability of constructions, justifying congruence and symmetry.'),
    simulations: ['dreieckskonstruktion', 'mittelsenkrechte', 'besondere-linien'],
  },
  {
    code: 'G9',
    title: L('Umfänge und Flächeninhalte sowie Volumina und Oberflächeninhalte II', 'Perimeter, area, volume and surface area II'),
    summary: L('Umfang und Flächeninhalt von Dreiecken, Parallelogrammen und Trapezen, Oberfläche und Volumen gerader Prismen.', 'Perimeter and area of triangles, parallelograms and trapeziums, surface area and volume of right prisms.'),
    simulations: ['flaechen-zerlegen', 'prisma-zylinder'],
  },
  {
    code: 'G10',
    title: L('Formen in Ebene und Raum III', 'Shapes in the plane and in space III'),
    summary: L('Pyramiden, Zylinder, Kegel und Kugeln beschreiben, Schrägbilder und Netze.', 'Describing pyramids, cylinders, cones and spheres, oblique drawings and nets.'),
    simulations: ['pyramide-kegel-kugel'],
  },
  {
    code: 'G11',
    title: L('Ähnlichkeit', 'Similarity'),
    summary: L('Zentrische Streckungen, Eigenschaften von Figuren mit Ähnlichkeitsbeziehungen begründen.', 'Enlargements, justifying properties of figures with similarity.'),
    simulations: ['vergroessern'],
  },
  {
    code: 'G12',
    title: L('Umfänge und Flächeninhalte sowie Volumina und Oberflächeninhalte III', 'Perimeter, area, volume and surface area III'),
    summary: L('Umfang und Flächeninhalt von Kreisen, Oberfläche und Volumen von Pyramiden, Zylindern, Kegeln, Kugeln und zusammengesetzten Körpern.', 'Circumference and area of circles, surface area and volume of pyramids, cylinders, cones, spheres and composite solids.'),
    simulations: ['kreiszahl-pi', 'prisma-zylinder', 'pyramide-kegel-kugel'],
  },
  {
    code: 'G13',
    title: L('Satz des Pythagoras und Satz des Thales', 'Pythagoras’ theorem and Thales’ theorem'),
    summary: L('Satz des Pythagoras begründen und anwenden, auch im Raum, Rechtwinkligkeit mit dem Satz des Thales begründen.', 'Justifying and applying Pythagoras’ theorem, also in space, justifying right angles with Thales’ theorem.'),
    simulations: ['thales', 'pythagoras'],
  },
  {
    code: 'G14',
    title: L('Trigonometrische Beziehungen', 'Trigonometric relationships'),
    summary: L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck.', 'Sine, cosine and tangent in right triangles.'),
    simulations: ['sin-cos-tan-dreieck'],
  },
  {
    code: 'F4',
    title: L('Proportionale und antiproportionale Zuordnungen', 'Proportional and inversely proportional relationships'),
    summary: L('Zuordnungen in Worten, Tabellen und Graphen, Gesetzmäßigkeiten erkennen, Berechnungen im Alltag.', 'Relationships in words, tables and graphs, recognising patterns, everyday calculations.'),
    simulations: ['proportional', 'funktion-zuordnung', 'hyperbel'],
  },
  {
    code: 'F5',
    title: L('Lineare Funktionen', 'Linear functions'),
    summary: L('Lineare Zusammenhänge in Worten, Tabelle, Term und Graph, Steigung und Merkmale, Anwendungen mit digitalen Werkzeugen.', 'Linear relationships in words, tables, terms and graphs, slope and features, applications with digital tools.'),
    simulations: ['lineare-funktion', 'funktionsplotter'],
  },
  {
    code: 'F6',
    title: L('Quadratische Funktionen', 'Quadratic functions'),
    summary: L('Quadratische Funktionen in Normal-, Scheitelpunkt- und faktorisierter Form, Bedeutung der Parameter, Schnittpunkte und Anwendungen.', 'Quadratic functions in standard, vertex and factored form, meaning of the parameters, intersections and applications.'),
    simulations: ['quadratische-funktion', 'parabel-drei-punkte', 'extremwert-parabel'],
  },
  {
    code: 'S3',
    title: L('Häufigkeiten', 'Frequencies'),
    summary: L('Daten kritisch lesen, Manipulationen erkennen, absolute und relative Häufigkeiten, Kreisdiagramme, Mittelwert, Median, Quartile und Boxplots.', 'Reading data critically, spotting manipulation, absolute and relative frequencies, pie charts, mean, median, quartiles and box plots.'),
    simulations: ['diagramme', 'boxplot'],
  },
  {
    code: 'S4',
    title: L('Wahrscheinlichkeitsrechnung II', 'Probability II'),
    summary: L('Laplace-Regel, mehrstufige Laplace-Experimente, Chancen und Risiken, Gesetz der großen Zahlen und Simulationen.', 'The Laplace rule, multi-stage Laplace experiments, chances and risks, the law of large numbers and simulations.'),
    simulations: ['gesetz-grosse-zahlen', 'monte-carlo-pi'],
  },
  {
    code: 'S5',
    title: L('Statistik II', 'Statistics II'),
    summary: L('Baumdiagramme für zwei- und mehrstufige Zufallsversuche.', 'Tree diagrams for two- and multi-stage random experiments.'),
    simulations: ['baumdiagramm'],
  },
  {
    code: 'S6',
    title: L('Kombinatorik', 'Combinatorics'),
    summary: L('Zählstrategien und systematisches Zählen.', 'Counting strategies and systematic counting.'),
    simulations: ['zaehlprinzip'],
  },
  {
    code: 'S7',
    title: L('Wahrscheinlichkeitsrechnung III', 'Probability III'),
    summary: L('Wahrscheinlichkeiten mehrstufiger Zufallsexperimente mit Pfadregeln.', 'Probabilities of multi-stage experiments with the path rules.'),
    simulations: ['baumdiagramm'],
  },
];

/** Einführungsphase (Kap. 3.1). */
const EP_UNITS: CurriculumUnit[] = [
  {
    code: 'BM 1',
    title: L('Grundlagen aus der Algebra', 'Basics of algebra'),
    summary: L('Binomische Formeln, Potenz- und Logarithmusgesetze, lineare, quadratische, Potenz-, Bruch-, Wurzel-, Exponential- und trigonometrische Gleichungen, auch näherungsweise.', 'Binomial formulas, laws of powers and logarithms, linear, quadratic, power, fractional, radical, exponential and trigonometric equations, also approximately.'),
    simulations: ['logarithmus'],
  },
  {
    code: 'BM 2',
    title: L('Geometrie', 'Geometry'),
    summary: L('Figuren im Koordinatensystem, Sinus, Kosinus und Tangens im rechtwinkligen Dreieck und ihre Symmetrien.', 'Figures in the coordinate system, sine, cosine and tangent in right triangles and their symmetries.'),
    simulations: ['sin-cos-tan-dreieck', 'einheitskreis'],
  },
  {
    code: 'BM 3',
    title: L('Grundlagen zu Funktionen', 'Basics of functions'),
    summary: L(
      'Funktionsbegriff und Darstellungen, Nullstellen und Schnittpunkte, Symmetrie, Transformationen, Grenzwerte und Asymptoten, Umkehrfunktionen; ganzrationale, Exponential-, Sinus- und Kosinusfunktionen, Wurzelfunktion und 1/x.',
      'The concept of function and its representations, zeros and intersections, symmetry, transformations, limits and asymptotes, inverse functions; polynomial, exponential, sine and cosine functions, the square root function and 1/x.',
    ),
    simulations: ['funktionsplotter', 'hyperbel', 'polstellen-asymptoten', 'potenzfunktionen', 'einheitskreis', 'sinusfunktion', 'exponentielles-wachstum', 'ganzrationale-funktionen', 'transformationen', 'grenzverhalten', 'umkehrfunktion'],
  },
  {
    code: 'A 1',
    title: L('Einführung in die Differentialrechnung', 'Introduction to differential calculus'),
    summary: L('Mittlere und lokale Änderungsrate, Tangente und Ableitungsfunktion, Ableitungsregeln, Monotonie, Krümmung, Extrem- und Wendepunkte, Steckbriefaufgaben; Newton-Verfahren als Anregung.', 'Average and local rate of change, tangent and derivative function, rules of differentiation, monotonicity, curvature, extreme and inflection points, reconstructing functions; Newton’s method as a suggestion.'),
    simulations: ['sekante-tangente', 'ableitungsfunktion', 'newton-verfahren', 'kurvendiskussion'],
  },
];

/** Qualifikationsphase (Kap. 3.2). */
const QP_UNITS: CurriculumUnit[] = [
  {
    code: 'A 2',
    title: L('Einführung in die Integralrechnung', 'Introduction to integral calculus'),
    summary: L('Integral als rekonstruierter Bestand und Flächeninhalt, Hauptsatz, Stammfunktionen; LK: Ober- und Untersummen, Mittelwerte, Rotationskörper.', 'The integral as reconstructed total and area, the fundamental theorem, antiderivatives; LK: upper and lower sums, mean values, solids of revolution.'),
    simulations: ['stammfunktion-grafisch', 'ober-untersummen', 'hauptsatz', 'aenderungsrate', 'rotationskoerper'],
  },
  {
    code: 'A 3',
    title: L('Fortführung der Analysis', 'Further analysis'),
    summary: L('Natürliche Exponentialfunktion und Logarithmus, verknüpfte und verkettete Funktionen, Funktionen mit Parametern, Anwendungen und begrenztes Wachstum; LK: Funktionenscharen, ln-Funktion, logistisches Wachstum.', 'The natural exponential function and logarithm, combined and composite functions, functions with parameters, applications and limited growth; LK: families of functions, the ln function, logistic growth.'),
    simulations: ['funktionsplotter', 'logarithmus', 'umkehrfunktion', 'e-funktion', 'kurvendiskussion', 'extremwertprobleme', 'funktionenscharen'],
  },
  {
    code: 'S 1',
    title: L('Grundlagen der Statistik und der Wahrscheinlichkeitsrechnung', 'Basics of statistics and probability'),
    summary: L('Kombinatorik, Baumdiagramme und Vierfeldertafeln, bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit; LK: Satz der totalen Wahrscheinlichkeit und Satz von Bayes.', 'Combinatorics, tree diagrams and two-way tables, conditional probability and stochastic independence; LK: law of total probability and Bayes’ theorem.'),
    simulations: ['geburtstagsproblem', 'vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
  },
  {
    code: 'S 2',
    title: L('Die Binomialverteilung als spezielle diskrete Wahrscheinlichkeitsverteilung', 'The binomial distribution as a discrete probability distribution'),
    summary: L('Binomialverteilung mit Erwartungswert und Standardabweichung, Anwendbarkeit; LK: Signifikanztests.', 'The binomial distribution with expected value and standard deviation, when it applies; LK: significance tests.'),
    simulations: ['galtonbrett', 'binomialverteilung', 'signifikanztest'],
  },
  {
    code: 'S 3',
    title: L('Normalverteilungen (LK)', 'Normal distributions (LK)'),
    summary: L('LK: stetige Zufallsgrößen, Gaußsche Glockenkurve, Näherung der Binomialverteilung, σ-Umgebungen.', 'LK: continuous random variables, the Gaussian bell curve, approximating the binomial distribution, σ intervals.'),
    simulations: ['normalverteilung'],
  },
  {
    code: 'LA/AG',
    title: L('Vektoren in geometrischen Zusammenhängen (LA 1 bzw. AG 2)', 'Vectors in geometric contexts (LA 1 or AG 2)'),
    summary: L('Vektoren als Zahlentupel, Rechnen mit Vektoren, Betrag und Skalarprodukt; im Schwerpunkt AG auch das Vektorprodukt.', 'Vectors as tuples, calculating with vectors, magnitude and dot product; in the AG focus also the cross product.'),
    simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt'],
  },
  {
    code: 'LA',
    title: L('Schwerpunkt Lineare Algebra (LA 2 bis LA 4)', 'Focus linear algebra (LA 2 to LA 4)'),
    summary: L('Lineare Gleichungssysteme und Matrizenkalkül, Umverteilungen und Populationsentwicklungen mit Übergangs- und Populationsmatrizen, Fixvektoren und Langzeitverhalten; LK: Eigenvektoren.', 'Systems of linear equations and matrix calculus, redistribution and population models with transition and population matrices, fixed vectors and long-term behaviour; LK: eigenvectors.'),
  },
  {
    code: 'AG',
    title: L('Schwerpunkt Analytische Geometrie (AG 1, AG 3 bis AG 5)', 'Focus analytic geometry (AG 1, AG 3 to AG 5)'),
    summary: L('Lineare Gleichungssysteme, Geraden und Ebenen, Lagebeziehungen, Projektionen, Spiegelungen, Abstände und Winkel.', 'Systems of linear equations, lines and planes, relative positions, projections, reflections, distances and angles.'),
    simulations: ['geraden-ebenen', 'lage-abstaende'],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(mathematik, n, units),
});

/**
 * Mathematik am Gymnasium in Bremen (Abitur nach Jahrgangsstufe 12) nach
 * - „Mathematik, Bildungsplan für das Gymnasium“ (Sekundarstufe I, Jahrgänge 5–9), Der Senator
 *   für Kinder und Bildung, Stand 08/2026, und
 * - „Mathematik, Bildungsplan für die Gymnasiale Oberstufe – Einführungsphase und
 *   Qualifikationsphase –“ (2022, Vorwort geändert 2026), Stand Juli 2026.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/bremen-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Sek. I nach den Anforderungen am Ende von 6 und 9 (5/6, 7–9),
 * Einführungsphase = 10, Qualifikationsphase = 11/12.
 *
 * Überschriften entsprechen den Bildungsplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const bremenGymnasiumMathematik: StateCurriculum = {
  id: 'bremen-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('bremen-gymnasium', 'bremen-gymnasium'),
  state: L('Bremen', 'Bremen'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Bildungsplan',
  grades: [
    grade(5, KS_5_6, KS_5_6_UNITS),
    grade(6, KS_5_6, KS_5_6_UNITS),
    grade(7, KS_7_9, KS_7_9_UNITS),
    grade(8, KS_7_9, KS_7_9_UNITS),
    grade(9, KS_7_9, KS_7_9_UNITS),
    grade(10, EP, EP_UNITS),
    grade(11, QP, QP_UNITS),
    grade(12, QP, QP_UNITS),
  ],
};
