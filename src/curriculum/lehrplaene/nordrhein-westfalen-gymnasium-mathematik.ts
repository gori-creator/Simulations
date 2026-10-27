import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Lehrplannavigator des Ministeriums für Schule und Bildung NRW. Die Kernlehrpläne
 * verweisen auf ihn („www.lehrplannavigator.nrw.de“ bzw. „https://www.schulentwicklung.nrw.de/lehrplaene/“);
 * ein Link zur einzelnen PDF-Datei steht in den Dokumenten nicht.
 */
const SOURCE = 'https://www.schulentwicklung.nrw.de/lehrplaene/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/nordrhein-westfalen-gymnasium-mathematik.md, Teil E).
const ERPROBUNGSSTUFE = L(
  'Erprobungsstufe (Klassen 5 und 6): Der Kernlehrplan nennt die Kompetenzerwartungen „bis zum Ende der Erprobungsstufe“; die Lernbereiche stehen deshalb bei 5 und 6 gleich. Jede Simulation steht bei dem Jahrgang, für den sie gedacht ist; beim anderen führt ein Verweis dorthin. Die Inhaltsfelder und Schwerpunkte sind im Lehrplan nicht nummeriert; die Nummern sind von uns vergeben und laufen über alle Stufen der Sekundarstufe I durch.',
  'Orientation stage (grades 5 and 6): the core curriculum states its expectations “by the end of the orientation stage”, so the units are the same for grades 5 and 6. Each simulation is listed under the grade it is designed for; the other grade links to it. Content areas and focal points are not numbered in the curriculum; the numbers are our own and run through all stages of lower secondary.',
);

const ERSTE_STUFE = L(
  'Erste Stufe bis zum Ende der Sekundarstufe I. Der Kernlehrplan nennt für die erste und zweite Stufe keine genauen Jahrgänge; die erste Stufe steht deshalb als Doppeljahrgangsstufe 7/8 (G9), die Lernbereiche stehen bei 7 und 8 gleich; jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben.',
  'First stage up to the end of lower secondary. The core curriculum does not name exact grades for the first and second stage, so the first stage is shown as the double grade 7/8 (G9) with the same units for grades 7 and 8; each simulation is listed under the grades it is designed for. The numbers are our own.',
);

const ZWEITE_STUFE = L(
  'Zweite Stufe bis zum Ende der Sekundarstufe I. Der Kernlehrplan nennt keine genauen Jahrgänge; die zweite Stufe steht deshalb als Doppeljahrgangsstufe 9/10 (G9, Ende der Sekundarstufe I nach Klasse 10), die Lernbereiche stehen bei 9 und 10 gleich; jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben.',
  'Second stage up to the end of lower secondary. The core curriculum does not name exact grades, so the second stage is shown as the double grade 9/10 (G9, lower secondary ends after grade 10) with the same units for grades 9 and 10; each simulation is listed under the grades it is designed for. The numbers are our own.',
);

const EF = L(
  'Einführungsphase der gymnasialen Oberstufe (G9: Jahrgangsstufe 11). Die Buchstaben A und G stehen im Lehrplan für die Inhaltsfelder; die Nummern der Schwerpunkte sind von uns vergeben. Kernlehrplan Sekundarstufe II von 2026, in Kraft ab 1. August 2027 beginnend mit der Einführungsphase; der Kernlehrplan von 2023 läuft aus und ist hier nicht abgebildet.',
  'Introductory phase of upper secondary (G9: grade 11). The letters A and G are the curriculum’s labels for the content areas; the numbers of the focal points are our own. Core curriculum for upper secondary of 2026, in force from 1 August 2027, starting with the introductory phase; the 2023 core curriculum is being phased out and is not shown here.',
);

const QPHASE = L(
  'Qualifikationsphase (G9: Jahrgangsstufen 12 und 13). Der Kernlehrplan unterscheidet Grundkurs und Leistungskurs, verteilt die Inhalte aber nicht auf Halbjahre; die Lernbereiche stehen deshalb bei 12 und 13 gleich. Abgebildet sind die Schwerpunkte des Leistungskurses; „Nur LK“ kennzeichnet, was im Grundkurs fehlt. Die Buchstaben A, G und S stehen im Lehrplan; die Nummern sind von uns vergeben.',
  'Qualification phase (G9: grades 12 and 13). The core curriculum distinguishes basic and advanced courses but does not distribute the content over half-years, so the units are the same for grades 12 and 13. The focal points of the advanced course are shown; “advanced course only” marks what the basic course leaves out. The letters A, G and S are the curriculum’s; the numbers are our own.',
);

/** Erprobungsstufe (Kap. 2.3). */
const ERPROBUNG_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Arithmetik/Algebra', 'Arithmetic/algebra'),
    summary: L(
      'Rechnen mit natürlichen Zahlen, einfachen Brüchen und Dezimalzahlen, Rechengesetze und Teilbarkeit, Brüche als Anteile sowie Größen und Einheiten.',
      'Calculating with natural numbers, simple fractions and decimals, laws of arithmetic and divisibility, fractions as parts of a whole, and quantities and units.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Grundrechenarten', 'The four operations'),
        summary: L(
          'Die vier Grundrechenarten mit natürlichen Zahlen, einfachen Brüchen und endlichen Dezimalzahlen, auch schriftlich dividieren.',
          'The four operations with natural numbers, simple fractions and terminating decimals, including long division.',
        ),
        simulations: ['brueche-rechnen', 'dezimalbrueche'],
      },
      {
        code: '1.2',
        title: L('Gesetze und Regeln', 'Laws and rules'),
        summary: L(
          'Kommutativ-, Assoziativ- und Distributivgesetz für vorteilhaftes Rechnen sowie Teilbarkeitsregeln.',
          'Commutative, associative and distributive laws for clever calculation, and divisibility rules.',
        ),
        simulations: ['termbaum', 'primfaktoren'],
      },
      {
        code: '1.3',
        title: L('Begriffsbildung', 'Concepts'),
        summary: L(
          'Primzahlen und Primfaktorzerlegung, Anteile und Bruchteile von Größen, Kürzen und Erweitern, Rechenterme mit Fachbegriffen.',
          'Prime numbers and prime factorisation, parts and fractions of quantities, simplifying and expanding fractions, arithmetic expressions with technical terms.',
        ),
        simulations: ['primfaktoren', 'bruchteile', 'brueche-vergleichen', 'termbaum'],
      },
      {
        code: '1.4',
        title: L('Zahlbereichserweiterung', 'Extending the number system'),
        summary: L(
          'Positive rationale Zahlen; ganze Zahlen darstellen und für Zustände, Veränderungen und Koordinaten nutzen.',
          'Positive rational numbers; representing integers and using them for states, changes and coordinates.',
        ),
        simulations: ['zahlengerade'],
      },
      {
        code: '1.5',
        title: L('Darstellung', 'Representation'),
        summary: L(
          'Stellenwerttafel, Zahlenstrahl, Wortform, Bruch, endliche und periodische Dezimalzahl und Prozentzahl, Runden und Überschlag.',
          'Place-value chart, number line, words, fractions, terminating and recurring decimals and percentages, rounding and estimation.',
        ),
        simulations: ['stellenwerte', 'zehnerpotenzen', 'dezimalbrueche', 'prozentstreifen'],
      },
      {
        code: '1.6',
        title: L('Größen und Einheiten', 'Quantities and units'),
        summary: L(
          'Länge, Flächeninhalt, Volumen, Zeit, Geld und Masse schätzen, passend wählen und umrechnen.',
          'Estimating, choosing and converting length, area, volume, time, money and mass.',
        ),
        simulations: ['einheiten'],
      },
    ],
  },
  {
    code: '2',
    title: L('Funktionen', 'Functions'),
    summary: L(
      'Zusammenhänge zwischen Größen in Worten, Tabellen und Diagrammen beschreiben, Dreisatz, Zahlenmuster und Maßstab.',
      'Describing relationships between quantities in words, tables and diagrams, the rule of three, number patterns and scale.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Zusammenhang zwischen Größen', 'Relationships between quantities'),
        summary: L(
          'Diagramm, Tabelle, Wortform, Maßstab und Dreisatzverfahren.',
          'Diagrams, tables, verbal descriptions, scale and the rule of three.',
        ),
        simulations: ['massstab', 'proportional'],
      },
    ],
  },
  {
    code: '3',
    title: L('Geometrie', 'Geometry'),
    summary: L(
      'Ebene Figuren und Körper beschreiben und zeichnen, Winkel messen, Symmetrie und Abbildungen sowie Umfang, Flächeninhalt, Oberfläche und Volumen einfacher Figuren.',
      'Describing and drawing plane figures and solids, measuring angles, symmetry and transformations, as well as perimeter, area, surface area and volume of simple shapes.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Ebene Figuren', 'Plane figures'),
        summary: L(
          'Kreis, besondere Dreiecke und Vierecke, Winkel, Strecke, Gerade, Koordinatensystem; Umfang und Flächeninhalt von Rechteck und rechtwinkligem Dreieck, Zerlegen und Ergänzen.',
          'Circles, special triangles and quadrilaterals, angles, segments, lines, the coordinate system; perimeter and area of rectangles and right triangles, decomposing and completing.',
        ),
        simulations: ['koordinaten-lage', 'winkel-messen', 'vierecke', 'umfang-flaeche', 'flaechen-zerlegen'],
      },
      {
        code: '3.2',
        title: L('Körper', 'Solids'),
        summary: L(
          'Quader, Pyramide, Zylinder, Kegel und Kugel erkennen; Netze und Schrägbilder von Quader und Würfel, ihre Oberfläche und ihr Volumen.',
          'Recognising cuboids, pyramids, cylinders, cones and spheres; nets and oblique drawings of cuboids and cubes, their surface area and volume.',
        ),
        simulations: ['koerpernetze', 'quader-volumen'],
      },
      {
        code: '3.3',
        title: L('Lagebeziehung und Symmetrie', 'Relative position and symmetry'),
        summary: L('Parallelität, Orthogonalität, Punkt- und Achsensymmetrie.', 'Parallel and perpendicular lines, point and line symmetry.'),
        simulations: ['koordinaten-lage', 'spiegelung'],
      },
      {
        code: '3.4',
        title: L('Abbildungen', 'Transformations'),
        summary: L(
          'Verschiebungen, Drehungen, Punkt- und Achsenspiegelungen, auch im Koordinatensystem.',
          'Translations, rotations, point and line reflections, also in the coordinate system.',
        ),
        simulations: ['spiegelung'],
      },
    ],
  },
  {
    code: '4',
    title: L('Stochastik', 'Stochastics'),
    summary: L(
      'Daten erheben und in Listen, Tabellen und Diagrammen darstellen, Häufigkeiten und Kenngrößen bestimmen und Darstellungen kritisch lesen.',
      'Collecting data and presenting it in lists, tables and diagrams, determining frequencies and statistical measures and reading diagrams critically.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Statistische Daten', 'Statistical data'),
        summary: L(
          'Datenerhebung, Ur- und Strichlisten, Klasseneinteilung, Säulen- und Kreisdiagramme und Boxplots.',
          'Collecting data, raw data and tally charts, grouping into classes, bar and pie charts and box plots.',
        ),
        simulations: ['diagramme', 'boxplot'],
      },
      {
        code: '4.2',
        title: L('Begriffsbildung', 'Concepts'),
        summary: L('Absolute und relative Häufigkeit.', 'Absolute and relative frequency.'),
      },
      {
        code: '4.3',
        title: L('Kenngrößen', 'Statistical measures'),
        summary: L(
          'Arithmetisches Mittel, Median, Spannweite und Quartile, auch wie einzelne Daten sie verändern.',
          'Mean, median, range and quartiles, including how single data points change them.',
        ),
        simulations: ['boxplot'],
      },
    ],
  },
];

/** Erste Stufe bis zum Ende der Sekundarstufe I (Kap. 2.4.1). */
const ERSTE_STUFE_UNITS: CurriculumUnit[] = [
  {
    code: '5',
    title: L('Arithmetik/Algebra', 'Arithmetic/algebra'),
    summary: L(
      'Rationale Zahlen und Vorzeichenregeln, Variablen und Terme umformen, binomische Formeln sowie lineare Gleichungen, Gleichungssysteme mit zwei Variablen und einfache Bruchgleichungen lösen.',
      'Rational numbers and sign rules, variables and transforming terms, binomial formulas, and solving linear equations, systems with two variables and simple fractional equations.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Zahlbereichserweiterung', 'Extending the number system'),
        summary: L(
          'Rationale Zahlen an der Zahlengeraden darstellen und ordnen; warum man Zahlbereiche erweitert.',
          'Representing and ordering rational numbers on the number line; why number systems are extended.',
        ),
        simulations: ['zahlengerade'],
      },
      {
        code: '5.2',
        title: L('Term und Variable', 'Term and variable'),
        summary: L(
          'Variable als Veränderliche, Platzhalter und Unbekannte; Terme aufstellen und zielgerichtet umformen.',
          'Variables as changing quantities, placeholders and unknowns; setting up and purposefully transforming terms.',
        ),
        simulations: ['termbaum'],
      },
      {
        code: '5.3',
        title: L('Gesetze und Regeln', 'Laws and rules'),
        summary: L(
          'Vorzeichenregeln, Rechengesetze für rationale Zahlen und binomische Formeln.',
          'Sign rules, laws of arithmetic for rational numbers and binomial formulas.',
        ),
        simulations: ['zahlengerade', 'binomische-formeln', 'termbaum'],
      },
      {
        code: '5.4',
        title: L('Lösungsverfahren', 'Solution methods'),
        summary: L(
          'Algebraische und grafische Verfahren für lineare Gleichungen, lineare Gleichungssysteme mit zwei Variablen und einfache Bruchgleichungen.',
          'Algebraic and graphical methods for linear equations, linear systems with two variables and simple fractional equations.',
        ),
        simulations: ['waagemodell', 'lgs-grafisch', 'gleichungen-grafisch'],
      },
    ],
  },
  {
    code: '6',
    title: L('Funktionen', 'Functions'),
    summary: L(
      'Proportionale und antiproportionale Zuordnungen, der Funktionsbegriff, lineare Funktionen mit Steigung und Achsenabschnitt sowie Prozent- und Zinsrechnung.',
      'Proportional and inversely proportional relationships, the concept of a function, linear functions with slope and intercept, and percentages and interest.',
    ),
    parts: [
      {
        code: '6.1',
        title: L('Proportionale und antiproportionale Zuordnung', 'Proportional and inversely proportional relationships'),
        summary: L(
          'Zuordnungsvorschrift, Graph, Tabelle, Quotienten- und Produktgleichheit, Proportionalitätsfaktor und Dreisatz; Funktionen als eindeutige Zuordnungen.',
          'Rule of assignment, graph, table, equal quotients and equal products, constant of proportionality and rule of three; functions as unique assignments.',
        ),
        simulations: ['proportional', 'hyperbel', 'funktion-zuordnung'],
      },
      {
        code: '6.2',
        title: L('Lineare Funktionen', 'Linear functions'),
        summary: L(
          'Funktionsterm, Graph, Tabelle und Wortform, Achsenabschnitte, Steigung und Steigungsdreieck, auch mit Funktionenplotter.',
          'Function term, graph, table and verbal form, intercepts, slope and slope triangle, also with a function plotter.',
        ),
        simulations: ['lineare-funktion', 'funktionsplotter'],
      },
      {
        code: '6.3',
        title: L('Prozent- und Zinsrechnung', 'Percentages and interest'),
        summary: L(
          'Grundwert, Prozentwert und Prozentsatz, prozentuale Veränderung und Wachstumsfaktor, Zinsen.',
          'Base value, percentage value and rate, percentage change and growth factor, interest.',
        ),
        simulations: ['prozentstreifen'],
      },
    ],
  },
  {
    code: '7',
    title: L('Geometrie', 'Geometry'),
    summary: L(
      'Flächeninhalte von Dreiecken, Vierecken und zusammengesetzten Figuren, Winkelsätze, Kongruenzsätze und Satz des Thales sowie Konstruktionen mit Zirkel und Lineal.',
      'Areas of triangles, quadrilaterals and composite figures, angle theorems, congruence theorems and Thales’ theorem, and constructions with compass and ruler.',
    ),
    parts: [
      {
        code: '7.1',
        title: L('Umfang und Flächeninhalt', 'Perimeter and area'),
        summary: L(
          'Dreieck, Viereck und zusammengesetzte Figuren, Höhe und Grundseite.',
          'Triangles, quadrilaterals and composite figures, height and base.',
        ),
        simulations: ['flaechen-zerlegen'],
      },
      {
        code: '7.2',
        title: L('Geometrische Sätze', 'Geometric theorems'),
        summary: L(
          'Neben-, Scheitel-, Stufen- und Wechselwinkel, Innen-, Außen- und Basiswinkelsatz, Kongruenzsätze und Satz des Thales.',
          'Adjacent, vertical, corresponding and alternate angles, interior, exterior and base angle theorems, congruence theorems and Thales’ theorem.',
        ),
        simulations: ['winkel-geradenkreuzung', 'winkelsumme', 'dreieckskonstruktion', 'thales'],
      },
      {
        code: '7.3',
        title: L('Konstruktion', 'Construction'),
        summary: L(
          'Dreiecke, Mittelsenkrechte, Seitenhalbierende, Winkelhalbierende, Inkreis, Umkreis, Thaleskreis und Schwerpunkt.',
          'Triangles, perpendicular bisectors, medians, angle bisectors, incircle, circumcircle, Thales circle and centroid.',
        ),
        simulations: ['dreieckskonstruktion', 'mittelsenkrechte', 'besondere-linien', 'thales'],
      },
    ],
  },
  {
    code: '8',
    title: L('Stochastik', 'Stochastics'),
    summary: L(
      'Ein- und zweistufige Zufallsversuche mit Baumdiagramm, Wahrscheinlichkeiten aus langen Versuchsreihen schätzen, Laplace-Wahrscheinlichkeit und Pfadregeln.',
      'One- and two-stage random experiments with tree diagrams, estimating probabilities from long series of trials, Laplace probability and path rules.',
    ),
    parts: [
      {
        code: '8.1',
        title: L('Wahrscheinlichkeiten und Zufallsexperimente', 'Probabilities and random experiments'),
        summary: L('Ein- und zweistufige Zufallsversuche und Baumdiagramm.', 'One- and two-stage random experiments and tree diagrams.'),
        simulations: ['baumdiagramm'],
      },
      {
        code: '8.2',
        title: L('Stochastische Regeln', 'Rules of probability'),
        summary: L(
          'Empirisches Gesetz der großen Zahlen, Laplace-Wahrscheinlichkeit und Pfadregeln.',
          'Empirical law of large numbers, Laplace probability and path rules.',
        ),
        simulations: ['gesetz-grosse-zahlen', 'baumdiagramm'],
      },
      {
        code: '8.3',
        title: L('Begriffsbildung', 'Concepts'),
        summary: L('Ergebnis, Ereignis und Wahrscheinlichkeit.', 'Outcome, event and probability.'),
      },
    ],
  },
];

/** Zweite Stufe bis zum Ende der Sekundarstufe I (Kap. 2.4.2). */
const ZWEITE_STUFE_UNITS: CurriculumUnit[] = [
  {
    code: '9',
    title: L('Arithmetik/Algebra', 'Arithmetic/algebra'),
    summary: L(
      'Reelle Zahlen, Potenzen, Wurzeln und Logarithmen mit ihren Gesetzen, Näherungsverfahren sowie quadratische Gleichungen und Exponentialgleichungen lösen.',
      'Real numbers, powers, roots and logarithms with their laws, approximation methods, and solving quadratic and exponential equations.',
    ),
    parts: [
      {
        code: '9.1',
        title: L('Zahlbereichserweiterung', 'Extending the number system'),
        summary: L('Reelle Zahlen; rationale und irrationale Zahlen unterscheiden.', 'Real numbers; distinguishing rational and irrational numbers.'),
        simulations: ['quadratwurzel'],
      },
      {
        code: '9.2',
        title: L('Begriffsbildung', 'Concepts'),
        summary: L('Potenzen, Wurzeln und Logarithmen, Zehnerpotenzschreibweise.', 'Powers, roots and logarithms, scientific notation.'),
        simulations: ['quadratwurzel', 'logarithmus'],
      },
      {
        code: '9.3',
        title: L('Gesetze und Regeln', 'Laws and rules'),
        summary: L('Potenzgesetze und Wurzelgesetze, Wurzel- und Potenzschreibweise.', 'Laws of exponents and of roots, root and power notation.'),
      },
      {
        code: '9.4',
        title: L('Lösungsverfahren und Algorithmen', 'Solution methods and algorithms'),
        summary: L(
          'Näherungsverfahren für Quadratwurzeln, quadratische Gleichungen mit quadratischer Ergänzung, p-q-Formel und Satz von Vieta, Exponentialgleichungen durch Probieren und Logarithmieren.',
          'Approximating square roots, quadratic equations by completing the square, the p-q formula and Vieta’s theorem, exponential equations by trial and by taking logarithms.',
        ),
        simulations: ['quadratwurzel', 'gleichungen-grafisch', 'logarithmus'],
      },
    ],
  },
  {
    code: '10',
    title: L('Funktionen', 'Functions'),
    summary: L(
      'Quadratische Funktionen in verschiedenen Termformen, exponentielles Wachstum und Sinusfunktionen für periodische Vorgänge; Parameter deuten und Modelle auswählen.',
      'Quadratic functions in different forms, exponential growth and sine functions for periodic processes; interpreting parameters and choosing models.',
    ),
    parts: [
      {
        code: '10.1',
        title: L('Quadratische Funktionen', 'Quadratic functions'),
        summary: L(
          'Normal-, Scheitelpunkt- und faktorisierte Form, Scheitelpunkt, Symmetrie, Öffnung, Nullstellen, Verschieben und Strecken der Normalparabel und Extremwertprobleme.',
          'Standard, vertex and factorised form, vertex, symmetry, opening, zeros, shifting and stretching the standard parabola, and optimisation problems.',
        ),
        simulations: ['quadratische-funktion', 'parabel-drei-punkte', 'extremwert-parabel', 'funktionsplotter'],
      },
      {
        code: '10.2',
        title: L('Exponentielle Funktionen', 'Exponential functions'),
        summary: L(
          'Anfangswert, Wachstumsfaktor und -rate, Verdopplungs- und Halbwertszeit, langfristige Entwicklung im Vergleich mit linearem Wachstum.',
          'Initial value, growth factor and rate, doubling time and half-life, long-term behaviour compared with linear growth.',
        ),
        simulations: ['exponentielles-wachstum'],
      },
      {
        code: '10.3',
        title: L('Sinusfunktionen', 'Sine functions'),
        summary: L(
          'Sinus und Kosinus am Einheitskreis, Grad- und Bogenmaß, Amplitude und Periode zeitlich periodischer Vorgänge.',
          'Sine and cosine on the unit circle, degrees and radians, amplitude and period of processes that repeat in time.',
        ),
        simulations: ['einheitskreis', 'sinusfunktion'],
      },
    ],
  },
  {
    code: '11',
    title: L('Geometrie', 'Geometry'),
    summary: L(
      'Kreis und Kreisteile, Oberfläche und Volumen von Prisma, Zylinder, Pyramide, Kegel und Kugel, zentrische Streckung und Ähnlichkeit, Satz des Pythagoras, Kosinussatz und Trigonometrie.',
      'Circles and sectors, surface area and volume of prisms, cylinders, pyramids, cones and spheres, enlargement and similarity, Pythagoras’ theorem, the law of cosines and trigonometry.',
    ),
    parts: [
      {
        code: '11.1',
        title: L('Kreis', 'Circle'),
        summary: L(
          'Umfang und Flächeninhalt von Kreis, Kreisbogen und Kreissektor, Herleitung durch Näherung, Tangente.',
          'Circumference and area of circles, arcs and sectors, derived by approximation, tangents.',
        ),
        simulations: ['kreiszahl-pi'],
      },
      {
        code: '11.2',
        title: L('Körper', 'Solids'),
        summary: L(
          'Oberfläche und Volumen von Kugel, Zylinder, Prisma, Kegel und Pyramide; Prinzip von Cavalieri.',
          'Surface area and volume of spheres, cylinders, prisms, cones and pyramids; Cavalieri’s principle.',
        ),
        simulations: ['prisma-zylinder', 'pyramide-kegel-kugel', 'cavalieri'],
      },
      {
        code: '11.3',
        title: L('Abbildung/Lagebeziehung', 'Transformation/relative position'),
        summary: L(
          'Zentrische Streckungen mit Zentrum und Streckfaktor, ähnliche Figuren.',
          'Enlargements with centre and scale factor, similar figures.',
        ),
        simulations: ['strahlensaetze', 'vergroessern'],
      },
      {
        code: '11.4',
        title: L('Geometrische Sätze', 'Geometric theorems'),
        summary: L(
          'Satz des Pythagoras mit Beweis, Kosinussatz als seine Verallgemeinerung.',
          'Pythagoras’ theorem with proof, the law of cosines as its generalisation.',
        ),
        simulations: ['pythagoras', 'sinussatz-kosinussatz'],
      },
      {
        code: '11.5',
        title: L('Trigonometrie', 'Trigonometry'),
        summary: L(
          'Sinus, Kosinus und Tangens als Seitenverhältnisse ähnlicher rechtwinkliger Dreiecke; Längen und Winkel berechnen.',
          'Sine, cosine and tangent as side ratios of similar right triangles; calculating lengths and angles.',
        ),
        simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz'],
      },
    ],
  },
  {
    code: '12',
    title: L('Stochastik', 'Stochastics'),
    summary: L(
      'Statistische Erhebungen planen und Manipulationen in Diagrammen erkennen; bedingte Wahrscheinlichkeit, Unabhängigkeit, Vierfeldertafel, Baumdiagramm und Kombinatorik.',
      'Planning statistical surveys and spotting manipulated diagrams; conditional probability, independence, two-way tables, tree diagrams and combinatorics.',
    ),
    parts: [
      {
        code: '12.1',
        title: L('Statistische Daten', 'Statistical data'),
        summary: L(
          'Erhebungen mit digitalen Werkzeugen planen und auswerten, Diagramme kritisch prüfen und Manipulationen erkennen.',
          'Planning and evaluating surveys with digital tools, checking diagrams critically and spotting manipulation.',
        ),
      },
      {
        code: '12.2',
        title: L('Wahrscheinlichkeiten und Zufallsexperimente', 'Probabilities and random experiments'),
        summary: L(
          'Bedingte Wahrscheinlichkeit, stochastische Unabhängigkeit, Vierfeldertafel, Baumdiagramme und Pfadregeln sowie Anzahlen durch kombinatorische Überlegungen.',
          'Conditional probability, stochastic independence, two-way tables, tree diagrams and path rules, as well as counting with combinatorial reasoning.',
        ),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'baumdiagramm', 'zaehlprinzip', 'ziegenproblem'],
      },
    ],
  },
];

/** Einführungsphase (Kap. 2.3 des Kernlehrplans Sekundarstufe II). */
const EF_UNITS: CurriculumUnit[] = [
  {
    code: 'EF-A',
    title: L('Funktionen und Analysis (A)', 'Functions and calculus (A)'),
    summary: L(
      'Potenzfunktionen und ganzrationale Funktionen, Transformationen, der Übergang von der mittleren zur lokalen Änderungsrate und die Untersuchung von Graphen mit der Ableitung.',
      'Power functions and polynomial functions, transformations, the step from average to instantaneous rate of change and analysing graphs with the derivative.',
    ),
    parts: [
      {
        code: 'EF-A.1',
        title: L('Funktionen', 'Functions'),
        summary: L(
          'Potenzfunktionen mit ganzzahligen Exponenten und ganzrationale Funktionen; Polynomgleichungen durch Ausklammern lösen.',
          'Power functions with integer exponents and polynomial functions; solving polynomial equations by factoring out.',
        ),
        simulations: ['potenzfunktionen', 'ganzrationale-funktionen', 'funktionsplotter'],
      },
      {
        code: 'EF-A.2',
        title: L('Eigenschaften von Funktionen', 'Properties of functions'),
        summary: L(
          'Verlauf des Graphen, Definitions- und Wertebereich, Nullstellen, Symmetrie und Verhalten für große x.',
          'Shape of the graph, domain and range, zeros, symmetry and behaviour for large x.',
        ),
        simulations: ['ganzrationale-funktionen', 'grenzverhalten'],
      },
      {
        code: 'EF-A.3',
        title: L('Transformationen', 'Transformations'),
        summary: L(
          'Spiegeln, Verschieben und Strecken an beiden Achsen, auch bei der Sinusfunktion; Parameter deuten.',
          'Reflecting, shifting and stretching along both axes, including the sine function; interpreting parameters.',
        ),
        simulations: ['transformationen', 'sinusfunktion'],
      },
      {
        code: 'EF-A.4',
        title: L('Grundverständnis des Ableitungsbegriffs', 'Basic understanding of the derivative'),
        summary: L(
          'Mittlere und lokale Änderungsrate, Sekante und Tangente, graphisches Ableiten.',
          'Average and instantaneous rate of change, secant and tangent, sketching the derivative graphically.',
        ),
        simulations: ['sekante-tangente', 'ableitungsfunktion'],
      },
      {
        code: 'EF-A.5',
        title: L('Differentialrechnung', 'Differential calculus'),
        summary: L(
          'Potenz-, Summen- und Faktorregel, Monotonie, lokale und globale Extrema, Krümmung und Wendepunkte.',
          'Power, sum and constant-multiple rules, monotonicity, local and global extrema, curvature and points of inflection.',
        ),
        simulations: ['kurvendiskussion', 'ableitungsfunktion'],
      },
    ],
  },
  {
    code: 'EF-G',
    title: L('Analytische Geometrie und Lineare Algebra (G)', 'Analytic geometry and linear algebra (G)'),
    summary: L(
      'Punkte und Vektoren im räumlichen Koordinatensystem, mit Vektoren rechnen, Geraden in Parameterform und ihre Lagebeziehungen.',
      'Points and vectors in a three-dimensional coordinate system, calculating with vectors, lines in parametric form and their relative positions.',
    ),
    parts: [
      {
        code: 'EF-G.1',
        title: L('Koordinatisierungen des Raumes', 'Coordinates in space'),
        summary: L('Punkte, Ortsvektoren und Vektoren im räumlichen Koordinatensystem.', 'Points, position vectors and vectors in a three-dimensional coordinate system.'),
        simulations: ['koordinaten-3d', 'vektoren-3d'],
      },
      {
        code: 'EF-G.2',
        title: L('Vektoroperationen', 'Vector operations'),
        summary: L('Addition und Multiplikation mit einem Skalar.', 'Addition and multiplication by a scalar.'),
        simulations: ['vektoren-3d'],
      },
      {
        code: 'EF-G.3',
        title: L('Eigenschaften von Vektoren', 'Properties of vectors'),
        summary: L('Länge und Abstand mit dem Satz des Pythagoras, Kollinearität.', 'Length and distance using Pythagoras’ theorem, collinearity.'),
        simulations: ['koordinaten-3d', 'vektoren-3d'],
      },
      {
        code: 'EF-G.4',
        title: L('Geraden und Strecken', 'Lines and segments'),
        summary: L('Parameterform und Deutung der Parameter im Sachkontext.', 'Parametric form and interpreting the parameters in context.'),
        simulations: ['geraden-ebenen'],
      },
      {
        code: 'EF-G.5',
        title: L('Lagebeziehung von Geraden', 'Relative position of lines'),
        summary: L('Identisch, parallel, windschief oder sich schneidend.', 'Identical, parallel, skew or intersecting.'),
        simulations: ['lage-abstaende'],
      },
      {
        code: 'EF-G.6',
        title: L('Schnittpunkte', 'Points of intersection'),
        summary: L('Schnittpunkte von Geraden über lineare Gleichungssysteme.', 'Intersections of lines using systems of linear equations.'),
        simulations: ['lage-abstaende'],
      },
    ],
  },
];

/** Qualifikationsphase, Grundkurs (Kap. 2.4.1) und Leistungskurs (Kap. 2.4.2). */
const Q_UNITS: CurriculumUnit[] = [
  {
    code: 'Q-A',
    title: L('Funktionen und Analysis (A)', 'Functions and calculus (A)'),
    summary: L(
      'Exponentialfunktionen und die e-Funktion, Produkt- und Kettenregel, Extremwertprobleme und Steckbriefaufgaben sowie Integralrechnung bis zum Hauptsatz.',
      'Exponential functions and the natural exponential function, product and chain rules, optimisation and reconstructing functions from conditions, and integral calculus up to the fundamental theorem.',
    ),
    parts: [
      {
        code: 'Q-A.1',
        title: L('Funktionen', 'Functions'),
        summary: L(
          'Ganzrationale Funktionen und Exponentialfunktionen; nur LK: allgemeine Sinus- und Kosinusfunktionen und die natürliche Logarithmusfunktion.',
          'Polynomial and exponential functions; advanced course only: general sine and cosine functions and the natural logarithm.',
        ),
        simulations: ['e-funktion', 'logarithmus', 'funktionsplotter'],
      },
      {
        code: 'Q-A.2',
        title: L('Eigenschaften von Funktionen', 'Properties of functions'),
        summary: L(
          'Verlauf, Definitions- und Wertebereich, Nullstellen, Symmetrie, Verhalten für große x und Umkehrfunktionen (GK an der Wurzelfunktion).',
          'Shape, domain and range, zeros, symmetry, behaviour for large x and inverse functions (basic course using the square root function).',
        ),
        simulations: ['grenzverhalten', 'umkehrfunktion'],
      },
      {
        code: 'Q-A.3',
        title: L('Fortführung der Differentialrechnung', 'Differential calculus continued'),
        summary: L(
          'Produkt- und Kettenregel, Extremwertprobleme mit Nebenbedingung, Steckbriefaufgaben und Funktionen mit Parametern (im LK als Funktionsscharen).',
          'Product and chain rules, optimisation with constraints, reconstructing functions from conditions and functions with parameters (families of functions in the advanced course).',
        ),
        simulations: ['extremwertprobleme', 'funktionenscharen', 'kurvendiskussion'],
      },
      {
        code: 'Q-A.4',
        title: L('Integralrechnung', 'Integral calculus'),
        summary: L(
          'Produktsumme, orientierte Fläche, Bestands-, Integral- und Stammfunktion, bestimmtes Integral und Hauptsatz; nur LK: uneigentliche Integrale und Rotationsvolumen.',
          'Riemann sums, signed area, accumulation, integral and antiderivative functions, definite integral and the fundamental theorem; advanced course only: improper integrals and volumes of revolution.',
        ),
        simulations: ['ober-untersummen', 'aenderungsrate', 'stammfunktion-grafisch', 'hauptsatz', 'rotationskoerper'],
      },
    ],
  },
  {
    code: 'Q-G',
    title: L('Analytische Geometrie und Lineare Algebra (G)', 'Analytic geometry and linear algebra (G)'),
    summary: L(
      'Skalarprodukt, Ebenen in Parameter- und Koordinatenform, Schnittpunkte und Schnittwinkel, lineare Gleichungssysteme und im Leistungskurs Lagebeziehungen und Abstände.',
      'Dot product, planes in parametric and coordinate form, intersections and angles, systems of linear equations, and in the advanced course relative positions and distances.',
    ),
    parts: [
      {
        code: 'Q-G.1',
        title: L('Vektoroperation', 'Vector operation'),
        summary: L('Skalarprodukt: Orthogonalität, Betrag und Winkel zwischen Vektoren.', 'Dot product: orthogonality, magnitude and angle between vectors.'),
        simulations: ['skalar-vektorprodukt'],
      },
      {
        code: 'Q-G.2',
        title: L('Ebenen', 'Planes'),
        summary: L(
          'Parameterform, Koordinatenform und Normalenvektor (LK: Normalenform), Orientierung im Raum.',
          'Parametric form, coordinate form and normal vector (advanced course: normal form), orientation in space.',
        ),
        simulations: ['geraden-ebenen'],
      },
      {
        code: 'Q-G.3',
        title: L('Schnittwinkel', 'Angles of intersection'),
        summary: L('Winkel zwischen Geraden, zwischen Gerade und Ebene und zwischen Ebenen.', 'Angles between lines, between a line and a plane, and between planes.'),
        simulations: ['lage-abstaende'],
      },
      {
        code: 'Q-G.4',
        title: L('Schnittpunkte', 'Points of intersection'),
        summary: L('Schnittpunkte von Geraden und Ebenen.', 'Intersections of lines and planes.'),
        simulations: ['lage-abstaende', 'geraden-ebenen'],
      },
      {
        code: 'Q-G.5',
        title: L('Lagebeziehungen und Abstände', 'Relative positions and distances'),
        summary: L(
          'Nur LK: Lage und Abstände von Punkten, Geraden und Ebenen in allen Kombinationen, Spiegelungen an Ebenen.',
          'Advanced course only: positions and distances of points, lines and planes in all combinations, reflections in planes.',
        ),
        simulations: ['lage-abstaende'],
      },
      {
        code: 'Q-G.6',
        title: L('Lineare Gleichungssysteme', 'Systems of linear equations'),
        summary: L(
          'Ein algorithmisches Lösungsverfahren für bis zu drei Unbekannte, Lösungsmengen deuten.',
          'An algorithmic method for up to three unknowns, interpreting solution sets.',
        ),
      },
    ],
  },
  {
    code: 'Q-S',
    title: L('Stochastik (S)', 'Stochastics (S)'),
    summary: L(
      'Mehrstufige Zufallsexperimente und bedingte Wahrscheinlichkeiten, Zufallsgrößen mit Erwartungswert und Streuung, Binomialverteilung und im Leistungskurs Prognose- und Konfidenzintervalle sowie die Normalverteilung.',
      'Multi-stage random experiments and conditional probabilities, random variables with expectation and spread, the binomial distribution, and in the advanced course prediction and confidence intervals and the normal distribution.',
    ),
    parts: [
      {
        code: 'Q-S.1',
        title: L('Mehrstufige Zufallsexperimente', 'Multi-stage random experiments'),
        summary: L(
          'Urnenmodelle, Baumdiagramme, Vierfeldertafeln, Gegenereignis, bedingte Wahrscheinlichkeiten, Unabhängigkeit und Pfadregeln.',
          'Urn models, tree diagrams, two-way tables, complementary events, conditional probabilities, independence and path rules.',
        ),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'geburtstagsproblem'],
      },
      {
        code: 'Q-S.2',
        title: L('Kenngrößen', 'Measures'),
        summary: L('Erwartungswert, Varianz und Standardabweichung.', 'Expected value, variance and standard deviation.'),
        simulations: ['binomialverteilung'],
      },
      {
        code: 'Q-S.3',
        title: L('Diskrete Zufallsgrößen', 'Discrete random variables'),
        summary: L('Wahrscheinlichkeitsverteilungen und ihre Kenngrößen.', 'Probability distributions and their measures.'),
      },
      {
        code: 'Q-S.4',
        title: L('Binomialverteilung', 'Binomial distribution'),
        summary: L(
          'Kenngrößen und Histogramme, Einfluss von n und p; nur LK: Binomialkoeffizient und σ-Regeln.',
          'Measures and histograms, the effect of n and p; advanced course only: binomial coefficient and sigma rules.',
        ),
        simulations: ['binomialverteilung', 'galtonbrett'],
      },
      {
        code: 'Q-S.5',
        title: L('Beurteilende Statistik', 'Inferential statistics'),
        summary: L(
          'Nur LK: Prognoseintervall, Konfidenzintervall und nötiger Stichprobenumfang.',
          'Advanced course only: prediction interval, confidence interval and required sample size.',
        ),
      },
      {
        code: 'Q-S.6',
        title: L('Normalverteilung', 'Normal distribution'),
        summary: L(
          'Nur LK: Dichtefunktion (Gauß’sche Glockenkurve), Parameter μ und σ und Verteilungsfunktion als Integralfunktion.',
          'Advanced course only: density function (Gaussian bell curve), parameters μ and σ and the cumulative distribution function as an integral function.',
        ),
        simulations: ['normalverteilung'],
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
 * Mathematik am Gymnasium in Nordrhein-Westfalen (G9) nach den Kernlehrplänen des
 * Ministeriums für Schule und Bildung NRW:
 * - „Kernlehrplan für die Sekundarstufe I – Gymnasium in Nordrhein-Westfalen, Mathematik“,
 *   Heft 3401, 1. Auflage 2019 (RdErl. vom 23.06.2019, in Kraft ab 01.08.2019 für die
 *   Klassen 5 und 6 aufsteigend), Klassen 5–10;
 * - „Kernlehrplan für die Sekundarstufe II – Gymnasium/Gesamtschule in
 *   Nordrhein-Westfalen, Mathematik“ (RdErl. vom 07.08.2026, ABl. NRW. 08/26, in Kraft
 *   ab 01.08.2027 beginnend mit der Einführungsphase), Jahrgangsstufen 11–13.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/nordrhein-westfalen-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Erprobungsstufe = Klassen 5/6; wo der Lehrplan keine genauen Jahrgänge
 * nennt, Doppeljahrgangsstufen: erste Stufe = 7/8, zweite Stufe = 9/10, Qualifikationsphase = 12/13;
 * Einführungsphase = 11. Die Nummern in der Sekundarstufe I
 * und die Nummern der Schwerpunkte in der Oberstufe sind selbst vergeben.
 *
 * Überschriften entsprechen dem Kernlehrplan; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const nordrheinWestfalenGymnasiumMathematik: StateCurriculum = {
  id: 'nordrhein-westfalen-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('nordrhein-westfalen-gymnasium', 'north-rhine-westphalia-gymnasium'),
  state: L('Nordrhein-Westfalen', 'North Rhine-Westphalia'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Kernlehrplan',
  grades: [
    grade(5, ERPROBUNGSSTUFE, ERPROBUNG_UNITS),
    grade(6, ERPROBUNGSSTUFE, ERPROBUNG_UNITS),
    grade(7, ERSTE_STUFE, ERSTE_STUFE_UNITS),
    grade(8, ERSTE_STUFE, ERSTE_STUFE_UNITS),
    grade(9, ZWEITE_STUFE, ZWEITE_STUFE_UNITS),
    grade(10, ZWEITE_STUFE, ZWEITE_STUFE_UNITS),
    grade(11, EF, EF_UNITS),
    grade(12, QPHASE, Q_UNITS),
    grade(13, QPHASE, Q_UNITS),
  ],
};
