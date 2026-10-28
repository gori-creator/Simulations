import type { Localized } from '../../i18n/config';
import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Ministerium für Bildung Rheinland-Pfalz. Der Oberstufenlehrplan (2022) nennt „www.bm.rlp.de“;
 * der Auszug aus dem Rahmenlehrplan Sek. I nennt keine Adresse. Ein Link zur einzelnen Datei
 * steht in keinem Dokument. Verlinkt ist deshalb die Startseite des Ministeriums.
 */
const SOURCE = 'https://bm.rlp.de/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/rheinland-pfalz-gymnasium-physik.md, Teil E).
const SEK_I = L(
  'Klassenstufen 7 bis 10 (Mittelstufe): Der Rahmenlehrplan verteilt die zwölf Themenfelder in fester Reihenfolge auf drei Lernjahre, nennt aber keine Klassenstufen. Die Lernbereiche stehen deshalb bei 7, 8, 9 und 10 gleich und werden als eine Stufe gezeigt (Annahme, Entwurf, bitte am Lehrplan prüfen). Die Themenfelder sind im Lehrplan nummeriert.',
  'Grades 7 to 10 (lower secondary): the framework curriculum spreads its twelve topic fields over three years of physics in a fixed order but names no grades. The units are therefore the same for grades 7, 8, 9 and 10 and are shown as one stage (assumption, draft, please check against the curriculum). The topic fields are numbered in the curriculum.',
);

const EP = L(
  'Einführungsphase der Mainzer Studienstufe (Jahrgangsstufe 11). Lernbereiche sind die Pflicht- und Wahlpflichtbausteine; im Grundfach (GF) ist einer, im Leistungsfach (LF) sind zwei der Wahlpflichtbausteine zu wählen. Der Lehrplan nummeriert die Bausteine nicht; die Nummern sind von uns vergeben.',
  'Introductory phase of the Mainz upper secondary (grade 11). Units are the compulsory and elective modules; the basic course (GF) chooses one elective module, the advanced course (LF) two. The curriculum does not number the modules; the numbers are our own.',
);

const QP = L(
  'Qualifikationsphase der Mainzer Studienstufe (Jahrgangsstufen 12 und 13). Der Lehrplan gibt keine Reihenfolge vor; die Lernbereiche stehen deshalb bei 12 und 13 gleich und werden als eine Stufe gezeigt. Im Grundfach (GF) sind alle neun Pflichtbausteine und fünf Wahlpflichtbausteine, im Leistungsfach (LF) alle elf Pflichtbausteine und sieben Wahlpflichtbausteine zu behandeln. Die Nummern sind von uns vergeben.',
  'Qualification phase of the Mainz upper secondary (grades 12 and 13). The curriculum sets no order, so the units are the same for grades 12 and 13 and are shown as one stage. The basic course (GF) covers all nine compulsory modules and five electives, the advanced course (LF) all eleven compulsory modules and seven electives. The numbers are our own.',
);

/** Mittelstufe, Themenfelder 1–12 (Kap. 4.3 des Rahmenlehrplans). */
const SEK_I_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Akustische Phänomene', 'Acoustic phenomena'),
    summary: L(
      'Schall im Basiskonzept Wechselwirkung: schwingende Körper als Schallquellen, Amplitude und Frequenz, Sender-Träger-Empfänger-Modell, Schallgeschwindigkeit und Lärmschutz; Echo und Resonanz als Vertiefung.',
      'Sound and interaction: vibrating bodies as sound sources, amplitude and frequency, the sender–carrier–receiver model, the speed of sound and noise protection; echo and resonance as extensions.',
    ),
    simulations: ['wellen-ausbreitung', 'resonanz'],
  },
  {
    code: '2',
    title: L('Optische Phänomene an Grenzflächen', 'Optical phenomena at boundaries'),
    summary: L(
      'Licht im Basiskonzept Wechselwirkung: Reflexion, Brechung und Absorption, Schatten im Strahlenmodell, Strahlenverläufe auch bei Linsen; Totalreflexion als Vertiefung.',
      'Light and interaction: reflection, refraction and absorption, shadows in the ray model, ray paths also through lenses; total internal reflection as an extension.',
    ),
    simulations: ['licht-schatten', 'reflexion', 'brechung', 'linsen'],
  },
  {
    code: '3',
    title: L('Thermische Ausdehnung in Experiment und Modell', 'Thermal expansion in experiment and model'),
    summary: L(
      'Temperatur im Basiskonzept Materie: Volumen- und Längenänderung bei Erwärmung im Experiment, Deutung mit dem Teilchenmodell und seine Grenzen; Gase und absoluter Nullpunkt als Vertiefung.',
      'Temperature and matter: changes in volume and length on heating in experiments, explanation with the particle model and its limits; gases and absolute zero as an extension.',
    ),
    simulations: ['teilchenmodell', 'gasgesetze'],
  },
  {
    code: '4',
    title: L('Dynamische Phänomene', 'Dynamic phenomena'),
    summary: L(
      'Bewegungsänderungen im Basiskonzept Wechselwirkung: Geschwindigkeit mit Betrag und Richtung, Trägheit, Kraft als Maß der Wechselwirkung, Kraftpfeilpaare und Kräftegleichgewicht; Impuls als Vertiefung.',
      'Changes of motion and interaction: velocity with magnitude and direction, inertia, force as a measure of interaction, pairs of force arrows and equilibrium; momentum as an extension.',
    ),
    simulations: ['bewegungsdiagramme', 'kraefteaddition', 'hookesches-gesetz', 'stoesse'],
  },
  {
    code: '5',
    title: L('Atombau und ionisierende Strahlung', 'Atomic structure and ionising radiation'),
    summary: L(
      'Radioaktivität im Basiskonzept Materie: Kern-Hülle-Modell, elektrische Ladung, radioaktiver Zerfall und Halbwertszeit, Kernspaltung, Nutzen, Gefahren und Strahlenschutz.',
      'Radioactivity and matter: the nucleus–shell model, electric charge, radioactive decay and half-life, nuclear fission, benefits, risks and radiation protection.',
    ),
    simulations: ['radioaktiver-zerfall'],
  },
  {
    code: '6',
    title: L('Spannung und Induktion', 'Voltage and induction'),
    summary: L(
      'Elektrizität im Basiskonzept Energie: geschlossener Stromkreis, Spannung als Antrieb, Leistung und Energie (ΔE = P · Δt), Maschenregel und Generator mit Induktion.',
      'Electricity and energy: the closed circuit, voltage as the drive, power and energy (ΔE = P · Δt), the loop rule and the generator with induction.',
    ),
    simulations: ['einfacher-stromkreis', 'reihe-parallel', 'induktion'],
  },
  {
    code: '7',
    title: L('Kosmos und Forschung', 'Cosmos and research'),
    summary: L(
      'Physik als sich weiter entwickelnde Wissenschaft: Methode der Erkenntnisgewinnung, Recherche und Präsentation zu Themen moderner Physik wie Sternen, Raumfahrt oder Exoplaneten.',
      'Physics as an evolving science: the scientific method, research and presentation on topics of modern physics such as stars, space travel or exoplanets.',
    ),
  },
  {
    code: '8',
    title: L('Wärmetransporte und ihre Beeinflussung', 'Heat transport and how to influence it'),
    summary: L(
      'Thermische Energieströme im Basiskonzept System: Temperaturdifferenz als Antrieb, thermischer Widerstand, Kühlung und Wärmedämmung, Wärmepumpe und Wärmekraftmaschine.',
      'Thermal energy flows and systems: temperature difference as the drive, thermal resistance, cooling and insulation, heat pumps and heat engines.',
    ),
  },
  {
    code: '9',
    title: L('Gesetzmäßigkeiten im elektrischen Stromkreis', 'Laws of the electric circuit'),
    summary: L(
      'Elektrizität im Basiskonzept System: Spannung, Stromstärke und Widerstand messen und berechnen, Knotenregel, U-I-Kennlinien, Leistung und Sicherheit im Umgang mit Strom.',
      'Electricity and systems: measuring and calculating voltage, current and resistance, the junction rule, I–V characteristics, power and electrical safety.',
    ),
    simulations: ['einfacher-stromkreis', 'reihe-parallel', 'ohmsches-gesetz'],
  },
  {
    code: '10',
    title: L('Energiebilanzen und Wirkungsgrade', 'Energy balances and efficiency'),
    summary: L(
      'Maschinen im Basiskonzept Energie: Energieerhaltung, Energieflussdiagramme, ΔE = P · Δt = F · Δs, Wirkungsgrad und einfache Maschinen wie lose Rolle und Flaschenzug.',
      'Machines and energy: conservation of energy, energy flow diagrams, ΔE = P · Δt = F · Δs, efficiency and simple machines such as pulleys and block and tackle.',
    ),
    simulations: ['energieerhaltung', 'hebelgesetz', 'schiefe-ebene'],
  },
  {
    code: '11',
    title: L('Sensoren im Alltag', 'Sensors in everyday life'),
    summary: L(
      'Physikalische Grundprinzipien alltäglicher Technik: wie Sensoren und Signalwandler mit bekannten Wechselwirkungen Messgrößen in elektrische Signale umwandeln, etwa Mikrofon, CCD oder NTC.',
      'Basic physics of everyday technology: how sensors and transducers use known interactions to turn quantities into electrical signals, for example microphone, CCD or thermistor.',
    ),
  },
  {
    code: '12',
    title: L('Praxis und Forschung', 'Practice and research'),
    summary: L(
      'Selbstständig und fragengeleitet experimentieren: Hypothesen aufstellen, Experimente planen, durchführen und auswerten, mit Inhalten aus früheren oder neuen Themenfeldern.',
      'Independent, question-led experimenting: forming hypotheses, planning, carrying out and evaluating experiments, with content from earlier or new topic fields.',
    ),
  },
];

/** Einführungsphase, Grundfach (Kap. 4.3) und Leistungsfach (Kap. 5.3). */
const EP_UNITS: CurriculumUnit[] = [
  {
    code: 'GF-P',
    title: L('Pflichtbausteine (Grundfach)', 'Compulsory modules (basic course)'),
    summary: L('Kinematik, Dynamik und Erhaltungsgrößen der Mechanik.', 'Kinematics, dynamics and conserved quantities in mechanics.'),
    parts: [
      {
        code: 'GF-P.1',
        title: L('Kinematik', 'Kinematics'),
        summary: L(
          'Ort, Zeit, Geschwindigkeit und Beschleunigung; gleichförmige und gleichmäßig beschleunigte lineare Bewegung sowie gleichförmige Kreisbewegung, in Diagrammen dargestellt.',
          'Position, time, velocity and acceleration; uniform and uniformly accelerated linear motion and uniform circular motion, shown in graphs.',
        ),
        simulations: ['bewegungsdiagramme', 'freier-fall', 'kreisbewegung'],
      },
      {
        code: 'GF-P.2',
        title: L('Dynamik', 'Dynamics'),
        summary: L(
          'Ursachen für Bewegungsänderungen, Wechselwirkungsprinzip und Trägheit, mit Impuls- oder Kraftbegriff.',
          'Causes of changes in motion, the interaction principle and inertia, using momentum or force.',
        ),
        simulations: ['kraefteaddition', 'kreisbewegung'],
      },
      {
        code: 'GF-P.3',
        title: L('Erhaltungsgrößen der Mechanik', 'Conserved quantities in mechanics'),
        summary: L(
          'Energie- und Impulserhaltung als Methode des Bilanzierens, Reibung bei realen Vorgängen und die vektorielle Betrachtung des Impulses.',
          'Conservation of energy and momentum as a method of balancing, friction in real processes and the vector nature of momentum.',
        ),
        simulations: ['energieerhaltung', 'stoesse'],
      },
    ],
  },
  {
    code: 'GF-W',
    title: L('Wahlpflichtbausteine (Grundfach, einer zu wählen)', 'Elective modules (basic course, choose one)'),
    summary: L('Wurfbewegungen oder Gravitation.', 'Projectile motion or gravitation.'),
    parts: [
      {
        code: 'GF-W.1',
        title: L('Wurfbewegungen', 'Projectile motion'),
        summary: L('Superpositionsprinzip, senkrechter und waagerechter Wurf.', 'The superposition principle, vertical and horizontal projection.'),
        simulations: ['schiefer-wurf', 'freier-fall'],
      },
      {
        code: 'GF-W.2',
        title: L('Gravitation', 'Gravitation'),
        summary: L('Gravitationsgesetz und Satellitenbewegung.', 'The law of gravitation and satellite motion.'),
        simulations: ['planetenbahnen', 'kreisbewegung'],
      },
    ],
  },
  {
    code: 'LF-P',
    title: L('Pflichtbausteine (Leistungsfach)', 'Compulsory modules (advanced course)'),
    summary: L(
      'Kinematik mit Fehlerbetrachtung, Dynamik und Erhaltungsgrößen der Mechanik.',
      'Kinematics with error analysis, dynamics and conserved quantities in mechanics.',
    ),
    parts: [
      {
        code: 'LF-P.1',
        title: L('Kinematik', 'Kinematics'),
        summary: L(
          'Beschreibende Größen einer Bewegung und ihre funktionalen Zusammenhänge, idealisierte Bewegungsformen, Analyse einer realen Bewegung und Fehlerbetrachtung.',
          'Quantities describing motion and their functional relations, idealised forms of motion, analysing a real motion and error analysis.',
        ),
        simulations: ['bewegungsdiagramme', 'freier-fall', 'kreisbewegung'],
      },
      {
        code: 'LF-P.2',
        title: L('Dynamik', 'Dynamics'),
        summary: L(
          'Ursachen für Bewegungsänderungen, Wechselwirkungsprinzip und Trägheit, ausgebaut zum Wechselwirkungskonzept.',
          'Causes of changes in motion, the interaction principle and inertia, built up into the concept of interaction.',
        ),
        simulations: ['kraefteaddition', 'schiefe-ebene', 'kreisbewegung'],
      },
      {
        code: 'LF-P.3',
        title: L('Erhaltungsgrößen der Mechanik', 'Conserved quantities in mechanics'),
        summary: L(
          'Energie- und Impulserhaltung bilanzieren, Reibung und vektorielle Behandlung des Impulses.',
          'Balancing energy and momentum, friction and the vector treatment of momentum.',
        ),
        simulations: ['energieerhaltung', 'stoesse'],
      },
    ],
  },
  {
    code: 'LF-W',
    title: L('Wahlpflichtbausteine (Leistungsfach, zwei zu wählen)', 'Elective modules (advanced course, choose two)'),
    summary: L('Wurfbewegungen, Gravitation oder Rotation starrer Körper.', 'Projectile motion, gravitation or rotation of rigid bodies.'),
    parts: [
      {
        code: 'LF-W.1',
        title: L('Wurfbewegungen', 'Projectile motion'),
        summary: L(
          'Superpositionsprinzip, senkrechter, waagerechter und schiefer Wurf.',
          'The superposition principle, vertical, horizontal and oblique projection.',
        ),
        simulations: ['schiefer-wurf', 'freier-fall'],
      },
      {
        code: 'LF-W.2',
        title: L('Gravitation', 'Gravitation'),
        summary: L(
          'Gravitationsgesetz, Satellitenbewegung, Energie im Gravitationsfeld und Fluchtgeschwindigkeit.',
          'The law of gravitation, satellite motion, energy in the gravitational field and escape velocity.',
        ),
        simulations: ['planetenbahnen', 'kreisbewegung'],
      },
      {
        code: 'LF-W.3',
        title: L('Rotation starrer Körper', 'Rotation of rigid bodies'),
        summary: L(
          'Trägheitsmoment, Drehimpuls, Drehmoment und Rotationsenergie in Analogie zur Translation.',
          'Moment of inertia, angular momentum, torque and rotational energy by analogy with translation.',
        ),
        simulations: ['hebelgesetz'],
      },
    ],
  },
];

/** Qualifikationsphase, Grundfach (Kap. 4.4) und Leistungsfach (Kap. 5.4). */
const QP_UNITS: CurriculumUnit[] = [
  {
    code: 'GF-P',
    title: L('Pflichtbausteine (Grundfach)', 'Compulsory modules (basic course)'),
    summary: L(
      'Elektrische und magnetische Felder, Induktion, Schwingungen und Wellen sowie Quantenobjekte und Atomvorstellung.',
      'Electric and magnetic fields, induction, oscillations and waves, and quantum objects and the atom.',
    ),
    parts: [
      {
        code: 'GF-P.1',
        title: L('Feldkonzept für statische elektrische und magnetische Felder', 'Field concept for static electric and magnetic fields'),
        summary: L(
          'Eigenschaften statischer Felder, Feldlinienbilder, Superposition von Feldern, elektrische Feldstärke, magnetische Flussdichte und das Magnetfeld einer Spule.',
          'Properties of static fields, field line patterns, superposition of fields, electric field strength, magnetic flux density and the field of a coil.',
        ),
        simulations: ['feldlinien'],
      },
      {
        code: 'GF-P.2',
        title: L('Energie und Energiespeicherung im elektrischen Feld', 'Energy and energy storage in the electric field'),
        summary: L(
          'Spannung und Feldstärke im Plattenkondensator, Kapazität, Energie des Feldes sowie Auf- und Entladen des Kondensators.',
          'Voltage and field strength in a parallel-plate capacitor, capacitance, field energy and charging and discharging the capacitor.',
        ),
        simulations: ['kondensator'],
      },
      {
        code: 'GF-P.3',
        title: L('Wechselwirkung von geladenen Körpern mit statischen Feldern', 'Interaction of charged bodies with static fields'),
        summary: L(
          'Kraft auf Ladungen im elektrischen Feld, Bewegung im Längs- und Querfeld, Lorentzkraft und Bewegung im homogenen Magnetfeld.',
          'Force on charges in an electric field, motion in longitudinal and transverse fields, the Lorentz force and motion in a uniform magnetic field.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'GF-P.4',
        title: L('Veränderliche elektromagnetische Felder', 'Changing electromagnetic fields'),
        summary: L(
          'Magnetischer Fluss, Induktionsgesetz mit mittlerer Änderungsrate, Richtung des Induktionsstroms und eine technische Anwendung.',
          'Magnetic flux, the law of induction with the average rate of change, the direction of the induced current and a technical application.',
        ),
        simulations: ['induktion'],
      },
      {
        code: 'GF-P.5',
        title: L('Harmonische Schwingungen', 'Harmonic oscillations'),
        summary: L(
          'Elongation, Amplitude, Periodendauer und Frequenz, Schwingkreis in Analogie zum mechanischen Oszillator, Periodendauer an einem Beispiel.',
          'Displacement, amplitude, period and frequency, the LC circuit by analogy with the mechanical oscillator, period of oscillation in one example.',
        ),
        simulations: ['fadenpendel', 'federpendel'],
      },
      {
        code: 'GF-P.6',
        title: L('Harmonische Wellen', 'Harmonic waves'),
        summary: L(
          'Erzeugung, Ausbreitung und Energietransport, Wellenlänge, Geschwindigkeit und Frequenz, transversal und longitudinal, Polarisation, Brechung, Reflexion und Beugung.',
          'Generation, propagation and energy transport, wavelength, speed and frequency, transverse and longitudinal, polarisation, refraction, reflection and diffraction.',
        ),
        simulations: ['wellen-ausbreitung'],
      },
      {
        code: 'GF-P.7',
        title: L('Superposition von Wellen', 'Superposition of waves'),
        summary: L(
          'Stehende Wellen und Wellenlängenbestimmung, Interferenz am Doppelspalt, Spektrum weißen Lichts und Überblick über elektromagnetische Wellen.',
          'Standing waves and measuring wavelength, double-slit interference, the spectrum of white light and an overview of electromagnetic waves.',
        ),
        simulations: ['stehende-wellen', 'interferenz', 'doppelspalt'],
      },
      {
        code: 'GF-P.8',
        title: L('Quantenobjekte I', 'Quantum objects I'),
        summary: L(
          'Elektronen und Photonen am Doppelspalt, Energie und Frequenz, Impuls und Wellenlänge, Grundaspekte der Quantentheorie und ein Näherungswert für h.',
          'Electrons and photons at the double slit, energy and frequency, momentum and wavelength, basic aspects of quantum theory and an estimate of h.',
        ),
        simulations: ['photoeffekt', 'elektronenbeugung'],
      },
      {
        code: 'GF-P.9',
        title: L('Quantenmechanische Atomvorstellung I', 'Quantum view of the atom I'),
        summary: L(
          'Quantisierte Absorption und Emission am Wasserstoffatom, Energiestufenmodell und Orbitalmodell.',
          'Quantised absorption and emission in the hydrogen atom, the energy level model and the orbital model.',
        ),
        simulations: ['linienspektren'],
      },
    ],
  },
  {
    code: 'GF-W',
    title: L('Wahlpflichtbausteine (Grundfach, fünf zu wählen)', 'Elective modules (basic course, choose five)'),
    summary: L(
      'Vertiefungen und Erweiterungen von Teilchen in Feldern bis zur Kosmologie, dazu ein individuelles Thema.',
      'Extensions from particles in fields to cosmology, plus an individual topic.',
    ),
    parts: [
      {
        code: 'GF-W.1',
        title: L('Anwendungsbeispiele für Teilchen in Feldern', 'Applications of particles in fields'),
        summary: L('Fadenstrahlrohr zur Bestimmung von e/m, Elektronenablenkröhre, Teilchenbeschleuniger, Hall-Effekt.', 'Fine-beam tube for e/m, electron deflection tube, particle accelerators, Hall effect.'),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'GF-W.2',
        title: L('Schwingungsphänomene', 'Oscillation phenomena'),
        summary: L('Gedämpfte, erzwungene und gekoppelte Schwingungen und Resonanz.', 'Damped, forced and coupled oscillations and resonance.'),
        simulations: ['resonanz'],
      },
      {
        code: 'GF-W.3',
        title: L('Akustik', 'Acoustics'),
        summary: L('Schall als Longitudinalwelle, Schwebung, stehende Wellen und Resonanz, Fourieranalyse von Klängen.', 'Sound as a longitudinal wave, beats, standing waves and resonance, Fourier analysis of sounds.'),
        simulations: ['wellen-ausbreitung', 'stehende-wellen'],
      },
      {
        code: 'GF-W.4',
        title: L('Licht als Wellenphänomen', 'Light as a wave phenomenon'),
        summary: L('Interferenz und Polarisation in Natur und Technik.', 'Interference and polarisation in nature and technology.'),
        simulations: ['interferenz', 'doppelspalt'],
      },
      {
        code: 'GF-W.5',
        title: L('Elektromagnetische Wellen', 'Electromagnetic waves'),
        summary: L('Rückkopplung, offener Schwingkreis, Ausbreitung und Modulation, Anwendungen und Spektrum.', 'Feedback, the open oscillating circuit, propagation and modulation, applications and the spectrum.'),
      },
      {
        code: 'GF-W.6',
        title: L('Wechselstromkreise', 'AC circuits'),
        summary: L('Effektivwerte, Impedanz und Phasenverschiebung, Wirk- und Blindleistung.', 'RMS values, impedance and phase shift, real and reactive power.'),
      },
      {
        code: 'GF-W.7',
        title: L('Elektronik', 'Electronics'),
        summary: L('Grundschaltungen, Eigen- und Störstellenleitung, Diode und Transistor.', 'Basic circuits, intrinsic and extrinsic conduction, diode and transistor.'),
      },
      {
        code: 'GF-W.8',
        title: L('Festkörperphysik', 'Solid-state physics'),
        summary: L('Bändermodell und Eigenschaften von Festkörpern.', 'The band model and properties of solids.'),
      },
      {
        code: 'GF-W.9',
        title: L('Quantenobjekte II', 'Quantum objects II'),
        summary: L('Deutungen der Quantentheorie, Unbestimmtheitsrelation und experimentelle Belege wie Elektronenbeugung und Hallwachs-Effekt.', 'Interpretations of quantum theory, the uncertainty principle and experimental evidence such as electron diffraction and the Hallwachs effect.'),
        simulations: ['elektronenbeugung', 'photoeffekt'],
      },
      {
        code: 'GF-W.10',
        title: L('Quantenmechanische Atomvorstellung II', 'Quantum view of the atom II'),
        summary: L('Franck-Hertz-Versuch, Resonanzabsorption, Lumineszenz, Laser und Spektralanalyse.', 'The Franck–Hertz experiment, resonance absorption, luminescence, lasers and spectral analysis.'),
        simulations: ['linienspektren'],
      },
      {
        code: 'GF-W.11',
        title: L('Kernphysik', 'Nuclear physics'),
        summary: L('Radionuklide, Zerfall, Spaltung und Fusion, Absorptions- und Zerfallsgesetz, Bindungsenergie.', 'Radionuclides, decay, fission and fusion, the laws of absorption and decay, binding energy.'),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: 'GF-W.12',
        title: L('Strahlenbiophysik', 'Radiation biophysics'),
        summary: L('Dosis, biologische Wirkung, Strahlenschutz und medizinische Anwendungen.', 'Dose, biological effects, radiation protection and medical uses.'),
      },
      {
        code: 'GF-W.13',
        title: L('Elementarteilchenphysik', 'Particle physics'),
        summary: L('Fundamentalteilchen und Wechselwirkungen, Standardmodell und offene Fragen.', 'Fundamental particles and interactions, the Standard Model and open questions.'),
      },
      {
        code: 'GF-W.14',
        title: L('Entropie', 'Entropy'),
        summary: L('Entropie als Energieträger, Entropieerzeugung und Carnot-Wirkungsgrad.', 'Entropy as an energy carrier, entropy production and Carnot efficiency.'),
      },
      {
        code: 'GF-W.15',
        title: L('Thermodynamische Maschinen', 'Thermodynamic machines'),
        summary: L('Gesetze des idealen Gases, Wärmepumpe und Stirlingmotor, Carnot-Wirkungsgrad.', 'Ideal gas laws, heat pump and Stirling engine, Carnot efficiency.'),
        simulations: ['gasgesetze'],
      },
      {
        code: 'GF-W.16',
        title: L('Energiebereitstellung', 'Energy supply'),
        summary: L('Grundprinzip und Vergleich von Techniken der Energiebereitstellung, Nachhaltigkeit.', 'Basic principle and comparison of energy supply technologies, sustainability.'),
      },
      {
        code: 'GF-W.17',
        title: L('Relativistische Kinematik', 'Relativistic kinematics'),
        summary: L('Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion, Raum-Zeit-Diagramme.', 'Relativity of simultaneity, time dilation and length contraction, spacetime diagrams.'),
      },
      {
        code: 'GF-W.18',
        title: L('Relativistische Dynamik', 'Relativistic dynamics'),
        summary: L('Masse-Energie-Äquivalenz, Grenzgeschwindigkeit und Zeit im Gravitationsfeld.', 'Mass–energy equivalence, the speed limit and time in a gravitational field.'),
      },
      {
        code: 'GF-W.19',
        title: L('Astrophysik', 'Astrophysics'),
        summary: L('Zustandsgrößen der Sonne, Sternentwicklung und Standardsonnenmodell.', 'Properties of the Sun, stellar evolution and the standard solar model.'),
      },
      {
        code: 'GF-W.20',
        title: L('Kosmologie', 'Cosmology'),
        summary: L('Struktur und Entwicklung des Universums, Urknall und Hintergrundstrahlung.', 'Structure and evolution of the universe, the Big Bang and background radiation.'),
      },
      {
        code: 'GF-W.21',
        title: L('Chaos und Fraktale – Nichtlineare dynamische Systeme', 'Chaos and fractals – non-linear dynamical systems'),
        summary: L('Chaosphänomene, Merkmale chaotischer Systeme und fraktale Strukturen.', 'Chaotic phenomena, features of chaotic systems and fractal structures.'),
      },
      {
        code: 'GF-W.22',
        title: L('Strömungsphysik', 'Fluid dynamics'),
        summary: L('Strömungsarten, Kontinuitätsgleichung, Bernoulli-Gleichung und dynamischer Auftrieb.', 'Types of flow, the continuity equation, Bernoulli’s equation and dynamic lift.'),
      },
      {
        code: 'GF-W.23',
        title: L('Physik als sich weiterentwickelnde Wissenschaft', 'Physics as an evolving science'),
        summary: L('Wissenschaftliche Revolutionen und physikalische Arbeitsweisen im historischen und gesellschaftlichen Zusammenhang.', 'Scientific revolutions and ways of working in physics in their historical and social context.'),
      },
      {
        code: 'GF-W.24',
        title: L('Individuelles Thema', 'Individual topic'),
        summary: L('Frei gewählte Inhalte, vor allem zur Bewertungskompetenz, etwa Nachhaltigkeit oder Klimawandel.', 'Freely chosen content, mainly for evaluation skills, for example sustainability or climate change.'),
      },
    ],
  },
  {
    code: 'LF-P',
    title: L('Pflichtbausteine (Leistungsfach)', 'Compulsory modules (advanced course)'),
    summary: L(
      'Felder mit Energiespeicherung in Kondensator und Spule, Induktion, Schwingungen und Wellen, Quantenphysik, Atom- und Kernphysik sowie Energie und Entropie.',
      'Fields with energy storage in capacitor and coil, induction, oscillations and waves, quantum physics, atomic and nuclear physics, and energy and entropy.',
    ),
    parts: [
      {
        code: 'LF-P.1',
        title: L('Feldkonzept für statische elektrische und magnetische Felder', 'Field concept for static electric and magnetic fields'),
        summary: L(
          'Wie im Grundfach, zusätzlich Influenz und Polarisation, Magnetisierung und Coulomb-Gesetz.',
          'As in the basic course, plus induction of charge and polarisation, magnetisation and Coulomb’s law.',
        ),
        simulations: ['feldlinien'],
      },
      {
        code: 'LF-P.2',
        title: L('Energie und Energiespeicherung im elektrischen und magnetischen Feld', 'Energy and energy storage in electric and magnetic fields'),
        summary: L(
          'Potential und Spannung, Kondensator mit Kapazität, Energie und Auf- und Entladung; Spule mit Flussdichte, Induktivität und Feldenergie.',
          'Potential and voltage, the capacitor with capacitance, energy and charging and discharging; the coil with flux density, inductance and field energy.',
        ),
        simulations: ['kondensator'],
      },
      {
        code: 'LF-P.3',
        title: L('Wechselwirkung von geladenen Körpern mit statischen Feldern', 'Interaction of charged bodies with static fields'),
        summary: L(
          'Wie im Grundfach, zusätzlich Hall-Effekt, Kreisbahnen im Magnetfeld (quantitativ) und gekreuzte Felder.',
          'As in the basic course, plus the Hall effect, circular paths in a magnetic field (quantitative) and crossed fields.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'LF-P.4',
        title: L('Veränderliche elektromagnetische Felder I', 'Changing electromagnetic fields I'),
        summary: L(
          'Induktionsgesetz auch in differentieller Form, Richtung des Induktionsstroms, Selbstinduktion und Ein- und Ausschaltvorgänge an der Spule.',
          'The law of induction also in differential form, direction of the induced current, self-induction and switching a coil on and off.',
        ),
        simulations: ['induktion'],
      },
      {
        code: 'LF-P.5',
        title: L('Harmonische Schwingungen', 'Harmonic oscillations'),
        summary: L(
          'Kenngrößen der Schwingung, Schwingkreis, lineares Kraftgesetz, Fadenpendel mit Kleinwinkelnäherung und Herleitung der Schwingungsdauer.',
          'Parameters of oscillation, the LC circuit, the linear force law, the simple pendulum with the small-angle approximation and deriving the period.',
        ),
        simulations: ['fadenpendel', 'federpendel'],
      },
      {
        code: 'LF-P.6',
        title: L('Schwingungen und Wellen', 'Oscillations and waves'),
        summary: L(
          'Gedämpfte, erzwungene und gekoppelte Schwingungen mit Resonanz; Erzeugung, Größen und mathematische Beschreibung harmonischer Wellen.',
          'Damped, forced and coupled oscillations with resonance; generation, quantities and mathematical description of harmonic waves.',
        ),
        simulations: ['resonanz', 'wellen-ausbreitung'],
      },
      {
        code: 'LF-P.7',
        title: L('Harmonische Wellen und ihre Superposition', 'Harmonic waves and their superposition'),
        summary: L(
          'Brechung, Reflexion und Beugung, stehende Wellen, Interferenz an Doppelspalt und Einzelspalt, Wellenlängenbestimmung und Interferometer.',
          'Refraction, reflection and diffraction, standing waves, interference at double and single slits, measuring wavelength and the interferometer.',
        ),
        simulations: ['stehende-wellen', 'interferenz', 'doppelspalt'],
      },
      {
        code: 'LF-P.8',
        title: L('Quantenobjekte I', 'Quantum objects I'),
        summary: L(
          'Wie im Grundfach, zusätzlich Delayed-Choice-Experiment, Koinzidenzmethode, stochastische Deutung mit |Ψ|² und Ort-Impuls-Unbestimmtheit.',
          'As in the basic course, plus the delayed-choice experiment, the coincidence method, the probabilistic interpretation with |Ψ|² and position–momentum uncertainty.',
        ),
        simulations: ['photoeffekt', 'elektronenbeugung'],
      },
      {
        code: 'LF-P.9',
        title: L('Quantenmechanische Atomvorstellung I', 'Quantum view of the atom I'),
        summary: L(
          'Quantisierte Absorption und Emission, Röntgenspektrum, Energiestufenmodell, Potentialtopf, Orbitalmodell und Ausblick auf Mehrelektronensysteme.',
          'Quantised absorption and emission, the X-ray spectrum, the energy level model, the potential well, the orbital model and an outlook on many-electron systems.',
        ),
        simulations: ['linienspektren'],
      },
      {
        code: 'LF-P.10',
        title: L('Kernphysik', 'Nuclear physics'),
        summary: L(
          'Kernmodell, Bindungsenergie, Zerfall, Spaltung und Fusion, Absorptions- und Zerfallsgesetz und quantenmechanische Bezüge.',
          'Nuclear model, binding energy, decay, fission and fusion, the laws of absorption and decay and links to quantum mechanics.',
        ),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: 'LF-P.11',
        title: L('Energie und Entropie', 'Energy and entropy'),
        summary: L(
          'Energieströme und Energieträger, Entropie, Entropieerzeugung, thermodynamische Maschinen und Carnot-Wirkungsgrad.',
          'Energy flows and carriers, entropy, entropy production, thermodynamic machines and Carnot efficiency.',
        ),
        simulations: ['gasgesetze'],
      },
    ],
  },
  {
    code: 'LF-W',
    title: L('Wahlpflichtbausteine (Leistungsfach, sieben zu wählen)', 'Elective modules (advanced course, choose seven)'),
    summary: L(
      'Vertiefungen und Erweiterungen von Teilchen in Feldern bis zur Kosmologie, dazu ein individuelles Thema.',
      'Extensions from particles in fields to cosmology, plus an individual topic.',
    ),
    parts: [
      {
        code: 'LF-W.1',
        title: L('Anwendungsbeispiele für Teilchen in Feldern', 'Applications of particles in fields'),
        summary: L('Fadenstrahlrohr, Elektronenablenkröhre, Teilchenbeschleuniger, Massenspektrometer und MHD-Generator.', 'Fine-beam tube, electron deflection tube, particle accelerators, mass spectrometer and MHD generator.'),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'LF-W.2',
        title: L('Veränderliche elektromagnetische Felder II', 'Changing electromagnetic fields II'),
        summary: L('Maxwell-Gleichungen, Felder und Bezugssysteme, Lorentz-Transformation.', 'Maxwell’s equations, fields and frames of reference, the Lorentz transformation.'),
      },
      {
        code: 'LF-W.3',
        title: L('Akustik', 'Acoustics'),
        summary: L('Schall als Longitudinalwelle, Dopplereffekt, Schwebung, stehende Wellen und Resonanz, Fourieranalyse.', 'Sound as a longitudinal wave, the Doppler effect, beats, standing waves and resonance, Fourier analysis.'),
        simulations: ['doppler-effekt', 'wellen-ausbreitung', 'stehende-wellen'],
      },
      {
        code: 'LF-W.4',
        title: L('Licht als Wellenphänomen', 'Light as a wave phenomenon'),
        summary: L('Interferenz und Polarisation in Natur und Technik.', 'Interference and polarisation in nature and technology.'),
        simulations: ['interferenz', 'doppelspalt'],
      },
      {
        code: 'LF-W.5',
        title: L('Elektromagnetische Wellen', 'Electromagnetic waves'),
        summary: L('Rückkopplung, offener Schwingkreis, Ausbreitung und Modulation, Anwendungen und Spektrum.', 'Feedback, the open oscillating circuit, propagation and modulation, applications and the spectrum.'),
      },
      {
        code: 'LF-W.6',
        title: L('Wechselstromkreise', 'AC circuits'),
        summary: L('Effektivwerte, Impedanz und Phasenverschiebung, Wirk- und Blindleistung.', 'RMS values, impedance and phase shift, real and reactive power.'),
      },
      {
        code: 'LF-W.7',
        title: L('Elektronik', 'Electronics'),
        summary: L('Grundschaltungen, Eigen- und Störstellenleitung, Diode und Transistor.', 'Basic circuits, intrinsic and extrinsic conduction, diode and transistor.'),
      },
      {
        code: 'LF-W.8',
        title: L('Festkörperphysik', 'Solid-state physics'),
        summary: L('Bändermodell und Eigenschaften von Festkörpern.', 'The band model and properties of solids.'),
      },
      {
        code: 'LF-W.9',
        title: L('Quantenobjekte II', 'Quantum objects II'),
        summary: L('Deutungen der Quantentheorie und experimentelle Belege wie Elektronenbeugung und Hallwachs-Effekt.', 'Interpretations of quantum theory and experimental evidence such as electron diffraction and the Hallwachs effect.'),
        simulations: ['elektronenbeugung', 'photoeffekt'],
      },
      {
        code: 'LF-W.10',
        title: L('Wechselwirkung von Quantenobjekten', 'Interaction of quantum objects'),
        summary: L('Compton- und Hallwachs-Effekt, Paarerzeugung, Elektronenbeugung, Bragg-Reflexion und Entstehung der Röntgenstrahlung.', 'Compton and Hallwachs effects, pair production, electron diffraction, Bragg reflection and how X-rays arise.'),
        simulations: ['photoeffekt', 'elektronenbeugung'],
      },
      {
        code: 'LF-W.11',
        title: L('Quantenmechanische Atomvorstellung II', 'Quantum view of the atom II'),
        summary: L('Franck-Hertz-Versuch, Resonanzabsorption, Lumineszenz, Laser und Spektralanalyse.', 'The Franck–Hertz experiment, resonance absorption, luminescence, lasers and spectral analysis.'),
        simulations: ['linienspektren'],
      },
      {
        code: 'LF-W.12',
        title: L('Strahlenbiophysik', 'Radiation biophysics'),
        summary: L('Dosis, biologische Wirkung, Strahlenschutz, Dosis-Effekt-Kurven und medizinische Anwendungen.', 'Dose, biological effects, radiation protection, dose–effect curves and medical uses.'),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: 'LF-W.13',
        title: L('Elementarteilchenphysik', 'Particle physics'),
        summary: L('Standardmodell, fundamentale Wechselwirkungen, experimentelle Befunde und offene Fragen.', 'The Standard Model, fundamental interactions, experimental findings and open questions.'),
      },
      {
        code: 'LF-W.14',
        title: L('Energiebereitstellung', 'Energy supply'),
        summary: L('Grundprinzip und Vergleich von Techniken der Energiebereitstellung, Nachhaltigkeit.', 'Basic principle and comparison of energy supply technologies, sustainability.'),
      },
      {
        code: 'LF-W.15',
        title: L('Relativistische Kinematik', 'Relativistic kinematics'),
        summary: L('Relativität der Gleichzeitigkeit, Zeitdilatation und Längenkontraktion, Raum-Zeit-Diagramme.', 'Relativity of simultaneity, time dilation and length contraction, spacetime diagrams.'),
      },
      {
        code: 'LF-W.16',
        title: L('Relativistische Dynamik', 'Relativistic dynamics'),
        summary: L('Masse-Energie-Äquivalenz, Grenzgeschwindigkeit und Zeit im Gravitationsfeld.', 'Mass–energy equivalence, the speed limit and time in a gravitational field.'),
      },
      {
        code: 'LF-W.17',
        title: L('Astrophysik', 'Astrophysics'),
        summary: L('Zustandsgrößen der Sonne, Sternentwicklung und Standardsonnenmodell.', 'Properties of the Sun, stellar evolution and the standard solar model.'),
      },
      {
        code: 'LF-W.18',
        title: L('Kosmologie', 'Cosmology'),
        summary: L('Struktur und Entwicklung des Universums, Urknall und Hintergrundstrahlung.', 'Structure and evolution of the universe, the Big Bang and background radiation.'),
      },
      {
        code: 'LF-W.19',
        title: L('Chaos und Fraktale – Nichtlineare dynamische Systeme', 'Chaos and fractals – non-linear dynamical systems'),
        summary: L('Chaosphänomene, Merkmale chaotischer Systeme und fraktale Strukturen.', 'Chaotic phenomena, features of chaotic systems and fractal structures.'),
      },
      {
        code: 'LF-W.20',
        title: L('Strömungsphysik', 'Fluid dynamics'),
        summary: L('Strömungsarten, Kontinuitätsgleichung, Bernoulli-Gleichung und dynamischer Auftrieb.', 'Types of flow, the continuity equation, Bernoulli’s equation and dynamic lift.'),
      },
      {
        code: 'LF-W.21',
        title: L('Individuelles Thema', 'Individual topic'),
        summary: L('Frei gewählte Inhalte, vor allem zur Bewertungskompetenz, etwa Nachhaltigkeit oder Klimawandel.', 'Freely chosen content, mainly for evaluation skills, for example sustainability or climate change.'),
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
 * Physik am Gymnasium in Rheinland-Pfalz (G9, Abitur nach Jahrgangsstufe 13) nach
 * - dem Rahmenlehrplan Naturwissenschaften für die Klassenstufen 5–10, Kap. 4 „Lehrplan Physik“
 *   (Auszug S. 91–123, ohne Titelblatt und ohne Stand), und
 * - „Lehrplan Physik, Grund- und Leistungsfach in der gymnasialen Oberstufe (Mainzer
 *   Studienstufe)“, Ministerium für Bildung Rheinland-Pfalz, Erscheinungstermin 2022.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/rheinland-pfalz-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Die Themenfelder der Mittelstufe stehen ohne Klassenstufen (Stufe 7–10);
 * die Oberstufe ist in Einführungsphase (11) und Qualifikationsphase (12/13) mit Pflicht- und
 * Wahlpflichtbausteinen gegliedert. Die Nummern der Bausteine sind selbst vergeben.
 *
 * Überschriften entsprechen den Lehrplänen; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const rheinlandPfalzGymnasiumPhysik: StateCurriculum = {
  id: 'rheinland-pfalz-gymnasium-physik',
  subject: 'physik',
  slug: L('rheinland-pfalz-gymnasium', 'rhineland-palatinate-gymnasium'),
  state: L('Rheinland-Pfalz', 'Rhineland-Palatinate'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Rahmenlehrplan und Lehrplan',
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
