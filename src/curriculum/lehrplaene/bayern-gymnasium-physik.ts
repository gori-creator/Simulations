import { L } from "../helpers";
import type { StateCurriculum } from "./types";

/**
 * Physik am bayerischen Gymnasium (G9) nach dem LehrplanPLUS: Natur und Technik 7
 * (Schwerpunkt Physik) und Physik 8–13. In Jahrgangsstufe 12 und 13 stehen die
 * Lehrplanalternativen (Biophysik „B“, Astrophysik „A“) und das erhöhte
 * Anforderungsniveau („E“) mit Buchstaben vor der Nummer in derselben Jahrgangsstufe.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/bayern-gymnasium-physik.{json,md}.
 * Überschriften wie im Lehrplan (außer NT7 1 und 1.1, Entwurf), Kurzbeschreibungen
 * in eigenen Worten. Simulationen nur, wo ihre Klassenstufe passt. Verbindlich ist
 * der Originaltext.
 */
export const bayernGymnasiumPhysik: StateCurriculum = {
  id: "bayern-gymnasium-physik",
  subject: "physik",
  slug: L("bayern-gymnasium", "bavaria-gymnasium"),
  state: L("Bayern", "Bavaria"),
  schoolType: L("Gymnasium", "Gymnasium"),
  sourceName: "LehrplanPLUS",
  grades: [
    {
      grade: 7,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/7/nt_gym",
      note: L(
        "Physik ist hier Teil des Fachs „Natur und Technik“ (Schwerpunkt Physik, Lernbereich NT7 1). Der Schwerpunkt Informatik (NT7 2) ist nicht aufgenommen.",
        "Physics is part of the subject “Natur und Technik” here (physics focus, unit NT7 1). The computer-science focus (NT7 2) is not included.",
      ),
      units: [
        {
          code: "1",
          title: L(
            "Physik in Natur und Technik entdecken (Entwurf: Überschrift nicht aus dem Original übernommen)",
            "Discovering physics in nature and technology (draft: heading not taken from the original)",
          ),
          parts: [
            {
              code: "1.1",
              title: L(
                "Magnetismus und Dichte (Entwurf: Überschrift nicht aus dem Original übernommen)",
                "Magnetism and density (draft: heading not taken from the original)",
              ),
              summary: L(
                "Eigenschaften von Dauermagneten, Elementarmagnete und Erdmagnetfeld; dazu die Dichte als Stoffeigenschaft, bestimmt im eigenen Experiment.",
                "Properties of permanent magnets, the model of elementary magnets and the Earth’s magnetic field; plus density as a property of a material, measured in an own experiment.",
              ),
            },
            {
              code: "1.2",
              title: L("Optische Phänomene", "Optical phenomena"),
              summary: L(
                "Lichtquellen, Sehvorgang und die Farbe von Gegenständen; geradlinige Lichtausbreitung erklärt Kern-, Halb- und Übergangsschatten sowie Mondphasen und Finsternisse.",
                "Light sources, how we see and the colour of objects; straight-line propagation of light explains umbra, penumbra and partial shadows as well as moon phases and eclipses.",
              ),
              simulations: ["licht-schatten"],
            },
            {
              code: "1.3",
              title: L("Elektrische Stromkreise", "Electric circuits"),
              summary: L(
                "Elektrische Ladungen und Reibungselektrizität, Strom als bewegte Ladung, Wärme-, Licht- und Magnetwirkung; einfache Schaltungen wie die Wechselschaltung werden geplant und aufgebaut.",
                "Electric charges and static electricity, current as moving charge, heating, lighting and magnetic effects; simple circuits such as a two-way switch are planned and built.",
              ),
              simulations: ["einfacher-stromkreis"],
            },
          ],
        },
      ],
    },
    {
      grade: 8,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/physik",
      units: [
        {
          code: "1",
          title: L("Elektrischer Strom", "Electric current"),
          summary: L(
            "Stromstärke, Spannung und Widerstand an einem Modell des Stromkreises; Kennlinien messen, mit R = U/I rechnen und Reihen- und Parallelschaltungen mit bis zu drei Widerständen untersuchen.",
            "Current, voltage and resistance using a model of the circuit; measuring characteristic curves, calculating with R = U/I and investigating series and parallel circuits with up to three resistors.",
          ),
          simulations: ["ohmsches-gesetz", "reihe-parallel"],
        },
        {
          code: "2",
          title: L("Optik", "Optics"),
          summary: L(
            "Reflexionsgesetz und Spiegelbild, Brechung, Bildentstehung an Sammellinsen (reell und virtuell), Auge und Fehlsichtigkeit sowie Totalreflexion mit Lichtleitern.",
            "Law of reflection and mirror images, refraction, image formation by converging lenses (real and virtual), the eye and vision defects, and total internal reflection with optical fibres.",
          ),
          simulations: ["reflexion", "brechung", "linsen"],
        },
        {
          code: "3",
          title: L("Mechanik", "Mechanics"),
          parts: [
            {
              code: "3.1",
              title: L(
                "Dynamik zweidimensionaler Bewegungen",
                "Dynamics of two-dimensional motion",
              ),
              summary: L(
                "Geschwindigkeit als Pfeil, Geschwindigkeitsänderung durch eine Kraft, F · Δt = m · Δv als Definition der Kraft; Beschleunigung im eindimensionalen Fall messen.",
                "Velocity as an arrow, change of velocity caused by a force, F · Δt = m · Δv as the definition of force; measuring acceleration in one dimension.",
              ),
              simulations: ["bewegungsdiagramme"],
            },
            {
              code: "3.2",
              title: L("Kräfte und ihre Wirkungen", "Forces and their effects"),
              summary: L(
                "Masse und Gewichtskraft, Kräfte addieren und an der schiefen Ebene zerlegen, Kräftegleichgewicht und Trägheitssatz sowie Dehnung von Federn mit Hooke’schem Bereich.",
                "Mass and weight, adding forces and resolving them on an inclined plane, equilibrium of forces and the law of inertia, and the stretching of springs with the Hooke region.",
              ),
              simulations: [
                "kraefteaddition",
                "schiefe-ebene",
                "hookesches-gesetz",
                "hebelgesetz",
              ],
            },
          ],
        },
        {
          code: "4",
          title: L(
            "Profilbereich am NTG (nur NTG)",
            "Profile area at the NTG (science and technology track only)",
          ),
          parts: [
            {
              code: "4.1",
              title: L(
                "Untersuchungen an Solarzellen und anderen Elektrizitätsquellen",
                "Investigating solar cells and other sources of electricity",
              ),
              summary: L(
                "Solarmodule in Reihe und parallel messen und äußere Einflüsse wie Neigung und Schatten untersuchen; weitere Quellen wie galvanische Elemente oder Netzgeräte erkunden.",
                "Measuring solar modules in series and parallel and investigating external influences such as tilt and shade; exploring other sources such as galvanic cells or power supplies.",
              ),
            },
            {
              code: "4.2",
              title: L(
                "Vertiefung prozessbezogener Kompetenzen anhand ausgewählter Inhalte",
                "Deepening process-related skills with selected content",
              ),
              summary: L(
                "Wahlthemen zum selbstständigen Experimentieren und Auswerten, etwa Lupe und optische Instrumente, Farbmischung oder Bewegungsanalysen im Sport.",
                "Optional topics for independent experimenting and evaluating, for example magnifying glasses and optical instruments, colour mixing or motion analysis in sport.",
              ),
              simulations: ["linsen"],
            },
          ],
        },
      ],
    },
    {
      grade: 9,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/physik",
      units: [
        {
          code: "1",
          title: L(
            "Energie als Erhaltungsgröße",
            "Energy as a conserved quantity",
          ),
          parts: [
            {
              code: "1.1",
              title: L("Mechanische Energie", "Mechanical energy"),
              summary: L(
                "Höhen-, Bewegungs- und Spannenergie ineinander umwandeln und mit dem Energieerhaltungssatz bilanzieren; Arbeit und Leistung unterscheiden und messen.",
                "Converting potential, kinetic and elastic energy and balancing them with the conservation of energy; distinguishing and measuring work and power.",
              ),
              simulations: ["energieerhaltung"],
            },
            {
              code: "1.2",
              title: L("Elektrische Energie", "Electrical energy"),
              summary: L(
                "Ladung als Vielfaches der Elementarladung, Spannung als Potentialdifferenz, elektrische Energie und Leistung in Schaltungen sowie der Wirkungsgrad von Geräten.",
                "Charge as a multiple of the elementary charge, voltage as a potential difference, electrical energy and power in circuits, and the efficiency of devices.",
              ),
            },
          ],
        },
        {
          code: "2",
          title: L("Atome", "Atoms"),
          summary: L(
            "Photonenmodell des Lichts, Farbe und Photonenenergie, Emissions- und Absorptionsspektren mit dem Energiestufenmodell sowie die Absorption in der Erdatmosphäre.",
            "Photon model of light, colour and photon energy, emission and absorption spectra explained by the energy-level model, and absorption in the Earth’s atmosphere.",
          ),
        },
        {
          code: "3",
          title: L("Wärmelehre", "Thermal physics"),
          parts: [
            {
              code: "3.1",
              title: L("Das Teilchenmodell", "The particle model"),
              summary: L(
                "Temperatur als mittlere Bewegungsenergie der Teilchen, innere Energie, Aggregatzustände sowie Druck, Volumen und Temperatur eines Gases.",
                "Temperature as the mean kinetic energy of particles, internal energy, states of matter, and the pressure, volume and temperature of a gas.",
              ),
              simulations: ["gasgesetze", "teilchenmodell"],
            },
            {
              code: "3.2",
              title: L(
                "Thermischer Energietransport und Einflüsse auf unser Klima",
                "Thermal energy transport and influences on our climate",
              ),
              summary: L(
                "Spezifische Wärmekapazität, Wärme als Prozessgröße, Wärmeleitung, Konvektion und Wärmestrahlung sowie Treibhauseffekt und Strahlungsgleichgewicht der Erde.",
                "Specific heat capacity, heat as a process quantity, conduction, convection and thermal radiation, and the greenhouse effect and the Earth’s radiation balance.",
              ),
            },
          ],
        },
        {
          code: "4",
          title: L(
            "Profilbereich am NTG (nur NTG)",
            "Profile area at the NTG (science and technology track only)",
          ),
          parts: [
            {
              code: "4.1",
              title: L("Klima", "Climate"),
              summary: L(
                "Weitere Aspekte des Klimasystems wie Meeresspiegelanstieg, Rückkopplungen und Kippelemente; alternative Erklärungen für die Erderwärmung physikalisch prüfen.",
                "Further aspects of the climate system such as sea-level rise, feedbacks and tipping points; checking alternative explanations of global warming with physics.",
              ),
            },
            {
              code: "4.2",
              title: L(
                "Vertiefung prozessbezogener Kompetenzen anhand ausgewählter weiterer Inhalte",
                "Deepening process-related skills with further selected content",
              ),
              summary: L(
                "Wahlthemen wie Energie im Körper, Wärmedämmung, Energieversorgung, Fahrzeugtechnik oder Druck und Auftrieb, selbstständig dokumentiert und präsentiert.",
                "Optional topics such as energy in the body, insulation, energy supply, vehicle technology or pressure and buoyancy, documented and presented independently.",
              ),
            },
          ],
        },
      ],
    },
    {
      grade: 10,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/physik",
      units: [
        {
          code: "1",
          title: L("Elektromagnetismus", "Electromagnetism"),
          summary: L(
            "Magnetfelder mit Feldlinien beschreiben, Kraft auf stromdurchflossene Leiter und Lorentzkraft, Elektromotor, Induktion, Generator und idealer Transformator.",
            "Describing magnetic fields with field lines, the force on current-carrying conductors and the Lorentz force, electric motors, induction, generators and the ideal transformer.",
          ),
          simulations: ["induktion", "lorentzkraft"],
        },
        {
          code: "2",
          title: L(
            "Impulserhaltung in der Mechanik",
            "Conservation of momentum in mechanics",
          ),
          summary: L(
            "Impuls als Erhaltungsgröße, Stöße mit Impuls- und Energieerhaltung berechnen und das Wechselwirkungsgesetz von Kräftepaaren im Gleichgewicht abgrenzen.",
            "Momentum as a conserved quantity, calculating collisions with conservation of momentum and energy, and distinguishing the law of interaction from forces in equilibrium.",
          ),
          simulations: ["stoesse"],
        },
        {
          code: "3",
          title: L(
            "Bewegungen und ihre Modellierung in der Physik",
            "Motion and its modelling in physics",
          ),
          summary: L(
            "Zeit-Ort- und Zeit-Geschwindigkeit-Diagramme, gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall sowie der waagrechte Wurf in Komponenten.",
            "Time–position and time–velocity graphs, uniform and uniformly accelerated motion, free fall and the horizontal projectile described in components.",
          ),
          simulations: ["bewegungsdiagramme", "freier-fall", "schiefer-wurf"],
        },
        {
          code: "4",
          title: L("Kernphysik", "Nuclear physics"),
          summary: L(
            "Alpha-, Beta- und Gammastrahlung, Aufbau des Kerns bis zu den Quarks, Masse-Energie-Äquivalenz, Halbwertszeit sowie Strahlenwirkung und Strahlenschutz.",
            "Alpha, beta and gamma radiation, the structure of the nucleus down to quarks, mass–energy equivalence, half-life, and biological effects of radiation and protection.",
          ),
          simulations: ["radioaktiver-zerfall"],
        },
        {
          code: "5",
          title: L(
            "Profilbereich am NTG (nur NTG)",
            "Profile area at the NTG (science and technology track only)",
          ),
          parts: [
            {
              code: "5.1",
              title: L(
                "Halbleiterbauelemente in Experimenten",
                "Semiconductor components in experiments",
              ),
              summary: L(
                "Kennlinie einer Diode aufnehmen, Transistor als Schalter und Verstärker einsetzen und einfache Halbleiterschaltungen mit Modellen erklären.",
                "Recording the characteristic curve of a diode, using a transistor as a switch and amplifier, and explaining simple semiconductor circuits with models.",
              ),
            },
            {
              code: "5.2",
              title: L(
                "Vertiefung prozessbezogener Kompetenzen anhand ausgewählter weiterer Inhalte",
                "Deepening process-related skills with further selected content",
              ),
              summary: L(
                "Wahlthemen wie Physik im Sport (optimaler Wurf, Billardstöße), Fliegen, Chaos, Anwendungen der Radioaktivität oder Elektrotechnik.",
                "Optional topics such as physics in sport (optimal throw, billiard collisions), flight, chaos, applications of radioactivity or electrical engineering.",
              ),
              simulations: ["schiefer-wurf", "stoesse"],
            },
          ],
        },
      ],
    },
    {
      grade: 11,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/physik",
      units: [
        {
          code: "1",
          title: L("Kreisbewegung", "Circular motion"),
          summary: L(
            "Größen der Kreisbewegung, Zentripetalkraft herleiten und experimentell prüfen, Kurvenfahrten im Straßenverkehr und Himmelskörper mit dem Gravitationsgesetz.",
            "Quantities of circular motion, deriving and testing the centripetal force, cornering in road traffic, and celestial bodies with the law of gravitation.",
          ),
          simulations: ["kreisbewegung", "planetenbahnen"],
        },
        {
          code: "2",
          title: L("Schwingungen und Wellen", "Oscillations and waves"),
          summary: L(
            "Harmonische Schwingungen am Feder- und Fadenpendel, mechanische Wellen, Beugung, Interferenz und stehende Wellen sowie Licht am Doppelspalt.",
            "Harmonic oscillations of spring and simple pendulums, mechanical waves, diffraction, interference and standing waves, and light at the double slit.",
          ),
          simulations: [
            "fadenpendel",
            "federpendel",
            "wellen-ausbreitung",
            "interferenz",
            "stehende-wellen",
            "doppelspalt",
          ],
        },
        {
          code: "3",
          title: L(
            "Eigenverantwortliche Arbeit an physikalischen Themen",
            "Independent work on physics topics",
          ),
          parts: [
            {
              code: "3.1",
              title: L("Astronomische Weltbilder", "Astronomical world views"),
              summary: L(
                "Vom geozentrischen zum heliozentrischen Weltbild mit den Kepler’schen Gesetzen und ein Blick auf das moderne Bild des Universums.",
                "From the geocentric to the heliocentric world view with Kepler’s laws, and a look at the modern picture of the universe.",
              ),
              simulations: ["planetenbahnen"],
            },
            {
              code: "3.2",
              title: L(
                "Einblick in die spezielle Relativitätstheorie",
                "Insight into special relativity",
              ),
              summary: L(
                "Einsteins Postulate, Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion sowie Wissenschaft im gesellschaftlichen Spannungsfeld.",
                "Einstein’s postulates, relativity of simultaneity, time dilation and length contraction, and science under social and political pressure.",
              ),
            },
            {
              code: "3.3",
              title: L("Energieversorgung", "Energy supply"),
              summary: L(
                "Umkehrbare und nicht umkehrbare Vorgänge, Energieentwertung und Wirkungsgrad sowie Fragen der heutigen und künftigen Energieversorgung.",
                "Reversible and irreversible processes, energy degradation and efficiency, and questions about today’s and future energy supply.",
              ),
            },
          ],
        },
        {
          code: "4",
          title: L(
            "Profilbereich am NTG (27 Std.) (nur NTG)",
            "Profile area at the NTG (27 h) (science and technology track only)",
          ),
          parts: [
            {
              code: "4.1",
              title: L(
                "Die Methode der kleinen Schritte",
                "The method of small steps",
              ),
              summary: L(
                "Bewegungen mit veränderlicher Kraft schrittweise am Computer berechnen, z. B. Fall mit Luftwiderstand und harmonische Schwingung, und mit Experimenten vergleichen.",
                "Calculating motion under changing forces step by step on a computer, e.g. falling with air resistance and harmonic oscillation, and comparing with experiments.",
              ),
            },
            {
              code: "4.2",
              title: L(
                "Photovoltaik in Anwendungen",
                "Photovoltaics in applications",
              ),
              summary: L(
                "U-I-Kennlinie einer Solarzelle und den Punkt maximaler Leistung bestimmen, Komponenten von Photovoltaikanlagen kennen und ihren Nutzen bewerten.",
                "Determining the U–I curve of a solar cell and its maximum power point, knowing the components of photovoltaic systems and assessing their benefit.",
              ),
            },
            {
              code: "4.3",
              title: L(
                "Außerunterrichtliche Aktivität",
                "Activity outside the classroom",
              ),
              summary: L(
                "Mindestens eine Aktivität außerhalb des Unterrichts, etwa Schülerlabor, Museum, Betriebsbesuch oder ein eigenes Forschungsprojekt.",
                "At least one activity outside lessons, such as a student lab, a museum, a company visit or an own research project.",
              ),
            },
            {
              code: "4.4",
              title: L(
                "Vertiefung prozessbezogener Kompetenzen anhand ausgewählter weiterer Inhalte",
                "Deepening process-related skills with further selected content",
              ),
              summary: L(
                "Wahlthemen wie Physik auf dem Jahrmarkt, Akustik und Resonanz, Licht in der Technik oder Computermodelle für Würfe mit Luftwiderstand und Planetenbahnen.",
                "Optional topics such as physics at the fair, acoustics and resonance, light in technology, or computer models of throws with air resistance and planetary orbits.",
              ),
              simulations: ["schiefer-wurf", "planetenbahnen", "resonanz"],
            },
          ],
        },
      ],
    },
    {
      grade: 12,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/physik/grundlegend",
      note: L(
        "Mehrere Lehrpläne: ohne Buchstabe = grundlegendes Anforderungsniveau; „B“ = Lehrplanalternative Biophysik; „E“ = erhöhtes Anforderungsniveau. Die Lehrplanalternative ersetzt den Standardlehrplan.",
        "Several syllabuses: no letter = basic level; “B” = biophysics alternative; “E” = advanced level. The syllabus alternative replaces the standard syllabus.",
      ),
      units: [
        {
          code: "1",
          title: L(
            "Statische elektrische und magnetische Felder",
            "Static electric and magnetic fields",
          ),
          summary: L(
            "Feldlinien und Feldstärke, Überlagerung von Feldern, Kondensator mit Lade- und Entladekurve, Potential sowie geladene Teilchen in elektrischen und magnetischen Feldern.",
            "Field lines and field strength, superposition of fields, the capacitor with charging and discharging curves, potential, and charged particles in electric and magnetic fields.",
          ),
          simulations: ["feldlinien", "kondensator", "lorentzkraft"],
        },
        {
          code: "2",
          title: L(
            "Elektromagnetische Induktion und Schwingungen",
            "Electromagnetic induction and oscillations",
          ),
          summary: L(
            "Induktionsgesetz und Wechselspannung, Selbstinduktion, technische Anwendungen sowie der elektromagnetische Schwingkreis im Vergleich zum Federpendel.",
            "Law of induction and alternating voltage, self-induction, technical applications, and the electromagnetic LC circuit compared with the spring pendulum.",
          ),
          simulations: ["induktion"],
        },
        {
          code: "3",
          title: L("Elektromagnetische Wellen", "Electromagnetic waves"),
          summary: L(
            "Wellen eines Dipols, Polarisation, Interferenz am Doppelspalt und Gitter, stehende Wellen, Wellenlängen von LED-Licht, Röntgenbremsstrahlung und das elektromagnetische Spektrum.",
            "Waves from a dipole, polarisation, interference at double slits and gratings, standing waves, wavelengths of LED light, X-ray bremsstrahlung and the electromagnetic spectrum.",
          ),
          simulations: ["doppelspalt", "interferenz", "stehende-wellen"],
        },
        {
          code: "B1",
          title: L("Das Auge (nur Biophysik)", "The eye (biophysics only)"),
          summary: L(
            "Linse-Schirm-Modell und Linsengleichung, Fehlsichtigkeit, Farbsehen sowie Beugung an Spalt und Pupille als Grenze des Auflösungsvermögens.",
            "Lens–screen model and lens equation, vision defects, colour vision, and diffraction at slits and the pupil as the limit of resolution.",
          ),
          simulations: ["doppelspalt"],
        },
        {
          code: "B2",
          title: L("Das Ohr (nur Biophysik)", "The ear (biophysics only)"),
          summary: L(
            "Interferenz von Schall und Frequenzspektren, Schalldruckpegel und Lautstärke, Richtungshören sowie Resonanz der Basilarmembran im Innenohr.",
            "Interference of sound and frequency spectra, sound pressure level and loudness, directional hearing, and resonance of the basilar membrane in the inner ear.",
          ),
          simulations: ["interferenz", "resonanz"],
        },
        {
          code: "B3",
          title: L(
            "Strahlenbiophysik und medizintechnische Anwendungen (nur Biophysik)",
            "Radiation biophysics and medical technology (biophysics only)",
          ),
          summary: L(
            "Elektrische Felder und Potential am Beispiel des EKG, Lorentzkraft, Fadenstrahlrohr und Zyklotron für die Strahlentherapie sowie Röntgenstrahlung.",
            "Electric fields and potential using the ECG as an example, the Lorentz force, the fine-beam tube and the cyclotron for radiotherapy, and X-rays.",
          ),
          simulations: ["feldlinien", "lorentzkraft"],
        },
        {
          code: "B4",
          title: L(
            "Neuronale Signalleitung (nur Biophysik)",
            "Neural signal transmission (biophysics only)",
          ),
          summary: L(
            "Ruhepotential, Ersatzschaltbild eines Axons mit Kondensator und Widerständen, passive und aktive Signalleitung sowie einfache Verschaltungen von Nervenzellen.",
            "Resting potential, an equivalent circuit of an axon with capacitor and resistors, passive and active signal transmission, and simple wiring of nerve cells.",
          ),
          simulations: ["kondensator"],
        },
        {
          code: "E1",
          title: L(
            "Statische elektrische und magnetische Felder (erhöhtes Niveau)",
            "Static electric and magnetic fields (advanced level)",
          ),
          summary: L(
            "Wie im grundlegenden Niveau, zusätzlich Coulombkraft, radialsymmetrisches Feld, Dielektrikum und Differentialgleichungen für Lade- und Entladevorgänge.",
            "As at the basic level, plus the Coulomb force, radial fields, dielectrics and differential equations for charging and discharging.",
          ),
          simulations: ["feldlinien", "kondensator", "lorentzkraft"],
        },
        {
          code: "E2",
          title: L(
            "Elektromagnetische Induktion und Schwingungen (erhöhtes Niveau)",
            "Electromagnetic induction and oscillations (advanced level)",
          ),
          summary: L(
            "Induktion, Schaltvorgänge an Spulen, Schwingkreis mit Differentialgleichung, gedämpfte und erzwungene Schwingungen mit Resonanz sowie Wechselstromkreise mit Zeigern.",
            "Induction, switching processes with coils, the LC circuit with its differential equation, damped and forced oscillations with resonance, and AC circuits with phasors.",
          ),
          simulations: ["induktion", "resonanz", "federpendel"],
        },
        {
          code: "E3",
          title: L(
            "Elektromagnetische Wellen (erhöhtes Niveau)",
            "Electromagnetic waves (advanced level)",
          ),
          summary: L(
            "Dipol und Maxwellgleichungen, Polarisation, Interferenz an Doppelspalt, Mehrfachspalt, Gitter und Einfachspalt, Bragg-Reflexion sowie Röntgenstrahlung.",
            "Dipoles and Maxwell’s equations, polarisation, interference at double slits, multiple slits, gratings and single slits, Bragg reflection and X-rays.",
          ),
          simulations: ["doppelspalt", "interferenz", "stehende-wellen"],
        },
        {
          code: "E4",
          title: L(
            "Experimentelles Arbeiten (nur erhöhtes Niveau)",
            "Experimental work (advanced level only)",
          ),
          summary: L(
            "Pflichtexperimente mit Fehlerbetrachtung, etwa Kondensator laden und entladen, Bahnen geladener Teilchen, Schwingungen, Wechselstromkreise und Wellenlängen mit dem Gitter.",
            "Compulsory experiments including uncertainty analysis, e.g. charging and discharging a capacitor, paths of charged particles, oscillations, AC circuits and wavelengths with a grating.",
          ),
          simulations: [
            "kondensator",
            "lorentzkraft",
            "resonanz",
            "doppelspalt",
          ],
        },
      ],
    },
    {
      grade: 13,
      sourceUrl:
        "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/physik/grundlegend",
      note: L(
        "Mehrere Lehrpläne: ohne Buchstabe = grundlegendes Anforderungsniveau; „A“ = Lehrplanalternative Astrophysik; „E“ = erhöhtes Anforderungsniveau. Die Lehrplanalternative ersetzt den Standardlehrplan.",
        "Several syllabuses: no letter = basic level; “A” = astrophysics alternative; “E” = advanced level. The syllabus alternative replaces the standard syllabus.",
      ),
      units: [
        {
          code: "1",
          title: L(
            "Grundideen der Quantenphysik",
            "Basic ideas of quantum physics",
          ),
          parts: [
            {
              code: "1.1",
              title: L(
                "Eigenschaften von Quantenobjekten",
                "Properties of quantum objects",
              ),
              summary: L(
                "Elektronenbeugung und de-Broglie-Wellenlänge, Doppelspaltversuch mit Elektronen und Photonen in der Simulation sowie Energie und Impuls von Photonen.",
                "Electron diffraction and de Broglie wavelength, the double-slit experiment with electrons and photons in simulation, and energy and momentum of photons.",
              ),
              simulations: ["elektronenbeugung", "doppelspalt"],
            },
            {
              code: "1.2",
              title: L(
                "Einblick in das Weltbild der Quantenphysik",
                "Insight into the world view of quantum physics",
              ),
              summary: L(
                "Wellenfunktion und Nachweiswahrscheinlichkeit, Superposition, Komplementarität und der quantenphysikalische Messprozess.",
                "Wave function and detection probability, superposition, complementarity and the quantum measurement process.",
              ),
            },
          ],
        },
        {
          code: "2",
          title: L(
            "Ein Atommodell der Quantenphysik",
            "An atomic model of quantum physics",
          ),
          summary: L(
            "Potentialtopf mit diskreten Energieniveaus, Orbitale und Energiewerte des Wasserstoffatoms, Emission und Absorption von Licht sowie der Franck-Hertz-Versuch.",
            "The potential well with discrete energy levels, orbitals and energy values of the hydrogen atom, emission and absorption of light, and the Franck–Hertz experiment.",
          ),
          simulations: ["linienspektren"],
        },
        {
          code: "3",
          title: L(
            "Strukturuntersuchungen zum Aufbau der Materie",
            "Investigating the structure of matter",
          ),
          summary: L(
            "Methoden wie Streu- und Kollisionsexperimente sowie Grundaussagen des Standardmodells, selbstständig recherchiert und präsentiert.",
            "Methods such as scattering and collision experiments and the basic statements of the Standard Model, researched and presented independently.",
          ),
        },
        {
          code: "4",
          title: L("Kernphysik", "Nuclear physics"),
          parts: [
            {
              code: "4.1",
              title: L(
                "Ein einfaches Kernmodell der Quantenphysik",
                "A simple nuclear model of quantum physics",
              ),
              summary: L(
                "Bindungsenergie je Nukleon, Potentialtopfmodell des Kerns, Entstehung der Strahlungsarten und Energiebilanzen bei Zerfällen und Kernreaktionen.",
                "Binding energy per nucleon, the potential-well model of the nucleus, the origin of the types of radiation, and energy balances in decays and nuclear reactions.",
              ),
            },
            {
              code: "4.2",
              title: L(
                "Radioaktivität und Kernenergietechnik",
                "Radioactivity and nuclear technology",
              ),
              summary: L(
                "Geiger-Müller-Zähler, Zerfallsgesetz und Halbwertszeit, C14-Datierung, Strahlenschutz sowie Kernspaltung und Reaktor.",
                "Geiger–Müller counter, decay law and half-life, carbon-14 dating, radiation protection, and nuclear fission and reactors.",
              ),
              simulations: ["radioaktiver-zerfall"],
            },
          ],
        },
        {
          code: "A1",
          title: L(
            "Orientierung am Himmel (nur Astrophysik)",
            "Orientation in the sky (astrophysics only)",
          ),
          summary: L(
            "Sternbilder und Objekte am Nachthimmel mit Sternkarte oder Software finden, Sichtbarkeit beurteilen und Schleifenbahnen der Planeten erklären.",
            "Finding constellations and objects in the night sky with a star chart or software, judging visibility and explaining the retrograde loops of planets.",
          ),
        },
        {
          code: "A2",
          title: L(
            "Das Sonnensystem (nur Astrophysik)",
            "The solar system (astrophysics only)",
          ),
          summary: L(
            "Astronomische Einheit, Gravitationsgesetz und Ellipsenbahnen zur Massenbestimmung, Einteilung der Himmelskörper sowie Satelliten und zweite kosmische Geschwindigkeit.",
            "The astronomical unit, the law of gravitation and elliptical orbits for determining masses, classifying celestial bodies, and satellites and escape velocity.",
          ),
          simulations: ["planetenbahnen"],
        },
        {
          code: "A3",
          title: L(
            "Die Sonne (nur Astrophysik)",
            "The Sun (astrophysics only)",
          ),
          summary: L(
            "Zustandsgrößen der Sonne, Kernfusion und Energietransport, Sonnenflecken, Sonnenspektrum mit Absorptionslinien und Strahlungsgesetze für Temperaturabschätzungen.",
            "State quantities of the Sun, nuclear fusion and energy transport, sunspots, the solar spectrum with absorption lines, and radiation laws for estimating temperatures.",
          ),
          simulations: ["linienspektren"],
        },
        {
          code: "A4",
          title: L("Sterne (nur Astrophysik)", "Stars (astrophysics only)"),
          summary: L(
            "Parallaxe, Helligkeit und Leuchtkraft, Spektralklassen, Hertzsprung-Russell-Diagramm und Sternentwicklung, Doppelsterne, Gravitationswellen und Exoplaneten.",
            "Parallax, brightness and luminosity, spectral classes, the Hertzsprung–Russell diagram and stellar evolution, binary stars, gravitational waves and exoplanets.",
          ),
        },
        {
          code: "A5",
          title: L(
            "Großstrukturen im Weltall (nur Astrophysik)",
            "Large-scale structures in the universe (astrophysics only)",
          ),
          summary: L(
            "Aufbau und Masse der Milchstraße, Dunkle Materie, Entfernung von Galaxien, Hubble-Beziehung und Urknallmodell.",
            "Structure and mass of the Milky Way, dark matter, distances of galaxies, the Hubble relation and the Big Bang model.",
          ),
        },
        {
          code: "E1",
          title: L(
            "Grundideen der Quantenphysik (erhöhtes Niveau)",
            "Basic ideas of quantum physics (advanced level)",
          ),
          parts: [
            {
              code: "E1.1",
              title: L(
                "Eigenschaften von Quantenobjekten",
                "Properties of quantum objects",
              ),
              summary: L(
                "Elektronenbeugung mit Bragg-Reflexion und de-Broglie-Beziehung, Doppelspalt und Mach-Zehnder-Interferometer mit einzelnen Quanten sowie Photoeffekt mit Gegenfeldmethode.",
                "Electron diffraction with Bragg reflection and the de Broglie relation, double slit and Mach–Zehnder interferometer with single quanta, and the photoelectric effect with the retarding-field method.",
              ),
              simulations: ["elektronenbeugung", "doppelspalt", "photoeffekt"],
            },
            {
              code: "E1.2",
              title: L(
                "Einblick in das Weltbild der Quantenphysik",
                "Insight into the world view of quantum physics",
              ),
              summary: L(
                "Wellenfunktion, Unbestimmtheitsrelation, Messprozess, Quantenradierer, Nicht-Lokalität und Dekohärenz sowie Quantentechnik und ihr Missbrauch in Texten.",
                "Wave function, uncertainty principle, measurement, the quantum eraser, non-locality and decoherence, and quantum technology and its misuse in texts.",
              ),
            },
          ],
        },
        {
          code: "E2",
          title: L(
            "Ein Atommodell der Quantenphysik (erhöhtes Niveau)",
            "An atomic model of quantum physics (advanced level)",
          ),
          summary: L(
            "Schrödinger-Gleichung im Potentialtopf, Orbitale und Energiewerte von Wasserstoff und wasserstoffähnlichen Systemen, Pauli-Prinzip, Röntgenspektren und Franck-Hertz-Versuch.",
            "The Schrödinger equation in a potential well, orbitals and energy values of hydrogen and hydrogen-like systems, the Pauli principle, X-ray spectra and the Franck–Hertz experiment.",
          ),
          simulations: ["linienspektren"],
        },
        {
          code: "E3",
          title: L(
            "Strukturuntersuchungen zum Aufbau der Materie (erhöhtes Niveau)",
            "Investigating the structure of matter (advanced level)",
          ),
          summary: L(
            "Methoden der Strukturuntersuchung und Standardmodell, zusätzlich Röntgen-Strukturanalyse und Synchrotronstrahlung.",
            "Methods of structural investigation and the Standard Model, plus X-ray structure analysis and synchrotron radiation.",
          ),
        },
        {
          code: "E4",
          title: L(
            "Kernphysik (erhöhtes Niveau)",
            "Nuclear physics (advanced level)",
          ),
          parts: [
            {
              code: "E4.1",
              title: L("Ein einfaches Kernmodell", "A simple nuclear model"),
              summary: L(
                "Bindungsenergie, Potentialtopfmodell, Entstehung der Strahlungsarten, Energie- und Impulsbilanzen, Zerfallsreihen und Nuklidkarte.",
                "Binding energy, potential-well model, origin of the types of radiation, energy and momentum balances, decay chains and the chart of nuclides.",
              ),
            },
            {
              code: "E4.2",
              title: L(
                "Radioaktivität und Kernenergietechnik",
                "Radioactivity and nuclear technology",
              ),
              summary: L(
                "Zerfallsgesetz aus einer Differentialgleichung, Halbwertszeit und mittlere Lebensdauer, Altersbestimmung, Strahlenschutz und Kernreaktor.",
                "Decay law from a differential equation, half-life and mean lifetime, dating, radiation protection and nuclear reactors.",
              ),
              simulations: ["radioaktiver-zerfall"],
            },
          ],
        },
        {
          code: "E5",
          title: L(
            "Experimentelles Arbeiten (nur erhöhtes Niveau)",
            "Experimental work (advanced level only)",
          ),
          summary: L(
            "Pflichtexperimente mit Fehlerbetrachtung, etwa Polarisation, Elektronenbeugung, Gegenfeldmethode zum Photoeffekt, Spektrometerbau und Absorption radioaktiver Strahlung.",
            "Compulsory experiments with uncertainty analysis, e.g. polarisation, electron diffraction, the retarding-field method for the photoelectric effect, building a spectrometer and absorption of radiation.",
          ),
          simulations: ["elektronenbeugung", "photoeffekt", "linienspektren"],
        },
      ],
    },
  ],
};
