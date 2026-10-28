import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Ministerium für Bildung und Kultur des Saarlandes. Die Lehrpläne nennen keinen Link zur
 * einzelnen Datei. Verlinkt ist die Startseite des Ministeriums.
 */
const SOURCE = 'https://www.saarland.de/mbk';

// Hinweise je Klassenstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/saarland-gymnasium-physik.md, Teil E).
const KS = (n: number, branch: Localized | null): Localized =>
  L(
    `Klassenstufe ${n} (neunjähriges Gymnasium)${branch ? `, ${branch.de}` : ''}. „Umgang mit Messdaten in der Physik“ wird in allen Themenfeldern eingeübt. Die Nummern sind von uns vergeben.`,
    `Grade ${n} (nine-year Gymnasium)${branch ? `, ${branch.en}` : ''}. “Handling measurement data in physics” is practised in all topic fields. The numbers are our own.`,
  );

const NW = L(
  'abgebildet ist der naturwissenschaftliche Zweig (NW-Zweig); andere Zweige haben eigene Lehrpläne mit teils anderen Themen',
  'shown is the science branch (NW branch); other branches have their own curricula with partly different topics',
);

const EP = L(
  'Einführungsphase der gymnasialen Oberstufe (hier Klassenstufe 11), Lehrplan von 2023. Die Nummern sind von uns vergeben.',
  'Introductory phase of upper secondary (here grade 11), curriculum from 2023. The numbers are our own.',
);

const HP_12 = L(
  'Hauptphase, 1. und 2. Halbjahr (hier Klassenstufe 12): Themenfelder für Grund- und Leistungskurs; LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.',
  'Main phase, first and second half-year (here grade 12): topic fields for the basic and the advanced course; LK = advanced course only. The numbers are those of the curriculum.',
);

const HP_13 = L(
  'Hauptphase, 3. und 4. Halbjahr (hier Klassenstufe 13). LK = nur im Leistungskurs. Die Nummern sind die des Lehrplans.',
  'Main phase, third and fourth half-year (here grade 13). LK = advanced course only. The numbers are those of the curriculum.',
);

/** Klassenstufe 7 (für alle Zweige). */
const KS_7_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Grundlagen der Elektrizität', 'Basics of electricity'),
    summary: L(
      'Magnetismus, elektrischer Stromkreis, Spannung und Stromstärke, Wirkungen des Stroms, ohmsches Gesetz, sicherer Umgang mit Elektrizität.',
      'Magnetism, the electric circuit, voltage and current, effects of current, Ohm’s law, using electricity safely.',
    ),
    simulations: ['einfacher-stromkreis', 'reihe-parallel', 'ohmsches-gesetz'],
  },
  {
    code: '2',
    title: L('Grundlagen der Optik', 'Basics of optics'),
    summary: L('Lichtausbreitung und Schatten, Lochkamera, Reflexion.', 'Propagation of light and shadows, the pinhole camera, reflection.'),
    simulations: ['licht-schatten', 'reflexion'],
  },
  {
    code: '3',
    title: L('Grundlagen der Mechanik', 'Basics of mechanics'),
    summary: L('Masse und Dichte, Bewegungen beschreiben.', 'Mass and density, describing motion.'),
    simulations: ['bewegungsdiagramme'],
  },
];

/** Klassenstufe 8, NW-Zweig. */
const KS_8_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Kraft', 'Force'),
    summary: L('Kraftmessung, Gewichtskraft, Kraft als Vektor, Reibungskraft, Kraftwandler.', 'Measuring force, weight, force as a vector, friction, force converters.'),
    simulations: ['hookesches-gesetz', 'kraefteaddition', 'hebelgesetz'],
  },
  {
    code: '2',
    title: L('Mechanische Energie', 'Mechanical energy'),
    summary: L('Arbeit, Energie und Leistung.', 'Work, energy and power.'),
    simulations: ['energieerhaltung'],
  },
  {
    code: '3',
    title: L('Druck', 'Pressure'),
    summary: L('Druck als Zustand, Schweredruck in Flüssigkeiten, Luftdruck, Auftrieb.', 'Pressure as a state, hydrostatic pressure, air pressure, buoyancy.'),
  },
  {
    code: '4',
    title: L('Temperatur', 'Temperature'),
    summary: L('Temperaturmessung, Zustandsgleichung für ideale Gase.', 'Measuring temperature, the equation of state for ideal gases.'),
    simulations: ['teilchenmodell', 'gasgesetze'],
  },
  {
    code: '5',
    title: L('Thermische Energie und Wärme', 'Thermal energy and heat'),
    summary: L('Spezifische Wärmekapazität, Ausbreitung von Wärme.', 'Specific heat capacity, heat transfer.'),
    simulations: ['teilchenmodell'],
  },
  {
    code: '6',
    title: L('Wahlthema oder Praktikum', 'Elective topic or practical'),
    summary: L('Wahlthema oder Praktikum nach Wahl der Lehrkraft.', 'Elective topic or practical chosen by the teacher.'),
  },
];

/** Klassenstufe 9, NW-Zweig. */
const KS_9_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Brechung, Abbildungen und Spektralfarben', 'Refraction, images and spectral colours'),
    summary: L(
      'Brechung und Totalreflexion, Abbildungen durch Linsen, optische Geräte zur Vergrößerung des Sehwinkels, Spektralfarben und elektromagnetisches Spektrum.',
      'Refraction and total internal reflection, images formed by lenses, optical instruments that enlarge the visual angle, spectral colours and the electromagnetic spectrum.',
    ),
    simulations: ['brechung', 'linsen'],
  },
  {
    code: '2',
    title: L('Gesetze des elektrischen Stromkreises', 'Laws of the electric circuit'),
    summary: L(
      'Ladung und elektrisches Feld, Strom und Spannung, elektrische Arbeit und Leistung, Reihen- und Parallelschaltung von Widerständen, Halbleiter und Dioden.',
      'Charge and the electric field, current and voltage, electrical work and power, series and parallel resistors, semiconductors and diodes.',
    ),
    simulations: ['einfacher-stromkreis', 'reihe-parallel', 'ohmsches-gesetz'],
  },
  {
    code: '3',
    title: L('Wahlthema oder Praktikum', 'Elective topic or practical'),
    summary: L('Vorschläge: Innenwiderstand, spezifischer Widerstand, Transistorschaltungen.', 'Suggestions: internal resistance, resistivity, transistor circuits.'),
  },
];

/** Klassenstufe 10, NW-Zweig. */
const KS_10_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Elektromagnetische Wechselwirkung', 'Electromagnetic interaction'),
    summary: L('Stromdurchflossene Leiter im Magnetfeld, elektromagnetische Induktion, Transformator.', 'Current-carrying conductors in a magnetic field, electromagnetic induction, the transformer.'),
    simulations: ['lorentzkraft', 'induktion'],
  },
  {
    code: '2',
    title: L('Nachhaltige Energieversorgung', 'Sustainable energy supply'),
    summary: L('Energieumwandlung und Energieerhaltung, Kraftwerke, Energiespeicherung und Energieentwertung.', 'Energy conversion and conservation, power stations, energy storage and dissipation.'),
    simulations: ['energieerhaltung'],
  },
  {
    code: '3',
    title: L('Thermodynamik und Klimaphysik', 'Thermodynamics and climate physics'),
    summary: L('Zustandsänderungen von Gasen, Kreisprozesse, Klimaphysik.', 'Changes of state of gases, thermodynamic cycles, climate physics.'),
    simulations: ['gasgesetze'],
  },
  {
    code: '4',
    title: L('Ionisierende Strahlung', 'Ionising radiation'),
    summary: L('Strahlungsarten, Nachweis, Halbwertszeit und Wirkung ionisierender Strahlung.', 'Types of radiation, detection, half-life and effects of ionising radiation.'),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: '5',
    title: L('Wahlthema oder Praktikum', 'Elective topic or practical'),
    summary: L('Vorschläge: Astronomie, Transistoren in der Informationstechnik, Energiebedarf von Autos.', 'Suggestions: astronomy, transistors in information technology, energy needs of cars.'),
    simulations: ['planetenbahnen'],
  },
];

/** Einführungsphase (Lehrplan 2023). */
const EP_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Kraft und Bewegung', 'Force and motion'),
    summary: L(
      'Trägheitssatz und gleichförmige Bewegung, gleichmäßig beschleunigte Bewegung, Grundgesetz der Mechanik, freier Fall und senkrechter Wurf, Wechselwirkungsprinzip und Stöße, gleichförmige Kreisbewegung.',
      'The law of inertia and uniform motion, uniformly accelerated motion, Newton’s second law, free fall and vertical projection, action and reaction and collisions, uniform circular motion.',
    ),
    simulations: ['bewegungsdiagramme', 'freier-fall', 'kraefteaddition', 'schiefe-ebene', 'energieerhaltung', 'stoesse', 'kreisbewegung'],
  },
  {
    code: '2',
    title: L('Kernenergie und Radioaktivität', 'Nuclear energy and radioactivity'),
    summary: L('Kern-Hülle-Modell, Kernbindungsenergie, Kernkraftwerke, Radioaktivität.', 'The nucleus–shell model, nuclear binding energy, nuclear power stations, radioactivity.'),
    simulations: ['radioaktiver-zerfall'],
  },
];

/** Hauptphase, 1. und 2. Halbjahr. */
const HP_12_UNITS: CurriculumUnit[] = [
  {
    code: '1.1',
    title: L('Gravitationsfeld', 'Gravitational field'),
    summary: L('Gravitationsgesetz und Gravitationsfeld, Bahndaten von Himmelskörpern nur für Kreisbahnen, ohne Keplersche Gesetze.', 'The law of gravitation and the gravitational field, orbital data of celestial bodies for circular orbits only, without Kepler’s laws.'),
    simulations: ['planetenbahnen'],
  },
  {
    code: '1.2',
    title: L('Elektrisches Feld', 'Electric field'),
    summary: L('Feldlinien und Feldstärke, Plattenkondensator und Kapazität, Energie im elektrischen Feld.', 'Field lines and field strength, the parallel-plate capacitor and capacitance, energy in the electric field.'),
    simulations: ['feldlinien', 'kondensator'],
  },
  {
    code: '1.3',
    title: L('Magnetisches Feld', 'Magnetic field'),
    summary: L('Magnetfelder von Leitern und Spulen, magnetische Flussdichte.', 'Magnetic fields of conductors and coils, magnetic flux density.'),
  },
  {
    code: '1.4',
    title: L('Bewegung von Ladungsträgern in Feldern', 'Motion of charge carriers in fields'),
    summary: L('Geladene Teilchen im elektrischen und magnetischen Feld, Lorentzkraft.', 'Charged particles in electric and magnetic fields, the Lorentz force.'),
    simulations: ['lorentzkraft'],
  },
  {
    code: '2',
    title: L('Elektromagnetische Induktion', 'Electromagnetic induction'),
    summary: L('Induktionsgesetz; LK: Selbstinduktion und Energie des magnetischen Feldes.', 'The law of induction; LK: self-induction and the energy of the magnetic field.'),
    simulations: ['induktion'],
  },
  {
    code: '3.1',
    title: L('Mechanische Schwingungen', 'Mechanical oscillations'),
    summary: L('Harmonische Schwingungen von Feder- und Fadenpendel, gedämpfte Schwingungen; LK: erzwungene Schwingung und Resonanz.', 'Harmonic oscillation of spring and simple pendulums, damped oscillation; LK: forced oscillation and resonance.'),
    simulations: ['fadenpendel', 'federpendel', 'resonanz'],
  },
  {
    code: '3.2',
    title: L('Mechanische Wellen', 'Mechanical waves'),
    summary: L('Ausbreitung und Kenngrößen von Wellen, Überlagerung und Interferenz, stehende Wellen.', 'Propagation and parameters of waves, superposition and interference, standing waves.'),
    simulations: ['wellen-ausbreitung', 'interferenz', 'stehende-wellen'],
  },
];

/** Hauptphase, 3. und 4. Halbjahr. */
const HP_13_UNITS: CurriculumUnit[] = [
  {
    code: '3.3',
    title: L('Elektromagnetische Schwingungen', 'Electromagnetic oscillations'),
    summary: L('Elektromagnetischer Schwingkreis mit Thomsonscher Schwingungsgleichung; LK: Dämpfung, erzwungene Schwingung und Resonanz.', 'The electromagnetic oscillating circuit with Thomson’s formula; LK: damping, forced oscillation and resonance.'),
    simulations: ['resonanz'],
  },
  {
    code: '3.4',
    title: L('Elektromagnetische Wellen', 'Electromagnetic waves'),
    summary: L('Entstehung und Eigenschaften elektromagnetischer Wellen.', 'Generation and properties of electromagnetic waves.'),
  },
  {
    code: '3.5',
    title: L('Wellenmodell des Lichts', 'Wave model of light'),
    summary: L('Beugung und Interferenz von Licht an Doppelspalt und Gitter.', 'Diffraction and interference of light at a double slit and a grating.'),
    simulations: ['doppelspalt', 'interferenz'],
  },
  {
    code: '4',
    title: L('Quanten und Atome', 'Quanta and atoms'),
    summary: L(
      'Photoeffekt und Photonenmodell, Materiewellen, Wahrscheinlichkeitsverhalten von Quantenobjekten, Emission und Absorption, quantenmechanisches Atommodell; LK: Röntgenstrahlung, Unbestimmtheitsrelation, Potenzialtopf.',
      'The photoelectric effect and the photon model, matter waves, probabilistic behaviour of quantum objects, emission and absorption, the quantum model of the atom; LK: X-rays, the uncertainty relation, the potential well.',
    ),
    simulations: ['photoeffekt', 'elektronenbeugung', 'doppelspalt', 'linienspektren'],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium im Saarland (neunjähriges Gymnasium, Abitur nach Klassenstufe 13) nach
 * - „Lehrplan Physik, Neunjähriges Gymnasium“, Klassenstufe 7 (2023) und für den
 *   naturwissenschaftlichen Zweig Klassenstufen 8 (2024), 9 (2024) und 10 (2026),
 * - „Lehrplan Physik, Gymnasiale Oberstufe, Einführungsphase“ (2023) und
 *   „Lehrplan Physik, Hauptphase, Grundkurs“ und „Leistungskurs“ (2023).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/saarland-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Sek. I nach Klassenstufen im NW-Zweig, Oberstufe als
 * Einführungsphase (11) und Hauptphase (12, 13); die Zuordnung zu 11–13 ist eine Annahme.
 *
 * Überschriften entsprechen den Lehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const saarlandGymnasiumPhysik: StateCurriculum = {
  id: 'saarland-gymnasium-physik',
  subject: 'physik',
  slug: L('saarland-gymnasium', 'saarland-gymnasium'),
  state: L('Saarland', 'Saarland'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Lehrplan',
  grades: [
    grade(7, KS(7, null), KS_7_UNITS),
    grade(8, KS(8, NW), KS_8_UNITS),
    grade(9, KS(9, NW), KS_9_UNITS),
    grade(10, KS(10, NW), KS_10_UNITS),
    grade(11, EP, EP_UNITS),
    grade(12, HP_12, HP_12_UNITS),
    grade(13, HP_13, HP_13_UNITS),
  ],
};
