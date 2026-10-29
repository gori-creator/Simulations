import { defineSimulation, ease, lightIntensity, mixColor, Plot, prefersReducedMotion, roundRect, Surface, vec3, View3D, type Rect, type Vec2, type Vec3 } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  criticalPoints,
  crossSection,
  discs,
  discSum,
  domainOf,
  effectiveInterval,
  fValue,
  hornLimit,
  knownSolid,
  piForm,
  radiusAt,
  startInterval,
  volume,
  type Disc,
  type DiscKind,
  type FnId,
  type FnParams,
  type KnownSolid,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;
/** Reglerwert für „unendlich viele Scheiben“ (glatter Körper). */
const N_INF = 65;
const nOf = (v: number) => (v >= N_INF ? Infinity : v);
/** Feinheit der Zeichnung des glatten Körpers (Stücke entlang der Achse). */
const FINE: Record<FnId, number> = { zyl: 4, kegel: 6, stumpf: 6, kugel: 48, para: 48, sin: 48, horn: 64 };
/** Winkelschritte für den vollen Umlauf. */
const SEG = 64;
const DPHI = TAU / SEG;

interface CardLine {
  f: string;
  swatch?: string;
  bold?: boolean;
  muted?: boolean;
}

/** Wert, der seinem Ziel weich (exponentiell) folgt – für Zahlen, Lage, Kamera. */
class Follow {
  constructor(public v: number) {}
  step(target: number, dt: number, tau: number): boolean {
    if (tau <= 0 || !Number.isFinite(this.v) || !Number.isFinite(target)) {
      this.v = target;
      return false;
    }
    this.v += (target - this.v) * (1 - Math.exp(-dt / tau));
    if (Math.abs(target - this.v) <= 1e-4 * (1 + Math.abs(target))) {
      this.v = target;
      return false;
    }
    return true;
  }
}

/** Aktuelle Form: Funktion, Intervall, Scheiben (oder glatt). */
interface Shape {
  fn: FnId;
  fp: FnParams;
  a: number;
  b: number;
  n: number;
  list: Disc[] | null;
}

/** Ein Stück des Körpers zwischen zwei Stellen (Kegelstumpf, bei Scheiben Zylinder). */
interface Seg {
  s0: number;
  s1: number;
  x0: number;
  x1: number;
  r0: number;
  r1: number;
  /** Verschiebung durch das Auseinanderziehen der Scheiben */
  sep: number;
  /** Nummer der Scheibe (−1: glatter Körper) */
  disc: number;
  /** Anteil der Scheibenfärbung (0 … 1, wächst beim Übergang) */
  shadeK: number;
  /** Deckflächen links/rechts: 0 keine, 1 Körper, 2 Querschnitt */
  capL: 0 | 1 | 2;
  capR: 0 | 1 | 2;
  /** Breitenkreis am linken Rand zeichnen */
  ring: boolean;
}

/** Abgetastete Form (für weiche Übergänge von der gezeigten zur neuen Form). */
interface Profile {
  a: number;
  b: number;
  segs: { s0: number; s1: number; r0: number; r1: number; sep: number }[];
}

interface Morph {
  prev: Profile;
  t0: number;
  dur: number;
  /** Verzögerung vom linken bis zum rechten Ende (ms) */
  spread: number;
}

/**
 * Rotationskörper: Die Fläche unter dem Graphen von f auf [a; b] dreht sich
 * um die x-Achse und überstreicht den Körper. Scheibenmethode mit n Zylindern
 * (Σ π rᵢ² Δx) und Querschnitt A(x) = π f(x)² führen zu V = π ∫ₐᵇ f(x)² dx;
 * daneben die Seitenansicht mit Graph und Rechtecken, Kontrolle über die
 * bekannten Körperformeln.
 */
export default defineSimulation({
  id: 'rotationskoerper',
  dragHint: true,
  hint: { de: 'Tipp: Zieh die Grenzen oder den Schnitt, oder dreh den Körper mit einem Finger.', en: 'Tip: Drag the limits or the cut, or rotate the solid with one finger.' },
  layout: { aspect: 1.6, aspectNarrow: 0.5 },
  groups: [
    { id: 'shape', label: L('Funktion', 'Function') },
    { id: 'disc', label: L('Scheibenmethode', 'Disc method') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion (Körper)', 'Function (solid)'),
      options: [
        { value: 'zyl', label: L('f(x) = r (Zylinder)', 'f(x) = r (cylinder)') },
        { value: 'kegel', label: L('f(x) = m·x (Kegel)', 'f(x) = m·x (cone)') },
        { value: 'stumpf', label: L('f(x) = m·x + c (Kegelstumpf)', 'f(x) = m·x + c (frustum)') },
        { value: 'kugel', label: L('f(x) = √(r² − x²) (Kugel)', 'f(x) = √(r² − x²) (sphere)') },
        { value: 'para', label: L('f(x) = k·√x (Paraboloid)', 'f(x) = k·√x (paraboloid)') },
        { value: 'sin', label: L('f(x) = k·sin x (Spindel)', 'f(x) = k·sin x (spindle)') },
        { value: 'horn', label: L('f(x) = k : x (Gabriels Horn)', 'f(x) = k / x (Gabriel’s horn)') },
      ],
      default: 'kugel',
    },
    { key: 'r', type: 'number', group: 'shape', label: L('Radius r', 'Radius r'), min: 0.5, max: 4, step: 0.25, default: 2, help: L('Auch am grünen Griff in der Seitenansicht ziehen.', 'You can also drag the green handle in the side view.'), visibleIf: (v) => v.fn === 'zyl' || v.fn === 'kugel' },
    { key: 'm', type: 'number', group: 'shape', label: L('Steigung m', 'Slope m'), min: -1, max: 1.5, step: 0.05, default: 0.5, help: L('Auch am grünen Griff in der Seitenansicht ziehen.', 'You can also drag the green handle in the side view.'), visibleIf: (v) => v.fn === 'kegel' || v.fn === 'stumpf' },
    { key: 'c', type: 'number', group: 'shape', label: L('y-Achsenabschnitt c', 'y-intercept c'), min: -2, max: 3, step: 0.25, default: 1, visibleIf: (v) => v.fn === 'stumpf' },
    { key: 'k', type: 'number', group: 'shape', label: L('Faktor k', 'Factor k'), min: 0.25, max: 3, step: 0.05, default: 1, help: L('Auch am grünen Griff in der Seitenansicht ziehen.', 'You can also drag the green handle in the side view.'), visibleIf: (v) => v.fn === 'para' || v.fn === 'sin' || v.fn === 'horn' },
    {
      key: 'a',
      type: 'number',
      group: 'shape',
      label: L('Untere Grenze a', 'Lower limit a'),
      help: L('Wird in den Definitionsbereich geschoben (z. B. bei sin x höchstens π, bei der Kugel zwischen −r und r).', 'Kept inside the domain (e.g. at most π for sin x, between −r and r for the sphere).'),
      min: -4,
      max: 10,
      step: 0.05,
      default: -2,
    },
    { key: 'b', type: 'number', group: 'shape', label: L('Obere Grenze b', 'Upper limit b'), min: -4, max: 10, step: 0.05, default: 2 },
    {
      key: 'phi',
      type: 'number',
      label: L('Drehwinkel φ', 'Angle of rotation φ'),
      help: L('Wie weit sich die Fläche schon um die x-Achse gedreht hat.', 'How far the region has already turned about the x-axis.'),
      min: 0,
      max: 360,
      step: 5,
      default: 360,
      unit: '°',
    },
    {
      key: 'n',
      type: 'number',
      group: 'disc',
      label: L('Anzahl der Scheiben n', 'Number of discs n'),
      help: L('Ganz rechts: unendlich viele, unendlich dünne Scheiben (glatter Körper).', 'Far right: infinitely many, infinitely thin discs (smooth solid).'),
      min: 1,
      max: N_INF,
      step: 1,
      default: N_INF,
      display: (v, lang) => (v >= N_INF ? (lang === 'de' ? '∞ (glatt)' : '∞ (smooth)') : String(v)),
    },
    {
      key: 'pt',
      type: 'choice',
      group: 'disc',
      label: L('Radius der Scheiben', 'Radius of the discs'),
      options: [
        { value: 'mid', label: L('f(Mitte)', 'f(midpoint)') },
        { value: 'lower', label: L('kleinster Radius (innen)', 'smallest radius (inside)') },
        { value: 'upper', label: L('größter Radius (außen)', 'largest radius (outside)') },
      ],
      default: 'mid',
      visibleIf: (v) => Number(v.n) < N_INF,
    },
    { key: 'sep', type: 'boolean', group: 'disc', label: L('Scheiben auseinanderziehen', 'Pull the discs apart'), default: false, visibleIf: (v) => Number(v.n) < N_INF },
    { key: 'sec', type: 'boolean', group: 'view', label: L('Querschnitt zeigen', 'Show cross-section'), help: L('Schneidet den Körper an der Stelle x auf: Kreis mit A(x) = π · f(x)².', 'Cuts the solid open at x: a circle with A(x) = π · f(x)².'), default: true },
    { key: 'xs', type: 'number', group: 'view', label: L('Stelle des Querschnitts x', 'Position of the cross-section x'), help: L('Auch am orangen Griff ziehen.', 'You can also drag the orange handle.'), min: -4, max: 10, step: 0.05, default: 0.8, visibleIf: (v) => v.sec === true },
    { key: 'vals', type: 'boolean', group: 'view', label: L('Werte im Bild', 'Values in the picture'), help: L('Zahlenwerte von Volumen, Querschnitt und Scheibensumme im Bild zeigen.', 'Show the values of volume, cross-section and disc sum in the picture.'), default: true },
  ],
  actions: [
    { id: 'spin', label: L('Rotieren lassen', 'Rotate'), primary: true },
    { id: 'disc', label: L('In Scheiben zerlegen', 'Cut into discs') },
    { id: 'double', label: L('n verdoppeln', 'Double n'), visibleIf: (v) => Number(v.n) < N_INF },
  ],
  readouts: [
    { key: 'f', label: L('Funktion und Körper', 'Function and solid') },
    { key: 'A', label: L('Querschnitt an der Stelle x', 'Cross-section at x'), spoiler: true },
    { key: 'V', label: L('Volumen (Integral)', 'Volume (integral)'), spoiler: true },
    { key: 'S', label: L('Scheibensumme', 'Sum of discs'), spoiler: true },
    { key: 'K', label: L('Kontrolle mit der Körperformel', 'Check with the formula for the solid'), spoiler: true },
  ],
  resultsParam: 'vals',
  presets: [
    { id: 'start', label: L('Kugel aus dem Halbkreis', 'Sphere from a semicircle'), values: {} },
    { id: 'cone', label: L('Kegel aus einer Ursprungsgeraden', 'Cone from a line through the origin'), values: { fn: 'kegel', m: 0.5, a: 0, b: 4, xs: 2.5 } },
    { id: 'frustum', label: L('Kegelstumpf', 'Frustum of a cone'), values: { fn: 'stumpf', m: 0.5, c: 1, a: 0, b: 4, xs: 2 } },
    { id: 'discs', label: L('Paraboloid aus 8 Scheiben', 'Paraboloid from 8 discs'), values: { fn: 'para', k: 1, a: 0, b: 4, n: 8, sep: true, xs: 2.5 } },
    { id: 'spindle', label: L('Sinusbogen: Spindel', 'Sine arch: spindle'), values: { fn: 'sin', k: 1, a: 0, b: 3.15, xs: 1.2 } },
    { id: 'horn', label: L('Gabriels Horn', 'Gabriel’s horn'), values: { fn: 'horn', k: 1, a: 1, b: 10, xs: 2, n: 16, pt: 'upper' } },
  ],
  strings: {
    de: {
      canvas: 'Drehbare 3D-Ansicht eines Rotationskörpers: Die Fläche unter dem Graphen von f dreht sich um die x-Achse; wahlweise in Zylinderscheiben zerlegt und an einer Stelle aufgeschnitten. Daneben Formeln und die Seitenansicht mit Graph und Rechtecken.',
      title: 'Rotationskörper: {name}',
      cardTitle: 'Volumen',
      side: 'Seitenansicht',
      rects: 'Rechtecke = Scheiben',
      zylinder: 'Zylinder',
      kegel: 'Kegel',
      kegelstumpf: 'Kegelstumpf',
      doppelkegel: 'Doppelkegel',
      kugel: 'Kugel',
      kugelabschnitt: 'Kugelabschnitt',
      kugelschicht: 'Kugelschicht',
      paraboloid: 'Rotationsparaboloid',
      paraboloidstumpf: 'Paraboloidstumpf',
      spindel: 'Spindel',
      horn: 'Gabriels Horn (Ausschnitt)',
      noFormula: 'keine Körperformel – nur mit dem Integral',
      check: 'Formel',
      angle: 'φ = {v}°',
      smooth: 'n → ∞: Scheibensumme → Integral',
      disc: 'In Scheiben zerlegen',
      smoothen: 'Glatter Körper',
    },
    en: {
      canvas: 'Rotatable 3D view of a solid of revolution: the region under the graph of f turns about the x-axis; optionally cut into cylindrical discs and cut open at one position. Next to it formulas and the side view with graph and rectangles.',
      title: 'Solid of revolution: {name}',
      cardTitle: 'Volume',
      side: 'Side view',
      rects: 'rectangles = discs',
      zylinder: 'cylinder',
      kegel: 'cone',
      kegelstumpf: 'frustum',
      doppelkegel: 'double cone',
      kugel: 'sphere',
      kugelabschnitt: 'spherical cap',
      kugelschicht: 'spherical segment',
      paraboloid: 'paraboloid',
      paraboloidstumpf: 'paraboloid frustum',
      spindel: 'spindle',
      horn: 'Gabriel’s horn (part)',
      noFormula: 'no formula for the solid – only the integral',
      check: 'Formula',
      angle: 'φ = {v}°',
      smooth: 'n → ∞: sum of discs → integral',
      disc: 'Cut into discs',
      smoothen: 'Smooth solid',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (all, k: string) => (k in vars ? String(vars[k]) : all));
    const num = (v: number, d = 2) => fmt.num(v, d);
    const reduced = () => prefersReducedMotion();
    const th = () => ctx.theme;

    /* ---------- Aufteilung der Zeichenfläche ---------- */

    const narrow = () => surface.width < 640 && surface.height > surface.width * 0.9;
    function rects(): { scene: Rect; card: Rect; chart: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (narrow()) {
        const topH = Math.round(h * 0.44);
        const cardH = Math.round(h * 0.3);
        return {
          scene: { x: 0, y: 0, w, h: topH },
          card: { x: 4, y: topH + 4, w: w - 8, h: cardH },
          chart: { x: 4, y: topH + cardH + 12, w: w - 8, h: h - topH - cardH - 16 },
        };
      }
      const colW = Math.round(Math.min(340, Math.max(214, w * 0.34)));
      const x = w - colW;
      const chartH = Math.round(Math.max(150, h * 0.42));
      return {
        scene: { x: 0, y: 0, w: x - 4, h },
        card: { x, y: 8, w: colW - 8, h: h - chartH - 24 },
        chart: { x, y: h - chartH - 8, w: colW - 8, h: chartH },
      };
    }
    const textSize = () => {
      const w = surface.width;
      return narrow() ? 12 : w < 700 ? 11.5 : w < 860 ? 12.5 : 13.5;
    };

    const VIEW0 = { azimuth: 30, elevation: 21 };
    const view = new View3D(surface, { ...VIEW0, elevationLimits: [-30, 75], region: () => rects().scene });
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: () => chartPlotRect(),
      xAxis: { label: 'x' },
      yAxis: { label: 'y' },
    });
    function chartPlotRect(): Rect {
      const c = rects().chart;
      return { x: c.x + 4, y: c.y + 30, w: c.w - 10, h: c.h - 36 };
    }

    /* ---------- Zustand ---------- */

    const fparams = (): FnParams => ({ r: p.r, m: p.m, c: p.c, k: p.k });
    function makeShape(): Shape {
      const fn = p.fn as FnId;
      const fp = fparams();
      const [a, b] = effectiveInterval(fn, fp, p.a, p.b);
      const n = nOf(p.n);
      return { fn, fp, a, b, n, list: Number.isFinite(n) ? discs(fn, fp, a, b, n, p.pt as DiscKind) : null };
    }
    let shape = makeShape();
    let morph: Morph | null = null;
    /** Drehung der Fläche: Zeitplan (Rotieren lassen, Einstieg). */
    let spin: { t0: number; from: number; to: number; dur: number } | null = null;
    /** Einblenden der Fläche beim Einstieg (0 … 1). */
    let intro: { t0: number } | null = null;
    let sepT = p.sep && shape.list ? 1 : 0;
    let lastTime = performance.now();
    let lastHandle = -Infinity;
    let lastR = p.r;
    let segsCache: Seg[] = [];
    let frame: { target: Vec3; radius: number; R: number } | null = null;

    const phiF = new Follow(p.phi);
    const xsF = new Follow(p.xs);
    const cutF = new Follow(p.sec ? 1 : 0);
    const nums = { V: new Follow(0), S: new Follow(0), A: new Follow(0) };

    const editable = () => !ctx.locked;
    const xsEff = () => Math.max(shape.a, Math.min(shape.b, p.xs));
    const grab = () => {
      lastHandle = performance.now();
    };

    /* ---------- Farben ---------- */

    const C = () => {
      const s = th().series;
      return { body: s[0]!, area: s[2]!, sec: s[3]!, lim: s[4]! };
    };
    const tint = (c: string) => (th().dark ? mixColor(c, '#0b1220', 0.1) : mixColor(c, '#ffffff', 0.12));
    const edgeOf = (c: string, k = 1) => mixColor(c, '#05080f', (th().dark ? 0.5 : 0.42) * k);
    const pillBg = () => (th().dark ? 'rgba(15,20,30,0.86)' : 'rgba(255,255,255,0.9)');

    /** Beleuchtete Farbe (Lambert plus weicher Glanzpunkt) für die Normale n in Weltkoordinaten. */
    function lit(base: string, n: Vec3, gloss = 0.3): string {
      const i = lightIntensity(view.camera.dirToView(n));
      const pivot = 0.74;
      let c = i >= pivot ? mixColor(base, '#ffffff', ((i - pivot) / (1 - pivot)) * 0.26) : mixColor(base, '#000000', ((pivot - i) / (pivot - 0.45)) * 0.34);
      const nl = (i - 0.45) / 0.55;
      if (gloss > 0 && nl > 0.86) c = mixColor(c, '#ffffff', Math.min(0.5, ((nl - 0.86) / 0.14) ** 2.2 * gloss));
      return c;
    }

    /* ---------- Formeln ---------- */

    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight });
    function fitFormula(src: string, maxW: number, size: number, color: string, weight: number): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }

    const N = (v: number, d = 2) => num(v, d);
    // Quadrate wie m² oder k² brauchen 4 Stellen (Schrittweite 0,05 → 0,05² = 0,0025)
    const coef = (v: number, d = 3) => (Math.abs(v - 1) < 1e-9 ? '' : Math.abs(v + 1) < 1e-9 ? '−' : N(v, d));
    /** Funktionsterm in der Formel-Kurzschrift. */
    function fTerm(s: Shape): string {
      const { r, m, c, k } = s.fp;
      switch (s.fn) {
        case 'zyl':
          return N(r);
        case 'kegel':
          return Math.abs(m) < 1e-9 ? '0' : `${coef(m)}x`;
        case 'stumpf': {
          if (Math.abs(m) < 1e-9) return N(c);
          const lin = `${coef(m)}x`;
          return Math.abs(c) < 1e-9 ? lin : `${lin} ${c < 0 ? '−' : '+'} ${N(Math.abs(c))}`;
        }
        case 'kugel':
          return `\\r{${N(r * r, 4)} − x²}`;
        case 'para':
          return `${coef(k)}\\r{x}`;
        case 'sin':
          return `${coef(k)}${Math.abs(k - 1) < 1e-9 ? '' : ' '}sin x`;
        case 'horn':
          return `\\f{${N(k)}}{x}`;
      }
    }
    /** Term von (f(x))². */
    function f2Term(s: Shape): string {
      const { r, m, c, k } = s.fp;
      switch (s.fn) {
        case 'zyl':
          return N(r * r, 4);
        case 'kegel':
          return Math.abs(m) < 1e-9 ? '0' : `${coef(m * m, 4)}x²`;
        case 'stumpf':
          return Math.abs(m) < 1e-9 ? N(c * c, 4) : `(${fTerm(s)})²`;
        case 'kugel':
          return `${N(r * r, 4)} − x²`;
        case 'para':
          return `${coef(k * k, 4)}x`;
        case 'sin':
          return `${coef(k * k, 4)}${Math.abs(k * k - 1) < 1e-9 ? '' : ' '}sin²x`;
        case 'horn':
          return `\\f{${N(k * k, 4)}}{x²}`;
      }
    }
    /** (f(x))² als Integrand: Summen in Klammern, sonst ohne. */
    function f2Wrapped(s: Shape): string {
      const t = f2Term(s);
      return /^\(.*\)²$/.test(t) || !/ [+−] /.test(t) ? `${t} ` : `(${t}) `;
    }
    /** Grenze als Text (π, π/2 erkennen). */
    const limText = (x: number) => (Math.abs(x - Math.PI) < 1e-9 ? 'π' : Math.abs(x - Math.PI / 2) < 1e-9 ? '\\f{π}{2}' : N(x));
    /** Exakter Wert als Bruch mal π (bzw. π²), sonst null. */
    function exactText(v: number): string | null {
      const f = piForm(v);
      if (!f) return null;
      if (f.num === 0) return '0';
      const pi = f.pow === 2 ? 'π²' : 'π';
      const sign = f.num < 0 ? '−' : '';
      const a = Math.abs(f.num);
      if (f.den === 1) return `${sign}${a === 1 ? '' : a}${pi}`;
      return `${sign}\\f{${a}}{${f.den}}${pi}`;
    }

    /** Kurzschrift in HTML für die Ergebnisliste umsetzen. */
    function toHtml(src: string): string {
      let i = 0;
      const group = (): string => {
        if (src[i] !== '{') return esc(src[i++] ?? '');
        i++;
        const out = seq('}');
        i++;
        return out;
      };
      const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const seq = (end?: string): string => {
        let out = '';
        let buf = '';
        const flush = () => {
          out += [...buf].map((ch, k, arr) => (/\p{L}/u.test(ch) && ch !== 'π' && !/\p{L}/u.test(arr[k - 1] ?? '') && !/\p{L}/u.test(arr[k + 1] ?? '') ? `<var>${esc(ch)}</var>` : esc(ch))).join('');
          buf = '';
        };
        while (i < src.length && src[i] !== end) {
          const ch = src[i]!;
          if (ch === '\\' && 'frcbti'.includes(src[i + 1] ?? '')) {
            const cmd = src[i + 1]!;
            i += 2;
            flush();
            if (cmd === 'f') {
              const a = group();
              out += `<span class="frac"><span>${a}</span><span>${group()}</span></span>`;
            } else if (cmd === 'r') out += `√(${group()})`;
            else if (cmd === 'i') {
              const lo = group();
              out += `∫<sub>${lo}</sub><sup>${group()}</sup>`;
            } else if (cmd === 'c') {
              group();
              out += group();
            } else if (cmd === 'b') out += `<strong>${group()}</strong>`;
            else out += group().replace(/<\/?var>/g, '');
          } else if (ch === '_' || ch === '^') {
            flush();
            i++;
            out += ch === '_' ? `<sub>${group()}</sub>` : `<sup>${group()}</sup>`;
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

    /* ---------- Körperformeln ---------- */

    function solidName(ks: KnownSolid): string {
      return ctx.t(ks.name);
    }
    /** Körperformel (Kurzschrift) mit eingesetzten Werten. */
    function solidFormula(ks: KnownSolid): { f: string; filled: string } | null {
      const v = ks.values;
      const n2 = (x: number) => N(x, 3);
      switch (ks.name) {
        case 'zylinder':
          return { f: 'πr² · h', filled: `π · ${n2(v.r!)}² · ${n2(v.h!)}` };
        case 'kegel':
          return { f: '\\f{1}{3}πr² · h', filled: `\\f{1}{3}π · ${n2(v.r!)}² · ${n2(v.h!)}` };
        case 'kegelstumpf':
          return { f: '\\f{1}{3}πh(R² + Rr + r²)', filled: `\\f{1}{3}π · ${n2(v.h!)} · (${n2(v.R!)}² + ${n2(v.R!)} · ${n2(v.r!)} + ${n2(v.r!)}²)` };
        case 'doppelkegel':
          return { f: '\\f{1}{3}π(r_1²h_1 + r_2²h_2)', filled: `\\f{1}{3}π(${n2(v.r1!)}² · ${n2(v.h1!)} + ${n2(v.r2!)}² · ${n2(v.h2!)})` };
        case 'kugel':
          return { f: '\\f{4}{3}πr³', filled: `\\f{4}{3}π · ${n2(v.r!)}³` };
        case 'kugelabschnitt':
          return { f: '\\f{1}{3}πh²(3r − h)', filled: `\\f{1}{3}π · ${n2(v.h!)}² · (3 · ${n2(v.r!)} − ${n2(v.h!)})` };
        case 'kugelschicht':
          return { f: '\\f{πh}{6}(3r_1² + 3r_2² + h²)', filled: `\\f{π · ${n2(v.h!)}}{6}(3 · ${n2(v.r1!)}² + 3 · ${n2(v.r2!)}² + ${n2(v.h!)}²)` };
        case 'paraboloid':
          return { f: '\\f{1}{2}πr² · h', filled: `\\f{1}{2}π · ${n2(v.r!)}² · ${n2(v.h!)}` };
        case 'paraboloidstumpf':
          return { f: '\\f{1}{2}πh(r_1² + r_2²)', filled: `\\f{1}{2}π · ${n2(v.h!)} · (${n2(v.r1!)}² + ${n2(v.r2!)}²)` };
        default:
          return null;
      }
    }

    /* ---------- Form, Scheiben, Übergänge ---------- */

    function rCur(s: number): number {
      const sh = shape;
      if (sh.list) return sh.list[Math.min(sh.list.length - 1, Math.max(0, Math.floor(s * sh.list.length)))]!.r;
      return radiusAt(sh.fn, sh.fp, sh.a + s * (sh.b - sh.a));
    }
    const rCurAt = (s: number) => radiusAt(shape.fn, shape.fp, shape.a + s * (shape.b - shape.a));

    /** Abstand der Scheiben beim Auseinanderziehen (Weltlänge je Scheibe). */
    const gapOf = (n: number, len: number) => Math.min(0.5, (0.6 * len) / Math.max(1, n));
    /** Verschiebung der Scheibe i (zeitversetzt: rechte Scheiben beginnen früher, so bleibt die Reihenfolge erhalten). */
    function sepOffset(i: number, n: number, len: number): number {
      if (n <= 1 || sepT <= 0) return 0;
      const S = 0.45;
      const e = (j: number) => ease.inOutCubic(clamp01((sepT - (1 - j / (n - 1)) * S) / (1 - S)));
      const g = gapOf(n, len);
      return i * g * e(i) - 0.5 * (n - 1) * g * e(n - 1);
    }

    function prevSeg(pr: Profile, s: number): Profile['segs'][number] | null {
      const list = pr.segs;
      let lo = 0;
      let hi = list.length - 1;
      while (lo <= hi) {
        const mid = (lo + hi) >> 1;
        const q = list[mid]!;
        if (s < q.s0) hi = mid - 1;
        else if (s > q.s1) lo = mid + 1;
        else return q;
      }
      return list[Math.max(0, Math.min(list.length - 1, lo))] ?? null;
    }

    /** Stücke des gezeigten Körpers für den Zeitpunkt `now`. */
    function buildSegs(now: number, withCut = true): { segs: Seg[]; A: number; B: number; anim: boolean } {
      const sh = shape;
      let m = morph;
      let eG = 1;
      let anim = false;
      if (m) {
        const raw = (now - m.t0) / (m.dur + m.spread);
        if (raw >= 1) {
          morph = null;
          m = null;
        } else {
          eG = ease.inOutCubic(clamp01(raw));
          anim = true;
        }
      }
      const A = m ? lerp(m.prev.a, sh.a, eG) : sh.a;
      const B = m ? lerp(m.prev.b, sh.b, eG) : sh.b;
      const len = Math.max(1e-6, B - A);
      const S: number[] = [0, 1];
      const fine = FINE[sh.fn];
      if (!sh.list) for (let i = 1; i < fine; i++) S.push(i / fine);
      if (sh.list) for (let j = 1; j < sh.list.length; j++) S.push(j / sh.list.length);
      if (m) for (const q of m.prev.segs) S.push(q.s0);
      for (const x of criticalPoints(sh.fn, sh.fp)) if (x > sh.a && x < sh.b) S.push((x - sh.a) / (sh.b - sh.a));
      const cutOn = withCut && cutF.v > 1e-3;
      const sCut = (Math.max(sh.a, Math.min(sh.b, xsF.v)) - sh.a) / Math.max(1e-9, sh.b - sh.a);
      if (cutOn) S.push(sCut);
      S.sort((u, v) => u - v);
      const tol = m ? 1.5e-3 : 1e-7;
      const B2: number[] = [];
      for (const s of S) if (!B2.length || s - B2[B2.length - 1]! > tol) B2.push(Math.max(0, Math.min(1, s)));
      if (B2[B2.length - 1]! < 1) B2.push(1);
      else B2[B2.length - 1] = 1;
      const nDisc = sh.list ? sh.list.length : 0;
      const grow = intro ? ease.outCubic(clamp01((now - intro.t0) / 650)) : 1;
      if (intro && grow < 1) anim = true;
      const cutGap = cutOn ? cutF.v * Math.min(1.1, 0.16 * len + 0.25) : 0;
      const segs: Seg[] = [];
      for (let k = 0; k + 1 < B2.length; k++) {
        const s0 = B2[k]!;
        const s1 = B2[k + 1]!;
        if (s1 - s0 < 1e-9) continue;
        const sm = (s0 + s1) / 2;
        const di = sh.list ? Math.min(nDisc - 1, Math.floor(sm * nDisc)) : -1;
        const rc0 = sh.list ? rCur(sm) : rCurAt(s0);
        const rc1 = sh.list ? rc0 : rCurAt(s1);
        const offC = sh.list ? sepOffset(di, nDisc, len) : 0;
        let r0 = rc0;
        let r1 = rc1;
        let sep = offC;
        let shadeK = sh.list ? 1 : 0;
        if (m) {
          const e = ease.inOutCubic(clamp01((now - m.t0 - m.spread * sm) / m.dur));
          const q = prevSeg(m.prev, sm);
          if (q) {
            const w = Math.max(1e-9, q.s1 - q.s0);
            const rp0 = lerp(q.r0, q.r1, clamp01((s0 - q.s0) / w));
            const rp1 = lerp(q.r0, q.r1, clamp01((s1 - q.s0) / w));
            r0 = lerp(rp0, rc0, e);
            r1 = lerp(rp1, rc1, e);
            sep = lerp(q.sep, offC, eG);
          }
          shadeK *= e;
        }
        const extra = cutOn && sm > sCut ? cutGap / 2 : cutOn ? -cutGap / 2 : 0;
        const x0 = A + s0 * len + sep + extra;
        const x1 = A + s1 * len + sep + extra;
        const ring = !sh.list && s0 > 1e-6 && Math.abs(s0 * 8 - Math.round(s0 * 8)) < 1e-6;
        segs.push({ s0, s1, x0, x1, r0: r0 * grow, r1: r1 * grow, sep, disc: di, shadeK, capL: 0, capR: 0, ring });
      }
      // Deckflächen: an den Enden, an Sprüngen des Radius, an Lücken und am Schnitt
      segs.forEach((q, i) => {
        const prev = segs[i - 1];
        const next = segs[i + 1];
        const jumpL = !prev || Math.abs(prev.r1 - q.r0) > 1e-4 || Math.abs(prev.x1 - q.x0) > 1e-5;
        const jumpR = !next || Math.abs(next.r0 - q.r1) > 1e-4 || Math.abs(next.x0 - q.x1) > 1e-5;
        const atCutL = cutOn && Math.abs(q.s0 - sCut) < 1e-7;
        const atCutR = cutOn && Math.abs(q.s1 - sCut) < 1e-7;
        q.capL = atCutL ? 2 : jumpL ? 1 : 0;
        q.capR = atCutR ? 2 : jumpR ? 1 : 0;
      });
      return { segs, A, B, anim };
    }

    /** Gezeigte Form als Profil festhalten (Anfang eines Übergangs). */
    function snapshot(now: number): Profile {
      const { segs, A, B } = buildSegs(now, false);
      const out: Profile['segs'] = [];
      for (const q of segs) {
        const last = out[out.length - 1];
        const cont = last && Math.abs(last.r1 - q.r0) < 1e-6 && Math.abs(last.sep - q.sep) < 1e-6;
        if (last && cont && q.s1 - last.s0 <= 1 / 40 && Math.abs((last.r1 - last.r0) / Math.max(1e-9, last.s1 - last.s0) - (q.r1 - q.r0) / Math.max(1e-9, q.s1 - q.s0)) < 1e-3) {
          last.s1 = q.s1;
          last.r1 = q.r1;
        } else out.push({ s0: q.s0, s1: q.s1, r0: q.r0, r1: q.r1, sep: q.sep });
      }
      return { a: A, b: B, segs: out };
    }

    function startMorph(dur: number, spread: number): void {
      const now = performance.now();
      if (reduced()) {
        morph = null;
        return;
      }
      const prev = snapshot(now);
      morph = { prev, t0: now, dur, spread };
    }

    /* ---------- Szene ---------- */

    /** Größter Radius der Zielform (für Bildausschnitt, Boden, Diagramm). */
    function maxRadius(): number {
      const sh = shape;
      let R = 0;
      if (sh.list) for (const d of sh.list) R = Math.max(R, d.r);
      for (let i = 0; i <= 64; i++) R = Math.max(R, radiusAt(sh.fn, sh.fp, sh.a + (i / 64) * (sh.b - sh.a)));
      return Math.max(0.4, R);
    }

    function goalFrame(): { target: Vec3; radius: number; R: number } {
      const sc = rects().scene;
      const sh = shape;
      const len = sh.b - sh.a;
      const R = maxRadius();
      const spreadSep = sh.list && p.sep ? 0.5 * (sh.list.length - 1) * gapOf(sh.list.length, len) : 0;
      const cut = p.sec ? Math.min(1.1, 0.16 * len + 0.25) / 2 : 0;
      const xl = sh.a - spreadSep - cut - Math.min(1.2, 0.25 * R + 0.35);
      const xr = sh.b + spreadSep + cut + Math.min(1.4, 0.3 * R + 0.5);
      const floor = -(R * 1.15 + 0.3);
      const halfX = (xr - xl) / 2;
      const halfZ = (R - floor) / 2 + 0.25;
      const m = Math.min(sc.w, sc.h) * 0.92;
      const radius = Math.max((halfX * m) / (sc.w * 0.92), (halfZ * m) / (sc.h * (narrow() ? 0.66 : 0.6))) * 1.02;
      return { target: [0, (xl + xr) / 2, (R + floor) / 2 + 0.1 * R], radius, R };
    }

    /** Fläche (Liste von Bildschirmpunkten), Farbe, Tiefe – für die Malerreihenfolge innerhalb eines Stücks. */
    interface FaceItem {
      pts: Vec2[];
      fill: string;
      depth: number;
      after?: (g: CanvasRenderingContext2D) => void;
    }

    function drawScene(segs: Seg[], Phi: number): void {
      const g = surface.g;
      const c = C();
      const cam = view.camera;
      const camPos = cam.position;
      const R = frame ? frame.R : maxRadius();
      const floorZ = -(R * 1.15 + 0.3);
      const full = Phi >= TAU - 1e-6;
      // Winkel (feste Schritte, letzter Schritt bis Φ)
      const angles: number[] = [0];
      for (let j = 1; j * DPHI < Phi - 1e-9; j++) angles.push(j * DPHI);
      angles.push(Phi);
      const M = angles.length - 1;
      const SN = angles.map(Math.sin);
      const CS = angles.map(Math.cos);
      const P = (x: number, r: number, j: number): Vec3 => [-r * SN[j]!, x, r * CS[j]!];
      const px = (q: Vec3): Vec2 => view.toPx(q) as unknown as Vec2;

      const xMin = segs.length ? segs[0]!.x0 : 0;
      const xMax = segs.length ? segs[segs.length - 1]!.x1 : 1;

      // Boden: Gitter und weicher Schatten
      const G = Math.ceil(R * 1.4 + 1);
      view.grid({ min: [-G, Math.floor(xMin - 1.5)], max: [G, Math.ceil(xMax + 1.5)], step: 1, offset: floorZ, color: th().gridMinor });
      if (Phi > 1e-3 && segs.length) {
        const pts: Vec3[] = [];
        const step = Math.max(1, Math.floor(segs.length / 14));
        for (let i = 0; i < segs.length; i += step) {
          const q = segs[i]!;
          for (let j = 0; j <= M; j += Math.max(1, Math.floor(M / 12))) pts.push(P(q.x0, q.r0, j));
          pts.push([0, q.x0, 0]);
        }
        const last = segs[segs.length - 1]!;
        for (let j = 0; j <= M; j += Math.max(1, Math.floor(M / 12))) pts.push(P(last.x1, last.r1, j));
        const flat = pts.map((q) => [q[0], q[1], floorZ] as Vec3);
        view.shadow(flat, { z: floorZ, alpha: 0.2 * Math.min(1, 0.35 + Phi / TAU), blur: 26, spread: 1.04 });
      }

      const axisCol = th().dark ? mixColor(th().axis, '#ffffff', 0.15) : th().axis;
      const baseBody = tint(c.body);
      const discColor = (q: Seg) => {
        if (q.disc < 0 || q.disc % 2 === 0) return baseBody;
        return mixColor(baseBody, th().dark ? '#000000' : '#ffffff', (th().dark ? 0.2 : 0.24) * q.shadeK);
      };
      const areaBase = th().dark ? mixColor(c.area, '#0b1220', 0.15) : mixColor(c.area, '#ffffff', 0.25);
      const areaEdge = th().dark ? mixColor(c.area, '#ffffff', 0.2) : mixColor(c.area, '#05080f', 0.3);
      const secBase = th().dark ? mixColor(c.sec, '#0b1220', 0.05) : mixColor(c.sec, '#ffffff', 0.1);

      /** Zeichnet ein Stück: Mantel (Vierecke), Schnittflächen beim Drehwinkel 0 und Φ, Deckflächen. */
      const drawSeg = (q: Seg) => {
        const rmax = Math.max(q.r0, q.r1);
        if (rmax < 1e-5 || M < 1) return;
        const base = discColor(q);
        const ring0 = angles.map((_, j) => px(P(q.x0, q.r0, j)));
        const ring1 = angles.map((_, j) => px(P(q.x1, q.r1, j)));
        const slope = -(q.r1 - q.r0) / Math.max(1e-9, q.x1 - q.x0);
        const xm = (q.x0 + q.x1) / 2;
        const rm = (q.r0 + q.r1) / 2;
        const faces: FaceItem[] = [];
        const isDisc = q.disc >= 0 && q.shadeK > 0.5;
        const edgeDisc = edgeOf(base, 0.75);
        const wire = th().dark ? 'rgba(255,255,255,0.13)' : 'rgba(10,20,40,0.13)';
        for (let j = 0; j < M; j++) {
          if (angles[j + 1]! - angles[j]! < 1e-6) continue;
          const pc = (angles[j]! + angles[j + 1]!) / 2;
          const n = vec3.normalize([-Math.sin(pc), slope, Math.cos(pc)]);
          const ctr: Vec3 = [-rm * Math.sin(pc), xm, rm * Math.cos(pc)];
          if (vec3.dot(n, vec3.sub(camPos, ctr)) <= 0) continue;
          const pts = [ring0[j]!, ring0[j + 1]!, ring1[j + 1]!, ring1[j]!];
          const jj = j;
          faces.push({
            pts,
            fill: lit(base, n),
            depth: cam.project(ctr).depth,
            after: (gg) => {
              if (isDisc) {
                gg.strokeStyle = edgeDisc;
                gg.globalAlpha = 0.55;
                gg.lineWidth = 1;
                gg.beginPath();
                gg.moveTo(pts[0]![0], pts[0]![1]);
                gg.lineTo(pts[1]![0], pts[1]![1]);
                gg.moveTo(pts[2]![0], pts[2]![1]);
                gg.lineTo(pts[3]![0], pts[3]![1]);
                gg.stroke();
                gg.globalAlpha = 1;
              } else {
                gg.strokeStyle = wire;
                gg.lineWidth = 1;
                gg.beginPath();
                if (q.ring) {
                  gg.moveTo(pts[0]![0], pts[0]![1]);
                  gg.lineTo(pts[1]![0], pts[1]![1]);
                }
                if (jj % 4 === 0 && jj > 0) {
                  gg.moveTo(pts[0]![0], pts[0]![1]);
                  gg.lineTo(pts[3]![0], pts[3]![1]);
                }
                gg.stroke();
                if (jj === 0 && full) {
                  // Graph von f auf dem Körper (Meridian beim Winkel 0)
                  gg.strokeStyle = areaEdge;
                  gg.lineWidth = 2.4;
                  gg.lineCap = 'round';
                  gg.beginPath();
                  gg.moveTo(pts[0]![0], pts[0]![1]);
                  gg.lineTo(pts[3]![0], pts[3]![1]);
                  gg.stroke();
                }
              }
            },
          });
        }
        // Schnittflächen der gedrehten Fläche (nur solange nicht voll gedreht)
        if (!full) {
          const ax0 = px([0, q.x0, 0]);
          const ax1 = px([0, q.x1, 0]);
          const sides: [number, Vec3][] = [
            [0, [1, 0, 0]],
            [M, [-CS[M]!, 0, -SN[M]!]],
          ];
          for (const [j, n] of sides) {
            const ctr = P(xm, rm / 2, j);
            if (vec3.dot(n, vec3.sub(camPos, ctr)) <= 0) continue;
            const pts = [ax0, ax1, ring1[j]!, ring0[j]!];
            faces.push({
              pts,
              fill: lit(areaBase, n, 0.1),
              depth: cam.project(ctr).depth,
              after: (gg) => {
                gg.strokeStyle = areaEdge;
                gg.lineWidth = 2.6;
                gg.lineCap = 'round';
                gg.beginPath();
                gg.moveTo(pts[3]![0], pts[3]![1]);
                gg.lineTo(pts[2]![0], pts[2]![1]);
                gg.stroke();
              },
            });
          }
        }
        // Deckflächen
        const caps: [0 | 1 | 2, number, number, Vec2[], Vec3][] = [
          [q.capL, q.x0, q.r0, ring0, [0, -1, 0]],
          [q.capR, q.x1, q.r1, ring1, [0, 1, 0]],
        ];
        for (const [kind, x, r, ring, n] of caps) {
          if (!kind || r < 1e-5 || Phi < 1e-4) continue;
          const ctr: Vec3 = [0, x, 0];
          if (vec3.dot(n, vec3.sub(camPos, ctr)) <= 0) continue;
          const pts = full ? ring.slice(0, M) : [px(ctr), ...ring];
          const isSec = kind === 2;
          const col = isSec ? lit(secBase, n, 0.15) : lit(mixColor(base, th().dark ? '#000000' : '#ffffff', 0.06), n);
          faces.push({
            pts,
            fill: col,
            depth: cam.project(ctr).depth + 1e-3,
            after: (gg) => {
              gg.save();
              if (isSec) {
                // Schraffur des Querschnitts
                gg.beginPath();
                pts.forEach((pt, i) => (i ? gg.lineTo(pt[0], pt[1]) : gg.moveTo(pt[0], pt[1])));
                gg.closePath();
                gg.clip();
                let x0 = Infinity;
                let x1 = -Infinity;
                let y0 = Infinity;
                let y1 = -Infinity;
                for (const pt of pts) {
                  x0 = Math.min(x0, pt[0]);
                  x1 = Math.max(x1, pt[0]);
                  y0 = Math.min(y0, pt[1]);
                  y1 = Math.max(y1, pt[1]);
                }
                gg.strokeStyle = th().dark ? mixColor(c.sec, '#000000', 0.35) : mixColor(c.sec, '#ffffff', 0.5);
                gg.lineWidth = 1.2;
                gg.globalAlpha = 0.6;
                gg.beginPath();
                for (let xx = x0 - (y1 - y0); xx < x1; xx += 7) {
                  gg.moveTo(xx, y1);
                  gg.lineTo(xx + (y1 - y0), y0);
                }
                gg.stroke();
                gg.restore();
                gg.save();
              }
              gg.beginPath();
              const rim = full ? ring.slice(0, M) : ring;
              rim.forEach((pt, i) => (i ? gg.lineTo(pt[0], pt[1]) : gg.moveTo(pt[0], pt[1])));
              if (full) gg.closePath();
              gg.strokeStyle = isSec ? edgeOf(c.sec, 0.8) : edgeOf(base, 0.7);
              gg.lineWidth = isSec ? 1.8 : 1.1;
              gg.globalAlpha = isSec ? 1 : 0.7;
              gg.stroke();
              gg.restore();
            },
          });
        }
        if (Phi > Math.PI) faces.sort((u, v) => v.depth - u.depth);
        g.lineJoin = 'round';
        for (const f of faces) {
          g.beginPath();
          f.pts.forEach((pt, i) => (i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1])));
          g.closePath();
          g.fillStyle = f.fill;
          g.fill();
          g.strokeStyle = f.fill;
          g.lineWidth = 0.8;
          g.stroke();
          f.after?.(g);
        }
      };

      // Achse in kleine Stücke zerlegt, damit sie richtig verdeckt wird
      const axL = Math.min(xMin - Math.min(1.2, 0.25 * R + 0.35), xMin - 0.3);
      const axR = xMax + Math.min(1.4, 0.3 * R + 0.5);
      type Item = { key: number; draw: () => void };
      const items: Item[] = [];
      const camX = camPos[1];
      for (const q of segs) items.push({ key: Math.abs((q.x0 + q.x1) / 2 - camX), draw: () => drawSeg(q) });
      const pieces = Math.max(8, Math.ceil((axR - axL) / 0.2));
      for (let i = 0; i < pieces; i++) {
        const u0 = axL + ((axR - axL) * i) / pieces;
        const u1 = axL + ((axR - axL) * (i + 1)) / pieces;
        const um = (u0 + u1) / 2;
        const host = segs.find((q) => um >= q.x0 && um <= q.x1);
        const key = host ? Math.abs((host.x0 + host.x1) / 2 - camX) + 1e-6 : Math.abs(um - camX);
        items.push({
          key,
          draw: () => {
            const a = view.toPx([0, u0, 0]);
            const b = view.toPx([0, Math.min(axR - 0.25, u1), 0]);
            if (u0 >= axR - 0.25) return;
            g.strokeStyle = axisCol;
            g.lineWidth = 1.8;
            g.lineCap = 'butt';
            g.beginPath();
            g.moveTo(a[0], a[1]);
            g.lineTo(b[0], b[1]);
            g.stroke();
          },
        });
      }
      items.sort((u, v) => v.key - u.key);
      view.custom(
        [0, (xMin + xMax) / 2, 0],
        () => {
          for (const it of items) it.draw();
        },
        'scene',
      );
      // Pfeilspitze und Beschriftung der Rotationsachse
      view.arrow([0, axR - 0.5, 0], [0, axR, 0], { color: axisCol, width: 1.8, head: 9, layer: 'front' });
      view.label([0, axR, 0], 'x', { color: th().text, size: 15, math: true, offset: [4, -12], layer: 'front' });
    }

    /** Beschriftungen über der Szene: Drehwinkel, Querschnitt, Name. */
    function drawOverlays(segs: Seg[], Phi: number): void {
      const c = C();
      const size = textSize();
      const sc = rects().scene;
      const R = frame ? frame.R : maxRadius();
      if (!segs.length) return;
      const xMin = segs[0]!.x0;
      // Drehwinkel als Bogen um die Achse links vom Körper
      const showAngle = Phi < TAU - 1e-6 || spin !== null;
      if (showAngle && Phi > 0.01) {
        const xa = xMin - Math.min(0.9, 0.18 * R + 0.25);
        const rr = Math.max(0.45, R * 0.55);
        const pts: Vec3[] = [];
        const steps = Math.max(6, Math.ceil(Phi / 0.08));
        for (let i = 0; i <= steps; i++) {
          const t = (Phi * i) / steps;
          pts.push([-rr * Math.sin(t), xa, rr * Math.cos(t)]);
        }
        view.segment([0, xa, 0], [0, xa, rr * 1.15], { color: c.area, width: 1.4, dash: [4, 4], layer: 'front' });
        view.polyline(pts, { color: c.area, width: 2.4, layer: 'front' });
        const end = pts[pts.length - 1]!;
        const before = pts[Math.max(0, pts.length - 3)]!;
        view.arrow(before, end, { color: c.area, width: 2.4, head: 9, layer: 'front' });
        const mid = pts[Math.floor(pts.length / 2)]!;
        view.custom(
          mid,
          () => {
            const [x, y] = view.toPx([0, xa, 0]);
            const off = rr * view.pixelsPerUnit([0, xa, 0]);
            pill(Math.max(sc.x + 44, x - off - 40), y, tr('angle', { v: Math.round((Phi * 180) / Math.PI) }), th().text, 'center', size - 0.5, c.area);
          },
          'front',
        );
      }
      // Querschnitt: Beschriftung über der Schnittfläche
      const cutSeg = segs.find((q) => q.capR === 2);
      if (cutSeg && cutF.v > 0.3) {
        const top: Vec3 = [0, cutSeg.x1, Math.max(cutSeg.r1, 0.05)];
        view.custom(
          top,
          () => {
            const [x, y] = view.toPx(top);
            const A = nums.A.v;
            const src = p.vals ? `A(x) = π · f(x)² ${A < 1e-6 ? '=' : '≈'} ${num(A)}` : 'A(x) = π · f(x)²';
            const yy = Math.max(sc.y + 20, y - 26);
            g2line(x, y - 6, x, yy + 10, c.sec);
            pill(Math.max(sc.x + 70, Math.min(sc.x + sc.w - 70, x)), yy, src, th().text, 'center', size - 0.5, c.sec);
          },
          'front',
        );
      }
      // Name des Körpers oben links
      const ks = knownSolid(shape.fn, shape.fp, shape.a, shape.b);
      const nm = tr('title', { name: solidName(ks) });
      const g = surface.g;
      const box = formula(g, nm, fstyle(size + 0.5, th().text, 800));
      const w = box.w + 34;
      const h = box.asc + box.desc + 16;
      const x0 = sc.x + 10;
      const y0 = sc.y + 10;
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, x0, y0, w, h, 10);
      g.fill();
      g.restore();
      g.fillStyle = c.body;
      g.beginPath();
      g.arc(x0 + 15, y0 + h / 2, 5, 0, TAU);
      g.fill();
      box.draw(g, x0 + 26, y0 + 8 + box.asc);
    }

    function g2line(x0: number, y0: number, x1: number, y1: number, color: string): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 1.4;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1, y1);
      g.stroke();
      g.restore();
    }

    /** Formel in einem Schild an einer Pixelposition. */
    function pill(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right', size: number, border?: string): Rect {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      const base = y + (box.asc - box.desc) / 2;
      const rr = { x: left - 7, y: base - box.asc - 4, w: box.w + 14, h: box.asc + box.desc + 8 };
      g.save();
      g.fillStyle = pillBg();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.4)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 9);
      g.fill();
      g.restore();
      if (border) {
        g.strokeStyle = border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 9);
        g.stroke();
      }
      box.draw(g, left, base);
      return rr;
    }

    /* ---------- Karten ---------- */

    function cardFrame(r: Rect): void {
      const g = surface.g;
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = th().dark ? 'rgba(21,28,39,0.96)' : 'rgba(255,255,255,0.96)';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.strokeStyle = th().dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function drawCard(r: Rect, title: string, lines: CardLine[]): void {
      const g = surface.g;
      const pad = narrow() ? 10 : 13;
      const sw = 16;
      const inner = r.w - 2 * pad;
      let size = textSize();
      let layout: { titleBox: FormulaBox; boxes: FormulaBox[]; lineHs: number[]; total: number } | null = null;
      for (; size >= 9.5; size -= 0.5) {
        const titleBox = fitFormula(title, inner, size + 2, th().text, 800);
        const boxes = lines.map((l) => fitFormula(l.f, inner - (l.swatch ? sw : 0), size, l.muted ? th().muted : th().text, l.bold ? 800 : 600));
        const lineHs = boxes.map((b) => Math.max(size * 1.55, b.asc + b.desc + 7));
        const total = pad + titleBox.asc + titleBox.desc + 8 + lineHs.reduce((a, b) => a + b, 0) + pad - 4;
        layout = { titleBox, boxes, lineHs, total };
        if (total <= r.h) break;
      }
      if (!layout) return;
      cardFrame(r);
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      const free = Math.max(0, r.h - layout.total);
      const gapExtra = Math.min(6, free / Math.max(1, lines.length + 1));
      let cy = r.y + pad + layout.titleBox.asc + gapExtra / 2;
      layout.titleBox.draw(g, r.x + pad, cy);
      cy += layout.titleBox.desc + 8 + gapExtra;
      layout.boxes.forEach((b, i) => {
        const lh = layout!.lineHs[i]! + gapExtra;
        const line = lines[i]!;
        const base = cy + lh / 2 + (b.asc - b.desc) / 2;
        if (line.swatch) {
          g.fillStyle = line.swatch;
          roundRect(g, r.x + pad, cy + lh / 2 - 5, 10, 10, 3);
          g.fill();
        }
        b.draw(g, r.x + pad + (line.swatch ? sw : 0), base);
        cy += lh;
      });
      g.restore();
    }

    function cardLines(): { title: string; lines: CardLine[] } {
      const c = C();
      const sh = shape;
      const ks = knownSolid(sh.fn, sh.fp, sh.a, sh.b);
      const vals = p.vals;
      const lines: CardLine[] = [];
      const a = limText(sh.a);
      const b = limText(sh.b);
      lines.push({ f: `f(x) = ${fTerm(sh)},  ${a} ≤ x ≤ ${b}`, swatch: c.area });
      if (p.sec) {
        const A = nums.A.v;
        const x = num(xsEff());
        lines.push({ f: `A(x) = π · (f(x))²${vals ? `,  A(${x}) ${A < 1e-6 ? '=' : '≈'} ${num(A)}` : ''}`, swatch: c.sec });
      }
      const V = volume(sh.fn, sh.fp, sh.a, sh.b);
      lines.push({ f: 'V = π \\i{a}{b}(f(x))² \\t{d}x', bold: true });
      const ex = exactText(V);
      const Vs = nums.V.v;
      const tail = vals ? ` ${ex ? `= ${ex} ` : ''}≈ ${num(Vs)}` : '';
      lines.push({ f: `= π \\i{${a}}{${b}}${f2Wrapped(sh)}\\t{d}x${tail}`, bold: true });
      if (sh.list) {
        const S = nums.S.v;
        const dev = V > 1e-9 ? ((discSum(sh.list) - V) / V) * 100 : 0;
        const devTxt = Math.abs(dev) >= 0.05 ? ` (${dev > 0 ? '+' : '−'}${num(Math.abs(dev), 1)} %)` : '';
        lines.push({ f: `V_{${sh.list.length}} = Σ π r_i² · Δx${vals ? ` ≈ ${num(S)}${devTxt}` : ''}`, swatch: c.body });
      } else if (!narrow()) lines.push({ f: ctx.t('smooth'), muted: true });
      const sf = solidFormula(ks);
      if (sf) {
        lines.push({ f: `${solidName(ks)}: V = ${sf.f}${vals && ks.volume !== null ? ` ≈ ${num(ks.volume)} ✓` : ''}`, muted: true });
      } else if (ks.name === 'horn') {
        lines.push({ f: `b → ∞:  V → \\f{πk²}{a}${vals ? ` = ${exactText(hornLimit(sh.fp, sh.a)) ?? num(hornLimit(sh.fp, sh.a))} ≈ ${num(hornLimit(sh.fp, sh.a))}` : ''}`, muted: true });
      } else lines.push({ f: ctx.t('noFormula'), muted: true });
      return { title: ctx.t('cardTitle'), lines };
    }

    /* ---------- Seitenansicht ---------- */

    // Griffe in der Seitenansicht
    const shapeHandle = (): [number, number] => {
      const sh = shape;
      const { r, m, c, k } = sh.fp;
      switch (sh.fn) {
        case 'zyl':
          return [(sh.a + sh.b) / 2, r];
        case 'kegel': {
          const x = Math.abs(sh.b) >= Math.abs(sh.a) ? sh.b : sh.a;
          return [x, m * x];
        }
        case 'stumpf': {
          const x = Math.abs(sh.b) >= Math.abs(sh.a) ? sh.b : sh.a;
          return [x, m * x + c];
        }
        case 'kugel':
          return [Math.max(sh.a, Math.min(sh.b, 0)), radiusAt('kugel', sh.fp, Math.max(sh.a, Math.min(sh.b, 0)))];
        case 'para':
          return [sh.b, k * Math.sqrt(sh.b)];
        case 'sin': {
          const x = Math.max(sh.a, Math.min(sh.b, Math.PI / 2));
          return [x, k * Math.sin(x)];
        }
        case 'horn':
          return [sh.a, k / sh.a];
      }
    };
    plot.addHandle({
      get: shapeHandle,
      set: (_x, y) => {
        grab();
        const sh = shape;
        const [hx] = shapeHandle();
        switch (sh.fn) {
          case 'zyl':
            ctx.set({ r: Math.max(0.5, y) });
            break;
          case 'kegel':
            if (Math.abs(hx) > 1e-6) ctx.set({ m: y / hx });
            break;
          case 'stumpf':
            if (Math.abs(hx) > 1e-6) ctx.set({ m: (y - sh.fp.c) / hx });
            break;
          case 'kugel': {
            const x = hx;
            const r = Math.sqrt(Math.max(0.25, y * y + x * x));
            const full = sh.a <= -sh.fp.r + 1e-9 && sh.b >= sh.fp.r - 1e-9;
            ctx.set(full ? { r, a: -Math.round(r * 4) / 4, b: Math.round(r * 4) / 4 } : { r });
            break;
          }
          case 'para':
            if (hx > 1e-6) ctx.set({ k: y / Math.sqrt(hx) });
            break;
          case 'sin':
            if (Math.sin(hx) > 1e-6) ctx.set({ k: y / Math.sin(hx) });
            break;
          case 'horn':
            ctx.set({ k: y * hx });
            break;
        }
      },
      axis: 'y',
      enabled: editable,
      color: () => C().area,
    });
    plot.addHandle({
      get: () => [0, p.c],
      set: (_x, y) => {
        grab();
        ctx.set({ c: y });
      },
      axis: 'y',
      enabled: () => editable() && shape.fn === 'stumpf' && shape.a <= 0 && shape.b >= 0,
      color: () => C().area,
    });
    const limHandle = (key: 'a' | 'b') =>
      plot.addHandle({
        get: () => [key === 'a' ? shape.a : shape.b, 0],
        set: (x) => {
          grab();
          const [d0, d1] = domainOf(shape.fn, shape.fp);
          const v = Math.max(d0, Math.min(d1, x));
          ctx.set(key === 'a' ? { a: Math.min(v, shape.b - 0.1) } : { b: Math.max(v, shape.a + 0.1) });
        },
        axis: 'x',
        enabled: editable,
        color: () => C().lim,
      });
    limHandle('a');
    limHandle('b');
    plot.addHandle({
      get: () => [xsF.v, radiusAt(shape.fn, shape.fp, Math.max(shape.a, Math.min(shape.b, xsF.v)))],
      set: (x) => {
        grab();
        ctx.set({ xs: Math.max(shape.a, Math.min(shape.b, x)) });
      },
      axis: 'x',
      enabled: () => editable() && p.sec,
      color: () => C().sec,
    });
    // 3D: Querschnitt entlang der Achse ziehen
    let cutWorld: Vec3 = [0, 0, 0];
    view.addHandle({
      get: () => cutWorld,
      set: (q) => {
        grab();
        const dx = q[1] - cutWorld[1];
        ctx.set({ xs: Math.max(shape.a, Math.min(shape.b, xsF.v + dx)) });
      },
      axis: [0, 1, 0],
      enabled: () => editable() && p.sec && cutF.v > 0.5,
      color: () => C().sec,
    });

    function drawChart(segs: Seg[], A: number, B: number): void {
      const g = surface.g;
      const cr = rects().chart;
      const c = C();
      const sh = shape;
      const R = frame ? frame.R : maxRadius();
      cardFrame(cr);
      const size = textSize();
      const title = fitFormula(ctx.t('side'), cr.w - 24, size, th().text, 800);
      title.draw(g, cr.x + 12, cr.y + 12 + title.asc);
      if (sh.list) {
        const note = formula(g, ctx.t('rects'), fstyle(11, th().muted, 500));
        if (title.w + note.w + 34 < cr.w) note.draw(g, cr.x + cr.w - 12 - note.w, cr.y + 12 + title.asc);
      }
      // Bereich: möglichst gleiche Maßstäbe, höchstens 1,8-fach gestreckt
      const len = B - A;
      let x0 = A - 0.1 * len;
      let x1 = B + 0.14 * len;
      if (A > 0 && A < 0.6 * len) x0 = -0.08 * len;
      if (B < 0 && B > -0.6 * len) x1 = 0.1 * len;
      let y0 = -R * 1.12;
      let y1 = R * 1.18;
      const pr0 = chartPlotRect();
      const pad = { left: 30, bottom: 22, top: 12, right: 14 };
      const aw = Math.max(40, pr0.w - pad.left - pad.right);
      const ah = Math.max(40, pr0.h - pad.top - pad.bottom);
      const sx = aw / (x1 - x0);
      const sy = ah / (y1 - y0);
      if (sy < sx) {
        const ext = (aw / sy - (x1 - x0)) / 2;
        x0 -= ext;
        x1 += ext;
      } else if (sy > sx * 1.8) {
        const ext = (ah / (sx * 1.8) - (y1 - y0)) / 2;
        y0 -= ext;
        y1 += ext;
      }
      plot.setRangePadded([x0, x1], [y0, y1], pad);
      const pr = plot.rect;
      g.save();
      g.beginPath();
      g.rect(pr.x, pr.y, pr.w, pr.h);
      g.clip();
      plot.grid();
      const toX = (s: number) => A + s * len;
      // Fläche unter |f| und Spiegelbild (Längsschnitt)
      const [d0, d1] = domainOf(sh.fn, sh.fp);
      const areaFill = th().dark ? mixColor(c.area, th().bg, 0.45) : mixColor(c.area, '#ffffff', 0.62);
      const discFill = th().dark ? mixColor(c.body, th().bg, 0.4) : mixColor(c.body, '#ffffff', 0.6);
      const polyTop: [number, number][] = [];
      const polyBot: [number, number][] = [];
      for (const q of segs) {
        polyTop.push([toX(q.s0), q.r0], [toX(q.s1), q.r1]);
        polyBot.push([toX(q.s0), -q.r0], [toX(q.s1), -q.r1]);
      }
      if (polyTop.length) {
        const top: [number, number][] = [[toX(0), 0], ...polyTop, [toX(1), 0]];
        const bot: [number, number][] = [[toX(0), 0], ...polyBot, [toX(1), 0]];
        const fill = sh.list ? discFill : areaFill;
        plot.polygon(top, { fill, alpha: 0.85 });
        plot.polygon(bot, { fill, alpha: 0.32 });
        if (sh.list) {
          // Umrisse der Rechtecke
          const edge = mixColor(c.body, th().bg, 0.15, 0.8);
          for (const q of segs) {
            if (q.capL) plot.segment([toX(q.s0), 0], [toX(q.s0), q.r0], { color: edge, width: 1 });
            if (q.capR) plot.segment([toX(q.s1), 0], [toX(q.s1), q.r1], { color: edge, width: 1 });
          }
          plot.polyline(polyTop, { color: edge, width: 1.4 });
        }
      }
      const f = (x: number) => fValue(sh.fn, sh.fp, x);
      const lo = Math.max(d0, x0);
      const hi = Math.min(d1, x1);
      if (sh.fn === 'kugel' || sh.fn === 'sin') {
        plot.parametric((t) => t, f, lo, hi, { color: mixColor(c.area, th().bg, 0.5), width: 1.6, samples: 160 });
      } else plot.fn(f, { color: mixColor(c.area, th().bg, 0.5), width: 1.6, from: lo, to: hi });
      plot.parametric((t) => t, (t) => -radiusAt(sh.fn, sh.fp, t), sh.a, sh.b, { color: mixColor(c.area, th().bg, 0.4), width: 1.4, dash: [5, 4], samples: 160 });
      plot.parametric((t) => t, f, sh.a, sh.b, { color: edgeOf(c.area, th().dark ? -0.6 : 0.2), width: 3, samples: 200 });
      plot.axes();
      // Grenzen
      for (const [x, name] of [
        [sh.a, 'a'],
        [sh.b, 'b'],
      ] as const) {
        plot.segment([x, y0], [x, y1], { color: c.lim, width: 1.3, dash: [5, 4], alpha: 0.8 });
        plot.text(x, y1, name, { color: c.lim, math: true, size: 14, weight: 'bold', offset: [x === sh.a ? -8 : 8, 10] });
      }
      // Querschnitt
      if (p.sec) {
        const xs = Math.max(sh.a, Math.min(sh.b, xsF.v));
        const rr = radiusAt(sh.fn, sh.fp, xs);
        plot.segment([xs, -rr], [xs, rr], { color: c.sec, width: 3 });
        plot.text(xs, -rr, 'x', { color: c.sec, math: true, size: 14, weight: 'bold', offset: [0, 14] });
      }
      // Drehpfeil um die x-Achse
      const ax = plot.px(Math.min(x1, B + 0.08 * len)) + 2;
      const ay = plot.py(0);
      if (ax < pr.x + pr.w - 12) {
        g.save();
        g.strokeStyle = c.area;
        g.lineWidth = 1.8;
        g.beginPath();
        g.ellipse(ax, ay, 5, 11, 0, -Math.PI * 0.35, Math.PI * 1.25);
        g.stroke();
        const tA = Math.PI * 1.25;
        const ex = ax + 5 * Math.cos(tA);
        const ey = ay + 11 * Math.sin(tA);
        g.fillStyle = c.area;
        g.beginPath();
        g.moveTo(ex - 4, ey + 1);
        g.lineTo(ex + 3, ey - 3);
        g.lineTo(ex + 2, ey + 4);
        g.closePath();
        g.fill();
        g.restore();
      }
      g.restore();
      plot.end();
    }

    /* ---------- Ergebnisse (Text) ---------- */

    function updateReadouts(): void {
      const sh = shape;
      const de = ctx.lang === 'de';
      const ks = knownSolid(sh.fn, sh.fp, sh.a, sh.b);
      const V = volume(sh.fn, sh.fp, sh.a, sh.b);
      ctx.readout('f', { html: `${toHtml(`f(x) = ${fTerm(sh)}`)}, ${toHtml(`${limText(sh.a)} ≤ x ≤ ${limText(sh.b)}`)} → <strong>${solidName(ks)}</strong>` });
      if (p.sec) {
        const x = xsEff();
        const fx = radiusAt(sh.fn, sh.fp, x);
        ctx.readout('A', { html: `${toHtml('A(x) = π · (f(x))²')}: ${toHtml(`A(${num(x)}) = π · ${num(fx, 3)}²`)} ≈ <strong>${num(crossSection(sh.fn, sh.fp, x))}</strong>` });
      } else ctx.readout('A', null);
      const ex = exactText(V);
      ctx.readout('V', { html: `${toHtml(`V = π \\i{${limText(sh.a)}}{${limText(sh.b)}}${f2Wrapped(sh)}\\t{d}x`)} ${ex ? `= ${toHtml(ex)} ` : ''}≈ <strong>${num(V)}</strong>` });
      if (sh.list) {
        const S = discSum(sh.list);
        const dx = (sh.b - sh.a) / sh.list.length;
        const kindTxt = de ? { mid: 'Radius in der Mitte', lower: 'innere Scheiben', upper: 'äußere Scheiben' } : { mid: 'radius at the midpoint', lower: 'inner discs', upper: 'outer discs' };
        const dev = V > 1e-9 ? ((S - V) / V) * 100 : 0;
        ctx.readout('S', {
          html: `${sh.list.length} ${de ? 'Scheiben' : 'discs'} (${kindTxt[p.pt as DiscKind]}), Δ<var>x</var> = ${num(dx, 3)}: <var>V</var><sub>${sh.list.length}</sub> = Σ π<var>r</var><sub><var>i</var></sub>² · Δ<var>x</var> ≈ <strong>${num(S)}</strong>${Math.abs(dev) >= 0.05 ? ` (${dev > 0 ? '+' : '−'}${num(Math.abs(dev), 1)} %)` : ''}`,
        });
      } else ctx.readout('S', { html: de ? 'unendlich viele, unendlich dünne Scheiben: Die Summe wird zum Integral.' : 'infinitely many, infinitely thin discs: the sum becomes the integral.' });
      const sf = solidFormula(ks);
      if (sf && ks.volume !== null) ctx.readout('K', { html: `${solidName(ks)}: ${toHtml(`V = ${sf.f} = ${sf.filled}`)} ≈ <strong>${num(ks.volume)}</strong> ✓` });
      else if (ks.name === 'horn') {
        const lim = hornLimit(sh.fp, sh.a);
        ctx.readout('K', { html: `${de ? 'Für' : 'For'} <var>b</var> → ∞: <var>V</var> → ${toHtml('\\f{πk²}{a}')} ≈ <strong>${num(lim)}</strong> (${de ? 'endlich, obwohl das Horn unendlich lang ist' : 'finite although the horn is infinitely long'})` });
      } else ctx.readout('K', ctx.t('noFormula'));
    }

    function syncActions(): void {
      ctx.setAction('disc', { label: ctx.t(shape.list ? 'smoothen' : 'disc') });
      ctx.setAction('double', { enabled: !!shape.list && shape.list.length < 64 });
    }

    /* ---------- Bild ---------- */

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const rm = reduced();
      const dragging = now - lastHandle < 350;
      let anim = false;

      // Drehwinkel
      let Phi: number;
      if (spin) {
        const t = (now - spin.t0) / spin.dur;
        if (t >= 1) {
          phiF.v = spin.to;
          spin = null;
          Phi = phiF.v;
        } else Phi = lerp(spin.from, spin.to, ease.inOutCubic(clamp01(t)));
        anim = true;
      } else {
        anim = phiF.step(p.phi, dt, rm ? 0 : 0.22) || anim;
        Phi = phiF.v;
      }
      const PhiRad = (Math.max(0, Math.min(360, Phi)) * Math.PI) / 180;
      anim = xsF.step(xsEff(), dt, rm ? 0 : dragging ? 0.04 : 0.18) || anim;
      anim = cutF.step(p.sec ? 1 : 0, dt, rm ? 0 : 0.22) || anim;
      const sepGoal = p.sep && shape.list ? 1 : 0;
      if (sepT !== sepGoal) {
        if (rm) sepT = sepGoal;
        else sepT = sepGoal > sepT ? Math.min(1, sepT + dt / 1.1) : Math.max(0, sepT - dt / 1.1);
        anim = true;
      }
      if (intro && now - intro.t0 > 700) intro = null;

      const sh = shape;
      const V = volume(sh.fn, sh.fp, sh.a, sh.b);
      anim = nums.V.step(V, dt, rm ? 0 : 0.3) || anim;
      anim = nums.S.step(sh.list ? discSum(sh.list) : V, dt, rm ? 0 : 0.3) || anim;
      anim = nums.A.step(crossSection(sh.fn, sh.fp, Math.max(sh.a, Math.min(sh.b, xsF.v))), dt, 0) || anim;

      // Bildausschnitt weich nachführen
      const goal = goalFrame();
      if (!frame) frame = goal;
      if (!dragging) {
        const k = rm ? 1 : 1 - Math.exp(-dt / 0.32);
        frame = { target: vec3.lerp(frame.target, goal.target, k), radius: frame.radius + (goal.radius - frame.radius) * k, R: frame.R + (goal.R - frame.R) * k };
        if (vec3.distance(frame.target, goal.target) > 0.003 || Math.abs(frame.radius - goal.radius) > 0.003 || Math.abs(frame.R - goal.R) > 0.003) anim = true;
      } else anim = true;
      view.setScene({ target: frame.target, radius: frame.radius, anchor: [0.5, narrow() ? 0.52 : 0.5] });

      const built = buildSegs(now);
      segsCache = built.segs;
      if (built.anim) anim = true;
      const cutSeg = segsCache.find((q) => q.capR === 2);
      cutWorld = cutSeg ? [0, cutSeg.x1, Math.max(0.05, cutSeg.r1)] : [0, xsF.v, 0];

      const g = surface.begin();
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      plot.resize();
      view.begin();
      drawScene(segsCache, PhiRad);
      drawOverlays(segsCache, PhiRad);
      view.end();
      drawChart(segsCache, built.A, built.B);
      const { title, lines } = cardLines();
      drawCard(rects().card, title, lines);
      if (anim || spin || intro) ctx.requestRender();
    }

    /* ---------- Aktionen ---------- */

    function startSpin(delay = 0, dur = 3200): void {
      if (reduced()) return;
      spin = { t0: performance.now() + delay, from: 0, to: p.phi > 0 ? p.phi : 360, dur };
      ctx.requestRender();
    }

    if (!reduced()) {
      intro = { t0: performance.now() };
      spin = { t0: performance.now() + 450, from: 0, to: p.phi, dur: 2800 };
      view.setCamera({ azimuth: 8, elevation: 8 });
      view.animateTo(VIEW0, 3200);
    }

    return {
      update(changed, source) {
        if (source === 'input') {
          if (changed.has('fn')) {
            const fn = p.fn as FnId;
            const [a, b] = startInterval(fn, fparams());
            const xs = Math.round((a + (b - a) * 0.62) * 20) / 20;
            ctx.set({ a, b: fn === 'sin' ? 3.15 : b, xs });
          }
          if (changed.has('r') && p.fn === 'kugel') {
            const wasFull = p.a <= -lastR + 1e-9 && p.b >= lastR - 1e-9;
            if (wasFull) ctx.set({ a: -p.r, b: p.r });
            else ctx.set({ a: Math.max(-p.r, p.a), b: Math.min(p.r, p.b) });
          }
          if ((changed.has('a') || changed.has('b')) && !changed.has('fn')) {
            const [a, b] = effectiveInterval(p.fn as FnId, fparams(), p.a, p.b);
            if (p.xs < a || p.xs > b) ctx.set({ xs: Math.max(a, Math.min(b, p.xs)) });
          }
        }
        lastR = p.r;
        const keys = ['fn', 'r', 'm', 'c', 'k', 'a', 'b', 'n', 'pt'];
        const shapeChanged = keys.some((k) => changed.has(k));
        if (shapeChanged && source !== 'init') {
          const handle = performance.now() - lastHandle < 350;
          if (handle) startMorph(220, 120);
          else if (changed.has('fn') || source === 'replace') startMorph(900, 500);
          else if (changed.has('n') || changed.has('pt')) startMorph(560, 420);
          else startMorph(380, 200);
        }
        shape = makeShape();
        if (source === 'replace') {
          view.setInitialView(VIEW0);
          view.animateTo(VIEW0, 1100);
          if (changed.has('phi') || changed.has('fn')) startSpin(150, 2600);
        }
        syncActions();
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'spin') {
          if (p.phi < 360) ctx.set({ phi: 360 });
          startSpin(0, 3200);
        } else if (id === 'disc') ctx.set({ n: shape.list ? N_INF : 8 });
        else if (id === 'double' && shape.list) ctx.set({ n: Math.min(64, shape.list.length * 2) });
      },

      resetView: () => view.resetView(true),

      render,

      destroy: () => surface.destroy(),
    };
  },
});
