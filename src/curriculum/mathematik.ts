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
          planned('brueche-vergleichen', L('Brüche erweitern, kürzen und vergleichen', 'Equivalent fractions and comparing'), [6, 6]),
          planned('dezimalbrueche', L('Endliche und periodische Dezimalbrüche', 'Terminating and repeating decimals'), [6, 6]),
          planned('brueche-rechnen', L('Brüche multiplizieren und dividieren am Rechteckmodell', 'Multiplying and dividing fractions with area models'), [6, 6]),
        ]),
        topic('prozente', L('Prozentrechnung', 'Percentages'), [
          planned('prozentstreifen', L('Prozentstreifen', 'Percentage bar'), [6, 7]),
        ]),
        topic('reelle-zahlen', L('Wurzeln und reelle Zahlen', 'Roots and real numbers'), [
          planned('quadratwurzel', L('Quadratwurzeln und das Heron-Verfahren', 'Square roots and Heron’s method'), [9, 9]),
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
          planned('gleichungen-grafisch', L('Gleichungen grafisch lösen: Schnittpunkte von Graphen', 'Solving equations graphically: intersections of graphs'), [8, 9]),
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
          planned('vierecke', L('Das Haus der Vierecke', 'The family of quadrilaterals'), [5, 7], { kmk: ['M-L4', 'M-K1'] }),
        ]),
        topic('symmetrie', L('Symmetrie und Konstruktionen', 'Symmetry and constructions'), [
          planned('spiegelung', L('Achsen- und Punktspiegelung', 'Reflections in a line and in a point'), [7, 7]),
          planned('mittelsenkrechte', L('Mittelsenkrechte und Winkelhalbierende', 'Perpendicular bisector and angle bisector'), [7, 7]),
        ]),
        topic('winkel', L('Winkel an Figuren', 'Angles in figures'), [
          planned('winkel-geradenkreuzung', L('Winkel an Geradenkreuzungen', 'Angles at intersecting lines'), [7, 7]),
          planned('winkelsumme', L('Innenwinkelsumme in Dreieck und Vieleck', 'Angle sum in triangles and polygons'), [7, 7], { kmk: ['M-L4', 'M-K1'] }),
        ]),
        topic('dreiecke', L('Dreiecke', 'Triangles'), [
          planned('dreieckskonstruktion', L('Kongruenzsätze und Dreieckskonstruktionen', 'Congruence and constructing triangles'), [7, 7]),
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
          planned('besondere-linien', L('Umkreis, Inkreis und besondere Linien im Dreieck', 'Circumcircle, incircle and special lines in a triangle'), [7, 8]),
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
          planned('strahlensaetze', L('Strahlensätze', 'Intercept theorems'), [9, 9]),
          planned('vergroessern', L('Ähnliche Figuren: Wie wachsen Fläche und Volumen?', 'Similar figures: how do area and volume grow?'), [9, 9]),
        ]),
        topic('trigonometrie-dreieck', L('Trigonometrie im Dreieck', 'Trigonometry in triangles'), [
          planned('sin-cos-tan-dreieck', L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck', 'Sine, cosine and tangent in right triangles'), [9, 10]),
          planned('sinussatz-kosinussatz', L('Sinussatz und Kosinussatz', 'Law of sines and law of cosines'), [9, 10]),
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
          planned('pyramide-kegel-kugel', L('Pyramide, Kegel und Kugel', 'Pyramid, cone and sphere'), [10, 10]),
          planned('cavalieri', L('Prinzip von Cavalieri', 'Cavalieri’s principle'), [10, 10]),
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
          planned('proportional', L('Direkte und indirekte Proportionalität', 'Direct and inverse proportion'), [6, 8], { kmk: ['M-L3', 'M-K3'] }),
          planned('funktion-zuordnung', L('Funktion oder nicht? Zuordnungen und ihre Graphen', 'Function or not? Relations and their graphs'), [8, 8]),
          planned('funktionsplotter', L('Funktionsplotter mit eigenen Termen', 'Function plotter with custom terms'), [8, 13], { uni: true }),
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
          planned('hyperbel', L('Hyperbeln und ihre Asymptoten', 'Hyperbolas and their asymptotes'), [8, 8]),
          planned('polstellen-asymptoten', L('Polstellen und Asymptoten gebrochen-rationaler Funktionen', 'Poles and asymptotes of rational functions'), [11, 12]),
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
          planned('parabel-drei-punkte', L('Parabel durch drei Punkte', 'Parabola through three points'), [9, 9]),
          planned('extremwert-parabel', L('Extremwertaufgaben mit Parabeln', 'Optimisation problems with parabolas'), [9, 9], { kmk: ['M-L3', 'M-K3'] }),
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
          planned('ganzrationale-funktionen', L('Ganzrationale Funktionen: Nullstellen, Vielfachheit und Randverhalten', 'Polynomial functions: zeros, multiplicity and end behaviour'), [10, 11]),
        ]),
        topic('eigenschaften', L('Eigenschaften von Funktionen', 'Properties of functions'), [
          planned('transformationen', L('Graphen verschieben, strecken und spiegeln', 'Shifting, stretching and reflecting graphs'), [11, 11], { kmk: ['M-L3', 'M-K4'] }),
          planned('grenzverhalten', L('Grenzverhalten und Asymptoten', 'Limits and asymptotes'), [11, 11]),
          planned('umkehrfunktion', L('Umkehrfunktionen: Spiegeln an y = x', 'Inverse functions: reflecting in y = x'), [12, 12]),
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
          planned('zaehlprinzip', L('Zählprinzip und Baumdiagramm', 'Counting principle and tree diagrams'), [5, 8]),
        ]),
        topic('daten', L('Daten auswerten', 'Analysing data'), [
          planned('diagramme', L('Diagramme lesen und kritisch prüfen', 'Reading charts critically'), [6, 6], { kmk: ['M-L5', 'M-K6'] }),
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
          planned('normalverteilung', L('Normalverteilung', 'Normal distribution'), [13, 13], { uni: true }),
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
          planned('newton-verfahren', L('Newton-Verfahren', 'Newton’s method'), [11, 11]),
          planned('ableitungsfunktion', L('Ableitungsfunktion grafisch', 'The derivative function graphically'), [11, 12]),
          planned('kurvendiskussion', L('Monotonie, Extrem- und Wendestellen', 'Monotonicity, extrema and inflection points'), [11, 12]),
        ]),
        topic('funktionsuntersuchung', L('Funktionenscharen und Stammfunktionen', 'Families of functions and antiderivatives'), [
          planned('funktionenscharen', L('Funktionenscharen', 'Families of functions'), [12, 13]),
          planned('stammfunktion-grafisch', L('Vom Graphen zur Stammfunktion', 'From a graph to its antiderivative'), [12, 13]),
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
          planned('hauptsatz', L('Integralfunktion und Hauptsatz', 'Integral function and fundamental theorem'), [12, 13], { uni: true }),
          planned('aenderungsrate', L('Integral als Gesamtänderung: von der Geschwindigkeit zum Weg', 'The integral as total change: from velocity to distance'), [13, 13]),
          planned('rotationskoerper', L('Rotationskörper', 'Solids of revolution'), [13, 13]),
          planned('extremwertprobleme', L('Extremwertprobleme', 'Optimisation problems'), [13, 13], { kmk: ['M-L3', 'M-K3'] }),
        ]),
        topic('weiterfuehrend', L('Weiterführend (Hochschule)', 'Further topics (university)'), [
          planned('taylor-polynome', L('Taylorpolynome', 'Taylor polynomials'), [13, 14], { uni: true }),
          planned('fourier-reihen', L('Fourier-Reihen', 'Fourier series'), [14, 14], { uni: true }),
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
          planned('matrix-abbildungen', L('Matrizen als lineare Abbildungen', 'Matrices as linear maps'), [12, 14], { uni: true }),
        ]),
      ],
    }),
  ],
};
