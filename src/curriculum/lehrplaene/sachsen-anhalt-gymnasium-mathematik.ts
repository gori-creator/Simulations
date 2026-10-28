import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Landesinstitut für Schulqualität und Lehrerbildung Sachsen-Anhalt (LISA). Der Fachlehrplan
 * nennt auf jeder Seite „Quelle: Landesportal Sachsen-Anhalt (http://www.lisa.sachsen-anhalt.de)“;
 * ein Link zur einzelnen Datei steht im Dokument nicht. Verlinkt ist dieselbe Adresse mit https.
 */
const SOURCE = 'https://www.lisa.sachsen-anhalt.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/sachsen-anhalt-gymnasium-mathematik.md, Teil E).
const sek1Double = (from: number, to: number) =>
  L(
    `Schuljahrgänge ${from}/${to}: Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam; die Lernbereiche stehen deshalb bei ${from} und ${to} gleich, und beide werden als eine Stufe gezeigt. Lernbereiche sind die Inhaltsbereiche mit ihren Kompetenzschwerpunkten; der Lehrplan nummeriert sie nicht, die Nummern sind von uns vergeben.`,
    `Grades ${from}/${to}: the curriculum describes both grades together, so the units are the same for grades ${from} and ${to}, and both are shown as one stage. Units are the content areas with their focal points; the curriculum does not number them, the numbers are our own.`,
  );

const SJ_5_6 = sek1Double(5, 6);
const SJ_7_8 = sek1Double(7, 8);

const SJ_9 = L(
  'Schuljahrgang 9. Lernbereiche sind die Inhaltsbereiche mit ihren Kompetenzschwerpunkten; der Lehrplan nummeriert sie nicht, die Nummern sind von uns vergeben.',
  'Grade 9. Units are the content areas with their focal points; the curriculum does not number them, the numbers are our own.',
);

const SJ_10 = L(
  'Schuljahrgang 10 ist in Sachsen-Anhalt die Einführungsphase der gymnasialen Oberstufe (Abitur nach Klasse 12). Die Inhaltsbereiche heißen ab hier Analysis, Analytische Geometrie und Stochastik; die Nummern sind von uns vergeben.',
  'In Saxony-Anhalt, grade 10 is the introductory phase of upper secondary (Abitur after grade 12). From here on the content areas are calculus, analytic geometry and probability and statistics; the numbers are our own.',
);

const QPHASE = L(
  'Qualifikationsphase (Schuljahrgänge 11/12): Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam, getrennt nach grundlegendem (gA) und erhöhtem Anforderungsniveau (eA). Die Lernbereiche stehen deshalb bei 11 und 12 gleich, und beide werden als eine Stufe gezeigt. Die Nummern sind von uns vergeben.',
  'Qualification phase (grades 11/12): the curriculum describes both grades together, split into the basic (gA) and the higher level (eA). The units are therefore the same for grades 11 and 12, and both are shown as one stage. The numbers are our own.',
);

/** Schuljahrgänge 5/6 (Kap. 3.2). */
const SJ_5_6_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahlen und Größen', 'Numbers and quantities'),
    summary: L(
      'Natürliche Zahlen und Teilbarkeit, erste Gleichungen, Brüche und Dezimalbrüche, Größen mit ihren Einheiten sowie das Rechnen mit gebrochenen Zahlen.',
      'Natural numbers and divisibility, first equations, fractions and decimals, quantities with their units, and calculating with non-negative rational numbers.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Natürliche Zahlen', 'Natural numbers'),
        summary: L(
          'Große Zahlen lesen, ordnen und runden, im Kopf und schriftlich rechnen, Potenzen bilden, Teiler und Primfaktoren bestimmen; erste negative Zahlen an der Zahlengeraden.',
          'Reading, ordering and rounding large numbers, mental and written arithmetic, powers, divisors and prime factors; first negative numbers on the number line.',
        ),
        simulations: ['stellenwerte', 'zehnerpotenzen', 'primfaktoren', 'termbaum', 'zahlengerade'],
      },
      {
        code: '1.2',
        title: L('Gleichungen und Ungleichungen', 'Equations and inequalities'),
        summary: L(
          'Begriffe Variable, Gleichung und Lösung; einfache Gleichungen und Ungleichungen durch Überlegen oder mit Umkehroperationen lösen und die Probe machen.',
          'The terms variable, equation and solution; solving simple equations and inequalities by reasoning or with inverse operations, and checking the result.',
        ),
      },
      {
        code: '1.3',
        title: L('Brüche', 'Fractions'),
        summary: L(
          'Brüche als Teile eines Ganzen darstellen, erweitern und kürzen, gleichnamige Brüche vergleichen und addieren, Dezimalbrüche in der Stellenwerttafel.',
          'Showing fractions as parts of a whole, expanding and simplifying them, comparing and adding like fractions, decimals in the place-value chart.',
        ),
        simulations: ['bruchteile', 'brueche-vergleichen'],
      },
      {
        code: '1.4',
        title: L('Größen', 'Quantities'),
        summary: L(
          'Längen, Flächen, Volumen, Massen, Zeit und Geld messen, schätzen und in andere Einheiten umrechnen; Maßstab.',
          'Measuring and estimating length, area, volume, mass, time and money and converting between units; scale.',
        ),
        simulations: ['einheiten', 'massstab'],
      },
      {
        code: '1.5',
        title: L('Gebrochene Zahlen', 'Non-negative rational numbers'),
        summary: L(
          'Mit gemeinen Brüchen und Dezimalbrüchen in allen Grundrechenarten rechnen, beide Schreibweisen umwandeln und periodische Dezimalbrüche kennenlernen; Zahlenbereiche vergleichen.',
          'All four operations with fractions and decimals, converting between both notations and meeting recurring decimals; comparing number sets.',
        ),
        simulations: ['brueche-rechnen', 'dezimalbrueche', 'zahlengerade'],
      },
    ],
  },
  {
    code: '2',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Grundbegriffe der Geometrie und Abbildungen, Winkel an Geraden, Umfang, Flächeninhalt und Volumen sowie Dreiecke und Vierecke.',
      'Basic geometric concepts and transformations, angles at lines, perimeter, area and volume, and triangles and quadrilaterals.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Geometrische Grundbegriffe und Abbildungen', 'Basic geometric concepts and transformations'),
        summary: L(
          'Punkte, Geraden und Strecken, parallel und senkrecht, Koordinatensystem, Winkel messen und zeichnen; Achsensymmetrie, Spiegelung, Verschiebung und Drehung.',
          'Points, lines and segments, parallel and perpendicular, coordinate system, measuring and drawing angles; line symmetry, reflection, translation and rotation.',
        ),
        simulations: ['koordinaten-lage', 'winkel-messen', 'spiegelung'],
      },
      {
        code: '2.2',
        title: L('Winkelbeziehungen', 'Angle relationships'),
        summary: L(
          'Neben-, Scheitel-, Stufen- und Wechselwinkel erkennen und damit Winkel berechnen und Aussagen begründen.',
          'Recognising adjacent, vertical, corresponding and alternate angles and using them to calculate angles and justify statements.',
        ),
        simulations: ['winkel-geradenkreuzung'],
      },
      {
        code: '2.3',
        title: L('Umfang, Flächeninhalt und Volumen', 'Perimeter, area and volume'),
        summary: L(
          'Umfang und Flächeninhalt von Rechtecken, Netze und Schrägbilder von Quadern, Oberflächeninhalt und Volumen von Quader und Würfel.',
          'Perimeter and area of rectangles, nets and oblique drawings of cuboids, surface area and volume of cuboids and cubes.',
        ),
        simulations: ['umfang-flaeche', 'koerpernetze', 'quader-volumen'],
      },
      {
        code: '2.4',
        title: L('Dreiecke', 'Triangles'),
        summary: L(
          'Dreiecksarten, Innenwinkelsatz, Kongruenzsätze und Dreieckskonstruktionen; Höhen, Winkelhalbierende und Mittelsenkrechte mit Inkreis und Umkreis; Umfang und Flächeninhalt.',
          'Types of triangle, the angle sum, congruence criteria and constructions; altitudes, angle bisectors and perpendicular bisectors with incircle and circumcircle; perimeter and area.',
        ),
        simulations: ['winkelsumme', 'dreieckskonstruktion', 'besondere-linien', 'mittelsenkrechte', 'flaechen-zerlegen'],
      },
      {
        code: '2.5',
        title: L('Vierecke', 'Quadrilaterals'),
        summary: L(
          'Vierecksarten und ihre Beziehungen, Eigenschaften von Seiten, Diagonalen und Winkeln, Vierecke konstruieren, Umfang und Flächeninhalt besonderer Vierecke.',
          'Types of quadrilateral and how they relate, properties of sides, diagonals and angles, constructing quadrilaterals, perimeter and area of special quadrilaterals.',
        ),
        simulations: ['vierecke', 'flaechen-zerlegen'],
      },
    ],
  },
  {
    code: '3',
    title: L('Zuordnungen und Funktionen', 'Relationships and functions'),
    summary: L(
      'Zuordnungen in Alltag und Mathematik beschreiben und direkt oder indirekt proportionale Zusammenhänge erkennen.',
      'Describing relationships in everyday life and mathematics and recognising direct and inverse proportion.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Zuordnungen, direkte und indirekte Proportionalität', 'Relationships, direct and inverse proportion'),
        summary: L(
          'Zuordnungen in Tabelle, Diagramm und Pfeilbild darstellen, auf Proportionalität prüfen und mit dem Dreisatz rechnen.',
          'Showing relationships in tables, graphs and arrow diagrams, testing them for proportionality and using the rule of three.',
        ),
        simulations: ['proportional'],
      },
    ],
  },
  {
    code: '4',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Daten erheben, übersichtlich darstellen und mit Kenngrößen wie dem Mittelwert auswerten.',
      'Collecting data, presenting it clearly and analysing it with measures such as the mean.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Erfassen, Darstellen und Auswerten von Daten', 'Collecting, displaying and analysing data'),
        summary: L(
          'Erhebungen planen, Daten in Strichlisten und Häufigkeitstabellen erfassen und als Säulen- oder Balkendiagramm darstellen und lesen.',
          'Planning surveys, recording data in tally charts and frequency tables, and drawing and reading bar charts.',
        ),
        simulations: ['diagramme'],
      },
      {
        code: '4.2',
        title: L('Kenngrößen von Daten', 'Statistical measures'),
        summary: L(
          'Arithmetisches Mittel berechnen und deuten, dazu Modalwert, Median und Spannweite.',
          'Calculating and interpreting the mean, together with mode, median and range.',
        ),
        simulations: ['boxplot'],
      },
    ],
  },
];

/** Schuljahrgänge 7/8 (Kap. 3.3). */
const SJ_7_8_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahlen und Größen', 'Numbers and quantities'),
    summary: L(
      'Prozent- und Zinsrechnung, rationale Zahlen und Quadratwurzeln, Gleichungen mit Äquivalenzumformungen und das Umformen von Termen.',
      'Percentages and interest, rational numbers and square roots, equations solved by equivalent transformations, and rearranging terms.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Prozentrechnung', 'Percentages'),
        summary: L(
          'Grundwert, Prozentwert und Prozentsatz bestimmen, auch bei Rabatt, Zinsen und Zinseszins; Prozente im Kreisdiagramm.',
          'Finding base value, percentage value and rate, including discounts, interest and compound interest; percentages in pie charts.',
        ),
        simulations: ['prozentstreifen'],
      },
      {
        code: '1.2',
        title: L('Rationale Zahlen und Wurzeln', 'Rational numbers and roots'),
        summary: L(
          'Mit positiven und negativen Zahlen rechnen, Zahlenbereiche unterscheiden, Wurzeln ziehen und erkennen, dass √2 nicht rational ist.',
          'Calculating with positive and negative numbers, distinguishing number sets, taking roots and seeing that √2 is not rational.',
        ),
        simulations: ['zahlengerade', 'quadratwurzel'],
      },
      {
        code: '1.3',
        title: L('Gleichungen und Ungleichungen', 'Equations and inequalities'),
        summary: L(
          'Lineare Gleichungen, Verhältnisgleichungen und Ungleichungen mit Äquivalenzumformungen lösen, Formeln umstellen und Sachaufgaben damit lösen.',
          'Solving linear equations, proportions and inequalities by equivalent transformations, rearranging formulas and applying them to word problems.',
        ),
        simulations: ['waagemodell'],
      },
      {
        code: '1.4',
        title: L('Arbeiten mit Variablen', 'Working with variables'),
        summary: L(
          'Termstrukturen erkennen, ausmultiplizieren, ausklammern und mit den binomischen Formeln umformen; einfache Beweise mit Variablen.',
          'Recognising term structure, expanding, factoring and using the binomial formulas; simple proofs with variables.',
        ),
        simulations: ['termbaum', 'binomische-formeln'],
      },
    ],
  },
  {
    code: '2',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Kreise und Winkelsätze am Kreis, Darstellung und Berechnung von Körpern, Ähnlichkeit und die Satzgruppe des Pythagoras.',
      'Circles and circle angle theorems, drawing and calculating solids, similarity and the Pythagorean group of theorems.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Kreise', 'Circles'),
        summary: L(
          'Kreis und Gerade, Tangenten, Peripherie- und Zentriwinkelsatz, Satz des Thales; Umfang und Flächeninhalt mit der Kreiszahl π.',
          'Circles and lines, tangents, inscribed and central angle theorems, Thales’ theorem; circumference and area with π.',
        ),
        simulations: ['thales', 'kreiszahl-pi'],
      },
      {
        code: '2.2',
        title: L('Körperdarstellung', 'Representing solids'),
        summary: L(
          'Prismen, Pyramiden, Zylinder und Kegel erkennen, als Netz, Schrägbild und Zweitafelbild darstellen.',
          'Recognising prisms, pyramids, cylinders and cones and drawing them as nets, oblique drawings and two-view projections.',
        ),
        simulations: ['koerpernetze'],
      },
      {
        code: '2.3',
        title: L('Körperberechnung', 'Calculating solids'),
        summary: L(
          'Oberflächeninhalt und Volumen von Prisma, Zylinder, Pyramide, Kegel und Kugel berechnen, auch bei zusammengesetzten Körpern.',
          'Calculating surface area and volume of prisms, cylinders, pyramids, cones and spheres, including composite solids.',
        ),
        simulations: ['prisma-zylinder', 'pyramide-kegel-kugel'],
      },
      {
        code: '2.4',
        title: L('Ähnlichkeit', 'Similarity'),
        summary: L(
          'Streckenverhältnisse und Maßstab, zentrische Streckung, ähnliche Figuren erkennen und Längen über Ähnlichkeit berechnen.',
          'Ratios of lengths and scale, enlargement from a centre, recognising similar figures and calculating lengths using similarity.',
        ),
        simulations: ['strahlensaetze', 'vergroessern'],
      },
      {
        code: '2.5',
        title: L('Satzgruppe des Pythagoras', 'Pythagorean group of theorems'),
        summary: L(
          'Satz des Pythagoras, Höhensatz und Kathetensatz aufstellen und damit Seiten in rechtwinkligen Dreiecken berechnen.',
          'Setting up Pythagoras’ theorem, the altitude theorem and Euclid’s leg theorem and using them to find sides of right triangles.',
        ),
        simulations: ['pythagoras'],
      },
    ],
  },
  {
    code: '3',
    title: L('Zuordnungen und Funktionen', 'Relationships and functions'),
    summary: L(
      'Der Funktionsbegriff am Beispiel linearer Funktionen mit ihren Darstellungen und Eigenschaften.',
      'The concept of a function, using linear functions with their representations and properties.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Lineare Funktionen', 'Linear functions'),
        summary: L(
          'Funktionsbegriff und Darstellungsformen, Steigung und y-Achsenabschnitt, Nullstellen und Schnittpunkte zweier Geraden rechnerisch und grafisch.',
          'The concept of a function and its representations, slope and y-intercept, zeros and the intersection of two lines, by calculation and graphically.',
        ),
        simulations: ['funktion-zuordnung', 'lineare-funktion', 'lgs-grafisch', 'gleichungen-grafisch', 'funktionsplotter'],
      },
    ],
  },
  {
    code: '4',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Zufallsversuche, Häufigkeiten und Wahrscheinlichkeiten, auch bei mehrstufigen Versuchen mit Baumdiagramm.',
      'Random experiments, frequencies and probabilities, including multi-stage experiments with tree diagrams.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Zufällige Ereignisse, Häufigkeiten, Wahrscheinlichkeiten', 'Random events, frequencies, probabilities'),
        summary: L(
          'Zufallsversuche durchführen und simulieren, relative Häufigkeiten als Schätzwerte nutzen, Ereignisse mit Mengendiagramm und Vierfeldertafel darstellen, Laplace-Wahrscheinlichkeiten berechnen.',
          'Carrying out and simulating random experiments, using relative frequencies as estimates, showing events in Venn diagrams and two-way tables, calculating Laplace probabilities.',
        ),
        simulations: ['gesetz-grosse-zahlen', 'monte-carlo-pi', 'vierfeldertafel'],
      },
      {
        code: '4.2',
        title: L('Mehrstufige Zufallsversuche und Wahrscheinlichkeiten', 'Multi-stage random experiments and probabilities'),
        summary: L(
          'Mehrstufige Versuche im Baumdiagramm darstellen, Pfadregeln anwenden, Urnenmodelle mit und ohne Zurücklegen nutzen.',
          'Showing multi-stage experiments in tree diagrams, applying the path rules, using urn models with and without replacement.',
        ),
        simulations: ['baumdiagramm', 'zaehlprinzip', 'geburtstagsproblem'],
      },
    ],
  },
];

/** Schuljahrgang 9 (Kap. 3.4). */
const SJ_9_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahlen und Größen', 'Numbers and quantities'),
    summary: L(
      'Potenzen mit rationalen Exponenten, Wurzeln und Logarithmen.',
      'Powers with rational exponents, roots and logarithms.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Potenzen und Logarithmen', 'Powers and logarithms'),
        summary: L(
          'Potenz-, Wurzel- und Logarithmengesetze anwenden, die drei Schreibweisen ineinander übersetzen und Zahlen mit abgetrennten Zehnerpotenzen schreiben.',
          'Applying the laws of powers, roots and logarithms, translating between the three notations and writing numbers in scientific notation.',
        ),
        simulations: ['quadratwurzel', 'logarithmus'],
      },
    ],
  },
  {
    code: '2',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Berechnungen an Dreiecken mit Sinus, Kosinus und Tangens.',
      'Calculations in triangles with sine, cosine and tangent.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Trigonometrie', 'Trigonometry'),
        summary: L(
          'Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Sinussatz, Kosinussatz und Flächeninhaltssatz für beliebige Dreiecke.',
          'Sine, cosine and tangent in right triangles, the sine rule, cosine rule and area formula for any triangle.',
        ),
        simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'einheitskreis'],
      },
    ],
  },
  {
    code: '3',
    title: L('Zuordnungen und Funktionen', 'Relationships and functions'),
    summary: L(
      'Quadratische Gleichungen und Funktionen und ihre Anwendung.',
      'Quadratic equations and functions and their applications.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Quadratische Gleichungen und quadratische Funktionen', 'Quadratic equations and quadratic functions'),
        summary: L(
          'Quadratische Gleichungen lösen und ihre Lösbarkeit untersuchen, Parabeln zeichnen, Scheitelpunkt und Nullstellen bestimmen und den Einfluss der Parameter beschreiben.',
          'Solving quadratic equations and examining how many solutions they have, drawing parabolas, finding vertex and zeros and describing the effect of the parameters.',
        ),
        simulations: ['quadratische-funktion', 'parabel-drei-punkte', 'extremwert-parabel', 'gleichungen-grafisch'],
      },
    ],
  },
  {
    code: '4',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Häufigkeitsverteilungen darstellen und mit Lage- und Streumaßen beschreiben.',
      'Displaying frequency distributions and describing them with measures of centre and spread.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Häufigkeitsverteilungen', 'Frequency distributions'),
        summary: L(
          'Daten in Klassen einteilen und als Histogramm oder Boxplot darstellen, Lage- und Streumaße bestimmen und Verteilungen auch durch Simulation erzeugen.',
          'Grouping data into classes and showing them as histograms or box plots, finding measures of centre and spread and also creating distributions by simulation.',
        ),
        simulations: ['boxplot', 'gesetz-grosse-zahlen', 'galtonbrett'],
      },
    ],
  },
];

/** Schuljahrgang 10, Einführungsphase (Kap. 3.5). */
const SJ_10_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Analysis', 'Calculus'),
    summary: L(
      'Wichtige Funktionsklassen mit Graphen, Eigenschaften und Parametern als Grundlage der Analysis.',
      'Important families of functions with their graphs, properties and parameters as a basis for calculus.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Funktionsklassen', 'Families of functions'),
        summary: L(
          'Potenz-, Exponential-, Sinus- und Kosinusfunktionen, in einfachen Fällen auch Wurzel- und Logarithmusfunktionen: Graphen, Eigenschaften, Einfluss der Parameter, Umkehrfunktionen, Wachstum und periodische Vorgänge.',
          'Power, exponential, sine and cosine functions, and in simple cases root and logarithmic functions: graphs, properties, effect of parameters, inverse functions, growth and periodic processes.',
        ),
        simulations: [
          'potenzfunktionen',
          'hyperbel',
          'ganzrationale-funktionen',
          'exponentielles-wachstum',
          'logarithmus',
          'einheitskreis',
          'sinusfunktion',
          'transformationen',
          'umkehrfunktion',
          'grenzverhalten',
          'funktionsplotter',
        ],
      },
    ],
  },
  {
    code: '2',
    title: L('Analytische Geometrie', 'Analytic geometry'),
    summary: L(
      'Vektoren im räumlichen Koordinatensystem und das Rechnen mit ihnen.',
      'Vectors in the 3D coordinate system and calculating with them.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Vektoren', 'Vectors'),
        summary: L(
          'Räumliches Koordinatensystem, Vektoren addieren und vervielfachen, lineare Abhängigkeit, Gleichungssysteme mit drei Variablen, Skalarprodukt, Winkel und Vektorprodukt.',
          'The 3D coordinate system, adding and scaling vectors, linear dependence, systems of equations in three variables, dot product, angles and cross product.',
        ),
        simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt'],
      },
    ],
  },
  {
    code: '3',
    title: L('Stochastik', 'Probability and statistics'),
    summary: L(
      'Zufallsgrößen mit Verteilung, Erwartungswert und Standardabweichung.',
      'Random variables with their distribution, expected value and standard deviation.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Zufallsgrößen', 'Random variables'),
        summary: L(
          'Ereignisse mit Zufallsgrößen beschreiben, Wahrscheinlichkeitsverteilungen aufstellen, Erwartungswert und Standardabweichung berechnen und deuten.',
          'Describing events with random variables, setting up probability distributions, calculating and interpreting expected value and standard deviation.',
        ),
      },
    ],
  },
];

/** Schuljahrgänge 11/12, Qualifikationsphase (Kap. 3.6.1 und 3.6.2). */
const QPHASE_UNITS: CurriculumUnit[] = [
  {
    code: 'gA-1',
    title: L('Analysis (grundlegendes Anforderungsniveau)', 'Calculus (basic level)'),
    summary: L(
      'Grenzwerte und Ableitung, Untersuchung von Funktionen und Integralrechnung im grundlegenden Anforderungsniveau.',
      'Limits and derivatives, analysing functions and integral calculus at the basic level.',
    ),
    parts: [
      {
        code: 'gA-1.1',
        title: L('Grundlagen der Infinitesimalrechnung', 'Foundations of calculus'),
        summary: L(
          'Verhalten von Funktionen im Unendlichen und an einer Stelle, Grenzwerte, mittlere und lokale Änderungsrate, Ableitung als Tangentensteigung.',
          'Behaviour of functions at infinity and near a point, limits, average and instantaneous rate of change, the derivative as the slope of the tangent.',
        ),
        simulations: ['grenzverhalten', 'polstellen-asymptoten', 'sekante-tangente', 'ableitungsfunktion'],
      },
      {
        code: 'gA-1.2',
        title: L('Differentialrechnung', 'Differential calculus'),
        summary: L(
          'Ableitungsregeln für ganzrationale Funktionen, die e-Funktion sowie Sinus und Kosinus; Monotonie, Krümmung, Extrem- und Wendepunkte, Tangenten und Extremwertaufgaben.',
          'Differentiation rules for polynomials, the natural exponential function and sine and cosine; monotonicity, curvature, extreme and inflection points, tangents and optimisation problems.',
        ),
        simulations: ['ganzrationale-funktionen', 'ableitungsfunktion', 'kurvendiskussion', 'extremwertprobleme', 'e-funktion', 'stammfunktion-grafisch'],
      },
      {
        code: 'gA-1.3',
        title: L('Integralrechnung', 'Integral calculus'),
        summary: L(
          'Stammfunktionen, das bestimmte Integral als rekonstruierter Bestand und als Flächeninhalt, Hauptsatz der Differential- und Integralrechnung.',
          'Antiderivatives, the definite integral as a reconstructed total and as an area, the fundamental theorem of calculus.',
        ),
        simulations: ['ober-untersummen', 'hauptsatz', 'aenderungsrate', 'stammfunktion-grafisch'],
      },
    ],
  },
  {
    code: 'gA-2',
    title: L('Analytische Geometrie (grundlegendes Anforderungsniveau)', 'Analytic geometry (basic level)'),
    summary: L(
      'Geraden, Ebenen und Kreise mit Gleichungen beschreiben und ihre Lage untersuchen.',
      'Describing lines, planes and circles by equations and examining how they lie.',
    ),
    parts: [
      {
        code: 'gA-2.1',
        title: L('Geraden und Ebenen', 'Lines and planes'),
        summary: L(
          'Geraden und Ebenen durch Gleichungen beschreiben, Lage von Gerade und Gerade oder Gerade und Ebene untersuchen, Schnittpunkte, Winkel und Abstände berechnen.',
          'Describing lines and planes by equations, examining how two lines or a line and a plane lie, calculating intersections, angles and distances.',
        ),
        simulations: ['geraden-ebenen', 'lage-abstaende'],
      },
      {
        code: 'gA-2.2',
        title: L('Kreise', 'Circles'),
        summary: L(
          'Kreise in der Ebene durch Gleichungen beschreiben und die Lage von Punkt oder Gerade zum Kreis untersuchen.',
          'Describing circles in the plane by equations and examining how a point or a line lies relative to the circle.',
        ),
      },
    ],
  },
  {
    code: 'gA-3',
    title: L('Stochastik (grundlegendes Anforderungsniveau)', 'Probability and statistics (basic level)'),
    summary: L(
      'Bedingte Wahrscheinlichkeit und Binomialverteilung.',
      'Conditional probability and the binomial distribution.',
    ),
    parts: [
      {
        code: 'gA-3.1',
        title: L('Bedingte Wahrscheinlichkeit', 'Conditional probability'),
        summary: L(
          'Zweistufige Versuche mit der Vierfeldertafel beschreiben, bedingte Wahrscheinlichkeiten berechnen und deuten, Ereignisse auf Unabhängigkeit prüfen.',
          'Describing two-stage experiments with two-way tables, calculating and interpreting conditional probabilities, testing events for independence.',
        ),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
      },
      {
        code: 'gA-3.2',
        title: L('Binomialverteilung', 'Binomial distribution'),
        summary: L(
          'Bernoulli-Ketten, binomialverteilte Zufallsgrößen mit ihren Kenngrößen, typische Gestalt der Verteilung und Vertrauensintervalle.',
          'Bernoulli chains, binomially distributed random variables and their parameters, the typical shape of the distribution and confidence intervals.',
        ),
        simulations: ['galtonbrett', 'binomialverteilung'],
      },
    ],
  },
  {
    code: 'eA-1',
    title: L('Analysis (erhöhtes Anforderungsniveau)', 'Calculus (higher level)'),
    summary: L(
      'Grenzwerte und Ableitung, Untersuchung von Funktionen und Integralrechnung im erhöhten Anforderungsniveau, mit Funktionsscharen und Rotationskörpern.',
      'Limits and derivatives, analysing functions and integral calculus at the higher level, with families of functions and solids of revolution.',
    ),
    parts: [
      {
        code: 'eA-1.1',
        title: L('Grundlagen der Infinitesimalrechnung', 'Foundations of calculus'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich Grenzwertsätze und lineare Näherung einer Funktion an einer Stelle.',
          'As at the basic level, plus limit laws and the linear approximation of a function at a point.',
        ),
        simulations: ['grenzverhalten', 'polstellen-asymptoten', 'sekante-tangente', 'ableitungsfunktion'],
      },
      {
        code: 'eA-1.2',
        title: L('Differentialrechnung', 'Differential calculus'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich Logarithmusfunktionen, Kettenregel, Newtonverfahren sowie Funktionsscharen und Ortskurven.',
          'As at the basic level, plus logarithmic functions, the chain rule, Newton’s method and families of functions with their loci.',
        ),
        simulations: [
          'ganzrationale-funktionen',
          'ableitungsfunktion',
          'kurvendiskussion',
          'extremwertprobleme',
          'logarithmus',
          'e-funktion',
          'newton-verfahren',
          'funktionenscharen',
          'stammfunktion-grafisch',
        ],
      },
      {
        code: 'eA-1.3',
        title: L('Integralrechnung', 'Integral calculus'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich lineare Substitution, ln als Stammfunktion von 1/x und das Volumen von Rotationskörpern.',
          'As at the basic level, plus linear substitution, ln as an antiderivative of 1/x and the volume of solids of revolution.',
        ),
        simulations: ['ober-untersummen', 'hauptsatz', 'aenderungsrate', 'stammfunktion-grafisch', 'rotationskoerper'],
      },
    ],
  },
  {
    code: 'eA-2',
    title: L('Analytische Geometrie (erhöhtes Anforderungsniveau)', 'Analytic geometry (higher level)'),
    summary: L(
      'Geraden, Ebenen und Kreise im erhöhten Anforderungsniveau, auch Ebene-Ebene und Tangenten an Kreise.',
      'Lines, planes and circles at the higher level, including two planes and tangents to circles.',
    ),
    parts: [
      {
        code: 'eA-2.1',
        title: L('Geraden und Ebenen', 'Lines and planes'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich die Lage zweier Ebenen mit Schnittgerade sowie Abstände zwischen Punkt und Gerade und zwischen zwei Geraden im Raum.',
          'As at the basic level, plus the position of two planes with their line of intersection and distances between a point and a line and between two lines in space.',
        ),
        simulations: ['geraden-ebenen', 'lage-abstaende'],
      },
      {
        code: 'eA-2.2',
        title: L('Kreise', 'Circles'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich die Lage zweier Kreise und Tangenten an einen Kreis, auch von einem Punkt außerhalb.',
          'As at the basic level, plus the position of two circles and tangents to a circle, including from an outside point.',
        ),
      },
    ],
  },
  {
    code: 'eA-3',
    title: L('Stochastik (erhöhtes Anforderungsniveau)', 'Probability and statistics (higher level)'),
    summary: L(
      'Bedingte Wahrscheinlichkeit, Binomial- und Normalverteilung und beurteilende Statistik.',
      'Conditional probability, binomial and normal distributions and inferential statistics.',
    ),
    parts: [
      {
        code: 'eA-3.1',
        title: L('Bedingte Wahrscheinlichkeit', 'Conditional probability'),
        summary: L(
          'Vierfeldertafel, bedingte Wahrscheinlichkeiten und stochastische Unabhängigkeit wie im grundlegenden Niveau.',
          'Two-way tables, conditional probabilities and independence, as at the basic level.',
        ),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
      },
      {
        code: 'eA-3.2',
        title: L('Binomial- und Normalverteilung', 'Binomial and normal distribution'),
        summary: L(
          'Binomialverteilte Zufallsgrößen mit Kenngrößen und σ-Umgebungen; diskrete und stetige Zufallsgrößen, Normalverteilung mit der Gaußschen Dichtefunktion.',
          'Binomially distributed random variables with their parameters and σ-intervals; discrete and continuous random variables, the normal distribution with the Gaussian density.',
        ),
        simulations: ['galtonbrett', 'binomialverteilung', 'normalverteilung'],
      },
      {
        code: 'eA-3.3',
        title: L('Beurteilende Statistik', 'Inferential statistics'),
        summary: L(
          'Mit Simulationen Stichproben erkunden, von der Grundgesamtheit auf Stichproben schließen, unbekannte Wahrscheinlichkeiten schätzen und Prognose- und Vertrauensintervalle angeben.',
          'Exploring samples with simulations, inferring from the population to samples, estimating unknown probabilities and giving prediction and confidence intervals.',
        ),
        simulations: ['binomialverteilung'],
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
 * Mathematik am Gymnasium in Sachsen-Anhalt (G8, Abitur nach Klasse 12) nach dem
 * „Fachlehrplan Gymnasium Mathematik“ des Ministeriums für Bildung des Landes Sachsen-Anhalt,
 * Stand 01.08.2022 („In Kraft seit 2015, Anpassung 2022“), Schuljahrgänge 5–12 in einem Dokument.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/sachsen-anhalt-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Der Lehrplan beschreibt die Schuljahrgänge 5/6, 7/8 und die
 * Qualifikationsphase 11/12 jeweils gemeinsam; sie stehen als Doppeljahrgangsstufen.
 * Schuljahrgang 10 ist die Einführungsphase. Inhaltsbereiche und Kompetenzschwerpunkte sind
 * im Lehrplan nicht nummeriert; die Nummern sind selbst vergeben (gA/eA = grundlegendes bzw.
 * erhöhtes Anforderungsniveau).
 *
 * Überschriften entsprechen dem Fachlehrplan; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const sachsenAnhaltGymnasiumMathematik: StateCurriculum = {
  id: 'sachsen-anhalt-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('sachsen-anhalt-gymnasium', 'saxony-anhalt-gymnasium'),
  state: L('Sachsen-Anhalt', 'Saxony-Anhalt'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Fachlehrplan',
  grades: [
    grade(5, SJ_5_6, SJ_5_6_UNITS),
    grade(6, SJ_5_6, SJ_5_6_UNITS),
    grade(7, SJ_7_8, SJ_7_8_UNITS),
    grade(8, SJ_7_8, SJ_7_8_UNITS),
    grade(9, SJ_9, SJ_9_UNITS),
    grade(10, SJ_10, SJ_10_UNITS),
    grade(11, QPHASE, QPHASE_UNITS),
    grade(12, QPHASE, QPHASE_UNITS),
  ],
};
