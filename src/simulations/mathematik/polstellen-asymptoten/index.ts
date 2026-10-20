import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  analyze,
  approachTable,
  asymptoteCrossings,
  cancelPairs,
  degree,
  deviation,
  divisionSteps,
  evalPoly,
  poleApprox,
  poleSides,
  reducedValue,
  signTable,
  symmetry,
  value,
  yIntercept,
  type Analysis,
  type Poly,
  type Rational,
  type SignTable,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Sichtbarer Grundausschnitt (halbe Breite bzw. Höhe). */
const XR = 6.5;
const YR = 6;
/** Zoomfaktor „Blick aus der Ferne“. */
const FAR_ZOOM = 8;
/** Stelle, an der in der Fernansicht die Abweichung r(x)/q(x) abgelesen wird. */
const FAR_X = 40;
/** Dauer des Laufs „Punkt entlanglaufen lassen“ in ms. */
const RUN_MS = 7000;
const Z_KEYS = ['z1', 'z2', 'z3'] as const;
const P_KEYS = ['p1', 'p2', 'p3'] as const;

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

/** Hochzahl als Unicode-Hochzeichen. */
const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
const supNum = (k: number) =>
  (k < 0 ? '⁻' : '') +
  String(Math.abs(k))
    .split('')
    .map((d) => SUP[Number(d)])
    .join('');

/**
 * Gebrochen-rationale Funktionen aus Linearfaktoren. Zählernullstellen sind
 * grüne Perlen auf der x-Achse, Nennernullstellen rote Pol-Ringe; beide lassen
 * sich ziehen. Liegt eine Perle in einem Ring, kürzt sich der Faktor: Im Term
 * werden beide Faktoren durchgestrichen, die senkrechte Asymptote schrumpft zu
 * einem Loch im Graphen (behebbare Lücke mit Koordinaten). Polstellen zeigen
 * mit Pfeilen, ob f links und rechts gegen +∞ oder −∞ strebt (mit/ohne VZW).
 * Für x → ±∞: waagrechte oder schräge Asymptote bzw. Näherungskurve aus der
 * Polynomdivision – auf Wunsch Schritt für Schritt wie an der Tafel –, die
 * Abweichung r(x)/q(x) als Maßpfeil, „Blick aus der Ferne“ (× 8). Karten:
 * Term (gegeben, gekürzt, ausmultipliziert, dividiert), Steckbrief,
 * Verhalten im Unendlichen, Wertetabelle an der Polstelle, Vorzeichentabelle.
 * Mit „Eigenschaften zeigen“ aus wird daraus eine Aufgabe mit Aufdecken.
 */
export default defineSimulation({
  id: 'polstellen-asymptoten',
  dragHint: true,
  layout: { aspect: 1.28, aspectNarrow: 0.36 },
  groups: [
    { id: 'num', label: L('Zähler', 'Numerator') },
    { id: 'den', label: L('Nenner', 'Denominator') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'a',
      type: 'number',
      group: 'num',
      label: L('Faktor a', 'Factor a'),
      min: -3,
      max: 3,
      step: 0.5,
      default: 1,
      help: L('Faktor vor dem Bruch. Bei gleichem Zähler- und Nennergrad ist y = a die waagrechte Asymptote.', 'Factor in front of the fraction. If numerator and denominator have the same degree, y = a is the horizontal asymptote.'),
    },
    { key: 'zn', type: 'number', group: 'num', label: L('Zählergrad (Anzahl Linearfaktoren)', 'Degree of numerator (linear factors)'), min: 0, max: 3, step: 1, default: 1 },
    {
      key: 'z1',
      type: 'number',
      group: 'num',
      label: L('Nullstelle z₁', 'Zero z₁'),
      min: -5,
      max: 5,
      step: 0.5,
      default: 1,
      help: L('Die grünen Perlen auf der x-Achse lassen sich ziehen.', 'The green beads on the x-axis can be dragged.'),
      visibleIf: (v) => (v.zn as number) >= 1,
    },
    { key: 'z2', type: 'number', group: 'num', label: L('Nullstelle z₂', 'Zero z₂'), min: -5, max: 5, step: 0.5, default: -1, visibleIf: (v) => (v.zn as number) >= 2 },
    { key: 'z3', type: 'number', group: 'num', label: L('Nullstelle z₃', 'Zero z₃'), min: -5, max: 5, step: 0.5, default: 3, visibleIf: (v) => (v.zn as number) >= 3 },
    { key: 'pn', type: 'number', group: 'den', label: L('Nennergrad', 'Degree of denominator'), min: 1, max: 3, step: 1, default: 1 },
    {
      key: 'p1',
      type: 'number',
      group: 'den',
      label: L('Nennernullstelle p₁', 'Zero of denominator p₁'),
      min: -5,
      max: 5,
      step: 0.5,
      default: -2,
      help: L('Die roten Ringe lassen sich ziehen. Liegt eine grüne Perle in einem Ring, kürzt sich der Faktor.', 'The red rings can be dragged. If a green bead sits in a ring, the factor cancels.'),
    },
    { key: 'p2', type: 'number', group: 'den', label: L('Nennernullstelle p₂', 'Zero of denominator p₂'), min: -5, max: 5, step: 0.5, default: 2, visibleIf: (v) => (v.pn as number) >= 2 },
    { key: 'p3', type: 'number', group: 'den', label: L('Nennernullstelle p₃', 'Zero of denominator p₃'), min: -5, max: 5, step: 0.5, default: 4, visibleIf: (v) => (v.pn as number) >= 3 },
    { key: 'asy', type: 'boolean', group: 'view', label: L('Asymptoten zeichnen', 'Draw the asymptotes'), default: true },
    { key: 'sgn', type: 'boolean', group: 'view', label: L('Vorzeichen von f an der x-Achse', 'Sign of f along the x-axis'), default: true },
    { key: 'far', type: 'boolean', group: 'view', label: L('Blick aus der Ferne (× 8)', 'View from afar (× 8)'), default: false },
    { key: 'tab', type: 'boolean', group: 'view', label: L('Wertetabelle an der Polstelle', 'Table of values at the pole'), default: false },
    { key: 'vzt', type: 'boolean', group: 'view', label: L('Vorzeichentabelle', 'Sign chart'), default: false },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Eigenschaften zeigen', 'Show the properties'),
      help: L('Aus: Definitionsmenge, Polstellen, Lücken und Asymptote selbst bestimmen, danach aufdecken.', 'Off: find the domain, poles, gaps and asymptote yourself, then reveal them.'),
      default: true,
    },
  ],
  actions: [
    { id: 'run', label: L('Punkt entlanglaufen lassen', 'Let a point run along the graph'), primary: true },
    { id: 'div', label: L('Polynomdivision Schritt für Schritt', 'Polynomial division step by step'), visibleIf: (v) => v.show === true && v.a !== 0 && (v.zn as number) >= (v.pn as number) },
    { id: 'reveal', label: L('Eigenschaften aufdecken', 'Reveal the properties'), primary: true, visibleIf: (v) => v.show !== true },
  ],
  readouts: [
    { key: 'term', label: L('Funktionsterm', 'Function'), spoiler: true },
    { key: 'dom', label: L('Definitionsmenge', 'Domain'), spoiler: true },
    { key: 'zeros', label: L('Nullstellen', 'Zeros'), spoiler: true },
    { key: 'poles', label: L('Polstellen', 'Poles'), spoiler: true },
    { key: 'holes', label: L('Behebbare Lücken', 'Removable gaps'), spoiler: true },
    { key: 'asym', label: L('Asymptote', 'Asymptote'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'std', label: L('Eine Polstelle, y = 1', 'One pole, y = 1'), values: {} },
    { id: 'hole', label: L('Lücke statt Pol: Faktor kürzt sich', 'Gap instead of pole: factor cancels'), values: { zn: 2, z1: 1, z2: -1, pn: 1, p1: 1 } },
    { id: 'double', label: L('Doppelte Polstelle: ohne VZW', 'Double pole: no sign change'), values: { zn: 0, a: 2, pn: 2, p1: 1, p2: 1 } },
    { id: 'oblique', label: L('Schräge Asymptote', 'Oblique asymptote'), values: { zn: 2, z1: 1, z2: -1, pn: 1, p1: 2 } },
    { id: 'zero', label: L('Zwei Pole, y = 0, punktsymmetrisch', 'Two poles, y = 0, point symmetric'), values: { zn: 1, z1: 0, pn: 2, p1: -2, p2: 2, a: 2 } },
    { id: 'curve', label: L('Zählergrad 3: Näherungsparabel', 'Degree 3 on top: approximating parabola'), values: { zn: 3, z1: -2, z2: 0, z3: 2, pn: 1, p1: -1, a: 0.5 } },
    { id: 'cross', label: L('Graph schneidet die Asymptote', 'Graph crosses the asymptote'), values: { zn: 2, z1: -1, z2: 3, pn: 2, p1: -3, p2: 1 } },
    { id: 'task', label: L('Aufgabe: Steckbrief selbst erstellen', 'Task: find the properties yourself'), values: { zn: 2, z1: 1, z2: -1, pn: 1, p1: 2, show: false } },
  ],
  strings: {
    de: {
      canvas:
        'Großes Koordinatensystem mit dem Graphen einer gebrochen-rationalen Funktion. Die Nullstellen des Zählers sind grüne Perlen, die des Nenners rote Ringe auf der x-Achse; beide lassen sich ziehen. Liegt eine Perle in einem Ring, kürzt sich der Faktor und statt einer Polstelle entsteht ein Loch im Graphen. An den Polstellen senkrechte Asymptoten mit Pfeilen für plus oder minus unendlich, dazu die waagrechte oder schräge Asymptote bzw. Näherungskurve, ein Vorzeichenstreifen an der x-Achse und ein Punkt, der am Graphen entlangläuft. Daneben Karten mit dem Term (gekürzt, ausmultipliziert, nach Polynomdivision), dem Steckbrief, dem Verhalten im Unendlichen mit Polynomdivision, einer Wertetabelle an der Polstelle und einer Vorzeichentabelle.',
    },
    en: {
      canvas:
        'Large coordinate system with the graph of a rational function. The zeros of the numerator are green beads, those of the denominator red rings on the x-axis; both can be dragged. If a bead sits in a ring, the factor cancels and instead of a pole there is a hole in the graph. At the poles vertical asymptotes with arrows for plus or minus infinity, plus the horizontal or oblique asymptote or approximating curve, a sign strip along the x-axis and a point running along the graph. Next to it cards with the term (cancelled, expanded, after polynomial division), the profile, the behaviour at infinity with polynomial division, a table of values at the pole and a sign chart.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const T2 = (de: string, en: string) => (lang === 'de' ? de : en);
    const setP = (vals: Record<string, number | boolean>) => ctx.set(vals as never);
    const editable = () => !ctx.locked;

    /* ---------- Farben (gleiche Farbe = gleiche Größe in Bild, Term und Karten) ---------- */
    const col = {
      f: () => th().series[0]!,
      z: () => th().series[2]!,
      p: () => th().series[1]!,
      s: () => th().series[4]!,
      P: () => th().series[5]!,
      h: () => th().series[3]!,
      pos: () => th().series[2]!,
      neg: () => th().series[1]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d: number) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7 * Math.max(1, Math.abs(v * 10 ** d));
    const group3 = (s: string) => {
      const neg = s.startsWith('−');
      const body = neg ? s.slice(1) : s;
      const [int, frac] = body.split(/(?=[,.]\d)/);
      const g = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${neg ? '−' : ''}${g}${frac ?? ''}`;
    };
    /** Große Zahlen mit Tausender-Abstand bzw. Zehnerpotenz. */
    function big(v: number, d = 2): string {
      if (!Number.isFinite(v)) return '–';
      const a = Math.abs(v);
      if (a >= 1e7) {
        const e = Math.floor(Math.log10(a));
        return `${N(v / 10 ** e, 2)} · 10${supNum(e)}`;
      }
      if (a >= 1e4) return group3(N(Math.round(v), 0));
      if (a >= 1000) return group3(N(v, Math.min(d, 1)));
      return N(v, d);
    }
    const eqS = (v: number, d: number) => (isExact(v, d) ? '=' : '≈');

    /* ---------- Funktion (Ziel) ---------- */
    const zGoal = (i: number) => p[Z_KEYS[i]!] as number;
    const pGoal = (j: number) => p[P_KEYS[j]!] as number;
    const rational = (): Rational => ({
      a: p.a,
      zeros: Z_KEYS.slice(0, p.zn).map((k) => p[k] as number),
      poles: P_KEYS.slice(0, p.pn).map((k) => p[k] as number),
    });
    let F: Rational = rational();
    let A: Analysis = analyze(F);
    let pairs = cancelPairs(F);
    let table: SignTable = signTable(F);
    let crossings: { x: number; y: number }[] = [];
    let sym: 'even' | 'odd' | null = null;
    function recompute(): void {
      F = rational();
      A = analyze(F);
      pairs = p.a === 0 ? [] : cancelPairs(F);
      table = signTable(F);
      crossings = A.kind === 'const' || A.kind === 'oblique' ? asymptoteCrossings(F, A) : [];
      sym = symmetry(F);
    }
    recompute();
    const isCancelled = (j: number) => pairs.some((q) => q.pi === j);
    const zeroCancelled = (i: number) => pairs.some((q) => q.zi === i);
    const isPoleIdx = (j: number) => j < p.pn && p.a !== 0 && !isCancelled(j);
    /** 0: y = 0, 1: y = a, 2: schräg, 3: Näherungskurve */
    const caseIdx = () => (A.kind === 'zero' ? 0 : A.kind === 'const' ? 1 : A.kind === 'oblique' ? 2 : 3);

    /* ---------- angezeigter Zustand ---------- */
    const SA = new Chan(p.a);
    const SZ = [0, 1, 2].map((i) => new Chan(zGoal(i)));
    const SP = [0, 1, 2].map((j) => new Chan(pGoal(j)));
    /** Sichtbarkeit der Perlen bzw. Ringe (Einblenden, Ausblenden) */
    const ZV = [0, 1, 2].map((i) => new Chan(i < p.zn ? 1 : 0));
    const PV = [0, 1, 2].map((j) => new Chan(j < p.pn ? 1 : 0));
    /** Länge der senkrechten Asymptote (1: Polstelle, 0: zum Loch geschrumpft) */
    const PS = [0, 1, 2].map((j) => new Chan(isPoleIdx(j) ? 1 : 0));
    /** Durchstreichen im Term (je Nennerfaktor) und Loch-Ring */
    const CX = [0, 1, 2].map((j) => new Chan(isCancelled(j) ? 1 : 0));
    const HV = [0, 1, 2].map((j) => new Chan(isCancelled(j) ? 1 : 0));
    const FAR = new Chan(p.far ? 1 : 0);
    const kInfo = new Chan(p.show ? 1 : 0);
    const kAsy = new Chan(p.asy ? 1 : 0);
    const kSgn = new Chan(p.sgn ? 1 : 0);
    const kCase = new Chan(caseIdx());
    const cardH = new Map<string, Chan>();
    const chans = () => [SA, ...SZ, ...SP, ...ZV, ...PV, ...PS, ...CX, ...HV, FAR, kInfo, kAsy, kSgn, kCase, ...cardH.values()];
    /** Anzahl der Faktoren, mit der gerade gezeichnet wird */
    let shownZn = p.zn;
    let shownPn = p.pn;
    const shownF = (): Rational => ({
      a: SA.v,
      zeros: SZ.slice(0, shownZn).map((c) => c.v),
      poles: SP.slice(0, shownPn).map((c) => c.v),
    });
    /** Vorheriger Graph blendet aus, wenn sich die Anzahl der Faktoren ändert. */
    let prevShape: { f: Rational; an: Analysis; t0: number } | null = null;
    let graphIn: number | null = null;

    /* ---------- Zustand der Bedienung ---------- */
    let intro: number | null = null;
    let runT0: number | null = null;
    let divOn: { t0: number } | null = null;
    let tabT0 = -1e9;
    let revealT: number | null = null;
    let pops: { x: number; y: number; t0: number; src: string; color: string }[] = [];
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let drag: { kind: 'z' | 'p'; i: number; sx: number; sy: number; moved: boolean; t0: number } | { kind: 'look' } | null = null;
    let hover: { id: string; px: number; py: number } | null = null;
    /** zuletzt bediente Stelle (für die Wertetabelle) */
    let focusX: number | null = null;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    function cnt(id: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(id);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(id, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (Math.abs(e.c.v - v) > 30 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() ? 0.05 : 0.18);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählte, formatierte Zahl; am Ziel exakt */
    const cN = (id: string, v: number, d = 2) => {
      const s = cnt(id, v);
      return Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? big(v, d) : big(s, d);
    };

    /* ---------- Aufteilung (nach Breite UND Höhe) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.15;
    const sm = () => surface.width < 560;
    const fs = (bigSize: number, small: number) => (sm() ? small : bigSize);
    function regions(): { plot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.32, 246, 360));
        return { plot: { x: 0, y: 0, w: w - cw - 12, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 0.98, 260, h * 0.44));
      return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const PAD = () => ({ left: 12, right: 12, top: fs(26, 22), bottom: 18 });
    const plot = new Plot(surface, {
      x: [-XR, XR],
      y: [-YR, YR],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().plot,
      xAxis: { label: 'x', format: (v) => big(v, 2) },
      yAxis: { label: 'y', format: (v) => big(v, 2) },
    });
    function view(): { x: [number, number]; y: [number, number] } {
      const z = FAR_ZOOM ** FAR.v;
      return { x: [-XR * z, XR * z], y: [-YR * z, YR * z] };
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), z: col.z(), p: col.p(), s: col.s(), P: col.P(), h: col.h(), pos: col.pos(), neg: col.neg(), m: th().muted, t: th().text },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, minSize = 11): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > minSize) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    const wOf = (src: string, size: number, weight = 700) => formula(surface.g, src, fstyle(size, th().text, weight)).w;

    /** Linearfaktor (x − r) als Kurzschrift, mit Hochzahl. */
    function linSrc(r: number, m = 1, bare = false): string {
      const base = Math.abs(r) < 1e-12 ? 'x' : bare && m === 1 ? `x ${r > 0 ? '−' : '+'} ${N(Math.abs(r), 2)}` : `(x ${r > 0 ? '−' : '+'} ${N(Math.abs(r), 2)})`;
      return m > 1 ? `${base}^{${m}}` : base;
    }
    /** Polynom (Koeffizienten aufsteigend) als Kurzschrift, höchste Potenz zuerst. */
    function polySrc(c: Poly, first = true): string {
      const d = degree(c);
      if (d < 0) return '0';
      const parts: string[] = [];
      for (let i = d; i >= 0; i--) {
        const v = c[i]!;
        if (Math.abs(v) < 1e-9) continue;
        const abs = Math.abs(v);
        const coef = i > 0 && Math.abs(abs - 1) < 1e-9 ? '' : N(abs, 4);
        const xs = i === 0 ? '' : i === 1 ? 'x' : `x^{${i}}`;
        const lead = parts.length === 0 && first;
        parts.push(lead ? `${v < 0 ? '−' : ''}${coef}${xs}` : `${v < 0 ? '−' : '+'} ${coef}${xs}`);
      }
      return parts.join(' ') || '0';
    }
    /** Ein Glied c·xᵏ (für die Tafel-Division): Vorzeichen getrennt vom Betrag. */
    function termParts(c: number, k: number): { neg: boolean; body: string } {
      const abs = Math.abs(c);
      const coef = k > 0 && Math.abs(abs - 1) < 1e-9 ? '' : N(abs, 4);
      return { neg: c < 0, body: `${coef}${k === 0 ? '' : k === 1 ? 'x' : `x^{${k}}`}` };
    }
    /** Asymptote bzw. Näherungskurve als Gleichung. */
    const asymSrc = (an: Analysis = A) => `y = ${an.kind === 'zero' ? '0' : polySrc(an.asym)}`;
    /** Rest-Bruch r(x)/q(x) mit Vorzeichen davor („+ 3/(x − 2)“ bzw. „− 3/(x + 2)“). */
    function restSrc(an: Analysis = A): string {
      const d = degree(an.rest);
      if (d < 0) return '';
      const neg = an.rest[d]! < 0;
      const r = neg ? an.rest.map((v) => -v) : an.rest;
      return `${neg ? '−' : '+'} \\f{${polySrc(r)}}{${polySrc(an.den)}}`;
    }
    /** Definitionsmenge. */
    const domSrc = () => (A.gaps.length ? `D = ℝ \\ {${A.gaps.map((x) => N(x, 2)).join('; ')}}` : 'D = ℝ');
    const orderName = (k: number) => (k === 1 ? T2('einfach', 'simple') : k === 2 ? T2('doppelt', 'double') : T2('dreifach', 'triple'));

    /** Kurzschrift → HTML (Ergebnisse unter der Bühne). */
    function toHtml(src: string): string {
      let i = 0;
      const grp = (): string => {
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
          out += buf.replace(/(^|[^\p{L}])(\p{L})(?![\p{L}])/gu, (_, pre: string, ch: string) => (ch === 'ℝ' ? `${pre}${ch}` : `${pre}<var>${ch}</var>`));
          buf = '';
        };
        while (i < src.length && src[i] !== end) {
          const ch = src[i]!;
          if (ch === '\\' && 'fcbt'.includes(src[i + 1] ?? '')) {
            const cmd = src[i + 1]!;
            i += 2;
            flush();
            if (cmd === 'f') {
              const a = grp();
              out += `<span class="frac"><span>${a}</span><span>${grp()}</span></span>`;
            } else if (cmd === 'c') {
              grp();
              out += grp();
            } else if (cmd === 'b') out += `<strong>${grp()}</strong>`;
            else out += grp();
          } else if (ch === '^' || ch === '_') {
            flush();
            i++;
            out += ch === '^' ? `<sup>${grp()}</sup>` : `<sub>${grp()}</sub>`;
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

    /* ---------- Zeichenhilfen ---------- */
    type Align = 'left' | 'center' | 'right';
    type PillOpts = { color?: string; border?: string; align?: Align; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean; dashed?: boolean };
    /** Bereits belegte Flächen im Hauptbild (gegen überlappende Beschriftungen). */
    let placed: Rect[] = [];
    const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    /** Beschriftung an der ersten freien Wunschstelle (sonst an der mit der kleinsten Überdeckung). */
    function fpillFree(cands: { x: number; y: number; align: Align }[], src: string, opts: PillOpts = {}): Rect {
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
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.save();
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        if (opts.dashed) g.setLineDash([4, 3]);
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
        g.restore();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.42 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }
    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.6;
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
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9, both = false): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5 || !Number.isFinite(len)) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * (both ? 0.4 : 0.5));
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0 + (both ? ux * hd * 0.7 : 0), y0 + (both ? uy * hd * 0.7 : 0));
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      const headAt = (hx: number, hy: number, sx: number, sy: number) => {
        g.beginPath();
        g.moveTo(hx, hy);
        g.lineTo(hx - sx * hd - sy * hd * 0.55, hy - sy * hd + sx * hd * 0.55);
        g.lineTo(hx - sx * hd + sy * hd * 0.55, hy - sy * hd - sx * hd * 0.55);
        g.closePath();
        g.fill();
      };
      headAt(x1, y1, ux, uy);
      if (both) headAt(x0, y0, -ux, -uy);
    }
    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht); NaN trennt Stücke. */
    function strokePts(pieces: [number, number][][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
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
        for (const pts of pieces) {
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
    /**
     * Funktionswerte als Pixelstücke: an den (angezeigten) Polstellen getrennt,
     * dort zusätzlich fein abgetastet; sehr große Werte werden am Rand gekappt.
     */
    function sample(f: (x: number) => number, poles: number[], x0: number, x1: number): [number, number][][] {
      const out: [number, number][][] = [];
      if (!(x1 > x0)) return out;
      const r = plot.rect;
      const lim = r.h * 3;
      const span = plot.bounds.xMax - plot.bounds.xMin;
      const cuts = [x0, ...poles.filter((q) => q > x0 && q < x1).sort((u, v) => u - v), x1];
      for (let s = 0; s < cuts.length - 1; s++) {
        let a = cuts[s]!;
        let b = cuts[s + 1]!;
        if (s > 0) a += span * 1e-7;
        if (s < cuts.length - 2) b -= span * 1e-7;
        if (!(b > a)) continue;
        const n = Math.round(clamp(Math.abs(plot.px(b) - plot.px(a)) * 0.9, 12, 1200));
        const xs: number[] = [];
        for (let i = 0; i <= n; i++) xs.push(a + ((b - a) * i) / n);
        for (const q of poles) {
          if (q < a - span * 0.2 || q > b + span * 0.2) continue;
          for (let j = 1; j <= 36; j++) {
            const dx = span * 0.08 * 0.6 ** j;
            if (q - dx > a && q - dx < b) xs.push(q - dx);
            if (q + dx > a && q + dx < b) xs.push(q + dx);
          }
        }
        xs.sort((u, v) => u - v);
        const pts: [number, number][] = [];
        for (const x of xs) {
          const y = f(x);
          pts.push([plot.px(x), Number.isFinite(y) ? clamp(plot.py(y), r.y - lim, r.y + r.h + lim) : NaN]);
        }
        out.push(pts);
      }
      return out;
    }
    /** Wert der angezeigten Funktion (ohne Prüfung auf Definitionslücken). */
    function evalShown(f: Rational, x: number): number {
      let y = f.a;
      for (const z of f.zeros) y *= x - z;
      for (const q of f.poles) y /= x - q;
      return y;
    }

    function card(r: Rect, accent?: string, dashed = false): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      if (accent) {
        const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + Math.min(80, r.h));
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.13 : 0.075));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.save();
      g.strokeStyle = dashed && accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      if (dashed) g.setLineDash([5, 4]);
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
      g.restore();
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
      g.font = `750 ${tsz}px ${th().font}`;
      if (right && g.measureText(title).width > R.w - 2 * pad - 15 - wOf(right, fs(12, 11)) - 12) right = undefined;
      const room0 = R.w - 2 * pad - 15 - (right ? wOf(right, fs(12, 11)) + 12 : 0);
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
    /** Gestalteter Platzhalter für verdeckte Ergebnisse: gestrichelte Pille mit „?“. */
    function phBox(labelSrc: string, size: number, w = 58): FormulaBox {
      const g = surface.g;
      const lb = labelSrc ? formula(g, labelSrc, fstyle(size, th().text, 600)) : null;
      const h = size * 1.35;
      const gap = lb ? 6 : 0;
      return {
        w: (lb?.w ?? 0) + gap + w,
        asc: Math.max(lb?.asc ?? 0, h * 0.72),
        desc: Math.max(lb?.desc ?? 0, h * 0.34),
        draw(g2, x, y) {
          if (lb) lb.draw(g2, x, y);
          const x0 = x + (lb?.w ?? 0) + gap;
          const top = y - h * 0.72;
          g2.save();
          g2.fillStyle = withAlpha(th().muted, th().dark ? 0.12 : 0.08);
          roundRect(g2, x0, top, w, h + 1, h / 2);
          g2.fill();
          g2.strokeStyle = withAlpha(th().muted, 0.6);
          g2.lineWidth = 1.1;
          g2.setLineDash([3, 3]);
          roundRect(g2, x0 + 0.5, top + 0.5, w - 1, h, h / 2);
          g2.stroke();
          g2.setLineDash([]);
          g2.font = `800 ${size}px ${th().font}`;
          g2.fillStyle = th().muted;
          g2.textAlign = 'center';
          g2.textBaseline = 'middle';
          g2.fillText('?', x0 + w / 2, top + h / 2 + 1);
          g2.restore();
        },
      };
    }
    /** Mehrere Kästen nebeneinander. */
    function hcat(boxes: FormulaBox[], gap = 0): FormulaBox {
      let w = 0;
      let asc = 0;
      let desc = 0;
      boxes.forEach((b, i) => {
        w += b.w + (i ? gap : 0);
        asc = Math.max(asc, b.asc);
        desc = Math.max(desc, b.desc);
      });
      return {
        w,
        asc,
        desc,
        draw(g, x, y) {
          let cx = x;
          boxes.forEach((b, i) => {
            if (i) cx += gap;
            b.draw(g, cx, y);
            cx += b.w;
          });
        },
      };
    }

    /* ---------- Bruch aus Faktoren (mit Durchstreichen beim Kürzen) ---------- */
    interface Piece {
      src: string;
      color: string;
      /** Index des Nennerfaktors, mit dem sich dieser Faktor kürzt */
      cut?: number;
    }
    function piecesFor(f: Rational, withCut: boolean): { num: Piece[]; den: Piece[] } {
      const cutZ = new Map<number, number>();
      const cutP = new Map<number, number>();
      if (withCut) for (const q of pairs) {
        cutZ.set(q.zi, q.pi);
        cutP.set(q.pi, q.pi);
      }
      const involved = (x: number) => withCut && pairs.some((q) => Math.abs(q.x - x) < 1e-9);
      const build = (xs: readonly number[], color: string, cuts: Map<number, number>): Piece[] => {
        const out: Piece[] = [];
        const done = new Set<number>();
        xs.forEach((x, i) => {
          if (done.has(i)) return;
          if (involved(x)) {
            out.push({ src: linSrc(x), color, cut: cuts.get(i) });
            return;
          }
          // gleiche Faktoren als Potenz zusammenfassen
          let m = 0;
          xs.forEach((y, j) => {
            if (!done.has(j) && Math.abs(y - x) < 1e-9 && !involved(y)) {
              done.add(j);
              m++;
            }
          });
          out.push({ src: linSrc(x, m), color });
        });
        return out;
      };
      return { num: build(f.zeros, col.z(), cutZ), den: build(f.poles, col.p(), cutP) };
    }
    /** Vorfaktor a („“, „−“ oder „0,5 · “); ohne Linearfaktoren die Zahl selbst. */
    function leadSrc(a: number, hasFactors: boolean): string {
      if (!hasFactors) return N(a, 2);
      if (Math.abs(a - 1) < 1e-12) return '';
      if (Math.abs(a + 1) < 1e-12) return '−';
      return `${N(a, 2)} · `;
    }
    /**
     * Bruch mit einzeln gesetzten Faktoren. Gekürzte Faktoren (cut) werden
     * hervorgehoben und mit einem wachsenden Strich durchgestrichen (CX gleitet).
     */
    function fracBox(lead: string, num: Piece[], den: Piece[], size: number): FormulaBox {
      const g = surface.g;
      const inner = size * 0.92;
      const sep = inner * 0.12;
      const mk = (ps: Piece[], withLead: boolean) => {
        const items: { box: FormulaBox; piece: Piece | null }[] = [];
        const single = ps.length === 1 && !(withLead && lead);
        if (withLead && lead) items.push({ box: formula(g, lead, fstyle(inner, th().text, 650)), piece: null });
        ps.forEach((pc) => {
          // einzelner Faktor ohne Klammer: x − 2 statt (x − 2)
          const src = single && pc.cut === undefined ? pc.src.replace(/^\((x [−+] [^)]*)\)$/, '$1') : pc.src;
          items.push({ box: formula(g, src, fstyle(inner, pc.color, 650)), piece: pc });
        });
        if (!items.length) items.push({ box: formula(g, '1', fstyle(inner, th().text, 650)), piece: null });
        const w = items.reduce((s, it, i) => s + it.box.w + (i ? sep : 0), 0);
        const asc = Math.max(...items.map((it) => it.box.asc));
        const desc = Math.max(...items.map((it) => it.box.desc));
        return { items, w, asc, desc };
      };
      const n = mk(num, true);
      const d = mk(den, false);
      const axis = size * 0.3;
      const gap = size * 0.2;
      const bar = Math.max(1.2, size * 0.075);
      const W = Math.max(n.w, d.w) + size * 0.5;
      return {
        w: W + size * 0.2,
        asc: axis + gap + n.desc + n.asc + 2,
        desc: Math.max(0, gap + d.asc + d.desc - axis) + 2,
        draw(g2, x, y) {
          const row = (r: typeof n, base: number) => {
            let cx = x + size * 0.1 + (W - r.w) / 2;
            r.items.forEach((it, i) => {
              if (i) cx += sep;
              const t = it.piece?.cut !== undefined ? CX[it.piece.cut]!.v : 0;
              if (t > 0.01) {
                // Hervorhebung und Strich
                g2.save();
                g2.fillStyle = withAlpha(col.h(), (th().dark ? 0.24 : 0.16) * clamp01(t * 2));
                roundRect(g2, cx - 3, base - it.box.asc - 2, it.box.w + 6, it.box.asc + it.box.desc + 4, 6);
                g2.fill();
                g2.restore();
              }
              g2.save();
              g2.globalAlpha *= 1 - 0.5 * clamp01(t * 1.4 - 0.4);
              it.box.draw(g2, cx, base);
              g2.restore();
              if (t > 0.01) {
                const s = ease.inOutCubic(clamp01(t * 1.5 - 0.25));
                if (s > 0) {
                  const x0 = cx - 1;
                  const y0 = base + it.box.desc * 0.4;
                  const x1 = cx + it.box.w + 1;
                  const y1 = base - it.box.asc * 0.85;
                  g2.save();
                  g2.strokeStyle = col.h();
                  g2.lineWidth = Math.max(1.6, size * 0.11);
                  g2.lineCap = 'round';
                  g2.beginPath();
                  g2.moveTo(x0, y0);
                  g2.lineTo(lerp(x0, x1, s), lerp(y0, y1, s));
                  g2.stroke();
                  g2.restore();
                }
              }
              cx += it.box.w;
            });
          };
          row(n, y - axis - gap - n.desc);
          row(d, y - axis + gap + d.asc);
          g2.fillStyle = th().text;
          g2.fillRect(x + size * 0.1, y - axis - bar / 2, W, bar);
        },
      };
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
      if (t > 3300) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 150) / 1400)),
        t,
        labels: ease.outCubic(clamp01((t - 1700) / 600)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1600),
      };
    }
    /** Pop-Faktor einer Perle bzw. eines Rings beim Einstieg. */
    const popIntro = (k: Intro, order: number) => (k.t > 1e8 ? 1 : ease.outBack(clamp01((k.t - 800 - order * 150) / 480)));
    const infoShown = () => kInfo.v >= 0.5;
    const infoAlpha = () => Math.abs(2 * kInfo.v - 1);

    /* =====================================================================
     * Hauptbild
     * ===================================================================== */
    interface Mark {
      /** beteiligte Indizes (Zähler bzw. Nenner) */
      idx: number[];
      x: number;
      px: number;
      py: number;
    }
    /** Perlen (Zähler) bzw. Ringe (Nenner), die (fast) übereinander liegen, zusammenfassen. */
    function marks(kind: 'z' | 'p'): Mark[] {
      const S = kind === 'z' ? SZ : SP;
      const V = kind === 'z' ? ZV : PV;
      const act = [0, 1, 2].filter((i) => V[i]!.v > 0.02).sort((u, v) => S[u]!.v - S[v]!.v || u - v);
      const r = plot.rect;
      const y0 = clamp(plot.py(0), r.y + 2, r.y + r.h - 2);
      const out: Mark[] = [];
      for (const i of act) {
        const px = plot.px(S[i]!.v);
        const last = out[out.length - 1];
        if (last && Math.abs(last.px - px) < 2.5) last.idx.push(i);
        else out.push({ idx: [i], x: S[i]!.v, px, py: y0 });
      }
      return out;
    }
    const beadR = () => fs(8, 7.5);
    const ringR = (k = 1) => fs(12.5, 11.5) + 3.6 * (k - 1);
    /** Stelle einer Lücke zu einem gekürzten Nennerfaktor j (y aus der gekürzten Funktion). */
    const holeY = (x: number) => {
      const h = A.holes.find((q) => Math.abs(q.x - x) < 1e-9);
      return h ? h.y : reducedValue(F, x);
    };

    /** Vorzeichenstreifen an der x-Achse. */
    function drawSignStrip(sf: Rational, alpha: number): void {
      if (alpha <= 0.01 || Math.abs(sf.a) < 1e-9) return;
      const g = surface.g;
      const r = plot.rect;
      const b = plot.bounds;
      const y0 = plot.py(0);
      if (y0 < r.y + 10 || y0 > r.y + r.h - 10) return;
      const cuts = [b.xMin, ...[...sf.zeros, ...sf.poles].filter((x) => x > b.xMin && x < b.xMax).sort((u, v) => u - v), b.xMax];
      g.save();
      g.globalAlpha *= alpha;
      for (let i = 0; i < cuts.length - 1; i++) {
        const xa = plot.px(cuts[i]!);
        const xb = plot.px(cuts[i + 1]!);
        if (xb - xa < 6) continue;
        const sg = Math.sign(evalShown(sf, (cuts[i]! + cuts[i + 1]!) / 2));
        if (!sg) continue;
        const c = sg > 0 ? col.pos() : col.neg();
        const grad = g.createLinearGradient(0, y0 - 7, 0, y0 + 7);
        grad.addColorStop(sg > 0 ? 0 : 1, withAlpha(c, th().dark ? 0.75 : 0.6));
        grad.addColorStop(sg > 0 ? 1 : 0, withAlpha(c, th().dark ? 0.35 : 0.25));
        g.fillStyle = grad;
        roundRect(g, xa + 4, sg > 0 ? y0 - 7 : y0 + 1.5, xb - xa - 8, 5.5, 2.75);
        g.fill();
        if (xb - xa > 34) {
          g.font = `800 ${fs(13, 12)}px ${th().font}`;
          g.fillStyle = c;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(sg > 0 ? '+' : '−', (xa + xb) / 2, sg > 0 ? y0 - 16 : y0 + 31);
        }
      }
      g.restore();
    }

    /** Asymptote bzw. Näherungskurve (gestrichelt). */
    function drawAsymCurve(an: Analysis, alpha: number): void {
      if (alpha <= 0.01) return;
      const b = plot.bounds;
      const pts = sample((x) => evalPoly(an.asym, x), [], b.xMin, b.xMax);
      strokePts(pts, col.s(), 2.3, { dash: [9, 6], alpha });
    }
    /** Beschriftung der Asymptote am rechten Rand (dort, wo die Kurve im Bild ist). */
    function labelAsym(an: Analysis, alpha: number): void {
      if (alpha <= 0.01) return;
      const r = plot.rect;
      const b = plot.bounds;
      let xs = b.xMax - (b.xMax - b.xMin) * 0.04;
      for (let k = 0; k < 80; k++) {
        const py = plot.py(evalPoly(an.asym, xs));
        if (py > r.y + 26 && py < r.y + r.h - 26) break;
        xs -= (b.xMax - b.xMin) / 100;
      }
      const px = plot.px(xs);
      const py = plot.py(evalPoly(an.asym, xs));
      if (!(py > r.y && py < r.y + r.h)) return;
      const long = A.kind === 'curve' ? `\\c{s}{\\t{${T2('Näherungskurve', 'approximating curve')}}  ${asymSrc(an)}}` : `\\c{s}{${asymSrc(an)}}`;
      const src = infoShown() ? (wOf(long, fs(12.5, 11.5)) < r.w * 0.55 ? long : `\\c{s}{${asymSrc(an)}}`) : '\\c{s}{y = ?}';
      const slope = (plot.py(evalPoly(an.asym, xs + 0.01)) - py) / Math.max(1e-9, plot.px(xs + 0.01) - px);
      const off = 18 + Math.min(30, Math.abs(slope) * 22);
      fpillFree(
        [
          { x: px, y: py - off, align: 'right' },
          { x: px, y: py + off, align: 'right' },
          { x: px - 70, y: py - off - 22, align: 'right' },
          { x: px - 70, y: py + off + 22, align: 'right' },
        ],
        src,
        { size: fs(12.5, 11.5), alpha: alpha * infoAlpha(), bounds: r, border: withAlpha(col.s(), 0.55) },
      );
    }

    /** Senkrechte Asymptoten an den Polstellen (schrumpfen beim Kürzen zum Loch). */
    function drawPoleLines(k: Intro): void {
      const g = surface.g;
      const r = plot.rect;
      const aAsy = kAsy.v * k.panel;
      for (const m of marks('p')) {
        const S = Math.max(...m.idx.map((j) => PS[j]!.v * PV[j]!.v));
        if (S <= 0.01 || aAsy <= 0.01) continue;
        const px = plot.px(m.x);
        const cancelled = m.idx.some((j) => isCancelled(j));
        const yc = cancelled ? clamp(plot.py(holeY(pGoal(m.idx[0]!))), r.y, r.y + r.h) : r.y + r.h / 2;
        const top = lerp(yc, r.y, S);
        const bot = lerp(yc, r.y + r.h, S);
        g.save();
        g.globalAlpha *= aAsy * Math.min(1, S * 3);
        g.strokeStyle = col.p();
        g.lineWidth = 2;
        g.setLineDash([7, 5]);
        g.beginPath();
        g.moveTo(Math.round(px) + 0.5, top);
        g.lineTo(Math.round(px) + 0.5, bot);
        g.stroke();
        g.restore();
        placed.push({ x: px - 3, y: top, w: 6, h: bot - top });
      }
    }
    /** Pfeile links und rechts der Polstelle: f(x) → +∞ bzw. −∞. */
    function drawPoleArrows(k: Intro): void {
      const r = plot.rect;
      const g = surface.g;
      const a = kAsy.v * k.labels * infoAlpha() * (infoShown() ? 1 : 0) * clamp01(1 - FAR.v * 3);
      if (a <= 0.01 || p.a === 0) return;
      const ps = A.poles;
      for (const q of ps) {
        const S = Math.max(0, ...[0, 1, 2].filter((j) => j < p.pn && Math.abs(pGoal(j) - q.x) < 1e-9).map((j) => PS[j]!.v));
        if (S < 0.5) continue;
        const px = plot.px(q.x);
        if (px < r.x + 8 || px > r.x + r.w - 8) continue;
        const sides = poleSides(F, q.x);
        const near = ps.filter((o) => o !== q).map((o) => Math.abs(plot.px(o.x) - px));
        const room = near.length ? Math.min(...near) : 999;
        for (const side of [-1, 1] as const) {
          const sg = side < 0 ? sides.left : sides.right;
          if (!sg) continue;
          const ax = px + side * 11;
          const yEnd = sg > 0 ? r.y + r.h * 0.1 + 6 : r.y + r.h * 0.9 - 6;
          const yStart = yEnd + (sg > 0 ? 34 : -34);
          const c = sg > 0 ? col.pos() : col.neg();
          g.save();
          g.globalAlpha *= a * clamp01((S - 0.5) * 2);
          g.strokeStyle = th().bg;
          g.lineWidth = 6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(ax, yStart);
          g.lineTo(ax, yEnd + (sg > 0 ? 4 : -4));
          g.stroke();
          arrowPx(ax, yStart, ax, yEnd, c, 2.6, 9);
          if (room > 70) {
            g.font = `800 ${fs(12, 11)}px ${th().font}`;
            g.fillStyle = c;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(sg > 0 ? '+∞' : '−∞', ax + side * 3, yEnd + (sg > 0 ? -10 : 10));
          }
          g.restore();
          placed.push({ x: ax - 14, y: Math.min(yStart, yEnd) - 18, w: 28, h: 70 });
        }
      }
    }
    /** Beschriftung der Polstellen (x = p) am unteren Rand. */
    function labelPoles(k: Intro): void {
      const r = plot.rect;
      const a = kAsy.v * k.labels * clamp01(1 - FAR.v * 3);
      if (a <= 0.01 || p.a === 0) return;
      for (const q of A.poles) {
        const px = plot.px(q.x);
        if (px < r.x || px > r.x + r.w) continue;
        const src = infoShown() ? `\\c{p}{x = ${N(q.x, 2)}}` : '\\c{p}{x = ?}';
        const y = r.y + r.h - 22;
        fpillFree(
          [
            { x: px + 9, y, align: 'left' },
            { x: px - 9, y, align: 'right' },
            { x: px + 9, y: r.y + 20, align: 'left' },
            { x: px - 9, y: r.y + 20, align: 'right' },
            { x: px + 9, y: y - 30, align: 'left' },
            { x: px - 9, y: y - 30, align: 'right' },
          ],
          src,
          { size: fs(12, 11), alpha: a * infoAlpha(), bounds: r, border: withAlpha(col.p(), 0.55) },
        );
      }
    }

    /** Graph der angezeigten Funktion (und beim Strukturwechsel der alte, ausblendend). */
    function drawGraph(now: number, k: Intro, sf: Rational): void {
      const b = plot.bounds;
      if (prevShape) {
        const t = clamp01((now - prevShape.t0) / 560);
        const pf = prevShape.f;
        strokePts(sample((x) => evalShown(pf, x), [...pf.poles], b.xMin, b.xMax), col.f(), fs(3.4, 3), { alpha: 1 - t });
        if (kAsy.v > 0.01 && Math.abs(pf.a) > 1e-9 && !prevShape.an.exact) drawAsymCurve(prevShape.an, (1 - t) * kAsy.v * 0.8);
      }
      let rv = k.reveal;
      let ga = 1;
      if (graphIn !== null) {
        const t = clamp01((now - graphIn) / 900);
        rv = Math.min(rv, 0.2 + 0.8 * ease.inOutCubic(t));
        ga = ease.outCubic(t);
      }
      const xr = lerp(b.xMin, b.xMax, rv);
      const pcs = sample((x) => evalShown(sf, x), [...sf.poles], b.xMin, xr);
      strokePts(pcs, col.f(), fs(3.4, 3), { glow: true, alpha: ga });
      // Beschriftungen sollen dem Graphen ausweichen
      const r = plot.rect;
      for (const pts of pcs) {
        let lx = -1e9;
        let ly = -1e9;
        for (const [x, y] of pts) {
          if (!Number.isFinite(y) || y < r.y || y > r.y + r.h) continue;
          if (Math.hypot(x - lx, y - ly) < 9) continue;
          lx = x;
          ly = y;
          placed.push({ x: x - 5, y: y - 5, w: 10, h: 10 });
        }
      }
    }

    /** Löcher (behebbare Lücken) als Ringe auf dem Graphen. */
    function drawHoles(now: number, k: Intro): void {
      const r = plot.rect;
      for (const h of A.holes) {
        let al = p.a === 0 ? 1 : 0;
        for (let j = 0; j < p.pn; j++) if (isCancelled(j) && Math.abs(pGoal(j) - h.x) < 1e-9) al = Math.max(al, HV[j]!.v);
        al *= k.panel;
        if (al <= 0.01) continue;
        const px = plot.px(h.x);
        const py = plot.py(h.y);
        if (py < r.y - 10 || py > r.y + r.h + 10) continue;
        const fresh = pops.find((q) => Math.abs(q.x - h.x) < 1e-9);
        const pulse = fresh && !reduced() ? clamp01(1 - (now - fresh.t0) / 1400) : 0;
        halo(px, py, col.h(), 22 + 10 * pulse, 0.5 + 0.5 * pulse);
        const s = ease.outBack(clamp01(al));
        dot(px, py, col.f(), fs(6.5, 6) * Math.max(0.2, s), clamp01(al * 1.4), true);
        placed.push({ x: px - 10, y: py - 10, w: 20, h: 20 });
        if (k.labels > 0.01) {
          const src = infoShown() ? `\\c{h}{\\t{${T2('Lücke', 'gap')}} (${N(h.x, 2)} | ${N(h.y, 2)})}` : `\\c{h}{\\t{${T2('Lücke', 'gap')}} (? | ?)}`;
          fpillFree(
            [
              { x: px + 14, y: py - 22, align: 'left' },
              { x: px - 14, y: py - 22, align: 'right' },
              { x: px + 14, y: py + 24, align: 'left' },
              { x: px - 14, y: py + 24, align: 'right' },
            ],
            src,
            { size: fs(12, 11), alpha: al * k.labels * infoAlpha() * clamp01(1 - FAR.v * 3), bounds: r, border: withAlpha(col.h(), 0.6) },
          );
        }
      }
    }

    /** Schnittpunkte des Graphen mit der Asymptote. */
    function drawCrossings(k: Intro): void {
      const a = kAsy.v * k.labels * clamp01(1 - FAR.v * 3) * (infoShown() ? infoAlpha() : 0);
      if (a <= 0.01 || !crossings.length) return;
      const r = plot.rect;
      for (const c of crossings) {
        const px = plot.px(c.x);
        const py = plot.py(c.y);
        if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) continue;
        halo(px, py, col.s(), 18, a * 0.8);
        dot(px, py, col.s(), fs(5.5, 5), a, true);
        placed.push({ x: px - 9, y: py - 9, w: 18, h: 18 });
        fpillFree(
          [
            { x: px + 12, y: py - 24, align: 'left' },
            { x: px - 12, y: py - 24, align: 'right' },
            { x: px + 12, y: py + 26, align: 'left' },
            { x: px - 12, y: py + 26, align: 'right' },
            { x: px + 12, y: py - 52, align: 'left' },
            { x: px - 12, y: py + 54, align: 'right' },
          ],
          `\\c{s}{\\t{${T2('schneidet die Asymptote', 'crosses the asymptote')}}}`,
          { size: fs(11.5, 11), alpha: a, bounds: r, border: withAlpha(col.s(), 0.5) },
        );
      }
    }

    /** Pol-Ringe und Perlen auf der x-Achse. */
    function drawMarks(now: number, k: Intro): void {
      const g = surface.g;
      const far = FAR.v;
      const hz = hover?.id?.startsWith('z') ? Number(hover.id.slice(1)) : drag && drag.kind === 'z' ? drag.i : -1;
      const hp = hover?.id?.startsWith('p') ? Number(hover.id.slice(1)) : drag && drag.kind === 'p' ? drag.i : -1;
      const shrink = 1 - 0.4 * far;
      // Ringe (Nenner)
      marks('p').forEach((m, order) => {
        const vis = Math.min(1, ...m.idx.map((j) => PV[j]!.v));
        const s = popIntro(k, order) * shrink * (0.4 + 0.6 * vis);
        const hl = m.idx.includes(hp);
        const R0 = ringR() * s * (hl ? 1.1 : 1);
        g.save();
        g.globalAlpha *= clamp01(vis * 1.5) * k.panel;
        if (hl) halo(m.px, m.py, col.p(), R0 * 2.6, 0.9);
        const cut = m.idx.some((j) => isCancelled(j));
        const cutA = Math.max(0, ...m.idx.map((j) => CX[j]!.v));
        if (cutA > 0.01) halo(m.px, m.py, col.h(), R0 * 2.2, cutA * 0.8);
        // Füllung und Kreuz
        g.fillStyle = withAlpha(col.p(), th().dark ? 0.16 : 0.1);
        g.beginPath();
        g.arc(m.px, m.py, R0, 0, TAU);
        g.fill();
        if (!cut) {
          g.strokeStyle = withAlpha(col.p(), 0.85);
          g.lineWidth = 2;
          g.lineCap = 'round';
          const c = R0 * 0.38;
          g.beginPath();
          g.moveTo(m.px - c, m.py - c);
          g.lineTo(m.px + c, m.py + c);
          g.moveTo(m.px + c, m.py - c);
          g.lineTo(m.px - c, m.py + c);
          g.stroke();
        }
        m.idx.forEach((_, q) => {
          const rr = R0 + q * 3.8 * s;
          g.strokeStyle = th().bg;
          g.lineWidth = 4.6 * s;
          g.beginPath();
          g.arc(m.px, m.py, rr, 0, TAU);
          g.stroke();
          g.strokeStyle = cutA > 0.5 && q === 0 ? mixColor(col.p(), col.h(), 0.5) : col.p();
          g.lineWidth = 2.5 * s;
          g.beginPath();
          g.arc(m.px, m.py, rr, 0, TAU);
          g.stroke();
        });
        g.restore();
        const rr = R0 + (m.idx.length - 1) * 3.8 + 4;
        placed.push({ x: m.px - rr, y: m.py - rr, w: 2 * rr, h: 2 * rr });
      });
      // Perlen (Zähler)
      marks('z').forEach((m, order) => {
        const vis = Math.min(1, ...m.idx.map((i) => ZV[i]!.v));
        const s = popIntro(k, order + 1) * shrink * (0.3 + 0.7 * vis);
        const hl = m.idx.includes(hz);
        const rc = beadR() * s * (hl ? 1.14 : 1);
        const allCut = m.idx.every((i) => zeroCancelled(i));
        g.save();
        g.globalAlpha *= clamp01(vis * 1.5) * k.panel;
        if (hl) halo(m.px, m.py, col.z(), rc * 3.2, 0.9);
        // weitere Ringe für zusammenfallende Nullstellen
        m.idx.slice(1).forEach((_, q) => {
          const rr = rc + 3.6 * s * (q + 1);
          g.strokeStyle = th().bg;
          g.lineWidth = 4.2 * s;
          g.beginPath();
          g.arc(m.px, m.py, rr, 0, TAU);
          g.stroke();
          g.strokeStyle = col.z();
          g.lineWidth = 2.1 * s;
          g.beginPath();
          g.arc(m.px, m.py, rr, 0, TAU);
          g.stroke();
        });
        dot(m.px, m.py, col.z(), rc, allCut ? 0.75 : 1);
        g.restore();
        const rr = rc + 3.6 * (m.idx.length - 1) + 3;
        placed.push({ x: m.px - rr, y: m.py - rr, w: 2 * rr, h: 2 * rr });
      });
      void now;
    }
    /** Beschriftung der Nullstellen unter der Achse. */
    function labelZeros(k: Intro): void {
      const r = plot.rect;
      const a = k.labels * clamp01(1 - FAR.v * 4) * infoAlpha();
      if (a <= 0.01 || p.a === 0 || !infoShown()) return;
      const y0 = clamp(plot.py(0), r.y, r.y + r.h);
      for (const z of A.zeros) {
        const px = plot.px(z.x);
        const src = `\\c{z}{${N(z.x, 2)}}${z.k > 1 ? `  \\c{m}{\\t{${orderName(z.k)}}}` : ''}`;
        const sl = Math.sign(reducedValue(F, z.x - 0.05));
        const below = sl >= 0;
        fpillFree(
          [
            { x: px, y: y0 + (below ? 27 : -27), align: 'center' },
            { x: px, y: y0 + (below ? -27 : 27), align: 'center' },
            { x: px, y: y0 + (below ? 52 : -52), align: 'center' },
          ],
          src,
          { size: fs(12, 11), alpha: a, bounds: r, border: withAlpha(col.z(), 0.5) },
        );
      }
    }

    /** Kurze Meldungen beim Kürzen bzw. wenn ein Pol wieder entsteht. */
    function drawPops(now: number): void {
      const r = plot.rect;
      pops = pops.filter((q) => now - q.t0 < 2600);
      for (const q of pops) {
        const t = (now - q.t0) / 2600;
        const a = clamp01(t * 6) * clamp01((1 - t) * 3) * clamp01(1 - FAR.v * 3);
        const px = plot.px(q.x);
        const py = clamp(plot.py(q.y), r.y + 60, r.y + r.h - 40);
        fpill(px, py - 52 - 12 * ease.outCubic(clamp01(t * 3)), q.src, { size: fs(12.5, 11.5), alpha: a, bounds: r, border: withAlpha(q.color, 0.7) });
      }
    }

    /** Punkt läuft am Graphen entlang; Maßpfeil zur Asymptote. */
    function drawRun(now: number): void {
      if (runT0 === null) return;
      const u = reduced() ? (now - runT0 < 3000 ? 0.82 : 1) : (now - runT0) / RUN_MS;
      if (u >= 1) {
        runT0 = null;
        return;
      }
      const g = surface.g;
      const r = plot.rect;
      const b = plot.bounds;
      const span = b.xMax - b.xMin;
      const x = lerp(b.xMin + span * 0.012, b.xMax - span * 0.012, u);
      const y = value(F, x);
      if (!Number.isFinite(y)) return;
      const fadeIn = clamp01(u * 25) * clamp01((1 - u) * 25);
      const px = plot.px(x);
      const raw = plot.py(y);
      const inside = raw > r.y + 4 && raw < r.y + r.h - 4;
      const py = clamp(raw, r.y + 10, r.y + r.h - 10);
      const showDev = kAsy.v > 0.5 && infoShown() && p.a !== 0 && !A.exact;
      const ys = evalPoly(A.kind === 'zero' ? [0] : A.asym, x);
      const pys = plot.py(ys);
      g.save();
      g.globalAlpha *= fadeIn;
      if (inside && showDev && Math.abs(pys - raw) > 4 && pys > r.y - 2 && pys < r.y + r.h + 2) {
        g.save();
        g.strokeStyle = th().bg;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(px, pys);
        g.lineTo(px, py);
        g.stroke();
        g.restore();
        arrowPx(px, pys, px, py, col.P(), 2.2, Math.min(8, Math.abs(pys - py) * 0.4), true);
      }
      if (inside) {
        halo(px, py, col.P(), 22, 0.8);
        dot(px, py, col.P(), fs(7, 6.5), 1);
      } else {
        // außerhalb des Bildes: Marke am Rand
        const up = raw <= r.y + 4;
        g.fillStyle = col.P();
        g.beginPath();
        g.moveTo(px, up ? r.y + 3 : r.y + r.h - 3);
        g.lineTo(px - 7, up ? r.y + 15 : r.y + r.h - 15);
        g.lineTo(px + 7, up ? r.y + 15 : r.y + r.h - 15);
        g.closePath();
        g.fill();
      }
      g.restore();
      placed.push({ x: px - 12, y: py - 12, w: 24, h: 24 });
      const right = px < r.x + r.w * 0.6;
      const al = right ? 'left' : 'right';
      const dx = right ? 14 : -14;
      const yy = inside ? py : py + (raw <= r.y + 4 ? 26 : -26);
      fpillFree(
        [
          { x: px + dx, y: yy - 22, align: al },
          { x: px + dx, y: yy + 22, align: al },
          { x: px - dx, y: yy - 22, align: right ? 'right' : 'left' },
        ],
        `\\c{P}{x = ${N(x, 1)}:  f(x) ${eqS(y, 2)} ${big(y, 2)}}`,
        { size: fs(12.5, 11.5), alpha: fadeIn, bounds: r, border: withAlpha(col.P(), 0.6) },
      );
      if (showDev && inside) {
        const d = deviation(A, x);
        fpillFree(
          [
            { x: px + dx, y: (py + clamp(pys, r.y, r.y + r.h)) / 2, align: al },
            { x: px + dx, y: yy + 48, align: al },
            { x: px + dx, y: yy - 48, align: al },
          ],
          `\\c{s}{f(x) − s(x) ${eqS(d, 2)} ${big(d, 2)}}`,
          { size: fs(12, 11), alpha: fadeIn, bounds: r, border: withAlpha(col.s(), 0.5) },
        );
      }
    }

    /** Wert ablesen unter dem Mauszeiger (bzw. Finger). */
    function drawHover(k: Intro): void {
      const hb = (hover?.id === 'plot' && !drag) || drag?.kind === 'look' ? hover : null;
      if (!hb || k.t < 1e8 || runT0 !== null) return;
      const g = surface.g;
      const r = plot.rect;
      const [wx] = plot.toWorld(hb.px, hb.py);
      const stepX = FAR.v > 0.5 ? 1 : 0.1;
      const x = Math.round(wx / stepX) * stepX;
      const y = value(F, x);
      const px = plot.px(x);
      g.save();
      g.strokeStyle = withAlpha(th().text, 0.35);
      g.lineWidth = 1;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(Math.round(px) + 0.5, r.y);
      g.lineTo(Math.round(px) + 0.5, r.y + r.h);
      g.stroke();
      g.restore();
      const py = plot.py(y);
      if (Number.isFinite(y) && py >= r.y && py <= r.y + r.h) dot(px, py, col.f(), 5, 1);
      const src = Number.isFinite(y) ? `\\c{f}{f(${N(x, 1)}) ${eqS(y, 3)} ${big(y, 3)}}` : `\\c{p}{f(${N(x, 1)}) \\t{${T2('nicht definiert', 'undefined')}}}`;
      const right = px < r.x + r.w * 0.6;
      fpill(px + (right ? 12 : -12), clamp(Number.isFinite(py) ? py : r.y + r.h / 2, r.y + 30, r.y + r.h - 18) - 22, src, { align: right ? 'left' : 'right', size: fs(12, 11), bounds: r, border: withAlpha(col.f(), 0.5) });
    }

    /** Legende und Vergleichswert in der Fernansicht. */
    function drawFar(): void {
      const far = FAR.v;
      if (far <= 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const b = plot.bounds;
      const sz = fs(12, 11);
      const tBox = formula(g, `\\t{${T2('Blick aus der Ferne', 'View from afar')} (× ${FAR_ZOOM})}`, fstyle(sz, th().muted, 700));
      const fBox = formula(g, '\\c{f}{f(x)}', fstyle(sz, th().text, 700));
      const showA = p.a !== 0 && !A.exact && kAsy.v > 0.5;
      const lBox = formula(g, infoShown() ? `\\c{s}{${asymSrc()}}` : '\\c{s}{y = ?}', fstyle(sz, th().text, 700));
      const sw = 22;
      let w = 10 + fBox.w + 8 + sw + (showA ? 14 + lBox.w + 8 + sw : 0) + 10;
      const withTitle = w + tBox.w + 14 <= r.w - 24;
      if (withTitle) w += tBox.w + 14;
      const asc = Math.max(tBox.asc, fBox.asc, lBox.asc);
      const desc = Math.max(tBox.desc, fBox.desc, lBox.desc);
      const h = asc + desc + 12;
      const x0 = r.x + 12;
      const y0 = r.y + 8;
      g.save();
      g.globalAlpha *= far;
      g.save();
      g.fillStyle = th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)';
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
      if (showA) {
        g.strokeStyle = col.s();
        g.lineWidth = 2.4;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(x, mid);
        g.lineTo(x + sw, mid);
        g.stroke();
        g.setLineDash([]);
        x += sw + 8;
        lBox.draw(g, x, base);
      }
      g.restore();
      placed.push({ x: x0, y: y0, w, h });
      // Abweichung bei x = 40
      if (showA && b.xMax > FAR_X * 1.02) {
        const px = plot.px(FAR_X);
        const y = value(F, FAR_X);
        g.save();
        g.globalAlpha *= far;
        g.strokeStyle = withAlpha(th().text, 0.4);
        g.setLineDash([3, 4]);
        g.lineWidth = 1.1;
        g.beginPath();
        g.moveTo(Math.round(px) + 0.5, r.y + 44);
        g.lineTo(Math.round(px) + 0.5, r.y + r.h);
        g.stroke();
        g.restore();
        dot(px, plot.py(y), col.f(), 5, far);
        const d = deviation(A, FAR_X);
        const src = infoShown() ? `f(${FAR_X}) − s(${FAR_X}) ${eqS(d, 3)} ${N(cnt('dev40', d), 3)}  \\c{m}{→ 0}` : `f(${FAR_X}) − s(${FAR_X}) ≈ ?`;
        fpill(r.x + r.w - 12, r.y + h + 30, src, { align: 'right', size: fs(12, 11), alpha: far, bounds: r, border: withAlpha(col.s(), 0.5) });
      }
    }

    function drawPlot(now: number, k: Intro): void {
      const V = view();
      plot.setRangePadded(V.x, V.y, PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      placed = [];
      const r = plot.rect;
      const sf = shownF();
      const san = analyze(sf);
      const settledExact = A.exact && Math.abs(sf.a - p.a) < 1e-6;
      // feste Elemente vormerken
      for (const m of [...marks('p'), ...marks('z')]) placed.push({ x: m.px - 14, y: m.py - 14, w: 28, h: 28 });
      drawSignStrip(sf, kSgn.v * kInfo.v * k.labels * (1 - 0.5 * FAR.v));
      const aCurve = kAsy.v * k.panel * (Math.abs(sf.a) > 1e-9 ? 1 : 0) * (settledExact ? 0 : 1);
      const grow = revealT !== null ? ease.inOutCubic(clamp01((now - revealT) / 900)) : 1;
      drawAsymCurve(san, aCurve * Math.min(k.reveal, 1) * Math.max(0, 2 * kInfo.v - 1) * grow);
      drawPoleLines(k);
      drawGraph(now, k, sf);
      drawHoles(now, k);
      drawMarks(now, k);
      drawPoleArrows(k);
      labelPoles(k);
      labelZeros(k);
      labelAsym(san, aCurve * k.labels * clamp01(1 - FAR.v * 3) * (infoShown() ? 1 : 0));
      drawCrossings(k);
      drawPops(now);
      drawRun(now);
      drawHover(k);
      drawFar();
      // a = 0: Nullfunktion
      if (p.a === 0 && k.labels > 0.01) {
        fpill(r.x + r.w / 2, r.y + 22, `\\t{${T2('a = 0: f ist die Nullfunktion – mit Lücken an den Nennernullstellen.', 'a = 0: f is the zero function – with gaps at the zeros of the denominator.')}}`, { size: fs(12, 11), alpha: k.labels, bounds: r, color: th().muted });
      } else if (kInfo.v < 0.5 && k.labels > 0.5) {
        fpill(r.x + r.w / 2, r.y + 18, `\\t{${sm() ? T2('Eigenschaften verdeckt', 'Properties hidden') : T2('Eigenschaften verdeckt – bestimme sie am Term und prüfe am Graphen.', 'Properties hidden – find them from the term, check with the graph.')}}`, {
          size: fs(12, 11),
          alpha: (1 - 2 * kInfo.v) * k.labels,
          bounds: r,
          color: th().muted,
        });
      }
      plot.end();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    /** Karte zeichnen (oder nur ihre Höhe messen); `compact`: kürzere Fassung, wenn der Platz nicht reicht. */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    type RowSpec = { src?: string; box?: FormulaBox; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string, alpha = 1, dashed = false): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src ?? '', maxW, font);
          return { box: null as FormulaBox | null, lines, font, h: lines.length * size * 1.32 };
        }
        const box = r.box ?? fit(r.src ?? '', maxW, size, r.color ?? th().text, r.weight ?? 600, 11);
        return { box, lines: [] as string[], font: '', h: rowH(box) };
      });
      const h = 38 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
      if (measure) return h;
      card(R, accent, dashed);
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
    const noteRow = (txt: string, size = fs(12, 11), color = th().muted): RowSpec => ({ src: txt, text: true, size, color, gap: 6 });

    /** Bruch-Zeile „f(x) = …“ in passender Größe. */
    function fracRow(prefix: string, lead: string, num: Piece[], den: Piece[], maxW: number, size: number, suffix = ''): FormulaBox {
      const g = surface.g;
      let s = size;
      const build = (sz: number) => {
        const parts: FormulaBox[] = [];
        if (prefix) parts.push(formula(g, prefix, fstyle(sz, th().text, 650)));
        parts.push(den.length ? fracBox(lead, num, den, sz) : formula(g, `${lead}${num.map((q) => q.src).join('')}` || '1', fstyle(sz, th().text, 650)));
        if (suffix) parts.push(formula(g, suffix, fstyle(sz * 0.86, th().muted, 600)));
        return hcat(parts, sz * 0.2);
      };
      let box = build(s);
      while (box.w > maxW && s > 11) {
        s -= 0.5;
        box = build(s);
      }
      return box;
    }

    /** Karte 1: Funktionsterm – gegeben (mit Durchstreichen), gekürzt, ausmultipliziert, nach Polynomdivision. */
    function termCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const pad = fs(14, 12);
        const maxW = R.w - 2 * pad - 4;
        const size = fs(16, 14);
        const rows: RowSpec[] = [];
        const pcs = piecesFor(F, true);
        const lead = leadSrc(p.a, pcs.num.length > 0);
        rows.push({ box: fracRow('f(x) =', lead, pcs.num, pcs.den, maxW, size), gap: 9 });
        // gekürzt
        const cut = Math.max(0, ...pairs.map((q) => CX[q.pi]!.v));
        if (pairs.length && p.a !== 0) {
          const zs = F.zeros.filter((_, i) => !zeroCancelled(i));
          const ps = F.poles.filter((_, j) => !isCancelled(j));
          const red = piecesFor({ a: p.a, zeros: zs, poles: ps }, false);
          const hx = [...new Set(pairs.map((q) => N(q.x, 2)))].join('; ');
          const leadR = leadSrc(p.a, red.num.length > 0);
          const box = ps.length
            ? fracRow('=', leadR, red.num, red.den, maxW, size * 0.94, `\\t{${T2('für', 'for')}} x ≠ ${hx}`)
            : fit(`= ${leadR}${red.num.length === 1 && !leadR ? red.num[0]!.src.replace(/^\((x [−+] [^)]*)\)$/, '$1') : red.num.map((q) => q.src).join('')}  \\c{m}{\\t{${T2('für', 'for')}} x ≠ ${hx}}`, maxW, size * 0.94, th().text, 650);
          rows.push({ box, gap: 8, at: clamp01(cut * 1.6 - 0.6), hl: col.h() });
        }
        // ausmultipliziert
        const trivial = p.zn <= 1 && p.pn <= 1 && (Math.abs(p.a - 1) < 1e-12 || p.zn === 0);
        if (!trivial && p.a !== 0) rows.push({ src: `= \\f{${polySrc(A.num)}}{${polySrc(A.den)}}`, size: size * 0.94, gap: 8 });
        // nach Polynomdivision
        if (p.a !== 0 && A.kind !== 'zero') {
          if (infoShown()) {
            if (A.exact) rows.push({ src: `= \\c{s}{${polySrc(A.asym)}}  \\c{m}{\\t{(${T2('Division geht auf', 'no remainder')})}}`, size: size * 0.94, gap: 6 });
            else rows.push({ src: `= \\c{s}{${polySrc(A.asym)}} ${restSrc()}`, size: size * 0.94, gap: 6, hl: col.s() });
          } else rows.push({ box: phBox('=', size * 0.9, 120), gap: 6 });
        }
        if (!infoShown() && !compact) rows.push(noteRow(T2('Kürzen? Polynomdivision? Erst selbst rechnen, dann „Eigenschaften aufdecken“.', 'Cancel? Polynomial division? Work it out first, then “Reveal the properties”.'), fs(12, 11)));
        const right = `\\c{f}{m = ${A.m},  n = ${A.n}}`;
        return formulaCard(R, measure, k, T2('Funktionsterm', 'Function term'), col.f(), rows, right);
      };
    }

    /** Karte 2: Steckbrief mit Beschriftungsspalte; verdeckt mit Platzhaltern. */
    function propCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const lsz = 11;
        const vsz = fs(13, 12);
        const labW = clamp(R.w * 0.42, 100, 128);
        const vW = R.w - 2 * pad - labW - 4;
        const show = infoShown();
        const items: { label: string; srcs: string[]; hl?: string }[] = [];
        items.push({ label: T2('Definitionsmenge', 'Domain'), srcs: [domSrc()] });
        if (p.a === 0) {
          items.push({ label: T2('Nullstellen', 'Zeros'), srcs: [`\\t{${T2('alle x ∈ D (Nullfunktion)', 'all x ∈ D (zero function)')}}`] });
        } else {
          items.push({ label: T2('Nullstellen', 'Zeros'), srcs: A.zeros.length ? A.zeros.map((z) => `\\c{z}{x = ${N(z.x, 2)}}${z.k > 1 ? `  \\c{m}{\\t{(${orderName(z.k)})}}` : ''}`) : [`\\t{${T2('keine', 'none')}}`] });
          items.push({
            label: T2('Polstellen', 'Poles'),
            srcs: A.poles.length ? A.poles.map((q) => `\\c{p}{x = ${N(q.x, 2)}}  \\c{m}{\\t{${q.signChange ? T2('mit VZW', 'sign change') : T2('ohne VZW', 'no sign change')}}}`) : [`\\t{${T2('keine', 'none')}}`],
            hl: undefined,
          });
        }
        if (A.holes.length)
          items.push({
            label: T2('Behebbare Lücke', 'Removable gap'),
            srcs: A.holes.map((h) => `\\c{h}{(${N(h.x, 2)} | ${N(h.y, 2)})}  \\c{m}{\\t{${T2('Loch', 'hole')}}}`),
            hl: col.h(),
          });
        if (p.a !== 0) {
          const asy: string[] = [];
          if (A.poles.length) asy.push(`\\c{p}{${A.poles.map((q) => `x = ${N(q.x, 2)}`).join(';  ')}}`);
          if (A.exact) asy.push(A.poles.length ? `\\t{${T2('keine weitere', 'no other')}}` : `\\t{${T2('keine', 'none')}}`);
          else {
            asy.push(`\\c{s}{${asymSrc()}}`);
            if (A.kind === 'curve') asy.push(`\\c{m}{\\t{(${T2('Näherungskurve', 'approximating curve')})}}`);
          }
          items.push({ label: T2('Asymptoten', 'Asymptotes'), srcs: asy });
        }
        if (!compact && p.a !== 0) {
          const y0 = yIntercept(F);
          items.push({ label: T2('y-Achse', 'y-axis'), srcs: [Number.isFinite(y0) ? `f(0) = ${cN('y0', y0, 3)}` : `\\t{${T2('kein Schnittpunkt (0 ∉ D)', 'no intercept (0 ∉ D)')}}`] });
          if (sym) items.push({ label: T2('Symmetrie', 'Symmetry'), srcs: [`\\t{${sym === 'odd' ? T2('punktsymmetrisch zum Ursprung', 'point symmetric about O') : T2('achsensymmetrisch zur y-Achse', 'symmetric about the y-axis')}}`] });
        }
        const boxes = items.map((it) => (show ? it.srcs.map((s) => fit(s, vW, vsz, theme.text, 600, 11)) : [phBox('', vsz, Math.min(vW, 84))]));
        const hs = boxes.map((bs) => bs.reduce((s, b) => s + rowH(b) + 3, -3));
        const gap = fs(9, 8);
        const h = 38 + hs.reduce((s, v) => s + v + gap, 0) + 2;
        if (measure) return h;
        card(R, col.z());
        cardTitle(R, T2('Steckbrief', 'Profile'), col.z(), show ? undefined : `\\c{m}{\\t{${T2('verdeckt', 'hidden')}}}`);
        let y = R.y + 38;
        const a = infoAlpha();
        items.forEach((it, i) => {
          const rowA = clamp01(k.stagger * (items.length + 2) - i);
          if (y + hs[i]! > R.y + R.h - 2) return;
          g.save();
          g.globalAlpha *= ease.outCubic(rowA);
          if (it.hl && show) {
            g.fillStyle = withAlpha(it.hl, theme.dark ? 0.18 : 0.1);
            roundRect(g, R.x + pad - 6, y - 4, R.w - 2 * pad + 12, hs[i]! + 8, 7);
            g.fill();
          }
          g.font = `650 ${lsz}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          let lab = it.label;
          while (g.measureText(lab).width > labW - 3 && lab.length > 4) lab = `${lab.slice(0, -2).trimEnd()}.`;
          g.fillText(lab, R.x + pad, y + rowH(boxes[i]![0]!) / 2);
          g.globalAlpha *= a;
          let yy = y;
          boxes[i]!.forEach((b) => {
            b.draw(g, R.x + pad + labW, yy + b.asc);
            yy += rowH(b) + 3;
          });
          g.restore();
          y += hs[i]! + gap;
        });
        return h;
      };
    }

    /* ---------- Polynomdivision wie an der Tafel ---------- */
    function divBox(maxW: number, size0: number, now: number): FormulaBox {
      const g = surface.g;
      const D = divisionSteps(A.num, A.den);
      const dp = degree(A.num);
      const t = divOn ? now - divOn.t0 : 1e9;
      const T = (i: number) => (reduced() ? 1e9 : t - 350 - i * 1050);
      type Line = { terms: { d: number; c: number }[]; pre: string; post: string; a: number; under?: number };
      const termsOf = (c: Poly, all = false) => {
        const out: { d: number; c: number }[] = [];
        for (let d = c.length - 1; d >= 0; d--) if (all || Math.abs(c[d]!) > 1e-9) out.push({ d, c: c[d]! });
        if (!out.length) out.push({ d: 0, c: 0 });
        return out;
      };
      let size = size0;
      for (;;) {
        const fsz = fstyle(size, th().text, 600);
        const lines: Line[] = [];
        const qTerms = D.steps.map((s) => ({ d: s.k, c: s.c }));
        const qSrc = (n: number) =>
          qTerms
            .slice(0, n)
            .map((q, i) => {
              const tp = termParts(q.c, q.d);
              return i === 0 ? `${tp.neg ? '−' : ''}${tp.body}` : `${tp.neg ? '−' : '+'} ${tp.body}`;
            })
            .join(' ');
        lines.push({ terms: termsOf(A.num, true), pre: '(', post: `) : (${polySrc(A.den)}) =`, a: 1 });
        D.steps.forEach((s, i) => {
          lines.push({ terms: termsOf(s.sub), pre: '−(', post: ')', a: clamp01(T(i) / 380), under: clamp01((T(i) - 250) / 350) });
          lines.push({ terms: termsOf(s.rem), pre: '', post: i === D.steps.length - 1 ? `   \\c{m}{\\t{${T2('Rest', 'remainder')}}}` : '', a: clamp01((T(i) - 520) / 380) });
        });
        const tsrc = (tm: { d: number; c: number }, first: boolean) => {
          const tp = termParts(tm.c, tm.d);
          if (tm.c === 0) return first ? '0' : `\\c{m}{+ 0${tm.d === 0 ? '' : tm.d === 1 ? 'x' : `x^{${tm.d}}`}}`;
          return first ? `${tp.neg ? '−' : ''}${tp.body}` : `${tp.neg ? '−' : '+'} ${tp.body}`;
        };
        const colW = new Map<number, number>();
        for (const ln of lines)
          ln.terms.forEach((tm, i) => {
            const w = formula(g, tsrc(tm, i === 0), fsz).w;
            colW.set(tm.d, Math.max(colW.get(tm.d) ?? 0, w));
          });
        const gapC = size * 0.35;
        const LM = formula(g, '−(', fsz).w + 2;
        const X = new Map<number, number>();
        let cx = LM;
        for (let d = dp; d >= 0; d--) {
          X.set(d, cx);
          if (colW.has(d)) cx += colW.get(d)! + gapC;
        }
        const headPost = formula(g, `${lines[0]!.post} ${qSrc(qTerms.length)}`, fsz).w;
        const wFull = cx + headPost;
        const wNoQ = cx + formula(g, lines[0]!.post, fsz).w;
        // Quotient zu breit: in eine eigene Zeile unter den Kopf
        const qOwn = wFull > maxW && wNoQ <= maxW;
        const width = qOwn ? Math.max(wNoQ, LM + formula(g, `= ${qSrc(qTerms.length)}`, fsz).w) : wFull;
        if (width > maxW && size > 11) {
          size -= 0.5;
          continue;
        }
        const lh = size * 1.6;
        const off = qOwn ? 1 : 0;
        const nL = lines.length + off;
        const qShown = D.steps.map((_, i) => clamp01(T(i) / 380));
        const s = size;
        return {
          w: Math.min(width, maxW),
          asc: s * 0.8,
          desc: (nL - 1) * lh + s * 0.4,
          draw(g2, x0, y0) {
            lines.forEach((ln, li) => {
              if (ln.a <= 0.01) return;
              const y = y0 + (li === 0 ? 0 : li + off) * lh;
              g2.save();
              g2.globalAlpha *= ease.outCubic(ln.a);
              const dx = (1 - ease.outCubic(ln.a)) * 12;
              const first = ln.terms[0]!;
              const preB = ln.pre ? formula(g2, ln.pre, fsz) : null;
              const startX = x0 + (X.get(first.d) ?? LM) + dx;
              if (preB) preB.draw(g2, startX - preB.w, y);
              let end = startX;
              ln.terms.forEach((tm, i) => {
                const b = formula(g2, li === 0 ? tsrc(tm, i === 0) : `\\c{${li % 2 === 1 ? 'm' : 't'}}{${tsrc(tm, i === 0)}}`, fsz);
                const xx = x0 + (X.get(tm.d) ?? LM) + dx;
                b.draw(g2, xx, y);
                end = xx + b.w;
              });
              if (li === 0) {
                const pb = formula(g2, ln.post, fsz);
                pb.draw(g2, end, y);
                let qx = end + pb.w + size * 0.3;
                let qy = y;
                if (qOwn) {
                  qy = y + lh;
                  const eb = formula(g2, '=', fsz);
                  eb.draw(g2, x0 + LM, qy);
                  qx = x0 + LM + eb.w + size * 0.3;
                }
                qTerms.forEach((q, i) => {
                  const a = qShown[i]!;
                  if (a <= 0.01) return;
                  const tp = termParts(q.c, q.d);
                  const src = `\\c{s}{${i === 0 ? `${tp.neg ? '−' : ''}${tp.body}` : `${tp.neg ? '−' : '+'} ${tp.body}`}}`;
                  const qb = formula(g2, src, fstyle(size, th().text, 700));
                  g2.save();
                  g2.globalAlpha *= ease.outCubic(a);
                  if (qx + qb.w <= x0 + maxW + 2) qb.draw(g2, qx, qy - (1 - ease.outCubic(a)) * 6);
                  g2.restore();
                  qx += qb.w + size * 0.3;
                });
              } else if (ln.post) {
                const pb = formula(g2, ln.post, fsz);
                pb.draw(g2, end, y);
              }
              g2.restore();
              if (ln.under !== undefined && ln.under > 0.01) {
                const ux0 = startX - (preB?.w ?? 0);
                const ux1 = end + formula(g2, ln.post, fsz).w;
                g2.save();
                g2.strokeStyle = withAlpha(th().text, 0.55);
                g2.lineWidth = 1.2;
                g2.beginPath();
                g2.moveTo(ux0, y + s * 0.42);
                g2.lineTo(lerp(ux0, ux1, ease.outCubic(ln.under)), y + s * 0.42);
                g2.stroke();
                g2.restore();
              }
            });
          },
        };
      }
    }
    const divDone = (now: number) => {
      if (!divOn) return true;
      const n = divisionSteps(A.num, A.den).steps.length;
      return reduced() || now - divOn.t0 > 350 + n * 1050 + 900;
    };

    /** Karte 3: Verhalten für x → ±∞ (Gradregel, Polynomdivision, Abweichung). */
    function asymCard(k: Intro, now: number): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const maxW = R.w - 2 * pad - 4;
        const show = infoShown();
        const rsz = fs(12.5, 11.5);
        const rules = [
          `m < n:  \\c{s}{y = 0}`,
          `m = n:  \\c{s}{y = \\f{a_Z}{a_N}}  \\c{m}{\\t{(${T2('Leitkoeff.', 'leading coeff.')})}}`,
          `m = n + 1:  \\c{s}{\\t{${T2('schräge Asymptote', 'oblique asymptote')}}}`,
          `m > n + 1:  \\c{s}{\\t{${T2('Näherungskurve', 'approximating curve')}}}`,
        ];
        const showRules = !compact && !divOn && p.a !== 0;
        const ruleBoxes = showRules ? rules.map((s) => fit(s, maxW - 8, rsz, theme.text, 600, 11)) : [];
        const ruleH = ruleBoxes.map((b) => Math.max(rowH(b) + 7, fs(24, 22)));
        const rows: RowSpec[] = [];
        const big0 = fs(15, 13.5);
        if (p.a === 0) rows.push(noteRow(T2('Für a = 0 ist f die Nullfunktion: f(x) = 0 auf ganz D, die x-Achse ist der Graph (mit Löchern).', 'For a = 0, f is the zero function: f(x) = 0 on all of D; the graph is the x-axis (with holes).'), fs(12, 11), theme.text));
        else if (show) {
          if (divOn && A.kind !== 'zero') rows.push({ box: divBox(maxW, fs(13, 12), now), gap: 12 });
          const name =
            A.exact
              ? T2('keine Asymptote', 'no asymptote')
              : A.kind === 'zero' || A.kind === 'const'
                ? T2('waagrechte Asymptote', 'horizontal asymptote')
                : A.kind === 'oblique'
                  ? T2('schräge Asymptote', 'oblique asymptote')
                  : T2('Näherungskurve', 'approximating curve');
          const doneA = divDone(now) ? 1 : 0.35;
          if (A.exact) rows.push({ src: `\\t{${name}:}  \\c{s}{f(x) = ${polySrc(A.asym)}}  \\c{m}{\\t{${T2('für', 'for')} x ∈ D}}`, size: fs(13.5, 12.5), weight: 700, gap: 7, hl: col.s() });
          else rows.push({ src: `\\t{${name}:}  \\c{s}{${asymSrc()}}`, size: big0, weight: 700, gap: 7, hl: col.s(), at: doneA });
          if (A.kind === 'zero') rows.push({ src: `m < n:  f(x) = \\f{${polySrc(A.num)}}{${polySrc(A.den)}} → 0`, size: fs(12.5, 11.5), gap: 7 });
          else if (!A.exact) {
            const r0 = restSrc();
            const rr = r0.replace(/^[+−] /, '');
            rows.push({ src: `f(x) = \\c{s}{${polySrc(A.asym)}} ${r0}`, size: fs(12.5, 11.5), gap: 4, at: doneA });
            if (!compact) rows.push({ src: `${rr} → 0  \\t{${T2('für', 'as')}} x → ±∞`, size: fs(12, 11), color: theme.muted, gap: 7, at: doneA });
          } else if (!compact) rows.push(noteRow(T2('Nach dem Kürzen ist f ganzrational: Der Graph ist diese Kurve selbst, nur mit Loch.', 'After cancelling, f is a polynomial: the graph is this curve itself, just with a hole.'), fs(12, 11)));
          if (crossings.length && !compact)
            rows.push(
              noteRow(
                T2(
                  `Der Graph schneidet die Asymptote in ${crossings.map((c) => `(${N(c.x, 2)} | ${N(c.y, 2)})`).join(' und ')} – das ist erlaubt: Die Annäherung gilt erst für große |x|.`,
                  `The graph crosses the asymptote at ${crossings.map((c) => `(${N(c.x, 2)} | ${N(c.y, 2)})`).join(' and ')} – that is allowed: the approach only holds for large |x|.`,
                ),
                fs(12, 11),
                theme.text,
              ),
            );
        } else {
          rows.push({ box: phBox(A.kind === 'curve' ? 'y ≈' : 'y =', big0, 110), gap: 8 });
          rows.push(noteRow(T2('Vergleiche Zählergrad m und Nennergrad n; bei m ≥ n hilft die Polynomdivision.', 'Compare the degrees m and n; if m ≥ n, polynomial division helps.'), fs(12, 11)));
        }
        const items = rows.map((r) => {
          const size = r.size ?? fs(13.5, 12.5);
          if (r.text) {
            const font = `${r.weight ?? 550} ${size}px ${theme.font}`;
            const lines = wrapText(r.src ?? '', maxW, font);
            return { box: null as FormulaBox | null, lines, font, h: lines.length * size * 1.32, size };
          }
          const box = r.box ?? fit(r.src ?? '', maxW, size, r.color ?? theme.text, r.weight ?? 600, 11);
          return { box, lines: [] as string[], font: '', h: rowH(box), size };
        });
        const rulesH = showRules ? ruleH.reduce((s, v) => s + v, 0) + 6 : 0;
        const h = 38 + rulesH + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + 4;
        if (measure) return h;
        card(R, col.s());
        cardTitle(R, T2('Verhalten für x → ±∞', 'Behaviour as x → ±∞'), col.s(), p.a !== 0 ? `\\c{s}{m = ${A.m},  n = ${A.n}}` : undefined);
        let y = R.y + 38;
        if (showRules) {
          const ys: number[] = [];
          let yy = y;
          for (const v of ruleH) {
            ys.push(yy);
            yy += v;
          }
          if (show) {
            const i0 = Math.floor(clamp(kCase.v, 0, 3));
            const tt = clamp(kCase.v, 0, 3) - i0;
            const hy = lerp(ys[i0]!, ys[Math.min(3, i0 + 1)]!, tt);
            const hh = lerp(ruleH[i0]!, ruleH[Math.min(3, i0 + 1)]!, tt);
            g.save();
            g.globalAlpha *= infoAlpha();
            g.fillStyle = withAlpha(col.s(), theme.dark ? 0.22 : 0.12);
            roundRect(g, R.x + pad - 6, hy - 1, R.w - 2 * pad + 12, hh - 4, 8);
            g.fill();
            g.strokeStyle = withAlpha(col.s(), 0.5);
            g.lineWidth = 1.2;
            roundRect(g, R.x + pad - 5.5, hy - 0.5, R.w - 2 * pad + 11, hh - 5, 8);
            g.stroke();
            g.restore();
          }
          ruleBoxes.forEach((b, i) => {
            g.save();
            g.globalAlpha *= clamp01(k.stagger * 6 - i);
            b.draw(g, R.x + pad, ys[i]! + (ruleH[i]! - 4) / 2 + (b.asc - b.desc) / 2);
            g.restore();
          });
          y = yy + 6;
        }
        items.forEach((it, i) => {
          const row = rows[i]!;
          const a = (row.at ?? 1) * clamp01(k.stagger * (rows.length + 6) - i - 4) * infoAlpha();
          if (y + it.h > R.y + R.h - 2) return;
          g.save();
          g.globalAlpha *= ease.outCubic(clamp01(a));
          if (row.hl) {
            g.fillStyle = withAlpha(row.hl, theme.dark ? 0.2 : 0.12);
            roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
            g.fill();
          }
          if (it.box) it.box.draw(g, R.x + pad, y + it.box.asc);
          else {
            g.font = it.font;
            g.fillStyle = row.color ?? theme.text;
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            it.lines.forEach((ln, j) => g.fillText(ln, R.x + pad, y + it.size * 0.66 + j * it.size * 1.32));
          }
          g.restore();
          y += it.h + (row.gap ?? 8);
        });
        return h;
      };
    }

    /** Stelle für die Wertetabelle: angefasster/zuletzt bedienter Pol bzw. Lücke, sonst die erste Polstelle. */
    function focusSpot(): { x: number; kind: 'pole' | 'hole' } | null {
      const spots = [...A.poles.map((q) => ({ x: q.x, kind: 'pole' as const })), ...A.holes.map((h) => ({ x: h.x, kind: 'hole' as const }))];
      if (!spots.length) return null;
      const hp = hover?.id?.startsWith('p') ? pGoal(Number(hover.id.slice(1))) : drag && drag.kind !== 'look' ? (drag.kind === 'p' ? pGoal(drag.i) : zGoal(drag.i)) : focusX;
      if (hp !== null) {
        const s = spots.find((q) => Math.abs(q.x - hp) < 1e-9);
        if (s) return s;
      }
      return spots[0]!;
    }

    /** Karte 4: Wertetabelle bei x₀ ± 0,1; 0,01; … (Polstelle oder Lücke). */
    function tableCard(k: Intro, now: number): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const spot = focusSpot();
        const rh = compact ? fs(19, 18) : fs(21, 19);
        const nR = compact ? 3 : 4;
        const show = infoShown();
        const foot: string[] = [];
        if (spot && p.a !== 0) {
          if (spot.kind === 'pole') {
            const sd = poleSides(F, spot.x);
            const inf = (v: number) => `\\c{${v > 0 ? 'pos' : 'neg'}}{${v > 0 ? '+∞' : '−∞'}}`;
            foot.push(show ? `\\t{${T2('links', 'left')}}: f(x) → ${inf(sd.left)}    \\t{${T2('rechts', 'right')}}: f(x) → ${inf(sd.right)}` : `\\t{${T2('links', 'left')}}: f(x) → ?    \\t{${T2('rechts', 'right')}}: f(x) → ?`);
            if (!compact && show) {
              const ap = poleApprox(F, spot.x);
              const cS = N(Math.abs(ap.c), 3);
              foot.push(`\\t{${T2('nahe', 'near')}} ${N(spot.x, 2)}:  f(x) ≈ ${ap.c < 0 ? '−' : ''}\\f{${cS}}{${linSrc(spot.x, ap.k, ap.k === 1)}}`);
            }
          } else {
            const h = A.holes.find((q) => Math.abs(q.x - spot.x) < 1e-9)!;
            foot.push(show ? `\\t{lim}_{x → ${N(spot.x, 2)}} f(x) = \\c{h}{${N(h.y, 2)}}   \\c{m}{\\t{${T2('beidseitig', 'from both sides')}}}` : `\\t{lim}_{x → ${N(spot.x, 2)}} f(x) = ?`);
          }
        }
        const fb = foot.map((s) => fit(s, R.w - 2 * pad - 4, fs(12.5, 11.5), theme.text, 600, 11));
        const h = 38 + (spot ? rh * (nR + 1) + 8 : 26) + fb.reduce((s, b) => s + rowH(b) + 6, 0) + 8;
        if (measure) return h;
        const title = !spot ? T2('Wertetabelle', 'Table of values') : spot.kind === 'pole' ? T2(`Annäherung an die Polstelle ${N(spot.x, 2)}`, `Approaching the pole ${N(spot.x, 2)}`) : T2(`Annäherung an die Lücke ${N(spot.x, 2)}`, `Approaching the gap ${N(spot.x, 2)}`);
        const acc = spot?.kind === 'hole' ? col.h() : col.p();
        card(R, acc);
        cardTitle(R, title, acc);
        const ka = ease.outCubic(k.cards);
        g.save();
        g.globalAlpha *= ka;
        if (!spot || p.a === 0) {
          g.font = `550 ${fs(12, 11)}px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(p.a === 0 ? T2('Nullfunktion: alle Werte sind 0.', 'Zero function: all values are 0.') : T2('Keine Polstelle und keine Lücke.', 'No pole and no gap.'), R.x + pad, R.y + 50);
          g.restore();
          return h;
        }
        const y0 = R.y + 34;
        const c0 = R.x + pad;
        const cMid = R.x + R.w / 2;
        const xL = c0;
        const yL = cMid - 9;
        const xR = cMid + 9;
        const yR = R.x + R.w - pad;
        // Kopf
        const hf = `700 ${fs(11.5, 11)}px ${theme.font}`;
        g.font = hf;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'left';
        g.fillText(`x < ${N(spot.x, 2)}`, xL, y0 + rh / 2);
        g.fillText(`x > ${N(spot.x, 2)}`, xR, y0 + rh / 2);
        g.textAlign = 'right';
        g.font = `italic 700 ${fs(12.5, 11.5)}px ${theme.mathFont}`;
        g.fillText('f(x)', yL, y0 + rh / 2);
        g.fillText('f(x)', yR, y0 + rh / 2);
        g.strokeStyle = withAlpha(theme.text, 0.2);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(c0, y0 + rh + 0.5);
        g.lineTo(R.x + R.w - pad, y0 + rh + 0.5);
        g.moveTo(cMid + 0.5, y0 + 4);
        g.lineTo(cMid + 0.5, y0 + rh * (nR + 1));
        g.stroke();
        const rowsT = approachTable(F, spot.x, nR);
        const fv = `600 ${fs(12, 11)}px ${theme.font}`;
        const vfmt = (v: number) => (spot.kind === 'hole' ? N(v, 4) : Math.abs(v) < 100 ? big(v, 3) : big(v, 1));
        const tt = now - tabT0;
        rowsT.forEach((rw, i) => {
          const a = reduced() ? 1 : clamp01((tt - 200 - i * 260) / 320);
          const y = y0 + rh * (i + 1.5) + 1;
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          const dx = (1 - ease.outCubic(a)) * 10;
          g.font = fv;
          g.textAlign = 'left';
          g.fillStyle = theme.text;
          g.fillText(N(rw.left.x, i + 1), xL + dx, y);
          g.fillText(N(rw.right.x, i + 1), xR + dx, y);
          g.textAlign = 'right';
          const cell = (v: number, x: number) => {
            if (show) {
              g.fillStyle = spot.kind === 'hole' ? col.h() : v > 0 ? col.pos() : col.neg();
              g.fillText(vfmt(cnt(`t${i}${x}`, v)), x + dx, y);
            } else phBox('', fs(12, 11), 44).draw(g, x - 44 + dx, y + 4);
          };
          cell(rw.left.y, yL);
          cell(rw.right.y, yR);
          g.restore();
        });
        let y = y0 + rh * (nR + 1) + 10;
        fb.forEach((b) => {
          b.draw(g, R.x + pad, y + b.asc);
          y += rowH(b) + 6;
        });
        g.restore();
        return h;
      };
    }

    /** Karte 5: Vorzeichentabelle mit einer Zeile pro Faktor (Zähler grün, Nenner rot). */
    function signCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const t = table;
        const K = t.xs.length;
        const rh = fs(22, 20);
        const nRows = 1 + t.rows.length + 1 + 1;
        const show = infoShown();
        const note = T2('Das Vorzeichen kann nur an Nullstellen und Polstellen wechseln – und nur bei ungerader Vielfachheit.', 'The sign can only change at zeros and poles – and only for odd multiplicity.');
        const nfont = `550 ${fs(12, 11)}px ${theme.font}`;
        const nlines = compact ? [] : wrapText(note, R.w - 2 * pad, nfont);
        const ok = p.a !== 0 && K <= 6;
        const tableH = ok ? nRows * rh + 6 : 24;
        const h = 40 + tableH + nlines.length * fs(12, 11) * 1.32 + 12;
        if (measure) return h;
        card(R, col.pos());
        cardTitle(R, T2('Vorzeichentabelle', 'Sign chart'), col.pos());
        g.save();
        g.globalAlpha *= ease.outCubic(k.cards);
        let y = R.y + 40;
        if (!ok) {
          g.font = nfont;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.fillText(T2('Nullfunktion: kein Vorzeichen.', 'Zero function: no sign.'), R.x + pad, y + 8);
          g.restore();
          return h;
        }
        const labels = [...t.rows.map((rw) => linSrc(rw.x, rw.m)), `a = ${N(p.a, 2)}`, 'f(x)'];
        const lsz = fs(12.5, 11.5);
        const lw = Math.min(R.w * 0.34, Math.max(...labels.map((s) => wOf(s, lsz, 650))) + 10);
        const avail = R.w - 2 * pad - lw;
        const wi = avail / (K + 1 + 0.7 * K);
        const wz = 0.7 * wi;
        const cols: { x: number; w: number; crit: number | null; iv: number | null }[] = [];
        let cx = R.x + pad + lw;
        for (let c = 0; c <= 2 * K; c++) {
          const crit = c % 2 === 1 ? (c - 1) / 2 : null;
          const w = crit === null ? wi : wz;
          cols.push({ x: cx, w, crit, iv: crit === null ? c / 2 : null });
          cx += w;
        }
        const rowAt = (i: number) => clamp01(k.stagger * (nRows + 2) - i);
        const ctext = (s: string, x: number, yy: number, font: string, color: string) => {
          g.font = font;
          g.fillStyle = color;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(s, x, yy);
        };
        // senkrechte Hilfslinien an den kritischen Stellen
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.18);
        g.setLineDash([2, 3]);
        for (const c of cols) {
          if (c.crit === null) continue;
          g.beginPath();
          g.moveTo(c.x + c.w / 2, y + rh - 2);
          g.lineTo(c.x + c.w / 2, y + nRows * rh - 4);
          g.stroke();
        }
        g.restore();
        // Kopfzeile
        const hf = `700 ${fs(12, 11)}px ${theme.font}`;
        formula(g, 'x', fstyle(lsz, theme.muted, 600)).draw(g, R.x + pad, y + rh / 2 + 4);
        for (const c of cols) {
          if (c.crit === null) continue;
          const mk = t.marks[c.crit]!;
          let s = N(t.xs[c.crit]!, 2);
          g.font = hf;
          if (g.measureText(s).width > c.w + wi * 0.8) s = N(t.xs[c.crit]!, 1);
          ctext(s, c.x + c.w / 2, y + rh / 2, hf, mk === 'zero' ? col.z() : mk === 'pole' ? col.p() : col.h());
        }
        g.strokeStyle = withAlpha(theme.text, 0.2);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y + rh + 0.5);
        g.lineTo(R.x + R.w - pad, y + rh + 0.5);
        g.stroke();
        y += rh;
        const sgnFont = `800 ${fs(14, 13)}px ${theme.font}`;
        const sgnT = (s: number) => (s > 0 ? '+' : '−');
        const sgnC = (s: number) => (s > 0 ? col.pos() : col.neg());
        t.rows.forEach((rw, i) => {
          g.save();
          g.globalAlpha *= rowAt(i + 1);
          formula(g, linSrc(rw.x, rw.m), fstyle(lsz, rw.part === 'num' ? col.z() : col.p(), 650)).draw(g, R.x + pad, y + rh / 2 + 4.5);
          for (const c of cols) {
            if (c.iv !== null) ctext(sgnT(rw.signs[c.iv]!), c.x + c.w / 2, y + rh / 2, sgnFont, sgnC(rw.signs[c.iv]!));
            else if (Math.abs(t.xs[c.crit!]! - rw.x) < 1e-9) ctext('0', c.x + c.w / 2, y + rh / 2, `700 ${fs(13, 12)}px ${theme.font}`, rw.part === 'num' ? theme.text : col.p());
          }
          g.restore();
          y += rh;
        });
        // Zeile für a
        g.save();
        g.globalAlpha *= rowAt(t.rows.length + 1);
        formula(g, `a = ${N(p.a, 2)}`, fstyle(lsz, theme.text, 650)).draw(g, R.x + pad, y + rh / 2 + 4.5);
        for (const c of cols) if (c.iv !== null) ctext(sgnT(t.lead), c.x + c.w / 2, y + rh / 2, sgnFont, sgnC(t.lead));
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
        formula(g, '\\b{f(x)}', fstyle(lsz, theme.text, 750)).draw(g, R.x + pad, y + rh / 2 + 5);
        for (const c of cols) {
          const cxm = c.x + c.w / 2;
          if (!show) {
            if (c.iv !== null) phBox('', fs(11.5, 11), Math.min(c.w - 4, 26)).draw(g, cxm - Math.min(c.w - 4, 26) / 2, y + rh / 2 + 4);
            continue;
          }
          if (c.iv !== null) {
            const s = t.result[c.iv]!;
            g.fillStyle = withAlpha(sgnC(s), theme.dark ? 0.26 : 0.16);
            roundRect(g, c.x + 2, y + 3, c.w - 4, rh - 5, 6);
            g.fill();
            ctext(sgnT(s), cxm, y + rh / 2 + 1, `850 ${fs(15, 14)}px ${theme.font}`, sgnC(s));
          } else {
            const mk = t.marks[c.crit!]!;
            if (mk === 'zero') ctext('0', cxm, y + rh / 2 + 1, `800 ${fs(13, 12)}px ${theme.font}`, theme.text);
            else if (mk === 'pole') {
              g.strokeStyle = col.p();
              g.lineWidth = 1.8;
              g.beginPath();
              g.moveTo(cxm - 2.5, y + 5);
              g.lineTo(cxm - 2.5, y + rh - 4);
              g.moveTo(cxm + 2.5, y + 5);
              g.lineTo(cxm + 2.5, y + rh - 4);
              g.stroke();
            } else {
              g.strokeStyle = col.h();
              g.lineWidth = 2;
              g.beginPath();
              g.arc(cxm, y + rh / 2 + 1, 4.5, 0, TAU);
              g.stroke();
            }
          }
        }
        g.restore();
        y += rh + 6;
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

    function drawColumn(C: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list: { id: string; fn: CardFn }[] = [{ id: 'term', fn: termCard(k) }];
      if (divOn) list.push({ id: 'asym', fn: asymCard(k, now) });
      if (p.tab) list.push({ id: 'tab', fn: tableCard(k, now) });
      if (p.vzt) list.push({ id: 'vzt', fn: signCard(k) });
      list.push({ id: 'prop', fn: propCard(k) });
      if (!divOn) list.push({ id: 'asym', fn: asymCard(k, now) });
      const room = { x: C.x, y: C.y, w: C.w, h: C.h };
      const full = list.map((c) => c.fn(room, true, false));
      const short = list.map((c) => c.fn(room, true, true));
      const compactSet = new Set<number>();
      const total = () => list.reduce((s, _, i) => s + (compactSet.has(i) ? short[i]! : full[i]!) + gap, -gap);
      for (let i = list.length - 1; i >= 0; i--) {
        if (total() <= C.h + 1) break;
        if (short[i]! < full[i]!) compactSet.add(i);
      }
      let y = C.y;
      list.forEach((c, i) => {
        const compact = compactSet.has(i);
        const goal = compact ? short[i]! : full[i]!;
        if (y + goal > C.y + C.h + 1) return;
        let ch = cardH.get(c.id);
        if (!ch) {
          ch = new Chan(goal);
          cardH.set(c.id, ch);
        }
        if (ch.goal !== goal) {
          if (reduced()) ch.jump(goal);
          else ch.follow(goal, 0.12);
        }
        const hh = Math.min(ch.v, goal + 40);
        if (y + Math.min(hh, goal) > C.y + C.h + 1) return;
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

    /* ---------- Ergebnisse unter der Bühne ---------- */
    function updateReadouts(): void {
      ctx.readout('term', { html: toHtml(`f(x) = \\f{${polySrc(A.num)}}{${polySrc(A.den)}}`) });
      ctx.readout('dom', { html: toHtml(domSrc()) });
      if (p.a === 0) {
        ctx.readout('zeros', T2('alle x ∈ D (Nullfunktion)', 'all x ∈ D (zero function)'));
        ctx.readout('poles', T2('keine', 'none'));
      } else {
        ctx.readout('zeros', A.zeros.length ? A.zeros.map((z) => `x = ${N(z.x, 2)}${z.k > 1 ? ` (${orderName(z.k)})` : ''}`).join('; ') : T2('keine', 'none'));
        ctx.readout(
          'poles',
          A.poles.length
            ? A.poles
                .map((q) => {
                  const s = poleSides(F, q.x);
                  const inf = (v: number) => (v > 0 ? '+∞' : '−∞');
                  return `x = ${N(q.x, 2)} (${q.signChange ? T2('mit VZW', 'sign change') : T2('ohne VZW', 'no sign change')}; ${inf(s.left)} | ${inf(s.right)})`;
                })
                .join('; ')
            : T2('keine', 'none'),
        );
      }
      ctx.readout('holes', A.holes.length ? A.holes.map((h) => fmt.point(h.x, h.y)).join('; ') : null);
      const parts: string[] = [];
      if (A.poles.length) parts.push(A.poles.map((q) => `x = ${N(q.x, 2)}`).join('; '));
      if (p.a !== 0) {
        if (A.exact) parts.push(T2(`keine weitere (f(x) = ${polySrc(A.asym)} für x ∈ D)`, `no other (f(x) = ${polySrc(A.asym)} for x ∈ D)`));
        else parts.push(`${A.kind === 'curve' ? T2('Näherungskurve ', 'approximating curve ') : ''}${asymSrc()}`);
      }
      ctx.readout('asym', parts.length ? { html: toHtml(parts.join('; ')) } : T2('keine', 'none'));
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
      if (intro !== null || pops.length || dragging() || runT0 !== null) anim = true;
      if (prevShape && now - prevShape.t0 > 600) prevShape = null;
      if (graphIn !== null && now - graphIn > 950) graphIn = null;
      if (revealT !== null && now - revealT > 1000) revealT = null;
      if (prevShape || graphIn !== null || revealT !== null) anim = true;
      if (divOn && !divDone(now)) anim = true;
      if (p.tab && now - tabT0 < 1600) anim = true;
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
    function retargetAll(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const replace = source === 'replace';
      const pos = (c: Chan, goal: number, i: number, dragged: boolean) => {
        if (instant) c.jump(goal);
        else if (dragged) c.follow(goal, 0.035);
        else if (replace) c.glide(goal, 820, i * 70, now);
        else if (c.goal !== goal) c.glide(goal, 420, 0, now, ease.outCubic);
      };
      for (let i = 0; i < 3; i++) {
        pos(SZ[i]!, zGoal(i), i, drag?.kind === 'z' && drag.i === i);
        pos(SP[i]!, pGoal(i), i + 1, drag?.kind === 'p' && drag.i === i);
      }
      if (instant) SA.jump(p.a);
      else if (replace) SA.glide(p.a, 800, 60, now);
      else if (SA.goal !== p.a) SA.follow(p.a, 0.14);
      const set = (c: Chan, goal: number, dur: number, delay = 0, e: (t: number) => number = ease.inOutCubic) => {
        if (instant) c.jump(goal);
        else if (Math.abs(c.goal - goal) > 1e-12) c.glide(goal, dur, delay, now, e);
      };
      for (let i = 0; i < 3; i++) {
        set(ZV[i]!, i < p.zn ? 1 : 0, 420);
        set(PV[i]!, i < p.pn ? 1 : 0, 420);
        const cancelled = isCancelled(i) && i < p.pn;
        // beim Kürzen: Perle gleitet erst in den Ring, dann schrumpft die Asymptote
        set(PS[i]!, isPoleIdx(i) ? 1 : 0, cancelled ? 750 : 600, cancelled && !replace ? 180 : 0);
        set(CX[i]!, cancelled ? 1 : 0, cancelled ? 1100 : 500, cancelled && !replace ? 120 : 0);
        set(HV[i]!, cancelled ? 1 : 0, cancelled ? 650 : 400, cancelled && !replace ? 520 : 0, cancelled ? ease.outBack : ease.inOutCubic);
      }
      set(FAR, p.far ? 1 : 0, p.far ? 2200 : 1600);
      set(kInfo, p.show ? 1 : 0, 900);
      set(kAsy, p.asy ? 1 : 0, 480);
      set(kSgn, p.sgn ? 1 : 0, 480);
      set(kCase, caseIdx(), 560, 0, ease.outBack);
    }

    /** Neues Kürzen bzw. neu entstandene Polstelle melden. */
    let prevPairs = pairs.map((q) => `${q.pi}|${q.x}`);
    function detectCancels(now: number, source: string): void {
      const keys = pairs.map((q) => `${q.pi}|${q.x}`);
      if (source !== 'init' && source !== 'replace' && !reduced()) {
        for (const q of pairs) {
          if (prevPairs.includes(`${q.pi}|${q.x}`)) continue;
          const y = holeY(q.x);
          const src = infoShown()
            ? `\\c{h}{${linSrc(q.x)} \\t{${T2('kürzt sich: Lücke', 'cancels: gap')}} (${N(q.x, 2)} | ${N(y, 2)})}`
            : `\\c{h}{${linSrc(q.x)} \\t{${T2('kürzt sich', 'cancels')}}}`;
          pops.push({ x: q.x, y, t0: now, src, color: col.h() });
          focusX = q.x;
          if (p.tab) tabT0 = now;
        }
        for (const key of prevPairs) {
          if (keys.includes(key)) continue;
          const x = Number(key.split('|')[1]);
          const pole = A.poles.find((q) => Math.abs(q.x - x) < 1e-9);
          if (pole) pops.push({ x, y: 0, t0: now, src: `\\c{p}{\\t{${T2('wieder eine Polstelle', 'a pole again')}}: x = ${N(x, 2)}}`, color: col.p() });
        }
      }
      prevPairs = keys;
    }

    function setLabels(): void {
      ctx.setAction('run', { enabled: editable() });
      ctx.setAction('div', { enabled: editable(), label: divOn ? T2('Rechenweg ausblenden', 'Hide the working') : T2('Polynomdivision Schritt für Schritt', 'Polynomial division step by step') });
      ctx.setAction('reveal', { enabled: editable() });
    }

    /* ---------- Zeiger: Perlen und Ringe ziehen ---------- */
    function hit(px: number, py: number, touch: boolean): string | null {
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      if (FAR.v > 0.3 || !editable()) return 'plot';
      const zs = marks('z');
      const ps = marks('p');
      let best: { id: string; d: number } | null = null;
      const inner = touch ? 13 : 9;
      for (const m of zs) {
        const d = Math.hypot(px - m.px, py - m.py);
        const sharesRing = ps.some((q) => Math.abs(q.px - m.px) < 3);
        const lim = sharesRing ? inner : touch ? 24 : 15;
        if (d < lim && (!best || d < best.d)) best = { id: `z${Math.max(...m.idx)}`, d };
      }
      if (best) return best.id;
      for (const m of ps) {
        const d = Math.hypot(px - m.px, py - m.py);
        const lim = ringR(m.idx.length) + (touch ? 16 : 8);
        if (d < lim && (!best || d < best.d)) best = { id: `p${Math.max(...m.idx)}`, d };
      }
      return best ? best.id : 'plot';
    }
    const cursorFor = (id: string | null) => (id?.startsWith('z') || id?.startsWith('p') ? 'grab' : id === 'plot' ? 'crosshair' : '');
    const target: Target = {
      contains: (px: number, py: number) => hit(px, py, false) !== null,
      pointerDown: (q: Ptr) => {
        const id = hit(q.px, q.py, q.type === 'touch');
        if (!id) return false;
        const now = performance.now();
        if ((id.startsWith('z') || id.startsWith('p')) && editable()) {
          drag = { kind: id[0] as 'z' | 'p', i: Number(id.slice(1)), sx: q.px, sy: q.py, moved: false, t0: now };
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
        if (!drag.moved && Math.hypot(q.px - drag.sx, q.py - drag.sy) > 4) drag.moved = true;
        if (!drag.moved) return;
        const [wx] = plot.toWorld(q.px, q.py);
        const x = Math.round(clamp(wx, -5, 5) * 2) / 2;
        const key = drag.kind === 'z' ? Z_KEYS[drag.i]! : P_KEYS[drag.i]!;
        focusX = x;
        if (x !== (p[key] as number)) setP({ [key]: x });
        ctx.requestRender();
      },
      pointerUp: (q: Ptr) => {
        const d = drag;
        drag = null;
        if (d && d.kind !== 'look') {
          focusX = d.kind === 'z' ? zGoal(d.i) : pGoal(d.i);
          if (p.tab) tabT0 = performance.now();
        }
        const id = d?.kind === 'look' ? null : hit(q.px, q.py, false);
        hover = id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(cursorFor(id));
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const id = q ? hit(q.px, q.py, false) : null;
        const before = hover?.id;
        hover = q && id ? { id, px: q.px, py: q.py } : null;
        if (p.tab && id?.startsWith('p') && before !== id) tabT0 = performance.now();
        surface.setCursor(cursorFor(id));
        ctx.requestRender();
      },
      wheel: () => false,
    };
    surface.addTarget(target);

    return {
      update(changed, source) {
        const now = performance.now();
        if (source === 'replace') {
          divOn = null;
          runT0 = null;
          focusX = null;
        }
        // Anzahl der Faktoren geändert: alter Graph blendet aus, neuer ein
        if (p.zn !== shownZn || p.pn !== shownPn) {
          if (source !== 'init' && !reduced()) {
            const pf = shownF();
            prevShape = { f: pf, an: analyze(pf), t0: now };
            graphIn = now;
          }
          for (let i = shownZn; i < p.zn; i++) SZ[i]!.jump(zGoal(i));
          for (let j = shownPn; j < p.pn; j++) SP[j]!.jump(pGoal(j));
          shownZn = p.zn;
          shownPn = p.pn;
        }
        if (changed.has('show') && p.show && source !== 'init') revealT = reduced() ? null : now;
        if (changed.has('tab') && p.tab) tabT0 = now;
        recompute();
        if (divOn && (A.kind === 'zero' || p.a === 0 || !p.show)) divOn = null;
        detectCancels(now, source);
        retargetAll(now, source);
        if (source === 'init' && !reduced()) {
          intro = now;
          tabT0 = now + 1200;
        }
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'run') runT0 = now;
        else if (id === 'div') divOn = divOn ? null : { t0: now };
        else if (id === 'reveal') setP({ show: true });
        setLabels();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
