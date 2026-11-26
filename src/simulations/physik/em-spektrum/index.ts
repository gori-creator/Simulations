import { defineSimulation, Plot, roundRect, Surface, TapTarget, text, withAlpha, type Rect } from '../../../sim-core';
import {
  am,
  C_LIGHT,
  checkTask,
  dipoleLength,
  fm,
  frequencyOf,
  GADGETS,
  isIonizing,
  makeTask,
  photonEnergyEv,
  regionOf,
  REGIONS,
  TARGETS,
  travelTime,
  wavelengthOf,
  wavelengthToRgb,
  type GadgetId,
  type RegionId,
  type SpecTask,
  type TargetId,
} from './model';

const L = (de: string, en: string) => ({ de, en });

/** Darstellungsbereich des Spektrums: 10⁻¹⁴ m bis 10⁴ m (log₁₀ λ). */
const LG_MIN = -14;
const LG_MAX = 4;

/** Kurze Beschreibungen je Bereich: Quellen, Nutzung, Nachweis. */
const INFO: Record<RegionId, { name: [string, string]; src: [string, string]; use: [string, string] }> = {
  radio: {
    name: ['Radiowellen', 'Radio waves'],
    src: ['Antennen (schwingende Elektronen in Leitern)', 'antennas (oscillating electrons in conductors)'],
    use: ['Rundfunk, Funk, Fernsehen, RFID, Radioastronomie', 'broadcasting, radio links, TV, RFID, radio astronomy'],
  },
  micro: {
    name: ['Mikrowellen', 'Microwaves'],
    src: ['Magnetron, Sender, kosmische Hintergrundstrahlung', 'magnetron, transmitters, cosmic background radiation'],
    use: ['Mobilfunk, WLAN, Radar, Mikrowellenherd, Satelliten', 'mobile phones, Wi-Fi, radar, microwave ovens, satellites'],
  },
  ir: {
    name: ['Infrarot (Wärmestrahlung)', 'Infrared (thermal radiation)'],
    src: ['jeder warme Körper, Wärmelampe, IR-LED', 'every warm body, heat lamp, IR LED'],
    use: ['Wärmebildkamera, Fernbedienung, Glasfaser, Nachtsicht', 'thermal camera, remote control, optical fibre, night vision'],
  },
  visible: {
    name: ['Sichtbares Licht', 'Visible light'],
    src: ['Sonne, Glühlampe, LED, Laser', 'Sun, light bulb, LED, laser'],
    use: ['Sehen, Fotosynthese, Fotografie, Laser', 'vision, photosynthesis, photography, lasers'],
  },
  uv: {
    name: ['Ultraviolett (UV)', 'Ultraviolet (UV)'],
    src: ['Sonne, Quecksilberdampflampe, UV-LED', 'Sun, mercury vapour lamp, UV LED'],
    use: ['Desinfektion, Geldscheinprüfung, Bräunung (Sonnenbrand!)', 'disinfection, banknote checks, tanning (sunburn!)'],
  },
  xray: {
    name: ['Röntgenstrahlung', 'X-rays'],
    src: ['Röntgenröhre (abgebremste Elektronen)', 'X-ray tube (decelerated electrons)'],
    use: ['Medizin, Gepäckkontrolle, Kristallstrukturen', 'medicine, baggage screening, crystal structures'],
  },
  gamma: {
    name: ['Gammastrahlung', 'Gamma rays'],
    src: ['Atomkerne (radioaktiver Zerfall), Weltall', 'atomic nuclei (radioactive decay), outer space'],
    use: ['Tumorbehandlung, Sterilisation, Materialprüfung', 'tumour treatment, sterilisation, materials testing'],
  },
};

/** Größenvergleich: Gegenstand mit ungefähr dieser Größe (m). */
const SIZES: [number, string, string][] = [
  [1e4, 'eine Kleinstadt', 'a small town'],
  [1e3, 'ein Dorf', 'a village'],
  [1e2, 'ein Fußballfeld', 'a football pitch'],
  [1e1, 'ein Haus', 'a house'],
  [1, 'ein Mensch', 'a person'],
  [1e-1, 'eine Hand', 'a hand'],
  [1e-2, 'eine Fingerkuppe', 'a fingertip'],
  [1e-3, 'ein Sandkorn', 'a grain of sand'],
  [1e-4, 'ein Haar (Dicke)', 'a hair (thickness)'],
  [1e-5, 'eine Zelle', 'a cell'],
  [1e-6, 'ein Bakterium', 'a bacterium'],
  [1e-7, 'ein Virus', 'a virus'],
  [1e-8, 'ein großes Molekül', 'a large molecule'],
  [1e-9, 'ein kleines Molekül', 'a small molecule'],
  [1e-10, 'ein Atom', 'an atom'],
  [1e-12, 'ein Atom ist 100-mal größer', 'an atom is 100 times larger'],
  [1e-14, 'ein Atomkern', 'an atomic nucleus'],
];

function layout(w: number, h: number): { strip: Rect; wave: Rect; card: Rect } {
  const sh = Math.min(170, Math.max(130, h * 0.34));
  if (w >= 700) {
    return {
      strip: { x: 0, y: 0, w, h: sh },
      wave: { x: 0, y: sh, w: w * 0.55, h: h - sh },
      card: { x: w * 0.55, y: sh, w: w * 0.45, h: h - sh },
    };
  }
  const wh = (h - sh) * 0.42;
  return {
    strip: { x: 0, y: 0, w, h: sh },
    wave: { x: 0, y: sh, w, h: wh },
    card: { x: 0, y: sh + wh, w, h: h - sh - wh },
  };
}

/**
 * Das elektromagnetische Spektrum vom Radio bis zur Gammastrahlung (logarithmische
 * Skala), der Hertz’sche Dipol als Sender und die Modulation (AM/FM).
 */
export default defineSimulation({
  id: 'em-spektrum',
  animated: true,
  layout: { aspect: 1.75, aspectNarrow: 0.7 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'spektrum', label: L('Spektrum', 'Spectrum') },
        { value: 'dipol', label: L('Hertz’scher Dipol (Sender)', 'Hertzian dipole (transmitter)') },
        { value: 'mod', label: L('Modulation (AM/FM)', 'Modulation (AM/FM)') },
        { value: 'alltag', label: L('Geräte im Alltag', 'Everyday devices') },
        { value: 'laufzeit', label: L('Laufzeit von Signalen', 'Signal travel time') },
        { value: 'ueben', label: L('Üben: Aufgaben', 'Practice: tasks') },
      ],
      default: 'spektrum',
      display: 'menu',
    },
    {
      key: 'ger',
      type: 'choice',
      label: L('Gerät', 'Device'),
      options: [
        { value: 'mittelwelle', label: L('Mittelwellen-Radio', 'medium-wave radio') },
        { value: 'ukw', label: L('UKW-Radio', 'FM radio') },
        { value: 'handy', label: L('Handy (LTE)', 'mobile phone (LTE)') },
        { value: 'gps', label: L('GPS', 'GPS') },
        { value: 'wlan', label: L('WLAN', 'Wi-Fi') },
        { value: 'mikro', label: L('Mikrowellenherd', 'microwave oven') },
        { value: 'fernbed', label: L('Fernbedienung', 'remote control') },
        { value: 'lampe', label: L('Licht', 'light') },
        { value: 'uvlampe', label: L('UV-Lampe', 'UV lamp') },
        { value: 'roentgen', label: L('Röntgen', 'X-ray') },
      ],
      default: 'mikro',
      display: 'menu',
      visibleIf: (v) => v.mode === 'alltag',
    },
    {
      key: 'ziel',
      type: 'choice',
      label: L('Ziel des Signals', 'Destination of the signal'),
      options: [
        { value: 'raum', label: L('WLAN-Router (10 m)', 'Wi-Fi router (10 m)') },
        { value: 'gps', label: L('GPS-Satellit', 'GPS satellite') },
        { value: 'geo', label: L('Fernsehsatellit', 'TV satellite') },
        { value: 'mond', label: L('Mond', 'Moon') },
        { value: 'sonne', label: L('Sonne', 'Sun') },
        { value: 'mars', label: L('Mars', 'Mars') },
      ],
      default: 'mond',
      display: 'menu',
      visibleIf: (v) => v.mode === 'laufzeit',
    },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 10, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
    {
      key: 'lg',
      type: 'number',
      label: L('Wellenlänge λ (Zehnerpotenz)', 'Wavelength λ (power of ten)'),
      min: LG_MIN,
      max: LG_MAX,
      step: 0.05,
      default: -6.3,
      visibleIf: (v) => v.mode === 'spektrum',
    },
    { key: 'fMHz', type: 'number', label: L('Frequenz f', 'Frequency f'), min: 50, max: 1000, step: 1, default: 100, unit: 'MHz', visibleIf: (v) => v.mode === 'dipol' },
    {
      key: 'art',
      type: 'choice',
      label: L('Modulation', 'Modulation'),
      options: [
        { value: 'am', label: L('Amplitudenmodulation (AM)', 'amplitude modulation (AM)') },
        { value: 'fm', label: L('Frequenzmodulation (FM)', 'frequency modulation (FM)') },
      ],
      default: 'am',
      visibleIf: (v) => v.mode === 'mod',
    },
    { key: 'm', type: 'number', label: L('Modulationsgrad m', 'Modulation depth m'), min: 0, max: 1, step: 0.05, default: 0.6, visibleIf: (v) => v.mode === 'mod' && v.art === 'am' },
    {
      key: 'hub',
      type: 'number',
      label: L('Frequenzhub (relativ)', 'Frequency deviation (relative)'),
      min: 0,
      max: 0.6,
      step: 0.05,
      default: 0.4,
      visibleIf: (v) => v.mode === 'mod' && v.art === 'fm',
    },
    { key: 'ton', type: 'number', label: L('Tonfrequenz (relativ)', 'Audio frequency (relative)'), min: 1, max: 4, step: 1, default: 2, visibleIf: (v) => v.mode === 'mod' },
  ],
  hint: (v) =>
    v.mode === 'alltag'
      ? L('Wähle ein Gerät: Wo liegt es im Spektrum, und wie viel Energie trägt ein Photon?', 'Pick a device: where is it in the spectrum, and how much energy does a photon carry?')
      : v.mode === 'laufzeit'
        ? L(
            'Drücke Start: Alle elektromagnetischen Wellen laufen mit Lichtgeschwindigkeit, rund 300 000 km pro Sekunde.',
            'Press play: all electromagnetic waves travel at the speed of light, about 300 000 km per second.',
          )
        : v.mode === 'ueben'
          ? L('Gib die Zahl oder die Nummer der Antwort ein und drücke „Prüfen“.', 'Enter the number or the number of the answer and press “Check”.')
          : v.mode === 'spektrum'
            ? L('Tipp: Tippe auf das Band, um eine Wellenlänge auszuwählen.', 'Tip: tap the band to pick a wavelength.')
            : v.mode === 'dipol'
              ? L('Die Ladungen im Stab schwingen hin und her und senden eine Welle aus (Zeitlupe).', 'The charges in the rod oscillate and send out a wave (slow motion).')
              : L('Der Ton (oben) wird der schnellen Trägerschwingung (Mitte) aufgeprägt.', 'The audio signal (top) is imprinted on the fast carrier (middle).'),
  readouts: [
    { key: 'lambda', label: L('Wellenlänge', 'Wavelength') },
    { key: 'f', label: L('Frequenz', 'Frequency'), spoiler: true },
    { key: 'E', label: L('Energie eines Photons', 'Photon energy'), spoiler: true },
    { key: 'region', label: L('Bereich', 'Region'), spoiler: true },
    { key: 'size', label: L('So groß wie', 'About the size of') },
    { key: 'dip', label: L('Dipol', 'Dipole'), spoiler: true },
    { key: 'mod', label: L('Was passiert?', 'What happens?') },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  actions: [
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  presets: [
    { id: 'green', label: L('Grünes Licht', 'Green light'), values: { mode: 'spektrum', lg: -6.3 } },
    { id: 'ukw', label: L('UKW-Radio (3 m)', 'FM radio (3 m)'), values: { mode: 'spektrum', lg: 0.5 } },
    { id: 'wlan', label: L('WLAN (12 cm)', 'Wi-Fi (12 cm)'), values: { mode: 'spektrum', lg: -0.9 } },
    { id: 'xray', label: L('Röntgen (0,1 nm)', 'X-ray (0.1 nm)'), values: { mode: 'spektrum', lg: -10 } },
    { id: 'dipol', label: L('UKW-Antenne', 'FM antenna'), values: { mode: 'dipol', fMHz: 100 } },
    { id: 'am', label: L('AM', 'AM'), values: { mode: 'mod', art: 'am' } },
    { id: 'fm', label: L('FM', 'FM'), values: { mode: 'mod', art: 'fm' } },
    { id: 'uv', label: L('UV-Licht (300 nm)', 'UV light (300 nm)'), values: { mode: 'spektrum', lg: -6.5 } },
    { id: 'waerme', label: L('Wärmestrahlung (10 µm)', 'Thermal radiation (10 µm)'), values: { mode: 'spektrum', lg: -5 } },
    { id: 'handyDipol', label: L('Handy-Antenne (900 MHz)', 'Phone antenna (900 MHz)'), values: { mode: 'dipol', fMHz: 900 } },
    { id: 'mikro', label: L('Mikrowellenherd', 'Microwave oven'), values: { mode: 'alltag', ger: 'mikro' } },
    { id: 'fernbed', label: L('Fernbedienung', 'Remote control'), values: { mode: 'alltag', ger: 'fernbed' } },
    { id: 'roentgen', label: L('Röntgen beim Arzt', 'X-ray at the doctor’s'), values: { mode: 'alltag', ger: 'roentgen' } },
    { id: 'mond', label: L('Funk zum Mond', 'Radio to the Moon'), values: { mode: 'laufzeit', ziel: 'mond' } },
    { id: 'sonne', label: L('Licht von der Sonne', 'Light from the Sun'), values: { mode: 'laufzeit', ziel: 'sonne' } },
    { id: 'gps', label: L('GPS-Signal', 'GPS signal'), values: { mode: 'laufzeit', ziel: 'gps' } },
    { id: 'quiz', label: L('Üben: sechs Aufgabenarten', 'Practice: six kinds of tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvas: 'Elektromagnetisches Spektrum als Band von Radiowellen bis Gammastrahlung mit Markierung, oder ein Hertz’scher Dipol mit ausgesandter Welle, oder Diagramme zur Modulation',
      lambdaAxis: 'Wellenlänge λ in m',
      fAxis: 'Frequenz f in Hz',
      src: 'Quellen',
      use: 'Nutzung',
      ion: 'ionisierend – kann Moleküle im Körper schädigen',
      nonIon: 'nicht ionisierend',
      lambdaVal: 'λ ≈ {v}',
      fVal: 'f = c / λ ≈ {v}',
      Eval: 'E = h · f ≈ {v} eV',
      dipVal: 'λ = c / f ≈ {l} m, Länge des Dipols l = λ / 2 ≈ {d} m',
      amText: 'AM: Die Amplitude der Trägerschwingung folgt dem Ton. Die Hüllkurve ist das Signal.',
      fmText: 'FM: Die Amplitude bleibt gleich, die Frequenz schwankt im Takt des Tons. FM ist weniger störanfällig.',
      signal: 'Ton (Signal)',
      carrier: 'Träger',
      modulated: 'moduliert',
      rod: 'Dipol',
      wave: 'E-Feld der Welle',
      cmp: 'Vergleich: λ',
      canvasA: 'Logarithmisches Band des Spektrums mit den Frequenzen von Alltagsgeräten; darunter eine Karte mit Wellenlänge, Frequenz, Photonenenergie und einer Erklärung',
      canvasL: 'Ein Signal läuft mit Lichtgeschwindigkeit von der Erde zu einem Ziel; dazu Strecke und Laufzeit',
      canvasQ: 'Übungsaufgabe zum elektromagnetischen Spektrum mit Rückmeldung und Punktestand',
      aIon: 'ionisierend – kann Zellen schädigen',
      aNonIon: 'nicht ionisierend',
      lEarth: 'Erde',
      lTime: 'Laufzeit t = s : c ≈ {t}',
      lNow: 'unterwegs: {t}',
      lSlow: 'Zeitlupe: {k}-mal langsamer',
      lFast: 'Zeitraffer: {k}-mal schneller',
      lInfo: 'Funk, Licht und Röntgenstrahlung sind alle gleich schnell: c ≈ 300 000 km/s. Deshalb sehen wir die Sonne so, wie sie vor gut 8 Minuten war.',
      qTitle: 'Aufgabe {n}',
      qYour: 'Deine Antwort: {a}',
      qHow: 'Gib die Nummer der richtigen Antwort ein.',
      qHowNum: 'Gib die Zahl ein (ohne Einheit).',
      qBad: 'Bitte eine Zahl eingeben.',
      qOk: 'Richtig!',
      qNo: 'Leider falsch. Versuch es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig, {s} in Folge',
    },
    en: {
      canvas: 'Electromagnetic spectrum as a band from radio waves to gamma rays with a marker, or a Hertzian dipole emitting a wave, or graphs on modulation',
      lambdaAxis: 'wavelength λ in m',
      fAxis: 'frequency f in Hz',
      src: 'Sources',
      use: 'Uses',
      ion: 'ionising – can damage molecules in the body',
      nonIon: 'non-ionising',
      lambdaVal: 'λ ≈ {v}',
      fVal: 'f = c / λ ≈ {v}',
      Eval: 'E = h · f ≈ {v} eV',
      dipVal: 'λ = c / f ≈ {l} m, dipole length l = λ / 2 ≈ {d} m',
      amText: 'AM: the amplitude of the carrier follows the audio signal. The envelope is the signal.',
      fmText: 'FM: the amplitude stays constant, the frequency varies with the audio signal. FM is less prone to interference.',
      signal: 'audio (signal)',
      carrier: 'carrier',
      modulated: 'modulated',
      rod: 'dipole',
      wave: 'E-field of the wave',
      cmp: 'comparison: λ',
      canvasA: 'Logarithmic band of the spectrum with the frequencies of everyday devices; below it a card with wavelength, frequency, photon energy and an explanation',
      canvasL: 'A signal travels at the speed of light from the Earth to a destination; with distance and travel time',
      canvasQ: 'Practice task on the electromagnetic spectrum with feedback and score',
      aIon: 'ionising – can damage cells',
      aNonIon: 'non-ionising',
      lEarth: 'Earth',
      lTime: 'travel time t = s / c ≈ {t}',
      lNow: 'on the way: {t}',
      lSlow: 'slow motion: {k} times slower',
      lFast: 'time-lapse: {k} times faster',
      lInfo: 'Radio, light and X-rays all travel equally fast: c ≈ 300 000 km/s. That is why we see the Sun as it was a good 8 minutes ago.',
      qTitle: 'Task {n}',
      qYour: 'Your answer: {a}',
      qHow: 'Enter the number of the correct answer.',
      qHowNum: 'Enter the number (without unit).',
      qBad: 'Please enter a number.',
      qOk: 'Correct!',
      qNo: 'Not quite. Try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct, {s} in a row',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const en = () => ctx.lang === 'en';
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    let phase = Math.PI / 3;
    let stripRect: Rect = { x: 0, y: 0, w: 1, h: 1 };
    let bandX0 = 0;
    let bandX1 = 1;

    // Modulation: drei Diagramme übereinander
    const mk = (k: number) =>
      new Plot(surface, {
        x: [0, 1],
        y: [-1.7, 1.7],
        equalAspect: false,
        pan: false,
        zoom: false,
        controls: false,
        region: (w, h) => {
          const hh = h / 3;
          return { x: 6, y: k * hh + 4, w: w - 12, h: hh - 8 };
        },
      });
    const plots = [mk(0), mk(1), mk(2)];
    for (const pl of plots) pl.setRangePadded([0, 1], [-1.7, 1.7], { left: 16, right: 16, top: 22, bottom: 8 });

    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'spektrum' || ctx.locked) return null;
        const r = stripRect;
        if (px < bandX0 || px > bandX1 || py < r.y || py > r.y + r.h) return null;
        return String(px);
      },
      onTap: (id) => {
        const px = Number(id);
        const lg = LG_MIN + ((px - bandX0) / (bandX1 - bandX0)) * (LG_MAX - LG_MIN);
        ctx.set({ lg: Math.round(lg * 20) / 20 });
      },
    });

    /** Größe mit passender Einheit, z. B. 550 nm, 3 m, 12 cm. */
    function lengthText(x: number): string {
      const units: [number, string][] = [
        [1e3, 'km'],
        [1, 'm'],
        [1e-2, 'cm'],
        [1e-3, 'mm'],
        [1e-6, 'µm'],
        [1e-9, 'nm'],
        [1e-12, 'pm'],
        [1e-15, 'fm'],
      ];
      for (const [f, u] of units) if (x >= f * 0.999) return `${fmt.num(x / f, x / f < 10 ? 2 : x / f < 100 ? 1 : 0)} ${u}`;
      return `${fmt.num(x / 1e-15, 3)} fm`;
    }
    function freqText(f: number): string {
      const units: [number, string][] = [
        [1e18, 'EHz'],
        [1e15, 'PHz'],
        [1e12, 'THz'],
        [1e9, 'GHz'],
        [1e6, 'MHz'],
        [1e3, 'kHz'],
        [1, 'Hz'],
      ];
      for (const [k, u] of units) if (f >= k * 0.999) return `${fmt.num(f / k, f / k < 10 ? 2 : f / k < 100 ? 1 : 0)} ${u}`;
      return `${fmt.num(f, 2)} Hz`;
    }
    function energyText(e: number): string {
      if (e >= 1e6) return `${fmt.num(e / 1e6, 2)} · 10⁶`;
      if (e >= 1e3) return `${fmt.num(e / 1e3, 2)} · 10³`;
      if (e >= 0.01) return fmt.num(e, e < 1 ? 3 : 2);
      const ex = Math.floor(Math.log10(e));
      const sup = String(ex)
        .replace(/-/g, '⁻')
        .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
      return `${fmt.num(e / 10 ** ex, 2)} · 10${sup}`;
    }

    /* Übung und Laufzeit */
    let task: SpecTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    /** Fortschritt des Signals 0…1 (Animation dauert gut 3 s). */
    let travel = 0;

    /** Zeit mit passender Einheit (ns, µs, ms, s, min). */
    function timeText(t: number): string {
      if (t === 0) return '0 s';
      if (t < 1e-6) return `${fmt.num(t * 1e9, 1)} ns`;
      if (t < 1e-3) return `${fmt.num(t * 1e6, 1)} µs`;
      if (t < 1) return `${fmt.num(t * 1e3, 1)} ms`;
      if (t < 120) return `${fmt.num(t, 2)} s`;
      return `${fmt.num(t / 60, 1)} min`;
    }

    function updateReadouts(): void {
      for (const k of ['lambda', 'f', 'E', 'region', 'size', 'dip', 'mod', 'info']) ctx.readout(k, null);
      if (p.mode === 'alltag') {
        const g0 = GADGETS[p.ger as GadgetId];
        const lam = wavelengthOf(g0.f);
        ctx.readout('lambda', tr('lambdaVal', { v: lengthText(lam) }));
        ctx.readout('f', tr('fVal', { v: freqText(g0.f) }));
        ctx.readout('E', tr('Eval', { v: energyText(photonEnergyEv(lam)) }));
        ctx.readout('region', `${INFO[regionOf(lam)].name[en() ? 1 : 0]} (${ctx.t(isIonizing(lam) ? 'aIon' : 'aNonIon')})`);
        ctx.readout('info', g0.fact[ctx.lang]);
        return;
      }
      if (p.mode === 'laufzeit') {
        ctx.readout('mod', tr('lTime', { t: timeText(travelTime(TARGETS[p.ziel as TargetId].d)) }));
        ctx.readout('info', ctx.t('lInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'spektrum') {
        const lam = 10 ** p.lg;
        ctx.readout('lambda', tr('lambdaVal', { v: lengthText(lam) }));
        ctx.readout('f', tr('fVal', { v: freqText(frequencyOf(lam)) }));
        ctx.readout('E', tr('Eval', { v: energyText(photonEnergyEv(lam)) }));
        const r = INFO[regionOf(lam)];
        ctx.readout('region', `${r.name[en() ? 1 : 0]} (${ctx.t(isIonizing(lam) ? 'ion' : 'nonIon')})`);
        let best = SIZES[0]!;
        for (const s of SIZES) if (Math.abs(Math.log10(s[0]) - p.lg) < Math.abs(Math.log10(best[0]) - p.lg)) best = s;
        ctx.readout('size', en() ? best[2] : best[1]);
      } else if (p.mode === 'dipol') {
        const f = p.fMHz * 1e6;
        ctx.readout('dip', tr('dipVal', { l: fmt.num(wavelengthOf(f), 2), d: fmt.num(dipoleLength(f), 2) }));
      } else {
        ctx.readout('mod', ctx.t(p.art === 'am' ? 'amText' : 'fmText'));
      }
    }

    function regionColor(id: RegionId): string {
      const th = ctx.theme;
      const map: Record<RegionId, string> = {
        radio: th.series[0]!,
        micro: th.series[4]!,
        ir: th.series[1]!,
        visible: th.series[2]!,
        uv: th.series[5]!,
        xray: th.series[3]!,
        gamma: th.series[1]!,
      };
      return map[id];
    }

    function drawSpectrum(l: ReturnType<typeof layout>): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const r = l.strip;
      stripRect = r;
      const pad = narrow ? 14 : 28;
      bandX0 = r.x + pad;
      bandX1 = r.x + r.w - pad;
      const X = (lg: number) => bandX0 + ((lg - LG_MIN) / (LG_MAX - LG_MIN)) * (bandX1 - bandX0);
      const by = r.y + (narrow ? 44 : 50);
      const bh = narrow ? 40 : 48;
      // Bereiche (Radio links: große Wellenlänge rechts? – hier steigt λ nach rechts)
      for (const reg of REGIONS) {
        const a = X(Math.max(LG_MIN, Math.log10(reg.min)));
        const b = X(Math.min(LG_MAX, Math.log10(reg.max)));
        if (reg.id === 'visible') {
          const grad = g.createLinearGradient(a, 0, b, 0);
          for (let k = 0; k <= 10; k++) {
            const nm = 380 + 40 * k;
            const [cr, cg, cb] = wavelengthToRgb(nm);
            grad.addColorStop(k / 10, `rgb(${cr},${cg},${cb})`);
          }
          g.fillStyle = grad;
        } else g.fillStyle = withAlpha(regionColor(reg.id), 0.3);
        g.fillRect(a, by, b - a, bh);
      }
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(bandX0, by, bandX1 - bandX0, bh);
      // Namen über dem Band
      const fs = narrow ? 10 : 12;
      for (const reg of REGIONS) {
        const a = X(Math.max(LG_MIN, Math.log10(reg.min)));
        const b = X(Math.min(LG_MAX, Math.log10(reg.max)));
        const full = INFO[reg.id].name[en() ? 1 : 0].replace(/ \(.*\)$/, '');
        const short: Record<RegionId, [string, string]> = {
          radio: ['Radio', 'Radio'],
          micro: ['Mikro', 'Micro'],
          ir: ['IR', 'IR'],
          visible: ['Licht', 'Light'],
          uv: ['UV', 'UV'],
          xray: ['Röntgen', 'X-ray'],
          gamma: ['Gamma', 'Gamma'],
        };
        g.font = `600 ${fs}px ${th.font}`;
        const label = g.measureText(full).width < b - a - 4 ? full : short[reg.id][en() ? 1 : 0];
        const row = reg.id === 'visible' ? 1 : 0;
        text(g, label, (a + b) / 2, by - 10 - (narrow ? row * 14 : 0), { font: `600 ${fs}px ${th.font}`, color: th.text });
      }
      // Wellenlängen-Skala unten, Frequenz-Skala darunter
      const step = narrow ? 3 : 2;
      for (let e = LG_MIN; e <= LG_MAX; e += 1) {
        const x = X(e);
        g.strokeStyle = withAlpha(th.text, 0.6);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(x, by + bh);
        g.lineTo(x, by + bh + 5);
        g.stroke();
        if ((e - LG_MIN) % step === 0) {
          text(g, `10${sup(e)}`, x, by + bh + 15, { font: `${fs}px ${th.font}`, color: th.muted });
          const fe = Math.round(Math.log10(C_LIGHT) - e);
          text(g, `10${sup(fe)}`, x, by + bh + 31, { font: `${fs}px ${th.font}`, color: th.muted });
        }
      }
      text(g, `${ctx.t('lambdaAxis')} · ${ctx.t('fAxis')} (≈)`, bandX0, by + bh + 47, { font: `600 ${fs}px ${th.font}`, color: th.muted, align: 'left' });
      // Markierung
      const mx = X(p.lg);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(mx, by);
      g.lineTo(mx, by + bh + 4);
      g.stroke();
      g.fillStyle = th.text;
      // kleines Dreieck im Band, damit es die Beschriftung darüber nicht verdeckt
      g.beginPath();
      g.moveTo(mx - 7, by);
      g.lineTo(mx + 7, by);
      g.lineTo(mx, by + 9);
      g.closePath();
      g.fill();
    }

    function sup(n: number): string {
      return String(n)
        .replace(/-/g, '⁻')
        .replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
    }

    function waveColor(): string {
      const lam = 10 ** p.lg;
      if (regionOf(lam) === 'visible') {
        const [r, g, b] = wavelengthToRgb(lam * 1e9);
        return `rgb(${r},${g},${b})`;
      }
      return regionColor(regionOf(lam));
    }

    function drawWave(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + 24;
      const x1 = r.x + r.w - 24;
      const cy = r.y + (r.h - 34) / 2 + 4;
      const amp = Math.min((r.h - 60) * 0.42, 60);
      // Drei Wellenlängen; die Welle bewegt sich nach rechts
      const n = 3;
      const lpx = (x1 - x0) / n;
      g.strokeStyle = withAlpha(th.muted, 0.5);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, cy);
      g.lineTo(x1, cy);
      g.stroke();
      g.strokeStyle = waveColor();
      g.lineWidth = 4;
      g.beginPath();
      for (let k = 0; k <= 400; k++) {
        const x = x0 + ((x1 - x0) * k) / 400;
        const y = cy - amp * Math.sin((2 * Math.PI * (x - x0)) / lpx - phase);
        if (k) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      // λ-Klammer
      const ya = cy + amp + 18;
      const xa = x0 + lpx * ((((phase / (2 * Math.PI)) % 1) + 1) % 1) + lpx / 4;
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(xa, ya - 6);
      g.lineTo(xa, ya + 6);
      g.moveTo(xa, ya);
      g.lineTo(xa + lpx, ya);
      g.moveTo(xa + lpx, ya - 6);
      g.lineTo(xa + lpx, ya + 6);
      g.stroke();
      text(g, `λ ≈ ${lengthText(10 ** p.lg)}`, xa + lpx / 2, ya + 14, { font: `700 13px ${th.font}`, color: th.text });
    }

    function drawCard(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const lam = 10 ** p.lg;
      const id = regionOf(lam);
      const info = INFO[id];
      const i = en() ? 1 : 0;
      const pad = 14;
      roundRect(g, r.x + 10, r.y + 8, r.w - 20, r.h - 16, 12);
      g.fillStyle = withAlpha(regionColor(id), 0.1);
      g.fill();
      g.strokeStyle = withAlpha(regionColor(id), 0.6);
      g.lineWidth = 1.5;
      g.stroke();
      const narrow = surface.width < 700;
      const fs = narrow ? 12 : 13;
      let y = r.y + 8 + pad + 8;
      const x = r.x + 10 + pad;
      const maxW = r.w - 20 - 2 * pad;
      text(g, info.name[i], x, y, { font: `700 ${fs + 3}px ${th.font}`, color: th.text, align: 'left' });
      y += fs + 14;
      const para = (label: string, body: string, color: string) => {
        text(g, label, x, y, { font: `700 ${fs}px ${th.font}`, color: th.muted, align: 'left' });
        y += fs + 4;
        for (const line of wrap(body, maxW, `${fs}px ${th.font}`)) {
          text(g, line, x, y, { font: `${fs}px ${th.font}`, color, align: 'left' });
          y += fs + 5;
        }
        y += 6;
      };
      para(ctx.t('src'), info.src[i], th.text);
      para(ctx.t('use'), info.use[i], th.text);
      text(g, ctx.t(isIonizing(lam) ? 'ion' : 'nonIon'), x, y, { font: `700 ${fs}px ${th.font}`, color: isIonizing(lam) ? th.series[1]! : th.series[2]!, align: 'left' });
    }

    function wrap(s: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = s.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawDipole(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const ax = narrow ? 50 : 90;
      const cy = H / 2;
      const len = Math.min(H * 0.6, 260);
      const s = Math.sin(phase);
      const c = Math.cos(phase);
      // Stab
      g.strokeStyle = th.text;
      g.lineWidth = 8;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(ax, cy - len / 2);
      g.lineTo(ax, cy - 6);
      g.moveTo(ax, cy + 6);
      g.lineTo(ax, cy + len / 2);
      g.stroke();
      g.lineCap = 'butt';
      // Wechselspannungsquelle in der Mitte
      g.strokeStyle = th.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(ax, cy, 6, 0, Math.PI * 2);
      g.stroke();
      // Ladungen an den Enden: oben + bei s > 0
      const q = (y: number, sign: number) => {
        const v = sign * s;
        const rad = 6 + 10 * Math.abs(v);
        g.fillStyle = withAlpha(v >= 0 ? th.series[1]! : th.series[0]!, 0.25 + 0.6 * Math.abs(v));
        g.beginPath();
        g.arc(ax, y, rad, 0, Math.PI * 2);
        g.fill();
        text(g, v >= 0 ? '+' : '−', ax, y, { font: `700 ${12 + 8 * Math.abs(v)}px ${th.font}`, color: th.text });
      };
      q(cy - len / 2, 1);
      q(cy + len / 2, -1);
      // Strom im Stab (Pfeil), maximal wenn Ladungen null
      if (Math.abs(c) > 0.1) {
        const dir = c > 0 ? -1 : 1;
        g.strokeStyle = th.series[3]!;
        g.fillStyle = th.series[3]!;
        g.lineWidth = 3;
        const xA = ax + 22;
        const l2 = (len / 3) * Math.abs(c);
        g.beginPath();
        g.moveTo(xA, cy - (dir * l2) / 2);
        g.lineTo(xA, cy + (dir * l2) / 2);
        g.stroke();
        g.beginPath();
        g.moveTo(xA, cy + (dir * l2) / 2 + dir * 8);
        g.lineTo(xA - 6, cy + (dir * l2) / 2);
        g.lineTo(xA + 6, cy + (dir * l2) / 2);
        g.closePath();
        g.fill();
        text(g, 'I', xA + 12, cy, { font: `italic 700 14px ${th.mathFont}`, color: th.series[3]!, align: 'left' });
      }
      text(g, ctx.t('rod'), ax, cy + len / 2 + 26, { font: `600 12px ${th.font}`, color: th.muted });
      // Welle nach rechts: E-Feld-Pfeile senkrecht
      const x0 = ax + 50;
      const x1 = W - 20;
      const lpx = Math.min((x1 - x0) / 2.2, 300);
      const amp = len * 0.4;
      g.strokeStyle = withAlpha(th.muted, 0.5);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, cy);
      g.lineTo(x1, cy);
      g.stroke();
      const n = Math.floor((x1 - x0) / 18);
      for (let k = 0; k <= n; k++) {
        const x = x0 + (k * (x1 - x0)) / n;
        const e = Math.sin(phase - (2 * Math.PI * (x - x0)) / lpx);
        const a = amp * e;
        if (Math.abs(a) < 3) continue;
        g.strokeStyle = withAlpha(th.series[0]!, 0.8);
        g.fillStyle = withAlpha(th.series[0]!, 0.8);
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(x, cy);
        g.lineTo(x, cy - a);
        g.stroke();
        const d = Math.sign(a);
        g.beginPath();
        g.moveTo(x, cy - a - d * 2);
        g.lineTo(x - 4, cy - a + d * 6);
        g.lineTo(x + 4, cy - a + d * 6);
        g.closePath();
        g.fill();
      }
      text(g, ctx.t('wave'), (x0 + x1) / 2, cy + amp + 28, { font: `600 12px ${th.font}`, color: th.muted });
      // λ markieren
      const yb = cy - amp - 22;
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0, yb);
      g.lineTo(x0 + lpx, yb);
      g.moveTo(x0, yb - 6);
      g.lineTo(x0, yb + 6);
      g.moveTo(x0 + lpx, yb - 6);
      g.lineTo(x0 + lpx, yb + 6);
      g.stroke();
      text(g, `λ ≈ ${fmt.num(wavelengthOf(p.fMHz * 1e6), 2)} m`, x0 + lpx / 2, yb - 12, { font: `700 13px ${th.font}`, color: th.text });
    }

    function drawMod(): void {
      const th = ctx.theme;
      const fc = 24;
      const fs = p.ton;
      const signal = (t: number) => Math.sin(2 * Math.PI * fs * t);
      const fns: [(t: number) => number, string, string][] = [
        [signal, ctx.t('signal'), th.series[1]!],
        [(t) => Math.sin(2 * Math.PI * fc * t), ctx.t('carrier'), th.series[0]!],
        [(t) => (p.art === 'am' ? am(t, fc, fs, p.m) : fm(t, fc, fs, p.hub * fc)), ctx.t('modulated'), th.series[2]!],
      ];
      fns.forEach(([f, label, color], k) => {
        const pl = plots[k]!;
        pl.resize();
        pl.begin();
        pl.hline(0, { color: withAlpha(th.muted, 0.5), width: 1 });
        const pts: [number, number][] = [];
        for (let i = 0; i <= 1200; i++) pts.push([i / 1200, f(i / 1200)]);
        if (k === 2 && p.art === 'am') {
          const env: [number, number][] = [];
          const env2: [number, number][] = [];
          for (let i = 0; i <= 200; i++) {
            const t = i / 200;
            env.push([t, 1 + p.m * signal(t)]);
            env2.push([t, -(1 + p.m * signal(t))]);
          }
          pl.polyline(env, { color: withAlpha(th.series[1]!, 0.7), width: 2, dash: [6, 4] });
          pl.polyline(env2, { color: withAlpha(th.series[1]!, 0.7), width: 2, dash: [6, 4] });
        }
        pl.polyline(pts, { color, width: k === 1 ? 1.5 : 2.5 });
        pl.text(0, 1.7, label, { color, size: 13, weight: 'bold', baseline: 'top', offset: [0, -16] });
        pl.end();
      });
    }

    /* ---------- Geräte im Alltag ---------- */
    function drawGadgets(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const x0 = 20;
      const x1 = W - 20;
      const bandY = narrow ? 70 : 90;
      const bandH = 26;
      // Frequenzband logarithmisch: 10⁵ Hz … 10¹⁹ Hz
      const F0 = 5;
      const F1 = 19;
      const X = (f: number) => x0 + ((Math.log10(f) - F0) / (F1 - F0)) * (x1 - x0);
      for (const r of REGIONS) {
        const fa = Math.max(10 ** F0, C_LIGHT / r.max);
        const fb = Math.min(10 ** F1, C_LIGHT / r.min);
        if (fb <= fa) continue;
        g.fillStyle = withAlpha(regionColor(r.id), 0.35);
        g.fillRect(X(fa), bandY, X(fb) - X(fa), bandH);
      }
      // sichtbarer Bereich in Spektralfarben
      for (let l = 380; l < 780; l += 4) {
        const [rr, gg, bb] = wavelengthToRgb(l);
        g.fillStyle = `rgb(${rr},${gg},${bb})`;
        const xa = X(C_LIGHT / ((l + 4) * 1e-9));
        const xb = X(C_LIGHT / (l * 1e-9));
        g.fillRect(xa, bandY, Math.max(1, xb - xa), bandH);
      }
      g.strokeStyle = th.axis;
      g.lineWidth = 1;
      g.strokeRect(x0, bandY, x1 - x0, bandH);
      for (let e = F0; e <= F1; e += narrow ? 4 : 2) {
        const sup = String(e).replace(/\d/g, (d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(d)]!);
        text(g, `10${sup} Hz`, X(10 ** e), bandY + bandH + 14, { font: `500 11px ${th.font}`, color: th.muted });
      }
      // Marken der Geräte
      const ids = Object.keys(GADGETS) as GadgetId[];
      ids.forEach((id) => {
        const gd = GADGETS[id];
        const x = X(gd.f);
        const sel = id === p.ger;
        const up = sel;
        g.strokeStyle = sel ? th.text : withAlpha(th.text, 0.4);
        g.lineWidth = sel ? 2.5 : 1;
        g.beginPath();
        g.moveTo(x, bandY - (up ? 14 : 0));
        g.lineTo(x, bandY + bandH);
        g.stroke();
        g.beginPath();
        g.arc(x, bandY - (up ? 14 : 0), sel ? 6 : 3.5, 0, Math.PI * 2);
        g.fillStyle = sel ? th.series[0]! : th.muted;
        g.fill();
        if (sel) {
          g.font = `700 13px ${th.font}`;
          const lw = g.measureText(gd.name[ctx.lang]).width / 2;
          text(g, gd.name[ctx.lang], Math.max(x0 + lw, Math.min(x1 - lw, x)), bandY - (up ? 30 : 16), {
            font: `${sel ? 700 : 500} ${sel ? 13 : 10}px ${th.font}`,
            color: sel ? th.series[0]! : th.muted,
          });
        }
      });
      // Karte
      const gd = GADGETS[p.ger as GadgetId];
      const lam = wavelengthOf(gd.f);
      const card: Rect = { x: x0, y: bandY + bandH + 34, w: x1 - x0, h: H - (bandY + bandH + 34) - 14 };
      roundRect(g, card.x, card.y, card.w, card.h, 10);
      g.fillStyle = withAlpha(regionColor(regionOf(lam)), 0.1);
      g.fill();
      const fs = narrow ? 13 : 15;
      let y = card.y + 22;
      const line = (str: string, col: string, weight = 600, size = fs) => {
        g.font = `${weight} ${size}px ${th.font}`;
        for (const part of wrapG(g, str, card.w - 28)) {
          text(g, part, card.x + 14, y, { font: `${weight} ${size}px ${th.font}`, color: col, align: 'left' });
          y += size * 1.45;
        }
        y += 3;
      };
      line(gd.name[ctx.lang], th.series[0]!, 800, fs + 3);
      line(`f = ${freqText(gd.f)}   λ = ${lengthText(lam)}`, th.text, 700);
      line(`${tr('Eval', { v: energyText(photonEnergyEv(lam)) })} – ${ctx.t(isIonizing(lam) ? 'aIon' : 'aNonIon')}`, isIonizing(lam) ? th.series[3]! : th.text, 600);
      line(`${INFO[regionOf(lam)].name[en() ? 1 : 0]}`, th.muted, 600);
      line(gd.fact[ctx.lang], th.text, 500);
      // kleine Welle mit passender Farbe, Wellenlänge nur angedeutet
      const wy = card.y + card.h - 26;
      if (wy > y + 10) {
        g.strokeStyle = regionColor(regionOf(lam));
        g.lineWidth = 2;
        g.beginPath();
        const kk = 0.02 + ((Math.log10(gd.f) - F0) / (F1 - F0)) * 0.5;
        for (let x = card.x + 14; x < card.x + card.w - 14; x += 1) {
          const yy = wy + Math.sin((x - card.x) * kk - phase * 2) * 10;
          if (x === card.x + 14) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
      }
    }

    /* ---------- Laufzeit ---------- */
    function drawTravel(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const tg = TARGETS[p.ziel as TargetId];
      const T = travelTime(tg.d);
      const cy = H * 0.36;
      const ex = 50;
      const tx = W - 50;
      // Erde
      g.beginPath();
      g.arc(ex, cy, 24, 0, Math.PI * 2);
      g.fillStyle = withAlpha(th.series[0]!, 0.75);
      g.fill();
      text(g, ctx.t('lEarth'), ex, cy + 40, { font: `600 12px ${th.font}`, color: th.text });
      // Ziel
      const tcol = p.ziel === 'sonne' ? th.series[3]! : p.ziel === 'mars' ? th.series[1]! : th.muted;
      const tr0 = p.ziel === 'sonne' ? 30 : p.ziel === 'mond' ? 12 : p.ziel === 'mars' ? 14 : 9;
      g.beginPath();
      if (p.ziel === 'raum' || p.ziel === 'gps' || p.ziel === 'geo') {
        roundRect(g, tx - 10, cy - 8, 20, 16, 3);
        g.fillStyle = tcol;
        g.fill();
        g.fillRect(tx - 26, cy - 3, 14, 6);
        g.fillRect(tx + 12, cy - 3, 14, 6);
      } else {
        g.arc(tx, cy, tr0, 0, Math.PI * 2);
        g.fillStyle = tcol;
        g.fill();
      }
      g.font = `600 12px ${th.font}`;
      const nm = tg.name[ctx.lang];
      text(g, nm, Math.min(tx, W - 8 - g.measureText(nm).width / 2), cy + 40, { font: `600 12px ${th.font}`, color: th.text });
      // Strecke
      g.setLineDash([4, 6]);
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(ex + 26, cy);
      g.lineTo(tx - 28, cy);
      g.stroke();
      g.setLineDash([]);
      // Signal: Wellenpaket
      const sx = ex + 26 + (tx - 28 - ex - 26) * travel;
      g.strokeStyle = th.series[2]!;
      g.lineWidth = 2.5;
      g.beginPath();
      for (let k = -30; k <= 0; k++) {
        const x = sx + k;
        const y = cy + Math.sin(k * 0.8 + phase * 4) * 8 * Math.exp(-(k * k) / 300);
        if (k === -30) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      // Texte
      const fs = narrow ? 14 : 16;
      let y = H * 0.66;
      const line = (str: string, col: string, weight = 700, size = fs) => {
        g.font = `${weight} ${size}px ${th.font}`;
        for (const part of wrapG(g, str, W - 40)) {
          text(g, part, 20, y, { font: `${weight} ${size}px ${th.font}`, color: col, align: 'left' });
          y += size * 1.45;
        }
      };
      line(tr('lTime', { t: timeText(T) }), th.series[2]!, 800, fs + 2);
      line(tr('lNow', { t: timeText(T * travel) }), th.text, 600);
      const factor = T / 3;
      line(factor < 1 ? tr('lSlow', { k: fmt.num(1 / factor, 0) }) : tr('lFast', { k: fmt.num(factor, 0) }), th.muted, 500, fs - 2);
      text(g, 'c = 299 792 km/s', W - 20, 22, { font: `600 13px ${th.font}`, color: th.muted, align: 'right' });
    }

    /* ---------- Übung ---------- */
    function wrapG(g: CanvasRenderingContext2D, str: string, maxW: number): string[] {
      const out: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          out.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) out.push(cur);
      return out;
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
      for (const line of wrapG(g, task.text[ctx.lang], maxW)) {
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
        for (const line of wrapG(g, ctx.t(verdict ? 'qOk' : 'qNo'), maxW)) {
          g.fillText(line, pad, y);
          y += narrow ? 26 : 34;
        }
        y += 4;
        if (verdict || tries >= 2) {
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          for (const line of wrapG(g, `${ctx.t('qSol')}: ${task.solution[ctx.lang]}`, maxW)) {
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

    const canvasKey = () => ({ alltag: 'canvasA', laufzeit: 'canvasL', ueben: 'canvasQ' })[p.mode as string] ?? 'canvas';

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
        if (changed.has('ziel') || changed.has('mode')) travel = 0;
        if (['alltag', 'laufzeit', 'ueben'].includes(p.mode as string) || changed.has('mode')) surface.canvas.setAttribute('aria-label', ctx.t(canvasKey()));
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
        phase += dt * 2 * Math.PI * 0.5;
        if (p.mode === 'laufzeit') {
          travel += Math.min(dt, 0.05) / 3;
          if (travel >= 1) {
            travel = 1;
            ctx.clock.pause();
          }
        }
      },

      resetTime() {
        phase = Math.PI / 3;
        travel = 0;
      },

      render() {
        surface.begin();
        if (p.mode === 'spektrum') {
          const l = layout(surface.width, surface.height);
          drawSpectrum(l);
          drawWave(l.wave);
          drawCard(l.card);
        } else if (p.mode === 'dipol') drawDipole();
        else if (p.mode === 'alltag') drawGadgets();
        else if (p.mode === 'laufzeit') drawTravel();
        else if (p.mode === 'ueben') drawQuiz();
        else drawMod();
      },

      destroy: () => surface.destroy(),
    };
  },
});
