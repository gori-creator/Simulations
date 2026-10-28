import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Der Senator für Kinder und Bildung, Bremen. Die Bildungspläne nennen
 * „http://www.bildung.bremen.de“ als Herausgeber-Adresse; ein Link zur einzelnen Datei steht
 * im Dokument nicht. Verlinkt ist diese Adresse mit https.
 */
const SOURCE = 'https://www.bildung.bremen.de';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/bremen-gymnasium-physik.md, Teil E).
const KS_7_9 = L(
  'Jahrgangsstufen 7 bis 9: Fünf Rahmenthemen in der vom Bildungsplan festgelegten Reihenfolge, alle für 7/8/9 ausgewiesen; die Lernbereiche stehen deshalb bei 7, 8 und 9 gleich und werden als eine Stufe gezeigt. In 5/6 ist Physik Teil des Fachs Naturwissenschaft. Die Nummern sind die des Bildungsplans.',
  'Grades 7 to 9: five framework topics in the order set by the curriculum, all listed for 7/8/9; the units are therefore the same for grades 7, 8 and 9 and are shown as one stage. In grades 5/6 physics is part of the subject science. The numbers are those of the curriculum.',
);

const EP = L(
  'Einführungsphase der gymnasialen Oberstufe (am Gymnasium Jahrgangsstufe 10) mit den Inhaltsbereichen Mechanik und Energie. Die Codes sind die des Bildungsplans.',
  'Introductory phase of upper secondary (at the Gymnasium grade 10) with the content areas mechanics and energy. The codes are those of the curriculum.',
);

const QP = L(
  'Qualifikationsphase (am Gymnasium Jahrgangsstufen 11 und 12): Kernbausteine ohne vorgegebene Reihenfolge; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. Erweiterungsbausteine ergänzen die Kernbausteine. LK = nur im Leistungskurs. Die Nummern sind die des Bildungsplans.',
  'Qualification phase (at the Gymnasium grades 11 and 12): core modules in no fixed order; the units are therefore the same for grades 11 and 12 and are shown as one stage. Extension modules complement the core modules. LK = advanced course only. The numbers are those of the curriculum.',
);

/** Jahrgangsstufen 7–9, Rahmenthemen 1–5. */
const KS_7_9_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Sichtbare und unsichtbare Strahlung', 'Visible and invisible radiation'),
    summary: L(
      'Modell Lichtstrahl, Sehvorgang, Mondphasen und Finsternisse, Reflexion und Brechung, Linsen und Linsengleichung, Auge, Farben, Wärmestrahlung und Wärmetransport im Teilchenmodell.',
      'The light-ray model, how we see, phases of the moon and eclipses, reflection and refraction, lenses and the lens equation, the eye, colours, thermal radiation and heat transfer in the particle model.',
    ),
    simulations: ['licht-schatten', 'reflexion', 'brechung', 'linsen', 'teilchenmodell'],
  },
  {
    code: '2',
    title: L('Kräfte und Bewegung', 'Forces and motion'),
    summary: L(
      'Geschwindigkeit und Zeit-Weg-Diagramme, Masse und Gewichtskraft, Kräfte als Pfeile, Kraft als Ursache von Bewegungsänderung und Verformung, Trägheit und Reibung, Energie, Arbeit und Leistung.',
      'Velocity and distance–time graphs, mass and weight, forces as arrows, force as the cause of change in motion and deformation, inertia and friction, energy, work and power.',
    ),
    simulations: ['bewegungsdiagramme', 'hookesches-gesetz', 'kraefteaddition', 'energieerhaltung'],
  },
  {
    code: '3',
    title: L('Elektrizität – Elektrostatik und Stromkreise', 'Electricity – electrostatics and circuits'),
    summary: L(
      'Elektrostatische Grundphänomene und Ladung, Spannung, Stromstärke und Widerstand, Kennlinien, Reihen- und Parallelschaltung, elektrische Leistung und Energie, Sicherheit.',
      'Basic electrostatic phenomena and charge, voltage, current and resistance, characteristic curves, series and parallel circuits, electrical power and energy, safety.',
    ),
    simulations: ['einfacher-stromkreis', 'reihe-parallel', 'ohmsches-gesetz'],
  },
  {
    code: '4',
    title: L('Elektromagnetismus', 'Electromagnetism'),
    summary: L(
      'Magnetische Grundphänomene und Elementarmagnete, Magnetfelder von Magneten, Erde und Spule, Elektromagnet und Elektromotor, Induktion, Generator und Transformator.',
      'Basic magnetic phenomena and elementary magnets, magnetic fields of magnets, the Earth and coils, the electromagnet and electric motor, induction, generator and transformer.',
    ),
    simulations: ['induktion'],
  },
  {
    code: '5',
    title: L('Strahlung und Radioaktivität', 'Radiation and radioactivity'),
    summary: L(
      'Elektromagnetisches Spektrum, Atomkern, radioaktiver Zerfall und Strahlungsarten, Nachweis, Halbwertszeit und Aktivität, Kernspaltung und Kernfusion, Strahlenschutz und Kernenergie.',
      'The electromagnetic spectrum, the nucleus, radioactive decay and types of radiation, detection, half-life and activity, fission and fusion, radiation protection and nuclear energy.',
    ),
    simulations: ['radioaktiver-zerfall'],
  },
];

/** Einführungsphase (Kap. 3.1). */
const EP_UNITS: CurriculumUnit[] = [
  {
    code: 'E1',
    title: L('Mechanik', 'Mechanics'),
    summary: L(
      'Gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall, Wurfbewegungen, Addition und Zerlegung von Kräften an der schiefen Ebene, Impuls und Impulserhaltung, Kreisbewegung und Zentripetalkraft, Messunsicherheiten.',
      'Uniform and uniformly accelerated motion, free fall, projectile motion, adding and resolving forces on an inclined plane, momentum and its conservation, circular motion and centripetal force, measurement uncertainty.',
    ),
    simulations: ['bewegungsdiagramme', 'freier-fall', 'kraefteaddition', 'schiefe-ebene', 'kreisbewegung', 'stoesse', 'schiefer-wurf'],
  },
  {
    code: 'E2',
    title: L('Energie', 'Energy'),
    summary: L(
      'Energieerhaltung und Energieentwertung mit den Hauptsätzen der Thermodynamik, Wärme und Arbeit, Wirkungsgrad von Wärmekraftmaschinen und Wärmepumpen, Verfahren der Energiegewinnung.',
      'Conservation and dissipation of energy with the laws of thermodynamics, heat and work, efficiency of heat engines and heat pumps, ways of generating energy.',
    ),
    simulations: ['energieerhaltung', 'gasgesetze'],
  },
];

/** Qualifikationsphase, Kernbausteine 1–8 (Kap. 3.2). */
const QP_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Elektrisches Feld', 'Electric field'),
    summary: L(
      'Feldlinienmodell und Feldlinienbilder, Feldstärke, Plattenkondensator mit Kapazität und Energie, Auf- und Entladen; Erweiterung: Gravitationsfeld mit Satelliten- und Planetenbahnen (ohne Keplersche Gesetze).',
      'The field line model and field line patterns, field strength, the parallel-plate capacitor with capacitance and energy, charging and discharging; extension: the gravitational field with satellite and planetary orbits (without Kepler’s laws).',
    ),
    simulations: ['planetenbahnen', 'feldlinien', 'kondensator'],
  },
  {
    code: '2',
    title: L('Magnetisches Feld', 'Magnetic field'),
    summary: L(
      'Magnetische Feldlinienbilder und Flussdichte, Lorentzkraft und Kreisbahnen, Teilchen in senkrecht zueinander stehenden Feldern, Induktionsgesetz; LK: differenzielle Form und Selbstinduktion.',
      'Magnetic field line patterns and flux density, the Lorentz force and circular paths, particles in perpendicular fields, the law of induction; LK: differential form and self-induction.',
    ),
    simulations: ['induktion', 'lorentzkraft'],
  },
  {
    code: '3',
    title: L('Mechanische Schwingungen & Wellen', 'Mechanical oscillations and waves'),
    summary: L(
      'Feder- und Fadenpendel, erzwungene Schwingung, Dämpfung und Resonanz, Wellenausbreitung, Überlagerung und stehende Wellen; Erweiterung: Akustik und Doppler-Effekt.',
      'Spring and simple pendulums, forced oscillation, damping and resonance, wave propagation, superposition and standing waves; extension: acoustics and the Doppler effect.',
    ),
    simulations: ['fadenpendel', 'federpendel', 'resonanz', 'wellen-ausbreitung', 'doppler-effekt', 'interferenz', 'stehende-wellen'],
  },
  {
    code: '4',
    title: L('Elektromagnetische Schwingungen', 'Electromagnetic oscillations'),
    summary: L('Harmonische elektromagnetische Schwingungen, Schwingkreis, Ausbreitung und Spektrum elektromagnetischer Wellen.', 'Harmonic electromagnetic oscillations, the oscillating circuit, propagation and spectrum of electromagnetic waves.'),
  },
  {
    code: '5',
    title: L('Wellenoptik', 'Wave optics'),
    summary: L('Licht als Welle, Huygenssches Prinzip und Beugung, Interferenz an Doppelspalt und Gitter, Polarisation; LK: Einzelspalt und Interferometer.', 'Light as a wave, Huygens’ principle and diffraction, interference at a double slit and a grating, polarisation; LK: single slit and interferometer.'),
    simulations: ['interferenz', 'doppelspalt'],
  },
  {
    code: '6',
    title: L('Quantenobjekte', 'Quantum objects'),
    summary: L('Fotoeffekt, Photonen und Elektronen als Quantenobjekte, Elektronenbeugung, Doppelspalt mit Elektronen.', 'The photoelectric effect, photons and electrons as quantum objects, electron diffraction, the double slit with electrons.'),
    simulations: ['doppelspalt', 'photoeffekt', 'elektronenbeugung'],
  },
  {
    code: '7',
    title: L('Quantenphysik der Atomhülle', 'Quantum physics of the atomic shell'),
    summary: L('Energieniveaus und Linienspektren, quantenmechanische Atomvorstellung.', 'Energy levels and line spectra, the quantum view of the atom.'),
    simulations: ['linienspektren'],
  },
  {
    code: '8',
    title: L('Struktur der Materie (LK)', 'Structure of matter (LK)'),
    summary: L('LK: Bausteine der Materie, Kernmasse und Kernradius, Paarbildung, Quarks und Teilchenzoo.', 'LK: building blocks of matter, nuclear mass and radius, pair production, quarks and the particle zoo.'),
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium in Bremen (Abitur nach Jahrgangsstufe 12) nach
 * - „Naturwissenschaften (Naturwissenschaft, Biologie, Chemie, Physik), Bildungsplan für das
 *   Gymnasium“, Teil Physik 7–9, Der Senator für Kinder und Bildung, Stand 08/2026, und
 * - „Physik, Bildungsplan für die Gymnasiale Oberstufe – Einführungsphase und
 *   Qualifikationsphase –“, Stand Juli 2026.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/bremen-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): 7–9 als eine Stufe, Einführungsphase = 10, Qualifikationsphase = 11/12.
 *
 * Überschriften entsprechen den Bildungsplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const bremenGymnasiumPhysik: StateCurriculum = {
  id: 'bremen-gymnasium-physik',
  subject: 'physik',
  slug: L('bremen-gymnasium', 'bremen-gymnasium'),
  state: L('Bremen', 'Bremen'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Bildungsplan',
  grades: [
    grade(7, KS_7_9, KS_7_9_UNITS),
    grade(8, KS_7_9, KS_7_9_UNITS),
    grade(9, KS_7_9, KS_7_9_UNITS),
    grade(10, EP, EP_UNITS),
    grade(11, QP, QP_UNITS),
    grade(12, QP, QP_UNITS),
  ],
};
