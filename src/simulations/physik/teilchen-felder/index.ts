import { defineSimulation, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  fadenRadius,
  HELMHOLTZ_K,
  screenSpot,
  specificCharge,
  checkTask,
  cyclotron,
  deflection,
  E,
  floatVoltage,
  hallVoltage,
  helix,
  makeTask,
  MP,
  SAMPLES,
  spectrometerRadius,
  speedAfter,
  type FieldTask,
  type SampleId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
/** Plattenkondensator der Ablenkung: Länge 5 cm, Abstand 2 cm; Schirm 15 cm hinter dem Ende. */
const PL = 0.05;
const PD = 0.02;
const SCREEN = 0.15;
/** Millikan: Tröpfchenradius 1 µm, Öl 875 kg/m³, Plattenabstand 5 mm. */
const DROP_R = 0.8e-6;
const RHO = 875;
const MD = 0.005;

/**
 * Geladene Teilchen in elektrischen und magnetischen Feldern: Elektronenkanone,
 * Ablenkung im Querfeld, Millikan-Versuch, Zyklotron und Hall-Effekt.
 */
export default defineSimulation({
  id: 'teilchen-felder',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'laengs', label: L('Beschleunigung im Längsfeld', 'Acceleration in a longitudinal field') },
        { value: 'quer', label: L('Ablenkung im Querfeld', 'Deflection in a transverse field') },
        { value: 'millikan', label: L('Millikan-Versuch', 'Millikan experiment') },
        { value: 'zyklotron', label: L('Zyklotron', 'Cyclotron') },
        { value: 'hall', label: L('Hall-Effekt', 'Hall effect') },
        { value: 'spektro', label: L('Massenspektrometer', 'Mass spectrometer') },
        { value: 'spirale', label: L('Schraubenbahn und Polarlicht', 'Helical path and aurora') },
        { value: 'faden', label: L('Fadenstrahlrohr: e/m bestimmen', 'Fine-beam tube: measuring e/m') },
        { value: 'oszi', label: L('Oszilloskop: Bilder aus Spannungen', 'Oscilloscope: pictures from voltages') },
        { value: 'ueben', label: L('Üben: Aufgaben', 'Practice: tasks') },
      ],
      default: 'quer',
    },
    {
      key: 'Ua',
      type: 'number',
      label: L('Beschleunigungsspannung U_B', 'Accelerating voltage U_B'),
      min: 100,
      max: 5000,
      step: 50,
      default: 1000,
      unit: 'V',
      visibleIf: (v) => v.mode === 'laengs' || v.mode === 'quer',
    },
    { key: 'Ud', type: 'number', label: L('Ablenkspannung U_y', 'Deflecting voltage U_y'), min: -300, max: 300, step: 10, default: 100, unit: 'V', visibleIf: (v) => v.mode === 'quer' },
    {
      key: 'n',
      type: 'number',
      label: L('Ladung des Tröpfchens (Vielfache von e)', 'Charge of the droplet (multiples of e)'),
      min: 1,
      max: 6,
      step: 1,
      default: 3,
      visibleIf: (v) => v.mode === 'millikan',
      spoiler: true,
    },
    { key: 'Um', type: 'number', label: L('Spannung am Kondensator', 'Voltage across the plates'), min: 0, max: 600, step: 1, default: 200, unit: 'V', visibleIf: (v) => v.mode === 'millikan' },
    {
      key: 'B',
      type: 'number',
      label: L('Magnetische Flussdichte B', 'Magnetic flux density B'),
      min: 0.1,
      max: 2,
      step: 0.1,
      default: 1,
      unit: 'T',
      visibleIf: (v) => v.mode === 'zyklotron' || v.mode === 'hall' || v.mode === 'spirale',
    },
    { key: 'Uz', type: 'number', label: L('Spannung zwischen den Duanten', 'Voltage between the dees'), min: 5, max: 50, step: 1, default: 20, unit: 'kV', visibleIf: (v) => v.mode === 'zyklotron' },
    { key: 'I', type: 'number', label: L('Stromstärke im Plättchen', 'Current in the plate'), min: 0.1, max: 5, step: 0.1, default: 1, unit: 'A', visibleIf: (v) => v.mode === 'hall' },
    {
      key: 'stoff',
      type: 'choice',
      label: L('Plättchen aus', 'Plate made of'),
      options: [
        { value: 'cu', label: L('Kupfer', 'copper') },
        { value: 'hl', label: L('Halbleiter (dotiert)', 'semiconductor (doped)') },
      ],
      default: 'hl',
      visibleIf: (v) => v.mode === 'hall',
    },
    {
      key: 'probe',
      type: 'choice',
      label: L('Probe', 'Sample'),
      options: [
        { value: 'kohlenstoff', label: L('Kohlenstoff', 'carbon') },
        { value: 'chlor', label: L('Chlor', 'chlorine') },
        { value: 'neon', label: L('Neon', 'neon') },
        { value: 'uran', label: L('Uran', 'uranium') },
      ],
      default: 'chlor',
      display: 'menu',
      visibleIf: (v) => v.mode === 'spektro',
    },
    {
      key: 'B2',
      type: 'number',
      label: L('Magnetfeld im Ablenkraum B', 'Magnetic field in the deflection chamber B'),
      min: 0.2,
      max: 1.5,
      step: 0.05,
      default: 0.5,
      unit: 'T',
      visibleIf: (v) => v.mode === 'spektro',
    },
    {
      key: 'al',
      type: 'number',
      label: L('Winkel zwischen Flugrichtung und Feld', 'Angle between velocity and field'),
      min: 0,
      max: 90,
      step: 5,
      default: 60,
      unit: '°',
      visibleIf: (v) => v.mode === 'spirale',
    },
    { key: 'uf', type: 'number', label: L('Beschleunigungsspannung', 'Accelerating voltage'), min: 100, max: 300, step: 10, default: 200, unit: 'V', visibleIf: (v) => v.mode === 'faden' },
    { key: 'ih', type: 'number', label: L('Spulenstrom', 'Coil current'), min: 0.5, max: 3, step: 0.1, default: 1.5, unit: 'A', visibleIf: (v) => v.mode === 'faden' },
    { key: 'osaw', type: 'boolean', label: L('Zeitablenkung (Sägezahn) in x-Richtung', 'time base (sawtooth) in x direction'), default: true, visibleIf: (v) => v.mode === 'oszi' },
    { key: 'fr', type: 'number', label: L('Frequenzverhältnis y : x', 'Frequency ratio y : x'), min: 1, max: 4, step: 1, default: 2, visibleIf: (v) => v.mode === 'oszi' },
    { key: 'ph', type: 'number', label: L('Phasenverschiebung', 'Phase shift'), min: 0, max: 180, step: 15, default: 90, unit: '°', visibleIf: (v) => v.mode === 'oszi' && v.osaw === false },
    { key: 'ay', type: 'number', label: L('Amplitude in y', 'Amplitude in y'), min: 0.2, max: 1, step: 0.1, default: 0.8, visibleIf: (v) => v.mode === 'oszi' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 10, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'faden'
      ? L(
          'Das Magnetfeld der Spulen zwingt die Elektronen auf einen Kreis. Aus Spannung, Feld und Radius folgt e/m.',
          'The magnetic field of the coils forces the electrons onto a circle. Voltage, field and radius give e/m.',
        )
      : v.mode === 'oszi'
        ? L(
            'Zwei Spannungen lenken den Elektronenstrahl in x und y ab. Mit Zeitablenkung siehst du den Verlauf, mit zwei Sinusspannungen Lissajous-Figuren.',
            'Two voltages deflect the electron beam in x and y. With a time base you see the waveform, with two sine voltages Lissajous figures.',
          )
        : v.mode === 'spektro'
          ? L(
              'Schwere Isotope fliegen im Magnetfeld einen größeren Halbkreis – so trennt das Spektrometer Atome nach ihrer Masse.',
              'Heavier isotopes fly a larger semicircle in the magnetic field – that is how the spectrometer separates atoms by mass.',
            )
          : v.mode === 'spirale'
            ? L(
                'Fliegt ein Elektron schräg zum Magnetfeld, kreist es und läuft gleichzeitig weiter: eine Schraube. So gelangen Teilchen der Sonne zu den Polen.',
                'If an electron flies at an angle to the magnetic field, it circles and moves along at the same time: a helix. That is how particles from the Sun reach the poles.',
              )
            : v.mode === 'ueben'
              ? L('Gib die Zahl oder die Nummer der Antwort ein und drücke „Prüfen“.', 'Enter the number or the number of the answer and press “Check”.')
              : v.mode === 'millikan'
                ? L(
                    'Stell die Spannung so ein, dass das Tröpfchen schwebt. Dann ist die elektrische Kraft so groß wie die Gewichtskraft.',
                    'Set the voltage so that the droplet hovers. Then the electric force equals the weight.',
                  )
                : v.mode === 'zyklotron'
                  ? L(
                      'Bei jedem Spaltdurchgang wird das Proton schneller, die Bahn größer – die Umlaufzeit bleibt gleich.',
                      'At every gap crossing the proton gets faster and the orbit larger – the period stays the same.',
                    )
                  : v.mode === 'hall'
                    ? L(
                        'Das Magnetfeld drückt die Ladungsträger zur Seite. Dort sammeln sie sich und erzeugen die Hall-Spannung.',
                        'The magnetic field pushes the charge carriers sideways, where they pile up and create the Hall voltage.',
                      )
                    : L('Elektronen werden von der Glühkathode zur Anode beschleunigt.', 'Electrons are accelerated from the hot cathode to the anode.'),
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'v', label: L('Geschwindigkeit', 'Velocity'), spoiler: true },
    { key: 'y', label: L('Ablenkung', 'Deflection'), spoiler: true },
    { key: 'mil', label: L('Tröpfchen', 'Droplet'), spoiler: true },
    { key: 'cyc', label: L('Zyklotron', 'Cyclotron'), spoiler: true },
    { key: 'hall', label: L('Hall-Spannung', 'Hall voltage'), spoiler: true },
    { key: 'ms', label: L('Auftreffpunkte', 'Impact points'), spoiler: true },
    { key: 'hx', label: L('Schraubenbahn', 'Helix'), spoiler: true },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'gun', label: L('Elektronenkanone', 'Electron gun'), values: { mode: 'laengs', Ua: 1000 } },
    { id: 'braun', label: L('Ablenkung', 'Deflection'), values: { mode: 'quer', Ua: 1000, Ud: 100 } },
    { id: 'mil', label: L('Millikan', 'Millikan'), values: { mode: 'millikan', n: 3 } },
    { id: 'cyc', label: L('Zyklotron', 'Cyclotron'), values: { mode: 'zyklotron', B: 1, Uz: 20 } },
    { id: 'hall', label: L('Hall-Sonde', 'Hall probe'), values: { mode: 'hall', stoff: 'hl', B: 0.5, I: 1 } },
    { id: 'hochspannung', label: L('Hohe Spannung: fast 10 % der Lichtgeschwindigkeit', 'High voltage: almost 10 % of the speed of light'), values: { mode: 'laengs', Ua: 5000 } },
    { id: 'negativ', label: L('Ablenkung nach unten', 'Deflection downwards'), values: { mode: 'quer', Ua: 2000, Ud: -200 } },
    { id: 'mil5', label: L('Millikan: fünf Elementarladungen', 'Millikan: five elementary charges'), values: { mode: 'millikan', n: 5 } },
    { id: 'kupfer', label: L('Hall-Effekt in Kupfer', 'Hall effect in copper'), values: { mode: 'hall', stoff: 'cu', B: 1, I: 5 } },
    { id: 'chlor', label: L('Chlor-Isotope 35 und 37', 'Chlorine isotopes 35 and 37'), values: { mode: 'spektro', probe: 'chlor', B2: 0.5 } },
    { id: 'c14', label: L('Kohlenstoff 12 und 13', 'Carbon 12 and 13'), values: { mode: 'spektro', probe: 'kohlenstoff', B2: 0.3 } },
    { id: 'uran', label: L('Uran anreichern: 235 und 238', 'Enriching uranium: 235 and 238'), values: { mode: 'spektro', probe: 'uran', B2: 1.5 } },
    { id: 'polar', label: L('Polarlicht: Schraubenbahn', 'Aurora: helical path'), values: { mode: 'spirale', al: 60, B: 1 } },
    { id: 'kreis', label: L('Senkrecht zum Feld: Kreis', 'Perpendicular to the field: circle'), values: { mode: 'spirale', al: 90, B: 1 } },
    { id: 'faden', label: L('Fadenstrahlrohr: 200 V, 1,5 A', 'Fine-beam tube: 200 V, 1.5 A'), values: { mode: 'faden', uf: 200, ih: 1.5 } },
    { id: 'fadenGross', label: L('Zu schwaches Feld: Strahl trifft das Glas', 'Field too weak: beam hits the glass'), values: { mode: 'faden', uf: 300, ih: 0.8 } },
    { id: 'saege', label: L('Oszilloskop: zwei Schwingungen sichtbar', 'Oscilloscope: two oscillations visible'), values: { mode: 'oszi', osaw: true, fr: 2, ay: 0.8 } },
    { id: 'kreis', label: L('Lissajous: Kreis (1 : 1, 90°)', 'Lissajous: circle (1 : 1, 90°)'), values: { mode: 'oszi', osaw: false, fr: 1, ph: 90, ay: 1 } },
    { id: 'acht', label: L('Lissajous: Acht (2 : 1)', 'Lissajous: figure of eight (2 : 1)'), values: { mode: 'oszi', osaw: false, fr: 2, ph: 0, ay: 1 } },
    { id: 'quiz', label: L('Üben: acht Aufgabenarten', 'Practice: eight kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasF: 'Fadenstrahlrohr: Elektronen fliegen im Feld zweier Spulen auf einem leuchtenden Kreis; daneben Spannung, Feld, Radius und e/m',
      canvasO: 'Schirm eines Oszilloskops mit dem Bild des Elektronenstrahls',
      fR: 'Bahnradius r ≈ {r} cm',
      fEm: 'e/m = 2U / (B²r²) ≈ {em} · 10¹¹ C/kg',
      fGlass: 'Der Kreis ist größer als der Glaskolben – Strahl trifft das Glas.',
      fInfo:
        'Die Lorentzkraft wirkt als Zentripetalkraft: e·v·B = m·v²/r. Mit e·U = ½·m·v² folgt e/m = 2U / (B² r²) ≈ 1,76 · 10¹¹ C/kg. Daraus und aus der Elementarladung erhält man die Masse des Elektrons.',
      oSaw: 'Zeitablenkung: x wächst gleichmäßig, dann springt der Strahl zurück',
      oSawInfo: 'So zeigt das Oszilloskop, wie sich die y-Spannung mit der Zeit ändert: Hier sind {n} Schwingungen zu sehen.',
      oLiss: 'Lissajous-Figur: x und y sind beide Sinusspannungen',
      oLissInfo: 'Bei einem Frequenzverhältnis von {n} : 1 hat die Figur oben {n} Bögen. So vergleicht man Frequenzen.',
      oInfo: 'In der Braun’schen Röhre lenken zwei Plattenpaare den Elektronenstrahl ab: das eine waagerecht, das andere senkrecht. Wo der Strahl auf den Schirm trifft, leuchtet er.',
      canvasS: 'Massenspektrometer: Ionen fliegen durch einen Geschwindigkeitsfilter und im Magnetfeld auf Halbkreisen zu einem Detektor; daneben die Häufigkeit der Isotope',
      canvasH: 'Ein Elektron fliegt schräg zu einem Magnetfeld und beschreibt eine Schraubenbahn; daneben die Erde mit Polarlicht',
      canvasQ: 'Übungsaufgabe zu geladenen Teilchen in Feldern mit Rückmeldung und Punktestand',
      sSource: 'Ionenquelle',
      sFilter: 'Geschwindigkeitsfilter',
      sDet: 'Detektor',
      sHit: '{A}: Abstand {d} cm, Anteil {p} %',
      sInfo: 'Nur Ionen mit v = E/B gelangen durch den Filter. Im Magnetfeld gilt r = m·v / (q·B): Die schwereren Isotope fliegen weiter.',
      hVal: 'Radius {r}, Ganghöhe {h}',
      hInfo:
        'Die Kraft wirkt nur auf den Anteil der Geschwindigkeit quer zum Feld. Längs zum Feld fliegt das Teilchen ungestört weiter – so führt das Erdmagnetfeld Teilchen zu den Polen, wo sie Polarlicht erzeugen.',
      hEarth: 'Polarlicht',
      qTitle: 'Aufgabe {n}',
      qYour: 'Deine Antwort: {a}',
      qHow: 'Gib die Nummer der richtigen Antwort ein.',
      qHowNum: 'Gib die Zahl ein (ohne Einheit).',
      qBad: 'Bitte eine Zahl eingeben.',
      qOk: 'Richtig!',
      qNo: 'Leider falsch. Versuch es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig, {s} in Folge',
      canvas: 'Geladene Teilchen in Feldern: Elektronenkanone, Elektronenstrahl zwischen Ablenkplatten, Öltröpfchen im Kondensator, Spiralbahn im Zyklotron oder Hall-Plättchen im Magnetfeld',
      vVal: 'v = √(2 e U_B / m) ≈ {v} m/s ({c} % der Lichtgeschwindigkeit)',
      yVal: 'im Kondensator y = U_y · l² / (4 d U_B) ≈ {y} mm, auf dem Schirm ≈ {Y} mm',
      milFloat: 'Es schwebt: q · U / d = m · g. Daraus q = {q} · 10⁻¹⁹ C = {n} · e.',
      milUp: 'Es steigt (elektrische Kraft größer als die Gewichtskraft).',
      milDown: 'Es sinkt (Gewichtskraft größer als die elektrische Kraft).',
      cycVal: 'f = e B / (2π m) ≈ {f} MHz; pro Umlauf +{dE} keV; nach {n} Umläufen r ≈ {r} cm',
      hallVal: 'U_H = B · I / (n · e · d) ≈ {u} (d = {d} mm)',
      cathode: 'Kathode',
      anode: 'Anode',
      screen: 'Schirm',
      ray: 'Elektronenstrahl',
      dee: 'Duant',
      gap: 'Spalt',
      plate: 'Plättchen',
      Bin: 'B zeigt in die Bildebene hinein',
    },
    en: {
      canvasF: 'Fine-beam tube: electrons fly on a glowing circle in the field of two coils; next to it voltage, field, radius and e/m',
      canvasO: 'Screen of an oscilloscope showing the picture of the electron beam',
      fR: 'radius of the path r ≈ {r} cm',
      fEm: 'e/m = 2U / (B²r²) ≈ {em} · 10¹¹ C/kg',
      fGlass: 'The circle is larger than the glass bulb – the beam hits the glass.',
      fInfo:
        'The Lorentz force acts as the centripetal force: e·v·B = m·v²/r. With e·U = ½·m·v² this gives e/m = 2U / (B² r²) ≈ 1.76 · 10¹¹ C/kg. Together with the elementary charge this gives the mass of the electron.',
      oSaw: 'time base: x grows steadily, then the beam jumps back',
      oSawInfo: 'This is how the oscilloscope shows how the y voltage changes with time: here you see {n} oscillations.',
      oLiss: 'Lissajous figure: x and y are both sine voltages',
      oLissInfo: 'With a frequency ratio of {n} : 1 the figure has {n} arcs at the top. This is how frequencies are compared.',
      oInfo: 'In a cathode-ray tube two pairs of plates deflect the electron beam: one horizontally, the other vertically. Where the beam hits the screen, it glows.',
      canvasS: 'Mass spectrometer: ions pass a velocity filter and fly on semicircles in a magnetic field to a detector; next to it the abundance of the isotopes',
      canvasH: 'An electron flies at an angle to a magnetic field and follows a helical path; next to it the Earth with an aurora',
      canvasQ: 'Practice task on charged particles in fields with feedback and score',
      sSource: 'ion source',
      sFilter: 'velocity filter',
      sDet: 'detector',
      sHit: '{A}: distance {d} cm, share {p} %',
      sInfo: 'Only ions with v = E/B pass the filter. In the magnetic field r = m·v / (q·B): the heavier isotopes fly further.',
      hVal: 'radius {r}, pitch {h}',
      hInfo:
        'The force only acts on the part of the velocity across the field. Along the field the particle keeps moving undisturbed – this is how the Earth’s magnetic field guides particles to the poles, where they cause aurorae.',
      hEarth: 'aurora',
      qTitle: 'Task {n}',
      qYour: 'Your answer: {a}',
      qHow: 'Enter the number of the correct answer.',
      qHowNum: 'Enter the number (without unit).',
      qBad: 'Please enter a number.',
      qOk: 'Correct!',
      qNo: 'Not quite. Try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct, {s} in a row',
      canvas: 'Charged particles in fields: electron gun, electron beam between deflecting plates, oil droplet in a capacitor, spiral path in a cyclotron or Hall plate in a magnetic field',
      vVal: 'v = √(2 e U_B / m) ≈ {v} m/s ({c} % of the speed of light)',
      yVal: 'inside the plates y = U_y · l² / (4 d U_B) ≈ {y} mm, on the screen ≈ {Y} mm',
      milFloat: 'It hovers: q · U / d = m · g, so q = {q} · 10⁻¹⁹ C = {n} · e.',
      milUp: 'It rises (electric force larger than the weight).',
      milDown: 'It sinks (weight larger than the electric force).',
      cycVal: 'f = e B / (2π m) ≈ {f} MHz; +{dE} keV per turn; after {n} turns r ≈ {r} cm',
      hallVal: 'U_H = B · I / (n · e · d) ≈ {u} (d = {d} mm)',
      cathode: 'cathode',
      anode: 'anode',
      screen: 'screen',
      ray: 'electron beam',
      dee: 'dee',
      gap: 'gap',
      plate: 'plate',
      Bin: 'B points into the page',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let anim = 0;
    let dropY = 0.5;

    const hallN = () => (p.stoff === 'cu' ? 8.5e28 : 1e22);
    const hallD = () => (p.stoff === 'cu' ? 1e-4 : 1e-3);
    const floatU = () => floatVoltage(DROP_R, RHO, p.n, MD);

    function volt(u: number): string {
      const a = Math.abs(u);
      if (a >= 1) return `${fmt.num(u, 2)} V`;
      if (a >= 1e-3) return `${fmt.num(u * 1e3, 2)} mV`;
      return `${fmt.num(u * 1e6, 2)} µV`;
    }

    /* Übung */
    let task: FieldTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    /** Spektrometer: Geschwindigkeit hinter dem Wien-Filter (m/s). */
    const V_ION = 1e5;
    /** Schraubenbahn: Geschwindigkeit des Elektrons (m/s). */
    const V_EL = 1e7;

    /** Länge mit passender Einheit. */
    function len(x: number): string {
      if (x >= 1e-2) return `${fmt.num(x * 100, 1)} cm`;
      if (x >= 1e-3) return `${fmt.num(x * 1000, 2)} mm`;
      return `${fmt.num(x * 1e6, 0)} µm`;
    }

    function updateReadouts(): void {
      for (const k of ['v', 'y', 'mil', 'cyc', 'hall', 'ms', 'hx', 'info']) ctx.readout(k, null);
      if (p.mode === 'spektro') {
        const smp = SAMPLES[p.probe as SampleId];
        ctx.readout('ms', smp.isotopes.map((iso) => `${iso.A}: ${fmt.num(2 * spectrometerRadius(iso.A, V_ION, p.B2) * 100, 1)} cm`).join(', '));
        ctx.readout('info', ctx.t('sInfo'));
        return;
      }
      if (p.mode === 'spirale') {
        const hx = helix(V_EL, p.al, p.B);
        ctx.readout('hx', tr('hVal', { r: len(hx.r), h: len(hx.pitch) }));
        ctx.readout('info', ctx.t('hInfo'));
        return;
      }
      if (p.mode === 'faden') {
        const B = HELMHOLTZ_K * p.ih;
        const rad = fadenRadius(p.uf, B);
        ctx.readout('cyc', tr('fR', { r: fmt.num(rad * 100, 1) }));
        ctx.readout('hx', tr('fEm', { em: fmt.num(specificCharge(p.uf, B, rad) / 1e11, 2) }));
        ctx.readout('info', ctx.t('fInfo'));
        return;
      }
      if (p.mode === 'oszi') {
        ctx.readout('info', ctx.t('oInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'laengs' || p.mode === 'quer') {
        const v = speedAfter(p.Ua);
        ctx.readout('v', tr('vVal', { v: `${fmt.num(v / 1e7, 2)} · 10⁷`, c: fmt.num((100 * v) / 3e8, 1) }));
        if (p.mode === 'quer') {
          const d = deflection(p.Ud, PD, PL, v);
          const Y = d.yEnd + Math.tan(d.angle) * SCREEN;
          ctx.readout('y', tr('yVal', { y: fmt.num(d.yEnd * 1000, 2), Y: fmt.num(Y * 1000, 1) }));
        }
      } else if (p.mode === 'millikan') {
        const Uf = floatU();
        if (Math.abs(p.Um - Uf) < 2) ctx.readout('mil', tr('milFloat', { q: fmt.num((p.n * E) / 1e-19, 2), n: p.n }));
        else ctx.readout('mil', ctx.t(p.Um > Uf ? 'milUp' : 'milDown'));
      } else if (p.mode === 'zyklotron') {
        const turns = 10;
        const Ek = 2 * turns * p.Uz * 1e3 * E;
        const v = Math.sqrt((2 * Ek) / MP);
        const c = cyclotron(p.B, v);
        ctx.readout('cyc', tr('cycVal', { f: fmt.num(c.f / 1e6, 2), dE: fmt.num(2 * p.Uz, 0), n: turns, r: fmt.num(c.r * 100, 1) }));
      } else {
        ctx.readout('hall', tr('hallVal', { u: volt(hallVoltage(p.B, p.I, hallN(), hallD())), d: fmt.num(hallD() * 1000, 1) }));
      }
    }

    function dots(g: CanvasRenderingContext2D, pts: [number, number][], color: string, speed: number): void {
      // Punkte entlang eines Polygonzugs
      const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i]![0], q[1] - pts[i]![1]));
      const total = lens.reduce((s, v) => s + v, 0);
      g.fillStyle = color;
      const n = Math.max(6, Math.floor(total / 28));
      for (let k = 0; k < n; k++) {
        let d = ((k / n) * total + anim * speed) % total;
        let i = 0;
        while (i < lens.length - 1 && d > lens[i]!) {
          d -= lens[i]!;
          i++;
        }
        const f = d / (lens[i] || 1);
        const a = pts[i]!;
        const b = pts[i + 1]!;
        g.beginPath();
        g.arc(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, 3, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawGun(r: Rect, withPlates: boolean): void {
      const g = surface.g;
      const th = ctx.theme;
      const cy = r.y + r.h / 2;
      const x0 = r.x + 30;
      const xa = r.x + r.w * (withPlates ? 0.22 : 0.45);
      // Kathode und Anode
      g.fillStyle = th.series[1]!;
      g.fillRect(x0, cy - 22, 8, 44);
      g.fillStyle = th.muted;
      g.fillRect(xa, cy - 30, 6, 24);
      g.fillRect(xa, cy + 6, 6, 24);
      text(g, ctx.t('cathode'), x0 + 4, cy + 38, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, ctx.t('anode'), xa + 3, cy + 44, { font: `600 11px ${th.font}`, color: th.muted });
      text(g, `U_B = ${fmt.num(p.Ua, 0)} V`, (x0 + xa) / 2, cy - 40, { font: `700 12px ${th.font}`, color: th.text });
      const speed = 40 + speedAfter(p.Ua) / 2e5;
      if (!withPlates) {
        const xe = r.x + r.w - 20;
        // Feldlinien zwischen Kathode und Anode
        g.strokeStyle = withAlpha(th.series[3]!, 0.4);
        g.lineWidth = 1;
        for (const dy of [-14, 0, 14]) {
          g.beginPath();
          g.moveTo(xa, cy + dy);
          g.lineTo(x0 + 8, cy + dy);
          g.stroke();
        }
        dots(
          g,
          [
            [x0 + 10, cy],
            [xe, cy],
          ],
          th.series[0]!,
          speed,
        );
        text(g, ctx.t('ray'), (xa + xe) / 2, cy - 16, { font: `600 12px ${th.font}`, color: th.muted });
        return;
      }
      // Ablenkplatten und Schirm, Weltmaßstab
      const xp0 = xa + 30;
      const sc = (r.w - (xp0 - r.x) - 40) / (PL + SCREEN);
      const xp1 = xp0 + PL * sc;
      const xs = xp0 + (PL + SCREEN) * sc;
      const gap = Math.min(r.h * 0.3, PD * sc);
      g.fillStyle = p.Ud >= 0 ? th.series[1]! : th.series[0]!;
      g.fillRect(xp0, cy - gap / 2 - 6, xp1 - xp0, 6);
      g.fillStyle = p.Ud >= 0 ? th.series[0]! : th.series[1]!;
      g.fillRect(xp0, cy + gap / 2, xp1 - xp0, 6);
      text(g, p.Ud >= 0 ? '+' : '−', xp0 - 10, cy - gap / 2 - 3, { font: `800 14px ${th.font}`, color: th.text });
      text(g, p.Ud >= 0 ? '−' : '+', xp0 - 10, cy + gap / 2 + 3, { font: `800 14px ${th.font}`, color: th.text });
      g.fillStyle = th.muted;
      g.fillRect(xs, r.y + 20, 6, r.h - 40);
      text(g, ctx.t('screen'), xs + 3, r.y + 12, { font: `600 11px ${th.font}`, color: th.muted });
      // Bahn: Parabel im Kondensator (nach oben zur Plus-Platte), danach Gerade; Maßstab quer überhöht
      const v = speedAfter(p.Ua);
      const d = deflection(p.Ud, PD, PL, v);
      const yScale = gap / PD;
      const pts: [number, number][] = [
        [x0 + 10, cy],
        [xp0, cy],
      ];
      let hit = false;
      for (let k = 1; k <= 30; k++) {
        const x = (PL * k) / 30;
        const y = d.k * x * x;
        if (Math.abs(y) > PD / 2) {
          hit = true;
          pts.push([xp0 + x * sc, cy - Math.sign(y) * (gap / 2)]);
          break;
        }
        pts.push([xp0 + x * sc, cy - y * yScale]);
      }
      if (!hit) {
        const Y = d.yEnd + Math.tan(d.angle) * SCREEN;
        const yPix = Math.max(r.y + 20, Math.min(r.y + r.h - 20, cy - Y * yScale));
        pts.push([xs, yPix]);
        g.fillStyle = th.series[2]!;
        g.beginPath();
        g.arc(xs + 3, yPix, 6, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = withAlpha(th.series[0]!, 0.4);
      g.lineWidth = 2;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      dots(g, pts, th.series[0]!, speed);
    }

    function drawMillikan(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const top = r.y + 40;
      const bot = r.y + r.h - 40;
      const w = Math.min(r.w * 0.7, 360);
      g.fillStyle = th.series[1]!;
      g.fillRect(cx - w / 2, top - 8, w, 8);
      g.fillStyle = th.series[0]!;
      g.fillRect(cx - w / 2, bot, w, 8);
      text(g, '+', cx - w / 2 - 14, top - 4, { font: `800 16px ${th.font}`, color: th.text });
      text(g, '−', cx - w / 2 - 14, bot + 4, { font: `800 16px ${th.font}`, color: th.text });
      text(g, `U = ${fmt.num(p.Um, 0)} V`, cx, bot + 24, { font: `700 13px ${th.font}`, color: th.text });
      const y = top + 14 + dropY * (bot - top - 28);
      g.fillStyle = th.series[3]!;
      g.beginPath();
      g.arc(cx, y, 9, 0, Math.PI * 2);
      g.fill();
      // Kräfte
      const Uf = floatU();
      const fe = (p.Um / Uf) * 40;
      g.strokeStyle = th.series[2]!;
      g.fillStyle = th.series[2]!;
      g.lineWidth = 3;
      const arrow = (dy: number, color: string) => {
        g.strokeStyle = color;
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(cx + (dy > 0 ? 16 : -16), y);
        g.lineTo(cx + (dy > 0 ? 16 : -16), y + dy);
        g.stroke();
        const s = Math.sign(dy);
        g.beginPath();
        g.moveTo(cx + (dy > 0 ? 16 : -16), y + dy + s * 2);
        g.lineTo(cx + (dy > 0 ? 16 : -16) - 6, y + dy - s * 8);
        g.lineTo(cx + (dy > 0 ? 16 : -16) + 6, y + dy - s * 8);
        g.closePath();
        g.fill();
      };
      arrow(40, th.series[1]!);
      if (fe > 1) arrow(-fe, th.series[2]!);
      text(g, 'F_G', cx + 30, y + 30, { font: `700 12px ${th.font}`, color: th.series[1]!, align: 'left' });
      if (fe > 1) text(g, 'F_el', cx - 30, y - Math.min(fe, 60) + 10, { font: `700 12px ${th.font}`, color: th.series[2]!, align: 'right' });
    }

    function drawCyclotron(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const R = Math.min(r.w, r.h) * 0.42;
      const gapW = 14;
      // Duanten
      g.fillStyle = withAlpha(th.series[4]!, 0.18);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      for (const side of [-1, 1]) {
        g.beginPath();
        g.arc(cx + (side * gapW) / 2, cy, R, side < 0 ? Math.PI / 2 : -Math.PI / 2, side < 0 ? (3 * Math.PI) / 2 : Math.PI / 2);
        g.closePath();
        g.fill();
        g.stroke();
      }
      text(g, ctx.t('dee'), cx - R * 0.6, cy - R * 0.75, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, ctx.t('dee'), cx + R * 0.6, cy - R * 0.75, { font: `600 12px ${th.font}`, color: th.muted });
      text(g, '⊗ B', cx + R * 0.7, cy + R * 0.8, { font: `700 13px ${th.font}`, color: th.text });
      // Spirale: Halbkreise mit wachsendem Radius (r ∝ √(Anzahl der Spaltdurchgänge)), abwechselnd rechts und links
      const turns = 10;
      const r1 = (0.75 * R) / Math.sqrt(2 * turns);
      g.strokeStyle = withAlpha(th.series[1]!, 0.55);
      g.lineWidth = 1.5;
      g.beginPath();
      const pts: [number, number][] = [];
      let ya = cy;
      for (let k = 0; k < 2 * turns; k++) {
        const rk = r1 * Math.sqrt(k + 1);
        const right = k % 2 === 0;
        const xs = cx + (right ? gapW / 2 : -gapW / 2);
        const yc = right ? ya - rk : ya + rk;
        for (let i = 0; i <= 24; i++) {
          const t = i / 24;
          const ang = right ? Math.PI / 2 - t * Math.PI : -Math.PI / 2 - t * Math.PI;
          pts.push([xs + Math.cos(ang) * rk, yc + Math.sin(ang) * rk]);
        }
        ya = right ? ya - 2 * rk : ya + 2 * rk;
      }
      pts.forEach(([px, py], i) => (i ? g.lineTo(px, py) : g.moveTo(px, py)));
      g.stroke();
      // Teilchen
      const n = pts.length;
      const idx = Math.floor((anim * 60) % n);
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.arc(pts[idx]![0], pts[idx]![1], 6, 0, Math.PI * 2);
      g.fill();
      text(g, ctx.t('gap'), cx, cy + R + 14, { font: `600 11px ${th.font}`, color: th.muted });
    }

    function drawHall(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const w = Math.min(r.w * 0.6, 340);
      const h = Math.min(r.h * 0.45, 160);
      roundRect(g, cx - w / 2, cy - h / 2, w, h, 6);
      g.fillStyle = withAlpha(th.muted, 0.18);
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      // B-Feld in die Ebene
      g.strokeStyle = withAlpha(th.text, 0.35);
      g.lineWidth = 1.5;
      for (let i = 0; i < 6; i++)
        for (let j = 0; j < 3; j++) {
          const x = cx - w / 2 + ((i + 0.5) * w) / 6;
          const y = cy - h / 2 + ((j + 0.5) * h) / 3;
          g.beginPath();
          g.moveTo(x - 5, y - 5);
          g.lineTo(x + 5, y + 5);
          g.moveTo(x + 5, y - 5);
          g.lineTo(x - 5, y + 5);
          g.stroke();
        }
      text(g, ctx.t('Bin'), cx, cy + h / 2 + 50, { font: `600 11px ${th.font}`, color: th.muted });
      // Elektronen fließen von rechts nach links (Strom nach rechts), werden nach oben abgelenkt (Lorentzkraft)
      const shift = Math.min(1, (p.B * p.I) / 5);
      g.fillStyle = th.series[0]!;
      for (let k = 0; k < 14; k++) {
        const f = (k / 14 + anim * 0.15 * p.I) % 1;
        const x = cx + w / 2 - f * w;
        const y = cy + ((k % 3) - 1) * h * 0.2 - shift * h * 0.25 * Math.min(1, f * 3);
        g.beginPath();
        g.arc(x, y, 4, 0, Math.PI * 2);
        g.fill();
      }
      // angesammelte Ladungen
      const nq = Math.round(shift * 8);
      for (let k = 0; k < nq; k++) {
        const x = cx - w / 2 + ((k + 0.5) * w) / 8;
        text(g, '−', x, cy - h / 2 + 10, { font: `800 14px ${th.font}`, color: th.series[0]! });
        text(g, '+', x, cy + h / 2 - 10, { font: `800 14px ${th.font}`, color: th.series[1]! });
      }
      // Stromrichtung und Hall-Spannung
      text(g, `I = ${fmt.num(p.I, 1)} A →`, cx, cy - h / 2 - 16, { font: `700 12px ${th.font}`, color: th.text });
      text(g, `U_H ≈ ${volt(hallVoltage(p.B, p.I, hallN(), hallD()))}`, cx + w / 2, cy + h / 2 + 18, { font: `700 13px ${th.font}`, color: th.series[2]!, align: 'right' });
      text(g, ctx.t('plate'), cx - w / 2, cy + h / 2 + 18, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
    }

    /* ---------- Massenspektrometer ---------- */
    function drawSpectro(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = r.w < 700;
      const smp = SAMPLES[p.probe as SampleId];
      const radii = smp.isotopes.map((iso) => spectrometerRadius(iso.A, V_ION, p.B2));
      const maxR = Math.max(...radii);
      const chartW = narrow ? 0 : r.w * 0.28;
      const area: Rect = { x: r.x + 20, y: r.y + 30, w: r.w - chartW - 40, h: r.h - 60 };
      // Detektorlinie oben, Eintritt links
      const yDet = area.y + 40;
      const xIn = area.x + (narrow ? 60 : 120);
      const scale = Math.min((area.x + area.w - xIn - 10) / (2 * maxR * 1.05), (area.y + area.h - yDet - 10) / (maxR * 1.05));
      // Magnetfeldraum (nur so tief wie nötig)
      const yBot = Math.min(area.y + area.h, yDet + maxR * scale + 40);
      g.fillStyle = withAlpha(th.series[0]!, 0.08);
      g.fillRect(xIn, yDet, area.x + area.w - xIn, yBot - yDet);
      for (let x = xIn + 14; x < area.x + area.w; x += 28) {
        for (let y = yDet + 14; y < yBot; y += 28) {
          text(g, '×', x, y, { font: `500 12px ${th.font}`, color: withAlpha(th.muted, 0.6) });
        }
      }
      text(g, `B = ${fmt.num(p.B2, 2)} T`, area.x + area.w - 6, yBot - 10, { font: `700 12px ${th.font}`, color: th.series[0]!, align: 'right' });
      // Quelle und Filter
      roundRect(g, area.x, yDet - 14, 34, 28, 5);
      g.fillStyle = th.muted;
      g.fill();
      text(g, ctx.t('sSource'), area.x, yDet + 26, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      roundRect(g, area.x + 42, yDet - 10, xIn - area.x - 50, 20, 4);
      g.strokeStyle = th.series[3]!;
      g.lineWidth = 2;
      g.stroke();
      if (!narrow) text(g, ctx.t('sFilter'), area.x + 42, yDet - 22, { font: `600 11px ${th.font}`, color: th.series[3]!, align: 'left' });
      // Detektor
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(xIn, yDet - 2);
      g.lineTo(area.x + area.w, yDet - 2);
      g.stroke();
      text(g, ctx.t('sDet'), area.x + area.w - 4, yDet + 14, { font: `600 11px ${th.font}`, color: th.text, align: 'right' });
      // Bahnen
      const cols = [th.series[0]!, th.series[1]!, th.series[2]!];
      smp.isotopes.forEach((iso, k) => {
        const rr = radii[k]! * scale;
        const cxp = xIn + rr;
        const col = cols[k % cols.length]!;
        g.strokeStyle = withAlpha(col, 0.35 + 0.65 * Math.min(1, iso.share * 3 + 0.2));
        g.lineWidth = 1 + 4 * Math.min(1, iso.share * 2);
        g.beginPath();
        g.arc(cxp, yDet, rr, Math.PI, 0, true);
        g.stroke();
        // Ionen auf der Bahn
        const nDots = 3;
        for (let j = 0; j < nDots; j++) {
          const u = (anim * 0.35 + j / nDots) % 1;
          const a = Math.PI - u * Math.PI;
          g.beginPath();
          g.arc(cxp + rr * Math.cos(a), yDet + rr * Math.sin(a), 3.5, 0, Math.PI * 2);
          g.fillStyle = col;
          g.fill();
        }
        // Auftreffpunkt
        g.beginPath();
        g.arc(xIn + 2 * rr, yDet - 2, 6, 0, Math.PI * 2);
        g.fillStyle = col;
        g.fill();
        text(g, `${iso.A}`, xIn + 2 * rr, yDet - 28 - (k % 2) * 14, { font: `800 13px ${th.font}`, color: col });
      });
      // Häufigkeiten als Balken
      if (!narrow) {
        const cx0 = r.x + r.w - chartW + 10;
        const cw = chartW - 30;
        text(g, smp.name[ctx.lang], cx0, r.y + 40, { font: `800 15px ${th.font}`, color: th.text, align: 'left' });
        smp.isotopes.forEach((iso, k) => {
          const y = r.y + 70 + k * 46;
          const col = cols[k % cols.length]!;
          roundRect(g, cx0, y, Math.max(4, cw * iso.share), 18, 4);
          g.fillStyle = col;
          g.fill();
          text(g, tr('sHit', { A: iso.A, d: fmt.num(2 * radii[k]! * 100, 1), p: fmt.num(iso.share * 100, 1) }), cx0, y + 32, { font: `500 12px ${th.font}`, color: th.muted, align: 'left' });
        });
      }
    }

    /* ---------- Schraubenbahn ---------- */
    function drawHelix(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = r.w < 700;
      const hx = helix(V_EL, p.al, p.B);
      const sceneW = narrow ? r.w : r.w * 0.68;
      const cy = r.y + r.h * (narrow ? 0.4 : 0.5);
      const x0 = r.x + 40;
      const x1 = r.x + sceneW - 30;
      // Feldlinien (B nach rechts)
      g.strokeStyle = withAlpha(th.series[0]!, 0.35);
      g.lineWidth = 1;
      for (let k = -2; k <= 2; k++) {
        const y = cy + k * 34;
        g.beginPath();
        g.moveTo(x0 - 20, y);
        g.lineTo(x1 + 10, y);
        g.stroke();
        text(g, '›', x1 + 14, y, { font: `700 16px ${th.font}`, color: withAlpha(th.series[0]!, 0.6) });
      }
      text(g, `B = ${fmt.num(p.B, 1)} T`, x1, cy - 2 * 34 - 16, { font: `700 12px ${th.font}`, color: th.series[0]!, align: 'right' });
      // Darstellung: Radius in Pixeln fest, Ganghöhe im echten Verhältnis zum Radius
      let Rpx = Math.min(60, r.h * 0.18) * (p.al === 0 ? 0 : Math.max(0.15, Math.sin((p.al * Math.PI) / 180)));
      const ratio = hx.r > 0 ? hx.pitch / hx.r : 0;
      const turnsShown = 4;
      const pitchPx = p.al === 0 ? (x1 - x0) / turnsShown : Math.min((x1 - x0) / turnsShown, ratio * (Rpx || 1));
      // Verhältnis Radius : Ganghöhe beibehalten, wenn die Ganghöhe begrenzt wird
      if (ratio > 0 && pitchPx < ratio * Rpx) Rpx = pitchPx / ratio;
      const total = p.al === 90 ? 2 * Math.PI : Math.min(turnsShown * 2 * Math.PI, ((x1 - x0) / Math.max(pitchPx, 1)) * 2 * Math.PI);
      const pos = (ph: number): [number, number, number] => {
        const x = x0 + (pitchPx * ph) / (2 * Math.PI);
        const y = -Rpx * Math.cos(ph);
        const z = Rpx * Math.sin(ph);
        return [x + 0.3 * z, cy + y, z];
      };
      // ganze Bahn blass, Teil bis jetzt kräftig
      const now = prefersReducedMotion() ? total : (anim * 2.5) % (total + 1.5);
      // Segmente: vorne (z > 0) kräftig, hinten blass; noch nicht durchlaufen ganz blass
      for (let ph = 0; ph < total; ph += 0.05) {
        const [xa, ya, za] = pos(ph);
        const [xb, yb] = pos(Math.min(total, ph + 0.05));
        const done = ph <= now;
        const front = za >= 0;
        g.strokeStyle = withAlpha(th.series[3]!, (done ? 1 : 0.25) * (front ? 1 : 0.45));
        g.lineWidth = front ? 2.8 : 1.6;
        g.beginPath();
        g.moveTo(xa, ya);
        g.lineTo(xb, yb);
        g.stroke();
      }
      const [ex, ey] = pos(Math.min(now, total));
      g.beginPath();
      g.arc(ex, ey, 6, 0, Math.PI * 2);
      g.fillStyle = th.series[3]!;
      g.fill();
      text(g, '−', ex, ey, { font: `800 11px ${th.font}`, color: th.bg });
      // Werte
      const fs = narrow ? 13 : 15;
      let y = narrow ? r.y + r.h * 0.7 : r.y + r.h - 70;
      text(g, `α = ${fmt.num(p.al, 0)}°   ${tr('hVal', { r: len(hx.r), h: len(hx.pitch) })}`, r.x + 16, y, { font: `700 ${fs}px ${th.font}`, color: th.text, align: 'left' });
      y += fs * 1.7;
      text(g, `v = 10⁷ m/s`, r.x + 16, y, { font: `500 ${fs - 1}px ${th.font}`, color: th.muted, align: 'left' });
      // Erde mit Feld und Polarlicht
      if (!narrow) {
        const ecx = r.x + sceneW + (r.w - sceneW) / 2;
        const ecy = r.y + r.h * 0.42;
        const R = Math.min((r.w - sceneW) * 0.28, 70);
        g.strokeStyle = withAlpha(th.series[0]!, 0.4);
        g.lineWidth = 1;
        for (const k of [1.6, 2.2, 2.9]) {
          g.beginPath();
          g.ellipse(ecx - R * k * 0.5, ecy, R * k * 0.5, R * k * 0.6, 0, 0, Math.PI * 2);
          g.stroke();
          g.beginPath();
          g.ellipse(ecx + R * k * 0.5, ecy, R * k * 0.5, R * k * 0.6, 0, 0, Math.PI * 2);
          g.stroke();
        }
        g.beginPath();
        g.arc(ecx, ecy, R, 0, Math.PI * 2);
        g.fillStyle = withAlpha(th.series[0]!, 0.7);
        g.fill();
        // Polarlicht an den Polen
        for (const s of [-1, 1]) {
          g.beginPath();
          g.ellipse(ecx, ecy + s * R * 0.92, R * 0.45, R * 0.12, 0, 0, Math.PI * 2);
          g.strokeStyle = withAlpha(th.series[2]!, 0.6 + 0.4 * Math.sin(anim * 3));
          g.lineWidth = 4;
          g.stroke();
        }
        text(g, ctx.t('hEarth'), ecx, ecy - R - 16, { font: `700 13px ${th.font}`, color: th.series[2]! });
      }
    }

    /* ---------- Übung ---------- */
    function wrap(g: CanvasRenderingContext2D, str: string, maxW: number): string[] {
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawQuiz(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const pad = narrow ? 18 : 36;
      const maxW = W - 2 * pad;
      let y = pad;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.series[0]!;
      g.fillText(tr('qTitle', { n: p.qn }), pad, y);
      y += narrow ? 26 : 32;
      const fs = narrow ? 16 : 20;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 8;
      if (task.choices) {
        g.font = `600 ${narrow ? 14 : 16}px ${th.font}`;
        task.choices.forEach((c, i) => {
          g.fillStyle = p.qa.trim() === String(i + 1) ? th.series[0]! : th.text;
          g.fillText(`${i + 1}  ${c[ctx.lang]}`, pad + 12, y);
          y += narrow ? 22 : 26;
        });
        y += 6;
      }
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: ans }) : ctx.t(task.choices ? 'qHow' : 'qHowNum'), pad, y);
      y += 28;
      if (badInput) {
        g.fillStyle = th.series[3]!;
        g.fillText(ctx.t('qBad'), pad, y);
        y += 26;
      }
      if (verdict !== null) {
        g.font = `800 ${narrow ? 20 : 26}px ${th.font}`;
        g.fillStyle = verdict ? th.series[2]! : th.series[3]!;
        for (const line of wrap(g, ctx.t(verdict ? 'qOk' : 'qNo'), maxW)) {
          g.fillText(line, pad, y);
          y += narrow ? 26 : 34;
        }
        y += 4;
        if (verdict || tries >= 2) {
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          for (const line of wrap(g, `${ctx.t('qSol')}: ${task.solution[ctx.lang]}`, maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      const cnt = Math.min(10, score.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 22, 6, 0, Math.PI * 2);
        g.fillStyle = i < cnt ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function runCheck(): void {
      const res = checkTask(task, p.qa);
      if (res === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = res;
      tries += 1;
      if (tries === 1) score = { right: score.right + (res ? 1 : 0), all: score.all + 1, streak: res ? score.streak + 1 : 0 };
    }

    /* ---------- Fadenstrahlrohr ---------- */
    function drawFaden(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const wide = r.w >= 700;
      const scene: Rect = wide ? { x: r.x, y: r.y, w: r.w * 0.58, h: r.h } : { x: r.x, y: r.y, w: r.w, h: r.h * 0.62 };
      const B = HELMHOLTZ_K * p.ih;
      const rad = fadenRadius(p.uf, B);
      const TUBE = 0.075;
      const cx = scene.x + scene.w / 2;
      const cy = scene.y + scene.h / 2;
      const R = Math.min(scene.w, scene.h) * 0.42;
      const pxPerM = R / TUBE;
      // Spulen
      g.strokeStyle = withAlpha(th.series[3]!, 0.3);
      g.lineWidth = 5;
      for (const dx of [-0.18, 0.18]) {
        g.beginPath();
        g.ellipse(cx + dx * R, cy, R * 0.12, R * 1.08, 0, 0, Math.PI * 2);
        g.stroke();
      }
      // Glaskolben
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fillStyle = withAlpha(th.series[0]!, 0.06);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.stroke();
      // Elektronenkanone unten, Strahl startet nach rechts, Kreis darüber
      const gx = cx;
      const gy = cy + R * 0.85;
      g.fillStyle = th.muted;
      g.fillRect(gx - 22, gy - 4, 22, 8);
      const rp = rad * pxPerM;
      const ccy = gy - rp;
      g.save();
      g.beginPath();
      g.arc(cx, cy, R - 2, 0, Math.PI * 2);
      g.clip();
      g.strokeStyle = withAlpha(th.series[2]!, 0.85);
      g.lineWidth = 3;
      g.shadowColor = th.series[2]!;
      g.shadowBlur = 8;
      g.beginPath();
      g.arc(gx, ccy, rp, Math.PI / 2, Math.PI / 2 - 2 * Math.PI, true);
      g.stroke();
      g.shadowBlur = 0;
      // Elektron, das umläuft
      const a = Math.PI / 2 - ((anim * 1.2) % 1) * 2 * Math.PI;
      g.beginPath();
      g.arc(gx + rp * Math.cos(a), ccy + rp * Math.sin(a), 4, 0, Math.PI * 2);
      g.fillStyle = th.series[2]!;
      g.fill();
      g.restore();
      // Maßstab: Durchmesser
      g.strokeStyle = th.text;
      g.lineWidth = 1;
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(gx, gy);
      g.lineTo(gx, gy - 2 * rp);
      g.stroke();
      g.setLineDash([]);
      text(g, `2r = ${fmt.num(rad * 200, 1)} cm`, gx + 8, gy - rp, { font: `700 12px ${th.font}`, color: th.text, align: 'left' });
      const hitsGlass = 2 * rad > 2 * TUBE * 0.92;
      // Werte
      const panel: Rect = wide ? { x: scene.w + 20, y: 40, w: r.w - scene.w - 40, h: r.h - 80 } : { x: 16, y: scene.h + 14, w: r.w - 32, h: r.h - scene.h - 20 };
      let y = panel.y;
      const line = (str: string, col: string, weight = 600) => {
        g.font = `${weight} 13px ${th.font}`;
        for (const part of wrap(g, str, panel.w)) {
          text(g, part, panel.x, y, { font: `${weight} 13px ${th.font}`, color: col, align: 'left' });
          y += 18;
        }
        y += 2;
      };
      line(`U = ${fmt.num(p.uf, 0)} V, I = ${fmt.num(p.ih, 1)} A → B = ${fmt.num(B * 1000, 2)} mT`, th.text, 700);
      line(tr('fR', { r: fmt.num(rad * 100, 1) }), th.series[2]!, 700);
      if (hitsGlass) line(ctx.t('fGlass'), th.series[3]!, 700);
      else if (!ctx.hidden) line(tr('fEm', { em: fmt.num(specificCharge(p.uf, B, rad) / 1e11, 2) }), th.series[0]!, 700);
    }

    /* ---------- Oszilloskop ---------- */
    let tOsc = 0;
    function drawOszi(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const wide = r.w >= 700;
      const size = Math.min(wide ? r.w * 0.55 : r.w - 32, r.h - (wide ? 60 : 160));
      const sx = wide ? r.x + 30 : r.x + (r.w - size) / 2;
      const sy = r.y + 30;
      roundRect(g, sx - 8, sy - 8, size + 16, size + 16, 12);
      g.fillStyle = th.dark ? withAlpha(th.muted, 0.2) : withAlpha(th.text, 0.9);
      g.fill();
      g.strokeStyle = withAlpha(th.series[2]!, 0.25);
      g.lineWidth = 1;
      for (let k = 1; k < 8; k++) {
        g.beginPath();
        g.moveTo(sx + (k * size) / 8, sy);
        g.lineTo(sx + (k * size) / 8, sy + size);
        g.moveTo(sx, sy + (k * size) / 8);
        g.lineTo(sx + size, sy + (k * size) / 8);
        g.stroke();
      }
      const P = (t: number): [number, number] => {
        const [x, y] = screenSpot(t, p.osaw, p.fr, p.ph, p.ay);
        return [sx + ((x + 1) / 2) * size * 0.94 + size * 0.03, sy + ((1 - y) / 2) * size * 0.94 + size * 0.03];
      };
      // Nachleuchten: die letzte Periode der x-Ablenkung
      const N = 240;
      for (let k = 0; k < N; k++) {
        const t0 = tOsc - (k / N) * (p.osaw ? 1 : Math.max(1, p.fr));
        const t1 = tOsc - ((k + 1) / N) * (p.osaw ? 1 : Math.max(1, p.fr));
        const [x0, y0] = P(t0);
        const [x1, y1] = P(t1);
        if (p.osaw && Math.abs(x1 - x0) > size * 0.5) continue;
        g.strokeStyle = withAlpha(th.series[2]!, 0.9 * (1 - k / N));
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
        g.stroke();
      }
      const [cx, cy] = P(tOsc);
      g.beginPath();
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.fillStyle = th.series[2]!;
      g.fill();
      const panel: Rect = wide ? { x: sx + size + 40, y: 40, w: r.w - size - 90, h: r.h - 80 } : { x: 16, y: sy + size + 24, w: r.w - 32, h: r.h - size - 60 };
      let y = panel.y;
      const line = (str: string, col: string, weight = 600) => {
        g.font = `${weight} 13px ${th.font}`;
        for (const part of wrap(g, str, panel.w)) {
          text(g, part, panel.x, y, { font: `${weight} 13px ${th.font}`, color: col, align: 'left' });
          y += 18;
        }
        y += 4;
      };
      line(ctx.t(p.osaw ? 'oSaw' : 'oLiss'), th.text, 700);
      line(p.osaw ? tr('oSawInfo', { n: p.fr }) : tr('oLissInfo', { n: p.fr }), th.muted, 500);
    }

    const canvasKey = () => ({ faden: 'canvasF', oszi: 'canvasO', spektro: 'canvasS', spirale: 'canvasH', ueben: 'canvasQ' })[p.mode as string] ?? 'canvas';

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || changed.has('qn')) {
          task = makeTask(p.qn);
          verdict = null;
          tries = 0;
          badInput = false;
        }
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        surface.canvas.setAttribute('aria-label', ctx.t(canvasKey()));
        updateReadouts();
      },
      action(id) {
        if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        if (p.mode === 'oszi') tOsc += Math.min(dt, 0.05) * 0.5;
        anim += dt;
        if (p.mode === 'millikan') {
          const Uf = floatU();
          const vel = Math.max(-0.4, Math.min(0.4, ((Uf - p.Um) / Uf) * 0.4));
          dropY = Math.max(0, Math.min(1, dropY + vel * dt));
        }
        updateReadouts();
      },
      resetTime() {
        anim = 0;
        dropY = 0.5;
      },
      render() {
        surface.begin();
        const full: Rect = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'laengs') drawGun(full, false);
        else if (p.mode === 'quer') drawGun(full, true);
        else if (p.mode === 'millikan') drawMillikan(full);
        else if (p.mode === 'zyklotron') drawCyclotron(full);
        else if (p.mode === 'spektro') drawSpectro(full);
        else if (p.mode === 'spirale') drawHelix(full);
        else if (p.mode === 'ueben') drawQuiz();
        else if (p.mode === 'faden') drawFaden(full);
        else if (p.mode === 'oszi') drawOszi(full);
        else drawHall(full);
      },
      destroy: () => surface.destroy(),
    };
  },
});
