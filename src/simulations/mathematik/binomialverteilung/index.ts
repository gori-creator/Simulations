import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, seededRandom, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  bernoulliChain,
  binomialCdfAll,
  binomialCoefficient,
  binomialMean,
  binomialPmfAll,
  binomialSd,
  eventProbability,
  inEvent,
  meanOfCounts,
  N_MAX,
  scientific,
  sigmaBounds,
  sigmaShare,
  type EventKind,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const SLOTS = N_MAX + 1;
const RUN_COUNT = 1000;

/** Exponentielles Nachziehen eines angezeigten Werts (dt in s, tau in s). */
const follow = (v: number, goal: number, dt: number, tau: number) => {
  if (tau <= 0) return goal;
  const nv = v + (goal - v) * (1 - Math.exp(-dt / tau));
  return Math.abs(goal - nv) < 1e-5 * (1 + Math.abs(goal)) ? goal : nv;
};

/** Zeitbasierter, unterbrechbarer Übergang 0 … 1 (z. B. Histogramm ↔ Treppenfunktion). */
class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  constructor(v: number) {
    this.from = v;
    this.to = v;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp01((now - this.t0) / this.ms);
    return this.from + (this.to - this.from) * ease.inOutCubic(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms: number, now: number): void {
    if (to === this.to) return;
    this.from = this.at(now);
    this.to = to;
    this.t0 = now;
    this.ms = ms;
  }
  snap(v: number): void {
    this.from = this.to = v;
    this.ms = 0;
  }
}

interface ChainAnim {
  t0: number;
  chain: boolean[];
  hits: number;
  step: number;
  added: boolean;
}

interface RunAnim {
  t0: number;
  dur: number;
  chains: boolean[][];
  results: number[];
  prevRel: number[];
  finalRel: number[];
  baseTotal: number;
}

type Drag = 'k' | 'a' | 'b';

/**
 * Binomialverteilung B(n; p): Histogramm mit weich wandernden Balken,
 * Erwartungswert μ und σ-Umgebungen. Ereignisse P(X = k), P(X ≤ k),
 * P(X ≥ k) und P(a ≤ X ≤ b) werden farbig markiert, die Grenzen lassen
 * sich direkt am Histogramm ziehen. Eine Formel-Karte rechnet mit
 * eingesetzten Werten, die zweite Ansicht zeigt die Treppenfunktion F(k).
 * Bernoulli-Ketten werden einzeln animiert oder 1000-mal simuliert; die
 * relativen Häufigkeiten erscheinen als Umriss über den Balken.
 */
export default defineSimulation({
  id: 'binomialverteilung',
  dragHint: true,
  layout: { aspect: 1.45, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'n',
      type: 'number',
      label: L('Anzahl der Versuche n', 'Number of trials n'),
      help: L('Länge der Bernoulli-Kette: n unabhängige Versuche mit Treffer oder Niete.', 'Length of the Bernoulli chain: n independent trials, each a success or a failure.'),
      min: 1,
      max: N_MAX,
      step: 1,
      default: 10,
    },
    {
      key: 'p',
      type: 'number',
      label: L('Trefferwahrscheinlichkeit p', 'Probability of success p'),
      help: L('Bei jedem Versuch gleich groß.', 'The same in every trial.'),
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
    },
    {
      key: 'ev',
      type: 'choice',
      label: L('Gesuchte Wahrscheinlichkeit', 'Probability wanted'),
      options: [
        { value: 'eq', label: L('genau k Treffer: P(X = k)', 'exactly k successes: P(X = k)') },
        { value: 'le', label: L('höchstens k Treffer: P(X ≤ k)', 'at most k successes: P(X ≤ k)') },
        { value: 'ge', label: L('mindestens k Treffer: P(X ≥ k)', 'at least k successes: P(X ≥ k)') },
        { value: 'ab', label: L('zwischen a und b: P(a ≤ X ≤ b)', 'between a and b: P(a ≤ X ≤ b)') },
      ],
      default: 'le',
    },
    { key: 'k', type: 'number', label: L('Trefferzahl k', 'Number of successes k'), help: L('Auch direkt am Histogramm ziehen.', 'You can also drag directly on the histogram.'), min: 0, max: N_MAX, step: 1, default: 3, visibleIf: (v) => v.ev !== 'ab' },
    { key: 'a', type: 'number', label: L('Untere Grenze a', 'Lower bound a'), min: 0, max: N_MAX, step: 1, default: 4, visibleIf: (v) => v.ev === 'ab' },
    { key: 'b', type: 'number', label: L('Obere Grenze b', 'Upper bound b'), min: 0, max: N_MAX, step: 1, default: 6, visibleIf: (v) => v.ev === 'ab' },
    {
      key: 'view',
      type: 'choice',
      group: 'view',
      label: L('Darstellung', 'Chart'),
      options: [
        { value: 'pmf', label: L('Histogramm P(X = k)', 'Histogram P(X = k)') },
        { value: 'cdf', label: L('kumuliert: F(k) = P(X ≤ k)', 'cumulative: F(k) = P(X ≤ k)') },
      ],
      default: 'pmf',
    },
    { key: 'sig', type: 'boolean', group: 'view', label: L('Erwartungswert μ und σ-Umgebungen', 'Expected value μ and σ intervals'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse im Bild', 'Results in the picture'), help: L('Aus: Ergebnisse durch „?“ ersetzt (für Aufgaben).', 'Off: results replaced by “?” (for tasks).'), default: true },
  ],
  actions: [
    { id: 'chain', label: L('Eine Bernoulli-Kette', 'One Bernoulli chain'), primary: true },
    { id: 'run', label: L('Experiment 1000-mal', 'Run experiment 1000 times') },
    { id: 'clear', label: L('Experiment löschen', 'Clear experiment') },
  ],
  readouts: [
    { key: 'dist', label: L('Verteilung', 'Distribution') },
    { key: 'res', label: L('Gesuchte Wahrscheinlichkeit', 'Probability wanted'), spoiler: true },
    { key: 'mu', label: L('Erwartungswert und Standardabweichung', 'Expected value and standard deviation'), spoiler: true },
    { key: 'sig', label: L('σ-Umgebungen', 'σ intervals'), spoiler: true },
    { key: 'exp', label: L('Experiment', 'Experiment') },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('B(10; 0,5): höchstens 3 Treffer', 'B(10; 0.5): at most 3 successes'), values: {} },
    { id: 'eq', label: L('B(20; 0,3): genau 6 Treffer', 'B(20; 0.3): exactly 6 successes'), values: { n: 20, p: 0.3, ev: 'eq', k: 6 } },
    { id: 'ge', label: L('B(20; 0,3): mindestens 9 Treffer', 'B(20; 0.3): at least 9 successes'), values: { n: 20, p: 0.3, ev: 'ge', k: 9 } },
    { id: 'ab', label: L('100 Münzwürfe: 40 bis 60-mal Zahl', '100 coin tosses: 40 to 60 heads'), values: { n: 100, p: 0.5, ev: 'ab', a: 40, b: 60 } },
    { id: 'cdf', label: L('Treppenfunktion F(k)', 'Step function F(k)'), values: { n: 20, p: 0.3, ev: 'le', k: 4, view: 'cdf' } },
    { id: 'rare', label: L('Seltene Treffer: p = 0,05', 'Rare successes: p = 0.05'), values: { n: 50, p: 0.05, ev: 'ge', k: 5 } },
  ],
  strings: {
    de: { canvas: 'Histogramm der Binomialverteilung B(n; p) mit markiertem Bereich, Erwartungswert und σ-Umgebungen; daneben die Rechnung mit eingesetzten Werten und eine Bernoulli-Kette aus Treffern und Nieten. Zweite Ansicht: Treppenfunktion F(k).' },
    en: { canvas: 'Histogram of the binomial distribution B(n; p) with a highlighted range, expected value and σ intervals; next to it the calculation with the values inserted and a Bernoulli chain of successes and failures. Second view: the step function F(k).' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const reduced = () => prefersReducedMotion();

    /* ---------- Zustand ---------- */

    const ev = () => p.ev as EventKind;
    const nn = () => p.n;
    const kk = () => Math.min(p.k, p.n);
    const aa = () => Math.min(p.a, p.n);
    const bb = () => Math.min(p.b, p.n);
    const sel = () => ({ k: kk(), a: aa(), b: bb() });

    let pmf = binomialPmfAll(p.n, p.p);
    let cdf = binomialCdfAll(p.n, p.p);
    const shownP = Array.from({ length: SLOTS }, () => 0);
    const shownF = Array.from({ length: SLOTS }, () => 0);
    const hl = Array.from({ length: SLOTS }, () => 0);
    const rel = Array.from({ length: SLOTS }, () => 0);
    let nS = p.n;
    let yMaxS = 0.3;
    let yP = 0.3;
    let muS = binomialMean(p.n, p.p);
    let sdS = binomialSd(p.n, p.p);
    let sigA = p.sig ? 1 : 0;
    /** Umriss der relativen Häufigkeiten erst ab 20 Ketten (vorher springt er zu stark). */
    let freqA = 0;
    const FREQ_MIN = 20;
    let resS = 0;
    const knob = { k: kk(), a: aa(), b: bb() };
    const vt = new Glide(p.view === 'cdf' ? 1 : 0);

    let counts: number[] = Array.from({ length: p.n + 1 }, () => 0);
    let total = 0;
    let lastChain: boolean[] | null = null;
    let chainAnim: ChainAnim | null = null;
    let run: RunAnim | null = null;
    let pulse: { k: number; t0: number } | null = null;
    let seedN = 0;
    const nextRandom = () => seededRandom(20261019 + 7919 * ++seedN);

    let intro: number | null = reduced() ? null : performance.now();
    let cardT0 = -Infinity;
    let lastTime = performance.now();
    let drag: Drag | null = null;
    let hover: number | null = null;

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { ev: s[0]!, mu: s[1]!, hit: s[2]!, freq: s[3]!, sig: s[5]!, comp: s[4]! };
    };
    const neutral = () => mixColor(th().muted, th().bg, th().dark ? 0.45 : 0.55);
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.92)' : 'rgba(255,255,255,0.95)');

    /* ---------- Aufteilung ---------- */

    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { chart: Rect; calc: Rect; chain: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (wide()) {
        const colW = Math.round(Math.min(360, Math.max(232, w * 0.33)));
        const col = { x: w - colW, y: 6, w: colW - 6, h: h - 12 };
        const ch = Math.round((col.h - 10) * 0.56);
        return { chart: { x: 0, y: 0, w: w - colW - 8, h }, calc: { x: col.x, y: col.y, w: col.w, h: ch }, chain: { x: col.x, y: col.y + ch + 10, w: col.w, h: col.h - ch - 10 } };
      }
      const chartH = Math.round(h * 0.47);
      const calcH = Math.round(h * 0.29);
      return { chart: { x: 0, y: 0, w, h: chartH }, calc: { x: 4, y: chartH + 6, w: w - 8, h: calcH }, chain: { x: 4, y: chartH + calcH + 14, w: w - 8, h: h - chartH - calcH - 18 } };
    }
    const textSize = () => {
      const w = surface.width;
      return !wide() ? 12.5 : w < 760 ? 12 : w < 960 ? 12.5 : 13.5;
    };

    /** Innerer Diagrammbereich (ohne Ränder für Beschriftungen). */
    function inner(): Rect {
      const R = regions().chart;
      const left = wide() ? 50 : 44;
      const top = 62;
      const bottom = 64;
      return { x: R.x + left, y: R.y + top, w: R.w - left - 26, h: R.h - top - bottom };
    }
    const X0 = -0.7;
    const xEnd = () => nS + 0.7;
    const X = (k: number) => {
      const r = inner();
      return r.x + ((k - X0) / (xEnd() - X0)) * r.w;
    };
    const kAt = (px: number) => {
      const r = inner();
      return X0 + ((px - r.x) / r.w) * (xEnd() - X0);
    };
    const Y = (v: number) => {
      const r = inner();
      return r.y + r.h - (v / yMaxS) * r.h;
    };
    const unitPx = () => inner().w / (xEnd() - X0);

    /* ---------- Zahlen und Formeln ---------- */

    const sup = (e: number) => (e < 0 ? `−${-e}` : `${e}`);
    /** Zahl als Formel; sehr kleine/große Zahlen in Zehnerpotenz-Schreibweise. */
    function numSrc(v: number, digits = 4): string {
      if (v === 0) return '0';
      const a = Math.abs(v);
      if (a >= 1e-3 && a < 1e6) {
        const d = a >= 1 ? Math.max(0, digits - 1 - Math.floor(Math.log10(a))) : digits + Math.max(0, -Math.floor(Math.log10(a)) - 1);
        return fmt.num(v, Math.min(8, d));
      }
      const s = scientific(v, digits);
      return `${fmt.num(s.m, digits - 1)} · 10^{${sup(s.e)}}`;
    }
    /** Wahrscheinlichkeit auf 4 Nachkommastellen (bei sehr kleinen Werten Zehnerpotenz). */
    function prob(v: number): string {
      if (v === 0) return '0';
      if (v === 1) return '1';
      if (v < 5e-5) return numSrc(v, 3);
      return fmt.fixed(v, 4);
    }
    const exact4 = (v: number) => Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-9;
    const rel4 = (v: number) => (exact4(v) ? '=' : '≈');
    const pTxt = () => fmt.num(p.p, 2);
    const qTxt = () => fmt.num(1 - p.p, 2);
    const coefSrc = (n: number, k: number) => {
      const c = binomialCoefficient(n, k);
      return c < 1e7 ? fmt.num(c, 0) : numSrc(c, 4);
    };
    const evSym = (kind: EventKind, s = sel()) =>
      kind === 'eq' ? `P(X = ${s.k})` : kind === 'le' ? `P(X ≤ ${s.k})` : kind === 'ge' ? `P(X ≥ ${s.k})` : `P(${s.a} ≤ X ≤ ${s.b})`;
    const F = (k: number) => (k < 0 ? 0 : k >= nn() ? 1 : cdf[k]!);
    // ganze Zahl mit echtem Minus (F(−1) bei a = 0 bzw. k = 0)
    const int = (v: number) => fmt.num(v, 0);
    const pct = (v: number) => `${fmt.num(v * 100, 2)} %`;

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: { ev: C().ev, mu: C().mu, sig: C().sig, m: th().muted, hit: C().hit, freq: C().freq } });
    function fit(src: string, maxW: number, size: number, color: string, weight = 600, min = 10): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > min) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /* ---------- Ergebnisse (Text) ---------- */

    const chainsTxt = (N: number) => (N === 1 ? tt('1 Kette', '1 chain') : tt(`${fmt.num(N, 0)} Ketten`, `${fmt.num(N, 0)} chains`));

    function updateReadouts(): void {
      const n = nn();
      const kind = ev();
      const P = eventProbability(n, p.p, kind, sel());
      const mu = binomialMean(n, p.p);
      const sd = binomialSd(n, p.p);
      ctx.readout('dist', { html: `<var>X</var> ~ B(${n}; ${pTxt()})` });
      ctx.readout('res', `${evSym(kind).replace('P(', 'P(')} ${rel4(P)} ${fmt.fixed(P, 4)} (${pct(P)})${kind === 'ab' && aa() > bb() ? tt(' – leerer Bereich', ' – empty range') : ''}`);
      ctx.readout('mu', { html: `μ = <var>n</var> · <var>p</var> = ${fmt.num(mu, 2)}; &nbsp; σ = √(<var>n</var> · <var>p</var> · (1 − <var>p</var>)) ${Math.abs(sd * 1000 - Math.round(sd * 1000)) < 1e-9 ? '=' : '≈'} ${fmt.num(sd, 3)}` });
      const s1 = sigmaBounds(n, p.p, 1);
      const s2 = sigmaBounds(n, p.p, 2);
      ctx.readout('sig', `P(${s1.lo} ≤ X ≤ ${s1.hi}) ≈ ${pct(sigmaShare(n, p.p, 1))} (μ ± σ); P(${s2.lo} ≤ X ≤ ${s2.hi}) ≈ ${pct(sigmaShare(n, p.p, 2))} (μ ± 2σ)`);
      if (!total) ctx.readout('exp', tt('noch keine Bernoulli-Kette', 'no Bernoulli chain yet'));
      else {
        const hits = counts.reduce((s, c, k) => s + (inEvent(kind, k, sel()) ? c : 0), 0);
        ctx.readout('exp', tt(`${chainsTxt(total)}, x̄ ≈ ${fmt.num(meanOfCounts(counts), 2)}, relative Häufigkeit des Ereignisses ≈ ${fmt.fixed(hits / total, 3)}`, `${chainsTxt(total)}, x̄ ≈ ${fmt.num(meanOfCounts(counts), 2)}, relative frequency of the event ≈ ${fmt.fixed(hits / total, 3)}`));
      }
    }

    function syncActions(): void {
      ctx.setAction('chain', { enabled: !ctx.locked && !run });
      ctx.setAction('run', { enabled: !ctx.locked && !run });
      ctx.setAction('clear', { enabled: !ctx.locked && (total > 0 || !!lastChain) && !run });
    }

    /* ---------- Experiment ---------- */

    const relOf = (c: readonly number[], t: number) => Array.from({ length: SLOTS }, (_, k) => (t ? (c[k] ?? 0) / t : 0));

    function clearExperiment(): void {
      counts = Array.from({ length: nn() + 1 }, () => 0);
      total = 0;
      lastChain = null;
      chainAnim = null;
      run = null;
      pulse = null;
    }

    function addResults(results: readonly number[]): void {
      for (const k of results) counts[k] = (counts[k] ?? 0) + 1;
      total += results.length;
    }

    function startChain(now: number): void {
      const chain = bernoulliChain(nn(), p.p, nextRandom());
      const hits = chain.filter(Boolean).length;
      const step = reduced() ? 0 : Math.min(120, 1500 / chain.length);
      chainAnim = { t0: now, chain, hits, step, added: false };
      lastChain = chain;
      if (reduced()) finishChain(now);
    }
    function finishChain(now: number): void {
      if (!chainAnim || chainAnim.added) return;
      chainAnim.added = true;
      addResults([chainAnim.hits]);
      pulse = { k: chainAnim.hits, t0: now };
      updateReadouts();
      syncActions();
    }

    function startRun(now: number): void {
      chainAnim = null;
      const rnd = nextRandom();
      const chains: boolean[][] = [];
      const results: number[] = [];
      for (let i = 0; i < RUN_COUNT; i++) {
        const c = bernoulliChain(nn(), p.p, rnd);
        chains.push(c);
        results.push(c.filter(Boolean).length);
      }
      const prevRel = relOf(counts, total);
      const after = counts.slice();
      for (const k of results) after[k] = (after[k] ?? 0) + 1;
      run = { t0: now, dur: reduced() ? 0 : 2400, chains, results, prevRel, finalRel: relOf(after, total + RUN_COUNT), baseTotal: total };
      if (reduced()) finishRun();
      syncActions();
    }
    function finishRun(): void {
      if (!run) return;
      addResults(run.results);
      lastChain = run.chains[run.chains.length - 1] ?? null;
      for (let k = 0; k < SLOTS; k++) rel[k] = run.finalRel[k]!;
      run = null;
      updateReadouts();
      syncActions();
    }
    const runProgress = (now: number) => (run ? (run.dur <= 0 ? 1 : clamp01((now - run.t0) / run.dur)) : 1);

    /* ---------- Zeiger: Grenzen ziehen, Balken antippen ---------- */

    function pickDrag(k: number): Drag {
      if (ev() !== 'ab') return 'k';
      const da = Math.abs(k - aa());
      const db = Math.abs(k - bb());
      if (da === db) return k <= aa() ? 'a' : 'b';
      return da < db ? 'a' : 'b';
    }
    function setFromPointer(px: number): void {
      if (!drag) return;
      const k = Math.max(0, Math.min(nn(), Math.round(kAt(px))));
      if (drag === 'k' && k !== p.k) ctx.set({ k });
      if (drag === 'a' && k !== p.a) ctx.set({ a: k });
      if (drag === 'b' && k !== p.b) ctx.set({ b: k });
    }
    const inChart = (px: number, py: number) => {
      const R = regions().chart;
      return px >= R.x && px <= R.x + R.w && py >= R.y && py <= R.y + R.h;
    };
    surface.addTarget({
      contains: (px, py) => inChart(px, py),
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        const k = Math.round(kAt(pt.px));
        drag = pickDrag(Math.max(0, Math.min(nn(), k)));
        hover = null;
        surface.setCursor('grabbing');
        setFromPointer(pt.px);
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt) => {
        setFromPointer(pt.px);
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (pt) => {
        let h: number | null = null;
        if (pt) {
          const k = Math.round(kAt(pt.px));
          if (k >= 0 && k <= nn() && Math.abs(kAt(pt.px) - k) < 0.5) h = k;
        }
        surface.setCursor(pt && !ctx.locked ? 'ew-resize' : '');
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------- Zeichnen: Hilfen ---------- */

    function pill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number; clampTo?: Rect } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? textSize();
      const box = opts.maxW ? fit(src, opts.maxW, size, opts.color ?? th().text, 700) : formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.clampTo) left = Math.max(opts.clampTo.x + 10, Math.min(opts.clampTo.x + opts.clampTo.w - 10 - box.w, left));
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      if ((opts.alpha ?? 1) <= 0.01) return rr;
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 9;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 10);
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.5;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 10);
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    function cardFrame(r: Rect, alpha: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.97)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      g.restore();
    }

    function chip(x: number, y: number, src: string, color: string, size: number, align: 'left' | 'right' = 'right', maxW = 400): Rect {
      const g = surface.g;
      const b = fit(src, maxW - 22, size, color, 700);
      const w = b.w + 22;
      const h = size + 10;
      const cx = align === 'right' ? x - w : x;
      g.fillStyle = mixColor(color, th().bg, 0, th().dark ? 0.22 : 0.12);
      roundRect(g, cx, y, w, h, 9);
      g.fill();
      g.fillStyle = color;
      g.beginPath();
      g.arc(cx + 9, y + h / 2, 3.2, 0, TAU);
      g.fill();
      b.draw(g, cx + 16, y + h / 2 + (b.asc - b.desc) / 2);
      return { x: cx, y, w, h };
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const out: string[] = [];
      let line = '';
      for (const w of str.split(' ')) {
        const cand = line ? `${line} ${w}` : w;
        if (line && g.measureText(cand).width > maxW) {
          out.push(line);
          line = w;
        } else line = cand;
      }
      if (line) out.push(line);
      return out;
    }

    const niceStep = (raw: number) => {
      const e = 10 ** Math.floor(Math.log10(raw));
      const f = raw / e;
      return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * e;
    };

    /* ---------- Diagramm ---------- */

    interface K {
      bars: number;
      labels: number;
      cards: number;
      stagger: number;
    }

    function drawChart(now: number, k: K): void {
      const g = surface.g;
      const R = regions().chart;
      const r = inner();
      const c = C();
      const v = vt.at(now);
      const size = textSize();
      const n = nn();
      const unit = unitPx();
      const base = r.y + r.h;
      g.save();
      g.beginPath();
      g.rect(R.x, R.y, R.w, R.h);
      g.clip();

      // Gitter und y-Beschriftung
      const step = niceStep(yMaxS / (r.h > 260 ? 5 : 3.5));
      const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9) + (step / 10 ** Math.floor(Math.log10(step)) === 2.5 ? 1 : 0));
      g.save();
      g.lineWidth = 1;
      for (let y = 0; y <= yMaxS + 1e-9; y += step) {
        const py = Math.round(Y(y)) + 0.5;
        if (py < r.y - 2) break;
        g.strokeStyle = y === 0 ? th().axis : th().grid;
        g.globalAlpha = y === 0 ? 1 : 0.8;
        g.beginPath();
        g.moveTo(r.x - 4, py);
        g.lineTo(r.x + r.w, py);
        g.stroke();
        g.globalAlpha = k.labels;
        const lb = formula(g, fmt.num(y, dec), fstyle(size - 1.5, th().muted, 600));
        lb.draw(g, r.x - 8 - lb.w, py + (lb.asc - lb.desc) / 2);
      }
      g.restore();
      // Achsenbeschriftungen
      g.save();
      g.globalAlpha = k.labels * (1 - v);
      formula(g, 'P(X = k)', fstyle(size - 0.5, th().muted, 700)).draw(g, R.x + 8, R.y + 18);
      g.globalAlpha = k.labels * v;
      formula(g, 'F(k) = P(X ≤ k)', fstyle(size - 0.5, th().muted, 700)).draw(g, R.x + 8, R.y + 18);
      g.globalAlpha = k.labels;
      const kl = formula(g, 'k', fstyle(size + 1, th().muted, 700));
      kl.draw(g, r.x + r.w + 8, base + 1 + (kl.asc - kl.desc) / 2);
      g.restore();

      // σ-Umgebungen (nur Histogramm)
      const sa = sigA * (1 - v) * k.labels;
      if (sa > 0.01) drawSigma(now, sa);

      // Balken
      const bw = Math.max(1, unit * (unit < 5 ? 0.86 : 0.76) * lerp(1, 0.62, v));
      const nb = neutral();
      for (let i = 0; i < SLOTS; i++) {
        const val = lerp(shownP[i]!, shownF[i]!, v);
        if (val <= 0) continue;
        const gk = intro === null ? 1 : ease.outCubic(clamp01(k.bars * 1.6 - (i / Math.max(1, n + 1)) * 0.6));
        const h = (base - Y(val)) * gk;
        if (h < 0.3) continue;
        const x = X(i) - bw / 2;
        const hh = hl[i]!;
        const col = mixColor(mixColor(nb, th().bg, v * 0.45), c.ev, hh);
        const grad = g.createLinearGradient(0, base - h, 0, base);
        grad.addColorStop(0, col);
        grad.addColorStop(1, mixColor(col, th().bg, th().dark ? 0.25 : 0.18));
        g.fillStyle = grad;
        roundRect(g, x, base - h, bw, h, Math.min(3.5, bw / 3, h / 2));
        g.fill();
        if (hover === i && !drag) {
          g.save();
          g.strokeStyle = th().text;
          g.lineWidth = 1.5;
          roundRect(g, x - 1.5, base - h - 1.5, bw + 3, h + 1.5, Math.min(4, bw / 3));
          g.stroke();
          g.restore();
        }
      }
      // Puls nach einer Bernoulli-Kette
      if (pulse) {
        const u = (now - pulse.t0) / 1100;
        if (u >= 1) pulse = null;
        else if (pulse.k <= n) {
          const val = lerp(shownP[pulse.k]!, shownF[pulse.k]!, v);
          g.save();
          g.globalAlpha = (1 - u) * 0.9;
          g.strokeStyle = c.hit;
          g.lineWidth = 3;
          const grow = 4 + 10 * ease.outCubic(u);
          roundRect(g, X(pulse.k) - bw / 2 - grow / 2, Y(val) - grow / 2, bw + grow, base - Y(val) + grow / 2, 5);
          g.stroke();
          g.restore();
        }
      }
      // Werte über den Balken (genug Platz)
      if (p.show && unit >= 38 && k.labels > 0.5) {
        for (let i = 0; i <= n; i++) {
          const val = lerp(pmf[i]!, F(i), v);
          if (val === 0 || (val < 5e-5 && hl[i]! < 0.5)) continue;
          const y = Y(lerp(shownP[i]!, shownF[i]!, v));
          const b = fit(fmt.fixed(val, unit >= 52 ? 4 : 3), unit - 4, size - 2, hl[i]! > 0.5 ? c.ev : th().muted, 700, 9);
          g.save();
          g.globalAlpha = clamp01((k.labels - 0.5) * 2);
          b.draw(g, X(i) - b.w / 2, y - 6);
          g.restore();
        }
      }

      // Treppenfunktion
      if (v > 0.01) drawSteps(v);
      // relative Häufigkeiten als Umriss
      drawFreq(now);
      // μ-Linie über allem
      if (sa > 0.01) drawMu(sa);
      // Grenzen und Griffe
      drawBounds(now, k);
      // k-Achse
      drawKAxis(k);
      // Ergebnis in der Treppenansicht
      if (v > 0.01) drawCdfMarker(v);
      // Hinweis beim Überfahren
      if (hover !== null && !drag && hover <= n) {
        const val = v < 0.5 ? pmf[hover]! : F(hover);
        let src = v < 0.5 ? `P(X = ${hover}) ${rel4(val)} ${prob(val)}` : `F(${hover}) ${rel4(val)} ${prob(val)}`;
        if (total && v < 0.5) src += `,  \\c{freq}{h = ${fmt.fixed((counts[hover] ?? 0) / total, 3)}}`;
        if (!p.show) src = v < 0.5 ? `P(X = ${hover}) = ?` : `F(${hover}) = ?`;
        const y = Math.max(r.y + 14, Y(lerp(shownP[hover]!, shownF[hover]!, v)) - 24);
        pill(X(hover), y, src, { size: size - 0.5, clampTo: R, border: mixColor(th().text, th().bg, 0.6) });
      }
      g.restore();
    }

    function drawSigma(now: number, a: number): void {
      const g = surface.g;
      const r = inner();
      const c = C();
      const size = textSize() - 1;
      const n = nn();
      const rows = [
        { m: 2, y: r.y - 46, fill: 0.07 },
        { m: 1, y: r.y - 21, fill: 0.14 },
      ];
      for (const row of rows) {
        const x1 = Math.max(r.x, X(muS - row.m * sdS));
        const x2 = Math.min(r.x + r.w, X(muS + row.m * sdS));
        g.save();
        g.globalAlpha = a;
        g.fillStyle = mixColor(c.sig, th().bg, 0, (th().dark ? 1.4 : 1) * row.fill);
        g.fillRect(x1, r.y - (row.m === 2 ? 34 : 9), Math.max(1.5, x2 - x1), r.y + r.h - r.y + (row.m === 2 ? 34 : 9));
        g.strokeStyle = mixColor(c.sig, th().bg, 0, 0.55);
        g.lineWidth = 1.2;
        g.setLineDash([4, 4]);
        g.beginPath();
        for (const x of [x1, x2]) {
          g.moveTo(Math.round(x) + 0.5, row.y + 8);
          g.lineTo(Math.round(x) + 0.5, r.y + r.h);
        }
        g.stroke();
        g.setLineDash([]);
        // Klammer mit Anteil
        g.strokeStyle = c.sig;
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(x1, row.y + 8);
        g.lineTo(x1, row.y + 2);
        g.lineTo(x2, row.y + 2);
        g.lineTo(x2, row.y + 8);
        g.stroke();
        g.restore();
        const share = sigmaShare(n, p.p, row.m);
        const s = row.m === 1 ? 'μ ± σ' : 'μ ± 2σ';
        const src = p.show ? `\\c{sig}{${s}}: ${rel4(share)} ${fmt.num(share * 100, 1)} %` : `\\c{sig}{${s}}`;
        const left = regions().chart.x + 112;
        pill((x1 + x2) / 2, row.y + 1, src, { size, alpha: a, clampTo: { x: left, y: 0, w: r.x + r.w + 6 - left, h: 0 } });
      }
      void now;
    }

    function drawMu(a: number): void {
      const g = surface.g;
      const r = inner();
      const c = C();
      const x = X(muS);
      g.save();
      g.globalAlpha = a;
      g.strokeStyle = c.mu;
      g.lineWidth = 2.4;
      g.shadowColor = mixColor(c.mu, th().bg, 0, 0.5);
      g.shadowBlur = 6;
      g.beginPath();
      g.moveTo(x, r.y + 4);
      g.lineTo(x, r.y + r.h);
      g.stroke();
      g.restore();
      const src = p.show ? `\\c{mu}{μ = ${fmt.num(muS, 2)}}` : '\\c{mu}{μ}';
      pill(x, r.y + 14, src, { size: textSize() - 0.5, alpha: a, clampTo: inner(), border: c.mu });
    }

    function drawSteps(v: number): void {
      const g = surface.g;
      const r = inner();
      const c = C();
      const n = nn();
      const unit = unitPx();
      const col = mixColor(c.ev, th().text, 0.35);
      g.save();
      g.globalAlpha = v;
      g.beginPath();
      g.rect(r.x, r.y - 30, r.w, r.h + 30);
      g.clip();
      g.strokeStyle = col;
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(r.x, Y(0));
      g.lineTo(X(0), Y(0));
      for (let i = 0; i <= n; i++) {
        const y = Y(shownF[i]!);
        g.moveTo(X(i), y);
        g.lineTo(i === n ? r.x + r.w : X(i + 1), y);
      }
      g.stroke();
      const rad = Math.max(1.6, Math.min(4.5, unit * 0.26));
      for (let i = 0; i <= n; i++) {
        if (unit >= 7) {
          g.fillStyle = th().bg;
          g.strokeStyle = col;
          g.lineWidth = 1.6;
          g.beginPath();
          g.arc(X(i), Y(i ? shownF[i - 1]! : 0), rad, 0, TAU);
          g.fill();
          g.stroke();
        }
        g.fillStyle = col;
        g.beginPath();
        g.arc(X(i), Y(shownF[i]!), rad, 0, TAU);
        g.fill();
      }
      g.restore();
    }

    function drawFreq(now: number): void {
      if (freqA < 0.01) return;
      let mx = 0;
      for (let i = 0; i < SLOTS; i++) mx = Math.max(mx, rel[i]!);
      if (mx < 1e-4) return;
      const g = surface.g;
      const r = inner();
      const c = C();
      const v = vt.at(now);
      const fade = 1 - v * 0.85;
      const n = Math.max(nn(), Math.ceil(nS));
      g.save();
      g.beginPath();
      g.rect(r.x - 2, r.y - 50, r.w + 4, r.h + 52);
      g.clip();
      g.globalAlpha = fade * freqA;
      g.strokeStyle = c.freq;
      g.lineWidth = 2.4;
      g.lineJoin = 'round';
      g.shadowColor = mixColor(c.freq, th().bg, 0, 0.5);
      g.shadowBlur = 4;
      g.beginPath();
      let prev = 0;
      g.moveTo(X(-0.5), Y(0));
      for (let i = 0; i <= Math.min(N_MAX, n); i++) {
        const y = Math.max(r.y - 46, Y(rel[i]!));
        g.lineTo(X(i - 0.5), Y(prev) < r.y - 46 ? r.y - 46 : Y(prev));
        g.lineTo(X(i - 0.5), y);
        g.lineTo(X(i + 0.5), y);
        prev = rel[i]!;
      }
      g.lineTo(X(Math.min(N_MAX, n) + 0.5), Y(0));
      g.stroke();
      g.restore();
    }

    function drawBounds(now: number, k: K): void {
      const g = surface.g;
      const r = inner();
      const c = C();
      const kind = ev();
      const size = textSize();
      const base = r.y + r.h;
      const lines: number[] = [];
      if (kind === 'eq') lines.push(knob.k - 0.5, knob.k + 0.5);
      if (kind === 'le') lines.push(knob.k + 0.5);
      if (kind === 'ge') lines.push(knob.k - 0.5);
      if (kind === 'ab') lines.push(knob.a - 0.5, knob.b + 0.5);
      g.save();
      g.globalAlpha = 0.75 * k.labels;
      g.strokeStyle = c.ev;
      g.lineWidth = 1.6;
      g.setLineDash([5, 4]);
      g.beginPath();
      for (const x of lines) {
        const px = Math.round(X(x)) + 0.5;
        if (px < r.x - 1 || px > r.x + r.w + 1) continue;
        g.moveTo(px, base + 2);
        g.lineTo(px, r.y + 26);
      }
      g.stroke();
      g.restore();
      // Griffe unter der Achse
      const knobs: { id: Drag; x: number; name: string; val: number }[] = kind === 'ab' ? [
        { id: 'a', x: knob.a, name: 'a', val: aa() },
        { id: 'b', x: knob.b, name: 'b', val: bb() },
      ] : [{ id: 'k', x: knob.k, name: 'k', val: kk() }];
      const y = base + 42;
      const placed: Rect[] = [];
      for (const kb of knobs) {
        const active = drag === kb.id;
        const src = `${kb.name} = ${kb.val}`;
        const box = formula(g, src, fstyle(size, '#ffffff', 800));
        const w = box.w + 18;
        const h = size + 12;
        let x = X(kb.x) - w / 2;
        x = Math.max(r.x - 40, Math.min(r.x + r.w - w, x));
        // zwei Griffe nicht übereinander
        for (const q of placed) if (x < q.x + q.w + 4 && x + w > q.x - 4) x = kb.id === 'b' ? q.x + q.w + 4 : q.x - w - 4;
        placed.push({ x, y: y - h / 2, w, h });
        g.save();
        g.globalAlpha = k.labels;
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
        g.shadowBlur = active ? 12 : 7;
        g.shadowOffsetY = 2;
        g.fillStyle = active ? mixColor(c.ev, th().text, 0.15) : c.ev;
        roundRect(g, x, y - h / 2, w, h, h / 2);
        g.fill();
        g.shadowColor = 'transparent';
        // Spitze zum Balken
        const tipX = Math.max(x + 8, Math.min(x + w - 8, X(kb.x)));
        g.beginPath();
        g.moveTo(tipX - 6, y - h / 2 + 1);
        g.lineTo(tipX, y - h / 2 - 6);
        g.lineTo(tipX + 6, y - h / 2 + 1);
        g.closePath();
        g.fill();
        box.draw(g, x + 9, y + (box.asc - box.desc) / 2);
        g.restore();
      }
      void now;
    }

    function drawKAxis(k: K): void {
      const g = surface.g;
      const r = inner();
      const n = nn();
      const unit = unitPx();
      const size = textSize() - 1.5;
      const base = r.y + r.h;
      const step = [1, 2, 5, 10, 20, 25, 50].find((s) => s * unit >= (n >= 10 ? 26 : 20)) ?? 50;
      g.save();
      g.globalAlpha = k.labels;
      g.strokeStyle = th().axis;
      g.lineWidth = 1;
      for (let i = 0; i <= n; i += step) {
        const x = X(i);
        g.beginPath();
        g.moveTo(Math.round(x) + 0.5, base);
        g.lineTo(Math.round(x) + 0.5, base + 4);
        g.stroke();
        const b = formula(g, String(i), fstyle(size, th().muted, 600));
        b.draw(g, x - b.w / 2, base + 15 + (b.asc - b.desc) / 2);
      }
      g.restore();
    }

    function drawCdfMarker(v: number): void {
      const g = surface.g;
      const r = inner();
      const c = C();
      const kind = ev();
      const s = sel();
      const size = textSize() - 0.5;
      let lo: number;
      let hi: number;
      let xAt: number;
      let src: string;
      if (kind === 'le') {
        lo = 0;
        hi = F(s.k);
        xAt = s.k;
        src = `P(X ≤ ${s.k}) = F(${s.k})`;
      } else if (kind === 'ge') {
        lo = F(s.k - 1);
        hi = 1;
        xAt = s.k - 0.5;
        src = `P(X ≥ ${s.k}) = 1 − F(${int(s.k - 1)})`;
      } else if (kind === 'eq') {
        lo = F(s.k - 1);
        hi = F(s.k);
        xAt = s.k;
        src = tt(`Sprung bei ${s.k}: P(X = ${s.k})`, `jump at ${s.k}: P(X = ${s.k})`);
      } else {
        if (s.a > s.b) return;
        lo = F(s.a - 1);
        hi = F(s.b);
        xAt = s.b + 0.5;
        src = `F(${s.b}) − F(${int(s.a - 1)})`;
      }
      const px = X(xAt);
      const y1 = Y(lo);
      const y2 = Y(hi);
      g.save();
      g.globalAlpha = v;
      g.strokeStyle = c.ev;
      g.lineWidth = 1.3;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(r.x, y2);
      g.lineTo(px, y2);
      if (lo > 0) {
        g.moveTo(r.x, y1);
        g.lineTo(px, y1);
      }
      g.stroke();
      g.setLineDash([]);
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(px, y1);
      g.lineTo(px, y2);
      g.stroke();
      // Pfeilspitzen
      if (Math.abs(y1 - y2) > 14) {
        for (const [yy, dir] of [
          [y2, 1],
          [y1, -1],
        ] as const) {
          g.fillStyle = c.ev;
          g.beginPath();
          g.moveTo(px, yy);
          g.lineTo(px - 5, yy + dir * 8);
          g.lineTo(px + 5, yy + dir * 8);
          g.closePath();
          g.fill();
        }
      }
      g.restore();
      const P = hi - lo;
      const full = p.show ? `${src} ${rel4(P)} \\c{ev}{${prob(P)}}` : `${src} = ?`;
      const right = px < r.x + r.w * 0.6;
      pill(px + (right ? 12 : -12), Math.max(r.y + 14, Math.min(r.y + r.h - 16, (y1 + y2) / 2)), full, { size, align: right ? 'left' : 'right', alpha: v, border: c.ev, clampTo: regions().chart });
    }

    /* ---------- Karte: Rechnung ---------- */

    function calcLines(): { general: string; lines: string[]; note: string | null } {
      const n = nn();
      const kind = ev();
      const s = sel();
      const show = p.show;
      const lines: string[] = [];
      let note: string | null = null;
      if (kind === 'eq') {
        const k = s.k;
        const general = 'P(X = k) = \\n{n}{k} · p^{k} · (1 − p)^{n − k}';
        lines.push(`P(X = ${k}) = \\n{${n}}{${k}} · ${pTxt()}^{${k}} · ${qTxt()}^{${n - k}}`);
        if (show) lines.push(`= ${coefSrc(n, k)} · ${numSrc(p.p ** k)} · ${numSrc((1 - p.p) ** (n - k))}`);
        return { general, lines, note };
      }
      if (kind === 'le') {
        const k = s.k;
        const general = 'P(X ≤ k) = F(k) = P(X = 0) + … + P(X = k)';
        if (k >= n) {
          lines.push(`P(X ≤ ${n}) = 1`);
          note = tt('Alle Ergebnisse – sicheres Ereignis.', 'All outcomes – certain event.');
        } else {
          lines.push(k === 0 ? 'P(X ≤ 0) = P(X = 0)' : k === 1 ? 'P(X ≤ 1) = P(X = 0) + P(X = 1)' : `P(X ≤ ${k}) = P(X = 0) + … + P(X = ${k})`);
          if (show) {
            const terms = pmf.slice(0, k + 1).map((v) => prob(v));
            lines.push(`= ${terms.length <= 4 ? terms.join(' + ') : `${terms[0]} + ${terms[1]} + … + ${terms[terms.length - 1]}`}`);
          }
        }
        return { general, lines, note };
      }
      if (kind === 'ge') {
        const k = s.k;
        const general = 'P(X ≥ k) = 1 − P(X ≤ k − 1) = 1 − F(k − 1)';
        if (k === 0) {
          lines.push('P(X ≥ 0) = 1 − F(−1) = 1 − 0');
          note = tt('Mindestens 0 Treffer gibt es immer.', 'There are always at least 0 successes.');
        } else lines.push(`P(X ≥ ${k}) = 1 − F(${int(k - 1)})${show ? ` = 1 − ${prob(F(k - 1))}` : ''}`);
        return { general, lines, note };
      }
      const general = 'P(a ≤ X ≤ b) = F(b) − F(a − 1)';
      if (s.a > s.b) {
        lines.push(`P(${s.a} ≤ X ≤ ${s.b}) = 0`);
        note = tt(`a > b: Kein k liegt im Bereich – unmögliches Ereignis.`, `a > b: no k lies in the range – impossible event.`);
        return { general, lines, note };
      }
      lines.push(`P(${s.a} ≤ X ≤ ${s.b}) = F(${s.b}) − F(${int(s.a - 1)})`);
      if (show) lines.push(`= ${prob(F(s.b))} − ${prob(F(s.a - 1))}`);
      if (s.a === 0) note = tt('F(−1) = 0: Weniger als 0 Treffer gibt es nicht.', 'F(−1) = 0: fewer than 0 successes is impossible.');
      return { general, lines, note };
    }

    function drawCalc(r: Rect, alpha: number, stagger: number, now: number): void {
      const g = surface.g;
      const c = C();
      const pad = wide() ? 14 : 11;
      let size = textSize();
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const change = reduced() ? 1 : clamp01((now - cardT0) / 480);
      const data = calcLines();
      const n = nn();
      const innerW = r.w - 2 * pad;
      // Höhe prüfen, Schrift notfalls verkleinern
      const need = (s: number) => pad * 2 + s + 12 + (s * 1.75) * (1 + data.lines.length) + s * 2.6 + (data.note ? s * 1.4 : 0) + s * 1.55 * 2 + 8;
      while (size > 10.5 && need(size) > r.h) size -= 0.5;
      const title = formula(g, tt('Rechnung', 'Calculation'), fstyle(size - 0.5, th().muted, 800));
      title.draw(g, r.x + pad, r.y + pad + title.asc);
      chip(r.x + r.w - pad, r.y + pad - 4, `B(${n}; ${pTxt()})`, c.ev, size - 1.5, 'right', innerW - title.w - 12);
      let y = r.y + pad + title.asc + title.desc + 12;
      const rows: { src: string; color: string; weight: number; big?: boolean }[] = [
        { src: data.general, color: th().muted, weight: 600 },
        ...data.lines.map((s) => ({ src: s, color: th().text, weight: 650 })),
      ];
      const spare = r.h - need(size);
      const lh = size * 1.75 + Math.max(0, Math.min(size * 0.7, spare / (rows.length + 3)));
      y += Math.max(0, Math.min(size * 0.5, spare / 8));
      rows.forEach((row, i) => {
        const aa2 = clamp01(stagger * (rows.length + 3) - i) * clamp01(change * 2.4 - i * 0.18);
        const box = fit(row.src, innerW, size, row.color, row.weight, 9.5);
        g.save();
        g.globalAlpha = alpha * (0.15 + 0.85 * ease.outCubic(aa2));
        box.draw(g, r.x + pad + (1 - ease.outCubic(aa2)) * 8, y + lh / 2 + (box.asc - box.desc) / 2);
        g.restore();
        y += lh;
      });
      // großes Ergebnis (Zahl zählt weich)
      const ra = clamp01(stagger * (rows.length + 3) - rows.length) * clamp01(change * 2.4 - rows.length * 0.18);
      const P = eventProbability(n, p.p, ev(), sel());
      const shown = Math.abs(resS - P) < 5e-5 ? P : resS;
      const big = p.show ? `${rel4(P)} ${shown === P ? prob(P) : fmt.fixed(shown, 4)}` : '= ?';
      const bigSize = Math.min(size * 2.05, 30);
      let pb = p.show ? fit(`= ${fmt.num(shown * 100, 2)} %`, innerW * 0.32, size, th().muted, 700, 9) : null;
      let bb2 = fit(`${evSym(ev())} ${big}`, innerW - 8 - (pb ? pb.w + 14 : 0), bigSize, c.ev, 800, 11);
      if (pb && bb2.w + pb.w + 24 > innerW) {
        // zu eng: Prozentangabe weglassen, dafür die große Zahl lesbar
        pb = null;
        bb2 = fit(`${evSym(ev())} ${big}`, innerW - 8, bigSize, c.ev, 800, 11);
      }
      const bh = bigSize * 1.45;
      g.save();
      g.globalAlpha = alpha * ease.outCubic(ra);
      g.fillStyle = mixColor(c.ev, th().bg, 0, th().dark ? 0.16 : 0.08);
      roundRect(g, r.x + pad - 6, y + 2, innerW + 12, bh, 10);
      g.fill();
      bb2.draw(g, r.x + pad + 4, y + 2 + bh / 2 + (bb2.asc - bb2.desc) / 2);
      if (pb) {
        pb.draw(g, r.x + r.w - pad - 2 - pb.w, y + 2 + bh / 2 + (pb.asc - pb.desc) / 2);
      }
      g.restore();
      y += bh + 8 + Math.max(0, Math.min(size * 0.6, spare / 8));
      if (data.note) {
        const nb2 = fit(data.note, innerW, size - 1, th().muted, 600, 9);
        nb2.draw(g, r.x + pad, y + size * 0.7 + (nb2.asc - nb2.desc) / 2);
        y += size * 1.4;
      }
      // Anteilsbalken: gesuchte Wahrscheinlichkeit als Teil der Gesamtwahrscheinlichkeit 1
      const yB0 = r.y + r.h - pad - size * 1.55 * 2 - 6;
      if (yB0 - y > size * 2.4) {
        const by = y + (yB0 - y) / 2 - 4;
        const bw = innerW;
        const share = p.show ? clamp01(shown) : 0;
        g.save();
        g.globalAlpha = alpha * ease.outCubic(ra);
        g.fillStyle = mixColor(th().muted, th().bg, 0, th().dark ? 0.25 : 0.16);
        roundRect(g, r.x + pad, by, bw, 8, 4);
        g.fill();
        if (share > 0) {
          const grad = g.createLinearGradient(r.x + pad, 0, r.x + pad + bw, 0);
          grad.addColorStop(0, mixColor(c.ev, th().bg, 0.25));
          grad.addColorStop(1, c.ev);
          g.fillStyle = grad;
          roundRect(g, r.x + pad, by, Math.max(4, bw * share), 8, 4);
          g.fill();
        }
        const l0 = formula(g, '0', fstyle(size - 2.5, th().muted, 600));
        l0.draw(g, r.x + pad, by + 8 + size * 0.95);
        const l1 = formula(g, '1', fstyle(size - 2.5, th().muted, 600));
        l1.draw(g, r.x + pad + bw - l1.w, by + 8 + size * 0.95);
        g.restore();
      }
      // μ und σ
      const mu = binomialMean(n, p.p);
      const sd = binomialSd(n, p.p);
      const show = p.show;
      const muSrc = `\\c{mu}{μ} = n · p = ${n} · ${pTxt()} = ${show ? `\\c{mu}{${fmt.num(mu, 2)}}` : '?'}`;
      const sdSrc = `\\c{sig}{σ} = \\r{n · p · (1 − p)} = \\r{${n} · ${pTxt()} · ${qTxt()}} ${show ? `${Math.abs(sd * 1000 - Math.round(sd * 1000)) < 1e-9 ? '=' : '≈'} \\c{sig}{${fmt.num(sd, 3)}}` : '= ?'}`;
      const yB = Math.max(y + 4, r.y + r.h - pad - size * 1.55 * 2);
      g.save();
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.beginPath();
      g.moveTo(r.x + pad, Math.round(yB - 4) + 0.5);
      g.lineTo(r.x + r.w - pad, Math.round(yB - 4) + 0.5);
      g.stroke();
      g.restore();
      [muSrc, sdSrc].forEach((src, i) => {
        const box = fit(src, innerW, size - 0.5, th().text, 600, 9.5);
        box.draw(g, r.x + pad, yB + size * 1.55 * (i + 0.5) + (box.asc - box.desc) / 2 + 2);
      });
      g.restore();
    }

    /* ---------- Karte: Bernoulli-Kette ---------- */

    function drawChain(r: Rect, alpha: number, now: number): void {
      const g = surface.g;
      const c = C();
      const pad = wide() ? 14 : 11;
      const size = textSize() - 0.5;
      cardFrame(r, alpha);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      const n = nn();
      const title = formula(g, tt('Bernoulli-Kette', 'Bernoulli chain'), fstyle(size, th().muted, 800));
      title.draw(g, r.x + pad, r.y + pad + title.asc);
      // Legende
      const legendFull = `\\c{hit}{●} ${tt('Treffer', 'success')} (p)   \\c{m}{○} ${tt('Niete', 'failure')} (1 − p)`;
      const legendShort = `\\c{hit}{●} ${tt('Treffer', 'success')}  \\c{m}{○} ${tt('Niete', 'failure')}`;
      const avail = r.w - 2 * pad - title.w - 14;
      let lb = formula(g, legendFull, fstyle(size - 2, th().muted, 600));
      if (lb.w > avail) lb = formula(g, legendShort, fstyle(size - 2, th().muted, 600));
      if (lb.w <= avail) lb.draw(g, r.x + r.w - pad - lb.w, r.y + pad + title.asc);
      // Voraussetzungen (unten)
      const font = `500 ${Math.max(11, size - 2)}px ${th().font}`;
      const req = tt('Voraussetzung: n unabhängige Versuche, jeder mit Treffer oder Niete und derselben Trefferwahrscheinlichkeit p.', 'Requirement: n independent trials, each a success or a failure with the same probability of success p.');
      const reqLines = wrapText(req, r.w - 2 * pad, font);
      const rlh = Math.max(11, size - 2) * 1.3;
      const reqTop = r.y + r.h - pad - reqLines.length * rlh;
      g.fillStyle = th().muted;
      g.font = font;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      reqLines.forEach((ln, i) => g.fillText(ln, r.x + pad, reqTop + rlh * (i + 0.5)));
      // Kette
      const top = r.y + pad + title.asc + title.desc + 10;
      const statusH = size * 1.9;
      const freqH = total > 0 || run ? size * 1.5 : 0;
      const few = !run && total < FREQ_MIN;
      const gridH = reqTop - 6 - statusH - freqH - top;
      const gridW = r.w - 2 * pad;
      let chain: boolean[] | null = lastChain && lastChain.length === n ? lastChain : null;
      let shownCount = chain ? chain.length : 0;
      let runInfo: string | null = null;
      if (run) {
        const e = ease.inOutCubic(runProgress(now));
        const m = Math.max(1, Math.round(RUN_COUNT * e));
        chain = run.chains[m - 1] ?? null;
        shownCount = n;
        runInfo = tt(`Kette ${fmt.num(m, 0)} von ${fmt.num(RUN_COUNT, 0)}`, `chain ${fmt.num(m, 0)} of ${fmt.num(RUN_COUNT, 0)}`);
      }
      let hitsSoFar = 0;
      if (gridH > 12) {
        const cols = Math.max(1, Math.min(n, Math.ceil(Math.sqrt((n * gridW) / Math.max(1, gridH)))));
        const rowsN = Math.ceil(n / cols);
        const cell = Math.min(34, gridW / cols, gridH / rowsN);
        const rad = Math.max(1.8, cell * 0.36);
        const ox = r.x + pad + (gridW - cols * cell) / 2;
        const oy = top + (gridH - rowsN * cell) / 2;
        for (let i = 0; i < n; i++) {
          const cx = ox + (i % cols) * cell + cell / 2;
          const cy = oy + Math.floor(i / cols) * cell + cell / 2;
          let s = 1;
          let isHit = chain ? chain[i]! : false;
          let present = !!chain && i < shownCount;
          if (chainAnim && !run && chain === chainAnim.chain) {
            const t = now - chainAnim.t0 - i * chainAnim.step;
            present = t >= 0;
            s = chainAnim.step <= 0 ? 1 : ease.outBack(clamp01(t / 240));
          }
          if (present && isHit) hitsSoFar++;
          if (!present) {
            isHit = false;
            g.strokeStyle = mixColor(th().muted, th().bg, 0.65);
            g.lineWidth = 1.2;
            g.setLineDash([2, 3]);
            g.beginPath();
            g.arc(cx, cy, rad, 0, TAU);
            g.stroke();
            g.setLineDash([]);
            continue;
          }
          if (isHit) {
            const grad = g.createRadialGradient(cx - rad * 0.35, cy - rad * 0.4, rad * 0.1, cx, cy, rad * s);
            grad.addColorStop(0, mixColor(c.hit, '#ffffff', 0.45));
            grad.addColorStop(1, c.hit);
            g.fillStyle = grad;
            g.beginPath();
            g.arc(cx, cy, Math.max(0.1, rad * s), 0, TAU);
            g.fill();
            if (rad >= 6) {
              g.strokeStyle = '#ffffff';
              g.lineWidth = Math.max(1.4, rad * 0.22);
              g.lineCap = 'round';
              g.lineJoin = 'round';
              g.beginPath();
              g.moveTo(cx - rad * 0.42 * s, cy + rad * 0.02 * s);
              g.lineTo(cx - rad * 0.1 * s, cy + rad * 0.34 * s);
              g.lineTo(cx + rad * 0.45 * s, cy - rad * 0.32 * s);
              g.stroke();
            }
          } else {
            g.strokeStyle = th().muted;
            g.lineWidth = Math.max(1.2, rad * 0.2);
            g.beginPath();
            g.arc(cx, cy, Math.max(0.1, rad * s * 0.88), 0, TAU);
            g.stroke();
          }
        }
      }
      // Status
      const sy = reqTop - 6 - freqH - statusH / 2;
      if (freqH) {
        const N = run ? run.baseTotal + Math.round(RUN_COUNT * ease.inOutCubic(runProgress(now))) : total;
        const fy = reqTop - 6 - freqH / 2;
        g.save();
        g.strokeStyle = c.freq;
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(r.x + pad, fy + 3);
        g.lineTo(r.x + pad + 6, fy + 3);
        g.lineTo(r.x + pad + 6, fy - 4);
        g.lineTo(r.x + pad + 14, fy - 4);
        g.lineTo(r.x + pad + 14, fy + 1);
        g.lineTo(r.x + pad + 20, fy + 1);
        g.stroke();
        g.restore();
        const fb = fit(few ? tt(`${chainsTxt(N)} – Umriss ab ${FREQ_MIN} Ketten`, `${chainsTxt(N)} – outline from ${FREQ_MIN} chains`) : tt(`relative Häufigkeiten nach ${chainsTxt(N)}`, `relative frequencies after ${chainsTxt(N)}`), r.w - 2 * pad - 28, size - 1, few ? th().muted : c.freq, 700, 9);
        fb.draw(g, r.x + pad + 28, fy + (fb.asc - fb.desc) / 2);
      }
      let status: string;
      if (!chain) status = tt('Hier erscheinen die n Versuche einer Kette.', 'The n trials of a chain appear here.');
      else {
        const hits = run ? chain.filter(Boolean).length : hitsSoFar;
        const done = !chainAnim || chainAnim.added || run;
        status = `${runInfo ? `${runInfo}:  ` : ''}X = \\c{hit}{${hits}} ${tt(hits === 1 ? 'Treffer' : 'Treffer', hits === 1 ? 'success' : 'successes')}${done ? '' : ' …'}`;
      }
      const sb = fit(status, r.w - 2 * pad, chain ? size + 1 : size - 1, chain ? th().text : th().muted, chain ? 750 : 600, 9);
      sb.draw(g, r.x + pad, sy + (sb.asc - sb.desc) / 2);
      // Fortschritt beim Experiment
      if (run) {
        const u = ease.inOutCubic(runProgress(now));
        const bw = r.w - 2 * pad;
        g.fillStyle = mixColor(c.freq, th().bg, 0, 0.18);
        roundRect(g, r.x + pad, sy + statusH / 2 - 3, bw, 4, 2);
        g.fill();
        g.fillStyle = c.freq;
        roundRect(g, r.x + pad, sy + statusH / 2 - 3, Math.max(4, bw * u), 4, 2);
        g.fill();
      }
      g.restore();
    }

    /* ---------- Bild ---------- */

    function stepState(now: number, dt: number): boolean {
      let anim = false;
      const n = nn();
      const tau = reduced() ? 0 : 0.16;
      for (let i = 0; i < SLOTS; i++) {
        const tp = i <= n ? pmf[i]! : 0;
        const tf = i <= n ? cdf[i]! : 0;
        const v = vt.at(now);
        const sel0 = sel();
        const kind = ev();
        let th0: number;
        if (v < 0.5) th0 = i <= n && inEvent(kind, i, sel0) ? 1 : 0;
        else {
          const set = kind === 'le' ? [sel0.k] : kind === 'eq' ? [sel0.k] : kind === 'ge' ? [sel0.k - 1] : sel0.a > sel0.b ? [] : [sel0.b, sel0.a - 1];
          th0 = i <= n && set.includes(i) ? 1 : 0;
        }
        const a = shownP[i]!;
        const b = shownF[i]!;
        const h = hl[i]!;
        shownP[i] = follow(a, tp, dt, tau);
        shownF[i] = follow(b, tf, dt, tau);
        hl[i] = follow(h, th0, dt, reduced() ? 0 : 0.1);
        if (shownP[i] !== tp || shownF[i] !== tf || hl[i] !== th0) anim = true;
      }
      // Häufigkeiten
      if (run) {
        const e = ease.inOutCubic(runProgress(now));
        for (let i = 0; i < SLOTS; i++) rel[i] = lerp(run.prevRel[i]!, run.finalRel[i]!, e);
        anim = true;
        if (runProgress(now) >= 1) finishRun();
      } else {
        const target = relOf(counts, total);
        for (let i = 0; i < SLOTS; i++) {
          const o = rel[i]!;
          rel[i] = follow(o, target[i]!, dt, reduced() ? 0 : 0.18);
          if (rel[i] !== target[i]) anim = true;
        }
      }
      if (chainAnim && !chainAnim.added) {
        anim = true;
        if (now - chainAnim.t0 >= chainAnim.step * chainAnim.chain.length + 250) finishChain(now);
      }
      if (pulse) anim = true;
      // Achsenbereich
      const goalN = n;
      nS = follow(nS, goalN, dt, reduced() ? 0 : 0.2);
      const v = vt.at(now);
      let pmax = 0;
      for (let i = 0; i <= n; i++) pmax = Math.max(pmax, pmf[i]!);
      if (total >= 100 || run) for (let i = 0; i < SLOTS; i++) pmax = Math.max(pmax, (run ? run.finalRel[i]! : rel[i]!) * 0.98);
      const yGoal = Math.max(0.02, pmax * 1.26);
      yP = follow(yP, yGoal, dt, reduced() ? 0 : 0.2);
      // Bereich passend zum Übergang Histogramm ↔ F(k): so ragt kein Balken über den Rand
      yMaxS = lerp(yP, 1.06, v);
      muS = follow(muS, binomialMean(n, p.p), dt, reduced() ? 0 : 0.16);
      sdS = follow(sdS, binomialSd(n, p.p), dt, reduced() ? 0 : 0.16);
      sigA = follow(sigA, p.sig ? 1 : 0, dt, reduced() ? 0 : 0.12);
      const freqGoal = run || total >= FREQ_MIN ? 1 : 0;
      freqA = follow(freqA, freqGoal, dt, reduced() ? 0 : 0.2);
      if (freqA !== freqGoal) anim = true;
      knob.k = follow(knob.k, kk(), dt, reduced() || drag ? 0.03 : 0.12);
      knob.a = follow(knob.a, aa(), dt, reduced() || drag ? 0.03 : 0.12);
      knob.b = follow(knob.b, bb(), dt, reduced() || drag ? 0.03 : 0.12);
      resS = follow(resS, eventProbability(n, p.p, ev(), sel()), dt, reduced() ? 0 : 0.22);
      if (nS !== goalN || yP !== yGoal || sigA !== (p.sig ? 1 : 0) || muS !== binomialMean(n, p.p) || sdS !== binomialSd(n, p.p)) anim = true;
      if (knob.k !== kk() || knob.a !== aa() || knob.b !== bb() || resS !== eventProbability(n, p.p, ev(), sel())) anim = true;
      if (vt.busy(now)) anim = true;
      return anim;
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = stepState(now, dt);
      let k: K = { bars: 1, labels: 1, cards: 1, stagger: 1 };
      if (intro !== null) {
        const t = now - intro;
        if (t > 2000) intro = null;
        else {
          anim = true;
          k = {
            bars: clamp01((t - 100) / 1100),
            labels: ease.outCubic(clamp01((t - 500) / 600)),
            cards: ease.outCubic(clamp01((t - 200) / 650)),
            stagger: clamp01((t - 450) / 1200),
          };
        }
      }
      if (now - cardT0 < 700) anim = true;

      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      drawChart(now, k);
      const reg = regions();
      const slide = (1 - k.cards) * 14;
      drawCalc({ ...reg.calc, x: reg.calc.x + slide }, k.cards, k.stagger, now);
      drawChain({ ...reg.chain, x: reg.chain.x + slide }, k.cards, now);
      if (anim) ctx.requestRender();
    }

    function recompute(): void {
      pmf = binomialPmfAll(p.n, p.p);
      cdf = binomialCdfAll(p.n, p.p);
    }

    // Startzustand
    recompute();
    for (let i = 0; i <= p.n; i++) {
      shownP[i] = intro === null ? pmf[i]! : pmf[i]!;
      shownF[i] = cdf[i]!;
      hl[i] = inEvent(ev(), i, sel()) ? 1 : 0;
    }
    {
      let pmax = 0;
      for (const v of pmf) pmax = Math.max(pmax, v);
      yP = Math.max(0.02, pmax * 1.26);
      yMaxS = p.view === 'cdf' ? 1.06 : yP;
    }
    resS = eventProbability(p.n, p.p, ev(), sel());
    updateReadouts();
    syncActions();

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('n')) {
          const fix: Record<string, number> = {};
          if (p.k > p.n) fix.k = p.n;
          if (p.a > p.n) fix.a = p.n;
          if (p.b > p.n) fix.b = p.n;
          if (Object.keys(fix).length) ctx.set(fix);
        }
        if ((changed.has('n') || changed.has('p')) && source !== 'init') clearExperiment();
        if (changed.has('n') || changed.has('p')) recompute();
        if (changed.has('view')) {
          if (source === 'init' || reduced()) vt.snap(p.view === 'cdf' ? 1 : 0);
          else vt.go(p.view === 'cdf' ? 1 : 0, 800, now);
        }
        if (source !== 'init' && ['ev', 'n', 'p', 'k', 'a', 'b', 'show'].some((key) => changed.has(key)) && (changed.has('ev') || source === 'replace')) cardT0 = now;
        if (source === 'init') {
          resS = eventProbability(p.n, p.p, ev(), sel());
          knob.k = kk();
          knob.a = aa();
          knob.b = bb();
        }
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'chain' && !run) startChain(now);
        else if (id === 'run' && !run) startRun(now);
        else if (id === 'clear') clearExperiment();
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
