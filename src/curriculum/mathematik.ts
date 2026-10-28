import { area, L, topic } from './helpers';
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
              'Zehn Plättchen werden zu einem größeren gebündelt. So verstehst du, wie unsere Zahlen aufgebaut sind, liest große Zahlen und rundest sie.',
              'Ten counters are bundled into one bigger counter. This shows how our numbers are built, how to read large numbers and how to round them.',
            ),
            grades: [5, 5],
            kmk: ['M-L1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Stellenwerttafel', 'Stellenwert', 'Zehnersystem', 'Bündeln', 'große Zahlen', 'Million', 'Milliarde', 'Zahlwort', 'Runden', 'Zahlenstrahl', 'Nachbarzahl'],
              ['place value chart', 'place value', 'base ten', 'regrouping', 'large numbers', 'million', 'billion', 'number words', 'rounding', 'number line'],
            ),
          },
          {
            id: 'zahlengerade',
            status: 'ready',
            slug: L('ganze-zahlen-zahlengerade', 'integers-number-line'),
            title: L('Ganze Zahlen an der Zahlengeraden addieren und subtrahieren', 'Adding and subtracting integers on the number line'),
            summary: L(
              'Ein Frosch hüpft auf der Zahlengeraden und zeigt, wie man mit negativen Zahlen plus und minus rechnet. Dazu Beispiele mit Thermometer und Konto.',
              'A frog hops along the number line and shows how to add and subtract negative numbers. With examples from thermometers and bank accounts.',
            ),
            grades: [5, 7],
            kmk: ['M-L1', 'M-K4', 'M-K3'],
            keywords: L(
              ['ganze Zahlen', 'negative Zahlen', 'Zahlengerade', 'Pfeilmodell', 'Laufmodell', 'Gegenzahl', 'Betrag', 'Addition', 'Subtraktion', 'Guthaben', 'Schulden', 'Temperatur', 'Meeresspiegel'],
              ['integers', 'negative numbers', 'number line', 'arrow model', 'opposite', 'absolute value', 'addition', 'subtraction', 'credit', 'debt', 'temperature', 'sea level'],
            ),
          },
          {
            id: 'primfaktoren',
            status: 'ready',
            slug: L('primfaktoren-teilbarkeit', 'prime-factors-divisibility'),
            title: L('Primfaktorzerlegung und Teilbarkeit', 'Prime factorisation and divisibility'),
            summary: L(
              'Zerlege Zahlen in ihre Primfaktoren, prüfe Teilbarkeitsregeln und finde Primzahlen mit einem Sieb. Daraus ergeben sich auch ggT und kgV.',
              'Break numbers down into prime factors, check divisibility rules and find primes with a sieve. This also gives you the gcd and the lcm.',
            ),
            grades: [5, 6],
            kmk: ['M-L1', 'M-K1', 'M-K5'],
            keywords: L(
              ['Primzahl', 'Primfaktorzerlegung', 'Faktorbaum', 'Teiler', 'Teilbarkeitsregeln', 'Quersumme', 'Sieb des Eratosthenes', 'ggT', 'kgV', 'Potenz', 'teilerfremd'],
              ['prime number', 'prime factorisation', 'factor tree', 'divisor', 'divisibility rules', 'digit sum', 'sieve of Eratosthenes', 'gcd', 'lcm', 'power', 'coprime'],
            ),
          },
          {
            id: 'zehnerpotenzen',
            status: 'ready',
            slug: L('zehnerpotenzen-groessenordnungen', 'powers-of-ten-orders-of-magnitude'),
            title: L('Potenzen, Zehnerpotenzen und Größenordnungen', 'Powers, powers of ten and orders of magnitude'),
            summary: L(
              'Zoome vom Sandkorn bis zur Erde: Jeder Schritt macht das Bild zehnmal so groß. So lernst du Potenzen und das Schreiben sehr großer und sehr kleiner Zahlen.',
              'Zoom from a grain of sand to the Earth: each step makes the picture ten times larger. Learn about powers and how to write very large and very small numbers.',
            ),
            grades: [5, 6],
            kmk: ['M-L1', 'M-L2', 'M-K4', 'M-K5'],
            keywords: L(
              ['Potenz', 'Zehnerpotenz', 'Grundzahl', 'Hochzahl', 'Exponent', 'Basis', 'Größenordnung', 'Maßstab', 'Million', 'Milliarde', 'wissenschaftliche Schreibweise', 'Längeneinheiten', 'Kilometer', 'Millimeter'],
              ['power', 'power of ten', 'base', 'exponent', 'order of magnitude', 'scale', 'million', 'billion', 'scientific notation', 'standard form', 'units of length', 'kilometre', 'millimetre'],
            ),
          },
        ]),
        topic('brueche', L('Brüche und Dezimalbrüche', 'Fractions and decimals'), [
          {
            id: 'bruchteile',
            status: 'ready',
            slug: L('bruchteile', 'fractions'),
            title: L('Bruchteile darstellen', 'Representing fractions'),
            summary: L(
              'Teile Pizza, Kuchen oder eine Strecke in gleich große Stücke und färbe einige davon. So siehst du, was ein Bruch bedeutet.',
              'Cut a pizza, a cake or a line into equal pieces and colour some of them. This shows what a fraction means.',
            ),
            grades: [5, 6],
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
              'Vergleiche zwei Brüche als Streifen oder Kreise. Beim Erweitern werden die Stücke feiner, der Anteil bleibt aber gleich.',
              'Compare two fractions as bars or circles. When you expand a fraction, the pieces get smaller but the amount stays the same.',
            ),
            grades: [5, 6],
            kmk: ['M-L1', 'M-K4', 'M-K1'],
            keywords: L(
              ['Bruch', 'erweitern', 'kürzen', 'vergleichen', 'gleichnamig', 'Hauptnenner', 'kgV', 'ggT', 'gleichwertige Brüche', 'Bruchwand', 'Zahlenstrahl', 'ordnen'],
              ['fraction', 'equivalent fractions', 'expand', 'reduce', 'simplify', 'compare', 'common denominator', 'lcm', 'gcd', 'fraction wall', 'number line', 'ordering'],
            ),
          },
          {
            id: 'dezimalbrueche',
            status: 'ready',
            slug: L('endliche-periodische-dezimalbrueche', 'terminating-repeating-decimals'),
            title: L('Endliche und periodische Dezimalbrüche', 'Terminating and repeating decimals'),
            summary: L(
              'Teile schriftlich, bis sich ein Rest wiederholt. So siehst du, warum manche Brüche als Dezimalzahl enden und andere sich endlos wiederholen.',
              'Do long division until a remainder repeats. This shows why some fractions end as decimals and others repeat forever.',
            ),
            grades: [6, 6],
            kmk: ['M-L1', 'M-K5', 'M-K1', 'M-K4'],
            keywords: L(
              ['Dezimalbruch', 'endlich', 'periodisch', 'Periode', 'Vorperiode', 'Periodenstrich', 'schriftliche Division', 'Rest', 'Primfaktoren', 'Nenner', 'Zehnerpotenz', 'Stellenwert'],
              ['decimal', 'terminating decimal', 'repeating decimal', 'recurring decimal', 'period', 'long division', 'remainder', 'prime factors', 'denominator', 'power of ten', 'place value'],
            ),
          },
          {
            id: 'brueche-rechnen',
            status: 'ready',
            slug: L('brueche-multiplizieren-dividieren', 'multiplying-dividing-fractions'),
            title: L('Brüche multiplizieren und dividieren am Rechteckmodell', 'Multiplying and dividing fractions with area models'),
            summary: L(
              'Zwei Streifen überlagern sich in einem Rechteck: Die gemeinsame Fläche ist das Produkt der Brüche. Auch das Teilen durch einen Bruch wird anschaulich.',
              'Two strips overlap in a rectangle: the shared area is the product of the fractions. Dividing by a fraction is shown visually as well.',
            ),
            grades: [6, 6],
            kmk: ['M-L1', 'M-K4', 'M-K1', 'M-K5'],
            keywords: L(
              ['Bruch', 'multiplizieren', 'dividieren', 'Rechteckmodell', 'Flächenmodell', 'von', 'Anteil', 'kürzen', 'über Kreuz kürzen', 'Kehrwert', 'Messen', 'Aufteilen', 'gemeinsamer Nenner'],
              ['fraction', 'multiply', 'divide', 'area model', 'rectangle model', 'of', 'cancel', 'cross-cancel', 'reciprocal', 'measuring', 'quotative division', 'common denominator'],
            ),
          },
        ]),
        topic('prozente', L('Prozentrechnung', 'Percentages'), [
          {
            id: 'prozentstreifen',
            status: 'ready',
            slug: L('prozentstreifen', 'percentage-bar'),
            title: L('Prozentstreifen', 'Percentage bar'),
            summary: L(
              'Am Prozentstreifen siehst du, wie Grundwert, Prozentsatz und Prozentwert zusammenhängen. Mit Alltagsbeispielen wie Rabatt, Mehrwertsteuer und Umfrage.',
              'The percentage bar shows how the base value, the percentage and the part are connected. With everyday examples such as discounts, VAT and surveys.',
            ),
            grades: [6, 7],
            kmk: ['M-L1', 'M-L2', 'M-K3', 'M-K4'],
            keywords: L(
              ['Prozent', 'Prozentrechnung', 'Prozentstreifen', 'Grundwert', 'Prozentwert', 'Prozentsatz', 'Dreisatz', 'Hunderterfeld', 'Rabatt', 'Preiserhöhung', 'vermehrter Grundwert', 'verminderter Grundwert', 'Mehrwertsteuer', 'Zinsen', 'Umfrage', 'Anteil', 'Bruch'],
              ['percent', 'percentage', 'percentage bar', 'base value', 'rate', 'rule of three', 'hundred square', 'discount', 'price increase', 'VAT', 'interest', 'survey', 'share', 'fraction'],
            ),
          },
        ]),
        topic('reelle-zahlen', L('Wurzeln und reelle Zahlen', 'Roots and real numbers'), [
          {
            id: 'quadratwurzel',
            status: 'ready',
            slug: L('quadratwurzel-heron-verfahren', 'square-roots-herons-method'),
            title: L('Quadratwurzeln und das Heron-Verfahren', 'Square roots and Heron’s method'),
            summary: L(
              'Ein Rechteck wird Schritt für Schritt zum Quadrat mit gleicher Fläche. So findest du die Quadratwurzel und lernst ein altes Näherungsverfahren kennen.',
              'Step by step, a rectangle turns into a square with the same area. This is how you find a square root, using a very old approximation method.',
            ),
            grades: [7, 9],
            kmk: ['M-L1', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Quadratwurzel', 'Wurzel', 'Heron-Verfahren', 'Intervallschachtelung', 'Näherungsverfahren', 'irrationale Zahl', 'reelle Zahlen', 'Radikand', 'Quadratzahl', 'Mittelwert', 'teilweise Wurzelziehen', 'Wurzel 2', 'Widerspruchsbeweis', 'Diagonale', 'Kästchenpapier'],
              ['square root', 'root', 'Heron’s method', 'Babylonian method', 'nested intervals', 'approximation', 'irrational number', 'real numbers', 'radicand', 'perfect square', 'simplifying roots', 'root 2', 'proof by contradiction', 'diagonal'],
            ),
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
              'Gib einen Term ein und sieh ihn als Rechenbaum. So wird klar, in welcher Reihenfolge gerechnet wird.',
              'Enter an expression and see it as a calculation tree. This makes clear in which order you calculate.',
            ),
            grades: [5, 7],
            kmk: ['M-L1', 'M-K5', 'M-K4'],
            keywords: L(
              ['Termbaum', 'Rechenbaum', 'Rechenreihenfolge', 'Punkt vor Strich', 'Klammer', 'Potenz', 'Termart', 'Summe', 'Differenz', 'Produkt', 'Quotient', 'Termgliederung', 'Variable', 'Termwert'],
              ['expression tree', 'order of operations', 'brackets', 'power', 'sum', 'difference', 'product', 'quotient', 'variable', 'evaluate', 'BODMAS', 'PEMDAS'],
            ),
          },
          {
            id: 'binomische-formeln',
            status: 'ready',
            slug: L('binomische-formeln', 'binomial-formulas'),
            title: L('Binomische Formeln am Quadrat', 'Binomial formulas with squares'),
            summary: L(
              'Die drei binomischen Formeln als Flächen: Ein Quadrat zerfällt in kleinere Quadrate und Rechtecke.',
              'The three binomial formulas as areas: a square splits into smaller squares and rectangles.',
            ),
            grades: [7, 8],
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
              'Lineare Gleichungen auf einer Balkenwaage lösen: Was du auf beiden Seiten gleich machst, hält die Waage im Gleichgewicht.',
              'Solve linear equations on a balance: whatever you do to both sides keeps the scale balanced.',
            ),
            grades: [7, 7],
            kmk: ['M-L3', 'M-K5', 'M-K3', 'M-K4'],
            keywords: L(
              ['Gleichung', 'lineare Gleichung', 'Waagemodell', 'Balkenwaage', 'Äquivalenzumformung', 'Lösungsmenge', 'Probe', 'Variable', 'Gleichgewicht', 'Umformung'],
              ['equation', 'linear equation', 'balance model', 'equivalent transformation', 'solution set', 'check', 'variable', 'solving equations'],
            ),
          },
          {
            id: 'lgs-grafisch',
            status: 'ready',
            slug: L('lgs-grafisch', 'linear-systems-graphically'),
            title: L('Lineare Gleichungssysteme grafisch lösen', 'Solving linear systems graphically'),
            summary: L(
              'Zwei Gleichungen sind zwei Geraden. Ihr Schnittpunkt ist die Lösung, die du ablesen und durch Einsetzen prüfen kannst.',
              'Two equations are two lines. Their point of intersection is the solution, which you can read off and check.',
            ),
            grades: [8, 10],
            kmk: ['M-L3', 'M-K4', 'M-K3', 'M-K5'],
            keywords: L(
              ['lineares Gleichungssystem', 'LGS', 'Schnittpunkt', 'grafisches Lösungsverfahren', 'Gerade', 'parallel', 'identisch', 'Lösungsmenge', 'Probe', 'Gleichsetzungsverfahren', 'Tarifvergleich'],
              ['system of linear equations', 'simultaneous equations', 'intersection', 'graphical method', 'line', 'parallel', 'coincident', 'solution set', 'check', 'tariff comparison'],
            ),
          },
          {
            id: 'gleichungen-grafisch',
            status: 'ready',
            slug: L('gleichungen-grafisch-loesen', 'solving-equations-graphically'),
            title: L('Gleichungen grafisch lösen: Schnittpunkte von Graphen', 'Solving equations graphically: intersections of graphs'),
            summary: L(
              'Zeichne beide Seiten einer Gleichung als Graphen. Die Lösungen liegen dort, wo sich die Graphen schneiden.',
              'Draw both sides of an equation as graphs. The solutions are where the graphs cross.',
            ),
            grades: [8, 9],
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K2'],
            keywords: L(
              ['Gleichung', 'grafisches Lösen', 'Schnittpunkt', 'Schnittstelle', 'Lösungsmenge', 'Bruchgleichung', 'quadratische Gleichung', 'Betragsgleichung', 'Differenzfunktion', 'Nullstelle', 'Berührpunkt', 'Intervallhalbierung', 'Intervallschachtelung', 'Näherung', 'Definitionsmenge'],
              ['equation', 'solving graphically', 'intersection', 'solution set', 'fractional equation', 'quadratic equation', 'absolute value equation', 'difference function', 'zero', 'root', 'touching point', 'bisection', 'nested intervals', 'approximation', 'domain'],
            ),
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
              'Punkte im Koordinatensystem setzen und ablesen, Strecken und Geraden zeichnen und prüfen, ob sie parallel oder senkrecht sind.',
              'Place and read points in a coordinate system, draw segments and lines and check whether they are parallel or perpendicular.',
            ),
            grades: [5, 5],
            kmk: ['M-L4', 'M-K4', 'M-K5'],
            keywords: L(
              ['Koordinatensystem', 'Punkt', 'Strecke', 'Halbgerade', 'Gerade', 'parallel', 'senkrecht', 'Abstand', 'Lot', 'Geodreieck', 'Kreis', 'Radius', 'Durchmesser', 'Tangente', 'Sekante', 'Passante'],
              ['coordinate plane', 'point', 'segment', 'ray', 'line', 'parallel', 'perpendicular', 'distance', 'set square', 'circle', 'radius', 'diameter', 'tangent', 'secant'],
            ),
          },
          {
            id: 'winkel-messen',
            status: 'ready',
            slug: L('winkel-schaetzen-messen', 'estimating-measuring-angles'),
            title: L('Winkel schätzen und messen', 'Estimating and measuring angles'),
            summary: L(
              'Lege das Geodreieck richtig an und miss Winkel. Mit Winkelarten und einem Schätzspiel.',
              'Place the protractor correctly and measure angles. With types of angles and an estimation game.',
            ),
            grades: [5, 5],
            kmk: ['M-L2', 'M-L4', 'M-K5'],
            keywords: L(
              ['Winkel', 'Scheitel', 'Schenkel', 'Geodreieck', 'Winkelmesser', 'spitzer Winkel', 'rechter Winkel', 'stumpfer Winkel', 'gestreckter Winkel', 'überstumpfer Winkel', 'Vollwinkel', 'Grad', 'schätzen'],
              ['angle', 'vertex', 'arm', 'set square', 'protractor', 'acute angle', 'right angle', 'obtuse angle', 'straight angle', 'reflex angle', 'full angle', 'degree', 'estimate'],
            ),
          },
          {
            id: 'vierecke',
            status: 'ready',
            slug: L('haus-der-vierecke', 'family-of-quadrilaterals'),
            title: L('Das Haus der Vierecke', 'The family of quadrilaterals'),
            summary: L(
              'Ziehe an den Ecken eines Vierecks und sieh, ob es ein Quadrat, Rechteck, Parallelogramm oder eine andere Art ist.',
              'Drag the corners of a quadrilateral and see whether it is a square, a rectangle, a parallelogram or another type.',
            ),
            grades: [5, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Viereck', 'Haus der Vierecke', 'Quadrat', 'Rechteck', 'Raute', 'Parallelogramm', 'Trapez', 'gleichschenkliges Trapez', 'Drachenviereck', 'parallel', 'Symmetrieachse', 'punktsymmetrisch', 'Diagonale', 'Eigenschaften'],
              ['quadrilateral', 'square', 'rectangle', 'rhombus', 'parallelogram', 'trapezium', 'trapezoid', 'isosceles trapezium', 'kite', 'parallel', 'line of symmetry', 'point symmetry', 'diagonal', 'properties'],
            ),
          },
        ]),
        topic('symmetrie', L('Symmetrie und Konstruktionen', 'Symmetry and constructions'), [
          {
            id: 'spiegelung',
            status: 'ready',
            slug: L('achsen-und-punktspiegelung', 'reflections-line-point'),
            title: L('Achsen- und Punktspiegelung', 'Reflections in a line and in a point'),
            summary: L(
              'Spiegle eine Figur an einer Achse oder an einem Punkt und sieh, wie die Konstruktion entsteht.',
              'Reflect a shape in a line or in a point and watch how the construction works.',
            ),
            grades: [5, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Achsenspiegelung', 'Punktspiegelung', 'Spiegelachse', 'Symmetriezentrum', 'achsensymmetrisch', 'punktsymmetrisch', 'Symmetrieachse', 'Umlaufsinn', 'Fixpunkt', 'Fixgerade', 'Lot', 'Drehung um 180°', 'Konstruktion'],
              ['reflection', 'line of symmetry', 'point symmetry', 'centre of symmetry', 'mirror line', 'orientation', 'fixed point', 'fixed line', 'half turn', 'construction'],
            ),
          },
          {
            id: 'mittelsenkrechte',
            status: 'ready',
            slug: L('mittelsenkrechte-winkelhalbierende', 'perpendicular-and-angle-bisectors'),
            title: L('Mittelsenkrechte und Winkelhalbierende', 'Perpendicular bisector and angle bisector'),
            summary: L(
              'Ziehe einen Punkt und vergleiche seine Abstände. So entdeckst du Mittelsenkrechte und Winkelhalbierende und konstruierst sie mit Zirkel und Lineal.',
              'Drag a point and compare its distances. This is how you discover perpendicular bisectors and angle bisectors and construct them with compass and ruler.',
            ),
            grades: [6, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Mittelsenkrechte', 'Winkelhalbierende', 'Ortslinie', 'Abstand', 'gleich weit entfernt', 'Mittelpunkt', 'Lot', 'Zirkel', 'Lineal', 'Konstruktion', 'Grundkonstruktion', 'Umkreis', 'Umkreismittelpunkt', 'Drachenviereck'],
              ['perpendicular bisector', 'angle bisector', 'locus', 'distance', 'equidistant', 'midpoint', 'perpendicular', 'compasses', 'ruler', 'construction', 'circumcircle', 'circumcentre', 'kite'],
            ),
          },
        ]),
        topic('winkel', L('Winkel an Figuren', 'Angles in figures'), [
          {
            id: 'winkel-geradenkreuzung',
            status: 'ready',
            slug: L('winkel-an-geradenkreuzungen', 'angles-at-intersecting-lines'),
            title: L('Winkel an Geradenkreuzungen', 'Angles at intersecting lines'),
            summary: L(
              'Drehe Geraden und sieh, welche Winkel gleich groß bleiben. An parallelen Geraden gibt es Stufen- und Wechselwinkel.',
              'Rotate lines and see which angles stay equal. Parallel lines give corresponding and alternate angles.',
            ),
            grades: [5, 7],
            kmk: ['M-L4', 'M-K1', 'M-K2', 'M-K5'],
            keywords: L(
              ['Scheitelwinkel', 'Nebenwinkel', 'Stufenwinkel', 'Wechselwinkel', 'Nachbarwinkel', 'F-Winkel', 'Z-Winkel', 'E-Winkel', 'Geradenkreuzung', 'Doppelkreuzung', 'parallele Geraden', 'Querlinie', 'Schnittwinkel', 'begründen'],
              ['vertical angles', 'adjacent angles', 'corresponding angles', 'alternate angles', 'co-interior angles', 'F angles', 'Z angles', 'intersecting lines', 'transversal', 'parallel lines', 'angle of intersection', 'reasoning'],
            ),
          },
          {
            id: 'winkelsumme',
            status: 'ready',
            slug: L('innenwinkelsumme', 'angle-sum'),
            title: L('Innenwinkelsumme in Dreieck und Vieleck', 'Angle sum in triangles and polygons'),
            summary: L(
              'Reiße die Ecken eines Dreiecks ab und lege sie zusammen: Sie ergeben immer 180°. Auch für Vierecke und Vielecke.',
              'Tear off the corners of a triangle and put them together: they always make 180°. Also for quadrilaterals and polygons.',
            ),
            grades: [6, 7],
            kmk: ['M-L4', 'M-K1', 'M-K6'],
            keywords: L(
              ['Innenwinkelsumme', 'Winkelsumme', 'Dreieck', 'Vieleck', 'n-Eck', 'Wechselwinkel', 'Parallele', 'gestreckter Winkel', 'Außenwinkel', 'regelmäßiges Vieleck', 'konvex', 'Beweis'],
              ['angle sum', 'interior angles', 'triangle', 'polygon', 'n-gon', 'alternate angles', 'parallel', 'straight angle', 'exterior angle', 'regular polygon', 'convex', 'proof'],
            ),
          },
        ]),
        topic('dreiecke', L('Dreiecke', 'Triangles'), [
          {
            id: 'dreieckskonstruktion',
            status: 'ready',
            slug: L('dreieckskonstruktion-kongruenzsaetze', 'constructing-triangles-congruence'),
            title: L('Kongruenzsätze und Dreieckskonstruktionen', 'Congruence and constructing triangles'),
            summary: L(
              'Konstruiere Dreiecke aus drei gegebenen Stücken mit Lineal und Zirkel, Schritt für Schritt wie im Heft. Manchmal gibt es keine, eine oder zwei Lösungen.',
              'Construct triangles from three given parts with ruler and compass, step by step as in your exercise book. Sometimes there are no, one or two solutions.',
            ),
            grades: [6, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Kongruenz', 'Kongruenzsatz', 'SSS', 'SWS', 'WSW', 'SsW', 'SSW', 'WWW', 'Dreieckskonstruktion', 'Planfigur', 'Zirkel', 'Geodreieck', 'Dreiecksungleichung', 'eindeutig', 'Konstruktionsbeschreibung', 'Kreis', 'Schnittpunkt', 'Winkelsumme', 'ähnlich'],
              ['congruence', 'congruence criterion', 'SSS', 'SAS', 'ASA', 'SSA', 'AAA', 'constructing triangles', 'sketch', 'compasses', 'set square', 'triangle inequality', 'unique', 'construction steps', 'circle', 'intersection', 'angle sum', 'similar'],
            ),
          },
          {
            id: 'besondere-linien',
            status: 'ready',
            slug: L('besondere-linien-im-dreieck', 'special-lines-in-a-triangle'),
            title: L('Umkreis, Inkreis und besondere Linien im Dreieck', 'Circumcircle, incircle and special lines in a triangle'),
            summary: L(
              'Konstruiere die besonderen Linien im Dreieck. Je drei davon schneiden sich immer in einem Punkt, zum Beispiel im Mittelpunkt von Umkreis und Inkreis.',
              'Construct the special lines in a triangle. Each set of three always meets in one point, for example at the centre of the circumcircle or the incircle.',
            ),
            grades: [6, 8],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Mittelsenkrechte', 'Umkreis', 'Umkreismittelpunkt', 'Winkelhalbierende', 'Inkreis', 'Inkreismittelpunkt', 'Seitenhalbierende', 'Schwerpunkt', 'Höhe', 'Höhenschnittpunkt', 'Euler-Gerade', 'Dreieck', 'Ortslinie', 'Konstruktion', 'Zirkel', 'Geodreieck', 'Thaleskreis'],
              ['perpendicular bisector', 'circumcircle', 'circumcentre', 'angle bisector', 'incircle', 'incentre', 'median', 'centroid', 'altitude', 'orthocentre', 'Euler line', 'triangle', 'locus', 'construction', 'compasses', 'set square', 'Thales circle'],
            ),
          },
          {
            id: 'thales',
            status: 'ready',
            slug: L('satz-des-thales', 'thales-theorem'),
            title: L('Satz des Thales', 'Thales’s theorem'),
            summary: L(
              'Ziehe einen Punkt auf dem Halbkreis: Der Winkel dort ist immer ein rechter Winkel.',
              'Drag a point along the semicircle: the angle there is always a right angle.',
            ),
            grades: [7, 7],
            kmk: ['M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Thaleskreis', 'rechter Winkel', 'Halbkreis', 'Umkreis', 'gleichschenkliges Dreieck', 'Winkelsumme', 'Beweis'],
              ['Thales circle', 'right angle', 'semicircle', 'circumcircle', 'isosceles triangle', 'angle sum', 'proof'],
            ),
            thumb: 'thales',
          },
        ]),
        topic('pythagoras', L('Satz des Pythagoras', 'Pythagorean theorem'), [
          {
            id: 'pythagoras',
            status: 'ready',
            slug: L('satz-des-pythagoras', 'pythagorean-theorem'),
            title: L('Satz des Pythagoras', 'Pythagorean theorem'),
            summary: L(
              'Quadrate über den Seiten eines rechtwinkligen Dreiecks und ein Puzzle-Beweis zeigen: a² + b² = c².',
              'Squares on the sides of a right triangle and a puzzle proof show: a² + b² = c².',
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
              'Verschiebe eine Parallele und sieh, dass alle Streckenverhältnisse gleich bleiben. Damit berechnest du unbekannte Längen, zum Beispiel die Höhe eines Baumes.',
              'Move a parallel line and see that all ratios of lengths stay the same. Use this to calculate unknown lengths, such as the height of a tree.',
            ),
            grades: [8, 9],
            kmk: ['M-L4', 'M-L2', 'M-K3', 'M-K4'],
            keywords: L(
              ['Strahlensatz', 'Strahlensätze', 'V-Figur', 'X-Figur', 'Parallelen', 'Streckfaktor', 'Verhältnis', 'Verhältnisgleichung', 'Abschnitte', 'ähnliche Dreiecke', 'zentrische Streckung', 'Baumhöhe', 'Schatten', 'Teichbreite', 'Umkehrung'],
              ['intercept theorem', 'V shape', 'X shape', 'parallel lines', 'scale factor', 'ratio', 'proportion', 'similar triangles', 'enlargement', 'tree height', 'shadow', 'pond width', 'converse'],
            ),
          },
          {
            id: 'vergroessern',
            status: 'ready',
            slug: L('aehnliche-figuren-vergroessern', 'similar-figures-scaling'),
            title: L('Ähnliche Figuren: Wie wachsen Fläche und Volumen?', 'Similar figures: how do area and volume grow?'),
            summary: L(
              'Vergrößere Strecken, Flächen und Körper. Bei doppelter Länge wird die Fläche viermal und das Volumen achtmal so groß.',
              'Enlarge lengths, areas and solids. Doubling the length makes the area four times and the volume eight times as large.',
            ),
            grades: [8, 9],
            kmk: ['M-L4', 'M-L2', 'M-K1', 'M-K3', 'M-K4'],
            keywords: L(
              ['Streckfaktor', 'ähnlich', 'Ähnlichkeit', 'zentrische Streckung', 'Vergrößerung', 'Verkleinerung', 'Flächeninhalt', 'Oberfläche', 'Volumen', 'Einheitswürfel', 'Quadrat', 'Würfel', 'Quader', 'Kubikwurzel', 'Maßstab', 'Pizza', 'Oberfläche zu Volumen'],
              ['scale factor', 'similar', 'similarity', 'enlargement', 'reduction', 'area', 'surface area', 'volume', 'unit cube', 'square', 'cube', 'cuboid', 'cube root', 'scale', 'pizza', 'surface to volume'],
            ),
          },
        ]),
        topic('trigonometrie-dreieck', L('Trigonometrie im Dreieck', 'Trigonometry in triangles'), [
          {
            id: 'sin-cos-tan-dreieck',
            status: 'ready',
            slug: L('sinus-kosinus-tangens-dreieck', 'sine-cosine-tangent-triangle'),
            title: L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck', 'Sine, cosine and tangent in right triangles'),
            summary: L(
              'Im rechtwinkligen Dreieck hängt das Verhältnis zweier Seiten nur vom Winkel ab. Daraus entstehen Sinus, Kosinus und Tangens, mit Beispielen wie Rampe oder Leiter.',
              'In a right triangle, the ratio of two sides depends only on the angle. This gives sine, cosine and tangent, with examples such as ramps and ladders.',
            ),
            grades: [9, 10],
            kmk: ['M-L4', 'M-L3', 'M-K5', 'M-K1'],
            keywords: L(
              ['Sinus', 'Kosinus', 'Tangens', 'Trigonometrie', 'rechtwinkliges Dreieck', 'Gegenkathete', 'Ankathete', 'Hypotenuse', 'Seitenverhältnis', 'Winkel berechnen', 'ähnliche Dreiecke', 'Einheitskreis', 'besondere Werte', 'Steigung in Prozent', 'Höhenwinkel'],
              ['sine', 'cosine', 'tangent', 'trigonometry', 'right triangle', 'opposite', 'adjacent', 'hypotenuse', 'ratio', 'angle', 'similar triangles', 'SOH CAH TOA', 'unit circle', 'exact values', 'gradient', 'angle of elevation'],
            ),
          },
          {
            id: 'sinussatz-kosinussatz',
            status: 'ready',
            slug: L('sinussatz-kosinussatz', 'law-of-sines-cosines'),
            title: L('Sinussatz und Kosinussatz', 'Law of sines and law of cosines'),
            summary: L(
              'Berechne Seiten und Winkel in beliebigen Dreiecken mit Sinussatz und Kosinussatz. Ein Helfer zeigt, welcher Satz zu deiner Aufgabe passt.',
              'Calculate sides and angles in any triangle with the law of sines and the law of cosines. A helper shows which law fits your problem.',
            ),
            grades: [9, 10],
            kmk: ['M-L4', 'M-L2', 'M-K1', 'M-K5'],
            keywords: L(
              ['Sinussatz', 'Kosinussatz', 'allgemeines Dreieck', 'Trigonometrie', 'Umkreis', 'Höhe', 'Pythagoras', 'Dreiecksberechnung', 'Flächeninhalt', 'SWS', 'SSS', 'WSW', 'SSW', 'Vermessung'],
              ['law of sines', 'law of cosines', 'sine rule', 'cosine rule', 'triangle', 'trigonometry', 'circumcircle', 'altitude', 'Pythagoras', 'area', 'ambiguous case', 'surveying'],
            ),
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
          {
            id: 'einheiten',
            status: 'ready',
            slug: L('einheiten-umrechnen-einheitentafel', 'converting-units-chart'),
            title: L('Einheiten umrechnen mit der Einheitentafel', 'Converting units with a place-value chart'),
            summary: L(
              'Lege eine Größe in die Einheitentafel und sieh, wie beim Umrechnen das Komma wandert. Für Länge, Masse, Fläche, Volumen und Zeit.',
              'Put a quantity into the unit table and watch the decimal point move when you convert. For length, mass, area, volume and time.',
            ),
            grades: [5, 5],
            kmk: ['M-L2', 'M-L1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Einheiten', 'umrechnen', 'Einheitentafel', 'Umrechnungszahl', 'Komma verschieben', 'Länge', 'Masse', 'Gewicht', 'Zeit', 'Flächeninhalt', 'Volumen', 'Liter', 'Milliliter', 'km', 'm', 'cm', 'mm', 'kg', 'g', 't', 'm²', 'cm²', 'Ar', 'Hektar', 'cm³', 'dm³', 'Stunde', 'Minute', 'Sekunde', 'Größen'],
              ['units', 'convert', 'unit conversion chart', 'conversion factor', 'move the decimal point', 'length', 'mass', 'weight', 'time', 'area', 'volume', 'litre', 'millilitre', 'km', 'm', 'cm', 'mm', 'kg', 'g', 'tonne', 'm²', 'cm²', 'are', 'hectare', 'cm³', 'dm³', 'hour', 'minute', 'second', 'measures'],
            ),
          },
          {
            id: 'massstab',
            status: 'ready',
            slug: L('massstab-karte-wirklichkeit', 'scale-map-and-reality'),
            title: L('Maßstab: Karte und Wirklichkeit', 'Scale: map and reality'),
            summary: L(
              'Miss auf einer Karte mit dem Lineal und rechne mit dem Maßstab aus, wie weit es in Wirklichkeit ist.',
              'Measure on a map with a ruler and use the scale to work out the real distance.',
            ),
            grades: [5, 7],
            kmk: ['M-L2', 'M-K3', 'M-L1', 'M-K4'],
            keywords: L(
              ['Maßstab', 'Karte', 'Landkarte', 'Wirklichkeit', 'Maßstabszahl', 'Maßstabsleiste', 'Entfernung', 'Luftlinie', 'Wegstrecke', 'Vergrößerung', 'Verkleinerung', 'Lineal', 'Längen', 'Einheiten', 'Kilometer', 'Zentimeter'],
              ['scale', 'map', 'reality', 'scale factor', 'scale bar', 'distance', 'straight line', 'route', 'enlargement', 'reduction', 'ruler', 'lengths', 'units', 'kilometre', 'centimetre'],
            ),
          },
        ]),
        topic('flaecheninhalt', L('Flächeninhalt', 'Area'), [
          {
            id: 'umfang-flaeche',
            status: 'ready',
            slug: L('umfang-flaecheninhalt-rechteck', 'perimeter-area-rectangle'),
            title: L('Umfang und Flächeninhalt von Rechtecken', 'Perimeter and area of rectangles'),
            summary: L(
              'Lege ein Rechteck mit Quadraten aus und lass eine Ameise einmal herumlaufen. So unterscheidest du Flächeninhalt und Umfang.',
              'Fill a rectangle with squares and let an ant walk once around it. This shows the difference between area and perimeter.',
            ),
            grades: [5, 5],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Umfang', 'Flächeninhalt', 'Rechteck', 'Quadrat', 'Einheitsquadrat', 'Quadratzentimeter', 'cm²', 'Länge', 'Breite', 'Rechenpapier', 'zerlegen', 'ergänzen', 'L-Form', 'zusammengesetzte Figur'],
              ['perimeter', 'area', 'rectangle', 'square', 'unit square', 'square centimetre', 'cm²', 'length', 'width', 'squared paper', 'decompose', 'complete', 'L-shape', 'composite shape'],
            ),
          },
          {
            id: 'flaechen-zerlegen',
            status: 'ready',
            slug: L('flaechen-zerlegen-ergaenzen', 'area-by-decomposing'),
            title: L('Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen', 'Parallelogram, triangle and trapezium by decomposing'),
            summary: L(
              'Zerlege Parallelogramm, Dreieck und Trapez und setze sie neu zusammen. So findest du ihre Flächenformeln.',
              'Cut up a parallelogram, a triangle and a trapezium and put the pieces together again. This is how you find their area formulas.',
            ),
            grades: [6, 8],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Flächeninhalt', 'Parallelogramm', 'Dreieck', 'Trapez', 'Grundseite', 'Höhe', 'zerlegen', 'ergänzen', 'verschieben', 'Kopie drehen', 'Scherung', 'Kästchen zählen', 'Flächenformel'],
              ['area', 'parallelogram', 'triangle', 'trapezium', 'trapezoid', 'base', 'height', 'decompose', 'complete', 'rearrange', 'rotated copy', 'shear', 'counting squares', 'area formula'],
            ),
          },
        ]),
        topic('koerper', L('Körper und Oberflächen', 'Solids and surface area'), [
          {
            id: 'koerpernetze',
            status: 'ready',
            slug: L('koerpernetze', 'nets-of-solids'),
            title: L('Netze und Oberflächen von Körpern', 'Nets and surface areas of solids'),
            summary: L(
              'Falte Netze von Würfel, Quader, Prisma, Pyramide und Zylinder in 3D zum Körper und berechne die Oberfläche.',
              'Fold nets of a cube, cuboid, prism, pyramid and cylinder into a solid in 3D and calculate the surface area.',
            ),
            grades: [5, 8],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Körpernetz', 'Würfelnetz', 'Würfel', 'Quader', 'Prisma', 'Pyramide', 'Zylinder', 'Oberfläche', 'Mantel', 'Raumvorstellung', 'falten', 'Spielwürfel'],
              ['net', 'cube net', 'cube', 'cuboid', 'prism', 'pyramid', 'cylinder', 'surface area', 'lateral surface', 'spatial reasoning', 'folding', 'dice'],
            ),
          },
          {
            id: 'prisma-zylinder',
            status: 'ready',
            slug: L('prisma-und-zylinder', 'prism-and-cylinder'),
            title: L('Prisma und Zylinder: Oberfläche und Volumen', 'Prism and cylinder: surface area and volume'),
            summary: L(
              'Staple Schichten und rolle den Mantel ab. So siehst du, wie man Volumen und Oberfläche von Prisma und Zylinder berechnet.',
              'Stack layers and unroll the curved surface. This shows how to calculate the volume and surface area of prisms and cylinders.',
            ),
            grades: [6, 9],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Prisma', 'Zylinder', 'Volumen', 'Oberfläche', 'Mantel', 'Grundfläche', 'Netz', 'Abwicklung', 'Vieleck', 'Kreis'],
              ['prism', 'cylinder', 'volume', 'surface area', 'lateral surface', 'base area', 'net', 'development', 'polygon', 'circle'],
            ),
          },
          {
            id: 'pyramide-kegel-kugel',
            status: 'ready',
            slug: L('pyramide-kegel-kugel', 'pyramid-cone-sphere'),
            title: L('Pyramide, Kegel und Kugel', 'Pyramid, cone and sphere'),
            summary: L(
              'Wasser umschütten zeigt: Eine Pyramide fasst ein Drittel des Prismas. Dazu Volumen und Oberfläche von Pyramide, Kegel und Kugel, drehbar in 3D.',
              'Pouring water shows that a pyramid holds one third of a prism. With volume and surface area of pyramids, cones and spheres, rotatable in 3D.',
            ),
            grades: [7, 10],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Pyramide', 'Kegel', 'Kugel', 'Volumen', 'Oberfläche', 'Mantel', 'Seitenhöhe', 'Seitenkante', 'Mantellinie', 'Satz des Pythagoras', 'Kreissektor', 'Umschüttversuch', 'Archimedes', 'Halbkugel', 'Netz'],
              ['pyramid', 'cone', 'sphere', 'volume', 'surface area', 'lateral surface', 'slant height', 'lateral edge', 'Pythagorean theorem', 'circular sector', 'pouring experiment', 'Archimedes', 'hemisphere', 'net'],
            ),
          },
          {
            id: 'cavalieri',
            status: 'ready',
            slug: L('prinzip-von-cavalieri', 'cavalieris-principle'),
            title: L('Prinzip von Cavalieri', 'Cavalieri’s principle'),
            summary: L(
              'Schiebe einen Münzstapel schief: Die Form ändert sich, das Volumen bleibt gleich. Das ist das Prinzip von Cavalieri.',
              'Push a stack of coins sideways: the shape changes, but the volume stays the same. This is Cavalieri\'s principle.',
            ),
            grades: [10, 10],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K2', 'M-K4'],
            keywords: L(
              ['Cavalieri', 'Prinzip von Cavalieri', 'Querschnitt', 'Schnittfläche', 'Volumen', 'schiefer Zylinder', 'schiefes Prisma', 'schiefe Pyramide', 'schiefer Kegel', 'Kugelvolumen', 'Halbkugel', 'Münzstapel', 'Scheiben', 'Grenzwert'],
              ['Cavalieri', 'Cavalieri’s principle', 'cross-section', 'volume', 'oblique cylinder', 'oblique prism', 'oblique pyramid', 'oblique cone', 'volume of a sphere', 'hemisphere', 'stack of coins', 'slices', 'limit'],
            ),
          },
        ]),
        topic('volumen', L('Volumen', 'Volume'), [
          {
            id: 'quader-volumen',
            status: 'ready',
            slug: L('quader-volumen', 'volume-of-cuboids'),
            title: L('Volumen von Quadern mit Einheitswürfeln', 'Volume of cuboids with unit cubes'),
            summary: L(
              'Fülle einen Quader Reihe für Reihe mit kleinen Würfeln. So wird klar, warum das Volumen Länge mal Breite mal Höhe ist.',
              'Fill a cuboid row by row with small cubes. This makes clear why the volume is length times width times height.',
            ),
            grades: [5, 6],
            kmk: ['M-L2', 'M-L4', 'M-K1', 'M-K4'],
            keywords: L(
              ['Volumen', 'Rauminhalt', 'Quader', 'Würfel', 'Einheitswürfel', 'Kubikzentimeter', 'Liter', 'Volumeneinheiten', 'Schicht', 'Reihe'],
              ['volume', 'cuboid', 'cube', 'unit cube', 'cubic centimetre', 'litre', 'units of volume', 'layer', 'row'],
            ),
          },
        ]),
        topic('kreis', L('Kreis', 'Circle'), [
          {
            id: 'kreiszahl-pi',
            status: 'ready',
            slug: L('kreiszahl-pi', 'number-pi'),
            title: L('Kreisumfang, Kreisfläche und die Zahl π', 'Circumference, area of a circle and the number π'),
            summary: L(
              'Ein Rad rollt ab, und Kreisstücke werden zu einem Rechteck gelegt. So entdeckst du die Zahl π und die Formeln für Umfang und Fläche des Kreises.',
              'A wheel rolls along and pieces of a circle are rearranged into a rectangle. This is how you discover π and the formulas for the circumference and area of a circle.',
            ),
            grades: [8, 9],
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
              'Doppelt so viele Äpfel kosten doppelt so viel. Bild, Tabelle und Graph zeigen gemeinsam, wann eine Zuordnung proportional ist, mit Dreisatz.',
              'Twice as many apples cost twice as much. Picture, table and graph show together when a relation is proportional, with the rule of three.',
            ),
            grades: [6, 8],
            kmk: ['M-L3', 'M-K3', 'M-K4'],
            keywords: L(
              ['proportional', 'direkt proportional', 'indirekt proportional', 'antiproportional', 'Dreisatz', 'quotientengleich', 'produktgleich', 'Proportionalitätsfaktor', 'Ursprungsgerade', 'Hyperbel', 'Wertetabelle', 'Zuordnung', 'Verdoppeln', 'Grundgebühr'],
              ['proportional', 'directly proportional', 'inversely proportional', 'rule of three', 'equal quotients', 'equal products', 'constant of proportionality', 'line through the origin', 'hyperbola', 'table of values', 'relation', 'doubling', 'base fare'],
            ),
          },
          {
            id: 'funktion-zuordnung',
            status: 'ready',
            slug: L('funktion-oder-nicht', 'function-or-not'),
            title: L('Funktion oder nicht? Zuordnungen und ihre Graphen', 'Function or not? Relations and their graphs'),
            summary: L(
              'Setze Pfeile zwischen zwei Mengen und sieh sofort, ob die Zuordnung eine Funktion ist, als Pfeilbild, Tabelle und Graph.',
              'Draw arrows between two sets and see straight away whether the relation is a function, as an arrow diagram, a table and a graph.',
            ),
            grades: [6, 8],
            kmk: ['M-L3', 'M-K4', 'M-K1', 'M-K5'],
            keywords: L(
              ['Funktion', 'Zuordnung', 'eindeutig', 'Pfeildiagramm', 'Wertetabelle', 'Graph', 'senkrechter Linientest', 'Vertikalentest', 'Definitionsmenge', 'Wertemenge', 'Funktionsgraph', 'Umkehrung', 'Kreis', 'Treppenfunktion'],
              ['function', 'relation', 'mapping', 'unique', 'arrow diagram', 'table of values', 'graph', 'vertical line test', 'domain', 'range', 'inverse', 'circle', 'step function'],
            ),
          },
          {
            id: 'funktionsplotter',
            status: 'ready',
            slug: L('funktionsplotter', 'function-plotter'),
            title: L('Funktionsplotter mit eigenen Termen', 'Function plotter with custom terms'),
            summary: L(
              'Gib bis zu drei eigene Funktionsterme ein und sieh ihre Graphen, mit Wertetabelle, Nullstellen und Schnittpunkten.',
              'Enter up to three of your own functions and see their graphs, with a table of values, zeros and intersections.',
            ),
            grades: [8, 13],
            uni: true,
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K2'],
            keywords: L(
              ['Funktionsplotter', 'Funktionenplotter', 'Graph zeichnen', 'Term', 'Wertetabelle', 'Spur', 'Nullstelle', 'Schnittpunkt', 'Hochpunkt', 'Tiefpunkt', 'Extrempunkt', 'Polstelle', 'Definitionslücke', 'Asymptote', 'Funktionenschar', 'Parameter', 'Tangente', 'Sinus', 'Exponentialfunktion', 'Logarithmus', 'gebrochen-rational', 'ganzrational'],
              ['function plotter', 'graphing', 'expression', 'table of values', 'trace', 'zero', 'root', 'intersection', 'maximum', 'minimum', 'turning point', 'pole', 'asymptote', 'family of functions', 'parameter', 'tangent', 'sine', 'exponential', 'logarithm', 'rational function', 'polynomial'],
            ),
          },
        ]),
        topic('lineare-funktionen', L('Lineare Funktionen', 'Linear functions'), [
          {
            id: 'lineare-funktion',
            status: 'ready',
            slug: L('lineare-funktion', 'linear-function'),
            title: L('Lineare Funktion', 'Linear function'),
            summary: L(
              'Verändere Steigung und y-Achsenabschnitt einer Geraden und lies Steigungsdreieck und Nullstelle ab.',
              'Change the slope and the y-intercept of a line and read off the slope triangle and the zero.',
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
              'Verschiebe und strecke eine Hyperbel und sieh, wie sie sich ihren Asymptoten nähert.',
              'Shift and stretch a hyperbola and see how it approaches its asymptotes.',
            ),
            grades: [8, 10],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Hyperbel', 'Asymptote', 'Polstelle', 'Definitionslücke', 'Definitionsmenge', 'Wertemenge', 'indirekte Proportionalität', 'gebrochen-rationale Funktion', 'Kehrwertfunktion'],
              ['hyperbola', 'asymptote', 'pole', 'domain', 'range', 'inverse proportion', 'rational function', 'reciprocal function'],
            ),
          },
          {
            id: 'polstellen-asymptoten',
            status: 'ready',
            slug: L('polstellen-asymptoten', 'poles-asymptotes'),
            title: L('Polstellen und Asymptoten gebrochen-rationaler Funktionen', 'Poles and asymptotes of rational functions'),
            summary: L(
              'Ziehe Nullstellen und Polstellen eines Bruchterms und sieh, wie sich der Graph verändert. Mit Asymptoten und Lücken im Graphen.',
              'Drag the zeros and poles of a rational function and see how the graph changes. With asymptotes and holes in the graph.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K1'],
            keywords: L(
              ['gebrochen-rationale Funktion', 'Polstelle', 'Asymptote', 'senkrechte Asymptote', 'waagrechte Asymptote', 'schräge Asymptote', 'Definitionslücke', 'hebbare Lücke', 'Polynomdivision', 'Vorzeichenwechsel', 'Grenzwert', 'Kürzen', 'Näherungskurve', 'Vorzeichentabelle'],
              ['rational function', 'pole', 'asymptote', 'vertical asymptote', 'horizontal asymptote', 'oblique asymptote', 'removable discontinuity', 'polynomial division', 'sign change', 'limit', 'cancelling', 'approximating curve', 'sign chart'],
            ),
          },
        ]),
        topic('quadratische-funktionen', L('Quadratische Funktionen', 'Quadratic functions'), [
          {
            id: 'quadratische-funktion',
            status: 'ready',
            slug: L('quadratische-funktion', 'quadratic-function'),
            title: L('Quadratische Funktion', 'Quadratic function'),
            summary: L(
              'Strecke, spiegle und verschiebe Parabeln und lies Scheitelpunkt und Nullstellen ab.',
              'Stretch, reflect and shift parabolas and read off the vertex and the zeros.',
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
              'Ziehe drei Punkte, und die passende Parabel geht immer durch alle drei. Die Gleichung wird Schritt für Schritt berechnet.',
              'Drag three points and the matching parabola always passes through all of them. The equation is worked out step by step.',
            ),
            grades: [9, 11],
            kmk: ['M-L3', 'M-K2', 'M-K3', 'M-K5'],
            keywords: L(
              ['Parabel', 'drei Punkte', 'lineares Gleichungssystem', 'Additionsverfahren', 'Einsetzen', 'Scheitelform', 'Nullstellenform', 'quadratische Funktion', 'Funktionsterm bestimmen'],
              ['parabola', 'three points', 'system of linear equations', 'elimination', 'substitution', 'vertex form', 'factored form', 'quadratic function', 'curve fitting'],
            ),
          },
          {
            id: 'extremwert-parabel',
            status: 'ready',
            slug: L('extremwertaufgaben-parabeln', 'optimisation-problems-parabolas'),
            title: L('Extremwertaufgaben mit Parabeln', 'Optimisation problems with parabolas'),
            summary: L(
              'Welches Gehege hat die größte Fläche? Bild und Graph zeigen das Maximum, erst durch Probieren, dann genau berechnet.',
              'Which enclosure has the largest area? Picture and graph show the maximum, first by trying, then by exact calculation.',
            ),
            grades: [9, 9],
            kmk: ['M-L3', 'M-K2', 'M-K3', 'M-K5'],
            keywords: L(
              ['Extremwertaufgabe', 'Maximum', 'Scheitelpunkt', 'quadratische Ergänzung', 'Scheitelform', 'Zielfunktion', 'Nebenbedingung', 'Definitionsbereich', 'Optimierung', 'Erlös'],
              ['optimisation problem', 'maximum', 'vertex', 'completing the square', 'vertex form', 'objective function', 'constraint', 'domain', 'optimization', 'revenue'],
            ),
          },
        ]),
        topic('potenzfunktionen', L('Potenzfunktionen', 'Power functions'), [
          {
            id: 'potenzfunktionen',
            status: 'ready',
            slug: L('potenzfunktionen', 'power-functions'),
            title: L('Potenzfunktionen y = a · xⁿ', 'Power functions y = a · xⁿ'),
            summary: L(
              'Ändere den Exponenten und sieh, wie sich der Graph von y = a · xⁿ verwandelt. Mit Symmetrie und gemeinsamen Punkten.',
              'Change the exponent and watch how the graph of y = a · xⁿ changes. With symmetry and shared points.',
            ),
            grades: [9, 11],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Potenzfunktion', 'Exponent', 'Parabel n-ter Ordnung', 'Hyperbel n-ter Ordnung', 'Achsensymmetrie', 'Punktsymmetrie', 'Monotonie', 'Wertemenge', 'Definitionsmenge', 'Asymptote', 'Polstelle', 'gemeinsame Punkte'],
              ['power function', 'exponent', 'parabola', 'hyperbola', 'even function', 'odd function', 'symmetry', 'monotonicity', 'range', 'domain', 'asymptote', 'pole'],
            ),
          },
        ]),
        topic('trigonometrische-funktionen', L('Trigonometrische Funktionen', 'Trigonometric functions'), [
          {
            id: 'einheitskreis',
            status: 'ready',
            slug: L('einheitskreis', 'unit-circle'),
            title: L('Einheitskreis', 'Unit circle'),
            summary: L(
              'Sinus, Kosinus und Tangens am Einheitskreis und wie daraus die Sinuskurve entsteht.',
              'Sine, cosine and tangent on the unit circle, and how the sine curve grows out of it.',
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
              'Verändere Amplitude, Periode und Verschiebung einer Sinuskurve mit Reglern oder durch Ziehen.',
              'Change the amplitude, period and shift of a sine curve with sliders or by dragging.',
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
            id: 'logarithmus',
            status: 'ready',
            slug: L('logarithmus', 'logarithms'),
            title: L('Logarithmus als Umkehrung des Potenzierens', 'Logarithms as the inverse of exponentiation'),
            summary: L(
              'Der Logarithmus beantwortet die Frage: Hoch wie viel ergibt diese Zahl? Mit Graphen, Rechengesetzen und Exponentialgleichungen.',
              'The logarithm answers the question: to what power do I raise the base to get this number? With graphs, rules and exponential equations.',
            ),
            grades: [9, 12],
            kmk: ['M-L1', 'M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Logarithmus', 'Logarithmusfunktion', 'Umkehrfunktion', 'Basis', 'Exponentialgleichung', 'Basiswechsel', 'Produktregel', 'Quotientenregel', 'Potenzregel', 'Zehnerlogarithmus', 'natürlicher Logarithmus', 'lg', 'ln', 'Rechenschieber', 'Spiegelung an y = x'],
              ['logarithm', 'logarithmic function', 'inverse function', 'base', 'exponential equation', 'change of base', 'product rule', 'quotient rule', 'power rule', 'common logarithm', 'natural logarithm', 'lg', 'ln', 'slide rule', 'reflection in y = x'],
            ),
          },
          {
            id: 'exponentielles-wachstum',
            status: 'ready',
            slug: L('exponentielles-wachstum', 'exponential-growth'),
            title: L('Exponentielles Wachstum und Zerfall', 'Exponential growth and decay'),
            summary: L(
              'Seerosen auf dem Teich, Zinseszins und Zerfall: Exponentielles Wachstum im Vergleich mit linearem Wachstum.',
              'Water lilies on a pond, compound interest and decay: exponential growth compared with linear growth.',
            ),
            grades: [10, 10],
            kmk: ['M-L3', 'M-K3', 'M-K4'],
            keywords: L(
              ['exponentielles Wachstum', 'Wachstumsfaktor', 'Verdopplungszeit', 'Halbwertszeit', 'Zinseszins', 'Zerfall', 'Exponentialfunktion', 'logarithmische Skala'],
              ['exponential growth', 'growth factor', 'doubling time', 'half-life', 'compound interest', 'decay', 'exponential function', 'logarithmic scale'],
            ),
            thumb: 'growth',
          },
          {
            id: 'e-funktion',
            status: 'ready',
            slug: L('natuerliche-exponentialfunktion', 'natural-exponential-function'),
            title: L('Die natürliche Exponentialfunktion', 'The natural exponential function'),
            summary: L(
              'Warum ist die Zahl e so besonders? Bei der e-Funktion sind Graph und Ableitung genau gleich.',
              'Why is the number e so special? For the exponential function, the graph and its derivative are exactly the same.',
            ),
            grades: [12, 12],
            kmk: ['M-L3', 'M-K5', 'M-K4', 'M-K1'],
            keywords: L(
              ['e-Funktion', 'Exponentialfunktion', 'eulersche Zahl', 'e', 'Ableitung', 'Tangente', 'Steigungsdreieck', 'natürlicher Logarithmus', 'ln', 'Umkehrfunktion', 'Zinseszins', 'Grenzwert', 'Stammfunktion'],
              ['exponential function', 'natural exponential', "Euler's number", 'e', 'derivative', 'tangent', 'slope triangle', 'natural logarithm', 'ln', 'inverse function', 'compound interest', 'limit', 'antiderivative'],
            ),
          },
        ]),
        topic('ganzrationale', L('Ganzrationale Funktionen', 'Polynomial functions'), [
          {
            id: 'ganzrationale-funktionen',
            status: 'ready',
            slug: L('ganzrationale-funktionen', 'polynomial-functions'),
            title: L('Ganzrationale Funktionen: Nullstellen, Vielfachheit und Randverhalten', 'Polynomial functions: zeros, multiplicity and end behaviour'),
            summary: L(
              'Ziehe die Nullstellen eines Polynoms und sieh, ob der Graph die x-Achse schneidet oder nur berührt. Dazu das Verhalten weit draußen.',
              'Drag the zeros of a polynomial and see whether the graph crosses the x-axis or just touches it. Plus the behaviour far out.',
            ),
            grades: [10, 11],
            kmk: ['M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['ganzrationale Funktion', 'Polynom', 'Nullstelle', 'Vielfachheit', 'Linearfaktor', 'Berührpunkt', 'Terrassenpunkt', 'Vorzeichenwechsel', 'Vorzeichentabelle', 'Randverhalten', 'Grad', 'Leitkoeffizient', 'Normalform', 'Ausmultiplizieren', 'y-Achsenabschnitt'],
              ['polynomial function', 'polynomial', 'zero', 'root', 'multiplicity', 'linear factor', 'touching point', 'terrace point', 'sign change', 'sign chart', 'end behaviour', 'degree', 'leading coefficient', 'expanded form', 'y-intercept'],
            ),
          },
        ]),
        topic('eigenschaften', L('Eigenschaften von Funktionen', 'Properties of functions'), [
          {
            id: 'transformationen',
            status: 'ready',
            slug: L('graphen-verschieben-strecken-spiegeln', 'shifting-stretching-reflecting-graphs'),
            title: L('Graphen verschieben, strecken und spiegeln', 'Shifting, stretching and reflecting graphs'),
            summary: L(
              'Verschiebe, strecke und spiegle Graphen Schritt für Schritt und sieh, wie sich der Funktionsterm ändert.',
              'Shift, stretch and reflect graphs step by step and see how the function\'s equation changes.',
            ),
            grades: [10, 11],
            kmk: ['M-L3', 'M-K4'],
            keywords: L(
              ['Verschiebung', 'Streckung', 'Stauchung', 'Spiegelung', 'Transformation', 'Graph', 'Parameter', 'Grundfunktion', 'x-Richtung', 'y-Richtung', 'Asymptote', 'Reihenfolge', 'Definitionsmenge', 'Wertemenge'],
              ['shift', 'translation', 'stretch', 'compression', 'reflection', 'transformation', 'graph', 'parameter', 'basic function', 'order', 'domain', 'range'],
            ),
          },
          {
            id: 'grenzverhalten',
            status: 'ready',
            slug: L('grenzverhalten-asymptoten', 'limits-and-asymptotes'),
            title: L('Grenzverhalten und Asymptoten', 'Limits and asymptotes'),
            summary: L(
              'Was passiert mit einem Graphen, wenn x sehr groß wird? Ein Punkt läuft nach außen, und eine Lupe zeigt, wie nah er der Asymptote kommt.',
              'What happens to a graph when x gets very large? A point runs outwards and a magnifier shows how close it gets to the asymptote.',
            ),
            grades: [10, 12],
            kmk: ['M-L3', 'M-K1', 'M-K4'],
            keywords: L(
              ['Grenzwert', 'Grenzverhalten', 'Asymptote', 'waagrechte Asymptote', 'unendlich', 'Limes', 'ε-Schlauch', 'ε-Streifen', 'Gradregel', 'Annäherung', 'Wertetabelle', 'gebrochen-rationale Funktion'],
              ['limit', 'end behaviour', 'asymptote', 'horizontal asymptote', 'infinity', 'epsilon strip', 'approach', 'table of values', 'rational function'],
            ),
          },
          {
            id: 'umkehrfunktion',
            status: 'ready',
            slug: L('umkehrfunktion', 'inverse-function'),
            title: L('Umkehrfunktionen: Spiegeln an y = x', 'Inverse functions: reflecting in y = x'),
            summary: L(
              'Spiegle einen Graphen an der Geraden y = x und erhalte die Umkehrfunktion. So siehst du, wann eine Funktion umkehrbar ist.',
              'Reflect a graph in the line y = x to get the inverse function. This shows when a function can be inverted.',
            ),
            grades: [10, 12],
            kmk: ['M-L3', 'M-K4', 'M-K5', 'M-K1'],
            keywords: L(
              ['Umkehrfunktion', 'umkehrbar', 'Spiegelung', 'Winkelhalbierende', 'y = x', 'Wurzelfunktion', 'Logarithmus', 'ln', 'Monotonie', 'streng monoton', 'Definitionsmenge', 'Wertemenge', 'Ableitung der Umkehrfunktion', 'senkrechte Tangente', 'arcsin'],
              ['inverse function', 'invertible', 'reflection', 'y = x', 'square root', 'logarithm', 'ln', 'monotonic', 'strictly monotonic', 'domain', 'range', 'derivative of the inverse', 'vertical tangent', 'arcsin'],
            ),
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
              'Wie viele Outfits oder Eiskombinationen gibt es? Ein Baumdiagramm wächst Stufe für Stufe, und du siehst, warum man die Möglichkeiten multipliziert.',
              'How many outfits or ice cream combinations are there? A tree diagram grows step by step and shows why you multiply the options.',
            ),
            grades: [5, 9],
            kmk: ['M-L5', 'M-L1', 'M-K2', 'M-K4'],
            keywords: L(
              ['Zählprinzip', 'Produktregel', 'Baumdiagramm', 'Kombinatorik', 'systematisches Abzählen', 'mit Wiederholung', 'ohne Wiederholung', 'Fakultät', 'Reihenfolge', 'PIN'],
              ['counting principle', 'product rule', 'tree diagram', 'combinatorics', 'systematic counting', 'with repetition', 'without repetition', 'factorial', 'order', 'PIN'],
            ),
          },
        ]),
        topic('daten', L('Daten auswerten', 'Analysing data'), [
          {
            id: 'diagramme',
            status: 'ready',
            slug: L('diagramme-lesen-und-pruefen', 'reading-charts-critically'),
            title: L('Diagramme lesen und kritisch prüfen', 'Reading charts critically'),
            summary: L(
              'Stelle dieselben Daten als Säulen-, Linien-, Kreisdiagramm und mehr dar und entdecke, wie Diagramme täuschen können.',
              'Show the same data as bar, line and pie charts and more, and discover how charts can mislead.',
            ),
            grades: [6, 9],
            kmk: ['M-L5', 'M-K6', 'M-K4', 'M-K1'],
            keywords: L(
              ['Diagramm', 'Säulendiagramm', 'Balkendiagramm', 'Kreisdiagramm', 'Liniendiagramm', 'Piktogramm', 'Streifendiagramm', 'Strichliste', 'Anteil', 'Prozent', 'Mittelpunktswinkel', 'abgeschnittene Achse', 'Täuschung', 'Daten'],
              ['chart', 'column chart', 'bar chart', 'pie chart', 'line chart', 'pictogram', 'strip chart', 'tally chart', 'share', 'percent', 'central angle', 'truncated axis', 'misleading graphs', 'data'],
            ),
          },
          {
            id: 'boxplot',
            status: 'ready',
            slug: L('mittelwert-median-boxplot', 'mean-median-box-plot'),
            title: L('Mittelwert, Median und Boxplot', 'Mean, median and box plots'),
            summary: L(
              'Ziehe Datenpunkte auf dem Zahlenstrahl und sieh, wie sich Mittelwert, Median und Boxplot sofort verändern.',
              'Drag data points along a number line and see how the mean, the median and the box plot change straight away.',
            ),
            grades: [6, 9],
            kmk: ['M-L5', 'M-K4', 'M-K1', 'M-K6'],
            keywords: L(
              ['Boxplot', 'Median', 'Zentralwert', 'Mittelwert', 'arithmetisches Mittel', 'Quartil', 'Quartilsabstand', 'Spannweite', 'Minimum', 'Maximum', 'Rangliste', 'Ausreißer', 'Kenngrößen', 'Daten vergleichen'],
              ['box plot', 'box-and-whisker plot', 'median', 'mean', 'average', 'quartile', 'interquartile range', 'range', 'minimum', 'maximum', 'ordered list', 'outlier', 'summary statistics', 'comparing data'],
            ),
          },
        ]),
        topic('wahrscheinlichkeit', L('Wahrscheinlichkeit', 'Probability'), [
          {
            id: 'gesetz-grosse-zahlen',
            status: 'ready',
            slug: L('gesetz-der-grossen-zahlen', 'law-of-large-numbers'),
            title: L('Gesetz der großen Zahlen', 'Law of large numbers'),
            summary: L(
              'Wirf eine Münze, einen Würfel oder einen Reißnagel tausendmal: Je öfter du wirfst, desto näher kommt die relative Häufigkeit der Wahrscheinlichkeit.',
              'Toss a coin, a die or a drawing pin a thousand times: the more often you throw, the closer the relative frequency gets to the probability.',
            ),
            grades: [6, 9],
            kmk: ['M-L5', 'M-K3', 'M-K4'],
            keywords: L(
              ['relative Häufigkeit', 'absolute Häufigkeit', 'Wahrscheinlichkeit', 'Zufallsexperiment', 'Würfel', 'Münze', 'Reißnagel', 'empirisches Gesetz der großen Zahlen'],
              ['relative frequency', 'absolute frequency', 'probability', 'random experiment', 'die', 'coin', 'drawing pin', 'law of large numbers'],
            ),
            thumb: 'frequency',
          },
          {
            id: 'baumdiagramm',
            status: 'ready',
            slug: L('baumdiagramm-pfadregeln', 'tree-diagram-path-rules'),
            title: L('Mehrstufige Zufallsexperimente und Pfadregeln', 'Multi-stage experiments and path rules'),
            summary: L(
              'Ziehe Kugeln aus einer Urne, mit oder ohne Zurücklegen. Das Baumdiagramm und die Pfadregeln zeigen, wie man Wahrscheinlichkeiten berechnet.',
              'Draw balls from an urn, with or without replacement. The tree diagram and the path rules show how to calculate probabilities.',
            ),
            grades: [8, 10],
            kmk: ['M-L5', 'M-K4', 'M-K3', 'M-K2'],
            keywords: L(
              ['Baumdiagramm', 'Pfadregel', 'Produktregel', 'Summenregel', 'Urnenmodell', 'mit Zurücklegen', 'ohne Zurücklegen', 'mehrstufiges Zufallsexperiment', 'Ereignis', 'Gegenereignis', 'Simulation', 'relative Häufigkeit'],
              ['tree diagram', 'path rule', 'product rule', 'sum rule', 'urn model', 'with replacement', 'without replacement', 'multi-stage experiment', 'event', 'complement', 'simulation', 'relative frequency'],
            ),
          },
          {
            id: 'geburtstagsproblem',
            status: 'ready',
            slug: L('geburtstagsproblem', 'birthday-problem'),
            title: L('Geburtstagsproblem simulieren', 'Simulating the birthday problem'),
            summary: L(
              'Wie wahrscheinlich ist es, dass zwei in der Klasse am selben Tag Geburtstag haben? Schon ab 23 Personen ist es wahrscheinlicher als nicht.',
              'How likely is it that two people in a class share a birthday? From just 23 people on, it is more likely than not.',
            ),
            grades: [8, 13],
            kmk: ['M-L5', 'M-K3', 'M-K2', 'M-K1'],
            keywords: L(
              ['Geburtstagsproblem', 'Geburtstagsparadoxon', 'Gegenereignis', 'Simulation', 'Pfadregel', 'Laplace', 'relative Häufigkeit', 'Wahrscheinlichkeit', '23 Personen', 'Paare', 'Schubfachprinzip', 'Gesetz der großen Zahlen'],
              ['birthday problem', 'birthday paradox', 'complement', 'simulation', 'path rule', 'Laplace', 'relative frequency', 'probability', '23 people', 'pairs', 'pigeonhole principle', 'law of large numbers'],
            ),
          },
          {
            id: 'monte-carlo-pi',
            status: 'ready',
            slug: L('monte-carlo-pi', 'monte-carlo-pi'),
            title: L('Monte-Carlo-Methode: π mit Zufall bestimmen', 'Monte Carlo method: estimating π by chance'),
            summary: L(
              'Zufällige Punkte fallen auf ein Quadrat mit einem Kreis darin. Aus dem Anteil im Kreis lässt sich π schätzen.',
              'Random points fall on a square with a circle inside. From the share inside the circle you can estimate π.',
            ),
            grades: [8, 10],
            kmk: ['M-L5', 'M-L2', 'M-K3'],
            keywords: L(
              ['Monte-Carlo', 'Kreiszahl', 'Pi', 'Simulation', 'Zufallszahlen', 'Flächenverhältnis', 'Kreisfläche'],
              ['Monte Carlo', 'pi', 'simulation', 'random numbers', 'area ratio', 'circle area'],
            ),
            thumb: 'monte-carlo',
          },
          {
            id: 'ziegenproblem',
            status: 'ready',
            slug: L('ziegenproblem', 'monty-hall-problem'),
            title: L('Ziegenproblem', 'Monty Hall problem'),
            summary: L(
              'Spiele selbst oder simuliere tausende Spiele: Lohnt es sich, die Tür zu wechseln?',
              'Play yourself or simulate thousands of games: is it worth switching doors?',
            ),
            grades: [10, 12],
            kmk: ['M-L5', 'M-K2', 'M-K3'],
            keywords: L(
              ['Ziegenproblem', 'Monty-Hall-Problem', 'Drei-Türen-Problem', 'bedingte Wahrscheinlichkeit', 'Simulation', 'Baumdiagramm', 'Wechseln'],
              ['Monty Hall problem', 'three doors', 'goat', 'conditional probability', 'simulation', 'tree diagram', 'switch'],
            ),
            thumb: 'doors',
          },
        ]),
        topic('verknuepfte-ereignisse', L('Verknüpfte Ereignisse und bedingte Wahrscheinlichkeit', 'Combined events and conditional probability'), [
          {
            id: 'vierfeldertafel',
            status: 'ready',
            slug: L('vierfeldertafel-mengendiagramm', 'two-way-table-venn-diagram'),
            title: L('Vierfeldertafel und Mengendiagramm', 'Two-way tables and Venn diagrams'),
            summary: L(
              'Vierfeldertafel, Mengendiagramm und Baumdiagramm zeigen dieselben Daten und hängen zusammen. Wer eins verändert, sieht die anderen mitlaufen.',
              'A two-way table, a Venn diagram and a tree diagram show the same data and are linked. Change one and the others follow.',
            ),
            grades: [8, 13],
            kmk: ['M-L5', 'M-K4', 'M-K1'],
            keywords: L(
              ['Vierfeldertafel', 'Mengendiagramm', 'Venn-Diagramm', 'Schnittmenge', 'Vereinigungsmenge', 'Gegenereignis', 'Additionssatz', 'Baumdiagramm', 'umgekehrter Baum', 'bedingte Wahrscheinlichkeit', 'Unabhängigkeit', 'Randsumme', 'Einheitsquadrat', 'natürliche Häufigkeiten'],
              ['two-way table', 'contingency table', 'Venn diagram', 'intersection', 'union', 'complement', 'addition rule', 'tree diagram', 'reversed tree', 'conditional probability', 'independence', 'marginal total', 'unit square', 'natural frequencies'],
            ),
          },
          {
            id: 'bedingte-wahrscheinlichkeit',
            status: 'ready',
            slug: L('bedingte-wahrscheinlichkeit-medizinische-tests', 'conditional-probability-medical-tests'),
            title: L('Bedingte Wahrscheinlichkeit am Beispiel medizinischer Tests', 'Conditional probability with medical tests'),
            summary: L(
              'Ein medizinischer Test ist positiv, aber wie wahrscheinlich ist man wirklich krank? 1000 Personen zeigen, warum die Antwort oft überrascht.',
              'A medical test is positive, but how likely is it that you are really ill? 1000 people show why the answer is often surprising.',
            ),
            grades: [10, 13],
            kmk: ['M-L5', 'M-K3', 'M-K4', 'M-K1'],
            keywords: L(
              ['bedingte Wahrscheinlichkeit', 'Satz von Bayes', 'Sensitivität', 'Spezifität', 'Prävalenz', 'Vorhersagewert', 'falsch positiv', 'falsch negativ', 'Basisrate', 'natürliche Häufigkeiten', 'umgekehrter Baum', 'medizinischer Test', 'Schnelltest'],
              ['conditional probability', 'Bayes’ theorem', 'sensitivity', 'specificity', 'prevalence', 'predictive value', 'false positive', 'false negative', 'base rate fallacy', 'natural frequencies', 'reversed tree', 'medical test', 'rapid test'],
            ),
          },
        ]),
        topic('verteilungen', L('Wahrscheinlichkeitsverteilungen und Testen', 'Probability distributions and testing'), [
          {
            id: 'galtonbrett',
            status: 'ready',
            slug: L('galtonbrett', 'galton-board'),
            title: L('Galtonbrett', 'Galton board'),
            summary: L(
              'Kugeln fallen durch Nagelreihen und sammeln sich in Fächern. So entsteht die Form der Binomialverteilung.',
              'Balls fall through rows of pins and collect in bins. This produces the shape of the binomial distribution.',
            ),
            grades: [9, 12],
            kmk: ['M-L5', 'M-K3', 'M-K4'],
            keywords: L(
              ['Galtonbrett', 'Binomialverteilung', 'Bernoulli-Kette', 'Pascal’sches Dreieck', 'Binomialkoeffizient', 'Normalverteilung', 'Erwartungswert', 'Standardabweichung'],
              ['Galton board', 'binomial distribution', 'Bernoulli trials', 'Pascal’s triangle', 'binomial coefficient', 'normal distribution', 'expected value', 'standard deviation'],
            ),
            thumb: 'galton',
          },
          {
            id: 'binomialverteilung',
            status: 'ready',
            slug: L('binomialverteilung', 'binomial-distribution'),
            title: L('Binomialverteilung', 'Binomial distribution'),
            summary: L(
              'Das Histogramm der Binomialverteilung: Wähle einen Bereich und lies die Wahrscheinlichkeit direkt ab.',
              'The histogram of the binomial distribution: choose a range and read off the probability directly.',
            ),
            grades: [11, 13],
            kmk: ['M-L5', 'M-K4', 'M-K5'],
            keywords: L(
              ['Binomialverteilung', 'Bernoulli-Kette', 'Bernoulli-Experiment', 'Binomialkoeffizient', 'kumulierte Verteilungsfunktion', 'Treppenfunktion', 'Erwartungswert', 'Standardabweichung', 'Sigma-Umgebung', 'Trefferwahrscheinlichkeit', 'höchstens', 'mindestens'],
              ['binomial distribution', 'Bernoulli chain', 'Bernoulli trial', 'binomial coefficient', 'cumulative distribution function', 'step function', 'expected value', 'standard deviation', 'sigma interval', 'probability of success', 'at most', 'at least'],
            ),
          },
          {
            id: 'signifikanztest',
            status: 'ready',
            slug: L('signifikanztest', 'significance-test'),
            title: L('Einseitiger Signifikanztest: Fehler 1. und 2. Art', 'One-sided significance test: type I and II errors'),
            summary: L(
              'Ein Test entscheidet zwischen zwei Vermutungen. Farbige Flächen zeigen, wie oft er sich irren kann.',
              'A test decides between two hypotheses. Coloured areas show how often it can be wrong.',
            ),
            grades: [12, 13],
            kmk: ['M-L5', 'M-K1', 'M-K3', 'M-K4'],
            keywords: L(
              ['Signifikanztest', 'Hypothesentest', 'Nullhypothese', 'Gegenhypothese', 'Signifikanzniveau', 'Ablehnungsbereich', 'Annahmebereich', 'kritischer Wert', 'Entscheidungsregel', 'Fehler 1. Art', 'Fehler 2. Art', 'Irrtumswahrscheinlichkeit', 'Gütefunktion', 'Binomialverteilung'],
              ['significance test', 'hypothesis test', 'null hypothesis', 'alternative hypothesis', 'significance level', 'critical region', 'acceptance region', 'critical value', 'decision rule', 'type I error', 'type II error', 'power', 'power curve', 'binomial distribution'],
            ),
          },
          {
            id: 'normalverteilung',
            status: 'ready',
            slug: L('normalverteilung', 'normal-distribution'),
            title: L('Normalverteilung', 'Normal distribution'),
            summary: L(
              'Die Glockenkurve: Wahrscheinlichkeiten sind Flächen unter der Kurve. Mit Sigma-Regeln und Beispielen wie Abfüllanlagen.',
              'The bell curve: probabilities are areas under the curve. With the sigma rules and examples such as filling machines.',
            ),
            grades: [12, 13],
            uni: true,
            kmk: ['M-L5', 'M-K3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Normalverteilung', 'Gauß', 'Glockenkurve', 'Dichtefunktion', 'Verteilungsfunktion', 'Erwartungswert', 'Standardabweichung', 'Sigma-Regeln', 'Standardisierung', 'z-Wert', 'Quantil', 'z-Tabelle', 'Wendestelle', 'Toleranz', 'Qualitätskontrolle', 'stetige Zufallsgröße', 'Binomialverteilung', 'Näherung', 'Stetigkeitskorrektur', 'Laplace-Bedingung', 'Stichprobe', 'Histogramm'],
              ['normal distribution', 'Gaussian', 'bell curve', 'density', 'distribution function', 'mean', 'standard deviation', 'sigma rules', 'z-score', 'quantile', 'z table', 'point of inflection', 'tolerance', 'quality control', 'continuous random variable', 'binomial distribution', 'approximation', 'continuity correction', 'Laplace condition', 'sample', 'histogram'],
            ),
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
              'Lass einen Punkt Q auf P zulaufen: Aus der Sekante wird die Tangente und aus der mittleren Steigung die Ableitung.',
              'Let a point Q move towards P: the secant becomes the tangent, and the average slope becomes the derivative.',
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
              'Finde eine Nullstelle näherungsweise mit Tangenten. Jeder Schritt bringt dich näher, aber manchmal geht es auch schief.',
              'Approximate a zero with tangent lines. Each step gets you closer, but sometimes it goes wrong.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-L1', 'M-K2', 'M-K5'],
            keywords: L(
              ['Newton-Verfahren', 'Nullstelle', 'Näherungsverfahren', 'Iteration', 'Tangente', 'Steigungsdreieck', 'Ableitung', 'Startwert', 'quadratische Konvergenz', 'Heron-Verfahren', 'Wurzel 2', 'Einzugsbereich'],
              ['Newton’s method', 'Newton-Raphson', 'zero', 'root', 'iteration', 'tangent', 'slope triangle', 'derivative', 'starting value', 'quadratic convergence', 'Heron’s method', 'basin of attraction'],
            ),
          },
          {
            id: 'ableitungsfunktion',
            status: 'ready',
            slug: L('ableitungsfunktion-grafisch', 'derivative-function-graphically'),
            title: L('Ableitungsfunktion grafisch', 'The derivative function graphically'),
            summary: L(
              'Eine Tangente gleitet am Graphen entlang und zeichnet dabei die Steigung als neuen Graphen: die Ableitungsfunktion.',
              'A tangent slides along the graph and draws its slope as a new graph: the derivative function.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-K4', 'M-K1', 'M-K5', 'M-K3'],
            keywords: L(
              ['Ableitung', 'Ableitungsfunktion', 'Tangente', 'Sekante', 'Differenzenquotient', 'Steigungsdreieck', 'grafisches Ableiten', 'Monotonie', 'Extremstelle', 'Wendestelle', 'Sattelpunkt', 'zweite Ableitung', 'Krümmung', 'Differenzierbarkeit', 'Faktorregel', 'Summenregel', 'Potenzregel', 'Produktregel', 'Kettenregel', 'Geschwindigkeit', 'Grenzkosten', 'Sinus', 'Kosinus'],
              ['derivative', 'derivative function', 'tangent', 'secant', 'difference quotient', 'slope triangle', 'graphical differentiation', 'monotonicity', 'extremum', 'inflection point', 'saddle point', 'second derivative', 'curvature', 'differentiability', 'constant multiple rule', 'sum rule', 'power rule', 'product rule', 'chain rule', 'velocity', 'marginal cost', 'sine', 'cosine'],
            ),
          },
          {
            id: 'kurvendiskussion',
            status: 'ready',
            slug: L('monotonie-extrem-wendestellen', 'monotonicity-extrema-inflection'),
            title: L('Monotonie, Extrem- und Wendestellen', 'Monotonicity, extrema and inflection points'),
            summary: L(
              'Untersuche einen Graphen Schritt für Schritt: Nullstellen, Hoch- und Tiefpunkte, Wendepunkte und wo er steigt oder fällt.',
              'Analyse a graph step by step: zeros, maximum and minimum points, inflection points and where it rises or falls.',
            ),
            grades: [11, 12],
            kmk: ['M-L3', 'M-K5', 'M-K1', 'M-K4'],
            keywords: L(
              ['Kurvendiskussion', 'Funktionsuntersuchung', 'Monotonie', 'Extremstelle', 'Hochpunkt', 'Tiefpunkt', 'Terrassenpunkt', 'Wendepunkt', 'notwendige Bedingung', 'hinreichende Bedingung', 'Vorzeichenwechsel', 'Vorzeichentabelle', 'Krümmung', 'Symmetrie', 'Tangente', 'f″-Kriterium'],
              ['curve sketching', 'monotonicity', 'extremum', 'maximum', 'minimum', 'terrace point', 'inflection point', 'necessary condition', 'sufficient condition', 'sign change', 'sign chart', 'concavity', 'symmetry', 'tangent', 'second-derivative test'],
            ),
          },
          {
            id: 'extremwertprobleme',
            status: 'ready',
            slug: L('extremwertprobleme', 'optimisation-problems'),
            title: L('Extremwertprobleme', 'Optimisation problems'),
            summary: L(
              'Welche Schachtel fasst am meisten, welche Dose braucht am wenigsten Blech? An fünf Alltagsproblemen findest du mit der Ableitung das Optimum.',
              'Which box holds the most, which can uses the least metal? Five everyday problems show how to find the best solution with the derivative.',
            ),
            grades: [11, 13],
            kmk: ['M-L3', 'M-K3', 'M-K2', 'M-K5'],
            keywords: L(
              ['Extremwertproblem', 'Optimierung', 'Zielfunktion', 'Nebenbedingung', 'Definitionsbereich', 'Ableitung', 'Schachtel', 'Dose', 'Oberfläche', 'Volumen', 'Randwerte', 'Kegel', 'Strahlensatz', 'Rettungsschwimmer', 'Brechungsgesetz', 'Newton-Verfahren'],
              ['optimisation', 'optimization', 'objective function', 'constraint', 'domain', 'derivative', 'box', 'can', 'surface area', 'volume', 'boundary values', 'cone', 'intercept theorem', 'lifeguard', 'law of refraction', "Newton's method"],
            ),
          },
        ]),
        topic('funktionsuntersuchung', L('Funktionenscharen und Stammfunktionen', 'Families of functions and antiderivatives'), [
          {
            id: 'funktionenscharen',
            status: 'ready',
            slug: L('funktionenscharen', 'families-of-functions'),
            title: L('Funktionenscharen', 'Families of functions'),
            summary: L(
              'Viele Graphen auf einmal: Ändere den Parameter k und sieh, wie die Hochpunkte auf einer Kurve wandern.',
              'Many graphs at once: change the parameter k and see how the maximum points move along a curve.',
            ),
            grades: [12, 13],
            kmk: ['M-L3', 'M-K5', 'M-K1', 'M-K2'],
            keywords: L(
              ['Funktionenschar', 'Kurvenschar', 'Parameter', 'Ortskurve', 'Extrempunkte', 'Wendepunkte', 'gemeinsamer Punkt', 'Fallunterscheidung', 'e-Funktion', 'ganzrationale Funktion'],
              ['family of functions', 'family of curves', 'parameter', 'locus', 'extrema', 'points of inflection', 'common point', 'case analysis', 'exponential function', 'polynomial'],
            ),
          },
          {
            id: 'stammfunktion-grafisch',
            status: 'ready',
            slug: L('stammfunktion-grafisch', 'antiderivative-graphically'),
            title: L('Vom Graphen zur Stammfunktion', 'From a graph to its antiderivative'),
            summary: L(
              'Die Höhe eines Graphen wird zur Steigung eines neuen Graphen, der Stammfunktion. Mit Alltagsbeispielen wie dem Kontostand.',
              'The height of one graph becomes the slope of a new graph: the antiderivative. With everyday examples such as a bank balance.',
            ),
            grades: [12, 13],
            kmk: ['M-L3', 'M-K4', 'M-K1', 'M-K5'],
            keywords: L(
              ['Stammfunktion', 'grafisches Aufleiten', 'grafisches Integrieren', 'Integrationskonstante', 'Kurvenschar', 'Richtungsfeld', 'Anfangswertproblem', 'Anfangswert', 'orientierte Fläche', 'Flächenbilanz', 'Monotonie', 'Extremstelle', 'Wendestelle', 'Terrassenpunkt', 'Vorzeichentabelle', 'Änderungsrate', 'Bestand'],
              ['antiderivative', 'graphical integration', 'constant of integration', 'family of curves', 'slope field', 'initial value problem', 'signed area', 'monotonicity', 'extremum', 'inflection point', 'saddle point', 'sign chart', 'rate of change', 'accumulation'],
            ),
          },
        ]),
        topic('integralrechnung', L('Integralrechnung', 'Integral calculus'), [
          {
            id: 'ober-untersummen',
            status: 'ready',
            slug: L('ober-und-untersummen', 'riemann-sums'),
            title: L('Integral als Flächenbilanz (Rechtecksummen)', 'The integral as signed area (rectangle sums)'),
            summary: L(
              'Fülle die Fläche unter einem Graphen mit Rechtecken. Je mehr Rechtecke, desto genauer wird der Wert des Integrals.',
              'Fill the area under a graph with rectangles. The more rectangles, the more precisely you get the value of the integral.',
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
              'Die Fläche unter einem Graphen wächst mit. Ihre Änderungsrate ist genau die Funktion selbst: Das ist der Hauptsatz.',
              'The area under a graph grows as you move along. Its rate of change is exactly the function itself: this is the fundamental theorem.',
            ),
            grades: [12, 13],
            uni: true,
            kmk: ['M-L3', 'M-L2', 'M-K1', 'M-K5'],
            keywords: L(
              ['Hauptsatz der Differential- und Integralrechnung', 'Integralfunktion', 'Stammfunktion', 'bestimmtes Integral', 'Flächenbilanz', 'untere Grenze', 'Differenzenquotient', 'F(b) − F(a)', 'Riemann-Summe', 'Wendestelle', 'Änderungsrate', 'Bestand', 'Grenzkosten'],
              ['fundamental theorem of calculus', 'integral function', 'antiderivative', 'definite integral', 'signed area', 'lower limit', 'difference quotient', 'Riemann sum', 'point of inflection', 'rate of change', 'accumulation', 'marginal cost'],
            ),
          },
          {
            id: 'aenderungsrate',
            status: 'ready',
            slug: L('integral-gesamtaenderung', 'integral-total-change'),
            title: L('Integral als Gesamtänderung: von der Geschwindigkeit zum Weg', 'The integral as total change: from velocity to distance'),
            summary: L(
              'Aus der Geschwindigkeit eines Autos wird der zurückgelegte Weg: Die Fläche unter der Kurve zeigt die Gesamtänderung.',
              'From the speed of a car you get the distance travelled: the area under the curve shows the total change.',
            ),
            grades: [12, 13],
            kmk: ['M-L3', 'M-L2', 'M-K3', 'M-K4'],
            keywords: L(
              ['Integral', 'Änderungsrate', 'Gesamtänderung', 'Rekonstruktion', 'Bestand', 'Geschwindigkeit', 'Weg', 'Zufluss', 'Rechtecksumme', 'Mittelsumme', 'zurückgelegter Weg', 'Modellieren'],
              ['integral', 'rate of change', 'total change', 'reconstruction', 'amount', 'velocity', 'distance', 'inflow', 'Riemann sum', 'midpoint sum', 'distance travelled', 'modelling'],
            ),
          },
          {
            id: 'rotationskoerper',
            status: 'ready',
            slug: L('rotationskoerper', 'solids-of-revolution'),
            title: L('Rotationskörper', 'Solids of revolution'),
            summary: L(
              'Die Fläche unter einem Graphen dreht sich um die x-Achse und wird zu einem Körper. Sein Volumen wird mit Scheiben berechnet.',
              'The area under a graph rotates about the x-axis and becomes a solid. Its volume is calculated with thin discs.',
            ),
            grades: [12, 13],
            kmk: ['M-L2', 'M-L3', 'M-L4', 'M-K4'],
            keywords: L(
              ['Rotationskörper', 'Rotationsvolumen', 'Integral', 'Scheibenmethode', 'Querschnitt', 'Kugel', 'Kegel', 'Paraboloid', 'Gabriels Horn', 'Volumen'],
              ['solid of revolution', 'volume of revolution', 'integral', 'disc method', 'cross-section', 'sphere', 'cone', 'paraboloid', 'Gabriel’s horn', 'volume'],
            ),
          },
        ]),
        topic('weiterfuehrend', L('Weiterführend (Hochschule)', 'Further topics (university)'), [
          {
            id: 'taylor-polynome',
            status: 'ready',
            slug: L('taylorpolynome', 'taylor-polynomials'),
            title: L('Taylorpolynome', 'Taylor polynomials'),
            summary: L(
              'Polynome schmiegen sich immer besser an eine Funktion an, Summand für Summand. So rechnet auch ein Taschenrechner.',
              'Polynomials hug a function more and more closely, term by term. This is also how a calculator works.',
            ),
            grades: [13, 14],
            uni: true,
            kmk: ['M-L3', 'M-L1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Taylorpolynom', 'Taylorreihe', 'Näherungspolynom', 'Entwicklungsstelle', 'Konvergenzradius', 'Restglied', 'Lagrange-Restglied', 'Fehlerabschätzung', 'Potenzreihe', 'geometrische Reihe', 'Ableitung', 'Fakultät', 'Kleinwinkelnäherung', 'Partialsumme', 'Schmiegparabel', 'Pendel', 'Konvergenzintervall'],
              ['Taylor polynomial', 'Taylor series', 'approximation', 'centre', 'radius of convergence', 'remainder', 'Lagrange remainder', 'error bound', 'power series', 'geometric series', 'derivative', 'factorial', 'small-angle approximation', 'partial sum', 'osculating parabola', 'pendulum', 'interval of convergence'],
            ),
          },
          {
            id: 'fourier-reihen',
            status: 'ready',
            slug: L('fourier-reihen', 'fourier-series'),
            title: L('Fourier-Reihen', 'Fourier series'),
            summary: L(
              'Rechteck, Sägezahn und andere Formen entstehen aus vielen Sinusschwingungen. Auf Wunsch kannst du sie auch anhören.',
              'Square, sawtooth and other waves are built from many sine waves. You can also listen to them.',
            ),
            grades: [13, 14],
            uni: true,
            kmk: ['M-L3', 'M-K4', 'M-K3', 'M-K5', 'M-K1'],
            keywords: L(
              ['Fourier-Reihe', 'Fourier-Koeffizienten', 'Oberschwingung', 'Harmonische', 'Rechtecksignal', 'Sägezahn', 'Pulsweitenmodulation', 'Gleichrichter', 'Amplitudenspektrum', 'Phasenspektrum', 'Zeigerdiagramm', 'Epizykel', 'Parseval', 'Gibbs-Phänomen', 'Fejér', 'Klangfarbe', 'periodische Funktion', 'Signalverarbeitung'],
              ['Fourier series', 'Fourier coefficients', 'harmonic', 'overtone', 'square wave', 'sawtooth', 'pulse-width modulation', 'rectifier', 'amplitude spectrum', 'phase spectrum', 'phasor', 'epicycles', 'Parseval', 'Gibbs phenomenon', 'Fejér', 'timbre', 'periodic function', 'signal processing'],
            ),
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
          {
            id: 'koordinaten-3d',
            status: 'ready',
            slug: L('raeumliches-koordinatensystem', '3d-coordinate-system'),
            title: L('Punkte und Körper im räumlichen Koordinatensystem', 'Points and solids in 3D coordinates'),
            summary: L(
              'Setze Punkte im räumlichen Koordinatensystem, drehe die Ansicht und berechne Abstände mit dem Satz des Pythagoras.',
              'Place points in 3D coordinates, rotate the view and calculate distances with Pythagoras\' theorem.',
            ),
            grades: [10, 12],
            kmk: ['M-L4', 'M-K4', 'M-K5'],
            keywords: L(
              ['räumliches Koordinatensystem', 'Koordinaten', 'Punkt im Raum', 'x₁x₂-Ebene', 'Koordinatenebene', 'Oktant', 'Projektion', 'Quader', 'Eckpunkte', 'Raumdiagonale', 'Abstand vom Ursprung', 'Schrägbild'],
              ['3D coordinate system', 'coordinates', 'point in space', 'coordinate plane', 'octant', 'projection', 'cuboid', 'corners', 'space diagonal', 'distance from the origin'],
            ),
          },
          {
            id: 'vektoren-3d',
            status: 'ready',
            slug: L('vektoren-addieren-vervielfachen', 'adding-and-scaling-vectors'),
            title: L('Vektoren addieren und vervielfachen (3D)', 'Adding and scaling vectors (3D)'),
            summary: L(
              'Ziehe Vektorpfeile im Raum, addiere sie und vervielfache sie. Die Rechnung steht daneben in Spaltenschreibweise.',
              'Drag vector arrows in space, add them and multiply them by numbers. The calculation is shown alongside in column form.',
            ),
            grades: [10, 12],
            kmk: ['M-L4', 'M-K4', 'M-K5'],
            keywords: L(
              ['Vektor', 'Vektoraddition', 'Vektorsubtraktion', 'Gegenvektor', 'Vielfaches', 'S-Multiplikation', 'Linearkombination', 'Verbindungsvektor', 'Ortsvektor', 'Mittelpunkt', 'Betrag', 'Parallelogramm', 'kollinear'],
              ['vector', 'vector addition', 'vector subtraction', 'opposite vector', 'scalar multiple', 'linear combination', 'connecting vector', 'position vector', 'midpoint', 'magnitude', 'parallelogram', 'collinear'],
            ),
          },
          {
            id: 'skalar-vektorprodukt',
            status: 'ready',
            slug: L('skalarprodukt-vektorprodukt', 'dot-and-cross-product'),
            title: L('Skalarprodukt und Vektorprodukt', 'Dot product and cross product'),
            summary: L(
              'Das Skalarprodukt verrät den Winkel zwischen zwei Vektoren, das Vektorprodukt einen senkrechten Vektor und eine Fläche.',
              'The dot product tells you the angle between two vectors; the cross product gives a perpendicular vector and an area.',
            ),
            grades: [10, 12],
            kmk: ['M-L4', 'M-L2', 'M-K4', 'M-K5'],
            keywords: L(
              ['Skalarprodukt', 'Vektorprodukt', 'Kreuzprodukt', 'Spatprodukt', 'Winkel zwischen Vektoren', 'orthogonal', 'senkrecht', 'Projektion', 'Normalenvektor', 'Parallelogrammfläche', 'Dreiecksfläche', 'Spat', 'Volumen', 'Rechte-Hand-Regel'],
              ['dot product', 'scalar product', 'cross product', 'vector product', 'triple product', 'angle between vectors', 'orthogonal', 'perpendicular', 'projection', 'normal vector', 'area of a parallelogram', 'triangle area', 'parallelepiped', 'volume', 'right-hand rule'],
            ),
          },
        ]),
        topic('geraden-ebenen', L('Geraden, Ebenen und Kugeln', 'Lines, planes and spheres'), [
          {
            id: 'geraden-ebenen',
            status: 'ready',
            slug: L('geraden-ebenen-raum', 'lines-and-planes-in-space'),
            title: L('Geraden und Ebenen im Raum', 'Lines and planes in space'),
            summary: L(
              'Ein Punkt läuft auf einer Geraden durch den Raum, eine Ebene wird aufgespannt. Mit den verschiedenen Formen der Gleichungen, drehbar in 3D.',
              'A point moves along a line in space and a plane is spanned. With the different forms of the equations, rotatable in 3D.',
            ),
            grades: [11, 13],
            kmk: ['M-L4', 'M-K4', 'M-K5'],
            keywords: L(
              ['Gerade', 'Geradengleichung', 'Parameterform', 'Stützvektor', 'Richtungsvektor', 'Spurpunkt', 'Punktprobe', 'Ebene', 'Spannvektor', 'Normalenvektor', 'Normalenform', 'Koordinatenform', 'Spurgerade', 'Spurdreieck', 'Achsenabschnitt', 'Vektorprodukt'],
              ['line', 'equation of a line', 'parametric form', 'position vector', 'direction vector', 'trace point', 'point test', 'plane', 'spanning vector', 'normal vector', 'normal form', 'coordinate form', 'trace line', 'trace triangle', 'intercept', 'cross product'],
            ),
          },
          {
            id: 'lage-abstaende',
            status: 'ready',
            slug: L('lagebeziehungen-abstaende', 'relative-positions-distances'),
            title: L('Lagebeziehungen und Abstände im Raum', 'Relative positions and distances in space'),
            summary: L(
              'Wie liegen zwei Geraden oder Ebenen zueinander? Schneiden sie sich, sind sie parallel? Dazu Schnittpunkte, Winkel und Abstände in 3D.',
              'How do two lines or planes lie relative to each other? Do they intersect, are they parallel? With intersections, angles and distances in 3D.',
            ),
            grades: [11, 13],
            kmk: ['M-L4', 'M-K1', 'M-K4', 'M-K5'],
            keywords: L(
              ['Lagebeziehung', 'windschief', 'parallel', 'identisch', 'Schnittpunkt', 'Durchstoßpunkt', 'Schnittgerade', 'Schnittwinkel', 'Abstand', 'Hesse-Normalform', 'Lotfußpunkt', 'Lot', 'Spiegelpunkt', 'Normalenvektor', 'Koordinatenform'],
              ['relative position', 'skew lines', 'parallel', 'identical', 'point of intersection', 'line of intersection', 'angle of intersection', 'distance', 'Hesse normal form', 'foot of the perpendicular', 'perpendicular', 'mirror point', 'normal vector', 'coordinate form'],
            ),
          },
          {
            id: 'kugeln',
            status: 'ready',
            slug: L('kugeln-geraden-ebenen', 'spheres-lines-planes'),
            title: L('Kugeln, Geraden und Ebenen', 'Spheres, lines and planes'),
            summary: L(
              'Eine Kugel im Raum wird von Ebenen und Geraden geschnitten oder berührt. Mit Kugelgleichung und Tangentialebene.',
              'A sphere in space is cut or touched by planes and lines. With the equation of a sphere and the tangent plane.',
            ),
            grades: [13, 13],
            kmk: ['M-L4', 'M-K4', 'M-K5'],
            keywords: L(
              ['Kugel', 'Kugelgleichung', 'Mittelpunkt', 'Radius', 'Punktprobe', 'Schnittkreis', 'Kugel und Ebene', 'Kugel und Gerade', 'Sekante', 'Tangente', 'Passante', 'Diskriminante', 'Tangentialebene', 'Berührpunkt', 'Abstand Punkt Ebene', 'Großkreis'],
              ['sphere', 'equation of a sphere', 'centre', 'radius', 'point test', 'circle of intersection', 'sphere and plane', 'sphere and line', 'secant', 'tangent', 'passing line', 'discriminant', 'tangent plane', 'point of contact', 'distance point plane', 'great circle'],
            ),
          },
        ]),
        topic('matrizen', L('Matrizen (Hochschule)', 'Matrices (university)'), [
          {
            id: 'matrix-abbildungen',
            status: 'ready',
            slug: L('matrizen-lineare-abbildungen', 'matrices-linear-maps'),
            title: L('Matrizen als lineare Abbildungen', 'Matrices as linear maps'),
            summary: L(
              'Eine Matrix verformt die Ebene: Ziehe die Pfeile und sieh, wie sich ein Gitter dreht, streckt oder spiegelt.',
              'A matrix transforms the plane: drag the arrows and watch a grid rotate, stretch or reflect.',
            ),
            grades: [12, 14],
            uni: true,
            kmk: ['M-L4', 'M-L3', 'M-K4', 'M-K5'],
            keywords: L(
              ['Matrix', 'lineare Abbildung', 'Determinante', 'Eigenwert', 'Eigenvektor', 'Drehung', 'Spiegelung', 'Scherung', 'Projektion', 'Einheitsvektor', 'lineare Algebra', 'Matrixprodukt', 'Verkettung', 'inverse Matrix', 'charakteristisches Polynom', 'Übergangsmatrix', 'stationäre Verteilung', 'Fixvektor'],
              ['matrix', 'linear map', 'determinant', 'eigenvalue', 'eigenvector', 'rotation', 'reflection', 'shear', 'projection', 'unit vector', 'linear algebra', 'matrix product', 'composition', 'inverse matrix', 'characteristic polynomial', 'transition matrix', 'stationary distribution', 'fixed vector'],
            ),
          },
        ]),
      ],
    }),
  ],
};
