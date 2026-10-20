import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import { drawPictIcon, type PictIcon } from './icons';
import {
  DATASETS,
  effectiveCut,
  iconCount,
  minPositiveIndex,
  percent,
  percentsOf,
  pieAngles,
  ranks,
  reduceFraction,
  roundedPercents,
  suggestCut,
  tally,
  total,
  unevenFraction,
  unevenTicks,
  valueAxis,
  wrongBase,
  type DataId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'read' | 'trick' | 'detect';
type Chart = 'tab' | 'col' | 'bar' | 'line' | 'pict' | 'strip' | 'pie';
type Trick = 'cut' | 'gap' | 'area' | 'unit' | 'sum';
type Zone = 'title' | 'axis' | 'unit' | 'marks' | 'labels' | 'cats';

/* ------------------------------------------------------------------ */
/* Texte der Datensätze                                                */
/* ------------------------------------------------------------------ */

interface DataText {
  title: Loc;
  cats: Loc[];
  long: Loc[];
  one: Loc;
  many: Loc;
  axis: Loc;
  noun: Loc;
  icon: PictIcon;
  /** Einheitenzeichen direkt hinter der Zahl (min, °C); sonst Wort (Kinder, Stimmen). */
  sym?: string;
}

const DAYS: Loc[] = [L('Mo', 'Mon'), L('Di', 'Tue'), L('Mi', 'Wed'), L('Do', 'Thu'), L('Fr', 'Fri'), L('Sa', 'Sat'), L('So', 'Sun')];
const DAYS_LONG: Loc[] = [L('Montag', 'Monday'), L('Dienstag', 'Tuesday'), L('Mittwoch', 'Wednesday'), L('Donnerstag', 'Thursday'), L('Freitag', 'Friday'), L('Samstag', 'Saturday'), L('Sonntag', 'Sunday')];
const SPORTS: Loc[] = [L('Fußball', 'Football'), L('Tanzen', 'Dancing'), L('Reiten', 'Riding'), L('Tennis', 'Tennis'), L('Turnen', 'Gymnastics')];
const NAMES: Loc[] = [L('Mia', 'Mia'), L('Jonas', 'Jonas'), L('Lea', 'Lea')];

const TEXTS: Record<DataId, DataText> = {
  sport: { title: L('Lieblingssport der Klasse 6b', 'Favourite sport in class 6b'), cats: SPORTS, long: SPORTS, one: L('Kind', 'child'), many: L('Kinder', 'children'), axis: L('Anzahl der Kinder', 'Number of children'), noun: L('Sportart', 'Sport'), icon: 'person' },
  wahl: { title: L('Schülersprecherwahl', 'School council election'), cats: NAMES, long: NAMES, one: L('Stimme', 'vote'), many: L('Stimmen', 'votes'), axis: L('Anzahl der Stimmen', 'Number of votes'), noun: L('Name', 'Name'), icon: 'vote' },
  handy: { title: L('Linas Handyzeit in einer Woche', 'Lina’s phone time in one week'), cats: DAYS, long: DAYS_LONG, one: L('min', 'min'), many: L('min', 'min'), axis: L('Zeit in min', 'Time in min'), noun: L('Tag', 'Day'), icon: 'phone', sym: 'min' },
  temp: { title: L('Mittagstemperatur in einer Woche', 'Midday temperature over one week'), cats: DAYS, long: DAYS_LONG, one: L('°C', '°C'), many: L('°C', '°C'), axis: L('Temperatur in °C', 'Temperature in °C'), noun: L('Tag', 'Day'), icon: 'sun', sym: '°C' },
};

const CHART_NAMES: Record<Chart, Loc> = {
  tab: L('Strichliste und Tabelle', 'Tally chart and table'),
  col: L('Säulendiagramm', 'Column chart'),
  bar: L('Balkendiagramm', 'Bar chart'),
  line: L('Liniendiagramm', 'Line chart'),
  pict: L('Piktogramm', 'Pictogram'),
  strip: L('Streifendiagramm', 'Strip chart'),
  pie: L('Kreisdiagramm', 'Pie chart'),
};

const CHART_INFO: Record<Chart, Loc> = {
  tab: L('Alle Werte stehen genau da – aber ohne Bild sieht man Unterschiede erst beim Vergleichen der Zahlen.', 'Every value is exact – but without a picture you only see differences by comparing numbers.'),
  col: L('Die Höhe der Säule zeigt den Wert. Abgelesen wird an der Hochachse.', 'The height of a column shows the value, read off on the vertical axis.'),
  bar: L('Wie ein Säulendiagramm, nur liegend: Die Länge zeigt den Wert.', 'Like a column chart, lying down: the length shows the value.'),
  line: L('Zeigt, wie sich ein Wert im Lauf der Zeit verändert.', 'Shows how a value changes over time.'),
  pict: L('Jedes Bildchen steht für gleich viel – man zählt die Bildchen.', 'Every picture stands for the same amount – you count the pictures.'),
  strip: L('Der ganze Streifen ist 100 %. Jedes Stück ist so breit wie sein Anteil.', 'The whole strip is 100 %. Each piece is as wide as its share.'),
  pie: L('Der ganze Kreis ist 100 % – also 360°. Mittelpunktswinkel = Anteil · 360°.', 'The whole circle is 100 %, i.e. 360°. Central angle = share · 360°.'),
};

const TRICK_NAMES: Record<Trick, Loc> = {
  cut: L('Abgeschnittene Achse', 'Truncated axis'),
  gap: L('Ungleiche Achsenabstände', 'Uneven axis steps'),
  area: L('Flächen-Piktogramm', 'Area pictogram'),
  unit: L('Fehlende Einheit', 'Missing unit'),
  sum: L('Kreis mit Summe ≠ 100 %', 'Pie not adding up to 100 %'),
};

/** Detektiv-Fälle: Datensatz, Täuschung, Diagramm, richtige Stellen und eine kleine Geschichte. */
interface Case {
  data: DataId;
  trick: Trick;
  chart: Chart;
  cut?: number;
  zones: Zone[];
  title: Loc;
  story: Loc;
  hint: Loc;
}
const CASES: Case[] = [
  {
    data: 'wahl',
    trick: 'cut',
    chart: 'col',
    cut: 90,
    zones: ['axis'],
    title: L('Die Wahl', 'The election'),
    story: L('Jonas zeigt das Diagramm herum: „Ich habe haushoch gewonnen!“', 'Jonas shows everyone the chart: “I won by a landslide!”'),
    hint: L('Schau genau hin, bei welcher Zahl die Hochachse beginnt.', 'Look closely at the number where the vertical axis starts.'),
  },
  {
    data: 'sport',
    trick: 'area',
    chart: 'pict',
    zones: ['marks'],
    title: L('Die Schülerzeitung', 'The school paper'),
    story: L('Die Schülerzeitung schreibt: „Fußball ist viermal so beliebt wie Reiten!“', 'The school paper writes: “Football is four times as popular as riding!”'),
    hint: L('Vergleiche nicht nur die Höhe der Figuren.', 'Don’t just compare the heights of the figures.'),
  },
  {
    data: 'handy',
    trick: 'gap',
    chart: 'col',
    zones: ['axis'],
    title: L('Linas Handy', 'Lina’s phone'),
    story: L('Lina sagt: „Am Wochenende bin ich kaum länger am Handy als sonst.“', 'Lina says: “At the weekend I’m hardly on my phone longer than usual.”'),
    hint: L('Vergleiche die Zahlen an der Hochachse und ihre Abstände.', 'Compare the numbers on the vertical axis and their spacing.'),
  },
  {
    data: 'sport',
    trick: 'sum',
    chart: 'pie',
    zones: ['labels', 'marks'],
    title: L('Die Umfrage', 'The survey'),
    story: L('Ein Plakat im Klassenzimmer zeigt die Umfrage als Kreisdiagramm.', 'A poster in the classroom shows the survey as a pie chart.'),
    hint: L('Rechne die Prozentangaben einmal zusammen.', 'Try adding up the percentages.'),
  },
  {
    data: 'temp',
    trick: 'unit',
    chart: 'line',
    zones: ['axis', 'unit', 'title'],
    title: L('Der Wetterbericht', 'The weather report'),
    story: L('Im Wetterbericht der Schülerzeitung steht: „Am Samstag wird es 23 Grad.“', 'The school paper’s weather report says: “On Saturday it will be 23 degrees.”'),
    hint: L('Was bedeuten die Zahlen eigentlich? Sieh dir die Beschriftung an.', 'What do the numbers actually mean? Look at the labels.'),
  },
  {
    data: 'handy',
    trick: 'cut',
    chart: 'line',
    cut: 30,
    zones: ['axis'],
    title: L('Der Mittwoch', 'Wednesday'),
    story: L('Lina meint: „Am Mittwoch war ich fast gar nicht am Handy.“', 'Lina claims: “On Wednesday I was hardly on my phone at all.”'),
    hint: L('Wo beginnt die Hochachse? Ist dort wirklich 0?', 'Where does the vertical axis start? Is it really 0?'),
  },
];

/** Regler für einen einzelnen Wert (Schlüssel und Bereich aus dem Modell). */
function vp<K extends string>(key: K, d: DataId) {
  const i = DATASETS[d].keys.indexOf(key);
  return {
    key,
    type: 'number' as const,
    group: 'vals',
    label: TEXTS[d].long[i]!,
    min: DATASETS[d].min,
    max: DATASETS[d].max,
    step: DATASETS[d].step,
    default: DATASETS[d].defaults[i]!,
    unit: d === 'handy' ? 'min' : d === 'temp' ? '°C' : undefined,
    visibleIf: (v: Record<string, unknown>) => v.mode !== 'detect' && v.data === d,
  };
}

/* ------------------------------------------------------------------ */
/* Kleine Helfer                                                       */
/* ------------------------------------------------------------------ */

/** Ein weich gleitender Wert (Ziel setzen, Zwischenwerte mit Easing). */
class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  private fn: (t: number) => number = ease.inOutCubic;
  constructor(
    v: number,
    private readonly reduced: boolean,
  ) {
    this.from = v;
    this.to = v;
  }
  get target(): number {
    return this.to;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp((now - this.t0) / this.ms, 0, 1);
    return this.from + (this.to - this.from) * this.fn(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms: number, fn: (t: number) => number = ease.inOutCubic, delay = 0): void {
    if (to === this.to) return;
    const now = performance.now();
    this.from = this.at(now);
    this.to = to;
    this.t0 = now + delay;
    this.ms = this.reduced ? 0 : ms;
    this.fn = fn;
  }
  snap(v: number): void {
    this.from = v;
    this.to = v;
    this.ms = 0;
  }
}

/** Box mit eigenen Eckenradien (oben links, oben rechts, unten rechts, unten links). */
interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  r: [number, number, number, number];
}

function mixBox(a: Box, b: Box, t: number): Box {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    w: lerp(a.w, b.w, t),
    h: lerp(a.h, b.h, t),
    r: [lerp(a.r[0], b.r[0], t), lerp(a.r[1], b.r[1], t), lerp(a.r[2], b.r[2], t), lerp(a.r[3], b.r[3], t)],
  };
}

function boxPath(g: CanvasRenderingContext2D, b: Box, dx = 0, dy = 0): void {
  const w = Math.max(0, b.w);
  const h = Math.max(0, b.h);
  const lim = Math.min(w, h) / 2;
  const [tl, tr, br, bl] = b.r.map((r) => clamp(r, 0, lim)) as [number, number, number, number];
  const x = b.x + dx;
  const y = b.y + dy;
  g.beginPath();
  g.moveTo(x + tl, y);
  g.lineTo(x + w - tr, y);
  if (tr) g.arcTo(x + w, y, x + w, y + tr, tr);
  g.lineTo(x + w, y + h - br);
  if (br) g.arcTo(x + w, y + h, x + w - br, y + h, br);
  g.lineTo(x + bl, y + h);
  if (bl) g.arcTo(x, y + h, x, y + h - bl, bl);
  g.lineTo(x, y + tl);
  if (tl) g.arcTo(x, y, x + tl, y, tl);
  g.closePath();
}

/* ------------------------------------------------------------------ */
/* Simulation                                                          */
/* ------------------------------------------------------------------ */

/**
 * Diagramme lesen und kritisch prüfen: ein kleiner Datensatz als Strichliste,
 * Säulen-, Balken-, Linien-, Streifen- und Kreisdiagramm oder Piktogramm –
 * beim Umschalten verwandeln sich die Formen weich ineinander (Säulen werden
 * zum Streifen, der Streifen biegt sich zum Kreis). Dazu typische Täuschungen
 * zum Ein- und Ausschalten und ein Detektiv-Modus mit sechs Fällen.
 */
export default defineSimulation({
  id: 'diagramme',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [
    { id: 'vals', label: L('Werte', 'Values') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'read', label: L('Darstellen', 'Display') },
        { value: 'trick', label: L('Täuschungen', 'Tricks') },
        { value: 'detect', label: L('Detektiv', 'Detective') },
      ],
      default: 'read',
    },
    {
      key: 'data',
      type: 'choice',
      label: L('Daten', 'Data'),
      options: [
        { value: 'sport', label: L('Lieblingssport', 'Favourite sport') },
        { value: 'wahl', label: L('Schülersprecherwahl', 'Election') },
        { value: 'handy', label: L('Handyzeit', 'Phone time') },
        { value: 'temp', label: L('Temperaturen', 'Temperatures') },
      ],
      default: 'sport',
      visibleIf: (v) => v.mode !== 'detect',
    },
    {
      key: 'chart',
      type: 'choice',
      label: L('Darstellung', 'Chart'),
      options: (['tab', 'col', 'bar', 'line', 'pict', 'strip', 'pie'] as const).map((value) => ({ value, label: CHART_NAMES[value] })),
      default: 'col',
      visibleIf: (v) => v.mode === 'read',
    },
    {
      key: 'trick',
      type: 'choice',
      label: L('Täuschung', 'Trick'),
      options: (['cut', 'gap', 'area', 'unit', 'sum'] as const).map((value) => ({ value, label: TRICK_NAMES[value] })),
      default: 'cut',
      visibleIf: (v) => v.mode === 'trick',
    },
    {
      key: 'cut',
      type: 'number',
      label: L('Hochachse beginnt bei', 'Axis starts at'),
      min: 0,
      max: 140,
      step: 1,
      default: 90,
      visibleIf: (v) => v.mode === 'trick' && v.trick === 'cut',
      help: L('Höchstens knapp unter dem kleinsten Wert – sonst verschwände eine Säule.', 'At most just below the smallest value – otherwise a column would vanish.'),
    },
    { key: 'honest', type: 'boolean', label: L('Ehrlich darstellen', 'Show honestly'), default: false, visibleIf: (v) => v.mode === 'trick' },
    { key: 'fall', type: 'number', label: L('Fall', 'Case'), min: 1, max: CASES.length, step: 1, default: 1, visibleIf: (v) => v.mode === 'detect' },
    vp('s1', 'sport'),
    vp('s2', 'sport'),
    vp('s3', 'sport'),
    vp('s4', 'sport'),
    vp('s5', 'sport'),
    vp('w1', 'wahl'),
    vp('w2', 'wahl'),
    vp('w3', 'wahl'),
    vp('h1', 'handy'),
    vp('h2', 'handy'),
    vp('h3', 'handy'),
    vp('h4', 'handy'),
    vp('h5', 'handy'),
    vp('h6', 'handy'),
    vp('h7', 'handy'),
    vp('t1', 'temp'),
    vp('t2', 'temp'),
    vp('t3', 'temp'),
    vp('t4', 'temp'),
    vp('t5', 'temp'),
    vp('t6', 'temp'),
    vp('t7', 'temp'),
    { key: 'lab', type: 'boolean', group: 'view', label: L('Werte anschreiben', 'Label values'), default: true, visibleIf: (v) => v.mode !== 'detect' },
    {
      key: 'sort',
      type: 'boolean',
      group: 'view',
      label: L('Nach Größe sortieren', 'Sort by size'),
      default: false,
      visibleIf: (v) => v.mode === 'read' && (v.data === 'sport' || v.data === 'wahl'),
    },
  ],
  actions: [
    { id: 'reveal', label: L('Täuschung aufdecken', 'Reveal the trick'), primary: true, visibleIf: (v) => v.mode === 'trick' },
    { id: 'next', label: L('Nächster Fall', 'Next case'), primary: true, visibleIf: (v) => v.mode === 'detect' },
    { id: 'solve', label: L('Auflösen', 'Show solution'), visibleIf: (v) => v.mode === 'detect' },
    { id: 'replay', label: L('Neu aufbauen', 'Build again'), visibleIf: (v) => v.mode === 'read' },
  ],
  readouts: [
    { key: 'tbl', label: L('Daten', 'Data'), spoiler: true },
    { key: 'sum', label: L('Summe bzw. Mittelwert', 'Total or mean'), spoiler: true },
    { key: 'sel', label: L('Abgelesen', 'Read off'), spoiler: true },
    { key: 'trick', label: L('Wirkung der Täuschung', 'Effect of the trick'), spoiler: true },
  ],
  resultsParam: 'lab',
  presets: [
    { id: 'start', label: L('Säulen: Lieblingssport', 'Columns: favourite sport'), values: {} },
    { id: 'pie', label: L('Kreis: 6 von 24 sind 90°', 'Pie: 6 of 24 is 90°'), values: { chart: 'pie' } },
    { id: 'line', label: L('Linie: Temperaturen', 'Line: temperatures'), values: { data: 'temp', chart: 'line' } },
    { id: 'cut', label: L('Abgeschnittene Achse', 'Truncated axis'), values: { mode: 'trick', trick: 'cut', data: 'wahl', cut: 90 } },
    { id: 'area', label: L('Doppelte Höhe, vierfache Fläche', 'Double height, four times the area'), values: { mode: 'trick', trick: 'area' } },
    { id: 'detect', label: L('Detektiv: sechs Fälle', 'Detective: six cases'), values: { mode: 'detect', fall: 1 } },
  ],
  strings: {
    de: { canvas: 'Diagramm eines kleinen Datensatzes, das sich zwischen Strichliste, Säulen-, Balken-, Linien-, Streifen- und Kreisdiagramm und Piktogramm verwandelt, daneben Erklärungen' },
    en: { canvas: 'Chart of a small data set that morphs between tally chart, column, bar, line, strip and pie chart and pictogram, with explanations beside it' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const P = p as unknown as Record<string, number>;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const G = (v: number) => new Glide(v, reduced);

    /* ---------------- Wirksamer Zustand ---------------- */
    interface Cfg {
      data: DataId;
      values: number[];
      chart: Chart;
      trick: Trick | null;
      honest: boolean;
      cut: number;
      lab: boolean;
      sort: boolean;
    }

    function trickChart(trick: Trick, chart: Chart, data: DataId): Chart {
      if (trick === 'area') return 'pict';
      if (trick === 'sum') return 'pie';
      if (chart === 'bar' || chart === 'line') return chart;
      return trick === 'unit' && DATASETS[data].timeline ? 'line' : 'col';
    }

    function cfg(): Cfg {
      const mode = p.mode as Mode;
      if (mode === 'detect') {
        const c = CASES[clamp(p.fall - 1, 0, CASES.length - 1)]!;
        const values = DATASETS[c.data].defaults.slice();
        return { data: c.data, values, chart: c.chart, trick: c.trick, honest: p.honest, cut: c.cut ?? suggestCut(values), lab: c.trick === 'sum', sort: false };
      }
      const data = p.data as DataId;
      const values = DATASETS[data].keys.map((k) => P[k] ?? 0);
      if (mode === 'trick') {
        const trick = p.trick as Trick;
        return { data, values, chart: trickChart(trick, p.chart as Chart, data), trick, honest: p.honest, cut: p.cut, lab: p.lab, sort: false };
      }
      return { data, values, chart: p.chart as Chart, trick: null, honest: true, cut: 0, lab: p.lab, sort: p.sort && !DATASETS[data].timeline };
    }

    const sceneKey = () => (p.mode === 'detect' ? `case${p.fall}` : `data:${p.data}`);

    /* ---------------- Animierter Zustand ---------------- */
    let c = cfg();
    let shownKey = sceneKey();
    let shown: Cfg = c;
    let vals: Glide[] = [];
    let pos: Glide[] = [];
    let dims: Glide[] = [];
    let lifts: Glide[] = [];
    const cutG = G(0);
    const topG = G(10);
    const gapG = G(0);
    const areaG = G(0);
    const unitG = G(0);
    const sumG = G(0);
    const pieness = G(0);
    const honestG = G(1);
    /** Deckkraft der Ebenen je Diagramm. */
    const layer = {
      shape: G(1),
      vAxis: G(1),
      hAxis: G(0),
      cats: G(1),
      barCats: G(0),
      line: G(0),
      pict: G(0),
      tab: G(0),
      strip: G(0),
      pie: G(0),
      lab: G(1),
    };
    let chartNow: Chart = 'col';
    let trans: { from: Box[]; fromK: number; via: boolean; t0: number; ms: number } | null = null;
    let lineReveal = G(1);
    let introStart = performance.now() + (reduced ? -1e6 : 120);
    let outroStart = -1;
    let sel: number | null = null;
    let hoverI: number | null = null;
    let dragI: number | null = null;
    let dragMoved = false;
    let dragY0 = 0;
    let frozenAxis: { cut: number; top: number } | null = null;
    let now = performance.now();
    const tickFade = new Map<string, { v: number; g: Glide; uneven: boolean }>();
    const ripples: { x: number; y: number; t0: number; ok: boolean }[] = [];
    /** Detektiv: Rückmeldung zum aktuellen Fall. */
    let verdict: { ok: boolean; zone: Zone; at: number } | null = null;
    const solved = new Set<number>();
    let revealTimer: ReturnType<typeof setTimeout> | null = null;
    let panelKey = '';
    let panelPrev: Block[] = [];
    let panelSwitch = -1e9;
    let zones: { id: Zone; r: Rect }[] = [];

    const n = () => shown.values.length;
    const tx = () => TEXTS[shown.data];
    const ds = () => DATASETS[shown.data];

    function resetItems(cf: Cfg): void {
      const k = cf.values.length;
      vals = cf.values.map(() => G(0));
      cf.values.forEach((v, i) => vals[i]!.snap(v));
      const rk = cf.sort ? ranks(cf.values) : cf.values.map((_, i) => i);
      pos = rk.map((r) => G(r));
      dims = Array.from({ length: k }, () => G(1));
      lifts = Array.from({ length: k }, () => G(0));
      sel = null;
      hoverI = null;
    }

    /** Ziel der Achse (Beginn, Ende, Schritt) für die aktuellen Werte. */
    function axisTarget(cf: Cfg): { cut: number; top: number; step: number } {
      const max = Math.max(...cf.values, 1);
      const cut = cf.trick === 'cut' && !cf.honest ? effectiveCut(cf.values, cf.cut) : 0;
      const a = valueAxis(max, cut);
      // etwas Luft über der höchsten Säule für die Beschriftung
      let top = a.top;
      if ((top - max) / (top - cut) < 0.07) top += a.step;
      return { cut, top, step: a.step };
    }

    function layersFor(cf: Cfg): Record<keyof typeof layer, number> {
      const ch = cf.chart;
      return {
        shape: ch === 'pict' ? 0 : 1,
        vAxis: ch === 'col' || ch === 'line' ? 1 : 0,
        hAxis: ch === 'bar' ? 1 : 0,
        cats: ch === 'col' || ch === 'line' || ch === 'pict' ? 1 : 0,
        barCats: ch === 'bar' ? 1 : 0,
        line: ch === 'line' ? 1 : 0,
        pict: ch === 'pict' ? 1 : 0,
        tab: ch === 'tab' ? 1 : 0,
        strip: ch === 'strip' ? 1 : 0,
        pie: ch === 'pie' ? 1 : 0,
        lab: cf.lab ? 1 : 0,
      };
    }

    /** Alle Ziele aus dem Zustand `shown` setzen (weich). */
    function retarget(ms = 650, snap = false): void {
      const cf = shown;
      const fastDrag = dragI !== null && dragMoved;
      cf.values.forEach((v, i) => {
        const g = vals[i]!;
        if (snap) g.snap(v);
        else g.go(v, fastDrag ? 110 : ms, fastDrag ? ease.outCubic : ease.inOutCubic);
      });
      const rk = cf.sort ? ranks(cf.values) : cf.values.map((_, i) => i);
      rk.forEach((r, i) => (snap ? pos[i]!.snap(r) : pos[i]!.go(r, 750, ease.inOutCubic, i * 40)));
      const ax = frozenAxis ?? axisTarget(cf);
      const deceive = !cf.honest && cf.trick !== null;
      const set = (g: Glide, v: number, d = 900) => (snap ? g.snap(v) : g.go(v, d));
      set(cutG, ax.cut, 1100);
      set(topG, ax.top, fastDrag ? 0 : 900);
      set(gapG, deceive && cf.trick === 'gap' ? 1 : 0, 1100);
      set(areaG, deceive && cf.trick === 'area' ? 1 : 0, 1000);
      set(unitG, deceive && cf.trick === 'unit' ? 1 : 0, 700);
      set(sumG, deceive && cf.trick === 'sum' ? 1 : 0, 1100);
      set(honestG, deceive ? 0 : 1, 600);
      set(pieness, cf.chart === 'pie' || cf.chart === 'strip' ? 1 : 0, 900);
      const L0 = layersFor(cf);
      (Object.keys(layer) as (keyof typeof layer)[]).forEach((k) => {
        const on = L0[k];
        if (snap) layer[k].snap(on);
        else layer[k].go(on, on ? 480 : 320, ease.inOutCubic, on && k !== 'shape' && k !== 'lab' ? 260 : 0);
      });
      dims.forEach((g, i) => g.go(sel === null || sel === i ? 1 : ctx.theme.dark ? 0.45 : 0.36, 320));
      lifts.forEach((g, i) => g.go(sel === i ? 1 : 0, 380, ease.outBack));
    }

    /* ---------------- Geometrie ---------------- */
    interface Geo {
      W: number;
      H: number;
      wide: boolean;
      C: Rect;
      panel: Rect;
      headH: number;
      P: Rect;
      Q: Rect;
      pie: { cx: number; cy: number; R: number };
      S: Rect;
      Tb: Rect;
    }
    let geo: Geo | null = null;

    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      let C: Rect;
      let panel: Rect;
      if (wide) {
        const pw = Math.round(clamp(W * 0.3, 210, 300));
        C = { x: 6, y: 6, w: W - pw - 20, h: H - 12 };
        panel = { x: C.x + C.w + 8, y: 6, w: pw, h: H - 12 };
      } else {
        const ch = Math.round(H * 0.58);
        C = { x: 4, y: 4, w: W - 8, h: ch };
        panel = { x: 4, y: C.y + ch + 8, w: W - 8, h: H - ch - 12 };
      }
      const small = C.w < 480;
      const headH = small ? 44 : 50;
      const top = C.y + headH;
      const left = 44;
      const Pr: Rect = { x: C.x + left, y: top + 26, w: C.w - left - 14, h: C.h - headH - 26 - 34 };
      const g = surface.g;
      g.font = `600 ${small ? 12 : 13}px ${ctx.theme.font}`;
      const catW = Math.max(...TEXTS[shown.data].cats.map((l) => g.measureText(T(l)).width));
      const lw = Math.min(catW + 22, C.w * 0.32);
      const Q: Rect = { x: C.x + lw, y: top + 8, w: C.w - lw - 30, h: C.h - headH - 8 - 50 };
      const A: Rect = { x: C.x, y: top, w: C.w, h: C.h - headH - 6 };
      const labW = small ? 64 : 96;
      const R = Math.max(30, Math.min(A.h / 2 - 22, (A.w - 2 * labW) / 2));
      const sh = clamp(A.h * 0.22, 46, 84);
      const S: Rect = { x: C.x + 16, y: A.y + A.h * 0.52 - sh / 2, w: C.w - 32, h: sh };
      const Tb: Rect = { x: C.x + 10, y: top + 4, w: C.w - 20, h: C.h - headH - 12 };
      return { W, H, wide, C, panel, headH, P: Pr, Q, pie: { cx: A.x + A.w / 2, cy: A.y + A.h / 2 + 2, R }, S, Tb };
    }

    /* ---------------- Werteachse ---------------- */
    let unevenT: number[] = [0, 1];
    /** Position eines Werts auf der Werteachse (0 = Anfang, 1 = Ende) mit allen Täuschungen. */
    function frac(v: number): number {
      const s = cutG.at(now);
      const t = topG.at(now);
      const even = t > s ? (v - s) / (t - s) : 0;
      const gp = gapG.at(now);
      return gp > 0.0005 ? lerp(even, unevenFraction(v, unevenT), gp) : even;
    }
    /** Umkehrung von `frac` (für das Ziehen), numerisch. */
    function valueAt(f: number): number {
      let lo = ds().min;
      let hi = ds().max;
      for (let i = 0; i < 40; i++) {
        const m = (lo + hi) / 2;
        if (frac(m) < f) lo = m;
        else hi = m;
      }
      return (lo + hi) / 2;
    }

    /* ---------------- Anzeigewerte ---------------- */
    function introOf(i: number): number {
      if (reduced) return 1;
      return ease.outCubic(clamp((now - introStart - i * 75) / 720, 0, 1));
    }
    function outroOf(): number {
      if (outroStart < 0) return 1;
      return 1 - ease.inCubic(clamp((now - outroStart) / 300, 0, 1));
    }
    /** Angezeigte Werte (mit Einstieg/Ausstieg). */
    function displayValues(): number[] {
      const o = outroOf();
      return vals.map((g, i) => g.at(now) * introOf(i) * o);
    }
    const fullValues = () => vals.map((g) => g.at(now));

    /* ---------------- Ziele der Formen ---------------- */
    function itemColor(i: number): string {
      const theme = ctx.theme;
      const k = n();
      if (ds().timeline) {
        const base = theme.series[0]!;
        const pie = shade(base, 0.42 - (0.72 * i) / Math.max(1, k - 1));
        return mixColor(base, pie, pieness.at(now));
      }
      return theme.series[i % theme.series.length]!;
    }

    function slotPos(i: number): number {
      return pos[i] ? pos[i]!.at(now) : i;
    }

    function targetBoxes(chart: Chart, d: number[]): Box[] {
      const g0 = geo!;
      const k = d.length;
      const wide = !(g0.C.w < 480);
      switch (chart) {
        case 'col':
        case 'pict':
        case 'line': {
          const Pr = g0.P;
          const slot = Pr.w / k;
          const bw = Math.min(slot * 0.62, wide ? 66 : 44);
          const base = Pr.y + Pr.h;
          return d.map((v, i) => {
            const cx = Pr.x + slot * (slotPos(i) + 0.5);
            const y = Math.min(base, Pr.y + Pr.h * (1 - frac(v)));
            if (chart === 'line') {
              const s = wide ? 13 : 11;
              return { x: cx - s / 2, y: y - s / 2, w: s, h: s, r: [s, s, s, s] };
            }
            const r = Math.min(7, bw * 0.2);
            return { x: cx - bw / 2, y, w: bw, h: base - y, r: [r, r, 0, 0] };
          });
        }
        case 'bar': {
          const Q = g0.Q;
          const slot = Q.h / k;
          const bh = Math.min(slot * 0.62, wide ? 42 : 30);
          return d.map((v, i) => {
            const cy = Q.y + slot * (slotPos(i) + 0.5);
            const w = Math.max(0, Q.w * frac(v));
            const r = Math.min(7, bh * 0.22);
            return { x: Q.x, y: cy - bh / 2, w, h: bh, r: [0, r, r, 0] };
          });
        }
        case 'tab': {
          const rows = rowGeo(k);
          return d.map((_, i) => {
            const y = rows.y0 + rows.h * (slotPos(i) + 0.5);
            const s = 14;
            return { x: g0.Tb.x + 8, y: y - s / 2, w: s, h: s, r: [4, 4, 4, 4] };
          });
        }
        default: {
          // Streifen (auch Ausgangsform des Kreises): Breite ∝ Anteil
          const S = g0.S;
          const tot = total(fullValues()) || 1;
          const ws = d.map((v) => (S.w * v) / tot);
          return d.map((_, i) => {
            let x = S.x;
            for (let j = 0; j < k; j++) if (j !== i) x += ws[j]! * clamp(slotPos(i) - slotPos(j), 0, 1);
            return { x, y: S.y, w: ws[i]!, h: S.h, r: [0, 0, 0, 0] };
          });
        }
      }
    }

    function rowGeo(k: number): { y0: number; h: number; head: number } {
      const Tb = geo!.Tb;
      const head = 30;
      const h = Math.min(geo!.wide ? 44 : 36, (Tb.h - head - 34) / k);
      return { y0: Tb.y + head, h, head };
    }

    function easeItem(u: number, i: number, k: number, ms: number): number {
      const st = Math.min(60, (ms * 0.35) / Math.max(1, k - 1));
      const span = ms - st * (k - 1);
      return ease.inOutCubic(clamp((u * ms - i * st) / span, 0, 1));
    }

    /** Aktuelle Formen und Biegung (mit laufender Verwandlung). */
    function pose(d: number[]): { boxes: Box[]; k: number } {
      const tgt = targetBoxes(chartNow, d);
      const kT = chartNow === 'pie' ? 1 : 0;
      if (!trans || trans.from.length !== d.length) return { boxes: tgt, k: kT };
      const u = clamp((now - trans.t0) / trans.ms, 0, 1);
      const k = d.length;
      if (!trans.via) {
        return { boxes: tgt.map((b, i) => mixBox(trans!.from[i]!, b, easeItem(u, i, k, trans!.ms))), k: lerp(trans.fromK, kT, ease.inOutCubic(u)) };
      }
      const strip = targetBoxes('strip', d);
      const half = trans.ms / 2;
      if (u < 0.5) {
        const uu = u / 0.5;
        return { boxes: strip.map((b, i) => mixBox(trans!.from[i]!, b, easeItem(uu, i, k, half))), k: lerp(trans.fromK, 0, ease.inOutCubic(uu)) };
      }
      const uu = (u - 0.5) / 0.5;
      return { boxes: tgt.map((b, i) => mixBox(strip[i]!, b, easeItem(uu, i, k, half))), k: lerp(0, kT, ease.inOutCubic(uu)) };
    }

    function startChart(next: Chart): void {
      if (next === chartNow) return;
      if (!geo || reduced) {
        chartNow = next;
        trans = null;
        return;
      }
      const cur = pose(displayValues());
      const fromPie = cur.k > 0.01;
      const via = (next === 'pie' && chartNow !== 'strip' && !fromPie) || (fromPie && next !== 'pie' && next !== 'strip');
      trans = { from: cur.boxes, fromK: cur.k, via, t0: now, ms: via ? 1500 : 850 };
      if (next === 'line') lineReveal = G(0);
      chartNow = next;
      if (next === 'line') lineReveal.go(1, 900, ease.inOutCubic, trans.ms * 0.45);
    }

    /* ---------------- Biegen: Streifen → Kreis ---------------- */
    function bendMap(x: number, y: number, k: number): [number, number] {
      if (k < 0.002) return [x, y];
      const S = geo!.S;
      const pie = geo!.pie;
      const Lf = S.w;
      const C0 = TAU * pie.R;
      // Streifen kürzer als der Kreisumfang: erst biegen, dann mit festem Radius schließen (bleibt im Bild)
      const Leff = Lf > C0 ? lerp(Lf, C0, k) : Math.max(Lf, C0 * k);
      const Rout = Leff / (TAU * k);
      const lam = lerp(1, pie.R / S.h, k);
      const s = ((x - S.x) * Leff) / Lf;
      const dd = y - S.y;
      const r = Math.max(0, Rout - dd * lam);
      const topY = lerp(S.y, pie.cy - pie.R, k);
      const cx = lerp(S.x + S.w / 2, pie.cx, k);
      const cy = topY + Rout;
      const phi = (s - Leff / 2) / Rout + Math.PI * k * k * k;
      return [cx + r * Math.sin(phi), cy - r * Math.cos(phi)];
    }

    function shapePath(b: Box, k: number, dx = 0, dy = 0): void {
      const g = surface.g;
      if (k < 0.002) {
        boxPath(g, b, dx, dy);
        return;
      }
      const steps = clamp(Math.ceil(Math.abs(b.w) / 4) + 1, 2, 120);
      g.beginPath();
      for (let j = 0; j <= steps; j++) {
        const [x, y] = bendMap(b.x + (b.w * j) / steps, b.y, k);
        if (j === 0) g.moveTo(x + dx, y + dy);
        else g.lineTo(x + dx, y + dy);
      }
      for (let j = steps; j >= 0; j--) {
        const [x, y] = bendMap(b.x + (b.w * j) / steps, b.y + b.h, k);
        g.lineTo(x + dx, y + dy);
      }
      g.closePath();
    }

    /* ---------------- Texthelfer ---------------- */
    function fitText(values: string[], maxW: number, size: number, weight = 600, min = 10.5): { value: string; font: string } {
      const g = surface.g;
      for (const value of values) {
        for (let s = size; s >= min; s -= 0.5) {
          const font = `${weight} ${s}px ${ctx.theme.font}`;
          g.font = font;
          if (g.measureText(value).width <= maxW) return { value, font };
        }
      }
      return { value: values[values.length - 1]!, font: `${weight} ${min}px ${ctx.theme.font}` };
    }
    function wrap(value: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const rows: string[] = [];
      let cur = '';
      for (const w of value.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function halo(value: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = alpha(cardBg(), 0.9);
      g.strokeText(value, x, y);
      g.fillStyle = color;
      g.fillText(value, x, y);
      g.restore();
    }
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');

    /** Zahl mit Dezimalkomma, passend zur Schrittweite gerundet. */
    const numText = (v: number, dec = 0) => fmt.num(v, dec);
    const valueDec = () => (ds().step < 1 ? 1 : 0);
    function valueText(v: number, rounded = true): string {
      const x = rounded ? Number(v.toFixed(valueDec())) : v;
      const t = tx();
      if (t.sym) return `${numText(x, valueDec())} ${t.sym}`;
      return `${numText(x, valueDec())} ${Math.abs(x - 1) < 1e-9 ? T(t.one) : T(t.many)}`;
    }
    const pctText = (v: number, dec = 1) => `${fmt.num(v, dec)} %`;

    /* ---------------- Zeichnen: Karten ---------------- */
    function card(r: Rect, radius = 16): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 20;
      g.shadowOffsetY = 5;
      roundRect(g, r.x, r.y, r.w, r.h, radius);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }

    /* ---------------- Zeichnen: Kopfzeile ---------------- */
    function drawHeader(A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const C = geo!.C;
      const small = C.w < 480;
      const uh = unitG.at(now);
      const titleFull = T(tx().title);
      const vague = ds().timeline ? tt('Unsere Woche', 'Our week') : tt('Umfrage', 'Survey');
      const legendW = layer.pict.at(now) > 0.01 ? (small ? 96 : 120) : 0;
      const maxW = C.w - 28 - legendW;
      g.save();
      g.globalAlpha = A;
      const x = C.x + 16;
      const y = C.y + (small ? 18 : 21);
      if (uh < 0.999) {
        g.globalAlpha = A * (1 - uh);
        const f = fitText([titleFull], maxW, small ? 14.5 : 16.5, 750, 11);
        text(g, f.value, x, y, { font: f.font, color: theme.text, align: 'left' });
      }
      if (uh > 0.001) {
        g.globalAlpha = A * uh;
        text(g, vague, x, y, { font: `750 ${small ? 14.5 : 16.5}px ${theme.font}`, color: theme.text, align: 'left' });
      }
      g.globalAlpha = A;
      // Untertitel: Diagrammart (weich überblendet)
      const sub = T(CHART_NAMES[chartNow]);
      text(g, sub, x, y + (small ? 17 : 19), { font: `600 ${small ? 11.5 : 12.5}px ${theme.font}`, color: theme.muted, align: 'left' });
      g.restore();
      zones.push({ id: 'title', r: { x: C.x, y: C.y, w: C.w - legendW, h: geo!.headH } });
      // Hinweis, wenn die Darstellung nicht passt
      const warn = unsuitable(shown, chartNow);
      if (warn && p.mode === 'read') {
        g.save();
        g.globalAlpha = A * warnA.at(now);
        g.font = `700 ${small ? 11 : 12}px ${theme.font}`;
        const label = tt('passt nicht', 'not suitable');
        const w = g.measureText(label).width + 26;
        const bx = C.x + C.w - 12 - w;
        const by = y - 11;
        roundRect(g, bx, by, w, 22, 11);
        g.fillStyle = alpha(theme.series[3]!, theme.dark ? 0.22 : 0.14);
        g.fill();
        text(g, '!', bx + 10, by + 11.5, { font: `800 12px ${theme.font}`, color: theme.series[3]! });
        text(g, label, bx + 18, by + 11.5, { font: `700 ${small ? 11 : 12}px ${theme.font}`, color: theme.series[3]!, align: 'left' });
        g.restore();
      }
    }
    const warnA = G(0);

    function unsuitable(cf: Cfg, chart: Chart): 'parts' | 'line' | null {
      if (!DATASETS[cf.data].whole && (chart === 'pie' || chart === 'strip')) return 'parts';
      if (!DATASETS[cf.data].timeline && chart === 'line') return 'line';
      return null;
    }

    /* ---------------- Zeichnen: Achsen ---------------- */
    function syncTicks(): void {
      const ax = frozenAxis ? { ...axisTarget(shown), cut: frozenAxis.cut, top: frozenAxis.top } : axisTarget(shown);
      const step = valueAxis(Math.max(...shown.values, 1), ax.cut).step;
      const want = new Map<string, { v: number; uneven: boolean }>();
      const first = Math.ceil(ax.cut / step - 1e-9);
      for (let j = first; j * step <= ax.top + 1e-9; j++) {
        const v = Number((j * step).toPrecision(12));
        want.set(`e${v}`, { v, uneven: false });
      }
      if (ax.cut > 0) want.set(`e${ax.cut}`, { v: ax.cut, uneven: false });
      unevenT = unevenTicks(Math.max(...shown.values, 1));
      if (gapG.target > 0.5) unevenT.forEach((v) => want.set(`u${v}`, { v, uneven: true }));
      want.forEach((w, key) => {
        if (!tickFade.has(key)) {
          const g = G(0);
          g.go(1, 450, ease.inOutCubic, 120);
          tickFade.set(key, { v: w.v, g, uneven: w.uneven });
        } else if (tickFade.get(key)!.g.target < 1) tickFade.get(key)!.g.go(1, 400);
      });
      tickFade.forEach((t, key) => {
        if (!want.has(key) && t.g.target > 0) t.g.go(0, 320);
      });
    }

    function drawValueAxis(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const av = layer.vAxis.at(now);
      const ah = layer.hAxis.at(now);
      const gp = gapG.at(now);
      const small = geo!.C.w < 480;
      const font = `600 ${small ? 11 : 12}px ${theme.font}`;
      const unitA = 1 - unitG.at(now);
      const axisTitle = T(tx().axis);
      for (const [vert, A] of [
        [true, av],
        [false, ah],
      ] as const) {
        if (A <= 0.003) continue;
        const R = vert ? geo!.P : geo!.Q;
        g.save();
        g.globalAlpha = A;
        // Gitter und Zahlen
        tickFade.forEach((t, key) => {
          const ta = t.g.at(now) * (t.uneven ? gp : 1 - gp);
          if (ta <= 0.003) {
            if (t.g.target === 0 && !t.g.busy(now)) tickFade.delete(key);
            return;
          }
          const f = frac(t.v);
          if (f < -0.02 || f > 1.04) return;
          g.save();
          g.globalAlpha = A * ta;
          g.strokeStyle = alpha(theme.text, theme.dark ? 0.1 : 0.075);
          g.lineWidth = 1;
          g.beginPath();
          if (vert) {
            const y = Math.round(R.y + R.h * (1 - f)) + 0.5;
            g.moveTo(R.x, y);
            g.lineTo(R.x + R.w, y);
            g.stroke();
            text(g, numText(t.v), R.x - 8, y, { font, color: t.uneven ? mixColor(theme.muted, theme.series[1]!, 0.35) : theme.muted, align: 'right' });
          } else {
            const x = Math.round(R.x + R.w * f) + 0.5;
            g.moveTo(x, R.y);
            g.lineTo(x, R.y + R.h);
            g.stroke();
            text(g, numText(t.v), x, R.y + R.h + 14, { font, color: theme.muted });
          }
          g.restore();
        });
        // Achsenlinien
        g.strokeStyle = theme.axis;
        g.lineWidth = 1.4;
        g.lineCap = 'round';
        g.beginPath();
        if (vert) {
          g.moveTo(R.x + 0.5, R.y - 8);
          g.lineTo(R.x + 0.5, R.y + R.h);
          g.lineTo(R.x + R.w, R.y + R.h);
        } else {
          g.moveTo(R.x + 0.5, R.y);
          g.lineTo(R.x + 0.5, R.y + R.h);
          g.lineTo(R.x + R.w + 8, R.y + R.h);
        }
        g.stroke();
        // Pfeilspitze an der Werteachse
        g.fillStyle = theme.axis;
        g.beginPath();
        if (vert) {
          g.moveTo(R.x + 0.5, R.y - 14);
          g.lineTo(R.x - 3.5, R.y - 6);
          g.lineTo(R.x + 4.5, R.y - 6);
        } else {
          g.moveTo(R.x + R.w + 14, R.y + R.h);
          g.lineTo(R.x + R.w + 6, R.y + R.h - 4);
          g.lineTo(R.x + R.w + 6, R.y + R.h + 4);
        }
        g.fill();
        // Achsentitel mit Einheit
        if (unitA > 0.003) {
          g.globalAlpha = A * unitA;
          if (vert) text(g, axisTitle, R.x + 10, R.y - 16, { font: `700 ${small ? 11.5 : 12.5}px ${theme.font}`, color: theme.text, align: 'left' });
          else text(g, axisTitle, R.x + R.w + 8, R.y + R.h + 32, { font: `700 ${small ? 11.5 : 12.5}px ${theme.font}`, color: theme.text, align: 'right' });
        }
        g.restore();
        if (A > 0.5) {
          if (vert) {
            zones.push({ id: 'unit', r: { x: R.x - 6, y: R.y - 30, w: Math.min(200, R.w), h: 24 } });
            zones.push({ id: 'axis', r: { x: geo!.C.x, y: R.y - 14, w: R.x - geo!.C.x + 10, h: R.h + 24 } });
          } else {
            zones.push({ id: 'unit', r: { x: R.x + R.w - 190, y: R.y + R.h + 22, w: 200, h: 22 } });
            zones.push({ id: 'axis', r: { x: R.x - 8, y: R.y + R.h - 6, w: R.w + 24, h: 26 } });
          }
        }
      }
    }

    /** Beim Abschneiden: der weggeklappte Teil (0 bis Achsenbeginn) klappt unter der Grundlinie weg. */
    function drawFold(boxes: Box[]): void {
      const target = cutG.target;
      const cur = cutG.at(now);
      const maxCut = Math.max(target, cur, 1e-9);
      if (!cutG.busy(now) || maxCut <= 0.5) return;
      const u = clamp(cur / maxCut, 0, 1);
      const f = 4 * u * (1 - u);
      if (f < 0.02) return;
      const g = surface.g;
      const theme = ctx.theme;
      const vert = layer.vAxis.at(now) > 0.5;
      if (!vert || chartNow !== 'col') return;
      const R = geo!.P;
      const base = R.y + R.h;
      const depth = 30 * f;
      boxes.forEach((b, i) => {
        g.save();
        g.globalAlpha = 0.55 * f * dims[i]!.at(now);
        const col = itemColor(i);
        g.beginPath();
        const inset = b.w * 0.18 * u;
        g.moveTo(b.x, base);
        g.lineTo(b.x + b.w, base);
        g.lineTo(b.x + b.w - inset, base + depth);
        g.lineTo(b.x + inset, base + depth);
        g.closePath();
        const gr = g.createLinearGradient(0, base, 0, base + depth);
        gr.addColorStop(0, shade(col, -0.25));
        gr.addColorStop(1, shade(col, -0.25, 0));
        g.fillStyle = gr;
        g.fill();
        g.restore();
      });
      g.save();
      g.globalAlpha = f;
      text(g, `0 … ${numText(target || cur)}`, R.x - 8, base + depth * 0.6, { font: `700 11px ${theme.font}`, color: theme.series[1]!, align: 'right' });
      g.restore();
    }

    /* ---------------- Zeichnen: Formen ---------------- */
    function drawShapes(boxes: Box[], k: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      if (A <= 0.003) return;
      const pie = geo!.pie;
      const offs = boxes.map((b, i) => {
        const l = lifts[i]!.at(now);
        if (l === 0) return [0, 0] as [number, number];
        if (k > 0.5) {
          const [mx, my] = bendMap(b.x + b.w / 2, b.y, k);
          const dx = mx - pie.cx;
          const dy = my - pie.cy;
          const d = Math.hypot(dx, dy) || 1;
          return [(dx / d) * 10 * l * k, (dy / d) * 10 * l * k] as [number, number];
        }
        if (chartNow === 'strip') return [0, -6 * l] as [number, number];
        return [0, 0] as [number, number];
      });
      // 1. Schatten (alle Formen gemeinsam, damit Nachbarn nicht verschattet werden)
      g.save();
      g.globalAlpha = A * (k > 0.5 ? 0.9 : 0.7);
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = k > 0.5 ? 18 : 10;
      g.shadowOffsetY = k > 0.5 ? 6 : 3;
      g.fillStyle = theme.dark ? '#0b0f16' : '#ffffff';
      boxes.forEach((b, i) => {
        if (b.w < 0.3 || b.h < 0.3) return;
        shapePath(b, k, offs[i]![0], offs[i]![1]);
        g.fill();
      });
      g.restore();
      // 2. Flächen mit Licht von oben links
      boxes.forEach((b, i) => {
        if (b.w < 0.3 || b.h < 0.3) return;
        const col = itemColor(i);
        const [dx, dy] = offs[i]!;
        g.save();
        g.globalAlpha = A * dims[i]!.at(now);
        shapePath(b, k, dx, dy);
        let grad: CanvasGradient;
        if (k > 0.5) {
          grad = g.createRadialGradient(pie.cx - pie.R * 0.3 + dx, pie.cy - pie.R * 0.35 + dy, pie.R * 0.05, pie.cx + dx, pie.cy + dy, pie.R * 1.05);
          grad.addColorStop(0, shade(col, 0.2));
          grad.addColorStop(1, shade(col, -0.1));
        } else if (chartNow === 'bar') {
          grad = g.createLinearGradient(b.x, 0, b.x + Math.max(1, b.w), 0);
          grad.addColorStop(0, shade(col, -0.06));
          grad.addColorStop(1, shade(col, 0.16));
        } else {
          grad = g.createLinearGradient(0, b.y, 0, b.y + Math.max(1, b.h));
          grad.addColorStop(0, shade(col, 0.18));
          grad.addColorStop(1, shade(col, -0.08));
        }
        g.fillStyle = grad;
        g.fill();
        // Trennkanten im Kreis und Streifen
        const pz = pieness.at(now);
        if (pz > 0.01) {
          g.globalAlpha = A * pz;
          g.strokeStyle = cardBg();
          g.lineWidth = 1.6;
          g.lineJoin = 'round';
          g.stroke();
        }
        // Glanzkante oben
        if (k < 0.5 && b.h > 6 && chartNow !== 'line') {
          g.globalAlpha = A * dims[i]!.at(now) * 0.35 * (1 - k * 2);
          g.strokeStyle = '#ffffff';
          g.lineWidth = 1;
          g.beginPath();
          const r0 = Math.min(b.r[0], b.w / 2);
          g.moveTo(b.x + r0 + dx, b.y + 1 + dy);
          g.lineTo(b.x + b.w - Math.min(b.r[1], b.w / 2) + dx, b.y + 1 + dy);
          g.stroke();
        }
        // Hervorhebung beim Überfahren
        if (hoverI === i && p.mode !== 'detect') {
          g.globalAlpha = A * 0.9;
          g.strokeStyle = shade(col, theme.dark ? 0.35 : -0.25);
          g.lineWidth = 2;
          shapePath(b, k, dx, dy);
          g.stroke();
        }
        g.restore();
      });
      if (A > 0.5) {
        boxes.forEach((b) => {
          const pad = 4;
          if (k < 0.5) zones.push({ id: 'marks', r: { x: b.x - pad, y: b.y - pad, w: b.w + pad * 2, h: b.h + pad * 2 } });
        });
        if (k > 0.5) zones.push({ id: 'marks', r: { x: pie.cx - pie.R * 0.75, y: pie.cy - pie.R * 0.75, w: pie.R * 1.5, h: pie.R * 1.5 } });
      }
    }

    /* ---------------- Zeichnen: Linie ---------------- */
    function drawLine(boxes: Box[]): void {
      const A = layer.line.at(now);
      if (A <= 0.003) return;
      const g = surface.g;
      const theme = ctx.theme;
      const R = geo!.P;
      const pts = boxes.map((b) => [b.x + b.w / 2, b.y + b.h / 2] as [number, number]).sort((a, b) => a[0] - b[0]);
      if (pts.length < 2) return;
      const rev = lineReveal.at(now);
      const col = theme.series[0]!;
      g.save();
      g.globalAlpha = A;
      g.beginPath();
      g.rect(R.x, R.y - 20, R.w * rev + 2, R.h + 22);
      g.clip();
      // Fläche unter der Linie
      const grad = g.createLinearGradient(0, R.y, 0, R.y + R.h);
      grad.addColorStop(0, alpha(col, theme.dark ? 0.28 : 0.18));
      grad.addColorStop(1, alpha(col, 0));
      g.beginPath();
      g.moveTo(pts[0]![0], R.y + R.h);
      pts.forEach(([x, y]) => g.lineTo(x, y));
      g.lineTo(pts[pts.length - 1]![0], R.y + R.h);
      g.closePath();
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = alpha(col, 0.45);
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.strokeStyle = col;
      g.lineWidth = 3;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.restore();
    }

    /* ---------------- Zeichnen: Piktogramm ---------------- */
    function drawPict(d: number[]): void {
      const A = layer.pict.at(now);
      if (A <= 0.003) return;
      const g = surface.g;
      const theme = ctx.theme;
      const R = geo!.P;
      const k = d.length;
      const slot = R.w / k;
      const base = R.y + R.h;
      const unit = ds().pictUnit;
      const ar = areaG.at(now);
      const maxCount = Math.max(...shown.values.map((v) => iconCount(v, unit)), 1);
      const isz = Math.min(slot * 0.72, (R.h - 6) / Math.ceil(maxCount), 40);
      const icon = tx().icon;
      // Grundlinie
      g.save();
      g.globalAlpha = A;
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(R.x - 4, base + 0.5);
      g.lineTo(R.x + R.w, base + 0.5);
      g.stroke();
      g.restore();
      // a) ehrlich: gleich große Bildchen übereinander (angeschnitten, wenn nicht voll)
      if (ar < 0.999) {
        d.forEach((v, i) => {
          const cx = R.x + slot * (slotPos(i) + 0.5);
          const cnt = iconCount(v, unit);
          const full = Math.floor(cnt + 1e-9);
          const step = isz * 1.0;
          for (let j = 0; j < Math.ceil(cnt - 1e-9); j++) {
            const part = j < full ? 1 : cnt - full;
            const cy = base - step * (j + 0.5);
            g.save();
            g.globalAlpha = A * (1 - ar) * dims[i]!.at(now);
            g.beginPath();
            g.rect(cx - isz, cy + isz / 2 - isz * part, isz * 2, isz * part + 1);
            g.clip();
            g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.18)';
            g.shadowBlur = 4;
            g.shadowOffsetY = 1.5;
            drawPictIcon(g, icon, itemColor(i), cx, cy, isz * 0.94, theme.dark);
            g.restore();
          }
          if (A > 0.5 && ar < 0.5) zones.push({ id: 'marks', r: { x: cx - isz / 2, y: base - step * cnt - 4, w: isz, h: step * cnt + 4 } });
        });
        // Legende: 1 Bildchen = …
        const C = geo!.C;
        const small = C.w < 480;
        g.save();
        g.globalAlpha = A * (1 - ar);
        const lx = C.x + C.w - 16;
        const ly = C.y + (small ? 22 : 25);
        const ltext = `= ${valueText(unit)}`;
        const lf = `700 ${small ? 11.5 : 12.5}px ${theme.font}`;
        g.font = lf;
        const lw = g.measureText(ltext).width;
        drawPictIcon(g, icon, itemColor(0), lx - lw - 14, ly, 22, theme.dark);
        text(g, ltext, lx, ly, { font: lf, color: theme.text, align: 'right' });
        g.restore();
      }
      // b) Täuschung: ein Bildchen je Wert, in Höhe UND Breite vergrößert
      if (ar > 0.001) {
        const vmax = Math.max(...shown.values, 1);
        const big = Math.min(R.h * 0.98, slot * 1.55);
        d.forEach((v, i) => {
          const cx = R.x + slot * (slotPos(i) + 0.5);
          const s = (big * Math.max(0, v)) / vmax;
          if (s < 1) return;
          g.save();
          g.globalAlpha = A * ar * dims[i]!.at(now);
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
          g.shadowBlur = 12;
          g.shadowOffsetY = 4;
          const sc = lerp(isz / s, 1, ease.inOutCubic(ar));
          drawPictIcon(g, icon, itemColor(i), cx, base - (s * sc) / 2, s * sc, theme.dark);
          g.restore();
          if (A > 0.5 && ar > 0.5) zones.push({ id: 'marks', r: { x: cx - s / 2, y: base - s, w: s, h: s } });
        });
      }
    }

    /* ---------------- Zeichnen: Beschriftungen ---------------- */
    function drawLabels(boxes: Box[], d: number[], k: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = geo!.C.w < 480;
      const cats = tx().cats.map((l) => T(l));
      const kk = d.length;
      const tot = total(fullValues()) || 1;
      const sh = sumG.at(now);
      const wrongB = wrongBase(total(shown.values));
      const pcts = d.map((v, i) => lerp(percent(v, tot), percentsOf([fullValues()[i]!], wrongB)[0]! * (introOf(i) * outroOf()), sh));
      const labA = layer.lab.at(now);
      // a) Kategorien unter Säulen / Punkten / Bildchen
      const ca = layer.cats.at(now);
      if (ca > 0.003) {
        const R = geo!.P;
        const slot = R.w / kk;
        boxes.forEach((b, i) => {
          const cx = chartNow === 'pict' ? R.x + slot * (slotPos(i) + 0.5) : b.x + b.w / 2;
          const f = fitText([cats[i]!], slot - 4, small ? 11.5 : 12.5, 650, 10);
          g.save();
          g.globalAlpha = ca * (0.55 + 0.45 * dims[i]!.at(now));
          text(g, f.value, cx, R.y + R.h + 16, { font: f.font, color: sel === i ? theme.text : theme.muted });
          g.restore();
          if (ca > 0.5) zones.push({ id: 'cats', r: { x: cx - slot / 2, y: R.y + R.h + 4, w: slot, h: 24 } });
        });
      }
      // b) Kategorien links neben Balken
      const ba = layer.barCats.at(now);
      if (ba > 0.003) {
        const Q = geo!.Q;
        boxes.forEach((b, i) => {
          g.save();
          g.globalAlpha = ba * (0.55 + 0.45 * dims[i]!.at(now));
          text(g, cats[i]!, Q.x - 10, b.y + b.h / 2, { font: `650 ${small ? 12 : 13}px ${theme.font}`, color: sel === i ? theme.text : theme.muted, align: 'right' });
          g.restore();
          if (ba > 0.5) zones.push({ id: 'cats', r: { x: geo!.C.x, y: b.y - 4, w: Q.x - geo!.C.x, h: b.h + 8 } });
        });
      }
      // c) Werte an Säulen, Balken, Punkten, Bildchen
      const va = labA * Math.max(layer.vAxis.at(now), layer.hAxis.at(now), layer.pict.at(now) * (1 - areaG.at(now)));
      if (va > 0.003) {
        boxes.forEach((b, i) => {
          if (d[i]! <= 0 && introOf(i) < 1) return;
          const v = d[i]!;
          const s = numText(Number(v.toFixed(valueDec())), valueDec());
          g.save();
          g.globalAlpha = va * dims[i]!.at(now) * clamp(introOf(i) * 1.5 - 0.3, 0, 1);
          const font = `750 ${small ? 11.5 : 12.5}px ${theme.font}`;
          if (chartNow === 'bar') halo(s, b.x + b.w + 8, b.y + b.h / 2, font, theme.text, 'left');
          else if (chartNow === 'pict') {
            const R = geo!.P;
            const slot = R.w / kk;
            const cnt = iconCount(v, ds().pictUnit);
            const maxCount = Math.max(...shown.values.map((x) => iconCount(x, ds().pictUnit)), 1);
            const isz = Math.min(slot * 0.72, (R.h - 6) / Math.ceil(maxCount), 40);
            halo(s, R.x + slot * (slotPos(i) + 0.5), R.y + R.h - isz * Math.ceil(cnt - 1e-9) - 10, font, theme.text);
          } else halo(s, b.x + b.w / 2, b.y - (chartNow === 'line' ? 12 : 10), font, theme.text);
          g.restore();
          if (va > 0.5 && p.mode === 'detect') zones.push({ id: 'labels', r: { x: b.x + b.w / 2 - 16, y: b.y - 20, w: 32, h: 18 } });
        });
      }
      // d) Streifen: Name und Prozent im Stück
      const sa = layer.strip.at(now) * (1 - k);
      if (sa > 0.003) {
        boxes.forEach((b, i) => {
          g.save();
          g.globalAlpha = sa * dims[i]!.at(now);
          const cx = b.x + b.w / 2;
          const f = fitText([cats[i]!, cats[i]!.slice(0, 2)], b.w - 6, small ? 11.5 : 12.5, 700, 9.5);
          const showP = labA > 0.01;
          text(g, f.value, cx, b.y + b.h / 2 - (showP ? 8 : 0), { font: f.font, color: '#ffffff' });
          if (showP) {
            g.globalAlpha *= labA;
            const pf = fitText([pctText(pcts[i]!, 1), pctText(pcts[i]!, 0), `${Math.round(pcts[i]!)}`], b.w - 4, small ? 11 : 12, 600, 9);
            text(g, pf.value, cx, b.y + b.h / 2 + 9, { font: pf.font, color: 'rgba(255,255,255,0.92)' });
          }
          g.restore();
        });
        // Klammer „100 %“
        const S = geo!.S;
        g.save();
        g.globalAlpha = sa;
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.3;
        g.beginPath();
        const yb = S.y - 14;
        g.moveTo(S.x, yb + 6);
        g.lineTo(S.x, yb);
        g.lineTo(S.x + S.w, yb);
        g.lineTo(S.x + S.w, yb + 6);
        g.stroke();
        // Prozentskala unter dem Streifen
        const yS = S.y + S.h + 8;
        g.strokeStyle = alpha(theme.text, 0.35);
        g.lineWidth = 1;
        for (let q = 0; q <= 20; q++) {
          const x = Math.round(S.x + (S.w * q) / 20) + 0.5;
          const len = q % 5 === 0 ? 7 : q % 2 === 0 ? 4.5 : 3;
          g.beginPath();
          g.moveTo(x, yS);
          g.lineTo(x, yS + len);
          g.stroke();
          if (q % 5 === 0) text(g, `${q * 5} %`, x, yS + 17, { font: `600 ${small ? 10.5 : 11.5}px ${theme.font}`, color: theme.muted });
        }
        const label = DATASETS[shown.data].whole ? `100 % = ${valueText(total(shown.values))}` : '100 %';
        g.font = `700 12.5px ${theme.font}`;
        const lw = g.measureText(label).width + 16;
        roundRect(g, S.x + S.w / 2 - lw / 2, yb - 11, lw, 22, 11);
        g.fillStyle = cardBg();
        g.fill();
        text(g, label, S.x + S.w / 2, yb, { font: `700 12.5px ${theme.font}`, color: theme.text });
        g.restore();
      }
      // e) Kreis: Namen und Prozent außen
      const pa = layer.pie.at(now) * ease.inOutCubic(clamp((k - 0.9) / 0.1, 0, 1));
      if (pa > 0.003) {
        const pie = geo!.pie;
        let a0 = 0;
        const order = d.map((_, i) => i).sort((x, y) => slotPos(x) - slotPos(y));
        const totD = d.reduce((s, v) => s + v, 0) || 1;
        const fill = Math.min(1, totD / tot);
        order.forEach((i) => {
          const share = (d[i]! / totD) * fill;
          const mid = (a0 + share / 2) * TAU;
          a0 += share;
          const lift = lifts[i]!.at(now) * 10;
          const rr = pie.R + 14 + lift;
          const x = pie.cx + Math.sin(mid) * rr;
          const y = pie.cy - Math.cos(mid) * rr;
          const right = Math.sin(mid) >= 0;
          const align: CanvasTextAlign = Math.abs(Math.sin(mid)) < 0.2 ? 'center' : right ? 'left' : 'right';
          const dyName = Math.cos(mid) > 0.8 ? -8 : Math.cos(mid) < -0.8 ? 6 : 0;
          // leere Sektoren bekommen keine Beschriftung (sonst überlappen sie)
          const vis = clamp(share * 200, 0, 1);
          if (vis <= 0.01) return;
          g.save();
          g.globalAlpha = pa * vis * (0.6 + 0.4 * dims[i]!.at(now));
          const nf = `700 ${small ? 11.5 : 12.5}px ${theme.font}`;
          const showP = labA > 0.01;
          text(g, cats[i]!, x, y + dyName - (showP ? 8 : 0), { font: nf, color: theme.text, align });
          if (showP) {
            g.globalAlpha *= labA;
            const pv = pcts[i]!;
            const pcol = sh > 0.02 ? mixColor(theme.muted, theme.series[1]!, sh) : theme.muted;
            text(g, sh > 0.5 ? pctText(Math.round(pv), 0) : pctText(pv, 1), x, y + dyName + 8, { font: `650 ${small ? 11 : 12}px ${theme.font}`, color: pcol, align });
          }
          g.restore();
          g.font = nf;
          const w = Math.max(g.measureText(cats[i]!).width, 40);
          const bx = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
          if (pa > 0.5) zones.push({ id: 'labels', r: { x: bx - 4, y: y + dyName - 18, w: w + 8, h: 36 } });
        });
        // Mitte bei ehrlicher Summe: „100 %“
        const hb = (1 - sh) * (shown.trick === 'sum' ? 1 : 0);
        if (hb > 0.01) {
          g.save();
          g.globalAlpha = pa * hb;
          const rr = pie.R * 0.34 * lerp(0.6, 1, ease.outBack(hb));
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
          g.shadowBlur = 10;
          g.beginPath();
          g.arc(pie.cx, pie.cy, rr, 0, TAU);
          g.fillStyle = cardBg();
          g.fill();
          g.shadowColor = 'transparent';
          text(g, '100 %', pie.cx, pie.cy - rr * 0.16, { font: `800 ${clamp(rr * 0.42, 12, 20)}px ${theme.font}`, color: theme.text });
          text(g, '360°', pie.cx, pie.cy + rr * 0.32, { font: `650 ${clamp(rr * 0.28, 10, 13)}px ${theme.font}`, color: theme.muted });
          g.restore();
        }
      }
    }

    /* ---------------- Zeichnen: Tabelle mit Strichliste ---------------- */
    function drawTable(d: number[]): void {
      const A = layer.tab.at(now);
      if (A <= 0.003) return;
      const g = surface.g;
      const theme = ctx.theme;
      const Tb = geo!.Tb;
      const small = geo!.C.w < 480;
      const kk = d.length;
      const rg = rowGeo(kk);
      const whole = ds().whole;
      const useTally = Math.max(...shown.values) <= 40;
      const tot = total(fullValues()) || 1;
      const cats = tx().cats.map((l) => T(l));
      // Spalten
      const xName = Tb.x + 30;
      const xEnd = Tb.x + Tb.w - 8;
      const colPct = whole ? (small ? 62 : 84) : 0;
      const colVal = small ? 62 : 90;
      const xPct = xEnd;
      const xVal = xEnd - colPct;
      g.font = `650 13px ${theme.font}`;
      const nameW = Math.max(...cats.map((c0) => g.measureText(c0).width)) + 18;
      const xTally = xName + nameW;
      const hf = `750 ${small ? 11 : 12}px ${theme.font}`;
      g.save();
      g.globalAlpha = A;
      const hy = rg.y0 - rg.head / 2;
      text(g, T(tx().noun), xName, hy, { font: hf, color: theme.muted, align: 'left' });
      if (useTally && xVal - colVal - xTally > 40) text(g, tt('Strichliste', 'Tally'), xTally, hy, { font: hf, color: theme.muted, align: 'left' });
      text(g, tx().sym ? `${tt('Wert', 'Value')} (${tx().sym})` : tt('Anzahl', 'Count'), xVal, hy, { font: hf, color: theme.muted, align: 'right' });
      if (whole) text(g, tt('Anteil', 'Share'), xPct, hy, { font: hf, color: theme.muted, align: 'right' });
      g.strokeStyle = alpha(theme.text, 0.18);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(Tb.x, rg.y0 + 0.5);
      g.lineTo(Tb.x + Tb.w, rg.y0 + 0.5);
      g.stroke();
      d.forEach((v, i) => {
        const yc = rg.y0 + rg.h * (slotPos(i) + 0.5);
        g.save();
        g.globalAlpha = A * (0.5 + 0.5 * dims[i]!.at(now));
        if (Math.round(slotPos(i)) % 2 === 0) {
          roundRect(g, Tb.x, yc - rg.h / 2 + 2, Tb.w, rg.h - 4, 9);
          g.fillStyle = alpha(theme.text, theme.dark ? 0.045 : 0.03);
          g.fill();
        }
        if (sel === i) {
          roundRect(g, Tb.x, yc - rg.h / 2 + 2, Tb.w, rg.h - 4, 9);
          g.strokeStyle = alpha(itemColor(i), 0.7);
          g.lineWidth = 1.6;
          g.stroke();
        }
        text(g, cats[i]!, xName, yc, { font: `650 ${small ? 12 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
        // Strichliste: Striche erscheinen nacheinander
        if (useTally) {
          const room = xVal - colVal - xTally;
          const cnt = Math.round(v);
          const tl = tally(cnt);
          const sH = Math.min(rg.h * 0.5, 18);
          const gapS = Math.min(5, room / Math.max(1, tl.bundles * 6.4 + tl.rest + 1));
          let x = xTally;
          g.strokeStyle = theme.text;
          g.lineWidth = 1.7;
          g.lineCap = 'round';
          for (let j = 0; j < cnt; j++) {
            const inB = j % 5;
            if (inB === 4) {
              const x0 = x - gapS * 4 - 1;
              g.beginPath();
              g.moveTo(x0, yc + sH / 2);
              g.lineTo(x - gapS + 2, yc - sH / 2);
              g.stroke();
              x += gapS * 1.6;
            } else {
              g.beginPath();
              g.moveTo(x, yc - sH / 2);
              g.lineTo(x, yc + sH / 2);
              g.stroke();
              x += gapS;
            }
          }
        }
        text(g, numText(Number(v.toFixed(valueDec())), valueDec()), xVal, yc, { font: `750 ${small ? 12.5 : 13.5}px ${theme.font}`, color: theme.text, align: 'right' });
        if (whole) text(g, pctText(percent(v, tot), 1), xPct, yc, { font: `600 ${small ? 11.5 : 12.5}px ${theme.font}`, color: theme.muted, align: 'right' });
        g.restore();
      });
      // Summe
      const ys = rg.y0 + rg.h * kk + 16;
      g.strokeStyle = alpha(theme.text, 0.3);
      g.beginPath();
      g.moveTo(Tb.x, rg.y0 + rg.h * kk + 1.5);
      g.lineTo(Tb.x + Tb.w, rg.y0 + rg.h * kk + 1.5);
      g.stroke();
      if (whole) {
        text(g, tt('Summe', 'Total'), xName, ys, { font: `750 ${small ? 12 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, numText(total(d), valueDec()), xVal, ys, { font: `800 ${small ? 12.5 : 13.5}px ${theme.font}`, color: theme.text, align: 'right' });
        text(g, '100 %', xPct, ys, { font: `700 ${small ? 11.5 : 12.5}px ${theme.font}`, color: theme.muted, align: 'right' });
      } else {
        const mean = total(d) / kk;
        text(g, tt('Mittelwert', 'Mean'), xName, ys, { font: `750 ${small ? 12 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, numText(mean, 1), xVal, ys, { font: `800 ${small ? 12.5 : 13.5}px ${theme.font}`, color: theme.text, align: 'right' });
      }
      g.restore();
    }

    /* ---------------- Zeichnen: Ablesen (Hilfslinie, Winkel) ---------------- */
    function drawReading(boxes: Box[], d: number[], k: number): void {
      if (sel === null || p.mode === 'detect') return;
      const i = sel;
      const b = boxes[i];
      if (!b) return;
      const g = surface.g;
      const theme = ctx.theme;
      const col = itemColor(i);
      const a = selA.at(now);
      if (a <= 0.003) return;
      const small = geo!.C.w < 480;
      const v = d[i]!;
      const vs = numText(Number(v.toFixed(valueDec())), valueDec());
      g.save();
      g.globalAlpha = a;
      const pillAt = (x: number, y: number, s: string, align: 'left' | 'right' | 'center') => {
        g.font = `800 ${small ? 11.5 : 12.5}px ${theme.font}`;
        const w = g.measureText(s).width + 14;
        const bx = align === 'right' ? x - w : align === 'left' ? x : x - w / 2;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
        g.shadowBlur = 6;
        g.shadowOffsetY = 1.5;
        roundRect(g, bx, y - 11, w, 22, 11);
        g.fillStyle = shade(col, -0.2);
        g.fill();
        g.restore();
        text(g, s, bx + w / 2, y + 0.5, { font: `800 ${small ? 11.5 : 12.5}px ${theme.font}`, color: '#ffffff' });
      };
      if ((chartNow === 'col' || chartNow === 'line') && layer.vAxis.at(now) > 0.5) {
        const R = geo!.P;
        const y = chartNow === 'line' ? b.y + b.h / 2 : b.y;
        g.setLineDash([5, 4]);
        g.strokeStyle = alpha(col, 0.85);
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(b.x + (chartNow === 'line' ? 0 : 0), y);
        g.lineTo(R.x, y);
        g.stroke();
        g.setLineDash([]);
        pillAt(R.x - 4, y, vs, 'right');
      } else if (chartNow === 'bar' && layer.hAxis.at(now) > 0.5) {
        const Q = geo!.Q;
        const x = b.x + b.w;
        g.setLineDash([5, 4]);
        g.strokeStyle = alpha(col, 0.85);
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, b.y + b.h);
        g.lineTo(x, Q.y + Q.h);
        g.stroke();
        g.setLineDash([]);
        pillAt(x, Q.y + Q.h + 14, vs, 'center');
      } else if (chartNow === 'pie' && k > 0.95 && DATASETS[shown.data].whole) {
        // Mittelpunktswinkel als Bogen
        const pie = geo!.pie;
        const order = d.map((_, j) => j).sort((x, y) => slotPos(x) - slotPos(y));
        const totD = total(d) || 1;
        let a0 = 0;
        for (const j of order) {
          if (j === i) break;
          a0 += d[j]! / totD;
        }
        const a1 = a0 + d[i]! / totD;
        const l = lifts[i]!.at(now) * 10;
        const mid = ((a0 + a1) / 2) * TAU;
        const ox = Math.sin(mid) * l;
        const oy = -Math.cos(mid) * l;
        const rr = Math.min(pie.R * 0.36, 46);
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(pie.cx + ox, pie.cy + oy, rr, a0 * TAU - Math.PI / 2, a1 * TAU - Math.PI / 2);
        g.stroke();
        const deg = (d[i]! / totD) * 360;
        const lx = pie.cx + ox + Math.sin(mid) * (rr + (small ? 18 : 22));
        const ly = pie.cy + oy - Math.cos(mid) * (rr + (small ? 18 : 22));
        pillAt(lx, ly, `${fmt.num(deg, Math.abs(deg - Math.round(deg)) < 0.05 ? 0 : 1)}°`, 'center');
      }
      g.restore();
    }
    const selA = G(0);

    /* ---------------- Zeichnen: Detektiv-Ripple ---------------- */
    function drawRipples(): boolean {
      const g = surface.g;
      const theme = ctx.theme;
      let busy = false;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]!;
        const u = (now - r.t0) / 700;
        if (u >= 1) {
          ripples.splice(i, 1);
          continue;
        }
        busy = true;
        const col = r.ok ? theme.series[2]! : theme.series[3]!;
        g.save();
        g.globalAlpha = 1 - u;
        g.strokeStyle = col;
        g.lineWidth = 3 * (1 - u) + 1;
        g.beginPath();
        g.arc(r.x, r.y, 8 + 30 * ease.outCubic(u), 0, TAU);
        g.stroke();
        g.fillStyle = alpha(col, 0.25 * (1 - u));
        g.fill();
        g.restore();
      }
      return busy;
    }

    /* ---------------- Seitenkarte ---------------- */
    type Block =
      | { k: 'title'; text: string }
      | { k: 'badge'; text: string; color: string }
      | { k: 'p'; text: string; color?: string; weight?: number; size?: number; italic?: boolean }
      | { k: 'eq'; parts: (string | [string, string])[]; color?: string }
      | { k: 'item'; color: string; name: string; value: string }
      | { k: 'meter'; label: string; a: number; b: number }
      | { k: 'sum'; value: number }
      | { k: 'dots' }
      | { k: 'gap'; h: number };

    function panelBlocks(): { key: string; blocks: Block[] } {
      const theme = ctx.theme;
      const mode = p.mode as Mode;
      const b: Block[] = [];
      const full = fullValues();
      const tot = total(full);
      const whole = ds().whole;
      const cats = tx().cats.map((l) => T(l));
      const longs = tx().long.map((l) => T(l));
      if (mode === 'read') {
        b.push({ k: 'title', text: T(CHART_NAMES[chartNow]) });
        b.push({ k: 'p', text: T(CHART_INFO[chartNow]), color: theme.muted });
        const w = unsuitable(shown, chartNow);
        if (w === 'parts') b.push({ k: 'badge', text: tt('Passt hier nicht: Temperaturen sind keine Teile eines Ganzen.', 'Not suitable: temperatures are not parts of a whole.'), color: theme.series[3]! });
        if (whole && tot <= 0) b.push({ k: 'badge', text: tt('Alle Werte sind 0: Es gibt noch kein Ganzes und damit keine Anteile. Stelle mindestens einen Wert größer als 0 ein.', 'All values are 0: there is no whole yet, so there are no shares. Set at least one value above 0.'), color: theme.series[3]! });
        if (w === 'line') b.push({ k: 'badge', text: tt('Vorsicht: Zwischen den Kategorien gibt es kein „Dazwischen“ – die Linie täuscht einen Verlauf vor.', 'Careful: there is no “in between” two categories – the line suggests a trend.'), color: theme.series[3]! });
        b.push({ k: 'gap', h: 6 });
        if (sel !== null && full[sel] !== undefined) {
          const v = Number(full[sel]!.toFixed(valueDec()));
          b.push({ k: 'item', color: itemColor(sel), name: longs[sel]!, value: valueText(v) });
          if (whole && tot > 0) {
            const [rn, rd] = reduceFraction(v, Math.round(tot));
            const reduced0 = rd !== Math.round(tot) && rd > 1;
            const pv = percent(v, tot);
            const parts: (string | [string, string])[] = [tt('Anteil', 'Share') + ' = ', [numText(v), numText(Math.round(tot))]];
            if (reduced0) parts.push(' = ', [numText(rn), numText(rd)]);
            parts.push(` ${Math.abs(pv - Math.round(pv * 10) / 10) < 1e-9 ? '=' : '≈'} ${pctText(pv, 1)}`);
            b.push({ k: 'eq', parts });
            if (chartNow === 'pie' || chartNow === 'strip') {
              const deg = (v / tot) * 360;
              b.push({ k: 'eq', parts: [tt('Winkel', 'Angle') + ' = ', [numText(v), numText(Math.round(tot))], ` · 360° ${Math.abs(deg - Math.round(deg)) < 1e-9 ? '=' : '≈'} ${fmt.num(deg, 1)}°`] });
            }
          } else if (!whole) {
            const mean = tot / Math.max(1, full.length);
            b.push({ k: 'p', text: tt(`Mittelwert der Woche: ${numText(mean, 1)} ${tx().sym}`, `Mean of the week: ${numText(mean, 1)} ${tx().sym}`), color: theme.muted });
          }
        } else {
          const canDrag = chartNow === 'col' || chartNow === 'bar' || chartNow === 'line';
          const what = chartNow === 'pie' ? tt('einen Sektor', 'a sector') : chartNow === 'strip' ? tt('ein Stück', 'a piece') : chartNow === 'tab' ? tt('eine Zeile', 'a row') : chartNow === 'bar' ? tt('einen Balken', 'a bar') : chartNow === 'line' ? tt('einen Punkt', 'a point') : tt('eine Säule', 'a column');
          b.push({ k: 'p', text: tt(`Tippe auf ${what}, um abzulesen.`, `Tap ${what} to read it off.`) + (canDrag ? tt(' Ziehen ändert den Wert.', ' Drag to change the value.') : ''), weight: 600 });
        }
        b.push({ k: 'gap', h: 4 });
        if (whole) b.push({ k: 'p', text: `${tt('Gesamt', 'Total')}: ${valueText(tot)}`, color: theme.muted, weight: 700, size: 12 });
        else b.push({ k: 'p', text: `${tt('Mittelwert', 'Mean')}: ${numText(tot / Math.max(1, full.length), 1)} ${tx().sym}`, color: theme.muted, weight: 700, size: 12 });
        return { key: `r|${chartNow}|${sel}|${shown.data}|${unsuitable(shown, chartNow)}|${tot > 0}`, blocks: b };
      }
      const trick = shown.trick!;
      const h = honestG.at(now) > 0.5;
      const revealed = shown.honest;
      if (mode === 'detect') {
        const ci = clamp(p.fall - 1, 0, CASES.length - 1);
        const cs = CASES[ci]!;
        b.push({ k: 'dots' });
        b.push({ k: 'title', text: `${tt('Fall', 'Case')} ${p.fall}: ${T(cs.title)}` });
        b.push({ k: 'p', text: T(cs.story), italic: true });
        b.push({ k: 'gap', h: 4 });
        if (!verdict && !revealed) {
          b.push({ k: 'p', text: tt('Was stimmt hier nicht? Tippe im Diagramm auf die Stelle, die täuscht.', 'What’s wrong here? Tap the spot in the chart that misleads.'), weight: 650 });
          return { key: `d|${ci}|open`, blocks: b };
        }
        if (verdict && !verdict.ok && !revealed) {
          b.push({ k: 'badge', text: tt('Hier ist alles in Ordnung.', 'Nothing wrong here.'), color: theme.series[3]! });
          b.push({ k: 'p', text: `${tt('Tipp', 'Hint')}: ${T(cs.hint)}`, color: theme.muted });
          return { key: `d|${ci}|wrong|${verdict.zone}|${verdict.at}`, blocks: b };
        }
        b.push({ k: 'badge', text: verdict?.ok ? tt('Gefunden!', 'Found it!') + ` ${T(TRICK_NAMES[trick])}` : T(TRICK_NAMES[trick]), color: theme.series[2]! });
        b.push({ k: 'p', text: trickText(trick, false), color: theme.muted });
        pushMeter(b, trick);
        return { key: `d|${ci}|done`, blocks: b };
      }
      b.push({ k: 'badge', text: h ? tt('ehrlich dargestellt', 'shown honestly') : tt('Täuschung', 'Trick'), color: h ? theme.series[2]! : theme.series[1]! });
      b.push({ k: 'title', text: T(TRICK_NAMES[trick]) });
      b.push({ k: 'p', text: trickText(trick, revealed), color: theme.muted });
      pushMeter(b, trick);
      void cats;
      return { key: `t|${trick}|${revealed}|${shown.data}|${total(shown.values) > 0}`, blocks: b };
    }

    /** Erklärtext zu einer Täuschung (mit den aktuellen Zahlen). */
    function trickText(trick: Trick, honest: boolean): string {
      const v = shown.values;
      const cats = tx().long.map((l) => T(l));
      const iMin = v.indexOf(Math.min(...v));
      const iMax = v.indexOf(Math.max(...v));
      const cutV = effectiveCut(v, shown.cut);
      switch (trick) {
        case 'cut':
          return honest
            ? tt(`Jetzt beginnt die Achse bei 0: Die Höhen passen wieder zu den Werten (gestrichelt: der frühere Achsenbeginn ${numText(cutV)}).`, `Now the axis starts at 0: the heights match the values again (dashed: the former start ${numText(cutV)}).`)
            : tt(`Die Hochachse beginnt bei ${numText(cutV)}, nicht bei 0. Kleine Unterschiede wirken dadurch riesig.`, `The vertical axis starts at ${numText(cutV)}, not at 0. Small differences look huge.`);
        case 'gap':
          return honest
            ? tt('Jetzt bedeuten gleiche Abstände an der Achse auch gleiche Zahlensprünge.', 'Now equal spacing on the axis means equal steps in the numbers.')
            : tt(`Die Marken haben gleiche Abstände, aber die Zahlen springen: ${unevenTicks(Math.max(...v)).map((x) => numText(x)).join(', ')}. Große Werte werden gestaucht.`, `The marks are evenly spaced, but the numbers jump: ${unevenTicks(Math.max(...v)).map((x) => numText(x)).join(', ')}. Large values are squashed.`);
        case 'area': {
          if (honest) return tt('Jedes Bildchen steht für gleich viel – man zählt einfach die Bildchen.', 'Every picture stands for the same amount – just count them.');
          // Verglichen wird mit dem kleinsten Wert über 0 (eine 0 hat keine Figur).
          const iLo = minPositiveIndex(v);
          if (iLo < 0 || v[iLo]! >= v[iMax]!) return tt('Die Figuren wachsen in Höhe UND Breite – und das Auge vergleicht Flächen.', 'The figures grow in height AND width – and our eyes compare areas.');
          const q = v[iMax]! / v[iLo]!;
          return tt(`Die Figuren wachsen in Höhe UND Breite. ${cats[iMax]} ist ${fmt.num(q, 1)}-mal so hoch wie ${cats[iLo]}, die Fläche aber ${fmt.num(q * q, 1)}-mal so groß – und das Auge vergleicht Flächen.`, `The figures grow in height AND width. ${cats[iMax]} is ${fmt.num(q, 1)} times as tall as ${cats[iLo]}, but its area is ${fmt.num(q * q, 1)} times as large – and our eyes compare areas.`);
        }
        case 'unit':
          return honest
            ? tt(`Mit Überschrift und Einheit ist klar, was gemeint ist: ${T(tx().axis)}.`, `With a title and a unit it is clear what is meant: ${T(tx().axis)}.`)
            : shown.data === 'temp'
              ? tt('Überschrift und Einheit fehlen: 23 Grad – Celsius oder Fahrenheit? 23 °F wären etwa −5 °C!', 'Title and unit are missing: 23 degrees – Celsius or Fahrenheit? 23 °F would be about −5 °C!')
              : tt('Überschrift und Einheit fehlen: Was bedeuten die Zahlen – Minuten, Stunden, Personen?', 'Title and unit are missing: what do the numbers mean – minutes, hours, people?');
        default: {
          const tot = total(v);
          if (tot <= 0) return tt('Alle Werte sind 0: Ohne Daten gibt es kein Ganzes und keinen Kreis. Stelle mindestens einen Wert größer als 0 ein.', 'All values are 0: without data there is no whole and no circle. Set at least one value above 0.');
          return honest
            ? tt(`Richtig gerechnet wird durch die Summe ${numText(tot)}: Zusammen sind es genau 100 % = 360°.`, `The correct base is the total ${numText(tot)}: together exactly 100 % = 360°.`)
            : tt(`Die Prozentangaben ergeben zusammen ${numText(total(percentsOf(v, wrongBase(tot))))} %. Ein ganzer Kreis sind aber genau 100 %. Hier wurde durch ${numText(wrongBase(tot))} statt durch ${numText(tot)} geteilt.`, `The percentages add up to ${numText(total(percentsOf(v, wrongBase(tot))))} %. A whole circle is exactly 100 %. Someone divided by ${numText(wrongBase(tot))} instead of ${numText(tot)}.`);
        }
      }
    }

    /** Täuschungs-Meter: „so wirkt es“ und „so ist es“ (live aus dem Bild). */
    function pushMeter(b: Block[], trick: Trick): void {
      const v = fullValues();
      if (!v.length) return;
      const iMin = shown.values.indexOf(Math.min(...shown.values));
      const iMax = shown.values.indexOf(Math.max(...shown.values));
      const cats = tx().cats.map((l) => T(l));
      b.push({ k: 'gap', h: 8 });
      if (trick === 'cut' || trick === 'gap' || trick === 'area') {
        // Beim Flächen-Piktogramm mit dem kleinsten Wert über 0 vergleichen (eine 0 hat keine Figur).
        const iLo = trick === 'area' ? Math.max(0, minPositiveIndex(shown.values)) : iMin;
        const real = v[iMax]! > 0 ? v[iLo]! / v[iMax]! : 0;
        let seen: number;
        if (trick === 'area') seen = lerp(real, real * real, areaG.at(now));
        else seen = frac(v[iMax]!) > 0 ? clamp(frac(v[iMin]!), 0, 1) / frac(v[iMax]!) : 0;
        b.push({ k: 'meter', label: tt(`${cats[iLo]} im Vergleich zu ${cats[iMax]}`, `${cats[iLo]} compared with ${cats[iMax]}`), a: seen, b: real });
      } else if (trick === 'sum') {
        const tot = total(v);
        b.push({ k: 'sum', value: lerp(100, total(percentsOf(v, wrongBase(tot))), sumG.at(now)) });
      }
    }

    function blockHeight(bl: Block, w: number): number {
      const theme = ctx.theme;
      switch (bl.k) {
        case 'title':
          return wrap(bl.text, w, `800 16px ${theme.font}`).length * 21 + 4;
        case 'badge':
          return wrap(bl.text, w - 20, `700 12.5px ${theme.font}`).length * 17 + 12 + 6;
        case 'p': {
          const size = bl.size ?? 13;
          return wrap(bl.text, w, pFont(bl)).length * size * 1.42 + 4;
        }
        case 'eq':
          return 36;
        case 'item':
          return 28;
        case 'meter':
          return 82;
        case 'sum':
          return 56;
        case 'dots':
          return 22;
        default:
          return bl.h;
      }
    }
    const pFont = (bl: { weight?: number; size?: number; italic?: boolean }) => `${bl.italic ? 'italic ' : ''}${bl.weight ?? 500} ${bl.size ?? 13}px ${ctx.theme.font}`;

    function drawBlocks(blocks: Block[], R: Rect, A: number, dy: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const w = R.w - 32;
      const x = R.x + 16;
      let y = R.y + 16 + dy;
      const totalH = blocks.reduce((s, bl) => s + blockHeight(bl, w), 0);
      // passt es nicht, Abstände etwas verdichten
      const squeeze = totalH > R.h - 28 ? (R.h - 28) / totalH : 1;
      g.save();
      g.globalAlpha = A;
      for (const bl of blocks) {
        const h = blockHeight(bl, w) * Math.max(0.82, squeeze);
        switch (bl.k) {
          case 'title': {
            wrap(bl.text, w, `800 16px ${theme.font}`).forEach((ln, i) => text(g, ln, x, y + 10 + i * 21, { font: `800 16px ${theme.font}`, color: theme.text, align: 'left', baseline: 'middle' }));
            break;
          }
          case 'badge': {
            const lines = wrap(bl.text, w - 20, `700 12.5px ${theme.font}`);
            const bh = lines.length * 17 + 10;
            g.font = `700 12.5px ${theme.font}`;
            const bw = lines.length > 1 ? w : Math.min(w, g.measureText(lines[0] ?? '').width + 22);
            roundRect(g, x, y, bw, bh, Math.min(12, bh / 2));
            g.fillStyle = alpha(bl.color, theme.dark ? 0.2 : 0.12);
            g.fill();
            lines.forEach((ln, i) => text(g, ln, x + 11, y + 5 + 8.5 + i * 17, { font: `700 12.5px ${theme.font}`, color: theme.dark ? shade(bl.color, 0.3) : shade(bl.color, -0.15), align: 'left' }));
            break;
          }
          case 'p': {
            const size = bl.size ?? 13;
            wrap(bl.text, w, pFont(bl)).forEach((ln, i) => text(g, ln, x, y + size * 0.71 + i * size * 1.42, { font: pFont(bl), color: bl.color ?? theme.text, align: 'left' }));
            break;
          }
          case 'eq':
            drawEq(bl.parts, x, y + 18, w, bl.color ?? theme.text);
            break;
          case 'item': {
            g.save();
            g.shadowColor = alpha(bl.color, 0.5);
            g.shadowBlur = 6;
            g.beginPath();
            g.arc(x + 7, y + 13, 7, 0, TAU);
            g.fillStyle = bl.color;
            g.fill();
            g.restore();
            const f = fitText([`${bl.name}: ${bl.value}`], w - 22, 15, 800, 11);
            text(g, f.value, x + 22, y + 13, { font: f.font, color: theme.text, align: 'left' });
            break;
          }
          case 'meter':
            drawMeter(bl, x, y, w);
            break;
          case 'sum':
            drawSum(bl.value, x, y, w);
            break;
          case 'dots':
            drawDots(x, y + 9);
            break;
          default:
            break;
        }
        y += h;
      }
      g.restore();
    }

    /** Gleichung mit Brüchen auf der Karte. */
    function drawEq(parts: (string | [string, string])[], x: number, y: number, maxW: number, color: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      let size = 14;
      const widthOf = (s0: number) => {
        let wsum = 0;
        for (const q of parts) {
          if (typeof q === 'string') {
            g.font = `600 ${s0}px ${theme.font}`;
            wsum += g.measureText(q).width;
          } else {
            g.font = `700 ${s0 * 0.86}px ${theme.font}`;
            wsum += Math.max(g.measureText(q[0]).width, g.measureText(q[1]).width) + 6;
          }
        }
        return wsum;
      };
      while (size > 10.5 && widthOf(size) > maxW) size -= 0.5;
      let cx = x;
      for (const q of parts) {
        if (typeof q === 'string') {
          const f = `600 ${size}px ${theme.font}`;
          g.font = f;
          text(g, q, cx, y, { font: f, color, align: 'left' });
          cx += g.measureText(q).width;
        } else {
          const f = `700 ${size * 0.86}px ${theme.font}`;
          g.font = f;
          const fw = Math.max(g.measureText(q[0]).width, g.measureText(q[1]).width) + 6;
          text(g, q[0], cx + fw / 2, y - size * 0.55, { font: f, color });
          text(g, q[1], cx + fw / 2, y + size * 0.62, { font: f, color });
          g.strokeStyle = color;
          g.lineWidth = 1.2;
          g.beginPath();
          g.moveTo(cx + 1, y + 0.5);
          g.lineTo(cx + fw - 1, y + 0.5);
          g.stroke();
          cx += fw;
        }
      }
    }

    function drawMeter(bl: { label: string; a: number; b: number }, x: number, y: number, w: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      text(g, bl.label, x, y + 8, { font: `700 12.5px ${theme.font}`, color: theme.text, align: 'left' });
      const rows: [string, number, string][] = [
        [tt('im Bild', 'looks'), bl.a, theme.series[1]!],
        [tt('echt', 'real'), bl.b, theme.series[2]!],
      ];
      g.font = `600 12px ${theme.font}`;
      const lw = Math.max(...rows.map((r) => g.measureText(r[0]).width)) + 10;
      const bw = w - lw - 52;
      rows.forEach(([lab, v, col], j) => {
        const yy = y + 30 + j * 24;
        text(g, lab, x, yy, { font: `600 12px ${theme.font}`, color: theme.muted, align: 'left' });
        roundRect(g, x + lw, yy - 7, bw, 14, 7);
        g.fillStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
        g.fill();
        roundRect(g, x + lw, yy - 7, Math.max(14, bw * clamp(v, 0, 1)), 14, 7);
        const gr = g.createLinearGradient(0, yy - 7, 0, yy + 7);
        gr.addColorStop(0, shade(col, 0.2));
        gr.addColorStop(1, shade(col, -0.05));
        g.fillStyle = gr;
        g.fill();
        text(g, `${fmt.num(v * 100, 0)} %`, x + w, yy, { font: `800 13px ${theme.font}`, color: col, align: 'right' });
      });
    }

    function drawSum(v: number, x: number, y: number, w: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const col = v > 100.5 ? theme.series[1]! : theme.series[2]!;
      text(g, tt('Summe der Prozentangaben', 'Sum of the percentages'), x, y + 8, { font: `700 12.5px ${theme.font}`, color: theme.text, align: 'left' });
      const bw = w - 64;
      const yy = y + 32;
      const scale = bw / 130;
      roundRect(g, x, yy - 7, bw, 14, 7);
      g.fillStyle = alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.fill();
      roundRect(g, x, yy - 7, Math.min(bw, v * scale), 14, 7);
      g.fillStyle = col;
      g.fill();
      // Marke 100 %
      g.strokeStyle = theme.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(x + 100 * scale, yy - 11);
      g.lineTo(x + 100 * scale, yy + 11);
      g.stroke();
      text(g, '100 %', x + 100 * scale, yy + 19, { font: `600 10.5px ${theme.font}`, color: theme.muted });
      text(g, `${fmt.num(v, 0)} %`, x + w, yy, { font: `800 14px ${theme.font}`, color: col, align: 'right' });
    }

    function drawDots(x: number, y: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      for (let i = 0; i < CASES.length; i++) {
        const cx = x + 7 + i * 20;
        const cur = i === p.fall - 1;
        g.beginPath();
        g.arc(cx, y, cur ? 7 : 5.5, 0, TAU);
        if (solved.has(i)) {
          g.fillStyle = theme.series[2]!;
          g.fill();
          text(g, '✓', cx, y + 0.5, { font: `800 ${cur ? 9.5 : 8}px ${theme.font}`, color: '#ffffff' });
        } else {
          g.fillStyle = alpha(theme.text, cur ? 0.14 : 0.08);
          g.fill();
        }
        if (cur) {
          g.strokeStyle = theme.series[0]!;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(cx, y, 9, 0, TAU);
          g.stroke();
        }
      }
    }

    function drawPanel(): boolean {
      const R = geo!.panel;
      card(R);
      const { key, blocks } = panelBlocks();
      if (key !== panelKey) {
        if (panelKey) {
          panelPrev = lastBlocks;
          panelSwitch = now;
        }
        panelKey = key;
      }
      lastBlocks = blocks;
      const u = reduced ? 1 : clamp((now - panelSwitch) / 420, 0, 1);
      const e = ease.inOutCubic(u);
      const g = surface.g;
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 16);
      g.clip();
      if (u < 1 && panelPrev.length) drawBlocks(panelPrev, R, 1 - e, -8 * e);
      drawBlocks(blocks, R, e, 8 * (1 - e));
      g.restore();
      return u < 1;
    }
    let lastBlocks: Block[] = [];

    /** Beschreibung der Zeichenfläche für Bildschirmleser (verrät im Detektiv-Modus die Täuschung nicht). */
    function describeCanvas(cf: Cfg): void {
      const t = TEXTS[cf.data];
      const d = DATASETS[cf.data];
      const dec = d.step < 1 ? 1 : 0;
      const val = (x: number) => (t.sym ? `${fmt.num(x, dec)} ${t.sym}` : `${fmt.num(x, dec)} ${x === 1 ? T(t.one) : T(t.many)}`);
      const list = cf.values.map((x, i) => `${T(t.long[i]!)} ${val(x)}`).join(', ');
      let s = `${T(CHART_NAMES[cf.chart])}: ${T(t.title)}. ${list}.`;
      if (cf.trick && p.mode === 'trick') s += ` ${tt('Täuschung', 'Trick')}: ${T(TRICK_NAMES[cf.trick])}${cf.honest ? tt(' (ehrlich dargestellt)', ' (shown honestly)') : ''}.`;
      if (p.mode === 'detect') s += ` ${tt('Detektiv-Fall', 'Detective case')} ${p.fall}.`;
      surface.canvas.setAttribute('aria-label', s);
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const cf = cfg();
      const t = TEXTS[cf.data];
      const d = DATASETS[cf.data];
      const v = cf.values;
      const tot = total(v);
      const cats = t.long.map((l) => T(l));
      const dec = d.step < 1 ? 1 : 0;
      const unitWord = (x: number) => (t.sym ? `${fmt.num(x, dec)} ${t.sym}` : `${fmt.num(x, dec)} ${x === 1 ? T(t.one) : T(t.many)}`);
      describeCanvas(cf);
      if (p.mode === 'detect' && !cf.honest) {
        ctx.readout('tbl', null);
        ctx.readout('sum', null);
        ctx.readout('sel', null);
        ctx.readout('trick', null);
        return;
      }
      const angles = pieAngles(v);
      const pr = roundedPercents(v, 1);
      const head = `<tr><th>${T(t.noun)}</th><th>${t.sym ? tt('Wert', 'Value') : tt('Anzahl', 'Count')}</th>${d.whole ? `<th>${tt('Anteil', 'Share')}</th><th>${tt('Winkel', 'Angle')}</th>` : ''}</tr>`;
      const rows = v.map((x, i) => `<tr${sel === i ? ' class="is-current"' : ''}><td>${cats[i]}</td><td>${unitWord(x)}</td>${d.whole ? `<td>${fmt.num(pr[i]!, 1)} %</td><td>${angles[i]}°</td>` : ''}</tr>`).join('');
      ctx.readout('tbl', { html: `<table class="mini-table">${head}${rows}</table>` });
      ctx.readout('sum', d.whole ? (tot > 0 ? `${unitWord(tot)} = 100 % = 360°` : `${unitWord(0)} – ${tt('keine Anteile', 'no shares')}`) : `${tt('Mittelwert', 'Mean')} ${fmt.num(tot / v.length, 1)} ${t.sym}`);
      if (sel !== null && v[sel] !== undefined && p.mode === 'read') {
        const x = v[sel]!;
        if (d.whole && tot > 0) {
          ctx.readout('sel', {
            html: `${cats[sel]}: ${unitWord(x)} · <span class="frac"><span>${fmt.num(x, dec)}</span><span>${fmt.num(tot, dec)}</span></span> ≈ ${fmt.num(percent(x, tot), 1)} % · ${fmt.num((x / tot) * 360, 1)}°`,
          });
        } else ctx.readout('sel', `${cats[sel]}: ${unitWord(x)}`);
      } else ctx.readout('sel', null);
      if (cf.trick) {
        const iMin = v.indexOf(Math.min(...v));
        const iMax = v.indexOf(Math.max(...v));
        const real = v[iMax]! > 0 ? v[iMin]! / v[iMax]! : 0;
        const nm = t.cats.map((l) => T(l));
        if (cf.trick === 'cut') {
          const s = effectiveCut(v, cf.cut);
          const seen = (v[iMin]! - s) / Math.max(1e-9, v[iMax]! - s);
          ctx.readout('trick', tt(`Achse ab ${fmt.num(s, 0)}: ${nm[iMin]} wirkt wie ${fmt.num(seen * 100, 0)} % von ${nm[iMax]}, echt sind es ${fmt.num(real * 100, 0)} %.`, `Axis from ${fmt.num(s, 0)}: ${nm[iMin]} looks like ${fmt.num(seen * 100, 0)} % of ${nm[iMax]}, really it is ${fmt.num(real * 100, 0)} %.`));
        } else if (cf.trick === 'gap') {
          const tk = unevenTicks(Math.max(...v));
          const seen = unevenFraction(v[iMin]!, tk) / Math.max(1e-9, unevenFraction(v[iMax]!, tk));
          ctx.readout('trick', tt(`${nm[iMin]} wirkt wie ${fmt.num(seen * 100, 0)} % von ${nm[iMax]}, echt sind es ${fmt.num(real * 100, 0)} %.`, `${nm[iMin]} looks like ${fmt.num(seen * 100, 0)} % of ${nm[iMax]}, really it is ${fmt.num(real * 100, 0)} %.`));
        } else if (cf.trick === 'area') {
          const iLo = Math.max(0, minPositiveIndex(v));
          const r = v[iMax]! > 0 ? v[iLo]! / v[iMax]! : 0;
          ctx.readout('trick', tt(`Höhe ${fmt.num(r * 100, 0)} %, Fläche ${fmt.num(r * r * 100, 0)} % (${nm[iLo]} im Vergleich zu ${nm[iMax]})`, `Height ${fmt.num(r * 100, 0)} %, area ${fmt.num(r * r * 100, 0)} % (${nm[iLo]} compared with ${nm[iMax]})`));
        } else if (cf.trick === 'sum' && tot > 0) {
          ctx.readout('trick', tt(`Summe der falschen Angaben: ${fmt.num(total(percentsOf(v, wrongBase(tot))), 0)} % (geteilt durch ${wrongBase(tot)} statt ${fmt.num(tot, 0)})`, `Sum of the wrong figures: ${fmt.num(total(percentsOf(v, wrongBase(tot))), 0)} % (divided by ${wrongBase(tot)} instead of ${fmt.num(tot, 0)})`));
        } else if (cf.trick === 'sum') ctx.readout('trick', null);
        else ctx.readout('trick', tt('Ohne Überschrift und Einheit sind die Zahlen nicht zu deuten.', 'Without a title and a unit the numbers cannot be interpreted.'));
      } else ctx.readout('trick', null);
    }

    function updateActions(): void {
      ctx.setAction('reveal', { label: p.honest ? tt('Wieder täuschen', 'Mislead again') : tt('Täuschung aufdecken', 'Reveal the trick') });
      ctx.setAction('solve', { enabled: !p.honest });
    }

    /* ---------------- Zeiger ---------------- */
    function itemAt(px: number, py: number): number | null {
      if (!geo) return null;
      const k = n();
      const C = geo.C;
      if (px < C.x || px > C.x + C.w || py < C.y + geo.headH - 6 || py > C.y + C.h) return null;
      const order = Array.from({ length: k }, (_, i) => i).sort((a, b) => pos[a]!.target - pos[b]!.target);
      switch (chartNow) {
        case 'col':
        case 'line':
        case 'pict': {
          const R = geo.P;
          if (px < R.x || px > R.x + R.w || py < R.y - 14 || py > R.y + R.h + 28) return null;
          const s = Math.floor(((px - R.x) / R.w) * k);
          return order[clamp(s, 0, k - 1)] ?? null;
        }
        case 'bar': {
          const Q = geo.Q;
          if (py < Q.y || py > Q.y + Q.h || px > Q.x + Q.w + 30) return null;
          const s = Math.floor(((py - Q.y) / Q.h) * k);
          return order[clamp(s, 0, k - 1)] ?? null;
        }
        case 'tab': {
          const rg = rowGeo(k);
          const s = Math.floor((py - rg.y0) / rg.h);
          return s >= 0 && s < k ? (order[s] ?? null) : null;
        }
        case 'strip': {
          const S = geo.S;
          if (py < S.y - 8 || py > S.y + S.h + 8 || px < S.x || px > S.x + S.w) return null;
          const f = (px - S.x) / S.w;
          const v = shown.values;
          const tot = total(v) || 1;
          let a = 0;
          for (const i of order) {
            a += v[i]! / tot;
            if (f <= a + 1e-9) return i;
          }
          return null;
        }
        default: {
          const pie = geo.pie;
          const dx = px - pie.cx;
          const dy = py - pie.cy;
          if (Math.hypot(dx, dy) > pie.R + 10) return null;
          let ang = Math.atan2(dx, -dy) / TAU;
          if (ang < 0) ang += 1;
          const v = shown.values;
          const tot = total(v) || 1;
          let a = 0;
          for (const i of order) {
            a += v[i]! / tot;
            if (ang <= a + 1e-9) return i;
          }
          return null;
        }
      }
    }

    const canDrag = () => p.mode !== 'detect' && !ctx.locked && (chartNow === 'col' || chartNow === 'bar' || chartNow === 'line') && !trans && outroStart < 0;

    function zoneAt(px: number, py: number): Zone | null {
      const order: Zone[] = ['labels', 'marks', 'cats', 'unit', 'axis', 'title'];
      for (const id of order) {
        if (zones.some((z) => z.id === id && px >= z.r.x && px <= z.r.x + z.r.w && py >= z.r.y && py <= z.r.y + z.r.h)) return id;
      }
      return null;
    }

    function guess(px: number, py: number): void {
      if (shown.honest || verdict?.ok) return;
      const z = zoneAt(px, py);
      if (!z) return;
      const cs = CASES[clamp(p.fall - 1, 0, CASES.length - 1)]!;
      const ok = cs.zones.includes(z);
      ripples.push({ x: px, y: py, t0: performance.now(), ok });
      verdict = { ok, zone: z, at: performance.now() };
      if (ok) {
        solved.add(p.fall - 1);
        if (revealTimer) clearTimeout(revealTimer);
        revealTimer = setTimeout(() => {
          revealTimer = null;
          if (p.mode === 'detect') ctx.set({ honest: true });
        }, reduced ? 0 : 900);
      }
      ctx.requestRender();
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && geo !== null && px >= geo.C.x && px <= geo.C.x + geo.C.w && py >= geo.C.y && py <= geo.C.y + geo.C.h,
      pointerDown: (pt) => {
        if (ctx.locked || !geo) return false;
        if (p.mode === 'detect') {
          guess(pt.px, pt.py);
          return true;
        }
        const i = itemAt(pt.px, pt.py);
        dragI = null;
        dragMoved = false;
        if (i === null) {
          if (sel !== null) {
            sel = null;
            retarget();
            updateReadouts();
          }
          return true;
        }
        sel = sel === i && !canDrag() ? null : i;
        if (canDrag()) {
          dragI = i;
          dragY0 = chartNow === 'bar' ? pt.px : pt.py;
          frozenAxis = { cut: cutG.target, top: topG.target };
        }
        retarget();
        updateReadouts();
        return true;
      },
      pointerMove: (pt) => {
        if (dragI === null || !geo) return;
        const coord = chartNow === 'bar' ? pt.px : pt.py;
        if (!dragMoved && Math.abs(coord - dragY0) < 4) return;
        dragMoved = true;
        let f: number;
        if (chartNow === 'bar') f = (pt.px - geo.Q.x) / geo.Q.w;
        else f = (geo.P.y + geo.P.h - pt.py) / geo.P.h;
        const v = clamp(valueAt(clamp(f, -0.05, 1.08)), ds().min, ds().max);
        const key = ds().keys[dragI]!;
        ctx.set({ [key]: v } as never);
      },
      pointerUp: () => {
        dragI = null;
        dragMoved = false;
        if (frozenAxis) {
          frozenAxis = null;
          retarget();
          syncTicks();
        }
        ctx.requestRender();
      },
      hover: (pt) => {
        let h: number | null = null;
        if (pt && !ctx.locked && p.mode !== 'detect') h = itemAt(pt.px, pt.py);
        if (h !== hoverI) {
          hoverI = h;
          ctx.requestRender();
        }
        const z = pt && p.mode === 'detect' && !shown.honest ? zoneAt(pt.px, pt.py) : null;
        surface.setCursor(h !== null ? (canDrag() ? (chartNow === 'bar' ? 'ew-resize' : 'ns-resize') : 'pointer') : z ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------------- Szenenwechsel ---------------- */
    function applyScene(snap: boolean): void {
      shown = cfg();
      shownKey = sceneKey();
      resetItems(shown);
      geo = surface.width > 0 ? computeGeo() : null;
      chartNow = shown.chart;
      trans = null;
      lineReveal = G(1);
      if (!snap) {
        lineReveal = G(0);
        lineReveal.go(1, 900, ease.inOutCubic, 200);
      }
      introStart = now + (reduced ? -1e6 : 60);
      outroStart = -1;
      verdict = null;
      retarget(650, true);
      syncTicks();
    }

    function onChange(): void {
      const next = cfg();
      if (sceneKey() !== shownKey) {
        if (reduced || outroStart >= 0) {
          if (reduced) applyScene(false);
          return;
        }
        outroStart = now;
        return;
      }
      shown = next;
      if (geo) geo = computeGeo();
      if (next.chart !== chartNow) startChart(next.chart);
      retarget();
      syncTicks();
      warnA.go(unsuitable(next, next.chart) ? 1 : 0, 400, ease.inOutCubic, 300);
    }

    applyScene(true);
    updateReadouts();

    return {
      update(changed, source) {
        if (source === 'input') {
          const vals0 = DATASETS[p.data as DataId].keys.map((k) => P[k] ?? 0);
          if (changed.has('trick') || (changed.has('mode') && p.mode === 'trick')) {
            const upd: Record<string, unknown> = { honest: false };
            if (p.trick === 'sum' && !DATASETS[p.data as DataId].whole) upd.data = 'sport';
            if (p.trick === 'cut') upd.cut = suggestCut(vals0);
            ctx.set(upd as never);
          } else if (changed.has('data') && p.mode === 'trick' && p.trick === 'cut') ctx.set({ cut: suggestCut(vals0) });
          if (changed.has('fall') || (changed.has('mode') && p.mode === 'detect')) ctx.set({ honest: false });
        }
        if (changed.has('fall') || changed.has('mode') || (changed.has('honest') && !p.honest)) verdict = null;
        if (changed.has('mode')) sel = null;
        now = performance.now();
        if (source !== 'init') onChange();
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'reveal') ctx.set({ honest: !p.honest });
        else if (id === 'next') {
          if (revealTimer) clearTimeout(revealTimer);
          revealTimer = null;
          ctx.set({ fall: (p.fall % CASES.length) + 1, honest: false });
        } else if (id === 'solve') {
          verdict = null;
          ctx.set({ honest: true });
        } else if (id === 'replay') {
          now = performance.now();
          introStart = now + (reduced ? -1e6 : 80);
          if (chartNow === 'line') {
            lineReveal = G(0);
            lineReveal.go(1, 900, ease.inOutCubic, 150);
          }
        }
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        if (outroStart >= 0 && now - outroStart >= 300) applyScene(false);
        const sized = !geo || geo.W !== surface.width || geo.H !== surface.height;
        if (sized) {
          geo = computeGeo();
          trans = null;
        }
        if (trans && now - trans.t0 >= trans.ms) trans = null;
        const g = surface.begin();
        zones = [];
        const gm = geo!;
        const o = outroOf();
        card(gm.C);
        g.save();
        roundRect(g, gm.C.x, gm.C.y, gm.C.w, gm.C.h, 16);
        g.clip();
        g.globalAlpha = o;
        drawHeader(1);
        const d = displayValues();
        const ps = pose(d);
        drawValueAxis();
        drawFold(ps.boxes);
        drawShapes(ps.boxes, ps.k, layer.shape.at(now) * o);
        drawLine(ps.boxes);
        drawPict(d);
        drawTable(d);
        drawLabels(ps.boxes, d, ps.k);
        selA.go(sel !== null ? 1 : 0, 280);
        drawReading(ps.boxes, d, ps.k);
        // früherer Achsenbeginn (gestrichelt), wenn die Achse ehrlich bei 0 beginnt
        if (shown.trick === 'cut' && chartNow !== 'bar') {
          const hA = honestG.at(now) * layer.vAxis.at(now);
          if (hA > 0.01) {
            const cv = effectiveCut(shown.values, shown.cut);
            const y = gm.P.y + gm.P.h * (1 - frac(cv));
            g.save();
            g.globalAlpha = hA * 0.9;
            g.setLineDash([6, 5]);
            g.strokeStyle = ctx.theme.series[1]!;
            g.lineWidth = 1.5;
            g.beginPath();
            g.moveTo(gm.P.x, y);
            g.lineTo(gm.P.x + gm.P.w, y);
            g.stroke();
            g.setLineDash([]);
            const lab = numText(cv);
            g.font = `800 11.5px ${ctx.theme.font}`;
            const lw = g.measureText(lab).width + 12;
            roundRect(g, gm.P.x - 6 - lw, y - 9, lw, 18, 9);
            g.fillStyle = ctx.theme.series[1]!;
            g.fill();
            text(g, lab, gm.P.x - 6 - lw / 2, y + 0.5, { font: `800 11.5px ${ctx.theme.font}`, color: '#ffffff' });
            g.restore();
          }
        }
        g.restore();
        const rip = drawRipples();
        const panelBusy = drawPanel();
        // läuft noch etwas?
        let busy = rip || panelBusy || trans !== null || outroStart >= 0;
        if (!busy) busy = vals.some((v) => v.busy(now)) || pos.some((v) => v.busy(now)) || dims.some((v) => v.busy(now)) || lifts.some((v) => v.busy(now));
        if (!busy) busy = [cutG, topG, gapG, areaG, unitG, sumG, pieness, honestG, lineReveal, selA, warnA, ...Object.values(layer)].some((x) => x.busy(now));
        if (!busy) tickFade.forEach((t) => (busy = busy || t.g.busy(now)));
        if (!busy && !reduced) busy = now - introStart < 75 * n() + 800;
        if (busy) ctx.requestRender();
      },

      destroy: () => {
        if (revealTimer) clearTimeout(revealTimer);
        surface.destroy();
      },
    };
  },
});
