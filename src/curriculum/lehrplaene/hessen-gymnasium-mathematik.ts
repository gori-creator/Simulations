import { L } from '../helpers';
import type { StateCurriculum } from './types';

/** Startseite des Hessischen Kultusministeriums; dort stehen die Kerncurricula (Sek. I und gymnasiale Oberstufe). */
const SOURCE = 'https://kultus.hessen.de';

// Hinweise je Jahrgangsstufe: Annahmen der Aufbereitung sichtbar machen (siehe docs/lehrplaene/hessen-gymnasium-mathematik.md, Teil E).
const sek1 = (from: number, to: number) =>
  L(
    `Doppeljahrgangsstufe ${from}/${to}: Das Kerncurriculum beschreibt, was am Ende von Jahrgangsstufe ${to} erreicht sein soll; die Lernbereiche stehen deshalb bei ${from} und ${to} gleich. Jede Simulation steht bei der Jahrgangsstufe, für die sie gedacht ist; bei der anderen führt ein Verweis dorthin. Die Nummern (Leitidee.Inhaltsfeld.Schwerpunkt) sind von uns vergeben.`,
    `Double grade ${from}/${to}: the core curriculum describes what should be achieved by the end of grade ${to}, so the units are the same for grades ${from} and ${to}. Each simulation is listed under the grade it is designed for; the other grade links to it. The numbers (guiding idea.content area.focus) are our own.`,
  );

const SEK1_5_6 = sek1(5, 6);
const SEK1_7_8 = sek1(7, 8);
const SEK1_9_10 = sek1(9, 10);

const E_PHASE = L(
  'Einführungsphase E1/E2 „Grundlagen der Analysis“. Verbindlich sind die Themenfelder E.1–E.5. Das Kerncurriculum nennt nur Kurshalbjahre; die Zuordnung zu Jahrgangsstufe 11 ist eine Annahme (G9).',
  'Introductory phase E1/E2 “Foundations of calculus”. Topic areas E.1–E.5 are mandatory. The core curriculum only names course half-years; assigning them to grade 11 is an assumption (G9).',
);

const Q1_Q2 = L(
  'Qualifikationsphase Q1 „Analysis“ und Q2 „Analytische Geometrie, Lineare Algebra und Vertiefung der Analysis“. Verbindlich sind Q1.1–Q1.3 und Q2.1–Q2.3. Die Zuordnung zu Jahrgangsstufe 12 ist eine Annahme (G9). „Nur LK“ kennzeichnet das erhöhte Niveau.',
  'Qualification phase Q1 “Calculus” and Q2 “Analytic geometry, linear algebra and further calculus”. Q1.1–Q1.3 and Q2.1–Q2.3 are mandatory. Assigning them to grade 12 is an assumption (G9). “Advanced course only” marks the higher level.',
);

const Q3_Q4 = L(
  'Qualifikationsphase Q3 „Stochastik“ und Q4 „Funktionenscharen, Problemlösen und Argumentieren“. Verbindlich sind Q3.1–Q3.2 (im Leistungskurs auch Q3.3) und Q4.1. Die Zuordnung zu Jahrgangsstufe 13 ist eine Annahme (G9). „Nur LK“ kennzeichnet das erhöhte Niveau.',
  'Qualification phase Q3 “Probability and statistics” and Q4 “Families of functions, problem solving and reasoning”. Q3.1–Q3.2 (in the advanced course also Q3.3) and Q4.1 are mandatory. Assigning them to grade 13 is an assumption (G9). “Advanced course only” marks the higher level.',
);

/**
 * Mathematik am hessischen Gymnasium nach den Kerncurricula des Landes Hessen:
 * „Bildungsstandards und Inhaltsfelder – Das neue Kerncurriculum für Hessen,
 * Sekundarstufe I – Gymnasium, Mathematik“ (Doppeljahrgangsstufen 5/6, 7/8, 9/10)
 * und „Kerncurriculum gymnasiale Oberstufe Mathematik“ (Ausgabe 2024, Stand 01.08.2025).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/hessen-gymnasium-mathematik.{json,md}.
 * Annahmen (Teil E): Die Sek-I-Lernbereiche sind nicht nummeriert – die Codes
 * (Leitidee.Inhaltsfeld.Schwerpunkt) sind selbst vergeben; Doppeljahrgangsstufen
 * stehen bei beiden Jahrgangsstufen. Die Oberstufe nennt nur Kurshalbjahre:
 * E = Jgst. 11, Q1/Q2 = 12, Q3/Q4 = 13 (G9-Zählung).
 *
 * Überschriften der Lernbereiche entsprechen dem Kerncurriculum; die
 * Kurzbeschreibungen sind eigene Zusammenfassungen. Verbindlich ist der
 * Originaltext.
 */
export const hessenGymnasiumMathematik: StateCurriculum = {
  id: 'hessen-gymnasium-mathematik',
  subject: 'mathematik',
  slug: L('hessen-gymnasium', 'hesse-gymnasium'),
  state: L('Hessen', 'Hesse'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Kerncurriculum',
  grades: [
    {
      grade: 5,
      sourceUrl: SOURCE,
      note: SEK1_5_6,
      units: [
        {
          code: '1.1',
          title: L('Zahlen', 'Numbers'),
          summary: L(
            'Aufbau tragfähiger Zahlvorstellungen: natürliche Zahlen, erste negative Zahlen, Brüche in ihren verschiedenen Bedeutungen und Dezimalbrüche. Zahlen werden verglichen, geordnet, gerundet und auf Teilbarkeit untersucht.',
            'Building solid number sense: natural numbers, first negative numbers, fractions in their different meanings and decimals. Numbers are compared, ordered, rounded and examined for divisibility.',
          ),
          parts: [
            {
              code: '1.1.1',
              title: L('Natürliche Zahlen', 'Natural numbers'),
              summary: L(
                'Große Zahlen im Stellenwertsystem lesen, schreiben und verstehen.',
                'Reading, writing and understanding large numbers in the place-value system.',
              ),
              simulations: ['stellenwerte'],
            },
            {
              code: '1.1.2',
              title: L('Vorstellungsaufbau im Bereich der negativen Zahlen', 'Building an understanding of negative numbers'),
              summary: L(
                'Erste Vorstellungen von Zahlen unter null, z. B. an Temperatur oder Kontostand.',
                'First ideas of numbers below zero, e.g. temperature or account balance.',
              ),
              simulations: ['zahlengerade'],
            },
            {
              code: '1.1.3',
              title: L(
                'Brüche als Teil eines Ganzen, als Teil mehrerer Ganzer, als Maßzahl und zur Beschreibung von Verhältnissen',
                'Fractions as part of a whole, as part of several wholes, as a measure and to describe ratios',
              ),
              summary: L(
                'Brüche in ihren unterschiedlichen Grundvorstellungen deuten und darstellen.',
                'Interpreting and representing fractions in their different basic meanings.',
              ),
            },
            {
              code: '1.1.4',
              title: L(
                'Dezimalbrüche (abbrechend, periodisch) und Begründung für Abbruch bzw. Periodizität',
                'Decimals (terminating, repeating) and reasons for termination or periodicity',
              ),
              summary: L(
                'Brüche in Dezimalschreibweise umwandeln und erklären, wann die Darstellung endet oder sich wiederholt.',
                'Converting fractions to decimals and explaining when the expansion terminates or repeats.',
              ),
            },
            {
              code: '1.1.5',
              title: L('Einfache Prozentangaben', 'Simple percentages'),
              summary: L(
                'Anteile als Prozentsätze verstehen und einfache Prozentangaben deuten.',
                'Understanding parts as percentages and interpreting simple percentage statements.',
              ),
            },
            {
              code: '1.1.6',
              title: L(
                'Vergleichen, Ordnen von natürlichen und gebrochenen Zahlen (gewöhnliche Brüche, Dezimalbrüche)',
                'Comparing and ordering natural numbers and fractions (common fractions, decimals)',
              ),
              summary: L(
                'Zahlen der Größe nach ordnen, auch über Erweitern und Kürzen.',
                'Ordering numbers by size, also by expanding and simplifying fractions.',
              ),
            },
            {
              code: '1.1.7',
              title: L('Runden von natürlichen Zahlen und Dezimalbrüchen', 'Rounding natural numbers and decimals'),
              summary: L('Zahlen sinnvoll auf eine Stelle runden.', 'Rounding numbers sensibly to a given place.'),
              simulations: ['stellenwerte'],
            },
            {
              code: '1.1.8',
              title: L('Teilbarkeit, Teiler und Vielfache (ggT, kgV, Primzahlen)', 'Divisibility, divisors and multiples (gcd, lcm, prime numbers)'),
              summary: L(
                'Teilbarkeitsregeln, Primzahlen sowie größter gemeinsamer Teiler und kleinstes gemeinsames Vielfaches.',
                'Divisibility rules, prime numbers, greatest common divisor and least common multiple.',
              ),
              simulations: ['primfaktoren'],
            },
            {
              code: '1.1.9',
              title: L('Darstellungen (Zahlenstrahl, Kreisdiagramm)', 'Representations (number ray, pie chart)'),
              summary: L(
                'Zahlen und Anteile am Zahlenstrahl und im Kreisdiagramm veranschaulichen.',
                'Visualising numbers and parts on the number ray and in pie charts.',
              ),
            },
          ],
        },
        {
          code: '1.2',
          title: L('Operationen und ihre Eigenschaften', 'Operations and their properties'),
          summary: L(
            'Sicheres Rechnen mit natürlichen Zahlen und Brüchen unter Nutzung der Rechengesetze sowie erste Grundaufgaben der Bruch- und Prozentrechnung.',
            'Confident calculation with natural numbers and fractions using the laws of arithmetic, plus first basic tasks with fractions and percentages.',
          ),
          parts: [
            {
              code: '1.2.1',
              title: L(
                'Grundrechenarten und Rechengesetze für natürliche und gebrochene Zahlen',
                'Basic operations and arithmetic laws for natural numbers and fractions',
              ),
              summary: L(
                'Die vier Grundrechenarten mit ganzen Zahlen und Brüchen ausführen und Gesetze wie Kommutativ- und Distributivgesetz nutzen.',
                'Carrying out the four basic operations with whole numbers and fractions and using laws such as commutativity and distributivity.',
              ),
              simulations: ['termbaum'],
            },
            {
              code: '1.2.2',
              title: L('Strategien zum vorteilhaften Rechnen', 'Strategies for efficient calculation'),
              summary: L(
                'Rechnungen geschickt umstellen und zusammenfassen, um einfacher zu rechnen.',
                'Rearranging and grouping calculations cleverly to make them easier.',
              ),
            },
            {
              code: '1.2.3',
              title: L('Grundaufgaben der Bruchrechnung und der Prozentrechnung', 'Basic tasks in fraction and percentage calculation'),
              summary: L(
                'Anteil, Ganzes und Teil bei Brüchen und Prozenten bestimmen.',
                'Finding part, whole and rate for fractions and percentages.',
              ),
            },
          ],
        },
        {
          code: '2.1',
          title: L('Ebene Figuren', 'Plane figures'),
          summary: L(
            'Grundfiguren wie Quadrat, Rechteck, Dreieck und Kreis erkennen, konstruieren und auf Symmetrie untersuchen; erste Orientierung im Koordinatensystem.',
            'Recognising, constructing and examining basic figures such as square, rectangle, triangle and circle for symmetry; first orientation in the coordinate system.',
          ),
          parts: [
            {
              code: '2.1.1',
              title: L(
                'Grundfiguren (Quadrat, Rechteck, Dreieck, Kreis) und zusammengesetzte Flächen',
                'Basic figures (square, rectangle, triangle, circle) and composite shapes',
              ),
              summary: L(
                'Grundfiguren benennen, beschreiben und zu neuen Flächen zusammensetzen.',
                'Naming and describing basic figures and combining them into new shapes.',
              ),
              simulations: ['umfang-flaeche'],
            },
            {
              code: '2.1.2',
              title: L('Konstruktion von Figuren und Mustern', 'Constructing figures and patterns'),
              summary: L(
                'Figuren und Muster mit Lineal, Geodreieck und Zirkel zeichnen.',
                'Drawing figures and patterns with ruler, set square and compass.',
              ),
            },
            {
              code: '2.1.3',
              title: L(
                'Symmetrieeigenschaften (Achsen- und Drehsymmetrie) von Grundfiguren',
                'Symmetry properties (line and rotational symmetry) of basic figures',
              ),
              summary: L(
                'Symmetrieachsen und Drehsymmetrie bei Grundfiguren erkennen und erzeugen.',
                'Recognising and creating lines of symmetry and rotational symmetry in basic figures.',
              ),
            },
            {
              code: '2.1.4',
              title: L('Kartesisches Koordinatensystem im ersten Quadranten', 'Cartesian coordinate system in the first quadrant'),
              summary: L('Punkte mit positiven Koordinaten eintragen und ablesen.', 'Plotting and reading points with positive coordinates.'),
              simulations: ['koordinaten-lage'],
            },
          ],
        },
        {
          code: '2.2',
          title: L('Körper', 'Solids'),
          summary: L(
            'Quader, Würfel und daraus zusammengesetzte Körper werden über Modelle, Schrägbilder und Netze erfasst; Volumen und Oberfläche werden beschrieben.',
            'Cuboids, cubes and composite solids are explored using models, oblique drawings and nets; volume and surface area are described.',
          ),
          parts: [
            {
              code: '2.2.1',
              title: L('Grundkörper (Quader, Würfel) und zusammengesetzte Körper', 'Basic solids (cuboid, cube) and composite solids'),
              summary: L(
                'Quader und Würfel erkennen und zusammengesetzte Körper beschreiben.',
                'Recognising cuboids and cubes and describing composite solids.',
              ),
            },
            {
              code: '2.2.2',
              title: L('Beschreibung von Volumen und Oberflächeninhalt der Grundkörper', 'Describing volume and surface area of the basic solids'),
              summary: L(
                'Rauminhalt mit Einheitswürfeln und Oberfläche über die Seitenflächen erfassen.',
                'Capturing volume with unit cubes and surface area via the faces.',
              ),
              simulations: ['koerpernetze'],
            },
            {
              code: '2.2.3',
              title: L('Modelle, Schrägbilder und Netze der Grundkörper', 'Models, oblique drawings and nets of the basic solids'),
              summary: L(
                'Körper bauen, im Schrägbild zeichnen und Netze falten bzw. erkennen.',
                'Building solids, drawing oblique views and folding or identifying nets.',
              ),
              simulations: ['koerpernetze'],
            },
          ],
        },
        {
          code: '2.3',
          title: L('Beziehungen zwischen geometrischen Objekten', 'Relationships between geometric objects'),
          summary: L(
            'Lagebeziehungen wie parallel und senkrecht sowie Abbildungen (Drehen, Spiegeln, Verschieben) von Figuren werden beschrieben.',
            'Positional relationships such as parallel and perpendicular, and mappings of figures (rotation, reflection, translation) are described.',
          ),
          parts: [
            {
              code: '2.3.1',
              title: L('Fachbegriffe parallel, senkrecht, Abstand', 'Technical terms parallel, perpendicular, distance'),
              summary: L(
                'Parallele und senkrechte Geraden erkennen, zeichnen und Abstände messen.',
                'Recognising and drawing parallel and perpendicular lines and measuring distances.',
              ),
              simulations: ['koordinaten-lage'],
            },
            {
              code: '2.3.2',
              title: L(
                'Bewegungen von Figuren: Drehungen, Spiegelungen, Verschiebungen',
                'Movements of figures: rotations, reflections, translations',
              ),
              summary: L(
                'Figuren drehen, spiegeln und verschieben und die Ergebnisse vergleichen.',
                'Rotating, reflecting and translating figures and comparing the results.',
              ),
            },
          ],
        },
        {
          code: '3.1',
          title: L('Umgang mit Größen', 'Working with quantities'),
          summary: L(
            'Aufbau von Größenvorstellungen, Schätzen und Überschlagen sowie Umrechnen von Einheiten mit Vorsilben.',
            'Developing a feel for quantities, estimating and approximating, and converting units with prefixes.',
          ),
          parts: [
            {
              code: '3.1.1',
              title: L('Größenvorstellungen', 'Sense of quantities'),
              summary: L(
                'Typische Repräsentanten für Längen, Massen, Zeiten usw. kennen.',
                'Knowing typical benchmarks for lengths, masses, times etc.',
              ),
            },
            {
              code: '3.1.2',
              title: L('Einheitsquadrat, Einheitswürfel', 'Unit square, unit cube'),
              summary: L(
                'Flächen und Rauminhalte durch Auslegen mit Einheitsquadraten bzw. -würfeln erfassen.',
                'Measuring areas and volumes by covering/filling with unit squares or cubes.',
              ),
              simulations: ['umfang-flaeche'],
            },
            {
              code: '3.1.3',
              title: L('Repräsentanten, Schätzungen und Überschlagsrechnungen', 'Benchmarks, estimates and rough calculations'),
              summary: L(
                'Größen begründet schätzen und Ergebnisse überschlagen.',
                'Estimating quantities with reasons and checking results by rough calculation.',
              ),
            },
            {
              code: '3.1.4',
              title: L('Runden', 'Rounding'),
              summary: L('Größenangaben situationsgerecht runden.', 'Rounding quantities appropriately for the situation.'),
              simulations: ['stellenwerte'],
            },
            {
              code: '3.1.5',
              title: L('Umrechnung von Größen', 'Converting quantities'),
              summary: L('Zwischen Einheiten einer Größe umrechnen.', 'Converting between units of one quantity.'),
              simulations: ['einheiten'],
            },
            {
              code: '3.1.6',
              title: L('Vorsilben von Einheiten', 'Unit prefixes'),
              summary: L(
                'Vorsilben wie Milli-, Zenti-, Kilo- verstehen und nutzen.',
                'Understanding and using prefixes such as milli-, centi-, kilo-.',
              ),
              simulations: ['einheiten', 'zehnerpotenzen'],
            },
          ],
        },
        {
          code: '3.2',
          title: L('Messvorgänge', 'Measuring processes'),
          summary: L(
            'Messen und Berechnen von Länge, Masse, Geld, Zeit und Winkel sowie Umfang, Fläche und Volumen einfacher Figuren und Körper.',
            'Measuring and calculating length, mass, money, time and angle as well as perimeter, area and volume of simple figures and solids.',
          ),
          parts: [
            {
              code: '3.2.1',
              title: L('Länge', 'Length'),
              summary: L(
                'Längen messen, umrechnen und z. B. auf Karten mit Maßstab bestimmen.',
                'Measuring and converting lengths, e.g. on maps with a scale.',
              ),
              simulations: ['einheiten', 'massstab'],
            },
            {
              code: '3.2.2',
              title: L('Masse/Gewichte', 'Mass/weights'),
              summary: L('Massen messen und in passenden Einheiten angeben.', 'Measuring masses and stating them in suitable units.'),
              simulations: ['einheiten'],
            },
            {
              code: '3.2.3',
              title: L('Währung/Geld', 'Currency/money'),
              summary: L('Mit Geldbeträgen in Euro und Cent rechnen.', 'Calculating with amounts of money in euros and cents.'),
            },
            {
              code: '3.2.4',
              title: L('Zeitspanne', 'Time span'),
              summary: L('Zeitpunkte und Zeitspannen unterscheiden und berechnen.', 'Distinguishing and calculating points in time and time spans.'),
            },
            {
              code: '3.2.5',
              title: L('Winkel', 'Angle'),
              summary: L('Winkel schätzen, messen und zeichnen.', 'Estimating, measuring and drawing angles.'),
              simulations: ['winkel-messen'],
            },
            {
              code: '3.2.6',
              title: L('Flächeninhalt und Umfang von Quadrat und Rechteck', 'Area and perimeter of square and rectangle'),
              summary: L('Umfang und Flächeninhalt von Rechteck und Quadrat bestimmen.', 'Finding perimeter and area of rectangles and squares.'),
              simulations: ['umfang-flaeche'],
            },
            {
              code: '3.2.7',
              title: L('Volumen und Oberflächeninhalt der Grundkörper', 'Volume and surface area of the basic solids'),
              summary: L('Volumen und Oberfläche von Quader und Würfel berechnen.', 'Calculating volume and surface area of cuboids and cubes.'),
              simulations: ['koerpernetze'],
            },
          ],
        },
        {
          code: '4.1',
          title: L('Zuordnungen und ihre Darstellungen', 'Assignments (mappings) and their representations'),
          summary: L(
            'Erste Erfahrungen mit Zuordnungen zwischen Größen und deren Darstellung in Worten, Tabellen und Schaubildern.',
            'First experiences with assignments between quantities and representing them in words, tables and charts.',
          ),
          parts: [
            {
              code: '4.1.1',
              title: L('Grundvorstellungen zu Zuordnungen von Größen', 'Basic ideas of assigning quantities'),
              summary: L(
                'Verstehen, dass einer Größe eine andere zugeordnet wird (z. B. Menge → Preis).',
                'Understanding that one quantity is assigned to another (e.g. amount → price).',
              ),
            },
            {
              code: '4.1.2',
              title: L(
                'Darstellung der Zuordnungen in Schaubildern und Tabellen und in sprachlicher Form',
                'Representing assignments in charts, tables and in words',
              ),
              summary: L(
                'Zuordnungen in Tabellen, Schaubildern und mit Worten beschreiben.',
                'Describing assignments in tables, charts and in words.',
              ),
            },
          ],
        },
        {
          code: '5.1',
          title: L('Statistische Erhebungen und ihre Auswertung', 'Statistical surveys and their evaluation'),
          summary: L(
            'Eigene Umfragen planen und auswerten, Daten in Listen und Diagrammen darstellen und mit einfachen Kenngrößen beschreiben.',
            'Planning and evaluating own surveys, presenting data in lists and diagrams and describing them with simple statistics.',
          ),
          parts: [
            {
              code: '5.1.1',
              title: L(
                'Umfragen und Erhebungen (Planung, Durchführung und statistische Auswertung)',
                'Surveys and data collection (planning, carrying out and statistical evaluation)',
              ),
              summary: L(
                'Eine Datenerhebung von der Frage bis zur Auswertung durchführen.',
                'Carrying out a data collection from the question to the evaluation.',
              ),
            },
            {
              code: '5.1.2',
              title: L(
                'Kenngrößen (Häufigkeiten, Median, arithmetisches Mittel, Spannweite)',
                'Statistics (frequencies, median, arithmetic mean, range)',
              ),
              summary: L(
                'Häufigkeiten, Mittelwert, Median und Spannweite bestimmen und deuten.',
                'Determining and interpreting frequencies, mean, median and range.',
              ),
            },
            {
              code: '5.1.3',
              title: L('Darstellung von Daten (Listen und Diagramme)', 'Presenting data (lists and diagrams)'),
              summary: L(
                'Daten in Strichlisten, Tabellen und Diagrammen darstellen und ablesen.',
                'Presenting and reading data in tally charts, tables and diagrams.',
              ),
            },
          ],
        },
        {
          code: '5.2',
          title: L('Umgang mit dem Zufall', 'Dealing with chance'),
          summary: L(
            'Zufall im Alltag erkennen und erste Wahrscheinlichkeitsvorstellungen über Häufigkeiten aufbauen.',
            'Recognising chance in everyday life and building first ideas of probability via frequencies.',
          ),
          parts: [
            {
              code: '5.2.1',
              title: L('Zufallserscheinungen in alltäglichen Situationen', 'Random phenomena in everyday situations'),
              summary: L('Zufällige Ereignisse im Alltag erkennen und beschreiben.', 'Recognising and describing random events in everyday life.'),
            },
            {
              code: '5.2.2',
              title: L('Verschiedene Vorstellungen vom Wahrscheinlichkeitsbegriff', 'Different notions of probability'),
              summary: L(
                'Wahrscheinlichkeit als Erwartung (Symmetrie) und als langfristige relative Häufigkeit kennenlernen.',
                'Getting to know probability as expectation (symmetry) and as long-run relative frequency.',
              ),
            },
            {
              code: '5.2.3',
              title: L('Absolute und relative Häufigkeiten', 'Absolute and relative frequencies'),
              summary: L(
                'Häufigkeiten aus Versuchen bestimmen und als Anteil angeben.',
                'Determining frequencies from experiments and stating them as proportions.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 6,
      sourceUrl: SOURCE,
      note: SEK1_5_6,
      units: [
        {
          code: '1.1',
          title: L('Zahlen', 'Numbers'),
          summary: L(
            'Aufbau tragfähiger Zahlvorstellungen: natürliche Zahlen, erste negative Zahlen, Brüche in ihren verschiedenen Bedeutungen und Dezimalbrüche. Zahlen werden verglichen, geordnet, gerundet und auf Teilbarkeit untersucht.',
            'Building solid number sense: natural numbers, first negative numbers, fractions in their different meanings and decimals. Numbers are compared, ordered, rounded and examined for divisibility.',
          ),
          parts: [
            {
              code: '1.1.1',
              title: L('Natürliche Zahlen', 'Natural numbers'),
              summary: L(
                'Große Zahlen im Stellenwertsystem lesen, schreiben und verstehen.',
                'Reading, writing and understanding large numbers in the place-value system.',
              ),
            },
            {
              code: '1.1.2',
              title: L('Vorstellungsaufbau im Bereich der negativen Zahlen', 'Building an understanding of negative numbers'),
              summary: L(
                'Erste Vorstellungen von Zahlen unter null, z. B. an Temperatur oder Kontostand.',
                'First ideas of numbers below zero, e.g. temperature or account balance.',
              ),
            },
            {
              code: '1.1.3',
              title: L(
                'Brüche als Teil eines Ganzen, als Teil mehrerer Ganzer, als Maßzahl und zur Beschreibung von Verhältnissen',
                'Fractions as part of a whole, as part of several wholes, as a measure and to describe ratios',
              ),
              summary: L(
                'Brüche in ihren unterschiedlichen Grundvorstellungen deuten und darstellen.',
                'Interpreting and representing fractions in their different basic meanings.',
              ),
              simulations: ['bruchteile'],
            },
            {
              code: '1.1.4',
              title: L(
                'Dezimalbrüche (abbrechend, periodisch) und Begründung für Abbruch bzw. Periodizität',
                'Decimals (terminating, repeating) and reasons for termination or periodicity',
              ),
              summary: L(
                'Brüche in Dezimalschreibweise umwandeln und erklären, wann die Darstellung endet oder sich wiederholt.',
                'Converting fractions to decimals and explaining when the expansion terminates or repeats.',
              ),
              simulations: ['dezimalbrueche'],
            },
            {
              code: '1.1.5',
              title: L('Einfache Prozentangaben', 'Simple percentages'),
              summary: L(
                'Anteile als Prozentsätze verstehen und einfache Prozentangaben deuten.',
                'Understanding parts as percentages and interpreting simple percentage statements.',
              ),
              simulations: ['prozentstreifen'],
            },
            {
              code: '1.1.6',
              title: L(
                'Vergleichen, Ordnen von natürlichen und gebrochenen Zahlen (gewöhnliche Brüche, Dezimalbrüche)',
                'Comparing and ordering natural numbers and fractions (common fractions, decimals)',
              ),
              summary: L(
                'Zahlen der Größe nach ordnen, auch über Erweitern und Kürzen.',
                'Ordering numbers by size, also by expanding and simplifying fractions.',
              ),
              simulations: ['brueche-vergleichen'],
            },
            {
              code: '1.1.7',
              title: L('Runden von natürlichen Zahlen und Dezimalbrüchen', 'Rounding natural numbers and decimals'),
              summary: L('Zahlen sinnvoll auf eine Stelle runden.', 'Rounding numbers sensibly to a given place.'),
            },
            {
              code: '1.1.8',
              title: L('Teilbarkeit, Teiler und Vielfache (ggT, kgV, Primzahlen)', 'Divisibility, divisors and multiples (gcd, lcm, prime numbers)'),
              summary: L(
                'Teilbarkeitsregeln, Primzahlen sowie größter gemeinsamer Teiler und kleinstes gemeinsames Vielfaches.',
                'Divisibility rules, prime numbers, greatest common divisor and least common multiple.',
              ),
              simulations: ['primfaktoren'],
            },
            {
              code: '1.1.9',
              title: L('Darstellungen (Zahlenstrahl, Kreisdiagramm)', 'Representations (number ray, pie chart)'),
              summary: L(
                'Zahlen und Anteile am Zahlenstrahl und im Kreisdiagramm veranschaulichen.',
                'Visualising numbers and parts on the number ray and in pie charts.',
              ),
            },
          ],
        },
        {
          code: '1.2',
          title: L('Operationen und ihre Eigenschaften', 'Operations and their properties'),
          summary: L(
            'Sicheres Rechnen mit natürlichen Zahlen und Brüchen unter Nutzung der Rechengesetze sowie erste Grundaufgaben der Bruch- und Prozentrechnung.',
            'Confident calculation with natural numbers and fractions using the laws of arithmetic, plus first basic tasks with fractions and percentages.',
          ),
          parts: [
            {
              code: '1.2.1',
              title: L(
                'Grundrechenarten und Rechengesetze für natürliche und gebrochene Zahlen',
                'Basic operations and arithmetic laws for natural numbers and fractions',
              ),
              summary: L(
                'Die vier Grundrechenarten mit ganzen Zahlen und Brüchen ausführen und Gesetze wie Kommutativ- und Distributivgesetz nutzen.',
                'Carrying out the four basic operations with whole numbers and fractions and using laws such as commutativity and distributivity.',
              ),
              simulations: ['brueche-rechnen', 'termbaum'],
            },
            {
              code: '1.2.2',
              title: L('Strategien zum vorteilhaften Rechnen', 'Strategies for efficient calculation'),
              summary: L(
                'Rechnungen geschickt umstellen und zusammenfassen, um einfacher zu rechnen.',
                'Rearranging and grouping calculations cleverly to make them easier.',
              ),
            },
            {
              code: '1.2.3',
              title: L('Grundaufgaben der Bruchrechnung und der Prozentrechnung', 'Basic tasks in fraction and percentage calculation'),
              summary: L(
                'Anteil, Ganzes und Teil bei Brüchen und Prozenten bestimmen.',
                'Finding part, whole and rate for fractions and percentages.',
              ),
              simulations: ['brueche-rechnen', 'prozentstreifen'],
            },
          ],
        },
        {
          code: '2.1',
          title: L('Ebene Figuren', 'Plane figures'),
          summary: L(
            'Grundfiguren wie Quadrat, Rechteck, Dreieck und Kreis erkennen, konstruieren und auf Symmetrie untersuchen; erste Orientierung im Koordinatensystem.',
            'Recognising, constructing and examining basic figures such as square, rectangle, triangle and circle for symmetry; first orientation in the coordinate system.',
          ),
          parts: [
            {
              code: '2.1.1',
              title: L(
                'Grundfiguren (Quadrat, Rechteck, Dreieck, Kreis) und zusammengesetzte Flächen',
                'Basic figures (square, rectangle, triangle, circle) and composite shapes',
              ),
              summary: L(
                'Grundfiguren benennen, beschreiben und zu neuen Flächen zusammensetzen.',
                'Naming and describing basic figures and combining them into new shapes.',
              ),
            },
            {
              code: '2.1.2',
              title: L('Konstruktion von Figuren und Mustern', 'Constructing figures and patterns'),
              summary: L(
                'Figuren und Muster mit Lineal, Geodreieck und Zirkel zeichnen.',
                'Drawing figures and patterns with ruler, set square and compass.',
              ),
            },
            {
              code: '2.1.3',
              title: L(
                'Symmetrieeigenschaften (Achsen- und Drehsymmetrie) von Grundfiguren',
                'Symmetry properties (line and rotational symmetry) of basic figures',
              ),
              summary: L(
                'Symmetrieachsen und Drehsymmetrie bei Grundfiguren erkennen und erzeugen.',
                'Recognising and creating lines of symmetry and rotational symmetry in basic figures.',
              ),
              simulations: ['spiegelung'],
            },
            {
              code: '2.1.4',
              title: L('Kartesisches Koordinatensystem im ersten Quadranten', 'Cartesian coordinate system in the first quadrant'),
              summary: L('Punkte mit positiven Koordinaten eintragen und ablesen.', 'Plotting and reading points with positive coordinates.'),
            },
          ],
        },
        {
          code: '2.2',
          title: L('Körper', 'Solids'),
          summary: L(
            'Quader, Würfel und daraus zusammengesetzte Körper werden über Modelle, Schrägbilder und Netze erfasst; Volumen und Oberfläche werden beschrieben.',
            'Cuboids, cubes and composite solids are explored using models, oblique drawings and nets; volume and surface area are described.',
          ),
          parts: [
            {
              code: '2.2.1',
              title: L('Grundkörper (Quader, Würfel) und zusammengesetzte Körper', 'Basic solids (cuboid, cube) and composite solids'),
              summary: L(
                'Quader und Würfel erkennen und zusammengesetzte Körper beschreiben.',
                'Recognising cuboids and cubes and describing composite solids.',
              ),
              simulations: ['quader-volumen'],
            },
            {
              code: '2.2.2',
              title: L('Beschreibung von Volumen und Oberflächeninhalt der Grundkörper', 'Describing volume and surface area of the basic solids'),
              summary: L(
                'Rauminhalt mit Einheitswürfeln und Oberfläche über die Seitenflächen erfassen.',
                'Capturing volume with unit cubes and surface area via the faces.',
              ),
              simulations: ['quader-volumen', 'koerpernetze'],
            },
            {
              code: '2.2.3',
              title: L('Modelle, Schrägbilder und Netze der Grundkörper', 'Models, oblique drawings and nets of the basic solids'),
              summary: L(
                'Körper bauen, im Schrägbild zeichnen und Netze falten bzw. erkennen.',
                'Building solids, drawing oblique views and folding or identifying nets.',
              ),
              simulations: ['koerpernetze'],
            },
          ],
        },
        {
          code: '2.3',
          title: L('Beziehungen zwischen geometrischen Objekten', 'Relationships between geometric objects'),
          summary: L(
            'Lagebeziehungen wie parallel und senkrecht sowie Abbildungen (Drehen, Spiegeln, Verschieben) von Figuren werden beschrieben.',
            'Positional relationships such as parallel and perpendicular, and mappings of figures (rotation, reflection, translation) are described.',
          ),
          parts: [
            {
              code: '2.3.1',
              title: L('Fachbegriffe parallel, senkrecht, Abstand', 'Technical terms parallel, perpendicular, distance'),
              summary: L(
                'Parallele und senkrechte Geraden erkennen, zeichnen und Abstände messen.',
                'Recognising and drawing parallel and perpendicular lines and measuring distances.',
              ),
            },
            {
              code: '2.3.2',
              title: L(
                'Bewegungen von Figuren: Drehungen, Spiegelungen, Verschiebungen',
                'Movements of figures: rotations, reflections, translations',
              ),
              summary: L(
                'Figuren drehen, spiegeln und verschieben und die Ergebnisse vergleichen.',
                'Rotating, reflecting and translating figures and comparing the results.',
              ),
              simulations: ['spiegelung'],
            },
          ],
        },
        {
          code: '3.1',
          title: L('Umgang mit Größen', 'Working with quantities'),
          summary: L(
            'Aufbau von Größenvorstellungen, Schätzen und Überschlagen sowie Umrechnen von Einheiten mit Vorsilben.',
            'Developing a feel for quantities, estimating and approximating, and converting units with prefixes.',
          ),
          parts: [
            {
              code: '3.1.1',
              title: L('Größenvorstellungen', 'Sense of quantities'),
              summary: L(
                'Typische Repräsentanten für Längen, Massen, Zeiten usw. kennen.',
                'Knowing typical benchmarks for lengths, masses, times etc.',
              ),
            },
            {
              code: '3.1.2',
              title: L('Einheitsquadrat, Einheitswürfel', 'Unit square, unit cube'),
              summary: L(
                'Flächen und Rauminhalte durch Auslegen mit Einheitsquadraten bzw. -würfeln erfassen.',
                'Measuring areas and volumes by covering/filling with unit squares or cubes.',
              ),
              simulations: ['quader-volumen'],
            },
            {
              code: '3.1.3',
              title: L('Repräsentanten, Schätzungen und Überschlagsrechnungen', 'Benchmarks, estimates and rough calculations'),
              summary: L(
                'Größen begründet schätzen und Ergebnisse überschlagen.',
                'Estimating quantities with reasons and checking results by rough calculation.',
              ),
            },
            {
              code: '3.1.4',
              title: L('Runden', 'Rounding'),
              summary: L('Größenangaben situationsgerecht runden.', 'Rounding quantities appropriately for the situation.'),
            },
            {
              code: '3.1.5',
              title: L('Umrechnung von Größen', 'Converting quantities'),
              summary: L('Zwischen Einheiten einer Größe umrechnen.', 'Converting between units of one quantity.'),
            },
            {
              code: '3.1.6',
              title: L('Vorsilben von Einheiten', 'Unit prefixes'),
              summary: L(
                'Vorsilben wie Milli-, Zenti-, Kilo- verstehen und nutzen.',
                'Understanding and using prefixes such as milli-, centi-, kilo-.',
              ),
              simulations: ['zehnerpotenzen'],
            },
          ],
        },
        {
          code: '3.2',
          title: L('Messvorgänge', 'Measuring processes'),
          summary: L(
            'Messen und Berechnen von Länge, Masse, Geld, Zeit und Winkel sowie Umfang, Fläche und Volumen einfacher Figuren und Körper.',
            'Measuring and calculating length, mass, money, time and angle as well as perimeter, area and volume of simple figures and solids.',
          ),
          parts: [
            {
              code: '3.2.1',
              title: L('Länge', 'Length'),
              summary: L(
                'Längen messen, umrechnen und z. B. auf Karten mit Maßstab bestimmen.',
                'Measuring and converting lengths, e.g. on maps with a scale.',
              ),
            },
            {
              code: '3.2.2',
              title: L('Masse/Gewichte', 'Mass/weights'),
              summary: L('Massen messen und in passenden Einheiten angeben.', 'Measuring masses and stating them in suitable units.'),
            },
            {
              code: '3.2.3',
              title: L('Währung/Geld', 'Currency/money'),
              summary: L('Mit Geldbeträgen in Euro und Cent rechnen.', 'Calculating with amounts of money in euros and cents.'),
            },
            {
              code: '3.2.4',
              title: L('Zeitspanne', 'Time span'),
              summary: L('Zeitpunkte und Zeitspannen unterscheiden und berechnen.', 'Distinguishing and calculating points in time and time spans.'),
            },
            {
              code: '3.2.5',
              title: L('Winkel', 'Angle'),
              summary: L('Winkel schätzen, messen und zeichnen.', 'Estimating, measuring and drawing angles.'),
            },
            {
              code: '3.2.6',
              title: L('Flächeninhalt und Umfang von Quadrat und Rechteck', 'Area and perimeter of square and rectangle'),
              summary: L('Umfang und Flächeninhalt von Rechteck und Quadrat bestimmen.', 'Finding perimeter and area of rectangles and squares.'),
            },
            {
              code: '3.2.7',
              title: L('Volumen und Oberflächeninhalt der Grundkörper', 'Volume and surface area of the basic solids'),
              summary: L('Volumen und Oberfläche von Quader und Würfel berechnen.', 'Calculating volume and surface area of cuboids and cubes.'),
              simulations: ['quader-volumen', 'koerpernetze'],
            },
          ],
        },
        {
          code: '4.1',
          title: L('Zuordnungen und ihre Darstellungen', 'Assignments (mappings) and their representations'),
          summary: L(
            'Erste Erfahrungen mit Zuordnungen zwischen Größen und deren Darstellung in Worten, Tabellen und Schaubildern.',
            'First experiences with assignments between quantities and representing them in words, tables and charts.',
          ),
          parts: [
            {
              code: '4.1.1',
              title: L('Grundvorstellungen zu Zuordnungen von Größen', 'Basic ideas of assigning quantities'),
              summary: L(
                'Verstehen, dass einer Größe eine andere zugeordnet wird (z. B. Menge → Preis).',
                'Understanding that one quantity is assigned to another (e.g. amount → price).',
              ),
            },
            {
              code: '4.1.2',
              title: L(
                'Darstellung der Zuordnungen in Schaubildern und Tabellen und in sprachlicher Form',
                'Representing assignments in charts, tables and in words',
              ),
              summary: L(
                'Zuordnungen in Tabellen, Schaubildern und mit Worten beschreiben.',
                'Describing assignments in tables, charts and in words.',
              ),
            },
          ],
        },
        {
          code: '5.1',
          title: L('Statistische Erhebungen und ihre Auswertung', 'Statistical surveys and their evaluation'),
          summary: L(
            'Eigene Umfragen planen und auswerten, Daten in Listen und Diagrammen darstellen und mit einfachen Kenngrößen beschreiben.',
            'Planning and evaluating own surveys, presenting data in lists and diagrams and describing them with simple statistics.',
          ),
          parts: [
            {
              code: '5.1.1',
              title: L(
                'Umfragen und Erhebungen (Planung, Durchführung und statistische Auswertung)',
                'Surveys and data collection (planning, carrying out and statistical evaluation)',
              ),
              summary: L(
                'Eine Datenerhebung von der Frage bis zur Auswertung durchführen.',
                'Carrying out a data collection from the question to the evaluation.',
              ),
            },
            {
              code: '5.1.2',
              title: L(
                'Kenngrößen (Häufigkeiten, Median, arithmetisches Mittel, Spannweite)',
                'Statistics (frequencies, median, arithmetic mean, range)',
              ),
              summary: L(
                'Häufigkeiten, Mittelwert, Median und Spannweite bestimmen und deuten.',
                'Determining and interpreting frequencies, mean, median and range.',
              ),
              simulations: ['boxplot'],
            },
            {
              code: '5.1.3',
              title: L('Darstellung von Daten (Listen und Diagramme)', 'Presenting data (lists and diagrams)'),
              summary: L(
                'Daten in Strichlisten, Tabellen und Diagrammen darstellen und ablesen.',
                'Presenting and reading data in tally charts, tables and diagrams.',
              ),
              simulations: ['diagramme'],
            },
          ],
        },
        {
          code: '5.2',
          title: L('Umgang mit dem Zufall', 'Dealing with chance'),
          summary: L(
            'Zufall im Alltag erkennen und erste Wahrscheinlichkeitsvorstellungen über Häufigkeiten aufbauen.',
            'Recognising chance in everyday life and building first ideas of probability via frequencies.',
          ),
          parts: [
            {
              code: '5.2.1',
              title: L('Zufallserscheinungen in alltäglichen Situationen', 'Random phenomena in everyday situations'),
              summary: L('Zufällige Ereignisse im Alltag erkennen und beschreiben.', 'Recognising and describing random events in everyday life.'),
            },
            {
              code: '5.2.2',
              title: L('Verschiedene Vorstellungen vom Wahrscheinlichkeitsbegriff', 'Different notions of probability'),
              summary: L(
                'Wahrscheinlichkeit als Erwartung (Symmetrie) und als langfristige relative Häufigkeit kennenlernen.',
                'Getting to know probability as expectation (symmetry) and as long-run relative frequency.',
              ),
              simulations: ['gesetz-grosse-zahlen'],
            },
            {
              code: '5.2.3',
              title: L('Absolute und relative Häufigkeiten', 'Absolute and relative frequencies'),
              summary: L(
                'Häufigkeiten aus Versuchen bestimmen und als Anteil angeben.',
                'Determining frequencies from experiments and stating them as proportions.',
              ),
              simulations: ['gesetz-grosse-zahlen'],
            },
          ],
        },
      ],
    },
    {
      grade: 7,
      sourceUrl: SOURCE,
      note: SEK1_7_8,
      units: [
        {
          code: '1.1',
          title: L('Zahlen', 'Numbers'),
          summary: L(
            'Erweiterung auf rationale und reelle Zahlen (Wurzeln, π); Zahlen werden an der Zahlengeraden und als Dezimalbrüche dargestellt, verglichen und gerundet; Orientierung im ganzen Koordinatensystem.',
            'Extension to rational and real numbers (roots, π); numbers are shown on the number line and as decimals, compared and rounded; orientation in the full coordinate system.',
          ),
          parts: [
            {
              code: '1.1.1',
              title: L('Rationale Zahlen', 'Rational numbers'),
              summary: L(
                'Positive und negative Brüche und Dezimalzahlen als ein Zahlbereich.',
                'Positive and negative fractions and decimals as one number set.',
              ),
            },
            {
              code: '1.1.2',
              title: L(
                'Reelle Zahlen (Wurzeln und die Zahl π als Proportionalitätsfaktor)',
                'Real numbers (roots and the number π as a proportionality factor)',
              ),
              summary: L(
                'Irrationale Zahlen wie Quadratwurzeln und π kennenlernen und näherungsweise bestimmen.',
                'Getting to know irrational numbers such as square roots and π and approximating them.',
              ),
            },
            {
              code: '1.1.3',
              title: L('Darstellungen (Zahlengerade, Dezimalbrüche)', 'Representations (number line, decimals)'),
              summary: L(
                'Rationale und reelle Zahlen an der Zahlengeraden und in Dezimalschreibweise darstellen.',
                'Representing rational and real numbers on the number line and in decimal notation.',
              ),
            },
            {
              code: '1.1.4',
              title: L(
                'Vergleichen, Ordnen und Runden von rationalen und reellen Zahlen',
                'Comparing, ordering and rounding rational and real numbers',
              ),
              summary: L('Zahlen beider Vorzeichen ordnen und sinnvoll runden.', 'Ordering numbers of both signs and rounding sensibly.'),
            },
            {
              code: '1.1.5',
              title: L('Orientierung im zweidimensionalen Koordinatensystem', 'Orientation in the two-dimensional coordinate system'),
              summary: L('Punkte in allen vier Quadranten eintragen und ablesen.', 'Plotting and reading points in all four quadrants.'),
            },
          ],
        },
        {
          code: '1.2',
          title: L('Operationen und ihre Eigenschaften', 'Operations and their properties'),
          summary: L(
            'Rechnen mit rationalen und reellen Zahlen, Terme mit Variablen und Klammern umformen, Potenzen sowie Prozent- und Zinsrechnung in Sachsituationen.',
            'Calculating with rational and real numbers, transforming terms with variables and brackets, powers, and percentage and interest calculations in real-life contexts.',
          ),
          parts: [
            {
              code: '1.2.1',
              title: L(
                'Rechenverfahren, Rechengesetze und deren Verknüpfungen im Bereich der rationalen und reellen Zahlen',
                'Calculation methods, arithmetic laws and their combination for rational and real numbers',
              ),
              summary: L('Vorzeichenregeln und Rechengesetze sicher anwenden.', 'Applying sign rules and arithmetic laws confidently.'),
            },
            {
              code: '1.2.2',
              title: L('Klammern, Binome', 'Brackets, binomials'),
              summary: L(
                'Klammern auflösen, ausklammern und binomische Formeln nutzen.',
                'Expanding and factorising brackets and using the binomial formulas.',
              ),
              simulations: ['binomische-formeln', 'termbaum'],
            },
            {
              code: '1.2.3',
              title: L('Potenzen mit rationalen Exponenten', 'Powers with rational exponents'),
              summary: L(
                'Potenzschreibweise auf negative und gebrochene Exponenten ausweiten.',
                'Extending power notation to negative and fractional exponents.',
              ),
            },
            {
              code: '1.2.4',
              title: L('Terme und Variable', 'Terms and variables'),
              summary: L(
                'Terme mit Variablen aufstellen, strukturieren und umformen.',
                'Setting up, structuring and transforming terms with variables.',
              ),
              simulations: ['termbaum'],
            },
            {
              code: '1.2.5',
              title: L('Grundaufgaben der Prozent- und Zinsrechnung', 'Basic tasks of percentage and interest calculation'),
              summary: L('Grundwert, Prozentwert, Prozentsatz und Zinsen berechnen.', 'Calculating base value, percentage value, rate and interest.'),
              simulations: ['prozentstreifen'],
            },
            {
              code: '1.2.6',
              title: L('Prozentrechnen mit erhöhtem und vermindertem Grundwert', 'Percentages with increased and decreased base value'),
              summary: L(
                'Preiserhöhungen und Rabatte über Wachstums- bzw. Abnahmefaktoren berechnen.',
                'Calculating price increases and discounts using growth or decay factors.',
              ),
              simulations: ['prozentstreifen'],
            },
            {
              code: '1.2.7',
              title: L('Prozente von Prozenten', 'Percentages of percentages'),
              summary: L('Mehrere prozentuale Änderungen nacheinander verknüpfen.', 'Combining several successive percentage changes.'),
            },
          ],
        },
        {
          code: '2.1',
          title: L('Ebene Figuren', 'Plane figures'),
          summary: L(
            'Vierecke und Kreis werden klassifiziert und konstruiert, auch mit dynamischer Geometriesoftware; Symmetrie und alle vier Quadranten des Koordinatensystems.',
            'Quadrilaterals and circles are classified and constructed, also with dynamic geometry software; symmetry and all four quadrants of the coordinate system.',
          ),
          parts: [
            {
              code: '2.1.1',
              title: L(
                'Grundfiguren (Parallelogramm, Trapez, Raute, Drachen, Kreis)',
                'Basic figures (parallelogram, trapezium, rhombus, kite, circle)',
              ),
              summary: L('Weitere Grundfiguren und ihre Eigenschaften kennenlernen.', 'Getting to know further basic figures and their properties.'),
              simulations: ['vierecke'],
            },
            {
              code: '2.1.2',
              title: L('Haus der Vierecke', 'Hierarchy of quadrilaterals'),
              summary: L(
                'Vierecke nach Eigenschaften ordnen und Beziehungen zwischen ihnen begründen.',
                'Ordering quadrilaterals by properties and justifying relationships between them.',
              ),
              simulations: ['vierecke'],
            },
            {
              code: '2.1.3',
              title: L(
                'Konstruktionen mit Zeichengeräten und dynamischer Geometriesoftware',
                'Constructions with drawing instruments and dynamic geometry software',
              ),
              summary: L(
                'Dreiecke, Mittelsenkrechten, Winkelhalbierende u. a. konstruieren.',
                'Constructing triangles, perpendicular bisectors, angle bisectors and more.',
              ),
              simulations: ['dreieckskonstruktion', 'mittelsenkrechte', 'besondere-linien'],
            },
            {
              code: '2.1.4',
              title: L('Symmetrieeigenschaften von Figuren', 'Symmetry properties of figures'),
              summary: L('Achsen- und Punktsymmetrie von Figuren untersuchen.', 'Examining line and point symmetry of figures.'),
              simulations: ['spiegelung'],
            },
            {
              code: '2.1.5',
              title: L('Kartesisches Koordinatensystem in allen vier Quadranten', 'Cartesian coordinate system in all four quadrants'),
              summary: L('Figuren im vollständigen Koordinatensystem darstellen.', 'Representing figures in the full coordinate system.'),
            },
          ],
        },
        {
          code: '2.2',
          title: L('Körper', 'Solids'),
          summary: L(
            'Prisma und Kreiszylinder: Darstellung durch Modelle, Schrägbilder und Netze sowie Beschreibung von Volumen und Oberfläche.',
            'Prism and circular cylinder: representation by models, oblique drawings and nets, and description of volume and surface area.',
          ),
          parts: [
            {
              code: '2.2.1',
              title: L('Grundkörper (Prisma, Kreiszylinder)', 'Basic solids (prism, circular cylinder)'),
              summary: L(
                'Prismen und Zylinder erkennen und ihre Eigenschaften beschreiben.',
                'Recognising prisms and cylinders and describing their properties.',
              ),
            },
            {
              code: '2.2.2',
              title: L('Beschreibung von Volumen und Oberflächeninhalt beim Prisma', 'Describing volume and surface area of the prism'),
              summary: L(
                'Volumen als Grundfläche mal Höhe und Oberfläche über das Netz verstehen.',
                'Understanding volume as base times height and surface area via the net.',
              ),
            },
            {
              code: '2.2.3',
              title: L('Modelle, Schrägbilder und Netze bekannter Körper', 'Models, oblique drawings and nets of known solids'),
              summary: L(
                'Bekannte Körper in verschiedenen Darstellungen zeichnen und erkennen.',
                'Drawing and recognising known solids in different representations.',
              ),
              simulations: ['koerpernetze'],
            },
          ],
        },
        {
          code: '2.3',
          title: L('Beziehungen zwischen geometrischen Objekten', 'Relationships between geometric objects'),
          summary: L(
            'Kongruenz und Symmetrie, Satzgruppe des Pythagoras mit Beweisen, Satz des Thales sowie Ähnlichkeit, zentrische Streckung und Strahlensätze.',
            'Congruence and symmetry, Pythagorean theorem with proofs, Thales\' theorem, similarity, central dilation and intercept theorems.',
          ),
          parts: [
            {
              code: '2.3.1',
              title: L('Fachbegriffe (Kongruenz, Symmetrie)', 'Technical terms (congruence, symmetry)'),
              summary: L(
                'Deckungsgleichheit und Symmetrie begrifflich fassen, z. B. über Kongruenzsätze.',
                'Defining congruence and symmetry, e.g. via congruence theorems.',
              ),
              simulations: ['dreieckskonstruktion', 'spiegelung'],
            },
            {
              code: '2.3.2',
              title: L(
                'Satz des Pythagoras und seine Umkehrung einschließlich exemplarischer vollständiger Beweise',
                'Pythagorean theorem and its converse including exemplary complete proofs',
              ),
              summary: L(
                'Den Satz begründen, beweisen und zur Berechnung von Seitenlängen nutzen.',
                'Justifying and proving the theorem and using it to calculate side lengths.',
              ),
            },
            {
              code: '2.3.3',
              title: L('Satz des Thales', 'Thales\' theorem'),
              summary: L('Rechte Winkel im Halbkreis entdecken und begründen.', 'Discovering and justifying right angles in a semicircle.'),
              simulations: ['thales'],
            },
            {
              code: '2.3.4',
              title: L('Ähnlichkeit, zentrische Streckungen, Strahlensätze', 'Similarity, central dilations, intercept theorems'),
              summary: L(
                'Figuren maßstäblich vergrößern/verkleinern und Streckenverhältnisse berechnen.',
                'Enlarging/reducing figures to scale and calculating ratios of segments.',
              ),
            },
          ],
        },
        {
          code: '3.1',
          title: L('Umgang mit Größen', 'Working with quantities'),
          summary: L(
            'Umgang mit zusammengesetzten Figuren und Winkelgrößen sowie Winkelsätze.',
            'Working with composite figures and angle measures, and angle theorems.',
          ),
          parts: [
            {
              code: '3.1.1',
              title: L('Zusammengesetzte Figuren', 'Composite figures'),
              summary: L('Flächen in bekannte Teilfiguren zerlegen bzw. ergänzen.', 'Dissecting or completing areas into known component figures.'),
              simulations: ['flaechen-zerlegen'],
            },
            {
              code: '3.1.2',
              title: L('Größen von Winkeln (Minuten, Sekunden)', 'Sizes of angles (minutes, seconds)'),
              summary: L('Winkel genauer in Grad, Minuten und Sekunden angeben.', 'Stating angles more precisely in degrees, minutes and seconds.'),
            },
            {
              code: '3.1.3',
              title: L('Winkelsummensatz und die Winkelsätze an Geradenkreuzungen', 'Angle sum theorem and angle theorems at intersecting lines'),
              summary: L(
                'Innenwinkelsumme sowie Scheitel-, Neben-, Stufen- und Wechselwinkel nutzen.',
                'Using the interior angle sum and vertical, adjacent, corresponding and alternate angles.',
              ),
              simulations: ['winkelsumme', 'winkel-geradenkreuzung'],
            },
          ],
        },
        {
          code: '3.2',
          title: L('Messvorgänge', 'Measuring processes'),
          summary: L(
            'Flächeninhalt und Umfang weiterer Vielecke und des Kreises sowie Volumen und Oberfläche des Prismas.',
            'Area and perimeter of further polygons and the circle, and volume and surface area of the prism.',
          ),
          parts: [
            {
              code: '3.2.1',
              title: L(
                'Flächeninhalt und Umfang von Dreieck, Parallelogramm, Trapez, Raute, Drachen, Kreis',
                'Area and perimeter of triangle, parallelogram, trapezium, rhombus, kite, circle',
              ),
              summary: L(
                'Flächenformeln durch Zerlegen und Ergänzen herleiten; Kreisumfang und -fläche mit π.',
                'Deriving area formulas by dissection and completion; circumference and area of the circle with π.',
              ),
              simulations: ['flaechen-zerlegen'],
            },
            {
              code: '3.2.2',
              title: L('Volumen und Oberflächeninhalt beim Prisma', 'Volume and surface area of the prism'),
              summary: L('Volumen und Oberfläche von Prismen berechnen.', 'Calculating volume and surface area of prisms.'),
            },
          ],
        },
        {
          code: '4.1',
          title: L('Zuordnungen und ihre Darstellungen', 'Assignments (mappings) and their representations'),
          summary: L(
            'Proportionale und antiproportionale Zuordnungen erkennen, mit Dreisatz lösen und in Text, Tabelle und Graph darstellen.',
            'Recognising proportional and inversely proportional assignments, solving them with the rule of three and representing them in text, table and graph.',
          ),
          parts: [
            {
              code: '4.1.1',
              title: L(
                'Proportionale und antiproportionale Zuordnungen und ihre Eigenschaften',
                'Proportional and inversely proportional assignments and their properties',
              ),
              summary: L('Quotienten- bzw. Produktgleichheit erkennen und nutzen.', 'Recognising and using constant quotients or constant products.'),
              simulations: ['proportional'],
            },
            {
              code: '4.1.2',
              title: L('Dreisatzmethoden', 'Rule-of-three methods'),
              summary: L('Fehlende Werte schrittweise über eine Einheit berechnen.', 'Calculating missing values step by step via one unit.'),
              simulations: ['proportional'],
            },
            {
              code: '4.1.3',
              title: L(
                'Darstellung der proportionalen und antiproportionalen Zuordnungen in sprachlicher, tabellarischer und graphischer Form',
                'Representing proportional and inversely proportional assignments in words, tables and graphs',
              ),
              summary: L('Zwischen Text, Wertetabelle und Graph wechseln.', 'Switching between text, table of values and graph.'),
              simulations: ['proportional'],
            },
          ],
        },
        {
          code: '4.2',
          title: L('Funktionen und Gleichungen', 'Functions and equations'),
          summary: L(
            'Lineare Gleichungen und Ungleichungen lösen, Lösungswege vergleichen und lineare Funktionen mit ihren Eigenschaften untersuchen.',
            'Solving linear equations and inequalities, comparing solution methods and investigating linear functions and their properties.',
          ),
          parts: [
            {
              code: '4.2.1',
              title: L('Lösen von linearen Gleichungen', 'Solving linear equations'),
              summary: L('Gleichungen durch Äquivalenzumformungen lösen.', 'Solving equations by equivalent transformations.'),
              simulations: ['waagemodell'],
            },
            {
              code: '4.2.2',
              title: L('Vergleich des Vorgehens beim Lösen von linearen Gleichungen', 'Comparing approaches to solving linear equations'),
              summary: L(
                'Probieren, Umformen und grafisches Lösen gegenüberstellen.',
                'Contrasting trial-and-error, algebraic transformation and graphical solution.',
              ),
              simulations: ['waagemodell'],
            },
            {
              code: '4.2.3',
              title: L('Lineare Funktionen und ihre Eigenschaften', 'Linear functions and their properties'),
              summary: L('Steigung und y-Achsenabschnitt deuten und Graphen zeichnen.', 'Interpreting slope and y-intercept and drawing graphs.'),
              simulations: ['lineare-funktion'],
            },
            {
              code: '4.2.4',
              title: L('Lösen von Ungleichungen', 'Solving inequalities'),
              summary: L('Lineare Ungleichungen lösen und Lösungsmengen angeben.', 'Solving linear inequalities and stating solution sets.'),
            },
          ],
        },
        {
          code: '5.1',
          title: L('Statistische Erhebungen und ihre Auswertung', 'Statistical surveys and their evaluation'),
          summary: L(
            'Daten in Boxplots, Säulen- und Kreisdiagrammen darstellen und mit Lage- und Streumaßen beurteilen.',
            'Presenting data in box plots, bar and pie charts and assessing them with measures of centre and spread.',
          ),
          parts: [
            {
              code: '5.1.1',
              title: L(
                'Darstellung von Daten in Diagrammen (Boxplot, Säulendiagramm, Kreisdiagramm) und Tabellen',
                'Presenting data in diagrams (box plot, bar chart, pie chart) and tables',
              ),
              summary: L(
                'Passende Diagrammart wählen, erstellen und kritisch lesen.',
                'Choosing, creating and critically reading a suitable type of diagram.',
              ),
              simulations: ['boxplot', 'diagramme'],
            },
            {
              code: '5.1.2',
              title: L('Lage- und Streumaße', 'Measures of centre and spread'),
              summary: L(
                'Mittelwert, Median, Quartile und Spannweite bestimmen und vergleichen.',
                'Determining and comparing mean, median, quartiles and range.',
              ),
              simulations: ['boxplot'],
            },
          ],
        },
        {
          code: '5.2',
          title: L('Umgang mit dem Zufall', 'Dealing with chance'),
          summary: L(
            'Zweistufige Zufallsexperimente mit Baumdiagrammen, Vierfeldertafeln und Pfadregeln beschreiben und berechnen.',
            'Describing and calculating two-stage random experiments with tree diagrams, two-way tables and path rules.',
          ),
          parts: [
            {
              code: '5.2.1',
              title: L('Zweistufige Zufallsexperimente', 'Two-stage random experiments'),
              summary: L(
                'Experimente aus zwei Teilschritten untersuchen und Ergebnisse abzählen.',
                'Investigating experiments with two steps and counting outcomes.',
              ),
              simulations: ['zaehlprinzip'],
            },
            {
              code: '5.2.2',
              title: L('Baumdiagramme und Vierfeldertafeln', 'Tree diagrams and two-way tables'),
              summary: L(
                'Wahrscheinlichkeiten in Baumdiagrammen und Vierfeldertafeln darstellen.',
                'Representing probabilities in tree diagrams and two-way tables.',
              ),
            },
            {
              code: '5.2.3',
              title: L('Pfadregeln', 'Path rules'),
              summary: L('Produkt- und Summenregel anwenden.', 'Applying the product and sum rules.'),
            },
          ],
        },
      ],
    },
    {
      grade: 8,
      sourceUrl: SOURCE,
      note: SEK1_7_8,
      units: [
        {
          code: '1.1',
          title: L('Zahlen', 'Numbers'),
          summary: L(
            'Erweiterung auf rationale und reelle Zahlen (Wurzeln, π); Zahlen werden an der Zahlengeraden und als Dezimalbrüche dargestellt, verglichen und gerundet; Orientierung im ganzen Koordinatensystem.',
            'Extension to rational and real numbers (roots, π); numbers are shown on the number line and as decimals, compared and rounded; orientation in the full coordinate system.',
          ),
          parts: [
            {
              code: '1.1.1',
              title: L('Rationale Zahlen', 'Rational numbers'),
              summary: L(
                'Positive und negative Brüche und Dezimalzahlen als ein Zahlbereich.',
                'Positive and negative fractions and decimals as one number set.',
              ),
            },
            {
              code: '1.1.2',
              title: L(
                'Reelle Zahlen (Wurzeln und die Zahl π als Proportionalitätsfaktor)',
                'Real numbers (roots and the number π as a proportionality factor)',
              ),
              summary: L(
                'Irrationale Zahlen wie Quadratwurzeln und π kennenlernen und näherungsweise bestimmen.',
                'Getting to know irrational numbers such as square roots and π and approximating them.',
              ),
              simulations: ['kreiszahl-pi', 'quadratwurzel'],
            },
            {
              code: '1.1.3',
              title: L('Darstellungen (Zahlengerade, Dezimalbrüche)', 'Representations (number line, decimals)'),
              summary: L(
                'Rationale und reelle Zahlen an der Zahlengeraden und in Dezimalschreibweise darstellen.',
                'Representing rational and real numbers on the number line and in decimal notation.',
              ),
            },
            {
              code: '1.1.4',
              title: L(
                'Vergleichen, Ordnen und Runden von rationalen und reellen Zahlen',
                'Comparing, ordering and rounding rational and real numbers',
              ),
              summary: L('Zahlen beider Vorzeichen ordnen und sinnvoll runden.', 'Ordering numbers of both signs and rounding sensibly.'),
            },
            {
              code: '1.1.5',
              title: L('Orientierung im zweidimensionalen Koordinatensystem', 'Orientation in the two-dimensional coordinate system'),
              summary: L('Punkte in allen vier Quadranten eintragen und ablesen.', 'Plotting and reading points in all four quadrants.'),
            },
          ],
        },
        {
          code: '1.2',
          title: L('Operationen und ihre Eigenschaften', 'Operations and their properties'),
          summary: L(
            'Rechnen mit rationalen und reellen Zahlen, Terme mit Variablen und Klammern umformen, Potenzen sowie Prozent- und Zinsrechnung in Sachsituationen.',
            'Calculating with rational and real numbers, transforming terms with variables and brackets, powers, and percentage and interest calculations in real-life contexts.',
          ),
          parts: [
            {
              code: '1.2.1',
              title: L(
                'Rechenverfahren, Rechengesetze und deren Verknüpfungen im Bereich der rationalen und reellen Zahlen',
                'Calculation methods, arithmetic laws and their combination for rational and real numbers',
              ),
              summary: L('Vorzeichenregeln und Rechengesetze sicher anwenden.', 'Applying sign rules and arithmetic laws confidently.'),
            },
            {
              code: '1.2.2',
              title: L('Klammern, Binome', 'Brackets, binomials'),
              summary: L(
                'Klammern auflösen, ausklammern und binomische Formeln nutzen.',
                'Expanding and factorising brackets and using the binomial formulas.',
              ),
            },
            {
              code: '1.2.3',
              title: L('Potenzen mit rationalen Exponenten', 'Powers with rational exponents'),
              summary: L(
                'Potenzschreibweise auf negative und gebrochene Exponenten ausweiten.',
                'Extending power notation to negative and fractional exponents.',
              ),
            },
            {
              code: '1.2.4',
              title: L('Terme und Variable', 'Terms and variables'),
              summary: L(
                'Terme mit Variablen aufstellen, strukturieren und umformen.',
                'Setting up, structuring and transforming terms with variables.',
              ),
            },
            {
              code: '1.2.5',
              title: L('Grundaufgaben der Prozent- und Zinsrechnung', 'Basic tasks of percentage and interest calculation'),
              summary: L('Grundwert, Prozentwert, Prozentsatz und Zinsen berechnen.', 'Calculating base value, percentage value, rate and interest.'),
            },
            {
              code: '1.2.6',
              title: L('Prozentrechnen mit erhöhtem und vermindertem Grundwert', 'Percentages with increased and decreased base value'),
              summary: L(
                'Preiserhöhungen und Rabatte über Wachstums- bzw. Abnahmefaktoren berechnen.',
                'Calculating price increases and discounts using growth or decay factors.',
              ),
            },
            {
              code: '1.2.7',
              title: L('Prozente von Prozenten', 'Percentages of percentages'),
              summary: L('Mehrere prozentuale Änderungen nacheinander verknüpfen.', 'Combining several successive percentage changes.'),
            },
          ],
        },
        {
          code: '2.1',
          title: L('Ebene Figuren', 'Plane figures'),
          summary: L(
            'Vierecke und Kreis werden klassifiziert und konstruiert, auch mit dynamischer Geometriesoftware; Symmetrie und alle vier Quadranten des Koordinatensystems.',
            'Quadrilaterals and circles are classified and constructed, also with dynamic geometry software; symmetry and all four quadrants of the coordinate system.',
          ),
          parts: [
            {
              code: '2.1.1',
              title: L(
                'Grundfiguren (Parallelogramm, Trapez, Raute, Drachen, Kreis)',
                'Basic figures (parallelogram, trapezium, rhombus, kite, circle)',
              ),
              summary: L('Weitere Grundfiguren und ihre Eigenschaften kennenlernen.', 'Getting to know further basic figures and their properties.'),
            },
            {
              code: '2.1.2',
              title: L('Haus der Vierecke', 'Hierarchy of quadrilaterals'),
              summary: L(
                'Vierecke nach Eigenschaften ordnen und Beziehungen zwischen ihnen begründen.',
                'Ordering quadrilaterals by properties and justifying relationships between them.',
              ),
            },
            {
              code: '2.1.3',
              title: L(
                'Konstruktionen mit Zeichengeräten und dynamischer Geometriesoftware',
                'Constructions with drawing instruments and dynamic geometry software',
              ),
              summary: L(
                'Dreiecke, Mittelsenkrechten, Winkelhalbierende u. a. konstruieren.',
                'Constructing triangles, perpendicular bisectors, angle bisectors and more.',
              ),
              simulations: ['besondere-linien'],
            },
            {
              code: '2.1.4',
              title: L('Symmetrieeigenschaften von Figuren', 'Symmetry properties of figures'),
              summary: L('Achsen- und Punktsymmetrie von Figuren untersuchen.', 'Examining line and point symmetry of figures.'),
            },
            {
              code: '2.1.5',
              title: L('Kartesisches Koordinatensystem in allen vier Quadranten', 'Cartesian coordinate system in all four quadrants'),
              summary: L('Figuren im vollständigen Koordinatensystem darstellen.', 'Representing figures in the full coordinate system.'),
            },
          ],
        },
        {
          code: '2.2',
          title: L('Körper', 'Solids'),
          summary: L(
            'Prisma und Kreiszylinder: Darstellung durch Modelle, Schrägbilder und Netze sowie Beschreibung von Volumen und Oberfläche.',
            'Prism and circular cylinder: representation by models, oblique drawings and nets, and description of volume and surface area.',
          ),
          parts: [
            {
              code: '2.2.1',
              title: L('Grundkörper (Prisma, Kreiszylinder)', 'Basic solids (prism, circular cylinder)'),
              summary: L(
                'Prismen und Zylinder erkennen und ihre Eigenschaften beschreiben.',
                'Recognising prisms and cylinders and describing their properties.',
              ),
              simulations: ['prisma-zylinder'],
            },
            {
              code: '2.2.2',
              title: L('Beschreibung von Volumen und Oberflächeninhalt beim Prisma', 'Describing volume and surface area of the prism'),
              summary: L(
                'Volumen als Grundfläche mal Höhe und Oberfläche über das Netz verstehen.',
                'Understanding volume as base times height and surface area via the net.',
              ),
              simulations: ['prisma-zylinder'],
            },
            {
              code: '2.2.3',
              title: L('Modelle, Schrägbilder und Netze bekannter Körper', 'Models, oblique drawings and nets of known solids'),
              summary: L(
                'Bekannte Körper in verschiedenen Darstellungen zeichnen und erkennen.',
                'Drawing and recognising known solids in different representations.',
              ),
              simulations: ['koerpernetze'],
            },
          ],
        },
        {
          code: '2.3',
          title: L('Beziehungen zwischen geometrischen Objekten', 'Relationships between geometric objects'),
          summary: L(
            'Kongruenz und Symmetrie, Satzgruppe des Pythagoras mit Beweisen, Satz des Thales sowie Ähnlichkeit, zentrische Streckung und Strahlensätze.',
            'Congruence and symmetry, Pythagorean theorem with proofs, Thales\' theorem, similarity, central dilation and intercept theorems.',
          ),
          parts: [
            {
              code: '2.3.1',
              title: L('Fachbegriffe (Kongruenz, Symmetrie)', 'Technical terms (congruence, symmetry)'),
              summary: L(
                'Deckungsgleichheit und Symmetrie begrifflich fassen, z. B. über Kongruenzsätze.',
                'Defining congruence and symmetry, e.g. via congruence theorems.',
              ),
            },
            {
              code: '2.3.2',
              title: L(
                'Satz des Pythagoras und seine Umkehrung einschließlich exemplarischer vollständiger Beweise',
                'Pythagorean theorem and its converse including exemplary complete proofs',
              ),
              summary: L(
                'Den Satz begründen, beweisen und zur Berechnung von Seitenlängen nutzen.',
                'Justifying and proving the theorem and using it to calculate side lengths.',
              ),
              simulations: ['pythagoras'],
            },
            {
              code: '2.3.3',
              title: L('Satz des Thales', 'Thales\' theorem'),
              summary: L('Rechte Winkel im Halbkreis entdecken und begründen.', 'Discovering and justifying right angles in a semicircle.'),
            },
            {
              code: '2.3.4',
              title: L('Ähnlichkeit, zentrische Streckungen, Strahlensätze', 'Similarity, central dilations, intercept theorems'),
              summary: L(
                'Figuren maßstäblich vergrößern/verkleinern und Streckenverhältnisse berechnen.',
                'Enlarging/reducing figures to scale and calculating ratios of segments.',
              ),
              simulations: ['strahlensaetze', 'vergroessern'],
            },
          ],
        },
        {
          code: '3.1',
          title: L('Umgang mit Größen', 'Working with quantities'),
          summary: L(
            'Umgang mit zusammengesetzten Figuren und Winkelgrößen sowie Winkelsätze.',
            'Working with composite figures and angle measures, and angle theorems.',
          ),
          parts: [
            {
              code: '3.1.1',
              title: L('Zusammengesetzte Figuren', 'Composite figures'),
              summary: L('Flächen in bekannte Teilfiguren zerlegen bzw. ergänzen.', 'Dissecting or completing areas into known component figures.'),
              simulations: ['flaechen-zerlegen'],
            },
            {
              code: '3.1.2',
              title: L('Größen von Winkeln (Minuten, Sekunden)', 'Sizes of angles (minutes, seconds)'),
              summary: L('Winkel genauer in Grad, Minuten und Sekunden angeben.', 'Stating angles more precisely in degrees, minutes and seconds.'),
            },
            {
              code: '3.1.3',
              title: L('Winkelsummensatz und die Winkelsätze an Geradenkreuzungen', 'Angle sum theorem and angle theorems at intersecting lines'),
              summary: L(
                'Innenwinkelsumme sowie Scheitel-, Neben-, Stufen- und Wechselwinkel nutzen.',
                'Using the interior angle sum and vertical, adjacent, corresponding and alternate angles.',
              ),
            },
          ],
        },
        {
          code: '3.2',
          title: L('Messvorgänge', 'Measuring processes'),
          summary: L(
            'Flächeninhalt und Umfang weiterer Vielecke und des Kreises sowie Volumen und Oberfläche des Prismas.',
            'Area and perimeter of further polygons and the circle, and volume and surface area of the prism.',
          ),
          parts: [
            {
              code: '3.2.1',
              title: L(
                'Flächeninhalt und Umfang von Dreieck, Parallelogramm, Trapez, Raute, Drachen, Kreis',
                'Area and perimeter of triangle, parallelogram, trapezium, rhombus, kite, circle',
              ),
              summary: L(
                'Flächenformeln durch Zerlegen und Ergänzen herleiten; Kreisumfang und -fläche mit π.',
                'Deriving area formulas by dissection and completion; circumference and area of the circle with π.',
              ),
              simulations: ['kreiszahl-pi', 'flaechen-zerlegen'],
            },
            {
              code: '3.2.2',
              title: L('Volumen und Oberflächeninhalt beim Prisma', 'Volume and surface area of the prism'),
              summary: L('Volumen und Oberfläche von Prismen berechnen.', 'Calculating volume and surface area of prisms.'),
              simulations: ['prisma-zylinder'],
            },
          ],
        },
        {
          code: '4.1',
          title: L('Zuordnungen und ihre Darstellungen', 'Assignments (mappings) and their representations'),
          summary: L(
            'Proportionale und antiproportionale Zuordnungen erkennen, mit Dreisatz lösen und in Text, Tabelle und Graph darstellen.',
            'Recognising proportional and inversely proportional assignments, solving them with the rule of three and representing them in text, table and graph.',
          ),
          parts: [
            {
              code: '4.1.1',
              title: L(
                'Proportionale und antiproportionale Zuordnungen und ihre Eigenschaften',
                'Proportional and inversely proportional assignments and their properties',
              ),
              summary: L('Quotienten- bzw. Produktgleichheit erkennen und nutzen.', 'Recognising and using constant quotients or constant products.'),
              simulations: ['proportional', 'hyperbel'],
            },
            {
              code: '4.1.2',
              title: L('Dreisatzmethoden', 'Rule-of-three methods'),
              summary: L('Fehlende Werte schrittweise über eine Einheit berechnen.', 'Calculating missing values step by step via one unit.'),
              simulations: ['proportional'],
            },
            {
              code: '4.1.3',
              title: L(
                'Darstellung der proportionalen und antiproportionalen Zuordnungen in sprachlicher, tabellarischer und graphischer Form',
                'Representing proportional and inversely proportional assignments in words, tables and graphs',
              ),
              summary: L('Zwischen Text, Wertetabelle und Graph wechseln.', 'Switching between text, table of values and graph.'),
              simulations: ['proportional', 'funktion-zuordnung'],
            },
          ],
        },
        {
          code: '4.2',
          title: L('Funktionen und Gleichungen', 'Functions and equations'),
          summary: L(
            'Lineare Gleichungen und Ungleichungen lösen, Lösungswege vergleichen und lineare Funktionen mit ihren Eigenschaften untersuchen.',
            'Solving linear equations and inequalities, comparing solution methods and investigating linear functions and their properties.',
          ),
          parts: [
            {
              code: '4.2.1',
              title: L('Lösen von linearen Gleichungen', 'Solving linear equations'),
              summary: L('Gleichungen durch Äquivalenzumformungen lösen.', 'Solving equations by equivalent transformations.'),
            },
            {
              code: '4.2.2',
              title: L('Vergleich des Vorgehens beim Lösen von linearen Gleichungen', 'Comparing approaches to solving linear equations'),
              summary: L(
                'Probieren, Umformen und grafisches Lösen gegenüberstellen.',
                'Contrasting trial-and-error, algebraic transformation and graphical solution.',
              ),
              simulations: ['gleichungen-grafisch'],
            },
            {
              code: '4.2.3',
              title: L('Lineare Funktionen und ihre Eigenschaften', 'Linear functions and their properties'),
              summary: L('Steigung und y-Achsenabschnitt deuten und Graphen zeichnen.', 'Interpreting slope and y-intercept and drawing graphs.'),
              simulations: ['lineare-funktion'],
            },
            {
              code: '4.2.4',
              title: L('Lösen von Ungleichungen', 'Solving inequalities'),
              summary: L('Lineare Ungleichungen lösen und Lösungsmengen angeben.', 'Solving linear inequalities and stating solution sets.'),
            },
          ],
        },
        {
          code: '5.1',
          title: L('Statistische Erhebungen und ihre Auswertung', 'Statistical surveys and their evaluation'),
          summary: L(
            'Daten in Boxplots, Säulen- und Kreisdiagrammen darstellen und mit Lage- und Streumaßen beurteilen.',
            'Presenting data in box plots, bar and pie charts and assessing them with measures of centre and spread.',
          ),
          parts: [
            {
              code: '5.1.1',
              title: L(
                'Darstellung von Daten in Diagrammen (Boxplot, Säulendiagramm, Kreisdiagramm) und Tabellen',
                'Presenting data in diagrams (box plot, bar chart, pie chart) and tables',
              ),
              summary: L(
                'Passende Diagrammart wählen, erstellen und kritisch lesen.',
                'Choosing, creating and critically reading a suitable type of diagram.',
              ),
            },
            {
              code: '5.1.2',
              title: L('Lage- und Streumaße', 'Measures of centre and spread'),
              summary: L(
                'Mittelwert, Median, Quartile und Spannweite bestimmen und vergleichen.',
                'Determining and comparing mean, median, quartiles and range.',
              ),
            },
          ],
        },
        {
          code: '5.2',
          title: L('Umgang mit dem Zufall', 'Dealing with chance'),
          summary: L(
            'Zweistufige Zufallsexperimente mit Baumdiagrammen, Vierfeldertafeln und Pfadregeln beschreiben und berechnen.',
            'Describing and calculating two-stage random experiments with tree diagrams, two-way tables and path rules.',
          ),
          parts: [
            {
              code: '5.2.1',
              title: L('Zweistufige Zufallsexperimente', 'Two-stage random experiments'),
              summary: L(
                'Experimente aus zwei Teilschritten untersuchen und Ergebnisse abzählen.',
                'Investigating experiments with two steps and counting outcomes.',
              ),
              simulations: ['baumdiagramm', 'zaehlprinzip'],
            },
            {
              code: '5.2.2',
              title: L('Baumdiagramme und Vierfeldertafeln', 'Tree diagrams and two-way tables'),
              summary: L(
                'Wahrscheinlichkeiten in Baumdiagrammen und Vierfeldertafeln darstellen.',
                'Representing probabilities in tree diagrams and two-way tables.',
              ),
              simulations: ['baumdiagramm'],
            },
            {
              code: '5.2.3',
              title: L('Pfadregeln', 'Path rules'),
              summary: L('Produkt- und Summenregel anwenden.', 'Applying the product and sum rules.'),
              simulations: ['baumdiagramm'],
            },
          ],
        },
      ],
    },
    {
      grade: 9,
      sourceUrl: SOURCE,
      note: SEK1_9_10,
      units: [
        {
          code: '2.2',
          title: L('Körper', 'Solids'),
          summary: L(
            'Pyramide, Kegel und Kugel sowie Körper aus Technik und Alltag: Darstellung und Berechnung von Volumen und Oberfläche.',
            'Pyramid, cone and sphere as well as solids from technology and everyday life: representation and calculation of volume and surface area.',
          ),
          parts: [
            {
              code: '2.2.1',
              title: L('Grundkörper (Pyramide, Kegel, Kugel)', 'Basic solids (pyramid, cone, sphere)'),
              summary: L(
                'Spitze und runde Körper und ihre Eigenschaften kennenlernen.',
                'Getting to know pointed and round solids and their properties.',
              ),
            },
            {
              code: '2.2.2',
              title: L('Körper aus der Technik und der Lebensumwelt', 'Solids from technology and everyday life'),
              summary: L(
                'Reale Gegenstände als Kombination von Grundkörpern modellieren.',
                'Modelling real objects as combinations of basic solids.',
              ),
            },
            {
              code: '2.2.3',
              title: L(
                'Beschreibung von Volumen und Oberflächeninhalt bei Pyramide, Kegel, Kugel',
                'Describing volume and surface area of pyramid, cone, sphere',
              ),
              summary: L(
                'Volumenformeln begründen (z. B. Cavalieri) und anwenden.',
                'Justifying volume formulas (e.g. Cavalieri) and applying them.',
              ),
            },
            {
              code: '2.2.4',
              title: L('Modelle, Schrägbilder und Netze bekannter Körper', 'Models, oblique drawings and nets of known solids'),
              summary: L(
                'Auch Pyramiden und Kegel in Netz und Schrägbild darstellen.',
                'Representing pyramids and cones as nets and oblique drawings too.',
              ),
            },
          ],
        },
        {
          code: '2.3',
          title: L('Beziehungen zwischen geometrischen Objekten', 'Relationships between geometric objects'),
          summary: L(
            'Trigonometrie: Sinus, Kosinus und Tangens in rechtwinkligen und allgemeinen Dreiecken.',
            'Trigonometry: sine, cosine and tangent in right-angled and general triangles.',
          ),
          parts: [
            {
              code: '2.3.1',
              title: L(
                'Trigonometrischen Beziehungen (sin, cos, tan) bei rechtwinkligen und allgemeinen Dreiecken',
                'Trigonometric relationships (sin, cos, tan) in right-angled and general triangles',
              ),
              summary: L(
                'Seitenverhältnisse als sin, cos, tan; Sinus- und Kosinussatz für beliebige Dreiecke.',
                'Side ratios as sin, cos, tan; law of sines and law of cosines for any triangle.',
              ),
              simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'einheitskreis'],
            },
          ],
        },
        {
          code: '3.2',
          title: L('Messvorgänge', 'Measuring processes'),
          summary: L(
            'Berechnungen an Dreiecken und Vielecken in Anwendungen sowie Volumen und Oberfläche von Pyramide, Kegel, Zylinder und Kugel.',
            'Calculations in triangles and polygons in applications, and volume and surface area of pyramid, cone, cylinder and sphere.',
          ),
          parts: [
            {
              code: '3.2.1',
              title: L(
                'Berechnungen in Dreiecken und Vielecken (Anwendungen aus Technik und Physik)',
                'Calculations in triangles and polygons (applications from technology and physics)',
              ),
              summary: L(
                'Strecken und Winkel in Sachaufgaben mit Pythagoras und Trigonometrie berechnen.',
                'Calculating lengths and angles in applied problems with Pythagoras and trigonometry.',
              ),
              simulations: ['pythagoras', 'sin-cos-tan-dreieck', 'sinussatz-kosinussatz'],
            },
            {
              code: '3.2.2',
              title: L(
                'Volumen und Oberflächeninhalt bei Pyramide, Kegel, Zylinder, Kugel',
                'Volume and surface area of pyramid, cone, cylinder, sphere',
              ),
              summary: L(
                'Formeln für Volumen und Oberfläche anwenden und vergleichen.',
                'Applying and comparing formulas for volume and surface area.',
              ),
              simulations: ['prisma-zylinder'],
            },
          ],
        },
        {
          code: '4.1',
          title: L('Zuordnungen und ihre Darstellungen', 'Assignments (mappings) and their representations'),
          summary: L(
            'Nicht-proportionale funktionale Zusammenhänge verstehen und in Worten, Tabellen und Graphen darstellen.',
            'Understanding non-proportional functional relationships and representing them in words, tables and graphs.',
          ),
          parts: [
            {
              code: '4.1.1',
              title: L(
                'Grundvorstellungen zu nicht-proportionalen funktionalen Zusammenhängen',
                'Basic ideas of non-proportional functional relationships',
              ),
              summary: L(
                'Erkennen, wann ein Zusammenhang eine Funktion ist und wie er sich verändert.',
                'Recognising when a relationship is a function and how it changes.',
              ),
            },
            {
              code: '4.1.2',
              title: L(
                'Darstellung der Zuordnungen in sprachlicher, tabellarischer oder graphischer Form',
                'Representing assignments in words, tables or graphs',
              ),
              summary: L(
                'Zusammenhänge flexibel in verschiedenen Darstellungen beschreiben.',
                'Describing relationships flexibly in different representations.',
              ),
              simulations: ['funktionsplotter'],
            },
          ],
        },
        {
          code: '4.2',
          title: L('Funktionen und Gleichungen', 'Functions and equations'),
          summary: L(
            'Quadratische Gleichungen und lineare 2×2-Systeme lösen; Potenz-, Exponential- und Sinusfunktionen (laut Inhaltsfeldbeschreibung auch quadratische Funktionen) zum Modellieren nutzen.',
            'Solving quadratic equations and linear 2×2 systems; using power, exponential and sine functions (according to the content-area description also quadratic functions) for modelling.',
          ),
          parts: [
            {
              code: '4.2.1',
              title: L('Lösen von quadratischen Gleichungen', 'Solving quadratic equations'),
              summary: L('Quadratische Gleichungen rechnerisch und grafisch lösen.', 'Solving quadratic equations algebraically and graphically.'),
              simulations: ['quadratische-funktion', 'gleichungen-grafisch', 'extremwert-parabel'],
            },
            {
              code: '4.2.2',
              title: L('Lösen von linearen 2×2-Gleichungssystemen', 'Solving linear 2×2 systems of equations'),
              summary: L(
                'Systeme aus zwei Gleichungen rechnerisch und als Geradenschnitt lösen.',
                'Solving systems of two equations algebraically and as intersecting lines.',
              ),
              simulations: ['lgs-grafisch'],
            },
            {
              code: '4.2.3',
              title: L('Einfache Potenzfunktionen', 'Simple power functions'),
              summary: L('Graphen von y = a·xⁿ untersuchen.', 'Investigating graphs of y = a·xⁿ.'),
              simulations: ['potenzfunktionen'],
            },
            {
              code: '4.2.4',
              title: L('Exponentialfunktionen', 'Exponential functions'),
              summary: L(
                'Wachstums- und Zerfallsvorgänge mit Exponentialfunktionen beschreiben.',
                'Describing growth and decay processes with exponential functions.',
              ),
            },
            {
              code: '4.2.5',
              title: L('Sinusfunktion und ihre wesentlichen Eigenschaften', 'Sine function and its main properties'),
              summary: L(
                'Die Sinusfunktion am Einheitskreis entwickeln; Periode und Amplitude.',
                'Developing the sine function on the unit circle; period and amplitude.',
              ),
              simulations: ['einheitskreis'],
            },
            {
              code: '4.2.6',
              title: L('Darstellung von Funktionen (Funktionsgleichung, Tabelle, Graph)', 'Representing functions (equation, table, graph)'),
              summary: L(
                'Zwischen Term, Tabelle und Graph wechseln, auch mit Software.',
                'Switching between term, table and graph, also with software.',
              ),
              simulations: ['funktionsplotter'],
            },
          ],
        },
        {
          code: '5.2',
          title: L('Umgang mit dem Zufall', 'Dealing with chance'),
          summary: L(
            'Mehrstufige Zufallsexperimente beschreiben und Wahrscheinlichkeiten berechnen.',
            'Describing multi-stage random experiments and calculating probabilities.',
          ),
          parts: [
            {
              code: '5.2.1',
              title: L('Mehrstufige Zufallsexperimente', 'Multi-stage random experiments'),
              summary: L(
                'Wahrscheinlichkeiten bei mehr als zwei Stufen mit Baumdiagramm und Pfadregeln bestimmen.',
                'Finding probabilities for more than two stages with tree diagrams and path rules.',
              ),
              simulations: ['baumdiagramm', 'galtonbrett'],
            },
          ],
        },
      ],
    },
    {
      grade: 10,
      sourceUrl: SOURCE,
      note: SEK1_9_10,
      units: [
        {
          code: '2.2',
          title: L('Körper', 'Solids'),
          summary: L(
            'Pyramide, Kegel und Kugel sowie Körper aus Technik und Alltag: Darstellung und Berechnung von Volumen und Oberfläche.',
            'Pyramid, cone and sphere as well as solids from technology and everyday life: representation and calculation of volume and surface area.',
          ),
          parts: [
            {
              code: '2.2.1',
              title: L('Grundkörper (Pyramide, Kegel, Kugel)', 'Basic solids (pyramid, cone, sphere)'),
              summary: L(
                'Spitze und runde Körper und ihre Eigenschaften kennenlernen.',
                'Getting to know pointed and round solids and their properties.',
              ),
              simulations: ['pyramide-kegel-kugel'],
            },
            {
              code: '2.2.2',
              title: L('Körper aus der Technik und der Lebensumwelt', 'Solids from technology and everyday life'),
              summary: L(
                'Reale Gegenstände als Kombination von Grundkörpern modellieren.',
                'Modelling real objects as combinations of basic solids.',
              ),
            },
            {
              code: '2.2.3',
              title: L(
                'Beschreibung von Volumen und Oberflächeninhalt bei Pyramide, Kegel, Kugel',
                'Describing volume and surface area of pyramid, cone, sphere',
              ),
              summary: L(
                'Volumenformeln begründen (z. B. Cavalieri) und anwenden.',
                'Justifying volume formulas (e.g. Cavalieri) and applying them.',
              ),
              simulations: ['pyramide-kegel-kugel', 'cavalieri'],
            },
            {
              code: '2.2.4',
              title: L('Modelle, Schrägbilder und Netze bekannter Körper', 'Models, oblique drawings and nets of known solids'),
              summary: L(
                'Auch Pyramiden und Kegel in Netz und Schrägbild darstellen.',
                'Representing pyramids and cones as nets and oblique drawings too.',
              ),
            },
          ],
        },
        {
          code: '2.3',
          title: L('Beziehungen zwischen geometrischen Objekten', 'Relationships between geometric objects'),
          summary: L(
            'Trigonometrie: Sinus, Kosinus und Tangens in rechtwinkligen und allgemeinen Dreiecken.',
            'Trigonometry: sine, cosine and tangent in right-angled and general triangles.',
          ),
          parts: [
            {
              code: '2.3.1',
              title: L(
                'Trigonometrischen Beziehungen (sin, cos, tan) bei rechtwinkligen und allgemeinen Dreiecken',
                'Trigonometric relationships (sin, cos, tan) in right-angled and general triangles',
              ),
              summary: L(
                'Seitenverhältnisse als sin, cos, tan; Sinus- und Kosinussatz für beliebige Dreiecke.',
                'Side ratios as sin, cos, tan; law of sines and law of cosines for any triangle.',
              ),
              simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz', 'einheitskreis'],
            },
          ],
        },
        {
          code: '3.2',
          title: L('Messvorgänge', 'Measuring processes'),
          summary: L(
            'Berechnungen an Dreiecken und Vielecken in Anwendungen sowie Volumen und Oberfläche von Pyramide, Kegel, Zylinder und Kugel.',
            'Calculations in triangles and polygons in applications, and volume and surface area of pyramid, cone, cylinder and sphere.',
          ),
          parts: [
            {
              code: '3.2.1',
              title: L(
                'Berechnungen in Dreiecken und Vielecken (Anwendungen aus Technik und Physik)',
                'Calculations in triangles and polygons (applications from technology and physics)',
              ),
              summary: L(
                'Strecken und Winkel in Sachaufgaben mit Pythagoras und Trigonometrie berechnen.',
                'Calculating lengths and angles in applied problems with Pythagoras and trigonometry.',
              ),
              simulations: ['sin-cos-tan-dreieck', 'sinussatz-kosinussatz'],
            },
            {
              code: '3.2.2',
              title: L(
                'Volumen und Oberflächeninhalt bei Pyramide, Kegel, Zylinder, Kugel',
                'Volume and surface area of pyramid, cone, cylinder, sphere',
              ),
              summary: L(
                'Formeln für Volumen und Oberfläche anwenden und vergleichen.',
                'Applying and comparing formulas for volume and surface area.',
              ),
              simulations: ['pyramide-kegel-kugel'],
            },
          ],
        },
        {
          code: '4.1',
          title: L('Zuordnungen und ihre Darstellungen', 'Assignments (mappings) and their representations'),
          summary: L(
            'Nicht-proportionale funktionale Zusammenhänge verstehen und in Worten, Tabellen und Graphen darstellen.',
            'Understanding non-proportional functional relationships and representing them in words, tables and graphs.',
          ),
          parts: [
            {
              code: '4.1.1',
              title: L(
                'Grundvorstellungen zu nicht-proportionalen funktionalen Zusammenhängen',
                'Basic ideas of non-proportional functional relationships',
              ),
              summary: L(
                'Erkennen, wann ein Zusammenhang eine Funktion ist und wie er sich verändert.',
                'Recognising when a relationship is a function and how it changes.',
              ),
            },
            {
              code: '4.1.2',
              title: L(
                'Darstellung der Zuordnungen in sprachlicher, tabellarischer oder graphischer Form',
                'Representing assignments in words, tables or graphs',
              ),
              summary: L(
                'Zusammenhänge flexibel in verschiedenen Darstellungen beschreiben.',
                'Describing relationships flexibly in different representations.',
              ),
              simulations: ['funktionsplotter'],
            },
          ],
        },
        {
          code: '4.2',
          title: L('Funktionen und Gleichungen', 'Functions and equations'),
          summary: L(
            'Quadratische Gleichungen und lineare 2×2-Systeme lösen; Potenz-, Exponential- und Sinusfunktionen (laut Inhaltsfeldbeschreibung auch quadratische Funktionen) zum Modellieren nutzen.',
            'Solving quadratic equations and linear 2×2 systems; using power, exponential and sine functions (according to the content-area description also quadratic functions) for modelling.',
          ),
          parts: [
            {
              code: '4.2.1',
              title: L('Lösen von quadratischen Gleichungen', 'Solving quadratic equations'),
              summary: L('Quadratische Gleichungen rechnerisch und grafisch lösen.', 'Solving quadratic equations algebraically and graphically.'),
              simulations: ['quadratische-funktion'],
            },
            {
              code: '4.2.2',
              title: L('Lösen von linearen 2×2-Gleichungssystemen', 'Solving linear 2×2 systems of equations'),
              summary: L(
                'Systeme aus zwei Gleichungen rechnerisch und als Geradenschnitt lösen.',
                'Solving systems of two equations algebraically and as intersecting lines.',
              ),
              simulations: ['lgs-grafisch'],
            },
            {
              code: '4.2.3',
              title: L('Einfache Potenzfunktionen', 'Simple power functions'),
              summary: L('Graphen von y = a·xⁿ untersuchen.', 'Investigating graphs of y = a·xⁿ.'),
              simulations: ['potenzfunktionen'],
            },
            {
              code: '4.2.4',
              title: L('Exponentialfunktionen', 'Exponential functions'),
              summary: L(
                'Wachstums- und Zerfallsvorgänge mit Exponentialfunktionen beschreiben.',
                'Describing growth and decay processes with exponential functions.',
              ),
              simulations: ['exponentielles-wachstum'],
            },
            {
              code: '4.2.5',
              title: L('Sinusfunktion und ihre wesentlichen Eigenschaften', 'Sine function and its main properties'),
              summary: L(
                'Die Sinusfunktion am Einheitskreis entwickeln; Periode und Amplitude.',
                'Developing the sine function on the unit circle; period and amplitude.',
              ),
              simulations: ['sinusfunktion', 'einheitskreis'],
            },
            {
              code: '4.2.6',
              title: L('Darstellung von Funktionen (Funktionsgleichung, Tabelle, Graph)', 'Representing functions (equation, table, graph)'),
              summary: L(
                'Zwischen Term, Tabelle und Graph wechseln, auch mit Software.',
                'Switching between term, table and graph, also with software.',
              ),
              simulations: ['funktionsplotter'],
            },
          ],
        },
        {
          code: '5.2',
          title: L('Umgang mit dem Zufall', 'Dealing with chance'),
          summary: L(
            'Mehrstufige Zufallsexperimente beschreiben und Wahrscheinlichkeiten berechnen.',
            'Describing multi-stage random experiments and calculating probabilities.',
          ),
          parts: [
            {
              code: '5.2.1',
              title: L('Mehrstufige Zufallsexperimente', 'Multi-stage random experiments'),
              summary: L(
                'Wahrscheinlichkeiten bei mehr als zwei Stufen mit Baumdiagramm und Pfadregeln bestimmen.',
                'Finding probabilities for more than two stages with tree diagrams and path rules.',
              ),
              simulations: ['baumdiagramm', 'galtonbrett'],
            },
          ],
        },
      ],
    },
    {
      grade: 11,
      sourceUrl: SOURCE,
      note: E_PHASE,
      units: [
        {
          code: 'E.1',
          title: L('Funktionen und ihre Darstellung', 'Functions and their representation'),
          summary: L(
            'Verbindliches Themenfeld. Wiederholung und Vertiefung des Funktionsbegriffs an ganzrationalen Funktionen: Eigenschaften, besondere Punkte und Modellieren mit linearen und quadratischen Funktionen.',
            'Mandatory topic area. Revisiting and deepening the concept of function using polynomial functions: properties, special points and modelling with linear and quadratic functions.',
          ),
          parts: [
            {
              code: 'E.1.1',
              title: L(
                'Erarbeiten grundlegender Begriffe und Eigenschaften anhand von ganzrationalen Funktionen',
                'Developing basic concepts and properties using polynomial functions',
              ),
              summary: L(
                'Definitions- und Wertemenge, Symmetrie, Verhalten für große |x| sowie Verschieben und Strecken von Graphen.',
                'Domain and range, symmetry, behaviour for large |x|, and shifting and stretching graphs.',
              ),
              simulations: ['ganzrationale-funktionen', 'transformationen', 'grenzverhalten'],
            },
            {
              code: 'E.1.2',
              title: L('Bestimmen besonderer Punkte', 'Determining special points'),
              summary: L(
                'Achsenschnittpunkte und Schnittpunkte zweier Graphen grafisch und rechnerisch finden.',
                'Finding axis intercepts and intersections of two graphs graphically and algebraically.',
              ),
            },
            {
              code: 'E.1.3',
              title: L(
                'Modellieren von Realsituationen durch geeignete Funktionsklassen',
                'Modelling real situations with suitable classes of functions',
              ),
              summary: L(
                'Sachsituationen vor allem mit linearen und quadratischen Funktionen beschreiben.',
                'Describing real situations mainly with linear and quadratic functions.',
              ),
            },
          ],
        },
        {
          code: 'E.2',
          title: L('Einführung des Ableitungsbegriffs', 'Introduction of the derivative'),
          summary: L(
            'Verbindliches Themenfeld. Von der mittleren zur lokalen Änderungsrate: Sekante wird zur Tangente, Ableitung an einer Stelle und Ableitungsfunktion, erste Ableitungsregeln.',
            'Mandatory topic area. From average to instantaneous rate of change: secant becomes tangent, derivative at a point and derivative function, first differentiation rules.',
          ),
          parts: [
            {
              code: 'E.2.1',
              title: L(
                'Bedeutung der Ableitung als lokale Änderungsrate und als Tangentensteigung',
                'Meaning of the derivative as instantaneous rate of change and as slope of the tangent',
              ),
              summary: L(
                'Änderungsraten in Sachkontexten deuten, besonders Durchschnitts- und Momentangeschwindigkeit.',
                'Interpreting rates of change in context, especially average and instantaneous velocity.',
              ),
              simulations: ['sekante-tangente'],
            },
            {
              code: 'E.2.2',
              title: L('Ableitung einer Funktion an einer Stelle', 'Derivative of a function at a point'),
              summary: L(
                'Grenzübergang vom Differenzen- zum Differenzialquotienten mit propädeutischem Grenzwertbegriff; Tangente und Normale.',
                'Limit from difference quotient to differential quotient using an intuitive notion of limit; tangent and normal.',
              ),
              simulations: ['sekante-tangente'],
            },
            {
              code: 'E.2.3',
              title: L('Zusammenhang von Ableitungs- und Funktionsgraphen', 'Relationship between graphs of a function and its derivative'),
              summary: L(
                'Grafisch ableiten, Graphen von f und f′ einander begründet zuordnen; Begriff der Stammfunktion.',
                'Differentiating graphically, matching graphs of f and f′ with reasons; concept of an antiderivative.',
              ),
              simulations: ['ableitungsfunktion'],
            },
            {
              code: 'E.2.4',
              title: L('Ableitungsregeln', 'Differentiation rules'),
              summary: L(
                'Potenz-, Faktor- und Summenregel begründen und ganzrationale Funktionen ableiten.',
                'Justifying the power, constant-factor and sum rules and differentiating polynomials.',
              ),
            },
          ],
        },
        {
          code: 'E.3',
          title: L('Anwendungen des Ableitungsbegriffs', 'Applications of the derivative'),
          summary: L(
            'Verbindliches Themenfeld. Kurvendiskussion ganzrationaler Funktionen, Rekonstruktion von Funktionen aus Eigenschaften und Lösen von Extremalproblemen.',
            'Mandatory topic area. Curve sketching of polynomial functions, reconstructing functions from properties and solving optimisation problems.',
          ),
          parts: [
            {
              code: 'E.3.1',
              title: L('Funktionsuntersuchung bei ganzrationalen Funktionen', 'Analysis of polynomial functions'),
              summary: L(
                'Monotonie, Krümmung, Extrem- und Wendestellen mit notwendigen und hinreichenden Kriterien bestimmen.',
                'Determining monotonicity, concavity, extrema and inflection points with necessary and sufficient conditions.',
              ),
              simulations: ['kurvendiskussion', 'ganzrationale-funktionen'],
            },
            {
              code: 'E.3.2',
              title: L(
                'Rekonstruktion von ganzrationalen Funktionen anhand ihrer Eigenschaften',
                'Reconstructing polynomial functions from their properties',
              ),
              summary: L(
                'Aus Bedingungen (z. B. Extrempunkt, knickfreier Anschluss) eine passende Funktionsgleichung bestimmen.',
                'Finding a suitable function equation from conditions (e.g. extreme point, smooth join).',
              ),
            },
            {
              code: 'E.3.3',
              title: L('Extremalprobleme', 'Optimisation problems'),
              summary: L(
                'Inner- und außermathematische Optimierungsaufgaben mit der Ableitung lösen.',
                'Solving optimisation problems inside and outside mathematics with the derivative.',
              ),
              simulations: ['extremwertprobleme'],
            },
          ],
        },
        {
          code: 'E.4',
          title: L('Exponentialfunktionen', 'Exponential functions'),
          summary: L(
            'Verbindliches Themenfeld. Exponentielles Wachstum und exponentieller Zerfall, die e-Funktion und ihre Ableitung, Produkt- und Kettenregel sowie Lösen von Exponentialgleichungen.',
            'Mandatory topic area. Exponential growth and decay, the natural exponential function and its derivative, product and chain rule, and solving exponential equations.',
          ),
          parts: [
            {
              code: 'E.4.1',
              title: L('Wachstums- und Zerfallsprozesse', 'Growth and decay processes'),
              summary: L(
                'Parameter in f(x) = a·bˣ + c deuten, Halbwerts- und Verdopplungszeit, Modellieren mit Daten.',
                'Interpreting parameters in f(x) = a·bˣ + c, half-life and doubling time, modelling with data.',
              ),
            },
            {
              code: 'E.4.2',
              title: L('Die (natürliche) Exponentialfunktion f(x) = eˣ', 'The (natural) exponential function f(x) = eˣ'),
              summary: L(
                'Die Zahl e und die Ableitung von eˣ anschaulich herleiten; Basiswechsel zur Basis e.',
                'Deriving the number e and the derivative of eˣ intuitively; changing to base e.',
              ),
            },
            {
              code: 'E.4.3',
              title: L('Produkt- und Kettenregel', 'Product and chain rule'),
              summary: L(
                'Produkte und Verkettungen aus ganzrationalen und Exponentialfunktionen ableiten.',
                'Differentiating products and compositions of polynomial and exponential functions.',
              ),
            },
            {
              code: 'E.4.4',
              title: L('Exponentialgleichungen', 'Exponential equations'),
              summary: L(
                'Exponentialgleichungen über das Logarithmieren algebraisch lösen.',
                'Solving exponential equations algebraically using logarithms.',
              ),
              simulations: ['logarithmus'],
            },
          ],
        },
        {
          code: 'E.5',
          title: L('Trigonometrische Funktionen', 'Trigonometric functions'),
          summary: L(
            'Verbindliches Themenfeld. Periodische Vorgänge mit Sinus- und Kosinusfunktionen beschreiben, Parameter deuten und die Ableitungen dieser Funktionen bestimmen.',
            'Mandatory topic area. Describing periodic processes with sine and cosine functions, interpreting parameters and finding the derivatives of these functions.',
          ),
          parts: [
            {
              code: 'E.5.1',
              title: L('Periodische Prozesse', 'Periodic processes'),
              summary: L(
                'Bogenmaß, Bedeutung der Parameter in a·sin[b·(x − c)] + d, Periode, Amplitude und Modellieren mit Daten.',
                'Radians, meaning of the parameters in a·sin[b·(x − c)] + d, period, amplitude and modelling with data.',
              ),
              simulations: ['sinusfunktion'],
            },
            {
              code: 'E.5.2',
              title: L('Ableitung der Sinus- und der Kosinusfunktion', 'Derivative of the sine and cosine functions'),
              summary: L('Ableitungen durch grafisches Differenzieren begründen.', 'Justifying the derivatives by graphical differentiation.'),
              simulations: ['ableitungsfunktion'],
            },
            {
              code: 'E.5.3',
              title: L(
                'Ableitung von f(x) = a·sin[b·(x − c)] + d beziehungsweise f(x) = a·cos[b·(x − c)] + d',
                'Derivative of f(x) = a·sin[b·(x − c)] + d or f(x) = a·cos[b·(x − c)] + d',
              ),
              summary: L(
                'Mit der Kettenregel ableiten und Ableitungswerte im Sachkontext deuten; Tangenten und Normalen.',
                'Differentiating with the chain rule and interpreting derivative values in context; tangents and normals.',
              ),
            },
          ],
        },
        {
          code: 'E.6',
          title: L('Weitere Verfahren zum Lösen von Gleichungen', 'Further methods for solving equations'),
          summary: L(
            'Nicht verbindliches Themenfeld. Polynomdivision zur Nullstellensuche und numerische Näherungsverfahren für Gleichungen.',
            'Optional topic area. Polynomial division to find zeros and numerical approximation methods for equations.',
          ),
          parts: [
            {
              code: 'E.6.1',
              title: L('Polynomdivision', 'Polynomial division'),
              summary: L('Polynome faktorisieren, um Nullstellen zu bestimmen.', 'Factorising polynomials to determine zeros.'),
            },
            {
              code: 'E.6.2',
              title: L('Numerische Lösungsverfahren', 'Numerical solution methods'),
              summary: L(
                'Bisektion, Newton-Verfahren und Regula falsi vergleichen, inklusive Konvergenz und Grenzen.',
                'Comparing bisection, Newton\'s method and regula falsi, including convergence and limitations.',
              ),
              simulations: ['newton-verfahren'],
            },
          ],
        },
        {
          code: 'E.7',
          title: L('Folgen und Reihen', 'Sequences and series'),
          summary: L(
            'Nicht verbindliches Themenfeld. Arithmetische und geometrische Folgen und Reihen sowie deren Grenzwerte.',
            'Optional topic area. Arithmetic and geometric sequences and series and their limits.',
          ),
          parts: [
            {
              code: 'E.7.1',
              title: L('Folgen', 'Sequences'),
              summary: L(
                'Konvergenz und Divergenz begründen und Grenzwerte mit Grenzwertsätzen bestimmen.',
                'Justifying convergence and divergence and finding limits with limit laws.',
              ),
            },
            {
              code: 'E.7.2',
              title: L('Reihen', 'Series'),
              summary: L(
                'Arithmetische und geometrische Reihen und ihre Grenzwerte untersuchen.',
                'Investigating arithmetic and geometric series and their limits.',
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 12,
      sourceUrl: SOURCE,
      note: Q1_Q2,
      units: [
        {
          code: 'Q1.1',
          title: L('Einführung in die Integralrechnung', 'Introduction to integral calculus'),
          summary: L(
            'Verbindliches Themenfeld. Das Integral als rekonstruierter Bestand und als orientierter Flächeninhalt, Rechtecksummen, Hauptsatz und erste Integrationsregeln.',
            'Mandatory topic area. The integral as reconstructed total and as signed area, rectangle sums, fundamental theorem and first integration rules.',
          ),
          parts: [
            {
              code: 'Q1.1.1',
              title: L(
                'Bedeutung des Integrals als Bestandsgröße und als orientierter Flächeninhalt',
                'Meaning of the integral as accumulated quantity and as signed area',
              ),
              summary: L(
                'Aus Änderungsrate und Anfangswert den Bestand rekonstruieren; Integral als Produktsumme.',
                'Reconstructing a total from rate of change and initial value; integral as a sum of products.',
              ),
              simulations: ['ober-untersummen', 'aenderungsrate'],
            },
            {
              code: 'Q1.1.2',
              title: L('Flächen unter einem Funktionsgraphen', 'Areas under a function graph'),
              summary: L(
                'Flächen mit Ober- und Untersummen annähern und per Grenzwert zum bestimmten Integral übergehen.',
                'Approximating areas with upper and lower sums and passing to the definite integral via a limit.',
              ),
              simulations: ['ober-untersummen'],
            },
            {
              code: 'Q1.1.3',
              title: L('Hauptsatz der Differenzial- und Integralrechnung', 'Fundamental theorem of calculus'),
              summary: L(
                'Zusammenhang von Ableiten und Integrieren anschaulich begründen; Funktion und Stammfunktion grafisch.',
                'Justifying the link between differentiation and integration intuitively; function and antiderivative graphically.',
              ),
              simulations: ['hauptsatz', 'stammfunktion-grafisch'],
            },
            {
              code: 'Q1.1.4',
              title: L('Entwickeln der Integrationsregeln mithilfe der Ableitungsregeln', 'Developing integration rules from differentiation rules'),
              summary: L(
                'Stammfunktionen von Potenzen, eˣ, sin x und cos x; Faktor- und Summenregel.',
                'Antiderivatives of powers, eˣ, sin x and cos x; constant-factor and sum rule.',
              ),
            },
            {
              code: 'Q1.1.5',
              title: L('Integrieren von e^(ax+b), sin[b·(x − c)], cos[b·(x − c)]', 'Integrating e^(ax+b), sin[b·(x − c)], cos[b·(x − c)]'),
              summary: L(
                'Stammfunktionen von linear verketteten Funktionen bestimmen.',
                'Finding antiderivatives of functions with a linear inner function.',
              ),
            },
            {
              code: 'Q1.1.6',
              title: L(
                'Integrieren von (ax + b)^r mit r ∈ ℚ \\ {−1}, Integrieren von g(x) = f′(x)·e^f(x) (nur LK)',
                'Integrating (ax + b)^r with r ∈ ℚ \\ {−1}, integrating g(x) = f′(x)·e^f(x) (advanced course only)',
              ),
              summary: L('Weitere Stammfunktionen über die Umkehrung der Kettenregel.', 'Further antiderivatives by reversing the chain rule.'),
            },
          ],
        },
        {
          code: 'Q1.2',
          title: L('Anwendungen der Integralrechnung', 'Applications of integral calculus'),
          summary: L(
            'Verbindliches Themenfeld. Flächeninhalte zwischen Graphen, Bestände und Mittelwerte in Sachkontexten; im LK zusätzlich Rotationskörper und uneigentliche Integrale.',
            'Mandatory topic area. Areas between graphs, totals and mean values in context; in the advanced course also solids of revolution and improper integrals.',
          ),
          parts: [
            {
              code: 'Q1.2.1',
              title: L('Flächeninhaltsberechnung', 'Calculating areas'),
              summary: L(
                'Flächen zwischen Graphen und Achsenparallelen berechnen, auch rückwärts (Grenze oder Parameter gesucht).',
                'Calculating areas between graphs and lines parallel to the axes, also backwards (unknown bound or parameter).',
              ),
            },
            {
              code: 'Q1.2.2',
              title: L('Anwenden des Integrals für Berechnungen in Sachzusammenhängen', 'Applying the integral to calculations in context'),
              summary: L(
                'Rekonstruierter Bestand, mittlerer Bestand und mittlere Änderungsrate.',
                'Reconstructed total, mean value and average rate of change.',
              ),
              simulations: ['aenderungsrate'],
            },
            {
              code: 'Q1.2.3',
              title: L('Argumentieren und Begründen anhand von Integral-Termen', 'Reasoning and justifying with integral expressions'),
              summary: L(
                'Integralausdrücke im Sachzusammenhang deuten und Aussagen begründen.',
                'Interpreting integral expressions in context and justifying statements.',
              ),
            },
            {
              code: 'Q1.2.4',
              title: L('Rotationskörper (nur LK)', 'Solids of revolution (advanced course only)'),
              summary: L(
                'Volumenformel begründen und Volumina von Rotationskörpern um die x-Achse berechnen.',
                'Justifying the volume formula and calculating volumes of solids of revolution about the x-axis.',
              ),
              simulations: ['rotationskoerper'],
            },
            {
              code: 'Q1.2.5',
              title: L('Uneigentliche Integrale (nur LK)', 'Improper integrals (advanced course only)'),
              summary: L('Unendlich ausgedehnte Flächen auf endlichen Inhalt untersuchen.', 'Examining infinitely extended regions for finite area.'),
            },
          ],
        },
        {
          code: 'Q1.3',
          title: L('Vertiefung der Differenzial- und Integralrechnung', 'Deepening differential and integral calculus'),
          summary: L(
            'Verbindliches Themenfeld. Sicherer Umgang mit den Inhalten der Einführungsphase, verknüpfte Exponentialfunktionen und Wachstumsmodelle; im LK Funktionen mit Parametern und logistisches Wachstum.',
            'Mandatory topic area. Confident use of the introductory-phase content, combined exponential functions and growth models; in the advanced course functions with parameters and logistic growth.',
          ),
          parts: [
            {
              code: 'Q1.3.1',
              title: L(
                'Verständiges Umgehen mit den in der Einführungsphase erarbeiteten Inhalten',
                'Competent use of the content developed in the introductory phase',
              ),
              summary: L(
                'Funktionen, Ableitung und Ableitungsregeln vernetzt anwenden.',
                'Applying functions, derivatives and differentiation rules in an integrated way.',
              ),
              simulations: ['kurvendiskussion'],
            },
            {
              code: 'Q1.3.2',
              title: L(
                'Untersuchen von Exponentialfunktionen, die mit ganzrationalen Funktionen verknüpft sind',
                'Investigating exponential functions combined with polynomial functions',
              ),
              summary: L(
                'Summen, Produkte und Verkettungen aus e-Funktion und Polynomen untersuchen, auch im Sachkontext.',
                'Investigating sums, products and compositions of exponential functions and polynomials, also in context.',
              ),
              simulations: ['e-funktion'],
            },
            {
              code: 'Q1.3.3',
              title: L('Wachstums- und Zerfallsprozesse', 'Growth and decay processes'),
              summary: L(
                'Exponentielles und begrenztes Wachstum mit Messdaten modellieren; Exponentialgleichungen lösen.',
                'Modelling exponential and bounded growth with measured data; solving exponential equations.',
              ),
              simulations: ['logarithmus'],
            },
            {
              code: 'Q1.3.4',
              title: L(
                'Untersuchung von Funktionen mit Parametern, bei denen Exponentialfunktionen mit ganzrationalen Funktionen verknüpft sind, sowie von Kettenlinien und Glockenkurven (nur LK)',
                'Investigating functions with parameters combining exponential and polynomial functions, as well as catenaries and bell curves (advanced course only)',
              ),
              summary: L(
                'Einfluss von Parametern auf verknüpfte Exponentialfunktionen untersuchen.',
                'Investigating the influence of parameters on combined exponential functions.',
              ),
              simulations: ['funktionenscharen'],
            },
            {
              code: 'Q1.3.5',
              title: L('Logistisches Wachstum (nur LK)', 'Logistic growth (advanced course only)'),
              summary: L(
                'Logistische Wachstumsmodelle anwenden (ohne Herleitung aus der Differenzialgleichung).',
                'Applying logistic growth models (without deriving them from the differential equation).',
              ),
            },
          ],
        },
        {
          code: 'Q1.4',
          title: L('Integrationsmethoden', 'Integration techniques'),
          summary: L(
            'Nicht verbindliches Themenfeld. Weitere Verfahren zum Finden von Stammfunktionen.',
            'Optional topic area. Further methods for finding antiderivatives.',
          ),
          parts: [
            {
              code: 'Q1.4.1',
              title: L(
                'Ermitteln einer Stammfunktion durch Formansatz mit Koeffizientenvergleich',
                'Finding an antiderivative by an ansatz with comparison of coefficients',
              ),
              summary: L(
                'Stammfunktion mit passendem Ansatz und Koeffizientenvergleich bestimmen.',
                'Determining an antiderivative with a suitable ansatz and comparison of coefficients.',
              ),
            },
            {
              code: 'Q1.4.2',
              title: L('Partielle Integration (nur LK)', 'Integration by parts (advanced course only)'),
              summary: L('Produktintegrale mit partieller Integration lösen.', 'Solving integrals of products by integration by parts.'),
            },
            {
              code: 'Q1.4.3',
              title: L('Integration durch Substitution (nur LK)', 'Integration by substitution (advanced course only)'),
              summary: L('Integrale durch Substitution vereinfachen.', 'Simplifying integrals by substitution.'),
            },
          ],
        },
        {
          code: 'Q1.5',
          title: L('Gewöhnliche Differenzialgleichungen', 'Ordinary differential equations'),
          summary: L(
            'Nicht verbindliches Themenfeld. Wachstumsmodelle mit Differenzialgleichungen beschreiben und Gleichungen erster Ordnung lösen.',
            'Optional topic area. Describing growth models with differential equations and solving first-order equations.',
          ),
          parts: [
            {
              code: 'Q1.5.1',
              title: L(
                'Beschreiben und Entwickeln von Modellen für Wachstums- und Zerfallsprozesse mithilfe von Differenzialgleichungen',
                'Describing and developing models for growth and decay with differential equations',
              ),
              summary: L('Wachstumsannahmen in Differenzialgleichungen übersetzen.', 'Translating growth assumptions into differential equations.'),
            },
            {
              code: 'Q1.5.2',
              title: L('Lösungsverfahren für Differenzialgleichungen erster Ordnung', 'Solution methods for first-order differential equations'),
              summary: L(
                'Richtungsfelder, Trennung der Variablen und weitere elementare Methoden.',
                'Slope fields, separation of variables and other elementary methods.',
              ),
            },
            {
              code: 'Q1.5.3',
              title: L(
                'Untersuchen von Differenzialgleichungen zweiter Ordnung (nur LK)',
                'Investigating second-order differential equations (advanced course only)',
              ),
              summary: L(
                'Differenzialgleichungen zweiter Ordnung, etwa bei periodischen Vorgängen.',
                'Second-order differential equations, e.g. for periodic processes.',
              ),
            },
          ],
        },
        {
          code: 'Q2.1',
          title: L('Vertiefung der Analysis', 'Deepening of calculus'),
          summary: L(
            'Verbindliches Themenfeld. Weitere Funktionsklassen (einfache gebrochen-rationale und Wurzelfunktionen), Transformationen von Graphen und Umkehrfunktionen; im LK die ln-Funktion und Verkettungen.',
            'Mandatory topic area. Further function classes (simple rational and root functions), graph transformations and inverse functions; in the advanced course the natural logarithm and compositions.',
          ),
          parts: [
            {
              code: 'Q2.1.1',
              title: L('Einfache gebrochen rationale und einfache Wurzelfunktionen', 'Simple rational functions and simple root functions'),
              summary: L('Eigenschaften und Ableitungen von f(x) = 1/xⁿ und f(x) = √x.', 'Properties and derivatives of f(x) = 1/xⁿ and f(x) = √x.'),
              simulations: ['polstellen-asymptoten', 'grenzverhalten'],
            },
            {
              code: 'Q2.1.2',
              title: L('Verschiebung und Streckung', 'Shifting and stretching'),
              summary: L(
                'Graphen verschieben, strecken und spiegeln; g(x) = a·f(b·(x − c)) + d deuten.',
                'Shifting, stretching and reflecting graphs; interpreting g(x) = a·f(b·(x − c)) + d.',
              ),
            },
            {
              code: 'Q2.1.3',
              title: L('Umkehrfunktion', 'Inverse function'),
              summary: L(
                'Umkehrfunktion aufstellen und als Spiegelung an y = x deuten; Definitions- und Wertemenge.',
                'Finding the inverse and interpreting it as reflection in y = x; domain and range.',
              ),
              simulations: ['umkehrfunktion'],
            },
            {
              code: 'Q2.1.4',
              title: L(
                'Die natürliche Logarithmusfunktion f(x) = ln(x) (nur LK)',
                'The natural logarithm function f(x) = ln(x) (advanced course only)',
              ),
              summary: L(
                'Ln als Umkehrfunktion der e-Funktion beschreiben und transformieren.',
                'Describing ln as the inverse of the exponential function and transforming it.',
              ),
              simulations: ['umkehrfunktion', 'logarithmus'],
            },
            {
              code: 'Q2.1.5',
              title: L(
                'Die natürliche Logarithmusfunktion als Stammfunktion von 1/x (nur LK)',
                'The natural logarithm as antiderivative of 1/x (advanced course only)',
              ),
              summary: L('Ln(x) als Stammfunktion von 1/x nutzen.', 'Using ln(x) as the antiderivative of 1/x.'),
            },
            {
              code: 'Q2.1.6',
              title: L('Verknüpfen und Verketten von Funktionen (nur LK)', 'Combining and composing functions (advanced course only)'),
              summary: L(
                'Eigenschaften von Summen, Produkten und Verkettungen anhand der Graphen begründen.',
                'Justifying properties of sums, products and compositions from the graphs.',
              ),
              simulations: ['funktionsplotter'],
            },
          ],
        },
        {
          code: 'Q2.2',
          title: L('Orientieren und Bewegen im Raum', 'Orientation and movement in space'),
          summary: L(
            'Verbindliches Themenfeld. Räumliches Koordinatensystem, Vektoren, Skalarprodukt und Winkel sowie Untersuchung einfacher Körper und Figuren im Raum.',
            'Mandatory topic area. Spatial coordinate system, vectors, dot product and angles, and investigation of simple solids and figures in space.',
          ),
          parts: [
            {
              code: 'Q2.2.1',
              title: L('Räumliche Koordinatensysteme', 'Spatial coordinate systems'),
              summary: L(
                'Punkte und Körper im 3D-Koordinatensystem darstellen, auch mit Software.',
                'Representing points and solids in a 3D coordinate system, also with software.',
              ),
              simulations: ['koordinaten-3d'],
            },
            {
              code: 'Q2.2.2',
              title: L('Vektoren', 'Vectors'),
              summary: L(
                'Verschiebungen als Vektoren, Rechnen mit Vektoren, Kollinearität, Betrag und Abstand.',
                'Translations as vectors, vector arithmetic, collinearity, magnitude and distance.',
              ),
              simulations: ['vektoren-3d'],
            },
            {
              code: 'Q2.2.3',
              title: L('Winkel', 'Angles'),
              summary: L('Skalarprodukt, Orthogonalität und Winkel zwischen Vektoren.', 'Dot product, orthogonality and angles between vectors.'),
              simulations: ['skalar-vektorprodukt'],
            },
            {
              code: 'Q2.2.4',
              title: L('Einfache geometrische Körper und Figuren im Raum', 'Simple geometric solids and figures in space'),
              summary: L(
                'Würfel, Prismen, Pyramiden und ebene Figuren im Raum untersuchen und berechnen.',
                'Investigating and calculating cubes, prisms, pyramids and plane figures in space.',
              ),
              simulations: ['koordinaten-3d'],
            },
          ],
        },
        {
          code: 'Q2.3',
          title: L('Geraden und Ebenen im Raum', 'Lines and planes in space'),
          summary: L(
            'Verbindliches Themenfeld. Lineare Gleichungssysteme, Geraden und Ebenen in verschiedenen Darstellungen, Lagebeziehungen, Winkel, Abstände und Anwendungen wie Schattenwurf.',
            'Mandatory topic area. Systems of linear equations, lines and planes in different forms, relative positions, angles, distances and applications such as shadows.',
          ),
          parts: [
            {
              code: 'Q2.3.1',
              title: L(
                'Systematisches Lösen von linearen Gleichungssystemen (auch über- und unterbestimmte)',
                'Systematic solution of systems of linear equations (including over- and underdetermined)',
              ),
              summary: L(
                'Gleichungssysteme algorithmisch lösen und Lösungsmengen geometrisch deuten.',
                'Solving systems algorithmically and interpreting solution sets geometrically.',
              ),
            },
            {
              code: 'Q2.3.2',
              title: L('Parameterdarstellungen', 'Parametric representations'),
              summary: L(
                'Geraden und Strecken mit Parametergleichungen, Punktprobe und Spurpunkte.',
                'Lines and segments with parametric equations, point test and trace points.',
              ),
              simulations: ['geraden-ebenen'],
            },
            {
              code: 'Q2.3.3',
              title: L('Lagebeziehung von Geraden', 'Relative position of lines'),
              summary: L(
                'Schneiden, parallel, identisch oder windschief; Schnittpunkt und Schnittwinkel.',
                'Intersecting, parallel, identical or skew; intersection point and angle.',
              ),
              simulations: ['geraden-ebenen', 'lage-abstaende'],
            },
            {
              code: 'Q2.3.4',
              title: L('Anwendung auf geradlinige Bewegungen', 'Application to linear motion'),
              summary: L(
                'Bewegungen mit Geraden beschreiben; Richtungsvektor als Geschwindigkeit.',
                'Describing motion with lines; direction vector as velocity.',
              ),
              simulations: ['geraden-ebenen'],
            },
            {
              code: 'Q2.3.5',
              title: L('Ebenen in verschiedenen Darstellungsformen', 'Planes in different forms'),
              summary: L('Parameter- und Koordinatenform, Normalenvektor.', 'Parametric and coordinate form, normal vector.'),
              simulations: ['geraden-ebenen'],
            },
            {
              code: 'Q2.3.6',
              title: L(
                'Darstellen von Ebenen und von begrenzten Flächen (insbesondere Dreieck, Parallelogramm) im Raum mit Parametergleichung',
                'Representing planes and bounded regions (especially triangle, parallelogram) in space with a parametric equation',
              ),
              summary: L('Punktprobe und Spurpunkte von Ebenen.', 'Point test and trace points of planes.'),
              simulations: ['geraden-ebenen'],
            },
            {
              code: 'Q2.3.7',
              title: L('Umwandeln der verschiedenen Darstellungsformen einer Ebene ineinander', 'Converting between the forms of a plane'),
              summary: L(
                'Formen umwandeln; Lage von Gerade und Ebene und Durchstoßpunkte bestimmen.',
                'Converting forms; determining the position of a line relative to a plane and intersection points.',
              ),
              simulations: ['geraden-ebenen', 'lage-abstaende'],
            },
            {
              code: 'Q2.3.8',
              title: L(
                'Berechnung des Winkels zwischen Gerade und Ebene sowie zwischen Ebene und Ebene',
                'Calculating the angle between line and plane and between two planes',
              ),
              summary: L('Schnittwinkel mithilfe von Richtungs- und Normalenvektoren.', 'Intersection angles using direction and normal vectors.'),
            },
            {
              code: 'Q2.3.9',
              title: L(
                'Untersuchung von Winkeln (insbesondere auf Orthogonalität und Parallelität) sowie von den genannten Lagebeziehungen jeweils in Abhängigkeit von einem (zusätzlichen) Parameter',
                'Investigating angles (especially orthogonality and parallelism) and the relative positions mentioned, each depending on an (additional) parameter',
              ),
              summary: L('Lage und Winkel abhängig von einem Parameter untersuchen.', 'Investigating positions and angles depending on a parameter.'),
            },
            {
              code: 'Q2.3.10',
              title: L('Spiegelung und orthogonale Projektion', 'Reflection and orthogonal projection'),
              summary: L(
                'Punkt an Ebene spiegeln; Lotfußpunktverfahren für den Abstand Punkt–Ebene.',
                'Reflecting a point in a plane; foot-of-perpendicular method for point–plane distance.',
              ),
              simulations: ['lage-abstaende'],
            },
            {
              code: 'Q2.3.11',
              title: L('Anwendung in Sachzusammenhängen', 'Application in context'),
              summary: L(
                'Schattenwürfe, Projektionen auf Koordinatenebenen und Flächenberechnungen.',
                'Shadows, projections onto coordinate planes and area calculations.',
              ),
            },
            {
              code: 'Q2.3.12',
              title: L('Normalenform einer Ebene (nur LK)', 'Normal form of a plane (advanced course only)'),
              summary: L('Ebenen über Normalenvektor und Aufpunkt beschreiben.', 'Describing planes via normal vector and position vector.'),
              simulations: ['geraden-ebenen'],
            },
            {
              code: 'Q2.3.13',
              title: L(
                'Weitere Lagebeziehungen und Abstandsbestimmungen (nur LK)',
                'Further relative positions and distance calculations (advanced course only)',
              ),
              summary: L(
                'Lage zweier Ebenen, Schnittgeraden, Abstände zwischen Punkten, Geraden und Ebenen, allgemeine Spiegelungen.',
                'Position of two planes, lines of intersection, distances between points, lines and planes, general reflections.',
              ),
              simulations: ['lage-abstaende'],
            },
            {
              code: 'Q2.3.14',
              title: L('Vektorprodukt (nur LK)', 'Cross product (advanced course only)'),
              summary: L('Vektorprodukt für Normalenvektoren und Flächeninhalte nutzen.', 'Using the cross product for normal vectors and areas.'),
              simulations: ['skalar-vektorprodukt'],
            },
            {
              code: 'Q2.3.15',
              title: L('Geradenscharen (nur LK)', 'Families of lines (advanced course only)'),
              summary: L('Geraden mit Parameter untersuchen.', 'Investigating lines with a parameter.'),
            },
            {
              code: 'Q2.3.16',
              title: L(
                'Ebenenscharen, insbesondere in der Darstellung durch eine Koordinatengleichung (nur LK)',
                'Families of planes, especially in coordinate form (advanced course only)',
              ),
              summary: L('Ebenen mit Parameter untersuchen.', 'Investigating planes with a parameter.'),
            },
            {
              code: 'Q2.3.17',
              title: L(
                'Darstellung von Parabelbahnen mithilfe von Parametern (nur LK)',
                'Representing parabolic trajectories using parameters (advanced course only)',
              ),
              summary: L('Flugbahnen (z. B. eines Balls) parametrisch beschreiben.', 'Describing trajectories (e.g. of a ball) parametrically.'),
            },
          ],
        },
        {
          code: 'Q2.4',
          title: L('Matrizen zur Beschreibung von Übergangsprozessen', 'Matrices for describing transition processes'),
          summary: L(
            'Nicht verbindliches Themenfeld. Übergangsprozesse mit Graphen, Zustandsvektoren und Übergangsmatrizen modellieren, Matrizenrechnung und Markov-Ketten.',
            'Optional topic area. Modelling transition processes with graphs, state vectors and transition matrices; matrix arithmetic and Markov chains.',
          ),
          parts: [
            {
              code: 'Q2.4.1',
              title: L(
                'Beschreiben von Übergangsprozessen mithilfe von Zustands- beziehungsweise Übergangsgraphen, Zustandsvektoren und Übergangsmatrizen',
                'Describing transition processes using state/transition graphs, state vectors and transition matrices',
              ),
              summary: L(
                'Z. B. Populationen, Wählerwanderung oder Kundenströme modellieren.',
                'Modelling e.g. populations, voter movements or customer flows.',
              ),
            },
            {
              code: 'Q2.4.2',
              title: L('Rechnen mit Matrizen', 'Calculating with matrices'),
              summary: L(
                'Skalar-, Matrix-Vektor- und Matrixmultiplikation, Addition, einfache Inverse.',
                'Scalar, matrix–vector and matrix multiplication, addition, simple inverses.',
              ),
            },
            {
              code: 'Q2.4.3',
              title: L('Markov-Ketten', 'Markov chains'),
              summary: L(
                'Zustände schrittweise (auch rückwärts) berechnen und stabile Zustände über Fixvektoren finden.',
                'Calculating states step by step (also backwards) and finding stable states via fixed vectors.',
              ),
            },
            {
              code: 'Q2.4.4',
              title: L(
                'Bestimmen und Interpretieren von Matrixeinträgen bei Potenzen von Matrizen',
                'Determining and interpreting entries of matrix powers',
              ),
              summary: L('Einträge von M² usw. im Kontext deuten.', 'Interpreting entries of M² etc. in context.'),
            },
            {
              code: 'Q2.4.5',
              title: L(
                'Langfristige Entwicklung von Übergangsprozessen (nur LK)',
                'Long-term development of transition processes (advanced course only)',
              ),
              summary: L(
                'Matrixpotenzen, Grenzprozesse und Grenzmatrizen interpretieren.',
                'Interpreting matrix powers, limiting processes and limit matrices.',
              ),
            },
          ],
        },
        {
          code: 'Q2.5',
          title: L('Matrizen zur Darstellung linearer geometrischer Abbildungen', 'Matrices for representing linear geometric transformations'),
          summary: L(
            'Nicht verbindliches Themenfeld. Geometrische Abbildungen wie Spiegelungen, Projektionen und Streckungen mit Matrizen darstellen und verketten.',
            'Optional topic area. Representing and composing geometric transformations such as reflections, projections and dilations with matrices.',
          ),
          parts: [
            {
              code: 'Q2.5.1',
              title: L('Beschreiben von geometrischen Abbildungen mithilfe von Matrizen', 'Describing geometric transformations using matrices'),
              summary: L(
                'Z. B. Schattenwürfe als Abbildung mit einer Matrix beschreiben.',
                'Describing e.g. shadows as a mapping given by a matrix.',
              ),
              simulations: ['matrix-abbildungen'],
            },
            {
              code: 'Q2.5.2',
              title: L('Rechnen mit Matrizen', 'Calculating with matrices'),
              summary: L(
                'Matrizen addieren, multiplizieren und einfache Inverse bestimmen.',
                'Adding and multiplying matrices and finding simple inverses.',
              ),
            },
            {
              code: 'Q2.5.3',
              title: L('Darstellen linearer geometrischer Abbildungen mit Matrizen', 'Representing linear geometric transformations with matrices'),
              summary: L(
                'Abbildungsmatrizen für Spiegelungen, Parallelprojektionen, zentrische Streckungen und deren Verkettung.',
                'Transformation matrices for reflections, parallel projections, central dilations and their compositions.',
              ),
              simulations: ['matrix-abbildungen'],
            },
            {
              code: 'Q2.5.4',
              title: L(
                'Darstellen linearer geometrischer Abbildungen im dreidimensionalen euklidischen Raum ℝ³ mit Matrizen (nur LK)',
                'Representing linear geometric transformations in three-dimensional Euclidean space ℝ³ with matrices (advanced course only)',
              ),
              summary: L(
                'Drehungen um Koordinatenachsen, Projektionen auf beliebige Ursprungsebenen, Fixpunkte.',
                'Rotations about coordinate axes, projections onto arbitrary planes through the origin, fixed points.',
              ),
              simulations: ['matrix-abbildungen'],
            },
          ],
        },
      ],
    },
    {
      grade: 13,
      sourceUrl: SOURCE,
      note: Q3_Q4,
      units: [
        {
          code: 'Q3.1',
          title: L('Grundlegende Begriffe und Methoden der Stochastik', 'Basic concepts and methods of probability'),
          summary: L(
            'Verbindliches Themenfeld. Wahrscheinlichkeitsbegriff, mehrstufige Experimente, Ereignisse und Mengen, bedingte Wahrscheinlichkeit, Unabhängigkeit und Kombinatorik.',
            'Mandatory topic area. Concept of probability, multi-stage experiments, events and sets, conditional probability, independence and combinatorics.',
          ),
          parts: [
            {
              code: 'Q3.1.1',
              title: L('Statistischer Wahrscheinlichkeitsbegriff', 'Statistical concept of probability'),
              summary: L(
                'Absolute und relative Häufigkeit sowie empirisches Gesetz der großen Zahlen.',
                'Absolute and relative frequency and the empirical law of large numbers.',
              ),
            },
            {
              code: 'Q3.1.2',
              title: L('Grundlagen der Wahrscheinlichkeitstheorie', 'Foundations of probability theory'),
              summary: L(
                'Ergebnis, Ereignis, Laplace-Wahrscheinlichkeit und Vergleich mit Versuchsergebnissen.',
                'Outcome, event, Laplace probability and comparison with experimental results.',
              ),
            },
            {
              code: 'Q3.1.3',
              title: L(
                'Bestimmen von Wahrscheinlichkeiten bei mehrstufigen Zufallsexperimenten',
                'Determining probabilities in multi-stage random experiments',
              ),
              summary: L('Baumdiagramme und Pfadregeln anwenden.', 'Using tree diagrams and path rules.'),
            },
            {
              code: 'Q3.1.4',
              title: L('Verknüpfung von Ereignissen', 'Combining events'),
              summary: L(
                'Und-, Oder- und Gegenereignis, Mengendarstellung, auch mit Vierfeldertafel.',
                'And, or and complementary events, set notation, also with a two-way table.',
              ),
              simulations: ['vierfeldertafel'],
            },
            {
              code: 'Q3.1.5',
              title: L('Bedingte Wahrscheinlichkeiten', 'Conditional probabilities'),
              summary: L(
                'Bedingte Wahrscheinlichkeiten in Baumdiagrammen und Mehrfeldertafeln; stochastische Unabhängigkeit.',
                'Conditional probabilities in tree diagrams and contingency tables; stochastic independence.',
              ),
              simulations: ['bedingte-wahrscheinlichkeit', 'vierfeldertafel'],
            },
            {
              code: 'Q3.1.6',
              title: L('Lösen kombinatorischer Zählprobleme', 'Solving combinatorial counting problems'),
              summary: L(
                'Produktregel, Stichproben mit/ohne Zurücklegen, Fakultät, Binomialkoeffizient.',
                'Product rule, samples with/without replacement, factorial, binomial coefficient.',
              ),
            },
            {
              code: 'Q3.1.7',
              title: L(
                'Bestimmen von Laplace-Wahrscheinlichkeiten mithilfe von Zählverfahren',
                'Determining Laplace probabilities with counting methods',
              ),
              summary: L(
                'Urnenmodelle mit und ohne Zurücklegen (z. B. Lotto) vergleichen.',
                'Comparing urn models with and without replacement (e.g. lottery).',
              ),
              simulations: ['geburtstagsproblem'],
            },
          ],
        },
        {
          code: 'Q3.2',
          title: L('Wahrscheinlichkeitsverteilungen', 'Probability distributions'),
          summary: L(
            'Verbindliches Themenfeld. Zufallsgrößen mit Erwartungswert und Streuung, Bernoulli-Ketten und Binomialverteilung; im LK zusätzlich die Normalverteilung.',
            'Mandatory topic area. Random variables with expected value and spread, Bernoulli chains and binomial distribution; in the advanced course also the normal distribution.',
          ),
          parts: [
            {
              code: 'Q3.2.1',
              title: L('Erarbeiten grundlegender Begriffe', 'Developing basic concepts'),
              summary: L(
                'Zufallsgröße, Verteilung im Histogramm, Erwartungswert, Varianz, Standardabweichung; faire Spiele.',
                'Random variable, distribution as histogram, expected value, variance, standard deviation; fair games.',
              ),
            },
            {
              code: 'Q3.2.2',
              title: L('Bernoulli-Ketten', 'Bernoulli chains'),
              summary: L(
                'Formel von Bernoulli begründen und in Sachkontexten anwenden; Modellgrenzen.',
                'Justifying Bernoulli\'s formula and applying it in context; limits of the model.',
              ),
              simulations: ['binomialverteilung'],
            },
            {
              code: 'Q3.2.3',
              title: L('Binomialverteilte Zufallsgrößen', 'Binomially distributed random variables'),
              summary: L(
                'Kenngrößen, Histogramme und kumulierte Wahrscheinlichkeiten, auch inverse Fragestellungen.',
                'Parameters, histograms and cumulative probabilities, including inverse problems.',
              ),
              simulations: ['binomialverteilung'],
            },
            {
              code: 'Q3.2.4',
              title: L(
                'Normalverteilte Zufallsgrößen, Wahrscheinlichkeitsdichte der Normalverteilung (nur LK)',
                'Normally distributed random variables, probability density of the normal distribution (advanced course only)',
              ),
              summary: L(
                'Dichtefunktion, Glockenform, μ und σ, Hoch- und Wendepunkte.',
                'Density function, bell shape, μ and σ, maximum and inflection points.',
              ),
              simulations: ['normalverteilung'],
            },
            {
              code: 'Q3.2.5',
              title: L(
                'Wahrscheinlichkeiten normalverteilter Zufallsgrößen (nur LK)',
                'Probabilities of normally distributed random variables (advanced course only)',
              ),
              summary: L(
                'Verteilungsfunktion, Sigma-Regeln und inverse Fragestellungen.',
                'Cumulative distribution function, sigma rules and inverse problems.',
              ),
              simulations: ['normalverteilung'],
            },
          ],
        },
        {
          code: 'Q3.3',
          title: L('Hypothesentests', 'Hypothesis tests'),
          summary: L(
            '[verbindlich nur im Leistungskurs (im Grundkurs nicht verbindlich)] Signifikanztests für binomialverteilte Zufallsgrößen mit Entscheidungsregel, Fehlern 1. und 2. Art; im LK zusätzlich Operationscharakteristik.',
            '[mandatory in the advanced course only (optional in the basic course)] Significance tests for binomially distributed random variables with decision rule and type I and II errors; in the advanced course also the operating characteristic.',
          ),
          parts: [
            {
              code: 'Q3.3.1',
              title: L(
                'Hypothesentests (rechtsseitige, linksseitige und zweiseitige Signifikanztests) für binomialverteilte Zufallsgrößen',
                'Hypothesis tests (right-, left- and two-tailed significance tests) for binomially distributed random variables',
              ),
              summary: L(
                'Hypothesen festlegen, Ablehnungsbereich bestimmen, Fehler 1. und 2. Art berechnen.',
                'Setting hypotheses, finding the rejection region, calculating type I and II errors.',
              ),
              simulations: ['signifikanztest'],
            },
            {
              code: 'Q3.3.2',
              title: L(
                'Grafische Darstellung der Wahrscheinlichkeiten für das Beibehalten beziehungsweise Verwerfen der Nullhypothese in Abhängigkeit vom wahren Wert der Trefferwahrscheinlichkeit p (nur LK)',
                'Graphical representation of the probabilities of keeping or rejecting the null hypothesis depending on the true value of the success probability p (advanced course only)',
              ),
              summary: L(
                'Operationscharakteristik bzw. Gütefunktion darstellen und deuten.',
                'Plotting and interpreting the operating characteristic or power function.',
              ),
            },
          ],
        },
        {
          code: 'Q3.4',
          title: L('Prognose- und Konfidenzintervalle', 'Prediction and confidence intervals'),
          summary: L(
            'Nicht verbindliches Themenfeld. Mit Sigma-Regeln von der Grundgesamtheit auf die Stichprobe schließen und umgekehrt.',
            'Optional topic area. Using sigma rules to infer from population to sample and vice versa.',
          ),
          parts: [
            {
              code: 'Q3.4.1',
              title: L('Prognoseintervalle für relative Häufigkeiten', 'Prediction intervals for relative frequencies'),
              summary: L('Erwartete Bereiche für Stichprobenergebnisse bestimmen.', 'Determining expected ranges for sample results.'),
            },
            {
              code: 'Q3.4.2',
              title: L('Konfidenzintervalle für Wahrscheinlichkeiten', 'Confidence intervals for probabilities'),
              summary: L(
                'Aus einer Stichprobe einen Bereich für die unbekannte Wahrscheinlichkeit schätzen.',
                'Estimating a range for the unknown probability from a sample.',
              ),
            },
            {
              code: 'Q3.4.3',
              title: L('Konfidenzdiagramme (Konfidenzellipse) (nur LK)', 'Confidence diagrams (confidence ellipse) (advanced course only)'),
              summary: L('Konfidenzbereiche grafisch darstellen.', 'Representing confidence regions graphically.'),
            },
            {
              code: 'Q3.4.4',
              title: L('Stichprobenumfänge (nur LK)', 'Sample sizes (advanced course only)'),
              summary: L(
                'Nötigen Stichprobenumfang für ein Konfidenzniveau berechnen.',
                'Calculating the sample size needed for a confidence level.',
              ),
            },
          ],
        },
        {
          code: 'Q3.5',
          title: L('Statistik und weitere Wahrscheinlichkeitsverteilungen', 'Statistics and further probability distributions'),
          summary: L(
            'Nicht verbindliches Themenfeld. Eigene Datenerhebungen und Simulationen, empirische Kennwerte, Poisson-Verteilung; im LK Näherungen und weitere stetige Verteilungen.',
            'Optional topic area. Own data collection and simulations, empirical statistics, Poisson distribution; in the advanced course approximations and further continuous distributions.',
          ),
          parts: [
            {
              code: 'Q3.5.1',
              title: L('Statistischer Wahrscheinlichkeitsbegriff', 'Statistical concept of probability'),
              summary: L(
                'Eigene Zufallsexperimente durchführen und mit Software simulieren.',
                'Carrying out own random experiments and simulating them with software.',
              ),
            },
            {
              code: 'Q3.5.2',
              title: L('Umgang mit Daten', 'Working with data'),
              summary: L(
                'Eigene Daten mit Mittelwert, empirischer Varianz und Standardabweichung beurteilen.',
                'Assessing own data with mean, empirical variance and standard deviation.',
              ),
            },
            {
              code: 'Q3.5.3',
              title: L('Poisson-Verteilung', 'Poisson distribution'),
              summary: L('Seltene Ereignisse mit der Poisson-Verteilung berechnen.', 'Calculating rare events with the Poisson distribution.'),
            },
            {
              code: 'Q3.5.4',
              title: L(
                'Normalverteilung als Näherung der Binomialverteilung (nur LK)',
                'Normal distribution as approximation of the binomial distribution (advanced course only)',
              ),
              summary: L(
                'Binomial-Histogramme bei großer Streuung durch die Glockenkurve annähern.',
                'Approximating binomial histograms with large spread by the bell curve.',
              ),
              simulations: ['normalverteilung'],
            },
            {
              code: 'Q3.5.5',
              title: L(
                'Poisson-Verteilung als Näherung der Binomialverteilung bei konstantem Erwartungswert (nur LK)',
                'Poisson distribution as approximation of the binomial distribution with constant expected value (advanced course only)',
              ),
              summary: L('Grenzübergang für n → ∞ beweisen.', 'Proving the limit as n → ∞.'),
            },
            {
              code: 'Q3.5.6',
              title: L('Weitere stetige Verteilungen (nur LK)', 'Further continuous distributions (advanced course only)'),
              summary: L('Z. B. die Exponentialverteilung.', 'E.g. the exponential distribution.'),
            },
          ],
        },
        {
          code: 'Q4.1',
          title: L('Funktionenscharen', 'Families of functions'),
          summary: L(
            'Verbindliches Themenfeld. Funktionen mit Parameter untersuchen und integrieren, besonders ganzrationale und mit Exponentialfunktionen verknüpfte Scharen; im LK Ortskurven.',
            'Mandatory topic area. Investigating and integrating functions with a parameter, especially polynomial families and families combined with exponential functions; in the advanced course loci.',
          ),
          parts: [
            {
              code: 'Q4.1.1',
              title: L(
                'Untersuchen und Integrieren von Funktionenscharen ganzrationaler Funktionen, Bedeutung des Parameters für den Graphen',
                'Investigating and integrating families of polynomial functions, meaning of the parameter for the graph',
              ),
              summary: L('Einfluss des Parameters auf Nullstellen, Extrema und Flächen.', 'Influence of the parameter on zeros, extrema and areas.'),
              simulations: ['funktionenscharen'],
            },
            {
              code: 'Q4.1.2',
              title: L(
                'Untersuchen von Funktionenscharen, bei denen Exponentialfunktionen mit ganzrationalen Funktionen verknüpft sind',
                'Investigating families combining exponential and polynomial functions',
              ),
              summary: L(
                'Scharen aus e-Funktion und Polynomen untersuchen und integrieren.',
                'Investigating and integrating families built from exponential functions and polynomials.',
              ),
              simulations: ['funktionenscharen'],
            },
            {
              code: 'Q4.1.3',
              title: L(
                'Untersuchen von Funktionenscharen aller weiteren bekannten Funktionsklassen, falls der Parameter ausschließlich eine Streckung oder Verschiebung bewirkt',
                'Investigating families of all other known function classes if the parameter only causes a stretch or shift',
              ),
              summary: L(
                'Parameter als Verschiebung oder Streckung des Graphen deuten.',
                'Interpreting the parameter as a shift or stretch of the graph.',
              ),
              simulations: ['funktionenscharen'],
            },
            {
              code: 'Q4.1.4',
              title: L('Ortskurven (nur LK)', 'Loci (advanced course only)'),
              summary: L('Ortskurven von Extrem- und Wendepunkten bestimmen.', 'Determining the loci of extreme and inflection points.'),
            },
          ],
        },
        {
          code: 'Q4.2',
          title: L('Problemlösen und Argumentieren', 'Problem solving and reasoning'),
          summary: L(
            'Nicht verbindliches Themenfeld. Prozessbezogenes Themenfeld: Probleme erkennen, heuristische Strategien nutzen und Argumentationen entwickeln, angewandt auf frei gewählte Inhalte aller Sachgebiete.',
            'Optional topic area. Process-oriented topic area: recognising problems, using heuristic strategies and developing arguments, applied to freely chosen content from all areas.',
          ),
          parts: [
            {
              code: 'Q4.2.1',
              title: L('Erkennen und Formulieren mathematischer Probleme', 'Recognising and formulating mathematical problems'),
              summary: L('Fragestellungen mathematisch fassen.', 'Framing questions mathematically.'),
            },
            {
              code: 'Q4.2.2',
              title: L(
                'Anwenden heuristischer Strategien und Prinzipien zur Lösung mathematischer Probleme',
                'Applying heuristic strategies and principles to solve mathematical problems',
              ),
              summary: L(
                'Z. B. Vorwärts-/Rückwärtsarbeiten, systematisches Probieren, Extremal- und Symmetrieprinzip.',
                'E.g. working forwards/backwards, systematic trial, extremal and symmetry principles.',
              ),
            },
            {
              code: 'Q4.2.3',
              title: L(
                'Beurteilen vorgegebener Aussagen oder Stellung nehmen zu vorgegebenen Aussagen',
                'Assessing given statements or commenting on them',
              ),
              summary: L('Aussagen prüfen und begründet bewerten.', 'Checking statements and evaluating them with reasons.'),
            },
            {
              code: 'Q4.2.4',
              title: L(
                'Nachvollziehen, Erläutern und Entwickeln von Argumentationen und logischen Schlussfolgerungen',
                'Following, explaining and developing arguments and logical conclusions',
              ),
              summary: L('Argumentationsketten verstehen und selbst aufbauen.', 'Understanding chains of reasoning and building them oneself.'),
            },
            {
              code: 'Q4.2.5',
              title: L(
                'Anwendung auf exemplarisch durch die Lehrkraft ausgewählte Themenfelder',
                'Application to topic areas chosen by the teacher as examples',
              ),
              summary: L(
                'Beispiele aus Analysis, Analytischer Geometrie, Linearer Algebra und Stochastik.',
                'Examples from calculus, analytic geometry, linear algebra and probability.',
              ),
            },
            {
              code: 'Q4.2.6',
              title: L('Stochastik (nur LK)', 'Probability and statistics (advanced course only)'),
              summary: L(
                'Strategien für Hypothesen und kritische Werte; Einfluss von n auf die Operationscharakteristik.',
                'Strategies for hypotheses and critical values; influence of n on the operating characteristic.',
              ),
              simulations: ['signifikanztest'],
            },
          ],
        },
        {
          code: 'Q4.3',
          title: L('Komplexe Zahlen', 'Complex numbers'),
          summary: L(
            'Nicht verbindliches Themenfeld. Rechnen mit komplexen Zahlen in algebraischer und Polarform und Lösen von Gleichungen in ℂ.',
            'Optional topic area. Calculating with complex numbers in algebraic and polar form and solving equations in ℂ.',
          ),
          parts: [
            {
              code: 'Q4.3.1',
              title: L('Algebraische Form', 'Algebraic form'),
              summary: L('Real- und Imaginärteil, Grundrechenarten.', 'Real and imaginary part, basic operations.'),
            },
            {
              code: 'Q4.3.2',
              title: L('Polarform', 'Polar form'),
              summary: L(
                'Darstellung in der Gaußschen Zahlenebene und geometrische Deutung der Rechenarten.',
                'Representation in the complex plane and geometric interpretation of the operations.',
              ),
            },
            {
              code: 'Q4.3.3',
              title: L('Lösen von Gleichungen in der Menge ℂ der komplexen Zahlen', 'Solving equations in the set ℂ of complex numbers'),
              summary: L('Gleichungen lösen, die in ℝ keine Lösung haben.', 'Solving equations that have no solution in ℝ.'),
            },
            {
              code: 'Q4.3.4',
              title: L(
                'Darstellen der komplexen Zahlen mit 2x2-Matrizen (nur LK)',
                'Representing complex numbers with 2×2 matrices (advanced course only)',
              ),
              summary: L('Komplexe Zahlen als Drehstreckungsmatrizen.', 'Complex numbers as rotation-dilation matrices.'),
            },
          ],
        },
      ],
    },
  ],
};
