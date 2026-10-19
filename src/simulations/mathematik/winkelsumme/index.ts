import { defineSimulation, ease, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  angleSum,
  classify,
  crossings,
  direction,
  distToLine,
  exteriorAngles,
  formatPoints,
  GRID_H,
  GRID_W,
  hasDuplicate,
  interiorAngles,
  isRegular,
  N_MAX,
  N_MIN,
  orientation,
  parsePoints,
  regularExterior,
  regularInterior,
  regularOnGrid,
  resample,
  roundToSum,
  sum,
  triangleCount,
  triangulate,
  type Pt,
  type Shape,
  type Triangulation,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Lang = 'de' | 'en';
type Loc = { de: string; en: string };
type Mode = 'tri' | 'poly';
type XY = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const rad = (d: number) => (d * Math.PI) / 180;
const isMode = (m: Mode) => (v: Record<string, unknown>) => v.mode === m;
/** Rand des Karopapiers um den Koordinatenbereich (in Kästchen). */
const M = 1;
const GREEK = ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ'] as const;
const NAMES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'] as const;
const NGON: Loc[] = [
  L('Dreieck', 'triangle'),
  L('Viereck', 'quadrilateral'),
  L('Fünfeck', 'pentagon'),
  L('Sechseck', 'hexagon'),
  L('Siebeneck', 'heptagon'),
  L('Achteck', 'octagon'),
  L('Neuneck', 'nonagon'),
  L('Zehneck', 'decagon'),
];
const NGON_IN: Loc[] = [
  L('im Dreieck', 'in a triangle'),
  L('im Viereck', 'in a quadrilateral'),
  L('im Fünfeck', 'in a pentagon'),
  L('im Sechseck', 'in a hexagon'),
  L('im Siebeneck', 'in a heptagon'),
  L('im Achteck', 'in an octagon'),
  L('im Neuneck', 'in a nonagon'),
  L('im Zehneck', 'in a decagon'),
];
const DEFAULT_PTS = '2.5,2;10,1;14,4.5;9.5,9;3,7';
const CONCAVE6 = '2,1;14,1;14,9;8,5.5;2,9;4,5';
const REGULAR8 = formatPoints(regularOnGrid(8));

/** Schritte der beiden Begründungen im Dreieck. */
const TEAR_STEPS: Loc[] = [
  L('Die drei Ecken abreißen.', 'Tear off the three corners.'),
  L('α und β an die Ecke C legen (halbe Drehung um die Seitenmitte).', 'Move α and β to corner C (a half turn about the midpoint of the side).'),
  L('Zusammen bilden sie einen gestreckten Winkel: 180°.', 'Together they form a straight angle: 180°.'),
];
const PROOF_STEPS: Loc[] = [
  L('Parallele g zu [AB] durch C zeichnen.', 'Draw the parallel g to AB through C.'),
  L('α′ = α (Wechselwinkel an Parallelen)', 'α′ = α (alternate angles at parallels)'),
  L('β′ = β (Wechselwinkel an Parallelen)', 'β′ = β (alternate angles at parallels)'),
  L('α′ + γ + β′ = 180° (gestreckter Winkel an g), also α + β + γ = 180°.', 'α′ + γ + β′ = 180° (straight angle at g), so α + β + γ = 180°.'),
];
const PROOF_AT = [0.2, 0.45, 0.7, 0.97];
const TEAR_AT = [0.15, 0.8, 0.97];

interface Hit {
  id: string;
  r: Rect;
}

type Drag = { kind: 'vertex'; i: number } | { kind: 'body'; start: XY; orig: Pt[] } | null;

/** Fortschritt 0 … 1, der mit fester Geschwindigkeit zu einem Ziel läuft. */
class Prog {
  v = 0;
  to = 0;
  private last = 0;
  constructor(
    public ms: number,
    private readonly instant: boolean,
  ) {}
  go(to: number, ms?: number): void {
    if (ms !== undefined) this.ms = ms;
    this.to = to;
    this.last = performance.now();
    if (this.instant) this.v = to;
  }
  set(v: number): void {
    this.v = v;
    this.to = v;
  }
  step(now: number): void {
    const dt = Math.min(80, now - this.last);
    this.last = now;
    if (this.v === this.to) return;
    const d = dt / Math.max(1, this.ms);
    this.v = this.to > this.v ? Math.min(this.to, this.v + d) : Math.max(this.to, this.v - d);
  }
  get busy(): boolean {
    return this.v !== this.to;
  }
}

/**
 * Innenwinkelsumme: ein Dreieck mit ziehbaren Ecken, dessen Winkel man
 * abreißen und an einer Geraden zusammenlegen kann, ein Beweis mit der
 * Parallelen (Wechselwinkel) und Vielecke mit 3 bis 10 Ecken, die sich in
 * n − 2 Dreiecke zerlegen lassen. Dazu Außenwinkel und das Umrunden eines
 * Vielecks (eine volle Drehung, 360°).
 */
export default defineSimulation({
  id: 'winkelsumme',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.6 },
  groups: [
    { id: 'pts', label: L('Ecken (in Kästchen)', 'Corners (in grid squares)') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Figur', 'Shape'),
      options: [
        { value: 'tri', label: L('Dreieck', 'Triangle') },
        { value: 'poly', label: L('Vieleck', 'Polygon') },
      ],
      default: 'tri',
    },
    { key: 'n', type: 'number', label: L('Anzahl der Ecken n', 'Number of corners n'), min: N_MIN, max: N_MAX, step: 1, default: 5, help: L('Neues n: Es entsteht ein regelmäßiges n-Eck. Dann die Ecken ziehen.', 'A new n gives a regular n-gon. Then drag the corners.'), visibleIf: isMode('poly') },
    { key: 'ax', type: 'number', group: 'pts', label: L('A: nach rechts', 'A: right'), min: 0, max: GRID_W, step: 0.5, default: 2, visibleIf: isMode('tri') },
    { key: 'ay', type: 'number', group: 'pts', label: L('A: nach oben', 'A: up'), min: 0, max: GRID_H, step: 0.5, default: 1.5, visibleIf: isMode('tri') },
    { key: 'bx', type: 'number', group: 'pts', label: L('B: nach rechts', 'B: right'), min: 0, max: GRID_W, step: 0.5, default: 13.5, visibleIf: isMode('tri') },
    { key: 'by', type: 'number', group: 'pts', label: L('B: nach oben', 'B: up'), min: 0, max: GRID_H, step: 0.5, default: 2.5, visibleIf: isMode('tri') },
    { key: 'cx', type: 'number', group: 'pts', label: L('C: nach rechts', 'C: right'), min: 0, max: GRID_W, step: 0.5, default: 8, visibleIf: isMode('tri') },
    { key: 'cy', type: 'number', group: 'pts', label: L('C: nach oben', 'C: up'), min: 0, max: GRID_H, step: 0.5, default: 9, visibleIf: isMode('tri') },
    {
      key: 'pts',
      type: 'text',
      group: 'pts',
      label: L('Ecken x,y; x,y; …', 'Corners x,y; x,y; …'),
      default: DEFAULT_PTS,
      maxLength: 200,
      placeholder: L('z. B. 2,1;14,1;8,9', 'e.g. 2,1;14,1;8,9'),
      help: L('Einfacher: die Ecken im Bild ziehen. 0 ≤ x ≤ 16, 0 ≤ y ≤ 10, Dezimalpunkt.', 'Easier: drag the corners in the picture. 0 ≤ x ≤ 16, 0 ≤ y ≤ 10, decimal point.'),
      visibleIf: isMode('poly'),
    },
    { key: 'ext', type: 'boolean', label: L('Außenwinkel', 'Exterior angles'), help: L('Verlängert jede Seite und zeigt den Winkel, um den man an der Ecke abbiegt.', 'Extends each side and shows the angle you turn through at the corner.'), default: false },
    { key: 'vals', type: 'boolean', group: 'view', label: L('Winkelgrößen anzeigen', 'Show the sizes of the angles'), help: L('Ausgeschaltet zum Schätzen und Nachrechnen.', 'Switch off to estimate and calculate.'), default: true },
  ],
  actions: [
    { id: 'tear', label: L('Ecken abreißen', 'Tear off the corners'), primary: true, visibleIf: isMode('tri') },
    { id: 'proof', label: L('Beweis mit Parallele', 'Proof with a parallel'), visibleIf: isMode('tri') },
    { id: 'split', label: L('In Dreiecke zerlegen', 'Split into triangles'), primary: true, visibleIf: isMode('poly') },
    { id: 'regular', label: L('Regelmäßiges n-Eck', 'Regular n-gon'), visibleIf: isMode('poly') },
    { id: 'walk', label: L('Umrunden', 'Walk around'), visibleIf: (v) => v.ext === true },
  ],
  readouts: [
    { key: 'angles', label: L('Innenwinkel', 'Interior angles'), spoiler: true },
    { key: 'sum', label: L('Winkelsumme', 'Angle sum'), spoiler: true },
    { key: 'ext', label: L('Außenwinkel', 'Exterior angles'), spoiler: true },
    { key: 'shape', label: L('Art des Vielecks', 'Type of polygon') },
  ],
  presets: [
    { id: 'start', label: L('Dreieck', 'Triangle'), values: {} },
    { id: 'recht', label: L('Rechtwinkliges Dreieck', 'Right-angled triangle'), values: { ax: 3, ay: 2, bx: 11, by: 2, cx: 3, cy: 8 } },
    { id: 'stumpf', label: L('Stumpfes Dreieck mit Außenwinkeln', 'Obtuse triangle with exterior angles'), values: { ax: 1, ay: 2, bx: 15, by: 2, cx: 5, cy: 6, ext: true } },
    { id: 'fuenf', label: L('Fünfeck zerlegen', 'Splitting a pentagon'), values: { mode: 'poly' } },
    { id: 'konkav', label: L('Nicht konvexes Sechseck', 'Non-convex hexagon'), values: { mode: 'poly', n: 6, pts: CONCAVE6 } },
    { id: 'acht', label: L('Regelmäßiges Achteck umrunden', 'Walking around a regular octagon'), values: { mode: 'poly', n: 8, pts: REGULAR8, ext: true } },
  ],
  strings: {
    de: {
      canvas:
        'Karopapier mit einem Dreieck bzw. Vieleck, dessen Ecken man ziehen kann. Die Innenwinkel sind farbig markiert; man kann die Ecken des Dreiecks abreißen und an einer Geraden zusammenlegen, den Beweis mit einer Parallelen ansehen, Vielecke in Dreiecke zerlegen und die Außenwinkel beim Umrunden verfolgen. Daneben Karten mit der Winkelsumme und einer Tabelle.',
    },
    en: {
      canvas:
        'Squared paper with a triangle or polygon whose corners can be dragged. The interior angles are colour-coded; the corners of the triangle can be torn off and put together along a straight line, a proof with a parallel line can be shown, polygons can be split into triangles and the exterior angles followed while walking around. Next to it cards with the angle sum and a table.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const lang = ctx.lang as Lang;
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const reduced = prefersReducedMotion();
    const mode = () => p.mode as Mode;
    const onColor = () => (ctx.theme.dark ? '#10161f' : '#ffffff');
    /** Farben α, β, γ (und die Dreiecke der Zerlegung). */
    const angColor = (i: number) => {
      const s = ctx.theme.series;
      return [s[0]!, s[3]!, s[2]!, s[4]!, s[5]!, s[1]!][i % 6]!;
    };
    const extColor = () => ctx.theme.series[4]!;
    const warnColor = () => ctx.theme.series[1]!;
    const parColor = () => ctx.theme.series[5]!;

    /* ---------------- Zustand ---------------- */
    const triFromParams = (): Pt[] => [
      [p.ax, p.ay],
      [p.bx, p.by],
      [p.cx, p.cy],
    ];
    let polyCache: { key: string; pts: Pt[] } | null = null;
    function polyFromParams(): Pt[] {
      const key = `${p.pts}|${p.n}`;
      if (polyCache?.key !== key) polyCache = { key, pts: parsePoints(p.pts) ?? regularOnGrid(p.n) };
      return polyCache.pts;
    }
    const target = (): Pt[] => (mode() === 'tri' ? triFromParams() : polyFromParams());

    // Übergang der Figur (Beispiel laden, regelmäßiges n-Eck, neues n)
    const morph = new Tween(750, ease.inOutCubic);
    let morphFrom: Pt[] = target();
    let lastShown: Pt[] = target();
    function shown(): Pt[] {
      const to = target();
      if (!morph.running) return to;
      const from = morphFrom.length === to.length ? morphFrom : resample(morphFrom, to.length);
      const t = morph.value;
      return to.map((q, i) => [from[i]![0] + (q[0] - from[i]![0]) * t, from[i]![1] + (q[1] - from[i]![1]) * t] as Pt);
    }
    function beginMorph(): void {
      if (reduced) return;
      morphFrom = lastShown;
      morph.play();
    }

    // Abläufe
    const tear = new Prog(2600, reduced);
    const proof = new Prog(5200, reduced);
    const split = new Prog(3000, reduced);
    const walk = new Prog(6000, reduced);
    const intro = new Prog(1500, reduced);
    const rowPop = new Tween(450, ease.outBack);
    let toast: { text: string; until: number } | null = null;

    // weich mitzählende Winkelgrößen
    let disp: number[] = [];
    let lastFrame = performance.now();

    let triCache: { key: string; tri: Triangulation | null } | null = null;
    function triangulation(): Triangulation | null {
      const key = formatPoints(target(), 4);
      if (triCache?.key !== key) triCache = { key, tri: triangulate(target(), 0) };
      return triCache.tri;
    }

    let hits: Hit[] = [];
    let hover: string | null = null;
    let drag: Drag = null;

    function startIntro(): void {
      intro.set(0);
      intro.go(1, 1500);
      disp = [];
    }

    function resetStories(): void {
      tear.set(0);
      proof.set(0);
      split.set(0);
      walk.set(0);
    }

    /* ---------------- Aufteilung ---------------- */
    interface Lay {
      wide: boolean;
      big: boolean;
      paper: Rect;
      cell: number;
      panel: Rect;
    }
    let layCache: { key: string; lay: Lay } | null = null;
    function layout(): Lay {
      const key = `${surface.width}x${surface.height}`;
      if (layCache?.key !== key) layCache = { key, lay: computeLayout() };
      return layCache.lay;
    }
    function computeLayout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const cols = GRID_W + 2 * M;
      const rows = GRID_H + 2 * M;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.31, 205, 330));
        const sw = W - pw - 12;
        const cell = Math.min((sw - 4) / cols, (H - 4) / rows);
        const w = Math.floor(cols * cell);
        const h = Math.floor(rows * cell);
        return { wide, big: W >= 640 && H >= 360, paper: { x: Math.round((sw - w) / 2) + 2, y: Math.round((H - h) / 2), w, h }, cell, panel: { x: W - pw, y: 2, w: pw - 2, h: H - 4 } };
      }
      const cell = (W - 4) / cols;
      const w = Math.floor(cols * cell);
      const h = Math.floor(rows * cell);
      return { wide, big: false, paper: { x: 2, y: 2, w, h }, cell, panel: { x: 2, y: h + 10, w: W - 4, h: H - h - 12 } };
    }

    function toPx(q: Pt): XY {
      const { paper, cell } = layout();
      return [paper.x + (q[0] + M) * cell, paper.y + (GRID_H + M - q[1]) * cell];
    }
    function toWorld(px: number, py: number): XY {
      const { paper, cell } = layout();
      return [(px - paper.x) / cell - M, GRID_H + M - (py - paper.y) / cell];
    }
    /** Punkt im Abstand r (Pixel) in Weltrichtung d (Grad, gegen den Uhrzeigersinn). */
    const polar = (o: XY, d: number, r: number): XY => [o[0] + r * Math.cos(rad(d)), o[1] - r * Math.sin(rad(d))];

    /* ---------------- Zahlen ---------------- */
    const deg = (v: number, dec = 1) => `${fmt.num(v, dec)}°`;
    /** „=“ bei ganzzahligen bzw. exakt darstellbaren Werten, sonst „≈“. */
    const eq = (exact: number, shownVal: number) => (Math.abs(exact - shownVal) < 1e-6 ? '=' : '≈');

    function exactAngles(): number[] | null {
      return interiorAngles(target());
    }

    /** Gerundete Innenwinkel (Summe passend), bei regelmäßigen Vielecken exakt. */
    function roundedAngles(a: number[]): number[] {
      const n = a.length;
      if (isRegular(target())) return a.map(() => regularInterior(n));
      return roundToSum(a, 1, angleSum(n));
    }

    function updateReadouts(): void {
      const P = target();
      const n = P.length;
      const a = interiorAngles(P);
      const names = mode() === 'tri' ? ['α', 'β', 'γ'] : GREEK.slice(0, n);
      if (a) {
        const r = roundedAngles(a);
        ctx.readout('angles', names.map((g, i) => `${g} ${eq(a[i]!, r[i]!)} ${deg(r[i]!)}`).join(', '));
        if (mode() === 'tri') ctx.readout('sum', { html: '<var>α</var> + <var>β</var> + <var>γ</var> = 180°' });
        else ctx.readout('sum', { html: `(<var>n</var> − 2) · 180° = (${n} − 2) · 180° = <strong>${fmt.num(angleSum(n), 0)}°</strong>` });
      } else {
        ctx.readout('angles', null);
        ctx.readout('sum', tt('Kein einfaches Vieleck – die Seiten überkreuzen sich.', 'Not a simple polygon – the sides cross.'));
      }
      const e = exteriorAngles(P);
      if (p.ext && e) {
        if (mode() === 'tri' && a) {
          const r = roundToSum(e, 1, 360);
          const parts = [0, 1, 2].map((i) => `${names[i]}* = ${names[(i + 1) % 3]} + ${names[(i + 2) % 3]} ${eq(e[i]!, r[i]!)} ${deg(r[i]!)}`);
          ctx.readout('ext', `${parts.join('; ')}; α* + β* + γ* = 360°`);
        } else {
          ctx.readout('ext', tt(`Summe der Außenwinkel: 360° (regelmäßig: 360° : ${n} = ${deg(regularExterior(n))})`, `Sum of the exterior angles: 360° (regular: 360° : ${n} = ${deg(regularExterior(n))})`));
        }
      } else ctx.readout('ext', null);
      if (mode() === 'poly') ctx.readout('shape', shapeText(classify(P), P));
      else ctx.readout('shape', null);
    }

    function shapeText(s: Shape, P: Pt[]): string {
      if (s === 'convex') return isRegular(P) ? tt('regelmäßig und konvex', 'regular and convex') : tt('konvex – alle Innenwinkel kleiner als 180°', 'convex – all interior angles less than 180°');
      if (s === 'concave') {
        const a = interiorAngles(P)!;
        const list = a.map((v, i) => (v > 180 + 1e-7 ? NAMES[i] : '')).filter(Boolean).join(', ');
        return tt(`nicht konvex – einspringende Ecke bei ${list}`, `not convex – reflex corner at ${list}`);
      }
      if (s === 'crossed') return tt('überschlagen – die Seiten kreuzen sich', 'self-intersecting – the sides cross');
      return tt('entartet', 'degenerate');
    }

    function updateActions(): void {
      const P = target();
      const simple = interiorAngles(P) !== null;
      ctx.setAction('tear', { label: tt(tear.to === 1 ? 'Ecken zurücklegen' : 'Ecken abreißen', tear.to === 1 ? 'Put the corners back' : 'Tear off the corners'), enabled: !ctx.locked });
      ctx.setAction('proof', { label: tt(proof.to === 1 ? 'Parallele ausblenden' : 'Beweis mit Parallele', proof.to === 1 ? 'Hide the parallel' : 'Proof with a parallel'), enabled: !ctx.locked });
      ctx.setAction('split', { label: tt(split.to === 1 ? 'Zerlegung ausblenden' : 'In Dreiecke zerlegen', split.to === 1 ? 'Hide the triangles' : 'Split into triangles'), enabled: !ctx.locked && simple });
      ctx.setAction('regular', { label: tt(`Regelmäßiges ${T(NGON[P.length - 3]!)}`, `Regular ${T(NGON[P.length - 3]!)}`), enabled: !ctx.locked });
      ctx.setAction('walk', { label: tt(walk.to === 1 && walk.busy ? 'Umrunden …' : 'Umrunden', walk.to === 1 && walk.busy ? 'Walking …' : 'Walk around'), enabled: !ctx.locked && simple });
    }

    function showToast(msg: string): void {
      toast = { text: msg, until: performance.now() + 1900 };
      ctx.requestRender();
    }

    /* ---------------- Zeichnen: Bausteine ---------------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      if (accent && tint > 0) {
        g.fillStyle = withAlpha(accent, theme.dark ? tint * 1.6 : tint);
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.fill();
      }
      g.strokeStyle = accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      str = str.replace(/ ([=+·:]) /g, ' $1 ').replace(/ (°|cm)/g, ' $1');
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    function textRows(rows: string[], x: number, y: number, lh: number, font: string, color: string): number {
      rows.forEach((row, i) => text(surface.g, row, x, y + i * lh, { font, color, align: 'left', baseline: 'middle' }));
      return rows.length * lh;
    }

    function title(x: number, y: number, label: string, color = ctx.theme.muted): void {
      text(surface.g, label, x, y, { font: `700 ${layout().big ? 12 : 11}px ${ctx.theme.font}`, color, align: 'left' });
    }

    function haloText(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', halo = 4): void {
      const g = surface.g;
      g.save();
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = halo;
      g.strokeStyle = ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }

    /** Text mit Halo, auf das Papier geklemmt. */
    function labelAt(str: string, x: number, y: number, font: string, color: string): void {
      const g = surface.g;
      const { paper } = layout();
      g.font = font;
      const w = g.measureText(str).width;
      haloText(str, clamp(x, paper.x + w / 2 + 4, paper.x + paper.w - w / 2 - 4), clamp(y, paper.y + 10, paper.y + paper.h - 10), font, color);
    }

    /** Kreisbogen um o von Weltrichtung `from` um `sweep` Grad (positiv = gegen den Uhrzeigersinn). */
    function arcPath(o: XY, r: number, from: number, sweep: number, sector: boolean): void {
      const g = surface.g;
      g.beginPath();
      if (sector) g.moveTo(o[0], o[1]);
      g.arc(o[0], o[1], r, -rad(from), -rad(from + sweep), sweep > 0);
      if (sector) g.closePath();
    }

    /** Winkelfeld (Sektor) mit Bogen; rechter Winkel mit Punkt. */
    function wedge(o: XY, r: number, from: number, sweep: number, color: string, fillA: number, lineW = 2.2, dot = false): void {
      const g = surface.g;
      if (Math.abs(sweep) < 0.05 || r < 1) return;
      arcPath(o, r, from, sweep, true);
      g.fillStyle = withAlpha(color, ctx.theme.dark ? fillA * 1.35 : fillA);
      g.fill();
      arcPath(o, r, from, sweep, false);
      g.strokeStyle = color;
      g.lineWidth = lineW;
      g.lineCap = 'round';
      g.stroke();
      if (dot) {
        const [dx, dy] = polar(o, from + sweep / 2, r * 0.5);
        g.beginPath();
        g.arc(dx, dy, 2.6, 0, Math.PI * 2);
        g.fillStyle = color;
        g.fill();
      }
    }

    function dashedLine(a: XY, b: XY, color: string, width: number, dash: number[]): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = color;
      g.lineWidth = width;
      g.setLineDash(dash);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(a[0], a[1]);
      g.lineTo(b[0], b[1]);
      g.stroke();
      g.restore();
    }

    /** Pfeilmarke (parallel) in der Mitte m, Richtung d (Pixel-Einheitsvektor). */
    function chevron(m: XY, d: XY, color: string, n = 1): void {
      const g = surface.g;
      const s = 6;
      const nx = -d[1];
      const ny = d[0];
      g.save();
      g.strokeStyle = color;
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (let k = 0; k < n; k++) {
        const off = (k - (n - 1) / 2) * 7;
        const tx = m[0] + d[0] * (off + s * 0.5);
        const ty = m[1] + d[1] * (off + s * 0.5);
        g.beginPath();
        g.moveTo(tx - d[0] * s + nx * s, ty - d[1] * s + ny * s);
        g.lineTo(tx, ty);
        g.lineTo(tx - d[0] * s - nx * s, ty - d[1] * s - ny * s);
        g.stroke();
      }
      g.restore();
    }

    const unit = (a: XY, b: XY): XY => {
      const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [(b[0] - a[0]) / l, (b[1] - a[1]) / l];
    };

    /* ---------------- Papier ---------------- */
    function drawPaper(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { paper: R, cell } = layout();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.clip();
      g.lineWidth = 1;
      for (const major of [false, true]) {
        g.strokeStyle = major ? withAlpha(theme.grid, 0.75) : theme.gridMinor;
        g.beginPath();
        for (let k = -M; k <= GRID_W + M; k++) {
          if ((k % 2 === 0) !== major) continue;
          const x = Math.round(R.x + (k + M) * cell) + 0.5;
          g.moveTo(x, R.y);
          g.lineTo(x, R.y + R.h);
        }
        for (let k = -M; k <= GRID_H + M; k++) {
          if ((k % 2 === 0) !== major) continue;
          const y = Math.round(R.y + (GRID_H + M - k) * cell) + 0.5;
          g.moveTo(R.x, y);
          g.lineTo(R.x + R.w, y);
        }
        g.stroke();
      }
      g.restore();
    }

    /* ---------------- Geometrie in Pixeln ---------------- */
    interface Corner {
      /** Weltrichtung, bei der das Winkelfeld beginnt, und seine Größe (gegen den Uhrzeigersinn). */
      from: number;
      sweep: number;
      /** Richtung der Winkelhalbierenden (ins Innere). */
      mid: number;
    }

    function corners(S: Pt[], ang: number[]): Corner[] {
      const n = S.length;
      const o = orientation(S) || 1;
      return S.map((q, i) => {
        const toNext = direction(q, S[(i + 1) % n]!);
        const toPrev = direction(q, S[(i + n - 1) % n]!);
        const from = o > 0 ? toNext : toPrev;
        const sweep = ang[i]!;
        return { from, sweep, mid: from + sweep / 2 };
      });
    }

    /** Radius der Winkelbögen an Ecke i (Pixel): passt zu den anliegenden Seiten. */
    function arcRadius(P: XY[], i: number, maxR: number): number {
      const n = P.length;
      const a = P[i]!;
      const l1 = Math.hypot(P[(i + 1) % n]![0] - a[0], P[(i + 1) % n]![1] - a[1]);
      const l2 = Math.hypot(P[(i + n - 1) % n]![0] - a[0], P[(i + n - 1) % n]![1] - a[1]);
      return clamp(Math.min(l1, l2) * 0.32, 10, maxR);
    }

    /** Umriss (mit Einstiegsanimation: die Seiten werden nacheinander gezeichnet). */
    function outlinePath(P: XY[], part: number): void {
      const g = surface.g;
      const n = P.length;
      const lens = P.map((q, i) => Math.hypot(P[(i + 1) % n]![0] - q[0], P[(i + 1) % n]![1] - q[1]));
      let rest = sum(lens) * part;
      g.beginPath();
      g.moveTo(P[0]![0], P[0]![1]);
      for (let i = 0; i < n && rest > 0; i++) {
        const a = P[i]!;
        const b = P[(i + 1) % n]!;
        const t = Math.min(1, rest / (lens[i]! || 1));
        g.lineTo(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t);
        rest -= lens[i]!;
      }
      if (part >= 1) g.closePath();
    }

    function fillPoly(P: XY[], color: string, alpha: number): void {
      const g = surface.g;
      const xs = P.map((q) => q[0]);
      const ys = P.map((q) => q[1]);
      const grad = g.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
      const a = ctx.theme.dark ? alpha * 1.4 : alpha;
      grad.addColorStop(0, withAlpha(color, a));
      grad.addColorStop(1, withAlpha(color, a * 0.4));
      g.save();
      g.beginPath();
      P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = grad;
      g.fill('evenodd');
      g.restore();
    }

    function strokeOutline(P: XY[], part: number): void {
      const g = surface.g;
      g.save();
      outlinePath(P, part);
      g.strokeStyle = ctx.theme.text;
      g.lineWidth = 2.8;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.stroke();
      g.restore();
    }

    /** Ecke als Punkt mit Griff und Namen außen (gegenüber dem Winkelfeld). */
    function drawVertex(P: XY[], i: number, outDir: number, alpha: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const [x, y] = P[i]!;
      const active = hover === `v${i}` || (drag?.kind === 'vertex' && drag.i === i);
      g.save();
      g.globalAlpha = alpha;
      if (canDrag()) {
        g.beginPath();
        g.arc(x, y, active ? 15 : 12, 0, Math.PI * 2);
        g.fillStyle = withAlpha(theme.series[0]!, active ? 0.28 : 0.13);
        g.fill();
      }
      g.beginPath();
      g.arc(x, y, 5, 0, Math.PI * 2);
      g.fillStyle = theme.bg;
      g.fill();
      g.strokeStyle = theme.text;
      g.lineWidth = 2.6;
      g.stroke();
      const d = layout().big ? 19 : 16;
      const [lx, ly] = polar([x, y], outDir, d);
      labelAt(NAMES[i]!, lx, ly, `800 ${layout().big ? 16 : 14}px ${theme.font}`, theme.text);
      g.restore();
    }

    /** Fortschritt des Einstiegs für Teil k von n (gestaffelt). */
    function introPart(k: number, n: number): number {
      const v = intro.v;
      const t0 = 0.32 + (0.45 * k) / Math.max(1, n);
      return ease.outBack(clamp((v - t0) / 0.3, 0, 1));
    }

    /* ---------------- Dreieck ---------------- */
    /** Gezackter Rand eines abgerissenen Papierstücks (fest, damit nichts flackert). */
    function jag(k: number, seed: number): number {
      const s = Math.sin(k * 12.9898 + seed * 78.233) * 43758.5453;
      return (s - Math.floor(s)) * 2 - 1;
    }

    /** Papierstück eines Winkels: Sektor mit gezacktem Bogen, Seitenstücke, Bogen und Name. */
    function piecePath(o: XY, r: number, c: Corner, seed: number): void {
      const g = surface.g;
      const steps = Math.max(5, Math.round((Math.abs(c.sweep) * Math.PI * r) / 180 / 5));
      g.beginPath();
      g.moveTo(o[0], o[1]);
      for (let k = 0; k <= steps; k++) {
        const d = c.from + (c.sweep * k) / steps;
        const rr = r * (1 + (k === 0 || k === steps ? 0 : 0.055 * jag(k, seed)));
        const [x, y] = polar(o, d, rr);
        g.lineTo(x, y);
      }
      g.closePath();
    }

    function drawPiece(o: XY, r: number, c: Corner, i: number, lift: number, name: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const col = angColor(i);
      const paperCol = theme.dark ? '#1c2534' : '#fffdf8';
      g.save();
      piecePath(o, r, c, i + 1);
      g.shadowColor = theme.dark ? `rgba(0,0,0,${0.35 + 0.3 * lift})` : `rgba(16,24,40,${0.08 + 0.16 * lift})`;
      g.shadowBlur = 3 + 14 * lift;
      g.shadowOffsetY = 1 + 6 * lift;
      g.fillStyle = paperCol;
      g.fill();
      g.restore();
      piecePath(o, r, c, i + 1);
      g.fillStyle = withAlpha(col, theme.dark ? 0.3 : 0.2);
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.22);
      g.lineWidth = 1;
      g.stroke();
      // Stücke der Dreiecksseiten
      g.save();
      g.strokeStyle = theme.text;
      g.lineWidth = 2.8;
      g.lineCap = 'round';
      g.beginPath();
      const [x1, y1] = polar(o, c.from, r * 0.97);
      const [x2, y2] = polar(o, c.from + c.sweep, r * 0.97);
      g.moveTo(x1, y1);
      g.lineTo(o[0], o[1]);
      g.lineTo(x2, y2);
      g.stroke();
      g.restore();
      arcPath(o, r * 0.56, c.from, c.sweep, false);
      g.strokeStyle = col;
      g.lineWidth = 2.4;
      g.stroke();
      const lr = clamp(r * 0.78, 0, r - 7);
      const [lx, ly] = polar(o, c.mid, Math.max(lr, 14 / Math.max(0.25, Math.sin(rad(Math.min(89, c.sweep / 2))))));
      text(g, name, lx, ly, { font: `italic 700 ${layout().big ? 17 : 14}px ${theme.mathFont}`, color: col });
    }

    /** Gemeinsamer Radius der Winkelstücke: Sie müssen ganz ins Dreieck passen. */
    function pieceRadius(P: XY[]): number {
      const h = [0, 1, 2].map((i) => distToLine(P[i]!, P[(i + 1) % 3]!, P[(i + 2) % 3]!));
      return clamp(Math.min(...h) * 0.8, 12, layout().big ? 70 : 50);
    }

    function drawTriangle(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const S = shown();
      const P = S.map(toPx);
      const ang = interiorAngles(S);
      const big = layout().big;
      const iv = intro.v;
      const draw = reduced ? 1 : ease.inOutCubic(clamp(iv / 0.45, 0, 1));
      const tv = tear.v;
      const pv = proof.v;

      fillPoly(P, theme.series[0]!, 0.11 * draw);
      if (!ang) {
        strokeOutline(P, draw);
        for (let i = 0; i < 3; i++) drawVertex(P, i, 0, 1);
        return;
      }
      const C = corners(S, ang);
      const r = pieceRadius(P);
      const lift = (t: number) => Math.sin(Math.PI * clamp(t, 0, 1));

      // Parallele g durch C (Beweis) bzw. Gerade beim Zusammenlegen
      const gStrength = Math.max(clamp((pv - 0.02) / 0.18, 0, 1), clamp((tv - 0.86) / 0.12, 0, 1));
      const dAB = unit(P[0]!, P[1]!);
      if (gStrength > 0) {
        const L = Math.max(layout().paper.w, layout().paper.h) * 1.5 * ease.inOutCubic(gStrength);
        const c = P[2]!;
        const col = pv > 0 ? parColor() : withAlpha(theme.text, 0.55);
        dashedLine([c[0] - dAB[0] * L, c[1] - dAB[1] * L], [c[0] + dAB[0] * L, c[1] + dAB[1] * L], col, pv > 0 ? 2.4 : 1.8, pv > 0 ? [] : [8, 6]);
      }

      // Hinterlegung der Winkelfelder (Löcher beim Abreißen)
      const torn = tv > 0.001;
      for (let i = 0; i < 3; i++) {
        const o = P[i]!;
        const c = C[i]!;
        if (torn) {
          const hole = clamp(tv / 0.12, 0, 1);
          g.save();
          g.globalAlpha = hole;
          piecePath(o, r, c, i + 1);
          g.fillStyle = theme.bg;
          g.fill();
          g.setLineDash([4, 4]);
          g.strokeStyle = withAlpha(angColor(i), 0.6);
          g.lineWidth = 1.3;
          g.stroke();
          g.restore();
        }
      }

      strokeOutline(P, draw);

      // Winkelfelder (nicht abgerissen)
      if (!torn) {
        for (let i = 0; i < 3; i++) {
          const k = introPart(i, 3);
          if (k <= 0) continue;
          const c = C[i]!;
          const right = Math.abs(ang[i]! - 90) < 1e-6;
          const pulse = pv > 0 ? highlight(pv, i) : 0;
          wedge(P[i]!, r * 0.62 * k * (1 + 0.12 * pulse), c.from, c.sweep, angColor(i), 0.2 + 0.15 * pulse, 2.4 + pulse, right);
          angleLabel(P, i, c, r * 0.62, k);
        }
      }

      // Beweis: Wechselwinkel α′, β′ an C
      if (pv > 0) drawProof(P, r, pv);

      // Außenwinkel
      if (p.ext) drawExterior(S, P, ['α*', 'β*', 'γ*']);

      // Abgerissene Stücke
      if (torn) {
        const order = [2, 0, 1];
        for (const i of order) {
          const c = C[i]!;
          const o = P[i]!;
          const tl = clamp(tv / 0.15, 0, 1);
          const tm = ease.inOutCubic(clamp((tv - 0.15 - (i === 1 ? 0.05 : 0)) / 0.6, 0, 1));
          const td = clamp((tv - 0.78) / 0.12, 0, 1);
          const lv = i === 2 ? lift(clamp(tv / 0.9, 0, 1)) * 0.9 : Math.min(tl, 1 - td);
          g.save();
          if (i !== 2) {
            // halbe Drehung um die Mitte der Seite zu C – nach außen schwenken
            const m: XY = [(o[0] + P[2]![0]) / 2, (o[1] + P[2]![1]) / 2];
            const sgn = swingSign(o, P[2]!, P[(i + 1) % 2]!, m);
            g.translate(m[0], m[1]);
            g.rotate(sgn * Math.PI * tm);
            g.translate(-m[0], -m[1]);
          }
          const cen = polar(o, c.mid, r * 0.45);
          const s = 1 + 0.07 * lv;
          g.translate(cen[0], cen[1]);
          g.scale(s, s);
          g.translate(-cen[0], -cen[1]);
          drawPiece(o, r, c, i, lv, ['α', 'β', 'γ'][i]!);
          g.restore();
        }
        if (tv > 0.9) {
          const a = clamp((tv - 0.9) / 0.1, 0, 1);
          const c = P[2]!;
          // Normale weg vom Dreieck
          const nrm: XY = [-dAB[1], dAB[0]];
          const towards = (P[0]![0] - c[0]) * nrm[0] + (P[0]![1] - c[1]) * nrm[1] > 0 ? -1 : 1;
          g.save();
          g.globalAlpha = a;
          labelAt('α + β + γ = 180°', c[0] + nrm[0] * towards * 22, c[1] + nrm[1] * towards * 22, `800 ${big ? 16 : 13}px ${theme.font}`, theme.text);
          g.restore();
        }
      }

      for (let i = 0; i < 3; i++) drawVertex(P, i, C[i]!.mid + 180, clamp(iv / 0.3, 0, 1));
    }

    /** Hervorhebung von α (i = 0) bzw. β (i = 1) während der passenden Beweisschritte. */
    function highlight(pv: number, i: number): number {
      if (i === 0) return Math.sin(Math.PI * clamp((pv - 0.22) / 0.25, 0, 1));
      if (i === 1) return Math.sin(Math.PI * clamp((pv - 0.47) / 0.25, 0, 1));
      return Math.sin(Math.PI * clamp((pv - 0.72) / 0.25, 0, 1));
    }

    /** Drehsinn (Canvas), mit dem ein Stück von Ecke o um m nach außen (weg von der dritten Ecke q) schwenkt. */
    function swingSign(o: XY, c: XY, q: XY, m: XY): number {
      const cr = (a: XY, b: XY, x: XY) => (b[0] - a[0]) * (x[1] - a[1]) - (b[1] - a[1]) * (x[0] - a[0]);
      // Canvas-Drehung um +90°: (x, y) → (−y, x)
      const v: XY = [o[0] - m[0], o[1] - m[1]];
      const plus: XY = [m[0] - v[1], m[1] + v[0]];
      return Math.sign(cr(o, c, plus)) === Math.sign(cr(o, c, q)) ? -1 : 1;
    }

    function angleLabel(P: XY[], i: number, c: Corner, r: number, k: number): void {
      const theme = ctx.theme;
      const big = layout().big;
      const col = angColor(i);
      const g = surface.g;
      const name = ['α', 'β', 'γ'][i]!;
      const nf = `italic 700 ${big ? 17 : 14}px ${theme.mathFont}`;
      const vf = `800 ${big ? 13.5 : 11.5}px ${theme.font}`;
      const half = Math.max(0.12, Math.sin(rad(Math.min(89, c.sweep / 2))));
      g.save();
      g.globalAlpha = clamp(k, 0, 1);
      if (!p.vals) {
        const d = Math.max(r * 0.66, 13 / half);
        const [x, y] = polar(P[i]!, c.mid, d);
        haloText(name, x, y, nf, col);
      } else {
        const a = disp[i] ?? 0;
        const label = `${name} = ${deg(a)}`;
        g.font = vf;
        const w = g.measureText(label).width;
        const d = Math.max(r + 8, 12 / half) + w * 0.5 * Math.abs(Math.cos(rad(c.mid))) + 9 * Math.abs(Math.sin(rad(c.mid)));
        const [x, y] = polar(P[i]!, c.mid, d);
        labelAt(label, x, y, vf, col);
      }
      g.restore();
    }

    function drawProof(P: XY[], r: number, pv: number): void {
      const theme = ctx.theme;
      const big = layout().big;
      const c = P[2]!;
      const dAB = unit(P[0]!, P[1]!);
      // Pfeilmarken: AB ∥ g
      const ch = clamp((pv - 0.12) / 0.1, 0, 1);
      if (ch > 0) {
        const g = surface.g;
        g.save();
        g.globalAlpha = ch;
        const mAB: XY = [(P[0]![0] + P[1]![0]) / 2, (P[0]![1] + P[1]![1]) / 2];
        chevron(mAB, dAB, parColor());
        const lAB = Math.hypot(P[1]![0] - P[0]![0], P[1]![1] - P[0]![1]);
        const side = (P[0]![0] - c[0]) * dAB[0] + (P[0]![1] - c[1]) * dAB[1] < 0 ? 1 : -1;
        chevron([c[0] + dAB[0] * side * Math.max(r * 1.4, lAB * 0.35), c[1] + dAB[1] * side * Math.max(r * 1.4, lAB * 0.35)], dAB, parColor());
        // Name g am Ende der Parallelen
        const gx = c[0] - dAB[0] * side * Math.max(r * 1.6, lAB * 0.42);
        const gy = c[1] - dAB[1] * side * Math.max(r * 1.6, lAB * 0.42);
        const nrm: XY = [-dAB[1], dAB[0]];
        const away = (P[0]![0] - c[0]) * nrm[0] + (P[0]![1] - c[1]) * nrm[1] > 0 ? -1 : 1;
        labelAt('g', gx + nrm[0] * away * 14, gy + nrm[1] * away * 14, `italic 700 ${big ? 17 : 14}px ${theme.mathFont}`, parColor());
        g.restore();
      }
      // α′ zwischen [CA und g (Richtung B → A), β′ zwischen [CB und g (Richtung A → B)
      const dirBA = direction([0, 0], [-(P[1]![0] - P[0]![0]), P[1]![1] - P[0]![1]]);
      const dirAB = norm(dirBA + 180);
      const dCA = direction([0, 0], [P[0]![0] - c[0], -(P[0]![1] - c[1])]);
      const dCB = direction([0, 0], [P[1]![0] - c[0], -(P[1]![1] - c[1])]);
      const parts: [number, number, number, string, number][] = [
        [0, dCA, dirBA, 'α′', 0.25],
        [1, dCB, dirAB, 'β′', 0.5],
      ];
      for (const [i, d1, d2, name, t0] of parts) {
        const k = ease.outBack(clamp((pv - t0) / 0.18, 0, 1));
        if (k <= 0) continue;
        let sw = norm(d2 - d1);
        if (sw > 180) sw -= 360;
        const right = Math.abs(Math.abs(sw) - 90) < 1e-6;
        wedge(c, r * 0.62 * k, d1, sw, angColor(i), 0.2, 2.4, right);
        const mid = d1 + sw / 2;
        const half = Math.max(0.12, Math.sin(rad(Math.min(89, Math.abs(sw) / 2))));
        const [x, y] = polar(c, mid, Math.max(r * 0.62 + 12, 13 / half));
        const g = surface.g;
        g.save();
        g.globalAlpha = clamp(k, 0, 1);
        labelAt(name, x, y, `italic 700 ${big ? 17 : 14}px ${theme.mathFont}`, angColor(i));
        g.restore();
        // Z-Figur: Querseite hervorheben
        const hz = highlight(pv, i);
        if (hz > 0.01) {
          const g2 = surface.g;
          g2.save();
          g2.globalAlpha = hz * 0.8;
          g2.strokeStyle = angColor(i);
          g2.lineWidth = 6;
          g2.lineCap = 'round';
          g2.beginPath();
          g2.moveTo(P[i]![0], P[i]![1]);
          g2.lineTo(c[0], c[1]);
          g2.stroke();
          g2.restore();
        }
      }
      // gestreckter Winkel an g: Halbkreis um C
      const hk = clamp((pv - 0.75) / 0.2, 0, 1);
      if (hk > 0) {
        const g = surface.g;
        const nrm: XY = [-dAB[1], dAB[0]];
        const inside = (P[0]![0] - c[0]) * nrm[0] + (P[0]![1] - c[1]) * nrm[1] > 0 ? 1 : -1;
        const from = dirAB;
        const sw = halfSweep(dirAB, P, c);
        g.save();
        g.globalAlpha = hk;
        arcPath(c, r * 0.62 + 10, from, sw * ease.inOutCubic(hk), false);
        g.strokeStyle = withAlpha(theme.text, 0.7);
        g.lineWidth = 1.6;
        g.setLineDash([5, 4]);
        g.stroke();
        g.restore();
        const away = -inside;
        g.save();
        g.globalAlpha = clamp((pv - 0.85) / 0.12, 0, 1);
        labelAt('α′ + γ + β′ = 180°', c[0] + nrm[0] * away * 22, c[1] + nrm[1] * away * 22, `800 ${big ? 15 : 12.5}px ${theme.font}`, theme.text);
        g.restore();
      }
    }

    /** Halbkreis an g von Richtung AB aus, auf der Seite des Dreiecks (±180°). */
    function halfSweep(dirAB: number, P: XY[], c: XY): number {
      // Probe: Richtung AB + 90° (Welt) zeigt ins Dreieck?
      const probe = polar(c, dirAB + 90, 10);
      const toA: XY = [P[0]![0] - c[0], P[0]![1] - c[1]];
      const pr: XY = [probe[0] - c[0], probe[1] - c[1]];
      const dAB = unit(P[0]!, P[1]!);
      const nrm: XY = [-dAB[1], dAB[0]];
      const s1 = toA[0] * nrm[0] + toA[1] * nrm[1];
      const s2 = pr[0] * nrm[0] + pr[1] * nrm[1];
      return Math.sign(s1) === Math.sign(s2) ? 180 : -180;
    }

    const norm = (d: number) => ((d % 360) + 360) % 360;

    /* ---------------- Außenwinkel ---------------- */
    function drawExterior(S: Pt[], P: XY[], names: string[] | null): void {
      const g = surface.g;
      const theme = ctx.theme;
      const big = layout().big;
      const ext = exteriorAngles(S);
      if (!ext) return;
      const n = S.length;
      const o = orientation(S) || 1;
      const col = extColor();
      const wv = walk.v;
      const done = walkState(S).done;
      for (let i = 0; i < n; i++) {
        const k = introPart(i, n);
        if (k <= 0) continue;
        const q = P[i]!;
        const din = direction(S[(i + n - 1) % n]!, S[i]!);
        const rr = arcRadius(P, i, big ? 30 : 24) * 1.05;
        const extLen = rr + (big ? 26 : 20);
        const end = polar(q, din, extLen * k);
        dashedLine(q, end, withAlpha(col, 0.85), 1.8, [6, 5]);
        const sweep = o * ext[i]!;
        // beim Umrunden: Außenwinkel erst zeigen, wenn die Ecke erreicht ist
        const reach = wv > 0 ? clamp(done[i] ?? 0, 0, 1) : 1;
        const fade = wv > 0 ? 0.25 + 0.75 * reach : 1;
        g.save();
        g.globalAlpha = fade;
        wedge(q, rr * k, din, sweep * (wv > 0 ? Math.max(0.0001, reach) : 1), col, 0.16, 2);
        if (p.vals || names) {
          const mid = din + sweep / 2;
          const label = names ? (p.vals ? `${names[i]} = ${deg(o * sweep)}` : names[i]!) : deg(ext[i]!);
          const vf = names && !p.vals ? `italic 700 ${big ? 15 : 13}px ${theme.mathFont}` : `700 ${big ? 12.5 : 11}px ${theme.font}`;
          g.font = vf;
          const w = g.measureText(label).width;
          const d = rr + 10 + w * 0.5 * Math.abs(Math.cos(rad(mid))) + 6 * Math.abs(Math.sin(rad(mid)));
          const [x, y] = polar(q, mid, d);
          labelAt(label, x, y, vf, ext[i]! < 0 ? warnColor() : col);
        }
        g.restore();
      }
    }

    /* ---------------- Umrunden ---------------- */
    interface WalkState {
      pos: XY;
      heading: number;
      turned: number;
      done: number[];
      trail: Pt[];
    }
    /** Zustand beim Umrunden: Je Ecke 0,55 Zeiteinheiten Laufen und 0,45 Drehen. */
    function walkState(S: Pt[]): WalkState {
      const n = S.length;
      const ext = exteriorAngles(S) ?? S.map(() => 0);
      const o = orientation(S) || 1;
      const u = walk.v * n;
      const done = S.map(() => 0);
      let turned = 0;
      let heading = direction(S[0]!, S[1 % n]!);
      const trail: Pt[] = [S[0]!];
      let pos: Pt = S[0]!;
      for (let k = 0; k < n; k++) {
        const a = S[k]!;
        const b = S[(k + 1) % n]!;
        const vIdx = (k + 1) % n;
        const local = u - k;
        if (local <= 0) break;
        const mv = ease.inOutCubic(clamp(local / 0.55, 0, 1));
        pos = [a[0] + (b[0] - a[0]) * mv, a[1] + (b[1] - a[1]) * mv];
        heading = direction(a, b);
        trail.push(pos);
        const tr = ease.inOutCubic(clamp((local - 0.55) / 0.45, 0, 1));
        done[vIdx] = tr;
        heading += o * ext[vIdx]! * tr;
        turned += ext[vIdx]! * tr;
      }
      const P = toPx(pos);
      return { pos: P, heading, turned, done, trail };
    }

    function drawWalker(S: Pt[]): void {
      if (walk.v <= 0) return;
      const g = surface.g;
      const theme = ctx.theme;
      const st = walkState(S);
      const col = extColor();
      // Spur
      g.save();
      g.strokeStyle = withAlpha(col, 0.55);
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      st.trail.forEach((q, i) => {
        const [x, y] = toPx(q);
        if (i) g.lineTo(x, y);
        else g.moveTo(x, y);
      });
      g.stroke();
      g.restore();
      // Pfeil
      const [x, y] = st.pos;
      const s = layout().big ? 15 : 12;
      g.save();
      g.translate(x, y);
      g.rotate(-rad(st.heading));
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.beginPath();
      g.moveTo(s * 1.25, 0);
      g.lineTo(-s * 0.8, s * 0.75);
      g.lineTo(-s * 0.35, 0);
      g.lineTo(-s * 0.8, -s * 0.75);
      g.closePath();
      g.fillStyle = col;
      g.fill();
      g.restore();
      g.save();
      g.translate(x, y);
      g.rotate(-rad(st.heading));
      g.beginPath();
      g.moveTo(s * 1.25, 0);
      g.lineTo(-s * 0.8, s * 0.75);
      g.lineTo(-s * 0.35, 0);
      g.lineTo(-s * 0.8, -s * 0.75);
      g.closePath();
      g.strokeStyle = theme.bg;
      g.lineWidth = 2;
      g.stroke();
      g.restore();
    }

    /* ---------------- Vieleck ---------------- */
    function drawPolygon(): void {
      const g = surface.g;
      const theme = ctx.theme;
      const S = shown();
      const P = S.map(toPx);
      const n = S.length;
      const big = layout().big;
      const iv = intro.v;
      const draw = reduced ? 1 : ease.inOutCubic(clamp(iv / 0.45, 0, 1));
      const shape = classify(S);
      const ang = interiorAngles(S);
      const sv = split.v;
      fillPoly(P, shape === 'crossed' ? warnColor() : theme.series[0]!, (shape === 'crossed' ? 0.08 : 0.11) * draw * (1 - 0.6 * clamp(sv * 3, 0, 1)));

      const tri = ang ? triangulation() : null;
      const m = tri ? tri.tris.length : 0;
      const triT = (k: number) => clamp(sv * m * 1.08 - k, 0, 1);

      // Zerlegung: Dreiecke nacheinander
      if (tri && sv > 0) {
        tri.tris.forEach((t, k) => {
          const tk = triT(k);
          if (tk <= 0) return;
          const col = angColor(k);
          const Q = t.map((i) => P[i]!);
          const fa = ease.outCubic(clamp((tk - 0.25) / 0.5, 0, 1));
          g.save();
          g.beginPath();
          Q.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
          g.closePath();
          g.fillStyle = withAlpha(col, (theme.dark ? 0.24 : 0.17) * fa);
          g.fill();
          g.restore();
        });
        // Diagonalen
        tri.tris.forEach((t, k) => {
          const tk = triT(k);
          if (tk <= 0) return;
          for (let e = 0; e < 3; e++) {
            const i = t[e]!;
            const j = t[(e + 1) % 3]!;
            if ((i + 1) % n === j || (j + 1) % n === i) continue;
            const dt = ease.inOutCubic(clamp(tk / 0.4, 0, 1));
            const a = P[i]!;
            const b = P[j]!;
            dashedLine(a, [a[0] + (b[0] - a[0]) * dt, a[1] + (b[1] - a[1]) * dt], withAlpha(theme.text, 0.65), 2, [7, 5]);
          }
        });
      }

      strokeOutline(P, draw);

      // Innenwinkel
      if (ang) {
        const C = corners(S, ang);
        const showSplitArcs = tri && sv > 0;
        for (let i = 0; i < n; i++) {
          const k = introPart(i, n);
          if (k <= 0) continue;
          const c = C[i]!;
          const rr = arcRadius(P, i, big ? 30 : 24);
          const reflex = ang[i]! > 180 + 1e-7;
          const col = reflex ? warnColor() : theme.series[0]!;
          const fadeOut = showSplitArcs ? 1 - clamp(sv * 4, 0, 1) : 1;
          if (fadeOut > 0) {
            g.save();
            g.globalAlpha = fadeOut;
            wedge(P[i]!, rr * k, c.from, c.sweep, col, 0.16, 2, Math.abs(ang[i]! - 90) < 1e-6);
            g.restore();
          }
          // Wert bzw. Name
          const half = Math.max(0.1, Math.sin(rad(Math.min(89, c.sweep / 2))));
          const font = p.vals ? `700 ${big ? 12.5 : 11}px ${theme.font}` : `italic 700 ${big ? 15 : 13}px ${theme.mathFont}`;
          const label = p.vals ? deg(polyDisp(i)) : GREEK[i]!;
          g.font = font;
          const w = g.measureText(label).width;
          const d = Math.max(rr + 8, 11 / half) + w * 0.5 * Math.abs(Math.cos(rad(c.mid))) + 7 * Math.abs(Math.sin(rad(c.mid)));
          const [x, y] = polar(P[i]!, c.mid, d);
          g.save();
          g.globalAlpha = clamp(k, 0, 1);
          labelAt(label, x, y, font, reflex ? warnColor() : theme.text);
          g.restore();
        }
        // Winkel der Dreiecke an ihren Ecken
        if (tri && sv > 0) {
          tri.tris.forEach((t, k) => {
            const tk = triT(k);
            const ka = ease.outBack(clamp((tk - 0.35) / 0.45, 0, 1));
            if (ka <= 0) return;
            const col = angColor(k);
            for (let e = 0; e < 3; e++) {
              const i = t[e]!;
              const j = t[(e + 1) % 3]!;
              const l = t[(e + 2) % 3]!;
              const d1 = direction(S[i]!, S[j]!);
              const d2 = direction(S[i]!, S[l]!);
              let sw = norm(d2 - d1);
              if (sw > 180) sw -= 360;
              const rr = arcRadius(P, i, big ? 30 : 24) * 0.92;
              wedge(P[i]!, rr * ka, d1, sw, col, 0.3, 1.8);
            }
            // 180° in der Mitte des Dreiecks
            const cx = (P[t[0]]![0] + P[t[1]]![0] + P[t[2]]![0]) / 3;
            const cy = (P[t[0]]![1] + P[t[1]]![1] + P[t[2]]![1]) / 3;
            const area = Math.abs((P[t[1]]![0] - P[t[0]]![0]) * (P[t[2]]![1] - P[t[0]]![1]) - (P[t[2]]![0] - P[t[0]]![0]) * (P[t[1]]![1] - P[t[0]]![1])) / 2;
            if (area > 900) {
              g.save();
              g.translate(cx, cy);
              g.scale(ka, ka);
              haloText('180°', 0, 0, `800 ${big ? 13 : 11}px ${theme.font}`, col);
              g.restore();
            }
          });
        }
      }

      // Überschneidungen markieren
      if (shape === 'crossed') {
        for (const x of crossings(S)) {
          const [cx, cy] = toPx(x);
          g.beginPath();
          g.arc(cx, cy, 9, 0, Math.PI * 2);
          g.strokeStyle = warnColor();
          g.lineWidth = 2.4;
          g.stroke();
          g.beginPath();
          g.arc(cx, cy, 3, 0, Math.PI * 2);
          g.fillStyle = warnColor();
          g.fill();
        }
      }

      if (p.ext && ang) drawExterior(S, P, null);
      drawWalker(S);

      // Ecken
      const cx = sum(P.map((q) => q[0])) / n;
      const cy = sum(P.map((q) => q[1])) / n;
      const C = ang ? corners(S, ang) : null;
      for (let i = 0; i < n; i++) {
        const out = C ? C[i]!.mid + 180 : direction([cx, -cy], [P[i]![0], -P[i]![1]]);
        drawVertex(P, i, out, clamp(iv / 0.3, 0, 1));
      }
    }

    /** Angezeigter (mitzählender) Innenwinkel im Vieleck. */
    function polyDisp(i: number): number {
      return disp[i] ?? 0;
    }

    /* ---------------- Hinweis-Toast ---------------- */
    function drawToast(): void {
      const now = performance.now();
      if (!toast || now >= toast.until) {
        toast = null;
        return;
      }
      const g = surface.g;
      const theme = ctx.theme;
      const { paper, big } = { paper: layout().paper, big: layout().big };
      const a = clamp((toast.until - now) / 300, 0, 1);
      const font = `700 ${big ? 12.5 : 11.5}px ${theme.font}`;
      const rows = wrap(toast.text, paper.w - 40, font);
      const lh = big ? 17 : 15;
      g.font = font;
      const w = Math.max(...rows.map((r) => g.measureText(r).width)) + 24;
      const h = rows.length * lh + 14;
      const x = paper.x + (paper.w - w) / 2;
      const y = paper.y + 10;
      g.save();
      g.globalAlpha = a;
      g.fillStyle = theme.dark ? '#2a1620' : '#fff1f4';
      roundRect(g, x, y, w, h, 10);
      g.fill();
      g.strokeStyle = withAlpha(warnColor(), 0.7);
      g.lineWidth = 1.3;
      g.stroke();
      rows.forEach((row, i) => text(g, row, x + w / 2, y + 7 + lh / 2 + i * lh, { font, color: warnColor() }));
      g.restore();
    }

    /* ---------------- Karten ---------------- */
    interface CardSpec {
      h: number;
      draw: (r: Rect) => void;
    }

    function drawCards(R: Rect, cards: CardSpec[]): void {
      const g = surface.g;
      const gap = layout().big ? 10 : 8;
      let y = R.y;
      g.save();
      g.globalAlpha = reduced ? 1 : ease.outCubic(clamp(intro.v / 0.5, 0, 1));
      for (const c of cards) {
        if (y + c.h > R.y + R.h + 0.5) break;
        c.draw({ x: R.x, y, w: R.w, h: c.h });
        y += c.h + gap;
      }
      g.restore();
    }

    /** Leiste 0° … total mit farbigen Abschnitten. */
    function sumBar(x: number, y: number, w: number, parts: { v: number; color: string; label?: string }[], total: number, ticks: string[], hide: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const h = layout().big ? 18 : 15;
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.05);
      roundRect(g, x, y, w, h, h / 2);
      g.fill();
      if (!hide) {
        g.save();
        roundRect(g, x, y, w, h, h / 2);
        g.clip();
        let acc = 0;
        for (const part of parts) {
          const x0 = x + (acc / total) * w;
          const pw = (Math.max(0, part.v) / total) * w;
          g.fillStyle = withAlpha(part.color, theme.dark ? 0.75 : 0.85);
          g.fillRect(x0, y, pw, h);
          g.fillStyle = 'rgba(255,255,255,0.18)';
          g.fillRect(x0, y, pw, h * 0.45);
          if (acc > 0) {
            g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
            g.fillRect(x0 - 1, y, 2, h);
          }
          if (part.label) {
            g.font = `800 ${layout().big ? 11.5 : 10.5}px ${theme.font}`;
            if (g.measureText(part.label).width + 6 < pw) text(g, part.label, x0 + pw / 2, y + h / 2 + 0.5, { font: g.font, color: onColor() });
          }
          acc += Math.max(0, part.v);
        }
        g.restore();
      }
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.lineWidth = 1;
      roundRect(g, x + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      const tf = `600 ${layout().big ? 10.5 : 10}px ${theme.font}`;
      text(g, ticks[0]!, x + 2, y + h + 10, { font: tf, color: theme.muted, align: 'left' });
      text(g, ticks[1]!, x + w - 2, y + h + 10, { font: tf, color: theme.muted, align: 'right' });
    }

    /** Liste mit Häkchen, die nacheinander erscheinen. */
    function stepList(R: Rect, head: string, steps: Loc[], at: number[], v: number, accent: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      const big = layout().big;
      const pad = big ? 14 : 10;
      card(R, accent, 0.04);
      title(R.x + pad, R.y + (big ? 17 : 14), head);
      let y = R.y + (big ? 34 : 28);
      const font = `500 ${big ? 12.5 : 11.5}px ${theme.font}`;
      const lh = big ? 16 : 14.5;
      steps.forEach((s, i) => {
        const on = v >= at[i]! - 0.001;
        const cur = !on && (i === 0 || v >= at[i - 1]!);
        const rows = wrap(T(s), R.w - 2 * pad - 26, font);
        if (y + rows.length * lh > R.y + R.h - 6) return;
        const cy = y + 9;
        g.beginPath();
        g.arc(R.x + pad + 9, cy, 9, 0, Math.PI * 2);
        if (on) {
          g.fillStyle = theme.series[2]!;
          g.fill();
          text(g, '✓', R.x + pad + 9, cy + 0.5, { font: `800 11px ${theme.font}`, color: onColor() });
        } else {
          g.strokeStyle = cur ? accent : withAlpha(theme.text, 0.3);
          g.lineWidth = 1.6;
          g.stroke();
          text(g, String(i + 1), R.x + pad + 9, cy + 0.5, { font: `700 10.5px ${theme.font}`, color: cur ? accent : theme.muted });
        }
        textRows(rows, R.x + pad + 26, cy, lh, font, on || cur ? theme.text : theme.muted);
        y += Math.max(22, rows.length * lh + 6);
      });
    }

    function stepListHeight(w: number, steps: Loc[]): number {
      const big = layout().big;
      const pad = big ? 14 : 10;
      const font = `500 ${big ? 12.5 : 11.5}px ${ctx.theme.font}`;
      const lh = big ? 16 : 14.5;
      return (big ? 34 : 28) + sum(steps.map((s) => Math.max(22, wrap(T(s), w - 2 * pad - 26, font).length * lh + 6))) + 4;
    }

    function noteCard(R: Rect, head: string, body: string, accent?: string): void {
      const theme = ctx.theme;
      const big = layout().big;
      const pad = big ? 14 : 10;
      card(R, accent, accent ? 0.05 : 0);
      title(R.x + pad, R.y + (big ? 17 : 14), head, accent ?? theme.muted);
      const font = `500 ${big ? 12.5 : 11.5}px ${theme.font}`;
      const lh = big ? 16.5 : 15;
      const rows = wrap(body, R.w - 2 * pad, font);
      const max = Math.floor((R.h - (big ? 34 : 28)) / lh);
      textRows(rows.slice(0, Math.max(1, max)), R.x + pad, R.y + (big ? 36 : 30), lh, font, theme.text);
    }

    function noteHeight(w: number, body: string): number {
      const big = layout().big;
      const pad = big ? 14 : 10;
      const font = `500 ${big ? 12.5 : 11.5}px ${ctx.theme.font}`;
      const lh = big ? 16.5 : 15;
      return (big ? 36 : 30) + wrap(body, w - 2 * pad, font).length * lh + (big ? 6 : 4);
    }

    /* ----- Dreieck: Innenwinkel-Karte ----- */
    function triAnglesCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const big = layout().big;
      const pad = big ? 14 : 10;
      const a = exactAngles();
      card(R);
      title(R.x + pad, R.y + (big ? 17 : 14), tt('Innenwinkel im Dreieck', 'Interior angles of the triangle'));
      if (!a) return;
      const vals = disp.length === 3 ? disp : [0, 0, 0];
      const settled = vals.every((v, i) => Math.abs(v - a[i]!) < 0.005);
      const r = settled ? roundToSum(a, 1, 180) : vals.map((v) => Math.round(v * 10) / 10);
      const total = settled ? 180 : Math.round(sum(vals) * 10) / 10;
      const names = ['α', 'β', 'γ'];
      const lineFont = `800 ${big ? 15 : 13}px ${theme.font}`;
      const nameFont = `italic 700 ${big ? 18 : 15}px ${theme.mathFont}`;
      let y = R.y + (big ? 40 : 32);
      const rowsMode = R.h >= (big ? 190 : 150);
      if (rowsMode) {
        const lh = big ? 25 : 21;
        for (let i = 0; i < 3; i++) {
          const yy = y + i * lh;
          g.beginPath();
          g.moveTo(R.x + pad, yy + 7);
          g.arc(R.x + pad, yy + 7, 14, -rad(0), -rad(55), true);
          g.closePath();
          g.fillStyle = withAlpha(angColor(i), 0.28);
          g.fill();
          g.strokeStyle = angColor(i);
          g.lineWidth = 2;
          g.stroke();
          text(g, names[i]!, R.x + pad + 24, yy, { font: nameFont, color: angColor(i), align: 'left' });
          text(g, p.vals ? deg(r[i]!) : '?', R.x + R.w - pad, yy, { font: lineFont, color: p.vals ? theme.text : theme.muted, align: 'right' });
        }
        y += 3 * lh - 6;
        g.strokeStyle = withAlpha(theme.text, 0.2);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(R.x + pad, y);
        g.lineTo(R.x + R.w - pad, y);
        g.stroke();
        y += big ? 18 : 15;
        text(g, 'α + β + γ', R.x + pad, y, { font: `italic 700 ${big ? 16 : 14}px ${theme.mathFont}`, color: theme.text, align: 'left' });
        text(g, p.vals ? `= ${deg(total)}` : '= ?', R.x + R.w - pad, y, { font: `800 ${big ? 20 : 16}px ${theme.font}`, color: p.vals ? theme.text : theme.muted, align: 'right' });
        y += big ? 20 : 16;
      } else {
        // kompakt: drei Werte in einer Zeile
        const cw = (R.w - 2 * pad) / 3;
        for (let i = 0; i < 3; i++) {
          const x = R.x + pad + i * cw;
          text(g, names[i]!, x, y, { font: nameFont, color: angColor(i), align: 'left' });
          text(g, p.vals ? deg(r[i]!) : '?', x + (big ? 18 : 15), y + 1, { font: `800 ${big ? 13.5 : 12}px ${theme.font}`, color: p.vals ? theme.text : theme.muted, align: 'left' });
        }
        y += big ? 24 : 21;
        text(g, 'α + β + γ', R.x + pad, y, { font: `italic 700 ${big ? 15 : 13}px ${theme.mathFont}`, color: theme.text, align: 'left' });
        text(g, p.vals ? `= ${deg(total)}` : '= ?', R.x + R.w - pad, y, { font: `800 ${big ? 17 : 14}px ${theme.font}`, color: p.vals ? theme.text : theme.muted, align: 'right' });
        y += big ? 16 : 13;
      }
      sumBar(
        R.x + pad,
        y,
        R.w - 2 * pad,
        vals.map((v, i) => ({ v, color: angColor(i), label: names[i] })),
        180,
        ['0°', '180°'],
        !p.vals,
      );
    }

    function triAnglesHeight(R: Rect): number {
      const big = layout().big;
      return R.h >= (big ? 430 : 300) || (layout().wide && R.h >= 330) ? (big ? 196 : 158) : big ? 128 : 112;
    }

    /* ----- Vieleck: Winkelsummen-Karte ----- */
    function polySumCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const big = layout().big;
      const pad = big ? 14 : 10;
      const P = target();
      const n = P.length;
      const a = exactAngles();
      const shape = classify(P);
      card(R, shape === 'crossed' ? warnColor() : undefined, shape === 'crossed' ? 0.05 : 0);
      title(R.x + pad, R.y + (big ? 17 : 14), tt(`Winkelsumme ${T(NGON_IN[n - 3]!)}`, `Angle sum ${T(NGON_IN[n - 3]!)}`));
      let y = R.y + (big ? 44 : 34);
      if (!a) {
        const rows = wrap(tt('Die Seiten überkreuzen sich. Das ist kein einfaches Vieleck – es hat kein klar begrenztes Inneres, die Formel gilt hier nicht.', 'The sides cross. This is not a simple polygon – it has no clearly bounded interior, so the formula does not apply.'), R.w - 2 * pad, `600 ${big ? 12.5 : 11.5}px ${theme.font}`);
        textRows(rows, R.x + pad, y - 6, big ? 16 : 14.5, `600 ${big ? 12.5 : 11.5}px ${theme.font}`, warnColor());
        return;
      }
      const m = triangleCount(n);
      const tri = triangulation();
      const shownTris = split.v > 0 && tri ? clamp(Math.floor(split.v * m * 1.08 + 0.4), 0, m) : m;
      const counting = split.v > 0 && split.busy;
      const formula = `(${n} − 2) · 180° = ${m} · 180°`;
      const res = counting ? `${shownTris} · 180° = ${fmt.num(shownTris * 180, 0)}°` : `${fmt.num(angleSum(n), 0)}°`;
      const ff = `700 ${big ? 13.5 : 12}px ${theme.font}`;
      g.font = ff;
      const fw = g.measureText(formula).width;
      const rf = `800 ${big ? 22 : 17}px ${theme.font}`;
      g.font = rf;
      const rw = g.measureText(`= ${res}`).width;
      if (fw + rw + 10 <= R.w - 2 * pad) {
        text(g, formula, R.x + pad, y, { font: ff, color: theme.text, align: 'left' });
        text(g, `= ${res}`, R.x + R.w - pad, y, { font: rf, color: counting ? angColor(Math.max(0, shownTris - 1)) : theme.text, align: 'right' });
        y += big ? 24 : 20;
      } else {
        text(g, formula, R.x + pad, y, { font: ff, color: theme.text, align: 'left' });
        y += big ? 24 : 20;
        text(g, `= ${res}`, R.x + pad, y, { font: rf, color: counting ? angColor(Math.max(0, shownTris - 1)) : theme.text, align: 'left' });
        y += big ? 24 : 20;
      }
      // Gemessen: Summe der angezeigten Winkel
      const vals = disp.length === n ? disp : a;
      const settled = vals.every((v, i) => Math.abs(v - a[i]!) < 0.005);
      const measured = settled ? angleSum(n) : Math.round(sum(vals) * 10) / 10;
      const mf = `500 ${big ? 12 : 11}px ${theme.font}`;
      text(g, p.vals ? tt(`gemessen: ${GREEK[0]} + … + ${GREEK[n - 1]} = ${deg(measured)}`, `measured: ${GREEK[0]} + … + ${GREEK[n - 1]} = ${deg(measured)}`) : tt('gemessen: ?', 'measured: ?'), R.x + pad, y, { font: mf, color: theme.muted, align: 'left' });
      y += big ? 16 : 13;
      // Blöcke zu je 180°
      const bw = (R.w - 2 * pad - (m - 1) * 4) / m;
      const bh = big ? 20 : 16;
      for (let k = 0; k < m; k++) {
        const x = R.x + pad + k * (bw + 4);
        const lit = split.v > 0 ? clamp(split.v * m * 1.08 - k - 0.25, 0, 1) : 1;
        g.fillStyle = withAlpha(theme.text, theme.dark ? 0.08 : 0.05);
        roundRect(g, x, y, bw, bh, 5);
        g.fill();
        const col = split.v > 0 ? angColor(k) : theme.series[0]!;
        g.fillStyle = withAlpha(col, (theme.dark ? 0.7 : 0.8) * lit);
        roundRect(g, x, y, bw, bh, 5);
        g.fill();
        if (bw > 30 && lit > 0.5) text(g, '180°', x + bw / 2, y + bh / 2 + 0.5, { font: `800 ${big ? 11 : 10}px ${theme.font}`, color: onColor() });
      }
    }

    function polySumHeight(): number {
      return layout().big ? 116 : 98;
    }

    /* ----- Vieleck: Tabelle ----- */
    function tableCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const big = layout().big;
      const pad = big ? 12 : 8;
      const n = target().length;
      card(R);
      title(R.x + pad + 2, R.y + (big ? 17 : 14), tt('Tabelle', 'Table'));
      const head = [tt('n', 'n'), tt('Dreiecke', 'Triangles'), tt('Summe', 'Sum'), tt('regelm.', 'regular')];
      const colX = [0.1, 0.36, 0.64, 0.88].map((f) => R.x + pad + f * (R.w - 2 * pad));
      const hy = R.y + (big ? 38 : 31);
      const hf = `700 ${big ? 11 : 10.5}px ${theme.font}`;
      head.forEach((h, i) => text(g, h, colX[i]!, hy, { font: hf, color: theme.muted }));
      const rh = big ? 19 : 17;
      const avail = Math.floor((R.y + R.h - (hy + 10) - 4) / rh);
      const count = clamp(avail, 1, N_MAX - N_MIN + 1);
      let first = clamp(n - Math.floor(count / 2), N_MIN, N_MAX - count + 1);
      first = Math.max(N_MIN, first);
      for (let k = 0; k < count; k++) {
        const nn = first + k;
        const y = hy + 10 + k * rh;
        const cur = nn === n;
        if (cur) {
          const s = rowPop.running ? Math.max(0.6, rowPop.value) : 1;
          g.save();
          g.translate(R.x + R.w / 2, y + rh / 2);
          g.scale(1, s);
          g.fillStyle = withAlpha(theme.series[0]!, theme.dark ? 0.24 : 0.13);
          roundRect(g, -R.w / 2 + pad - 2, -rh / 2, R.w - 2 * pad + 4, rh, 6);
          g.fill();
          g.restore();
        }
        const f = `${cur ? 800 : 500} ${big ? 12.5 : 11.5}px ${theme.font}`;
        const col = cur ? theme.text : theme.muted;
        const ri = regularInterior(nn);
        const riTxt = Math.abs(ri - Math.round(ri)) < 1e-9 ? deg(ri, 0) : `≈ ${deg(ri)}`;
        [String(nn), String(triangleCount(nn)), deg(angleSum(nn), 0), riTxt].forEach((s, i) => text(g, s, colX[i]!, y + rh / 2 + 0.5, { font: f, color: col }));
        if (!ctx.locked) hits.push({ id: `row${nn}`, r: { x: R.x, y, w: R.w, h: rh } });
      }
    }

    function tableHeight(avail: number): number {
      const big = layout().big;
      const rh = big ? 19 : 17;
      const base = (big ? 38 : 31) + 10 + 6;
      const rows = clamp(Math.floor((avail - base) / rh), 0, 8);
      return rows >= 3 ? base + rows * rh : 0;
    }

    /* ----- Außenwinkel: Drehscheibe ----- */
    function extCard(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const big = layout().big;
      const pad = big ? 14 : 10;
      const S = target();
      const n = S.length;
      const ext = exteriorAngles(S);
      const col = extColor();
      card(R, col, 0.04);
      title(R.x + pad, R.y + (big ? 17 : 14), tt('Außenwinkel beim Umrunden', 'Exterior angles when walking around'), col);
      if (!ext) return;
      const o = orientation(S) || 1;
      const st = walk.v > 0 ? walkState(S) : null;
      const turned = st ? st.turned : 360;
      const startHeading = direction(S[0]!, S[1]!);
      const dialR = clamp(Math.min((R.h - (big ? 44 : 34)) / 2 - 6, R.w * 0.2), 18, big ? 54 : 40);
      const cxy: XY = [R.x + pad + dialR + 2, R.y + (big ? 30 : 24) + (R.h - (big ? 30 : 24)) / 2];
      // Scheibe
      g.beginPath();
      g.arc(cxy[0], cxy[1], dialR, 0, Math.PI * 2);
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.06 : 0.035);
      g.fill();
      g.strokeStyle = withAlpha(theme.text, 0.25);
      g.lineWidth = 1;
      g.stroke();
      // Abschnitte je Ecke (nacheinander, zusammen eine volle Drehung)
      let acc = 0;
      for (let k = 0; k < n; k++) {
        const v = (k + 1) % n;
        const part = st ? (st.done[v] ?? 0) : 1;
        const e = ext[v]!;
        if (part > 0 && Math.abs(e) > 0.01) {
          g.save();
          arcPath(cxy, dialR * 0.86, startHeading + o * acc, o * e * part, true);
          g.fillStyle = e < 0 ? withAlpha(warnColor(), 0.45) : withAlpha(angColor(k), theme.dark ? 0.55 : 0.45);
          g.fill();
          g.restore();
        }
        acc += e * part;
      }
      // Zeiger: Blickrichtung
      const hd = startHeading + o * turned;
      const tip = polar(cxy, hd, dialR * 0.95);
      g.strokeStyle = col;
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cxy[0], cxy[1]);
      g.lineTo(tip[0], tip[1]);
      g.stroke();
      g.beginPath();
      g.arc(cxy[0], cxy[1], 3.5, 0, Math.PI * 2);
      g.fillStyle = col;
      g.fill();
      // Startrichtung
      const s0 = polar(cxy, startHeading, dialR);
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1.5;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(cxy[0], cxy[1]);
      g.lineTo(s0[0], s0[1]);
      g.stroke();
      g.setLineDash([]);
      // Text
      const tx = cxy[0] + dialR + (big ? 14 : 10);
      const tw = R.x + R.w - pad - tx;
      const head = st && walk.busy ? tt('gedreht:', 'turned:') : tt('Summe:', 'sum:');
      text(g, head, tx, cxy[1] - (big ? 16 : 13), { font: `600 ${big ? 12 : 11}px ${theme.font}`, color: theme.muted, align: 'left' });
      text(g, deg(Math.round(turned * 10) / 10), tx, cxy[1] + 4, { font: `800 ${big ? 22 : 17}px ${theme.font}`, color: col, align: 'left' });
      const sub = st && walk.busy ? '' : n === 3 && mode() === 'tri' ? 'α* + β* + γ* = 360°' : tt('eine volle Drehung', 'one full turn');
      if (sub) {
        const rows = wrap(sub, tw, `500 ${big ? 11.5 : 10.5}px ${theme.font}`);
        textRows(rows.slice(0, 2), tx, cxy[1] + (big ? 24 : 19), big ? 14 : 12.5, `500 ${big ? 11.5 : 10.5}px ${theme.font}`, theme.text);
      }
    }

    function extHeight(): number {
      return layout().big ? 150 : 104;
    }

    /* ----- Hinweis zur Art des Vielecks ----- */
    function shapeNote(): { head: string; body: string; accent?: string } {
      const P = target();
      const n = P.length;
      const s = classify(P);
      if (s === 'crossed')
        return {
          head: tt('Überschlagenes Vieleck', 'Self-intersecting polygon'),
          body: tt('Zieh die Ecken so, dass sich keine Seiten mehr kreuzen. Die Formel (n − 2) · 180° gilt nur für einfache Vielecke.', 'Drag the corners until no sides cross. The formula (n − 2) · 180° only holds for simple polygons.'),
          accent: warnColor(),
        };
      if (s === 'concave') {
        const a = interiorAngles(P)!;
        const list = a.map((v, i) => (v > 180 + 1e-7 ? NAMES[i] : '')).filter(Boolean).join(', ');
        return {
          head: tt('Nicht konvex', 'Not convex'),
          body: tt(
            `Bei ${list} zeigt die Ecke nach innen: Der Innenwinkel ist größer als 180°. Die Summe ist trotzdem (n − 2) · 180°.${split.v > 0 && triangulation()?.fan !== 0 ? ' Zerlegt wird hier von einer anderen Ecke aus.' : ''}`,
            `At ${list} the corner points inwards: the interior angle is greater than 180°. The sum is still (n − 2) · 180°.${split.v > 0 && triangulation()?.fan !== 0 ? ' Here the splitting starts at another corner.' : ''}`,
          ),
          accent: warnColor(),
        };
      }
      if (isRegular(P)) {
        const ri = regularInterior(n);
        const v = Math.abs(ri - Math.round(ri)) < 1e-9 ? `= ${deg(ri, 0)}` : `≈ ${deg(ri)}`;
        return {
          head: tt(`Regelmäßiges ${T(NGON[n - 3]!)}`, `Regular ${T(NGON[n - 3]!)}`),
          body: tt(`Alle Winkel sind gleich groß: (${n} − 2) · 180° : ${n} ${v}.`, `All angles are equal: (${n} − 2) · 180° : ${n} ${v}.`),
        };
      }
      return {
        head: tt('Merke', 'Remember'),
        body: tt(`Von einer Ecke aus zerfällt ein n-Eck in n − 2 Dreiecke. Jedes hat 180°, also ist die Winkelsumme (n − 2) · 180°.`, `From one corner an n-gon splits into n − 2 triangles. Each has 180°, so the angle sum is (n − 2) · 180°.`),
      };
    }

    function cardsFor(R: Rect): CardSpec[] {
      const w = R.w;
      const out: CardSpec[] = [];
      const gap = layout().big ? 10 : 8;
      let used = 0;
      const push = (c: CardSpec) => {
        out.push(c);
        used += c.h + gap;
      };
      const rest = () => R.h - used;
      if (mode() === 'tri') {
        push({ h: triAnglesHeight(R), draw: triAnglesCard });
        if (proof.v > 0 || proof.to === 1) push({ h: Math.min(rest(), stepListHeight(w, PROOF_STEPS)), draw: (r) => stepList(r, tt('Beweis mit der Parallelen', 'Proof with a parallel'), PROOF_STEPS, PROOF_AT, proof.v, parColor()) });
        else if (tear.v > 0 || tear.to === 1) push({ h: Math.min(rest(), stepListHeight(w, TEAR_STEPS)), draw: (r) => stepList(r, tt('Ecken abreißen und anlegen', 'Tearing off and joining the corners'), TEAR_STEPS, TEAR_AT, tear.v, angColor(0)) });
        if (p.ext && rest() >= extHeight()) push({ h: extHeight(), draw: extCard });
        if (!p.ext && proof.v === 0 && proof.to === 0 && tear.v === 0 && tear.to === 0) {
          const body = tt('In jedem Dreieck ist die Summe der Innenwinkel 180°. Warum? Reiß die Ecken ab oder sieh dir den Beweis mit der Parallelen an.', 'In every triangle the interior angles add up to 180°. Why? Tear off the corners or look at the proof with a parallel line.');
          const h = noteHeight(w, body);
          if (rest() >= h) push({ h, draw: (r) => noteCard(r, tt('Merke', 'Remember'), body) });
        }
        return out;
      }
      push({ h: polySumHeight(), draw: polySumCard });
      if (p.ext && interiorAngles(target())) push({ h: extHeight(), draw: extCard });
      const note = shapeNote();
      const nh = noteHeight(w, note.body);
      const th = tableHeight(rest() - (rest() > nh + 150 ? nh + gap : 0));
      if (th > 0) push({ h: th, draw: tableCard });
      if (rest() >= nh) push({ h: nh, draw: (r) => noteCard(r, note.head, note.body, note.accent) });
      return out;
    }

    /* ---------------- Rendern ---------------- */
    function stepDisplay(now: number): boolean {
      const a = exactAngles();
      const dt = Math.min(100, now - lastFrame);
      lastFrame = now;
      if (!a) return false;
      if (disp.length !== a.length) disp = intro.v < 0.05 && !reduced ? a.map(() => 0) : [...a];
      // während des Einstiegs warten die Zahlen auf ihren Bogen
      const k = reduced ? 1 : 1 - Math.exp(-dt / (drag ? 40 : 110));
      let busy = false;
      disp = disp.map((v, i) => {
        if (!reduced && intro.v < 0.35 + (0.45 * i) / a.length) return v;
        const t = a[i]!;
        const nv = Math.abs(t - v) < 0.004 ? t : v + (t - v) * k;
        if (nv !== t) busy = true;
        return nv;
      });
      return busy;
    }

    function render(): void {
      const now = performance.now();
      hits = [];
      for (const pr of [tear, proof, split, walk, intro]) pr.step(now);
      const counting = stepDisplay(now);
      surface.begin();
      const lay = layout();
      drawPaper();
      const g = surface.g;
      g.save();
      roundRect(g, lay.paper.x, lay.paper.y, lay.paper.w, lay.paper.h, 10);
      g.clip();
      if (mode() === 'tri') {
        drawTriangle();
        if (p.ext) drawWalker(shown());
      } else drawPolygon();
      drawToast();
      g.restore();
      g.strokeStyle = ctx.theme.dark ? '#2a3445' : '#d5dce6';
      g.lineWidth = 1;
      roundRect(g, lay.paper.x + 0.5, lay.paper.y + 0.5, lay.paper.w - 1, lay.paper.h - 1, 10);
      g.stroke();
      drawCards(lay.panel, cardsFor(lay.panel));
      lastShown = shown();
      const wasWalking = walk.to === 1 && walk.v < 1;
      if (walk.to === 1 && walk.v >= 1 && walkFlag) {
        walkFlag = false;
        updateActions();
      }
      const anim = counting || morph.running || rowPop.running || toast !== null || [tear, proof, split, walk, intro].some((x) => x.busy) || wasWalking;
      if (anim) ctx.requestRender();
    }
    let walkFlag = false;

    /* ---------------- Zeiger ---------------- */
    const canDrag = () => !ctx.locked;

    function hitAt(px: number, py: number): string | null {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h.id;
      }
      if (!canDrag()) return null;
      const P = shown().map(toPx);
      let best = -1;
      let bd = 22;
      P.forEach(([x, y], i) => {
        const d = Math.hypot(px - x, py - y);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (best >= 0) return `v${best}`;
      if (insidePoly(P, px, py)) return 'body';
      return null;
    }

    function insidePoly(P: XY[], x: number, y: number): boolean {
      let inside = false;
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, yi] = P[i]!;
        const [xj, yj] = P[j]!;
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    }

    const snap = (v: number, max: number) => clamp(Math.round(v * 2) / 2, 0, max);

    function trySet(next: Pt[]): void {
      const cur = target();
      if (next.every((q, i) => q[0] === cur[i]![0] && q[1] === cur[i]![1])) return;
      if (hasDuplicate(next)) {
        if (!toast || toast.until - performance.now() < 1300) showToast(tt('Zwei Ecken dürfen nicht aufeinanderliegen.', 'Two corners must not lie on top of each other.'));
        return;
      }
      if (mode() === 'tri') {
        if (orientation(next) === 0) {
          if (!toast || toast.until - performance.now() < 1300) showToast(tt('Drei Ecken auf einer Geraden – das ist kein Dreieck.', 'Three corners on one line – that is not a triangle.'));
          return;
        }
        morph.finish();
        ctx.set({ ax: next[0]![0], ay: next[0]![1], bx: next[1]![0], by: next[1]![1], cx: next[2]![0], cy: next[2]![1] });
      } else {
        morph.finish();
        ctx.set({ pts: formatPoints(next) });
      }
    }

    function tap(id: string): void {
      if (ctx.locked) return;
      if (id.startsWith('row')) {
        const nn = Number(id.slice(3));
        if (nn !== target().length) setN(nn);
      }
    }

    function setN(nn: number): void {
      beginMorph();
      split.set(0);
      walk.set(0);
      rowPop.play();
      ctx.set({ n: nn, pts: formatPoints(regularOnGrid(nn)) });
    }

    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitAt(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const id = hitAt(q.px, q.py);
        if (!id) return false;
        if (id.startsWith('v')) {
          drag = { kind: 'vertex', i: Number(id.slice(1)) };
          walk.set(0);
          surface.setCursor('grabbing');
        } else if (id === 'body') {
          drag = { kind: 'body', start: toWorld(q.px, q.py), orig: target() };
          walk.set(0);
          surface.setCursor('grabbing');
        } else tap(id);
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!drag || !canDrag()) return;
        const [wx, wy] = toWorld(q.px, q.py);
        if (drag.kind === 'vertex') {
          const pt: Pt = [snap(wx, GRID_W), snap(wy, GRID_H)];
          const vi = drag.i;
          trySet(target().map((v, i) => (i === vi ? pt : v)));
        } else {
          const o = drag.orig;
          let dx = Math.round((wx - drag.start[0]) * 2) / 2;
          let dy = Math.round((wy - drag.start[1]) * 2) / 2;
          const xs = o.map((v) => v[0]);
          const ys = o.map((v) => v[1]);
          dx = clamp(dx, -Math.min(...xs), GRID_W - Math.max(...xs));
          dy = clamp(dy, -Math.min(...ys), GRID_H - Math.max(...ys));
          trySet(o.map((v) => [v[0] + dx, v[1] + dy] as Pt));
        }
        ctx.requestRender();
      },
      pointerUp: () => {
        drag = null;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const id = q ? hitAt(q.px, q.py) : null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(!id ? '' : id === 'body' ? 'move' : id.startsWith('v') ? 'grab' : 'pointer');
      },
      wheel: () => false,
    });

    let shownMode = mode();
    let lastN = target().length;
    startIntro();

    return {
      update(changed, source) {
        if (changed.has('mode') && mode() !== shownMode) {
          shownMode = mode();
          resetStories();
          morph.finish();
          lastShown = target();
          if (source !== 'init') startIntro();
        }
        if (mode() === 'poly' && source === 'input') {
          if (changed.has('n')) {
            setN(p.n);
            return;
          }
          if (changed.has('pts')) {
            const q = parsePoints(p.pts);
            if (q && q.length !== p.n) ctx.set({ n: q.length });
          }
        }
        if (mode() === 'poly' && source === 'replace') {
          const q = parsePoints(p.pts);
          if (q && q.length !== p.n) ctx.set({ n: q.length });
        }
        const geo = ['ax', 'ay', 'bx', 'by', 'cx', 'cy', 'pts', 'n'].some((k) => changed.has(k));
        if (geo && source === 'replace') {
          resetStories();
          beginMorph();
        }
        if (changed.has('ext') && !p.ext) walk.set(0);
        const n = target().length;
        if (n !== lastN) {
          if (source !== 'init') rowPop.play();
          lastN = n;
          // Werte der neuen Ecken zählen vom alten Stand aus weiter
          const a = exactAngles();
          if (a) disp = a.map((v, i) => disp[i] ?? v);
        }
        if (interiorAngles(target()) === null) {
          split.set(0);
          walk.set(0);
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'tear') {
          if (tear.to === 1) tear.go(0, 1300);
          else {
            proof.go(0, 400);
            proof.set(0);
            tear.set(0);
            tear.go(1, 2600);
          }
        } else if (id === 'proof') {
          if (proof.to === 1) proof.go(0, 700);
          else {
            tear.set(0);
            proof.set(0);
            proof.go(1, 5200);
          }
        } else if (id === 'split') {
          if (split.to === 1) split.go(0, 600);
          else {
            const m = triangleCount(target().length);
            split.set(0);
            split.go(1, 300 + m * 700);
          }
        } else if (id === 'regular') {
          beginMorph();
          ctx.set({ pts: formatPoints(regularOnGrid(target().length)) });
        } else if (id === 'walk') {
          walk.set(0);
          walk.go(1, target().length * 1100);
          walkFlag = true;
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      render,
      destroy: () => surface.destroy(),
    };
  },
});
