import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Ministerium für Bildung Rheinland-Pfalz. Der Rahmenlehrplan Sek. I (2007) nennt keine
 * Internetadresse; der Oberstufenlehrplan (2015) nennt „www.mbwwk.rlp.de“, die Adresse des
 * damaligen Ministeriums. Ein Link zur einzelnen Datei steht in keinem Dokument. Verlinkt ist
 * deshalb die Startseite des heutigen Ministeriums für Bildung.
 */
const SOURCE = 'https://bm.rlp.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/rheinland-pfalz-gymnasium-mathematik.md, Teil E).
const OS = L(
  'Orientierungsstufe (Klassenstufen 5 und 6): Der Rahmenlehrplan beschreibt beide Klassenstufen gemeinsam und ohne Reihenfolge; die Lernbereiche stehen deshalb bei 5 und 6 gleich und werden als eine Stufe gezeigt. Lernbereiche sind die Inhaltsbereiche der Leitideen L1–L5, Unterbereiche ihre Abschnitte; die Nummern sind von uns vergeben. Mit (+) gekennzeichnete Addita sind nicht verbindlich.',
  'Orientation stage (grades 5 and 6): the framework curriculum describes both grades together and in no fixed order, so the units are the same for grades 5 and 6 and are shown as one stage. Units are the content areas of the key ideas L1–L5, sub-units their sections; the numbers are our own. Optional extras marked (+) are not compulsory.',
);

const KS_7_8 = L(
  'Klassenstufen 7 und 8: Der Rahmenlehrplan beschreibt beide Klassenstufen gemeinsam; die Lernbereiche stehen deshalb bei 7 und 8 gleich und werden als eine Stufe gezeigt. Er gilt für alle Schularten und kennzeichnet Inhalte als Basis (B), Erweiterung (E) und Vertiefung (V); V bereitet auf die gymnasiale Oberstufe vor, am Gymnasium gelten also alle drei. Die Nummern sind von uns vergeben.',
  'Grades 7 and 8: the framework curriculum describes both grades together, so the units are the same for grades 7 and 8 and are shown as one stage. It applies to all school types and marks content as basic (B), extension (E) and deepening (V); V prepares for upper secondary, so all three apply at the Gymnasium. The numbers are our own.',
);

const KS_9_10 = L(
  'Klassenstufen 9 und 10 (Mittlerer Schulabschluss): Der Rahmenlehrplan beschreibt beide Klassenstufen gemeinsam; die Lernbereiche stehen deshalb bei 9 und 10 gleich und werden als eine Stufe gezeigt. Am Gymnasium gelten Basis (B), Erweiterung (E) und Vertiefung (V); der eigene Teil „Klassenstufe 9 (Qualifikation der Berufsreife)“ gilt nicht für das Gymnasium und ist nicht abgebildet. Die Nummern sind von uns vergeben.',
  'Grades 9 and 10 (intermediate school certificate): the framework curriculum describes both grades together, so the units are the same for grades 9 and 10 and are shown as one stage. At the Gymnasium basic (B), extension (E) and deepening (V) content apply; the separate part “grade 9 (vocational qualification)” does not apply to the Gymnasium and is not shown. The numbers are our own.',
);

const MSS = L(
  'Mainzer Studienstufe (Jahrgangsstufen 11 bis 13): Der Lehrplan ordnet den Pflichtstoff keinen Schuljahren oder Halbjahren zu; die Lernbereiche stehen deshalb bei 11, 12 und 13 gleich und werden als eine Stufe gezeigt. GF = Grundfach, LF = Leistungsfach. In Linearer Algebra/Analytischer Geometrie (beide Fächer) und in Stochastik 2 (Grundfach) ist je eines der Wahlpflichtgebiete zu behandeln. Die Nummern sind von uns vergeben.',
  'Mainz upper secondary (grades 11 to 13): the curriculum does not assign the compulsory content to school years or half-years, so the units are the same for grades 11, 12 and 13 and are shown as one stage. GF = basic course, LF = advanced course. In linear algebra/analytic geometry (both courses) and in probability 2 (basic course) one of the elective areas is taught. The numbers are our own.',
);

/** Orientierungsstufe, Kap. 6.3. */
const OS_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahl und Zahlbereiche: Natürliche Zahlen', 'Number and number sets: natural numbers'),
    summary: L(
      'Den Zahlenraum über eine Million hinaus erweitern, im Kopf, schriftlich und mit Überschlag rechnen, Terme strukturieren und Teilbarkeit untersuchen.',
      'Extending the number range beyond one million, mental, written and estimated calculation, structuring terms and examining divisibility.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Natürliche Zahlen darstellen', 'Representing natural numbers'),
        summary: L(
          'Große Zahlen lesen und schreiben, das Stellenwertsystem erklären, Zahlen ordnen, runden und am Zahlenstrahl zeigen; Binärsystem als Additum.',
          'Reading and writing large numbers, explaining the place-value system, ordering, rounding and showing numbers on the number line; the binary system as an optional extra.',
        ),
        simulations: ['stellenwerte'],
      },
      {
        code: '1.2',
        title: L('Rechnen mit natürlichen Zahlen', 'Calculating with natural numbers'),
        summary: L(
          'Kopfrechnen und schriftliche Verfahren, einfache Potenzen, Überschlag, Terme mit Rechenbäumen strukturieren, einfache Gleichungen lösen und Rechengesetze nutzen.',
          'Mental and written methods, simple powers, estimating, structuring terms with calculation trees, solving simple equations and using the laws of arithmetic.',
        ),
        simulations: ['zehnerpotenzen', 'termbaum'],
      },
      {
        code: '1.3',
        title: L('Teilbarkeit', 'Divisibility'),
        summary: L(
          'Teilbarkeitsregeln für 2, 3, 4, 5, 9 und 10 anwenden, Primzahlen als Bausteine der natürlichen Zahlen kennenlernen.',
          'Applying divisibility rules for 2, 3, 4, 5, 9 and 10 and meeting prime numbers as the building blocks of natural numbers.',
        ),
        simulations: ['primfaktoren'],
      },
    ],
  },
  {
    code: '2',
    title: L('Zahl und Zahlbereiche: Ganze Zahlen', 'Number and number sets: integers'),
    summary: L(
      'Negative Zahlen aus dem Alltag deuten, an der Zahlengeraden ordnen und Zustandsänderungen berechnen.',
      'Interpreting negative numbers from everyday life, ordering them on the number line and calculating changes of state.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Ganze Zahlen darstellen', 'Representing integers'),
        summary: L(
          'Zahlen mit Vorzeichen in Sachzusammenhängen wie Temperatur oder Kontostand deuten, an der Zahlengeraden ordnen und im Koordinatensystem darstellen.',
          'Interpreting signed numbers in contexts such as temperature or bank balance, ordering them on the number line and plotting them in the coordinate system.',
        ),
        simulations: ['zahlengerade'],
      },
      {
        code: '2.2',
        title: L('Rechnen mit ganzen Zahlen', 'Calculating with integers'),
        summary: L(
          'Sachaufgaben als Änderung von einem Anfangs- zu einem Endzustand lösen, einfache Terme auswerten und Gleichungen lösen; der zweite Operand bleibt positiv.',
          'Solving word problems as a change from a starting state to an end state, evaluating simple terms and solving equations; the second operand stays positive.',
        ),
        simulations: ['zahlengerade', 'termbaum'],
      },
    ],
  },
  {
    code: '3',
    title: L('Zahl und Zahlbereiche: Bruchzahlen', 'Number and number sets: fractions'),
    summary: L(
      'Einen tragfähigen Bruchbegriff aufbauen, Bruchzahlen in Bruch-, Dezimal- und Prozentschreibweise darstellen und mit positiven Bruchzahlen rechnen.',
      'Building a sound concept of fractions, writing them as fractions, decimals and percentages, and calculating with positive fractions.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Bruchzahlen darstellen', 'Representing fractions'),
        summary: L(
          'Brüche als Maßzahl und Operator deuten, Anteile berechnen, als Bruch, Dezimalbruch und Prozent schreiben, erweitern, kürzen, vergleichen und ordnen.',
          'Interpreting fractions as measures and operators, calculating parts, writing them as fractions, decimals and percentages, expanding, simplifying, comparing and ordering.',
        ),
        simulations: ['bruchteile', 'brueche-vergleichen', 'dezimalbrueche', 'prozentstreifen'],
      },
      {
        code: '3.2',
        title: L('Rechnen mit Bruchzahlen', 'Calculating with fractions'),
        summary: L(
          'Brüche und Dezimalbrüche addieren, subtrahieren, multiplizieren und dividieren, den Bruchoperator als Faktor deuten und in Sachsituationen anwenden.',
          'Adding, subtracting, multiplying and dividing fractions and decimals, reading the fraction operator as a factor and applying it in real contexts.',
        ),
        simulations: ['brueche-rechnen', 'dezimalbrueche'],
      },
    ],
  },
  {
    code: '4',
    title: L('Messen und Größen', 'Measurement and quantities'),
    summary: L(
      'Messen als Vergleichen mit einer Einheit, Länge, Masse, Zeit, Winkel, Fläche und Volumen; Formeln für Rechteck und Quader; Rechnen mit Größen und Maßstab.',
      'Measuring as comparing with a unit: length, mass, time, angle, area and volume; formulas for rectangle and cuboid; calculating with quantities and scale.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Grundprinzip Messen', 'The principle of measuring'),
        summary: L(
          'Längen, Massen, Zeitspannen, Winkel, Flächen und Volumen mit Einheiten messen und schätzen; Umfang und Flächeninhalt des Rechtecks sowie Volumen und Oberfläche des Quaders herleiten.',
          'Measuring and estimating lengths, masses, time spans, angles, areas and volumes with units; deriving perimeter and area of the rectangle and volume and surface area of the cuboid.',
        ),
        simulations: ['winkel-messen', 'umfang-flaeche', 'quader-volumen'],
      },
      {
        code: '4.2',
        title: L('Rechnen mit Größen', 'Calculating with quantities'),
        summary: L(
          'Größen in andere Einheiten umrechnen, mit Vorsilben und Kommaschreibweise umgehen, in Sachsituationen sinnvoll runden, Maßstäbe und Formeln anwenden.',
          'Converting quantities between units, using prefixes and decimal notation, rounding sensibly in real contexts, applying scales and formulas.',
        ),
        simulations: ['einheiten', 'massstab'],
      },
    ],
  },
  {
    code: '5',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Symmetrische Figuren erkennen und erzeugen, Winkel und Kreise zeichnen, Körper und Vierecke beschreiben, Netze und Schrägbilder, Koordinatensystem.',
      'Recognising and creating symmetric figures, drawing angles and circles, describing solids and quadrilaterals, nets and oblique drawings, coordinate system.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Symmetrische Figuren', 'Symmetric figures'),
        summary: L(
          'Achsen- und Drehsymmetrie, parallel und senkrecht, Gerade, Strecke und Abstand, Winkel schätzen, messen und klassifizieren, Kreise zeichnen.',
          'Line and rotational symmetry, parallel and perpendicular, lines, segments and distance, estimating, measuring and classifying angles, drawing circles.',
        ),
        simulations: ['spiegelung', 'koordinaten-lage', 'winkel-messen'],
      },
      {
        code: '5.2',
        title: L('Formen und Beziehungen in Raum und Ebene', 'Shapes and relations in space and the plane'),
        summary: L(
          'Würfel, Quader, Pyramide, Zylinder, Kegel, Kugel und Prisma erkennen, Vierecke beschreiben und zeichnen, Netze und Schrägbilder herstellen, im Koordinatensystem arbeiten.',
          'Recognising cubes, cuboids, pyramids, cylinders, cones, spheres and prisms, describing and drawing quadrilaterals, making nets and oblique drawings, working in the coordinate system.',
        ),
        simulations: ['koerpernetze', 'vierecke', 'koordinaten-lage'],
      },
    ],
  },
  {
    code: '6',
    title: L('Funktionaler Zusammenhang', 'Functional relationships'),
    summary: L(
      'Wird in der Orientierungsstufe nicht eigens unterrichtet: Zahlenfolgen, Terme, Operatormodell, Formeln, Maßstab und Datendarstellungen bereiten die funktionale Sichtweise in den anderen Leitideen vor.',
      'Not taught separately in the orientation stage: sequences, terms, the operator model, formulas, scale and data displays prepare the functional view within the other key ideas.',
    ),
  },
  {
    code: '7',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Abzählen mit Baumdiagrammen sowie Daten erheben, mit Häufigkeiten und Mittelwert auswerten und in Diagrammen darstellen.',
      'Counting with tree diagrams, and collecting data, analysing it with frequencies and the mean and showing it in charts.',
    ),
    parts: [
      {
        code: '7.1',
        title: L('Zählstrategien', 'Counting strategies'),
        summary: L(
          'In konkreten Situationen wie Zahlenschlössern Abzählverfahren entwickeln und im Baumdiagramm darstellen.',
          'Developing counting methods in concrete situations such as combination locks and showing them in tree diagrams.',
        ),
        simulations: ['zaehlprinzip'],
      },
      {
        code: '7.2',
        title: L('Daten', 'Data'),
        summary: L(
          'Datenerhebungen planen und auswerten, absolute und relative Häufigkeit, arithmetisches Mittel, Diagramme lesen und auf Manipulation prüfen.',
          'Planning and analysing surveys, absolute and relative frequency, the arithmetic mean, reading charts and checking them for manipulation.',
        ),
        simulations: ['diagramme', 'boxplot'],
      },
    ],
  },
];

/** Klassenstufen 7 und 8, Kap. 7.4. */
const KS_7_8_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahl und Zahlbereiche: Prozent- und Zinsrechnung', 'Number and number sets: percentages and interest'),
    summary: L(
      'Prozentbegriff, Grundaufgaben mit Grundwert, Prozentsatz und Prozentwert sowie Zinsrechnung, auch in komplexeren Sachsituationen.',
      'The concept of percentage, basic problems with base, rate and percentage value, and interest, also in more complex contexts.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Prozent- und Zinsrechnung', 'Percentages and interest'),
        summary: L(
          'Prozentangaben mit Streifen- und Kreisdiagrammen veranschaulichen, Grundaufgaben lösen, Zinsen berechnen, Prozentpunkte unterscheiden; vermehrter und verminderter Grundwert (E).',
          'Illustrating percentages with bar and pie charts, solving basic problems, calculating interest, distinguishing percentage points; increased and reduced base values (E).',
        ),
        simulations: ['prozentstreifen'],
      },
    ],
  },
  {
    code: '2',
    title: L('Zahl und Zahlbereiche: Rationale Zahlen', 'Number and number sets: rational numbers'),
    summary: L(
      'Negative Bruchzahlen darstellen und ordnen, Betrag, und mit rationalen Zahlen in allen Grundrechenarten rechnen.',
      'Representing and ordering negative fractions, absolute value, and all four operations with rational numbers.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Rationale Zahlen darstellen', 'Representing rational numbers'),
        summary: L(
          'Negative Zahlen im Sachzusammenhang deuten, auf der Zahlengeraden ordnen, als Pfeile darstellen und den Betrag als Abstand von null verstehen.',
          'Interpreting negative numbers in context, ordering them on the number line, showing them as arrows and understanding absolute value as distance from zero.',
        ),
        simulations: ['zahlengerade'],
      },
      {
        code: '2.2',
        title: L('Mit rationalen Zahlen rechnen', 'Calculating with rational numbers'),
        summary: L(
          'Zustandsänderungen berechnen; addieren und subtrahieren auch mit negativem zweitem Operanden, multiplizieren und dividieren, Terme auswerten, Rechengesetze nutzen (E).',
          'Calculating changes of state; adding and subtracting with a negative second operand, multiplying and dividing, evaluating terms, using the laws of arithmetic (E).',
        ),
        simulations: ['zahlengerade', 'termbaum'],
      },
    ],
  },
  {
    code: '3',
    title: L('Messen und Größen', 'Measurement and quantities'),
    summary: L(
      'Flächeninhalte von Parallelogramm, Dreieck, Trapez und Kreis sowie Volumen und Oberfläche gerader Prismen und Zylinder.',
      'Areas of parallelograms, triangles, trapezia and circles, and volume and surface area of right prisms and cylinders.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Berechnungen an ebenen Figuren', 'Calculations with plane figures'),
        summary: L(
          'Flächeninhalte durch Zerlegen und Ergänzen auf bekannte Figuren zurückführen, Formeln herleiten, Kreisumfang und Kreisfläche mit π als Proportionalitätsfaktor bestimmen.',
          'Reducing areas to known figures by dissection and completion, deriving formulas, determining circumference and area of a circle with π as the constant of proportionality.',
        ),
        simulations: ['flaechen-zerlegen', 'kreiszahl-pi'],
      },
      {
        code: '3.2',
        title: L('Berechnungen an Körpern', 'Calculations with solids'),
        summary: L(
          'Volumen und Oberflächeninhalt gerader Prismen und Zylinder bestimmen, das Prinzip Grundfläche mal Höhe herausarbeiten, zusammengesetzte Körper berechnen.',
          'Finding volume and surface area of right prisms and cylinders, working out the principle of base area times height, calculating composite solids.',
        ),
        simulations: ['prisma-zylinder', 'koerpernetze'],
      },
    ],
  },
  {
    code: '4',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Netze und Schrägbilder, Grundkonstruktionen, symmetrische und kongruente Figuren, Winkelsätze und Satz des Thales sowie Kongruenzabbildungen.',
      'Nets and oblique drawings, basic constructions, symmetric and congruent figures, angle theorems and Thales’ theorem, and congruence transformations.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Eigenschaften und Beziehungen geometrischer Objekte', 'Properties and relations of geometric objects'),
        summary: L(
          'Netze und Schrägbilder von Prismen und Zylindern, Mittelsenkrechte und Winkelhalbierende mit Um- und Inkreis, symmetrische Drei- und Vierecke, „Haus der Vierecke“ (E), Dreiecke konstruieren und Kongruenzsätze nutzen.',
          'Nets and oblique drawings of prisms and cylinders, perpendicular and angle bisectors with circumcircle and incircle, symmetric triangles and quadrilaterals, the “house of quadrilaterals” (E), constructing triangles and using congruence criteria.',
        ),
        simulations: ['koerpernetze', 'mittelsenkrechte', 'besondere-linien', 'vierecke', 'dreieckskonstruktion'],
      },
      {
        code: '4.2',
        title: L('Sätze der ebenen Geometrie', 'Theorems of plane geometry'),
        summary: L(
          'Winkelsumme in Dreieck und Viereck, Winkelsätze an Geradenkreuzungen (E), den Satz des Thales begründen und anwenden (E), seine Umkehrung (V).',
          'Angle sum in triangles and quadrilaterals, angle theorems at intersecting lines (E), justifying and applying Thales’ theorem (E), its converse (V).',
        ),
        simulations: ['winkelsumme', 'winkel-geradenkreuzung', 'thales'],
      },
      {
        code: '4.3',
        title: L('Geometrische Abbildungen', 'Geometric transformations'),
        summary: L(
          'Drehungen und Verschiebungen im Koordinatensystem ausführen; Abbildungen nach Achse, Zentrum, Winkel und Pfeil untersuchen, Fixelemente und Kongruenzabbildungen (E).',
          'Performing rotations and translations in the coordinate system; examining transformations by axis, centre, angle and arrow, fixed elements and congruence transformations (E).',
        ),
        simulations: ['spiegelung'],
      },
    ],
  },
  {
    code: '5',
    title: L('Funktionaler Zusammenhang: Zuordnungen und Funktionen', 'Functional relationships: mappings and functions'),
    summary: L(
      'Zuordnungen im Alltag darstellen und deuten, Funktionen als eindeutige Zuordnungen, proportionale, antiproportionale und lineare Funktionen.',
      'Showing and interpreting everyday mappings, functions as unique mappings, proportional, inversely proportional and linear functions.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Grundlagen', 'Basics'),
        summary: L(
          'Zuordnungen in Worten, Tabellen und Graphen darstellen und auf Eindeutigkeit prüfen; eindeutige Zuordnungen als Funktionen mit Funktionsterm (E).',
          'Showing mappings in words, tables and graphs and checking whether they are unique; unique mappings as functions with a function term (E).',
        ),
        simulations: ['funktion-zuordnung'],
      },
      {
        code: '5.2',
        title: L('Besondere Zuordnungen und Funktionen', 'Special mappings and functions'),
        summary: L(
          'Proportionale und antiproportionale Zuordnungen erkennen und mit dem Dreisatz lösen; lineare Funktionen mit Steigung und y-Achsenabschnitt, Graphen als Gerade und Hyperbel (E).',
          'Recognising direct and inverse proportion and solving with the rule of three; linear functions with slope and y-intercept, graphs as straight lines and hyperbolas (E).',
        ),
        simulations: ['proportional', 'lineare-funktion', 'hyperbel', 'funktionsplotter'],
      },
    ],
  },
  {
    code: '6',
    title: L('Funktionaler Zusammenhang: Terme und Gleichungen', 'Functional relationships: terms and equations'),
    summary: L(
      'Terme aufstellen und umformen, lineare Gleichungen und Ungleichungen lösen, Formeln umstellen, Produkte von Summen und binomische Formeln.',
      'Setting up and transforming terms, solving linear equations and inequalities, rearranging formulas, products of sums and binomial formulas.',
    ),
    parts: [
      {
        code: '6.1',
        title: L('Terme und Gleichungen Teil I', 'Terms and equations part I'),
        summary: L(
          'Terme zu Sachproblemen aufstellen und ausrechnen, einfache lineare Gleichungen lösen, auch an Waage und Zahlengerade; Ungleichungen und funktionale Deutung von Termen (E).',
          'Setting up and evaluating terms for real problems, solving simple linear equations, also with a balance and the number line; inequalities and the functional view of terms (E).',
        ),
        simulations: ['termbaum', 'waagemodell', 'gleichungen-grafisch'],
      },
      {
        code: '6.2',
        title: L('Terme und Gleichungen Teil II', 'Terms and equations part II'),
        summary: L(
          'Formeln mit Parametern nach einer Variablen auflösen; Produkte von Summen ausmultiplizieren und binomische Formeln in beide Richtungen nutzen (E).',
          'Solving formulas with parameters for one variable; expanding products of sums and using binomial formulas in both directions (E).',
        ),
        simulations: ['binomische-formeln'],
      },
    ],
  },
  {
    code: '7',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Daten mit Spannweite, Median und Boxplot auswerten, Erhebungen hinterfragen, Wahrscheinlichkeiten aus langen Versuchsreihen schätzen und bei Laplace-Experimenten berechnen.',
      'Analysing data with range, median and box plot, questioning surveys, estimating probabilities from long series of trials and calculating them for Laplace experiments.',
    ),
    parts: [
      {
        code: '7.1',
        title: L('Daten', 'Data'),
        summary: L(
          'Daten grafisch aufbereiten und auswerten, Spannweite, Median und Boxplot, irreführende Darstellungen erkennen und Erhebungen auf Repräsentativität prüfen.',
          'Displaying and analysing data, range, median and box plot, spotting misleading displays and checking surveys for representativeness.',
        ),
        simulations: ['boxplot', 'diagramme'],
      },
      {
        code: '7.2',
        title: L('Zufällige Erscheinungen', 'Random phenomena'),
        summary: L(
          'Einstufige Zufallsexperimente beschreiben, Wahrscheinlichkeiten über relative Häufigkeiten langer Versuchsreihen schätzen, auch mit dem Computer, und Laplace-Wahrscheinlichkeiten berechnen.',
          'Describing single-stage random experiments, estimating probabilities from relative frequencies over long series of trials, also by computer, and calculating Laplace probabilities.',
        ),
        simulations: ['gesetz-grosse-zahlen'],
      },
    ],
  },
];

/** Klassenstufen 9 und 10 (Mittlerer Schulabschluss), Kap. 9.3. */
const KS_9_10_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Zahl und Zahlbereiche', 'Number and number sets'),
    summary: L(
      'Quadratwurzeln und reelle Zahlen, Näherungsverfahren für Wurzeln und π sowie Potenzen mit ganzen und gebrochenen Exponenten, n-te Wurzel und Logarithmus.',
      'Square roots and real numbers, approximation methods for roots and π, and powers with integer and fractional exponents, nth roots and logarithms.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Quadratwurzeln – reelle Zahlen', 'Square roots – real numbers'),
        summary: L(
          'Quadratwurzeln als Umkehrung des Quadrierens bestimmen und abschätzen, Wurzelgesetze anwenden, irrationale und reelle Zahlen einführen (E).',
          'Finding and estimating square roots as the inverse of squaring, applying the laws of roots, introducing irrational and real numbers (E).',
        ),
        simulations: ['quadratwurzel'],
      },
      {
        code: '1.2',
        title: L('Näherungsverfahren', 'Approximation methods'),
        summary: L(
          'Ein Iterationsverfahren für irrationale Wurzeln und eines für π begründen und ausführen, auch mit Software (E); Merkmale eines Algorithmus (V).',
          'Justifying and carrying out an iterative method for irrational roots and one for π, also with software (E); features of an algorithm (V).',
        ),
        simulations: ['quadratwurzel', 'kreiszahl-pi'],
      },
      {
        code: '1.3',
        title: L('Potenzieren und entsprechende Umkehrungen', 'Powers and their inverses'),
        summary: L(
          'Potenzen auf negative und gebrochene Exponenten erweitern, Zehnerpotenzschreibweise, Potenzgesetze, n-te Wurzel und Logarithmus als Umkehrungen (E).',
          'Extending powers to negative and fractional exponents, scientific notation, the laws of exponents, nth roots and logarithms as inverses (E).',
        ),
        simulations: ['logarithmus'],
      },
    ],
  },
  {
    code: '2',
    title: L('Messen und Größen', 'Measurement and quantities'),
    summary: L(
      'Strahlensätze und Bruchgleichungen, Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Bogenmaß sowie Volumen und Oberfläche von Pyramide, Kegel und Kugel.',
      'Intercept theorems and fractional equations, sine, cosine and tangent in right triangles, radians, and volume and surface area of pyramids, cones and spheres.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Strahlensätze', 'Intercept theorems'),
        summary: L(
          'Streckenverhältnisse bei zentrisch gestreckten Figuren mit den Strahlensätzen berechnen und für Messungen im Gelände nutzen, einfache Bruchgleichungen lösen (E).',
          'Calculating length ratios in centrally enlarged figures with the intercept theorems and using them for measurements outdoors, solving simple fractional equations (E).',
        ),
        simulations: ['strahlensaetze'],
      },
      {
        code: '2.2',
        title: L('Trigonometrische Beziehungen', 'Trigonometric relations'),
        summary: L(
          'Sinus, Kosinus und Tangens als Seitenverhältnisse im rechtwinkligen Dreieck, Beziehungen zwischen ihnen und Sachaufgaben; Sinus- oder Kosinussatz kann exemplarisch erarbeitet werden (E).',
          'Sine, cosine and tangent as side ratios in right triangles, relations between them and word problems; the sine or cosine rule can be worked out as an example (E).',
        ),
        simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'einheitskreis'],
      },
      {
        code: '2.3',
        title: L('Bogenmaß', 'Radians'),
        summary: L(
          'Winkel vom Gradmaß ins Bogenmaß umrechnen und umgekehrt und Sinus, Kosinus und Tangens für Winkel im Bogenmaß angeben (V).',
          'Converting angles between degrees and radians and giving sine, cosine and tangent for angles in radians (V).',
        ),
        simulations: ['einheitskreis'],
      },
      {
        code: '2.4',
        title: L('Berechnungen an Körpern', 'Calculations with solids'),
        summary: L(
          'Volumen und Oberfläche der Pyramide, von Kegel und Kugel (E) berechnen, auch zusammengesetzte Körper; Formeln herleiten, etwa mit dem Satz von Cavalieri (E).',
          'Calculating volume and surface area of pyramids, cones and spheres (E), including composite solids; deriving formulas, for example with Cavalieri’s principle (E).',
        ),
        simulations: ['pyramide-kegel-kugel', 'cavalieri'],
      },
    ],
  },
  {
    code: '3',
    title: L('Raum und Form', 'Space and shape'),
    summary: L(
      'Ähnliche Figuren und zentrische Streckung, die Satzgruppe des Pythagoras sowie Schrägbilder und Netze von Pyramide und Kegel.',
      'Similar figures and central enlargement, the Pythagorean group of theorems, and oblique drawings and nets of pyramids and cones.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Geometrische Abbildungen', 'Geometric transformations'),
        summary: L(
          'Ähnliche Figuren durch Vergrößern und Verkleinern erzeugen, die Wirkung auf Winkel, Längen und Flächeninhalt untersuchen; zentrische Streckung (E), Ähnlichkeitsabbildungen (V).',
          'Creating similar figures by enlarging and reducing, examining the effect on angles, lengths and area; central enlargement (E), similarity transformations (V).',
        ),
        simulations: ['vergroessern'],
      },
      {
        code: '3.2',
        title: L('Satzgruppe des Pythagoras', 'The Pythagorean group of theorems'),
        summary: L(
          'Den Satz des Pythagoras begründen und anwenden, einen Beweis erarbeiten, Umkehrung, Kathetensatz und Höhensatz (E), weiteren Beweis vergleichen (V).',
          'Justifying and applying Pythagoras’ theorem, working out a proof, the converse, the leg theorem and the altitude theorem (E), comparing another proof (V).',
        ),
        simulations: ['pythagoras'],
      },
      {
        code: '3.3',
        title: L('Körper und ihre Darstellungen', 'Solids and their representations'),
        summary: L(
          'Schrägbilder und Netze von Pyramide und Kegel zeichnen und mit dem Körper in Beziehung setzen.',
          'Drawing oblique views and nets of pyramids and cones and relating them to the solid.',
        ),
        simulations: ['pyramide-kegel-kugel'],
      },
    ],
  },
  {
    code: '4',
    title: L('Funktionaler Zusammenhang: Nicht-lineare Funktionen', 'Functional relationships: non-linear functions'),
    summary: L(
      'Quadratische Funktionen, Potenz-, Exponential- und trigonometrische Funktionen in Sachsituationen erkennen, ihre Graphen beschreiben und den Einfluss der Parameter untersuchen.',
      'Recognising quadratic, power, exponential and trigonometric functions in real contexts, describing their graphs and examining the effect of parameters.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Quadratische Funktionen', 'Quadratic functions'),
        summary: L(
          'Parabeln mit Symmetrie, Nullstellen und Scheitelpunkt, Verschieben und Strecken der Normalparabel, Sachsituationen (E); Umkehrung mit Wurzelfunktion (V).',
          'Parabolas with symmetry, zeros and vertex, shifting and stretching the standard parabola, real contexts (E); inversion with the square-root function (V).',
        ),
        simulations: ['quadratische-funktion', 'extremwert-parabel', 'transformationen', 'umkehrfunktion', 'funktionsplotter'],
      },
      {
        code: '4.2',
        title: L('Potenzfunktionen', 'Power functions'),
        summary: L(
          'Graphen von Potenzfunktionen mit natürlichen und ganzzahligen Exponenten mit Symmetrie, Monotonie und Asymptoten beschreiben, f(x) = a(x + b)ᶻ + c (E); Potenzgleichungen (V).',
          'Describing graphs of power functions with natural and integer exponents by symmetry, monotonicity and asymptotes, f(x) = a(x + b)ᶻ + c (E); power equations (V).',
        ),
        simulations: ['potenzfunktionen', 'hyperbel', 'transformationen'],
      },
      {
        code: '4.3',
        title: L('Exponentialfunktionen', 'Exponential functions'),
        summary: L(
          'Wachstums- und Zerfallsprozesse mit Exponentialfunktionen beschreiben, Eigenschaften der Graphen, einfache Exponentialgleichungen lösen (E); Logarithmusfunktion als Umkehrung (V).',
          'Describing growth and decay with exponential functions, properties of the graphs, solving simple exponential equations (E); the logarithmic function as the inverse (V).',
        ),
        simulations: ['exponentielles-wachstum', 'logarithmus', 'umkehrfunktion'],
      },
      {
        code: '4.4',
        title: L('Trigonometrische Funktionen', 'Trigonometric functions'),
        summary: L(
          'Periodische Vorgänge erkennen, Kreisbewegungen mit Sinus- und Kosinusfunktion am Einheitskreis beschreiben, Symmetrie, Nullstellen, Periode (E); im Bogenmaß (V).',
          'Recognising periodic processes, describing circular motion with sine and cosine on the unit circle, symmetry, zeros, period (E); in radians (V).',
        ),
        simulations: ['einheitskreis', 'sinusfunktion'],
      },
    ],
  },
  {
    code: '5',
    title: L('Funktionaler Zusammenhang: Terme und Gleichungen', 'Functional relationships: terms and equations'),
    summary: L(
      'Lineare Gleichungssysteme mit zwei Variablen und quadratische Gleichungen grafisch und rechnerisch lösen und ihre Lösbarkeit untersuchen.',
      'Solving linear systems with two variables and quadratic equations graphically and algebraically and examining their solvability.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Lineare Gleichungssysteme', 'Linear systems of equations'),
        summary: L(
          'Systeme mit zwei Gleichungen und zwei Variablen grafisch und rechnerisch lösen, Lösbarkeit untersuchen, Sachaufgaben (E); einfache Systeme mit drei Variablen (V).',
          'Solving systems of two equations in two variables graphically and algebraically, examining solvability, word problems (E); simple systems in three variables (V).',
        ),
        simulations: ['lgs-grafisch', 'parabel-drei-punkte'],
      },
      {
        code: '5.2',
        title: L('Quadratische Gleichungen', 'Quadratic equations'),
        summary: L(
          'Quadratische Gleichungen grafisch und mit der Lösungsformel lösen, Lösbarkeit mit der Diskriminante untersuchen (E); mit Parameter (V).',
          'Solving quadratic equations graphically and with the quadratic formula, examining solvability with the discriminant (E); with a parameter (V).',
        ),
        simulations: ['gleichungen-grafisch', 'quadratische-funktion'],
      },
    ],
  },
  {
    code: '6',
    title: L('Daten und Zufall', 'Data and chance'),
    summary: L(
      'Statistische Daten mit Vierfeldertafeln darstellen, Wahrscheinlichkeiten zweistufiger Zufallsexperimente mit Baumdiagramm und Pfadregeln bestimmen und Zufall simulieren.',
      'Showing statistical data in two-way tables, finding probabilities of two-stage experiments with tree diagrams and path rules, and simulating chance.',
    ),
    parts: [
      {
        code: '6.1',
        title: L('Daten', 'Data'),
        summary: L(
          'Statistische Daten aus Quellen entnehmen, darstellen und deuten, auch in Vierfeldertafeln.',
          'Taking statistical data from sources, displaying and interpreting it, also in two-way tables.',
        ),
        simulations: ['vierfeldertafel', 'diagramme'],
      },
      {
        code: '6.2',
        title: L('Zufällige Erscheinungen', 'Random phenomena'),
        summary: L(
          'Wahrscheinlichkeiten zweistufiger Zufallsexperimente mit Baumdiagramm und Pfadregeln bestimmen (E) und mit Simulationen ermitteln, etwa nach dem Monte-Carlo-Verfahren (V).',
          'Finding probabilities of two-stage random experiments with tree diagrams and path rules (E) and determining them by simulation, for example with the Monte Carlo method (V).',
        ),
        simulations: ['baumdiagramm', 'geburtstagsproblem', 'ziegenproblem', 'monte-carlo-pi'],
      },
    ],
  },
];

/** Mainzer Studienstufe, Grundfach (S. 20–36) und Leistungsfach (S. 37–56). */
const MSS_UNITS: CurriculumUnit[] = [
  {
    code: 'GF-1',
    title: L('Grenzwerte (Grundfach)', 'Limits (basic course)'),
    summary: L(
      'Zahlenfolgen explizit und rekursiv beschreiben, eine inhaltliche Vorstellung vom Grenzwert gewinnen, Grenzwertsätze anwenden und Grenzwerte bestimmen.',
      'Describing sequences explicitly and recursively, gaining an intuitive idea of a limit, applying limit laws and finding limits.',
    ),
    simulations: ['grenzverhalten'],
  },
  {
    code: 'GF-2',
    title: L('Differentialrechnung (Grundfach)', 'Differential calculus (basic course)'),
    summary: L(
      'Ableitung als Grenzwert von Sekantensteigungen und momentane Änderungsrate, Ableitungsregeln, Ableitungsgraph skizzieren, Monotonie und Extrema, ganzrationale Funktionen auch mit Parametern untersuchen und bestimmen, Extremwertaufgaben.',
      'The derivative as the limit of secant slopes and as the instantaneous rate of change, differentiation rules, sketching the derivative graph, monotonicity and extrema, analysing and finding polynomial functions, also with parameters, optimisation problems.',
    ),
    simulations: [
      'sekante-tangente',
      'ableitungsfunktion',
      'kurvendiskussion',
      'ganzrationale-funktionen',
      'parabel-drei-punkte',
      'funktionenscharen',
      'extremwertprobleme',
      'funktionsplotter',
    ],
  },
  {
    code: 'GF-3',
    title: L('Integralrechnung (Grundfach)', 'Integral calculus (basic course)'),
    summary: L(
      'Flächen mit Rechtecksummen annähern, das Integral als rekonstruierten Bestand deuten, Integrationsregeln, Hauptsatz und Stammfunktionen, Sachaufgaben bis zum Volumen von Rotationskörpern.',
      'Approximating areas with rectangle sums, reading the integral as a reconstructed total, integration rules, the fundamental theorem and antiderivatives, applications up to the volume of solids of revolution.',
    ),
    simulations: ['ober-untersummen', 'hauptsatz', 'stammfunktion-grafisch', 'aenderungsrate', 'rotationskoerper'],
  },
  {
    code: 'GF-4',
    title: L('Exponentialfunktionen (Grundfach)', 'Exponential functions (basic course)'),
    summary: L(
      'Die e-Funktion, f(x) = a · eᵏˣ und ihre Ableitung, ln als Umkehrung der e-Funktion sowie Sachaufgaben zu Wachstum und Zerfall.',
      'The natural exponential function, f(x) = a · eᵏˣ and its derivative, ln as the inverse of the exponential function, and growth and decay problems.',
    ),
    simulations: ['e-funktion', 'logarithmus', 'umkehrfunktion'],
  },
  {
    code: 'GF-5',
    title: L('Lineare Algebra/Analytische Geometrie (Grundfach)', 'Linear algebra/analytic geometry (basic course)'),
    summary: L(
      'Gemeinsamer Kern: lineare Gleichungssysteme aufstellen und lösen, mit Vektoren rechnen; dann eines der beiden Wahlpflichtgebiete.',
      'Common core: setting up and solving linear systems and calculating with vectors; then one of the two elective areas.',
    ),
    parts: [
      {
        code: 'GF-5.1',
        title: L('Wahlpflichtgebiet A1: Matrizen in praktischen Anwendungen', 'Elective A1: matrices in practical applications'),
        summary: L(
          'Matrizen mit Vektoren und miteinander multiplizieren, Potenzen und Inverse, Anwendungen wie Produktionsprozesse und Übergänge; exemplarisch Matrizen als geometrische Abbildungen.',
          'Multiplying matrices with vectors and with each other, powers and inverses, applications such as production processes and transitions; matrices as geometric transformations as an example.',
        ),
        simulations: ['matrix-abbildungen'],
      },
      {
        code: 'GF-5.2',
        title: L('Wahlpflichtgebiet A2: Geraden und Ebenen im Raum', 'Elective A2: lines and planes in space'),
        summary: L(
          'Linearkombination, Geraden und Ebenen in Parameterform, ihre gegenseitige Lage, Zeichnen im Koordinatensystem, Skalarprodukt und Normalengleichung der Ebene.',
          'Linear combination, lines and planes in parametric form, their relative position, drawing in the coordinate system, the dot product and the normal equation of a plane.',
        ),
        simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt', 'geraden-ebenen', 'lage-abstaende'],
      },
    ],
  },
  {
    code: 'GF-6',
    title: L('Stochastik 1 (Grundfach)', 'Probability and statistics 1 (basic course)'),
    summary: L(
      'Wahrscheinlichkeiten bestimmen und deuten, Pfadregeln und Unabhängigkeit, Zufallsexperimente mit Zufallszahlen simulieren, Bernoullikette und Binomialverteilung mit Erwartungswert und Standardabweichung.',
      'Finding and interpreting probabilities, path rules and independence, simulating random experiments with random numbers, Bernoulli chains and the binomial distribution with expected value and standard deviation.',
    ),
    simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'geburtstagsproblem', 'galtonbrett', 'binomialverteilung'],
  },
  {
    code: 'GF-7',
    title: L('Stochastik 2 (Grundfach)', 'Probability and statistics 2 (basic course)'),
    summary: L(
      'Beurteilende Statistik in einem der beiden Wahlpflichtgebiete: Konfidenzintervalle oder Hypothesentests.',
      'Inferential statistics in one of the two elective areas: confidence intervals or hypothesis tests.',
    ),
    parts: [
      {
        code: 'GF-7.1',
        title: L('Wahlpflichtgebiet B1: Schätzen von Wahrscheinlichkeiten', 'Elective B1: estimating probabilities'),
        summary: L(
          'Binomialwahrscheinlichkeiten mit der Standard-Normalverteilung annähern, Konfidenzintervalle für eine unbekannte Wahrscheinlichkeit bestimmen und ihre Länge mit dem Stichprobenumfang vergleichen.',
          'Approximating binomial probabilities with the standard normal distribution, finding confidence intervals for an unknown probability and relating their length to the sample size.',
        ),
        simulations: ['normalverteilung', 'binomialverteilung'],
      },
      {
        code: 'GF-7.2',
        title: L('Wahlpflichtgebiet B2: Testen von Hypothesen', 'Elective B2: testing hypotheses'),
        summary: L(
          'Das Vorgehen beim Hypothesentest verstehen, Fehlentscheidungen und ihre Wahrscheinlichkeiten bestimmen und einen Test zu einem Sachproblem entwerfen.',
          'Understanding the procedure of a hypothesis test, finding wrong decisions and their probabilities and designing a test for a real problem.',
        ),
        simulations: ['signifikanztest'],
      },
    ],
  },
  {
    code: 'LF-1',
    title: L('Grenzwerte (Leistungsfach)', 'Limits (advanced course)'),
    summary: L(
      'Folgen und Funktionen auf Monotonie und Beschränktheit untersuchen, Grenzwerte für x → ±∞ und x → x₀, Stetigkeit, Grenzwertsätze beweisen und anwenden.',
      'Examining sequences and functions for monotonicity and boundedness, limits as x → ±∞ and x → x₀, continuity, proving and applying limit laws.',
    ),
    simulations: ['grenzverhalten', 'polstellen-asymptoten'],
  },
  {
    code: 'LF-2',
    title: L('Differentialrechnung (Leistungsfach)', 'Differential calculus (advanced course)'),
    summary: L(
      'Wie im Grundfach, zusätzlich Differenzierbarkeit, Beweise von Ableitungsregeln und Kriterien, Ableitungsgraph in beide Richtungen und ein Iterationsverfahren zur Nullstellenbestimmung.',
      'As in the basic course, plus differentiability, proofs of rules and criteria, derivative graphs in both directions and an iterative method for finding zeros.',
    ),
    simulations: [
      'sekante-tangente',
      'ableitungsfunktion',
      'kurvendiskussion',
      'ganzrationale-funktionen',
      'parabel-drei-punkte',
      'funktionenscharen',
      'extremwertprobleme',
      'newton-verfahren',
      'funktionsplotter',
    ],
  },
  {
    code: 'LF-3',
    title: L('Integralrechnung (Leistungsfach)', 'Integral calculus (advanced course)'),
    summary: L(
      'Rechtecksummen und eine Definition des Integrals, Integralfunktion und Stammfunktion, Hauptsatz mit Beweis, ein numerisches Verfahren und Sachaufgaben bis zu Rotationskörpern.',
      'Rectangle sums and a definition of the integral, integral function and antiderivative, the fundamental theorem with proof, a numerical method and applications up to solids of revolution.',
    ),
    simulations: ['ober-untersummen', 'hauptsatz', 'stammfunktion-grafisch', 'aenderungsrate', 'rotationskoerper'],
  },
  {
    code: 'LF-4',
    title: L('Weiterführung der Differential- und Integralrechnung (Leistungsfach)', 'Further differential and integral calculus (advanced course)'),
    summary: L(
      'Produkt-, Quotienten- und Kettenregel, gebrochen-rationale Funktionen, Ableitung von Sinus, Kosinus und Tangens, e-Funktion und ln, Substitution und partielle Integration sowie Beispiele für Differentialgleichungen.',
      'Product, quotient and chain rules, rational functions, derivatives of sine, cosine and tangent, the exponential function and ln, substitution and integration by parts, and examples of differential equations.',
    ),
    simulations: ['polstellen-asymptoten', 'e-funktion', 'logarithmus', 'umkehrfunktion'],
  },
  {
    code: 'LF-5',
    title: L('Lineare Algebra/Analytische Geometrie (Leistungsfach)', 'Linear algebra/analytic geometry (advanced course)'),
    summary: L(
      'Gemeinsamer Kern: Gleichungssysteme mit Gauß-Verfahren, Vektoralgebra mit linearer Abhängigkeit und Skalarprodukt; dann eines der beiden Wahlpflichtgebiete.',
      'Common core: linear systems with Gaussian elimination, vector algebra with linear dependence and the dot product; then one of the two elective areas.',
    ),
    parts: [
      {
        code: 'LF-5.1',
        title: L('Wahlpflichtgebiet A1: Vektoren und Matrizen', 'Elective A1: vectors and matrices'),
        summary: L(
          'Vektoralgebra und Skalarprodukt, Matrizenoperationen, affine Abbildungen mit Fixelementen und Invarianten, Kongruenz- und Ähnlichkeitsabbildungen sowie nichtgeometrische Anwendungen von Matrizen.',
          'Vector algebra and the dot product, matrix operations, affine transformations with fixed elements and invariants, congruence and similarity transformations, and non-geometric applications of matrices.',
        ),
        simulations: ['vektoren-3d', 'skalar-vektorprodukt', 'matrix-abbildungen'],
      },
      {
        code: 'LF-5.2',
        title: L('Wahlpflichtgebiet A2: Geraden und Ebenen im Raum', 'Elective A2: lines and planes in space'),
        summary: L(
          'Geraden und Ebenen in Parameter- und Normalenform, Lagebeziehungen mit Begründung, Hessesche Normalenform, Winkel und Abstände, Kreis- und Kugelgleichung sowie Vektorprodukt.',
          'Lines and planes in parametric and normal form, relative positions with justification, the Hesse normal form, angles and distances, equations of circles and spheres, and the cross product.',
        ),
        simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt', 'geraden-ebenen', 'lage-abstaende', 'kugeln'],
      },
    ],
  },
  {
    code: 'LF-6',
    title: L('Stochastik (Leistungsfach)', 'Probability and statistics (advanced course)'),
    summary: L(
      'Rechenregeln und Simulationen, bedingte Wahrscheinlichkeit und Unabhängigkeit, Zufallsgrößen mit Erwartungswert und Streuung, Binomialverteilung, Näherung durch die Normalverteilung, Konfidenzintervalle und Hypothesentests.',
      'Rules and simulations, conditional probability and independence, random variables with expected value and spread, the binomial distribution, approximation by the normal distribution, confidence intervals and hypothesis tests.',
    ),
    simulations: [
      'vierfeldertafel',
      'bedingte-wahrscheinlichkeit',
      'ziegenproblem',
      'geburtstagsproblem',
      'galtonbrett',
      'binomialverteilung',
      'normalverteilung',
      'signifikanztest',
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
 * Mathematik am Gymnasium in Rheinland-Pfalz (G9, Abitur nach Jahrgangsstufe 13) nach
 * - „Rahmenlehrplan Mathematik (Klassenstufen 5 – 9/10)“, Ministerium für Bildung, Wissenschaft,
 *   Jugend und Kultur Rheinland-Pfalz, Stand Mai 2007 (für alle Schularten der Sek. I), und
 * - „Lehrplan Mathematik, Grund- und Leistungsfach in der gymnasialen Oberstufe (Mainzer
 *   Studienstufe)“, Ministerium für Bildung, Wissenschaft, Weiterbildung und Kultur, Anpassung
 *   an die Bildungsstandards für die allgemeine Hochschulreife, Stand März 2015.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/rheinland-pfalz-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Die Sek. I ist in Doppeljahrgangsstufen 5/6, 7/8 und 9/10 gegliedert,
 * die Oberstufe ordnet den Stoff keinem Jahr zu (Stufe 11–13). Die Nummern sind selbst vergeben.
 *
 * Überschriften entsprechen den Lehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const rheinlandPfalzGymnasiumMathematik: StateCurriculum = {
  id: 'rheinland-pfalz-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('rheinland-pfalz-gymnasium', 'rhineland-palatinate-gymnasium'),
  state: L('Rheinland-Pfalz', 'Rhineland-Palatinate'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Rahmenlehrplan und Lehrplan',
  grades: [
    grade(5, OS, OS_UNITS),
    grade(6, OS, OS_UNITS),
    grade(7, KS_7_8, KS_7_8_UNITS),
    grade(8, KS_7_8, KS_7_8_UNITS),
    grade(9, KS_9_10, KS_9_10_UNITS),
    grade(10, KS_9_10, KS_9_10_UNITS),
    grade(11, MSS, MSS_UNITS),
    grade(12, MSS, MSS_UNITS),
    grade(13, MSS, MSS_UNITS),
  ],
};
