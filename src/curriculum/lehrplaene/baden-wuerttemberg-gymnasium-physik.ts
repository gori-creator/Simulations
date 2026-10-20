import { L } from "../helpers";
import type { StateCurriculum } from "./types";

/**
 * Physik am Gymnasium in Baden-Württemberg (G9) nach dem Bildungsplan:
 * Doppelklassenstufen 7/8 und 9/10 (bei beiden Klassen eingetragen), Klasse 11
 * und Kursstufe 12/13 mit Basisfach Quantenphysik (3.4), Basisfach Astrophysik
 * (3.5) und Leistungsfach (3.6, gekennzeichnet).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/baden-wuerttemberg-gymnasium-physik.{json,md}.
 * Überschriften wie im Bildungsplan, Kurzbeschreibungen in eigenen Worten.
 * Simulationen nur, wo ihre Klassenstufe passt. Verbindlich ist der Originaltext.
 */
export const badenWuerttembergGymnasiumPhysik: StateCurriculum = {
  id: "baden-wuerttemberg-gymnasium-physik",
  subject: "physik",
  slug: L("baden-wuerttemberg-gymnasium", "baden-wuerttemberg-gymnasium"),
  state: L("Baden-Württemberg", "Baden-Württemberg"),
  schoolType: L("Gymnasium", "Gymnasium"),
  sourceName: "Bildungsplan",
  grades: [
    {
      grade: 7,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.1 gilt für die Doppelklassenstufe 7/8; derselbe Inhalt steht auch bei Klasse 8. Simulationen stehen nur dort, wo ihre Klassenstufe passt. Die Abschnitte „Einführung in die Physik“ (3.1.2–3.1.4) gehören laut Bildungsplan zur Einführung in Klasse 7.",
        "Section 3.1 covers the double grade 7/8; the same content is also listed under grade 8. Simulations are listed only where their grade range fits. According to the curriculum, the “Introduction to physics” sections (3.1.2–3.1.4) belong to the introduction in grade 7.",
      ),
      units: [
        {
          code: "3.1.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik",
            "Ways of thinking and working in physics",
          ),
          summary: L(
            "Beobachtung und Erklärung unterscheiden, physikalische Aussagen mit Experimenten überprüfen, Modelle nutzen und das SI-Einheitensystem kennen.",
            "Distinguishing observation from explanation, testing physical statements with experiments, using models and knowing the SI system of units.",
          ),
        },
        {
          code: "3.1.2",
          title: L(
            "Einführung in die Physik: Akustik",
            "Introduction to physics: acoustics",
          ),
          summary: L(
            "Schall erzeugen, ausbreiten und hören; Lautstärke und Tonhöhe mit Amplitude und Frequenz einer Schwingung verbinden und Hörschäden durch Lärm bewerten.",
            "Producing, transmitting and hearing sound; linking loudness and pitch to amplitude and frequency of an oscillation, and judging the risk of hearing damage from noise.",
          ),
        },
        {
          code: "3.1.3",
          title: L(
            "Einführung in die Physik: Messgeräte entwickeln",
            "Introduction to physics: developing measuring instruments",
          ),
          summary: L(
            "Wasser beim Erwärmen und Abkühlen beobachten, die Celsiusskala verstehen und selbst ein Messgerät mit Skala bauen und beurteilen.",
            "Observing water as it is heated and cooled, understanding the Celsius scale, and building and judging a measuring device with its own scale.",
          ),
          simulations: ["teilchenmodell"],
        },
        {
          code: "3.1.4",
          title: L(
            "Einführung in die Physik: Energie effizient nutzen",
            "Introduction to physics: using energy efficiently",
          ),
          summary: L(
            "Grundeigenschaften der Energie und Energieketten; Wärmeleitung, Konvektion und Wärmestrahlung untersuchen, Dämmstoffe prüfen und Regeln zum Energiesparen ableiten.",
            "Basic properties of energy and energy chains; investigating conduction, convection and thermal radiation, testing insulating materials and deriving rules for saving energy.",
          ),
        },
        {
          code: "3.1.5",
          title: L("Mechanik: Kinematik", "Mechanics: kinematics"),
          summary: L(
            "Bewegungen in Worten und mit s-t-Diagrammen beschreiben, Geschwindigkeit als Strecke pro Zeit berechnen und Folgerungen für den Straßenverkehr ziehen.",
            "Describing motion in words and with distance–time graphs, calculating speed as distance over time and drawing conclusions for road safety.",
          ),
          simulations: ["bewegungsdiagramme"],
        },
        {
          code: "3.1.6",
          title: L("Mechanik: Dynamik", "Mechanics: dynamics"),
          summary: L(
            "Kräfte ändern Bewegungen und verformen Körper: Trägheit, Hooke’sches Gesetz, Masse und Gewichtskraft sowie Kräftegleichgewicht und resultierende Kraft in einer Richtung.",
            "Forces change motion and deform bodies: inertia, Hooke’s law, mass and weight, and balanced forces and resultant force along one line.",
          ),
          simulations: ["hookesches-gesetz", "hebelgesetz"],
        },
        {
          code: "3.1.7",
          title: L("Optik", "Optics"),
          summary: L(
            "Sehen, Lichtausbreitung im Strahlenmodell, Schatten, Mondphasen und Finsternisse; Reflexion, Brechung, Sammellinse und die Zerlegung von weißem Licht im Spektrum.",
            "Vision, propagation of light in the ray model, shadows, moon phases and eclipses; reflection, refraction, the converging lens and splitting white light into a spectrum.",
          ),
          simulations: ["licht-schatten", "reflexion"],
        },
        {
          code: "3.1.8",
          title: L("Magnetismus", "Magnetism"),
          summary: L(
            "Magnete, Pole und Magnetfelder experimentell untersuchen und mit Feldlinien von Stab- und Hufeisenmagnet beschreiben, einschließlich Erdmagnetfeld.",
            "Investigating magnets, poles and magnetic fields experimentally and describing them with field lines of bar and horseshoe magnets, including the Earth’s magnetic field.",
          ),
        },
      ],
    },
    {
      grade: 8,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.1 gilt für die Doppelklassenstufe 7/8; derselbe Inhalt steht auch bei Klasse 7. Simulationen stehen nur dort, wo ihre Klassenstufe passt. Die Abschnitte „Einführung in die Physik“ (3.1.2–3.1.4) gehören laut Bildungsplan zur Einführung in Klasse 7.",
        "Section 3.1 covers the double grade 7/8; the same content is also listed under grade 7. Simulations are listed only where their grade range fits. According to the curriculum, the “Introduction to physics” sections (3.1.2–3.1.4) belong to the introduction in grade 7.",
      ),
      units: [
        {
          code: "3.1.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik",
            "Ways of thinking and working in physics",
          ),
          summary: L(
            "Beobachtung und Erklärung unterscheiden, physikalische Aussagen mit Experimenten überprüfen, Modelle nutzen und das SI-Einheitensystem kennen.",
            "Distinguishing observation from explanation, testing physical statements with experiments, using models and knowing the SI system of units.",
          ),
        },
        {
          code: "3.1.2",
          title: L(
            "Einführung in die Physik: Akustik",
            "Introduction to physics: acoustics",
          ),
          summary: L(
            "Schall erzeugen, ausbreiten und hören; Lautstärke und Tonhöhe mit Amplitude und Frequenz einer Schwingung verbinden und Hörschäden durch Lärm bewerten.",
            "Producing, transmitting and hearing sound; linking loudness and pitch to amplitude and frequency of an oscillation, and judging the risk of hearing damage from noise.",
          ),
        },
        {
          code: "3.1.3",
          title: L(
            "Einführung in die Physik: Messgeräte entwickeln",
            "Introduction to physics: developing measuring instruments",
          ),
          summary: L(
            "Wasser beim Erwärmen und Abkühlen beobachten, die Celsiusskala verstehen und selbst ein Messgerät mit Skala bauen und beurteilen.",
            "Observing water as it is heated and cooled, understanding the Celsius scale, and building and judging a measuring device with its own scale.",
          ),
          simulations: ["teilchenmodell"],
        },
        {
          code: "3.1.4",
          title: L(
            "Einführung in die Physik: Energie effizient nutzen",
            "Introduction to physics: using energy efficiently",
          ),
          summary: L(
            "Grundeigenschaften der Energie und Energieketten; Wärmeleitung, Konvektion und Wärmestrahlung untersuchen, Dämmstoffe prüfen und Regeln zum Energiesparen ableiten.",
            "Basic properties of energy and energy chains; investigating conduction, convection and thermal radiation, testing insulating materials and deriving rules for saving energy.",
          ),
        },
        {
          code: "3.1.5",
          title: L("Mechanik: Kinematik", "Mechanics: kinematics"),
          summary: L(
            "Bewegungen in Worten und mit s-t-Diagrammen beschreiben, Geschwindigkeit als Strecke pro Zeit berechnen und Folgerungen für den Straßenverkehr ziehen.",
            "Describing motion in words and with distance–time graphs, calculating speed as distance over time and drawing conclusions for road safety.",
          ),
          simulations: ["bewegungsdiagramme"],
        },
        {
          code: "3.1.6",
          title: L("Mechanik: Dynamik", "Mechanics: dynamics"),
          summary: L(
            "Kräfte ändern Bewegungen und verformen Körper: Trägheit, Hooke’sches Gesetz, Masse und Gewichtskraft sowie Kräftegleichgewicht und resultierende Kraft in einer Richtung.",
            "Forces change motion and deform bodies: inertia, Hooke’s law, mass and weight, and balanced forces and resultant force along one line.",
          ),
          simulations: ["hookesches-gesetz", "hebelgesetz"],
        },
        {
          code: "3.1.7",
          title: L("Optik", "Optics"),
          summary: L(
            "Sehen, Lichtausbreitung im Strahlenmodell, Schatten, Mondphasen und Finsternisse; Reflexion, Brechung, Sammellinse und die Zerlegung von weißem Licht im Spektrum.",
            "Vision, propagation of light in the ray model, shadows, moon phases and eclipses; reflection, refraction, the converging lens and splitting white light into a spectrum.",
          ),
          simulations: ["reflexion", "brechung", "linsen"],
        },
        {
          code: "3.1.8",
          title: L("Magnetismus", "Magnetism"),
          summary: L(
            "Magnete, Pole und Magnetfelder experimentell untersuchen und mit Feldlinien von Stab- und Hufeisenmagnet beschreiben, einschließlich Erdmagnetfeld.",
            "Investigating magnets, poles and magnetic fields experimentally and describing them with field lines of bar and horseshoe magnets, including the Earth’s magnetic field.",
          ),
        },
      ],
    },
    {
      grade: 9,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.2 gilt für die Doppelklassenstufe 9/10; derselbe Inhalt steht auch bei Klasse 10. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.2 covers the double grade 9/10; the same content is also listed under grade 10. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.2.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik",
            "Ways of thinking and working in physics",
          ),
          summary: L(
            "Beobachtung und Erklärung unterscheiden, Aussagen experimentell überprüfen, Modelle wie das Atommodell nutzen und die Bedeutung des SI-Systems erläutern.",
            "Distinguishing observation from explanation, testing statements experimentally, using models such as the atomic model and explaining the importance of the SI system.",
          ),
        },
        {
          code: "3.2.2",
          title: L("Energie", "Energy"),
          summary: L(
            "Energieformen, Energieübertragung und Energieentwertung; Lageenergie, Leistung und Wirkungsgrad berechnen und sorgsamen Umgang mit Energie bewerten.",
            "Forms of energy, energy transfer and dissipation; calculating potential energy, power and efficiency and evaluating careful use of energy.",
          ),
          simulations: ["energieerhaltung"],
        },
        {
          code: "3.2.3",
          title: L(
            "Grundgrößen der Elektrizitätslehre",
            "Basic quantities of electricity",
          ),
          summary: L(
            "Bauteile und Schaltpläne, Leiter und Nichtleiter, Stromstärke und Spannung messen, Regeln in Reihen- und Parallelschaltung sowie elektrische Leistung, Wirkungen und Gefahren des Stroms.",
            "Components and circuit diagrams, conductors and insulators, measuring current and voltage, rules in series and parallel circuits, and electrical power, effects and dangers of current.",
          ),
          simulations: ["reihe-parallel", "einfacher-stromkreis"],
        },
        {
          code: "3.2.4",
          title: L("Grundlagen der Wärmelehre", "Basics of thermodynamics"),
          summary: L(
            "Wärmeausdehnung und Dichte, Celsius- und Kelvinskala mit absolutem Nullpunkt und die drei Arten des Wärmetransports mit technischen Anwendungen.",
            "Thermal expansion and density, Celsius and Kelvin scales with absolute zero, and the three types of heat transfer with technical applications.",
          ),
          simulations: ["gasgesetze", "teilchenmodell"],
        },
        {
          code: "3.2.5",
          title: L("Elektromagnetismus", "Electromagnetism"),
          summary: L(
            "Widerstand und Kennlinien, Ersatzwiderstand in Reihen- und Parallelschaltung; Induktion qualitativ, Generator, Transformator und elektrische Energieversorgung.",
            "Resistance and characteristic curves, equivalent resistance in series and parallel; induction qualitatively, generator, transformer and electrical power supply.",
          ),
          simulations: ["ohmsches-gesetz", "reihe-parallel"],
        },
        {
          code: "3.2.6",
          title: L(
            "Wärmelehre und Klimaphysik",
            "Thermodynamics and climate physics",
          ),
          summary: L(
            "Erwärmungsenergie mit der spezifischen Wärmekapazität berechnen und den natürlichen und menschengemachten Treibhauseffekt, Kippelemente und Wege der Energieversorgung beurteilen.",
            "Calculating heating energy with specific heat capacity and evaluating the natural and man-made greenhouse effect, tipping elements and ways of supplying energy.",
          ),
        },
        {
          code: "3.2.7",
          title: L("Struktur der Materie", "Structure of matter"),
          summary: L(
            "Aufbau des Atoms und Isotope, Radioaktivität mit α-, β- und γ-Strahlung und Halbwertszeit, Kernspaltung und Kernfusion sowie Nutzen, Risiken und Strahlenschutz.",
            "Structure of the atom and isotopes, radioactivity with alpha, beta and gamma radiation and half-life, nuclear fission and fusion, and benefits, risks and radiation protection.",
          ),
          simulations: ["radioaktiver-zerfall"],
        },
      ],
    },
    {
      grade: 10,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Abschnitt 3.2 gilt für die Doppelklassenstufe 9/10; derselbe Inhalt steht auch bei Klasse 9. Simulationen stehen nur dort, wo ihre Klassenstufe passt.",
        "Section 3.2 covers the double grade 9/10; the same content is also listed under grade 9. Simulations are listed only where their grade range fits.",
      ),
      units: [
        {
          code: "3.2.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik",
            "Ways of thinking and working in physics",
          ),
          summary: L(
            "Beobachtung und Erklärung unterscheiden, Aussagen experimentell überprüfen, Modelle wie das Atommodell nutzen und die Bedeutung des SI-Systems erläutern.",
            "Distinguishing observation from explanation, testing statements experimentally, using models such as the atomic model and explaining the importance of the SI system.",
          ),
        },
        {
          code: "3.2.2",
          title: L("Energie", "Energy"),
          summary: L(
            "Energieformen, Energieübertragung und Energieentwertung; Lageenergie, Leistung und Wirkungsgrad berechnen und sorgsamen Umgang mit Energie bewerten.",
            "Forms of energy, energy transfer and dissipation; calculating potential energy, power and efficiency and evaluating careful use of energy.",
          ),
          simulations: ["energieerhaltung"],
        },
        {
          code: "3.2.3",
          title: L(
            "Grundgrößen der Elektrizitätslehre",
            "Basic quantities of electricity",
          ),
          summary: L(
            "Bauteile und Schaltpläne, Leiter und Nichtleiter, Stromstärke und Spannung messen, Regeln in Reihen- und Parallelschaltung sowie elektrische Leistung, Wirkungen und Gefahren des Stroms.",
            "Components and circuit diagrams, conductors and insulators, measuring current and voltage, rules in series and parallel circuits, and electrical power, effects and dangers of current.",
          ),
        },
        {
          code: "3.2.4",
          title: L("Grundlagen der Wärmelehre", "Basics of thermodynamics"),
          summary: L(
            "Wärmeausdehnung und Dichte, Celsius- und Kelvinskala mit absolutem Nullpunkt und die drei Arten des Wärmetransports mit technischen Anwendungen.",
            "Thermal expansion and density, Celsius and Kelvin scales with absolute zero, and the three types of heat transfer with technical applications.",
          ),
          simulations: ["gasgesetze"],
        },
        {
          code: "3.2.5",
          title: L("Elektromagnetismus", "Electromagnetism"),
          summary: L(
            "Widerstand und Kennlinien, Ersatzwiderstand in Reihen- und Parallelschaltung; Induktion qualitativ, Generator, Transformator und elektrische Energieversorgung.",
            "Resistance and characteristic curves, equivalent resistance in series and parallel; induction qualitatively, generator, transformer and electrical power supply.",
          ),
          simulations: ["induktion"],
        },
        {
          code: "3.2.6",
          title: L(
            "Wärmelehre und Klimaphysik",
            "Thermodynamics and climate physics",
          ),
          summary: L(
            "Erwärmungsenergie mit der spezifischen Wärmekapazität berechnen und den natürlichen und menschengemachten Treibhauseffekt, Kippelemente und Wege der Energieversorgung beurteilen.",
            "Calculating heating energy with specific heat capacity and evaluating the natural and man-made greenhouse effect, tipping elements and ways of supplying energy.",
          ),
        },
        {
          code: "3.2.7",
          title: L("Struktur der Materie", "Structure of matter"),
          summary: L(
            "Aufbau des Atoms und Isotope, Radioaktivität mit α-, β- und γ-Strahlung und Halbwertszeit, Kernspaltung und Kernfusion sowie Nutzen, Risiken und Strahlenschutz.",
            "Structure of the atom and isotopes, radioactivity with alpha, beta and gamma radiation and half-life, nuclear fission and fusion, and benefits, risks and radiation protection.",
          ),
          simulations: ["radioaktiver-zerfall"],
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
          code: "3.3.1",
          title: L("Mechanik", "Mechanics"),
          summary: L(
            "Bewegungen mit Ort, Geschwindigkeit und Beschleunigung beschreiben, mit Newtons Prinzipien und dem Impuls erklären und mit Energie- und Impulserhaltung berechnen.",
            "Describing motion with position, velocity and acceleration, explaining it with Newton’s laws and momentum, and calculating it with conservation of energy and momentum.",
          ),
          parts: [
            {
              code: "3.3.1.1",
              title: L("Kinematik", "Kinematics"),
              summary: L(
                "Gleichförmige und gleichmäßig beschleunigte Bewegungen mit Gleichungen und s-t-, v-t- und a-t-Diagrammen beschreiben; zusammengesetzte Bewegungen wie den waagerechten Wurf und die gleichförmige Kreisbewegung untersuchen.",
                "Describing uniform and uniformly accelerated motion with equations and s–t, v–t and a–t graphs; investigating combined motion such as horizontal projection and uniform circular motion.",
              ),
              simulations: [
                "schiefer-wurf",
                "kreisbewegung",
                "bewegungsdiagramme",
                "freier-fall",
              ],
            },
            {
              code: "3.3.1.2",
              title: L("Dynamik", "Dynamics"),
              summary: L(
                "Kräfte beliebiger Richtung zusammensetzen (z. B. schiefe Ebene), Newton’sche Prinzipien mit F = m·a und Impuls anwenden, Fall mit Luftwiderstand, waagerechten Wurf und Zentripetalkraft erklären.",
                "Combining forces in any direction (e.g. inclined plane), applying Newton’s laws with F = m·a and momentum, explaining fall with air resistance, horizontal projection and centripetal force.",
              ),
              simulations: [
                "kreisbewegung",
                "schiefer-wurf",
                "kraefteaddition",
                "schiefe-ebene",
                "freier-fall",
                "planetenbahnen",
              ],
            },
            {
              code: "3.3.1.3",
              title: L("Erhaltungssätze", "Conservation laws"),
              summary: L(
                "Kinetische, potenzielle und Spannenergie berechnen, Energiebilanzen mit dem Energieerhaltungssatz aufstellen und Stöße und Rückstoß mit dem Impulserhaltungssatz rechnen.",
                "Calculating kinetic, potential and elastic energy, setting up energy balances with conservation of energy, and calculating collisions and recoil with conservation of momentum.",
              ),
              simulations: ["stoesse", "energieerhaltung"],
            },
          ],
        },
      ],
    },
    {
      grade: 12,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Kursstufe (Klassen 12/13); derselbe Inhalt steht auch bei Klasse 13. In diesem Eintrag stehen beide Basisfächer (3.4 Schwerpunkt Quantenphysik, 3.5 Schwerpunkt Astrophysik) und das Leistungsfach (3.6, „(nur Leistungsfach)“); die Fassung steht jeweils in der Überschrift.",
        "Course phase (grades 12/13); the same content is also listed under grade 13. This entry contains both basic courses (3.4 focus on quantum physics, 3.5 focus on astrophysics) and the advanced course (3.6, “advanced course only”); the variant is given in each heading.",
      ),
      units: [
        {
          code: "3.4.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik (Basisfach mit Schwerpunkt Quantenphysik)",
            "Ways of thinking and working in physics (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Überprüfbarkeit physikalischer Aussagen durch das Experiment, Modelle von Licht und Materie und die Bedeutung von Naturkonstanten wie der Planck’schen Konstanten.",
            "Testability of physical statements by experiment, models of light and matter and the importance of natural constants such as Planck’s constant.",
          ),
        },
        {
          code: "3.4.2",
          title: L(
            "Elektromagnetische Felder (Basisfach mit Schwerpunkt Quantenphysik)",
            "Electromagnetic fields (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Elektrische und magnetische Felder, Kräfte auf Ladungen und Leiter, Kondensator und Spule sowie die elektromagnetische Induktion.",
            "Electric and magnetic fields, forces on charges and conductors, capacitor and coil, and electromagnetic induction.",
          ),
          parts: [
            {
              code: "3.4.2.1",
              title: L(
                "Elektrische und magnetische Felder",
                "Electric and magnetic fields",
              ),
              summary: L(
                "Feldlinienbilder und Überlagerung von Feldern, elektrische Feldstärke und magnetische Flussdichte, Lorentzkraft und Bahnen geladener Teilchen (qualitativ); Plattenkondensator mit Lade- und Entladekurve und die schlanke Spule.",
                "Field line patterns and superposition, electric field strength and magnetic flux density, Lorentz force and paths of charged particles (qualitative); the parallel-plate capacitor with charging and discharging curves and the long coil.",
              ),
              simulations: ["feldlinien", "lorentzkraft", "kondensator"],
            },
            {
              code: "3.4.2.2",
              title: L("Elektrodynamik", "Electrodynamics"),
              summary: L(
                "Induktion im bewegten Leiter über die Lorentzkraft erklären, das Induktionsgesetz mit magnetischem Fluss und Lenz’scher Regel untersuchen und Anwendungen wie Generator und Transformator beschreiben.",
                "Explaining induction in a moving conductor using the Lorentz force, investigating Faraday’s law with magnetic flux and Lenz’s rule, and describing applications such as generator and transformer.",
              ),
              simulations: ["induktion"],
            },
          ],
        },
        {
          code: "3.4.3",
          title: L(
            "Schwingungen (Basisfach mit Schwerpunkt Quantenphysik)",
            "Oscillations (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Schwingungen aufzeichnen und mit Amplitude, Periodendauer und Frequenz beschreiben; harmonische Schwingung mit Sinusfunktion, Federpendel und elektromagnetischer Schwingkreis mit ihren Energieumwandlungen.",
            "Recording oscillations and describing them by amplitude, period and frequency; harmonic oscillation with the sine function, the spring pendulum and the electromagnetic LC circuit with their energy conversions.",
          ),
          simulations: ["federpendel"],
        },
        {
          code: "3.4.4",
          title: L(
            "Wellen (Basisfach mit Schwerpunkt Quantenphysik)",
            "Waves (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Kenngrößen von Wellen, Längs- und Querwellen, Beugung, Reflexion, Brechung und Interferenz, stehende Wellen und Huygens’sches Prinzip sowie das elektromagnetische Spektrum im Alltag.",
            "Wave quantities, longitudinal and transverse waves, diffraction, reflection, refraction and interference, standing waves and Huygens’ principle, and the electromagnetic spectrum in everyday life.",
          ),
          simulations: ["wellen-ausbreitung", "stehende-wellen", "interferenz"],
        },
        {
          code: "3.4.5",
          title: L(
            "Wellenoptik (Basisfach mit Schwerpunkt Quantenphysik)",
            "Wave optics (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Licht als elektromagnetische Welle, Grenzen des Strahlenmodells, Interferenzmuster an Doppelspalt und Gitter beschreiben und berechnen und Licht spektral zerlegen.",
            "Light as an electromagnetic wave, limits of the ray model, describing and calculating interference patterns at double slit and grating, and splitting light into its spectrum.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "3.4.6",
          title: L(
            "Quantenphysik und Materie (Basisfach mit Schwerpunkt Quantenphysik)",
            "Quantum physics and matter (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Quantenobjekte am Doppelspalt mit Wahrscheinlichkeitsaussagen, Fotoeffekt, Energie und Impuls von Photonen und Materiewellen, Messprozess und Verschränkung; Linienspektren und Energieniveaus des Wasserstoffatoms.",
            "Quantum objects at the double slit described with probabilities, photoelectric effect, energy and momentum of photons and matter waves, measurement and entanglement; line spectra and energy levels of the hydrogen atom.",
          ),
          simulations: ["photoeffekt", "linienspektren", "elektronenbeugung"],
        },
        {
          code: "3.5.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik (Basisfach mit Schwerpunkt Astrophysik)",
            "Ways of thinking and working in physics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Überprüfbarkeit physikalischer Aussagen, Modelle von Licht, Materie und Kosmos und die Rolle von Naturkonstanten; dazu Astronomie als Beobachtungswissenschaft und astronomische Einheiten wie Lichtjahr und Parsec.",
            "Testability of physical statements, models of light, matter and the cosmos and the role of natural constants; plus astronomy as an observational science and astronomical units such as light year and parsec.",
          ),
        },
        {
          code: "3.5.2",
          title: L(
            "Elektromagnetische Felder (Basisfach mit Schwerpunkt Astrophysik)",
            "Electromagnetic fields (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Elektrische und magnetische Felder, Kräfte auf Ladungen und Leiter, Kondensator und Spule sowie die elektromagnetische Induktion.",
            "Electric and magnetic fields, forces on charges and conductors, capacitor and coil, and electromagnetic induction.",
          ),
          parts: [
            {
              code: "3.5.2.1",
              title: L(
                "Elektrische und magnetische Felder",
                "Electric and magnetic fields",
              ),
              summary: L(
                "Feldlinienbilder und Überlagerung von Feldern, elektrische Feldstärke und magnetische Flussdichte, Lorentzkraft und Bahnen geladener Teilchen (qualitativ); Plattenkondensator mit Lade- und Entladekurve und die schlanke Spule.",
                "Field line patterns and superposition, electric field strength and magnetic flux density, Lorentz force and paths of charged particles (qualitative); the parallel-plate capacitor with charging and discharging curves and the long coil.",
              ),
              simulations: ["feldlinien", "lorentzkraft", "kondensator"],
            },
            {
              code: "3.5.2.2",
              title: L("Elektrodynamik", "Electrodynamics"),
              summary: L(
                "Induktion im bewegten Leiter über die Lorentzkraft erklären, das Induktionsgesetz mit magnetischem Fluss und Lenz’scher Regel untersuchen und Anwendungen wie Generator und Transformator beschreiben.",
                "Explaining induction in a moving conductor using the Lorentz force, investigating Faraday’s law with magnetic flux and Lenz’s rule, and describing applications such as generator and transformer.",
              ),
              simulations: ["induktion"],
            },
          ],
        },
        {
          code: "3.5.3",
          title: L(
            "Schwingungen (Basisfach mit Schwerpunkt Astrophysik)",
            "Oscillations (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Schwingungen aufzeichnen und mit Amplitude, Periodendauer und Frequenz beschreiben; harmonische Schwingung mit Sinusfunktion, Federpendel und elektromagnetischer Schwingkreis mit ihren Energieumwandlungen.",
            "Recording oscillations and describing them by amplitude, period and frequency; harmonic oscillation with the sine function, the spring pendulum and the electromagnetic LC circuit with their energy conversions.",
          ),
          simulations: ["federpendel"],
        },
        {
          code: "3.5.4",
          title: L(
            "Wellen (Basisfach mit Schwerpunkt Astrophysik)",
            "Waves (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Kenngrößen von Wellen, Längs- und Querwellen, Beugung, Interferenz und stehende Wellen, Huygens’sches Prinzip; dazu Doppler-Effekt, elektromagnetisches Spektrum und der Vergleich mit Gravitationswellen.",
            "Wave quantities, longitudinal and transverse waves, diffraction, interference and standing waves, Huygens’ principle; plus the Doppler effect, the electromagnetic spectrum and a comparison with gravitational waves.",
          ),
          simulations: [
            "wellen-ausbreitung",
            "stehende-wellen",
            "interferenz",
            "doppler-effekt",
          ],
        },
        {
          code: "3.5.5",
          title: L(
            "Wellenoptik (Basisfach mit Schwerpunkt Astrophysik)",
            "Wave optics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Licht als elektromagnetische Welle, Grenzen des Strahlenmodells, Interferenzmuster an Doppelspalt und Gitter berechnen und Spektren verschiedener Lichtquellen untersuchen.",
            "Light as an electromagnetic wave, limits of the ray model, calculating interference patterns at double slit and grating, and investigating spectra of different light sources.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "3.5.6",
          title: L(
            "Atom- und Kernphysik (Basisfach mit Schwerpunkt Astrophysik)",
            "Atomic and nuclear physics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Fotoeffekt und Photonen, de-Broglie-Wellenlänge, Arten von Spektren und Linienspektren als Energieübergänge, Spektralanalyse kosmischer Materie und die Kernfusion in Sternen.",
            "Photoelectric effect and photons, de Broglie wavelength, types of spectra and line spectra as energy transitions, spectral analysis of cosmic matter and nuclear fusion in stars.",
          ),
          simulations: ["photoeffekt", "linienspektren", "elektronenbeugung"],
        },
        {
          code: "3.5.7",
          title: L(
            "Astrophysik (Basisfach mit Schwerpunkt Astrophysik)",
            "Astrophysics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Entwicklung des Universums vom Urknall an, Galaxien, Rotverschiebung und Hubble-Beziehung; Entstehung, Leben und Ende von Sternen sowie Methoden zum Nachweis und zur Untersuchung von Exoplaneten.",
            "Evolution of the universe from the Big Bang, galaxies, redshift and the Hubble relation; birth, life and death of stars, and methods for detecting and studying exoplanets.",
          ),
        },
        {
          code: "3.6.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik (nur Leistungsfach)",
            "Ways of thinking and working in physics (advanced course only)",
          ),
          summary: L(
            "Überprüfbarkeit physikalischer Aussagen, Modelle von Licht und Materie und die Bedeutung von Naturkonstanten.",
            "Testability of physical statements, models of light and matter and the importance of natural constants.",
          ),
        },
        {
          code: "3.6.2",
          title: L(
            "Elektromagnetische Felder (nur Leistungsfach)",
            "Electromagnetic fields (advanced course only)",
          ),
          summary: L(
            "Elektrische und magnetische Felder quantitativ, Bewegung geladener Teilchen in Feldern und Induktion einschließlich Selbstinduktion.",
            "Electric and magnetic fields quantitatively, motion of charged particles in fields and induction including self-induction.",
          ),
          parts: [
            {
              code: "3.6.2.1",
              title: L("Elektrisches Feld", "Electric field"),
              summary: L(
                "Coulomb’sches Gesetz, Feldlinien und Superposition, Influenz, Feldstärke, Kapazität und Energie des Plattenkondensators, Lade- und Entladekurven, Potenzial und die quantitative Bewegung geladener Teilchen im Feld.",
                "Coulomb’s law, field lines and superposition, electrostatic induction, field strength, capacitance and energy of the parallel-plate capacitor, charging and discharging curves, potential, and quantitative motion of charged particles in the field.",
              ),
              simulations: ["feldlinien", "kondensator"],
            },
            {
              code: "3.6.2.2",
              title: L("Magnetisches Feld", "Magnetic field"),
              summary: L(
                "Magnetfelder von Leiter und Spule, Kraft auf Leiter und Lorentzkraft, Hall-Effekt, Kreisbahnen geladener Teilchen quantitativ sowie gekreuzte Felder in Wien-Filter und Massenspektrograph.",
                "Magnetic fields of wire and coil, force on a conductor and Lorentz force, Hall effect, quantitative circular paths of charged particles, and crossed fields in the Wien filter and mass spectrometer.",
              ),
              simulations: ["lorentzkraft"],
            },
            {
              code: "3.6.2.3",
              title: L("Elektrodynamik", "Electrodynamics"),
              summary: L(
                "Induktionsgesetz erläutern und anwenden, Selbstinduktion beim Ein- und Ausschalten, Induktivität und Energie einer Spule sowie Wirbelströme in der Technik.",
                "Explaining and applying Faraday’s law, self-induction when switching on and off, inductance and energy of a coil, and eddy currents in technology.",
              ),
              simulations: ["induktion"],
            },
          ],
        },
        {
          code: "3.6.3",
          title: L(
            "Schwingungen (nur Leistungsfach)",
            "Oscillations (advanced course only)",
          ),
          summary: L(
            "Harmonische und gedämpfte Schwingungen mathematisch beschreiben, Periodendauer von Feder- und Fadenpendel und Schwingkreis, Vergleich mechanisch–elektromagnetisch und Resonanz.",
            "Describing harmonic and damped oscillations mathematically, periods of spring and simple pendulum and LC circuit, comparing mechanical and electromagnetic oscillations, and resonance.",
          ),
          simulations: ["federpendel", "fadenpendel", "resonanz"],
        },
        {
          code: "3.6.4",
          title: L(
            "Wellen (nur Leistungsfach)",
            "Waves (advanced course only)",
          ),
          summary: L(
            "Wellen mit Kenngrößen und der Wellengleichung beschreiben, stehende Wellen, Überlagerung zweidimensionaler Wellen mit dem Gangunterschied, Huygens’sches Prinzip und elektromagnetisches Spektrum.",
            "Describing waves with their quantities and the wave equation, standing waves, superposition of two-dimensional waves using path difference, Huygens’ principle and the electromagnetic spectrum.",
          ),
          simulations: ["wellen-ausbreitung", "stehende-wellen", "interferenz"],
        },
        {
          code: "3.6.5",
          title: L(
            "Wellenoptik (nur Leistungsfach)",
            "Wave optics (advanced course only)",
          ),
          summary: L(
            "Interferenz an Einzelspalt, Doppelspalt und Gitter untersuchen und berechnen, Interferometer wie das Michelson-Interferometer und Grenzen des Strahlenmodells.",
            "Investigating and calculating interference at single slit, double slit and grating, interferometers such as the Michelson interferometer, and the limits of the ray model.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "3.6.6",
          title: L(
            "Quantenphysik und Materie (nur Leistungsfach)",
            "Quantum physics and matter (advanced course only)",
          ),
          summary: L(
            "Fotoeffekt, Photonen und Materiewellen, Quantenobjekte am Doppelspalt mit Wahrscheinlichkeitsdichte, Unbestimmtheit und Verschränkung; Linienspektren, Röntgenspektrum, Potenzialtopf und Atommodelle mit Pauli-Prinzip.",
            "Photoelectric effect, photons and matter waves, quantum objects at the double slit with probability density, uncertainty and entanglement; line spectra, X-ray spectrum, the particle in a box and atomic models with the Pauli principle.",
          ),
          simulations: ["photoeffekt", "linienspektren", "elektronenbeugung"],
        },
        {
          code: "3.6.7",
          title: L(
            "Vertiefendes Themengebiet (nur Leistungsfach)",
            "In-depth topic (advanced course only)",
          ),
          summary: L(
            "Ein Forschungsgebiet der Physik (z. B. Relativitätstheorie, Laser- oder Teilchenphysik, Astrophysik) vertieft erarbeiten und typische Methoden daran anwenden.",
            "Studying one field of physics research in depth (e.g. relativity, laser or particle physics, astrophysics) and applying its typical methods.",
          ),
        },
      ],
    },
    {
      grade: 13,
      sourceUrl: "https://www.bildungsplaene-bw.de",
      note: L(
        "Kursstufe (Klassen 12/13); derselbe Inhalt steht auch bei Klasse 12. In diesem Eintrag stehen beide Basisfächer (3.4 Schwerpunkt Quantenphysik, 3.5 Schwerpunkt Astrophysik) und das Leistungsfach (3.6, „(nur Leistungsfach)“); die Fassung steht jeweils in der Überschrift.",
        "Course phase (grades 12/13); the same content is also listed under grade 12. This entry contains both basic courses (3.4 focus on quantum physics, 3.5 focus on astrophysics) and the advanced course (3.6, “advanced course only”); the variant is given in each heading.",
      ),
      units: [
        {
          code: "3.4.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik (Basisfach mit Schwerpunkt Quantenphysik)",
            "Ways of thinking and working in physics (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Überprüfbarkeit physikalischer Aussagen durch das Experiment, Modelle von Licht und Materie und die Bedeutung von Naturkonstanten wie der Planck’schen Konstanten.",
            "Testability of physical statements by experiment, models of light and matter and the importance of natural constants such as Planck’s constant.",
          ),
        },
        {
          code: "3.4.2",
          title: L(
            "Elektromagnetische Felder (Basisfach mit Schwerpunkt Quantenphysik)",
            "Electromagnetic fields (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Elektrische und magnetische Felder, Kräfte auf Ladungen und Leiter, Kondensator und Spule sowie die elektromagnetische Induktion.",
            "Electric and magnetic fields, forces on charges and conductors, capacitor and coil, and electromagnetic induction.",
          ),
          parts: [
            {
              code: "3.4.2.1",
              title: L(
                "Elektrische und magnetische Felder",
                "Electric and magnetic fields",
              ),
              summary: L(
                "Feldlinienbilder und Überlagerung von Feldern, elektrische Feldstärke und magnetische Flussdichte, Lorentzkraft und Bahnen geladener Teilchen (qualitativ); Plattenkondensator mit Lade- und Entladekurve und die schlanke Spule.",
                "Field line patterns and superposition, electric field strength and magnetic flux density, Lorentz force and paths of charged particles (qualitative); the parallel-plate capacitor with charging and discharging curves and the long coil.",
              ),
              simulations: ["lorentzkraft"],
            },
            {
              code: "3.4.2.2",
              title: L("Elektrodynamik", "Electrodynamics"),
              summary: L(
                "Induktion im bewegten Leiter über die Lorentzkraft erklären, das Induktionsgesetz mit magnetischem Fluss und Lenz’scher Regel untersuchen und Anwendungen wie Generator und Transformator beschreiben.",
                "Explaining induction in a moving conductor using the Lorentz force, investigating Faraday’s law with magnetic flux and Lenz’s rule, and describing applications such as generator and transformer.",
              ),
              simulations: ["induktion"],
            },
          ],
        },
        {
          code: "3.4.3",
          title: L(
            "Schwingungen (Basisfach mit Schwerpunkt Quantenphysik)",
            "Oscillations (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Schwingungen aufzeichnen und mit Amplitude, Periodendauer und Frequenz beschreiben; harmonische Schwingung mit Sinusfunktion, Federpendel und elektromagnetischer Schwingkreis mit ihren Energieumwandlungen.",
            "Recording oscillations and describing them by amplitude, period and frequency; harmonic oscillation with the sine function, the spring pendulum and the electromagnetic LC circuit with their energy conversions.",
          ),
        },
        {
          code: "3.4.4",
          title: L(
            "Wellen (Basisfach mit Schwerpunkt Quantenphysik)",
            "Waves (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Kenngrößen von Wellen, Längs- und Querwellen, Beugung, Reflexion, Brechung und Interferenz, stehende Wellen und Huygens’sches Prinzip sowie das elektromagnetische Spektrum im Alltag.",
            "Wave quantities, longitudinal and transverse waves, diffraction, reflection, refraction and interference, standing waves and Huygens’ principle, and the electromagnetic spectrum in everyday life.",
          ),
          simulations: ["stehende-wellen", "interferenz"],
        },
        {
          code: "3.4.5",
          title: L(
            "Wellenoptik (Basisfach mit Schwerpunkt Quantenphysik)",
            "Wave optics (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Licht als elektromagnetische Welle, Grenzen des Strahlenmodells, Interferenzmuster an Doppelspalt und Gitter beschreiben und berechnen und Licht spektral zerlegen.",
            "Light as an electromagnetic wave, limits of the ray model, describing and calculating interference patterns at double slit and grating, and splitting light into its spectrum.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "3.4.6",
          title: L(
            "Quantenphysik und Materie (Basisfach mit Schwerpunkt Quantenphysik)",
            "Quantum physics and matter (basic course, focus on quantum physics)",
          ),
          summary: L(
            "Quantenobjekte am Doppelspalt mit Wahrscheinlichkeitsaussagen, Fotoeffekt, Energie und Impuls von Photonen und Materiewellen, Messprozess und Verschränkung; Linienspektren und Energieniveaus des Wasserstoffatoms.",
            "Quantum objects at the double slit described with probabilities, photoelectric effect, energy and momentum of photons and matter waves, measurement and entanglement; line spectra and energy levels of the hydrogen atom.",
          ),
          simulations: ["photoeffekt", "linienspektren", "elektronenbeugung"],
        },
        {
          code: "3.5.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik (Basisfach mit Schwerpunkt Astrophysik)",
            "Ways of thinking and working in physics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Überprüfbarkeit physikalischer Aussagen, Modelle von Licht, Materie und Kosmos und die Rolle von Naturkonstanten; dazu Astronomie als Beobachtungswissenschaft und astronomische Einheiten wie Lichtjahr und Parsec.",
            "Testability of physical statements, models of light, matter and the cosmos and the role of natural constants; plus astronomy as an observational science and astronomical units such as light year and parsec.",
          ),
        },
        {
          code: "3.5.2",
          title: L(
            "Elektromagnetische Felder (Basisfach mit Schwerpunkt Astrophysik)",
            "Electromagnetic fields (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Elektrische und magnetische Felder, Kräfte auf Ladungen und Leiter, Kondensator und Spule sowie die elektromagnetische Induktion.",
            "Electric and magnetic fields, forces on charges and conductors, capacitor and coil, and electromagnetic induction.",
          ),
          parts: [
            {
              code: "3.5.2.1",
              title: L(
                "Elektrische und magnetische Felder",
                "Electric and magnetic fields",
              ),
              summary: L(
                "Feldlinienbilder und Überlagerung von Feldern, elektrische Feldstärke und magnetische Flussdichte, Lorentzkraft und Bahnen geladener Teilchen (qualitativ); Plattenkondensator mit Lade- und Entladekurve und die schlanke Spule.",
                "Field line patterns and superposition, electric field strength and magnetic flux density, Lorentz force and paths of charged particles (qualitative); the parallel-plate capacitor with charging and discharging curves and the long coil.",
              ),
              simulations: ["lorentzkraft"],
            },
            {
              code: "3.5.2.2",
              title: L("Elektrodynamik", "Electrodynamics"),
              summary: L(
                "Induktion im bewegten Leiter über die Lorentzkraft erklären, das Induktionsgesetz mit magnetischem Fluss und Lenz’scher Regel untersuchen und Anwendungen wie Generator und Transformator beschreiben.",
                "Explaining induction in a moving conductor using the Lorentz force, investigating Faraday’s law with magnetic flux and Lenz’s rule, and describing applications such as generator and transformer.",
              ),
              simulations: ["induktion"],
            },
          ],
        },
        {
          code: "3.5.3",
          title: L(
            "Schwingungen (Basisfach mit Schwerpunkt Astrophysik)",
            "Oscillations (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Schwingungen aufzeichnen und mit Amplitude, Periodendauer und Frequenz beschreiben; harmonische Schwingung mit Sinusfunktion, Federpendel und elektromagnetischer Schwingkreis mit ihren Energieumwandlungen.",
            "Recording oscillations and describing them by amplitude, period and frequency; harmonic oscillation with the sine function, the spring pendulum and the electromagnetic LC circuit with their energy conversions.",
          ),
        },
        {
          code: "3.5.4",
          title: L(
            "Wellen (Basisfach mit Schwerpunkt Astrophysik)",
            "Waves (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Kenngrößen von Wellen, Längs- und Querwellen, Beugung, Interferenz und stehende Wellen, Huygens’sches Prinzip; dazu Doppler-Effekt, elektromagnetisches Spektrum und der Vergleich mit Gravitationswellen.",
            "Wave quantities, longitudinal and transverse waves, diffraction, interference and standing waves, Huygens’ principle; plus the Doppler effect, the electromagnetic spectrum and a comparison with gravitational waves.",
          ),
          simulations: ["stehende-wellen", "interferenz"],
        },
        {
          code: "3.5.5",
          title: L(
            "Wellenoptik (Basisfach mit Schwerpunkt Astrophysik)",
            "Wave optics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Licht als elektromagnetische Welle, Grenzen des Strahlenmodells, Interferenzmuster an Doppelspalt und Gitter berechnen und Spektren verschiedener Lichtquellen untersuchen.",
            "Light as an electromagnetic wave, limits of the ray model, calculating interference patterns at double slit and grating, and investigating spectra of different light sources.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "3.5.6",
          title: L(
            "Atom- und Kernphysik (Basisfach mit Schwerpunkt Astrophysik)",
            "Atomic and nuclear physics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Fotoeffekt und Photonen, de-Broglie-Wellenlänge, Arten von Spektren und Linienspektren als Energieübergänge, Spektralanalyse kosmischer Materie und die Kernfusion in Sternen.",
            "Photoelectric effect and photons, de Broglie wavelength, types of spectra and line spectra as energy transitions, spectral analysis of cosmic matter and nuclear fusion in stars.",
          ),
          simulations: ["photoeffekt", "linienspektren", "elektronenbeugung"],
        },
        {
          code: "3.5.7",
          title: L(
            "Astrophysik (Basisfach mit Schwerpunkt Astrophysik)",
            "Astrophysics (basic course, focus on astrophysics)",
          ),
          summary: L(
            "Entwicklung des Universums vom Urknall an, Galaxien, Rotverschiebung und Hubble-Beziehung; Entstehung, Leben und Ende von Sternen sowie Methoden zum Nachweis und zur Untersuchung von Exoplaneten.",
            "Evolution of the universe from the Big Bang, galaxies, redshift and the Hubble relation; birth, life and death of stars, and methods for detecting and studying exoplanets.",
          ),
        },
        {
          code: "3.6.1",
          title: L(
            "Denk- und Arbeitsweisen der Physik (nur Leistungsfach)",
            "Ways of thinking and working in physics (advanced course only)",
          ),
          summary: L(
            "Überprüfbarkeit physikalischer Aussagen, Modelle von Licht und Materie und die Bedeutung von Naturkonstanten.",
            "Testability of physical statements, models of light and matter and the importance of natural constants.",
          ),
        },
        {
          code: "3.6.2",
          title: L(
            "Elektromagnetische Felder (nur Leistungsfach)",
            "Electromagnetic fields (advanced course only)",
          ),
          summary: L(
            "Elektrische und magnetische Felder quantitativ, Bewegung geladener Teilchen in Feldern und Induktion einschließlich Selbstinduktion.",
            "Electric and magnetic fields quantitatively, motion of charged particles in fields and induction including self-induction.",
          ),
          parts: [
            {
              code: "3.6.2.1",
              title: L("Elektrisches Feld", "Electric field"),
              summary: L(
                "Coulomb’sches Gesetz, Feldlinien und Superposition, Influenz, Feldstärke, Kapazität und Energie des Plattenkondensators, Lade- und Entladekurven, Potenzial und die quantitative Bewegung geladener Teilchen im Feld.",
                "Coulomb’s law, field lines and superposition, electrostatic induction, field strength, capacitance and energy of the parallel-plate capacitor, charging and discharging curves, potential, and quantitative motion of charged particles in the field.",
              ),
            },
            {
              code: "3.6.2.2",
              title: L("Magnetisches Feld", "Magnetic field"),
              summary: L(
                "Magnetfelder von Leiter und Spule, Kraft auf Leiter und Lorentzkraft, Hall-Effekt, Kreisbahnen geladener Teilchen quantitativ sowie gekreuzte Felder in Wien-Filter und Massenspektrograph.",
                "Magnetic fields of wire and coil, force on a conductor and Lorentz force, Hall effect, quantitative circular paths of charged particles, and crossed fields in the Wien filter and mass spectrometer.",
              ),
              simulations: ["lorentzkraft"],
            },
            {
              code: "3.6.2.3",
              title: L("Elektrodynamik", "Electrodynamics"),
              summary: L(
                "Induktionsgesetz erläutern und anwenden, Selbstinduktion beim Ein- und Ausschalten, Induktivität und Energie einer Spule sowie Wirbelströme in der Technik.",
                "Explaining and applying Faraday’s law, self-induction when switching on and off, inductance and energy of a coil, and eddy currents in technology.",
              ),
              simulations: ["induktion"],
            },
          ],
        },
        {
          code: "3.6.3",
          title: L(
            "Schwingungen (nur Leistungsfach)",
            "Oscillations (advanced course only)",
          ),
          summary: L(
            "Harmonische und gedämpfte Schwingungen mathematisch beschreiben, Periodendauer von Feder- und Fadenpendel und Schwingkreis, Vergleich mechanisch–elektromagnetisch und Resonanz.",
            "Describing harmonic and damped oscillations mathematically, periods of spring and simple pendulum and LC circuit, comparing mechanical and electromagnetic oscillations, and resonance.",
          ),
          simulations: ["resonanz"],
        },
        {
          code: "3.6.4",
          title: L(
            "Wellen (nur Leistungsfach)",
            "Waves (advanced course only)",
          ),
          summary: L(
            "Wellen mit Kenngrößen und der Wellengleichung beschreiben, stehende Wellen, Überlagerung zweidimensionaler Wellen mit dem Gangunterschied, Huygens’sches Prinzip und elektromagnetisches Spektrum.",
            "Describing waves with their quantities and the wave equation, standing waves, superposition of two-dimensional waves using path difference, Huygens’ principle and the electromagnetic spectrum.",
          ),
          simulations: ["stehende-wellen", "interferenz"],
        },
        {
          code: "3.6.5",
          title: L(
            "Wellenoptik (nur Leistungsfach)",
            "Wave optics (advanced course only)",
          ),
          summary: L(
            "Interferenz an Einzelspalt, Doppelspalt und Gitter untersuchen und berechnen, Interferometer wie das Michelson-Interferometer und Grenzen des Strahlenmodells.",
            "Investigating and calculating interference at single slit, double slit and grating, interferometers such as the Michelson interferometer, and the limits of the ray model.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "3.6.6",
          title: L(
            "Quantenphysik und Materie (nur Leistungsfach)",
            "Quantum physics and matter (advanced course only)",
          ),
          summary: L(
            "Fotoeffekt, Photonen und Materiewellen, Quantenobjekte am Doppelspalt mit Wahrscheinlichkeitsdichte, Unbestimmtheit und Verschränkung; Linienspektren, Röntgenspektrum, Potenzialtopf und Atommodelle mit Pauli-Prinzip.",
            "Photoelectric effect, photons and matter waves, quantum objects at the double slit with probability density, uncertainty and entanglement; line spectra, X-ray spectrum, the particle in a box and atomic models with the Pauli principle.",
          ),
          simulations: ["photoeffekt", "linienspektren", "elektronenbeugung"],
        },
        {
          code: "3.6.7",
          title: L(
            "Vertiefendes Themengebiet (nur Leistungsfach)",
            "In-depth topic (advanced course only)",
          ),
          summary: L(
            "Ein Forschungsgebiet der Physik (z. B. Relativitätstheorie, Laser- oder Teilchenphysik, Astrophysik) vertieft erarbeiten und typische Methoden daran anwenden.",
            "Studying one field of physics research in depth (e.g. relativity, laser or particle physics, astrophysics) and applying its typical methods.",
          ),
        },
      ],
    },
  ],
};
