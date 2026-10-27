import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Niedersächsischer Bildungsserver (NIBIS), Bereich Curriculare Vorgaben. Die
 * Kerncurricula nennen „http://www.cuvo.nibis.de“; der Test verlangt https. Ein Link
 * zur einzelnen PDF-Datei steht in den Dokumenten nicht.
 */
const SOURCE = 'https://cuvo.nibis.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/niedersachsen-gymnasium-mathematik.md, Teil E).
const DOPPELJAHRGANG = (a: number, b: number) =>
  L(
    `Doppelschuljahrgang ${a}/${b}: Das Kerncurriculum beschreibt Lernbereiche für die Schuljahrgänge ${a} und ${b} gemeinsam; sie stehen deshalb bei beiden Jahrgängen gleich. Reihenfolge und Zuschnitt legt die Schule fest. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Unterbereiche sind die Punkte des „Kerns“ (und gegebenenfalls die fakultativen Erweiterungen); die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.`,
    `Double grade ${a}/${b}: the core curriculum describes learning areas for grades ${a} and ${b} together, so they are the same for both grades. Each school decides order and scope. Each simulation is listed under the grades it is designed for. The sub-areas are the items of the “core” (and, where present, the optional extensions); the numbers are our own and run through all double grades.`,
  );

const EF = L(
  'Einführungsphase der gymnasialen Oberstufe (G9: Schuljahrgang 11). Reihung und Zuschnitt der drei Lernbereiche sind laut Kerncurriculum ein Vorschlag; Unterbereiche sind die Punkte des „Kerns“. Die Codes sind von uns vergeben.',
  'Introductory phase of upper secondary (G9: grade 11). According to the core curriculum, the order and scope of the three learning areas are a suggestion; the sub-areas are the items of the “core”. The codes are our own.',
);

const QPHASE = L(
  'Qualifikationsphase (G9: Schuljahrgänge 12 und 13). Das Kerncurriculum hat eigene Lernbereiche für das grundlegende (gA) und das erhöhte Anforderungsniveau (eA) und verteilt sie nicht auf die Jahre; sie stehen deshalb als Doppeljahrgang bei 12 und 13 gleich. Die Codes sind von uns vergeben.',
  'Qualification phase (G9: grades 12 and 13). The core curriculum has separate learning areas for the basic (gA) and the higher requirement level (eA) and does not distribute them over the years, so they are the same for the double grade 12 and 13. The codes are our own.',
);

/** Doppelschuljahrgang 5/6 (Kap. 3.3.1). */
const DJ_5_6: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Umgang mit natürlichen Zahlen', 'Working with natural numbers'),
    summary: L(
      'Sicher mündlich und schriftlich rechnen, Rechenregeln nutzen, Zahlen an Zahlengerade und Stellenwerttafel darstellen, Teiler, Vielfache und Primzahlen, runden und schätzen.',
      'Calculating confidently mentally and in writing, using rules of arithmetic, representing numbers on the number line and in the place-value chart, divisors, multiples and primes, rounding and estimating.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Mit natürlichen Zahlen rechnen', 'Calculating with natural numbers'),
        summary: L(
          'Grundrechenarten und ihre Umkehrungen, Rechenregeln zum vorteilhaften Rechnen.',
          'The four operations and their inverses, rules of arithmetic for clever calculation.',
        ),
        simulations: ['termbaum'],
      },
      {
        code: '1.2',
        title: L('Natürliche Zahlen darstellen und ordnen', 'Representing and ordering natural numbers'),
        summary: L(
          'Zahlengerade, Stellenwertsystem und Bilder; Vielfache, Teiler und Primzahlen.',
          'Number line, place-value system and pictures; multiples, divisors and primes.',
        ),
        simulations: ['stellenwerte', 'zehnerpotenzen', 'primfaktoren'],
      },
      {
        code: '1.3',
        title: L('Runden und schätzen', 'Rounding and estimating'),
        summary: L('Runden, Überschlag und Plausibilität.', 'Rounding, estimation and plausibility checks.'),
        simulations: ['stellenwerte'],
      },
    ],
  },
  {
    code: '2',
    title: L('Körper und Figuren', 'Solids and figures'),
    summary: L(
      'Körper und Figuren beschreiben und herstellen, parallele und senkrechte Geraden, Schrägbilder und Netze, Längen, Flächen- und Rauminhalte sowie Winkel und Winkelsummen.',
      'Describing and making solids and figures, parallel and perpendicular lines, oblique drawings and nets, lengths, areas and volumes, and angles and angle sums.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Formen in Raum und Ebene erkunden', 'Exploring shapes in space and the plane'),
        summary: L('Grundformen von Körpern und Figuren beschreiben und in der Umwelt finden.', 'Describing basic solids and figures and finding them in the environment.'),
        simulations: ['vierecke', 'koerpernetze'],
      },
      {
        code: '2.2',
        title: L('Parallele und senkrechte Geraden', 'Parallel and perpendicular lines'),
        summary: L('Zueinander parallele und senkrechte Geraden erkennen und zeichnen.', 'Recognising and drawing parallel and perpendicular lines.'),
        simulations: ['koordinaten-lage'],
      },
      {
        code: '2.3',
        title: L('Räumliche Objekte darstellen', 'Representing solids'),
        summary: L('Schrägbilder und Modelle von Würfel und Quader, Netze.', 'Oblique drawings and models of cubes and cuboids, nets.'),
        simulations: ['koerpernetze'],
      },
      {
        code: '2.4',
        title: L('Längen, Flächen- und Rauminhalte ermitteln', 'Finding lengths, areas and volumes'),
        summary: L('Vergleichen, schätzen und berechnen, Formeln entwickeln.', 'Comparing, estimating and calculating, developing formulas.'),
        simulations: ['umfang-flaeche', 'quader-volumen'],
      },
      {
        code: '2.5',
        title: L('Winkel erkunden', 'Exploring angles'),
        summary: L(
          'Winkel schätzen, messen und zeichnen; Neben-, Scheitel- und Stufenwinkel.',
          'Estimating, measuring and drawing angles; adjacent, vertical and corresponding angles.',
        ),
        simulations: ['winkel-messen', 'winkel-geradenkreuzung'],
      },
      {
        code: '2.6',
        title: L('Winkelsummensatz', 'Angle sum theorem'),
        summary: L('Innenwinkelsumme in Dreieck und Viereck begründen und anwenden.', 'Justifying and using the interior angle sum in triangles and quadrilaterals.'),
        simulations: ['winkelsumme'],
      },
    ],
  },
  {
    code: '3',
    title: L('Umgang mit Brüchen', 'Working with fractions'),
    summary: L(
      'Brüche im Alltag als Anteile, Maßstäbe, Prozente und Verhältnisse, Brüche darstellen, vergleichen, kürzen und erweitern und mit einfachen Brüchen rechnen.',
      'Fractions in everyday life as parts, scales, percentages and ratios, representing, comparing, simplifying and expanding fractions and calculating with simple fractions.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Brüche im Alltag erkunden', 'Exploring fractions in everyday life'),
        summary: L('Anteile, Maßstäbe, Prozente und Verhältnisse.', 'Parts of a whole, scales, percentages and ratios.'),
        simulations: ['bruchteile', 'massstab', 'prozentstreifen'],
      },
      {
        code: '3.2',
        title: L('Bruchdarstellungen verwenden', 'Using representations of fractions'),
        summary: L('Bildlich, sprachlich, geometrisch und algebraisch; vergleichen, kürzen und erweitern.', 'Pictorial, verbal, geometric and algebraic; comparing, simplifying and expanding.'),
        simulations: ['bruchteile', 'brueche-vergleichen'],
      },
      {
        code: '3.3',
        title: L('Mit Brüchen rechnen', 'Calculating with fractions'),
        summary: L('Grundrechenarten mit einfachen Brüchen und einfache Gleichungen durch Umkehren.', 'The four operations with simple fractions and simple equations by working backwards.'),
        simulations: ['brueche-rechnen'],
      },
    ],
  },
  {
    code: '4',
    title: L('Planung und Durchführung statistischer Erhebungen', 'Planning and carrying out statistical surveys'),
    summary: L(
      'Eine Befragung, Beobachtung oder ein Experiment planen, Hypothesen aufstellen, Daten in Strichlisten und Tabellen festhalten und die Hypothesen prüfen.',
      'Planning a survey, observation or experiment, stating hypotheses, recording data in tally charts and tables and checking the hypotheses.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Befragung oder Beobachtung', 'Survey or observation'),
        summary: L('Merkmal und Stichprobe festlegen, Strichlisten anlegen, Hypothesen prüfen.', 'Defining the characteristic and sample, keeping tally charts, checking hypotheses.'),
      },
      {
        code: '4.2',
        title: L('Experiment', 'Experiment'),
        summary: L('Durchführung planen, Daten in Tabellen festhalten, Hypothesen prüfen.', 'Planning the procedure, recording data in tables, checking hypotheses.'),
      },
    ],
  },
  {
    code: '5',
    title: L('Umgang mit Dezimalzahlen', 'Working with decimals'),
    summary: L(
      'Dezimalzahlen an Zahlengerade, Stellenwerttafel und als Bruch darstellen, mit ihnen rechnen, runden und Größen umrechnen.',
      'Representing decimals on the number line, in the place-value chart and as fractions, calculating with them, rounding and converting quantities.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Dezimalzahlen darstellen', 'Representing decimals'),
        summary: L('Zahlengerade, Stellenwertsystem und Bruchdarstellung.', 'Number line, place-value system and fraction form.'),
        simulations: ['dezimalbrueche', 'stellenwerte'],
      },
      {
        code: '5.2',
        title: L('Mit Dezimalzahlen rechnen', 'Calculating with decimals'),
        summary: L('Grundrechenarten, auch verknüpft mit dem Bruchrechnen.', 'The four operations, also linked to calculating with fractions.'),
        simulations: ['dezimalbrueche'],
      },
      {
        code: '5.3',
        title: L('Runden und schätzen', 'Rounding and estimating'),
        summary: L('Näherungswerte und Überschlag.', 'Approximations and estimates.'),
      },
      {
        code: '5.4',
        title: L('Größen umrechnen', 'Converting quantities'),
        summary: L('Zeit, Masse, Geld, Längen, Flächen- und Rauminhalte.', 'Time, mass, money, length, area and volume.'),
        simulations: ['einheiten'],
      },
    ],
  },
  {
    code: '6',
    title: L('Symmetrien', 'Symmetry'),
    summary: L(
      'Achsen-, Punkt-, Dreh- und Ebenensymmetrie, Verschieben, Spiegeln und Drehen, Dreiecke und Vierecke nach Symmetrie ordnen sowie Kreis, Mittelsenkrechte und Winkelhalbierende als Ortslinien.',
      'Line, point, rotational and plane symmetry, translating, reflecting and rotating, classifying triangles and quadrilaterals by symmetry, and the circle, perpendicular bisector and angle bisector as loci.',
    ),
    parts: [
      {
        code: '6.1',
        title: L('Symmetrien beschreiben', 'Describing symmetry'),
        summary: L('Ebenen-, Achsen-, Punkt- und Drehsymmetrie, auch im Raum.', 'Plane, line, point and rotational symmetry, also in space.'),
        simulations: ['spiegelung'],
      },
      {
        code: '6.2',
        title: L('Verschiebungen, Spiegelungen und Drehungen', 'Translations, reflections and rotations'),
        summary: L('Abbildungen in der Ebene durchführen und Muster erzeugen.', 'Carrying out transformations in the plane and creating patterns.'),
        simulations: ['spiegelung'],
      },
      {
        code: '6.3',
        title: L('Dreiecke und Vierecke nach Symmetrien ordnen', 'Classifying triangles and quadrilaterals by symmetry'),
        summary: L('Gleichschenklige und gleichseitige Dreiecke, Haus der Vierecke.', 'Isosceles and equilateral triangles, the hierarchy of quadrilaterals.'),
        simulations: ['vierecke'],
      },
      {
        code: '6.4',
        title: L('Kreise beschreiben und nutzen', 'Describing and using circles'),
        summary: L(
          'Kreis als Ortslinie, Mittelsenkrechte und Winkelhalbierende als Symmetrieachsen.',
          'The circle as a locus, perpendicular bisectors and angle bisectors as axes of symmetry.',
        ),
        simulations: ['mittelsenkrechte'],
      },
    ],
  },
  {
    code: '7',
    title: L('Maßzahlen statistischer Erhebungen', 'Measures of statistical surveys'),
    summary: L(
      'Häufigkeiten in Säulen- und Kreisdiagrammen darstellen und kritisch lesen, relative Häufigkeit, arithmetisches Mittel, Modalwert und Spannweite.',
      'Showing frequencies in bar and pie charts and reading them critically, relative frequency, mean, mode and range.',
    ),
    parts: [
      {
        code: '7.1',
        title: L('Häufigkeitsverteilungen grafisch darstellen', 'Graphing frequency distributions'),
        summary: L('Säulendiagramme erstellen und bewerten, Kreisdiagramme lesen.', 'Making and judging bar charts, reading pie charts.'),
        simulations: ['diagramme'],
      },
      {
        code: '7.2',
        title: L('Zwei Häufigkeitsverteilungen vergleichen', 'Comparing two frequency distributions'),
        summary: L(
          'Relative Häufigkeit, arithmetisches Mittel, Modalwert und Spannweite.',
          'Relative frequency, mean, mode and range.',
        ),
        simulations: ['boxplot'],
      },
    ],
  },
];

/** Doppelschuljahrgang 7/8 (Kap. 3.3.2). */
const DJ_7_8: CurriculumUnit[] = [
  {
    code: '8',
    title: L('Umgang mit negativen Zahlen', 'Working with negative numbers'),
    summary: L(
      'Negative Zahlen an der Zahlengeraden, Addieren und Subtrahieren am Temperaturmodell, Multiplizieren und Dividieren mit Vorzeichenregeln.',
      'Negative numbers on the number line, adding and subtracting with the temperature model, multiplying and dividing with sign rules.',
    ),
    parts: [
      {
        code: '8.1',
        title: L('Positive und negative Zahlen an der Zahlengeraden', 'Positive and negative numbers on the number line'),
        summary: L('Zahlen darstellen und ordnen.', 'Representing and ordering numbers.'),
        simulations: ['zahlengerade'],
      },
      {
        code: '8.2',
        title: L('Addieren und subtrahieren', 'Adding and subtracting'),
        summary: L('Realitätsnah, etwa am Temperaturmodell, und mit Mustern in Rechenreihen.', 'In real contexts such as temperatures, and with patterns in sequences of calculations.'),
        simulations: ['zahlengerade'],
      },
      {
        code: '8.3',
        title: L('Multiplizieren und dividieren', 'Multiplying and dividing'),
        summary: L('Schuldenmodell, Permanenzprinzip und Vorzeichenregeln.', 'Debt model, permanence principle and sign rules.'),
      },
      {
        code: '8.4',
        title: L('Klammern und Rechenregeln', 'Brackets and rules of arithmetic'),
        summary: L('Vor- und Rechenzeichen, vorteilhaft rechnen.', 'Signs and operation symbols, calculating cleverly.'),
        simulations: ['termbaum'],
      },
    ],
  },
  {
    code: '9',
    title: L('Wahrscheinlichkeit', 'Probability'),
    summary: L(
      'Versuchsreihen mit teil-, un- und vollsymmetrischen Objekten, Wahrscheinlichkeit als Prognose relativer Häufigkeiten, Laplace-Wahrscheinlichkeit, Gesetz der großen Zahlen, Additions- und Komplementärregel.',
      'Series of trials with partly symmetric, asymmetric and fully symmetric objects, probability as a prediction of relative frequency, Laplace probability, the law of large numbers, the addition and complement rules.',
    ),
    parts: [
      {
        code: '9.1',
        title: L('Versuchsreihen mit teil- und unsymmetrischen Objekten', 'Trials with partly symmetric and asymmetric objects'),
        summary: L(
          'Quader oder Reißzwecke: Wahrscheinlichkeit als Prognose, Gesetz der großen Zahlen qualitativ.',
          'Cuboids or drawing pins: probability as a prediction, the law of large numbers qualitatively.',
        ),
        simulations: ['gesetz-grosse-zahlen'],
      },
      {
        code: '9.2',
        title: L('Versuchsreihen mit vollsymmetrischen Objekten', 'Trials with fully symmetric objects'),
        summary: L('Laplace-Wahrscheinlichkeit gegen relative Häufigkeit abgrenzen.', 'Distinguishing Laplace probability from relative frequency.'),
        simulations: ['gesetz-grosse-zahlen'],
      },
      {
        code: '9.3',
        title: L('Additions- und Komplementärregel', 'Addition and complement rules'),
        summary: L('Regeln begründen und anwenden.', 'Justifying and applying the rules.'),
      },
    ],
  },
  {
    code: '10',
    title: L('Proportionale und antiproportionale Zusammenhänge', 'Proportional and inversely proportional relationships'),
    summary: L(
      'Zuordnungen in Worten, Tabellen und Graphen, proportionale und antiproportionale Zusammenhänge mit Dreisatz sowie Prozent- und Zinsrechnung.',
      'Relationships in words, tables and graphs, proportional and inversely proportional relationships with the rule of three, and percentages and interest.',
    ),
    parts: [
      {
        code: '10.1',
        title: L('Zuordnungen erfassen', 'Understanding relationships'),
        summary: L('Worte, Tabellen und Graphen und der Wechsel zwischen ihnen.', 'Words, tables and graphs and switching between them.'),
        simulations: ['funktion-zuordnung', 'proportional'],
      },
      {
        code: '10.2',
        title: L('Proportionale Zusammenhänge erfassen', 'Proportional relationships'),
        summary: L('Erkennen, Dreisatz, Quotient als „Betrag pro Einheit“.', 'Recognising them, the rule of three, the quotient as an amount per unit.'),
        simulations: ['proportional'],
      },
      {
        code: '10.3',
        title: L('Antiproportionale Zusammenhänge erfassen', 'Inversely proportional relationships'),
        summary: L('Erkennen, Dreisatz, Produkt als „Gesamtgröße“.', 'Recognising them, the rule of three, the product as a total.'),
        simulations: ['hyperbel'],
      },
      {
        code: '10.4',
        title: L('Prozent- und Zinsrechnung', 'Percentages and interest'),
        summary: L('Mithilfe des Dreisatzes.', 'Using the rule of three.'),
        simulations: ['prozentstreifen'],
      },
    ],
  },
  {
    code: '11',
    title: L('Längen, Flächen- und Rauminhalte und deren Terme', 'Lengths, areas and volumes and their terms'),
    summary: L(
      'Umfang und Flächeninhalt von Dreieck, Parallelogramm und Trapez, Oberfläche und Volumen des Prismas, Schrägbilder und Netze.',
      'Perimeter and area of triangles, parallelograms and trapezia, surface area and volume of prisms, oblique drawings and nets.',
    ),
    parts: [
      {
        code: '11.1',
        title: L('Dreieck, Parallelogramm und Trapez', 'Triangle, parallelogram and trapezium'),
        summary: L('Formeln für Umfang und Flächeninhalt begründen und anwenden.', 'Justifying and using formulas for perimeter and area.'),
        simulations: ['flaechen-zerlegen'],
      },
      {
        code: '11.2',
        title: L('Oberflächen- und Rauminhalt des Prismas', 'Surface area and volume of prisms'),
        summary: L('Vergleichen, schätzen, berechnen und Formeln begründen.', 'Comparing, estimating, calculating and justifying formulas.'),
        simulations: ['prisma-zylinder', 'koerpernetze'],
      },
      {
        code: '11.3',
        title: L('Mit Schrägbildern und Netzen umgehen', 'Working with oblique drawings and nets'),
        summary: L('Vergleichen und zwischen Darstellungen wechseln.', 'Comparing and switching between representations.'),
        simulations: ['koerpernetze'],
      },
    ],
  },
  {
    code: '12',
    title: L('Elementare Termumformungen', 'Elementary transformations of terms'),
    summary: L(
      'Zusammenfassen, Ausmultiplizieren und Ausklammern, binomische Formeln sowie einfache lineare und Verhältnisgleichungen lösen.',
      'Collecting like terms, expanding and factorising, binomial formulas, and solving simple linear and proportion equations.',
    ),
    parts: [
      {
        code: '12.1',
        title: L('Einfache Termumformungen', 'Simple transformations of terms'),
        summary: L('Zusammenfassen, Ausmultiplizieren und Ausklammern.', 'Collecting like terms, expanding and factorising.'),
        simulations: ['termbaum'],
      },
      {
        code: '12.2',
        title: L('Summen multiplizieren', 'Multiplying sums'),
        summary: L('Ausmultiplizieren, binomische Formeln als Spezialfall.', 'Expanding brackets, binomial formulas as a special case.'),
        simulations: ['binomische-formeln'],
      },
      {
        code: '12.3',
        title: L('Einfache lineare Gleichungen und Verhältnisgleichungen lösen', 'Solving simple linear and proportion equations'),
        summary: L('Ohne Rechner umformen.', 'Transforming by hand.'),
        simulations: ['waagemodell'],
      },
    ],
  },
  {
    code: '13',
    title: L('Entdeckungen an Dreiecken – Konstruktionen und besondere Linien', 'Discoveries in triangles – constructions and special lines'),
    summary: L(
      'Dreiecke mit den vier Grundkonstruktionen konstruieren, Kongruenz, Satz des Thales sowie Mittelsenkrechten, Winkelhalbierende, Seitenhalbierende und Höhen als Ortslinien.',
      'Constructing triangles with the four basic constructions, congruence, Thales’ theorem, and perpendicular bisectors, angle bisectors, medians and altitudes as loci.',
    ),
    parts: [
      {
        code: '13.1',
        title: L('Dreiecke konstruieren', 'Constructing triangles'),
        summary: L('Vier Grundkonstruktionen und Kongruenz.', 'Four basic constructions and congruence.'),
        simulations: ['dreieckskonstruktion'],
      },
      {
        code: '13.2',
        title: L('Satz des Thales', 'Thales’ theorem'),
        summary: L('Begründen und anwenden.', 'Justifying and applying it.'),
        simulations: ['thales'],
      },
      {
        code: '13.3',
        title: L('Transversalen erkunden', 'Exploring special lines'),
        summary: L(
          'Mittelsenkrechte, Winkelhalbierende, Seitenhalbierende und Höhen konstruieren, Schnittpunkte begründen; fakultativ Umkreis und Inkreis.',
          'Constructing perpendicular bisectors, angle bisectors, medians and altitudes and justifying their intersections; optionally circumcircle and incircle.',
        ),
        simulations: ['besondere-linien', 'mittelsenkrechte'],
      },
    ],
  },
  {
    code: '14',
    title: L('Ein- und mehrstufige Zufallsversuche', 'Single- and multi-stage random experiments'),
    summary: L(
      'Häufigkeiten prognostizieren, durchführen und simulieren, Variabilität erleben, Baumdiagramme und Pfadregeln mit absoluten Häufigkeiten begründen und anwenden.',
      'Predicting, carrying out and simulating frequencies, experiencing variability, justifying and using tree diagrams and path rules with absolute frequencies.',
    ),
    parts: [
      {
        code: '14.1',
        title: L('Einstufige Zufallsexperimente', 'Single-stage random experiments'),
        summary: L(
          'Absolute Häufigkeiten prognostizieren und mit Versuchsreihen vergleichen; Gesetz der großen Zahlen.',
          'Predicting absolute frequencies and comparing them with series of trials; the law of large numbers.',
        ),
        simulations: ['gesetz-grosse-zahlen'],
      },
      {
        code: '14.2',
        title: L('Zwei- und mehrstufige Zufallsexperimente', 'Two- and multi-stage random experiments'),
        summary: L(
          'Baumdiagramm, Ziehen mit und ohne Zurücklegen, Pfadregeln begründen und anwenden.',
          'Tree diagrams, drawing with and without replacement, justifying and using path rules.',
        ),
        simulations: ['baumdiagramm', 'zaehlprinzip', 'geburtstagsproblem'],
      },
    ],
  },
  {
    code: '15',
    title: L('Lineare Zusammenhänge', 'Linear relationships'),
    summary: L(
      'Lineare Funktionen in allen Darstellungen, Steigung als konstante Änderungsrate, Ausgleichsgeraden sowie lineare Gleichungen und Gleichungssysteme mit zwei Variablen lösen.',
      'Linear functions in all representations, slope as a constant rate of change, lines of best fit, and solving linear equations and systems with two variables.',
    ),
    parts: [
      {
        code: '15.1',
        title: L('Lineare Zusammenhänge identifizieren und darstellen', 'Identifying and representing linear relationships'),
        summary: L('Text, Diagramm, Tabelle, Koordinatensystem und Gleichung.', 'Text, diagram, table, coordinate system and equation.'),
        simulations: ['lineare-funktion', 'funktionsplotter'],
      },
      {
        code: '15.2',
        title: L('Lineare Funktionen analysieren', 'Analysing linear functions'),
        summary: L(
          'Steigungsdreieck, y-Achsenabschnitt, Nullstelle, Parametervariation und Geraden durch zwei Punkte.',
          'Slope triangle, y-intercept, zero, varying parameters and lines through two points.',
        ),
        simulations: ['lineare-funktion'],
      },
      {
        code: '15.3',
        title: L('Lineare Gleichungen lösen', 'Solving linear equations'),
        summary: L('Probieren, Rückwärtsarbeiten, von Hand und mit digitalen Werkzeugen.', 'Trial, working backwards, by hand and with digital tools.'),
        simulations: ['waagemodell', 'gleichungen-grafisch'],
      },
      {
        code: '15.4',
        title: L('Lineare Gleichungssysteme mit zwei Variablen', 'Linear systems with two variables'),
        summary: L('Grafisch, durch Einsetzen und Gleichsetzen; Lösbarkeit am Graphen.', 'Graphically, by substitution and equating; solvability from the graph.'),
        simulations: ['lgs-grafisch'],
      },
    ],
  },
];

/** Doppelschuljahrgang 9/10 (Kap. 3.3.3). */
const DJ_9_10: CurriculumUnit[] = [
  {
    code: '16',
    title: L('Baumdiagramme und Vierfeldertafeln', 'Tree diagrams and two-way tables'),
    summary: L(
      'Daten mit zwei Merkmalen und zweistufige Zufallsexperimente in Baumdiagramm und Vierfeldertafel darstellen und unbekannte Wahrscheinlichkeiten ermitteln, als Vorbereitung der bedingten Wahrscheinlichkeit.',
      'Representing data with two characteristics and two-stage random experiments in tree diagrams and two-way tables and finding unknown probabilities, preparing conditional probability.',
    ),
    parts: [
      {
        code: '16.1',
        title: L('Daten mit zwei Merkmalen', 'Data with two characteristics'),
        summary: L('Einträge vervollständigen und zwischen den Darstellungen wechseln.', 'Completing entries and switching between representations.'),
        simulations: ['vierfeldertafel'],
      },
      {
        code: '16.2',
        title: L('Zweistufige Zufallsexperimente', 'Two-stage random experiments'),
        summary: L('Darstellen und analysieren in Baumdiagramm und Vierfeldertafel.', 'Representing and analysing them in tree diagrams and two-way tables.'),
        simulations: ['baumdiagramm', 'vierfeldertafel'],
      },
      {
        code: '16.3',
        title: L('Unbekannte Wahrscheinlichkeiten ermitteln', 'Finding unknown probabilities'),
        summary: L('Mit absoluten Häufigkeiten ermitteln und deuten.', 'Finding and interpreting them using absolute frequencies.'),
        simulations: ['bedingte-wahrscheinlichkeit'],
      },
    ],
  },
  {
    code: '17',
    title: L('Entdeckungen an rechtwinkligen Dreiecken und Ähnlichkeit', 'Discoveries in right triangles and similarity'),
    summary: L(
      'Ähnliche Dreiecke, Satzgruppe des Pythagoras, Wurzeln als Umkehrung des Quadrierens, Sinus, Kosinus und Tangens sowie Sinus- und Kosinussatz.',
      'Similar triangles, Pythagoras’ theorem and related theorems, roots as the inverse of squaring, sine, cosine and tangent, and the laws of sines and cosines.',
    ),
    parts: [
      {
        code: '17.1',
        title: L('Ähnlichkeit', 'Similarity'),
        summary: L('Ähnliche Dreiecke erkennen, Ähnlichkeitssätze, Längen berechnen.', 'Recognising similar triangles, similarity theorems, calculating lengths.'),
        simulations: ['strahlensaetze', 'vergroessern'],
      },
      {
        code: '17.2',
        title: L('Satzgruppe des Pythagoras', 'Pythagoras’ theorem and related theorems'),
        summary: L('Begründen und anwenden.', 'Justifying and applying them.'),
        simulations: ['pythagoras'],
      },
      {
        code: '17.3',
        title: L('Mit Wurzeln umgehen', 'Working with roots'),
        summary: L('Wurzelziehen als Umkehroperation, Rechengesetze, Streckenberechnung.', 'Taking roots as an inverse operation, laws, calculating lengths.'),
        simulations: ['quadratwurzel'],
      },
      {
        code: '17.4',
        title: L('Trigonometrische Beziehungen', 'Trigonometric relationships'),
        summary: L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Tangens als Steigungsmaß.', 'Sine, cosine and tangent in right triangles, tangent as a measure of slope.'),
        simulations: ['sin-cos-tan-dreieck'],
      },
      {
        code: '17.5',
        title: L('Berechnungen an allgemeinen Dreiecken', 'Calculations in general triangles'),
        summary: L('Sinussatz und Kosinussatz.', 'Law of sines and law of cosines.'),
        simulations: ['sinussatz-kosinussatz'],
      },
    ],
  },
  {
    code: '18',
    title: L('Quadratische Zusammenhänge', 'Quadratic relationships'),
    summary: L(
      'Quadratische Funktionen in allgemeiner, faktorisierter und Scheitelpunktform, quadratische Gleichungen lösen, Optimierung und Ausgleichsparabeln sowie die Parabel als Ortslinie.',
      'Quadratic functions in general, factorised and vertex form, solving quadratic equations, optimisation and parabolas of best fit, and the parabola as a locus.',
    ),
    parts: [
      {
        code: '18.1',
        title: L('Quadratische Funktionen untersuchen', 'Investigating quadratic functions'),
        summary: L('Parametervariation und Wechsel zwischen den drei Termformen.', 'Varying parameters and switching between the three forms.'),
        simulations: ['quadratische-funktion', 'funktionsplotter'],
      },
      {
        code: '18.2',
        title: L('Quadratische Gleichungen', 'Quadratic equations'),
        summary: L('Lösungen mit Graph und Termstruktur verknüpfen, p-q-Formel.', 'Linking solutions to the graph and the structure of the term, the quadratic formula.'),
        simulations: ['gleichungen-grafisch'],
      },
      {
        code: '18.3',
        title: L('Quadratische Zusammenhänge modellieren', 'Modelling quadratic relationships'),
        summary: L('Optimierungsprobleme, Nullstellensuche und Ausgleichsparabeln.', 'Optimisation problems, finding zeros and parabolas of best fit.'),
        simulations: ['extremwert-parabel', 'parabel-drei-punkte'],
      },
      {
        code: '18.4',
        title: L('Parabel als Ortslinie', 'The parabola as a locus'),
        summary: L('Gleicher Abstand zu einem Punkt und einer Geraden.', 'Equal distance from a point and a line.'),
      },
    ],
  },
  {
    code: '19',
    title: L('Kreis- und Körperberechnungen', 'Calculations with circles and solids'),
    summary: L(
      'Kreiszahl π durch Näherung, Umfang, Fläche, Bogen und Kreisausschnitt sowie Oberfläche und Volumen von Zylinder, Pyramide, Kegel und Kugel.',
      'The number π by approximation, circumference, area, arcs and sectors, and surface area and volume of cylinders, pyramids, cones and spheres.',
    ),
    parts: [
      {
        code: '19.1',
        title: L('Flächeninhalt und Umfang des Kreises', 'Area and circumference of the circle'),
        summary: L('Weg zur Kreiszahl π, Bogenlänge, Kreisausschnitt und Bogenmaß.', 'The path to π, arc length, sectors and radians.'),
        simulations: ['kreiszahl-pi'],
      },
      {
        code: '19.2',
        title: L('Maßzahlen ausgewählter Körper', 'Measures of selected solids'),
        summary: L('Oberfläche und Volumen von Zylinder, Pyramide, Kegel und Kugel.', 'Surface area and volume of cylinders, pyramids, cones and spheres.'),
        simulations: ['prisma-zylinder', 'pyramide-kegel-kugel'],
      },
      {
        code: '19.3',
        title: L('Fakultative Erweiterungen', 'Optional extensions'),
        summary: L('Weg zum Volumen von Pyramide, Kegel und Kugel und zur Oberfläche von Kegel und Kugel.', 'Deriving the volume of pyramids, cones and spheres and the surface area of cones and spheres.'),
        simulations: ['cavalieri'],
      },
    ],
  },
  {
    code: '20',
    title: L('Exponentielle Zusammenhänge', 'Exponential relationships'),
    summary: L(
      'Exponentielles Wachstum und Abnahme iterativ und explizit, begrenztes Wachstum, Exponentialfunktionen mit Parametern sowie Potenzgesetze, Wurzelziehen und Logarithmieren.',
      'Exponential growth and decay iteratively and explicitly, limited growth, exponential functions with parameters, laws of exponents, taking roots and logarithms.',
    ),
    parts: [
      {
        code: '20.1',
        title: L('Wachstums- und Abnahmeprozesse modellieren', 'Modelling growth and decay'),
        summary: L('Linear und exponentiell abgrenzen, Überlagerung und Grenze beim begrenzten Wachstum.', 'Distinguishing linear and exponential, combinations and the limit of limited growth.'),
        simulations: ['exponentielles-wachstum'],
      },
      {
        code: '20.2',
        title: L('Exponentialfunktionen untersuchen', 'Investigating exponential functions'),
        summary: L('Parametervariation, Graphen skizzieren, Gleichung aus zwei Punkten.', 'Varying parameters, sketching graphs, the equation from two points.'),
        simulations: ['exponentielles-wachstum'],
      },
      {
        code: '20.3',
        title: L('Mit Potenzen rechnen', 'Calculating with powers'),
        summary: L('Potenzgesetze begründen, Gleichungen auch durch Logarithmieren lösen.', 'Justifying laws of exponents, solving equations also by taking logarithms.'),
        simulations: ['logarithmus'],
      },
    ],
  },
  {
    code: '21',
    title: L('Periodische Zusammenhänge', 'Periodic relationships'),
    summary: L(
      'Sinus und Kosinus am Einheitskreis, Grad- und Bogenmaß, Parameter der allgemeinen Sinusfunktion und periodische Vorgänge modellieren.',
      'Sine and cosine on the unit circle, degrees and radians, parameters of the general sine function and modelling periodic processes.',
    ),
    parts: [
      {
        code: '21.1',
        title: L('Sinus- und Kosinusfunktion als periodische Funktion', 'Sine and cosine as periodic functions'),
        summary: L('Definition am Einheitskreis, Grad- und Bogenmaß.', 'Definition on the unit circle, degrees and radians.'),
        simulations: ['einheitskreis'],
      },
      {
        code: '21.2',
        title: L('Sinusfunktion untersuchen', 'Investigating the sine function'),
        summary: L('Parameter von f(x) = a · sin(b · (x − c)) + d.', 'Parameters of f(x) = a · sin(b · (x − c)) + d.'),
        simulations: ['sinusfunktion', 'transformationen'],
      },
      {
        code: '21.3',
        title: L('Periodische Zusammenhänge modellieren', 'Modelling periodic relationships'),
        summary: L('Ebbe und Flut, Tageslänge, Temperatur.', 'Tides, day length, temperature.'),
        simulations: ['sinusfunktion'],
      },
    ],
  },
  {
    code: '22',
    title: L('Näherungsverfahren als Grenzprozesse – Zahlbereichserweiterungen', 'Approximation as limiting processes – extending the number system'),
    summary: L(
      'Grenzprozesse vergleichen: Annäherung an Quadratwurzeln und π, 0,9 periodisch gleich 1, Zerfall und begrenztes Wachstum, Graph von 1/x; Irrationalität und reelle Zahlen.',
      'Comparing limiting processes: approximating square roots and π, 0.9 recurring equals 1, decay and limited growth, the graph of 1/x; irrationality and the real numbers.',
    ),
    parts: [
      {
        code: '22.1',
        title: L('Grenzprozesse beschreiben', 'Describing limiting processes'),
        summary: L(
          'Näherung irrationaler Quadratwurzeln, Kreiszahl π, exponentieller Zerfall und Grenzverhalten von 1/x.',
          'Approximating irrational square roots, the number π, exponential decay and the limiting behaviour of 1/x.',
        ),
        simulations: ['quadratwurzel', 'kreiszahl-pi', 'grenzverhalten'],
      },
      {
        code: '22.2',
        title: L('Zahlbereichserweiterungen erläutern', 'Explaining extensions of the number system'),
        summary: L('Eine Irrationalitätsbegründung und die reellen Zahlen.', 'A proof of irrationality and the real numbers.'),
        simulations: ['quadratwurzel'],
      },
    ],
  },
];

/** Einführungsphase (Kap. 3.3.1 des Kerncurriculums Sekundarbereich II). */
const EF_UNITS: CurriculumUnit[] = [
  {
    code: 'EF-1',
    title: L('Beschreibende Statistik', 'Descriptive statistics'),
    summary: L(
      'Daten erheben und klassieren, Säulendiagramme und Kenngrößen wie Mittelwert, Median, Modalwert, Spannweite, Varianz und Standardabweichung.',
      'Collecting and grouping data, bar charts and measures such as mean, median, mode, range, variance and standard deviation.',
    ),
    parts: [
      {
        code: 'EF-1.1',
        title: L('Datenerhebung', 'Collecting data'),
        summary: L('Merkmale, Klassierung, Repräsentativität und Säulendiagramme.', 'Characteristics, grouping, representativeness and bar charts.'),
      },
      {
        code: 'EF-1.2',
        title: L('Kenngrößen', 'Measures'),
        summary: L('Lage- und Streumaße deuten und Datensätze vergleichen; fakultativ Boxplots.', 'Interpreting measures of centre and spread and comparing data sets; optionally box plots.'),
      },
    ],
  },
  {
    code: 'EF-2',
    title: L('Elementare Funktionenlehre', 'Elementary functions'),
    summary: L(
      'Potenz- und Wurzelfunktionen, Parametervariation bei Potenz-, Exponential- und Sinusfunktionen im Vergleich und ganzrationale Funktionen mit Nullstellen, Symmetrie und Globalverhalten.',
      'Power and root functions, comparing parameter variation for power, exponential and sine functions, and polynomial functions with zeros, symmetry and end behaviour.',
    ),
    parts: [
      {
        code: 'EF-2.1',
        title: L('Potenzfunktionen', 'Power functions'),
        summary: L('Graphen skizzieren, Globalverhalten und Symmetrie, Wurzelfunktionen.', 'Sketching graphs, end behaviour and symmetry, root functions.'),
        simulations: ['potenzfunktionen'],
      },
      {
        code: 'EF-2.2',
        title: L('Vergleich von Potenz-, Exponential- und Sinusfunktionen', 'Comparing power, exponential and sine functions'),
        summary: L('Parametervariation a · f(b · (x − c)) + d für verschiedene Funktionsklassen.', 'Parameter variation a · f(b · (x − c)) + d for different classes of functions.'),
        simulations: ['transformationen', 'sinusfunktion'],
      },
      {
        code: 'EF-2.3',
        title: L('Ganzrationale Funktionen', 'Polynomial functions'),
        summary: L(
          'Als Summe von Potenzfunktionen deuten, modellieren, Nullstellen und faktorisierte Form, Globalverhalten und Symmetrie.',
          'Seen as sums of power functions, modelling, zeros and factorised form, end behaviour and symmetry.',
        ),
        simulations: ['ganzrationale-funktionen', 'grenzverhalten', 'funktionsplotter'],
      },
      {
        code: 'EF-2.4',
        title: L('Fakultative Erweiterungen', 'Optional extensions'),
        summary: L('Wurzelfunktion und Kehrwertfunktion als Umkehrfunktion.', 'The root function and the reciprocal function as inverse functions.'),
        simulations: ['umkehrfunktion'],
      },
    ],
  },
  {
    code: 'EF-3',
    title: L('Ableitungen', 'Derivatives'),
    summary: L(
      'Von der mittleren zur lokalen Änderungsrate, Ableitungsfunktion grafisch und mit Regeln, Tangenten, Monotonie, Extrem- und Wendestellen sowie Optimierungsprobleme.',
      'From average to instantaneous rate of change, the derivative function graphically and with rules, tangents, monotonicity, extrema and points of inflection, and optimisation problems.',
    ),
    parts: [
      {
        code: 'EF-3.1',
        title: L('Ableitung an einer Stelle', 'Derivative at a point'),
        summary: L('Differenzenquotient, Sekanten- und Tangentensteigung, Grenzwertschreibweise.', 'Difference quotient, slope of secant and tangent, limit notation.'),
        simulations: ['sekante-tangente'],
      },
      {
        code: 'EF-3.2',
        title: L('Ableitungsfunktion', 'Derivative function'),
        summary: L(
          'Graph und Ableitungsgraph auseinander entwickeln, Summen- und Faktorregel, Ableitung von Potenz-, Sinus- und Kosinusfunktion.',
          'Developing graph and derivative graph from each other, sum and constant-multiple rules, derivatives of power, sine and cosine functions.',
        ),
        simulations: ['ableitungsfunktion'],
      },
      {
        code: 'EF-3.3',
        title: L('Verwendung von Ableitungen', 'Using derivatives'),
        summary: L('Tangenten und Normalen, Monotonie, Extrem- und Wendestellen, Optimierungsprobleme.', 'Tangents and normals, monotonicity, extrema and points of inflection, optimisation problems.'),
        simulations: ['kurvendiskussion', 'extremwertprobleme'],
      },
    ],
  },
];

/** Qualifikationsphase (Kap. 3.3.2.1): Lernbereiche gA und eA. */
const Q_UNITS: CurriculumUnit[] = [
  {
    code: 'gA-1',
    title: L('Kurvenanpassung mit ganzrationalen Funktionen (gA)', 'Curve fitting with polynomial functions (basic level)'),
    summary: L(
      'Aus Eigenschaften Bedingungen für den Funktionsterm aufstellen, lineare Gleichungssysteme algorithmisch lösen und einen Parameter an eine Eigenschaft anpassen.',
      'Turning properties into conditions on the function term, solving linear systems algorithmically and adjusting a parameter to a given property.',
    ),
    simulations: ['funktionenscharen'],
  },
  {
    code: 'gA-2',
    title: L('Von der Änderung zum Bestand – Integralrechnung (gA)', 'From change to total – integral calculus (basic level)'),
    summary: L(
      'Bestände aus Änderungsraten rekonstruieren, Integral als Grenzwert von Produktsummen, Hauptsatz, Flächen zwischen Graphen und Stammfunktionen.',
      'Reconstructing totals from rates of change, the integral as a limit of Riemann sums, the fundamental theorem, areas bounded by graphs and antiderivatives.',
    ),
    parts: [
      {
        code: 'gA-2.1',
        title: L('Bestimmtes Integral', 'Definite integral'),
        summary: L('Rekonstruierter Bestand, Produktsummen, Hauptsatz und Flächeninhalte.', 'Reconstructed totals, Riemann sums, the fundamental theorem and areas.'),
        simulations: ['ober-untersummen', 'aenderungsrate', 'hauptsatz'],
      },
      {
        code: 'gA-2.2',
        title: L('Stammfunktion', 'Antiderivative'),
        summary: L('Stammfunktionen angeben, entwickeln und mit den Ableitungsregeln prüfen.', 'Stating, developing and checking antiderivatives with the rules of differentiation.'),
        simulations: ['stammfunktion-grafisch'],
      },
    ],
  },
  {
    code: 'gA-3',
    title: L('Die e-Funktion (gA)', 'The exponential function e^x (basic level)'),
    summary: L(
      'Die Basis e über (eˣ)′ = eˣ, Verknüpfung und Verkettung mit anderen Funktionen, Produkt- und Kettenregel, Exponentialgleichungen und begrenztes Wachstum.',
      'The base e via (eˣ)′ = eˣ, combining and composing with other functions, product and chain rules, exponential equations and limited growth.',
    ),
    simulations: ['e-funktion', 'logarithmus'],
  },
  {
    code: 'gA-4',
    title: L('Raumanschauung und Koordinatisierung (gA)', 'Spatial visualisation and coordinates (basic level)'),
    summary: L(
      'Punkte und Vektoren im Raum, Vektoroperationen, Geraden und Ebenen in Parameterform, Abstände zwischen Punkten, Skalarprodukt, Winkel und Lage von Geraden.',
      'Points and vectors in space, vector operations, lines and planes in parametric form, distances between points, the dot product, angles and relative positions of lines.',
    ),
    parts: [
      {
        code: 'gA-4.1',
        title: L('Raumanschauung und Koordinatisierung', 'Spatial visualisation and coordinates'),
        summary: L(
          'Punkte und Vektoren als Tupel, Addition und Vervielfachung, Kollinearität, Geraden und Ebenen in Parameterform.',
          'Points and vectors as tuples, addition and scalar multiplication, collinearity, lines and planes in parametric form.',
        ),
        simulations: ['koordinaten-3d', 'vektoren-3d', 'geraden-ebenen'],
      },
      {
        code: 'gA-4.2',
        title: L('Maße und Lagen', 'Measures and positions'),
        summary: L(
          'Abstände zwischen Punkten, Skalarprodukt und Orthogonalität, Winkel, Lage und Schnittpunkte von Geraden.',
          'Distances between points, dot product and orthogonality, angles, relative positions and intersections of lines.',
        ),
        simulations: ['lage-abstaende', 'skalar-vektorprodukt'],
      },
      {
        code: 'gA-4.3',
        title: L('Fakultative Erweiterungen', 'Optional extensions'),
        summary: L('Lage von Geraden und Ebenen, Normalenform, Kreis- und Kugelgleichung.', 'Lines and planes, normal form, equations of circles and spheres.'),
        simulations: ['kugeln'],
      },
    ],
  },
  {
    code: 'gA-5',
    title: L('Daten und Zufall (gA)', 'Data and chance (basic level)'),
    summary: L(
      'Bedingte Wahrscheinlichkeit und Unabhängigkeit, Erwartungswert und Standardabweichung, Binomialverteilung mit Prognoseintervallen und Simulationen.',
      'Conditional probability and independence, expected value and standard deviation, the binomial distribution with prediction intervals and simulations.',
    ),
    parts: [
      {
        code: 'gA-5.1',
        title: L('Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit', 'Conditional probability and stochastic independence'),
        summary: L('Mit Baumdiagramm und Vierfeldertafel erarbeiten, Teilvorgänge auf Unabhängigkeit prüfen.', 'Developing it with tree diagrams and two-way tables, checking stages for independence.'),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
      },
      {
        code: 'gA-5.2',
        title: L('Erwartungswert und Standardabweichung diskreter Zufallsgrößen', 'Expected value and standard deviation of discrete random variables'),
        summary: L('Kenngrößen berechnen und deuten, faire Spiele.', 'Calculating and interpreting measures, fair games.'),
        simulations: ['binomialverteilung'],
      },
      {
        code: 'gA-5.3',
        title: L('Binomialverteilung', 'Binomial distribution'),
        summary: L(
          'Modell beurteilen, Wahrscheinlichkeiten und Kenngrößen berechnen, Histogramme deuten, Prognoseintervalle und Verträglichkeit einer Stichprobe.',
          'Judging the model, calculating probabilities and measures, interpreting histograms, prediction intervals and whether a sample is compatible.',
        ),
        simulations: ['binomialverteilung', 'galtonbrett'],
      },
    ],
  },
  {
    code: 'eA-1',
    title: L('Von der Änderung zum Bestand – Integralrechnung (eA)', 'From change to total – integral calculus (higher level)'),
    summary: L(
      'Wie gA, dazu Integralfunktion, ln als Stammfunktion von 1/x, Rotationskörper und uneigentliche Integrale.',
      'As at basic level, plus the integral function, ln as an antiderivative of 1/x, solids of revolution and improper integrals.',
    ),
    parts: [
      {
        code: 'eA-1.1',
        title: L('Bestimmtes Integral', 'Definite integral'),
        summary: L('Rekonstruierter Bestand, Produktsummen, Hauptsatz und Flächeninhalte.', 'Reconstructed totals, Riemann sums, the fundamental theorem and areas.'),
        simulations: ['ober-untersummen', 'aenderungsrate', 'hauptsatz'],
      },
      {
        code: 'eA-1.2',
        title: L('Integral- und Stammfunktion', 'Integral function and antiderivative'),
        summary: L('Integralfunktion als Bestands- oder Flächeninhaltsfunktion, Stammfunktionen einschließlich ln.', 'The integral function as accumulation or area function, antiderivatives including ln.'),
        simulations: ['stammfunktion-grafisch', 'hauptsatz'],
      },
      {
        code: 'eA-1.3',
        title: L('Vertiefungen', 'Further topics'),
        summary: L('Volumen von Rotationskörpern um die x-Achse, uneigentliche Integrale.', 'Volumes of solids of revolution about the x-axis, improper integrals.'),
        simulations: ['rotationskoerper'],
      },
    ],
  },
  {
    code: 'eA-2',
    title: L('Wachstumsmodelle – Exponentialfunktion (eA)', 'Growth models – exponential function (higher level)'),
    summary: L(
      'Begrenztes und logistisches Wachstum vergleichen, Differentialgleichungen als Modelle, die e-Funktion mit Ableitung, Verknüpfung und Verkettung sowie Exponentialgleichungen.',
      'Comparing limited and logistic growth, differential equations as models, the exponential function with its derivative, combinations and compositions, and exponential equations.',
    ),
    parts: [
      {
        code: 'eA-2.1',
        title: L('Untersuchung von Wachstumsprozessen', 'Investigating growth processes'),
        summary: L('Begrenztes und logistisches Wachstum, asymptotisches Verhalten, Differentialgleichungen.', 'Limited and logistic growth, asymptotic behaviour, differential equations.'),
        simulations: ['grenzverhalten'],
      },
      {
        code: 'eA-2.2',
        title: L('e-Funktion', 'Exponential function e^x'),
        summary: L('Basis e, Ableitungen, Produkt- und Kettenregel, Exponentialgleichungen und Scharparameter.', 'The base e, derivatives, product and chain rules, exponential equations and family parameters.'),
        simulations: ['e-funktion', 'logarithmus'],
      },
    ],
  },
  {
    code: 'eA-3',
    title: L('Raumanschauung und Koordinatisierung (eA)', 'Spatial visualisation and coordinates (higher level)'),
    summary: L(
      'Wie gA, dazu Projektion in die Ebene mit Matrizen, Ebenen in Normalen- und Koordinatenform, Abstände zwischen Punkten, Geraden und Ebenen und der Gauß-Algorithmus.',
      'As at basic level, plus projection onto the plane with matrices, planes in normal and coordinate form, distances between points, lines and planes, and Gaussian elimination.',
    ),
    parts: [
      {
        code: 'eA-3.1',
        title: L('Raumanschauung und Koordinatisierung', 'Spatial visualisation and coordinates'),
        summary: L(
          'Punkte und Vektoren, Vektoroperationen, Kollinearität und Schrägbilder mit Projektionsmatrizen.',
          'Points and vectors, vector operations, collinearity and oblique drawings with projection matrices.',
        ),
        simulations: ['koordinaten-3d', 'vektoren-3d'],
      },
      {
        code: 'eA-3.2',
        title: L('Darstellungsformen', 'Forms of representation'),
        summary: L('Geraden und Ebenen in Parameter-, Normalen- und Koordinatenform.', 'Lines and planes in parametric, normal and coordinate form.'),
        simulations: ['geraden-ebenen'],
      },
      {
        code: 'eA-3.3',
        title: L('Maße und Lagen', 'Measures and positions'),
        summary: L(
          'Abstände, Skalarprodukt, Winkel, Lagebeziehungen von Geraden und Ebenen und der Gauß-Algorithmus.',
          'Distances, dot product, angles, relative positions of lines and planes, and Gaussian elimination.',
        ),
        simulations: ['lage-abstaende', 'skalar-vektorprodukt'],
      },
      {
        code: 'eA-3.4',
        title: L('Fakultative Erweiterungen', 'Optional extensions'),
        summary: L('Vektoren in anderen Zusammenhängen, weitere Abbildungsmatrizen, Kreis- und Kugelgleichung.', 'Vectors in other contexts, further transformation matrices, equations of circles and spheres.'),
        simulations: ['matrix-abbildungen', 'kugeln'],
      },
    ],
  },
  {
    code: 'eA-4',
    title: L('Kurvenanpassung und Funktionsscharen (eA)', 'Curve fitting and families of functions (higher level)'),
    summary: L(
      'Funktionen nach globalen Eigenschaften einordnen und an Daten anpassen, abschnittsweise definierte Funktionen sowie Scharen ganzrationaler und e-Funktionen.',
      'Classifying functions by global properties and fitting them to data, piecewise functions, and families of polynomial and exponential functions.',
    ),
    parts: [
      {
        code: 'eA-4.1',
        title: L('Kurvenanpassung', 'Curve fitting'),
        summary: L(
          'Symmetrie, Verhalten für große |x|, Asymptoten und Periodizität nutzen, Bedingungen aufstellen, Stetigkeit und Differenzierbarkeit.',
          'Using symmetry, behaviour for large |x|, asymptotes and periodicity, setting up conditions, continuity and differentiability.',
        ),
        simulations: ['grenzverhalten'],
      },
      {
        code: 'eA-4.2',
        title: L('Funktionenscharen', 'Families of functions'),
        summary: L('Einfluss des Scharparameters und Anpassung an Eigenschaften.', 'The effect of the family parameter and fitting to properties.'),
        simulations: ['funktionenscharen'],
      },
    ],
  },
  {
    code: 'eA-5',
    title: L('Daten und Zufall (eA)', 'Data and chance (higher level)'),
    summary: L(
      'Wie gA, dazu kausale und stochastische Unabhängigkeit, Normalverteilung, Näherung der Binomialverteilung und Konfidenzintervalle.',
      'As at basic level, plus causal and stochastic independence, the normal distribution, approximating the binomial distribution and confidence intervals.',
    ),
    parts: [
      {
        code: 'eA-5.1',
        title: L('Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit', 'Conditional probability and stochastic independence'),
        summary: L('Baumdiagramm und Vierfeldertafel, kausale und stochastische Unabhängigkeit.', 'Tree diagrams and two-way tables, causal and stochastic independence.'),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem'],
      },
      {
        code: 'eA-5.2',
        title: L('Erwartungswert und Standardabweichung diskreter Zufallsgrößen', 'Expected value and standard deviation of discrete random variables'),
        summary: L('Kenngrößen berechnen und deuten, faire Spiele.', 'Calculating and interpreting measures, fair games.'),
        simulations: ['binomialverteilung'],
      },
      {
        code: 'eA-5.3',
        title: L('Binomialverteilung', 'Binomial distribution'),
        summary: L(
          'Modell, Wahrscheinlichkeiten, Kenngrößen, Histogramme, Prognoseintervalle und Simulationen.',
          'The model, probabilities, measures, histograms, prediction intervals and simulations.',
        ),
        simulations: ['binomialverteilung', 'galtonbrett'],
      },
      {
        code: 'eA-5.4',
        title: L('Normalverteilung', 'Normal distribution'),
        summary: L('Diskrete und stetige Zufallsgrößen, Parameter der Normalverteilung.', 'Discrete and continuous random variables, parameters of the normal distribution.'),
        simulations: ['normalverteilung'],
      },
      {
        code: 'eA-5.5',
        title: L('Binomial- und Normalverteilung', 'Binomial and normal distribution'),
        summary: L('Näherung der Binomialverteilung, σ-Umgebungen und Konfidenzintervalle.', 'Approximating the binomial distribution, sigma intervals and confidence intervals.'),
        simulations: ['normalverteilung', 'galtonbrett'],
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
 * Mathematik am Gymnasium in Niedersachsen (G9) nach den Kerncurricula des
 * Niedersächsischen Kultusministeriums:
 * - „Kerncurriculum für das Gymnasium, Schuljahrgänge 5–10, Mathematik“ (herausgegeben 2015),
 *   Doppelschuljahrgänge 5/6, 7/8, 9/10;
 * - „Kerncurriculum für das Gymnasium – gymnasiale Oberstufe, die Gesamtschule – gymnasiale
 *   Oberstufe, das Berufliche Gymnasium, das Abendgymnasium, das Kolleg: Mathematik“
 *   (herausgegeben 2018), Einführungsphase und Qualifikationsphase.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/niedersachsen-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Doppelschuljahrgänge wie im Kerncurriculum; Einführungsphase = 11,
 * Qualifikationsphase = Doppeljahrgang 12/13 mit den Lernbereichen für gA und eA.
 * Nummern und Codes sind selbst vergeben.
 *
 * Überschriften entsprechen dem Kerncurriculum; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const niedersachsenGymnasiumMathematik: StateCurriculum = {
  id: 'niedersachsen-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('niedersachsen-gymnasium', 'lower-saxony-gymnasium'),
  state: L('Niedersachsen', 'Lower Saxony'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Kerncurriculum',
  grades: [
    grade(5, DOPPELJAHRGANG(5, 6), DJ_5_6),
    grade(6, DOPPELJAHRGANG(5, 6), DJ_5_6),
    grade(7, DOPPELJAHRGANG(7, 8), DJ_7_8),
    grade(8, DOPPELJAHRGANG(7, 8), DJ_7_8),
    grade(9, DOPPELJAHRGANG(9, 10), DJ_9_10),
    grade(10, DOPPELJAHRGANG(9, 10), DJ_9_10),
    grade(11, EF, EF_UNITS),
    grade(12, QPHASE, Q_UNITS),
    grade(13, QPHASE, Q_UNITS),
  ],
};
