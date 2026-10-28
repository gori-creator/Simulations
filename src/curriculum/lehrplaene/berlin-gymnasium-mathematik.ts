import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { mathematik } from '../mathematik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Bildungsserver Berlin-Brandenburg des LISUM. Die Rahmenlehrpläne nennen als Erarbeitung das
 * Landesinstitut für Schule und Medien Berlin-Brandenburg (LISUM) und keinen Link zur einzelnen
 * Datei. Verlinkt ist die Startseite des Bildungsservers.
 */
const SOURCE = 'https://bildungsserver.berlin-brandenburg.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/berlin-gymnasium-mathematik.md, Teil E).
const niveauNote = (n: number, de: string, en: string): Localized =>
  L(
    `Jahrgangsstufe ${n}: Der Rahmenlehrplan 1–10 ist nach Niveaustufen A–H gegliedert, nicht nach Jahrgängen; ${de} Lernbereiche sind die Themenbereiche, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.`,
    `Grade ${n}: the framework curriculum for grades 1–10 is organised by levels A–H, not by grades; ${en} Units are the subject areas, sub-units their topics; the numbers are our own.`,
  );

const NOTE_5 = niveauNote(
  5,
  'für weiterführende Schulen mit den Jahrgangsstufen 5 und 6 gilt in Jahrgangsstufe 5 die Niveaustufe C–D. In Berlin beginnt das Gymnasium meist mit Klasse 7; grundständige Gymnasien beginnen mit 5.',
  'schools that start in grade 5 work at level C–D in grade 5. In Berlin the Gymnasium usually starts in grade 7; some start in grade 5.',
);
const NOTE_6 = niveauNote(6, 'in Jahrgangsstufe 6 gilt die Niveaustufe D, in Teilen E.', 'grade 6 works at level D, partly E.');
const NOTE_7 = niveauNote(7, 'für das Gymnasium gilt in Jahrgangsstufe 7 die Niveaustufe E; E und F sind in 7/8 zu verzahnen.', 'at the Gymnasium grade 7 works at level E; E and F are linked within grades 7/8.');
const NOTE_8 = niveauNote(8, 'für das Gymnasium gilt in Jahrgangsstufe 8 die Niveaustufe F; Vorgriffe auf G und H sind möglich.', 'at the Gymnasium grade 8 works at level F; topics from G and H may be anticipated.');
const NOTE_9 = niveauNote(9, 'für das Gymnasium gilt in Jahrgangsstufe 9 die Niveaustufe G; G und H sind in 9/10 zu verzahnen.', 'at the Gymnasium grade 9 works at level G; G and H are linked within grades 9/10.');
const NOTE_10 = niveauNote(
  10,
  'für das Gymnasium gilt in Jahrgangsstufe 10 die Niveaustufe H, die Eingangsvoraussetzungen für die Qualifikationsphase.',
  'at the Gymnasium grade 10 works at level H, the entry requirements for the qualification phase.',
);

const Q_11 = L(
  'Qualifikationsphase, 1. und 2. Kurshalbjahr (Q1, Q2; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 11). Der Rahmenlehrplan ordnet die Standards den Kurshalbjahren schwerpunktmäßig zu; Verschiebungen zwischen Q1 und Q2 sowie zwischen Q2 und Q4 sind zulässig. LK = nur im Leistungskurs. Die Nummern sind von uns vergeben.',
  'Qualification phase, first and second half-year (Q1, Q2; at the Gymnasium with Abitur after grade 12: grade 11). The curriculum assigns the standards to half-years by focus; moving between Q1 and Q2 and between Q2 and Q4 is allowed. LK = advanced course only. The numbers are our own.',
);

const Q_12 = L(
  'Qualifikationsphase, 3. und 4. Kurshalbjahr (Q3, Q4; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 12). Q4 dient auch der Vertiefung und Verknüpfung aller drei Sachgebiete. LK = nur im Leistungskurs. Die Nummern sind von uns vergeben.',
  'Qualification phase, third and fourth half-year (Q3, Q4; at the Gymnasium with Abitur after grade 12: grade 12). Q4 also deepens and links all three areas. LK = advanced course only. The numbers are our own.',
);

interface PartSpec {
  summary: Localized;
  simulations?: string[];
}

const THEMES: Array<{ code: string; title: Localized; parts: Array<{ code: string; title: Localized }> }> = [
  {
    code: '1',
    title: L('Zahlen und Operationen', 'Numbers and operations'),
    parts: [
      { code: '1.1', title: L('Zahlvorstellungen', 'Understanding numbers') },
      { code: '1.2', title: L('Operationsvorstellungen und Rechenstrategien', 'Understanding operations and calculation strategies') },
    ],
  },
  {
    code: '2',
    title: L('Größen und Messen', 'Quantities and measurement'),
    parts: [
      { code: '2.1', title: L('Größenvorstellungen und Messen', 'Understanding quantities and measuring') },
      { code: '2.2', title: L('Rechnen mit Größen', 'Calculating with quantities') },
    ],
  },
  {
    code: '3',
    title: L('Raum und Form', 'Space and shape'),
    parts: [
      { code: '3.1', title: L('Geometrische Objekte', 'Geometric objects') },
      { code: '3.2', title: L('Geometrische Abbildungen', 'Geometric transformations') },
    ],
  },
  {
    code: '4',
    title: L('Gleichungen und Funktionen', 'Equations and functions'),
    parts: [
      { code: '4.1', title: L('Terme und Gleichungen', 'Terms and equations') },
      { code: '4.2', title: L('Zuordnungen und Funktionen', 'Relationships and functions') },
    ],
  },
  {
    code: '5',
    title: L('Daten und Zufall', 'Data and chance'),
    parts: [
      { code: '5.1', title: L('Daten', 'Data') },
      { code: '5.2', title: L('Zählstrategien und Wahrscheinlichkeiten', 'Counting strategies and probabilities') },
    ],
  },
];

/** Lernbereiche einer Jahrgangsstufe: die fünf Themenbereiche mit der Niveaustufe im Titel (Kap. 3.1–3.5). */
function niveauUnits(niveau: Localized, parts: Record<string, PartSpec>): CurriculumUnit[] {
  return THEMES.map((theme) => ({
    code: theme.code,
    title: L(`${theme.title.de} (${niveau.de})`, `${theme.title.en} (${niveau.en})`),
    parts: theme.parts.map((part) => ({ ...part, ...parts[part.code]! })),
  }));
}

/** Niveaustufe D mit Bezügen zu C (Jahrgangsstufen 5 und 6). */
const D_PARTS: Record<string, PartSpec> = {
  '1.1': {
    summary: L(
      'Große natürliche Zahlen in der Stellenwerttafel, Teilbarkeitsregeln, Primzahlen, Vielfache und Teiler; Brüche als Anteile, erweitern, kürzen, vergleichen und am Zahlenstrahl ordnen; Dezimalzahlen.',
      'Large natural numbers in the place-value chart, divisibility rules, primes, multiples and divisors; fractions as parts, expanding, simplifying, comparing and ordering them on the number line; decimals.',
    ),
    simulations: ['stellenwerte', 'primfaktoren', 'bruchteile', 'brueche-vergleichen', 'dezimalbrueche'],
  },
  '1.2': {
    summary: L(
      'Grundrechenarten mit gebrochenen Zahlen verstehen und ausführen, Brüche als Operator, Punkt-vor-Strich und Klammern, schriftliche Verfahren und Überschlag.',
      'Understanding and carrying out the four operations with fractions, fractions as operators, order of operations and brackets, written methods and estimating.',
    ),
    simulations: ['brueche-rechnen', 'termbaum'],
  },
  '2.1': {
    summary: L(
      'Längen, Flächen, Volumen und Winkel unterscheiden, messen und schätzen, Einheiten umwandeln und Größen in Dezimalschreibweise angeben.',
      'Distinguishing, measuring and estimating lengths, areas, volumes and angles, converting units and giving quantities as decimals.',
    ),
    simulations: ['einheiten', 'winkel-messen'],
  },
  '2.2': {
    summary: L(
      'Umfang von Vielecken, Flächeninhalt von Rechtecken und Volumen von Quadern berechnen, auch zusammengesetzt; Größen in Sachaufgaben.',
      'Calculating the perimeter of polygons, the area of rectangles and the volume of cuboids, also composite ones; quantities in word problems.',
    ),
    simulations: ['umfang-flaeche', 'quader-volumen'],
  },
  '3.1': {
    summary: L(
      'Körper, Winkel und Dreiecke beschreiben, Vierecke und ihre Beziehungen („Haus der Vierecke“), Winkel an geschnittenen Geraden, Körpernetze, Zeichnen im Koordinatensystem.',
      'Describing solids, angles and triangles, quadrilaterals and how they relate (“house of quadrilaterals”), angles at intersecting lines, nets, drawing in the coordinate system.',
    ),
    simulations: ['koordinaten-lage', 'vierecke', 'winkel-geradenkreuzung', 'koerpernetze'],
  },
  '3.2': {
    summary: L(
      'Kongruente Figuren erkennen, Spiegelungen und Verschiebungen zeichnen, Parkette herstellen.',
      'Recognising congruent figures, drawing reflections and translations, making tessellations.',
    ),
    simulations: ['spiegelung'],
  },
  '4.1': {
    summary: L(
      'Sachverhalte durch Zahlenterme und Gleichungen darstellen, Variablen als Platzhalter, Rechengesetze nutzen und einfache Gleichungen mit der Umkehroperation lösen.',
      'Representing situations by numerical terms and equations, variables as placeholders, using the laws of arithmetic and solving simple equations with the inverse operation.',
    ),
    simulations: ['termbaum'],
  },
  '4.2': {
    summary: L(
      'Direkt proportionale Zuordnungen beschreiben, in Tabelle, Text und Koordinatensystem darstellen und mit dem Dreisatz rechnen.',
      'Describing direct proportion, showing it in tables, words and the coordinate system and using the rule of three.',
    ),
    simulations: ['proportional', 'funktion-zuordnung'],
  },
  '5.1': {
    summary: L(
      'Messwerte erfassen und in Tabellen und Diagrammen darstellen, Minimum, Maximum und Spannweite ermitteln.',
      'Recording measurements and showing them in tables and charts, finding minimum, maximum and range.',
    ),
    simulations: ['diagramme'],
  },
  '5.2': {
    summary: L(
      'Kombinatorische Fragen systematisch lösen, relative Häufigkeiten bei einstufigen Zufallsexperimenten als Bruch angeben.',
      'Solving counting problems systematically, giving relative frequencies of single-stage experiments as fractions.',
    ),
    simulations: ['zaehlprinzip'],
  },
};

/** Niveaustufe E (Jahrgangsstufe 7). */
const E_PARTS: Record<string, PartSpec> = {
  '1.1': {
    summary: L(
      'Prozente als Darstellung gebrochener Zahlen, negative Zahlen und rationale Zahlen an der Zahlengeraden, Betrag und Gegenzahl, periodische Dezimalzahlen.',
      'Percentages as another way of writing fractions, negative and rational numbers on the number line, absolute value and opposite, recurring decimals.',
    ),
    simulations: ['zahlengerade', 'prozentstreifen'],
  },
  '1.2': {
    summary: L(
      'Grundrechenarten mit rationalen Zahlen als Zustandsänderung deuten, Prozentrechnung mit Prozentstreifen, Dreisatz und Verhältnisgleichungen.',
      'Interpreting the four operations with rational numbers as changes of state, percentages with the percentage bar, rule of three and proportions.',
    ),
    simulations: ['zahlengerade', 'prozentstreifen', 'termbaum'],
  },
  '2.1': {
    summary: L(
      'Größen und Einheiten, auch a, ha und km², umwandeln, Maße aus Skizzen und Zeichnungen mit Maßstab entnehmen und Messungen durchführen.',
      'Converting quantities and units, including ares, hectares and km², taking measurements from sketches and scale drawings and measuring.',
    ),
    simulations: ['massstab'],
  },
  '2.2': {
    summary: L(
      'Umfang und Flächeninhalt von Dreiecken, Vierecken und Kreisen durch Zerlegen und Ergänzen, Volumen und Oberfläche von Prismen und Zylindern, Satz des Pythagoras.',
      'Perimeter and area of triangles, quadrilaterals and circles by dissection and completion, volume and surface area of prisms and cylinders, Pythagoras’ theorem.',
    ),
    simulations: ['flaechen-zerlegen', 'kreiszahl-pi', 'prisma-zylinder', 'pythagoras', 'massstab'],
  },
  '3.1': {
    summary: L(
      'Dreiecksarten und besondere Linien, Innenwinkelsumme, Sätze von Thales und Pythagoras, Netze und Schrägbilder von Prismen und Zylindern, Konstruktionen nach den Kongruenzsätzen.',
      'Types of triangle and special lines, angle sum, the theorems of Thales and Pythagoras, nets and oblique drawings of prisms and cylinders, constructions using the congruence criteria.',
    ),
    simulations: ['winkelsumme', 'besondere-linien', 'mittelsenkrechte', 'thales', 'dreieckskonstruktion', 'winkel-geradenkreuzung', 'vierecke', 'koerpernetze'],
  },
  '3.2': {
    summary: L(
      'Kongruente und ähnliche Figuren erkennen, Eigenschaften von Kongruenz- und Ähnlichkeitsabbildungen beschreiben, maßstäblich vergrößern und verkleinern.',
      'Recognising congruent and similar figures, describing congruence and similarity transformations, enlarging and reducing to scale.',
    ),
    simulations: ['spiegelung'],
  },
  '4.1': {
    summary: L(
      'Terme, lineare Gleichungen und Verhältnisgleichungen aufstellen und durch Probieren, grafisch und mit Äquivalenzumformungen lösen; Formeln umstellen.',
      'Setting up terms, linear equations and proportions and solving them by trial, graphically and by equivalent transformations; rearranging formulas.',
    ),
    simulations: ['waagemodell', 'termbaum'],
  },
  '4.2': {
    summary: L(
      'Direkt und indirekt proportionale Zuordnungen unterscheiden und in allen vier Quadranten darstellen, auch bei Maßstab und Prozentrechnung.',
      'Distinguishing direct and inverse proportion and showing them in all four quadrants, also with scales and percentages.',
    ),
    simulations: ['proportional', 'funktion-zuordnung'],
  },
  '5.1': {
    summary: L(
      'Erhebungen planen, Daten auch in Kreisdiagrammen darstellen, arithmetisches Mittel, Modalwert und Median vergleichen.',
      'Planning surveys, showing data in pie charts too, comparing mean, mode and median.',
    ),
    simulations: ['boxplot', 'diagramme'],
  },
  '5.2': {
    summary: L(
      'Ergebnismenge und Ereignisse, relative Häufigkeiten auch zweistufiger Experimente, Gesetz der großen Zahlen und Laplace-Regel.',
      'Sample spaces and events, relative frequencies also of two-stage experiments, the law of large numbers and the Laplace rule.',
    ),
    simulations: ['gesetz-grosse-zahlen', 'zaehlprinzip'],
  },
};

/** Niveaustufe F (Jahrgangsstufe 8). */
const F_PARTS: Record<string, PartSpec> = {
  '1.1': {
    summary: L(
      'Potenzen und Zehnerpotenzen mit natürlichem Exponenten, rationale Zahlen ordnen und runden.',
      'Powers and powers of ten with natural exponents, ordering and rounding rational numbers.',
    ),
    simulations: ['zehnerpotenzen'],
  },
  '1.2': {
    summary: L(
      'Potenzen als fortgesetzte Multiplikation, Quadrat- und Kubikwurzel als Umkehrung, Prozentrechnung mit Rabatt und Zinsen.',
      'Powers as repeated multiplication, square and cube roots as inverses, percentages with discounts and interest.',
    ),
    simulations: ['quadratwurzel', 'zehnerpotenzen'],
  },
  '2.1': {
    summary: L(
      'Einheitenvorsätze von Milli bis Kilo mit Zehnerpotenzen, Größen in berufsorientierten Kontexten.',
      'Unit prefixes from milli to kilo with powers of ten, quantities in work-related contexts.',
    ),
  },
  '2.2': {
    summary: L(
      'Flächeninhalt zusammengesetzter Figuren, Volumen und Oberfläche von Körpern auch mit quadratischen Pyramiden, zusammengesetzte Körper.',
      'Area of composite figures, volume and surface area of solids including square pyramids, composite solids.',
    ),
    simulations: ['flaechen-zerlegen', 'prisma-zylinder', 'pyramide-kegel-kugel', 'kreiszahl-pi'],
  },
  '3.1': {
    summary: L(
      'Teilkörper und Teilflächen beschreiben, Lage- und Größenbeziehungen für Berechnungen nutzen, Netze und Schrägbilder auch von Pyramiden.',
      'Describing parts of solids and figures, using position and size relations for calculations, nets and oblique drawings also of pyramids.',
    ),
    simulations: ['koerpernetze', 'pyramide-kegel-kugel'],
  },
  '3.2': {
    summary: L(
      'Abbildungen in Sachaufgaben anwenden und mit Geometriesoftware konstruieren.',
      'Applying transformations in word problems and constructing them with geometry software.',
    ),
  },
  '4.1': {
    summary: L(
      'Terme mit dem Distributivgesetz umformen, lineare Gleichungen mit Klammern und lineare Gleichungssysteme mit zwei Variablen grafisch und durch Probieren lösen.',
      'Transforming terms with the distributive law, solving linear equations with brackets and linear systems in two variables graphically and by trial.',
    ),
    simulations: ['binomische-formeln', 'lgs-grafisch', 'gleichungen-grafisch'],
  },
  '4.2': {
    summary: L(
      'Lineare Funktionen y = ax + b mit Steigung, Änderungsrate, Nullstelle und y-Achsenabschnitt, Einfluss der Parameter.',
      'Linear functions y = ax + b with slope, rate of change, zero and y-intercept, the effect of the parameters.',
    ),
    simulations: ['lineare-funktion', 'funktion-zuordnung', 'funktionsplotter'],
  },
  '5.1': {
    summary: L(
      'Stichproben und Merkmale wählen, Daten in Klassen, Boxplots und Histogrammen darstellen und vergleichen.',
      'Choosing samples and variables, showing data in classes, box plots and histograms and comparing them.',
    ),
    simulations: ['boxplot', 'diagramme'],
  },
  '5.2': {
    summary: L(
      'Kombinatorische Fragen und Zufallsexperimente vertiefen.',
      'Deepening counting problems and random experiments.',
    ),
    simulations: ['zaehlprinzip', 'gesetz-grosse-zahlen', 'baumdiagramm'],
  },
};

/** Niveaustufe G (Jahrgangsstufe 9). */
const G_PARTS: Record<string, PartSpec> = {
  '1.1': {
    summary: L(
      'π und Quadratwurzeln als irrationale Zahlen, Näherungswerte für reelle Zahlen, die Zahlenbereiche bis zu den reellen Zahlen.',
      'π and square roots as irrational numbers, approximations of real numbers, the number sets up to the real numbers.',
    ),
    simulations: ['quadratwurzel'],
  },
  '1.2': {
    summary: L(
      'Potenzen mit negativen Exponenten, Potenzgesetze für ganzzahlige Exponenten, Zusammenhang von Potenzieren und Radizieren.',
      'Powers with negative exponents, laws of exponents for integer exponents, the link between powers and roots.',
    ),
    simulations: ['quadratwurzel'],
  },
  '2.1': {
    summary: L(
      'Einheitenvorsätze von Nano bis Tera, Maße aus technischen Zeichnungen entnehmen.',
      'Unit prefixes from nano to tera, taking measurements from technical drawings.',
    ),
  },
  '2.2': {
    summary: L(
      'Sinus, Kosinus und Tangens im rechtwinkligen Dreieck, Volumen und Oberfläche von Pyramide, Kegel und Kugel, Sinussatz und Kosinussatz.',
      'Sine, cosine and tangent in right triangles, volume and surface area of pyramids, cones and spheres, the sine rule and the cosine rule.',
    ),
    simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'pyramide-kegel-kugel'],
  },
  '3.1': {
    summary: L(
      'Differenz- und Teilkörper beschreiben, Schrägbilder von Kegeln, Zylindern und Pyramiden, Konstruktionen mit den Sätzen von Thales und Pythagoras.',
      'Describing composite and hollow solids, oblique drawings of cones, cylinders and pyramids, constructions with the theorems of Thales and Pythagoras.',
    ),
    simulations: ['pythagoras', 'pyramide-kegel-kugel'],
  },
  '3.2': {
    summary: L(
      'Abbildungen in komplexen Sachzusammenhängen nutzen, Körper maßstäblich vergrößern und verkleinern.',
      'Using transformations in complex contexts, enlarging and reducing solids to scale.',
    ),
    simulations: ['vergroessern'],
  },
  '4.1': {
    summary: L(
      'Terme mit binomischen Formeln umformen, quadratische Gleichungen und lineare Gleichungssysteme rechnerisch und grafisch lösen und ihre Lösbarkeit untersuchen.',
      'Transforming terms with binomial formulas, solving quadratic equations and linear systems algebraically and graphically and examining their solvability.',
    ),
    simulations: ['binomische-formeln', 'gleichungen-grafisch', 'lgs-grafisch'],
  },
  '4.2': {
    summary: L(
      'Quadratische Funktionen y = a(x + d)² + e, trigonometrische Funktionen y = a·sin(bx) und Exponentialfunktionen mit Parametern, Symmetrie und Scheitelpunkt; Modellieren.',
      'Quadratic functions y = a(x + d)² + e, trigonometric functions y = a·sin(bx) and exponential functions with parameters, symmetry and vertex; modelling.',
    ),
    simulations: ['quadratische-funktion', 'extremwert-parabel', 'parabel-drei-punkte', 'funktionsplotter'],
  },
  '5.1': {
    summary: L(
      'Erhebungen selbstständig planen und auswerten, Trends erkennen, Manipulationen in Diagrammen aufdecken.',
      'Planning and evaluating surveys independently, recognising trends, exposing manipulation in charts.',
    ),
    simulations: ['diagramme', 'boxplot'],
  },
  '5.2': {
    summary: L(
      'Mehrstufige Zufallsexperimente mit Baumdiagramm, Pfadregeln, Vierfeldertafel und Urnenmodell, auch bedingte Wahrscheinlichkeiten.',
      'Multi-stage experiments with tree diagrams, path rules, two-way tables and urn models, including conditional probabilities.',
    ),
    simulations: ['baumdiagramm', 'vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'geburtstagsproblem'],
  },
};

/** Niveaustufe H (Jahrgangsstufe 10). */
const H_PARTS: Record<string, PartSpec> = {
  '1.1': {
    summary: L(
      'Zahlen situationsgerecht darstellen, ganze, rationale und reelle Zahlen angemessen verwenden, Einschachtelung von Quadratwurzeln oder π.',
      'Representing numbers to suit the situation, using integers, rational and real numbers appropriately, nesting intervals for square roots or π.',
    ),
  },
  '1.2': {
    summary: L(
      'Potenzen mit rationalen Exponenten und Wurzelgesetze, Logarithmen als Umkehrung des Potenzierens.',
      'Powers with rational exponents and laws of roots, logarithms as the inverse of taking powers.',
    ),
    simulations: ['logarithmus'],
  },
  '2.1': {
    summary: L(
      'Bogen- und Gradmaß am Einheitskreis, krummlinig begrenzte Figuren näherungsweise bestimmen.',
      'Radians and degrees on the unit circle, approximating figures with curved boundaries.',
    ),
    simulations: ['einheitskreis'],
  },
  '2.2': {
    summary: L(
      'Volumen schiefer Prismen, Zylinder und Pyramiden mit dem Satz von Cavalieri, Kosinussatz auch für Winkel.',
      'Volume of oblique prisms, cylinders and pyramids with Cavalieri’s principle, the cosine rule also for angles.',
    ),
    simulations: ['cavalieri', 'sinussatz-kosinussatz', 'pyramide-kegel-kugel'],
  },
  '3.1': {
    summary: L(
      'Eigenschaften geometrischer Objekte mit Symmetrie, Winkelsätzen, trigonometrischen Beziehungen und den Sätzen von Thales und Pythagoras begründen.',
      'Justifying properties of geometric objects with symmetry, angle theorems, trigonometric relations and the theorems of Thales and Pythagoras.',
    ),
    simulations: ['sin-cos-tan-dreieck'],
  },
  '3.2': {
    summary: L(
      'Eigenschaften geometrischer Objekte mit Kongruenz und Ähnlichkeit begründen.',
      'Justifying properties of geometric objects with congruence and similarity.',
    ),
  },
  '4.1': {
    summary: L(
      'Quadratische Ergänzung, Exponentialgleichungen mit Logarithmus, Gleichungen höheren Grades und lineare Gleichungssysteme mit drei Variablen, etwa zur Rekonstruktion quadratischer Funktionen.',
      'Completing the square, exponential equations with logarithms, higher-degree equations and linear systems in three variables, for example to reconstruct quadratic functions.',
    ),
    simulations: ['parabel-drei-punkte', 'logarithmus', 'lgs-grafisch'],
  },
  '4.2': {
    summary: L(
      'Quadratische, trigonometrische, Potenz- und Exponentialfunktionen mit Parametern, Umkehrfunktionen, mittlere und lokale Änderungsrate ganzrationaler Funktionen und Skizze der Ableitungsfunktion.',
      'Quadratic, trigonometric, power and exponential functions with parameters, inverse functions, average and local rate of change of polynomial functions and a sketch of the derivative.',
    ),
    simulations: [
      'quadratische-funktion',
      'sinusfunktion',
      'einheitskreis',
      'potenzfunktionen',
      'hyperbel',
      'exponentielles-wachstum',
      'umkehrfunktion',
      'transformationen',
      'ganzrationale-funktionen',
      'sekante-tangente',
      'ableitungsfunktion',
      'funktionsplotter',
    ],
  },
  '5.1': {
    summary: L(
      'Mittelwerte und Streumaße wie Spannweite und Boxbreite analysieren und interpretieren.',
      'Analysing and interpreting averages and measures of spread such as range and box width.',
    ),
    simulations: ['boxplot'],
  },
  '5.2': {
    summary: L(
      'Anzahlen mit Fakultät und Binomialkoeffizient, Wahrscheinlichkeiten über relative Häufigkeiten und Simulationen schätzen und Häufigkeiten vorhersagen.',
      'Counting with factorials and binomial coefficients, estimating probabilities from relative frequencies and simulations and predicting frequencies.',
    ),
    simulations: ['geburtstagsproblem', 'monte-carlo-pi', 'bedingte-wahrscheinlichkeit'],
  },
};

/** Qualifikationsphase Q1 und Q2 (Kap. 3.2.2 und 4 des Rahmenlehrplans für die gymnasiale Oberstufe). */
const Q12_UNITS: CurriculumUnit[] = [
  {
    code: 'Q1',
    title: L('1. Kurshalbjahr: Analysis (Differentialrechnung)', 'First half-year: calculus (differential calculus)'),
    summary: L(
      'Mittlere und lokale Änderungsrate, Ableitung und Ableitungsregeln, Kurvenuntersuchung und Modellieren mit Potenz-, ganzrationalen und Exponentialfunktionen.',
      'Average and local rate of change, derivative and differentiation rules, analysing graphs and modelling with power, polynomial and exponential functions.',
    ),
    parts: [
      {
        code: 'Q1.1',
        title: L('Ableitung und Ableitungsfunktion', 'The derivative and the derivative function'),
        summary: L(
          'Sekanten- und Tangentensteigung, Ableitung als lokale Änderungsrate, Ableitungsfunktion, Konstanten-, Potenz-, Faktor-, Summen-, Produkt- und Kettenregel; Ableitungsgraph aus dem Funktionsgraphen und umgekehrt.',
          'Secant and tangent slopes, the derivative as the local rate of change, the derivative function, constant, power, factor, sum, product and chain rules; derivative graph from the graph of the function and vice versa.',
        ),
        simulations: ['sekante-tangente', 'ableitungsfunktion', 'grenzverhalten', 'e-funktion'],
      },
      {
        code: 'Q1.2',
        title: L('Funktionsuntersuchung und Modellieren', 'Analysing functions and modelling'),
        summary: L(
          'Monotonie, Extrema und Wendepunkte, Rekonstruktion von Funktionsgleichungen und Extremalprobleme mit Potenz-, ganzrationalen und Exponentialfunktionen; LK: gebrochenrationale und weitere Funktionen, Asymptoten und Funktionenscharen.',
          'Monotonicity, extrema and inflection points, reconstructing equations and optimisation problems with power, polynomial and exponential functions; LK: rational and further functions, asymptotes and families of functions.',
        ),
        simulations: [
          'kurvendiskussion',
          'ganzrationale-funktionen',
          'potenzfunktionen',
          'transformationen',
          'parabel-drei-punkte',
          'extremwertprobleme',
          'polstellen-asymptoten',
          'funktionenscharen',
          'funktionsplotter',
        ],
      },
    ],
  },
  {
    code: 'Q2',
    title: L('2. Kurshalbjahr: Analysis (Integralrechnung) und Stochastik (Wahrscheinlichkeitsrechnung)', 'Second half-year: calculus (integral calculus) and probability'),
    summary: L(
      'Bestimmtes Integral, Hauptsatz und Stammfunktionen; Lage- und Streumaße, bedingte Wahrscheinlichkeit, Unabhängigkeit, Urnenmodell und Simulationen.',
      'The definite integral, the fundamental theorem and antiderivatives; measures of centre and spread, conditional probability, independence, urn models and simulations.',
    ),
    parts: [
      {
        code: 'Q2.1',
        title: L('Analysis (Integralrechnung)', 'Calculus (integral calculus)'),
        summary: L(
          'Bestände aus Änderungsraten rekonstruieren, Flächen mit bestimmten Integralen, Hauptsatz geometrisch begründen, Stammfunktionen; LK: ln als Stammfunktion von 1/x, uneigentliche Integrale und Rotationskörper.',
          'Reconstructing totals from rates of change, areas with definite integrals, justifying the fundamental theorem geometrically, antiderivatives; LK: ln as an antiderivative of 1/x, improper integrals and solids of revolution.',
        ),
        simulations: ['ober-untersummen', 'hauptsatz', 'stammfunktion-grafisch', 'aenderungsrate', 'logarithmus', 'umkehrfunktion'],
      },
      {
        code: 'Q2.2',
        title: L('Stochastik (Wahrscheinlichkeitsrechnung)', 'Probability'),
        summary: L(
          'Erhebungen auswerten, Baumdiagramm und Vierfeldertafel bei bedingten Wahrscheinlichkeiten, stochastische Unabhängigkeit, Urnenmodell mit und ohne Zurücklegen und Simulationen.',
          'Evaluating surveys, tree diagrams and two-way tables for conditional probabilities, stochastic independence, urn models with and without replacement and simulations.',
        ),
        simulations: ['vierfeldertafel', 'bedingte-wahrscheinlichkeit', 'ziegenproblem', 'geburtstagsproblem'],
      },
    ],
  },
];

/** Qualifikationsphase Q3 und Q4 und Zusatzkurse. */
const Q34_UNITS: CurriculumUnit[] = [
  {
    code: 'Q3',
    title: L('3. Kurshalbjahr: Analytische Geometrie', 'Third half-year: analytic geometry'),
    summary: L(
      'Koordinatisieren, Vektoren, Skalarprodukt, Geraden und Ebenen mit Lagebeziehungen, Winkeln und Abständen.',
      'Coordinates, vectors, the dot product, lines and planes with relative positions, angles and distances.',
    ),
    parts: [
      {
        code: 'Q3.1',
        title: L('Vektoren und Skalarprodukt', 'Vectors and the dot product'),
        summary: L(
          'Geometrische Sachverhalte koordinatisieren, mit Vektoren rechnen, auf Kollinearität prüfen und das Skalarprodukt für Längen und Winkel nutzen.',
          'Describing geometry with coordinates, calculating with vectors, testing for collinearity and using the dot product for lengths and angles.',
        ),
        simulations: ['koordinaten-3d', 'vektoren-3d', 'skalar-vektorprodukt'],
      },
      {
        code: 'Q3.2',
        title: L('Geraden und Ebenen', 'Lines and planes'),
        summary: L(
          'Geraden und Ebenen in Parameter-, Koordinaten- und Normalenform, Lagebeziehungen und Abstände; LK: auch Scharen und Abstände Punkt-Gerade und Gerade-Gerade.',
          'Lines and planes in parametric, coordinate and normal form, relative positions and distances; LK: also families and distances point–line and line–line.',
        ),
        simulations: ['geraden-ebenen', 'lage-abstaende'],
      },
    ],
  },
  {
    code: 'Q4',
    title: L('4. Kurshalbjahr: Analysis, Stochastik und Aufgaben aus allen Sachgebieten', 'Fourth half-year: calculus, probability and tasks from all areas'),
    summary: L(
      'Binomialverteilung mit Kenngrößen, Schluss von der Stichprobe auf die Gesamtheit, Hypothesentests (LK) und Normalverteilung (LK) sowie Vertiefung der Analysis.',
      'The binomial distribution with its parameters, inferring from the sample to the population, hypothesis tests (LK) and the normal distribution (LK), and further calculus.',
    ),
    parts: [
      {
        code: 'Q4.1',
        title: L('Analysis (Vertiefung)', 'Calculus (further study)'),
        summary: L(
          'Vertiefen und Verknüpfen der Differential- und Integralrechnung; LK: Rotationskörper und uneigentliche Integrale.',
          'Deepening and linking differential and integral calculus; LK: solids of revolution and improper integrals.',
        ),
        simulations: ['extremwertprobleme', 'rotationskoerper', 'funktionenscharen', 'hauptsatz'],
      },
      {
        code: 'Q4.2',
        title: L('Stochastik (Binomialverteilung, beurteilende Statistik)', 'Probability (binomial distribution, inferential statistics)'),
        summary: L(
          'Binomialverteilung mit Erwartungswert und Standardabweichung, k-σ-Intervalle und Signifikanzbegriff; LK: Hypothesentests mit Fehlern 1. und 2. Art, Glockenform der Normalverteilung.',
          'The binomial distribution with expected value and standard deviation, k-σ intervals and significance; LK: hypothesis tests with type I and type II errors, the bell shape of the normal distribution.',
        ),
        simulations: ['galtonbrett', 'binomialverteilung', 'signifikanztest', 'normalverteilung'],
      },
      {
        code: 'Q4.3',
        title: L('Komplexe Aufgabenstellungen aus allen drei Sachgebieten', 'Complex tasks from all three areas'),
        summary: L('Aufgaben, die Analysis, analytische Geometrie und Stochastik verknüpfen.', 'Tasks that link calculus, analytic geometry and probability.'),
      },
    ],
  },
  {
    code: 'Z',
    title: L('Zusatzkurse (Angebot der Schule)', 'Additional courses (offered by the school)'),
    summary: L(
      'Mögliche Zusatzkurse: nichteuklidische Geometrie, Logik, Zahlentheorie, numerische Mathematik, Differentialgleichungen, Folgen und Reihen mit Taylor-Reihen, Markowketten, Funktionentheorie, Kegelschnitte, Vertiefung der Analysis, Begründen und Beweisen.',
      'Possible additional courses: non-Euclidean geometry, logic, number theory, numerical mathematics, differential equations, sequences and series with Taylor series, Markov chains, complex analysis, conic sections, further calculus, reasoning and proof.',
    ),
    simulations: ['taylor-polynome'],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(mathematik, n, units),
});

/**
 * Mathematik am Gymnasium in Berlin (G8, Abitur nach Jahrgangsstufe 12) nach
 * - „Rahmenlehrplan für die Jahrgangsstufen 1–10, Teil C Mathematik“, LISUM, Senatsverwaltung
 *   für Bildung, Jugend und Familie Berlin und Ministerium für Bildung, Jugend und Sport Brandenburg,
 *   Berlin, Potsdam 2023 (in Berlin ab 1. August 2024 gültig, ab 2025/26 für alle Jahrgangsstufen 1–10), und
 * - „Rahmenlehrplan für die gymnasiale Oberstufe, Teil C Mathematik“, gültig ab 1. August 2014,
 *   mit dem Inkraftsetzungsblatt zu den Teilen A und B von 2022 (fachliche Vorgaben unverändert).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/berlin-gymnasium-mathematik.{json,md}.
 * Einordnung (Teil E): Sek. I nach der Zuordnung der Niveaustufen zu den Jahrgängen
 * (Gymnasium: 7 = E, 8 = F, 9 = G, 10 = H; 5 und 6 wie an weiterführenden Schulen ab Klasse 5),
 * Oberstufe nach Kurshalbjahren (Q1/Q2 = 11, Q3/Q4 = 12). Die Nummern sind selbst vergeben.
 *
 * Überschriften entsprechen den Rahmenlehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const berlinGymnasiumMathematik: StateCurriculum = {
  id: 'berlin-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('berlin-gymnasium', 'berlin-gymnasium'),
  state: L('Berlin', 'Berlin'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Rahmenlehrplan',
  grades: [
    grade(5, NOTE_5, niveauUnits(L('Niveaustufen C–D', 'levels C–D'), D_PARTS)),
    grade(6, NOTE_6, niveauUnits(L('Niveaustufe D, in Teilen E', 'level D, partly E'), D_PARTS)),
    grade(7, NOTE_7, niveauUnits(L('Niveaustufe E', 'level E'), E_PARTS)),
    grade(8, NOTE_8, niveauUnits(L('Niveaustufe F', 'level F'), F_PARTS)),
    grade(9, NOTE_9, niveauUnits(L('Niveaustufe G', 'level G'), G_PARTS)),
    grade(10, NOTE_10, niveauUnits(L('Niveaustufe H', 'level H'), H_PARTS)),
    grade(11, Q_11, Q12_UNITS),
    grade(12, Q_12, Q34_UNITS),
  ],
};
