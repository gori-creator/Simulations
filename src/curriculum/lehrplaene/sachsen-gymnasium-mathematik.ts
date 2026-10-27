import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Landesamt für Schule und Bildung (LaSuB). Der Lehrplan nennt im Impressum
 * „https://www.lasub.smk.sachsen.de/“; ein Link zur einzelnen PDF-Datei steht nicht darin.
 */
const SOURCE = 'https://www.lasub.smk.sachsen.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/sachsen-gymnasium-mathematik.md, Teil E).
const KLASSE = L(
  'Der Lehrplan ordnet die Lernbereiche genau dieser Klassenstufe zu (Sachsen, Gymnasium bis Klasse 12). Die Nummern der Lernbereiche stammen aus dem Lehrplan; Wahlbereiche sind wahlweise zu unterrichten und hier mit W1–W3 bezeichnet.',
  'The curriculum assigns these units to exactly this grade (Saxony, Gymnasium up to grade 12). The unit numbers are the curriculum’s; optional areas (“Wahlbereiche”) are labelled W1–W3 here.',
);

const OBERSTUFE = L(
  'Jahrgangsstufen 11/12: Der Lehrplan beschreibt Grundkurs und Leistungskurs jeweils für beide Jahre gemeinsam, deshalb stehen sie als eine Stufe 11/12. GK- und LK-Codes sind von uns, die Nummern danach stammen aus dem Lehrplan; W kennzeichnet Wahlbereiche.',
  'Grades 11/12: the curriculum describes the basic and the advanced course for both years together, so they are shown as one stage 11/12. The GK/LK prefixes are ours; the numbers after them are the curriculum’s; W marks optional areas.',
);

/** Klassenstufe 5. */
const K5: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Arbeiten mit natürlichen Zahlen', 'Working with natural numbers'),
    summary: L(
      'Natürliche Zahlen darstellen, runden und ordnen, sicher rechnen, potenzieren, Teiler, Primzahlen und Teilbarkeitsregeln.',
      'Representing, rounding and ordering natural numbers, calculating confidently, powers, divisors, prime numbers and divisibility rules.',
    ),
    simulations: ['stellenwerte', 'termbaum', 'zehnerpotenzen', 'primfaktoren'],
  },
  {
    code: '2',
    title: L('Gemeine Brüche und Dezimalzahlen', 'Fractions and decimals'),
    summary: L(
      'Brüche an Figuren und am Zahlenstrahl darstellen, kürzen und erweitern, zwischen Bruch, Dezimalzahl und Prozent wechseln und mit Dezimalzahlen rechnen.',
      'Showing fractions on figures and the number line, simplifying and expanding, switching between fractions, decimals and percentages, and calculating with decimals.',
    ),
    simulations: ['bruchteile', 'brueche-vergleichen'],
  },
  {
    code: '3',
    title: L('Lagebeziehungen geometrischer Objekte', 'Relative positions of geometric objects'),
    summary: L(
      'Punkte im Koordinatensystem, parallele und senkrechte Geraden, Winkel messen und Winkelpaare an Geraden, Symmetrie und Geradenspiegelung.',
      'Points in the coordinate system, parallel and perpendicular lines, measuring angles and angle pairs at lines, symmetry and line reflection.',
    ),
    simulations: ['koordinaten-lage', 'winkel-messen', 'winkel-geradenkreuzung', 'spiegelung'],
  },
  {
    code: '4',
    title: L('Rechtecke und Quader', 'Rectangles and cuboids'),
    summary: L(
      'Umfang und Flächeninhalt von Rechtecken, Quader in Schrägbild und Netz darstellen, Oberfläche und Volumen von Quadern mit ihren Einheiten.',
      'Perimeter and area of rectangles, drawing cuboids as oblique drawings and nets, surface area and volume of cuboids with their units.',
    ),
    simulations: ['umfang-flaeche', 'koerpernetze', 'quader-volumen', 'einheiten'],
  },
  {
    code: '5',
    title: L('Vernetzung: Mathematik im Alltag', 'Connections: mathematics in everyday life'),
    summary: L(
      'Sachaufgaben mit Größen lösen, Einheiten umrechnen, sinnvoll runden und ein Problem in Teilschritte zerlegen.',
      'Solving word problems with quantities, converting units, rounding sensibly and breaking a problem into steps.',
    ),
    simulations: ['einheiten'],
  },
  {
    code: 'W1',
    title: L('Dynamisieren geometrischer Objekte (Wahlbereich)', 'Dynamic geometry (optional)'),
    summary: L('Figuren mit dynamischer Geometriesoftware darstellen und bewegen.', 'Drawing and moving figures with dynamic geometry software.'),
  },
  {
    code: 'W2',
    title: L('Mathematische Puzzles und Spiele (Wahlbereich)', 'Mathematical puzzles and games (optional)'),
    summary: L('Lege-, Strategie- und Zufallsspiele untersuchen.', 'Investigating puzzles, strategy games and games of chance.'),
  },
  {
    code: 'W3',
    title: L('Zählen und Rechnen – einst und jetzt (Wahlbereich)', 'Counting and calculating – then and now (optional)'),
    summary: L('Zahlschreibweisen anderer Kulturen und Rechnen in anderen Stellenwertsystemen.', 'Number systems of other cultures and calculating in other bases.'),
  },
];

/** Klassenstufe 6. */
const K6: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Arbeiten mit gebrochenen Zahlen', 'Working with fractions'),
    summary: L(
      'Brüche und Dezimalzahlen, auch periodische, darstellen, mit ihnen nach den Rechengesetzen rechnen und Sachaufgaben lösen.',
      'Representing fractions and decimals, including recurring ones, calculating with them using the laws of arithmetic and solving word problems.',
    ),
    simulations: ['dezimalbrueche', 'brueche-rechnen', 'brueche-vergleichen', 'bruchteile', 'termbaum'],
  },
  {
    code: '2',
    title: L('Zuordnungen in der Umwelt', 'Relationships in everyday life'),
    summary: L(
      'Eindeutige und mehrdeutige Zuordnungen in Tabelle, Diagramm und Pfeildarstellung; direkt und indirekt proportionale Zuordnungen mit Dreisatz.',
      'Unique and non-unique relationships in tables, diagrams and arrow diagrams; direct and inverse proportionality with the rule of three.',
    ),
    simulations: ['proportional', 'funktion-zuordnung'],
  },
  {
    code: '3',
    title: L('Dreiecke und Vierecke', 'Triangles and quadrilaterals'),
    summary: L(
      'Innenwinkelsatz beweisen, Kongruenzsätze für Konstruktionen, besondere Linien im Dreieck, Umfang und Flächeninhalt von Dreiecken und Vierecken und das Haus der Vierecke.',
      'Proving the angle sum theorem, congruence theorems for constructions, special lines in a triangle, perimeter and area of triangles and quadrilaterals, and classifying quadrilaterals.',
    ),
    simulations: ['winkelsumme', 'dreieckskonstruktion', 'besondere-linien', 'mittelsenkrechte', 'flaechen-zerlegen', 'vierecke'],
  },
  {
    code: '4',
    title: L('Prismen', 'Prisms'),
    summary: L(
      'Prismen in Kavalierperspektive und als Netz darstellen, Oberfläche und Volumen gerader Prismen berechnen.',
      'Drawing prisms in cavalier perspective and as nets, calculating surface area and volume of right prisms.',
    ),
    simulations: ['koerpernetze', 'prisma-zylinder'],
  },
  {
    code: '5',
    title: L('Vernetzung: Anteile', 'Connections: proportions'),
    summary: L(
      'Anteile als Bruch und in Prozent angeben, in Kreisdiagrammen zeigen und an Flächen und Körpern bestimmen.',
      'Stating parts as fractions and percentages, showing them in pie charts and finding them for areas and solids.',
    ),
    simulations: ['bruchteile', 'prozentstreifen', 'diagramme'],
  },
  {
    code: 'W1',
    title: L('Finden von Vermutungen mit dynamischer Geometrie (Wahlbereich)', 'Finding conjectures with dynamic geometry (optional)'),
    summary: L('Mit Geometriesoftware messen und Zusammenhänge vermuten.', 'Measuring with geometry software and conjecturing relationships.'),
  },
  {
    code: 'W2',
    title: L('Unterhaltsame Geometrie (Wahlbereich)', 'Entertaining geometry (optional)'),
    summary: L('Optische Täuschungen, „unmögliche Figuren“ und Legespiele.', 'Optical illusions, “impossible figures” and tiling puzzles.'),
  },
  {
    code: 'W3',
    title: L('Primzahlen (Wahlbereich)', 'Prime numbers (optional)'),
    summary: L('Primfaktorzerlegung, Sieb des Eratosthenes und die unendliche Menge der Primzahlen.', 'Prime factorisation, the sieve of Eratosthenes and the infinitude of primes.'),
    simulations: ['primfaktoren'],
  },
];

/** Klassenstufe 7. */
const K7: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Geometrie in der Ebene', 'Plane geometry'),
    summary: L(
      'Kreis und Gerade, Inkreis und Umkreis, Winkelsätze am Kreis und Satz des Thales; Konstruktions- und Beweisaufgaben lösen.',
      'Circles and lines, incircle and circumcircle, angle theorems in circles and Thales’ theorem; solving construction and proof problems.',
    ),
    simulations: ['thales', 'mittelsenkrechte', 'besondere-linien', 'dreieckskonstruktion'],
  },
  {
    code: '2',
    title: L('Arbeiten mit rationalen Zahlen', 'Working with rational numbers'),
    summary: L(
      'Negative Zahlen darstellen und ordnen, mit rationalen Zahlen rechnen, potenzieren und Quadratwurzeln ziehen, lineare Gleichungen lösen und Prozentrechnung.',
      'Representing and ordering negative numbers, calculating with rational numbers, powers and square roots, solving linear equations and percentages.',
    ),
    simulations: ['zahlengerade', 'termbaum', 'waagemodell', 'quadratwurzel', 'prozentstreifen', 'diagramme'],
  },
  {
    code: '3',
    title: L('Darstellen und Berechnen von Prismen und Pyramiden', 'Drawing and calculating prisms and pyramids'),
    summary: L(
      'Prismen und Pyramiden im Schrägbild, Zweitafelbild und Netz; Oberfläche, Volumen und Masse von Pyramiden und zusammengesetzten Körpern.',
      'Prisms and pyramids in oblique and two-view drawings and as nets; surface area, volume and mass of pyramids and composite solids.',
    ),
    simulations: ['koerpernetze', 'pyramide-kegel-kugel'],
  },
  {
    code: '4',
    title: L('Vernetzung: Darstellen von Daten', 'Connections: presenting data'),
    summary: L('Statistische Daten in Säulen-, Linien- und Kreisdiagrammen darstellen und auswerten.', 'Presenting and evaluating statistical data in bar, line and pie charts.'),
    simulations: ['diagramme'],
  },
  {
    code: 'W1',
    title: L('Tabellenkalkulation – ein mathematisches Werkzeug (Wahlbereich)', 'Spreadsheets as a mathematical tool (optional)'),
    summary: L('Formeln, Bezüge und Diagramme in der Tabellenkalkulation.', 'Formulas, references and charts in spreadsheets.'),
  },
  {
    code: 'W2',
    title: L('Maßstäbe und ihre Anwendungen (Wahlbereich)', 'Scales and their applications (optional)'),
    summary: L('Vergrößern und Verkleinern, Größen mit dem Maßstab umrechnen, maßstäblich zeichnen.', 'Enlarging and reducing, converting quantities with a scale, drawing to scale.'),
    simulations: ['massstab'],
  },
  {
    code: 'W3',
    title: L('Platonische Körper (Wahlbereich)', 'Platonic solids (optional)'),
    summary: L('Reguläre Polyeder und der Euler’sche Polyedersatz.', 'Regular polyhedra and Euler’s polyhedron formula.'),
  },
];

/** Klassenstufe 8. */
const K8: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Arbeiten mit Termen und Gleichungen', 'Working with terms and equations'),
    summary: L(
      'Struktur von Termen erkennen, Terme und lineare Gleichungen ohne Hilfsmittel umformen, binomische Formeln und ein Einblick in Ungleichungen.',
      'Recognising the structure of terms, transforming terms and linear equations by hand, binomial formulas and an introduction to inequalities.',
    ),
    simulations: ['binomische-formeln'],
  },
  {
    code: '2',
    title: L('Zufallsversuche', 'Random experiments'),
    summary: L(
      'Ergebnisse, Ereignisse und relative Häufigkeiten, Laplace-Wahrscheinlichkeit, mehrstufige Versuche mit Urnenmodell, Baumdiagramm und Pfadregeln sowie die Produktregel beim Abzählen.',
      'Outcomes, events and relative frequencies, Laplace probability, multi-stage experiments with urn models, tree diagrams and path rules, and the product rule for counting.',
    ),
    simulations: ['gesetz-grosse-zahlen', 'baumdiagramm', 'zaehlprinzip', 'geburtstagsproblem'],
  },
  {
    code: '3',
    title: L('Funktionen und lineare Gleichungssysteme', 'Functions and linear systems'),
    summary: L(
      'Funktionsbegriff und Eigenschaften, lineare Funktionen mit Anstieg und Nullstelle, lineare Regression sowie Gleichungssysteme mit zwei Unbekannten grafisch und rechnerisch lösen.',
      'The concept and properties of functions, linear functions with slope and zero, linear regression, and solving systems with two unknowns graphically and algebraically.',
    ),
    simulations: ['funktion-zuordnung', 'lineare-funktion', 'funktionsplotter', 'lgs-grafisch'],
  },
  {
    code: '4',
    title: L('Ähnlichkeit', 'Similarity'),
    summary: L(
      'Zentrische Streckung, Hauptähnlichkeitssatz und Längen, Flächen und Volumina ähnlicher Figuren berechnen.',
      'Enlargement, the main similarity theorem and calculating lengths, areas and volumes of similar figures.',
    ),
    simulations: ['strahlensaetze', 'vergroessern'],
  },
  {
    code: '5',
    title: L('Vernetzung: Heuristische Strategien', 'Connections: problem-solving strategies'),
    summary: L('Vorwärts- und Rückwärtsarbeiten, Lösungspläne aufstellen und Lösungswege darstellen.', 'Working forwards and backwards, making solution plans and presenting solutions.'),
  },
  {
    code: 'W1',
    title: L('Programmierung mathematischer Algorithmen (Wahlbereich)', 'Programming mathematical algorithms (optional)'),
    summary: L('Algorithmen beschreiben und mit Sequenz, Verzweigung und Schleife umsetzen.', 'Describing algorithms and implementing them with sequence, branching and loops.'),
  },
  {
    code: 'W2',
    title: L('Lineare Optimierung (Wahlbereich)', 'Linear optimisation (optional)'),
    summary: L('Optimierungsprobleme grafisch mit einer Zielfunktion lösen.', 'Solving optimisation problems graphically with an objective function.'),
  },
  {
    code: 'W3',
    title: L('Simulation mit Zufallszahlen (Wahlbereich)', 'Simulation with random numbers (optional)'),
    summary: L('Monte-Carlo-Methode: Zufallszahlen erzeugen und Zufallsversuche am Computer simulieren.', 'The Monte Carlo method: generating random numbers and simulating random experiments on the computer.'),
    simulations: ['monte-carlo-pi', 'gesetz-grosse-zahlen'],
  },
];

/** Klassenstufe 9. */
const K9: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Funktionen und Potenzen', 'Functions and powers'),
    summary: L(
      'Potenzen und Wurzeln mit Potenzgesetzen, Potenzfunktionen und quadratische Funktionen mit Parametern, quadratische Gleichungen lösen und einfache Extremwertaufgaben.',
      'Powers and roots with the laws of exponents, power functions and quadratic functions with parameters, solving quadratic equations and simple optimisation problems.',
    ),
    simulations: ['quadratwurzel', 'potenzfunktionen', 'hyperbel', 'quadratische-funktion', 'gleichungen-grafisch', 'extremwert-parabel', 'funktionsplotter'],
  },
  {
    code: '2',
    title: L('Kreise, Kreiszylinder und Kugeln', 'Circles, cylinders and spheres'),
    summary: L(
      'Umfang und Fläche von Kreisen und Kreisteilen, Oberfläche, Volumen und Masse von Zylindern und Kugeln.',
      'Circumference and area of circles and sectors, surface area, volume and mass of cylinders and spheres.',
    ),
    simulations: ['kreiszahl-pi', 'prisma-zylinder', 'pyramide-kegel-kugel'],
  },
  {
    code: '3',
    title: L('Rechtwinklige Dreiecke', 'Right triangles'),
    summary: L(
      'Satz des Pythagoras mit Beweis, Höhen- und Kathetensatz, Sinus, Kosinus und Tangens; Berechnungen auch an Pyramide und Kegel.',
      'Pythagoras’ theorem with proof, the altitude and leg theorems, sine, cosine and tangent; calculations including pyramids and cones.',
    ),
    simulations: ['pythagoras', 'sin-cos-tan-dreieck', 'pyramide-kegel-kugel'],
  },
  {
    code: '4',
    title: L('Auswerten von Daten', 'Evaluating data'),
    summary: L(
      'Modalwert, Median und Mittelwert, Spannweite, Varianz und Standardabweichung, Histogramme sowie Fehler und Manipulationen in der Statistik.',
      'Mode, median and mean, range, variance and standard deviation, histograms, and errors and manipulation in statistics.',
    ),
    simulations: ['boxplot', 'diagramme'],
  },
  {
    code: '5',
    title: L('Vernetzung: Mathematik und moderne Rechentechnik', 'Connections: mathematics and modern computing'),
    summary: L('Rechentechnik beim Problemlösen nutzen und Ergebnisse kritisch werten.', 'Using computers to solve problems and judging the results critically.'),
  },
  {
    code: 'W1',
    title: L('Der goldene Schnitt (Wahlbereich)', 'The golden ratio (optional)'),
    summary: L('Definition, Konstruktion und Vorkommen in Kunst und Architektur.', 'Definition, construction and occurrence in art and architecture.'),
  },
  {
    code: 'W2',
    title: L('Rund um den Pythagoras (Wahlbereich)', 'All about Pythagoras (optional)'),
    summary: L('Geschichte, verschiedene Beweise und pythagoreische Zahlentripel.', 'History, different proofs and Pythagorean triples.'),
    simulations: ['pythagoras'],
  },
  {
    code: 'W3',
    title: L('Baupläne und Bauzeichnungen (Wahlbereich)', 'Building plans and technical drawings (optional)'),
    summary: L('Parallelprojektionen und wahre Größen in Bauzeichnungen.', 'Parallel projections and true sizes in technical drawings.'),
  },
];

/** Klassenstufe 10. */
const K10: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Wachstumsvorgänge und periodische Vorgänge', 'Growth and periodic processes'),
    summary: L(
      'Wachstum und Zerfall mit Exponentialfunktionen beschreiben, Parameter und Regression; periodische Vorgänge mit der Sinusfunktion in Grad- und Bogenmaß.',
      'Describing growth and decay with exponential functions, parameters and regression; periodic processes with the sine function in degrees and radians.',
    ),
    simulations: ['exponentielles-wachstum', 'sinusfunktion', 'einheitskreis', 'transformationen'],
  },
  {
    code: '2',
    title: L('Diskrete Zufallsgrößen', 'Discrete random variables'),
    summary: L(
      'Wahrscheinlichkeitsverteilungen in Stabdiagramm und Histogramm, Erwartungswert, Varianz und Standardabweichung und faire Spiele.',
      'Probability distributions in bar charts and histograms, expected value, variance and standard deviation, and fair games.',
    ),
    simulations: ['galtonbrett'],
  },
  {
    code: '3',
    title: L('Algebraisches Lösen geometrischer Probleme', 'Solving geometric problems algebraically'),
    summary: L(
      'Sinus- und Kosinussatz herleiten und an Dreiecken, Pyramiden und Kegeln anwenden.',
      'Deriving the laws of sines and cosines and applying them to triangles, pyramids and cones.',
    ),
    simulations: ['sinussatz-kosinussatz', 'pyramide-kegel-kugel'],
  },
  {
    code: '4',
    title: L('Funktionale Zusammenhänge', 'Functional relationships'),
    summary: L(
      'Umkehrfunktionen und Logarithmus, Exponentialgleichungen, Verknüpfen und Verketten von Funktionen, wichtige Funktionsgraphen ohne Hilfsmittel und Zahlenfolgen mit Grenzwert.',
      'Inverse functions and logarithms, exponential equations, combining and composing functions, key graphs by hand, and sequences with limits.',
    ),
    simulations: ['umkehrfunktion', 'logarithmus', 'grenzverhalten', 'funktionsplotter'],
  },
  {
    code: '5',
    title: L('Vernetzung: Zinsrechnung', 'Connections: interest'),
    summary: L('Zinsen und Zinseszinsen, Kredit und Tilgung.', 'Simple and compound interest, loans and repayment.'),
    simulations: ['exponentielles-wachstum'],
  },
  {
    code: 'W1',
    title: L('Komplexe Zahlen (Wahlbereich)', 'Complex numbers (optional)'),
    summary: L('Gauß’sche Zahlenebene und Rechnen mit komplexen Zahlen.', 'The complex plane and calculating with complex numbers.'),
  },
  {
    code: 'W2',
    title: L('Logistisches Wachstum (Wahlbereich)', 'Logistic growth (optional)'),
    summary: L('Modell des logistischen Wachstums, explizit und rekursiv, mit seinen Grenzen.', 'The logistic growth model, explicit and recursive, and its limits.'),
  },
  {
    code: 'W3',
    title: L('Kurven in Parameterdarstellung und in Polarkoordinaten (Wahlbereich)', 'Parametric curves and polar coordinates (optional)'),
    summary: L('Kurven mit Parametern und Polarkoordinaten beschreiben.', 'Describing curves with parameters and polar coordinates.'),
  },
];

/** Jahrgangsstufen 11/12, Grundkurs und Leistungskurs. */
const OBERSTUFE_UNITS: CurriculumUnit[] = [
  {
    code: 'GK-1',
    title: L('Differentialrechnung (Grundkurs)', 'Differential calculus (basic course)'),
    summary: L(
      'Grenzwerte und Verhalten im Unendlichen, Ableitung als Sekanten- und Tangentenanstieg, Ableitungsregeln, Kurvendiskussion mit Polstellen und Asymptoten, Funktionsgleichungen aus Bedingungen und Extremwertprobleme.',
      'Limits and behaviour at infinity, the derivative as slope of secant and tangent, rules of differentiation, curve sketching with poles and asymptotes, function equations from conditions and optimisation problems.',
    ),
    simulations: [
      'sekante-tangente',
      'ableitungsfunktion',
      'kurvendiskussion',
      'extremwertprobleme',
      'polstellen-asymptoten',
      'grenzverhalten',
      'ganzrationale-funktionen',
      'e-funktion',
      'parabel-drei-punkte',
    ],
  },
  {
    code: 'GK-2',
    title: L('Matrizen (Grundkurs)', 'Matrices (basic course)'),
    summary: L('Gleichungssysteme in Matrizenschreibweise, Matrizen multiplizieren und ein weiteres Anwendungsbeispiel.', 'Linear systems in matrix notation, multiplying matrices and a further application.'),
    simulations: ['matrix-abbildungen'],
  },
  {
    code: 'GK-3',
    title: L('Vektoren, Geraden und Ebenen (Grundkurs)', 'Vectors, lines and planes (basic course)'),
    summary: L(
      'Räumliches Koordinatensystem, Rechnen mit Vektoren, Geraden und Ebenen in Parameter- und Koordinatenform und ihre Lagebeziehungen.',
      'The 3D coordinate system, calculating with vectors, lines and planes in parametric and coordinate form and their relative positions.',
    ),
    simulations: ['koordinaten-3d', 'vektoren-3d', 'geraden-ebenen', 'lage-abstaende'],
  },
  {
    code: 'GK-4',
    title: L('Binomialverteilte Zufallsgrößen (Grundkurs)', 'Binomially distributed random variables (basic course)'),
    summary: L(
      'Mehrstufige Zufallsexperimente mit Baumdiagramm, Vierfeldertafel und Simulation, Unabhängigkeit, Bernoulli-Ketten und Kenngrößen der Binomialverteilung.',
      'Multi-stage experiments with tree diagrams, two-way tables and simulation, independence, Bernoulli chains and the measures of the binomial distribution.',
    ),
    simulations: ['vierfeldertafel', 'binomialverteilung', 'galtonbrett', 'geburtstagsproblem'],
  },
  {
    code: 'GK-5',
    title: L('Integralrechnung (Grundkurs)', 'Integral calculus (basic course)'),
    summary: L(
      'Stammfunktionen, bestimmtes Integral als rekonstruierter Bestand und Flächeninhalt, Hauptsatz und Flächenberechnung.',
      'Antiderivatives, the definite integral as reconstructed total and area, the fundamental theorem and calculating areas.',
    ),
    simulations: ['ober-untersummen', 'aenderungsrate', 'hauptsatz', 'stammfunktion-grafisch'],
  },
  {
    code: 'GK-6',
    title: L('Beurteilende Statistik (Grundkurs)', 'Inferential statistics (basic course)'),
    summary: L('Parameter schätzen und ein- und zweiseitige Signifikanztests für die Binomialverteilung.', 'Estimating parameters and one- and two-sided significance tests for the binomial distribution.'),
    simulations: ['signifikanztest'],
  },
  {
    code: 'GK-7',
    title: L('Abstände und Winkel (Grundkurs)', 'Distances and angles (basic course)'),
    summary: L('Skalar- und Vektorprodukt, Normalenvektor, Schnittwinkel und Abstände zwischen Punkten und Ebenen.', 'Dot and cross product, normal vectors, angles of intersection and distances between points and planes.'),
    simulations: ['skalar-vektorprodukt', 'lage-abstaende'],
  },
  {
    code: 'GK-8',
    title: L('Weitere Anwendungen (Grundkurs)', 'Further applications (basic course)'),
    summary: L('Extremale Abstände, Spiegelung an Ebenen, Flächeninhalte sowie Funktions- und Geradenscharen.', 'Extremal distances, reflection in planes, areas, and families of functions and lines.'),
    simulations: ['funktionenscharen', 'lage-abstaende'],
  },
  {
    code: 'GK-W1',
    title: L('Kegelschnitte (Wahlbereich Grundkurs)', 'Conic sections (optional, basic course)'),
    summary: L('Kreis, Ellipse, Parabel und Hyperbel als Kegelschnitte; Konstruktion der Ellipse.', 'Circle, ellipse, parabola and hyperbola as conic sections; constructing the ellipse.'),
  },
  {
    code: 'GK-W2',
    title: L('Numerische Verfahren zum Lösen von Gleichungen (Wahlbereich Grundkurs)', 'Numerical methods for solving equations (optional, basic course)'),
    summary: L('Grafische Verfahren, Bisektion und Newton-Verfahren.', 'Graphical methods, bisection and Newton’s method.'),
    simulations: ['newton-verfahren'],
  },
  {
    code: 'GK-W3',
    title: L('Dynamische Systeme und fraktale Strukturen (Wahlbereich Grundkurs)', 'Dynamical systems and fractals (optional, basic course)'),
    summary: L('Räuber-Beute-System und fraktale Strukturen.', 'Predator–prey systems and fractal structures.'),
  },
  {
    code: 'GK-W4',
    title: L('Bedingte Wahrscheinlichkeiten (Wahlbereich Grundkurs)', 'Conditional probability (optional, basic course)'),
    summary: L('Bedingte Wahrscheinlichkeit, Satz von Bayes und stochastische Unabhängigkeit.', 'Conditional probability, Bayes’ theorem and stochastic independence.'),
    simulations: ['bedingte-wahrscheinlichkeit', 'vierfeldertafel', 'ziegenproblem'],
  },
  {
    code: 'GK-W5',
    title: L('Numerische Integrationsverfahren (Wahlbereich Grundkurs)', 'Numerical integration (optional, basic course)'),
    summary: L('Rechteck- und Trapezverfahren.', 'Rectangle and trapezium rules.'),
    simulations: ['ober-untersummen'],
  },
  {
    code: 'GK-W6',
    title: L('Differentialgleichungen (Wahlbereich Grundkurs)', 'Differential equations (optional, basic course)'),
    summary: L('Einfache Differentialgleichungen für Wachstum und Bewegung.', 'Simple differential equations for growth and motion.'),
  },
  {
    code: 'LK-1',
    title: L('Differentialrechnung (Leistungskurs)', 'Differential calculus (advanced course)'),
    summary: L(
      'Wie im Grundkurs, vertieft: Grenzwerte und Stetigkeit, Ableitungsregeln, Kurvendiskussion mit Asymptoten, Funktionsgleichungen aus Bedingungen und Extremwertprobleme.',
      'As in the basic course, in more depth: limits and continuity, rules of differentiation, curve sketching with asymptotes, function equations from conditions and optimisation problems.',
    ),
    simulations: [
      'sekante-tangente',
      'ableitungsfunktion',
      'kurvendiskussion',
      'extremwertprobleme',
      'polstellen-asymptoten',
      'grenzverhalten',
      'ganzrationale-funktionen',
      'e-funktion',
      'parabel-drei-punkte',
    ],
  },
  {
    code: 'LK-2',
    title: L('Matrizen (Leistungskurs)', 'Matrices (advanced course)'),
    summary: L('Gleichungssysteme in Matrizenschreibweise, Matrizen multiplizieren und ein weiteres Anwendungsbeispiel.', 'Linear systems in matrix notation, multiplying matrices and a further application.'),
    simulations: ['matrix-abbildungen'],
  },
  {
    code: 'LK-3',
    title: L('Vektoren, Geraden und Ebenen (Leistungskurs)', 'Vectors, lines and planes (advanced course)'),
    summary: L(
      'Wie im Grundkurs, dazu lineare Abhängigkeit von Vektoren und Schnittgeraden von Ebenen.',
      'As in the basic course, plus linear dependence of vectors and lines of intersection of planes.',
    ),
    simulations: ['koordinaten-3d', 'vektoren-3d', 'geraden-ebenen', 'lage-abstaende'],
  },
  {
    code: 'LK-4',
    title: L('Binomialverteilte Zufallsgrößen (Leistungskurs)', 'Binomially distributed random variables (advanced course)'),
    summary: L(
      'Wie im Grundkurs, dazu Zugänge zum Wahrscheinlichkeitsbegriff, Abzählverfahren, bedingte Wahrscheinlichkeit und Satz von Bayes.',
      'As in the basic course, plus approaches to probability, counting methods, conditional probability and Bayes’ theorem.',
    ),
    simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem', 'binomialverteilung', 'galtonbrett', 'geburtstagsproblem'],
  },
  {
    code: 'LK-5',
    title: L('Integralrechnung (Leistungskurs)', 'Integral calculus (advanced course)'),
    summary: L(
      'Wie im Grundkurs, dazu Integralfunktion, lineare Substitution und Volumen von Rotationskörpern.',
      'As in the basic course, plus the integral function, linear substitution and volumes of solids of revolution.',
    ),
    simulations: ['ober-untersummen', 'aenderungsrate', 'hauptsatz', 'stammfunktion-grafisch', 'rotationskoerper'],
  },
  {
    code: 'LK-6',
    title: L('Normalverteilte Zufallsgrößen (Leistungskurs)', 'Normally distributed random variables (advanced course)'),
    summary: L('Dichte- und Verteilungsfunktion, Kenngrößen und Zusammenhang mit der Binomialverteilung.', 'Density and distribution function, measures and the link to the binomial distribution.'),
    simulations: ['normalverteilung'],
  },
  {
    code: 'LK-7',
    title: L('Beurteilende Statistik (Leistungskurs)', 'Inferential statistics (advanced course)'),
    summary: L('Parameter schätzen und ein- und zweiseitige Signifikanztests für die Binomialverteilung.', 'Estimating parameters and one- and two-sided significance tests for the binomial distribution.'),
    simulations: ['signifikanztest'],
  },
  {
    code: 'LK-8',
    title: L('Abstände und Winkel (Leistungskurs)', 'Distances and angles (advanced course)'),
    summary: L(
      'Skalar- und Vektorprodukt, Hesse’sche Normalenform, Schnittwinkel und alle Abstände zwischen Punkten, Geraden und Ebenen.',
      'Dot and cross product, Hesse normal form, angles of intersection and all distances between points, lines and planes.',
    ),
    simulations: ['skalar-vektorprodukt', 'lage-abstaende'],
  },
  {
    code: 'LK-9',
    title: L('Weitere Anwendungen (Leistungskurs)', 'Further applications (advanced course)'),
    summary: L('Extremale Abstände und Winkel, Spiegelung, begrenzte und unbegrenzte Flächen sowie Scharen.', 'Extremal distances and angles, reflection, bounded and unbounded areas, and families.'),
    simulations: ['funktionenscharen', 'lage-abstaende'],
  },
  {
    code: 'LK-W1',
    title: L('Kegelschnitte (Wahlbereich Leistungskurs)', 'Conic sections (optional, advanced course)'),
    summary: L('Kegelschnitte, Ellipse mit Konstruktion und Tangenten.', 'Conic sections, the ellipse with construction and tangents.'),
  },
  {
    code: 'LK-W2',
    title: L('Numerische Verfahren zum Lösen von Gleichungen (Wahlbereich Leistungskurs)', 'Numerical methods for solving equations (optional, advanced course)'),
    summary: L('Bisektion, Newton-Verfahren und allgemeines Iterationsverfahren.', 'Bisection, Newton’s method and general iteration.'),
    simulations: ['newton-verfahren'],
  },
  {
    code: 'LK-W3',
    title: L('Dynamische Systeme und fraktale Strukturen (Wahlbereich Leistungskurs)', 'Dynamical systems and fractals (optional, advanced course)'),
    summary: L('Räuber-Beute-System, Fraktale, Feigenbaum-Diagramm und Chaos.', 'Predator–prey systems, fractals, the Feigenbaum diagram and chaos.'),
  },
  {
    code: 'LK-W4',
    title: L('Funktionen mit zwei Veränderlichen (Wahlbereich Leistungskurs)', 'Functions of two variables (optional, advanced course)'),
    summary: L('Graphen im Raum, Schnittfiguren und partielle Ableitungen.', 'Graphs in space, cross-sections and partial derivatives.'),
  },
  {
    code: 'LK-W5',
    title: L('Numerische Integrationsverfahren (Wahlbereich Leistungskurs)', 'Numerical integration (optional, advanced course)'),
    summary: L('Rechteck-, Trapez- und Simpson-Verfahren.', 'Rectangle, trapezium and Simpson’s rules.'),
    simulations: ['ober-untersummen'],
  },
  {
    code: 'LK-W6',
    title: L('Differentialgleichungen (Wahlbereich Leistungskurs)', 'Differential equations (optional, advanced course)'),
    summary: L('Differentialgleichungen für Wachstum, Bewegung und den harmonischen Oszillator, Richtungsfeld.', 'Differential equations for growth, motion and the harmonic oscillator, slope fields.'),
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(mathematik, n, units),
});

/**
 * Mathematik am Gymnasium in Sachsen (Abitur nach Klasse 12) nach dem „Lehrplan
 * Gymnasium Mathematik“ des Sächsischen Staatsministeriums für Kultus, Fassung
 * 2004/2009/2011/2013/2019/2021 (in Kraft für Klasse 5–8 ab 01.08.2021, Klasse 9 ab
 * 2022, Klasse 10 ab 2023, Jahrgangsstufe 11 ab 2024, Jahrgangsstufe 12 ab 01.08.2025).
 * Ein Dokument für Sekundarstufe I und gymnasiale Oberstufe.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/sachsen-gymnasium-mathematik.{json,md}.
 * Klassenstufen 5–10 wie im Lehrplan; Jahrgangsstufen 11/12 als eine Stufe (Grund- und
 * Leistungskurs). Codes W…, GK-…, LK-… sind selbst vergeben.
 *
 * Überschriften entsprechen dem Lehrplan; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const sachsenGymnasiumMathematik: StateCurriculum = {
  id: 'sachsen-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('sachsen-gymnasium', 'saxony-gymnasium'),
  state: L('Sachsen', 'Saxony'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Lehrplan',
  grades: [
    grade(5, KLASSE, K5),
    grade(6, KLASSE, K6),
    grade(7, KLASSE, K7),
    grade(8, KLASSE, K8),
    grade(9, KLASSE, K9),
    grade(10, KLASSE, K10),
    grade(11, OBERSTUFE, OBERSTUFE_UNITS),
    grade(12, OBERSTUFE, OBERSTUFE_UNITS),
  ],
};
