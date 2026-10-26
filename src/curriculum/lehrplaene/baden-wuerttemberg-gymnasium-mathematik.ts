import { L } from "../helpers";
import type { StateCurriculum } from "./types";

/**
 * Mathematik am Gymnasium in Baden-Württemberg (G9) nach dem Bildungsplan:
 * Doppelklassenstufen 5/6, 7/8 und 9/10 (bei beiden Klassen eingetragen),
 * Klasse 11 und Kursstufe 12/13 mit Leistungsfach (3.5) und Basisfach (3.6).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/baden-wuerttemberg-gymnasium-mathematik.{json,md}.
 * Überschriften wie im Bildungsplan, Kurzbeschreibungen in eigenen Worten.
 * Simulationen nur, wo ihre Klassenstufe passt. Verbindlich ist der Originaltext.
 */
export const badenWuerttembergGymnasiumMathematik: StateCurriculum = {
  id: "baden-wuerttemberg-gymnasium-mathematik",
  subject: "mathematik",
  slug: L("baden-wuerttemberg-gymnasium", "baden-wuerttemberg-gymnasium"),
  state: L("Baden-Württemberg", "Baden-Württemberg"),
  schoolType: L("Gymnasium", "Gymnasium"),
  sourceName: "Bildungsplan",
  grades: [
    {
      grade: 5,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.1 gilt für die Doppelklassenstufe 5/6; derselbe Inhalt steht auch bei Klasse 6. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.1 covers the double grade 5/6; the same content is also listed under grade 6. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.1.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Natürliche, ganze und rationale Zahlen verstehen, darstellen und vergleichen und sicher mit ihnen rechnen. Dazu gehören Brüche, Dezimalzahlen und erste Terme.",
            "Understanding, representing and comparing natural numbers, integers and rational numbers and calculating with them confidently, including fractions, decimals and first expressions.",
          ),
          parts: [
            {
              code: "3.1.1 (1)–(11)",
              title: L("Zahlbereiche erkunden", "Exploring number sets"),
              summary: L(
                "Stellenwertsystem, große Zahlen, Teilbarkeit und Primfaktoren; negative Zahlen und Brüche als Anteile darstellen, auf der Zahlengeraden ordnen und in Dezimalzahlen und Prozent umwandeln.",
                "Place value, large numbers, divisibility and prime factors; negative numbers and fractions as parts, ordered on the number line and converted to decimals and percentages.",
              ),
              simulations: ["stellenwerte", "primfaktoren", "zahlengerade"],
            },
            {
              code: "3.1.1 (12)–(22)",
              title: L("mit Zahlen rechnen", "Calculating with numbers"),
              summary: L(
                "Kopfrechnen und schriftliche Verfahren, Kommaverschiebung, Potenzen und Quadratzahlen, Brüche erweitern, kürzen und mit allen Grundrechenarten verknüpfen; sinnvoll runden und Ergebnisse prüfen.",
                "Mental and written arithmetic, shifting the decimal point, powers and square numbers, simplifying and expanding fractions and using all four operations with them; sensible rounding and checking results.",
              ),
              simulations: ["zehnerpotenzen", "stellenwerte"],
            },
            {
              code: "3.1.1 (23)–(28)",
              title: L(
                "mit Zahltermen arbeiten",
                "Working with numerical expressions",
              ),
              summary: L(
                "Sachsituationen als Zahlterme aufschreiben, Terme mit Fachbegriffen beschreiben und mit Klammern und Rechengesetzen geschickt berechnen; einfache Aufgaben mit Unbekannten durch Probieren lösen.",
                "Writing real situations as numerical expressions, describing their structure with technical terms and evaluating them cleverly using brackets and laws of arithmetic; solving simple problems with unknowns by trial.",
              ),
              simulations: ["termbaum"],
            },
          ],
        },
        {
          code: "3.1.2",
          title: L("Leitidee Messen", "Guiding idea: measuring"),
          summary: L(
            "Messen als Auslegen mit Einheiten verstehen, Größen schätzen und umrechnen. Umfang, Flächeninhalt, Oberfläche und Volumen einfacher Figuren und Körper berechnen.",
            "Understanding measurement as filling with units, estimating and converting quantities, and calculating perimeter, area, surface area and volume of simple figures and solids.",
          ),
          parts: [
            {
              code: "3.1.2 (1)–(8)",
              title: L("mit Größen umgehen", "Working with quantities"),
              summary: L(
                "Längen, Flächen, Volumen, Massen, Zeit und Geld messen, mit Vorsilben und Einheiten umrechnen und mit Alltagsgrößen schätzen; Winkel messen und schätzen.",
                "Measuring length, area, volume, mass, time and money, converting units with prefixes and estimating with everyday benchmarks; measuring and estimating angles.",
              ),
              simulations: ["einheiten", "winkel-messen"],
            },
            {
              code: "3.1.2 (9)–(15)",
              title: L(
                "bei Figuren und Körpern Größen berechnen",
                "Calculating quantities of figures and solids",
              ),
              summary: L(
                "Umfang und Flächeninhalt von Vielecken und Kreis (mit der Zahl π) bestimmen und die Formeln anschaulich begründen; Oberfläche und Volumen von Würfel und Quader berechnen.",
                "Finding perimeter and area of polygons and the circle (with the number π) and justifying the formulas visually; calculating surface area and volume of cubes and cuboids.",
              ),
              simulations: ["umfang-flaeche", "koerpernetze"],
            },
          ],
        },
        {
          code: "3.1.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Geometrische Formen in der Umwelt erkennen und mit Fachbegriffen beschreiben. Mit Geodreieck, Lineal und Zirkel genau zeichnen, auch Spiegelungen und Körperdarstellungen.",
            "Recognising geometric shapes in the environment and describing them with technical terms; drawing accurately with set square, ruler and compass, including reflections and representations of solids.",
          ),
          parts: [
            {
              code: "3.1.3 (1)–(7)",
              title: L(
                "geometrische Objekte und Beziehungen identifizieren und beschreiben",
                "Identifying and describing geometric objects and relations",
              ),
              summary: L(
                "Parallele und senkrechte Geraden, Winkelarten, Symmetrien, Dreiecks- und Viereckstypen sowie Grundkörper erkennen und ihre Eigenschaften nennen.",
                "Recognising parallel and perpendicular lines, types of angles, symmetries, types of triangles and quadrilaterals and basic solids, and naming their properties.",
              ),
              simulations: ["koordinaten-lage", "winkel-messen", "vierecke"],
            },
            {
              code: "3.1.3 (8)–(15)",
              title: L(
                "geometrische Objekte zeichnen und konstruieren",
                "Drawing and constructing geometric objects",
              ),
              summary: L(
                "Kreise, Senkrechte, Parallelen und Winkel zeichnen, Abstände und Höhen bestimmen, Figuren im Koordinatensystem darstellen, Achsen- und Punktspiegelungen ausführen sowie Netze und Schrägbilder von Körpern zeichnen.",
                "Drawing circles, perpendiculars, parallels and angles, finding distances and heights, plotting figures in a coordinate system, carrying out line and point reflections and drawing nets and oblique views of solids.",
              ),
              simulations: ["koordinaten-lage", "koerpernetze"],
            },
          ],
        },
        {
          code: "3.1.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Zusammenhänge zwischen Zahlen und Größen erkennen und in Worten, Tabellen und Graphen darstellen. Proportional und antiproportional rechnen und mit Maßstäben arbeiten.",
            "Recognising relationships between numbers and quantities and representing them in words, tables and graphs; calculating with direct and inverse proportion and working with scales.",
          ),
          parts: [
            {
              code: "3.1.4 (1)–(8)",
              title: L("Zusammenhänge beschreiben", "Describing relationships"),
              summary: L(
                "Muster fortsetzen, Punkte im Koordinatensystem eintragen und ablesen, zwischen Darstellungen wechseln; Sachaufgaben mit Dreisatz lösen und maßstäblich zeichnen und rechnen.",
                "Continuing patterns, plotting and reading points in a coordinate system, switching between representations; solving word problems with the rule of three and drawing and calculating to scale.",
              ),
              simulations: ["massstab", "koordinaten-lage"],
            },
          ],
        },
        {
          code: "3.1.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Daten selbst erheben, in Tabellen und Diagrammen darstellen und mit einfachen Kenngrößen auswerten. Diagramme kritisch auf Irreführung prüfen.",
            "Collecting data, presenting them in tables and charts and analysing them with simple statistics; checking charts critically for misleading presentation.",
          ),
          parts: [
            {
              code: "3.1.5 (1)–(8)",
              title: L(
                "Daten erfassen, darstellen und auswerten",
                "Collecting, presenting and analysing data",
              ),
              summary: L(
                "Datenerhebungen planen, absolute und relative Häufigkeiten bestimmen, Balken-, Säulen- und Kreisdiagramme erstellen, Minimum, Maximum, Spannweite, Median und Mittelwert bestimmen und Darstellungen beurteilen.",
                "Planning surveys, finding absolute and relative frequencies, drawing bar, column and pie charts, determining minimum, maximum, range, median and mean, and judging presentations.",
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 6,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.1 gilt für die Doppelklassenstufe 5/6; derselbe Inhalt steht auch bei Klasse 5. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.1 covers the double grade 5/6; the same content is also listed under grade 5. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.1.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Natürliche, ganze und rationale Zahlen verstehen, darstellen und vergleichen und sicher mit ihnen rechnen. Dazu gehören Brüche, Dezimalzahlen und erste Terme.",
            "Understanding, representing and comparing natural numbers, integers and rational numbers and calculating with them confidently, including fractions, decimals and first expressions.",
          ),
          parts: [
            {
              code: "3.1.1 (1)–(11)",
              title: L("Zahlbereiche erkunden", "Exploring number sets"),
              summary: L(
                "Stellenwertsystem, große Zahlen, Teilbarkeit und Primfaktoren; negative Zahlen und Brüche als Anteile darstellen, auf der Zahlengeraden ordnen und in Dezimalzahlen und Prozent umwandeln.",
                "Place value, large numbers, divisibility and prime factors; negative numbers and fractions as parts, ordered on the number line and converted to decimals and percentages.",
              ),
              simulations: [
                "primfaktoren",
                "bruchteile",
                "brueche-vergleichen",
                "dezimalbrueche",
              ],
            },
            {
              code: "3.1.1 (12)–(22)",
              title: L("mit Zahlen rechnen", "Calculating with numbers"),
              summary: L(
                "Kopfrechnen und schriftliche Verfahren, Kommaverschiebung, Potenzen und Quadratzahlen, Brüche erweitern, kürzen und mit allen Grundrechenarten verknüpfen; sinnvoll runden und Ergebnisse prüfen.",
                "Mental and written arithmetic, shifting the decimal point, powers and square numbers, simplifying and expanding fractions and using all four operations with them; sensible rounding and checking results.",
              ),
              simulations: [
                "brueche-vergleichen",
                "brueche-rechnen",
                "zehnerpotenzen",
              ],
            },
            {
              code: "3.1.1 (23)–(28)",
              title: L(
                "mit Zahltermen arbeiten",
                "Working with numerical expressions",
              ),
              summary: L(
                "Sachsituationen als Zahlterme aufschreiben, Terme mit Fachbegriffen beschreiben und mit Klammern und Rechengesetzen geschickt berechnen; einfache Aufgaben mit Unbekannten durch Probieren lösen.",
                "Writing real situations as numerical expressions, describing their structure with technical terms and evaluating them cleverly using brackets and laws of arithmetic; solving simple problems with unknowns by trial.",
              ),
              simulations: ["termbaum"],
            },
          ],
        },
        {
          code: "3.1.2",
          title: L("Leitidee Messen", "Guiding idea: measuring"),
          summary: L(
            "Messen als Auslegen mit Einheiten verstehen, Größen schätzen und umrechnen. Umfang, Flächeninhalt, Oberfläche und Volumen einfacher Figuren und Körper berechnen.",
            "Understanding measurement as filling with units, estimating and converting quantities, and calculating perimeter, area, surface area and volume of simple figures and solids.",
          ),
          parts: [
            {
              code: "3.1.2 (1)–(8)",
              title: L("mit Größen umgehen", "Working with quantities"),
              summary: L(
                "Längen, Flächen, Volumen, Massen, Zeit und Geld messen, mit Vorsilben und Einheiten umrechnen und mit Alltagsgrößen schätzen; Winkel messen und schätzen.",
                "Measuring length, area, volume, mass, time and money, converting units with prefixes and estimating with everyday benchmarks; measuring and estimating angles.",
              ),
            },
            {
              code: "3.1.2 (9)–(15)",
              title: L(
                "bei Figuren und Körpern Größen berechnen",
                "Calculating quantities of figures and solids",
              ),
              summary: L(
                "Umfang und Flächeninhalt von Vielecken und Kreis (mit der Zahl π) bestimmen und die Formeln anschaulich begründen; Oberfläche und Volumen von Würfel und Quader berechnen.",
                "Finding perimeter and area of polygons and the circle (with the number π) and justifying the formulas visually; calculating surface area and volume of cubes and cuboids.",
              ),
              simulations: [
                "flaechen-zerlegen",
                "quader-volumen",
                "koerpernetze",
              ],
            },
          ],
        },
        {
          code: "3.1.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Geometrische Formen in der Umwelt erkennen und mit Fachbegriffen beschreiben. Mit Geodreieck, Lineal und Zirkel genau zeichnen, auch Spiegelungen und Körperdarstellungen.",
            "Recognising geometric shapes in the environment and describing them with technical terms; drawing accurately with set square, ruler and compass, including reflections and representations of solids.",
          ),
          parts: [
            {
              code: "3.1.3 (1)–(7)",
              title: L(
                "geometrische Objekte und Beziehungen identifizieren und beschreiben",
                "Identifying and describing geometric objects and relations",
              ),
              summary: L(
                "Parallele und senkrechte Geraden, Winkelarten, Symmetrien, Dreiecks- und Viereckstypen sowie Grundkörper erkennen und ihre Eigenschaften nennen.",
                "Recognising parallel and perpendicular lines, types of angles, symmetries, types of triangles and quadrilaterals and basic solids, and naming their properties.",
              ),
              simulations: ["vierecke"],
            },
            {
              code: "3.1.3 (8)–(15)",
              title: L(
                "geometrische Objekte zeichnen und konstruieren",
                "Drawing and constructing geometric objects",
              ),
              summary: L(
                "Kreise, Senkrechte, Parallelen und Winkel zeichnen, Abstände und Höhen bestimmen, Figuren im Koordinatensystem darstellen, Achsen- und Punktspiegelungen ausführen sowie Netze und Schrägbilder von Körpern zeichnen.",
                "Drawing circles, perpendiculars, parallels and angles, finding distances and heights, plotting figures in a coordinate system, carrying out line and point reflections and drawing nets and oblique views of solids.",
              ),
              simulations: ["koerpernetze", "spiegelung"],
            },
          ],
        },
        {
          code: "3.1.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Zusammenhänge zwischen Zahlen und Größen erkennen und in Worten, Tabellen und Graphen darstellen. Proportional und antiproportional rechnen und mit Maßstäben arbeiten.",
            "Recognising relationships between numbers and quantities and representing them in words, tables and graphs; calculating with direct and inverse proportion and working with scales.",
          ),
          parts: [
            {
              code: "3.1.4 (1)–(8)",
              title: L("Zusammenhänge beschreiben", "Describing relationships"),
              summary: L(
                "Muster fortsetzen, Punkte im Koordinatensystem eintragen und ablesen, zwischen Darstellungen wechseln; Sachaufgaben mit Dreisatz lösen und maßstäblich zeichnen und rechnen.",
                "Continuing patterns, plotting and reading points in a coordinate system, switching between representations; solving word problems with the rule of three and drawing and calculating to scale.",
              ),
              simulations: ["proportional"],
            },
          ],
        },
        {
          code: "3.1.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Daten selbst erheben, in Tabellen und Diagrammen darstellen und mit einfachen Kenngrößen auswerten. Diagramme kritisch auf Irreführung prüfen.",
            "Collecting data, presenting them in tables and charts and analysing them with simple statistics; checking charts critically for misleading presentation.",
          ),
          parts: [
            {
              code: "3.1.5 (1)–(8)",
              title: L(
                "Daten erfassen, darstellen und auswerten",
                "Collecting, presenting and analysing data",
              ),
              summary: L(
                "Datenerhebungen planen, absolute und relative Häufigkeiten bestimmen, Balken-, Säulen- und Kreisdiagramme erstellen, Minimum, Maximum, Spannweite, Median und Mittelwert bestimmen und Darstellungen beurteilen.",
                "Planning surveys, finding absolute and relative frequencies, drawing bar, column and pie charts, determining minimum, maximum, range, median and mean, and judging presentations.",
              ),
              simulations: ["diagramme", "boxplot"],
            },
          ],
        },
      ],
    },
    {
      grade: 7,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.2 gilt für die Doppelklassenstufe 7/8; derselbe Inhalt steht auch bei Klasse 8. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.2 covers the double grade 7/8; the same content is also listed under grade 8. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.2.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Prozent- und Zinsrechnung, Terme mit Variablen und binomische Formeln, Quadratwurzeln und die reellen Zahlen. Lineare Gleichungen und Gleichungssysteme lösen.",
            "Percentages and interest, algebraic expressions and binomial formulas, square roots and the real numbers; solving linear equations and systems of equations.",
          ),
          parts: [
            {
              code: "3.2.1 (1)",
              title: L(
                "Zahlterme berechnen",
                "Evaluating numerical expressions",
              ),
              summary: L(
                "Terme mit rationalen Zahlen in verschiedenen Darstellungen vereinfachen und ihren Wert berechnen.",
                "Simplifying expressions with rational numbers in different forms and calculating their value.",
              ),
              simulations: ["termbaum"],
            },
            {
              code: "3.2.1 (2)–(4)",
              title: L(
                "mit Prozenten und Zinsen umgehen",
                "Working with percentages and interest",
              ),
              summary: L(
                "Grundwert, Prozentwert und Prozentsatz veranschaulichen und berechnen; Zinsen und Zinseszinsen schrittweise bestimmen, auch mit Tabellenkalkulation.",
                "Visualising and calculating base value, percentage value and percentage rate; working out simple and compound interest step by step, also with a spreadsheet.",
              ),
              simulations: ["prozentstreifen"],
            },
            {
              code: "3.2.1 (5)–(11)",
              title: L(
                "mit Termen umgehen, die auch Variablen enthalten",
                "Working with expressions containing variables",
              ),
              summary: L(
                "Situationen und Zahlenfolgen mit Variablen beschreiben, Terme mit Rechengesetzen umformen, ausmultiplizieren und ausklammern, binomische Formeln anwenden und Formeln umstellen.",
                "Describing situations and sequences with variables, transforming expressions with the laws of arithmetic, expanding and factorising, using binomial formulas and rearranging formulas.",
              ),
              simulations: ["binomische-formeln", "termbaum"],
            },
            {
              code: "3.2.1 (12)–(16)",
              title: L("mit Wurzeln umgehen", "Working with roots"),
              summary: L(
                "Wurzelziehen als Umkehrung des Quadrierens verstehen, Wurzeln abschätzen und Wurzelterme vereinfachen; auch Kubikwurzeln.",
                "Understanding square roots as the inverse of squaring, estimating roots and simplifying expressions with roots; also cube roots.",
              ),
            },
            {
              code: "3.2.1 (17)–(19)",
              title: L(
                "Zahlbereichserweiterungen untersuchen",
                "Investigating extensions of number sets",
              ),
              summary: L(
                "Begründen, warum die rationalen Zahlen nicht ausreichen, irrationale Zahlen nennen und eine Wurzel mit einem Näherungsverfahren bestimmen, auch digital.",
                "Explaining why rational numbers are not sufficient, giving examples of irrational numbers and approximating a root with an iterative method, also digitally.",
              ),
            },
            {
              code: "3.2.1 (20)–(24)",
              title: L("Gleichungen lösen", "Solving equations"),
              summary: L(
                "Lineare Gleichungen durch Probieren und Äquivalenzumformungen lösen, lineare Gleichungssysteme mit zwei Variablen lösen und grafisch als Schnittpunkt von Geraden deuten; einfache Ungleichungen.",
                "Solving linear equations by trial and equivalent transformations, solving linear systems in two variables and interpreting them graphically as intersections of lines; simple inequalities.",
              ),
              simulations: ["waagemodell"],
            },
          ],
        },
        {
          code: "3.2.2",
          title: L(
            "Leitidee Messen (keine Inhalte in den Klassen 7/8)",
            "Guiding idea: measuring (no content in grades 7/8)",
          ),
          summary: L(
            "In den Klassen 7/8 sieht der Bildungsplan für diese Leitidee keine Inhalte vor.",
            "The curriculum has no content for this guiding idea in grades 7/8.",
          ),
        },
        {
          code: "3.2.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Winkelsätze, Dreieckskonstruktionen und der Satz des Thales; Ortslinien, zentrische Streckung, Strahlensätze und Ähnlichkeit. Zusammenhänge werden begründet und bewiesen.",
            "Angle theorems, constructing triangles and Thales’ theorem; loci, enlargements, intercept theorems and similarity, with reasoning and proof.",
          ),
          parts: [
            {
              code: "3.2.3 (1)–(6)",
              title: L(
                "geometrische Figuren untersuchen",
                "Investigating geometric figures",
              ),
              summary: L(
                "Winkel an Geradenkreuzungen und Parallelen, Winkelsumme im Dreieck, Basiswinkelsatz und Satz des Thales nutzen; prüfen, ob und wie viele Dreiecke sich konstruieren lassen.",
                "Using angles at intersecting and parallel lines, the angle sum of a triangle, the base angle theorem and Thales’ theorem; checking whether and how many triangles can be constructed.",
              ),
              simulations: [
                "winkel-geradenkreuzung",
                "winkelsumme",
                "thales",
                "dreieckskonstruktion",
              ],
            },
            {
              code: "3.2.3 (7)–(10)",
              title: L(
                "Ortslinien konstruieren und mit Ortslinien arbeiten",
                "Constructing and working with loci",
              ),
              summary: L(
                "Mittelsenkrechte und Winkelhalbierende mit Zirkel und Lineal konstruieren, Probleme mit Ortslinien lösen, Umkreis- und Inkreismittelpunkt finden und Tangenten an Kreise konstruieren.",
                "Constructing perpendicular bisectors and angle bisectors with compass and ruler, solving problems with loci, finding circumcentre and incentre and constructing tangents to circles.",
              ),
              simulations: ["mittelsenkrechte", "besondere-linien"],
            },
            {
              code: "3.2.3 (11)–(13)",
              title: L(
                "mit zentrischer Streckung und den Strahlensätzen arbeiten",
                "Working with enlargements and the intercept theorems",
              ),
              summary: L(
                "Figuren durch zentrische Streckung vergrößern und verkleinern und Streckenlängen mit den Strahlensätzen berechnen.",
                "Enlarging and reducing figures by central dilation and calculating lengths with the intercept theorems.",
              ),
            },
            {
              code: "3.2.3 (14)–(16)",
              title: L(
                "ähnliche Figuren untersuchen und mit Ähnlichkeitsbeziehungen arbeiten",
                "Investigating similar figures and using similarity",
              ),
              summary: L(
                "Figuren auf Ähnlichkeit und Kongruenz prüfen, Ähnlichkeitssätze für Dreiecke anwenden und damit Zusammenhänge begründen und Größen berechnen.",
                "Checking figures for similarity and congruence, applying similarity criteria for triangles and using them to justify relationships and calculate lengths.",
              ),
              simulations: ["dreieckskonstruktion"],
            },
          ],
        },
        {
          code: "3.2.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Funktionen als eindeutige Zuordnungen in Tabelle, Graph, Gleichung und Text darstellen. Lineare Funktionen mit Steigung und y-Achsenabschnitt untersuchen und anwenden.",
            "Representing functions as unique assignments in tables, graphs, equations and words; investigating and applying linear functions with gradient and y-intercept.",
          ),
          parts: [
            {
              code: "3.2.4 (1)–(5)",
              title: L(
                "funktionale Zusammenhänge darstellen und nutzen",
                "Representing and using functional relationships",
              ),
              summary: L(
                "Zwischen Tabelle, Gleichung, Graph und Text wechseln, Werte und Verläufe ablesen, proportionale und antiproportionale Zusammenhänge nutzen und Funktionen von anderen Zuordnungen unterscheiden.",
                "Switching between table, equation, graph and words, reading values and trends, using direct and inverse proportion and distinguishing functions from other assignments.",
              ),
              simulations: ["proportional"],
            },
            {
              code: "3.2.4 (6)–(9)",
              title: L(
                "mit linearen Funktionen umgehen",
                "Working with linear functions",
              ),
              summary: L(
                "Geraden mit Steigungsdreieck zeichnen, Geradengleichungen aus zwei Punkten aufstellen, die Steigung als Änderungsrate deuten und die Lage zweier Geraden untersuchen.",
                "Drawing lines using a gradient triangle, finding the equation of a line through two points, interpreting the gradient as a rate of change and investigating how two lines lie.",
              ),
              simulations: ["lineare-funktion"],
            },
          ],
        },
        {
          code: "3.2.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Daten aus Quellen auswerten und Aussagen bewerten. Wahrscheinlichkeiten über relative Häufigkeiten, Laplace-Experimente und Baumdiagramme bestimmen.",
            "Analysing data from sources and evaluating statements; finding probabilities from relative frequencies, Laplace experiments and tree diagrams.",
          ),
          parts: [
            {
              code: "3.2.5 (1)–(2)",
              title: L(
                "Daten aus- und bewerten",
                "Analysing and evaluating data",
              ),
              summary: L(
                "Zu einer Frage Daten aus fremden Quellen entnehmen und darauf beruhende Aussagen formulieren und kritisch bewerten.",
                "Taking data for a question from secondary sources and formulating and critically evaluating statements based on them.",
              ),
              simulations: ["boxplot", "diagramme"],
            },
            {
              code: "3.2.5 (3)–(12)",
              title: L(
                "Wahrscheinlichkeiten verstehen und berechnen",
                "Understanding and calculating probabilities",
              ),
              summary: L(
                "Ergebnisse und Ereignisse beschreiben, Zufallsexperimente durchführen, relative Häufigkeiten als Schätzwerte deuten (Gesetz der großen Zahlen), Möglichkeiten abzählen und mit Gegenereignis, Baumdiagramm und Pfadregeln rechnen.",
                "Describing outcomes and events, carrying out random experiments, interpreting relative frequencies as estimates (law of large numbers), counting possibilities and using complementary events, tree diagrams and path rules.",
              ),
              simulations: ["gesetz-grosse-zahlen", "zaehlprinzip"],
            },
          ],
        },
      ],
    },
    {
      grade: 8,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.2 gilt für die Doppelklassenstufe 7/8; derselbe Inhalt steht auch bei Klasse 7. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.2 covers the double grade 7/8; the same content is also listed under grade 7. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.2.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Prozent- und Zinsrechnung, Terme mit Variablen und binomische Formeln, Quadratwurzeln und die reellen Zahlen. Lineare Gleichungen und Gleichungssysteme lösen.",
            "Percentages and interest, algebraic expressions and binomial formulas, square roots and the real numbers; solving linear equations and systems of equations.",
          ),
          parts: [
            {
              code: "3.2.1 (1)",
              title: L(
                "Zahlterme berechnen",
                "Evaluating numerical expressions",
              ),
              summary: L(
                "Terme mit rationalen Zahlen in verschiedenen Darstellungen vereinfachen und ihren Wert berechnen.",
                "Simplifying expressions with rational numbers in different forms and calculating their value.",
              ),
            },
            {
              code: "3.2.1 (2)–(4)",
              title: L(
                "mit Prozenten und Zinsen umgehen",
                "Working with percentages and interest",
              ),
              summary: L(
                "Grundwert, Prozentwert und Prozentsatz veranschaulichen und berechnen; Zinsen und Zinseszinsen schrittweise bestimmen, auch mit Tabellenkalkulation.",
                "Visualising and calculating base value, percentage value and percentage rate; working out simple and compound interest step by step, also with a spreadsheet.",
              ),
            },
            {
              code: "3.2.1 (5)–(11)",
              title: L(
                "mit Termen umgehen, die auch Variablen enthalten",
                "Working with expressions containing variables",
              ),
              summary: L(
                "Situationen und Zahlenfolgen mit Variablen beschreiben, Terme mit Rechengesetzen umformen, ausmultiplizieren und ausklammern, binomische Formeln anwenden und Formeln umstellen.",
                "Describing situations and sequences with variables, transforming expressions with the laws of arithmetic, expanding and factorising, using binomial formulas and rearranging formulas.",
              ),
            },
            {
              code: "3.2.1 (12)–(16)",
              title: L("mit Wurzeln umgehen", "Working with roots"),
              summary: L(
                "Wurzelziehen als Umkehrung des Quadrierens verstehen, Wurzeln abschätzen und Wurzelterme vereinfachen; auch Kubikwurzeln.",
                "Understanding square roots as the inverse of squaring, estimating roots and simplifying expressions with roots; also cube roots.",
              ),
              simulations: ["quadratwurzel"],
            },
            {
              code: "3.2.1 (17)–(19)",
              title: L(
                "Zahlbereichserweiterungen untersuchen",
                "Investigating extensions of number sets",
              ),
              summary: L(
                "Begründen, warum die rationalen Zahlen nicht ausreichen, irrationale Zahlen nennen und eine Wurzel mit einem Näherungsverfahren bestimmen, auch digital.",
                "Explaining why rational numbers are not sufficient, giving examples of irrational numbers and approximating a root with an iterative method, also digitally.",
              ),
              simulations: ["quadratwurzel"],
            },
            {
              code: "3.2.1 (20)–(24)",
              title: L("Gleichungen lösen", "Solving equations"),
              summary: L(
                "Lineare Gleichungen durch Probieren und Äquivalenzumformungen lösen, lineare Gleichungssysteme mit zwei Variablen lösen und grafisch als Schnittpunkt von Geraden deuten; einfache Ungleichungen.",
                "Solving linear equations by trial and equivalent transformations, solving linear systems in two variables and interpreting them graphically as intersections of lines; simple inequalities.",
              ),
              simulations: ["lgs-grafisch", "gleichungen-grafisch"],
            },
          ],
        },
        {
          code: "3.2.2",
          title: L(
            "Leitidee Messen (keine Inhalte in den Klassen 7/8)",
            "Guiding idea: measuring (no content in grades 7/8)",
          ),
          summary: L(
            "In den Klassen 7/8 sieht der Bildungsplan für diese Leitidee keine Inhalte vor.",
            "The curriculum has no content for this guiding idea in grades 7/8.",
          ),
        },
        {
          code: "3.2.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Winkelsätze, Dreieckskonstruktionen und der Satz des Thales; Ortslinien, zentrische Streckung, Strahlensätze und Ähnlichkeit. Zusammenhänge werden begründet und bewiesen.",
            "Angle theorems, constructing triangles and Thales’ theorem; loci, enlargements, intercept theorems and similarity, with reasoning and proof.",
          ),
          parts: [
            {
              code: "3.2.3 (1)–(6)",
              title: L(
                "geometrische Figuren untersuchen",
                "Investigating geometric figures",
              ),
              summary: L(
                "Winkel an Geradenkreuzungen und Parallelen, Winkelsumme im Dreieck, Basiswinkelsatz und Satz des Thales nutzen; prüfen, ob und wie viele Dreiecke sich konstruieren lassen.",
                "Using angles at intersecting and parallel lines, the angle sum of a triangle, the base angle theorem and Thales’ theorem; checking whether and how many triangles can be constructed.",
              ),
            },
            {
              code: "3.2.3 (7)–(10)",
              title: L(
                "Ortslinien konstruieren und mit Ortslinien arbeiten",
                "Constructing and working with loci",
              ),
              summary: L(
                "Mittelsenkrechte und Winkelhalbierende mit Zirkel und Lineal konstruieren, Probleme mit Ortslinien lösen, Umkreis- und Inkreismittelpunkt finden und Tangenten an Kreise konstruieren.",
                "Constructing perpendicular bisectors and angle bisectors with compass and ruler, solving problems with loci, finding circumcentre and incentre and constructing tangents to circles.",
              ),
              simulations: ["besondere-linien"],
            },
            {
              code: "3.2.3 (11)–(13)",
              title: L(
                "mit zentrischer Streckung und den Strahlensätzen arbeiten",
                "Working with enlargements and the intercept theorems",
              ),
              summary: L(
                "Figuren durch zentrische Streckung vergrößern und verkleinern und Streckenlängen mit den Strahlensätzen berechnen.",
                "Enlarging and reducing figures by central dilation and calculating lengths with the intercept theorems.",
              ),
              simulations: ["strahlensaetze", "vergroessern"],
            },
            {
              code: "3.2.3 (14)–(16)",
              title: L(
                "ähnliche Figuren untersuchen und mit Ähnlichkeitsbeziehungen arbeiten",
                "Investigating similar figures and using similarity",
              ),
              summary: L(
                "Figuren auf Ähnlichkeit und Kongruenz prüfen, Ähnlichkeitssätze für Dreiecke anwenden und damit Zusammenhänge begründen und Größen berechnen.",
                "Checking figures for similarity and congruence, applying similarity criteria for triangles and using them to justify relationships and calculate lengths.",
              ),
            },
          ],
        },
        {
          code: "3.2.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Funktionen als eindeutige Zuordnungen in Tabelle, Graph, Gleichung und Text darstellen. Lineare Funktionen mit Steigung und y-Achsenabschnitt untersuchen und anwenden.",
            "Representing functions as unique assignments in tables, graphs, equations and words; investigating and applying linear functions with gradient and y-intercept.",
          ),
          parts: [
            {
              code: "3.2.4 (1)–(5)",
              title: L(
                "funktionale Zusammenhänge darstellen und nutzen",
                "Representing and using functional relationships",
              ),
              summary: L(
                "Zwischen Tabelle, Gleichung, Graph und Text wechseln, Werte und Verläufe ablesen, proportionale und antiproportionale Zusammenhänge nutzen und Funktionen von anderen Zuordnungen unterscheiden.",
                "Switching between table, equation, graph and words, reading values and trends, using direct and inverse proportion and distinguishing functions from other assignments.",
              ),
              simulations: ["proportional", "funktion-zuordnung"],
            },
            {
              code: "3.2.4 (6)–(9)",
              title: L(
                "mit linearen Funktionen umgehen",
                "Working with linear functions",
              ),
              summary: L(
                "Geraden mit Steigungsdreieck zeichnen, Geradengleichungen aus zwei Punkten aufstellen, die Steigung als Änderungsrate deuten und die Lage zweier Geraden untersuchen.",
                "Drawing lines using a gradient triangle, finding the equation of a line through two points, interpreting the gradient as a rate of change and investigating how two lines lie.",
              ),
              simulations: ["lineare-funktion", "lgs-grafisch"],
            },
          ],
        },
        {
          code: "3.2.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Daten aus Quellen auswerten und Aussagen bewerten. Wahrscheinlichkeiten über relative Häufigkeiten, Laplace-Experimente und Baumdiagramme bestimmen.",
            "Analysing data from sources and evaluating statements; finding probabilities from relative frequencies, Laplace experiments and tree diagrams.",
          ),
          parts: [
            {
              code: "3.2.5 (1)–(2)",
              title: L(
                "Daten aus- und bewerten",
                "Analysing and evaluating data",
              ),
              summary: L(
                "Zu einer Frage Daten aus fremden Quellen entnehmen und darauf beruhende Aussagen formulieren und kritisch bewerten.",
                "Taking data for a question from secondary sources and formulating and critically evaluating statements based on them.",
              ),
            },
            {
              code: "3.2.5 (3)–(12)",
              title: L(
                "Wahrscheinlichkeiten verstehen und berechnen",
                "Understanding and calculating probabilities",
              ),
              summary: L(
                "Ergebnisse und Ereignisse beschreiben, Zufallsexperimente durchführen, relative Häufigkeiten als Schätzwerte deuten (Gesetz der großen Zahlen), Möglichkeiten abzählen und mit Gegenereignis, Baumdiagramm und Pfadregeln rechnen.",
                "Describing outcomes and events, carrying out random experiments, interpreting relative frequencies as estimates (law of large numbers), counting possibilities and using complementary events, tree diagrams and path rules.",
              ),
              simulations: [
                "gesetz-grosse-zahlen",
                "zaehlprinzip",
                "baumdiagramm",
              ],
            },
          ],
        },
      ],
    },
    {
      grade: 9,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.3 gilt für die Doppelklassenstufe 9/10; derselbe Inhalt steht auch bei Klasse 10. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.3 covers the double grade 9/10; the same content is also listed under grade 10. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.3.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Potenzen mit rationalen Exponenten und das Lösen von quadratischen, Wurzel-, Potenz-, Bruch- und Exponentialgleichungen. Exponentielles Wachstum am Beispiel der Zinseszinsformel.",
            "Powers with rational exponents and solving quadratic, radical, power, rational and exponential equations; exponential growth using the compound interest formula.",
          ),
          parts: [
            {
              code: "3.3.1 (1)–(3)",
              title: L("mit Potenzen umgehen", "Working with powers"),
              summary: L(
                "Zahlen in wissenschaftlicher Schreibweise angeben, Potenzen mit rationalen Exponenten als Wurzeln deuten und die Potenzgesetze begründen und anwenden.",
                "Writing numbers in scientific notation, interpreting powers with rational exponents as roots, and justifying and applying the laws of exponents.",
              ),
            },
            {
              code: "3.3.1 (4)–(15)",
              title: L("Gleichungen lösen", "Solving equations"),
              summary: L(
                "Quadratische Gleichungen mit Formel, Nullprodukt und grafisch lösen und ihre Lösbarkeit untersuchen; dazu einfache Bruch-, Wurzel-, Potenz- und Exponentialgleichungen, der Logarithmus und die Substitution.",
                "Solving quadratic equations by formula, the zero-product rule and graphically, and investigating their solvability; also simple rational, radical, power and exponential equations, logarithms and substitution.",
              ),
              simulations: ["gleichungen-grafisch"],
            },
            {
              code: "3.3.1 (16)–(17)",
              title: L(
                "exponentielles Wachstum anwenden",
                "Applying exponential growth",
              ),
              summary: L(
                "Begriffe der Zinsrechnung erklären und die Formel für das Endkapital als exponentielles Wachstum nutzen und nach jeder Größe auflösen.",
                "Explaining the terms of interest calculation and using the final-capital formula as exponential growth, solving it for each quantity.",
              ),
            },
          ],
        },
        {
          code: "3.3.2",
          title: L("Leitidee Messen", "Guiding idea: measuring"),
          summary: L(
            "Kreis mit Bogenmaß, Kreisbogen und Kreisausschnitt sowie Oberfläche und Volumen von Prisma, Pyramide, Zylinder, Kegel und Kugel. Formeln werden auch mit dem Prinzip von Cavalieri begründet.",
            "The circle with radian measure, arcs and sectors, and surface area and volume of prisms, pyramids, cylinders, cones and spheres; formulas are also justified with Cavalieri’s principle.",
          ),
          parts: [
            {
              code: "3.3.2 (1)–(8)",
              title: L(
                "Größen bei Figuren und Körpern berechnen",
                "Calculating quantities of figures and solids",
              ),
              summary: L(
                "Kreisumfang und Kreisfläche über einen Grenzprozess erklären, Winkel im Bogenmaß angeben, Bogenlängen und Sektoren berechnen sowie Mantel, Oberfläche und Volumen von Körpern herleiten und berechnen.",
                "Explaining circumference and area of a circle through a limiting process, using radians, calculating arc lengths and sectors, and deriving and calculating lateral surface, surface area and volume of solids.",
              ),
              simulations: ["kreiszahl-pi", "prisma-zylinder"],
            },
          ],
        },
        {
          code: "3.3.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Körper in Schrägbild und Netz darstellen. Mit dem Satz des Pythagoras und mit Sinus, Kosinus und Tangens Längen und Winkel berechnen.",
            "Representing solids in oblique views and nets; calculating lengths and angles with Pythagoras’ theorem and with sine, cosine and tangent.",
          ),
          parts: [
            {
              code: "3.3.3 (1)",
              title: L(
                "Körper zeichnerisch darstellen",
                "Representing solids in drawings",
              ),
              summary: L(
                "Schrägbilder und Netze von Prismen, Pyramiden, Zylindern und Kegeln skizzieren und ineinander überführen.",
                "Sketching oblique views and nets of prisms, pyramids, cylinders and cones and converting between them.",
              ),
            },
            {
              code: "3.3.3 (2)–(4)",
              title: L(
                "geometrische Zusammenhänge beweisen und mit trigonometrischen Beziehungen arbeiten",
                "Proving geometric relationships and working with trigonometric relations",
              ),
              summary: L(
                "Mit dem Satz des Pythagoras und seiner Umkehrung rechnen, Seiten und Winkel mit Sinus, Kosinus und Tangens bestimmen und Beziehungen wie sin² + cos² = 1 herleiten.",
                "Calculating with Pythagoras’ theorem and its converse, finding sides and angles with sine, cosine and tangent, and deriving identities such as sin² + cos² = 1.",
              ),
              simulations: [
                "pythagoras",
                "sin-cos-tan-dreieck",
                "einheitskreis",
                "sinussatz-kosinussatz",
              ],
            },
          ],
        },
        {
          code: "3.3.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Neue Funktionstypen: quadratische Funktionen, Potenz-, Wurzel- und Exponentialfunktionen, ganzrationale und trigonometrische Funktionen. Parameter werden als Streckung, Spiegelung und Verschiebung gedeutet.",
            "New types of function: quadratic, power, root and exponential functions, polynomial and trigonometric functions; parameters are interpreted as stretches, reflections and translations.",
          ),
          parts: [
            {
              code: "3.3.4 (1)–(7)",
              title: L(
                "mit quadratischen Funktionen umgehen",
                "Working with quadratic functions",
              ),
              summary: L(
                "Parabeln zeichnen und skizzieren, die Parameter der Scheitelform deuten, zwischen Normal-, Scheitel- und Linearfaktorform wechseln und Anwendungsaufgaben mit größten und kleinsten Werten lösen.",
                "Drawing and sketching parabolas, interpreting the parameters of vertex form, switching between standard, vertex and factorised form, and solving applied problems with maxima and minima.",
              ),
              simulations: [
                "quadratische-funktion",
                "extremwert-parabel",
                "parabel-drei-punkte",
              ],
            },
            {
              code: "3.3.4 (8)–(13)",
              title: L(
                "mit Potenz- und Exponentialfunktionen umgehen",
                "Working with power and exponential functions",
              ),
              summary: L(
                "Graphen von Potenz-, Wurzel- und Exponentialfunktionen skizzieren, an x² und √x Definitions-, Wertemenge und Umkehrfunktion erklären, Wachstum mit Halbwerts- und Verdopplungszeit beschreiben und Parameter deuten.",
                "Sketching graphs of power, root and exponential functions, explaining domain, range and inverse function using x² and √x, describing growth with half-life and doubling time, and interpreting parameters.",
              ),
              simulations: ["potenzfunktionen", "hyperbel"],
            },
            {
              code: "3.3.4 (14)–(19)",
              title: L(
                "mit ganzrationalen und trigonometrischen Funktionen umgehen",
                "Working with polynomial and trigonometric functions",
              ),
              summary: L(
                "Nullstellen ganzrationaler Funktionen (auch mehrfache) bestimmen und faktorisieren, allgemeine Sinusfunktionen skizzieren und für periodische Vorgänge nutzen sowie Verhalten im Unendlichen und Symmetrie untersuchen.",
                "Finding (including repeated) zeros of polynomial functions and factorising, sketching general sine functions and using them for periodic processes, and investigating end behaviour and symmetry.",
              ),
              simulations: ["einheitskreis"],
            },
          ],
        },
        {
          code: "3.3.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Vierfeldertafel, bedingte Wahrscheinlichkeit und Unabhängigkeit. Zufallsgrößen mit Wahrscheinlichkeitsverteilung, Erwartungswert, Varianz und Standardabweichung.",
            "Two-way tables, conditional probability and independence; random variables with probability distribution, expected value, variance and standard deviation.",
          ),
          parts: [
            {
              code: "3.3.5 (1)–(8)",
              title: L(
                "Wahrscheinlichkeiten verstehen und mit Wahrscheinlichkeiten rechnen",
                "Understanding and calculating with probabilities",
              ),
              summary: L(
                "Vierfeldertafeln erstellen und für bedingte Wahrscheinlichkeiten nutzen, Ereignisse auf Unabhängigkeit prüfen und Verteilung, Erwartungswert und Streuung einer Zufallsgröße bestimmen und deuten.",
                "Creating two-way tables and using them for conditional probabilities, checking events for independence, and finding and interpreting distribution, expected value and spread of a random variable.",
              ),
              simulations: ["vierfeldertafel", "baumdiagramm"],
            },
          ],
        },
      ],
    },
    {
      grade: 10,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.3 gilt für die Doppelklassenstufe 9/10; derselbe Inhalt steht auch bei Klasse 9. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.3 covers the double grade 9/10; the same content is also listed under grade 9. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.3.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Potenzen mit rationalen Exponenten und das Lösen von quadratischen, Wurzel-, Potenz-, Bruch- und Exponentialgleichungen. Exponentielles Wachstum am Beispiel der Zinseszinsformel.",
            "Powers with rational exponents and solving quadratic, radical, power, rational and exponential equations; exponential growth using the compound interest formula.",
          ),
          parts: [
            {
              code: "3.3.1 (1)–(3)",
              title: L("mit Potenzen umgehen", "Working with powers"),
              summary: L(
                "Zahlen in wissenschaftlicher Schreibweise angeben, Potenzen mit rationalen Exponenten als Wurzeln deuten und die Potenzgesetze begründen und anwenden.",
                "Writing numbers in scientific notation, interpreting powers with rational exponents as roots, and justifying and applying the laws of exponents.",
              ),
            },
            {
              code: "3.3.1 (4)–(15)",
              title: L("Gleichungen lösen", "Solving equations"),
              summary: L(
                "Quadratische Gleichungen mit Formel, Nullprodukt und grafisch lösen und ihre Lösbarkeit untersuchen; dazu einfache Bruch-, Wurzel-, Potenz- und Exponentialgleichungen, der Logarithmus und die Substitution.",
                "Solving quadratic equations by formula, the zero-product rule and graphically, and investigating their solvability; also simple rational, radical, power and exponential equations, logarithms and substitution.",
              ),
              simulations: ["logarithmus"],
            },
            {
              code: "3.3.1 (16)–(17)",
              title: L(
                "exponentielles Wachstum anwenden",
                "Applying exponential growth",
              ),
              summary: L(
                "Begriffe der Zinsrechnung erklären und die Formel für das Endkapital als exponentielles Wachstum nutzen und nach jeder Größe auflösen.",
                "Explaining the terms of interest calculation and using the final-capital formula as exponential growth, solving it for each quantity.",
              ),
              simulations: ["exponentielles-wachstum"],
            },
          ],
        },
        {
          code: "3.3.2",
          title: L("Leitidee Messen", "Guiding idea: measuring"),
          summary: L(
            "Kreis mit Bogenmaß, Kreisbogen und Kreisausschnitt sowie Oberfläche und Volumen von Prisma, Pyramide, Zylinder, Kegel und Kugel. Formeln werden auch mit dem Prinzip von Cavalieri begründet.",
            "The circle with radian measure, arcs and sectors, and surface area and volume of prisms, pyramids, cylinders, cones and spheres; formulas are also justified with Cavalieri’s principle.",
          ),
          parts: [
            {
              code: "3.3.2 (1)–(8)",
              title: L(
                "Größen bei Figuren und Körpern berechnen",
                "Calculating quantities of figures and solids",
              ),
              summary: L(
                "Kreisumfang und Kreisfläche über einen Grenzprozess erklären, Winkel im Bogenmaß angeben, Bogenlängen und Sektoren berechnen sowie Mantel, Oberfläche und Volumen von Körpern herleiten und berechnen.",
                "Explaining circumference and area of a circle through a limiting process, using radians, calculating arc lengths and sectors, and deriving and calculating lateral surface, surface area and volume of solids.",
              ),
              simulations: ["cavalieri", "pyramide-kegel-kugel"],
            },
          ],
        },
        {
          code: "3.3.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Körper in Schrägbild und Netz darstellen. Mit dem Satz des Pythagoras und mit Sinus, Kosinus und Tangens Längen und Winkel berechnen.",
            "Representing solids in oblique views and nets; calculating lengths and angles with Pythagoras’ theorem and with sine, cosine and tangent.",
          ),
          parts: [
            {
              code: "3.3.3 (1)",
              title: L(
                "Körper zeichnerisch darstellen",
                "Representing solids in drawings",
              ),
              summary: L(
                "Schrägbilder und Netze von Prismen, Pyramiden, Zylindern und Kegeln skizzieren und ineinander überführen.",
                "Sketching oblique views and nets of prisms, pyramids, cylinders and cones and converting between them.",
              ),
            },
            {
              code: "3.3.3 (2)–(4)",
              title: L(
                "geometrische Zusammenhänge beweisen und mit trigonometrischen Beziehungen arbeiten",
                "Proving geometric relationships and working with trigonometric relations",
              ),
              summary: L(
                "Mit dem Satz des Pythagoras und seiner Umkehrung rechnen, Seiten und Winkel mit Sinus, Kosinus und Tangens bestimmen und Beziehungen wie sin² + cos² = 1 herleiten.",
                "Calculating with Pythagoras’ theorem and its converse, finding sides and angles with sine, cosine and tangent, and deriving identities such as sin² + cos² = 1.",
              ),
              simulations: [
                "sin-cos-tan-dreieck",
                "einheitskreis",
                "sinussatz-kosinussatz",
              ],
            },
          ],
        },
        {
          code: "3.3.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Neue Funktionstypen: quadratische Funktionen, Potenz-, Wurzel- und Exponentialfunktionen, ganzrationale und trigonometrische Funktionen. Parameter werden als Streckung, Spiegelung und Verschiebung gedeutet.",
            "New types of function: quadratic, power, root and exponential functions, polynomial and trigonometric functions; parameters are interpreted as stretches, reflections and translations.",
          ),
          parts: [
            {
              code: "3.3.4 (1)–(7)",
              title: L(
                "mit quadratischen Funktionen umgehen",
                "Working with quadratic functions",
              ),
              summary: L(
                "Parabeln zeichnen und skizzieren, die Parameter der Scheitelform deuten, zwischen Normal-, Scheitel- und Linearfaktorform wechseln und Anwendungsaufgaben mit größten und kleinsten Werten lösen.",
                "Drawing and sketching parabolas, interpreting the parameters of vertex form, switching between standard, vertex and factorised form, and solving applied problems with maxima and minima.",
              ),
              simulations: ["quadratische-funktion"],
            },
            {
              code: "3.3.4 (8)–(13)",
              title: L(
                "mit Potenz- und Exponentialfunktionen umgehen",
                "Working with power and exponential functions",
              ),
              summary: L(
                "Graphen von Potenz-, Wurzel- und Exponentialfunktionen skizzieren, an x² und √x Definitions-, Wertemenge und Umkehrfunktion erklären, Wachstum mit Halbwerts- und Verdopplungszeit beschreiben und Parameter deuten.",
                "Sketching graphs of power, root and exponential functions, explaining domain, range and inverse function using x² and √x, describing growth with half-life and doubling time, and interpreting parameters.",
              ),
              simulations: [
                "potenzfunktionen",
                "exponentielles-wachstum",
                "umkehrfunktion",
                "transformationen",
              ],
            },
            {
              code: "3.3.4 (14)–(19)",
              title: L(
                "mit ganzrationalen und trigonometrischen Funktionen umgehen",
                "Working with polynomial and trigonometric functions",
              ),
              summary: L(
                "Nullstellen ganzrationaler Funktionen (auch mehrfache) bestimmen und faktorisieren, allgemeine Sinusfunktionen skizzieren und für periodische Vorgänge nutzen sowie Verhalten im Unendlichen und Symmetrie untersuchen.",
                "Finding (including repeated) zeros of polynomial functions and factorising, sketching general sine functions and using them for periodic processes, and investigating end behaviour and symmetry.",
              ),
              simulations: [
                "ganzrationale-funktionen",
                "sinusfunktion",
                "einheitskreis",
                "grenzverhalten",
              ],
            },
          ],
        },
        {
          code: "3.3.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Vierfeldertafel, bedingte Wahrscheinlichkeit und Unabhängigkeit. Zufallsgrößen mit Wahrscheinlichkeitsverteilung, Erwartungswert, Varianz und Standardabweichung.",
            "Two-way tables, conditional probability and independence; random variables with probability distribution, expected value, variance and standard deviation.",
          ),
          parts: [
            {
              code: "3.3.5 (1)–(8)",
              title: L(
                "Wahrscheinlichkeiten verstehen und mit Wahrscheinlichkeiten rechnen",
                "Understanding and calculating with probabilities",
              ),
              summary: L(
                "Vierfeldertafeln erstellen und für bedingte Wahrscheinlichkeiten nutzen, Ereignisse auf Unabhängigkeit prüfen und Verteilung, Erwartungswert und Streuung einer Zufallsgröße bestimmen und deuten.",
                "Creating two-way tables and using them for conditional probabilities, checking events for independence, and finding and interpreting distribution, expected value and spread of a random variable.",
              ),
              simulations: [
                "vierfeldertafel",
                "baumdiagramm",
                "bedingte-wahrscheinlichkeit",
                "ziegenproblem",
                "geburtstagsproblem",
                "monte-carlo-pi",
              ],
            },
          ],
        },
      ],
    },
    {
      grade: 11,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Klasse 11 ist im G9 eine eigene Stufe vor der Kursstufe.",
        "In the nine-year Gymnasium, grade 11 is a separate stage before the course phase.",
      ),
      units: [
        {
          code: "3.4.1",
          title: L(
            "Leitidee Zahl – Variable – Operation",
            "Guiding idea: number – variable – operation",
          ),
          summary: L(
            "Rechnen mit Tupeln (Vektoren) und erste Ableitungsregeln einschließlich der Ableitung von Sinus und Kosinus.",
            "Calculating with tuples (vectors) and first rules of differentiation including the derivatives of sine and cosine.",
          ),
          parts: [
            {
              code: "3.4.1 (1)",
              title: L(
                "mit Vektoren in der Tupeldarstellung arbeiten",
                "Working with vectors as tuples",
              ),
              summary: L(
                "Tupel addieren und vervielfachen, als Linearkombination darstellen und geometrisch deuten.",
                "Adding and scaling tuples, writing them as linear combinations and interpreting the operations geometrically.",
              ),
              simulations: ["vektoren-3d"],
            },
            {
              code: "3.4.1 (2)–(3)",
              title: L(
                "Funktionsterme ableiten",
                "Differentiating function terms",
              ),
              summary: L(
                "Faktor-, Potenz- und Summenregel anwenden und die Ableitungen von Sinus und Kosinus angeben.",
                "Applying the constant-factor, power and sum rules and stating the derivatives of sine and cosine.",
              ),
            },
          ],
        },
        {
          code: "3.4.2",
          title: L("Leitidee Messen", "Guiding idea: measuring"),
          summary: L(
            "Abstände zwischen Punkten im Raum und der Betrag eines Vektors als Länge.",
            "Distances between points in space and the magnitude of a vector as a length.",
          ),
          parts: [
            {
              code: "3.4.2 (1)–(2)",
              title: L(
                "Längen in kartesischen Koordinatensystemen berechnen",
                "Calculating lengths in Cartesian coordinate systems",
              ),
              summary: L(
                "Den Abstand zweier Punkte bestimmen und den Betrag eines Vektors als Länge berechnen.",
                "Finding the distance between two points and calculating the magnitude of a vector as a length.",
              ),
              simulations: ["koordinaten-3d", "vektoren-3d"],
            },
          ],
        },
        {
          code: "3.4.3",
          title: L("Leitidee Raum und Form", "Guiding idea: space and shape"),
          summary: L(
            "Punkte, Vektoren und Geraden im räumlichen Koordinatensystem. Lagebeziehungen von Geraden untersuchen.",
            "Points, vectors and lines in a three-dimensional coordinate system; investigating how lines lie relative to each other.",
          ),
          parts: [
            {
              code: "3.4.3 (1)–(7)",
              title: L(
                "mit geometrischen Objekten in kartesischen Koordinatensystemen umgehen",
                "Working with geometric objects in Cartesian coordinate systems",
              ),
              summary: L(
                "Punkte im Schrägbild eintragen, Mittelpunkte berechnen, Vektoren auf Kollinearität prüfen, Geraden mit Parametergleichungen beschreiben, ihre Lage zueinander untersuchen und mit Spurpunkten veranschaulichen.",
                "Plotting points in an oblique view, calculating midpoints, checking vectors for collinearity, describing lines with parametric equations, investigating their relative position and illustrating them with trace points.",
              ),
              simulations: [
                "koordinaten-3d",
                "geraden-ebenen",
                "lage-abstaende",
              ],
            },
          ],
        },
        {
          code: "3.4.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang",
            "Guiding idea: functional relationships",
          ),
          summary: L(
            "Einstieg in die Differentialrechnung: von der mittleren zur momentanen Änderungsrate, Tangenten und Ableitungsfunktion. Funktionen mit Ableitungen auf Monotonie, Extrem- und Wendepunkte untersuchen.",
            "Introduction to differential calculus: from average to instantaneous rate of change, tangents and the derivative function; using derivatives to investigate monotonicity, extrema and points of inflection.",
          ),
          parts: [
            {
              code: "3.4.4 (1)–(2)",
              title: L(
                "mit charakteristischen Eigenschaften von Funktionen umgehen",
                "Working with characteristic properties of functions",
              ),
              summary: L(
                "Monotonie definieren und lokale von globalen Extremwerten unterscheiden.",
                "Defining monotonicity and distinguishing local from global extrema.",
              ),
              simulations: ["kurvendiskussion"],
            },
            {
              code: "3.4.4 (3)–(14)",
              title: L(
                "die Grundidee der Differentialrechnung verstehen und mit Ableitungen umgehen",
                "Understanding the basic idea of differential calculus and working with derivatives",
              ),
              summary: L(
                "Differenzenquotient als Sekantensteigung, Ableitung als Grenzwert und Tangentensteigung, Tangente und Normale, Ableitungsfunktion und Monotoniesatz; Graphen mit höheren Ableitungen untersuchen und zwischen f und f′ grafisch schließen.",
                "Difference quotient as secant gradient, derivative as limit and tangent gradient, tangent and normal, derivative function and monotonicity theorem; investigating graphs with higher derivatives and reasoning graphically between f and f′.",
              ),
              simulations: [
                "sekante-tangente",
                "ableitungsfunktion",
                "kurvendiskussion",
              ],
            },
          ],
        },
        {
          code: "3.4.5",
          title: L(
            "Leitidee Daten und Zufall",
            "Guiding idea: data and chance",
          ),
          summary: L(
            "Bernoulli-Ketten und Binomialverteilung mit ihren Kenngrößen. Wirkung der Parameter n und p in grafischen Darstellungen.",
            "Bernoulli chains and the binomial distribution with its key figures; effect of the parameters n and p in graphs.",
          ),
          parts: [
            {
              code: "3.4.5 (1)–(7)",
              title: L(
                "mit Binomialverteilungen umgehen",
                "Working with binomial distributions",
              ),
              summary: L(
                "Bernoulli-Experimente erkennen, die Bernoulli-Formel und Binomialkoeffizienten erklären, Wahrscheinlichkeiten berechnen, Verteilungen darstellen und deuten, fehlende Parameter bestimmen sowie Erwartungswert und Standardabweichung berechnen.",
                "Recognising Bernoulli experiments, explaining Bernoulli’s formula and binomial coefficients, calculating probabilities, plotting and interpreting distributions, finding missing parameters and calculating expected value and standard deviation.",
              ),
              simulations: ["galtonbrett", "binomialverteilung"],
            },
          ],
        },
      ],
    },
    {
      grade: 12,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Kursstufe (Klassen 12/13), derselbe Inhalt steht auch bei Klasse 13. Leistungsfach (3.5, Überschriften mit „(nur Leistungsfach)“) und Basisfach (3.6, „(Basisfach)“) stehen in diesem einen Eintrag.",
        "Course phase (grades 12/13); the same content is also listed under grade 13. Advanced course (3.5, headings marked “(advanced course only)”) and basic course (3.6, “(basic course)”) are combined in this entry.",
      ),
      units: [
        {
          code: "3.5.1",
          title: L(
            "Leitidee Zahl – Variable – Operation (nur Leistungsfach)",
            "Guiding idea: number – variable – operation (advanced course only)",
          ),
          summary: L(
            "Näherungsverfahren für e und für Nullstellen, Produkt- und Kettenregel, Integrationsregeln und uneigentliche Integrale. Skalar- und Vektorprodukt sowie das Gaußverfahren für lineare Gleichungssysteme.",
            "Approximating e and zeros, product and chain rules, rules of integration and improper integrals; scalar and vector product and Gaussian elimination for linear systems.",
          ),
          parts: [
            {
              code: "3.5.1 (1)–(2)",
              title: L("Zahlenwerte approximieren", "Approximating values"),
              summary: L(
                "Die eulersche Zahl näherungsweise bestimmen und ein Iterationsverfahren für Nullstellen begründen und durchführen.",
                "Approximating Euler’s number and justifying and carrying out an iterative method for zeros.",
              ),
              simulations: ["newton-verfahren"],
            },
            {
              code: "3.5.1 (3)–(4)",
              title: L(
                "weitere Ableitungsregeln anwenden",
                "Applying further rules of differentiation",
              ),
              summary: L(
                "Produkt- und Kettenregel anwenden, auch für einfache gebrochenrationale Funktionen.",
                "Applying the product and chain rules, also for simple rational functions.",
              ),
            },
            {
              code: "3.5.1 (5)–(8)",
              title: L(
                "Integrationsregeln verwenden und Integrale berechnen",
                "Using rules of integration and calculating integrals",
              ),
              summary: L(
                "Stammfunktionen mit Potenz-, Faktor- und Summenregel und linearer Substitution bestimmen, bestimmte Integrale mit dem Hauptsatz berechnen und uneigentliche Integrale untersuchen.",
                "Finding antiderivatives with the power, constant-factor and sum rules and linear substitution, calculating definite integrals with the fundamental theorem and investigating improper integrals.",
              ),
              simulations: ["hauptsatz"],
            },
            {
              code: "3.5.1 (9)–(10)",
              title: L(
                "Produkte von Vektoren bilden",
                "Forming products of vectors",
              ),
              summary: L(
                "Skalarprodukt und Vektorprodukt berechnen, geometrisch deuten und nutzen.",
                "Calculating, interpreting geometrically and using the scalar and vector product.",
              ),
              simulations: ["skalar-vektorprodukt"],
            },
            {
              code: "3.5.1 (11)–(13)",
              title: L(
                "Gauß-Algorithmus verwenden",
                "Using Gaussian elimination",
              ),
              summary: L(
                "Das Gaußverfahren als Algorithmus erläutern, auch in Matrixschreibweise durchführen und die Lösungsmenge eines 3×3-Systems geometrisch deuten.",
                "Explaining Gaussian elimination as an algorithm, carrying it out also in matrix notation and interpreting the solution set of a 3×3 system geometrically.",
              ),
              simulations: ["matrix-abbildungen"],
            },
          ],
        },
        {
          code: "3.5.2",
          title: L(
            "Leitidee Messen (nur Leistungsfach)",
            "Guiding idea: measuring (advanced course only)",
          ),
          summary: L(
            "Winkel, Abstände (auch zwischen windschiefen Geraden) und Flächen mit Skalar- und Vektorprodukt. Das Integral für Flächen, Mittelwerte und Rotationsvolumen.",
            "Angles, distances (also between skew lines) and areas using scalar and vector products; the integral for areas, mean values and volumes of revolution.",
          ),
          parts: [
            {
              code: "3.5.2 (1)–(6)",
              title: L(
                "Winkelweiten, Abstände und Flächeninhalte in kartesischen Koordinatensystemen berechnen",
                "Calculating angles, distances and areas in Cartesian coordinate systems",
              ),
              summary: L(
                "Orthogonalität und Winkel mit dem Skalarprodukt, Schnittwinkel von Geraden und Ebenen, Abstände mit der Hesse’schen Normalenform und zwischen windschiefen Geraden sowie Flächen mit dem Vektorprodukt.",
                "Orthogonality and angles with the scalar product, angles between lines and planes, distances using the Hessian normal form and between skew lines, and areas with the vector product.",
              ),
              simulations: ["skalar-vektorprodukt"],
            },
            {
              code: "3.5.2 (7)–(10)",
              title: L("das Integral nutzen", "Using the integral"),
              summary: L(
                "Das Integral als Grenzwert von Summen deuten, Mittelwerte von Funktionen, Flächen zwischen Graphen und Volumen von Rotationskörpern berechnen.",
                "Interpreting the integral as a limit of sums, calculating mean values of functions, areas between graphs and volumes of solids of revolution.",
              ),
              simulations: ["ober-untersummen"],
            },
          ],
        },
        {
          code: "3.5.3",
          title: L(
            "Leitidee Raum und Form (nur Leistungsfach)",
            "Guiding idea: space and shape (advanced course only)",
          ),
          summary: L(
            "Ebenen in Parameter-, Koordinaten- und Normalenform und Lagebeziehungen im Raum. Spiegelungen, Bewegungen und Beweise mit Vektoren.",
            "Planes in parametric, coordinate and normal form and relative positions in space; reflections, motions and proofs with vectors.",
          ),
          parts: [
            {
              code: "3.5.3 (1)–(2)",
              title: L(
                "Produkte von Vektoren geometrisch nutzen",
                "Using products of vectors geometrically",
              ),
              summary: L(
                "Skalar- und Vektorprodukt geometrisch deuten und einen Vektor senkrecht zu zwei gegebenen bestimmen.",
                "Interpreting scalar and vector product geometrically and finding a vector perpendicular to two given ones.",
              ),
              simulations: ["skalar-vektorprodukt"],
            },
            {
              code: "3.5.3 (3)–(7)",
              title: L(
                "vektorielle Darstellungen zur Beschreibung des Anschauungsraumes verwenden",
                "Using vector representations to describe space",
              ),
              summary: L(
                "Ebenen mit Spurgeraden darstellen, in drei Formen beschreiben und umrechnen, Lagebeziehungen und Schnittgebilde bestimmen sowie Spiegelungen, Abstände, Flächen, Volumen und geradlinige Bewegungen bearbeiten.",
                "Showing planes with trace lines, describing them in three forms and converting between them, determining relative positions and intersections, and handling reflections, distances, areas, volumes and straight-line motion.",
              ),
              simulations: ["geraden-ebenen"],
            },
            {
              code: "3.5.3 (8)",
              title: L(
                "vektorielle Darstellungen beim Beweisen nutzen",
                "Using vectors in proofs",
              ),
              summary: L(
                "Einfache geometrische Sätze mit Vektoren beweisen.",
                "Proving simple geometric theorems with vectors.",
              ),
            },
          ],
        },
        {
          code: "3.5.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang (nur Leistungsfach)",
            "Guiding idea: functional relationships (advanced course only)",
          ),
          summary: L(
            "Natürliche Exponential- und Logarithmusfunktion, Umkehrfunktionen und zusammengesetzte Funktionen; Extremwertprobleme, Steckbriefaufgaben und Funktionenscharen. Integral, Hauptsatz und Rekonstruktion von Beständen.",
            "Natural exponential and logarithmic functions, inverse and composite functions; optimisation problems, finding functions from properties and families of functions; the integral, the fundamental theorem and reconstructing quantities.",
          ),
          parts: [
            {
              code: "3.5.4 (1)–(5)",
              title: L(
                "mit der natürlichen Exponential- und Logarithmusfunktion umgehen",
                "Working with the natural exponential and logarithmic function",
              ),
              summary: L(
                "Die Rolle der Basis e erklären, Graphen von eˣ und ln x als Umkehrfunktionen skizzieren und ihre Ableitungen und eine Stammfunktion von eˣ angeben.",
                "Explaining the role of base e, sketching the graphs of eˣ and ln x as inverse functions and stating their derivatives and an antiderivative of eˣ.",
              ),
              simulations: ["e-funktion", "logarithmus"],
            },
            {
              code: "3.5.4 (6)–(8)",
              title: L(
                "mit Umkehrfunktionen arbeiten",
                "Working with inverse functions",
              ),
              summary: L(
                "Definitions- und Wertemengen bestimmen, Umkehrbarkeit über strenge Monotonie nachweisen und Terme von Umkehrfunktionen aufstellen.",
                "Determining domains and ranges, proving invertibility via strict monotonicity and finding terms of inverse functions.",
              ),
              simulations: ["umkehrfunktion"],
            },
            {
              code: "3.5.4 (9)–(11)",
              title: L(
                "mit zusammengesetzten Funktionen umgehen",
                "Working with composite functions",
              ),
              summary: L(
                "Verkettungen bilden und erkennen, Quotienten bekannter Funktionen auf Asymptoten und Nullstellen untersuchen und Summen, Produkte und Verkettungen analysieren.",
                "Forming and recognising compositions, investigating quotients of known functions for asymptotes and zeros, and analysing sums, products and compositions.",
              ),
              simulations: [
                "polstellen-asymptoten",
                "funktionsplotter",
                "grenzverhalten",
              ],
            },
            {
              code: "3.5.4 (12)–(14)",
              title: L(
                "Differentialrechnung anwenden",
                "Applying differential calculus",
              ),
              summary: L(
                "Extremwertprobleme mit Nebenbedingungen lösen, Funktionsterme aus Eigenschaften ermitteln und Funktionenscharen untersuchen.",
                "Solving optimisation problems with constraints, finding function terms from given properties and investigating families of functions.",
              ),
              simulations: ["funktionenscharen"],
            },
            {
              code: "3.5.4 (15)–(22)",
              title: L(
                "die Grundidee der Integralrechnung verstehen und mit Integralen umgehen",
                "Understanding the basic idea of integral calculus and working with integrals",
              ),
              summary: L(
                "Das Integral als orientierte Fläche und Bestandsänderung deuten, Bestände aus Änderungsraten rekonstruieren, Hauptsatz, Integral- und Stammfunktion unterscheiden und nutzen sowie grafisch zwischen Funktion und Stammfunktion schließen.",
                "Interpreting the integral as signed area and change of a quantity, reconstructing quantities from rates of change, distinguishing and using the fundamental theorem, integral function and antiderivative, and reasoning graphically between a function and its antiderivative.",
              ),
              simulations: [
                "hauptsatz",
                "stammfunktion-grafisch",
                "ober-untersummen",
              ],
            },
          ],
        },
        {
          code: "3.5.5",
          title: L(
            "Leitidee Daten und Zufall (nur Leistungsfach)",
            "Guiding idea: data and chance (advanced course only)",
          ),
          summary: L(
            "Ein- und zweiseitige Hypothesentests bei binomialverteilten Zufallsgrößen mit Fehlern erster und zweiter Art. Normalverteilung als stetige Verteilung.",
            "One- and two-sided hypothesis tests for binomially distributed random variables with type I and type II errors; the normal distribution as a continuous distribution.",
          ),
          parts: [
            {
              code: "3.5.5 (1)–(7)",
              title: L(
                "Hypothesen bei binomialverteilten Zufallsgrößen testen",
                "Testing hypotheses for binomially distributed random variables",
              ),
              summary: L(
                "Die Logik des Testens erklären, Nullhypothesen formulieren, Ablehnungsbereich und Irrtumswahrscheinlichkeit bestimmen und darstellen sowie Fehler erster und zweiter Art und den Einfluss des Stichprobenumfangs erläutern.",
                "Explaining the logic of testing, formulating null hypotheses, determining and showing rejection region and significance, and explaining type I and type II errors and the influence of sample size.",
              ),
              simulations: ["signifikanztest", "binomialverteilung"],
            },
            {
              code: "3.5.5 (8)–(10)",
              title: L(
                "mit Normalverteilungen umgehen",
                "Working with normal distributions",
              ),
              summary: L(
                "Diskrete und stetige Zufallsgrößen unterscheiden, die Dichtefunktion mit Erwartungswert und Standardabweichung angeben und Wahrscheinlichkeiten bei annähernd normalverteilten Größen berechnen.",
                "Distinguishing discrete and continuous random variables, stating the density function with mean and standard deviation, and calculating probabilities for approximately normally distributed variables.",
              ),
              simulations: ["galtonbrett"],
            },
          ],
        },
        {
          code: "3.6.1",
          title: L(
            "Leitidee Zahl – Variable – Operation (Basisfach)",
            "Guiding idea: number – variable – operation (basic course)",
          ),
          summary: L(
            "Natürlicher Logarithmus, Produktregel und Kettenregel mit linearer innerer Funktion, Integrationsregeln. Skalar- und Vektorprodukt und das Gaußverfahren ohne Parameter.",
            "Natural logarithm, product rule and chain rule with a linear inner function, rules of integration; scalar and vector product and Gaussian elimination without parameters.",
          ),
          parts: [
            {
              code: "3.6.1 (1)",
              title: L(
                "den natürlichen Logarithmus nutzen",
                "Using the natural logarithm",
              ),
              summary: L(
                "Exponentialgleichungen mit dem natürlichen Logarithmus lösen.",
                "Solving exponential equations with the natural logarithm.",
              ),
              simulations: ["logarithmus"],
            },
            {
              code: "3.6.1 (2)–(3)",
              title: L(
                "weitere Ableitungsregeln anwenden",
                "Applying further rules of differentiation",
              ),
              summary: L(
                "Produktregel und Kettenregel (mit linearer innerer Funktion) anwenden.",
                "Applying the product rule and the chain rule (with a linear inner function).",
              ),
            },
            {
              code: "3.6.1 (4)–(6)",
              title: L(
                "Integrationsregeln verwenden und Integrale berechnen",
                "Using rules of integration and calculating integrals",
              ),
              summary: L(
                "Stammfunktionen mit den Grundregeln und linearer Substitution bestimmen und bestimmte Integrale mit dem Hauptsatz berechnen.",
                "Finding antiderivatives with the basic rules and linear substitution and calculating definite integrals with the fundamental theorem.",
              ),
              simulations: ["hauptsatz"],
            },
            {
              code: "3.6.1 (7)–(8)",
              title: L(
                "Produkte von Vektoren bilden",
                "Forming products of vectors",
              ),
              summary: L(
                "Skalarprodukt und Vektorprodukt berechnen und bei Berechnungen nutzen.",
                "Calculating the scalar and vector product and using them in calculations.",
              ),
              simulations: ["skalar-vektorprodukt"],
            },
            {
              code: "3.6.1 (9)–(10)",
              title: L(
                "lineare Gleichungssysteme untersuchen",
                "Investigating systems of linear equations",
              ),
              summary: L(
                "Das Gaußverfahren bis zur Stufenform anwenden und die Lösungsvielfalt angeben.",
                "Applying Gaussian elimination up to row echelon form and stating the number of solutions.",
              ),
            },
          ],
        },
        {
          code: "3.6.2",
          title: L(
            "Leitidee Messen (Basisfach)",
            "Guiding idea: measuring (basic course)",
          ),
          summary: L(
            "Winkel, Abstand Punkt–Ebene und Flächen mit Skalar- und Vektorprodukt. Das Integral zur Flächenberechnung.",
            "Angles, the distance between a point and a plane and areas using scalar and vector products; the integral for calculating areas.",
          ),
          parts: [
            {
              code: "3.6.2 (1)–(5)",
              title: L(
                "Winkelweiten, Abstände und Flächeninhalte in kartesischen Koordinatensystemen berechnen",
                "Calculating angles, distances and areas in Cartesian coordinate systems",
              ),
              summary: L(
                "Orthogonalität und Winkel mit dem Skalarprodukt prüfen, Schnittwinkel und den Abstand eines Punktes von einer Ebene bestimmen sowie Flächen mit dem Vektorprodukt berechnen.",
                "Checking orthogonality and angles with the scalar product, finding angles of intersection and the distance from a point to a plane, and calculating areas with the vector product.",
              ),
              simulations: ["skalar-vektorprodukt"],
            },
            {
              code: "3.6.2 (6)–(7)",
              title: L("das Integral nutzen", "Using the integral"),
              summary: L(
                "Das Integral anschaulich als Grenzprozess beschreiben und Flächen zwischen Graph und x-Achse sowie zwischen zwei Graphen bestimmen.",
                "Describing the integral intuitively as a limiting process and finding areas between a graph and the x-axis and between two graphs.",
              ),
              simulations: ["ober-untersummen"],
            },
          ],
        },
        {
          code: "3.6.3",
          title: L(
            "Leitidee Raum und Form (Basisfach)",
            "Guiding idea: space and shape (basic course)",
          ),
          summary: L(
            "Ebenen in Parameter- und Koordinatenform und Lagebeziehungen von Gerade und Ebene sowie zweier Ebenen. Anwendungen wie Spiegelungen und geradlinige Bewegungen.",
            "Planes in parametric and coordinate form and the relative position of line and plane and of two planes; applications such as reflections and straight-line motion.",
          ),
          parts: [
            {
              code: "3.6.3 (1)–(2)",
              title: L(
                "Produkte von Vektoren geometrisch nutzen",
                "Using products of vectors geometrically",
              ),
              summary: L(
                "Skalar- und Vektorprodukt geometrisch deuten und einen gemeinsamen senkrechten Vektor bestimmen.",
                "Interpreting scalar and vector product geometrically and finding a common perpendicular vector.",
              ),
              simulations: ["skalar-vektorprodukt"],
            },
            {
              code: "3.6.3 (3)–(8)",
              title: L(
                "vektorielle Darstellungen zur Beschreibung des Anschauungsraumes verwenden",
                "Using vector representations to describe space",
              ),
              summary: L(
                "Ebenen mit Spurgeraden darstellen, in Parameter- und Koordinatenform beschreiben, Lage von Gerade und Ebene sowie zweier Ebenen untersuchen und Anwendungsaufgaben lösen.",
                "Showing planes with trace lines, describing them in parametric and coordinate form, investigating line–plane and plane–plane positions and solving applied problems.",
              ),
              simulations: ["geraden-ebenen"],
            },
          ],
        },
        {
          code: "3.6.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang (Basisfach)",
            "Guiding idea: functional relationships (basic course)",
          ),
          summary: L(
            "Natürliche Exponentialfunktion und einfache zusammengesetzte Funktionen; Extremwerte in Sachzusammenhängen und Funktionsbestimmung. Integral als Fläche und Bestandsänderung, Hauptsatz.",
            "The natural exponential function and simple composite functions; extrema in real contexts and finding functions; the integral as area and change of a quantity, the fundamental theorem.",
          ),
          parts: [
            {
              code: "3.6.4 (1)–(3)",
              title: L(
                "mit der natürlichen Exponentialfunktion umgehen",
                "Working with the natural exponential function",
              ),
              summary: L(
                "Die besondere Basis e beschreiben, den Graphen von eˣ mit Asymptote skizzieren und Ableitung und Stammfunktion angeben.",
                "Describing the special base e, sketching the graph of eˣ with its asymptote and stating its derivative and antiderivative.",
              ),
              simulations: ["e-funktion"],
            },
            {
              code: "3.6.4 (4)–(5)",
              title: L(
                "mit zusammengesetzten Funktionen umgehen",
                "Working with composite functions",
              ),
              summary: L(
                "Verkettungen mit linearer innerer Funktion erkennen und Summen, Produkte und solche Verkettungen untersuchen.",
                "Recognising compositions with a linear inner function and investigating sums, products and such compositions.",
              ),
              simulations: ["funktionsplotter"],
            },
            {
              code: "3.6.4 (6)–(7)",
              title: L(
                "Differentialrechnung anwenden",
                "Applying differential calculus",
              ),
              summary: L(
                "Extremwerte in Sachzusammenhängen bestimmen und eindeutig festgelegte Funktionsterme ermitteln.",
                "Finding extrema in real contexts and determining uniquely defined function terms.",
              ),
            },
            {
              code: "3.6.4 (8)–(13)",
              title: L(
                "die Grundidee der Integralrechnung verstehen und mit Integralen umgehen",
                "Understanding the basic idea of integral calculus and working with integrals",
              ),
              summary: L(
                "Das Integral als orientierte Fläche und Bestandsänderung deuten, Bestände rekonstruieren, den Hauptsatz anwenden und grafisch zwischen Funktion und Stammfunktion schließen.",
                "Interpreting the integral as signed area and change of a quantity, reconstructing quantities, applying the fundamental theorem and reasoning graphically between a function and its antiderivative.",
              ),
              simulations: ["hauptsatz", "stammfunktion-grafisch"],
            },
          ],
        },
        {
          code: "3.6.5",
          title: L(
            "Leitidee Daten und Zufall (Basisfach)",
            "Guiding idea: data and chance (basic course)",
          ),
          summary: L(
            "Von der Binomialverteilung zur Normalverteilung: diskrete und stetige Zufallsgrößen und die Glockenkurve.",
            "From the binomial to the normal distribution: discrete and continuous random variables and the bell curve.",
          ),
          parts: [
            {
              code: "3.6.5 (1)–(3)",
              title: L(
                "mit Normalverteilungen umgehen",
                "Working with normal distributions",
              ),
              summary: L(
                "Diskrete und stetige Zufallsgrößen unterscheiden, den Einfluss von Erwartungswert und Standardabweichung auf die Glockenkurve beschreiben und Wahrscheinlichkeiten berechnen.",
                "Distinguishing discrete and continuous random variables, describing how mean and standard deviation shape the bell curve, and calculating probabilities.",
              ),
              simulations: ["galtonbrett"],
            },
          ],
        },
      ],
    },
    {
      grade: 13,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Kursstufe (Klassen 12/13), derselbe Inhalt steht auch bei Klasse 12. Leistungsfach (3.5, Überschriften mit „(nur Leistungsfach)“) und Basisfach (3.6, „(Basisfach)“) stehen in diesem einen Eintrag.",
        "Course phase (grades 12/13); the same content is also listed under grade 12. Advanced course (3.5, headings marked “(advanced course only)”) and basic course (3.6, “(basic course)”) are combined in this entry.",
      ),
      units: [
        {
          code: "3.5.1",
          title: L(
            "Leitidee Zahl – Variable – Operation (nur Leistungsfach)",
            "Guiding idea: number – variable – operation (advanced course only)",
          ),
          summary: L(
            "Näherungsverfahren für e und für Nullstellen, Produkt- und Kettenregel, Integrationsregeln und uneigentliche Integrale. Skalar- und Vektorprodukt sowie das Gaußverfahren für lineare Gleichungssysteme.",
            "Approximating e and zeros, product and chain rules, rules of integration and improper integrals; scalar and vector product and Gaussian elimination for linear systems.",
          ),
          parts: [
            {
              code: "3.5.1 (1)–(2)",
              title: L("Zahlenwerte approximieren", "Approximating values"),
              summary: L(
                "Die eulersche Zahl näherungsweise bestimmen und ein Iterationsverfahren für Nullstellen begründen und durchführen.",
                "Approximating Euler’s number and justifying and carrying out an iterative method for zeros.",
              ),
              simulations: ["taylor-polynome"],
            },
            {
              code: "3.5.1 (3)–(4)",
              title: L(
                "weitere Ableitungsregeln anwenden",
                "Applying further rules of differentiation",
              ),
              summary: L(
                "Produkt- und Kettenregel anwenden, auch für einfache gebrochenrationale Funktionen.",
                "Applying the product and chain rules, also for simple rational functions.",
              ),
            },
            {
              code: "3.5.1 (5)–(8)",
              title: L(
                "Integrationsregeln verwenden und Integrale berechnen",
                "Using rules of integration and calculating integrals",
              ),
              summary: L(
                "Stammfunktionen mit Potenz-, Faktor- und Summenregel und linearer Substitution bestimmen, bestimmte Integrale mit dem Hauptsatz berechnen und uneigentliche Integrale untersuchen.",
                "Finding antiderivatives with the power, constant-factor and sum rules and linear substitution, calculating definite integrals with the fundamental theorem and investigating improper integrals.",
              ),
              simulations: ["hauptsatz"],
            },
            {
              code: "3.5.1 (9)–(10)",
              title: L(
                "Produkte von Vektoren bilden",
                "Forming products of vectors",
              ),
              summary: L(
                "Skalarprodukt und Vektorprodukt berechnen, geometrisch deuten und nutzen.",
                "Calculating, interpreting geometrically and using the scalar and vector product.",
              ),
            },
            {
              code: "3.5.1 (11)–(13)",
              title: L(
                "Gauß-Algorithmus verwenden",
                "Using Gaussian elimination",
              ),
              summary: L(
                "Das Gaußverfahren als Algorithmus erläutern, auch in Matrixschreibweise durchführen und die Lösungsmenge eines 3×3-Systems geometrisch deuten.",
                "Explaining Gaussian elimination as an algorithm, carrying it out also in matrix notation and interpreting the solution set of a 3×3 system geometrically.",
              ),
              simulations: ["matrix-abbildungen"],
            },
          ],
        },
        {
          code: "3.5.2",
          title: L(
            "Leitidee Messen (nur Leistungsfach)",
            "Guiding idea: measuring (advanced course only)",
          ),
          summary: L(
            "Winkel, Abstände (auch zwischen windschiefen Geraden) und Flächen mit Skalar- und Vektorprodukt. Das Integral für Flächen, Mittelwerte und Rotationsvolumen.",
            "Angles, distances (also between skew lines) and areas using scalar and vector products; the integral for areas, mean values and volumes of revolution.",
          ),
          parts: [
            {
              code: "3.5.2 (1)–(6)",
              title: L(
                "Winkelweiten, Abstände und Flächeninhalte in kartesischen Koordinatensystemen berechnen",
                "Calculating angles, distances and areas in Cartesian coordinate systems",
              ),
              summary: L(
                "Orthogonalität und Winkel mit dem Skalarprodukt, Schnittwinkel von Geraden und Ebenen, Abstände mit der Hesse’schen Normalenform und zwischen windschiefen Geraden sowie Flächen mit dem Vektorprodukt.",
                "Orthogonality and angles with the scalar product, angles between lines and planes, distances using the Hessian normal form and between skew lines, and areas with the vector product.",
              ),
              simulations: ["lage-abstaende"],
            },
            {
              code: "3.5.2 (7)–(10)",
              title: L("das Integral nutzen", "Using the integral"),
              summary: L(
                "Das Integral als Grenzwert von Summen deuten, Mittelwerte von Funktionen, Flächen zwischen Graphen und Volumen von Rotationskörpern berechnen.",
                "Interpreting the integral as a limit of sums, calculating mean values of functions, areas between graphs and volumes of solids of revolution.",
              ),
              simulations: ["ober-untersummen", "rotationskoerper"],
            },
          ],
        },
        {
          code: "3.5.3",
          title: L(
            "Leitidee Raum und Form (nur Leistungsfach)",
            "Guiding idea: space and shape (advanced course only)",
          ),
          summary: L(
            "Ebenen in Parameter-, Koordinaten- und Normalenform und Lagebeziehungen im Raum. Spiegelungen, Bewegungen und Beweise mit Vektoren.",
            "Planes in parametric, coordinate and normal form and relative positions in space; reflections, motions and proofs with vectors.",
          ),
          parts: [
            {
              code: "3.5.3 (1)–(2)",
              title: L(
                "Produkte von Vektoren geometrisch nutzen",
                "Using products of vectors geometrically",
              ),
              summary: L(
                "Skalar- und Vektorprodukt geometrisch deuten und einen Vektor senkrecht zu zwei gegebenen bestimmen.",
                "Interpreting scalar and vector product geometrically and finding a vector perpendicular to two given ones.",
              ),
            },
            {
              code: "3.5.3 (3)–(7)",
              title: L(
                "vektorielle Darstellungen zur Beschreibung des Anschauungsraumes verwenden",
                "Using vector representations to describe space",
              ),
              summary: L(
                "Ebenen mit Spurgeraden darstellen, in drei Formen beschreiben und umrechnen, Lagebeziehungen und Schnittgebilde bestimmen sowie Spiegelungen, Abstände, Flächen, Volumen und geradlinige Bewegungen bearbeiten.",
                "Showing planes with trace lines, describing them in three forms and converting between them, determining relative positions and intersections, and handling reflections, distances, areas, volumes and straight-line motion.",
              ),
              simulations: ["geraden-ebenen", "lage-abstaende", "kugeln"],
            },
            {
              code: "3.5.3 (8)",
              title: L(
                "vektorielle Darstellungen beim Beweisen nutzen",
                "Using vectors in proofs",
              ),
              summary: L(
                "Einfache geometrische Sätze mit Vektoren beweisen.",
                "Proving simple geometric theorems with vectors.",
              ),
            },
          ],
        },
        {
          code: "3.5.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang (nur Leistungsfach)",
            "Guiding idea: functional relationships (advanced course only)",
          ),
          summary: L(
            "Natürliche Exponential- und Logarithmusfunktion, Umkehrfunktionen und zusammengesetzte Funktionen; Extremwertprobleme, Steckbriefaufgaben und Funktionenscharen. Integral, Hauptsatz und Rekonstruktion von Beständen.",
            "Natural exponential and logarithmic functions, inverse and composite functions; optimisation problems, finding functions from properties and families of functions; the integral, the fundamental theorem and reconstructing quantities.",
          ),
          parts: [
            {
              code: "3.5.4 (1)–(5)",
              title: L(
                "mit der natürlichen Exponential- und Logarithmusfunktion umgehen",
                "Working with the natural exponential and logarithmic function",
              ),
              summary: L(
                "Die Rolle der Basis e erklären, Graphen von eˣ und ln x als Umkehrfunktionen skizzieren und ihre Ableitungen und eine Stammfunktion von eˣ angeben.",
                "Explaining the role of base e, sketching the graphs of eˣ and ln x as inverse functions and stating their derivatives and an antiderivative of eˣ.",
              ),
            },
            {
              code: "3.5.4 (6)–(8)",
              title: L(
                "mit Umkehrfunktionen arbeiten",
                "Working with inverse functions",
              ),
              summary: L(
                "Definitions- und Wertemengen bestimmen, Umkehrbarkeit über strenge Monotonie nachweisen und Terme von Umkehrfunktionen aufstellen.",
                "Determining domains and ranges, proving invertibility via strict monotonicity and finding terms of inverse functions.",
              ),
            },
            {
              code: "3.5.4 (9)–(11)",
              title: L(
                "mit zusammengesetzten Funktionen umgehen",
                "Working with composite functions",
              ),
              summary: L(
                "Verkettungen bilden und erkennen, Quotienten bekannter Funktionen auf Asymptoten und Nullstellen untersuchen und Summen, Produkte und Verkettungen analysieren.",
                "Forming and recognising compositions, investigating quotients of known functions for asymptotes and zeros, and analysing sums, products and compositions.",
              ),
              simulations: ["funktionsplotter"],
            },
            {
              code: "3.5.4 (12)–(14)",
              title: L(
                "Differentialrechnung anwenden",
                "Applying differential calculus",
              ),
              summary: L(
                "Extremwertprobleme mit Nebenbedingungen lösen, Funktionsterme aus Eigenschaften ermitteln und Funktionenscharen untersuchen.",
                "Solving optimisation problems with constraints, finding function terms from given properties and investigating families of functions.",
              ),
              simulations: ["extremwertprobleme", "funktionenscharen"],
            },
            {
              code: "3.5.4 (15)–(22)",
              title: L(
                "die Grundidee der Integralrechnung verstehen und mit Integralen umgehen",
                "Understanding the basic idea of integral calculus and working with integrals",
              ),
              summary: L(
                "Das Integral als orientierte Fläche und Bestandsänderung deuten, Bestände aus Änderungsraten rekonstruieren, Hauptsatz, Integral- und Stammfunktion unterscheiden und nutzen sowie grafisch zwischen Funktion und Stammfunktion schließen.",
                "Interpreting the integral as signed area and change of a quantity, reconstructing quantities from rates of change, distinguishing and using the fundamental theorem, integral function and antiderivative, and reasoning graphically between a function and its antiderivative.",
              ),
              simulations: [
                "hauptsatz",
                "stammfunktion-grafisch",
                "aenderungsrate",
                "ober-untersummen",
              ],
            },
          ],
        },
        {
          code: "3.5.5",
          title: L(
            "Leitidee Daten und Zufall (nur Leistungsfach)",
            "Guiding idea: data and chance (advanced course only)",
          ),
          summary: L(
            "Ein- und zweiseitige Hypothesentests bei binomialverteilten Zufallsgrößen mit Fehlern erster und zweiter Art. Normalverteilung als stetige Verteilung.",
            "One- and two-sided hypothesis tests for binomially distributed random variables with type I and type II errors; the normal distribution as a continuous distribution.",
          ),
          parts: [
            {
              code: "3.5.5 (1)–(7)",
              title: L(
                "Hypothesen bei binomialverteilten Zufallsgrößen testen",
                "Testing hypotheses for binomially distributed random variables",
              ),
              summary: L(
                "Die Logik des Testens erklären, Nullhypothesen formulieren, Ablehnungsbereich und Irrtumswahrscheinlichkeit bestimmen und darstellen sowie Fehler erster und zweiter Art und den Einfluss des Stichprobenumfangs erläutern.",
                "Explaining the logic of testing, formulating null hypotheses, determining and showing rejection region and significance, and explaining type I and type II errors and the influence of sample size.",
              ),
            },
            {
              code: "3.5.5 (8)–(10)",
              title: L(
                "mit Normalverteilungen umgehen",
                "Working with normal distributions",
              ),
              summary: L(
                "Diskrete und stetige Zufallsgrößen unterscheiden, die Dichtefunktion mit Erwartungswert und Standardabweichung angeben und Wahrscheinlichkeiten bei annähernd normalverteilten Größen berechnen.",
                "Distinguishing discrete and continuous random variables, stating the density function with mean and standard deviation, and calculating probabilities for approximately normally distributed variables.",
              ),
              simulations: ["normalverteilung"],
            },
          ],
        },
        {
          code: "3.6.1",
          title: L(
            "Leitidee Zahl – Variable – Operation (Basisfach)",
            "Guiding idea: number – variable – operation (basic course)",
          ),
          summary: L(
            "Natürlicher Logarithmus, Produktregel und Kettenregel mit linearer innerer Funktion, Integrationsregeln. Skalar- und Vektorprodukt und das Gaußverfahren ohne Parameter.",
            "Natural logarithm, product rule and chain rule with a linear inner function, rules of integration; scalar and vector product and Gaussian elimination without parameters.",
          ),
          parts: [
            {
              code: "3.6.1 (1)",
              title: L(
                "den natürlichen Logarithmus nutzen",
                "Using the natural logarithm",
              ),
              summary: L(
                "Exponentialgleichungen mit dem natürlichen Logarithmus lösen.",
                "Solving exponential equations with the natural logarithm.",
              ),
            },
            {
              code: "3.6.1 (2)–(3)",
              title: L(
                "weitere Ableitungsregeln anwenden",
                "Applying further rules of differentiation",
              ),
              summary: L(
                "Produktregel und Kettenregel (mit linearer innerer Funktion) anwenden.",
                "Applying the product rule and the chain rule (with a linear inner function).",
              ),
            },
            {
              code: "3.6.1 (4)–(6)",
              title: L(
                "Integrationsregeln verwenden und Integrale berechnen",
                "Using rules of integration and calculating integrals",
              ),
              summary: L(
                "Stammfunktionen mit den Grundregeln und linearer Substitution bestimmen und bestimmte Integrale mit dem Hauptsatz berechnen.",
                "Finding antiderivatives with the basic rules and linear substitution and calculating definite integrals with the fundamental theorem.",
              ),
              simulations: ["hauptsatz"],
            },
            {
              code: "3.6.1 (7)–(8)",
              title: L(
                "Produkte von Vektoren bilden",
                "Forming products of vectors",
              ),
              summary: L(
                "Skalarprodukt und Vektorprodukt berechnen und bei Berechnungen nutzen.",
                "Calculating the scalar and vector product and using them in calculations.",
              ),
            },
            {
              code: "3.6.1 (9)–(10)",
              title: L(
                "lineare Gleichungssysteme untersuchen",
                "Investigating systems of linear equations",
              ),
              summary: L(
                "Das Gaußverfahren bis zur Stufenform anwenden und die Lösungsvielfalt angeben.",
                "Applying Gaussian elimination up to row echelon form and stating the number of solutions.",
              ),
            },
          ],
        },
        {
          code: "3.6.2",
          title: L(
            "Leitidee Messen (Basisfach)",
            "Guiding idea: measuring (basic course)",
          ),
          summary: L(
            "Winkel, Abstand Punkt–Ebene und Flächen mit Skalar- und Vektorprodukt. Das Integral zur Flächenberechnung.",
            "Angles, the distance between a point and a plane and areas using scalar and vector products; the integral for calculating areas.",
          ),
          parts: [
            {
              code: "3.6.2 (1)–(5)",
              title: L(
                "Winkelweiten, Abstände und Flächeninhalte in kartesischen Koordinatensystemen berechnen",
                "Calculating angles, distances and areas in Cartesian coordinate systems",
              ),
              summary: L(
                "Orthogonalität und Winkel mit dem Skalarprodukt prüfen, Schnittwinkel und den Abstand eines Punktes von einer Ebene bestimmen sowie Flächen mit dem Vektorprodukt berechnen.",
                "Checking orthogonality and angles with the scalar product, finding angles of intersection and the distance from a point to a plane, and calculating areas with the vector product.",
              ),
              simulations: ["lage-abstaende"],
            },
            {
              code: "3.6.2 (6)–(7)",
              title: L("das Integral nutzen", "Using the integral"),
              summary: L(
                "Das Integral anschaulich als Grenzprozess beschreiben und Flächen zwischen Graph und x-Achse sowie zwischen zwei Graphen bestimmen.",
                "Describing the integral intuitively as a limiting process and finding areas between a graph and the x-axis and between two graphs.",
              ),
              simulations: ["ober-untersummen"],
            },
          ],
        },
        {
          code: "3.6.3",
          title: L(
            "Leitidee Raum und Form (Basisfach)",
            "Guiding idea: space and shape (basic course)",
          ),
          summary: L(
            "Ebenen in Parameter- und Koordinatenform und Lagebeziehungen von Gerade und Ebene sowie zweier Ebenen. Anwendungen wie Spiegelungen und geradlinige Bewegungen.",
            "Planes in parametric and coordinate form and the relative position of line and plane and of two planes; applications such as reflections and straight-line motion.",
          ),
          parts: [
            {
              code: "3.6.3 (1)–(2)",
              title: L(
                "Produkte von Vektoren geometrisch nutzen",
                "Using products of vectors geometrically",
              ),
              summary: L(
                "Skalar- und Vektorprodukt geometrisch deuten und einen gemeinsamen senkrechten Vektor bestimmen.",
                "Interpreting scalar and vector product geometrically and finding a common perpendicular vector.",
              ),
            },
            {
              code: "3.6.3 (3)–(8)",
              title: L(
                "vektorielle Darstellungen zur Beschreibung des Anschauungsraumes verwenden",
                "Using vector representations to describe space",
              ),
              summary: L(
                "Ebenen mit Spurgeraden darstellen, in Parameter- und Koordinatenform beschreiben, Lage von Gerade und Ebene sowie zweier Ebenen untersuchen und Anwendungsaufgaben lösen.",
                "Showing planes with trace lines, describing them in parametric and coordinate form, investigating line–plane and plane–plane positions and solving applied problems.",
              ),
              simulations: ["geraden-ebenen", "lage-abstaende"],
            },
          ],
        },
        {
          code: "3.6.4",
          title: L(
            "Leitidee Funktionaler Zusammenhang (Basisfach)",
            "Guiding idea: functional relationships (basic course)",
          ),
          summary: L(
            "Natürliche Exponentialfunktion und einfache zusammengesetzte Funktionen; Extremwerte in Sachzusammenhängen und Funktionsbestimmung. Integral als Fläche und Bestandsänderung, Hauptsatz.",
            "The natural exponential function and simple composite functions; extrema in real contexts and finding functions; the integral as area and change of a quantity, the fundamental theorem.",
          ),
          parts: [
            {
              code: "3.6.4 (1)–(3)",
              title: L(
                "mit der natürlichen Exponentialfunktion umgehen",
                "Working with the natural exponential function",
              ),
              summary: L(
                "Die besondere Basis e beschreiben, den Graphen von eˣ mit Asymptote skizzieren und Ableitung und Stammfunktion angeben.",
                "Describing the special base e, sketching the graph of eˣ with its asymptote and stating its derivative and antiderivative.",
              ),
            },
            {
              code: "3.6.4 (4)–(5)",
              title: L(
                "mit zusammengesetzten Funktionen umgehen",
                "Working with composite functions",
              ),
              summary: L(
                "Verkettungen mit linearer innerer Funktion erkennen und Summen, Produkte und solche Verkettungen untersuchen.",
                "Recognising compositions with a linear inner function and investigating sums, products and such compositions.",
              ),
              simulations: ["funktionsplotter"],
            },
            {
              code: "3.6.4 (6)–(7)",
              title: L(
                "Differentialrechnung anwenden",
                "Applying differential calculus",
              ),
              summary: L(
                "Extremwerte in Sachzusammenhängen bestimmen und eindeutig festgelegte Funktionsterme ermitteln.",
                "Finding extrema in real contexts and determining uniquely defined function terms.",
              ),
              simulations: ["extremwertprobleme"],
            },
            {
              code: "3.6.4 (8)–(13)",
              title: L(
                "die Grundidee der Integralrechnung verstehen und mit Integralen umgehen",
                "Understanding the basic idea of integral calculus and working with integrals",
              ),
              summary: L(
                "Das Integral als orientierte Fläche und Bestandsänderung deuten, Bestände rekonstruieren, den Hauptsatz anwenden und grafisch zwischen Funktion und Stammfunktion schließen.",
                "Interpreting the integral as signed area and change of a quantity, reconstructing quantities, applying the fundamental theorem and reasoning graphically between a function and its antiderivative.",
              ),
              simulations: [
                "hauptsatz",
                "stammfunktion-grafisch",
                "aenderungsrate",
              ],
            },
          ],
        },
        {
          code: "3.6.5",
          title: L(
            "Leitidee Daten und Zufall (Basisfach)",
            "Guiding idea: data and chance (basic course)",
          ),
          summary: L(
            "Von der Binomialverteilung zur Normalverteilung: diskrete und stetige Zufallsgrößen und die Glockenkurve.",
            "From the binomial to the normal distribution: discrete and continuous random variables and the bell curve.",
          ),
          parts: [
            {
              code: "3.6.5 (1)–(3)",
              title: L(
                "mit Normalverteilungen umgehen",
                "Working with normal distributions",
              ),
              summary: L(
                "Diskrete und stetige Zufallsgrößen unterscheiden, den Einfluss von Erwartungswert und Standardabweichung auf die Glockenkurve beschreiben und Wahrscheinlichkeiten berechnen.",
                "Distinguishing discrete and continuous random variables, describing how mean and standard deviation shape the bell curve, and calculating probabilities.",
              ),
              simulations: ["normalverteilung"],
            },
          ],
        },
      ],
    },
  ],
};
