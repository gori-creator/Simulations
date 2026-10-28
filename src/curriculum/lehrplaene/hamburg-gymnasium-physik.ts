import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Bildungspläne der Freien und Hansestadt Hamburg. Die Bildungspläne nennen
 * „www.hamburg.de/bildungsplaene“; ein Link zur einzelnen Datei steht im Dokument nicht.
 * Verlinkt ist diese Adresse mit https.
 */
const SOURCE = 'https://www.hamburg.de/bildungsplaene';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/hamburg-gymnasium-physik.md, Teil E).
const NOTE_7 = L(
  'Jahrgangsstufe 7: Die Übersicht des Bildungsplans ordnet die Themen den Jahrgangsstufen 7/8, 8/9 und 10 zu; in 7 stehen die Themen für 7/8. Optik wird vollständig im Fach Naturwissenschaften und Technik (NWT) in 5/6 unterrichtet. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).',
  'Grade 7: the overview in the curriculum assigns the topics to grades 7/8, 8/9 and 10; grade 7 shows the topics for 7/8. Optics is taught entirely in the subject science and technology (NWT) in grades 5/6. The numbers are those of the curriculum (topic field.topic).',
);

const NOTE_8 = L(
  'Jahrgangsstufe 8: Die Themen für 7/8 und für 8/9 überschneiden sich in Jahrgangsstufe 8; deshalb stehen hier beide. Die Reihenfolge der Themen ist zu beachten. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).',
  'Grade 8: the topics for 7/8 and for 8/9 overlap in grade 8, so both are listed here. The order of the topics is to be followed. The numbers are those of the curriculum (topic field.topic).',
);

const NOTE_9 = L(
  'Jahrgangsstufe 9: Themen für 8/9. Alle für den Mittleren Schulabschluss nötigen Inhalte sind bis zum Ende von Jahrgangsstufe 9 eingeführt. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).',
  'Grade 9: topics for 8/9. All content needed for the intermediate school certificate has been introduced by the end of grade 9. The numbers are those of the curriculum (topic field.topic).',
);

const NOTE_10 = L(
  'Jahrgangsstufe 10: Einführung in die Oberstufe am Gymnasium; die Inhalte entsprechen zum Teil schon der Oberstufe. Die Nummern sind die des Bildungsplans (Themenfeld.Thema).',
  'Grade 10: introduction to upper secondary at the Gymnasium; some content already belongs to upper secondary level. The numbers are those of the curriculum (topic field.topic).',
);

const NOTE_S = L(
  'Studienstufe (am Gymnasium mit Abitur nach Klasse 12: Jahrgangsstufen 11 und 12): Der Bildungsplan ordnet alle Themen den Semestern S1–S4 zu, ohne Reihenfolge; die Lernbereiche stehen deshalb bei 11 und 12 gleich und werden als eine Stufe gezeigt. Gravitation und Astrophysik ist ein Wahlthema. eA = nur auf erhöhtem Anforderungsniveau. Die Nummern sind die des Bildungsplans (Themenbereich.Thema).',
  'Studienstufe (at the Gymnasium with Abitur after grade 12: grades 11 and 12): the curriculum assigns all topics to semesters S1–S4, in no fixed order; the units are therefore the same for grades 11 and 12 and are shown as one stage. Gravitation and astrophysics is an elective topic. eA = higher level only. The numbers are those of the curriculum (topic area.topic).',
);

const T_1_1: CurriculumUnit = {
  code: '1.1',
  title: L('Elektrostatik und der Stromkreis als System (7/8)', 'Electrostatics and the circuit as a system (7/8)'),
  summary: L(
    'Reibungselektrizität und zwei Ladungsarten, Elektron und einfaches Atommodell, Leiter und Nichtleiter, Spannung als elektrischer Druckunterschied, Strom im geschlossenen Stromkreis.',
    'Static electricity and two kinds of charge, the electron and a simple atomic model, conductors and insulators, voltage as an electrical pressure difference, current in a closed circuit.',
  ),
  simulations: ['einfacher-stromkreis', 'reihe-parallel'],
};

const T_2_1: CurriculumUnit = {
  code: '2.1',
  title: L('Bewegung, Kraft und Energie (7/8)', 'Motion, force and energy (7/8)'),
  summary: L(
    'Geschwindigkeit aus Tempo und Richtung, gleichförmige Bewegung, t-s- und t-v-Diagramme, Zusatzgeschwindigkeit und Kraft, Verformung und Kraftmessung, Trägheit und Wechselwirkung, einfache Maschinen, Energiebilanzen.',
    'Velocity from speed and direction, uniform motion, distance-time and velocity-time graphs, change of velocity and force, deformation and measuring force, inertia and interaction, simple machines, energy balances.',
  ),
  simulations: ['bewegungsdiagramme', 'hookesches-gesetz', 'hebelgesetz', 'energieerhaltung', 'kraefteaddition', 'schiefe-ebene'],
};

const T_1_2: CurriculumUnit = {
  code: '1.2',
  title: L('Widerstand, Energie und Leistung, Induktion (8/9)', 'Resistance, energy and power, induction (8/9)'),
  summary: L(
    'Elektrischer Widerstand und ohmsches Gesetz, Schaltpläne, Spannungen, Ströme und Leistung von Haushaltsgeräten, elektrische Energie, Generator und Transformator.',
    'Electrical resistance and Ohm’s law, circuit diagrams, voltage, current and power of household appliances, electrical energy, generator and transformer.',
  ),
  simulations: ['einfacher-stromkreis', 'reihe-parallel', 'ohmsches-gesetz', 'induktion'],
};

const T_3_1: CurriculumUnit = {
  code: '3.1',
  title: L('Atomkerne, Kräfte und Radioaktivität (8/9)', 'Atomic nuclei, forces and radioactivity (8/9)'),
  summary: L(
    'Aufbau des Atomkerns, Isotope und Kernkräfte, Strahlungsarten, Spontanzerfall, Aktivität und Halbwertszeit, Absorption, biologische Wirkung und Strahlenschutz, Nutzen und Gefahren.',
    'Structure of the nucleus, isotopes and nuclear forces, types of radiation, spontaneous decay, activity and half-life, absorption, biological effects and radiation protection, benefits and dangers.',
  ),
  simulations: ['radioaktiver-zerfall'],
};

const T_3_2: CurriculumUnit = {
  code: '3.2',
  title: L('Thermische Energie, Strahlungshaushalt und Treibhauseffekt (8/9)', 'Thermal energy, radiation budget and greenhouse effect (8/9)'),
  summary: L(
    'Temperatur als Maß für die Bewegungsenergie der Teilchen, Wärmetransport, elektromagnetisches Spektrum, Strahlungsgleichgewicht der Erde, Atmosphäre und Treibhauseffekt.',
    'Temperature as a measure of the kinetic energy of particles, heat transfer, the electromagnetic spectrum, the Earth’s radiation balance, the atmosphere and the greenhouse effect.',
  ),
  simulations: ['teilchenmodell'],
};

const T_2_2: CurriculumUnit = {
  code: '2.2',
  title: L('Beschleunigte Bewegung und Energieerhaltung (8/9)', 'Accelerated motion and conservation of energy (8/9)'),
  summary: L(
    'Kraftstoß und Beschleunigung, gleichmäßig beschleunigte Bewegung und freier Fall, Reibung, Bewegungsdiagramme mit Messwerterfassung, kinetische und potenzielle Energie, Energieerhaltung.',
    'Impulse and acceleration, uniformly accelerated motion and free fall, friction, motion graphs from measured data, kinetic and potential energy, conservation of energy.',
  ),
  simulations: ['bewegungsdiagramme', 'freier-fall', 'energieerhaltung'],
};

/** Jahrgangsstufe 7: Themen für 7/8. */
const KS_7_UNITS: CurriculumUnit[] = [T_1_1, T_2_1];

/** Jahrgangsstufe 8: Themen für 7/8 und für 8/9. */
const KS_8_UNITS: CurriculumUnit[] = [T_1_1, T_2_1, T_1_2, T_3_1, T_3_2, T_2_2];

/** Jahrgangsstufe 9: Themen für 8/9. */
const KS_9_UNITS: CurriculumUnit[] = [T_1_2, T_3_1, T_3_2, T_2_2];

/** Jahrgangsstufe 10. */
const KS_10_UNITS: CurriculumUnit[] = [
  {
    code: '1.3',
    title: L('Magnetfelder und Elektromagnetismus', 'Magnetic fields and electromagnetism'),
    summary: L(
      'Magnetfelder von geradem Leiter und Spule, Feldlinienmodell und Feldkonzept, Elektromagnet, Relais und Elektromotor, Transport und Speicherung elektrischer Energie.',
      'Magnetic fields of a straight conductor and a coil, the field line model and field concept, electromagnet, relay and electric motor, transport and storage of electrical energy.',
    ),
  },
  {
    code: '2.3',
    title: L('Überlagerte Bewegungen, Kreisbewegung, Impuls und Impulserhaltung, Schwingungen', 'Superposed motion, circular motion, momentum and its conservation, oscillations'),
    summary: L(
      'Waagerechter und senkrechter Wurf mit Superpositionsprinzip, Impuls und Impulserhaltung mit Stößen, Kreisbewegung und Zentripetalkraft, Bezugssysteme, harmonische Schwingungen; optional Satellitenbahnen.',
      'Horizontal and vertical projection with the superposition principle, momentum and its conservation with collisions, circular motion and centripetal force, frames of reference, harmonic oscillation; optionally satellite orbits.',
    ),
    simulations: ['kreisbewegung', 'schiefer-wurf', 'stoesse', 'planetenbahnen', 'fadenpendel', 'federpendel'],
  },
];

/** Studienstufe S1–S4 (Themenbereiche 1–4, Kap. 2.3). */
const S_UNITS: CurriculumUnit[] = [
  {
    code: '1.1',
    title: L('Das Feldkonzept zur Beschreibung von Wechselwirkungen', 'The field concept for describing interactions'),
    summary: L(
      'Elektrische Feldtypen und Feldlinienbilder, Feldstärke und Spannung, Coulombsches Gesetz, Plattenkondensator mit Kapazität und Energie, Auf- und Entladen, magnetische Flussdichte von Spulen.',
      'Types of electric field and field line patterns, field strength and voltage, Coulomb’s law, the parallel-plate capacitor with capacitance and energy, charging and discharging, magnetic flux density of coils.',
    ),
    simulations: ['feldlinien', 'kondensator'],
  },
  {
    code: '1.2',
    title: L('Körper in statischen Feldern', 'Bodies in static fields'),
    summary: L(
      'Kräfte und Bahnen geladener Teilchen im elektrischen Feld, Lorentzkraft und Kreisbahnen im Magnetfeld, Hall-Effekt, Teilchen in senkrecht zueinander stehenden Feldern.',
      'Forces on and paths of charged particles in electric fields, the Lorentz force and circular paths in magnetic fields, the Hall effect, particles in perpendicular fields.',
    ),
    simulations: ['lorentzkraft'],
  },
  {
    code: '1.3',
    title: L('Veränderliche elektromagnetische Felder', 'Changing electromagnetic fields'),
    summary: L(
      'Magnetischer Fluss und Induktionsgesetz, Lenzsche Regel, technische Anwendungen; eA: differenzielle Form, Induktivität und Selbstinduktion.',
      'Magnetic flux and the law of induction, Lenz’s law, technical applications; eA: differential form, inductance and self-induction.',
    ),
    simulations: ['induktion'],
  },
  {
    code: '2.1',
    title: L('Schwingungen', 'Oscillations'),
    summary: L(
      'Lineares Kraftgesetz und harmonische Schwingung, schwache Dämpfung, Resonanz bei erzwungenen Schwingungen, elektromagnetischer Schwingkreis im Vergleich.',
      'Linear force law and harmonic oscillation, weak damping, resonance in forced oscillation, the electromagnetic oscillating circuit by comparison.',
    ),
    simulations: ['fadenpendel', 'federpendel', 'resonanz'],
  },
  {
    code: '2.2',
    title: L('Eigenschaften und Ausbreitung von Wellen', 'Properties and propagation of waves'),
    summary: L(
      'Erzeugung und Ausbreitung harmonischer Wellen, Transversal- und Longitudinalwellen, Ausbreitungsgeschwindigkeit und Wellenlänge, Beugung, Reflexion und Brechung, Polarisation, elektromagnetisches Spektrum.',
      'Generation and propagation of harmonic waves, transverse and longitudinal waves, speed and wavelength, diffraction, reflection and refraction, polarisation, the electromagnetic spectrum.',
    ),
    simulations: ['wellen-ausbreitung'],
  },
  {
    code: '2.3',
    title: L('Überlagerung von Wellen', 'Superposition of waves'),
    summary: L(
      'Superposition und Interferenz, Doppelspalt mit ein- und mehrfarbigem Licht, Wellenlängenbestimmung, Einzelspalt und Interferometer, stehende Wellen.',
      'Superposition and interference, the double slit with monochromatic and white light, measuring wavelength, single slit and interferometer, standing waves.',
    ),
    simulations: ['interferenz', 'doppelspalt', 'stehende-wellen'],
  },
  {
    code: '3.1',
    title: L('Quantenobjekte', 'Quantum objects'),
    summary: L(
      'Elektron und Photon als Quantenobjekte, stochastische Vorhersagbarkeit, Fotoeffekt und h-Bestimmung, De-Broglie-Beziehung, Unbestimmtheit; eA: Verschränkung.',
      'Electron and photon as quantum objects, stochastic predictability, the photoelectric effect and measuring h, the de Broglie relation, uncertainty; eA: entanglement.',
    ),
    simulations: ['doppelspalt', 'photoeffekt', 'elektronenbeugung'],
  },
  {
    code: '3.2',
    title: L('Atomvorstellungen', 'Models of the atom'),
    summary: L(
      'Energiestufenmodell, Emission und Absorption von Photonen, Linienspektren, Röntgenspektrum, Orbitale und Nachweiswahrscheinlichkeiten.',
      'The energy level model, emission and absorption of photons, line spectra, the X-ray spectrum, orbitals and detection probabilities.',
    ),
    simulations: ['linienspektren'],
  },
  {
    code: '4.1',
    title: L('Planetenbewegungen (Wahlthema)', 'Planetary motion (elective topic)'),
    summary: L(
      'Gravitationskraft und Gravitationsfeld, Keplersche Gesetze, Bahnen, Umlaufzeiten und Zentralkörpermassen; eA: Gravitationspotenzial und Fluchtgeschwindigkeiten.',
      'Gravitational force and field, Kepler’s laws, orbits, periods and central masses; eA: gravitational potential and escape velocities.',
    ),
    simulations: ['planetenbahnen'],
  },
  {
    code: '4.2',
    title: L('Aspekte der Astrophysik (Wahlthema)', 'Aspects of astrophysics (elective topic)'),
    summary: L(
      'Himmelsbeobachtung und Instrumente, Raumzeit, Sternentwicklung und schwarze Löcher, Gravitationswellen, Skalen im Universum, Strahlungsbilanzen von Planeten.',
      'Observing the sky and instruments, spacetime, stellar evolution and black holes, gravitational waves, scales in the universe, radiation budgets of planets.',
    ),
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium in Hamburg (G8, Abitur nach Jahrgangsstufe 12) nach
 * - „Bildungsplan Gymnasium Sekundarstufe I, Physik“, Behörde für Schule und Berufsbildung,
 *   Hamburg 2024 (Redaktion 2022), und
 * - „Bildungsplan Studienstufe, Physik“, Behörde für Schule und Berufsbildung, Hamburg 2022.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/hamburg-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Sek. I nach der Übersicht der Themen (7/8, 8/9, 10; 8 mit beiden),
 * Studienstufe als eine Stufe 11/12. Optik ist ganz in NWT (5/6) verschoben.
 *
 * Überschriften entsprechen den Bildungsplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const hamburgGymnasiumPhysik: StateCurriculum = {
  id: 'hamburg-gymnasium-physik',
  subject: 'physik',
  slug: L('hamburg-gymnasium', 'hamburg-gymnasium'),
  state: L('Hamburg', 'Hamburg'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Bildungsplan',
  grades: [
    grade(7, NOTE_7, KS_7_UNITS),
    grade(8, NOTE_8, KS_8_UNITS),
    grade(9, NOTE_9, KS_9_UNITS),
    grade(10, NOTE_10, KS_10_UNITS),
    grade(11, NOTE_S, S_UNITS),
    grade(12, NOTE_S, S_UNITS),
  ],
};
