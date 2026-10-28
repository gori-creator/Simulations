import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Bildungsserver Berlin-Brandenburg des LISUM. Die Rahmenlehrpläne nennen keinen Link zur
 * einzelnen Datei. Verlinkt ist die Startseite des Bildungsservers.
 */
const SOURCE = 'https://bildungsserver.berlin-brandenburg.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/berlin-gymnasium-physik.md, Teil E).
const KS_7_8 = L(
  'Doppeljahrgangsstufe 7/8: Die Inhalte der Themenfelder sind in der Doppeljahrgangsstufe verbindlich; die Lernbereiche stehen deshalb bei 7 und 8 gleich und werden als eine Stufe gezeigt. Die Themenfelder 3.5 und 3.6 (Elektrizität) können je nach Stundentafel auch in 9/10 unterrichtet werden. Die Themenfelder sind im Rahmenlehrplan nummeriert.',
  'Grades 7/8: the content of the topic fields is compulsory within the two grades, so the units are the same for grades 7 and 8 and are shown as one stage. Topic fields 3.5 and 3.6 (electricity) can also be taught in grades 9/10, depending on the timetable. The topic fields are numbered in the curriculum.',
);

const KS_9_10 = L(
  'Doppeljahrgangsstufe 9/10: Die Inhalte der Themenfelder sind in der Doppeljahrgangsstufe verbindlich; die Lernbereiche stehen deshalb bei 9 und 10 gleich und werden als eine Stufe gezeigt. Die Themenfelder 3.5 und 3.6 stehen hier ebenfalls, weil sie je nach Stundentafel in 7/8 oder 9/10 unterrichtet werden. Die Themenfelder sind im Rahmenlehrplan nummeriert.',
  'Grades 9/10: the content of the topic fields is compulsory within the two grades, so the units are the same for grades 9 and 10 and are shown as one stage. Topic fields 3.5 and 3.6 are listed here too because, depending on the timetable, they are taught in 7/8 or 9/10. The topic fields are numbered in the curriculum.',
);

const Q_11 = L(
  'Qualifikationsphase, 1. und 2. Kurshalbjahr (Q1, Q2; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 11). Die Reihenfolge der Themenfelder ist für Grund- und Leistungskurs verbindlich; der Leistungskurs behandelt zusätzliche Inhalte. Die Themenfelder sind im Rahmenlehrplan nummeriert.',
  'Qualification phase, first and second half-year (Q1, Q2; at the Gymnasium with Abitur after grade 12: grade 11). The order of the topic fields is binding for the basic and the advanced course; the advanced course covers additional content. The topic fields are numbered in the curriculum.',
);

const Q_12 = L(
  'Qualifikationsphase, 3. und 4. Kurshalbjahr (Q3, Q4; am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufe 12). Die Themenfelder sind im Rahmenlehrplan nummeriert.',
  'Qualification phase, third and fourth half-year (Q3, Q4; at the Gymnasium with Abitur after grade 12: grade 12). The topic fields are numbered in the curriculum.',
);

const TF_3_5: CurriculumUnit = {
  code: '3.5',
  title: L('Elektrischer Strom und elektrische Ladung', 'Electric current and electric charge'),
  summary: L(
    'Einfache Stromkreise mit Energiequelle, Schalter und Energiewandler, Wirkungen des Stroms, Ladung und Elektroskop, Modell der elektrischen Feldlinie, Strom als bewegte Ladung.',
    'Simple circuits with source, switch and converter, effects of current, charge and the electroscope, the model of electric field lines, current as moving charge.',
  ),
  simulations: ['einfacher-stromkreis'],
};

const TF_3_6: CurriculumUnit = {
  code: '3.6',
  title: L('Elektrische Stromstärke, Spannung, Widerstand und Leistung', 'Electric current, voltage, resistance and power'),
  summary: L(
    'Stromstärke und Spannung als Größen messen, ohmsches Gesetz und Widerstand, Reihen- und Parallelschaltung, elektrische Energie und Leistung.',
    'Measuring current and voltage, Ohm’s law and resistance, series and parallel circuits, electrical energy and power.',
  ),
  simulations: ['ohmsches-gesetz', 'reihe-parallel', 'einfacher-stromkreis'],
};

/** Doppeljahrgangsstufe 7/8 (Kap. 3.1–3.6). */
const KS_7_8_UNITS: CurriculumUnit[] = [
  {
    code: '3.1',
    title: L('Thermisches Verhalten von Körpern', 'Thermal behaviour of bodies'),
    summary: L(
      'Ausdehnung fester, flüssiger und gasförmiger Körper bei Temperaturänderung, Dichte, Druck und Temperatur eines Gases, Aggregatzustände im Teilchenmodell.',
      'Expansion of solids, liquids and gases with temperature, density, pressure and temperature of a gas, states of matter in the particle model.',
    ),
    simulations: ['teilchenmodell', 'gasgesetze'],
  },
  {
    code: '3.2',
    title: L('Wechselwirkung und Kraft', 'Interaction and force'),
    summary: L(
      'Kraft als Wechselwirkung zweier Körper, Kraftpfeil, Kräfte messen, Gewichtskraft und hookesches Gesetz.',
      'Force as an interaction between two bodies, force arrows, measuring forces, weight and Hooke’s law.',
    ),
    simulations: ['hookesches-gesetz', 'kraefteaddition'],
  },
  {
    code: '3.3',
    title: L('Mechanische Energie und Arbeit', 'Mechanical energy and work'),
    summary: L(
      'Energieformen, potenzielle Energie, mechanische Arbeit und Leistung, Goldene Regel der Mechanik und Energieerhaltungssatz.',
      'Forms of energy, potential energy, mechanical work and power, the golden rule of mechanics and conservation of energy.',
    ),
    simulations: ['energieerhaltung', 'hebelgesetz', 'schiefe-ebene'],
  },
  {
    code: '3.4',
    title: L('Thermische Energie und Wärme', 'Thermal energy and heat'),
    summary: L(
      'Thermische Energie und Wärme, Temperaturausgleich, Schmelz- und Verdampfungswärme, Wärmeleitung, -strömung und -strahlung im Teilchenmodell.',
      'Thermal energy and heat, temperature equalisation, latent heat of melting and vaporisation, conduction, convection and radiation in the particle model.',
    ),
    simulations: ['teilchenmodell'],
  },
  TF_3_5,
  TF_3_6,
];

/** Doppeljahrgangsstufe 9/10 (Kap. 3.7–3.13, dazu 3.5 und 3.6). */
const KS_9_10_UNITS: CurriculumUnit[] = [
  TF_3_5,
  TF_3_6,
  {
    code: '3.7',
    title: L('Gleichförmige und beschleunigte Bewegungen', 'Uniform and accelerated motion'),
    summary: L(
      'Bezugssystem, Momentan- und Durchschnittsgeschwindigkeit, Beschleunigung, Bewegungsgesetze mit s(t)- und v(t)-Diagrammen, freier Fall.',
      'Frames of reference, instantaneous and average speed, acceleration, laws of motion with s(t) and v(t) graphs, free fall.',
    ),
    simulations: ['bewegungsdiagramme', 'freier-fall'],
  },
  {
    code: '3.8',
    title: L('Kraft und Beschleunigung', 'Force and acceleration'),
    summary: L(
      'Trägheits-, Wechselwirkungs- und Grundgesetz der Dynamik, Zerlegen und Addieren von Kräften, Reibung und Radialkraft (qualitativ).',
      'The laws of inertia, interaction and the fundamental law of dynamics, resolving and adding forces, friction and centripetal force (qualitative).',
    ),
    simulations: ['kraefteaddition', 'schiefe-ebene', 'kreisbewegung'],
  },
  {
    code: '3.9',
    title: L('Magnetfelder und elektromagnetische Induktion', 'Magnetic fields and electromagnetic induction'),
    summary: L(
      'Dauer- und Elektromagnete, magnetische Feldlinien, Kräfte auf stromführende Leiter, Elektromotor, Induktionsgesetz (qualitativ), Generator und Transformator.',
      'Permanent magnets and electromagnets, magnetic field lines, forces on current-carrying wires, the electric motor, the law of induction (qualitative), generator and transformer.',
    ),
    simulations: ['induktion'],
  },
  {
    code: '3.10',
    title: L('Radioaktivität und Kernphysik', 'Radioactivity and nuclear physics'),
    summary: L(
      'Arten radioaktiver Strahlung, Nachweis und Absorption, Aktivität und Halbwertszeit, Strahlung in der Umwelt, biologische Wirkung und Kernspaltung.',
      'Types of radiation, detection and absorption, activity and half-life, radiation in the environment, biological effects and nuclear fission.',
    ),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: '3.11',
    title: L('Energieumwandlungen in Natur und Technik', 'Energy conversion in nature and technology'),
    summary: L(
      'Potenzielle und kinetische Energie berechnen, Wärme und spezifische Wärmekapazität, Wirkungsgrad und Energieflussschemen.',
      'Calculating potential and kinetic energy, heat and specific heat capacity, efficiency and energy flow diagrams.',
    ),
    simulations: ['energieerhaltung'],
  },
  {
    code: '3.12',
    title: L('Mechanische Schwingungen und Wellen', 'Mechanical oscillations and waves'),
    summary: L(
      'Kenngrößen harmonischer Schwingungen, Fadenpendel und Federschwinger, Dämpfung und Resonanz, Kenngrößen mechanischer Wellen, Reflexion, Brechung, Beugung und Interferenz.',
      'Parameters of harmonic oscillations, the simple pendulum and the spring oscillator, damping and resonance, parameters of mechanical waves, reflection, refraction, diffraction and interference.',
    ),
    simulations: ['fadenpendel', 'federpendel', 'resonanz', 'wellen-ausbreitung', 'interferenz'],
  },
  {
    code: '3.13',
    title: L('Optische Geräte', 'Optical instruments'),
    summary: L(
      'Modell Lichtstrahl, Reflexions- und Brechungsgesetz, Totalreflexion, Bildentstehung an der Sammellinse mit Linsengleichung, Spektrum am Prisma und Farbaddition.',
      'The light-ray model, laws of reflection and refraction, total internal reflection, image formation by a converging lens with the lens equation, the spectrum from a prism and additive colour mixing.',
    ),
    simulations: ['reflexion', 'brechung', 'linsen'],
  },
];

/** Qualifikationsphase Q1 und Q2 (Kap. 3.2.1–3.2.4 des Rahmenlehrplans für die gymnasiale Oberstufe). */
const Q12_UNITS: CurriculumUnit[] = [
  {
    code: '3.2.1',
    title: L('Gravitationsfeld, elektrisches und magnetisches Feld (Q1)', 'Gravitational, electric and magnetic fields (Q1)'),
    summary: L(
      'Gravitationsgesetz und Gravitationsfeld mit Feldlinienbildern, Keplersche Gesetze und Satellitenbahnen, elektrisches Feld mit Kondensator und Kapazität, Magnetfeld von Spulen; Messunsicherheiten.',
      'The law of gravitation and gravitational fields with field line patterns, Kepler’s laws and satellite orbits, the electric field with capacitor and capacitance, the magnetic field of coils; measurement uncertainty.',
    ),
    simulations: ['planetenbahnen', 'feldlinien', 'kondensator'],
  },
  {
    code: '3.2.2',
    title: L('Bewegung von geladenen Teilchen in Feldern (Q2)', 'Motion of charged particles in fields (Q2)'),
    summary: L(
      'Beschleunigung und Ablenkung geladener Teilchen im elektrischen Feld, Lorentzkraft und Kreisbahnen im Magnetfeld, Teilchen in senkrecht zueinander stehenden Feldern.',
      'Acceleration and deflection of charged particles in electric fields, the Lorentz force and circular paths in magnetic fields, particles in perpendicular fields.',
    ),
    simulations: ['lorentzkraft'],
  },
  {
    code: '3.2.3',
    title: L('Elektromagnetische Induktion (Q2)', 'Electromagnetic induction (Q2)'),
    summary: L(
      'Magnetischer Fluss und Induktionsgesetz, Lenzsche Regel, Selbstinduktion und technische Anwendungen; im LK auch in differenzieller Form.',
      'Magnetic flux and the law of induction, Lenz’s law, self-induction and technical applications; in the LK also in differential form.',
    ),
    simulations: ['induktion'],
  },
  {
    code: '3.2.4',
    title: L('Schwingungen (Q2)', 'Oscillations (Q2)'),
    summary: L(
      'Harmonische Schwingungen von Feder- und Fadenpendel, Dämpfung, erzwungene Schwingung und Resonanz, elektromagnetischer Schwingkreis.',
      'Harmonic oscillation of spring and simple pendulums, damping, forced oscillation and resonance, the electromagnetic oscillating circuit.',
    ),
    simulations: ['fadenpendel', 'federpendel', 'resonanz'],
  },
];

/** Qualifikationsphase Q3 und Q4 (Kap. 3.2.5–3.2.7). */
const Q34_UNITS: CurriculumUnit[] = [
  {
    code: '3.2.5',
    title: L('Wellen (Q3)', 'Waves (Q3)'),
    summary: L(
      'Ausbreitung und Kenngrößen von Wellen, stehende Wellen, Beugung, Brechung und Interferenz, Interferenz von Licht an Doppelspalt und Gitter.',
      'Propagation and parameters of waves, standing waves, diffraction, refraction and interference, interference of light at a double slit and a grating.',
    ),
    simulations: ['wellen-ausbreitung', 'stehende-wellen', 'interferenz', 'doppelspalt'],
  },
  {
    code: '3.2.6',
    title: L('Quantenobjekte (Q3)', 'Quantum objects (Q3)'),
    summary: L(
      'Fotoeffekt mit Einfluss von Intensität und Frequenz, Photonen, Elektronenbeugung, stochastische Vorhersagbarkeit am Doppelspalt und Grundaspekte der Quantenphysik.',
      'The photoelectric effect with the influence of intensity and frequency, photons, electron diffraction, stochastic predictability at the double slit and basic aspects of quantum physics.',
    ),
    simulations: ['photoeffekt', 'elektronenbeugung', 'doppelspalt'],
  },
  {
    code: '3.2.7',
    title: L('Atome (Q4)', 'Atoms (Q4)'),
    summary: L(
      'Energieniveaus und Linienspektren, quantenmechanisches Atommodell mit Nachweiswahrscheinlichkeiten und optische Spektralanalyse.',
      'Energy levels and line spectra, the quantum model of the atom with detection probabilities and optical spectral analysis.',
    ),
    simulations: ['linienspektren'],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium in Berlin (G8, Abitur nach Jahrgangsstufe 12) nach
 * - „Rahmenlehrplan für die Jahrgangsstufen 7–10, Teil C Physik“ (gelieferte Datei ohne
 *   Titelblatt und Impressum, 53 Seiten), und
 * - „Rahmenlehrplan für die gymnasiale Oberstufe, Teil C Physik“, LISUM, Senatsverwaltung für
 *   Bildung, Jugend und Familie Berlin und Ministerium für Bildung, Jugend und Sport Brandenburg 2021,
 *   gültig für die Qualifikationsphase ab dem Schuljahr 2023/24.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/berlin-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Sek. I in den Doppeljahrgangsstufen 7/8 und 9/10, Oberstufe nach
 * Kurshalbjahren (Q1/Q2 = 11, Q3/Q4 = 12). Die Themenfelder sind im Rahmenlehrplan nummeriert.
 *
 * Überschriften entsprechen den Rahmenlehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const berlinGymnasiumPhysik: StateCurriculum = {
  id: 'berlin-gymnasium-physik',
  subject: 'physik',
  slug: L('berlin-gymnasium', 'berlin-gymnasium'),
  state: L('Berlin', 'Berlin'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Rahmenlehrplan',
  grades: [
    grade(7, KS_7_8, KS_7_8_UNITS),
    grade(8, KS_7_8, KS_7_8_UNITS),
    grade(9, KS_9_10, KS_9_10_UNITS),
    grade(10, KS_9_10, KS_9_10_UNITS),
    grade(11, Q_11, Q12_UNITS),
    grade(12, Q_12, Q34_UNITS),
  ],
};
