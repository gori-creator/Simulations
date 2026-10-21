import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import { analyze, degree, derive, evalPoly, inflectionInfo, limits, secondTest, sidesAt, signChart, symmetry, tangentLine, zeroOrder, zeros, type Analysis, type Poly, type Sign, type SignChart } from './model';

const L = (de: string, en: string) => ({ de, en });
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Anzahl der Schritte der Untersuchung. */
const STEPS = 7;
/** Dauer von „Tangente wandern lassen“ in ms. */
const SWEEP_MS = 6500;
/** Koeffizienten-Schlüssel, Index = Exponent: f(x) = d + c·x + b·x² + a·x³ + q·x⁴. */
const COEF = ['d', 'c', 'b', 'a', 'q'] as const;
type CoefKey = (typeof COEF)[number];

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

/** Titel der sieben Schritte. */
const STEP_TITLES = [
  L('Ableitungen bilden', 'Find the derivatives'),
  L('Symmetrie und Verhalten für x → ±∞', 'Symmetry and behaviour for x → ±∞'),
  L('Nullstellen: f(x) = 0', 'Zeros: f(x) = 0'),
  L('Notwendige Bedingung: f′(x) = 0', 'Necessary condition: f′(x) = 0'),
  L('Hinreichend: Vorzeichenwechsel von f′', 'Sufficient: sign change of f′'),
  L('Wendestellen: f″(x) = 0 mit VZW', 'Inflection points: f″(x) = 0 with sign change'),
  L('Monotonie und Krümmung', 'Monotonicity and curvature'),
];

/**
 * Kurvendiskussion ganzrationaler Funktionen bis Grad 4 in sieben Schritten:
 * Ableitungen, Symmetrie und Verhalten im Unendlichen, Nullstellen,
 * notwendige Bedingung f′(x) = 0, hinreichende Bedingung (Vorzeichenwechsel
 * von f′, dazu das f″-Kriterium mit dem Sonderfall f″(x₀) = 0), Wendestellen
 * und schließlich Monotonie- und Krümmungsintervalle. Oben der Graph von f,
 * darunter mit gemeinsamer x-Achse die Graphen von f′ und f″ (Vorzeichen
 * eingefärbt); senkrechte Hilfslinien verbinden die Nullstellen von f′ mit den
 * Extrempunkten und die von f″ mit den Wendepunkten. Jeder Schritt läuft als
 * kleine Animation ab (Punkte ploppen auf, Vorzeichentabellen füllen sich
 * Zelle für Zelle). Ein ziehbarer Punkt P trägt Tangente und Steigungsdreieck,
 * der Wert f′(x₀) zählt mit und ist im f′-Bild markiert. Am Schnittpunkt mit
 * der y-Achse lässt sich der Graph verschieben. Mit „Ergebnisse zeigen“ aus
 * wird daraus eine Aufgabe mit Aufdecken.
 */
export default defineSimulation({
  id: 'kurvendiskussion',
  dragHint: true,
  layout: { aspect: 1.3, aspectNarrow: 0.3 },
  groups: [
    { id: 'coef', label: L('Koeffizienten von f', 'Coefficients of f') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'st',
      type: 'number',
      label: L('Schritt der Untersuchung', 'Step of the investigation'),
      help: L('Auch die Punkte 1 bis 7 in der Karte „Untersuchung“ antippen.', 'You can also tap the dots 1 to 7 on the “Investigation” card.'),
      min: 1,
      max: STEPS,
      step: 1,
      default: 1,
    },
    { key: 'q', type: 'number', group: 'coef', label: L('vor x⁴', 'of x⁴'), help: L('f(x) = q·x⁴ + a·x³ + b·x² + c·x + d', 'f(x) = q·x⁴ + a·x³ + b·x² + c·x + d'), min: -1, max: 1, step: 0.05, default: 0 },
    { key: 'a', type: 'number', group: 'coef', label: L('vor x³', 'of x³'), min: -2, max: 2, step: 0.1, default: 1 },
    { key: 'b', type: 'number', group: 'coef', label: L('vor x²', 'of x²'), min: -4, max: 4, step: 0.1, default: 0 },
    { key: 'c', type: 'number', group: 'coef', label: L('vor x', 'of x'), min: -6, max: 6, step: 0.1, default: -3 },
    {
      key: 'd',
      type: 'number',
      group: 'coef',
      label: L('Absolutglied', 'Constant'),
      help: L('Auch den Punkt auf der y-Achse ziehen: Der Graph verschiebt sich, f′ bleibt gleich.', 'You can also drag the point on the y-axis: the graph moves, f′ stays the same.'),
      min: -5,
      max: 5,
      step: 0.1,
      default: 0,
    },
    {
      key: 'px',
      type: 'number',
      label: L('Stelle x₀ des Punktes P', 'Position x₀ of the point P'),
      help: L('Auch P auf dem Graphen ziehen. In der Nähe einer waagrechten Tangente rastet P ein.', 'You can also drag P along the graph. Near a horizontal tangent P snaps into place.'),
      min: -6,
      max: 6,
      step: 0.01,
      default: -2,
      visibleIf: (v) => v.tan === true,
    },
    { key: 'tan', type: 'boolean', group: 'view', label: L('Tangente in P', 'Tangent at P'), default: true },
    { key: 'der', type: 'boolean', group: 'view', label: L('Graphen von f′ und f″ darunter zeigen', 'Show the graphs of f′ and f″ below'), default: true },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Ergebnisse zeigen', 'Show the results'),
      help: L('Aus: Ableitungen, Stellen und Punkte selbst berechnen; die Schritte bleiben sichtbar. Danach aufdecken.', 'Off: work out derivatives, positions and points yourself; the steps stay visible. Then reveal.'),
      default: true,
    },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'prev', label: L('Schritt zurück', 'Step back') },
    { id: 'restart', label: L('Von vorn', 'Start again') },
    { id: 'tan', label: L('Tangente wandern lassen', 'Move the tangent'), visibleIf: (v) => v.tan === true },
    { id: 'reveal', label: L('Ergebnisse aufdecken', 'Reveal the results'), primary: true, visibleIf: (v) => v.show !== true },
  ],
  readouts: [
    { key: 'ext', label: L('Extrempunkte', 'Extrema'), spoiler: true },
    { key: 'infl', label: L('Wendepunkte', 'Inflection points'), spoiler: true },
    { key: 'zer', label: L('Nullstellen', 'Zeros'), spoiler: true },
    { key: 'mono', label: L('Monotonie', 'Monotonicity'), spoiler: true },
    { key: 'slope', label: L('Steigung in P', 'Slope at P'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'cubic', label: L('f(x) = x³ − 3x', 'f(x) = x³ − 3x'), values: {} },
    { id: 'hill', label: L('f(x) = −x³ + 3x²', 'f(x) = −x³ + 3x²'), values: { q: 0, a: -1, b: 3, c: 0, d: 0, px: 0.5 } },
    { id: 'w', label: L('W-Form: x⁴ − 2x²', 'W shape: x⁴ − 2x²'), values: { q: 1, a: 0, b: -2, c: 0, d: 0, st: 6, px: -1.4 } },
    { id: 'terrace', label: L('Terrassenpunkt: x³', 'Terrace point: x³'), values: { q: 0, a: 1, b: 0, c: 0, d: 0, st: 6, px: -1 } },
    { id: 'x4', label: L('x⁴: f″(0) = 0, trotzdem Tiefpunkt', 'x⁴: f″(0) = 0, yet a minimum'), values: { q: 1, a: 0, b: 0, c: 0, d: 0, st: 6, px: -1 } },
    { id: 'full', label: L('Vollständig: −0,25x⁴ + x³', 'Complete: −0.25x⁴ + x³'), values: { q: -0.25, a: 1, b: 0, c: 0, d: 0, st: 7, px: 1 } },
    { id: 'task', label: L('Aufgabe: x³ − 3x² + 2 selbst untersuchen', 'Task: investigate x³ − 3x² + 2 yourself'), values: { q: 0, a: 1, b: -3, c: 0, d: 2, show: false, px: -1 } },
  ],
  strings: {
    de: {
      canvas:
        'Oben der Graph einer ganzrationalen Funktion f bis Grad 4, darunter mit gemeinsamer x-Achse die Graphen der Ableitungen f′ und f″, deren Vorzeichen grün und rot eingefärbt sind. Senkrechte Hilfslinien verbinden die Nullstellen von f′ mit den Hoch-, Tief- und Terrassenpunkten und die Nullstellen von f″ mit den Wendepunkten. Ein ziehbarer Punkt P trägt Tangente und Steigungsdreieck. Rechts bzw. darunter Karten mit der Untersuchung in sieben Schritten, Vorzeichentabellen für f′ und f″, den Werten in P und einem Steckbrief.',
    },
    en: {
      canvas:
        'At the top the graph of a polynomial f of degree up to 4, below it with a shared x-axis the graphs of the derivatives f′ and f″, their sign coloured green and red. Vertical guide lines link the zeros of f′ with maxima, minima and terrace points and the zeros of f″ with the inflection points. A draggable point P carries a tangent and a slope triangle. On the right or below cards with the investigation in seven steps, sign charts for f′ and f″, the values at P and a profile.',
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
      d1: () => th().series[3]!,
      d2: () => th().series[4]!,
      up: () => th().series[2]!,
      down: () => th().series[1]!,
      t: () => th().series[5]!,
      /** Extrem- und Terrassenpunkte: über f′ = 0 gefunden, daher in der Farbe von f′ */
      ext: () => th().series[3]!,
      /** Wendepunkte: über f″ = 0 gefunden, daher in der Farbe von f″ */
      infl: () => th().series[4]!,
    };

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eqS = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const show = () => p.show;
    /** Wert oder Platzhalter „¿“ (wird als gestrichelter Kasten mit „?“ gezeichnet). */
    const S = (s: string) => (show() ? s : '¿');

    /* ---------- Funktion (Ziel) ---------- */
    const poly = (): Poly => COEF.map((k) => p[k] as number);
    let A: Analysis = analyze(poly());
    let Z: number[] = zeros(poly());
    function recompute(): void {
      A = analyze(poly());
      Z = zeros(poly());
    }
    const deg = () => degree(poly());

    /* ---------- angezeigter Zustand ---------- */
    const CC = COEF.map((k) => new Chan(p[k] as number));
    const shownPoly = (): Poly => CC.map((c) => c.v);
    /** Analyse der angezeigten (gleitenden) Funktion – nur neu, wenn sich etwas bewegt. */
    let shownKey = '';
    let SA: Analysis = A;
    let SZ: number[] = Z;
    function shownAnalysis(): Analysis {
      const sp = shownPoly();
      const key = sp.join('|');
      if (key !== shownKey) {
        shownKey = key;
        const settled = sp.every((v, i) => v === poly()[i]);
        SA = settled ? A : analyze(sp);
        SZ = settled ? Z : zeros(sp);
      }
      return SA;
    }
    const X = new Chan(p.px);
    const vis = Array.from({ length: STEPS + 1 }, (_, k) => new Chan(k >= 1 && p.st >= k ? 1 : 0));
    const stepPos = new Chan(p.st);
    const kDer = new Chan(p.der ? 1 : 0);
    const kTan = new Chan(p.tan ? 1 : 0);
    const kShow = new Chan(p.show ? 1 : 0);
    const rng = {
      rx: new Chan(3),
      fy0: new Chan(-3),
      fy1: new Chan(3),
      dy0: new Chan(-3),
      dy1: new Chan(3),
      ey0: new Chan(-3),
      ey1: new Chan(3),
    };
    const cardH = new Map<string, Chan>();
    const allChans = () => [...CC, X, ...vis, stepPos, kDer, kTan, kShow, ...Object.values(rng), ...cardH.values()];

    /* ---------- Abläufe ---------- */
    let intro: number | null = null;
    /** gerade begonnener Schritt (kleine Animation), sonst null */
    let story: { step: number; t0: number } | null = null;
    /** Zeitpunkt des letzten Schrittwechsels (Karten blenden neu ein) */
    let stepT0 = -1e9;
    let sweep: { t0: number; from: number; to: number; last: number } | null = null;
    let pulses: { x: number; t0: number }[] = [];
    let lastSt = p.st;
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    const dragging = () => performance.now() - lastDrag < 250;
    const grab = () => {
      lastDrag = performance.now();
    };

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    /** Zahl, die im Bild und in den Karten weich zu ihrem Wert zählt. */
    function cnt(key: string, v: number, from0 = false): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(key);
      if (!e) {
        e = { c: new Chan(from0 || intro !== null ? 0 : v), at: -1 };
        nums.set(key, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (Math.abs(e.c.v - v) > 60 * Math.max(1, Math.abs(v))) e.c.jump(v);
        e.c.follow(v, dragging() || sweep ? 0.04 : 0.2);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählte, formatierte Zahl; am Ziel exakt */
    const cN = (key: string, v: number, d = 2, from0 = false) => {
      const s = cnt(key, v, from0);
      return N(Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? v : s, d);
    };

    /* ---------- Aufteilung (nach Breite UND Höhe) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.15;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { stack: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.35, 236, 380));
        return { stack: { x: 0, y: 0, w: w - cw - 12, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const k = kDer.v;
      const ph = Math.round(clamp(w * (0.92 + 0.62 * k), 300, h * (0.4 + 0.14 * k)));
      return { stack: { x: 0, y: 0, w, h: ph }, col: { x: 0, y: ph + 10, w, h: h - ph - 10 }, wide: false };
    }
    const HIDDEN: Rect = { x: -60, y: -60, w: 20, h: 20 };
    function panels(): { top: Rect; mid: Rect | null; bot: Rect | null } {
      const S0 = regions().stack;
      const k = kDer.v;
      if (k < 0.02) return { top: S0, mid: null, bot: null };
      const gap = 6 * clamp01(k * 4);
      const w1 = 1;
      const w2 = 0.5 * k;
      const w3 = 0.44 * k;
      const avail = S0.h - 2 * gap;
      const h1 = Math.round((avail * w1) / (w1 + w2 + w3));
      const h2 = Math.round((avail * w2) / (w1 + w2 + w3));
      const h3 = avail - h1 - h2;
      const top = { x: S0.x, y: S0.y, w: S0.w, h: h1 };
      const mid = h2 > 24 ? { x: S0.x, y: S0.y + h1 + gap, w: S0.w, h: h2 } : null;
      const bot = h3 > 24 ? { x: S0.x, y: S0.y + h1 + h2 + 2 * gap, w: S0.w, h: h3 } : null;
      return { top, mid, bot };
    }
    const plot = new Plot(surface, { x: [-3, 3], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => panels().top, xAxis: { label: 'x' }, yAxis: { label: 'y' } });
    const plotD = new Plot(surface, { x: [-3, 3], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => panels().mid ?? HIDDEN, xAxis: { label: 'x' }, yAxis: { label: '' } });
    const plotE = new Plot(surface, { x: [-3, 3], y: [-3, 3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => panels().bot ?? HIDDEN, xAxis: { label: 'x' }, yAxis: { label: '' } });
    /** Ränder der Bilder in Pixeln (oben Platz für die Legende, unten für die Bänder). */
    const padTop = () => ({ left: fs(14, 10), right: fs(14, 10), top: fs(40, 36), bottom: fs(20, 18) + Math.round(fs(40, 36) * vis[7]!.v) });
    const padSub = () => ({ left: fs(14, 10), right: fs(14, 10), top: fs(30, 28), bottom: fs(14, 12) });

    /* ---------- Stelle von P ---------- */
    /** Stelle x₀ von P; liegt sie (fast) auf einem Kandidaten, genau dort. */
    function exactPx(v: number = p.px): number {
      for (const c of A.candidates) if (Math.abs(v - c) < 0.0051) return c;
      return v;
    }
    /** angezeigte Stelle von P (beim Wandern die laufende Stelle) */
    function shownPx(now: number): number {
      if (!sweep) return X.v;
      const t = clamp01((now - sweep.t0) / SWEEP_MS);
      return lerp(sweep.from, sweep.to, ease.inOutCubic(t));
    }
    /** Ziehen: an waagrechten Tangenten einrasten (auf 0,01 gerundet; exactPx macht daraus den Kandidaten). */
    function snapX(x: number, pl: Plot): number {
      const lim = Math.max(rng.rx.goal, 2.5);
      let v = clamp(x, -lim, lim);
      const tolW = 11 / Math.max(1, pl.scale.x);
      // bei verdeckten Ergebnissen nicht einrasten: das Einrasten verriete die Kandidaten
      for (const c of p.show ? A.candidates : []) {
        if (Math.abs(v - c) < tolW) {
          if (Math.abs(p.px - c) >= 0.0051 && !reduced()) pulses.push({ x: c, t0: performance.now() });
          v = c;
          break;
        }
      }
      return clamp(Math.round(v * 100) / 100, -6, 6);
    }

    /* ---------- Griffe ---------- */
    // P auf dem Graphen von f
    plot.addHandle({
      get: () => {
        const x = shownPx(frameNow);
        return [x, evalPoly(shownPoly(), x)];
      },
      set: (x) => {
        grab();
        setP({ px: snapX(x, plot) });
      },
      axis: 'x',
      enabled: () => editable() && p.tan && !sweep,
      color: () => col.f(),
    });
    // Schnittpunkt mit der y-Achse: Graph verschieben (Absolutglied d)
    plot.addHandle({
      get: () => [0, evalPoly(shownPoly(), 0)],
      set: (_x, y) => {
        grab();
        setP({ d: Math.round(clamp(y, -5, 5) * 10) / 10 });
      },
      axis: 'y',
      enabled: () => editable() && !sweep,
      color: () => th().muted,
    });
    // P im Bild von f′
    plotD.addHandle({
      get: () => {
        const x = shownPx(frameNow);
        return [x, evalPoly(derive(shownPoly()), x)];
      },
      set: (x) => {
        grab();
        setP({ px: snapX(x, plotD) });
      },
      axis: 'x',
      enabled: () => editable() && p.tan && p.der && !sweep,
      color: () => col.d1(),
    });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), d: col.d1(), e: col.d2(), u: col.up(), n: col.down(), t: col.t(), m: th().muted, x: col.ext(), w: col.infl(), k: th().text },
    });
    /** Gestalteter Platzhalter für verdeckte Ergebnisse: gestrichelte Pille mit „?“. */
    function phBox(size: number, w = size * 2.6): FormulaBox {
      const h = size * 1.3;
      return {
        w,
        asc: h * 0.72,
        desc: h * 0.32,
        draw(g2, x, y) {
          const top = y - h * 0.72;
          g2.save();
          g2.fillStyle = withAlpha(th().muted, th().dark ? 0.14 : 0.09);
          roundRect(g2, x, top, w, h + 1, h / 2);
          g2.fill();
          g2.strokeStyle = withAlpha(th().muted, 0.65);
          g2.lineWidth = 1.1;
          g2.setLineDash([3, 3]);
          roundRect(g2, x + 0.5, top + 0.5, w - 1, h, h / 2);
          g2.stroke();
          g2.setLineDash([]);
          g2.font = `800 ${Math.round(size * 0.92)}px ${th().font}`;
          g2.fillStyle = th().muted;
          g2.textAlign = 'center';
          g2.textBaseline = 'middle';
          g2.fillText('?', x + w / 2, top + h / 2 + 1);
          g2.restore();
        },
      };
    }
    /** Mehrere Kästen nebeneinander (gemeinsame Grundlinie). */
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
        draw(g2, x, y) {
          let cx = x;
          boxes.forEach((b, i) => {
            if (i) cx += gap;
            b.draw(g2, cx, y);
            cx += b.w;
          });
        },
      };
    }
    /** Formel mit Platzhaltern: „¿“ wird zum Kasten mit „?“; Farbbefehle müssen innerhalb eines Stücks geschlossen sein. */
    function fx(src: string, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      if (!src.includes('¿')) return formula(g, src, fstyle(size, color, weight));
      const parts = src.split('¿');
      const boxes: FormulaBox[] = [];
      parts.forEach((s, i) => {
        if (s) boxes.push(formula(g, s, fstyle(size, color, weight)));
        if (i < parts.length - 1) boxes.push(phBox(size));
      });
      return hcat(boxes, size * 0.12);
    }
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, minSize = 10.5): FormulaBox {
      let s = size;
      let box = fx(src, s, color, weight);
      while (box.w > maxW && s > minSize) {
        s -= 0.5;
        box = fx(src, s, color, weight);
      }
      return box;
    }

    /** Polynom als Formelquelle (höchster Grad zuerst, Einsen vor x entfallen). */
    function polySrc(c: Poly): string {
      const d = degree(c);
      if (d < 0) return '0';
      const parts: string[] = [];
      for (let i = d; i >= 0; i--) {
        const v = Math.round(c[i]! * 1000) / 1000;
        if (Math.abs(v) < 1e-9) continue;
        const abs = Math.abs(v);
        const coef = i > 0 && Math.abs(abs - 1) < 1e-9 ? '' : N(abs, 3);
        const xs = i === 0 ? '' : i === 1 ? 'x' : `x^${i}`;
        parts.push(parts.length ? ` ${v < 0 ? '−' : '+'} ${coef}${xs}` : `${v < 0 ? '−' : ''}${coef}${xs}`);
      }
      return parts.join('') || '0';
    }
    /** Intervall als Text: DE ]−∞; −1], EN (−∞, −1]; geschlossen an endlichen Grenzen oder offen. */
    function ivSrc(from: number, to: number, closed: boolean): string {
      if (!Number.isFinite(from) && !Number.isFinite(to)) return 'ℝ';
      const de = lang === 'de';
      const lo = Number.isFinite(from) ? `${closed ? '[' : de ? ']' : '('}${S(N(from, 2))}` : de ? ']−∞' : '(−∞';
      const hi = Number.isFinite(to) ? `${S(N(to, 2))}${closed ? ']' : de ? '[' : ')'}` : de ? '∞[' : '∞)';
      return `${lo}${de ? '; ' : ', '}${hi}`;
    }
    /** Punktname: H, T, TP (EN: max, min, TP) */
    const kindShort = (k: 'max' | 'min' | 'saddle') => (k === 'max' ? 'H' : k === 'min' ? 'T' : 'TP');
    const kindLong = (k: 'max' | 'min' | 'saddle') => (k === 'max' ? T2('Hochpunkt', 'maximum') : k === 'min' ? T2('Tiefpunkt', 'minimum') : T2('Terrassenpunkt', 'terrace point'));
    const sgnT = (s: Sign) => (s > 0 ? '+' : s < 0 ? '−' : '0');

    /* ---------- Zeichenhilfen ---------- */
    type Align = 'left' | 'center' | 'right';
    type PillOpts = { color?: string; border?: string; align?: Align; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean };
    /** Bereits belegte Flächen im Hauptbild (gegen überlappende Beschriftungen). */
    let placed: Rect[] = [];
    const overlapArea = (a: Rect, b: Rect) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    function fpill(x: number, y: number, src: string, opts: PillOpts = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = fx(src, size, color, opts.weight ?? 700);
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
      g.fillStyle = withAlpha(mixColor(th().bg, th().text, th().dark ? 0.03 : 0), th().dark ? 0.9 : 0.94);
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
      if ((opts.alpha ?? 1) > 0.05) placed.push(rr);
      return rr;
    }
    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
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
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
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
    /** Werte als Pixelpunkte; sehr große Werte werden weit außerhalb gekappt. */
    function sample(pl: Plot, c: Poly, x0: number, x1: number): [number, number][] {
      const out: [number, number][] = [];
      if (!(x1 > x0)) return out;
      const r = pl.rect;
      const n = Math.round(clamp(Math.abs(pl.px(x1) - pl.px(x0)) * 0.9, 16, 900));
      const lim = r.h * 3;
      for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        out.push([pl.px(x), clamp(pl.py(evalPoly(c, x)), r.y - lim, r.y + r.h + lim)]);
      }
      return out;
    }
    /** Fläche zwischen Graph und x-Achse auf [lo; hi], grün oberhalb, rot unterhalb. */
    function fillSigned(pl: Plot, c: Poly, lo: number, hi: number, alpha: number): void {
      if (!(hi > lo) || alpha <= 0.01) return;
      const g = surface.g;
      const dark = th().dark;
      const y0 = pl.py(0);
      const r = pl.rect;
      for (const sign of [1, -1]) {
        const color = sign > 0 ? col.up() : col.down();
        const pts = sample(pl, c, lo, hi).map(([x, y]) => [x, sign > 0 ? Math.min(y, y0) : Math.max(y, y0)] as [number, number]);
        g.save();
        g.globalAlpha *= alpha;
        const grad = g.createLinearGradient(0, sign > 0 ? r.y : r.y + r.h, 0, y0);
        grad.addColorStop(0, withAlpha(color, dark ? 0.44 : 0.32));
        grad.addColorStop(1, withAlpha(color, dark ? 0.14 : 0.08));
        g.fillStyle = grad;
        g.beginPath();
        g.moveTo(pts[0]![0], y0);
        for (const [x, y] of pts) g.lineTo(x, y);
        g.lineTo(pts[pts.length - 1]![0], y0);
        g.closePath();
        g.fill();
        g.restore();
      }
    }
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5 || !Number.isFinite(len)) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.55, y1 - uy * hd + ux * hd * 0.55);
      g.lineTo(x1 - ux * hd + uy * hd * 0.55, y1 - uy * hd - ux * hd * 0.55);
      g.closePath();
      g.fill();
    }
    function vguide(px: number, y0: number, y1: number, color: string, alpha: number, dash: number[] = [5, 4], width = 1.3): void {
      if (alpha <= 0.01 || !Number.isFinite(px) || Math.abs(y1 - y0) < 1) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(Math.round(px) + 0.5, y0);
      g.lineTo(Math.round(px) + 0.5, y1);
      g.stroke();
      g.restore();
    }
    function card(r: Rect, accent?: string): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = mixColor(theme.bg, theme.text, theme.dark ? 0.04 : 0);
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
      g.strokeStyle = mixColor(theme.bg, theme.text, theme.dark ? 0.16 : 0.12);
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }
    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      const rw = right ? formula(g, right, fstyle(fs(12, 11), color, 700)).w + 12 : 0;
      let tsz = fs(13.5, 12.5);
      g.font = `750 ${tsz}px ${th().font}`;
      const room0 = R.w - 2 * pad - 15 - rw;
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
      /** Graph von f zeichnet sich von links nach rechts */
      reveal: number;
      /** Graphen von f′ und f″ */
      dReveal: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, dReveal: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3400) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 100) / 1150)),
        dReveal: ease.inOutCubic(clamp01((t - 700) / 1200)),
        labels: ease.outCubic(clamp01((t - 1500) / 650)),
        cards: clamp01((t - 250) / 900),
        stagger: clamp01((t - 700) / 1500),
      };
    }

    /* ---------- Schritte: Sichtbarkeit und kleine Animationen ---------- */
    /** Sichtbarkeit von Schritt k (0 … 1), beim Einstieg erst nach dem Graphen. */
    function sv(k: number, I: Intro): number {
      return vis[k]!.v * I.labels;
    }
    /**
     * Fortschritt eines Teils der Animation von Schritt k: beginnt `delay` ms nach
     * dem Schrittwechsel und dauert `dur` ms. Ohne laufende Animation: 1.
     */
    function sk(k: number, delay: number, dur: number, e: (t: number) => number = ease.outCubic): number {
      if (!story || story.step !== k) return 1;
      return e(clamp01((frameNow - story.t0 - delay) / dur));
    }
    /** Zeitplan von Schritt 5 bzw. 6: Zellen der Vorzeichentabelle nacheinander. */
    const CELL_MS = 260;
    const cellK = (k: number, j: number, base = 150) => sk(k, base + j * CELL_MS, 360);
    /** Ausbreitender Ring („Puls“) für waagrechte Tangenten. */
    function pulseK(t0: number): number {
      return clamp01((frameNow - t0) / 900);
    }

    /* ---------- Bereiche ---------- */
    /** Größter Betrag von c auf [−R; R] (abgetastet). */
    function rangeOn(c: Poly, R: number): { lo: number; hi: number } {
      let lo = Infinity;
      let hi = -Infinity;
      for (let i = 0; i <= 120; i++) {
        const y = evalPoly(c, -R + (2 * R * i) / 120);
        lo = Math.min(lo, y);
        hi = Math.max(hi, y);
      }
      return { lo, hi };
    }
    function rangeGoals(): Record<keyof typeof rng, number> {
      const f = poly();
      const keyXs = [...A.candidates, ...A.wCandidates, ...Z].filter((x) => Math.abs(x) < 8);
      const s = Math.max(0, ...keyXs.map(Math.abs));
      const rx = clamp(Math.ceil((s * 1.3 + 1.2) * 4) / 4, 2.5, 6);
      // f: an den besonderen Punkten ausrichten, nicht an den steilen Rändern
      const pts = [...A.extrema, ...A.inflections].filter((e) => Math.abs(e.x) <= rx).map((e) => e.y);
      let ys: number[];
      if (pts.length) ys = [...pts, 0, evalPoly(f, 0)];
      else {
        const r0 = rangeOn(f, Math.min(rx, 1.6));
        ys = [r0.lo, r0.hi, 0];
      }
      let lo = Math.min(...ys);
      let hi = Math.max(...ys);
      // etwas vom Verlauf zwischen den Punkten dazu, aber nicht die steilen Ränder
      {
        const sp0 = Math.max(1.6, hi - lo);
        if (hi - lo < 2.5) {
          // sehr flache Merkmale (z. B. x⁴): sonst wirkt der Graph wie ein schmaler Strich
          const ex = rangeOn(f, rx * 0.55);
          lo = Math.min(lo, Math.max(ex.lo, lo - sp0));
          hi = Math.max(hi, Math.min(ex.hi, hi + sp0));
        }
      }
      const span = Math.max(1.6, hi - lo);
      lo -= span * 0.3;
      hi += span * 0.3;
      // f′ und f″: Vorzeichenwechsel sollen gut sichtbar sein
      // nur die Stellen, an denen f′ bzw. f″ interessant sind (nicht die Nullstellen von f)
      const s2 = Math.max(0, ...[...A.candidates, ...A.wCandidates].filter((x) => Math.abs(x) < 8).map(Math.abs));
      const R0 = clamp(s2 + 0.5, 1.3, rx);
      // Werte an den besonderen Stellen bestimmen den Maßstab; die Ränder dürfen hinauslaufen
      const capped = (c: Poly): { lo: number; hi: number } => {
        const r0 = rangeOn(c, R0);
        const crit = [...A.candidates, ...A.wCandidates].filter((x) => Math.abs(x) <= R0);
        const M = Math.max(0, ...crit.map((x) => Math.abs(evalPoly(c, x))));
        if (M < 0.3) return r0;
        return { lo: Math.max(r0.lo, -3.5 * M), hi: Math.min(r0.hi, 3.5 * M) };
      };
      const r1 = capped(A.d1);
      const r2 = capped(A.d2);
      const pad = (r: { lo: number; hi: number }): [number, number] => {
        const l = Math.min(0, r.lo);
        const h = Math.max(0, r.hi);
        const sp = Math.max(1, h - l);
        return [l - sp * 0.14, h + sp * 0.14];
      };
      const [dy0, dy1] = pad(r1);
      const [ey0, ey1] = pad(r2);
      return { rx, fy0: clamp(lo, -80, -0.6), fy1: clamp(hi, 0.6, 80), dy0, dy1, ey0, ey1 };
    }
    function retargetRanges(now: number, instant: boolean): void {
      const goals = rangeGoals();
      for (const key of Object.keys(rng) as (keyof typeof rng)[]) {
        const c = rng[key];
        const v = goals[key];
        if (instant || reduced()) c.jump(v);
        else if (dragging()) c.follow(v, 0.3);
        else if (Math.abs(c.goal - v) > 1e-9) c.glide(v, 800, 0, now);
      }
    }

    /* =====================================================================
     * Hauptbild: Graph von f
     * ===================================================================== */
    /** „Gerade dran“: Schritt k ist der aktuelle (weich), für Hinweise nur in diesem Schritt. */
    const foc = Array.from({ length: STEPS + 1 }, (_, k) => new Chan(p.st === k ? 1 : 0));
    const fv = (k: number, I: Intro) => foc[k]!.v * I.labels;

    function drawTop(now: number, I: Intro): void {
      const g = surface.g;
      const theme = th();
      const rx = rng.rx.v;
      plot.setRangePadded([-rx, rx], [rng.fy0.v, rng.fy1.v], padTop());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      placed = [];
      const r = plot.rect;
      const sp = shownPoly();
      const sa = shownAnalysis();
      const info = kShow.v;
      const f = (x: number) => evalPoly(sp, x);
      const lin = degree(sp) <= 1;
      const P = (x: number, y: number): [number, number] => [plot.px(x), plot.py(y)];


      // Schritt 2: Symmetrie und Verhalten im Unendlichen
      const k2 = fv(2, I) * sv(2, I) * info;
      if (k2 > 0.01 && degree(sp) >= 1) {
        const sym = symmetry(poly());
        const e = sk(2, 100, 900);
        const [ox, oy] = P(0, 0);
        g.save();
        g.globalAlpha *= k2;
        if (sym === 'even') {
          const half = (r.h / 2 + Math.abs(oy - r.y - r.h / 2)) * e;
          g.strokeStyle = withAlpha(col.d2(), 0.85);
          g.lineWidth = 3;
          g.setLineDash([10, 6]);
          g.beginPath();
          g.moveTo(ox, clamp(oy - half, r.y, r.y + r.h));
          g.lineTo(ox, clamp(oy + half, r.y, r.y + r.h));
          g.stroke();
          g.setLineDash([]);
          // Spiegelpfeil
          const ay = r.y + 52;
          arrowPx(ox + 8, ay, ox + 8 + 34 * e, ay, col.d2(), 2, 8);
          arrowPx(ox - 8, ay, ox - 8 - 34 * e, ay, col.d2(), 2, 8);
        } else if (sym === 'odd') {
          halo(ox, oy, col.d2(), 26, 0.9);
          g.strokeStyle = col.d2();
          g.lineWidth = 2.4;
          g.beginPath();
          g.arc(ox, oy, 17, -Math.PI * 0.15, -Math.PI * 0.15 + Math.PI * e);
          g.stroke();
          const ang = -Math.PI * 0.15 + Math.PI * e;
          const hx = ox + 17 * Math.cos(ang);
          const hy = oy + 17 * Math.sin(ang);
          arrowPx(hx - 6 * Math.cos(ang + Math.PI / 2), hy - 6 * Math.sin(ang + Math.PI / 2), hx, hy, col.d2(), 2.2, 8);
          dot(ox, oy, col.d2(), 4.5);
        }
        g.restore();
        const symTxt = sym === 'even' ? T2('achsensymmetrisch zur y-Achse', 'symmetric about the y-axis') : sym === 'odd' ? T2('punktsymmetrisch zum Ursprung', 'symmetric about the origin') : T2('keine einfache Symmetrie', 'no simple symmetry');
        fpillFree(
          [
            { x: r.x + r.w / 2, y: r.y + 54 + (sym === 'even' ? 26 : 0), align: 'center' },
            { x: r.x + r.w - 10, y: r.y + r.h - 22, align: 'right' },
            { x: r.x + 10, y: r.y + r.h - 22, align: 'left' },
          ],
          `\\c{e}{\\t{${symTxt}}}`,
          { size: fs(12, 11), alpha: k2 * sk(2, 300, 500), bounds: r, border: withAlpha(col.d2(), 0.5) },
        );
        // Pfeile an den Enden: f(x) → ±∞
        const [la, lb] = limits(poly());
        const ends: [number, number][] = [
          [-1, la],
          [1, lb],
        ];
        ends.forEach(([side, lim], i) => {
          if (!lim) return;
          const a = k2 * sk(2, 450 + i * 250, 500);
          if (a <= 0.01) return;
          const x = side < 0 ? r.x + 24 : r.x + r.w - 24;
          const up = lim > 0;
          const y0 = up ? r.y + 92 : r.y + r.h - 70;
          g.save();
          g.globalAlpha *= a;
          arrowPx(x, y0, x, y0 + (up ? -34 : 34), col.f(), 3, 11);
          g.restore();
          const al: Align = side < 0 ? 'left' : 'right';
          const dx0 = side < 0 ? 12 : -12;
          fpillFree(
            [
              { x: x + dx0, y: y0 + (up ? -20 : 20), align: al },
              { x: x + dx0, y: y0 + (up ? 12 : -12), align: al },
              { x: x + dx0, y: y0 + (up ? 44 : -44), align: al },
            ],
            r.w < 460 ? `\\c{f}{f(x) → ${up ? '+' : '−'}∞}` : `\\c{f}{x → ${side < 0 ? '−' : '+'}∞: f(x) → ${up ? '+' : '−'}∞}`,
            { size: fs(11.5, 11), alpha: a, bounds: r },
          );
        });
      }

      // Graph von f (beim Einstieg von links nach rechts)
      strokePts(sample(plot, sp, -rx, lerp(-rx, rx, I.reveal)), col.f(), fs(3.4, 2.9), { glow: true });

      // Tangente in P mit Steigungsdreieck (zuerst, damit die Beschriftungen ihr ausweichen)
      if (kTan.v > 0.01) drawTangent(now, I, sp);

      // Griff am Schnittpunkt mit der y-Achse: Graph verschieben
      if (editable() && Math.abs(rng.rx.v) > 0) {
        const [gx, gy] = P(0, f(0));
        if (gy > r.y + 30 && gy < r.y + r.h - 8) {
          g.save();
          g.globalAlpha *= I.labels * 0.9;
          g.strokeStyle = th().muted;
          g.fillStyle = th().bg;
          g.lineWidth = 1.6;
          g.beginPath();
          g.arc(gx, gy, 5, 0, TAU);
          g.fill();
          g.stroke();
          g.fillStyle = th().muted;
          for (const dir of [-1, 1]) {
            g.beginPath();
            g.moveTo(gx, gy + dir * 15);
            g.lineTo(gx - 4.5, gy + dir * 9);
            g.lineTo(gx + 4.5, gy + dir * 9);
            g.closePath();
            g.fill();
          }
          g.restore();
          placed.push({ x: gx - 8, y: gy - 16, w: 16, h: 32 });
        }
      }

      // Schritt 3: Nullstellen von f
      const k3 = sv(3, I) * info;
      if (k3 > 0.01 && degree(sp) >= 1) {
        SZ.forEach((z, i) => {
          if (Math.abs(z) > rx) return;
          const e = sk(3, 150 + i * 260, 480, ease.outBack);
          const [zx, zy] = P(z, 0);
          if (fv(3, I) > 0.01) halo(zx, zy, col.f(), 20, k3 * fv(3, I) * e);
          dot(zx, zy, col.f(), 5.5 * e, k3 * (0.55 + 0.45 * fv(3, I)), true);
          const a = k3 * fv(3, I) * sk(3, 350 + i * 260, 400);
          if (a > 0.01) {
            const m = zeroOrder(poly(), Z[i] ?? z);
            const extra = m === 2 ? T2(' doppelt', ' double') : m === 3 ? T2(' dreifach', ' triple') : '';
            fpillFree(
              [
                { x: zx, y: zy + 20, align: 'center' },
                { x: zx, y: zy - 20, align: 'center' },
              ],
              `N_${i + 1}(${cN(`z${i}`, z, 2, true)} | 0)${extra ? `\\c{m}{\\t{${extra}}}` : ''}`,
              { size: fs(11.5, 11), alpha: a, bounds: r },
            );
          }
        });
      }

      // Schritt 4: waagrechte Tangenten an den Kandidaten
      const k4 = sv(4, I) * info;
      if (k4 > 0.01 && !lin) {
        sa.candidates.forEach((c, i) => {
          if (Math.abs(c) > rx) return;
          const e = sk(4, 900 + i * 300, 450);
          const [cx, cy] = P(c, f(c));
          const len = 26 * e;
          g.save();
          g.globalAlpha *= k4 * (0.5 + 0.5 * fv(4, I));
          g.strokeStyle = col.ext();
          g.lineWidth = 2.6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(cx - len, cy);
          g.lineTo(cx + len, cy);
          g.stroke();
          g.restore();
          if (vis[5]!.v < 0.5) dot(cx, cy, col.ext(), 4.2 * e, k4, true);
        });
      }

      // Schritt 5: Hoch-, Tief- und Terrassenpunkte
      const k5 = sv(5, I) * info;
      if (k5 > 0.01 && !lin) {
        sa.extrema.forEach((ex, i) => {
          if (Math.abs(ex.x) > rx) return;
          const cell = 2 * i + 1;
          const e = sk(5, 150 + cell * CELL_MS + 120, 560, ease.outBack);
          const [cx, cy] = P(ex.x, ex.y);
          halo(cx, cy, col.ext(), 22, k5 * e * (0.5 + 0.5 * fv(5, I)));
          dot(cx, cy, col.ext(), 6.5 * e, k5, ex.kind === 'saddle');
          const la = k5 * sk(5, 150 + cell * CELL_MS + 380, 450);
          if (la > 0.01) {
            const asW = ex.kind === 'saddle' && sv(6, I) * info > 0.5 && sa.inflections.some((w) => Math.abs(w.x - ex.x) < 1e-4);
            const src = `\\c{x}{${kindShort(ex.kind)}(${cN(`e${i}x`, ex.x, 2, true)} | ${cN(`e${i}y`, ex.y, 2, true)})}${asW ? `\\c{w}{\\t{ = W}}` : ''}`;
            const up = ex.kind !== 'min';
            fpillFree(
              [
                { x: cx, y: cy + (up ? -22 : 22), align: 'center' },
                { x: cx + 14, y: cy + (up ? -18 : 18), align: 'left' },
                { x: cx - 14, y: cy + (up ? -18 : 18), align: 'right' },
                { x: cx, y: cy + (up ? 24 : -24), align: 'center' },
              ],
              src,
              { size: fs(12.5, 11.5), alpha: la, color: col.ext(), border: withAlpha(col.ext(), 0.5), bounds: r },
            );
          }
        });
      }

      // Schritt 6: Wendepunkte mit Wendetangente
      const k6 = sv(6, I) * info;
      if (k6 > 0.01 && !lin) {
        sa.wCandidates.forEach((w, i) => {
          if (Math.abs(w) > rx) return;
          const ii = inflectionInfo(sp, w);
          const cell = 2 * i + 1;
          const e = sk(6, 700 + cell * CELL_MS + 120, 560, ease.outBack);
          const [cx, cy] = P(w, ii.y);
          if (!ii.change) {
            // Nullstelle von f″ ohne Vorzeichenwechsel: kein Wendepunkt
            const a = k6 * fv(6, I) * e;
            dot(cx, cy, col.infl(), 5, a * 0.8, true);
            if (a > 0.01) fpillFree([{ x: cx, y: cy + 24, align: 'center' }, { x: cx + 14, y: cy - 20, align: 'left' }], `\\c{e}{\\t{${T2('kein Wendepunkt', 'no inflection')}}}`, { size: fs(11.5, 11), alpha: a, bounds: r });
            return;
          }
          const isTP = sa.extrema.some((ex) => ex.kind === 'saddle' && Math.abs(ex.x - w) < 1e-4) && sv(5, I) > 0.5;
          // Wendetangente wächst
          const tg = sk(6, 700 + cell * CELL_MS + 300, 600);
          const span = (52 / Math.hypot(plot.scale.x, ii.slope * plot.scale.y)) * tg;
          g.save();
          g.globalAlpha *= k6 * 0.9;
          plot.segment([w - span, ii.y - ii.slope * span], [w + span, ii.y + ii.slope * span], { color: col.infl(), width: 2 });
          g.restore();
          halo(cx, cy, col.infl(), 20, k6 * e * (0.4 + 0.6 * fv(6, I)));
          dot(cx, cy, col.infl(), 6 * e, k6);
          const la = k6 * sk(6, 700 + cell * CELL_MS + 380, 450);
          if (la > 0.01 && !isTP) {
            const src = `\\c{w}{W(${cN(`w${i}x`, w, 2, true)} | ${cN(`w${i}y`, ii.y, 2, true)})}`;
            const right = ii.slope <= 0;
            fpillFree(
              [
                { x: cx + (right ? 14 : -14), y: cy - 18, align: right ? 'left' : 'right' },
                { x: cx + (right ? -14 : 14), y: cy + 18, align: right ? 'right' : 'left' },
                { x: cx, y: cy + 24, align: 'center' },
                { x: cx, y: cy - 24, align: 'center' },
              ],
              src,
              { size: fs(12.5, 11.5), alpha: la, color: col.infl(), border: withAlpha(col.infl(), 0.5), bounds: r },
            );
          }
        });
      }


      // Pulse an waagrechten Tangenten
      pulses = pulses.filter((q) => frameNow - q.t0 < 900);
      for (const q of pulses) {
        const t = pulseK(q.t0);
        const [cx, cy] = P(q.x, f(q.x));
        g.save();
        g.globalAlpha *= (1 - t) * 0.9;
        g.strokeStyle = col.t();
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(cx, cy, 8 + 26 * ease.outCubic(t), 0, TAU);
        g.stroke();
        g.restore();
      }

      // Schritt 7: Bänder steigt/fällt und Krümmung am unteren Rand (über dem Graphen)
      const k7 = sv(7, I) * info;
      if (k7 > 0.01 && !lin) drawBands(sa, k7);

      // Legende
      const leg = `\\c{f}{f(x) = ${polySrc(poly())}}`;
      const legR = fpill(r.x + 10, r.y + 18, leg, { align: 'left', size: fs(13, 12), alpha: I.panel, border: withAlpha(col.f(), 0.5) });
      placed.push(legR);
      // Hinweis: Ergebnisse verdeckt
      if (kShow.v < 0.99 && I.labels > 0.3) {
        const msg = sm() ? T2('Ergebnisse verdeckt', 'Results hidden') : T2('Ergebnisse verdeckt – erst rechnen, dann aufdecken', 'Results hidden – work them out, then reveal');
        fpill(r.x + r.w - 10, r.y + 18 + (legR.x + legR.w > r.x + r.w * 0.5 ? 34 : 0), `\\c{m}{\\t{${msg}}}`, { align: 'right', size: fs(12, 11), alpha: (1 - kShow.v) * I.labels, bounds: r });
      }
      // linear/konstant: Hinweis ab Schritt 4
      if (lin && sv(4, I) > 0.01) {
        fpillFree([{ x: r.x + r.w / 2, y: r.y + 56, align: 'center' }, { x: r.x + r.w / 2, y: r.y + r.h - 30, align: 'center' }], `\\c{m}{\\t{${T2('f′ ist konstant: keine Extrem- und Wendestellen', 'f′ is constant: no extrema or inflection points')}}}`, { size: fs(12, 11), alpha: sv(4, I), bounds: r });
      }
      void theme;
      plot.end();
    }

    /** Schritt 7: farbige Bänder für Monotonie (Vorzeichen von f′) und Krümmung (Vorzeichen von f″). */
    function drawBands(sa: Analysis, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const r = plot.rect;
      const h = fs(15, 14);
      const y1 = r.y + r.h - 2 * h - 10;
      const y2 = r.y + r.h - h - 6;
      g.save();
      g.globalAlpha *= alpha;
      g.fillStyle = withAlpha(theme.bg, 0.92);
      g.fillRect(r.x, y1 - 6, r.w, r.y + r.h - y1 + 6);
      g.restore();
      const rows: { y: number; curv: boolean; reveal: number; list: { from: number; to: number; sign: number }[]; color: (s: number) => string; label: (s: number) => string }[] = [
        { y: y1, curv: false, reveal: sk(7, 100, 1300, ease.inOutCubic), list: sa.mono, color: (s) => (s > 0 ? col.up() : s < 0 ? col.down() : theme.muted), label: (s) => (s > 0 ? T2('↗ steigt', '↗ increases') : s < 0 ? T2('↘ fällt', '↘ decreases') : '→') },
        { y: y2, curv: true, reveal: sk(7, 900, 1300, ease.inOutCubic), list: sa.curv, color: (s) => (s !== 0 ? col.d2() : theme.muted), label: (s) => (s > 0 ? T2('∪ links', '∪ left') : s < 0 ? T2('∩ rechts', '∩ right') : '') },
      ];
      for (const row of rows) {
        if (row.reveal <= 0.001) continue;
        const xr = lerp(r.x, r.x + r.w, row.reveal);
        g.save();
        g.globalAlpha *= alpha;
        g.beginPath();
        g.rect(r.x, row.y - 2, xr - r.x, h + 4);
        g.clip();
        for (const s of row.list) {
          const xa = Math.max(r.x, plot.px(s.from));
          const xb = Math.min(r.x + r.w, plot.px(s.to));
          if (xb - xa < 2) continue;
          const al = row.curv && s.sign < 0 ? (theme.dark ? 0.28 : 0.18) : theme.dark ? 0.6 : 0.42;
          g.fillStyle = withAlpha(row.color(s.sign), al);
          roundRect(g, xa + 1, row.y, xb - xa - 2, h, h / 2);
          g.fill();
          let txt = row.label(s.sign);
          g.font = `700 ${fs(11, 11)}px ${theme.font}`;
          if (txt && g.measureText(txt).width >= xb - xa - 8) txt = txt.slice(0, 1);
          if (txt && g.measureText(txt).width < xb - xa - 6) {
            g.fillStyle = theme.text;
            g.textAlign = 'center';
            g.textBaseline = 'middle';
            g.fillText(txt, (xa + xb) / 2, row.y + h / 2 + 0.5);
          }
        }
        g.restore();
      }
    }

    /** Tangente in P, Steigungsdreieck und Steigung (zählt mit). */
    function drawTangent(now: number, I: Intro, sp: Poly): void {
      const g = surface.g;
      const r = plot.rect;
      const a = kTan.v * I.labels;
      const x = sweep ? shownPx(now) : exactPx(X.v);
      if (x < plot.bounds.xMin || x > plot.bounds.xMax) return;
      const tl = tangentLine(sp, x);
      const { y, m } = tl;
      const [cx, cy] = [plot.px(x), plot.py(y)];
      // P außerhalb des Bildes: nur im Bild von f′ und in der Karte
      if (cy < r.y + 6 || cy > r.y + r.h - 6) return;
      const flat = Math.abs(m) < 1e-9 * (1 + Math.abs(y));
      // Tangente mit fester Länge auf dem Bildschirm
      const half = Math.min(r.w * 0.3, 170) / Math.hypot(plot.scale.x, m * plot.scale.y);
      g.save();
      g.globalAlpha *= a;
      plot.segment([x - half, y - m * half], [x + half, y + m * half], { color: col.t(), width: 2.6 });
      g.restore();
      // Steigungsdreieck: Δx so, dass es gut sichtbar ist
      const unit = plot.scale.x;
      const fits = (d: number) => d * unit >= 34 && d * unit <= 130 && Math.abs(m * d * plot.scale.y) <= r.h * 0.32;
      const dX = [1, 0.5, 2, 0.25, 0.1].find(fits) ?? [1, 0.5, 0.25, 0.1].find((d) => Math.abs(m * d * plot.scale.y) <= r.h * 0.32) ?? 0.1;
      const dir = x + dX <= plot.bounds.xMax - 0.05 ? 1 : -1;
      const x2 = x + dir * dX;
      const y2 = y + m * dir * dX;
      const tri = a * (flat ? 0 : 1);
      if (tri > 0.01 && Math.abs(plot.py(y2) - cy) > 3) {
        g.save();
        g.globalAlpha *= tri;
        g.fillStyle = withAlpha(col.t(), th().dark ? 0.2 : 0.12);
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(plot.px(x2), cy);
        g.lineTo(plot.px(x2), plot.py(y2));
        g.closePath();
        g.fill();
        g.lineCap = 'round';
        g.strokeStyle = withAlpha(th().muted, 0.95);
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(plot.px(x2), cy);
        g.stroke();
        g.strokeStyle = col.t();
        g.lineWidth = 3.2;
        g.beginPath();
        g.moveTo(plot.px(x2), cy);
        g.lineTo(plot.px(x2), plot.py(y2));
        g.stroke();
        g.restore();
        if (Math.abs(plot.py(y2) - cy) > 26) {
          const mid = (cy + plot.py(y2)) / 2;
          const right = dir > 0;
          placed.push(fpill(plot.px(x2) + (right ? 10 : -10), clamp(mid, r.y + 44, r.y + r.h - 14), `\\c{t}{Δy ${eqS(m * dX)} ${N(cnt('tri.dy', m * dX), 2)}}`, { align: right ? 'left' : 'right', size: fs(11.5, 11), alpha: tri * 0.95, bounds: r, border: withAlpha(col.t(), 0.5) }));
        }
        if (Math.abs(plot.px(x2) - cx) > 46) placed.push(fpill((cx + plot.px(x2)) / 2, cy + (m * dir >= 0 ? 15 : -15), `\\c{m}{Δx = ${N(dX, 2)}}`, { size: fs(11, 11), alpha: tri * 0.9, color: th().muted, bounds: r }));
      }
      halo(cx, cy, col.f(), 20, a * (sweep ? 1 : 0.6));
      dot(cx, cy, col.f(), 7, a);
      // Steigung
      const mv = cnt('tan.m', m);
      const src = flat ? `\\c{t}{f′(${N(x, 2)}) = 0: \\t{${T2('waagrecht', 'horizontal')}}}` : `\\c{t}{m = f′(${N(x, 2)}) ${eqS(m)} ${N(mv, 2)}}`;
      const up = m >= 0;
      fpillFree(
        [
          { x: cx - 14, y: cy + (up ? 22 : -22), align: 'right' },
          { x: cx + 14, y: cy + (up ? 22 : -22), align: 'left' },
          { x: cx - 14, y: cy + (up ? -24 : 24), align: 'right' },
          { x: cx + 14, y: cy + (up ? -24 : 24), align: 'left' },
        ],
        src,
        { size: fs(12, 11), alpha: a, bounds: r, border: withAlpha(col.t(), 0.55) },
      );
    }

    /* =====================================================================
     * Bilder von f′ und f″
     * ===================================================================== */
    function drawSub(pl: Plot, which: 1 | 2, now: number, I: Intro): void {
      const g = surface.g;
      const theme = th();
      const rx = rng.rx.v;
      const y0 = which === 1 ? rng.dy0.v : rng.ey0.v;
      const y1 = which === 1 ? rng.dy1.v : rng.ey1.v;
      pl.setRangePadded([-rx, rx], [y0, y1], padSub());
      pl.resize();
      const alpha = clamp01(kDer.v * 1.6);
      g.save();
      g.globalAlpha *= alpha * I.panel;
      pl.begin();
      pl.grid();
      pl.axes();
      const r = pl.rect;
      const sp = shownPoly();
      const sa = shownAnalysis();
      const c = which === 1 ? sa.d1 : sa.d2;
      const color = which === 1 ? col.d1() : col.d2();
      const info = kShow.v;
      const stepK = which === 1 ? 5 : 6;
      const cuts = which === 1 ? sa.candidates : sa.wCandidates.filter((w) => inflectionInfo(sp, w).change);
      // Vorzeichen als Fläche, Intervall für Intervall (wie die Tabelle)
      const kf = sv(stepK, I) * info;
      if (kf > 0.01) {
        const bounds = [-rx, ...cuts.filter((x) => Math.abs(x) < rx), rx];
        for (let j = 0; j + 1 < bounds.length; j++) fillSigned(pl, c, bounds[j]!, bounds[j + 1]!, kf * cellK(stepK, 2 * j, which === 1 ? 150 : 700));
      }
      // Graph (Schritt 1: entsteht von links nach rechts)
      const rv = I.dReveal * sk(1, which === 1 ? 250 : 900, 1100, ease.inOutCubic);
      strokePts(sample(pl, c, -rx, lerp(-rx, rx, rv)), color, fs(3, 2.6), { glow: true });
      // Nullstellen: Kandidaten (Schritt 4) bzw. Wendestellen-Kandidaten (Schritt 6)
      const zk = which === 1 ? 4 : 6;
      const zs = which === 1 ? sa.candidates : sa.wCandidates;
      const kz = sv(zk, I) * info;
      if (kz > 0.01 && degree(c) >= 1) {
        zs.forEach((z, i) => {
          if (Math.abs(z) > rx) return;
          const e = sk(zk, 150 + i * 300, 480, ease.outBack);
          const [zx, zy] = [pl.px(z), pl.py(0)];
          halo(zx, zy, color, 18, kz * e * (0.4 + 0.6 * fv(zk, I)));
          dot(zx, zy, color, 5.5 * e, kz, true);
          // Vorzeichenwechsel an der Stelle (ab Schritt 5 bzw. 6)
          const ks = sv(stepK, I) * info * cellK(stepK, 2 * i + 1, which === 1 ? 150 : 700);
          if (ks > 0.01) {
            const [ls, rs] = sidesAt(c, z, 1e-3);
            const change = ls !== rs && ls !== 0 && rs !== 0;
            const lab = change ? `${sgnT(ls)} → ${sgnT(rs)}` : T2('kein VZW', 'no sign change');
            const below = evalPoly(c, z + (rx * 2) / 50) > 0 || !change;
            fpill(zx, zy + (below ? 17 : -17), `\\t{${lab}}`, { size: fs(11, 11), alpha: ks, color: change ? (rs > 0 ? col.up() : col.down()) : theme.muted, bounds: r });
          }
        });
      }
      // Punkt (x₀ | f′(x₀)) mit Balken: Höhe = Steigung der Tangente oben
      if (kTan.v > 0.01) {
        const x = sweep ? shownPx(now) : exactPx(X.v);
        const v = evalPoly(c, x);
        const px = pl.px(x);
        const py = clamp(pl.py(v), r.y - 4, r.y + r.h + 4);
        const zy = pl.py(0);
        const a = kTan.v * I.labels;
        g.save();
        g.globalAlpha *= a;
        if (which === 1) {
          const grad = g.createLinearGradient(0, py, 0, zy);
          grad.addColorStop(0, col.t());
          grad.addColorStop(1, withAlpha(col.t(), 0.25));
          g.fillStyle = grad;
          roundRect(g, px - 3, Math.min(py, zy), 6, Math.abs(zy - py), 3);
          g.fill();
        }
        g.restore();
        dot(px, py, which === 1 ? col.t() : color, which === 1 ? 6 : 4.5, a);
        if (which === 1 && Math.abs(py - zy) > 4) {
          const right = px < r.x + r.w * 0.66;
          fpill(px + (right ? 12 : -12), clamp(py + (v >= 0 ? -16 : 16), r.y + 40, r.y + r.h - 12), `\\c{t}{${N(cnt('sub.m', v), 2)}}`, { align: right ? 'left' : 'right', size: fs(11.5, 11), alpha: a * 0.95, bounds: r });
        }
      }
      // Legende
      const name = which === 1 ? 'f′' : 'f″';
      const key = which === 1 ? 'd' : 'e';
      const term = show() || kShow.v > 0.5 ? polySrc(which === 1 ? A.d1 : A.d2) : '¿';
      const leg = term === '¿' ? `\\c{${key}}{${name}(x) = }¿` : `\\c{${key}}{${name}(x) = ${term}}`;
      fpill(r.x + 10, r.y + 15, leg, { align: 'left', size: fs(12.5, 11.5), alpha: I.panel * clamp01(kDer.v * 2), border: withAlpha(color, 0.5) });
      pl.end();
      g.restore();
    }

    /** Senkrechte Hilfslinien: Nullstelle von f′ ↔ Extrempunkt, Nullstelle von f″ ↔ Wendepunkt, P durch alle Bilder. */
    function drawLinks(now: number, I: Intro): void {
      const P0 = panels();
      const sp = shownPoly();
      const sa = shownAnalysis();
      const rx = rng.rx.v;
      const info = kShow.v;
      const r = plot.rect;
      const yF = (x: number) => clamp(plot.py(evalPoly(sp, x)), r.y + 4, r.y + r.h);
      const subY = (pl: Plot) => pl.py(0);
      const g = surface.g;
      g.save();
      g.beginPath();
      const S0 = regions().stack;
      g.rect(S0.x, S0.y, S0.w, S0.h);
      g.clip();
      const k4 = sv(4, I) * info;
      if (k4 > 0.01) {
        sa.candidates.forEach((c, i) => {
          if (Math.abs(c) > rx) return;
          const e = sk(4, 420 + i * 300, 650, ease.inOutCubic);
          const top = yF(c);
          const bottom = P0.mid ? subY(plotD) : plot.py(0);
          const bottomAll = P0.bot ? P0.bot.y + P0.bot.h - 4 : bottom;
          vguide(plot.px(c), lerp(bottom, top, e), bottom, col.ext(), 0.7 * k4);
          if (P0.bot) vguide(plot.px(c), bottom, lerp(bottom, bottomAll, e), col.ext(), 0.35 * k4, [2, 4]);
        });
      }
      const k6 = sv(6, I) * info;
      if (k6 > 0.01) {
        sa.wCandidates.forEach((w, i) => {
          if (Math.abs(w) > rx || !inflectionInfo(sp, w).change) return;
          const e = sk(6, 420 + i * 300, 650, ease.inOutCubic);
          const top = yF(w);
          const bottom = P0.bot ? subY(plotE) : plot.py(0);
          vguide(plot.px(w), lerp(bottom, top, e), bottom, col.infl(), 0.7 * k6, [2, 4]);
        });
      }
      // Stelle x₀ von P durch alle Bilder
      if (kTan.v > 0.01 && P0.mid) {
        const x = sweep ? shownPx(now) : exactPx(X.v);
        if (Math.abs(x) <= rx) {
          const last = P0.bot ?? P0.mid;
          vguide(plot.px(x), yF(x), last.y + last.h - 4, col.t(), 0.45 * kTan.v * I.labels, [2, 4]);
        }
      }
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    /** Karte zeichnen (oder nur ihre Höhe messen); `compact`: kürzere Fassung, wenn der Platz nicht reicht. */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    type RowSpec = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string; text?: boolean; indent?: number };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    /** Farbe auf alle Stücke zwischen Platzhaltern verteilen. */
    const C = (key: string, src: string) =>
      src
        .split('¿')
        .map((s) => (s ? `\\c{${key}}{${s}}` : ''))
        .join('¿');
    const noteRow = (txt: string, size = fs(12, 11), color = th().muted): RowSpec => ({ src: txt, text: true, size, color, gap: 6 });

    /** Zeilen messen bzw. zeichnen (mit gestaffeltem Einblenden und Hervorhebung); gibt die Höhe zurück. */
    function drawRows(R: Rect, y0: number, rows: RowSpec[], draw: boolean, stag: number): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        const maxW = R.w - 2 * pad - 4 - (r.indent ?? 0);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null as FormulaBox | null, lines, font, h: lines.length * size * 1.32 };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600);
        return { box, lines: [] as string[], font: '', h: rowH(box) };
      });
      const total = items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0);
      if (!draw) return total;
      let y = y0;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = clamp01(row.at ?? clamp01(stag * (rows.length + 2) - i));
        if (y + it.h > R.y + R.h - 2) return;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        const x = R.x + pad + (row.indent ?? 0);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, x - 6, y - 3, R.x + R.w - pad - x + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = (1 - ease.outCubic(a)) * 10;
        if (it.box) it.box.draw(g, x + dx, y + it.box.asc);
        else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, x + dx, y + size * 0.66 + j * size * 1.32));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      return total;
    }
    function formulaCard(R: Rect, measure: boolean, title: string, accent: string, rows: RowSpec[], stag: number, right?: string): number {
      const h = 38 + drawRows(R, 0, rows, false, 1) + 4;
      if (measure) return h;
      card(R, accent);
      cardTitle(R, title, accent, right);
      drawRows(R, R.y + 38, rows, true, stag);
      return h;
    }
    /** Gestaffeltes Einblenden nach dem Einstieg bzw. nach einem Schrittwechsel. */
    function stagger(I: Intro): number {
      if (reduced()) return 1;
      return Math.min(I.stagger, clamp01((frameNow - stepT0) / 1300));
    }
    /** Zeile erst zeigen, wenn die Animation des Schritts so weit ist (sonst gestaffelt). */
    const atStory = (k: number, delay: number) => (story && story.step === k ? sk(k, delay, 380) : undefined);

    /* ---------- Inhalt der Schritte ---------- */
    function stepRows(st: number, compact: boolean): RowSpec[] {
      const f = poly();
      const n = deg();
      const rows: RowSpec[] = [];
      const note = (de: string, en: string) => {
        if (!compact) rows.push(noteRow(T2(de, en)));
      };
      const lin = n <= 1;
      const big = fs(13.5, 12.5);
      const small = fs(12.5, 11.5);
      const xv = (v: number) => `${eqS(v)} ${N(v, 2)}`;
      const linNote = () => rows.push({ src: T2('f′ ist konstant: Die Tangente hat überall dieselbe Steigung, also gibt es keine Extrem- und Wendestellen.', 'f′ is constant: the tangent has the same slope everywhere, so there are no extrema or inflection points.'), text: true, size: small, color: th().muted });
      switch (st) {
        case 1: {
          note('Potenzregel (xⁿ)′ = n · xⁿ⁻¹ für jeden Summanden; ein konstanter Summand fällt weg.', 'Power rule (xⁿ)′ = n · xⁿ⁻¹ for each term; a constant term disappears.');
          rows.push({ src: C('f', `f(x) = ${polySrc(f)}`), size: big });
          rows.push({ src: C('d', `f′(x) = ${S(polySrc(A.d1))}`), size: big, at: atStory(1, 150) });
          rows.push({ src: C('e', `f″(x) = ${S(polySrc(A.d2))}`), size: big, at: atStory(1, 750) });
          rows.push({ src: C('m', `f‴(x) = ${S(polySrc(derive(A.d2)))}`), size: small, at: atStory(1, 1300) });
          break;
        }
        case 2: {
          if (n < 1) {
            rows.push({ src: `\\t{${T2('f ist konstant: achsensymmetrisch, f(x) = ' + N(f[0]!, 2) + ' für alle x.', 'f is constant: f(x) = ' + N(f[0]!, 2) + ' for all x.')}}`, text: true });
            break;
          }
          const sym = symmetry(f);
          const symTxt = sym === 'even' ? T2('achsensymmetrisch zur y-Achse', 'symmetric about the y-axis') : sym === 'odd' ? T2('punktsymmetrisch zum Ursprung', 'symmetric about the origin') : T2('keine einfache Symmetrie', 'no simple symmetry');
          rows.push({ src: show() ? `\\c{e}{\\t{${symTxt}}}` : `\\t{${T2('Symmetrie:', 'Symmetry:')}} ¿`, size: big, at: atStory(2, 250) });
          if (show())
            note(
              sym === 'even' ? 'Nur gerade Hochzahlen (auch x⁰): f(−x) = f(x).' : sym === 'odd' ? 'Nur ungerade Hochzahlen: f(−x) = −f(x).' : 'Gerade und ungerade Hochzahlen kommen gemischt vor.',
              sym === 'even' ? 'Only even exponents (including x⁰): f(−x) = f(x).' : sym === 'odd' ? 'Only odd exponents: f(−x) = −f(x).' : 'Even and odd exponents are mixed.',
            );
          const [la, lb] = limits(f);
          const inf = (v: number) => (v > 0 ? '+∞' : '−∞');
          rows.push({ src: C('f', `x → −∞: f(x) → ${S(inf(la))}`), size: big, at: atStory(2, 450) });
          rows.push({ src: C('f', `x → +∞: f(x) → ${S(inf(lb))}`), size: big, at: atStory(2, 700) });
          const lead = polySrc(f.map((v, i) => (i === n ? v : 0)));
          note(`Entscheidend ist der Summand mit der höchsten Hochzahl: ${lead.replace(/x\^(\d)/, (_, d: string) => `x${'⁰¹²³⁴'[Number(d)]}`)}.`, `What matters is the term with the highest exponent: ${lead.replace(/x\^(\d)/, (_, d: string) => `x${'⁰¹²³⁴'[Number(d)]}`)}.`);
          break;
        }
        case 3: {
          if (n < 1) {
            rows.push({ src: `\\t{${T2('f ist konstant – Nullstellen nur, wenn f = 0.', 'f is constant – zeros only if f = 0.')}}`, text: true });
            break;
          }
          rows.push({ src: C('f', `f(x) = 0  ⇔  ${polySrc(f)} = 0`), size: big });
          if (!Z.length) rows.push({ src: show() ? `\\t{${T2('keine Nullstellen', 'no zeros')}}` : 'x = ¿', size: big, at: atStory(3, 200) });
          for (let i = 0; i < Z.length; i += 2) {
            const part = Z.slice(i, i + 2).map((z, j) => {
              const m = zeroOrder(f, z);
              const tag = show() && m >= 2 ? ` \\c{m}{\\t{(${m === 2 ? T2('doppelt', 'double') : T2('dreifach', 'triple')})}}` : '';
              return `x_${i + j + 1} ${show() ? xv(z) : '= ¿'}${tag}`;
            });
            rows.push({ src: part.join(';   '), size: big, at: atStory(3, 150 + i * 260 + 250) });
          }
          note('Tipp: x ausklammern oder bei nur geraden Hochzahlen x² = z setzen (Substitution).', 'Tip: factor out x, or with only even exponents set x² = z (substitution).');
          break;
        }
        case 4: {
          if (lin) {
            linNote();
            break;
          }
          rows.push({ src: `${C('d', 'f′(x) = 0  ⇔  ')}${C('d', `${S(polySrc(A.d1))} = 0`)}`, size: big });
          if (!A.candidates.length) rows.push({ src: show() ? `\\t{${T2('keine Lösung: nirgends waagrechte Tangente', 'no solution: nowhere a horizontal tangent')}}` : 'x = ¿', size: big, at: atStory(4, 200) });
          for (let i = 0; i < A.candidates.length; i += 2) {
            const part = A.candidates.slice(i, i + 2).map((c, j) => `x_${i + j + 1} ${show() ? xv(c) : '= ¿'}`);
            rows.push({ src: C('x', part.join(';   ')), size: big, at: atStory(4, 150 + i * 300 + 300) });
          }
          note('Das sind nur Kandidaten: Dort ist die Tangente waagrecht. Ob Hoch-, Tief- oder Terrassenpunkt, entscheidet erst Schritt 5.', 'These are only candidates: the tangent is horizontal there. Whether maximum, minimum or terrace point is decided in step 5.');
          break;
        }
        case 5: {
          if (lin) {
            linNote();
            break;
          }
          if (!A.extrema.length) rows.push({ src: show() ? `\\t{${T2('keine Kandidaten, also keine Extremstellen', 'no candidates, so no extrema')}}` : '¿', size: big });
          A.extrema.slice(0, 3).forEach((e, i) => {
            const [l, r] = sidesAt(A.d1, e.x);
            const change = e.kind !== 'saddle';
            const at = atStory(5, 150 + (2 * i + 1) * CELL_MS + 200);
            const vzw = show() ? (change ? `${sgnT(l)} → ${sgnT(r)}` : `${sgnT(l)} → ${sgnT(r)}`) : '¿';
            rows.push({ src: `${C('x', `x ${show() ? xv(e.x) : '= ¿'}`)}\\t{:}  f′: ${vzw}  ⇒  ${C('x', show() ? `${kindShort(e.kind)}(${N(e.x, 2)} | ${N(e.y, 2)})` : '¿')}`, size: big, at });
            // f″-Kriterium als Gegenprobe
            const v = evalPoly(A.d2, e.x);
            const t2 = secondTest(f, e.x);
            let crit: string;
            if (!show()) crit = `f″(¿) = ¿`;
            else if (t2 === 'max') crit = `f″(${N(e.x, 2)}) ${eqS(v)} ${N(v, 2)} < 0  ⇒  \\t{${T2('Hochpunkt', 'maximum')}} ✓`;
            else if (t2 === 'min') crit = `f″(${N(e.x, 2)}) ${eqS(v)} ${N(v, 2)} > 0  ⇒  \\t{${T2('Tiefpunkt', 'minimum')}} ✓`;
            else crit = `f″(${N(e.x, 2)}) = 0: \\t{${T2('keine Aussage – der VZW entscheidet', 'no conclusion – the sign change decides')}}`;
            rows.push({ src: C('m', crit), size: small, gap: 10, indent: 10, at });
          });
          note('f′: + → − ⇒ Hochpunkt, − → + ⇒ Tiefpunkt, kein Wechsel ⇒ Terrassenpunkt. Gegenprobe: f″-Kriterium.', 'f′: + → − ⇒ maximum, − → + ⇒ minimum, no change ⇒ terrace point. Cross-check: second-derivative test.');
          break;
        }
        case 6: {
          if (lin) {
            linNote();
            break;
          }
          if (degree(A.d2) < 1) {
            rows.push({ src: C('e', `f″(x) = ${S(polySrc(A.d2))}`), size: big });
            rows.push({ src: `\\t{${show() ? T2(`f″ ist konstant ≠ 0: keine Wendestellen, überall ${A.d2[0]! > 0 ? 'linksgekrümmt' : 'rechtsgekrümmt'}.`, `f″ is a nonzero constant: no inflection points, concave ${A.d2[0]! > 0 ? 'up' : 'down'} everywhere.`) : T2('Gibt es Wendestellen?', 'Are there inflection points?')}}`, text: true, size: small, color: th().muted });
            break;
          }
          rows.push({ src: `${C('e', 'f″(x) = 0  ⇔  ')}${C('e', `${S(polySrc(A.d2))} = 0`)}`, size: big });
          if (!A.wCandidates.length) rows.push({ src: show() ? `\\t{${T2('keine Lösung: keine Wendestellen', 'no solution: no inflection points')}}` : 'x = ¿', size: big });
          A.wCandidates.slice(0, 3).forEach((w, i) => {
            const ii = inflectionInfo(f, w);
            const [l, r] = sidesAt(A.d2, w);
            const at = atStory(6, 700 + (2 * i + 1) * CELL_MS + 200);
            const vzw = show() ? (ii.change ? `${sgnT(l)} → ${sgnT(r)}` : `${sgnT(l)} → ${sgnT(r)}`) : '¿';
            const res = show() ? (ii.change ? `W(${N(w, 2)} | ${N(ii.y, 2)})` : `\\t{${T2('kein Wendepunkt', 'no inflection')}}`) : '¿';
            rows.push({ src: `${C('w', `x ${show() ? xv(w) : '= ¿'}`)}\\t{:}  f″: ${vzw}  ⇒  ${C('w', res)}`, size: big, at });
            let extra: string;
            if (!show()) extra = 'f‴(¿) = ¿';
            else if (ii.saddle) extra = `\\t{${T2('Steigung 0: Wendepunkt mit waagrechter Tangente (Terrassenpunkt)', 'slope 0: inflection with horizontal tangent (terrace point)')}}`;
            else if (ii.change) extra = `f‴(${N(w, 2)}) ${eqS(ii.d3)} ${N(ii.d3, 2)} ≠ 0 ✓${regions().col.w >= 320 ? `   \\t{${T2('Steigung', 'slope')}} ${eqS(ii.slope)} ${N(ii.slope, 2)}` : ''}`;
            else extra = `\\t{${T2('kein VZW: keine Krümmungsänderung', 'no sign change: curvature stays')}}`;
            rows.push({ src: C('m', extra), size: small, gap: 10, indent: 10, at });
          });
          note('Wechselt f″ das Vorzeichen, wechselt der Graph zwischen Links- und Rechtskurve.', 'If f″ changes sign, the graph switches between concave up and concave down.');
          break;
        }
        default: {
          if (lin) {
            rows.push({ src: `\\t{${n < 1 ? T2('f ist konstant.', 'f is constant.') : A.d1[0]! > 0 ? T2('f ist auf ganz ℝ streng monoton steigend (Gerade).', 'f is strictly increasing on ℝ (a line).') : T2('f ist auf ganz ℝ streng monoton fallend (Gerade).', 'f is strictly decreasing on ℝ (a line).')}}`, text: true });
            break;
          }
          const group = (list: { from: number; to: number; sign: number }[], s: number, closed: boolean) =>
            list
              .filter((m) => m.sign === s)
              .map((m) => ivSrc(m.from, m.to, closed))
              .join(T2(' und ', ' and '));
          if (!show()) {
            // verdeckt: keine Intervallmuster zeigen (sonst stünde schon da, wo f steigt oder fällt)
            rows.push({ src: `${C('u', `\\t{${T2('streng monoton steigend in', 'strictly increasing on')}} `)}¿`, size: small, at: atStory(7, 300), hl: col.up() });
            rows.push({ src: `${C('n', `\\t{${T2('streng monoton fallend in', 'strictly decreasing on')}} `)}¿`, size: small, at: atStory(7, 600), hl: col.down() });
            rows.push({ src: `${C('e', `\\t{${T2('linksgekrümmt in', 'concave up on')}} `)}¿`, size: small, at: atStory(7, 1000) });
            rows.push({ src: `${C('e', `\\t{${T2('rechtsgekrümmt in', 'concave down on')}} `)}¿`, size: small, at: atStory(7, 1300) });
            note('Gibt es kein solches Intervall, schreibe „keines“.', 'If there is no such interval, write “none”.');
            break;
          }
          const up = group(A.mono, 1, true);
          const down = group(A.mono, -1, true);
          // Zeile „Wort + Intervalle“; passt sie nicht in die Karte, stehen die Intervalle in einer zweiten Zeile
          const ivRow = (key: string, de: string, en: string, ivs: string, at: number | undefined, hl?: string) => {
            const head = C(key, `\\t{${T2(de, en)}} `);
            const room = regions().col.w - 2 * fs(14, 12) - 4;
            if (fx(`${head}${ivs}`, small).w <= room) rows.push({ src: `${head}${ivs}`, size: small, at, hl });
            else {
              rows.push({ src: head, size: small, at, hl, gap: 2 });
              rows.push({ src: ivs, size: small, at, hl, indent: 10 });
            }
          };
          if (up) ivRow('u', 'streng monoton steigend in', 'strictly increasing on', up, atStory(7, 300), col.up());
          if (down) ivRow('n', 'streng monoton fallend in', 'strictly decreasing on', down, atStory(7, 600), col.down());
          const left = group(A.curv, 1, false);
          const right = group(A.curv, -1, false);
          if (left) ivRow('e', 'linksgekrümmt in', 'concave up on', left, atStory(7, 1000));
          if (right) ivRow('e', 'rechtsgekrümmt in', 'concave down on', right, atStory(7, 1300));
          note('Die Extremstellen dürfen zu beiden angrenzenden Monotonieintervallen gezählt werden.', 'The extrema may be counted in both neighbouring intervals of monotonicity.');
        }
      }
      return rows;
    }

    /** Hit-Flächen der Schrittpunkte (für das Antippen). */
    let dotHits: { x: number; y: number; r: number; k: number }[] = [];
    let hoverDot: number | null = null;

    function stepCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const st = p.st;
        const rows = stepRows(st, compact);
        const tsz = fs(13.5, 12.5);
        const tfont = `750 ${tsz}px ${theme.font}`;
        const title = `${st}. ${T2(STEP_TITLES[st - 1]!.de, STEP_TITLES[st - 1]!.en)}`;
        const tlines = wrapText(title, R.w - 2 * pad, tfont);
        const head = 38 + 34 + 12 + tlines.length * tsz * 1.3;
        const h = head + drawRows(R, 0, rows, false, 1) + 4;
        if (measure) return h;
        card(R, col.f());
        cardTitle(R, T2('Untersuchung', 'Investigation'), col.f(), `\\t{${T2('Schritt', 'Step')} ${st}/${STEPS}}`);
        // Fortschritt: sieben Punkte zum Antippen
        const yD = R.y + 38 + 14;
        const x0 = R.x + pad + 10;
        const x1 = R.x + R.w - pad - 10;
        const dx = (x1 - x0) / (STEPS - 1);
        const rr = Math.min(fs(10, 9), dx * 0.36);
        g.save();
        g.lineCap = 'round';
        g.strokeStyle = withAlpha(theme.muted, 0.35);
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(x0, yD);
        g.lineTo(x1, yD);
        g.stroke();
        g.strokeStyle = col.f();
        g.beginPath();
        g.moveTo(x0, yD);
        g.lineTo(x0 + dx * (clamp(stepPos.v, 1, STEPS) - 1), yD);
        g.stroke();
        g.restore();
        dotHits = [];
        for (let k = 1; k <= STEPS; k++) {
          const cx = x0 + dx * (k - 1);
          const done = k < st;
          const cur = k === st;
          const hov = hoverDot === k && editable();
          const pop = cur && !reduced() ? 1 + 0.18 * (1 - clamp01((frameNow - stepT0) / 450)) : 1;
          const r0 = rr * pop * (hov ? 1.12 : 1);
          if (cur) halo(cx, yD, col.f(), r0 * 2.3, 0.8);
          g.save();
          if (done || cur) {
            g.fillStyle = cur ? col.f() : mixColor(col.f(), theme.bg, 0.25);
            g.beginPath();
            g.arc(cx, yD, r0, 0, TAU);
            g.fill();
          } else {
            g.fillStyle = mixColor(theme.bg, theme.text, theme.dark ? 0.04 : 0);
            g.strokeStyle = hov ? col.f() : withAlpha(theme.muted, 0.7);
            g.lineWidth = 1.6;
            g.beginPath();
            g.arc(cx, yD, r0, 0, TAU);
            g.fill();
            g.stroke();
          }
          g.font = `800 ${Math.round(r0 * 1.15)}px ${theme.font}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillStyle = done || cur ? theme.bg : theme.muted;
          g.fillText(done ? '✓' : String(k), cx, yD + 0.5);
          g.restore();
          dotHits.push({ x: cx, y: yD, r: Math.max(r0, 14), k });
        }
        // Titel des Schritts
        const ty = yD + 30;
        g.font = tfont;
        g.save();
        if (!reduced()) g.globalAlpha *= ease.outCubic(clamp01((frameNow - stepT0) / 400));
        g.fillStyle = theme.text;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        tlines.forEach((ln, j) => g.fillText(ln, R.x + pad, ty + j * tsz * 1.3));
        g.restore();
        drawRows(R, R.y + head, rows, true, stagger(I));
        return h;
      };
    }

    /** Vorzeichentabelle von f′ (mit Verhalten von f) bzw. von f″ (mit Krümmung). */
    function signCard(which: 1 | 2, I: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const f = poly();
        const xs = which === 1 ? A.candidates : A.wCandidates;
        const c = which === 1 ? A.d1 : A.d2;
        const t: SignChart = signChart(c, xs);
        const K = t.xs.length;
        const rh = fs(24, 22);
        const nRows = 3;
        const noteTxt =
          which === 1
            ? T2('Ein Testwert je Intervall genügt: Zwischen den Nullstellen behält f′ sein Vorzeichen.', 'One test value per interval is enough: between its zeros f′ keeps its sign.')
            : T2('f″ > 0: Linkskurve (∪), f″ < 0: Rechtskurve (∩).', 'f″ > 0: concave up (∪), f″ < 0: concave down (∩).');
        const nfont = `550 ${fs(12, 11)}px ${theme.font}`;
        const nlines = compact ? [] : wrapText(noteTxt, R.w - 2 * pad, nfont);
        const h = 40 + nRows * rh + 8 + nlines.length * fs(12, 11) * 1.32 + 10;
        if (measure) return h;
        const stepK = which === 1 ? 5 : 6;
        const base = which === 1 ? 150 : 700;
        const accent = which === 1 ? col.d1() : col.d2();
        card(R, accent);
        cardTitle(R, which === 1 ? T2('Vorzeichentabelle von f′', 'Sign chart of f′') : T2('Vorzeichentabelle von f″', 'Sign chart of f″'), accent);
        const info = kShow.v >= 0.5;
        let y = R.y + 40;
        // Spalten
        const lsz = fs(12.5, 11.5);
        const labels = which === 1 ? ['x', 'f′(x)', 'f'] : ['x', 'f″(x)', T2('Krümmung', 'curvature')];
        g.font = `650 ${lsz}px ${theme.font}`;
        const lw = Math.min(R.w * 0.3, Math.max(...labels.map((s) => g.measureText(s).width)) + 12);
        const avail = R.w - 2 * pad - lw;
        const wi = avail / (K + 1 + 0.8 * K);
        const wz = 0.8 * wi;
        const cols: { x: number; w: number; pt: number | null; iv: number | null }[] = [];
        let cx = R.x + pad + lw;
        for (let j = 0; j <= 2 * K; j++) {
          const pt = j % 2 === 1 ? (j - 1) / 2 : null;
          const w = pt === null ? wi : wz;
          cols.push({ x: cx, w, pt, iv: pt === null ? j / 2 : null });
          cx += w;
        }
        // Spalte mit P hervorheben
        if (kTan.v > 0.01 && !sweep) {
          const xp = exactPx(X.v);
          let j = 2 * K;
          for (let i = 0; i < K; i++) {
            if (Math.abs(xp - t.xs[i]!) < 1e-4) {
              j = 2 * i + 1;
              break;
            }
            if (xp < t.xs[i]!) {
              j = 2 * i;
              break;
            }
          }
          const cc = cols[j]!;
          g.save();
          g.globalAlpha *= kTan.v;
          g.fillStyle = withAlpha(col.t(), theme.dark ? 0.16 : 0.1);
          roundRect(g, cc.x + 1, y - 1, cc.w - 2, nRows * rh + 2, 6);
          g.fill();
          g.restore();
        }
        const centerText = (s: string, x: number, yy: number, font: string, color: string) => {
          g.font = font;
          g.fillStyle = color;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(s, x, yy);
        };
        // Zeilenbeschriftung
        const labelAt = (s: string, yy: number, color: string, math = true) => {
          if (math) formula(g, s, fstyle(lsz, color, 650)).draw(g, R.x + pad, yy + 4.5);
          else {
            g.font = `650 ${lsz}px ${theme.font}`;
            g.fillStyle = color;
            g.textAlign = 'left';
            g.textBaseline = 'middle';
            g.fillText(s, R.x + pad, yy);
          }
        };
        const ym = (i: number) => y + rh * i + rh / 2;
        labelAt('x', ym(0), theme.muted);
        labelAt(which === 1 ? '\\c{d}{f′(x)}' : '\\c{e}{f″(x)}', ym(1), theme.text);
        labelAt(which === 1 ? '\\c{f}{f}' : T2('Krümmung', 'curvature'), ym(2), theme.text, which === 1);
        // Linien
        g.strokeStyle = withAlpha(theme.text, 0.2);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y + rh + 0.5);
        g.lineTo(R.x + R.w - pad, y + rh + 0.5);
        g.moveTo(R.x + pad, y + 2 * rh + 0.5);
        g.lineTo(R.x + R.w - pad, y + 2 * rh + 0.5);
        g.stroke();
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.16);
        g.setLineDash([2, 3]);
        for (const cc of cols) {
          if (cc.pt === null) continue;
          g.beginPath();
          g.moveTo(cc.x + cc.w / 2, y + rh - 3);
          g.lineTo(cc.x + cc.w / 2, y + nRows * rh - 2);
          g.stroke();
        }
        g.restore();
        const sgnFont = `800 ${fs(15, 14)}px ${theme.font}`;
        const symFont = `800 ${fs(15, 14)}px ${theme.font}`;
        const ptFont = `800 ${fs(12.5, 11.5)}px ${theme.font}`;
        const hf = `700 ${fs(12, 11)}px ${theme.font}`;
        const ph = (x: number, yy: number, w: number) => phBox(fs(11.5, 11), Math.min(w - 4, 26)).draw(g, x - Math.min(w - 4, 26) / 2, yy + 4);
        cols.forEach((cc, j) => {
          const a = sv(stepK, I) * cellK(stepK, j, base) * clamp01(I.stagger * 4 - 0.5);
          if (a <= 0.01) return;
          g.save();
          g.globalAlpha *= a;
          const mx = cc.x + cc.w / 2;
          const lift = (1 - a) * 6;
          // Kopfzeile
          if (cc.pt !== null) {
            const xv = t.xs[cc.pt]!;
            let s = N(xv, 2);
            g.font = hf;
            if (g.measureText(s).width > cc.w + wi * 0.7) s = N(xv, 1);
            if (info) centerText(s, mx, ym(0), hf, which === 1 ? col.ext() : col.infl());
            else ph(mx, ym(0) - 4, cc.w + wi * 0.5);
          } else if (K === 0) centerText('ℝ', mx, ym(0), hf, theme.muted);
          // Vorzeichen
          const s: Sign = cc.iv !== null ? t.iv[cc.iv]! : t.at[cc.pt!]!;
          if (!info && cc.iv !== null) ph(mx, ym(1) - 4 + lift, cc.w);
          else if (info || cc.pt !== null) centerText(cc.iv !== null ? sgnT(s) : '0', mx, ym(1) + lift, cc.iv !== null ? sgnFont : ptFont, cc.iv !== null ? (s > 0 ? col.up() : s < 0 ? col.down() : theme.muted) : theme.text);
          // Verhalten von f bzw. Krümmung
          if (!info) {
            ph(mx, ym(2) - 4 + lift, cc.w);
          } else if (cc.iv !== null) {
            if (s !== 0) {
              g.fillStyle = withAlpha(which === 1 ? (s > 0 ? col.up() : col.down()) : col.d2(), theme.dark ? 0.24 : 0.13);
              roundRect(g, cc.x + 2, y + 2 * rh + 3, cc.w - 4, rh - 6, 6);
              g.fill();
            }
            const sym = which === 1 ? (s > 0 ? '↗' : s < 0 ? '↘' : '→') : s > 0 ? '∪' : s < 0 ? '∩' : '–';
            centerText(sym, mx, ym(2) + lift, symFont, which === 1 ? (s > 0 ? col.up() : s < 0 ? col.down() : theme.muted) : col.d2());
          } else {
            const i = cc.pt!;
            let lab: string;
            let color: string;
            if (which === 1) {
              const e = A.extrema[i];
              lab = e ? kindShort(e.kind) : '';
              color = col.ext();
            } else {
              const ii = inflectionInfo(f, t.xs[i]!);
              lab = ii.change ? 'W' : '–';
              color = col.infl();
            }
            centerText(lab, mx, ym(2) + lift, ptFont, color);
          }
          g.restore();
        });
        y += nRows * rh + 8;
        if (nlines.length) {
          g.save();
          g.font = nfont;
          g.fillStyle = theme.muted;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          g.globalAlpha *= clamp01(I.stagger * 3 - 1.5);
          nlines.forEach((ln, j) => g.fillText(ln, R.x + pad, y + fs(12, 11) * 0.66 + j * fs(12, 11) * 1.32));
          g.restore();
        }
        return h;
      };
    }

    /** Werte in P: Punkt, Steigung, Tangentengleichung, Bedeutung. */
    function pointCard(I: Intro, now: number): CardFn {
      return (R, measure, compact) => {
        const x = sweep ? shownPx(now) : exactPx(X.v);
        const f = poly();
        const tl = tangentLine(f, x);
        const dd = evalPoly(A.d2, x);
        const flat = Math.abs(tl.m) < 1e-9;
        const state = flat
          ? T2('f′ = 0: waagrechte Tangente – Kandidat für eine Extremstelle', 'f′ = 0: horizontal tangent – candidate for an extremum')
          : tl.m > 0
            ? T2('f′ > 0: f steigt hier', 'f′ > 0: f is increasing here')
            : T2('f′ < 0: f fällt hier', 'f′ < 0: f is decreasing here');
        const stCol = flat ? col.t() : tl.m > 0 ? col.up() : col.down();
        const rows: RowSpec[] = [
          { src: C('f', `P(${N(x, 2)} | ${cN('pc.y', tl.y)})`), size: fs(13, 12) },
          { src: `\\b{${C('t', `m = f′(${N(x, 2)}) ${eqS(tl.m)} ${cN('pc.m', tl.m)}`)}}`, size: fs(14, 13), hl: col.t() },
        ];
        if (!compact) rows.push({ src: C('t', `t(x) ${isExact(tl.n) && isExact(tl.m) ? '=' : '≈'} ${polySrc([Math.round(tl.n * 100) / 100, Math.round(tl.m * 100) / 100])}`), size: fs(13, 12) });
        rows.push({ src: `\\t{${state}}`, size: fs(12.5, 11.5), color: stCol, weight: 700 });
        if (!compact) rows.push({ src: C('m', `f″(${N(x, 2)}) ${eqS(dd)} ${cN('pc.dd', dd)}: \\t{${Math.abs(dd) < 1e-9 ? T2('keine Krümmung ablesbar', 'no curvature') : dd > 0 ? T2('Linkskurve', 'concave up') : T2('Rechtskurve', 'concave down')}}`), size: fs(12, 11) });
        return formulaCard(R, measure, T2('Tangente in P', 'Tangent at P'), col.t(), rows, stagger(I));
      };
    }

    /** Steckbrief: was bisher herausgefunden wurde. */
    function profileCard(I: Intro): CardFn {
      return (R, measure) => {
        const st = p.st;
        const f = poly();
        const rows: RowSpec[] = [];
        const sz = fs(12.5, 11.5);
        if (deg() >= 1) {
          const sym = symmetry(f);
          if (st >= 2) rows.push({ src: `\\t{${T2('Symmetrie', 'Symmetry')}:} ${show() ? `\\c{e}{\\t{${sym === 'even' ? T2('zur y-Achse', 'about the y-axis') : sym === 'odd' ? T2('zum Ursprung', 'about the origin') : T2('keine', 'none')}}}` : '¿'}`, size: sz });
          if (st >= 3) rows.push({ src: `\\t{${T2('Nullstellen', 'Zeros')}:} ${!show() ? '¿' : Z.length ? Z.map((z) => N(z, 2)).join('; ') : `\\t{${T2('keine', 'none')}}`}`, size: sz });
          if (st >= 5) rows.push({ src: !show() ? `\\t{${T2('Extrempunkte', 'Extrema')}:} ¿` : A.extrema.length ? A.extrema.map((e) => C('x', `${kindShort(e.kind)}(${N(e.x, 2)} | ${N(e.y, 2)})`)).join(';  ') : `\\t{${T2('keine Extrempunkte', 'no extrema')}}`, size: sz });
          if (st >= 6) rows.push({ src: !show() ? `\\t{${T2('Wendepunkte', 'Inflection points')}:} ¿` : A.inflections.length ? A.inflections.map((w) => C('w', `W(${N(w.x, 2)} | ${N(w.y, 2)})`)).join(';  ') : `\\t{${T2('keine Wendepunkte', 'no inflection points')}}`, size: sz });
        }
        if (!rows.length) return 0;
        return formulaCard(R, measure, T2('Steckbrief', 'Profile'), col.ext(), rows, stagger(I));
      };
    }

    /** Hinweise zur Bedienung (am Anfang, solange Platz ist). */
    function tipsCard(I: Intro): CardFn {
      return (R, measure, compact) => {
        if (compact) return 0;
        const rows: RowSpec[] = [
          noteRow(T2('„Nächster Schritt“ oder die Punkte 1–7 antippen: Jeder Schritt erscheint als kleine Animation.', '“Next step” or tap the dots 1–7: each step appears as a small animation.'), fs(12, 11), th().text),
          noteRow(T2('P auf dem Graphen ziehen: Die Steigung der Tangente ist der Wert von f′ darunter.', 'Drag P along the graph: the slope of the tangent is the value of f′ below.'), fs(12, 11), th().text),
          noteRow(T2('Den Punkt auf der y-Achse ziehen: f verschiebt sich, f′ und f″ bleiben gleich.', 'Drag the point on the y-axis: f moves, f′ and f″ stay the same.'), fs(12, 11), th().text),
        ];
        return formulaCard(R, measure, T2('So geht’s', 'How it works'), th().muted, rows, stagger(I));
      };
    }

    function drawColumn(C0: Rect, I: Intro, now: number): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list: { id: string; fn: CardFn; alpha: number }[] = [{ id: 'step', fn: stepCard(I), alpha: 1 }];
      if (vis[5]!.v > 0.01 && deg() >= 2) list.push({ id: 'vz1', fn: signCard(1, I), alpha: vis[5]!.v });
      if (vis[6]!.v > 0.01 && degree(A.d2) >= 1) list.push({ id: 'vz2', fn: signCard(2, I), alpha: vis[6]!.v });
      if (kTan.v > 0.01) list.push({ id: 'pt', fn: pointCard(I, now), alpha: kTan.v });
      if (p.st >= 2) list.push({ id: 'prof', fn: profileCard(I), alpha: 1 });
      else list.push({ id: 'tips', fn: tipsCard(I), alpha: 1 });
      const two = !regions().wide && C0.w >= 440;
      const colW = two ? (C0.w - gap) / 2 : C0.w;
      const room = (i: number) => ({ x: C0.x, y: C0.y, w: i === 0 || !two ? C0.w : colW, h: C0.h });
      const full = list.map((c, i) => c.fn(room(i), true, false));
      const short = list.map((c, i) => c.fn(room(i), true, true));
      const compactSet = new Set<number>();
      const heightOf = (i: number) => (compactSet.has(i) ? short[i]! : full[i]!);
      const total = () => {
        if (!two) return list.reduce((s, _, i) => s + heightOf(i) + gap, -gap);
        let yl = heightOf(0) + gap;
        let yr = yl;
        for (let i = 1; i < list.length; i++) {
          if (yl <= yr) yl += heightOf(i) + gap;
          else yr += heightOf(i) + gap;
        }
        return Math.max(yl, yr) - gap;
      };
      for (let i = list.length - 1; i >= 0; i--) {
        if (total() <= C0.h + 1) break;
        if (short[i]! < full[i]!) compactSet.add(i);
      }
      let yL = C0.y;
      let yR = C0.y;
      list.forEach((c, i) => {
        const goal = heightOf(i);
        if (goal <= 0) return;
        let x = C0.x;
        let y = yL;
        let w = C0.w;
        if (two && i > 0) {
          const leftCol = yL <= yR;
          x = leftCol ? C0.x : C0.x + colW + gap;
          y = leftCol ? yL : yR;
          w = colW;
        }
        if (y + goal > C0.y + C0.h + 1) return;
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
        const a = clamp01(I.cards * 1.6 - i * 0.22) * c.alpha;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        const R = { x, y, w, h: hh };
        g.save();
        g.beginPath();
        g.rect(R.x - 20, R.y - 20, R.w + 40, R.h + 26);
        g.clip();
        c.fn(R, false, compactSet.has(i));
        g.restore();
        g.restore();
        const adv = hh * clamp01(c.alpha * 1.5) + gap;
        if (two && i > 0) {
          if (x === C0.x) yL += adv;
          else yR += adv;
        } else {
          yL += adv;
          yR = yL;
        }
      });
    }

    /* ---------- Antippen der Schrittpunkte ---------- */
    new TapTarget(surface, {
      hit: (px, py) => {
        if (!editable()) return null;
        for (const d of dotHits) if (Math.hypot(px - d.x, py - d.y) <= d.r + 4) return `s${d.k}`;
        return null;
      },
      onTap: (id) => {
        const k = Number(id.slice(1));
        if (k !== p.st) setP({ st: k });
      },
      onHover: (id) => {
        hoverDot = id ? Number(id.slice(1)) : null;
      },
    });

    /* ---------- Ergebnisse unter der Bühne ---------- */
    function updateReadouts(): void {
      const f = poly();
      const n = deg();
      const none = T2('keine', 'none');
      ctx.readout('ext', n >= 2 && A.extrema.length ? A.extrema.map((e) => `${kindLong(e.kind)} ${fmt.point(clean(e.x, 2), clean(e.y, 2))}`).join('; ') : none);
      ctx.readout('infl', n >= 3 && A.inflections.length ? A.inflections.map((w) => fmt.point(clean(w.x, 2), clean(w.y, 2))).join('; ') : none);
      ctx.readout('zer', n >= 1 && Z.length ? Z.map((z) => `x ${eqS(z)} ${N(z, 2)}`).join('; ') : n < 1 && Math.abs(f[0]!) < 1e-12 ? T2('alle x (Nullfunktion)', 'all x (zero function)') : none);
      if (n < 1) ctx.readout('mono', T2('konstant', 'constant'));
      else {
        const part = (s: number, word: string) => {
          const ivs = A.mono.filter((m) => m.sign === s).map((m) => ivSrc(m.from, m.to, true).replace(/¿/g, '?'));
          return ivs.length ? `${word} ${ivs.join(T2(' und ', ' and '))}` : '';
        };
        const txt = [part(1, T2('steigend in', 'increasing on')), part(-1, T2('fallend in', 'decreasing on'))].filter(Boolean).join(' · ');
        ctx.readout('mono', txt.replace(/\\t\{|\}/g, ''));
      }
      if (p.tan) {
        const x = exactPx();
        const m = evalPoly(A.d1, x);
        ctx.readout('slope', { html: `<var>f</var>′(${N(x, 2)}) ${eqS(m)} ${N(m, 2)}` });
      } else ctx.readout('slope', null);
    }

    function setLabels(): void {
      ctx.setAction('next', { enabled: editable() && p.st < STEPS, label: p.st < STEPS ? T2(`Nächster Schritt (${p.st + 1}/${STEPS})`, `Next step (${p.st + 1}/${STEPS})`) : T2('Fertig ✓', 'Done ✓') });
      ctx.setAction('prev', { enabled: editable() && p.st > 1 });
      ctx.setAction('restart', { enabled: editable() && p.st > 1 });
      ctx.setAction('tan', { enabled: editable() });
      ctx.setAction('reveal', { enabled: editable() });
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
      for (const c of [...allChans(), ...foc]) if (c.step(now, dt)) anim = true;
      if (story && now - story.t0 > 4600) story = null;
      if (sweep) {
        const x = shownPx(now);
        for (const c of p.show ? A.candidates : []) if ((sweep.last - c) * (x - c) < 0 || (x === c && sweep.last !== c)) pulses.push({ x: c, t0: now });
        sweep.last = x;
        if (now - sweep.t0 > SWEEP_MS) {
          sweep = null;
          X.jump(p.px);
        }
      }
      if (intro !== null || story || sweep || pulses.length || dragging() || (!reduced() && now - stepT0 < 1400)) anim = true;
      const I = introState(now);
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = I.panel;
      g.translate(0, (1 - I.panel) * 10);
      drawTop(now, I);
      const P0 = panels();
      if (P0.mid) drawSub(plotD, 1, now, I);
      if (P0.bot) drawSub(plotE, 2, now, I);
      drawLinks(now, I);
      g.restore();
      drawColumn(regions().col, I, now);
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init' || reduced();
        if (source === 'replace') {
          sweep = null;
          story = null;
          pulses = [];
        }
        recompute();
        // Koeffizienten gleiten (Graph morpht)
        COEF.forEach((key: CoefKey, i) => {
          const v = p[key] as number;
          const c = CC[i]!;
          if (instant) c.jump(v);
          else if (source === 'replace') c.glide(v, 800, i * 45, now);
          else if (c.goal !== v) c.follow(v, dragging() ? 0.05 : 0.16);
        });
        if (instant) X.jump(p.px);
        else if (source === 'replace') X.glide(p.px, 850, 120, now);
        else X.follow(p.px, dragging() ? 0.03 : 0.14);
        // Schritte
        const st = p.st;
        if (changed.has('st') && source !== 'init') {
          stepT0 = now;
          story = !reduced() && st === lastSt + 1 && source !== 'replace' ? { step: st, t0: now } : null;
        }
        const forward = st > lastSt;
        lastSt = st;
        for (let k = 1; k <= STEPS; k++) {
          const goal = st >= k ? 1 : 0;
          const c = vis[k]!;
          if (instant) c.jump(goal);
          else if (c.goal !== goal) c.glide(goal, goal ? 520 : 380, goal && forward && !story ? (k - 1) * 120 : 0, now);
          const fg = st === k ? 1 : 0;
          if (instant) foc[k]!.jump(fg);
          else if (foc[k]!.goal !== fg) foc[k]!.glide(fg, 500, 0, now);
        }
        if (instant) stepPos.jump(st);
        else stepPos.glide(st, 520, 0, now, ease.outCubic);
        const flags: [Chan, number, number][] = [
          [kDer, p.der ? 1 : 0, 650],
          [kTan, p.tan ? 1 : 0, 420],
          [kShow, p.show ? 1 : 0, 900],
        ];
        for (const [c, goal, dur] of flags) {
          if (instant) c.jump(goal);
          else if (c.goal !== goal) c.glide(goal, dur, 0, now);
        }
        if (source === 'init' && !reduced()) {
          intro = now;
          stepT0 = now;
        }
        retargetRanges(now, instant);
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'next' && p.st < STEPS) setP({ st: p.st + 1 });
        else if (id === 'prev' && p.st > 1) setP({ st: p.st - 1 });
        else if (id === 'restart') setP({ st: 1 });
        else if (id === 'tan') {
          if (!p.tan) setP({ tan: true });
          const rx = rng.rx.goal;
          const from = -rx + 0.15;
          const to = Math.round((rx - 0.15) * 100) / 100;
          if (!reduced()) sweep = { t0: now, from, to, last: from };
          setP({ px: to });
        } else if (id === 'reveal') setP({ show: true });
        setLabels();
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
