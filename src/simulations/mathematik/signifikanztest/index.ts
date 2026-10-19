import { defineSimulation, ease, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import { acceptProb, binomialPmf, criticalRegion, h1True, powerCurve, rejectProb, rejects, sampleBinomial, viewWindow, type CriticalRegion, type Side } from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const N_MAX = 200;

type Ctx = 'med' | 'dice' | 'seed' | 'free';

/** Sachzusammenhänge: Name, Frage und Bedeutung von X. */
const CONTEXTS: Record<Ctx, { title: Loc; question: Loc; X: Loc; short: Loc }> = {
  med: {
    title: L('Medikament', 'Medicine'),
    question: L('Heilt das neue Medikament öfter als das alte?', 'Does the new medicine cure more often than the old one?'),
    X: L('X: Anzahl der Geheilten', 'X: number of patients cured'),
    short: L('Geheilte', 'cured'),
  },
  dice: {
    title: L('Würfel', 'Dice'),
    question: L('Ist der Würfel gezinkt – fallen zu viele Sechsen?', 'Is the die loaded – too many sixes?'),
    X: L('X: Anzahl der Sechsen', 'X: number of sixes'),
    short: L('Sechsen', 'sixes'),
  },
  seed: {
    title: L('Saatgut', 'Seeds'),
    question: L('Keimen weniger Samen als versprochen?', 'Do fewer seeds germinate than promised?'),
    X: L('X: Anzahl der gekeimten Samen', 'X: number of seeds that germinate'),
    short: L('gekeimt', 'germinated'),
  },
  free: {
    title: L('Allgemein', 'General'),
    question: L('Einseitiger Test mit der Binomialverteilung', 'One-sided test with the binomial distribution'),
    X: L('X: Anzahl der Treffer', 'X: number of successes'),
    short: L('Treffer', 'successes'),
  },
};

/** Startwerte der Sachzusammenhänge (werden beim Umschalten von Hand gesetzt). */
const CONTEXT_VALUES: Record<Exclude<Ctx, 'free'>, { n: number; p0: number; side: Side; x: number; p1: number }> = {
  med: { n: 50, p0: 0.6, side: 'right', x: 38, p1: 0.75 },
  dice: { n: 60, p0: 0.17, side: 'right', x: 18, p1: 0.25 },
  seed: { n: 100, p0: 0.9, side: 'left', x: 83, p1: 0.82 },
};

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tw: { from: number; to: number; t0: number; dur: number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = this.goal = v;
    this.tw = null;
  }
  glide(goal: number, dur: number, now: number, delay = 0): void {
    if (goal === this.goal && !this.tw) return;
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur };
  }
  step(now: number, dt: number, tau = 0.14): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, ease.inOutCubic(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / tau));
    if (Math.abs(this.goal - this.v) <= 1e-5 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Säulenhöhen, die ihrem Ziel weich folgen. */
class Bars {
  readonly v = new Float64Array(N_MAX + 1);
  private goal = new Float64Array(N_MAX + 1);
  set(pmf: number[], snap: boolean): void {
    this.goal.fill(0);
    pmf.forEach((q, i) => (this.goal[i] = q));
    if (snap) this.v.set(this.goal);
  }
  step(dt: number, tau = 0.16): boolean {
    const f = 1 - Math.exp(-dt / tau);
    let busy = false;
    for (let i = 0; i <= N_MAX; i++) {
      const d = this.goal[i]! - this.v[i]!;
      if (d === 0) continue;
      if (Math.abs(d) < 1e-6) this.v[i] = this.goal[i]!;
      else {
        this.v[i] = this.v[i]! + d * f;
        busy = true;
      }
    }
    return busy;
  }
}

/**
 * Einseitiger Signifikanztest mit der Binomialverteilung: Histogramm unter H₀
 * mit Ablehnungsbereich (Fehler 1. Art), darunter die Verteilung für ein
 * angenommenes wahres p₁ (Fehler 2. Art β und Macht 1 − β), Entscheidungsregel
 * mit Beobachtungswert, Vierfeld-Schema Entscheidung × Wirklichkeit und
 * Gütefunktion. Aktionen: Stichproben ziehen (einzeln oder 100) und p₁ wandern lassen.
 */
export default defineSimulation({
  id: 'signifikanztest',
  dragHint: true,
  layout: { aspect: 1.1, aspectNarrow: 0.38 },
  groups: [
    { id: 'obs', label: L('Stichprobe', 'Sample') },
    { id: 'truth', label: L('Wirklichkeit (angenommen)', 'Reality (assumed)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'ctx',
      type: 'choice',
      label: L('Sachzusammenhang', 'Context'),
      options: [
        { value: 'med', label: L('Medikament (rechtsseitig)', 'Medicine (right-tailed)') },
        { value: 'dice', label: L('Würfel: zu viele Sechsen? (p₀ = 1/6)', 'Die: too many sixes? (p₀ = 1/6)') },
        { value: 'seed', label: L('Saatgut (linksseitig)', 'Seeds (left-tailed)') },
        { value: 'free', label: L('allgemein', 'general') },
      ],
      default: 'med',
    },
    { key: 'n', type: 'number', label: L('Stichprobenumfang n', 'Sample size n'), min: 10, max: N_MAX, step: 1, default: 50 },
    {
      key: 'p0',
      type: 'number',
      label: L('p₀ (Grenze der Nullhypothese)', 'p₀ (boundary of the null hypothesis)'),
      help: L('Rechtsseitig H₀: p ≤ p₀, linksseitig H₀: p ≥ p₀. Gerechnet wird im Grenzfall p = p₀.', 'Right-tailed H₀: p ≤ p₀, left-tailed H₀: p ≥ p₀. The calculation uses the boundary case p = p₀.'),
      min: 0.05,
      max: 0.95,
      step: 0.01,
      default: 0.6,
      visibleIf: (v) => v.ctx !== 'dice',
    },
    {
      key: 'side',
      type: 'choice',
      label: L('Gegenhypothese H₁', 'Alternative hypothesis H₁'),
      options: [
        { value: 'right', label: L('p > p₀ (rechtsseitig)', 'p > p₀ (right-tailed)') },
        { value: 'left', label: L('p < p₀ (linksseitig)', 'p < p₀ (left-tailed)') },
      ],
      default: 'right',
    },
    {
      key: 'alpha',
      type: 'choice',
      label: L('Signifikanzniveau α', 'Significance level α'),
      options: [
        { value: '1', label: L('1 %', '1 %') },
        { value: '5', label: L('5 %', '5 %') },
        { value: '10', label: L('10 %', '10 %') },
      ],
      default: '5',
    },
    {
      key: 'x',
      type: 'number',
      group: 'obs',
      label: L('Beobachtete Trefferzahl x', 'Observed number of successes x'),
      help: L('Auch direkt im Histogramm antippen oder ziehen.', 'You can also tap or drag in the histogram.'),
      min: 0,
      max: N_MAX,
      step: 1,
      default: 38,
    },
    {
      key: 'p1',
      type: 'number',
      group: 'truth',
      label: L('Wahre Trefferwahrscheinlichkeit p₁', 'True probability of success p₁'),
      help: L('Für den Fehler 2. Art: Wie wahrscheinlich ist es, H₀ nicht abzulehnen, obwohl p = p₁ gilt? Auch in der Gütefunktion ziehen.', 'For the type II error: how likely is it to keep H₀ although p = p₁? You can also drag in the power curve.'),
      min: 0.01,
      max: 0.99,
      step: 0.01,
      default: 0.75,
    },
    { key: 'h1', type: 'boolean', group: 'view', label: L('Verteilung für das wahre p₁ (Fehler 2. Art)', 'Distribution for the true p₁ (type II error)'), default: true },
    { key: 'curve', type: 'boolean', group: 'view', label: L('Gütefunktion', 'Power curve'), default: true },
    {
      key: 'info',
      type: 'boolean',
      group: 'view',
      label: L('Ablehnungsbereich und Wahrscheinlichkeiten im Bild', 'Critical region and probabilities in the picture'),
      help: L('Aus: Grenze und Werte verdeckt (für Aufgaben).', 'Off: boundary and values hidden (for tasks).'),
      default: true,
    },
  ],
  actions: [
    { id: 'draw', label: L('Stichprobe ziehen', 'Draw a sample'), primary: true },
    { id: 'many', label: L('100 Stichproben', '100 samples') },
    { id: 'sweep', label: L('p₁ wandern lassen', 'Let p₁ move') },
    { id: 'clear', label: L('Zählung löschen', 'Clear tally') },
  ],
  readouts: [
    { key: 'hyp', label: L('Hypothesen', 'Hypotheses') },
    { key: 'k', label: L('Ablehnungsbereich', 'Critical region'), spoiler: true },
    { key: 'alpha', label: L('Fehler 1. Art (tatsächlich)', 'Type I error (actual)'), spoiler: true },
    { key: 'beta', label: L('Fehler 2. Art und Macht', 'Type II error and power'), spoiler: true },
    { key: 'dec', label: L('Entscheidung', 'Decision'), spoiler: true },
    { key: 'tally', label: L('Gezogene Stichproben', 'Samples drawn') },
  ],
  presets: [
    { id: 'start', label: L('Medikament: n = 50, p₀ = 0,6', 'Medicine: n = 50, p₀ = 0.6'), values: {} },
    { id: 'coin', label: L('n = 20, p₀ = 0,5, wahres p₁ = 0,7', 'n = 20, p₀ = 0.5, true p₁ = 0.7'), values: { ctx: 'free', n: 20, p0: 0.5, x: 16, p1: 0.7 } },
    { id: 'dice', label: L('Gezinkter Würfel?', 'Loaded die?'), values: { ctx: 'dice', n: 60, x: 18, p1: 0.25 } },
    { id: 'seed', label: L('Saatgut: linksseitig', 'Seeds: left-tailed'), values: { ctx: 'seed', n: 100, p0: 0.9, side: 'left', x: 83, p1: 0.82 } },
    { id: 'same', label: L('Grenzfall p₁ = p₀', 'Boundary case p₁ = p₀'), values: { p1: 0.6, x: 33 } },
    { id: 'big', label: L('Großes n: mehr Macht', 'Large n: more power'), values: { n: 200, x: 135, p1: 0.68 } },
  ],
  strings: {
    de: { canvas: 'Zwei Histogramme der Binomialverteilung: oben unter der Nullhypothese mit rot gefärbtem Ablehnungsbereich (Fehler 1. Art), darunter für das angenommene wahre p₁ mit Fehler 2. Art (orange) und Macht (grün). Rechts Entscheidungsregel mit Beobachtungswert, Vierfeld-Schema Entscheidung und Wirklichkeit sowie die Gütefunktion.' },
    en: { canvas: 'Two binomial histograms: on top under the null hypothesis with the critical region in red (type I error), below for the assumed true p₁ with type II error (orange) and power (green). On the right the decision rule with the observed value, a table of decision versus reality and the power curve.' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const tt = (d: string, e: string) => (de ? d : e);
    const T = (l: Loc) => l[ctx.lang];
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const font = (w: number, s: number) => `${w} ${s}px ${th().font}`;
    const mfont = (s: number, w = 600) => `italic ${w} ${s}px ${th().mathFont}`;
    const alpha = (c: string, a: number) => shade(c, 0, a);

    /* ---------- Farben (gleiche Bedeutung überall) ---------- */
    const C = () => {
      const s = th().series;
      return { acc: s[0]!, err1: s[1]!, power: s[2]!, err2: s[3]!, h1: s[4]!, x: s[5]! };
    };

    /* ---------- Zustand ---------- */
    const p0 = () => (p.ctx === 'dice' ? 1 / 6 : p.p0);
    const side = () => p.side as Side;
    const alphaVal = () => Number(p.alpha) / 100;
    const xObs = () => Math.min(p.x, p.n);
    let cr: CriticalRegion = criticalRegion(p.n, p0(), alphaVal(), side());
    let curvePts = powerCurve(cr);
    let oldCurve: [number, number][] | null = null;
    let curveT0 = -Infinity;

    const bars0 = new Bars();
    const bars1 = new Bars();
    const now0 = performance.now();
    const W0 = viewWindow(p.n, p0(), p.p1, cr, xObs());
    const wLo = new Chan(W0[0]);
    const wHi = new Chan(W0[1]);
    const yMax0 = new Chan(0.1);
    const yMax1 = new Chan(0.1);
    const edge = new Chan(0);
    const X = new Chan(xObs());
    const P1 = new Chan(p.p1);
    const aShown = new Chan(cr.alphaActual);
    const bShown = new Chan(0);
    const tallyShown = [new Chan(0), new Chan(0), new Chan(0), new Chan(0)];
    /** Zählung: [abgelehnt & H₀ wahr, abgelehnt & H₁ wahr, nicht abgelehnt & H₀ wahr, nicht abgelehnt & H₁ wahr] */
    let tally = [0, 0, 0, 0];
    let sweep: { t0: number; start: number; from: number; to: number; dur: number; lead: number } | null = null;
    let sweepTimer: ReturnType<typeof setTimeout> | null = null;
    const trail: [number, number][] = [];
    let stampT0 = reduced() ? -1e9 : now0 + 900;
    let lastDecision = rejects(cr, xObs());
    let introT0 = reduced() ? -1e9 : now0 + 60;
    let lastTime = now0;
    let lastReadout = 0;
    let hoverK: number | null = null;
    let drag: 'x' | 'p1' | null = null;

    const edgeOf = (c: CriticalRegion) => (c.side === 'right' ? (c.possible ? c.lo - 0.5 : c.n + 0.5) : c.possible ? c.hi + 0.5 : -0.5);
    edge.jump(edgeOf(cr));

    /** Wahres p₁, wie es gerade gezeigt wird (während „p₁ wandern lassen“ der laufende Wert). */
    const p1Now = () => (sweep ? P1.v : p.p1);

    function retarget(snap: boolean, now: number): void {
      const prevEdge = edgeOf(cr);
      const prevCurve = curvePts;
      cr = criticalRegion(p.n, p0(), alphaVal(), side());
      const nextCurve = powerCurve(cr);
      if (!snap && !reduced() && (prevEdge !== edgeOf(cr) || prevCurve.some((q, i) => Math.abs(q[1] - nextCurve[i]![1]) > 1e-9))) {
        oldCurve = prevCurve;
        curveT0 = now;
      }
      curvePts = nextCurve;
      const pm0 = binomialPmf(p.n, p0());
      bars0.set(pm0, snap);
      const w = viewWindow(p.n, p0(), p.p1, cr, xObs());
      const dur = 650;
      const instant = snap || reduced();
      const move = (c: Chan, v: number, delay = 0) => (instant ? c.jump(v) : c.glide(v, dur, now, delay));
      move(wLo, w[0]);
      move(wHi, w[1]);
      move(edge, edgeOf(cr), 120);
      move(aShown, cr.alphaActual, 120);
      move(yMax0, niceMax(Math.max(...pm0.slice(w[0], w[1] + 1))));
      if (!sweep) {
        move(P1, p.p1);
        setH1(p.p1, snap);
      }
      const dx = xObs();
      if (instant) X.jump(dx);
      else X.glide(dx, Math.abs(dx - X.v) > 4 ? 700 : 300, now);
      const dec = rejects(cr, dx);
      if (dec !== lastDecision || snap) stampT0 = instant ? -1e9 : now + (Math.abs(dx - X.v) > 4 ? 650 : 150);
      lastDecision = dec;
    }

    /** Verteilung für p₁ (unten) und β setzen. */
    function setH1(pp: number, snap: boolean): void {
      const pm = binomialPmf(p.n, pp);
      bars1.set(pm, snap || !!sweep);
      const w = viewWindow(p.n, p0(), p.p1, cr, xObs());
      const m = niceMax(Math.max(...pm.slice(Math.max(0, w[0] - 5), Math.min(p.n, w[1] + 5) + 1)));
      if (snap || reduced()) {
        yMax1.jump(m);
        bShown.jump(acceptProb(cr, pp, pm));
      } else if (sweep) {
        yMax1.goal = m;
        bShown.jump(acceptProb(cr, pp, pm));
      } else {
        yMax1.glide(m, 650, performance.now());
        bShown.glide(acceptProb(cr, pp, pm), 650, performance.now(), 120);
      }
    }

    /** Obere Grenze der y-Achse: etwas Luft über der höchsten Säule. */
    function niceMax(m: number): number {
      return Math.max(0.02, m * 1.36);
    }

    /* ---------- Texte ---------- */
    const p0Txt = () => (p.ctx === 'dice' ? '1/6' : fmt.num(p0(), 2));
    const fmtP = (v: number) => (v > 0 && v < 0.00005 ? '< 0,0001'.replace(',', de ? ',' : '.') : fmt.fixed(v, 4));
    function pct(v: number): string {
      if (v > 0.9995 && v < 1) return '> 99,9 %'.replace(',', de ? ',' : '.');
      if (v > 0 && v < 0.0001) return '< 0,01 %'.replace(',', de ? ',' : '.');
      const q = v * 100;
      return `${fmt.fixed(q, q < 10 ? 2 : 1)} %`;
    }
    /** „≈ 2,80 %“, bei Grenzwerten „< 0,01 %“ bzw. „> 99,9 %“ ohne ≈. */
    const apx = (v: number) => {
      const t = pct(v);
      return /^[<>]/.test(t) ? t : `≈ ${t}`;
    };
    const sep = de ? '; ' : ', ';
    function setTxt(lo: number, hi: number): string {
      if (lo > hi) return '∅';
      if (lo === hi) return `{${lo}}`;
      if (hi === lo + 1) return `{${lo}${sep}${hi}}`;
      return `{${lo}${sep}…${sep}${hi}}`;
    }
    const hyp = (): [string, string] => (side() === 'right' ? [`H₀: p ≤ ${p0Txt()}`, `H₁: p > ${p0Txt()}`] : [`H₀: p ≥ ${p0Txt()}`, `H₁: p < ${p0Txt()}`]);
    const ruleTxt = (c: CriticalRegion) => (c.side === 'right' ? `X ≥ ${c.lo}` : `X ≤ ${c.hi}`);
    const alphaTxt = () => `${p.alpha} %`;
    const accTxt = (c: CriticalRegion) => (c.side === 'right' ? `X ≤ ${c.lo - 1}` : `X ≥ ${c.hi + 1}`);

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const [h0, h1] = hyp();
      ctx.readout('hyp', `${h0} · ${h1} · α = ${alphaTxt()} · n = ${p.n}`);
      const a = alphaVal();
      if (!cr.possible) {
        const ext = side() === 'right' ? `P(X = ${p.n})` : 'P(X = 0)';
        ctx.readout('k', tt(`kein Ablehnungsbereich möglich: ${ext} ≈ ${fmtP(cr.alphaNext)} > ${fmt.num(a, 2)}`, `no critical region possible: ${ext} ≈ ${fmtP(cr.alphaNext)} > ${fmt.num(a, 2)}`));
        ctx.readout('alpha', '0');
      } else {
        const r = ruleTxt(cr);
        const nxt = side() === 'right' ? `X ≥ ${cr.lo - 1}` : `X ≤ ${cr.hi + 1}`;
        ctx.readout('k', `Ā = ${setTxt(cr.lo, cr.hi)}: P(${r}) ≈ ${fmtP(cr.alphaActual)} ≤ ${fmt.num(a, 2)}, ${tt('aber', 'but')} P(${nxt}) ≈ ${fmtP(cr.alphaNext)} > ${fmt.num(a, 2)}`);
        ctx.readout('alpha', `P(${r}) ${apx(cr.alphaActual)} ≤ α = ${alphaTxt()}`);
      }
      const pp = p1Now();
      const pTxt = fmt.num(pp, 2);
      if (h1True(side(), p0(), pp)) {
        const b = acceptProb(cr, pp);
        ctx.readout('beta', { html: `β = P<sub>${pTxt}</sub>(${cr.possible ? accTxt(cr) : tt('alle X', 'all X')}) ${apx(b)}; ${tt('Macht', 'power')} 1 − β ${apx(1 - b)}` });
      } else {
        const r = rejectProb(cr, pp);
        ctx.readout('beta', tt(`p₁ = ${pTxt}: H₀ ist wahr, ein Fehler 2. Art ist nicht möglich. P(H₀ nicht ablehnen) ${apx(1 - r)}, P(Fehler 1. Art) ${apx(r)}`, `p₁ = ${pTxt}: H₀ is true, no type II error possible. P(keep H₀) ${apx(1 - r)}, P(type I error) ${apx(r)}`));
      }
      const x = xObs();
      const rej = rejects(cr, x);
      ctx.readout('dec', rej ? tt(`x = ${x} ∈ Ā: H₀ wird auf dem ${p.alpha}-%-Niveau abgelehnt.`, `x = ${x} ∈ Ā: H₀ is rejected at the ${alphaTxt()} level.`) : tt(`x = ${x} ∉ Ā: H₀ wird nicht abgelehnt (kein Beweis für H₀).`, `x = ${x} ∉ Ā: H₀ is not rejected (no proof of H₀).`));
      const total = tally.reduce((s, v) => s + v, 0);
      if (!total) ctx.readout('tally', tt('noch keine – „Stichprobe ziehen“ zieht mit dem wahren p₁', 'none yet – “Draw a sample” uses the true p₁'));
      else {
        const rej2 = tally[0]! + tally[1]!;
        const theo = rejectProb(cr, p.p1);
        ctx.readout('tally', tt(`${total} mit p = ${fmt.num(p.p1, 2)}: ${rej2}-mal abgelehnt (${fmt.num((rej2 / total) * 100, 1)} %), erwartet ${apx(theo)}`, `${total} with p = ${fmt.num(p.p1, 2)}: rejected ${rej2} times (${fmt.num((rej2 / total) * 100, 1)} %), expected ${apx(theo)}`));
      }
    }

    function syncActions(): void {
      const free = !ctx.locked;
      ctx.setAction('draw', { enabled: free });
      ctx.setAction('many', { enabled: free });
      ctx.setAction('sweep', { enabled: free, label: sweep ? tt('Anhalten', 'Stop') : tt('p₁ wandern lassen', 'Let p₁ move') });
      ctx.setAction('clear', { enabled: free && tally.some((v) => v > 0) });
    }

    /* ---------- Aufteilung ---------- */
    const wide = () => surface.width >= 540 || surface.width >= surface.height * 1.3;
    const ts = () => (wide() ? (surface.width < 800 ? 12 : 13) : 12);
    interface Regions {
      top: Rect;
      bottom: Rect | null;
      rule: Rect;
      matrix: Rect;
      power: Rect | null;
    }
    function regions(): Regions {
      const W = surface.width;
      const H = surface.height;
      const gap = 10;
      const RULE_H = 240;
      const MAT_H = 152;
      if (wide()) {
        const colW = Math.round(clamp(W * 0.4, 250, 340));
        const lw = W - colW - gap - 4;
        const [top, bottom] = splitHist({ x: 4, y: 4, w: lw, h: H - 8 }, gap);
        const cx = W - colW - 4;
        const avail = H - 8;
        const showPower = p.curve && avail - RULE_H - MAT_H - 2 * gap >= 96;
        const extra = showPower ? Math.max(0, avail - RULE_H - MAT_H - 2 * gap - 190) : avail - RULE_H - MAT_H - gap;
        const ruleH = RULE_H + Math.round(extra * 0.45);
        const matH = MAT_H + Math.round(extra * (showPower ? 0.25 : 0.55));
        const rule = { x: cx, y: 4, w: colW, h: ruleH };
        const matrix = { x: cx, y: 4 + ruleH + gap, w: colW, h: showPower ? matH : avail - ruleH - gap };
        const power = showPower ? { x: cx, y: matrix.y + matrix.h + gap, w: colW, h: H - 4 - (matrix.y + matrix.h + gap) } : null;
        return { top, bottom, rule, matrix, power };
      }
      const powH = p.curve ? 124 : 0;
      const histH = Math.max(200, H - 8 - RULE_H - MAT_H - powH - (p.curve ? 3 : 2) * gap);
      const [top, bottom] = splitHist({ x: 4, y: 4, w: W - 8, h: histH }, 8);
      let y = 4 + histH + gap;
      const rule = { x: 4, y, w: W - 8, h: RULE_H };
      y += RULE_H + gap;
      const matrix = { x: 4, y, w: W - 8, h: p.curve ? MAT_H : H - 4 - y };
      y += MAT_H + gap;
      const power = p.curve ? { x: 4, y, w: W - 8, h: H - 4 - y } : null;
      return { top, bottom, rule, matrix, power };
    }
    function splitHist(r: Rect, gap: number): [Rect, Rect | null] {
      if (!p.h1) return [r, null];
      const h = Math.round((r.h - gap) / 2);
      return [
        { x: r.x, y: r.y, w: r.w, h },
        { x: r.x, y: r.y + h + gap, w: r.w, h: r.h - h - gap },
      ];
    }

    /** Zeichenfläche eines Histogramms (innerhalb der Karte). */
    function plotRect(card: Rect): Rect {
      const left = wide() ? 50 : 42;
      return { x: card.x + left, y: card.y + 46, w: card.w - left - 14, h: card.h - 46 - 28 };
    }
    const unit = (pr: Rect) => pr.w / Math.max(1, wHi.v - wLo.v + 1);
    const kx = (pr: Rect, k: number) => pr.x + (k - wLo.v + 0.5) * unit(pr);

    /* ---------- Zeichnen: Hilfen ---------- */
    function card(r: Rect, appear: number): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.globalAlpha = appear;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
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

    /** Text auf Breite einpassen (Schrift verkleinern, mindestens 10,5 px). */
    function fitFont(str: string, maxW: number, w: number, size: number, math = false): string {
      const g = surface.g;
      let s = size;
      let f = math ? mfont(s, w) : font(w, s);
      g.font = f;
      while (s > 10.5 && g.measureText(str).width > maxW) {
        s -= 0.5;
        f = math ? mfont(s, w) : font(w, s);
        g.font = f;
      }
      return f;
    }

    /** Text in Zeilen umbrechen. */
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const words = str.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const t = cur ? `${cur} ${w}` : w;
        if (g.measureText(t).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = t;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function pill(x: number, y: number, str: string, color: string, opts: { align?: 'left' | 'center' | 'right'; size?: number; a?: number; fill?: string; bold?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? ts();
      const f = font(opts.bold ?? 750, size);
      g.font = f;
      const w = g.measureText(str).width + 16;
      const h = size + 10;
      const align = opts.align ?? 'center';
      const left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      const r = { x: left, y: y - h / 2, w, h };
      const a = opts.a ?? 1;
      if (a <= 0.01) return r;
      g.save();
      g.globalAlpha = a;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, r.x, r.y, r.w, r.h, h / 2);
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(18,24,34,0.92)' : 'rgba(255,255,255,0.95)');
      g.fill();
      g.restore();
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, h / 2);
      g.strokeStyle = alpha(color, 0.75);
      g.lineWidth = 1.4;
      g.stroke();
      text(g, str, r.x + w / 2, y + 0.5, { font: f, color: th().dark ? shade(color, 0.25) : shade(color, -0.22) });
      g.restore();
      return r;
    }
    const overlaps = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

    /** Rechte Seite für „nice“ Teilstriche. */
    function niceStep(range: number, maxTicks: number, steps: number[]): number {
      for (const s of steps) if (range / s <= maxTicks) return s;
      return steps[steps.length - 1]!;
    }

    /* ---------- Histogramm ---------- */
    interface HistOpts {
      bars: Bars;
      yMax: number;
      accCol: string;
      rejCol: string;
      title: string;
      titleCol: string;
      lower: boolean;
    }

    function drawHist(R: Rect, o: HistOpts, now: number, appear: number): void {
      const g = surface.g;
      const theme = th();
      const c = C();
      card(R, appear);
      g.save();
      g.globalAlpha = appear;
      // Titel mit Farbpunkt
      g.fillStyle = o.titleCol;
      g.beginPath();
      g.arc(R.x + 18, R.y + 18, 5, 0, Math.PI * 2);
      g.fill();
      const tf = fitFont(o.title, R.w - 40, 800, 13);
      text(g, o.title, R.x + 30, R.y + 18.5, { font: tf, color: theme.text, align: 'left' });
      const pr = plotRect(R);
      const u = unit(pr);
      const base = pr.y + pr.h;
      const yOf = (q: number) => base - (q / o.yMax) * pr.h;
      // y-Gitter und Zahlen
      const ys = niceStep(o.yMax, 4, [0.005, 0.01, 0.02, 0.025, 0.05, 0.1, 0.2, 0.25, 0.5, 1]);
      g.lineWidth = 1;
      for (let v = ys; v < o.yMax * 0.999; v += ys) {
        const y = Math.round(yOf(v)) + 0.5;
        g.strokeStyle = alpha(theme.text, theme.dark ? 0.08 : 0.06);
        g.beginPath();
        g.moveTo(pr.x, y);
        g.lineTo(pr.x + pr.w, y);
        g.stroke();
        text(g, fmt.num(v, 3), pr.x - 6, y, { font: font(600, 10.5), color: theme.muted, align: 'right' });
      }
      text(g, 'P(X = k)', pr.x - 6, pr.y - 11, { font: font(700, 10.5), color: theme.muted, align: 'right' });
      // Säulen
      const lo = Math.max(0, Math.floor(wLo.v) - 1);
      const hi = Math.min(p.n, Math.ceil(wHi.v) + 1);
      const e = kx(pr, edge.v - 0.5) + u / 2; // Pixelstelle der Grenze
      const info = p.info;
      const right = side() === 'right';
      const nb = Math.max(1, hi - lo);
      g.save();
      g.beginPath();
      g.rect(pr.x - 1, pr.y - 30, pr.w + 2, pr.h + 31);
      g.clip();
      const bw = Math.max(1, u * (u > 8 ? 0.82 : 0.9));
      const radius = Math.min(4, bw / 3);
      for (let k = lo; k <= hi; k++) {
        const grow = introT0 < 0 ? 1 : ease.outCubic(clamp01((now - introT0 - (o.lower ? 220 : 0) - ((k - lo) / nb) * 520) / 620));
        const q = o.bars.v[k]! * grow;
        if (q <= 0) continue;
        const x0 = kx(pr, k) - bw / 2;
        const y0 = yOf(q);
        const h = base - y0;
        if (h < 0.3) continue;
        const draw = (col: string, from: number, to: number) => {
          if (to <= from) return;
          g.save();
          g.beginPath();
          g.rect(from, pr.y - 30, to - from, pr.h + 31);
          g.clip();
          const grad = g.createLinearGradient(0, y0, 0, base);
          grad.addColorStop(0, alpha(col, theme.dark ? 0.95 : 0.9));
          grad.addColorStop(1, alpha(col, theme.dark ? 0.55 : 0.5));
          g.fillStyle = grad;
          roundRect(g, x0, y0, bw, h, Math.min(radius, h / 2));
          g.fill();
          g.restore();
        };
        if (!info) draw(o.titleCol, x0, x0 + bw);
        else if (right) {
          draw(o.accCol, x0, Math.min(x0 + bw, e));
          draw(o.rejCol, Math.max(x0, e), x0 + bw);
        } else {
          draw(o.rejCol, x0, Math.min(x0 + bw, e));
          draw(o.accCol, Math.max(x0, e), x0 + bw);
        }
        if (hoverK === k) {
          g.strokeStyle = theme.text;
          g.lineWidth = 1.5;
          roundRect(g, x0 - 1, y0 - 1, bw + 2, h + 1, radius);
          g.stroke();
        }
      }
      g.restore();
      // x-Achse
      g.strokeStyle = alpha(theme.text, 0.45);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(pr.x, base + 0.5);
      g.lineTo(pr.x + pr.w, base + 0.5);
      g.stroke();
      // Zahlen an der x-Achse
      const xs = niceStep(26 / u, 1, [1, 2, 5, 10, 20, 25, 50]);
      const chipK = info && cr.possible ? (right ? cr.lo : cr.hi) : null;
      const chipX = chipK !== null ? kx(pr, edge.v + (right ? 0.5 : -0.5)) : -1e9;
      for (let k = Math.ceil(lo / xs) * xs; k <= hi; k += xs) {
        const x = kx(pr, k);
        if (x < pr.x - 2 || x > pr.x + pr.w + 2) continue;
        if (Math.abs(x - chipX) < 22) continue;
        g.strokeStyle = alpha(theme.text, 0.4);
        g.beginPath();
        g.moveTo(x, base);
        g.lineTo(x, base + 4);
        g.stroke();
        text(g, String(k), x, base + 13, { font: font(600, 10.5), color: theme.muted });
      }
      text(g, 'k', pr.x + pr.w + 7, base + 13, { font: mfont(12), color: theme.muted });
      if (chipK !== null && chipX > pr.x - 10 && chipX < pr.x + pr.w + 10) {
        pill(clamp(chipX, pr.x + 12, pr.x + pr.w - 12), base + 13, String(chipK), c.err1, { size: 10.5, fill: theme.dark ? 'rgba(18,24,34,0.95)' : '#ffffff' });
      }
      g.restore();
    }

    /** Grenze des Ablehnungsbereichs über beide Histogramme, Beschriftungen, Beobachtung x. */
    function drawOverlay(rg: Regions, now: number, appear: number): Rect[] {
      const g = surface.g;
      const theme = th();
      const c = C();
      const taken: Rect[] = [];
      const top = plotRect(rg.top);
      const bot = rg.bottom ? plotRect(rg.bottom) : null;
      const right = side() === 'right';
      const size = wide() ? ts() - 0.5 : 11;
      const k1 = clamp01((now - introT0 - 900) / 500);
      const lab = introT0 < 0 ? 1 : ease.outCubic(k1);
      g.save();
      g.globalAlpha = appear;
      if (p.info) {
        const ex = kx(top, edge.v - 0.5) + unit(top) / 2;
        const yA = top.y - 4;
        const yB = (bot ?? top).y + (bot ?? top).h;
        if (ex > top.x - 1 && ex < top.x + top.w + 1) {
          g.save();
          g.globalAlpha = appear * lab;
          g.strokeStyle = alpha(theme.text, 0.6);
          g.lineWidth = 1.6;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(Math.round(ex) + 0.5, yA);
          g.lineTo(Math.round(ex) + 0.5, top.y + top.h);
          if (bot) {
            g.moveTo(Math.round(ex) + 0.5, bot.y - 4);
            g.lineTo(Math.round(ex) + 0.5, yB);
          }
          g.stroke();
          g.restore();
          // Pfeil „Ablehnungsbereich“ in Richtung der Ablehnung
          const ay = top.y + top.h * 0.56;
          const dir = right ? 1 : -1;
          const lbl = wide() ? tt('Ablehnungsbereich Ā', 'critical region Ā') : 'Ā';
          g.font = font(800, size);
          const lw = g.measureText(lbl).width;
          const room = right ? top.x + top.w - ex : ex - top.x;
          if (room > 34) {
            const alen = Math.min(room - 8, Math.max(26, Math.min(lw + 30, room - 8)));
            g.save();
            g.globalAlpha = appear * lab;
            g.strokeStyle = c.err1;
            g.fillStyle = c.err1;
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(ex + dir * 4, ay);
            g.lineTo(ex + dir * alen, ay);
            g.stroke();
            g.beginPath();
            g.moveTo(ex + dir * (alen + 6), ay);
            g.lineTo(ex + dir * (alen - 2), ay - 5);
            g.lineTo(ex + dir * (alen - 2), ay + 5);
            g.closePath();
            g.fill();
            g.restore();
            const lab2 = room > lw + 18 ? lbl : 'Ā';
            const lw2 = lab2 === lbl ? lw : 12;
            const tx = right ? Math.min(ex + 8, top.x + top.w - lw2 - 4) : Math.max(ex - 8, top.x + lw2 + 4);
            text(g, lab2, tx, ay - 12, { font: font(800, size), color: shade(c.err1, theme.dark ? 0.2 : -0.15), align: right ? 'left' : 'right' });
          }
        }
        // Wahrscheinlichkeiten als Etiketten
        const yPill = top.y + 6;
        const aTxt = cr.possible ? `P(${ruleTxt(cr)}) ${apx(aShown.v)}` : tt('kein Ablehnungsbereich', 'no critical region');
        const ra = pill(right ? top.x + top.w - 2 : top.x + 2, yPill, (wide() && top.w > 420 && cr.possible ? tt('Fehler 1. Art: ', 'type I error: ') : '') + aTxt, c.err1, { align: right ? 'right' : 'left', size, a: lab });
        taken.push(ra);
        if (bot) {
          const pp = p1Now();
          const yb = bot.y + 6;
          if (h1True(side(), p0(), pp)) {
            const bt = `β ${apx(bShown.v)}`;
            const pt = `1 − β ${apx(1 - bShown.v)}`;
            const longB = wide() && bot.w > 480;
            const rb = pill(right ? bot.x + 2 : bot.x + bot.w - 2, yb, (longB ? tt('Fehler 2. Art: ', 'type II error: ') : '') + bt, c.err2, { align: right ? 'left' : 'right', size, a: lab });
            let rp = pill(right ? bot.x + bot.w - 2 : bot.x + 2, yb, (longB ? tt('Macht: ', 'power: ') : '') + pt, c.power, { align: right ? 'right' : 'left', size, a: 0 });
            if (overlaps(rb, rp)) rp = { ...rp, y: rp.y + rp.h + 4 };
            pill(right ? bot.x + bot.w - 2 : bot.x + 2, rp.y + rp.h / 2, (longB ? tt('Macht: ', 'power: ') : '') + pt, c.power, { align: right ? 'right' : 'left', size, a: lab });
            taken.push(rb, rp);
          } else {
            const r = 1 - bShown.v;
            const t1 = tt(`H₀ wahr: nicht ablehnen ${apx(bShown.v)}`, `H₀ true: keep ${apx(bShown.v)}`);
            const t2 = tt(`Fehler 1. Art ${apx(r)}`, `type I error ${apx(r)}`);
            const rb = pill(right ? bot.x + 2 : bot.x + bot.w - 2, yb, t1, c.acc, { align: right ? 'left' : 'right', size, a: lab });
            let rp = pill(right ? bot.x + bot.w - 2 : bot.x + 2, yb, t2, c.err1, { align: right ? 'right' : 'left', size, a: 0 });
            if (overlaps(rb, rp)) rp = { ...rp, y: rp.y + rp.h + 4 };
            pill(right ? bot.x + bot.w - 2 : bot.x + 2, rp.y + rp.h / 2, t2, c.err1, { align: right ? 'right' : 'left', size, a: lab });
            taken.push(rb, rp);
          }
        }
      }
      // Beobachtung x
      const xv = X.v;
      const xpx = kx(top, xv);
      if (xpx >= top.x - 2 && xpx <= top.x + top.w + 2) {
        const base = top.y + top.h;
        const grow = introT0 < 0 ? 1 : ease.outCubic(clamp01((now - introT0 - 700) / 500));
        const kk = Math.round(xv);
        const q = bars0.v[kk] ?? 0;
        const barTop = base - (q / yMax0.v) * top.h;
        g.save();
        g.globalAlpha = appear * grow;
        g.strokeStyle = c.x;
        g.lineWidth = 2.2;
        g.beginPath();
        g.moveTo(xpx, base);
        g.lineTo(xpx, Math.min(barTop - 6, base - 18));
        g.stroke();
        // Marke auf der Achse
        g.fillStyle = c.x;
        g.beginPath();
        g.moveTo(xpx, base - 1);
        g.lineTo(xpx - 6, base + 8);
        g.lineTo(xpx + 6, base + 8);
        g.closePath();
        g.fill();
        g.restore();
        let ly = Math.min(barTop - 18, base - 30);
        const lt = `x = ${kk}`;
        g.font = font(800, size);
        const lw = g.measureText(lt).width + 16;
        let lr: Rect = { x: clamp(xpx - lw / 2, top.x, top.x + top.w - lw), y: ly - (size + 10) / 2, w: lw, h: size + 10 };
        for (const t of taken) if (overlaps(lr, t)) {
          ly = t.y + t.h + (size + 10) / 2 + 4;
          lr = { ...lr, y: ly - (size + 10) / 2 };
        }
        ly = Math.max(ly, top.y + (size + 10) / 2);
        pill(lr.x + lw / 2, ly, lt, c.x, { size, a: grow, fill: th().dark ? 'rgba(18,24,34,0.95)' : '#ffffff' });
        // dünne Linie auch im unteren Histogramm
        if (bot) {
          g.save();
          g.globalAlpha = appear * grow * 0.7;
          g.strokeStyle = c.x;
          g.lineWidth = 1.4;
          g.setLineDash([2, 4]);
          g.beginPath();
          g.moveTo(kx(bot, xv), bot.y + 4);
          g.lineTo(kx(bot, xv), bot.y + bot.h);
          g.stroke();
          g.restore();
        }
      }
      // Hover: Einzelwahrscheinlichkeit
      if (hoverK !== null && !drag) {
        const hk = hoverK;
        const tip = (pr: Rect, q: number, pp: number) => {
          const ytop = pr.y + pr.h - (q / (pr === top ? yMax0.v : yMax1.v)) * pr.h;
          pill(clamp(kx(pr, hk), pr.x + 70, pr.x + pr.w - 70), Math.max(pr.y + 30, ytop - 16), `P(X = ${hk}) ≈ ${fmtP(q)}${pr === top ? '' : ` (p = ${fmt.num(pp, 2)})`}`, theme.muted, { size: 11, bold: 650 });
        };
        tip(top, binomialPmf(p.n, p0())[hk] ?? 0, p0());
        if (bot) tip(bot, binomialPmf(p.n, p1Now())[hk] ?? 0, p1Now());
      }
      g.restore();
      return taken;
    }

    /* ---------- Entscheidungsregel ---------- */
    function drawRule(R: Rect, now: number, appear: number): void {
      const g = surface.g;
      const theme = th();
      const c = C();
      card(R, appear);
      g.save();
      g.globalAlpha = appear;
      const pad = 14;
      const W = R.w - 2 * pad;
      const cx = CONTEXTS[p.ctx as Ctx];
      let y = R.y + 18;
      text(g, tt('Entscheidungsregel', 'Decision rule'), R.x + pad, y, { font: font(800, 13), color: theme.text, align: 'left' });
      g.font = font(800, 13);
      const tw = g.measureText(tt('Entscheidungsregel', 'Decision rule')).width;
      text(g, T(cx.title), R.x + R.w - pad, y, { font: fitFont(T(cx.title), W - tw - 16, 650, 11), color: theme.muted, align: 'right' });
      y += 21;
      text(g, T(cx.question), R.x + pad, y, { font: fitFont(T(cx.question), W, 600, 11.5), color: theme.muted, align: 'left' });
      y += 23;
      // Hypothesen
      const [h0, h1] = hyp();
      const hs = 13.5;
      g.font = font(800, hs);
      const w0 = g.measureText(h0).width;
      text(g, h0, R.x + pad, y, { font: font(800, hs), color: c.acc, align: 'left' });
      text(g, h1, R.x + pad + w0 + 18, y, { font: font(800, hs), color: c.h1, align: 'left' });
      y += 19;
      const meta = `${T(cx.X)} · n = ${p.n} · α = ${alphaTxt()}`;
      text(g, meta, R.x + pad, y, { font: fitFont(meta, W, 600, 11.5), color: theme.muted, align: 'left' });
      y += 26;
      // Regel
      const info = p.info;
      let rule: string;
      if (!info) rule = tt(`Lehne H₀ ab, wenn X ${side() === 'right' ? '≥' : '≤'} ?`, `Reject H₀ if X ${side() === 'right' ? '≥' : '≤'} ?`);
      else if (!cr.possible) rule = tt('Kein Ablehnungsbereich möglich', 'No critical region possible');
      else rule = tt(`Lehne H₀ ab, wenn ${ruleTxt(cr)}.`, `Reject H₀ if ${ruleTxt(cr)}.`);
      const rf = fitFont(rule, W, 800, wide() ? 15.5 : 14.5);
      g.save();
      roundRect(g, R.x + pad - 6, y - 15, W + 12, 30, 9);
      g.fillStyle = alpha(c.err1, theme.dark ? 0.16 : 0.08);
      g.fill();
      g.restore();
      text(g, rule, R.x + pad + 2, y + 0.5, { font: rf, color: theme.text, align: 'left' });
      y += 25;
      // Ablehnungsbereich und Begründung
      if (info) {
        if (cr.possible) {
          const setLine = `Ā = ${setTxt(cr.lo, cr.hi)}`;
          text(g, setLine, R.x + pad, y, { font: fitFont(setLine, W, 750, 12.5), color: shade(c.err1, theme.dark ? 0.2 : -0.15), align: 'left' });
          y += 18;
          const r = ruleTxt(cr);
          const nxt = side() === 'right' ? `X ≥ ${cr.lo - 1}` : `X ≤ ${cr.hi + 1}`;
          const l1 = `P(${r}) ≈ ${fmtP(aShown.v)} ≤ ${fmt.num(alphaVal(), 2)}  ✓`;
          const l2 = `P(${nxt}) ≈ ${fmtP(cr.alphaNext)} > ${fmt.num(alphaVal(), 2)}  ✗`;
          text(g, l1, R.x + pad, y, { font: fitFont(l1, W, 650, 11.5), color: theme.text, align: 'left' });
          y += 16;
          text(g, l2, R.x + pad, y, { font: fitFont(l2, W, 600, 11.5), color: theme.muted, align: 'left' });
        } else {
          const ext = side() === 'right' ? `P(X = ${p.n})` : 'P(X = 0)';
          const l = tt(`${ext} ≈ ${fmtP(cr.alphaNext)} > α: n ist zu klein.`, `${ext} ≈ ${fmtP(cr.alphaNext)} > α: n is too small.`);
          text(g, l, R.x + pad, y, { font: fitFont(l, W, 650, 11.5), color: theme.muted, align: 'left' });
          y += 16;
        }
      } else {
        text(g, tt('Ā = ?  (Werte ausgeblendet)', 'Ā = ?  (values hidden)'), R.x + pad, y, { font: font(650, 12), color: theme.muted, align: 'left' });
        y += 16;
      }
      // Entscheidung
      const boxH = clamp(R.y + R.h - 10 - (y + 10), 44, 72);
      const boxTop = R.y + R.h - 10 - boxH;
      const tall = boxH >= 60;
      const st = reduced() ? 1 : clamp01((now - stampT0) / 520);
      const pop = reduced() ? 1 : ease.outBack(st);
      const kk = Math.round(X.v);
      const rej = rejects(cr, kk);
      const settled = Math.abs(X.v - xObs()) < 0.01;
      const col = !info ? theme.muted : rej ? c.err1 : c.acc;
      g.save();
      roundRect(g, R.x + 10, boxTop, R.w - 20, boxH, 10);
      g.fillStyle = alpha(c.x, theme.dark ? 0.12 : 0.07);
      g.fill();
      g.strokeStyle = alpha(c.x, 0.55);
      g.lineWidth = 1.2;
      g.stroke();
      g.restore();
      const xLine = `x = ${kk}`;
      text(g, xLine, R.x + 22, boxTop + boxH / 2, { font: font(800, tall ? 16 : 14), color: shade(c.x, theme.dark ? 0.2 : -0.2), align: 'left' });
      g.font = font(800, tall ? 16 : 14);
      const xw = g.measureText(xLine).width;
      const tx = R.x + 22 + xw + 14;
      const maxW = R.x + R.w - 20 - tx;
      if (!info) {
        text(g, tt('Entscheidung?', 'Decision?'), tx, boxTop + boxH / 2, { font: font(700, 12.5), color: theme.muted, align: 'left' });
      } else if (settled) {
        const main = rej ? tt('→ H₀ wird abgelehnt', '→ H₀ is rejected') : tt('→ H₀ wird nicht abgelehnt', '→ H₀ is not rejected');
        const long = maxW > 230;
        const sub = rej ? (long ? tt('signifikant – aber kein Beweis für H₁', 'significant – but no proof of H₁') : tt('kein Beweis für H₁', 'no proof of H₁')) : long ? tt('kein Widerspruch zu H₀ – kein Beweis für H₀', 'no contradiction to H₀ – no proof of H₀') : tt('kein Beweis für H₀', 'no proof of H₀');
        g.save();
        const cxp = tx + Math.min(maxW, 180) / 2;
        const cyp = boxTop + boxH / 2;
        g.translate(cxp, cyp);
        g.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
        g.translate(-cxp, -cyp);
        g.globalAlpha = appear * clamp01(st * 2);
        const mf = fitFont(main, maxW, 800, tall ? 15 : 13.5);
        text(g, main, tx, cyp - (tall ? 10 : 8), { font: mf, color: shade(col, theme.dark ? 0.2 : -0.15), align: 'left' });
        text(g, sub, tx, cyp + (tall ? 12 : 10), { font: fitFont(sub, maxW, 600, tall ? 12 : 11), color: theme.muted, align: 'left' });
        g.restore();
      } else {
        text(g, '…', tx, boxTop + boxH / 2, { font: font(800, 14), color: theme.muted, align: 'left' });
      }
      g.restore();
    }

    /* ---------- Vierfeld-Schema ---------- */
    function drawMatrix(R: Rect, appear: number): void {
      const g = surface.g;
      const theme = th();
      const c = C();
      card(R, appear);
      g.save();
      g.globalAlpha = appear;
      const pad = 12;
      text(g, tt('Entscheidung und Wirklichkeit', 'Decision and reality'), R.x + 14, R.y + 18, { font: fitFont(tt('Entscheidung und Wirklichkeit', 'Decision and reality'), R.w - 28, 800, 13), color: theme.text, align: 'left' });
      const hw = clamp(R.w * 0.28, 78, 112);
      const x0 = R.x + pad + hw;
      const cw = (R.x + R.w - pad - x0) / 2;
      const headY = R.y + 40;
      const rowTop = headY + 12;
      const rh = (R.y + R.h - 10 - rowTop) / 2;
      const pp = p1Now();
      const realH1 = h1True(side(), p0(), pp);
      const heads = [tt('H₀ ist wahr', 'H₀ is true'), tt('H₁ ist wahr', 'H₁ is true')];
      heads.forEach((h, j) => {
        const cur = (j === 1) === realH1;
        text(g, h, x0 + cw * j + cw / 2, headY, { font: fitFont(h, cw - 6, cur ? 800 : 650, 11.5), color: cur ? (j ? c.h1 : c.acc) : theme.muted });
      });
      const rows = [tt('H₀ ablehnen', 'reject H₀'), tt('H₀ nicht ablehnen', 'keep H₀')];
      const info = p.info;
      const a = cr.alphaActual;
      const beta = realH1 ? bShown.v : null;
      const cells: { name: string; val: string; col: string; alt?: string }[] = [
        { name: tt('Fehler 1. Art', 'type I error'), val: info ? `≤ ${pct(a)}` : '?', col: c.err1 },
        { name: tt('richtig', 'correct'), val: info ? (beta !== null ? `1 − β ${apx(1 - beta)}` : tt('je nach p', 'depends on p')) : '?', col: c.power, alt: beta !== null ? apx(1 - beta) : undefined },
        { name: tt('richtig', 'correct'), val: info ? `≥ ${pct(1 - a)}` : '?', col: c.acc },
        { name: tt('Fehler 2. Art', 'type II error'), val: info ? (beta !== null ? `β ${apx(beta)}` : tt('je nach p', 'depends on p')) : '?', col: c.err2 },
      ];
      const total = tally.reduce((s, v) => s + v, 0);
      rows.forEach((r, i) => {
        const ry = rowTop + i * rh;
        const lines = wrap(r, hw - 8, font(700, 11.5));
        lines.slice(0, 2).forEach((ln, li) => text(g, ln, R.x + pad, ry + rh / 2 + (li - (Math.min(2, lines.length) - 1) / 2) * 14, { font: font(700, 11.5), color: theme.text, align: 'left' }));
        for (let j = 0; j < 2; j++) {
          const ci = i * 2 + j;
          const cell = cells[ci]!;
          const x = x0 + j * cw + 3;
          const y = ry + 3;
          const w = cw - 6;
          const h = rh - 6;
          const cur = (j === 1) === realH1;
          roundRect(g, x, y, w, h, 9);
          g.fillStyle = alpha(cell.col, (theme.dark ? 0.2 : 0.11) * (cur ? 1.4 : 0.7));
          g.fill();
          if (cur) {
            g.strokeStyle = alpha(cell.col, 0.8);
            g.lineWidth = 1.5;
            g.stroke();
          }
          const big = h > 46;
          const nameF = fitFont(cell.name, w - 10, 800, 11.5);
          g.font = font(700, 10.5);
          if (cell.alt && g.measureText(cell.val).width > w - 10) cell.val = cell.alt;
          const valF = fitFont(cell.val, w - 10, 700, 11.5);
          const tcol = shade(cell.col, theme.dark ? 0.25 : -0.25);
          if (big || h > 34) {
            text(g, cell.name, x + w / 2, y + h / 2 - 8, { font: nameF, color: tcol });
            text(g, cell.val, x + w / 2, y + h / 2 + 8, { font: valF, color: cur ? theme.text : theme.muted });
          } else {
            text(g, cell.name, x + w / 2, y + h / 2, { font: nameF, color: tcol });
          }
          if (total > 0) {
            const n = Math.round(tallyShown[ci]!.v);
            if (n > 0 || cur) {
              const s = `${n}×`;
              g.font = font(800, 10.5);
              const sw = g.measureText(s).width + 10;
              roundRect(g, x + w - sw - 3, y + 3, sw, 16, 8);
              g.fillStyle = theme.dark ? 'rgba(18,24,34,0.9)' : 'rgba(255,255,255,0.92)';
              g.fill();
              text(g, s, x + w - sw / 2 - 3, y + 11.5, { font: font(800, 10.5), color: theme.text });
            }
          }
        }
      });
      g.restore();
    }

    /* ---------- Gütefunktion ---------- */
    function powerPlot(R: Rect): Rect {
      return { x: R.x + 38, y: R.y + 34, w: R.w - 38 - 16, h: R.h - 34 - 24 };
    }
    function drawPower(R: Rect, now: number, appear: number): void {
      const g = surface.g;
      const theme = th();
      const c = C();
      card(R, appear);
      g.save();
      g.globalAlpha = appear;
      const title = tt('Gütefunktion: P(H₀ ablehnen) für jedes p', 'Power curve: P(reject H₀) for every p');
      text(g, title, R.x + 14, R.y + 18, { font: fitFont(title, R.w - 28, 800, 12.5), color: theme.text, align: 'left' });
      const pr = powerPlot(R);
      if (pr.h < 30) {
        g.restore();
        return;
      }
      const X0 = (q: number) => pr.x + q * pr.w;
      const Y0 = (v: number) => pr.y + pr.h - v * pr.h;
      // Hintergrund: Bereich von H₀ und H₁
      const p00 = p0();
      const right = side() === 'right';
      g.fillStyle = alpha(c.acc, theme.dark ? 0.1 : 0.06);
      if (right) g.fillRect(pr.x, pr.y, X0(p00) - pr.x, pr.h);
      else g.fillRect(X0(p00), pr.y, pr.x + pr.w - X0(p00), pr.h);
      g.fillStyle = alpha(c.h1, theme.dark ? 0.1 : 0.06);
      if (right) g.fillRect(X0(p00), pr.y, pr.x + pr.w - X0(p00), pr.h);
      else g.fillRect(pr.x, pr.y, X0(p00) - pr.x, pr.h);
      // Achsen und Teilung
      g.strokeStyle = alpha(theme.text, 0.4);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(pr.x, pr.y);
      g.lineTo(pr.x, pr.y + pr.h);
      g.lineTo(pr.x + pr.w, pr.y + pr.h);
      g.stroke();
      for (const v of [0, 0.5, 1]) {
        text(g, fmt.num(v, 1), pr.x - 6, Y0(v), { font: font(600, 10.5), color: theme.muted, align: 'right' });
        if (v > 0) {
          g.strokeStyle = alpha(theme.text, 0.07);
          g.beginPath();
          g.moveTo(pr.x, Y0(v));
          g.lineTo(pr.x + pr.w, Y0(v));
          g.stroke();
        }
      }
      for (const v of [0, 0.5, 1]) {
        if (Math.abs(v - p00) < 0.16) continue;
        text(g, fmt.num(v, 1), X0(v), pr.y + pr.h + 11, { font: font(600, 10.5), color: theme.muted });
      }
      text(g, 'p', pr.x + pr.w + 8, pr.y + pr.h + 11, { font: mfont(12), color: theme.muted });
      // p₀
      g.save();
      g.strokeStyle = alpha(c.acc, 0.8);
      g.setLineDash([4, 4]);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(X0(p00), pr.y);
      g.lineTo(X0(p00), pr.y + pr.h);
      g.stroke();
      g.restore();
      text(g, `p₀ = ${p0Txt()}`, X0(p00), pr.y + pr.h + 11, { font: font(750, 10.5), color: shade(c.acc, theme.dark ? 0.2 : -0.15) });
      if (!p.info) {
        text(g, '?', pr.x + pr.w / 2, pr.y + pr.h / 2, { font: font(800, 22), color: theme.muted });
        g.restore();
        return;
      }
      // Kurve (bei Änderungen weich überblendet)
      const ct = oldCurve ? clamp01((now - curveT0) / 550) : 1;
      if (ct >= 1) oldCurve = null;
      const line = (pts: [number, number][], a: number) => {
        g.save();
        g.globalAlpha = appear * a;
        g.strokeStyle = theme.text;
        g.lineWidth = 2.6;
        g.lineJoin = 'round';
        g.beginPath();
        pts.forEach(([q, v], i) => (i ? g.lineTo(X0(q), Y0(v)) : g.moveTo(X0(q), Y0(v))));
        g.stroke();
        g.restore();
      };
      const intro = introT0 < 0 ? 1 : ease.inOutCubic(clamp01((now - introT0 - 600) / 800));
      const shown = curvePts.slice(0, Math.max(2, Math.round(curvePts.length * intro)));
      if (oldCurve) line(oldCurve, 1 - ease.inOutCubic(ct));
      line(shown, oldCurve ? ease.inOutCubic(ct) : 1);
      // Spur von „p₁ wandern lassen“
      if (trail.length > 1) {
        g.save();
        g.strokeStyle = c.power;
        g.lineWidth = 5;
        g.globalAlpha = appear * 0.35;
        g.lineCap = 'round';
        g.beginPath();
        trail.forEach(([q, v], i) => (i ? g.lineTo(X0(q), Y0(v)) : g.moveTo(X0(q), Y0(v))));
        g.stroke();
        g.restore();
      }
      // α an p₀
      const ya = Y0(aShown.v);
      g.fillStyle = c.err1;
      g.beginPath();
      g.arc(X0(p00), ya, 4, 0, Math.PI * 2);
      g.fill();
      // Punkt bei p₁
      const pp = p1Now();
      const rp = rejectProb(cr, pp);
      const isH1 = h1True(side(), p00, pp);
      const col = isH1 ? c.power : c.err1;
      const px = X0(pp);
      const py = Y0(rp);
      g.save();
      g.strokeStyle = alpha(col, 0.6);
      g.setLineDash([2, 3]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(px, pr.y + pr.h);
      g.lineTo(px, py);
      g.stroke();
      g.restore();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.fillStyle = col;
      g.beginPath();
      g.arc(px, py, 6.5, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = theme.bg;
      g.lineWidth = 1.8;
      g.beginPath();
      g.arc(px, py, 6.5, 0, Math.PI * 2);
      g.stroke();
      const lbl = isH1 ? `1 − β ${apx(rp)}` : `${apx(rp)}`;
      g.font = font(750, 11);
      const lw = g.measureText(lbl).width + 16;
      const onLeft = px + 12 + lw > pr.x + pr.w;
      const ly = clamp(py + (rp > 0.5 ? 16 : -16), pr.y + 10, pr.y + pr.h - 10);
      pill(onLeft ? px - 12 : px + 12, ly, lbl, col, { align: onLeft ? 'right' : 'left', size: 11 });
      g.restore();
    }

    /* ---------- Zeiger ---------- */
    function histAt(px: number, py: number): Rect | null {
      const rg = regions();
      for (const r of [rg.top, rg.bottom]) if (r && px >= r.x && px <= r.x + r.w && py >= r.y + 26 && py <= r.y + r.h) return r;
      return null;
    }
    function kAt(r: Rect, px: number): number {
      const pr = plotRect(r);
      return clamp(Math.round(wLo.v + (px - pr.x) / unit(pr) - 0.5), 0, p.n);
    }
    function inPower(px: number, py: number): boolean {
      const r = regions().power;
      if (!r || !p.info) return false;
      const pr = powerPlot(r);
      return px >= pr.x - 8 && px <= pr.x + pr.w + 8 && py >= pr.y - 8 && py <= pr.y + pr.h + 8;
    }
    function setP1FromPx(px: number): void {
      const r = regions().power;
      if (!r) return;
      const pr = powerPlot(r);
      stopSweep(false);
      ctx.set({ p1: clamp((px - pr.x) / pr.w, 0.01, 0.99) });
    }

    surface.addTarget({
      contains: (px, py) => !!histAt(px, py) || inPower(px, py),
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        const h = histAt(pt.px, pt.py);
        if (h) {
          drag = 'x';
          ctx.set({ x: kAt(h, pt.px) });
          return true;
        }
        if (inPower(pt.px, pt.py)) {
          drag = 'p1';
          setP1FromPx(pt.px);
          return true;
        }
        return false;
      },
      pointerMove: (pt) => {
        if (drag === 'x') {
          const r = regions().top;
          ctx.set({ x: kAt(r, pt.px) });
        } else if (drag === 'p1') setP1FromPx(pt.px);
      },
      pointerUp: () => {
        drag = null;
        ctx.requestRender();
      },
      hover: (pt) => {
        let k: number | null = null;
        if (pt) {
          const h = histAt(pt.px, pt.py);
          if (h) k = kAt(h, pt.px);
          surface.setCursor(ctx.locked ? '' : h ? 'pointer' : inPower(pt.px, pt.py) ? 'ew-resize' : '');
        }
        if (k !== hoverK) {
          hoverK = k;
          ctx.requestRender();
        }
      },
      wheel: () => false,
    });

    /* ---------- Aktionen ---------- */
    function sweepRange(): [number, number] {
      const right = side() === 'right';
      const from = Math.round(p0() * 100) / 100;
      let to = right ? 0.99 : 0.01;
      for (let i = 1; i < 99; i++) {
        const q = Math.round((from + (right ? i : -i) * 0.01) * 100) / 100;
        if (q < 0.01 || q > 0.99) break;
        if (rejectProb(cr, q) >= 0.995) {
          to = q;
          break;
        }
      }
      return [from, to];
    }
    function stopSweep(keep: boolean): void {
      if (!sweep) return;
      if (sweepTimer) clearTimeout(sweepTimer);
      sweepTimer = null;
      const v = Math.round(P1.v * 100) / 100;
      sweep = null;
      if (keep) ctx.set({ p1: clamp(v, 0.01, 0.99) });
      syncActions();
    }
    function startSweep(): void {
      const [from, to] = sweepRange();
      const now = performance.now();
      const dur = reduced() ? 0 : 1200 + Math.abs(to - from) * 9000;
      trail.length = 0;
      if (dur === 0) {
        ctx.set({ p1: to });
        return;
      }
      // erst weich zu p₀ gleiten, dann wandern
      const lead = Math.abs(P1.v - from) > 0.005 ? 600 : 0;
      sweep = { t0: now, start: P1.v, from, to, dur, lead };
      sweepTimer = setTimeout(() => {
        sweepTimer = null;
        if (!sweep) return;
        sweep = null;
        ctx.set({ p1: to });
        syncActions();
      }, dur + lead + 40);
      syncActions();
    }

    function addSamples(count: number): void {
      const now = performance.now();
      const real = h1True(side(), p0(), p.p1) ? 1 : 0;
      let last = xObs();
      for (let i = 0; i < count; i++) {
        last = sampleBinomial(p.n, p.p1, Math.random);
        const rej = rejects(cr, last);
        tally[(rej ? 0 : 2) + real]! += 1;
      }
      tally.forEach((v, i) => (reduced() ? tallyShown[i]!.jump(v) : tallyShown[i]!.glide(v, count > 1 ? 900 : 400, now, count > 1 ? 0 : 600)));
      ctx.set({ x: last });
      updateReadouts();
      syncActions();
    }
    function clearTally(): void {
      tally = [0, 0, 0, 0];
      tallyShown.forEach((c) => c.jump(0));
    }

    retarget(true, now0);
    bars0.v.fill(0);
    bars0.set(binomialPmf(p.n, p0()), true);
    yMax0.jump(niceMax(Math.max(...binomialPmf(p.n, p0()).slice(W0[0], W0[1] + 1))));
    updateReadouts();
    syncActions();

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('ctx') && p.ctx !== 'free') {
          const v = CONTEXT_VALUES[p.ctx as Exclude<Ctx, 'free'>];
          ctx.set(p.ctx === 'dice' ? { n: v.n, side: v.side, x: v.x, p1: v.p1 } : v);
        }
        if (source === 'input' && changed.has('n') && p.x > p.n) ctx.set({ x: p.n });
        if (['ctx', 'n', 'p0', 'side', 'alpha', 'p1'].some((k) => changed.has(k)) && source !== 'sim') {
          stopSweep(false);
          clearTally();
        } else if (changed.has('p1') && !sweep && source === 'sim' && !drag) {
          // Ende von „p₁ wandern lassen“: Zählung passt nicht mehr zum neuen p₁
          clearTally();
        }
        if (changed.has('p1') && drag === 'p1') clearTally();
        // Spur der Gütefunktion gilt nur bis zur nächsten Änderung des Tests
        if (['n', 'p0', 'side', 'alpha', 'ctx'].some((k) => changed.has(k)) || (changed.has('p1') && source !== 'sim')) trail.length = 0;
        if (source === 'init') introT0 = reduced() ? -1e9 : now + 60;
        retarget(source === 'init', now);
        updateReadouts();
        syncActions();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'draw') addSamples(1);
        else if (id === 'many') addSamples(100);
        else if (id === 'sweep') {
          if (sweep) stopSweep(true);
          else startSweep();
        } else if (id === 'clear') {
          clearTally();
          updateReadouts();
          syncActions();
        }
        ctx.requestRender();
      },
      render() {
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
        lastTime = now;
        let busy = false;
        if (sweep) {
          const el = now - sweep.t0;
          const inLead = el < sweep.lead;
          const v = inLead ? lerp(sweep.start, sweep.from, ease.inOutCubic(el / sweep.lead)) : lerp(sweep.from, sweep.to, ease.inOutCubic(clamp01((el - sweep.lead) / sweep.dur)));
          P1.jump(v);
          setH1(v, false);
          if (!inLead) trail.push([v, rejectProb(cr, v)]);
          if (now - lastReadout > 120) {
            lastReadout = now;
            updateReadouts();
          }
          busy = true;
        }
        for (const ch of [wLo, wHi, yMax0, yMax1, edge, X, aShown, bShown, ...tallyShown]) if (ch.step(now, dt)) busy = true;
        if (!sweep && P1.step(now, dt)) busy = true;
        if (bars0.step(dt)) busy = true;
        if (bars1.step(dt, sweep ? 0.001 : 0.16)) busy = true;

        surface.begin();
        const rg = regions();
        const c = C();
        const ap = (j: number) => (introT0 < 0 ? 1 : ease.outCubic(clamp01((now - introT0 - j * 110) / 480)));
        drawHist(rg.top, { bars: bars0, yMax: yMax0.v, accCol: c.acc, rejCol: c.err1, title: tt(`Verteilung unter H₀: p = ${p0Txt()}`, `Distribution under H₀: p = ${p0Txt()}`), titleCol: c.acc, lower: false }, now, ap(0));
        if (rg.bottom) {
          const pp = p1Now();
          const isH1 = h1True(side(), p0(), pp);
          const title = isH1 ? tt(`Angenommen wahr: p₁ = ${fmt.num(pp, 2)} (H₁ gilt)`, `Assumed true: p₁ = ${fmt.num(pp, 2)} (H₁ holds)`) : tt(`Angenommen wahr: p₁ = ${fmt.num(pp, 2)} (H₀ gilt)`, `Assumed true: p₁ = ${fmt.num(pp, 2)} (H₀ holds)`);
          drawHist(rg.bottom, { bars: bars1, yMax: yMax1.v, accCol: isH1 ? c.err2 : c.acc, rejCol: isH1 ? c.power : c.err1, title, titleCol: c.h1, lower: true }, now, ap(1));
        }
        drawOverlay(rg, now, ap(0));
        drawRule(rg.rule, now, ap(2));
        drawMatrix(rg.matrix, ap(3));
        if (rg.power) drawPower(rg.power, now, ap(4));
        const introBusy = introT0 > 0 && now - introT0 < 2200;
        const stampBusy = now - stampT0 < 700;
        if (busy || introBusy || stampBusy || oldCurve) ctx.requestRender();
      },
      destroy: () => {
        if (sweepTimer) clearTimeout(sweepTimer);
        surface.destroy();
      },
    };
  },
});
