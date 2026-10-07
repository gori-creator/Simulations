import { L } from '../helpers';
import type { StateCurriculum } from './types';

const src = (grade: number, suffix = '') =>
  `https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/${grade}/mathematik${suffix}`;

const EA = L(
  'Die Angaben beziehen sich auf das erhöhte Anforderungsniveau.',
  'This refers to the higher level of requirements (“erhöhtes Anforderungsniveau”).',
);

/**
 * Mathematik am bayerischen Gymnasium (G9) nach dem LehrplanPLUS,
 * Jahrgangsstufen 5–13.
 *
 * Überschriften und Nummern der Lernbereiche entsprechen dem Lehrplan; die
 * Kurzbeschreibungen sind eigene Zusammenfassungen. Verbindlich ist der
 * Originaltext unter lehrplanplus.bayern.de.
 */
export const bayernGymnasiumMathematik: StateCurriculum = {
  id: 'bayern-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('bayern-gymnasium', 'bavaria-gymnasium'),
  state: L('Bayern', 'Bavaria'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'LehrplanPLUS',
  grades: [
    {
      grade: 5,
      sourceUrl: src(5),
      units: [
        {
          code: '1',
          title: L('Natürliche und ganze Zahlen – Addition und Subtraktion', 'Natural numbers and integers – addition and subtraction'),
          parts: [
            {
              code: '1.1',
              title: L('Natürliche Zahlen und ihre Erweiterung zu den ganzen Zahlen', 'Natural numbers and their extension to the integers'),
              summary: L(
                'Große Zahlen, das Zehnersystem als Stellenwertsystem, Zahlenstrahl und Runden; negative Zahlen, Anordnung und Betrag an der Zahlengeraden.',
                'Large numbers, base ten as a place-value system, number lines and rounding; negative numbers, ordering and absolute value.',
              ),
              simulations: ['stellenwerte', 'zahlengerade'],
            },
            {
              code: '1.2',
              title: L('Addition und Subtraktion ganzer Zahlen', 'Adding and subtracting integers'),
              summary: L(
                'Schriftlich und im Kopf addieren und subtrahieren, Strategien mit Guthaben und Schulden, einfache Gleichungen, Rechengesetze und die Struktur von Termen.',
                'Written and mental addition and subtraction, strategies with credit and debt, simple equations, laws of arithmetic and the structure of terms.',
              ),
              simulations: ['zahlengerade', 'termbaum'],
            },
          ],
        },
        {
          code: '2',
          title: L('Geometrische Figuren und Lagebeziehungen', 'Geometric figures and relative positions'),
          summary: L(
            'Punkte, Strecken, Geraden und Kreise im Koordinatensystem; Abstand, parallel, senkrecht und Tangente; Winkel bis 360° messen; besondere Vierecke.',
            'Points, segments, lines and circles in the coordinate plane; distance, parallel, perpendicular and tangent; measuring angles up to 360°; special quadrilaterals.',
          ),
          simulations: ['koordinaten-lage', 'winkel-messen', 'vierecke'],
        },
        {
          code: '3',
          title: L('Natürliche und ganze Zahlen – Multiplikation und Division', 'Natural numbers and integers – multiplication and division'),
          parts: [
            {
              code: '3.1',
              title: L('Multiplikation und Division ganzer Zahlen', 'Multiplying and dividing integers'),
              summary: L(
                'Schriftliche Verfahren, Primfaktorzerlegung und Teilbarkeitsregeln, Zählprinzip mit Baumdiagrammen, Vorzeichenregeln sowie Potenzen und Zehnerpotenzen.',
                'Written methods, prime factorisation and divisibility rules, the counting principle with tree diagrams, sign rules, powers and powers of ten.',
              ),
              simulations: ['primfaktoren', 'zaehlprinzip', 'zehnerpotenzen'],
            },
            {
              code: '3.2',
              title: L('Verbindung der Grundrechenarten bei ganzen Zahlen', 'Combining the four operations with integers'),
              summary: L(
                'Termstrukturen erkennen, „Punkt vor Strich“, Rechenvorteile durch Rechengesetze, Vorwärts- und Rückwärtsarbeiten.',
                'Recognising the structure of terms, order of operations, using the laws of arithmetic, working forwards and backwards.',
              ),
              simulations: ['termbaum'],
            },
          ],
        },
        {
          code: '4',
          title: L('Größen und ihre Einheiten', 'Quantities and their units'),
          parts: [
            {
              code: '4.1',
              title: L('Geld, Länge, Masse und Zeit', 'Money, length, mass and time'),
              summary: L(
                'Einheiten umrechnen, mit Größen rechnen, sinnvoll schätzen, Schlussrechnung (Dreisatz) und Maßstab.',
                'Converting units, calculating with quantities, estimating, the rule of three and scale.',
              ),
              simulations: ['einheiten', 'massstab'],
            },
            {
              code: '4.2',
              title: L('Flächeninhalt', 'Area'),
              summary: L(
                'Flächeninhalt des Rechtecks, Flächeneinheiten, Umfang und Flächeninhalt unterscheiden, Zerlegen und Ergänzen, Oberflächen von Quadern.',
                'Area of rectangles, units of area, perimeter versus area, decomposing and completing shapes, surface area of cuboids.',
              ),
              simulations: ['umfang-flaeche', 'koerpernetze'],
            },
          ],
        },
      ],
    },
    {
      grade: 6,
      sourceUrl: src(6),
      units: [
        {
          code: '1',
          title: L('Rationale Zahlen', 'Rational numbers'),
          parts: [
            {
              code: '1.1',
              title: L('Bruchteile und Bruchzahlen', 'Fractions of a whole and fractions as numbers'),
              summary: L(
                'Anteile in Kreis- und Rechteckdiagrammen, Erweitern, Kürzen und Vergleichen, Prozent als andere Schreibweise, Brüche an der Zahlengeraden.',
                'Fractions in pie and rectangle diagrams, equivalent fractions and comparing, percent as another notation, fractions on the number line.',
              ),
              simulations: ['bruchteile', 'brueche-vergleichen'],
            },
            {
              code: '1.2',
              title: L('Dezimalbrüche', 'Decimals'),
              summary: L(
                'Die Stellenwerttafel um Zehntel, Hundertstel … erweitern; Brüche als endliche oder periodische Dezimalbrüche und Umwandeln in beide Richtungen.',
                'Extending place value to tenths, hundredths …; fractions as terminating or repeating decimals and converting in both directions.',
              ),
              simulations: ['dezimalbrueche'],
            },
            {
              code: '1.3',
              title: L('Addition und Subtraktion rationaler Zahlen', 'Adding and subtracting rational numbers'),
              summary: L(
                'Brüche, gemischte Zahlen und Dezimalbrüche addieren und subtrahieren, günstige Darstellungen wählen, Überschlag.',
                'Adding and subtracting fractions, mixed numbers and decimals, choosing convenient representations, estimating.',
              ),
              simulations: ['brueche-vergleichen'],
            },
            {
              code: '1.4',
              title: L('Multiplikation und Division rationaler Zahlen', 'Multiplying and dividing rational numbers'),
              summary: L(
                'Produkte und Quotienten mit tragfähigen Vorstellungen (Anteil von, Verteilen, Aufteilen); Potenzen, auch mit negativen Exponenten.',
                'Products and quotients based on solid mental models (part of, sharing, grouping); powers, including negative exponents.',
              ),
              simulations: ['brueche-rechnen', 'zehnerpotenzen'],
            },
            {
              code: '1.5',
              title: L('Verbindung der Grundrechenarten bei rationalen Zahlen', 'Combining the four operations with rational numbers'),
              summary: L(
                'Termstrukturen mit rationalen Zahlen, Rechenvorteile und Sachaufgaben mit Anteilen von Anteilen.',
                'Term structures with rational numbers, convenient calculation and word problems with fractions of fractions.',
              ),
              simulations: ['termbaum'],
            },
          ],
        },
        {
          code: '2',
          title: L('Flächeninhalt und Volumen', 'Area and volume'),
          parts: [
            {
              code: '2.1',
              title: L('Flächeninhalt', 'Area'),
              summary: L(
                'Flächenformeln für Parallelogramm, Dreieck und Trapez durch Zerlegen und Ergänzen herleiten und anwenden; Oberflächen einfacher Körper.',
                'Deriving and using area formulas for parallelograms, triangles and trapeziums by decomposing; surface area of simple solids.',
              ),
              simulations: ['flaechen-zerlegen', 'koerpernetze'],
            },
            {
              code: '2.2',
              title: L('Volumen', 'Volume'),
              summary: L(
                'Volumen des Quaders über Einheitswürfel, Volumeneinheiten einschließlich Liter, Zerlegen und Ergänzen von Körpern.',
                'Volume of cuboids via unit cubes, units of volume including litres, decomposing and completing solids.',
              ),
              simulations: ['quader-volumen'],
            },
          ],
        },
        {
          code: '3',
          title: L('Prozentrechnung, Daten und Diagramme', 'Percentages, data and charts'),
          summary: L(
            'Einfache Prozentaufgaben (Rabatt, Zins), Prozent und Prozentpunkte, relative Häufigkeiten, Kreis- und Säulendiagramme kritisch lesen, arithmetisches Mittel.',
            'Simple percentage problems (discount, interest), percent versus percentage points, relative frequencies, reading pie and bar charts critically, the mean.',
          ),
          simulations: ['prozentstreifen', 'diagramme'],
        },
      ],
    },
    {
      grade: 7,
      sourceUrl: src(7),
      units: [
        {
          code: '1',
          title: L('Terme mit Variablen', 'Terms with variables'),
          parts: [
            {
              code: '1.1',
              title: L('Aufstellen und Interpretieren von Termen', 'Setting up and interpreting terms'),
              summary: L(
                'Zusammenhänge mit Variablen beschreiben, Termwerte mit Wertetabellen und Tabellenkalkulation berechnen, Termstrukturen benennen.',
                'Describing relationships with variables, evaluating terms with tables and spreadsheets, naming term structures.',
              ),
              simulations: ['termbaum'],
            },
            {
              code: '1.2',
              title: L('Umformen von Termen', 'Manipulating terms'),
              summary: L(
                'Potenzregeln, Zusammenfassen, Ausmultiplizieren, Ausklammern und die binomischen Formeln.',
                'Laws of exponents, collecting like terms, expanding, factorising and the binomial formulas.',
              ),
              simulations: ['binomische-formeln'],
            },
          ],
        },
        {
          code: '2',
          title: L('Geometrische Figuren: Symmetrie und Winkel', 'Geometric figures: symmetry and angles'),
          parts: [
            {
              code: '2.1',
              title: L('Achsen- und punktsymmetrische Figuren', 'Figures with line and point symmetry'),
              summary: L(
                'Symmetrische Figuren mit Zirkel und Lineal konstruieren, Mittelsenkrechte, Lot und Winkelhalbierende; Vierecke nach ihren Symmetrien ordnen.',
                'Constructing symmetric figures with compass and ruler, perpendicular bisectors and angle bisectors; ordering quadrilaterals by their symmetries.',
              ),
              simulations: ['spiegelung', 'mittelsenkrechte', 'vierecke'],
            },
            {
              code: '2.2',
              title: L('Winkelbetrachtungen an Figuren', 'Angles in figures'),
              summary: L(
                'Scheitel-, Neben-, Stufen- und Wechselwinkel; Beweis der Innenwinkelsumme im Dreieck und Übertragung auf Vielecke.',
                'Vertical, adjacent, corresponding and alternate angles; proving the angle sum of a triangle and extending it to polygons.',
              ),
              simulations: ['winkel-geradenkreuzung', 'winkelsumme'],
            },
          ],
        },
        {
          code: '3',
          title: L('Lineare Gleichungen und Vertiefung der Prozentrechnung', 'Linear equations and further percentages'),
          summary: L(
            'Gleichungen aufstellen und durch Äquivalenzumformungen lösen; anspruchsvollere Prozentaufgaben.',
            'Setting up equations and solving them by equivalent transformations; more demanding percentage problems.',
          ),
          simulations: ['waagemodell', 'prozentstreifen'],
        },
        {
          code: '4',
          title: L('Kenngrößen von Daten', 'Summary statistics'),
          summary: L(
            'Median und arithmetisches Mittel vergleichen, Spannweite und Quartile, Boxplots erstellen und deuten.',
            'Comparing median and mean, range and quartiles, drawing and interpreting box plots.',
          ),
          simulations: ['boxplot'],
        },
        {
          code: '5',
          title: L('Kongruenz, besondere Dreiecke und Dreieckskonstruktionen', 'Congruence, special triangles and constructions'),
          summary: L(
            'Kongruenzsätze, gleichschenklige und gleichseitige Dreiecke, Satz und Kehrsatz, Umkreis und Inkreis, Satz des Thales, Tangentenkonstruktion.',
            'Congruence criteria, isosceles and equilateral triangles, theorems and their converses, circumcircle and incircle, Thales’s theorem, constructing tangents.',
          ),
          simulations: ['dreieckskonstruktion', 'besondere-linien', 'thales'],
        },
      ],
    },
    {
      grade: 8,
      sourceUrl: src(8),
      units: [
        {
          code: '1',
          title: L('Funktion und Term', 'Function and term'),
          summary: L(
            'Funktionen als eindeutige Zuordnungen, Fachbegriffe wie Definitions- und Wertemenge, Graphen mit dem Funktionenplotter, Schnittpunkte mit den Achsen.',
            'Functions as unique assignments, domain and range, graphs with a function plotter, intercepts with the axes.',
          ),
          simulations: ['funktion-zuordnung', 'funktionsplotter'],
        },
        {
          code: '2',
          title: L('Lineare Funktionen', 'Linear functions'),
          summary: L(
            'Geraden y = m · x + t, Bedeutung von m und t, Geradengleichungen aufstellen, Nullstellen und Schnittpunkte, lineare Ungleichungen, direkte Proportionalität.',
            'Lines y = m · x + t, the meaning of m and t, finding equations of lines, zeros and intersections, linear inequalities, direct proportion.',
          ),
          simulations: ['lineare-funktion', 'proportional'],
        },
        {
          code: '3',
          title: L('Elementare gebrochen-rationale Funktionen', 'Elementary rational functions'),
          summary: L(
            'Hyperbeln: Definitionsmenge, Asymptoten und Einfluss der Parameter; indirekte Proportionalität.',
            'Hyperbolas: domain, asymptotes and the effect of the parameters; inverse proportion.',
          ),
          simulations: ['hyperbel', 'proportional'],
        },
        {
          code: '4',
          title: L('Bruchterme und Bruchgleichungen', 'Algebraic fractions and fractional equations'),
          summary: L(
            'Mit Bruchtermen rechnen, Potenzgesetze für ganzzahlige Exponenten, Bruchgleichungen lösen und als Schnittproblem von Graphen deuten, Formeln umstellen.',
            'Calculating with algebraic fractions, laws of exponents for integer exponents, solving fractional equations and interpreting them as intersections of graphs, rearranging formulas.',
          ),
          simulations: ['gleichungen-grafisch'],
        },
        {
          code: '5',
          title: L('Laplace-Experimente', 'Laplace experiments'),
          summary: L(
            'Zufallsexperimente beschreiben, relative Häufigkeiten und empirisches Gesetz der großen Zahlen, Laplace-Wahrscheinlichkeiten mit Zählprinzip und Baumdiagramm.',
            'Describing random experiments, relative frequencies and the empirical law of large numbers, Laplace probabilities with counting and tree diagrams.',
          ),
          simulations: ['gesetz-grosse-zahlen', 'zaehlprinzip', 'baumdiagramm'],
        },
        {
          code: '6',
          title: L('Lineare Gleichungssysteme', 'Systems of linear equations'),
          summary: L(
            'Systeme mit zwei Unbekannten aufstellen, grafisch und rechnerisch lösen, Lösbarkeit und Lösungsvielfalt.',
            'Setting up systems with two unknowns, solving them graphically and algebraically, number of solutions.',
          ),
          simulations: ['lgs-grafisch', 'lineare-funktion'],
        },
        {
          code: '7',
          title: L('Kreis und Zylinder', 'Circle and cylinder'),
          summary: L(
            'Kreisumfang, Kreisfläche und Näherungen für π; Prismen und Zylinder: Schrägbild, Netz, Oberfläche und Volumen.',
            'Circumference, area of a circle and approximations of π; prisms and cylinders: oblique drawings, nets, surface area and volume.',
          ),
          simulations: ['kreiszahl-pi', 'prisma-zylinder', 'koerpernetze'],
        },
      ],
    },
    {
      grade: 9,
      sourceUrl: src(9),
      units: [
        {
          code: '1',
          title: L('Quadratwurzeln', 'Square roots'),
          summary: L(
            'Definition der Quadratwurzel, Irrationalität und reelle Zahlen, Heron-Verfahren, Rechnen mit Wurzeltermen.',
            'Definition of square roots, irrationality and real numbers, Heron’s method, calculating with roots.',
          ),
          simulations: ['quadratwurzel'],
        },
        {
          code: '2',
          title: L('Quadratische Funktionen', 'Quadratic functions'),
          parts: [
            {
              code: '2.1',
              title: L('Quadratische Funktionen und quadratische Gleichungen', 'Quadratic functions and quadratic equations'),
              summary: L(
                'Einfluss von a, d und e auf die Parabel, Scheitel bestimmen, Eigenschaften ablesen, Lösungsformel; allgemeine Form, Scheitelpunktform und Nullstellenform.',
                'Effect of a, d and e on the parabola, finding the vertex, reading off properties, the quadratic formula; standard, vertex and factored form.',
              ),
              simulations: ['quadratische-funktion', 'gleichungen-grafisch'],
            },
            {
              code: '2.2',
              title: L('Quadratische Funktionen in Anwendungen', 'Quadratic functions in applications'),
              summary: L(
                'Gleichungssysteme mit drei Unbekannten (Parabel durch drei Punkte), Schnitt von Gerade und Hyperbel, Extremwertprobleme.',
                'Systems with three unknowns (parabola through three points), intersecting lines and hyperbolas, optimisation problems.',
              ),
              simulations: ['parabel-drei-punkte', 'extremwert-parabel'],
            },
          ],
        },
        {
          code: '3',
          title: L('Wahrscheinlichkeit verknüpfter Ereignisse', 'Probability of combined events'),
          summary: L(
            'Schnitt und Vereinigung von Ereignissen, Mengendiagramme und Vierfeldertafeln, Additionssatz.',
            'Intersection and union of events, Venn diagrams and two-way tables, the addition rule.',
          ),
          simulations: ['vierfeldertafel'],
        },
        {
          code: '4',
          title: L('Ähnlichkeit und Strahlensatz', 'Similarity and the intercept theorem'),
          summary: L(
            'Ähnliche Figuren, Strahlensätze und wie sich Flächeninhalt und Volumen beim Vergrößern ändern.',
            'Similar figures, the intercept theorems and how area and volume change when scaling.',
          ),
          simulations: ['strahlensaetze', 'vergroessern'],
        },
        {
          code: '5',
          title: L('Potenzfunktionen mit natürlichen Exponenten und Erweiterung des Potenzbegriffs', 'Power functions with natural exponents and extending powers'),
          summary: L(
            'Graphen von y = a · xⁿ und ihre Symmetrie, allgemeine Wurzel, Potenzen mit rationalen Exponenten.',
            'Graphs of y = a · xⁿ and their symmetry, nth roots, powers with rational exponents.',
          ),
          simulations: ['potenzfunktionen'],
        },
        {
          code: '6',
          title: L('Satz des Pythagoras', 'Pythagorean theorem'),
          summary: L(
            'Beweis, Umkehrung und vielfältige Anwendungen am rechtwinkligen Dreieck.',
            'Proof, converse and many applications in right triangles.',
          ),
          simulations: ['pythagoras'],
        },
        {
          code: '7',
          title: L('Trigonometrie', 'Trigonometry'),
          parts: [
            {
              code: '7.1',
              title: L('Trigonometrie am rechtwinkligen Dreieck', 'Trigonometry in right triangles'),
              summary: L(
                'Seitenverhältnisse als Sinus, Kosinus und Tangens, Zusammenhänge zwischen ihnen und Berechnungen in Anwendungen.',
                'Ratios of sides as sine, cosine and tangent, relationships between them and calculations in applications.',
              ),
              simulations: ['sin-cos-tan-dreieck'],
            },
            {
              code: '7.2',
              title: L('Sinus- und Kosinussatz', 'Law of sines and law of cosines'),
              summary: L(
                'Sinus und Kosinus für Winkel bis 360° am Einheitskreis, Sinussatz und Kosinussatz.',
                'Sine and cosine for angles up to 360° on the unit circle, the laws of sines and cosines.',
              ),
              simulations: ['einheitskreis', 'sinussatz-kosinussatz'],
            },
          ],
        },
      ],
    },
    {
      grade: 10,
      sourceUrl: src(10),
      units: [
        {
          code: '1',
          title: L('Exponentielles Wachstum und Logarithmus', 'Exponential growth and logarithms'),
          summary: L(
            'Exponentielle Zu- und Abnahme im Vergleich zu linearem Wachstum, Graphen von y = b · aˣ, Logarithmus und Exponentialgleichungen, Modellieren.',
            'Exponential growth and decay compared with linear growth, graphs of y = b · aˣ, logarithms and exponential equations, modelling.',
          ),
          simulations: ['exponentielles-wachstum', 'logarithmus'],
        },
        {
          code: '2',
          title: L('Zusammengesetzte Zufallsexperimente und stochastische Simulationen', 'Multi-stage random experiments and stochastic simulations'),
          summary: L(
            'Baumdiagramme und Pfadregeln, Simulationen (z. B. Ziegenproblem, Geburtstagsproblem) und die Monte-Carlo-Methode für π.',
            'Tree diagrams and path rules, simulations (e.g. Monty Hall, birthday problem) and the Monte Carlo method for π.',
          ),
          simulations: ['baumdiagramm', 'ziegenproblem', 'geburtstagsproblem', 'monte-carlo-pi'],
        },
        {
          code: '3',
          title: L('Sinus- und Kosinusfunktion', 'Sine and cosine functions'),
          summary: L(
            'Bogenmaß, Sinus und Kosinus am Einheitskreis, Graphen und Periodizität, Parameter a, b, c und d, periodische Vorgänge modellieren.',
            'Radians, sine and cosine on the unit circle, graphs and periodicity, parameters a, b, c and d, modelling periodic processes.',
          ),
          simulations: ['einheitskreis', 'sinusfunktion'],
        },
        {
          code: '4',
          title: L('Ganzrationale Funktionen', 'Polynomial functions'),
          summary: L(
            'Ganzrationale Funktionen als Summe von Potenzfunktionen, Randverhalten, Nullstellen mit Vielfachheit, Symmetrie.',
            'Polynomials as sums of power functions, end behaviour, zeros with multiplicity, symmetry.',
          ),
          simulations: ['ganzrationale-funktionen', 'potenzfunktionen'],
        },
        {
          code: '5',
          title: L('Fortführung der Raumgeometrie', 'Further solid geometry'),
          summary: L(
            'Pyramiden, Kegel und Kugeln, Rotationskörper, Prinzip von Cavalieri sowie Volumen- und Oberflächenformeln.',
            'Pyramids, cones and spheres, solids of revolution, Cavalieri’s principle and formulas for volume and surface area.',
          ),
          simulations: ['pyramide-kegel-kugel', 'cavalieri'],
        },
      ],
    },
    {
      grade: 11,
      sourceUrl: src(11),
      units: [
        {
          code: '1',
          title: L('Spezielle Eigenschaften von Funktionen', 'Special properties of functions'),
          summary: L(
            'Grenzverhalten für x → ±∞, Symmetrie, Verschieben, Strecken und Spiegeln von Graphen, Stetigkeit.',
            'Behaviour as x → ±∞, symmetry, shifting, stretching and reflecting graphs, continuity.',
          ),
          simulations: ['transformationen', 'grenzverhalten', 'sinusfunktion'],
        },
        {
          code: '2',
          title: L('Gebrochen-rationale Funktionen – Grenzwerte und Asymptoten', 'Rational functions – limits and asymptotes'),
          summary: L(
            'Definitionsmenge, Nullstellen, Polstellen, waagrechte, schräge und senkrechte Asymptoten.',
            'Domain, zeros, poles, horizontal, oblique and vertical asymptotes.',
          ),
          simulations: ['polstellen-asymptoten'],
        },
        {
          code: '3',
          title: L('Bedingte Wahrscheinlichkeit und stochastische Unabhängigkeit', 'Conditional probability and independence'),
          summary: L(
            'Bedingte Wahrscheinlichkeiten mit Baumdiagramm und Vierfeldertafel (z. B. medizinische Tests), Unabhängigkeit, Daten kritisch hinterfragen.',
            'Conditional probabilities with tree diagrams and two-way tables (e.g. medical tests), independence, questioning data critically.',
          ),
          simulations: ['bedingte-wahrscheinlichkeit', 'vierfeldertafel'],
        },
        {
          code: '4',
          title: L('Grundlagen der Differentialrechnung', 'Foundations of differential calculus'),
          parts: [
            {
              code: '4.1',
              title: L('Lokales und globales Differenzieren', 'Local and global differentiation'),
              summary: L(
                'Sekanten- und Tangentensteigung, mittlere und lokale Änderungsrate, Ableitungsfunktion, Tangentengleichung.',
                'Slopes of secants and tangents, average and instantaneous rate of change, the derivative function, equations of tangents.',
              ),
              simulations: ['sekante-tangente', 'ableitungsfunktion'],
            },
            {
              code: '4.2',
              title: L('Anwendung der Differentialrechnung bei der Untersuchung ganzrationaler Funktionen', 'Investigating polynomial functions with calculus'),
              summary: L(
                'Monotonie, Extrem- und Wendestellen, notwendige und hinreichende Bedingungen, Newton-Verfahren.',
                'Monotonicity, extrema and inflection points, necessary and sufficient conditions, Newton’s method.',
              ),
              simulations: ['kurvendiskussion', 'newton-verfahren'],
            },
          ],
        },
      ],
    },
    {
      grade: 12,
      sourceUrl: src(12, '/regulaer'),
      note: EA,
      units: [
        {
          code: '1',
          title: L('Untersuchung von Funktionen – Stammfunktion, Produkt- und Kettenregel', 'Investigating functions – antiderivatives, product and chain rule'),
          parts: [
            {
              code: '1.1',
              title: L('Ganzrationale Funktionen (mit Parametern)', 'Polynomial functions (with parameters)'),
              summary: L(
                'Funktionenscharen untersuchen und vom Graphen auf eine Stammfunktion schließen.',
                'Investigating families of functions and sketching an antiderivative from a graph.',
              ),
              simulations: ['funktionenscharen', 'stammfunktion-grafisch'],
            },
            {
              code: '1.2',
              title: L('Natürliche Exponentialfunktion', 'The natural exponential function'),
              summary: L(
                'Die Funktion, die ihre eigene Ableitung ist; Produkt- und Kettenregel, Wachstums- und Abklingvorgänge.',
                'The function that is its own derivative; product and chain rule, growth and decay.',
              ),
              simulations: ['e-funktion'],
            },
            {
              code: '1.3',
              title: L('Sinus- und Kosinusfunktion', 'Sine and cosine functions'),
              summary: L(
                'Ableitungen von Sinus und Kosinus grafisch plausibel machen.',
                'Making the derivatives of sine and cosine plausible graphically.',
              ),
              simulations: ['ableitungsfunktion'],
            },
          ],
        },
        {
          code: '2',
          title: L('Zufallsgrößen und Binomialverteilung', 'Random variables and the binomial distribution'),
          summary: L(
            'Zufallsgrößen, Erwartungswert und Standardabweichung, Urnenmodelle, Bernoulli-Ketten und Binomialverteilung.',
            'Random variables, expected value and standard deviation, urn models, Bernoulli trials and the binomial distribution.',
          ),
          simulations: ['binomialverteilung', 'galtonbrett'],
        },
        {
          code: '3',
          title: L('Einseitiger Signifikanztest (bei als binomialverteilt angenommenen Merkmalen)', 'One-sided significance test (binomially distributed variables)'),
          summary: L(
            'Vorgehen beim Signifikanztest, Ablehnungsbereich, Fehler erster und zweiter Art und richtige Deutung der Ergebnisse.',
            'Procedure of a significance test, critical region, type I and type II errors and interpreting results correctly.',
          ),
          simulations: ['signifikanztest'],
        },
        {
          code: '4',
          title: L('Untersuchung von Funktionen – Quotientenregel, Umkehrfunktion', 'Investigating functions – quotient rule, inverse functions'),
          parts: [
            {
              code: '4.1',
              title: L('Gebrochen-rationale Funktionen', 'Rational functions'),
              summary: L(
                'Ableiten mit der Quotientenregel und Untersuchung einfacher gebrochen-rationaler Funktionen.',
                'Differentiating with the quotient rule and investigating simple rational functions.',
              ),
              simulations: ['polstellen-asymptoten'],
            },
            {
              code: '4.2',
              title: L('Wurzelfunktion', 'Square root function'),
              summary: L(
                'Umkehrbarkeit über strenge Monotonie, Quadrat- und Wurzelfunktion als Umkehrfunktionen.',
                'Invertibility via strict monotonicity, square and square root functions as inverses.',
              ),
              simulations: ['umkehrfunktion'],
            },
            {
              code: '4.3',
              title: L('Natürliche Logarithmusfunktion', 'The natural logarithm'),
              summary: L(
                'Der natürliche Logarithmus als Umkehrfunktion der e-Funktion und seine Ableitung.',
                'The natural logarithm as the inverse of the exponential function and its derivative.',
              ),
              simulations: ['umkehrfunktion', 'logarithmus'],
            },
          ],
        },
        {
          code: '5',
          title: L('Grundlagen der Koordinatengeometrie im Raum', 'Foundations of coordinate geometry in space'),
          summary: L(
            'Räumliches Koordinatensystem, Vektoren addieren und vervielfachen, Skalarprodukt (Längen und Winkel) und Vektorprodukt (Flächen und Volumina).',
            '3D coordinates, adding and scaling vectors, dot product (lengths and angles) and cross product (areas and volumes).',
          ),
          simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt'],
        },
      ],
    },
    {
      grade: 13,
      sourceUrl: src(13),
      note: EA,
      units: [
        {
          code: '1',
          title: L('Flächeninhalt und bestimmtes Integral', 'Area and the definite integral'),
          summary: L(
            'Integral als Flächenbilanz, Integralfunktion und Hauptsatz, Flächen zwischen Graphen, uneigentliche Integrale, Gesamtänderung und Rotationskörper.',
            'The integral as signed area, integral functions and the fundamental theorem, areas between graphs, improper integrals, total change and solids of revolution.',
          ),
          simulations: ['ober-untersummen', 'hauptsatz', 'aenderungsrate', 'rotationskoerper'],
        },
        {
          code: '2',
          title: L('Normalverteilung', 'Normal distribution'),
          summary: L(
            'Stetige Zufallsgrößen, Dichte- und Verteilungsfunktion, Erwartungswert und Standardabweichung, Sigma-Regeln.',
            'Continuous random variables, density and distribution functions, mean and standard deviation, sigma rules.',
          ),
          simulations: ['normalverteilung'],
        },
        {
          code: '3',
          title: L('Geraden und Ebenen im Raum', 'Lines and planes in space'),
          summary: L(
            'Parameter-, Normalen- und Koordinatenform, Lagebeziehungen, Schnittwinkel, Abstände und Kugeln.',
            'Parametric, normal and coordinate form, relative positions, angles of intersection, distances and spheres.',
          ),
          simulations: ['geraden-ebenen', 'lage-abstaende', 'kugeln'],
        },
        {
          code: '4',
          title: L('Anwendungen der Differential- und Integralrechnung', 'Applications of differential and integral calculus'),
          summary: L(
            'Verknüpfte Funktionen mit Parametern, Parameter aus Bedingungen bestimmen und Extremwertprobleme lösen.',
            'Combined functions with parameters, finding parameters from conditions and solving optimisation problems.',
          ),
          simulations: ['extremwertprobleme', 'funktionenscharen'],
        },
      ],
    },
  ],
};
