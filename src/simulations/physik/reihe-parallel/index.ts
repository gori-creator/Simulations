import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, TapTarget, text, Tween, withAlpha } from '../../../sim-core';
import {
  ammeterSlots,
  burnsOut,
  filamentTemperature,
  glowOf,
  LAMP_R,
  partCount,
  slotCurrent,
  solve,
  type Circuit,
  type CircuitResult,
  type SlotMeasure,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Pt = [number, number];
type Flow = 'e' | 'tech' | 'none';
type Dir = 'h' | 'v';
/** Welche Stromstärke auf einer Leitung fließt: Gesamtstrom oder Summe einzelner Bauteile. */
type EdgeKey = 'main' | number[];

interface Comp {
  c: Pt;
  dir: Dir;
  /** Seite, auf der der Spannungsmesser sitzt (Einheitsvektor). */
  perp: Pt;
}

interface Edge {
  id: string;
  pts: Pt[];
  key: EdgeKey;
}

interface Slot {
  pos: Pt;
  dir: Dir;
  measure: SlotMeasure;
}

interface Layout {
  comps: Comp[];
  edges: Edge[];
  slots: Slot[];
  nodes: Pt[];
  source: Comp;
}

const SUB = ['₀', '₁', '₂', '₃'];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mixPt = (a: Pt, b: Pt, t: number): Pt => [mix(a[0], b[0], t), mix(a[1], b[1], t)];

/* ------------------------------------------------------------------ */
/* Geometrie                                                           */
/* ------------------------------------------------------------------ */

class Path {
  readonly cum: number[] = [0];
  readonly length: number;
  constructor(readonly pts: Pt[]) {
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1]! + Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]));
    this.length = this.cum[this.cum.length - 1]!;
  }

  at(s: number): [number, number, number] {
    const pts = this.pts;
    const t = Math.max(0, Math.min(this.length, s));
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i]! < t) i++;
    const a = pts[i - 1]!;
    const b = pts[i]!;
    const seg = this.cum[i]! - this.cum[i - 1]! || 1;
    const u = (t - this.cum[i - 1]!) / seg;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, Math.atan2(b[1] - a[1], b[0] - a[0])];
  }
}

/**
 * Schaltplan in Entwurfseinheiten (Breite W, Höhe H). Leitungen sind in
 * technischer Stromrichtung (vom Pluspol zum Minuspol) angegeben.
 */
function layoutFor(circ: Circuit, n: number, W: number, H: number, R: number): Layout {
  const xl = 0.13 * W;
  const xr = 0.87 * W;
  const yt = 0.24 * H;
  const yb = 0.8 * H;
  const ym = (yt + yb) / 2;
  const gap = 7;
  const count = partCount(circ, n);
  const up: Pt = [0, -1];
  const right: Pt = [1, 0];
  if (circ === 'series') {
    const fx = count === 2 ? [0.36, 0.64] : [0.29, 0.5, 0.71];
    const xs = fx.map((f) => f * W);
    const comps: Comp[] = xs.map((x) => ({ c: [x, yt], dir: 'h', perp: up }));
    const edges: Edge[] = [
      {
        id: 's0',
        pts: [
          [0.5 * W - gap, yb],
          [xl, yb],
          [xl, yt],
          [xs[0]! - R, yt],
        ],
        key: 'main',
      },
    ];
    const slots: Slot[] = [{ pos: [xl, ym], dir: 'v', measure: { kind: 'main' } }];
    for (let i = 0; i < count - 1; i++) {
      edges.push({
        id: `s${i + 1}`,
        pts: [
          [xs[i]! + R, yt],
          [xs[i + 1]! - R, yt],
        ],
        key: 'main',
      });
      slots.push({ pos: [(xs[i]! + xs[i + 1]!) / 2, yt], dir: 'h', measure: { kind: 'main' } });
    }
    edges.push({
      id: 'se',
      pts: [
        [xs[count - 1]! + R, yt],
        [xr, yt],
        [xr, yb],
        [0.5 * W + gap, yb],
      ],
      key: 'main',
    });
    slots.push({ pos: [xr, ym], dir: 'v', measure: { kind: 'main' } });
    return { comps, edges, slots, nodes: [], source: { c: [0.5 * W, yb], dir: 'h', perp: [0, 1] } };
  }
  // Parallel und gemischt: Quelle links, senkrecht, Pluspol oben
  const source: Comp = { c: [xl, ym], dir: 'v', perp: right };
  const ladder = (xs: number[], first: number): { edges: Edge[]; nodes: Pt[] } => {
    // Sprossen für die Bauteile first … first + xs.length − 1
    const edges: Edge[] = [];
    const nodes: Pt[] = [];
    const k = xs.length;
    for (let j = 0; j < k; j++) {
      const idx = first + j;
      const x = xs[j]!;
      edges.push({
        id: `r${idx}t`,
        pts: [
          [x, yt],
          [x, ym - R],
        ],
        key: [idx],
      });
      edges.push({
        id: `r${idx}b`,
        pts: [
          [x, ym + R],
          [x, yb],
        ],
        key: [idx],
      });
      if (j < k - 1) {
        const rest = Array.from({ length: k - 1 - j }, (_, q) => first + j + 1 + q);
        edges.push({
          id: `t${idx}`,
          pts: [
            [x, yt],
            [xs[j + 1]!, yt],
          ],
          key: rest,
        });
        edges.push({
          id: `b${idx}`,
          pts: [
            [xs[j + 1]!, yb],
            [x, yb],
          ],
          key: rest,
        });
        nodes.push([x, yt], [x, yb]);
      }
    }
    return { edges, nodes };
  };
  if (circ === 'parallel') {
    const fx = count === 2 ? [0.45, 0.72] : [0.36, 0.58, 0.8];
    const xs = fx.map((f) => f * W);
    const comps: Comp[] = xs.map((x) => ({ c: [x, ym], dir: 'v', perp: right }));
    const lad = ladder(xs, 0);
    const edges: Edge[] = [
      {
        id: 'm1',
        pts: [
          [xl, ym - gap],
          [xl, yt],
          [xs[0]!, yt],
        ],
        key: 'main',
      },
      ...lad.edges,
      {
        id: 'm2',
        pts: [
          [xs[0]!, yb],
          [xl, yb],
          [xl, ym + gap],
        ],
        key: 'main',
      },
    ];
    const slots: Slot[] = [
      { pos: [(xl + xs[0]!) / 2, yt], dir: 'h', measure: { kind: 'main' } },
      ...xs.map((x, i): Slot => ({ pos: [x, (yt + ym - R) / 2], dir: 'v', measure: { kind: 'part', index: i } })),
      { pos: [(xl + xs[0]!) / 2, yb], dir: 'h', measure: { kind: 'main' } },
    ];
    return { comps, edges, slots, nodes: lad.nodes, source };
  }
  // gemischt: Bauteil 1 oben in Reihe, dann Bauteile 2 und 3 parallel
  const x1 = 0.32 * W;
  const xs = [0.58 * W, 0.82 * W];
  const comps: Comp[] = [{ c: [x1, yt], dir: 'h', perp: up }, ...xs.map((x): Comp => ({ c: [x, ym], dir: 'v', perp: right }))];
  const lad = ladder(xs, 1);
  const edges: Edge[] = [
    {
      id: 'm1',
      pts: [
        [xl, ym - gap],
        [xl, yt],
        [x1 - R, yt],
      ],
      key: 'main',
    },
    {
      id: 'm2',
      pts: [
        [x1 + R, yt],
        [xs[0]!, yt],
      ],
      key: 'main',
    },
    ...lad.edges,
    {
      id: 'm3',
      pts: [
        [xs[0]!, yb],
        [xl, yb],
        [xl, ym + gap],
      ],
      key: 'main',
    },
  ];
  const slots: Slot[] = [
    { pos: [(xl + x1 - R) / 2, yt], dir: 'h', measure: { kind: 'main' } },
    { pos: [(x1 + R + xs[0]!) / 2, yt], dir: 'h', measure: { kind: 'main' } },
    { pos: [xs[0]!, (yt + ym - R) / 2], dir: 'v', measure: { kind: 'part', index: 1 } },
    { pos: [xs[1]!, (yt + ym - R) / 2], dir: 'v', measure: { kind: 'part', index: 2 } },
    { pos: [(xl + xs[0]!) / 2, yb], dir: 'h', measure: { kind: 'main' } },
  ];
  return { comps, edges, slots, nodes: lad.nodes, source };
}

/* ------------------------------------------------------------------ */
/* Farben der Glühwendel                                               */
/* ------------------------------------------------------------------ */

function mixHex(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift: number) => Math.round(mix((pa >> shift) & 255, (pb >> shift) & 255, Math.max(0, Math.min(1, t))));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

function filamentColor(T: number): string {
  const stops: [number, string][] = [
    [600, '#4a4f57'],
    [950, '#7a1d0c'],
    [1300, '#d0400f'],
    [1800, '#ff8a1f'],
    [2300, '#ffd05a'],
    [2800, '#fff4d6'],
  ];
  if (T <= stops[0]![0]) return stops[0]![1];
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]!;
    const [t0, c0] = stops[i - 1]!;
    if (T <= t1) return mixHex(c0, c1, (T - t0) / (t1 - t0));
  }
  return stops[stops.length - 1]![1];
}

function haloColor(T: number): [number, number, number] {
  if (T < 1500) return [255, 120, 40];
  if (T < 2200) return [255, 176, 70];
  return [255, 222, 140];
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

const SLOT_OPTIONS = [
  { value: '0', label: L('aus', 'off') },
  { value: '1', label: L('1', '1') },
  { value: '2', label: L('2', '2') },
  { value: '3', label: L('3', '3') },
  { value: '4', label: L('4', '4') },
  { value: '5', label: L('5', '5') },
] as const;

const VOLT_OPTIONS = [
  { value: '0', label: L('aus', 'off') },
  { value: 'S', label: L('Quelle', 'source') },
  { value: '1', label: L('1', '1') },
  { value: '2', label: L('2', '2') },
  { value: '3', label: L('3', '3') },
] as const;

/**
 * Reihen- und Parallelschaltung: zwei oder drei Glühlampen (oder Widerstände)
 * in Reihe, parallel oder gemischt. Strom- und Spannungsmesser lassen sich
 * an wählbare Stellen setzen, Lampen herausdrehen; der Strom fließt sichtbar
 * mit einer Geschwindigkeit, die zur Stromstärke passt.
 */
export default defineSimulation({
  id: 'reihe-parallel',
  layout: { aspect: 1.6, aspectNarrow: 0.72 },
  groups: [
    { id: 'parts', label: L('Bauteile', 'Components') },
    { id: 'meters', label: L('Messgeräte', 'Meters') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'circ',
      type: 'choice',
      label: L('Schaltung', 'Circuit'),
      options: [
        { value: 'series', label: L('Reihenschaltung', 'Series') },
        { value: 'parallel', label: L('Parallelschaltung', 'Parallel') },
        { value: 'mixed', label: L('gemischt', 'Mixed') },
      ],
      default: 'series',
    },
    { key: 'n', type: 'number', label: L('Anzahl der Bauteile', 'Number of components'), min: 2, max: 3, step: 1, default: 2, visibleIf: (v) => v.circ !== 'mixed' },
    { key: 'U', type: 'number', label: L('Spannung der Quelle U', 'Source voltage U'), min: 1, max: 12, step: 0.5, default: 6, unit: 'V' },
    {
      key: 'kind',
      type: 'choice',
      group: 'parts',
      label: L('Bauteile', 'Components'),
      options: [
        { value: 'lamp', label: L('gleiche Glühlampen (6 V; 0,5 A)', 'identical bulbs (6 V, 0.5 A)') },
        { value: 'res', label: L('Widerstände', 'Resistors') },
      ],
      default: 'lamp',
    },
    { key: 'R1', type: 'number', group: 'parts', label: L('Widerstand R₁', 'Resistance R₁'), min: 5, max: 200, step: 5, default: 20, unit: 'Ω', visibleIf: (v) => v.kind === 'res' },
    { key: 'R2', type: 'number', group: 'parts', label: L('Widerstand R₂', 'Resistance R₂'), min: 5, max: 200, step: 5, default: 30, unit: 'Ω', visibleIf: (v) => v.kind === 'res' },
    {
      key: 'R3',
      type: 'number',
      group: 'parts',
      label: L('Widerstand R₃', 'Resistance R₃'),
      min: 5,
      max: 200,
      step: 5,
      default: 60,
      unit: 'Ω',
      visibleIf: (v) => v.kind === 'res' && (v.circ === 'mixed' || v.n === 3),
    },
    {
      key: 'x1',
      type: 'boolean',
      group: 'parts',
      label: L('Lampe 1 herausgedreht', 'Bulb 1 unscrewed'),
      help: L('Oder: eine Lampe im Bild antippen.', 'Or tap a bulb in the picture.'),
      default: false,
      visibleIf: (v) => v.kind === 'lamp',
    },
    { key: 'x2', type: 'boolean', group: 'parts', label: L('Lampe 2 herausgedreht', 'Bulb 2 unscrewed'), default: false, visibleIf: (v) => v.kind === 'lamp' },
    { key: 'x3', type: 'boolean', group: 'parts', label: L('Lampe 3 herausgedreht', 'Bulb 3 unscrewed'), default: false, visibleIf: (v) => v.kind === 'lamp' && (v.circ === 'mixed' || v.n === 3) },
    {
      key: 'a1',
      type: 'choice',
      group: 'meters',
      label: L('Strommesser A₁ an Stelle', 'Ammeter A₁ at position'),
      help: L('Oder: eine nummerierte Messstelle im Bild antippen.', 'Or tap a numbered position in the picture.'),
      options: SLOT_OPTIONS,
      default: '1',
    },
    { key: 'a2', type: 'choice', group: 'meters', label: L('Strommesser A₂ an Stelle', 'Ammeter A₂ at position'), options: SLOT_OPTIONS, default: '0' },
    { key: 'v1', type: 'choice', group: 'meters', label: L('Spannungsmesser V₁ an Bauteil', 'Voltmeter V₁ across component'), options: VOLT_OPTIONS, default: '1' },
    { key: 'v2', type: 'choice', group: 'meters', label: L('Spannungsmesser V₂ an Bauteil', 'Voltmeter V₂ across component'), options: VOLT_OPTIONS, default: '0' },
    {
      key: 'flow',
      type: 'choice',
      group: 'view',
      label: L('Strom darstellen als', 'Show the current as'),
      options: [
        { value: 'e', label: L('Elektronen', 'Electrons') },
        { value: 'tech', label: L('technische Stromrichtung', 'Conventional current') },
        { value: 'none', label: L('nicht', 'hidden') },
      ],
      default: 'e',
    },
    { key: 'sym', type: 'boolean', group: 'view', label: L('Schaltzeichen statt Lampenbildern', 'Circuit symbols instead of bulb pictures'), default: false },
    { key: 'marks', type: 'boolean', group: 'view', label: L('freie Messstellen anzeigen', 'Show free measuring positions'), default: true },
  ],
  actions: [{ id: 'fix', label: L('Neue Lampen einsetzen', 'Insert new bulbs'), visibleIf: (v) => v.kind === 'lamp' }],
  readouts: [
    { key: 'state', label: L('Beobachtung', 'Observation') },
    { key: 'meters', label: L('Messgeräte zeigen', 'The meters show') },
    { key: 'rules', label: L('Gesetzmäßigkeiten', 'Rules') },
    { key: 'R', label: L('Ersatzwiderstand', 'Equivalent resistance'), spoiler: true },
    { key: 'table', label: L('Alle Bauteile', 'All components'), spoiler: true },
  ],
  presets: [
    { id: 'series', label: L('Zwei Lampen in Reihe', 'Two bulbs in series'), values: {} },
    { id: 'parallel', label: L('Zwei Lampen parallel', 'Two bulbs in parallel'), values: { circ: 'parallel', a1: '1', a2: '2' } },
    { id: 'series3', label: L('Drei Lampen in Reihe', 'Three bulbs in series'), values: { n: 3, v1: '1', v2: 'S' } },
    { id: 'mixed', label: L('Gemischte Schaltung', 'Mixed circuit'), values: { circ: 'mixed', a1: '2', a2: '3', v1: '1', v2: '2' } },
    { id: 'res', label: L('Widerstände parallel', 'Resistors in parallel'), values: { circ: 'parallel', kind: 'res', a1: '1', a2: '2', v1: 'S' } },
    { id: '12v', label: L('Zwei 6-V-Lampen an 12 V', 'Two 6 V bulbs at 12 V'), values: { U: 12 } },
  ],
  strings: {
    de: {
      canvas: 'Schaltplan mit Spannungsquelle und zwei oder drei Glühlampen bzw. Widerständen in Reihe, parallel oder gemischt, mit Strom- und Spannungsmessern',
      source: 'U = {U} V',
      lamp: 'L{i}',
      res: 'R{i}',
      ohm: '{R} Ω',
      tapLamp: 'Lampe antippen: herausdrehen',
      burnt: 'durchgebrannt',
      out: 'herausgedreht',
      slot: 'Stelle {k}',
      partLamp: 'Lampe {i}',
      partRes: 'R{i}',
      partSource: 'Quelle',
      meterA: 'A{k} an Stelle {s}: {I} A',
      meterV: 'V{k} an {p}: {U} V',
      meterNone: 'Keine Messgeräte eingesetzt – tippe eine nummerierte Messstelle an.',
      meterMissing: 'A{k}: Stelle {s} gibt es in dieser Schaltung nicht.',
      seriesL: 'Reihenschaltung: Alle Lampen liegen hintereinander in einem einzigen Stromkreis. Durch jede fließt derselbe Strom, die Spannung der Quelle teilt sich auf – jede Lampe leuchtet schwächer als allein.',
      seriesOut: 'Lampe {i} ist {why}: Der einzige Stromkreis ist unterbrochen – alle Lampen gehen aus. An der Unterbrechung liegt die volle Spannung.',
      parallelL: 'Parallelschaltung: Jede Lampe liegt in einem eigenen Zweig direkt an der Quelle und erhält die volle Spannung. Die Ströme der Zweige addieren sich in der Hauptleitung.',
      parallelOut: 'Lampe {i} ist {why}: Nur dieser Zweig ist unterbrochen – die anderen Lampen leuchten unverändert weiter. In der Hauptleitung fließt weniger Strom.',
      parallelAll: 'Alle Lampen sind herausgedreht oder durchgebrannt: Es fließt kein Strom.',
      mixedL: 'Gemischte Schaltung: Lampe 1 liegt in Reihe mit der Parallelschaltung aus Lampe 2 und 3. Durch Lampe 1 fließt der ganze Strom, danach teilt er sich auf – Lampe 1 leuchtet am hellsten.',
      mixedOut1: 'Lampe 1 ist {why}: Die Hauptleitung ist unterbrochen – alle Lampen gehen aus.',
      mixedOutBranch: 'Lampe {i} ist {why}: Jetzt liegen Lampe 1 und Lampe {j} einfach in Reihe. Lampe 1 wird dunkler, Lampe {j} heller.',
      mixedOutBoth: 'Lampe 2 und 3 sind nicht in Betrieb: Der Stromkreis ist unterbrochen.',
      whyOut: 'herausgedreht',
      whyBurnt: 'durchgebrannt',
      burntNote: 'Eine Lampe ist durchgebrannt: An ihr lagen mehr als 9 V, ihre Nennspannung ist 6 V.',
      seriesR: 'Reihenschaltung: Durch alle Widerstände fließt derselbe Strom. Die Spannung teilt sich im Verhältnis der Widerstände auf: Am größten Widerstand liegt die größte Spannung.',
      parallelR: 'Parallelschaltung: An allen Widerständen liegt dieselbe Spannung. Durch den kleinsten Widerstand fließt der größte Strom.',
      mixedR: 'Gemischte Schaltung: R₁ liegt in Reihe mit der Parallelschaltung aus R₂ und R₃.',
    },
    en: {
      canvas: 'Circuit diagram with a voltage source and two or three bulbs or resistors in series, in parallel or mixed, with ammeters and voltmeters',
      source: 'U = {U} V',
      lamp: 'L{i}',
      res: 'R{i}',
      ohm: '{R} Ω',
      tapLamp: 'tap a bulb to unscrew it',
      burnt: 'blown',
      out: 'unscrewed',
      slot: 'position {k}',
      partLamp: 'bulb {i}',
      partRes: 'R{i}',
      partSource: 'source',
      meterA: 'A{k} at position {s}: {I} A',
      meterV: 'V{k} across {p}: {U} V',
      meterNone: 'No meters placed – tap a numbered position.',
      meterMissing: 'A{k}: there is no position {s} in this circuit.',
      seriesL: 'Series circuit: all bulbs lie one after another in a single loop. The same current flows through each; the source voltage is shared – each bulb is dimmer than on its own.',
      seriesOut: 'Bulb {i} is {why}: the only loop is broken – all bulbs go out. The full voltage appears across the gap.',
      parallelL: 'Parallel circuit: each bulb is in its own branch directly across the source and gets the full voltage. The branch currents add up in the main wire.',
      parallelOut: 'Bulb {i} is {why}: only its branch is broken – the other bulbs stay just as bright. Less current flows in the main wire.',
      parallelAll: 'All bulbs are unscrewed or blown: no current flows.',
      mixedL: 'Mixed circuit: bulb 1 is in series with bulbs 2 and 3 in parallel. The whole current flows through bulb 1 and then divides – bulb 1 is the brightest.',
      mixedOut1: 'Bulb 1 is {why}: the main loop is broken – all bulbs go out.',
      mixedOutBranch: 'Bulb {i} is {why}: now bulb 1 and bulb {j} are simply in series. Bulb 1 gets dimmer, bulb {j} brighter.',
      mixedOutBoth: 'Bulbs 2 and 3 are not working: the circuit is broken.',
      whyOut: 'unscrewed',
      whyBurnt: 'blown',
      burntNote: 'A bulb has blown: it had more than 9 V across it; its rated voltage is 6 V.',
      seriesR: 'Series circuit: the same current flows through all resistors. The voltage is shared in the ratio of the resistances: the largest resistor gets the largest voltage.',
      parallelR: 'Parallel circuit: all resistors have the same voltage. The smallest resistor carries the largest current.',
      mixedR: 'Mixed circuit: R₁ is in series with R₂ and R₃ in parallel.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const g = surface.g;
    const tr = (key: string, vars: Record<string, string> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const circ = () => p.circ as Circuit;
    const lamps = () => p.kind === 'lamp';
    const count = () => partCount(circ(), p.n);
    const reduced = prefersReducedMotion();
    const DW = () => (narrow() ? 360 : 760);
    const DH_ = () => (narrow() ? 440 : 470);
    const sizes = () => (narrow() ? { R: 20, rm: 11.5, off: 34 } : { R: 30, rm: 17, off: 64 });

    /* ---------- Zustand ---------- */
    const burnt = [false, false, false];
    const overload = [0, 0, 0];
    const flash = [new Tween(900, ease.outCubic), new Tween(900, ease.outCubic), new Tween(900, ease.outCubic)];
    const unscrew = [new Tween(650, ease.inOutCubic), new Tween(650, ease.inOutCubic), new Tween(650, ease.inOutCubic)];
    const outFrom = [0, 0, 0];
    const morph = new Tween(750, ease.inOutCubic);
    let fromLayout: Layout | null = null;
    let lastKey = '';
    const phase = new Map<string, number>();
    let hovered: string | null = null;
    let hits: { id: string; x: number; y: number; r: number }[] = [];
    let lastFrame = performance.now();

    const removed = (i: number) => [p.x1, p.x2, p.x3][i] === true && lamps();
    const openState = () => Array.from({ length: count() }, (_, i) => removed(i) || (lamps() && burnt[i]!));
    const resistances = (): number[] => (lamps() ? Array.from({ length: count() }, () => LAMP_R) : [p.R1, p.R2, p.R3].slice(0, count()));
    const result = (): CircuitResult => solve(circ(), p.U, resistances(), openState());
    const out01 = (i: number) => {
      const target = removed(i) ? 1 : 0;
      return unscrew[i]!.running ? mix(outFrom[i]!, target, unscrew[i]!.value) : target;
    };

    function layoutKey(): string {
      return `${circ()}|${count()}|${narrow()}`;
    }

    /* ---------- Ergebnisse ---------- */
    const fI = (I: number) => fmt.fixed(I, I < 0.1 && I > 0 ? 3 : 2);
    const fU = (U: number) => fmt.fixed(U, 2);
    const partName = (i: number) => tr(lamps() ? 'partLamp' : 'partRes', { i: lamps() ? String(i + 1) : SUB[i + 1]! });

    function updateReadouts(): void {
      const res = result();
      const c = circ();
      const open = openState();
      // Beobachtung
      let state = '';
      if (!lamps()) state = ctx.t(c === 'series' ? 'seriesR' : c === 'parallel' ? 'parallelR' : 'mixedR');
      else {
        const why = (i: number) => ctx.t(burnt[i] ? 'whyBurnt' : 'whyOut');
        const offs = open.map((o, i) => (o ? i : -1)).filter((i) => i >= 0);
        if (!offs.length) state = ctx.t(c === 'series' ? 'seriesL' : c === 'parallel' ? 'parallelL' : 'mixedL');
        else if (c === 'series') state = tr('seriesOut', { i: String(offs[0]! + 1), why: why(offs[0]!) });
        else if (c === 'parallel') state = offs.length === count() ? ctx.t('parallelAll') : tr('parallelOut', { i: offs.map((i) => i + 1).join(', '), why: why(offs[0]!) });
        else if (open[0]) state = tr('mixedOut1', { why: why(0) });
        else if (offs.length === 2) state = ctx.t('mixedOutBoth');
        else state = tr('mixedOutBranch', { i: String(offs[0]! + 1), j: offs[0] === 1 ? '3' : '2', why: why(offs[0]!) });
        if (burnt.slice(0, count()).some(Boolean)) state += ` ${ctx.t('burntNote')}`;
      }
      ctx.readout('state', state);
      // Messgeräte
      const slots = ammeterSlots(c, p.n);
      const lines: string[] = [];
      for (const [k, key] of [
        [1, p.a1],
        [2, p.a2],
      ] as const) {
        if (key === '0') continue;
        const s = slots[Number(key) - 1];
        if (!s) lines.push(tr('meterMissing', { k: SUB[k]!, s: key }));
        else lines.push(tr('meterA', { k: SUB[k]!, s: key, I: fI(slotCurrent(s, res)) }));
      }
      for (const [k, key] of [
        [1, p.v1],
        [2, p.v2],
      ] as const) {
        if (key === '0') continue;
        if (key === 'S') lines.push(tr('meterV', { k: SUB[k]!, p: ctx.t('partSource'), U: fU(p.U) }));
        else {
          const i = Number(key) - 1;
          if (i < count()) lines.push(tr('meterV', { k: SUB[k]!, p: partName(i), U: fU(res.parts[i]!.U) }));
        }
      }
      ctx.readout('meters', lines.length ? { html: lines.map((l) => l.replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('<br>') } : ctx.t('meterNone'));
      // Gesetzmäßigkeiten
      const n = count();
      const idx = Array.from({ length: n }, (_, i) => SUB[i + 1]!);
      const v = (sym: string, i: string) => `<var>${sym}</var>${i}`;
      const frac1 = (b: string) => `<span class="frac"><span>1</span><span>${b}</span></span>`;
      if (c === 'series')
        ctx.readout('rules', {
          html: `${v('I', '')} = ${idx.map((i) => v('I', i)).join(' = ')}<br>${v('U', '')} = ${idx.map((i) => v('U', i)).join(' + ')}<br>${v('R', '')} = ${idx.map((i) => v('R', i)).join(' + ')}`,
        });
      else if (c === 'parallel')
        ctx.readout('rules', {
          html: `${v('U', '')} = ${idx.map((i) => v('U', i)).join(' = ')}<br>${v('I', '')} = ${idx.map((i) => v('I', i)).join(' + ')}<br>${frac1(v('R', ''))} = ${idx.map((i) => frac1(v('R', i))).join(' + ')}`,
        });
      else
        ctx.readout('rules', {
          html: `${v('I', '')} = ${v('I', '₁')} = ${v('I', '₂')} + ${v('I', '₃')}<br>${v('U', '')} = ${v('U', '₁')} + ${v('U', '₂')} ${ctx.lang === 'de' ? 'und' : 'and'} ${v('U', '₂')} = ${v('U', '₃')}<br>${v('R', '')} = ${v('R', '₁')} + <span class="frac"><span>${v('R', '₂')} · ${v('R', '₃')}</span><span>${v('R', '₂')} + ${v('R', '₃')}</span></span>`,
        });
      // Ersatzwiderstand
      const Rs = resistances();
      const ohm = (r: number) => `${fmt.num(r, r < 10 ? 2 : 1)} Ω`;
      if (!Number.isFinite(res.R)) ctx.readout('R', ctx.lang === 'de' ? 'Stromkreis unterbrochen – kein Strom' : 'Circuit broken – no current');
      else if (open.some(Boolean)) ctx.readout('R', { html: `<var>R</var> = <span class="frac"><span><var>U</var></span><span><var>I</var></span></span> = <strong>${ohm(res.R)}</strong>` });
      else if (c === 'series') ctx.readout('R', { html: `<var>R</var> = ${Rs.map(ohm).join(' + ')} = <strong>${ohm(res.R)}</strong>` });
      else if (c === 'parallel') ctx.readout('R', { html: `${frac1('<var>R</var>')} = ${Rs.map((r) => frac1(ohm(r))).join(' + ')} → <var>R</var> = <strong>${ohm(res.R)}</strong>` });
      else ctx.readout('R', { html: `<var>R</var> = ${ohm(Rs[0]!)} + <span class="frac"><span>${ohm(Rs[1]!)} · ${ohm(Rs[2]!)}</span><span>${ohm(Rs[1]!)} + ${ohm(Rs[2]!)}</span></span> = <strong>${ohm(res.R)}</strong>` });
      // Tabelle
      const rows = res.parts
        .map((q, i) => `<tr><td style="text-align:left">${partName(i)}</td><td>${fU(q.U)}</td><td>${fI(q.I)}</td><td>${open[i] ? '∞' : fmt.num(Rs[i]!, 0)}</td></tr>`)
        .join('');
      const head = ctx.lang === 'de' ? ['', 'U in V', 'I in A', 'R in Ω'] : ['', 'U in V', 'I in A', 'R in Ω'];
      ctx.readout('table', {
        html: `<table class="mini-table"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows}<tr><td style="text-align:left">${ctx.lang === 'de' ? 'gesamt' : 'total'}</td><td>${fU(p.U)}</td><td>${fI(res.I)}</td><td>${Number.isFinite(res.R) ? fmt.num(res.R, 1) : '∞'}</td></tr></table>`,
      });
      ctx.setAction('fix', { enabled: !ctx.locked && (burnt.some(Boolean) || p.x1 || p.x2 || p.x3) });
    }

    /* ---------- Zeiger ---------- */
    new TapTarget(surface, {
      hit: (x, y) => {
        for (let i = hits.length - 1; i >= 0; i--) {
          const h = hits[i]!;
          if (Math.hypot(x - h.x, y - h.y) <= h.r) return h.id;
        }
        return null;
      },
      onTap: (id) => tap(id),
      onHover: (id) => {
        hovered = id;
      },
    });

    function tap(id: string): void {
      if (ctx.locked) return;
      if (id.startsWith('lamp:')) {
        const i = Number(id.slice(5));
        if (burnt[i]) {
          burnt[i] = false;
          overload[i] = 0;
          updateReadouts();
          return;
        }
        const key = (['x1', 'x2', 'x3'] as const)[i]!;
        ctx.set({ [key]: !removed(i) });
      } else if (id.startsWith('slot:')) {
        const k = id.slice(5);
        if (p.a1 === k) ctx.set({ a1: '0' });
        else if (p.a2 === k) ctx.set({ a2: '0' });
        else if (p.a1 === '0') ctx.set({ a1: k as never });
        else ctx.set({ a2: k as never });
      } else if (id.startsWith('volt:')) {
        const k = id.slice(5);
        if (p.v1 === k) ctx.set({ v1: '0' });
        else if (p.v2 === k) ctx.set({ v2: '0' });
        else if (p.v1 === '0') ctx.set({ v1: k as never });
        else ctx.set({ v2: k as never });
      }
    }

    /* ---------- Zeichenhilfen ---------- */
    function tag(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size: number): void {
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 12;
      const h = size + 8;
      let x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      x0 = Math.max(4, Math.min(surface.width - w - 4, x0));
      const y0 = Math.max(4, Math.min(surface.height - h - 4, y - h / 2));
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.94)' : 'rgba(255,255,255,0.97)';
      roundRect(g, x0, y0, w, h, 6);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(color, 0.65);
      g.lineWidth = 1.2;
      roundRect(g, x0 + 0.5, y0 + 0.5, w - 1, h - 1, 6);
      g.stroke();
      text(g, label, x0 + w / 2, y0 + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color });
    }

    function edgeCurrent(key: EdgeKey, res: CircuitResult): number {
      if (key === 'main') return res.I;
      return key.reduce((sum, i) => sum + (res.parts[i]?.I ?? 0), 0);
    }

    function drawFlow(path: Path, id: string, s: number): void {
      const f = p.flow as Flow;
      if (f === 'none' || path.length < 2) return;
      const theme = ctx.theme;
      const ph = phase.get(id) ?? 0;
      if (f === 'e') {
        const n = Math.max(1, Math.round(path.length / (15 * s)));
        const gap = path.length / n;
        const off = (((ph * s) % gap) + gap) % gap;
        g.fillStyle = theme.series[0]!;
        g.strokeStyle = theme.dark ? 'rgba(10,16,24,0.9)' : 'rgba(255,255,255,0.95)';
        g.lineWidth = 1.3;
        const rad = Math.max(2, 2.8 * s);
        for (let k = 0; k < n; k++) {
          // Elektronen bewegen sich entgegen der technischen Stromrichtung
          const [x, y] = path.at(path.length - (k * gap + off));
          g.beginPath();
          g.arc(x, y, rad, 0, Math.PI * 2);
          g.fill();
          g.stroke();
        }
      } else {
        const n = Math.max(1, Math.round(path.length / (34 * s)));
        const gap = path.length / n;
        const off = (((ph * s) % gap) + gap) % gap;
        const size = Math.max(4, 5.5 * s);
        for (let k = 0; k < n; k++) {
          const [x, y, a] = path.at(k * gap + off);
          g.save();
          g.translate(x, y);
          g.rotate(a);
          g.lineCap = 'round';
          g.lineJoin = 'round';
          const tri = () => {
            g.beginPath();
            g.moveTo(-size * 0.7, -size * 0.75);
            g.lineTo(size * 0.55, 0);
            g.lineTo(-size * 0.7, size * 0.75);
          };
          g.strokeStyle = theme.dark ? 'rgba(10,16,24,0.9)' : 'rgba(255,255,255,0.95)';
          g.lineWidth = size * 0.75;
          tri();
          g.stroke();
          g.strokeStyle = theme.series[1]!;
          g.lineWidth = size * 0.42;
          tri();
          g.stroke();
          g.restore();
        }
      }
    }

    /** Glühlampe (Bild oder Schaltzeichen), Winkel 0 = Anschlüsse links/rechts. */
    function drawLamp(c: Pt, angle: number, R: number, P: number, alpha: number, isBurnt: boolean, flashT: number): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const T = isBurnt ? 293 : filamentTemperature(P);
      const glow = Math.min(1.25, glowOf(T));
      g.save();
      g.globalAlpha = alpha;
      g.translate(c[0], c[1]);
      // Lichtschein
      if (glow > 0.004 && alpha > 0.5) {
        const [hr, hg, hb] = haloColor(T);
        const k = Math.min(1, glow);
        const Rh = R * (1.4 + 2.6 * k + (glow > 1 ? (glow - 1) * 4 : 0));
        const halo = g.createRadialGradient(0, 0, R * 0.3, 0, 0, Rh);
        halo.addColorStop(0, `rgba(${hr},${hg},${hb},${0.6 * k})`);
        halo.addColorStop(0.4, `rgba(${hr},${hg},${hb},${0.2 * k})`);
        halo.addColorStop(1, `rgba(${hr},${hg},${hb},0)`);
        g.fillStyle = halo;
        g.fillRect(-Rh, -Rh, 2 * Rh, 2 * Rh);
      }
      if (flashT < 1) {
        const k = 1 - flashT;
        const fl = g.createRadialGradient(0, 0, 0, 0, 0, R * (2 + 3 * flashT));
        fl.addColorStop(0, `rgba(255,255,240,${0.95 * k})`);
        fl.addColorStop(1, 'rgba(255,220,120,0)');
        g.fillStyle = fl;
        g.fillRect(-R * 5, -R * 5, R * 10, R * 10);
      }
      g.rotate(angle);
      if (p.sym) {
        g.fillStyle = glow > 0.01 ? `rgba(255,236,170,${0.3 + 0.6 * Math.min(1, glow)})` : theme.bg;
        g.beginPath();
        g.arc(0, 0, R * 0.62, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = theme.text;
        g.lineWidth = 2.2;
        g.stroke();
        const q = R * 0.62 * Math.SQRT1_2;
        g.beginPath();
        g.moveTo(-q, -q);
        g.lineTo(q, q);
        g.moveTo(q, -q);
        g.lineTo(-q, q);
        g.stroke();
        g.beginPath();
        g.moveTo(-R, 0);
        g.lineTo(-R * 0.62, 0);
        g.moveTo(R * 0.62, 0);
        g.lineTo(R, 0);
        g.stroke();
        g.restore();
        return;
      }
      // Glaskolben
      const glass = g.createRadialGradient(-R * 0.3, -R * 0.35, R * 0.1, 0, 0, R * 1.2);
      if (glow > 0.02) {
        const k = Math.min(1, glow);
        glass.addColorStop(0, `rgba(255,250,228,${0.4 + 0.55 * k})`);
        glass.addColorStop(1, `rgba(255,212,140,${0.2 + 0.45 * k})`);
      } else if (isBurnt) {
        glass.addColorStop(0, dark ? 'rgba(170,175,185,0.35)' : 'rgba(225,228,232,0.85)');
        glass.addColorStop(1, dark ? 'rgba(90,95,105,0.4)' : 'rgba(150,155,165,0.6)');
      } else {
        glass.addColorStop(0, dark ? 'rgba(230,240,255,0.3)' : 'rgba(255,255,255,0.9)');
        glass.addColorStop(1, dark ? 'rgba(160,180,210,0.2)' : 'rgba(195,210,228,0.6)');
      }
      g.fillStyle = glass;
      g.beginPath();
      g.arc(0, 0, R * 0.86, 0, Math.PI * 2);
      g.fill();
      // Sockel-Ringe an beiden Anschlüssen
      for (const sgn of [-1, 1]) {
        const m = g.createLinearGradient(0, -R * 0.3, 0, R * 0.3);
        m.addColorStop(0, '#f1f4f8');
        m.addColorStop(0.5, '#a3abb6');
        m.addColorStop(1, '#6b7380');
        g.fillStyle = m;
        roundRect(g, sgn > 0 ? R * 0.74 : -R, -R * 0.26, R * 0.26, R * 0.52, R * 0.08);
        g.fill();
      }
      // Haltedrähte und Wendel
      g.strokeStyle = dark ? '#a3abb6' : '#6c7480';
      g.lineWidth = Math.max(1, R * 0.05);
      g.beginPath();
      g.moveTo(-R * 0.74, 0);
      g.lineTo(-R * 0.42, -R * 0.12);
      g.moveTo(R * 0.74, 0);
      g.lineTo(R * 0.42, -R * 0.12);
      g.stroke();
      const fc = filamentColor(T);
      g.save();
      if (glow > 0.05) {
        g.shadowColor = fc;
        g.shadowBlur = R * 0.5 * Math.min(1, glow);
      }
      g.strokeStyle = fc;
      g.lineWidth = Math.max(1.2, R * 0.065);
      g.beginPath();
      if (isBurnt) {
        // gerissene Wendel
        for (const sgn of [-1, 1]) {
          g.moveTo(sgn * R * 0.42, -R * 0.12);
          for (let k = 1; k <= 8; k++) {
            const u = k / 8;
            g.lineTo(sgn * R * (0.42 - 0.34 * u), -R * 0.12 + Math.abs(Math.sin(u * Math.PI * 3)) * R * 0.1 + u * R * 0.28);
          }
        }
      } else {
        for (let k = 0; k <= 36; k++) {
          const u = k / 36;
          const x = -R * 0.42 + R * 0.84 * u;
          const y = -R * 0.12 - Math.abs(Math.sin(u * Math.PI * 6)) * R * 0.12;
          if (k === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
      }
      g.stroke();
      g.restore();
      if (isBurnt) {
        const soot = g.createRadialGradient(0, -R * 0.4, 0, 0, -R * 0.3, R * 0.8);
        soot.addColorStop(0, 'rgba(60,60,60,0.35)');
        soot.addColorStop(1, 'rgba(60,60,60,0)');
        g.fillStyle = soot;
        g.beginPath();
        g.arc(0, 0, R * 0.86, 0, Math.PI * 2);
        g.fill();
      }
      g.strokeStyle = dark ? 'rgba(220,230,245,0.55)' : 'rgba(110,125,145,0.65)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.arc(0, 0, R * 0.86, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.8)';
      g.lineWidth = Math.max(1.5, R * 0.08);
      g.lineCap = 'round';
      g.beginPath();
      g.arc(0, 0, R * 0.62, Math.PI * 1.1, Math.PI * 1.4);
      g.stroke();
      g.restore();
    }

    function drawResistor(c: Pt, dir: Dir, R: number, value: number, alpha: number): void {
      const theme = ctx.theme;
      g.save();
      g.globalAlpha = alpha;
      const along = R * 1.0;
      const across = R * 0.36;
      const w = dir === 'h' ? 2 * along : 2 * across;
      const h = dir === 'h' ? 2 * across : 2 * along;
      g.fillStyle = theme.dark ? '#162030' : '#ffffff';
      g.fillRect(c[0] - w / 2, c[1] - h / 2, w, h);
      g.strokeStyle = theme.text;
      g.lineWidth = 2.2;
      g.strokeRect(c[0] - w / 2, c[1] - h / 2, w, h);
      const label = tr('ohm', { R: fmt.num(value, 0) });
      const size = narrow() ? 11 : 12;
      if (dir === 'h') text(g, label, c[0], c[1] + 0.5, { font: `700 ${size}px ${theme.font}`, color: theme.text });
      else {
        g.save();
        g.translate(c[0], c[1]);
        g.rotate(-Math.PI / 2);
        text(g, label, 0, 0.5, { font: `700 ${size - 1}px ${theme.font}`, color: theme.text });
        g.restore();
      }
      g.restore();
    }

    function drawSource(src: Comp, s: number): void {
      const theme = ctx.theme;
      const [cx, cy] = src.c;
      const ink = theme.text;
      g.save();
      g.strokeStyle = ink;
      g.lineCap = 'butt';
      const long = 19 * s;
      const short = 10 * s;
      const gap = 7 * s;
      if (src.dir === 'h') {
        // Pluspol links (langer dünner Strich), Minuspol rechts (kurzer dicker Strich)
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(cx - gap, cy - long);
        g.lineTo(cx - gap, cy + long);
        g.stroke();
        g.lineWidth = 6.5;
        g.beginPath();
        g.moveTo(cx + gap, cy - short);
        g.lineTo(cx + gap, cy + short);
        g.stroke();
        text(g, '+', cx - gap - 12 * s, cy - 14 * s, { font: `800 ${Math.round(15 * Math.min(1.2, s))}px ${theme.font}`, color: theme.series[1]! });
        text(g, '−', cx + gap + 12 * s, cy - 14 * s, { font: `800 ${Math.round(15 * Math.min(1.2, s))}px ${theme.font}`, color: theme.series[0]! });
        text(g, tr('source', { U: fmt.num(p.U, 1) }), cx, cy - long - 14 * s, { font: `700 ${narrow() ? 12 : 13}px ${theme.font}`, color: theme.text });
      } else {
        // Pluspol oben
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(cx - long, cy - gap);
        g.lineTo(cx + long, cy - gap);
        g.stroke();
        g.lineWidth = 6.5;
        g.beginPath();
        g.moveTo(cx - short, cy + gap);
        g.lineTo(cx + short, cy + gap);
        g.stroke();
        text(g, '+', cx - long - 8 * s, cy - gap - 8 * s, { font: `800 ${Math.round(15 * Math.min(1.2, s))}px ${theme.font}`, color: theme.series[1]! });
        text(g, '−', cx - long - 8 * s, cy + gap + 9 * s, { font: `800 ${Math.round(15 * Math.min(1.2, s))}px ${theme.font}`, color: theme.series[0]! });
        g.save();
        g.translate(cx - long - 22 * s, cy);
        g.rotate(-Math.PI / 2);
        text(g, tr('source', { U: fmt.num(p.U, 1) }), 0, 0, { font: `700 ${narrow() ? 12 : 13}px ${theme.font}`, color: theme.text });
        g.restore();
      }
      g.restore();
    }

    /** Messgerät als Schaltzeichen: Kreis mit Buchstabe und Index. */
    function meterSymbol(c: Pt, rm: number, letter: 'A' | 'V', index: number, color: string): void {
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#162030' : '#ffffff';
      g.beginPath();
      g.arc(c[0], c[1], rm, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = color;
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(c[0], c[1], rm, 0, Math.PI * 2);
      g.stroke();
      const size = Math.round(rm * 1.05);
      text(g, `${letter}${SUB[index]}`, c[0], c[1] + 0.5, { font: `800 ${size}px ${theme.font}`, color });
    }

    /* ---------- Szene ---------- */
    function draw(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const w = surface.width;
      const h = surface.height;
      const W = DW();
      const DH = DH_();
      const s = Math.min(w / W, h / DH);
      const ox = (w - W * s) / 2;
      const oy = (h - DH * s) / 2;
      const { R: Ru, rm: rmU, off: offU } = sizes();
      const R = Ru * s;
      const rm = rmU * s;
      const off = offU * s;
      const toPx = (q: Pt): Pt => [ox + q[0] * s, oy + q[1] * s];
      const lay = layoutFor(circ(), p.n, W, DH, Ru);
      const res = result();
      const ink = theme.text;
      hits = [];

      // Hintergrund (Karopapier)
      surface.begin();
      g.save();
      roundRect(g, 0, 0, w, h, 12);
      g.clip();
      g.fillStyle = dark ? '#121a25' : '#fbfcfe';
      g.fillRect(0, 0, w, h);
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      g.beginPath();
      const step = 16 * s;
      for (let x = (w / 2) % step; x < w; x += step) {
        g.moveTo(Math.round(x) + 0.5, 0);
        g.lineTo(Math.round(x) + 0.5, h);
      }
      for (let y = (h / 2) % step; y < h; y += step) {
        g.moveTo(0, Math.round(y) + 0.5);
        g.lineTo(w, Math.round(y) + 0.5);
      }
      g.stroke();

      const t = morph.running ? morph.value : 1;
      const morphing = morph.running && !!fromLayout;
      // Leitungen
      const drawWires = (L0: Layout, alpha: number, flow: boolean) => {
        g.save();
        g.globalAlpha = alpha;
        g.strokeStyle = ink;
        g.lineWidth = Math.max(2, 2.4 * s);
        g.lineCap = 'round';
        g.lineJoin = 'round';
        for (const e of L0.edges) {
          g.beginPath();
          e.pts.forEach((q, i) => {
            const [x, y] = toPx(q);
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          });
          g.stroke();
        }
        g.fillStyle = ink;
        for (const q of L0.nodes) {
          const [x, y] = toPx(q);
          g.beginPath();
          g.arc(x, y, Math.max(3, 4 * s), 0, Math.PI * 2);
          g.fill();
        }
        g.restore();
        if (flow) for (const e of L0.edges) drawFlow(new Path(e.pts.map(toPx)), e.id, s);
      };
      if (morphing) {
        drawWires(fromLayout!, 1 - t, false);
        drawWires(lay, t, false);
      } else drawWires(lay, 1, true);

      // Quelle
      const src = morphing ? { ...lay.source, c: mixPt(fromLayout!.source.c, lay.source.c, t) } : lay.source;
      const srcPx: Comp = { c: toPx(src.c), dir: t < 0.5 && morphing ? fromLayout!.source.dir : lay.source.dir, perp: lay.source.perp };
      g.save();
      g.fillStyle = dark ? '#121a25' : '#fbfcfe';
      if (srcPx.dir === 'h') g.fillRect(srcPx.c[0] - 6 * s, srcPx.c[1] - 22 * s, 12 * s, 44 * s);
      else g.fillRect(srcPx.c[0] - 22 * s, srcPx.c[1] - 6 * s, 44 * s, 12 * s);
      g.restore();
      drawSource(srcPx, s);

      // Bauteile
      for (let i = 0; i < 3; i++) {
        const now = lay.comps[i];
        const before = fromLayout?.comps[i];
        if (!now && !(morphing && before)) continue;
        let comp: Comp;
        let alpha = 1;
        let scale = 1;
        if (morphing) {
          const a = before ?? now!;
          const b = now ?? before!;
          comp = { c: mixPt(a.c, b.c, t), dir: t < 0.5 ? a.dir : b.dir, perp: b.perp };
          if (!before) scale = t;
          if (!now) alpha = 1 - t;
          const angA = a.dir === 'h' ? 0 : Math.PI / 2;
          const angB = b.dir === 'h' ? 0 : Math.PI / 2;
          const ang = mix(angA, angB, t);
          drawPart(i, toPx(comp.c), ang, R * scale, alpha, res, comp, false);
          continue;
        }
        comp = now!;
        drawPart(i, toPx(comp.c), comp.dir === 'h' ? 0 : Math.PI / 2, R, alpha, res, comp, true);
      }

      // Messgeräte und Messstellen (erst nach dem Umbau)
      if (!morphing) {
        const slots = lay.slots;
        const used = new Map<string, number>();
        if (p.a1 !== '0') used.set(p.a1, 1);
        if (p.a2 !== '0' && !used.has(p.a2)) used.set(p.a2, 2);
        slots.forEach((sl, k) => {
          const key = String(k + 1);
          const [x, y] = toPx(sl.pos);
          const meter = used.get(key);
          if (meter) {
            const I = slotCurrent(sl.measure, res);
            meterSymbol([x, y], rm, 'A', meter, theme.series[3]!);
            const size = narrow() ? 11 : 12;
            const label = `${fI(I)} A`;
            if (sl.dir === 'h') tag(x, y < oy + DH * s * 0.5 ? y - rm - 15 : y + rm + 15, label, theme.series[3]!, 'center', size);
            else if (narrow() && circ() !== 'series') tag(x, y - rm - 13, label, theme.series[3]!, 'center', size);
            else tag(x < w * 0.6 ? x + rm + 6 : x - rm - 6, y, label, theme.series[3]!, x < w * 0.6 ? 'left' : 'right', size);
            hits.push({ id: `slot:${key}`, x, y, r: rm + 6 });
          } else if (p.marks && !ctx.locked) {
            const hov = hovered === `slot:${key}`;
            const mr = Math.max(8, 9 * s);
            g.save();
            g.fillStyle = dark ? '#121a25' : '#fbfcfe';
            g.beginPath();
            g.arc(x, y, mr, 0, Math.PI * 2);
            g.fill();
            g.setLineDash([3, 3]);
            g.strokeStyle = withAlpha(theme.series[3]!, hov ? 0.95 : 0.6);
            g.lineWidth = 1.5;
            g.stroke();
            g.restore();
            text(g, key, x, y + 0.5, { font: `700 ${Math.round(mr * 1.1)}px ${theme.font}`, color: withAlpha(theme.series[3]!, hov ? 1 : 0.85) });
            hits.push({ id: `slot:${key}`, x, y, r: mr + 8 });
          }
        });
        // Spannungsmesser parallel zum Bauteil bzw. zur Quelle
        const vUsed = new Map<string, number>();
        if (p.v1 !== '0') vUsed.set(p.v1, 1);
        if (p.v2 !== '0' && !vUsed.has(p.v2)) vUsed.set(p.v2, 2);
        const targets: { key: string; comp: Comp; half: number; U: number }[] = [{ key: 'S', comp: lay.source, half: 7, U: p.U }];
        lay.comps.forEach((c, i) => targets.push({ key: String(i + 1), comp: c, half: Ru, U: res.parts[i]?.U ?? 0 }));
        for (const tg of targets) {
          const c = toPx(tg.comp.c);
          const d: Pt = tg.comp.dir === 'h' ? [1, 0] : [0, 1];
          const pp = tg.comp.perp;
          const vc: Pt = [c[0] + pp[0] * off, c[1] + pp[1] * off];
          const meter = vUsed.get(tg.key);
          if (meter) {
            const half = tg.half * s;
            const color = theme.series[4]!;
            const t1: Pt = [c[0] - d[0] * half, c[1] - d[1] * half];
            const t2: Pt = [c[0] + d[0] * half, c[1] + d[1] * half];
            g.save();
            g.strokeStyle = color;
            g.lineWidth = 1.8;
            g.lineJoin = 'round';
            g.beginPath();
            g.moveTo(t1[0], t1[1]);
            g.lineTo(t1[0] + pp[0] * off, t1[1] + pp[1] * off);
            g.lineTo(vc[0] - d[0] * rm, vc[1] - d[1] * rm);
            g.moveTo(t2[0], t2[1]);
            g.lineTo(t2[0] + pp[0] * off, t2[1] + pp[1] * off);
            g.lineTo(vc[0] + d[0] * rm, vc[1] + d[1] * rm);
            g.stroke();
            g.fillStyle = color;
            for (const q of [t1, t2]) {
              g.beginPath();
              g.arc(q[0], q[1], 3.2, 0, Math.PI * 2);
              g.fill();
            }
            g.restore();
            meterSymbol(vc, rm, 'V', meter, color);
            const size = narrow() ? 11 : 12;
            const label = `${fU(tg.U)} V`;
            if (pp[1] !== 0) tag(vc[0], vc[1] + pp[1] * (rm + 15), label, color, 'center', size);
            else if (narrow()) tag(vc[0], vc[1] + rm + 14, label, color, 'center', size);
            else tag(vc[0] + rm + 6, vc[1], label, color, 'left', size);
            hits.push({ id: `volt:${tg.key}`, x: vc[0], y: vc[1], r: rm + 6 });
          } else if (p.marks && !ctx.locked) {
            const hov = hovered === `volt:${tg.key}`;
            const mr = Math.max(8, 9 * s);
            g.save();
            g.setLineDash([3, 3]);
            g.strokeStyle = withAlpha(theme.series[4]!, hov ? 0.95 : 0.45);
            g.lineWidth = 1.4;
            g.beginPath();
            g.arc(vc[0], vc[1], mr, 0, Math.PI * 2);
            g.stroke();
            g.restore();
            text(g, 'V', vc[0], vc[1] + 0.5, { font: `700 ${Math.round(mr * 1.05)}px ${theme.font}`, color: withAlpha(theme.series[4]!, hov ? 1 : 0.7) });
            hits.push({ id: `volt:${tg.key}`, x: vc[0], y: vc[1], r: mr + 8 });
          }
        }
      }
      // Hinweis zum Herausdrehen
      if (lamps() && !ctx.locked && !morphing && hovered?.startsWith('lamp:')) {
        tag(w / 2, h - 16, ctx.t('tapLamp'), theme.muted, 'center', narrow() ? 11 : 12);
      }
      g.restore();
    }

    function drawPart(i: number, c: Pt, angle: number, R: number, alpha: number, res: CircuitResult, comp: Comp, interactive: boolean): void {
      const theme = ctx.theme;
      const s = R / sizes().R;
      if (!lamps()) {
        drawResistor(c, angle > Math.PI / 4 ? 'v' : 'h', R, [p.R1, p.R2, p.R3][i]!, alpha);
        labelPart(i, c, comp, R, s, alpha);
        return;
      }
      const out = out01(i);
      // leere Fassung (Unterbrechung)
      if (out > 0.02) {
        g.save();
        g.globalAlpha = alpha * Math.min(1, out * 1.5);
        g.translate(c[0], c[1]);
        g.rotate(angle);
        g.fillStyle = theme.dark ? '#121a25' : '#fbfcfe';
        g.fillRect(-R * 0.9, -R * 0.4, R * 1.8, R * 0.8);
        g.setLineDash([4, 4]);
        g.strokeStyle = withAlpha(theme.muted, 0.8);
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(0, 0, R * 0.86, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        g.strokeStyle = theme.text;
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(-R, 0);
        g.lineTo(-R * 0.55, 0);
        g.moveTo(R * 0.55, 0);
        g.lineTo(R, 0);
        g.stroke();
        g.restore();
      }
      // Lampe (beim Herausdrehen: drehen, abheben, verblassen)
      // herausgedrehte Lampe schwebt schräg über der leeren Fassung (der Beschriftung abgewandt)
      const lift: Pt = [(comp.dir === 'h' ? 0.5 : -0.5) * R * out, -0.6 * R * out];
      const spin = angle + out * Math.PI * 3;
      const P = res.parts[i]?.P ?? 0;
      const ft = flash[i]!.running ? flash[i]!.t : 1;
      drawLamp([c[0] + lift[0], c[1] + lift[1]], spin, R * (1 - 0.2 * out), out > 0.5 ? 0 : P, alpha * (1 - 0.5 * out), burnt[i]!, ft);
      labelPart(i, c, comp, R, s, alpha);
      if (interactive) {
        g.save();
        if (hovered === `lamp:${i}` && !ctx.locked) {
          g.strokeStyle = withAlpha(theme.series[0]!, 0.6);
          g.lineWidth = 2;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.arc(c[0], c[1], R * 1.15, 0, Math.PI * 2);
          g.stroke();
        }
        g.restore();
        hits.push({ id: `lamp:${i}`, x: c[0], y: c[1], r: R * 1.05 });
        if (out > 0.5) hits.push({ id: `lamp:${i}`, x: c[0] + lift[0], y: c[1] + lift[1], r: R });
      }
    }

    function labelPart(i: number, c: Pt, comp: Comp, R: number, s: number, alpha: number): void {
      const theme = ctx.theme;
      const label = lamps() ? tr('lamp', { i: String(i + 1) }) : tr('res', { i: SUB[i + 1]! });
      const size = Math.max(11, Math.round(12.5 * Math.min(1.2, s)));
      g.save();
      g.globalAlpha = alpha;
      // waagerecht: auf der dem Spannungsmesser abgewandten Seite; senkrecht: links oben
      const x = comp.dir === 'h' ? c[0] : c[0] + R * 0.75 + 4 * s;
      const y = comp.dir === 'h' ? (comp.perp[1] < 0 ? c[1] + R + 13 * s : c[1] - R - 13 * s) : c[1] - R - 4 * s;
      text(g, label, x, y, { font: `700 ${size}px ${theme.font}`, color: theme.muted, align: comp.dir === 'h' ? 'center' : 'left' });
      if (lamps() && (burnt[i] || removed(i))) {
        const note = ctx.t(burnt[i] ? 'burnt' : 'out');
        const ny = comp.dir === 'h' ? y + size + 2 : c[1] + R + 12 * s;
        const nx = comp.dir === 'h' ? x : c[0];
        tag(nx, ny, note, burnt[i] ? theme.series[1]! : theme.muted, 'center', Math.max(10, size - 2));
      }
      g.restore();
    }

    /* ---------- Ablauf ---------- */
    function step(dt: number, res: CircuitResult): void {
      // Durchbrennen bei Überspannung
      if (lamps()) {
        for (let i = 0; i < count(); i++) {
          if (!burnt[i] && burnsOut(res.parts[i]?.U ?? 0) && !removed(i)) {
            overload[i]! += dt;
            if (overload[i]! > 0.4) {
              burnt[i] = true;
              flash[i]!.play();
              updateReadouts();
            }
          } else overload[i] = 0;
        }
      }
      if (!reduced) {
        const lay = layoutFor(circ(), p.n, DW(), DH_(), sizes().R);
        for (const e of lay.edges) phase.set(e.id, (phase.get(e.id) ?? 0) + 75 * edgeCurrent(e.key, res) * dt);
      }
    }

    updateReadouts();
    lastKey = layoutKey();

    return {
      update(changed, source) {
        const key = layoutKey();
        if (key !== lastKey) {
          const [c0, n0, nar0] = lastKey.split('|');
          fromLayout = layoutFor(c0 as Circuit, Number(n0), nar0 === 'true' ? 360 : 760, nar0 === 'true' ? 440 : 470, nar0 === 'true' ? 20 : 30);
          lastKey = key;
          if (source !== 'init' && nar0 === String(narrow())) morph.play();
        }
        (['x1', 'x2', 'x3'] as const).forEach((k, i) => {
          if (changed.has(k)) {
            const before = removed(i) ? 0 : 1;
            outFrom[i] = unscrew[i]!.running ? mix(outFrom[i]!, before, unscrew[i]!.value) : before;
            if (source !== 'init') unscrew[i]!.play();
          }
        });
        if (source === 'replace' || changed.has('kind')) {
          burnt.fill(false);
          overload.fill(0);
        }
        if (source === 'init' || source === 'replace') unscrew.forEach((tw) => tw.finish());
        lastFrame = performance.now();
        updateReadouts();
      },

      action(id) {
        if (id === 'fix' && !ctx.locked) {
          burnt.fill(false);
          overload.fill(0);
          ctx.set({ x1: false, x2: false, x3: false });
          updateReadouts();
        }
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        // Bildschirmbreite gewechselt (schmal ↔ breit): ohne Übergang neu aufbauen
        if (layoutKey() !== lastKey) lastKey = layoutKey();
        const res = result();
        step(dt, res);
        draw();
        const moving = res.I > 1e-9 && !reduced && p.flow !== 'none';
        const busy = morph.running || unscrew.some((tw) => tw.running) || flash.some((tw) => tw.running) || overload.some((o) => o > 0);
        if (moving || busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
