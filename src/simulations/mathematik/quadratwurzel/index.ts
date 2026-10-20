import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, TapTarget, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  exactAt,
  floorSqrt,
  heronCut,
  heronFractions,
  heronSteps,
  isPerfectSquare,
  matchingDecimals,
  nearMisses,
  nestInterval,
  nestProbes,
  sqrtDigits,
  squareCells,
  squareFactor,
  type Probe,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
type Pt = [number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Mode = 'square' | 'heron' | 'nest' | 'irr';
/** Höchster Schritt je Ansicht. */
const MAXN: Record<Mode, number> = { square: 0, heron: 6, nest: 6, irr: 5 };
/** Dauer eines Heron-Schritts (ms): markieren, Streifen umlegen, Ecke, neues Rechteck. */
const H_MARK = 650;
const H_MOVE = 1050;
const H_CORNER = 450;
const H_MORPH = 800;
const HERON_DUR = H_MARK + H_MOVE + H_CORNER + H_MORPH;
/** Intervallschachtelung: Zeit je Probe und für das Hineinzoomen (ms). */
const PROBE_MS = 360;
const ZOOM_MS = 1100;

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

/** Schritte des Widerspruchsbeweises (Formel-Kurzschrift aus formula.ts). */
const PROOF: { head: Txt; src: Txt; tone?: 'bad' | 'ok' }[] = [
  {
    head: L('Annahme', 'Assumption'),
    src: L('\\r{2} = \\f{p}{q}  \\c{m}{(vollständig gekürzt)}', '\\r{2} = \\f{p}{q}  \\c{m}{(fully reduced)}'),
  },
  {
    head: L('Quadrieren', 'Square both sides'),
    src: L('2 = \\f{p²}{q²}  ⇒  \\b{p² = 2q²}  \\c{m}{⇒ p² gerade}', '2 = \\f{p²}{q²}  ⇒  \\b{p² = 2q²}  \\c{m}{⇒ p² even}'),
  },
  {
    head: L('p ist gerade', 'p is even'),
    src: L('\\c{m}{ungerade² ist ungerade}  ⇒  p = 2r', '\\c{m}{odd² is odd}  ⇒  p = 2r'),
  },
  {
    head: L('Einsetzen', 'Substitute'),
    src: L('4r² = 2q²  ⇒  q² = 2r²  \\c{m}{⇒ q gerade}', '4r² = 2q²  ⇒  q² = 2r²  \\c{m}{⇒ q even}'),
  },
  {
    head: L('Widerspruch', 'Contradiction'),
    src: L('\\c{b}{p und q gerade – der Bruch war nicht gekürzt!}', '\\c{b}{p and q both even – not reduced after all!}'),
    tone: 'bad',
  },
  {
    head: L('Ergebnis', 'Conclusion'),
    src: L('\\c{r}{\\r{2} ist kein Bruch: \\b{irrational}}', '\\c{r}{\\r{2} is not a fraction: \\b{irrational}}'),
    tone: 'ok',
  },
];

/**
 * Quadratwurzeln für die 9. Jahrgangsstufe in vier Ansichten:
 * „Quadrat und Wurzel“ (a Einheitsquadrate auf Kästchenpapier, gelegt als
 * wachsende Quadrate 1, 4, 9, …; dazwischen passt es nicht genau),
 * „Heron-Verfahren“ (Hauptanimation: Vom Rechteck mit Fläche a wird ein
 * Streifen abgeschnitten und angelegt – fast ein Quadrat; das neue Rechteck hat
 * als Seite den Mittelwert, die Fläche bleibt a; Zahlengerade mit Lupe und
 * Tabelle mit den richtigen Stellen), „Intervallschachtelung“ (Proben durch
 * Quadrieren, Zoom von Stelle zu Stelle, Teilintervall antippen) und
 * „√2 ist irrational“ (Quadrat über der Diagonale aus vier halben
 * Einheitsquadraten, Widerspruchsbeweis Schritt für Schritt, Fast-Treffer p/q).
 */
export default defineSimulation({
  id: 'quadratwurzel',
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.42 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'square', label: L('Quadrat und Wurzel', 'Square and root') },
        { value: 'heron', label: L('Heron-Verfahren', 'Heron’s method') },
        { value: 'nest', label: L('Intervallschachtelung', 'Nested intervals') },
        { value: 'irr', label: L('√2 ist irrational', '√2 is irrational') },
      ],
      default: 'heron',
    },
    {
      key: 'a',
      type: 'number',
      label: L('Radikand a (Flächeninhalt)', 'Radicand a (area)'),
      help: L('Bei „Quadrat und Wurzel“ auch die Ecke des grünen Quadrats ziehen.', 'In “Square and root” you can also drag the corner of the green square.'),
      min: 1,
      max: 200,
      step: 1,
      default: 2,
      visibleIf: (v) => v.mode !== 'irr',
    },
    {
      key: 'x0',
      type: 'number',
      label: L('Startlänge x₀', 'Starting length x₀'),
      help: L('Das Start-Rechteck hat die Seiten x₀ und a : x₀. Bei Schritt 0 auch die rechte untere Ecke ziehen.', 'The starting rectangle has the sides x₀ and a : x₀. At step 0 you can also drag the bottom right corner.'),
      min: 1,
      max: 20,
      step: 0.5,
      default: 2,
      visibleIf: (v) => v.mode === 'heron',
    },
    {
      key: 'n',
      type: 'number',
      label: L('Schritt n', 'Step n'),
      help: L('Auch mit „Nächster Schritt“; bei der Intervallschachtelung auch das richtige Teilintervall antippen.', 'Also with “Next step”; with nested intervals you can also tap the right subinterval.'),
      min: 0,
      max: 6,
      step: 1,
      default: 0,
      visibleIf: (v) => v.mode !== 'square',
    },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Kästchenpapier', 'Squared paper'), default: true, visibleIf: (v) => v.mode === 'square' || v.mode === 'heron' },
    {
      key: 'show',
      type: 'boolean',
      group: 'view',
      label: L('Werte zeigen', 'Show values'),
      help: L('Aus: √a und die Näherungswerte erscheinen als „?“ – im Bild und in den Karten (für Aufgaben).', 'Off: √a and the approximations appear as “?” – in the picture and on the cards (for tasks).'),
      default: true,
    },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true, visibleIf: (v) => v.mode !== 'square' },
    { id: 'play', label: L('Alles abspielen', 'Play all'), visibleIf: (v) => v.mode !== 'square' },
    { id: 'restart', label: L('Von vorn', 'Start again'), visibleIf: (v) => v.mode !== 'square' },
    { id: 'build', label: L('Quadrat legen', 'Lay the square'), primary: true, visibleIf: (v) => v.mode === 'square' },
    { id: 'diag', label: L('Quadrat über der Diagonale legen', 'Lay the square on the diagonal'), visibleIf: (v) => v.mode === 'irr' },
  ],
  readouts: [
    { key: 'now', label: L('Aktueller Schritt', 'Current step'), spoiler: true },
    { key: 'sq', label: L('Einordnung zwischen Quadratzahlen', 'Between square numbers'), spoiler: true },
    { key: 'root', label: L('Wurzel', 'Root'), spoiler: true },
    { key: 'simp', label: L('Wurzel vereinfachen', 'Simplifying the root'), spoiler: true },
  ],
  presets: [
    { id: 'two', label: L('√2 mit Heron', '√2 with Heron'), values: {} },
    { id: 'ten', label: L('√10: Start mit dem Rechteck 10 × 1', '√10: start with the 10 × 1 rectangle'), values: { a: 10, x0: 10 } },
    { id: 'square', label: L('Quadratzahl: √49 aus Kästchen', 'Perfect square: √49 from unit squares'), values: { mode: 'square', a: 49 } },
    { id: 'fifty', label: L('√50 = 5 · √2', '√50 = 5 · √2'), values: { mode: 'square', a: 50 } },
    { id: 'nest2', label: L('√2 einschachteln', 'Nesting √2'), values: { mode: 'nest', a: 2 } },
    { id: 'irr', label: L('√2 ist kein Bruch', '√2 is not a fraction'), values: { mode: 'irr' } },
  ],
  strings: {
    de: {
      canvas:
        'Quadratwurzeln in vier Ansichten. Quadrat und Wurzel: Einheitsquadrate auf Kästchenpapier, gelegt als wachsende Quadrate; das grüne Quadrat hat den Flächeninhalt a und die Seitenlänge √a. Heron-Verfahren: Ein Rechteck mit dem Flächeninhalt a wird Schritt für Schritt zum Quadrat, darunter eine Zahlengerade, auf der sich x und a : x an √a heranschieben. Intervallschachtelung: Zahlengerade mit Lupe und Proben durch Quadrieren. √2 ist irrational: Quadrat über der Diagonale des Einheitsquadrats und Widerspruchsbeweis. Rechts bzw. darunter Karten mit Rechnung, Tabelle und Merksatz.',
    },
    en: {
      canvas:
        'Square roots in four views. Square and root: unit squares on squared paper, laid as growing squares; the green square has area a and side √a. Heron’s method: a rectangle with area a becomes a square step by step, with a number line below on which x and a : x close in on √a. Nested intervals: number line with a magnifier and checks by squaring. √2 is irrational: square on the diagonal of the unit square and proof by contradiction. Cards with working, table and key facts on the right or below.',
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
    const mode = () => p.mode as Mode;
    const maxN = (m: Mode = mode()) => MAXN[m];
    const nOf = (m: Mode = mode()) => clamp(Math.round(p.n), 0, maxN(m));
    const aInt = () => Math.round(p.a);
    const editable = () => !ctx.locked;

    /* ---------- Farben: gleiche Größe = gleiche Farbe ---------- */
    const col = {
      /** Länge x / Näherung von oben */
      x: () => th().series[0]!,
      /** Breite a : x / Näherung von unten */
      y: () => th().series[3]!,
      /** √a, Zielquadrat */
      r: () => th().series[2]!,
      /** Flächeninhalt a */
      a: () => th().series[4]!,
      /** zu groß, Widerspruch, Rest */
      bad: () => th().series[1]!,
    };

    /* ---------- Zahlen ---------- */
    const N = (v: number, d = 4) => fmt.num(v, d);
    const Fx = (v: number, d: number) => fmt.fixed(v, d);
    const sep = lang === 'de' ? ',' : '.';
    const root = () => Math.sqrt(aInt());
    const hide = () => !p.show;

    /* ---------- angezeigter Zustand ---------- */
    const A = new Chan(p.a);
    const X0 = new Chan(p.x0);
    /** Heron: gezeigter (stetiger) Schritt */
    const HN = new Chan(nOf('heron'));
    /** Heron: Ausdehnung der Zeichnung in Einheiten (Breite, Höhe) */
    const EW = new Chan(1);
    const EH = new Chan(1);
    /** Heron: Bereich der Zahlengerade (log10 der Breite, Mitte) */
    const HL = new Chan(0);
    const HC = new Chan(1);
    /** Intervallschachtelung: Ansicht der Lupe (log10 der Breite, Mitte) */
    const NW = new Chan(0);
    const NC = new Chan(1.5);
    /** Quadrat: gezeigte Anzahl Kästchen und Ausdehnung */
    const CN = new Chan(p.a);
    const SE = new Chan(3);
    const KG = new Chan(p.grid ? 1 : 0);
    const chans = [A, X0, HN, EW, EH, HL, HC, NW, NC, CN, SE, KG];

    let intro: number | null = null;
    let modeFade: { from: Mode; t0: number } | null = null;
    let cardFade: number | null = null;
    /** laufender Schritt (vorwärts mit Animation) */
    let step: { mode: Mode; from: number; to: number; t0: number; dur: number; zoomed: boolean } | null = null;
    let build: { t0: number; dur: number } | null = null;
    let diag: { t0: number; dur: number } | null = null;
    let wrongTap: { j: number; t0: number } | null = null;
    let autoplay = false;
    let autoTimer: ReturnType<typeof setTimeout> | null = null;
    let prevN = p.n;
    let prevMode: Mode = mode();
    let lastTime = performance.now();
    let drag: 'x0' | 'corner' | null = null;
    let hover: 'x0' | 'corner' | null = null;
    let hoverSub = -1;
    let lastDrag = -Infinity;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;

    /* ---------- Aufteilung ---------- */
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    function regions(): { stage: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.35, 236, 380));
        return { stage: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 0, w: cw, h }, wide: true };
      }
      const sh = Math.round(clamp(h * 0.47, 300, w * 1.12));
      return { stage: { x: 0, y: 0, w, h: sh }, col: { x: 0, y: sh + 10, w, h: h - sh - 10 }, wide: false };
    }

    /* ---------- Formeln ---------- */
    const palette = (): Record<string, string> => ({ x: col.x(), y: col.y(), r: col.r(), a: col.a(), b: col.bad(), m: th().muted });
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({ size, font: th().font, mathFont: th().mathFont, color, weight, palette: palette() });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 10.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    /** Wörter aufrecht setzen (sonst würden einzelne Buchstaben kursiv). */
    const up = (s: string) => `\\t{${s}}`;
    /** √a als Formel. */
    const rt = (a: number | string = aInt()) => `\\r{${a}}`;

    /* ---------- Zeichenhilfen ---------- */
    function card(r: Rect, accent?: string): void {
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
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.14 : 0.08));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
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
      let tsz = fs(13.5, 12.5);
      const rb = right ? formula(g, right, fstyle(fs(12.5, 11.5), color, 700)) : null;
      const room0 = R.w - 2 * pad - 15 - (rb ? rb.w + 10 : 0);
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
      if (rb) rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      return ty;
    }

    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      for (const para of str.split('\n')) {
        let cur = '';
        for (const w of para.split(' ')) {
          const test = cur ? `${cur} ${w}` : w;
          if (g.measureText(test).width > maxW && cur) {
            lines.push(cur);
            cur = w;
          } else cur = test;
        }
        if (cur) lines.push(cur);
      }
      return lines;
    }

    function label(str: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center', halo = false): void {
      const g = surface.g;
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      if (halo) {
        g.lineWidth = 4;
        g.lineJoin = 'round';
        g.strokeStyle = th().dark ? 'rgba(21,28,39,0.92)' : 'rgba(255,255,255,0.95)';
        g.strokeText(str, x, y);
      }
      g.fillStyle = color;
      g.fillText(str, x, y);
    }

    /** Formel-Pille um den Punkt (x, y); align bezieht sich auf x; an `bounds` geklemmt. */
    function fpill(
      x: number,
      y: number,
      src: string,
      opts: { color?: string; border?: string; size?: number; alpha?: number; bounds?: Rect; align?: 'left' | 'center' | 'right'; fill?: string; scale?: number } = {},
    ): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const box = formula(g, src, fstyle(size, opts.color ?? th().text, 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x + 8 : align === 'right' ? x - box.w - 8 : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 9, opts.bounds.x + opts.bounds.w - box.w - 9);
      let base = y + (box.asc - box.desc) / 2;
      if (opts.bounds) base = clamp(base, opts.bounds.y + box.asc + 6, opts.bounds.y + opts.bounds.h - box.desc - 6);
      const rr = { x: left - 8, y: base - box.asc - 4, w: box.w + 16, h: box.asc + box.desc + 8 };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      const sc = opts.scale ?? 1;
      if (sc !== 1) {
        const cx = rr.x + rr.w / 2;
        const cy = rr.y + rr.h / 2;
        g.translate(cx, cy);
        g.scale(sc, sc);
        g.translate(-cx, -cy);
      }
      g.save();
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.94)' : 'rgba(255,255,255,0.96)');
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 7;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.4;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
      }
      box.draw(g, left, base);
      g.restore();
      return rr;
    }

    function dot(x: number, y: number, color: string, r: number, alpha = 1): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01) return;
      g.save();
      g.globalAlpha *= alpha;
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
      g.strokeStyle = th().dark ? '#151c27' : '#ffffff';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
      g.restore();
    }

    function arrowHead(x: number, y: number, ux: number, uy: number, color: string, size = 7): void {
      const g = surface.g;
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x - ux * size - uy * size * 0.5, y - uy * size + ux * size * 0.5);
      g.lineTo(x - ux * size + uy * size * 0.5, y - uy * size - ux * size * 0.5);
      g.closePath();
      g.fill();
    }

    function poly(pts: Pt[]): void {
      const g = surface.g;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
    }

    /** Schöne Teilung für eine Achse: Schrittweite 1, 2 oder 5 · 10^k mit mindestens `minPx` Abstand. */
    function niceStep(span: number, px: number, minPx: number): number {
      const raw = (span * minPx) / Math.max(1, px);
      const pw = 10 ** Math.floor(Math.log10(raw));
      for (const m of [1, 2, 5, 10]) if (m * pw >= raw) return m * pw;
      return 10 * pw;
    }
    const decOf = (stepV: number) => Math.max(0, Math.min(12, Math.round(-Math.log10(stepV) + 0.4999)));

    /* =====================================================================
     * Einstieg
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
      if (t > 3000) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 150) / 1100)),
        labels: ease.outCubic(clamp01((t - 900) / 650)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1500),
      };
    }

    /* =====================================================================
     * Heron-Verfahren
     * ===================================================================== */
    const steps = () => heronSteps(A.v, X0.v, 8);
    const stepsExact = () => heronSteps(aInt(), p.x0, 8);
    /** x zum (stetigen) Schritt s: zwischen zwei Schritten geometrisch gemittelt, damit x · (a : x) = a bleibt. */
    function xAt(s: number): number {
      const list = steps();
      const i = clamp(Math.floor(s), 0, 7);
      const f = clamp01(s - i);
      const x0 = list[i]!.x;
      const x1 = list[i + 1]!.x;
      return Math.exp(lerp(Math.log(x0), Math.log(x1), f));
    }

    interface HeronView {
      /** Rechteck (Breite x, Höhe a : x) – im Normalfall */
      x: number;
      y: number;
      /** Schrittanimation: Phasenfortschritte 0 … 1 */
      anim: { from: number; mark: number; move: number; corner: number; morph: number } | null;
    }
    function heronView(now: number): HeronView {
      if (step && step.mode === 'heron' && step.to === step.from + 1) {
        const t = now - step.t0;
        const x = steps()[step.from]!.x;
        const quick = step.dur < HERON_DUR;
        if (quick) {
          const k = ease.inOutCubic(clamp01(t / step.dur));
          const xx = xAt(step.from + k);
          return { x: xx, y: A.v / xx, anim: null };
        }
        return {
          x,
          y: A.v / x,
          anim: {
            from: step.from,
            mark: ease.outCubic(clamp01(t / H_MARK)),
            move: ease.inOutCubic(clamp01((t - H_MARK) / H_MOVE)),
            corner: ease.outCubic(clamp01((t - H_MARK - H_MOVE) / H_CORNER)),
            morph: ease.inOutCubic(clamp01((t - H_MARK - H_MOVE - H_CORNER) / H_MORPH)),
          },
        };
      }
      const x = xAt(HN.v);
      return { x, y: A.v / x, anim: null };
    }

    /** Ziel-Ausdehnung der Heron-Zeichnung (für Maßstab). */
    function heronExtent(withStep = true): { w: number; h: number } {
      const list = stepsExact();
      const n = nOf('heron');
      const xs = [list[n]!.x, Math.sqrt(aInt())];
      const ys = [list[n]!.y, Math.sqrt(aInt())];
      if (withStep && step && step.mode === 'heron') {
        const f = list[step.from]!;
        xs.push(f.x, heronCut(aInt(), f.x).next);
        ys.push(f.y, heronCut(aInt(), f.x).next);
      }
      return { w: Math.max(...xs), h: Math.max(...ys) };
    }

    /** Bereich der Zahlengerade (Mitte, log10 der Breite) für Schritt n. */
    function heronLine(n: number): { c: number; lw: number } {
      const list = stepsExact();
      const q = list[n]!;
      const r = Math.sqrt(aInt());
      const lo = Math.min(q.x, q.y, r);
      const hi = Math.max(q.x, q.y, r);
      const span = Math.max(hi - lo, r * 4e-7);
      return { c: (lo + hi) / 2, lw: Math.log10(span * 1.7) };
    }

    let heronHit: { knob: Pt | null } = { knob: null };
    let heronMap: { ox: number; oy: number; sc: number } | null = null;

    function drawHeron(R: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      card(R);
      const pad = fs(16, 12);
      const lineH = fs(96, 90);
      const top = R.y + fs(48, 44);
      const area: Rect = { x: R.x + pad, y: top, w: R.w - 2 * pad, h: R.y + R.h - lineH - top - 6 };
      const V = heronView(now);
      const a = A.v;
      const r = Math.sqrt(a);
      const n = nOf('heron');
      const hs = hide();
      // Maßstab: Ausdehnung gleitet, Rand für Beschriftungen in Pixeln
      const lf = `700 ${fs(13, 12)}px ${theme.font}`;
      g.font = lf;
      const rightLab = Math.min(150, g.measureText('a : x₆ = 99,9999').width + 18);
      const availW = Math.max(40, area.w - rightLab - 6);
      const availH = Math.max(40, area.h - 34);
      const sc = Math.min(availW / Math.max(EW.v, 1e-6), availH / Math.max(EH.v, 1e-6));
      const ox = area.x + (availW - EW.v * sc) / 2;
      const oy = area.y + 8 + (availH + EH.v * sc) / 2;
      heronMap = { ox, oy, sc };
      const M = (u: number, v: number): Pt => [ox + u * sc, oy - v * sc];
      const grow = k.reveal;

      // Kästchenpapier im ganzen Zeichenbereich (zart)
      if (sc >= 9 && KG.v > 0.01) {
        g.save();
        g.beginPath();
        g.rect(area.x, area.y, area.w, area.h);
        g.clip();
        g.strokeStyle = withAlpha(theme.dark ? '#7f8ea3' : '#7a8aa0', (theme.dark ? 0.14 : 0.12) * KG.v * k.panel);
        g.lineWidth = 1;
        g.beginPath();
        const i0 = Math.floor((area.x - ox) / sc);
        const i1 = Math.ceil((area.x + area.w - ox) / sc);
        for (let i = i0; i <= i1; i++) {
          const xx = Math.round(ox + i * sc) + 0.5;
          g.moveTo(xx, area.y);
          g.lineTo(xx, area.y + area.h);
        }
        const j0 = Math.floor((oy - area.y - area.h) / sc);
        const j1 = Math.ceil((oy - area.y) / sc);
        for (let j = j0; j <= j1; j++) {
          const yy = Math.round(oy - j * sc) + 0.5;
          g.moveTo(area.x, yy);
          g.lineTo(area.x + area.w, yy);
        }
        g.stroke();
        g.restore();
      }

      // frühere Rechtecke als zarte Umrisse
      const list = steps();
      const lastGhost = V.anim ? V.anim.from : Math.floor(HN.v + 1e-6);
      g.save();
      g.beginPath();
      g.rect(R.x + 4, area.y - 6, R.w - 8, area.h + 12);
      g.clip();
      g.strokeStyle = withAlpha(theme.text, theme.dark ? 0.2 : 0.16);
      g.lineWidth = 1.2;
      for (let i = 0; i < lastGhost && i < list.length; i++) {
        const q = list[i]!;
        const [x0, y0] = M(0, q.y);
        g.strokeRect(x0, y0, q.x * sc, q.y * sc);
      }
      g.restore();

      // Zielquadrat √a
      g.save();
      g.globalAlpha *= k.labels;
      g.setLineDash([7, 5]);
      g.strokeStyle = col.r();
      g.lineWidth = 2.2;
      const [qx, qy] = M(0, r);
      g.strokeRect(qx, qy, r * sc, r * sc);
      g.restore();

      const fillRect = (pts: Pt[], alpha = 1, strong = false) => {
        g.save();
        g.globalAlpha *= alpha;
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
        g.shadowBlur = 12;
        g.shadowOffsetY = 4;
        const xs = pts.map((q) => q[0]);
        const ys = pts.map((q) => q[1]);
        const grad = g.createLinearGradient(Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys));
        grad.addColorStop(0, withAlpha(col.a(), theme.dark ? (strong ? 0.6 : 0.42) : strong ? 0.45 : 0.26));
        grad.addColorStop(1, withAlpha(col.a(), theme.dark ? (strong ? 0.45 : 0.28) : strong ? 0.32 : 0.16));
        g.fillStyle = grad;
        poly(pts);
        g.fill();
        g.restore();
        g.restore();
      };
      const unitLines = (clipPts: Pt[], alpha: number) => {
        if (sc < 9 || alpha <= 0.01) return;
        g.save();
        poly(clipPts);
        g.clip();
        g.strokeStyle = withAlpha(theme.text, (theme.dark ? 0.24 : 0.2) * alpha);
        g.lineWidth = 1;
        g.beginPath();
        const xs = clipPts.map((q) => q[0]);
        const ys = clipPts.map((q) => q[1]);
        for (let i = 1; ox + i * sc < Math.max(...xs); i++) {
          const xx = Math.round(ox + i * sc) + 0.5;
          g.moveTo(xx, Math.min(...ys));
          g.lineTo(xx, Math.max(...ys));
        }
        for (let j = 1; oy - j * sc > Math.min(...ys); j++) {
          const yy = Math.round(oy - j * sc) + 0.5;
          g.moveTo(Math.min(...xs), yy);
          g.lineTo(Math.max(...xs), yy);
        }
        g.stroke();
        g.restore();
      };
      const rectPts = (w: number, h: number): Pt[] => [M(0, 0), M(w, 0), M(w, h), M(0, h)];
      /** Rechteck mit farbigen Seiten (x waagerecht blau, a : x senkrecht orange). */
      const drawRect = (w: number, h: number, alpha: number, growK = 1) => {
        if (alpha <= 0.01) return;
        const ww = w * growK;
        const hh = h * growK;
        const pts = rectPts(ww, hh);
        fillRect(pts, alpha, false);
        unitLines(pts, alpha * KG.v);
        g.save();
        g.globalAlpha *= alpha;
        g.lineCap = 'round';
        const [x0, y0] = M(0, 0);
        const [x1, y1] = M(ww, hh);
        g.strokeStyle = col.x();
        g.lineWidth = 3.4;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y0);
        g.moveTo(x0, y1);
        g.lineTo(x1, y1);
        g.stroke();
        g.strokeStyle = col.y();
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x0, y1);
        g.moveTo(x1, y0);
        g.lineTo(x1, y1);
        g.stroke();
        g.restore();
      };

      const an = V.anim;
      let labX = V.x;
      let labY = V.y;
      let labIdx = an ? an.from : Math.round(HN.v);
      let labAlpha = k.labels;
      if (!an) {
        drawRect(V.x, V.y, 1, grow);
      } else {
        // Umlegen: lange Seite L, kurze Seite S, Streifen der Breite d
        const cut = heronCut(a, V.x);
        const { long: Lg, short: S, d } = cut;
        const Mm = (u: number, v: number): Pt => (cut.longIsX ? M(u, v) : M(v, u));
        const rest: Pt[] = [Mm(0, 0), Mm(S + d, 0), Mm(S + d, S), Mm(0, S)];
        const morph = an.morph;
        const shapeA = 1 - morph;
        // Rest des Rechtecks
        fillRect(rest, shapeA);
        unitLines(rest, shapeA * KG.v);
        // ursprüngliche Lage des Streifens: gestrichelt
        g.save();
        g.globalAlpha *= shapeA * (an.move > 0 ? 1 : an.mark);
        g.setLineDash([5, 4]);
        g.strokeStyle = withAlpha(col.a(), 0.9);
        g.lineWidth = 1.6;
        poly([Mm(S + d, 0), Mm(Lg, 0), Mm(Lg, S), Mm(S + d, S)]);
        g.stroke();
        g.restore();
        // Schnittlinie
        if (an.move < 0.05) {
          g.save();
          g.globalAlpha *= an.mark * (1 - an.move * 20);
          g.setLineDash([3, 4]);
          g.strokeStyle = col.bad();
          g.lineWidth = 2;
          const [c0x, c0y] = Mm(S + d, -0.04 * S);
          const [c1x, c1y] = Mm(S + d, S * 1.06);
          g.beginPath();
          g.moveTo(c0x, c0y);
          g.lineTo(c1x, c1y);
          g.stroke();
          g.restore();
        }
        // bewegter Streifen: Drehung um 90° und Verschiebung an die kurze Seite
        const e = an.move;
        const c0: Pt = [S + d + d / 2, S / 2];
        const c1: Pt = [S / 2, S + d / 2];
        const lift = Math.sin(Math.PI * e) * Math.max(d, S * 0.25) * 0.9;
        const cu = lerp(c0[0], c1[0], e) + lift * 0.3;
        const cv = lerp(c0[1], c1[1], e) + lift;
        const th0 = (e * Math.PI) / 2;
        const corner = (su: number, sv: number): Pt => {
          const lu = (su * d) / 2;
          const lv = (sv * S) / 2;
          return Mm(cu + lu * Math.cos(th0) - lv * Math.sin(th0), cv + lu * Math.sin(th0) + lv * Math.cos(th0));
        };
        const stripPts: Pt[] = [corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1)];
        g.save();
        g.globalAlpha *= shapeA;
        fillRect(stripPts, 1, true);
        g.strokeStyle = col.a();
        g.lineWidth = 1.8;
        poly(stripPts);
        g.stroke();
        g.restore();
        // fehlende Ecke d²
        if (an.corner > 0.01 && d * sc > 3) {
          g.save();
          g.globalAlpha *= an.corner * shapeA;
          g.setLineDash([4, 3]);
          g.strokeStyle = col.bad();
          g.lineWidth = 1.8;
          poly([Mm(S, S), Mm(S + d, S), Mm(S + d, S + d), Mm(S, S + d)]);
          g.fillStyle = withAlpha(col.bad(), theme.dark ? 0.2 : 0.12);
          g.fill();
          g.stroke();
          g.restore();
        }
        // Umriss des Fast-Quadrats
        g.save();
        g.globalAlpha *= shapeA * an.mark;
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        poly(rest);
        g.stroke();
        g.restore();
        // neues Rechteck
        const xn = cut.next;
        drawRect(xn, a / xn, morph);
        if (morph > 0.5) {
          labX = xn;
          labY = a / xn;
          labIdx = an.from + 1;
          labAlpha = (morph - 0.5) * 2;
        } else labAlpha = an.move > 0 ? 0 : 1 - an.mark * 0.4;
        // Hinweise
        const hb = R;
        if (an.mark > 0.05 && an.move < 1) {
          const [sx, sy] = Mm(S + d + d / 2, S + Math.min(S * 0.15, 18 / sc));
          fpill(sx, sy - 14, `\\c{a}{${up(say(L('Streifen', 'strip')))}} \\c{m}{\\f{x − a : x}{2}}`.replace('x − a : x', cut.longIsX ? 'x − a : x' : 'a : x − x'), { size: fs(12, 11), alpha: an.mark * (1 - an.move), bounds: hb, border: withAlpha(col.a(), 0.5) });
        }
        if (an.corner > 0.05 && morph < 1) {
          const [cx, cy] = Mm(S + d, S + d);
          fpill(cx, cy - 16, `\\c{b}{${up(say(L('fehlt', 'missing')))}: d²}`, { size: fs(12, 11), alpha: an.corner * (1 - morph), bounds: hb, align: 'left', border: withAlpha(col.bad(), 0.5) });
        }
      }

      // Beschriftungen der Seiten
      const [bx0, by0] = M(0, 0);
      const [bx1, by1] = M(labX * grow, labY * grow);
      const xv = hs && labIdx > 0 ? '?' : N(labX, 5);
      const yv = hs && labIdx > 0 ? '?' : N(labY, 5);
      if (labAlpha > 0.01) {
        fpill((bx0 + bx1) / 2, by0 + 17, `\\c{x}{x_${labIdx} = ${xv}}`, { size: fs(13, 12), alpha: labAlpha, bounds: area });
        const ylab = `\\c{y}{a : x_${labIdx} = ${yv}}`;
        const yb = formula(g, ylab, fstyle(fs(13, 12), th().text, 700));
        if (bx1 + 10 + yb.w + 16 < R.x + R.w - 4) fpill(bx1, (by0 + by1) / 2, ylab, { size: fs(13, 12), alpha: labAlpha, align: 'left' });
        else fpill(bx1, by1 - 16, ylab, { size: fs(13, 12), alpha: labAlpha, align: 'right', bounds: area });
        // Fläche bleibt a
        const w = Math.abs(bx1 - bx0);
        const h = Math.abs(by1 - by0);
        if (w > 60 && h > 26) fpill((bx0 + bx1) / 2, (by0 + by1) / 2, `\\c{a}{A = ${N(a, 0)}}`, { size: fs(15, 13), alpha: labAlpha, border: withAlpha(col.a(), 0.55) });
      }
      // √a am Zielquadrat
      fpill(qx, qy - 13, `\\c{r}{${rt(aInt())} ${hs ? '= ?' : isPerfectSquare(aInt()) ? `= ${N(r, 0)}` : `≈ ${N(r, 4)}`}}`, { size: fs(12.5, 11.5), alpha: k.labels * 0.95, align: 'left', bounds: { x: R.x, y: R.y + 36, w: R.w, h: R.h } });
      // Griff an der rechten unteren Ecke (nur bei Schritt 0)
      heronHit = { knob: null };
      if (n === 0 && !an && !step && editable() && Math.abs(HN.v) < 1e-3) {
        const [kx, ky] = M(V.x, 0);
        heronHit = { knob: [kx, ky] };
        const hot = hover === 'x0' || drag === 'x0';
        dot(kx, ky, col.x(), hot ? 8.5 : 7, k.labels);
        if (hot) {
          g.save();
          g.strokeStyle = withAlpha(col.x(), 0.35);
          g.lineWidth = 6;
          g.beginPath();
          g.arc(kx, ky, 13, 0, TAU);
          g.stroke();
          g.restore();
        }
      }
      // Kopfzeile
      const sub = `${say(L('Schritt', 'Step'))} ${an ? an.from + 1 : n}`;
      g.font = `650 ${fs(12, 11)}px ${theme.font}`;
      const subW = g.measureText(sub).width + 14;
      let title = n === 0 && !an ? say(L('Start: Rechteck mit dem Flächeninhalt a', 'Start: rectangle with area a')) : say(L('Das Rechteck wird quadratischer – die Fläche bleibt', 'The rectangle gets more square – the area stays'));
      g.font = `700 ${fs(13.5, 12)}px ${theme.font}`;
      if (g.measureText(title).width > R.w - 2 * pad - subW) title = n === 0 && !an ? say(L('Start: Rechteck mit Fläche a', 'Start: rectangle, area a')) : say(L('Fast ein Quadrat – Fläche bleibt', 'Almost a square – same area'));
      label(title, R.x + pad, R.y + 22, `700 ${fs(13.5, 12)}px ${theme.font}`, theme.text, 'left');
      label(sub, R.x + R.w - pad, R.y + 22, `650 ${fs(12, 11)}px ${theme.font}`, theme.muted, 'right');

      drawHeronLine({ x: R.x + pad, y: R.y + R.h - lineH, w: R.w - 2 * pad, h: lineH - 8 }, V, k, now);
    }

    /** Zahlengerade unter dem Rechteck: x und a : x rücken von beiden Seiten an √a heran. */
    function drawHeronLine(B: Rect, V: HeronView, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const a = A.v;
      const r = Math.sqrt(a);
      const hs = hide();
      // Trennlinie
      g.strokeStyle = theme.dark ? '#273142' : '#e8ecf2';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(B.x, B.y);
      g.lineTo(B.x + B.w, B.y);
      g.stroke();
      const yl = B.y + 50;
      const x0 = B.x + 10;
      const x1 = B.x + B.w - 10;
      const span = 10 ** HL.v;
      const lo = HC.v - span / 2;
      const X = (v: number) => x0 + ((v - lo) / span) * (x1 - x0);
      g.save();
      g.globalAlpha *= k.reveal;
      // Achse
      g.strokeStyle = theme.text;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(x0 - 6, yl);
      g.lineTo(x1 + 2, yl);
      g.stroke();
      arrowHead(x1 + 8, yl, 1, 0, theme.text, 7);
      // Teilung
      const st = niceStep(span, x1 - x0, fs(78, 70));
      const dec = decOf(st);
      const minor = st / 5;
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1;
      g.beginPath();
      for (let v = Math.ceil(lo / minor) * minor; v <= lo + span; v += minor) {
        const xx = Math.round(X(v)) + 0.5;
        g.moveTo(xx, yl - 3);
        g.lineTo(xx, yl + 3);
      }
      g.stroke();
      const tf = `600 ${fs(11.5, 11)}px ${theme.font}`;
      const xr0 = X(r);
      for (let i = Math.ceil(lo / st); i * st <= lo + span; i++) {
        const v = i * st;
        const xx = X(v);
        if (xx < x0 - 1 || xx > x1 + 1) continue;
        g.font = tf;
        const tw = g.measureText(fmt.fixed(v, dec)).width;
        const clash = !hs && Math.abs(xx - xr0) < tw / 2 + 26;
        g.strokeStyle = withAlpha(theme.text, 0.7);
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(xx, yl - 6);
        g.lineTo(xx, yl + 6);
        g.stroke();
        if (!clash) label(fmt.fixed(v, dec), xx, yl + 16, tf, theme.muted);
      }
      g.restore();
      // √a als grüne Marke
      if (!hs) {
        const xr = X(r);
        if (xr >= x0 - 2 && xr <= x1 + 2) {
          g.save();
          g.globalAlpha *= k.labels;
          g.strokeStyle = col.r();
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(xr, yl - 10);
          g.lineTo(xr, yl + 10);
          g.stroke();
          g.restore();
          fpill(xr, yl + 19, `\\c{r}{${rt()}}`, { size: fs(12, 11), alpha: k.labels, bounds: B });
        }
      }
      // x und a : x
      const an = V.anim;
      let xs = V.x;
      let ys = a / V.x;
      let idx = an ? an.from : Math.round(HN.v);
      if (an && an.morph > 0) {
        const xn = heronCut(a, V.x).next;
        xs = Math.exp(lerp(Math.log(V.x), Math.log(xn), an.morph));
        ys = a / xs;
        if (an.morph > 0.5) idx = an.from + 1;
      }
      const px = clamp(X(xs), x0 - 4, x1 + 4);
      const py = clamp(X(ys), x0 - 4, x1 + 4);
      dot(py, yl, col.y(), 6.5, k.reveal);
      dot(px, yl, col.x(), 6.5, k.reveal);
      // Namen über den Punkten (nach außen ausgerichtet)
      const nsz = fs(12, 11);
      const leftIsY = py <= px;
      fpill(leftIsY ? py : px, yl - 17, leftIsY ? `\\c{y}{a : x_${idx}}` : `\\c{x}{x_${idx}}`, { size: nsz, align: 'right', alpha: k.labels, bounds: B });
      fpill(leftIsY ? px : py, yl - 17, leftIsY ? `\\c{x}{x_${idx}}` : `\\c{y}{a : x_${idx}}`, { size: nsz, align: 'left', alpha: k.labels, bounds: B });
      // Mittelwert markieren
      if (an && an.mark > 0.01 && an.morph < 1) {
        const m = (V.x + a / V.x) / 2;
        const pm = X(m);
        const al = an.mark * (1 - an.morph);
        g.save();
        g.globalAlpha *= al;
        g.strokeStyle = col.x();
        g.lineWidth = 1.8;
        const apex = yl - 34;
        for (const sx of [X(V.x), X(a / V.x)]) {
          const s0 = clamp(sx, x0 - 4, x1 + 4);
          g.beginPath();
          g.moveTo(s0, yl - 9);
          g.quadraticCurveTo((s0 + pm) / 2, apex - 6, pm, apex + 2);
          g.stroke();
        }
        g.fillStyle = col.x();
        poly([
          [pm, yl - 4],
          [pm - 6, yl - 14],
          [pm + 6, yl - 14],
        ]);
        g.fill();
        g.restore();
        fpill(pm, apex - 8, `\\c{x}{${up(say(L('Mittelwert', 'mean')))}}`, { size: fs(11.5, 11), alpha: al, bounds: B });
      }
      // Lupe
      const zoom = Math.round(Math.log10(heronLineSpan0() / span));
      if (zoom >= 1) fpill(B.x + B.w, B.y + 14, `\\c{m}{${up(say(L('Lupe', 'zoom')))} ×10^{${zoom}}}`, { size: fs(11.5, 11), align: 'right', alpha: k.labels * 0.95, bounds: B });
      void now;
    }
    const heronLineSpan0 = () => 10 ** heronLine(0).lw;

    /* =====================================================================
     * Quadrat und Wurzel (Kästchenpapier)
     * ===================================================================== */
    let squareHit: { corner: Pt | null; ox: number; oy: number; cell: number } = { corner: null, ox: 0, oy: 0, cell: 1 };

    function buildK(now: number): number {
      if (!build) return 1;
      return clamp01((now - build.t0) / build.dur);
    }

    function drawSquare(R: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      card(R);
      const pad = fs(16, 12);
      const a = aInt();
      const kk = floorSqrt(a);
      const perfect = kk * kk === a;
      const r = Math.sqrt(a);
      const hs = hide();
      const top = R.y + fs(46, 42);
      const area: Rect = { x: R.x + pad, y: top, w: R.w - 2 * pad, h: R.y + R.h - top - pad };
      // Platz für Beschriftungen: unten 28 px, rechts ≈ 120 px
      const g0 = surface.g;
      g0.font = `700 ${fs(13, 12)}px ${theme.font}`;
      const rightLab = Math.min(140, g0.measureText(`√${a} ≈ 99,999`).width + 26);
      const cell = Math.min((area.w - rightLab) / SE.v, (area.h - 30) / SE.v, 44);
      const used = SE.v * cell;
      const ox = area.x + Math.max(0, (area.w - rightLab - used) / 2);
      const oy = area.y + 8 + (area.h - 30 + used) / 2 - 4;
      const M = (u: number, v: number): Pt => [ox + u * cell, oy - v * cell];
      // Kästchenpapier
      if (KG.v > 0.01) {
        g.save();
        g.beginPath();
        g.rect(area.x, area.y, area.w, area.h);
        g.clip();
        g.strokeStyle = withAlpha(theme.dark ? '#7f8ea3' : '#7a8aa0', (theme.dark ? 0.16 : 0.14) * KG.v * k.panel);
        g.lineWidth = 1;
        g.beginPath();
        for (let i = Math.floor((area.x - ox) / cell); ox + i * cell <= area.x + area.w; i++) {
          const xx = Math.round(ox + i * cell) + 0.5;
          g.moveTo(xx, area.y);
          g.lineTo(xx, area.y + area.h);
        }
        for (let j = Math.floor((oy - area.y - area.h) / cell); oy - j * cell >= area.y; j++) {
          const yy = Math.round(oy - j * cell) + 0.5;
          g.moveTo(area.x, yy);
          g.lineTo(area.x + area.w, yy);
        }
        g.stroke();
        g.restore();
      }
      // Kästchen legen: Winkelhaken für Winkelhaken
      const list = squareCells(Math.max(a, Math.ceil(CN.v)));
      const bk = buildK(now);
      const shownCount = CN.v;
      const total = list.length;
      // Zeitplan beim Legen: jede Schicht nacheinander
      const layerOf = (c: { layer: number; rest: boolean }) => (c.rest ? kk + 1 : c.layer);
      const nLayers = kk + (perfect ? 0 : 1);
      const appear = (i: number, layer: number, idxInLayer: number, layerSize: number): number => {
        let t = 1;
        if (build) {
          const per = 1 / (nLayers + 0.6);
          const t0 = (layer - 1) * per + (idxInLayer / Math.max(1, layerSize)) * per * 0.7;
          t = clamp01((bk - t0) / (per * 0.6));
        } else if (k.reveal < 1) {
          t = clamp01((k.reveal * 1.25 - i / Math.max(1, total)) * 6);
        }
        const c = clamp01(shownCount - i);
        return Math.min(t, c);
      };
      const layerSizes = new Map<number, number>();
      const layerIdx: number[] = [];
      for (const c of list) {
        const L0 = layerOf(c);
        const s = layerSizes.get(L0) ?? 0;
        layerIdx.push(s);
        layerSizes.set(L0, s + 1);
      }
      const gap = Math.max(1, cell * 0.07);
      let counted = 0;
      list.forEach((c, i) => {
        const L0 = layerOf(c);
        const t = appear(i, L0, layerIdx[i]!, layerSizes.get(L0) ?? 1);
        if (t > 0.5 && i < a) counted++;
        if (t <= 0.001) return;
        const [cx, cy] = M(c.i, c.j + 1);
        const s = ease.outBack(t);
        const cs = (cell - gap) * clamp(s, 0, 1.15);
        const mx = cx + cell / 2;
        const my = cy + cell / 2;
        const isRest = c.rest || i >= kk * kk;
        const base = isRest ? col.bad() : col.a();
        const shade = isRest ? 0 : (L0 % 2) * 0.16;
        g.save();
        g.globalAlpha *= clamp01(t * 1.6);
        g.fillStyle = mixColor(base, theme.dark ? '#151c27' : '#ffffff', (theme.dark ? 0.35 : 0.42) + shade);
        roundRect(g, mx - cs / 2, my - cs / 2, cs, cs, Math.min(4, cs * 0.18));
        g.fill();
        g.strokeStyle = withAlpha(base, 0.85);
        g.lineWidth = 1;
        g.stroke();
        g.restore();
      });
      // größtes Quadrat k × k und nächstes (k+1) × (k+1)
      const lab = k.labels;
      g.save();
      g.globalAlpha *= lab;
      g.strokeStyle = col.a();
      g.lineWidth = 2.6;
      const [ax0, ay0] = M(0, kk);
      g.strokeRect(ax0, ay0, kk * cell, kk * cell);
      if (!perfect) {
        g.setLineDash([3, 4]);
        g.strokeStyle = withAlpha(theme.muted, 0.9);
        g.lineWidth = 1.4;
        const [bx0, by0] = M(0, kk + 1);
        g.strokeRect(bx0, by0, (kk + 1) * cell, (kk + 1) * cell);
      }
      g.restore();
      // Quadrat mit Flächeninhalt a (Seite √a)
      const grow = build ? ease.inOutCubic(clamp01((bk - 0.82) / 0.18)) : k.labels;
      const rs = r * grow;
      if (grow > 0.01) {
        const [sx, sy] = M(0, rs);
        g.save();
        g.fillStyle = withAlpha(col.r(), theme.dark ? 0.1 : 0.07);
        g.fillRect(sx, sy, rs * cell, rs * cell);
        g.setLineDash(perfect ? [] : [7, 5]);
        g.strokeStyle = col.r();
        g.lineWidth = 2.6;
        g.strokeRect(sx, sy, rs * cell, rs * cell);
        g.restore();
      }
      // Beschriftungen: k unten, √a rechts, Ecke als Griff
      const [cx0, cy0] = M(0, 0);
      if (lab > 0.01) {
        fpill(cx0 + (kk * cell) / 2, cy0 + 16, hs ? `\\c{a}{?}` : `\\c{a}{${kk}}`, { size: fs(12.5, 11.5), alpha: lab });
        if (!perfect) {
          const [kx1] = M(kk + 1, 0);
          fpill(kx1, cy0 + 16, hs ? '\\c{m}{?}' : `\\c{m}{${kk + 1}}`, { size: fs(12, 11), alpha: lab });
        }
      }
      const [crx, cry] = M(rs, rs);
      if (grow > 0.5) {
        const srcR = `\\c{r}{${rt(a)} ${hs ? '= ?' : perfect ? `= ${kk}` : `≈ ${N(r, 3)}`}}`;
        fpill(crx, cry + Math.min(rs * cell * 0.5, 40), srcR, { size: fs(13.5, 12.5), alpha: (grow - 0.5) * 2 * lab, align: 'left', border: withAlpha(col.r(), 0.6), bounds: R });
      }
      squareHit = { corner: null, ox, oy, cell };
      if (editable() && grow >= 1 && !build) {
        squareHit.corner = [crx, cry];
        const hot = hover === 'corner' || drag === 'corner';
        dot(crx, cry, col.r(), hot ? 8.5 : 7, lab);
        if (hot) {
          g.save();
          g.strokeStyle = withAlpha(col.r(), 0.35);
          g.lineWidth = 6;
          g.beginPath();
          g.arc(crx, cry, 13, 0, TAU);
          g.stroke();
          g.restore();
        }
      }
      // Kopfzeile mit Zähler
      label(say(L('a Einheitsquadrate – passt ein Quadrat?', 'a unit squares – do they make a square?')), R.x + pad, R.y + 22, `700 ${fs(13.5, 12)}px ${theme.font}`, theme.text, 'left');
      fpill(R.x + R.w - pad, R.y + 22, `\\c{a}{A = ${counted}}`, { size: fs(12.5, 11.5), align: 'right', border: withAlpha(col.a(), 0.5), alpha: k.panel });
      if (!perfect && lab > 0.01 && grow > 0.9) {
        const restN = a - kk * kk;
        const [rx0, ry0] = M(kk + 1, restN <= kk + 1 ? Math.min(restN, kk + 1) : kk + 1);
        fpill(rx0, ry0 - 2, `\\c{b}{${up(say(L('Rest', 'left over')))}: ${restN}}`, { size: fs(11.5, 11), align: 'left', alpha: lab * 0.95, bounds: area });
      }
    }
    /* =====================================================================
     * Intervallschachtelung
     * ===================================================================== */
    /** Angezeigte Stufe (während der Proben noch die alte). */
    function nestState(now: number): { level: number; probeI: number; probes: Probe[]; zoom: number; inStep: boolean } {
      const n = nOf('nest');
      if (step && step.mode === 'nest' && step.to === step.from + 1) {
        const pr = nestProbes(aInt(), step.to);
        const t = now - step.t0;
        const probeEnd = pr.length * PROBE_MS;
        const probeI = Math.min(pr.length - 1, Math.floor(t / PROBE_MS));
        const zoom = clamp01((t - probeEnd - 250) / ZOOM_MS);
        return { level: zoom > 0 ? step.to : step.from, probeI: t < probeEnd + 250 ? probeI : pr.length - 1, probes: pr, zoom, inStep: true };
      }
      const pr = nestProbes(aInt(), n);
      return { level: n, probeI: pr.length - 1, probes: pr, zoom: 1, inStep: false };
    }
    /** Ziel-Ansicht der Lupe für Stufe L: Intervall füllt 80 % der Breite. */
    function nestView(Lv: number): { c: number; lw: number } {
      const a = aInt();
      const [lo, hi] = nestInterval(a, Lv);
      if (exactAt(a, Lv)) return { c: lo, lw: Math.log10(1.25 * 10 ** -Lv) };
      return { c: (lo + hi) / 2, lw: Math.log10((hi - lo) * 1.25) };
    }

    let nestHit: { x0: number; x1: number; y: number; lo: number; sub: number; count: number } | null = null;

    function drawNest(R: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      card(R);
      const a = aInt();
      const r = Math.sqrt(a);
      const hs = hide();
      const pad = fs(18, 14);
      const S = nestState(now);
      const Lv = S.level;
      const exact = exactAt(a, Lv);
      const [lo, hi] = nestInterval(a, Lv);
      const lx0 = R.x + pad + 6;
      const lx1 = R.x + R.w - pad - 6;
      const compact = R.h < 380;
      // Übersicht: ganze Zahlen
      const yO = R.y + fs(compact ? 58 : 66, 58);
      const K = Math.max(3, Math.floor(r) + 2);
      const Ox = (v: number) => lx0 + (v / K) * (lx1 - lx0);
      g.save();
      g.globalAlpha *= k.reveal;
      g.strokeStyle = theme.text;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(lx0 - 4, yO);
      g.lineTo(lx1 + 2, yO);
      g.stroke();
      arrowHead(lx1 + 8, yO, 1, 0, theme.text, 6);
      const every = niceStep(K, lx1 - lx0, 26);
      for (let i = 0; i <= K; i++) {
        const xx = Ox(i);
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 1.1;
        g.beginPath();
        g.moveTo(xx, yO - 5);
        g.lineTo(xx, yO + 5);
        g.stroke();
        if (i % Math.max(1, Math.round(every)) === 0) label(String(i), xx, yO + 15, `600 ${fs(11.5, 11)}px ${theme.font}`, theme.muted);
      }
      g.restore();
      // aktuelles Intervall auf der Übersicht (mindestens 4 px breit)
      const ia = Ox(lo);
      const ib = Math.max(Ox(exact ? lo : hi), ia + 4);
      const zoomPx = { x0: lx0, x1: lx1 };
      // Lupe: Zoomzeile
      const yZ = R.y + R.h * (compact ? 0.47 : 0.5);
      const span = 10 ** NW.v;
      const vlo = NC.v - span / 2;
      const Z = (v: number) => zoomPx.x0 + ((v - vlo) / span) * (zoomPx.x1 - zoomPx.x0);
      // Trichter
      g.save();
      g.globalAlpha *= k.reveal * 0.9;
      const fz0 = clamp(Z(lo), lx0 - 30, lx1 + 30);
      const fz1 = clamp(Z(exact ? lo : hi), lx0 - 30, lx1 + 30);
      const grad = g.createLinearGradient(0, yO, 0, yZ);
      grad.addColorStop(0, withAlpha(col.r(), theme.dark ? 0.3 : 0.22));
      grad.addColorStop(1, withAlpha(col.r(), theme.dark ? 0.08 : 0.05));
      g.fillStyle = grad;
      poly([
        [ia, yO + 6],
        [ib, yO + 6],
        [fz1, yZ - 16],
        [fz0, yZ - 16],
      ]);
      g.fill();
      g.strokeStyle = withAlpha(col.r(), 0.45);
      g.setLineDash([4, 4]);
      g.lineWidth = 1.1;
      g.beginPath();
      g.moveTo(ia, yO + 6);
      g.lineTo(fz0, yZ - 16);
      g.moveTo(ib, yO + 6);
      g.lineTo(fz1, yZ - 16);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = col.r();
      roundRect(g, ia, yO - 5, ib - ia, 10, 3);
      g.fill();
      g.restore();
      if (!hs && k.labels > 0.01) {
        dot(Ox(r), yO, col.r(), 4, k.labels);
      }
      // Zoomzeile
      g.save();
      g.beginPath();
      g.rect(R.x + 4, yZ - 60, R.w - 8, 110);
      g.clip();
      g.globalAlpha *= k.reveal;
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(lx0 - 8, yZ);
      g.lineTo(lx1 + 8, yZ);
      g.stroke();
      // Intervall-Band
      const za = Z(lo);
      const zb = Z(exact ? lo : hi);
      if (!exact) {
        g.fillStyle = withAlpha(col.r(), theme.dark ? 0.22 : 0.14);
        roundRect(g, za, yZ - 13, zb - za, 26, 5);
        g.fill();
      }
      // Teilung: Zehntel des aktuellen Intervalls
      const sub = 10 ** -(Lv + 1);
      const decS = Lv + 1;
      const minorPx = (sub / span) * (zoomPx.x1 - zoomPx.x0);
      const tf = `600 ${fs(11.5, 11)}px ${theme.font}`;
      g.font = tf;
      const lw = g.measureText(Fx(hi, decS)).width + 8;
      const labEvery = minorPx >= lw ? 1 : minorPx * 2 >= lw ? 2 : minorPx * 5 >= lw ? 5 : 10;
      const iStart = Math.max(Math.ceil((vlo - 1e-12) / sub), Math.ceil((vlo + span / 2) / sub) - 400);
      const iEnd = Math.min(Math.floor((vlo + span + 1e-12) / sub), iStart + 800);
      for (let i = iStart; i <= iEnd; i++) {
        const v = i * sub;
        const xx = Z(v);
        if (minorPx < 5 && Math.abs(v / (sub * 10) - Math.round(v / (sub * 10))) > 1e-6) continue;
        const isMain = Math.abs(v / (sub * 10) - Math.round(v / (sub * 10))) < 1e-6;
        g.strokeStyle = withAlpha(theme.text, isMain ? 0.8 : 0.45);
        g.lineWidth = isMain ? 1.5 : 1;
        g.beginPath();
        g.moveTo(xx, yZ - (isMain ? 8 : 5));
        g.lineTo(xx, yZ + (isMain ? 8 : 5));
        g.stroke();
        const inside = v > lo + sub / 2 && v < hi - sub / 2;
        if (inside && (i - Math.round(lo / sub)) % labEvery === 0 && !exact) label(Fx(v, decS), xx, yZ + 20, tf, theme.muted);
      }
      g.restore();
      // Proben (während des Schritts) oder Ergebnis
      nestHit = null;
      const probing = S.inStep && S.zoom <= 0;
      if (probing) {
        const pr = S.probes;
        const cur = pr[S.probeI]!;
        const prev = S.probeI > 0 ? pr[S.probeI - 1]!.t : lo;
        // ausgeschlossene Teile (Quadrat noch zu klein) grau
        g.save();
        g.fillStyle = withAlpha(theme.muted, theme.dark ? 0.28 : 0.2);
        const doneTo = cur.cmp < 0 ? cur.t : prev;
        if (doneTo > lo) {
          roundRect(g, za, yZ - 13, Z(doneTo) - za, 26, 5);
          g.fill();
        }
        if (cur.cmp >= 0) {
          g.fillStyle = withAlpha(col.r(), theme.dark ? 0.5 : 0.36);
          roundRect(g, Z(prev), yZ - 13, Math.max(3, Z(cur.t) - Z(prev)), 26, 5);
          g.fill();
        }
        g.restore();
        const pc = cur.cmp < 0 ? col.y() : cur.cmp > 0 ? col.x() : col.r();
        const tIn = (now - (step?.t0 ?? now)) / PROBE_MS - S.probeI;
        const pop = ease.outBack(clamp01(tIn * 2.2));
        const pxp = Z(cur.t);
        g.save();
        g.strokeStyle = pc;
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(pxp, yZ + 12);
        g.lineTo(pxp, yZ - 30);
        g.stroke();
        g.restore();
        dot(pxp, yZ - 30, pc, 5.5 * pop);
        const rel = cur.cmp < 0 ? '<' : cur.cmp > 0 ? '>' : '=';
        const pl = step?.to ?? Lv;
        fpill(pxp, yZ - 48, `${Fx(cur.t, pl)}² = ${N(cur.sq, 2 * pl)} ${rel} ${a}`, { size: fs(12.5, 11.5), color: pc, border: withAlpha(pc, 0.6), alpha: pop, bounds: R, scale: 0.9 + 0.1 * pop });
      } else if (!exact) {
        // Teilintervalle antippen
        const can = editable() && !step && nOf('nest') < maxN('nest');
        if (can) nestHit = { x0: za, x1: zb, y: yZ, lo, sub, count: 10 };
        if (can && hoverSub >= 0) {
          g.save();
          g.strokeStyle = col.r();
          g.lineWidth = 2;
          roundRect(g, Z(lo + hoverSub * sub) + 1, yZ - 14, Z(lo + (hoverSub + 1) * sub) - Z(lo + hoverSub * sub) - 2, 28, 4);
          g.stroke();
          g.restore();
        }
        if (wrongTap) {
          const t = (now - wrongTap.t0) / 1600;
          if (t < 1) {
            const j = wrongTap.j;
            const shake = Math.sin(t * 40) * (1 - t) * 3;
            g.save();
            g.globalAlpha *= 1 - ease.inCubic(t);
            g.fillStyle = withAlpha(col.bad(), theme.dark ? 0.5 : 0.35);
            roundRect(g, Z(lo + j * sub) + 1 + shake, yZ - 13, Z(lo + (j + 1) * sub) - Z(lo + j * sub) - 2, 26, 4);
            g.fill();
            g.restore();
            const tl = lo + j * sub;
            const th2 = lo + (j + 1) * sub;
            const tooBig = tl * tl > a;
            const tv = tooBig ? tl : th2;
            fpill((Z(tl) + Z(th2)) / 2, yZ - 46, `\\c{b}{${Fx(tv, Lv + 1)}² = ${N(tv * tv, 2 * Lv + 2)} ${tooBig ? '>' : '<'} ${a}: ${up(tooBig ? say(L('zu groß', 'too big')) : say(L('zu klein', 'too small')))}}`, { size: fs(12, 11), border: withAlpha(col.bad(), 0.6), alpha: 1 - ease.inCubic(t), bounds: R });
          } else wrongTap = null;
        }
        // Grenzen
        fpill(za, yZ - 34, `\\c{y}{${Fx(lo, Lv)}}`, { size: fs(13.5, 12.5), align: 'right', alpha: k.labels, bounds: R, border: withAlpha(col.y(), 0.5) });
        fpill(zb, yZ - 34, `\\c{x}{${Fx(hi, Lv)}}`, { size: fs(13.5, 12.5), align: 'left', alpha: k.labels, bounds: R, border: withAlpha(col.x(), 0.5) });
      }
      // √a als Punkt in der Lupe
      if (!hs || exact) {
        const xr = Z(r);
        if (xr > R.x && xr < R.x + R.w) {
          dot(xr, yZ, col.r(), 6.5, k.labels);
          if (exact) fpill(xr, yZ - 34, `\\c{r}{${rt(a)} = ${N(r, 0)}}`, { size: fs(14, 13), alpha: k.labels, border: withAlpha(col.r(), 0.6), bounds: R });
        }
      }
      // Lupe-Hinweis
      if (Lv >= 1) fpill(R.x + R.w - pad, yO - 24, `\\c{m}{${up(say(L('Lupe', 'zoom')))} ×10^{${Lv}}}`, { size: fs(11.5, 11), align: 'right', alpha: k.labels * 0.95 });
      label(say(L('Zwischen welchen Zahlen liegt √a?', 'Between which numbers does √a lie?')).replace('√a', `√${a}`), R.x + pad, R.y + 22, `700 ${fs(13.5, 12)}px ${theme.font}`, theme.text, 'left');
      // Ungleichungskette unten
      const yC = R.y + R.h - fs(compact ? 56 : 70, 62);
      const chain = exact
        ? `\\c{r}{${rt(a)} = ${N(r, 0)}}`
        : `\\c{y}{${Fx(lo, Lv)}} < \\c{r}{${rt(a)}} < \\c{x}{${Fx(hi, Lv)}}`;
      const why = exact
        ? `${up(say(L('weil', 'because')))} ${N(r, 0)}² = ${a}`
        : `${up(say(L('weil', 'because')))} \\c{y}{${Fx(lo, Lv)}² = ${N(lo * lo, 2 * Lv)}} < ${a} < \\c{x}{${N(hi * hi, 2 * Lv)} = ${Fx(hi, Lv)}²}`;
      const alpha = S.inStep && S.zoom < 1 ? (S.zoom > 0 ? ease.outCubic(S.zoom) : 0.25) : k.labels;
      g.save();
      g.globalAlpha *= alpha;
      const b1 = fit(chain, R.w - 2 * pad, fs(compact ? 19 : 22, 18), th().text, 700);
      b1.draw(g, R.x + R.w / 2 - b1.w / 2, yC);
      const b2 = fit(why, R.w - 2 * pad, fs(13.5, 12), th().muted, 650);
      b2.draw(g, R.x + R.w / 2 - b2.w / 2, yC + b1.desc + 10 + b2.asc);
      g.restore();
      if (!S.inStep && !exact && nOf('nest') < maxN('nest') && editable() && k.labels > 0.99) {
        label(say(L('Tippe das Teilintervall an, in dem √a liegt.', 'Tap the subinterval that contains √a.')).replace('√a', `√${a}`), R.x + R.w / 2, yZ + 40, `550 ${fs(12, 11)}px ${theme.font}`, theme.muted);
      }
    }

    /* =====================================================================
     * √2 ist irrational
     * ===================================================================== */
    /** Rechtwinklig-gleichschenklige Dreiecke: Ziel (im Diagonalquadrat) und Herkunft (zwei Einheitsquadrate). */
    const TRI_TARGET: [Pt, Pt, Pt][] = [
      // [rechter Winkel, Schenkelende 1, Schenkelende 2]
      [[1, 1], [1, 0], [0, 1]],
      [[1, 1], [2, 1], [1, 0]],
      [[1, 1], [1, 2], [2, 1]],
      [[1, 1], [0, 1], [1, 2]],
    ];
    function triSource(ox2: number): [Pt, Pt, Pt][] {
      return [
        [[ox2, 0], [ox2 + 1, 0], [ox2, 1]],
        [[ox2 + 1, 1], [ox2, 1], [ox2 + 1, 0]],
        [[ox2, 1.25], [ox2 + 1, 1.25], [ox2, 2.25]],
        [[ox2 + 1, 2.25], [ox2, 2.25], [ox2 + 1, 1.25]],
      ];
    }
    /** Starre Bewegung eines Dreiecks von src nach dst (Drehung um den Schwerpunkt + Verschiebung). */
    function moveTri(src: [Pt, Pt, Pt], dst: [Pt, Pt, Pt], t: number): Pt[] {
      const cen = (q: [Pt, Pt, Pt]): Pt => [(q[0][0] + q[1][0] + q[2][0]) / 3, (q[0][1] + q[1][1] + q[2][1]) / 3];
      const cross = (q: [Pt, Pt, Pt]) => (q[1][0] - q[0][0]) * (q[2][1] - q[0][1]) - (q[1][1] - q[0][1]) * (q[2][0] - q[0][0]);
      let d = dst;
      if (Math.sign(cross(src)) !== Math.sign(cross(dst))) d = [dst[0], dst[2], dst[1]];
      const ang = (q: [Pt, Pt, Pt]) => Math.atan2(q[1][1] - q[0][1], q[1][0] - q[0][0]);
      let rot = ang(d) - ang(src);
      while (rot > Math.PI) rot -= TAU;
      while (rot < -Math.PI) rot += TAU;
      const c0 = cen(src);
      const c1 = cen(d);
      const th0 = rot * t;
      const cx = lerp(c0[0], c1[0], t);
      const cy = lerp(c0[1], c1[1], t) + Math.sin(Math.PI * t) * 0.35;
      return src.map(([x, y]) => {
        const dx = x - c0[0];
        const dy = y - c0[1];
        return [cx + dx * Math.cos(th0) - dy * Math.sin(th0), cy + dx * Math.sin(th0) + dy * Math.cos(th0)] as Pt;
      });
    }
    function diagK(now: number): number {
      if (!diag) return 1;
      return clamp01((now - diag.t0) / diag.dur);
    }

    /** Ist die Bühne breit genug für die Fast-Treffer-Tabelle neben dem Bild? */
    function irrWide(R: Rect): boolean {
      const pad = fs(16, 12);
      return R.w - 2 * pad > (R.h - 44 - fs(70, 76) - 8) * 1.9;
    }

    function drawIrr(R: Rect, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      card(R);
      const pad = fs(16, 12);
      const hs = hide();
      label(say(L('Die Diagonale des Einheitsquadrats', 'The diagonal of the unit square')), R.x + pad, R.y + 22, `700 ${fs(13.5, 12)}px ${theme.font}`, theme.text, 'left');
      // Platz: Bild oben (bzw. links), Dezimalstellen unten
      const ribbonH = fs(70, 76);
      const pic: Rect = { x: R.x + pad, y: R.y + 44, w: R.w - 2 * pad, h: R.h - 44 - ribbonH - 8 };
      const wideP = irrWide(R);
      const tableW = wideP ? Math.min(250, pic.w * 0.42) : 0;
      const dPic: Rect = { x: pic.x, y: pic.y, w: pic.w - tableW, h: pic.h };
      const unitsW = 3.7;
      const unitsH = 2.55;
      const u = Math.min((dPic.w - 20) / unitsW, (dPic.h - 34) / unitsH, 120);
      const ox = dPic.x + (dPic.w - unitsW * u) / 2 + 0.15 * u;
      const oy = dPic.y + 14 + (dPic.h - 34 + unitsH * u) / 2 - 0.05 * u;
      const M = (x: number, y: number): Pt => [ox + x * u, oy - y * u];
      const t = diag ? diagK(now) : intro !== null ? clamp01((now - intro - 500) / 2600) : 1;
      // 2 × 2 Einheitsquadrate
      g.save();
      g.globalAlpha *= k.reveal;
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1.4;
      for (let i = 0; i < 2; i++)
        for (let j = 0; j < 2; j++) {
          const [x0, y0] = M(i, j + 1);
          g.strokeRect(x0, y0, u, u);
        }
      g.restore();
      // Herkunft: zwei Einheitsquadrate (gestrichelt, sobald die Teile wandern)
      const sx = 2.55;
      const src = triSource(sx);
      g.save();
      g.globalAlpha *= k.reveal;
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(col.a(), 0.7);
      g.lineWidth = 1.3;
      for (const yy of [0, 1.25]) {
        const [x0, y0] = M(sx, yy + 1);
        g.strokeRect(x0, y0, u, u);
      }
      g.restore();
      // Dreiecke wandern nacheinander
      TRI_TARGET.forEach((dst, i) => {
        const ti = ease.inOutCubic(clamp01((t - 0.08 - i * 0.18) / 0.36));
        const pts = moveTri(src[i]!, dst, ti).map(([x, y]) => M(x, y));
        g.save();
        g.globalAlpha *= k.reveal;
        g.fillStyle = mixColor(col.a(), theme.dark ? '#151c27' : '#ffffff', i % 2 ? 0.42 : 0.3);
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
        g.shadowBlur = ti > 0 && ti < 1 ? 10 : 3;
        g.shadowOffsetY = 2;
        poly(pts);
        g.fill();
        g.restore();
        g.strokeStyle = col.a();
        g.lineWidth = 1.4;
        g.stroke();
        g.restore();
      });
      // Diagonalquadrat
      const done = ease.outCubic(clamp01((t - 0.85) / 0.15));
      const sq: Pt[] = [M(1, 0), M(2, 1), M(1, 2), M(0, 1)];
      g.save();
      g.globalAlpha *= done;
      g.strokeStyle = col.r();
      g.lineWidth = 3;
      g.lineJoin = 'round';
      poly(sq);
      g.stroke();
      g.restore();
      // Diagonale d im Einheitsquadrat unten links hervorgehoben
      g.save();
      g.globalAlpha *= k.labels;
      g.strokeStyle = col.r();
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      const [d0x, d0y] = M(1, 0);
      const [d1x, d1y] = M(0, 1);
      g.beginPath();
      g.moveTo(d0x, d0y);
      g.lineTo(d1x, d1y);
      g.stroke();
      g.restore();
      const [cx, cy] = M(1, 1);
      fpill(cx, cy, `\\c{a}{A = 2}`, { size: fs(14, 12.5), alpha: done, border: withAlpha(col.a(), 0.6) });
      const [lx, ly] = M(0.42, 0.42);
      fpill(lx - 6, ly + 4, `\\c{r}{d = ${rt(2)}}`, { size: fs(13, 12), alpha: k.labels, align: 'right', bounds: R });
      const [ux, uy] = M(0.5, 0);
      fpill(ux, uy + 15, '1', { size: fs(11.5, 11), alpha: k.labels * 0.9 });
      const [vx, vy] = M(sx + 0.5, 2.25);
      fpill(vx, vy - 13, `\\c{m}{${up(say(L('2 Einheitsquadrate', '2 unit squares')))}}`, { size: fs(11.5, 11), alpha: k.labels * (1 - done * 0.5), bounds: R });
      // Fast-Treffer-Tabelle (breite Bühne)
      if (tableW > 0) drawMisses({ x: pic.x + pic.w - tableW, y: pic.y + 4, w: tableW, h: pic.h - 8 }, k);
      // Dezimalstellen
      const rb: Rect = { x: R.x + pad, y: R.y + R.h - ribbonH - 6, w: R.w - 2 * pad, h: ribbonH };
      g.strokeStyle = theme.dark ? '#273142' : '#e8ecf2';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(rb.x, rb.y);
      g.lineTo(rb.x + rb.w, rb.y);
      g.stroke();
      const mono = (sz: number, w = 600) => `${w} ${sz}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      const dsz = fs(15, 13);
      g.font = mono(dsz);
      const cw = g.measureText('0').width;
      const head = `√2 = 1${sep}`;
      g.font = mono(dsz, 700);
      const hw = g.measureText(head).width;
      const room = rb.w - hw - 30;
      const groups = Math.max(2, Math.floor(room / (cw * 5 + cw * 0.8)));
      const nd = Math.min(50, groups * 5);
      const digits = sqrtDigits(2, nd).split('.')[1]!;
      const revealD = intro !== null ? Math.floor(clamp01((now - intro - 400) / 2200) * nd) : nd;
      const yD = rb.y + 24;
      label(head, rb.x, yD, mono(dsz, 700), col.r(), 'left');
      let xx = rb.x + hw;
      for (let i = 0; i < Math.min(revealD, nd); i++) {
        if (i > 0 && i % 5 === 0) xx += cw * 0.8;
        label(hs && i >= 3 ? '·' : digits[i]!, xx, yD, mono(dsz), theme.text, 'left');
        xx += cw;
      }
      label('…', xx + 2, yD, mono(dsz, 700), theme.muted, 'left');
      const note = say(L('bricht nie ab und wird nie periodisch – kein Bruch kann das', 'never ends and never repeats – no fraction can do that'));
      label(note, rb.x, yD + 26, `550 ${fs(12, 11)}px ${theme.font}`, theme.muted, 'left');
    }

    /** Tabelle der Fast-Treffer p/q mit p² und 2q². */
    function drawMisses(B: Rect, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const rows = nearMisses(8).slice(1);
      const rh = Math.min(fs(24, 21), (B.h - 46) / rows.length);
      const cols = [B.x + 6, B.x + B.w * 0.36, B.x + B.w * 0.66, B.x + B.w - 4];
      label(say(L('Fast-Treffer', 'Near misses')), B.x + 6, B.y + 12, `750 ${fs(12.5, 11.5)}px ${theme.font}`, theme.text, 'left');
      const hy = B.y + 34;
      const hf = `700 ${fs(11.5, 11)}px ${theme.font}`;
      label('p/q', cols[0]!, hy, hf, theme.muted, 'left');
      label('p²', cols[2]!, hy, hf, theme.muted, 'right');
      label('2q²', cols[3]!, hy, hf, theme.muted, 'right');
      label('≈', cols[1]! + 4, hy, hf, theme.muted, 'left');
      rows.forEach((r, i) => {
        const y = hy + 8 + rh * (i + 0.5) + 4;
        const a = ease.outCubic(clamp01(k.stagger * (rows.length + 2) - i));
        g.save();
        g.globalAlpha *= a;
        const f = `650 ${fs(12, 11)}px ${theme.font}`;
        label(`${r.p}/${r.q}`, cols[0]!, y, f, theme.text, 'left');
        label(fmt.fixed(r.p / r.q, 4), cols[1]! + 4, y, `500 ${fs(11.5, 11)}px ${theme.font}`, theme.muted, 'left');
        label(String(r.p2), cols[2]!, y, f, r.diff < 0 ? col.y() : col.x(), 'right');
        label(String(r.q2x2), cols[3]!, y, f, theme.text, 'right');
        g.restore();
      });
      label(say(L('Unterschied immer 1, nie 0', 'always 1 apart, never 0')), B.x + 6, hy + 8 + rh * rows.length + 16, `550 ${fs(11.5, 11)}px ${theme.font}`, col.bad(), 'left');
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean) => number;
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    type Row = { src: string; color?: string; size?: number; weight?: number; gap?: number; at?: number; hl?: string };

    /** Karte aus Formelzeilen (gestaffelt eingeblendet); hl: farbig hinterlegte Zeile. */
    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: Row[], right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad;
      const boxes = rows.map((r) => fit(r.src, maxW - (r.hl ? 8 : 0), r.size ?? fs(13.5, 12.5), r.color ?? th().text, r.weight ?? 600));
      const h = 38 + boxes.reduce((s, b, i) => s + rowH(b) + (rows[i]!.gap ?? 9), 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 38;
      boxes.forEach((b, i) => {
        const row = rows[i]!;
        const a = row.at ?? clamp01(k.stagger * (rows.length + 2) - i);
        if (a <= 0.001) {
          y += rowH(b) + (row.gap ?? 9);
          return;
        }
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.18 : 0.1);
          roundRect(g, R.x + pad - 6, y - 4, R.w - 2 * pad + 12, rowH(b) + 8, 7);
          g.fill();
        }
        b.draw(g, R.x + pad + (row.hl ? 4 : 0) + (1 - ease.outCubic(a)) * 10, y + b.asc);
        g.restore();
        y += rowH(b) + (row.gap ?? 9);
      });
      return h;
    }

    function textCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, paras: { s: string; color?: string; weight?: number }[]): number {
      const g = surface.g;
      const theme = th();
      const pad = fs(14, 12);
      const size = fs(12.5, 12);
      const lh = size * 1.36;
      const blocks = paras.map((pp) => ({ lines: wrapText(pp.s, R.w - 2 * pad, `${pp.weight ?? 500} ${size}px ${theme.font}`), pp }));
      const h = 40 + blocks.reduce((s, b) => s + b.lines.length * lh + 6, 0) + 4;
      if (measure) return h;
      card({ ...R, h }, accent);
      cardTitle(R, title, accent);
      let y = R.y + 38;
      g.save();
      g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 3 - 1));
      for (const b of blocks) {
        b.lines.forEach((ln, i) => label(ln, R.x + pad, y + lh / 2 + i * lh, `${b.pp.weight ?? 500} ${size}px ${theme.font}`, b.pp.color ?? theme.text, 'left'));
        y += b.lines.length * lh + 6;
      }
      g.restore();
      return h;
    }

    /* ---------- Heron-Karten ---------- */
    function heronStepCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const a = aInt();
        const list = stepsExact();
        const n = nOf('heron');
        const hs = hide();
        const animK = step && step.mode === 'heron' ? clamp01((now - step.t0) / Math.max(1, step.dur)) : 1;
        const rows: Row[] = [{ src: `\\c{x}{x_{n+1}} = \\f{\\c{x}{x_n} + \\c{y}{a : x_n}}{2}`, size: fs(14.5, 13.5), color: th().text, gap: 12 }];
        const fr = heronFractions(a, Math.round(p.x0 * 2), 2, n)[n]!;
        if (n === 0) {
          rows.push({ src: `\\c{x}{x_0 = ${N(p.x0, 2)}},  \\c{y}{a : x_0 = ${a} : ${N(p.x0, 2)} = ${N(list[0]!.y, 5)}}` });
          rows.push({ src: `\\c{a}{x_0 · (a : x_0) = ${a}}  \\c{m}{${up(say(L('(Fläche)', '(area)')))}}` });
          rows.push({ src: `\\c{m}{${up(say(L('Weiter mit „Nächster Schritt“', 'Continue with “Next step”')))}}`, size: fs(12, 11) });
        } else {
          const q0 = list[n - 1]!;
          const q1 = list[n]!;
          const at = (i: number) => clamp01(animK * 4 - i);
          const v1 = hs ? '?' : N(q1.x, 6);
          rows.push({ src: `\\c{x}{x_${n}} = \\f{\\c{x}{${N(q0.x, 5)}} + \\c{y}{${N(q0.y, 5)}}}{2} ${hs ? '= ?' : `${isEx(q1.x, 6) ? '=' : '≈'} \\c{x}{\\b{${v1}}}`}`, size: fs(13.5, 12.5), at: at(1), hl: col.x() });
          rows.push({ src: `\\c{y}{a : x_${n} = ${a} : ${v1}} ${hs ? '= ?' : `≈ \\c{y}{${N(q1.y, 6)}}`}`, at: at(2) });
          rows.push({ src: `\\c{a}{x_${n} · (a : x_${n}) = ${a}}  \\c{m}{${up(say(L('Fläche bleibt', 'area stays')))}}`, at: at(2.5) });
          const big = fr[0] > 9999999n || fr[1] > 9999999n;
          if (!big && !hs && Number.isInteger(p.x0 * 2)) rows.push({ src: `\\c{m}{${up(say(L('als Bruch', 'as a fraction')))}:} \\c{x}{x_${n} = \\f{${fr[0]}}{${fr[1]}}}`, size: fs(13, 12), at: at(3) });
        }
        return formulaCard(R, measure, k, say(L('Heron-Schritt', 'Heron step')), col.x(), rows, `n = ${n}`);
      };
    }
    const isEx = (v: number, d: number) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-7;

    function heronTableCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const n = nOf('heron');
        const hs = hide();
        const rH = fs(22, 20);
        const rowsN = clamp(n + 2, 3, 7);
        const h = 60 + rowsN * rH + 4;
        if (measure) return h;
        card({ ...R, h }, col.r());
        cardTitle(R, say(L('Tabelle', 'Table')), col.r(), hs ? undefined : `\\c{r}{${up(say(L('fett: richtige Stellen', 'bold: correct digits')))}}`);
        const list = stepsExact();
        const r = root();
        const fsz = fs(12.5, 11.5);
        const mono = (w: number) => `${w} ${fsz}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
        g.font = mono(500);
        const cw = g.measureText('0').width;
        const dec = Math.max(4, Math.min(9, Math.floor((R.w - 2 * pad - 70) / (2 * cw)) - 3));
        const c0 = R.x + pad;
        const c1 = R.x + pad + 22;
        const c2 = c1 + (dec + 4) * cw + 10;
        const c3 = R.x + R.w - pad;
        const hy = R.y + 44;
        const hf = `700 ${fs(11.5, 11)}px ${theme.font}`;
        label('n', c0, hy, hf, theme.muted, 'left');
        label('xₙ', c1, hy, hf, col.x(), 'left');
        label('a : xₙ', c2, hy, hf, col.y(), 'left');
        label(say(L('Stellen', 'digits')), c3, hy, hf, theme.muted, 'right');
        const stepping = step && step.mode === 'heron' && step.to === step.from + 1 ? step : null;
        const num = (v: number, x: number, y: number, color: string, idx: number) => {
          if (hs && idx > 0) {
            label('?', x, y, mono(700), color, 'left');
            return;
          }
          const sv = Fx(v, dec);
          const md = hs ? -1 : Math.min(dec, matchingDecimals(v, r, dec));
          const ci = sv.indexOf(sep);
          const cut = ci < 0 ? sv.length : md < 0 ? 0 : Math.min(sv.length, md === 0 ? ci : ci + 1 + md);
          const a0 = sv.slice(0, cut);
          const b0 = sv.slice(cut);
          g.font = mono(800);
          const wa = g.measureText(a0).width;
          label(a0, x, y, mono(800), color, 'left');
          label(b0, x + wa, y, mono(500), withAlpha(theme.text, theme.dark ? 0.55 : 0.5), 'left');
        };
        for (let i = 0; i <= Math.min(n, rowsN - 1); i++) {
          const y = hy + 20 + i * rH;
          let a = clamp01(k.stagger * 8 - i);
          if (stepping && i === stepping.to) a = Math.min(a, clamp01((now - stepping.t0 - (stepping.dur < HERON_DUR ? 0 : HERON_DUR - 700)) / 450));
          if (a <= 0.001) continue;
          g.save();
          g.globalAlpha *= ease.outCubic(a);
          if (i === n) {
            g.fillStyle = withAlpha(col.x(), theme.dark ? 0.16 : 0.08);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, R.w - 2 * pad + 12, rH - 2, 6);
            g.fill();
          }
          const q = list[i]!;
          label(String(i), c0, y, `700 ${fsz}px ${theme.font}`, theme.muted, 'left');
          num(q.x, c1, y, col.x(), i);
          num(q.y, c2, y, col.y(), i);
          const md = Math.max(matchingDecimals(q.x, r, 12), -1);
          label(hs && i > 0 ? '?' : md < 0 ? '–' : md >= 12 ? '≥ 12' : String(md), c3, y, `700 ${fsz}px ${theme.font}`, theme.muted, 'right');
          g.restore();
        }
        return h;
      };
    }

    function heronNoteCard(k: Intro): CardFn {
      return (R, measure) =>
        textCard(R, measure, k, say(L('Warum funktioniert das?', 'Why does it work?')), col.a(), [
          { s: say(L('Streifen abschneiden, an die kurze Seite legen: fast ein Quadrat – nur eine kleine Ecke fehlt. Darum liegt die neue Seite etwas über √a, die Breite a : x darunter.', 'Cut off a strip and put it on the short side: almost a square – only a small corner is missing. So the new side is slightly above √a and the width a : x below it.')) },
        ]);
    }

    /* ---------- Quadrat-Karten ---------- */
    function squareMainCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = aInt();
        const kk = floorSqrt(a);
        const perfect = kk * kk === a;
        const hs = hide();
        const r = Math.sqrt(a);
        const rows: Row[] = [
          { src: `\\c{r}{${rt('a')}} \\c{m}{${up(say(L('= Seite des Quadrats mit', '= side of the square with')))}} \\c{a}{A = a}`, size: fs(13.5, 12.5), gap: 6 },
          { src: `(\\c{r}{${rt('a')}})² = \\c{a}{a},   \\c{r}{${rt('a')}} ≥ 0`, size: fs(13.5, 12.5), gap: 12 },
        ];
        if (perfect) {
          rows.push({ src: `\\c{a}{${kk}² = ${a}}  ⇒  \\c{r}{${rt(a)} = ${hs ? '?' : kk}}`, size: fs(15, 13.5), hl: col.r() });
          rows.push({ src: `\\c{m}{${up(say(L(`${a} ist eine Quadratzahl – die Kästchen bilden genau ein Quadrat.`, `${a} is a square number – the unit squares make an exact square.`)))}}`, size: fs(12, 11) });
        } else {
          rows.push({ src: `\\c{a}{${kk}² = ${kk * kk}} < ${a} < \\c{m}{${(kk + 1) ** 2} = ${kk + 1}²}`, size: fs(14, 13) });
          rows.push({ src: `⇒  ${hs ? '?' : kk} < \\c{r}{${rt(a)}} < ${hs ? '?' : kk + 1}`, size: fs(15, 13.5), hl: col.r() });
          const r4 = Math.round(r * 1e4) / 1e4;
          rows.push({ src: `\\c{r}{${rt(a)} ${hs ? '= ?' : `≈ ${N(r4, 4)}`}}  \\c{m}{${hs ? '' : `(${N(r4, 4)}² ≈ ${N(r4 * r4, 3)})`}}`, size: fs(13, 12) });
        }
        return formulaCard(R, measure, k, say(L('Quadratwurzel', 'Square root')), col.r(), rows);
      };
    }

    function squareNumbersCard(k: Intro): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const a = aInt();
        const kk = floorSqrt(a);
        const chipW = fs(40, 36);
        const chipH = fs(25, 23);
        const perRow = Math.max(4, Math.floor((R.w - 2 * pad + 6) / (chipW + 6)));
        const count = 15;
        const rowsN = Math.ceil(count / perRow);
        const note = kk * kk === a ? say(L(`√${a} = ${kk}, denn ${kk} · ${kk} = ${a}`, `√${a} = ${kk}, because ${kk} · ${kk} = ${a}`)) : say(L(`${a} liegt zwischen ${kk * kk} und ${(kk + 1) ** 2} – keine Quadratzahl`, `${a} lies between ${kk * kk} and ${(kk + 1) ** 2} – not a square number`));
        const nf = `600 ${fs(12, 11)}px ${theme.font}`;
        const lines = wrapText(hide() ? say(L('Welche Quadratzahlen liegen um a?', 'Which square numbers surround a?')) : note, R.w - 2 * pad, nf);
        const h = 40 + rowsN * (chipH + 6) + 8 + lines.length * 16;
        if (measure) return h;
        card({ ...R, h }, col.a());
        cardTitle(R, say(L('Quadratzahlen', 'Square numbers')), col.a(), `\\c{m}{1 + 3 + 5 + … }`);
        for (let i = 1; i <= count; i++) {
          const row = Math.floor((i - 1) / perRow);
          const c = (i - 1) % perRow;
          const x = R.x + pad + c * (chipW + 6);
          const y = R.y + 40 + row * (chipH + 6);
          const isK = i === kk;
          const isNext = i === kk + 1 && kk * kk !== a;
          const a0 = ease.outCubic(clamp01(k.stagger * 6 - i * 0.25));
          g.save();
          g.globalAlpha *= a0;
          g.fillStyle = isK ? withAlpha(col.a(), theme.dark ? 0.45 : 0.25) : isNext ? withAlpha(theme.muted, 0.18) : theme.dark ? '#1f2834' : '#f1f4f8';
          roundRect(g, x, y, chipW, chipH, 7);
          g.fill();
          if (isK || isNext) {
            g.strokeStyle = isK ? col.a() : withAlpha(theme.muted, 0.7);
            g.lineWidth = 1.4;
            g.stroke();
          }
          label(String(i * i), x + chipW / 2, y + chipH / 2 + 0.5, `${isK ? 800 : 600} ${fs(12.5, 11.5)}px ${theme.font}`, isK ? col.a() : theme.text);
          g.restore();
        }
        lines.forEach((ln, i) => label(ln, R.x + pad, R.y + 40 + rowsN * (chipH + 6) + 8 + i * 16, nf, theme.muted, 'left'));
        return h;
      };
    }

    function simplifyCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = aInt();
        const { k: f, m } = squareFactor(a);
        const hs = hide();
        const rows: Row[] = [{ src: `${rt('a · b')} = ${rt('a')} · ${rt('b')}  \\c{m}{(a, b ≥ 0)}`, size: fs(13.5, 12.5), gap: 12 }];
        if (m === 1) rows.push({ src: `\\c{r}{${rt(a)} = ${hs ? '?' : f}}  \\c{m}{${up(say(L('– genau', '– exactly')))}}`, size: fs(14, 13) });
        else if (f === 1) {
          rows.push({ src: `\\c{r}{${rt(a)}}: \\c{m}{${up(say(L('kein Quadratfaktor', 'no square factor')))}}`, size: fs(13.5, 12.5) });
          rows.push({ src: `\\c{m}{${up(say(L('z. B.', 'e.g.')))}} ${rt(50)} = ${rt('25 · 2')} = 5${rt(2)}`, size: fs(13, 12), color: th().muted });
        } else {
          rows.push({ src: `\\c{r}{${rt(a)}} = ${rt(`\\c{a}{${f * f}} · ${m}`)} = ${rt(`\\c{a}{${f * f}}`)} · ${rt(m)}`, size: fs(14, 13) });
          rows.push({ src: `= \\c{r}{\\b{${hs ? '?' : f}${rt(m)}}} ${hs ? '' : `≈ ${f} · ${N(Math.sqrt(m), 4)} ≈ ${N(f * Math.sqrt(m), 3)}`}`, size: fs(14, 13), hl: col.r() });
        }
        return formulaCard(R, measure, k, say(L('Wurzel vereinfachen', 'Simplifying roots')), col.a(), rows);
      };
    }

    /* ---------- Intervall-Karten ---------- */
    function probeCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const a = aInt();
        const S = nestState(now);
        const lvl = S.inStep ? (step?.to ?? S.level) : S.level;
        const pr = S.probes;
        const shownI = S.inStep ? S.probeI : pr.length - 1;
        const maxRows = 5;
        const from = Math.max(0, shownI + 1 - maxRows);
        const decT = lvl;
        const rows: Row[] = [];
        if (!pr.length) rows.push({ src: `\\c{r}{${rt(a)} = ${N(Math.sqrt(a), 0)}}  \\c{m}{${up(say(L('– fertig, keine Probe mehr nötig', '– done, no more checks needed')))}}` });
        if (from > 0) rows.push({ src: `\\c{m}{…}`, size: fs(12, 11), gap: 4 });
        for (let i = from; i <= shownI && i < pr.length; i++) {
          const q = pr[i]!;
          const rel = q.cmp < 0 ? '<' : q.cmp > 0 ? '>' : '=';
          const c = q.cmp < 0 ? 'y' : q.cmp > 0 ? 'x' : 'r';
          const verdict = q.cmp < 0 ? say(L('zu klein', 'too small')) : q.cmp > 0 ? say(L('zu groß', 'too big')) : say(L('genau!', 'exact!'));
          const tIn = S.inStep && i === shownI ? clamp01(((now - (step?.t0 ?? 0)) / PROBE_MS - i) * 2.5) : 1;
          rows.push({ src: `\\c{${c}}{${Fx(q.t, decT)}² = ${N(q.sq, 2 * decT)}} ${rel} ${a}  \\c{m}{${up(verdict)}}`, size: fs(13, 12), at: Math.min(tIn, clamp01(k.stagger * 8 - (i - from))), hl: q.cmp >= 0 ? (q.cmp > 0 ? col.x() : col.r()) : undefined, gap: 7 });
        }
        return formulaCard(R, measure, k, say(L('Probe durch Quadrieren', 'Check by squaring')), col.y(), rows, lvl === 0 ? `\\c{m}{${up(say(L('ganze Zahlen', 'whole numbers')))}}` : `\\c{m}{${lvl}. ${up(say(L('Stelle', 'decimal')))}}`);
      };
    }

    function nestTableCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const a = aInt();
        const S = nestState(now);
        const lvlMax = S.level;
        const rH = fs(21, 19);
        const rowsN = Math.min(lvlMax, 6) + 1;
        const h = 58 + 7 * rH + 2;
        if (measure) return h;
        card({ ...R, h }, col.r());
        cardTitle(R, say(L('Intervalle', 'Intervals')), col.r());
        const hy = R.y + 42;
        const hf = `700 ${fs(11.5, 11)}px ${theme.font}`;
        const c0 = R.x + pad;
        const c1 = R.x + pad + 22;
        const c3 = R.x + R.w - pad;
        label('n', c0, hy, hf, theme.muted, 'left');
        label(say(L('Intervall', 'interval')), c1, hy, hf, theme.muted, 'left');
        label(say(L('Länge', 'length')), c3, hy, hf, theme.muted, 'right');
        for (let i = 0; i < rowsN; i++) {
          const y = hy + 19 + i * rH;
          const al = ease.outCubic(clamp01(k.stagger * 8 - i));
          g.save();
          g.globalAlpha *= al;
          const [lo, hi] = nestInterval(a, i);
          const ex = exactAt(a, i);
          if (i === lvlMax) {
            g.fillStyle = withAlpha(col.r(), theme.dark ? 0.16 : 0.09);
            roundRect(g, R.x + pad - 6, y - rH / 2 + 1, R.w - 2 * pad + 12, rH - 2, 6);
            g.fill();
          }
          const f = `650 ${fs(12, 11.5)}px ${theme.font}`;
          label(String(i), c0, y, f, theme.muted, 'left');
          if (ex) label(`√${a} = ${N(lo, 0)}`, c1, y, f, col.r(), 'left');
          else {
            const box = formula(g, `[\\c{y}{${Fx(lo, i)}}${lang === 'de' ? ';' : ','} \\c{x}{${Fx(hi, i)}}]`, fstyle(fs(12, 11.5), theme.text, 650));
            box.draw(g, c1, y + (box.asc - box.desc) / 2);
          }
          label(ex ? '0' : fmt.num(10 ** -i, i), c3, y, f, theme.muted, 'right');
          g.restore();
        }
        return h;
      };
    }

    function nestNoteCard(k: Intro): CardFn {
      return (R, measure) => {
        const a = aInt();
        const paras = isPerfectSquare(a)
          ? [{ s: say(L(`${a} ist eine Quadratzahl: Schon die erste Probe trifft genau, √${a} = ${floorSqrt(a)}.`, `${a} is a square number: the first check is exact, √${a} = ${floorSqrt(a)}.`)) }, { s: say(L('Bei allen anderen natürlichen Zahlen endet die Schachtelung nie.', 'For all other whole numbers the nesting never ends.')), color: th().muted }]
          : [
              { s: say(L('Mit jeder Stelle wird das Intervall zehnmal kürzer. Die untere Grenze ist eine Näherung von unten, die obere von oben.', 'With every digit the interval becomes ten times shorter. The lower bound approximates from below, the upper bound from above.')) },
              { s: say(L(`Bei √${a} geht das unendlich weiter: √${a} ist irrational.`, `For √${a} this goes on forever: √${a} is irrational.`)), color: col.bad(), weight: 650 },
            ];
        return textCard(R, measure, k, say(L('Merke', 'Key fact')), col.r(), paras);
      };
    }

    /* ---------- Irrational-Karten ---------- */
    function proofCard(k: Intro, now: number): CardFn {
      return (R, measure) => {
        const n = nOf('irr');
        const rows: Row[] = [];
        const animK = step && step.mode === 'irr' ? ease.outCubic(clamp01((now - step.t0) / 650)) : 1;
        PROOF.forEach((st, i) => {
          if (i > n) return;
          const hl = i === n ? (st.tone === 'bad' ? col.bad() : st.tone === 'ok' ? col.r() : col.a()) : undefined;
          rows.push({ src: `\\c{m}{${i + 1}. ${up(say(st.head))}}`, size: fs(11.5, 11), color: th().muted, gap: 3, at: i === n ? animK : undefined });
          rows.push({ src: say(st.src), size: fs(13.5, 12.5), gap: 9, hl, at: i === n ? animK : undefined });
        });
        if (n < PROOF.length - 1) rows.push({ src: `\\c{m}{${up(say(L('… weiter mit „Nächster Schritt“', '… continue with “Next step”')))}}`, size: fs(12, 11), at: 1 });
        return formulaCard(R, measure, k, say(L('Beweis durch Widerspruch', 'Proof by contradiction')), col.bad(), rows, `${Math.min(n + 1, PROOF.length)}/${PROOF.length}`);
      };
    }

    function realCard(k: Intro): CardFn {
      return (R, measure) =>
        textCard(R, measure, k, say(L('Reelle Zahlen', 'Real numbers')), col.r(), [
          { s: say(L('Rationale Zahlen (Brüche) haben abbrechende oder periodische Dezimaldarstellungen.', 'Rational numbers (fractions) have terminating or repeating decimals.')) },
          { s: say(L('Irrationale Zahlen wie √2, √3 oder π nicht. Zusammen bilden sie die reellen Zahlen ℝ.', 'Irrational numbers such as √2, √3 or π do not. Together they form the real numbers ℝ.')) },
          { s: say(L('Genauso: √a ist irrational für jede natürliche Zahl a, die keine Quadratzahl ist.', 'Likewise: √a is irrational for every whole number a that is not a square number.')), color: th().muted },
        ]);
    }
    function missCardFn(k: Intro): CardFn {
      return (R, measure) => {
        const h = 46 + 7 * fs(24, 21) + 30;
        if (measure) return h;
        card({ ...R, h }, col.bad());
        drawMisses({ x: R.x + 8, y: R.y + 8, w: R.w - 16, h: h - 16 }, k);
        return h;
      };
    }

    function cardsFor(m: Mode, k: Intro, now: number): CardFn[] {
      if (m === 'heron') return [heronStepCard(k, now), heronTableCard(k, now), heronNoteCard(k)];
      if (m === 'square') return [squareMainCard(k), simplifyCard(k), squareNumbersCard(k)];
      if (m === 'nest') return [probeCard(k, now), nestTableCard(k, now), nestNoteCard(k)];
      return irrWide(regions().stage) ? [proofCard(k, now), realCard(k)] : [proofCard(k, now), missCardFn(k), realCard(k)];
    }

    function drawColumn(C: Rect, k: Intro, now: number, m: Mode, alpha: number): void {
      const g = surface.g;
      const list = cardsFor(m, k, now);
      const gap = fs(10, 8);
      let fadeK = 1;
      if (cardFade !== null) {
        const t = (now - cardFade) / 520;
        if (t >= 1) cardFade = null;
        else fadeK = clamp01(t);
      }
      const two = !regions().wide && C.w >= 470;
      const place = (fn: CardFn, R: Rect, i: number) => {
        const hh = fn(R, true);
        if (hh <= 0 || hh > R.h + 1) return -1;
        g.save();
        const a = clamp01(k.cards * 1.6 - i * 0.25) * clamp01(fadeK * 2.2 - i * 0.35) * alpha;
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 14, 0);
        fn({ ...R, h: Math.min(hh, R.h) }, false);
        g.restore();
        return hh;
      };
      if (two) {
        const cw = (C.w - gap) / 2;
        let yL = C.y;
        let yR = C.y;
        list.forEach((fn, i) => {
          const leftCol = yL <= yR;
          const x = leftCol ? C.x : C.x + cw + gap;
          const y = leftCol ? yL : yR;
          const hh = place(fn, { x, y, w: cw, h: C.y + C.h - y }, i);
          if (hh < 0) return;
          if (leftCol) yL += hh + gap;
          else yR += hh + gap;
        });
        return;
      }
      let y = C.y;
      list.forEach((fn, i) => {
        const hh = place(fn, { x: C.x, y, w: C.w, h: C.y + C.h - y }, i);
        if (hh >= 0) y += hh + gap;
      });
    }

    /* =====================================================================
     * Ergebnisse
     * ===================================================================== */
    function updateReadouts(): void {
      const m = mode();
      const a = aInt();
      const kk = floorSqrt(a);
      const r = Math.sqrt(a);
      const perfect = kk * kk === a;
      const v = (s: string) => `<var>${s}</var>`;
      const sub = (s: string | number) => `<sub>${s}</sub>`;
      const n = nOf();
      if (m === 'heron') {
        const list = stepsExact();
        if (n === 0) ctx.readout('now', { html: `${say(L('Start', 'Start'))}: ${v('x')}${sub(0)} = ${N(p.x0, 2)}, ${v('a')} : ${v('x')}${sub(0)} = ${N(list[0]!.y, 6)}` });
        else {
          const q0 = list[n - 1]!;
          const q1 = list[n]!;
          const e = (x: number, d: number) => (isEx(x, d) ? '=' : '≈');
          ctx.readout('now', { html: `${v('x')}${sub(n)} = (${N(q0.x, 6)} + ${N(q0.y, 6)}) : 2 ${e(q1.x, 9)} <strong>${N(q1.x, 9)}</strong> · ${v('a')} : ${v('x')}${sub(n)} ${e(q1.y, 9)} ${N(q1.y, 9)}` });
        }
      } else if (m === 'nest') {
        const [lo, hi] = nestInterval(a, n);
        if (exactAt(a, n)) ctx.readout('now', { html: `√${a} = <strong>${N(lo, 0)}</strong>, ${say(L('weil', 'because'))} ${N(lo, 0)}<sup>2</sup> = ${a}` });
        else ctx.readout('now', { html: `<strong>${Fx(lo, n)} &lt; √${a} &lt; ${Fx(hi, n)}</strong>, ${say(L('weil', 'because'))} ${N(lo * lo, 2 * n)} &lt; ${a} &lt; ${N(hi * hi, 2 * n)}` });
      } else if (m === 'irr') {
        const st = PROOF[n]!;
        ctx.readout('now', `${n + 1}. ${say(st.head)}`);
      } else ctx.readout('now', null);
      if (m === 'irr') {
        ctx.readout('sq', { html: `1<sup>2</sup> = 1 &lt; 2 &lt; 4 = 2<sup>2</sup> · ${say(L('Fast-Treffer', 'near miss'))} 17/12: 17<sup>2</sup> = 289, 2 · 12<sup>2</sup> = 288` });
        ctx.readout('root', { html: `√2 ≈ ${N(Math.SQRT2, 9)}… (${say(L('irrational', 'irrational'))})` });
        ctx.readout('simp', null);
      } else {
        ctx.readout('sq', perfect ? { html: `${kk}<sup>2</sup> = ${a} ⇒ √${a} = ${kk}` } : { html: `${kk}<sup>2</sup> = ${kk * kk} &lt; ${a} &lt; ${(kk + 1) ** 2} = ${kk + 1}<sup>2</sup> ⇒ ${kk} &lt; √${a} &lt; ${kk + 1}` });
        ctx.readout('root', perfect ? { html: `√${a} = <strong>${kk}</strong>` } : { html: `√${a} ≈ <strong>${N(r, 9)}</strong>` });
        const { k: f, m: mm } = squareFactor(a);
        if (m === 'square' && f > 1 && mm > 1) ctx.readout('simp', { html: `√${a} = √(${f * f} · ${mm}) = √${f * f} · √${mm} = <strong>${f}√${mm}</strong> ≈ ${N(f * Math.sqrt(mm), 3)}` });
        else ctx.readout('simp', null);
      }
      const nn = nOf();
      const nestDone = m === 'nest' && exactAt(a, nn);
      ctx.setAction('next', { enabled: editable() && nn < maxN() && !nestDone });
      ctx.setAction('play', { enabled: editable(), label: autoplay ? say(L('Anhalten', 'Pause')) : say(L('Alles abspielen', 'Play all')) });
      ctx.setAction('restart', { enabled: editable() && nn > 0 });
      ctx.setAction('build', { enabled: editable() });
      ctx.setAction('diag', { enabled: editable() });
    }

    /* =====================================================================
     * Rendern
     * ===================================================================== */
    function drawStage(m: Mode, R: Rect, k: Intro, now: number): void {
      if (m === 'heron') drawHeron(R, k, now);
      else if (m === 'square') drawSquare(R, k, now);
      else if (m === 'nest') drawNest(R, k, now);
      else drawIrr(R, k, now);
    }

    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      let anim = false;
      // Heron: Ausdehnung und Zahlengerade nachführen
      for (const c of chans) if (c.step(now, dt)) anim = true;
      if (step && now - step.t0 > step.dur) {
        const s = step;
        step = null;
        if (s.mode === 'heron') HN.jump(nOf('heron'));
        anim = true;
        updateReadouts();
      }
      if (step && step.mode === 'heron' && step.to === step.from + 1 && step.dur >= HERON_DUR && now - step.t0 > H_MARK + H_MOVE + H_CORNER && !step.zoomed) {
        step.zoomed = true;
        const t = heronLine(step.to);
        HL.glide(t.lw, H_MORPH + 200, 0, now);
        HC.glide(t.c, H_MORPH + 200, 0, now);
        const e = heronExtent(false);
        EW.glide(e.w, H_MORPH, 0, now);
        EH.glide(e.h, H_MORPH, 0, now);
      }
      if (step && step.mode === 'nest' && !step.zoomed) {
        const pr = nestProbes(aInt(), step.to);
        if (now - step.t0 > pr.length * PROBE_MS + 250) {
          step.zoomed = true;
          const v = nestView(step.to);
          NC.glide(v.c, ZOOM_MS, 0, now);
          NW.glide(v.lw, ZOOM_MS, 0, now, ease.inOutCubic);
        }
      }
      if (build && now - build.t0 > build.dur + 200) build = null;
      if (diag && now - diag.t0 > diag.dur + 100) diag = null;
      if (step || build || diag || intro !== null || modeFade || cardFade !== null || wrongTap || dragging()) anim = true;
      const k = introState(now);
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      let fadeIn = 1;
      if (modeFade) {
        const t = (now - modeFade.t0) / 520;
        if (t >= 1) modeFade = null;
        else fadeIn = ease.inOutCubic(clamp01(t));
      }
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      if (modeFade && fadeIn < 1) {
        g.save();
        g.globalAlpha *= 1 - fadeIn;
        drawStage(modeFade.from, R.stage, DONE, now);
        g.restore();
        g.save();
        g.globalAlpha *= fadeIn;
        drawStage(mode(), R.stage, k, now);
        g.restore();
      } else drawStage(mode(), R.stage, k, now);
      g.restore();
      drawColumn(R.col, k, now, mode(), 1);
      if (anim) ctx.requestRender();
    }

    /* =====================================================================
     * Übergänge
     * ===================================================================== */
    function retarget(now: number, source: string): void {
      const instant = source === 'init' || reduced();
      const slow = source === 'replace';
      const set = (c: Chan, v: number, dur = 750) => {
        if (instant) c.jump(v);
        else if (dragging()) c.follow(v, 0.06);
        else if (slow) c.glide(v, dur, 0, now);
        else if (Math.abs(c.goal - v) > 1e-12) c.glide(v, dur * 0.8, 0, now);
      };
      set(A, p.a, 700);
      set(X0, p.x0, 700);
      set(KG, p.grid ? 1 : 0, 400);
      // Heron
      const stepping = step && step.mode === 'heron' && step.to === step.from + 1;
      if (!stepping) {
        set(HN, nOf('heron'), 900);
        const e = heronExtent();
        set(EW, e.w, 800);
        set(EH, e.h, 800);
        const t = heronLine(nOf('heron'));
        set(HL, t.lw, 900);
        set(HC, t.c, 900);
      }
      // Intervallschachtelung
      if (!(step && step.mode === 'nest')) {
        const v = nestView(nOf('nest'));
        set(NC, v.c, 900);
        set(NW, v.lw, 900);
      }
      // Quadrat
      const a = aInt();
      set(CN, a, 600);
      set(SE, Math.max(2, floorSqrt(a) + (isPerfectSquare(a) ? 0.6 : 1.4)), 700);
    }

    function startStep(from: number, to: number, now: number): void {
      const m = mode();
      if (reduced() || to !== from + 1 || m === 'square') {
        step = null;
        return;
      }
      if (m === 'heron') {
        const list = stepsExact();
        const cut = heronCut(aInt(), list[from]!.x);
        const sc = heronMap?.sc ?? 30;
        const tiny = cut.d * sc < 2;
        step = { mode: m, from, to, t0: now, dur: tiny ? 800 : HERON_DUR, zoomed: false };
        if (tiny) {
          HN.glide(to, 800, 0, now);
          const t = heronLine(to);
          HL.glide(t.lw, 800, 0, now);
          HC.glide(t.c, 800, 0, now);
          step.zoomed = true;
        }
        const e = heronExtent();
        EW.glide(Math.max(EW.v, e.w), 500, 0, now);
        EH.glide(Math.max(EH.v, e.h), 500, 0, now);
      } else if (m === 'nest') {
        const pr = nestProbes(aInt(), to);
        step = { mode: m, from, to, t0: now, dur: pr.length * PROBE_MS + 250 + ZOOM_MS + 100, zoomed: false };
      } else {
        step = { mode: m, from, to, t0: now, dur: 700, zoomed: true };
      }
    }

    function stopAuto(): void {
      autoplay = false;
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = null;
    }
    function scheduleAuto(): void {
      if (autoTimer) clearTimeout(autoTimer);
      autoTimer = null;
      if (!autoplay) return;
      const left = step ? Math.max(0, step.t0 + step.dur - performance.now()) : 0;
      autoTimer = setTimeout(() => {
        autoTimer = null;
        if (!autoplay || ctx.locked) return;
        const n = nOf();
        const done = n >= maxN() || (mode() === 'nest' && exactAt(aInt(), n));
        if (done) {
          stopAuto();
          updateReadouts();
          return;
        }
        ctx.set({ n: n + 1 });
        scheduleAuto();
      }, left + (reduced() ? 700 : 650));
    }

    /* =====================================================================
     * Zeiger: Griffe ziehen, Teilintervalle antippen
     * ===================================================================== */
    const near = (pt: Pt | null, px: number, py: number) => !!pt && Math.hypot(px - pt[0], py - pt[1]) < fs(16, 20);
    function hitHandle(px: number, py: number): 'x0' | 'corner' | null {
      if (ctx.locked) return null;
      if (mode() === 'heron' && near(heronHit.knob, px, py)) return 'x0';
      if (mode() === 'square' && near(squareHit.corner, px, py)) return 'corner';
      return null;
    }
    function dragTo(px: number, py: number): void {
      if (drag === 'x0' && heronMap) {
        const u = (px - heronMap.ox) / heronMap.sc;
        const v = clamp(Math.round(u * 2) / 2, 1, 20);
        if (v !== p.x0) ctx.set({ x0: v });
      } else if (drag === 'corner') {
        const u = (px - squareHit.ox) / squareHit.cell;
        const w = (squareHit.oy - py) / squareHit.cell;
        const s = Math.max(0.5, (u + w) / 2);
        const v = clamp(Math.round(s * s), 1, 200);
        if (v !== p.a) ctx.set({ a: v });
      }
    }
    surface.addTarget({
      contains: (px: number, py: number) => drag !== null || hitHandle(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        const h = hitHandle(pt.px, pt.py);
        if (!h) return false;
        drag = h;
        stopAuto();
        surface.setCursor('grabbing');
        ctx.requestRender();
        return true;
      },
      pointerMove: (pt: { px: number; py: number }) => {
        if (!drag || ctx.locked) return;
        lastDrag = performance.now();
        dragTo(pt.px, pt.py);
      },
      pointerUp: () => {
        drag = null;
        lastDrag = performance.now();
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt ? hitHandle(pt.px, pt.py) : null;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? (drag ? 'grabbing' : 'grab') : '');
      },
      wheel: () => false,
    });

    new TapTarget(surface, {
      hit: (px, py) => {
        if (ctx.locked || mode() !== 'nest' || !nestHit || step) return null;
        const H = nestHit;
        if (Math.abs(py - H.y) > 22 || px < H.x0 || px > H.x1) return null;
        const j = clamp(Math.floor(((px - H.x0) / (H.x1 - H.x0)) * H.count), 0, H.count - 1);
        return String(j);
      },
      onHover: (id) => {
        const v = id === null ? -1 : Number(id);
        if (v !== hoverSub) {
          hoverSub = v;
          ctx.requestRender();
        }
      },
      onTap: (id) => {
        if (ctx.locked || !nestHit) return;
        const j = Number(id);
        const a = aInt();
        const tl = nestHit.lo + j * nestHit.sub;
        const th2 = tl + nestHit.sub;
        stopAuto();
        const r = Math.sqrt(a);
        if (r >= tl - 1e-12 && r < th2 - 1e-12) {
          hoverSub = -1;
          ctx.set({ n: nOf('nest') + 1 });
        } else {
          wrongTap = { j, t0: performance.now() };
          ctx.requestRender();
        }
      },
    });

    return {
      update(changed, source) {
        const now = performance.now();
        const pm = prevMode;
        const pn = prevN;
        if (source === 'input' && changed.has('mode')) {
          ctx.set({ n: 0 });
        }
        if (source === 'input' && changed.has('n') && p.n > maxN()) ctx.set({ n: maxN() });
        // Fremde Eingaben beenden das automatische Abspielen
        if ((source === 'input' || source === 'replace') && autoplay) stopAuto();
        if ((source === 'input' || source === 'replace') && [...changed].some((key) => key !== 'show' && key !== 'grid')) {
          build = null;
          wrongTap = null;
        }
        const modeChanged = changed.has('mode') && mode() !== pm;
        if (modeChanged && source !== 'init') {
          step = null;
          if (!reduced()) {
            modeFade = { from: pm, t0: now };
            cardFade = now;
            intro = now;
          }
          if (mode() === 'irr' && !reduced()) diag = { t0: now + 300, dur: 3000 };
        }
        const nChanged = changed.has('n') && p.n !== pn;
        if (nChanged && source !== 'init' && !modeChanged && mode() === prevMode) {
          const from = clamp(Math.round(pn), 0, maxN());
          const to = nOf();
          if (step && step.mode === 'heron') HN.jump(step.to);
          step = null;
          if (to === from + 1 && source !== 'replace') startStep(from, to, now);
        }
        if ((changed.has('a') || changed.has('x0')) && source !== 'init' && step && !nChanged) {
          if (step.mode === 'heron') HN.jump(nOf('heron'));
          step = null;
        }
        retarget(now, source);
        if (source === 'replace' && !reduced()) cardFade = now;
        if (source === 'init' && !reduced()) {
          intro = now;
          if (mode() === 'irr') diag = null;
        }
        prevN = p.n;
        prevMode = mode();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'next') {
          stopAuto();
          const n = nOf();
          if (n < maxN() && !(mode() === 'nest' && exactAt(aInt(), n))) ctx.set({ n: n + 1 });
        } else if (id === 'play') {
          if (autoplay) stopAuto();
          else {
            autoplay = true;
            if (nOf() >= maxN() || (mode() === 'nest' && exactAt(aInt(), nOf()))) {
              ctx.set({ n: 0 });
              autoplay = true;
            }
            scheduleAuto();
          }
        } else if (id === 'restart') {
          stopAuto();
          ctx.set({ n: 0 });
        } else if (id === 'build') {
          if (!reduced()) {
            const kk = floorSqrt(aInt());
            build = { t0: now, dur: clamp(900 + kk * 380, 1800, 6200) };
          }
        } else if (id === 'diag') {
          if (!reduced()) diag = { t0: now, dur: 3200 };
        }
        updateReadouts();
        ctx.requestRender();
      },
      render,
      destroy: () => {
        stopAuto();
        surface.destroy();
      },
    };
  },
});
