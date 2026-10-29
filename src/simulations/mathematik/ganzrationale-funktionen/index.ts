import { defineSimulation, drawCard, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  coefForm,
  degree,
  endBehaviour,
  evaluate,
  expandExact,
  expandSteps,
  leadingRatio,
  localApprox,
  localShape,
  rangeOn,
  sciSplit,
  signTable,
  yIntercept,
  type Rational,
  type Root,
  type SignTable,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Sichtbarer x-Bereich der Nahansicht. */
const X_HALF = 5.5;
/** Zoomfaktor „Blick aus der Ferne“ (x von −110 bis 110). */
const FAR_ZOOM = 20;
/** Stelle, an der in der Fernansicht f(x) mit a·xⁿ verglichen wird. */
const FAR_X = 100;
const X_KEYS = ['x1', 'x2', 'x3'] as const;
/** Regler für a, Nullstellen und Vielfachheiten nur bei sichtbarem Term (sonst verraten sie die Lösung der Aufgabe „Term erraten“). */
const termShown = (v: Record<string, unknown>) => v.info === true;
const M_KEYS = ['m1', 'm2', 'm3'] as const;

type Target = Parameters<Surface['addTarget']>[0];
type Ptr = Parameters<Target['pointerDown']>[0];

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number; e: (t: number) => number } | null = null;
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
    this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, delay: number, now: number, e: (t: number) => number = ease.inOutCubic): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur: Math.max(1, dur), e };
  }
  get busy(): boolean {
    return this.tw !== null || this.v !== this.goal;
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
      this.v = lerp(tw.from, tw.to, tw.e(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-6 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Kleinster „schöner“ Wert ≥ v (1; 1,5; 2; 2,5; 3; 4; 5; 6; 8 · 10^k). */
function niceCeil(v: number): number {
  if (!(v > 0)) return 1;
  const e = 10 ** Math.floor(Math.log10(v));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= v * (1 - 1e-9)) return m * e;
  return 10 * e;
}

/** Hochzahl als Unicode-Hochzeichen (für Achsenbeschriftungen). */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const supNum = (k: number) =>
  (k < 0 ? '⁻' : '') +
  String(Math.abs(k))
    .split('')
    .map((d) => SUP[Number(d)])
    .join('');

/**
 * Ganzrationale Funktionen in Linearfaktordarstellung. Die Nullstellen sind
 * ziehbare Perlen auf der x-Achse (Ringe zeigen die Vielfachheit, Antippen
 * erhöht sie); fallen Perlen zusammen, verschmelzen sie und die Vielfachheiten
 * addieren sich. Der Leitkoeffizient a wird an einem Griff am Graphen gezogen.
 * Erklärende Ebenen: Vorzeichenbereiche, Randverhalten (Pfeile), Vorzeichentabelle
 * mit einer Zeile pro Faktor, lokales Verhalten an den Nullstellen (Näherung
 * c·(x − x₀)^m mit Lupe) und der y-Achsenabschnitt. „Blick aus der Ferne“ zoomt
 * weich weit heraus und vergleicht f mit a·xⁿ. Karten zeigen Linearfaktorform und
 * exakte Normalform (auf Wunsch Schritt für Schritt ausmultipliziert). Mit
 * „Term und Eigenschaften zeigen“ aus wird daraus die Aufgabe „Term erraten“.
 */
export default defineSimulation({
  id: 'ganzrationale-funktionen',
  dragHint: true,
  hint: { de: 'Tipp: Zieh die Nullstellen auf der x-Achse oder den Griff für den Leitkoeffizienten a.', en: 'Tip: Drag the zeros on the x-axis or the handle for the leading coefficient a.' },
  layout: { aspect: 1.4, aspectNarrow: 0.4 },
  groups: [
    { id: 'zeros', label: L('Nullstellen', 'Zeros') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'a',
      type: 'number',
      label: L('Leitkoeffizient a', 'Leading coefficient a'),
      min: -3,
      max: 3,
      step: 0.1,
      default: 0.5,
      visibleIf: termShown,
      help: L('Auch am Griff rechts auf dem Graphen ziehen. a = 0 ist nicht erlaubt.', 'You can also drag the handle on the right of the graph. a = 0 is not allowed.'),
    },
    { key: 'z', type: 'number', group: 'zeros', label: L('Anzahl der Linearfaktoren', 'Number of linear factors'), min: 1, max: 3, step: 1, default: 3, visibleIf: termShown },
    {
      key: 'x1',
      type: 'number',
      group: 'zeros',
      label: L('Nullstelle x₁', 'Zero x₁'),
      min: -4,
      max: 4,
      step: 0.5,
      default: -2,
      visibleIf: termShown,
      help: L('Die Perlen auf der x-Achse lassen sich ziehen; Antippen erhöht die Vielfachheit.', 'The beads on the x-axis can be dragged; tapping one raises its multiplicity.'),
    },
    { key: 'm1', type: 'number', group: 'zeros', label: L('Vielfachheit von x₁', 'Multiplicity of x₁'), min: 1, max: 4, step: 1, default: 1, visibleIf: termShown },
    { key: 'x2', type: 'number', group: 'zeros', label: L('Nullstelle x₂', 'Zero x₂'), min: -4, max: 4, step: 0.5, default: 0.5, visibleIf: (v) => termShown(v) && (v.z as number) >= 2 },
    { key: 'm2', type: 'number', group: 'zeros', label: L('Vielfachheit von x₂', 'Multiplicity of x₂'), min: 1, max: 4, step: 1, default: 1, visibleIf: (v) => termShown(v) && (v.z as number) >= 2 },
    { key: 'x3', type: 'number', group: 'zeros', label: L('Nullstelle x₃', 'Zero x₃'), min: -4, max: 4, step: 0.5, default: 3, visibleIf: (v) => termShown(v) && (v.z as number) >= 3 },
    { key: 'm3', type: 'number', group: 'zeros', label: L('Vielfachheit von x₃', 'Multiplicity of x₃'), min: 1, max: 4, step: 1, default: 1, visibleIf: (v) => termShown(v) && (v.z as number) >= 3 },
    { key: 'sign', type: 'boolean', group: 'view', label: L('Vorzeichenbereiche färben', 'Shade where f is positive/negative'), default: true },
    { key: 'ends', type: 'boolean', group: 'view', label: L('Randverhalten (Pfeile und Karte)', 'End behaviour (arrows and card)'), default: true },
    { key: 'tab', type: 'boolean', group: 'view', label: L('Vorzeichentabelle', 'Sign chart'), default: true },
    {
      key: 'near',
      type: 'boolean',
      group: 'view',
      label: L('Verhalten nahe den Nullstellen (Lupe)', 'Behaviour near the zeros (magnifier)'),
      help: L('Nahe x₀ verhält sich f wie c · (x − x₀)ᵐ: Gerade, Parabel oder kubische Parabel.', 'Near x₀, f behaves like c · (x − x₀)ᵐ: a line, a parabola or a cubic.'),
      default: false,
    },
    { key: 'yi', type: 'boolean', group: 'view', label: L('y-Achsenabschnitt f(0)', 'y-intercept f(0)'), default: false },
    {
      key: 'info',
      type: 'boolean',
      group: 'view',
      label: L('Term und Eigenschaften zeigen', 'Show the term and properties'),
      help: L(
        'Aus: Aufgabe „Welcher Term passt zum Graphen?“. Die Regler für a und die Nullstellen sind dann ausgeblendet.',
        'Off: task “Which term fits the graph?”. The sliders for a and the zeros are then hidden.',
      ),
      default: true,
    },
  ],
  actions: [
    { id: 'far', label: L('Blick aus der Ferne', 'View from far away'), primary: true },
    { id: 'steps', label: L('Ausmultiplizieren Schritt für Schritt', 'Expand step by step'), visibleIf: (v) => v.info === true },
    { id: 'reveal', label: L('Term aufdecken', 'Reveal the term'), primary: true, visibleIf: (v) => v.info !== true },
  ],
  readouts: [
    { key: 'term', label: L('Linearfaktoren', 'Factored form'), spoiler: true },
    { key: 'norm', label: L('Normalform', 'Expanded form'), spoiler: true },
    { key: 'deg', label: L('Grad und Leitkoeffizient', 'Degree and leading coefficient'), spoiler: true },
    { key: 'zeros', label: L('Nullstellen', 'Zeros'), spoiler: true },
    { key: 'ends', label: L('Randverhalten', 'End behaviour'), spoiler: true },
    { key: 'yint', label: L('y-Achsenabschnitt', 'y-intercept'), spoiler: true },
    { key: 'local', label: L('Nahe den Nullstellen', 'Near the zeros'), spoiler: true },
  ],
  resultsParam: 'info',
  presets: [
    { id: 'three', label: L('Drei einfache Nullstellen', 'Three simple zeros'), values: {} },
    { id: 'double', label: L('Doppelte Nullstelle: Berührpunkt', 'Double zero: touching point'), values: { z: 2, x1: -2, m1: 2, x2: 2, m2: 1, a: 0.5 } },
    { id: 'triple', label: L('Dreifache Nullstelle: Terrassenpunkt', 'Triple zero: terrace point'), values: { z: 2, x1: 1, m1: 3, x2: -3, m2: 1, a: 0.3, near: true } },
    { id: 'w', label: L('Grad 4: W-Form', 'Degree 4: W shape'), values: { z: 3, x1: -3, m1: 1, x2: 0, m2: 2, x3: 3, m3: 1, a: 0.2 } },
    { id: 'neg', label: L('a negativ', 'Negative a'), values: { z: 3, x1: -3, m1: 1, x2: -0.5, m2: 1, x3: 2.5, m3: 1, a: -0.4 } },
    { id: 'merged', label: L('Alle Nullstellen fallen zusammen', 'All zeros coincide'), values: { z: 3, x1: 1, m1: 1, x2: 1, m2: 2, x3: 1, m3: 1, a: 0.5 } },
    { id: 'high', label: L('Grad 9', 'Degree 9'), values: { z: 3, x1: -2, m1: 3, x2: 1, m2: 4, x3: 3, m3: 2, a: 0.1, near: true } },
    { id: 'cube', label: L('f(x) = x³', 'f(x) = x³'), values: { z: 1, x1: 0, m1: 3, a: 1 } },
    { id: 'guess', label: L('Aufgabe: Welcher Term passt?', 'Task: which term fits?'), values: { z: 2, x1: -1, m1: 2, x2: 2.5, m2: 1, a: -0.4, info: false } },
  ],
  strings: {
    de: {
      canvas:
        'Großes Koordinatensystem mit dem Graphen einer ganzrationalen Funktion in Linearfaktoren. Die Nullstellen sind Perlen auf der x-Achse, deren Ringe die Vielfachheit zeigen; sie lassen sich ziehen und antippen, der Leitkoeffizient a am Griff auf dem Graphen. Vorzeichenbereiche, Pfeile für das Randverhalten, eine Lupe für das Verhalten nahe einer Nullstelle und der Blick aus der Ferne mit a·xⁿ. Daneben Karten mit Term und Normalform, Vorzeichentabelle, Randverhalten und Näherungen an den Nullstellen.',
    },
    en: {
      canvas:
        'Large coordinate system with the graph of a polynomial function in factored form. The zeros are beads on the x-axis whose rings show the multiplicity; they can be dragged and tapped, the leading coefficient a with a handle on the graph. Sign regions, arrows for the end behaviour, a magnifier for the behaviour near a zero and a view from far away with a·xⁿ. Next to it cards with the factored and expanded form, sign chart, end behaviour and approximations at the zeros.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: Txt) => s[lang];
    const setP = (vals: Record<string, number | boolean>) => ctx.set(vals as never);
    const editable = () => !ctx.locked;

    /* ---------- Farben ---------- */
    const col = {
      f: () => th().series[4]!,
      r: (i: number) => [th().series[0]!, th().series[3]!, th().series[5]!][i] ?? th().series[0]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
      lt: () => mixColor(th().text, th().series[1]!, 0.35),
      /** Hintergrund der Schilder (leicht durchscheinend) und der Karten, Kartenrand */
      pillBg: () => mixColor(th().bg, th().text, th().dark ? 0.04 : 0, th().dark ? 0.9 : 0.94),
      cardBg: () => (th().dark ? mixColor(th().bg, th().text, 0.05) : th().bg),
      cardBorder: () => th().grid,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d: number) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7 * Math.max(1, Math.abs(v * 10 ** d));
    /** Große Zahlen mit Tausender-Abstand bzw. Zehnerpotenz. */
    function big(v: number, d = 2): string {
      const a = Math.abs(v);
      if (a < 1e4) return N(v, d);
      if (a < 1e7) {
        const s = N(Math.round(v), 0);
        const neg = s.startsWith('−');
        const digits = neg ? s.slice(1) : s;
        const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        return neg ? `−${grouped}` : grouped;
      }
      const { mant, exp } = sciSplit(v);
      return `${N(mant, 2)} · 10${supNum(exp)}`;
    }

    /* ---------- Funktion (Ziel und Anzeige) ---------- */
    const aOf = (v: number) => (Math.abs(v) < 0.05 ? (v < 0 ? -0.1 : 0.1) : v);
    const aGoal = () => aOf(p.a);
    const xGoal = (i: number) => p[X_KEYS[i]!] as number;
    const mGoal = (i: number) => (i < p.z ? (p[M_KEYS[i]!] as number) : 0);
    const rawRoots = (): Root[] => {
      const r: Root[] = [];
      for (let i = 0; i < p.z; i++) r.push({ x: xGoal(i), m: mGoal(i) });
      return r;
    };
    const fGoal = (x: number) => evaluate(aGoal(), rawRoots(), x);
    const nGoal = () => degree(rawRoots());

    /** Zusammengefasste Nullstellen mit den beteiligten Reglern (aufsteigend). */
    interface Group {
      x: number;
      m: number;
      idx: number[];
    }
    function groups(): Group[] {
      const out: Group[] = [];
      const order = [...Array(p.z).keys()].sort((u, v) => xGoal(u) - xGoal(v) || u - v);
      for (const i of order) {
        const last = out[out.length - 1];
        if (last && Math.abs(last.x - xGoal(i)) < 1e-9) {
          last.m += mGoal(i);
          last.idx.push(i);
        } else out.push({ x: xGoal(i), m: mGoal(i), idx: [i] });
      }
      return out;
    }
    const groupColor = (gr: Group) => col.r(Math.min(...gr.idx));

    // angezeigter Zustand: Nullstellen, Vielfachheiten (gleitend, als reelle Hochzahl) und a
    const XS = [0, 1, 2].map((i) => new Chan(xGoal(i)));
    const MS = [0, 1, 2].map((i) => new Chan(mGoal(i)));
    const A = new Chan(aGoal());
    const Y0 = new Chan(-4);
    const Y1 = new Chan(4);
    const XH = new Chan(4);
    const FAR = new Chan(0);
    const kInfo = new Chan(p.info ? 1 : 0);
    const kSign = new Chan(p.sign ? 1 : 0);
    const kEnds = new Chan(p.ends ? 1 : 0);
    const kNear = new Chan(p.near ? 1 : 0);
    const kYi = new Chan(p.yi ? 1 : 0);
    /** Hervorhebung in der Karte „Randverhalten“ (Spalte 0 … 3). */
    const kType = new Chan(0);
    const cardH = new Map<string, Chan>();
    const chans = () => [...XS, ...MS, A, Y0, Y1, XH, FAR, kInfo, kSign, kEnds, kNear, kYi, kType, ...cardH.values()];

    /** Potenz mit gleitender Hochzahl: zwischen zwei ganzen Hochzahlen wird überblendet (Nullstelle bleibt erhalten). */
    function powBlend(d: number, m: number): number {
      if (m <= 0) return 1;
      const lo = Math.floor(m);
      const t = m - lo;
      if (t < 1e-9) return d ** lo;
      return lerp(d ** lo, d ** (lo + 1), t);
    }
    function fShown(x: number): number {
      let v = A.v;
      for (let i = 0; i < 3; i++) v *= powBlend(x - XS[i]!.v, MS[i]!.v);
      return v;
    }
    /** Grad der angezeigten Funktion (gerundet). */
    const nShown = () => Math.round(MS.reduce((s, c) => s + c.v, 0));

    /* ---------- Zustand der Bedienung ---------- */
    let intro: number | null = null;
    let farOn = false;
    let steps: { t0: number } | null = null;
    let revealT: number | null = null;
    let pops: { x: number; t0: number; src: string; color: string }[] = [];
    let prevGroups = groups();
    let farY: [number, number] = [-1, 1];
    let table: SignTable = signTable(aGoal(), rawRoots());
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let drag: { kind: 'root'; i: number; sx: number; sy: number; moved: boolean; t0: number } | { kind: 'lead'; g: number } | { kind: 'look' } | null = null;
    let hover: { id: string | null; px: number; py: number } | null = null;
    /** zuletzt bediente Nullstelle (für die Lupe) */
    let focusX: number | null = null;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    function cnt(key: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(key);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(key, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (Math.abs(e.c.v - v) > 50 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() ? 0.05 : 0.18);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählte Zahl; am Ziel exakt formatiert */
    const cN = (key: string, v: number, d = 2) => {
      const s = cnt(key, v);
      return Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? big(v, d) : big(s, d);
    };

    /* ---------- Aufteilung ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (bigSize: number, small: number) => (sm() ? small : bigSize);
    function regions(): { plot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.31, 236, 350));
        return { plot: { x: 0, y: 0, w: w - cw - 12, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 0.98, 260, h * 0.5));
      return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const PAD = () => ({ left: 12, right: 12, top: fs(26, 22), bottom: 18 });
    const plot = new Plot(surface, {
      x: [-X_HALF, X_HALF],
      y: [-4, 4],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().plot,
      xAxis: { label: 'x' },
      yAxis: { label: 'y', format: (v) => big(v, 3) },
    });

    /* ---------- Bildausschnitt ---------- */
    /** y-Bereich der Nahansicht: Nullstellen und die Ausschläge dazwischen gut sichtbar. */
    function nearTarget(): [number, number] {
      const gs = groups();
      const xs = gs.map((g) => g.x);
      const lo = Math.min(...xs);
      const hi = Math.max(...xs);
      const c = (lo + hi) / 2;
      const w = Math.max((hi - lo) / 2 + 0.35, 1.4);
      const r = rangeOn(fGoal, c - w, c + w, 320);
      let yl = Math.min(0, r.lo);
      let yh = Math.max(0, r.hi);
      if (p.yi) {
        const v = fGoal(0);
        const s = Math.max(yh - yl, 0.5);
        if (Math.abs(v) <= 4 * s) {
          yl = Math.min(yl, v);
          yh = Math.max(yh, v);
        }
      }
      const span = Math.max(yh - yl, 0.4);
      yl -= span * 0.2;
      yh += span * 0.28;
      return [-niceCeil(-yl), niceCeil(yh)];
    }
    /** Griff für a: rechts der größten Nullstelle, dort wo |f| gut ins Bild passt. */
    function handleTarget(yr: [number, number]): number {
      const mx = Math.max(...groups().map((g) => g.x));
      const lim = (aGoal() > 0 ? yr[1] : -yr[0]) * 0.72;
      for (let d = 1.0; d >= 0.3 - 1e-9; d -= 0.05) {
        const x = Math.min(mx + d, X_HALF - 0.45);
        if (Math.abs(fGoal(x)) <= lim) return x;
      }
      return Math.min(mx + 0.3, X_HALF - 0.45);
    }
    /** y-Bereich der Fernansicht (f und a·xⁿ auf −110 … 110). */
    function farTarget(): [number, number] {
      const H = X_HALF * FAR_ZOOM;
      const n = nGoal();
      const a = aGoal();
      const r1 = rangeOn(fGoal, -H, H, 500);
      const r2 = rangeOn((x) => a * x ** n, -H, H, 500);
      const lo = Math.min(0, r1.lo, r2.lo);
      const hi = Math.max(0, r1.hi, r2.hi);
      const span = Math.max(hi - lo, 1);
      return [lo - span * 0.08, hi + span * 0.16];
    }
    function retarget(now: number, instant: boolean, kind: 'glide' | 'follow' | 'keep' = 'glide'): void {
      const yr = nearTarget();
      farY = farTarget();
      if (instant || reduced()) {
        Y0.jump(yr[0]);
        Y1.jump(yr[1]);
        XH.jump(handleTarget(yr));
        return;
      }
      if (kind === 'keep') return;
      if (kind === 'follow') {
        Y0.follow(yr[0], 0.3);
        Y1.follow(yr[1], 0.3);
        XH.follow(handleTarget(yr), 0.2);
        return;
      }
      if (Y0.goal !== yr[0]) Y0.glide(yr[0], 750, 0, now);
      if (Y1.goal !== yr[1]) Y1.glide(yr[1], 750, 0, now);
      const xh = handleTarget(yr);
      if (XH.goal !== xh) XH.glide(xh, 650, 0, now);
    }
    /** Aktueller Ausschnitt (Nah ↔ Fern als echter Zoom: Spannweite geometrisch). */
    function view(): { x: [number, number]; y: [number, number] } {
      const e = FAR.v;
      const half = X_HALF * FAR_ZOOM ** e;
      if (e <= 1e-4) return { x: [-half, half], y: [Y0.v, Y1.v] };
      const ns = Y1.v - Y0.v;
      const nc = (Y0.v + Y1.v) / 2;
      const fsn = farY[1] - farY[0];
      const fc = (farY[0] + farY[1]) / 2;
      const span = ns * (fsn / ns) ** e;
      const k = Math.abs(fsn - ns) < 1e-12 ? e : (span - ns) / (fsn - ns);
      const c = nc + (fc - nc) * k;
      return { x: [-half, half], y: [c - span / 2, c + span / 2] };
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { r0: col.r(0), r1: col.r(1), r2: col.r(2), f: col.f(), p: col.pos(), n: col.neg(), m: th().muted, l: col.lt() },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, minSize = 10.5): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > minSize) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    const wOf = (src: string, size: number, weight = 600) => formula(surface.g, src, fstyle(size, th().text, weight)).w;

    /** Faktor (x − x₀)^m als Kurzschrift. */
    function factorSrc(x0: number, m: number): string {
      const base = Math.abs(x0) < 1e-12 ? 'x' : `(x ${x0 > 0 ? '−' : '+'} ${N(Math.abs(x0), 2)})`;
      return m > 1 ? `${base}^{${m}}` : base;
    }
    /** Vorfaktor a („“, „−“ oder „0,5 · “). */
    function leadSrc(a: number): string {
      if (Math.abs(a - 1) < 1e-12) return '';
      if (Math.abs(a + 1) < 1e-12) return '−';
      return `${N(a, 2)} · `;
    }
    /** Summand mit der höchsten Potenz, a · vⁿ (v = „x“ oder eine Zahl). */
    function leadTerm(a: number, n: number, v: string): string {
      const pw = n === 1 ? v : `${v}^{${n}}`;
      if (Math.abs(a - 1) < 1e-12) return pw;
      if (Math.abs(a + 1) < 1e-12) return `−${pw}`;
      return v === 'x' ? `${N(a, 2)}${pw}` : `${N(a, 2)} · ${pw}`;
    }
    function factoredSrc(colored = true): string {
      const parts = groups().map((gr) => {
        const s = factorSrc(gr.x, gr.m);
        return colored ? `\\c{r${Math.min(...gr.idx)}}{${s}}` : s;
      });
      return `f(x) = ${leadSrc(aGoal())}${parts.join(' · ')}`;
    }
    /** Betrag eines Koeffizienten als Dezimalzahl oder gekürzter Bruch. */
    function coefAbs(r: Rational): string {
      const c = coefForm({ n: Math.abs(r.n), d: r.d });
      // ab fünf Stellen mit Tausender-Abstand (49 152 statt 49152), wie an der y-Achse
      const grp = (s: string) => s.replace(/^\d{5,}/, (d) => d.replace(/\B(?=(\d{3})+(?!\d))/g, ' '));
      return 'dec' in c ? grp(N(c.dec, c.places)) : `\\f{${grp(String(c.num))}}{${grp(String(c.den))}}`;
    }
    /** Glieder eines Polynoms (höchste Potenz zuerst), jeweils mit Vorzeichen. */
    function polyTerms(c: Rational[]): { neg: boolean; body: string }[] {
      const out: { neg: boolean; body: string }[] = [];
      for (let k = c.length - 1; k >= 0; k--) {
        const r = c[k]!;
        if (r.n === 0) continue;
        const one = Math.abs(r.n) === r.d;
        const coef = one && k > 0 ? '' : coefAbs(r);
        const xp = k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`;
        out.push({ neg: r.n < 0, body: `${coef}${xp}` });
      }
      return out;
    }
    function joinTerms(ts: { neg: boolean; body: string }[], first = true): string {
      if (!ts.length) return '0';
      return ts.map((t, i) => (i === 0 && first ? `${t.neg ? '−' : ''}${t.body}` : `${t.neg ? '−' : '+'} ${t.body}`)).join(' ');
    }
    const polySrc = (c: Rational[]) => joinTerms(polyTerms(c));
    /** Linearfaktorform, bei Bedarf nach einem Faktor umgebrochen. */
    function factoredRows(maxW: number, size: number): string[] {
      const one = factoredSrc(true);
      if (wOf(one, size, 650) <= maxW * 1.1) return [one];
      const parts = groups().map((gr) => `\\c{r${Math.min(...gr.idx)}}{${factorSrc(gr.x, gr.m)}}`);
      const head = `f(x) = ${leadSrc(aGoal())}`;
      for (let k = parts.length - 1; k >= 1; k--) {
        const first = `${head}${parts.slice(0, k).join(' · ')} ·`;
        if (wOf(first, size, 650) <= maxW) return [first, `\\t{      }${parts.slice(k).join(' · ')}`];
      }
      return [one];
    }
    /** Normalform, bei Bedarf auf zwei Zeilen verteilt. */
    function normalRows(maxW: number, size: number): string[] {
      const ts = polyTerms(expandExact(aGoal(), rawRoots()));
      const one = `f(x) = ${joinTerms(ts)}`;
      if (wOf(one, size) <= maxW * 1.1 || ts.length < 3) return [one];
      const cut = Math.ceil(ts.length / 2);
      return [`f(x) = ${joinTerms(ts.slice(0, cut))}`, `\\t{   }${joinTerms(ts.slice(cut), false)}`];
    }

    /** Kurzschrift → HTML (Ergebnisse unter der Bühne). */
    function toHtml(src: string): string {
      let i = 0;
      const group = (): string => {
        if (src[i] !== '{') return src[i++] ?? '';
        i++;
        const out = seq('}');
        i++;
        return out;
      };
      const seq = (end?: string): string => {
        let out = '';
        let buf = '';
        const flush = () => {
          out += buf.replace(/(^|[^\p{L}])(\p{L})(?![\p{L}])/gu, (_, pre: string, ch: string) => `${pre}<var>${ch}</var>`);
          buf = '';
        };
        while (i < src.length && src[i] !== end) {
          const ch = src[i]!;
          if (ch === '\\' && 'fcbt'.includes(src[i + 1] ?? '')) {
            const cmd = src[i + 1]!;
            i += 2;
            flush();
            if (cmd === 'f') {
              const a = group();
              out += `<span class="frac"><span>${a}</span><span>${group()}</span></span>`;
            } else if (cmd === 'c') {
              group();
              out += group();
            } else if (cmd === 'b') out += `<strong>${group()}</strong>`;
            else out += group();
          } else if (ch === '^' || ch === '_') {
            flush();
            i++;
            out += ch === '^' ? `<sup>${group()}</sup>` : `<sub>${group()}</sub>`;
          } else {
            buf += ch;
            i++;
          }
        }
        flush();
        return out;
      };
      return seq();
    }

    /** Vielfachheit in Worten. */
    const multName = (m: number) =>
      m === 1 ? say(L('einfach', 'simple')) : m === 2 ? say(L('doppelt', 'double')) : m === 3 ? say(L('dreifach', 'triple')) : m === 4 ? say(L('vierfach', 'fourfold')) : say(L(`${m}-fach`, `×${m}`));
    const kindName = (m: number) =>
      m === 1 ? say(L('Schnittpunkt', 'crossing point')) : m % 2 === 0 ? say(L('Berührpunkt', 'touching point')) : say(L('Terrassenpunkt', 'terrace point'));
    const shapeName = (m: number) => {
      const s = localShape(m);
      return s === 'line'
        ? say(L('wie eine Gerade', 'like a line'))
        : s === 'parabola'
          ? say(L('wie eine Parabel', 'like a parabola'))
          : s === 'cubic'
            ? say(L('wie eine kubische Parabel', 'like a cubic'))
            : s === 'quartic'
              ? say(L('wie eine Parabel 4. Grades', 'like a quartic'))
              : say(L(`wie eine Potenzfunktion vom Grad ${m}`, `like a power function of degree ${m}`));
    };

    /* ---------- Zeichenhilfen ---------- */
    type PillOpts = { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean };
    /** Bereits belegte Flächen im Hauptbild (gegen überlappende Beschriftungen). */
    let placed: Rect[] = [];
    const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    /** Beschriftung an der ersten freien Wunschstelle (sonst an der mit der kleinsten Überdeckung). */
    function fpillFree(cands: { x: number; y: number; align: 'left' | 'center' | 'right' }[], src: string, opts: PillOpts = {}): Rect {
      let best: { c: (typeof cands)[number]; cost: number } | null = null;
      for (const c of cands) {
        const rr = fpill(c.x, c.y, src, { ...opts, align: c.align, dry: true });
        const cost = placed.reduce((s, q) => s + overlapArea(q, rr), 0);
        if (!best || cost < best.cost - 1e-6) best = { c, cost };
        if (cost === 0) break;
      }
      const c = best!.c;
      const rr = fpill(c.x, c.y, src, { ...opts, align: c.align });
      placed.push(rr);
      return rr;
    }
    function fpill(x: number, y: number, src: string, opts: PillOpts = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = formula(g, src, fstyle(size, color, opts.weight ?? 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let base = y + (box.asc - box.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: base - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (opts.dry || a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = col.pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    const pillSize = (src: string, size: number) => {
      const b = formula(surface.g, src, fstyle(size, th().text, 700));
      return { w: b.w + 16, h: b.asc + b.desc + 10 };
    };

    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.4 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }
    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(y)) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.4;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.45));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
      g.restore();
    }

    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
    function strokePts(pts: [number, number][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      const path = () => {
        g.beginPath();
        let pen = false;
        for (const [x, y] of pts) {
          if (!Number.isFinite(y)) {
            pen = false;
            continue;
          }
          if (pen) g.lineTo(x, y);
          else g.moveTo(x, y);
          pen = true;
        }
      };
      if (opts.glow) {
        g.save();
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.65)' : mixColor(color, '#ffffff', 0.4, 0.55);
        g.shadowBlur = th().dark ? 9 : 7;
        g.shadowOffsetY = 2;
        g.strokeStyle = color;
        g.lineWidth = width;
        path();
        g.stroke();
        g.restore();
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      path();
      g.stroke();
      if (opts.glow && width >= 2.5) {
        g.translate(0, -width * 0.22);
        g.strokeStyle = withAlpha('#ffffff', th().dark ? 0.2 : 0.38);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }
    /** Funktionswerte als Pixelpunkte (sehr große Werte werden am Rand gekappt). */
    function sample(f: (x: number) => number, x0: number, x1: number, density = 0.9): [number, number][] {
      const out: [number, number][] = [];
      if (!(x1 > x0)) return out;
      const r = plot.rect;
      const count = Math.round(clamp(Math.abs(plot.px(x1) - plot.px(x0)) * density, 16, 1100));
      const lim = r.h * 3;
      for (let i = 0; i <= count; i++) {
        const x = x0 + ((x1 - x0) * i) / count;
        const y = f(x);
        out.push([plot.px(x), Number.isFinite(y) ? clamp(plot.py(y), r.y - lim, r.y + r.h + lim) : NaN]);
      }
      return out;
    }
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.55, y1 - uy * hd + ux * hd * 0.55);
      g.lineTo(x1 - ux * hd + uy * hd * 0.55, y1 - uy * hd - ux * hd * 0.55);
      g.closePath();
      g.fill();
    }
    /** Fläche zwischen f und der x-Achse: grün oberhalb, rot unterhalb. */
    function fillSigned(f: (x: number) => number, lo: number, hi: number, alpha: number): void {
      if (!(hi > lo) || alpha <= 0.01) return;
      const g = surface.g;
      const dark = th().dark;
      const r = plot.rect;
      const y0 = clamp(plot.py(0), r.y - 2, r.y + r.h + 2);
      for (const sgn of [1, -1]) {
        const color = sgn > 0 ? col.pos() : col.neg();
        const pts = sample((x) => (sgn > 0 ? Math.max(f(x), 0) : Math.min(f(x), 0)), lo, hi, 0.5);
        g.save();
        g.globalAlpha *= alpha;
        const grad = g.createLinearGradient(0, sgn > 0 ? r.y : r.y + r.h, 0, y0);
        grad.addColorStop(0, withAlpha(color, dark ? 0.4 : 0.28));
        grad.addColorStop(1, withAlpha(color, dark ? 0.14 : 0.08));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(pts[0]![0], y0);
        for (const [px, py] of pts) g.lineTo(px, clamp(py, r.y - 4, r.y + r.h + 4));
        g.lineTo(pts[pts.length - 1]![0], y0);
        g.closePath();
        g.fill();
        g.restore();
      }
    }

    /** Infokarte im einheitlichen Stil (sim-core). */
    function card(r: Rect, accent?: string): void {
      drawCard(surface.g, r, ctx.theme, accent);
    }
    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      g.font = `750 11px ${th().font}`;
      // Zusatz rechts weglassen, wenn sonst der Titel gekürzt werden müsste
      if (right && g.measureText(title).width > R.w - 2 * pad - 15 - wOf(right, fs(12, 11), 700) - 12) right = undefined;
      const room0 = R.w - 2 * pad - 15 - (right ? wOf(right, fs(12, 11), 700) + 12 : 0);
      g.font = `750 ${tsz}px ${th().font}`;
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      if (right) {
        const rb = formula(g, right, fstyle(fs(12, 11), color, 700));
        rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      }
      return ty;
    }
    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      reveal: number;
      t: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, t: 1e9, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3200) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 150) / 1300)),
        t,
        labels: ease.outCubic(clamp01((t - 1700) / 600)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1600),
      };
    }
    /** Pop-Faktor einer Perle beim Einstieg. */
    const beadIntro = (k: Intro, order: number) => (k.t > 1e8 ? 1 : ease.outBack(clamp01((k.t - 900 - order * 170) / 480)));

    /* =====================================================================
     * Hauptbild
     * ===================================================================== */
    interface Bead {
      /** beteiligte Regler (Reihenfolge = Farbe der Ringe) */
      idx: number[];
      x: number;
      px: number;
      py: number;
    }
    /** Angezeigte Perlen: Regler, deren Perlen (fast) übereinander liegen, werden zu einer Perle. */
    function beads(): Bead[] {
      const act = [0, 1, 2].filter((i) => MS[i]!.v > 0.02).sort((u, v) => XS[u]!.v - XS[v]!.v || u - v);
      const out: Bead[] = [];
      const y0 = clamp(plot.py(0), plot.rect.y + 2, plot.rect.y + plot.rect.h - 2);
      for (const i of act) {
        const px = plot.px(XS[i]!.v);
        const last = out[out.length - 1];
        if (last && Math.abs(last.px - px) < 2.5) last.idx.push(i);
        else out.push({ idx: [i], x: XS[i]!.v, px, py: y0 });
      }
      for (const b of out) b.idx.sort((u, v) => u - v);
      return out;
    }
    const beadRadius = () => fs(8, 7.5);

    function drawBead(b: Bead, scale: number, alpha: number, hl: boolean, plain: boolean): void {
      const g = surface.g;
      if (alpha <= 0.01 || scale <= 0.02) return;
      const rc = beadRadius() * scale;
      if (plain) {
        dot(b.px, b.py, th().muted, rc * 0.62, alpha);
        return;
      }
      // Schichten: je Vielfachheit ein Ring in der Farbe des Reglers
      const layers: { color: string; a: number }[] = [];
      for (const i of b.idx) {
        const m = MS[i]!.v;
        const full = Math.floor(m + 1e-6);
        for (let k = 0; k < full; k++) layers.push({ color: col.r(i), a: 1 });
        const frac = m - full;
        if (frac > 0.02) layers.push({ color: col.r(i), a: frac });
      }
      const core = layers[0] ?? { color: col.r(b.idx[0]!), a: 1 };
      const rings = layers.slice(1, 7);
      g.save();
      g.globalAlpha *= alpha;
      if (hl) halo(b.px, b.py, core.color, rc * 3.4, 0.9);
      const ringGap = 3.6 * scale;
      rings.forEach((ly, j) => {
        const rr = rc + ringGap * (j + 1);
        g.save();
        g.globalAlpha *= ly.a;
        g.strokeStyle = th().bg;
        g.lineWidth = 4.2 * scale;
        g.beginPath();
        g.arc(b.px, b.py, rr, 0, TAU);
        g.stroke();
        g.strokeStyle = ly.color;
        g.lineWidth = 2.1 * scale;
        g.beginPath();
        g.arc(b.px, b.py, rr, 0, TAU);
        g.stroke();
        g.restore();
      });
      g.globalAlpha *= core.a;
      dot(b.px, b.py, core.color, rc, 1);
      g.restore();
      if (layers.length > 7 && scale > 0.5) {
        const m = Math.round(layers.length);
        fpill(b.px + rc + ringGap * 6 + 10, b.py - 16, `\\t{${m}×}`, { size: 11, alpha: alpha * 0.95, color: core.color, border: withAlpha(core.color, 0.5), align: 'left', bounds: plot.rect });
      }
    }

    /** Pfeile des Randverhaltens an den Stellen, an denen der Graph das Bild verlässt. */
    function drawEnds(alpha: number, labels: number): void {
      if (alpha <= 0.01) return;
      const r = plot.rect;
      const g = surface.g;
      const n = nShown();
      const e = endBehaviour(A.v, n);
      const b = plot.bounds;
      const inner = (py: number) => py > r.y + 12 && py < r.y + r.h - 12;
      for (const side of [-1, 1] as const) {
        const s = side < 0 ? e.left : e.right;
        // vom Rand nach innen: erste Stelle, an der der Graph sichtbar ist
        let xe = side < 0 ? b.xMin : b.xMax;
        const stepX = (b.xMax - b.xMin) / Math.max(60, r.w / 2);
        let found = inner(plot.py(fShown(xe)));
        for (let k = 0; k < 400 && !found; k++) {
          xe -= side * stepX;
          found = inner(plot.py(fShown(xe)));
          if (side < 0 ? xe > 0 : xe < 0) break;
        }
        if (!found) continue;
        const ex = plot.px(xe);
        const ey = plot.py(fShown(xe));
        // Richtung entlang der Kurve nach außen
        const x2 = xe + side * stepX * 2;
        let dx = plot.px(x2) - ex;
        let dy = plot.py(fShown(x2)) - ey;
        const len = Math.hypot(dx, dy) || 1;
        dx /= len;
        dy /= len;
        if (Math.abs(dy) < 0.15) dy = s > 0 ? -0.15 : 0.15;
        // etwas zur Bildmitte versetzt, damit der Pfeil neben dem Graphen liegt
        const nx = -dy * side;
        const ny = dx * side;
        const off = 13 * (nx * side < 0 ? 1 : -1);
        const L0 = 34;
        let tx = ex + nx * off + dx * 6;
        let ty = ey + ny * off + dy * 6;
        tx = clamp(tx, r.x + 10, r.x + r.w - 10);
        ty = clamp(ty, r.y + 8, r.y + r.h - 8);
        const sx = tx - dx * L0;
        const sy = ty - dy * L0;
        g.save();
        g.globalAlpha *= alpha;
        g.save();
        g.strokeStyle = th().bg;
        g.lineWidth = 7;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(tx - dx * 4, ty - dy * 4);
        g.stroke();
        g.restore();
        arrowPx(sx, sy, tx, ty, s > 0 ? col.pos() : col.neg(), 3, 11);
        g.restore();
        placed.push({ x: Math.min(sx, tx) - 5, y: Math.min(sy, ty) - 5, w: Math.abs(tx - sx) + 10, h: Math.abs(ty - sy) + 10 });
        if (labels > 0.01) {
          const src = `\\c{${s > 0 ? 'p' : 'n'}}{f(x) → ${s > 0 ? '+' : '−'}∞}`;
          const ps = pillSize(src, fs(12, 11));
          const lx = side < 0 ? Math.max(r.x + 8, sx - ps.w * 0.15) + 8 : Math.min(r.x + r.w - 8, sx + ps.w * 0.15) - 8;
          const ly = sy + (s > 0 ? 16 : -16);
          const al = side < 0 ? 'left' : 'right';
          const inward = side < 0 ? 16 : -16;
          fpillFree(
            [
              { x: lx, y: ly, align: al },
              { x: lx, y: ly + (s > 0 ? 28 : -28), align: al },
              { x: tx + inward, y: ty + (s > 0 ? 12 : -12), align: al },
              { x: lx + inward * 4, y: ly + (s > 0 ? 56 : -56), align: al },
            ],
            src,
            { size: fs(12, 11), alpha: alpha * labels, bounds: r, border: withAlpha(s > 0 ? col.pos() : col.neg(), 0.5) },
          );
        }
      }
    }

    /** Lupe: vergrößerter Ausschnitt um eine Nullstelle mit der Näherung c·(x − x₀)^m. */
    /** Lage der Lupe: in der oberen Ecke, die von der Nullstelle weiter weg ist. */
    function lensGeom(gi: number): { cx: number; cy: number; R: number } | null {
      const gr = groups()[gi];
      const r = plot.rect;
      if (!gr || r.w < 360 || r.h < 230) return null;
      const R = clamp(Math.min(r.w, r.h) * 0.15, 44, 70);
      const cy = r.y + R + fs(30, 26);
      // die obere Ecke, durch die der Graph weniger läuft (bei Gleichstand: weg von der Nullstelle)
      const cost = (cx: number) => {
        let c = Math.abs(plot.px(gr.x) - cx) < r.w / 2 ? 0.5 : 0;
        for (let i = 0; i <= 60; i++) {
          const px = cx - R - 20 + ((2 * R + 40) * i) / 60;
          const py = plot.py(fGoal(plot.toWorld(px, cy)[0]));
          if (Math.abs(py - cy) < R + 30) c++;
        }
        return c;
      };
      const cl = r.x + R + 16;
      const cr = r.x + r.w - R - 16;
      return { cx: cost(cl) <= cost(cr) ? cl : cr, cy, R };
    }
    function drawLens(gi: number, alpha: number): void {
      if (alpha <= 0.01) return;
      const gs = groups();
      const gr = gs[gi];
      const geo = lensGeom(gi);
      if (!gr || !geo) return;
      const g = surface.g;
      const r = plot.rect;
      const loc = localApprox(aGoal(), rawRoots(), gi);
      const others = gs.filter((_, j) => j !== gi).map((q) => Math.abs(q.x - gr.x));
      const dmin = others.length ? Math.min(...others) : 3;
      const wx = Math.min(0.9, 0.42 * dmin);
      const { cx, cy, R } = geo;
      const bpx = plot.px(gr.x);
      const color = groupColor(gr);
      const yh = Math.max(Math.abs(loc.c) * wx ** loc.m, 1e-12) * 1.25;
      const X = (x: number) => cx + ((x - gr.x) / wx) * R * 0.86;
      const Y = (y: number) => cy - (y / yh) * R * 0.78;
      g.save();
      g.globalAlpha *= alpha;
      // Verbindung zur Nullstelle
      g.save();
      g.strokeStyle = withAlpha(color, 0.7);
      g.lineWidth = 1.4;
      g.setLineDash([3, 4]);
      const by = clamp(plot.py(0), r.y, r.y + r.h);
      const ang = Math.atan2(by - cy, bpx - cx);
      g.beginPath();
      g.moveTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      g.lineTo(bpx - Math.cos(ang) * 16, by - Math.sin(ang) * 16);
      g.stroke();
      g.restore();
      // Glas
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      g.fillStyle = th().bg;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.fill();
      g.restore();
      g.save();
      g.beginPath();
      g.arc(cx, cy, R - 1, 0, TAU);
      g.clip();
      g.fillStyle = withAlpha(color, th().dark ? 0.08 : 0.05);
      g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      // Achse
      g.strokeStyle = th().axis;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(cx - R, cy);
      g.lineTo(cx + R, cy);
      g.stroke();
      // Graph und Näherung
      const ptsF: [number, number][] = [];
      const ptsA: [number, number][] = [];
      for (let i = 0; i <= 80; i++) {
        const x = gr.x - wx * 1.2 + (2.4 * wx * i) / 80;
        ptsF.push([X(x), clamp(Y(fShown(x)), cy - 3 * R, cy + 3 * R)]);
        ptsA.push([X(x), clamp(Y(loc.c * (x - gr.x) ** loc.m), cy - 3 * R, cy + 3 * R)]);
      }
      strokePts(ptsF, col.f(), 3, {});
      strokePts(ptsA, color, 2.2, { dash: [6, 4] });
      dot(cx, cy, color, 4.2, 1);
      // Glanz
      const gl = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      gl.addColorStop(0, withAlpha('#ffffff', th().dark ? 0.1 : 0.35));
      gl.addColorStop(0.45, withAlpha('#ffffff', 0));
      g.fillStyle = gl;
      g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      g.restore();
      g.strokeStyle = color;
      g.lineWidth = 2.6;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      g.strokeStyle = withAlpha(th().text, 0.15);
      g.lineWidth = 1;
      g.beginPath();
      g.arc(cx, cy, R + 2.5, 0, TAU);
      g.stroke();
      g.restore();
      // Beschriftung unter der Lupe
      const cS = Math.abs(loc.c) < 1e-12 ? '0' : N(loc.c, 3);
      const approx = `f(x) ≈ ${Math.abs(loc.c - 1) < 1e-12 ? '' : Math.abs(loc.c + 1) < 1e-12 ? '−' : `${cS} · `}${factorSrc(gr.x, gr.m)}`;
      fpill(cx, cy + R + 16, `\\c{r${Math.min(...gr.idx)}}{${approx}}`, { size: fs(12, 11), alpha, bounds: r, border: withAlpha(color, 0.5) });
      fpill(cx, cy - R - 2, `\\t{${say(L('Lupe', 'magnifier'))}}`, { size: 11, alpha: alpha * 0.9, color: th().muted, bounds: r });
    }

    function drawPlot(now: number, k: Intro): void {
      const g = surface.g;
      const V = view();
      plot.setRangePadded(V.x, V.y, PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const b = plot.bounds;
      const far = FAR.v;
      placed = [];
      // feste Elemente vormerken, damit Beschriftungen ihnen ausweichen
      const kLens = kNear.v * (1 - far) * k.labels * kInfo.v;
      const lens = kLens > 0.01 ? lensGeom(focusGroup()) : null;
      if (lens) placed.push({ x: lens.cx - lens.R - 4, y: lens.cy - lens.R - 12, w: 2 * lens.R + 8, h: 2 * lens.R + 42 });
      for (const bd of beads()) placed.push({ x: bd.px - 12, y: bd.py - 12, w: 24, h: 24 });
      if (kInfo.v > 0.5 && far < 0.5) {
        const hpx = plot.px(XH.v);
        const hpy = plot.py(fShown(XH.v));
        placed.push({ x: hpx - 12, y: hpy - 22, w: 24, h: 44 });
      }
      const info = kInfo.v;
      const xr = lerp(b.xMin, b.xMax, k.reveal);
      // Vorzeichenbereiche
      fillSigned(fShown, b.xMin, xr, kSign.v * (1 - 0.55 * far) * k.panel);
      // Näherungen an den Nullstellen (gestrichelt)
      const kN = kNear.v * (1 - far) * k.labels * info;
      if (kN > 0.01) {
        const gs = groups();
        gs.forEach((gr, gi) => {
          const loc = localApprox(aGoal(), rawRoots(), gi);
          const others = gs.filter((_, j) => j !== gi).map((q) => Math.abs(q.x - gr.x));
          const dmin = others.length ? Math.min(...others) : 3;
          const w = Math.min(gr.m === 1 ? 0.9 : 1.2, (gr.m === 1 ? 0.35 : 0.45) * dmin);
          strokePts(sample((x) => loc.c * (x - gr.x) ** loc.m, gr.x - w, gr.x + w), groupColor(gr), 2.2, { dash: [7, 5], alpha: kN * 0.9 });
        });
      }
      // a·xⁿ in der Fernansicht
      if (far > 0.01) {
        const n = nShown();
        strokePts(sample((x) => A.v * x ** n, b.xMin, b.xMax), col.lt(), 2.4, { dash: [9, 6], alpha: far });
      }
      // Graph von f
      strokePts(sample(fShown, b.xMin, xr), col.f(), fs(3.4, 3), { glow: true });
      // Schild „f(100) / a·100ⁿ“ der Fernansicht vormerken, damit die Pfeile des Randverhaltens ihm ausweichen
      const ratioSrc = far > 0.01 ? farRatioSrc(info) : null;
      if (ratioSrc) placed.push(fpill(r.x + r.w - 12, ratioY(r), ratioSrc, { align: 'right', size: fs(12.5, 11.5), bounds: r, dry: true }));
      // Randverhalten
      drawEnds(kEnds.v * k.labels, info);
      // y-Achsenabschnitt
      const kY = kYi.v * k.labels * (1 - far);
      if (kY > 0.01) {
        const y0 = fShown(0);
        const py0 = plot.py(y0);
        const inside = py0 >= r.y && py0 <= r.y + r.h;
        const px0 = plot.px(0);
        if (inside) {
          halo(px0, py0, col.f(), 16, kY * 0.7);
          dot(px0, py0, col.f(), 6, kY, true);
        }
        const src = `\\c{f}{f(0) ${info > 0.5 ? `= ${cN('yi', yIntercept(aGoal(), rawRoots()))}` : '= ?'}}`;
        const yy = clamp(py0, r.y + 18, r.y + r.h - 18);
        fpillFree(
          [
            { x: px0 + 14, y: yy, align: 'left' },
            { x: px0 - 14, y: yy, align: 'right' },
            { x: px0 + 14, y: yy - 24, align: 'left' },
            { x: px0 - 14, y: yy + 24, align: 'right' },
          ],
          inside ? src : `${src}  \\c{m}{${say(L(py0 < r.y ? '(weiter oben)' : '(weiter unten)', py0 < r.y ? '(further up)' : '(further down)'))}}`,
          { size: fs(12, 11), alpha: kY, bounds: r, border: withAlpha(col.f(), 0.5) },
        );
      }
      // Hover: Wert ablesen
      const hb = hover && hover.id === 'plot' && !drag ? hover : drag?.kind === 'look' && hover ? hover : null;
      if (hb && k.t > 1e8) {
        const [wx] = plot.toWorld(hb.px, hb.py);
        const stepX = far > 0.5 ? 1 : 0.1;
        const xs = Math.round(wx / stepX) * stepX;
        const ys = fGoal(xs);
        const px = plot.px(xs);
        const py = plot.py(ys);
        g.save();
        g.strokeStyle = withAlpha(th().text, 0.35);
        g.lineWidth = 1;
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(Math.round(px) + 0.5, r.y);
        g.lineTo(Math.round(px) + 0.5, r.y + r.h);
        g.stroke();
        g.restore();
        if (py >= r.y && py <= r.y + r.h) dot(px, py, col.f(), 5, 1);
        const exact = isExact(ys, 3);
        const src = `\\c{f}{f(${N(xs, 1)}) ${exact ? '=' : '≈'} ${big(ys, 3)}}`;
        const right = px < r.x + r.w * 0.62;
        fpill(px + (right ? 12 : -12), clamp(py, r.y + 30, r.y + r.h - 18) - 20, src, { align: right ? 'left' : 'right', size: fs(12, 11), bounds: r, border: withAlpha(col.f(), 0.5) });
      }
      // Perlen (Nullstellen)
      const bs = beads();
      const hovIdx = hover?.id?.startsWith('r') ? Number(hover.id.slice(1)) : drag?.kind === 'root' ? drag.i : -1;
      const beadA = (1 - 0.8 * far) * k.panel;
      const plain = info < 0.5;
      bs.forEach((bd, j) => {
        let s = beadIntro(k, j);
        for (const pp of reduced() ? [] : pops) {
          if (Math.abs(pp.x - bd.x) < 1e-6 || Math.abs(plot.px(pp.x) - bd.px) < 3) {
            const t = clamp01((now - pp.t0) / 700);
            s *= 1 + 0.45 * Math.sin(Math.PI * t) * (1 - t);
          }
        }
        const appear = Math.min(1, ...bd.idx.map((i) => MS[i]!.v));
        const hl = bd.idx.includes(hovIdx);
        drawBead(bd, s * (hl ? 1.12 : 1) * (1 - 0.35 * far), beadA * clamp01(appear * 1.5), hl, plain);
        const mm = bd.idx.reduce((sum, i) => sum + Math.round(MS[i]!.v), 0);
        const rr = beadRadius() + 3.6 * Math.min(6, Math.max(0, mm - 1)) + 2;
        placed.push({ x: bd.px - rr, y: bd.py - rr, w: 2 * rr, h: 2 * rr });
      });
      // Beschriftung der Nullstellen
      const kL = info * k.labels * clamp01(1 - far * 4);
      if (kL > 0.01) {
        const gs = groups();
        gs.forEach((gr) => {
          const bd = bs.find((q) => q.idx.includes(Math.min(...gr.idx)));
          if (!bd) return;
          const d = 0.08 * Math.max(0.3, ...gs.map((q) => Math.abs(q.x - gr.x)).filter((v) => v > 0).map((v) => Math.min(v, 1)));
          const sL = Math.sign(fGoal(gr.x - d));
          const sR = Math.sign(fGoal(gr.x + d));
          const src = `\\c{r${Math.min(...gr.idx)}}{${N(gr.x, 2)}}  \\c{m}{${multName(gr.m)}}`;
          const sz = fs(12, 11);
          const ps = pillSize(src, sz);
          const ringR = beadRadius() + 3.6 * Math.min(6, gr.m - 1) + 8;
          let above = sL < 0 && sR < 0;
          let align: 'left' | 'center' | 'right' = 'center';
          let x = bd.px;
          if (sL !== sR) {
            // Vorzeichenwechsel: Beschriftung in den freien Quadranten
            above = false;
            align = sL < 0 ? 'left' : 'right';
            x = bd.px + (sL < 0 ? 6 : -6);
          }
          const y = bd.py + (above ? -(ringR + ps.h / 2) : ringR + ps.h / 2);
          const step = above ? -(ps.h + 4) : ps.h + 4;
          const xx = align === 'left' ? x + 8 : align === 'right' ? x - 8 : x;
          const other = (align === 'left' ? 'right' : align === 'right' ? 'left' : 'center') as 'left' | 'center' | 'right';
          fpillFree(
            [
              { x: xx, y, align },
              { x: xx, y: y + step, align },
              { x: align === 'center' ? xx : 2 * bd.px - xx, y: bd.py - (y - bd.py), align: other },
              { x: xx, y: y + 2 * step, align },
            ],
            src,
            { size: sz, alpha: kL, bounds: r, border: withAlpha(groupColor(gr), 0.45) },
          );
        });
      }
      // Griff für a
      const kA = info * k.labels * (1 - far) * (editable() ? 1 : 0.6);
      if (kA > 0.01) {
        const hx = XH.v;
        const hy = fShown(hx);
        const hpx = plot.px(hx);
        const hpy = plot.py(hy);
        if (hpy > r.y + 6 && hpy < r.y + r.h - 6) {
          const hl = hover?.id === 'a' || drag?.kind === 'lead';
          g.save();
          g.globalAlpha *= kA;
          if (hl) halo(hpx, hpy, col.f(), 26, 1);
          const s = fs(8.5, 8) * (hl ? 1.15 : 1);
          g.save();
          g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.3)';
          g.shadowBlur = 6;
          g.shadowOffsetY = 1.5;
          const grad = g.createLinearGradient(hpx, hpy - s, hpx, hpy + s);
          grad.addColorStop(0, mixColor(col.f(), '#ffffff', 0.4));
          grad.addColorStop(1, col.f());
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(hpx, hpy - s * 1.25);
          g.lineTo(hpx + s, hpy);
          g.lineTo(hpx, hpy + s * 1.25);
          g.lineTo(hpx - s, hpy);
          g.closePath();
          g.fill();
          g.restore();
          g.strokeStyle = th().bg;
          g.lineWidth = 1.6;
          g.stroke();
          // kleine Pfeile: senkrecht ziehen
          if (editable()) {
            g.fillStyle = withAlpha(col.f(), 0.75);
            for (const dir of [-1, 1]) {
              g.beginPath();
              g.moveTo(hpx, hpy + dir * (s * 1.25 + 9));
              g.lineTo(hpx - 4, hpy + dir * (s * 1.25 + 4));
              g.lineTo(hpx + 4, hpy + dir * (s * 1.25 + 4));
              g.closePath();
              g.fill();
            }
          }
          g.restore();
          const right = hpx < r.x + r.w - 110;
          const sideA = right ? 'left' : 'right';
          const sideB = right ? 'right' : 'left';
          fpillFree(
            [
              { x: hpx + (right ? 16 : -16), y: hpy, align: sideA },
              { x: hpx + (right ? 16 : -16), y: hpy + 26, align: sideA },
              { x: hpx + (right ? 16 : -16), y: hpy - 26, align: sideA },
              { x: hpx + (right ? -16 : 16), y: hpy, align: sideB },
              { x: hpx + (right ? -16 : 16), y: hpy + 26, align: sideB },
            ],
            `\\c{f}{a = ${cN('a', aGoal(), 2)}}`,
            { size: fs(12.5, 11.5), alpha: kA, bounds: r, border: withAlpha(col.f(), 0.55) },
          );
        }
      }
      // Verschmelzen: kurze Meldung
      pops = pops.filter((pp) => now - pp.t0 < 2200);
      for (const pp of pops) {
        const t = (now - pp.t0) / 2200;
        const a = clamp01(t * 6) * clamp01((1 - t) * 3) * info;
        const px = plot.px(pp.x);
        const py = clamp(plot.py(0), r.y, r.y + r.h);
        fpill(px, py - 46 - 10 * ease.outCubic(clamp01(t * 3)), pp.src, { size: fs(12, 11), alpha: a, bounds: r, border: withAlpha(pp.color, 0.6) });
      }
      // Lupe
      if (lens) drawLens(focusGroup(), kLens);
      // Fernansicht: Beschriftung und Vergleich bei x = 100
      if (far > 0.01) {
        const n = nShown();
        if (b.xMax > FAR_X * 1.02) {
          const px = plot.px(FAR_X);
          g.save();
          g.globalAlpha *= far;
          g.strokeStyle = withAlpha(th().text, 0.4);
          g.setLineDash([3, 4]);
          g.lineWidth = 1.1;
          g.beginPath();
          g.moveTo(Math.round(px) + 0.5, r.y + 40);
          g.lineTo(Math.round(px) + 0.5, r.y + r.h);
          g.stroke();
          g.restore();
          const yf = fGoal(FAR_X);
          dot(px, plot.py(yf), col.f(), 5, far);
        }
        fpill(r.x + r.w - 12, ratioY(r), ratioSrc!, { align: 'right', size: fs(12.5, 11.5), alpha: far, bounds: r, border: withAlpha(col.lt(), 0.5) });
        drawFarLegend(r, far, info > 0.5 ? leadTerm(aGoal(), n, 'x') : 'a · x^{n}');
      }
      plot.end();
    }
    /** Höhe des Verhältnis-Schilds: rechts in der Ecke, durch die der Graph das Bild nicht verlässt (sonst läge es auf dem Pfeil). */
    function ratioY(r: Rect): number {
      return endBehaviour(A.v, nShown()).right > 0 ? r.y + r.h - fs(34, 30) : r.y + fs(58, 54);
    }
    /** Schild der Fernansicht: Verhältnis f(100) / (a · 100ⁿ). */
    function farRatioSrc(info: number): string {
      const n = nShown();
      const ratio = leadingRatio(rawRoots(), FAR_X);
      return info > 0.5 ? `\\f{f(${FAR_X})}{${leadTerm(aGoal(), n, String(FAR_X))}} ≈ ${N(cnt('ratio', ratio), 4)}` : `\\f{f(${FAR_X})}{a · ${FAR_X}^{n}} ≈ ${N(ratio, 4)}`;
    }
    /** Legende der Fernansicht: Titel, durchgezogen f(x), gestrichelt a·xⁿ. */
    function drawFarLegend(r: Rect, alpha: number, ltSrc: string): void {
      const g = surface.g;
      const sz = fs(12, 11);
      const tBox = formula(g, `\\t{${say(L('Blick aus der Ferne', 'From far away'))} (×${FAR_ZOOM})}`, fstyle(sz, th().muted, 700));
      const fBox = formula(g, '\\c{f}{f(x)}', fstyle(sz, th().text, 700));
      const lBox = formula(g, `\\c{l}{${ltSrc}}`, fstyle(sz, th().text, 700));
      const sw = 22;
      let w = 10 + fBox.w + 8 + sw + 14 + lBox.w + 8 + sw + 10;
      const withTitle = w + tBox.w + 14 <= r.w - 24;
      if (withTitle) w += tBox.w + 14;
      const asc = Math.max(tBox.asc, fBox.asc, lBox.asc);
      const desc = Math.max(tBox.desc, fBox.desc, lBox.desc);
      const h = asc + desc + 12;
      const x0 = r.x + 12;
      const y0 = r.y + 8;
      g.save();
      g.globalAlpha *= alpha;
      g.save();
      g.fillStyle = col.pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, x0, y0, w, h, Math.min(11, h / 2));
      g.fill();
      g.restore();
      const base = y0 + 6 + asc;
      const mid = y0 + h / 2;
      let x = x0 + 10;
      if (withTitle) {
        tBox.draw(g, x, base);
        x += tBox.w + 14;
      }
      g.lineCap = 'round';
      g.strokeStyle = col.f();
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x, mid);
      g.lineTo(x + sw, mid);
      g.stroke();
      x += sw + 8;
      fBox.draw(g, x, base);
      x += fBox.w + 14;
      g.strokeStyle = col.lt();
      g.lineWidth = 2.4;
      g.setLineDash([6, 4]);
      g.beginPath();
      g.moveTo(x, mid);
      g.lineTo(x + sw, mid);
      g.stroke();
      g.setLineDash([]);
      x += sw + 8;
      lBox.draw(g, x, base);
      g.restore();
    }
    /** Nullstelle für die Lupe: angefasste/zuletzt bediente, sonst die mit der größten Vielfachheit. */
    function focusGroup(): number {
      const gs = groups();
      const hovIdx = hover?.id?.startsWith('r') ? Number(hover.id.slice(1)) : drag?.kind === 'root' ? drag.i : -1;
      if (hovIdx >= 0) {
        const j = gs.findIndex((gr) => gr.idx.includes(hovIdx));
        if (j >= 0) return j;
      }
      if (focusX !== null) {
        const j = gs.findIndex((gr) => Math.abs(gr.x - focusX!) < 1e-9);
        if (j >= 0) return j;
      }
      let best = 0;
      gs.forEach((gr, j) => {
        if (gr.m > gs[best]!.m) best = j;
      });
      if (gs.every((gr) => gr.m === gs[0]!.m)) return Math.floor((gs.length - 1) / 2);
      return best;
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    /** Karte zeichnen (oder nur ihre Höhe messen); `compact`: kürzere Fassung, wenn der Platz nicht reicht. */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string, alpha = 1): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, lines, font, h: lines.length * size * 1.32 };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600, 11);
        return { box, lines: [] as string[], font: '', h: rowH(box) };
      });
      const h = 38 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card(R, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 38;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = (row.at ?? clamp01(k.stagger * (rows.length + 2) - i)) * alpha;
        if (y + it.h > R.y + R.h - 2) return;
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(a));
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = (1 - ease.outCubic(clamp01(a))) * 10;
        if (it.box) it.box.draw(g, R.x + pad + dx, y + it.box.asc);
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, R.x + pad + dx, y + size * 0.66 + j * size * 1.32));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return h;
    }
    const noteRow = (txt: Txt, size = fs(12, 11)): RowSpec => ({ src: say(txt), text: true, size, color: th().muted, gap: 6 });
    /** Überblenden „verdeckt ↔ aufgedeckt“: erst ausblenden, dann der andere Inhalt einblenden. */
    const infoShown = () => kInfo.v >= 0.5;
    const infoAlpha = () => Math.abs(2 * kInfo.v - 1);

    function termCard(k: Intro, now: number): CardFn {
      return (R, measure, compact) => {
        const pad = fs(14, 12);
        const maxW = R.w - 2 * pad - 4;
        const gs = groups();
        const n = degree(gs);
        const rows: RowSpec[] = [];
        if (infoShown()) {
          factoredRows(maxW, fs(15, 13.5)).forEach((src, i, all) => rows.push({ src, size: fs(15, 13.5), weight: 650, gap: i < all.length - 1 ? 3 : 8 }));
          if (steps) {
            const st = expandSteps(aGoal(), rawRoots());
            const lead = leadSrc(aGoal());
            let prev = factoredSrc(false);
            st.forEach((s, i) => {
              let src: string;
              if (s.withA) src = `= ${polySrc(s.coeffs)}`;
              else {
                const rest = gs.slice(s.used).map((gr) => `\\c{r${Math.min(...gr.idx)}}{${factorSrc(gr.x, gr.m)}}`);
                const inner = polySrc(s.coeffs);
                const many = s.coeffs.filter((c) => c.n !== 0).length > 1;
                const core = many && (lead || rest.length) ? `(${inner})` : inner;
                src = `= ${lead}${[core, ...rest].join(' · ')}`;
              }
              if (src.replace(/\\c\{r\d\}\{([^}]*)\}/g, '$1') === `= ${prev.replace(/^f\(x\) = /, '')}`) return;
              prev = src.slice(2);
              const at = reduced() ? 1 : clamp01((now - steps!.t0 - 350 - i * 650) / 450);
              rows.push({ src, size: fs(13.5, 12.5), at, gap: 6, hl: s.withA ? col.f() : undefined });
            });
            rows.push({ ...noteRow(L('Schrittweise: erst die Klammern miteinander, zum Schluss mit a multiplizieren.', 'Step by step: first multiply the brackets, finally multiply by a.')), at: reduced() ? 1 : clamp01((now - steps.t0 - 350 - st.length * 650) / 450) });
          } else {
            for (const s of normalRows(maxW, fs(13.5, 12.5))) rows.push({ src: s, size: fs(13.5, 12.5), gap: 4 });
          }
          const yi = yIntercept(aGoal(), rawRoots());
          if (!compact)
            rows.push({
              src: `\\c{m}{n} = ${n}   \\c{m}{a} = ${cN('ca', aGoal(), 2)}   \\c{f}{f(0) = ${cN('cy', yi, 3)}}`,
              size: fs(12.5, 11.5),
              gap: 6,
            });
          const merged = gs.filter((gr) => gr.idx.length > 1);
          for (const gr of merged.slice(0, compact ? 0 : 1)) {
            const ns = gr.idx.map((i) => `x${'₁₂₃'[i]}`);
            const names = ns.length > 2 ? `${ns.slice(0, -1).join(', ')}${say(L(' und ', ' and '))}${ns[ns.length - 1]}` : ns.join(say(L(' und ', ' and ')));
            rows.push(noteRow(L(`${names} fallen zusammen: Vielfachheiten addieren sich zu ${gr.m}.`, `${names} coincide: the multiplicities add up to ${gr.m}.`)));
          }
        } else {
          rows.push({ src: `f(x) = ? · (x − ?)^{?} · …`, size: fs(15, 13.5), weight: 650, color: th().muted });
          rows.push(noteRow(L('Welcher Term passt? Lies am Graphen die Nullstellen, ihre Vielfachheiten (schneiden, berühren, Terrasse) und das Vorzeichen von a ab.', 'Which term fits? Read off the zeros, their multiplicities (cross, touch, terrace) and the sign of a from the graph.'), fs(12.5, 11.5)));
        }
        const right = infoShown() ? `\\c{f}{${say(L('Grad', 'degree'))} ${n}}` : undefined;
        return formulaCard(R, measure, k, say(L('Funktionsterm', 'Function term')), col.f(), rows, right, infoAlpha());
      };
    }

    function signCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const t = table;
        const K = t.zeros.length;
        const rh = fs(22, 20);
        const nRows = 1 + t.rows.length + 1 + 1;
        const show = infoShown();
        const note = show ? signNote(t) : say(L('Die Tabelle erscheint, wenn der Term aufgedeckt ist. Überlege vorher: Wo ist f positiv, wo negativ?', 'The chart appears once the term is revealed. Think first: where is f positive, where negative?'));
        const nfont = `550 ${fs(12, 11)}px ${theme.font}`;
        const nlines = compact && show ? [] : wrapText(note, R.w - 2 * pad, nfont);
        const tableH = show ? nRows * rh + 6 : 0;
        const h = 40 + tableH + nlines.length * fs(12, 11) * 1.32 + 12;
        if (measure) return h;
        card(R, col.pos());
        cardTitle(R, say(L('Vorzeichentabelle', 'Sign chart')), col.pos());
        const a = infoAlpha() * ease.outCubic(k.cards);
        g.save();
        g.globalAlpha *= a;
        let y = R.y + 40;
        if (show) {
          // Spalten
          const labels = [...t.rows.map((rw) => factorSrc(rw.x, rw.m)), `a = ${N(aGoal(), 2)}`, 'f(x)'];
          const lsz = fs(12.5, 11.5);
          const lw = Math.min(R.w * 0.36, Math.max(...labels.map((s) => wOf(s, lsz))) + 10);
          const avail = R.w - 2 * pad - lw;
          const wi = avail / (K + 1 + 0.7 * K);
          const wz = 0.7 * wi;
          const colX: { x: number; w: number; zero: number | null; iv: number | null }[] = [];
          let cx = R.x + pad + lw;
          for (let c = 0; c <= 2 * K; c++) {
            const zero = c % 2 === 1 ? (c - 1) / 2 : null;
            const w = zero === null ? wi : wz;
            colX.push({ x: cx, w, zero, iv: zero === null ? c / 2 : null });
            cx += w;
          }
          // Spalte unter dem Mauszeiger hervorheben
          const hc = hoverColumn(t);
          if (hc !== null) {
            const c = colX[hc]!;
            g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.05);
            roundRect(g, c.x + 1, y - 2, c.w - 2, nRows * rh + 2, 6);
            g.fill();
          }
          // Nullstellenspalten (gestrichelte Linien)
          g.save();
          g.strokeStyle = withAlpha(theme.text, 0.18);
          g.setLineDash([2, 3]);
          for (const c of colX) {
            if (c.zero === null) continue;
            g.beginPath();
            g.moveTo(c.x + c.w / 2, y + rh - 2);
            g.lineTo(c.x + c.w / 2, y + nRows * rh - 4);
            g.stroke();
          }
          g.restore();
          const rowAt = (i: number) => clamp01(k.stagger * (nRows + 2) - i);
          const centerText = (s: string, x: number, yy: number, font: string, color: string) => {
            g.font = font;
            g.fillStyle = color;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(s, x, yy);
          };
          // Kopfzeile: x-Werte
          const hf = `700 ${fs(12, 11)}px ${theme.font}`;
          g.save();
          g.globalAlpha *= rowAt(0);
          formula(g, 'x', fstyle(lsz, theme.muted, 600)).draw(g, R.x + pad, y + rh / 2 + 4);
          for (const c of colX) {
            if (c.zero === null) continue;
            const z = t.zeros[c.zero]!;
            const gr = groups()[c.zero];
            let s = N(z.x, 2);
            g.font = hf;
            if (g.measureText(s).width > c.w + wi * 0.8) s = N(z.x, 1);
            centerText(s, c.x + c.w / 2, y + rh / 2, hf, gr ? groupColor(gr) : theme.text);
          }
          g.restore();
          g.strokeStyle = withAlpha(theme.text, 0.2);
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(R.x + pad, y + rh + 0.5);
          g.lineTo(R.x + R.w - pad, y + rh + 0.5);
          g.stroke();
          y += rh;
          const sgnFont = `800 ${fs(14, 13)}px ${theme.font}`;
          const sgnText = (s: 1 | -1) => (s > 0 ? '+' : '−');
          const sgnCol = (s: 1 | -1) => (s > 0 ? col.pos() : col.neg());
          // Faktorzeilen
          t.rows.forEach((rw, i) => {
            g.save();
            g.globalAlpha *= rowAt(i + 1);
            const gr = groups()[i];
            formula(g, `\\c{r${gr ? Math.min(...gr.idx) : 0}}{${factorSrc(rw.x, rw.m)}}`, fstyle(lsz, theme.text, 650)).draw(g, R.x + pad, y + rh / 2 + 4.5);
            for (const c of colX) {
              if (c.iv !== null) centerText(sgnText(rw.signs[c.iv]!), c.x + c.w / 2, y + rh / 2, sgnFont, sgnCol(rw.signs[c.iv]!));
              else if (c.zero === i) centerText('0', c.x + c.w / 2, y + rh / 2, `700 ${fs(13, 12)}px ${theme.font}`, theme.text);
            }
            g.restore();
            y += rh;
          });
          // Zeile für a
          g.save();
          g.globalAlpha *= rowAt(t.rows.length + 1);
          formula(g, `\\c{f}{a = ${N(aGoal(), 2)}}`, fstyle(lsz, theme.text, 650)).draw(g, R.x + pad, y + rh / 2 + 4.5);
          for (const c of colX) if (c.iv !== null) centerText(sgnText(t.lead), c.x + c.w / 2, y + rh / 2, sgnFont, sgnCol(t.lead));
          g.restore();
          y += rh;
          // Ergebniszeile
          g.strokeStyle = withAlpha(theme.text, 0.45);
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(R.x + pad, y + 0.5);
          g.lineTo(R.x + R.w - pad, y + 0.5);
          g.stroke();
          g.save();
          g.globalAlpha *= rowAt(t.rows.length + 2);
          for (const c of colX) {
            if (c.iv === null) continue;
            const s = t.result[c.iv]!;
            g.fillStyle = withAlpha(sgnCol(s), theme.dark ? 0.26 : 0.16);
            roundRect(g, c.x + 2, y + 3, c.w - 4, rh - 5, 6);
            g.fill();
          }
          formula(g, '\\b{f(x)}', fstyle(lsz, theme.text, 750)).draw(g, R.x + pad, y + rh / 2 + 5);
          for (const c of colX) {
            if (c.iv !== null) centerText(sgnText(t.result[c.iv]!), c.x + c.w / 2, y + rh / 2 + 1, `850 ${fs(15, 14)}px ${theme.font}`, sgnCol(t.result[c.iv]!));
            else centerText('0', c.x + c.w / 2, y + rh / 2 + 1, `800 ${fs(13, 12)}px ${theme.font}`, theme.text);
          }
          g.restore();
          y += rh + 6;
        }
        g.font = nfont;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.globalAlpha *= clamp01(k.stagger * 3 - 1.5);
        nlines.forEach((ln, j) => g.fillText(ln, R.x + pad, y + fs(12, 11) * 0.66 + j * fs(12, 11) * 1.32));
        g.restore();
        return h;
      };
    }
    /** Satz unter der Vorzeichentabelle: wo wechselt das Vorzeichen? */
    function signNote(t: SignTable): string {
      const vzw = t.zeros.filter((z) => z.m % 2 === 1).map((z) => N(z.x, 2));
      const no = t.zeros.filter((z) => z.m % 2 === 0).map((z) => N(z.x, 2));
      const and = say(L(' und ', ' and '));
      const list = (xs: string[]) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')}${and}${xs[xs.length - 1]}`);
      const parts: string[] = [];
      if (vzw.length) parts.push(say(L(`Vorzeichenwechsel bei ${list(vzw)} (ungerade Vielfachheit)`, `sign change at ${list(vzw)} (odd multiplicity)`)));
      if (no.length) parts.push(say(L(`kein Wechsel bei ${list(no)} (gerade Vielfachheit)`, `no change at ${list(no)} (even multiplicity)`)));
      const s = parts.join('; ');
      return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
    }
    /** Spalte der Vorzeichentabelle unter dem Mauszeiger (Intervall bzw. Nullstelle). */
    function hoverColumn(t: SignTable): number | null {
      let x: number | null = null;
      if (hover?.id === 'plot' || drag?.kind === 'look') {
        if (hover) x = plot.toWorld(hover.px, hover.py)[0];
      } else if (hover?.id?.startsWith('r')) x = xGoal(Number(hover.id.slice(1)));
      else if (drag?.kind === 'root') x = xGoal(drag.i);
      if (x === null) return null;
      const xs = t.zeros.map((z) => z.x);
      for (let j = 0; j < xs.length; j++) {
        if (Math.abs(x - xs[j]!) < 0.06) return 2 * j + 1;
        if (x < xs[j]!) return 2 * j;
      }
      return 2 * xs.length;
    }

    /** Vier Typen des Randverhaltens; der aktuelle ist hervorgehoben. */
    function endsCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const n = nGoal();
        const a = aGoal();
        const show = infoShown();
        const sk = compact ? 0 : fs(66, 58);
        const rows: string[] = [];
        if (show) {
          const lt = leadTerm(a, n, 'x');
          const e = endBehaviour(a, n);
          rows.push(`${say(L('für große', 'for large'))} |x| ${say(L('zählt nur', 'only'))} \\c{l}{${lt}}${say(L('', ' counts'))}${compact ? `: \\c{m}{n ${n % 2 === 0 ? say(L('gerade', 'even')) : say(L('ungerade', 'odd'))}}` : ''}`);
          rows.push(`x → −∞: \\c{${e.left > 0 ? 'p' : 'n'}}{f(x) → ${e.left > 0 ? '+' : '−'}∞}   x → +∞: \\c{${e.right > 0 ? 'p' : 'n'}}{f(x) → ${e.right > 0 ? '+' : '−'}∞}`);
          if (FAR.goal > 0.5) rows.push(`\\f{f(${FAR_X})}{${leadTerm(a, n, String(FAR_X))}} ≈ ${N(leadingRatio(rawRoots(), FAR_X), 4)}  \\c{m}{${say(L('→ 1 für x → ∞', '→ 1 as x → ∞'))}}`);
        }
        const rsz = fs(12.5, 11.5);
        const boxes = rows.map((s) => fit(s, R.w - 2 * pad - 4, rsz, theme.text, 600, 11));
        const textH = show ? boxes.reduce((s, b) => s + rowH(b) + 6, 0) : fs(12, 11) * 1.32 * 2 + 4;
        const h = 38 + (compact ? 0 : sk + 8) + textH + 6;
        if (measure) return h;
        card(R, col.f());
        cardTitle(R, say(L('Randverhalten', 'End behaviour')), col.f(), show && !compact ? `\\c{f}{n ${n % 2 === 0 ? say(L('gerade', 'even')) : say(L('ungerade', 'odd'))}, a ${a > 0 ? '>' : '<'} 0}` : undefined);
        const types = [
          { even: true, pos: true, l1: say(L('gerade', 'even')), l2: 'a > 0' },
          { even: true, pos: false, l1: say(L('gerade', 'even')), l2: 'a < 0' },
          { even: false, pos: true, l1: say(L('ungerade', 'odd')), l2: 'a > 0' },
          { even: false, pos: false, l1: say(L('ungerade', 'odd')), l2: 'a < 0' },
        ];
        const cw = (R.w - 2 * pad) / 4;
        const top = R.y + 36;
        const ka = ease.outCubic(k.cards);
        g.save();
        g.globalAlpha *= ka;
        // gleitende Hervorhebung
        if (show && !compact) {
          const hx = R.x + pad + kType.v * cw;
          g.fillStyle = withAlpha(col.f(), theme.dark ? 0.2 : 0.11);
          roundRect(g, hx + 2, top, cw - 4, sk, 9);
          g.fill();
          g.strokeStyle = withAlpha(col.f(), 0.5 * infoAlpha());
          g.lineWidth = 1.3;
          roundRect(g, hx + 2.5, top + 0.5, cw - 5, sk - 1, 9);
          g.stroke();
        }
        if (!compact) types.forEach((tp, i) => {
          const cur = show && Math.abs(kType.v - i) < 0.5;
          const bx = R.x + pad + i * cw;
          const cx = bx + cw / 2;
          const cy = top + sk * 0.36;
          const sw = Math.min(cw * 0.32, 26);
          const sh = sk * 0.2;
          g.save();
          g.strokeStyle = withAlpha(theme.text, 0.22);
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(cx - sw - 6, cy);
          g.lineTo(cx + sw + 6, cy);
          g.stroke();
          g.strokeStyle = cur ? col.f() : withAlpha(theme.text, 0.45);
          g.lineWidth = cur ? 2.8 : 1.8;
          g.lineCap = 'round';
          g.beginPath();
          for (let q = 0; q <= 30; q++) {
            const u = -1 + (2 * q) / 30;
            const v = tp.even ? u * u * 2 - 1 : u * u * u;
            const x = cx + u * sw;
            const y = cy - (tp.pos ? v : -v) * sh;
            if (q) g.lineTo(x, y);
            else g.moveTo(x, y);
          }
          g.stroke();
          g.restore();
          const fsz = cw < 66 ? 11 : fs(11.5, 11);
          g.font = `${cur ? 800 : 600} ${fsz}px ${theme.font}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillStyle = cur ? theme.text : theme.muted;
          g.font = `800 ${fsz}px ${theme.font}`;
          const longOk = g.measureText(`n ${say(L('ungerade', 'odd'))}`).width <= cw - 4;
          g.font = `${cur ? 800 : 600} ${fsz}px ${theme.font}`;
          const l1 = longOk ? `n ${tp.l1}` : tp.l1;
          g.fillText(l1, cx, top + sk * 0.68);
          g.fillStyle = cur ? col.f() : theme.muted;
          g.fillText(tp.l2, cx, top + sk * 0.68 + fsz + 2);
        });
        let y = compact ? top : top + sk + 8;
        const ta = clamp01(k.stagger * 3 - 1) * infoAlpha();
        if (show) {
          boxes.forEach((b) => {
            g.save();
            g.globalAlpha *= ta;
            b.draw(g, R.x + pad, y + b.asc);
            g.restore();
            y += rowH(b) + 6;
          });
        } else {
          const f = `550 ${fs(12, 11)}px ${theme.font}`;
          g.globalAlpha *= ta;
          wrapText(say(L('Welcher Typ passt zum Graphen? Achte auf beide Enden.', 'Which type fits the graph? Look at both ends.')), R.w - 2 * pad, f).forEach((ln, j) => {
            g.font = f;
            g.fillStyle = theme.muted;
            g.textAlign = 'left';
            g.fillText(ln, R.x + pad, y + fs(12, 11) * 0.66 + j * fs(12, 11) * 1.32);
          });
        }
        g.restore();
        return h;
      };
    }

    function nearCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const rows: RowSpec[] = [];
        const gs = groups();
        if (infoShown()) {
          gs.forEach((gr, gi) => {
            const loc = localApprox(aGoal(), rawRoots(), gi);
            const key = `r${Math.min(...gr.idx)}`;
            const c = Math.abs(loc.c - 1) < 1e-12 ? '' : Math.abs(loc.c + 1) < 1e-12 ? '−' : `${N(loc.c, 3)} · `;
            rows.push({ src: `\\c{${key}}{x_0 = ${N(gr.x, 2)}:}  f(x) ≈ ${c}${factorSrc(gr.x, gr.m)}`, size: fs(13, 12), gap: 3, hl: gi === focusGroup() && kNear.v > 0.5 ? groupColor(gr) : undefined });
            if (!compact) rows.push({ src: `\\c{m}{${shapeName(gr.m)} → ${kindName(gr.m)}}`, size: fs(12, 11), gap: 9 });
          });
          if (gs.length > 1 && !compact) rows.push(noteRow(L('c = a · Produkt der übrigen Faktoren an der Stelle x₀.', 'c = a · product of the other factors at x₀.')));
        } else rows.push(noteRow(L('Erst schätzen: Schneidet, berührt oder schmiegt sich der Graph an?', 'Estimate first: does the graph cross, touch or flatten out?')));
        return formulaCard(R, measure, k, say(L('Nahe den Nullstellen', 'Near the zeros')), col.r(0), rows, undefined, infoAlpha());
      };
    }

    function cardsFor(k: Intro, now: number): { id: string; fn: CardFn }[] {
      const list: { id: string; fn: CardFn }[] = [{ id: 'term', fn: termCard(k, now) }];
      const ends = p.ends ? [{ id: 'ends', fn: endsCard(k) }] : [];
      // in der Fernansicht ist das Randverhalten die wichtigste Karte
      if (farOn) list.push(...ends);
      if (p.tab) list.push({ id: 'tab', fn: signCard(k) });
      if (p.near) list.push({ id: 'near', fn: nearCard(k) });
      if (!farOn) list.push(...ends);
      return list;
    }

    function drawColumn(C: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list = cardsFor(k, now);
      let y = C.y;
      list.forEach((c, i) => {
        const room = { x: C.x, y, w: C.w, h: C.y + C.h - y };
        let target = c.fn(room, true, false);
        let compact = false;
        if (y + target > C.y + C.h + 1) {
          const t2 = c.fn(room, true, true);
          if (t2 < target && y + t2 <= C.y + C.h + 1) {
            target = t2;
            compact = true;
          }
        }
        let ch = cardH.get(c.id);
        if (!ch) {
          ch = new Chan(target);
          cardH.set(c.id, ch);
        }
        if (ch.goal !== target) {
          if (reduced()) ch.jump(target);
          else ch.follow(target, 0.12);
        }
        const hh = Math.min(ch.v, target + 40);
        if (y + Math.min(hh, target) > C.y + C.h + 1) return;
        const a = clamp01(k.cards * 1.6 - i * 0.22);
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        const R = { x: C.x, y, w: C.w, h: hh };
        g.save();
        g.beginPath();
        g.rect(R.x - 20, R.y - 20, R.w + 40, R.h + 26);
        g.clip();
        c.fn(R, false, compact);
        g.restore();
        g.restore();
        y += hh + gap;
      });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const gs = groups();
      const n = degree(gs);
      const a = aGoal();
      ctx.readout('term', { html: toHtml(factoredSrc(false)) });
      ctx.readout('norm', { html: toHtml(`f(x) = ${polySrc(expandExact(a, rawRoots()))}`) });
      ctx.readout('deg', { html: `${say(L('Grad', 'degree'))} <var>n</var> = ${n}, ${say(L('Leitkoeffizient', 'leading coefficient'))} <var>a</var> = ${N(a, 2)}` });
      ctx.readout('zeros', gs.map((gr) => `x = ${N(gr.x, 2)} (${multName(gr.m)}, ${kindName(gr.m)})`).join('; '));
      const e = endBehaviour(a, n);
      ctx.readout('ends', `x → −∞: f(x) → ${e.left > 0 ? '+' : '−'}∞; x → +∞: f(x) → ${e.right > 0 ? '+' : '−'}∞`);
      ctx.readout('yint', { html: `<var>f</var>(0) = ${big(yIntercept(a, rawRoots()), 4)}` });
      ctx.readout(
        'local',
        p.near
          ? {
              html: gs
                .map((gr, gi) => {
                  const loc = localApprox(a, rawRoots(), gi);
                  return `${say(L('bei', 'at'))} ${N(gr.x, 2)}: ${toHtml(`f(x) ≈ ${N(loc.c, 3)} · ${factorSrc(gr.x, gr.m)}`)}`;
                })
                .join('; '),
            }
          : null,
      );
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      let anim = false;
      for (const c of chans()) if (c.step(now, dt)) anim = true;
      if (intro !== null || pops.length || dragging()) anim = true;
      if (steps && now - steps.t0 < 6000) anim = true;
      if (revealT !== null && now - revealT > 1200) revealT = null;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawPlot(now, k);
      g.restore();
      drawColumn(R.col, k, now);
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retargetAll(now: number, source: string, changed: ReadonlySet<string>): void {
      const instant = source === 'init' || reduced();
      const replace = source === 'replace';
      for (let i = 0; i < 3; i++) {
        const x = xGoal(i);
        const c = XS[i]!;
        if (instant) c.jump(x);
        else if (drag?.kind === 'root' && drag.i === i) c.follow(x, 0.035);
        else if (replace || changed.has('z')) c.glide(x, 820, i * 70, now);
        else if (c.goal !== x) c.follow(x, 0.14);
        const m = mGoal(i);
        const cm = MS[i]!;
        if (instant) cm.jump(m);
        else if (cm.goal !== m) cm.glide(m, 680, replace ? 120 + i * 70 : 0, now);
      }
      const a = aGoal();
      if (instant) A.jump(a);
      else if (drag?.kind === 'lead') A.follow(a, 0.035);
      else if (replace) A.glide(a, 800, 60, now);
      else if (A.goal !== a) A.follow(a, 0.14);
      const flags: [Chan, number][] = [
        [kInfo, p.info ? 1 : 0],
        [kSign, p.sign ? 1 : 0],
        [kEnds, p.ends ? 1 : 0],
        [kNear, p.near ? 1 : 0],
        [kYi, p.yi ? 1 : 0],
      ];
      for (const [c, goal] of flags) {
        if (instant) c.jump(goal);
        else if (c.goal !== goal) c.glide(goal, c === kInfo ? 900 : 480, 0, now);
      }
      const type = (nGoal() % 2 === 0 ? 0 : 2) + (aGoal() > 0 ? 0 : 1);
      if (instant) kType.jump(type);
      else if (kType.goal !== type) kType.glide(type, 520, 0, now, ease.outBack);
      if (drag?.kind === 'lead') retarget(now, instant, 'keep');
      else if (drag?.kind === 'root') retarget(now, instant, 'follow');
      else retarget(now, instant, 'glide');
    }

    /** Neue Zusammenfälle von Nullstellen erkennen (für die Pop-Meldung). */
    function detectMerges(now: number): void {
      const gs = groups();
      for (const gr of gs) {
        if (gr.idx.length < 2) continue;
        const before = prevGroups.find((q) => q.idx.length >= gr.idx.length && gr.idx.every((i) => q.idx.includes(i)));
        if (before) continue;
        // Bei reduzierter Bewegung keine aufsteigende Meldung; der Hinweis steht in der Karte „Funktionsterm“.
        if (reduced()) continue;
        const parts = gr.idx.map((i) => mGoal(i)).join(' + ');
        pops.push({ x: gr.x, t0: now, src: `\\c{r${Math.min(...gr.idx)}}{${say(L('verschmolzen', 'merged'))}: ${parts} = ${gr.m}}`, color: groupColor(gr) });
      }
      prevGroups = gs.map((gr) => ({ ...gr, idx: [...gr.idx] }));
    }

    function setLabels(): void {
      ctx.setAction('far', { label: say(farOn ? L('Zurück zur Nahansicht', 'Back to the close-up') : L('Blick aus der Ferne', 'View from far away')) });
      ctx.setAction('steps', { label: say(steps ? L('Rechenweg ausblenden', 'Hide the working') : L('Ausmultiplizieren Schritt für Schritt', 'Expand step by step')) });
    }

    /* ---------- Zeiger: Perlen ziehen und antippen, a am Griff ziehen ---------- */
    function hit(px: number, py: number, touch: boolean): string | null {
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      if (FAR.v > 0.3 || kInfo.v < 0.5 || !editable()) return 'plot';
      const bs = beads();
      const rad = touch ? 24 : 16;
      let best: { id: string; d: number } | null = null;
      for (const b of bs) {
        const d = Math.hypot(px - b.px, py - b.py);
        if (d < rad && (!best || d < best.d)) best = { id: `r${Math.max(...b.idx)}`, d };
      }
      if (best) return best.id;
      const hx = XH.v;
      const hpx = plot.px(hx);
      const hpy = plot.py(fShown(hx));
      if (Math.hypot(px - hpx, py - hpy) < (touch ? 24 : 16)) return 'a';
      return 'plot';
    }
    const target: Target = {
      contains: (px: number, py: number) => hit(px, py, false) !== null,
      pointerDown: (q: Ptr) => {
        const id = hit(q.px, q.py, q.type === 'touch');
        if (!id) return false;
        const now = performance.now();
        if (id.startsWith('r') && editable()) {
          const i = Number(id.slice(1));
          drag = { kind: 'root', i, sx: q.px, sy: q.py, moved: false, t0: now };
          surface.setCursor('grabbing');
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return true;
        }
        if (id === 'a' && editable()) {
          const g0 = evaluate(1, rawRoots(), XH.v);
          if (Math.abs(g0) < 1e-12) return false;
          drag = { kind: 'lead', g: g0 };
          surface.setCursor('grabbing');
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return true;
        }
        if (q.type === 'touch') {
          drag = { kind: 'look' };
          hover = { id: 'plot', px: q.px, py: q.py };
          ctx.requestRender();
          return true;
        }
        return false;
      },
      pointerMove: (q: Ptr) => {
        if (!drag) return;
        lastDrag = performance.now();
        if (drag.kind === 'look') {
          hover = { id: 'plot', px: q.px, py: q.py };
          ctx.requestRender();
          return;
        }
        if (drag.kind === 'root') {
          if (!drag.moved && Math.hypot(q.px - drag.sx, q.py - drag.sy) > 5) drag.moved = true;
          if (!drag.moved) return;
          const [wx] = plot.toWorld(q.px, q.py);
          const x = Math.round(clamp(wx, -4, 4) * 2) / 2;
          focusX = x;
          if (x !== xGoal(drag.i)) setP({ [X_KEYS[drag.i]!]: x });
          ctx.requestRender();
          return;
        }
        const [, wy] = plot.toWorld(q.px, q.py);
        let a = Math.round(clamp(wy / drag.g, -3, 3) * 10) / 10;
        if (a === 0) a = wy / drag.g < 0 ? -0.1 : 0.1;
        if (a !== p.a) setP({ a });
        ctx.requestRender();
      },
      pointerUp: (q: Ptr) => {
        const d = drag;
        drag = null;
        const now = performance.now();
        if (d?.kind === 'root' && !d.moved && now - d.t0 < 600 && editable()) {
          // Antippen: Vielfachheit 1 → 2 → 3 → 4 → 1
          const key = M_KEYS[d.i]!;
          focusX = xGoal(d.i);
          setP({ [key]: ((p[key] as number) % 4) + 1 });
        }
        if (d?.kind === 'look') hover = null;
        else hover = { id: hit(q.px, q.py, false), px: q.px, py: q.py };
        retarget(now, false, 'glide');
        surface.setCursor(hover?.id?.startsWith('r') || hover?.id === 'a' ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const id = q ? hit(q.px, q.py, false) : null;
        hover = q && id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(id?.startsWith('r') || id === 'a' ? 'grab' : '');
        ctx.requestRender();
      },
      wheel: () => false,
    };
    surface.addTarget(target);

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'input' && changed.has('a') && p.a === 0) setP({ a: 0.1 });
        if (source === 'replace') {
          steps = null;
          focusX = null;
        }
        if (changed.has('info') && p.info && source !== 'init') revealT = now;
        detectMerges(source === 'init' ? -1e9 : now);
        table = signTable(aGoal(), rawRoots());
        retargetAll(now, source, changed);
        if (source === 'init' && !reduced()) {
          intro = now;
          FAR.jump(0);
        }
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'far') {
          farOn = !farOn;
          retarget(now, false, 'keep');
          if (reduced()) FAR.jump(farOn ? 1 : 0);
          else FAR.glide(farOn ? 1 : 0, farOn ? 2200 : 1600, 0, now, ease.inOutCubic);
        } else if (id === 'steps') {
          steps = steps ? null : { t0: now };
        } else if (id === 'reveal') {
          setP({ info: true });
        }
        setLabels();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
