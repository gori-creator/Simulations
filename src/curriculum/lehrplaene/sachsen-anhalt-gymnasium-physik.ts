import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Landesinstitut für Schulqualität und Lehrerbildung Sachsen-Anhalt (LISA). Der Fachlehrplan
 * nennt auf jeder Seite „Quelle: Landesportal Sachsen-Anhalt (http://www.lisa.sachsen-anhalt.de)“;
 * ein Link zur einzelnen Datei steht im Dokument nicht. Verlinkt ist dieselbe Adresse mit https.
 */
const SOURCE = 'https://www.lisa.sachsen-anhalt.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/sachsen-anhalt-gymnasium-physik.md, Teil E).
const OWN_NUMBERS = L(
  'Lernbereiche sind die Kompetenzschwerpunkte des Fachlehrplans; er nummeriert sie nicht, die Nummern sind von uns vergeben.',
  'Units are the curriculum’s focal points; it does not number them, the numbers are our own.',
);

const SJ_6 = L(
  `Schuljahrgang 6: Physik beginnt in Sachsen-Anhalt in Klasse 6. ${OWN_NUMBERS.de}`,
  `Grade 6: physics starts in grade 6 in Saxony-Anhalt. ${OWN_NUMBERS.en}`,
);

const SJ_7_8 = L(
  `Schuljahrgänge 7/8: Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam; die Lernbereiche stehen deshalb bei 7 und 8 gleich, und beide werden als eine Stufe gezeigt. ${OWN_NUMBERS.de}`,
  `Grades 7/8: the curriculum describes both grades together, so the units are the same for grades 7 and 8, and both are shown as one stage. ${OWN_NUMBERS.en}`,
);

const SJ_9 = L(`Schuljahrgang 9. ${OWN_NUMBERS.de}`, `Grade 9. ${OWN_NUMBERS.en}`);

const SJ_10 = L(
  `Schuljahrgang 10 ist in Sachsen-Anhalt die Einführungsphase der gymnasialen Oberstufe (Abitur nach Klasse 12). ${OWN_NUMBERS.de}`,
  `In Saxony-Anhalt, grade 10 is the introductory phase of upper secondary (Abitur after grade 12). ${OWN_NUMBERS.en}`,
);

const QPHASE = L(
  'Qualifikationsphase (Schuljahrgänge 11/12): Der Fachlehrplan beschreibt beide Jahrgänge gemeinsam, gegliedert in Themenbereiche mit Kompetenzschwerpunkten, getrennt nach grundlegendem (gA) und erhöhtem Anforderungsniveau (eA) sowie dem zweistündigen Wahlpflichtfach (WPF). Die Lernbereiche stehen deshalb bei 11 und 12 gleich, und beide werden als eine Stufe gezeigt. Das dreistündige Wahlpflichtfach entspricht dem grundlegenden Niveau. Die Nummern sind von uns vergeben.',
  'Qualification phase (grades 11/12): the curriculum describes both grades together, organised into subject areas with focal points and split into the basic level (gA), the higher level (eA) and the two-hour elective (WPF). The units are therefore the same for grades 11 and 12, and both are shown as one stage. The three-hour elective matches the basic level. The numbers are our own.',
);

/** Schuljahrgang 6 (Kap. 3.2). */
const SJ_6_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Die Naturwissenschaft Physik', 'Physics as a natural science'),
    summary: L(
      'Teilgebiete der Physik kennenlernen, Länge, Zeit, Volumen, Masse und Temperatur als Größen mit Einheiten, Längen und Zeiten messen.',
      'Getting to know the branches of physics, length, time, volume, mass and temperature as quantities with units, measuring lengths and times.',
    ),
  },
  {
    code: '2',
    title: L('Strahlenoptik', 'Ray optics'),
    summary: L(
      'Licht als Strahl: Schatten und Finsternisse, Reflexionsgesetz am Spiegel, Brechung und Totalreflexion qualitativ, Bilder an Sammellinse und Lochkamera.',
      'Light as rays: shadows and eclipses, the law of reflection at a mirror, refraction and total internal reflection qualitatively, images formed by a converging lens and a pinhole camera.',
    ),
    simulations: ['licht-schatten', 'reflexion', 'brechung', 'linsen'],
  },
  {
    code: '3',
    title: L('Eigenschaften und Bewegung von Körpern und Teilchen', 'Properties and motion of bodies and particles'),
    summary: L(
      'Masse, Volumen und Dichte, Aggregatzustände im Teilchenmodell, Brown’sche Bewegung; gleichförmige und ungleichförmige Bewegung mit Geschwindigkeit und s(t)-Diagramm.',
      'Mass, volume and density, states of matter in the particle model, Brownian motion; uniform and non-uniform motion with speed and distance-time graphs.',
    ),
    simulations: ['teilchenmodell'],
  },
  {
    code: '4',
    title: L('Temperatur und Wärme', 'Temperature and heat'),
    summary: L(
      'Temperatur messen, Ausdehnung beim Erwärmen mit dem Teilchenmodell erklären, Wärmeleitung, -strömung und -strahlung, Anomalie des Wassers.',
      'Measuring temperature, explaining thermal expansion with the particle model, conduction, convection and radiation, the anomaly of water.',
    ),
    simulations: ['teilchenmodell'],
  },
  {
    code: '5',
    title: L('Magnetismus', 'Magnetism'),
    summary: L(
      'Dauermagnete mit Nord- und Südpol, magnetische Stoffe, Magnetfeld im Feldlinienmodell, Erdmagnetfeld und Kompass.',
      'Permanent magnets with north and south poles, magnetic materials, the magnetic field in the field-line model, Earth’s magnetic field and the compass.',
    ),
  },
];

/** Schuljahrgänge 7/8 (Kap. 3.3). */
const SJ_7_8_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Kräfte und ihre Wirkungen', 'Forces and their effects'),
    summary: L(
      'Gewichtskraft und Masse, Kräfte als Pfeile addieren und zerlegen, Hooke’sches Gesetz, Hebelgesetz und Goldene Regel, mechanische Arbeit, Energieerhaltung und Wirkungsgrad.',
      'Weight and mass, adding and resolving forces as arrows, Hooke’s law, the law of the lever and the golden rule of mechanics, mechanical work, conservation of energy and efficiency.',
    ),
    simulations: ['hookesches-gesetz', 'hebelgesetz', 'kraefteaddition', 'energieerhaltung'],
  },
  {
    code: '2',
    title: L('Elektrischer Strom und seine Wirkungen', 'Electric current and its effects'),
    summary: L(
      'Ladung und elektrisches Feld, einfache Stromkreise aufbauen, Stromstärke und Spannung messen, Wärme-, Licht- und magnetische Wirkung des Stroms.',
      'Charge and electric field, building simple circuits, measuring current and voltage, heating, lighting and magnetic effects of current.',
    ),
    simulations: ['einfacher-stromkreis'],
  },
  {
    code: '3',
    title: L('Wärme und Aggregatzustände', 'Heat and states of matter'),
    summary: L(
      'Zustandsänderungen im Teilchenmodell, spezifische Wärmekapazität, Wärmeaustausch und Mischungsrechnung, Sonnenkollektor und Treibhaus.',
      'Changes of state in the particle model, specific heat capacity, heat exchange and mixing calculations, solar collectors and greenhouses.',
    ),
    simulations: ['teilchenmodell'],
  },
  {
    code: '4',
    title: L('Druck und Auftrieb', 'Pressure and buoyancy'),
    summary: L(
      'Druck bei festen Körpern, in Flüssigkeiten und Gasen, Auftrieb nach Archimedes, Schwimmen, Schweben und Sinken, dynamischer Auftrieb.',
      'Pressure in solids, liquids and gases, Archimedes’ principle, floating, hovering and sinking, dynamic lift.',
    ),
  },
  {
    code: '5',
    title: L('Verhalten von Gasen und technische Anwendungen', 'Behaviour of gases and technical applications'),
    summary: L(
      'Druck, Volumen und Temperatur eines Gases bei konstant gehaltener Größe, Volumenarbeit, erster Hauptsatz; Verbrennungsmotor, Kühlschrank oder Wärmepumpe.',
      'Pressure, volume and temperature of a gas with one quantity held constant, work done by a gas, the first law of thermodynamics; combustion engines, refrigerators or heat pumps.',
    ),
    simulations: ['gasgesetze'],
  },
  {
    code: '6',
    title: L('Stromkreise und Elektromagnetismus', 'Circuits and electromagnetism'),
    summary: L(
      'Ohm’sches Gesetz und Widerstand, Reihen- und Parallelschaltung, elektrische Arbeit und Leistung, Elektromagnet und Gleichstrommotor.',
      'Ohm’s law and resistance, series and parallel circuits, electrical work and power, electromagnets and the DC motor.',
    ),
    simulations: ['ohmsches-gesetz', 'reihe-parallel'],
  },
];

/** Schuljahrgang 9 (Kap. 3.4). */
const SJ_9_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Elektromagnetische Induktion und Leitungsvorgänge', 'Electromagnetic induction and conduction'),
    summary: L(
      'Induktion durch Bewegung oder veränderliches Magnetfeld, Lenz’sches Gesetz, Generator und Transformator; Leitung in Metallen und Halbleitern mit Diode, LED und Solarzelle.',
      'Induction by motion or a changing magnetic field, Lenz’s law, generator and transformer; conduction in metals and semiconductors with diodes, LEDs and solar cells.',
    ),
    simulations: ['induktion'],
  },
  {
    code: '2',
    title: L('Mechanik der Punktmasse', 'Mechanics of a point mass'),
    summary: L(
      'Newton’sche Axiome, Kräftezerlegung an der geneigten Ebene, gleichmäßig beschleunigte Bewegung mit Diagrammen und freiem Fall, Kreisbewegung, Energie, Leistung und Reibung.',
      'Newton’s laws, resolving forces on an inclined plane, uniformly accelerated motion with graphs and free fall, circular motion, energy, power and friction.',
    ),
    simulations: ['bewegungsdiagramme', 'freier-fall', 'kraefteaddition', 'schiefe-ebene', 'kreisbewegung', 'energieerhaltung'],
  },
];

/** Schuljahrgang 10, Einführungsphase (Kap. 3.5). */
const SJ_10_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Geometrische Optik', 'Geometrical optics'),
    summary: L(
      'Lichtgeschwindigkeit, Reflexion, Brechungsgesetz quantitativ, Totalreflexion und Lichtleiter, Abbildungsgleichung an Sammellinsen und Fernrohr.',
      'Speed of light, reflection, the law of refraction quantitatively, total internal reflection and optical fibres, the lens equation for converging lenses and the telescope.',
    ),
    simulations: ['brechung', 'linsen'],
  },
  {
    code: '2',
    title: L('Radioaktivität und Kernenergie', 'Radioactivity and nuclear energy'),
    summary: L(
      'Aufbau des Atomkerns, Strahlungsarten, Aktivität, Halbwertszeit und Zerfallsgesetz, Zerfall als Zufallsprozess, Strahlenschutz, Kernspaltung oder Kernfusion.',
      'Structure of the nucleus, types of radiation, activity, half-life and the decay law, decay as a random process, radiation protection, nuclear fission or fusion.',
    ),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: '3',
    title: L('Gravitation', 'Gravitation'),
    summary: L(
      'Gravitationsfeld und Gravitationsgesetz, Kepler’sche Gesetze, Bahnen von Satelliten und Planeten, erste kosmische Geschwindigkeit.',
      'Gravitational field and the law of gravitation, Kepler’s laws, orbits of satellites and planets, the first cosmic velocity.',
    ),
    simulations: ['planetenbahnen'],
  },
  {
    code: '4',
    title: L('Klimaphysik', 'Climate physics'),
    summary: L(
      'Elektromagnetisches Spektrum, Strahlungshaushalt der Erde, Albedo, Stefan-Boltzmann-Gesetz, natürlicher und menschengemachter Treibhauseffekt.',
      'The electromagnetic spectrum, Earth’s radiation budget, albedo, the Stefan–Boltzmann law, the natural and the man-made greenhouse effect.',
    ),
  },
  {
    code: '5',
    title: L('Experimentalpraktikum', 'Experimental practical'),
    summary: L(
      'Experimente selbst planen, durchführen und auswerten, mit Blick auf Messabweichungen und das Verallgemeinern zu Gesetzen.',
      'Planning, carrying out and evaluating experiments independently, with attention to measurement errors and generalising to laws.',
    ),
  },
];

/** Schuljahrgänge 11/12, Qualifikationsphase (Kap. 3.6.1–3.6.3). */
const QPHASE_UNITS: CurriculumUnit[] = [
  {
    code: 'gA-1',
    title: L('Schwingungen und Wellen (grundlegendes Anforderungsniveau)', 'Oscillations and waves (basic level)'),
    summary: L(
      'Mechanik als Grundlage, dazu mechanische Schwingungen und Wellen und das Licht als Welle.',
      'Mechanics as a foundation, plus mechanical oscillations and waves and light as a wave.',
    ),
    parts: [
      {
        code: 'gA-1.1',
        title: L('Grundlagenkurs Mechanik', 'Foundation course in mechanics'),
        summary: L(
          'Bewegungen mit Anfangsbedingungen und ihre Überlagerung bei Würfen, Kreisbewegung, Energieerhaltung, Impuls und Impulserhaltung.',
          'Motion with initial conditions and its superposition in projectile motion, circular motion, conservation of energy, momentum and its conservation.',
        ),
        simulations: ['bewegungsdiagramme', 'freier-fall', 'schiefer-wurf', 'kreisbewegung', 'energieerhaltung', 'stoesse'],
      },
      {
        code: 'gA-1.2',
        title: L('Mechanische Schwingungen und Wellen', 'Mechanical oscillations and waves'),
        summary: L(
          'Kenngrößen harmonischer Schwingungen am Federschwinger, erzwungene Schwingungen und Resonanz; Ausbreitung, Interferenz und stehende Wellen.',
          'Parameters of harmonic oscillations on a spring oscillator, forced oscillations and resonance; propagation, interference and standing waves.',
        ),
        simulations: ['federpendel', 'fadenpendel', 'resonanz', 'wellen-ausbreitung', 'interferenz', 'stehende-wellen'],
      },
      {
        code: 'gA-1.3',
        title: L('Welleneigenschaften des Lichtes', 'Wave properties of light'),
        summary: L(
          'Licht als elektromagnetische Welle, Interferenz an Doppelspalt und Gitter, Wellenlänge bestimmen, Farben, Dispersion und Polarisation.',
          'Light as an electromagnetic wave, interference at a double slit and a grating, determining wavelength, colours, dispersion and polarisation.',
        ),
        simulations: ['doppelspalt'],
      },
    ],
  },
  {
    code: 'gA-2',
    title: L('Elektrodynamik (grundlegendes Anforderungsniveau)', 'Electrodynamics (basic level)'),
    summary: L(
      'Elektrisches und magnetisches Feld und elektromagnetische Induktion.',
      'Electric and magnetic fields and electromagnetic induction.',
    ),
    parts: [
      {
        code: 'gA-2.1',
        title: L('Elektrisches Feld', 'Electric field'),
        summary: L(
          'Feldlinienbilder und Feldstärke, Plattenkondensator mit Kapazität und Energie, Auf- und Entladen, Bewegung geladener Teilchen im Feld.',
          'Field-line patterns and field strength, the parallel-plate capacitor with capacitance and energy, charging and discharging, motion of charged particles in the field.',
        ),
        simulations: ['feldlinien', 'kondensator'],
      },
      {
        code: 'gA-2.2',
        title: L('Magnetisches Feld', 'Magnetic field'),
        summary: L(
          'Magnetfelder von Magnet, Leiter und Spule, magnetische Flussdichte, Lorentzkraft und Kreisbahnen geladener Teilchen.',
          'Magnetic fields of magnets, conductors and coils, magnetic flux density, the Lorentz force and circular paths of charged particles.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'gA-2.3',
        title: L('Elektromagnetische Induktion', 'Electromagnetic induction'),
        summary: L(
          'Induktionsspannung und magnetischer Fluss, Induktionsgesetz und Lenz’sche Regel, Transformator, Energie im Schwingkreis qualitativ.',
          'Induced voltage and magnetic flux, the law of induction and Lenz’s rule, the transformer, energy in an LC circuit qualitatively.',
        ),
        simulations: ['induktion'],
      },
    ],
  },
  {
    code: 'gA-3',
    title: L('Quantenphysik (grundlegendes Anforderungsniveau)', 'Quantum physics (basic level)'),
    summary: L(
      'Quantenobjekte wie Photon und Elektron und das quantenphysikalische Atommodell.',
      'Quantum objects such as photons and electrons and the quantum model of the atom.',
    ),
    parts: [
      {
        code: 'gA-3.1',
        title: L('Eigenschaften von Quantenobjekten', 'Properties of quantum objects'),
        summary: L(
          'Photoeffekt und Photonen, Planck’sches Wirkungsquantum, Elektronen als Welle nach de Broglie, Wesenszüge der Quantenphysik am Doppelspalt.',
          'The photoelectric effect and photons, Planck’s constant, electrons as waves after de Broglie, key features of quantum physics at the double slit.',
        ),
        simulations: ['photoeffekt', 'elektronenbeugung'],
      },
      {
        code: 'gA-3.2',
        title: L('Quantenphysikalisches Atommodell', 'Quantum model of the atom'),
        summary: L(
          'Energiestufen des Wasserstoffatoms, Orbitale, Emission und Absorption und die Entstehung von Linienspektren.',
          'Energy levels of the hydrogen atom, orbitals, emission and absorption and how line spectra arise.',
        ),
        simulations: ['linienspektren'],
      },
    ],
  },
  {
    code: 'gA-4',
    title: L('Praktika (grundlegendes Anforderungsniveau)', 'Practicals (basic level)'),
    summary: L(
      'Experimentieren und Aufgabenlösen als eigene Kompetenzschwerpunkte.',
      'Experimenting and problem solving as focal points in their own right.',
    ),
    parts: [
      {
        code: 'gA-4.1',
        title: L('Experimentalpraktikum', 'Experimental practical'),
        summary: L(
          'Eigene Experimente planen und auswerten, Messunsicherheiten abschätzen.',
          'Planning and evaluating experiments independently, estimating measurement uncertainties.',
        ),
      },
      {
        code: 'gA-4.2',
        title: L('Aufgabenpraktikum', 'Problem-solving practical'),
        summary: L(
          'Strategien zum Lösen physikalischer Aufgaben üben: Bilanzen, Analogien, Vereinfachen und passende Modelle wählen.',
          'Practising strategies for physics problems: balances, analogies, simplifying and choosing suitable models.',
        ),
      },
    ],
  },
  {
    code: 'eA-1',
    title: L('Schwingungen und Wellen (erhöhtes Anforderungsniveau)', 'Oscillations and waves (higher level)'),
    summary: L(
      'Schwingungen, Wellen und Licht vertieft, dazu ein Aufbaukurs Mechanik mit Stößen.',
      'Oscillations, waves and light in more depth, plus an advanced course in mechanics with collisions.',
    ),
    parts: [
      {
        code: 'eA-1.1',
        title: L('Mechanische Schwingungen', 'Mechanical oscillations'),
        summary: L(
          'Harmonischer Oszillator mit linearem Kraftgesetz, Faden- und Federpendel, gedämpfte Schwingungen, Eigenfrequenz, erzwungene Schwingungen und Resonanzkurve.',
          'The harmonic oscillator with a linear restoring force, simple pendulum and spring oscillator, damped oscillations, natural frequency, forced oscillations and the resonance curve.',
        ),
        simulations: ['fadenpendel', 'federpendel', 'resonanz'],
      },
      {
        code: 'eA-1.2',
        title: L('Mechanische Wellen', 'Mechanical waves'),
        summary: L(
          'Harmonische Wellen mathematisch beschreiben, Huygens’sches Prinzip, Interferenz, Polarisation, stehende Wellen und Schall.',
          'Describing harmonic waves mathematically, Huygens’ principle, interference, polarisation, standing waves and sound.',
        ),
        simulations: ['wellen-ausbreitung', 'interferenz', 'stehende-wellen'],
      },
      {
        code: 'eA-1.3',
        title: L('Welleneigenschaften des Lichtes', 'Wave properties of light'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich Interferometer, Röntgenstrahlung und Spektralanalyse.',
          'As at the basic level, plus interferometers, X-rays and spectral analysis.',
        ),
        simulations: ['doppelspalt'],
      },
      {
        code: 'eA-1.4',
        title: L('Aufbaukurs Mechanik', 'Advanced course in mechanics'),
        summary: L(
          'Kräfte an der geneigten Ebene mit Reibung, Bewegungsgesetze mit Infinitesimalrechnung, Würfe, Energie- und Impulsbilanzen bei elastischen und unelastischen Stößen.',
          'Forces on an inclined plane with friction, laws of motion using calculus, projectile motion, energy and momentum balances in elastic and inelastic collisions.',
        ),
        simulations: ['bewegungsdiagramme', 'freier-fall', 'kraefteaddition', 'schiefe-ebene', 'schiefer-wurf', 'energieerhaltung', 'stoesse'],
      },
    ],
  },
  {
    code: 'eA-2',
    title: L('Elektrodynamik (erhöhtes Anforderungsniveau)', 'Electrodynamics (higher level)'),
    summary: L(
      'Felder und Induktion vertieft, dazu Wechselstrom und elektromagnetische Schwingungen.',
      'Fields and induction in more depth, plus alternating current and electromagnetic oscillations.',
    ),
    parts: [
      {
        code: 'eA-2.1',
        title: L('Elektrisches Feld', 'Electric field'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich Coulomb’sches Gesetz, Potenzial, radiales Feld, Auf- und Entladen quantitativ und Millikan-Versuch.',
          'As at the basic level, plus Coulomb’s law, potential, the radial field, charging and discharging quantitatively and Millikan’s experiment.',
        ),
        simulations: ['feldlinien', 'kondensator'],
      },
      {
        code: 'eA-2.2',
        title: L('Magnetisches Feld', 'Magnetic field'),
        summary: L(
          'Lorentzkraft quantitativ, Hall-Effekt, spezifische Ladung des Elektrons, Flussdichte einer Spule und Massenspektrograph.',
          'The Lorentz force quantitatively, the Hall effect, the specific charge of the electron, flux density of a coil and the mass spectrograph.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'eA-2.3',
        title: L('Elektromagnetische Induktion', 'Electromagnetic induction'),
        summary: L(
          'Induktionsgesetz in differenzieller Form, Wirbelströme, Generator und belasteter Transformator, Selbstinduktion und Induktivität.',
          'The law of induction in differential form, eddy currents, generator and loaded transformer, self-induction and inductance.',
        ),
        simulations: ['induktion'],
      },
      {
        code: 'eA-2.4',
        title: L('Wechselstromwiderstände und elektromagnetische Schwingungen', 'AC resistance and electromagnetic oscillations'),
        summary: L(
          'Effektivwerte, induktiver und kapazitiver Widerstand mit Zeigerdiagramm, Schwingkreis und Thomson’sche Gleichung.',
          'RMS values, inductive and capacitive reactance with phasor diagrams, the LC circuit and Thomson’s equation.',
        ),
      },
    ],
  },
  {
    code: 'eA-3',
    title: L('Ausgewählte Gebiete der nichtklassischen Physik (erhöhtes Anforderungsniveau)', 'Selected topics in non-classical physics (higher level)'),
    summary: L(
      'Spezielle Relativitätstheorie, Quantenobjekte und quantenphysikalisches Atommodell.',
      'Special relativity, quantum objects and the quantum model of the atom.',
    ),
    parts: [
      {
        code: 'eA-3.1',
        title: L('Spezielle Relativitätstheorie', 'Special relativity'),
        summary: L(
          'Einstein’sche Postulate, Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion, relativistische Masse und Energie.',
          'Einstein’s postulates, relativity of simultaneity, time dilation and length contraction, relativistic mass and energy.',
        ),
      },
      {
        code: 'eA-3.2',
        title: L('Eigenschaften von Quantenobjekten', 'Properties of quantum objects'),
        summary: L(
          'Wie im grundlegenden Niveau, zusätzlich Photonenimpuls, Elektronenbeugungsröhre, Compton-Effekt, Unbestimmtheitsrelation und Wellenfunktion.',
          'As at the basic level, plus photon momentum, the electron diffraction tube, the Compton effect, the uncertainty principle and the wave function.',
        ),
        simulations: ['photoeffekt', 'elektronenbeugung'],
      },
      {
        code: 'eA-3.3',
        title: L('Quantenphysikalisches Atommodell', 'Quantum model of the atom'),
        summary: L(
          'Potenzialtopf, Energiestufen und Orbitale des Wasserstoffatoms, Franck-Hertz-Versuch, Linien- und Röntgenspektren.',
          'The potential well, energy levels and orbitals of the hydrogen atom, the Franck–Hertz experiment, line spectra and X-ray spectra.',
        ),
        simulations: ['linienspektren'],
      },
    ],
  },
  {
    code: 'eA-4',
    title: L('Praktika (erhöhtes Anforderungsniveau)', 'Practicals (higher level)'),
    summary: L(
      'Experimentieren und Aufgabenlösen als eigene Kompetenzschwerpunkte.',
      'Experimenting and problem solving as focal points in their own right.',
    ),
    parts: [
      {
        code: 'eA-4.1',
        title: L('Experimentalpraktikum', 'Experimental practical'),
        summary: L(
          'Eigene Experimente planen und auswerten, Messunsicherheiten abschätzen.',
          'Planning and evaluating experiments independently, estimating measurement uncertainties.',
        ),
      },
      {
        code: 'eA-4.2',
        title: L('Aufgabenpraktikum', 'Problem-solving practical'),
        summary: L(
          'Strategien zum Lösen physikalischer Aufgaben üben, auch mit Kraftansätzen und der Wahl eines geeigneten Bezugssystems.',
          'Practising strategies for physics problems, including force approaches and choosing a suitable frame of reference.',
        ),
      },
    ],
  },
  {
    code: 'WPF-1',
    title: L('Elektrische und magnetische Felder (zweistündiges Wahlpflichtfach)', 'Electric and magnetic fields (two-hour elective)'),
    summary: L(
      'Feldbegriff, Körper in statischen Feldern und Induktion in knapper Form.',
      'The field concept, bodies in static fields and induction in brief.',
    ),
    parts: [
      {
        code: 'WPF-1.1',
        title: L('Das Feldkonzept zur Beschreibung von Wechselwirkungen', 'The field concept for describing interactions'),
        summary: L(
          'Elektrische und magnetische Felder mit Feldlinien beschreiben, Plattenkondensator als Energiespeicher.',
          'Describing electric and magnetic fields with field lines, the parallel-plate capacitor as an energy store.',
        ),
        simulations: ['feldlinien', 'kondensator'],
      },
      {
        code: 'WPF-1.2',
        title: L('Körper in statischen Feldern', 'Bodies in static fields'),
        summary: L(
          'Kräfte auf geladene Teilchen in elektrischen und magnetischen Feldern, Lorentzkraft und Bahnformen.',
          'Forces on charged particles in electric and magnetic fields, the Lorentz force and the resulting paths.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'WPF-1.3',
        title: L('Veränderliche elektromagnetische Felder', 'Changing electromagnetic fields'),
        summary: L(
          'Induktion durch Änderung des magnetischen Flusses, Generatorprinzip und Induktionsgesetz.',
          'Induction by a changing magnetic flux, the generator principle and the law of induction.',
        ),
        simulations: ['induktion'],
      },
    ],
  },
  {
    code: 'WPF-2',
    title: L('Mechanische und elektromagnetische Schwingungen und Wellen (zweistündiges Wahlpflichtfach)', 'Mechanical and electromagnetic oscillations and waves (two-hour elective)'),
    summary: L(
      'Mechanische Schwingungen und Wellen bis zum Licht als Welle.',
      'Mechanical oscillations and waves up to light as a wave.',
    ),
    parts: [
      {
        code: 'WPF-2.1',
        title: L('Schwingungen', 'Oscillations'),
        summary: L(
          'Kenngrößen mechanischer Schwingungen am Fadenpendel, Energieumwandlungen auch im Schwingkreis.',
          'Parameters of mechanical oscillations on a simple pendulum, energy conversions, also in an LC circuit.',
        ),
        simulations: ['fadenpendel'],
      },
      {
        code: 'WPF-2.2',
        title: L('Wellen', 'Waves'),
        summary: L(
          'Harmonische Wellen, Licht als elektromagnetische Welle, Interferenz an Doppelspalt und Gitter, stehende Wellen.',
          'Harmonic waves, light as an electromagnetic wave, interference at a double slit and a grating, standing waves.',
        ),
        simulations: ['wellen-ausbreitung', 'doppelspalt', 'stehende-wellen'],
      },
    ],
  },
  {
    code: 'WPF-3',
    title: L('Quantenphysik und Materie (zweistündiges Wahlpflichtfach)', 'Quantum physics and matter (two-hour elective)'),
    summary: L(
      'Wesenszüge der Quantenphysik und Atomvorstellungen.',
      'Key features of quantum physics and models of the atom.',
    ),
    parts: [
      {
        code: 'WPF-3.1',
        title: L('Quantenobjekte', 'Quantum objects'),
        summary: L(
          'Wesenszüge der Quantenphysik im Überblick, Energie und Wellenlänge von Quantenobjekten, Planck’sches Wirkungsquantum.',
          'Overview of key features of quantum physics, energy and wavelength of quantum objects, Planck’s constant.',
        ),
        simulations: ['photoeffekt'],
      },
      {
        code: 'WPF-3.2',
        title: L('Atomvorstellungen', 'Models of the atom'),
        summary: L(
          'Energiestufen und Orbitale des Wasserstoffatoms, Absorptions- und Emissionslinien.',
          'Energy levels and orbitals of the hydrogen atom, absorption and emission lines.',
        ),
        simulations: ['linienspektren'],
      },
    ],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium in Sachsen-Anhalt (G8, Abitur nach Klasse 12) nach dem
 * „Fachlehrplan Gymnasium Physik“ des Ministeriums für Bildung des Landes Sachsen-Anhalt,
 * Stand 01.08.2022 („In Kraft seit 2016, Anpassung 2022“), Schuljahrgänge 6–12 in einem
 * Dokument (geliefert in zwei Dateien: S. 1–50 und S. 51–106).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/sachsen-anhalt-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Der Lehrplan beschreibt die Schuljahrgänge 7/8 und die
 * Qualifikationsphase 11/12 jeweils gemeinsam; sie stehen als Doppeljahrgangsstufen.
 * Schuljahrgang 10 ist die Einführungsphase. Die Kompetenzschwerpunkte sind im Lehrplan nicht
 * nummeriert; die Nummern sind selbst vergeben (gA/eA = grundlegendes bzw. erhöhtes
 * Anforderungsniveau, WPF = zweistündiges Wahlpflichtfach).
 *
 * Überschriften entsprechen dem Fachlehrplan; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const sachsenAnhaltGymnasiumPhysik: StateCurriculum = {
  id: 'sachsen-anhalt-gymnasium-physik',
  subject: 'physik',
  slug: L('sachsen-anhalt-gymnasium', 'saxony-anhalt-gymnasium'),
  state: L('Sachsen-Anhalt', 'Saxony-Anhalt'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Fachlehrplan',
  grades: [
    grade(6, SJ_6, SJ_6_UNITS),
    grade(7, SJ_7_8, SJ_7_8_UNITS),
    grade(8, SJ_7_8, SJ_7_8_UNITS),
    grade(9, SJ_9, SJ_9_UNITS),
    grade(10, SJ_10, SJ_10_UNITS),
    grade(11, QPHASE, QPHASE_UNITS),
    grade(12, QPHASE, QPHASE_UNITS),
  ],
};
