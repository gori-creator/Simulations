import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Ministerium für Bildung und Kultur des Saarlandes. Die Lehrpläne nennen keinen Link zur
 * einzelnen Datei. Verlinkt ist die Startseite des Ministeriums.
 */
const SOURCE = 'https://www.saarland.de/mbk';

// Hinweise je Klassenstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/saarland-gymnasium-mathematik.md, Teil E).
const KS_5_6 = L(
  'Klassenstufen 5 und 6 (neunjähriges Gymnasium): Der Lehrplan gilt für beide Klassenstufen zusammen; die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Die Reihenfolge der Themenfelder ist nur verbindlich, soweit es sachlogisch nötig ist. Die Nummern sind die des Lehrplans.',
  'Grades 5 and 6 (nine-year Gymnasium): the curriculum covers both grades together, so the units are the same for grades 5 and 6 and are shown as one stage. The order of the topic fields is binding only where the subject requires it. The numbers are those of the curriculum.',
);

const KS = (n: number, extra: Localized | null = null): Localized =>
  L(
    `Klassenstufe ${n} (neunjähriges Gymnasium): Themenfelder des Lehrplans; die Reihenfolge ist nur verbindlich, soweit es sachlogisch nötig ist.${extra ? ` ${extra.de}` : ''} Die Nummern sind die des Lehrplans.`,
    `Grade ${n} (nine-year Gymnasium): topic fields of the curriculum; the order is binding only where the subject requires it.${extra ? ` ${extra.en}` : ''} The numbers are those of the curriculum.`,
  );

const NOTE_8 = KS(8, L('Die Themenfelder 6 bis 8 gelten nur im Informatik-Zweig.', 'Topic fields 6 to 8 apply only in the computer science branch.'));

const EP = L(
  'Einführungsphase der gymnasialen Oberstufe (hier Klassenstufe 11): Lehrplan von 2014 (Erprobungsphase), geschrieben für das achtjährige Gymnasium. Einige Inhalte (Sinusfunktion, Körper, Exponentialfunktionen) behandelt das neunjährige Gymnasium schon in Klasse 10. Die Nummern sind die des Lehrplans.',
  'Introductory phase of upper secondary (here grade 11): curriculum from 2014 (trial phase), written for the eight-year Gymnasium. Some content (sine function, solids, exponential functions) is already covered in grade 10 of the nine-year Gymnasium. The numbers are those of the curriculum.',
);

const HP_12 = L(
  'Hauptphase, 1. und 2. Halbjahr (hier Klassenstufe 12): Lernbereiche 1 bis 5 für Grund- und Leistungskurs; LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.',
  'Main phase, first and second half-year (here grade 12): learning areas 1 to 5 for the basic and the advanced course; LK = advanced course only. The numbers are those of the curriculum.',
);

const HP_13 = L(
  'Hauptphase, 3. und 4. Halbjahr (hier Klassenstufe 13): Lernbereiche 6 bis 8 und der Pflichtbereich mit wechselnden Themen, die die Schulaufsicht vor Beginn der Hauptphase festlegt. LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.',
  'Main phase, third and fourth half-year (here grade 13): learning areas 6 to 8 and the compulsory area with changing topics set by the school authority before the main phase. LK = advanced course only. The numbers are those of the curriculum.',
);

/** Klassenstufen 5 und 6, Themenfelder 1–11. */
const KS_5_6_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Natürliche Zahlen', 'Natural numbers'),
    summary: L(
      'Daten und Diagramme, Dezimalsystem mit Stellenwerttafel und Runden, Dualsystem und römische Zahlen, Mengen, Zahlenstrahl und Anordnung.',
      'Data and charts, the decimal system with place value table and rounding, the binary system and Roman numerals, sets, the number line and order.',
    ),
    simulations: ['stellenwerte', 'zahlengerade', 'diagramme'],
  },
  {
    code: '2',
    title: L('Rechnen mit natürlichen Zahlen', 'Calculating with natural numbers'),
    summary: L(
      'Grundrechenarten und ihre Fachbegriffe, Rechengesetze, Terme mit Klammern, Potenzen, figurierte Zahlen.',
      'The four operations and their terms, laws of arithmetic, terms with brackets, powers, figurate numbers.',
    ),
    simulations: ['termbaum', 'zehnerpotenzen'],
  },
  {
    code: '3',
    title: L('Größen im Alltag', 'Quantities in everyday life'),
    summary: L('Größen mit Maßzahl und Einheit, Umrechnen zwischen Einheiten, Zeitpunkte und Zeitspannen.', 'Quantities with value and unit, converting between units, points in time and time spans.'),
    simulations: ['einheiten'],
  },
  {
    code: '4',
    title: L('Figuren und Körper', 'Figures and solids'),
    summary: L(
      'Punkt, Strecke, Strahl und Gerade, parallel und senkrecht, Koordinatensystem, Vierecke, Körper mit Netz und Schrägbild.',
      'Point, segment, ray and line, parallel and perpendicular, the coordinate system, quadrilaterals, solids with nets and oblique drawings.',
    ),
    simulations: ['koordinaten-lage', 'vierecke', 'koerpernetze'],
  },
  {
    code: '5',
    title: L('Flächeninhalt und Volumen', 'Area and volume'),
    summary: L(
      'Umfang und Flächeninhalt von Rechteck und Quadrat, Flächen- und Volumeneinheiten, Volumen und Oberflächeninhalt von Quader und Würfel.',
      'Perimeter and area of rectangle and square, units of area and volume, volume and surface area of cuboid and cube.',
    ),
    simulations: ['umfang-flaeche', 'quader-volumen'],
  },
  {
    code: '6',
    title: L('Teilbarkeit der natürlichen Zahlen', 'Divisibility of natural numbers'),
    summary: L('Teiler und Vielfache, Teilbarkeitsregeln, Primzahlen und Primfaktorzerlegung, ggT und kgV.', 'Divisors and multiples, divisibility rules, prime numbers and prime factorisation, gcd and lcm.'),
    simulations: ['primfaktoren'],
  },
  {
    code: '7',
    title: L('Brüche', 'Fractions'),
    summary: L(
      'Brüche als Anteile, Bruchzahlen am Zahlenstrahl, kürzen und erweitern, vergleichen, Dezimalbrüche und periodische Dezimalzahlen.',
      'Fractions as parts, fractions on the number line, simplifying and expanding, comparing, decimals and recurring decimals.',
    ),
    simulations: ['bruchteile', 'brueche-vergleichen', 'dezimalbrueche'],
  },
  {
    code: '8',
    title: L('Rechnen mit Brüchen', 'Calculating with fractions'),
    summary: L('Die vier Grundrechenarten mit Brüchen und Dezimalzahlen, Kehrbruch und Doppelbruch, Kommaverschiebung.', 'The four operations with fractions and decimals, reciprocals and complex fractions, moving the decimal point.'),
    simulations: ['brueche-rechnen', 'dezimalbrueche'],
  },
  {
    code: '9',
    title: L('Kreis, Winkel, Symmetrie', 'Circle, angle, symmetry'),
    summary: L(
      'Kreis mit Radius und Durchmesser, Winkel messen und zeichnen, Achsen-, Punkt- und Drehsymmetrie, Spiegelung, Drehung und Verschiebung, Basiswinkelsatz.',
      'The circle with radius and diameter, measuring and drawing angles, line, point and rotational symmetry, reflection, rotation and translation, the base angle theorem.',
    ),
    simulations: ['winkel-messen', 'spiegelung'],
  },
  {
    code: '10',
    title: L('Statistische Daten', 'Statistical data'),
    summary: L(
      'Absolute und relative Häufigkeit, Kreisdiagramme, Minimum, Maximum, Spannweite, Median und Quartile, Boxplot.',
      'Absolute and relative frequency, pie charts, minimum, maximum, range, median and quartiles, box plots.',
    ),
    simulations: ['diagramme', 'boxplot'],
  },
  {
    code: '11',
    title: L('Ganze Zahlen', 'Integers'),
    summary: L('Negative Zahlen im Alltag, Zahlengerade und Vorzeichen, Koordinatensystem mit vier Quadranten, Rechnen mit ganzen Zahlen.', 'Negative numbers in everyday life, the number line and signs, the coordinate system with four quadrants, calculating with integers.'),
    simulations: ['zahlengerade', 'koordinaten-lage'],
  },
];

/** Klassenstufe 7, Themenfelder 1–7. */
const KS_7_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Rationale Zahlen', 'Rational numbers'),
    summary: L('Negative Brüche an der Zahlengeraden, Gegenzahl und Betrag, die vier Grundrechenarten mit rationalen Zahlen.', 'Negative fractions on the number line, opposite and absolute value, the four operations with rational numbers.'),
    simulations: ['zahlengerade'],
  },
  {
    code: '2',
    title: L('Terme, Gleichungen und Ungleichungen', 'Terms, equations and inequalities'),
    summary: L('Aussagen und Aussageformen, Grund- und Lösungsmenge, Äquivalenzumformungen bei Gleichungen und Ungleichungen.', 'Statements and open sentences, domain and solution set, equivalent transformations of equations and inequalities.'),
    simulations: ['termbaum', 'waagemodell'],
  },
  {
    code: '3',
    title: L('Zuordnungen', 'Relationships'),
    summary: L(
      'Zuordnungen in Tabelle und Graph, proportionale und umgekehrt proportionale Zuordnungen mit Ursprungsgerade und Hyperbel, Dreisatz.',
      'Relationships in tables and graphs, proportional and inversely proportional relationships with line through the origin and hyperbola, the rule of three.',
    ),
    simulations: ['proportional', 'funktion-zuordnung', 'hyperbel'],
  },
  {
    code: '4',
    title: L('Geometrische Konstruktionen', 'Geometric constructions'),
    summary: L('Lot, Mittelsenkrechte und Winkelhalbierende, Umkreis und Inkreis von Dreiecken.', 'Perpendiculars, perpendicular bisectors and angle bisectors, circumcircle and incircle of triangles.'),
    simulations: ['mittelsenkrechte', 'besondere-linien', 'dreieckskonstruktion'],
  },
  {
    code: '5',
    title: L('Prozentrechnung', 'Percentages'),
    summary: L('Grundwert, Prozentwert und Prozentsatz, Zu- und Abnahme, Rabatt und Mehrwertsteuer, Zinsen und Zinseszins.', 'Base value, percentage value and rate, increase and decrease, discount and VAT, simple and compound interest.'),
    simulations: ['prozentstreifen'],
  },
  {
    code: '6',
    title: L('Einführung in die Stochastik', 'Introduction to probability'),
    summary: L('Zufallsexperimente mit Ergebnissen und Ereignissen, Laplace-Wahrscheinlichkeit, Simulationen.', 'Random experiments with outcomes and events, Laplace probability, simulations.'),
    simulations: ['zaehlprinzip', 'gesetz-grosse-zahlen'],
  },
  {
    code: '7',
    title: L('Winkel in Figuren', 'Angles in figures'),
    summary: L('Neben-, Scheitel-, Stufen- und Wechselwinkel, Winkelsummen, Sekante und Tangente, Satz des Thales, Kehrsatz.', 'Adjacent, vertical, corresponding and alternate angles, angle sums, secant and tangent, Thales’ theorem, converse.'),
    simulations: ['winkel-geradenkreuzung', 'winkelsumme', 'thales'],
  },
];

/** Klassenstufe 8, Themenfelder 1–8 (6–8 nur Informatik-Zweig). */
const KS_8_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Kongruenz und Dreieckskonstruktionen', 'Congruence and triangle constructions'),
    summary: L('Kongruenzsätze und Dreieckskonstruktionen, Dreiecksungleichung, Höhen und Seitenhalbierende mit Schwerpunkt.', 'Congruence theorems and triangle constructions, the triangle inequality, altitudes and medians with centroid.'),
    simulations: ['dreieckskonstruktion', 'besondere-linien'],
  },
  {
    code: '2',
    title: L('Terme', 'Terms'),
    summary: L('Terme umformen und faktorisieren, binomische Formeln und Pascalsches Dreieck, Bruchterme und Bruchgleichungen, Potenzregeln.', 'Rearranging and factorising terms, binomial formulas and Pascal’s triangle, algebraic fractions and fractional equations, laws of powers.'),
    simulations: ['binomische-formeln'],
  },
  {
    code: '3',
    title: L('Vielecke und Prismen', 'Polygons and prisms'),
    summary: L('Haus der Vierecke, Flächeninhalte über Zerlegung und Ergänzung, Prismen mit Oberfläche und Volumen.', 'The family of quadrilaterals, areas by dissection and completion, prisms with surface area and volume.'),
    simulations: ['flaechen-zerlegen', 'prisma-zylinder', 'koerpernetze'],
  },
  {
    code: '4',
    title: L('Lineare Funktionen', 'Linear functions'),
    summary: L('Funktionsbegriff, lineare Funktionen mit Steigung und y-Achsenabschnitt, Änderungsrate, parallele und orthogonale Geraden.', 'The concept of function, linear functions with slope and y-intercept, rate of change, parallel and perpendicular lines.'),
    simulations: ['lineare-funktion', 'funktionsplotter'],
  },
  {
    code: '5',
    title: L('Kreis und Zylinder', 'Circle and cylinder'),
    summary: L('Kreiszahl π, Umfang und Flächeninhalt von Kreis, Kreisbogen und Kreissegment, Oberfläche und Volumen des Zylinders.', 'The number π, circumference and area of circles, arcs and segments, surface area and volume of cylinders.'),
    simulations: ['kreiszahl-pi', 'prisma-zylinder'],
  },
  {
    code: '6',
    title: L('Rechnen in anderen Zahlensystemen (nur Informatik-Zweig)', 'Calculating in other number systems (computer science branch only)'),
    summary: L('Binär- und Hexadezimalsystem, Umrechnen und Rechnen, geometrische Summenformel.', 'Binary and hexadecimal systems, converting and calculating, the geometric series formula.'),
  },
  {
    code: '7',
    title: L('Aussagenlogik (nur Informatik-Zweig)', 'Propositional logic (computer science branch only)'),
    summary: L('Aussagen und Wahrheitswerte, Verknüpfungen wie Konjunktion, Disjunktion, NAND und NOR, Wahrheitstafeln.', 'Statements and truth values, connectives such as conjunction, disjunction, NAND and NOR, truth tables.'),
  },
  {
    code: '8',
    title: L('Vertiefung der regulären Themenfelder (nur Informatik-Zweig)', 'Deepening the regular topic fields (computer science branch only)'),
    summary: L('Vertiefungen zu den Themenfeldern 1 bis 5, zum Beispiel Mittelwerte, Parkettierungen und Füllgraphen.', 'Deepening topic fields 1 to 5, for example means, tilings and filling graphs.'),
  },
];

/** Klassenstufe 9, Themenfelder 1–5. */
const KS_9_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Lineare Gleichungen und Gleichungssysteme', 'Linear equations and systems of equations'),
    summary: L('Lineare Gleichungen mit zwei Variablen, Gleichungssysteme grafisch und mit Gleichsetzungs-, Einsetzungs- und Additionsverfahren lösen.', 'Linear equations in two variables, solving systems graphically and by equating, substitution and elimination.'),
    simulations: ['lgs-grafisch'],
  },
  {
    code: '2',
    title: L('Quadratwurzeln und reelle Zahlen', 'Square roots and real numbers'),
    summary: L('Quadratwurzeln, Heron- und Intervallhalbierungsverfahren, Intervallschachtelung, irrationale und reelle Zahlen, Wurzelgesetze.', 'Square roots, Heron’s method and bisection, nested intervals, irrational and real numbers, laws of roots.'),
    simulations: ['quadratwurzel'],
  },
  {
    code: '3',
    title: L('Satzgruppe des Pythagoras', 'Pythagoras’ group of theorems'),
    summary: L('Satz des Pythagoras und Höhensatz, Hypotenusenabschnitte, pythagoreische Zahlentripel, Anwendungen.', 'Pythagoras’ theorem and the altitude theorem, segments of the hypotenuse, Pythagorean triples, applications.'),
    simulations: ['pythagoras'],
  },
  {
    code: '4',
    title: L('Quadratische Funktionen und Gleichungen', 'Quadratic functions and equations'),
    summary: L(
      'Parabeln verschieben, strecken und spiegeln, Scheitelpunkt- und Nullstellenform, quadratische Gleichungen mit p-q-Formel und Satz von Vieta, Extremwertaufgaben.',
      'Translating, stretching and reflecting parabolas, vertex and factored form, quadratic equations with the quadratic formula and Vieta’s theorem, optimisation problems.',
    ),
    simulations: ['quadratische-funktion', 'parabel-drei-punkte', 'extremwert-parabel', 'gleichungen-grafisch'],
  },
  {
    code: '5',
    title: L('Ähnlichkeit', 'Similarity'),
    summary: L('Zentrische Streckung, Ähnlichkeitssätze, Strahlensätze, maßstäbliches Vergrößern und Verkleinern.', 'Enlargement, similarity theorems, intercept theorems, scaling up and down.'),
    simulations: ['strahlensaetze', 'vergroessern', 'massstab'],
  },
];

/** Klassenstufe 10, Themenfelder 1–6. */
const KS_10_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Trigonometrie', 'Trigonometry'),
    summary: L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck und am Einheitskreis, Steigungswinkel, Sinus- und Kosinussatz.', 'Sine, cosine and tangent in right triangles and on the unit circle, angle of slope, the sine and cosine rules.'),
    simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'einheitskreis'],
  },
  {
    code: '2',
    title: L('Potenzen und Potenzfunktionen', 'Powers and power functions'),
    summary: L('Potenzen und n-te Wurzeln, wissenschaftliche Notation, Potenzfunktionen mit Symmetrie, Monotonie und asymptotischem Verhalten.', 'Powers and nth roots, scientific notation, power functions with symmetry, monotonicity and asymptotic behaviour.'),
    simulations: ['potenzfunktionen'],
  },
  {
    code: '3',
    title: L('Mehrstufige Zufallsexperimente', 'Multi-stage random experiments'),
    summary: L('Baumdiagramme und Pfadregeln, Urnenmodell und Tupel, Ereignisse mit Venn-Diagramm und Vierfeldertafel, bedingte Wahrscheinlichkeit.', 'Tree diagrams and path rules, urn models and tuples, events with Venn diagrams and two-way tables, conditional probability.'),
    simulations: ['baumdiagramm', 'geburtstagsproblem', 'monte-carlo-pi', 'vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
  },
  {
    code: '4',
    title: L('Wachstumsprozesse und Exponentialfunktionen (Teil I)', 'Growth processes and exponential functions (part I)'),
    summary: L('Lineares und exponentielles Wachstum, prozentuale Wachstumsrate, Halbwerts- und Verdopplungszeit, Exponentialgleichungen.', 'Linear and exponential growth, percentage growth rate, half-life and doubling time, exponential equations.'),
    simulations: ['exponentielles-wachstum'],
  },
  {
    code: '5',
    title: L('Pyramide, Kegel, Kugel', 'Pyramid, cone, sphere'),
    summary: L('Pyramide, Kegel und ihre Stümpfe, Kugel, Satz des Cavalieri, Oberfläche und Volumen.', 'Pyramids, cones and their frustums, spheres, Cavalieri’s principle, surface area and volume.'),
    simulations: ['pyramide-kegel-kugel', 'cavalieri'],
  },
  {
    code: '6',
    title: L('Trigonometrische Funktionen (Teil I)', 'Trigonometric functions (part I)'),
    summary: L('Bogenmaß, Sinusfunktion als periodische Funktion mit Periode und Amplitude.', 'Radians, the sine function as a periodic function with period and amplitude.'),
    simulations: ['einheitskreis', 'sinusfunktion'],
  },
];

/** Einführungsphase, Lernbereiche 1–6 (Lehrplan 2014). */
const EP_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Allgemeine Sinusfunktion', 'General sine function'),
    summary: L('Periodizität, Sinusfunktion und Operationen mit ihr: Verschieben, Strecken und Stauchen.', 'Periodicity, the sine function and operations on it: translating, stretching and compressing.'),
    simulations: ['sinusfunktion', 'transformationen'],
  },
  {
    code: '2',
    title: L('Stereometrie', 'Solid geometry'),
    summary: L('Prisma und Zylinder, Pyramide und Kegel, Prinzip von Cavalieri, Halbkugel und Kugel.', 'Prism and cylinder, pyramid and cone, Cavalieri’s principle, hemisphere and sphere.'),
  },
  {
    code: '3',
    title: L('Exponentialfunktionen', 'Exponential functions'),
    summary: L('Exponentielles Wachstum, Exponentialfunktionen der Form x ↦ a · bˣ, Logarithmen und Logarithmengesetze.', 'Exponential growth, exponential functions of the form x ↦ a · bˣ, logarithms and the laws of logarithms.'),
    simulations: ['logarithmus'],
  },
  {
    code: '4',
    title: L('Stetigkeit', 'Continuity'),
    summary: L('Grenzwert, lokale und globale Stetigkeit, Monotonie, Eigenschaften stetiger Funktionen.', 'Limits, local and global continuity, monotonicity, properties of continuous functions.'),
    simulations: ['grenzverhalten'],
  },
  {
    code: '5',
    title: L('Einstieg in die Differentialrechnung', 'Introduction to differential calculus'),
    summary: L('Globale und lokale Änderungsrate, Differenzierbarkeit und Ableitung; fakultativ das Newtonverfahren.', 'Average and local rate of change, differentiability and the derivative; optionally Newton’s method.'),
    simulations: ['sekante-tangente', 'ableitungsfunktion', 'newton-verfahren'],
  },
  {
    code: '6',
    title: L('Ganzrationale Funktionen', 'Polynomial functions'),
    summary: L('Ganzrationale Funktionen und ihre Nullstellen, Untersuchung mit erster und zweiter Ableitung, Anwendungen.', 'Polynomial functions and their zeros, analysis with the first and second derivative, applications.'),
    simulations: ['funktionsplotter', 'ganzrationale-funktionen', 'kurvendiskussion', 'extremwertprobleme'],
  },
];

/** Hauptphase, 1. und 2. Halbjahr: Lernbereiche 1–5. */
const HP_12_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Grundlegende Funktionen und Ableitungen', 'Basic functions and derivatives'),
    summary: L('Ganzrationale und weitere Grundfunktionen, Verknüpfung und Verkettung, Ableitungsregeln, Umkehrfunktionen; LK: Funktionenscharen.', 'Polynomial and other basic functions, combining and composing functions, rules of differentiation, inverse functions; LK: families of functions.'),
    simulations: ['funktionsplotter', 'umkehrfunktion', 'kurvendiskussion', 'funktionenscharen'],
  },
  {
    code: '2',
    title: L('Integralrechnung', 'Integral calculus'),
    summary: L('Flächeninhalte und Rekonstruktion von Beständen, Integralfunktion und Hauptsatz, Integrationsregeln, Anwendungen bis zu Rotationskörpern.', 'Areas and reconstructing totals, the integral function and the fundamental theorem, rules of integration, applications including solids of revolution.'),
    simulations: ['stammfunktion-grafisch', 'ober-untersummen', 'hauptsatz', 'aenderungsrate', 'rotationskoerper'],
  },
  {
    code: '3',
    title: L('Wahrscheinlichkeiten', 'Probabilities'),
    summary: L('Grundlagen der Wahrscheinlichkeitsrechnung aus der Sekundarstufe I vertieft, Bernoulli-Experimente.', 'Deepening the basics of probability from lower secondary, Bernoulli experiments.'),
    simulations: ['geburtstagsproblem', 'vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'galtonbrett', 'ziegenproblem', 'binomialverteilung'],
  },
  {
    code: '4',
    title: L('Vektoren', 'Vectors'),
    summary: L('Punkte im Raum, Vektoren als Verschiebungen, Rechnen mit Vektoren, Betrag und Skalarprodukt; LK: Vektorprodukt.', 'Points in space, vectors as translations, calculating with vectors, magnitude and dot product; LK: cross product.'),
    simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt'],
  },
  {
    code: '5',
    title: L('Vektorielle Untersuchung geometrischer Strukturen', 'Vector analysis of geometric structures'),
    summary: L('Linearkombination, Geraden und Ebenen, Lagebeziehungen, Anwendungen; im Grundkurs je nach Länge der Halbjahre zum Teil im 3. Halbjahr.', 'Linear combinations, lines and planes, relative positions, applications; in the basic course partly in the third half-year, depending on its length.'),
    simulations: ['geraden-ebenen', 'lage-abstaende'],
  },
];

/** Hauptphase, 3. und 4. Halbjahr: Lernbereiche 6–8 und Pflichtbereich 9. */
const HP_13_UNITS: CurriculumUnit[] = [
  {
    code: '6',
    title: L('Die e-Funktion und die ln-Funktion', 'The exponential and the natural logarithm function'),
    summary: L('Exponentielles Wachstum mit der e-Funktion, Exponentialgleichungen, ln-Funktion als Umkehrfunktion, zusammengesetzte Funktionen.', 'Exponential growth with the exponential function, exponential equations, the ln function as the inverse, composite functions.'),
    simulations: ['e-funktion'],
  },
  {
    code: '7',
    title: L('Modellieren', 'Modelling'),
    summary: L('Sachprobleme mit Funktionen modellieren, Modelle prüfen und bewerten.', 'Modelling real problems with functions, checking and judging models.'),
    simulations: ['extremwertprobleme', 'funktionenscharen'],
  },
  {
    code: '8',
    title: L('Zufallsgrößen', 'Random variables'),
    summary: L('Diskrete Zufallsgrößen mit Erwartungswert und Standardabweichung, Binomialverteilung; LK: stetige Zufallsgrößen, Normalverteilung und Hypothesentests.', 'Discrete random variables with expected value and standard deviation, the binomial distribution; LK: continuous random variables, the normal distribution and hypothesis tests.'),
    simulations: ['binomialverteilung', 'signifikanztest', 'normalverteilung'],
  },
  {
    code: '9',
    title: L('Pflichtbereich (wechselnde Themen)', 'Compulsory area (changing topics)'),
    summary: L('Themen nach Festlegung der Schulaufsicht: gebrochenrationale Funktionen, Kreis und Kugel, ln-Funktion; im LK auch vollständige Induktion.', 'Topics set by the school authority: rational functions, circle and sphere, the ln function; in the LK also mathematical induction.'),
    simulations: ['polstellen-asymptoten', 'kugeln'],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(mathematik, n, units),
});

/**
 * Mathematik am Gymnasium im Saarland (neunjähriges Gymnasium, Abitur nach Klassenstufe 13) nach
 * - „Lehrplan Mathematik, Neunjähriges Gymnasium“, Klassenstufen 5 und 6 (2023), 7 (2023), 8 (2024),
 *   9 (2024) und 10 (2026),
 * - „Lehrplan Mathematik, Gymnasiale Oberstufe, Einführungsphase“ (Erprobungsphase, 2014),
 * - „Lehrplan Mathematik für den G-Kurs der gymnasialen Oberstufe Saar“, Hauptphase (2016, Stand 2019),
 *   und „Lehrplan Mathematik, Hauptphase, Leistungskurs“ (2019).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/saarland-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Sek. I nach Klassenstufen (5/6 zusammen), Oberstufe als
 * Einführungsphase (11) und Hauptphase (12, 13). Die Oberstufenlehrpläne stammen aus dem
 * achtjährigen Gymnasium; die Zuordnung zu 11–13 ist eine Annahme.
 *
 * Überschriften entsprechen den Lehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const saarlandGymnasiumMathematik: StateCurriculum = {
  id: 'saarland-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('saarland-gymnasium', 'saarland-gymnasium'),
  state: L('Saarland', 'Saarland'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Lehrplan',
  grades: [
    grade(5, KS_5_6, KS_5_6_UNITS),
    grade(6, KS_5_6, KS_5_6_UNITS),
    grade(7, KS(7), KS_7_UNITS),
    grade(8, NOTE_8, KS_8_UNITS),
    grade(9, KS(9), KS_9_UNITS),
    grade(10, KS(10), KS_10_UNITS),
    grade(11, EP, EP_UNITS),
    grade(12, HP_12, HP_12_UNITS),
    grade(13, HP_13, HP_13_UNITS),
  ],
};
