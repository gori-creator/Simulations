import { clamp, defineSimulation, drawCard, ease, measureSubText, mixColor, mod, prefersReducedMotion, roundRect, seededRandom, subText, Surface, text, textOn, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  battery,
  duration,
  energy,
  G,
  HOUSEHOLD_DAY_KWH,
  householdsYear,
  lossRatio,
  MIX,
  niceStep,
  PLANT_IDS,
  PLANTS,
  plantChain,
  pumpStorage,
  PUMP_ETA,
  BATT_ETA,
  R_PER_KM,
  simulateDay,
  stageKind,
  stepAt,
  STEPS_PER_DAY,
  SUN,
  transmit,
  co2Kg,
  type ChainResult,
  type FormKind,
  type MixDay,
  type MixStep,
  type PlantId,
  type Season,
  type Text,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'plant' | 'day' | 'store' | 'grid';
type Pt = [number, number];
/** Farbe mit Deckkraft: `withAlpha` für #rrggbb, sonst über `mixColor` (liefert rgba). */
const withA = (c: string, a: number) => (c.startsWith('#') ? withAlpha(c, a) : mixColor(c, c, 0, a));
const TAU = Math.PI * 2;
/** Spannungsebenen, die das Antippen des Transformators durchläuft (kV). */
const LEVELS = [10, 20, 110, 220, 380];
/** Spannung des Generators im Kraftwerk (kV) – Bezug für das Übersetzungsverhältnis. */
const U_GEN = 20;
/** Echte Sekunden für einen ganzen Lade- bzw. Entladevorgang des Speichers in der Animation. */
const STORE_ANIM = 9;
/** Echte Sekunden pro Stunde des Tagesverlaufs. */
const DAY_SPEED = 1;
/** Felder des Tagesmodells, die beim Umstellen weich überblendet werden. */
const MIX_KEYS = ['load', 'pv', 'wind', 'hydro', 'bio', 'coal', 'discharge', 'gas', 'charge', 'surplus', 'soc'] as const;
type MixKey = (typeof MIX_KEYS)[number];
type MixArrays = Record<MixKey, number[]>;
/** Reihenfolge der Flächen im Tagesdiagramm (von unten nach oben). */
const STACK: { key: MixKey; de: string; en: string }[] = [
  { key: 'hydro', de: 'Wasser', en: 'Hydro' },
  { key: 'bio', de: 'Biomasse', en: 'Biomass' },
  { key: 'coal', de: 'Kohle', en: 'Coal' },
  { key: 'wind', de: 'Wind', en: 'Wind' },
  { key: 'pv', de: 'Sonne', en: 'Solar' },
  { key: 'discharge', de: 'Speicher', en: 'Storage' },
  { key: 'gas', de: 'Gas', en: 'Gas' },
];

/** Hochgestellte Ziffern für Zehnerpotenzen. */
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };

/**
 * Energieversorgung: vier Ansichten. „Kraftwerk“ zeigt die Umwandlungskette
 * eines Kraftwerks als Energieflussdiagramm (Breite ∝ Leistung, Verluste
 * zweigen ab), „Strommix“ einen ganzen Tag mit Last, Sonne, Wind, Speicher und
 * Gaskraftwerken als Ausgleich, „Speicher“ ein Pumpspeicherkraftwerk
 * (E = m · g · h) oder einen Batteriespeicher und „Übertragung“ die
 * Leitungsverluste P_V = I² · R bei verschiedenen Spannungen.
 */
export default defineSimulation({
  id: 'energieversorgung',
  animated: true,
  hint: (v: { readonly mode?: unknown; readonly sto?: unknown }) =>
    v.mode === 'day'
      ? L('Tipp: Zieh im Diagramm, um die Uhrzeit zu wählen, oder spiele den Tag ab.', 'Tip: drag in the chart to choose the time of day, or play the day.')
      : v.mode === 'store'
        ? v.sto === 'batt'
          ? L('Tipp: Lade oder entlade den Speicher mit den Knöpfen und vergleiche die Zeiten im Diagramm.', 'Tip: charge or discharge the storage with the buttons and compare the times in the chart.')
          : L('Tipp: Zieh das obere Becken nach oben oder unten, um die Fallhöhe zu ändern.', 'Tip: drag the upper reservoir up or down to change the head.')
        : v.mode === 'grid'
          ? L('Tipp: Tippe auf den Transformator am Kraftwerk oder zieh im Diagramm, um die Spannung zu ändern.', 'Tip: tap the transformer at the power plant or drag in the chart to change the voltage.')
          : L('Tipp: Tippe auf ein Kraftwerk oder auf eine Stufe im Energieflussdiagramm.', 'Tip: tap a power plant or a stage in the energy flow diagram.'),
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [
    { id: 'mix', label: L('Kraftwerkspark und Speicher', 'Power plants and storage') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'plant', label: L('Kraftwerk und Wirkungsgrad', 'Power plant and efficiency') },
        { value: 'day', label: L('Strommix über den Tag', 'Electricity mix over the day') },
        { value: 'store', label: L('Speicher', 'Storage') },
        { value: 'grid', label: L('Übertragung mit Hochspannung', 'High-voltage transmission') },
      ],
      default: 'plant',
    },
    {
      key: 'src',
      type: 'choice',
      label: L('Kraftwerk', 'Power plant'),
      options: PLANT_IDS.map((id) => ({ value: id, label: PLANTS[id].name })),
      default: 'kohle',
      visibleIf: (v) => v.mode === 'plant',
    },
    {
      key: 'pin',
      type: 'number',
      label: L('Zugeführte Leistung P_zu', 'Input power P_in'),
      help: L('Leistung, die als Brennstoff, Wind, Licht oder Wasser ins Kraftwerk fließt.', 'Power flowing into the plant as fuel, wind, light or water.'),
      min: 10,
      max: 2000,
      step: 10,
      default: 1000,
      unit: 'MW',
      visibleIf: (v) => v.mode === 'plant',
    },
    {
      key: 'chp',
      type: 'boolean',
      label: L('Kraft-Wärme-Kopplung (Abwärme heizt Häuser)', 'Combined heat and power (waste heat warms houses)'),
      default: false,
      visibleIf: (v) => v.mode === 'plant' && (v.src === 'kohle' || v.src === 'gas' || v.src === 'bio'),
    },
    { key: 'dur', type: 'number', label: L('Betriebsdauer t', 'Operating time t'), min: 1, max: 24, step: 1, default: 1, unit: 'h', visibleIf: (v) => v.mode === 'plant' },
    {
      key: 'sea',
      type: 'choice',
      label: L('Jahreszeit', 'Season'),
      options: [
        { value: 'sommer', label: L('Sommer', 'Summer') },
        { value: 'winter', label: L('Winter', 'Winter') },
      ],
      default: 'sommer',
      visibleIf: (v) => v.mode === 'day',
    },
    { key: 'sun', type: 'number', label: L('Sonnenschein', 'Sunshine'), help: L('100 % = wolkenloser Himmel', '100 % = cloudless sky'), min: 0, max: 100, step: 5, default: 90, unit: '%', visibleIf: (v) => v.mode === 'day' },
    { key: 'wind', type: 'number', label: L('Wind', 'Wind'), help: L('0 % = Windstille, 100 % = Sturm', '0 % = calm, 100 % = storm'), min: 0, max: 100, step: 5, default: 30, unit: '%', visibleIf: (v) => v.mode === 'day' },
    { key: 'base', type: 'number', group: 'mix', label: L('Kohlekraftwerke (Grundlast)', 'Coal plants (base load)'), help: L('Laufen den ganzen Tag gleichmäßig durch.', 'Run evenly all day long.'), min: 0, max: 20, step: 1, default: 8, unit: 'GW', visibleIf: (v) => v.mode === 'day' },
    { key: 'cap', type: 'number', group: 'mix', label: L('Speicher: Kapazität', 'Storage: capacity'), min: 0, max: 80, step: 5, default: 40, unit: 'GWh', visibleIf: (v) => v.mode === 'day' },
    { key: 'spw', type: 'number', group: 'mix', label: L('Speicher: Leistung', 'Storage: power'), min: 0, max: 20, step: 1, default: 10, unit: 'GW', visibleIf: (v) => v.mode === 'day' },
    {
      key: 'sto',
      type: 'choice',
      label: L('Speicher', 'Storage'),
      options: [
        { value: 'pump', label: L('Pumpspeicherkraftwerk', 'Pumped-storage plant') },
        { value: 'batt', label: L('Batteriespeicher', 'Battery storage') },
      ],
      default: 'pump',
      visibleIf: (v) => v.mode === 'store',
    },
    { key: 'hp', type: 'number', label: L('Fallhöhe h', 'Head h'), help: L('Oder: das obere Becken im Bild ziehen.', 'Or: drag the upper reservoir in the picture.'), min: 20, max: 800, step: 10, default: 300, unit: 'm', visibleIf: (v) => v.mode === 'store' && v.sto === 'pump' },
    { key: 'vol', type: 'number', label: L('Wasservolumen V', 'Water volume V'), min: 0.1, max: 20, step: 0.1, default: 1, unit: 'Mio. m³', visibleIf: (v) => v.mode === 'store' && v.sto === 'pump' },
    { key: 'bcap', type: 'number', label: L('Kapazität E', 'Capacity E'), min: 10, max: 2000, step: 10, default: 200, unit: 'MWh', visibleIf: (v) => v.mode === 'store' && v.sto === 'batt' },
    { key: 'pp', type: 'number', label: L('Leistung P (Laden und Entladen)', 'Power P (charging and discharging)'), min: 10, max: 2000, step: 10, default: 300, unit: 'MW', visibleIf: (v) => v.mode === 'store' },
    { key: 'pt', type: 'number', label: L('Übertragene Leistung P', 'Transmitted power P'), min: 10, max: 1000, step: 10, default: 100, unit: 'MW', visibleIf: (v) => v.mode === 'grid' },
    {
      key: 'u',
      type: 'number',
      label: L('Spannung U', 'Voltage U'),
      help: L('Übliche Netze: 20 kV (Mittelspannung), 110 kV, 220 kV und 380 kV (Höchstspannung).', 'Typical grids: 20 kV (medium voltage), 110 kV, 220 kV and 380 kV (extra-high voltage).'),
      min: 10,
      max: 400,
      step: 5,
      default: 110,
      unit: 'kV',
      visibleIf: (v) => v.mode === 'grid',
    },
    { key: 'len', type: 'number', label: L('Länge der Leitung', 'Length of the line'), help: L(`Widerstand R = ${'0,1'} Ω pro km (Beispielwert)`, 'Resistance R = 0.1 Ω per km (example value)'), min: 10, max: 500, step: 10, default: 100, unit: 'km', visibleIf: (v) => v.mode === 'grid' },
    { key: 'vals', type: 'boolean', group: 'view', label: L('Zahlenwerte im Bild', 'Values in the picture'), default: true },
    { key: 'flow', type: 'boolean', group: 'view', label: L('Energiefluss als Punkte', 'Energy flow as dots'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'go', label: L('Tag abspielen', 'Play the day'), primary: true, visibleIf: (v) => v.mode === 'day' },
    { id: 'charge', label: L('Hochpumpen (laden)', 'Pump up (charge)'), primary: true, visibleIf: (v) => v.mode === 'store' },
    { id: 'discharge', label: L('Turbinieren (entladen)', 'Generate (discharge)'), visibleIf: (v) => v.mode === 'store' },
  ],
  readouts: [
    { key: 'chain', label: L('Wirkungsgrad', 'Efficiency'), spoiler: true },
    { key: 'pel', label: L('Leistungen', 'Power'), spoiler: true },
    { key: 'energy', label: L('Energie und CO₂', 'Energy and CO₂'), spoiler: true },
    { key: 'kind', label: L('Einordnung', 'Classification') },
    { key: 'now', label: L('Momentan', 'Right now') },
    { key: 'day', label: L('Ganzer Tag', 'Whole day'), spoiler: true },
    { key: 'store', label: L('Gespeicherte Energie', 'Stored energy'), spoiler: true },
    { key: 'time', label: L('Lade- und Entladezeit', 'Charging and discharging time'), spoiler: true },
    { key: 'line', label: L('Leitung', 'Line'), spoiler: true },
    { key: 'cmp', label: L('Vergleich der Spannungen', 'Comparing voltages'), spoiler: true },
  ],
  resultsParam: 'vals',
  presets: [
    { id: 'start', label: L('Kohlekraftwerk', 'Coal power plant'), values: {} },
    { id: 'gud', label: L('Gaskraftwerk mit Kraft-Wärme-Kopplung', 'Gas plant with combined heat and power'), values: { src: 'gas', chp: true } },
    { id: 'summer', label: L('Sonniger Sommertag', 'Sunny summer day'), values: { mode: 'day', sea: 'sommer', sun: 100, wind: 20 } },
    { id: 'calm', label: L('Windstille Winternacht (Dunkelflaute)', 'Calm winter night (dark doldrums)'), values: { mode: 'day', sea: 'winter', sun: 15, wind: 5 } },
    { id: 'storm', label: L('Sturm im Winter', 'Winter storm'), values: { mode: 'day', sea: 'winter', sun: 30, wind: 95 } },
    { id: 'pump', label: L('Pumpspeicherkraftwerk', 'Pumped-storage plant'), values: { mode: 'store' } },
    { id: 'hv', label: L('380 kV statt 110 kV', '380 kV instead of 110 kV'), values: { mode: 'grid', u: 380 } },
  ],
  strings: {
    de: {
      canvas:
        'Energieversorgung: je nach Ansicht ein Kraftwerk mit Energieflussdiagramm und Vergleich der Kraftwerke, eine Landschaft mit Sonne, Windrädern, Speicher und Kraftwerken über einem Tagesdiagramm des Strommixes, ein Pumpspeicherkraftwerk oder Batteriespeicher mit Energie-Zeit-Diagramm oder eine Hochspannungsleitung mit Transformatoren und dem Diagramm der Leitungsverluste',
    },
    en: {
      canvas:
        'Energy supply: depending on the view, a power plant with an energy flow diagram and a comparison of plants, a landscape with sun, wind turbines, storage and power plants above a daily chart of the electricity mix, a pumped-storage plant or battery storage with an energy–time chart, or a high-voltage line with transformers and a chart of the line losses',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const g = surface.g;
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = () => ctx.lang === 'de';
    const tx = (d: string, e: string) => (de() ? d : e);
    const loc = (t: Text) => t[ctx.lang === 'de' ? 'de' : 'en'];
    const th = () => ctx.theme;
    const S = (i: number) => ctx.theme.series[i]!;
    const show = () => !ctx.hidden;
    /** Zahl mit Einheit, dazwischen ein geschütztes Leerzeichen. */
    const un = (v: number, d: number, unit: string) => `${fmt.num(v, d)} ${unit}`;
    const pct = (v: number, d = 1) => `${fmt.num(v * 100, d)} %`;
    /** Wissenschaftliche Schreibweise „2,94 · 10¹²“. */
    function sci(v: number, d = 2): string {
      if (v === 0) return '0';
      const e = Math.floor(Math.log10(Math.abs(v)));
      if (e >= -2 && e <= 4) return fmt.num(v, d);
      const m = v / 10 ** e;
      return `${fmt.num(m, d)} · 10${String(e)
        .split('')
        .map((c) => SUP[c] ?? c)
        .join('')}`;
    }
    /** Große Zahlen mit Tausendertrennung (schmales Leerzeichen). */
    const big = (v: number) => {
      const r = Math.round(v);
      const s = String(Math.abs(r)).replace(/\B(?=(\d{3})+$)/g, ' ');
      return (r < 0 ? '−' : '') + s;
    };
    const mode = () => (shownMode ?? p.mode) as Mode;
    const src = () => p.src as PlantId;

    /* ---------- Farben ---------- */
    const COL = {
      elec: () => S(0),
      loss: () => S(1),
      heatUse: () => S(3),
    };
    function kindColor(k: FormKind): string {
      switch (k) {
        case 'chem':
          return S(2);
        case 'nuc':
          return S(4);
        case 'wind':
          return S(5);
        case 'rad':
          return S(3);
        case 'pot':
          return mixColor(S(0), S(5), 0.55);
        case 'heat':
          return mixColor(S(3), S(1), 0.5);
        case 'mech':
          return mixColor(S(0), S(4), 0.55);
        default:
          return S(0);
      }
    }
    const coalGrey = () => mixColor(th().text, th().bg, 0.5);
    function mixColorOf(key: MixKey): string {
      switch (key) {
        case 'pv':
          return S(3);
        case 'wind':
          return S(5);
        case 'hydro':
          return S(0);
        case 'bio':
          return S(2);
        case 'coal':
          return coalGrey();
        case 'discharge':
        case 'charge':
          return S(4);
        case 'gas':
          return S(1);
        default:
          return th().text;
      }
    }

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

    /* ---------- Übergänge ---------- */
    const intro = new Tween(1400, ease.outCubic);
    const modeTw = new Tween(560, ease.inOutCubic);
    const srcTw = new Tween(620, ease.inOutCubic);
    const dayTw = new Tween(650, ease.inOutCubic);
    const pop = new Tween(520, ease.outBack);
    let prevMode: Mode = p.mode as Mode;
    let lastMode: Mode = p.mode as Mode;
    let shownMode: Mode | null = null;
    let prevSrc: PlantId = src();
    const introK = () => (intro.running ? intro.value : 1);

    /* ---------- Zustand ---------- */
    /** Laufende Zeit für Energiefluss-Punkte, Rotoren und Dampf (s). */
    let flowT = 0;
    /** Ausgewählte Stufe der Umwandlungskette (−1: keine). */
    let sel = -1;
    /** Uhrzeit im Tagesverlauf (h). */
    let hour = 13;
    /** Drehwinkel der Windräder im Tagesbild. */
    let rotor = 0;
    /** Speicher: Füllstand 0 … 1 und Richtung (+1 laden, −1 entladen, 0 Ruhe). */
    let soc = 0.62;
    let dir = 0;
    let lastDir = 1;
    let saidFull = false;
    /** Gerade gezogenes Objekt. */
    let dragging: 'basin' | 'time' | 'volt' | null = null;
    let hoverId: string | null = null;
    /** Antippbare Bereiche (werden beim Zeichnen gesetzt). */
    let hits: { id: string; r: Rect; cursor: string }[] = [];

    let day: MixDay = simulateDay(mixParams());
    let dayFrom: MixArrays | null = null;
    let dayTo: MixArrays = arraysOf(day);

    function mixParams() {
      return { season: p.sea as Season, sun: p.sun / 100, wind: p.wind / 100, base: p.base, cap: p.cap, power: p.spw, soc0: 0.5 };
    }
    function arraysOf(d: MixDay): MixArrays {
      const out = {} as MixArrays;
      for (const k of MIX_KEYS) out[k] = d.steps.map((s) => s[k]);
      return out;
    }
    function shownArrays(): MixArrays {
      if (!dayTw.running || !dayFrom) return dayTo;
      const u = dayTw.value;
      const out = {} as MixArrays;
      for (const k of MIX_KEYS) out[k] = dayTo[k].map((v, i) => dayFrom![k][i]! + (v - dayFrom![k][i]!) * u);
      return out;
    }
    function shownStep(arr: MixArrays, h: number): MixStep {
      const i = clamp(Math.floor((h / 24) * STEPS_PER_DAY), 0, STEPS_PER_DAY - 1);
      const st = { h } as MixStep;
      for (const k of MIX_KEYS) st[k] = arr[k][i]!;
      return st;
    }

    /* ---------- Aufteilung der Bühne ---------- */
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    interface Layout {
      scene: Rect;
      side: Rect;
      chart: Rect;
      card: Rect;
      wide: boolean;
    }
    const NONE: Rect = { x: -50, y: -50, w: 1, h: 1 };
    function computeLayout(m: Mode): Layout {
      const w = surface.width;
      const h = surface.height;
      const wd = wide();
      const gap = 10;
      if (m === 'plant') {
        if (wd) {
          const sw = Math.round(w * (w < 760 ? 0.6 : 0.63));
          return { scene: { x: 0, y: 0, w: sw, h }, side: { x: sw + gap, y: 0, w: w - sw - gap, h }, chart: NONE, card: NONE, wide: true };
        }
        const sh = Math.round(h * 0.6);
        return { scene: { x: 0, y: 0, w, h: sh }, side: { x: 0, y: sh + gap, w, h: h - sh - gap }, chart: NONE, card: NONE, wide: false };
      }
      if (m === 'day') {
        const sh = Math.round(h * (wd ? 0.43 : 0.34));
        const rest = { x: 0, y: sh + gap, w, h: h - sh - gap };
        if (wd) {
          const cw = Math.round(w * 0.64);
          return { scene: { x: 0, y: 0, w, h: sh }, side: NONE, chart: { x: 0, y: rest.y, w: cw, h: rest.h }, card: { x: cw + gap, y: rest.y, w: w - cw - gap, h: rest.h }, wide: true };
        }
        const ch = Math.round(rest.h * 0.52);
        return { scene: { x: 0, y: 0, w, h: sh }, side: NONE, chart: { x: 0, y: rest.y, w, h: ch }, card: { x: 0, y: rest.y + ch + gap, w, h: rest.h - ch - gap }, wide: false };
      }
      if (m === 'store') {
        if (wd) {
          const sw = Math.round(w * 0.58);
          const ch = Math.round(h * 0.47);
          return { scene: { x: 0, y: 0, w: sw, h }, side: NONE, card: { x: sw + gap, y: 0, w: w - sw - gap, h: h - ch - gap }, chart: { x: sw + gap, y: h - ch, w: w - sw - gap, h: ch }, wide: true };
        }
        const sh = Math.round(h * 0.46);
        const ch = Math.round(h * 0.22);
        return { scene: { x: 0, y: 0, w, h: sh }, side: NONE, chart: { x: 0, y: sh + gap, w, h: ch }, card: { x: 0, y: sh + ch + 2 * gap, w, h: h - sh - ch - 2 * gap }, wide: false };
      }
      // Übertragung
      const sh = Math.round(h * (wd ? 0.5 : 0.4));
      const rest = { x: 0, y: sh + gap, w, h: h - sh - gap };
      if (wd) {
        const cw = Math.round(w * 0.58);
        return { scene: { x: 0, y: 0, w, h: sh }, side: NONE, chart: { x: 0, y: rest.y, w: cw, h: rest.h }, card: { x: cw + gap, y: rest.y, w: w - cw - gap, h: rest.h }, wide: true };
      }
      const ch = Math.round(rest.h * 0.47);
      return { scene: { x: 0, y: 0, w, h: sh }, side: NONE, chart: { x: 0, y: rest.y, w, h: ch }, card: { x: 0, y: rest.y + ch + gap, w, h: rest.h - ch - gap }, wide: false };
    }
    let lay: Layout = computeLayout(mode());

    /* ---------- Zeichenhilfen ---------- */
    const font = (size: number, weight = 600) => `${weight} ${size}px ${th().font}`;
    const small = () => surface.width < 520;
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, bounds?: Rect): Rect {
      const theme = th();
      const w = measureSubText(g, label, { size, family: theme.font, weight: 700, color }) + 16;
      const h = size + 10;
      let x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      if (bounds) x0 = clamp(x0, bounds.x + 4, bounds.x + bounds.w - w - 4);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withA(color, 0.5);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      subText(g, label, x0 + w / 2, y + h / 2 + 0.5, { size, family: theme.font, weight: 700, color });
      return { x: x0, y, w, h };
    }
    /** Text in Zeilen umbrechen (höchstens maxLines, notfalls mit „…“). */
    function wrap(s: string, maxW: number, f: string, maxLines = 3): string[] {
      g.font = f;
      // Zu lange Wörter an Bindestrichen bzw. vor „energie“ trennen (ohne Leerzeichen anfügen)
      const tokens: { t: string; space: boolean }[] = [];
      for (const w of s.split(' ')) {
        if (g.measureText(w).width <= maxW) {
          tokens.push({ t: w, space: true });
          continue;
        }
        const parts = w.includes('-') ? w.split(/(?<=-)/) : /^(.{3,})(energie|energy)$/i.test(w) ? [w.replace(/(energie|energy)$/i, '-'), w.match(/(energie|energy)$/i)![0]] : [w];
        parts.forEach((q, j) => tokens.push({ t: q, space: j === 0 }));
      }
      const lines: string[] = [];
      let cur = '';
      for (const tk of tokens) {
        const t = cur ? `${cur}${tk.space ? ' ' : ''}${tk.t}` : tk.t;
        if (g.measureText(t).width <= maxW || !cur) cur = t;
        else {
          lines.push(cur);
          cur = tk.t;
        }
      }
      if (cur) lines.push(cur);
      if (lines.length > maxLines) {
        const keep = lines.slice(0, maxLines);
        keep[maxLines - 1] = `${keep[maxLines - 1]}…`;
        return keep;
      }
      return lines;
    }
    function textW(s: string, f: string): number {
      g.font = f;
      return g.measureText(s).width;
    }
    /** Text mit Halo (lesbar auf Linien und Flächen). */
    function haloText(s: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', baseline: CanvasTextBaseline = 'middle'): void {
      g.save();
      g.font = f;
      g.textAlign = align;
      g.textBaseline = baseline;
      g.lineJoin = 'round';
      g.lineWidth = 3.5;
      g.strokeStyle = th().dark ? 'rgba(14,20,30,0.85)' : 'rgba(255,255,255,0.9)';
      g.strokeText(s, x, y);
      g.fillStyle = color;
      g.fillText(s, x, y);
      g.restore();
    }
    /** Überschrift einer Karte bzw. eines Diagramms. */
    function chip(x: number, y: number, label: string, color: string, size = 12): Rect {
      return pill(x, y, label, color, 'left', size);
    }
    function panel(r: Rect, accent?: string): void {
      drawCard(g, r, th(), accent);
    }
    function addHit(id: string, r: Rect, cursor = 'pointer'): void {
      hits.push({ id, r, cursor });
    }
    const inRect = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
    /** Kleiner Farbpunkt vor einer Zeile. */
    function dot(x: number, y: number, color: string, r = 4.5): void {
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
    /** Zeile „Name ……… Wert“ in einer Karte. */
    function row(x: number, y: number, w: number, label: string, value: string, color: string, size = 12, strong = false): void {
      const fits = (sz: number) => measureSubText(g, label, { size: sz, family: th().font, weight: strong ? 700 : 500, color }) + textW(value, font(sz, 700)) + 24 <= w;
      while (size > 9.5 && !fits(size)) size -= 0.5;
      // Passt es immer noch nicht, wird die Beschriftung gekürzt
      while (label.length > 4 && !fits(size)) label = `${label.replace(/…$/, '').slice(0, -2).trimEnd()}…`;
      dot(x + 5, y, color, 4);
      subText(g, label, x + 15, y, { size, family: th().font, weight: strong ? 700 : 500, color: th().text, align: 'left' });
      text(g, value, x + w, y, { font: font(size, 700), color: strong ? color : th().text, align: 'right' });
    }

    /* ---------- Diagramm-Achsen (eigene, schlanke Version) ---------- */
    interface Axes {
      r: Rect;
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      px(x: number): number;
      py(y: number): number;
      wx(px: number): number;
    }
    function axes(r: Rect, x: [number, number], y: [number, number]): Axes {
      return {
        r,
        x0: x[0],
        x1: x[1],
        y0: y[0],
        y1: y[1],
        px: (v) => r.x + ((v - x[0]) / (x[1] - x[0])) * r.w,
        py: (v) => r.y + r.h - ((v - y[0]) / (y[1] - y[0])) * r.h,
        wx: (q) => x[0] + ((q - r.x) / r.w) * (x[1] - x[0]),
      };
    }
    function drawAxes(ax: Axes, o: { xStep: number; yStep: number; xFmt: (v: number) => string; yFmt: (v: number) => string; xLabel: string; yLabel: string; xMarks?: number[] }): void {
      const theme = th();
      const { r } = ax;
      g.save();
      g.lineWidth = 1;
      g.strokeStyle = theme.grid;
      g.beginPath();
      for (let v = Math.ceil(ax.y0 / o.yStep) * o.yStep; v <= ax.y1 + 1e-9; v += o.yStep) {
        const y = Math.round(ax.py(v)) + 0.5;
        g.moveTo(r.x, y);
        g.lineTo(r.x + r.w, y);
      }
      const xs = o.xMarks ?? [];
      if (!o.xMarks) for (let v = Math.ceil(ax.x0 / o.xStep) * o.xStep; v <= ax.x1 + 1e-9; v += o.xStep) xs.push(v);
      for (const v of xs) {
        const x = Math.round(ax.px(v)) + 0.5;
        g.moveTo(x, r.y);
        g.lineTo(x, r.y + r.h);
      }
      g.stroke();
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(r.x, r.y);
      g.lineTo(r.x, r.y + r.h);
      g.lineTo(r.x + r.w, r.y + r.h);
      g.stroke();
      const f = font(11, 500);
      for (let v = Math.ceil(ax.y0 / o.yStep) * o.yStep; v <= ax.y1 + 1e-9; v += o.yStep) text(g, o.yFmt(v), r.x - 6, ax.py(v), { font: f, color: theme.muted, align: 'right' });
      let lastX = -Infinity;
      for (const v of xs) {
        const x = ax.px(v);
        if (x - lastX < 26) continue;
        lastX = x;
        text(g, o.xFmt(v), x, r.y + r.h + 11, { font: f, color: theme.muted });
      }
      text(g, o.xLabel, r.x + r.w, r.y + r.h + 25, { font: font(11, 600), color: theme.muted, align: 'right' });
      if (o.yLabel) text(g, o.yLabel, r.x + 6, r.y - 9, { font: font(11, 700), color: theme.muted, align: 'left' });
      g.restore();
    }
    /** Obere Grenze eines Diagramms: etwas Luft über x, auf runde Werte. */
    function niceTop(x: number): number {
      if (!(x > 0)) return 1;
      const step = niceStep(x / 4);
      return Math.ceil((x * 1.06) / step - 1e-9) * step;
    }

    /* ================================================================== */
    /* Piktogramme der Kraftwerke                                          */
    /* ================================================================== */
    function icon(id: PlantId, cx: number, cy: number, s: number, color: string): void {
      g.save();
      g.translate(cx, cy);
      g.scale(s / 24, s / 24);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      if (id === 'kohle') {
        g.moveTo(-10, 9);
        g.lineTo(-10, -1);
        g.lineTo(-4, 3);
        g.lineTo(-4, -1);
        g.lineTo(2, 3);
        g.lineTo(2, -8);
        g.lineTo(6, -8);
        g.lineTo(6, 9);
        g.closePath();
        g.stroke();
        g.beginPath();
        g.arc(7, -11, 2.4, 0, TAU);
        g.arc(10.5, -13, 1.8, 0, TAU);
        g.fill();
        g.beginPath();
        g.moveTo(-12, 9);
        g.lineTo(11, 9);
        g.stroke();
      } else if (id === 'gas') {
        g.moveTo(0, -11);
        g.bezierCurveTo(7, -3, 9, 2, 7, 6);
        g.bezierCurveTo(5, 11, -5, 11, -7, 6);
        g.bezierCurveTo(-9, 1, -5, -2, -3, -6);
        g.bezierCurveTo(-2, -2, 0, -1, 1, -3);
        g.closePath();
        g.stroke();
        g.beginPath();
        g.moveTo(0, 9);
        g.bezierCurveTo(3, 7, 3, 3, 0, 0);
        g.bezierCurveTo(-3, 4, -3, 7, 0, 9);
        g.fill();
      } else if (id === 'kern') {
        for (const a of [0, Math.PI / 3, -Math.PI / 3]) {
          g.save();
          g.rotate(a);
          g.beginPath();
          g.ellipse(0, 0, 11, 4.2, 0, 0, TAU);
          g.stroke();
          g.restore();
        }
        g.beginPath();
        g.arc(0, 0, 2.6, 0, TAU);
        g.fill();
      } else if (id === 'wind') {
        g.moveTo(0, -3);
        g.lineTo(0, 11);
        g.moveTo(-5, 11);
        g.lineTo(5, 11);
        g.stroke();
        for (let k = 0; k < 3; k++) {
          const a = -Math.PI / 2 + (k * TAU) / 3 + 0.3;
          g.beginPath();
          g.moveTo(0, -3);
          g.lineTo(Math.cos(a) * 11, -3 + Math.sin(a) * 11);
          g.stroke();
        }
        g.beginPath();
        g.arc(0, -3, 2, 0, TAU);
        g.fill();
      } else if (id === 'pv') {
        g.moveTo(-11, 9);
        g.lineTo(-6, -1);
        g.lineTo(11, -1);
        g.lineTo(6, 9);
        g.closePath();
        g.moveTo(-8.5, 4);
        g.lineTo(8.5, 4);
        g.moveTo(0, -1);
        g.lineTo(-2.5, 9);
        g.stroke();
        g.beginPath();
        g.arc(-6, -8, 3, 0, TAU);
        g.fill();
      } else if (id === 'wasser') {
        g.moveTo(0, -11);
        g.bezierCurveTo(6, -3, 8, 1, 8, 4);
        g.arc(0, 4, 8, 0, Math.PI);
        g.bezierCurveTo(-8, 1, -6, -3, 0, -11);
        g.stroke();
        g.beginPath();
        g.moveTo(-4, 4);
        g.quadraticCurveTo(-4, 8, 0, 8);
        g.stroke();
      } else {
        // Blatt
        g.moveTo(-9, 10);
        g.bezierCurveTo(-11, -4, 0, -11, 11, -11);
        g.bezierCurveTo(11, 2, 3, 10, -9, 10);
        g.closePath();
        g.stroke();
        g.beginPath();
        g.moveTo(-9, 10);
        g.quadraticCurveTo(0, 1, 6, -5);
        g.stroke();
      }
      g.restore();
    }

    /* ---------- Rauch und Dampf ---------- */
    function steam(x: number, y: number, size: number, amount: number, color: string, seed: number): void {
      if (amount <= 0.01) return;
      const n = 6;
      for (let i = 0; i < n; i++) {
        const u = mod(flowT * 0.22 + i / n + seed * 0.37, 1);
        const r = size * (0.35 + u * 0.9) * (0.5 + 0.5 * amount);
        const yy = y - u * size * 2.6;
        const xx = x + Math.sin(u * 5 + seed + i) * size * 0.25 + u * size * 0.7;
        g.fillStyle = withA(color, (1 - u) * 0.55 * Math.min(1, amount * 1.4));
        g.beginPath();
        g.arc(xx, yy, r, 0, TAU);
        g.fill();
      }
    }
    const steamColor = () => (th().dark ? '#c9d3e0' : '#ffffff');

    /** Kühlturm (Hyperboloid) mit Fuß bei (cx, base). */
    function coolingTower(cx: number, base: number, w: number, h: number): void {
      const dark = th().dark;
      const grad = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      grad.addColorStop(0, dark ? '#5d6878' : '#c9cfd8');
      grad.addColorStop(0.45, dark ? '#8a95a6' : '#eef1f5');
      grad.addColorStop(1, dark ? '#4a5463' : '#aab2bf');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(cx - w / 2, base);
      g.quadraticCurveTo(cx - w * 0.26, base - h * 0.55, cx - w * 0.33, base - h);
      g.lineTo(cx + w * 0.33, base - h);
      g.quadraticCurveTo(cx + w * 0.26, base - h * 0.55, cx + w / 2, base);
      g.closePath();
      g.fill();
      g.strokeStyle = dark ? 'rgba(0,0,0,0.35)' : 'rgba(60,70,90,0.25)';
      g.lineWidth = 1;
      g.stroke();
    }
    function building(x: number, y: number, w: number, h: number, roof?: string): void {
      const dark = th().dark;
      const grad = g.createLinearGradient(0, y, 0, y + h);
      grad.addColorStop(0, dark ? '#7b8697' : '#dfe4ea');
      grad.addColorStop(1, dark ? '#566070' : '#b8c0cb');
      g.fillStyle = grad;
      g.fillRect(x, y, w, h);
      if (roof) {
        g.fillStyle = roof;
        g.fillRect(x - 1, y - 3, w + 2, 4);
      }
      // Fensterband
      g.fillStyle = dark ? 'rgba(255,214,120,0.55)' : 'rgba(70,100,140,0.45)';
      const n = Math.max(2, Math.floor(w / 9));
      for (let i = 0; i < n; i++) g.fillRect(x + 4 + (i * (w - 8)) / n, y + h * 0.3, Math.max(2, (w - 8) / n - 3), Math.max(2, h * 0.16));
    }

    /* ================================================================== */
    /* Ansicht 1: Kraftwerk und Wirkungsgrad                               */
    /* ================================================================== */

    /** Bildliche Darstellung eines Kraftwerks in r (Boden unten). */
    function drawPlantArt(id: PlantId, r: Rect): void {
      const dark = th().dark;
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const sky = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      sky.addColorStop(0, dark ? '#13223a' : '#bfe2fb');
      sky.addColorStop(1, dark ? '#24364f' : '#f2f9ff');
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, r.h);
      const ground = r.y + r.h * 0.82;
      g.fillStyle = dark ? '#21402c' : '#a9d39a';
      g.beginPath();
      g.moveTo(r.x, ground);
      g.quadraticCurveTo(r.x + r.w * 0.5, ground - r.h * 0.05, r.x + r.w, ground);
      g.lineTo(r.x + r.w, r.y + r.h);
      g.lineTo(r.x, r.y + r.h);
      g.closePath();
      g.fill();
      const W = r.w;
      const H = r.h;
      const X = (f: number) => r.x + f * W;
      const Y = (f: number) => r.y + f * H;
      if (id === 'kohle' || id === 'kern') {
        const nuke = id === 'kern';
        coolingTower(X(0.72), ground, W * 0.36, H * 0.52);
        steam(X(0.72), Y(0.82) - H * 0.52, W * 0.09, 1, steamColor(), 1);
        if (nuke) {
          // Reaktorgebäude mit Kuppel
          const cx = X(0.3);
          const rw = W * 0.2;
          g.fillStyle = dark ? '#8d98a8' : '#e3e7ed';
          g.fillRect(cx - rw, ground - H * 0.24, rw * 2, H * 0.24);
          g.beginPath();
          g.arc(cx, ground - H * 0.24, rw, Math.PI, 0);
          g.fill();
          g.strokeStyle = dark ? 'rgba(0,0,0,0.3)' : 'rgba(60,70,90,0.25)';
          g.stroke();
          building(X(0.05), ground - H * 0.14, W * 0.08, H * 0.14);
        } else {
          building(X(0.16), ground - H * 0.26, W * 0.34, H * 0.26, dark ? '#3c4552' : '#8f99a6');
          // Schornstein
          g.fillStyle = dark ? '#9aa3b0' : '#cfd5dd';
          g.fillRect(X(0.43), Y(0.18), W * 0.035, ground - Y(0.18));
          g.fillStyle = S(1);
          g.fillRect(X(0.43), Y(0.18), W * 0.035, H * 0.03);
          steam(X(0.45), Y(0.17), W * 0.04, 0.6, dark ? '#7d8796' : '#c4cad3', 3);
          // Kohlehalde
          g.fillStyle = dark ? '#0d0f12' : '#2b2e33';
          g.beginPath();
          g.moveTo(X(0.0), ground + 2);
          g.quadraticCurveTo(X(0.08), ground - H * 0.14, X(0.17), ground + 2);
          g.fill();
        }
      } else if (id === 'gas') {
        building(X(0.1), ground - H * 0.24, W * 0.52, H * 0.24, dark ? '#3c4552' : '#8f99a6');
        g.fillStyle = dark ? '#7b8697' : '#cdd3db';
        g.beginPath();
        roundRect(g, X(0.14), ground - H * 0.36, W * 0.3, H * 0.13, H * 0.06);
        g.fill();
        for (const fx of [0.68, 0.78]) {
          g.fillStyle = dark ? '#a1aab6' : '#d9dee5';
          g.fillRect(X(fx), Y(0.26), W * 0.04, ground - Y(0.26));
          steam(X(fx + 0.02), Y(0.25), W * 0.035, 0.45, dark ? '#8a94a3' : '#e6eaef', fx * 9);
        }
        // Gasleitung
        g.strokeStyle = S(2);
        g.lineWidth = Math.max(3, H * 0.025);
        g.beginPath();
        g.moveTo(r.x, ground - H * 0.05);
        g.lineTo(X(0.1), ground - H * 0.05);
        g.stroke();
      } else if (id === 'wind') {
        for (const [fx, k, ph] of [
          [0.3, 0.6, 1.2],
          [0.66, 1, 0],
        ] as const) {
          const hx = X(fx);
          const hy = ground - H * 0.62 * k;
          g.strokeStyle = dark ? '#c7cfdb' : '#f4f6f9';
          g.lineWidth = Math.max(2, W * 0.018 * k);
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(hx, ground);
          g.lineTo(hx, hy);
          g.stroke();
          g.strokeStyle = dark ? 'rgba(0,0,0,0.25)' : 'rgba(80,90,110,0.25)';
          g.lineWidth = 1;
          g.stroke();
          const a0 = flowT * 2.2 + ph;
          for (let i = 0; i < 3; i++) {
            const a = a0 + (i * TAU) / 3;
            const len = H * 0.32 * k;
            g.fillStyle = dark ? '#dde3ec' : '#ffffff';
            g.strokeStyle = dark ? 'rgba(0,0,0,0.3)' : 'rgba(80,90,110,0.35)';
            g.beginPath();
            g.moveTo(hx, hy);
            g.lineTo(hx + Math.cos(a - 0.08) * len * 0.3, hy + Math.sin(a - 0.08) * len * 0.3);
            g.lineTo(hx + Math.cos(a) * len, hy + Math.sin(a) * len);
            g.lineTo(hx + Math.cos(a + 0.05) * len * 0.3, hy + Math.sin(a + 0.05) * len * 0.3);
            g.closePath();
            g.fill();
            g.stroke();
          }
          g.fillStyle = dark ? '#aab3c0' : '#e1e5eb';
          g.beginPath();
          g.arc(hx, hy, Math.max(2, W * 0.016 * k), 0, TAU);
          g.fill();
        }
      } else if (id === 'pv') {
        g.fillStyle = dark ? '#ffd66b' : '#ffcf3d';
        g.beginPath();
        g.arc(X(0.2), Y(0.22), W * 0.07, 0, TAU);
        g.fill();
        g.strokeStyle = withA(dark ? '#ffd66b' : '#f5b400', 0.7);
        g.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
          const a = (i * TAU) / 8 + flowT * 0.2;
          g.beginPath();
          g.moveTo(X(0.2) + Math.cos(a) * W * 0.095, Y(0.22) + Math.sin(a) * W * 0.095);
          g.lineTo(X(0.2) + Math.cos(a) * W * 0.125, Y(0.22) + Math.sin(a) * W * 0.125);
          g.stroke();
        }
        for (let rI = 0; rI < 3; rI++) {
          const by = ground - H * 0.04 + rI * H * 0.06;
          for (let c = 0; c < 3; c++) {
            const bx = X(0.12 + c * 0.28 + rI * 0.03);
            const pw = W * 0.22;
            const ph = H * 0.12;
            const grad = g.createLinearGradient(bx, by - ph, bx + pw, by);
            grad.addColorStop(0, dark ? '#2a4b86' : '#2f5fae');
            grad.addColorStop(0.5, dark ? '#4772b8' : '#5b8be0');
            grad.addColorStop(1, dark ? '#203a68' : '#244b8e');
            g.fillStyle = grad;
            g.beginPath();
            g.moveTo(bx, by);
            g.lineTo(bx + pw * 0.2, by - ph);
            g.lineTo(bx + pw, by - ph);
            g.lineTo(bx + pw * 0.8, by);
            g.closePath();
            g.fill();
            g.strokeStyle = 'rgba(255,255,255,0.35)';
            g.lineWidth = 1;
            g.stroke();
          }
        }
      } else if (id === 'wasser') {
        // Stausee links, Staumauer, Unterwasser rechts
        const damX = X(0.46);
        g.fillStyle = dark ? '#2b5b8f' : '#5ea7e6';
        g.fillRect(r.x, Y(0.36), damX - r.x, ground - Y(0.36) + 4);
        g.fillStyle = dark ? '#356da8' : '#79b9ef';
        g.fillRect(damX, Y(0.72), r.x + r.w - damX, ground - Y(0.72) + 4);
        g.fillStyle = dark ? '#8e98a6' : '#d4d9e0';
        g.beginPath();
        g.moveTo(damX - W * 0.05, Y(0.3));
        g.lineTo(damX + W * 0.02, Y(0.3));
        g.lineTo(damX + W * 0.1, ground + 4);
        g.lineTo(damX - W * 0.05, ground + 4);
        g.closePath();
        g.fill();
        building(damX + W * 0.1, ground - H * 0.16, W * 0.2, H * 0.16);
        // Wellen
        g.strokeStyle = 'rgba(255,255,255,0.5)';
        g.lineWidth = 1.5;
        for (let i = 0; i < 4; i++) {
          const x0 = r.x + ((flowT * 14 + i * W * 0.12) % (damX - r.x - 10));
          g.beginPath();
          g.moveTo(x0, Y(0.42) + i * 6);
          g.quadraticCurveTo(x0 + 6, Y(0.42) + i * 6 - 3, x0 + 12, Y(0.42) + i * 6);
          g.stroke();
        }
      } else {
        // Biogas: zwei Gärbehälter mit grüner Kuppel, Motorhaus, Feld
        g.fillStyle = dark ? '#3e5a2b' : '#c8dc8e';
        for (let i = 0; i < 6; i++) g.fillRect(r.x, ground + 4 + i * 5, r.w, 2);
        for (const fx of [0.18, 0.46]) {
          const cx = X(fx);
          const rw = W * 0.12;
          g.fillStyle = dark ? '#7f8a99' : '#d6dbe2';
          g.fillRect(cx - rw, ground - H * 0.16, rw * 2, H * 0.16);
          g.fillStyle = S(2);
          g.beginPath();
          g.ellipse(cx, ground - H * 0.16, rw, H * 0.1, 0, Math.PI, 0);
          g.fill();
        }
        building(X(0.64), ground - H * 0.17, W * 0.24, H * 0.17, dark ? '#3c4552' : '#8f99a6');
        g.fillStyle = dark ? '#a1aab6' : '#cfd5dd';
        g.fillRect(X(0.83), Y(0.36), W * 0.03, ground - H * 0.17 - Y(0.36));
        steam(X(0.845), Y(0.35), W * 0.03, 0.4, dark ? '#8a94a3' : '#e6eaef', 5);
      }
      g.restore();
      g.strokeStyle = withA(th().text, th().dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    /** Geometrie des Energieflussdiagramms. */
    interface Sankey {
      xIn: number;
      xOut: number;
      top: number;
      /** Pixel pro MW. */
      k: number;
      xs: number[];
      r0: number;
      yEnd: number;
      sp: number;
    }
    function sankeyGeom(r: Rect, chain: ChainResult, thick: number): Sankey {
      const n = chain.steps.length;
      const xIn = r.x;
      const xOut = r.x + r.w - 4;
      const sp = (xOut - 18 - xIn) / (n + 0.1);
      const xs = chain.steps.map((_, i) => xIn + sp * (i + 0.42));
      const k = thick / chain.pin;
      return { xIn, xOut, top: r.y, k, xs, r0: Math.max(8, Math.min(16, sp * 0.1)), yEnd: r.y + r.h, sp };
    }

    /** Lage eines Punkts auf einer Bahn des Energieflussdiagramms (Spur f = Anteil der Eingangsbreite). */
    function flowPos(sk: Sankey, chain: ChainResult, f: number, d: number): { x: number; y: number; color: string; visible: boolean } {
      const steps = chain.steps;
      const yLane = sk.top + f * chain.pin * sk.k;
      // In welcher Stufe zweigt die Spur ab?
      let branch = -1;
      for (let i = 0; i < steps.length; i++) {
        if (f * chain.pin > steps[i]!.pout) {
          branch = i;
          break;
        }
      }
      const kindAt = (x: number) => {
        let kind: FormKind = PLANTS[src()].primaryKind;
        for (let i = 0; i < steps.length; i++) if (x >= sk.xs[i]!) kind = stageKind(steps[i]!.stage);
        return kind;
      };
      if (branch < 0) {
        const x = sk.xIn + d;
        return { x, y: yLane, color: kindColor(kindAt(x)), visible: x <= sk.xOut - 6 };
      }
      const xs = sk.xs[branch]!;
      const along = xs - sk.xIn;
      if (d <= along) return { x: sk.xIn + d, y: yLane, color: kindColor(kindAt(sk.xIn + d)), visible: true };
      const st = steps[branch]!;
      const yb = sk.top + st.pin * sk.k;
      const rad = sk.r0 + (yb - yLane);
      const cy = yb + sk.r0;
      const arc = (Math.PI / 2) * rad;
      const used = st.heat > 0 && yLane < sk.top + st.pout * sk.k + st.heat * sk.k;
      const color = used ? COL.heatUse() : COL.loss();
      const dd = d - along;
      if (dd <= arc) {
        const a = -Math.PI / 2 + dd / rad;
        return { x: xs + Math.cos(a) * rad, y: cy + Math.sin(a) * rad, color, visible: true };
      }
      const y = cy + (dd - arc);
      return { x: xs + rad, y, color, visible: y <= sk.yEnd - 4 };
    }

    /** Zeichnet die Umwandlungskette. alpha für das Überblenden, dx für ein leichtes Gleiten. */
    function drawSankey(r: Rect, id: PlantId, chain: ChainResult, thick: number, alpha: number, reveal: number, stagger: boolean): void {
      const theme = th();
      const sk = sankeyGeom(r, chain, thick);
      const steps = chain.steps;
      const n = steps.length;
      const kIn = PLANTS[id].primaryKind;
      const narrowS = sk.sp < 96;
      g.save();
      g.globalAlpha *= alpha;
      // Aufdecken von links (Einstieg)
      g.beginPath();
      g.rect(r.x - 4, r.y - 220, (r.w + 8) * reveal, r.h + 300);
      g.clip();

      // Verlustzweige
      steps.forEach((st, i) => {
        const th2 = Math.max(1.5, st.loss * sk.k);
        const xs = sk.xs[i]!;
        const yb = sk.top + st.pin * sk.k;
        const cx = xs;
        const cy = yb + sk.r0;
        const ribbon = (rIn: number, rOut: number, color: string, fade: boolean) => {
          const grad = g.createLinearGradient(0, yb - th2, 0, sk.yEnd);
          grad.addColorStop(0, withA(color, sel === i ? 0.92 : 0.78));
          grad.addColorStop(1, withA(color, fade ? 0.28 : 0.6));
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(xs, cy - rOut);
          g.arc(cx, cy, rOut, -Math.PI / 2, 0);
          g.lineTo(cx + rOut, sk.yEnd - 7);
          g.lineTo(cx + (rIn + rOut) / 2, sk.yEnd);
          g.lineTo(cx + rIn, sk.yEnd - 7);
          g.arc(cx, cy, rIn, 0, -Math.PI / 2, true);
          g.closePath();
          g.fill();
        };
        if (st.heat > 0) {
          const hTh = st.heat * sk.k;
          ribbon(sk.r0, sk.r0 + th2 - hTh, COL.loss(), true);
          ribbon(sk.r0 + th2 - hTh, sk.r0 + th2, COL.heatUse(), false);
        } else ribbon(sk.r0, sk.r0 + th2, COL.loss(), true);
        addHit(`stage:${i}`, { x: xs - 2, y: yb - th2 - 2, w: sk.r0 + th2 + 6, h: sk.yEnd - yb + th2 + 2 });
      });

      // Hauptband (Abschnitte mit der Farbe der Energieform)
      let kind: FormKind = kIn;
      let x0 = sk.xIn;
      for (let i = 0; i <= n; i++) {
        const x1 = i < n ? sk.xs[i]! : sk.xOut - 14;
        const pw = i === 0 ? chain.pin : steps[i - 1]!.pout;
        const h = Math.max(1.5, pw * sk.k);
        const prevKind = kind;
        if (i > 0) kind = stageKind(steps[i - 1]!.stage);
        const col = kindColor(kind);
        const grad = g.createLinearGradient(x0, 0, Math.min(x1, x0 + 28), 0);
        grad.addColorStop(0, i > 0 ? kindColor(prevKind) : col);
        grad.addColorStop(1, col);
        g.fillStyle = grad;
        g.fillRect(x0, sk.top, x1 - x0 + 0.6, h);
        // Glanz oben
        g.fillStyle = 'rgba(255,255,255,0.16)';
        g.fillRect(x0, sk.top, x1 - x0 + 0.6, Math.min(4, h * 0.25));
        // Beschriftung im Band
        const label = i === 0 ? loc(PLANTS[id].primary) : loc(i === n ? L('elektrische Energie', 'electrical energy') : steps[i - 1]!.stage.to);
        const fsz = narrowS ? 10 : 11.5;
        const lf = font(fsz, 700);
        const avail = x1 - x0 - (i === n ? 4 : sk.r0 + 6);
        const lines = h >= 15 && avail > 34 ? wrap(label, avail - 8, lf, h >= 30 ? 2 : 1) : [];
        if (lines.length && lines.every((ln) => textW(ln, lf) <= avail - 6) && !lines.some((ln) => ln.endsWith('…'))) {
          const lh = fsz + 2;
          const y0 = sk.top + Math.min(h, 60) / 2 - ((lines.length - 1) * lh) / 2;
          lines.forEach((ln, j) => text(g, ln, x0 + 6, y0 + j * lh, { font: lf, color: textOn(col, theme), align: 'left' }));
        }
        x0 = x1;
      }
      // Pfeilspitze am Ausgang
      const hOut = Math.max(2, chain.pel * sk.k);
      g.fillStyle = COL.elec();
      g.beginPath();
      g.moveTo(sk.xOut - 14, sk.top - Math.min(8, hOut * 0.3 + 3));
      g.lineTo(sk.xOut, sk.top + hOut / 2);
      g.lineTo(sk.xOut - 14, sk.top + hOut + Math.min(8, hOut * 0.3 + 3));
      g.closePath();
      g.fill();

      // Punkte des Energieflusses
      if (p.flow) {
        const total = sk.xOut - sk.xIn + r.h * 1.4;
        const lanes = 26;
        const per = 5;
        for (let l = 0; l < lanes; l++) {
          const f = (l + 0.5) / lanes;
          for (let q = 0; q < per; q++) {
            const d = mod(flowT * 55 + (q / per) * total + ((l * 37) % 17) * 9, total);
            const pos = flowPos(sk, chain, f, d);
            if (!pos.visible) continue;
            g.fillStyle = theme.dark ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.85)';
            g.beginPath();
            g.arc(pos.x, pos.y, 1.9, 0, TAU);
            g.fill();
          }
        }
      }

      // Stufen: Markierung im Band und Schild darüber
      const chipF = font(narrowS ? 10.5 : 11.5, 700);
      const lh = narrowS ? 13 : 14;
      const specs = steps.map((st) => {
        const maxW = Math.min((stagger ? 1.7 : 1) * sk.sp - 8, 150);
        const lines = wrap(loc(st.stage.device), maxW - 12, chipF, 3);
        const etaS = `η = ${show() ? pct(st.stage.eta, 0) : '?'}`;
        const w = Math.max(...lines.map((ln) => textW(ln, chipF)), textW(etaS, chipF)) + 14;
        return { lines, etaS, w, ch: lh * (lines.length + 1) + 8 };
      });
      const rowH = Math.max(...specs.map((q) => q.ch));
      steps.forEach((st, i) => {
        const xs = sk.xs[i]!;
        const h = Math.max(2, st.pin * sk.k);
        g.fillStyle = theme.dark ? 'rgba(10,14,20,0.55)' : 'rgba(255,255,255,0.85)';
        g.fillRect(xs - 1.5, sk.top - 3, 3, h + 6);
        const { lines, etaS, w, ch } = specs[i]!;
        const cx = clamp(xs, r.x + w / 2, r.x + r.w - w / 2);
        const cy = sk.top - 10 - ch - (stagger && i % 2 === 1 ? rowH + 6 : 0);
        const selected = sel === i;
        const hovered = hoverId === `stage:${i}`;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
        g.shadowBlur = selected ? 10 : 6;
        g.shadowOffsetY = 1;
        g.fillStyle = selected ? withA(S(0), theme.dark ? 0.35 : 0.14) : theme.dark ? 'rgba(20,27,38,0.96)' : 'rgba(255,255,255,0.97)';
        roundRect(g, cx - w / 2, cy, w, ch, 9);
        g.fill();
        g.restore();
        g.strokeStyle = selected || hovered ? S(0) : withA(theme.text, 0.18);
        g.lineWidth = selected ? 1.6 : 1;
        roundRect(g, cx - w / 2 + 0.5, cy + 0.5, w - 1, ch - 1, 9);
        g.stroke();
        lines.forEach((ln, j) => text(g, ln, cx, cy + 4 + lh / 2 + j * lh, { font: chipF, color: theme.text }));
        text(g, etaS, cx, cy + 4 + lh / 2 + lines.length * lh, { font: font(narrowS ? 10.5 : 11.5, 600), color: S(0) });
        // kleiner Zeiger zum Band
        g.strokeStyle = withA(theme.text, 0.25);
        g.beginPath();
        g.moveTo(xs, cy + ch);
        g.lineTo(xs, sk.top - 3);
        g.stroke();
        addHit(`stage:${i}`, { x: cx - w / 2, y: cy, w, h: ch });
      });

      // Beschriftung der Verluste unten
      const lf = font(narrowS ? 10.5 : 11, 700);
      let lastRight = -Infinity;
      steps.forEach((st, i) => {
        const th2 = Math.max(1.5, st.loss * sk.k);
        const cx = sk.xs[i]! + sk.r0 + th2 / 2;
        const val = show() ? `${fmt.num(st.loss, st.loss < 10 ? 1 : 0)} MW` : '? MW';
        const name = loc(st.stage.loss).split(' (')[0]!;
        const lines: [string, string][] = [[val, COL.loss()]];
        if (st.heat > 0) lines.push([`${tx('davon', 'of which')} ${show() ? fmt.num(st.heat, 0) : '?'} MW ${tx('Heizung', 'heating')}`, COL.heatUse()]);
        else if (sk.sp >= 64) for (const ln of wrap(name, sk.sp - 4, font(10.5, 600), 2)) lines.push([ln, th().muted]);
        const w = Math.max(...lines.map((ln) => textW(ln[0], lf)));
        let x = clamp(cx, r.x + w / 2 + 2, r.x + r.w - w / 2 - 2);
        if (x - w / 2 < lastRight + 4) x = lastRight + 4 + w / 2;
        lastRight = x + w / 2;
        lines.forEach((ln, j) => haloText(ln[0], x, sk.yEnd + 10 + j * 13, j === 0 ? lf : font(10.5, 600), ln[1]));
      });
      g.restore();
    }

    /** Werte und Erklärungen zum Kraftwerk (rechte Spalte bzw. unten). */
    function drawPlantSide(r: Rect, chain: ChainResult): void {
      const theme = th();
      const plant = PLANTS[src()];
      const pad = 14;
      const compact = r.h < 420 || r.w < 230;
      const rowsH = compact ? 0 : Math.min(7 * 24 + 60, r.h * 0.46);
      const infoR: Rect = { x: r.x, y: r.y, w: r.w, h: r.h - (rowsH ? rowsH + 10 : 0) };
      panel(infoR, plant.renewable ? S(2) : S(1));
      const x = infoR.x + pad;
      const w = infoR.w - 2 * pad;
      let y = infoR.y + pad + 4;
      icon(plant.id, x + 11, y + 6, 22, plant.renewable ? S(2) : theme.text);
      const titleLines = wrap(loc(plant.name), w - 30, font(compact ? 14 : 15, 800), 2);
      titleLines.forEach((ln, j) => text(g, ln, x + 30, y + 6 + j * 18, { font: font(compact ? 14 : 15, 800), color: theme.text, align: 'left' }));
      y += 12 + titleLines.length * 18;
      // Abzeichen
      let bx = x;
      const badge = (label: string, color: string) => {
        const bw = textW(label, font(11, 700)) + 14;
        if (bx + bw > x + w) {
          bx = x;
          y += 22;
        }
        g.fillStyle = withA(color, theme.dark ? 0.24 : 0.13);
        roundRect(g, bx, y - 9, bw, 19, 9.5);
        g.fill();
        text(g, label, bx + bw / 2, y + 0.5, { font: font(11, 700), color });
        bx += bw + 6;
      };
      badge(plant.renewable ? tx('regenerativ', 'renewable') : tx('erschöpfbar', 'finite'), plant.renewable ? S(2) : S(1));
      badge(plant.dispatchable ? tx('regelbar', 'dispatchable') : tx('wetterabhängig', 'weather-dependent'), plant.dispatchable ? S(0) : S(3));
      badge(`${big(plant.co2)} g CO₂/kWh`, plant.co2 > 100 ? S(1) : S(2));
      y += 24;
      const fs = compact ? 11.5 : 12.5;
      const lh = compact ? 19 : 21;
      if (sel >= 0 && sel < chain.steps.length) {
        // Erklärung der ausgewählten Stufe
        const st = chain.steps[sel]!;
        text(g, loc(st.stage.device), x, y, { font: font(fs + 0.5, 800), color: S(0), align: 'left' });
        y += lh;
        const from = sel === 0 ? loc(plant.primary) : loc(chain.steps[sel - 1]!.stage.to);
        for (const ln of wrap(`${from} → ${loc(st.stage.to)}`, w, font(fs, 600), 2)) {
          text(g, ln, x, y, { font: font(fs, 600), color: theme.text, align: 'left' });
          y += lh - 3;
        }
        y += 3;
        row(x, y, w, `η = P_ab / P_zu`, show() ? `${fmt.num(st.pout, st.pin < 100 ? 1 : 0)} / ${fmt.num(st.pin, st.pin < 100 ? 1 : 0)} = ${pct(st.stage.eta, 0)}` : '?', S(0), fs);
        y += lh;
        row(x, y, w, `${tx('Verlust', 'Loss')}: ${loc(st.stage.loss)}`.slice(0, 60), show() ? un(st.loss, st.loss < 10 ? 1 : 0, 'MW') : '?', COL.loss(), fs);
        y += lh;
        for (const ln of wrap(loc(st.stage.info), w, font(fs - 0.5, 500), compact ? 2 : 3)) {
          if (y > infoR.y + infoR.h - 12) break;
          text(g, ln, x, y, { font: font(fs - 0.5, 500), color: theme.muted, align: 'left' });
          y += lh - 4;
        }
      } else {
        row(x, y, w, tx('zugeführt P_zu', 'input P_in'), un(chain.pin, 0, 'MW'), kindColor(plant.primaryKind), fs);
        y += lh;
        row(x, y, w, tx('elektrisch P_el', 'electrical P_el'), show() ? un(chain.pel, 0, 'MW') : '?', COL.elec(), fs, true);
        y += lh;
        if (chain.heat > 0) {
          row(x, y, w, tx('Heizwärme (KWK)', 'heating (CHP)'), show() ? un(chain.heat, 0, 'MW') : '?', COL.heatUse(), fs);
          y += lh;
        }
        row(x, y, w, tx('Verluste', 'Losses'), show() ? un(chain.lost, 0, 'MW') : '?', COL.loss(), fs);
        y += lh;
        const eta = show() ? pct(chain.eta, 1) : '?';
        row(x, y, w, tx('Wirkungsgrad η', 'Efficiency η'), eta, S(0), fs, true);
        y += lh;
        if (chain.heat > 0) {
          row(x, y, w, tx('Nutzungsgrad', 'Overall utilisation'), show() ? pct(chain.usage, 0) : '?', COL.heatUse(), fs);
          y += lh;
        }
        const e = energy(chain.pel, p.dur);
        if (y < infoR.y + infoR.h - 14) {
          row(x, y, w, `E = P · t (${fmt.num(p.dur, 0)} h)`, show() ? un(e, 0, 'MWh') : '?', COL.elec(), fs);
          y += lh;
        }
        if (y < infoR.y + infoR.h - 14) {
          row(x, y, w, 'CO₂', show() ? un(co2Kg(e * 1000, plant.co2) / 1000, 0, 't') : '?', plant.co2 > 100 ? S(1) : S(2), fs);
          y += lh;
        }
        if (y < infoR.y + infoR.h - 14) {
          for (const ln of wrap(tx('Tippe auf eine Stufe im Diagramm für Erklärungen.', 'Tap a stage in the diagram for explanations.'), w, font(fs - 1, 500), 2)) {
            if (y > infoR.y + infoR.h - 12) break;
            text(g, ln, x, y, { font: font(fs - 1, 500), color: theme.muted, align: 'left' });
            y += lh - 5;
          }
        }
      }
      if (!rowsH) return;
      // Vergleich aller Kraftwerke
      const cr: Rect = { x: r.x, y: r.y + r.h - rowsH, w: r.w, h: rowsH };
      panel(cr);
      text(g, tx('Vergleich (Beispielwerte)', 'Comparison (example values)'), cr.x + pad, cr.y + 18, { font: font(12, 800), color: theme.text, align: 'left' });
      const colW = (cr.w - 2 * pad - 92) / 2;
      const ex = cr.x + pad + 92;
      text(g, 'η', ex, cr.y + 38, { font: font(11, 700), color: S(0), align: 'left' });
      subText(g, 'CO_2 in g/kWh', ex + colW + 8, cr.y + 38, { size: 11, family: theme.font, weight: 700, color: S(1), align: 'left' });
      const rh = (cr.h - 54) / PLANT_IDS.length;
      PLANT_IDS.forEach((id, i) => {
        const pl = PLANTS[id];
        const yy = cr.y + 50 + i * rh + rh / 2;
        const active = id === src();
        const rr: Rect = { x: cr.x + 6, y: yy - rh / 2, w: cr.w - 12, h: rh };
        if (active || hoverId === `row:${id}`) {
          g.fillStyle = withA(S(0), active ? (theme.dark ? 0.2 : 0.1) : 0.06);
          roundRect(g, rr.x, rr.y + 1, rr.w, rr.h - 2, 7);
          g.fill();
        }
        icon(id, cr.x + pad + 7, yy, 14, pl.renewable ? S(2) : theme.muted);
        text(g, loc(pl.short), cr.x + pad + 20, yy, { font: font(11.5, active ? 800 : 600), color: theme.text, align: 'left' });
        const eta = plantChain(id, 100).eta;
        const bw1 = ease2(`eta:${id}`, (colW - 34) * eta * introK());
        g.fillStyle = withA(S(0), active ? 0.9 : 0.6);
        roundRect(g, ex, yy - 5, Math.max(2, bw1), 10, 3);
        g.fill();
        text(g, show() || !active ? `${fmt.num(eta * 100, 0)} %` : '?', ex + bw1 + 4, yy, { font: font(10.5, 700), color: theme.muted, align: 'left' });
        const bw2 = ease2(`co2:${id}`, (colW - 30) * (pl.co2 / 820) * introK());
        g.fillStyle = withA(S(1), active ? 0.85 : 0.5);
        roundRect(g, ex + colW + 8, yy - 5, Math.max(2, bw2), 10, 3);
        g.fill();
        text(g, big(pl.co2), ex + colW + 12 + bw2, yy, { font: font(10.5, 700), color: theme.muted, align: 'left' });
        addHit(`row:${id}`, rr);
      });
    }

    /** Leiste mit den sieben Kraftwerken zum Antippen. */
    function drawPlantChips(r: Rect): void {
      const theme = th();
      const n = PLANT_IDS.length;
      const gap = 6;
      const cw = (r.w - gap * (n - 1)) / n;
      const withText = cw > 74;
      PLANT_IDS.forEach((id, i) => {
        const pl = PLANTS[id];
        const x = r.x + i * (cw + gap);
        const active = id === src();
        const hovered = hoverId === `src:${id}`;
        const k = active && pop.running ? 1 + 0.06 * Math.sin(pop.t * Math.PI) : 1;
        const rr: Rect = { x, y: r.y, w: cw, h: r.h };
        g.save();
        g.translate(x + cw / 2, r.y + r.h / 2);
        g.scale(k, k);
        g.translate(-(x + cw / 2), -(r.y + r.h / 2));
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.1)';
        g.shadowBlur = active ? 10 : 4;
        g.shadowOffsetY = 1;
        const accent = pl.renewable ? S(2) : S(1);
        g.fillStyle = active ? withA(accent, theme.dark ? 0.3 : 0.15) : theme.dark ? 'rgba(20,27,38,0.95)' : 'rgba(255,255,255,0.96)';
        roundRect(g, x, r.y, cw, r.h, 10);
        g.fill();
        g.restore();
        g.strokeStyle = active ? accent : hovered ? withA(accent, 0.7) : withA(theme.text, 0.14);
        g.lineWidth = active ? 1.8 : 1;
        roundRect(g, x + 0.5, r.y + 0.5, cw - 1, r.h - 1, 10);
        g.stroke();
        const col = active ? accent : theme.text;
        if (withText) {
          icon(id, x + 18, r.y + r.h / 2, 18, col);
          text(g, loc(pl.short), x + 32, r.y + r.h / 2, { font: font(12, active ? 800 : 600), color: col, align: 'left' });
        } else icon(id, x + cw / 2, r.y + r.h / 2, Math.min(22, cw * 0.55), col);
        if (ctx.keyFocus === `src:${id}`) {
          g.strokeStyle = S(0);
          g.lineWidth = 2;
          roundRect(g, x - 2, r.y - 2, cw + 4, r.h + 4, 12);
          g.stroke();
        }
        addHit(`src:${id}`, rr);
      });
    }

    function drawPlantView(): void {
      const theme = th();
      const sc = lay.scene;
      const chipsH = small() ? 40 : 44;
      drawPlantChips({ x: sc.x, y: sc.y, w: sc.w, h: chipsH });
      const body: Rect = { x: sc.x, y: sc.y + chipsH + 10, w: sc.w, h: sc.h - chipsH - 10 };
      panel(body);
      const inner: Rect = { x: body.x + 12, y: body.y + 10, w: body.w - 24, h: body.h - 20 };
      // Kopfzeile: P_zu → P_el
      const k = srcTw.running ? srcTw.value : 1;
      const idNow = srcTw.running && k < 0.5 ? prevSrc : src();
      const chainNow = plantChain(idNow, p.pin, p.chp);
      const head = show()
        ? `P_zu = ${un(chainNow.pin, 0, 'MW')}  →  P_el = ${un(chainNow.pel, 0, 'MW')}   η = ${pct(chainNow.eta, 1)}`
        : `P_zu = ${un(chainNow.pin, 0, 'MW')}  →  P_el = ?`;
      const headF = font(small() ? 11.5 : 13, 700);
      const headLines = wrap(head, inner.w, headF, 2);
      headLines.forEach((ln, j) => subText(g, ln.replace('P_zu', 'P_zu').replace('P_el', 'P_el'), inner.x, inner.y + 9 + j * 17, { size: small() ? 11.5 : 13, family: theme.font, weight: 700, color: theme.text, align: 'left' }));
      const subLine = `${loc(PLANTS[idNow].primary)} → ${tx('elektrische Energie', 'electrical energy')}`;
      const subLines = wrap(subLine, inner.w, font(11.5, 600), 1);
      text(g, subLines[0]!, inner.x, inner.y + 9 + headLines.length * 17, { font: font(11.5, 600), color: theme.muted, align: 'left' });
      const top = inner.y + headLines.length * 17 + 22;
      const art = inner.w >= 440;
      const artW = art ? Math.round(clamp(inner.w * 0.2, 90, 160)) : 0;
      const lossH = small() ? 26 : 40;
      const spEst = (inner.w - artW - 22) / (chainNow.steps.length + 0.1);
      const stagger = spEst < 118;
      const chipBlock = (small() ? 50 : 58) * (stagger ? 2 : 1) + (stagger ? 8 : 0);
      const sankR: Rect = { x: inner.x + artW, y: top + chipBlock, w: inner.w - artW, h: inner.y + inner.h - top - chipBlock - lossH };
      const thick = Math.min(sankR.h * 0.42, 150) * (0.55 + 0.45 * Math.sqrt(p.pin / 2000));
      const thickS = ease2('thick', thick, 7);
      if (art) {
        const ar: Rect = { x: inner.x, y: sankR.y - Math.min(60, chipBlock * 0.6), w: artW - 6, h: Math.max(80, Math.min(sankR.h * 0.75, thickS + 120)) };
        const a = srcTw.running ? (k < 0.5 ? 1 - 2 * k : 2 * k - 1) : 1;
        g.save();
        g.globalAlpha = a;
        drawPlantArt(idNow, ar);
        g.restore();
        // Zuleitung vom Bild ins Diagramm
        g.fillStyle = withA(kindColor(PLANTS[idNow].primaryKind), 0.9 * a);
        g.fillRect(ar.x + ar.w - 2, sankR.y, 8, Math.max(2, thickS));
      }
      hits = hits.filter((h) => !h.id.startsWith('stage:'));
      const a = srcTw.running ? (k < 0.5 ? 1 - 2 * k : 2 * k - 1) : 1;
      g.save();
      g.translate(srcTw.running ? (k < 0.5 ? -10 * (2 * k) : 10 * (1 - (2 * k - 1))) : 0, 0);
      drawSankey(sankR, idNow, chainNow, thickS, a, introK(), stagger);
      g.restore();
      drawPlantSide(lay.side, plantChain(src(), p.pin, p.chp));
    }

    /* ================================================================== */
    /* Ansicht 2: Strommix über den Tag                                    */
    /* ================================================================== */
    function skyColors(h: number, season: Season): { top: string; bottom: string; light: number } {
      const s = SUN[season];
      const u = (h - s.rise) / (s.set - s.rise);
      const elev = u > 0 && u < 1 ? Math.sin(Math.PI * u) : -Math.min(Math.abs(h - s.rise), Math.abs(h - s.set), Math.abs(h + 24 - s.set), Math.abs(s.rise + 24 - h)) / 3;
      const light = clamp((elev + 0.12) / 0.4, 0, 1);
      const dusk = clamp(1 - Math.abs(elev) / 0.25, 0, 1);
      const dark = th().dark;
      const night = dark ? ['#050b18', '#101c33'] : ['#0e1c3a', '#283d66'];
      const dayC = dark ? ['#1d3c66', '#3d5f8a'] : ['#6fb6ef', '#d7eefc'];
      const top = mixColor(night[0]!, dayC[0]!, light);
      const bottom = mixColor(mixColor(night[1]!, dayC[1]!, light), dark ? '#b35a2e' : '#ffb26b', dusk * 0.65);
      return { top, bottom, light };
    }

    function drawDayScene(r: Rect, st: MixStep): void {
      const theme = th();
      const dark = theme.dark;
      const season = p.sea as Season;
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const sk = skyColors(hour, season);
      const horizon = r.y + r.h * 0.62;
      const sky = g.createLinearGradient(0, r.y, 0, horizon);
      sky.addColorStop(0, sk.top);
      sky.addColorStop(1, sk.bottom);
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, horizon - r.y + 2);
      // Sterne
      if (sk.light < 0.5) {
        const rnd = seededRandom(9);
        g.fillStyle = `rgba(255,255,255,${(0.5 - sk.light) * 1.4})`;
        for (let i = 0; i < 45; i++) g.fillRect(r.x + rnd() * r.w, r.y + rnd() * (horizon - r.y) * 0.7, rnd() < 0.15 ? 2 : 1, rnd() < 0.15 ? 2 : 1);
      }
      // Sonne bzw. Mond auf einem Bogen
      const s = SUN[season];
      const u = (hour - s.rise) / (s.set - s.rise);
      const arcH = (horizon - r.y) * (season === 'sommer' ? 0.78 : 0.5);
      if (u > -0.05 && u < 1.05) {
        const sx = r.x + r.w * (0.08 + 0.84 * u);
        const sy = horizon - Math.sin(Math.PI * clamp(u, 0, 1)) * arcH + 6;
        const rad = Math.max(10, r.h * 0.055);
        const glow = g.createRadialGradient(sx, sy, rad * 0.4, sx, sy, rad * 3.2);
        glow.addColorStop(0, withA('#ffe08a', 0.55 * (p.sun / 100 + 0.2)));
        glow.addColorStop(1, withA('#ffe08a', 0));
        g.fillStyle = glow;
        g.beginPath();
        g.arc(sx, sy, rad * 3.2, 0, TAU);
        g.fill();
        g.fillStyle = mixColor('#ffd34d', '#ff9a3c', clamp(1 - Math.sin(Math.PI * clamp(u, 0, 1)) * 2, 0, 1));
        g.beginPath();
        g.arc(sx, sy, rad, 0, TAU);
        g.fill();
      } else {
        const v = mod(hour - s.set, 24) / (24 - (s.set - s.rise));
        const mx = r.x + r.w * (0.1 + 0.8 * v);
        const my = horizon - Math.sin(Math.PI * clamp(v, 0, 1)) * arcH * 0.8 + 8;
        g.fillStyle = '#e9edf5';
        g.beginPath();
        g.arc(mx, my, Math.max(8, r.h * 0.04), 0, TAU);
        g.fill();
        g.fillStyle = sk.top;
        g.beginPath();
        g.arc(mx + Math.max(8, r.h * 0.04) * 0.45, my - 2, Math.max(8, r.h * 0.04), 0, TAU);
        g.fill();
      }
      // Wolken (mehr bei wenig Sonne)
      const nC = Math.round((1 - p.sun / 100) * 6) + 1;
      for (let i = 0; i < nC; i++) {
        const cx = r.x + mod(i * 0.23 + flowT * 0.006 * (1 + (i % 3)), 1.2) * r.w * 1.0 - r.w * 0.1;
        const cy = r.y + (0.12 + ((i * 0.37) % 0.3)) * (horizon - r.y);
        const sz = r.h * (0.035 + 0.02 * (i % 2)) * (1 + (1 - p.sun / 100) * 0.6);
        const grey = 1 - p.sun / 100;
        g.fillStyle = withA(mixColor(dark ? '#9aa7ba' : '#ffffff', dark ? '#4a5568' : '#9aa5b4', grey * 0.8), 0.85 * (0.4 + 0.6 * Math.max(sk.light, 0.3)));
        g.beginPath();
        g.ellipse(cx, cy, sz * 2.3, sz * 0.85, 0, 0, TAU);
        g.ellipse(cx - sz * 0.8, cy - sz * 0.45, sz * 1.1, sz * 0.9, 0, 0, TAU);
        g.ellipse(cx + sz * 0.6, cy - sz * 0.6, sz * 1.25, sz, 0, 0, TAU);
        g.fill();
      }
      // Hügel
      const winter = season === 'winter';
      const hillCol = (base: string) => mixColor(mixColor(base, winter ? '#e8eef3' : base, winter ? 0.55 : 0), '#0a1020', (1 - sk.light) * 0.55);
      const hills = (amp: number, base: number, ph: number, color: string) => {
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(r.x, r.y + r.h);
        for (let x = 0; x <= r.w + 8; x += 8) g.lineTo(r.x + x, base - amp * (0.55 + 0.45 * Math.sin(x / 110 + ph) * Math.sin(x / 47 + ph * 2)));
        g.lineTo(r.x + r.w, r.y + r.h);
        g.closePath();
        g.fill();
      };
      hills(r.h * 0.14, horizon, 0.6, hillCol(dark ? '#2d4a38' : '#9fcb8f'));
      const groundY = r.y + r.h * 0.8;
      hills(r.h * 0.06, groundY, 2.2, hillCol(dark ? '#25402f' : '#86bd74'));
      g.fillStyle = hillCol(dark ? '#21382a' : '#78b166');
      g.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);

      const sz = Math.min(r.h, r.w * 0.6);
      // Windräder links
      for (const [fx, k] of [
        [0.06, 0.8],
        [0.13, 1],
        [0.2, 0.72],
      ] as const) {
        const hx = r.x + r.w * fx;
        const tower = sz * 0.36 * k;
        const hy = groundY - tower;
        g.strokeStyle = dark ? '#c3ccd8' : '#f6f8fa';
        g.lineWidth = Math.max(2, sz * 0.012 * k);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(hx, groundY + 2);
        g.lineTo(hx, hy);
        g.stroke();
        const len = sz * 0.17 * k;
        for (let i = 0; i < 3; i++) {
          const a = rotor * (0.9 + 0.2 * k) + fx * 7 + (i * TAU) / 3;
          g.strokeStyle = dark ? '#dfe5ee' : '#ffffff';
          g.lineWidth = Math.max(2, sz * 0.011 * k);
          g.beginPath();
          g.moveTo(hx, hy);
          g.lineTo(hx + Math.cos(a) * len, hy + Math.sin(a) * len);
          g.stroke();
        }
        g.fillStyle = dark ? '#aab3c0' : '#e1e5eb';
        g.beginPath();
        g.arc(hx, hy, Math.max(2, sz * 0.012), 0, TAU);
        g.fill();
      }
      // PV-Feld
      const pvFrac = st.pv / (MIX.pvInstalled * 0.7);
      for (let i = 0; i < 5; i++) {
        const bx = r.x + r.w * (0.27 + i * 0.045);
        const by = groundY + r.h * 0.07 + (i % 2) * 3;
        const pw = r.w * 0.04;
        const ph = r.h * 0.05;
        const grad = g.createLinearGradient(bx, by - ph, bx + pw, by);
        grad.addColorStop(0, mixColor('#244b8e', '#8fc3ff', clamp(pvFrac, 0, 1) * 0.6));
        grad.addColorStop(1, dark ? '#16305c' : '#1f3f78');
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(bx + pw * 0.25, by - ph);
        g.lineTo(bx + pw, by - ph);
        g.lineTo(bx + pw * 0.75, by);
        g.closePath();
        g.fill();
      }
      // Häuser (Stadt) mit Fenstern
      const town = r.x + r.w * 0.5;
      const rndH = seededRandom(4);
      for (let i = 0; i < 6; i++) {
        const hw = r.w * 0.034;
        const hh = r.h * (0.1 + rndH() * 0.09);
        const hx = town + i * hw * 1.18;
        const hy = groundY - hh + 4;
        g.fillStyle = mixColor(dark ? '#5b6676' : '#e6dccb', '#0a1020', (1 - sk.light) * 0.5);
        g.fillRect(hx, hy, hw, hh);
        g.fillStyle = mixColor(dark ? '#7a3b33' : '#c0574a', '#0a1020', (1 - sk.light) * 0.5);
        g.beginPath();
        g.moveTo(hx - 2, hy);
        g.lineTo(hx + hw / 2, hy - hw * 0.45);
        g.lineTo(hx + hw + 2, hy);
        g.closePath();
        g.fill();
        const lit = 1 - sk.light;
        for (let wy = 0; wy < 3; wy++) {
          if (hy + 5 + wy * hh * 0.28 > groundY - 3) continue;
          g.fillStyle = lit > 0.3 && (i + wy) % 3 !== 0 ? `rgba(255,214,120,${0.35 + lit * 0.6})` : withA('#1d2a40', 0.35);
          g.fillRect(hx + hw * 0.2, hy + 5 + wy * hh * 0.28, hw * 0.22, hh * 0.13);
          g.fillRect(hx + hw * 0.58, hy + 5 + wy * hh * 0.28, hw * 0.22, hh * 0.13);
        }
      }
      // Speicher (Batterie-Container) mit Füllstand
      const bxs = r.x + r.w * 0.73;
      const bw = r.w * 0.06;
      const bh = r.h * 0.12;
      const by = groundY - bh + 4;
      g.fillStyle = dark ? '#3b4656' : '#f1f3f6';
      roundRect(g, bxs, by, bw, bh, 4);
      g.fill();
      g.strokeStyle = S(4);
      g.lineWidth = 1.5;
      g.stroke();
      const fill = p.cap > 0 ? clamp(st.soc / p.cap, 0, 1) : 0;
      g.fillStyle = withA(S(4), 0.75);
      g.fillRect(bxs + 3, by + 3 + (bh - 6) * (1 - fill), bw - 6, (bh - 6) * fill);
      if (st.charge > 0.05 || st.discharge > 0.05) {
        const up = st.charge > 0.05;
        const ax = bxs + bw / 2;
        const ay = by - 10;
        g.fillStyle = S(4);
        g.beginPath();
        g.moveTo(ax - 6, ay + (up ? 4 : -4));
        g.lineTo(ax + 6, ay + (up ? 4 : -4));
        g.lineTo(ax, ay + (up ? -5 : 5));
        g.closePath();
        g.fill();
      }
      // Kohlekraftwerk mit Kühlturm
      const coalX = r.x + r.w * 0.83;
      if (p.base > 0) {
        coolingTower(coalX, groundY + 4, sz * 0.16, sz * 0.22);
        steam(coalX, groundY + 4 - sz * 0.22, sz * 0.045, p.base / 14, steamColor(), 2);
      }
      // Gaskraftwerk ganz rechts
      const gasX = r.x + r.w * 0.93;
      building(gasX - sz * 0.07, groundY - sz * 0.08 + 4, sz * 0.12, sz * 0.08);
      g.fillStyle = dark ? '#a1aab6' : '#d0d6dd';
      g.fillRect(gasX + sz * 0.03, groundY - sz * 0.2, sz * 0.018, sz * 0.13);
      steam(gasX + sz * 0.04, groundY - sz * 0.2, sz * 0.035, st.gas / 30, dark ? '#8a94a3' : '#dfe4ea', 7);
      // Stromleitung mit Punkten
      const wireY = groundY - sz * 0.27;
      const xs = [r.x + r.w * 0.24, r.x + r.w * 0.42, r.x + r.w * 0.62, r.x + r.w * 0.8, r.x + r.w * 0.97];
      g.strokeStyle = dark ? 'rgba(200,210,225,0.55)' : 'rgba(60,70,90,0.45)';
      g.lineWidth = 1.2;
      for (const x of xs) {
        g.beginPath();
        g.moveTo(x, groundY + 2);
        g.lineTo(x, wireY - 4);
        g.moveTo(x - 7, wireY);
        g.lineTo(x + 7, wireY);
        g.stroke();
      }
      g.beginPath();
      for (let i = 0; i < xs.length - 1; i++) {
        g.moveTo(xs[i]!, wireY);
        g.quadraticCurveTo((xs[i]! + xs[i + 1]!) / 2, wireY + 8, xs[i + 1]!, wireY);
      }
      g.stroke();
      if (p.flow) {
        const total = xs[xs.length - 1]! - xs[0]!;
        const n = 16;
        g.fillStyle = withA(S(3), 0.95);
        for (let i = 0; i < n; i++) {
          const d = mod(flowT * (20 + st.load * 0.8) + (i / n) * total, total);
          // Fluss zur Stadt hin (von rechts und links); hier vereinfacht von rechts nach links
          const x = xs[xs.length - 1]! - d;
          let seg = 0;
          while (seg < xs.length - 2 && x < xs[seg + 1]!) seg++;
          const a = xs[seg]!;
          const b = xs[seg + 1]!;
          const t = clamp((x - a) / (b - a), 0, 1);
          const y = wireY + 8 * 2 * t * (1 - t) * 2 * 0.5;
          g.beginPath();
          g.arc(x, y, 2, 0, TAU);
          g.fill();
        }
      }
      g.restore();
      g.strokeStyle = withA(theme.text, theme.dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();

      // Namen der Anlagen
      if (r.w >= 480) {
        const lf = font(10.5, 700);
        const ly = groundY + (r.y + r.h - groundY) * 0.62;
        const lc = theme.dark ? '#dfe6ef' : '#1f3a26';
        haloText(tx('Wind', 'Wind'), r.x + r.w * 0.13, ly, lf, lc);
        haloText(tx('Sonne', 'Solar'), r.x + r.w * 0.36, ly, lf, lc);
        haloText(tx('Verbraucher', 'Consumers'), r.x + r.w * 0.6, ly, lf, lc);
        haloText(tx('Speicher', 'Storage'), r.x + r.w * 0.76, ly, lf, lc);
        if (p.base > 0) haloText(tx('Kohle', 'Coal'), r.x + r.w * 0.85, ly, lf, lc);
        haloText(tx('Gas', 'Gas'), r.x + r.w * 0.94, ly, lf, lc);
      }
      // Anzeigen
      const hh = Math.floor(hour);
      const mm = Math.floor((hour - hh) * 60 / 15) * 15;
      const clock = `${String(hh % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${tx('Uhr', '')}`.trim();
      const sizeP = small() ? 11.5 : 13;
      const w1 = pill(r.x + 10, r.y + 10, clock, theme.text, 'left', sizeP);
      pill(r.x + 10 + w1.w + 6, r.y + 10, season === 'sommer' ? tx('Sommer', 'Summer') : tx('Winter', 'Winter'), theme.muted, 'left', sizeP);
      if (show()) {
        pill(r.x + r.w - 10, r.y + 10, `${tx('Last', 'Load')} ${un(st.load, 1, 'GW')}`, theme.text, 'right', sizeP);
        if (st.gas > 0.05) pill(r.x + r.w - 10, r.y + 16 + sizeP + 10, `${tx('Gas', 'Gas')} ${un(st.gas, 1, 'GW')}`, S(1), 'right', sizeP);
        else if (st.surplus > 0.05) pill(r.x + r.w - 10, r.y + 16 + sizeP + 10, `${tx('Überschuss', 'Surplus')} ${un(st.surplus, 1, 'GW')}`, theme.muted, 'right', sizeP);
      }
    }

    function drawDayChart(r: Rect, arr: MixArrays): void {
      const theme = th();
      panel(r);
      const narrowC = r.w < 420;
      const pad = { l: narrowC ? 34 : 42, r: 12, t: 50, b: 30 };
      const plotR: Rect = { x: r.x + pad.l, y: r.y + pad.t, w: r.w - pad.l - pad.r, h: r.h - pad.t - pad.b };
      let ymax = 0;
      for (let i = 0; i < STEPS_PER_DAY; i++) {
        const top = STACK.reduce((s, q) => s + arr[q.key][i]!, 0);
        ymax = Math.max(ymax, top, arr.load[i]!);
      }
      const yTop = ease2('dayTop', niceTop(ymax), 6);
      const ax = axes(plotR, [0, 24], [0, yTop]);
      chip(r.x + 10, r.y + 8, tx('Strommix über den Tag (Beispielwerte)', 'Electricity mix over the day (example values)'), theme.text, narrowC ? 11 : 12);
      drawAxes(ax, { xStep: narrowC ? 6 : 3, yStep: niceStep(yTop / (plotR.h > 160 ? 5 : 3)), xFmt: (v) => `${fmt.num(v, 0)}`, yFmt: (v) => fmt.num(v, 0), xLabel: tx('Uhrzeit in h', 'time in h'), yLabel: 'GW' });
      const n = STEPS_PER_DAY;
      const dt = 24 / n;
      const grow = introK();
      /** Stützstellen: Mitten der Viertelstunden, an den Rändern fortgesetzt. */
      const hx = (i: number) => (i < 0 ? 0 : i >= n ? 24 : (i + 0.5) * dt);
      const at = (arrK: number[], i: number) => arrK[clamp(i, 0, n - 1)]!;
      const drawStack = (alpha: number) => {
        const lower = new Array<number>(n).fill(0);
        for (const s of STACK) {
          const col = mixColorOf(s.key);
          const vals = arr[s.key];
          g.fillStyle = withA(col, alpha);
          g.beginPath();
          for (let i = -1; i <= n; i++) {
            const x = ax.px(hx(i));
            const y = ax.py((at(lower, i) + at(vals, i)) * grow);
            if (i === -1) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          for (let i = n; i >= -1; i--) g.lineTo(ax.px(hx(i)), ax.py(at(lower, i) * grow));
          g.closePath();
          g.fill();
          for (let i = 0; i < n; i++) lower[i] = lower[i]! + vals[i]!;
        }
        return lower.map((v) => v * grow);
      };
      g.save();
      g.beginPath();
      g.rect(plotR.x, plotR.y - 2, plotR.w, plotR.h + 2);
      g.clip();
      drawStack(0.22);
      g.beginPath();
      g.rect(plotR.x, plotR.y - 2, ax.px(hour) - plotR.x, plotR.h + 2);
      g.clip();
      const tops = drawStack(0.85);
      // Überschuss über der Last schraffieren (Laden bzw. Export/Abregeln)
      g.save();
      g.beginPath();
      for (let i = -1; i <= n; i++) {
        const x = ax.px(hx(i));
        const y = ax.py(Math.max(at(tops, i), at(arr.load, i) * grow));
        if (i === -1) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      for (let i = n; i >= -1; i--) g.lineTo(ax.px(hx(i)), ax.py(at(arr.load, i) * grow));
      g.closePath();
      g.clip();
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.85)';
      g.lineWidth = 1.3;
      g.beginPath();
      for (let q = plotR.x - plotR.h; q < plotR.x + plotR.w; q += 6) {
        g.moveTo(q, plotR.y + plotR.h);
        g.lineTo(q + plotR.h, plotR.y);
      }
      g.stroke();
      g.restore();
      g.restore();
      // Last als Linie
      g.strokeStyle = theme.text;
      g.lineWidth = 2.4;
      g.lineJoin = 'round';
      g.beginPath();
      for (let i = -1; i <= n; i++) {
        const x = ax.px(hx(i));
        const y = ax.py(at(arr.load, i) * grow);
        if (i === -1) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
      // Zeitmarke
      const x = ax.px(hour);
      g.strokeStyle = withA(theme.text, 0.55);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x, plotR.y - 2);
      g.lineTo(x, plotR.y + plotR.h);
      g.stroke();
      g.fillStyle = theme.text;
      g.beginPath();
      g.moveTo(x - 7, plotR.y - 8);
      g.lineTo(x + 7, plotR.y - 8);
      g.lineTo(x, plotR.y + 1);
      g.closePath();
      g.fill();
      const st = shownStep(arr, hour);
      g.fillStyle = theme.text;
      g.beginPath();
      g.arc(x, ax.py(st.load * grow), 5, 0, TAU);
      g.fill();
      if (!narrowC || x < plotR.x + plotR.w - 60) haloText(tx('Last', 'load'), clamp(ax.px(2.2), plotR.x + 14, plotR.x + plotR.w), ax.py(arr.load[8]! * grow) - 10, font(11, 700), theme.text);
      addHit('time', { x: plotR.x - 6, y: plotR.y - 14, w: plotR.w + 12, h: plotR.h + 22 }, 'ew-resize');
    }

    function drawDayCard(r: Rect, arr: MixArrays): void {
      const theme = th();
      panel(r);
      const st = shownStep(arr, hour);
      const pad = 12;
      const x = r.x + pad;
      const w = r.w - 2 * pad;
      const twoCol = r.w > 300 && r.h < 230;
      const fs = r.h < 220 ? 11 : 12;
      const lh = r.h < 220 ? 16 : 19;
      let y = r.y + 16;
      text(g, tx('Jetzt eingespeist', 'Fed in right now'), x, y, { font: font(12, 800), color: theme.text, align: 'left' });
      y += lh + 2;
      const items = STACK;
      const colW = twoCol ? (w - 12) / 2 : w;
      items.forEach((s, i) => {
        const cx = twoCol ? x + (i % 2) * (colW + 12) : x;
        const cy = twoCol ? y + Math.floor(i / 2) * lh : y + i * lh;
        let val = st[s.key];
        let label = de() ? s.de : s.en;
        if (s.key === 'discharge' && st.charge > 0.01) {
          val = -st.charge;
          label = tx('Speicher lädt', 'Storage charging');
        } else if (s.key === 'discharge') label = st.discharge > 0.01 ? tx('Speicher entlädt', 'Storage discharging') : tx('Speicher', 'Storage');
        row(cx, cy, colW, label, show() ? un(val, 1, 'GW') : '?', mixColorOf(s.key), fs);
      });
      y += (twoCol ? Math.ceil(items.length / 2) : items.length) * lh + 4;
      g.strokeStyle = withA(theme.text, 0.12);
      g.beginPath();
      g.moveTo(x, y - lh / 2);
      g.lineTo(x + w, y - lh / 2);
      g.stroke();
      const tot = day.totals;
      const lines: [string, string, string][] = [
        [tx('Füllstand', 'Storage level'), p.cap > 0 ? (w < 250 ? un(st.soc, 1, 'GWh') : `${un(st.soc, 1, 'GWh')} (${pct(st.soc / p.cap, 0)})`) : tx('kein Speicher', 'no storage'), S(4)],
        [tx('Erneuerbar (Tag)', 'Renewable (day)'), show() ? pct(day.renewShare, 0) : '?', S(2)],
        [tx('Gas (Tag)', 'Gas (day)'), show() ? un(tot.gas, 0, 'GWh') : '?', S(1)],
        [tx('CO₂ pro kWh (Tag)', 'CO₂ per kWh (day)'), show() ? `${fmt.num(day.intensity, 0)} g` : '?', theme.muted],
      ];
      for (const [a, b, c] of lines) {
        if (y > r.y + r.h - 8) break;
        row(x, y, w, a, b, c, fs);
        y += lh;
      }
    }

    function drawDayView(): void {
      const arr = shownArrays();
      const st = shownStep(arr, hour);
      drawDayScene(lay.scene, st);
      drawDayChart(lay.chart, arr);
      drawDayCard(lay.card, arr);
    }

    /* ================================================================== */
    /* Ansicht 3: Speicher                                                 */
    /* ================================================================== */
    /** Pixel pro Meter und Lage des Unterbeckens im Pumpspeicher-Bild. */
    let pumpMax = 400;
    function pumpGeom(r: Rect): { base: number; k: number; upperX: number; upperW: number; houseX: number } {
      const base = r.y + r.h - 44;
      const k = (r.h - 130) / pumpMax;
      return { base, k, upperX: r.x + r.w * 0.56, upperW: r.w * 0.36, houseX: r.x + r.w * 0.3 };
    }

    function drawPumpScene(r: Rect): void {
      const theme = th();
      const dark = theme.dark;
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const sky = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      sky.addColorStop(0, dark ? '#13223a' : '#bfe2fb');
      sky.addColorStop(1, dark ? '#24364f' : '#f2f9ff');
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, r.h);
      if (dragging !== 'basin') pumpMax = ease2('pmax', Math.max(250, p.hp * 1.12), 5);
      const geo = pumpGeom(r);
      const hS = ease2('hp', p.hp, 9);
      // Berge im Hintergrund und Wolken
      g.fillStyle = dark ? 'rgba(120,140,170,0.18)' : 'rgba(120,150,190,0.25)';
      g.beginPath();
      g.moveTo(r.x, geo.base);
      for (let x = 0; x <= r.w + 10; x += 10) g.lineTo(r.x + x, r.y + r.h * 0.42 - Math.abs(Math.sin(x / 90 + 0.7)) * r.h * 0.14 - Math.sin(x / 37) * 6);
      g.lineTo(r.x + r.w, geo.base);
      g.closePath();
      g.fill();
      g.fillStyle = dark ? 'rgba(170,185,210,0.16)' : 'rgba(255,255,255,0.85)';
      for (const [fx, fy, k2] of [
        [0.2, 0.16, 1],
        [0.72, 0.1, 0.8],
      ] as const) {
        const cx = r.x + mod(fx + flowT * 0.004, 1.15) * r.w - r.w * 0.05;
        const cy = r.y + fy * r.h + 20;
        const u = Math.max(8, r.h * 0.025) * k2;
        g.beginPath();
        g.ellipse(cx, cy, u * 2.4, u * 0.9, 0, 0, TAU);
        g.ellipse(cx - u * 0.9, cy - u * 0.5, u * 1.1, u, 0, 0, TAU);
        g.ellipse(cx + u * 0.6, cy - u * 0.7, u * 1.3, u * 1.1, 0, 0, TAU);
        g.fill();
      }
      const yU = geo.base - hS * geo.k;
      const depth = Math.max(20, Math.min(44, r.h * 0.085));
      // Berg
      const rock = g.createLinearGradient(0, yU, 0, geo.base);
      rock.addColorStop(0, dark ? '#4d5a4a' : '#9bb48a');
      rock.addColorStop(1, dark ? '#2f3b33' : '#6f915f');
      g.fillStyle = rock;
      g.beginPath();
      g.moveTo(r.x, geo.base + 6);
      g.lineTo(geo.houseX + r.w * 0.04, geo.base + 6);
      g.bezierCurveTo(geo.houseX + r.w * 0.12, geo.base - 10, geo.upperX - r.w * 0.12, yU + depth + 8, geo.upperX - 6, yU + 2);
      g.lineTo(geo.upperX + geo.upperW + 8, yU + 2);
      g.lineTo(r.x + r.w, yU + depth * 0.6);
      g.lineTo(r.x + r.w, r.y + r.h);
      g.lineTo(r.x, r.y + r.h);
      g.closePath();
      g.fill();
      // Unterbecken
      const lowW = geo.houseX - r.x - 6;
      const lowLevel = 1 - soc;
      g.fillStyle = dark ? '#3a3326' : '#c9b48a';
      g.fillRect(r.x, geo.base - 4, lowW + 10, r.y + r.h - geo.base + 4);
      g.fillStyle = dark ? '#2f3b33' : '#6f915f';
      g.fillRect(r.x, geo.base + depth + 6, r.w, r.y + r.h - geo.base);
      const water = (x: number, y: number, w: number, h: number) => {
        const grad = g.createLinearGradient(0, y, 0, y + h);
        grad.addColorStop(0, dark ? '#3f7fc2' : '#6fb3f0');
        grad.addColorStop(1, dark ? '#1f4a7a' : '#2f78c4');
        g.fillStyle = grad;
        g.fillRect(x, y, w, h);
        g.strokeStyle = 'rgba(255,255,255,0.55)';
        g.lineWidth = 1.2;
        g.beginPath();
        for (let i = 0; i < 3; i++) {
          const x0 = x + mod(flowT * 8 + i * w * 0.33, w - 14);
          g.moveTo(x0, y + 3);
          g.quadraticCurveTo(x0 + 5, y, x0 + 10, y + 3);
        }
        g.stroke();
      };
      const lowDepth = depth * 0.9;
      const lowTop = geo.base - 3 + lowDepth * (1 - lowLevel) * 0.8;
      water(r.x, lowTop, lowW, geo.base + lowDepth + 6 - lowTop);
      // Oberbecken (ziehbar)
      const ux = geo.upperX;
      const uw = geo.upperW;
      g.fillStyle = dark ? '#6d7585' : '#cfd5dd';
      g.beginPath();
      g.moveTo(ux - 6, yU - 4);
      g.lineTo(ux + uw + 6, yU - 4);
      g.lineTo(ux + uw - 6, yU + depth + 4);
      g.lineTo(ux + 6, yU + depth + 4);
      g.closePath();
      g.fill();
      const level = soc * introK();
      const wTop = yU + depth * (1 - level);
      if (level > 0.005) {
        g.save();
        g.beginPath();
        g.moveTo(ux - 1, yU - 2);
        g.lineTo(ux + uw + 1, yU - 2);
        g.lineTo(ux + uw - 8, yU + depth);
        g.lineTo(ux + 8, yU + depth);
        g.closePath();
        g.clip();
        water(ux - 2, wTop, uw + 4, yU + depth - wTop + 2);
        g.restore();
      }
      const hovered = hoverId === 'basin' || dragging === 'basin';
      if (hovered || ctx.keyFocus === 'basin') {
        g.strokeStyle = S(0);
        g.lineWidth = 2;
        g.setLineDash([5, 4]);
        roundRect(g, ux - 10, yU - 10, uw + 20, depth + 20, 8);
        g.stroke();
        g.setLineDash([]);
      }
      // Griff zum Ziehen
      g.fillStyle = S(0);
      g.beginPath();
      roundRect(g, ux + uw / 2 - 16, yU - 16, 32, 8, 4);
      g.fill();
      addHit('basin', { x: ux - 12, y: yU - 22, w: uw + 24, h: depth + 30 }, 'ns-resize');
      // Druckrohr
      const pipe: Pt[] = [
        [ux + 6, yU + depth - 4],
        [ux - r.w * 0.06, yU + depth + (geo.base - yU) * 0.25],
        [geo.houseX + r.w * 0.12, geo.base - 24],
        [geo.houseX + r.w * 0.03, geo.base - 12],
      ];
      g.strokeStyle = dark ? '#9aa4b2' : '#7d8794';
      g.lineWidth = Math.max(5, r.w * 0.012);
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(pipe[0]![0], pipe[0]![1]);
      for (const q of pipe.slice(1)) g.lineTo(q[0], q[1]);
      g.stroke();
      g.strokeStyle = dark ? '#2b4a6e' : '#4f8fd0';
      g.lineWidth = Math.max(2.5, r.w * 0.006);
      g.stroke();
      if (dir !== 0 && p.flow) {
        const segs: number[] = [];
        let tot = 0;
        for (let i = 0; i < pipe.length - 1; i++) {
          const d = Math.hypot(pipe[i + 1]![0] - pipe[i]![0], pipe[i + 1]![1] - pipe[i]![1]);
          segs.push(d);
          tot += d;
        }
        g.fillStyle = 'rgba(255,255,255,0.9)';
        for (let i = 0; i < 12; i++) {
          let d = mod(flowT * 70 * (dir < 0 ? 1 : -1) + (i / 12) * tot, tot);
          let j = 0;
          while (j < segs.length - 1 && d > segs[j]!) {
            d -= segs[j]!;
            j++;
          }
          const a = pipe[j]!;
          const b = pipe[j + 1]!;
          const t = clamp(d / segs[j]!, 0, 1);
          g.beginPath();
          g.arc(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 1.8, 0, TAU);
          g.fill();
        }
      }
      // Krafthaus mit Turbine
      const hw = r.w * 0.11;
      const hh = r.h * 0.11;
      const hx = geo.houseX - hw * 0.25;
      building(hx, geo.base - hh, hw, hh, dark ? '#3c4552' : '#8f99a6');
      const tx0 = hx + hw * 0.5;
      const ty0 = geo.base - hh * 0.45;
      g.strokeStyle = dir > 0 ? S(4) : dir < 0 ? S(0) : theme.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(tx0, ty0, hh * 0.28, 0, TAU);
      g.stroke();
      for (let i = 0; i < 5; i++) {
        const a = flowT * 6 * dir + (i * TAU) / 5;
        g.beginPath();
        g.moveTo(tx0, ty0);
        g.lineTo(tx0 + Math.cos(a) * hh * 0.26, ty0 + Math.sin(a) * hh * 0.26);
        g.stroke();
      }
      // Höhenpfeil h
      const ax0 = ux + uw + (r.x + r.w - ux - uw) / 2 - 4;
      const ar = Math.min(ax0, r.x + r.w - 26);
      const yLow = geo.base - 2;
      const yHigh = yU + depth * 0.5;
      g.strokeStyle = S(0);
      g.fillStyle = S(0);
      g.lineWidth = 1.6;
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(r.x, yLow);
      g.lineTo(ar + 10, yLow);
      g.moveTo(ux + uw, yHigh);
      g.lineTo(ar + 10, yHigh);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(ar, yLow - 2);
      g.lineTo(ar, yHigh + 2);
      g.stroke();
      for (const [yy, s] of [
        [yHigh, 1],
        [yLow, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(ar, yy);
        g.lineTo(ar - 5, yy + 8 * s);
        g.lineTo(ar + 5, yy + 8 * s);
        g.closePath();
        g.fill();
      }
      const hLabel = `h = ${fmt.num(hS, 0)} m`;
      haloText(hLabel, ar - 6, (yLow + yHigh) / 2, font(small() ? 11.5 : 13, 800), S(0), 'right');
      // Höhenskala links
      g.fillStyle = theme.muted;
      const stepM = niceStep(pumpMax / 4);
      for (let m = stepM; m <= pumpMax * 1.3; m += stepM) {
        const yy = geo.base - m * geo.k;
        if (yy < r.y + 44) continue;
        text(g, `${m} m`, r.x + 6, yy - 7, { font: font(10.5, 600), color: withA(theme.text, 0.55), align: 'left' });
      }
      g.restore();
      g.strokeStyle = withA(theme.text, theme.dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      drawStoreBadges(r);
    }

    function drawBatteryScene(r: Rect): void {
      const theme = th();
      const dark = theme.dark;
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const sky = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      sky.addColorStop(0, dark ? '#13223a' : '#bfe2fb');
      sky.addColorStop(1, dark ? '#24364f' : '#f2f9ff');
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, r.h);
      const ground = r.y + r.h * 0.78;
      g.fillStyle = dark ? 'rgba(120,140,170,0.18)' : 'rgba(120,150,190,0.25)';
      g.beginPath();
      g.moveTo(r.x, ground);
      for (let x = 0; x <= r.w + 10; x += 10) g.lineTo(r.x + x, ground - r.h * 0.16 - Math.sin(x / 70 + 1) * r.h * 0.05);
      g.lineTo(r.x + r.w, ground);
      g.closePath();
      g.fill();
      g.fillStyle = dark ? '#22392b' : '#a9d39a';
      g.fillRect(r.x, ground, r.w, r.y + r.h - ground);
      g.fillStyle = dark ? '#3a3f47' : '#c9ced6';
      g.fillRect(r.x + r.w * 0.04, ground, r.w * 0.82, (r.y + r.h - ground) * 0.35);
      // Container mit Batteriemodulen
      const cw = r.w * 0.56;
      const chh = r.h * 0.44;
      const cx = r.x + r.w * 0.08;
      const cy = ground - chh;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = dark ? '#5d6878' : '#f7f8fa';
      roundRect(g, cx, cy, cw, chh, 8);
      g.fill();
      g.restore();
      const modules = 6;
      const mw = (cw - 24) / modules;
      const lvl = soc * introK();
      for (let i = 0; i < modules; i++) {
        const mx = cx + 12 + i * mw;
        const my = cy + 14;
        const mh = chh - 28;
        g.fillStyle = dark ? '#2c3440' : '#3c4654';
        roundRect(g, mx + 2, my, mw - 4, mh, 4);
        g.fill();
        const segs = 8;
        for (let s = 0; s < segs; s++) {
          const on = (s + 0.5) / segs <= lvl;
          g.fillStyle = on ? mixColor(S(2), S(3), 1 - lvl) : 'rgba(255,255,255,0.08)';
          g.fillRect(mx + 6, my + mh - 6 - ((s + 1) * (mh - 10)) / segs + 2, mw - 12, (mh - 10) / segs - 3);
        }
      }
      // Wechselrichter und Transformator
      const ix = cx + cw + r.w * 0.05;
      building(ix, ground - r.h * 0.18, r.w * 0.12, r.h * 0.18);
      text(g, '≈', ix + r.w * 0.06, ground - r.h * 0.11, { font: font(18, 800), color: dark ? '#1b2330' : '#2b3442' });
      // Leitung
      const lx = ix + r.w * 0.12;
      g.strokeStyle = dark ? 'rgba(200,210,225,0.6)' : 'rgba(60,70,90,0.5)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(lx, ground - r.h * 0.12);
      g.lineTo(r.x + r.w - 12, ground - r.h * 0.3);
      g.stroke();
      if (dir !== 0 && p.flow) {
        g.fillStyle = S(3);
        for (let i = 0; i < 8; i++) {
          const t = mod(flowT * 0.6 * -dir + i / 8, 1);
          const x = lx + (r.x + r.w - 10 - lx) * t;
          const y = ground - r.h * 0.12 + (-(r.h * 0.18)) * t;
          g.beginPath();
          g.arc(x, y, 2, 0, TAU);
          g.fill();
        }
      }
      // Mast am rechten Rand
      const mx = r.x + r.w - 12;
      g.strokeStyle = dark ? '#a8b2c0' : '#6b7584';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(mx - 8, ground);
      g.lineTo(mx, ground - r.h * 0.34);
      g.lineTo(mx + 8, ground);
      g.moveTo(mx - 10, ground - r.h * 0.3);
      g.lineTo(mx + 10, ground - r.h * 0.3);
      g.stroke();
      if (r.w >= 300) {
        const lf = font(small() ? 10.5 : 11.5, 700);
        haloText(tx('Batteriemodule (Lithium-Ionen)', 'Battery modules (lithium-ion)'), cx + cw / 2, ground + (r.y + r.h - ground) * 0.6, lf, theme.text);
        haloText(tx('Wechselrichter', 'Inverter'), ix + r.w * 0.06, ground + (r.y + r.h - ground) * 0.6, lf, theme.text);
      }
      g.restore();
      g.strokeStyle = withA(theme.text, theme.dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      drawStoreBadges(r);
    }

    function storeNumbers(): { e: number; out: number; inp: number; tc: number; td: number; rt: number } {
      if (p.sto === 'batt') {
        const b = battery(p.bcap);
        return { e: b.mwh, out: b.outMWh, inp: b.inMWh, tc: duration(b.inMWh, p.pp), td: duration(b.outMWh, p.pp), rt: b.roundTrip };
      }
      const s = pumpStorage(p.vol, p.hp);
      return { e: s.mwh, out: s.outMWh, inp: s.inMWh, tc: duration(s.inMWh, p.pp), td: duration(s.outMWh, p.pp), rt: s.roundTrip };
    }

    function drawStoreBadges(r: Rect): void {
      const theme = th();
      const n = storeNumbers();
      const sizeP = small() ? 11.5 : 13;
      const state = dir > 0 ? (p.sto === 'pump' ? tx('pumpt hoch', 'pumping up') : tx('lädt', 'charging')) : dir < 0 ? tx('erzeugt Strom', 'generating') : tx('in Ruhe', 'idle');
      const w1 = pill(r.x + 10, r.y + 10, `${tx('Füllstand', 'Level')} ${pct(soc, 0)}`, S(0), 'left', sizeP);
      pill(r.x + 10 + w1.w + 6, r.y + 10, state, dir > 0 ? S(4) : dir < 0 ? S(2) : theme.muted, 'left', sizeP);
      if (show()) pill(r.x + r.w - 10, r.y + 10, `E = ${un(n.e * soc, n.e * soc < 100 ? 1 : 0, 'MWh')}`, theme.text, 'right', sizeP, r);
    }

    function drawStoreCard(r: Rect): void {
      const theme = th();
      panel(r, S(0));
      const pad = 13;
      const x = r.x + pad;
      const w = r.w - 2 * pad;
      const n = storeNumbers();
      const fs = r.h < 210 ? 11 : 12.5;
      const lh = r.h < 210 ? 17 : 21;
      let y = r.y + 18;
      const title = p.sto === 'pump' ? tx('Pumpspeicherkraftwerk', 'Pumped-storage plant') : tx('Batteriespeicher', 'Battery storage');
      text(g, title, x, y, { font: font(fs + 2, 800), color: theme.text, align: 'left' });
      y += lh + 2;
      const lines: [string, string, string][] = [];
      if (p.sto === 'pump') {
        const s = pumpStorage(p.vol, p.hp);
        lines.push([`m = ρ · V`, `${sci(s.mass, 1)} kg`, S(0)]);
        lines.push([`E = m · g · h`, show() ? `${sci(s.joule, 2)} J` : '?', S(0)]);
        lines.push([`= E : 3,6 · 10⁹ J/MWh`.replace('3,6', de() ? '3,6' : '3.6'), show() ? un(s.mwh, 1, 'MWh') : '?', S(0)]);
      } else lines.push([tx('gespeichert E', 'stored E'), un(n.e, 0, 'MWh'), S(0)]);
      lines.push([`${tx('Laden', 'Charging')}: t = E_zu / P`, show() ? un(n.tc, 2, 'h') : '?', S(4)]);
      lines.push([`${tx('Entladen', 'Discharging')}: t = E_ab / P`, show() ? un(n.td, 2, 'h') : '?', S(2)]);
      lines.push([tx('Wirkungsgrad hin und zurück', 'Round-trip efficiency'), show() ? pct(n.rt, 0) : '?', theme.muted]);
      lines.push([tx('reicht für Haushalte (1 Tag)', 'households supplied (1 day)'), show() ? big((n.out * 1000) / HOUSEHOLD_DAY_KWH) : '?', S(3)]);
      const note =
        p.sto === 'pump'
          ? tx('Pumpen: elektrische Energie → Lageenergie des Wassers. Turbinieren: Lageenergie → elektrische Energie.', 'Pumping: electrical energy → potential energy of the water. Generating: potential energy → electrical energy.')
          : tx('Laden: elektrische Energie → chemische Energie in den Zellen. Entladen: zurück in elektrische Energie.', 'Charging: electrical energy → chemical energy in the cells. Discharging: back to electrical energy.');
      for (const [a, b, c] of lines) {
        if (y > r.y + r.h - 10) break;
        const aw = textW(a, font(fs, 500));
        if (aw + textW(b, font(fs, 700)) + 24 > w) {
          row(x, y, w, a, '', c, fs);
          y += lh - 3;
          text(g, b, x + w, y, { font: font(fs, 700), color: theme.text, align: 'right' });
        } else row(x, y, w, a, b, c, fs);
        y += lh;
      }
      y += 2;
      for (const ln of wrap(note, w, font(fs - 0.5, 500), 3)) {
        if (y > r.y + r.h - 10) break;
        text(g, ln, x, y, { font: font(fs - 0.5, 500), color: theme.muted, align: 'left' });
        y += lh - 4;
      }
    }

    function drawStoreChart(r: Rect): void {
      const theme = th();
      panel(r);
      const n = storeNumbers();
      const pad = { l: 46, r: 14, t: 50, b: 30 };
      const plotR: Rect = { x: r.x + pad.l, y: r.y + pad.t, w: r.w - pad.l - pad.r, h: r.h - pad.t - pad.b };
      const tMax = niceTop(Math.max(n.tc, n.td));
      const eTop = niceTop(n.e);
      const ax = axes(plotR, [0, ease2('stT', tMax, 7)], [0, ease2('stE', eTop, 7)]);
      chip(r.x + 10, r.y + 8, tx('Gespeicherte Energie über der Zeit', 'Stored energy against time'), theme.text, r.w < 360 ? 11 : 12);
      drawAxes(ax, { xStep: niceStep(ax.x1 / 5), yStep: niceStep(ax.y1 / (plotR.h > 120 ? 4 : 2)), xFmt: (v) => fmt.num(v, 2), yFmt: (v) => fmt.num(v, 0), xLabel: 't in h', yLabel: 'E in MWh' });
      g.save();
      g.beginPath();
      g.rect(plotR.x, plotR.y - 4, plotR.w + 4, plotR.h + 4);
      g.clip();
      g.lineWidth = 2.5;
      g.strokeStyle = withA(S(4), lastDir > 0 ? 0.95 : 0.45);
      g.beginPath();
      g.moveTo(ax.px(0), ax.py(0));
      g.lineTo(ax.px(n.tc), ax.py(n.e));
      g.stroke();
      g.strokeStyle = withA(S(2), lastDir < 0 ? 0.95 : 0.45);
      g.beginPath();
      g.moveTo(ax.px(0), ax.py(n.e));
      g.lineTo(ax.px(n.td), ax.py(0));
      g.stroke();
      // aktueller Zustand
      const tNow = lastDir > 0 ? soc * n.tc : (1 - soc) * n.td;
      g.fillStyle = lastDir > 0 ? S(4) : S(2);
      g.beginPath();
      g.arc(ax.px(tNow), ax.py(soc * n.e), 6, 0, TAU);
      g.fill();
      g.restore();
      if (show() && plotR.w > 200) {
        haloText(tx('laden', 'charge'), ax.px(n.tc * 0.82) - 8, ax.py(n.e * 0.82) - 2, font(11, 700), S(4), 'right');
        haloText(tx('entladen', 'discharge'), ax.px(n.td * 0.8) + 8, ax.py(n.e * 0.2) - 6, font(11, 700), S(2), 'left');
      }
    }

    function drawStoreView(): void {
      if (p.sto === 'batt') drawBatteryScene(lay.scene);
      else drawPumpScene(lay.scene);
      drawStoreCard(lay.card);
      drawStoreChart(lay.chart);
    }

    /* ================================================================== */
    /* Ansicht 4: Übertragung mit Hochspannung                             */
    /* ================================================================== */
    function drawTrafo(cx: number, cy: number, s: number, n1: number, n2: number, highlight: boolean): void {
      const theme = th();
      const dark = theme.dark;
      // Eisenkern
      g.fillStyle = dark ? '#5c6676' : '#8d97a5';
      roundRect(g, cx - s * 0.5, cy - s * 0.45, s, s * 0.9, 4);
      g.fill();
      g.fillStyle = dark ? '#1b2330' : '#eef1f5';
      g.fillRect(cx - s * 0.28, cy - s * 0.25, s * 0.56, s * 0.5);
      // Spulen
      const coil = (x: number, turns: number, color: string) => {
        const tN = clamp(Math.round(turns), 2, 16);
        g.strokeStyle = color;
        g.lineWidth = 2;
        for (let i = 0; i < tN; i++) {
          const y = cy - s * 0.4 + ((i + 0.5) * s * 0.8) / tN;
          g.beginPath();
          g.ellipse(x, y, s * 0.13, s * 0.03, 0, 0, TAU);
          g.stroke();
        }
      };
      coil(cx - s * 0.39, n1, S(3));
      coil(cx + s * 0.39, n2, S(0));
      if (highlight) {
        g.strokeStyle = S(0);
        g.lineWidth = 2;
        g.setLineDash([4, 3]);
        roundRect(g, cx - s * 0.62, cy - s * 0.58, s * 1.24, s * 1.16, 8);
        g.stroke();
        g.setLineDash([]);
      }
    }

    function drawGridScene(r: Rect, uS: number): void {
      const theme = th();
      const dark = theme.dark;
      const tr = transmit(p.pt, uS, p.len);
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      const sky = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      sky.addColorStop(0, dark ? '#13223a' : '#c4e4fb');
      sky.addColorStop(1, dark ? '#24364f' : '#f2f9ff');
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, r.h);
      const ground = r.y + r.h * 0.8;
      g.fillStyle = dark ? '#22392b' : '#a9d39a';
      g.fillRect(r.x, ground, r.w, r.y + r.h - ground);
      const sz = Math.min(r.h, r.w * 0.5);
      // Kraftwerk links
      const px0 = r.x + r.w * 0.02;
      building(px0, ground - sz * 0.22, r.w * 0.1, sz * 0.22, dark ? '#3c4552' : '#8f99a6');
      coolingTower(px0 + r.w * 0.05, ground - sz * 0.2, r.w * 0.06, sz * 0.18);
      // Transformator hoch
      const t1x = r.x + r.w * 0.17;
      const ts = Math.max(28, sz * 0.2);
      const ty = ground - ts * 0.7;
      const ratio = uS / U_GEN;
      const n1 = ratio >= 1 ? 3 : 3 / ratio;
      const n2 = ratio >= 1 ? 3 * ratio : 3;
      drawTrafo(t1x, ty, ts, n1, Math.min(16, n2), hoverId === 'trafo' || ctx.keyFocus === 'up' || ctx.keyFocus === 'down');
      addHit('trafo', { x: t1x - ts * 0.65, y: ty - ts * 0.6, w: ts * 1.3, h: ts * 1.2 });
      // Masten und Leitung
      const xA = t1x + ts * 0.6;
      const xB = r.x + r.w * 0.8;
      const masts = 4;
      const top = ground - sz * 0.64;
      const mx = Array.from({ length: masts }, (_, i) => xA + ((i + 0.5) * (xB - xA)) / masts);
      g.strokeStyle = dark ? '#a8b2c0' : '#6b7584';
      g.lineWidth = 1.5;
      for (const x of mx) {
        g.beginPath();
        g.moveTo(x - sz * 0.05, ground);
        g.lineTo(x, top - 6);
        g.lineTo(x + sz * 0.05, ground);
        g.moveTo(x - sz * 0.07, top + 4);
        g.lineTo(x + sz * 0.07, top + 4);
        g.moveTo(x - sz * 0.035, top + sz * 0.17);
        g.lineTo(x + sz * 0.035, top + sz * 0.17);
        g.stroke();
      }
      const pts: Pt[] = [[xA, ty - ts * 0.3], ...mx.map((x) => [x, top + 4] as Pt), [xB, ty - ts * 0.3]];
      /** Durchhang: zwischen den Masten 10 px, zu den Transformatoren keiner. */
      const sag = (i: number) => (i === 1 || i === pts.length - 1 ? 0 : 10);
      const heat = clamp(tr.share * 4, 0, 1);
      const wireCol = mixColor(dark ? '#cfd6e0' : '#4a5260', S(1), heat);
      if (heat > 0.05) {
        g.save();
        g.shadowColor = S(1);
        g.shadowBlur = 12 * heat;
        g.strokeStyle = withA(S(1), 0.5 * heat);
        g.lineWidth = 5;
        g.beginPath();
        pts.forEach((q, i) => {
          if (i === 0) g.moveTo(q[0], q[1]);
          else g.quadraticCurveTo((pts[i - 1]![0] + q[0]) / 2, (pts[i - 1]![1] + q[1]) / 2 + sag(i), q[0], q[1]);
        });
        g.stroke();
        g.restore();
      }
      g.strokeStyle = wireCol;
      g.lineWidth = 2;
      g.beginPath();
      pts.forEach((q, i) => {
        if (i === 0) g.moveTo(q[0], q[1]);
        else g.quadraticCurveTo((pts[i - 1]![0] + q[0]) / 2, (pts[i - 1]![1] + q[1]) / 2 + sag(i), q[0], q[1]);
      });
      g.stroke();
      // Punkte: Dichte ∝ Stromstärke
      if (p.flow) {
        const nDots = Math.round(clamp(tr.current / 60, 3, 70));
        const span = xB - xA;
        g.fillStyle = S(3);
        for (let i = 0; i < nDots; i++) {
          const d = mod(flowT * 50 + (i / nDots) * span, span);
          const x = xA + d;
          let j = 0;
          while (j < pts.length - 2 && x > pts[j + 1]![0]) j++;
          const a = pts[j]!;
          const b = pts[j + 1]!;
          const t = clamp((x - a[0]) / (b[0] - a[0]), 0, 1);
          const cy = (a[1] + b[1]) / 2 + sag(j + 1);
          const y = (1 - t) * (1 - t) * a[1] + 2 * (1 - t) * t * cy + t * t * b[1];
          g.beginPath();
          g.arc(x, y, 2.2, 0, TAU);
          g.fill();
        }
      }
      // Transformator runter und Stadt
      const t2x = r.x + r.w * 0.84;
      drawTrafo(t2x, ty, ts * 0.85, 3 * (uS / 20), 3, false);
      const town = r.x + r.w * 0.89;
      const rnd = seededRandom(5);
      for (let i = 0; i < 4; i++) {
        const hw = r.w * 0.024;
        const hh = sz * (0.07 + rnd() * 0.06);
        const hx = town + i * hw * 1.2;
        g.fillStyle = dark ? '#5b6676' : '#e6dccb';
        g.fillRect(hx, ground - hh, hw, hh);
        g.fillStyle = dark ? '#7a3b33' : '#c0574a';
        g.beginPath();
        g.moveTo(hx - 1.5, ground - hh);
        g.lineTo(hx + hw / 2, ground - hh - hw * 0.5);
        g.lineTo(hx + hw + 1.5, ground - hh);
        g.closePath();
        g.fill();
      }
      // Maßpfeil für die Länge
      const yDim = ground + (r.y + r.h - ground) * 0.45;
      g.strokeStyle = theme.muted;
      g.fillStyle = theme.muted;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(xA, yDim);
      g.lineTo(xB, yDim);
      g.stroke();
      for (const [x, s] of [
        [xA, 1],
        [xB, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(x, yDim);
        g.lineTo(x + 7 * s, yDim - 4);
        g.lineTo(x + 7 * s, yDim + 4);
        g.closePath();
        g.fill();
      }
      haloText(`${fmt.num(p.len, 0)} km · R = ${fmt.num(tr.r, 1)} Ω`, (xA + xB) / 2, yDim, font(small() ? 11 : 12, 700), theme.text);
      g.restore();
      g.strokeStyle = withA(theme.text, theme.dark ? 0.14 : 0.1);
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      // Anzeigen
      const sizeP = small() ? 11.5 : 13;
      const uLabel = `U = ${fmt.num(uS, 0)} kV`;
      const w1 = pill(r.x + 10, r.y + 10, uLabel, S(0), 'left', sizeP);
      if (show()) {
        const w2 = pill(r.x + 16 + w1.w, r.y + 10, `I = ${big(tr.current)} A`, S(3), 'left', sizeP);
        const lossS = `P_V = ${un(tr.loss, tr.loss < 10 ? 2 : 0, 'MW')} (${tr.share > 1 ? '> 100\u00a0%' : pct(tr.share, tr.share < 0.1 ? 1 : 0)})`;
        if (r.w - (w1.w + w2.w + 40) > textW(lossS, font(sizeP, 700)) + 20) pill(r.x + r.w - 10, r.y + 10, lossS, S(1), 'right', sizeP);
        else pill(r.x + 10, r.y + 16 + sizeP + 10, lossS, S(1), 'left', sizeP);
      }
      haloText(`${tx('Generator', 'Generator')} ${U_GEN} kV`, Math.max(r.x + 6, px0), ground + 12, font(10.5, 700), theme.muted, 'left');
      haloText(`1 : ${fmt.num(ratio, ratio < 10 ? 1 : 0)}`, t1x, ty + ts * 0.65, font(11, 800), S(0));
    }

    function drawGridChart(r: Rect, uS: number): void {
      const theme = th();
      panel(r);
      const pad = { l: 46, r: 14, t: 50, b: 30 };
      const plotR: Rect = { x: r.x + pad.l, y: r.y + pad.t, w: r.w - pad.l - pad.r, h: r.h - pad.t - pad.b };
      const share = (u: number) => transmit(p.pt, u, p.len).share * 100;
      const yTarget = clamp(niceTop(Math.max(share(p.u) * 2.4, share(380) * 3)), 1, 100);
      const yTop = ease2('gridTop', yTarget, 6);
      const ax = axes(plotR, [0, 400], [0, yTop]);
      chip(r.x + 10, r.y + 8, tx('Leitungsverluste P_V in % von P', 'Line losses P_V in % of P'), theme.text, r.w < 360 ? 11 : 12);
      drawAxes(ax, { xStep: 50, yStep: niceStep(yTop / (plotR.h > 130 ? 5 : 3)), xFmt: (v) => fmt.num(v, 0), yFmt: (v) => fmt.num(v, yTop < 5 ? 1 : 0), xLabel: 'U in kV', yLabel: '%', xMarks: [20, 110, 220, 380] });
      g.save();
      g.beginPath();
      g.rect(plotR.x, plotR.y, plotR.w, plotR.h);
      g.clip();
      // Fläche unter der Kurve
      g.beginPath();
      g.moveTo(ax.px(10), ax.py(0));
      for (let u = 10; u <= 400; u += 2) g.lineTo(ax.px(u), ax.py(Math.min(share(u), yTop * 1.5)));
      g.lineTo(ax.px(400), ax.py(0));
      g.closePath();
      g.fillStyle = withA(S(1), 0.12);
      g.fill();
      g.strokeStyle = S(1);
      g.lineWidth = 2.5;
      g.beginPath();
      for (let u = 10; u <= 400; u += 2) {
        const y = ax.py(Math.min(share(u), yTop * 1.5));
        if (u === 10) g.moveTo(ax.px(u), y);
        else g.lineTo(ax.px(u), y);
      }
      g.stroke();
      g.restore();
      // Marken 110/220/380
      for (const u of [110, 220, 380]) {
        const v = share(u);
        if (v > yTop) continue;
        g.fillStyle = withA(S(1), 0.7);
        g.beginPath();
        g.arc(ax.px(u), ax.py(v), 3, 0, TAU);
        g.fill();
        const lbl = `${fmt.num(v, v < 1 ? 2 : 1)} %`;
        const right = ax.px(u) + 5 + textW(lbl, font(10.5, 700)) < r.x + r.w - 4;
        if (show()) haloText(lbl, ax.px(u) + (right ? 5 : -5), ax.py(v) - 9, font(10.5, 700), theme.muted, right ? 'left' : 'right');
      }
      // aktueller Punkt (ziehbar)
      const v = share(uS);
      const y = ax.py(Math.min(v, yTop));
      g.strokeStyle = withA(S(0), 0.5);
      g.setLineDash([4, 3]);
      g.beginPath();
      g.moveTo(ax.px(uS), plotR.y + plotR.h);
      g.lineTo(ax.px(uS), y);
      g.stroke();
      g.setLineDash([]);
      const hov = hoverId === 'volt' || dragging === 'volt';
      g.fillStyle = S(0);
      g.beginPath();
      g.arc(ax.px(uS), y, hov ? 8 : 6.5, 0, TAU);
      g.fill();
      g.strokeStyle = theme.dark ? '#0f1722' : '#ffffff';
      g.lineWidth = 2;
      g.stroke();
      if (v > yTop && show()) haloText(`${fmt.num(v, 0)} % ↑`, ax.px(uS) + 8, plotR.y + 10, font(11, 800), S(1), 'left');
      addHit('volt', { x: plotR.x - 8, y: plotR.y - 8, w: plotR.w + 16, h: plotR.h + 16 }, 'ew-resize');
      gridAxes = ax;
    }
    let gridAxes: Axes | null = null;
    let dayAxes: Rect | null = null;

    function drawGridCard(r: Rect, uS: number): void {
      const theme = th();
      panel(r, S(1));
      const tr = transmit(p.pt, uS, p.len);
      const ref = transmit(p.pt, 380, p.len);
      const pad = 13;
      const x = r.x + pad;
      const w = r.w - 2 * pad;
      const fs = r.h < 200 ? 11 : 12.5;
      const lh = r.h < 200 ? 17 : 21;
      let y = r.y + 18;
      text(g, tx('Was in der Leitung passiert', 'What happens in the line'), x, y, { font: font(fs + 1.5, 800), color: theme.text, align: 'left' });
      y += lh + 2;
      const lines: [string, string, string][] = [
        ['I = P / U', show() ? `${un(p.pt, 0, 'MW')} / ${un(uS, 0, 'kV')} = ${big(tr.current)} A` : '?', S(3)],
        ['R = R′ · l', `${fmt.num(R_PER_KM, 1)} Ω/km · ${fmt.num(p.len, 0)} km = ${fmt.num(tr.r, 1)} Ω`, theme.muted],
        ['P_V = I² · R', show() ? un(tr.loss, tr.loss < 10 ? 2 : 1, 'MW') : '?', S(1)],
        [tx('kommt an', 'arrives'), show() ? `${un(tr.arrive, 1, 'MW')} (${pct(1 - Math.min(1, tr.share), 1)})` : '?', S(0)],
      ];
      if (Math.abs(uS - 380) > 1) lines.push([tx('bei 380 kV nur', 'at 380 kV only'), show() ? `${un(ref.loss, 2, 'MW')} (${fmt.num(lossRatio(uS, 380), 1)} × ${tx('weniger', 'less')})` : '?', S(2)]);
      for (const [a, b, c] of lines) {
        if (y > r.y + r.h - 10) break;
        const af = font(fs, 500);
        const need = textW(a, af) + textW(b, font(fs, 700)) + 24;
        if (need > w) {
          dot(x + 5, y, c, 4);
          subText(g, a, x + 15, y, { size: fs, family: theme.font, weight: 600, color: theme.text, align: 'left' });
          y += lh - 3;
          text(g, b, x + w, y, { font: font(fs, 700), color: theme.text, align: 'right' });
        } else {
          dot(x + 5, y, c, 4);
          subText(g, a, x + 15, y, { size: fs, family: theme.font, weight: 600, color: theme.text, align: 'left' });
          text(g, b, x + w, y, { font: font(fs, 700), color: theme.text, align: 'right' });
        }
        y += lh;
      }
      if (y < r.y + r.h - 14) {
        for (const ln of wrap(tx('Doppelte Spannung → halber Strom → nur ein Viertel der Verluste.', 'Double the voltage → half the current → only a quarter of the losses.'), w, font(fs - 0.5, 600), 2)) {
          if (y > r.y + r.h - 10) break;
          text(g, ln, x, y, { font: font(fs - 0.5, 600), color: theme.muted, align: 'left' });
          y += lh - 4;
        }
      }
    }

    function drawGridView(): void {
      const uS = ease2('u', p.u, dragging === 'volt' ? 20 : 8);
      drawGridScene(lay.scene, uS);
      drawGridChart(lay.chart, uS);
      drawGridCard(lay.card, uS);
    }

    /* ================================================================== */
    /* Ergebnisse                                                          */
    /* ================================================================== */
    const v_ = (name: string, sub = '') => `<var>${name}</var>${sub ? `<sub>${sub}</sub>` : ''}`;
    function updateReadouts(): void {
      const m = p.mode as Mode;
      const keys = ['chain', 'pel', 'energy', 'kind', 'now', 'day', 'store', 'time', 'line', 'cmp'];
      for (const k of keys) ctx.readout(k, null);
      if (m === 'plant') {
        const plant = PLANTS[src()];
        const c = plantChain(src(), p.pin, p.chp);
        const etas = c.steps.map((s) => fmt.num(s.stage.eta, 3)).join(' · ');
        ctx.readout('chain', { html: `${v_('η')} = ${v_('η', '1')} · ${v_('η', '2')} · … = ${etas} ${fmt.rel(c.eta, 3)} <strong>${pct(c.eta, 1)}</strong>` });
        const heat = c.heat > 0 ? `<br>${tx('Heizwärme (Kraft-Wärme-Kopplung)', 'Heating (combined heat and power)')}: ${un(c.heat, 0, 'MW')} · ${tx('Nutzungsgrad', 'overall utilisation')} (${v_('P', 'el')} + ${v_('P', 'Wärme')}) / ${v_('P', 'zu')} ${fmt.rel(c.usage, 3)} ${pct(c.usage, 0)}` : '';
        ctx.readout('pel', {
          html: `${v_('P', 'el')} = ${v_('η')} · ${v_('P', 'zu')} = ${fmt.num(c.eta, 3)} · ${un(c.pin, 0, 'MW')} ${fmt.rel(c.pel, 0)} <strong>${un(c.pel, 0, 'MW')}</strong> · ${tx('Verluste', 'losses')} ${un(c.lost, 0, 'MW')}${heat}`,
        });
        const e = energy(c.pel, p.dur);
        const co2 = co2Kg(e * 1000, plant.co2) / 1000;
        ctx.readout('energy', {
          html: `${v_('E')} = ${v_('P')} · ${v_('t')} = ${un(c.pel, 0, 'MW')} · ${un(p.dur, 0, 'h')} = <strong>${un(e, 0, 'MWh')}</strong> ${tx('(Jahresbedarf von', '(annual demand of')} ${big(householdsYear(e * 1000))} ${tx('Haushalten)', 'households)')}<br>CO₂: ${un(e, 0, 'MWh')} · ${plant.co2} g/kWh ≈ ${un(co2, co2 < 10 ? 1 : 0, 't')}`,
        });
        ctx.readout('kind', `${loc(plant.carrier)}: ${loc(plant.note)}. ${tx('CO₂ gerundet, Lebenszyklus (IPCC 2014).', 'CO₂ rounded, life cycle (IPCC 2014).')}`);
      } else if (m === 'day') {
        updateNow();
        const t = day.totals;
        ctx.readout('day', {
          html: `${tx('Last', 'Load')} ${un(t.load, 0, 'GWh')} · ${tx('Sonne', 'Solar')} ${un(t.pv, 0, 'GWh')} · Wind ${un(t.wind, 0, 'GWh')} · ${tx('Gas', 'Gas')} ${un(t.gas, 0, 'GWh')} (${tx('höchstens', 'peak')} ${un(day.gasPeak, 1, 'GW')})<br>${tx('Speicher geladen', 'Storage charged')} ${un(t.charge, 1, 'GWh')}, ${tx('entladen', 'discharged')} ${un(t.discharge, 1, 'GWh')} · ${tx('Überschuss (Export/abgeregelt)', 'Surplus (exported/curtailed)')} ${un(t.surplus, 1, 'GWh')}<br>${tx('Erneuerbar', 'Renewable')} <strong>${pct(day.renewShare, 0)}</strong> · CO₂ ≈ ${big(day.co2)} t (${fmt.num(day.intensity, 0)} g/kWh) · ${v_('E')} = Σ ${v_('P')} · Δ${v_('t')} ${tx('mit', 'with')} Δ${v_('t')} = 15 min`,
        });
      } else if (m === 'store') {
        const n = storeNumbers();
        if (p.sto === 'pump') {
          const s = pumpStorage(p.vol, p.hp);
          ctx.readout('store', {
            html: `${v_('m')} = ρ · ${v_('V')} = 1000 kg/m³ · ${fmt.num(p.vol, 1)} · 10⁶ m³ = ${sci(s.mass, 1)} kg<br>${v_('E')} = ${v_('m')} · ${v_('g')} · ${v_('h')} = ${sci(s.mass, 1)} kg · ${fmt.num(G, 2)} m/s² · ${un(p.hp, 0, 'm')} ${fmt.rel(s.joule / 1e12, 2)} ${sci(s.joule, 2)} J = <strong>${un(s.mwh, 1, 'MWh')}</strong>`,
          });
        } else ctx.readout('store', { html: `${v_('E')} = ${un(n.e, 0, 'MWh')} · ${tx('Wirkungsgrad Laden und Entladen je', 'efficiency charging and discharging each')} ${pct(BATT_ETA.charge, 0)}` });
        const etaIn = p.sto === 'pump' ? PUMP_ETA.pump : BATT_ETA.charge;
        const etaOut = p.sto === 'pump' ? PUMP_ETA.turbine : BATT_ETA.discharge;
        ctx.readout('time', {
          html: `${tx('Laden', 'Charging')}: ${v_('E', 'zu')} = ${v_('E')} / ${fmt.num(etaIn, 2)} = ${un(n.inp, 0, 'MWh')}, ${v_('t')} = ${v_('E', 'zu')} / ${v_('P')} = ${un(n.inp, 0, 'MWh')} / ${un(p.pp, 0, 'MW')} ${fmt.rel(n.tc, 2)} <strong>${un(n.tc, 2, 'h')}</strong><br>${tx('Entladen', 'Discharging')}: ${v_('E', 'ab')} = ${fmt.num(etaOut, 2)} · ${v_('E')} = ${un(n.out, 0, 'MWh')}, ${v_('t')} = ${un(n.out, 0, 'MWh')} / ${un(p.pp, 0, 'MW')} ${fmt.rel(n.td, 2)} <strong>${un(n.td, 2, 'h')}</strong> · ${tx('hin und zurück', 'round trip')} ${pct(n.rt, 0)}`,
        });
      } else {
        const tr = transmit(p.pt, p.u, p.len);
        ctx.readout('line', {
          html: `${v_('I')} = ${v_('P')} / ${v_('U')} = ${un(p.pt, 0, 'MW')} / ${un(p.u, 0, 'kV')} ${fmt.rel(tr.current, 0)} ${big(tr.current)} A · ${v_('R')} = ${fmt.num(tr.r, 1)} Ω<br>${v_('P', 'V')} = ${v_('I')}² · ${v_('R')} = (${big(tr.current)} A)² · ${fmt.num(tr.r, 1)} Ω ${fmt.rel(tr.loss, 2)} <strong>${un(tr.loss, 2, 'MW')}</strong> (${pct(tr.share, 2)} ${tx('von', 'of')} ${v_('P')})${tr.share >= 1 ? ` – ${tx('mehr als die ganze Leistung: Bei so kleiner Spannung käme nichts an.', 'more than the whole power: at such a low voltage nothing would arrive.')}` : ''}`,
        });
        const levels = [20, 110, 220, 380].map((u) => `${u} kV: ${un(transmit(p.pt, u, p.len).loss, 2, 'MW')}`).join(' · ');
        ctx.readout('cmp', { html: `${levels}<br>${tx('Gleiche Leistung, gleiches', 'Same power, same')} ${v_('R')}: ${v_('P', 'V')} ∼ 1/${v_('U')}² (110 kV → 380 kV: ${fmt.num(lossRatio(110, 380), 1)}-${tx('mal kleiner', 'times smaller')})` });
      }
    }
    function updateNow(): void {
      if ((p.mode as Mode) !== 'day') return;
      const st = stepAt(day, hour);
      const hh = Math.floor(hour);
      const mm = Math.floor(((hour - hh) * 60) / 15) * 15;
      const share = st.load > 0 ? (st.pv + st.wind + st.hydro + st.bio) / (st.load + st.charge + st.surplus) : 0;
      ctx.readout(
        'now',
        `${String(hh % 24).padStart(2, '0')}:${String(mm).padStart(2, '0')} · ${tx('Last', 'load')} ${un(st.load, 1, 'GW')} · ${tx('Sonne', 'solar')} ${un(st.pv, 1, 'GW')} · Wind ${un(st.wind, 1, 'GW')} · ${tx('Gas', 'gas')} ${un(st.gas, 1, 'GW')} · ${tx('erneuerbar', 'renewable')} ${pct(Math.min(1, share), 0)}`,
      );
    }

    /* ================================================================== */
    /* Zeiger: Antippen und Ziehen                                         */
    /* ================================================================== */
    function hitAt(x: number, y: number): { id: string; r: Rect; cursor: string } | null {
      for (let i = hits.length - 1; i >= 0; i--) if (inRect(hits[i]!.r, x, y)) return hits[i]!;
      return null;
    }
    function selectPlant(id: PlantId): void {
      if (ctx.locked) return;
      if (id !== src()) ctx.set({ src: id });
      ctx.announce(`${loc(PLANTS[id].name)}: η ${fmt.rel(plantChain(id, 100).eta, 3)} ${pct(plantChain(id, 100).eta, 0)}`);
    }
    function tapStage(i: number): void {
      sel = sel === i ? -1 : i;
      const st = plantChain(src(), p.pin, p.chp).steps[i];
      if (st && sel >= 0) ctx.announce(`${loc(st.stage.device)}: η = ${pct(st.stage.eta, 0)}, ${tx('Verlust', 'loss')} ${un(st.loss, 0, 'MW')}`);
      ctx.requestRender();
    }
    function stepVoltage(d: number): void {
      if (ctx.locked) return;
      const cur = p.u;
      const next = d > 0 ? (LEVELS.find((u) => u > cur + 0.5) ?? LEVELS[LEVELS.length - 1]!) : ([...LEVELS].reverse().find((u) => u < cur - 0.5) ?? LEVELS[0]!);
      ctx.set({ u: next });
      ctx.announce(`U = ${next} kV, ${tx('Verlust', 'loss')} ${un(transmit(p.pt, next, p.len).loss, 2, 'MW')}`);
    }
    function setHourFrom(px: number): void {
      const r = dayAxes;
      if (!r) return;
      hour = clamp(((px - r.x) / r.w) * 24, 0, 23.99);
      ctx.clock.pause();
      updateNow();
      ctx.requestRender();
    }
    function setBasinFrom(py: number): void {
      const geo = pumpGeom(lay.scene);
      const depth = Math.max(20, Math.min(44, lay.scene.h * 0.085));
      const h = (geo.base - (py + depth * 0.5)) / geo.k;
      ctx.set({ hp: clamp(h, 20, 800) });
    }
    function setVoltFrom(px: number): void {
      if (!gridAxes) return;
      ctx.set({ u: clamp(gridAxes.wx(px), 10, 400) });
    }

    surface.addTarget({
      contains: (x, y) => hitAt(x, y) !== null,
      pointerDown: (q) => {
        const h = hitAt(q.px, q.py);
        if (!h) return false;
        const id = h.id;
        if (id === 'time') {
          dragging = 'time';
          setHourFrom(q.px);
          return true;
        }
        if (ctx.locked) return id.startsWith('stage:');
        if (id === 'basin') {
          dragging = 'basin';
          return true;
        }
        if (id === 'volt') {
          dragging = 'volt';
          setVoltFrom(q.px);
          return true;
        }
        if (id.startsWith('src:') || id.startsWith('row:')) selectPlant(id.slice(4) as PlantId);
        else if (id.startsWith('stage:')) tapStage(Number(id.slice(6)));
        else if (id === 'trafo') stepVoltage(1);
        ctx.requestRender();
        return true;
      },
      pointerMove: (q) => {
        if (dragging === 'time') setHourFrom(q.px);
        else if (dragging === 'basin') setBasinFrom(q.py);
        else if (dragging === 'volt') setVoltFrom(q.px);
      },
      pointerUp: () => {
        dragging = null;
        ctx.requestRender();
      },
      hover: (q) => {
        const h = q ? hitAt(q.px, q.py) : null;
        const id = h && (!ctx.locked || h.id === 'time' || h.id.startsWith('stage:')) ? h.id : null;
        if (id !== hoverId) {
          hoverId = id;
          ctx.requestRender();
        }
        surface.setCursor(id && h ? h.cursor : '');
      },
      wheel: () => false,
    });

    /** Tastatur: antippbare Dinge je Ansicht. */
    function keyTargets(): void {
      const m = mode();
      if (m === 'plant') {
        const steps = plantChain(src(), p.pin, p.chp).steps;
        ctx.setKeyTargets([
          ...PLANT_IDS.map((id) => ({ id: `src:${id}`, label: loc(PLANTS[id].name), disabled: ctx.locked, rect: hits.find((h) => h.id === `src:${id}`)?.r, activate: () => selectPlant(id) })),
          ...steps.map((s, i) => ({ id: `stage:${i}`, label: `${tx('Stufe', 'Stage')} ${i + 1}: ${loc(s.stage.device)}`, rect: hits.filter((h) => h.id === `stage:${i}`).pop()?.r, activate: () => tapStage(i) })),
        ]);
      } else if (m === 'day') {
        ctx.setKeyTargets([
          { id: 'back', label: tx('Eine Stunde zurück', 'One hour back'), activate: () => stepHour(-1) },
          { id: 'fwd', label: tx('Eine Stunde vor', 'One hour forward'), activate: () => stepHour(1) },
        ]);
      } else if (m === 'grid') {
        const r = hits.find((h) => h.id === 'trafo')?.r;
        ctx.setKeyTargets([
          { id: 'up', label: tx('Spannung erhöhen (Transformator)', 'Raise the voltage (transformer)'), rect: r, disabled: ctx.locked, activate: () => stepVoltage(1) },
          { id: 'down', label: tx('Spannung verringern', 'Lower the voltage'), rect: r, disabled: ctx.locked, activate: () => stepVoltage(-1) },
        ]);
      } else ctx.setKeyTargets([]);
    }
    function stepHour(d: number): void {
      ctx.clock.pause();
      hour = mod(Math.floor(hour) + d, 24);
      updateNow();
      ctx.announce(`${hour}:00 – ${tx('Last', 'load')} ${un(stepAt(day, hour).load, 1, 'GW')}`);
      ctx.requestRender();
    }

    /* ================================================================== */
    /* Ablauf                                                              */
    /* ================================================================== */
    function recomputeDay(animate: boolean): void {
      const before = shownArrays();
      day = simulateDay(mixParams());
      dayFrom = animate ? before : null;
      dayTo = arraysOf(day);
      if (animate) dayTw.play();
    }
    function storeActionLabels(): void {
      const pump = p.sto === 'pump';
      ctx.setAction('charge', { label: pump ? tx('Hochpumpen (laden)', 'Pump up (charge)') : tx('Laden', 'Charge') });
      ctx.setAction('discharge', { label: pump ? tx('Turbinieren (entladen)', 'Generate (discharge)') : tx('Entladen', 'Discharge') });
    }
    /** Läuft die Uhr in dieser Ansicht von selbst (Energiefluss)? */
    function autoplay(): void {
      if (prefersReducedMotion() || ctx.locked) return;
      const m = p.mode as Mode;
      queueMicrotask(() => {
        if (m === 'plant' || m === 'grid') {
          if (!ctx.clock.playing) ctx.clock.play();
        } else if (m === 'day' || (m === 'store' && dir === 0)) ctx.clock.pause();
      });
    }

    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (changed.has('mode') && source !== 'init' && lastMode !== p.mode) {
          prevMode = lastMode;
          modeTw.play();
          sel = -1;
        }
        lastMode = p.mode as Mode;
        if (changed.has('src') && source !== 'init' && prevSrc !== src()) {
          srcTw.play();
          pop.play();
          sel = -1;
        }
        if (!srcTw.running) prevSrc = src();
        const dayKeys = ['sea', 'sun', 'wind', 'base', 'cap', 'spw'];
        if (source === 'init') {
          recomputeDay(false);
          intro.play();
        } else if (dayKeys.some((k) => changed.has(k))) recomputeDay(true);
        if (source === 'replace') {
          dir = 0;
          soc = 0.62;
          hour = 13;
          sel = -1;
          intro.play();
        }
        if (changed.has('sto') || changed.has('hp') || changed.has('vol') || changed.has('bcap') || changed.has('pp')) {
          if (changed.has('sto')) {
            dir = 0;
            soc = 0.62;
          }
        }
        if (changed.has('mode') || source === 'replace') autoplay();
        storeActionLabels();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          if (hour >= 23.9) hour = 0;
          ctx.clock.play();
        } else if (id === 'charge' || id === 'discharge') {
          dir = id === 'charge' ? 1 : -1;
          lastDir = dir;
          saidFull = false;
          if ((dir > 0 && soc >= 0.999) || (dir < 0 && soc <= 0.001)) soc = dir > 0 ? 0 : 1;
          ctx.clock.play();
        }
        ctx.requestRender();
      },

      tick(dt) {
        const d = dt * (p.slow ? 0.25 : 1);
        flowT += d;
        const m = p.mode as Mode;
        if (m === 'day') {
          hour += (d / DAY_SPEED);
          rotor += d * (0.6 + 7 * (stepAt(day, Math.min(23.99, hour)).wind / MIX.windInstalled));
          if (hour >= 23.99) {
            hour = 23.99;
            ctx.clock.pause();
          }
          updateNow();
        } else if (m === 'store' && dir !== 0) {
          soc = clamp(soc + (dir * d) / STORE_ANIM, 0, 1);
          if ((dir > 0 && soc >= 1) || (dir < 0 && soc <= 0)) {
            if (!saidFull) ctx.announce(dir > 0 ? tx('Der Speicher ist voll.', 'The storage is full.') : tx('Der Speicher ist leer.', 'The storage is empty.'));
            saidFull = true;
            dir = 0;
          }
        }
      },

      resetTime() {
        flowT = 0;
        hour = (p.mode as Mode) === 'day' ? 0 : 13;
        soc = 0.62;
        dir = 0;
        updateNow();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        surface.begin();
        hits = [];
        const k = modeTw.running ? modeTw.value : 1;
        const drawMode: Mode = modeTw.running && k < 0.5 ? prevMode : (p.mode as Mode);
        const alpha = modeTw.running ? (k < 0.5 ? 1 - 2 * k : 2 * k - 1) : 1;
        shownMode = drawMode;
        lay = computeLayout(drawMode);
        g.save();
        g.globalAlpha = alpha;
        g.translate(0, (1 - alpha) * 8 + (1 - introK()) * 8);
        if (drawMode === 'plant') drawPlantView();
        else if (drawMode === 'day') {
          dayAxes = null;
          drawDayView();
          const tHit = hits.find((h) => h.id === 'time');
          if (tHit) dayAxes = { x: tHit.r.x + 6, y: tHit.r.y, w: tHit.r.w - 12, h: tHit.r.h };
        } else if (drawMode === 'store') drawStoreView();
        else drawGridView();
        g.restore();
        keyTargets();
        shownMode = null;
        if (!srcTw.running) prevSrc = src();
        if (animating || intro.running || modeTw.running || srcTw.running || dayTw.running || pop.running) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
