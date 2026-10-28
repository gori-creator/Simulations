import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Fachanforderungen-Portal des Landes Schleswig-Holstein. Die Fachanforderungen nennen
 * „www.fachanforderungen.de“ (Bestellungen) und „www.schleswig-holstein.de“; ein Link zur
 * einzelnen Datei steht im Dokument nicht. Verlinkt ist das Portal mit https.
 */
const SOURCE = 'https://www.fachanforderungen.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/schleswig-holstein-gymnasium-physik.md, Teil E).
const SEK_I = L(
  'Sekundarstufe I (hier Jahrgangsstufen 7 bis 10): Die Fachanforderungen verzichten ausdrücklich auf eine Zuordnung der Inhalte zu Jahrgangsstufen; der Einstieg in den Physikunterricht ist von Schule zu Schule verschieden. Vorgegeben ist nur, dass die Themen aus Block I vor denen aus Block II unterrichtet werden. Die Lernbereiche stehen deshalb bei 7 bis 10 gleich und werden als eine Stufe gezeigt (Annahme, Entwurf, bitte am Lehrplan prüfen). Lernbereiche sind die fünf Themen und Inhalte, Unterbereiche ihre Themen; die Nummern sind von uns vergeben.',
  'Lower secondary (here grades 7 to 10): the subject requirements explicitly do not assign content to grades; schools start physics at different times. The only rule is that the topics of block I come before those of block II. The units are therefore the same for grades 7 to 10 and are shown as one stage (assumption, draft, please check against the curriculum). Units are the five content areas, sub-units their topics; the numbers are our own.',
);

const EP = L(
  'Einführungsphase der Oberstufe (G9: Jahrgangsstufe 11). In der Einführungsphase wird Dynamik einschließlich Kinematik unterrichtet, höchstens in der Hälfte der Lernzeit; Felder, Schwingungen und Wellen sowie Quantenphysik beginnen schon hier und gehen in der Qualifikationsphase weiter. Inhalte über das grundlegende Niveau hinaus sind für das erhöhte Niveau verbindlich. Die Nummern sind von uns vergeben.',
  'Introductory phase of upper secondary (G9: grade 11). Dynamics including kinematics is taught here, in at most half of the time; fields, oscillations and waves, and quantum physics already start here and continue in the qualification phase. Content beyond the basic level is compulsory at the higher level. The numbers are our own.',
);

const QP = L(
  'Qualifikationsphase der Oberstufe (G9: Jahrgangsstufen 12 und 13). Die Fachanforderungen lassen verschiedene Reihenfolgen zu; die Lernbereiche stehen deshalb bei 12 und 13 gleich und werden als eine Stufe gezeigt. Vertiefungsthemen oder Kontexte sind nur Beispiele. Die Nummern sind von uns vergeben.',
  'Qualification phase of upper secondary (G9: grades 12 and 13). The subject requirements allow different orders, so the units are the same for grades 12 and 13 and are shown as one stage. Topics for deeper study or contexts are only examples. The numbers are our own.',
);

/** Sekundarstufe I, Themen und Inhalte (Kap. II.2.1 und II.3). */
const SEK_I_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Energie', 'Energy'),
    summary: L(
      'Qualitativer Energiebegriff mit Energieformen und Wärmetransport (Block I), quantitativer Energiebegriff und Energieversorgung (Block II).',
      'Qualitative concept of energy with forms of energy and heat transfer (block I), quantitative concept of energy and energy supply (block II).',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Qualitativer Energiebegriff (Block I)', 'Qualitative concept of energy (block I)'),
        summary: L(
          'Energieformen im Alltag, Umwandlung, Erhaltung und Entwertung, Wärmeleitung, Konvektion und Wärmestrahlung, Wärmedämmung.',
          'Forms of energy in everyday life, conversion, conservation and degradation, conduction, convection and radiation, insulation.',
        ),
        simulations: ['energieerhaltung'],
      },
      {
        code: '1.2',
        title: L('Quantitativer Energiebegriff (Block II)', 'Quantitative concept of energy (block II)'),
        summary: L(
          'Potenzielle, kinetische, elektrische und thermische Energie berechnen, Energieerhaltung, Wirkungsgrad und Leistung.',
          'Calculating potential, kinetic, electrical and thermal energy, conservation of energy, efficiency and power.',
        ),
        simulations: ['energieerhaltung'],
      },
      {
        code: '1.3',
        title: L('Herausforderungen der Energieversorgung (Block II)', 'Challenges of energy supply (block II)'),
        summary: L(
          'Arten der Energieversorgung vergleichen und bewerten, Transport und Speicherung, regenerative Energien und verantwortungsvoller Umgang mit Energie.',
          'Comparing and evaluating energy supply, transport and storage, renewable energy and responsible use of energy.',
        ),
      },
    ],
  },
  {
    code: '2',
    title: L('Elektrizitätslehre und Magnetismus', 'Electricity and magnetism'),
    summary: L(
      'Einfache Stromkreise und Permanentmagnetismus (Block I), Stromstärke, Spannung und Elektromagnetismus (Block II).',
      'Simple circuits and permanent magnetism (block I), current, voltage and electromagnetism (block II).',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Einfache elektrische Stromkreise (Block I)', 'Simple electric circuits (block I)'),
        summary: L(
          'Leiter und Isolatoren, Schaltzeichen und Schaltpläne, Reihen- und Parallelschaltung, Transport von Ladung und Energie.',
          'Conductors and insulators, circuit symbols and diagrams, series and parallel circuits, transport of charge and energy.',
        ),
        simulations: ['einfacher-stromkreis', 'reihe-parallel'],
      },
      {
        code: '2.2',
        title: L('Permanentmagnetismus (Block I)', 'Permanent magnetism (block I)'),
        summary: L('Magnetische Pole, Anziehung und Abstoßung, Magnetisierbarkeit und Magnetfelder.', 'Magnetic poles, attraction and repulsion, magnetisability and magnetic fields.'),
      },
      {
        code: '2.3',
        title: L('Stromstärke und Spannung (Block II)', 'Current and voltage (block II)'),
        summary: L(
          'Stromstärke und Spannung messen und berechnen, Ladung, Energie und Leistung, Knoten- und Maschenregel, Widerstand und Ohm’sches Gesetz.',
          'Measuring and calculating current and voltage, charge, energy and power, the junction and loop rules, resistance and Ohm’s law.',
        ),
        simulations: ['ohmsches-gesetz', 'reihe-parallel', 'einfacher-stromkreis'],
      },
      {
        code: '2.4',
        title: L('Elektromagnetismus (Block II)', 'Electromagnetism (block II)'),
        summary: L(
          'Magnetfeld von Leiter und Spule, Induktion, Elektromotor, Generator, Transformator und Hochspannungsleitung.',
          'Magnetic field of a wire and a coil, induction, electric motor, generator, transformer and power lines.',
        ),
        simulations: ['induktion'],
      },
    ],
  },
  {
    code: '3',
    title: L('Elektromagnetische Strahlung', 'Electromagnetic radiation'),
    summary: L(
      'Licht- und Wärmestrahlung im Strahlenmodell, Schatten, Reflexion und Temperatur (Block I), Brechung und Linsen, Spektrum und Klimaphysik (Block II).',
      'Light and thermal radiation in the ray model, shadows, reflection and temperature (block I), refraction and lenses, spectrum and climate physics (block II).',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Ausbreitung von Licht- und Wärmestrahlung, Strahlenmodell (Block I)', 'Propagation of light and thermal radiation, ray model (block I)'),
        summary: L('Licht- und Wärmeausbreitung im Strahlenmodell, selbstleuchtende und beleuchtete Körper, Sender-Empfänger-Modell des Sehens.', 'Propagation of light and heat in the ray model, luminous and illuminated bodies, the sender–receiver model of vision.'),
        simulations: ['licht-schatten'],
      },
      {
        code: '3.2',
        title: L('Wechselwirkung von Strahlung und Materie (Block I)', 'Interaction of radiation and matter (block I)'),
        summary: L(
          'Schatten, Finsternisse und Mondphasen, Lochblende, Reflexionsgesetz, Temperatur, Ausdehnung und Aggregatzustände im einfachen Teilchenmodell.',
          'Shadows, eclipses and phases of the moon, the pinhole camera, the law of reflection, temperature, expansion and states of matter in the simple particle model.',
        ),
        simulations: ['licht-schatten', 'reflexion', 'teilchenmodell'],
      },
      {
        code: '3.3',
        title: L('Lichtbrechung und optische Abbildungen (Block II)', 'Refraction and optical images (block II)'),
        summary: L('Brechung an Grenzflächen und Totalreflexion, Sammel- und Zerstreuungslinsen, Brennweite, Bildkonstruktion und optische Geräte.', 'Refraction at boundaries and total internal reflection, converging and diverging lenses, focal length, image construction and optical instruments.'),
        simulations: ['brechung', 'linsen'],
      },
      {
        code: '3.4',
        title: L('Spektrum und Wellenlänge (Block II)', 'Spectrum and wavelength (block II)'),
        summary: L('Spektralfarben, Farbaddition und -subtraktion, Absorption und Transmission, nicht sichtbare Bereiche und Sensoren.', 'Spectral colours, additive and subtractive mixing, absorption and transmission, invisible ranges and sensors.'),
      },
      {
        code: '3.5',
        title: L('Klimaphysik (Block II)', 'Climate physics (block II)'),
        summary: L('Strahlungshaushalt der Erde, Albedo, natürlicher und anthropogener Treibhauseffekt und Rückkopplungen.', 'The Earth’s radiation budget, albedo, the natural and anthropogenic greenhouse effect and feedbacks.'),
      },
    ],
  },
  {
    code: '4',
    title: L('Mechanik', 'Mechanics'),
    summary: L('Dichte, Kinematik und Statik (Block I) sowie Dynamik (Block II).', 'Density, kinematics and statics (block I) and dynamics (block II).'),
    parts: [
      {
        code: '4.1',
        title: L('Dichte (Block I)', 'Density (block I)'),
        summary: L('Masse, Volumen und Dichte, Schwimmen, Schweben und Sinken.', 'Mass, volume and density, floating, hovering and sinking.'),
      },
      {
        code: '4.2',
        title: L('Kinematik (Block I)', 'Kinematics (block I)'),
        summary: L('Geschwindigkeit als gerichtete Größe, Durchschnitts- und Momentangeschwindigkeit, gleichförmige und ungleichförmige Bewegung in Zeit-Weg- und Zeit-Geschwindigkeits-Diagrammen.', 'Velocity as a vector, average and instantaneous speed, uniform and non-uniform motion in distance–time and velocity–time graphs.'),
        simulations: ['bewegungsdiagramme'],
      },
      {
        code: '4.3',
        title: L('Statik (Block I)', 'Statics (block I)'),
        summary: L('Kräfte mit Federn messen, Gewichtskraft und Ortsfaktor, Kraft als gerichtete Größe und Kräfteaddition.', 'Measuring forces with springs, weight and gravitational field strength, force as a vector and adding forces.'),
        simulations: ['hookesches-gesetz', 'kraefteaddition'],
      },
      {
        code: '4.4',
        title: L('Dynamik (Block II)', 'Dynamics (block II)'),
        summary: L('Trägheitsprinzip, Kraft als Ursache von Geschwindigkeitsänderungen, Reibung und Energiebilanzen, qualitativ; Impuls als Ergänzung.', 'The principle of inertia, force as the cause of changes in velocity, friction and energy balances, qualitatively; momentum as an extension.'),
        simulations: ['energieerhaltung', 'stoesse'],
      },
    ],
  },
  {
    code: '5',
    title: L('Radioaktivität und ionisierende Strahlung', 'Radioactivity and ionising radiation'),
    summary: L('Ionisierende Strahlung, radioaktiver Zerfall und Kernenergie (Block II).', 'Ionising radiation, radioactive decay and nuclear energy (block II).'),
    parts: [
      {
        code: '5.1',
        title: L('Ionisierende Strahlung (Block II)', 'Ionising radiation (block II)'),
        summary: L('α-, β- und γ-Strahlung, Nachweis, Abschirmung, Nutzung und biologische Wirkung.', 'Alpha, beta and gamma radiation, detection, shielding, uses and biological effects.'),
      },
      {
        code: '5.2',
        title: L('Radioaktiver Zerfall (Block II)', 'Radioactive decay (block II)'),
        summary: L('Kernbausteine und Isotope, Aktivität, Halbwertszeit, Zerfallsgesetz und Zerfallsreihen, Lagerung radioaktiver Abfälle.', 'Nucleons and isotopes, activity, half-life, the decay law and decay chains, storage of radioactive waste.'),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: '5.3',
        title: L('Kernenergie (Block II)', 'Nuclear energy (block II)'),
        summary: L('Kernspaltung und Kettenreaktion, Kernfusion in Reaktoren und Sonne, Chancen und Risiken.', 'Nuclear fission and chain reactions, fusion in reactors and the Sun, opportunities and risks.'),
      },
    ],
  },
];

/** Inhaltsbereiche Felder, Schwingungen und Wellen, Quantenphysik (Kap. III.2.3.2–2.3.4), Einführungs- und Qualifikationsphase. */
const FELDER: CurriculumUnit = {
  code: 'F',
  title: L('Elektrische und magnetische Felder', 'Electric and magnetic fields'),
  summary: L(
    'Feldkonzept, Körper in statischen Feldern und veränderliche elektromagnetische Felder.',
    'The field concept, bodies in static fields and changing electromagnetic fields.',
  ),
  parts: [
    {
      code: 'F.1',
      title: L('Das Feldkonzept zur Beschreibung von Wechselwirkungen', 'The field concept for describing interactions'),
      summary: L(
        'Elektrisches, Magnet- und Gravitationsfeld, Ladung und Influenz, Feldstärke, Feld- und Äquipotenziallinien, Coulomb- und Gravitationsgesetz, Potenzial, Plattenkondensator mit Kapazität, Energie und Auf- und Entladung, magnetische Flussdichte.',
        'Electric, magnetic and gravitational fields, charge and induced charge, field strength, field lines and equipotentials, Coulomb’s law and the law of gravitation, potential, the parallel-plate capacitor with capacitance, energy and charging and discharging, magnetic flux density.',
      ),
      simulations: ['feldlinien', 'kondensator'],
    },
    {
      code: 'F.2',
      title: L('Körper in statischen Feldern', 'Bodies in static fields'),
      summary: L(
        'Ladungen im elektrischen und magnetischen Feld, Lorentzkraft und Hall-Effekt, Kreisbewegungen mit Zentripetalkraft, auch im Gravitationsfeld, e/m-Bestimmung, Beschleuniger und Massenspektrometer.',
        'Charges in electric and magnetic fields, the Lorentz force and the Hall effect, circular motion with centripetal force, also in gravitational fields, measuring e/m, accelerators and mass spectrometers.',
      ),
      simulations: ['lorentzkraft', 'kreisbewegung', 'planetenbahnen'],
    },
    {
      code: 'F.3',
      title: L('Veränderliche elektromagnetische Felder', 'Changing electromagnetic fields'),
      summary: L(
        'Magnetischer Fluss und Induktionsgesetz, Induktivität und Selbstinduktion, Ein- und Ausschaltvorgänge, technische Anwendungen und Schwingkreise.',
        'Magnetic flux and the law of induction, inductance and self-induction, switching on and off, technical applications and LC circuits.',
      ),
      simulations: ['induktion'],
    },
  ],
};

const WELLEN: CurriculumUnit = {
  code: 'W',
  title: L('Mechanische und elektromagnetische Schwingungen und Wellen', 'Mechanical and electromagnetic oscillations and waves'),
  summary: L(
    'Schwingungen, Ausbreitung und Überlagerung von Wellen sowie Spektren.',
    'Oscillations, propagation and superposition of waves, and spectra.',
  ),
  parts: [
    {
      code: 'W.1',
      title: L('Mechanische und elektromagnetische Schwingungen', 'Mechanical and electromagnetic oscillations'),
      summary: L('Kenngrößen, Schwingungsgleichung und lineares Kraftgesetz, gedämpfte und erzwungene Schwingungen mit Resonanz, energetischer Vergleich.', 'Parameters, the equation of oscillation and the linear force law, damped and forced oscillations with resonance, energy comparison.'),
      simulations: ['fadenpendel', 'federpendel', 'resonanz'],
    },
    {
      code: 'W.2',
      title: L('Eigenschaften und Ausbreitung von Wellen', 'Properties and propagation of waves'),
      summary: L('Wellenlänge, Frequenz und Geschwindigkeit, Huygens’sches Prinzip, Beugung und Brechung, Transversal- und Longitudinalwellen, Dopplereffekt (qualitativ) und Polarisation.', 'Wavelength, frequency and speed, Huygens’ principle, diffraction and refraction, transverse and longitudinal waves, the Doppler effect (qualitative) and polarisation.'),
      simulations: ['wellen-ausbreitung', 'doppler-effekt'],
    },
    {
      code: 'W.3',
      title: L('Überlagerung von Wellen', 'Superposition of waves'),
      summary: L('Superposition und Interferenz an Doppelspalt, Gitter und Einzelspalt, Interferometer und stehende Wellen.', 'Superposition and interference at double slits, gratings and single slits, interferometers and standing waves.'),
      simulations: ['interferenz', 'doppelspalt', 'stehende-wellen'],
    },
    {
      code: 'W.4',
      title: L('Spektren', 'Spectra'),
      summary: L('Farben, elektromagnetisches Spektrum, Emissions- und Absorptionsspektren, diskrete und kontinuierliche Spektren.', 'Colours, the electromagnetic spectrum, emission and absorption spectra, discrete and continuous spectra.'),
      simulations: ['linienspektren'],
    },
  ],
};

const QUANTEN: CurriculumUnit = {
  code: 'Q',
  title: L('Quantenphysik und Materie', 'Quantum physics and matter'),
  summary: L('Quantenobjekte und Atomvorstellungen.', 'Quantum objects and models of the atom.'),
  parts: [
    {
      code: 'Q.1',
      title: L('Quantenobjekte', 'Quantum objects'),
      summary: L(
        'Grundaspekte der Quantentheorie, Doppelspalt mit Photonen und Elektronen, Photoeffekt, de-Broglie-Wellenlänge, Röntgenbremsspektrum, Bragg-Reflexion, Compton-Effekt und Unbestimmtheit.',
        'Basic aspects of quantum theory, the double slit with photons and electrons, the photoelectric effect, the de Broglie wavelength, the X-ray bremsstrahlung spectrum, Bragg reflection, the Compton effect and uncertainty.',
      ),
      simulations: ['photoeffekt', 'elektronenbeugung', 'doppelspalt'],
    },
    {
      code: 'Q.2',
      title: L('Atomvorstellungen', 'Models of the atom'),
      summary: L('Quantenmechanisches Atommodell, Orbitale und Energieniveaus des Wasserstoffatoms, Linienspektren, Potenzialtopf, charakteristische Röntgenstrahlung und Pauli-Prinzip.', 'The quantum model of the atom, orbitals and energy levels of hydrogen, line spectra, the potential well, characteristic X-rays and the Pauli principle.'),
      simulations: ['linienspektren'],
    },
  ],
};

/** Einführungsphase: Mechanik (Kap. III.2.3.1) und Beginn der übrigen Inhaltsbereiche (Kap. III.3). */
const EP_UNITS: CurriculumUnit[] = [
  {
    code: 'M',
    title: L('Mechanik: Dynamik inklusive Kinematik', 'Mechanics: dynamics including kinematics'),
    summary: L(
      'Bewegungen beschreiben, Kraft und Trägheit, Reibung, Energie- und Impulserhaltung.',
      'Describing motion, force and inertia, friction, conservation of energy and momentum.',
    ),
    parts: [
      {
        code: 'M.1',
        title: L('Kinematik', 'Kinematics'),
        summary: L('Ort, Zeit, Geschwindigkeit und Beschleunigung, gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall und waagerechter Wurf.', 'Position, time, velocity and acceleration, uniform and uniformly accelerated motion, free fall and horizontal projection.'),
        simulations: ['bewegungsdiagramme', 'freier-fall', 'schiefer-wurf'],
      },
      {
        code: 'M.2',
        title: L('Dynamik', 'Dynamics'),
        summary: L('Masse, Kraft und Beschleunigung, Trägheitsprinzip, Reibungskraft, Energieerhaltung und iterative Vorhersage realer Bewegungen; Kreisbewegungen können hier beginnen.', 'Mass, force and acceleration, the principle of inertia, friction, conservation of energy and iterative prediction of real motion; circular motion can start here.'),
        simulations: ['kraefteaddition', 'schiefe-ebene', 'energieerhaltung', 'kreisbewegung'],
      },
      {
        code: 'M.3',
        title: L('Impuls und Impulserhaltung', 'Momentum and its conservation'),
        summary: L('Impuls als Erhaltungsgröße bei Stößen und Wechselwirkungen.', 'Momentum as a conserved quantity in collisions and interactions.'),
        simulations: ['stoesse'],
      },
    ],
  },
  FELDER,
  WELLEN,
  QUANTEN,
];

/** Qualifikationsphase (Kap. III.3). */
const QP_UNITS: CurriculumUnit[] = [
  FELDER,
  WELLEN,
  QUANTEN,
  {
    code: 'V',
    title: L('Mögliche Vertiefungsthemen oder Kontexte', 'Possible topics for deeper study or contexts'),
    summary: L(
      'Beispiele, auch für ein Profilseminar: Astronomie, Astrophysik, Relativitätstheorie, Kernphysik, Elementarteilchenphysik, Festkörperphysik, Thermodynamik, Klimaphysik, Biophysik, Ozean und Klima, Medizin und Sensorik, Elektromobilität.',
      'Examples, also for a profile seminar: astronomy, astrophysics, relativity, nuclear physics, particle physics, solid-state physics, thermodynamics, climate physics, biophysics, ocean and climate, medicine and sensors, electric mobility.',
    ),
    simulations: ['planetenbahnen', 'radioaktiver-zerfall', 'gasgesetze'],
  },
];

const grade = (n: number, note: Localized, units: CurriculumUnit[]): CurriculumGrade => ({
  grade: n,
  sourceUrl: SOURCE,
  note,
  units: unitsForGrade(physik, n, units),
});

/**
 * Physik am Gymnasium in Schleswig-Holstein (G9, Abitur nach Jahrgangsstufe 13) nach den
 * „Fachanforderungen Physik, Allgemeinbildende Schulen, Sekundarstufe I, Sekundarstufe II“,
 * Ministerium für Bildung, Wissenschaft und Kultur des Landes Schleswig-Holstein,
 * 4. überarbeitete Auflage, Kiel, Juni 2026 (ein Dokument für beide Stufen).
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/schleswig-holstein-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Die Sek. I hat keine Jahrgangszuordnung (Stufe 7–10, Annahme), die
 * Oberstufe Einführungsphase (11) und Qualifikationsphase (12/13). Die Nummern sind selbst vergeben.
 *
 * Überschriften entsprechen den Fachanforderungen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const schleswigHolsteinGymnasiumPhysik: StateCurriculum = {
  id: 'schleswig-holstein-gymnasium-physik',
  subject: 'physik',
  slug: L('schleswig-holstein-gymnasium', 'schleswig-holstein-gymnasium'),
  state: L('Schleswig-Holstein', 'Schleswig-Holstein'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Fachanforderungen',
  grades: [
    grade(7, SEK_I, SEK_I_UNITS),
    grade(8, SEK_I, SEK_I_UNITS),
    grade(9, SEK_I, SEK_I_UNITS),
    grade(10, SEK_I, SEK_I_UNITS),
    grade(11, EP, EP_UNITS),
    grade(12, QP, QP_UNITS),
    grade(13, QP, QP_UNITS),
  ],
};
