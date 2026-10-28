import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Landesamt für Schule und Bildung (LaSuB). Der Lehrplan nennt im Impressum
 * „https://www.lasub.smk.sachsen.de/“; ein Link zur einzelnen PDF-Datei steht nicht darin.
 */
const SOURCE = 'https://www.lasub.smk.sachsen.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/sachsen-gymnasium-physik.md, Teil E).
const KLASSE = L(
  'Der Lehrplan ordnet die Lernbereiche genau dieser Klassenstufe zu (Sachsen, Gymnasium bis Klasse 12; Physik ab Klasse 6). Die Nummern der Lernbereiche stammen aus dem Lehrplan; Wahlbereiche sind wahlweise zu unterrichten und hier mit W1–W3 bezeichnet.',
  'The curriculum assigns these units to exactly this grade (Saxony, Gymnasium up to grade 12; physics from grade 6). The unit numbers are the curriculum’s; optional areas (“Wahlbereiche”) are labelled W1–W3 here.',
);

const OBERSTUFE = (n: number) =>
  L(
    `Jahrgangsstufe ${n} mit Grundkurs (GK) und Leistungskurs (LK). Die Präfixe GK- und LK- sind von uns, die Nummern danach stammen aus dem Lehrplan; W kennzeichnet Wahlbereiche.`,
    `Grade ${n} with basic course (GK) and advanced course (LK). The GK/LK prefixes are ours; the numbers after them are the curriculum’s; W marks optional areas.`,
  );

/** Klassenstufe 6. */
const K6: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Licht und seine Eigenschaften', 'Light and its properties'),
    summary: L(
      'Geradlinige Ausbreitung, Schatten, Finsternisse und Mondphasen, Reflexion und Brechung sowie Bilder an Sammellinsen und in einfachen optischen Geräten.',
      'Straight-line propagation, shadows, eclipses and lunar phases, reflection and refraction, and images formed by converging lenses and simple optical instruments.',
    ),
    simulations: ['licht-schatten', 'reflexion', 'brechung', 'linsen'],
  },
  {
    code: '2',
    title: L('Eigenschaften und Bewegungen von Körpern', 'Properties and motion of bodies'),
    summary: L(
      'Körper aus Teilchen, Volumen, Masse und Dichte messen, Bewegungen einteilen und die Geschwindigkeit gleichförmiger Bewegungen bestimmen.',
      'Bodies made of particles, measuring volume, mass and density, classifying motion and finding the speed of uniform motion.',
    ),
    simulations: ['teilchenmodell'],
  },
  {
    code: '3',
    title: L('Temperatur und Zustand von Körpern', 'Temperature and state of bodies'),
    summary: L(
      'Temperatur messen und mit der Teilchenbewegung deuten, Wärmeausdehnung, Thermometer und die Übergänge zwischen den Aggregatzuständen.',
      'Measuring temperature and interpreting it with particle motion, thermal expansion, thermometers and changes of state.',
    ),
    simulations: ['teilchenmodell'],
  },
  {
    code: '4',
    title: L('Elektrische Stromkreise', 'Electric circuits'),
    summary: L(
      'Wirkungen und Gefahren des Stroms, Leiter und Isolatoren, Stromkreise nach Schaltplan aufbauen, verzweigt und unverzweigt.',
      'Effects and dangers of electric current, conductors and insulators, building circuits from diagrams, branched and unbranched.',
    ),
    simulations: ['einfacher-stromkreis'],
  },
  {
    code: 'W1',
    title: L('Sehen und Fotografieren (Wahlbereich)', 'Seeing and photography (optional)'),
    summary: L('Auge und Fotoapparat vergleichen, eine Lochkamera bauen.', 'Comparing the eye and the camera, building a pinhole camera.'),
    simulations: ['linsen'],
  },
  {
    code: 'W2',
    title: L('Wärmedämmung (Wahlbereich)', 'Thermal insulation (optional)'),
    summary: L('Wärmeverluste am Haus finden und Dämmung untersuchen.', 'Finding heat losses in a house and investigating insulation.'),
  },
  {
    code: 'W3',
    title: L('Farben (Wahlbereich)', 'Colours (optional)'),
    summary: L('Zerlegung weißen Lichts, additive und subtraktive Farbmischung.', 'Splitting white light, additive and subtractive colour mixing.'),
  },
];

/** Klassenstufe 7. */
const K7: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Kräfte', 'Forces'),
    summary: L(
      'Kraft als Pfeil, Gewichtskraft, Hooke’sches Gesetz, Hebelgesetz, Reibung sowie magnetische und elektrostatische Kräfte mit Feldlinienbildern.',
      'Force as an arrow, weight, Hooke’s law, the law of the lever, friction, and magnetic and electrostatic forces with field-line patterns.',
    ),
    simulations: ['hookesches-gesetz', 'hebelgesetz'],
  },
  {
    code: '2',
    title: L('Stromstärke und Spannung in Stromkreisen', 'Current and voltage in circuits'),
    summary: L(
      'Stromstärke und Spannung messen, Elektronenleitung, Gesetze für Strom und Spannung in verzweigten und unverzweigten Stromkreisen.',
      'Measuring current and voltage, conduction by electrons, rules for current and voltage in branched and unbranched circuits.',
    ),
    simulations: ['einfacher-stromkreis', 'reihe-parallel'],
  },
  {
    code: '3',
    title: L('Energiewandler', 'Energy converters'),
    summary: L(
      'Energieformen und Energieumwandlung, potentielle Energie, Energieerhaltung in der Mechanik, Wirkungsgrad und Leistung.',
      'Forms of energy and energy conversion, potential energy, conservation of energy in mechanics, efficiency and power.',
    ),
    simulations: ['energieerhaltung'],
  },
  {
    code: 'W1',
    title: L('Kraftwandler – früher und heute (Wahlbereich)', 'Force converters – then and now (optional)'),
    summary: L('Hebel, Seilmaschinen, Fahrrad und die Goldene Regel der Mechanik.', 'Levers, pulley systems, the bicycle and the golden rule of mechanics.'),
    simulations: ['hebelgesetz'],
  },
  {
    code: 'W2',
    title: L('Elektrische Schaltungen (Wahlbereich)', 'Electric circuits in practice (optional)'),
    summary: L('Schaltungen aus dem Alltag erkennen und selbst eine Anwendung bauen.', 'Recognising everyday circuits and building an application.'),
    simulations: ['einfacher-stromkreis'],
  },
  {
    code: 'W3',
    title: L('Vom Fliegen (Wahlbereich)', 'Flight (optional)'),
    summary: L('Geschichte des Fliegens und dynamischer Auftrieb am Tragflügel.', 'History of flight and dynamic lift on a wing.'),
  },
];

/** Klassenstufe 8. */
const K8: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Mechanik der Flüssigkeiten und Gase', 'Mechanics of liquids and gases'),
    summary: L('Druck, Schweredruck, Auftrieb nach Archimedes und Luftdruck.', 'Pressure, hydrostatic pressure, buoyancy according to Archimedes and air pressure.'),
  },
  {
    code: '2',
    title: L('Thermische Energie und Klimaphysik', 'Thermal energy and climate physics'),
    summary: L(
      'Thermische Energie im Teilchenbild, Wärme und Aggregatzustandsänderungen, Wärmeübertragung sowie Strahlungshaushalt der Erde und Treibhauseffekt.',
      'Thermal energy in the particle model, heat and changes of state, heat transfer, and the Earth’s radiation budget and the greenhouse effect.',
    ),
    simulations: ['teilchenmodell'],
  },
  {
    code: '3',
    title: L('Eigenschaften elektrischer Bauelemente', 'Properties of electrical components'),
    summary: L(
      'Widerstand und Widerstandsgesetz, Kennlinien verschiedener Bauelemente, ohmsches Gesetz sowie elektrische Energie und Leistung.',
      'Resistance and the resistance law, characteristic curves of components, Ohm’s law, and electrical energy and power.',
    ),
    simulations: ['ohmsches-gesetz'],
  },
  {
    code: '4',
    title: L('Selbstständiges Experimentieren', 'Independent experimenting'),
    summary: L(
      'Widerstände in Reihe und parallel, Potentiometer und Messunsicherheiten, auch mit digitaler Messwerterfassung.',
      'Resistors in series and parallel, potentiometers and measurement uncertainty, also with digital data logging.',
    ),
    simulations: ['reihe-parallel'],
  },
  {
    code: 'W1',
    title: L('Vom Ballonfahren (Wahlbereich)', 'Ballooning (optional)'),
    summary: L('Statischer Auftrieb in Gasen, Heißluftballon und Luftschiff.', 'Static buoyancy in gases, hot-air balloons and airships.'),
  },
  {
    code: 'W2',
    title: L('Kühlschrank und Wärmepumpe (Wahlbereich)', 'Refrigerator and heat pump (optional)'),
    summary: L('Wärmeübertragung gegen das Temperaturgefälle mit Energieaufwand.', 'Transferring heat against the temperature gradient using energy.'),
  },
  {
    code: 'W3',
    title: L('Elektrisches Messen nichtelektrischer Größen (Wahlbereich)', 'Electrical measurement of non-electrical quantities (optional)'),
    summary: L('Sensoren wandeln Größen wie Temperatur oder Licht in Spannungen um.', 'Sensors convert quantities such as temperature or light into voltages.'),
  },
];

/** Klassenstufe 9. */
const K9: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Grundlagen der Elektronik', 'Basics of electronics'),
    summary: L('Halbleiterbauelemente wie Diode und Solarzelle, Leitungsmechanismen in Halbleitern und einfache Schaltungen.', 'Semiconductor components such as diodes and solar cells, conduction in semiconductors and simple circuits.'),
  },
  {
    code: '2',
    title: L('Energieversorgung', 'Energy supply'),
    summary: L(
      'Kraftwerke, elektromagnetische Induktion, Generator und Transformator, Energieübertragung mit Hochspannung sowie Atomkern, Radioaktivität und Kernreaktor.',
      'Power stations, electromagnetic induction, generator and transformer, high-voltage transmission, and the atomic nucleus, radioactivity and nuclear reactors.',
    ),
    simulations: ['induktion', 'radioaktiver-zerfall'],
  },
  {
    code: '3',
    title: L('Bewegungsgesetze', 'Laws of motion'),
    summary: L(
      'Bezugssystem, Durchschnitts- und Augenblicksgeschwindigkeit, gleichförmige und gleichmäßig beschleunigte Bewegung und der freie Fall.',
      'Frames of reference, average and instantaneous velocity, uniform and uniformly accelerated motion, and free fall.',
    ),
    simulations: ['bewegungsdiagramme', 'freier-fall'],
  },
  {
    code: '4',
    title: L('Physikalisches Praktikum', 'Physics practical'),
    summary: L(
      'Aufgaben aus Mechanik und Elektrik experimentell lösen, Beschleunigung und Weg im v(t)-Diagramm deuten.',
      'Solving mechanics and electricity problems experimentally, interpreting acceleration and distance in velocity–time graphs.',
    ),
    simulations: ['bewegungsdiagramme'],
  },
  {
    code: 'W1',
    title: L('Natürliche Radioaktivität (Wahlbereich)', 'Natural radioactivity (optional)'),
    summary: L('Zählrohr, Durchdringungsvermögen und Reichweite der Strahlung, Nulleffekt und Anwendungen.', 'Geiger counter, penetration and range of radiation, background radiation and applications.'),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: 'W2',
    title: L('Energie von Wind und Sonne (Wahlbereich)', 'Wind and solar energy (optional)'),
    summary: L('Windkraftanlagen, Solarthermie und Fotovoltaik.', 'Wind turbines, solar thermal energy and photovoltaics.'),
  },
  {
    code: 'W3',
    title: L('Bewegungen auf gekrümmten Bahnen (Wahlbereich)', 'Motion along curved paths (optional)'),
    summary: L('Gleichförmige Kreisbewegung, Radialkraft und Satellitenbahnen.', 'Uniform circular motion, centripetal force and satellite orbits.'),
  },
];

/** Klassenstufe 10. */
const K10: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Newton’sche Gesetze und deren Anwendung', 'Newton’s laws and their application'),
    summary: L(
      'F = m · a, Trägheits- und Wechselwirkungsgesetz, Kräfte überlagern, geneigte Ebene sowie Bremsweg und Gefahren im Straßenverkehr.',
      'F = m · a, the laws of inertia and interaction, superposition of forces, the inclined plane, and braking distance and road safety.',
    ),
    simulations: ['kraefteaddition', 'schiefe-ebene'],
  },
  {
    code: '2',
    title: L('Mechanische Schwingungen und Wellen', 'Mechanical oscillations and waves'),
    summary: L(
      'Schwingungen mit Amplitude, Periode und Dämpfung, Faden- und Federpendel, Resonanz, Wellen mit c = λ · f, Akustik und Interferenz zweier Kreiswellen.',
      'Oscillations with amplitude, period and damping, simple and spring pendulums, resonance, waves with c = λ · f, acoustics and interference of two circular waves.',
    ),
    simulations: ['fadenpendel', 'federpendel', 'resonanz', 'wellen-ausbreitung', 'interferenz'],
  },
  {
    code: '3',
    title: L('Kosmos, Erde und Mensch', 'Cosmos, Earth and humankind'),
    summary: L(
      'Sonne und Planeten, Orientierung am Himmel, vom geozentrischen zum heliozentrischen Weltbild mit den Kepler’schen Gesetzen und dem Gravitationsgesetz sowie Methoden der Astronomie.',
      'The Sun and planets, finding one’s way in the sky, from the geocentric to the heliocentric world view with Kepler’s laws and the law of gravitation, and methods of astronomy.',
    ),
    simulations: ['planetenbahnen'],
  },
  {
    code: '4',
    title: L('Licht als Strahl und Welle', 'Light as ray and wave'),
    summary: L(
      'Brechungsgesetz und Totalreflexion, Farbzerlegung, Interferenz am Doppelspalt und Gitter zur Bestimmung der Wellenlänge und das elektromagnetische Spektrum.',
      'The law of refraction and total internal reflection, dispersion, interference at double slits and gratings to measure wavelength, and the electromagnetic spectrum.',
    ),
    simulations: ['brechung', 'doppelspalt'],
  },
  {
    code: '5',
    title: L('Physikalisches Praktikum', 'Physics practical'),
    summary: L('Neues experimentell erarbeiten, etwa die Linsengleichung, und Experimentieranordnungen entwickeln.', 'Developing new knowledge experimentally, for example the lens equation, and designing experiments.'),
    simulations: ['linsen'],
  },
  {
    code: 'W1',
    title: L('Fernrohre (Wahlbereich)', 'Telescopes (optional)'),
    summary: L('Linsen- und Spiegelfernrohre, Vergrößerung und Auflösungsvermögen.', 'Refracting and reflecting telescopes, magnification and resolving power.'),
    simulations: ['linsen'],
  },
  {
    code: 'W2',
    title: L('Kommunikation mit elektronischen Medien (Wahlbereich)', 'Communication with electronic media (optional)'),
    summary: L('Informationsübertragung mit Hertz’schen Wellen, Modulation und Demodulation.', 'Transmitting information with radio waves, modulation and demodulation.'),
  },
  {
    code: 'W3',
    title: L('Fernsehbildtechnik (Wahlbereich)', 'Television picture technology (optional)'),
    summary: L('Aufbau des Fernsehbilds und Funktionsweise von Bildschirmen.', 'How the television picture is built and how screens work.'),
  },
];

/** Jahrgangsstufe 11, Grundkurs und Leistungskurs. */
const J11: CurriculumUnit[] = [
  {
    code: 'GK-1',
    title: L('Mechanische Grundlagen (Grundkurs)', 'Foundations of mechanics (basic course)'),
    summary: L(
      'Energieerhaltung, Reibung und Bewegung auf der geneigten Ebene, Superposition von Kräften, F = m · a und die gleichförmige Kreisbewegung.',
      'Conservation of energy, friction and motion on an inclined plane, superposition of forces, F = m · a and uniform circular motion.',
    ),
    simulations: ['energieerhaltung', 'schiefe-ebene', 'kraefteaddition', 'kreisbewegung'],
  },
  {
    code: 'GK-2',
    title: L('Elektrisches Feld (Grundkurs)', 'Electric field (basic course)'),
    summary: L(
      'Feldbegriff, Feldlinienbilder, Feldstärke, homogenes und radiales Feld, Kondensator mit Kapazität, Auf- und Entladen.',
      'The concept of a field, field-line patterns, field strength, uniform and radial fields, capacitors with capacitance, charging and discharging.',
    ),
    simulations: ['feldlinien', 'kondensator'],
  },
  {
    code: 'GK-3',
    title: L('Magnetisches Feld (Grundkurs)', 'Magnetic field (basic course)'),
    summary: L('Feldlinienbilder, Flussdichte, Feld um Leiter und in Spulen.', 'Field-line patterns, flux density, the field around wires and inside coils.'),
  },
  {
    code: 'GK-4',
    title: L('Geladene Teilchen bzw. Körper in statischen Feldern (Grundkurs)', 'Charged particles and bodies in static fields (basic course)'),
    summary: L('Lorentzkraft und Kreisbahnen, Millikan-Versuch, Beschleunigung und Ablenkung im elektrischen Feld.', 'The Lorentz force and circular paths, the Millikan experiment, acceleration and deflection in an electric field.'),
    simulations: ['lorentzkraft'],
  },
  {
    code: 'GK-5',
    title: L('Elektromagnetische Felder (Grundkurs)', 'Electromagnetic fields (basic course)'),
    summary: L('Induktionsgesetz, magnetischer Fluss und Lenz’sches Gesetz.', 'The law of induction, magnetic flux and Lenz’s law.'),
    simulations: ['induktion'],
  },
  {
    code: 'GK-W1',
    title: L('Leitungsvorgänge in Halbleitern (Wahlbereich Grundkurs)', 'Conduction in semiconductors (optional, basic course)'),
    summary: L('Bändermodell, pn-Übergang, Diode und Transistor.', 'The band model, pn junction, diode and transistor.'),
  },
  {
    code: 'GK-W2',
    title: L('Messen und Modellieren (Wahlbereich Grundkurs)', 'Measuring and modelling (optional, basic course)'),
    summary: L('Messreihen mit Videoanalyse und Messschnittstellen erfassen und mit Modellen vergleichen.', 'Recording measurements with video analysis and data loggers and comparing them with models.'),
  },
  {
    code: 'GK-W3',
    title: L('Relativität von Zeit und Raum (Wahlbereich Grundkurs)', 'Relativity of time and space (optional, basic course)'),
    summary: L('Postulate, Zeitdilatation und Längenkontraktion.', 'Postulates, time dilation and length contraction.'),
  },
  {
    code: 'LK-1',
    title: L('Erhaltungssätze und ihre Anwendungen (Leistungskurs)', 'Conservation laws and their applications (advanced course)'),
    summary: L('Mechanische Energie und Arbeit, Energieerhaltung, Impulserhaltung bei elastischen und unelastischen Stößen.', 'Mechanical energy and work, conservation of energy, conservation of momentum in elastic and inelastic collisions.'),
    simulations: ['energieerhaltung', 'stoesse'],
  },
  {
    code: 'LK-2',
    title: L('Kräfte (Leistungskurs)', 'Forces (advanced course)'),
    summary: L('Reibung, Zerlegung von Kräften an der geneigten Ebene, Grundgesetz der Mechanik und Kreisbewegung.', 'Friction, resolving forces on an inclined plane, Newton’s second law and circular motion.'),
    simulations: ['schiefe-ebene', 'kraefteaddition', 'kreisbewegung'],
  },
  {
    code: 'LK-3',
    title: L('Kinematik und Dynamik – Praktikum (Leistungskurs)', 'Kinematics and dynamics – practical (advanced course)'),
    summary: L('Bewegungen messen und klassifizieren, Diagramme, waagerechter Wurf und Messunsicherheiten.', 'Measuring and classifying motion, graphs, horizontal projection and measurement uncertainty.'),
    simulations: ['bewegungsdiagramme', 'schiefer-wurf', 'freier-fall'],
  },
  {
    code: 'LK-4',
    title: L('Modellbildung und Simulation (Leistungskurs)', 'Modelling and simulation (advanced course)'),
    summary: L('Bewegungen numerisch modellieren, Parameter variieren und mit dem Experiment vergleichen.', 'Modelling motion numerically, varying parameters and comparing with experiment.'),
  },
  {
    code: 'LK-5',
    title: L('Elektrisches Feld (Leistungskurs)', 'Electric field (advanced course)'),
    summary: L(
      'Coulomb’sches Gesetz, Feldlinien und Feldstärke, Kondensator mit Dielektrikum, Auf- und Entladekurven sowie Potential und Spannung.',
      'Coulomb’s law, field lines and field strength, capacitors with dielectrics, charging and discharging curves, and potential and voltage.',
    ),
    simulations: ['feldlinien', 'kondensator'],
  },
  {
    code: 'LK-6',
    title: L('Magnetisches Feld (Leistungskurs)', 'Magnetic field (advanced course)'),
    summary: L('Feldlinienbilder, Flussdichte, Feld um Leiter und in Spulen, Materie im Magnetfeld.', 'Field-line patterns, flux density, the field around wires and inside coils, matter in a magnetic field.'),
  },
  {
    code: 'LK-7',
    title: L('Geladene Teilchen bzw. Körper in statischen Feldern (Leistungskurs)', 'Charged particles and bodies in static fields (advanced course)'),
    summary: L(
      'Lorentzkraft, spezifische Ladung des Elektrons, Hall-Effekt, Wien-Filter, Beschleuniger und Massenspektrometer.',
      'The Lorentz force, the specific charge of the electron, the Hall effect, the Wien filter, accelerators and mass spectrometers.',
    ),
    simulations: ['lorentzkraft'],
  },
  {
    code: 'LK-8',
    title: L('Elektromagnetische Felder (Leistungskurs)', 'Electromagnetic fields (advanced course)'),
    summary: L('Induktionsgesetz, Transformator, Lenz’sches Gesetz, Selbstinduktion und Energie des Magnetfelds.', 'The law of induction, transformers, Lenz’s law, self-induction and magnetic field energy.'),
    simulations: ['induktion'],
  },
  {
    code: 'LK-W1',
    title: L('Einblick in die Relativitätstheorie (Wahlbereich Leistungskurs)', 'Introduction to relativity (optional, advanced course)'),
    summary: L('Postulate, Michelson-Experiment, Zeitdilatation und E = m · c².', 'Postulates, the Michelson experiment, time dilation and E = m · c².'),
  },
  {
    code: 'LK-W2',
    title: L('Leitungsvorgänge in Halbleitern (Wahlbereich Leistungskurs)', 'Conduction in semiconductors (optional, advanced course)'),
    summary: L('Bändermodell, pn-Übergang, Diode und Transistor.', 'The band model, pn junction, diode and transistor.'),
  },
];

/** Jahrgangsstufe 12, Grundkurs und Leistungskurs. */
const J12: CurriculumUnit[] = [
  {
    code: 'GK-1',
    title: L('Mechanische und elektromagnetische Schwingungen und Wellen (Grundkurs)', 'Mechanical and electromagnetic oscillations and waves (basic course)'),
    summary: L(
      'Harmonische Schwingungen am Federpendel, Schwingkreis, Wellen mit Reflexion, Brechung, Beugung und Interferenz, stehende Wellen und Licht als Welle am Doppelspalt und Gitter.',
      'Harmonic oscillation of a spring pendulum, the LC circuit, waves with reflection, refraction, diffraction and interference, standing waves, and light as a wave at double slits and gratings.',
    ),
    simulations: ['federpendel', 'wellen-ausbreitung', 'interferenz', 'stehende-wellen', 'doppelspalt'],
  },
  {
    code: 'GK-2',
    title: L('Praktikum Optik und Schwingungen (Grundkurs)', 'Practical: optics and oscillations (basic course)'),
    summary: L('Experimentelle Aufgaben zu Schwingungen und Optik und Analyse von Messunsicherheiten.', 'Experimental tasks on oscillations and optics and analysis of measurement uncertainty.'),
  },
  {
    code: 'GK-3',
    title: L('Quantenobjekte (Grundkurs)', 'Quantum objects (basic course)'),
    summary: L(
      'Photoeffekt und Photonenmodell, De-Broglie-Wellenlänge und Beugung von Elektronen sowie stochastische Deutung und Komplementarität.',
      'The photoelectric effect and photon model, de Broglie wavelength and electron diffraction, stochastic interpretation and complementarity.',
    ),
    simulations: ['photoeffekt', 'elektronenbeugung'],
  },
  {
    code: 'GK-4',
    title: L('Atomvorstellungen (Grundkurs)', 'Models of the atom (basic course)'),
    summary: L('Bohr’sches Modell, Energieniveaus und diskrete Spektren, Orbitale und Laser.', 'The Bohr model, energy levels and discrete spectra, orbitals and lasers.'),
    simulations: ['linienspektren'],
  },
  {
    code: 'GK-W1',
    title: L('Anwendungen der Physik (Wahlbereich Grundkurs)', 'Applications of physics (optional, basic course)'),
    summary: L('Doppler-Effekt beim Schall, Ultraschall in der Medizin und Röntgenstrahlung.', 'The Doppler effect for sound, ultrasound in medicine and X-rays.'),
    simulations: ['doppler-effekt'],
  },
  {
    code: 'GK-W2',
    title: L('Radioaktivität (Wahlbereich Grundkurs)', 'Radioactivity (optional, basic course)'),
    summary: L('Strahlungsarten, Nuklidkarte, Zerfallsgesetz, Halbwertszeit und Aktivität.', 'Types of radiation, the chart of nuclides, the decay law, half-life and activity.'),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: 'LK-1',
    title: L('Mechanische und elektromagnetische Schwingungen (Leistungskurs)', 'Mechanical and electromagnetic oscillations (advanced course)'),
    summary: L(
      'Feder- und Fadenpendel mit linearem Kraftgesetz, gedämpfte Schwingungen, Resonanz und Schwingkreis im Vergleich.',
      'Spring and simple pendulums with the linear force law, damped oscillations, resonance and comparison with the LC circuit.',
    ),
    simulations: ['federpendel', 'fadenpendel', 'resonanz'],
  },
  {
    code: 'LK-2',
    title: L('Mechanische und elektromagnetische Wellen (Leistungskurs)', 'Mechanical and electromagnetic waves (advanced course)'),
    summary: L(
      'Fortschreitende und stehende Wellen, Reflexion, Brechung, Beugung und Interferenz, Hertz’sche Wellen und Licht am Doppelspalt, Gitter und Einzelspalt.',
      'Travelling and standing waves, reflection, refraction, diffraction and interference, radio waves, and light at double slits, gratings and single slits.',
    ),
    simulations: ['wellen-ausbreitung', 'interferenz', 'stehende-wellen', 'doppelspalt'],
  },
  {
    code: 'LK-3',
    title: L('Praktikum Optik und Schwingungen (Leistungskurs)', 'Practical: optics and oscillations (advanced course)'),
    summary: L('Experimentelle Aufgaben und quantitative Analyse von Messunsicherheiten.', 'Experimental tasks and quantitative analysis of measurement uncertainty.'),
  },
  {
    code: 'LK-4',
    title: L('Quantenobjekte (Leistungskurs)', 'Quantum objects (advanced course)'),
    summary: L(
      'Photoeffekt, Photonenimpuls, Elektronenbeugung, Wellenfunktion, Unschärferelation und Delayed-Choice-Experiment.',
      'The photoelectric effect, photon momentum, electron diffraction, the wave function, the uncertainty principle and the delayed-choice experiment.',
    ),
    simulations: ['photoeffekt', 'elektronenbeugung'],
  },
  {
    code: 'LK-5',
    title: L('Atomvorstellungen (Leistungskurs)', 'Models of the atom (advanced course)'),
    summary: L(
      'Atommodelle, Energieniveaus und Spektren, Potentialtopf, Lumineszenz, Laser und Röntgenspektrum.',
      'Atomic models, energy levels and spectra, the potential well, luminescence, lasers and the X-ray spectrum.',
    ),
    simulations: ['linienspektren'],
  },
  {
    code: 'LK-6',
    title: L('Thermodynamik (Leistungskurs)', 'Thermodynamics (advanced course)'),
    summary: L(
      'Allgemeine Gasgleichung, isochore, isobare und isotherme Zustandsänderungen, Hauptsätze, Carnot- und Stirling-Prozess und Wirkungsgrad.',
      'The ideal gas law, isochoric, isobaric and isothermal changes, the laws of thermodynamics, Carnot and Stirling cycles and efficiency.',
    ),
    simulations: ['gasgesetze'],
  },
  {
    code: 'LK-W1',
    title: L('Eigenschaften der Atomkerne (Wahlbereich Leistungskurs)', 'Properties of atomic nuclei (optional, advanced course)'),
    summary: L('Strahlungsarten, Kernumwandlungen, Zerfallsgesetz und Wechselwirkung mit Materie.', 'Types of radiation, nuclear transformations, the decay law and interaction with matter.'),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: 'LK-W2',
    title: L('Deterministisches Chaos (Wahlbereich Leistungskurs)', 'Deterministic chaos (optional, advanced course)'),
    summary: L('Nichtlineare Systeme, Attraktoren und begrenzte Vorhersagbarkeit.', 'Non-linear systems, attractors and limited predictability.'),
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium in Sachsen (Abitur nach Klasse 12) nach dem „Lehrplan
 * Gymnasium Physik“ des Sächsischen Staatsministeriums für Kultus, Fassung
 * 2004/2007/2009/2011/2019/2022/2025/2026 (in Kraft für Klasse 6–8 und 10 sowie die
 * Jahrgangsstufen 11 und 12 ab 01.08.2025, für Klasse 9 ab 01.08.2026). Ein Dokument
 * für Sekundarstufe I und gymnasiale Oberstufe.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/sachsen-gymnasium-physik.{json,md}.
 * Klassenstufen 6–10 und Jahrgangsstufen 11 und 12 wie im Lehrplan. Codes W…, GK-…,
 * LK-… sind selbst vergeben.
 *
 * Überschriften entsprechen dem Lehrplan; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const sachsenGymnasiumPhysik: StateCurriculum = {
  id: 'sachsen-gymnasium-physik',
  subject: 'physik',
  slug: L('sachsen-gymnasium', 'saxony-gymnasium'),
  state: L('Sachsen', 'Saxony'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Lehrplan',
  grades: [
    grade(6, KLASSE, K6),
    grade(7, KLASSE, K7),
    grade(8, KLASSE, K8),
    grade(9, KLASSE, K9),
    grade(10, KLASSE, K10),
    grade(11, OBERSTUFE(11), J11),
    grade(12, OBERSTUFE(12), J12),
  ],
};
