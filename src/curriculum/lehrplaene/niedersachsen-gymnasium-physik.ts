import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Niedersächsischer Bildungsserver (NIBIS), Bereich Curriculare Vorgaben. Das
 * Kerncurriculum der Oberstufe nennt „http://www.cuvo.nibis.de“; der Test verlangt
 * https. Ein Link zur einzelnen PDF-Datei steht in den Dokumenten nicht.
 */
const SOURCE = 'https://cuvo.nibis.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/niedersachsen-gymnasium-physik.md, Teil E).
const DOPPELJAHRGANG = (a: number, b: number) =>
  L(
    `Doppeljahrgang ${a}/${b}: Das Kerncurriculum nennt die Kompetenzen „am Ende von Schuljahrgang ${b}“; die Lernbereiche stehen deshalb bei ${a} und ${b} gleich. Die Fachkonferenz legt fest, in welcher Reihenfolge die Themenbereiche unterrichtet werden. Jede Simulation steht bei den Jahrgängen, für die sie gedacht ist. Die Nummern sind von uns vergeben und laufen über alle Doppeljahrgänge durch.`,
    `Double grade ${a}/${b}: the core curriculum states its expectations “by the end of grade ${b}”, so the units are the same for grades ${a} and ${b}. Each school decides the order of the topic areas. Each simulation is listed under the grades it is designed for. The numbers are our own and run through all double grades.`,
  );

const EF = L(
  'Einführungsphase der gymnasialen Oberstufe (G9: Schuljahrgang 11). Verbindlich ist im ersten Halbjahr die Dynamik; für das zweite Halbjahr schlägt das Kerncurriculum Wahlmodule vor, die Schule kann auch ein eigenes planen. Die Codes und die Gliederung der Dynamik sind von uns.',
  'Introductory phase of upper secondary (G9: grade 11). Dynamics is mandatory in the first half-year; for the second half-year the core curriculum suggests optional modules, and schools may plan their own. The codes and the subdivision of dynamics are our own.',
);

const QPHASE = L(
  'Qualifikationsphase (G9: Schuljahrgänge 12 und 13). Das Kerncurriculum verlangt nur, dass im ersten Jahr mindestens Elektrizität sowie Schwingungen und Wellen behandelt werden; die übrigen Inhaltsbereiche verteilt es nicht. Die Lernbereiche stehen deshalb als Doppeljahrgang bei 12 und 13 gleich. „Nur eA“ kennzeichnet das erhöhte Anforderungsniveau. Die Codes und die Unterteilung der Inhaltsbereiche (nach den Tabellen des Kerncurriculums) sind von uns.',
  'Qualification phase (G9: grades 12 and 13). The core curriculum only requires electricity and oscillations and waves in the first year; it does not distribute the other content areas. The units are therefore the same for the double grade 12 and 13. “Higher level only” marks the higher requirement level (eA). The codes and the subdivision of the content areas (following the tables of the core curriculum) are our own.',
);

/** Doppeljahrgang 5/6 (Kap. 2.3.3). */
const DJ_5_6: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Dauermagnete', 'Permanent magnets'),
    summary: L(
      'Magnete ziehen manche Stoffe an, haben Nord- und Südpol, die sich nicht trennen lassen; Erde als Magnet, Kompass und das Modell der Elementarmagnete.',
      'Magnets attract some materials and have north and south poles that cannot be separated; the Earth as a magnet, the compass and the model of elementary magnets.',
    ),
  },
  {
    code: '2',
    title: L('Stromkreise', 'Electric circuits'),
    summary: L(
      'Einfache Stromkreise nach Schaltplan aufbauen, Reihen- und Parallelschaltung unterscheiden, Leiter und Isolatoren, Spannungsangaben, Gefahren der Elektrizität und der Elektromagnet.',
      'Building simple circuits from a diagram, telling series and parallel circuits apart, conductors and insulators, voltage ratings, dangers of electricity and the electromagnet.',
    ),
    simulations: ['einfacher-stromkreis'],
  },
  {
    code: '3',
    title: L('Phänomenorientierte Optik', 'Phenomenon-based optics'),
    summary: L(
      'Sehen mit dem Sender-Empfänger-Modell, geradlinige Ausbreitung, Schatten, Finsternisse und Mondphasen; Reflexion, Streuung und Brechung; Bilder an Spiegel, Lochblende und Sammellinse; weißes Licht als Farbgemisch.',
      'Seeing with the sender–receiver model, straight-line propagation, shadows, eclipses and lunar phases; reflection, scattering and refraction; images in mirrors, pinholes and converging lenses; white light as a mixture of colours.',
    ),
    simulations: ['licht-schatten', 'reflexion', 'brechung', 'linsen'],
  },
];

/** Doppeljahrgang 7/8 (Kap. 2.3.3). */
const DJ_7_8: CurriculumUnit[] = [
  {
    code: '4',
    title: L('Einführung des Energiebegriffs', 'Introducing the concept of energy'),
    summary: L(
      'Energie in Übertragungsketten und Flussdiagrammen beschreiben, Einheit Joule, qualitative Energiebilanzen und Energieerhaltung mit dem Energiestrom in die Umgebung.',
      'Describing energy in transfer chains and flow diagrams, the joule, qualitative energy balances and conservation of energy including the flow to the surroundings.',
    ),
  },
  {
    code: '5',
    title: L('Elektrik I', 'Electricity I'),
    summary: L(
      'Stromkreise als Energieüberträger, Elektronen im Metall, Stromstärke, Spannung und Leistung messen, Knoten- und Maschenregel, Widerstand und ohmsches Gesetz.',
      'Circuits as energy carriers, electrons in metals, measuring current, voltage and power, the junction and loop rules, resistance and Ohm’s law.',
    ),
    simulations: ['einfacher-stromkreis', 'ohmsches-gesetz', 'reihe-parallel'],
  },
  {
    code: '6',
    title: L('Bewegung, Masse und Kraft', 'Motion, mass and force'),
    summary: L(
      'Geradlinige Bewegungen in t-s- und t-v-Diagrammen, Trägheit und Masse, Kraft als Ursache von Bewegungsänderung und Verformung, hookesches Gesetz, Gewichtskraft sowie Kräfte als Pfeile addieren.',
      'Straight-line motion in t–s and t–v graphs, inertia and mass, force as the cause of changes in motion and deformation, Hooke’s law, weight and adding forces as arrows.',
    ),
    simulations: ['bewegungsdiagramme', 'hookesches-gesetz', 'kraefteaddition'],
  },
];

/** Doppeljahrgang 9/10 (Kap. 2.3.3). */
const DJ_9_10: CurriculumUnit[] = [
  {
    code: '7',
    title: L('Energieübertragung quantitativ', 'Energy transfer – quantitative'),
    summary: L(
      'Temperatur und innere Energie, Phasenübergänge energetisch, Energieentwertung, Leistung, Arbeit und Wärme sowie Lage- und Bewegungsenergie mit dem Energieerhaltungssatz berechnen.',
      'Temperature and internal energy, phase changes in terms of energy, energy dissipation, power, work and heat, and calculating potential and kinetic energy with the law of conservation of energy.',
    ),
    simulations: ['energieerhaltung', 'teilchenmodell'],
  },
  {
    code: '8',
    title: L('Elektrik II', 'Electricity II'),
    summary: L(
      'Leiter und Halbleiter, pn-Übergang, Leuchtdiode und Solarzelle, Motor, Generator und Transformator als Energiewandler sowie Gleich- und Wechselstrom.',
      'Conductors and semiconductors, the pn junction, LEDs and solar cells, motor, generator and transformer as energy converters, and direct and alternating current.',
    ),
  },
  {
    code: '9',
    title: L('Atom- und Kernphysik', 'Atomic and nuclear physics'),
    summary: L(
      'Kern-Hülle-Modell und Isotope, Kernstrahlung und ihre Wirkung, Zählrohr, Alpha-, Beta- und Gammastrahlung, Strahlenschutz, Halbwertszeit sowie Kernspaltung und Kettenreaktion.',
      'The nuclear model of the atom and isotopes, nuclear radiation and its effects, the Geiger counter, alpha, beta and gamma radiation, radiation protection, half-life, and nuclear fission and chain reactions.',
    ),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: '10',
    title: L('Energieübertragung in Kreisprozessen', 'Energy transfer in cyclic processes'),
    summary: L(
      'Gasdruck im Teilchenmodell, Gesetze von Boyle-Mariotte und Gay-Lussac, Kelvin-Skala, Stirlingmotor und der höchstmögliche Wirkungsgrad.',
      'Gas pressure in the particle model, the laws of Boyle–Mariotte and Gay-Lussac, the Kelvin scale, the Stirling engine and the maximum possible efficiency.',
    ),
    simulations: ['gasgesetze'],
  },
];

/** Einführungsphase (Kap. 3.2 des Kerncurriculums Sekundarbereich II). */
const EF_UNITS: CurriculumUnit[] = [
  {
    code: 'EF-1',
    title: L('Dynamik', 'Dynamics'),
    summary: L(
      'Verbindlich im ersten Halbjahr: freier Fall und waagerechter Wurf, Newton’sche Axiome, Kreisbewegung, Energieerhaltung in der Mechanik und ein Werturteil zur Energienutzung.',
      'Mandatory in the first half-year: free fall and horizontal projection, Newton’s laws, circular motion, conservation of energy in mechanics and a value judgement on energy use.',
    ),
    parts: [
      {
        code: 'EF-1.1',
        title: L('Freier Fall und waagerechter Wurf', 'Free fall and horizontal projection'),
        summary: L(
          't-s- und t-v-Zusammenhänge, Fallbeschleunigung und Idealisierungen.',
          'Time–distance and time–velocity relationships, gravitational acceleration and idealisations.',
        ),
        simulations: ['freier-fall', 'schiefer-wurf', 'bewegungsdiagramme'],
      },
      {
        code: 'EF-1.2',
        title: L('Grundgleichung der Mechanik und newtonsche Axiome', 'Fundamental equation of mechanics and Newton’s laws'),
        summary: L('F = m · a, Krafteinheit und die drei Axiome.', 'F = m · a, the unit of force and the three laws.'),
      },
      {
        code: 'EF-1.3',
        title: L('Gleichförmige Kreisbewegung', 'Uniform circular motion'),
        summary: L(
          'Umlaufdauer, Bahngeschwindigkeit, Zentripetalbeschleunigung und Zentripetalkraft.',
          'Period, orbital speed, centripetal acceleration and centripetal force.',
        ),
        simulations: ['kreisbewegung'],
      },
      {
        code: 'EF-1.4',
        title: L('Energieerhaltung in der Mechanik', 'Conservation of energy in mechanics'),
        summary: L(
          'Kinetische Energie und Energieerhaltungssatz als Alternative zur Kraftbetrachtung; ein Werturteil zur Energienutzung.',
          'Kinetic energy and the law of conservation of energy as an alternative to forces; a value judgement on energy use.',
        ),
        simulations: ['energieerhaltung'],
      },
    ],
  },
  {
    code: 'EF-2',
    title: L('Wahlmodule (Vorschläge)', 'Optional modules (suggestions)'),
    summary: L(
      'Für das zweite Halbjahr ein Wahlmodul von etwa 16 Stunden; das Kerncurriculum schlägt vier vor, die Schule kann ein eigenes planen.',
      'For the second half-year one optional module of about 16 lessons; the core curriculum suggests four, and schools may plan their own.',
    ),
    parts: [
      {
        code: 'EF-2.1',
        title: L('Akustik', 'Acoustics'),
        summary: L(
          'Schallgeschwindigkeit, Ton, Klang und Geräusch, Frequenz und Amplitude, Schalldruckpegel, Intervalle und Klangfarbe.',
          'Speed of sound, tone, sound and noise, frequency and amplitude, sound pressure level, intervals and timbre.',
        ),
      },
      {
        code: 'EF-2.2',
        title: L('Atom- und Kernphysik', 'Atomic and nuclear physics'),
        summary: L(
          'Ausgleich für Lernende aus anderen Bildungsgängen: Kern-Hülle-Modell, Kernstrahlung, Zählrohr und Halbwertszeit.',
          'Catch-up for students from other school types: nuclear model, nuclear radiation, Geiger counter and half-life.',
        ),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: 'EF-2.3',
        title: L('Optische Abbildungen', 'Optical imaging'),
        summary: L(
          'Bilder an Linsen, Brennweite, Abbildungsgleichung und optische Geräte.',
          'Images formed by lenses, focal length, the lens equation and optical instruments.',
        ),
      },
      {
        code: 'EF-2.4',
        title: L('Strahlungsphysik', 'Radiation physics'),
        summary: L(
          'Strahlungsgesetze, Strahlungsgleichgewicht, selektive Absorption und der Treibhauseffekt.',
          'Radiation laws, radiative equilibrium, selective absorption and the greenhouse effect.',
        ),
      },
    ],
  },
];

/** Qualifikationsphase (Kap. 3.3), grundlegendes (gA) und erhöhtes Anforderungsniveau (eA). */
const Q_UNITS: CurriculumUnit[] = [
  {
    code: 'Q-1',
    title: L('Elektrizität', 'Electricity'),
    summary: L(
      'Elektrische Felder und Spannung, Plattenkondensator mit Lade- und Entladekurven, Magnetfelder, Elektronen in Feldern und elektromagnetische Induktion.',
      'Electric fields and voltage, the parallel-plate capacitor with charging and discharging curves, magnetic fields, electrons in fields and electromagnetic induction.',
    ),
    parts: [
      {
        code: 'Q-1.1',
        title: L('Elektrisches Feld und Spannung', 'Electric field and voltage'),
        summary: L(
          'Feldlinienbilder, Feldstärke, faradayscher Käfig, Spannung als Energie pro Ladung; nur eA: coulombsches Gesetz und Potenzial.',
          'Field-line patterns, field strength, the Faraday cage, voltage as energy per charge; higher level only: Coulomb’s law and potential.',
        ),
        simulations: ['feldlinien'],
      },
      {
        code: 'Q-1.2',
        title: L('Kondensator', 'Capacitor'),
        summary: L(
          'Feld im Plattenkondensator, geladene Körper im Feld, Auf- und Entladen als Exponentialfunktion, Kapazität und Feldenergie.',
          'The field in a parallel-plate capacitor, charged bodies in the field, charging and discharging as exponential functions, capacitance and field energy.',
        ),
        simulations: ['kondensator'],
      },
      {
        code: 'Q-1.3',
        title: L('Magnetfeld und Elektronen in Feldern', 'Magnetic field and electrons in fields'),
        summary: L(
          'Kraft auf stromdurchflossene Leiter, Flussdichte, Elektronen unter Lorentzkraft, im Querfeld und im Wien-Filter; nur eA: e/m mit dem Fadenstrahlrohr.',
          'Force on current-carrying wires, flux density, electrons under the Lorentz force, in a transverse field and in a Wien filter; higher level only: e/m with the fine-beam tube.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'Q-1.4',
        title: L('Hallsonde, Spulenfeld und Induktion', 'Hall probe, coil field and induction'),
        summary: L(
          'Flussdichte mit der Hallsonde messen, Feld einer Spule, Induktionsspannung und Induktionsgesetz, Wechselspannung; nur eA: Selbstinduktion und Energie des Magnetfelds.',
          'Measuring flux density with a Hall probe, the field of a coil, induced voltage and the law of induction, alternating voltage; higher level only: self-induction and magnetic field energy.',
        ),
        simulations: ['induktion'],
      },
    ],
  },
  {
    code: 'Q-2',
    title: L('Schwingungen und Wellen', 'Oscillations and waves'),
    summary: L(
      'Harmonische Schwingungen an Feder- und Fadenpendel, Resonanz und Schwingkreis, harmonische Wellen, Polarisation sowie Interferenz an stehenden Wellen, Doppelspalt, Gitter und Michelson-Interferometer.',
      'Harmonic oscillations of spring and simple pendulums, resonance and the LC circuit, harmonic waves, polarisation, and interference in standing waves, double slits, gratings and the Michelson interferometer.',
    ),
    parts: [
      {
        code: 'Q-2.1',
        title: L('Harmonische Schwingungen', 'Harmonic oscillations'),
        summary: L(
          'Auslenkung, Amplitude, Periodendauer und Frequenz, Feder-Masse-Pendel und Fadenpendel; nur eA: lineares Kraftgesetz, Dämpfung und Resonanz.',
          'Displacement, amplitude, period and frequency, spring–mass and simple pendulum; higher level only: linear force law, damping and resonance.',
        ),
        simulations: ['federpendel', 'fadenpendel', 'resonanz'],
      },
      {
        code: 'Q-2.2',
        title: L('Schwingkreis und harmonische Wellen', 'LC circuit and harmonic waves'),
        summary: L(
          'Elektromagnetischer Schwingkreis, Ausbreitung harmonischer Wellen, Wellenlänge und Frequenz, Reflexion, Brechung, Beugung, longitudinale und transversale Wellen und Polarisation.',
          'The electromagnetic LC circuit, propagation of harmonic waves, wavelength and frequency, reflection, refraction, diffraction, longitudinal and transverse waves and polarisation.',
        ),
        simulations: ['wellen-ausbreitung'],
      },
      {
        code: 'Q-2.3',
        title: L('Interferenz', 'Interference'),
        summary: L(
          'Stehende Welle, Michelson-Interferometer, Doppelspalt und Gitter, Wellenlänge von Licht und Ultraschall bestimmen; nur eA: Einzelspalt und Bragg-Reflexion.',
          'Standing waves, the Michelson interferometer, double slit and grating, measuring the wavelength of light and ultrasound; higher level only: single slit and Bragg reflection.',
        ),
        simulations: ['interferenz', 'stehende-wellen', 'doppelspalt'],
      },
    ],
  },
  {
    code: 'Q-3',
    title: L('Quantenobjekte', 'Quantum objects'),
    summary: L(
      'Interferenz von Quantenobjekten und ihre stochastische Deutung, De-Broglie-Wellenlänge, Elektronenbeugung, einzelne Photonen und das Photonenmodell mit der planckschen Konstante.',
      'Interference of quantum objects and its stochastic interpretation, the de Broglie wavelength, electron diffraction, single photons and the photon model with Planck’s constant.',
    ),
    parts: [
      {
        code: 'Q-3.1',
        title: L('Interferenz von Quantenobjekten', 'Interference of quantum objects'),
        summary: L(
          'Doppelspalt mit Quantenobjekten, De-Broglie-Gleichung, Elektronenbeugungsröhre und Doppelspalt mit einzelnen Photonen und Elektronen.',
          'Double slit with quantum objects, the de Broglie equation, the electron diffraction tube and double slits with single photons and electrons.',
        ),
        simulations: ['elektronenbeugung'],
      },
      {
        code: 'Q-3.2',
        title: L('Komplementarität und Unbestimmtheit', 'Complementarity and uncertainty'),
        summary: L(
          'Nur eA: Mach-Zehnder-Interferometer, Delayed-Choice-Experiment, Zustand, Präparation, Superposition und Unbestimmtheit.',
          'Higher level only: the Mach–Zehnder interferometer, delayed-choice experiment, state, preparation, superposition and uncertainty.',
        ),
      },
      {
        code: 'Q-3.3',
        title: L('Photonen und plancksche Konstante', 'Photons and Planck’s constant'),
        summary: L(
          'h mit Leuchtdioden bestimmen; nur eA: Photoeffekt mit der Vakuum-Fotozelle und Röntgenbremsspektrum.',
          'Determining h with LEDs; higher level only: photoelectric effect with a vacuum photocell and the X-ray bremsstrahlung spectrum.',
        ),
        simulations: ['photoeffekt'],
      },
    ],
  },
  {
    code: 'Q-4',
    title: L('Atomhülle', 'Atomic shell'),
    summary: L(
      'Quantisierte Energie im Potenzialtopf, Linienspektren, Franck-Hertz-Versuch, Energieniveauschemata, Balmerformel, Fluoreszenz und Orbitale.',
      'Quantised energy in a potential well, line spectra, the Franck–Hertz experiment, energy level diagrams, the Balmer formula, fluorescence and orbitals.',
    ),
    parts: [
      {
        code: 'Q-4.1',
        title: L('Energiequantisierung und Linienspektren', 'Energy quantisation and line spectra'),
        summary: L(
          'Eindimensionaler Potenzialtopf, quantenhafte Emission in Linienspektren, Resonanzabsorption und Franck-Hertz-Versuch.',
          'The one-dimensional potential well, quantised emission in line spectra, resonance absorption and the Franck–Hertz experiment.',
        ),
        simulations: ['linienspektren'],
      },
      {
        code: 'Q-4.2',
        title: L('Energieniveauschemata und Orbitale', 'Energy level diagrams and orbitals'),
        summary: L(
          'Spektrallinien aus Energieniveaus berechnen, Balmerformel, Fluoreszenz und Orbitale des Wasserstoffatoms.',
          'Calculating spectral lines from energy levels, the Balmer formula, fluorescence and orbitals of the hydrogen atom.',
        ),
        simulations: ['linienspektren'],
      },
    ],
  },
  {
    code: 'Q-5',
    title: L('Atomkern', 'Atomic nucleus'),
    summary: L(
      'Zählrohr und Zerfallsgesetz, Zerfallsreihen auf der Nuklidkarte, Eigenschaften der Strahlungsarten, Energiespektren und die Bragg-Kurve in der Strahlentherapie.',
      'The Geiger counter and the decay law, decay series on the chart of nuclides, properties of the types of radiation, energy spectra and the Bragg curve in radiotherapy.',
    ),
    parts: [
      {
        code: 'Q-5.1',
        title: L('Zerfallsgesetz und Nuklidkarte', 'Decay law and chart of nuclides'),
        summary: L(
          'Geiger-Müller-Zählrohr, Zerfallsgesetz als Exponentialfunktion, Zerfallsreihen und Strahlungsarten; nur eA: Modellierung mit dem Differenzenverfahren.',
          'The Geiger–Müller counter, the decay law as an exponential function, decay series and types of radiation; higher level only: modelling with the difference method.',
        ),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: 'Q-5.2',
        title: L('Energiespektren und Anwendungen', 'Energy spectra and applications'),
        summary: L(
          'Halbleiterdetektor, Alpha-Spektrum einer Zerfallsreihe, Bragg-Kurve; nur eA: Nukleonen im Potenzialtopf.',
          'Semiconductor detectors, the alpha spectrum of a decay series, the Bragg curve; higher level only: nucleons in a potential well.',
        ),
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
 * Physik am Gymnasium in Niedersachsen (G9) nach den Kerncurricula des
 * Niedersächsischen Kultusministeriums:
 * - „Kerncurriculum für das Gymnasium, Schuljahrgänge 5–10, Physik“ (Auszug Kap. 2.1–2.3,
 *   S. 12–42; Ausgabe und Stand stehen im gelieferten Auszug nicht), Doppeljahrgänge 5/6, 7/8, 9/10;
 * - „Kerncurriculum für das Gymnasium – gymnasiale Oberstufe, die Gesamtschule – gymnasiale
 *   Oberstufe, das Berufliche Gymnasium, das Abendgymnasium, das Kolleg: Physik“
 *   (herausgegeben 2022), Einführungsphase und Qualifikationsphase.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/niedersachsen-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Doppeljahrgänge wie im Kerncurriculum; Einführungsphase = 11,
 * Qualifikationsphase = Doppeljahrgang 12/13. Nummern und Codes sind selbst vergeben.
 *
 * Überschriften entsprechen dem Kerncurriculum; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const niedersachsenGymnasiumPhysik: StateCurriculum = {
  id: 'niedersachsen-gymnasium-physik',
  subject: 'physik',
  slug: L('niedersachsen-gymnasium', 'lower-saxony-gymnasium'),
  state: L('Niedersachsen', 'Lower Saxony'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Kerncurriculum',
  grades: [
    grade(5, DOPPELJAHRGANG(5, 6), DJ_5_6),
    grade(6, DOPPELJAHRGANG(5, 6), DJ_5_6),
    grade(7, DOPPELJAHRGANG(7, 8), DJ_7_8),
    grade(8, DOPPELJAHRGANG(7, 8), DJ_7_8),
    grade(9, DOPPELJAHRGANG(9, 10), DJ_9_10),
    grade(10, DOPPELJAHRGANG(9, 10), DJ_9_10),
    grade(11, EF, EF_UNITS),
    grade(12, QPHASE, Q_UNITS),
    grade(13, QPHASE, Q_UNITS),
  ],
};
