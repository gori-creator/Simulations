import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import {
  autoRange,
  clampData,
  CONTEXTS,
  formatData,
  MAX_N,
  parseData,
  quartileRanks,
  snap,
  sortRanks,
  summarize,
  swarmLevels,
  ticksBetween,
  whiskers,
  type ContextId,
  type Summary,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Mode = 'one' | 'cmp';

/** Texte je Sachzusammenhang. */
interface CtxText {
  title: Loc;
  short: Loc;
  groups: [Loc, Loc];
}
const TEXTS: Record<ContextId, CtxText> = {
  test: { title: L('Punkte in der Mathe-Probe', 'Points in the maths test'), short: L('Punkte', 'Points'), groups: [L('Klasse 7a', 'Class 7a'), L('Klasse 7b', 'Class 7b')] },
  geld: { title: L('Taschengeld im Monat', 'Pocket money per month'), short: L('Taschengeld', 'Pocket money'), groups: [L('Klasse 7a', 'Class 7a'), L('Klasse 7b', 'Class 7b')] },
  sprung: { title: L('Weitsprung im Sportunterricht', 'Long jump in PE'), short: L('Sprungweite', 'Jump distance'), groups: [L('Herbst', 'Autumn'), L('Frühjahr', 'Spring')] },
  weg: { title: L('Dauer des Schulwegs', 'Time for the way to school'), short: L('Schulweg', 'Way to school'), groups: [L('Klasse 7a', 'Class 7a'), L('Klasse 7b', 'Class 7b')] },
  own: { title: L('Eigene Daten', 'Your own data'), short: L('Werte', 'Values'), groups: [L('Gruppe A', 'Group A'), L('Gruppe B', 'Group B')] },
};

/** Schritte beim Aufbau „Schritt für Schritt“: Beginn in ms und Text. */
const BUILD: { at: number; title: Loc; text: Loc }[] = [
  { at: 0, title: L('Ordnen', 'Sort'), text: L('Die Werte der Urliste werden der Größe nach geordnet – so entsteht die Rangliste.', 'The raw values are put in order of size – this gives the ordered list.') },
  { at: 1700, title: L('Median', 'Median'), text: L('Der Median steht in der Mitte der geordneten Liste. Bei gerader Anzahl ist er der Mittelwert der beiden mittleren Werte.', 'The median is in the middle of the ordered list. With an even count it is the mean of the two middle values.') },
  { at: 3300, title: L('Quartile', 'Quartiles'), text: L('Der Median teilt die Liste in zwei Hälften. Q₁ ist der Median der unteren, Q₃ der Median der oberen Hälfte.', 'The median splits the list into two halves. Q₁ is the median of the lower half, Q₃ that of the upper half.') },
  { at: 5000, title: L('Box', 'Box'), text: L('Die Box reicht von Q₁ bis Q₃. In ihr liegt etwa die mittlere Hälfte der Werte; ihre Breite ist der Quartilsabstand.', 'The box goes from Q₁ to Q₃. It holds about the middle half of the values; its width is the interquartile range.') },
  { at: 6400, title: L('Antennen', 'Whiskers'), text: L('Die Antennen (Whisker) reichen bis zum kleinsten und größten Wert. Zusammen: die Spannweite.', 'The whiskers reach to the smallest and largest value. Together: the range.') },
  { at: 7800, title: L('Mittelwert', 'Mean'), text: L('Zum Vergleich: der Mittelwert x̄ = Summe : Anzahl. Wie ein Schwerpunkt hält er den Zahlenstrahl im Gleichgewicht.', 'For comparison: the mean x̄ = sum ÷ count. Like a centre of mass it balances the number line.') },
];
const BUILD_END = 9200;

/* ------------------------------------------------------------------ */
/* Weich gleitende Werte                                               */
/* ------------------------------------------------------------------ */

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
  go(to: number, ms = 600, fn: (t: number) => number = ease.inOutCubic, delay = 0): void {
    if (to === this.to && !this.busy(performance.now())) return;
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

/** Animierter Zustand eines Datenpunkts. */
interface Dot {
  v: Glide;
  lvl: Glide;
  rank: Glide;
  pop: Glide;
}

interface Geo {
  W: number;
  H: number;
  wide: boolean;
  C: Rect;
  panel: Rect;
  ax0: number;
  ax1: number;
  axisY: number;
  /** Je Gruppe: Band der Punkte (unten = Grundlinie) und Mitte der Box. */
  bands: { top: number; base: number; boxY: number; boxH: number }[];
  /** Zeile mit den Kennwert-Beschriftungen unter der Box (nur eine Gruppe). */
  labY: number;
  /** Geordnete Liste. */
  row: Rect | null;
}

/**
 * Mittelwert, Median und Boxplot: Datenpunkte auf dem Zahlenstrahl ziehen,
 * antippen zum Ergänzen; Rangliste, Median, Quartile, Boxplot und
 * Mittelwert folgen live und weich. „Schritt für Schritt“ baut den Boxplot
 * aus der geordneten Liste auf. Im Vergleichsmodus zwei Gruppen
 * übereinander auf einer gemeinsamen Achse.
 */
export default defineSimulation({
  id: 'boxplot',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [
    { id: 'data', label: L('Daten', 'Data') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Modus', 'Mode'),
      options: [
        { value: 'one', label: L('Eine Gruppe', 'One group') },
        { value: 'cmp', label: L('Zwei Gruppen vergleichen', 'Compare two groups') },
      ],
      default: 'one',
    },
    {
      key: 'ctx',
      type: 'choice',
      label: L('Daten', 'Data'),
      options: [
        { value: 'test', label: L('Punkte in der Probe', 'Test points') },
        { value: 'geld', label: L('Taschengeld', 'Pocket money') },
        { value: 'sprung', label: L('Weitsprung', 'Long jump') },
        { value: 'weg', label: L('Schulweg', 'Way to school') },
        { value: 'own', label: L('Eigene Daten', 'Own data') },
      ],
      default: 'test',
    },
    {
      key: 'd',
      type: 'text',
      group: 'data',
      label: L('Werte', 'Values'),
      default: '',
      maxLength: 240,
      placeholder: L('z. B. 12; 15; 18 (leer: Beispieldaten)', 'e.g. 12; 15; 18 (empty: sample data)'),
      help: L('Werte mit Semikolon oder Leerzeichen trennen, Dezimalkomma erlaubt. Höchstens 30 Werte.', 'Separate values with semicolons or spaces. At most 30 values.'),
    },
    {
      key: 'd2',
      type: 'text',
      group: 'data',
      label: L('Werte der zweiten Gruppe', 'Values of the second group'),
      default: '',
      maxLength: 240,
      placeholder: L('z. B. 10; 14; 20', 'e.g. 10; 14; 20'),
      visibleIf: (v) => v.mode === 'cmp',
    },
    { key: 'box', type: 'boolean', group: 'view', label: L('Boxplot', 'Box plot'), default: true },
    { key: 'mean', type: 'boolean', group: 'view', label: L('Mittelwert', 'Mean'), default: true },
    { key: 'rank', type: 'boolean', group: 'view', label: L('Geordnete Liste', 'Ordered list'), default: true, visibleIf: (v) => v.mode === 'one' },
    { key: 'pct', type: 'boolean', group: 'view', label: L('Viertel der Werte (25 %)', 'Quarters of the data (25 %)'), default: false },
    {
      key: 'out',
      type: 'boolean',
      group: 'view',
      label: L('Ausreißer kennzeichnen', 'Mark outliers'),
      default: false,
      help: L('Ausreißer: mehr als das 1,5-Fache des Quartilsabstands außerhalb der Box. Die Antennen enden dann beim letzten Wert davor.', 'Outliers: more than 1.5 times the interquartile range outside the box. The whiskers then stop at the last value inside.'),
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Kennwerte anzeigen', 'Show statistics'), default: true },
  ],
  actions: [
    { id: 'build', label: L('Schritt für Schritt', 'Step by step'), primary: true, visibleIf: (v) => v.mode === 'one' },
    { id: 'add', label: L('Wert hinzufügen', 'Add a value') },
    { id: 'del', label: L('Wert entfernen', 'Remove a value') },
  ],
  readouts: [
    { key: 'sorted', label: L('Geordnete Liste', 'Ordered list'), spoiler: true },
    { key: 'five', label: L('Fünf Kennwerte', 'Five-number summary'), spoiler: true },
    { key: 'mean', label: L('Mittelwert', 'Mean'), spoiler: true },
    { key: 'spread', label: L('Streuung', 'Spread'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Mathe-Probe der 7a', 'Maths test of class 7a'), values: {} },
    { id: 'outlier', label: L('Ausreißer: Mittelwert ≠ Median', 'Outlier: mean ≠ median'), values: { ctx: 'geld', out: true } },
    { id: 'even', label: L('Gerade Anzahl: Weitsprung', 'Even count: long jump'), values: { ctx: 'sprung' } },
    { id: 'cmp', label: L('Gleicher Median, andere Streuung', 'Same median, different spread'), values: { mode: 'cmp', pct: true } },
    { id: 'train', label: L('Vergleich: Training wirkt?', 'Comparison: does training help?'), values: { mode: 'cmp', ctx: 'sprung' } },
    { id: 'skew', label: L('Schulweg: lange Antenne', 'Way to school: long whisker'), values: { ctx: 'weg', pct: true } },
  ],
  strings: {
    de: { canvas: 'Zahlenstrahl mit ziehbaren Datenpunkten, darunter der Boxplot mit Minimum, Quartilen, Median und Maximum, dazu Mittelwert und geordnete Liste; daneben die Kennwerte' },
    en: { canvas: 'Number line with draggable data points, below it the box plot with minimum, quartiles, median and maximum, plus the mean and the ordered list; statistics beside it' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const G = (v: number) => new Glide(v, reduced);

    /* ---------------- Daten ---------------- */
    const cdef = () => CONTEXTS[p.ctx as ContextId];
    const mode = () => p.mode as Mode;
    const groupCount = () => (mode() === 'cmp' ? 2 : 1);
    const textOf = (gi: number) => (gi === 0 ? p.d : p.d2);
    const defaultsOf = (gi: number) => (gi === 0 ? cdef().a : cdef().b);

    /** Wirksame Werte einer Gruppe (leeres Feld: Beispieldaten). */
    function valuesOf(gi: number): number[] {
      const c = cdef();
      const raw = textOf(gi).trim() === '' ? defaultsOf(gi).slice() : parseData(textOf(gi));
      if (c.id === 'own') {
        const step = autoRange(raw).step;
        return raw.map((v) => snap(v, step));
      }
      return clampData(raw, c.min, c.max, c.step);
    }

    /** Bereich, Raster und Striche des Zahlenstrahls. */
    function axisOf(all: number[]): { min: number; max: number; step: number; tick: number; dec: number } {
      const c = cdef();
      if (c.id !== 'own') return { min: c.min, max: c.max, step: c.step, tick: c.tick, dec: c.dec };
      const r = autoRange(all);
      return { ...r, dec: Math.round(-Math.log10(r.step)) };
    }

    let data: number[][] = [valuesOf(0)];
    let sums: Summary[] = [summarize(data[0]!)];
    let axis = axisOf(data[0]!);
    /** Beim Ziehen bleibt der Bereich stehen (eigene Daten). */
    let frozenAxis: typeof axis | null = null;

    function readData(): void {
      data = Array.from({ length: groupCount() }, (_, gi) => valuesOf(gi));
      sums = data.map((v) => summarize(v));
      axis = frozenAxis ?? axisOf(data.flat());
    }

    /* ---------------- Animierter Zustand ---------------- */
    let dots: Dot[][] = [[]];
    const axMin = G(axis.min);
    const axMax = G(axis.max);
    /** Kennwerte je Gruppe: min, q1, med, q3, max, mean, whLo, whHi. */
    const stat: Glide[][] = [[], []];
    const STAT_KEYS = ['min', 'q1', 'med', 'q3', 'max', 'mean', 'wlo', 'whi'] as const;
    for (let gi = 0; gi < 2; gi++) for (let k = 0; k < STAT_KEYS.length; k++) stat[gi]!.push(G(0));
    const showBox = G(p.box ? 1 : 0);
    const showMean = G(p.mean ? 1 : 0);
    const showRank = G(p.rank && mode() === 'one' ? 1 : 0);
    const showPct = G(p.pct ? 1 : 0);
    const showOut = G(p.out ? 1 : 0);
    const showVals = G(p.show ? 1 : 0);
    const cmpA = G(mode() === 'cmp' ? 1 : 0);
    /** Anzahl der Werte beim letzten Abgleich (aus 0 Werten: Kennwerte nicht hineingleiten lassen). */
    const prevN = [0, 0];
    let geo: Geo | null = null;
    let now = performance.now();
    let introStart = now + (reduced ? -1e6 : 150);
    let buildStart = -1;
    let sel: { g: number; i: number } | null = null;
    let hover: { g: number; i: number } | null = null;
    let hoverAdd: { g: number; x: number } | null = null;
    let drag: { g: number; i: number; moved: boolean; x0: number } | null = null;
    let sceneKey = `${p.ctx}|${p.mode}`;
    const ripples: { x: number; y: number; t0: number }[] = [];

    const building = () => buildStart >= 0 && now - buildStart < BUILD_END;
    const buildT = () => (building() ? now - buildStart : 1e9);
    /** Fortschritt 0…1 eines Aufbau-Schritts (ohne Aufbau: 1). */
    function stage(k: number, ms = 900): number {
      if (!building()) return 1;
      return ease.inOutCubic(clamp((buildT() - BUILD[k]!.at) / ms, 0, 1));
    }
    function buildStep(): number {
      const t = buildT();
      let k = 0;
      for (let i = 0; i < BUILD.length; i++) if (t >= BUILD[i]!.at) k = i;
      return k;
    }

    function statValues(sm: Summary): number[] {
      const w = whiskers(sm, p.out);
      return [sm.min, sm.q1, sm.med, sm.q3, sm.max, sm.mean, w.lo, w.hi];
    }

    /** Animationsziele an die Daten anpassen (neue Punkte springen herein). */
    function retarget(snapAll = false): void {
      if (!geo) geo = computeGeo();
      const gm = geo;
      while (dots.length < data.length) dots.push([]);
      dots.length = data.length;
      const span = Math.max(1e-9, axis.max - axis.min);
      const pxPer = (gm.ax1 - gm.ax0) / span;
      data.forEach((vals, gi) => {
        const list = dots[gi]!;
        const r = dotRadius(gi);
        const levels = swarmLevels(
          vals.map((v) => v * pxPer),
          2 * r + 1.5,
        );
        const ranks = sortRanks(vals);
        for (let i = 0; i < vals.length; i++) {
          let d = list[i];
          if (!d) {
            d = { v: G(vals[i]!), lvl: G(levels[i]!), rank: G(ranks[i]!), pop: G(0) };
            list[i] = d;
            d.pop.go(1, 520, ease.outBack, snapAll ? 0 : 40);
            if (snapAll) d.pop.snap(1);
          }
          if (snapAll) {
            d.v.snap(vals[i]!);
            d.lvl.snap(levels[i]!);
            d.rank.snap(ranks[i]!);
          } else {
            d.v.go(vals[i]!, drag && drag.g === gi && drag.i === i ? 90 : 520);
            d.lvl.go(levels[i]!, 420, ease.outCubic);
            d.rank.go(ranks[i]!, 650);
          }
        }
        list.length = vals.length;
        const sv = sums[gi]!.n ? statValues(sums[gi]!) : [];
        sv.forEach((v, k) => {
          if (snapAll || !prevN[gi]) stat[gi]![k]!.snap(v);
          else stat[gi]![k]!.go(v, 650);
        });
        prevN[gi] = vals.length;
      });
      if (snapAll) {
        axMin.snap(axis.min);
        axMax.snap(axis.max);
      } else {
        axMin.go(axis.min, 650);
        axMax.go(axis.max, 650);
      }
      showBox.go(p.box ? 1 : 0, 450);
      showMean.go(p.mean ? 1 : 0, 450);
      showRank.go(p.rank && mode() === 'one' ? 1 : 0, 450);
      showPct.go(p.pct ? 1 : 0, 450);
      showOut.go(p.out ? 1 : 0, 450);
      showVals.go(p.show ? 1 : 0, 350);
      cmpA.go(mode() === 'cmp' ? 1 : 0, 650);
    }

    /* ---------------- Geometrie ---------------- */
    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      let C: Rect;
      let panel: Rect;
      if (wide) {
        const pw = Math.round(clamp(W * 0.27, 205, 290));
        C = { x: 6, y: 6, w: W - pw - 20, h: H - 12 };
        panel = { x: C.x + C.w + 8, y: 6, w: pw, h: H - 12 };
      } else {
        const ch = Math.round(H * 0.6);
        C = { x: 4, y: 4, w: W - 8, h: ch };
        panel = { x: 4, y: C.y + ch + 8, w: W - 8, h: H - ch - 12 };
      }
      const pad = C.w < 420 ? 20 : 30;
      const ax0 = C.x + pad;
      const ax1 = C.x + C.w - pad;
      const head = 52;
      const cmp = mode() === 'cmp';
      const bands: Geo['bands'] = [];
      let axisY: number;
      let labY = 0;
      let row: Rect | null = null;
      if (!cmp) {
        const rowH = p.rank ? clamp(C.h * 0.13, 46, 62) : 0;
        const labH = 44;
        const boxH = clamp(C.h * 0.085, 26, 46);
        const bottom = C.y + C.h - 10 - rowH;
        labY = bottom - labH / 2 - 2;
        const boxY = labY - labH / 2 - 6 - boxH / 2;
        axisY = boxY - boxH / 2 - 34;
        bands.push({ top: C.y + head + 4, base: axisY - 3, boxY, boxH });
        if (p.rank) row = { x: C.x + 14, y: C.y + C.h - rowH - 6, w: C.w - 28, h: rowH };
      } else {
        axisY = C.y + C.h - 36;
        const top = C.y + head + 2;
        const each = (axisY - 8 - top) / 2;
        const boxH = clamp(each * 0.2, 22, 38);
        for (let gi = 0; gi < 2; gi++) {
          const t0 = top + gi * each;
          const boxY = t0 + each - boxH / 2 - 20;
          bands.push({ top: t0 + 22, base: boxY - boxH / 2 - 10, boxY, boxH });
        }
      }
      return { W, H, wide, C, panel, ax0, ax1, axisY, bands, labY, row };
    }

    function dotRadius(gi: number): number {
      const gm = geo!;
      const b = gm.bands[gi]!;
      const span = Math.max(1e-9, axis.max - axis.min);
      const pxPer = (gm.ax1 - gm.ax0) / span;
      // erst grob mit großem Radius stapeln, dann so wählen, dass alles ins Band passt
      let r = gm.C.w < 420 ? 7.5 : gm.C.w < 600 ? 9.5 : 11;
      for (let it = 0; it < 6; it++) {
        const lv = swarmLevels(
          data[gi]!.map((v) => v * pxPer),
          2 * r + 1.5,
        );
        const maxL = Math.max(0, ...lv) + 1;
        const avail = b.base - b.top - (mode() === 'one' ? 34 : 4);
        const need = maxL * (2 * r + 1.5);
        if (need <= avail || r <= 3.5) break;
        r = Math.max(3.5, r * Math.max(0.7, Math.sqrt(avail / need)));
      }
      return r;
    }

    const xOf = (v: number) => {
      const gm = geo!;
      const lo = axMin.at(now);
      const hi = axMax.at(now);
      return gm.ax0 + ((v - lo) / Math.max(1e-9, hi - lo)) * (gm.ax1 - gm.ax0);
    };
    const valueAt = (px: number) => {
      const gm = geo!;
      return axis.min + ((px - gm.ax0) / (gm.ax1 - gm.ax0)) * (axis.max - axis.min);
    };

    /* ---------------- Farben und Texte ---------------- */
    const C_MED = () => ctx.theme.series[0]!;
    const C_MEAN = () => ctx.theme.series[1]!;
    const C_Q = () => ctx.theme.series[2]!;
    const C_OUT = () => ctx.theme.series[3]!;
    const groupColor = (gi: number) => (gi === 0 ? ctx.theme.series[0]! : ctx.theme.series[3]!);
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const unit = () => cdef().unit;
    const withUnit = (s: string) => (unit() ? `${s} ${unit()}` : s);
    /** Datenwert (Genauigkeit der Daten). */
    const vText = (v: number) => (axis.dec > 0 ? fmt.fixed(v, axis.dec) : fmt.num(v, 0));
    /** Kennwert (eine Stelle mehr, weil Median/Quartile zwischen zwei Werten liegen können). */
    const sText = (v: number) => fmt.num(v, axis.dec + 1);
    const mText = (v: number) => fmt.num(v, Math.max(2, axis.dec + 1));
    /** „=“, wenn der Mittelwert mit den angezeigten Stellen exakt ist, sonst „≈“. */
    const meanRel = (v: number) => {
      const d = Math.max(2, axis.dec + 1);
      return Math.abs(v - Number(v.toFixed(d))) < 1e-9 ? '=' : '≈';
    };
    /** Negative Zahl hinter einem Minuszeichen einklammern: 2 − (−3). */
    const par = (v: number, f: (x: number) => string) => (v < 0 ? `(${f(v)})` : f(v));

    function font(weight: number, size: number): string {
      return `${weight} ${size}px ${ctx.theme.font}`;
    }

    function halo(value: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', a = 1): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = alpha(cardBg(), 0.92);
      g.strokeText(value, x, y);
      g.fillStyle = color;
      g.fillText(value, x, y);
      g.restore();
    }

    function wrap(value: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
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

    /** Kleine farbige Marke mit Text (z. B. „Me = 20“). */
    function pill(value: string, cx: number, cy: number, color: string, a = 1, size = 12): Rect {
      const g = surface.g;
      const f = font(800, size);
      g.font = f;
      const w = g.measureText(value).width + 14;
      const h = size + 9;
      const x = cx - w / 2;
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = alpha(color, 0.35);
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, x, cy - h / 2, w, h, h / 2);
      g.fillStyle = color;
      g.fill();
      g.restore();
      text(g, value, cx, cy + 0.5, { font: f, color: '#ffffff' });
      return { x, y: cy - h / 2, w, h };
    }

    /* ---------------- Zeichnen: Kopf und Achse ---------------- */
    function drawHeader(A: number): void {
      const g = surface.g;
      const gm = geo!;
      const C = gm.C;
      const small = C.w < 430;
      g.save();
      g.globalAlpha = A;
      const tx = TEXTS[cdef().id];
      const title = unit() ? `${T(tx.title)} (${tt('in', 'in')} ${unit()})` : T(tx.title);
      halo(title, C.x + 18, C.y + 22, font(750, small ? 14 : 16), ctx.theme.text, 'left');
      const n = data.map((v) => v.length);
      const sub =
        mode() === 'cmp'
          ? `${T(tx.groups[0])}: n = ${n[0]} · ${T(tx.groups[1])}: n = ${n[1]}`
          : `n = ${n[0]} ${n[0] === 1 ? tt('Wert', 'value') : tt('Werte', 'values')}${small ? '' : tt(' · Punkte ziehen, Zahlenstrahl antippen', ' · drag points, tap the line')}`;
      halo(sub, C.x + 18, C.y + 41, font(550, small ? 11 : 12), ctx.theme.muted, 'left');
      g.restore();
    }

    function drawAxis(A: number): void {
      const g = surface.g;
      const gm = geo!;
      const theme = ctx.theme;
      const y = gm.axisY;
      const lo = axMin.at(now);
      const hi = axMax.at(now);
      g.save();
      g.globalAlpha = A;
      // Zahlenstrahl als leicht plastische Leiste
      const grad = g.createLinearGradient(0, y - 3, 0, y + 4);
      grad.addColorStop(0, alpha(theme.axis, 0.95));
      grad.addColorStop(1, alpha(theme.axis, 0.7));
      g.fillStyle = grad;
      roundRect(g, gm.ax0 - 10, y - 2, gm.ax1 - gm.ax0 + 20, 4, 2);
      g.fill();
      g.beginPath();
      g.moveTo(gm.ax1 + 16, y);
      g.lineTo(gm.ax1 + 8, y - 5);
      g.lineTo(gm.ax1 + 8, y + 5);
      g.closePath();
      g.fill();
      // Striche: fein im Raster (falls nicht zu dicht), beschriftet im Tick-Abstand
      const pxPer = (gm.ax1 - gm.ax0) / Math.max(1e-9, hi - lo);
      let tick = axis.tick;
      while (tick * pxPer < (gm.C.w < 430 ? 34 : 42)) tick *= 2;
      const minor = axis.step * pxPer >= 7 ? axis.step : tick / 5;
      if (minor * pxPer >= 6) {
        g.strokeStyle = alpha(theme.axis, 0.45);
        g.lineWidth = 1;
        g.beginPath();
        for (const t of ticksBetween(lo, hi, minor)) {
          const x = xOf(t);
          g.moveTo(x, y + 2);
          g.lineTo(x, y + 6);
        }
        g.stroke();
      }
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.6;
      const meanX = sums[0]!.n && mode() === 'one' ? xOf(stat[0]![5]!.at(now)) : -1e9;
      const meanA = showMean.at(now) * stage(5, 600);
      for (const t of ticksBetween(lo, hi, tick)) {
        const x = xOf(t);
        g.beginPath();
        g.moveTo(x, y + 2);
        g.lineTo(x, y + 9);
        g.stroke();
        // Zahl unter dem Mittelwert-Dreieck ausblenden
        const fade = 1 - meanA * clamp(1 - (Math.abs(x - meanX) - 10) / 10, 0, 1);
        if (fade > 0.02) halo(fmt.num(t, 2), x, y + 20, font(600, 11.5), theme.muted, 'center', fade);
      }
      g.restore();
    }

    /* ---------------- Zeichnen: Punkte ---------------- */
    function dotColor(gi: number, v: number): { fill: string; ring: string } {
      const theme = ctx.theme;
      const sm = sums[gi]!;
      if (mode() === 'cmp') {
        const c = groupColor(gi);
        return { fill: c, ring: shade(c, -0.25) };
      }
      const inBox = sm.n > 0 && v >= sm.q1 - 1e-9 && v <= sm.q3 + 1e-9;
      const boxA = showBox.at(now) * stage(3);
      const base = theme.series[0]!;
      const pale = theme.dark ? mixColor(base, theme.muted, 0.6) : shade(base, 0.45);
      const c = inBox ? base : boxA > 0.5 ? pale : base;
      return { fill: c, ring: shade(c, theme.dark ? 0.2 : -0.25) };
    }

    function dotPos(gi: number, i: number, r: number): { x: number; y: number } {
      const b = geo!.bands[gi]!;
      const d = dots[gi]![i]!;
      return { x: xOf(d.v.at(now)), y: b.base - r - d.lvl.at(now) * (2 * r + 1.5) };
    }

    function drawDots(gi: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const list = dots[gi]!;
      const r = dotRadius(gi);
      const sm = sums[gi]!;
      const outs = p.out && sm.n ? whiskers(sm, true).outliers : [];
      const outA = showOut.at(now);
      // Ordnen: Punkte verblassen leicht, während die Kärtchen nach unten wandern
      const fadeBuild = building() ? 1 - 0.45 * (1 - stage(1, 700)) * stage(0, 300) : 1;
      for (let i = 0; i < list.length; i++) {
        const d = list[i]!;
        const intro = introOf(gi, i);
        if (intro <= 0) continue;
        const { x, y: y1 } = dotPos(gi, i, r);
        const y = y1 - (1 - intro) * 120;
        const isSel = sel?.g === gi && sel.i === i;
        const isHover = hover?.g === gi && hover.i === i;
        const v = d.v.at(now);
        const rr = r * d.pop.at(now) * (isSel || isHover ? 1.18 : 1);
        if (rr <= 0.2) continue;
        const col = dotColor(gi, data[gi]![i] ?? v);
        g.save();
        g.globalAlpha = A * clamp(intro * 1.5, 0, 1) * fadeBuild;
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : alpha(col.ring, 0.35);
        g.shadowBlur = 6;
        g.shadowOffsetY = 2;
        const grad = g.createRadialGradient(x - rr * 0.35, y - rr * 0.4, rr * 0.1, x, y, rr);
        grad.addColorStop(0, shade(col.fill, 0.35));
        grad.addColorStop(1, col.fill);
        g.beginPath();
        g.arc(x, y, rr, 0, Math.PI * 2);
        g.fillStyle = grad;
        g.fill();
        g.shadowColor = 'transparent';
        g.lineWidth = 1.2;
        g.strokeStyle = col.ring;
        g.stroke();
        const isOut = outs.some((o) => Math.abs(o - (data[gi]![i] ?? NaN)) < 1e-9);
        if (isOut && outA > 0.01) {
          g.globalAlpha *= outA;
          g.lineWidth = 2.4;
          g.strokeStyle = C_OUT();
          g.beginPath();
          g.arc(x, y, rr + 3.2, 0, Math.PI * 2);
          g.stroke();
        }
        if (isSel) {
          g.lineWidth = 2;
          g.strokeStyle = theme.text;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.arc(x, y, rr + 4, 0, Math.PI * 2);
          g.stroke();
          g.setLineDash([]);
        }
        g.restore();
      }
      // gewählter Punkt: Wert anschreiben
      const s = sel ?? hover;
      if (s && s.g === gi && list[s.i] && !building()) {
        const { x, y } = dotPos(gi, s.i, r);
        pill(withUnit(vText(data[gi]![s.i]!)), clamp(x, geo!.C.x + 40, geo!.C.x + geo!.C.w - 40), y - r - 16, theme.text, A * 0.92, 11.5);
      }
    }

    function introOf(gi: number, i: number): number {
      if (reduced) return 1;
      const t = (now - introStart - (gi * 8 + i) * 38) / 650;
      return clamp(ease.outCubic(clamp(t, 0, 1)), 0, 1);
    }
    const introAll = () => (reduced ? 1 : clamp((now - introStart - 250) / 700, 0, 1));

    /* ---------------- Zeichnen: Mittelwert und Median im Punktband ---------------- */
    function drawGuides(A: number): void {
      if (mode() !== 'one' || !sums[0]!.n) return;
      const g = surface.g;
      const gm = geo!;
      const b = gm.bands[0]!;
      const medA = A * showBox.at(now) * stage(1) * introAll();
      const meanA = A * showMean.at(now) * stage(5) * introAll();
      const xm = xOf(stat[0]![2]!.at(now));
      const xa = xOf(stat[0]![5]!.at(now));
      const vis = showVals.at(now);
      const labMed = vis > 0.5 ? `Me = ${sText(stat[0]![2]!.at(now))}` : 'Me';
      const labMean = vis > 0.5 ? `x̄ = ${mText(stat[0]![5]!.at(now))}` : 'x̄';
      // Marken knapp über dem höchsten Punktestapel
      const r0 = dotRadius(0);
      const maxL = Math.max(0, ...dots[0]!.map((d) => d.lvl.target));
      const yTop = Math.max(b.top + 12, b.base - (maxL + 1) * (2 * r0 + 1.5) - 52);
      // Pillen nebeneinander halten
      g.font = font(800, 12);
      const wMed = g.measureText(labMed).width + 14;
      const wMean = g.measureText(labMean).width + 14;
      const clampX = (x: number, w: number) => clamp(x, gm.C.x + 10 + w / 2, gm.C.x + gm.C.w - 10 - w / 2);
      const pxMed = clampX(xm, wMed);
      const pxMean = clampX(xa, wMean);
      let yMean = yTop;
      if (medA > 0.01 && meanA > 0.01 && Math.abs(pxMed - pxMean) < (wMed + wMean) / 2 + 4) yMean = yTop + 24;
      g.save();
      g.lineWidth = 1.6;
      g.setLineDash([5, 5]);
      if (medA > 0.01) {
        g.globalAlpha = medA * 0.75;
        g.strokeStyle = C_MED();
        g.beginPath();
        g.moveTo(xm, yTop + 10);
        g.lineTo(xm, gm.axisY);
        g.stroke();
      }
      if (meanA > 0.01) {
        g.globalAlpha = meanA * 0.75;
        g.strokeStyle = C_MEAN();
        g.beginPath();
        g.moveTo(xa, yMean + 10);
        g.lineTo(xa, gm.axisY);
        g.stroke();
      }
      g.restore();
      if (medA > 0.01) pill(labMed, pxMed, yTop, C_MED(), medA);
      if (meanA > 0.01) {
        pill(labMean, pxMean, yMean, C_MEAN(), meanA);
        // Dreieck unter dem Zahlenstrahl: Hier wäre er im Gleichgewicht
        const drop = building() ? (1 - stage(5, 700)) * -30 : 0;
        g.save();
        g.globalAlpha = meanA;
        g.shadowColor = alpha(C_MEAN(), 0.4);
        g.shadowBlur = 6;
        g.beginPath();
        g.moveTo(xa, gm.axisY + 2 + drop);
        g.lineTo(xa - 9, gm.axisY + 17 + drop);
        g.lineTo(xa + 9, gm.axisY + 17 + drop);
        g.closePath();
        const grad = g.createLinearGradient(0, gm.axisY, 0, gm.axisY + 17);
        grad.addColorStop(0, shade(C_MEAN(), 0.25));
        grad.addColorStop(1, C_MEAN());
        g.fillStyle = grad;
        g.fill();
        g.restore();
      }
    }

    /* ---------------- Zeichnen: Boxplot ---------------- */
    function drawBox(gi: number, A: number): void {
      const sm = sums[gi]!;
      if (!sm.n) return;
      const g = surface.g;
      const gm = geo!;
      const theme = ctx.theme;
      const b = gm.bands[gi]!;
      const st = stat[gi]!;
      const [, q1, med, q3, , mu, wlo, whi] = st.map((s) => s.at(now)) as [number, number, number, number, number, number, number, number];
      const boxA = A * showBox.at(now) * introAll();
      if (boxA < 0.01) return;
      const cmp = mode() === 'cmp';
      const col = cmp ? groupColor(gi) : C_MED();
      const y = b.boxY;
      const h = b.boxH;
      const xm = xOf(med);
      const grow = stage(3);
      const x1 = lerp(xm, xOf(q1), grow);
      const x3 = lerp(xm, xOf(q3), grow);
      const wg = stage(4);
      const xlo = lerp(x1, xOf(wlo), wg);
      const xhi = lerp(x3, xOf(whi), wg);
      g.save();
      g.globalAlpha = boxA;
      // Antennen
      if (wg > 0.01) {
        g.strokeStyle = theme.axis;
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(xlo, y);
        g.lineTo(x1, y);
        g.moveTo(x3, y);
        g.lineTo(xhi, y);
        g.moveTo(xlo, y - h * 0.28);
        g.lineTo(xlo, y + h * 0.28);
        g.moveTo(xhi, y - h * 0.28);
        g.lineTo(xhi, y + h * 0.28);
        g.stroke();
      }
      // Box mit weichem Schatten und Verlauf
      if (grow > 0.01) {
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : alpha(col, 0.28);
        g.shadowBlur = 12;
        g.shadowOffsetY = 3;
        roundRect(g, x1, y - h / 2, Math.max(0.5, x3 - x1), h, Math.min(7, (x3 - x1) / 2));
        const grad = g.createLinearGradient(0, y - h / 2, 0, y + h / 2);
        grad.addColorStop(0, alpha(col, theme.dark ? 0.42 : 0.3));
        grad.addColorStop(1, alpha(col, theme.dark ? 0.24 : 0.14));
        g.fillStyle = grad;
        g.fill();
        g.restore();
        roundRect(g, x1, y - h / 2, Math.max(0.5, x3 - x1), h, Math.min(7, (x3 - x1) / 2));
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.stroke();
      }
      // Quartile als Marken, bevor die Box wächst
      const qA = stage(2) * (1 - grow);
      if (qA > 0.01) {
        g.save();
        g.globalAlpha = boxA * qA;
        g.strokeStyle = C_Q();
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath();
        for (const xq of [xOf(q1), xOf(q3)]) {
          g.moveTo(xq, y - h / 2);
          g.lineTo(xq, y + h / 2);
        }
        g.stroke();
        g.restore();
      }
      // Median
      const medS = stage(1);
      if (medS > 0.01) {
        g.strokeStyle = shade(col, theme.dark ? 0.15 : -0.3);
        g.lineWidth = 3.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(xm, y - (h / 2 + 3) * medS);
        g.lineTo(xm, y + (h / 2 + 3) * medS);
        g.stroke();
      }
      // Mittelwert als Raute in der Box
      const meanA = showMean.at(now) * stage(5);
      if (meanA > 0.01) {
        const xa = xOf(mu);
        const s = 5.5 * (cmp ? 1 : 0.9);
        g.globalAlpha = boxA * meanA;
        g.fillStyle = C_MEAN();
        g.strokeStyle = cardBg();
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(xa, y - s);
        g.lineTo(xa + s, y);
        g.lineTo(xa, y + s);
        g.lineTo(xa - s, y);
        g.closePath();
        g.fill();
        g.stroke();
      }
      g.restore();
      // Ausreißer als Kringel auf der Boxplot-Linie
      const outA = showOut.at(now) * wg;
      if (p.out && outA > 0.01) {
        const outs = whiskers(sm, true).outliers;
        g.save();
        g.globalAlpha = boxA * outA;
        g.strokeStyle = C_OUT();
        g.lineWidth = 2.2;
        for (const o of outs) {
          g.beginPath();
          g.arc(xOf(o), y, 5, 0, Math.PI * 2);
          g.stroke();
        }
        g.restore();
      }
      // Viertel der Werte
      const pctA = showPct.at(now) * wg * boxA;
      if (pctA > 0.01) {
        const segs: [number, number][] = [
          [xlo, x1],
          [x1, xm],
          [xm, x3],
          [x3, xhi],
        ];
        segs.forEach(([a, c], k) => {
          if (c - a < 30) return;
          // Box-Hälften: Beschriftung in der Box; Antennen: knapp über der Linie
          const inBox = k === 1 || k === 2;
          const yy = cmp ? y + h / 2 + 11 : inBox ? y : y - 9;
          halo('25 %', (a + c) / 2, yy, font(750, 11), theme.muted, 'center', pctA);
        });
      }
    }

    /** Beschriftungen unter dem Boxplot (eine Gruppe). */
    function drawBoxLabels(A: number): void {
      const sm = sums[0]!;
      if (mode() !== 'one' || !sm.n) return;
      const gm = geo!;
      const theme = ctx.theme;
      const boxA = A * showBox.at(now) * introAll();
      if (boxA < 0.01) return;
      const st = stat[0]!.map((s) => s.at(now));
      const vis = showVals.at(now) > 0.5;
      const small = gm.C.w < 430;
      const items: { name: string; v: number; color: string; a: number; dataVal: boolean }[] = [
        { name: 'Min', v: st[0]!, color: theme.text, a: stage(4), dataVal: true },
        { name: 'Q₁', v: st[1]!, color: C_Q(), a: stage(2), dataVal: false },
        { name: 'Me', v: st[2]!, color: C_MED(), a: stage(1), dataVal: false },
        { name: 'Q₃', v: st[3]!, color: C_Q(), a: stage(2), dataVal: false },
        { name: 'Max', v: st[4]!, color: theme.text, a: stage(4), dataVal: true },
      ];
      const g = surface.g;
      const y = gm.labY;
      const fName = font(800, small ? 11 : 12);
      const fVal = font(650, small ? 11 : 11.5);
      // Breiten und Lage: nebeneinander, bei Gedränge auseinanderschieben (Hinweisstriche zeigen die Stelle)
      const placed: { x: number; w: number; row: number }[] = items.map((it) => {
        const label = vis ? (it.dataVal ? vText(it.v) : sText(it.v)) : '?';
        g.font = fVal;
        const wv = g.measureText(label).width;
        g.font = fName;
        const w = Math.max(wv, g.measureText(it.name).width, 20) + 8;
        return { x: xOf(it.v), w, row: 0 };
      });
      const left = gm.C.x + 6;
      const right = gm.C.x + gm.C.w - 6;
      for (let k = 0; k < placed.length; k++) {
        const pl = placed[k]!;
        const prev = placed[k - 1];
        const lo = prev ? prev.x + (prev.w + pl.w) / 2 + 3 : left + pl.w / 2;
        pl.x = Math.max(pl.x, lo);
      }
      for (let k = placed.length - 1; k >= 0; k--) {
        const pl = placed[k]!;
        const next = placed[k + 1];
        const hi = next ? next.x - (next.w + pl.w) / 2 - 3 : right - pl.w / 2;
        pl.x = Math.min(pl.x, hi);
      }
      // Ab hier zeichnen: Verbindungsstriche vom Boxplot zur Beschriftung
      const b = gm.bands[0]!;
      items.forEach((it, k) => {
        const pl = placed[k]!;
        const a = boxA * it.a;
        if (a < 0.01) return;
        const yy = y + (pl.row ? 8 : -6);
        const label = vis ? (it.dataVal ? vText(it.v) : sText(it.v)) : '?';
        g.save();
        g.globalAlpha = a * 0.5;
        g.strokeStyle = it.color;
        g.lineWidth = 1;
        g.setLineDash([2, 3]);
        g.beginPath();
        g.moveTo(xOf(it.v), b.boxY + b.boxH / 2 + 4);
        g.lineTo(pl.x, yy - 9);
        g.stroke();
        g.restore();
        halo(it.name, pl.x, yy - 1, fName, it.color, 'center', a);
        halo(label, pl.x, yy + 12, fVal, theme.muted, 'center', a);
      });
    }

    /* ---------------- Zeichnen: geordnete Liste ---------------- */
    function drawRow(A: number): void {
      const gm = geo!;
      const R = gm.row;
      const sm = sums[0]!;
      if (!R || mode() !== 'one') return;
      const rowA = A * Math.max(showRank.at(now), building() ? 1 : 0) * introAll();
      if (rowA < 0.01) return;
      const g = surface.g;
      const theme = ctx.theme;
      const n = sm.n;
      if (!n) {
        halo(tt('Hier erscheint die geordnete Liste.', 'The ordered list appears here.'), R.x + R.w / 2, R.y + R.h / 2, font(600, 12), theme.muted, 'center', rowA);
        return;
      }
      const gap = n > 20 ? 2 : 4;
      const cw = Math.min(46, (R.w - (n - 1) * gap) / n);
      const total = n * cw + (n - 1) * gap;
      const x0 = R.x + (R.w - total) / 2;
      const ch = Math.min(30, R.h - 18);
      const cy = R.y + R.h - ch / 2 - 4;
      const qr = quartileRanks(n);
      const medS = stage(1);
      const qS = stage(2);
      const sortS = stage(0, 1500);
      const vis = showVals.at(now) > 0.5;
      // Hälften mit Klammern über der Liste
      if (n >= 2 && qS > 0.01) {
        const h = Math.floor(n / 2);
        const halfBracket = (from: number, to: number) => {
          const xa = x0 + from * (cw + gap);
          const xb = x0 + to * (cw + gap) + cw;
          const yb = cy - ch / 2 - 5;
          g.save();
          g.globalAlpha = rowA * qS * 0.75;
          g.strokeStyle = C_Q();
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(xa + 2, yb + 3);
          g.lineTo(xa + 2, yb);
          g.lineTo(xb - 2, yb);
          g.lineTo(xb - 2, yb + 3);
          g.stroke();
          g.restore();
        };
        halfBracket(0, h - 1);
        halfBracket(n - h, n - 1);
      }
      const label = R.w > 360 ? tt('geordnete Liste', 'ordered list') : tt('geordnet', 'ordered');
      halo(label, R.x + 2, R.y + 6, font(700, 11), theme.muted, 'left', rowA * 0.9);
      const list = dots[0]!;
      const r = dotRadius(0);
      const fsize = clamp(cw * 0.42, 9.5, 13);
      for (let i = 0; i < list.length; i++) {
        const d = list[i]!;
        const rk = d.rank.at(now);
        const tx = x0 + rk * (cw + gap);
        let x = tx;
        let y = cy - ch / 2;
        // Aufbau: Kärtchen fliegen aus den Punkten in die Liste
        if (building() && sortS < 1) {
          const dp = dotPos(0, i, r);
          const u = clamp(sortS * 1.3 - (d.rank.target / Math.max(1, n)) * 0.3, 0, 1);
          const e = ease.inOutCubic(u);
          x = lerp(dp.x - cw / 2, tx, e);
          y = lerp(dp.y - ch / 2, cy - ch / 2, e) - Math.sin(e * Math.PI) * 30;
        }
        const rank1 = Math.round(d.rank.target) + 1;
        const isMed = qr.med.includes(rank1);
        const isQ = qr.q1.includes(rank1) || qr.q3.includes(rank1);
        let col = theme.muted;
        let hi = 0;
        if (isMed) {
          col = C_MED();
          hi = medS;
        } else if (isQ) {
          col = C_Q();
          hi = qS;
        }
        const isSel = sel?.g === 0 && sel.i === i;
        g.save();
        g.globalAlpha = rowA * d.pop.at(now);
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        g.shadowBlur = 5;
        g.shadowOffsetY = 1.5;
        roundRect(g, x, y, cw, ch, Math.min(7, cw / 3));
        const base = theme.dark ? shade(theme.bg, 0.13) : '#ffffff';
        g.fillStyle = hi > 0 ? shade(col, theme.dark ? -0.45 : 0.82, 1) : base;
        if (hi > 0 && hi < 1) {
          g.fillStyle = base;
          g.fill();
          g.globalAlpha *= hi;
          g.fillStyle = shade(col, theme.dark ? -0.45 : 0.82, 1);
        }
        g.fill();
        g.shadowColor = 'transparent';
        g.globalAlpha = rowA * d.pop.at(now);
        g.lineWidth = hi > 0.5 || isSel ? 1.8 : 1;
        g.strokeStyle = isSel ? theme.text : hi > 0.5 ? col : alpha(theme.text, 0.18);
        g.stroke();
        g.restore();
        if (cw >= 15 || hi > 0.5) {
          const val = vis || !(isMed || isQ) ? vText(data[0]![i] ?? 0) : '?';
          const fs = cw >= 15 ? fsize : 9;
          text(g, val, x + cw / 2, y + ch / 2 + 0.5, { font: font(hi > 0.5 ? 800 : 650, fs), color: hi > 0.5 ? (theme.dark ? shade(col, 0.4) : shade(col, -0.35)) : theme.text });
        }
      }
      // Median zwischen zwei Kärtchen
      if (n % 2 === 0 && medS > 0.01 && !(building() && sortS < 1)) {
        const xm = x0 + (n / 2) * (cw + gap) - gap / 2;
        g.save();
        g.globalAlpha = rowA * medS;
        g.strokeStyle = C_MED();
        g.lineWidth = 2.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(xm, cy - ch / 2 - 3);
        g.lineTo(xm, cy + ch / 2 + 3);
        g.stroke();
        g.restore();
      }
    }

    /* ---------------- Vergleich: Gruppenschilder ---------------- */
    function drawGroupTags(A: number): void {
      if (mode() !== 'cmp') return;
      const gm = geo!;
      const tx = TEXTS[cdef().id];
      for (let gi = 0; gi < 2; gi++) {
        const b = gm.bands[gi]!;
        const name = T(tx.groups[gi]!);
        const g = surface.g;
        g.font = font(800, 12);
        const w = g.measureText(name).width + 14;
        pill(name, gm.C.x + 16 + w / 2, b.top - 6, groupColor(gi), A, 12);
        if (gi === 1) {
          g.save();
          g.globalAlpha = A * 0.5;
          g.strokeStyle = alpha(ctx.theme.text, 0.12);
          g.setLineDash([4, 5]);
          g.beginPath();
          g.moveTo(gm.C.x + 14, b.top - 20);
          g.lineTo(gm.C.x + gm.C.w - 14, b.top - 20);
          g.stroke();
          g.restore();
        }
        if (!sums[gi]!.n) halo(tt('Noch keine Werte – Zahlenstrahl antippen.', 'No values yet – tap the line.'), gm.C.x + gm.C.w / 2, (b.top + b.base) / 2, font(600, 12), ctx.theme.muted, 'center', A);
      }
    }

    function drawEmpty(A: number): void {
      if (mode() !== 'one' || sums[0]!.n) return;
      const gm = geo!;
      const b = gm.bands[0]!;
      const f = font(600, 13);
      const rows = wrap(tt('Noch keine Werte. Tippe auf den Zahlenstrahl oder gib Werte ein.', 'No values yet. Tap the number line or type values.'), gm.C.w - 60, f);
      rows.forEach((r, i) => halo(r, gm.C.x + gm.C.w / 2, (b.top + b.base) / 2 + (i - (rows.length - 1) / 2) * 18, f, ctx.theme.muted, 'center', A));
    }

    /* ---------------- Tafel mit Kennwerten ---------------- */
    function drawPanel(): void {
      const gm = geo!;
      const R = gm.panel;
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 16);
      g.clip();
      const pad = 14;
      const x0 = R.x + pad;
      const w = R.w - 2 * pad;
      let y = R.y + 22;
      const vis = showVals.at(now);
      const cmp = mode() === 'cmp';
      halo(tt('Kennwerte', 'Statistics'), x0, y, font(800, 14), theme.text, 'left');
      y += 20;
      const rows: { name: string; color: string; vals: string[]; sw: 'dot' | 'line' | 'tri' | 'none'; a?: number }[] = [];
      const S = sums.map((sm, gi) => ({ sm, st: stat[gi]!.map((s) => s.at(now)) }));
      const val = (gi: number, f: (s: { sm: Summary; st: number[] }) => string) => (S[gi] && S[gi]!.sm.n ? f(S[gi]!) : '–');
      const q = (s: string) => (vis > 0.5 ? s : '?');
      const gcount = groupCount();
      const each = (f: (s: { sm: Summary; st: number[] }) => string, hide = true) => Array.from({ length: gcount }, (_, gi) => (hide ? q(val(gi, f)) : val(gi, f)));
      rows.push({ name: tt('Anzahl n', 'Count n'), color: theme.muted, vals: each((s) => String(s.sm.n), false), sw: 'none' });
      rows.push({ name: 'Minimum', color: theme.text, vals: each((s) => vText(s.st[0]!)), sw: 'dot', a: stage(4) });
      rows.push({ name: tt('unteres Quartil Q₁', 'lower quartile Q₁'), color: C_Q(), vals: each((s) => sText(s.st[1]!)), sw: 'line', a: stage(2) });
      rows.push({ name: 'Median', color: C_MED(), vals: each((s) => sText(s.st[2]!)), sw: 'line', a: stage(1) });
      rows.push({ name: tt('oberes Quartil Q₃', 'upper quartile Q₃'), color: C_Q(), vals: each((s) => sText(s.st[3]!)), sw: 'line', a: stage(2) });
      rows.push({ name: 'Maximum', color: theme.text, vals: each((s) => vText(s.st[4]!)), sw: 'dot', a: stage(4) });
      rows.push({ name: tt('Mittelwert x̄', 'mean x̄'), color: C_MEAN(), vals: each((s) => mText(s.st[5]!)), sw: 'tri', a: stage(5) });
      rows.push({ name: tt('Spannweite', 'range'), color: theme.muted, vals: each((s) => vText(s.st[4]! - s.st[0]!)), sw: 'none', a: stage(4) });
      rows.push({ name: tt('Quartilsabstand', 'IQR'), color: theme.muted, vals: each((s) => sText(s.st[3]! - s.st[1]!)), sw: 'none', a: stage(3) });
      const cols = gm.wide ? 1 : 2;
      const tipMin = gm.wide ? 96 : 0;
      const rowH = clamp((R.y + R.h - y - tipMin - 8) / Math.ceil(rows.length / cols), 17, 25);
      const colW = w / cols;
      // Spaltenköpfe im Vergleich
      const valW = cmp ? Math.min(58, colW * 0.24) : Math.min(70, colW * 0.34);
      if (cmp) {
        const tx = TEXTS[cdef().id];
        for (let c = 0; c < cols; c++) {
          for (let gi = 0; gi < 2; gi++) {
            const cx = x0 + c * colW + colW - (1 - gi) * valW - 4;
            let nm = T(tx.groups[gi]!).replace(/^Klasse |^Class |^Gruppe |^Group /, '');
            g.font = font(800, 11);
            while (nm.length > 2 && g.measureText(nm).width > valW - 6) nm = nm.slice(0, -1);
            if (nm !== T(tx.groups[gi]!).replace(/^Klasse |^Class |^Gruppe |^Group /, '')) nm = `${nm}.`;
            halo(nm, cx, y, font(800, 11), groupColor(gi), 'right');
          }
        }
        y += 16;
      }
      const small = R.w < 215 || cols === 2;
      rows.forEach((r, k) => {
        const c = cols === 2 ? (k < Math.ceil(rows.length / 2) ? 0 : 1) : 0;
        const kk = cols === 2 ? k % Math.ceil(rows.length / 2) : k;
        const rx = x0 + c * colW;
        const ry = y + kk * rowH + rowH / 2;
        const a = r.a ?? 1;
        g.save();
        g.globalAlpha = 0.35 + 0.65 * a;
        // Farbmarke
        if (r.sw === 'dot') {
          g.fillStyle = r.color;
          g.beginPath();
          g.arc(rx + 4, ry, 3.2, 0, Math.PI * 2);
          g.fill();
        } else if (r.sw === 'line') {
          g.fillStyle = r.color;
          roundRect(g, rx + 2.5, ry - 6, 3.5, 12, 1.5);
          g.fill();
        } else if (r.sw === 'tri') {
          g.fillStyle = r.color;
          g.beginPath();
          g.moveTo(rx + 4, ry - 5);
          g.lineTo(rx + 9, ry + 4);
          g.lineTo(rx - 1, ry + 4);
          g.closePath();
          g.fill();
        }
        const name = small ? r.name.replace('unteres Quartil ', '').replace('oberes Quartil ', '').replace('lower quartile ', '').replace('upper quartile ', '').replace('Quartilsabstand', 'Q₃ − Q₁').replace('Mittelwert ', '') : r.name;
        text(g, name, rx + 14, ry, { font: font(650, small ? 11.5 : 12.5), color: r.sw === 'none' ? theme.muted : theme.text, align: 'left' });
        r.vals.forEach((v, gi) => {
          const vx = rx + colW - (r.vals.length - 1 - gi) * valW - (cols === 2 && c === 0 ? 12 : 4);
          text(g, v, vx, ry, { font: font(800, small ? 11.5 : 12.5), color: cmp ? groupColor(gi) : r.color === theme.muted ? theme.text : r.color, align: 'right' });
        });
        g.restore();
        if (cols === 1 && (k === 0 || k === 5)) {
          g.save();
          g.strokeStyle = alpha(theme.text, 0.08);
          g.beginPath();
          g.moveTo(rx, ry + rowH / 2);
          g.lineTo(rx + w, ry + rowH / 2);
          g.stroke();
          g.restore();
        }
      });
      y += Math.ceil(rows.length / cols) * rowH + 6;
      // Hinweis unten: Aufbau-Schritt, gewählter Punkt oder Anleitung
      if (gm.wide) {
        const tipY = Math.max(y, R.y + R.h - 120);
        const tipR = { x: x0 - 4, y: tipY, w: w + 8, h: R.y + R.h - tipY - 10 };
        if (tipR.h > 44) drawTip(tipR);
      }
      if (!gm.wide && unit()) halo(tt(`Einheit: ${unit()}`, `Unit: ${unit()}`), R.x + R.w - pad, R.y + 22, font(600, 11), theme.muted, 'right');
      g.restore();
    }

    function tipContent(): { title: string; body: string; color: string } {
      const theme = ctx.theme;
      const sm = sums[0]!;
      if (building()) {
        const k = buildStep();
        const st = BUILD[k]!;
        return { title: `${tt('Schritt', 'Step')} ${k + 1}/${BUILD.length}: ${T(st.title)}`, body: T(st.text), color: [theme.text, C_MED(), C_Q(), C_MED(), theme.axis, C_MEAN()][k]! };
      }
      if (mode() === 'cmp') {
        const [a, b] = sums;
        if (a && b && a.n && b.n && p.show) {
          const tx = TEXTS[cdef().id];
          const wider = b.iqr > a.iqr + 1e-9 ? 1 : a.iqr > b.iqr + 1e-9 ? 0 : -1;
          const wn = T(tx.groups[wider === 1 ? 1 : 0]);
          const body =
            wider < 0
              ? tt('Beide Boxen sind gleich breit: gleiche Streuung der mittleren Hälfte.', 'Both boxes are equally wide: same spread of the middle half.')
              : tt(`Box von ${wn} breiter: Die mittlere Hälfte streut stärker.`, `Box of ${wn} wider: its middle half is more spread out.`);
          return { title: tt('Vergleichen', 'Compare'), body, color: theme.text };
        }
        return { title: tt('Vergleichen', 'Compare'), body: tt('Vergleiche Lage (Median) und Streuung (Breite der Box, Spannweite).', 'Compare centre (median) and spread (box width, range).'), color: theme.text };
      }
      if (sel && sm.n && data[0]![sel.i] !== undefined) {
        const v = data[0]![sel.i]!;
        const rk = sortRanks(data[0]!)[sel.i]! + 1;
        return {
          title: `${tt('Gewählt', 'Selected')}: ${withUnit(vText(v))}`,
          body: tt(`Rangplatz ${rk} von ${sm.n} in der geordneten Liste. Ziehe den Punkt und beobachte Median und Mittelwert.`, `Rank ${rk} of ${sm.n} in the ordered list. Drag the point and watch median and mean.`),
          color: theme.text,
        };
      }
      if (sm.n && p.show && Math.abs(sm.mean - sm.med) > Math.max(sm.iqr * 0.35, 1e-9) && sm.n > 2) {
        return {
          title: tt('Mittelwert ≠ Median', 'Mean ≠ median'),
          body: tt('Einzelne sehr große oder kleine Werte ziehen den Mittelwert mit. Der Median bleibt stabil.', 'A few very large or small values pull the mean along. The median stays put.'),
          color: C_MEAN(),
        };
      }
      return { title: tt('Tipp', 'Tip'), body: tt('Ziehe einen Punkt ganz nach rechts: Der Mittelwert wandert mit, der Median kaum.', 'Drag one point far to the right: the mean follows, the median hardly moves.'), color: theme.text };
    }
    let tipKey = '';
    let tipSwitch = -1e9;
    function drawTip(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const tc = tipContent();
      const key = tc.title;
      if (key !== tipKey) {
        tipKey = key;
        tipSwitch = now;
      }
      const u = reduced ? 1 : clamp((now - tipSwitch) / 380, 0, 1);
      g.save();
      g.globalAlpha = ease.outCubic(u);
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.fillStyle = alpha(tc.color === theme.text ? theme.series[0]! : tc.color, theme.dark ? 0.14 : 0.07);
      g.fill();
      const f = font(800, 12);
      const rowsT = wrap(tc.title, R.w - 20, f);
      let y = R.y + 16 + (1 - u) * 6;
      for (const r of rowsT.slice(0, 2)) {
        text(g, r, R.x + 10, y, { font: f, color: tc.color, align: 'left' });
        y += 15;
      }
      const fb = font(550, 11.5);
      const rows = wrap(tc.body, R.w - 20, fb);
      const maxRows = Math.max(1, Math.floor((R.y + R.h - y - 2) / 14.5));
      if (rows.length > maxRows) rows[maxRows - 1] = `${rows[maxRows - 1]!.replace(/[ ,.:;–]+\S*$/, '')} …`;
      for (const r of rows.slice(0, maxRows)) {
        text(g, r, R.x + 10, y + 2, { font: fb, color: theme.muted, align: 'left' });
        y += 14.5;
      }
      g.restore();
    }

    /** Auf dem Handy: Aufbau-Schritt als Band unten in der Hauptkarte. */
    function drawNarrowStep(): void {
      const gm = geo!;
      if (gm.wide || !building()) return;
      const tc = tipContent();
      const g = surface.g;
      const R = { x: gm.C.x + 10, y: gm.C.y + 48, w: gm.C.w - 20, h: 0 };
      const fb = font(600, 11.5);
      const rows = wrap(`${tc.title} – ${tc.body}`, R.w - 18, fb).slice(0, 3);
      R.h = rows.length * 14.5 + 12;
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fillStyle = alpha(cardBg(), 0.94);
      g.fill();
      g.strokeStyle = alpha(tc.color, 0.5);
      g.stroke();
      rows.forEach((r, i) => text(g, r, R.x + 9, R.y + 13 + i * 14.5, { font: fb, color: ctx.theme.text, align: 'left' }));
      g.restore();
    }

    function drawRipples(): boolean {
      const g = surface.g;
      let busy = false;
      for (let k = ripples.length - 1; k >= 0; k--) {
        const rp = ripples[k]!;
        const u = (now - rp.t0) / 500;
        if (u >= 1) {
          ripples.splice(k, 1);
          continue;
        }
        busy = true;
        g.save();
        g.globalAlpha = (1 - u) * 0.6;
        g.strokeStyle = ctx.theme.series[0]!;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(rp.x, rp.y, 6 + u * 22, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
      return busy;
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const tx = TEXTS[cdef().id];
      const u = (s: string) => withUnit(s);
      const listHtml = (gi: number) => {
        const sm = sums[gi]!;
        if (!sm.n) return '–';
        const qr = quartileRanks(sm.n);
        return sm.sorted
          .map((v, k) => {
            const r = k + 1;
            const t = vText(v);
            if (qr.med.includes(r)) return `<strong>${t}</strong>`;
            if (qr.q1.includes(r) || qr.q3.includes(r)) return `<u>${t}</u>`;
            return t;
          })
          .join('; ');
      };
      if (mode() === 'one') {
        const sm = sums[0]!;
        ctx.readout('sorted', { html: listHtml(0) });
        if (!sm.n) {
          ctx.readout('five', null);
          ctx.readout('mean', null);
          ctx.readout('spread', null);
          return;
        }
        const w = whiskers(sm, p.out);
        const outTxt = p.out && w.outliers.length ? ` · ${tt('Ausreißer', 'outliers')}: ${w.outliers.map(vText).join('; ')}` : '';
        ctx.readout('five', `Min ${vText(sm.min)} · Q₁ ${sText(sm.q1)} · Me ${sText(sm.med)} · Q₃ ${sText(sm.q3)} · Max ${vText(sm.max)}${outTxt}`);
        ctx.readout('mean', { html: `<var>x̄</var> = <span class="frac"><span>${fmt.num(sm.sum, axis.dec)}</span><span>${sm.n}</span></span> ${meanRel(sm.mean)} ${u(mText(sm.mean))}` });
        ctx.readout('spread', `${tt('Spannweite', 'Range')} ${vText(sm.max)} − ${par(sm.min, vText)} = ${u(vText(sm.range))} · ${tt('Quartilsabstand', 'IQR')} ${sText(sm.q3)} − ${par(sm.q1, sText)} = ${u(sText(sm.iqr))}`);
        return;
      }
      const names = [T(tx.groups[0]), T(tx.groups[1])];
      ctx.readout('sorted', { html: names.map((nm, gi) => `${nm}: ${listHtml(gi)}`).join('<br>') });
      const rowsH = sums
        .map((sm, gi) => (sm.n ? `<tr><td>${names[gi]}</td><td>${vText(sm.min)}</td><td>${sText(sm.q1)}</td><td>${sText(sm.med)}</td><td>${sText(sm.q3)}</td><td>${vText(sm.max)}</td></tr>` : `<tr><td>${names[gi]}</td><td colspan="5">–</td></tr>`))
        .join('');
      ctx.readout('five', { html: `<table class="mini-table"><tr><th></th><th>Min</th><th>Q₁</th><th>Me</th><th>Q₃</th><th>Max</th></tr>${rowsH}</table>` });
      ctx.readout('mean', names.map((nm, gi) => `${nm}: ${sums[gi]!.n ? u(mText(sums[gi]!.mean)) : '–'}`).join(' · '));
      ctx.readout('spread', names.map((nm, gi) => `${nm}: ${tt('Spannweite', 'range')} ${sums[gi]!.n ? vText(sums[gi]!.range) : '–'}, ${tt('Quartilsabstand', 'IQR')} ${sums[gi]!.n ? sText(sums[gi]!.iqr) : '–'}`).join(' · '));
    }

    /** Beschreibung der Zeichenfläche für Bildschirmleser (Kennwerte nur, wenn sie angezeigt werden). */
    function updateLabel(): void {
      const tx = TEXTS[cdef().id];
      const names = mode() === 'cmp' ? [T(tx.groups[0]), T(tx.groups[1])] : [''];
      const parts = sums.map((sm, gi) => {
        const head = `${names[gi] ? `${names[gi]}: ` : ''}${sm.n} ${sm.n === 1 ? tt('Wert', 'value') : tt('Werte', 'values')}`;
        if (!sm.n || !p.show) return head;
        return `${head}; Min ${vText(sm.min)}, Q₁ ${sText(sm.q1)}, ${tt('Median', 'median')} ${sText(sm.med)}, Q₃ ${sText(sm.q3)}, Max ${vText(sm.max)}, ${tt('Mittelwert', 'mean')} ${mText(sm.mean)}`;
      });
      const unitTxt = unit() ? ` (${unit()})` : '';
      surface.canvas.setAttribute('aria-label', `${ctx.t('canvas')}. ${T(tx.title)}${unitTxt} – ${parts.join('. ')}.`);
    }

    function updateActions(): void {
      const full = data.every((v) => v.length >= MAX_N);
      ctx.setAction('add', { enabled: !full });
      ctx.setAction('del', { enabled: data.some((v) => v.length > 0), label: sel ? tt('Gewählten Wert entfernen', 'Remove selected value') : tt('Wert entfernen', 'Remove a value') });
      ctx.setAction('build', { enabled: sums[0]!.n > 0 });
    }

    /* ---------------- Daten schreiben ---------------- */
    function writeGroup(gi: number, values: number[]): void {
      const s = formatData(values, axis.dec, lang);
      ctx.set((gi === 0 ? { d: s } : { d2: s }) as never);
    }

    function addValue(gi: number, v: number): void {
      if (data[gi]!.length >= MAX_N) return;
      const vals = data[gi]!.slice();
      vals.push(snap(clamp(v, axis.min, axis.max), axis.step));
      sel = { g: gi, i: vals.length - 1 };
      writeGroup(gi, vals);
    }

    function removeValue(gi: number, i: number): void {
      const vals = data[gi]!.slice();
      if (i < 0 || i >= vals.length) return;
      vals.splice(i, 1);
      dots[gi]!.splice(i, 1);
      sel = null;
      writeGroup(gi, vals);
    }

    /* ---------------- Zeiger ---------------- */
    function dotAt(px: number, py: number): { g: number; i: number } | null {
      if (!geo) return null;
      let best: { g: number; i: number } | null = null;
      let bd = Infinity;
      for (let gi = 0; gi < data.length; gi++) {
        const r = dotRadius(gi);
        for (let i = 0; i < dots[gi]!.length; i++) {
          const { x, y } = dotPos(gi, i, r);
          const d = Math.hypot(px - x, py - y);
          if (d < Math.max(r + 5, 12) && d < bd) {
            bd = d;
            best = { g: gi, i };
          }
        }
      }
      return best;
    }

    /** Freie Stelle im Punktband oder am Zahlenstrahl → neuer Wert. */
    function addSpot(px: number, py: number): { g: number; x: number } | null {
      if (!geo) return null;
      const gm = geo;
      if (px < gm.ax0 - 8 || px > gm.ax1 + 8) return null;
      for (let gi = 0; gi < gm.bands.length; gi++) {
        const b = gm.bands[gi]!;
        const bottom = gi === gm.bands.length - 1 ? gm.axisY + 12 : b.base + 6;
        if (py >= b.top - 4 && py <= bottom) return { g: gi, x: px };
      }
      return null;
    }

    surface.addTarget({
      contains: (px, py) => !ctx.locked && geo !== null && px >= geo.C.x && px <= geo.C.x + geo.C.w && py >= geo.C.y && py <= geo.C.y + geo.C.h,
      pointerDown: (pt) => {
        if (ctx.locked || !geo || building()) return false;
        const hit = dotAt(pt.px, pt.py);
        if (hit) {
          sel = hit;
          drag = { ...hit, moved: false, x0: pt.px };
          if (cdef().id === 'own') frozenAxis = { ...axis };
          updateReadouts();
          updateActions();
          ctx.requestRender();
          return true;
        }
        const spot = addSpot(pt.px, pt.py);
        if (spot && data[spot.g]!.length < MAX_N) {
          ripples.push({ x: pt.px, y: pt.py, t0: performance.now() });
          addValue(spot.g, valueAt(spot.x));
          return true;
        }
        if (sel) {
          sel = null;
          updateActions();
          ctx.requestRender();
        }
        return true;
      },
      pointerMove: (pt) => {
        if (!drag || !geo) return;
        if (!drag.moved && Math.abs(pt.px - drag.x0) < 3) return;
        drag.moved = true;
        const v = snap(clamp(valueAt(pt.px), axis.min, axis.max), axis.step);
        const vals = data[drag.g]!.slice();
        if (vals[drag.i] === v) return;
        vals[drag.i] = v;
        writeGroup(drag.g, vals);
      },
      pointerUp: () => {
        drag = null;
        if (frozenAxis) {
          frozenAxis = null;
          readData();
          retarget();
        }
        ctx.requestRender();
      },
      hover: (pt) => {
        const h = pt && !ctx.locked && !building() ? dotAt(pt.px, pt.py) : null;
        const a = pt && !h && !ctx.locked && !building() ? addSpot(pt.px, pt.py) : null;
        const changed = h?.g !== hover?.g || h?.i !== hover?.i || (a === null) !== (hoverAdd === null) || (a && hoverAdd && Math.abs(a.x - hoverAdd.x) > 0.5);
        hover = h;
        hoverAdd = a;
        surface.setCursor(h ? (drag ? 'grabbing' : 'grab') : a ? 'copy' : '');
        if (changed) ctx.requestRender();
      },
      wheel: () => false,
    });

    /** Geisterpunkt, wo ein Antippen einen Wert ergänzen würde. */
    function drawAddGhost(): void {
      if (!hoverAdd || !geo || drag) return;
      const gi = hoverAdd.g;
      if (data[gi]!.length >= MAX_N) return;
      const v = snap(clamp(valueAt(hoverAdd.x), axis.min, axis.max), axis.step);
      const x = xOf(v);
      const b = geo.bands[gi]!;
      const r = dotRadius(gi);
      const g = surface.g;
      g.save();
      g.globalAlpha = 0.55;
      g.setLineDash([3, 3]);
      g.strokeStyle = mode() === 'cmp' ? groupColor(gi) : ctx.theme.series[0]!;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, b.base - r - 0.5, r, 0, Math.PI * 2);
      g.stroke();
      g.restore();
      halo(`+ ${withUnit(vText(v))}`, x, b.base - 2 * r - 12, font(700, 11), ctx.theme.muted, 'center', 0.9);
    }

    /* ---------------- Ablauf ---------------- */
    function refresh(snapAll: boolean): void {
      readData();
      if (sel && (sel.g >= data.length || sel.i >= data[sel.g]!.length)) sel = null;
      geo = surface.width > 0 ? computeGeo() : null;
      if (geo) retarget(snapAll);
      updateReadouts();
      updateLabel();
      updateActions();
    }

    refresh(true);

    return {
      update(changed, source) {
        now = performance.now();
        if (source === 'input' && changed.has('ctx')) {
          // anderer Sachzusammenhang: Beispieldaten laden
          ctx.set({ d: '', d2: '' });
        }
        const key = `${p.ctx}|${p.mode}`;
        if (key !== sceneKey) {
          sceneKey = key;
          sel = null;
          dots = [[]];
          buildStart = -1;
          introStart = now + (reduced ? -1e6 : 60);
          readData();
          geo = surface.width > 0 ? computeGeo() : null;
          if (geo) {
            axMin.snap(axis.min);
            axMax.snap(axis.max);
            retarget(true);
            dots.forEach((list) => list.forEach((d) => d.pop.snap(1)));
          }
          updateReadouts();
          updateLabel();
          updateActions();
          ctx.requestRender();
          return;
        }
        if (changed.has('d') || changed.has('d2')) {
          if (!drag) sel = sel && data[sel.g] && sel.i < valuesOf(sel.g).length ? sel : null;
        }
        if (changed.has('rank') || changed.has('mode')) geo = null;
        refresh(source === 'init');
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        if (id === 'build') {
          if (!sums[0]!.n) return;
          sel = null;
          buildStart = reduced ? now - BUILD_END : now;
        } else if (id === 'add') {
          // neuer Wert nahe der Mitte der Daten (reproduzierbar je Anzahl)
          const gi = mode() === 'cmp' && data[1]!.length < data[0]!.length ? 1 : 0;
          const sm = sums[gi]!;
          const n = data[gi]!.length;
          const center = sm.n ? sm.med : (axis.min + axis.max) / 2;
          const spread = sm.n ? Math.max(sm.iqr, (axis.max - axis.min) * 0.1) : (axis.max - axis.min) * 0.2;
          const u = Math.sin((n + 1) * 12.9898 + gi * 78.233) * 43758.5453;
          const r = (u - Math.floor(u)) * 2 - 1;
          addValue(gi, center + r * spread);
        } else if (id === 'del') {
          if (sel) removeValue(sel.g, sel.i);
          else {
            const gi = mode() === 'cmp' && data[1]!.length > data[0]!.length ? 1 : 0;
            if (data[gi]!.length) removeValue(gi, data[gi]!.length - 1);
          }
        }
        updateActions();
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        const sized = !geo || geo.W !== surface.width || geo.H !== surface.height;
        if (sized) {
          geo = computeGeo();
          retarget(true);
        }
        const g = surface.begin();
        const gm = geo!;
        card(gm.C);
        g.save();
        roundRect(g, gm.C.x, gm.C.y, gm.C.w, gm.C.h, 16);
        g.clip();
        const A = reduced ? 1 : clamp((now - introStart + 150) / 300, 0, 1);
        drawHeader(A);
        drawGroupTags(A);
        drawAxis(A);
        drawGuides(A);
        for (let gi = 0; gi < data.length; gi++) drawBox(gi, A);
        drawBoxLabels(A);
        drawRow(A);
        for (let gi = 0; gi < data.length; gi++) drawDots(gi, A);
        drawAddGhost();
        drawEmpty(A);
        drawNarrowStep();
        g.restore();
        const rip = drawRipples();
        drawPanel();
        let busy = rip || building();
        if (buildStart >= 0 && !building()) buildStart = -1;
        if (!busy) busy = dots.some((list) => list.some((d) => d.v.busy(now) || d.lvl.busy(now) || d.rank.busy(now) || d.pop.busy(now)));
        if (!busy) busy = [axMin, axMax, showBox, showMean, showRank, showPct, showOut, showVals, cmpA, ...stat[0]!, ...stat[1]!].some((x) => x.busy(now));
        if (!busy && !reduced) busy = now - introStart < 38 * 40 + 1000 || now - tipSwitch < 400;
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
