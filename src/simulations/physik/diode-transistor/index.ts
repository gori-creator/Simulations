import {
  clamp,
  defineSimulation,
  drawCard,
  ease,
  measureSubText,
  mixColor,
  prefersReducedMotion,
  roundRect,
  seededRandom,
  subText,
  Surface,
  Tween,
  withAlpha,
  type Rect,
  type SubTextStyle,
} from '../../../sim-core';
import {
  collectorLimit,
  decadeVoltage,
  depletionWidth,
  diodeCircuit,
  diodeCurrent,
  DIODES,
  frequencyOf,
  isLed,
  LAMP_R,
  LED_IDS,
  luxFromLevel,
  photonEnergyEV,
  planckFromLeds,
  RB_DIV,
  RB_KEY,
  rectifierWave,
  rectMean,
  rectPeak,
  rippleEstimate,
  rms,
  signalBase,
  sourceForDiodeVoltage,
  switchCircuit,
  thermalVoltage,
  thresholdVoltage,
  transistor,
  B_SWITCH,
  U_B,
  U_CE_SAT,
  U_F,
  type DiodeId,
  type DiodeOp,
  type RectKind,
  type RectWave,
  type SwitchOp,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
type Pt = [number, number];
type Mode = 'diode' | 'pn' | 'led' | 'rect' | 'switch' | 'amp';

/** Höchste Spannung des Netzgeräts in V. */
const U_MAX = 6;

/** Natürliche Lichtfarben der Leuchtdioden (Gegenstände, nicht Diagrammfarben). */
const LED_LIGHT: Record<string, string> = { red: '#ff3b30', yel: '#ffc21a', grn: '#38d26a', blu: '#3d7bff' };

interface Lay {
  wide: boolean;
  scene: Rect;
  chart: Rect;
  card: Rect;
}

interface Measurement {
  d: DiodeId;
  Ud: number;
  I: number;
}

interface Hit {
  id: string;
  label: string;
  r: Rect;
  act: () => void;
}

interface Carrier {
  x: number;
  y: number;
  a: number;
  /** 0: frei; > 0: wandert gerade durch die Sperrschicht (Restweg in px). */
  cross: number;
}

/** Linienzug mit Bogenlänge (für die Ladungsträger in den Leitungen). */
class Path {
  readonly cum: number[] = [0];
  readonly length: number;
  constructor(readonly pts: Pt[]) {
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1]! + Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]));
    this.length = this.cum[this.cum.length - 1]!;
  }
  at(s: number): Pt {
    const t = ((s % this.length) + this.length) % this.length;
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i]! < t) i++;
    const a = this.pts[i - 1]!;
    const b = this.pts[i]!;
    const seg = this.cum[i]! - this.cum[i - 1]! || 1;
    const u = (t - this.cum[i - 1]!) / seg;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  }
}

/** Schöne Zahl ≥ v aus der Reihe 1 – 1,5 – 2 – 2,5 – 3 – 4 – 5 – 6 – 8 – 10. */
function niceCeil(v: number): number {
  if (!(v > 0)) return 1;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= v * 0.999) return m * e;
  return 10 * e;
}
/** Teilstrich-Abstand (1 – 2 – 2,5 – 5) für höchstens `max` Abschnitte. */
function niceStep(span: number, max: number): number {
  const raw = span / max;
  const e = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * e >= raw * 0.999) return m * e;
  return 10 * e;
}
/** Sichtbare Geschwindigkeit der Ladungsträger (px/s): logarithmisch mit der Stromstärke. */
function flowSpeed(I: number): number {
  const a = Math.abs(I);
  if (a < 1e-7) return 0;
  return Math.sign(I) * 70 * Math.min(1.25, Math.log10(1 + a / 1e-5) / 4);
}
/** Anteil 0 … 1 für Leuchten und Drift (logarithmisch, 1 µA … 50 mA). */
function level(I: number): number {
  return clamp(Math.log10(1 + Math.max(0, I) / 1e-6) / Math.log10(1 + 0.05 / 1e-6), 0, 1);
}

const DIODE_LABEL: Record<DiodeId, { de: string; en: string }> = {
  si: L('Siliziumdiode', 'Silicon diode'),
  ge: L('Germaniumdiode', 'Germanium diode'),
  red: L('rote LED', 'red LED'),
  yel: L('gelbe LED', 'yellow LED'),
  grn: L('grüne LED', 'green LED'),
  blu: L('blaue LED', 'blue LED'),
};

/**
 * Diode und Transistor: Kennlinie einer Diode aufnehmen (Durchlass- und
 * Sperrrichtung, Schleusenspannung, Messreihe), pn-Übergang im Teilchenmodell
 * (Löcher, Elektronen, Sperrschicht), Leuchtdioden (Farbe und Schwellspannung,
 * plancksches Wirkungsquantum), Einweg- und Brückengleichrichter mit
 * Oszilloskop und Glättungskondensator, Transistor als Schalter (Taster,
 * Dämmerungsschalter mit LDR) und als Verstärker (I_C = B · I_B, Sättigung).
 */
export default defineSimulation({
  id: 'diode-transistor',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.54 },
  hint: (v: { readonly mode?: unknown; readonly bs?: unknown }) =>
    v.mode === 'diode'
      ? L('Tipp: Den Arbeitspunkt im Diagramm ziehen, die Diode im Bild antippen (umdrehen).', 'Tip: Drag the operating point in the graph, tap the diode in the picture (turn it round).')
      : v.mode === 'pn'
        ? L('Tipp: Die Batterie antippen, um sie umzupolen.', 'Tip: Tap the battery to reverse it.')
        : v.mode === 'led'
          ? L('Tipp: Eine LED antippen, um ihre Kennlinie hervorzuheben; den Punkt im Diagramm ziehen.', 'Tip: Tap an LED to highlight its characteristic; drag the point in the graph.')
          : v.mode === 'rect'
            ? L('Tipp: Gleichrichter oder Kondensator im Bild antippen.', 'Tip: Tap the rectifier or the capacitor in the picture.')
            : v.mode === 'switch'
              ? v.bs === 'ldr'
                ? L('Tipp: Am Himmel ziehen, um es heller oder dunkler zu machen.', 'Tip: Drag in the sky to make it brighter or darker.')
                : L('Tipp: Den Taster im Bild antippen.', 'Tip: Tap the push button in the picture.')
              : L('Tipp: Den Arbeitspunkt auf der Kennlinie ziehen.', 'Tip: Drag the operating point along the characteristic.'),
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'diode', label: L('Kennlinie der Diode', 'Diode characteristic') },
        { value: 'pn', label: L('Halbleiter-Modell (pn-Übergang)', 'Semiconductor model (pn junction)') },
        { value: 'led', label: L('Leuchtdioden: Farbe und Spannung', 'LEDs: colour and voltage') },
        { value: 'rect', label: L('Gleichrichter', 'Rectifier') },
        { value: 'switch', label: L('Transistor als Schalter', 'Transistor as a switch') },
        { value: 'amp', label: L('Transistor als Verstärker', 'Transistor as an amplifier') },
      ],
      default: 'diode',
    },
    {
      key: 'd',
      type: 'choice',
      label: L('Bauteil', 'Component'),
      options: [
        { value: 'si', label: L('Siliziumdiode', 'Silicon diode') },
        { value: 'ge', label: L('Germaniumdiode', 'Germanium diode') },
        { value: 'red', label: L('LED rot (625 nm)', 'LED red (625 nm)') },
        { value: 'yel', label: L('LED gelb (590 nm)', 'LED yellow (590 nm)') },
        { value: 'grn', label: L('LED grün (565 nm)', 'LED green (565 nm)') },
        { value: 'blu', label: L('LED blau (470 nm)', 'LED blue (470 nm)') },
      ],
      default: 'si',
      visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn' || v.mode === 'led',
    },
    {
      key: 'U',
      type: 'number',
      label: L('Spannung U₀ am Netzgerät', 'Supply voltage U₀'),
      help: L('Oder: den Arbeitspunkt im Diagramm ziehen.', 'Or drag the operating point in the graph.'),
      min: 0,
      max: U_MAX,
      step: 0.01,
      default: 2,
      unit: 'V',
      visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn' || v.mode === 'led',
    },
    {
      key: 'flip',
      type: 'boolean',
      label: L('Diode umgedreht (Sperrrichtung)', 'Diode reversed (reverse bias)'),
      help: L('Oder: die Diode bzw. die Batterie im Bild antippen.', 'Or tap the diode or the battery in the picture.'),
      default: false,
      visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn',
    },
    { key: 'R', type: 'number', label: L('Vorwiderstand R', 'Series resistor R'), min: 10, max: 1000, step: 10, default: 100, unit: 'Ω', visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn' || v.mode === 'led' },
    {
      key: 'rc',
      type: 'choice',
      label: L('Schaltung', 'Circuit'),
      options: [
        { value: 'half', label: L('Einweggleichrichter (1 Diode)', 'Half-wave rectifier (1 diode)') },
        { value: 'bridge', label: L('Brückengleichrichter (4 Dioden)', 'Bridge rectifier (4 diodes)') },
      ],
      default: 'half',
      visibleIf: (v) => v.mode === 'rect',
    },
    { key: 'Uh', type: 'number', label: L('Scheitelwert Û der Wechselspannung', 'Peak value Û of the AC voltage'), min: 2, max: 15, step: 0.5, default: 10, unit: 'V', visibleIf: (v) => v.mode === 'rect' },
    { key: 'cap', type: 'boolean', label: L('Glättungskondensator', 'Smoothing capacitor'), default: false, visibleIf: (v) => v.mode === 'rect' },
    { key: 'C', type: 'number', label: L('Kapazität C', 'Capacitance C'), min: 10, max: 2000, step: 10, default: 470, unit: 'µF', visibleIf: (v) => v.mode === 'rect' && v.cap === true },
    { key: 'RL', type: 'number', label: L('Lastwiderstand R_L', 'Load resistor R_L'), min: 0.1, max: 10, step: 0.1, default: 1, unit: 'kΩ', visibleIf: (v) => v.mode === 'rect' },
    {
      key: 'bs',
      type: 'choice',
      label: L('Basis gesteuert durch', 'Base controlled by'),
      options: [
        { value: 'key', label: L('Taster', 'Push button') },
        { value: 'ldr', label: L('Fotowiderstand (Dämmerungsschalter)', 'Photoresistor (twilight switch)') },
      ],
      default: 'key',
      visibleIf: (v) => v.mode === 'switch',
    },
    { key: 'on', type: 'boolean', label: L('Taster gedrückt', 'Button pressed'), help: L('Oder: den Taster im Bild antippen.', 'Or tap the button in the picture.'), default: false, visibleIf: (v) => v.mode === 'switch' && v.bs === 'key' },
    { key: 'E', type: 'number', label: L('Helligkeit', 'Brightness'), help: L('0 % ≈ 0,1 lx (Nacht) … 100 % = 1000 lx (heller Tag); oder am Himmel im Bild ziehen.', '0 % ≈ 0.1 lx (night) … 100 % = 1000 lx (bright day); or drag in the sky in the picture.'), min: 0, max: 100, step: 1, default: 80, unit: '%', visibleIf: (v) => v.mode === 'switch' && v.bs === 'ldr' },
    { key: 'R1', type: 'number', label: L('Einstellwiderstand R₁', 'Adjustable resistor R₁'), min: 10, max: 220, step: 1, default: 47, unit: 'kΩ', visibleIf: (v) => v.mode === 'switch' && v.bs === 'ldr' },
    { key: 'IB', type: 'number', label: L('Basisstrom I_B (Arbeitspunkt)', 'Base current I_B (operating point)'), help: L('Oder: den Arbeitspunkt im Diagramm ziehen.', 'Or drag the operating point in the graph.'), min: 0, max: 0.5, step: 0.005, default: 0.1, unit: 'mA', visibleIf: (v) => v.mode === 'amp' },
    { key: 'B', type: 'number', label: L('Stromverstärkung B', 'Current gain B'), min: 20, max: 500, step: 10, default: 100, visibleIf: (v) => v.mode === 'amp' },
    { key: 'RC', type: 'number', label: L('Kollektorwiderstand R_C', 'Collector resistor R_C'), min: 100, max: 2000, step: 10, default: 470, unit: 'Ω', visibleIf: (v) => v.mode === 'amp' },
    { key: 'ac', type: 'boolean', label: L('Wechselsignal an der Basis', 'AC signal at the base'), default: true, visibleIf: (v) => v.mode === 'amp' },
    { key: 'ib', type: 'number', label: L('Amplitude î_B des Signals', 'Signal amplitude î_B'), min: 0.005, max: 0.2, step: 0.005, default: 0.04, unit: 'mA', visibleIf: (v) => v.mode === 'amp' && v.ac === true },
    { key: 'curve', type: 'boolean', group: 'view', label: L('Kennlinie (Modell) einblenden', 'Show the model characteristic'), default: true, visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn' || v.mode === 'led' },
    { key: 'line', type: 'boolean', group: 'view', label: L('Arbeitsgerade des Vorwiderstands', 'Load line of the series resistor'), default: false, visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn' },
    { key: 'val', type: 'boolean', group: 'view', label: L('Messwerte im Bild', 'Values in the picture'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'measure', label: L('Messwert aufnehmen', 'Record a data point'), primary: true, visibleIf: (v) => v.mode === 'diode' },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series'), visibleIf: (v) => v.mode === 'diode' },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data'), visibleIf: (v) => v.mode === 'diode' },
    { id: 'flip', label: L('Diode umdrehen', 'Turn the diode round'), visibleIf: (v) => v.mode === 'diode' || v.mode === 'pn' },
    { id: 'press', label: L('Taster betätigen', 'Press the button'), primary: true, visibleIf: (v) => v.mode === 'switch' && v.bs === 'key' },
  ],
  readouts: [
    { key: 'op', label: L('Messgeräte zeigen', 'The meters show') },
    { key: 'shock', label: L('Shockley-Gleichung', 'Shockley equation'), spoiler: true },
    { key: 'ut', label: L('Temperaturspannung', 'Thermal voltage') },
    { key: 'us', label: L('Schleusenspannung', 'Threshold voltage'), spoiler: true },
    { key: 'pn', label: L('Sperrschicht', 'Depletion layer') },
    { key: 'led', label: L('Farbe und Schwellspannung', 'Colour and threshold voltage'), spoiler: true },
    { key: 'h', label: L('Plancksches Wirkungsquantum', 'Planck constant'), spoiler: true },
    { key: 'table', label: L('Messtabelle', 'Table of measurements'), spoiler: true },
    { key: 'rpeak', label: L('Spitzenwert am Ausgang', 'Output peak value'), spoiler: true },
    { key: 'rmean', label: L('Mittelwert am Ausgang', 'Output mean value'), spoiler: true },
    { key: 'rrip', label: L('Brummspannung', 'Ripple voltage'), spoiler: true },
    { key: 'sw', label: L('Ströme', 'Currents'), spoiler: true },
    { key: 'ldr', label: L('Fotowiderstand und Spannungsteiler', 'Photoresistor and voltage divider'), spoiler: true },
    { key: 'ic', label: L('Kollektorstrom', 'Collector current'), spoiler: true },
    { key: 'sat', label: L('Sättigung', 'Saturation') },
    { key: 'uce', label: L('Spannung am Transistor', 'Voltage across the transistor'), spoiler: true },
  ],
  presets: [
    { id: 'si', label: L('Siliziumdiode', 'Silicon diode'), values: {} },
    { id: 'ge', label: L('Germaniumdiode', 'Germanium diode'), values: { d: 'ge', U: 1 } },
    { id: 'rev', label: L('Sperrrichtung', 'Reverse bias'), values: { flip: true, U: 5 } },
    { id: 'red', label: L('Rote LED', 'Red LED'), values: { d: 'red', U: 3 } },
    { id: 'blu', label: L('Blaue LED', 'Blue LED'), values: { d: 'blu', U: 4 } },
    { id: 'pn', label: L('pn-Übergang', 'pn junction'), values: { mode: 'pn', U: 1.5 } },
    { id: 'bridge', label: L('Brückengleichrichter', 'Bridge rectifier'), values: { mode: 'rect', rc: 'bridge' } },
    { id: 'smooth', label: L('Mit Glättung', 'With smoothing'), values: { mode: 'rect', rc: 'bridge', cap: true } },
    { id: 'dusk', label: L('Dämmerungsschalter', 'Twilight switch'), values: { mode: 'switch', bs: 'ldr', E: 30 } },
    { id: 'amp', label: L('Verstärker B = 100', 'Amplifier B = 100'), values: { mode: 'amp' } },
  ],
  strings: {
    de: {
      canvas:
        'Versuche mit Halbleitern: Diode mit Netzgerät, Vorwiderstand und Messgeräten samt I-U-Kennlinie; pn-Übergang mit Löchern, Elektronen und Sperrschicht; vier Leuchtdioden; Einweg- und Brückengleichrichter mit Oszilloskop; Transistor als Schalter mit Lampe (Taster oder Fotowiderstand) und als Verstärker mit Kennlinie I_C über I_B. Diode, Batterie, Taster und LEDs lassen sich antippen, Arbeitspunkte im Diagramm ziehen.',
    },
    en: {
      canvas:
        'Semiconductor experiments: diode with power supply, series resistor and meters plus its I–U characteristic; pn junction with holes, electrons and depletion layer; four LEDs; half-wave and bridge rectifier with oscilloscope; transistor as a switch with a lamp (push button or photoresistor) and as an amplifier with the characteristic I_C against I_B. The diode, battery, button and LEDs can be tapped, operating points dragged in the graph.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const T = (d: string, e: string) => (de ? d : e);
    const mode = () => p.mode as Mode;
    const dio = () => p.d as DiodeId;
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const teal = () => ctx.theme.series[5]!;
    const reduced = prefersReducedMotion();
    const showVal = () => !ctx.hidden;

    /** Diagrammfarbe einer Diode. */
    function diodeColor(d: DiodeId): string {
      return d === 'si' ? purple() : d === 'ge' ? teal() : d === 'red' ? red() : d === 'yel' ? orange() : d === 'grn' ? green() : blue();
    }

    /* ---------- Zahlen ---------- */
    const n = (v: number, d = 2) => fmt.num(v, d);
    const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    /** Zehnerpotenz-Schreibweise „6,63 · 10⁻³⁴“. */
    function sci(v: number, digits = 3): string {
      if (v === 0) return '0';
      const e = Math.floor(Math.log10(Math.abs(v)));
      const m = v / 10 ** e;
      const exp = String(e)
        .split('')
        .map((c) => SUP[c] ?? c)
        .join('');
      return `${fmt.fixed(m, digits - 1)} · 10${exp}`;
    }
    /** Zehnerpotenz für HTML-Ergebnisse: „6,63 · 10<sup>−34</sup>“. */
    function sciHtml(v: number, digits = 3): string {
      const e = Math.floor(Math.log10(Math.abs(v) || 1));
      return `${fmt.fixed(v / 10 ** e, digits - 1)} · 10<sup>${e < 0 ? '−' : ''}${Math.abs(e)}</sup>`;
    }
    /** Stromstärke mit passender Einheit (pA … A), drei geltende Ziffern. */
    function amp(I: number, digits = 3): string {
      const a = Math.abs(I);
      const sign = I < 0 ? '−' : '';
      const units: [number, string][] = [
        [1, 'A'],
        [1e-3, 'mA'],
        [1e-6, 'µA'],
        [1e-9, 'nA'],
        [1e-12, 'pA'],
        [1e-15, 'fA'],
      ];
      if (a === 0) return '0 A';
      if (a < 1e-15) return `${sign}${sci(a, digits)}\u00a0A`;
      for (const [f, u] of units) if (a >= f * 0.9995) return `${sign}${fmt.sig(a / f, digits)} ${u}`;
      return `${sign}${fmt.sig(a / 1e-15, digits)} fA`;
    }
    const volt = (U: number, d = 2) => `${fmt.fixed(U, d)} V`;

    /* ---------- Zustand ---------- */
    const U0 = () => (p.flip && (mode() === 'diode' || mode() === 'pn') ? -p.U : p.U);
    let op: DiodeOp = diodeCircuit(dio(), U0(), p.R);
    let points: Measurement[] = [];
    let auto: { next: number; wait: number } | null = null;
    let wave: RectWave = rectifierWave(p.Uh, p.rc as RectKind, p.cap ? p.C * 1e-6 : 0, p.RL * 1e3);
    let waveKey = '';
    let sw: SwitchOp = switchOp();
    /** Laufende Zeiten der Animationen. */
    let clockT = 0;
    let scopeT = 0;
    const flows = new Map<string, number>();
    const flowOf = (k: string) => flows.get(k) ?? 0;
    let flashes: { x: number; y: number; t: number }[] = [];
    let holes: Carrier[] = [];
    let electrons: Carrier[] = [];
    let rng = seededRandom(9132026);
    let pnGeo: { x0: number; x1: number; y0: number; y1: number; xm: number; w: number } | null = null;

    function switchOp(): SwitchOp {
      return p.bs === 'ldr' ? switchCircuit({ kind: 'ldr', lux: luxFromLevel(p.E), R1: p.R1 * 1e3 }) : switchCircuit({ kind: 'key', pressed: p.on });
    }
    function refreshWave(): void {
      const key = `${p.Uh}|${p.rc}|${p.cap}|${p.C}|${p.RL}`;
      if (key === waveKey) return;
      waveKey = key;
      wave = rectifierWave(p.Uh, p.rc as RectKind, p.cap ? p.C * 1e-6 : 0, p.RL * 1e3, { periods: 2, samples: 300 });
    }
    refreshWave();

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let frameDt = 0;
    let lastFrame = performance.now();
    let animating = false;
    function ease2(key: string, target: number, rate = 8): number {
      const cur = soft.get(key);
      if (cur === undefined || reduced || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-4 * Math.max(1e-3, Math.abs(target)) + 1e-9;
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1300, ease.linear);
    const stage = (delay: number, span = 0.5) => (intro.running ? ease.outCubic(clamp((intro.t - delay) / span, 0, 1)) : 1);
    const modeTw = new Tween(520, ease.inOutCubic);
    const pop = new Tween(450, ease.outBack);
    const flipTw = new Tween(520, ease.inOutCubic);
    let prevMode: Mode = mode();
    let lastMode: Mode = mode();

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const wide = w >= 640 || w >= h * 1.3;
      if (wide) {
        const sw = Math.round(w * 0.53);
        const x = sw + 12;
        const ch = Math.round(h * 0.6);
        return { wide, scene: { x: 0, y: 0, w: sw, h }, chart: { x, y: 0, w: w - x, h: ch }, card: { x, y: ch + 12, w: w - x, h: h - ch - 12 } };
      }
      const sh = Math.round(h * 0.42);
      const ch = Math.round(h * 0.33);
      return { wide, scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh + 10, w, h: ch }, card: { x: 0, y: sh + ch + 20, w, h: h - sh - ch - 20 } };
    }
    let lay = computeLayout();

    /* ---------- Zeichenhilfen ---------- */
    const g = () => surface.g;
    const subStyle = (size: number, color: string, weight: number, align: CanvasTextAlign = 'center'): SubTextStyle => ({ size, family: ctx.theme.font, weight, color, align, subScale: 0.74, subShift: 0.3 });
    const halo = () => (ctx.theme.dark ? 'rgba(16,22,31,0.86)' : 'rgba(255,255,255,0.92)');
    function textW(str: string, size: number, weight = 700): number {
      return measureSubText(surface.g, str, subStyle(size, '', weight));
    }
    function rich(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', withHalo = true, weight = 700): number {
      return subText(surface.g, str, x, y, { ...subStyle(size, color, weight, align), ...(withHalo ? { halo: halo() } : {}) });
    }
    /** Etikett mit Rahmen; die Lage wird an das Rechteck `clip` geklemmt. */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, clip?: Rect): Rect {
      const gg = surface.g;
      const w = textW(label, size) + 16;
      const h = size + 10;
      let x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      let y0 = y - h / 2;
      if (clip) {
        x0 = clamp(x0, clip.x + 4, clip.x + clip.w - w - 4);
        y0 = clamp(y0, clip.y + 4, clip.y + clip.h - h - 4);
      }
      gg.save();
      gg.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.13)';
      gg.shadowBlur = 6;
      gg.shadowOffsetY = 1;
      gg.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.93)' : 'rgba(255,255,255,0.96)';
      roundRect(gg, x0, y0, w, h, h / 2);
      gg.fill();
      gg.restore();
      gg.strokeStyle = withAlpha(color, 0.55);
      gg.lineWidth = 1;
      roundRect(gg, x0 + 0.5, y0 + 0.5, w - 1, h - 1, h / 2);
      gg.stroke();
      rich(label, x0 + w / 2, y0 + h / 2 + 0.5, size, color, 'center', false);
      return { x: x0, y: y0, w, h };
    }
    function card(r: Rect, accent?: string): void {
      drawCard(surface.g, r, ctx.theme, accent);
    }
    function title(r: Rect, str: string, sm: boolean, color = ctx.theme.text): void {
      rich(str, r.x + 14, r.y + (sm ? 16 : 20), sm ? 12 : 13.5, color, 'left', false, 750);
    }
    const wireCol = () => (ctx.theme.dark ? '#c9d2df' : '#3b4656');
    function line(pts: Pt[], color: string, width: number, dash: number[] = []): void {
      const gg = surface.g;
      gg.save();
      gg.strokeStyle = color;
      gg.lineWidth = width;
      gg.lineCap = 'round';
      gg.lineJoin = 'round';
      gg.setLineDash(dash);
      gg.beginPath();
      pts.forEach((q, i) => (i ? gg.lineTo(q[0], q[1]) : gg.moveTo(q[0], q[1])));
      gg.stroke();
      gg.restore();
    }
    function dot(x: number, y: number, r: number, color: string): void {
      const gg = surface.g;
      gg.fillStyle = color;
      gg.beginPath();
      gg.arc(x, y, r, 0, TAU);
      gg.fill();
    }
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 8): void {
      const gg = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      line([[x0, y0], [x1 - ux * h * 0.7, y1 - uy * h * 0.7]], color, width);
      gg.fillStyle = color;
      gg.beginPath();
      gg.moveTo(x1, y1);
      gg.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      gg.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      gg.closePath();
      gg.fill();
    }
    /** Glühen (radialer Verlauf). */
    function glow(x: number, y: number, r: number, color: string, k: number): void {
      if (k < 0.01) return;
      const gg = surface.g;
      const gr = gg.createRadialGradient(x, y, 0, x, y, r);
      gr.addColorStop(0, withAlpha(color, 0.75 * k));
      gr.addColorStop(0.35, withAlpha(color, 0.3 * k));
      gr.addColorStop(1, withAlpha(color, 0));
      gg.fillStyle = gr;
      gg.fillRect(x - r, y - r, 2 * r, 2 * r);
    }
    /** Ladungsträger (Elektronen) entlang eines Pfads; `key` bestimmt den Versatz. */
    function carriers(path: Path, key: string, gap: number, r: number, color: string, alpha = 0.9): void {
      if (path.length < 4) return;
      const off = flowOf(key);
      const nDots = Math.max(1, Math.floor(path.length / gap));
      const step = path.length / nDots;
      const gg = surface.g;
      gg.fillStyle = withAlpha(color, alpha);
      for (let k = 0; k < nDots; k++) {
        const [x, y] = path.at(k * step + off);
        gg.beginPath();
        gg.arc(x, y, r, 0, TAU);
        gg.fill();
      }
    }
    const elecCol = () => (ctx.theme.dark ? '#9cc7ff' : mixColor(ctx.theme.series[0]!, '#000000', 0.15));

    /* ---------- Schaltzeichen ---------- */
    /** Diode: Dreieck in Richtung `a` (technische Stromrichtung), Querstrich am Ende. */
    function diodeSym(cx: number, cy: number, s: number, a: number, color: string, fill: string, hot = 0): void {
      const gg = surface.g;
      gg.save();
      gg.translate(cx, cy);
      gg.rotate(a);
      if (hot > 0.01) {
        gg.shadowColor = withAlpha(orange(), 0.8 * hot);
        gg.shadowBlur = 12 * hot;
      }
      gg.fillStyle = fill;
      gg.strokeStyle = color;
      gg.lineWidth = Math.max(1.8, s * 0.09);
      gg.lineJoin = 'round';
      gg.beginPath();
      gg.moveTo(-s / 2, -s / 2);
      gg.lineTo(-s / 2, s / 2);
      gg.lineTo(s / 2, 0);
      gg.closePath();
      gg.fill();
      gg.stroke();
      gg.lineCap = 'round';
      gg.beginPath();
      gg.moveTo(s / 2, -s / 2);
      gg.lineTo(s / 2, s / 2);
      gg.stroke();
      gg.restore();
    }
    /** Zwei Pfeile für das ausgesandte Licht einer LED. */
    function ledArrows(cx: number, cy: number, s: number, a: number, color: string): void {
      for (const k of [-0.15, 0.35]) {
        const bx = cx + Math.cos(a) * s * k + Math.cos(a - Math.PI / 2) * s * 0.55;
        const by = cy + Math.sin(a) * s * k + Math.sin(a - Math.PI / 2) * s * 0.55;
        const d = a - Math.PI / 2 + 0.6;
        arrowPx(bx, by, bx + Math.cos(d) * s * 0.55, by + Math.sin(d) * s * 0.55, color, 1.6, 5);
      }
    }
    function resistor(cx: number, cy: number, len: number, th: number, vertical: boolean, heat = 0): Rect {
      const gg = surface.g;
      const w = vertical ? th : len;
      const h = vertical ? len : th;
      const r = { x: cx - w / 2, y: cy - h / 2, w, h };
      gg.fillStyle = ctx.theme.bg;
      roundRect(gg, r.x, r.y, w, h, 2);
      gg.fill();
      if (heat > 0.01) {
        gg.fillStyle = withAlpha(orange(), 0.5 * heat);
        roundRect(gg, r.x + 2, r.y + 2, w - 4, h - 4, 1);
        gg.fill();
      }
      gg.strokeStyle = wireCol();
      gg.lineWidth = 2.2;
      roundRect(gg, r.x, r.y, w, h, 2);
      gg.stroke();
      return r;
    }
    function meterSym(cx: number, cy: number, r: number, letter: string): void {
      const gg = surface.g;
      gg.fillStyle = ctx.theme.dark ? '#141b26' : '#ffffff';
      gg.strokeStyle = wireCol();
      gg.lineWidth = 2.2;
      gg.beginPath();
      gg.arc(cx, cy, r, 0, TAU);
      gg.fill();
      gg.stroke();
      rich(letter, cx, cy + 0.5, Math.round(r * 1.05), ctx.theme.text, 'center', false, 800);
    }
    function battery(cx: number, cy: number, s: number, vertical: boolean, plusFirst: boolean): void {
      const gg = surface.g;
      const wc = wireCol();
      gg.save();
      gg.translate(cx, cy);
      if (!vertical) gg.rotate(-Math.PI / 2);
      const sign = plusFirst ? 1 : -1;
      gg.strokeStyle = wc;
      gg.lineCap = 'butt';
      gg.lineWidth = 2.4;
      gg.beginPath();
      gg.moveTo(-s, -sign * s * 0.28);
      gg.lineTo(s, -sign * s * 0.28);
      gg.stroke();
      gg.lineWidth = 6;
      gg.beginPath();
      gg.moveTo(-s * 0.5, sign * s * 0.28);
      gg.lineTo(s * 0.5, sign * s * 0.28);
      gg.stroke();
      gg.restore();
    }
    function lampSym(cx: number, cy: number, r: number, k: number): void {
      const gg = surface.g;
      glow(cx, cy, r * (2.2 + 2.4 * k), '#ffd36b', k);
      gg.fillStyle = k > 0.02 ? mixColor(ctx.theme.dark ? '#141b26' : '#ffffff', '#fff2b8', clamp(k * 1.2, 0, 1)) : ctx.theme.dark ? '#141b26' : '#ffffff';
      gg.strokeStyle = wireCol();
      gg.lineWidth = 2.2;
      gg.beginPath();
      gg.arc(cx, cy, r, 0, TAU);
      gg.fill();
      gg.stroke();
      const q = r * Math.SQRT1_2;
      line(
        [
          [cx - q, cy - q],
          [cx + q, cy + q],
        ],
        k > 0.3 ? '#c77700' : wireCol(),
        2,
      );
      line(
        [
          [cx + q, cy - q],
          [cx - q, cy + q],
        ],
        k > 0.3 ? '#c77700' : wireCol(),
        2,
      );
    }
    /** npn-Transistor: Basis links, Kollektor oben rechts, Emitter unten rechts. Gibt die Anschlüsse zurück. */
    function npn(cx: number, cy: number, s: number, on: number): { b: Pt; c: Pt; e: Pt } {
      const gg = surface.g;
      const wc = wireCol();
      glow(cx, cy, s * 1.6, orange(), 0.35 * on);
      gg.fillStyle = ctx.theme.dark ? '#141b26' : '#ffffff';
      gg.strokeStyle = wc;
      gg.lineWidth = 2.2;
      gg.beginPath();
      gg.arc(cx, cy, s, 0, TAU);
      gg.fill();
      gg.stroke();
      const bx = cx - s * 0.28;
      line(
        [
          [bx, cy - s * 0.5],
          [bx, cy + s * 0.5],
        ],
        wc,
        4,
      );
      const c: Pt = [cx + s * 0.42, cy - s * 0.92];
      const e: Pt = [cx + s * 0.42, cy + s * 0.92];
      line([[bx, cy - s * 0.2], [cx + s * 0.42, cy - s * 0.62], c], wc, 2.2);
      line([[bx, cy + s * 0.2], [cx + s * 0.42, cy + s * 0.62], e], wc, 2.2);
      // Pfeil am Emitter (nach außen)
      const ax = bx + (cx + s * 0.42 - bx) * 0.78;
      const ay = cy + s * 0.2 + (s * 0.42) * 0.78;
      arrowPx(bx + (ax - bx) * 0.4, cy + s * 0.2 + (ay - cy - s * 0.2) * 0.4, ax, ay, wc, 2.2, 8);
      line(
        [
          [cx - s * 1.25, cy],
          [bx, cy],
        ],
        wc,
        2.2,
      );
      return { b: [cx - s * 1.25, cy], c, e };
    }
    function capSym(cx: number, cy: number, w: number, gap: number, vertical: boolean, color: string): void {
      const gg = surface.g;
      gg.save();
      gg.strokeStyle = color;
      gg.lineCap = 'butt';
      gg.lineWidth = 4;
      gg.beginPath();
      if (vertical) {
        gg.moveTo(cx - w / 2, cy - gap / 2);
        gg.lineTo(cx + w / 2, cy - gap / 2);
        gg.moveTo(cx - w / 2, cy + gap / 2);
        gg.lineTo(cx + w / 2, cy + gap / 2);
      } else {
        gg.moveTo(cx - gap / 2, cy - w / 2);
        gg.lineTo(cx - gap / 2, cy + w / 2);
        gg.moveTo(cx + gap / 2, cy - w / 2);
        gg.lineTo(cx + gap / 2, cy + w / 2);
      }
      gg.stroke();
      gg.restore();
    }
    /** Netzgerät (Kasten mit Anzeige); Pluspol oben, Minuspol unten. */
    function supplyBox(cx: number, cy: number, w: number, h: number, U: number, sm: boolean): { plus: Pt; minus: Pt } {
      const gg = surface.g;
      const dark = ctx.theme.dark;
      gg.save();
      gg.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      gg.shadowBlur = 10;
      gg.shadowOffsetY = 3;
      const body = gg.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
      body.addColorStop(0, dark ? '#4c5767' : '#5a6575');
      body.addColorStop(1, dark ? '#2a313d' : '#323a47');
      gg.fillStyle = body;
      roundRect(gg, cx - w / 2, cy - h / 2, w, h, 8);
      gg.fill();
      gg.restore();
      // Anzeige
      const dw = w - 14;
      const dh = Math.min(26, h * 0.32);
      const dy = cy - h / 2 + 8;
      gg.fillStyle = '#0d1a14';
      roundRect(gg, cx - dw / 2, dy, dw, dh, 4);
      gg.fill();
      gg.save();
      gg.shadowColor = 'rgba(80,255,170,0.5)';
      gg.shadowBlur = 5;
      rich(`${fmt.fixed(U, 2)} V`, cx + dw / 2 - 6, dy + dh / 2 + 0.5, Math.round(dh * 0.6), '#7cf2b0', 'right', false, 700);
      gg.restore();
      const plus: Pt = [cx + w / 2, cy + h * 0.06];
      const minus: Pt = [cx + w / 2, cy + h * 0.3];
      rich('+', cx + w / 2 - 12, plus[1], sm ? 12 : 14, '#ffb4ab', 'center', false, 800);
      rich('−', cx + w / 2 - 12, minus[1], sm ? 12 : 14, 'rgba(235,240,248,0.85)', 'center', false, 800);
      for (const [q, c] of [
        [plus, '#c62828'],
        [minus, '#1c1f24'],
      ] as const) {
        dot(q[0] - 1, q[1], 5, c);
        dot(q[0] - 1, q[1], 2.2, '#0d0f12');
      }
      rich(T('Netzgerät', 'Supply'), cx - w / 2 + 8, cy + h / 2 - 10, sm ? 9.5 : 10.5, 'rgba(235,240,248,0.8)', 'left', false, 650);
      return { plus, minus };
    }
    /** 5-mm-Leuchtdiode als Gegenstand: Kuppel, Beinchen; `k` = Helligkeit 0 … 1. */
    function ledBody(cx: number, cy: number, s: number, color: string, k: number, sel: boolean): void {
      const gg = surface.g;
      const w = s;
      const h = s * 1.35;
      glow(cx, cy - h * 0.2, s * (1.4 + 2.2 * k), color, k);
      // Beinchen
      line(
        [
          [cx - w * 0.22, cy + h * 0.45],
          [cx - w * 0.22, cy + h * 0.95],
        ],
        '#a9b1bc',
        2,
      );
      line(
        [
          [cx + w * 0.22, cy + h * 0.45],
          [cx + w * 0.22, cy + h * 0.85],
        ],
        '#a9b1bc',
        2,
      );
      gg.save();
      gg.beginPath();
      gg.moveTo(cx - w / 2, cy + h * 0.45);
      gg.lineTo(cx - w / 2, cy - h * 0.2);
      gg.arc(cx, cy - h * 0.2, w / 2, Math.PI, 0);
      gg.lineTo(cx + w / 2, cy + h * 0.45);
      gg.closePath();
      const body = gg.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      const off = mixColor(color, ctx.theme.dark ? '#1b2533' : '#ffffff', 0.55, 0.75);
      const lit = mixColor(color, '#ffffff', 0.35 * k);
      body.addColorStop(0, k > 0.05 ? lit : off);
      body.addColorStop(0.5, k > 0.05 ? mixColor(lit, '#ffffff', 0.4 * k) : mixColor(off, '#ffffff', 0.3));
      body.addColorStop(1, k > 0.05 ? lit : off);
      gg.fillStyle = body;
      gg.fill();
      gg.strokeStyle = sel ? ctx.theme.text : withAlpha(color, 0.9);
      gg.lineWidth = sel ? 2.4 : 1.4;
      gg.stroke();
      gg.restore();
      // Kragen
      gg.fillStyle = mixColor(color, '#000000', 0.25, 0.85);
      roundRect(gg, cx - w * 0.58, cy + h * 0.4, w * 1.16, h * 0.1, 2);
      gg.fill();
      // Glanz
      gg.strokeStyle = 'rgba(255,255,255,0.6)';
      gg.lineWidth = 1.6;
      gg.beginPath();
      gg.arc(cx, cy - h * 0.2, w * 0.32, Math.PI * 1.1, Math.PI * 1.45);
      gg.stroke();
    }

    /* ---------- Antippen und Ziehen ---------- */
    let hits: Hit[] = [];
    let hoverId: string | null = null;
    let collectHits = true;
    function addHit(h: Hit): void {
      if (collectHits) hits.push(h);
    }
    const hot = (id: string) => !ctx.locked && (hoverId === id || ctx.keyFocus === id);
    function hotRing(r: Rect, id: string, color = orange()): void {
      const f = ease2(`hot-${id}`, hot(id) ? 1 : 0, 12);
      if (f < 0.01) return;
      const gg = surface.g;
      gg.save();
      gg.fillStyle = withAlpha(color, 0.12 * f);
      gg.strokeStyle = withAlpha(color, 0.65 * f);
      gg.lineWidth = 1.6;
      gg.setLineDash([4, 3]);
      roundRect(gg, r.x, r.y, r.w, r.h, 10);
      gg.fill();
      gg.stroke();
      gg.restore();
    }
    type DragKind = 'ud' | 'ib' | 'sky';
    let drag: { kind: DragKind; r: Rect; toValue: (px: number, py: number) => void } | null = null;
    let dragZones: { kind: DragKind; r: Rect; handle: Pt | null; toValue: (px: number, py: number) => void }[] = [];
    let dragHover = false;
    const inR = (r: Rect, x: number, y: number, pad = 0) => x >= r.x - pad && x <= r.x + r.w + pad && y >= r.y - pad && y <= r.y + r.h + pad;
    const hitAt = (x: number, y: number) => hits.find((h) => inR(h.r, x, y)) ?? null;
    const zoneAt = (x: number, y: number) => dragZones.find((z) => inR(z.r, x, y, 6)) ?? null;

    surface.addTarget({
      contains: (px, py) => !ctx.locked && (hitAt(px, py) !== null || zoneAt(px, py) !== null),
      pointerDown: (q) => {
        if (ctx.locked) return false;
        const h = hitAt(q.px, q.py);
        if (h) {
          h.act();
          return true;
        }
        const z = zoneAt(q.px, q.py);
        if (!z) return false;
        drag = { kind: z.kind, r: z.r, toValue: z.toValue };
        auto = null;
        z.toValue(q.px, q.py);
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (q) => {
        if (drag) drag.toValue(q.px, q.py);
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor(dragHover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q) => {
        const h = q && !ctx.locked ? hitAt(q.px, q.py) : null;
        const id = h ? h.id : null;
        const z = q && !ctx.locked && !h ? zoneAt(q.px, q.py) : null;
        dragHover = !!z;
        if (id !== hoverId) {
          hoverId = id;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'pointer' : z ? 'grab' : '');
      },
      wheel: () => false,
    });

    function doFlip(): void {
      if (ctx.locked) return;
      ctx.set({ flip: !p.flip });
      ctx.announce(!p.flip ? T('Diode in Durchlassrichtung.', 'Diode in forward direction.') : T('Diode in Sperrrichtung.', 'Diode in reverse direction.'));
    }

    /* ---------- Diagramm-Grundgerüst ---------- */
    interface Axes {
      A: Rect;
      X: (v: number) => number;
      Y: (v: number) => number;
      xv: (px: number) => number;
      yv: (py: number) => number;
      x0: number;
      x1: number;
      y0: number;
      y1: number;
      sm: boolean;
      fs: number;
    }
    function axesFrame(R: Rect, titleStr: string, xl: string, yl: string, x0: number, x1: number, y0: number, y1: number, pad?: Partial<{ l: number; r: number; t: number; b: number }>): Axes {
      const gg = surface.g;
      const th = ctx.theme;
      card(R);
      const sm = R.w < 440 || R.h < 200;
      const fs = sm ? 10.5 : 11.5;
      title(R, titleStr, sm);
      const l = pad?.l ?? (sm ? 42 : 50);
      const t = pad?.t ?? (sm ? 32 : 40);
      const A: Rect = { x: R.x + l, y: R.y + t, w: R.w - l - (pad?.r ?? (sm ? 14 : 20)), h: R.h - t - (pad?.b ?? (sm ? 26 : 30)) };
      const X = (v: number) => A.x + ((v - x0) / (x1 - x0)) * A.w;
      const Y = (v: number) => A.y + A.h - ((v - y0) / (y1 - y0)) * A.h;
      const xv = (px: number) => x0 + ((px - A.x) / A.w) * (x1 - x0);
      const yv = (py: number) => y0 + ((A.y + A.h - py) / A.h) * (y1 - y0);
      const xs = niceStep(x1 - x0, sm ? 5 : 7);
      const ys = niceStep(y1 - y0, sm ? 4 : 6);
      gg.save();
      gg.strokeStyle = th.grid;
      gg.lineWidth = 1;
      gg.beginPath();
      for (let v = Math.ceil(x0 / xs) * xs; v <= x1 + 1e-9; v += xs) {
        const x = Math.round(X(v)) + 0.5;
        gg.moveTo(x, A.y);
        gg.lineTo(x, A.y + A.h);
      }
      for (let v = Math.ceil(y0 / ys) * ys; v <= y1 + 1e-9; v += ys) {
        const y = Math.round(Y(v)) + 0.5;
        gg.moveTo(A.x, y);
        gg.lineTo(A.x + A.w, y);
      }
      gg.stroke();
      gg.strokeStyle = th.axis;
      gg.lineWidth = 1.3;
      gg.beginPath();
      const ax = x0 <= 0 && x1 >= 0 ? Math.round(X(0)) + 0.5 : A.x + 0.5;
      const ay = y0 <= 0 && y1 >= 0 ? Math.round(Y(0)) + 0.5 : A.y + A.h + 0.5;
      gg.moveTo(ax, A.y - 4);
      gg.lineTo(ax, A.y + A.h);
      gg.moveTo(A.x, ay);
      gg.lineTo(A.x + A.w + 4, ay);
      gg.stroke();
      gg.restore();
      const xlw = textW(xl, fs, 650);
      for (let v = Math.ceil(x0 / xs) * xs; v <= x1 + 1e-9; v += xs) {
        const x = X(v);
        if (x > A.x + A.w - xlw - 12) continue;
        const near0 = Math.abs(v) < xs * 1e-6;
        rich(near0 ? '0' : n(v, 3), x + (near0 && x0 < 0 ? -7 : 0), A.y + A.h + (sm ? 11 : 13), fs, th.muted, 'center', false, 500);
      }
      rich(xl, A.x + A.w, A.y + A.h + (sm ? 11 : 13), fs, th.muted, 'right', false, 650);
      for (let v = Math.ceil(y0 / ys) * ys; v <= y1 + 1e-9; v += ys) {
        const y = Y(v);
        if (y < A.y + 6) continue;
        rich(Math.abs(v) < ys * 1e-6 ? '0' : n(v, 3), A.x - 6, y, fs, th.muted, 'right', false, 500);
      }
      rich(yl, R.x + R.w - 14, R.y + (sm ? 16 : 20), fs, th.muted, 'right', false, 650);
      return { A, X, Y, xv, yv, x0, x1, y0, y1, sm, fs };
    }
    function clipTo(A: Rect): void {
      const gg = surface.g;
      gg.save();
      gg.beginPath();
      gg.rect(A.x, A.y - 2, A.w + 2, A.h + 4);
      gg.clip();
    }
    function curve(ax: Axes, f: (x: number) => number, color: string, width: number, dash: number[] = [], alpha = 1, from = ax.x0, to = ax.x1): void {
      const pts: Pt[] = [];
      const N = 220;
      for (let i = 0; i <= N; i++) {
        const x = from + ((to - from) * i) / N;
        const y = f(x);
        const py = ax.Y(clamp(y, ax.y0 - (ax.y1 - ax.y0), ax.y1 + (ax.y1 - ax.y0)));
        pts.push([ax.X(x), py]);
      }
      line(pts, withAlpha(color, alpha), width, dash);
    }
    function opPoint(x: number, y: number, color: string, big: boolean, handle: boolean): void {
      const gg = surface.g;
      if (handle && !ctx.locked) {
        const f = ease2('handleHot', drag || dragHover ? 1 : 0, 12);
        gg.fillStyle = withAlpha(color, 0.16 + 0.14 * f);
        gg.beginPath();
        gg.arc(x, y, (big ? 13 : 11) + 3 * f, 0, TAU);
        gg.fill();
      }
      gg.fillStyle = color;
      gg.strokeStyle = ctx.theme.bg;
      gg.lineWidth = 2;
      gg.beginPath();
      gg.arc(x, y, big ? 6.5 : 5.5, 0, TAU);
      gg.fill();
      gg.stroke();
    }

    /* ================================================================== */
    /* Ansicht 1: Kennlinie der Diode                                      */
    /* ================================================================== */
    function diodeShown(): { Ud: number; I: number } {
      // Der Punkt gleitet weich über die Kennlinie (gezeigt: U_D, daraus I)
      const Ud = ease2('ud', op.Ud, drag ? 20 : 7);
      return { Ud, I: diodeCurrent(dio(), Ud) };
    }

    function drawDiodeScene(r: Rect): void {
      const th = ctx.theme;
      card(r);
      const sm = r.w < 400;
      title(r, T('Messschaltung', 'Measuring circuit'), sm);
      const d = dio();
      const shown = diodeShown();
      const wc = wireCol();
      const pad = sm ? 14 : 22;
      const bw = sm ? 74 : 112;
      const bh = sm ? 66 : 96;
      const xS = r.x + pad + bw / 2;
      const yT = r.y + (sm ? 44 : 62);
      const yB = r.y + r.h - (sm ? 30 : 44);
      const yM = (yT + yB) / 2;
      const S = supplyBox(xS, yM, bw, bh, p.U, sm);
      const xR = r.x + r.w - (sm ? 70 : 104);
      const xRes = (S.plus[0] + xR) / 2;
      const xA = (S.plus[0] + xR) / 2;
      const s = sm ? 28 : 44;
      // Leitungen
      const loop: Pt[] = [S.plus, [S.plus[0] + 14, S.plus[1]], [S.plus[0] + 14, yT], [xR, yT], [xR, yB], [S.minus[0] + 14, yB], [S.minus[0] + 14, S.minus[1]], S.minus];
      line(loop, wc, 2.4);
      // Vorwiderstand oben
      const heat = clamp((op.I * op.I * p.R) / 0.25, 0, 1);
      resistor(xRes, yT, sm ? 46 : 60, sm ? 14 : 18, false, heat);
      rich(`R = ${n(p.R, 0)} Ω`, xRes, yT - (sm ? 18 : 22), sm ? 11 : 12, th.text, 'center', true, 700);
      // Amperemeter unten
      meterSym(xA, yB, sm ? 12 : 18, 'A');
      // Diode rechts senkrecht; vorwärts zeigt das Dreieck nach unten (Strom von + nach −)
      // vorwärts zeigt das Dreieck nach unten; beim Umdrehen dreht sich das Schaltzeichen weich
      const fk = flipTw.running ? flipTw.value : 1;
      const ang = (p.flip ? -Math.PI / 2 : Math.PI / 2) - Math.PI * (1 - fk);
      const cond = level(op.I);
      const led = isLed(d);
      if (led) glow(xR, yM, s * (1.3 + 2.2 * cond), LED_LIGHT[d]!, cond * (op.I > 1e-4 ? 1 : 0));
      const dr = { x: xR - s, y: yM - s, w: 2 * s, h: 2 * s };
      hotRing(dr, 'diode');
      g().fillStyle = th.bg;
      g().fillRect(xR - 3, yM - s * 0.62, 6, s * 1.24);
      diodeSym(xR, yM, s, ang, wc, led ? withAlpha(LED_LIGHT[d]!, 0.25 + 0.65 * cond) : withAlpha(diodeColor(d), 0.18 + 0.5 * cond), 0);
      if (led) ledArrows(xR, yM, s, ang, op.I > 1e-4 ? LED_LIGHT[d]! : withAlpha(wc, 0.5));
      addHit({ id: 'diode', label: T('Diode umdrehen', 'Turn the diode round'), r: dr, act: doFlip });
      // Voltmeter parallel zur Diode
      const xV = xR + (sm ? 38 : 52);
      const yv1 = yM - s * 1.15;
      const yv2 = yM + s * 1.15;
      line(
        [
          [xR, yv1],
          [xV, yv1],
          [xV, yv2],
          [xR, yv2],
        ],
        wc,
        2,
      );
      dot(xR, yv1, 3, wc);
      dot(xR, yv2, 3, wc);
      g().fillStyle = th.bg;
      meterSym(xV, yM, sm ? 12 : 18, 'V');
      // Ladungsträger (Elektronen gegen die technische Stromrichtung)
      const path = new Path([[S.plus[0] + 14, S.plus[1]], [S.plus[0] + 14, yT], [xR, yT], [xR, yB], [S.minus[0] + 14, yB], [S.minus[0] + 14, S.minus[1]]]);
      carriers(path, 'diode', sm ? 16 : 20, sm ? 2.3 : 2.8, elecCol());
      // Beschriftung der Diode
      const lab = DIODE_LABEL[d][ctx.lang];
      rich(lab, xR - s - 8, yM - s * 0.2, sm ? 10.5 : 12, diodeColor(d), 'right', true, 750);
      rich(p.flip ? T('Sperrrichtung', 'reverse') : T('Durchlassrichtung', 'forward'), xR - s - 8, yM + (sm ? 12 : 15), sm ? 10 : 11, p.flip ? red() : green(), 'right', true, 650);
      if (!sm && !ctx.locked) rich(`(${T('antippen: umdrehen', 'tap: turn round')})`, xR - s - 8, yM + 30, 10, th.muted, 'right', true, 600);
      // Messwerte
      if (showVal()) {
        pill(xA, yB + (sm ? 22 : 28), `I = ${amp(shown.I)}`, blue(), 'center', sm ? 10.5 : 12, r);
        pill(xV + (sm ? 2 : 4), yM - s * 1.15 - (sm ? 16 : 20), `U_D = ${volt(shown.Ud, 3)}`, orange(), 'right', sm ? 10.5 : 12, r);
      }
      // Bauteil in Vergrößerung (nur bei genug Platz): Ring bzw. kurzes Bein = Kathode
      const free = xR - s - 20 - (S.plus[0] + 30);
      if (!sm && free > 80 && yB - yT > 260) drawPart((S.plus[0] + xR - s) / 2 + 2, yT + (yB - yT) * 0.27, clamp(free / 130, 0.65, 1.2), ang, d, cond);
      // Legende Elektronen
      const ly = r.y + r.h - (sm ? 11 : 15);
      const lw = rich(T('Elektronen', 'electrons'), r.x + r.w - 14, ly, sm ? 10 : 10.5, th.muted, 'right', false, 600);
      dot(r.x + r.w - 22 - lw, ly, sm ? 2.3 : 2.8, elecCol());
    }

    /** Echtes Bauteil (vergrößert), gedreht wie das Schaltzeichen: Kathode in Richtung `a`. */
    function drawPart(cx: number, cy: number, k: number, a: number, d: DiodeId, cond: number): void {
      const gg = g();
      const th = ctx.theme;
      gg.save();
      gg.translate(cx, cy);
      gg.rotate(a - Math.PI / 2);
      if (isLed(d)) {
        // LED: Kuppel zeigt zur Anode (oben), kurzes Bein und abgeflachter Kragen = Kathode
        gg.rotate(Math.PI);
        ledBody(0, -6 * k, 26 * k, LED_LIGHT[d]!, op.I > 1e-4 ? Math.min(1, cond * 1.2) : 0, false);
        gg.restore();
        rich(T('kurzes Bein = Kathode', 'short leg = cathode'), cx, cy + 50 * k, 10.5, th.muted, 'center', true, 600);
        return;
      }
      const L0 = 64 * k;
      const R0 = 11 * k;
      line(
        [
          [0, -L0 / 2 - 26 * k],
          [0, L0 / 2 + 26 * k],
        ],
        '#a9b1bc',
        2.4,
      );
      gg.save();
      gg.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      gg.shadowBlur = 8;
      gg.shadowOffsetX = 2;
      const body = gg.createLinearGradient(-R0, 0, R0, 0);
      const base = d === 'ge' ? '#6b4a2a' : '#2a2d33';
      body.addColorStop(0, mixColor(base, '#000000', 0.3));
      body.addColorStop(0.45, mixColor(base, '#ffffff', 0.28));
      body.addColorStop(1, mixColor(base, '#000000', 0.35));
      gg.fillStyle = body;
      roundRect(gg, -R0, -L0 / 2, 2 * R0, L0, R0 * 0.6);
      gg.fill();
      gg.restore();
      // Ring an der Kathode
      const ring = gg.createLinearGradient(-R0, 0, R0, 0);
      ring.addColorStop(0, '#8d949e');
      ring.addColorStop(0.45, '#f1f3f6');
      ring.addColorStop(1, '#7d8590');
      gg.fillStyle = ring;
      gg.fillRect(-R0, L0 / 2 - 14 * k, 2 * R0, 7 * k);
      gg.restore();
      const dx = Math.cos(a);
      const dy = Math.sin(a);
      const far = L0 / 2 + 8 * k;
      rich(T('Ring = Kathode', 'ring = cathode'), cx + dx * far - 14 * k, cy + dy * far, 10.5, th.muted, 'right', true, 600);
      rich(T('Anode', 'anode'), cx - dx * far - 14 * k, cy - dy * far, 10.5, th.muted, 'right', true, 600);
    }

    /** I-U-Kennlinie (I in mA). Gemeinsam für Diode und Halbleiter-Modell. */
    function drawDiodeChart(R: Rect, withPoints: boolean): void {
      const th = ctx.theme;
      const d = dio();
      const Us = thresholdVoltage(d);
      const shown = diodeShown();
      const mine = points.filter((q) => q.d === d);
      const lowTarget = Math.min(-1, op.Ud * 1.08, ...mine.map((q) => q.Ud * 1.08));
      const highTarget = Math.max(niceCeil(Us * 1.3), op.Ud * 1.1, ...mine.map((q) => q.Ud * 1.05));
      const iTop = niceCeil(Math.max(20e-3, op.I * 1.15, ...mine.map((q) => q.I * 1.1)) * 1e3);
      const x0 = ease2('cx0', lowTarget, 5);
      const x1 = ease2('cx1', highTarget, 5);
      const y1 = ease2('cy1', iTop, 5);
      const y0 = -0.12 * y1;
      const ax = axesFrame(R, T('Kennlinie I(U_D)', 'Characteristic I(U_D)'), 'U_D in V', 'I in mA', x0, x1, y0, y1);
      clipTo(ax.A);
      // Schleusenspannung
      if (p.curve) {
        line(
          [
            [ax.X(Us), ax.A.y],
            [ax.X(Us), ax.A.y + ax.A.h],
          ],
          withAlpha(orange(), 0.7),
          1.4,
          [4, 4],
        );
        const lab = showVal() ? `U_S ≈ ${n(Us, 2)} V` : 'U_S';
        rich(lab, ax.X(Us) - 6, ax.A.y + 10, ax.fs, orange(), 'right', true, 750);
        // Modellkennlinie
        curve(ax, (u) => diodeCurrent(d, u) * 1e3, diodeColor(d), 2.4, [], 0.85);
      }
      // Arbeitsgerade I = (U0 − U) / R
      if (p.line) {
        const u0 = U0();
        curve(ax, (u) => ((u0 - u) / p.R) * 1e3, th.muted, 1.6, [6, 4], 0.9);
        rich(T('Arbeitsgerade', 'load line'), ax.X(clamp(u0 * 0.55, x0, x1)), ax.Y(((u0 - u0 * 0.55) / p.R) * 1e3) - 10, ax.fs, th.muted, 'center', true, 650);
      }
      // Messpunkte
      if (withPoints) {
        const last = points[points.length - 1];
        for (const q of mine) {
          const rad = q === last && pop.running ? 5.5 * Math.max(0.2, pop.value) : 5;
          const gg = g();
          gg.fillStyle = diodeColor(d);
          gg.strokeStyle = th.bg;
          gg.lineWidth = 1.5;
          gg.beginPath();
          gg.arc(ax.X(q.Ud), ax.Y(q.I * 1e3), rad, 0, TAU);
          gg.fill();
          gg.stroke();
        }
      }
      g().restore();
      // Sperrbereich-Hinweis
      if (op.Ud < -0.05) {
        const txt = T(`Sperrstrom ≈ −I_S = ${amp(-DIODES[d].Is, 2)}`, `reverse current ≈ −I_S = ${amp(-DIODES[d].Is, 2)}`);
        rich(txt, ax.X(x0) + 8, ax.Y(0) - 12, ax.fs, red(), 'left', true, 650);
      }
      // Arbeitspunkt (ziehbar)
      const px = ax.X(shown.Ud);
      const py = ax.Y(clamp(shown.I * 1e3, y0, y1 * 1.05));
      opPoint(px, py, th.text, true, mode() === 'diode' || mode() === 'pn');
      if (mode() === 'diode' || mode() === 'pn') {
        dragZones.push({
          kind: 'ud',
          r: ax.A,
          handle: [px, py],
          toValue: (qx) => setDiodeVoltage(ax.xv(qx)),
        });
      }
      if (withPoints && !mine.length) {
        const msg = ax.A.w < 300 ? T('Hier erscheinen die Messpunkte.', 'Data points appear here.') : T('Spannung einstellen und „Messwert aufnehmen“ drücken.', 'Set a voltage and press “Record a data point”.');
        rich(msg, ax.A.x + ax.A.w / 2 - 10, ax.A.y + 22, ax.sm ? 10.5 : 12, th.muted, 'center', true, 600);
      }
    }

    function setDiodeVoltage(udWanted: number): void {
      if (ctx.locked) return;
      const d = dio();
      const ud = p.flip ? Math.min(0, udWanted) : Math.max(0, udWanted);
      const u0 = Math.abs(sourceForDiodeVoltage(d, ud, p.R));
      ctx.set({ U: clamp(u0, 0, U_MAX) });
    }

    function drawDiodeCard(R: Rect): void {
      const d = dio();
      const s = DIODES[d];
      const UT = thermalVoltage();
      const v = showVal();
      const rows: [string, string][] = [
        [`U_T = k · T / e = ${n(UT * 1e3, 2)} mV  (T = 300 K)`, ctx.theme.text],
        [`I = I_S · (exp(U / (n·U_T)) − 1),  I_S = ${amp(s.Is, 2)},  n = ${n(s.n, 0)}`, diodeColor(d)],
        [v ? `U_D = ${volt(op.Ud, 3)}  →  I = ${amp(op.I)}` : 'U_D = ? V  →  I = ?', blue()],
        [T(`+${n(decadeVoltage(s.n) * 1e3, 0)} mV  →  10-facher Strom (Durchlass)`, `+${n(decadeVoltage(s.n) * 1e3, 0)} mV  →  10 times the current (forward)`), orange()],
        [T(`Sperrrichtung: I ≈ −I_S = ${amp(-s.Is, 2)}`, `Reverse: I ≈ −I_S = ${amp(-s.Is, 2)}`), red()],
      ];
      rowsCard(R, T('Rechnung', 'Calculation'), rows, diodeColor(d));
    }

    /** Karte mit Textzeilen (Schrift wird bei Platzmangel kleiner). */
    function rowsCard(R: Rect, head: string, rows: [string, string][], accent?: string): void {
      card(R, accent);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      title(R, head, sm);
      const topY = R.y + (sm ? 28 : 36);
      const lh = clamp((R.y + R.h - topY - (sm ? 6 : 10)) / rows.length, 13, sm ? 21 : 25);
      let y = topY + lh / 2;
      for (const [txt, c] of rows) {
        let fs = clamp(lh * 0.58, 9.5, sm ? 12.5 : 13.5);
        while (fs > 9 && textW(txt, fs, 700) > R.w - 2 * pad) fs -= 0.5;
        rich(txt, R.x + pad, y, fs, c, 'left', false, 700);
        y += lh;
      }
    }

    /* ================================================================== */
    /* Ansicht 2: Halbleiter-Modell                                        */
    /* ================================================================== */
    function resetCarriers(): void {
      holes = [];
      electrons = [];
      flashes = [];
      rng = seededRandom(9132026);
      pnGeo = null;
    }
    function seedCarriers(G: NonNullable<typeof pnGeo>): void {
      const N = Math.round(clamp(((G.x1 - G.x0) * (G.y1 - G.y0)) / 900, 18, 56));
      const half = (G.x1 - G.x0) / 2;
      for (let i = 0; i < N; i++) {
        holes.push({ x: G.x0 + rng() * (half - G.w - 6) + 3, y: G.y0 + 4 + rng() * (G.y1 - G.y0 - 8), a: rng() * TAU, cross: 0 });
        electrons.push({ x: G.xm + G.w + 3 + rng() * (half - G.w - 6), y: G.y0 + 4 + rng() * (G.y1 - G.y0 - 8), a: rng() * TAU, cross: 0 });
      }
    }
    /** Ein Zeitschritt der Ladungsträger. */
    function stepCarriers(dt: number): void {
      const G = pnGeo;
      if (!G) return;
      const lv = op.I > 0 ? level(op.I) : 0;
      const fwd = op.Ud > 0.05;
      const vth = 26;
      const drift = fwd ? 8 + 50 * lv : op.Ud < -0.05 ? -10 : 0;
      const pCross = fwd ? 0.25 + 5 * lv * lv : 0;
      const move = (c: Carrier, sign: 1 | -1, lo: number, hi: number, other: Carrier[]): void => {
        c.a += (rng() - 0.5) * 6 * dt;
        if (c.cross > 0) {
          // durch die Sperrschicht und ein Stück in das andere Gebiet
          const v = 60 + 40 * lv;
          c.x += sign * v * dt;
          c.y += Math.sin(c.a) * vth * 0.4 * dt;
          c.cross -= v * dt;
          if (c.cross <= 0) {
            // Rekombination mit einem Partner in der Nähe
            flashes.push({ x: c.x, y: c.y, t: 0 });
            let best = -1;
            let bd = 1e9;
            other.forEach((o, i) => {
              if (o.cross > 0) return;
              const dd = Math.hypot(o.x - c.x, o.y - c.y);
              if (dd < bd) {
                bd = dd;
                best = i;
              }
            });
            // neue Ladungsträger kommen aus den Kontakten nach
            c.x = sign > 0 ? G.x0 + 3 : G.x1 - 3;
            c.y = G.y0 + 4 + rng() * (G.y1 - G.y0 - 8);
            c.cross = 0;
            if (best >= 0) {
              const o = other[best]!;
              o.x = sign > 0 ? G.x1 - 3 : G.x0 + 3;
              o.y = G.y0 + 4 + rng() * (G.y1 - G.y0 - 8);
            }
          }
          return;
        }
        c.x += (Math.cos(c.a) * vth + sign * drift) * dt;
        c.y += Math.sin(c.a) * vth * dt;
        if (c.y < G.y0 + 4) {
          c.y = G.y0 + 4;
          c.a = -c.a;
        }
        if (c.y > G.y1 - 4) {
          c.y = G.y1 - 4;
          c.a = -c.a;
        }
        if (c.x < lo) {
          c.x = lo;
          c.a = Math.PI - c.a;
        }
        if (c.x > hi) {
          // am Rand der Sperrschicht: in Durchlassrichtung gelingt der Übergang
          const atZone = sign > 0;
          if (atZone && rng() < pCross * dt * 8) c.cross = 2 * G.w + 10 + rng() * 34;
          else {
            c.x = hi;
            c.a = Math.PI - c.a;
          }
        }
      };
      for (const h of holes) move(h, 1, G.x0 + 3, G.xm - G.w - 3, electrons);
      for (const e of electrons) {
        // Elektronen: Bereich rechts, Übergang nach links
        if (e.cross > 0) {
          move(e, -1, 0, 0, holes);
          continue;
        }
        e.a += (rng() - 0.5) * 6 * dt;
        e.x += (Math.cos(e.a) * vth - drift) * dt;
        e.y += Math.sin(e.a) * vth * dt;
        if (e.y < G.y0 + 4) {
          e.y = G.y0 + 4;
          e.a = -e.a;
        }
        if (e.y > G.y1 - 4) {
          e.y = G.y1 - 4;
          e.a = -e.a;
        }
        if (e.x > G.x1 - 3) {
          e.x = G.x1 - 3;
          e.a = Math.PI - e.a;
        }
        const lo = G.xm + G.w + 3;
        if (e.x < lo) {
          if (fwd && rng() < pCross * dt * 8) e.cross = 2 * G.w + 10 + rng() * 34;
          else {
            e.x = lo;
            e.a = Math.PI - e.a;
          }
        }
      }
      flashes = flashes.map((f) => ({ ...f, t: f.t + dt })).filter((f) => f.t < 0.6);
    }

    function drawPnScene(r: Rect): void {
      const th = ctx.theme;
      card(r);
      const sm = r.w < 400;
      title(r, T('pn-Übergang im Modell', 'pn junction (model)'), sm);
      const d = dio();
      const spec = DIODES[d];
      const pad = sm ? 14 : 22;
      const x0 = r.x + pad;
      const x1 = r.x + r.w - pad;
      const y0 = r.y + (sm ? 52 : 66);
      const y1 = r.y + r.h * (sm ? 0.62 : 0.68);
      const xm = (x0 + x1) / 2;
      const w0 = (x1 - x0) * 0.075;
      const wFrac = Math.min(3.2, depletionWidth(op.Ud, spec.Ud));
      const w = ease2('pnw', w0 * wFrac, 5);
      const G = { x0, x1, y0, y1, xm, w };
      if (!pnGeo || Math.abs(pnGeo.x0 - x0) > 1 || Math.abs(pnGeo.x1 - x1) > 1 || Math.abs(pnGeo.y1 - y1) > 1) {
        holes = [];
        electrons = [];
        pnGeo = G;
        seedCarriers(G);
      }
      pnGeo = G;
      const gg = g();
      // Kristall: p-Gebiet rötlich, n-Gebiet bläulich
      gg.save();
      gg.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      gg.shadowBlur = 12;
      gg.shadowOffsetY = 3;
      const grad = gg.createLinearGradient(x0, 0, x1, 0);
      grad.addColorStop(0, withAlpha(red(), th.dark ? 0.2 : 0.12));
      grad.addColorStop(0.5, withAlpha(th.text, 0.04));
      grad.addColorStop(1, withAlpha(blue(), th.dark ? 0.22 : 0.13));
      gg.fillStyle = th.dark ? '#141b26' : '#ffffff';
      roundRect(gg, x0, y0, x1 - x0, y1 - y0, 8);
      gg.fill();
      gg.restore();
      gg.fillStyle = grad;
      roundRect(gg, x0, y0, x1 - x0, y1 - y0, 8);
      gg.fill();
      // Sperrschicht
      gg.fillStyle = withAlpha(orange(), th.dark ? 0.16 : 0.12);
      gg.fillRect(xm - w, y0, 2 * w, y1 - y0);
      line(
        [
          [xm - w, y0],
          [xm - w, y1],
        ],
        withAlpha(orange(), 0.7),
        1.2,
        [3, 3],
      );
      line(
        [
          [xm + w, y0],
          [xm + w, y1],
        ],
        withAlpha(orange(), 0.7),
        1.2,
        [3, 3],
      );
      // ortsfeste Ionen (Gitter): links Akzeptoren (−), rechts Donatoren (+)
      const sp = sm ? 20 : 24;
      const cols = Math.floor((x1 - x0) / sp);
      const rows = Math.floor((y1 - y0) / sp);
      const ox = x0 + (x1 - x0 - (cols - 1) * sp) / 2;
      const oy = y0 + (y1 - y0 - (rows - 1) * sp) / 2;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = ox + i * sp;
          const y = oy + j * sp;
          const left = x < xm;
          const inZone = Math.abs(x - xm) < w;
          const c = left ? red() : blue();
          gg.strokeStyle = withAlpha(c, inZone ? 0.95 : 0.18);
          gg.lineWidth = inZone ? 1.6 : 1;
          gg.beginPath();
          gg.arc(x, y, sm ? 5 : 6, 0, TAU);
          gg.stroke();
          rich(left ? '−' : '+', x, y + 0.5, sm ? 9 : 10, withAlpha(c, inZone ? 1 : 0.45), 'center', false, 800);
        }
      }
      // Rekombinationsblitze
      for (const f of flashes) {
        const k = 1 - f.t / 0.6;
        glow(f.x, f.y, 16 + 10 * (1 - k), '#ffe08a', k);
      }
      // bewegliche Ladungsträger
      const hr = sm ? 3.6 : 4.4;
      for (const h of holes) {
        gg.strokeStyle = red();
        gg.fillStyle = th.dark ? '#141b26' : '#ffffff';
        gg.lineWidth = 1.8;
        gg.beginPath();
        gg.arc(h.x, h.y, hr, 0, TAU);
        gg.fill();
        gg.stroke();
      }
      for (const e of electrons) dot(e.x, e.y, hr * 0.85, elecCol());
      // Kontakte
      for (const x of [x0, x1]) {
        gg.fillStyle = th.dark ? '#7d8693' : '#9aa3ae';
        gg.fillRect(x - 4, y0 + 6, 8, y1 - y0 - 12);
      }
      // Beschriftungen
      const fs = sm ? 10.5 : 12;
      rich(T('p-dotiert', 'p-doped'), x0 + 10, y0 - 12, fs, red(), 'left', true, 750);
      rich(T('n-dotiert', 'n-doped'), x1 - 10, y0 - 12, fs, blue(), 'right', true, 750);
      if (!sm) {
        rich(T('(z. B. Bor: Löcher)', '(e.g. boron: holes)'), x0 + 10 + textW(T('p-dotiert', 'p-doped'), fs, 750) + 6, y0 - 12, 10.5, th.muted, 'left', true, 600);
        rich(T('(z. B. Phosphor: Elektronen)', '(e.g. phosphorus: electrons)'), x1 - 16 - textW(T('n-dotiert', 'n-doped'), fs, 750), y0 - 12, 10.5, th.muted, 'right', true, 600);
      }
      rich(T('Sperrschicht', 'depletion layer'), xm, y1 + 12, sm ? 10 : 11, orange(), 'center', true, 750);
      // Feld in der Sperrschicht (von + nach −)
      if (w > 10) arrowPx(xm + w * 0.6, y0 + 12, xm - w * 0.6, y0 + 12, orange(), 1.8, 6);
      // Batterie unten
      const yBat = r.y + r.h - (sm ? 34 : 44);
      const fwd = !p.flip;
      const wc = wireCol();
      line(
        [
          [x0, (y0 + y1) / 2],
          [x0 - (sm ? 6 : 10), (y0 + y1) / 2],
          [x0 - (sm ? 6 : 10), yBat],
          [xm - 16, yBat],
        ],
        wc,
        2.4,
      );
      line(
        [
          [x1, (y0 + y1) / 2],
          [x1 + (sm ? 6 : 10), (y0 + y1) / 2],
          [x1 + (sm ? 6 : 10), yBat],
          [xm + 16, yBat],
        ],
        wc,
        2.4,
      );
      const br = { x: xm - 34, y: yBat - 26, w: 68, h: 44 };
      hotRing(br, 'bat');
      gg.fillStyle = th.bg;
      gg.fillRect(xm - 14, yBat - 16, 28, 32);
      battery(xm, yBat, sm ? 13 : 16, false, fwd);
      addHit({ id: 'bat', label: T('Batterie umpolen', 'Reverse the battery'), r: br, act: doFlip });
      rich(fwd ? '+' : '−', xm - 26, yBat - 14, 13, fwd ? red() : blue(), 'center', false, 800);
      rich(fwd ? '−' : '+', xm + 26, yBat - 14, 13, fwd ? blue() : red(), 'center', false, 800);
      // Elektronen in den Leitungen
      const wpath = new Path([
        [x1, (y0 + y1) / 2],
        [x1 + (sm ? 6 : 10), (y0 + y1) / 2],
        [x1 + (sm ? 6 : 10), yBat],
        [xm + 16, yBat],
      ]);
      const wpath2 = new Path([
        [xm - 16, yBat],
        [x0 - (sm ? 6 : 10), yBat],
        [x0 - (sm ? 6 : 10), (y0 + y1) / 2],
        [x0, (y0 + y1) / 2],
      ]);
      carriers(wpath, 'pnw', sm ? 16 : 20, sm ? 2.3 : 2.8, elecCol());
      carriers(wpath2, 'pnw', sm ? 16 : 20, sm ? 2.3 : 2.8, elecCol());
      const st = fwd ? (op.I > 1e-4 ? T('Durchlassrichtung: Sperrschicht abgebaut, Strom fließt', 'forward: layer reduced, current flows') : T('Durchlassrichtung: U zu klein, kaum Strom', 'forward: U too small, little current')) : T('Sperrrichtung: Sperrschicht wird breiter', 'reverse: depletion layer widens');
      rich(st, xm, yBat + (sm ? 22 : 26), sm ? 10 : 11.5, fwd && op.I > 1e-4 ? green() : fwd ? th.muted : red(), 'center', true, 700);
      if (showVal()) pill(x1 + 4, yBat - (sm ? 22 : 26), `U = ${volt(op.Ud, 2)}`, orange(), 'right', sm ? 10 : 11.5, r);
      // Legende
      const ly = r.y + (sm ? 16 : 20);
      const lx = r.x + r.w - 14;
      const w1 = rich(T('Elektron', 'electron'), lx, ly, sm ? 10 : 10.5, th.muted, 'right', false, 600);
      dot(lx - w1 - 8, ly, hr * 0.85, elecCol());
      const lx2 = lx - w1 - 22;
      const w2 = rich(T('Loch', 'hole'), lx2, ly, sm ? 10 : 10.5, th.muted, 'right', false, 600);
      gg.strokeStyle = red();
      gg.lineWidth = 1.6;
      gg.beginPath();
      gg.arc(lx2 - w2 - 8, ly, hr, 0, TAU);
      gg.stroke();
    }

    function drawPnCard(R: Rect): void {
      const d = dio();
      const spec = DIODES[d];
      const wf = depletionWidth(op.Ud, spec.Ud);
      const fwd = op.Ud > 0;
      const rows: [string, string][] = [
        [T(`Diffusionsspannung U_d ≈ ${n(spec.Ud, 2)} V (${DIODE_LABEL[d].de})`, `Built-in voltage U_d ≈ ${n(spec.Ud, 2)} V (${DIODE_LABEL[d].en})`), orange()],
        [T(`Breite w / w₀ = √((U_d − U) / U_d) ≈ ${n(wf, 2)}`, `Width w / w₀ = √((U_d − U) / U_d) ≈ ${n(wf, 2)}`), ctx.theme.text],
        [fwd ? T('Ladungsträger rekombinieren an der Grenze.', 'Carriers recombine at the junction.') : T('Die Ladungsträger werden weggezogen.', 'The carriers are pulled away.'), fwd ? green() : red()],
        [showVal() ? `I = ${amp(op.I)}` : 'I = ?', blue()],
      ];
      rowsCard(R, T('Sperrschicht', 'Depletion layer'), rows, orange());
    }

    /* ================================================================== */
    /* Ansicht 3: Leuchtdioden                                             */
    /* ================================================================== */
    function ledOps(): Record<string, DiodeOp> {
      const out: Record<string, DiodeOp> = {};
      for (const id of LED_IDS) out[id] = diodeCircuit(id, p.U, p.R);
      return out;
    }

    function drawLedScene(r: Rect): void {
      const th = ctx.theme;
      card(r);
      const sm = r.w < 400;
      title(r, T('Vier LEDs, gleiche Spannung', 'Four LEDs, same voltage'), sm);
      const ops = ledOps();
      const wc = wireCol();
      const pad = sm ? 14 : 22;
      const bw = sm ? 74 : 104;
      const bh = sm ? 66 : 90;
      const yT = r.y + (sm ? 46 : 62);
      const yB = r.y + r.h - (sm ? 26 : 36);
      const xS = r.x + pad + bw / 2;
      const S = supplyBox(xS, (yT + yB) / 2, bw, bh, p.U, sm);
      const xa = S.plus[0] + (sm ? 26 : 40);
      const xb = r.x + r.w - (sm ? 22 : 34);
      line([S.plus, [S.plus[0] + 12, S.plus[1]], [S.plus[0] + 12, yT], [xb, yT]], wc, 2.4);
      line([S.minus, [S.minus[0] + 12, S.minus[1]], [S.minus[0] + 12, yB], [xb, yB]], wc, 2.4);
      const nL = LED_IDS.length;
      const s = sm ? 20 : 28;
      LED_IDS.forEach((id, i) => {
        const x = xa + ((xb - xa) * (i + 0.5)) / nL;
        const o = ops[id]!;
        const yRes = yT + (yB - yT) * 0.24;
        const yLed = yT + (yB - yT) * 0.62;
        line(
          [
            [x, yT],
            [x, yB],
          ],
          wc,
          2.2,
        );
        dot(x, yT, 3, wc);
        dot(x, yB, 3, wc);
        resistor(x, yRes, sm ? 30 : 40, sm ? 11 : 14, true, 0);
        const k = clamp(o.I / 0.02, 0, 1.2);
        const sel = dio() === id;
        const cr = { x: x - s * 0.95, y: yLed - s * 1.35, w: s * 1.9, h: s * 2.6 };
        hotRing(cr, `led-${id}`, LED_LIGHT[id]!);
        g().fillStyle = th.bg;
        g().fillRect(x - 3, yLed - s * 0.9, 6, s * 2);
        ledBody(x, yLed, s, LED_LIGHT[id]!, Math.min(1, k), sel);
        addHit({ id: `led-${id}`, label: DIODE_LABEL[id][ctx.lang], r: cr, act: () => ctx.set({ d: id }) });
        const lam = DIODES[id].lambda!;
        rich(`${n(lam, 0)} nm`, x, yB + (sm ? 12 : 14), sm ? 10 : 11, sel ? diodeColor(id) : th.muted, 'center', true, sel ? 800 : 600);
        if (showVal()) rich(amp(o.I, 2), x, (yT + yRes - (sm ? 15 : 20)) / 2, sm ? 9.5 : 10.5, diodeColor(id), 'center', true, 700);
        const path = new Path([
          [x, yT],
          [x, yB],
        ]);
        flows.set(`led-${id}`, flowOf(`led-${id}`));
        carriers(path, `led-${id}`, sm ? 15 : 18, sm ? 2 : 2.4, elecCol(), 0.75);
      });
      rich(`R = ${n(p.R, 0)} Ω ${T('je Zweig', 'each')}`, xa - 4, yT + (yB - yT) * 0.24, sm ? 10 : 11, th.muted, 'right', true, 650);
    }

    function drawLedChart(R: Rect): void {
      const ops = ledOps();
      const top = niceCeil(Math.max(20, ...Object.values(ops).map((o) => o.I * 1e3 * 1.1)));
      const y1 = ease2('ly1', top, 5);
      const ax = axesFrame(R, T('Kennlinien der LEDs', 'LED characteristics'), 'U in V', 'I in mA', 0, 3.5, -0.06 * y1, y1);
      clipTo(ax.A);
      for (const id of LED_IDS) {
        const sel = dio() === id;
        if (p.curve) curve(ax, (u) => diodeCurrent(id, u) * 1e3, diodeColor(id), sel ? 3 : 1.8, [], sel ? 1 : 0.55);
        const Us = thresholdVoltage(id);
        if (sel) {
          line(
            [
              [ax.X(Us), ax.Y(0)],
              [ax.X(Us), ax.Y(10)],
            ],
            withAlpha(diodeColor(id), 0.8),
            1.3,
            [3, 3],
          );
        }
      }
      g().restore();
      for (const id of LED_IDS) {
        const o = ops[id]!;
        const Ud = ease2(`lud-${id}`, o.Ud, 7);
        opPoint(ax.X(Ud), ax.Y(clamp(diodeCurrent(id, Ud) * 1e3, ax.y0, ax.y1 * 1.03)), diodeColor(id), dio() === id, dio() === id);
      }
      const sel = dio();
      if (isLed(sel)) {
        const Us = thresholdVoltage(sel);
        const lab = showVal() ? `U_S ≈ ${n(Us, 2)} V` : 'U_S';
        rich(lab, ax.X(Us) - 6, ax.Y(10) - 10, ax.fs, diodeColor(sel), 'right', true, 750);
        dragZones.push({
          kind: 'ud',
          r: ax.A,
          handle: null,
          toValue: (qx) => {
            if (ctx.locked) return;
            const ud = Math.max(0, ax.xv(qx));
            ctx.set({ U: clamp(sourceForDiodeVoltage(sel, ud, p.R), 0, U_MAX) });
          },
        });
      }
    }

    function drawLedCard(R: Rect): void {
      const v = showVal();
      const pts = LED_IDS.map((id) => ({ id, U: thresholdVoltage(id), f: frequencyOf(DIODES[id].lambda!) }));
      const h = planckFromLeds(pts);
      const sel = isLed(dio()) ? dio() : 'red';
      const q = pts.find((x) => x.id === sel)!;
      const rows: [string, string][] = [
        [`${DIODE_LABEL[sel][ctx.lang]}: λ = ${n(DIODES[sel].lambda!, 0)} nm,  f = c / λ = ${sci(q.f)} Hz`, diodeColor(sel)],
        [v ? `e · U_S ≈ ${n(q.U, 2)} eV  ≈  h · f = ${n(photonEnergyEV(DIODES[sel].lambda!), 2)} eV` : 'e · U_S ≈ h · f', ctx.theme.text],
        [T('Blau: höhere Frequenz → höhere Spannung', 'Blue: higher frequency → higher voltage'), orange()],
        [v && h ? T(`Ausgleichsgerade e·U_S über f:  h ≈ ${sci(h)} J·s`, `Best-fit line e·U_S against f:  h ≈ ${sci(h)} J·s`) : T('Steigung von e·U_S über f: h = ?', 'Slope of e·U_S against f: h = ?'), purple()],
      ];
      rowsCard(R, T('Farbe und Schwellspannung', 'Colour and threshold'), rows, diodeColor(sel));
    }

    /* ================================================================== */
    /* Ansicht 4: Gleichrichter                                            */
    /* ================================================================== */
    /** Index der Messreihe am Strahl des Oszilloskops. */
    const beamIndex = () => clamp(Math.floor((scopeT / (wave.t[wave.t.length - 1]! || 1)) * (wave.t.length - 1)), 0, wave.t.length - 1);

    function drawRectScene(r: Rect): void {
      const th = ctx.theme;
      card(r);
      const sm = r.w < 400;
      const bridge = p.rc === 'bridge';
      title(r, bridge ? T('Brückengleichrichter', 'Bridge rectifier') : T('Einweggleichrichter', 'Half-wave rectifier'), sm);
      const wc = wireCol();
      const bi = beamIndex();
      const uin = wave.uin[bi]!;
      const conducting = wave.on[bi]!;
      const pos = uin >= 0;
      const pad = sm ? 16 : 26;
      const yT = r.y + (sm ? 52 : 70);
      const yB = r.y + r.h - (sm ? 34 : 48);
      const yM = (yT + yB) / 2;
      const xS = r.x + pad + (sm ? 16 : 22);
      const rs = sm ? 15 : 20;
      const xL = r.x + r.w - (sm ? 40 : 60);
      const xC = xL - (sm ? 44 : 64);
      const act = withAlpha(orange(), 0.95);
      const s = sm ? 20 : 26;
      const IL = wave.uout[bi]! / (p.RL * 1e3);
      // Quelle (Wechselspannung)
      const pathFwd: Pt[][] = [];
      if (!bridge) {
        const xD = (xS + xC) / 2;
        line(
          [
            [xS, yM - rs],
            [xS, yT],
            [xL, yT],
            [xL, yB],
            [xS, yB],
            [xS, yM + rs],
          ],
          wc,
          2.4,
        );
        const on = conducting;
        const dr = { x: xD - s * 1.2, y: yT - s * 1.1, w: s * 2.4, h: s * 2.2 };
        hotRing(dr, 'kind');
        g().fillStyle = th.bg;
        g().fillRect(xD - s * 0.6, yT - 3, s * 1.2, 6);
        diodeSym(xD, yT, s, 0, on ? act : wc, on ? withAlpha(orange(), 0.4) : th.bg, on ? 0.6 : 0);
        rich('D', xD, yT - s * 0.95, sm ? 10.5 : 12, th.text, 'center', true, 750);
        addHit({ id: 'kind', label: T('Brückengleichrichter', 'Bridge rectifier'), r: dr, act: () => ctx.set({ rc: 'bridge' }) });
        if (on) {
          pathFwd.push([
            [xS, yM - rs],
            [xS, yT],
            [xL, yT],
            [xL, yB],
            [xS, yB],
            [xS, yM + rs],
          ]);
        }
      } else {
        // Brücke: Raute; Wechselspannung an oben/unten? Hier: links (L) und rechts (R), Gleichspannung oben (+) und unten (−)
        const xc = (xS + xC) / 2;
        const rd = Math.min((yB - yT) * 0.34, (xC - xS) * 0.32);
        const Lc: Pt = [xc - rd, yM];
        const Rc: Pt = [xc + rd, yM];
        const Tc: Pt = [xc, yM - rd];
        const Bc: Pt = [xc, yM + rd];
        const yUp = yT - 0;
        const yDn = yB - (sm ? 14 : 18);
        const yRet = yB;
        // Wechselspannung: oben an L, unten an R
        line([[xS, yM - rs], [xS, yM - rd * 0.9], [Lc[0] - 0.001, yM - rd * 0.9], Lc], wc, 2.4);
        line([[xS, yM + rs], [xS, yDn], [Rc[0], yDn], Rc], wc, 2.4);
        // Gleichspannung: + oben, − unten
        line([Tc, [xc, yUp], [xL, yUp], [xL, yRet], [xc + 9, yRet]], wc, 2.4);
        line([Bc, [xc, yDn - 9]], wc, 2.4);
        // Sprung über die Leitung bei yDn
        const gg = g();
        gg.strokeStyle = wc;
        gg.lineWidth = 2.4;
        gg.beginPath();
        gg.arc(xc, yDn, 9, -Math.PI / 2, Math.PI / 2, false);
        gg.stroke();
        line(
          [
            [xc, yDn + 9],
            [xc, yRet],
            [xc + 9, yRet],
          ],
          wc,
          2.4,
        );
        // Dioden: D1 L→T, D2 R→T, D3 B→R, D4 B→L
        const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const angle = (a: Pt, b: Pt) => Math.atan2(b[1] - a[1], b[0] - a[0]);
        const ds: { a: Pt; b: Pt; on: boolean; name: string }[] = [
          { a: Lc, b: Tc, on: conducting && pos, name: 'D1' },
          { a: Rc, b: Tc, on: conducting && !pos, name: 'D2' },
          { a: Bc, b: Rc, on: conducting && pos, name: 'D3' },
          { a: Bc, b: Lc, on: conducting && !pos, name: 'D4' },
        ];
        const br = { x: xc - rd - 14, y: yM - rd - 14, w: 2 * rd + 28, h: 2 * rd + 28 };
        hotRing(br, 'kind');
        addHit({ id: 'kind', label: T('Einweggleichrichter', 'Half-wave rectifier'), r: br, act: () => ctx.set({ rc: 'half' }) });
        for (const q of ds) {
          line([q.a, q.b], q.on ? act : wc, q.on ? 3 : 2.4);
        }
        for (const q of ds) {
          const m = mid(q.a, q.b);
          diodeSym(m[0], m[1], s * 0.8, angle(q.a, q.b), q.on ? act : wc, q.on ? withAlpha(orange(), 0.4) : th.bg, q.on ? 0.6 : 0);
          const off = q.name === 'D1' || q.name === 'D4' ? -1 : 1;
          rich(q.name, m[0] + off * (sm ? 14 : 18), m[1] + (q.name === 'D1' || q.name === 'D2' ? -10 : 10), sm ? 9.5 : 10.5, q.on ? orange() : th.muted, 'center', true, 750);
        }
        for (const c of [Lc, Rc, Tc, Bc]) dot(c[0], c[1], 3.2, wc);
        if (conducting) {
          if (pos) {
            pathFwd.push([[xS, yM - rs], [xS, yM - rd * 0.9], [Lc[0], yM - rd * 0.9], Lc, Tc, [xc, yUp], [xL, yUp], [xL, yRet], [xc, yRet], Bc, Rc, [Rc[0], yDn], [xS, yDn], [xS, yM + rs]]);
          } else {
            pathFwd.push([[xS, yM + rs], [xS, yDn], [Rc[0], yDn], Rc, Tc, [xc, yUp], [xL, yUp], [xL, yRet], [xc, yRet], Bc, Lc, [Lc[0], yM - rd * 0.9], [xS, yM - rd * 0.9], [xS, yM - rs]]);
          }
        }
        rich('+', xc + 12, yUp + 12, 13, red(), 'center', false, 800);
        rich('−', xc + 20, yRet - 10, 13, blue(), 'center', false, 800);
      }
      // Quelle
      const gg = g();
      gg.fillStyle = th.dark ? '#141b26' : '#ffffff';
      gg.strokeStyle = wc;
      gg.lineWidth = 2.2;
      gg.beginPath();
      gg.arc(xS, yM, rs, 0, TAU);
      gg.fill();
      gg.stroke();
      const sine: Pt[] = [];
      for (let i = 0; i <= 24; i++) sine.push([xS - rs * 0.6 + (1.2 * rs * i) / 24, yM - Math.sin((i / 24) * TAU) * rs * 0.35]);
      line(sine, ctx.theme.text, 1.8);
      rich('u_ein', xS, yM - rs - 12, sm ? 10.5 : 12, CH1(), 'center', true, 750);
      // Last und Kondensator
      const yTop = bridge ? yT : yT;
      resistor(xL, yM, sm ? 40 : 54, sm ? 13 : 16, true, 0);
      rich(`R_L = ${n(p.RL, 1)} kΩ`, xL + (sm ? 10 : 14), yM + (sm ? 34 : 44), sm ? 10 : 11, th.text, 'right', true, 650);
      const cOn = p.cap;
      const capCol = cOn ? purple() : withAlpha(wc, 0.4);
      line(
        [
          [xC, yTop],
          [xC, yM - 6],
        ],
        cOn ? wc : withAlpha(wc, 0.35),
        2.2,
        cOn ? [] : [4, 4],
      );
      line(
        [
          [xC, yM + 6],
          [xC, yB],
        ],
        cOn ? wc : withAlpha(wc, 0.35),
        2.2,
        cOn ? [] : [4, 4],
      );
      if (cOn) {
        dot(xC, yTop, 3, wc);
        dot(xC, yB, 3, wc);
      }
      g().fillStyle = th.bg;
      capSym(xC, yM, sm ? 24 : 30, sm ? 9 : 12, true, capCol);
      const cr = { x: xC - 24, y: yM - 30, w: 48, h: 60 };
      hotRing(cr, 'cap', purple());
      addHit({ id: 'cap', label: T('Glättungskondensator', 'Smoothing capacitor'), r: cr, act: () => ctx.set({ cap: !p.cap }) });
      rich(cOn ? `C = ${n(p.C, 0)} µF` : T('C (antippen)', 'C (tap)'), xC - (sm ? 16 : 20), yM, sm ? 10 : 11, cOn ? purple() : th.muted, 'right', true, 700);
      // Ausgangsspannung
      rich('u_aus', xL + (sm ? 12 : 18), yT - 12, sm ? 10.5 : 12, CH2(), 'right', true, 750);
      // Ladungsträger
      for (const pts of pathFwd) carriers(new Path(pts), 'rect', sm ? 15 : 18, sm ? 2.2 : 2.6, elecCol());
      if (!conducting && p.cap && IL > 1e-5) {
        // der Kondensator speist die Last allein
        carriers(
          new Path([
            [xC, yM - 6],
            [xC, yT],
            [xL, yT],
            [xL, yB],
            [xC, yB],
            [xC, yM + 6],
          ]),
          'rectC',
          sm ? 15 : 18,
          sm ? 2.2 : 2.6,
          withAlpha(purple(), 0.9),
        );
      }
      if (showVal()) {
        pill(xS + rs + 6, yB + (sm ? 16 : 22), `u_ein = ${volt(uin, 1)}`, CH1(), 'left', sm ? 10 : 11.5, r);
        pill(xL + 6, yB + (sm ? 16 : 22), `u_aus = ${volt(wave.uout[bi]!, 1)}`, CH2(), 'right', sm ? 10 : 11.5, r);
      }
      if (!sm && !ctx.locked) rich(T('(Gleichrichter antippen: umschalten)', '(tap the rectifier to switch)'), r.x + r.w / 2 - 20, r.y + (sm ? 36 : 44), 10, th.muted, 'center', true, 600);
    }

    const CH1 = () => (ctx.theme.dark ? '#ffd166' : '#b07b00');
    const CH2 = () => (ctx.theme.dark ? '#5ee3ff' : '#0b7fa3');

    function drawScope(R: Rect): void {
      const th = ctx.theme;
      card(R);
      const sm = R.w < 440 || R.h < 200;
      title(R, T('Oszilloskop', 'Oscilloscope'), sm);
      const pad = sm ? 10 : 14;
      const top = R.y + (sm ? 30 : 38);
      const S: Rect = { x: R.x + pad, y: top, w: R.w - 2 * pad, h: R.y + R.h - top - (sm ? 24 : 30) };
      const gg = g();
      gg.save();
      gg.fillStyle = '#0b1712';
      roundRect(gg, S.x, S.y, S.w, S.h, 8);
      gg.fill();
      gg.clip();
      const vdiv = [1, 2, 3, 4, 5].find((v) => v * 3.6 >= p.Uh) ?? 5;
      const divX = 10;
      const divY = 8;
      gg.strokeStyle = 'rgba(120,220,170,0.14)';
      gg.lineWidth = 1;
      gg.beginPath();
      for (let i = 1; i < divX; i++) {
        const x = Math.round(S.x + (S.w * i) / divX) + 0.5;
        gg.moveTo(x, S.y);
        gg.lineTo(x, S.y + S.h);
      }
      for (let j = 1; j < divY; j++) {
        const y = Math.round(S.y + (S.h * j) / divY) + 0.5;
        gg.moveTo(S.x, y);
        gg.lineTo(S.x + S.w, y);
      }
      gg.stroke();
      gg.strokeStyle = 'rgba(120,220,170,0.3)';
      gg.beginPath();
      gg.moveTo(S.x, Math.round(S.y + S.h / 2) + 0.5);
      gg.lineTo(S.x + S.w, Math.round(S.y + S.h / 2) + 0.5);
      gg.moveTo(Math.round(S.x + S.w / 2) + 0.5, S.y);
      gg.lineTo(Math.round(S.x + S.w / 2) + 0.5, S.y + S.h);
      gg.stroke();
      const N = wave.t.length - 1;
      const X = (i: number) => S.x + (S.w * i) / N;
      const Y = (u: number) => S.y + S.h / 2 - (u / vdiv) * (S.h / divY);
      const bi = reduced || !ctx.clock.playing ? N : beamIndex();
      const trace = (arr: number[], col: string, from: number, to: number, alpha: number, width: number) => {
        if (to <= from) return;
        gg.save();
        gg.strokeStyle = withAlpha(col, alpha);
        gg.lineWidth = width;
        gg.shadowColor = withAlpha(col, 0.8 * alpha);
        gg.shadowBlur = 6;
        gg.lineJoin = 'round';
        gg.beginPath();
        for (let i = from; i <= to; i++) {
          if (i === from) gg.moveTo(X(i), Y(arr[i]!));
          else gg.lineTo(X(i), Y(arr[i]!));
        }
        gg.stroke();
        gg.restore();
      };
      const c1 = '#ffd166';
      const c2 = '#5ee3ff';
      // Nachleuchten des letzten Durchlaufs
      trace(wave.uin, c1, bi, N, 0.25, 1.6);
      trace(wave.uout, c2, bi, N, 0.3, 2);
      trace(wave.uin, c1, 0, bi, 0.95, 1.8);
      trace(wave.uout, c2, 0, bi, 1, 2.4);
      // Spitzenwert und Mittelwert
      if (showVal()) {
        const ym = Y(wave.mean);
        gg.setLineDash([5, 4]);
        gg.strokeStyle = 'rgba(94,227,255,0.6)';
        gg.lineWidth = 1.2;
        gg.beginPath();
        gg.moveTo(S.x, ym);
        gg.lineTo(S.x + S.w, ym);
        gg.stroke();
        gg.setLineDash([]);
        rich(`ū = ${volt(wave.mean, 2)}`, S.x + S.w - 6, ym - 9, sm ? 9.5 : 10.5, '#9ff0ff', 'right', false, 700);
      }
      if (bi < N) {
        dot(X(bi), Y(wave.uin[bi]!), 3, '#fff2c4');
        dot(X(bi), Y(wave.uout[bi]!), 3.5, '#d8fbff');
      }
      gg.restore();
      const fs = sm ? 9.5 : 10.5;
      rich(sm ? `CH1 ${n(vdiv, 0)} V/div` : `CH1 u_ein ${n(vdiv, 0)} V/div`, S.x + 2, S.y + S.h + (sm ? 11 : 14), fs, CH1(), 'left', false, 700);
      rich(sm ? `CH2 ${n(vdiv, 0)} V/div` : `CH2 u_aus ${n(vdiv, 0)} V/div`, S.x + S.w / 2 + (sm ? 0 : 4), S.y + S.h + (sm ? 11 : 14), fs, CH2(), 'left', false, 700);
      rich('4 ms/div', S.x + S.w - 2, S.y + S.h + (sm ? 11 : 14), fs, th.muted, 'right', false, 650);
      if (!reduced) rich(T('Zeitlupe 1 : 75', 'slow motion 1 : 75'), R.x + R.w - 14, R.y + (sm ? 16 : 20), fs, purple(), 'right', false, 650);
    }

    function drawRectCard(R: Rect): void {
      const v = showVal();
      const kind = p.rc as RectKind;
      const nd = kind === 'bridge' ? 2 : 1;
      const rows: [string, string][] = [
        [`Û = ${volt(p.Uh, 1)},  U_eff = Û / √2 = ${volt(rms(p.Uh), 2)},  f = 50 Hz`, CH1()],
        [v ? `û_aus = Û − ${nd > 1 ? '2 · ' : ''}U_F = ${n(p.Uh, 1)} V − ${n(nd * U_F, 1)} V = ${volt(rectPeak(p.Uh, kind), 1)}` : `û_aus = Û − ${nd > 1 ? '2 · ' : ''}U_F = ?`, CH2()],
        [
          v
            ? p.cap
              ? T(`ū ≈ ${volt(wave.mean, 2)} (mit C deutlich größer)`, `ū ≈ ${volt(wave.mean, 2)} (much larger with C)`)
              : `ū = ${volt(rectMean(p.Uh, kind), 2)}  (${kind === 'bridge' ? T('Brücke: beide Halbwellen', 'bridge: both half-waves') : T('Einweg: nur jede zweite', 'half-wave: every other')})`
            : 'ū = ?',
          ctx.theme.text,
        ],
        [
          p.cap
            ? v
              ? T(`Brummen ΔU ≈ ${volt(wave.ripple, 2)} (Näherung I / (f_B·C) ≈ ${volt(rippleEstimate(p.Uh, kind, p.C * 1e-6, p.RL * 1e3), 2)})`, `Ripple ΔU ≈ ${volt(wave.ripple, 2)} (estimate I / (f_r·C) ≈ ${volt(rippleEstimate(p.Uh, kind, p.C * 1e-6, p.RL * 1e3), 2)})`)
              : T('Brummspannung ΔU = ?', 'Ripple ΔU = ?')
            : T('Ohne Kondensator: pulsierende Gleichspannung', 'Without capacitor: pulsating DC'),
          purple(),
        ],
      ];
      rowsCard(R, T('Auswertung', 'Analysis'), rows, CH2());
    }

    /* ================================================================== */
    /* Ansicht 5: Transistor als Schalter                                  */
    /* ================================================================== */
    function drawSwitchScene(r: Rect): void {
      const th = ctx.theme;
      card(r);
      const sm = r.w < 400;
      const ldr = p.bs === 'ldr';
      title(r, ldr ? T('Dämmerungsschalter', 'Twilight switch') : T('Transistor als Schalter', 'Transistor as a switch'), sm);
      const wc = wireCol();
      const pad = sm ? 14 : 22;
      const yT = r.y + (sm ? 44 : 58);
      const yB = r.y + r.h - (sm ? 22 : 30);
      const xBat = r.x + pad + (sm ? 10 : 14);
      const xRight = r.x + r.w - (sm ? 40 : 60);
      const qs = sm ? 21 : 34;
      const xQ = xRight - qs * 0.42;
      const yQ = yT + (yB - yT) * 0.64;
      const xK = r.x + r.w * (ldr ? 0.5 : 0.44);
      const lampY = yT + (yB - yT) * 0.26;
      const kLamp = ease2('lamp', clamp(sw.IC / (U_B / LAMP_R), 0, 1), 6);
      // Schienen
      line(
        [
          [xBat, yT],
          [xRight, yT],
        ],
        wc,
        2.4,
      );
      line(
        [
          [xBat, yB],
          [xRight, yB],
        ],
        wc,
        2.4,
      );
      line(
        [
          [xBat, yT],
          [xBat, (yT + yB) / 2 - 8],
        ],
        wc,
        2.4,
      );
      line(
        [
          [xBat, (yT + yB) / 2 + 8],
          [xBat, yB],
        ],
        wc,
        2.4,
      );
      g().fillStyle = th.bg;
      battery(xBat, (yT + yB) / 2, sm ? 12 : 15, true, true);
      rich('9 V', xBat + (sm ? 18 : 22), (yT + yB) / 2, sm ? 11 : 12, th.text, 'left', true, 750);
      rich('+', xBat - (sm ? 14 : 18), (yT + yB) / 2 - 10, 12, red(), 'center', false, 800);
      // Kollektorkreis: Lampe
      const T0 = npn(xQ, yQ, qs, clamp(sw.IC / 0.04, 0, 1));
      line(
        [
          [xRight, yT],
          [xRight, lampY - (sm ? 14 : 18)],
        ],
        wc,
        2.4,
      );
      line(
        [
          [xRight, lampY + (sm ? 14 : 18)],
          [xRight, T0.c[1]],
          T0.c,
        ],
        wc,
        2.4,
      );
      line([T0.e, [xRight, T0.e[1]], [xRight, yB]], wc, 2.4);
      dot(xRight, yT, 3, wc);
      lampSym(xRight, lampY, sm ? 14 : 18, kLamp);
      rich(T('Lampe', 'lamp'), xRight - (sm ? 20 : 26), lampY - (sm ? 8 : 10), sm ? 10 : 11, th.muted, 'right', true, 650);
      rich('C', T0.c[0] + 8, T0.c[1] + 4, sm ? 10 : 11, th.muted, 'left', true, 700);
      rich('E', T0.e[0] + 8, T0.e[1] - 4, sm ? 10 : 11, th.muted, 'left', true, 700);
      rich('B', T0.b[0] + 4, T0.b[1] - 10, sm ? 10 : 11, th.muted, 'center', true, 700);
      // Basiskreis
      const paths: { p: Path; key: string; r: number; col: string }[] = [];
      if (!ldr) {
        const yKey = yT + (yB - yT) * 0.3;
        line(
          [
            [xK, yT],
            [xK, yKey - 10],
          ],
          wc,
          2.4,
        );
        line(
          [
            [xK, yKey + 10],
            [xK, yQ],
            [T0.b[0], yQ],
          ],
          wc,
          2.4,
        );
        dot(xK, yT, 3, wc);
        // Taster
        const pr = ease2('press', p.on ? 1 : 0, 14);
        const kr = { x: xK - 30, y: yKey - 24, w: 60, h: 48 };
        hotRing(kr, 'key');
        dot(xK, yKey - 10, 3.2, wc);
        dot(xK, yKey + 10, 3.2, wc);
        const bx = xK - 8 + pr * 6;
        line(
          [
            [bx, yKey - 14],
            [bx, yKey + 14],
          ],
          p.on ? orange() : wc,
          3,
        );
        line(
          [
            [bx, yKey],
            [bx - 14, yKey],
          ],
          p.on ? orange() : wc,
          2.4,
        );
        line(
          [
            [bx - 14, yKey - 7],
            [bx - 14, yKey + 7],
          ],
          p.on ? orange() : wc,
          2.4,
        );
        addHit({ id: 'key', label: T('Taster', 'Push button'), r: kr, act: () => ctx.set({ on: !p.on }) });
        rich(T('Taster', 'button'), xK - 22, yKey - (sm ? 18 : 22), sm ? 10 : 11, p.on ? orange() : th.muted, 'right', true, 700);
        if (!sm && !ctx.locked) rich(`(${T('antippen', 'tap')})`, xK - 22, yKey + 18, 10, th.muted, 'right', true, 600);
        const xRB = (xK + T0.b[0]) / 2;
        resistor(xRB, yQ, sm ? 34 : 46, sm ? 11 : 14, false, 0);
        rich(`R_B = ${n(RB_KEY / 1000, 1)} kΩ`, xRB, yQ - (sm ? 16 : 20), sm ? 10 : 11, th.text, 'center', true, 650);
        if (sw.IB > 0) paths.push({ p: new Path([[xBat, yT], [xK, yT], [xK, yQ], [T0.b[0], yQ], T0.b, [xQ, yQ], T0.e, [xRight, T0.e[1]], [xRight, yB], [xBat, yB]]), key: 'base', r: sm ? 1.8 : 2.1, col: withAlpha(elecCol(), 0.8) });
      } else {
        // Spannungsteiler: R1 oben, LDR unten
        const yR1 = yT + (yB - yT) * 0.42;
        const yLdr = yT + (yB - yT) * 0.82;
        line(
          [
            [xK, yT],
            [xK, yB],
          ],
          wc,
          2.4,
        );
        dot(xK, yT, 3, wc);
        dot(xK, yB, 3, wc);
        dot(xK, yQ, 3, wc);
        line(
          [
            [xK, yQ],
            [T0.b[0], yQ],
          ],
          wc,
          2.4,
        );
        resistor(xK, yR1, sm ? 32 : 42, sm ? 12 : 15, true, 0);
        // Pfeil durch R1 (einstellbar)
        arrowPx(xK - 14, yR1 + 14, xK + 14, yR1 - 14, wc, 1.6, 6);
        rich(sm ? 'R₁' : `R₁ = ${n(p.R1, 0)} kΩ`, xK + (sm ? 12 : 16), yR1, sm ? 10 : 11, th.text, 'left', true, 650);
        const rl = resistor(xK, yLdr, sm ? 28 : 36, sm ? 12 : 15, true, 0);
        g().strokeStyle = wc;
        g().lineWidth = 1.6;
        g().beginPath();
        g().arc(xK, yLdr, sm ? 18 : 23, 0, TAU);
        g().stroke();
        void rl;
        rich('LDR', xK + (sm ? 22 : 28), yLdr, sm ? 10 : 11, th.text, 'left', true, 700);
        const xRB = (xK + T0.b[0]) / 2;
        resistor(xRB, yQ, sm ? 30 : 40, sm ? 11 : 14, false, 0);
        rich(`${n(RB_DIV / 1000, 0)} kΩ`, xRB, yQ - (sm ? 15 : 19), sm ? 10 : 11, th.muted, 'center', true, 650);
        // Himmel (ziehen: Helligkeit)
        const skyX = xBat + (sm ? 40 : 52);
        const skyR: Rect = { x: skyX, y: yT + (sm ? 14 : 20), w: xK - skyX - (sm ? 28 : 40), h: yB - yT - (sm ? 28 : 40) };
        drawSky(skyR, sm);
        dragZones.push({ kind: 'sky', r: skyR, handle: null, toValue: (_qx, qy) => !ctx.locked && ctx.set({ E: Math.round(clamp(100 * (1 - (qy - skyR.y) / skyR.h), 0, 100)) }) });
        // Lichtstrahlen zum LDR
        const k = p.E / 100;
        for (let i = -1; i <= 1; i++) {
          arrowPx(skyR.x + skyR.w + 4, yLdr + i * 8 - 10, xK - (sm ? 20 : 26), yLdr + i * 5, withAlpha('#f2b705', 0.25 + 0.7 * k), 1.6, 6);
        }
        const div = sw.Udiv ?? 0;
        const Iq = U_B / (p.R1 * 1e3 + (sw.Rldr ?? 1e6));
        if (Iq > 1e-7) paths.push({ p: new Path([[xBat, yT], [xK, yT], [xK, yB], [xBat, yB]]), key: 'div', r: sm ? 1.6 : 1.9, col: withAlpha(elecCol(), 0.55) });
        if (sw.IB > 1e-7) paths.push({ p: new Path([[xK, yQ], [T0.b[0], yQ], T0.b, [xQ, yQ], T0.e, [xRight, T0.e[1]], [xRight, yB], [xK, yB]]), key: 'base', r: sm ? 1.8 : 2.1, col: withAlpha(elecCol(), 0.8) });
        if (showVal()) pill(xK + 8, yQ + (sm ? 16 : 20), `U = ${volt(div, 2)}`, orange(), 'left', sm ? 10 : 11, r);
      }
      if (sw.IC > 1e-7) paths.push({ p: new Path([[xBat, yT], [xRight, yT], [xRight, T0.c[1]], T0.c, [xQ, yQ], T0.e, [xRight, T0.e[1]], [xRight, yB], [xBat, yB]]), key: 'coll', r: sm ? 2.5 : 3, col: elecCol() });
      for (const q of paths) carriers(q.p, q.key, sm ? 14 : 18, q.r, q.col);
      if (showVal()) {
        pill(T0.b[0] - 2, yQ + (sm ? 16 : 20) + (ldr ? (sm ? 22 : 26) : 0), `I_B = ${amp(sw.IB, 3)}`, blue(), 'right', sm ? 10 : 11.5, r);
        pill(xRight + 4, lampY + (sm ? 30 : 38), `I_C = ${amp(sw.IC, 2)}`, red(), 'right', sm ? 10 : 11.5, r);
      }
    }

    function drawSky(R: Rect, sm: boolean): void {
      const gg = g();
      const k = p.E / 100;
      gg.save();
      roundRect(gg, R.x, R.y, R.w, R.h, 10);
      gg.clip();
      const sky = gg.createLinearGradient(0, R.y, 0, R.y + R.h);
      sky.addColorStop(0, mixColor('#0b1530', '#5fb3ff', k));
      sky.addColorStop(1, mixColor('#26305a', '#cfeaff', k));
      gg.fillStyle = sky;
      gg.fillRect(R.x, R.y, R.w, R.h);
      // Sonne bzw. Mond, Höhe = Helligkeit
      const cy = R.y + R.h * (0.85 - 0.65 * k);
      const cx = R.x + R.w * 0.55;
      const sr = Math.min(R.w, R.h) * 0.13;
      if (k > 0.3) {
        glow(cx, cy, sr * 3.5, '#ffd36b', clamp((k - 0.3) * 1.6, 0, 1));
        dot(cx, cy, sr, mixColor('#ffb703', '#fff3b0', k));
      } else {
        dot(cx, cy, sr * 0.8, '#e8ecf5');
        dot(cx + sr * 0.35, cy - sr * 0.2, sr * 0.7, mixColor('#0b1530', '#5fb3ff', k));
        const srng = seededRandom(7);
        for (let i = 0; i < 12; i++) dot(R.x + srng() * R.w, R.y + srng() * R.h * 0.7, 1.1, withAlpha('#ffffff', 0.7 * (1 - k / 0.3)));
      }
      // Boden
      gg.fillStyle = mixColor('#10241a', '#5c8f4a', k);
      gg.fillRect(R.x, R.y + R.h * 0.86, R.w, R.h * 0.14);
      gg.restore();
      if (hot('sky') || dragHover) {
        gg.strokeStyle = withAlpha(orange(), 0.7);
        gg.lineWidth = 1.6;
        roundRect(gg, R.x, R.y, R.w, R.h, 10);
        gg.stroke();
      }
      const lux = luxFromLevel(p.E);
      rich(`E ≈ ${lux < 1 ? n(lux, 1) : fmt.sig(lux, 2)} lx`, R.x + R.w / 2, R.y + 14, sm ? 10 : 11, '#ffffff', 'center', false, 750);
      rich(T('ziehen', 'drag'), R.x + R.w / 2, R.y + R.h - 9, sm ? 9.5 : 10, 'rgba(255,255,255,0.85)', 'center', false, 650);
    }

    /** Kennlinie I_C(I_B) mit Sättigung (Schalter und Verstärker). */
    function drawTransfer(R: Rect, B: number, RC: number, IB: number, title0: string, withSignal: boolean): void {
      const th = ctx.theme;
      const lim = collectorLimit(RC) * 1e3;
      const knee = lim / B;
      const xMaxT = niceCeil(Math.max(2.2 * knee, IB * 1e3 * 1.15, withSignal ? (IB + p.ib * 1e-3) * 1e3 * 1.05 : 0, 0.05));
      const x1 = ease2('tx1', xMaxT, 5);
      const y1 = ease2('ty1', niceCeil(lim * 1.25), 5);
      const sig = withSignal && p.ac;
      const sm0 = R.w < 440 || R.h < 200;
      const padL = sig ? Math.round(R.w * 0.26) : sm0 ? 42 : 50;
      const padB = sig ? Math.round(R.h * 0.3) : sm0 ? 26 : 30;
      const ax = axesFrame(R, title0, 'I_B in mA', 'I_C in mA', 0, x1, 0, y1, { l: padL, b: padB });
      // Sättigungsgrenze
      line(
        [
          [ax.A.x, ax.Y(lim)],
          [ax.A.x + ax.A.w, ax.Y(lim)],
        ],
        withAlpha(red(), 0.6),
        1.3,
        [5, 4],
      );
      rich(ax.A.w < 260 ? 'I_{C,max}' : T('Sättigung: I_{C,max} = (U_B − U_{CE,sat}) / R_C', 'saturation: I_{C,max} = (U_B − U_{CE,sat}) / R_C'), ax.A.x + ax.A.w - 4, ax.Y(lim) + 11, ax.fs - (ax.sm ? 1 : 0.5), red(), 'right', true, 650);
      clipTo(ax.A);
      // I_C = B · I_B (gestrichelt weiter) und tatsächliche Kennlinie
      curve(ax, (x) => B * x, th.muted, 1.4, [4, 4], 0.7);
      curve(ax, (x) => Math.min(B * x, lim), blue(), 2.8);
      g().restore();
      const ic = transistor(IB, B, RC).IC * 1e3;
      const ibS = ease2('ibS', IB * 1e3, drag ? 20 : 7);
      const icS = Math.min(B * ibS, lim);
      // Signal: Projektion des Arbeitspunkts
      let px = ax.X(ibS);
      let py = ax.Y(icS);
      if (sig) {
        const phase = clockT * TAU * 0.5;
        const ibNow = signalBase(ibS * 1e-3, p.ib * 1e-3, phase) * 1e3;
        const icNow = Math.min(B * ibNow, lim);
        // Eingang unterhalb (Zeit läuft nach unten), Ausgang links (Zeit nach links)
        const inR: Rect = { x: ax.A.x, y: ax.A.y + ax.A.h + 22, w: ax.A.w, h: R.y + R.h - (ax.A.y + ax.A.h + 22) - 8 };
        const outR: Rect = { x: R.x + 10, y: ax.A.y, w: ax.A.x - R.x - 14 - (ax.sm ? 26 : 32), h: ax.A.h };
        const inPts: Pt[] = [];
        const outPts: Pt[] = [];
        const M = 80;
        for (let i = 0; i <= M; i++) {
          const ph = phase - (i / M) * TAU * 1.5;
          const ibv = signalBase(ibS * 1e-3, p.ib * 1e-3, ph) * 1e3;
          const icv = Math.min(B * ibv, lim);
          inPts.push([ax.X(ibv), inR.y + (i / M) * inR.h]);
          outPts.push([outR.x + outR.w - (i / M) * outR.w, ax.Y(icv)]);
        }
        if (inR.h > 16) {
          line(inPts, withAlpha(green(), 0.9), 2);
          rich('i_B(t)', inR.x + inR.w, inR.y + inR.h - 6, ax.fs, green(), 'right', true, 700);
          line(
            [
              [ax.X(ibNow), inR.y],
              [ax.X(ibNow), ax.Y(icNow)],
            ],
            withAlpha(green(), 0.45),
            1.2,
            [3, 3],
          );
        }
        if (outR.w > 20) {
          line(outPts, withAlpha(red(), 0.9), 2);
          rich('i_C(t)', outR.x + 2, outR.y + 8, ax.fs, red(), 'left', true, 700);
          line(
            [
              [outR.x + outR.w, ax.Y(icNow)],
              [ax.X(ibNow), ax.Y(icNow)],
            ],
            withAlpha(red(), 0.45),
            1.2,
            [3, 3],
          );
        }
        dot(ax.X(ibNow), ax.Y(icNow), 4, orange());
        px = ax.X(ibS);
        py = ax.Y(icS);
      }
      opPoint(px, py, th.text, true, mode() === 'amp');
      if (mode() === 'amp') {
        dragZones.push({ kind: 'ib', r: ax.A, handle: [px, py], toValue: (qx) => !ctx.locked && ctx.set({ IB: clamp(ax.xv(qx), 0, 0.5) }) });
      }
      if (showVal()) {
        const lab = `I_C = ${n(ic, ic < 10 ? 2 : 1)} mA`;
        rich(lab, clamp(px + 10, ax.A.x + 4, ax.A.x + ax.A.w - textW(lab, ax.fs + 0.5) - 4), Math.max(ax.A.y + 10, py - 14), ax.fs + 0.5, th.text, 'left', true, 750);
      }
      rich(`B = ${n(B, 0)}`, ax.X(Math.min(knee * 0.3, x1 * 0.3)) - 8, ax.Y(Math.min(B * knee * 0.3, lim * 0.3)) - 6, ax.fs, blue(), 'right', true, 750);
    }

    function drawSwitchCard(R: Rect): void {
      const v = showVal();
      const ldr = p.bs === 'ldr';
      const rows: [string, string][] = [];
      if (ldr) {
        const lux = luxFromLevel(p.E);
        rows.push([T(`E ≈ ${fmt.sig(lux, 2)} lx  →  R_LDR ≈ ${ohm(sw.Rldr ?? 0)}`, `E ≈ ${fmt.sig(lux, 2)} lx  →  R_LDR ≈ ${ohm(sw.Rldr ?? 0)}`), orange()]);
        rows.push([v ? `U = U_B · R_LDR / (R₁ + R_LDR) = ${volt(sw.Udiv ?? 0, 2)}` : 'U = U_B · R_LDR / (R₁ + R_LDR) = ?', ctx.theme.text]);
      } else rows.push([p.on ? T('Taster gedrückt: Basisstrom fließt', 'Button pressed: base current flows') : T('Taster offen: kein Basisstrom', 'Button open: no base current'), p.on ? green() : ctx.theme.muted]);
      rows.push([v ? `I_B = ${amp(sw.IB, 3)}  →  B · I_B = ${n(B_SWITCH, 0)} · ${amp(sw.IB, 3)} = ${amp(sw.ICideal, 2)}` : 'I_B = ?  →  B · I_B = ?', blue()]);
      rows.push([
        v ? (sw.saturated ? T(`I_C = ${amp(sw.IC, 2)} (begrenzt durch die Lampe)`, `I_C = ${amp(sw.IC, 2)} (limited by the lamp)`) : `I_C = ${amp(sw.IC, 2)}`) : 'I_C = ?',
        red(),
      ]);
      rows.push([sw.lampOn ? T('Lampe leuchtet', 'lamp is on') : T('Lampe aus', 'lamp is off'), sw.lampOn ? orange() : ctx.theme.muted]);
      rowsCard(R, T('Kleiner Strom schaltet großen Strom', 'A small current switches a large one'), rows, red());
    }
    function ohm(R: number): string {
      if (R >= 1e6 - 1) return `${fmt.sig(R / 1e6, 2)} MΩ`;
      if (R >= 1e3) return `${fmt.sig(R / 1e3, 2)} kΩ`;
      return `${fmt.sig(R, 2)} Ω`;
    }

    /* ================================================================== */
    /* Ansicht 6: Transistor als Verstärker                               */
    /* ================================================================== */
    function drawAmpScene(r: Rect): void {
      const th = ctx.theme;
      card(r);
      const sm = r.w < 400;
      title(r, T('Emitterschaltung', 'Common-emitter circuit'), sm);
      const wc = wireCol();
      const pad = sm ? 14 : 22;
      const yT = r.y + (sm ? 44 : 58);
      const yB = r.y + r.h - (sm ? 22 : 30);
      const xBat = r.x + r.w - pad - (sm ? 12 : 16);
      const qs = sm ? 21 : 34;
      const xC = r.x + r.w * 0.6;
      const xQ = xC - qs * 0.42;
      const yQ = yT + (yB - yT) * 0.6;
      const xSrc = r.x + pad + (sm ? 22 : 30);
      const phase = clockT * TAU * 0.5;
      const ib = p.ac ? signalBase(p.IB * 1e-3, p.ib * 1e-3, phase) : p.IB * 1e-3;
      const opNow = transistor(ib, p.B, p.RC);
      line(
        [
          [xC, yT],
          [xBat, yT],
          [xBat, (yT + yB) / 2 - 8],
        ],
        wc,
        2.4,
      );
      line(
        [
          [xBat, (yT + yB) / 2 + 8],
          [xBat, yB],
          [xSrc, yB],
        ],
        wc,
        2.4,
      );
      g().fillStyle = th.bg;
      battery(xBat, (yT + yB) / 2, sm ? 12 : 15, true, true);
      rich(`U_B = ${n(U_B, 0)} V`, xBat - (sm ? 18 : 22), (yT + yB) / 2, sm ? 10.5 : 12, th.text, 'right', true, 750);
      const T0 = npn(xQ, yQ, qs, clamp(opNow.IC / collectorLimit(p.RC), 0, 1));
      const yRc = yT + (yB - yT) * 0.24;
      line(
        [
          [xC, yT],
          [xC, T0.c[1]],
          T0.c,
        ],
        wc,
        2.4,
      );
      line([T0.e, [xC, T0.e[1]], [xC, yB]], wc, 2.4);
      dot(xC, yB, 3, wc);
      resistor(xC, yRc, sm ? 34 : 46, sm ? 12 : 15, true, clamp((opNow.IC * opNow.IC * p.RC) / 0.15, 0, 1));
      rich(`R_C = ${n(p.RC, 0)} Ω`, xC + (sm ? 12 : 16), yRc, sm ? 10 : 11, th.text, 'left', true, 650);
      // Basis: Signalquelle mit Gleichanteil
      line(
        [
          [xSrc, yB],
          [xSrc, yQ + (sm ? 16 : 20)],
        ],
        wc,
        2.4,
      );
      line(
        [
          [xSrc, yQ - (sm ? 16 : 20)],
          [xSrc, yQ - (sm ? 30 : 40)],
          [T0.b[0] - (sm ? 18 : 24), yQ - (sm ? 30 : 40)],
          [T0.b[0] - (sm ? 18 : 24), yQ],
          T0.b,
        ],
        wc,
        2.4,
      );
      const gg = g();
      gg.fillStyle = th.dark ? '#141b26' : '#ffffff';
      gg.strokeStyle = wc;
      gg.lineWidth = 2.2;
      gg.beginPath();
      gg.arc(xSrc, yQ, sm ? 16 : 20, 0, TAU);
      gg.fill();
      gg.stroke();
      arrowPx(xSrc, yQ + (sm ? 10 : 12), xSrc, yQ - (sm ? 10 : 12), wc, 2, 6);
      if (p.ac) {
        const sine: Pt[] = [];
        for (let i = 0; i <= 16; i++) sine.push([xSrc + (sm ? 4 : 5) + (i / 16) * (sm ? 8 : 10) - 6, yQ + Math.sin((i / 16) * TAU) * 3]);
        line(sine, green(), 1.6);
      }
      rich(p.ac ? 'I_B + î_B · sin ωt' : 'I_B', xSrc + (sm ? 22 : 28), yQ + (sm ? 26 : 32), sm ? 10 : 11, green(), 'left', true, 700);
      rich('C', T0.c[0] + 8, T0.c[1] + 4, sm ? 10 : 11, th.muted, 'left', true, 700);
      rich('E', T0.e[0] + 8, T0.e[1] - 4, sm ? 10 : 11, th.muted, 'left', true, 700);
      // Ladungsträger
      carriers(new Path([[xBat, yT], [xC, yT], [xC, T0.c[1]], T0.c, [xQ, yQ], T0.e, [xC, T0.e[1]], [xC, yB], [xBat, yB]]), 'coll', sm ? 14 : 18, sm ? 2.5 : 3, elecCol());
      carriers(new Path([[xSrc, yQ - (sm ? 30 : 40)], [T0.b[0] - (sm ? 18 : 24), yQ - (sm ? 30 : 40)], [T0.b[0] - (sm ? 18 : 24), yQ], T0.b, [xQ, yQ], T0.e, [xC, T0.e[1]], [xC, yB], [xSrc, yB]]), 'base', sm ? 14 : 18, sm ? 1.8 : 2.1, withAlpha(elecCol(), 0.8));
      if (showVal()) {
        pill(xC - 8, yRc - (sm ? 24 : 30), `i_C = ${amp(opNow.IC, 3)}`, red(), 'right', sm ? 10 : 11.5, r);
        pill(T0.b[0] - (sm ? 22 : 28), yQ - (sm ? 46 : 58), `i_B = ${amp(ib, 3)}`, green(), 'left', sm ? 10 : 11.5, r);
        pill(xC + 6, yQ + (sm ? 4 : 6), `U_CE = ${volt(opNow.UCE, 2)}`, orange(), 'left', sm ? 10 : 11.5, r);
      }
      if (opNow.saturated) rich(T('gesättigt', 'saturated'), xQ, yQ + qs + (sm ? 12 : 16), sm ? 10 : 11, red(), 'center', true, 750);
      else if (opNow.IC < 1e-7) rich(T('gesperrt', 'cut off'), xQ, yQ + qs + (sm ? 12 : 16), sm ? 10 : 11, th.muted, 'center', true, 750);
    }

    function drawAmpCard(R: Rect): void {
      const v = showVal();
      const op0 = transistor(p.IB * 1e-3, p.B, p.RC);
      const sw0 = p.ac ? outputSwingLocal() : null;
      const rows: [string, string][] = [
        [v ? `I_C = B · I_B = ${n(p.B, 0)} · ${n(p.IB, 3)} mA = ${n(p.B * p.IB, 2)} mA` : 'I_C = B · I_B = ?', blue()],
        [v ? T(`I_{C,max} = (${n(U_B, 0)} V − ${n(U_CE_SAT, 1)} V) / ${n(p.RC, 0)} Ω = ${n(collectorLimit(p.RC) * 1e3, 2)} mA`, `I_{C,max} = (${n(U_B, 0)} V − ${n(U_CE_SAT, 1)} V) / ${n(p.RC, 0)} Ω = ${n(collectorLimit(p.RC) * 1e3, 2)} mA`) : 'I_{C,max} = (U_B − U_{CE,sat}) / R_C = ?', red()],
        [v ? `U_CE = U_B − I_C · R_C = ${volt(op0.UCE, 2)}` : 'U_CE = U_B − I_C · R_C = ?', orange()],
        [
          sw0
            ? sw0.clipped
              ? T('Signal wird verzerrt (Sättigung oder Sperrung)', 'signal is distorted (saturation or cut-off)')
              : v
                ? T(`Δi_C / Δi_B = ${n(sw0.gain, 0)}: unverzerrt verstärkt`, `Δi_C / Δi_B = ${n(sw0.gain, 0)}: amplified without distortion`)
                : 'Δi_C / Δi_B = ?'
            : op0.saturated
              ? T('Gesättigt: mehr Basisstrom bringt nichts', 'Saturated: more base current changes nothing')
              : T('Linearer Bereich: I_C ∝ I_B', 'Linear region: I_C ∝ I_B'),
          sw0?.clipped || op0.saturated ? red() : green(),
        ],
      ];
      rowsCard(R, T('Stromverstärkung', 'Current gain'), rows, blue());
    }
    function outputSwingLocal(): { gain: number; clipped: boolean } {
      const lo = transistor(signalBase(p.IB * 1e-3, p.ib * 1e-3, -Math.PI / 2), p.B, p.RC).IC;
      const hi = transistor(signalBase(p.IB * 1e-3, p.ib * 1e-3, Math.PI / 2), p.B, p.RC).IC;
      const gain = (hi - lo) / (2 * p.ib * 1e-3);
      return { gain, clipped: Math.abs(gain - p.B) > 0.5 };
    }

    /* ================================================================== */
    /* Ergebnisse                                                          */
    /* ================================================================== */
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    function updateReadouts(): void {
      const m = mode();
      const d = dio();
      const s = DIODES[d];
      const UT = thermalVoltage();
      const all = ['op', 'shock', 'ut', 'us', 'pn', 'led', 'h', 'table', 'rpeak', 'rmean', 'rrip', 'sw', 'ldr', 'ic', 'sat', 'uce'];
      const show = new Set<string>();
      if (m === 'diode' || m === 'pn') {
        show.add('op').add('shock').add('ut').add('us');
        ctx.readout('op', `U_D = ${volt(op.Ud, 3)} · I = ${amp(op.I)}`);
        ctx.readout('shock', {
          html: `<var>I</var> = <var>I</var><sub>S</sub> · (e<sup><var>U</var>/(<var>n</var>·<var>U</var><sub>T</sub>)</sup> − 1) = ${amp(s.Is, 2)} · (e<sup>${fmt.fixed(op.Ud, 3)}/(${n(s.n, 0)}·${fmt.fixed(UT, 5)})</sup> − 1) ≈ <strong>${amp(op.I)}</strong>`,
        });
        ctx.readout('ut', { html: `<var>U</var><sub>T</sub> = ${frac('<var>k</var> · <var>T</var>', '<var>e</var>')} = ${frac(`${sciHtml(1.380649e-23, 7)} J/K · 300 K`, `${sciHtml(1.602177e-19, 7)} C`)} ≈ <strong>${n(UT * 1e3, 2)} mV</strong>` });
        ctx.readout('us', { html: T(`${DIODE_LABEL[d].de}: <var>U</var><sub>S</sub> ≈ <strong>${n(thresholdVoltage(d), 2)} V</strong> (Spannung bei 10 mA); je ${n(decadeVoltage(s.n) * 1e3, 0)} mV mehr fließt zehnmal so viel Strom.`, `${DIODE_LABEL[d].en}: <var>U</var><sub>S</sub> ≈ <strong>${n(thresholdVoltage(d), 2)} V</strong> (voltage at 10 mA); every ${n(decadeVoltage(s.n) * 1e3, 0)} mV more gives ten times the current.`) });
      }
      if (m === 'diode') {
        show.add('table');
        const mine = points.filter((q) => q.d === d).sort((a, b) => a.Ud - b.Ud);
        if (mine.length) {
          const rows = mine.map((q) => `<tr><td>${fmt.fixed(q.Ud, 3)}</td><td>${fmt.sig(q.I * 1e3, 3)}</td></tr>`).join('');
          ctx.readout('table', { html: `<table class="mini-table"><tr><th>U_D in V</th><th>I in mA</th></tr>${rows}</table>`.replace('U_D', '<var>U</var><sub>D</sub>').replace('I in', '<var>I</var> in') });
        } else ctx.readout('table', T('Noch keine Messwerte für dieses Bauteil.', 'No data for this component yet.'));
      }
      if (m === 'pn') {
        show.add('pn');
        const wf = depletionWidth(op.Ud, s.Ud);
        ctx.readout('pn', {
          html: T(
            `<var>w</var>/<var>w</var><sub>0</sub> = √((<var>U</var><sub>d</sub> − <var>U</var>)/<var>U</var><sub>d</sub>) ≈ <strong>${n(wf, 2)}</strong> mit <var>U</var><sub>d</sub> ≈ ${n(s.Ud, 2)} V. ${op.Ud > 0 ? 'In Durchlassrichtung wird die Sperrschicht schmaler.' : 'In Sperrrichtung wird die Sperrschicht breiter.'}`,
            `<var>w</var>/<var>w</var><sub>0</sub> = √((<var>U</var><sub>d</sub> − <var>U</var>)/<var>U</var><sub>d</sub>) ≈ <strong>${n(wf, 2)}</strong> with <var>U</var><sub>d</sub> ≈ ${n(s.Ud, 2)} V. ${op.Ud > 0 ? 'Forward bias narrows the depletion layer.' : 'Reverse bias widens the depletion layer.'}`,
          ),
        });
      }
      if (m === 'led') {
        show.add('op').add('led').add('h');
        const ops = ledOps();
        ctx.readout('op', LED_IDS.map((id) => `${DIODE_LABEL[id][ctx.lang]}: ${amp(ops[id]!.I, 2)}`).join(' · '));
        const rows = LED_IDS.map((id) => `<tr${dio() === id ? ' class="is-current"' : ''}><td>${DIODE_LABEL[id][ctx.lang]}</td><td>${n(DIODES[id].lambda!, 0)} nm</td><td>${fmt.sig(frequencyOf(DIODES[id].lambda!) / 1e14, 3)}</td><td>${n(thresholdVoltage(id), 2)} V</td></tr>`).join('');
        ctx.readout('led', { html: `<table class="mini-table"><tr><th>LED</th><th>λ</th><th><var>f</var> in 10<sup>14</sup> Hz</th><th><var>U</var><sub>S</sub></th></tr>${rows}</table>` });
        const h = planckFromLeds(LED_IDS.map((id) => ({ U: thresholdVoltage(id), f: frequencyOf(DIODES[id].lambda!) })));
        ctx.readout('h', { html: `<var>e</var> · <var>U</var><sub>S</sub> = <var>h</var> · <var>f</var> ⇒ <var>h</var> ≈ <strong>${sciHtml(h ?? 0, 3)} J·s</strong> ${T('(Modell; Literatur: 6,626 · 10<sup>−34</sup> J·s)', '(model; reference: 6.626 · 10<sup>−34</sup> J·s)')}` });
      }
      if (m === 'rect') {
        show.add('rpeak').add('rmean');
        const kind = p.rc as RectKind;
        const nd = kind === 'bridge' ? 2 : 1;
        ctx.readout('rpeak', { html: `<var>û</var><sub>aus</sub> = <var>Û</var> − ${nd > 1 ? '2 · ' : ''}<var>U</var><sub>F</sub> = ${n(p.Uh, 1)} V − ${n(nd * U_F, 1)} V = <strong>${n(rectPeak(p.Uh, kind), 1)} V</strong>` });
        ctx.readout('rmean', p.cap ? { html: T(`mit Kondensator: <var>ū</var> ≈ <strong>${n(wave.mean, 2)} V</strong>`, `with capacitor: <var>ū</var> ≈ <strong>${n(wave.mean, 2)} V</strong>`) } : { html: T(`ohne Kondensator: <var>ū</var> = <strong>${n(rectMean(p.Uh, kind), 2)} V</strong> (${kind === 'bridge' ? 'Brücke ≈ 2 · (Û − 2 U<sub>F</sub>)/π' : 'Einweg ≈ (Û − U<sub>F</sub>)/π'})`, `without capacitor: <var>ū</var> = <strong>${n(rectMean(p.Uh, kind), 2)} V</strong> (${kind === 'bridge' ? 'bridge ≈ 2 · (Û − 2 U<sub>F</sub>)/π' : 'half-wave ≈ (Û − U<sub>F</sub>)/π'})`) });
        if (p.cap) {
          show.add('rrip');
          ctx.readout('rrip', { html: T(`Δ<var>U</var> ≈ <strong>${n(wave.ripple, 2)} V</strong>; Näherung ${frac('<var>I</var>', '<var>f</var><sub>B</sub> · <var>C</var>')} ≈ ${n(rippleEstimate(p.Uh, kind, p.C * 1e-6, p.RL * 1e3), 2)} V mit <var>f</var><sub>B</sub> = ${kind === 'bridge' ? '100' : '50'} Hz`, `Δ<var>U</var> ≈ <strong>${n(wave.ripple, 2)} V</strong>; estimate ${frac('<var>I</var>', '<var>f</var><sub>r</sub> · <var>C</var>')} ≈ ${n(rippleEstimate(p.Uh, kind, p.C * 1e-6, p.RL * 1e3), 2)} V with <var>f</var><sub>r</sub> = ${kind === 'bridge' ? '100' : '50'} Hz`) });
        }
      }
      if (m === 'switch') {
        show.add('sw');
        ctx.readout('sw', { html: `<var>I</var><sub>B</sub> = ${amp(sw.IB, 2)} → <var>I</var><sub>C</sub> = <strong>${amp(sw.IC, 2)}</strong>${sw.saturated ? T(' (gesättigt: begrenzt durch die Lampe)', ' (saturated: limited by the lamp)') : ''}; ${sw.IB > 1e-9 ? T(`Verhältnis ${n(sw.IC / sw.IB, 0)} : 1`, `ratio ${n(sw.IC / sw.IB, 0)} : 1`) : T('ohne Basisstrom sperrt der Transistor', 'without base current the transistor is off')}` });
        if (p.bs === 'ldr') {
          show.add('ldr');
          ctx.readout('ldr', { html: `<var>E</var> ≈ ${fmt.sig(luxFromLevel(p.E), 2)} lx: <var>R</var><sub>LDR</sub> ≈ ${ohm(sw.Rldr ?? 0)}, <var>U</var> = <var>U</var><sub>B</sub> · ${frac('<var>R</var><sub>LDR</sub>', '<var>R</var><sub>1</sub> + <var>R</var><sub>LDR</sub>')} = <strong>${n(sw.Udiv ?? 0, 2)} V</strong>` });
        }
      }
      if (m === 'amp') {
        show.add('ic').add('sat').add('uce');
        const o = transistor(p.IB * 1e-3, p.B, p.RC);
        ctx.readout('ic', { html: `<var>I</var><sub>C</sub> = <var>B</var> · <var>I</var><sub>B</sub> = ${n(p.B, 0)} · ${n(p.IB, 3)} mA = ${n(p.B * p.IB, 2)} mA${o.saturated ? T(` → begrenzt auf <strong>${n(o.IC * 1e3, 2)} mA</strong>`, ` → limited to <strong>${n(o.IC * 1e3, 2)} mA</strong>`) : ` = <strong>${n(o.IC * 1e3, 2)} mA</strong>`}` });
        ctx.readout('sat', { html: `<var>I</var><sub>C,max</sub> = ${frac('<var>U</var><sub>B</sub> − <var>U</var><sub>CE,sat</sub>', '<var>R</var><sub>C</sub>')} = ${frac(`${n(U_B, 0)} V − ${n(U_CE_SAT, 1)} V`, `${n(p.RC, 0)} Ω`)} = ${n(collectorLimit(p.RC) * 1e3, 2)} mA${o.saturated ? T(' – <strong>gesättigt</strong>', ' – <strong>saturated</strong>') : ''}` });
        ctx.readout('uce', { html: `<var>U</var><sub>CE</sub> = <var>U</var><sub>B</sub> − <var>I</var><sub>C</sub> · <var>R</var><sub>C</sub> = <strong>${n(o.UCE, 2)} V</strong>` });
      }
      for (const k of all) if (!show.has(k)) ctx.readout(k, null);
      ctx.setAction('measure', { enabled: !auto });
      ctx.setAction('clear', { enabled: points.some((q) => q.d === d) });
    }

    /* ---------- Messreihe ---------- */
    function record(): void {
      const d = dio();
      if (points.some((q) => q.d === d && Math.abs(q.Ud - op.Ud) < 1e-4)) return;
      points = [...points, { d, Ud: op.Ud, I: op.I }].slice(-120);
      pop.play();
      ctx.announce(T(`Messwert: U = ${volt(op.Ud, 3)}, I = ${amp(op.I)}`, `Data point: U = ${volt(op.Ud, 3)}, I = ${amp(op.I)}`));
      updateReadouts();
    }
    /** Spannungen für die automatische Messreihe (dicht um die Schleusenspannung). */
    function autoSteps(): number[] {
      if (p.flip) return [0, 0.5, 1, 2, 3, 4, 5, 6];
      const d = dio();
      const Us = thresholdVoltage(d);
      const out = new Set<number>([0]);
      // gleichmäßig verteilte Diodenspannungen bis knapp über U_S, dazu große Quellenspannungen
      for (let k = 1; k <= 9; k++) out.add(Math.round(sourceForDiodeVoltage(d, ((Us + 0.04) * k) / 9, p.R) * 100) / 100);
      for (const u of [3, 4.5, 6]) out.add(u);
      return [...out].filter((u) => u <= U_MAX).sort((a, b) => a - b);
    }

    /* ---------- Rechnen ---------- */
    function recompute(): void {
      op = diodeCircuit(dio(), U0(), p.R);
      sw = switchOp();
      refreshWave();
    }

    /* ---------- Szene je Ansicht ---------- */
    function drawMode(m: Mode, k: number): void {
      const gg = g();
      gg.save();
      gg.globalAlpha *= k;
      const s1 = stage(0);
      const s2 = stage(0.15);
      const s3 = stage(0.3);
      const part = (sk: number, fn: () => void) => {
        gg.save();
        gg.globalAlpha *= sk;
        gg.translate(0, (1 - sk) * 12);
        fn();
        gg.restore();
      };
      if (m === 'diode') {
        part(s1, () => drawDiodeScene(lay.scene));
        part(s2, () => drawDiodeChart(lay.chart, true));
        part(s3, () => drawDiodeCard(lay.card));
      } else if (m === 'pn') {
        part(s1, () => drawPnScene(lay.scene));
        part(s2, () => drawDiodeChart(lay.chart, false));
        part(s3, () => drawPnCard(lay.card));
      } else if (m === 'led') {
        part(s1, () => drawLedScene(lay.scene));
        part(s2, () => drawLedChart(lay.chart));
        part(s3, () => drawLedCard(lay.card));
      } else if (m === 'rect') {
        part(s1, () => drawRectScene(lay.scene));
        part(s2, () => drawScope(lay.chart));
        part(s3, () => drawRectCard(lay.card));
      } else if (m === 'switch') {
        part(s1, () => drawSwitchScene(lay.scene));
        part(s2, () => drawTransfer(lay.chart, B_SWITCH, LAMP_R, sw.IB, T('Kennlinie I_C(I_B)', 'Characteristic I_C(I_B)'), false));
        part(s3, () => drawSwitchCard(lay.card));
      } else {
        part(s1, () => drawAmpScene(lay.scene));
        part(s2, () => drawTransfer(lay.chart, p.B, p.RC, p.IB * 1e-3, T('Kennlinie I_C(I_B)', 'Characteristic I_C(I_B)'), true));
        part(s3, () => drawAmpCard(lay.card));
      }
      gg.restore();
    }

    /** Geschwindigkeiten der Ladungsträger je Pfad (px/s, Vorzeichen: Richtung der Elektronen). */
    function flowSpeeds(): Record<string, number> {
      const m = mode();
      const out: Record<string, number> = {};
      if (m === 'diode') out.diode = -flowSpeed(op.I);
      if (m === 'pn') out.pnw = -flowSpeed(op.I);
      if (m === 'led') {
        const ops = ledOps();
        for (const id of LED_IDS) out[`led-${id}`] = -flowSpeed(ops[id]!.I);
      }
      if (m === 'rect') {
        const bi = beamIndex();
        const IL = wave.uout[bi]! / (p.RL * 1e3);
        out.rect = -flowSpeed(IL * 3);
        out.rectC = -flowSpeed(IL * 3);
      }
      if (m === 'switch') {
        out.coll = -flowSpeed(sw.IC);
        out.base = -flowSpeed(sw.IB);
        out.div = -flowSpeed(U_B / (p.R1 * 1e3 + (sw.Rldr ?? 1e6)));
      }
      if (m === 'amp') {
        const ib = p.ac ? signalBase(p.IB * 1e-3, p.ib * 1e-3, clockT * TAU * 0.5) : p.IB * 1e-3;
        out.coll = -flowSpeed(transistor(ib, p.B, p.RC).IC);
        out.base = -flowSpeed(ib);
      }
      return out;
    }

    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (changed.has('mode') && source !== 'init' && lastMode !== p.mode) {
          prevMode = lastMode;
          modeTw.play();
          if (mode() === 'pn') resetCarriers();
          ctx.setKeyTargets([]);
        }
        lastMode = mode();
        // LED-Ansicht: ein Bauteil, das keine LED ist, durch die rote LED ersetzen (nur bei Bedienung)
        if (source === 'input' && changed.has('mode') && mode() === 'led' && !isLed(dio())) ctx.set({ d: 'red' });
        if (changed.has('flip') && source !== 'init') flipTw.play();
        if (source === 'init') {
          intro.play();
          if (!reduced) queueMicrotask(() => ctx.clock.play());
        }
        if (source === 'replace') {
          auto = null;
          if (mode() === 'pn') resetCarriers();
        }
        recompute();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'measure') record();
        else if (id === 'clear') {
          points = points.filter((q) => q.d !== dio());
          auto = null;
          updateReadouts();
        } else if (id === 'auto') {
          points = points.filter((q) => q.d !== dio());
          auto = { next: 0, wait: performance.now() + 200 };
          ctx.set({ U: 0 });
          updateReadouts();
        } else if (id === 'flip') doFlip();
        else if (id === 'press') ctx.set({ on: !p.on });
        ctx.requestRender();
      },

      tick(dt) {
        const h = Math.min(dt, 0.1);
        clockT += h;
        const sp = flowSpeeds();
        for (const [k, v] of Object.entries(sp)) flows.set(k, flowOf(k) + v * h);
        if (mode() === 'rect') {
          const span = wave.t[wave.t.length - 1]! || 0.04;
          scopeT = (scopeT + h * (span / 3)) % span;
        }
        if (mode() === 'pn') stepCarriers(h);
      },

      resetTime() {
        clockT = 0;
        scopeT = 0;
        flows.clear();
        resetCarriers();
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        lay = computeLayout();
        // Automatische Messreihe: Spannung schrittweise erhöhen und messen
        if (auto && now >= auto.wait && Math.abs((soft.get('ud') ?? op.Ud) - op.Ud) < 2e-3) {
          const steps = autoSteps();
          record();
          const next = steps.find((u) => u > p.U + 1e-9);
          if (next === undefined) auto = null;
          else {
            auto.wait = now + 260;
            ctx.set({ U: next });
          }
          updateReadouts();
        }
        surface.begin();
        hits = [];
        dragZones = [];
        const k = modeTw.running ? modeTw.value : 1;
        if (modeTw.running && k < 0.5) {
          collectHits = false;
          drawMode(prevMode, 1 - 2 * k);
          collectHits = true;
          hits = [];
          dragZones = [];
        } else drawMode(mode(), modeTw.running ? 2 * k - 1 : 1);
        ctx.setKeyTargets(hits.map((h) => ({ id: h.id, label: h.label, rect: h.r, disabled: ctx.locked, activate: h.act })));
        if (animating || intro.running || modeTw.running || pop.running || flipTw.running || auto || drag || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
