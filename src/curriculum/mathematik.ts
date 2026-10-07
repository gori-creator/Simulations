import { L, planned } from './helpers';
import type { Subject } from './types';

/**
 * Lehrplanstruktur Mathematik (bundeslandneutral, orientiert an den
 * KMK-Bildungsstandards und typischen Klassenstufen).
 */
export const mathematik: Subject = {
  id: 'mathematik',
  slug: L('mathematik', 'mathematics'),
  title: L('Mathematik', 'Mathematics'),
  description: L(
    'Funktionen, Geometrie, Analysis und Stochastik zum Anfassen: Parameter verändern und sofort sehen, was passiert.',
    'Functions, geometry, calculus and probability you can touch: change parameters and see what happens instantly.',
  ),
  status: 'active',
  areas: [
    {
      id: 'zahlen',
      slug: L('zahlen-und-operationen', 'numbers-and-operations'),
      title: L('Zahlen und Operationen', 'Numbers and operations'),
      description: L(
        'Brüche, negative Zahlen, Prozente, Potenzen und Wurzeln anschaulich darstellen.',
        'Visualising fractions, negative numbers, percentages, powers and roots.',
      ),
      grades: [5, 9],
      kmk: ['M-L1', 'M-K4', 'M-K5'],
      topics: [
        {
          id: 'brueche',
          title: L('Brüche', 'Fractions'),
          grades: [5, 6],
          simulations: [
            planned('bruchteile', L('Bruchteile darstellen', 'Representing fractions'), [5, 6], { kmk: ['M-L1', 'M-K4'] }),
            planned('brueche-vergleichen', L('Brüche erweitern, kürzen und vergleichen', 'Equivalent fractions and comparing'), [5, 6]),
          ],
        },
        {
          id: 'negative-zahlen',
          title: L('Negative Zahlen', 'Negative numbers'),
          grades: [6, 7],
          simulations: [
            planned('zahlenstrahl', L('Rechnen am Zahlenstrahl', 'Calculating on the number line'), [6, 7]),
          ],
        },
        {
          id: 'prozente',
          title: L('Prozentrechnung', 'Percentages'),
          grades: [7, 7],
          simulations: [planned('prozentstreifen', L('Prozentstreifen', 'Percentage bar'), [6, 8])],
        },
        {
          id: 'potenzen',
          title: L('Potenzen und Wurzeln', 'Powers and roots'),
          grades: [8, 10],
          simulations: [
            planned('quadratwurzel', L('Quadratwurzel geometrisch (Heron-Verfahren)', 'Square roots geometrically (Heron’s method)'), [8, 9]),
            planned('zehnerpotenzen', L('Zehnerpotenzen und Größenordnungen', 'Powers of ten and orders of magnitude'), [8, 10]),
          ],
        },
      ],
    },
    {
      id: 'funktionen',
      slug: L('funktionen', 'functions'),
      title: L('Funktionen', 'Functions'),
      description: L(
        'Von Zuordnungen über lineare und quadratische Funktionen bis zu Sinus und Exponentialfunktion – mit Reglern und ziehbaren Punkten.',
        'From proportional relationships to linear, quadratic, sine and exponential functions – with sliders and draggable points.',
      ),
      grades: [6, 11],
      kmk: ['M-L3', 'M-K3', 'M-K4', 'M-K5'],
      topics: [
        {
          id: 'zuordnungen',
          title: L('Zuordnungen', 'Relationships'),
          grades: [6, 7],
          simulations: [
            planned('proportional', L('Proportionale und antiproportionale Zuordnungen', 'Direct and inverse proportion'), [6, 7], { kmk: ['M-L3', 'M-K3'] }),
          ],
        },
        {
          id: 'lineare-funktionen',
          title: L('Lineare Funktionen', 'Linear functions'),
          grades: [7, 9],
          simulations: [
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
            planned('lgs-grafisch', L('Lineare Gleichungssysteme grafisch lösen', 'Solving linear systems graphically'), [8, 9]),
          ],
        },
        {
          id: 'quadratische-funktionen',
          title: L('Quadratische Funktionen', 'Quadratic functions'),
          grades: [9, 10],
          simulations: [
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
                ['Parabel', 'Scheitelpunkt', 'Scheitelpunktform', 'Normalparabel', 'Nullstellen', 'Diskriminante', 'pq-Formel', 'Streckfaktor'],
                ['parabola', 'vertex', 'vertex form', 'zeros', 'roots', 'discriminant', 'quadratic formula'],
              ),
              thumb: 'parabola',
            },
            planned('quadratische-gleichungen', L('Quadratische Gleichungen grafisch lösen', 'Solving quadratic equations graphically'), [9, 10]),
          ],
        },
        {
          id: 'potenz-exponential',
          title: L('Potenz- und Exponentialfunktionen', 'Power and exponential functions'),
          grades: [10, 11],
          simulations: [
            planned('potenzfunktionen', L('Potenzfunktionen', 'Power functions'), [10, 11]),
            planned('exponentielles-wachstum', L('Exponentielles Wachstum und Zerfall', 'Exponential growth and decay'), [10, 11], { kmk: ['M-L3', 'M-K3'] }),
            planned('logarithmus', L('Logarithmus als Umkehrfunktion', 'Logarithm as inverse function'), [10, 12]),
          ],
        },
        {
          id: 'trigonometrische-funktionen',
          title: L('Trigonometrische Funktionen', 'Trigonometric functions'),
          grades: [10, 11],
          simulations: [
            {
              id: 'einheitskreis',
              status: 'ready',
              slug: L('einheitskreis', 'unit-circle'),
              title: L('Einheitskreis', 'Unit circle'),
              summary: L(
                'Sinus, Kosinus und Tangens am Einheitskreis – und wie daraus die Sinuskurve entsteht. Mit Animation.',
                'Sine, cosine and tangent on the unit circle – and how the sine curve emerges from it. With animation.',
              ),
              grades: [10, 11],
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
          ],
        },
        {
          id: 'werkzeuge',
          title: L('Werkzeuge', 'Tools'),
          grades: [7, 13],
          simulations: [
            planned('funktionsplotter', L('Funktionsplotter mit eigenen Termen', 'Function plotter with custom terms'), [7, 13], { uni: true }),
          ],
        },
      ],
    },
    {
      id: 'geometrie',
      slug: L('geometrie', 'geometry'),
      title: L('Geometrie', 'Geometry'),
      description: L(
        'Winkel, Dreiecke, Kreise, Ähnlichkeit und Körper dynamisch konstruieren und untersuchen.',
        'Construct and investigate angles, triangles, circles, similarity and solids dynamically.',
      ),
      grades: [5, 10],
      kmk: ['M-L4', 'M-L2', 'M-K1', 'M-K4'],
      topics: [
        {
          id: 'winkel',
          title: L('Winkel', 'Angles'),
          grades: [5, 6],
          simulations: [planned('winkel-messen', L('Winkel schätzen und messen', 'Estimating and measuring angles'), [5, 6])],
        },
        {
          id: 'dreiecke',
          title: L('Dreiecke', 'Triangles'),
          grades: [7, 8],
          simulations: [
            planned('winkelsumme', L('Winkelsumme im Dreieck', 'Angle sum in a triangle'), [7, 7], { kmk: ['M-L4', 'M-K1'] }),
            planned('besondere-linien', L('Besondere Linien im Dreieck', 'Special lines in a triangle'), [7, 8]),
          ],
        },
        {
          id: 'pythagoras',
          title: L('Satz des Pythagoras', 'Pythagorean theorem'),
          grades: [9, 9],
          simulations: [planned('pythagoras', L('Satz des Pythagoras (Flächenbeweis)', 'Pythagorean theorem (area proof)'), [8, 9], { kmk: ['M-L4', 'M-K1'] })],
        },
        {
          id: 'kreis',
          title: L('Kreis', 'Circle'),
          grades: [8, 9],
          simulations: [planned('kreiszahl-pi', L('Kreisumfang und die Zahl π', 'Circumference and the number π'), [8, 9])],
        },
        {
          id: 'aehnlichkeit',
          title: L('Ähnlichkeit und Strahlensätze', 'Similarity and intercept theorems'),
          grades: [9, 9],
          simulations: [planned('strahlensaetze', L('Strahlensätze', 'Intercept theorems'), [9, 9])],
        },
        {
          id: 'trigonometrie-dreieck',
          title: L('Trigonometrie im Dreieck', 'Trigonometry in triangles'),
          grades: [9, 10],
          simulations: [planned('sin-cos-tan-dreieck', L('Sinus, Kosinus und Tangens im rechtwinkligen Dreieck', 'Sine, cosine and tangent in right triangles'), [9, 10])],
        },
        {
          id: 'koerper',
          title: L('Körper', 'Solids'),
          grades: [5, 10],
          simulations: [
            planned('koerpernetze', L('Netze von Körpern', 'Nets of solids'), [5, 7]),
            planned('volumen-oberflaeche', L('Volumen und Oberfläche', 'Volume and surface area'), [8, 10]),
          ],
        },
      ],
    },
    {
      id: 'analysis',
      slug: L('analysis', 'calculus'),
      title: L('Analysis', 'Calculus'),
      description: L(
        'Ableitung und Integral anschaulich: von der Sekante zur Tangente und von Rechtecksummen zur Fläche.',
        'Derivatives and integrals made visual: from secant to tangent and from rectangle sums to area.',
      ),
      grades: [11, 13],
      kmk: ['M-L3', 'M-L2', 'M-K1', 'M-K4'],
      topics: [
        {
          id: 'differenzialrechnung',
          title: L('Differenzialrechnung', 'Differential calculus'),
          grades: [11, 12],
          simulations: [
            planned('sekante-tangente', L('Von der Sekante zur Tangente', 'From secant to tangent'), [11, 11], { kmk: ['M-L3', 'M-K4'] }),
            planned('ableitungsfunktion', L('Ableitungsfunktion grafisch', 'The derivative function graphically'), [11, 12]),
            planned('kurvendiskussion', L('Kurvendiskussion', 'Curve sketching'), [11, 12]),
          ],
        },
        {
          id: 'integralrechnung',
          title: L('Integralrechnung', 'Integral calculus'),
          grades: [12, 13],
          simulations: [
            planned('ober-untersummen', L('Ober- und Untersummen', 'Upper and lower sums'), [12, 12], { kmk: ['M-L2', 'M-K4'] }),
            planned('hauptsatz', L('Hauptsatz der Differenzial- und Integralrechnung', 'Fundamental theorem of calculus'), [12, 13], { uni: true }),
          ],
        },
        {
          id: 'weiterfuehrend',
          title: L('Weiterführend', 'Further topics'),
          grades: [12, 14],
          simulations: [
            planned('taylor-polynome', L('Taylorpolynome', 'Taylor polynomials'), [13, 14], { uni: true }),
            planned('fourier-reihen', L('Fourier-Reihen', 'Fourier series'), [14, 14], { uni: true }),
          ],
        },
      ],
    },
    {
      id: 'stochastik',
      slug: L('daten-und-zufall', 'data-and-chance'),
      title: L('Daten und Zufall', 'Data and chance'),
      description: L(
        'Zufallsexperimente tausendfach wiederholen, Verteilungen entstehen sehen und Daten auswerten.',
        'Repeat random experiments thousands of times, watch distributions emerge and analyse data.',
      ),
      grades: [5, 13],
      kmk: ['M-L5', 'M-K3', 'M-K4'],
      topics: [
        {
          id: 'daten',
          title: L('Daten auswerten', 'Analysing data'),
          grades: [5, 8],
          simulations: [planned('boxplot', L('Kennwerte und Boxplot', 'Summary statistics and box plots'), [6, 8])],
        },
        {
          id: 'wahrscheinlichkeit',
          title: L('Wahrscheinlichkeit', 'Probability'),
          grades: [6, 9],
          simulations: [
            planned('gesetz-grosse-zahlen', L('Gesetz der großen Zahlen', 'Law of large numbers'), [6, 9], { kmk: ['M-L5', 'M-K3'] }),
            planned('baumdiagramm', L('Baumdiagramme und Pfadregeln', 'Tree diagrams'), [8, 10]),
          ],
        },
        {
          id: 'verteilungen',
          title: L('Wahrscheinlichkeitsverteilungen', 'Probability distributions'),
          grades: [11, 13],
          simulations: [
            planned('galtonbrett', L('Galtonbrett', 'Galton board'), [9, 13]),
            planned('binomialverteilung', L('Binomialverteilung', 'Binomial distribution'), [11, 13]),
            planned('normalverteilung', L('Normalverteilung', 'Normal distribution'), [12, 13], { uni: true }),
          ],
        },
      ],
    },
    {
      id: 'vektoren',
      slug: L('analytische-geometrie', 'vectors-and-linear-algebra'),
      title: L('Analytische Geometrie und Lineare Algebra', 'Vectors and linear algebra'),
      description: L(
        'Vektoren, Geraden und Ebenen im Raum – drehbar in 3D – sowie Matrizen als Abbildungen.',
        'Vectors, lines and planes in space – rotatable in 3D – and matrices as transformations.',
      ),
      grades: [11, 14],
      kmk: ['M-L4', 'M-K4', 'M-K5'],
      topics: [
        {
          id: 'vektoren-raum',
          title: L('Vektoren im Raum', 'Vectors in space'),
          grades: [11, 13],
          simulations: [
            planned('vektoren-3d', L('Vektoren addieren und vervielfachen (3D)', 'Adding and scaling vectors (3D)'), [11, 12]),
            planned('geraden-ebenen', L('Geraden und Ebenen im Raum', 'Lines and planes in space'), [11, 13]),
          ],
        },
        {
          id: 'matrizen',
          title: L('Matrizen', 'Matrices'),
          grades: [12, 14],
          simulations: [planned('matrix-abbildungen', L('Matrizen als lineare Abbildungen', 'Matrices as linear maps'), [12, 14], { uni: true })],
        },
      ],
    },
  ],
};
