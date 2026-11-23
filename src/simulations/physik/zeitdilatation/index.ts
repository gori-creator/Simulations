import { clamp, defineSimulation, drawCard as drawCardBase, ease, measureSubText, mixColor, mod, prefersReducedMotion, roundRect, seededRandom, subText, Surface, Tween, withAlpha, type Rect, type SubTextStyle } from '../../../sim-core';
import {
  BETA_MAX,
  C,
  contractedLength,
  DAY,
  dilatedTime,
  energies,
  EXAMPLES,
  flightTime,
  gamma,
  gammaAxisTop,
  gammaMinusOne,
  lagPerDay,
  lightClock,
  meanFlight,
  MUON_TAU,
  niceStep,
  PARTICLES,
  pulseHeight,
  sci,
  simultaneity,
  survival,
  type Example,
  type Particle,
} from './model';

const L = (de: string, en: string) => ({ de, en });
/** Farbe mit Deckkraft: `withAlpha` für #rrggbb, sonst über `mixColor` (liefert rgba). */
const withA = (c: string, a: number) => (c.startsWith('#') ? withAlpha(c, a) : mixColor(c, c, 0, a));
const TAU = 2 * Math.PI;
type Mode = 'clock' | 'len' | 'sim' | 'muon' | 'energy' | 'apps';
type ExampleId = Example['id'];

/** Ein Tick der Lichtuhr (hin und zurück) dauert im Ruhesystem 10 ns → Spiegelabstand d = c · 5 ns ≈ 1,5 m. */
const TICK = 1e-8;
const MIRROR = (C * TICK) / 2;
/** Echte Sekunden für einen Tick der ruhenden Lichtuhr in der Animation. */
const P0 = 1.6;
/** Gleichzeitigkeit: echte Sekunden, bis das Licht im Zug die Enden erreicht; längste Dauer vom Bahnsteig aus. */
const SIM_TOP = 1.4;
const SIM_MAX = 4.6;
/** Myonen: echte Sekunden für den Flug durch die Atmosphäre; neue Myonen pro Sekunde. */
const FALL = 3.2;
const SPAWN = 9;

interface Layout {
  scene: Rect;
  chart: Rect;
  card: Rect;
  wide: boolean;
}

/** Ein Myon der Höhenstrahlung (Animation). */
interface Muon {
  /** Entstehung in echter Animationszeit (s). */
  born: number;
  /** Eigene Lebensdauer (zufällig, exponentialverteilt) in s. */
  life: number;
  /** Lage quer zur Flugrichtung, 0 … 1. */
  x: number;
}

/**
 * Spezielle Relativitätstheorie zum Anfassen: Lichtuhr im fahrenden Zug
 * (senkrecht im Zug, schräg vom Bahnsteig aus), Zug und Tunnel
 * (Längenkontraktion aus beiden Bezugssystemen), Lichtblitz in der Zugmitte
 * (Relativität der Gleichzeitigkeit), Myonen aus der Höhenstrahlung, Energie
 * und Impuls schneller Teilchen sowie Alltagsbeispiele (GPS, ISS, LHC) auf
 * einer logarithmischen Skala. Dazu das Diagramm γ(v/c) mit ziehbarem Punkt.
 */
export default defineSimulation({
  id: 'zeitdilatation',
  animated: true,
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'apps'
      ? L('Tipp: Tippe auf einen Punkt im Diagramm, um ein Beispiel auszuwählen.', 'Tip: tap a point in the chart to select an example.')
      : L('Tipp: Zieh den Punkt im γ-Diagramm, um die Geschwindigkeit zu ändern (oder benutze den Regler).', 'Tip: drag the point in the γ chart to change the speed (or use the slider).'),
  layout: { aspect: 1.62, aspectNarrow: 0.55 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'clock', label: L('Lichtuhr (Zeitdilatation)', 'Light clock (time dilation)') },
        { value: 'len', label: L('Zug und Tunnel (Längenkontraktion)', 'Train and tunnel (length contraction)') },
        { value: 'sim', label: L('Lichtblitz (Gleichzeitigkeit)', 'Flash of light (simultaneity)') },
        { value: 'muon', label: L('Myonen aus der Höhenstrahlung', 'Cosmic-ray muons') },
        { value: 'energy', label: L('Energie und Impuls', 'Energy and momentum') },
        { value: 'apps', label: L('Alltag und Experimente', 'Everyday life and experiments') },
      ],
      default: 'clock',
    },
    {
      key: 'v',
      type: 'number',
      label: L('Geschwindigkeit v (in Vielfachen von c)', 'Speed v (as a multiple of c)'),
      help: (v) => {
        const b = Number(v.v);
        const kms = String(Math.round((b * C) / 1000)).replace(/\B(?=(\d{3})+$)/g, '\u202F');
        return L(`v = ${String(b).replace('.', ',')} · c ≈ ${kms} km/s (c ≈ 300\u202F000 km/s). Feine Schritte bis 0,999 c.`, `v = ${b} · c ≈ ${kms} km/s (c ≈ 300\u202F000 km/s). Fine steps up to 0.999 c.`);
      },
      min: 0,
      max: BETA_MAX,
      step: 0.001,
      default: 0.6,
      unit: 'c',
      visibleIf: (v) => v.mode !== 'apps',
    },
    { key: 't0', type: 'number', label: L('Eigenzeit Δt₀ eines Vorgangs im Zug', 'Proper time Δt₀ of a process on the train'), min: 1, max: 100, step: 0.5, default: 10, unit: 's', visibleIf: (v) => v.mode === 'clock' },
    { key: 'L0', type: 'number', label: L('Ruhelänge L₀ des Zuges', 'Rest length L₀ of the train'), help: L('Der Tunnel hat dieselbe Ruhelänge wie der Zug.', 'The tunnel has the same rest length as the train.'), min: 20, max: 400, step: 5, default: 100, unit: 'm', visibleIf: (v) => v.mode === 'len' || v.mode === 'sim' },
    { key: 'h', type: 'number', label: L('Höhe, in der die Myonen entstehen', 'Altitude at which the muons are created'), min: 2, max: 20, step: 0.5, default: 10, unit: 'km', visibleIf: (v) => v.mode === 'muon' },
    {
      key: 'part',
      type: 'choice',
      label: L('Teilchen', 'Particle'),
      options: [
        { value: 'e', label: L('Elektron', 'Electron'), detail: L('E₀ = 0,511 MeV', 'E₀ = 0.511 MeV') },
        { value: 'mu', label: L('Myon', 'Muon'), detail: L('E₀ = 105,7 MeV', 'E₀ = 105.7 MeV') },
        { value: 'p', label: L('Proton', 'Proton'), detail: L('E₀ = 938,3 MeV', 'E₀ = 938.3 MeV') },
      ],
      default: 'e',
      visibleIf: (v) => v.mode === 'energy',
    },
    {
      key: 'ex',
      type: 'choice',
      label: L('Beispiel', 'Example'),
      options: EXAMPLES.map((e) => ({ value: e.id, label: e.label })),
      default: 'gps',
      visibleIf: (v) => v.mode === 'apps',
    },
    { key: 'tri', type: 'boolean', group: 'view', label: L('Rechtwinkliges Dreieck an der Lichtuhr', 'Right triangle at the light clock'), default: true, visibleIf: (v) => v.mode === 'clock' },
    { key: 'cls', type: 'boolean', group: 'view', label: L('Klassische Vorhersage zum Vergleich', 'Classical prediction for comparison'), default: true, visibleIf: (v) => v.mode === 'energy' || v.mode === 'muon' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Messwerte im Bild', 'Values in the picture'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false, visibleIf: (v) => v.mode !== 'apps' },
  ],
  actions: [{ id: 'go', label: L('Neu starten', 'Restart'), primary: true, visibleIf: (v) => v.mode !== 'apps' }],
  readouts: [
    { key: 'speed', label: L('Geschwindigkeit', 'Speed') },
    { key: 'gamma', label: L('Lorentzfaktor', 'Lorentz factor'), spoiler: true },
    { key: 'time', label: L('Zeitdilatation', 'Time dilation'), spoiler: true },
    { key: 'tick', label: L('Lichtuhr', 'Light clock'), spoiler: true },
    { key: 'length', label: L('Längenkontraktion', 'Length contraction'), spoiler: true },
    { key: 'tunnel', label: L('Passt der Zug in den Tunnel?', 'Does the train fit into the tunnel?'), spoiler: true },
    { key: 'simul', label: L('Gleichzeitigkeit', 'Simultaneity'), spoiler: true },
    { key: 'muon', label: L('Myonen', 'Muons'), spoiler: true },
    { key: 'energy', label: L('Energie', 'Energy'), spoiler: true },
    { key: 'momentum', label: L('Impuls', 'Momentum'), spoiler: true },
    { key: 'daily', label: L('Gangunterschied der Uhren', 'Difference between the clocks'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Lichtuhr bei 0,6 c', 'Light clock at 0.6 c'), values: {} },
    { id: 'len', label: L('Zug und Tunnel bei 0,8 c', 'Train and tunnel at 0.8 c'), values: { mode: 'len', v: 0.8 } },
    { id: 'sim', label: L('Lichtblitz in der Zugmitte', 'Flash in the middle of the train'), values: { mode: 'sim' } },
    { id: 'muon', label: L('Myonen mit 0,998 c', 'Muons at 0.998 c'), values: { mode: 'muon', v: 0.998 } },
    { id: 'energy', label: L('Elektron mit 0,99 c', 'Electron at 0.99 c'), values: { mode: 'energy', v: 0.99 } },
    { id: 'gps', label: L('GPS-Satellit', 'GPS satellite'), values: { mode: 'apps', ex: 'gps' } },
  ],
  strings: {
    de: {
      canvas:
        'Spezielle Relativitätstheorie: oben ein Zug mit Lichtuhr, Tunnel, Lichtblitz, Myonen in der Atmosphäre oder Energiebalken je nach Ansicht, jeweils im Bezugssystem des Zuges und des Bahnsteigs; daneben das Diagramm des Lorentzfaktors γ in Abhängigkeit von v/c mit ziehbarem Punkt und eine Karte mit den wichtigsten Werten',
      chipGamma: 'Lorentzfaktor γ',
      chipEnergy: 'E/E_0 = γ',
      axisB: 'v/c',
      classic: 'klassisch: 1 + ½ · (v/c)²',
      classicS: 'klassisch',
      gammaPill: 'γ = {g}',
      cMark: 'c',
      // Lichtuhr
      trainFrame: 'Im Zug: Die Lichtuhr ruht',
      trainFrameS: 'Im Zug',
      platFrame: 'Vom Bahnsteig: Der Zug fährt mit {v}',
      platFrameS: 'Vom Bahnsteig: {v}',
      tickPill: '1 Tick: Δt_0 = 10 ns',
      tickPillS: 'Δt_0 = 10 ns',
      platClock: 'Bahnsteig: t = {t}',
      trainClock: 'Zuguhr: {t}',
      triHyp: 'c · Δt/2',
      triRun: 'v · Δt/2',
      triD: 'd = c · Δt_0/2',
      triDS: 'd',
      cardClock: 'Uhren im Vergleich',
      dialTrain: 'Zuguhr',
      dialPlat: 'Bahnsteig',
      ticksOf: '{n} Ticks',
      process: 'Vorgang im Zug: Δt_0 = {a} → Δt = {b}',
      processS: 'Δt_0 = {a} → Δt = {b}',
      // Längenkontraktion
      lenPlat: 'Bahnsteig-System: Tunnel ruht, Zug fährt',
      lenPlatS: 'Bahnsteig: Tunnel ruht',
      lenTrain: 'Zug-System: Zug ruht, Tunnel fährt',
      lenTrainS: 'Zug: Zug ruht',
      tunnelRest: 'Tunnel L_0 = {l}',
      tunnelMoving: 'Tunnel L = {l}',
      trainRest: 'Zug L_0 = {l}',
      trainMoving: 'Zug L = {l}',
      fits: 'Der Zug passt ganz hinein',
      sticks: 'Der Zug ragt heraus',
      cardLen: 'Länge in Fahrtrichtung',
      restLen: 'Ruhelänge L_0',
      movLen: 'bewegt: L = L_0/γ',
      factor: 'Faktor 1/γ = {f}',
      // Gleichzeitigkeit
      simTrain: 'Im Zug: Lampe in der Mitte blitzt',
      simTrainS: 'Im Zug',
      simPlat: 'Vom Bahnsteig: Zug fährt mit {v}',
      simPlatS: 'Bahnsteig: {v}',
      rear: 'hinten',
      front: 'vorn',
      atT: '{w}: {t}',
      both: 'beide gleichzeitig: {t}',
      origin: 'hier ausgesandt',
      cardSim: 'Licht erreicht die Enden',
      simTrainRow: 'im Zug: beide nach {t}',
      simRear: 'Bahnsteig: hinten nach {t}',
      simFront: 'Bahnsteig: vorn nach {t}',
      simDiff: 'Δt = {t}',
      simSame: 'gleichzeitig',
      // Myonen
      muA: 'ohne Zeitdilatation',
      muAS: 'klassisch',
      muB: 'mit Zeitdilatation',
      muBS: 'relativistisch',
      muC: 'Sicht des Myons',
      created: 'Entstehung',
      ground: 'Meereshöhe',
      arrived: '{n} von {m} unten',
      atmos: 'Atmosphäre: h/γ',
      lifeRun: 'Weg in τ: v · τ',
      cardMuon: 'Am Boden kommen an',
      still: 'v = 0: Die Myonen zerfallen, wo sie entstehen.',
      // Energie
      laneLight: 'Licht',
      laneRel: '{p}: v = {v}',
      laneCl: 'Newton: v = {v}',
      laneFaster: 'schneller als Licht?',
      barRel: 'relativistisch: E = γ · E_0',
      barCl: 'klassisch: E_0 + ½ m v²',
      rest: 'E_0',
      kin: 'E_{kin}',
      cardEnergy: '{p} bei {v}',
      totalE: 'E = {e}',
      kinE: 'E_{kin} = {e}',
      pcE: 'p · c = {e}',
      eName: 'Elektron',
      muName: 'Myon',
      pName: 'Proton',
      // Alltag
      appsChip: 'Wie stark gehen bewegte Uhren nach?',
      appsChipS: 'γ − 1 (logarithmisch)',
      appsAxisX: 'v in m/s',
      appsAxisY: 'γ − 1',
      everyday: 'Alltag: γ − 1 < 10⁻⁸',
      lightSpeed: 'Lichtgeschwindigkeit',
      perDay: 'Die Uhr geht pro Tag {t} nach.',
      perDayS: 'pro Tag {t} nach',
      ownDay: 'Pro Tag vergehen für sie nur {t}.',
      gpsNote: 'Dazu kommt die Gravitation: Insgesamt gehen GPS-Uhren rund 38 µs pro Tag vor.',
      hiddenVal: '?',
    },
    en: {
      canvas:
        'Special relativity: a train with a light clock, a tunnel, a flash of light, muons in the atmosphere or energy bars depending on the view, each in the frame of the train and of the platform; next to it the chart of the Lorentz factor γ against v/c with a draggable point and a card with the key values',
      chipGamma: 'Lorentz factor γ',
      chipEnergy: 'E/E_0 = γ',
      axisB: 'v/c',
      classic: 'classical: 1 + ½ · (v/c)²',
      classicS: 'classical',
      gammaPill: 'γ = {g}',
      cMark: 'c',
      trainFrame: 'On the train: the light clock is at rest',
      trainFrameS: 'On the train',
      platFrame: 'From the platform: the train moves at {v}',
      platFrameS: 'From the platform: {v}',
      tickPill: '1 tick: Δt_0 = 10 ns',
      tickPillS: 'Δt_0 = 10 ns',
      platClock: 'platform: t = {t}',
      trainClock: 'train clock: {t}',
      triHyp: 'c · Δt/2',
      triRun: 'v · Δt/2',
      triD: 'd = c · Δt_0/2',
      triDS: 'd',
      cardClock: 'Clocks compared',
      dialTrain: 'Train',
      dialPlat: 'Platform',
      ticksOf: '{n} ticks',
      process: 'Process on the train: Δt_0 = {a} → Δt = {b}',
      processS: 'Δt_0 = {a} → Δt = {b}',
      lenPlat: 'Platform frame: tunnel at rest, train moving',
      lenPlatS: 'Platform: tunnel at rest',
      lenTrain: 'Train frame: train at rest, tunnel moving',
      lenTrainS: 'Train: train at rest',
      tunnelRest: 'tunnel L_0 = {l}',
      tunnelMoving: 'tunnel L = {l}',
      trainRest: 'train L_0 = {l}',
      trainMoving: 'train L = {l}',
      fits: 'The train fits completely inside',
      sticks: 'The train sticks out',
      cardLen: 'Length along the motion',
      restLen: 'rest length L_0',
      movLen: 'moving: L = L_0/γ',
      factor: 'factor 1/γ = {f}',
      simTrain: 'On the train: a lamp in the middle flashes',
      simTrainS: 'On the train',
      simPlat: 'From the platform: the train moves at {v}',
      simPlatS: 'Platform: {v}',
      rear: 'rear',
      front: 'front',
      atT: '{w}: {t}',
      both: 'both at the same time: {t}',
      origin: 'emitted here',
      cardSim: 'Light reaches the ends',
      simTrainRow: 'on the train: both after {t}',
      simRear: 'platform: rear after {t}',
      simFront: 'platform: front after {t}',
      simDiff: 'Δt = {t}',
      simSame: 'simultaneous',
      muA: 'without time dilation',
      muAS: 'classical',
      muB: 'with time dilation',
      muBS: 'relativistic',
      muC: 'Muon’s view',
      created: 'created',
      ground: 'sea level',
      arrived: '{n} of {m} at the bottom',
      atmos: 'atmosphere: h/γ',
      lifeRun: 'distance in τ: v · τ',
      cardMuon: 'Arriving at the ground',
      still: 'v = 0: the muons decay where they are created.',
      laneLight: 'light',
      laneRel: '{p}: v = {v}',
      laneCl: 'Newton: v = {v}',
      laneFaster: 'faster than light?',
      barRel: 'relativistic: E = γ · E_0',
      barCl: 'classical: E_0 + ½ m v²',
      rest: 'E_0',
      kin: 'E_{kin}',
      cardEnergy: '{p} at {v}',
      totalE: 'E = {e}',
      kinE: 'E_{kin} = {e}',
      pcE: 'p · c = {e}',
      eName: 'Electron',
      muName: 'Muon',
      pName: 'Proton',
      appsChip: 'How much do moving clocks lag behind?',
      appsChipS: 'γ − 1 (logarithmic)',
      appsAxisX: 'v in m/s',
      appsAxisY: 'γ − 1',
      everyday: 'everyday life: γ − 1 < 10⁻⁸',
      lightSpeed: 'speed of light',
      perDay: 'The clock loses {t} per day.',
      perDayS: 'loses {t} per day',
      ownDay: 'Each day only {t} pass for it.',
      gpsNote: 'Gravity adds to this: overall, GPS clocks gain about 38 µs per day.',
      hiddenVal: '?',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (all: string, k: string) => vars[k] ?? all);
    /** Beim Überblenden zeichnet render() kurz noch die vorige Ansicht. */
    let shownMode: Mode | null = null;
    const mode = () => shownMode ?? (p.mode as Mode);
    const show = () => !ctx.hidden;
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const teal = () => ctx.theme.series[5]!;
    /** Licht: hell leuchtendes Orange (im Dunkelmodus heller). */
    const light = () => (ctx.theme.dark ? mixColor(orange(), '#ffd27a', 0.45) : orange());

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let frameDt = 0;
    let lastFrame = performance.now();
    let animating = false;
    function ease2(key: string, target: number, rate = 8): number {
      const cur = soft.get(key);
      if (cur === undefined || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-4 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    /** Gezeigte Geschwindigkeit (folgt dem Regler weich, damit nichts springt). */
    let bS = p.v;
    const gS = () => gamma(bS);

    /* ---------- Übergänge ---------- */
    const intro = new Tween(1300, ease.outCubic);
    const modeTw = new Tween(560, ease.inOutCubic);
    let prevMode: Mode = p.mode as Mode;
    let lastMode: Mode = p.mode as Mode;
    const introK = () => (intro.running ? intro.value : 1);

    /* ---------- Zustand der Animationen ---------- */
    // Lichtuhr: Ticks im Zug (oben, eigene Zeit), Bahnsteigzeit s und Zuguhr τ (unten), Zugweg x in Spiegelabständen
    const ck = { top: 0, s: 0, tau: 0, x: 0 };
    // Längenkontraktion: Lage des bewegten Körpers, −1 … 1
    let lenU = -0.55;
    // Gleichzeitigkeit: echte Sekunden seit dem Blitz
    let simT = 0;
    let simSaid = 0;
    // Myonen
    let muT = 0;
    let muNext = 0;
    let muons: Muon[] = [];
    const muDone = { a: 0, b: 0, n: 0 };
    let rng = seededRandom(20261122);
    // Energie: Lage der drei Läufer, 0 … 1
    const lanes = [0.1, 0.1, 0.1];
    // Ziehen im Diagramm
    let chartA: Rect = { x: 0, y: 0, w: 0, h: 0 };
    let handleAt: [number, number] = [-99, -99];
    let dragging = false;
    let hoverHandle = false;
    let hoverEx: ExampleId | null = null;
    let exPts: { id: ExampleId; x: number; y: number }[] = [];

    /* ---------- Hilfen: Text und Formen ---------- */
    const subStyle = (size: number, color: string, weight: number, align: CanvasTextAlign = 'center'): SubTextStyle => ({ size, family: ctx.theme.font, weight, color, align, subScale: 0.74, subShift: 0.3 });
    const halo = () => (ctx.theme.dark ? 'rgba(16,22,31,0.86)' : 'rgba(250,251,252,0.92)');
    function textW(str: string, size: number, weight = 700): number {
      return measureSubText(surface.g, str, subStyle(size, '', weight));
    }
    function rich(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', withHalo = true, weight = 700): number {
      return subText(surface.g, str, x, y, { ...subStyle(size, color, weight, align), ...(withHalo ? { halo: halo() } : {}) });
    }
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): number {
      const g = surface.g;
      const w = textW(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withA(color, 0.5);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      rich(label, x0 + w / 2, y + h / 2 + 0.5, size, color, 'center', false);
      return w;
    }
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }
    /** Maßlinie mit Pfeilen an beiden Enden und Beschriftung darüber (oder darunter). */
    function dimension(x0: number, x1: number, y: number, label: string, color: string, r: Rect, below = false, size = 12): void {
      const g = surface.g;
      if (x1 - x0 < 4) return;
      g.strokeStyle = color;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x0, y - 5);
      g.lineTo(x0, y + 5);
      g.moveTo(x1, y - 5);
      g.lineTo(x1, y + 5);
      g.stroke();
      const mid = (x0 + x1) / 2;
      arrowPx(mid, y, x0 + 1, y, color, 1.5, 6);
      arrowPx(mid, y, x1 - 1, y, color, 1.5, 6);
      const w = textW(label, size);
      const lx = clamp(mid, r.x + w / 2 + 6, r.x + r.w - w / 2 - 6);
      rich(label, lx, y + (below ? size + 2 : -size + 1), size, color, 'center');
    }
    function card(r: Rect, accent?: string): void {
      drawCardBase(surface.g, r, ctx.theme, accent);
    }
    const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
    const supNum = (e: number) => String(e).replace('-', '−').replace(/[−\d]/g, (ch) => SUP[ch === '−' ? '-' : ch] ?? ch);
    /** Zahl als „8,3 · 10⁻¹¹“ (kleine Zahlen) oder normal. */
    function sciText(x: number, digits = 1): string {
      if (x === 0) return '0';
      const s = sci(x, digits);
      if (s.e >= -2 && s.e <= 4) return fmt.sig(x, digits + 1);
      return `${fmt.fixed(s.m, digits)} · 10${supNum(s.e)}`;
    }
    /** Zeitspanne mit passender Einheit. */
    function timeText(sec: number, digits = 3): string {
      const a = Math.abs(sec);
      const u: [number, string][] = [
        [1e-12, 'ps'],
        [1e-9, 'ns'],
        [1e-6, 'µs'],
        [1e-3, 'ms'],
        [1, 's'],
      ];
      if (a >= 3600) return `${fmt.sig(sec / 3600, digits)} h`;
      if (a >= 60 && a < 3600) return `${fmt.sig(sec / 60, digits)} min`;
      let pick = u[0]!;
      for (const q of u) if (a >= q[0] * 0.9995) pick = q;
      return `${fmt.sig(sec / pick[0], digits)} ${pick[1]}`;
    }
    /** Zeit mit fester Nachkommazahl in ns (für zählende Uhren). */
    const nsText = (sec: number, dec = 1) => `${fmt.fixed(sec * 1e9, dec)} ns`;
    /** v als Vielfaches von c: „0,6 c“. */
    const cText = (b: number) => `${fmt.num(b, 3)} c`;
    /** Länge mit Einheit (m bzw. km). */
    const lenText = (m: number, dec = 1) => (Math.abs(m) >= 10000 ? `${fmt.num(m / 1000, 1)} km` : `${fmt.num(m, dec)} m`);
    const gText = (g: number) => (g < 10 ? fmt.fixed(g, g < 1.1 ? 3 : 2) : fmt.num(g, 1));
    /** Energie in MeV bzw. GeV. */
    const eText = (mev: number) => (mev >= 1000 ? `${fmt.sig(mev / 1000, 3)} GeV` : `${fmt.sig(mev, 3)} MeV`);
    const pName = () => ctx.t(`${p.part === 'mu' ? 'mu' : p.part}Name`);
    const particle = (): Particle => PARTICLES[p.part as Particle['id']];

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Layout {
      const w = surface.width;
      const h = surface.height;
      const wide = w >= 640 || w >= h * 1.25;
      if (wide) {
        const sw = Math.round(w * 0.63);
        const x = sw + 12;
        const cw = w - x;
        const ch = Math.round(h * 0.55);
        return { scene: { x: 0, y: 0, w: sw, h }, chart: { x, y: 0, w: cw, h: ch }, card: { x, y: ch + 12, w: cw, h: h - ch - 12 }, wide };
      }
      const sh = Math.round(h * 0.53);
      const cardH = 96;
      return { scene: { x: 0, y: 0, w, h: sh }, card: { x: 0, y: sh + 10, w, h: cardH }, chart: { x: 0, y: sh + 20 + cardH, w, h: h - sh - 20 - cardH }, wide };
    }
    let lay = computeLayout();

    /* ---------- Zeichnen: Grundbausteine ---------- */
    /** Hintergrund eines Bildfeldes: Himmel, Gleis, Schotter. Gibt die Höhe der Schienen zurück. */
    function panelBase(P: Rect, railY: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      card(P);
      g.save();
      roundRect(g, P.x + 1, P.y + 1, P.w - 2, P.h - 2, 12);
      g.clip();
      const sky = g.createLinearGradient(0, P.y, 0, railY);
      sky.addColorStop(0, dark ? '#132033' : '#eaf2fb');
      sky.addColorStop(1, dark ? '#1a2636' : '#f7fafd');
      g.fillStyle = sky;
      g.fillRect(P.x, P.y, P.w, railY - P.y);
      const ground = g.createLinearGradient(0, railY, 0, P.y + P.h);
      ground.addColorStop(0, dark ? '#2b2f36' : '#c9c3b8');
      ground.addColorStop(1, dark ? '#1d2026' : '#ddd8cf');
      g.fillStyle = ground;
      g.fillRect(P.x, railY, P.w, P.y + P.h - railY);
      g.fillStyle = dark ? '#8d96a3' : '#6c737d';
      g.fillRect(P.x, railY - 1, P.w, 3);
      g.restore();
    }

    /** Oberleitungsmasten, die mit `offset` (px) nach links wandern (Abstand `gap` px). */
    function masts(P: Rect, railY: number, top: number, offset: number, gap: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      if (gap < 4) return;
      g.save();
      roundRect(g, P.x + 1, P.y + 1, P.w - 2, P.h - 2, 12);
      g.clip();
      g.strokeStyle = dark ? 'rgba(170,180,195,0.35)' : 'rgba(80,90,105,0.3)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(P.x, top + 3);
      g.lineTo(P.x + P.w, top + 3);
      g.stroke();
      g.lineWidth = Math.max(1.2, Math.min(3, gap * 0.04));
      g.strokeStyle = dark ? 'rgba(170,180,195,0.5)' : 'rgba(80,90,105,0.45)';
      const start = P.x - mod(offset, gap);
      for (let x = start; x < P.x + P.w + gap; x += gap) {
        g.beginPath();
        g.moveTo(x, railY);
        g.lineTo(x, top - 2);
        g.lineTo(x + Math.min(18, gap * 0.3), top - 2);
        g.stroke();
      }
      // Schwellen
      g.strokeStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(90,80,70,0.35)';
      g.lineWidth = 2;
      const sg = gap / 6;
      if (sg > 3) {
        const s0 = P.x - mod(offset, sg);
        g.beginPath();
        for (let x = s0; x < P.x + P.w + sg; x += sg) {
          g.moveTo(x, railY + 3);
          g.lineTo(x - 2, railY + 8);
        }
        g.stroke();
      }
      g.restore();
    }

    /**
     * Zug von der Seite (Front rechts), Mitte cx, Unterkante des Wagenkastens bei
     * `bottom`, Länge `len` (schon verkürzt), Höhe h. `squash` staucht Fenster und
     * Räder mit (Längenkontraktion betrifft alles in Fahrtrichtung).
     */
    function drawTrain(cx: number, bottom: number, len: number, h: number, squash: number, opts: { clock?: boolean; lamp?: number } = {}): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const top = bottom - h;
      const x0 = cx - len / 2;
      const nose = Math.min(len * 0.16, h * 1.1 * squash);
      const wheelR = Math.max(3, h * 0.11);
      g.save();
      // Schatten
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.28)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 4;
      const body = g.createLinearGradient(0, top, 0, bottom);
      body.addColorStop(0, dark ? '#4a5564' : '#ffffff');
      body.addColorStop(0.6, dark ? '#3a4452' : '#eef1f4');
      body.addColorStop(1, dark ? '#2a323d' : '#cdd4dc');
      g.fillStyle = body;
      g.beginPath();
      g.moveTo(x0 + h * 0.12 * squash, top);
      g.lineTo(x0 + len - nose, top);
      g.quadraticCurveTo(x0 + len, top + h * 0.08, x0 + len, bottom - h * 0.12);
      g.lineTo(x0 + len, bottom);
      g.lineTo(x0, bottom);
      g.lineTo(x0, top + h * 0.12);
      g.quadraticCurveTo(x0, top, x0 + h * 0.12 * squash, top);
      g.closePath();
      g.fill();
      g.restore();
      // Zierstreifen
      g.fillStyle = red();
      g.fillRect(x0 + 1, bottom - h * 0.26, len - 2, h * 0.07);
      // Fenster (bzw. Glasfront in der Mitte für die Lichtuhr)
      const winY = top + h * 0.2;
      const winH = h * 0.32;
      const glass = g.createLinearGradient(0, winY, 0, winY + winH);
      glass.addColorStop(0, dark ? '#5b7491' : '#6f8fb4');
      glass.addColorStop(1, dark ? '#23344a' : '#2c4462');
      const clockW = opts.clock ? Math.max(len * 0.22, 18 * squash) : 0;
      const pitch = Math.max(6, h * 0.62 * squash);
      const ww = pitch * 0.68;
      g.fillStyle = glass;
      for (let x = x0 + pitch * 0.45; x + ww < x0 + len - nose * 0.9; x += pitch) {
        if (opts.clock && Math.abs(x + ww / 2 - cx) < clockW / 2 + ww * 0.6) continue;
        roundRect(g, x, winY, ww, winH, Math.min(3, ww / 3));
        g.fill();
      }
      // Frontscheibe
      g.beginPath();
      g.moveTo(x0 + len - nose * 0.85, winY);
      g.quadraticCurveTo(x0 + len - nose * 0.1, winY + winH * 0.1, x0 + len - nose * 0.05, winY + winH);
      g.lineTo(x0 + len - nose * 0.85, winY + winH);
      g.closePath();
      g.fill();
      // Türen
      g.strokeStyle = dark ? 'rgba(255,255,255,0.12)' : 'rgba(30,40,55,0.18)';
      g.lineWidth = 1;
      for (const f of [0.12, 0.88]) {
        const dx = x0 + len * f;
        if (opts.clock && Math.abs(dx - cx) < clockW) continue;
        g.strokeRect(dx - pitch * 0.25, top + h * 0.16, pitch * 0.5, h * 0.6);
      }
      // Fahrgestell und Räder (in Fahrtrichtung mit verkürzt: Ellipsen)
      g.fillStyle = dark ? '#151a21' : '#3b424c';
      for (const f of [0.2, 0.8]) {
        const bx = x0 + len * f;
        roundRect(g, bx - h * 0.45 * squash, bottom - 1, h * 0.9 * squash, wheelR * 0.9, 2);
        g.fill();
        for (const s of [-1, 1]) {
          const wx = bx + s * h * 0.25 * squash;
          g.fillStyle = dark ? '#0f1318' : '#2a3038';
          g.beginPath();
          g.ellipse(wx, bottom + wheelR * 0.75, wheelR * squash, wheelR, 0, 0, TAU);
          g.fill();
          g.fillStyle = dark ? '#6c7684' : '#9aa3ad';
          g.beginPath();
          g.ellipse(wx, bottom + wheelR * 0.75, wheelR * 0.35 * squash, wheelR * 0.35, 0, 0, TAU);
          g.fill();
          g.fillStyle = dark ? '#151a21' : '#3b424c';
        }
      }
      // Lichtuhr: Glasfenster mit zwei Spiegeln
      if (opts.clock) {
        const cy0 = top + h * 0.08;
        const cy1 = bottom - h * 0.1;
        g.fillStyle = dark ? 'rgba(20,28,40,0.9)' : 'rgba(236,243,250,0.95)';
        roundRect(g, cx - clockW / 2, cy0, clockW, cy1 - cy0, 4);
        g.fill();
        g.strokeStyle = dark ? 'rgba(255,255,255,0.18)' : 'rgba(30,40,55,0.2)';
        g.stroke();
      }
      // Lampe in der Mitte (Gleichzeitigkeit)
      if (opts.lamp !== undefined) {
        const ly = top + h * 0.45;
        const glow = opts.lamp;
        if (glow > 0.01) {
          const rg = g.createRadialGradient(cx, ly, 1, cx, ly, h * 0.9);
          rg.addColorStop(0, withA(ctx.theme.dark ? '#ffd27a' : '#f2a33a', 0.75 * glow));
          rg.addColorStop(1, withA('#f2a33a', 0));
          g.fillStyle = rg;
          g.beginPath();
          g.arc(cx, ly, h * 0.9, 0, TAU);
          g.fill();
        }
        g.fillStyle = mixColor(dark ? '#8a6a2a' : '#c9a25a', '#fff3c4', glow);
        g.beginPath();
        g.ellipse(cx, ly, Math.max(2.5, h * 0.09 * squash), h * 0.09, 0, 0, TAU);
        g.fill();
      }
      g.restore();
    }

    /** Gestrichelter Umriss der Ruhelänge (zum Vergleich mit dem verkürzten Körper). */
    function ghostRect(x0: number, x1: number, y0: number, y1: number, color: string, alpha = 0.8): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.setLineDash([5, 4]);
      g.lineWidth = 1.5;
      roundRect(g, x0, y0, x1 - x0, y1 - y0, 6);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = withA(color, 0.06);
      g.fill();
      g.restore();
    }

    /** Leuchtender Lichtpuls. */
    function photon(x: number, y: number, r: number): void {
      const g = surface.g;
      const c = light();
      const rg = g.createRadialGradient(x, y, 0, x, y, r * 3.2);
      rg.addColorStop(0, withA('#fff7e0', 0.95));
      rg.addColorStop(0.28, withA(c, 0.85));
      rg.addColorStop(1, withA(c, 0));
      g.fillStyle = rg;
      g.beginPath();
      g.arc(x, y, r * 3.2, 0, TAU);
      g.fill();
    }

    /** Spiegel als silbrig glänzender Streifen. */
    function mirror(cx: number, y: number, w: number, down: boolean): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const th = 5;
      const grad = g.createLinearGradient(0, y - th / 2, 0, y + th / 2);
      grad.addColorStop(0, dark ? '#e7edf5' : '#ffffff');
      grad.addColorStop(0.5, dark ? '#9aa8b8' : '#b8c3cf');
      grad.addColorStop(1, dark ? '#5d6877' : '#7b8794');
      g.fillStyle = grad;
      roundRect(g, cx - w / 2, y - th / 2, w, th, 2);
      g.fill();
      g.strokeStyle = dark ? 'rgba(0,0,0,0.5)' : 'rgba(30,40,55,0.35)';
      g.lineWidth = 1;
      g.beginPath();
      const yy = down ? y - th / 2 - 0.5 : y + th / 2 + 0.5;
      for (let x = cx - w / 2 + 2; x < cx + w / 2; x += 4) {
        g.moveTo(x, yy);
        g.lineTo(x + 2.5, yy + (down ? -3 : 3));
      }
      g.stroke();
    }

    /** Titelzeile eines Bildfeldes. */
    function panelTitle(P: Rect, label: string, color: string): void {
      const sm = P.w < 460;
      pill(P.x + 10, P.y + 9, label, color, 'left', sm ? 11 : 12);
    }

    /* ---------- Ansicht: Lichtuhr ---------- */
    function drawClockScene(r: Rect): void {
      const g = surface.g;
      const sm = r.w < 520;
      const b = bS;
      const gm = gS();
      const gap = 10;
      const ph = (r.h - gap) / 2;
      const P1: Rect = { x: r.x, y: r.y, w: r.w, h: ph };
      const P2: Rect = { x: r.x, y: r.y + ph + gap, w: r.w, h: ph };
      const fs = sm ? 11 : 12;
      for (const [P, moving] of [
        [P1, false],
        [P2, true],
      ] as const) {
        const innerTop = P.y + (sm ? 38 : 44);
        const railY = P.y + P.h - (sm ? 14 : 18);
        const trainH = Math.min(railY - innerTop - 8, P.w * 0.3);
        const bottom = railY - Math.max(4, trainH * 0.2);
        const top = bottom - trainH;
        const cx = P.x + P.w * (moving ? 0.62 : 0.5);
        const trainLen = Math.min(P.w * 0.5, trainH * 3.4);
        const squash = moving ? 1 / gm : 1;
        const dpx = trainH * 0.74;
        const yBot = bottom - trainH * 0.1 - 3;
        const yTop = yBot - dpx;
        const spacing = Math.max(70, P.w * 0.22);
        panelBase(P, railY);
        // Masten: im Zugsystem wandert der (verkürzte) Bahnsteig nach links
        const off = moving ? 2 * b * dpx * ck.s : 2 * b * dpx * ck.top;
        masts(P, railY, innerTop - 4, off, moving ? spacing : spacing / gm);
        g.save();
        roundRect(g, P.x + 1, P.y + 1, P.w - 2, P.h - 2, 12);
        g.clip();
        drawTrain(cx, bottom, trainLen * squash, trainH, squash, { clock: true });
        const mw = Math.max(10, trainLen * 0.18 * squash);
        mirror(cx, yTop - 2, mw, true);
        mirror(cx, yBot + 2, mw, false);
        const ik = introK();
        if (!moving) {
          // Puls senkrecht zwischen den Spiegeln
          const yp = yBot - pulseHeight(ck.top) * dpx;
          g.strokeStyle = withA(light(), 0.28 * ik);
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(cx, yTop);
          g.lineTo(cx, yBot);
          g.stroke();
          photon(cx, yp, sm ? 3.2 : 4);
          // Maß d
          if (!sm || P.w > 330) {
            const dx = cx - trainLen * 0.5 - 14;
            g.strokeStyle = blue();
            arrowPx(dx, (yTop + yBot) / 2, dx, yTop + 1, blue(), 1.5, 6);
            arrowPx(dx, (yTop + yBot) / 2, dx, yBot - 1, blue(), 1.5, 6);
            rich(ctx.t('triDS'), dx - 8, (yTop + yBot) / 2, fs + 1, blue(), 'right');
          }
        } else {
          drawZigzag(P, cx, yBot, yTop, dpx, b, gm, fs, ik, (trainLen * squash) / 2);
          // Geschwindigkeitspfeil
          if (b > 0.004) {
            const ax = cx + (trainLen * squash) / 2 + 8;
            const al = 14 + 38 * b;
            if (ax + al < P.x + P.w - 6) arrowPx(ax, top + trainH * 0.4, ax + al, top + trainH * 0.4, ctx.theme.text, 2.2, 8);
          }
        }
        g.restore();
        // Beschriftung
        if (!moving) {
          panelTitle(P, ctx.t(sm ? 'trainFrameS' : 'trainFrame'), blue());
          if (P.w > 300) pill(P.x + P.w - 10, P.y + 9, ctx.t(sm ? 'tickPillS' : 'tickPill'), blue(), 'right', fs);
        } else {
          panelTitle(P, tr(sm ? 'platFrameS' : 'platFrame', { v: cText(show() ? b : p.v) }), red());
          const yy = P.y + 9 + (sm ? 26 : 0);
          if (show()) {
            const tPlat = ck.s * TICK;
            const tTrain = ck.tau * TICK;
            if (sm) {
              pill(P.x + P.w - 10, yy, tr('platClock', { t: nsText(tPlat) }), red(), 'right', fs);
              pill(P.x + P.w - 10, yy + 24, tr('trainClock', { t: nsText(tTrain) }), blue(), 'right', fs);
            } else {
              const w1 = pill(P.x + P.w - 10, yy, tr('platClock', { t: nsText(tPlat) }), red(), 'right', fs);
              pill(P.x + P.w - 18 - w1, yy, tr('trainClock', { t: nsText(tTrain) }), blue(), 'right', fs);
            }
          }
        }
      }
    }

    /** Zickzackweg des Lichts vom Bahnsteig aus, mit rechtwinkligem Dreieck. */
    function drawZigzag(P: Rect, cx: number, yBot: number, yTop: number, dpx: number, b: number, gm: number, fs: number, ik: number, halfTrain: number): void {
      const g = surface.g;
      const tauNow = ck.tau;
      const perTau = 2 * b * gm * dpx; // px pro Tick der Zuguhr
      const yAt = (k: number) => (k % 2 === 0 ? yBot : yTop);
      const pts: [number, number][] = [[cx, yBot - pulseHeight(tauNow) * dpx]];
      const kMax = Math.floor(2 * tauNow + 1e-9);
      const kMin = perTau < 1 ? Math.max(0, kMax - 2) : 0;
      for (let k = kMax; k >= kMin; k--) {
        const x = cx - (tauNow - k / 2) * perTau;
        pts.push([x, yAt(k)]);
        if (x < P.x - 30 || pts.length > 120) break;
      }
      // Spur, nach hinten ausblendend
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (let i = 0; i + 1 < pts.length; i++) {
        const [xa, ya] = pts[i]!;
        const [xb, yb] = pts[i + 1]!;
        const fade = clamp(1 - (cx - xb) / (P.w * 0.95), 0.12, 1) * ik;
        g.strokeStyle = withA(light(), 0.22 * fade);
        g.lineWidth = 7;
        g.beginPath();
        g.moveTo(xa, ya);
        g.lineTo(xb, yb);
        g.stroke();
        g.strokeStyle = withA(light(), 0.9 * fade);
        g.lineWidth = 2.2;
        g.stroke();
      }
      // Dreieck am letzten vollständigen Halbweg
      if (p.tri && b > 0.03 && kMax >= 1 && perTau >= 1) {
        // jüngster vollständiger Halbweg, der schon hinter dem Zug liegt (sonst der jüngste)
        let k1 = kMax;
        for (let k = kMax; k >= 1; k--) {
          if (cx - (tauNow - k / 2) * perTau < cx - halfTrain - 6) {
            if (cx - (tauNow - (k - 1) / 2) * perTau > P.x + 8) k1 = k;
            break;
          }
        }
        const k0 = k1 - 1;
        const xA = cx - (tauNow - k0 / 2) * perTau;
        const xB = cx - (tauNow - k1 / 2) * perTau;
        const yA = yAt(k0);
        const yB = yAt(k1);
        if (xA > P.x + 8) {
          g.save();
          g.globalAlpha *= ik;
          g.fillStyle = withA(light(), 0.08);
          g.beginPath();
          g.moveTo(xA, yA);
          g.lineTo(xB, yB);
          g.lineTo(xB, yA);
          g.closePath();
          g.fill();
          g.setLineDash([5, 4]);
          g.strokeStyle = red();
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(xA, yA);
          g.lineTo(xB, yA);
          g.stroke();
          g.strokeStyle = blue();
          g.beginPath();
          g.moveTo(xB, yA);
          g.lineTo(xB, yB);
          g.stroke();
          g.setLineDash([]);
          // rechter Winkel
          const s = Math.min(9, Math.abs(xB - xA) * 0.3);
          const sy = yB < yA ? -1 : 1;
          g.strokeStyle = withA(ctx.theme.text, 0.6);
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(xB - s, yA);
          g.lineTo(xB - s, yA + sy * s);
          g.lineTo(xB, yA + sy * s);
          g.stroke();
          const wide = xB - xA > 80;
          const runY = yA + (yA > yB ? 13 : -13);
          if (wide) rich(ctx.t('triRun'), (xA + xB) / 2, runY, fs, red(), 'center');
          const mx = (xA + xB) / 2;
          const my = (yA + yB) / 2;
          if (wide) rich(ctx.t('triHyp'), mx - 10, my - 10, fs, light(), 'right');
          rich(ctx.t(wide && fs > 11 ? 'triD' : 'triDS'), xB + 8, my, fs, blue(), 'left');
          g.restore();
        }
      }
      const [px, py] = pts[0]!;
      photon(px, py, 4);
    }

    /* ---------- Ansicht: Zug und Tunnel ---------- */
    function drawTunnel(x0: number, x1: number, railY: number, hT: number, P: Rect, front: boolean, glow: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const top = railY - hT;
      const pw = Math.max(5, Math.min(12, (x1 - x0) * 0.06));
      if (!front) {
        // Berg und dunkle Röhre (aufgeschnitten)
        const hillTop = Math.max(P.y + 40, top - hT * 0.55);
        const hill = g.createLinearGradient(0, hillTop, 0, railY);
        hill.addColorStop(0, dark ? '#2f4a3a' : '#a9c59a');
        hill.addColorStop(1, dark ? '#22352a' : '#86a777');
        g.fillStyle = hill;
        g.beginPath();
        g.moveTo(x0 - pw - 14, railY);
        g.bezierCurveTo(x0 - pw, hillTop + (top - hillTop) * 0.4, x0 + (x1 - x0) * 0.2, hillTop, (x0 + x1) / 2, hillTop);
        g.bezierCurveTo(x1 - (x1 - x0) * 0.2, hillTop, x1 + pw, hillTop + (top - hillTop) * 0.4, x1 + pw + 14, railY);
        g.closePath();
        g.fill();
        const tube = g.createLinearGradient(0, top, 0, railY);
        tube.addColorStop(0, dark ? '#0c1016' : '#3d4249');
        tube.addColorStop(1, dark ? '#171c24' : '#596069');
        g.fillStyle = tube;
        g.globalAlpha *= 0.9;
        const rr = Math.min(hT * 0.5, (x1 - x0) / 2);
        g.beginPath();
        g.moveTo(x0, railY);
        g.lineTo(x0, top + rr);
        g.quadraticCurveTo(x0, top, x0 + rr, top);
        g.lineTo(x1 - rr, top);
        g.quadraticCurveTo(x1, top, x1, top + rr);
        g.lineTo(x1, railY);
        g.closePath();
        g.fill();
        g.globalAlpha /= 0.9;
        if (glow > 0.01) {
          g.strokeStyle = withA(green(), 0.85 * glow);
          g.lineWidth = 3;
          g.stroke();
        }
        return;
      }
      // Portale vorn (Stein)
      const stone = dark ? '#6b6f76' : '#a3a29c';
      g.fillStyle = stone;
      for (const x of [x0 - pw, x1]) {
        roundRect(g, x, top - 2, pw, hT + 2, 2);
        g.fill();
      }
      g.strokeStyle = dark ? 'rgba(0,0,0,0.4)' : 'rgba(40,40,40,0.25)';
      g.lineWidth = 1;
      for (const x of [x0 - pw, x1]) {
        for (let y = top + 6; y < railY - 2; y += 7) {
          g.beginPath();
          g.moveTo(x, y);
          g.lineTo(x + pw, y);
          g.stroke();
        }
      }
    }

    function drawLenScene(r: Rect): void {
      const g = surface.g;
      const sm = r.w < 520;
      const fs = sm ? 11 : 12;
      const b = bS;
      const gm = gS();
      const gap = 10;
      const ph = (r.h - gap) / 2;
      const ik = introK();
      for (const [P, trainFrame] of [
        [{ x: r.x, y: r.y, w: r.w, h: ph }, false],
        [{ x: r.x, y: r.y + ph + gap, w: r.w, h: ph }, true],
      ] as const) {
        const railY = P.y + P.h - (sm ? 30 : 34);
        const k = (P.w * 0.5) / p.L0;
        const cx = P.x + P.w / 2;
        const restPx = p.L0 * k;
        const movPx = restPx / gm;
        const avail = railY - (P.y + (sm ? 40 : 46));
        const hT = Math.min(avail * 0.62, 70);
        const trainH = hT * 0.62;
        const bottom = railY - trainH * 0.2;
        // Weg des bewegten Körpers (oben der Zug nach rechts, unten der Tunnel nach links)
        const range = P.w / 2 + Math.max(restPx, movPx) / 2 + 30;
        const off = lenU * range;
        const tunC = trainFrame ? cx - off : cx;
        const tunL = trainFrame ? movPx : restPx;
        const trC = trainFrame ? cx : cx + off;
        const trL = trainFrame ? restPx : movPx;
        const t0 = tunC - tunL / 2;
        const t1 = tunC + tunL / 2;
        const a0 = trC - trL / 2;
        const a1 = trC + trL / 2;
        const inside = a0 >= t0 - 0.5 && a1 <= t1 + 0.5;
        const glow = ease2(trainFrame ? 'glowB' : 'glowA', inside && !trainFrame && b > 0.01 ? 1 : 0, 10);
        panelBase(P, railY);
        masts(P, railY, P.y + (sm ? 36 : 40), trainFrame ? -off : 0, trainFrame ? P.w * 0.3 / gm : P.w * 0.3);
        g.save();
        roundRect(g, P.x + 1, P.y + 1, P.w - 2, P.h - 2, 12);
        g.clip();
        g.globalAlpha = ik;
        drawTunnel(t0, t1, railY, hT, P, false, glow);
        if (!trainFrame) ghostRect(trC - restPx / 2, trC + restPx / 2, bottom - trainH - 4, bottom + 4, purple(), 0.7);
        else ghostRect(tunC - restPx / 2, tunC + restPx / 2, railY - hT - 3, railY, purple(), 0.55);
        drawTrain(trC, bottom, trL, trainH, trainFrame ? 1 : 1 / gm);
        drawTunnel(t0, t1, railY, hT, P, true, glow);
        // Überstand rot markieren, wenn der Tunnel (unten) über dem Zug liegt
        if (trainFrame && b > 0.01 && Math.abs(tunC - trC) < (restPx - movPx) / 2 + 1) {
          g.fillStyle = withA(red(), 0.22);
          g.fillRect(a0, bottom - trainH, Math.max(0, t0 - a0), trainH);
          g.fillRect(t1, bottom - trainH, Math.max(0, a1 - t1), trainH);
        }
        // Maße
        const lab = (key: string, len: number) => tr(key, { l: show() || key.endsWith('Rest') ? lenText(len) : ctx.t('hiddenVal') });
        const tunKey = trainFrame ? 'tunnelMoving' : 'tunnelRest';
        const trKey = trainFrame ? 'trainRest' : 'trainMoving';
        dimension(t0, t1, railY - hT - (sm ? 10 : 14), lab(tunKey, trainFrame ? p.L0 / gamma(p.v) : p.L0), trainFrame ? purple() : ctx.theme.text, P, false, fs);
        dimension(a0, a1, railY + (sm ? 10 : 12), lab(trKey, trainFrame ? p.L0 : p.L0 / gamma(p.v)), trainFrame ? ctx.theme.text : purple(), P, true, fs);
        if (b > 0.004) {
          const dir = trainFrame ? -1 : 1;
          const ax = trainFrame ? t0 - 16 : a1 + 10;
          arrowPx(ax, bottom - trainH * 1.25, ax + dir * (16 + 30 * b), bottom - trainH * 1.25, ctx.theme.text, 2.2, 8);
        }
        g.restore();
        panelTitle(P, ctx.t(trainFrame ? (sm ? 'lenTrainS' : 'lenTrain') : sm ? 'lenPlatS' : 'lenPlat'), trainFrame ? blue() : red());
        // Ergebnis-Etikett
        const sticks = trainFrame && b > 0.01 && Math.abs(tunC - trC) < (restPx - movPx) / 2 + 1;
        if (!sm || P.w > 340) {
          if (!trainFrame && glow > 0.05) {
            g.save();
            g.globalAlpha = glow;
            pill(P.x + P.w - 10, P.y + 9, ctx.t('fits'), green(), 'right', fs);
            g.restore();
          } else if (sticks) pill(P.x + P.w - 10, P.y + 9, ctx.t('sticks'), red(), 'right', fs);
        }
      }
    }

    /* ---------- Ansicht: Gleichzeitigkeit ---------- */
    /** Zeiten der Gleichzeitigkeit in Animationssekunden. */
    function simTimes(b: number) {
      const s = simultaneity(p.L0, b);
      const physPerReal = s.tTrain / SIM_TOP;
      const rate = Math.max(1, s.tFront / physPerReal / SIM_MAX);
      return { s, physPerReal, rate, endTop: SIM_TOP, endBottom: s.tFront / physPerReal / rate };
    }

    function drawSimScene(r: Rect): void {
      const g = surface.g;
      const sm = r.w < 520;
      const fs = sm ? 11 : 12;
      const b = bS;
      const gm = gS();
      const gap = 10;
      const ph = (r.h - gap) / 2;
      const ik = introK();
      const st = simTimes(b);
      for (const [P, moving] of [
        [{ x: r.x, y: r.y, w: r.w, h: ph }, false],
        [{ x: r.x, y: r.y + ph + gap, w: r.w, h: ph }, true],
      ] as const) {
        const tlH = sm ? 26 : 30;
        const railY = P.y + P.h - tlH - 6;
        const innerTop = P.y + (sm ? 40 : 46);
        const trainH = Math.min((railY - innerTop) * 0.8, 64);
        const bottom = railY - trainH * 0.2;
        const midY = bottom - trainH * 0.55;
        const k = (P.w * 0.62) / p.L0;
        const cx = P.x + P.w * (moving ? 0.56 : 0.5);
        const half = (p.L0 * k) / 2;
        const cpx = half / SIM_TOP; // px pro Animationssekunde (oben)
        // Zeit in diesem Bezugssystem (Animationssekunden, unten ggf. zeitgerafft)
        const tt = moving ? simT * st.rate : Math.min(simT, st.endTop + 0.0001);
        const tPhys = tt * st.physPerReal;
        const halfM = moving ? half / gm : half;
        const shift = moving ? b * cpx * tt : 0; // Zugweg seit dem Blitz
        const rearHit = moving ? st.s.tBack : st.s.tTrain;
        const frontHit = moving ? st.s.tFront : st.s.tTrain;
        panelBase(P, railY);
        masts(P, railY, innerTop - 4, shift, moving ? P.w * 0.25 : P.w * 0.25 / gm);
        g.save();
        roundRect(g, P.x + 1, P.y + 1, P.w - 2, P.h - tlH - 4, 12);
        g.clip();
        g.globalAlpha = ik;
        const flash = clamp(1 - tPhys / (st.s.tTrain * 0.5), 0, 1);
        drawTrain(cx, bottom, 2 * halfM, trainH, moving ? 1 / gm : 1, { lamp: flash });
        // Empfänger an den Enden
        for (const [side, hitT] of [
          [-1, rearHit],
          [1, frontHit],
        ] as const) {
          const ex = cx + side * (halfM - Math.max(3, 6 / (moving ? gm : 1)));
          const on = tPhys >= hitT;
          const age = on ? (tPhys - hitT) / st.physPerReal / (moving ? st.rate : 1) : -1;
          g.fillStyle = on ? green() : ctx.theme.dark ? '#5a6370' : '#9aa3ad';
          g.beginPath();
          g.arc(ex, midY, sm ? 4 : 5, 0, TAU);
          g.fill();
          if (on && age < 0.9) {
            g.strokeStyle = withA(green(), 0.8 * (1 - age / 0.9));
            g.lineWidth = 2.5;
            g.beginPath();
            g.arc(ex, midY, 6 + 22 * ease.outCubic(age / 0.9), 0, TAU);
            g.stroke();
            animating = true;
          }
        }
        // Lichtwelle: Kreis um den Ort der Aussendung (vom Bahnsteig aus ruht dieser Ort)
        const ox = cx - shift;
        const rad = cpx * tt;
        if (rad > 0.5) {
          g.strokeStyle = withA(light(), 0.22);
          g.lineWidth = 8;
          g.beginPath();
          g.arc(ox, midY, rad, 0, TAU);
          g.stroke();
          g.strokeStyle = withA(light(), 0.95);
          g.lineWidth = 2.2;
          g.stroke();
          // Lichtpunkte entlang des Zuges
          const xr = ox - rad;
          const xf = ox + rad;
          if (tPhys < rearHit) photon(xr, midY, 3.6);
          if (tPhys < frontHit) photon(xf, midY, 3.6);
        }
        if (moving && shift > 14) {
          // Ort der Aussendung (ruht im Bahnsteigsystem)
          g.strokeStyle = withA(light(), 0.8);
          g.lineWidth = 1.5;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.moveTo(ox, innerTop + 4);
          g.lineTo(ox, railY);
          g.stroke();
          g.setLineDash([]);
          if (ox > P.x + 100 && !sm) rich(ctx.t('origin'), ox - 6, innerTop + 6, fs - 1, light(), 'right', true, 650);
        }
        // Zeitmarken an den Enden
        if (show()) {
          const lab = (side: number, hitT: number, key: string) => {
            if (tPhys < hitT) return;
            const xx = cx + side * halfM;
            const text = tr('atT', { w: ctx.t(key), t: timeText(hitT) });
            const w = textW(text, fs);
            const lx = clamp(xx, P.x + w / 2 + 6, P.x + P.w - w / 2 - 6);
            rich(text, lx, bottom - trainH - 10, fs, green(), 'center');
          };
          if (!moving && tPhys >= st.s.tTrain) {
            const text = tr('both', { t: timeText(st.s.tTrain) });
            rich(text, cx, bottom - trainH - 10, fs, green(), 'center');
          } else {
            lab(-1, rearHit, 'rear');
            lab(1, frontHit, 'front');
          }
        }
        if (b > 0.004 && moving) {
          const ax = cx + halfM + 10;
          arrowPx(ax, bottom - trainH * 0.25, ax + 14 + 30 * b, bottom - trainH * 0.25, ctx.theme.text, 2.2, 8);
        }
        g.restore();
        // Zeitleiste
        drawTimeline({ x: P.x + 12, y: P.y + P.h - tlH, w: P.w - 24, h: tlH - 4 }, moving ? st.s.tFront : st.s.tTrain, tPhys, rearHit, frontHit, fs, sm);
        panelTitle(P, moving ? tr(sm ? 'simPlatS' : 'simPlat', { v: cText(show() ? b : p.v) }) : ctx.t(sm ? 'simTrainS' : 'simTrain'), moving ? red() : blue());
        if (moving && st.rate > 1.05 && P.w > 300) pill(P.x + P.w - 10, P.y + 9, `${fmt.num(st.rate, 1)}× ${ctx.lang === 'de' ? 'Zeitraffer' : 'time-lapse'}`, purple(), 'right', fs);
      }
    }

    function drawTimeline(R: Rect, tEnd: number, tNow: number, tRear: number, tFront: number, fs: number, sm: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const tMax = Math.max(tEnd * 1.15, 1e-12);
      const y = R.y + 8;
      const X = (t: number) => R.x + 4 + (clamp(t, 0, tMax) / tMax) * (R.w - 8);
      g.strokeStyle = withA(theme.text, 0.35);
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(X(0), y);
      g.lineTo(X(tMax), y);
      g.stroke();
      g.strokeStyle = light();
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(X(0), y);
      g.lineTo(X(tNow), y);
      g.stroke();
      for (const [t, key] of [
        [tRear, 'rear'],
        [tFront, 'front'],
      ] as const) {
        const on = tNow >= t;
        g.fillStyle = on ? green() : theme.bg;
        g.strokeStyle = green();
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(X(t), y, 4.5, 0, TAU);
        g.fill();
        g.stroke();
        if (Math.abs(tRear - tFront) > tMax * 0.08 || key === 'rear') {
          const txt = Math.abs(tRear - tFront) <= tMax * 0.08 ? `${ctx.t('rear')} = ${ctx.t('front')}` : ctx.t(key);
          rich(txt, X(t), y + (sm ? 12 : 13), fs - 1, theme.muted, key === 'front' && X(t) > R.x + R.w - 30 ? 'right' : 'center', false, 650);
        }
      }
      rich('t', X(tMax) + 2, y - 9, fs, theme.muted, 'right', false, 600);
    }

    /* ---------- Ansicht: Myonen ---------- */
    function muPhysPerReal(b: number): number {
      return b >= 0.005 ? flightTime(p.h * 1000, b) / FALL : MUON_TAU / 0.6;
    }

    /** Zerfalls- und Ankunftszeit (Animationssekunden) eines Myons; relativistic: Lebensdauer γ·τ. */
    function muFate(m: Muon, b: number, rel: boolean): { dieAt: number; arriveAt: number } {
      const lab = m.life * (rel ? gamma(b) : 1);
      const dieAt = m.born + lab / muPhysPerReal(b);
      const arriveAt = b >= 0.005 ? m.born + FALL : Infinity;
      return { dieAt, arriveAt };
    }

    function resetMuons(): void {
      muons = [];
      muT = 0;
      muNext = 0;
      muDone.a = 0;
      muDone.b = 0;
      muDone.n = 0;
      rng = seededRandom(20261122);
      // Vorlauf: Die Säulen sind beim Start schon gefüllt
      stepMuons(prefersReducedMotion() ? FALL * 0.8 : FALL * 1.05);
    }

    function stepMuons(dt: number): void {
      muT += dt;
      while (muNext <= muT) {
        muons.push({ born: muNext, life: -MUON_TAU * Math.log(1 - rng()), x: 0.12 + 0.76 * rng() });
        muNext += (0.6 + 0.8 * rng()) / SPAWN;
      }
      const b = p.v;
      const keep: Muon[] = [];
      for (const m of muons) {
        const fa = muFate(m, b, false);
        const fb = muFate(m, b, true);
        const endA = Math.min(fa.dieAt, fa.arriveAt);
        const endB = Math.min(fb.dieAt, fb.arriveAt);
        if (muT > Math.max(endA, endB) + 0.9) {
          muDone.n += 1;
          if (fa.arriveAt <= fa.dieAt) muDone.a += 1;
          if (fb.arriveAt <= fb.dieAt) muDone.b += 1;
        } else keep.push(m);
      }
      muons = keep;
    }

    /** Zählerstände: gestartet, unten angekommen (klassisch / relativistisch). */
    function muCounts(): { n: number; a: number; b: number } {
      let n = muDone.n;
      let a = muDone.a;
      let bb = muDone.b;
      for (const m of muons) {
        const fa = muFate(m, p.v, false);
        const fb = muFate(m, p.v, true);
        const endA = Math.min(fa.dieAt, fa.arriveAt);
        const endB = Math.min(fb.dieAt, fb.arriveAt);
        if (muT >= Math.max(endA, endB)) {
          n += 1;
          if (fa.arriveAt <= fa.dieAt) a += 1;
          if (fb.arriveAt <= fb.dieAt) bb += 1;
        }
      }
      return { n, a, b: bb };
    }

    function drawMuonScene(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const sm = r.w < 520;
      const fs = sm ? 11 : 12;
      const b = p.v;
      const gm = gamma(b);
      const ik = introK();
      const three = r.w >= 500;
      const gap = 10;
      const wC = three ? Math.round(r.w * 0.26) : 0;
      const wCol = (r.w - wC - gap * (three ? 2 : 1)) / 2;
      const cols: { R: Rect; rel: boolean }[] = [
        { R: { x: r.x, y: r.y, w: wCol, h: r.h }, rel: false },
        { R: { x: r.x + wCol + gap, y: r.y, w: wCol, h: r.h }, rel: true },
      ];
      const counts = muCounts();
      for (const { R, rel } of cols) {
        const show2 = rel || p.cls;
        card(R, rel ? green() : red());
        const head = sm ? 44 : 50;
        const topY = R.y + head + 10;
        const groundY = R.y + R.h - (sm ? 46 : 52);
        g.save();
        roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 12);
        g.clip();
        g.globalAlpha = show2 ? ik : 0.35 * ik;
        const sky = g.createLinearGradient(0, topY, 0, groundY);
        sky.addColorStop(0, dark ? '#0b1322' : '#1c3d73');
        sky.addColorStop(0.55, dark ? '#16294a' : '#4f7fc0');
        sky.addColorStop(1, dark ? '#2a4a72' : '#a9cbee');
        g.fillStyle = sky;
        g.fillRect(R.x, topY, R.w, groundY - topY);
        // Höhenmarken
        g.strokeStyle = 'rgba(255,255,255,0.25)';
        g.lineWidth = 1;
        const stepKm = niceStep(p.h / 4);
        g.font = `600 ${fs - 1}px ${ctx.theme.font}`;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        for (let km = 0; km <= p.h + 1e-9; km += stepKm) {
          const y = groundY - (km / p.h) * (groundY - topY);
          g.beginPath();
          g.moveTo(R.x, y);
          g.lineTo(R.x + 8, y);
          g.stroke();
          if (km > 0 && groundY - y > 16 && y - topY > 12) {
            g.fillStyle = 'rgba(255,255,255,0.75)';
            g.fillText(`${fmt.num(km, 1)} km`, R.x + 11, y);
          }
        }
        // Entstehungsschicht
        g.strokeStyle = 'rgba(255,255,255,0.6)';
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(R.x, topY);
        g.lineTo(R.x + R.w, topY);
        g.stroke();
        g.setLineDash([]);
        // Boden mit Detektor
        const soil = g.createLinearGradient(0, groundY, 0, R.y + R.h);
        soil.addColorStop(0, dark ? '#2f3a2a' : '#7c9a5c');
        soil.addColorStop(1, dark ? '#1f251c' : '#5f7a45');
        g.fillStyle = soil;
        g.fillRect(R.x, groundY, R.w, R.y + R.h - groundY);
        const detW = R.w * 0.76;
        g.fillStyle = dark ? '#3a4452' : '#e6eaef';
        roundRect(g, R.x + (R.w - detW) / 2, groundY - 5, detW, 10, 3);
        g.fill();
        // Myonen
        if (show2) {
          for (const m of muons) {
            const f = muFate(m, b, rel);
            if (muT < m.born) continue;
            const x = R.x + 12 + m.x * (R.w - 24);
            const yAt = (t: number) => topY + clamp((t - m.born) / FALL, 0, 1) * (groundY - topY);
            const ended = Math.min(f.dieAt, f.arriveAt);
            if (muT < ended) {
              const y = b >= 0.005 ? yAt(muT) : topY + 4;
              const trail = Math.min(26, y - topY);
              const tg = g.createLinearGradient(0, y - trail, 0, y);
              tg.addColorStop(0, withA(teal(), 0));
              tg.addColorStop(1, withA(dark ? '#9fe7f5' : '#d6f6ff', 0.85));
              g.strokeStyle = tg;
              g.lineWidth = 2;
              g.beginPath();
              g.moveTo(x, y - trail);
              g.lineTo(x, y);
              g.stroke();
              g.fillStyle = '#ffffff';
              g.beginPath();
              g.arc(x, y, 2.4, 0, TAU);
              g.fill();
            } else {
              const age = muT - ended;
              if (age > 0.9) continue;
              const y = f.dieAt < f.arriveAt ? (b >= 0.005 ? yAt(f.dieAt) : topY + 4) : groundY - 3;
              const a = 1 - age / 0.9;
              const col = f.dieAt < f.arriveAt ? '#ffc27a' : '#9ff0a8';
              const rr = 3 + 9 * ease.outCubic(age / 0.9);
              const bg = g.createRadialGradient(x, y, 0, x, y, rr);
              bg.addColorStop(0, withA(col, 0.55 * a));
              bg.addColorStop(1, withA(col, 0));
              g.fillStyle = bg;
              g.beginPath();
              g.arc(x, y, rr, 0, TAU);
              g.fill();
              g.strokeStyle = withA(col, 0.8 * a);
              g.lineWidth = 1.4;
              g.stroke();
            }
          }
        }
        g.restore();
        // Kopf und Zähler
        rich(ctx.t(rel ? (sm ? 'muBS' : 'muB') : sm ? 'muAS' : 'muA'), R.x + R.w / 2, R.y + 18, fs + 1, rel ? green() : red(), 'center', false);
        const pS = survival(p.h * 1000, b, MUON_TAU, rel);
        const life = MUON_TAU * (rel ? gm : 1);
        rich(show() ? `τ = ${timeText(life, 3)}` : 'τ = ?', R.x + R.w / 2, R.y + 36, fs, ctx.theme.muted, 'center', false, 650);
        rich(ctx.t('ground'), R.x + R.w / 2, groundY + 16, fs - 1, '#ffffff', 'center', false, 650);
        if (show2) {
          const n = rel ? counts.b : counts.a;
          rich(tr('arrived', { n: String(n), m: String(counts.n) }), R.x + R.w / 2, groundY + 32, fs, '#ffffff', 'center', false, 700);
        }
        if (show() && show2) pill(R.x + R.w / 2, groundY - 34, `${fmt.num(100 * pS, pS < 0.001 ? 4 : 1)} %`, rel ? green() : red(), 'center', fs);
        if (b < 0.005 && rel) rich(ctx.t('still'), R.x + R.w / 2, (topY + groundY) / 2, fs - 1, '#ffffff', 'center', false, 650);
      }
      if (three) drawMuonView({ x: r.x + 2 * wCol + 2 * gap, y: r.y, w: wC, h: r.h }, fs);
    }

    /** Sicht des Myons: verkürzte Atmosphäre gegen den Weg während einer Lebensdauer. */
    function drawMuonView(R: Rect, fs: number): void {
      const g = surface.g;
      const b = bS;
      const gm = gS();
      card(R, teal());
      rich(ctx.t('muC'), R.x + R.w / 2, R.y + 18, fs + 1, teal(), 'center', false);
      const atm = (p.h * 1000) / gm;
      const run = b * C * MUON_TAU;
      const top = R.y + 62 + 2 * fs;
      const bottom = R.y + R.h - 34;
      const maxV = Math.max(atm, run, 1) * 1.1;
      const H = (v: number) => ((bottom - top) * v) / maxV;
      const barW = Math.min(36, R.w * 0.22);
      const bars: [number, string, string, number][] = [
        [atm, blue(), ctx.t('atmos'), R.x + R.w * 0.3],
        [run, green(), ctx.t('lifeRun'), R.x + R.w * 0.7],
      ];
      for (const [v, col, label, x] of bars) {
        const hgt = Math.max(2, H(ease2(`mv${label}`, v)));
        const grad = g.createLinearGradient(0, bottom - hgt, 0, bottom);
        grad.addColorStop(0, withA(col, 0.95));
        grad.addColorStop(1, withA(col, 0.55));
        g.fillStyle = grad;
        roundRect(g, x - barW / 2, bottom - hgt, barW, hgt, 4);
        g.fill();
        if (show()) rich(lenText(v, 0), x, bottom - hgt - 10, fs, col, 'center');
        const words = label.split(': ');
        rich(words[1] ?? words[0]!, x, bottom + 14, fs, col, 'center', false, 750);
        rich(words[0]!, R.x + 12, R.y + (col === blue() ? 38 : 38 + fs + 4), fs - 1, col, 'left', false, 650);
      }
      g.strokeStyle = ctx.theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(R.x + 10, bottom + 0.5);
      g.lineTo(R.x + R.w - 10, bottom + 0.5);
      g.stroke();
    }

    /* ---------- Ansicht: Energie ---------- */
    function drawEnergyScene(r: Rect): void {
      const g = surface.g;
      const sm = r.w < 520;
      const fs = sm ? 11 : 12;
      const b = bS;
      const gm = gS();
      const ik = introK();
      const en = energies(particle().e0, b);
      const bCl = Math.sqrt(2 * gammaMinusOne(b));
      const gap = 10;
      const hTop = Math.round(r.h * 0.5);
      const A: Rect = { x: r.x, y: r.y, w: r.w, h: hTop };
      const B: Rect = { x: r.x, y: r.y + hTop + gap, w: r.w, h: r.h - hTop - gap };
      // Rennbahn: Licht, Teilchen, klassische Vorhersage
      card(A, orange());
      rich(ctx.lang === 'de' ? 'Wer ist schneller?' : 'Who is faster?', A.x + 14, A.y + 18, fs + 1, ctx.theme.text, 'left', false);
      const laneX0 = A.x + 14;
      const laneX1 = A.x + A.w - 14;
      const rows = p.cls ? 3 : 2;
      const laneTop = A.y + 36;
      const laneH = (A.h - 46) / rows;
      const runners: [number, string, string][] = [
        [1, light(), ctx.t('laneLight') + ': c'],
        [b, blue(), tr('laneRel', { p: pName(), v: show() ? cText(b) : '?' })],
        [bCl, red(), tr('laneCl', { v: show() ? cText(bCl) : '?' })],
      ];
      for (let i = 0; i < rows; i++) {
        const [beta, col, label] = runners[i]!;
        const y = laneTop + laneH * i + laneH / 2 + 6;
        const g2 = g;
        g2.fillStyle = ctx.theme.dark ? 'rgba(255,255,255,0.04)' : 'rgba(20,30,45,0.04)';
        roundRect(g2, laneX0, y - 9, laneX1 - laneX0, 18, 9);
        g2.fill();
        g2.strokeStyle = withA(col, 0.35);
        g2.setLineDash([6, 6]);
        g2.beginPath();
        g2.moveTo(laneX0 + 8, y);
        g2.lineTo(laneX1 - 8, y);
        g2.stroke();
        g2.setLineDash([]);
        const x = laneX0 + 10 + lanes[i]! * (laneX1 - laneX0 - 20);
        // Schweif proportional zur Geschwindigkeit
        const tail = Math.min(80, 50 * beta);
        const tg = g2.createLinearGradient(x - tail, 0, x, 0);
        tg.addColorStop(0, withA(col, 0));
        tg.addColorStop(1, withA(col, 0.6));
        g2.strokeStyle = tg;
        g2.lineWidth = 5;
        g2.lineCap = 'round';
        g2.beginPath();
        g2.moveTo(Math.max(laneX0 + 4, x - tail), y);
        g2.lineTo(x, y);
        g2.stroke();
        g2.save();
        g2.globalAlpha = ik;
        if (i === 0) photon(x, y, 4);
        else {
          g2.fillStyle = col;
          g2.beginPath();
          g2.arc(x, y, 6, 0, TAU);
          g2.fill();
          g2.strokeStyle = ctx.theme.bg;
          g2.lineWidth = 1.5;
          g2.stroke();
        }
        g2.restore();
        const warn = i === 2 && bCl > 1 ? ` · ${ctx.t('laneFaster')}` : '';
        rich(label + warn, laneX0 + 4, y - laneH / 2 + 3, fs, col, 'left', true, 700);
      }
      // Energiebalken
      card(B, blue());
      rich(ctx.lang === 'de' ? 'Energie des Teilchens' : 'Energy of the particle', B.x + 14, B.y + 18, fs + 1, ctx.theme.text, 'left', false);
      const pad = sm ? 12 : 16;
      const barH = sm ? 20 : 24;
      const x0 = B.x + pad;
      const x1 = B.x + B.w - pad;
      const totalCl = en.e0 + en.kinClassic;
      const maxE = ease2('emax', Math.max(en.e, totalCl) * 1.3, 6);
      const X = (e: number) => x0 + ((x1 - x0) * e) / maxE;
      const rowsB: [string, number, number, boolean][] = [[ctx.t('barRel'), en.e0, en.kin, false]];
      if (p.cls) rowsB.push([ctx.t('barCl'), en.e0, en.kinClassic, true]);
      const rowGap = (B.h - 56 - rowsB.length * barH) / (rowsB.length + 0.4);
      rowsB.forEach(([label, e0, kin, dashed], i) => {
        const y = B.y + 34 + rowGap * (i + 0.7) + i * barH;
        rich(label, x0, y - 9, fs, dashed ? ctx.theme.muted : ctx.theme.text, 'left', false, 700);
        const xe0 = X(e0);
        const xk = X(e0 + kin);
        const restGrad = g.createLinearGradient(0, y, 0, y + barH);
        restGrad.addColorStop(0, withA(blue(), 0.95));
        restGrad.addColorStop(1, withA(blue(), 0.7));
        g.fillStyle = restGrad;
        roundRect(g, x0, y, Math.max(2, xe0 - x0), barH, 4);
        g.fill();
        const kGrad = g.createLinearGradient(0, y, 0, y + barH);
        kGrad.addColorStop(0, withA(dashed ? red() : orange(), dashed ? 0.55 : 0.95));
        kGrad.addColorStop(1, withA(dashed ? red() : orange(), dashed ? 0.35 : 0.7));
        g.fillStyle = kGrad;
        if (xk - xe0 > 0.5) {
          roundRect(g, xe0 + 1, y, xk - xe0 - 1, barH, 4);
          g.fill();
          if (dashed) {
            g.strokeStyle = red();
            g.setLineDash([4, 3]);
            g.lineWidth = 1.4;
            roundRect(g, xe0 + 1, y + 0.7, xk - xe0 - 1.5, barH - 1.4, 4);
            g.stroke();
            g.setLineDash([]);
          }
        }
        const inside = (txt: string, a: number, bb: number, col: string) => {
          if (bb - a > textW(txt, fs - 1) + 10) rich(txt, (a + bb) / 2, y + barH / 2, fs - 1, col, 'center', false, 700);
        };
        inside(ctx.t('rest'), x0, xe0, '#ffffff');
        inside(ctx.t('kin'), xe0, xk, dashed ? ctx.theme.text : '#ffffff');
        if (show()) {
          const tot = eText(e0 + kin);
          rich(tot, Math.min(xk + 8, x1 - textW(tot, fs)), y + barH / 2, fs, ctx.theme.text, 'left', true, 700);
        }
      });
      if (show()) {
        const info = `${tr('pcE', { e: eText(en.pc) })} · γ = ${gText(gm)}`;
        rich(info, x0, B.y + B.h - 14, fs, ctx.theme.muted, 'left', false, 650);
      }
    }

    /* ---------- Ansicht: Alltag und Experimente ---------- */
    const LOGX: [number, number] = [0, Math.log10(C) + 0.18];
    const LOGY: [number, number] = [-18, 5];

    function drawAppsScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = r.w < 420;
      const fs = sm ? 11 : 12;
      const ik = introK();
      card(r);
      rich(ctx.t(sm ? 'appsChipS' : 'appsChip'), r.x + 14, r.y + 19, fs + 1, theme.text, 'left', false);
      const A: Rect = { x: r.x + (sm ? 46 : 56), y: r.y + 56, w: r.w - (sm ? 60 : 76), h: r.h - (sm ? 96 : 102) };
      chartA = A;
      const X = (lv: number) => A.x + ((lv - LOGX[0]) / (LOGX[1] - LOGX[0])) * A.w;
      const Y = (lg: number) => A.y + A.h - ((lg - LOGY[0]) / (LOGY[1] - LOGY[0])) * A.h;
      // Alltagsbereich
      g.fillStyle = withA(green(), theme.dark ? 0.09 : 0.06);
      g.fillRect(A.x, Y(-8), A.w, Y(LOGY[0]) - Y(-8));
      rich(ctx.t('everyday'), X(Math.log10(C)) - 14, Y(LOGY[0]) - 12, fs, green(), 'right', true, 650);
      // Gitter
      g.lineWidth = 1;
      g.strokeStyle = theme.grid;
      g.font = `${fs}px ${theme.font}`;
      g.fillStyle = theme.muted;
      for (let e = 0; e <= 8; e += sm ? 2 : 1) {
        const x = Math.round(X(e)) + 0.5;
        g.beginPath();
        g.moveTo(x, A.y);
        g.lineTo(x, A.y + A.h);
        g.stroke();
        rich(`10${supNum(e)}`, x, A.y + A.h + 12, fs, theme.muted, 'center', false, 500);
      }
      for (let e = LOGY[0]; e <= LOGY[1]; e += sm ? 6 : 3) {
        const y = Math.round(Y(e)) + 0.5;
        g.beginPath();
        g.moveTo(A.x, y);
        g.lineTo(A.x + A.w, y);
        g.stroke();
        rich(`10${supNum(e)}`, A.x - 6, y, fs, theme.muted, 'right', false, 500);
      }
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w, A.y + A.h + 0.5);
      g.stroke();
      rich(ctx.t('appsAxisX'), A.x + A.w, A.y + A.h + (sm ? 26 : 28), fs, theme.muted, 'right', false, 600);
      rich(ctx.t('appsAxisY'), A.x + 8, A.y + 2, fs, theme.muted, 'left', true, 600);
      // Lichtgeschwindigkeit
      const xc = X(Math.log10(C));
      g.strokeStyle = withA(light(), 0.9);
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(xc, A.y);
      g.lineTo(xc, A.y + A.h);
      g.stroke();
      g.setLineDash([]);
      if (!sm) {
        g.save();
        g.translate(xc - 8, A.y + A.h * 0.55);
        g.rotate(-Math.PI / 2);
        rich(ctx.t('lightSpeed'), 0, 0, fs, light(), 'center', true, 650);
        g.restore();
      }
      // Kurve γ − 1 über v (bis knapp unter c)
      g.save();
      g.beginPath();
      g.rect(A.x, A.y, A.w, A.h);
      g.clip();
      const pts: [number, number][] = [];
      const n = 260;
      const lvEnd = LOGX[0] + (Math.log10(C * 0.999999999) - LOGX[0]) * ik;
      for (let i = 0; i <= n; i++) {
        const u = i / n;
        // dichter nahe c
        const lv = LOGX[0] + (lvEnd - LOGX[0]) * (1 - (1 - u) ** 1.6);
        const v = 10 ** lv;
        const gm1 = gammaMinusOne(Math.min(v / C, 0.999999999));
        pts.push([X(lv), Y(Math.log10(gm1))]);
      }
      g.strokeStyle = blue();
      g.lineWidth = 3;
      g.lineJoin = 'round';
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
      // Beispiele
      exPts = [];
      const sel = p.ex as ExampleId;
      EXAMPLES.forEach((ex) => {
        const lv = Math.log10(ex.v);
        const lg = Math.log10(gammaMinusOne(ex.v / C));
        const x = X(lv);
        const y = Y(clamp(lg, LOGY[0], LOGY[1]));
        exPts.push({ id: ex.id, x, y });
        const on = ex.id === sel;
        const hot = hoverEx === ex.id || ctx.keyFocus === ex.id;
        const pop = ease2(`pop${ex.id}`, on ? 1 : 0, 10);
        g.save();
        g.globalAlpha = ik;
        if (pop > 0.01) {
          g.fillStyle = withA(orange(), 0.18 * pop);
          g.beginPath();
          g.arc(x, y, 9 + 8 * pop, 0, TAU);
          g.fill();
        }
        g.fillStyle = on ? orange() : theme.bg;
        g.strokeStyle = on ? orange() : blue();
        g.lineWidth = hot ? 3 : 2;
        g.beginPath();
        g.arc(x, y, on ? 7 : hot ? 6.5 : 5.5, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        // Beschriftung links oberhalb (dort ist neben der steigenden Kurve Platz)
        const txt = on ? ex.label[ctx.lang] : ex.short[ctx.lang];
        const w = textW(txt, fs);
        rich(txt, Math.max(A.x + 4 + w, x - 10), y - 11, on ? fs + 0.5 : fs - 0.5, on ? orange() : theme.muted, 'right', true, on ? 750 : 600);
      });
      ctx.setKeyTargets(
        mode() === 'apps'
          ? EXAMPLES.map((ex) => {
              const pt = exPts.find((q) => q.id === ex.id)!;
              return { id: ex.id, label: ex.label[ctx.lang], rect: { x: pt.x - 10, y: pt.y - 10, w: 20, h: 20 }, disabled: ctx.locked, activate: () => pickExample(ex.id) };
            })
          : [],
      );
    }

    function pickExample(id: ExampleId): void {
      if (ctx.locked) return;
      ctx.set({ ex: id });
    }

    function drawAppsCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const ex = EXAMPLES.find((e) => e.id === p.ex) ?? EXAMPLES[2]!;
      const b = ex.v / C;
      const sm = R.w < 300;
      const fs = sm ? 11.5 : 12.5;
      card(R, orange());
      const pad = 16;
      let y = R.y + pad + 8;
      rich(ex.label[ctx.lang], R.x + pad, y, sm ? 14 : 16, orange(), 'left', false, 800);
      y += 22;
      rich(ex.note[ctx.lang], R.x + pad, y, fs, theme.muted, 'left', false, 600);
      y += 26;
      const rows: [string, string][] = [];
      const vTxt = b > 0.01 ? cText(b > 0.99 ? Number(b.toFixed(9)) : b) : ex.v >= 1000 ? `${fmt.num(ex.v / 1000, 2)} km/s` : `${fmt.num(ex.v * 3.6, 0)} km/h`;
      rows.push(['v', ex.v >= 1000 ? `${fmt.num(ex.v / 1000, ex.v >= 1e7 ? 0 : 2)} km/s` : vTxt]);
      rows.push(['v/c', b < 0.01 ? sciText(b, 2) : fmt.fixed(b, b > 0.99 ? 9 : 3)]);
      const gm1 = gammaMinusOne(b);
      rows.push(['γ', gm1 < 1e-3 ? `1 + ${sciText(gm1, 1)}` : gText(gamma(b))]);
      for (const [k, v] of rows) {
        rich(k, R.x + pad, y, fs, theme.muted, 'left', false, 650);
        rich(show() ? v : '?', R.x + R.w - pad, y, fs + 0.5, theme.text, 'right', false, 750);
        y += fs + 11;
      }
      y += 6;
      g.strokeStyle = theme.grid;
      g.beginPath();
      g.moveTo(R.x + pad, y - 8);
      g.lineTo(R.x + R.w - pad, y - 8);
      g.stroke();
      const lag = lagPerDay(ex.v);
      const big = show() ? timeText(lag, 2) : '?';
      if (b < 0.5) {
        rich(ctx.lang === 'de' ? 'Gangunterschied pro Tag' : 'Difference per day', R.x + pad, y + 4, fs, theme.muted, 'left', false, 650);
        rich(big, R.x + pad, y + 32, sm ? 24 : 30, red(), 'left', false, 800);
        y += 58;
      } else {
        rich(ctx.lang === 'de' ? 'Eigenzeit pro Tag' : 'Proper time per day', R.x + pad, y + 4, fs, theme.muted, 'left', false, 650);
        rich(show() ? timeText(DAY / gamma(b), 3) : '?', R.x + pad, y + 32, sm ? 24 : 30, blue(), 'left', false, 800);
        y += 58;
      }
      const note = ex.id === 'gps' ? ctx.t('gpsNote') : b < 0.5 ? tr('perDay', { t: big }) : tr('ownDay', { t: show() ? timeText(DAY / gamma(b), 3) : '?' });
      wrapText(note, R.x + pad, y, R.w - 2 * pad, fs, theme.muted, R.y + R.h - 10);
    }

    function wrapText(str: string, x: number, y: number, w: number, size: number, color: string, maxY: number): void {
      const g = surface.g;
      g.font = `600 ${size}px ${ctx.theme.font}`;
      const words = str.split(' ');
      let line = '';
      let yy = y;
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (g.measureText(test).width > w && line) {
          if (yy > maxY) return;
          rich(line, x, yy, size, color, 'left', false, 600);
          line = word;
          yy += size + 6;
        } else line = test;
      }
      if (line && yy <= maxY) rich(line, x, yy, size, color, 'left', false, 600);
    }

    /* ---------- Diagramm γ(v/c) ---------- */
    function drawGammaChart(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 360;
      const fs = sm ? 11 : 12;
      const ik = introK();
      card(R);
      const padL = sm ? 36 : 42;
      const padR = sm ? 14 : 18;
      const padT = sm ? 34 : 40;
      const padB = sm ? 30 : 32;
      const A: Rect = { x: R.x + padL, y: R.y + padT, w: R.w - padL - padR, h: R.h - padT - padB };
      if (mode() !== 'apps') chartA = A;
      if (A.w < 40 || A.h < 30) return;
      const top = ease2('ytop', gammaAxisTop(gamma(p.v)), 6);
      const X = (b: number) => A.x + b * A.w;
      const Y = (gv: number) => A.y + A.h - ((gv - 1) / (top - 1)) * A.h;
      // Gitter
      const sy = niceStep((top - 1) / (sm ? 3.5 : 5));
      g.lineWidth = 1;
      g.strokeStyle = theme.grid;
      // Teilung: Vielfache von sy (dazu 1 am Boden)
      const first = Math.ceil((1 + 1e-9) / sy) * sy;
      g.beginPath();
      for (let v = first; v <= top + 1e-9; v += sy) {
        const yy = Math.round(Y(v)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      for (let b = 0.2; b <= 1.0001; b += 0.2) {
        const xx = Math.round(X(b)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      g.font = `${fs}px ${theme.font}`;
      g.fillStyle = theme.muted;
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      const decY = Math.max(0, -Math.floor(Math.log10(sy) + 1e-9));
      g.fillText('1', A.x - 6, Y(1));
      for (let v = first; v <= top + 1e-9; v += sy) {
        const yy = Y(v);
        if (yy < A.y + 4 || Y(1) - yy < 14) continue;
        g.fillText(fmt.num(v, decY), A.x - 6, yy);
      }
      g.textAlign = 'center';
      g.textBaseline = 'top';
      for (let b = 0; b <= 1.0001; b += sm ? 0.5 : 0.2) g.fillText(fmt.num(b, 1), X(b), A.y + A.h + 6);
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w + 4, A.y + A.h + 0.5);
      g.stroke();
      rich(ctx.t('axisB'), A.x + A.w, A.y + A.h + 20, fs, theme.muted, 'right', true, 650);
      // Grenze c
      g.strokeStyle = withA(light(), 0.85);
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(X(1), A.y);
      g.lineTo(X(1), A.y + A.h);
      g.stroke();
      g.setLineDash([]);
      rich(ctx.t('cMark'), X(1) - 6, A.y + 8, fs + 1, light(), 'right', true, 750);
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 2, A.w + 2, A.h + 4);
      g.clip();
      // Fläche unter der Kurve bis zum aktuellen Wert
      const bNow = bS;
      const curve = (f: (b: number) => number, until: number) => {
        const pts: [number, number][] = [];
        const n = 160;
        for (let i = 0; i <= n; i++) {
          const u = i / n;
          const b = until * (1 - (1 - u) ** 1.8);
          pts.push([X(b), Y(Math.min(f(b), top + (top - 1)))]);
        }
        return pts;
      };
      const bEnd = Math.min(0.99995, ik * 0.99995);
      const main = curve(gamma, bEnd);
      const fillPts = curve(gamma, Math.min(bNow, bEnd));
      g.fillStyle = withA(blue(), theme.dark ? 0.16 : 0.1);
      g.beginPath();
      g.moveTo(X(0), Y(1));
      fillPts.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(X(Math.min(bNow, bEnd)), Y(1));
      g.closePath();
      g.fill();
      if (mode() === 'energy' && p.cls) {
        const cl = curve((b) => 1 + 0.5 * b * b, bEnd);
        g.strokeStyle = red();
        g.lineWidth = 2;
        g.setLineDash([6, 4]);
        g.beginPath();
        cl.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        g.setLineDash([]);
      }
      g.strokeStyle = blue();
      g.lineWidth = 3;
      g.lineJoin = 'round';
      g.beginPath();
      main.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
      if (mode() === 'energy' && p.cls && ik > 0.9) rich(ctx.t(sm ? 'classicS' : 'classic'), X(0.98), Y(1 + 0.5 * 0.96) - 12, fs, red(), 'right', true, 650);
      // aktueller Punkt mit Hilfslinien
      const gNow = gamma(bNow);
      const hx = X(bNow);
      const hy = clamp(Y(gNow), A.y - 2, A.y + A.h);
      g.strokeStyle = withA(theme.text, 0.4);
      g.lineWidth = 1.2;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(hx, A.y + A.h);
      g.lineTo(hx, hy);
      g.lineTo(A.x, hy);
      g.stroke();
      g.setLineDash([]);
      handleAt = [hx, hy];
      g.save();
      g.globalAlpha = ik;
      const hot = hoverHandle || dragging;
      if (hot) {
        g.fillStyle = withA(blue(), 0.18);
        g.beginPath();
        g.arc(hx, hy, 15, 0, TAU);
        g.fill();
      }
      g.shadowColor = withA(blue(), 0.6);
      g.shadowBlur = 8;
      g.fillStyle = blue();
      g.beginPath();
      g.arc(hx, hy, hot ? 8 : 7, 0, TAU);
      g.fill();
      g.shadowBlur = 0;
      g.strokeStyle = theme.bg;
      g.lineWidth = 2;
      g.stroke();
      g.restore();
      if (show()) {
        const lbl = tr('gammaPill', { g: gText(gNow) });
        const lw = textW(lbl, fs) + 16;
        const right = hx + 14 + lw < A.x + A.w;
        const py = clamp(hy - 30, A.y - 4, A.y + A.h - 26);
        pill(right ? hx + 12 : hx - 12, py, lbl, blue(), right ? 'left' : 'right', fs);
      }
      rich(ctx.t(mode() === 'energy' ? 'chipEnergy' : 'chipGamma'), R.x + 14, R.y + (sm ? 17 : 20), fs + 1, theme.text, 'left', false);
      if (!sm) rich('γ = 1/√(1 − v²/c²)', R.x + R.w - 14, R.y + 20, fs, theme.muted, 'right', false, 600);
    }

    /* ---------- Karte mit Werten ---------- */
    function drawClockDial(cx: number, cy: number, rad: number, ticks: number, col: string, label: string, value: string, fs: number, side = false): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.15)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      const face = g.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, 1, cx, cy, rad);
      face.addColorStop(0, theme.dark ? '#26303d' : '#ffffff');
      face.addColorStop(1, theme.dark ? '#18202b' : '#eef1f5');
      g.fillStyle = face;
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = col;
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(cx, cy, rad - 1, 0, TAU);
      g.stroke();
      g.strokeStyle = withA(theme.text, 0.5);
      g.lineWidth = 1.4;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU - Math.PI / 2;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * rad * 0.78, cy + Math.sin(a) * rad * 0.78);
        g.lineTo(cx + Math.cos(a) * rad * 0.9, cy + Math.sin(a) * rad * 0.9);
        g.stroke();
      }
      // ein Umlauf = 8 Ticks
      const a = (ticks / 8) * TAU - Math.PI / 2;
      g.strokeStyle = col;
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * rad * 0.72, cy + Math.sin(a) * rad * 0.72);
      g.stroke();
      g.fillStyle = col;
      g.beginPath();
      g.arc(cx, cy, 3, 0, TAU);
      g.fill();
      if (side) {
        rich(label, cx + rad + 8, cy - fs * 0.6, fs, col, 'left', false, 750);
        rich(value, cx + rad + 8, cy + fs * 0.7, fs, theme.text, 'left', false, 650);
        return;
      }
      rich(label, cx, cy + rad + 12, fs, col, 'center', false, 750);
      rich(value, cx, cy + rad + 12 + fs + 6, fs, theme.text, 'center', false, 650);
    }

    function drawInfoCard(R: Rect): void {
      const theme = ctx.theme;
      const m = mode();
      const flat = R.w > R.h * 2.2;
      const sm = R.w < 300 || flat;
      const fs = sm ? 11.5 : 12.5;
      const pad = sm ? 12 : 16;
      const b = bS;
      const gm = gS();
      const val = (s: string) => (show() ? s : '?');
      if (m === 'clock') {
        card(R, blue());
        const t0 = p.t0;
        const line = tr('processS', { a: `${fmt.num(t0, 1)} s`, b: val(`${fmt.num(dilatedTime(t0, p.v), 2)} s`) });
        if (flat) {
          rich(line, R.x + R.w - pad, R.y + pad + 6, fs, theme.text, 'right', false, 700);
          const rad = Math.min(22, (R.h - 40) / 2);
          const cy = R.y + R.h - pad - rad;
          drawClockDial(R.x + pad + rad, cy, rad, ck.tau, blue(), ctx.t('dialTrain'), val(nsText(ck.tau * TICK)), fs, true);
          drawClockDial(R.x + R.w * 0.52 + rad, cy, rad, ck.s, red(), ctx.t('dialPlat'), val(nsText(ck.s * TICK)), fs, true);
          return;
        }
        rich(ctx.t('cardClock'), R.x + pad, R.y + pad + 6, fs + 1, theme.text, 'left', false);
        const rad = clamp(Math.min(R.w * 0.16, (R.h - 2 * fs - 80) / 2), 16, 40);
        const cy = R.y + pad + 22 + rad + 6;
        drawClockDial(R.x + R.w * 0.28, cy, rad, ck.tau, blue(), ctx.t('dialTrain'), val(nsText(ck.tau * TICK)), fs);
        drawClockDial(R.x + R.w * 0.72, cy, rad, ck.s, red(), ctx.t('dialPlat'), val(nsText(ck.s * TICK)), fs);
        rich(line, R.x + R.w / 2, R.y + R.h - pad - 2, fs, theme.text, 'center', false, 700);
        return;
      }
      if (m === 'len') {
        card(R, purple());
        rich(ctx.t('cardLen'), R.x + pad, R.y + pad + 6, fs + 1, theme.text, 'left', false);
        const x0 = R.x + pad;
        const x1 = R.x + R.w - pad;
        const rowH = flat ? (R.h - 40) / 2 : Math.min(46, (R.h - 70) / 2);
        const y0 = R.y + pad + (flat ? 22 : 30);
        const bars: [string, number, string][] = [
          [ctx.t('restLen'), 1, ctx.theme.text],
          [ctx.t('movLen'), 1 / gm, purple()],
        ];
        bars.forEach(([label, f, col], i) => {
          const y = y0 + i * rowH;
          rich(label, x0, y + 6, fs, theme.muted, 'left', false, 650);
          const by = y + 16;
          const w = (x1 - x0) * f;
          surface.g.fillStyle = withA(col, i ? 0.85 : 0.5);
          roundRect(surface.g, x0, by, Math.max(2, w), flat ? 9 : 12, 4);
          surface.g.fill();
          const txt = i ? val(lenText(p.L0 / gamma(p.v))) : lenText(p.L0);
          rich(txt, x1, y + 6, fs, col, 'right', false, 750);
        });
        if (!flat && y0 + 2 * rowH + 18 < R.y + R.h) rich(tr('factor', { f: val(fmt.fixed(1 / gamma(p.v), 3)) }), x0, y0 + 2 * rowH + 10, fs, theme.muted, 'left', false, 650);
        return;
      }
      if (m === 'sim') {
        card(R, green());
        rich(ctx.t('cardSim'), R.x + pad, R.y + pad + 6, fs + 1, theme.text, 'left', false);
        const s = simultaneity(p.L0, p.v);
        const rows: [string, string][] = [
          [tr('simTrainRow', { t: val(timeText(s.tTrain)) }), blue()],
          [tr('simRear', { t: val(timeText(s.tBack)) }), red()],
          [tr('simFront', { t: val(timeText(s.tFront)) }), red()],
        ];
        const lh = flat ? (R.h - 34) / 3 : fs + 10;
        let y = R.y + pad + (flat ? 26 : 32);
        for (const [txt, col] of rows) {
          rich(txt, R.x + pad, y, fs, col, 'left', false, 700);
          y += lh;
        }
        const big = p.v === 0 ? ctx.t('simSame') : tr('simDiff', { t: val(timeText(s.dt)) });
        if (flat) rich(big, R.x + R.w - pad, R.y + R.h / 2 + 6, 22, green(), 'right', false, 800);
        else if (y + 20 < R.y + R.h) rich(big, R.x + pad, Math.min(y + 18, R.y + R.h - pad - 8), sm ? 20 : 26, green(), 'left', false, 800);
        return;
      }
      if (m === 'muon') {
        card(R, green());
        rich(ctx.t('cardMuon'), R.x + pad, R.y + pad + 6, fs + 1, theme.text, 'left', false);
        const h = p.h * 1000;
        const rows: [string, number, string][] = [
          [ctx.t('muB'), survival(h, p.v), green()],
          [ctx.t('muA'), survival(h, p.v, MUON_TAU, false), red()],
        ];
        const x0 = R.x + pad;
        const x1 = R.x + R.w - pad;
        const rowH = flat ? (R.h - 40) / 2 : Math.min(46, (R.h - 60) / 2);
        rows.forEach(([label, q, col], i) => {
          const y = R.y + pad + (flat ? 22 : 30) + i * rowH;
          rich(label, x0, y + 6, fs, theme.muted, 'left', false, 650);
          rich(val(`${fmt.num(100 * q, q < 0.001 ? 5 : 1)} %`), x1, y + 6, fs, col, 'right', false, 750);
          surface.g.fillStyle = withA(col, 0.18);
          roundRect(surface.g, x0, y + 16, x1 - x0, flat ? 9 : 12, 4);
          surface.g.fill();
          surface.g.fillStyle = col;
          roundRect(surface.g, x0, y + 16, Math.max(2, (x1 - x0) * ease2(`mbar${i}`, show() ? q : 0)), flat ? 9 : 12, 4);
          surface.g.fill();
        });
        const tail = `γ = ${val(gText(gm))} · h = ${fmt.num(p.h, 1)} km`;
        if (!flat) rich(tail, x0, R.y + R.h - pad - 4, fs, theme.muted, 'left', false, 650);
        return;
      }
      if (m === 'energy') {
        card(R, orange());
        const en = energies(particle().e0, b);
        rich(tr('cardEnergy', { p: pName(), v: cText(show() ? b : p.v) }), R.x + pad, R.y + pad + 6, fs + 1, theme.text, 'left', false);
        const rows: [string, string][] = [
          [`${ctx.t('rest')} = m · c² = ${eText(en.e0)}`, blue()],
          [tr('kinE', { e: val(eText(en.kin)) }), orange()],
          [tr('totalE', { e: val(eText(en.e)) }), theme.text],
          [`m_{rel} = γ · m = ${val(gText(gm))} · m`, theme.muted],
        ];
        const lh = flat ? (R.h - 34) / 2 : fs + 11;
        rows.forEach(([txt, col], i) => {
          const x = flat ? R.x + pad + (i >= 2 ? R.w / 2 : 0) : R.x + pad;
          const y = R.y + pad + (flat ? 26 : 32) + (flat ? (i % 2) * lh : i * lh);
          if (y < R.y + R.h - 6) rich(txt, x, y, fs, col, 'left', false, 700);
        });
        return;
      }
    }

    /* ---------- Ergebnisse ---------- */
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const v = (s: string) => `<var>${s}</var>`;

    function updateReadouts(): void {
      const m = mode();
      const b = p.v;
      const gm = gamma(b);
      const bTxt = fmt.num(b, 3);
      const kms = fmt.num((b * C) / 1000, 0);
      if (m === 'apps') {
        const ex = EXAMPLES.find((e) => e.id === p.ex) ?? EXAMPLES[2]!;
        const be = ex.v / C;
        ctx.readout('speed', { html: `${ex.label[ctx.lang]}: ${v('v')} ${ex.v >= 1e6 ? `= ${fmt.fixed(be, 9)} · ${v('c')}` : `≈ ${fmt.num(ex.v, 0)} m/s = ${sciText(be, 2)} · ${v('c')}`}` });
        const gm1 = gammaMinusOne(be);
        ctx.readout('gamma', { html: gm1 < 1e-3 ? `${v('γ')} − 1 ≈ ½ · (${v('v')}/${v('c')})² = ${sciText(gm1, 2)}` : `${v('γ')} = ${gText(gamma(be))}` });
        const lag = lagPerDay(ex.v);
        ctx.readout('daily', {
          html:
            ctx.lang === 'de'
              ? `In einem Tag (86 400 s) zeigt die bewegte Uhr ${frac('86 400 s', v('γ'))} = ${timeText(DAY / gamma(be), 6)}, sie geht also <strong>${timeText(lag, 3)}</strong> nach.`
              : `In one day (86,400 s) the moving clock shows ${frac('86,400 s', v('γ'))} = ${timeText(DAY / gamma(be), 6)}, so it loses <strong>${timeText(lag, 3)}</strong>.`,
        });
      } else {
        ctx.readout('speed', { html: `${v('v')} = ${bTxt} · ${v('c')} ≈ ${kms} km/s ${ctx.lang === 'de' ? 'mit' : 'with'} ${v('c')} = 299 792 458 m/s` });
        ctx.readout('gamma', {
          html: `${v('γ')} = ${frac('1', `√(1 − ${v('v')}²/${v('c')}²)`)} = ${frac('1', `√(1 − ${bTxt}²)`)} ${fmt.rel(gm, 4)} <strong>${gm < 1000 ? fmt.num(gm, 4) : fmt.num(gm, 0)}</strong>`,
        });
        ctx.readout('daily', null);
      }
      // Lichtuhr
      if (m === 'clock') {
        const t = dilatedTime(p.t0, b);
        ctx.readout('time', { html: `Δ${v('t')} = ${v('γ')} · Δ${v('t')}<sub>0</sub> = ${fmt.num(gm, 4)} · ${fmt.num(p.t0, 1)} s ${fmt.rel(t, 3)} <strong>${fmt.num(t, 3)} s</strong>` });
        const lc = lightClock(MIRROR, b);
        ctx.readout('tick', {
          html:
            ctx.lang === 'de'
              ? `Spiegelabstand ${v('d')} ≈ ${fmt.fixed(MIRROR, 3)} m: im Zug Δ${v('t')}<sub>0</sub> = ${frac(`2${v('d')}`, v('c'))} = 10 ns. Vom Bahnsteig aus läuft das Licht pro Tick ${fmt.num(2 * lc.hyp, 3)} m statt ${fmt.num(2 * MIRROR, 3)} m, also Δ${v('t')} = ${fmt.num(lc.t * 1e9, 3)} ns. Pythagoras: (${v('c')}Δ${v('t')}/2)² = ${v('d')}² + (${v('v')}Δ${v('t')}/2)².`
              : `Mirror distance ${v('d')} ≈ ${fmt.fixed(MIRROR, 3)} m: on the train Δ${v('t')}<sub>0</sub> = ${frac(`2${v('d')}`, v('c'))} = 10 ns. Seen from the platform, the light travels ${fmt.num(2 * lc.hyp, 3)} m per tick instead of ${fmt.num(2 * MIRROR, 3)} m, so Δ${v('t')} = ${fmt.num(lc.t * 1e9, 3)} ns. Pythagoras: (${v('c')}Δ${v('t')}/2)² = ${v('d')}² + (${v('v')}Δ${v('t')}/2)².`,
        });
      } else {
        ctx.readout('time', null);
        ctx.readout('tick', null);
      }
      // Längenkontraktion
      if (m === 'len') {
        const Lm = contractedLength(p.L0, b);
        ctx.readout('length', { html: `${v('L')} = ${frac(`${v('L')}<sub>0</sub>`, v('γ'))} = ${frac(`${fmt.num(p.L0, 0)} m`, fmt.num(gm, 4))} ${fmt.rel(Lm, 2)} <strong>${fmt.num(Lm, 2)} m</strong>` });
        ctx.readout('tunnel', {
          html:
            b === 0
              ? ctx.lang === 'de'
                ? 'Im Stand sind Zug und Tunnel gleich lang.'
                : 'At rest, train and tunnel have the same length.'
              : ctx.lang === 'de'
                ? `Vom Bahnsteig aus: Zug ${fmt.num(Lm, 2)} m, Tunnel ${fmt.num(p.L0, 0)} m – der Zug passt hinein. Vom Zug aus: Zug ${fmt.num(p.L0, 0)} m, Tunnel ${fmt.num(Lm, 2)} m – er ragt heraus. Kein Widerspruch: „Beide Enden zugleich im Tunnel“ ist in jedem Bezugssystem eine andere Aussage (Relativität der Gleichzeitigkeit).`
                : `From the platform: train ${fmt.num(Lm, 2)} m, tunnel ${fmt.num(p.L0, 0)} m – the train fits. From the train: train ${fmt.num(p.L0, 0)} m, tunnel ${fmt.num(Lm, 2)} m – it sticks out. No contradiction: “both ends inside at the same time” means something different in each frame (relativity of simultaneity).`,
        });
      } else {
        ctx.readout('length', null);
        ctx.readout('tunnel', null);
      }
      // Gleichzeitigkeit
      if (m === 'sim') {
        const s = simultaneity(p.L0, b);
        ctx.readout('simul', {
          html:
            (ctx.lang === 'de' ? 'Im Zug: ' : 'On the train: ') +
            `${v('t')}′ = ${frac(`${v('L')}<sub>0</sub>`, `2${v('c')}`)} = ${timeText(s.tTrain, 4)} ${ctx.lang === 'de' ? 'für beide Enden' : 'for both ends'}.<br>` +
            (ctx.lang === 'de' ? 'Vom Bahnsteig: ' : 'From the platform: ') +
            `${v('t')}<sub>${ctx.lang === 'de' ? 'h' : 'r'}</sub> = ${frac(`${v('L')}/2`, `${v('c')} + ${v('v')}`)} = ${timeText(s.tBack, 4)}, ${v('t')}<sub>${ctx.lang === 'de' ? 'v' : 'f'}</sub> = ${frac(`${v('L')}/2`, `${v('c')} − ${v('v')}`)} = ${timeText(s.tFront, 4)}<br>` +
            `Δ${v('t')} = ${frac(`${v('γ')} · ${v('v')} · ${v('L')}<sub>0</sub>`, `${v('c')}²`)} = <strong>${s.dt === 0 ? '0 s' : timeText(s.dt, 4)}</strong>`,
        });
      } else ctx.readout('simul', null);
      // Myonen
      if (m === 'muon') {
        const h = p.h * 1000;
        const pr = survival(h, b);
        const pc = survival(h, b, MUON_TAU, false);
        const pct = (q: number) => `${fmt.num(100 * q, q < 0.001 ? 6 : 1)} %`;
        ctx.readout('muon', {
          html:
            ctx.lang === 'de'
              ? `Weg in einer Lebensdauer: klassisch ${v('v')} · ${v('τ')} = ${lenText(meanFlight(b, MUON_TAU, false), 0)}, mit Zeitdilatation ${v('γ')} · ${v('v')} · ${v('τ')} = ${lenText(meanFlight(b), 0)}.<br>Am Boden (${v('h')} = ${fmt.num(p.h, 1)} km): klassisch ${pct(pc)}, mit Zeitdilatation <strong>${pct(pr)}</strong> (${v('N')}/${v('N')}<sub>0</sub> = e<sup>−${v('t')}/(${v('γ')}${v('τ')})</sup>).<br>Sicht des Myons: Die Atmosphäre ist nur ${v('h')}/${v('γ')} = ${lenText(h / gm, 0)} dick.`
              : `Distance in one lifetime: classical ${v('v')} · ${v('τ')} = ${lenText(meanFlight(b, MUON_TAU, false), 0)}, with time dilation ${v('γ')} · ${v('v')} · ${v('τ')} = ${lenText(meanFlight(b), 0)}.<br>At the ground (${v('h')} = ${fmt.num(p.h, 1)} km): classical ${pct(pc)}, with time dilation <strong>${pct(pr)}</strong> (${v('N')}/${v('N')}<sub>0</sub> = e<sup>−${v('t')}/(${v('γ')}${v('τ')})</sup>).<br>Muon’s view: the atmosphere is only ${v('h')}/${v('γ')} = ${lenText(h / gm, 0)} thick.`,
        });
      } else ctx.readout('muon', null);
      // Energie
      if (m === 'energy') {
        const pt = particle();
        const en = energies(pt.e0, b);
        ctx.readout('energy', {
          html: `${v('E')}<sub>0</sub> = ${v('m')} · ${v('c')}² = ${eText(en.e0)}<br>${v('E')} = ${v('γ')} · ${v('m')} · ${v('c')}² = ${fmt.num(gm, 4)} · ${eText(en.e0)} ≈ <strong>${eText(en.e)}</strong><br>${v('E')}<sub>kin</sub> = (${v('γ')} − 1) · ${v('m')} · ${v('c')}² ≈ ${eText(en.kin)} (${ctx.lang === 'de' ? 'klassisch' : 'classical'} ½ ${v('m')} ${v('v')}² ≈ ${eText(en.kinClassic)})`,
        });
        ctx.readout('momentum', {
          html: `${v('p')} = ${v('γ')} · ${v('m')} · ${v('v')}, ${v('p')} · ${v('c')} = ${v('γ')} · ${v('v')}/${v('c')} · ${v('E')}<sub>0</sub> ≈ ${eText(en.pc)} · ${v('E')}² = (${v('p')}${v('c')})² + ${v('E')}<sub>0</sub>²`,
        });
      } else {
        ctx.readout('energy', null);
        ctx.readout('momentum', null);
      }
    }

    /* ---------- Ziehen im Diagramm, Antippen der Beispiele ---------- */
    const inChart = (px: number, py: number) => px >= chartA.x - 8 && px <= chartA.x + chartA.w + 8 && py >= chartA.y - 10 && py <= chartA.y + chartA.h + 10;
    const nearHandle = (px: number, py: number) => Math.hypot(px - handleAt[0], py - handleAt[1]) < 18;
    const exAt = (px: number, py: number): ExampleId | null => {
      let best: ExampleId | null = null;
      let bd = 16;
      for (const q of exPts) {
        const d = Math.hypot(px - q.x, py - q.y);
        if (d < bd) {
          bd = d;
          best = q.id;
        }
      }
      return best;
    };
    function dragTo(px: number): void {
      const b = clamp((px - chartA.x) / chartA.w, 0, BETA_MAX);
      ctx.set({ v: b });
    }
    surface.addTarget({
      contains: (px, py) => !ctx.locked && (mode() === 'apps' ? exAt(px, py) !== null : inChart(px, py)),
      pointerDown: (q) => {
        if (ctx.locked) return false;
        if (mode() === 'apps') {
          const id = exAt(q.px, q.py);
          if (!id) return false;
          pickExample(id);
          return true;
        }
        if (!inChart(q.px, q.py)) return false;
        dragging = true;
        surface.setCursor('grabbing');
        dragTo(q.px);
        ctx.requestRender();
        return true;
      },
      pointerMove: (q) => {
        if (dragging) dragTo(q.px);
      },
      pointerUp: () => {
        dragging = false;
        surface.setCursor(hoverHandle ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q) => {
        if (mode() === 'apps') {
          const id = q && !ctx.locked ? exAt(q.px, q.py) : null;
          if (id !== hoverEx) {
            hoverEx = id;
            ctx.requestRender();
          }
          surface.setCursor(id ? 'pointer' : '');
          return;
        }
        const h = q ? !ctx.locked && nearHandle(q.px, q.py) : false;
        if (h !== hoverHandle) {
          hoverHandle = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : q && !ctx.locked && inChart(q.px, q.py) ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    /** Startzustand einer Ansicht: ein aussagekräftiges Standbild. */
    function restart(initial: boolean): void {
      const m = mode();
      const gm = gamma(p.v);
      if (m === 'clock') {
        ck.top = initial ? 2.3 : 0;
        ck.s = initial ? 2.3 * gm : 0;
        ck.tau = ck.s / gm;
        ck.x = 0;
      } else if (m === 'len') {
        lenU = initial ? -0.12 : -1;
      } else if (m === 'sim') {
        if (initial) {
          const st = simTimes(p.v);
          const tb = st.s.tBack / st.physPerReal / st.rate;
          simT = p.v > 0.01 ? (tb + st.endBottom) / 2 : SIM_TOP + 0.2;
        } else simT = 0;
        simSaid = 0;
      } else if (m === 'muon') resetMuons();
      else if (m === 'energy') {
        lanes[0] = initial ? 0.62 : 0;
        lanes[1] = initial ? 0.62 * p.v : 0;
        lanes[2] = initial ? Math.min(0.98, 0.62 * Math.sqrt(2 * gammaMinusOne(p.v))) : 0;
      }
    }

    function slowK(): number {
      return p.slow ? 0.3 : 1;
    }

    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (changed.has('mode') && source !== 'init' && lastMode !== p.mode) {
          prevMode = lastMode;
          modeTw.play();
        }
        lastMode = p.mode as Mode;
        if (source === 'init') {
          bS = p.v;
          restart(true);
          intro.play();
        } else if (source === 'replace' || changed.has('mode')) {
          ctx.clock.pause();
          restart(true);
        } else if (changed.has('v') || changed.has('h')) {
          if (mode() === 'muon') resetMuons();
          if (mode() === 'sim' && source === 'input' && !ctx.clock.playing) restart(true);
        } else if (changed.has('L0') && mode() === 'sim' && !ctx.clock.playing) restart(true);
        if (changed.has('mode') || source === 'replace') ctx.setKeyTargets([]);
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          restart(false);
          ctx.clock.play();
          ctx.requestRender();
        }
      },

      tick(dt) {
        const d = dt * slowK();
        const m = mode();
        const gm = gamma(bS);
        if (m === 'clock') {
          const ds = d / P0;
          ck.top += ds;
          ck.s += ds;
          ck.tau += ds / gm;
          ck.x += 2 * bS * ds;
        } else if (m === 'len') {
          if (bS < 0.004) lenU += (0 - lenU) * Math.min(1, d * 3);
          else {
            lenU += d * (0.08 + 0.22 * bS);
            if (lenU > 1) lenU = -1;
          }
        } else if (m === 'sim') {
          simT += d;
          const st = simTimes(bS);
          const end = Math.max(st.endTop, st.endBottom);
          // Ansagen für Bildschirmleser
          const tb = st.s.tBack / st.physPerReal / st.rate;
          if (simSaid === 0 && simT * st.rate * st.physPerReal >= st.s.tBack && bS > 0.01) {
            simSaid = 1;
            ctx.announce(tr('simRear', { t: timeText(st.s.tBack) }));
          }
          if (simSaid <= 1 && simT >= st.endBottom && simT > tb) {
            simSaid = 2;
            ctx.announce(tr('simFront', { t: timeText(st.s.tFront) }));
          }
          if (simT > end + 2.2) {
            simT = 0;
            simSaid = 0;
          }
        } else if (m === 'muon') stepMuons(d);
        else if (m === 'energy') {
          const speeds = [1, bS, Math.sqrt(2 * gammaMinusOne(bS))];
          speeds.forEach((s, i) => (lanes[i] = mod(lanes[i]! + (d * s) / 2.4, 1)));
        }
      },

      resetTime() {
        restart(false);
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = computeLayout();
        bS = ease2('beta', p.v, dragging ? 18 : 7);
        surface.begin();
        const k = modeTw.running ? modeTw.value : 1;
        const drawMode = modeTw.running && k < 0.5 ? prevMode : mode();
        const alpha = modeTw.running ? (k < 0.5 ? 1 - 2 * k : 2 * k - 1) : 1;
        const g = surface.g;
        shownMode = drawMode;
        g.save();
        g.globalAlpha = alpha;
        g.translate(0, (1 - alpha) * 8 + (1 - introK()) * 10);
        const apps = drawMode === 'apps';
        if (apps) {
          drawAppsScene(lay.scene);
          if (lay.wide) drawAppsCard({ x: lay.chart.x, y: 0, w: lay.chart.w, h: surface.height });
          else drawAppsCard({ x: 0, y: lay.card.y, w: surface.width, h: surface.height - lay.card.y });
        } else {
          if (drawMode === 'clock') drawClockScene(lay.scene);
          else if (drawMode === 'len') drawLenScene(lay.scene);
          else if (drawMode === 'sim') drawSimScene(lay.scene);
          else if (drawMode === 'muon') drawMuonScene(lay.scene);
          else drawEnergyScene(lay.scene);
          drawGammaChart(lay.chart);
          drawInfoCard(lay.card);
        }
        g.restore();
        shownMode = null;
        if (p.mode !== 'apps') ctx.setKeyTargets([]);
        if (animating || intro.running || modeTw.running || (dragging && bS !== p.v)) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
