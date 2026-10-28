import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Fachanforderungen-Portal des Landes Schleswig-Holstein. Die Fachanforderungen nennen
 * „www.fachanforderungen.de“ (Bestellungen) und „www.schleswig-holstein.de“; ein Link zur
 * einzelnen Datei steht im Dokument nicht. Verlinkt ist das Portal mit https.
 */
const SOURCE = 'https://www.fachanforderungen.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/schleswig-holstein-gymnasium-mathematik.md, Teil E).
const KS_5_6 = L(
  'Jahrgangsstufen 5 und 6: Die Fachanforderungen geben die Verteilung der Inhalte auf die Jahrgänge 5/6, 7/8/9 und 10 als verbindlichen Rahmen vor; innerhalb dieses Rahmens entscheidet die Fachschaft. Die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Lernbereiche sind die fünf Leitideen, Unterbereiche die Themen der Verteilungstabelle; die Nummern sind von uns vergeben.',
  'Grades 5 and 6: the subject requirements set a binding distribution of content over grades 5/6, 7/8/9 and 10; within it each school decides. The units are therefore the same for grades 5 and 6 and are shown as one stage. Units are the five key ideas, sub-units the topics of the distribution table; the numbers are our own.',
);

const KS_7_9 = L(
  'Jahrgangsstufen 7 bis 9: Die Fachanforderungen fassen die Inhalte der Jahrgänge 7, 8 und 9 zusammen; die Lernbereiche stehen deshalb bei 7, 8 und 9 gleich und werden als eine Stufe gezeigt. Mit * gekennzeichnete Themen können in Klasse 10 vertieft werden. Im achtjährigen Bildungsgang (G8) sind die Inhalte der Jahrgänge 7–10 in 6–9 zu behandeln; abgebildet ist G9. Die Nummern sind von uns vergeben.',
  'Grades 7 to 9: the subject requirements group the content of grades 7, 8 and 9 together, so the units are the same for grades 7, 8 and 9 and are shown as one stage. Topics marked * can be deepened in grade 10. In the eight-year track (G8) the content of grades 7–10 is taught in 6–9; G9 is shown here. The numbers are our own.',
);

const KS_10 = L(
  'Jahrgangsstufe 10: Trigonometrie, Kreis und Körper auf höherem Niveau, trigonometrische und Exponentialfunktionen, Logarithmen und Ähnlichkeit. Die Leitideen Zahl und Operation sowie Daten und Zufall haben in der Verteilungstabelle für 10 keine eigenen Themen. Die Nummern sind von uns vergeben.',
  'Grade 10: trigonometry, circles and solids at a higher level, trigonometric and exponential functions, logarithms and similarity. The key ideas number and operation and data and chance have no topics of their own for grade 10 in the distribution table. The numbers are our own.',
);

const EJ = L(
  'Einführungsjahr der Oberstufe (G9: Jahrgangsstufe 11). Die Fachanforderungen ordnen die Themen der Sachgebiete Analysis, Geometrie und Stochastik den drei Oberstufenjahren zu; im Einführungsjahr ist die Zuordnung verbindlich. Die Nummern sind von uns vergeben.',
  'Introductory year of upper secondary (G9: grade 11). The subject requirements assign the topics of calculus, geometry and probability to the three years of upper secondary; in the introductory year this is binding. The numbers are our own.',
);

const Q1 = L(
  'Erstes Jahr der Qualifikationsphase (G9: Jahrgangsstufe 12). Innerhalb der Qualifikationsphase dürfen Themen zwischen den beiden Jahren verschoben werden. Inhalte, die über das grundlegende Anforderungsniveau hinausgehen, sind für das erhöhte Niveau verbindlich. Die Nummern sind von uns vergeben.',
  'First year of the qualification phase (G9: grade 12). Topics may be moved between the two years of the qualification phase. Content beyond the basic level is compulsory at the higher level. The numbers are our own.',
);

const Q2 = L(
  'Zweites Jahr der Qualifikationsphase (G9: Jahrgangsstufe 13). Innerhalb der Qualifikationsphase dürfen Themen zwischen den beiden Jahren verschoben werden. Die Nummern sind von uns vergeben.',
  'Second year of the qualification phase (G9: grade 13). Topics may be moved between the two years of the qualification phase. The numbers are our own.',
);

/** Jahrgangsstufen 5/6 (Kap. II.3, Verteilungstabelle, mit den Kerninhalten aus Kap. II.2.2). */
const KS_5_6_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahl und Operation', 'Number and operation'),
    summary: L(
      'Natürliche Zahlen mit Stellenwerttafel und Teilbarkeit, positive Bruchzahlen und Dezimalzahlen.',
      'Natural numbers with the place-value chart and divisibility, positive fractions and decimals.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('natürliche Zahlen', 'natural numbers'),
        summary: L(
          'Zahlenstrahl, Stellenwerttafel und Runden, Rechenverfahren und Terme ohne Variablen mit Vorrang- und Klammerregeln, Teiler, Vielfache, Primzahlen und Primfaktorzerlegung.',
          'Number line, place-value chart and rounding, written methods and terms without variables with order of operations and brackets, divisors, multiples, primes and prime factorisation.',
        ),
        simulations: ['stellenwerte', 'termbaum', 'primfaktoren'],
      },
      {
        code: '1.2',
        title: L('positive Bruchzahlen', 'positive fractions'),
        summary: L(
          'Brüche als Anteile, Größen, Verhältnisse und Operatoren, erweitern und kürzen, an der Zahlengeraden ordnen und mit ihnen rechnen.',
          'Fractions as parts, quantities, ratios and operators, expanding and simplifying, ordering on the number line and calculating with them.',
        ),
        simulations: ['bruchteile', 'brueche-vergleichen', 'brueche-rechnen'],
      },
      {
        code: '1.3',
        title: L('Dezimalzahlen', 'decimals'),
        summary: L(
          'Abbrechende und einfache periodische Dezimalbrüche in der Stellenwerttafel, runden und rechnen.',
          'Terminating and simple recurring decimals in the place-value chart, rounding and calculating.',
        ),
        simulations: ['dezimalbrueche'],
      },
    ],
  },
  {
    code: '2',
    title: L('Größen und Messen', 'Quantities and measurement'),
    summary: L(
      'Grundgrößen messen, schätzen und umrechnen, Winkel, Maßstab sowie Flächeninhalt von Rechtecken und Volumen von Quadern.',
      'Measuring, estimating and converting basic quantities, angles, scale, and the area of rectangles and the volume of cuboids.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Grundgrößen', 'basic quantities'),
        summary: L(
          'Länge, Masse, Geld, Zeit, Flächeninhalt und Volumen mit Einheiten, Winkel zeichnen und messen, maßstäbliche Umrechnungen.',
          'Length, mass, money, time, area and volume with units, drawing and measuring angles, converting with scales.',
        ),
        simulations: ['einheiten', 'winkel-messen', 'massstab'],
      },
      {
        code: '2.2',
        title: L('Flächenberechnung an Rechtecken', 'area of rectangles'),
        summary: L(
          'Flächen mit Einheitsquadraten auslegen, Umfang und Flächeninhalt von Rechteck und Quadrat bestimmen und aus Rechtecken zusammengesetzte Figuren vergleichen.',
          'Covering areas with unit squares, finding perimeter and area of rectangles and squares and comparing figures made of rectangles.',
        ),
        simulations: ['umfang-flaeche'],
      },
      {
        code: '2.3',
        title: L('Volumenberechnung an Quadern', 'volume of cuboids'),
        summary: L(
          'Rauminhalte mit Einheitswürfeln bestimmen und das Volumen von Quader und Würfel berechnen.',
          'Finding volumes with unit cubes and calculating the volume of cuboids and cubes.',
        ),
        simulations: ['quader-volumen'],
      },
    ],
  },
  {
    code: '3',
    title: L('Strukturen und funktionaler Zusammenhang', 'Structures and functional relationships'),
    summary: L('Einfache Zuordnungen in Tabellen und Diagrammen.', 'Simple relationships in tables and charts.'),
    parts: [
      {
        code: '3.1',
        title: L('einfache Zuordnungen in Tabellen und Diagrammen', 'simple relationships in tables and charts'),
        summary: L(
          'Informationen aus Tabellen, Säulen-, Balken- und Kreisdiagrammen entnehmen, Daten darstellen und Zuordnungen beschreiben.',
          'Reading information from tables, bar and pie charts, displaying data and describing relationships.',
        ),
        simulations: ['diagramme', 'funktion-zuordnung'],
      },
    ],
  },
  {
    code: '4',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Einfache Figuren und Körper, Symmetrie und Grundkonstruktionen mit Zirkel und Geodreieck.',
      'Simple figures and solids, symmetry and basic constructions with compasses and set square.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('einfache geometrische Figuren und Körper', 'simple geometric figures and solids'),
        summary: L(
          'Strecke, Gerade, Winkel, Abstand und Kreis, parallel und senkrecht, Koordinatensystem, besondere Dreiecke und Vierecke, Körper mit Netzen und Schrägbildern.',
          'Segments, lines, angles, distance and circles, parallel and perpendicular, the coordinate system, special triangles and quadrilaterals, solids with nets and oblique drawings.',
        ),
        simulations: ['koordinaten-lage', 'vierecke', 'koerpernetze'],
      },
      {
        code: '4.2',
        title: L('Symmetrie', 'symmetry'),
        summary: L(
          'Achsen- und Punktsymmetrie erkennen und Figuren spiegeln, drehen und verschieben.',
          'Recognising line and point symmetry and reflecting, rotating and translating figures.',
        ),
        simulations: ['spiegelung'],
      },
      {
        code: '4.3',
        title: L('geometrische Konstruktionen', 'geometric constructions'),
        summary: L(
          'Grundkonstruktionen mit Zirkel und Lineal, Mittelsenkrechte und Winkelhalbierende, auch mit dynamischer Geometriesoftware.',
          'Basic constructions with compasses and ruler, perpendicular and angle bisectors, also with dynamic geometry software.',
        ),
        simulations: ['mittelsenkrechte'],
      },
    ],
  },
  {
    code: '5',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Einfache Erhebungen, Abzählen von Möglichkeiten und einstufige Zufallsexperimente.',
      'Simple surveys, counting possibilities and single-stage random experiments.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('einfache statistische Erhebungen', 'simple statistical surveys'),
        summary: L(
          'Daten mit Strichliste und Tabelle erheben und in Säulendiagrammen darstellen.',
          'Collecting data with tally charts and tables and showing it in bar charts.',
        ),
        simulations: ['diagramme'],
      },
      {
        code: '5.2',
        title: L('einfache kombinatorische Fragestellungen', 'simple counting problems'),
        summary: L(
          'Möglichkeiten systematisch abzählen, auch mit Baumdiagrammen.',
          'Counting possibilities systematically, also with tree diagrams.',
        ),
        simulations: ['zaehlprinzip'],
      },
      {
        code: '5.3',
        title: L('einstufige Zufallsexperimente', 'single-stage random experiments'),
        summary: L(
          'Zufallsexperimente, Versuche, Ergebnisse und Ergebnismengen beschreiben.',
          'Describing random experiments, trials, outcomes and sample spaces.',
        ),
      },
    ],
  },
];

/** Jahrgangsstufen 7/8/9 (Kap. II.3 mit Kap. II.2.2). */
const KS_7_9_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahl und Operation', 'Number and operation'),
    summary: L(
      'Ganze und rationale Zahlen, Prozente und Zinsen, Quadratwurzeln, reelle Zahlen und Potenzen.',
      'Integers and rational numbers, percentages and interest, square roots, real numbers and powers.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('ganze Zahlen', 'integers'),
        summary: L('Betrag und Vorzeichen, ganze Zahlen an der Zahlengeraden ordnen und mit ihnen rechnen.', 'Absolute value and sign, ordering integers on the number line and calculating with them.'),
        simulations: ['zahlengerade'],
      },
      {
        code: '1.2',
        title: L('rationale Zahlen', 'rational numbers'),
        summary: L('Zahlbereichserweiterung begründen, mit rationalen Zahlen rechnen und Rechengesetze nutzen.', 'Justifying the extension of the number system, calculating with rational numbers and using the laws of arithmetic.'),
        simulations: ['zahlengerade', 'termbaum'],
      },
      {
        code: '1.3',
        title: L('Prozente und Zinsen', 'percentages and interest'),
        summary: L('Grundwert, Prozentwert und Prozentsatz, Darstellung mit Prozentstreifen, Kapital, Zinsen und Zinseszins.', 'Base, percentage value and rate, the percentage bar, capital, interest and compound interest.'),
        simulations: ['prozentstreifen'],
      },
      {
        code: '1.4',
        title: L('Ziehen von Quadratwurzeln als Rechenoperation', 'square roots as an operation'),
        summary: L('Quadrat- und Kubikwurzeln mit dem Taschenrechner und im Kopf bestimmen.', 'Finding square and cube roots with a calculator and mentally.'),
        simulations: ['quadratwurzel'],
      },
      {
        code: '1.5',
        title: L('reelle Zahlen', 'real numbers'),
        summary: L('Irrationale Zahlen als nicht abbrechende, nicht periodische Dezimalzahlen, Näherungsverfahren wie Intervallschachtelung und Heron-Verfahren.', 'Irrational numbers as non-terminating, non-recurring decimals, approximation methods such as nested intervals and Heron’s method.'),
        simulations: ['quadratwurzel'],
      },
      {
        code: '1.6',
        title: L('Potenzen', 'powers'),
        summary: L('Potenzgesetze, negative und gebrochene Exponenten und die wissenschaftliche Schreibweise.', 'Laws of exponents, negative and fractional exponents and scientific notation.'),
        simulations: ['zehnerpotenzen'],
      },
    ],
  },
  {
    code: '2',
    title: L('Größen und Messen', 'Quantities and measurement'),
    summary: L(
      'Flächeninhalte von n-Ecken, Kreis und Kreiszahl, Körperberechnungen, Sachaufgaben sowie zentrische Streckungen oder Strahlensätze.',
      'Areas of polygons, the circle and π, calculations with solids, word problems, and central enlargement or the intercept theorems.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Flächenberechnung an n-Ecken', 'area of polygons'),
        summary: L('Dreiecke, Parallelogramm, Trapez, Drachen und Raute auf flächengleiche Rechtecke zurückführen, n-Ecke zerlegen und ergänzen.', 'Reducing triangles, parallelograms, trapezia, kites and rhombuses to rectangles of equal area, dissecting and completing polygons.'),
        simulations: ['flaechen-zerlegen'],
      },
      {
        code: '2.2',
        title: L('einfache Berechnungen am Kreis', 'simple calculations with circles'),
        summary: L('Kreisumfang und Kreisfläche, einen Näherungswert für π bestimmen.', 'Circumference and area of a circle, finding an approximation for π.'),
        simulations: ['kreiszahl-pi', 'monte-carlo-pi'],
      },
      {
        code: '2.3',
        title: L('Berechnungen an Körpern', 'calculations with solids'),
        summary: L('Oberfläche und Volumen von Quader, Würfel, Prisma, Pyramide, Zylinder, Kegel und Kugel sowie zusammengesetzten Körpern.', 'Surface area and volume of cuboids, cubes, prisms, pyramids, cylinders, cones and spheres and of composite solids.'),
        simulations: ['prisma-zylinder', 'pyramide-kegel-kugel', 'koerpernetze'],
      },
      {
        code: '2.4',
        title: L('Sachaufgaben', 'word problems'),
        summary: L('Größen in Sachzusammenhängen bestimmen und Ergebnisse und Lösungsweg bewerten.', 'Finding quantities in real contexts and evaluating results and methods.'),
      },
      {
        code: '2.5',
        title: L('zentrische Streckungen oder Strahlensätze*', 'central enlargement or intercept theorems*'),
        summary: L('Streckenlängen mit Strahlensätzen oder zentrischer Streckung berechnen; der Streckfaktor geht in Längen, Flächen und Volumina linear, quadratisch oder kubisch ein.', 'Calculating lengths with the intercept theorems or central enlargement; the scale factor enters lengths, areas and volumes linearly, squared or cubed.'),
        simulations: ['strahlensaetze', 'vergroessern'],
      },
    ],
  },
  {
    code: '3',
    title: L('Strukturen und funktionaler Zusammenhang', 'Structures and functional relationships'),
    summary: L(
      'Variablen und Terme, Funktionen mit ihren Darstellungsformen, proportionale, antiproportionale, lineare und quadratische Funktionen sowie lineare und quadratische Gleichungen.',
      'Variables and terms, functions and their representations, proportional, inversely proportional, linear and quadratic functions, and linear and quadratic equations.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Variablen und Terme', 'variables and terms'),
        summary: L('Terme aufstellen, berechnen und umformen, Summen multiplizieren, faktorisieren, binomische Formeln und quadratische Ergänzung.', 'Setting up, evaluating and transforming terms, multiplying sums, factorising, binomial formulas and completing the square.'),
        simulations: ['termbaum', 'binomische-formeln'],
      },
      {
        code: '3.2',
        title: L('Funktionen und ihre Darstellungsformen', 'functions and their representations'),
        summary: L('Zuordnungen und Funktionen in Text, Tabelle, Graph und Term, Schreibweise f(x), Definitions- und Wertemenge.', 'Relationships and functions in words, tables, graphs and terms, the notation f(x), domain and range.'),
        simulations: ['funktion-zuordnung', 'funktionsplotter'],
      },
      {
        code: '3.3',
        title: L('proportionale Funktionen', 'proportional functions'),
        summary: L('Proportionale Zuordnungen mit Quotientengleichheit und Proportionalitätsfaktor.', 'Direct proportion with equal quotients and the constant of proportionality.'),
        simulations: ['proportional'],
      },
      {
        code: '3.4',
        title: L('antiproportionale Funktionen', 'inversely proportional functions'),
        summary: L('Antiproportionale Zuordnungen mit Produktgleichheit und ihre Graphen.', 'Inverse proportion with equal products and its graphs.'),
        simulations: ['proportional', 'hyperbel'],
      },
      {
        code: '3.5',
        title: L('Dreisatz', 'rule of three'),
        summary: L('Sachprobleme mit Dreisatz und umgekehrtem Dreisatz lösen.', 'Solving real problems with the rule of three and its inverse.'),
        simulations: ['proportional'],
      },
      {
        code: '3.6',
        title: L('lineare Gleichungen', 'linear equations'),
        summary: L('Gleichungen durch Probieren, Umkehren und Äquivalenzumformungen lösen, auch als Schnittpunkt von Graphen; einfache Ungleichungen.', 'Solving equations by trial, inverse operations and equivalent transformations, also as intersections of graphs; simple inequalities.'),
        simulations: ['waagemodell', 'gleichungen-grafisch'],
      },
      {
        code: '3.7',
        title: L('lineare Gleichungssysteme', 'linear systems of equations'),
        summary: L('Systeme mit zwei Variablen lösen, auch über- und unterbestimmte.', 'Solving systems in two variables, including over- and underdetermined ones.'),
        simulations: ['lgs-grafisch'],
      },
      {
        code: '3.8',
        title: L('lineare Funktionen', 'linear functions'),
        summary: L('Gerade mit Steigung, Steigungsdreieck und Achsenschnittpunkten, lineares Wachstum, Bedeutung der Parameter.', 'Straight lines with slope, slope triangle and intercepts, linear growth, the meaning of the parameters.'),
        simulations: ['lineare-funktion', 'funktionsplotter'],
      },
      {
        code: '3.9',
        title: L('quadratische Funktionen*', 'quadratic functions*'),
        summary: L('Parabeln mit Scheitelpunkt, Symmetrie und Achsenschnittpunkten, Normal-, Scheitelpunkts- und faktorisierte Form, Verschieben, Strecken und Spiegeln.', 'Parabolas with vertex, symmetry and intercepts, standard, vertex and factorised form, shifting, stretching and reflecting.'),
        simulations: ['quadratische-funktion', 'parabel-drei-punkte', 'extremwert-parabel', 'funktionsplotter'],
      },
      {
        code: '3.10',
        title: L('quadratische Gleichungen*', 'quadratic equations*'),
        summary: L('Quadratische Gleichungen rechnerisch und grafisch lösen.', 'Solving quadratic equations algebraically and graphically.'),
        simulations: ['gleichungen-grafisch', 'quadratische-funktion'],
      },
    ],
  },
  {
    code: '4',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Winkelsätze und Geometrie an Dreiecken, Vierecken und am Kreis, Kongruenz, Abbildungen, Satz des Pythagoras und Körper.',
      'Angle theorems and geometry of triangles, quadrilaterals and circles, congruence, transformations, Pythagoras’ theorem and solids.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Geometrie an Dreiecken, Vierecken und am Kreis', 'geometry of triangles, quadrilaterals and circles'),
        summary: L('Neben-, Scheitel-, Stufen- und Wechselwinkel, Innenwinkelsumme, Basiswinkelsatz, besondere Linien im Dreieck und der Satz des Thales.', 'Adjacent, vertical, corresponding and alternate angles, angle sum, base angle theorem, special lines in triangles and Thales’ theorem.'),
        simulations: ['winkel-geradenkreuzung', 'winkelsumme', 'besondere-linien', 'mittelsenkrechte', 'thales', 'vierecke'],
      },
      {
        code: '4.2',
        title: L('Kongruenzsätze', 'congruence criteria'),
        summary: L('Kongruenzsätze SSS, SWS, WSW und SSW und Dreieckskonstruktionen.', 'The congruence criteria SSS, SAS, ASA and SSA and constructing triangles.'),
        simulations: ['dreieckskonstruktion'],
      },
      {
        code: '4.3',
        title: L('Abbildungsgeometrie', 'transformation geometry'),
        summary: L('Achsenspiegelung, Drehung, Punktspiegelung und Verschiebung.', 'Line reflection, rotation, point reflection and translation.'),
        simulations: ['spiegelung'],
      },
      {
        code: '4.4',
        title: L('Flächensätze am rechtwinkligen Dreieck', 'area theorems in right triangles'),
        summary: L('Satz des Pythagoras und seine Umkehrung, pythagoreische Tripel; Höhen- und Kathetensatz zur Differenzierung.', 'Pythagoras’ theorem and its converse, Pythagorean triples; the altitude and leg theorems for differentiation.'),
        simulations: ['pythagoras'],
      },
      {
        code: '4.5',
        title: L('Körper', 'solids'),
        summary: L('Prismen, Pyramiden, Zylinder, Kegel und Kugeln mit Netzen und Schrägbildern.', 'Prisms, pyramids, cylinders, cones and spheres with nets and oblique drawings.'),
        simulations: ['koerpernetze'],
      },
    ],
  },
  {
    code: '5',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Häufigkeiten und Wahrscheinlichkeit, mehrstufige Zufallsexperimente und beschreibende Statistik.',
      'Frequencies and probability, multi-stage random experiments and descriptive statistics.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Häufigkeit', 'frequency'),
        summary: L('Absolute und relative Häufigkeiten in Häufigkeitstabellen, Kreisdiagrammen und Histogrammen.', 'Absolute and relative frequencies in frequency tables, pie charts and histograms.'),
        simulations: ['gesetz-grosse-zahlen', 'diagramme'],
      },
      {
        code: '5.2',
        title: L('Wahrscheinlichkeit', 'probability'),
        summary: L('Wahrscheinlichkeit über das empirische Gesetz der großen Zahlen, Ereignisse und Laplace-Experimente.', 'Probability via the empirical law of large numbers, events and Laplace experiments.'),
        simulations: ['gesetz-grosse-zahlen'],
      },
      {
        code: '5.3',
        title: L('mehrstufige Zufallsexperimente', 'multi-stage random experiments'),
        summary: L('Zwei- und mehrstufige Zufallsexperimente im Baumdiagramm mit Additions- und Multiplikationsregel.', 'Two- and multi-stage experiments in tree diagrams with the sum and product rules.'),
        simulations: ['baumdiagramm', 'zaehlprinzip', 'geburtstagsproblem'],
      },
      {
        code: '5.4',
        title: L('Beschreibende Statistik', 'descriptive statistics'),
        summary: L('Median und arithmetisches Mittel, Diagramme auswerten und kritisch prüfen.', 'Median and arithmetic mean, analysing charts and checking them critically.'),
        simulations: ['boxplot', 'diagramme'],
      },
    ],
  },
];

/** Jahrgangsstufe 10 (Kap. II.3 mit Kap. II.2.2). */
const KS_10_UNITS: CurriculumUnit[] = [
  {
    code: '2',
    title: L('Größen und Messen', 'Quantities and measurement'),
    summary: L(
      'Trigonometrie, Kreise und Kreissektoren und vertiefte Körperberechnungen.',
      'Trigonometry, circles and sectors, and further calculations with solids.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Trigonometrie', 'trigonometry'),
        summary: L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck und am Einheitskreis, Sinussatz und Kosinussatz.', 'Sine, cosine and tangent in right triangles and on the unit circle, the sine rule and the cosine rule.'),
        simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'einheitskreis'],
      },
      {
        code: '2.2',
        title: L('Berechnungen an Kreisen und Kreissektoren', 'calculations with circles and sectors'),
        summary: L('Umfang und Flächeninhalt von Kreissektoren und zusammengesetzten Figuren, Bogenmaß.', 'Arc length and area of sectors and composite figures, radians.'),
        simulations: ['einheitskreis'],
      },
      {
        code: '2.3',
        title: L('Vertiefung der Berechnungen an Körpern', 'further calculations with solids'),
        summary: L('Körperberechnungen auf höherem Niveau, auch zusammengesetzte Körper mit Kegeln oder Kugeln.', 'Calculations with solids at a higher level, including composite solids with cones or spheres.'),
        simulations: ['pyramide-kegel-kugel'],
      },
    ],
  },
  {
    code: '3',
    title: L('Strukturen und funktionaler Zusammenhang', 'Structures and functional relationships'),
    summary: L(
      'Trigonometrische Funktionen, Exponentialfunktionen, Exponentialgleichungen und Logarithmen; Vertiefung der mit * gekennzeichneten Themen.',
      'Trigonometric functions, exponential functions, exponential equations and logarithms; deepening the topics marked *.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('trigonometrische Funktionen', 'trigonometric functions'),
        summary: L('Periodische Vorgänge, Projektion am Einheitskreis, Bogenmaß und die Bedeutung der Parameter a, b, c.', 'Periodic processes, projection on the unit circle, radians and the meaning of the parameters a, b, c.'),
        simulations: ['einheitskreis', 'sinusfunktion', 'transformationen'],
      },
      {
        code: '3.2',
        title: L('Exponentialfunktionen', 'exponential functions'),
        summary: L('Exponentielles Wachstum, Monotonie, Verdopplungs- und Halbwertszeit, asymptotisches Verhalten und Parameter.', 'Exponential growth, monotonicity, doubling time and half-life, asymptotic behaviour and parameters.'),
        simulations: ['exponentielles-wachstum', 'grenzverhalten', 'transformationen'],
      },
      {
        code: '3.3',
        title: L('Exponentialgleichungen', 'exponential equations'),
        summary: L('Exponentialgleichungen durch Probieren, grafisch und mit Logarithmen lösen.', 'Solving exponential equations by trial, graphically and with logarithms.'),
        simulations: ['exponentielles-wachstum', 'logarithmus'],
      },
      {
        code: '3.4',
        title: L('Logarithmen', 'logarithms'),
        summary: L('Den Logarithmus als Umkehrung des Potenzierens verstehen und nutzen.', 'Understanding and using the logarithm as the inverse of taking powers.'),
        simulations: ['logarithmus'],
      },
      {
        code: '3.5',
        title: L('Vertiefung: quadratische Funktionen und Gleichungen*', 'Deepening: quadratic functions and equations*'),
        summary: L('Die mit * gekennzeichneten Themen aus 7–9 können in Klasse 10 vertieft werden.', 'The topics from grades 7–9 marked * can be deepened in grade 10.'),
        simulations: ['quadratische-funktion'],
      },
    ],
  },
  {
    code: '4',
    title: L('Raum und Form', 'Space and shape'),
    summary: L('Ähnlichkeit von Figuren und Ähnlichkeitssatz für Dreiecke.', 'Similarity of figures and the similarity criterion for triangles.'),
    parts: [
      {
        code: '4.1',
        title: L('Ähnlichkeit', 'similarity'),
        summary: L('Ähnliche Figuren und der Ähnlichkeitssatz für Dreiecke; Wirkung des Streckfaktors auf Längen, Flächen und Volumina.', 'Similar figures and the similarity criterion for triangles; the effect of the scale factor on lengths, areas and volumes.'),
        simulations: ['vergroessern'],
      },
    ],
  },
];

/** Einführungsjahr (Kap. III.3 mit Kap. III.2.2). */
const EJ_UNITS: CurriculumUnit[] = [
  {
    code: 'A',
    title: L('Analysis', 'Calculus'),
    summary: L('Differenzialrechnung mit Extrem- und Wendepunkten.', 'Differential calculus with extreme and inflection points.'),
    parts: [
      {
        code: 'A.1',
        title: L('Differenzialrechnung', 'differential calculus'),
        summary: L(
          'Mittlere und lokale Änderungsrate, Differenzialquotient und Tangente, Ableitungsfunktion und grafisches Differenzieren, Ableitungsregeln, Funktionsklassen mit ihren Eigenschaften, Newton-Verfahren und Funktionen aus Bedingungen bestimmen.',
          'Average and instantaneous rate of change, the derivative and tangent, the derivative function and graphical differentiation, differentiation rules, function classes and their properties, Newton’s method and finding functions from conditions.',
        ),
        simulations: [
          'sekante-tangente',
          'ableitungsfunktion',
          'ganzrationale-funktionen',
          'potenzfunktionen',
          'transformationen',
          'grenzverhalten',
          'newton-verfahren',
          'parabel-drei-punkte',
          'funktionsplotter',
        ],
      },
      {
        code: 'A.2',
        title: L('Extrempunkte', 'extreme points'),
        summary: L('Monotonie, Hoch- und Tiefpunkte mit notwendiger und hinreichender Bedingung, Rand- und globale Extrema, Optimierungsprobleme.', 'Monotonicity, maxima and minima with necessary and sufficient conditions, boundary and global extrema, optimisation problems.'),
        simulations: ['kurvendiskussion', 'extremwertprobleme'],
      },
      {
        code: 'A.3',
        title: L('Wendepunkte', 'inflection points'),
        summary: L('Zweite Ableitung, Links- und Rechtskrümmung, Wendepunkte, Wendetangente und Sattelpunkt.', 'The second derivative, concavity, inflection points, inflectional tangent and saddle point.'),
        simulations: ['kurvendiskussion'],
      },
    ],
  },
  {
    code: 'G',
    title: L('Geometrie', 'Geometry'),
    summary: L('Vektoren in der Ebene und im Raum, Geraden und ihre Lagebeziehungen.', 'Vectors in the plane and in space, lines and their relative positions.'),
    parts: [
      {
        code: 'G.1',
        title: L('Vektoren im ℝ² und ℝ³', 'vectors in ℝ² and ℝ³'),
        summary: L('Punkte und Körper im Koordinatensystem, Vektoren addieren und vervielfachen, Linearkombination und lineare Abhängigkeit.', 'Points and solids in the coordinate system, adding and scaling vectors, linear combinations and linear dependence.'),
        simulations: ['koordinaten-3d', 'vektoren-3d'],
      },
      {
        code: 'G.2',
        title: L('Geraden', 'lines'),
        summary: L('Geraden im Raum in Parameterform beschreiben, auch als Bewegungen.', 'Describing lines in space in parametric form, also as motions.'),
        simulations: ['geraden-ebenen'],
      },
      {
        code: 'G.3',
        title: L('Lagebeziehungen von Geraden', 'relative position of lines'),
        summary: L('Geraden auf Schnittpunkt, Parallelität und Windschiefe untersuchen.', 'Examining lines for intersection, parallelism and skewness.'),
        simulations: ['lage-abstaende'],
      },
    ],
  },
  {
    code: 'S',
    title: L('Stochastik', 'Probability and statistics'),
    summary: L('Grundbegriffe der Wahrscheinlichkeitsrechnung und bedingte Wahrscheinlichkeit.', 'Basic concepts of probability and conditional probability.'),
    parts: [
      {
        code: 'S.1',
        title: L('Grundbegriffe der Stochastik', 'basic concepts of probability'),
        summary: L('Ergebnisse, Ereignisse und Gegenereignis, Vereinigung und Schnitt, relative Häufigkeit und Rechenregeln für Wahrscheinlichkeiten; Simulation mit dem Computer.', 'Outcomes, events and complements, union and intersection, relative frequency and rules of probability; simulation by computer.'),
        simulations: ['geburtstagsproblem'],
      },
      {
        code: 'S.2',
        title: L('bedingte Wahrscheinlichkeit', 'conditional probability'),
        summary: L('Bedingte Wahrscheinlichkeiten mit Vierfeldertafel, Baumdiagramm und inversem Baumdiagramm, stochastische Unabhängigkeit.', 'Conditional probabilities with two-way tables, tree diagrams and reversed tree diagrams, stochastic independence.'),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
      },
    ],
  },
];

/** Erstes Jahr der Qualifikationsphase. */
const Q1_UNITS: CurriculumUnit[] = [
  {
    code: 'A',
    title: L('Analysis', 'Calculus'),
    summary: L('Integralrechnung, e-Funktion und Vertiefung der Differenzial- und Integralrechnung.', 'Integral calculus, the natural exponential function and further differential and integral calculus.'),
    parts: [
      {
        code: 'A.1',
        title: L('Integralrechnung', 'integral calculus'),
        summary: L('Flächen mit Rechteckstreifen annähern, bestimmtes Integral als rekonstruierter Bestand, Integral- und Stammfunktion, Hauptsatz, Mittelwerte und Rotationskörper.', 'Approximating areas with rectangles, the definite integral as a reconstructed total, integral function and antiderivative, the fundamental theorem, mean values and solids of revolution.'),
        simulations: ['ober-untersummen', 'hauptsatz', 'stammfunktion-grafisch', 'aenderungsrate', 'rotationskoerper'],
      },
      {
        code: 'A.2',
        title: L('e-Funktion', 'the natural exponential function'),
        summary: L('Die e-Funktion als ihre eigene Ableitung, ln als Umkehrfunktion und als Stammfunktion von 1/x, Exponentialgleichungen.', 'The exponential function as its own derivative, ln as its inverse and as an antiderivative of 1/x, exponential equations.'),
        simulations: ['e-funktion', 'logarithmus', 'umkehrfunktion'],
      },
      {
        code: 'A.3',
        title: L('Vertiefung der Differenzial- und Integralrechnung', 'further differential and integral calculus'),
        summary: L('Produkt- und Kettenregel, Untersuchung zusammengesetzter Funktionen, Optimierung und Integrationsregeln.', 'Product and chain rules, analysing combined functions, optimisation and integration rules.'),
        simulations: ['kurvendiskussion', 'extremwertprobleme', 'ableitungsfunktion'],
      },
    ],
  },
  {
    code: 'G',
    title: L('Geometrie', 'Geometry'),
    summary: L('Skalar- und Vektorprodukt, Ebenen, Lagebeziehungen und Abstände.', 'Dot and cross product, planes, relative positions and distances.'),
    parts: [
      {
        code: 'G.1',
        title: L('Skalarprodukt', 'dot product'),
        summary: L('Betrag von Vektoren, Winkel zwischen Vektoren, Geraden und Ebenen, Orthogonalität.', 'Length of vectors, angles between vectors, lines and planes, orthogonality.'),
        simulations: ['skalar-vektorprodukt'],
      },
      {
        code: 'G.2',
        title: L('Ebenen', 'planes'),
        summary: L('Ebenen in Parameter-, Koordinaten- und Normalenform.', 'Planes in parametric, coordinate and normal form.'),
        simulations: ['geraden-ebenen'],
      },
      {
        code: 'G.3',
        title: L('Vektorprodukt', 'cross product'),
        summary: L('Vektorprodukt für Normalenvektoren, Flächeninhalte von Dreiecken und Parallelogrammen und Spatvolumen.', 'The cross product for normal vectors, areas of triangles and parallelograms and the volume of a parallelepiped.'),
        simulations: ['skalar-vektorprodukt'],
      },
      {
        code: 'G.4',
        title: L('Lagebeziehungen zwischen Geraden und Ebenen und zwischen Ebenen', 'relative position of lines and planes and of two planes'),
        summary: L('Schnittmengen von Geraden und Ebenen und von Ebenen bestimmen, Lösen linearer Gleichungssysteme als Schnittproblem.', 'Finding intersections of lines and planes and of planes, solving linear systems as an intersection problem.'),
        simulations: ['lage-abstaende', 'geraden-ebenen'],
      },
      {
        code: 'G.5',
        title: L('Abstände', 'distances'),
        summary: L('Abstände zwischen Punkten, Geraden und Ebenen, Lotfußpunktverfahren.', 'Distances between points, lines and planes, the foot of the perpendicular.'),
        simulations: ['lage-abstaende'],
      },
    ],
  },
  {
    code: 'S',
    title: L('Stochastik', 'Probability and statistics'),
    summary: L('Zufallsgrößen mit Kenngrößen, Binomial-, hypergeometrische und Normalverteilung.', 'Random variables and their parameters, binomial, hypergeometric and normal distributions.'),
    parts: [
      {
        code: 'S.1',
        title: L('Zufallsgröße, Erwartungswert, Streuungsmaße', 'random variable, expected value, measures of spread'),
        summary: L('Wahrscheinlichkeitsverteilungen als Prognose, Erwartungswert, Varianz und Standardabweichung, faires Spiel.', 'Probability distributions as predictions, expected value, variance and standard deviation, fair games.'),
      },
      {
        code: 'S.2',
        title: L('Binomialverteilung', 'binomial distribution'),
        summary: L('Bernoulli-Ketten, Binomialkoeffizient, Binomialverteilung mit Erwartungswert und Standardabweichung, Sigma-Regeln.', 'Bernoulli chains, the binomial coefficient, the binomial distribution with expected value and standard deviation, sigma rules.'),
        simulations: ['galtonbrett', 'binomialverteilung'],
      },
      {
        code: 'S.3',
        title: L('Hypergeometrische Verteilung', 'hypergeometric distribution'),
        summary: L('Ziehen ohne Zurücklegen mit der hypergeometrischen Verteilung beschreiben.', 'Describing sampling without replacement with the hypergeometric distribution.'),
      },
      {
        code: 'S.4',
        title: L('Normalverteilung', 'normal distribution'),
        summary: L('Dichtefunktion und Glockenkurve, Bedeutung von μ und σ, Näherung der Binomialverteilung nach Moivre-Laplace.', 'Density function and bell curve, the meaning of μ and σ, approximating the binomial distribution by de Moivre–Laplace.'),
        simulations: ['normalverteilung'],
      },
    ],
  },
];

/** Zweites Jahr der Qualifikationsphase. */
const Q2_UNITS: CurriculumUnit[] = [
  {
    code: 'A',
    title: L('Analysis', 'Calculus'),
    summary: L('Funktionenscharen und Vertiefung der Differenzial- und Integralrechnung.', 'Families of functions and further differential and integral calculus.'),
    parts: [
      {
        code: 'A.1',
        title: L('Funktionenscharen', 'families of functions'),
        summary: L('Funktionen mit Parameter untersuchen, Ortskurven charakteristischer Punkte.', 'Analysing functions with a parameter, loci of characteristic points.'),
        simulations: ['funktionenscharen'],
      },
      {
        code: 'A.2',
        title: L('Vertiefung der Differenzial- und Integralrechnung', 'further differential and integral calculus'),
        summary: L('Anwendungen der Analysis in Sachzusammenhängen, uneigentliche Integrale und Rotationskörper.', 'Applications of calculus in real contexts, improper integrals and solids of revolution.'),
        simulations: ['extremwertprobleme', 'hauptsatz', 'stammfunktion-grafisch', 'rotationskoerper'],
      },
    ],
  },
  {
    code: 'G',
    title: L('Geometrie', 'Geometry'),
    summary: L('Vertiefung der analytischen Geometrie.', 'Further analytic geometry.'),
    parts: [
      {
        code: 'G.1',
        title: L('Vertiefung der analytischen Geometrie', 'further analytic geometry'),
        summary: L('Geraden- und Ebenenscharen, Bewegungen im Raum und komplexere Lage- und Abstandsprobleme.', 'Families of lines and planes, motion in space and more complex problems of position and distance.'),
        simulations: ['geraden-ebenen', 'lage-abstaende'],
      },
    ],
  },
  {
    code: 'S',
    title: L('Stochastik', 'Probability and statistics'),
    summary: L('Signifikanztests und Schätzen von Wahrscheinlichkeiten.', 'Significance tests and estimating probabilities.'),
    parts: [
      {
        code: 'S.1',
        title: L('Signifikanztest', 'significance test'),
        summary: L('Zwei- und einseitige Hypothesentests, Nullhypothese, Signifikanzniveau, Verwerfungsbereich und Fehler 1. und 2. Art.', 'Two- and one-sided hypothesis tests, null hypothesis, significance level, rejection region and type I and type II errors.'),
        simulations: ['signifikanztest'],
      },
      {
        code: 'S.2',
        title: L('Schätzen von Wahrscheinlichkeiten', 'estimating probabilities'),
        summary: L('Prognose- und Konfidenzintervalle aus einem Stichprobenergebnis durch systematisches Probieren bestimmen.', 'Finding prediction and confidence intervals from a sample result by systematic trial.'),
        simulations: ['binomialverteilung', 'normalverteilung'],
      },
    ],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(mathematik, n, units),
});

/**
 * Mathematik am Gymnasium in Schleswig-Holstein (G9, Abitur nach Jahrgangsstufe 13) nach den
 * „Fachanforderungen Mathematik, Allgemeinbildende Schulen, Sekundarstufe I, Sekundarstufe II“,
 * Ministerium für Allgemeine und Berufliche Bildung, Wissenschaft, Forschung und Kultur,
 * 2. überarbeitete Auflage, Kiel, Juni 2024 (ein Dokument für beide Stufen).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/schleswig-holstein-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Sek. I nach der verbindlichen Verteilungstabelle (5/6, 7/8/9, 10),
 * Oberstufe nach der Themenübersicht (Einführungsjahr 11, Qualifikationsphase 12 und 13).
 * Die Nummern sind selbst vergeben.
 *
 * Überschriften entsprechen den Fachanforderungen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const schleswigHolsteinGymnasiumMathematik: StateCurriculum = {
  id: 'schleswig-holstein-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('schleswig-holstein-gymnasium', 'schleswig-holstein-gymnasium'),
  state: L('Schleswig-Holstein', 'Schleswig-Holstein'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Fachanforderungen',
  grades: [
    grade(5, KS_5_6, KS_5_6_UNITS),
    grade(6, KS_5_6, KS_5_6_UNITS),
    grade(7, KS_7_9, KS_7_9_UNITS),
    grade(8, KS_7_9, KS_7_9_UNITS),
    grade(9, KS_7_9, KS_7_9_UNITS),
    grade(10, KS_10, KS_10_UNITS),
    grade(11, EJ, EJ_UNITS),
    grade(12, Q1, Q1_UNITS),
    grade(13, Q2, Q2_UNITS),
  ],
};
