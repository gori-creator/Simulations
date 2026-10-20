import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  approachSide,
  boundThreshold,
  candidateDefault,
  degreeInfo,
  exactThreshold,
  exceedPoint,
  FUNCS,
  hasLimit,
  leavePoint,
  limitOf,
  nextEps,
  runU,
  runX,
  sciSplit,
  table,
  tableXs,
  threshold,
  yWindow,
  type Dir,
  type FnKey,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Dauer des Laufs „x läuft nach außen“ (von der ersten bis zur letzten Tabellenstelle) in s. */
const RUN_S = 7.5;

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

const FN_LABEL: Record<FnKey, Txt> = {
  inv: L('1/x + 1', '1/x + 1'),
  rat: L('(2x + 1)/(x − 1)', '(2x + 1)/(x − 1)'),
  rat2: L('(3x² + 1)/(x² + 1)', '(3x² + 1)/(x² + 1)'),
  low: L('2x/(x² + 1)', '2x/(x² + 1)'),
  osc: L('sin(x)/x', 'sin(x)/x'),
  exp: L('2ˣ', '2ˣ'),
  xexp: L('x · 2⁻ˣ', 'x · 2⁻ˣ'),
  logi: L('2ˣ/(2ˣ + 1)', '2ˣ/(2ˣ + 1)'),
  poly: L('0,1x³ − x', '0.1x³ − x'),
};

const isConv = (v: Record<string, unknown>) => hasLimit(v.f as FnKey, v.dir === 'm' ? -1 : 1);

/**
 * Grenzverhalten für x → ±∞: großes Koordinatensystem mit dem Graphen, der
 * waagrechten Asymptote y = L und dem ε-Schlauch L − ε < y < L + ε als
 * leuchtendes Band. Die Stelle x_ε ist eine senkrechte Marke; jenseits davon
 * ist der Graph grün (bleibt im Schlauch), davor sind Stellen außerhalb rot.
 * Herzstück ist der Lauf „x läuft nach außen“ (Uhr): Ein Punkt P läuft
 * logarithmisch von x = 1 bis x = 10 000, die Ansicht zoomt weich mit, ein
 * Maßpfeil zeigt |f(x) − L|, eine Lupe vergrößert den winzigen Abstand, die
 * Wertetabelle füllt sich Zeile für Zeile. Unter dem Bild eine Zeitleiste mit
 * logarithmischer x-Achse (1, 10, 100, …) und dem Abstand als Kurve.
 * „ε-Spiel“: Schlauchrand ziehen oder ε schrittweise verkleinern – x_ε gleitet
 * nach außen. Bei bestimmter Divergenz ein Probe-Schlauch um einen vermuteten
 * Grenzwert, den der Graph für immer verlässt, und Schranken S, die f(x)
 * überschreitet. Karten: Term mit Umformung, Grenzwert-Schreibweise,
 * Rechnung für x_ε, Wertetabelle und Gradregel (bzw. Einschachteln,
 * Exponentialfunktion). Mit „Grenzwert zeigen“ aus wird daraus die Aufgabe
 * „Grenzwert finden“.
 */
export default defineSimulation({
  id: 'grenzverhalten',
  dragHint: true,
  animated: true,
  layout: { aspect: 1.2, aspectNarrow: 0.34 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'f',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: (['rat', 'inv', 'rat2', 'low', 'osc', 'exp', 'xexp', 'logi', 'poly'] as const).map((k) => ({ value: k, label: FN_LABEL[k] })),
      default: 'rat',
    },
    {
      key: 'dir',
      type: 'choice',
      label: L('Richtung', 'Direction'),
      options: [
        { value: 'p', label: L('x → +∞', 'x → +∞') },
        { value: 'm', label: L('x → −∞', 'x → −∞') },
      ],
      default: 'p',
    },
    {
      key: 'eps',
      type: 'number',
      label: L('Schlauchbreite ε', 'Strip width ε'),
      min: 0.05,
      max: 1,
      step: 0.05,
      default: 0.5,
      help: L('Auch am Rand des Schlauchs im Bild ziehen.', 'You can also drag the edge of the strip in the picture.'),
    },
    {
      key: 'c',
      type: 'number',
      label: L('Vermuteter Grenzwert (Probe-Schlauch)', 'Guessed limit (trial strip)'),
      min: -10,
      max: 10,
      step: 0.5,
      default: 3,
      help: L('Ohne Grenzwert: Der Graph verlässt jeden Schlauch. Den Schlauch im Bild auch verschieben.', 'Without a limit the graph leaves every strip. You can also move the strip in the picture.'),
      visibleIf: (v) => !isConv(v),
    },
    { key: 'band', type: 'boolean', group: 'view', label: L('ε-Schlauch', 'ε-strip'), default: true },
    {
      key: 'info',
      type: 'boolean',
      group: 'view',
      label: L('Grenzwert und Asymptote zeigen', 'Show the limit and the asymptote'),
      help: L('Aus: Aufgabe „Grenzwert finden“ – Asymptote, Grenzwert und Abstände sind verdeckt.', 'Off: task “find the limit” – asymptote, limit and distances are hidden.'),
      default: true,
    },
  ],
  actions: [
    { id: 'run', label: L('x nach außen laufen lassen', 'Let x run outwards'), primary: true },
    { id: 'shrink', label: L('ε verkleinern', 'Make ε smaller'), visibleIf: (v) => v.info === true && v.band === true },
    { id: 'back', label: L('Zurück zum Anfang', 'Back to the start') },
    { id: 'reveal', label: L('Grenzwert aufdecken', 'Reveal the limit'), primary: true, visibleIf: (v) => v.info !== true },
  ],
  readouts: [
    { key: 'lim', label: L('Grenzverhalten', 'Behaviour'), spoiler: true },
    { key: 'asym', label: L('Asymptote', 'Asymptote'), spoiler: true },
    { key: 'xe', label: L('ε-Schlauch', 'ε-strip'), spoiler: true },
  ],
  resultsParam: 'info',
  presets: [
    { id: 'rat', label: L('Bruchfunktion → 2', 'Rational function → 2'), values: {} },
    { id: 'rat2', label: L('Annäherung von unten', 'Approach from below'), values: { f: 'rat2', eps: 0.2 } },
    { id: 'osc', label: L('sin(x)/x schneidet die Asymptote', 'sin(x)/x crosses the asymptote'), values: { f: 'osc', eps: 0.1 } },
    { id: 'logi', label: L('Zwei verschiedene Asymptoten', 'Two different asymptotes'), values: { f: 'logi', dir: 'm', eps: 0.2 } },
    { id: 'xexp', label: L('x · 2⁻ˣ: die Exponentialfunktion gewinnt', 'x · 2⁻ˣ: the exponential wins'), values: { f: 'xexp', eps: 0.25 } },
    { id: 'poly', label: L('Kein Grenzwert: 0,1x³ − x', 'No limit: 0.1x³ − x'), values: { f: 'poly' } },
    { id: 'guess', label: L('Aufgabe: Grenzwert finden', 'Task: find the limit'), values: { f: 'low', info: false } },
  ],
  strings: {
    de: {
      canvas:
        'Großes Koordinatensystem mit dem Graphen einer Funktion, ihrer waagrechten Asymptote y = L und dem ε-Schlauch um die Asymptote als leuchtendes Band. Eine senkrechte Marke zeigt die Stelle x_ε, ab der der Graph im Schlauch bleibt; dieser Teil ist grün, Stellen außerhalb davor sind rot. Ein Punkt P läuft auf dem Graphen nach außen, die Ansicht zoomt mit, ein Maßpfeil und eine Lupe zeigen den Abstand zur Asymptote. Unter dem Bild eine Zeitleiste mit logarithmischer x-Achse. Daneben Karten mit Term und Umformung, Grenzwert, Rechnung für x_ε, Wertetabelle und Gradregel. Ohne Grenzwert ein Probe-Schlauch, den der Graph verlässt.',
    },
    en: {
      canvas:
        'Large coordinate system with the graph of a function, its horizontal asymptote y = L and the ε-strip around the asymptote as a glowing band. A vertical marker shows the position x_ε beyond which the graph stays in the strip; that part is green, points outside before it are red. A point P runs outwards along the graph while the view zooms out; a dimension arrow and a magnifier show the distance to the asymptote. Below the picture a timeline with a logarithmic x-axis. Next to it cards with the term and its rewriting, the limit, the working for x_ε, a table of values and the degree rule. Without a limit a trial strip that the graph leaves.',
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
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);
    const editable = () => !ctx.locked;
    const key = () => p.f as FnKey;
    const dir = (): Dir => (p.dir === 'm' ? -1 : 1);
    const conv = () => hasLimit(key(), dir());
    const Lim = () => limitOf(key(), dir());
    const fn = (x: number) => FUNCS[key()].f(x);

    /* ---------- Farben (gleiche Farbe = gleiche Größe in Bild, Karten und Tabelle) ---------- */
    const col = {
      f: () => th().series[0]!,
      L: () => th().series[4]!,
      ok: () => th().series[2]!,
      out: () => th().series[1]!,
      P: () => th().series[3]!,
      env: () => th().series[5]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7 * Math.max(1, Math.abs(v * 10 ** d));
    const eqS = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const group3 = (s: string) => {
      const neg = s.startsWith('−');
      const body = neg ? s.slice(1) : s;
      const [int, frac] = body.split(/(?=[,.]\d)/);
      const g = int!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${neg ? '−' : ''}${g}${frac ?? ''}`;
    };
    /** Große Zahlen mit Tausender-Abstand bzw. Zehnerpotenz, sehr kleine als Zehnerpotenz. */
    function big(v: number, d = 2): string {
      if (!Number.isFinite(v)) return '–';
      const a = Math.abs(v);
      if (a >= 1e7) {
        const { mant, exp } = sciSplit(v);
        return `${N(mant, 2)} · 10${supNum(exp)}`;
      }
      if (a >= 1e4) return group3(N(Math.round(v), 0));
      if (a >= 1000) return N(v, Math.min(d, 1));
      return N(v, d);
    }
    /** Kleine Abstände: bis 0,001 mit vier Nachkommastellen, darunter als Zehnerpotenz. */
    function small(v: number): string {
      if (!Number.isFinite(v)) return '–';
      const a = Math.abs(v);
      if (a === 0) return '0';
      if (a >= 1e4) return big(v);
      if (a >= 0.001) return N(v, 4);
      const { mant, exp } = sciSplit(v);
      return `${N(mant, 2)} · 10${supNum(exp)}`;
    }
    /** Funktionswert für Tabelle und Beschriftung. */
    const val = (v: number) => (Math.abs(v) >= 1e4 ? big(v) : Math.abs(v) >= 1e-3 || v === 0 ? N(v, 4) : small(v));
    const xLab = (x: number) => big(x, 2);
    /** Funktionswert nahe am Grenzwert: so viele Stellen, dass er nicht wie genau L aussieht. */
    const valNear = (v: number) => {
      const dd = conv() ? Math.abs(v - Lim()) : NaN;
      return Number.isFinite(dd) && dd > 0 && dd < 5e-4 && Math.abs(v) < 1e4 ? N(v, clamp(Math.ceil(-Math.log10(dd)) + 1, 4, 8)) : val(v);
    };
    const dS = () => (dir() > 0 ? '+' : '−');
    const rel = () => (dir() > 0 ? '>' : '<');

    /* ---------- x_ε (zwischengespeichert) ---------- */
    const xeCache = new Map<string, number>();
    /** x_ε: geschlossen, wo möglich (auch ±∞ = „für alle x“), sonst numerisch. */
    function xeOf(k: FnKey, d: Dir, eps: number): number {
      const id = `${k}|${d}|${eps}`;
      let v = xeCache.get(id);
      if (v === undefined) {
        const ex = exactThreshold(k, d, eps);
        v = Number.isNaN(ex) ? threshold(k, d, eps) : ex;
        if (xeCache.size > 200) xeCache.clear();
        xeCache.set(id, v);
      }
      return v;
    }
    const xEps = () => xeOf(key(), dir(), p.eps);
    const leaveCache = new Map<string, number>();
    function leaveOf(k: FnKey, d: Dir, c: number, eps: number): number {
      const id = `${k}|${d}|${c}|${eps}`;
      let v = leaveCache.get(id);
      if (v === undefined) {
        v = leavePoint(k, d, c, eps);
        if (leaveCache.size > 200) leaveCache.clear();
        leaveCache.set(id, v);
      }
      return v;
    }
    const xLeave = () => leaveOf(key(), dir(), p.c, p.eps);
    const exceedCache = new Map<string, number>();
    function exceedOf(k: FnKey, d: Dir, S: number): number {
      const id = `${k}|${d}|${S}`;
      let v = exceedCache.get(id);
      if (v === undefined) {
        v = exceedPoint(k, d, S);
        exceedCache.set(id, v);
      }
      return v;
    }
    const sideCache = new Map<string, ReturnType<typeof approachSide>>();
    function sideOf(k: FnKey, d: Dir): ReturnType<typeof approachSide> {
      const id = `${k}|${d}`;
      if (!sideCache.has(id)) sideCache.set(id, approachSide(k, d));
      return sideCache.get(id)!;
    }
    /** Mitte des Schlauchs: Grenzwert bzw. vermuteter Wert. */
    const bandMid = () => (conv() ? Lim() : p.c);

    /* ---------- angezeigter Zustand ---------- */
    const SD = new Chan(dir());
    const BM = new Chan(bandMid());
    const EP = new Chan(p.eps);
    const XE = new Chan(0);
    const XL = new Chan(0);
    /** Ansicht: log der x-Ausdehnung, asinh der y-Grenzen (weich auch über Zehnerpotenzen) */
    const LX = new Chan(Math.log(10));
    const VY0 = new Chan(Math.asinh(-2));
    const VY1 = new Chan(Math.asinh(6));
    /** Fortschritt des Laufs (0 … 1, logarithmisch in |x|) */
    const U = new Chan(0);
    const kInfo = new Chan(p.info ? 1 : 0);
    const kBand = new Chan(p.band ? 1 : 0);
    const kConv = new Chan(conv() ? 1 : 0);
    const kXe = new Chan(1);
    const kRow = new Chan(-1);
    const kCase = new Chan(0);
    const cardH = new Map<string, Chan>();
    const chans = () => [SD, BM, EP, XE, XL, LX, VY0, VY1, U, kInfo, kBand, kConv, kXe, kRow, kCase, ...cardH.values()];

    let intro: number | null = null;
    /** Graph zeichnet sich neu (nach Funktionswechsel) */
    let fIn: number | null = null;
    /** vorheriger Graph blendet aus */
    let prevFn: { k: FnKey; t0: number } | null = null;
    /** Lauf aktiv: Tabelle füllt sich, P mit Beschriftung */
    let engaged = false;
    /** Zeitpunkte, zu denen die Tabellenzeilen erreicht wurden */
    let rowT: (number | null)[] = [null, null, null, null, null];
    /** Erfolgsanimation nach Änderung von ε */
    let okPulse: number | null = null;
    /** Ende des Laufs */
    let finishT: number | null = null;
    /** Aufdecken */
    let revealT: number | null = null;
    /** zuletzt gezeigte Funktion (für das Ausblenden beim Wechsel) */
    let lastKey: FnKey = key();
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let drag: { kind: 'edge'; sign: 1 | -1 } | { kind: 'mid'; off: number } | { kind: 'P' } | { kind: 'scrub'; sx: number; moved: boolean; node: number | null } | { kind: 'look' } | null = null;
    let hover: { id: string; px: number; py: number } | null = null;
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
        e.c.follow(v, dragging() ? 0.05 : 0.2);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählte, formatierte Zahl; am Ziel exakt */
    const cN = (id: string, v: number, d = 2) => {
      const s = cnt(id, v);
      return Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? N(v, d) : N(s, d);
    };

    /* ---------- Aufteilung (nach Breite UND Höhe) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.15;
    const sm = () => surface.width < 560;
    const fs = (bigSize: number, smallSize: number) => (sm() ? smallSize : bigSize);
    function regions(): { plot: Rect; strip: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      const sh = fs(72, 66);
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.32, 248, 352));
        const pw = w - cw - 12;
        return { plot: { x: 0, y: 0, w: pw, h: h - sh - 8 }, strip: { x: 0, y: h - sh, w: pw, h: sh }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const ph = Math.round(clamp(w * 0.9, 250, h * 0.42));
      return { plot: { x: 0, y: 0, w, h: ph }, strip: { x: 0, y: ph + 8, w, h: sh }, col: { x: 0, y: ph + sh + 18, w, h: h - ph - sh - 18 }, wide: false };
    }
    const PAD = () => ({ left: 12, right: 14, top: fs(30, 26), bottom: 22 });
    const plot = new Plot(surface, {
      x: [-2, 12],
      y: [-2, 6],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().plot,
      xAxis: { label: 'x', format: (v) => big(v, 2) },
      yAxis: { label: 'y', format: (v) => big(v, 2) },
    });

    /* ---------- Bildausschnitt ---------- */
    /** Grundbreite (ohne Lauf): x_ε bzw. Austrittsstelle gut sichtbar. */
    function baseX(): number {
      const k = key();
      const fam = FUNCS[k].family;
      const minX = fam === 'exp' ? 6 : k === 'osc' ? 13 : 9;
      if (conv()) {
        const xe = xEps();
        return Number.isFinite(xe) ? Math.max(minX, Math.abs(xe) * 1.4) : minX;
      }
      const xl = xLeave();
      return Math.max(fam === 'exp' ? 5 : 6, Number.isFinite(xl) ? Math.abs(xl) * 1.55 : 0);
    }
    const xP = () => runX(key(), dir(), U.v);
    function viewTarget(): { X: number; y0: number; y1: number } {
      const k = key();
      const d = dir();
      let [y0, y1] = yWindow(k, d);
      const mid = bandMid();
      const e = p.band ? p.eps : 0;
      const span0 = y1 - y0;
      y0 = Math.min(y0, mid - e - span0 * 0.12);
      y1 = Math.max(y1, mid + e + span0 * 0.16);
      const x = xP();
      if (!conv() && (engaged || U.v > 1e-6)) {
        const v = FUNCS[k].f(x);
        if (Number.isFinite(v)) {
          if (v > 0) y1 = Math.max(y1, v * 1.22);
          else y0 = Math.min(y0, v * 1.22);
        }
      }
      const X = Math.max(baseX(), Math.abs(x) * 1.28);
      return { X, y0, y1 };
    }
    function retargetView(now: number, mode: 'glide' | 'follow' | 'jump'): void {
      const v = viewTarget();
      const goals: [Chan, number][] = [
        [LX, Math.log(v.X)],
        [VY0, Math.asinh(v.y0)],
        [VY1, Math.asinh(v.y1)],
      ];
      for (const [c, goal] of goals) {
        if (mode === 'jump' || reduced()) c.jump(goal);
        else if (mode === 'follow') c.follow(goal, 0.16);
        else if (Math.abs(c.goal - goal) > 1e-9) c.glide(goal, 900, 0, now);
      }
    }
    function view(): { x: [number, number]; y: [number, number] } {
      const X = Math.exp(LX.v);
      const inner = X * 0.17;
      const s = clamp01((SD.v + 1) / 2);
      return { x: [lerp(-X, -inner, s), lerp(inner, X, s)], y: [Math.sinh(VY0.v), Math.sinh(VY1.v)] };
    }

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), L: col.L(), ok: col.ok(), out: col.out(), P: col.P(), e: col.env(), m: th().muted, t: th().text },
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

    /** Funktionsterm in Kurzschrift. */
    function termSrc(k: FnKey): string {
      switch (k) {
        case 'inv':
          return 'f(x) = \\f{1}{x} + 1';
        case 'rat':
          return 'f(x) = \\f{2x + 1}{x − 1}';
        case 'rat2':
          return 'f(x) = \\f{3x^2 + 1}{x^2 + 1}';
        case 'low':
          return 'f(x) = \\f{2x}{x^2 + 1}';
        case 'osc':
          return 'f(x) = \\f{\\t{sin} x}{x}';
        case 'exp':
          return 'f(x) = 2^x';
        case 'xexp':
          return 'f(x) = x · 2^{−x}';
        case 'logi':
          return 'f(x) = \\f{2^x}{2^x + 1}';
        case 'poly':
          return `f(x) = ${N(0.1, 1)}x^3 − x`;
      }
    }
    /** Umformung, an der man das Grenzverhalten abliest. */
    function formSrc(k: FnKey): string | null {
      switch (k) {
        case 'inv':
          return '= 1 + \\f{1}{x}';
        case 'rat':
          return '= 2 + \\f{3}{x − 1}';
        case 'rat2':
          return '= 3 − \\f{2}{x^2 + 1}';
        case 'low':
          return `= \\f{\\f{2}{x}}{1 + \\f{1}{x^2}}   \\c{m}{\\t{${T2('(durch x² gekürzt)', '(divided by x²)')}}}`;
        case 'xexp':
          return '= \\f{x}{2^x}';
        case 'logi':
          return '= \\f{1}{1 + 2^{−x}}';
        case 'poly':
          return `= x^3 · (${N(0.1, 1)} − \\f{1}{x^2})`;
        default:
          return null;
      }
    }
    /** Begründung in einer Zeile (mit Ergebnis). */
    function whySrc(k: FnKey, d: Dir): string {
      const to = T2('für', 'as');
      switch (k) {
        case 'inv':
          return '\\f{1}{x} → 0   ⇒   f(x) → \\c{L}{1}';
        case 'rat':
          return '\\f{3}{x − 1} → 0   ⇒   f(x) → \\c{L}{2}';
        case 'rat2':
          return '\\f{2}{x^2 + 1} → 0   ⇒   f(x) → \\c{L}{3}';
        case 'low':
          return '\\f{2}{x} → 0,  \\f{1}{x^2} → 0   ⇒   f(x) → \\c{L}{0}';
        case 'osc':
          return '|f(x)| ≤ \\f{1}{|x|} → 0   ⇒   f(x) → \\c{L}{0}';
        case 'exp':
          return d < 0 ? `2^x = \\f{1}{2^{|x|}} → 0   ⇒   f(x) → \\c{L}{0}` : `2^x \\t{${T2('wächst über jede Schranke', 'exceeds every bound')}}`;
        case 'xexp':
          return d > 0 ? `\\t{${T2('2ˣ wächst schneller als x', '2ˣ grows faster than x')}}   ⇒   f(x) → \\c{L}{0}` : `x → −∞,  2^{−x} → +∞   ⇒   \\c{out}{f(x) → −∞}`;
        case 'logi':
          return d > 0 ? '2^{−x} → 0   ⇒   f(x) → \\f{1}{1 + 0} = \\c{L}{1}' : '2^x → 0   ⇒   f(x) → \\f{0}{0 + 1} = \\c{L}{0}';
        case 'poly':
          return `x^3 → ${d > 0 ? '+' : '−'}∞,  (…) → ${N(0.1, 1)}   ⇒   \\c{out}{f(x) → ${d > 0 ? '+' : '−'}∞}  \\c{m}{\\t{${to} x → ${d > 0 ? '+' : '−'}∞}}`;
      }
    }
    /** Zähler und Nenner (Gradregel). */
    const RATIO_SRC: Partial<Record<FnKey, [string, string]>> = {
      inv: ['x + 1', 'x'],
      rat: ['2x + 1', 'x − 1'],
      rat2: ['3x^2 + 1', 'x^2 + 1'],
      low: ['2x', 'x^2 + 1'],
    };

    /* ---------- Zeichenhilfen ---------- */
    type PillOpts = { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean; fill?: string };
    let placed: Rect[] = [];
    const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
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
      let bl = y + (box.asc - box.desc) / 2;
      if (opts.bounds) bl = clamp(bl, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: bl - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (opts.dry || a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)');
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
      box.draw(g, left, bl);
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
    function wOf(src: string, size: number, weight = 700): number {
      return formula(surface.g, src, fstyle(size, th().text, weight)).w;
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

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      reveal: number;
      t: number;
      labels: number;
      band: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, t: 1e9, labels: 1, band: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3400) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 200) / 1400)),
        t,
        band: ease.outBack(clamp01((t - 1100) / 700)),
        labels: ease.outCubic(clamp01((t - 1600) / 600)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1700),
      };
    }

    /* =====================================================================
     * Graph: Abtastung in Pixeln (Polstellen trennen, sin(x)/x innen fein)
     * ===================================================================== */
    type Pt = { x: number; px: number; py: number; v: number };
    function samplePieces(k: FnKey, x0: number, x1: number): Pt[][] {
      const f = FUNCS[k].f;
      const r = plot.rect;
      const lim = r.h * 3;
      const poles = FUNCS[k].poles.filter((q) => q > x0 && q < x1);
      const cuts = [x0, ...poles, x1];
      const out: Pt[][] = [];
      for (let s = 0; s < cuts.length - 1; s++) {
        let a = cuts[s]!;
        let b = cuts[s + 1]!;
        if (s > 0) a += (x1 - x0) * 1e-6;
        if (s < cuts.length - 2) b -= (x1 - x0) * 1e-6;
        if (!(b > a)) continue;
        const xs: number[] = [];
        const n = Math.round(clamp(Math.abs(plot.px(b) - plot.px(a)) * 1.1, 24, 1600));
        for (let i = 0; i <= n; i++) xs.push(a + ((b - a) * i) / n);
        // sin(x)/x: in der Nähe von 0 fein genug für die Schwingungen
        if (k === 'osc') {
          const lo = Math.max(a, -70);
          const hi = Math.min(b, 70);
          const step = Math.max(0.05, (hi - lo) / 2800);
          for (let x = lo; x < hi; x += step) xs.push(x);
          xs.sort((u, v) => u - v);
        }
        // nahe einer Polstelle zusätzlich fein abtasten
        for (const q of FUNCS[k].poles) {
          if (q >= a - 1 && q <= b + 1) {
            for (let j = 1; j <= 40; j++) {
              const dx = 0.5 ** (j / 3);
              if (q - dx > a && q - dx < b) xs.push(q - dx);
              if (q + dx > a && q + dx < b) xs.push(q + dx);
            }
            xs.sort((u, v) => u - v);
          }
        }
        const pts: Pt[] = [];
        for (const x of xs) {
          const v = f(x);
          pts.push({ x, px: plot.px(x), py: Number.isFinite(v) ? clamp(plot.py(v), r.y - lim, r.y + r.h + lim) : NaN, v });
        }
        out.push(pts);
      }
      return out;
    }
    function strokePieces(pieces: Pt[][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number; keep?: (q: Pt, r: Pt) => boolean } = {}): void {
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
          for (let i = 1; i < pts.length; i++) {
            const a0 = pts[i - 1]!;
            const q = pts[i]!;
            if (!Number.isFinite(a0.py) || !Number.isFinite(q.py) || (opts.keep && !opts.keep(a0, q))) {
              pen = false;
              continue;
            }
            if (!pen) g.moveTo(a0.px, a0.py);
            g.lineTo(q.px, q.py);
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
    /** Stück einer Kurve nur zwischen zwei x-Werten. */
    const between = (lo: number, hi: number) => (q: Pt, r: Pt) => Math.min(q.x, r.x) >= lo - 1e-12 && Math.max(q.x, r.x) <= hi + 1e-12;

    /* =====================================================================
     * Hauptbild
     * ===================================================================== */
    /** Lage von P in Pixeln (NaN bei Definitionslücke). */
    function pPos(): { x: number; v: number; px: number; py: number } {
      const x = xP();
      const v = fn(x);
      return { x, v, px: plot.px(x), py: Number.isFinite(v) ? plot.py(v) : NaN };
    }
    /** Pixel-Lage der Schlauchränder. */
    function bandPx(): { top: number; bot: number; mid: number } {
      return { top: plot.py(BM.v + EP.v), bot: plot.py(BM.v - EP.v), mid: plot.py(BM.v) };
    }
    const bandOn = () => kBand.v * kInfo.v;

    function drawBand(k: Intro): void {
      const a = bandOn() * k.band;
      if (a <= 0.01) return;
      const g = surface.g;
      const r = plot.rect;
      const theme = th();
      const cv = kConv.v;
      const bp = bandPx();
      const grow = Math.min(1, k.band);
      const top = lerp(bp.mid, bp.top, grow);
      const bot = lerp(bp.mid, bp.bot, grow);
      const hl = hover?.id === 'eT' || hover?.id === 'eB' || drag?.kind === 'edge';
      const hm = hover?.id === 'mid' || drag?.kind === 'mid';
      g.save();
      g.globalAlpha *= a;
      // leuchtendes Band: an den Rändern kräftiger
      const grad = g.createLinearGradient(0, top, 0, bot);
      const ea = theme.dark ? 0.3 : 0.2;
      const ma = theme.dark ? 0.1 : 0.06;
      const bc = cv > 0.5 ? col.L() : col.out();
      grad.addColorStop(0, withAlpha(bc, ea));
      grad.addColorStop(0.5, withAlpha(bc, ma + (hm ? 0.06 : 0)));
      grad.addColorStop(1, withAlpha(bc, ea));
      g.fillStyle = grad;
      g.fillRect(r.x, top, r.w, bot - top);
      // Bereich jenseits von x_ε: grün getönt, weich einlaufend
      if (cv > 0.01 && kXe.v > 0.01) {
        const px = plot.px(XE.v);
        const d = SD.v >= 0 ? 1 : -1;
        const x0 = clamp(px, r.x, r.x + r.w);
        const x1 = d > 0 ? r.x + r.w : r.x;
        if (Math.abs(x1 - x0) > 1) {
          const gg = g.createLinearGradient(x0, 0, x0 + d * 40, 0);
          gg.addColorStop(0, withAlpha(col.ok(), 0));
          gg.addColorStop(1, withAlpha(col.ok(), (theme.dark ? 0.2 : 0.13) * cv * kXe.v));
          g.fillStyle = gg;
          g.fillRect(Math.min(x0, x1), top, Math.abs(x1 - x0), bot - top);
        }
      }
      // Ränder mit leichtem Leuchten
      const edge = cv > 0.5 ? col.L() : col.out();
      g.save();
      g.shadowColor = withAlpha(edge, 0.7);
      g.shadowBlur = hl ? 10 : 6;
      g.strokeStyle = withAlpha(edge, hl ? 0.95 : 0.7);
      g.lineWidth = hl ? 2.2 : 1.5;
      g.beginPath();
      g.moveTo(r.x, Math.round(top) + 0.5);
      g.lineTo(r.x + r.w, Math.round(top) + 0.5);
      g.moveTo(r.x, Math.round(bot) + 0.5);
      g.lineTo(r.x + r.w, Math.round(bot) + 0.5);
      g.stroke();
      g.restore();
      // Probe-Schlauch: gestrichelte Mitte
      if (cv < 0.99) {
        g.save();
        g.globalAlpha *= 1 - cv;
        g.strokeStyle = withAlpha(col.out(), 0.75);
        g.setLineDash([6, 5]);
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(r.x, Math.round(bp.mid) + 0.5);
        g.lineTo(r.x + r.w, Math.round(bp.mid) + 0.5);
        g.stroke();
        g.restore();
      }
      // Griffe an den Rändern (kleine Pillen mit Pfeilen)
      if (editable() && k.labels > 0.5) {
        const gx = handleX();
        for (const y of [top, bot]) {
          g.save();
          g.fillStyle = theme.dark ? '#1c2533' : '#ffffff';
          g.strokeStyle = withAlpha(edge, hl ? 1 : 0.8);
          g.lineWidth = 1.5;
          roundRect(g, gx - 13, y - 6, 26, 12, 6);
          g.fill();
          g.stroke();
          g.fillStyle = withAlpha(edge, 0.9);
          for (const s of [-1, 1]) {
            g.beginPath();
            g.moveTo(gx - 3.5, y + s * 1.2);
            g.lineTo(gx + 3.5, y + s * 1.2);
            g.lineTo(gx, y + s * 4.2);
            g.closePath();
            g.fill();
          }
          g.restore();
        }
        placed.push({ x: gx - 16, y: top - 9, w: 32, h: 18 }, { x: gx - 16, y: bot - 9, w: 32, h: 18 });
      }
      // Maßpfeil ε am äußeren Rand
      const ex = SD.v >= 0 ? r.x + r.w - 26 : r.x + 26;
      if (Math.abs(bp.mid - top) > 16) {
        g.save();
        g.strokeStyle = th().bg;
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(ex, bp.mid);
        g.lineTo(ex, top);
        g.stroke();
        g.restore();
        arrowPx(ex, bp.mid - 1, ex, top + 1, edge, 1.8, 7, true);
      }
      g.restore();
      const epsLab = `\\c{${cv > 0.5 ? 'L' : 'out'}}{ε = ${cN('eps', p.eps, 2)}}`;
      const ty = Math.min(top, bp.mid) - 2;
      const lx = SD.v >= 0 ? ex - 10 : ex + 10;
      fpillFree(
        // schmaler Schlauch: Beschriftung über bzw. unter den Schlauch statt hinein
        (bot - top < 44
          ? [
              { x: lx, y: ty - 14, align: SD.v >= 0 ? 'right' : 'left' },
              { x: lx, y: bot + 16, align: SD.v >= 0 ? 'right' : 'left' },
            ]
          : [
              { x: lx, y: (top + bp.mid) / 2, align: SD.v >= 0 ? 'right' : 'left' },
              { x: lx, y: ty - 14, align: SD.v >= 0 ? 'right' : 'left' },
              { x: lx, y: bot + 16, align: SD.v >= 0 ? 'right' : 'left' },
            ]) as { x: number; y: number; align: 'left' | 'right' }[],
        epsLab,
        { size: fs(12, 11), alpha: a * k.labels, bounds: r, border: withAlpha(edge, 0.5) },
      );
    }
    /** x-Pixel der Griffe am Schlauchrand (innen, auf der Seite der Richtung). */
    function handleX(): number {
      const r = plot.rect;
      return SD.v >= 0 ? r.x + r.w * 0.58 : r.x + r.w * 0.42;
    }

    function drawAsymptotes(k: Intro): void {
      const g = surface.g;
      const r = plot.rect;
      const a = kInfo.v * kConv.v * k.panel;
      const d = SD.v >= 0 ? 1 : -1;
      // Asymptote der Richtung: gestrichelt, wächst von innen nach außen
      if (a > 0.01) {
        const y = plot.py(BM.v);
        const grow = Math.min(k.reveal, revealT !== null ? ease.inOutCubic(clamp01((frameNow - revealT) / 900)) : 1);
        const x0 = d > 0 ? r.x : r.x + r.w;
        const x1 = lerp(x0, d > 0 ? r.x + r.w : r.x, grow);
        g.save();
        g.globalAlpha *= a;
        g.strokeStyle = col.L();
        g.lineWidth = 2.2;
        g.setLineDash([9, 6]);
        g.beginPath();
        g.moveTo(x0, Math.round(y) + 0.5);
        g.lineTo(x1, Math.round(y) + 0.5);
        g.stroke();
        g.restore();
        const src = `\\c{L}{y = ${cN('L', BM.goal, 2)}}`;
        fpillFree(
          [
            { x: d > 0 ? r.x + r.w * 0.3 : r.x + r.w * 0.7, y: y - 17, align: 'center' },
            { x: d > 0 ? r.x + r.w * 0.3 : r.x + r.w * 0.7, y: y + 17, align: 'center' },
            { x: d > 0 ? r.x + r.w * 0.45 : r.x + r.w * 0.55, y: y - 17, align: 'center' },
          ],
          src,
          { size: fs(13, 12), alpha: a * k.labels, bounds: r, border: withAlpha(col.L(), 0.55) },
        );
      }
      // Asymptote auf der anderen Seite (falls anderer Grenzwert): blass
      const other = limitOf(key(), dir() > 0 ? -1 : 1);
      const ao = kInfo.v * k.labels * 0.6;
      if (Number.isFinite(other) && (!conv() || Math.abs(other - Lim()) > 1e-9) && ao > 0.01) {
        const y = plot.py(other);
        if (y > r.y + 4 && y < r.y + r.h - 4) {
          g.save();
          g.globalAlpha *= ao;
          g.strokeStyle = col.L();
          g.lineWidth = 1.4;
          g.setLineDash([3, 5]);
          g.beginPath();
          g.moveTo(r.x, Math.round(y) + 0.5);
          g.lineTo(r.x + r.w, Math.round(y) + 0.5);
          g.stroke();
          g.restore();
          fpillFree(
            [
              { x: d > 0 ? r.x + 12 : r.x + r.w - 12, y: y - 15, align: d > 0 ? 'left' : 'right' },
              { x: d > 0 ? r.x + 12 : r.x + r.w - 12, y: y + 15, align: d > 0 ? 'left' : 'right' },
            ],
            `\\c{L}{y = ${N(other, 2)}}  \\c{m}{\\t{(x → ${dir() > 0 ? '−' : '+'}∞)}}`,
            { size: fs(11.5, 11), alpha: ao, bounds: r },
          );
        }
      }
    }

    /** Einschachteln bei sin(x)/x: y = ±1/|x| gestrichelt. */
    function drawEnvelope(k: Intro): void {
      const a = (key() === 'osc' ? 1 : 0) * kInfo.v * k.labels * 0.9;
      if (a <= 0.01) return;
      const b = plot.bounds;
      for (const s of [1, -1]) {
        const pcs = samplePieces('inv', b.xMin, b.xMax).map((pts) =>
          pts.map((q) => {
            const v = s / Math.abs(q.x);
            return { ...q, v, py: Number.isFinite(v) ? clamp(plot.py(v), plot.rect.y - 600, plot.rect.y + plot.rect.h + 600) : NaN };
          }),
        );
        strokePieces(pcs, col.env(), 1.8, { dash: [5, 5], alpha: a });
      }
      const r = plot.rect;
      const xx = plot.bounds.xMax > 0 ? Math.min(plot.bounds.xMax * 0.5, 4) : Math.max(plot.bounds.xMin * 0.5, -4);
      const py = plot.py(1 / Math.abs(xx));
      fpillFree([{ x: plot.px(xx), y: py - 16, align: 'center' }], `\\c{e}{y = \\f{1}{|x|}}`, { size: fs(11.5, 11), alpha: a, bounds: r });
    }

    function drawGraph(now: number, k: Intro): void {
      const b = plot.bounds;
      const d = SD.v >= 0 ? 1 : -1;
      // vorheriger Graph blendet aus
      if (prevFn) {
        const t = clamp01((now - prevFn.t0) / 520);
        strokePieces(samplePieces(prevFn.k, b.xMin, b.xMax), col.f(), fs(3.4, 3), { alpha: 1 - t });
      }
      // neuer Graph zeichnet sich von innen nach außen
      let rv = k.reveal;
      if (fIn !== null) rv = Math.min(rv, ease.inOutCubic(clamp01((now - fIn) / 1100)));
      const lo = d > 0 ? b.xMin : lerp(b.xMax, b.xMin, rv);
      const hi = d > 0 ? lerp(b.xMin, b.xMax, rv) : b.xMax;
      const pcs = samplePieces(key(), lo, hi);
      strokePieces(pcs, col.f(), fs(3.4, 3), { glow: true });
      // Einfärben: jenseits von x_ε grün, davor außerhalb des Schlauchs rot
      const ka = bandOn() * k.labels * (rv >= 1 ? 1 : 0);
      if (ka > 0.01) {
        const mid = BM.v;
        const e = EP.v;
        const w = fs(3.6, 3.2);
        if (kConv.v > 0.01) {
          const xe = XE.v;
          const okSeg = (q: Pt, s: Pt) => d * q.x >= d * xe - 1e-9 && d * s.x >= d * xe - 1e-9 && Math.abs(q.v - mid) < e && Math.abs(s.v - mid) < e;
          const outSeg = (q: Pt, s: Pt) => d * q.x > 0 && d * s.x > 0 && d * q.x < d * xe && d * s.x < d * xe && Math.abs(q.v - mid) >= e && Math.abs(s.v - mid) >= e;
          strokePieces(pcs, col.ok(), w, { keep: okSeg, alpha: ka * kConv.v * kXe.v });
          strokePieces(pcs, col.out(), w, { keep: outSeg, alpha: ka * kConv.v * kXe.v });
        }
        if (kConv.v < 0.99) {
          const xl = XL.v;
          const has = Number.isFinite(xLeave());
          const outSeg = (q: Pt, s: Pt) => has && d * q.x >= d * xl && d * s.x >= d * xl;
          const inSeg = (q: Pt, s: Pt) => d * q.x > 0 && d * s.x > 0 && Math.abs(q.v - mid) < e && Math.abs(s.v - mid) < e;
          strokePieces(pcs, col.out(), w, { keep: outSeg, alpha: ka * (1 - kConv.v) });
          strokePieces(pcs, col.ok(), w, { keep: inSeg, alpha: ka * (1 - kConv.v) * 0.9 });
        }
      }
      // Erfolgsanimation: Leuchten läuft von x_ε nach außen
      if (okPulse !== null && kConv.v > 0.5 && ka > 0.01) {
        const t = (now - okPulse) / 1100;
        if (t < 1) {
          const xe = XE.v;
          const far = d > 0 ? b.xMax : b.xMin;
          const xc = lerp(xe, far, ease.outCubic(clamp01(t)));
          const wdt = Math.abs(far - xe) * 0.12 + 1e-9;
          strokePieces(pcs, mixColor(col.ok(), '#ffffff', 0.35), fs(7, 6), { keep: between(Math.min(xc - wdt, xc + wdt), Math.max(xc - wdt, xc + wdt)), alpha: (1 - t) * 0.8, glow: true });
        }
      }
    }

    /** Senkrechte Marke x_ε (bzw. Austrittsstelle beim Probe-Schlauch). */
    function drawXeMarker(k: Intro, now: number): void {
      const g = surface.g;
      const r = plot.rect;
      const a = bandOn() * k.labels;
      if (a <= 0.01) return;
      const d = SD.v >= 0 ? 1 : -1;
      const bp = bandPx();
      // Grenzwert: x_ε
      const ac = a * kConv.v * kXe.v;
      if (ac > 0.01) {
        const px = plot.px(XE.v);
        if (px > r.x - 2 && px < r.x + r.w + 2) {
          g.save();
          g.globalAlpha *= ac;
          g.strokeStyle = col.ok();
          g.lineWidth = 2;
          g.setLineDash([6, 4]);
          g.beginPath();
          g.moveTo(Math.round(px) + 0.5, r.y);
          g.lineTo(Math.round(px) + 0.5, r.y + r.h);
          g.stroke();
          g.setLineDash([]);
          // „ab hier“-Pfeil in der Mitte des Schlauchs
          const ay = bp.mid;
          g.save();
          g.strokeStyle = th().bg;
          g.lineWidth = 6;
          g.beginPath();
          g.moveTo(px, ay);
          g.lineTo(px + d * 34, ay);
          g.stroke();
          g.restore();
          arrowPx(px, ay, px + d * 34, ay, col.ok(), 2.4, 8);
          g.restore();
          // letzte Verletzung: Punkt am Schlauchrand
          const v = fn(XE.v);
          if (Number.isFinite(v)) {
            const py = plot.py(v);
            if (py > r.y && py < r.y + r.h) dot(px, py, col.out(), 4.5, ac, true);
          }
          placed.push({ x: px - 3, y: r.y, w: 6, h: r.h });
          const xe = xEps();
          const src = `\\c{ok}{x_ε ${eqS(xe, 2)} ${cN('xe', xe, 2)}}`;
          fpillFree(
            [
              { x: px + d * 8, y: r.y + r.h - 34, align: d > 0 ? 'left' : 'right' },
              { x: px - d * 8, y: r.y + r.h - 34, align: d > 0 ? 'right' : 'left' },
              { x: px + d * 8, y: r.y + 48, align: d > 0 ? 'left' : 'right' },
            ],
            src,
            { size: fs(13, 12), alpha: ac, bounds: r, border: withAlpha(col.ok(), 0.6) },
          );
        }
      }
      // Erfolgsmeldung
      if (okPulse !== null && kConv.v > 0.5) {
        const t = (now - okPulse) / 2600;
        if (t < 1) {
          const s = ease.outBack(clamp01(t * 5));
          const al = clamp01(t * 6) * clamp01((1 - t) * 4) * a;
          const px = clamp(plot.px(XE.v), r.x, r.x + r.w);
          const xe = xEps();
          const msg = Number.isFinite(xe)
            ? `\\c{ok}{✓ \\t{${T2('ab', 'for')}} x ${rel()} ${N(xe, 2)} \\t{${T2('bleibt der Graph im Schlauch', 'the graph stays in the strip')}}}`
            : `\\c{ok}{✓ \\t{${T2('Der ganze Graph liegt im Schlauch', 'The whole graph lies in the strip')}}}`;
          const yy = (bp.top < r.y + r.h / 2 ? bp.bot + 34 : bp.top - 34) + (1 - s) * 10;
          fpill(px + d * 40, yy, msg, { align: d > 0 ? 'left' : 'right', size: fs(12.5, 11.5), alpha: al, bounds: r, border: withAlpha(col.ok(), 0.7) });
        }
      }
      // ohne Grenzwert: Austrittsstelle des Probe-Schlauchs
      // dünner Probe-Schlauch (weit herausgezoomt): Beschriftungen ausblenden
      const ad = a * (1 - kConv.v) * clamp01((bp.bot - bp.top - 4) / 10);
      if (ad > 0.01) {
        const xl = xLeave();
        if (Number.isFinite(xl)) {
          const px = plot.px(XL.v);
          const v = fn(XL.v);
          const py = plot.py(v);
          if (px > r.x && px < r.x + r.w && py > r.y && py < r.y + r.h) {
            halo(px, py, col.out(), 22, ad);
            g.save();
            g.globalAlpha *= ad;
            g.strokeStyle = col.out();
            g.lineWidth = 2.6;
            g.lineCap = 'round';
            g.beginPath();
            g.moveTo(px - 6, py - 6);
            g.lineTo(px + 6, py + 6);
            g.moveTo(px + 6, py - 6);
            g.lineTo(px - 6, py + 6);
            g.stroke();
            g.restore();
            placed.push({ x: px - 10, y: py - 10, w: 20, h: 20 });
            fpillFree(
              [
                { x: px + d * 12, y: py + 22, align: d > 0 ? 'left' : 'right' },
                { x: px - d * 12, y: py - 22, align: d > 0 ? 'right' : 'left' },
                { x: px + d * 12, y: py - 24, align: d > 0 ? 'left' : 'right' },
              ],
              `\\c{out}{\\t{${T2('verlässt den Schlauch', 'leaves the strip')}}: x ≈ ${cN('xl', xl, 2)}}`,
              { size: fs(12, 11), alpha: ad, bounds: r, border: withAlpha(col.out(), 0.6) },
            );
          }
        }
        // vermuteter Grenzwert
        const src = `\\c{out}{L = ${cN('c', p.c, 1)} ?}`;
        fpillFree(
          [
            { x: d > 0 ? r.x + r.w * 0.3 : r.x + r.w * 0.7, y: bp.top - 16, align: 'center' },
            { x: d > 0 ? r.x + r.w * 0.3 : r.x + r.w * 0.7, y: bp.bot + 16, align: 'center' },
            { x: d > 0 ? r.x + r.w * 0.62 : r.x + r.w * 0.38, y: bp.top - 16, align: 'center' },
            { x: d > 0 ? r.x + r.w * 0.62 : r.x + r.w * 0.38, y: bp.bot + 16, align: 'center' },
          ],
          src,
          { size: fs(12.5, 11.5), alpha: ad, bounds: r, border: withAlpha(col.out(), 0.55) },
        );
      }
    }

    /** Ohne Grenzwert: Schranken S = 10, 100, … werden beim Lauf überschritten. */
    function drawLevels(k: Intro): void {
      const a = kInfo.v * (1 - kConv.v) * k.labels;
      if (a <= 0.01 || conv()) return;
      const g = surface.g;
      const r = plot.rect;
      const P = pPos();
      const s = Math.sign(Lim());
      const levels: number[] = [];
      for (let e = 1; e <= 12; e++) {
        const S = s * 10 ** e;
        if (s * P.v >= s * S) levels.push(S);
      }
      const show = levels.slice(-2);
      show.forEach((S, i) => {
        const py = plot.py(S);
        if (py < r.y + 8 || py > r.y + r.h - 8) return;
        const al = a * (i === show.length - 1 ? 1 : 0.6);
        g.save();
        g.globalAlpha *= al;
        g.strokeStyle = withAlpha(th().text, 0.45);
        g.lineWidth = 1.2;
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(r.x, Math.round(py) + 0.5);
        g.lineTo(r.x + r.w, Math.round(py) + 0.5);
        g.stroke();
        g.restore();
        const xs = exceedOf(key(), dir(), S);
        const d = dir();
        fpillFree(
          [
            { x: d > 0 ? r.x + 14 : r.x + r.w - 14, y: py - 14, align: d > 0 ? 'left' : 'right' },
            { x: d > 0 ? r.x + 14 : r.x + r.w - 14, y: py + 14, align: d > 0 ? 'left' : 'right' },
          ],
          `f(x) ${s > 0 ? '>' : '<'} ${big(S)}  \\c{m}{\\t{${T2('für', 'for')}} x ${rel()} ${big(xs, 2)}}`,
          { size: fs(11.5, 11), alpha: al, bounds: r },
        );
      });
    }

    /** Punkt P mit Maßpfeil zur Asymptote. */
    function drawP(k: Intro, now: number): void {
      const g = surface.g;
      const r = plot.rect;
      const P = pPos();
      if (!Number.isFinite(P.py)) return;
      const a = k.labels;
      if (a <= 0.01) return;
      const px = P.px;
      const py = clamp(P.py, r.y + 4, r.y + r.h - 4);
      if (px < r.x - 2 || px > r.x + r.w + 2) return;
      const d = SD.v >= 0 ? 1 : -1;
      const showD = kInfo.v * kConv.v;
      const active = engaged || drag?.kind === 'P' || hover?.id === 'P' || U.v > 1e-6;
      // Maßpfeil |f(x) − L|
      const ly = plot.py(BM.v);
      if (showD > 0.01 && active && Math.abs(ly - py) > 3) {
        g.save();
        g.globalAlpha *= showD * a;
        g.strokeStyle = th().bg;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(px, ly);
        g.lineTo(px, py);
        g.stroke();
        arrowPx(px, ly, px, py, col.P(), 2.2, Math.min(8, Math.abs(ly - py) * 0.4), true);
        g.restore();
      }
      const hl = hover?.id === 'P' || drag?.kind === 'P';
      halo(px, py, col.P(), hl ? 26 : 18, a * (hl ? 1 : 0.7));
      dot(px, py, col.P(), fs(7, 6.5) * (hl ? 1.12 : 1), a);
      placed.push({ x: px - 12, y: py - 12, w: 24, h: 24 });
      if (!active) {
        // Ruhe: kleiner Hinweis „P ziehen“
        fpillFree(
          [
            { x: px + d * 14, y: py - 18, align: d > 0 ? 'left' : 'right' },
            { x: px + d * 14, y: py + 18, align: d > 0 ? 'left' : 'right' },
          ],
          `\\c{P}{P}`,
          { size: fs(12.5, 12), alpha: a, bounds: r, border: withAlpha(col.P(), 0.5) },
        );
        return;
      }
      const yv = P.v;
      const dist = Math.abs(yv - BM.goal);
      const ok = dist < p.eps;
      const lines: string[] = [`\\c{P}{P(${xLab(P.x)} | ${valNear(yv)})}`];
      if (showD > 0.5) lines.push(`\\c{${p.band ? (ok ? 'ok' : 'out') : 'P'}}{|f(x) − ${N(BM.goal, 2)}| ${dist === 0 ? '=' : '≈'} ${small(cnt('pd', dist))}}`);
      const above = py < ly;
      const sz = fs(12.5, 11.5);
      const yA = above ? py - 22 : py + 22;
      fpillFree(
        [
          { x: px - d * 14, y: yA, align: d > 0 ? 'right' : 'left' },
          { x: px - d * 14, y: above ? py + 22 : py - 22, align: d > 0 ? 'right' : 'left' },
          { x: px - d * 14, y: above ? yA - 30 : yA + 30, align: d > 0 ? 'right' : 'left' },
        ],
        lines[0]!,
        { size: sz, alpha: a, bounds: r, border: withAlpha(col.P(), 0.55) },
      );
      if (lines[1]) {
        const mid = (ly + py) / 2;
        fpillFree(
          [
            { x: px - d * 12, y: Math.abs(ly - py) > 30 ? mid : (above ? ly + 20 : ly - 20), align: d > 0 ? 'right' : 'left' },
            { x: px - d * 12, y: above ? ly + 22 : ly - 22, align: d > 0 ? 'right' : 'left' },
            { x: px - d * 12, y: above ? ly + 50 : ly - 50, align: d > 0 ? 'right' : 'left' },
          ],
          lines[1],
          { size: sz, alpha: a * showD, bounds: r, border: withAlpha(p.band ? (ok ? col.ok() : col.out()) : col.P(), 0.55) },
        );
      }
      // Ende des Laufs: Grenzwert-Pille
      if (finishT !== null) {
        const t = (now - finishT) / 2800;
        if (t < 1) {
          const s = ease.outBack(clamp01(t * 4));
          const al = clamp01(t * 6) * clamp01((1 - t) * 3);
          const src = conv()
            ? kInfo.v > 0.5
              ? `\\t{lim}_{x → ${dS()}∞} f(x) = \\c{L}{${N(Lim(), 2)}}`
              : `\\t{lim}_{x → ${dS()}∞} f(x) = \\c{L}{?}`
            : kInfo.v > 0.5
              ? `\\c{out}{f(x) → ${Lim() > 0 ? '+' : '−'}∞}`
              : `\\t{lim}_{x → ${dS()}∞} f(x) = ?`;
          fpillFree(
            [
              { x: r.x + r.w / 2, y: r.y + 44 + (1 - s) * 12, align: 'center' },
              { x: r.x + r.w / 2, y: r.y + r.h * 0.62 + (1 - s) * 12, align: 'center' },
              { x: r.x + r.w * 0.3, y: r.y + r.h - 70 + (1 - s) * 12, align: 'center' },
            ],
            src,
            { size: fs(16, 14), alpha: al, bounds: r, border: withAlpha(conv() ? col.L() : col.out(), 0.7) },
          );
        }
      }
    }

    /** Lupe: Der winzige Abstand zur Asymptote, in y-Richtung stark vergrößert. */
    function drawLens(k: Intro): void {
      const r = plot.rect;
      if (!conv() || r.w < 380 || r.h < 220) return;
      const P = pPos();
      const ly = plot.py(BM.v);
      const dpx = Math.abs(P.py - ly);
      const dist = Math.abs(P.v - Lim());
      const want = kInfo.v * k.labels * (engaged || drag?.kind === 'P' ? 1 : 0) * clamp01((14 - dpx) / 6) * (dist > 0 ? 1 : 0);
      if (want <= 0.01 || !Number.isFinite(P.py)) return;
      const g = surface.g;
      const R = clamp(Math.min(r.w, r.h) * 0.15, 42, 66);
      const d = SD.v >= 0 ? 1 : -1;
      const cx = clamp(P.px - d * (R + 40), r.x + R + 14, r.x + r.w - R - 14);
      const upper = ly > r.y + r.h * 0.5;
      const cy = upper ? r.y + R + fs(36, 30) : r.y + r.h - R - 40;
      // Vergrößerung: Abstand füllt etwa die halbe Lupe
      const yh = dist * 2.2;
      const xw = Math.abs(P.x) * 0.5;
      const X = (x: number) => cx + ((x - P.x) / xw) * R * 0.9;
      const Y = (y: number) => cy - ((y - Lim()) / yh) * R * 0.85;
      const mag = (R * 0.85) / yh / Math.max(1e-12, plot.scale.y);
      g.save();
      g.globalAlpha *= want;
      // Verbindung
      g.save();
      g.strokeStyle = withAlpha(col.P(), 0.7);
      g.lineWidth = 1.3;
      g.setLineDash([3, 4]);
      const ang = Math.atan2(P.py - cy, P.px - cx);
      g.beginPath();
      g.moveTo(cx + Math.cos(ang) * R, cy + Math.sin(ang) * R);
      g.lineTo(P.px - Math.cos(ang) * 12, P.py - Math.sin(ang) * 12);
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
      // Schlauch in der Lupe (falls sichtbar)
      if (p.band && p.eps < yh * 1.2) {
        g.fillStyle = withAlpha(col.L(), th().dark ? 0.16 : 0.1);
        const t0 = Y(Lim() + p.eps);
        const t1 = Y(Lim() - p.eps);
        g.fillRect(cx - R, t0, 2 * R, t1 - t0);
      } else if (p.band) {
        g.fillStyle = withAlpha(col.ok(), th().dark ? 0.12 : 0.07);
        g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      }
      // Asymptote
      g.strokeStyle = col.L();
      g.lineWidth = 1.8;
      g.setLineDash([6, 4]);
      g.beginPath();
      g.moveTo(cx - R, cy);
      g.lineTo(cx + R, cy);
      g.stroke();
      g.setLineDash([]);
      // Graph
      g.strokeStyle = col.f();
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      for (let i = 0; i <= 60; i++) {
        const x = P.x - xw * 1.2 + (2.4 * xw * i) / 60;
        const v = fn(x);
        const yy = clamp(Y(v), cy - 3 * R, cy + 3 * R);
        if (i) g.lineTo(X(x), yy);
        else g.moveTo(X(x), yy);
      }
      g.stroke();
      // Abstand
      const pY = Y(P.v);
      arrowPx(cx, cy, cx, pY, col.P(), 2, 6, true);
      dot(cx, pY, col.P(), 4.5, 1);
      const gl = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      gl.addColorStop(0, withAlpha('#ffffff', th().dark ? 0.1 : 0.35));
      gl.addColorStop(0.45, withAlpha('#ffffff', 0));
      g.fillStyle = gl;
      g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      g.restore();
      g.strokeStyle = col.P();
      g.lineWidth = 2.6;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      g.restore();
      placed.push({ x: cx - R - 4, y: cy - R - 14, w: 2 * R + 8, h: 2 * R + 44 });
      const e = Math.floor(Math.log10(Math.max(1, mag)));
      const mtxt = e >= 1 ? `10${supNum(e)}` : N(mag, 0);
      fpill(cx, cy + R + 15, `\\t{${T2('Lupe', 'magnifier')}}: \\t{y} × ${mtxt}`, { size: 11, alpha: want, bounds: r, color: th().muted, border: withAlpha(col.P(), 0.45) });
    }

    /** Wert ablesen unter dem Mauszeiger (bzw. Finger). */
    function drawHover(k: Intro): void {
      const hb = (hover?.id === 'plot' && !drag) || drag?.kind === 'look' ? hover : null;
      if (!hb || k.t < 1e8) return;
      const g = surface.g;
      const r = plot.rect;
      const [wx] = plot.toWorld(hb.px, hb.py);
      const v = fn(wx);
      if (!Number.isFinite(v)) return;
      const px = plot.px(wx);
      const py = plot.py(v);
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
      let src = `\\c{f}{f(${xLab(wx)}) ≈ ${val(v)}}`;
      if (kInfo.v > 0.5 && conv()) {
        const dist = Math.abs(v - Lim());
        const inside = dist < p.eps;
        src += `   \\c{${p.band ? (inside ? 'ok' : 'out') : 'm'}}{|f(x) − ${N(Lim(), 2)}| ≈ ${small(dist)}}`;
      }
      const right = px < r.x + r.w * 0.55;
      fpill(px + (right ? 12 : -12), clamp(py, r.y + 30, r.y + r.h - 18) - 22, src, { align: right ? 'left' : 'right', size: fs(12, 11), bounds: r, border: withAlpha(col.f(), 0.5) });
    }

    function drawPlot(now: number, k: Intro): void {
      const V = view();
      plot.setRangePadded(V.x, V.y, PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      placed = [];
      // P vormerken, damit Beschriftungen dem Punkt ausweichen
      const P0 = pPos();
      if (Number.isFinite(P0.py)) placed.push({ x: P0.px - 14, y: P0.py - 14, w: 28, h: 28 });
      drawBand(k);
      drawEnvelope(k);
      drawAsymptotes(k);
      drawGraph(now, k);
      drawXeMarker(k, now);
      drawLevels(k);
      drawLens(k);
      drawP(k, now);
      drawHover(k);
      // leerer Zustand „verdeckt“: Hinweis oben
      if (kInfo.v < 0.5 && k.labels > 0.5) {
        const r = plot.rect;
        fpill(r.x + r.w / 2, r.y + 18, `\\t{${T2('Gegen welchen Wert strebt f(x)? Lass P nach außen laufen.', 'Which value does f(x) approach? Let P run outwards.')}}`, {
          size: fs(12, 11),
          alpha: (1 - 2 * kInfo.v) * k.labels,
          bounds: r,
          color: th().muted,
        });
      }
      plot.end();
    }

    /* =====================================================================
     * Zeitleiste mit logarithmischer x-Achse
     * ===================================================================== */
    /** Lage auf der Zeitleiste (0 … 1) zu |x| (logarithmisch, Knoten = Tabellenstellen). */
    function stripU(absx: number): number {
      const xs = tableXs(key());
      const a = xs[0]!;
      const b = xs[xs.length - 1]!;
      return clamp01(Math.log(Math.max(a, absx) / a) / Math.log(b / a));
    }
    const stripX = (s: number) => {
      const xs = tableXs(key());
      return xs[0]! * (xs[xs.length - 1]! / xs[0]!) ** s;
    };
    function stripGeom(T: Rect): { box: Rect; play: { x: number; y: number; r: number }; x0: number; x1: number; ty: number; top: number } {
      const box = { x: T.x + 2, y: T.y, w: T.w - 4, h: T.h };
      const play = { x: box.x + 26, y: box.y + box.h / 2, r: 16 };
      const x0 = box.x + 62;
      const x1 = box.x + box.w - 28;
      const ty = box.y + box.h - 24;
      return { box, play, x0, x1, ty, top: box.y + 9 };
    }
    function drawStrip(T: Rect, k: Intro): void {
      if (T.h < 30) return;
      const g = surface.g;
      const theme = th();
      const G = stripGeom(T);
      g.save();
      g.globalAlpha *= k.panel;
      // Hintergrund
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, G.box.x, G.box.y, G.box.w, G.box.h, 16);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, G.box.x + 0.5, G.box.y + 0.5, G.box.w - 1, G.box.h - 1, 16);
      g.stroke();
      // Abspielknopf
      const playing = ctx.clock.playing;
      const hp = hover?.id === 'play';
      const pc = col.P();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : withAlpha(pc, 0.4);
      g.shadowBlur = hp ? 10 : 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createLinearGradient(0, G.play.y - G.play.r, 0, G.play.y + G.play.r);
      grad.addColorStop(0, mixColor(pc, '#ffffff', hp ? 0.3 : 0.18));
      grad.addColorStop(1, pc);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(G.play.x, G.play.y, G.play.r * (hp ? 1.06 : 1), 0, TAU);
      g.fill();
      g.restore();
      g.fillStyle = '#ffffff';
      if (playing) {
        g.fillRect(G.play.x - 5, G.play.y - 6, 3.5, 12);
        g.fillRect(G.play.x + 1.5, G.play.y - 6, 3.5, 12);
      } else {
        g.beginPath();
        g.moveTo(G.play.x - 4, G.play.y - 7);
        g.lineTo(G.play.x + 7, G.play.y);
        g.lineTo(G.play.x - 4, G.play.y + 7);
        g.closePath();
        g.fill();
      }
      const d = dir();
      const xs = tableXs(key());
      const X = (s: number) => lerp(G.x0, G.x1, s);
      const sP = stripU(Math.abs(xP()));
      // Kurve über der Achse: Abstand zur Asymptote im Verhältnis zu ε (bzw. |f| logarithmisch)
      const cTop = G.top;
      const cBot = G.ty - 9;
      const ch = cBot - cTop;
      const ka = kInfo.v * k.labels;
      if (ka > 0.01 && ch > 14) {
        g.save();
        g.globalAlpha *= ka;
        const n = 140;
        const pts: [number, number, number][] = [];
        if (conv()) {
          const e = p.band ? p.eps : Math.max(1e-9, Math.abs(fn(d * xs[0]!) - Lim()) || 1);
          for (let i = 0; i <= n; i++) {
            const s = i / n;
            const dd = Math.abs(fn(d * stripX(s)) - Lim());
            const q = Number.isFinite(dd) ? clamp(dd / e, 0, 1.6) / 1.6 : 1;
            pts.push([X(s), cBot - q * ch, dd]);
          }
          // ε-Linie
          if (p.band) {
            const ey = cBot - ch / 1.6;
            g.save();
            g.strokeStyle = withAlpha(col.L(), 0.8);
            g.setLineDash([4, 3]);
            g.lineWidth = 1.2;
            g.beginPath();
            g.moveTo(G.x0, Math.round(ey) + 0.5);
            g.lineTo(G.x1, Math.round(ey) + 0.5);
            g.stroke();
            g.restore();
            g.font = `italic 700 11px ${theme.mathFont}`;
            g.fillStyle = col.L();
            g.textAlign = 'right';
            g.textBaseline = 'middle';
            g.fillText('ε', G.x0 - 6, ey);
          }
          // Fläche unter der Kurve: grün im Schlauch, rot außerhalb
          for (let i = 0; i < n; i++) {
            const [ax, ay, ad] = pts[i]!;
            const [bx, by] = pts[i + 1]!;
            const inside = p.band ? ad < p.eps : true;
            g.fillStyle = withAlpha(inside ? col.ok() : col.out(), theme.dark ? 0.32 : 0.22);
            g.beginPath();
            g.moveTo(ax, cBot);
            g.lineTo(ax, ay);
            g.lineTo(bx, by);
            g.lineTo(bx, cBot);
            g.closePath();
            g.fill();
          }
          g.strokeStyle = col.f();
          g.lineWidth = 1.8;
          g.beginPath();
          pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
          g.font = `600 11px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'right';
          g.textBaseline = 'top';
          g.fillText(`|f(x) − ${N(Lim(), 2)}|`, G.x1, cTop - 3);
        } else {
          let mx = 1;
          for (let i = 0; i <= n; i++) mx = Math.max(mx, Math.abs(fn(d * stripX(i / n))));
          for (let i = 0; i <= n; i++) {
            const s = i / n;
            const v = fn(d * stripX(s));
            const q = Math.log10(1 + Math.abs(v)) / Math.log10(1 + mx);
            pts.push([X(s), cBot - q * ch, v]);
          }
          g.strokeStyle = col.out();
          g.lineWidth = 2;
          g.beginPath();
          pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.stroke();
          g.font = `600 11px ${theme.font}`;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'top';
          g.fillText(T2('|f(x)| (logarithmisch)', '|f(x)| (logarithmic)'), G.x0 + 4, cTop - 3);
        }
        // x_ε auf der Zeitleiste
        if (conv() && p.band) {
          const xe = xEps();
          if (Number.isFinite(xe) && Math.abs(xe) >= xs[0]!) {
            const sx = X(stripU(Math.abs(XE.v)));
            g.strokeStyle = col.ok();
            g.lineWidth = 1.6;
            g.setLineDash([3, 3]);
            g.beginPath();
            g.moveTo(Math.round(sx) + 0.5, cTop);
            g.lineTo(Math.round(sx) + 0.5, G.ty);
            g.stroke();
            g.setLineDash([]);
          }
        }
        g.restore();
      }
      // Spur
      g.lineCap = 'round';
      g.strokeStyle = withAlpha(theme.text, theme.dark ? 0.22 : 0.14);
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(G.x0, G.ty);
      g.lineTo(G.x1, G.ty);
      g.stroke();
      if (sP > 0.001) {
        g.strokeStyle = col.P();
        g.beginPath();
        g.moveTo(G.x0, G.ty);
        g.lineTo(X(sP), G.ty);
        g.stroke();
      }
      // Knoten = Tabellenstellen
      xs.forEach((ax, i) => {
        const sx = X(stripU(ax));
        const reached = sP >= stripU(ax) - 1e-6;
        const hl = hover?.id === `n${i}`;
        const rr = (hl ? 6.2 : 5.2) * (reached ? 1 : 0.9);
        g.save();
        g.fillStyle = reached ? col.P() : theme.dark ? '#1c2533' : '#ffffff';
        g.strokeStyle = reached ? theme.bg : withAlpha(col.P(), 0.8);
        g.lineWidth = 1.8;
        g.beginPath();
        g.arc(sx, G.ty, rr, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        g.font = `${reached ? 700 : 600} 11px ${theme.font}`;
        g.fillStyle = reached ? theme.text : theme.muted;
        g.textAlign = i === 0 ? 'left' : i === xs.length - 1 ? 'right' : 'center';
        g.textBaseline = 'top';
        g.fillText(xLab(d * ax), sx + (i === 0 ? -4 : i === xs.length - 1 ? 4 : 0), G.ty + 8);
      });
      // Regler-Knopf an der Stelle von P
      const kx = X(sP);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 5;
      g.fillStyle = theme.dark ? '#e6edf6' : '#ffffff';
      g.beginPath();
      g.arc(kx, G.ty, 7.5, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = col.P();
      g.lineWidth = 2.6;
      g.beginPath();
      g.arc(kx, G.ty, 7.5, 0, TAU);
      g.stroke();
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    const infoShown = () => kInfo.v >= 0.5;
    const infoAlpha = () => Math.abs(2 * kInfo.v - 1);

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string, alpha = 1, dashed = false): number {
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

    /** Karte 1: Funktion, Umformung, Grenzwert-Schreibweise. */
    function termCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const kk = key();
        const d = dir();
        const rows: RowSpec[] = [{ src: termSrc(kk), size: fs(15, 13.5), weight: 650, gap: 6 }];
        if (infoShown()) {
          const form = formSrc(kk);
          if (form && !compact) rows.push({ src: form, size: fs(13.5, 12.5), gap: 8 });
          if (conv()) {
            rows.push({ src: `\\t{lim}_{x → ${dS()}∞} f(x) = \\c{L}{${cN('lim', Lim(), 2)}}`, size: fs(16, 14.5), weight: 700, gap: 6, hl: col.L() });
            if (!compact) rows.push({ src: whySrc(kk, d), size: fs(12.5, 11.5), color: th().text, gap: 7 });
            const side = sideOf(kk, d);
            const sideTxt =
              side === 'above'
                ? T2(`Waagrechte Asymptote y = ${N(Lim(), 2)}; der Graph nähert sich von oben (f(x) > ${N(Lim(), 2)}).`, `Horizontal asymptote y = ${N(Lim(), 2)}; the graph approaches from above (f(x) > ${N(Lim(), 2)}).`)
                : side === 'below'
                  ? T2(`Waagrechte Asymptote y = ${N(Lim(), 2)}; der Graph nähert sich von unten (f(x) < ${N(Lim(), 2)}).`, `Horizontal asymptote y = ${N(Lim(), 2)}; the graph approaches from below (f(x) < ${N(Lim(), 2)}).`)
                  : T2(`Waagrechte Asymptote y = ${N(Lim(), 2)}. Der Graph schwingt um sie herum und schneidet sie immer wieder – das darf er.`, `Horizontal asymptote y = ${N(Lim(), 2)}. The graph oscillates around it and crosses it again and again – that is allowed.`);
            rows.push(noteRow(sideTxt, fs(12, 11), th().text));
          } else {
            rows.push({ src: `\\c{out}{f(x) → ${Lim() > 0 ? '+' : '−'}∞}  \\t{${T2('für', 'as')}}  x → ${dS()}∞`, size: fs(16, 14.5), weight: 700, gap: 6, hl: col.out() });
            if (!compact) rows.push({ src: whySrc(kk, d), size: fs(12.5, 11.5), gap: 7 });
            rows.push(noteRow(T2(`Kein Grenzwert: f(x) ${Lim() > 0 ? 'wächst über' : 'fällt unter'} jede Schranke (bestimmt divergent), keine waagrechte Asymptote.`, `No limit: f(x) ${Lim() > 0 ? 'exceeds' : 'falls below'} every bound (diverges to ${Lim() > 0 ? '+' : '−'}∞), no horizontal asymptote.`), fs(12, 11), th().text));
          }
        } else {
          rows.push({ src: `\\t{lim}_{x → ${dS()}∞} f(x) = \\c{m}{?}`, size: fs(16, 14.5), weight: 700, gap: 8 });
          rows.push(noteRow(T2('Gibt es einen Grenzwert – und wenn ja, welchen? Lass P nach außen laufen und lies die Wertetabelle ab. „Grenzwert aufdecken“ löst auf.', 'Is there a limit – and if so, which one? Let P run outwards and read the table. “Reveal the limit” shows the answer.'), fs(12.5, 11.5)));
        }
        const right = `\\c{f}{x → ${dS()}∞}`;
        return formulaCard(R, measure, k, T2('Funktion und Grenzwert', 'Function and limit'), col.f(), rows, right, infoAlpha());
      };
    }

    /** Karte 2: ε-Schlauch mit Rechnung für x_ε (bzw. Probe-Schlauch ohne Grenzwert). */
    function epsCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        if (!infoShown()) {
          const rows = [noteRow(T2('Der ε-Schlauch und die Stelle x_ε erscheinen, wenn der Grenzwert aufgedeckt ist.', 'The ε-strip and the position x_ε appear once the limit is revealed.'), fs(12.5, 11.5))];
          return formulaCard(R, measure, k, T2('ε-Schlauch', 'ε-strip'), th().muted, rows, '\\c{m}{?}', infoAlpha(), true);
        }
        const kk = key();
        const d = dir();
        const E = N(p.eps, 2);
        const rows: RowSpec[] = [];
        if (conv()) {
          const Ls = N(Lim(), 2);
          const xe = xEps();
          const steps: string[] = [];
          let numeric = false;
          switch (kk) {
            case 'inv':
              steps.push(`|f(x) − 1| = \\f{1}{|x|} < ${E}`, `⇔  |x| > \\f{1}{${E}} = ${N(1 / p.eps, 2)}`);
              break;
            case 'rat':
              if (d > 0) steps.push(`|f(x) − 2| = \\f{3}{x − 1} < ${E}  \\c{m}{(x > 1)}`, `⇔  x − 1 > \\f{3}{${E}} = ${N(3 / p.eps, 2)}`);
              else steps.push(`|f(x) − 2| = \\f{3}{1 − x} < ${E}  \\c{m}{(x < 1)}`, `⇔  1 − x > \\f{3}{${E}} = ${N(3 / p.eps, 2)}`);
              break;
            case 'rat2':
              steps.push(`|f(x) − 3| = \\f{2}{x^2 + 1} < ${E}`, `⇔  x^2 + 1 > \\f{2}{${E}} = ${N(2 / p.eps, 2)}`, `⇔  |x| > \\r{${N(2 / p.eps - 1, 2)}}`);
              break;
            case 'low':
              steps.push(`|f(x)| = \\f{2|x|}{x^2 + 1} < ${E}`, `⇔  ${E}x^2 − 2|x| + ${E} > 0`, `⇔  |x| > \\f{1 + \\r{1 − ${E}^2}}{${E}}`);
              break;
            case 'osc':
              steps.push(`|f(x)| ≤ \\f{1}{|x|} < ${E}  ⇔  |x| > ${N(boundThreshold(p.eps), 2)}`, `\\c{m}{\\t{${T2('sicher ab', 'certainly from')}} |x| = ${N(boundThreshold(p.eps), 2)}, \\t{${T2('genau: numerisch', 'exactly: numerically')}}}`);
              numeric = true;
              break;
            case 'exp':
              steps.push(`|f(x) − 0| = 2^x < ${E}`, `⇔  x < \\t{log}_2 ${E}`);
              break;
            case 'xexp':
              steps.push(`|f(x)| = \\f{x}{2^x} < ${E}`, `\\c{m}{\\t{${T2('nicht nach x auflösbar – numerisch gelöst', 'cannot be solved for x – solved numerically')}}}`);
              numeric = true;
              break;
            case 'logi':
              if (d > 0) steps.push(`|f(x) − 1| = \\f{1}{2^x + 1} < ${E}`, `⇔  2^x > \\f{1}{${E}} − 1 = ${N(1 / p.eps - 1, 2)}`, `⇔  x > \\t{log}_2 ${N(1 / p.eps - 1, 2)}`);
              else steps.push(`|f(x) − 0| = \\f{2^x}{2^x + 1} < ${E}`, `⇔  2^x < \\f{${E}}{1 − ${E}} = ${N(p.eps / (1 - p.eps), 2)}`, `⇔  x < \\t{log}_2 ${N(p.eps / (1 - p.eps), 2)}`);
              break;
            default:
              break;
          }
          const allX = !Number.isFinite(xe);
          if (allX) steps.length = 1;
          const show = compact ? steps.slice(0, 1) : steps;
          show.forEach((s, i) => rows.push({ src: s, size: fs(13, 12), gap: i === show.length - 1 ? 8 : 5 }));
          if (allX) {
            rows.push({ src: `\\c{ok}{\\t{${T2('gilt für alle x', 'holds for all x')}}}`, size: fs(14.5, 13.5), weight: 700, hl: col.ok(), gap: 7 });
          } else {
            const exactShown = (!numeric && isExact(xe, 4)) || (isExact(xe, 4) && Math.abs(Math.abs(fn(Math.round(xe)) - Lim()) - p.eps) < 1e-12);
            rows.push({ src: `\\c{ok}{x_ε ${exactShown ? '=' : '≈'} ${cN('xe2', xe, 2)}}`, size: fs(15, 14), weight: 750, hl: col.ok(), gap: 7 });
            if (!compact)
              rows.push(
                noteRow(
                  T2(`Für alle x ${rel()} ${N(xe, 2)} gilt |f(x) − ${Ls}| < ${E}: Der Graph bleibt im Schlauch. Je kleiner ε, desto weiter draußen liegt x_ε.`, `For all x ${rel()} ${N(xe, 2)}: |f(x) − ${Ls}| < ${E}, the graph stays in the strip. The smaller ε, the further out x_ε lies.`),
                  fs(12, 11),
                  th().text,
                ),
              );
          }
          if (kk === 'osc' && !compact) rows.push(noteRow(T2('Vor x_ε gibt es noch Ausschläge, die aus dem Schlauch ragen (rot).', 'Before x_ε there are still bumps that stick out of the strip (red).')));
          return formulaCard(R, measure, k, T2('ε-Schlauch', 'ε-strip'), col.ok(), rows, `\\c{L}{ε = ${E}}`, infoAlpha());
        }
        // ohne Grenzwert: Probe-Schlauch und Schranken
        const c = N(p.c, 1);
        const xl = xLeave();
        rows.push({ src: `\\t{${T2('Vermutung', 'Guess')}}: \\c{out}{L = ${c}} ?   ${N(p.c - p.eps, 2)} < y < ${N(p.c + p.eps, 2)}`, size: fs(13, 12), gap: 7 });
        rows.push(
          Number.isFinite(xl)
            ? { src: `\\c{out}{\\t{${T2('ab', 'from')}} x ≈ ${cN('xl2', xl, 2)}: \\t{${T2('für immer außerhalb', 'outside for good')}}}`, size: fs(13.5, 12.5), weight: 700, hl: col.out(), gap: 8 }
            : { src: `\\c{out}{\\t{${T2(`für x ${d > 0 ? '> 0' : '< 0'} nie im Schlauch`, `never in the strip for x ${d > 0 ? '> 0' : '< 0'}`)}}}`, size: fs(13.5, 12.5), weight: 700, hl: col.out(), gap: 8 },
        );
        if (!compact) {
          rows.push(noteRow(T2('Egal welches L: Der Graph verlässt jeden Schlauch. Stattdessen überschreitet f(x) jede Schranke S:', 'Whatever L: the graph leaves every strip. Instead f(x) passes every bound S:'), fs(12, 11), th().text));
          const s = Math.sign(Lim());
          for (const e of [1, 2, 3]) {
            const S = s * 10 ** e;
            rows.push({ src: `f(x) ${s > 0 ? '>' : '<'} ${big(S)}  \\t{${T2('für', 'for')}}  x ${rel()} ${big(exceedOf(kk, d, S), 2)}`, size: fs(12.5, 11.5), gap: 4 });
          }
        }
        return formulaCard(R, measure, k, T2('Probe-Schlauch', 'Trial strip'), col.out(), rows, `\\c{out}{ε = ${E}}`, infoAlpha());
      };
    }

    /** Karte 3: Wertetabelle, füllt sich beim Lauf Zeile für Zeile. */
    function tableCard(k: Intro, now: number): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const rows = table(key(), dir());
        const rh = compact ? fs(19, 18) : fs(22, 20);
        const h = 38 + rh * (rows.length + 1) + 10;
        if (measure) return h;
        const showD = infoShown() && conv();
        card(R, col.P());
        cardTitle(R, T2('Wertetabelle', 'Table of values'), col.P(), engaged ? undefined : `\\c{m}{\\t{${T2('x nach außen', 'x outwards')}}}`);
        const ka = ease.outCubic(k.cards);
        g.save();
        g.globalAlpha *= ka;
        const y0 = R.y + 36;
        const innerW = R.w - 2 * pad;
        const cx0 = R.x + pad;
        const cx1 = R.x + pad + innerW * (showD ? 0.36 : 0.42);
        const cx2 = R.x + R.w - pad;
        // Kopf
        const hf = `italic 700 ${fs(13, 12)}px ${theme.mathFont}`;
        g.font = hf;
        g.fillStyle = theme.muted;
        g.textBaseline = 'middle';
        g.textAlign = 'right';
        g.fillText('x', cx1 - innerW * 0.08, y0 + rh / 2);
        g.textAlign = showD ? 'right' : 'right';
        const fx = showD ? R.x + pad + innerW * 0.68 : cx2;
        formula(g, 'f(x)', fstyle(fs(13, 12), theme.muted, 700)).draw(g, fx - wOf('f(x)', fs(13, 12)), y0 + rh / 2 + 4);
        if (showD) {
          const hs = `|f(x) − ${N(Lim(), 2)}|`;
          const b = formula(g, hs, fstyle(fs(12, 11), theme.muted, 700));
          b.draw(g, cx2 - b.w, y0 + rh / 2 + 4);
        }
        g.strokeStyle = withAlpha(theme.text, 0.2);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(cx0, y0 + rh + 0.5);
        g.lineTo(cx2, y0 + rh + 0.5);
        g.stroke();
        // gleitende Hervorhebung der aktuellen Zeile
        if (engaged && kRow.v > -0.5) {
          const hy = y0 + rh + 3 + kRow.v * rh;
          g.fillStyle = withAlpha(col.P(), theme.dark ? 0.22 : 0.13);
          roundRect(g, cx0 - 6, hy, innerW + 12, rh - 2, 7);
          g.fill();
        }
        const fv = `600 ${fs(12.5, 11.5)}px ${theme.font}`;
        rows.forEach((rw, i) => {
          const y = y0 + rh * (i + 1.5) + 2;
          const t0 = rowT[i] ?? null;
          const reached = !engaged || t0 !== null;
          const a = reached ? (engaged && t0 !== null && !reduced() ? ease.outCubic(clamp01((now - t0) / 420)) : 1) : 0;
          // Platzhalter
          if (a < 1) {
            g.save();
            g.globalAlpha *= 1 - a;
            g.font = fv;
            g.fillStyle = withAlpha(theme.text, 0.28);
            g.textAlign = 'right';
            g.fillText(xLab(rw.x), cx1 - innerW * 0.08, y);
            g.fillText('…', fx, y);
            if (showD) g.fillText('…', cx2, y);
            g.restore();
          }
          if (a <= 0.01) return;
          g.save();
          g.globalAlpha *= a;
          const dx = (1 - a) * 14;
          g.font = fv;
          g.fillStyle = theme.text;
          g.textAlign = 'right';
          g.fillText(xLab(rw.x), cx1 - innerW * 0.08, y);
          const yv = Number.isFinite(rw.y) ? valNear(rw.y) : T2('n. def.', 'undef.');
          g.fillStyle = Number.isFinite(rw.y) ? col.f() : theme.muted;
          g.fillText(yv, fx + dx, y);
          if (showD) {
            const inside = rw.d < p.eps;
            g.fillStyle = !Number.isFinite(rw.d) ? theme.muted : p.band ? (inside ? col.ok() : col.out()) : theme.text;
            g.fillText(Number.isFinite(rw.d) ? small(rw.d) : '–', cx2 + dx, y);
          }
          g.restore();
        });
        g.restore();
        return h;
      };
    }

    /** Karte 4: Gradregel (gebrochen-rational) bzw. Einschachteln oder Exponentialfunktion. */
    function ruleCard(k: Intro): CardFn {
      return (R, measure, compact) => {
        const kk = key();
        const d = dir();
        const di = degreeInfo(kk);
        const show = infoShown();
        if (di) {
          const g = surface.g;
          const theme = th();
          const pad = fs(14, 12);
          const rsz = fs(12.5, 11.5);
          const rules = [`\\t{Grad Z < Grad N}:  f(x) → 0`, `\\t{Grad Z = Grad N}:  f(x) → \\f{a_Z}{a_N}`, `\\t{Grad Z > Grad N}:  f(x) → ±∞`].map((s) =>
            lang === 'de' ? s : s.replace(/Grad Z/g, 'deg Z').replace(/Grad N/g, 'deg N'),
          );
          const boxes = rules.map((s) => fit(s, R.w - 2 * pad - 8, rsz, theme.text, 600, 11));
          const rhs = boxes.map((b) => Math.max(rowH(b) + 8, fs(26, 24)));
          const pair = RATIO_SRC[kk];
          const zs = pair ? pair[0] : `${N(0.1, 1)}x^3 − x`;
          const ns = pair ? pair[1] : '1';
          const cur = show
            ? di.case === 'eq'
              ? `\\c{f}{Z = ${zs},  N = ${ns}}:  \\f{${N(di.zLead, 2)}}{${N(di.nLead, 2)}} = \\c{L}{${N(di.zLead / di.nLead, 2)}}`
              : di.case === 'lt'
                ? `\\c{f}{Z = ${zs},  N = ${ns}}:  \\t{${T2('Grad', 'deg')}} ${di.zDeg} < ${di.nDeg}  ⇒  \\c{L}{0}`
                : `\\c{f}{Z = ${zs},  N = ${ns}}:  ${di.zDeg} > ${di.nDeg}  ⇒  \\c{out}{${Lim() > 0 ? '+' : '−'}∞}`
            : `\\c{f}{Z = ${zs},  N = ${ns}}:  \\t{${T2('Welcher Fall?', 'Which case?')}}`;
          const cb = fit(cur, R.w - 2 * pad - 4, fs(12.5, 11.5), theme.text, 650, 11);
          const note = T2('Z: Zähler, N: Nenner, a: Leitkoeffizienten.', 'Z: numerator, N: denominator, a: leading coefficients.');
          const nf = `550 ${fs(11.5, 11)}px ${theme.font}`;
          const nl = compact ? [] : wrapText(note, R.w - 2 * pad, nf);
          const h = 38 + rhs.reduce((s, v) => s + v, 0) + 6 + rowH(cb) + 8 + nl.length * fs(11.5, 11) * 1.32 + 8;
          if (measure) return h;
          card(R, col.L());
          cardTitle(R, T2('Zählergrad und Nennergrad', 'Degrees of numerator and denominator'), col.L(), show ? `\\c{L}{Z: ${di.zDeg},  N: ${di.nDeg}}` : undefined);
          const ka = ease.outCubic(k.cards) * infoAlpha();
          g.save();
          g.globalAlpha *= ka;
          let y = R.y + 38;
          const ys: number[] = [];
          for (const v of rhs) {
            ys.push(y);
            y += v;
          }
          if (show) {
            const i0 = Math.floor(clamp(kCase.v, 0, 2));
            const t = clamp(kCase.v, 0, 2) - i0;
            const hy = lerp(ys[i0]!, ys[Math.min(2, i0 + 1)]!, t);
            const hh = lerp(rhs[i0]!, rhs[Math.min(2, i0 + 1)]!, t);
            g.fillStyle = withAlpha(col.L(), theme.dark ? 0.22 : 0.12);
            roundRect(g, R.x + pad - 6, hy - 1, R.w - 2 * pad + 12, hh - 4, 8);
            g.fill();
            g.strokeStyle = withAlpha(col.L(), 0.5);
            g.lineWidth = 1.2;
            roundRect(g, R.x + pad - 5.5, hy - 0.5, R.w - 2 * pad + 11, hh - 5, 8);
            g.stroke();
          }
          boxes.forEach((b, i) => {
            g.save();
            g.globalAlpha *= clamp01(k.stagger * 5 - i);
            b.draw(g, R.x + pad, ys[i]! + (rhs[i]! - 4) / 2 + (b.asc - b.desc) / 2);
            g.restore();
          });
          y += 4;
          cb.draw(g, R.x + pad, y + cb.asc);
          y += rowH(cb) + 8;
          g.font = nf;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          nl.forEach((ln, j) => g.fillText(ln, R.x + pad, y + fs(11.5, 11) * 0.66 + j * fs(11.5, 11) * 1.32));
          g.restore();
          void d;
          return h;
        }
        const rows: RowSpec[] = [];
        let title = '';
        if (kk === 'osc') {
          title = T2('Einschachteln', 'Squeezing');
          if (show) {
            rows.push({ src: '\\c{e}{−\\f{1}{|x|}} ≤ \\f{\\t{sin} x}{x} ≤ \\c{e}{\\f{1}{|x|}}', size: fs(13.5, 12.5), gap: 8 });
            rows.push({ src: '\\c{e}{\\f{1}{|x|}} → 0   ⇒   f(x) → \\c{L}{0}', size: fs(13, 12), gap: 8 });
            if (!compact) rows.push(noteRow(T2('Der Graph liegt zwischen den gestrichelten Kurven y = ±1/|x| und schneidet die Asymptote y = 0 bei x = kπ – unendlich oft.', 'The graph lies between the dashed curves y = ±1/|x| and crosses the asymptote y = 0 at x = kπ – infinitely often.')));
          } else rows.push(noteRow(T2('Tipp: Wie groß kann |sin x| höchstens werden?', 'Hint: how large can |sin x| be at most?'), fs(12.5, 11.5)));
        } else {
          title = T2('Exponentialfunktion', 'Exponential function');
          if (!show) rows.push(noteRow(T2('Tipp: Vergleiche, wie schnell 2ˣ und x wachsen bzw. wie schnell 2ˣ für x → −∞ klein wird.', 'Hint: compare how fast 2ˣ and x grow, and how fast 2ˣ becomes small as x → −∞.'), fs(12.5, 11.5)));
          else if (kk === 'exp') {
            rows.push({ src: `2^{10} = 1024,   2^{20} ≈ 10^6   ⇒   2^x → +∞`, size: fs(13, 12), gap: 6, hl: d > 0 ? col.out() : undefined });
            rows.push({ src: `2^{−10} = \\f{1}{1024} ≈ ${N(1 / 1024, 4)}   ⇒   2^x → \\c{L}{0}`, size: fs(13, 12), gap: 8, hl: d < 0 ? col.L() : undefined });
            if (!compact) rows.push(noteRow(T2('Die Asymptote y = 0 gibt es nur auf der linken Seite (x → −∞).', 'The asymptote y = 0 exists only on the left (x → −∞).')));
          } else if (kk === 'xexp') {
            rows.push({ src: `\\f{10}{2^{10}} ≈ ${N(10 / 1024, 4)},   \\f{20}{2^{20}} ≈ ${small(20 / 2 ** 20)}`, size: fs(13, 12), gap: 6, hl: d > 0 ? col.L() : undefined });
            rows.push({ src: `x → −∞:   x · 2^{−x} = x · 2^{|x|} → \\c{out}{−∞}`, size: fs(13, 12), gap: 8, hl: d < 0 ? col.out() : undefined });
            if (!compact) rows.push(noteRow(T2('Die Exponentialfunktion wächst schneller als jede Potenz von x – sie „gewinnt“.', 'The exponential function grows faster than any power of x – it “wins”.')));
          } else {
            rows.push({ src: `x → +∞:   2^{−x} → 0   ⇒   f(x) → \\c{L}{1}`, size: fs(13, 12), gap: 6, hl: d > 0 ? col.L() : undefined });
            rows.push({ src: `x → −∞:   2^x → 0   ⇒   f(x) → \\c{L}{0}`, size: fs(13, 12), gap: 8, hl: d < 0 ? col.L() : undefined });
            if (!compact) rows.push(noteRow(T2('Zwei verschiedene waagrechte Asymptoten: y = 1 rechts und y = 0 links.', 'Two different horizontal asymptotes: y = 1 on the right and y = 0 on the left.')));
          }
        }
        return formulaCard(R, measure, k, title, kk === 'osc' ? col.env() : col.L(), rows, undefined, infoAlpha());
      };
    }

    function drawColumn(C: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list: { id: string; fn: CardFn }[] = [{ id: 'term', fn: termCard(k) }];
      if (p.band || !infoShown()) list.push({ id: 'eps', fn: epsCard(k) });
      list.push({ id: 'tab', fn: tableCard(k, now) });
      list.push({ id: 'rule', fn: ruleCard(k) });
      const room = { x: C.x, y: C.y, w: C.w, h: C.h };
      const full = list.map((c) => c.fn(room, true, false));
      const short = list.map((c) => c.fn(room, true, true));
      const compactSet = new Set<number>();
      const total = () => list.reduce((s, _, i) => s + (compactSet.has(i) ? short[i]! : full[i]!) + gap, -gap);
      for (const i of [3, 0, 1, 2]) {
        if (i >= list.length) continue;
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
      const d = dir();
      const ds = dS();
      if (conv()) {
        const Ls = N(Lim(), 2);
        ctx.readout('lim', { html: `lim<sub><var>x</var> → ${ds}∞</sub> <var>f</var>(<var>x</var>) = ${Ls}` });
        const side = sideOf(key(), d);
        const st = side === 'above' ? T2('von oben', 'from above') : side === 'below' ? T2('von unten', 'from below') : T2('von beiden Seiten – der Graph schneidet sie', 'from both sides – the graph crosses it');
        ctx.readout('asym', { html: `<var>y</var> = ${Ls} (${T2('Annäherung', 'approach')} ${st})` });
        const xe = xEps();
        ctx.readout(
          'xe',
          Number.isFinite(xe)
            ? { html: `ε = ${N(p.eps, 2)}: |<var>f</var>(<var>x</var>) − ${Ls}| &lt; ${N(p.eps, 2)} ${T2('für alle', 'for all')} <var>x</var> ${rel() === '>' ? '&gt;' : '&lt;'} ${N(xe, 2)}` }
            : { html: `ε = ${N(p.eps, 2)}: ${T2('für alle', 'for all')} <var>x</var>` },
        );
      } else {
        ctx.readout('lim', { html: `<var>f</var>(<var>x</var>) → ${Lim() > 0 ? '+' : '−'}∞ ${T2('für', 'as')} <var>x</var> → ${ds}∞ (${T2('kein Grenzwert', 'no limit')})` });
        ctx.readout('asym', T2('keine waagrechte Asymptote', 'no horizontal asymptote'));
        const xl = xLeave();
        ctx.readout(
          'xe',
          Number.isFinite(xl)
            ? T2(`Probe-Schlauch um ${N(p.c, 1)} (ε = ${N(p.eps, 2)}): für immer verlassen ab x ≈ ${N(xl, 2)}`, `Trial strip around ${N(p.c, 1)} (ε = ${N(p.eps, 2)}): left for good from x ≈ ${N(xl, 2)}`)
            : T2(`Probe-Schlauch um ${N(p.c, 1)}: auf dieser Seite nie getroffen`, `Trial strip around ${N(p.c, 1)}: never reached on this side`),
        );
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      // Ansicht folgt P (während des Laufs bzw. Ziehens weich nachgeführt)
      if (engaged || drag?.kind === 'P' || U.busy) retargetView(now, 'follow');
      let anim = false;
      for (const c of chans()) if (c.step(now, dt)) anim = true;
      if (intro !== null || dragging()) anim = true;
      if (fIn !== null && now - fIn > 1200) fIn = null;
      if (prevFn && now - prevFn.t0 > 540) prevFn = null;
      if (okPulse !== null && now - okPulse > 2700) okPulse = null;
      if (finishT !== null && now - finishT > 2900) finishT = null;
      if (revealT !== null && now - revealT > 1000) revealT = null;
      if (fIn !== null || prevFn || okPulse !== null || finishT !== null || revealT !== null) anim = true;
      // erreichte Tabellenzeilen
      if (engaged) {
        const sP = stripU(Math.abs(xP()));
        let cur = -1;
        tableXs(key()).forEach((ax, i) => {
          const reached = sP >= stripU(ax) - 1e-6;
          if (reached) {
            cur = i;
            if (rowT[i] === null) rowT[i] = now;
          } else rowT[i] = null;
        });
        if (kRow.goal !== cur) {
          if (reduced() || kRow.v < -0.5) kRow.jump(cur);
          else kRow.glide(cur, 380, 0, now, ease.outCubic);
        }
        if (rowT.some((t) => t !== null && now - t < 450)) anim = true;
      }
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
      drawStrip(R.strip, k);
      g.restore();
      drawColumn(R.col, k, now);
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    function retargetAll(now: number, source: string, changed: ReadonlySet<string>): void {
      const instant = source === 'init' || reduced();
      const set = (c: Chan, goal: number, dur: number, delay = 0, follow = false) => {
        if (instant) c.jump(goal);
        else if (follow) c.follow(goal, 0.06);
        else if (Math.abs(c.goal - goal) > 1e-12) c.glide(goal, dur, delay, now);
      };
      set(SD, dir(), 1000);
      set(BM, bandMid(), 800, 0, drag?.kind === 'mid');
      set(EP, p.eps, 520, 0, drag?.kind === 'edge');
      const xe = xEps();
      if (conv()) {
        const fin = Number.isFinite(xe);
        set(kXe, fin ? 1 : 0, 400);
        if (fin) {
          if (changed.has('f') || changed.has('dir') || instant) XE.jump(xe);
          else set(XE, xe, 760, 60, false);
        }
      }
      const xl = xLeave();
      if (!conv() && Number.isFinite(xl)) {
        if (changed.has('f') || changed.has('dir') || instant) XL.jump(xl);
        else set(XL, xl, 700);
      }
      set(kInfo, p.info ? 1 : 0, 900);
      set(kBand, p.band ? 1 : 0, 480);
      set(kConv, conv() ? 1 : 0, 600);
      const di = degreeInfo(key());
      const ci = di ? (di.case === 'lt' ? 0 : di.case === 'eq' ? 1 : 2) : kCase.goal;
      if (instant) kCase.jump(ci);
      else if (kCase.goal !== ci) kCase.glide(ci, 560, 0, now, ease.outBack);
      retargetView(now, instant ? 'jump' : drag ? 'follow' : 'glide');
    }

    /** Lauf von vorn starten (erst zurück zum Anfang gleiten). */
    function startRun(now: number): void {
      engaged = true;
      finishT = null;
      rowT = rowT.map(() => null);
      kRow.jump(-1);
      if (reduced()) {
        U.jump(1);
        ctx.clock.pause();
        finishT = null;
        return;
      }
      if (U.v > 1e-6) U.glide(0, 450 + 300 * U.v, 0, now);
      if (!ctx.clock.playing) ctx.clock.play();
    }
    function backToStart(now: number): void {
      ctx.clock.pause();
      engaged = false;
      finishT = null;
      if (reduced()) U.jump(0);
      else U.glide(0, 700 + 400 * U.v, 0, now);
      retargetView(now, 'glide');
    }

    ctx.clock.onChange((playing) => {
      const now = performance.now();
      if (playing) {
        if (ctx.locked) {
          ctx.clock.pause();
          return;
        }
        if (!engaged || U.goal >= 1 - 1e-6) startRun(now);
      }
      ctx.requestRender();
    });

    /* ---------- Zeiger: Schlauch, P, Zeitleiste ---------- */
    function hit(px: number, py: number, touch: boolean): string | null {
      const R = regions();
      const T = R.strip;
      if (px >= T.x && px <= T.x + T.w && py >= T.y && py <= T.y + T.h) {
        const G = stripGeom(T);
        if (Math.hypot(px - G.play.x, py - G.play.y) < G.play.r + 6) return 'play';
        const xs = tableXs(key());
        for (let i = 0; i < xs.length; i++) if (Math.abs(px - lerp(G.x0, G.x1, stripU(xs[i]!))) < (touch ? 14 : 9) && Math.abs(py - G.ty) < 18) return `n${i}`;
        if (px >= G.x0 - 12 && px <= G.x1 + 12) return 'track';
        return null;
      }
      const r = plot.rect;
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
      if (!editable()) return 'plot';
      // P
      const P = pPos();
      if (Number.isFinite(P.py) && Math.hypot(px - P.px, py - clamp(P.py, r.y + 4, r.y + r.h - 4)) < (touch ? 24 : 15)) return 'P';
      // Schlauchränder
      if (bandOn() > 0.5) {
        const bp = bandPx();
        const tol = touch ? 14 : 7;
        if (Math.abs(py - bp.top) < tol) return 'eT';
        if (Math.abs(py - bp.bot) < tol) return 'eB';
        if (!conv() && py > bp.top && py < bp.bot) return 'mid';
      }
      return 'plot';
    }
    const cursorFor = (id: string | null) => (id === 'eT' || id === 'eB' ? 'ns-resize' : id === 'mid' || id === 'P' ? 'grab' : id === 'play' || id?.startsWith('n') ? 'pointer' : id === 'track' ? 'ew-resize' : id === 'plot' ? 'crosshair' : '');
    function scrubTo(px: number): void {
      const G = stripGeom(regions().strip);
      const s = clamp01((px - G.x0) / (G.x1 - G.x0));
      ctx.clock.pause();
      engaged = true;
      finishT = null;
      U.jump(runU(key(), dir(), stripX(s)));
    }
    const target: Target = {
      contains: (px: number, py: number) => hit(px, py, false) !== null,
      pointerDown: (q: Ptr) => {
        const id = hit(q.px, q.py, q.type === 'touch');
        if (!id) return false;
        if (!editable() && id !== 'plot') return false;
        if (id === 'play') {
          ctx.clock.toggle();
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('n') || id === 'track') {
          drag = { kind: 'scrub', sx: q.px, moved: id === 'track', node: id.startsWith('n') ? Number(id.slice(1)) : null };
          if (id === 'track') scrubTo(q.px);
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return true;
        }
        if (id === 'eT' || id === 'eB') {
          drag = { kind: 'edge', sign: id === 'eT' ? 1 : -1 };
          surface.setCursor('ns-resize');
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return true;
        }
        if (id === 'mid') {
          const [, wy] = plot.toWorld(q.px, q.py);
          drag = { kind: 'mid', off: p.c - wy };
          surface.setCursor('grabbing');
          hover = { id, px: q.px, py: q.py };
          ctx.requestRender();
          return true;
        }
        if (id === 'P') {
          drag = { kind: 'P' };
          ctx.clock.pause();
          engaged = true;
          finishT = null;
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
        } else if (drag.kind === 'scrub') {
          if (!drag.moved && Math.abs(q.px - drag.sx) > 4) drag.moved = true;
          if (drag.moved) scrubTo(q.px);
        } else if (drag.kind === 'edge') {
          const [, wy] = plot.toWorld(q.px, q.py);
          const e = Math.round(clamp(Math.abs(wy - bandMid()), 0.05, 1) * 20) / 20;
          if (Math.abs(e - p.eps) > 1e-9) setP({ eps: e });
        } else if (drag.kind === 'mid') {
          const [, wy] = plot.toWorld(q.px, q.py);
          const c = Math.round(clamp(wy + drag.off, -10, 10) * 2) / 2;
          if (Math.abs(c - p.c) > 1e-9) setP({ c });
        } else if (drag.kind === 'P') {
          const [wx] = plot.toWorld(q.px, q.py);
          const u = dir() * wx > 0 ? runU(key(), dir(), wx) : 0;
          U.follow(u, 0.05);
        }
        ctx.requestRender();
      },
      pointerUp: (q: Ptr) => {
        const d0 = drag;
        drag = null;
        const now = performance.now();
        if (d0?.kind === 'scrub' && !d0.moved && d0.node !== null) {
          ctx.clock.pause();
          engaged = true;
          finishT = null;
          const ax = tableXs(key())[d0.node]!;
          const u = runU(key(), dir(), dir() * ax);
          if (reduced()) U.jump(u);
          else U.glide(u, 700, 0, now);
        }
        if (d0?.kind === 'edge' && conv() && p.band) okPulse = reduced() ? null : now;
        if (d0?.kind === 'P' || d0?.kind === 'edge' || d0?.kind === 'mid') retargetView(now, 'glide');
        const id = d0?.kind === 'look' ? null : hit(q.px, q.py, false);
        hover = id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(cursorFor(id));
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const id = q ? hit(q.px, q.py, false) : null;
        hover = q && id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(cursorFor(id));
        ctx.requestRender();
      },
      wheel: () => false,
    };
    surface.addTarget(target);

    function setLabels(): void {
      ctx.setAction('run', { enabled: editable() });
      ctx.setAction('shrink', { enabled: editable() });
      ctx.setAction('back', { enabled: editable() });
      ctx.setAction('reveal', { enabled: editable() });
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const fnChange = (changed.has('f') || changed.has('dir')) && source !== 'init';
        // abgeleiteter Wert: Probe-Schlauch passend zur neuen Funktion (nur beim Bedienen)
        if (source === 'input' && (changed.has('f') || changed.has('dir')) && !conv()) {
          const c = candidateDefault(key(), dir());
          if (c !== p.c) setP({ c });
        }
        if (fnChange) {
          if (changed.has('f') && !reduced()) {
            prevFn = { k: lastKey, t0: now };
            fIn = now;
          }
          ctx.clock.pause();
          engaged = false;
          finishT = null;
          rowT = rowT.map(() => null);
          U.jump(0);
          okPulse = null;
        }
        if (source === 'replace') {
          ctx.clock.pause();
          engaged = false;
          finishT = null;
          if (reduced()) U.jump(0);
          else U.glide(0, 600, 0, now);
        }
        lastKey = key();
        if (changed.has('info') && p.info && source !== 'init') revealT = reduced() ? null : now;
        if (changed.has('eps') && source !== 'init' && !drag && conv() && p.band && p.info) okPulse = reduced() ? null : now + 250;
        retargetAll(now, source, changed);
        if (source === 'init' && !reduced()) intro = now;
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'run') startRun(now);
        else if (id === 'back') backToStart(now);
        else if (id === 'shrink') setP({ eps: nextEps(p.eps) });
        else if (id === 'reveal') setP({ info: true });
        setLabels();
        ctx.requestRender();
      },
      tick(dt) {
        if (!engaged) engaged = true;
        if (U.busy && U.goal < U.v) return;
        if (reduced()) {
          U.jump(1);
        } else U.jump(Math.min(1, U.v + dt / RUN_S));
        if (U.v >= 1 - 1e-9) {
          U.jump(1);
          ctx.clock.pause();
          finishT = reduced() ? null : performance.now();
        }
      },
      resetTime() {
        backToStart(performance.now());
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
