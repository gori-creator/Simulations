import { defineSimulation, ease, foldNet, mesh3d, mixColor, Plot, prefersReducedMotion, roundRect, Surface, vec3, View3D, withAlpha, type NetFace3D, type Rect, type Vec2, type Vec3 } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  boxCritical,
  boxReducedQuadratic,
  canHeight,
  canOptimum,
  coneCylHeight,
  coneOwnVolume,
  isGlobal,
  LIFE_GEOM,
  lifeNewton,
  lifeSines,
  lifeStraight,
  lifeTime,
  objective,
  quality,
  type Edge,
  type Life,
  type Objective,
  type ProbKey,
  type ProbParams,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

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

/** Bezeichnungen je Problem. */
interface Meta {
  title: Txt;
  short: Txt;
  /** Name der Variablen und der Zielgröße */
  v: string;
  z: string;
  /** Einheiten der Variablen und der Zielgröße (zweisprachig, wo nötig: LE/FE ↔ units) */
  ux: string | Txt;
  uz: string | Txt;
  /** Zielgröße in Worten */
  goal: Txt;
  /** Was ist die Variable? */
  vname: Txt;
  /** Nachkommastellen der Zielgröße */
  dz: number;
}

const META: Record<ProbKey, Meta> = {
  box: { title: L('Schachtel aus Karton', 'Box from a sheet of card'), short: L('Schachtel', 'Box'), v: 'x', z: 'V', ux: 'cm', uz: 'cm³', goal: L('Volumen', 'volume'), vname: L('Seite der ausgeschnittenen Quadrate = Höhe', 'side of the cut-out squares = height'), dz: 1 },
  can: { title: L('Dose mit kleinster Oberfläche', 'Can with the smallest surface'), short: L('Dose', 'Can'), v: 'r', z: 'O', ux: 'cm', uz: 'cm²', goal: L('Oberfläche (Blech)', 'surface area (metal)'), vname: L('Radius der Dose', 'radius of the can'), dz: 1 },
  rect: { title: L('Rechteck unter einer e-Funktion', 'Rectangle under an exponential'), short: L('Rechteck', 'Rectangle'), v: 'u', z: 'A', ux: L('LE', 'units'), uz: L('FE', 'square units'), goal: L('Flächeninhalt', 'area'), vname: L('Breite des Rechtecks', 'width of the rectangle'), dz: 3 },
  cone: { title: L('Größter Zylinder im Kegel', 'Largest cylinder in a cone'), short: L('Zylinder im Kegel', 'Cylinder in a cone'), v: 'r', z: 'V', ux: 'cm', uz: 'cm³', goal: L('Volumen des Zylinders', 'volume of the cylinder'), vname: L('Radius des Zylinders', 'radius of the cylinder'), dz: 1 },
  life: { title: L('Rettungsschwimmer: schnellster Weg', 'Lifeguard: fastest route'), short: L('Rettungsschwimmer', 'Lifeguard'), v: 'x', z: 'T', ux: 'm', uz: 's', goal: L('Zeit bis zur Person', 'time to reach the swimmer'), vname: L('Stelle am Ufer, an der er ins Wasser geht', 'point on the shore where the lifeguard enters the water'), dz: 2 },
};

/** Startwert der Variablen beim Wechsel des Problems (Regler). */
const START: Record<ProbKey, number> = { box: 2, can: 3, rect: 0.8, cone: 2, life: 24 };
/** Kleiner Abstand vom offenen Rand (die Grenzfälle selbst sind keine Schachtel, kein Zylinder …). */
const MARGIN: Record<ProbKey, [number, number]> = { box: [0.05, 0.05], can: [0, 0], rect: [0.05, 0], cone: [0.05, 0.05], life: [0, 0] };
const IS3D = (k: ProbKey) => k === 'box' || k === 'can' || k === 'cone';
/** Ablauf „Optimum suchen“ (ms): abtasten, Ableitung null setzen, Optimum, Ränder, fertig. */
const HUNT = { scan0: 450, scan1: 3300, back0: 3700, back1: 5200, glow: 5200, ends: 5700, done: 6900 };
const PARAM_KEYS = ['a', 'b', 'v', 'ch', 'cr', 'v1', 'v2'] as const;

/**
 * Extremwertprobleme mit Differentialrechnung. Oben ein gegenständliches Bild:
 * ein Karton, aus dem durch Ausschneiden der Ecken eine Schachtel gefaltet
 * wird (3D, drehbar, Faltanimation), eine Dose, die bei festem Volumen
 * schlanker oder dicker wird, ein Rechteck unter einer e-Funktion, ein
 * Zylinder in einem Glaskegel mit dem Strahlensatz-Schnitt und ein
 * Rettungsschwimmer am Strand (Weg über Sand und Wasser, Winkel zum Lot,
 * Wettrennen). Die Variable lässt sich im Bild und auf dem Graphen ziehen.
 * Darunter der Graph der Zielfunktion mit Tangente, Randwerten und Optimum
 * und der Streifen der Ableitung mit Vorzeichen. Herzstück ist „Optimum
 * suchen“: Die Variable läuft durch den Definitionsbereich, der Graph
 * entsteht, dann wird die Ableitung null gesetzt (Karte mit Rechnung Schritt
 * für Schritt), das Optimum leuchtet auf, das Objekt gleitet in die optimale
 * Form, die Randwerte werden verglichen. Rechts Karten mit Lage, Lösungsweg
 * und einer Probe (Maße, h = 2r, 4/9 des Kegels, Brechungsgesetz). Mit
 * „Lösungsweg zeigen“ aus sind Graph und Ergebnisse verdeckt (Aufgaben).
 */
export default defineSimulation({
  id: 'extremwertprobleme',
  dragHint: true,
  layout: { aspect: 1.25, aspectNarrow: 0.3 },
  groups: [
    { id: 'data', label: L('Daten', 'Data') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'prob',
      type: 'choice',
      label: L('Problem', 'Problem'),
      options: [
        { value: 'box', label: L('Schachtel aus Karton', 'Box from a sheet of card') },
        { value: 'can', label: L('Dose mit kleinster Oberfläche', 'Can with the smallest surface') },
        { value: 'rect', label: L('Rechteck unter einer e-Funktion', 'Rectangle under an exponential') },
        { value: 'cone', label: L('Größter Zylinder im Kegel', 'Largest cylinder in a cone') },
        { value: 'life', label: L('Rettungsschwimmer: schnellster Weg', 'Lifeguard: fastest route') },
      ],
      default: 'box',
    },
    {
      key: 'x',
      type: 'number',
      label: L('Variable (x, r bzw. u)', 'Variable (x, r or u)'),
      min: 0,
      max: 60,
      step: 0.01,
      default: 2,
      help: L('Auch im Bild (Griff) oder auf dem Graphen ziehen.', 'You can also drag the handle in the picture or the point on the graph.'),
    },
    { key: 'a', type: 'number', group: 'data', label: L('Karton: Länge a', 'Card: length a'), min: 16, max: 40, step: 1, default: 30, unit: 'cm', visibleIf: (v) => v.prob === 'box' },
    { key: 'b', type: 'number', group: 'data', label: L('Karton: Breite b', 'Card: width b'), min: 10, max: 30, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.prob === 'box' },
    { key: 'v', type: 'number', group: 'data', label: L('Volumen der Dose', 'Volume of the can'), min: 250, max: 2000, step: 50, default: 1000, unit: 'cm³', visibleIf: (v) => v.prob === 'can' },
    { key: 'cr', type: 'number', group: 'data', label: L('Radius des Kegels R', 'Radius of the cone R'), min: 3, max: 10, step: 0.5, default: 6, unit: 'cm', visibleIf: (v) => v.prob === 'cone' },
    { key: 'ch', type: 'number', group: 'data', label: L('Höhe des Kegels H', 'Height of the cone H'), min: 6, max: 18, step: 1, default: 12, unit: 'cm', visibleIf: (v) => v.prob === 'cone' },
    { key: 'v1', type: 'number', group: 'data', label: L('Laufen auf Sand v₁', 'Running on sand v₁'), min: 2, max: 8, step: 0.5, default: 7, unit: 'm/s', visibleIf: (v) => v.prob === 'life' },
    { key: 'v2', type: 'number', group: 'data', label: L('Schwimmen v₂', 'Swimming v₂'), min: 1, max: 8, step: 0.5, default: 2, unit: 'm/s', visibleIf: (v) => v.prob === 'life' },
    { key: 'flat', type: 'boolean', group: 'view', label: L('Karton flach zeigen (Netz)', 'Show the sheet flat (net)'), default: false, visibleIf: (v) => v.prob === 'box' },
    { key: 'der', type: 'boolean', group: 'view', label: L('Ableitung zeigen', 'Show the derivative'), default: true },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Lösungsweg zeigen', 'Show the solution'),
      help: L('Aus: Graph und Ergebnisse sind verdeckt – erst selbst rechnen, dann aufdecken.', 'Off: graph and results are hidden – work them out first, then reveal.'),
      default: true,
    },
  ],
  actions: [
    { id: 'hunt', label: L('Optimum suchen', 'Find the optimum'), primary: true, visibleIf: (v) => v.show !== false },
    { id: 'opt', label: L('Zum Optimum', 'Go to the optimum'), visibleIf: (v) => v.show !== false },
    { id: 'fold', label: L('Falten', 'Fold'), visibleIf: (v) => v.prob === 'box' },
    { id: 'race', label: L('Wettrennen', 'Race'), visibleIf: (v) => v.prob === 'life' },
    { id: 'reveal', label: L('Lösung aufdecken', 'Reveal the solution'), primary: true, visibleIf: (v) => v.show === false },
  ],
  readouts: [
    { key: 'cur', label: L('Aktueller Wert', 'Current value'), spoiler: true },
    { key: 'opt', label: L('Optimum', 'Optimum'), spoiler: true },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'box', label: L('Schachtel 30 cm × 20 cm', 'Box 30 cm × 20 cm'), values: {} },
    { id: 'square', label: L('Quadratischer Karton 30 cm × 30 cm', 'Square sheet 30 cm × 30 cm'), values: { prob: 'box', a: 30, b: 30, x: 3 } },
    { id: 'small', label: L('Karton 16 cm × 10 cm: zweite Nullstelle außerhalb', 'Sheet 16 cm × 10 cm: second zero outside'), values: { prob: 'box', a: 16, b: 10, x: 1, flat: true } },
    { id: 'can', label: L('1-Liter-Dose: h = 2r', '1-litre can: h = 2r'), values: { prob: 'can', v: 1000, x: 3 } },
    { id: 'rect', label: L('Rechteck unter 3e^(−0,5x)', 'Rectangle under 3e^(−0.5x)'), values: { prob: 'rect', x: 0.8 } },
    { id: 'cone', label: L('Zylinder im Kegel: r = 2R/3', 'Cylinder in a cone: r = 2R/3'), values: { prob: 'cone', cr: 6, ch: 12, x: 2 } },
    { id: 'life', label: L('Rettungsschwimmer: Brechungsgesetz', 'Lifeguard: law of refraction'), values: { prob: 'life', v1: 7, v2: 2, x: 24 } },
  ],
  strings: {
    de: {
      canvas:
        'Oben ein Bild des Problems: ein Karton mit ausgeschnittenen Ecken, der sich zur Schachtel faltet, eine Dose mit festem Volumen, ein Rechteck unter dem Graphen einer e-Funktion, ein Zylinder in einem Glaskegel oder ein Strand mit dem Weg eines Rettungsschwimmers über Sand und Wasser. Die Variable lässt sich im Bild und auf dem Graphen ziehen. Darunter der Graph der Zielfunktion mit Tangente, Randwerten und Optimum und der Graph der Ableitung mit ihrem Vorzeichen. Rechts Karten mit der aktuellen Lage, dem Lösungsweg und einer Probe.',
    },
    en: {
      canvas:
        'At the top a picture of the problem: a sheet of card with cut-out corners that folds into a box, a can with a fixed volume, a rectangle under the graph of an exponential function, a cylinder inside a glass cone, or a beach with the route of a lifeguard across sand and water. The variable can be dragged in the picture and on the graph. Below, the graph of the objective function with tangent, boundary values and optimum, and the graph of the derivative with its sign. On the right, cards with the current state, the solution and a check.',
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
    const T2 = (de: string, en: string) => (lang === 'de' ? de : en);
    const editable = () => !ctx.locked;
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);
    const probKey = () => p.prob as ProbKey;

    /* ---------- Farben (gleiche Farbe = gleiche Größe in Bild, Diagrammen und Karten) ---------- */
    const col = {
      Z: () => th().series[0]!,
      x: () => th().series[3]!,
      cut: () => th().series[1]!,
      opt: () => th().series[2]!,
      fill: () => th().series[4]!,
      tan: () => th().series[5]!,
    };
    /** Textfarbe zu einer Akzentfarbe (gut lesbar auf dem Hintergrund) */
    const ink = (c: string) => mixColor(c, th().text, 0.3);

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const isExact = (v: number, d = 2) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 2) => (isExact(v, d) ? '=' : '≈');
    const u = (unit: string) => `\\t{${unit}}`;
    /** Einheit in der Sprache der Seite */
    const U = (unit: string | Txt) => (typeof unit === 'string' ? unit : say(unit));

    /* ---------- Problem (exakt aus den Reglern) und angezeigt (weich) ---------- */
    const exactParams = (): ProbParams => ({ a: p.a, b: p.b, v: p.v, ch: p.ch, cr: p.cr, v1: p.v1, v2: p.v2 });
    const PS = Object.fromEntries(PARAM_KEYS.map((k) => [k, new Chan(p[k] as number)])) as Record<(typeof PARAM_KEYS)[number], Chan>;
    const shownParams = (): ProbParams => ({ a: PS.a.v, b: PS.b.v, v: PS.v.v, ch: PS.ch.v, cr: PS.cr.v, v1: PS.v1.v, v2: PS.v2.v });
    const exactObj = (k: ProbKey = probKey()) => objective(k, exactParams());
    let objCache: { key: string; o: Objective } | null = null;
    /** Zielfunktion mit den angezeigten (gleitenden) Daten, zwischengespeichert. */
    function shownObj(k: ProbKey): Objective {
      const q = shownParams();
      const id = `${k}|${q.a}|${q.b}|${q.v}|${q.ch}|${q.cr}|${q.v1}|${q.v2}`;
      if (objCache?.key === id) return objCache.o;
      const o = objective(k, q);
      objCache = { key: id, o };
      return o;
    }
    const domainOf = (o: Objective): [number, number] => [o.lo + MARGIN[o.key][0], o.hi - MARGIN[o.key][1]];
    /** Wert des Reglers im Definitionsbereich; nahe am Optimum genau das Optimum (Regler rastet auf 0,01). */
    function xEffOf(o: Objective, x: number): number {
      const [lo, hi] = domainOf(o);
      if (Math.abs(x - o.opt) <= 0.005 + 1e-9) return o.opt;
      return clamp(x, lo, hi);
    }
    const xEff = () => xEffOf(exactObj(), p.x);
    const round2 = (x: number) => Math.round(x * 100) / 100;

    /* ---------- angezeigter Zustand ---------- */
    const XS = new Chan(xEff());
    const FOLD = new Chan(p.flat ? 0 : 1);
    const kShow = new Chan(p.show ? 1 : 0);
    const kDer = new Chan(p.der ? 1 : 0);
    const rng = { y0: new Chan(0), y1: new Chan(1200), d0: new Chan(-1), d1: new Chan(1) };
    const cardH = new Map<string, Chan>();
    const cardA = new Map<string, Chan>();
    const chans = () => [XS, FOLD, kShow, kDer, ...Object.values(rng), ...Object.values(PS), ...cardH.values(), ...cardA.values()];

    let intro: number | null = null;
    /** Wechsel des Problems: altes Bild blendet aus, neues ein */
    let swap: { from: ProbKey; fromX: number; t0: number; dur: number; flipped: boolean } | null = null;
    let swapK = 1;
    /** „Optimum suchen“ */
    let hunt: { t0: number; x0: number } | null = null;
    /** Aufleuchten des Optimums (Zeitpunkt) */
    let glowT: number | null = null;
    /** Aufdecken der Lösung (Zeitpunkt, für das gestaffelte Einblenden) */
    let revealT: number | null = null;
    /** Zum Optimum gleiten (am Ende den Regler setzen) */
    let toOpt: { t1: number } | null = null;
    /** Falten der Schachtel: erst flach, dann falten */
    let foldSeq: { t1: number } | null = null;
    /** Wettrennen am Strand */
    let race: { t0: number; dur: number; scale: number; runners: { x: number; T: number; color: () => string; name: Txt }[] } | null = null;
    let raceDone = false;
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let drag: 'shore' | null = null;
    let hoverShore = false;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    /** Zahl, die im Bild und in den Karten weich zu ihrem Wert zählt. */
    function cnt(id: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(id);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(id, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (dragging() || hunt) e.c.jump(v);
        else e.c.follow(v, 0.16);
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
    const isWide = () => !(surface.width < 640 && surface.height > surface.width * 0.9);
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    const HIDDEN: Rect = { x: -60, y: -60, w: 10, h: 10 };
    function regions(): { scene: Rect; graph: Rect; der: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      const kd = kDer.v;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.31, 236, 360));
        const lw = w - cw - 12;
        const sh = Math.round(clamp(h * 0.47, 200, 430));
        const rest = h - sh - 8;
        const dh = Math.round(rest * 0.34 * kd);
        const gh = rest - (dh > 2 ? dh + 4 : 0);
        return {
          scene: { x: 0, y: 0, w: lw, h: sh },
          graph: { x: 0, y: sh + 8, w: lw, h: gh },
          der: dh > 2 ? { x: 0, y: sh + 8 + gh + 4, w: lw, h: dh } : HIDDEN,
          col: { x: w - cw, y: 0, w: cw, h },
          wide: true,
        };
      }
      const sh = Math.round(clamp(w * 0.86, 260, 340));
      const gh = Math.round(clamp(w * 0.6, 200, 250));
      const dh = Math.round(118 * kd);
      const y2 = sh + 8 + gh + (dh > 2 ? 4 + dh : 0);
      return {
        scene: { x: 0, y: 0, w, h: sh },
        graph: { x: 0, y: sh + 8, w, h: gh },
        der: dh > 2 ? { x: 0, y: sh + 8 + gh + 4, w, h: dh } : HIDDEN,
        col: { x: 0, y: y2 + 12, w, h: h - y2 - 12 },
        wide: false,
      };
    }
    /** Innenbereich des Bildes (in der Karte). */
    const picRect = (S: Rect): Rect => ({ x: S.x + 6, y: S.y + 6, w: S.w - 12, h: S.h - 12 });
    const PAD = () => ({ left: fs(52, 44), bottom: fs(24, 22), top: fs(38, 36), right: fs(16, 12) });
    const PADD = () => ({ left: fs(52, 44), bottom: fs(22, 20), top: fs(32, 30), right: fs(16, 12) });

    /** Welches Problem wird gerade gezeigt (beim Wechsel zuerst das alte)? */
    const viewKey = (): ProbKey => (swap && !swap.flipped ? swap.from : probKey());

    /* ---------- 3D-Ansicht (Schachtel, Dose, Kegel) ---------- */
    const INITIAL_VIEW: Record<ProbKey, { azimuth: number; elevation: number }> = {
      box: { azimuth: 34, elevation: 34 },
      can: { azimuth: 28, elevation: 18 },
      cone: { azimuth: 28, elevation: 14 },
      rect: { azimuth: 30, elevation: 20 },
      life: { azimuth: 30, elevation: 20 },
    };
    const view: View3D = new View3D(surface, {
      region: () => (IS3D(viewKey()) ? picRect(regions().scene) : HIDDEN),
      ...INITIAL_VIEW[probKey()],
      elevationLimits: [6, 82],
      zoom: false,
      controls: false,
      background: false,
      hint: true,
    });

    /* ---------- Diagramme ---------- */
    const plot = new Plot(surface, { x: [0, 10], y: [0, 1200], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().graph });
    const plotD = new Plot(surface, { x: [0, 10], y: [-1, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().der });
    /** Koordinatensystem im Bild beim Rechteck unter der e-Funktion */
    const plotS = new Plot(surface, { x: [0, 7], y: [0, 3.3], equalAspect: false, pan: false, zoom: false, controls: false, region: () => (viewKey() === 'rect' ? picRect(regions().scene) : HIDDEN) });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { z: col.Z(), x: ink(col.x()), o: ink(col.opt()), c: col.cut(), m: th().muted, t: ink(col.tan()), f: ink(col.fill()) },
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

    /* ---------- Zeichenhilfen ---------- */
    type PillOpts = { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean; fill?: string; dashed?: boolean };
    /** Beschriftung als Formel in einer runden „Pille“ mit weichem Schatten. */
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
        if (opts.dashed) g.setLineDash([4, 3]);
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
        g.setLineDash([]);
      }
      box.draw(g, left, bl);
      g.restore();
      return rr;
    }

    /** Gestalteter Platzhalter für verdeckte Werte: gestrichelte Pille mit Schloss und „?“. */
    function placeholder(x: number, y: number, opts: { align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; label?: string; color?: string } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const label = opts.label ?? '?';
      g.font = `750 ${size}px ${th().font}`;
      const tw = g.measureText(label).width;
      const w = tw + 34;
      const h = size + 12;
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      let top = y - h / 2;
      if (opts.bounds) {
        left = clamp(left, opts.bounds.x + 4, opts.bounds.x + opts.bounds.w - w - 4);
        top = clamp(top, opts.bounds.y + 4, opts.bounds.y + opts.bounds.h - h - 4);
      }
      const rr = { x: left, y: top, w, h };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      const c = opts.color ?? th().muted;
      g.save();
      g.globalAlpha *= a;
      const grad = g.createLinearGradient(0, top, 0, top + h);
      grad.addColorStop(0, withAlpha(th().dark ? '#2a3446' : '#eef2f7', 0.95));
      grad.addColorStop(1, withAlpha(th().dark ? '#1c2533' : '#e2e8f0', 0.95));
      g.fillStyle = grad;
      roundRect(g, left, top, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(th().dark ? '#7c8aa3' : '#94a3b8', 0.9);
      g.lineWidth = 1.2;
      g.setLineDash([4, 3]);
      roundRect(g, left + 0.5, top + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      g.setLineDash([]);
      const lx = left + 12;
      const ly = top + h / 2 + 1;
      g.strokeStyle = c;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(lx, ly - 3.2, 2.6, Math.PI, 0);
      g.stroke();
      g.fillStyle = c;
      roundRect(g, lx - 4, ly - 3, 8, 6.5, 1.5);
      g.fill();
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = c;
      g.fillText(label, left + 23, top + h / 2 + 0.5);
      g.restore();
      return rr;
    }
    /** Wert zeigen oder (beim Verdecken überblendet) einen Platzhalter. */
    function valuePill(x: number, y: number, src: string, hiddenLabel: string, opts: PillOpts = {}): void {
      const k = kShow.v;
      if (k > 0.5) fpill(x, y, src, { ...opts, alpha: (opts.alpha ?? 1) * (2 * k - 1) });
      if (k < 0.5) placeholder(x, y, { align: opts.align, size: Math.min(opts.size ?? 12, 12), alpha: (opts.alpha ?? 1) * (1 - 2 * k), bounds: opts.bounds, label: hiddenLabel });
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
        g.lineWidth = 2.2;
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
    /** Maßpfeil zwischen zwei Bildpunkten mit kleinen Endstrichen. */
    function dimPx(x0: number, y0: number, x1: number, y1: number, color: string, alpha = 1): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 6 || alpha <= 0.01) return;
      const nx = -(y1 - y0) / len;
      const ny = (x1 - x0) / len;
      g.save();
      g.globalAlpha *= alpha;
      const mx = (x0 + x1) / 2;
      const my = (y0 + y1) / 2;
      arrowPx(mx, my, x0, y0, color, 1.5, 7);
      arrowPx(mx, my, x1, y1, color, 1.5, 7);
      g.strokeStyle = color;
      g.lineWidth = 1.3;
      g.beginPath();
      for (const [x, y] of [
        [x0, y0],
        [x1, y1],
      ] as const) {
        g.moveTo(x - nx * 5, y - ny * 5);
        g.lineTo(x + nx * 5, y + ny * 5);
      }
      g.stroke();
      g.restore();
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
    const wOf = (src: string, size: number, weight = 700) => formula(surface.g, src, fstyle(size, th().text, weight)).w;
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
    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
    function strokePts(pts: [number, number][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
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
    /** Werte einer Funktion als Pixelpunkte im Koordinatensystem pl (y an den Rand geklemmt). */
    function sample(pl: Plot, f: (x: number) => number, x0: number, x1: number): [number, number][] {
      if (!(x1 > x0)) return [];
      const count = Math.round(clamp(Math.abs(pl.px(x1) - pl.px(x0)) * 0.7, 12, 600));
      const r = pl.rect;
      const out: [number, number][] = [];
      for (let i = 0; i <= count; i++) {
        const x = x0 + ((x1 - x0) * i) / count;
        out.push([pl.px(x), clamp(pl.py(f(x)), r.y - 40, r.y + r.h + 40)]);
      }
      return out;
    }
    /** Milchglas über einem Diagramm, solange die Lösung verdeckt ist. */
    function veil(r: Rect, a: number, line1: string, line2: string, small: boolean): void {
      if (a <= 0.01) return;
      const g = surface.g;
      const theme = th();
      g.save();
      g.globalAlpha *= a;
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, withAlpha(theme.dark ? '#1a2333' : '#f4f6fa', 0.95));
      grad.addColorStop(1, withAlpha(theme.dark ? '#141b28' : '#e9eef5', 0.95));
      g.fillStyle = grad;
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.fill();
      g.strokeStyle = withAlpha(theme.dark ? '#64748b' : '#94a3b8', 0.8);
      g.setLineDash([6, 5]);
      g.lineWidth = 1.3;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      g.stroke();
      g.setLineDash([]);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      if (small) {
        g.font = `700 ${fs(12.5, 11.5)}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.fillText(line1, cx, cy);
        g.restore();
        return;
      }
      const ly = cy - 26;
      g.strokeStyle = theme.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, ly - 5, 5, Math.PI, 0);
      g.stroke();
      g.fillStyle = theme.muted;
      roundRect(g, cx - 8, ly - 5, 16, 12, 3);
      g.fill();
      g.font = `750 ${fs(14, 12.5)}px ${theme.font}`;
      g.fillStyle = theme.text;
      g.fillText(line1, cx, ly + 24);
      const lines = wrapText(line2, r.w - 30, `550 ${fs(12, 11)}px ${theme.font}`);
      g.font = `550 ${fs(12, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      lines.slice(0, 2).forEach((ln, i) => g.fillText(ln, cx, ly + 42 + i * 15));
      g.restore();
    }

    /* =====================================================================
     * Bild: Rahmen, Titel und Wert
     * ===================================================================== */
    const m = (k: ProbKey = viewKey()) => META[k];
    /** Natürliche Farben (Karton, Blech, Glas, Sand, Wasser) – in beiden Modi abgestimmt. */
    const nat = () => {
      const d = th().dark;
      return {
        card: d ? '#9b7a50' : '#d9b27c',
        cardEdge: d ? '#2c1f10' : '#6b4a22',
        mat: d ? '#14251f' : '#e3efe6',
        matLine: d ? 'rgba(148,190,170,0.16)' : 'rgba(40,110,80,0.16)',
        table0: d ? '#1a2230' : '#f4f1ea',
        table1: d ? '#121924' : '#e9e3d6',
        metal: d ? '#a9b3c1' : '#cfd6df',
        glass: d ? '#7fb4d6' : '#9ccbe6',
        sand0: d ? '#4f4130' : '#f5e6c4',
        sand1: d ? '#3f3426' : '#ecd5a3',
        water0: d ? '#12405a' : '#a9dcf0',
        water1: d ? '#0b2a3d' : '#5fb0d6',
      };
    };

    /** Hintergrund des Bildes je Problem. */
    function sceneBackdrop(P: Rect, key: ProbKey): void {
      const g = surface.g;
      const n = nat();
      g.save();
      roundRect(g, P.x, P.y, P.w, P.h, 10);
      g.clip();
      if (key === 'life') {
        g.restore();
        return;
      }
      const grad = g.createLinearGradient(0, P.y, 0, P.y + P.h);
      if (key === 'rect') {
        grad.addColorStop(0, th().dark ? '#151d2a' : '#fbfcfe');
        grad.addColorStop(1, th().dark ? '#121925' : '#f2f5f9');
      } else {
        grad.addColorStop(0, n.table0);
        grad.addColorStop(1, n.table1);
      }
      g.fillStyle = grad;
      g.fillRect(P.x, P.y, P.w, P.h);
      // weiches Licht von oben
      const rg = g.createRadialGradient(P.x + P.w * 0.5, P.y + P.h * 0.15, 10, P.x + P.w * 0.5, P.y + P.h * 0.4, Math.max(P.w, P.h) * 0.75);
      rg.addColorStop(0, withAlpha('#ffffff', th().dark ? 0.05 : 0.5));
      rg.addColorStop(1, withAlpha('#ffffff', 0));
      g.fillStyle = rg;
      g.fillRect(P.x, P.y, P.w, P.h);
      g.restore();
    }

    /** Titel oben links und der Wert der Zielgröße oben rechts. */
    function sceneLabels(P: Rect, key: ProbKey, o: Objective, x: number, k: Intro): void {
      const M = m(key);
      const sz = fs(12.5, 11.5);
      const q = shownParams();
      let given = '';
      if (key === 'box') given = `a = ${N(q.a, 0)} ${u('cm')}, b = ${N(q.b, 0)} ${u('cm')}`;
      else if (key === 'can') given = `V = ${N(q.v, 0)} ${u('cm³')}`;
      else if (key === 'rect') given = `f(x) = 3e^{−0,5x}`.replace('0,5', lang === 'de' ? '0,5' : '0.5');
      else if (key === 'cone') given = `R = ${N(q.cr, 1)} ${u('cm')}, H = ${N(q.ch, 0)} ${u('cm')}`;
      else given = `v₁ = ${N(q.v1, 1)} ${u('m/s')}, v₂ = ${N(q.v2, 1)} ${u('m/s')}`;
      const narrowTitle = P.w < 470;
      const title = narrowTitle ? say(M.short) : say(M.title);
      const src = `\\t{${title}}  \\c{m}{${given}}`;
      const tw = wOf(src, sz);
      const valSrc = `\\c{z}{${M.z} = ${cN(`sv-${key}`, o.f(x), M.dz)} ${u(U(M.uz))}}`;
      const vw = wOf(valSrc, fs(13.5, 12.5)) + 20;
      if (tw + vw + 40 < P.w) fpill(P.x + 10, P.y + 18, src, { align: 'left', size: sz, alpha: k.panel, weight: 650 });
      else {
        fpill(P.x + 10, P.y + 18, `\\t{${say(M.short)}}`, { align: 'left', size: sz, alpha: k.panel, weight: 650 });
        if (key !== 'life') fpill(P.x + 10, P.y + 44, `\\c{m}{${given}}`, { align: 'left', size: 11, alpha: k.panel, weight: 650 });
      }
      valuePill(P.x + P.w - 10, P.y + 18, valSrc, U(M.uz), { align: 'right', size: fs(13.5, 12.5), alpha: k.panel, border: withAlpha(col.Z(), 0.5) });
    }

    /* =====================================================================
     * Schachtel (3D): Karton mit ausgeschnittenen Ecken, faltet sich
     * ===================================================================== */
    /** Netz der Schachtel: Boden und vier Seitenlaschen (x₁ = Breite, x₂ = Länge). */
    function boxNet(a: number, b: number, x: number): NetFace3D[] {
      const L2 = (a - 2 * x) / 2;
      const B2 = (b - 2 * x) / 2;
      const pt = (p1: number, p2: number): Vec2 => [p1, p2];
      return [
        { points: [pt(-B2, -L2), pt(B2, -L2), pt(B2, L2), pt(-B2, L2)], parent: -1 },
        { points: [pt(B2, -L2), pt(B2 + x, -L2), pt(B2 + x, L2), pt(B2, L2)], parent: 0, hinge: [pt(B2, -L2), pt(B2, L2)] },
        { points: [pt(-B2 - x, -L2), pt(-B2, -L2), pt(-B2, L2), pt(-B2 - x, L2)], parent: 0, hinge: [pt(-B2, -L2), pt(-B2, L2)] },
        { points: [pt(-B2, L2), pt(B2, L2), pt(B2, L2 + x), pt(-B2, L2 + x)], parent: 0, hinge: [pt(-B2, L2), pt(B2, L2)] },
        { points: [pt(-B2, -L2 - x), pt(B2, -L2 - x), pt(B2, -L2), pt(-B2, -L2)], parent: 0, hinge: [pt(-B2, -L2), pt(B2, -L2)] },
      ];
    }
    /** Faltfortschritt je Fläche: erst die Laschen an der Breite, dann an der Länge. */
    const foldOf = (F: number) => (i: number) => (i === 0 ? 0 : i <= 2 ? ease.inOutCubic(clamp01(F * 1.35)) : ease.inOutCubic(clamp01(F * 1.35 - 0.35)));

    function drawBox(P: Rect, x: number, k: Intro): void {
      const theme = th();
      const n = nat();
      const q = shownParams();
      const { a, b } = q;
      const F = FOLD.v;
      const L = a - 2 * x;
      const B = b - 2 * x;
      const faces = boxNet(a, b, x);
      const folded = foldNet(faces, foldOf(F));
      const radius = Math.hypot(a, b) * lerp(0.5, 0.39, ease.inOutCubic(F));
      view.setScene({ target: [0, 0, x * 0.5 * F], radius, anchor: [0.5, 0.56] });
      view.resize();
      view.begin();
      // Schneidematte mit Zentimeterraster
      const ext = Math.max(a, b) / 2 + 4;
      view.face(
        [
          [-ext, -ext, -0.02],
          [ext, -ext, -0.02],
          [ext, ext, -0.02],
          [-ext, ext, -0.02],
        ],
        { color: n.mat, flat: true, layer: 'back' },
      );
      view.grid({ min: [-ext, -ext], max: [ext, ext], step: 2, color: n.matLine, layer: 'back' });
      view.shadow(folded.flat(), { alpha: 0.12 + 0.14 * F, blur: 18 + 10 * F, spread: 1.03 });
      const edge = n.cardEdge;
      const glowing = glowT !== null ? clamp01(1 - (frameNow - glowT) / 1400) : 0;
      folded.forEach((pts) => {
        let color = n.card;
        if (glowing > 0) color = mixColor(color, col.opt(), 0.35 * glowing);
        view.face(pts, { color, stroke: edge, width: 1.5, backShade: 0.22, gloss: 0.12 });
      });
      // Falzlinien im flachen Karton
      const flatK = 1 - clamp01(F / 0.3);
      if (flatK > 0.01) {
        const L2 = L / 2;
        const B2 = B / 2;
        for (const [p0, p1] of [
          [[B2, -a / 2], [B2, a / 2]],
          [[-B2, -a / 2], [-B2, a / 2]],
          [[-b / 2, L2], [b / 2, L2]],
          [[-b / 2, -L2], [b / 2, -L2]],
        ] as [[number, number], [number, number]][]) {
          view.segment([p0[0], p0[1], 0.01], [p1[0], p1[1], 0.01], { color: withAlpha(theme.text, 0.45 * flatK), width: 1.1, dash: [4, 4], layer: 'scene', depthBias: 0.05 });
        }
      }
      // ausgeschnittene Ecken: im flachen Karton markiert, beim Falten fliegen sie weg
      const cutK = clamp01(F / 0.32);
      if (cutK < 0.99) {
        const L2 = L / 2;
        const B2 = B / 2;
        for (const s1 of [1, -1])
          for (const s2 of [1, -1]) {
            const off = cutK * x * 1.2;
            const lift = cutK * x * 1.4;
            const c1 = s1 * (B2 + off);
            const c2 = s2 * (L2 + off);
            const sq: Vec3[] = [
              [c1, c2, lift],
              [c1 + s1 * x, c2, lift],
              [c1 + s1 * x, c2 + s2 * x, lift],
              [c1, c2 + s2 * x, lift],
            ];
            view.face(sq, { color: col.x(), alpha: 0.32 * (1 - cutK), flat: true, stroke: withAlpha(col.x(), 0.95 * (1 - cutK)), width: 1.4, dash: [4, 3], depthBias: 0.1 });
          }
      }
      view.end();
      // Bemaßung (Pillen nach der 3D-Szene, damit sie lesbar bleiben)
      const P3 = (v: Vec3) => view.toPx(v);
      const sz = fs(12, 11);
      const kF = clamp01((F - 0.6) / 0.4) * k.labels;
      const kL = (1 - clamp01(F / 0.4)) * k.labels;
      const bounds = { x: P.x + 4, y: P.y + 30, w: P.w - 8, h: P.h - 34 };
      if (kF > 0.01) {
        // Höhe x an der vorderen Ecke
        const [ex0] = P3([B / 2, -L / 2, 0]);
        const [ex1] = P3([B / 2, L / 2, 0]);
        const cy2 = ex0 < ex1 ? -L / 2 : L / 2;
        const [hx0, hy0] = P3([B / 2, cy2, 0]);
        const [hx1, hy1] = P3([B / 2, cy2, x]);
        const side = -1;
        const dx = 14 * side;
        dimPx(hx0 + dx, hy0, hx1 + dx, hy1, ink(col.x()), kF);
        fpill(hx0 + dx + 8 * side, (hy0 + hy1) / 2, `\\c{x}{x = ${cN('bx', x, 2)} ${u('cm')}}`, { align: side > 0 ? 'left' : 'right', size: sz, alpha: kF, bounds, border: withAlpha(col.x(), 0.6) });
        // Länge a − 2x vorne unten, Breite b − 2x rechts unten
        const off = 2.2;
        const [lx0, ly0] = P3([B / 2 + off, -L / 2, 0]);
        const [lx1, ly1] = P3([B / 2 + off, L / 2, 0]);
        dimPx(lx0, ly0, lx1, ly1, theme.muted, kF);
        fpill((lx0 + lx1) / 2, (ly0 + ly1) / 2 + 14, `a − 2x = ${cN('bl', L, 1)} ${u('cm')}`, { size: sz, alpha: kF, bounds, color: theme.text });
        const [wx0, wy0] = P3([-B / 2, L / 2 + off, 0]);
        const [wx1, wy1] = P3([B / 2, L / 2 + off, 0]);
        dimPx(wx0, wy0, wx1, wy1, theme.muted, kF);
        fpill((wx0 + wx1) / 2 + 12, (wy0 + wy1) / 2 + 10, `b − 2x = ${cN('bw', B, 1)} ${u('cm')}`, { size: sz, alpha: kF, bounds, align: 'left', color: theme.text });
      }
      if (kL > 0.01) {
        const off = 2.2;
        const [ax0, ay0] = P3([b / 2 + off, -a / 2, 0]);
        const [ax1, ay1] = P3([b / 2 + off, a / 2, 0]);
        dimPx(ax0, ay0, ax1, ay1, theme.muted, kL);
        fpill((ax0 + ax1) / 2, (ay0 + ay1) / 2 + 14, `a = ${N(a, 0)} ${u('cm')}`, { size: sz, alpha: kL, bounds });
        const [bx0, by0] = P3([-b / 2, a / 2 + off, 0]);
        const [bx1, by1] = P3([b / 2, a / 2 + off, 0]);
        dimPx(bx0, by0, bx1, by1, theme.muted, kL);
        fpill((bx0 + bx1) / 2 + 12, (by0 + by1) / 2, `b = ${N(b, 0)} ${u('cm')}`, { size: sz, alpha: kL, bounds, align: 'left' });
        // x am vorderen rechten Ausschnitt
        const [qx0, qy0] = P3([b / 2 - x, a / 2 - x, 0]);
        const [qx1, qy1] = P3([b / 2, a / 2, 0]);
        fpill((qx0 + qx1) / 2, (qy0 + qy1) / 2, `\\c{x}{x}`, { size: sz, alpha: kL, border: withAlpha(col.x(), 0.6) });
      }
    }

    /* =====================================================================
     * Dose (3D): festes Volumen, Radius r, Höhe h = V/(πr²)
     * ===================================================================== */
    /** Richtung in der Grundebene, die im Bild nach rechts zeigt (senkrecht zur Blickrichtung). */
    function rightDir(): Vec3 {
      const c = view.camera.position;
      const t = view.camera.target;
      let s: Vec3 = vec3.normalize([-(c[1] - t[1]), c[0] - t[0], 0]);
      const [x0] = view.toPx([t[0], t[1], 0]);
      const [x1] = view.toPx([t[0] + s[0], t[1] + s[1], 0]);
      if (x1 < x0) s = [-s[0], -s[1], 0];
      return s;
    }
    const canCap = (V: number) => 1.75 * canHeight(V, canOptimum(V));

    function drawCan(P: Rect, r: number, k: Intro): void {
      const theme = th();
      const n = nat();
      const V = PS.v.v;
      const h = canHeight(V, r);
      const cap = canCap(V);
      const hd = Math.min(h, cap);
      const clipped = h > cap + 1e-9;
      const rOpt = canOptimum(V);
      view.setScene({ target: [0, 0, cap * 0.46], radius: Math.max(cap * 0.6, 8.5), anchor: [0.5, 0.52] });
      view.resize();
      view.begin();
      const ext = 15;
      view.grid({ min: [-ext, -ext], max: [ext, ext], step: 2, color: withAlpha(theme.grid, 0.8), layer: 'back' });
      const ring = (z: number, rr: number, seg = 64): Vec3[] => mesh3d.circle([0, 0, z], [0, 0, 1], rr, seg);
      view.shadow(ring(0, r * 1.06), { alpha: 0.28, blur: 16 });
      const glowing = glowT !== null ? clamp01(1 - (frameNow - glowT) / 1400) : 0;
      const metal = glowing > 0 ? mixColor(n.metal, col.opt(), 0.3 * glowing) : n.metal;
      const body = mesh3d.cylinder(r, hd, 56);
      view.mesh(body, { color: metal, gloss: 0.55, edgeColor: mixColor(metal, '#0b1220', 0.55), edgeWidth: 1.2, face: (i) => (i === 1 && clipped ? null : undefined) });
      // Etikett
      if (hd > 1.2) {
        const band = mesh3d.cylinder(r * 1.006, hd * 0.56, 56, hd * 0.2);
        view.mesh(band, { color: col.Z(), gloss: 0.35, cull: true, edges: false, face: (i) => (i < 2 ? null : undefined) });
      }
      // Ränder oben und unten (Falz)
      const rimC = mixColor(metal, '#ffffff', 0.35);
      if (!clipped) {
        view.polyline(ring(hd, r * 1.004), { closed: true, color: rimC, width: 2.2 });
        view.polyline(ring(hd, r * 0.84), { closed: true, color: withAlpha(mixColor(metal, '#0b1220', 0.4), 0.7), width: 1.1 });
      }
      // beste Dose als Umriss (nur mit Lösungsweg)
      const kS = kShow.v * k.labels;
      if (kS > 0.02 && Math.abs(r - rOpt) > 0.05) {
        const hO = canHeight(V, rOpt);
        const s = rightDir();
        const gc = withAlpha(col.opt(), 0.85 * kS);
        view.polyline(ring(0, rOpt), { closed: true, color: gc, width: 1.4, dash: [5, 4], layer: 'front' });
        view.polyline(ring(hO, rOpt), { closed: true, color: gc, width: 1.4, dash: [5, 4], layer: 'front' });
        for (const sg of [1, -1]) view.segment([s[0] * rOpt * sg, s[1] * rOpt * sg, 0], [s[0] * rOpt * sg, s[1] * rOpt * sg, hO], { color: gc, width: 1.4, dash: [5, 4], layer: 'front' });
      }
      view.end();
      // Bemaßung
      const P3 = (v: Vec3) => view.toPx(v);
      const s = rightDir();
      const sz = fs(12, 11);
      const bounds = { x: P.x + 4, y: P.y + 30, w: P.w - 8, h: P.h - 34 };
      const kl = k.labels;
      const topZ = clipped ? 0 : hd;
      const [cx0, cy0] = P3([0, 0, topZ]);
      const [cx1, cy1] = P3([s[0] * r, s[1] * r, topZ]);
      const g = surface.g;
      g.save();
      g.globalAlpha *= kl;
      g.strokeStyle = ink(col.x());
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx0, cy0);
      g.lineTo(cx1, cy1);
      g.stroke();
      g.restore();
      dot(cx0, cy0, ink(col.x()), 2.6, kl);
      fpill((cx0 + cx1) / 2, clipped ? Math.max(cy0, cy1) + 18 : Math.min(cy0, cy1) - 16, `\\c{x}{r = ${cN('cr', r, 2)} ${u('cm')}}`, { size: sz, alpha: kl, bounds, border: withAlpha(col.x(), 0.6) });
      const off = r + Math.max(1.4, r * 0.18);
      const [hx0, hy0] = P3([s[0] * off, s[1] * off, 0]);
      const [hx1, hy1] = P3([s[0] * off, s[1] * off, hd]);
      dimPx(hx0, hy0, hx1, Math.max(hy1, P.y + 34), theme.muted, kl);
      const hSrc = clipped ? `h = ${cN('ch', h, 1)} ${u('cm')}  \\c{m}{\\t{(${T2('gekürzt', 'cut short')})}}` : `h = ${cN('ch', h, 2)} ${u('cm')}`;
      fpill(hx0 + 10, (hy0 + Math.max(hy1, P.y + 34)) / 2, hSrc, { align: 'left', size: sz, alpha: kl, bounds });
      if (clipped) {
        // nach oben ausblenden: die Dose ist zu hoch für das Bild
        const [tcx, ty] = P3([0, 0, hd]);
        const grad = g.createLinearGradient(0, ty - 6, 0, ty + 34);
        grad.addColorStop(0, withAlpha(theme.dark ? '#1a2230' : '#f4f1ea', 1));
        grad.addColorStop(1, withAlpha(theme.dark ? '#1a2230' : '#f4f1ea', 0));
        g.fillStyle = grad;
        g.fillRect(P.x, Math.max(P.y, ty - 40), P.w, ty + 34 - Math.max(P.y, ty - 40));
        arrowPx(tcx, ty + 26, tcx, Math.max(P.y + 30, ty - 4), theme.muted, 2, 8);
      }
    }

    /* =====================================================================
     * Zylinder im Kegel (3D) mit Achsenschnitt (Strahlensatz)
     * ===================================================================== */
    function drawCone(P: Rect, r: number, k: Intro): void {
      const theme = th();
      const n = nat();
      const R = PS.cr.v;
      const H = PS.ch.v;
      const c = { R, H };
      const h = coneCylHeight(c, r);
      view.setScene({ target: [0, 0, H * 0.46], radius: Math.hypot(R, H / 2) * 0.98, anchor: [0.5, 0.53] });
      view.resize();
      view.begin();
      const ext = R + 3;
      view.grid({ min: [-ext, -ext], max: [ext, ext], step: 1, color: withAlpha(theme.grid, 0.8), layer: 'back' });
      view.shadow(mesh3d.circle([0, 0, 0], [0, 0, 1], R * 1.04, 48), { alpha: 0.2, blur: 18 });
      const glowing = glowT !== null ? clamp01(1 - (frameNow - glowT) / 1400) : 0;
      const cyl = mixColor(col.Z(), '#ffffff', theme.dark ? 0.05 : 0.18);
      const cylC = glowing > 0 ? mixColor(cyl, col.opt(), 0.45 * glowing) : cyl;
      if (r > 0.02 && h > 0.02) view.mesh(mesh3d.cylinder(r, h, 48), { color: cylC, gloss: 0.4 });
      view.mesh(mesh3d.cone(R, H, 56), { color: n.glass, alpha: theme.dark ? 0.2 : 0.24, gloss: 0.6, edgeColor: withAlpha(mixColor(n.glass, '#0b1220', 0.5), 0.9), edgeWidth: 1.3 });
      // Achsenschnitt: Dreieck und Rechteck in der Ebene quer zur Blickrichtung
      const s = rightDir();
      const at = (t: number, z: number): Vec3 => [s[0] * t, s[1] * t, z];
      const kl = k.labels;
      view.polyline([at(-R, 0), at(0, H), at(R, 0)], { color: withAlpha(theme.text, 0.55 * kl), width: 1.3, dash: [5, 4], layer: 'front' });
      view.polyline([at(-r, 0), at(-r, h), at(r, h), at(r, 0)], { color: withAlpha(ink(col.Z()), 0.9 * kl), width: 1.6, dash: [5, 4], layer: 'front' });
      view.segment(at(0, 0), at(0, H), { color: withAlpha(theme.muted, 0.6 * kl), width: 1, dash: [2, 4], layer: 'front' });
      view.end();
      const P3 = (v: Vec3) => view.toPx(v);
      const sz = fs(12, 11);
      const bounds = { x: P.x + 4, y: P.y + 30, w: P.w - 8, h: P.h - 34 };
      const g = surface.g;
      // r oben auf dem Zylinder
      const [rx0, ry0] = P3(at(0, h));
      const [rx1, ry1] = P3(at(r, h));
      g.save();
      g.globalAlpha *= kl;
      g.strokeStyle = ink(col.x());
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(rx0, ry0);
      g.lineTo(rx1, ry1);
      g.stroke();
      g.restore();
      fpill((rx0 + rx1) / 2, ry0 - 15, `\\c{x}{r = ${cN('kr', r, 2)}}`, { size: sz, alpha: kl, bounds, border: withAlpha(col.x(), 0.6) });
      // h rechts neben dem Zylinder (im Schnitt)
      const [hx0, hy0] = P3(at(r, 0));
      const [, hy1] = P3(at(r, h));
      if (Math.abs(hy1 - hy0) > 14) {
        dimPx(hx0 + 10, hy0, hx0 + 10, hy1, ink(col.Z()), kl);
        fpill(hx0 + 18, (hy0 + hy1) / 2, `\\c{z}{h = ${cN('kh', h, 2)}}`, { align: 'left', size: sz, alpha: kl, bounds });
      }
      // R und H am Kegel
      const [Rx0, Ry0] = P3(at(-R, 0));
      const [Rx1] = P3(at(0, 0));
      fpill((Rx0 + Rx1) / 2, Ry0 + 16, `R = ${N(R, 1)}`, { size: sz, alpha: kl, bounds, color: theme.muted });
      const [Hx, Hy] = P3(at(0, H));
      fpill(Hx - 12, Hy + 4, `H = ${N(H, 0)}`, { align: 'right', size: sz, alpha: kl, bounds, color: theme.muted });
    }

    /* =====================================================================
     * Rechteck unter dem Graphen von f(x) = 3e^(−0,5x)
     * ===================================================================== */
    const rectF = (x: number) => 3 * Math.exp(-0.5 * x);
    function drawRect(uu: number, k: Intro): void {
      const g = surface.g;
      const theme = th();
      plotS.setAxes({ x: { label: 'x' }, y: { label: 'y' } });
      plotS.setRangePadded([0, 7.2], [0, 3.35], { left: fs(40, 34), bottom: fs(24, 22), top: 44, right: 16 });
      plotS.resize();
      plotS.begin();
      plotS.grid();
      plotS.axes();
      const r = plotS.rect;
      const y0 = plotS.py(0);
      const fu = rectF(uu);
      const glowing = glowT !== null ? clamp01(1 - (frameNow - glowT) / 1400) : 0;
      // Rechteck mit Verlauf
      const x0 = plotS.px(0);
      const x1 = plotS.px(uu);
      const yt = plotS.py(fu);
      const base = glowing > 0 ? mixColor(col.Z(), col.opt(), 0.5 * glowing) : col.Z();
      const grad = g.createLinearGradient(0, yt, 0, y0);
      grad.addColorStop(0, withAlpha(base, theme.dark ? 0.5 : 0.36));
      grad.addColorStop(1, withAlpha(base, theme.dark ? 0.22 : 0.14));
      g.fillStyle = grad;
      g.fillRect(x0, yt, x1 - x0, y0 - yt);
      g.strokeStyle = base;
      g.lineWidth = 2;
      g.strokeRect(x0 + 0.5, yt + 0.5, x1 - x0 - 1, y0 - yt - 1);
      // bestes Rechteck als Umriss
      const kS = kShow.v * k.labels;
      if (kS > 0.02 && Math.abs(uu - 2) > 0.03) {
        g.save();
        g.strokeStyle = withAlpha(col.opt(), 0.9 * kS);
        g.setLineDash([5, 4]);
        g.lineWidth = 1.5;
        g.strokeRect(x0, plotS.py(rectF(2)), plotS.px(2) - x0, y0 - plotS.py(rectF(2)));
        g.restore();
      }
      // Graph von f
      strokePts(sample(plotS, rectF, 0, lerp(0, 7.2, k.reveal)), col.fill(), fs(3, 2.6), { glow: true });
      fpill(plotS.px(4.6), plotS.py(rectF(4.6)) - 22, `\\c{f}{f(x) = 3e^{−${lang === 'de' ? '0,5' : '0.5'}x}}`, { size: fs(12, 11), alpha: k.labels, bounds: r });
      // Maße: u unten, f(u) rechts
      const kl = k.labels;
      fpill((x0 + x1) / 2, y0 - 14, `\\c{x}{u = ${cN('ru', uu, 2)}}`, { size: fs(12, 11), alpha: kl, bounds: r, border: withAlpha(col.x(), 0.6) });
      if (y0 - yt > 30) {
        dimPx(x1 + 10, y0, x1 + 10, yt, ink(col.fill()), kl);
        fpill(x1 + 18, (y0 + yt) / 2, `\\c{f}{f(u) = ${cN('rf', fu, 2)}}`, { align: 'left', size: fs(12, 11), alpha: kl, bounds: r });
      }
      // Fläche in der Mitte
      if (x1 - x0 > 50 && y0 - yt > 34) valuePill((x0 + x1) / 2, (yt + y0) / 2 - 4, `\\c{z}{A = ${cN('ra', uu * fu, 2)}}`, 'A', { size: fs(12.5, 11.5), alpha: kl });
      // Ecke auf dem Graphen
      halo(x1, yt, col.x(), 20, editable() ? 0.8 : 0);
      dot(x1, yt, col.x(), 7, k.panel);
      plotS.end();
    }

    /* =====================================================================
     * Rettungsschwimmer am Strand (Draufsicht)
     * ===================================================================== */
    function lifeGeom(P: Rect): { sc: number; X0: number; shore: number; A: [number, number]; S: [number, number]; E: (x: number) => [number, number] } {
      const l = LIFE_GEOM;
      const mx = fs(58, 50);
      const top = 64;
      const bottom = 26;
      const sc = Math.min((P.w - 2 * mx) / l.d, (P.h - top - bottom) / (l.a + l.b));
      const X0 = P.x + (P.w - l.d * sc) / 2;
      const shore = P.y + top + l.a * sc + (P.h - top - bottom - (l.a + l.b) * sc) / 2;
      return { sc, X0, shore, A: [X0, shore - l.a * sc], S: [X0 + l.d * sc, shore + l.b * sc], E: (x) => [X0 + x * sc, shore] };
    }
    const lifeOf = (): Life => ({ ...LIFE_GEOM, v1: PS.v1.v, v2: PS.v2.v });

    function drawLife(P: Rect, x: number, o: Objective, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const n = nat();
      const G = lifeGeom(P);
      const l = lifeOf();
      g.save();
      roundRect(g, P.x, P.y, P.w, P.h, 10);
      g.clip();
      // Sand
      const sg = g.createLinearGradient(0, P.y, 0, G.shore);
      sg.addColorStop(0, n.sand0);
      sg.addColorStop(1, n.sand1);
      g.fillStyle = sg;
      g.fillRect(P.x, P.y, P.w, G.shore - P.y);
      // feine Körnung (fest verteilt)
      g.fillStyle = withAlpha(theme.dark ? '#000000' : '#8a6a32', theme.dark ? 0.22 : 0.16);
      for (let i = 0; i < 160; i++) {
        const fx = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const fy = (Math.sin(i * 78.233) * 12345.678) % 1;
        const px = P.x + Math.abs(fx) * P.w;
        const py = P.y + Math.abs(fy) * (G.shore - P.y - 6);
        g.fillRect(px, py, 1.6, 1.6);
      }
      // Wasser mit Wellen
      const wg = g.createLinearGradient(0, G.shore, 0, P.y + P.h);
      wg.addColorStop(0, n.water0);
      wg.addColorStop(1, n.water1);
      g.fillStyle = wg;
      g.fillRect(P.x, G.shore, P.w, P.y + P.h - G.shore);
      g.strokeStyle = withAlpha('#ffffff', theme.dark ? 0.12 : 0.35);
      g.lineWidth = 1.4;
      for (let row = 0; row < 8; row++) {
        const yy = G.shore + 16 + row * 18;
        if (yy > P.y + P.h) break;
        g.beginPath();
        for (let xx = 0; xx <= P.w; xx += 6) {
          const yv = yy + Math.sin(xx / 22 + row * 1.7) * 2.2;
          if (xx === 0) g.moveTo(P.x + xx, yv);
          else g.lineTo(P.x + xx, yv);
        }
        g.stroke();
      }
      // Gischt am Ufer
      g.strokeStyle = withAlpha('#ffffff', theme.dark ? 0.45 : 0.85);
      g.lineWidth = 3;
      g.beginPath();
      for (let xx = 0; xx <= P.w; xx += 5) {
        const yv = G.shore + Math.sin(xx / 14) * 1.6;
        if (xx === 0) g.moveTo(P.x + xx, yv);
        else g.lineTo(P.x + xx, yv);
      }
      g.stroke();
      g.restore();
      const sz = fs(12, 11);
      const kl = k.labels;
      const bounds = { x: P.x + 4, y: P.y + 30, w: P.w - 8, h: P.h - 34 };
      // gerade Linie (kürzester Weg)
      g.save();
      g.globalAlpha *= kl;
      g.setLineDash([5, 5]);
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(...G.A);
      g.lineTo(...G.S);
      g.stroke();
      g.restore();
      // schnellster Weg als Umriss
      const kS = kShow.v * kl;
      if (kS > 0.02 && Math.abs(x - o.opt) > 0.15) {
        g.save();
        g.globalAlpha *= kS;
        g.strokeStyle = withAlpha(col.opt(), 0.85);
        g.lineWidth = 2;
        g.setLineDash([7, 4]);
        g.beginPath();
        g.moveTo(...G.A);
        g.lineTo(...G.E(o.opt));
        g.lineTo(...G.S);
        g.stroke();
        g.restore();
      }
      // gewählter Weg: laufen (orange) und schwimmen (türkis)
      const E = G.E(x);
      const glowing = glowT !== null ? clamp01(1 - (frameNow - glowT) / 1400) : 0;
      g.save();
      g.lineCap = 'round';
      g.lineWidth = 4;
      g.strokeStyle = glowing > 0 ? mixColor(col.x(), col.opt(), glowing * 0.6) : col.x();
      g.beginPath();
      g.moveTo(...G.A);
      g.lineTo(...E);
      g.stroke();
      g.strokeStyle = glowing > 0 ? mixColor(col.tan(), col.opt(), glowing * 0.6) : col.tan();
      g.setLineDash([2, 7]);
      g.lineWidth = 4.5;
      g.beginPath();
      g.moveTo(...E);
      g.lineTo(...G.S);
      g.stroke();
      g.restore();
      // Lot und Winkel
      g.save();
      g.globalAlpha *= kl;
      g.setLineDash([3, 3]);
      g.strokeStyle = withAlpha(theme.text, 0.6);
      g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(E[0], E[1] - 44);
      g.lineTo(E[0], E[1] + 44);
      g.stroke();
      g.restore();
      const a1 = Math.atan2(x, l.a);
      const a2 = Math.atan2(l.d - x, l.b);
      const ar = 26;
      g.save();
      g.globalAlpha *= kl;
      g.fillStyle = withAlpha(col.x(), 0.22);
      g.beginPath();
      g.moveTo(E[0], E[1]);
      g.arc(E[0], E[1], ar, -Math.PI / 2 - a1, -Math.PI / 2);
      g.closePath();
      g.fill();
      g.fillStyle = withAlpha(col.tan(), 0.26);
      g.beginPath();
      g.moveTo(E[0], E[1]);
      g.arc(E[0], E[1], ar, Math.PI / 2 - a2, Math.PI / 2);
      g.closePath();
      g.fill();
      g.restore();
      // Winkel auf der Winkelhalbierenden beschriften
      const b1 = -Math.PI / 2 - a1 / 2;
      const b2 = Math.PI / 2 - a2 / 2;
      fpill(E[0] + Math.cos(b1) * (ar + 26), E[1] + Math.sin(b1) * (ar + 14), `\\c{x}{α₁ = ${cN('la1', (a1 * 180) / Math.PI, 0)}°}`, { size: 11, alpha: kl, bounds });
      fpill(E[0] + Math.cos(b2) * (ar + 30), E[1] + Math.sin(b2) * (ar + 14), `\\c{t}{α₂ = ${cN('la2', (a2 * 180) / Math.PI, 0)}°}`, { size: 11, alpha: kl, bounds });
      // Personen
      drawGuard(G.A[0], G.A[1], kl);
      drawSwimmer(G.S[0], G.S[1], kl);
      // Maße
      const ink2 = theme.muted;
      dimPx(G.A[0] - 16, G.A[1], G.A[0] - 16, G.shore, ink2, kl);
      fpill(G.A[0] - 22, (G.A[1] + G.shore) / 2, `${N(l.a, 0)} ${u('m')}`, { align: 'right', size: 11, alpha: kl, color: theme.muted, bounds });
      dimPx(G.S[0] + 16, G.shore, G.S[0] + 16, G.S[1], ink2, kl);
      fpill(G.S[0] + 22, (G.S[1] + G.shore) / 2, `${N(l.b, 0)} ${u('m')}`, { align: 'left', size: 11, alpha: kl, color: theme.muted, bounds });
      // x entlang des Ufers
      if (x > 1.5) {
        dimPx(G.A[0], G.shore + 12, E[0], G.shore + 12, theme.dark ? '#ffffff' : '#0b3b55', kl);
        fpill((G.A[0] + E[0]) / 2, G.shore + 28, `\\c{x}{x = ${cN('lx', x, 1)} ${u('m')}}`, { size: sz, alpha: kl, bounds, border: withAlpha(col.x(), 0.6) });
      }
      if (l.d * G.sc > 380) fpill(G.X0 + l.d * G.sc * 0.2, P.y + P.h - 14, `\\c{m}{${N(l.d, 0)} ${u('m')} ${T2('seitlich', 'sideways')}}`, { size: 11, alpha: kl * 0.9 });
      // Eintrittspunkt (ziehbar)
      const hot = hoverShore || drag === 'shore';
      if (editable()) halo(E[0], E[1], col.x(), hot ? 24 : 18, hot ? 1 : 0.7);
      dot(E[0], E[1], col.x(), hot ? 8 : 7, k.panel);
      // Wettrennen
      if (race || raceDone) drawRace(G, l);
    }

    function drawGuard(x: number, y: number, a: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      g.fillStyle = 'rgba(0,0,0,0.22)';
      g.beginPath();
      g.ellipse(x + 3, y + 3, 11, 7, 0, 0, TAU);
      g.fill();
      // Schultern (rote Weste) und Kopf, von oben gesehen
      const red = th().series[1]!;
      const grad = g.createLinearGradient(x - 10, y - 6, x + 10, y + 6);
      grad.addColorStop(0, mixColor(red, '#ffffff', 0.25));
      grad.addColorStop(1, red);
      g.fillStyle = grad;
      roundRect(g, x - 11, y - 6, 22, 12, 6);
      g.fill();
      g.fillStyle = th().dark ? '#e7c9a5' : '#e0b88f';
      g.beginPath();
      g.arc(x, y, 5.5, 0, TAU);
      g.fill();
      g.fillStyle = th().dark ? '#5b4636' : '#6b4b2f';
      g.beginPath();
      g.arc(x, y - 1, 4.4, Math.PI, TAU);
      g.fill();
      g.restore();
      fpill(x + 16, y, `\\t{${T2('Rettungsschwimmer', 'Lifeguard')}}`, { align: 'left', size: 11, alpha: a * 0.95 });
    }
    function drawSwimmer(x: number, y: number, a: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= a;
      for (const [rr, al] of [
        [16, 0.35],
        [24, 0.2],
      ] as const) {
        g.strokeStyle = withAlpha('#ffffff', al);
        g.lineWidth = 1.6;
        g.beginPath();
        g.ellipse(x, y, rr, rr * 0.55, 0, 0, TAU);
        g.stroke();
      }
      g.strokeStyle = th().dark ? '#e7c9a5' : '#d9a777';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x - 4, y);
      g.lineTo(x - 11, y - 9);
      g.moveTo(x + 4, y);
      g.lineTo(x + 11, y - 9);
      g.stroke();
      g.fillStyle = th().dark ? '#e7c9a5' : '#e0b88f';
      g.beginPath();
      g.arc(x, y, 5.5, 0, TAU);
      g.fill();
      g.restore();
      fpill(x - 22, y + 4, `\\t{${T2('Person im Wasser', 'Swimmer')}}`, { align: 'right', size: 11, alpha: a * 0.95 });
    }
    function drawRace(G: ReturnType<typeof lifeGeom>, l: Life): void {
      const g = surface.g;
      const R = race;
      const tNow = R ? (frameNow - R.t0) / R.scale : Infinity;
      const runners = R ? R.runners : lastRunners;
      const pos = (xe: number, tt: number): [number, number] => {
        const t1 = Math.hypot(l.a, xe) / l.v1;
        const Ep = G.E(xe);
        if (tt <= t1) return [lerp(G.A[0], Ep[0], tt / t1), lerp(G.A[1], Ep[1], tt / t1)];
        const t2 = Math.hypot(l.b, l.d - xe) / l.v2;
        const f = clamp01((tt - t1) / t2);
        return [lerp(Ep[0], G.S[0], f), lerp(Ep[1], G.S[1], f)];
      };
      runners.forEach((rn, i) => {
        const [px, py] = pos(rn.x, tNow);
        const c = rn.color();
        g.save();
        g.fillStyle = c;
        g.strokeStyle = th().bg;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(px, py, 6.5, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        if (tNow >= rn.T) fpill(G.S[0] - 18, G.S[1] - 26 - i * 24, `\\t{${say(rn.name)}}: ${N(rn.T, 2)} ${u('s')}`, { align: 'right', size: 11, color: ink(c), border: withAlpha(c, 0.6) });
      });
      const shown = Math.min(tNow, Math.max(...runners.map((r) => r.T)));
      fpill(G.A[0] + 16, G.A[1] + 18, `\\t{${T2('Zeit', 'Time')}} t = ${N(shown, 1)} ${u('s')}`, { align: 'left', size: 11 });
    }
    let lastRunners: { x: number; T: number; color: () => string; name: Txt }[] = [];

    /* =====================================================================
     * Einstieg und Ablauf „Optimum suchen“
     * ===================================================================== */
    interface Intro {
      panel: number;
      reveal: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3600) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 300) / 1300)),
        labels: ease.outCubic(clamp01((t - 1500) / 600)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1700),
      };
    }
    /** Zeitpunkte (ms nach Start), zu denen die Zeilen des Lösungswegs beim Suchen erscheinen. */
    const ROW_AT = [HUNT.scan0 + 250, HUNT.scan0 + 1050, HUNT.scan0 + 1850, HUNT.back0, HUNT.back0 + 800, HUNT.ends, HUNT.ends + 600];
    interface HuntNow {
      t: number;
      /** angezeigter Wert der Variablen */
      x: number;
      /** Graph bis hierher gezeichnet (null: ganz) */
      curveTo: number | null;
      /** alter Graph blendet aus */
      oldA: number;
      ends: number;
      opt: number;
    }
    function huntNow(o: Objective, now: number): HuntNow | null {
      if (!hunt) return null;
      const t = now - hunt.t0;
      const [lo, hi] = domainOf(o);
      let x: number;
      if (t < HUNT.scan0) x = lerp(hunt.x0, lo, ease.inOutCubic(clamp01(t / HUNT.scan0)));
      else if (t < HUNT.scan1) x = lerp(lo, hi, ease.inOutCubic(clamp01((t - HUNT.scan0) / (HUNT.scan1 - HUNT.scan0))));
      else if (t < HUNT.back0) x = hi;
      else x = lerp(hi, o.opt, ease.inOutCubic(clamp01((t - HUNT.back0) / (HUNT.back1 - HUNT.back0))));
      return {
        t,
        x,
        curveTo: t < HUNT.scan1 ? (t < HUNT.scan0 ? lo : x) : null,
        oldA: 1 - clamp01(t / HUNT.scan0),
        ends: ease.outBack(clamp01((t - HUNT.ends) / 500)),
        opt: clamp01((t - HUNT.glow) / 400),
      };
    }

    /* =====================================================================
     * Graph der Zielfunktion
     * ===================================================================== */
    function edgeLabel(e: Edge, M: Meta): string {
      if (e.kind === 'inf') return `${M.z} → ∞`;
      const xs = Number.isFinite(e.x) ? N(e.x, 0) : '∞';
      return e.kind === 'value' ? `${M.z}(${xs}) ${eq(e.y, 2)} ${N(e.y, 2)}` : `${M.z}(${Number.isFinite(e.x) ? xs : `${M.v} → ∞`}) ${Number.isFinite(e.x) ? '=' : '→'} 0`;
    }

    function drawGraph(key: ProbKey, o: Objective, x: number, k: Intro, H: HuntNow | null, now: number): void {
      const g = surface.g;
      const theme = th();
      const M = m(key);
      plot.setAxes({ x: { label: `${M.v} in ${U(M.ux)}` }, y: { label: '' } });
      plot.setRangePadded([o.lo, o.hi + (o.hi - o.lo) * 0.07], [rng.y0.v, rng.y1.v], PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const pad = PAD();
      const inner: Rect = { x: r.x + pad.left, y: r.y + pad.top - 6, w: r.w - pad.left - pad.right, h: r.h - pad.top - pad.bottom + 6 };
      const ks = kShow.v;
      const [lo, hi] = domainOf(o);
      const eps = o.closed ? 0 : (o.hi - o.lo) * 1e-3;
      /** Beschriftungen werden gesammelt und ohne Überlappung gesetzt (Reihenfolge = Vorrang). */
      const queue: { x: number; y: number[]; src: string; opts: PillOpts; must: boolean }[] = [];
      // Graph: beim Einstieg von links nach rechts, beim Suchen entsteht er mit dem Punkt
      const full = lerp(o.lo + eps, o.hi - eps, k.reveal);
      if (H && H.oldA > 0.01) strokePts(sample(plot, o.f, o.lo + eps, o.hi - eps), col.Z(), fs(3.2, 2.7), { glow: true, alpha: H.oldA });
      const to = H ? H.curveTo : full;
      if (to !== null && H) {
        if (to > lo) strokePts(sample(plot, o.f, lo, to), col.Z(), fs(3.4, 2.8), { glow: true });
        // Spur der Probierpunkte
        const nTr = 14;
        for (let i = 0; i <= nTr; i++) {
          const xs = lerp(lo, hi, i / nTr);
          if (xs > to + 1e-9) break;
          dot(plot.px(xs), plot.py(o.f(xs)), withAlpha(col.Z(), 0.95), 3.2, 0.9);
        }
      } else strokePts(sample(plot, o.f, o.lo + eps, H ? o.hi - eps : full), col.Z(), fs(3.2, 2.7), { glow: true });
      // Ränder
      const showEnds = (H ? H.ends : k.labels) * ks;
      if (showEnds > 0.01) {
        for (const e of o.ends) {
          if (e.kind === 'inf') {
            const xe = Number.isFinite(e.x) && e.x > 0 ? e.x : e.x === 0 ? o.lo : o.hi;
            const px = plot.px(xe);
            arrowPx(px + (xe === o.lo ? 10 : -10), r.y + pad.top + 30, px + (xe === o.lo ? 10 : -10), r.y + pad.top + 2, withAlpha(col.cut(), showEnds), 2, 8);
            continue;
          }
          if (!Number.isFinite(e.x)) {
            const yEnd = plot.py(o.f(o.hi));
            queue.push({ x: plot.px(o.hi) - 4, y: [yEnd - 20, yEnd - 44], src: `\\c{c}{${edgeLabel(e, M)}}`, opts: { align: 'right', size: 11, alpha: showEnds, bounds: inner }, must: false });
            continue;
          }
          const px = plot.px(e.x);
          const py = plot.py(e.y);
          dot(px, py, col.cut(), e.kind === 'value' ? 5.5 : 5, showEnds, e.kind !== 'value');
          if (e.kind === 'value') queue.push({ x: px + (e.x <= o.lo ? 10 : -10), y: [py - 16, py + 18, py - 40], src: `\\c{c}{${edgeLabel(e, M)} ${u(U(M.uz))}}`, opts: { align: e.x <= o.lo ? 'left' : 'right', size: 11, alpha: showEnds, bounds: inner }, must: false });
        }
      }
      // Optimum: waagerechte Tangente, Lot, Leuchten
      const kOpt = (H ? H.opt : k.labels) * ks;
      const xo = o.opt;
      const yo = o.f(xo);
      if (kOpt > 0.01) {
        const pxo = plot.px(xo);
        const pyo = plot.py(yo);
        g.save();
        g.globalAlpha *= kOpt;
        g.strokeStyle = withAlpha(col.opt(), 0.6);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(pxo, pyo);
        g.lineTo(pxo, plot.py(rng.y0.v));
        g.stroke();
        g.setLineDash([]);
        g.strokeStyle = col.opt();
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(pxo - 34, pyo);
        g.lineTo(pxo + 34, pyo);
        g.stroke();
        g.restore();
        if (glowT !== null) {
          const q = clamp01((now - glowT) / 1400);
          halo(pxo, pyo, col.opt(), 16 + 34 * q, 1 - q);
        }
        dot(pxo, pyo, col.opt(), 6, kOpt);
        const kind = o.kind === 'max' ? T2('Maximum', 'maximum') : T2('Minimum', 'minimum');
        const above = o.kind === 'max';
        const lab = `\\c{o}{\\t{${kind}} ${M.v} ${eq(xo, 2)} ${N(xo, 2)}, ${M.z} ${eq(yo, M.dz)} ${N(yo, M.dz)}}`;
        queue.unshift({ x: pxo, y: above ? [pyo - 20, pyo + 24, pyo + 50] : [pyo + 22, pyo - 22, pyo + 48], src: lab, opts: { size: fs(12, 11), alpha: kOpt, bounds: inner, border: withAlpha(col.opt(), 0.65) }, must: true });
      }
      // Tangente im aktuellen Punkt (Steigung = Ableitung)
      const yx = o.f(x);
      const mm = o.d1(x);
      const sx = plot.scale.x;
      const sy = plot.scale.y;
      const half = 46 / Math.hypot(1, (mm * sy) / sx) / sx;
      g.save();
      g.globalAlpha *= k.labels;
      plot.segment([x - half, yx - mm * half], [x + half, yx + mm * half], { color: col.tan(), width: 2.4 });
      g.restore();
      // Lot zur x-Achse
      const px = plot.px(x);
      const py = plot.py(yx);
      g.save();
      g.globalAlpha *= 0.7 * k.labels;
      g.strokeStyle = col.x();
      g.setLineDash([2, 4]);
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px, plot.py(rng.y0.v));
      g.stroke();
      g.restore();
      const hotP = hoverPlot === 'main' || hoverPlot === 'der';
      if (hotP) halo(px, py, col.x(), 22, 1);
      dot(px, py, col.x(), hotP ? 8 : 7, k.panel);
      // Wert am Punkt
      const right = px < r.x + r.w * 0.62;
      const vSrc = `${M.z}(${cN('gx', x, 2)}) = ${cN('gy', yx, M.dz)} ${u(U(M.uz))}`;
      const atOpt = kOpt > 0.5 && Math.abs(x - xo) < (o.hi - o.lo) * 0.004;
      if (ks > 0.5 && !atOpt) queue.splice(kOpt > 0.01 ? 1 : 0, 0, { x: px + (right ? 14 : -14), y: [py - 22, py + 24, py - 48, py + 48], src: vSrc, opts: { align: right ? 'left' : 'right', size: fs(12, 11), bounds: inner, alpha: k.labels * (2 * ks - 1), color: theme.text }, must: true });
      const placed: Rect[] = [fpill(r.x + pad.left + 6, r.y + 17, 'X', { align: 'left', size: fs(12.5, 11.5), dry: true })];
      placed[0] = { ...placed[0]!, w: wOf(`\\c{z}{${M.z}(${M.v})} \\c{m}{\\t{in ${U(M.uz)} · ${say(M.goal)}}}`, fs(12.5, 11.5)) + 16 };
      const hit = (a: Rect, b: Rect) => a.x < b.x + b.w + 3 && b.x < a.x + a.w + 3 && a.y < b.y + b.h + 2 && b.y < a.y + a.h + 2;
      for (const L of queue) {
        let best: number | null = null;
        for (const yy of L.y) {
          const rr = fpill(L.x, yy, L.src, { ...L.opts, dry: true });
          if (!placed.some((q2) => hit(q2, rr))) {
            best = yy;
            break;
          }
        }
        if (best === null && L.must) best = L.y[0]!;
        if (best === null) continue;
        placed.push(fpill(L.x, best, L.src, L.opts));
      }
      // Titel
      fpill(r.x + pad.left + 6, r.y + 17, `\\c{z}{${M.z}(${M.v})} \\c{m}{\\t{in ${U(M.uz)} · ${say(M.goal)}}}`, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.Z(), 0.5), bounds: r });
      // verdeckt: Zielfunktion erst selbst aufstellen
      if (ks < 0.99) veil(inner, 1 - ks, T2(`Wie sieht ${M.z}(${M.v}) aus?`, `What does ${M.z}(${M.v}) look like?`), T2('Erst die Zielfunktion aufstellen und das Optimum berechnen, dann „Lösung aufdecken“.', 'First set up the objective function and work out the optimum, then “Reveal the solution”.'), inner.h < 120);
      plot.end();
    }

    /* =====================================================================
     * Streifen der Ableitung: grün positiv (steigt), rot negativ (fällt)
     * ===================================================================== */
    function drawDeriv(key: ProbKey, o: Objective, x: number, k: Intro, H: HuntNow | null): void {
      const R0 = regions().der;
      if (R0.w < 20) return;
      const g = surface.g;
      const theme = th();
      const M = m(key);
      plotD.setAxes({ x: { label: '' }, y: { label: '' } });
      plotD.setRangePadded([o.lo, o.hi + (o.hi - o.lo) * 0.07], [rng.d0.v, rng.d1.v], PADD());
      plotD.resize();
      plotD.begin();
      plotD.grid();
      plotD.axes();
      const r = plotD.rect;
      const pad = PADD();
      const inner: Rect = { x: r.x + pad.left, y: r.y + pad.top - 4, w: r.w - pad.left - pad.right, h: r.h - pad.top - pad.bottom + 4 };
      const ks = kShow.v;
      const eps = o.closed ? 0 : (o.hi - o.lo) * 1e-3;
      const [lo] = domainOf(o);
      const to = H && H.curveTo !== null ? H.curveTo : lerp(o.lo + eps, o.hi - eps, k.reveal);
      const from = H && H.curveTo !== null ? lo : o.lo + eps;
      const yc = (v: number) => clamp(v, rng.d0.v * 1.4, rng.d1.v * 1.4);
      if (to > from) {
        const y0 = plotD.py(0);
        for (const sign of [1, -1]) {
          const pts = sample(plotD, (t) => (sign > 0 ? Math.max(yc(o.d1(t)), 0) : Math.min(yc(o.d1(t)), 0)), from, to);
          const color = sign > 0 ? col.opt() : col.cut();
          g.save();
          g.fillStyle = withAlpha(color, theme.dark ? 0.32 : 0.2);
          g.beginPath();
          g.moveTo(plotD.px(from), y0);
          for (const [qx, qy] of pts) g.lineTo(qx, qy);
          g.lineTo(plotD.px(to), y0);
          g.closePath();
          g.fill();
          g.restore();
        }
        strokePts(sample(plotD, (t) => yc(o.d1(t)), from, to), col.tan(), fs(2.6, 2.3), { glow: true });
      }
      // Nullstelle der Ableitung
      const kOpt = (H ? H.opt : k.labels) * ks;
      if (kOpt > 0.01) {
        dot(plotD.px(o.opt), plotD.py(0), col.opt(), 5, kOpt);
        fpill(plotD.px(o.opt), plotD.py(0) + (o.kind === 'max' ? 16 : -16), `\\c{o}{${M.z}′ = 0}`, { size: 11, alpha: kOpt, bounds: inner });
      }
      // aktueller Wert der Ableitung
      const d = o.d1(x);
      const px = plotD.px(x);
      g.save();
      g.globalAlpha *= k.labels;
      g.strokeStyle = col.x();
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(px, plotD.py(0));
      g.lineTo(px, plotD.py(yc(d)));
      g.stroke();
      g.restore();
      dot(px, plotD.py(yc(d)), col.tan(), 4.5, k.labels);
      dot(px, plotD.py(0), col.x(), hoverPlot === 'der' ? 7.5 : 6, k.panel);
      // Titel mit Vorzeichen
      const tiny = Math.abs(d) < Math.max(Math.abs(rng.d1.v), Math.abs(rng.d0.v)) * 4e-3;
      const sign = tiny ? '= 0' : d > 0 ? '> 0' : '< 0';
      const what = tiny ? T2('waagerechte Tangente', 'horizontal tangent') : d > 0 ? T2(`${M.z} steigt`, `${M.z} increases`) : T2(`${M.z} fällt`, `${M.z} decreases`);
      const c = tiny ? col.opt() : d > 0 ? col.opt() : col.cut();
      const tsrc = `\\c{t}{${M.z}′(${M.v})} ${sign}  \\c{m}{\\t{→ ${what}}}`;
      if (ks > 0.5) fpill(r.x + pad.left + 6, r.y + 15, tsrc, { align: 'left', size: fs(12, 11), alpha: k.panel * (2 * ks - 1), border: withAlpha(c, 0.6), bounds: r });
      else fpill(r.x + pad.left + 6, r.y + 15, `\\c{t}{${M.z}′(${M.v})} \\c{m}{\\t{${T2('Ableitung', 'derivative')}}}`, { align: 'left', size: fs(12, 11), alpha: k.panel * (1 - 2 * ks), border: withAlpha(col.tan(), 0.6), bounds: r });
      if (ks < 0.99) veil(inner, 1 - ks, T2(`Wo ist ${M.z}′(${M.v}) = 0?`, `Where is ${M.z}′(${M.v}) = 0?`), '', true);
      plotD.end();
    }

    /** Gestrichelte Verbindung des aktuellen Punkts zwischen den beiden Diagrammen. */
    function drawLink(o: Objective, x: number, k: Intro): void {
      const R0 = regions().der;
      if (R0.w < 20) return;
      const g = surface.g;
      const px = plot.px(x);
      g.save();
      g.globalAlpha *= 0.5 * k.labels;
      g.strokeStyle = col.x();
      g.lineWidth = 1.2;
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(px, plot.rect.y + plot.rect.h - PAD().bottom);
      g.lineTo(px, plotD.py(0));
      g.stroke();
      g.restore();
      void o;
    }

    /* =====================================================================
     * Karten rechts (bzw. unten)
     * ===================================================================== */
    /** Zahl in einer Formel: ganzzahlig ohne Nachkommastellen, sonst bis zu d Stellen. */
    const q = (v: number, d = 2) => N(v, isExact(v, 0) ? 0 : d);
    /** Ganzzahliges Polynom als Formeltext, z. B. 12x² − 200x + 600. */
    function poly(cs: number[], v: string): string {
      const deg = cs.length - 1;
      let s = '';
      cs.forEach((c, i) => {
        const e = deg - i;
        if (Math.abs(c) < 1e-12) return;
        const mag = Math.abs(c);
        const body = e === 0 ? q(mag) : `${Math.abs(mag - 1) < 1e-12 ? '' : q(mag)}${v}${e === 1 ? '' : e === 2 ? '²' : e === 3 ? '³' : `^{${e}}`}`;
        if (!s) s = `${c < 0 ? '−' : ''}${body}`;
        else s += ` ${c < 0 ? '−' : '+'} ${body}`;
      });
      return s || '0';
    }

    /** Zeile einer Karte: Überschrift, Formel oder Fließtext. */
    type Row = { src: string; kind: 'head' | 'math' | 'text'; color?: string; size?: number; secret?: boolean; extra?: boolean; step?: number; hl?: string; gap?: number; num?: string };
    const head = (txt: string, step: number): Row => ({ src: txt, kind: 'head', step, gap: 3 });
    const mathRow = (src: string, step: number, o: Partial<Row> = {}): Row => ({ src, kind: 'math', step, secret: true, gap: 5, ...o });

    /** Lösungsweg je Problem (Schritte 0 … 6). */
    function stepRows(key: ProbKey, o: Objective): Row[] {
      const qp = exactParams();
      const xo = o.opt;
      const yo = o.f(xo);
      const H = [T2('1. Zielfunktion', '1. Objective function'), T2('2. Nebenbedingung einsetzen', '2. Use the constraint'), T2('3. Definitionsbereich', '3. Domain'), T2('4. Notwendige Bedingung', '4. Necessary condition'), T2('5. Hinreichende Bedingung', '5. Sufficient condition'), T2('6. Ränder vergleichen', '6. Compare the boundaries'), T2('7. Ergebnis', '7. Result')];
      const rows: Row[] = [];
      const kindW = o.kind === 'max' ? T2('Maximum', 'maximum') : T2('Minimum', 'minimum');
      const push = (i: number, ...r: Row[]) => rows.push(head(H[i]!, i), ...r);
      const z = `\\c{z}`;
      switch (key) {
        case 'box': {
          const { a, b } = qp;
          const [x1, x2] = boxCritical({ a, b });
          const red = boxReducedQuadratic({ a, b });
          push(0, mathRow(`V = \\t{${T2('Länge · Breite · Höhe', 'length · width · height')}}`, 0, { secret: false }));
          push(1, mathRow(`${T2('\\t{Höhe} x, \\t{Länge} a − 2x, \\t{Breite} b − 2x', '\\t{height} x, \\t{length} a − 2x, \\t{width} b − 2x')}`, 1, { color: th().muted, extra: true }), mathRow(`${z}{V(x) = x(${q(a)} − 2x)(${q(b)} − 2x)}`, 1), mathRow(`= ${poly([4, -2 * (a + b), a * b, 0], 'x')}`, 1, { extra: true }));
          push(2, mathRow(`0 < x < ${q(Math.min(a, b) / 2)}`, 2));
          push(3, mathRow(`V′(x) = ${poly([12, -4 * (a + b), a * b], 'x')} = 0`, 3), mathRow(`⇔ ${poly(red, 'x')} = 0`, 3, { extra: red[0] === 12 }), mathRow(`x₁ ${eq(x1)} ${N(x1, 2)},  x₂ ${eq(x2)} ${N(x2, 2)} ${x2 >= Math.min(a, b) / 2 - 1e-9 ? '∉ D' : ''}`, 3));
          push(4, mathRow(`V″(${N(x1, 2)}) ${eq(o.d2(x1), 1)} ${N(o.d2(x1), 1)} < 0  ⇒  \\t{${kindW}}`, 4));
          push(5, mathRow(`V(x) → 0 \\t{${T2('für', 'for')}} x → 0 \\t{${T2('und', 'and')}} x → ${q(Math.min(a, b) / 2)}`, 5));
          push(6, mathRow(`\\c{o}{\\b{x ${eq(xo)} ${N(xo, 2)} ${u('cm')},  V ${eq(yo, 1)} ${N(yo, 1)} ${u('cm³')}}}`, 6, { hl: col.opt() }));
          break;
        }
        case 'can': {
          const V = qp.v;
          push(0, mathRow(`O = 2πr² + 2πrh`, 0, { secret: false }));
          push(1, mathRow(`πr²h = ${q(V)}  ⇒  h = \\f{${q(V)}}{πr²}`, 1), mathRow(`${z}{O(r) = 2πr² + \\f{${q(2 * V)}}{r}}`, 1));
          push(2, mathRow(`r > 0`, 2));
          push(3, mathRow(`O′(r) = 4πr − \\f{${q(2 * V)}}{r²} = 0`, 3), mathRow(`⇔ r³ = \\f{${q(V / 2)}}{π}  ⇒  r ${eq(xo)} ${N(xo, 2)}`, 3));
          push(4, mathRow(`O″(r) = 4π + \\f{${q(4 * V)}}{r³} > 0  ⇒  \\t{${kindW}}`, 4));
          push(5, mathRow(`O(r) → ∞ \\t{${T2('für', 'for')}} r → 0 \\t{${T2('und', 'and')}} r → ∞`, 5));
          push(6, mathRow(`\\c{o}{\\b{r ${eq(xo)} ${N(xo, 2)} ${u('cm')},  h ${eq(canHeight(V, xo))} ${N(canHeight(V, xo), 2)} ${u('cm')}}}`, 6, { hl: col.opt() }), mathRow(`\\c{o}{\\b{O ${eq(yo, 1)} ${N(yo, 1)} ${u('cm²')}}}  \\c{m}{(h = 2r)}`, 6, { hl: col.opt() }));
          break;
        }
        case 'rect': {
          const h5 = lang === 'de' ? '0,5' : '0.5';
          push(0, mathRow(`A = \\t{${T2('Breite · Höhe', 'width · height')}} = u · f(u)`, 0, { secret: false }));
          push(1, mathRow(`\\t{${T2('Ecke auf dem Graphen', 'corner on the graph')}}: f(u) = 3e^{−${h5}u}`, 1, { color: th().muted, extra: true }), mathRow(`${z}{A(u) = 3u · e^{−${h5}u}}`, 1));
          push(2, mathRow(`u > 0`, 2));
          push(3, mathRow(`A′(u) = 3e^{−${h5}u}(1 − ${h5}u) = 0`, 3), mathRow(`e^{…} ≠ 0  ⇒  u = 2`, 3, { extra: true }));
          push(4, mathRow(`A″(2) = 3e^{−1}(${h5} − 1) ${eq(o.d2(2), 3)} ${N(o.d2(2), 3)} < 0`, 4));
          push(5, mathRow(`A(u) → 0 \\t{${T2('für', 'for')}} u → 0 \\t{${T2('und', 'and')}} u → ∞`, 5));
          push(6, mathRow(`\\c{o}{\\b{u = 2,  A(2) = \\f{6}{e} ≈ ${N(yo, 3)} ${u(U(META.rect.uz))}}}`, 6, { hl: col.opt() }));
          break;
        }
        case 'cone': {
          const { cr: R, ch: Hc } = qp;
          const kk = Hc / R;
          const kTxt = isExact(kk, 2) ? q(kk) : `\\f{${q(Hc)}}{${q(R, 1)}}`;
          const k3 = 3 * kk;
          const k3Txt = isExact(k3, 2) ? q(k3) : `\\f{${q(3 * Hc)}}{${q(R, 1)}}`;
          push(0, mathRow(`V = πr² · h`, 0, { secret: false }));
          push(1, mathRow(`\\t{${T2('Strahlensatz', 'Intercept theorem')}}: \\f{h}{H} = \\f{R − r}{R}`, 1, { color: th().muted, extra: true }), mathRow(`h = ${q(Hc)} − ${kTxt}r`, 1), mathRow(`${z}{V(r) = πr²(${q(Hc)} − ${kTxt}r)}`, 1));
          push(2, mathRow(`0 < r < ${q(R, 1)}`, 2));
          push(3, mathRow(`V′(r) = π(${q(2 * Hc)}r − ${k3Txt}r²) = 0`, 3), mathRow(`⇒  r = \\f{2}{3}R = ${N(xo, 2)}`, 3));
          push(4, mathRow(`V″(${N(xo, 2)}) = −${q(2 * Hc)}π < 0  ⇒  \\t{${kindW}}`, 4));
          push(5, mathRow(`V(r) → 0 \\t{${T2('für', 'for')}} r → 0 \\t{${T2('und', 'and')}} r → ${q(R, 1)}`, 5));
          push(6, mathRow(`\\c{o}{\\b{r ${eq(xo)} ${N(xo, 2)} ${u('cm')},  h ${eq(Hc / 3)} ${N(Hc / 3, 2)} ${u('cm')}}}`, 6, { hl: col.opt() }), mathRow(`\\c{o}{\\b{V ${eq(yo, 1)} ${N(yo, 1)} ${u('cm³')}}}  \\c{m}{= \\f{4}{9} V_{${T2('Kegel', 'cone')}}}`, 6, { hl: col.opt() }));
          break;
        }
        case 'life': {
          const l: Life = { ...LIFE_GEOM, v1: qp.v1, v2: qp.v2 };
          const v1 = q(l.v1, 1);
          const v2 = q(l.v2, 1);
          const nw = lifeNewton(l, 30, 3);
          push(0, mathRow(`T = \\f{s_{${T2('Sand', 'sand')}}}{v₁} + \\f{s_{${T2('Wasser', 'water')}}}{v₂}`, 0, { secret: false }));
          push(1, mathRow(`\\t{Pythagoras}: \\r{20² + x²},  \\r{30² + (60 − x)²}`, 1, { color: th().muted, extra: true }), mathRow(`${z}{T(x) = \\f{\\r{400 + x²}}{${v1}} + \\f{\\r{900 + (60 − x)²}}{${v2}}}`, 1));
          push(2, mathRow(`0 ≤ x ≤ 60`, 2));
          push(3, mathRow(`T′(x) = \\f{x}{${v1}\\r{400 + x²}} − \\f{60 − x}{${v2}\\r{900 + (60 − x)²}}`, 3), mathRow(`T′(x) = 0 \\t{${T2('nur numerisch lösbar', 'only solvable numerically')}}`, 3), mathRow(`\\t{Newton}: 30 → ${nw.slice(1).map((v) => N(v, 2)).join(' → ')}`, 3, { extra: true }));
          push(4, mathRow(`T″(x) > 0 \\t{${T2('überall', 'everywhere')}}  ⇒  \\t{${kindW}}`, 4));
          push(5, mathRow(`T(0) ≈ ${N(lifeTime(l, 0), 2)} ${u('s')},  T(60) ≈ ${N(lifeTime(l, 60), 2)} ${u('s')}`, 5));
          push(6, mathRow(`\\c{o}{\\b{x ≈ ${N(xo, 2)} ${u('m')},  T ≈ ${N(yo, 2)} ${u('s')}}}`, 6, { hl: col.opt() }));
          break;
        }
      }
      if (!isGlobal(o)) rows.push({ src: T2('Achtung: Ein Randwert ist besser!', 'Careful: a boundary value is better!'), kind: 'text', step: 6, color: col.cut() });
      return rows;
    }

    /** Sichtbarkeit einer Zeile (Einstieg, Aufdecken, „Optimum suchen“). */
    function rowAlpha(step: number, i: number, n: number, k: Intro): number {
      if (hunt) {
        const t = frameNow - hunt.t0;
        return clamp01((t - ROW_AT[step]!) / 380);
      }
      let a = clamp01(k.stagger * (n + 2) - i);
      if (revealT !== null) a = Math.min(a, clamp01(((frameNow - revealT) / 1100) * (n + 2) - i));
      return a;
    }
    /** Gerade beim Suchen erreichter Schritt (wird hervorgehoben). */
    function activeStep(): number | null {
      if (!hunt) return null;
      const t = frameNow - hunt.t0;
      let s: number | null = null;
      ROW_AT.forEach((at, i) => {
        if (t >= at) s = i;
      });
      return s;
    }

    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;

    /** Karte mit Zeilen (Überschriften, Formeln, Text); verdeckte Formeln werden zu Platzhaltern. */
    function rowsCard(R: Rect, measure: boolean, compact: boolean, k: Intro, title: string, accent: string, rows0: Row[], right?: string, extra?: { h: number; draw: (y: number) => void }): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      let rows = rows0.filter((r) => !(compact && r.extra));
      if (compact && rows.some((r) => r.kind === 'head')) {
        const out: Row[] = [];
        let pending: string | null = null;
        for (const r of rows) {
          if (r.kind === 'head') {
            pending = r.src.split(' ')[0] ?? '';
            continue;
          }
          if (pending !== null && r.kind === 'math') {
            out.push({ ...r, src: `\\c{m}{\\t{${pending}}} ${r.src}`, gap: 4, num: pending });
            pending = null;
          } else out.push({ ...r, gap: 4 });
        }
        rows = out;
      }
      const ks = kShow.v;
      const items = rows.map((r) => {
        if (r.kind === 'head') return { box: null as FormulaBox | null, lines: [r.src], font: `700 ${fs(11.5, 11)}px ${th().font}`, h: 15 };
        if (r.kind === 'text') {
          const font = `600 ${r.size ?? fs(12, 11)}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, lines, font, h: lines.length * (r.size ?? fs(12, 11)) * 1.32 };
        }
        const box = fit(r.src, maxW - 6, r.size ?? fs(13.5, 12.5), r.color ?? th().text, 600, 11);
        return { box, lines: [] as string[], font: '', h: Math.max(box.asc + box.desc, 16) };
      });
      const h = 40 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 6), 0) + (extra ? extra.h + 6 : 0) + 6;
      if (measure) return h;
      card(R, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 40;
      const act = activeStep();
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = row.step !== undefined ? rowAlpha(row.step, i, rows.length, k) : clamp01(k.stagger * (rows.length + 2) - i);
        if (y + it.h > R.y + R.h - 2) return;
        g.save();
        const ea = ease.outCubic(a);
        g.globalAlpha *= ea;
        const dx = R.x + pad + (1 - ea) * 12;
        const hlOn = (row.hl && ks > 0.5) || (act !== null && row.step === act && row.kind !== 'head');
        if (hlOn) {
          const c = row.hl ?? col.Z();
          g.fillStyle = withAlpha(c, th().dark ? 0.2 : 0.11);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
          g.fill();
        }
        if (it.box) {
          if (row.secret && ks < 0.5) {
            placeholder(dx + 6, y + it.h / 2, { align: 'left', size: 11, alpha: 1 - 2 * ks, label: row.num ? `${row.num} ?` : '?' });
          } else {
            g.save();
            if (row.secret) g.globalAlpha *= clamp01(2 * ks - 1);
            it.box.draw(g, dx + 6, y + (it.h - (it.box.asc + it.box.desc)) / 2 + it.box.asc);
            g.restore();
          }
        } else {
          g.font = it.font;
          g.fillStyle = row.kind === 'head' ? th().muted : (row.color ?? th().text);
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          const lh = row.kind === 'head' ? 15 : (row.size ?? fs(12, 11)) * 1.32;
          it.lines.forEach((ln, j) => g.fillText(ln, dx, y + lh / 2 + j * lh));
        }
        g.restore();
        y += it.h + (row.gap ?? 6);
      });
      if (extra && y + extra.h <= R.y + R.h + 1) extra.draw(y);
      return h;
    }

    /** Karte „Jetzt“: eingesetzte Zahlen und Güte im Vergleich zum Optimum. */
    function nowCard(key: ProbKey, o: Objective, x: number, k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const M = m(key);
        const qp = shownParams();
        const y = o.f(x);
        const X = N(x, 2);
        let sub = '';
        if (key === 'box') sub = `${X} · ${N(qp.a - 2 * x, 2)} · ${N(qp.b - 2 * x, 2)}`;
        else if (key === 'can') sub = `2π · ${X}² + \\f{${q(2 * qp.v)}}{${X}}`;
        else if (key === 'rect') sub = `3 · ${X} · e^{−${N(x / 2, 3)}}`;
        else if (key === 'cone') sub = `π · ${X}² · ${N(coneCylHeight({ R: qp.cr, H: qp.ch }, x), 2)}`;
        else sub = `\\f{${N(Math.hypot(20, x), 2)}}{${q(qp.v1, 1)}} + \\f{${N(Math.hypot(30, 60 - x), 2)}}{${q(qp.v2, 1)}}`;
        const rows: Row[] = [
          { src: `\\c{x}{${M.v} = ${cN(`nx-${key}`, x, 2)} ${u(U(M.ux))}}`, kind: 'math', size: fs(13, 12), gap: 2 },
          { src: say(M.vname), kind: 'text', size: 11, color: th().muted, gap: 7, extra: true },
          { src: `${M.z}(${X}) = ${sub}`, kind: 'math', size: fs(13, 12), secret: true, gap: 5, extra: true },
          { src: `\\c{z}{\\b{${M.z}(${X}) ${eq(y, M.dz)} ${cN(`ny-${key}`, y, M.dz)} ${u(U(M.uz))}}}`, kind: 'math', size: fs(14, 13), secret: true, gap: 8 },
        ];
        const ql = quality(o, x);
        const barH = 30;
        const extra = {
          h: barH,
          draw: (yy: number) => {
            const pad = fs(14, 12);
            const bx = R.x + pad;
            const bw = R.w - 2 * pad;
            const ks = kShow.v;
            g.save();
            g.fillStyle = theme.dark ? '#0f1520' : '#eef2f7';
            roundRect(g, bx, yy + 4, bw, 10, 5);
            g.fill();
            if (ks > 0.01) {
              g.globalAlpha *= ks;
              const w = bw * clamp01(cnt(`nq-${key}`, ql));
              const grad = g.createLinearGradient(bx, 0, bx + bw, 0);
              grad.addColorStop(0, mixColor(col.cut(), col.x(), 0.5));
              grad.addColorStop(0.7, col.x());
              grad.addColorStop(1, col.opt());
              g.fillStyle = grad;
              roundRect(g, bx, yy + 4, Math.max(10, w), 10, 5);
              g.fill();
              g.font = `650 11px ${theme.font}`;
              g.fillStyle = theme.muted;
              g.textAlign = 'left';
              g.textBaseline = 'middle';
              const pct = Math.round(ql * 1000) / 10;
              // Kurzform für die Karte; der ganze Satz steht in der Ergebnisliste
              const txt = o.kind === 'max' ? T2(`${N(pct, 1)} % des Maximums`, `${N(pct, 1)} % of the maximum`) : T2(`Optimum: ${N(pct, 1)} % des aktuellen Werts`, `Optimum: ${N(pct, 1)} % of the current value`);
              let fz = 11;
              while (fz > 9.5 && g.measureText(txt).width > bw) {
                fz -= 0.5;
                g.font = `650 ${fz}px ${theme.font}`;
              }
              g.fillText(txt, bx, yy + 24);
            } else {
              g.font = `650 11px ${theme.font}`;
              g.fillStyle = theme.muted;
              g.textAlign = 'left';
              g.textBaseline = 'middle';
              g.fillText(T2('Wie nah am Optimum? – verdeckt', 'How close to the optimum? – hidden'), bx, yy + 24);
            }
            g.restore();
          },
        };
        return rowsCard(R, measure, compact, k, T2('Jetzt', 'Now'), col.x(), rows, undefined, extra);
      };
    }

    /** Karte „Lösungsweg“. */
    function stepsCard(key: ProbKey, o: Objective, k: Intro): CardFn {
      return (R, measure, compact) => rowsCard(R, measure, compact, k, T2('Lösungsweg', 'Solution'), col.Z(), stepRows(key, o), `\\c{o}{\\t{${o.kind === 'max' ? T2('Maximum', 'maximum') : T2('Minimum', 'minimum')}}}`);
    }

    /** Karte „Probe“: eine Eigenschaft des Optimums, live am aktuellen Wert geprüft. */
    function checkCard(key: ProbKey, o: Objective, x: number, k: Intro): CardFn {
      return (R, measure, compact) => {
        const qp = shownParams();
        const rows: Row[] = [];
        const okC = (good: boolean) => (good ? ink(col.opt()) : th().muted);
        let title = T2('Probe', 'Check');
        if (key === 'box') {
          title = T2('Maße der Schachtel', 'Size of the box');
          rows.push({ src: `${N(qp.a - 2 * x, 2)} × ${N(qp.b - 2 * x, 2)} × \\c{x}{${N(x, 2)}} ${u('cm')}`, kind: 'math', gap: 6 });
          rows.push({ src: T2('Kleine Ecken: flache Schachtel. Große Ecken: hoch, aber schmal. Dazwischen liegt das Maximum.', 'Small corners: a flat box. Large corners: tall but narrow. The maximum lies in between.'), kind: 'text', extra: true });
        } else if (key === 'can') {
          const h = canHeight(qp.v, x);
          const rat = h / x;
          rows.push({ src: `\\f{h}{r} = \\f{${N(h, 2)}}{${N(x, 2)}} ${eq(rat, 2)} ${cN('kq', rat, 2)}`, kind: 'math', gap: 6 });
          rows.push({ src: kShow.v > 0.5 ? T2(`Im Minimum ist h = 2r: die Dose ist so hoch wie breit.${Math.abs(rat - 2) < 0.02 ? ' ✓' : ''}`, `At the minimum h = 2r: the can is as tall as it is wide.${Math.abs(rat - 2) < 0.02 ? ' ✓' : ''}`) : T2('Welches Verhältnis h : r hat die beste Dose?', 'Which ratio h : r does the best can have?'), kind: 'text', color: okC(Math.abs(rat - 2) < 0.02 && kShow.v > 0.5) });
        } else if (key === 'cone') {
          const c = { R: qp.cr, H: qp.ch };
          const share = o.f(x) / coneOwnVolume(c);
          rows.push({ src: `\\f{V_{${T2('Zyl', 'cyl')}}}{V_{${T2('Kegel', 'cone')}}} ${eq(share, 3)} ${cN('ks', share, 3)}`, kind: 'math', gap: 6 });
          rows.push({ src: kShow.v > 0.5 ? T2(`Höchstens 4/9 ≈ 0,444 des Kegels – bei r = 2R/3, h = H/3, für jeden Kegel.`, `At most 4/9 ≈ 0.444 of the cone – at r = 2R/3, h = H/3, for every cone.`) : T2('Welcher Anteil des Kegels ist höchstens möglich?', 'What is the largest possible share of the cone?'), kind: 'text', color: okC(Math.abs(share - 4 / 9) < 0.002 && kShow.v > 0.5) });
        } else if (key === 'rect') {
          const fu = 3 * Math.exp(-0.5 * x);
          rows.push({ src: `A = \\c{x}{u} · \\c{f}{f(u)} = ${N(x, 2)} · ${N(fu, 3)}`, kind: 'math', gap: 6 });
          rows.push({ src: T2('Breiter heißt niedriger: Die e-Funktion fällt. Im Optimum gleichen sich beide Effekte aus.', 'Wider means lower: the exponential decreases. At the optimum both effects balance.'), kind: 'text', extra: true });
        } else {
          const l = lifeOf();
          const [s1, s2] = lifeSines(l, x);
          title = T2('Brechungsgesetz', 'Law of refraction');
          const r1 = s1 / l.v1;
          const r2 = s2 / l.v2;
          const same = Math.abs(r1 - r2) < 0.002;
          rows.push({ src: `\\f{\\t{sin} \\c{x}{α₁}}{v₁} = \\f{${N(s1, 3)}}{${q(l.v1, 1)}} = ${cN('ls1', r1, 4)}`, kind: 'math', gap: 4 });
          rows.push({ src: `\\f{\\t{sin} \\c{t}{α₂}}{v₂} = \\f{${N(s2, 3)}}{${q(l.v2, 1)}} = ${cN('ls2', r2, 4)}`, kind: 'math', gap: 6 });
          rows.push({ src: kShow.v > 0.5 ? (same ? T2('Gleich: Das ist der schnellste Weg – wie Licht beim Übergang in Wasser. ✓', 'Equal: this is the fastest route – like light entering water. ✓') : T2('Nur im Optimum sind beide Seiten gleich (Fermat).', 'Only at the optimum are both sides equal (Fermat).')) : T2('Wann sind beide Quotienten gleich?', 'When are both quotients equal?'), kind: 'text', color: okC(same && kShow.v > 0.5) });
        }
        return rowsCard(R, measure, compact, k, title, col.fill(), rows);
      };
    }

    function drawColumn(C: Rect, key: ProbKey, o: Objective, x: number, k: Intro): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list: { id: string; fn: CardFn }[] = [
        { id: 'now', fn: nowCard(key, o, x, k) },
        { id: 'steps', fn: stepsCard(key, o, k) },
        { id: 'check', fn: checkCard(key, o, x, k) },
      ];
      const room = { x: C.x, y: C.y, w: C.w, h: C.h };
      const full = list.map((c) => c.fn(room, true, false));
      const short = list.map((c) => c.fn(room, true, true));
      const compactSet = new Set<number>();
      const total = () => list.reduce((s, _, i) => s + (compactSet.has(i) ? short[i]! : full[i]!) + gap, -gap);
      // erst die Probe kürzen bzw. weglassen, dann die übrigen kürzen
      for (const i of [0, 1, 2]) {
        if (total() <= C.h + 1) break;
        if (short[i]! < full[i]!) compactSet.add(i);
      }
      if (total() > C.h + 1) {
        list.pop();
        full.pop();
        short.pop();
        compactSet.delete(2);
      }
      const ids = new Set(list.map((c) => c.id));
      for (const id of [...cardA.keys()]) if (!ids.has(id)) cardA.delete(id);
      let y = C.y;
      list.forEach((c, i) => {
        const compact = compactSet.has(i);
        const goal = compact ? short[i]! : full[i]!;
        if (y + Math.min(goal, 60) > C.y + C.h + 1) return;
        let ch = cardH.get(c.id);
        if (!ch) {
          ch = new Chan(goal);
          cardH.set(c.id, ch);
        }
        if (ch.goal !== goal) {
          if (reduced()) ch.jump(goal);
          else ch.follow(goal, 0.12);
        }
        let ca = cardA.get(c.id);
        if (!ca) {
          ca = new Chan(intro !== null || reduced() ? 1 : 0);
          if (!reduced()) ca.glide(1, 450, 0, frameNow, ease.outCubic);
          cardA.set(c.id, ca);
        }
        const hh = Math.min(ch.v, goal + 40, C.y + C.h - y);
        const a = clamp01(k.cards * 1.6 - i * 0.22) * ca.v;
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

    /* =====================================================================
     * Ziehen: im Bild, auf dem Graphen und am Ufer
     * ===================================================================== */
    let hoverPlot: 'main' | 'der' | null = null;
    const canDrag = () => editable() && !hunt && !swap && !race;
    /** Variable aus dem Ziehen setzen (gerundet, im Definitionsbereich). */
    function dragTo(x: number, src: 'main' | 'der' | 'scene'): void {
      lastDrag = performance.now();
      hoverPlot = src === 'scene' ? null : src;
      toOpt = null;
      raceDone = false;
      const o = exactObj();
      const [lo, hi] = domainOf(o);
      const v = round2(clamp(x, lo, hi));
      if (v !== p.x) setP({ x: v });
      ctx.requestRender();
    }
    plot.addHandle({ get: () => [XS.v, shownObj(viewKey()).f(XS.v)], set: (x) => dragTo(x, 'main'), axis: 'x', enabled: canDrag, color: () => col.x() });
    plotD.addHandle({ get: () => [XS.v, 0], set: (x) => dragTo(x, 'der'), axis: 'x', enabled: () => canDrag() && p.der, color: () => col.x() });
    plotS.addHandle({ get: () => [XS.v, rectF(XS.v)], set: (x) => dragTo(x, 'scene'), axis: 'x', enabled: () => canDrag() && viewKey() === 'rect', color: () => col.x() });
    // Schachtel: gefaltet an der Höhe ziehen, flach an der Ecke des Ausschnitts
    view.addHandle({
      get: () => {
        const B = PS.b.v - 2 * XS.v;
        const L = PS.a.v - 2 * XS.v;
        return [B / 2, L / 2, XS.v];
      },
      set: (q) => dragTo(q[2], 'scene'),
      axis: [0, 0, 1],
      enabled: () => canDrag() && viewKey() === 'box' && FOLD.v > 0.6,
      color: () => col.x(),
    });
    view.addHandle({
      get: () => [PS.b.v / 2 - XS.v, PS.a.v / 2 - XS.v, 0],
      set: (q) => dragTo((PS.b.v / 2 - q[0] + (PS.a.v / 2 - q[1])) / 2, 'scene'),
      axis: [1, 1, 0],
      enabled: () => canDrag() && viewKey() === 'box' && FOLD.v < 0.4,
      color: () => col.x(),
    });
    // Dose: am oberen Rand den Radius ziehen
    view.addHandle({
      get: () => [0, XS.v, Math.min(canHeight(PS.v.v, XS.v), canCap(PS.v.v))],
      set: (q) => dragTo(q[1], 'scene'),
      axis: [0, 1, 0],
      enabled: () => canDrag() && viewKey() === 'can',
      color: () => col.x(),
    });
    // Kegel: Ecke des Zylinders läuft auf der Mantellinie
    view.addHandle({
      get: () => [0, XS.v, coneCylHeight({ R: PS.cr.v, H: PS.ch.v }, XS.v)],
      set: (q) => dragTo(q[1], 'scene'),
      axis: [0, -PS.cr.v, PS.ch.v],
      enabled: () => canDrag() && viewKey() === 'cone',
      color: () => col.x(),
    });

    /** Rettungsschwimmer: Eintrittspunkt am Ufer ziehen. */
    function shoreHit(px: number, py: number, touch: boolean): boolean {
      if (viewKey() !== 'life') return false;
      const P = picRect(regions().scene);
      const G = lifeGeom(P);
      const [ex, ey] = G.E(XS.v);
      if (Math.hypot(px - ex, py - ey) < (touch ? 26 : 16)) return true;
      return Math.abs(py - G.shore) < (touch ? 14 : 9) && px >= G.X0 - 8 && px <= G.X0 + LIFE_GEOM.d * G.sc + 8;
    }
    function shoreX(px: number): number {
      const G = lifeGeom(picRect(regions().scene));
      return (px - G.X0) / G.sc;
    }
    const shoreTarget: Target = {
      contains: (px: number, py: number) => shoreHit(px, py, false),
      pointerDown: (q: Ptr) => {
        if (!canDrag() || !shoreHit(q.px, q.py, q.type === 'touch')) return false;
        drag = 'shore';
        surface.setCursor('ew-resize');
        dragTo(shoreX(q.px), 'scene');
        return true;
      },
      pointerMove: (q: Ptr) => {
        if (drag !== 'shore') return;
        dragTo(shoreX(q.px), 'scene');
      },
      pointerUp: (q: Ptr) => {
        drag = null;
        lastDrag = performance.now();
        hoverShore = shoreHit(q.px, q.py, false);
        surface.setCursor(hoverShore && canDrag() ? 'ew-resize' : '');
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const h = !!q && shoreHit(q.px, q.py, false);
        if (h !== hoverShore) {
          hoverShore = h;
          ctx.requestRender();
        }
        surface.setCursor(h && canDrag() ? 'ew-resize' : '');
      },
      wheel: () => false,
    };
    surface.addTarget(shoreTarget);

    /* =====================================================================
     * Ergebnisse unter der Bühne
     * ===================================================================== */
    function updateReadouts(): void {
      const key = probKey();
      const o = exactObj();
      const M = META[key];
      const x = xEff();
      const v = (s: string) => `<var>${s}</var>`;
      const y = o.f(x);
      const ql = quality(o, x);
      const pct = N(Math.round(ql * 1000) / 10, 1);
      ctx.readout('cur', { html: `${v(M.z)}(${N(x, 2)}) ${eq(y, M.dz)} <strong>${N(y, M.dz)} ${U(M.uz)}</strong> · ${o.kind === 'max' ? T2(`${pct} % des Maximums`, `${pct} % of the maximum`) : T2(`Das Optimum beträgt ${pct} % des aktuellen Werts.`, `The optimum is ${pct} % of the current value.`)}` });
      const yo = o.f(o.opt);
      const kind = o.kind === 'max' ? T2('Maximum', 'maximum') : T2('Minimum', 'minimum');
      let more = '';
      if (key === 'box') more = ` · ${N(p.a - 2 * o.opt, 2)} × ${N(p.b - 2 * o.opt, 2)} × ${N(o.opt, 2)} cm`;
      else if (key === 'can') more = ` · ${v('h')} ${eq(canHeight(p.v, o.opt))} ${N(canHeight(p.v, o.opt), 2)} cm = 2${v('r')}`;
      else if (key === 'cone') more = ` · ${v('h')} ${eq(p.ch / 3)} ${N(p.ch / 3, 2)} cm`;
      ctx.readout('opt', { html: `${v(M.v)} ${eq(o.opt)} ${N(o.opt, 2)} ${U(M.ux)}: ${v(M.z)} ${eq(yo, M.dz)} <strong>${N(yo, M.dz)} ${U(M.uz)}</strong> (${kind})${more}` });
    }

    /* =====================================================================
     * Bereiche der Diagramme
     * ===================================================================== */
    function rangesOf(o: Objective): { y0: number; y1: number; d0: number; d1: number } {
      const [lo, hi] = domainOf(o);
      let yMin = Infinity;
      let yMax = -Infinity;
      const K = 160;
      for (let i = 0; i <= K; i++) {
        const v = o.f(lerp(lo, hi, i / K));
        yMin = Math.min(yMin, v);
        yMax = Math.max(yMax, v);
      }
      let y0 = 0;
      let y1 = yMax * 1.16;
      if (o.key === 'can') y1 = Math.min(yMax, yMin * 2.6) * 1.08;
      if (o.key === 'life') {
        const span = yMax - yMin;
        y0 = Math.max(0, yMin - span * 0.35);
        y1 = yMax + span * 0.14;
      }
      // Ableitung: robust (große Werte am Rand abschneiden)
      const ds: number[] = [];
      for (let i = 0; i <= K; i++) ds.push(o.d1(lerp(lo, hi, i / K)));
      const mags = ds.map(Math.abs).sort((a, b) => a - b);
      const cap = (mags[Math.floor(mags.length * 0.85)] ?? 1) * 1.25 || 1;
      const dLo = Math.max(Math.min(...ds), -cap);
      const dHi = Math.min(Math.max(...ds), cap);
      const span = Math.max(dHi - dLo, 1e-9);
      return { y0, y1, d0: Math.min(dLo, 0) - span * 0.12, d1: Math.max(dHi, 0) + span * 0.12 };
    }
    function retargetRanges(now: number, mode: 'jump' | 'follow' | 'glide'): void {
      const R = rangesOf(exactObj());
      for (const [c, goal] of [
        [rng.y0, R.y0],
        [rng.y1, R.y1],
        [rng.d0, R.d0],
        [rng.d1, R.d1],
      ] as [Chan, number][]) {
        if (mode === 'jump' || reduced()) c.jump(goal);
        else if (mode === 'follow') c.follow(goal, 0.18);
        else if (Math.abs(c.goal - goal) > 1e-9) c.glide(goal, 750, 0, now);
      }
    }

    function setLabels(): void {
      ctx.setAction('hunt', { enabled: editable() && !hunt, label: hunt ? T2('Optimum wird gesucht …', 'Searching …') : T2('Optimum suchen', 'Find the optimum') });
      ctx.setAction('opt', { enabled: editable() && !hunt });
      ctx.setAction('fold', { enabled: editable() && !hunt, label: p.flat ? T2('Falten', 'Fold') : T2('Neu falten', 'Fold again') });
      ctx.setAction('race', { enabled: editable() && !hunt && !race });
      ctx.setAction('reveal', { enabled: editable() });
    }

    /* =====================================================================
     * Rendern
     * ===================================================================== */
    function flipSwap(now: number): void {
      if (!swap) return;
      swap.flipped = true;
      XS.jump(xEff());
      retargetRanges(now, 'jump');
      const iv = INITIAL_VIEW[probKey()];
      view.setInitialView(iv);
      view.setCamera(iv);
      for (const e of nums.values()) e.c.jump(e.c.goal);
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      let anim = false;
      if (swap) {
        const s = (now - swap.t0) / swap.dur;
        if (s >= 0.5 && !swap.flipped) flipSwap(now);
        if (s >= 1) {
          swap = null;
          swapK = 1;
        } else {
          swapK = clamp01(s);
          anim = true;
        }
      }
      // „Optimum suchen“: die Variable folgt dem Ablauf
      const oNow = shownObj(viewKey());
      let H = hunt ? huntNow(oNow, now) : null;
      if (hunt && H) {
        XS.jump(H.x);
        if (H.t >= HUNT.glow && glowT === null) glowT = now;
        if (H.t >= HUNT.done) {
          hunt = null;
          H = null;
          setP({ x: round2(exactObj().opt) });
          XS.jump(exactObj().opt);
          setLabels();
        }
        anim = true;
      }
      for (const c of chans()) if (c.step(now, dt)) anim = true;
      if (foldSeq && now >= foldSeq.t1) {
        foldSeq = null;
        FOLD.glide(1, 2300, 0, now, ease.linear);
      }
      if (toOpt && now >= toOpt.t1) {
        toOpt = null;
        glowT = now;
      }
      if (race && (now - race.t0) / race.scale > Math.max(...race.runners.map((r) => r.T)) + 0.05) {
        lastRunners = race.runners;
        race = null;
        raceDone = true;
        setLabels();
      }
      if (glowT !== null && now - glowT > 1500) glowT = null;
      if (revealT !== null && now - revealT > 1800) revealT = null;
      if (intro !== null || hunt || foldSeq || toOpt || race || glowT !== null || revealT !== null || dragging()) anim = true;
      if (!dragging()) hoverPlot = null;
      const k = introState(now);
      const key = viewKey();
      const o = shownObj(key);
      const x = swap && !swap.flipped ? swap.fromX : clamp(XS.v, o.lo, o.hi);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      // Wechsel: erst ausblenden, dann einblenden
      const sw = swap ? (swapK < 0.5 ? 1 - ease.inOutCubic(swapK * 2) : ease.inOutCubic(swapK * 2 - 1)) : 1;
      const lift = swap ? (1 - sw) * 10 : 0;
      // Bild
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      card(R.scene);
      g.save();
      g.globalAlpha *= sw;
      g.translate(0, lift);
      const P = picRect(R.scene);
      sceneBackdrop(P, key);
      if (key === 'box') drawBox(P, x, k);
      else if (key === 'can') drawCan(P, x, k);
      else if (key === 'cone') drawCone(P, x, k);
      else if (key === 'rect') drawRect(x, k);
      else drawLife(P, x, o, k);
      sceneLabels(P, key, o, x, k);
      g.restore();
      // Diagramme
      g.save();
      g.globalAlpha *= sw;
      drawGraph(key, o, x, k, H, now);
      drawDeriv(key, o, x, k, H);
      drawLink(o, x, k);
      g.restore();
      g.restore();
      // Karten
      g.save();
      g.globalAlpha *= sw;
      drawColumn(R.col, key, o, x, k);
      g.restore();
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* =====================================================================
     * Aktionen und Übergänge
     * ===================================================================== */
    let prevKey: ProbKey = probKey();

    function startHunt(now: number): void {
      if (reduced()) {
        setP({ x: round2(exactObj().opt) });
        XS.jump(exactObj().opt);
        return;
      }
      race = null;
      raceDone = false;
      toOpt = null;
      hunt = { t0: now, x0: XS.v };
      glowT = null;
      for (const c of cardA.values()) c.jump(1);
    }

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init' || reduced();
        if (changed.has('prob') && source === 'input') setP({ x: START[probKey()] });
        const userish = source === 'input' || source === 'replace';
        if (userish && [...changed].some((c) => c !== 'show' && c !== 'der')) {
          if (hunt) hunt = null;
          race = null;
          raceDone = false;
          toOpt = null;
        }
        // Wechsel des Problems
        if (changed.has('prob') && source !== 'init' && probKey() !== prevKey) {
          if (!reduced()) {
            swap = { from: prevKey, fromX: XS.v, t0: now, dur: 900, flipped: false };
            swapK = 0;
          } else {
            swap = { from: prevKey, fromX: XS.v, t0: now, dur: 0, flipped: false };
            flipSwap(now);
            swap = null;
          }
          glowT = null;
        }
        // Daten weich nachführen
        for (const key of PARAM_KEYS) {
          const v = p[key] as number;
          const c = PS[key];
          if (instant) c.jump(v);
          else if (c.goal === v) continue;
          else if (source === 'replace') c.glide(v, 800, 0, now);
          else c.follow(v, 0.12);
        }
        // Variable
        if (!hunt && !(swap && !swap.flipped)) {
          const goal = xEff();
          if (instant) XS.jump(goal);
          else if (toOpt) {
            /* gleitet schon */
          } else if (dragging()) XS.follow(goal, 0.03);
          else if (source === 'replace') XS.glide(goal, 900, 100, now);
          else XS.follow(goal, 0.14);
        }
        if (changed.has('flat')) {
          foldSeq = null;
          if (instant) FOLD.jump(p.flat ? 0 : 1);
          else FOLD.glide(p.flat ? 0 : 1, p.flat ? 1200 : 2300, 0, now, p.flat ? ease.inOutCubic : ease.linear);
        }
        if (changed.has('der')) {
          if (instant) kDer.jump(p.der ? 1 : 0);
          else kDer.glide(p.der ? 1 : 0, 500, 0, now);
        }
        if (changed.has('show')) {
          if (instant) kShow.jump(p.show ? 1 : 0);
          else kShow.glide(p.show ? 1 : 0, 750, 0, now);
          if (p.show && source !== 'init' && !reduced()) {
            revealT = now;
            glowT = now + 500;
          }
        }
        if (!(swap && !swap.flipped)) retargetRanges(now, instant ? 'jump' : dragging() ? 'follow' : 'glide');
        if (source === 'init' && !reduced()) {
          intro = now;
          // Einstieg: der Karton faltet sich zur Schachtel
          if (probKey() === 'box' && !p.flat) {
            FOLD.jump(0);
            FOLD.glide(1, 2300, 500, now, ease.linear);
          }
        }
        prevKey = probKey();
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'hunt') startHunt(now);
        else if (id === 'opt') {
          hunt = null;
          race = null;
          raceDone = false;
          const xo = exactObj().opt;
          setP({ x: round2(xo) });
          if (reduced()) XS.jump(xo);
          else {
            XS.glide(xo, 1300, 0, now);
            toOpt = { t1: now + 1300 };
          }
        } else if (id === 'fold') {
          if (probKey() !== 'box') return;
          if (p.flat) setP({ flat: false });
          else if (reduced()) FOLD.jump(1);
          else {
            FOLD.glide(0, 800, 0, now);
            foldSeq = { t1: now + 950 };
          }
        } else if (id === 'race') {
          if (probKey() !== 'life') return;
          const l: Life = { ...LIFE_GEOM, v1: p.v1, v2: p.v2 };
          const o = exactObj();
          const runners: { x: number; T: number; color: () => string; name: Txt }[] = [
            { x: lifeStraight(l), T: lifeTime(l, lifeStraight(l)), color: () => th().muted, name: L('Gerade Linie', 'Straight line') },
            { x: xEff(), T: lifeTime(l, xEff()), color: () => col.x(), name: L('Dein Weg', 'Your route') },
          ];
          if (p.show) runners.push({ x: o.opt, T: lifeTime(l, o.opt), color: () => col.opt(), name: L('Schnellster Weg', 'Fastest route') });
          const maxT = Math.max(...runners.map((r) => r.T));
          const dur = reduced() ? 1 : clamp(maxT * 230, 3500, 9000);
          race = { t0: now, dur, scale: dur / maxT, runners };
          raceDone = false;
        } else if (id === 'reveal') setP({ show: true });
        setLabels();
        ctx.requestRender();
      },
      render,
      resetView: () => view.resetView(true),
      destroy: () => surface.destroy(),
    };
  },
});
