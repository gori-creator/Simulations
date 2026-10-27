import { L } from '../helpers';
import { physik } from '../physik';
import { unitsForGrade } from './stufen';
import type { Localized } from '../../i18n/config';
import type { CurriculumGrade, CurriculumUnit, StateCurriculum } from './types';

/**
 * Lehrplannavigator des Ministeriums für Schule und Bildung NRW. Die Kernlehrpläne
 * verweisen auf ihn („www.lehrplannavigator.nrw.de“ bzw. „https://www.schulentwicklung.nrw.de/lehrplaene/“);
 * ein Link zur einzelnen PDF-Datei steht in den Dokumenten nicht.
 */
const SOURCE = 'https://www.schulentwicklung.nrw.de/lehrplaene/';

// Hinweise je Jahrgangsstufe: Einordnung sichtbar machen (siehe docs/lehrplaene/nordrhein-westfalen-gymnasium-physik.md, Teil E).
const ERPROBUNGSSTUFE = L(
  'Erprobungsstufe (Klassen 5 und 6): Der Kernlehrplan nennt die Kompetenzerwartungen „bis zum Ende der Erprobungsstufe“; die Lernbereiche stehen deshalb bei 5 und 6 gleich. Beide Jahrgänge werden deshalb als eine Stufe gezeigt. Die Inhaltsfelder sind im Lehrplan nummeriert, die Nummern der Schwerpunkte sind von uns vergeben.',
  'Orientation stage (grades 5 and 6): the core curriculum states its expectations “by the end of the orientation stage”, so the units are the same for grades 5 and 6. Both grades are therefore shown as one stage. The content areas are numbered in the curriculum; the numbers of the focal points are our own.',
);

const SEK_I = L(
  'Bis zum Ende der Sekundarstufe I (Klassen 7 bis 10): Der Kernlehrplan verteilt die Inhaltsfelder 5–11 nicht auf einzelne Jahrgänge; das regelt der schulinterne Lehrplan. Die Lernbereiche stehen deshalb bei 7, 8, 9 und 10 gleich; sie werden als eine Stufe gezeigt. Die Nummern der Schwerpunkte sind von uns vergeben.',
  'By the end of lower secondary (grades 7 to 10): the core curriculum does not assign content areas 5–11 to individual grades; each school decides in its own syllabus. The units are therefore the same for grades 7, 8, 9 and 10; they are shown as one stage. The numbers of the focal points are our own.',
);

const EF = L(
  'Einführungsphase der gymnasialen Oberstufe (G9: Jahrgangsstufe 11). Die Inhaltsfelder sind im Lehrplan nicht nummeriert; die Codes sind von uns vergeben. Kernlehrplan Sekundarstufe II von 2026, in Kraft ab 1. August 2027 beginnend mit der Einführungsphase; der Kernlehrplan von 2022 läuft aus und ist hier nicht abgebildet.',
  'Introductory phase of upper secondary (G9: grade 11). The content areas are not numbered in the curriculum; the codes are our own. Core curriculum for upper secondary of 2026, in force from 1 August 2027, starting with the introductory phase; the 2022 core curriculum is being phased out and is not shown here.',
);

const QPHASE = L(
  'Qualifikationsphase (G9: Jahrgangsstufen 12 und 13). Der Kernlehrplan nennt Inhaltsfelder für den Grundkurs (GK) und eigene für den Leistungskurs (LK), aber keine Verteilung auf Halbjahre; die Lernbereiche stehen deshalb bei 12 und 13 gleich. Die Codes sind von uns vergeben. Kernlehrplan Sekundarstufe II von 2026 (aufsteigend in Kraft ab 1. August 2027 mit der Einführungsphase).',
  'Qualification phase (G9: grades 12 and 13). The core curriculum lists content areas for the basic course (GK) and separate ones for the advanced course (LK), but does not distribute them over half-years; the units are therefore the same for grades 12 and 13. The codes are our own. Core curriculum for upper secondary of 2026 (phased in from 1 August 2027, starting with the introductory phase).',
);

/** Erprobungsstufe, Inhaltsfelder 1–4 (Kap. 2.2). */
const ERPROBUNG_UNITS: CurriculumUnit[] = [
  {
    code: '1',
    title: L('Temperatur und Wärme', 'Temperature and heat'),
    summary: L(
      'Temperatur messen und von Wärme unterscheiden, Wärme wandert auf drei Wegen, Stoffe dehnen sich aus und wechseln den Aggregatzustand – erklärt mit einem einfachen Teilchenmodell.',
      'Measuring temperature and telling it apart from heat, three ways heat travels, materials expand and change state – explained with a simple particle model.',
    ),
    parts: [
      {
        code: '1.1',
        title: L('Thermische Energie', 'Thermal energy'),
        summary: L('Wärme, Temperatur und Temperaturmessung, die Celsiusskala.', 'Heat, temperature and measuring temperature, the Celsius scale.'),
      },
      {
        code: '1.2',
        title: L('Wärmetransport', 'Heat transfer'),
        summary: L(
          'Wärmemitführung, Wärmeleitung und Wärmestrahlung, Temperaturausgleich und Wärmedämmung.',
          'Convection, conduction and radiation, temperature equalisation and insulation.',
        ),
      },
      {
        code: '1.3',
        title: L('Wirkungen von Wärme', 'Effects of heat'),
        summary: L(
          'Aggregatzustände und ihre Übergänge sowie Wärmeausdehnung, gedeutet mit Teilchen; die Anomalie des Wassers.',
          'States of matter and changes of state as well as thermal expansion, interpreted with particles; the anomaly of water.',
        ),
        simulations: ['teilchenmodell'],
      },
    ],
  },
  {
    code: '2',
    title: L('Elektrischer Strom und Magnetismus', 'Electric current and magnetism'),
    summary: L(
      'Einfache Stromkreise planen, aufbauen und als Schaltplan zeichnen, Wirkungen des Stroms und Sicherheit sowie Magnete, Magnetfelder und das Erdmagnetfeld.',
      'Planning and building simple circuits and drawing circuit diagrams, effects of current and safety, as well as magnets, magnetic fields and the Earth’s magnetic field.',
    ),
    parts: [
      {
        code: '2.1',
        title: L('Stromkreise und Schaltungen', 'Circuits and connections'),
        summary: L(
          'Spannungsquellen, Leiter und Nichtleiter, Reihen-, Parallel-, UND- und ODER-Schaltung, Elektronen als Ladungsträger im Leiter.',
          'Voltage sources, conductors and insulators, series, parallel, AND and OR circuits, electrons as charge carriers in a conductor.',
        ),
        simulations: ['einfacher-stromkreis'],
      },
      {
        code: '2.2',
        title: L('Wirkungen des elektrischen Stroms', 'Effects of electric current'),
        summary: L(
          'Wärme-, Licht- und magnetische Wirkung, Sicherungen und Gefahren durch Elektrizität.',
          'Heating, lighting and magnetic effects, fuses and dangers of electricity.',
        ),
      },
      {
        code: '2.3',
        title: L('Magnetische Kräfte und Felder', 'Magnetic forces and fields'),
        summary: L(
          'Anziehung und Abstoßung, Magnetpole, Feldlinienbilder, Magnetfeld der Erde und Kompass.',
          'Attraction and repulsion, magnetic poles, field-line patterns, the Earth’s magnetic field and the compass.',
        ),
      },
      {
        code: '2.4',
        title: L('Magnetisierung', 'Magnetisation'),
        summary: L('Magnetisierbare Stoffe und das Modell der Elementarmagnete.', 'Magnetisable materials and the model of elementary magnets.'),
      },
    ],
  },
  {
    code: '3',
    title: L('Schall', 'Sound'),
    summary: L(
      'Schall entsteht durch Schwingungen, breitet sich in Stoffen aus und wird reflektiert oder absorbiert; Tonhöhe, Lautstärke, Ultraschall und Lärmschutz.',
      'Sound is produced by vibrations, travels through materials and is reflected or absorbed; pitch, loudness, ultrasound and noise protection.',
    ),
    parts: [
      {
        code: '3.1',
        title: L('Schwingungen und Schallwellen', 'Vibrations and sound waves'),
        summary: L(
          'Tonhöhe und Lautstärke, Schallausbreitung im Teilchenmodell, Absorption und Reflexion.',
          'Pitch and loudness, sound propagation in the particle model, absorption and reflection.',
        ),
      },
      {
        code: '3.2',
        title: L('Schallquellen und Schallempfänger', 'Sound sources and receivers'),
        summary: L(
          'Sender-Empfänger-Modell, Ultraschall in Natur, Medizin und Technik, Lärm und Lärmschutz.',
          'Sender–receiver model, ultrasound in nature, medicine and technology, noise and noise protection.',
        ),
      },
    ],
  },
  {
    code: '4',
    title: L('Licht', 'Light'),
    summary: L(
      'Licht breitet sich geradlinig aus; Sehen, Schatten und die Lochkamera mit dem Strahlenmodell erklären; wie Oberflächen Licht streuen, spiegeln oder verschlucken.',
      'Light travels in straight lines; explaining vision, shadows and the pinhole camera with the ray model; how surfaces scatter, reflect or absorb light.',
    ),
    parts: [
      {
        code: '4.1',
        title: L('Ausbreitung von Licht', 'Propagation of light'),
        summary: L(
          'Lichtquellen und Lichtempfänger, das Modell des Lichtstrahls und Abbildungen mit der Lochkamera.',
          'Light sources and receivers, the light-ray model and images formed by a pinhole camera.',
        ),
      },
      {
        code: '4.2',
        title: L('Sichtbarkeit und die Erscheinung von Gegenständen', 'Visibility and appearance of objects'),
        summary: L(
          'Streuung, Reflexion, Transmission und Absorption an Oberflächen sowie Kern- und Halbschatten.',
          'Scattering, reflection, transmission and absorption at surfaces, as well as umbra and penumbra.',
        ),
        simulations: ['licht-schatten'],
      },
    ],
  },
];

/** Bis zum Ende der Sekundarstufe I, Inhaltsfelder 5–11 (Kap. 2.3). */
const SEK_I_UNITS: CurriculumUnit[] = [
  {
    code: '5',
    title: L('Optische Instrumente', 'Optical instruments'),
    summary: L(
      'Spiegelbilder mit dem Reflexionsgesetz, Brechung und Totalreflexion, Bilder an Sammellinsen, Auge und optische Geräte sowie Spektrum und Farbmischung.',
      'Mirror images with the law of reflection, refraction and total internal reflection, images formed by converging lenses, the eye and optical devices, as well as the spectrum and colour mixing.',
    ),
    parts: [
      {
        code: '5.1',
        title: L('Spiegelungen', 'Reflections'),
        summary: L('Reflexionsgesetz und Bildentstehung am ebenen Spiegel.', 'Law of reflection and image formation in a plane mirror.'),
        simulations: ['reflexion'],
      },
      {
        code: '5.2',
        title: L('Lichtbrechung', 'Refraction of light'),
        summary: L(
          'Brechung an Grenzflächen, Totalreflexion und Lichtleiter, Bilder an Sammellinsen, im Auge und in optischen Instrumenten.',
          'Refraction at boundaries, total internal reflection and optical fibres, images formed by converging lenses, in the eye and in optical instruments.',
        ),
        simulations: ['brechung', 'linsen'],
      },
      {
        code: '5.3',
        title: L('Licht und Farben', 'Light and colours'),
        summary: L(
          'Zerlegung von Licht am Prisma, Infrarot und Ultraviolett, Absorption und Farbmischung (RGB, CMYK).',
          'Splitting light with a prism, infrared and ultraviolet, absorption and colour mixing (RGB, CMYK).',
        ),
      },
    ],
  },
  {
    code: '6',
    title: L('Sterne und Weltall', 'Stars and the universe'),
    summary: L(
      'Mondphasen, Finsternisse und Jahreszeiten modellhaft erklären, Planeten und andere Himmelskörper, Lichtjahr, Gravitation und die Entwicklung von Sternen.',
      'Explaining lunar phases, eclipses and seasons with models, planets and other celestial bodies, the light year, gravity and the life cycle of stars.',
    ),
    parts: [
      {
        code: '6.1',
        title: L('Sonnensystem', 'Solar system'),
        summary: L('Mondphasen, Mond- und Sonnenfinsternisse, Jahreszeiten und Planeten.', 'Lunar phases, lunar and solar eclipses, seasons and planets.'),
        simulations: ['licht-schatten'],
      },
      {
        code: '6.2',
        title: L('Universum', 'Universe'),
        summary: L(
          'Himmelsobjekte, Entfernungen in Lichtjahren und typische Stadien der Sternentwicklung.',
          'Celestial objects, distances in light years and typical stages of stellar evolution.',
        ),
      },
    ],
  },
  {
    code: '7',
    title: L('Bewegung, Kraft und Energie', 'Motion, force and energy'),
    summary: L(
      'Bewegungen mit Geschwindigkeit und Beschleunigung beschreiben, Kräfte als Pfeile addieren, einfache Maschinen mit der Goldenen Regel, Energieformen, Energieerhaltung und Leistung.',
      'Describing motion with velocity and acceleration, adding forces as arrows, simple machines and the golden rule of mechanics, forms of energy, conservation of energy and power.',
    ),
    parts: [
      {
        code: '7.1',
        title: L('Bewegungen', 'Motion'),
        summary: L(
          'Mittlere und momentane Geschwindigkeit, Beschleunigung und Orts-Zeit-Diagramme.',
          'Average and instantaneous velocity, acceleration and position–time graphs.',
        ),
        simulations: ['bewegungsdiagramme', 'freier-fall'],
      },
      {
        code: '7.2',
        title: L('Kraft', 'Force'),
        summary: L(
          'Kräfte ändern Bewegungen oder verformen Körper; Kraft und Gegenkraft, Gewichtskraft und Masse, Kräfteaddition und Reibung.',
          'Forces change motion or deform bodies; action and reaction, weight and mass, adding forces and friction.',
        ),
        simulations: ['hookesches-gesetz', 'kraefteaddition', 'schiefe-ebene'],
      },
      {
        code: '7.3',
        title: L('Goldene Regel der Mechanik', 'Golden rule of mechanics'),
        summary: L(
          'Einfache Maschinen wandeln Kräfte; was an Kraft gespart wird, muss an Weg zugelegt werden.',
          'Simple machines change forces; what is saved in force must be added in distance.',
        ),
        simulations: ['hebelgesetz', 'schiefe-ebene'],
      },
      {
        code: '7.4',
        title: L('Energieformen', 'Forms of energy'),
        summary: L('Lageenergie, Bewegungsenergie und Spannenergie.', 'Potential energy, kinetic energy and elastic energy.'),
        simulations: ['energieerhaltung'],
      },
      {
        code: '7.5',
        title: L('Energieumwandlung', 'Energy conversion'),
        summary: L(
          'Energieumwandlungsketten, Energieerhaltung und Leistung, auch im Vergleich mit der eigenen Körperleistung.',
          'Chains of energy conversion, conservation of energy and power, also compared with one’s own physical power.',
        ),
        simulations: ['energieerhaltung'],
      },
    ],
  },
  {
    code: '8',
    title: L('Druck und Auftrieb', 'Pressure and buoyancy'),
    summary: L(
      'Druck und Dichte in Flüssigkeiten und Gasen im Teilchenmodell, Schweredruck, Luftdruck und Auftrieb nach Archimedes.',
      'Pressure and density in liquids and gases in the particle model, hydrostatic pressure, air pressure and buoyancy according to Archimedes.',
    ),
    parts: [
      {
        code: '8.1',
        title: L('Druck in Flüssigkeiten und Gasen', 'Pressure in liquids and gases'),
        summary: L(
          'Dichte, Schweredruck, Auftrieb und Archimedisches Prinzip, Luftdruck; Druck als Folge von Teilchenstößen.',
          'Density, hydrostatic pressure, buoyancy and Archimedes’ principle, air pressure; pressure as a result of particle collisions.',
        ),
        simulations: ['gasgesetze'],
      },
      {
        code: '8.2',
        title: L('Druckmessung', 'Measuring pressure'),
        summary: L('Druck und Kraftwirkungen, Druck in Pascal angeben und messen.', 'Pressure and the effects of force, stating and measuring pressure in pascals.'),
      },
    ],
  },
  {
    code: '9',
    title: L('Elektrizität', 'Electricity'),
    summary: L(
      'Ladungen und elektrische Felder, Spannung, Stromstärke und Widerstand in Reihen- und Parallelschaltungen, Sicherheit im Haushalt sowie elektrische Energie, Leistung und Kosten.',
      'Charges and electric fields, voltage, current and resistance in series and parallel circuits, safety at home, and electrical energy, power and costs.',
    ),
    parts: [
      {
        code: '9.1',
        title: L('Elektrostatik', 'Electrostatics'),
        summary: L('Elektrische Ladungen und Felder, Elektroskop, Spannung durch Ladungstrennung.', 'Electric charges and fields, the electroscope, voltage from separating charges.'),
      },
      {
        code: '9.2',
        title: L('Elektrische Stromkreise', 'Electric circuits'),
        summary: L(
          'Elektronen-Atomrumpf-Modell, Strom als Ladungstransport, Widerstand und Ohmsches Gesetz, Reihen- und Parallelschaltung, Sicherheitsvorrichtungen.',
          'Electron–ion-core model, current as transport of charge, resistance and Ohm’s law, series and parallel circuits, safety devices.',
        ),
        simulations: ['einfacher-stromkreis', 'ohmsches-gesetz', 'reihe-parallel'],
      },
      {
        code: '9.3',
        title: L('Elektrische Energie und Leistung', 'Electrical energy and power'),
        summary: L(
          'Energie und Leistung elektrischer Geräte berechnen und Energiekosten ermitteln.',
          'Calculating the energy and power of electrical appliances and working out energy costs.',
        ),
      },
    ],
  },
  {
    code: '10',
    title: L('Ionisierende Strahlung und Kernenergie', 'Ionising radiation and nuclear energy'),
    summary: L(
      'Atomaufbau, Alpha-, Beta-, Gamma- und Röntgenstrahlung, Zerfall und Halbwertszeit, Wirkung und Schutz sowie Kernspaltung, Kernfusion und Kernkraftwerke.',
      'Atomic structure, alpha, beta, gamma and X-radiation, decay and half-life, effects and protection, as well as nuclear fission, fusion and nuclear power plants.',
    ),
    parts: [
      {
        code: '10.1',
        title: L('Atomaufbau und ionisierende Strahlung', 'Atomic structure and ionising radiation'),
        summary: L(
          'Strahlungsarten, Ablenkung geladener Teilchen im Magnetfeld (qualitativ), radioaktiver Zerfall als Zufallsprozess und Halbwertszeit.',
          'Types of radiation, deflection of charged particles in a magnetic field (qualitative), radioactive decay as a random process and half-life.',
        ),
        simulations: ['radioaktiver-zerfall', 'lorentzkraft'],
      },
      {
        code: '10.2',
        title: L('Wechselwirkung von Strahlung mit Materie', 'Interaction of radiation with matter'),
        summary: L(
          'Nachweis und Absorption von Strahlung, biologische Wirkung, Medizin und Strahlenschutz.',
          'Detection and absorption of radiation, biological effects, medicine and radiation protection.',
        ),
      },
      {
        code: '10.3',
        title: L('Kernenergie', 'Nuclear energy'),
        summary: L('Kernspaltung, Kernfusion, Kernkraftwerke und Endlagerung.', 'Nuclear fission, nuclear fusion, nuclear power plants and final disposal.'),
      },
    ],
  },
  {
    code: '11',
    title: L('Energieversorgung', 'Energy supply'),
    summary: L(
      'Induktion in Generator und Transformator, Elektromotor, Wechselspannung, Kraftwerke und erneuerbare Energien, Übertragung, Wirkungsgrad und Nachhaltigkeit.',
      'Induction in generators and transformers, electric motors, alternating voltage, power stations and renewable energy, transmission, efficiency and sustainability.',
    ),
    parts: [
      {
        code: '11.1',
        title: L('Induktion und Elektromagnetismus', 'Induction and electromagnetism'),
        summary: L(
          'Magnetfelder von Leiter und Spule, Elektromotor, Generator, Wechselspannung und Transformator.',
          'Magnetic fields of wires and coils, electric motors, generators, alternating voltage and transformers.',
        ),
        simulations: ['induktion'],
      },
      {
        code: '11.2',
        title: L('Bereitstellung und Nutzung von Energie', 'Providing and using energy'),
        summary: L(
          'Kraftwerke und regenerative Anlagen, Energieübertragung mit Hochspannung, Entwertung, Wirkungsgrad, Speicherung und Nachhaltigkeit.',
          'Power stations and renewable plants, high-voltage transmission, energy dissipation, efficiency, storage and sustainability.',
        ),
      },
    ],
  },
];

/** Einführungsphase (Kap. 2.2 des Kernlehrplans Sekundarstufe II). */
const EF_UNITS: CurriculumUnit[] = [
  {
    code: 'EF-1',
    title: L('Grundlagen der Mechanik', 'Foundations of mechanics'),
    summary: L(
      'Bewegungen mit Diagrammen und Gleichungen beschreiben, mit den Newton’schen Gesetzen und Kräften erklären und mit Energie- und Impulserhaltung bilanzieren.',
      'Describing motion with graphs and equations, explaining it with Newton’s laws and forces, and accounting for it with conservation of energy and momentum.',
    ),
    parts: [
      {
        code: 'EF-1.1',
        title: L('Kinematik', 'Kinematics'),
        summary: L(
          'Gleichförmige und gleichmäßig beschleunigte Bewegung, freier Fall, waagerechter Wurf und vektorielle Größen.',
          'Uniform and uniformly accelerated motion, free fall, horizontal projection and vector quantities.',
        ),
        simulations: ['bewegungsdiagramme', 'freier-fall', 'schiefer-wurf'],
      },
      {
        code: 'EF-1.2',
        title: L('Dynamik', 'Dynamics'),
        summary: L(
          'Newton’sche Gesetze, beschleunigende Kräfte, Kräftegleichgewicht mit Komponentenzerlegung und Reibung.',
          'Newton’s laws, accelerating forces, equilibrium of forces using components, and friction.',
        ),
        simulations: ['kraefteaddition', 'schiefe-ebene'],
      },
      {
        code: 'EF-1.3',
        title: L('Erhaltungssätze', 'Conservation laws'),
        summary: L(
          'Impuls und mechanische Energie (Lage-, Bewegungs-, Spannenergie), Energiebilanzen und eindimensionale Stöße.',
          'Momentum and mechanical energy (potential, kinetic, elastic), energy balances and one-dimensional collisions.',
        ),
        simulations: ['energieerhaltung', 'stoesse'],
      },
    ],
  },
  {
    code: 'EF-2',
    title: L('Kreisbewegung, Gravitation und physikalische Weltbilder', 'Circular motion, gravitation and physical world views'),
    summary: L(
      'Kreisbewegung und Zentripetalkraft, Newtons Gravitationsgesetz und die Kepler’schen Gesetze sowie der Weg vom geozentrischen Weltbild zur speziellen Relativitätstheorie.',
      'Circular motion and centripetal force, Newton’s law of gravitation and Kepler’s laws, and the path from the geocentric world view to special relativity.',
    ),
    parts: [
      {
        code: 'EF-2.1',
        title: L('Kreisbewegung', 'Circular motion'),
        summary: L('Gleichförmige Kreisbewegung und Zentripetalkraft, auch quantitativ.', 'Uniform circular motion and centripetal force, also quantitatively.'),
        simulations: ['kreisbewegung'],
      },
      {
        code: 'EF-2.2',
        title: L('Gravitation', 'Gravitation'),
        summary: L(
          'Schwerkraft, Newton’sches Gravitationsgesetz, Kepler’sche Gesetze und Gravitationsfeld.',
          'Gravity, Newton’s law of gravitation, Kepler’s laws and the gravitational field.',
        ),
        simulations: ['planetenbahnen'],
      },
      {
        code: 'EF-2.3',
        title: L('Wandel physikalischer Weltbilder', 'Changing physical world views'),
        summary: L(
          'Geo- und heliozentrisches Weltbild, Grundprinzipien der speziellen Relativitätstheorie und Zeitdilatation an der Lichtuhr.',
          'Geocentric and heliocentric world views, basic principles of special relativity and time dilation with the light clock.',
        ),
      },
    ],
  },
];

/** Qualifikationsphase, Grundkurs (Kap. 2.3.1) und Leistungskurs (Kap. 2.3.2). */
const Q_UNITS: CurriculumUnit[] = [
  {
    code: 'GK-1',
    title: L('Klassische Wellen und geladene Teilchen in Feldern (Grundkurs)', 'Classical waves and charged particles in fields (basic course)'),
    summary: L(
      'Federpendel, harmonische Schwingungen und Wellen mit Huygens, Interferenz und stehenden Wellen; elektrische und magnetische Felder und die Bahn von Elektronen im Fadenstrahlrohr.',
      'Spring pendulum, harmonic oscillations and waves with Huygens, interference and standing waves; electric and magnetic fields and the path of electrons in the fine-beam tube.',
    ),
    parts: [
      {
        code: 'GK-1.1',
        title: L('Klassische Wellen', 'Classical waves'),
        summary: L(
          'Federpendel, harmonische Schwingungen und Wellen, Huygens’sches Prinzip, Reflexion, Brechung, Beugung, Superposition, stehende Wellen, Polarisation sowie Doppelspalt und Gitter mit Licht.',
          'Spring pendulum, harmonic oscillations and waves, Huygens’ principle, reflection, refraction, diffraction, superposition, standing waves, polarisation, and double slit and grating with light.',
        ),
        simulations: ['federpendel', 'wellen-ausbreitung', 'interferenz', 'stehende-wellen', 'doppelspalt'],
      },
      {
        code: 'GK-1.2',
        title: L('Teilchen in Feldern', 'Particles in fields'),
        summary: L(
          'Elektrische und magnetische Felder, Feldstärke, Spannung und Flussdichte, Feldlinienbilder, Millikan-Versuch und Bahnformen geladener Teilchen in homogenen Feldern.',
          'Electric and magnetic fields, field strength, voltage and flux density, field-line patterns, the Millikan experiment and paths of charged particles in uniform fields.',
        ),
        simulations: ['feldlinien', 'lorentzkraft'],
      },
    ],
  },
  {
    code: 'GK-2',
    title: L('Quantenobjekte (Grundkurs)', 'Quantum objects (basic course)'),
    summary: L(
      'Licht hat Teilchen-, Elektronen haben Welleneigenschaften: Photoeffekt, De-Broglie-Wellenlänge, Interferenz von Elektronen und die Deutung von Quantenobjekten.',
      'Light has particle properties and electrons have wave properties: photoelectric effect, de Broglie wavelength, electron interference and the interpretation of quantum objects.',
    ),
    parts: [
      {
        code: 'GK-2.1',
        title: L('Teilchenaspekte von Photonen', 'Particle aspects of photons'),
        summary: L('Energiequantelung von Licht und Photoeffekt.', 'Quantisation of light energy and the photoelectric effect.'),
        simulations: ['photoeffekt'],
      },
      {
        code: 'GK-2.2',
        title: L('Wellenaspekt von Elektronen', 'Wave aspect of electrons'),
        summary: L('De-Broglie-Wellenlänge und Interferenz von Elektronen.', 'De Broglie wavelength and interference of electrons.'),
        simulations: ['elektronenbeugung'],
      },
      {
        code: 'GK-2.3',
        title: L('Photon und Elektron als Quantenobjekte', 'Photon and electron as quantum objects'),
        summary: L(
          'Wellen- und Teilchenmodell, Wahrscheinlichkeitsdeutung, „Welcher-Weg“-Information und Kopenhagener Deutung.',
          'Wave and particle models, probability interpretation, which-way information and the Copenhagen interpretation.',
        ),
      },
    ],
  },
  {
    code: 'GK-3',
    title: L('Elektrodynamik und Energieübertragung (Grundkurs)', 'Electrodynamics and energy transmission (basic course)'),
    summary: L(
      'Induktionsgesetz, Generator und Transformator, Fernübertragung von Energie, Kondensator laden und entladen sowie die elektromagnetische Schwingung.',
      'Law of induction, generator and transformer, long-distance transmission of energy, charging and discharging a capacitor, and electromagnetic oscillation.',
    ),
    parts: [
      {
        code: 'GK-3.1',
        title: L('Elektrodynamik', 'Electrodynamics'),
        summary: L(
          'Magnetischer Fluss, elektromagnetische Induktion und Induktionsgesetz, Wechselspannung, Auf- und Entladung des Kondensators.',
          'Magnetic flux, electromagnetic induction and the law of induction, alternating voltage, charging and discharging a capacitor.',
        ),
        simulations: ['induktion', 'kondensator'],
      },
      {
        code: 'GK-3.2',
        title: L('Energieübertragung', 'Energy transmission'),
        summary: L(
          'Generator und Transformator, Freileitungen und die elektromagnetische Schwingung.',
          'Generator and transformer, overhead power lines and electromagnetic oscillation.',
        ),
        simulations: ['induktion'],
      },
    ],
  },
  {
    code: 'GK-4',
    title: L('Strahlung und Materie (Grundkurs)', 'Radiation and matter (basic course)'),
    summary: L(
      'Elektromagnetisches Spektrum und ionisierende Strahlung, Linienspektren und Energieniveaus der Atomhülle sowie Kernumwandlungen, Zerfallsgesetz, Kernspaltung und Kernfusion.',
      'Electromagnetic spectrum and ionising radiation, line spectra and energy levels of the atomic shell, as well as nuclear transformations, the decay law, fission and fusion.',
    ),
    parts: [
      {
        code: 'GK-4.1',
        title: L('Strahlung', 'Radiation'),
        summary: L(
          'Spektrum elektromagnetischer Strahlung, ionisierende Strahlung, Geiger-Müller-Zählrohr und biologische Wirkungen.',
          'Spectrum of electromagnetic radiation, ionising radiation, the Geiger–Müller counter and biological effects.',
        ),
      },
      {
        code: 'GK-4.2',
        title: L('Atomphysik', 'Atomic physics'),
        summary: L(
          'Linienspektren, Energieniveauschema, Franck-Hertz-Versuch, Kern-Hülle-Modell und Röntgenstrahlung.',
          'Line spectra, energy level diagrams, the Franck–Hertz experiment, the nuclear model of the atom and X-rays.',
        ),
        simulations: ['linienspektren'],
      },
      {
        code: 'GK-4.3',
        title: L('Kernphysik', 'Nuclear physics'),
        summary: L(
          'Nukleonen, Zerfallsprozesse und Kernumwandlungen, Zerfallsgesetz und Halbwertszeit, Kernspaltung und -fusion.',
          'Nucleons, decay processes and nuclear transformations, the decay law and half-life, fission and fusion.',
        ),
        simulations: ['radioaktiver-zerfall'],
      },
    ],
  },
  {
    code: 'LK-1',
    title: L('Ladungen, Felder und Induktion (Leistungskurs)', 'Charges, fields and induction (advanced course)'),
    summary: L(
      'Elektrische und magnetische Felder mit Coulomb’schem Gesetz, Potential und Kondensator, Bahnen geladener Teilchen in Feldern sowie Induktion und Selbstinduktion.',
      'Electric and magnetic fields with Coulomb’s law, potential and capacitors, paths of charged particles in fields, as well as induction and self-induction.',
    ),
    parts: [
      {
        code: 'LK-1.1',
        title: L('Elektrische Ladungen und Felder', 'Electric charges and fields'),
        summary: L(
          'Ladungen, Feldstärke, Coulomb’sches Gesetz, Potential und Spannung, Kondensator und Kapazität mit Lade- und Entladekurven; magnetische Flussdichte.',
          'Charges, field strength, Coulomb’s law, potential and voltage, capacitor and capacitance with charging and discharging curves; magnetic flux density.',
        ),
        simulations: ['feldlinien', 'kondensator'],
      },
      {
        code: 'LK-1.2',
        title: L('Bewegungen in Feldern', 'Motion in fields'),
        summary: L(
          'Geladene Teilchen in elektrischen Längs- und Querfeldern, Lorentzkraft und gekreuzte Felder.',
          'Charged particles in longitudinal and transverse electric fields, the Lorentz force and crossed fields.',
        ),
        simulations: ['lorentzkraft'],
      },
      {
        code: 'LK-1.3',
        title: L('Elektromagnetische Induktion', 'Electromagnetic induction'),
        summary: L(
          'Magnetischer Fluss, Induktionsgesetz, Lenz’sche Regel, Selbstinduktion und Induktivität.',
          'Magnetic flux, the law of induction, Lenz’s law, self-induction and inductance.',
        ),
        simulations: ['induktion'],
      },
    ],
  },
  {
    code: 'LK-2',
    title: L('Schwingende Systeme und Wellen (Leistungskurs)', 'Oscillating systems and waves (advanced course)'),
    summary: L(
      'Mechanische und elektromagnetische Schwingungen mit Differentialgleichungen, Dämpfung und Resonanz, Wellenphänomene, Interferenz an Spalt und Gitter, Michelson-Interferometer und Hertz’scher Dipol.',
      'Mechanical and electromagnetic oscillations with differential equations, damping and resonance, wave phenomena, interference at slits and gratings, the Michelson interferometer and the Hertzian dipole.',
    ),
    parts: [
      {
        code: 'LK-2.1',
        title: L('Schwingungen und Wellen', 'Oscillations and waves'),
        summary: L(
          'Harmonische Schwingungen und ihre Kenngrößen, Wellengleichung, Huygens’sches Prinzip, Reflexion, Brechung, Beugung, Polarisation, Superposition und Michelson-Interferometer.',
          'Harmonic oscillations and their parameters, the wave equation, Huygens’ principle, reflection, refraction, diffraction, polarisation, superposition and the Michelson interferometer.',
        ),
        simulations: ['wellen-ausbreitung', 'interferenz', 'stehende-wellen', 'doppelspalt'],
      },
      {
        code: 'LK-2.2',
        title: L('Schwingende Systeme', 'Oscillating systems'),
        summary: L(
          'Federpendel, Fadenpendel, gedämpfte und erzwungene Schwingungen und Resonanz, Schwingkreis und Hertz’scher Dipol.',
          'Spring and simple pendulum, damped and forced oscillations and resonance, the LC circuit and the Hertzian dipole.',
        ),
        simulations: ['federpendel', 'fadenpendel', 'resonanz'],
      },
    ],
  },
  {
    code: 'LK-3',
    title: L('Quantenphysik (Leistungskurs)', 'Quantum physics (advanced course)'),
    summary: L(
      'Photoeffekt und Planck’sches Wirkungsquantum, Bremsstrahlung, Bragg-Reflexion und Elektronenbeugung, Wellenfunktion, Delayed-Choice-Experiment und Unbestimmtheitsrelation.',
      'Photoelectric effect and Planck’s constant, bremsstrahlung, Bragg reflection and electron diffraction, the wave function, the delayed-choice experiment and the uncertainty principle.',
    ),
    parts: [
      {
        code: 'LK-3.1',
        title: L('Teilchenaspekte von Photonen', 'Particle aspects of photons'),
        summary: L('Energiequantelung von Licht, Photoeffekt und Bremsstrahlung.', 'Quantisation of light energy, the photoelectric effect and bremsstrahlung.'),
        simulations: ['photoeffekt'],
      },
      {
        code: 'LK-3.2',
        title: L('Photonen und Elektronen als Quantenobjekte', 'Photons and electrons as quantum objects'),
        summary: L(
          'Doppelspaltexperiment, Bragg-Reflexion, Elektronenbeugung, Wahrscheinlichkeitsdeutung, Delayed-Choice-Experiment und Kopenhagener Deutung.',
          'Double-slit experiment, Bragg reflection, electron diffraction, probability interpretation, the delayed-choice experiment and the Copenhagen interpretation.',
        ),
        simulations: ['elektronenbeugung'],
      },
    ],
  },
  {
    code: 'LK-4',
    title: L('Atom- und Kernphysik (Leistungskurs)', 'Atomic and nuclear physics (advanced course)'),
    summary: L(
      'Atommodelle bis zum Potentialtopf, Energieniveaus und Röntgenstrahlung, Arten und Nachweis ionisierender Strahlung, Zerfallsgesetz und Altersbestimmung sowie Kernspaltung und Kernfusion.',
      'Atomic models up to the potential well, energy levels and X-rays, types and detection of ionising radiation, the decay law and dating, as well as nuclear fission and fusion.',
    ),
    parts: [
      {
        code: 'LK-4.1',
        title: L('Atomaufbau', 'Atomic structure'),
        summary: L(
          'Atommodelle, eindimensionaler Potentialtopf, Energieniveauschema, Linienspektren, Franck-Hertz-Versuch und Röntgenstrahlung.',
          'Atomic models, the one-dimensional potential well, energy level diagrams, line spectra, the Franck–Hertz experiment and X-rays.',
        ),
        simulations: ['linienspektren'],
      },
      {
        code: 'LK-4.2',
        title: L('Ionisierende Strahlung', 'Ionising radiation'),
        summary: L(
          'Strahlungsarten, ihr Nachweis, ihre Eigenschaften und ihre Absorption.',
          'Types of radiation, their detection, properties and absorption.',
        ),
      },
      {
        code: 'LK-4.3',
        title: L('Radioaktiver Zerfall', 'Radioactive decay'),
        summary: L(
          'Kernaufbau, Zerfallsreihen, Zerfallsgesetz, Halbwertszeit und Altersbestimmung mit C-14.',
          'Nuclear structure, decay series, the decay law, half-life and carbon-14 dating.',
        ),
        simulations: ['radioaktiver-zerfall'],
      },
      {
        code: 'LK-4.4',
        title: L('Kernspaltung und -fusion', 'Nuclear fission and fusion'),
        summary: L(
          'Bindungsenergien, Massendefekt und Kettenreaktion.',
          'Binding energies, mass defect and chain reaction.',
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
 * Physik am Gymnasium in Nordrhein-Westfalen (G9) nach den Kernlehrplänen des
 * Ministeriums für Schule und Bildung NRW:
 * - „Kernlehrplan für die Sekundarstufe I – Gymnasium in Nordrhein-Westfalen, Physik“,
 *   Heft 3411, 1. Auflage 2019 (RdErl. vom 23.06.2019, in Kraft ab 01.08.2019 für die
 *   Klassen 5 und 6 aufsteigend), Klassen 5–10;
 * - „Kernlehrplan für die Sekundarstufe II – Gymnasium/Gesamtschule in
 *   Nordrhein-Westfalen, Physik“ (RdErl. vom 07.08.2026, ABl. NRW. 08/26, in Kraft
 *   ab 01.08.2027 beginnend mit der Einführungsphase), Jahrgangsstufen 11–13.
 *
 * Aufbereitung und Protokoll: docs/lehrplaene/nordrhein-westfalen-gymnasium-physik.{json,md}.
 * Einordnung (Teil E): Erprobungsstufe = Klassen 5/6, Inhaltsfelder 5–11 = Klassen 7–10
 * (ohne Verteilung im Lehrplan), Einführungsphase = 11, Qualifikationsphase = 12/13.
 * Nummern der Schwerpunkte und die Codes der Oberstufe sind selbst vergeben.
 *
 * Überschriften entsprechen dem Kernlehrplan; die Kurzbeschreibungen sind eigene
 * Zusammenfassungen. Verbindlich ist der Originaltext.
 */
export const nordrheinWestfalenGymnasiumPhysik: StateCurriculum = {
  id: 'nordrhein-westfalen-gymnasium-physik',
  subject: 'physik',
  slug: L('nordrhein-westfalen-gymnasium', 'north-rhine-westphalia-gymnasium'),
  state: L('Nordrhein-Westfalen', 'North Rhine-Westphalia'),
  schoolType: L('Gymnasium', 'Gymnasium'),
  sourceName: 'Kernlehrplan',
  grades: [
    grade(5, ERPROBUNGSSTUFE, ERPROBUNG_UNITS),
    grade(6, ERPROBUNGSSTUFE, ERPROBUNG_UNITS),
    grade(7, SEK_I, SEK_I_UNITS),
    grade(8, SEK_I, SEK_I_UNITS),
    grade(9, SEK_I, SEK_I_UNITS),
    grade(10, SEK_I, SEK_I_UNITS),
    grade(11, EF, EF_UNITS),
    grade(12, QPHASE, Q_UNITS),
    grade(13, QPHASE, Q_UNITS),
  ],
};
