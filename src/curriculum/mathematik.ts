import { area, L, planned, topic } from './helpers';
import type { Subject } from './types';

/**
 * Lehrplanstruktur Mathematik.
 *
 * Gegliedert nach Themenbereichen (orientiert an den Leitideen der
 * KMK-Bildungsstandards); innerhalb eines Bereichs sind Themen und
 * Simulationen nach Klassenstufe sortiert. Die Klassenstufen richten sich nach
 * dem LehrplanPLUS für das bayerische Gymnasium (G9). Die genaue Zuordnung zu
 * Jahrgangsstufen und Lernbereichen steht in lehrplaene/bayern-gymnasium-mathematik.ts.
 */
export const mathematik: Subject = {
  id: 'mathematik',
  slug: L('mathematik', 'mathematics'),
  title: L('Mathematik', 'Mathematics'),
  description: L(
    'Zahlen, Terme, Geometrie, Funktionen, Analysis und Stochastik zum Anfassen: Parameter verändern und sofort sehen, was passiert.',
    'Numbers, algebra, geometry, functions, calculus and probability you can touch: change parameters and see what happens instantly.',
  ),
  status: 'active',
  areas: [
    area({
      id: 'zahlen',
      slug: L('zahlen-und-operationen', 'numbers-and-operations'),
      title: L('Zahlen und Operationen', 'Numbers and operations'),
      description: L(
        'Ganze Zahlen, Brüche, Dezimalbrüche, Prozente und Wurzeln anschaulich darstellen und verstehen.',
        'Visualising integers, fractions, decimals, percentages and roots.',
      ),
      kmk: ['M-L1', 'M-K4', 'M-K5'],
      topics: [
        topic('ganze-zahlen', L('Natürliche und ganze Zahlen', 'Natural numbers and integers'), [
          {
            id: 'stellenwerte',
            status: 'ready',
            slug: L('stellenwerte-runden', 'place-value-rounding'),
            title: L('Stellenwertsystem und Runden', 'Place value and rounding'),
            summary: L(
              'Plättchen in der Stellenwerttafel bündeln, große Zahlen in Dreiergruppen lesen und am Zahlenstrahl mit Lupe auf eine wählbare Stelle runden.',
              'Regroup counters in a place value chart, read large numbers in groups of three and round to any place on a number line with a magnifier.',
            ),
            grades: [5, 5],
            kmk: ['M-L1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Stellenwerttafel', 'Stellenwert', 'Zehnersystem', 'Bündeln', 'große Zahlen', 'Million', 'Milliarde', 'Zahlwort', 'Runden', 'Zahlenstrahl', 'Nachbarzahl'],
              ['place value chart', 'place value', 'base ten', 'regrouping', 'large numbers', 'million', 'billion', 'number words', 'rounding', 'number line'],
            ),
            thumb: 'generic',
          },
          {
            id: 'zahlengerade',
            status: 'ready',
            slug: L('ganze-zahlen-zahlengerade', 'integers-number-line'),
            title: L('Ganze Zahlen an der Zahlengeraden addieren und subtrahieren', 'Adding and subtracting integers on the number line'),
            summary: L(
              'Ein Frosch hüpft die Rechnung vor: Plus heißt Blick nach rechts, Minus heißt umdrehen, negativ heißt rückwärts. Dazu Thermometer, Meeresspiegel und Konto.',
              'A frog hops through the calculation: plus means face right, minus means turn around, negative means backwards. With thermometer, sea level and bank account.',
            ),
            grades: [5, 5],
            kmk: ['M-L1', 'M-K4', 'M-K3'],
            keywords: L(
              ['ganze Zahlen', 'negative Zahlen', 'Zahlengerade', 'Pfeilmodell', 'Laufmodell', 'Gegenzahl', 'Betrag', 'Addition', 'Subtraktion', 'Guthaben', 'Schulden', 'Temperatur', 'Meeresspiegel'],
              ['integers', 'negative numbers', 'number line', 'arrow model', 'opposite', 'absolute value', 'addition', 'subtraction', 'credit', 'debt', 'temperature', 'sea level'],
            ),
            thumb: 'generic',
          },
          {
            id: 'primfaktoren',
            status: 'ready',
            slug: L('primfaktoren-teilbarkeit', 'prime-factors-divisibility'),
            title: L('Primfaktorzerlegung und Teilbarkeit', 'Prime factorisation and divisibility'),
            summary: L(
              'Faktorbäume wachsen lassen, Teilbarkeitsregeln prüfen, Primzahlen mit dem Sieb des Eratosthenes finden und ggT und kgV im Mengenbild der Primfaktoren sehen.',
              'Grow factor trees, check divisibility rules, find primes with the sieve of Eratosthenes and see gcd and lcm in a set diagram of prime factors.',
            ),
            grades: [5, 6],
            kmk: ['M-L1', 'M-K1', 'M-K5'],
            keywords: L(
              ['Primzahl', 'Primfaktorzerlegung', 'Faktorbaum', 'Teiler', 'Teilbarkeitsregeln', 'Quersumme', 'Sieb des Eratosthenes', 'ggT', 'kgV', 'Potenz', 'teilerfremd'],
              ['prime number', 'prime factorisation', 'factor tree', 'divisor', 'divisibility rules', 'digit sum', 'sieve of Eratosthenes', 'gcd', 'lcm', 'power', 'coprime'],
            ),
            thumb: 'generic',
          },
          planned('zehnerpotenzen', L('Potenzen, Zehnerpotenzen und Größenordnungen', 'Powers, powers of ten and orders of magnitude'), [5, 6]),
        ]),
        topic('brueche', L('Brüche und Dezimalbrüche', 'Fractions and decimals'), [
          {
            id: 'bruchteile',
            status: 'ready',
            slug: L('bruchteile', 'fractions'),
            title: L('Bruchteile darstellen', 'Representing fractions'),
            summary: L(
              'Pizza, Blechkuchen oder Strecke in gleich große Teile schneiden, Stücke antippen und Brüche erweitern, kürzen und als Dezimalzahl sehen.',
              'Cut a pizza, a sheet cake or a line segment into equal parts, tap pieces and see fractions expanded, reduced and as decimals.',
            ),
            grades: [6, 6],
            kmk: ['M-L1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Bruch', 'Bruchteil', 'Zähler', 'Nenner', 'erweitern', 'kürzen', 'Dezimalbruch', 'periodisch', 'Prozent', 'gemischte Zahl'],
              ['fraction', 'numerator', 'denominator', 'equivalent fractions', 'reduce', 'decimal', 'recurring decimal', 'percentage', 'mixed number'],
            ),
            thumb: 'fraction',
          },
          {
            id: 'brueche-vergleichen',
            status: 'ready',
            slug: L('brueche-erweitern-kuerzen-vergleichen', 'equivalent-fractions-comparing'),
            title: L('Brüche erweitern, kürzen und vergleichen', 'Equivalent fractions and comparing'),
            summary: L(
              'Zwei Brüche als Streifen oder Kreise vergleichen: Beim Gleichnamigmachen werden die Teile sichtbar feiner geschnitten, der Anteil bleibt gleich. Dazu Kürzen mit Gruppen, die Bruchwand und ein Spiel zum Ordnen.',
              'Compare two fractions as bars or circles: finding a common denominator visibly cuts the parts finer while the amount stays the same. Plus reducing with groups, the fraction wall and a game for ordering fractions.',
            ),
            grades: [6, 6],
            kmk: ['M-L1', 'M-K4', 'M-K1'],
            keywords: L(
              ['Bruch', 'erweitern', 'kürzen', 'vergleichen', 'gleichnamig', 'Hauptnenner', 'kgV', 'ggT', 'gleichwertige Brüche', 'Bruchwand', 'Zahlenstrahl', 'ordnen'],
              ['fraction', 'equivalent fractions', 'expand', 'reduce', 'simplify', 'compare', 'common denominator', 'lcm', 'gcd', 'fraction wall', 'number line', 'ordering'],
            ),
            thumb: 'generic',
          },
          {
            id: 'dezimalbrueche',
            status: 'ready',
            slug: L('endliche-periodische-dezimalbrueche', 'terminating-repeating-decimals'),
            title: L('Endliche und periodische Dezimalbrüche', 'Terminating and repeating decimals'),
            summary: L(
              'Schriftlich dividieren auf Karopapier, bis ein Rest wiederkehrt: Restekreis und Zahlenstrahl-Lupe zeigen, warum Perioden entstehen, die Nenner-Tafel, wann ein Bruch endlich ist.',
              'Long division on squared paper until a remainder repeats: a remainder circle and a number line zoom show why periods appear, a table of denominators shows when a fraction terminates.',
            ),
            grades: [6, 6],
            kmk: ['M-L1', 'M-K5', 'M-K1', 'M-K4'],
            keywords: L(
              ['Dezimalbruch', 'endlich', 'periodisch', 'Periode', 'Vorperiode', 'Periodenstrich', 'schriftliche Division', 'Rest', 'Primfaktoren', 'Nenner', 'Zehnerpotenz', 'Stellenwert'],
              ['decimal', 'terminating decimal', 'repeating decimal', 'recurring decimal', 'period', 'long division', 'remainder', 'prime factors', 'denominator', 'power of ten', 'place value'],
            ),
            thumb: 'generic',
          },
          {
            id: 'brueche-rechnen',
            status: 'ready',
            slug: L('brueche-multiplizieren-dividieren', 'multiplying-dividing-fractions'),
            title: L('Brüche multiplizieren und dividieren am Rechteckmodell', 'Multiplying and dividing fractions with area models'),
            summary: L(
              'Im Rechteckmodell überlagern sich zwei Streifen, die Überlappung ist das Produkt – zum Ziehen und Zählen. Beim Dividieren misst ein Streifen, wie oft er hineinpasst; daraus folgt die Kehrwert-Regel.',
              'In the area model two strips overlap and the overlap is the product – drag and count. For division a strip measures how often it fits, which leads to the reciprocal rule.',
            ),
            grades: [6, 6],
            kmk: ['M-L1', 'M-K4', 'M-K1', 'M-K5'],
            keywords: L(
              ['Bruch', 'multiplizieren', 'dividieren', 'Rechteckmodell', 'Flächenmodell', 'von', 'Anteil', 'kürzen', 'über Kreuz kürzen', 'Kehrwert', 'Messen', 'Aufteilen', 'gemeinsamer Nenner'],
              ['fraction', 'multiply', 'divide', 'area model', 'rectangle model', 'of', 'cancel', 'cross-cancel', 'reciprocal', 'measuring', 'quotative division', 'common denominator'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('prozente', L('Prozentrechnung', 'Percentages'), [
          {
            id: 'prozentstreifen',
            status: 'ready',
            slug: L('prozentstreifen', 'percentage-bar'),
            title: L('Prozentstreifen', 'Percentage bar'),
            summary: L(
              'Grundwert, Prozentsatz und Prozentwert am Prozentstreifen: oben Prozente, unten Werte, das Ende des Streifens lässt sich ziehen. Der Dreisatz entsteht Zeile für Zeile; dazu Rabatt, Mehrwertsteuer, Zinsen, der Anteil einer Klasse, „Erst plus, dann minus“ mit Faktoren und gewürfelte Übungsaufgaben.',
              'Base value, rate and percentage on a percentage bar: percent on top, values below, and the end of the bar can be dragged. The rule of three builds up line by line; plus discount, VAT, interest, the share of a class, “first up, then down” with factors and randomly generated practice tasks.',
            ),
            grades: [6, 7],
            kmk: ['M-L1', 'M-L2', 'M-K3', 'M-K4'],
            keywords: L(
              ['Prozent', 'Prozentrechnung', 'Prozentstreifen', 'Grundwert', 'Prozentwert', 'Prozentsatz', 'Dreisatz', 'Rabatt', 'Mehrwertsteuer', 'Zinsen', 'Anteil', 'Bruch'],
              ['percent', 'percentage', 'percentage bar', 'base value', 'rate', 'rule of three', 'discount', 'VAT', 'interest', 'share', 'fraction'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('reelle-zahlen', L('Wurzeln und reelle Zahlen', 'Roots and real numbers'), [
          {
            id: 'quadratwurzel',
            status: 'ready',
            slug: L('quadratwurzel-heron-verfahren', 'square-roots-herons-method'),
            title: L('Quadratwurzeln und das Heron-Verfahren', 'Square roots and Heron’s method'),
            summary: L(
              'Ein Rechteck mit Flächeninhalt a wird Schritt für Schritt zum Quadrat – seine Seite nähert sich √a (Heron-Verfahren). Dazu die Intervallschachtelung mit einer Lupe auf dem Zahlenstrahl, die Wurzelspirale des Theodorus als Konstruktion von √2 bis √17 und die Frage, warum √2 kein Bruch ist.',
              'A rectangle with area a becomes a square step by step – its side approaches √a (Heron’s method). Plus nested intervals with a magnifier on the number line, the spiral of Theodorus constructing √2 to √17 and why √2 is not a fraction.',
            ),
            grades: [9, 9],
            kmk: ['M-L1', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Quadratwurzel', 'Wurzel', 'Heron-Verfahren', 'Intervallschachtelung', 'Näherungsverfahren', 'irrationale Zahl', 'reelle Zahlen', 'Radikand', 'Quadratzahl', 'Mittelwert'],
              ['square root', 'root', 'Heron’s method', 'Babylonian method', 'nested intervals', 'approximation', 'irrational number', 'real numbers', 'radicand', 'perfect square'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
    area({
      id: 'terme',
      slug: L('terme-und-gleichungen', 'terms-and-equations'),
      title: L('Terme und Gleichungen', 'Terms and equations'),
      description: L(
        'Die Struktur von Termen sichtbar machen, Termumformungen geometrisch deuten und Gleichungen lösen – rechnerisch und grafisch.',
        'Make the structure of terms visible, interpret algebraic manipulation geometrically and solve equations algebraically and graphically.',
      ),
      kmk: ['M-L1', 'M-L3', 'M-K5'],
      topics: [
        topic('terme', L('Terme', 'Terms'), [
          {
            id: 'termbaum',
            status: 'ready',
            slug: L('termbaum', 'expression-tree'),
            title: L('Termbaum: die Struktur von Termen', 'Expression trees: the structure of terms'),
            summary: L(
              'Eigene Terme eingeben und als Rechenbaum sehen: Schritt für Schritt wandern die Werte durch den Baum – Klammer vor Potenz vor Punkt vor Strich. Mit Termart, Gliederung in Worten und Variablen.',
              'Type your own expressions and see them as a tree: step by step the values flow through it – brackets, powers, × ÷, then + −. With the type of expression, its structure in words and variables.',
            ),
            grades: [5, 7],
            kmk: ['M-L1', 'M-K5', 'M-K4'],
            keywords: L(
              ['Termbaum', 'Rechenbaum', 'Rechenreihenfolge', 'Punkt vor Strich', 'Klammer', 'Potenz', 'Termart', 'Summe', 'Differenz', 'Produkt', 'Quotient', 'Termgliederung', 'Variable', 'Termwert'],
              ['expression tree', 'order of operations', 'brackets', 'power', 'sum', 'difference', 'product', 'quotient', 'variable', 'evaluate', 'BODMAS', 'PEMDAS'],
            ),
            thumb: 'generic',
          },
          {
            id: 'binomische-formeln',
            status: 'ready',
            slug: L('binomische-formeln', 'binomial-formulas'),
            title: L('Binomische Formeln am Quadrat', 'Binomial formulas with squares'),
            summary: L(
              'Die drei binomischen Formeln als Flächen sehen: Das Quadrat zerfällt animiert in a², b² und zwei Rechtecke ab.',
              'See the three binomial formulas as areas: the square splits into a², b² and two rectangles ab – animated.',
            ),
            grades: [7, 7],
            kmk: ['M-L3', 'M-K1', 'M-K4'],
            keywords: L(
              ['binomische Formel', 'Quadrat', 'Flächenmodell', 'ausmultiplizieren', 'Term', 'a plus b', 'Differenz'],
              ['binomial formula', 'square', 'area model', 'expand', 'expression', 'difference of squares'],
            ),
            thumb: 'binomial',
          },
        ]),
        topic('gleichungen', L('Gleichungen und Gleichungssysteme', 'Equations and systems of equations'), [
          {
            id: 'waagemodell',
            status: 'ready',
            slug: L('waagemodell', 'balance-model'),
            title: L('Lineare Gleichungen am Waagemodell', 'Linear equations with a balance model'),
            summary: L(
              'x-Päckchen und Gewichtsstücke auf einer Balkenwaage: Wer auf beiden Seiten dasselbe wegnimmt oder teilt, hält das Gleichgewicht – wer nur eine Seite ändert, sieht die Waage kippen. Mit Umformungskette und Probe.',
              'x-boxes and weights on a balance: removing or dividing the same on both sides keeps it level – changing only one side makes it tip. With the chain of transformations and a check.',
            ),
            grades: [7, 7],
            kmk: ['M-L3', 'M-K5', 'M-K3', 'M-K4'],
            keywords: L(
              ['Gleichung', 'lineare Gleichung', 'Waagemodell', 'Balkenwaage', 'Äquivalenzumformung', 'Lösungsmenge', 'Probe', 'Variable', 'Gleichgewicht', 'Umformung'],
              ['equation', 'linear equation', 'balance model', 'equivalent transformation', 'solution set', 'check', 'variable', 'solving equations'],
            ),
            thumb: 'generic',
          },
          {
            id: 'lgs-grafisch',
            status: 'ready',
            slug: L('lgs-grafisch', 'linear-systems-graphically'),
            title: L('Lineare Gleichungssysteme grafisch lösen', 'Solving linear systems graphically'),
            summary: L(
              'Zwei Geraden, ein Schnittpunkt: Gleichungen in Normalform oder allgemeiner Form einstellen oder Punkte ziehen, Lösung ablesen und durch Einsetzen prüfen. Mit parallelen und identischen Geraden und einem Tarifvergleich.',
              'Two lines, one intersection: set equations in slope-intercept or general form or drag points, read off the solution and check it by substituting. With parallel and identical lines and a tariff comparison.',
            ),
            grades: [8, 8],
            kmk: ['M-L3', 'M-K4', 'M-K3', 'M-K5'],
            keywords: L(
              ['lineares Gleichungssystem', 'LGS', 'Schnittpunkt', 'grafisches Lösungsverfahren', 'Gerade', 'parallel', 'identisch', 'Lösungsmenge', 'Probe', 'Gleichsetzungsverfahren', 'Tarifvergleich'],
              ['system of linear equations', 'simultaneous equations', 'intersection', 'graphical method', 'line', 'parallel', 'coincident', 'solution set', 'check', 'tariff comparison'],
            ),
            thumb: 'generic',
          },
          {
            id: 'gleichungen-grafisch',
            status: 'ready',
            slug: L('gleichungen-grafisch-loesen', 'solving-equations-graphically'),
            title: L('Gleichungen grafisch lösen: Schnittpunkte von Graphen', 'Solving equations graphically: intersections of graphs'),
            summary: L(
              'Beide Seiten einer Gleichung als Graphen – Gerade, Parabel, Hyperbel oder Betrag. Die Lösungen sind die x-Koordinaten der Schnittpunkte; mit Differenzfunktion, Berührpunkt und Intervallhalbierung samt Lupe für krumme Lösungen wie √2.',
              'Both sides of an equation as graphs – line, parabola, hyperbola or absolute value. The solutions are the x-coordinates of the intersections; with the difference function, touching points and bisection with a magnifier for awkward solutions such as √2.',
            ),
            grades: [8, 9],
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K2'],
            keywords: L(
              ['Gleichung', 'grafisches Lösen', 'Schnittpunkt', 'Schnittstelle', 'Lösungsmenge', 'Bruchgleichung', 'quadratische Gleichung', 'Betragsgleichung', 'Differenzfunktion', 'Nullstelle', 'Berührpunkt', 'Intervallhalbierung', 'Intervallschachtelung', 'Näherung', 'Definitionsmenge'],
              ['equation', 'solving graphically', 'intersection', 'solution set', 'fractional equation', 'quadratic equation', 'absolute value equation', 'difference function', 'zero', 'root', 'touching point', 'bisection', 'nested intervals', 'approximation', 'domain'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
    area({
      id: 'geometrie',
      slug: L('geometrie', 'geometry'),
      title: L('Geometrie', 'Geometry'),
      description: L(
        'Figuren, Symmetrie, Winkel, Dreiecke, Ähnlichkeit und Trigonometrie dynamisch konstruieren und untersuchen.',
        'Construct and investigate figures, symmetry, angles, triangles, similarity and trigonometry dynamically.',
      ),
      kmk: ['M-L4', 'M-K1', 'M-K4'],
      topics: [
        topic('grundbegriffe', L('Grundbegriffe der Geometrie', 'Basic geometric concepts'), [
          {
            id: 'koordinaten-lage',
            status: 'ready',
            slug: L('koordinatensystem-lagebeziehungen', 'coordinates-relative-positions'),
            title: L('Punkte, Geraden und Kreise: Lagebeziehungen', 'Points, lines and circles: relative positions'),
            summary: L(
              'Punkte im Koordinatensystem setzen und ablesen, Strecke, Halbgerade und Gerade unterscheiden, parallel und senkrecht mit dem Geodreieck prüfen, Abstände messen und Tangenten an Kreise finden – mit Punkte-Spiel.',
              'Plot and read points in the coordinate plane, tell segments, rays and lines apart, check parallel and perpendicular lines with a set square, measure distances and find tangents to circles – with a point game.',
            ),
            grades: [5, 5],
            kmk: ['M-L4', 'M-K4', 'M-K5'],
            keywords: L(
              ['Koordinatensystem', 'Punkt', 'Strecke', 'Halbgerade', 'Gerade', 'parallel', 'senkrecht', 'Abstand', 'Lot', 'Geodreieck', 'Kreis', 'Radius', 'Durchmesser', 'Tangente', 'Sekante', 'Passante'],
              ['coordinate plane', 'point', 'segment', 'ray', 'line', 'parallel', 'perpendicular', 'distance', 'set square', 'circle', 'radius', 'diameter', 'tangent', 'secant'],
            ),
            thumb: 'generic',
          },
          {
            id: 'winkel-messen',
            status: 'ready',
            slug: L('winkel-schaetzen-messen', 'estimating-measuring-angles'),
            title: L('Winkel schätzen und messen', 'Estimating and measuring angles'),
            summary: L(
              'Schenkel ziehen, das Geodreieck verschieben und drehen, bis es richtig anliegt, und an der passenden Skala ablesen – auch überstumpfe Winkel. Dazu Winkelarten in Farbe und ein Schätzspiel mit Punkten.',
              'Drag the arms, move and turn the set square until it is placed correctly and read the right scale – reflex angles included. With colour-coded types of angles and an estimation game.',
            ),
            grades: [5, 5],
            kmk: ['M-L2', 'M-L4', 'M-K5'],
            keywords: L(
              ['Winkel', 'Scheitel', 'Schenkel', 'Geodreieck', 'Winkelmesser', 'spitzer Winkel', 'rechter Winkel', 'stumpfer Winkel', 'gestreckter Winkel', 'überstumpfer Winkel', 'Vollwinkel', 'Grad', 'schätzen'],
              ['angle', 'vertex', 'arm', 'set square', 'protractor', 'acute angle', 'right angle', 'obtuse angle', 'straight angle', 'reflex angle', 'full angle', 'degree', 'estimate'],
            ),
            thumb: 'generic',
          },
          {
            id: 'vierecke',
            status: 'ready',
            slug: L('haus-der-vierecke', 'family-of-quadrilaterals'),
            title: L('Das Haus der Vierecke', 'The family of quadrilaterals'),
            summary: L(
              'Die Ecken eines Vierecks ziehen: Parallele und gleich lange Seiten, rechte Winkel und Symmetrieachsen werden live markiert, und im Haus der Vierecke leuchten alle passenden Arten auf. Mit Bau- und Einordnungsaufgaben.',
              'Drag the corners of a quadrilateral: parallel and equal sides, right angles and lines of symmetry are marked live, and every matching type lights up in the house of quadrilaterals. With building and classifying tasks.',
            ),
            grades: [5, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Viereck', 'Haus der Vierecke', 'Quadrat', 'Rechteck', 'Raute', 'Parallelogramm', 'Trapez', 'gleichschenkliges Trapez', 'Drachenviereck', 'parallel', 'Symmetrieachse', 'punktsymmetrisch', 'Diagonale', 'Eigenschaften'],
              ['quadrilateral', 'square', 'rectangle', 'rhombus', 'parallelogram', 'trapezium', 'trapezoid', 'isosceles trapezium', 'kite', 'parallel', 'line of symmetry', 'point symmetry', 'diagonal', 'properties'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('symmetrie', L('Symmetrie und Konstruktionen', 'Symmetry and constructions'), [
          {
            id: 'spiegelung',
            status: 'ready',
            slug: L('achsen-und-punktspiegelung', 'reflections-line-point'),
            title: L('Achsen- und Punktspiegelung', 'Reflections in a line and in a point'),
            summary: L(
              'Eine Figur an einer ziehbaren Achse oder an einem Zentrum spiegeln, die Konstruktion sehen, umklappen bzw. um 180° drehen lassen und den Umlaufsinn vergleichen. Dazu Symmetrieachsen und Symmetriezentren selbst einzeichnen.',
              'Reflect a figure in a draggable line or in a point, see the construction, fold it over or turn it by 180° and compare the orientation. Plus: draw lines and centres of symmetry yourself.',
            ),
            grades: [7, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Achsenspiegelung', 'Punktspiegelung', 'Spiegelachse', 'Symmetriezentrum', 'achsensymmetrisch', 'punktsymmetrisch', 'Symmetrieachse', 'Umlaufsinn', 'Fixpunkt', 'Fixgerade', 'Lot', 'Drehung um 180°', 'Konstruktion'],
              ['reflection', 'line of symmetry', 'point symmetry', 'centre of symmetry', 'mirror line', 'orientation', 'fixed point', 'fixed line', 'half turn', 'construction'],
            ),
            thumb: 'generic',
          },
          {
            id: 'mittelsenkrechte',
            status: 'ready',
            slug: L('mittelsenkrechte-winkelhalbierende', 'perpendicular-and-angle-bisectors'),
            title: L('Mittelsenkrechte und Winkelhalbierende', 'Perpendicular bisector and angle bisector'),
            summary: L(
              'Einen Punkt P ziehen und seine Abstände vergleichen: Wer von A und B bzw. von zwei Schenkeln gleich weit entfernt ist, liegt auf der Mittelsenkrechten bzw. Winkelhalbierenden. Dazu beide Konstruktionen mit Zirkel und Lineal Schritt für Schritt und der Umkreismittelpunkt als Ausblick.',
              'Drag a point P and compare its distances: every point equally far from A and B, or from two arms, lies on the perpendicular bisector or the angle bisector. Plus both constructions with compasses and ruler step by step and the circumcentre as an outlook.',
            ),
            grades: [7, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Mittelsenkrechte', 'Winkelhalbierende', 'Ortslinie', 'Abstand', 'gleich weit entfernt', 'Mittelpunkt', 'Lot', 'Zirkel', 'Lineal', 'Konstruktion', 'Grundkonstruktion', 'Umkreis', 'Umkreismittelpunkt', 'Drachenviereck'],
              ['perpendicular bisector', 'angle bisector', 'locus', 'distance', 'equidistant', 'midpoint', 'perpendicular', 'compasses', 'ruler', 'construction', 'circumcircle', 'circumcentre', 'kite'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('winkel', L('Winkel an Figuren', 'Angles in figures'), [
          planned('winkel-geradenkreuzung', L('Winkel an Geradenkreuzungen', 'Angles at intersecting lines'), [7, 7]),
          planned('winkelsumme', L('Innenwinkelsumme in Dreieck und Vieleck', 'Angle sum in triangles and polygons'), [7, 7], { kmk: ['M-L4', 'M-K1'] }),
        ]),
        topic('dreiecke', L('Dreiecke', 'Triangles'), [
          {
            id: 'dreieckskonstruktion',
            status: 'ready',
            slug: L('dreieckskonstruktion-kongruenzsaetze', 'constructing-triangles-congruence'),
            title: L('Kongruenzsätze und Dreieckskonstruktionen', 'Congruence and constructing triangles'),
            summary: L(
              'Dreiecke aus drei gegebenen Stücken Schritt für Schritt mit Lineal, Geodreieck und Zirkel konstruieren – mit Planfigur und Konstruktionsbeschreibung wie im Heft: SSS, SWS, WSW und SsW. Sonderfälle sichtbar: Lücke bei verletzter Dreiecksungleichung, parallele Schenkel, keine, eine oder zwei Lösungen bei SSW und ähnliche Dreiecke bei WWW.',
              'Construct triangles from three given parts step by step with ruler, set square and compasses – with a sketch and written construction steps: SSS, SAS, ASA and SsA. Special cases made visible: the gap when the triangle inequality fails, parallel arms, no, one or two solutions for SSA and similar triangles for AAA.',
            ),
            grades: [7, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Kongruenz', 'Kongruenzsatz', 'SSS', 'SWS', 'WSW', 'SsW', 'SSW', 'WWW', 'Dreieckskonstruktion', 'Planfigur', 'Zirkel', 'Geodreieck', 'Dreiecksungleichung', 'eindeutig', 'Konstruktionsbeschreibung', 'Kreis', 'Schnittpunkt', 'Winkelsumme', 'ähnlich'],
              ['congruence', 'congruence criterion', 'SSS', 'SAS', 'ASA', 'SSA', 'AAA', 'constructing triangles', 'sketch', 'compasses', 'set square', 'triangle inequality', 'unique', 'construction steps', 'circle', 'intersection', 'angle sum', 'similar'],
            ),
            thumb: 'generic',
          },
          {
            id: 'thales',
            status: 'ready',
            slug: L('satz-des-thales', 'thales-theorem'),
            title: L('Satz des Thales', 'Thales’s theorem'),
            summary: L(
              'Den Punkt C über den Halbkreis ziehen: Der Winkel bei C bleibt immer 90°. Mit Beweisidee über gleichschenklige Dreiecke.',
              'Drag point C along the semicircle: the angle at C always stays 90°. With the proof idea using isosceles triangles.',
            ),
            grades: [7, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Thaleskreis', 'rechter Winkel', 'Halbkreis', 'Umkreis', 'gleichschenkliges Dreieck', 'Winkelsumme', 'Beweis'],
              ['Thales circle', 'right angle', 'semicircle', 'circumcircle', 'isosceles triangle', 'angle sum', 'proof'],
            ),
            thumb: 'thales',
          },
          {
            id: 'besondere-linien',
            status: 'ready',
            slug: L('besondere-linien-im-dreieck', 'special-lines-in-a-triangle'),
            title: L('Umkreis, Inkreis und besondere Linien im Dreieck', 'Circumcircle, incircle and special lines in a triangle'),
            summary: L(
              'Zirkel, Lineal und Geodreieck konstruieren Mittelsenkrechten, Winkelhalbierende, Seitenhalbierende und Höhen – jedes Mal schneiden sich alle drei in einem Punkt. Mit Begründung über gleiche Abstände, Umkreis, Inkreis, Pappdreieck auf der Nadel, Sonderfällen und Euler-Gerade.',
              'Compasses, ruler and set square construct the perpendicular bisectors, angle bisectors, medians and altitudes – each time all three meet at one point. With reasoning via equal distances, circumcircle, incircle, a card balancing on a pin, special cases and the Euler line.',
            ),
            grades: [7, 8],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Mittelsenkrechte', 'Umkreis', 'Umkreismittelpunkt', 'Winkelhalbierende', 'Inkreis', 'Inkreismittelpunkt', 'Seitenhalbierende', 'Schwerpunkt', 'Höhe', 'Höhenschnittpunkt', 'Euler-Gerade', 'Dreieck', 'Ortslinie', 'Konstruktion', 'Zirkel', 'Geodreieck', 'Thaleskreis'],
              ['perpendicular bisector', 'circumcircle', 'circumcentre', 'angle bisector', 'incircle', 'incentre', 'median', 'centroid', 'altitude', 'orthocentre', 'Euler line', 'triangle', 'locus', 'construction', 'compasses', 'set square', 'Thales circle'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('pythagoras', L('Satz des Pythagoras', 'Pythagorean theorem'), [
          {
            id: 'pythagoras',
            status: 'ready',
            slug: L('satz-des-pythagoras', 'pythagorean-theorem'),
            title: L('Satz des Pythagoras', 'Pythagorean theorem'),
            summary: L(
              'Quadrate über den Seiten eines rechtwinkligen Dreiecks und ein animierter Puzzle-Beweis: a² + b² = c².',
              'Squares on the sides of a right triangle and an animated puzzle proof: a² + b² = c².',
            ),
            grades: [8, 9],
            kmk: ['M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Pythagoras', 'Hypotenuse', 'Kathete', 'rechtwinkliges Dreieck', 'Flächenbeweis', 'Quadrat', 'Beweis'],
              ['Pythagoras', 'hypotenuse', 'leg', 'right triangle', 'area proof', 'square', 'proof'],
            ),
            thumb: 'pythagoras',
          },
        ]),
        topic('aehnlichkeit', L('Ähnlichkeit und Strahlensätze', 'Similarity and intercept theorems'), [
          {
            id: 'strahlensaetze',
            status: 'ready',
            slug: L('strahlensaetze', 'intercept-theorems'),
            title: L('Strahlensätze', 'Intercept theorems'),
            summary: L(
              'Die Parallele von AB nach A′B′ gleiten lassen und an farbigen Maßstäben sehen, dass alle Verhältnisse denselben Faktor k haben – an V- und X-Figur; ohne Parallelen zerfallen sie. Dazu unbekannte Strecken Schritt für Schritt berechnen und zwei gezeichnete Anwendungen: Baumhöhe über den Schatten und Teichbreite.',
              'Slide the parallel from AB to A′B′ and see on coloured scale bars that all ratios share the same factor k – in the V and X shape; without parallels they fall apart. Plus unknown lengths solved step by step and two drawn applications: a tree’s height from its shadow and the width of a pond.',
            ),
            grades: [9, 9],
            kmk: ['M-L4', 'M-L2', 'M-K3', 'M-K4'],
            keywords: L(
              ['Strahlensatz', 'Strahlensätze', 'V-Figur', 'X-Figur', 'Parallelen', 'Streckfaktor', 'Verhältnis', 'Verhältnisgleichung', 'Abschnitte', 'ähnliche Dreiecke', 'zentrische Streckung', 'Baumhöhe', 'Schatten', 'Teichbreite', 'Umkehrung'],
              ['intercept theorem', 'V shape', 'X shape', 'parallel lines', 'scale factor', 'ratio', 'proportion', 'similar triangles', 'enlargement', 'tree height', 'shadow', 'pond width', 'converse'],
            ),
            thumb: 'generic',
          },
          {
            id: 'vergroessern',
            status: 'ready',
            slug: L('aehnliche-figuren-vergroessern', 'similar-figures-scaling'),
            title: L('Ähnliche Figuren: Wie wachsen Fläche und Volumen?', 'Similar figures: how do area and volume grow?'),
            summary: L(
              'Mit dem Streckfaktor k vergrößern: Die Strecke wird k-mal so lang, das Quadrat besteht aus k² Einheitsquadraten und der Würfel baut sich aus k³ Einheitswürfeln auf (3D, drehbar). Eine Kurve vergleicht k, k² und k³.',
              'Scaling with factor k: the segment becomes k times as long, the square consists of k² unit squares and the cube builds up from k³ unit cubes (3D, rotatable). A graph compares k, k² and k³.',
            ),
            grades: [9, 9],
            kmk: ['M-L4', 'M-L2', 'M-K1', 'M-K4'],
            keywords: L(
              ['Streckfaktor', 'ähnlich', 'Ähnlichkeit', 'zentrische Streckung', 'Vergrößerung', 'Verkleinerung', 'Flächeninhalt', 'Volumen', 'Einheitswürfel', 'Quadrat', 'Würfel'],
              ['scale factor', 'similar', 'similarity', 'enlargement', 'reduction', 'area', 'volume', 'unit cube', 'square', 'cube'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('trigonometrie-dreieck', L('Trigonometrie im Dreieck', 'Trigonometry in triangles'), [
          {
            id: 'sin-cos-tan-dreieck',
            status: 'ready',
            slug: L('sinus-kosinus-tangens-dreieck', 'sine-cosine-tangent-triangle'),
            title: L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck', 'Sine, cosine and tangent in right triangles'),
            summary: L(
              'Gegenkathete, Ankathete und Hypotenuse zum Winkel α oder β farbig markiert; das Seitenverhältnis als Bruch, ähnliche Dreiecke mit gleichem Verhältnis, die Graphen von sin, cos und tan und ihre Zusammenhänge.',
              'Opposite side, adjacent side and hypotenuse for the angle α or β in colour; the ratio as a fraction, similar triangles with the same ratio, the graphs of sin, cos and tan and how they are related.',
            ),
            grades: [9, 10],
            kmk: ['M-L4', 'M-L3', 'M-K5', 'M-K1'],
            keywords: L(
              ['Sinus', 'Kosinus', 'Tangens', 'Trigonometrie', 'rechtwinkliges Dreieck', 'Gegenkathete', 'Ankathete', 'Hypotenuse', 'Seitenverhältnis', 'Winkel berechnen', 'ähnliche Dreiecke'],
              ['sine', 'cosine', 'tangent', 'trigonometry', 'right triangle', 'opposite', 'adjacent', 'hypotenuse', 'ratio', 'angle', 'similar triangles', 'SOH CAH TOA'],
            ),
            thumb: 'generic',
          },
          {
            id: 'sinussatz-kosinussatz',
            status: 'ready',
            slug: L('sinussatz-kosinussatz', 'law-of-sines-cosines'),
            title: L('Sinussatz und Kosinussatz', 'Law of sines and law of cosines'),
            summary: L(
              'Ein Dreieck mit ziehbaren Ecken: Beim Sinussatz sind die drei Quotienten Seite : Sinus des Gegenwinkels gleich dem Umkreisdurchmesser, beim Kosinussatz zeigen Balken, wie c² von a² + b² abweicht. Beweisidee jeweils über eine Höhe.',
              'A triangle with draggable vertices: for the law of sines the three quotients side : sine of the opposite angle equal the circumcircle diameter, for the law of cosines bars show how c² differs from a² + b². Proof idea via an altitude.',
            ),
            grades: [9, 10],
            kmk: ['M-L4', 'M-L2', 'M-K1', 'M-K5'],
            keywords: L(
              ['Sinussatz', 'Kosinussatz', 'allgemeines Dreieck', 'Trigonometrie', 'Umkreis', 'Höhe', 'Pythagoras', 'Dreiecksberechnung', 'SWS', 'SSS', 'WSW'],
              ['law of sines', 'law of cosines', 'sine rule', 'cosine rule', 'triangle', 'trigonometry', 'circumcircle', 'altitude', 'Pythagoras'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
    area({
      id: 'flaechen-koerper',
      slug: L('flaechen-und-koerper', 'area-and-volume'),
      title: L('Größen, Flächen und Körper', 'Measures, area and volume'),
      description: L(
        'Einheiten, Flächeninhalte, Volumen und Oberflächen begreifen: zerlegen, ergänzen, auslegen und Körper drehen.',
        'Understand units, area, volume and surface area: decompose, complete, tile and rotate solids.',
      ),
      kmk: ['M-L2', 'M-L4', 'M-K3'],
      topics: [
        topic('groessen', L('Größen und Einheiten', 'Measures and units'), [
          planned('einheiten', L('Einheiten umrechnen mit der Einheitentafel', 'Converting units with a place-value chart'), [5, 5]),
          planned('massstab', L('Maßstab: Karte und Wirklichkeit', 'Scale: map and reality'), [5, 5], { kmk: ['M-L2', 'M-K3'] }),
        ]),
        topic('flaecheninhalt', L('Flächeninhalt', 'Area'), [
          {
            id: 'umfang-flaeche',
            status: 'ready',
            slug: L('umfang-flaecheninhalt-rechteck', 'perimeter-area-rectangle'),
            title: L('Umfang und Flächeninhalt von Rechtecken', 'Perimeter and area of rectangles'),
            summary: L(
              'Rechteck aufziehen, Reihe für Reihe mit Einheitsquadraten auslegen und eine Ameise einmal herumlaufen lassen. Dazu Rechtecke mit gleichem Umfang oder gleicher Fläche und eine L-Form zum Zerlegen.',
              'Drag out a rectangle, tile it row by row with unit squares and let an ant walk once around it. Plus rectangles with the same perimeter or area and an L-shape to split up.',
            ),
            grades: [5, 5],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Umfang', 'Flächeninhalt', 'Rechteck', 'Quadrat', 'Einheitsquadrat', 'Quadratzentimeter', 'cm²', 'Länge', 'Breite', 'Rechenpapier', 'zerlegen', 'ergänzen', 'L-Form', 'zusammengesetzte Figur'],
              ['perimeter', 'area', 'rectangle', 'square', 'unit square', 'square centimetre', 'cm²', 'length', 'width', 'squared paper', 'decompose', 'complete', 'L-shape', 'composite shape'],
            ),
            thumb: 'generic',
          },
          planned('flaechen-zerlegen', L('Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen', 'Parallelogram, triangle and trapezium by decomposing'), [6, 6], { kmk: ['M-L2', 'M-K1'] }),
        ]),
        topic('koerper', L('Körper und Oberflächen', 'Solids and surface area'), [
          {
            id: 'koerpernetze',
            status: 'ready',
            slug: L('koerpernetze', 'nets-of-solids'),
            title: L('Netze und Oberflächen von Körpern', 'Nets and surface areas of solids'),
            summary: L(
              'Netze von Würfel, Quader, Prisma, Pyramide und Zylinder falten sich in 3D zum Körper. Welche der 15 Netze ergeben einen Würfel? Oberfläche direkt aus dem Netz.',
              'Nets of a cube, cuboid, prism, pyramid and cylinder fold into the solid in 3D. Which of the 15 nets make a cube? Surface area straight from the net.',
            ),
            grades: [5, 8],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Körpernetz', 'Würfelnetz', 'Würfel', 'Quader', 'Prisma', 'Pyramide', 'Zylinder', 'Oberfläche', 'Mantel', 'Raumvorstellung', 'falten', 'Spielwürfel'],
              ['net', 'cube net', 'cube', 'cuboid', 'prism', 'pyramid', 'cylinder', 'surface area', 'lateral surface', 'spatial reasoning', 'folding', 'dice'],
            ),
            thumb: 'generic',
          },
          {
            id: 'prisma-zylinder',
            status: 'ready',
            slug: L('prisma-und-zylinder', 'prism-and-cylinder'),
            title: L('Prisma und Zylinder: Oberfläche und Volumen', 'Prism and cylinder: surface area and volume'),
            summary: L(
              'Schichten stapeln zeigt V = G · h, Abrollen auf dem Boden zeigt den Mantel u · h. Mit wachsender Eckenzahl wird das Prisma zum Zylinder.',
              'Stacking layers shows V = G · h, rolling the solid on the floor shows the lateral surface u · h. With more and more vertices the prism turns into a cylinder.',
            ),
            grades: [8, 8],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Prisma', 'Zylinder', 'Volumen', 'Oberfläche', 'Mantel', 'Grundfläche', 'Netz', 'Abwicklung', 'Vieleck', 'Kreis'],
              ['prism', 'cylinder', 'volume', 'surface area', 'lateral surface', 'base area', 'net', 'development', 'polygon', 'circle'],
            ),
            thumb: 'generic',
          },
          {
            id: 'pyramide-kegel-kugel',
            status: 'ready',
            slug: L('pyramide-kegel-kugel', 'pyramid-cone-sphere'),
            title: L('Pyramide, Kegel und Kugel', 'Pyramid, cone and sphere'),
            summary: L(
              'Hilfsdreiecke mit dem Satz des Pythagoras, Wasser umschütten (Pyramide und Kegel füllen ein Drittel, Kegel und Halbkugel zusammen den Zylinder) und Oberflächen über das Netz – drehbar in 3D.',
              'Helper triangles with Pythagoras’ theorem, pouring water (pyramid and cone fill one third, cone and hemisphere together fill the cylinder) and surface areas from the net – rotatable in 3D.',
            ),
            grades: [10, 10],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Pyramide', 'Kegel', 'Kugel', 'Volumen', 'Oberfläche', 'Mantel', 'Seitenhöhe', 'Seitenkante', 'Mantellinie', 'Satz des Pythagoras', 'Kreissektor', 'Umschüttversuch', 'Archimedes', 'Halbkugel', 'Netz'],
              ['pyramid', 'cone', 'sphere', 'volume', 'surface area', 'lateral surface', 'slant height', 'lateral edge', 'Pythagorean theorem', 'circular sector', 'pouring experiment', 'Archimedes', 'hemisphere', 'net'],
            ),
            thumb: 'generic',
          },
          {
            id: 'cavalieri',
            status: 'ready',
            slug: L('prinzip-von-cavalieri', 'cavalieris-principle'),
            title: L('Prinzip von Cavalieri', 'Cavalieri’s principle'),
            summary: L(
              'Münzstapel und Spielkarten schief schieben oder verbiegen: Eine Schnittebene zeigt in jeder Höhe gleich große Querschnitte, also bleibt das Volumen gleich – bis hin zum Kugelvolumen aus Halbkugel und Zylinder ohne Kegel.',
              'Push or bend stacks of coins and playing cards: a cutting plane shows equal cross-sections at every height, so the volume stays the same – all the way to the volume of a sphere from a hemisphere and a cylinder without a cone.',
            ),
            grades: [10, 10],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K2', 'M-K4'],
            keywords: L(
              ['Cavalieri', 'Prinzip von Cavalieri', 'Querschnitt', 'Schnittfläche', 'Volumen', 'schiefer Zylinder', 'schiefes Prisma', 'schiefe Pyramide', 'schiefer Kegel', 'Kugelvolumen', 'Halbkugel', 'Münzstapel', 'Scheiben', 'Grenzwert'],
              ['Cavalieri', 'Cavalieri’s principle', 'cross-section', 'volume', 'oblique cylinder', 'oblique prism', 'oblique pyramid', 'oblique cone', 'volume of a sphere', 'hemisphere', 'stack of coins', 'slices', 'limit'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('volumen', L('Volumen', 'Volume'), [
          {
            id: 'quader-volumen',
            status: 'ready',
            slug: L('quader-volumen', 'volume-of-cuboids'),
            title: L('Volumen von Quadern mit Einheitswürfeln', 'Volume of cuboids with unit cubes'),
            summary: L(
              'Einheitswürfel füllen einen gläsernen Quader – Reihe für Reihe, Schicht für Schicht. So wird V = a · b · c sichtbar, dazu cm³, dm³, Liter und m³.',
              'Unit cubes fill a glass cuboid row by row and layer by layer, making V = a · b · c visible – with cm³, dm³, litres and m³.',
            ),
            grades: [6, 6],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Volumen', 'Rauminhalt', 'Quader', 'Würfel', 'Einheitswürfel', 'Kubikzentimeter', 'Liter', 'Volumeneinheiten', 'Schicht', 'Reihe'],
              ['volume', 'cuboid', 'cube', 'unit cube', 'cubic centimetre', 'litre', 'units of volume', 'layer', 'row'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('kreis', L('Kreis', 'Circle'), [
          {
            id: 'kreiszahl-pi',
            status: 'ready',
            slug: L('kreiszahl-pi', 'number-pi'),
            title: L('Kreisumfang, Kreisfläche und die Zahl π', 'Circumference, area of a circle and the number π'),
            summary: L(
              'Ein Rad rollt einmal ab, Kreissektoren werden zu einem Rechteck umgelegt und Vielecke schließen π ein wie bei Archimedes.',
              'A wheel rolls once, circle sectors are rearranged into a rectangle and polygons trap π like Archimedes did.',
            ),
            grades: [8, 8],
            kmk: ['M-L2', 'M-L4', 'M-K1'],
            keywords: L(
              ['Kreiszahl', 'Pi', 'Kreisumfang', 'Kreisfläche', 'Durchmesser', 'Radius', 'Archimedes', 'Kreissektor'],
              ['pi', 'circumference', 'area of a circle', 'diameter', 'radius', 'Archimedes', 'sector'],
            ),
            thumb: 'circle-pi',
          },
        ]),
      ],
    }),
    area({
      id: 'funktionen',
      slug: L('funktionen', 'functions'),
      title: L('Funktionen', 'Functions'),
      description: L(
        'Vom Funktionsbegriff über lineare, quadratische und gebrochen-rationale Funktionen bis zu Sinus, Exponential- und ganzrationalen Funktionen – mit Reglern und ziehbaren Punkten.',
        'From the concept of a function to linear, quadratic, rational, sine, exponential and polynomial functions – with sliders and draggable points.',
      ),
      kmk: ['M-L3', 'M-K3', 'M-K4', 'M-K5'],
      topics: [
        topic('funktionsbegriff', L('Funktionsbegriff und Zuordnungen', 'Functions and relationships'), [
          {
            id: 'proportional',
            status: 'ready',
            slug: L('direkte-indirekte-proportionalitaet', 'direct-and-inverse-proportion'),
            title: L('Direkte und indirekte Proportionalität', 'Direct and inverse proportion'),
            summary: L(
              'Äpfel kaufen, ein Beet umgraben, Taxi fahren: Punkt auf dem Graphen ziehen und in der Wertetabelle prüfen, ob die Quotienten oder die Produkte gleich bleiben. Mit Dreisatz, „x verdoppeln“, Ursprungsgerade, Hyperbel, Rechtecken gleicher Fläche und einem Übungsmodus, in dem man Alltagszuordnungen selbst einordnet.',
              'Buying apples, digging a bed, taking a taxi: drag a point on the graph and check in the table whether quotients or products stay equal. With the rule of three, “double x”, a line through the origin, a hyperbola, rectangles of equal area and a practice mode for classifying everyday relations.',
            ),
            grades: [6, 8],
            kmk: ['M-L3', 'M-K3', 'M-K4'],
            keywords: L(
              ['proportional', 'direkt proportional', 'indirekt proportional', 'antiproportional', 'Dreisatz', 'quotientengleich', 'produktgleich', 'Ursprungsgerade', 'Hyperbel', 'Wertetabelle', 'Zuordnung'],
              ['proportional', 'directly proportional', 'inversely proportional', 'rule of three', 'equal quotients', 'equal products', 'line through the origin', 'hyperbola', 'table of values', 'relation'],
            ),
            thumb: 'generic',
          },
          {
            id: 'funktion-zuordnung',
            status: 'ready',
            slug: L('funktion-oder-nicht', 'function-or-not'),
            title: L('Funktion oder nicht? Zuordnungen und ihre Graphen', 'Function or not? Relations and their graphs'),
            summary: L(
              'Pfeile zwischen zwei Mengen setzen und sofort sehen, ob die Zuordnung eindeutig ist – synchron als Pfeildiagramm, Wertetabelle und Graph. Dazu der senkrechte Linientest an Kreis, liegender Parabel, Treppenfunktion und mehr, mit Definitions- und Wertemenge.',
              'Draw arrows between two sets and see at once whether the relation is unique – as an arrow diagram, table of values and graph in sync. Plus the vertical line test on a circle, a sideways parabola, a step function and more, with domain and range.',
            ),
            grades: [8, 8],
            kmk: ['M-L3', 'M-K4', 'M-K1', 'M-K5'],
            keywords: L(
              ['Funktion', 'Zuordnung', 'eindeutig', 'Pfeildiagramm', 'Wertetabelle', 'Graph', 'senkrechter Linientest', 'Vertikalentest', 'Definitionsmenge', 'Wertemenge', 'Funktionsgraph', 'Umkehrung', 'Kreis', 'Treppenfunktion'],
              ['function', 'relation', 'mapping', 'unique', 'arrow diagram', 'table of values', 'graph', 'vertical line test', 'domain', 'range', 'inverse', 'circle', 'step function'],
            ),
            thumb: 'generic',
          },
          {
            id: 'funktionsplotter',
            status: 'ready',
            slug: L('funktionsplotter', 'function-plotter'),
            title: L('Funktionsplotter mit eigenen Termen', 'Function plotter with custom terms'),
            summary: L(
              'Bis zu drei eigene Terme eingeben und als Graphen sehen – mit Zoom, Spurpunkt zum Ziehen, Wertetabelle, näherungsweise markierten Nullstellen, Schnitt- und Extrempunkten, Polstellen ohne senkrechte Striche und Scharen mit Parameter.',
              'Type up to three expressions of your own and see their graphs – with zoom, a traced point to drag, a table of values, approximate zeros, intersections and turning points, poles without vertical lines and families with a parameter.',
            ),
            grades: [8, 13],
            uni: true,
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K2'],
            keywords: L(
              ['Funktionsplotter', 'Funktionenplotter', 'Graph zeichnen', 'Term', 'Wertetabelle', 'Spur', 'Nullstelle', 'Schnittpunkt', 'Hochpunkt', 'Tiefpunkt', 'Extrempunkt', 'Polstelle', 'Definitionslücke', 'Asymptote', 'Funktionenschar', 'Parameter', 'Tangente', 'Sinus', 'Exponentialfunktion', 'Logarithmus', 'gebrochen-rational', 'ganzrational'],
              ['function plotter', 'graphing', 'expression', 'table of values', 'trace', 'zero', 'root', 'intersection', 'maximum', 'minimum', 'turning point', 'pole', 'asymptote', 'family of functions', 'parameter', 'tangent', 'sine', 'exponential', 'logarithm', 'rational function', 'polynomial'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('lineare-funktionen', L('Lineare Funktionen', 'Linear functions'), [
          {
            id: 'lineare-funktion',
            status: 'ready',
            slug: L('lineare-funktion', 'linear-function'),
            title: L('Lineare Funktion', 'Linear function'),
            summary: L(
              'Steigung und y-Achsenabschnitt erforschen, Steigungsdreieck und Nullstelle ablesen und zwei Geraden vergleichen.',
              'Explore slope and y-intercept, read off the slope triangle and the zero, and compare two lines.',
            ),
            grades: [7, 9],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Gerade', 'Steigung', 'Steigungsdreieck', 'y-Achsenabschnitt', 'Nullstelle', 'Schnittpunkt', 'parallel', 'senkrecht'],
              ['line', 'slope', 'gradient', 'intercept', 'zero', 'intersection', 'parallel', 'perpendicular'],
            ),
            thumb: 'line',
          },
        ]),
        topic('gebrochen-rationale', L('Gebrochen-rationale Funktionen', 'Rational functions'), [
          {
            id: 'hyperbel',
            status: 'ready',
            slug: L('hyperbel-asymptoten', 'hyperbola-asymptotes'),
            title: L('Hyperbeln und ihre Asymptoten', 'Hyperbolas and their asymptotes'),
            summary: L(
              'Hyperbeln f(x) = a/(x − b) + c strecken und verschieben: Asymptoten, Definitions- und Wertemenge, Rechtecke mit gleichem Flächeninhalt und die Annäherung an die Asymptoten.',
              'Stretch and shift hyperbolas f(x) = a/(x − b) + c: asymptotes, domain and range, rectangles of equal area and how the graph approaches its asymptotes.',
            ),
            grades: [8, 8],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Hyperbel', 'Asymptote', 'Polstelle', 'Definitionslücke', 'Definitionsmenge', 'Wertemenge', 'indirekte Proportionalität', 'gebrochen-rationale Funktion', 'Kehrwertfunktion'],
              ['hyperbola', 'asymptote', 'pole', 'domain', 'range', 'inverse proportion', 'rational function', 'reciprocal function'],
            ),
            thumb: 'generic',
          },
          {
            id: 'polstellen-asymptoten',
            status: 'ready',
            slug: L('polstellen-asymptoten', 'poles-asymptotes'),
            title: L('Polstellen und Asymptoten gebrochen-rationaler Funktionen', 'Poles and asymptotes of rational functions'),
            summary: L(
              'Zähler- und Nennernullstellen ziehen und beobachten: Definitionsmenge, Polstellen mit und ohne Vorzeichenwechsel, behebbare Lücken als Loch im Graphen und waagrechte oder schräge Asymptote aus der Polynomdivision – mit Vorzeichenstreifen, Wertetabelle an der Polstelle und Blick aus der Ferne.',
              'Drag the zeros of numerator and denominator and watch: domain, poles with and without sign change, removable gaps as holes in the graph and the horizontal or oblique asymptote from polynomial division – with a sign strip, a table of values at the pole and a view from afar.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K1'],
            keywords: L(
              ['gebrochen-rationale Funktion', 'Polstelle', 'Asymptote', 'senkrechte Asymptote', 'waagrechte Asymptote', 'schräge Asymptote', 'Definitionslücke', 'hebbare Lücke', 'Polynomdivision', 'Vorzeichenwechsel', 'Grenzwert'],
              ['rational function', 'pole', 'asymptote', 'vertical asymptote', 'horizontal asymptote', 'oblique asymptote', 'removable discontinuity', 'polynomial division', 'sign change', 'limit'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('quadratische-funktionen', L('Quadratische Funktionen', 'Quadratic functions'), [
          {
            id: 'quadratische-funktion',
            status: 'ready',
            slug: L('quadratische-funktion', 'quadratic-function'),
            title: L('Quadratische Funktion', 'Quadratic function'),
            summary: L(
              'Parabeln strecken, spiegeln und verschieben – in Scheitelpunktform oder allgemeiner Form, mit Nullstellen und Scheitelpunkt.',
              'Stretch, reflect and shift parabolas – in vertex form or standard form, with zeros and vertex.',
            ),
            grades: [9, 10],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Parabel', 'Scheitelpunkt', 'Scheitelpunktform', 'Normalparabel', 'Nullstellen', 'Diskriminante', 'Lösungsformel', 'Streckfaktor'],
              ['parabola', 'vertex', 'vertex form', 'zeros', 'roots', 'discriminant', 'quadratic formula'],
            ),
            thumb: 'parabola',
          },
          {
            id: 'parabel-drei-punkte',
            status: 'ready',
            slug: L('parabel-durch-drei-punkte', 'parabola-through-three-points'),
            title: L('Parabel durch drei Punkte', 'Parabola through three points'),
            summary: L(
              'Drei Punkte ziehen, die Parabel y = ax² + bx + c gleitet mit: Einsetzen ergibt ein lineares Gleichungssystem, das Schritt für Schritt gelöst wird – mit Scheitel- und Nullstellenform und den Sonderfällen.',
              'Drag three points and the parabola y = ax² + bx + c follows: substituting gives a system of linear equations that is solved step by step – with vertex form, factored form and the special cases.',
            ),
            grades: [9, 9],
            kmk: ['M-L3', 'M-K2', 'M-K3', 'M-K5'],
            keywords: L(
              ['Parabel', 'drei Punkte', 'lineares Gleichungssystem', 'Additionsverfahren', 'Einsetzen', 'Scheitelform', 'Nullstellenform', 'quadratische Funktion', 'Funktionsterm bestimmen'],
              ['parabola', 'three points', 'system of linear equations', 'elimination', 'substitution', 'vertex form', 'factored form', 'quadratic function', 'curve fitting'],
            ),
            thumb: 'generic',
          },
          {
            id: 'extremwert-parabel',
            status: 'ready',
            slug: L('extremwertaufgaben-parabeln', 'optimisation-problems-parabolas'),
            title: L('Extremwertaufgaben mit Parabeln', 'Optimisation problems with parabolas'),
            summary: L(
              'Gehege, Rechteck im Dreieck, Eintrittspreis, Regenrinne: Bild und Graph der quadratischen Zielfunktion bewegen sich gemeinsam – das Maximum erst durch Probieren, dann exakt mit quadratischer Ergänzung finden.',
              'Enclosure, rectangle in a triangle, ticket price, gutter: the picture and the graph of the quadratic objective function move together – find the maximum by trial and error first, then exactly by completing the square.',
            ),
            grades: [9, 9],
            kmk: ['M-L3', 'M-K2', 'M-K3', 'M-K5'],
            keywords: L(
              ['Extremwertaufgabe', 'Maximum', 'Scheitelpunkt', 'quadratische Ergänzung', 'Scheitelform', 'Zielfunktion', 'Nebenbedingung', 'Definitionsbereich', 'Optimierung', 'Erlös'],
              ['optimisation problem', 'maximum', 'vertex', 'completing the square', 'vertex form', 'objective function', 'constraint', 'domain', 'optimization', 'revenue'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('potenzfunktionen', L('Potenzfunktionen', 'Power functions'), [
          planned('potenzfunktionen', L('Potenzfunktionen y = a · xⁿ', 'Power functions y = a · xⁿ'), [9, 10]),
        ]),
        topic('trigonometrische-funktionen', L('Trigonometrische Funktionen', 'Trigonometric functions'), [
          {
            id: 'einheitskreis',
            status: 'ready',
            slug: L('einheitskreis', 'unit-circle'),
            title: L('Einheitskreis', 'Unit circle'),
            summary: L(
              'Sinus, Kosinus und Tangens am Einheitskreis – und wie daraus die Sinuskurve entsteht. Mit Animation.',
              'Sine, cosine and tangent on the unit circle – and how the sine curve emerges from it. With animation.',
            ),
            grades: [9, 10],
            kmk: ['M-L3', 'M-L4', 'M-K4'],
            keywords: L(
              ['Sinus', 'Kosinus', 'Tangens', 'Bogenmaß', 'Gradmaß', 'Winkel', 'Quadrant', 'Periode'],
              ['sine', 'cosine', 'tangent', 'radians', 'degrees', 'angle', 'quadrant', 'period'],
            ),
            thumb: 'unit-circle',
          },
          {
            id: 'sinusfunktion',
            status: 'ready',
            slug: L('sinusfunktion', 'sine-function'),
            title: L('Allgemeine Sinusfunktion', 'General sine function'),
            summary: L(
              'Amplitude, Periode und Verschiebungen von f(x) = a·sin(b(x − c)) + d mit Reglern und ziehbaren Punkten erkunden.',
              'Explore amplitude, period and shifts of f(x) = a·sin(b(x − c)) + d with sliders and draggable points.',
            ),
            grades: [10, 11],
            kmk: ['M-L3', 'M-K3', 'M-K4'],
            keywords: L(
              ['Sinus', 'Kosinus', 'Amplitude', 'Periode', 'Phasenverschiebung', 'Schwingung', 'Bogenmaß'],
              ['sine', 'cosine', 'amplitude', 'period', 'phase shift', 'oscillation', 'radians'],
            ),
            thumb: 'sine',
          },
        ]),
        topic('exponentialfunktionen', L('Exponentialfunktionen und Logarithmus', 'Exponential functions and logarithms'), [
          {
            id: 'exponentielles-wachstum',
            status: 'ready',
            slug: L('exponentielles-wachstum', 'exponential-growth'),
            title: L('Exponentielles Wachstum und Zerfall', 'Exponential growth and decay'),
            summary: L(
              'Seerosen auf dem Teich, Zinseszins und radioaktiver Zerfall: f(t) = a · bᵗ mit Verdopplungs- und Halbwertszeit, im Vergleich zum linearen Wachstum.',
              'Water lilies on a pond, compound interest and radioactive decay: f(t) = a · bᵗ with doubling time and half-life, compared with linear growth.',
            ),
            grades: [10, 10],
            kmk: ['M-L3', 'M-K3', 'M-K4'],
            keywords: L(
              ['exponentielles Wachstum', 'Wachstumsfaktor', 'Verdopplungszeit', 'Halbwertszeit', 'Zinseszins', 'Zerfall', 'Exponentialfunktion', 'logarithmische Skala'],
              ['exponential growth', 'growth factor', 'doubling time', 'half-life', 'compound interest', 'decay', 'exponential function', 'logarithmic scale'],
            ),
            thumb: 'growth',
          },
          planned('logarithmus', L('Logarithmus als Umkehrung des Potenzierens', 'Logarithms as the inverse of exponentiation'), [10, 12]),
          planned('e-funktion', L('Die natürliche Exponentialfunktion', 'The natural exponential function'), [12, 12]),
        ]),
        topic('ganzrationale', L('Ganzrationale Funktionen', 'Polynomial functions'), [
          {
            id: 'ganzrationale-funktionen',
            status: 'ready',
            slug: L('ganzrationale-funktionen', 'polynomial-functions'),
            title: L('Ganzrationale Funktionen: Nullstellen, Vielfachheit und Randverhalten', 'Polynomial functions: zeros, multiplicity and end behaviour'),
            summary: L(
              'Nullstellen auf der x-Achse ziehen und ihre Vielfachheit wählen: Der Graph schneidet, berührt oder hat einen Terrassenpunkt. Dazu Term in Linearfaktoren und Normalform, Vorzeichenbereiche und Randverhalten.',
              'Drag zeros along the x-axis and choose their multiplicity: the graph crosses, touches or has a terrace point. With the factored and expanded form, sign regions and end behaviour.',
            ),
            grades: [10, 11],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['ganzrationale Funktion', 'Polynom', 'Nullstelle', 'Vielfachheit', 'Linearfaktor', 'Berührpunkt', 'Terrassenpunkt', 'Vorzeichenwechsel', 'Randverhalten', 'Grad', 'Leitkoeffizient', 'Normalform'],
              ['polynomial function', 'polynomial', 'zero', 'root', 'multiplicity', 'linear factor', 'touching point', 'terrace point', 'sign change', 'end behaviour', 'degree', 'leading coefficient'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('eigenschaften', L('Eigenschaften von Funktionen', 'Properties of functions'), [
          {
            id: 'transformationen',
            status: 'ready',
            slug: L('graphen-verschieben-strecken-spiegeln', 'shifting-stretching-reflecting-graphs'),
            title: L('Graphen verschieben, strecken und spiegeln', 'Shifting, stretching and reflecting graphs'),
            summary: L(
              'Aus einer Grundfunktion f wird g(x) = a · f(b(x − c)) + d: Punkte am Graphen ziehen, markante Punkte wandern mit, und eine Schrittfolge zeigt, was jeder Parameter bewirkt – für Parabel, Wurzel, Hyperbel, Sinus, Exponentialfunktion und mehr.',
              'From a basic function f to g(x) = a · f(b(x − c)) + d: drag points on the graph, watch key points move, and step through what each parameter does – for parabola, square root, hyperbola, sine, exponential and more.',
            ),
            grades: [11, 11],
            kmk: ['M-L3', 'M-K4'],
            keywords: L(
              ['Verschiebung', 'Streckung', 'Stauchung', 'Spiegelung', 'Transformation', 'Graph', 'Parameter', 'Grundfunktion', 'x-Richtung', 'y-Richtung', 'Asymptote'],
              ['shift', 'translation', 'stretch', 'compression', 'reflection', 'transformation', 'graph', 'parameter', 'basic function'],
            ),
            thumb: 'generic',
          },
          {
            id: 'grenzverhalten',
            status: 'ready',
            slug: L('grenzverhalten-asymptoten', 'limits-and-asymptotes'),
            title: L('Grenzverhalten und Asymptoten', 'Limits and asymptotes'),
            summary: L(
              'Wie verhält sich f(x) für x → ±∞? Ein Punkt läuft nach außen, die Ansicht zoomt mit und die Wertetabelle zeigt die Annäherung an die Asymptote; ein ziehbarer ε-Streifen macht den Grenzwert anschaulich. Dazu Gegenbeispiele ohne Grenzwert.',
              'How does f(x) behave as x → ±∞? A point runs outwards, the view zooms out and a table shows the approach to the asymptote; a draggable ε-strip makes the limit visible. Plus counterexamples without a limit.',
            ),
            grades: [11, 11],
            kmk: ['M-L3', 'M-K1', 'M-K4'],
            keywords: L(
              ['Grenzwert', 'Grenzverhalten', 'Asymptote', 'waagrechte Asymptote', 'unendlich', 'Limes', 'ε-Streifen', 'Annäherung', 'Wertetabelle', 'gebrochen-rationale Funktion'],
              ['limit', 'end behaviour', 'asymptote', 'horizontal asymptote', 'infinity', 'epsilon strip', 'approach', 'table of values', 'rational function'],
            ),
            thumb: 'generic',
          },
          {
            id: 'umkehrfunktion',
            status: 'ready',
            slug: L('umkehrfunktion', 'inverse-function'),
            title: L('Umkehrfunktionen: Spiegeln an y = x', 'Inverse functions: reflecting in y = x'),
            summary: L(
              'Ein Punkt P auf dem Graphen und sein Spiegelbild P′ an y = x; der Graph klappt per Animation über die Spiegelachse, die Wertetabelle tauscht die Spalten. Rechenweg „nach x auflösen, x und y tauschen“ für x², eˣ, 1/x, verschobene Parabel u. a., Waagrechtentest und die Steigung der Umkehrfunktion (f⁻¹)′ = 1/f′.',
              'A point P on the graph and its image P′ in y = x; an animation flips the graph across the mirror line and the table swaps its columns. Steps “solve for x, swap x and y” for x², eˣ, 1/x, a shifted parabola and more, the horizontal line test and the slope of the inverse (f⁻¹)′ = 1/f′.',
            ),
            grades: [12, 12],
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K1'],
            keywords: L(
              ['Umkehrfunktion', 'umkehrbar', 'Spiegelung', 'Winkelhalbierende', 'y = x', 'Wurzelfunktion', 'Logarithmus', 'ln', 'Monotonie', 'Definitionsmenge', 'Wertemenge', 'Waagrechtentest', 'Ableitung der Umkehrfunktion', 'Wertetabelle'],
              ['inverse function', 'invertible', 'reflection', 'y = x', 'square root', 'logarithm', 'ln', 'monotonic', 'domain', 'range', 'horizontal line test', 'derivative of the inverse', 'table of values'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
    area({
      id: 'stochastik',
      slug: L('daten-und-zufall', 'data-and-chance'),
      title: L('Daten und Zufall', 'Data and chance'),
      description: L(
        'Daten darstellen und kritisch lesen, Zufallsexperimente tausendfach wiederholen und Verteilungen entstehen sehen.',
        'Display and critically read data, repeat random experiments thousands of times and watch distributions emerge.',
      ),
      kmk: ['M-L5', 'M-K3', 'M-K4'],
      topics: [
        topic('zaehlen', L('Zählen', 'Counting'), [
          {
            id: 'zaehlprinzip',
            status: 'ready',
            slug: L('zaehlprinzip-baumdiagramm', 'counting-principle-tree-diagram'),
            title: L('Zählprinzip und Baumdiagramm', 'Counting principle and tree diagrams'),
            summary: L(
              'Outfits, Eistüten, Zahlenschloss, Menü und Siegerpodest: Das Baumdiagramm wächst Stufe für Stufe, jeder Pfad wird ein Ergebnis-Kärtchen – und die Anzahl ist das Produkt der Möglichkeiten je Stufe.',
              'Outfits, ice-cream cones, a combination lock, a menu and a podium: the tree diagram grows stage by stage, every path becomes an outcome card – and the number is the product of the choices per stage.',
            ),
            grades: [5, 8],
            kmk: ['M-L5', 'M-L1', 'M-K2', 'M-K4'],
            keywords: L(
              ['Zählprinzip', 'Produktregel', 'Baumdiagramm', 'Kombinatorik', 'systematisches Abzählen', 'mit Wiederholung', 'ohne Wiederholung', 'Fakultät', 'Reihenfolge', 'PIN'],
              ['counting principle', 'product rule', 'tree diagram', 'combinatorics', 'systematic counting', 'with repetition', 'without repetition', 'factorial', 'order', 'PIN'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('daten', L('Daten auswerten', 'Analysing data'), [
          {
            id: 'diagramme',
            status: 'ready',
            slug: L('diagramme-lesen-und-pruefen', 'reading-charts-critically'),
            title: L('Diagramme lesen und kritisch prüfen', 'Reading charts critically'),
            summary: L(
              'Ein Datensatz als Strichliste, Säulen-, Balken-, Linien-, Streifen- oder Kreisdiagramm und Piktogramm – die Formen verwandeln sich ineinander. Dazu typische Täuschungen zum Aufdecken und ein Detektiv-Modus.',
              'One data set as a tally chart, column, bar, line, strip or pie chart and pictogram – the shapes morph into each other. Plus typical tricks to uncover and a detective mode.',
            ),
            grades: [6, 6],
            kmk: ['M-L5', 'M-K6', 'M-K4', 'M-K1'],
            keywords: L(
              ['Diagramm', 'Säulendiagramm', 'Balkendiagramm', 'Kreisdiagramm', 'Liniendiagramm', 'Piktogramm', 'Streifendiagramm', 'Strichliste', 'Anteil', 'Prozent', 'Mittelpunktswinkel', 'abgeschnittene Achse', 'Täuschung', 'Daten'],
              ['chart', 'column chart', 'bar chart', 'pie chart', 'line chart', 'pictogram', 'strip chart', 'tally chart', 'share', 'percent', 'central angle', 'truncated axis', 'misleading graphs', 'data'],
            ),
            thumb: 'generic',
          },
          planned('boxplot', L('Mittelwert, Median und Boxplot', 'Mean, median and box plots'), [7, 7]),
        ]),
        topic('wahrscheinlichkeit', L('Wahrscheinlichkeit', 'Probability'), [
          {
            id: 'gesetz-grosse-zahlen',
            status: 'ready',
            slug: L('gesetz-der-grossen-zahlen', 'law-of-large-numbers'),
            title: L('Gesetz der großen Zahlen', 'Law of large numbers'),
            summary: L(
              'Münze, Würfel oder Reißnagel tausendfach werfen: Die relative Häufigkeit stabilisiert sich bei der Wahrscheinlichkeit.',
              'Toss a coin, die or drawing pin thousands of times: the relative frequency settles at the probability.',
            ),
            grades: [6, 9],
            kmk: ['M-L5', 'M-K3', 'M-K4'],
            keywords: L(
              ['relative Häufigkeit', 'absolute Häufigkeit', 'Wahrscheinlichkeit', 'Zufallsexperiment', 'Würfel', 'Münze', 'Reißnagel', 'empirisches Gesetz der großen Zahlen'],
              ['relative frequency', 'absolute frequency', 'probability', 'random experiment', 'die', 'coin', 'drawing pin', 'law of large numbers'],
            ),
            thumb: 'frequency',
          },
          planned('baumdiagramm', L('Mehrstufige Zufallsexperimente und Pfadregeln', 'Multi-stage experiments and path rules'), [8, 10]),
          {
            id: 'ziegenproblem',
            status: 'ready',
            slug: L('ziegenproblem', 'monty-hall-problem'),
            title: L('Ziegenproblem', 'Monty Hall problem'),
            summary: L(
              'Selbst spielen oder tausende Spiele simulieren: Lohnt es sich, die Tür zu wechseln? Auch mit bis zu zehn Türen.',
              'Play yourself or simulate thousands of games: is it worth switching doors? Also with up to ten doors.',
            ),
            grades: [10, 10],
            kmk: ['M-L5', 'M-K2', 'M-K3'],
            keywords: L(
              ['Ziegenproblem', 'Monty-Hall-Problem', 'Drei-Türen-Problem', 'bedingte Wahrscheinlichkeit', 'Simulation', 'Baumdiagramm', 'Wechseln'],
              ['Monty Hall problem', 'three doors', 'goat', 'conditional probability', 'simulation', 'tree diagram', 'switch'],
            ),
            thumb: 'doors',
          },
          planned('geburtstagsproblem', L('Geburtstagsproblem simulieren', 'Simulating the birthday problem'), [10, 10]),
          {
            id: 'monte-carlo-pi',
            status: 'ready',
            slug: L('monte-carlo-pi', 'monte-carlo-pi'),
            title: L('Monte-Carlo-Methode: π mit Zufall bestimmen', 'Monte Carlo method: estimating π by chance'),
            summary: L(
              'Zufallspunkte regnen auf ein Quadrat: Aus dem Anteil im Kreis wird ein Schätzwert für π – und er wird immer genauer.',
              'Random points rain onto a square: the share inside the circle gives an estimate of π – and it keeps improving.',
            ),
            grades: [10, 10],
            kmk: ['M-L5', 'M-L2', 'M-K3'],
            keywords: L(
              ['Monte-Carlo', 'Kreiszahl', 'Pi', 'Simulation', 'Zufallszahlen', 'Flächenverhältnis', 'Kreisfläche'],
              ['Monte Carlo', 'pi', 'simulation', 'random numbers', 'area ratio', 'circle area'],
            ),
            thumb: 'monte-carlo',
          },
        ]),
        topic('verknuepfte-ereignisse', L('Verknüpfte Ereignisse und bedingte Wahrscheinlichkeit', 'Combined events and conditional probability'), [
          planned('vierfeldertafel', L('Vierfeldertafel und Mengendiagramm', 'Two-way tables and Venn diagrams'), [9, 11]),
          planned('bedingte-wahrscheinlichkeit', L('Bedingte Wahrscheinlichkeit am Beispiel medizinischer Tests', 'Conditional probability with medical tests'), [11, 11], { kmk: ['M-L5', 'M-K3'] }),
        ]),
        topic('verteilungen', L('Wahrscheinlichkeitsverteilungen und Testen', 'Probability distributions and testing'), [
          {
            id: 'galtonbrett',
            status: 'ready',
            slug: L('galtonbrett', 'galton-board'),
            title: L('Galtonbrett', 'Galton board'),
            summary: L(
              'Kugeln prallen an Nagelreihen ab und sammeln sich in Fächern – so entsteht die Binomialverteilung, mit Pascal’schem Dreieck und Glockenkurve.',
              'Balls bounce off rows of pegs and collect in bins – forming the binomial distribution, with Pascal’s triangle and bell curve.',
            ),
            grades: [9, 12],
            kmk: ['M-L5', 'M-K3', 'M-K4'],
            keywords: L(
              ['Galtonbrett', 'Binomialverteilung', 'Bernoulli-Kette', 'Pascal’sches Dreieck', 'Binomialkoeffizient', 'Normalverteilung', 'Erwartungswert', 'Standardabweichung'],
              ['Galton board', 'binomial distribution', 'Bernoulli trials', 'Pascal’s triangle', 'binomial coefficient', 'normal distribution', 'expected value', 'standard deviation'],
            ),
            thumb: 'galton',
          },
          planned('binomialverteilung', L('Binomialverteilung', 'Binomial distribution'), [12, 12]),
          planned('signifikanztest', L('Einseitiger Signifikanztest: Fehler 1. und 2. Art', 'One-sided significance test: type I and II errors'), [12, 12]),
          {
            id: 'normalverteilung',
            status: 'ready',
            slug: L('normalverteilung', 'normal-distribution'),
            title: L('Normalverteilung', 'Normal distribution'),
            summary: L(
              'Wahrscheinlichkeit als Fläche unter der Glockenkurve: Grenzen ziehen, Φ(b) − Φ(a) ablesen, Sigma-Regeln und Standardisierung – dazu die Näherung der Binomialverteilung mit Stetigkeitskorrektur und Laplace-Bedingung und Stichproben, deren Histogramm sich der Glocke nähert.',
              'Probability as the area under the bell curve: drag the bounds, read Φ(b) − Φ(a), sigma rules and standardisation – plus approximating the binomial distribution with continuity correction and Laplace condition, and samples whose histogram approaches the bell.',
            ),
            grades: [13, 13],
            uni: true,
            kmk: ['M-L5', 'M-K3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Normalverteilung', 'Gauß', 'Glockenkurve', 'Dichtefunktion', 'Verteilungsfunktion', 'Erwartungswert', 'Standardabweichung', 'Sigma-Regeln', 'Standardisierung', 'stetige Zufallsgröße', 'Binomialverteilung', 'Näherung', 'Stetigkeitskorrektur', 'Laplace-Bedingung', 'Stichprobe', 'Histogramm'],
              ['normal distribution', 'Gaussian', 'bell curve', 'density', 'distribution function', 'mean', 'standard deviation', 'sigma rules', 'z-score', 'continuous random variable', 'binomial distribution', 'approximation', 'continuity correction', 'Laplace condition', 'sample', 'histogram'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
    area({
      id: 'analysis',
      slug: L('analysis', 'calculus'),
      title: L('Analysis', 'Calculus'),
      description: L(
        'Ableitung und Integral anschaulich: von der Sekante zur Tangente, von Rechtecksummen zur Fläche und vom Graphen zur Stammfunktion.',
        'Derivatives and integrals made visual: from secant to tangent, from rectangle sums to area and from a graph to its antiderivative.',
      ),
      kmk: ['M-L3', 'M-L2', 'M-K1', 'M-K4'],
      topics: [
        topic('differenzialrechnung', L('Differenzialrechnung', 'Differential calculus'), [
          {
            id: 'sekante-tangente',
            status: 'ready',
            slug: L('sekante-tangente', 'secant-to-tangent'),
            title: L('Von der Sekante zur Tangente', 'From secant to tangent'),
            summary: L(
              'Den Punkt Q auf P zulaufen lassen: Aus dem Differenzenquotienten wird die Ableitung – mit Wertetabelle und Ableitungsgraph.',
              'Let point Q run towards P: the difference quotient becomes the derivative – with a table of values and the derivative graph.',
            ),
            grades: [11, 11],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Sekante', 'Tangente', 'Differenzenquotient', 'Differentialquotient', 'Ableitung', 'Steigung', 'Grenzwert', 'h-Methode', 'lokale Änderungsrate'],
              ['secant', 'tangent', 'difference quotient', 'derivative', 'slope', 'limit', 'rate of change'],
            ),
            thumb: 'secant',
          },
          {
            id: 'newton-verfahren',
            status: 'ready',
            slug: L('newton-verfahren', 'newtons-method'),
            title: L('Newton-Verfahren', 'Newton’s method'),
            summary: L(
              'Nullstellen näherungsweise bestimmen: Tangente anlegen, Schnittpunkt mit der x-Achse als neuer Wert – Schritt für Schritt animiert, mit ziehbarem Startwert, Tabelle der richtigen Stellen, Einzugsbereichen der Nullstellen, Vergleich mit der Intervallhalbierung und Gegenbeispielen (waagrechte Tangente, Zyklus).',
              'Approximating zeros: draw the tangent and use its x-intercept as the next value – animated step by step, with a draggable starting value, a table of correct digits, basins of attraction, a comparison with bisection and counterexamples (horizontal tangent, cycle).',
            ),
            grades: [11, 11],
            kmk: ['M-L3', 'M-L1', 'M-K2', 'M-K5'],
            keywords: L(
              ['Newton-Verfahren', 'Nullstelle', 'Näherungsverfahren', 'Iteration', 'Tangente', 'Ableitung', 'Startwert', 'Konvergenz', 'Wurzel 2', 'Intervallhalbierung', 'Bisektion', 'Einzugsbereich', 'quadratische Konvergenz'],
              ['Newton’s method', 'Newton-Raphson', 'zero', 'root', 'iteration', 'tangent', 'derivative', 'starting value', 'convergence', 'bisection', 'basin of attraction', 'quadratic convergence'],
            ),
            thumb: 'generic',
          },
          {
            id: 'ableitungsfunktion',
            status: 'ready',
            slug: L('ableitungsfunktion-grafisch', 'derivative-function-graphically'),
            title: L('Ableitungsfunktion grafisch', 'The derivative function graphically'),
            summary: L(
              'Tangente und Steigungsdreieck zeichnen den Graphen von f′ und f″ als Spur, die Sekante wird für h → 0 zur Tangente (links, rechts, beidseitig, Knick bei |x|). Dazu Merkmale mit Vorzeichentabelle, eine eigene Skizze von f′, Ableitungsregeln als Bild und neun Alltagsbeispiele mit Einheiten.',
              'Tangent and slope triangle trace the graphs of f′ and f″, the secant becomes the tangent as h → 0 (left, right, symmetric, kink of |x|). Plus features with a sign chart, your own sketch of f′, the rules of differentiation as pictures and nine everyday examples with units.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-K4', 'M-K1', 'M-K5', 'M-K3'],
            keywords: L(
              ['Ableitung', 'Ableitungsfunktion', 'Tangente', 'Sekante', 'Differenzenquotient', 'Steigungsdreieck', 'grafisches Ableiten', 'Monotonie', 'Extremstelle', 'Wendestelle', 'Sattelpunkt', 'zweite Ableitung', 'Krümmung', 'Differenzierbarkeit', 'Faktorregel', 'Summenregel', 'Potenzregel', 'Produktregel', 'Kettenregel', 'Geschwindigkeit', 'Grenzkosten', 'Sinus', 'Kosinus'],
              ['derivative', 'derivative function', 'tangent', 'secant', 'difference quotient', 'slope triangle', 'graphical differentiation', 'monotonicity', 'extremum', 'inflection point', 'saddle point', 'second derivative', 'curvature', 'differentiability', 'constant multiple rule', 'sum rule', 'power rule', 'product rule', 'chain rule', 'velocity', 'marginal cost', 'sine', 'cosine'],
            ),
            thumb: 'generic',
          },
          {
            id: 'kurvendiskussion',
            status: 'ready',
            slug: L('monotonie-extrem-wendestellen', 'monotonicity-extrema-inflection'),
            title: L('Monotonie, Extrem- und Wendestellen', 'Monotonicity, extrema and inflection points'),
            summary: L(
              'Eine Funktionsuntersuchung in sieben Schritten: Ableitungen, Symmetrie und Verhalten im Unendlichen, Nullstellen, notwendige und hinreichende Bedingung, Hoch-, Tief- und Terrassenpunkte, Wendepunkte, Monotonie- und Krümmungsintervalle – mit den Graphen von f′ und f″ darunter, wandernder Tangente, Vorzeichentabelle und frei wählbaren Koeffizienten.',
              'Investigating a function in seven steps: derivatives, symmetry and end behaviour, zeros, necessary and sufficient conditions, maxima, minima and terrace points, inflection points, intervals of monotonicity and curvature – with the graphs of f′ and f″ below, a moving tangent, a sign chart and freely chosen coefficients.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-K5', 'M-K1', 'M-K4'],
            keywords: L(
              ['Kurvendiskussion', 'Funktionsuntersuchung', 'Monotonie', 'Extremstelle', 'Hochpunkt', 'Tiefpunkt', 'Terrassenpunkt', 'Wendepunkt', 'notwendige Bedingung', 'hinreichende Bedingung', 'Vorzeichenwechsel', 'Vorzeichentabelle', 'Krümmung'],
              ['curve sketching', 'monotonicity', 'extremum', 'maximum', 'minimum', 'terrace point', 'inflection point', 'necessary condition', 'sufficient condition', 'sign change', 'sign chart', 'concavity'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('funktionsuntersuchung', L('Funktionenscharen und Stammfunktionen', 'Families of functions and antiderivatives'), [
          {
            id: 'funktionenscharen',
            status: 'ready',
            slug: L('funktionenscharen', 'families-of-functions'),
            title: L('Funktionenscharen', 'Families of functions'),
            summary: L(
              'Viele Graphen einer Schar f_k auf einen Blick: Wie hängen Extrem- und Wendepunkte vom Parameter k ab, auf welcher Ortskurve wandern sie, welche Punkte haben alle Kurven gemeinsam – und wann keine? Mit Herleitungen, ziehbaren Extrempunkten und der Fallunterscheidung auf einem k-Strahl.',
              'Many graphs of a family f_k at a glance: how do extrema and points of inflection depend on the parameter k, along which locus do they move, which points do all curves share – and when none? With derivations, draggable extrema and the case analysis on a k-axis.',
            ),
            grades: [12, 13],
            kmk: ['M-L3', 'M-K5', 'M-K1', 'M-K2'],
            keywords: L(
              ['Funktionenschar', 'Kurvenschar', 'Parameter', 'Ortskurve', 'Extrempunkte', 'gemeinsamer Punkt', 'Fallunterscheidung', 'Wendepunkt', 'e-Funktion', 'ganzrationale Funktion'],
              ['family of functions', 'family of curves', 'parameter', 'locus', 'extrema', 'common point', 'case analysis', 'point of inflection', 'exponential function', 'polynomial'],
            ),
            thumb: 'generic',
          },
          {
            id: 'stammfunktion-grafisch',
            status: 'ready',
            slug: L('stammfunktion-grafisch', 'antiderivative-graphically'),
            title: L('Vom Graphen zur Stammfunktion', 'From a graph to its antiderivative'),
            summary: L(
              'Grafisch aufleiten: Die Höhe von f wird zur Steigung von F, ein Richtungsfeld zeigt die Schar F + C mit ziehbarem Anfangspunkt, Nullstellen und Extremstellen von f werden zu Extrem- und Wendestellen von F, Flächenstücke zu Höhenänderungen – auch umgekehrt von F nach f, mit eigener Skizze zum Vergleichen und acht Alltagsbeispielen von Kontostand bis CO₂ im Klassenzimmer.',
              'Integrating graphically: the height of f becomes the slope of F, a slope field shows the family F + C with a draggable initial point, zeros and extrema of f become extrema and inflection points of F, area pieces become changes in height – also in reverse from F to f, with your own sketch to compare and eight everyday examples from a bank balance to CO₂ in the classroom.',
            ),
            grades: [12, 13],
            kmk: ['M-L3', 'M-K4', 'M-K1', 'M-K5'],
            keywords: L(
              ['Stammfunktion', 'grafisches Aufleiten', 'grafisches Integrieren', 'Integrationskonstante', 'Kurvenschar', 'Richtungsfeld', 'Anfangswertproblem', 'Anfangswert', 'orientierte Fläche', 'Flächenbilanz', 'Monotonie', 'Extremstelle', 'Wendestelle', 'Terrassenpunkt', 'Vorzeichentabelle', 'Änderungsrate', 'Bestand'],
              ['antiderivative', 'graphical integration', 'constant of integration', 'family of curves', 'slope field', 'initial value problem', 'signed area', 'monotonicity', 'extremum', 'inflection point', 'saddle point', 'sign chart', 'rate of change', 'accumulation'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('integralrechnung', L('Integralrechnung', 'Integral calculus'), [
          {
            id: 'ober-untersummen',
            status: 'ready',
            slug: L('ober-und-untersummen', 'riemann-sums'),
            title: L('Integral als Flächenbilanz (Rechtecksummen)', 'The integral as signed area (rectangle sums)'),
            summary: L(
              'Unter-, Ober-, Mittel- und Trapezsummen annähern, n verdoppeln und zusehen, wie die Summen gegen das Integral streben.',
              'Approximate with lower, upper, midpoint and trapezoidal sums, double n and watch the sums approach the integral.',
            ),
            grades: [12, 13],
            kmk: ['M-L2', 'M-L3', 'M-K4'],
            keywords: L(
              ['Integral', 'Untersumme', 'Obersumme', 'Rechtecksumme', 'Flächenbilanz', 'Riemann-Summe', 'Trapezregel', 'Grenzwert'],
              ['integral', 'lower sum', 'upper sum', 'Riemann sum', 'signed area', 'trapezoidal rule', 'limit'],
            ),
            thumb: 'riemann',
          },
          {
            id: 'hauptsatz',
            status: 'ready',
            slug: L('hauptsatz', 'fundamental-theorem'),
            title: L('Integralfunktion und Hauptsatz', 'Integral function and fundamental theorem'),
            summary: L(
              'Die Fläche von a bis x als Funktion von x: Fläche wächst mit, Streifen h → 0 zeigt I′ = f, Rechenweg F(b) − F(a) mit Konstante C, Null-, Extrem- und Wendestellen von I am Graphen von f, Riemann-Summen – mit acht Anwendungen von Weg bis Regenmenge.',
              'The area from a to x as a function of x: the area grows, a strip h → 0 shows I′ = f, step-by-step F(b) − F(a) with constant C, zeros, extrema and inflection points of I from the graph of f, Riemann sums – with eight applications from distance to rainfall.',
            ),
            grades: [12, 13],
            uni: true,
            kmk: ['M-L3', 'M-L2', 'M-K1', 'M-K5'],
            keywords: L(
              ['Hauptsatz der Differential- und Integralrechnung', 'Integralfunktion', 'Stammfunktion', 'bestimmtes Integral', 'Flächenbilanz', 'untere Grenze', 'Differenzenquotient', 'F(b) − F(a)', 'Riemann-Summe', 'Wendestelle', 'Änderungsrate', 'Bestand', 'Grenzkosten'],
              ['fundamental theorem of calculus', 'integral function', 'antiderivative', 'definite integral', 'signed area', 'lower limit', 'difference quotient', 'Riemann sum', 'point of inflection', 'rate of change', 'accumulation', 'marginal cost'],
            ),
            thumb: 'generic',
          },
          {
            id: 'aenderungsrate',
            status: 'ready',
            slug: L('integral-gesamtaenderung', 'integral-total-change'),
            title: L('Integral als Gesamtänderung: von der Geschwindigkeit zum Weg', 'The integral as total change: from velocity to distance'),
            summary: L(
              'Aus der Änderungsrate den Bestand rekonstruieren: Die Fläche unter dem Geschwindigkeitsgraphen ist der Weg, die Fläche unter der Zuflussrate die Änderung der Füllmenge – mit Rechtecksummen (links, rechts, Mitte), die sich als Treppe zum Bestand stapeln, Fehlerdiagramm, negativen Flächen, Extremstellen beim Vorzeichenwechsel und einer selbst gezeichneten Rate.',
              'Reconstructing an amount from its rate of change: the area under the velocity graph is the distance, the area under the inflow rate the change in volume – with rectangle sums (left, right, midpoint) that stack into a staircase, an error chart, negative areas, extrema at sign changes and a rate you draw yourself.',
            ),
            grades: [13, 13],
            kmk: ['M-L3', 'M-L2', 'M-K3', 'M-K4'],
            keywords: L(
              ['Integral', 'Änderungsrate', 'Gesamtänderung', 'Rekonstruktion', 'Bestand', 'Geschwindigkeit', 'Weg', 'Zufluss', 'Rechtecksumme', 'Mittelpunktsumme', 'Hauptsatz', 'Modellieren'],
              ['integral', 'rate of change', 'total change', 'reconstruction', 'amount', 'velocity', 'distance', 'inflow', 'Riemann sum', 'midpoint sum', 'fundamental theorem', 'modelling'],
            ),
            thumb: 'generic',
          },
          {
            id: 'rotationskoerper',
            status: 'ready',
            slug: L('rotationskoerper', 'solids-of-revolution'),
            title: L('Rotationskörper', 'Solids of revolution'),
            summary: L(
              'Die Fläche unter einem Graphen dreht sich um die x-Achse: Kugel, Kegel, Paraboloid oder Gabriels Horn entstehen, werden in Zylinderscheiben zerlegt und ihr Volumen V = π∫f(x)² dx berechnet.',
              'The region under a graph turns about the x-axis: a sphere, cone, paraboloid or Gabriel’s horn appears, is cut into cylindrical discs and its volume V = π∫f(x)² dx is computed.',
            ),
            grades: [13, 13],
            kmk: ['M-L2', 'M-L3', 'M-L4', 'M-K4'],
            keywords: L(
              ['Rotationskörper', 'Rotationsvolumen', 'Integral', 'Scheibenmethode', 'Querschnitt', 'Kugel', 'Kegel', 'Paraboloid', 'Gabriels Horn', 'Volumen'],
              ['solid of revolution', 'volume of revolution', 'integral', 'disc method', 'cross-section', 'sphere', 'cone', 'paraboloid', 'Gabriel’s horn', 'volume'],
            ),
            thumb: 'generic',
          },
          {
            id: 'extremwertprobleme',
            status: 'ready',
            slug: L('extremwertprobleme', 'optimisation-problems'),
            title: L('Extremwertprobleme', 'Optimisation problems'),
            summary: L(
              'Schachtel aus Karton (mit Faltanimation), Dose mit kleinster Oberfläche, Rechteck unter einer e-Funktion, größter Zylinder im Kegel und der schnellste Weg eines Rettungsschwimmers (Brechungsgesetz, Wettrennen): Bild, Zielfunktion und Ableitung bewegen sich gemeinsam, der Lösungsweg führt über notwendige und hinreichende Bedingung und den Randwertvergleich zum Optimum.',
              'Box from a sheet of card (with folding animation), can with the smallest surface, rectangle under an exponential, largest cylinder in a cone and a lifeguard’s fastest route (law of refraction, race): picture, objective function and derivative move together, and the solution leads via necessary and sufficient conditions and the boundary values to the optimum.',
            ),
            grades: [13, 13],
            kmk: ['M-L3', 'M-K3', 'M-K2', 'M-K5'],
            keywords: L(
              ['Extremwertproblem', 'Optimierung', 'Zielfunktion', 'Nebenbedingung', 'Definitionsbereich', 'Ableitung', 'Schachtel', 'Dose', 'Oberfläche', 'Volumen', 'Randwerte', 'Kegel', 'Rettungsschwimmer', 'Brechungsgesetz', 'hinreichende Bedingung'],
              ['optimisation', 'optimization', 'objective function', 'constraint', 'domain', 'derivative', 'box', 'can', 'surface area', 'volume', 'boundary values', 'cone', 'lifeguard problem', 'law of refraction', 'sufficient condition'],
            ),
            thumb: 'generic',
          },
        ]),
        topic('weiterfuehrend', L('Weiterführend (Hochschule)', 'Further topics (university)'), [
          {
            id: 'taylor-polynome',
            status: 'ready',
            slug: L('taylorpolynome', 'taylor-polynomials'),
            title: L('Taylorpolynome', 'Taylor polynomials'),
            summary: L(
              'Polynome schmiegen sich an sin x, cos x, eˣ, ln(1 + x) und 1/(1 − x): Summand für Summand aufbauen, sehen, wie aus f⁽ᵏ⁾(a) und k! die Koeffizienten werden, Fehler mit der Lagrange-Abschätzung vergleichen und im ε-Schlauch den Gültigkeitsbereich und das Konvergenzintervall entdecken.',
              'Polynomials hug sin x, cos x, eˣ, ln(1 + x) and 1/(1 − x): build them term by term, see how f⁽ᵏ⁾(a) and k! give the coefficients, compare the error with the Lagrange bound and discover the range of validity and the interval of convergence in the ε-band.',
            ),
            grades: [13, 14],
            uni: true,
            kmk: ['M-L3', 'M-L1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Taylorpolynom', 'Taylorreihe', 'Näherungspolynom', 'Entwicklungsstelle', 'Konvergenzradius', 'Restglied', 'Lagrange-Restglied', 'Fehlerabschätzung', 'Potenzreihe', 'geometrische Reihe', 'Ableitung', 'Fakultät', 'Kleinwinkelnäherung'],
              ['Taylor polynomial', 'Taylor series', 'approximation', 'centre', 'radius of convergence', 'remainder', 'Lagrange remainder', 'error bound', 'power series', 'geometric series', 'derivative', 'factorial', 'small-angle approximation'],
            ),
            thumb: 'generic',
          },
          {
            id: 'fourier-reihen',
            status: 'ready',
            slug: L('fourier-reihen', 'fourier-series'),
            title: L('Fourier-Reihen', 'Fourier series'),
            summary: L(
              'Rechteck, Sägezahn, Dreieck, Trapez, Pulsfolge und gleichgerichteter Sinus entstehen Schwingung für Schwingung aus Sinus und Kosinus – als Partialsumme mit Gibbs-Phänomen, als rotierende Zeiger, gestapelt und im Amplituden-, Phasen- und Energiespektrum; mit Klang und Alltagsbeispielen von Klarinette bis LED-Dimmer.',
              'Square, sawtooth, triangle, trapezoid, pulse train and rectified sine waves are built up harmonic by harmonic from sines and cosines – as partial sums with the Gibbs phenomenon, as rotating phasors, stacked and in the amplitude, phase and energy spectrum; with sound and everyday examples from clarinet to LED dimmer.',
            ),
            grades: [14, 14],
            uni: true,
            kmk: ['M-L3', 'M-K4', 'M-K3', 'M-K5', 'M-K1'],
            keywords: L(
              ['Fourier-Reihe', 'Fourier-Koeffizienten', 'Oberschwingung', 'Harmonische', 'Rechtecksignal', 'Sägezahn', 'Pulsweitenmodulation', 'Gleichrichter', 'Amplitudenspektrum', 'Phasenspektrum', 'Zeigerdiagramm', 'Epizykel', 'Parseval', 'Gibbs-Phänomen', 'Fejér', 'Klangfarbe', 'periodische Funktion', 'Signalverarbeitung'],
              ['Fourier series', 'Fourier coefficients', 'harmonic', 'overtone', 'square wave', 'sawtooth', 'pulse-width modulation', 'rectifier', 'amplitude spectrum', 'phase spectrum', 'phasor', 'epicycles', 'Parseval', 'Gibbs phenomenon', 'Fejér', 'timbre', 'periodic function', 'signal processing'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
    area({
      id: 'vektoren',
      slug: L('analytische-geometrie', 'vectors-and-linear-algebra'),
      title: L('Analytische Geometrie', 'Analytic geometry'),
      description: L(
        'Punkte, Vektoren, Geraden, Ebenen und Kugeln im Raum – drehbar in 3D, mit Lagebeziehungen und Abständen.',
        'Points, vectors, lines, planes and spheres in space – rotatable in 3D, with relative positions and distances.',
      ),
      kmk: ['M-L4', 'M-K4', 'M-K5'],
      topics: [
        topic('vektoren-raum', L('Vektoren im Raum', 'Vectors in space'), [
          planned('koordinaten-3d', L('Punkte und Körper im räumlichen Koordinatensystem', 'Points and solids in 3D coordinates'), [12, 12]),
          planned('vektoren-3d', L('Vektoren addieren und vervielfachen (3D)', 'Adding and scaling vectors (3D)'), [12, 12]),
          planned('skalar-vektorprodukt', L('Skalarprodukt und Vektorprodukt', 'Dot product and cross product'), [12, 12]),
        ]),
        topic('geraden-ebenen', L('Geraden, Ebenen und Kugeln', 'Lines, planes and spheres'), [
          planned('geraden-ebenen', L('Geraden und Ebenen im Raum', 'Lines and planes in space'), [12, 13]),
          planned('lage-abstaende', L('Lagebeziehungen und Abstände im Raum', 'Relative positions and distances in space'), [13, 13]),
          planned('kugeln', L('Kugeln, Geraden und Ebenen', 'Spheres, lines and planes'), [13, 13]),
        ]),
        topic('matrizen', L('Matrizen (Hochschule)', 'Matrices (university)'), [
          {
            id: 'matrix-abbildungen',
            status: 'ready',
            slug: L('matrizen-lineare-abbildungen', 'matrices-linear-maps'),
            title: L('Matrizen als lineare Abbildungen', 'Matrices as linear maps'),
            summary: L(
              'Eine 2×2-Matrix verformt die Ebene: Bilder der Einheitsvektoren ziehen und zusehen, wie sich Gitter und Figur stetig von E zu A verformen. Sechs Ansichten: Abbildung mit Drehung, Spiegelung, Streckung, Scherung, Projektion und Drehstreckung, Verkettung (AB ≠ BA mit Rechenweg), Determinante als orientierter Flächeninhalt, Eigenvektoren mit charakteristischem Polynom, Inverse und Iteration mit Fixvektor – dazu zehn Alltagsbeispiele.',
              'A 2×2 matrix deforms the plane: drag the images of the unit vectors and watch grid and figure deform continuously from E to A. Six views: maps such as rotation, reflection, scaling, shear, projection and rotation with scaling, composition (AB ≠ BA with working), the determinant as signed area, eigenvectors with the characteristic polynomial, the inverse and iteration with a fixed vector – plus ten everyday examples.',
            ),
            grades: [12, 14],
            uni: true,
            kmk: ['M-L4', 'M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Matrix', 'lineare Abbildung', 'Determinante', 'Eigenwert', 'Eigenvektor', 'Drehung', 'Spiegelung', 'Scherung', 'Projektion', 'Einheitsvektor', 'lineare Algebra', 'Matrixprodukt', 'Verkettung', 'inverse Matrix', 'charakteristisches Polynom', 'Übergangsmatrix', 'stationäre Verteilung', 'Fixvektor'],
              ['matrix', 'linear map', 'determinant', 'eigenvalue', 'eigenvector', 'rotation', 'reflection', 'shear', 'projection', 'unit vector', 'linear algebra', 'matrix product', 'composition', 'inverse matrix', 'characteristic polynomial', 'transition matrix', 'stationary distribution', 'fixed vector'],
            ),
            thumb: 'generic',
          },
        ]),
      ],
    }),
  ],
};
