import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, scaledSprite, Surface, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  coefficients,
  decimals,
  degenerate,
  derive,
  equals,
  fitParabola,
  fromDecimal,
  isZero,
  mul,
  ONE,
  pairDifference,
  rat,
  rootsWay,
  sub,
  toNumber,
  vertexOf,
  vertexWay,
  type Fit,
  type Points,
  type Rational,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
const ROMAN = ['I', 'II', 'III', 'IV', 'V'];
const PT_KEYS = ['p1', 'p2', 'p3'] as const;

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.goal = goal;
    this.tau = tau;
    this.tw = null;
  }
  glide(goal: number, dur: number, delay: number, now: number): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur };
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
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
    if (this.tau <= 0) {
      this.v = this.goal;
      return false;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-4 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

type RowKind = 'eq' | 'result' | 'warn' | 'text' | 'hint';
/** Eine Zeile des Rechenwegs. */
interface Row {
  key: string;
  kind: RowKind;
  /** Formel (Kurzschrift aus formula.ts) bzw. Text bei text/hint */
  f: string;
  /** Formel beim Einsetzen (erscheint in der Animation zuerst) */
  sub?: string;
  /** Kennung links (I, II, …) und ihre Farbe */
  tag?: string;
  col?: string;
  /** Erläuterung rechts (z. B. „II − I“) */
  note?: string;
  /** Punkt, der in dieser Zeile eingesetzt wird (pulsiert in der Animation) */
  pt?: number;
  /** Überschrift des Abschnitts, der mit dieser Zeile beginnt (Animation) */
  cap?: string;
  /** feine Trennlinie über der Zeile */
  sep?: boolean;
}
/** Zustand einer gezeichneten Zeile (gleitet, blendet über). */
interface RowState {
  row: Row;
  src: string;
  prev: string | null;
  tc: number;
  y: number;
  alpha: number;
  live: boolean;
}
interface Story {
  t0: number;
  starts: number[];
  resultAt: number;
  end: number;
}
interface Flight {
  t0: number;
  xs: number;
  xe: number;
  dur: number;
}

/**
 * Parabel durch drei Punkte: Drei ziehbare Punkte P₁, P₂, P₃ (rasten auf das
 * 0,5er-Gitter ein), die Parabel y = ax² + bx + c gleitet weich mit. Daneben
 * der Rechenweg als lineares Gleichungssystem (Einsetzen, c eliminieren,
 * b eliminieren, zurückrechnen) – auf Wunsch Schritt für Schritt animiert –
 * oder über Scheitel- bzw. Nullstellenform. Sonderfälle: gleiche x-Werte
 * (keine Funktion), zusammenfallende Punkte (unendlich viele Parabeln),
 * Punkte auf einer Geraden (a = 0). Anwendungen: Wurfbahn, Brückenbogen.
 */
export default defineSimulation({
  id: 'parabel-drei-punkte',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  images: { ball: 'ball.webp', river: 'fluss.webp' },
  groups: [
    { id: 'pts', label: L('Punkte (auch im Bild ziehen)', 'Points (you can also drag them)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'way',
      type: 'choice',
      label: L('Lösungsweg', 'Method'),
      options: [
        { value: 'lgs', label: L('Gleichungssystem (geht immer)', 'System of equations (always works)') },
        { value: 'vertex', label: L('Scheitelform (ein Punkt ist der Scheitel)', 'Vertex form (one point is the vertex)') },
        { value: 'roots', label: L('Nullstellenform (zwei Punkte auf der x-Achse)', 'Factored form (two points on the x-axis)') },
      ],
      default: 'lgs',
    },
    {
      key: 'scene',
      type: 'choice',
      label: L('Anwendung', 'Application'),
      options: [
        { value: 'none', label: L('keine', 'none') },
        { value: 'ball', label: L('Wurfbahn eines Balls', 'Path of a thrown ball') },
        { value: 'bridge', label: L('Brückenbogen', 'Bridge arch') },
      ],
      default: 'none',
    },
    { key: 'x1', type: 'number', group: 'pts', label: L('P₁: x-Wert', 'P₁: x-value'), min: -6, max: 6, step: 0.5, default: -1 },
    { key: 'y1', type: 'number', group: 'pts', label: L('P₁: y-Wert', 'P₁: y-value'), min: -6, max: 6, step: 0.5, default: 1.5 },
    { key: 'x2', type: 'number', group: 'pts', label: L('P₂: x-Wert', 'P₂: x-value'), min: -6, max: 6, step: 0.5, default: 2 },
    { key: 'y2', type: 'number', group: 'pts', label: L('P₂: y-Wert', 'P₂: y-value'), min: -6, max: 6, step: 0.5, default: 3 },
    { key: 'x3', type: 'number', group: 'pts', label: L('P₃: x-Wert', 'P₃: x-value'), min: -6, max: 6, step: 0.5, default: 4 },
    { key: 'y3', type: 'number', group: 'pts', label: L('P₃: y-Wert', 'P₃: y-value'), min: -6, max: 6, step: 0.5, default: -1 },
    { key: 'calc', type: 'boolean', group: 'view', label: L('Rechenweg und Funktionsterm', 'Working and equation'), help: L('Aus: Rechenweg, Term und Scheitel verdeckt (für Aufgaben).', 'Off: working, equation and vertex hidden (for tasks).'), default: true },
    { key: 'vtx', type: 'boolean', group: 'view', label: L('Scheitelpunkt und Symmetrieachse', 'Vertex and axis of symmetry'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'solve', label: L('Rechenweg Schritt für Schritt', 'Step-by-step solution'), primary: true },
    { id: 'throw', label: L('Ball werfen', 'Throw the ball'), visibleIf: (v) => v.scene === 'ball' },
  ],
  readouts: [
    { key: 'pts', label: L('Punkte', 'Points') },
    { key: 'lgs', label: L('Gleichungssystem', 'System of equations'), spoiler: true },
    { key: 'abc', label: L('Lösung', 'Solution'), spoiler: true },
    { key: 'eq', label: L('Funktionsterm', 'Equation'), spoiler: true },
    { key: 'S', label: L('Scheitelpunkt', 'Vertex'), spoiler: true },
    { key: 'note', label: L('Sonderfall', 'Special case'), spoiler: true },
  ],
  resultsParam: 'calc',
  presets: [
    { id: 'start', label: L('Drei Punkte, eine Parabel', 'Three points, one parabola'), values: {} },
    { id: 'vertex', label: L('Ein Punkt ist der Scheitel', 'One point is the vertex'), values: { way: 'vertex', x1: -1, y1: 2, x2: 1, y2: -2, x3: 2, y3: -1 } },
    { id: 'roots', label: L('Zwei Nullstellen gegeben', 'Two zeros given'), values: { way: 'roots', x1: -1, y1: 0, x2: 3, y2: 0, x3: 1, y3: 4 } },
    { id: 'line', label: L('Punkte auf einer Geraden', 'Points on a line'), values: { x1: -2, y1: -3, x2: 0, y2: 1, x3: 2, y3: 5 } },
    { id: 'samex', label: L('Gleiches x: keine Funktion', 'Same x: not a function'), values: { x1: 1, y1: 3, x2: 1, y2: -1.5, x3: 3.5, y3: 1 } },
    { id: 'ball', label: L('Wurfbahn eines Balls', 'Path of a thrown ball'), values: { scene: 'ball', x1: -5, y1: 1, x2: -3, y2: 4, x3: 3, y3: 1 } },
    { id: 'bridge', label: L('Brückenbogen', 'Bridge arch'), values: { scene: 'bridge', x1: -5, y1: 0, x2: 0, y2: 5, x3: 5, y3: 0 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit drei ziehbaren Punkten P₁, P₂, P₃ und der Parabel y = ax² + bx + c durch diese Punkte. Daneben der Rechenweg: Einsetzen der Punkte ergibt ein lineares Gleichungssystem, das Schritt für Schritt gelöst wird.',
      card: 'Rechenweg',
      wayLgs: 'Gleichungssystem',
      wayVertex: 'Scheitelform',
      wayRoots: 'Nullstellenform',
      waySpecial: 'Sonderfall',
      ansatz: 'Ansatz',
      ansatzS: 'Ansatz mit S',
      cap1: 'Punkte einsetzen',
      cap2: 'c eliminieren',
      cap2d: 'c ablesen und einsetzen',
      cap3: 'b eliminieren → a',
      cap4: 'zurückrechnen: b und c',
      cap5: 'Ergebnis',
      capV1: 'Scheitel ablesen',
      capV2: 'Punkt einsetzen → a',
      capV3: 'ausmultiplizieren',
      capV4: 'Probe',
      capR1: 'Nullstellen ablesen',
      capCase: 'Was ist hier los?',
      aIn: 'a in IV',
      abIn: 'a, b in {r}',
      cIn: 'c in {r}',
      from: 'aus {r}',
      vertexNote: 'Scheitelform',
      rootsNote: 'Nullstellenform',
      expanded: 'ausmultipliziert',
      check: 'Probe',
      contradiction: 'Widerspruch!',
      alwaysTrue: 'immer wahr',
      noVertex: 'Kein Punkt ist der Scheitel – also mit dem Gleichungssystem:',
      noRoots: 'Nicht genau zwei Punkte auf der x-Achse – also mit dem Gleichungssystem:',
      lineText: 'a = 0: Die drei Punkte liegen auf einer Geraden. Es gibt keine Parabel durch sie – nur diese Gerade.',
      sameXText: '{p} und {q} haben denselben x-Wert, aber verschiedene y-Werte. Eine Funktion ordnet jedem x genau ein y zu – keine Parabel (und keine Gerade) geht durch alle drei Punkte.',
      samePtText: '{p} und {q} fallen zusammen. Es bleiben nur zwei Gleichungen für drei Unbekannte: Unendlich viele Parabeln gehen durch die Punkte.',
      samePt3Text: 'Alle drei Punkte fallen zusammen: Unendlich viele Parabeln gehen durch diesen einen Punkt.',
      hidden: 'Rechenweg ausgeblendet. Die Schaltfläche „Rechenweg Schritt für Schritt“ zeigt ihn.',
      lineBadge: 'a = 0: Gerade, keine Parabel',
      sameXBadge: 'gleiches x: keine Funktion',
      samePtBadge: 'unendlich viele Parabeln',
      axisXm: 'x in m',
      axisYm: 'y in m',
      ball: 'Ball',
    },
    en: {
      canvas: 'Coordinate system with three draggable points P₁, P₂, P₃ and the parabola y = ax² + bx + c through them. Next to it the working: substituting the points gives a system of linear equations that is solved step by step.',
      card: 'Working',
      wayLgs: 'System of equations',
      wayVertex: 'Vertex form',
      wayRoots: 'Factored form',
      waySpecial: 'Special case',
      ansatz: 'Set-up',
      ansatzS: 'Set-up with S',
      cap1: 'Substitute the points',
      cap2: 'Eliminate c',
      cap2d: 'Read off c and substitute',
      cap3: 'Eliminate b → a',
      cap4: 'Back-substitute: b and c',
      cap5: 'Result',
      capV1: 'Read off the vertex',
      capV2: 'Substitute a point → a',
      capV3: 'Expand',
      capV4: 'Check',
      capR1: 'Read off the zeros',
      capCase: 'What is going on?',
      aIn: 'a in IV',
      abIn: 'a, b in {r}',
      cIn: 'c in {r}',
      from: 'from {r}',
      vertexNote: 'vertex form',
      rootsNote: 'factored form',
      expanded: 'expanded',
      check: 'check',
      contradiction: 'contradiction!',
      alwaysTrue: 'always true',
      noVertex: 'None of the points is the vertex – so use the system of equations:',
      noRoots: 'Not exactly two points on the x-axis – so use the system of equations:',
      lineText: 'a = 0: the three points lie on a line. There is no parabola through them – only this line.',
      sameXText: '{p} and {q} have the same x-value but different y-values. A function assigns exactly one y to each x – no parabola (and no line) passes through all three points.',
      samePtText: '{p} and {q} coincide. Only two equations remain for three unknowns: infinitely many parabolas pass through the points.',
      samePt3Text: 'All three points coincide: infinitely many parabolas pass through this single point.',
      hidden: 'Working hidden. The button “Step-by-step solution” shows it.',
      lineBadge: 'a = 0: a line, not a parabola',
      sameXBadge: 'same x: not a function',
      samePtBadge: 'infinitely many parabolas',
      axisXm: 'x in m',
      axisYm: 'y in m',
      ball: 'Ball',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const tr = (key: string, vars: Record<string, string> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (all, k: string) => vars[k] ?? all);
    const editable = () => !ctx.locked;

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { f: s[0]!, warn: s[1]!, pts: [s[3]!, s[2]!, s[4]!] as const, vtx: s[5]! };
    };
    const palette = (): Record<string, string> => {
      const c = C();
      return { p1: c.pts[0], p2: c.pts[1], p3: c.pts[2], f: c.f, w: c.warn, v: c.vtx, m: th().muted };
    };
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.93)');

    /* ---------- Aufteilung ---------- */

    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wide()) {
        const ph = Math.round(h * 0.5);
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 4, y: ph + 8, w: w - 8, h: h - ph - 12 } };
      }
      const colW = Math.round(Math.min(410, Math.max(258, w * 0.4)));
      return { plot: { x: 0, y: 0, w: w - colW - 6, h }, col: { x: w - colW, y: 6, w: colW - 6, h: h - 12 } };
    }
    const textSize = () => {
      const w = surface.width;
      return !wide() ? 12.5 : w < 700 ? 12 : w < 900 ? 12.5 : 13.5;
    };

    const plot = new Plot(surface, { x: [-7.3, 7.3], y: [-7.3, 7.3], region: () => regions().plot, xAxis: { label: 'x' }, yAxis: { label: 'y' } });

    /* ---------- Zustand ---------- */

    const exact = (): Points => [
      { x: p.x1, y: p.y1 },
      { x: p.x2, y: p.y2 },
      { x: p.x3, y: p.y3 },
    ];
    const X = [new Chan(p.x1), new Chan(p.x2), new Chan(p.x3)];
    const Y = [new Chan(p.y1), new Chan(p.y2), new Chan(p.y3)];
    const shownPts = (): Points => [
      { x: X[0]!.v, y: Y[0]!.v },
      { x: X[1]!.v, y: Y[1]!.v },
      { x: X[2]!.v, y: Y[2]!.v },
    ];
    let fit: Fit = fitParabola(exact());
    // weiche Überblendungen der Sonderfälle
    const kLine = new Chan(fit.kind === 'line' ? 1 : 0);
    const kSameX = new Chan(fit.kind === 'sameX' ? 1 : 0);
    const kSamePt = new Chan(fit.kind === 'samePoint' ? 1 : 0);
    const kScene = { ball: new Chan(p.scene === 'ball' ? 1 : 0), bridge: new Chan(p.scene === 'bridge' ? 1 : 0) };
    const kVtx = new Chan(p.vtx && p.calc ? 1 : 0);
    const kCalc = new Chan(p.calc ? 1 : 0);

    let story: Story | null = null;
    let flight: Flight | null = null;
    let intro: number | null = reduced() ? null : performance.now();
    let lastTime = performance.now();
    let lastDrag = -Infinity;
    let dragIdx = -1;
    const snapAt = [-Infinity, -Infinity, -Infinity];
    const rowStates = new Map<string, RowState>();
    let cardH: number | null = null;

    const dragging = () => performance.now() - lastDrag < 300;

    /* ---------- Griffe ---------- */

    for (let i = 0; i < 3; i++) {
      plot.addHandle({
        get: () => [X[i]!.v, Y[i]!.v],
        set: (x, y) => {
          lastDrag = performance.now();
          dragIdx = i;
          story = null;
          if (i === 0) ctx.set({ x1: x, y1: y });
          else if (i === 1) ctx.set({ x2: x, y2: y });
          else ctx.set({ x3: x, y3: y });
        },
        enabled: editable,
        color: () => C().pts[i]!,
      });
    }

    /* ---------- Formeln ---------- */

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit2(src: string, maxW: number, size: number, color: string, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    /** Bruch als Formeltext: abbrechende Dezimalzahl (≤ 3 Stellen) oder gekürzter Bruch. */
    function rs(q: Rational, asFrac = false): string {
      const dec = decimals(q, 3);
      if (q.d === 1 || (!asFrac && dec !== null)) return fmt.num(toNumber(q), 3);
      return `${q.n < 0 ? '−' : ''}\\f{${Math.abs(q.n)}}{${q.d}}`;
    }
    const absR = (q: Rational) => rat(Math.abs(q.n), q.d);
    const colored = (s: string, col?: string) => (col ? `\\c{${col}}{${s}}` : s);

    interface Term {
      q: Rational;
      v: string;
      col?: string;
      frac?: boolean;
    }
    /** Summe von Termen wie „4a − 2b + c“ (Nullen fallen weg, Einsen vor Variablen auch). */
    function sumSrc(terms: Term[]): string {
      let s = '';
      for (const t of terms) {
        if (isZero(t.q)) continue;
        const negT = t.q.n < 0;
        const abs = absR(t.q);
        const num = t.v && equals(abs, ONE) ? '' : rs(abs, t.frac);
        if (!s) s = negT && t.col && num ? `${colored(`−${num}`, t.col)}${t.v}` : `${negT ? '−' : ''}${colored(num, t.col)}${t.v}`;
        else s += `${negT ? ' − ' : ' + '}${colored(num, t.col)}${t.v}`;
      }
      return s || '0';
    }
    /** (x − 3), (x + 1) bzw. x */
    function shiftSrc(x0: Rational, col?: string): string {
      if (isZero(x0)) return 'x';
      return `(x ${x0.n > 0 ? '−' : '+'} ${colored(rs(absR(x0)), col)})`;
    }
    const polySrc = (a: Rational, b: Rational, c: Rational) =>
      sumSrc([
        { q: a, v: 'x²', frac: true },
        { q: b, v: 'x', frac: true },
        { q: c, v: '', frac: true },
      ]);
    const R = (x: number) => fromDecimal(x);
    const numCol = (x: number, col: string) => colored(fmt.num(x, 3), col);
    const parCol = (x: number, col: string) => (x < 0 ? `(${numCol(x, col)})` : numCol(x, col));
    const ptName = (i: number) => `P_${i + 1}`;
    const ptNamePlain = (i: number) => `P${'₁₂₃'[i]}`;
    const solved = (name: string, q: Rational) => `\\c{f}{\\b{${name} = ${rs(q, true)}}}`;

    /* ---------- Rechenweg als Zeilen ---------- */

    function baseRows(pts: Points, rows: Row[]): void {
      pts.forEach((pt, i) => {
        const col = PT_KEYS[i]!;
        const xq = R(pt.x);
        rows.push({
          key: `base${i}`,
          kind: 'eq',
          tag: ROMAN[i],
          col: C().pts[i],
          pt: i,
          cap: i === 0 ? ctx.t('cap1') : undefined,
          sub: `${numCol(pt.y, col)} = a·${pt.x < 0 ? `(${numCol(pt.x, col)})²` : `${numCol(pt.x, col)}²`} + b·${parCol(pt.x, col)} + c`,
          f: `${sumSrc([
            { q: mul(xq, xq), v: 'a', col },
            { q: xq, v: 'b', col },
            { q: ONE, v: 'c' },
          ])} = ${numCol(pt.y, col)}`,
          note: ptNamePlain(i),
        });
      });
    }

    function lgsRows(pts: Points, rows: Row[]): void {
      const d = derive(pts)!;
      baseRows(pts, rows);
      const e2 = (e: { p: Rational; q: Rational; r: Rational }) =>
        `${sumSrc([
          { q: e.p, v: 'a' },
          { q: e.q, v: 'b' },
        ])} = ${rs(e.r)}`;
      const from = (fr: [number, number]) => (fr[1] < 0 ? tr('cIn', { r: ROMAN[fr[0]]! }) : `${ROMAN[fr[0]]} − ${ROMAN[fr[1]]}`);
      rows.push({ key: 'e4', kind: 'eq', tag: 'IV', f: e2(d.e4), note: from(d.from4), sep: true, cap: ctx.t(d.cDirect !== null ? 'cap2d' : 'cap2') });
      rows.push({ key: 'e5', kind: 'eq', tag: 'V', f: e2(d.e5), note: from(d.from5) });
      const k = (q: Rational, name: string) => (equals(q, ONE) ? name : `${rs(q)}·${name}`);
      const aLhs = sumSrc([{ q: d.aCoef, v: 'a' }]);
      const aSrc = equals(d.aCoef, ONE) ? solved('a', d.a) : `${aLhs} = ${rs(d.aRhs)}  ⇒  ${solved('a', d.a)}`;
      rows.push({ key: 'ea', kind: 'eq', f: aSrc, note: d.k5.n < 0 ? `${k(d.k4, 'IV')} + ${k(rat(-d.k5.n, d.k5.d), 'V')}` : `${k(d.k4, 'IV')} − ${k(d.k5, 'V')}`, sep: true, cap: ctx.t('cap3') });
      const bLhs = sumSrc([
        { q: d.pa4, v: '' },
        { q: d.e4.q, v: 'b' },
      ]);
      const bSrc = equals(d.e4.q, ONE) && isZero(d.pa4) ? solved('b', d.b) : `${bLhs} = ${rs(d.e4.r)}  ⇒  ${solved('b', d.b)}`;
      rows.push({ key: 'eb', kind: 'eq', f: bSrc, note: ctx.t('aIn'), cap: ctx.t('cap4') });
      if (d.cDirect !== null) {
        rows.push({ key: 'ec', kind: 'eq', f: solved('c', d.c), note: tr('from', { r: ROMAN[d.cDirect]! }) });
      } else {
        const eI = d.base[d.cFrom]!;
        const lhs = sumSrc([
          { q: mul(eI.coef[0], d.a), v: '' },
          { q: mul(eI.coef[1], d.b), v: '' },
          { q: ONE, v: 'c' },
        ]);
        rows.push({ key: 'ec', kind: 'eq', f: `${lhs} = ${rs(eI.rhs)}  ⇒  ${solved('c', d.c)}`, note: tr('abIn', { r: ROMAN[d.cFrom]! }) });
      }
      rows.push({ key: 'res', kind: 'result', f: `f(x) = ${polySrc(d.a, d.b, d.c)}`, cap: ctx.t('cap5') });
      if (isZero(d.a)) rows.push({ key: 'lineTxt', kind: 'text', f: ctx.t('lineText') });
    }

    function buildRows(): { chip: string; rows: Row[] } {
      const pts = exact();
      const rows: Row[] = [];
      const ansatz: Row = { key: 'ansatz', kind: 'eq', tag: '', f: 'y = a\u200Bx² + b\u200Bx + c', note: ctx.t('ansatz') };
      if (!p.calc) {
        rows.push(ansatz, { key: 'hidden', kind: 'hint', f: ctx.t('hidden') });
        return { chip: ctx.t('wayLgs'), rows };
      }
      const deg = degenerate(pts);
      if (deg) {
        rows.push(ansatz);
        baseRows(pts, rows);
        const [i, j] = deg.pair;
        const diff = pairDifference(pts, deg.pair);
        const ok = isZero(diff);
        rows.push({ key: 'diff', kind: ok ? 'eq' : 'warn', tag: '', f: `0 = ${rs(diff)}`, note: `${ROMAN[j]} − ${ROMAN[i]}: ${ctx.t(ok ? 'alwaysTrue' : 'contradiction')}`, sep: true, cap: ctx.t('capCase') });
        const all3 = deg.kind === 'samePoint' && pts.every((q) => q.x === pts[0].x && q.y === pts[0].y);
        const txt = deg.kind === 'sameX' ? tr('sameXText', { p: ptNamePlain(i), q: ptNamePlain(j) }) : all3 ? ctx.t('samePt3Text') : tr('samePtText', { p: ptNamePlain(i), q: ptNamePlain(j) });
        rows.push({ key: 'caseTxt', kind: 'text', f: txt });
        return { chip: ctx.t('waySpecial'), rows };
      }
      if (p.way === 'vertex') {
        const w = vertexWay(pts);
        if (w) {
          const col = PT_KEYS[w.s]!;
          const cj = PT_KEYS[w.j]!;
          const ck = PT_KEYS[w.k]!;
          const xs = R(pts[w.s]!.x);
          const ys = R(pts[w.s]!.y);
          const yPart = (c?: string) => (isZero(ys) ? '' : ` ${ys.n > 0 ? '+' : '−'} ${colored(rs(absR(ys)), c)}`);
          rows.push({ key: 'vA', kind: 'eq', tag: '', f: 'y = a(x − x_S)² + y_S', note: ctx.t('ansatz') });
          rows.push({ key: 'vS', kind: 'eq', tag: 'S', col: C().pts[w.s]!, pt: w.s, f: `y = a${shiftSrc(xs, col)}²${yPart(col)}`, note: `S = ${ptNamePlain(w.s)}`, cap: ctx.t('capV1') });
          const xj = pts[w.j]!.x;
          rows.push({
            key: 'vJ',
            kind: 'eq',
            tag: ROMAN[w.j],
            col: C().pts[w.j]!,
            pt: w.j,
            f: `${numCol(pts[w.j]!.y, cj)} = a·(${numCol(xj, cj)} ${xs.n >= 0 ? '−' : '+'} ${rs(absR(xs))})²${yPart()}`,
            note: ptNamePlain(w.j),
            sep: true,
            cap: ctx.t('capV2'),
          });
          rows.push({ key: 'vA2', kind: 'eq', f: equals(w.sq, ONE) ? solved('a', w.a) : `${sumSrc([{ q: w.sq, v: 'a' }])} = ${rs(w.dy)}  ⇒  ${solved('a', w.a)}` });
          const aTxt = equals(w.a, ONE) ? '' : equals(w.a, rat(-1)) ? '−' : `${rs(w.a, true)}·`;
          rows.push({ key: 'vF', kind: 'eq', f: `f(x) = ${aTxt}${shiftSrc(xs)}²${yPart()}`, note: ctx.t('vertexNote'), sep: true, cap: ctx.t('capV3') });
          rows.push({ key: 'res', kind: 'result', f: `f(x) = ${polySrc(w.a, w.b, w.c)}`, note: ctx.t('expanded') });
          const xk = R(pts[w.k]!.x);
          const dk = sub(xk, xs);
          const val = mul(w.a, mul(dk, dk));
          rows.push({
            key: 'vP',
            kind: 'eq',
            tag: ROMAN[w.k],
            col: C().pts[w.k]!,
            pt: w.k,
            f: `f(${numCol(pts[w.k]!.x, ck)}) = ${aTxt}${dk.n < 0 ? `(${rs(dk)})` : rs(dk)}²${yPart()} = ${numCol(toNumber(val) + toNumber(ys), ck)} ✓`,
            note: ctx.t('check'),
            sep: true,
            cap: ctx.t('capV4'),
          });
          return { chip: ctx.t('wayVertex'), rows };
        }
        rows.push(ansatz, { key: 'noWay', kind: 'hint', f: ctx.t('noVertex') });
      } else if (p.way === 'roots') {
        const w = rootsWay(pts);
        if (w) {
          const ci = PT_KEYS[w.i]!;
          const cj = PT_KEYS[w.j]!;
          const ck = PT_KEYS[w.k]!;
          const xi = R(pts[w.i]!.x);
          const xj = R(pts[w.j]!.x);
          const xk = pts[w.k]!.x;
          rows.push({ key: 'rA', kind: 'eq', tag: '', f: 'y = a(x − x_1)(x − x_2)', note: ctx.t('ansatz') });
          rows.push({ key: 'rN', kind: 'eq', tag: '', f: `x_1 = ${numCol(pts[w.i]!.x, ci)},  x_2 = ${numCol(pts[w.j]!.x, cj)}`, note: `${ptNamePlain(w.i)}, ${ptNamePlain(w.j)}`, cap: ctx.t('capR1') });
          rows.push({ key: 'rF0', kind: 'eq', tag: '', f: `y = a${shiftSrc(xi, ci)}${shiftSrc(xj, cj)}` });
          const fac = (x0: Rational) => (isZero(x0) ? numCol(xk, ck) : `(${numCol(xk, ck)} ${x0.n > 0 ? '−' : '+'} ${rs(absR(x0))})`);
          rows.push({ key: 'rK', kind: 'eq', tag: ROMAN[w.k], col: C().pts[w.k]!, pt: w.k, f: `${numCol(pts[w.k]!.y, ck)} = a·${fac(xi)}·${fac(xj)}`, note: ptNamePlain(w.k), sep: true, cap: ctx.t('capV2') });
          rows.push({ key: 'rA2', kind: 'eq', f: equals(w.prod, ONE) ? solved('a', w.a) : `${sumSrc([{ q: w.prod, v: 'a' }])} = ${numCol(pts[w.k]!.y, ck)}  ⇒  ${solved('a', w.a)}` });
          const aTxt = equals(w.a, ONE) ? '' : equals(w.a, rat(-1)) ? '−' : `${rs(w.a, true)}·`;
          rows.push({ key: 'rF', kind: 'eq', f: `f(x) = ${aTxt}${shiftSrc(xi)}${shiftSrc(xj)}`, note: ctx.t('rootsNote'), sep: true, cap: ctx.t('capV3') });
          rows.push({ key: 'res', kind: 'result', f: `f(x) = ${polySrc(w.a, w.b, w.c)}`, note: ctx.t('expanded') });
          return { chip: ctx.t('wayRoots'), rows };
        }
        rows.push(ansatz, { key: 'noWay', kind: 'hint', f: ctx.t('noRoots') });
      } else rows.push(ansatz);
      lgsRows(pts, rows);
      return { chip: ctx.t('wayLgs'), rows };
    }

    /* ---------- Ergebnisse (Text) ---------- */

    function htmlRat(q: Rational): string {
      if (q.d === 1) return fmt.num(q.n, 0);
      const f = `${q.n < 0 ? '−' : ''}<span class="frac"><span>${Math.abs(q.n)}</span><span>${q.d}</span></span>`;
      const dec = decimals(q, 3);
      return dec !== null ? `${f} = ${fmt.num(toNumber(q), 3)}` : `${f} ≈ ${fmt.num(toNumber(q), 3)}`;
    }
    function htmlPoly(a: Rational, b: Rational, c: Rational): string {
      const v = (s: string) => `<var>${s}</var>`;
      const parts: string[] = [];
      const add = (q: Rational, tail: string) => {
        if (isZero(q)) return;
        const abs = absR(q);
        const num = tail && equals(abs, ONE) ? '' : abs.d === 1 ? fmt.num(abs.n, 0) : `<span class="frac"><span>${abs.n}</span><span>${abs.d}</span></span>`;
        parts.push(`${parts.length ? (q.n < 0 ? ' − ' : ' + ') : q.n < 0 ? '−' : ''}${num}${tail}`);
      };
      add(a, `${v('x')}<sup>2</sup>`);
      add(b, v('x'));
      add(c, '');
      return `${v('f')}(${v('x')}) = ${parts.join('') || '0'}`;
    }

    function updateReadouts(): void {
      const pts = exact();
      const de = ctx.lang === 'de';
      ctx.readout('pts', pts.map((q, i) => `P${'₁₂₃'[i]}${fmt.point(q.x, q.y)}`).join(',  '));
      const sys = pts
        .map((q) => {
          const x = R(q.x);
          const t: string[] = [];
          const x2 = mul(x, x);
          const term = (k: Rational, name: string) => {
            if (isZero(k)) return;
            const abs = absR(k);
            const num = equals(abs, ONE) ? '' : fmt.num(toNumber(abs), 3);
            t.push(`${t.length ? (k.n < 0 ? ' − ' : ' + ') : k.n < 0 ? '−' : ''}${num}<var>${name}</var>`);
          };
          term(x2, 'a');
          term(x, 'b');
          term(ONE, 'c');
          return `${t.join('')} = ${fmt.num(q.y, 3)}`;
        })
        .map((s, i) => `${ROMAN[i]}: ${s}`)
        .join('<br>');
      ctx.readout('lgs', { html: sys });
      const f = fitParabola(pts);
      if (f.kind === 'sameX' || f.kind === 'samePoint') {
        ctx.readout('abc', de ? (f.kind === 'sameX' ? 'keine Lösung (Widerspruch)' : 'unendlich viele Lösungen') : f.kind === 'sameX' ? 'no solution (contradiction)' : 'infinitely many solutions');
        ctx.readout('eq', null);
        ctx.readout('S', null);
        const [i, j] = f.pair!;
        ctx.readout('note', f.kind === 'sameX' ? tr('sameXText', { p: ptNamePlain(i), q: ptNamePlain(j) }) : tr('samePtText', { p: ptNamePlain(i), q: ptNamePlain(j) }));
        return;
      }
      ctx.readout('abc', { html: `<var>a</var> = ${htmlRat(f.a)}, &nbsp;<var>b</var> = ${htmlRat(f.b)}, &nbsp;<var>c</var> = ${htmlRat(f.c)}` });
      ctx.readout('eq', { html: htmlPoly(f.a, f.b, f.c) });
      const s = vertexOf(f.a, f.b, f.c);
      ctx.readout('S', s ? `S${fmt.point(toNumber(s.x), toNumber(s.y), 3)}` : null);
      ctx.readout('note', f.kind === 'line' ? ctx.t('lineText') : null);
    }

    /* ---------- Zeichnen: Hilfen ---------- */

    function pill(x: number, y: number, src: string, opts: { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; maxW?: number } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? textSize();
      const box = opts.maxW ? fit2(src, opts.maxW, size, opts.color ?? th().text, 700) : formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      const align = opts.align ?? 'center';
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 9, y: base - box.asc - 6, w: box.w + 18, h: box.asc + box.desc + 12 };
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 11);
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.5;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 11);
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    /** Formel mit hellem Halo direkt im Koordinatensystem. */
    function label(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = textSize(), alpha = 1): Rect {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      g.save();
      g.globalAlpha = alpha * 0.85;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = alpha;
      box.draw(g, left, base);
      g.restore();
      return { x: left - 4, y: base - box.asc - 2, w: box.w + 8, h: box.asc + box.desc + 4 };
    }

    function strokeFn(f: (x: number) => number, x0: number, x1: number, color: string, width: number, opts: { dash?: number[]; glow?: boolean; alpha?: number } = {}): void {
      if (x1 <= x0) return;
      const g = surface.g;
      const { yMin, yMax } = plot.bounds;
      const span = yMax - yMin;
      const n = Math.max(40, Math.round((plot.px(x1) - plot.px(x0)) / 2.5));
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      if (opts.glow) {
        g.shadowColor = th().dark ? mixColor(color, '#000000', 0, 0.55) : mixColor(color, '#ffffff', 0, 0.35);
        g.shadowBlur = th().dark ? 10 : 6;
      }
      g.beginPath();
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        const y = Math.max(yMin - span, Math.min(yMax + span, f(x)));
        if (i) g.lineTo(plot.px(x), plot.py(y));
        else g.moveTo(plot.px(x), plot.py(y));
      }
      g.stroke();
      g.restore();
    }

    function dot(x: number, y: number, color: string, r: number): void {
      const g = surface.g;
      if (r <= 0.2) return;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.35));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
    }

    /* ---------- Szene ---------- */

    interface Shown {
      pts: Points;
      k: { a: number; b: number; c: number } | null;
      /** 0…1: wie deutlich die Kurve zu sehen ist (verblasst bei fast gleichen x) */
      w: number;
    }
    function shownState(): Shown {
      const pts = shownPts();
      const k = coefficients(pts);
      let minDx = Infinity;
      for (const [i, j] of [
        [0, 1],
        [0, 2],
        [1, 2],
      ] as const)
        minDx = Math.min(minDx, Math.abs(pts[i].x - pts[j].x));
      const w = k ? clamp01((minDx - 0.03) / 0.4) : 0;
      return { pts, k, w };
    }

    function drawScene(s: Shown): void {
      const g = surface.g;
      const r = plot.rect;
      const y0 = plot.py(0);
      const kb = kScene.ball.v;
      const kr = kScene.bridge.v;
      if (kb > 0.01 && y0 < r.y + r.h) {
        // Wiese unterhalb von y = 0
        const top = Math.max(r.y, y0);
        g.save();
        g.globalAlpha = kb;
        const grad = g.createLinearGradient(0, top, 0, r.y + r.h);
        const grass = th().series[2]!;
        grad.addColorStop(0, mixColor(grass, th().bg, th().dark ? 0.55 : 0.62));
        grad.addColorStop(1, mixColor(grass, th().bg, th().dark ? 0.8 : 0.86));
        g.fillStyle = grad;
        g.fillRect(r.x, top, r.w, r.y + r.h - top);
        g.strokeStyle = mixColor(grass, th().bg, th().dark ? 0.2 : 0.25);
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(r.x, top);
        g.lineTo(r.x + r.w, top);
        g.stroke();
        // Grashalme
        g.strokeStyle = mixColor(grass, th().bg, th().dark ? 0.3 : 0.35);
        g.lineWidth = 1.4;
        g.beginPath();
        for (let x = r.x + 6; x < r.x + r.w; x += 11) {
          const h = 4 + ((x * 7) % 5);
          g.moveTo(x, top);
          g.lineTo(x + 2, top - h);
        }
        g.stroke();
        g.restore();
      }
      const river = ctx.images.get('river');
      if (kr > 0.01 && river) drawRiverPhoto(river, y0 + 10, kr);
      if (kr > 0.01 && y0 < r.y + r.h) {
        // Fluss unterhalb von y = 0
        const top = Math.max(r.y, y0 + 10);
        g.save();
        g.globalAlpha = kr * (river ? 0 : 1);
        const water = th().series[0]!;
        const grad = g.createLinearGradient(0, top, 0, r.y + r.h);
        grad.addColorStop(0, mixColor(water, th().bg, th().dark ? 0.62 : 0.72));
        grad.addColorStop(1, mixColor(water, th().bg, th().dark ? 0.4 : 0.5));
        g.fillStyle = grad;
        g.fillRect(r.x, top, r.w, r.y + r.h - top);
        g.strokeStyle = mixColor(water, th().bg, 0.35, 0.5);
        g.lineWidth = 1.5;
        const ph = 0.6;
        for (let k = 0; k < 4; k++) {
          const yy = top + 12 + k * 16;
          if (yy > r.y + r.h - 4) break;
          g.beginPath();
          for (let x = r.x; x <= r.x + r.w; x += 6) {
            const yv = yy + Math.sin(x / 18 + ph + k) * 2;
            if (x === r.x) g.moveTo(x, yv);
            else g.lineTo(x, yv);
          }
          g.stroke();
        }
        // Ufer
        const earth = th().dark ? '#5a4a3a' : '#c9b394';
        g.fillStyle = earth;
        const k = s.k;
        let r1 = -Infinity;
        let r2 = Infinity;
        if (k && k.a < -1e-6) {
          const disc = k.b * k.b - 4 * k.a * k.c;
          if (disc > 0) {
            r1 = (-k.b + Math.sqrt(disc)) / (2 * k.a);
            r2 = (-k.b - Math.sqrt(disc)) / (2 * k.a);
          }
        }
        const bankL = Number.isFinite(r1) ? plot.px(r1) : r.x + r.w * 0.12;
        const bankR = Number.isFinite(r2) ? plot.px(r2) : r.x + r.w * 0.88;
        g.beginPath();
        g.moveTo(r.x, y0);
        g.lineTo(bankL, y0);
        g.lineTo(bankL - 14, r.y + r.h);
        g.lineTo(r.x, r.y + r.h);
        g.closePath();
        g.moveTo(r.x + r.w, y0);
        g.lineTo(bankR, y0);
        g.lineTo(bankR + 14, r.y + r.h);
        g.lineTo(r.x + r.w, r.y + r.h);
        g.closePath();
        g.globalAlpha = kr * (river ? 1 : 0.85);
        if (river) {
          // vor dem Foto: deckende Uferböschung mit Grasnarbe
          const eg = g.createLinearGradient(0, y0, 0, r.y + r.h);
          eg.addColorStop(0, th().dark ? '#5d4c3a' : '#b59a77');
          eg.addColorStop(1, th().dark ? '#3e3226' : '#8f7656');
          g.fillStyle = eg;
          g.shadowColor = 'rgba(0,0,0,0.25)';
          g.shadowBlur = 8;
        }
        g.fill();
        if (river) {
          g.shadowBlur = 0;
          g.strokeStyle = mixColor(th().series[2]!, '#4d7a35', 0.6);
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(r.x, y0 + 1);
          g.lineTo(bankL, y0 + 1);
          g.moveTo(r.x + r.w, y0 + 1);
          g.lineTo(bankR, y0 + 1);
          g.stroke();
        }
        g.restore();
      }
    }

    /** Wasserlinie im Foto `fluss.webp` (Bildzeile am fernen Ufer, gemessen). */
    const RIVER_WATER = 680;
    /**
     * Flusslandschaft als Hintergrund des Brückenbogens: gleichmäßig skaliert, die Wasserlinie
     * des Fotos liegt auf der Höhe des gezeichneten Wasserspiegels (knapp unter y = 0).
     * Gedämpft, damit Gitter, Graph und Punkte maßgeblich bleiben.
     */
    function drawRiverPhoto(img: HTMLImageElement, waterY: number, alpha: number): void {
      const g = surface.g;
      const r = plot.rect;
      const wl = Math.max(r.y, Math.min(r.y + r.h, waterY));
      const need = Math.max(r.w / img.width, (wl - r.y) / RIVER_WATER, (r.y + r.h - wl) / (img.height - RIVER_WATER));
      // Größe in kleinen Stufen, damit das vorab skalierte Bild beim Verschieben nicht ständig neu entsteht
      const k = Math.pow(2, Math.ceil(Math.log2(need) * 24) / 24);
      const w = Math.round(img.width * k);
      const h = Math.round(img.height * k);
      const dark = th().dark;
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.globalAlpha = alpha;
      g.drawImage(scaledSprite(img, w, h, surface.dpr), r.x + (r.w - w) / 2, waterY - RIVER_WATER * k, w, h);
      g.fillStyle = mixColor(th().bg, th().bg, 0, dark ? 0.62 : 0.45);
      g.fillRect(r.x, r.y, r.w, r.h);
      g.restore();
    }

    /** Brücke: Fahrbahn über dem Bogen, Hänger, Bogen als Steinband. */
    function drawBridge(s: Shown): void {
      const k = s.k;
      const kr = kScene.bridge.v * s.w;
      if (kr < 0.01 || !k || k.a > -1e-6) return;
      const disc = k.b * k.b - 4 * k.a * k.c;
      if (disc <= 0) return;
      const r1 = (-k.b + Math.sqrt(disc)) / (2 * k.a);
      const r2 = (-k.b - Math.sqrt(disc)) / (2 * k.a);
      const f = (x: number) => k.a * x * x + k.b * x + k.c;
      const xv = -k.b / (2 * k.a);
      const yDeck = f(xv) + 0.35;
      const g = surface.g;
      const r = plot.rect;
      const stone = th().dark ? '#8d8476' : '#a39a8c';
      g.save();
      g.globalAlpha = kr;
      // Hänger
      g.strokeStyle = mixColor(th().muted, th().bg, 0.2);
      g.lineWidth = 1.6;
      g.beginPath();
      const step = Math.max(0.5, (r2 - r1) / 14);
      for (let x = r1 + step; x < r2 - step / 2; x += step) {
        g.moveTo(plot.px(x), plot.py(yDeck));
        g.lineTo(plot.px(x), plot.py(f(x)));
      }
      g.stroke();
      // Bogen als breites Band
      g.strokeStyle = stone;
      g.lineWidth = 11;
      g.lineCap = 'butt';
      g.beginPath();
      const n = 80;
      for (let i = 0; i <= n; i++) {
        const x = r1 + ((r2 - r1) * i) / n;
        if (i) g.lineTo(plot.px(x), plot.py(f(x)));
        else g.moveTo(plot.px(x), plot.py(f(x)));
      }
      g.stroke();
      // Fahrbahn
      const xl = Math.max(plot.bounds.xMin, r1 - 1.2);
      const xr = Math.min(plot.bounds.xMax, r2 + 1.2);
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? '#4a5262' : '#6b7280';
      const yy = plot.py(yDeck);
      roundRect(g, plot.px(xl), yy - 7, plot.px(xr) - plot.px(xl), 9, 3);
      g.fill();
      g.restore();
      // Pfeiler an den Enden der Fahrbahn
      g.fillStyle = stone;
      for (const x of [xl, xr]) {
        const px = plot.px(x);
        if (px < r.x - 10 || px > r.x + r.w + 10) continue;
        g.fillRect(px - 5, yy, 10, plot.py(0) - yy);
      }
      g.restore();
    }

    function drawPlot(now: number, s: Shown, k: { pts: number[]; curve: number; labels: number }): void {
      const g = surface.g;
      const c = C();
      const r = plot.rect;
      const size = textSize();
      plot.begin();
      drawScene(s);
      if (p.grid) plot.grid();
      plot.axes();

      // Sichtbarkeit der Kurve: Einstieg, Schritt-Animation, Sonderfälle
      let curveA = s.w;
      let reveal = k.curve;
      if (story) {
        const t = now - story.t0;
        const fadeOut = 1 - clamp01(t / 400);
        const grow = clamp01((t - story.resultAt) / 1300);
        curveA *= t < story.resultAt ? fadeOut * fadeOut : 1;
        reveal = t < story.resultAt ? (fadeOut > 0 ? 1 : 0) : ease.inOutCubic(grow);
      }
      const kk = s.k;
      const f = kk ? (x: number) => kk.a * x * x + kk.b * x + kk.c : null;

      // zusammenfallende Punkte: Schar von Parabeln
      if (kSamePt.v > 0.01) drawFan(s.pts, kSamePt.v * k.labels);

      // gleiche x-Werte: senkrechte Linie, die keine Funktion sein kann
      if (kSameX.v > 0.01 && fit.pair) {
        const [i, j] = fit.pair;
        const x = (s.pts[i]!.x + s.pts[j]!.x) / 2;
        const px = Math.round(plot.px(x)) + 0.5;
        g.save();
        g.globalAlpha = kSameX.v;
        g.strokeStyle = c.warn;
        g.lineWidth = 2.2;
        g.setLineDash([7, 6]);
        g.beginPath();
        g.moveTo(px, r.y);
        g.lineTo(px, r.y + r.h);
        g.stroke();
        g.restore();
        const right = px < r.x + r.w * 0.6;
        label(px + (right ? 9 : -9), r.y + r.h - 22, `x = ${fmt.num(x, 2)}`, c.warn, right ? 'left' : 'right', size, kSameX.v);
      }

      // Symmetrieachse und Scheitel
      if (f && kk && Math.abs(kk.a) > 1e-6 && kVtx.v > 0.01 && curveA > 0.01) {
        const xv = -kk.b / (2 * kk.a);
        const yv = f(xv);
        const va = kVtx.v * curveA * clamp01(Math.abs(kk.a) / 0.04) * (story ? clamp01((now - story.t0 - story.resultAt - 900) / 500) : k.labels);
        if (va > 0.01) {
          const px = Math.round(plot.px(xv)) + 0.5;
          g.save();
          g.globalAlpha = va * 0.8;
          g.strokeStyle = c.vtx;
          g.lineWidth = 1.6;
          g.setLineDash([4, 6]);
          g.beginPath();
          g.moveTo(px, r.y);
          g.lineTo(px, r.y + r.h);
          g.stroke();
          g.restore();
          const py = plot.py(yv);
          if (py > r.y + 8 && py < r.y + r.h - 8 && px > r.x && px < r.x + r.w) {
            g.save();
            g.globalAlpha = va;
            g.fillStyle = th().bg;
            g.strokeStyle = c.vtx;
            g.lineWidth = 2.4;
            g.beginPath();
            g.arc(px, py, 5.5, 0, TAU);
            g.fill();
            g.stroke();
            g.restore();
            const below = kk.a > 0;
            const near = s.pts.some((q) => Math.hypot(plot.px(q.x) - px, plot.py(q.y) - py) < 30);
            if (!near) label(px + 9, py + (below ? 16 : -16), `S(${fmt.num(xv, 2)} | ${fmt.num(yv, 2)})`, c.vtx, 'left', size - 1, va);
          }
        }
      }

      drawBridge(s);

      // Parabel (bzw. Gerade)
      if (f && curveA > 0.01 && reveal > 0) {
        const { xMin, xMax } = plot.bounds;
        strokeFn(f, xMin - 0.2, xMin - 0.2 + (xMax - xMin + 0.4) * reveal, c.f, 3.4, { glow: true, alpha: curveA });
      }

      drawFlight(now, f);

      // Punkte
      const story0 = story;
      s.pts.forEach((q, i) => {
        const px = plot.px(q.x);
        const py = plot.py(q.y);
        const col = c.pts[i]!;
        const pop = k.pts[i]!;
        if (pop <= 0.01) return;
        // Puls in der Schritt-Animation (Punkt wird eingesetzt)
        if (story0) {
          const t = now - story0.t0;
          rowsCache.forEach((row, ri) => {
            if (row.pt !== i) return;
            const dt2 = t - story0.starts[ri]!;
            if (dt2 < 0 || dt2 > 1100) return;
            const e = dt2 / 1100;
            g.save();
            g.globalAlpha = (1 - e) * 0.7;
            g.strokeStyle = col;
            g.lineWidth = 3 * (1 - e) + 1;
            g.beginPath();
            g.arc(px, py, 8 + e * 26, 0, TAU);
            g.stroke();
            g.restore();
          });
        }
        const snap = clamp01((now - snapAt[i]!) / 260);
        const bump = snap < 1 ? Math.sin(snap * Math.PI) * 0.18 : 0;
        const active = dragging() && dragIdx === i;
        dot(px, py, col, (active ? 8 : 7) * pop * (1 + bump));
      });
      // Beschriftungen der Punkte (nach außen, weg von der Kurve)
      const placed: Rect[] = [];
      s.pts.forEach((q, i) => {
        const a = k.pts[i]! * k.labels;
        if (a <= 0.02) return;
        const px = plot.px(q.x);
        const py = plot.py(q.y);
        let nx = 0.55;
        let ny = -1;
        if (kk && s.w > 0.3) {
          // Normale der Kurve, zur Außenseite (gegen die Öffnung) gerichtet
          const slope = (2 * kk.a * q.x + kk.b) * (plot.scale.y / plot.scale.x);
          const len = Math.hypot(slope, 1);
          const out = kk.a > 0 ? 1 : -1;
          nx = (slope / len) * out;
          ny = (1 / len) * out;
          if (Math.abs(kk.a) < 1e-6) {
            nx = slope / len;
            ny = -1 / len;
            if (ny > 0) {
              nx = -nx;
              ny = -ny;
            }
          }
        }
        const src = `${ptName(i)}(${fmt.num(Math.round(q.x * 2) / 2, 1)} | ${fmt.num(Math.round(q.y * 2) / 2, 1)})`;
        const box = formula(g, src, fstyle(size, c.pts[i]!, 700));
        let lx = px + nx * 20;
        let ly = py + ny * 18;
        let align: 'left' | 'center' | 'right' = Math.abs(nx) < 0.3 ? 'center' : nx > 0 ? 'left' : 'right';
        // im Bild halten
        const left = () => (align === 'left' ? lx : align === 'right' ? lx - box.w : lx - box.w / 2);
        if (left() < r.x + 4) {
          lx = r.x + 8;
          align = 'left';
        }
        if (left() + box.w > r.x + r.w - 4) {
          lx = r.x + r.w - 8;
          align = 'right';
        }
        ly = Math.max(r.y + 14, Math.min(r.y + r.h - 14, ly));
        // nicht auf andere Beschriftungen legen
        for (let tries = 0; tries < 3; tries++) {
          const bx = left();
          const hit = placed.find((pr) => bx < pr.x + pr.w && bx + box.w > pr.x && ly - 10 < pr.y + pr.h && ly + 10 > pr.y);
          if (!hit) break;
          ly = ly < hit.y + hit.h / 2 ? hit.y - 13 : hit.y + hit.h + 13;
        }
        placed.push(label(lx, ly, src, c.pts[i]!, align, size, a));
      });

      plot.end();

      // Term oben links (Zahlen gleiten mit)
      const tk = kCalc.v * s.w * (story ? clamp01((now - story.t0 - story.resultAt - 600) / 500) : k.labels);
      if (kk && tk > 0.01) {
        const a2 = Math.abs(kk.a) < 5e-4 ? 0 : kk.a;
        const term = sumSrc([
          { q: fromDecimal(Math.round(a2 * 100) / 100), v: 'x²' },
          { q: fromDecimal(Math.round(kk.b * 100) / 100), v: 'x' },
          { q: fromDecimal(Math.round(kk.c * 100) / 100), v: '' },
        ]);
        const approx = [kk.a, kk.b, kk.c].some((v) => Math.abs(v * 100 - Math.round(v * 100)) > 1e-6);
        const tsrc = `f(x) ${approx ? '≈' : '='} ${term}`;
        const tw = formula(g, tsrc, fstyle(size + 0.5, c.f, 700)).w;
        const ax = plot.px(0);
        const py0 = ax > r.x + 4 && ax < r.x + 12 + tw + 60 ? r.y + 50 : r.y + 24;
        const rr = pill(r.x + 12, py0, tsrc, { color: c.f, border: mixColor(c.f, th().bg, 0.45), align: 'left', size: size + 0.5, alpha: tk, maxW: r.w - 40 });
        if (kLine.v > 0.01) pill(r.x + 12, rr.y + rr.h + 18, ctx.t('lineBadge'), { color: c.warn, border: mixColor(c.warn, th().bg, 0.45), align: 'left', size: size - 1, alpha: kLine.v * tk, maxW: r.w - 40 });
      }
      if (kSameX.v > 0.01) pill(r.x + 12, r.y + 24, ctx.t('sameXBadge'), { color: c.warn, border: mixColor(c.warn, th().bg, 0.4), align: 'left', size: size - 0.5, alpha: kSameX.v * k.labels, maxW: r.w - 40 });
      else if (kSamePt.v > 0.01) pill(r.x + 12, r.y + 24, ctx.t('samePtBadge'), { color: th().text, border: mixColor(c.f, th().bg, 0.4), align: 'left', size: size - 0.5, alpha: kSamePt.v * k.labels, maxW: r.w - 40 });

      if (story) drawCaption(now, story);
    }

    /** Schar von Parabeln durch die verbleibenden Punkte. */
    function drawFan(pts: Points, alpha: number): void {
      const uniq: { x: number; y: number }[] = [];
      for (const q of pts) if (!uniq.some((u) => Math.abs(u.x - q.x) < 0.02 && Math.abs(u.y - q.y) < 0.02)) uniq.push(q);
      const c = C();
      const { xMin, xMax } = plot.bounds;
      const ks = [-1.2, -0.6, -0.25, 0.25, 0.6, 1.2];
      if (uniq.length === 2 && Math.abs(uniq[0]!.x - uniq[1]!.x) > 0.02) {
        const [u, v] = uniq as [{ x: number; y: number }, { x: number; y: number }];
        const m = (v.y - u.y) / (v.x - u.x);
        const line = (x: number) => u.y + m * (x - u.x);
        ks.forEach((kq, i) => strokeFn((x) => line(x) + kq * (x - u.x) * (x - v.x), xMin, xMax, c.f, 2, { alpha: alpha * (0.28 + 0.1 * (i % 2)), dash: [2, 5] }));
        strokeFn(line, xMin, xMax, c.f, 2, { alpha: alpha * 0.32, dash: [2, 5] });
      } else if (uniq.length >= 1) {
        const u = uniq[0]!;
        ks.forEach((kq) => strokeFn((x) => u.y + kq * (x - u.x) ** 2 + 0.6 * kq * (x - u.x), xMin, xMax, c.f, 2, { alpha: alpha * 0.3, dash: [2, 5] }));
      }
    }

    function drawFlight(now: number, f: ((x: number) => number) | null): void {
      if (!flight || !f) return;
      const g = surface.g;
      const t = (now - flight.t0) / flight.dur;
      const tc = clamp01(t);
      const xAt = (u: number) => lerp(flight!.xs, flight!.xe, u);
      const ballR = 9;
      const fade = 1 - clamp01((t - 1) / 0.6);
      // Stroboskop-Spuren
      g.save();
      for (let u = 0; u < tc; u += 0.07) {
        const x = xAt(u);
        g.globalAlpha = 0.22 * fade;
        g.fillStyle = th().series[1]!;
        g.beginPath();
        g.arc(plot.px(x), plot.py(f(x)), ballR * 0.55, 0, TAU);
        g.fill();
      }
      g.restore();
      const x = xAt(tc);
      const y = f(x);
      const px = plot.px(x);
      const py = plot.py(y);
      // Schatten auf dem Boden
      const gy = plot.py(0);
      const hgt = Math.max(0, y);
      g.save();
      g.globalAlpha = fade * 0.3 * (1 / (1 + hgt * 0.25));
      g.fillStyle = th().dark ? '#000000' : '#1f2937';
      g.beginPath();
      g.ellipse(px, gy, ballR * (1.1 + hgt * 0.08), ballR * 0.32, 0, 0, TAU);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = fade;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      const photo = ctx.images.get('ball');
      if (photo) {
        // Fußball, dreht sich im Flug (Abrollen entlang der Bahn)
        const R = ballR + 2;
        g.translate(px, py);
        g.rotate((px - plot.px(flight.xs)) / R);
        g.drawImage(scaledSprite(photo, 2 * R, 2 * R, surface.dpr), -R, -R, 2 * R, 2 * R);
        g.restore();
        return;
      }
      const grad = g.createRadialGradient(px - 3, py - 3, 1, px, py, ballR);
      grad.addColorStop(0, mixColor(th().series[1]!, '#ffffff', 0.55));
      grad.addColorStop(1, th().series[1]!);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(px, py, ballR, 0, TAU);
      g.fill();
      g.restore();
      // Naht des Balls dreht sich
      g.save();
      g.globalAlpha = fade * 0.6;
      g.strokeStyle = '#ffffff';
      g.lineWidth = 1.3;
      g.beginPath();
      const rot = tc * 9;
      g.arc(px, py, ballR * 0.62, rot, rot + Math.PI * 0.9);
      g.stroke();
      g.restore();
    }

    function drawCaption(now: number, s: Story): void {
      const r = plot.rect;
      const t = now - s.t0;
      let cap: string | null = null;
      let capStart = 0;
      let no = 0;
      rowsCache.forEach((row, i) => {
        if (row.cap && t >= s.starts[i]! - 150) {
          cap = row.cap;
          capStart = s.starts[i]!;
          no++;
        }
      });
      if (!cap) return;
      const fadeIn = clamp01((t - capStart + 150) / 350);
      const fadeOut = 1 - clamp01((t - (s.end - 600)) / 600);
      const alpha = Math.min(fadeIn, fadeOut);
      const src = `${'①②③④⑤⑥'[no - 1] ?? ''}  ${cap as string}`;
      pill(r.x + r.w / 2, r.y + r.h - 28 + (1 - ease.outCubic(fadeIn)) * 10, src, { color: th().text, border: C().f, size: textSize() + 0.5, alpha, maxW: r.w - 50 });
    }

    /* ---------- Karte: Rechenweg ---------- */

    let rowsCache: Row[] = [];
    let chipCache = '';
    function refreshRows(): void {
      const b = buildRows();
      rowsCache = b.rows;
      chipCache = b.chip;
    }

    function cardFrame(r: Rect, alpha: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha = alpha;
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 16;
      g.shadowOffsetY = 4;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.97)' : 'rgba(255,255,255,0.98)';
      roundRect(g, r.x, r.y, r.w, r.h, 13);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = alpha;
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 13);
      g.stroke();
      g.restore();
    }

    function wrap(textStr: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const words = textStr.split(' ');
      const lines: string[] = [];
      let cur = '';
      for (const w of words) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /** Höhe einer Zeile in Einheiten der Grundzeilenhöhe. */
    const rowWeight = (row: Row, lines: number) => (row.kind === 'text' || row.kind === 'hint' ? 0.2 + lines * 0.62 : row.kind === 'result' ? 1.3 : 1);

    function drawCard(col: Rect, now: number, dt: number, alpha: number, introT: number | null): boolean {
      const g = surface.g;
      let anim = false;
      const rows = rowsCache;
      let size = textSize() + (wide() ? 0.5 : 0);
      const pad = wide() ? 14 : 11;
      const inner = col.w - 2 * pad;
      const tagW = size * 2.3;
      const head = size * 2.4;
      // Text-Zeilen umbrechen, Grundzeilenhöhe bestimmen (Schrift ggf. kleiner)
      let lh = 0;
      let lineSets: string[][] = [];
      for (let tries = 0; tries < 8; tries++) {
        const font = `500 ${size - 0.5}px ${th().font}`;
        lineSets = rows.map((row) => (row.kind === 'text' || row.kind === 'hint' ? wrap(row.f, inner - (row.kind === 'text' ? 0 : 0), font) : []));
        const units = rows.reduce((sum, row, i) => sum + rowWeight(row, lineSets[i]!.length), 0);
        lh = (col.h - head - pad * 1.4) / units;
        if (lh >= size * 1.85 || size <= 10) break;
        size -= 0.5;
      }
      lh = Math.min(lh, size * 3.1);
      const units = rows.reduce((sum, row, i) => sum + rowWeight(row, lineSets[i]!.length), 0);
      const targetH = Math.min(col.h, head + pad * 1.4 + units * lh);
      if (cardH === null || reduced()) cardH = targetH;
      cardH += (targetH - cardH) * (1 - Math.exp(-dt / 0.12));
      if (Math.abs(cardH - targetH) > 0.5) anim = true;
      else cardH = targetH;
      const card = { x: col.x, y: col.y, w: col.w, h: cardH };
      cardFrame(card, alpha);

      g.save();
      g.beginPath();
      g.rect(card.x, card.y, card.w, card.h);
      g.clip();
      g.globalAlpha = alpha;
      // Kopf: Titel und Lösungsweg
      const title = formula(g, ctx.t('card'), fstyle(size - 0.5, th().muted, 800));
      const ty = card.y + pad + title.asc;
      title.draw(g, card.x + pad, ty);
      const chip = formula(g, chipCache, fstyle(size - 1.5, C().f, 700));
      const cx = card.x + card.w - pad - chip.w - 8;
      g.fillStyle = mixColor(C().f, th().bg, 0, th().dark ? 0.2 : 0.11);
      roundRect(g, cx - 2, ty - chip.asc - 4, chip.w + 12, chip.asc + chip.desc + 8, 8);
      g.fill();
      chip.draw(g, cx + 4, ty);

      // Zeilen: Ziellage
      let y = card.y + head;
      const st = story;
      const tS = st ? now - st.t0 : 0;
      const seen = new Set<string>();
      rows.forEach((row, i) => {
        const hgt = rowWeight(row, lineSets[i]!.length) * lh;
        const ty2 = y;
        y += hgt;
        let rs2 = rowStates.get(row.key);
        // in der Animation zuerst die eingesetzte Form zeigen
        const src = st && row.sub && tS < st.starts[i]! + 800 ? row.sub : row.f;
        if (!rs2) {
          rs2 = { row, src, prev: null, tc: -Infinity, y: ty2, alpha: 0, live: true };
          rowStates.set(row.key, rs2);
        }
        if (rs2.src !== src) {
          rs2.prev = rs2.src;
          rs2.src = src;
          rs2.tc = now;
        }
        rs2.row = row;
        rs2.live = true;
        seen.add(row.key);
        const k = 1 - Math.exp(-dt / 0.11);
        rs2.y += (ty2 - rs2.y) * k;
        if (Math.abs(ty2 - rs2.y) < 0.3) rs2.y = ty2;
        else anim = true;
        let goal = 1;
        if (introT !== null) goal = clamp01((introT - 450 - i * 70) / 380);
        rs2.alpha += (goal - rs2.alpha) * (1 - Math.exp(-dt / 0.09));
        if (Math.abs(goal - rs2.alpha) < 0.01) rs2.alpha = goal;
        else anim = true;
        if (reduced()) {
          rs2.y = ty2;
          rs2.alpha = goal;
        }
        (rs2 as RowState & { h: number; lines: string[]; idx: number }).h = hgt;
        (rs2 as RowState & { h: number; lines: string[]; idx: number }).lines = lineSets[i]!;
        (rs2 as RowState & { h: number; lines: string[]; idx: number }).idx = i;
      });
      for (const [key, rs2] of rowStates) {
        if (seen.has(key)) continue;
        rs2.live = false;
        rs2.alpha -= dt / 0.18;
        if (rs2.alpha <= 0 || reduced()) rowStates.delete(key);
        else anim = true;
      }

      // Zeilen zeichnen
      const noteFont = `600 ${size - 2}px ${th().font}`;
      for (const rs2 of rowStates.values()) {
        const ext = rs2 as RowState & { h: number; lines: string[]; idx: number };
        const row = rs2.row;
        let a = rs2.alpha;
        let slide = 0;
        let active = 0;
        if (st && rs2.live) {
          const start = st.starts[ext.idx]!;
          const e = clamp01((tS - start) / 450);
          a *= ease.outCubic(e);
          slide = (1 - ease.outCubic(e)) * 14;
          const next = st.starts[ext.idx + 1] ?? st.end - 800;
          active = clamp01(Math.min((tS - start) / 250, (next - tS) / 300));
        }
        if (a <= 0.01) continue;
        const h = ext.h;
        const top = rs2.y;
        const mid = top + h / 2;
        g.save();
        g.globalAlpha = alpha * a;
        if (row.sep) {
          g.strokeStyle = th().dark ? '#2c3648' : '#e9edf3';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(card.x + pad, Math.round(top) + 0.5);
          g.lineTo(card.x + card.w - pad, Math.round(top) + 0.5);
          g.stroke();
        }
        const tint = row.col ?? C().f;
        if (active > 0) {
          g.save();
          g.globalAlpha = alpha * a * active;
          g.fillStyle = mixColor(tint, th().bg, 0, th().dark ? 0.2 : 0.12);
          roundRect(g, card.x + 6, top + 3, card.w - 12, h - 6, 8);
          g.fill();
          g.restore();
        }
        if (row.kind === 'result' || row.kind === 'warn') {
          const colr = row.kind === 'result' ? C().f : C().warn;
          g.fillStyle = mixColor(colr, th().bg, 0, th().dark ? 0.18 : 0.1);
          roundRect(g, card.x + pad - 6, top + 4, inner + 12, h - 8, 9);
          g.fill();
          g.strokeStyle = mixColor(colr, th().bg, 0.35, 0.8);
          g.lineWidth = 1.3;
          roundRect(g, card.x + pad - 5.5, top + 4.5, inner + 11, h - 9, 9);
          g.stroke();
        }
        if (row.kind === 'text' || row.kind === 'hint') {
          g.font = `500 ${size - 0.5}px ${th().font}`;
          g.fillStyle = row.kind === 'hint' ? th().muted : th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          const ll = ext.lines;
          const step = lh * 0.62;
          const y0 = mid - ((ll.length - 1) * step) / 2;
          ll.forEach((ln, li) => g.fillText(ln, card.x + pad + slide, y0 + li * step));
          g.restore();
          continue;
        }
        // Kennung (I, II, …)
        let fx = card.x + pad + slide;
        if (row.tag !== undefined) {
          if (row.tag) {
            const tb = formula(g, `\\t{${row.tag}}`, fstyle(size - 0.5, row.col ?? th().muted, 800));
            tb.draw(g, fx, mid + (tb.asc - tb.desc) / 2);
          }
          fx += tagW;
        }
        // Erläuterung rechts
        let noteW = 0;
        if (row.note) {
          g.font = noteFont;
          noteW = g.measureText(row.note).width;
          g.fillStyle = th().muted;
          g.textAlign = 'right';
          g.textBaseline = 'middle';
          g.fillText(row.note, card.x + card.w - pad - (row.kind === 'result' || row.kind === 'warn' ? 4 : 0), mid);
        }
        const maxW = card.x + card.w - pad - fx - (noteW ? noteW + 12 : 0);
        const fsize = row.kind === 'result' ? size + 1.5 : size;
        const color = row.kind === 'result' ? C().f : row.kind === 'warn' ? C().warn : th().text;
        const weight = row.kind === 'result' ? 800 : 600;
        const e = rs2.prev !== null ? clamp01((now - rs2.tc) / 260) : 1;
        if (e < 1) {
          anim = true;
          const pb = fit2(rs2.prev!, maxW, fsize, color, weight);
          g.save();
          g.globalAlpha = alpha * a * (1 - e);
          pb.draw(g, fx, mid + (pb.asc - pb.desc) / 2 - e * 7);
          g.restore();
        } else rs2.prev = null;
        const box = fit2(rs2.src, maxW, fsize, color, weight);
        g.globalAlpha = alpha * a * ease.outCubic(e);
        box.draw(g, fx, mid + (box.asc - box.desc) / 2 + (1 - e) * 7);
        g.restore();
      }
      g.restore();
      return anim;
    }

    /* ---------- Schritt-Animation ---------- */

    function makeStory(now: number): Story {
      const starts: number[] = [];
      let t = 250;
      let resultAt = -1;
      rowsCache.forEach((row) => {
        if (row.cap) t += 250;
        starts.push(t);
        if (row.kind === 'result' && resultAt < 0) resultAt = t;
        t += row.sub ? 1400 : row.kind === 'text' ? 1800 : row.kind === 'result' ? 1500 : 950;
      });
      if (resultAt < 0) resultAt = t;
      return { t0: now, starts, resultAt, end: Math.max(t, resultAt + 1700) + 900 };
    }

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;

      if (story && now - story.t0 >= story.end) story = null;
      if (story) anim = true;
      for (const ch of [...X, ...Y, kLine, kSameX, kSamePt, kScene.ball, kScene.bridge, kVtx, kCalc]) anim = ch.step(now, dt) || anim;
      if (flight) {
        if ((now - flight.t0) / flight.dur > 1.6) flight = null;
        else anim = true;
      }
      if (dragging()) anim = true;

      // Einstieg
      let k = { pts: [1, 1, 1], curve: 1, labels: 1, card: 1 };
      let introT: number | null = null;
      if (intro !== null) {
        const t = now - intro;
        if (t > 2200) intro = null;
        else {
          anim = true;
          introT = t;
          k = {
            pts: [0, 1, 2].map((i) => ease.outBack(clamp01((t - 80 - i * 160) / 480))),
            curve: ease.inOutCubic(clamp01((t - 600) / 1100)),
            labels: ease.outCubic(clamp01((t - 700) / 600)),
            card: ease.outCubic(clamp01((t - 250) / 650)),
          };
        }
      }

      const s = shownState();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      drawPlot(now, s, k);
      const col = regions().col;
      const slide = (1 - k.card) * 16;
      anim = drawCard({ x: col.x + (wide() ? slide : 0), y: col.y + (wide() ? 0 : slide), w: col.w, h: col.h }, now, dt, k.card, introT) || anim;

      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge bei Änderungen ---------- */

    function retarget(source: string, changed: ReadonlySet<string>): void {
      const now = performance.now();
      const xs = [p.x1, p.x2, p.x3];
      const ys = [p.y1, p.y2, p.y3];
      fit = fitParabola(exact());
      const inst = reduced() || source === 'init';
      const set = (ch: Chan, v: number, tau = 0.18) => (inst ? ch.jump(v) : ch.follow(v, tau));
      set(kLine, fit.kind === 'line' ? 1 : 0);
      set(kSameX, fit.kind === 'sameX' ? 1 : 0);
      set(kSamePt, fit.kind === 'samePoint' ? 1 : 0);
      set(kScene.ball, p.scene === 'ball' ? 1 : 0, 0.22);
      set(kScene.bridge, p.scene === 'bridge' ? 1 : 0, 0.22);
      set(kVtx, p.vtx && p.calc ? 1 : 0);
      set(kCalc, p.calc ? 1 : 0);
      for (let i = 0; i < 3; i++) {
        if (inst) {
          X[i]!.jump(xs[i]!);
          Y[i]!.jump(ys[i]!);
        } else if (source === 'replace') {
          X[i]!.glide(xs[i]!, 850, i * 120, now);
          Y[i]!.glide(ys[i]!, 850, i * 120 + 40, now);
        } else {
          const tau = dragging() ? 0.06 : 0.2;
          if (changed.has(`x${i + 1}`)) X[i]!.follow(xs[i]!, tau);
          if (changed.has(`y${i + 1}`)) Y[i]!.follow(ys[i]!, tau);
          if ((changed.has(`x${i + 1}`) || changed.has(`y${i + 1}`)) && dragging()) snapAt[i] = now;
        }
      }
    }

    function syncAxes(): void {
      const m = p.scene !== 'none';
      plot.setAxes({ x: { label: m ? ctx.t('axisXm') : 'x' }, y: { label: m ? ctx.t('axisYm') : 'y' } });
    }

    return {
      update(changed, source) {
        const user = source === 'input' || source === 'replace';
        const ptsChanged = ['x1', 'y1', 'x2', 'y2', 'x3', 'y3', 'way', 'calc'].some((key) => changed.has(key));
        if (user && ptsChanged) story = null;
        if (changed.has('scene') || changed.has('x1') || changed.has('x2') || changed.has('x3') || changed.has('y1') || changed.has('y2') || changed.has('y3')) flight = null;
        retarget(source, changed);
        syncAxes();
        refreshRows();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'solve') {
          if (!p.calc) ctx.set({ calc: true });
          refreshRows();
          story = reduced() ? null : makeStory(now);
        } else if (id === 'throw') {
          const pts = exact();
          const k = coefficients(pts);
          if (!k || reduced()) return;
          const xs = Math.min(pts[0].x, pts[1].x, pts[2].x);
          let xe = plot.bounds.xMax;
          if (k.a < -1e-9) {
            const disc = k.b * k.b - 4 * k.a * k.c;
            if (disc >= 0) {
              const root = (-k.b - Math.sqrt(disc)) / (2 * k.a);
              if (root > xs) xe = Math.min(xe, root);
            }
          }
          if (xe <= xs) return;
          flight = { t0: now, xs, xe, dur: 900 + (xe - xs) * 160 };
        }
        ctx.requestRender();
      },

      render,
      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
