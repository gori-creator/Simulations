import { defineSimulation, ease, formatNumber, mixColor, prefersReducedMotion, roundRect, seededRandom, shade, Surface, text, type Rect } from '../../../sim-core';
import {
  approxScientific,
  commaShift,
  E_MAX,
  E_MIN,
  EARTH_RADIUS,
  floorExp,
  formatDecimal,
  groupDigits,
  isZero,
  lengthParts,
  mantissaText,
  N_MAX,
  nearestObject,
  OBJECTS,
  objectExp,
  parseDecimal,
  power,
  powerLength,
  powerOfTenDecimal,
  powerOfTenName,
  powerReading,
  superscript,
  toScientific,
  trailingZeros,
  UNIT_EXP,
  cameraX,
  type Lang,
  type LengthUnit,
  type ObjId,
  type SizeObject,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const C30 = Math.cos(Math.PI / 6);

type Mode = 'zoom' | 'pow' | 'sci';

/* ------------------------------------------------------------------ */
/* Texte                                                               */
/* ------------------------------------------------------------------ */

interface ObjText {
  name: Loc;
  /** Was gemessen wird (Höhe, Länge, Durchmesser …). */
  what: Loc;
  /** Größenangabe ist ungefähr (≈). */
  approx: boolean;
  fact: Loc;
}

const OBJ_TEXT: Record<ObjId, ObjText> = {
  sand: { name: L('Sandkorn', 'Grain of sand'), what: L('Durchmesser', 'diameter'), approx: true, fact: L('So groß wie ein Kästchen auf Millimeterpapier.', 'As big as one square on graph paper.') },
  bug: { name: L('Marienkäfer', 'Ladybird'), what: L('Länge', 'length'), approx: true, fact: L('Sieben Sandkörner hintereinander sind so lang wie ein Marienkäfer.', 'Seven grains of sand in a row are as long as a ladybird.') },
  apple: { name: L('Apfel', 'Apple'), what: L('Durchmesser', 'diameter'), approx: true, fact: L('Gut zehn Marienkäfer passen nebeneinander über einen Apfel.', 'About ten ladybirds fit side by side across an apple.') },
  child: { name: L('Kind', 'Child'), what: L('Körpergröße', 'height'), approx: true, fact: L('Etwa 18 Äpfel übereinander sind so hoch wie ein Kind der 5. Klasse.', 'About 18 apples stacked up are as tall as a child of eleven.') },
  house: { name: L('Haus', 'House'), what: L('Höhe', 'height'), approx: true, fact: L('Etwa sieben Kinder aufeinander wären so hoch wie das Haus.', 'About seven children standing on each other would be as tall as the house.') },
  field: { name: L('Fußballfeld', 'Football pitch'), what: L('Länge', 'length'), approx: false, fact: L('Meist 105 m lang und 68 m breit – rund zehn Häuser hintereinander.', 'Usually 105 m long and 68 m wide – about ten houses in a row.') },
  peak: { name: L('Zugspitze', 'Zugspitze'), what: L('Höhe über dem Meer', 'height above sea level'), approx: false, fact: L('Deutschlands höchster Berg ist fast 3 km hoch – etwa 28 Fußballfelder.', 'Germany’s highest mountain is almost 3 km high – about 28 football pitches.') },
  plane: { name: L('Flugzeug', 'Airliner'), what: L('Reiseflughöhe', 'cruising height'), approx: true, fact: L('Verkehrsflugzeuge fliegen etwa 10 km hoch – mehr als dreimal so hoch wie die Zugspitze.', 'Airliners fly about 10 km high – more than three times the height of the Zugspitze.') },
  space: { name: L('Grenze zum Weltraum', 'Edge of space'), what: L('Höhe', 'height'), approx: true, fact: L('Ab etwa 100 km Höhe beginnt nach einer üblichen Festlegung der Weltraum.', 'By a common definition, space begins about 100 km up.') },
  iss: { name: L('Raumstation ISS', 'Space station ISS'), what: L('Flughöhe', 'orbit height'), approx: true, fact: L('Die ISS umkreist die Erde in etwa 400 km Höhe, einmal in rund 90 Minuten.', 'The ISS circles the Earth about 400 km up, once in roughly 90 minutes.') },
  earth: { name: L('Erde', 'Earth'), what: L('Durchmesser', 'diameter'), approx: true, fact: L('Im Vergleich zur Erde fliegt die ISS ganz dicht über der Oberfläche.', 'Compared with the Earth, the ISS flies very close to the surface.') },
};

/** 10ᵏ Meter in Worten. */
const METER_NAMES: Record<number, Loc> = {
  [-3]: L('ein Tausendstel Meter', 'one thousandth of a metre'),
  [-2]: L('ein Hundertstel Meter', 'one hundredth of a metre'),
  [-1]: L('ein Zehntel Meter', 'one tenth of a metre'),
  0: L('ein Meter', 'one metre'),
  1: L('zehn Meter', 'ten metres'),
  2: L('hundert Meter', 'one hundred metres'),
  3: L('tausend Meter', 'one thousand metres'),
  4: L('zehntausend Meter', 'ten thousand metres'),
  5: L('hunderttausend Meter', 'one hundred thousand metres'),
  6: L('eine Million Meter', 'one million metres'),
  7: L('zehn Millionen Meter', 'ten million metres'),
};

const TOUR_LABEL = L('Reise starten', 'Start the journey');
const TOUR_STOP = L('Reise anhalten', 'Stop the journey');

/** Länge in passender Einheit für Texte (ohne ctx, z. B. für den Regler). */
function lengthText(meters: number, lang: Lang): string {
  const { value, unit } = lengthParts(meters);
  const dec = value >= 100 ? 0 : value >= 10 ? 1 : 2;
  const r = Math.round(value * 10 ** dec) / 10 ** dec;
  const s = r >= 1000 && Number.isInteger(r) ? groupDigits(r, lang) : formatNumber(r, lang, { decimals: dec });
  return `${s} ${unit}`;
}

/** Hochzahl als Text mit echtem Minus. */
const expText = (k: number) => (k < 0 ? `−${-k}` : String(k));
const sup = (k: number) => superscript(expText(k));

/* ------------------------------------------------------------------ */
/* Weich gleitende Werte                                               */
/* ------------------------------------------------------------------ */

class Glide {
  private from: number;
  private to: number;
  private t0 = 0;
  private ms = 0;
  private fn: (t: number) => number = ease.inOutCubic;
  constructor(
    v: number,
    private readonly reduced: boolean,
  ) {
    this.from = v;
    this.to = v;
  }
  get target(): number {
    return this.to;
  }
  at(now: number): number {
    if (this.ms <= 0) return this.to;
    const u = clamp((now - this.t0) / this.ms, 0, 1);
    return this.from + (this.to - this.from) * this.fn(u);
  }
  busy(now: number): boolean {
    return this.ms > 0 && now < this.t0 + this.ms;
  }
  go(to: number, ms = 600, fn: (t: number) => number = ease.inOutCubic, delay = 0): void {
    if (to === this.to && !this.busy(performance.now())) return;
    const now = performance.now();
    this.from = this.at(now);
    this.to = to;
    this.t0 = now + delay;
    this.ms = this.reduced ? 0 : ms;
    this.fn = fn;
  }
  snap(v: number): void {
    this.from = v;
    this.to = v;
    this.ms = 0;
  }
}

interface Geo {
  W: number;
  H: number;
  wide: boolean;
  C: Rect;
  panel: Rect;
}

interface Hit {
  id: string;
  r: Rect;
}

/** Blickfeld der Zoom-Bühne: Bildschirm = (ax + (x − cx)·k, gy − y·k). */
interface ZView {
  S: Rect;
  strip: Rect;
  E: number;
  U: number;
  k: number;
  ax: number;
  gy: number;
  cx: number;
  f: number;
}

/**
 * Potenzen, Zehnerpotenzen und Größenordnungen: eine Zoom-Reise vom
 * Sandkorn bis zur Erde mit Kästchen-Maßstab und logarithmischem
 * Größenstrahl, Potenzen als wiederholte Multiplikation (Faktorkarten und
 * Würfelbauten, die mit jeder Hochzahl um den Faktor der Grundzahl wachsen)
 * und die wissenschaftliche Schreibweise, bei der das Komma Stelle für
 * Stelle wandert.
 */
export default defineSimulation({
  id: 'zehnerpotenzen',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.62 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'zoom', label: L('Zoom durch die Größen', 'Zoom through sizes') },
        { value: 'pow', label: L('Potenz als Produkt', 'Power as a product') },
        { value: 'sci', label: L('Wissenschaftliche Schreibweise', 'Scientific notation') },
      ],
      default: 'zoom',
    },
    {
      key: 'e',
      type: 'number',
      label: L('Hochzahl: 1 Kästchen = 10ⁿ m', 'Exponent: 1 square = 10ⁿ m'),
      min: E_MIN,
      max: E_MAX,
      step: 0.05,
      default: 0,
      display: (v, lang) => {
        const l = lang as Lang;
        const k = Math.round(v);
        if (Math.abs(v - k) < 1e-6) {
          const pl = powerLength(k);
          return `10${sup(k)} m = ${pl.value >= 1000 ? groupDigits(pl.value, l) : formatNumber(pl.value, l)} ${pl.unit}`;
        }
        return `≈ ${lengthText(10 ** v, l)}`;
      },
      help: L('Tipp: In der Bühne nach links oder rechts ziehen, ein Objekt oder den Größenstrahl antippen.', 'Tip: drag left or right in the picture, or tap an object or the size line.'),
      visibleIf: (v) => v.mode === 'zoom',
    },
    { key: 'b', type: 'number', label: L('Grundzahl', 'Base'), min: 2, max: 10, step: 1, default: 10, visibleIf: (v) => v.mode === 'pow' },
    { key: 'n', type: 'number', label: L('Hochzahl', 'Exponent'), min: 0, max: N_MAX, step: 1, default: 3, visibleIf: (v) => v.mode === 'pow' },
    {
      key: 'z',
      type: 'text',
      label: L('Zahl', 'Number'),
      default: '35000',
      maxLength: 24,
      placeholder: L('z. B. 35 000 oder 0,0042', 'e.g. 35,000 or 0.0042'),
      help: L('Positive Zahl mit Dezimalkomma; Leerzeichen zum Gliedern sind erlaubt.', 'A positive number; use a decimal point. Spaces for grouping are allowed.'),
      visibleIf: (v) => v.mode === 'sci',
    },
    {
      key: 'show',
      type: 'boolean',
      label: L('Ergebnisse im Bild zeigen', 'Show results in the picture'),
      default: true,
      help: L('Ausgeschaltet zum Schätzen und Selberrechnen; die Aktion deckt auf.', 'Turn off to estimate and calculate yourself; the action reveals it.'),
    },
  ],
  actions: [
    { id: 'tour', label: TOUR_LABEL, primary: true, visibleIf: (v) => v.mode === 'zoom' },
    { id: 'out', label: L('Ausschnitt · 10', 'View × 10'), visibleIf: (v) => v.mode === 'zoom' },
    { id: 'in', label: L('Ausschnitt : 10', 'View ÷ 10'), visibleIf: (v) => v.mode === 'zoom' },
    { id: 'build', label: L('Schritt für Schritt aufbauen', 'Build step by step'), primary: true, visibleIf: (v) => v.mode === 'pow' },
    { id: 'more', label: L('Hochzahl + 1', 'Exponent + 1'), visibleIf: (v) => v.mode === 'pow' },
    { id: 'hop', label: L('Komma wandern lassen', 'Move the decimal point'), primary: true, visibleIf: (v) => v.mode === 'sci' },
  ],
  readouts: [
    { key: 'grid', label: L('1 Kästchen', '1 square') },
    { key: 'obj', label: L('Im Blick', 'In view'), spoiler: true },
    { key: 'units', label: L('Umrechnung', 'Conversion') },
    { key: 'prod', label: L('Produkt', 'Product') },
    { key: 'val', label: L('Wert', 'Value'), spoiler: true },
    { key: 'parts', label: L('Fachbegriffe', 'Terms') },
    { key: 'sci', label: L('Wissenschaftliche Schreibweise', 'Scientific notation'), spoiler: true },
    { key: 'shift', label: L('Komma verschoben', 'Decimal point moved'), spoiler: true },
    { key: 'check', label: L('Probe', 'Check'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Ein Kind: 1 Kästchen = 1 m', 'A child: 1 square = 1 m'), values: {} },
    { id: 'sand', label: L('Ganz klein: ein Sandkorn', 'Tiny: a grain of sand'), values: { e: -3 } },
    { id: 'earth', label: L('Ganz groß: die Erde', 'Huge: the Earth'), values: { e: 7 } },
    { id: 'million', label: L('10⁶ = eine Million', '10⁶ = one million'), values: { mode: 'pow', n: 6 } },
    { id: 'three', label: L('3⁴ = 81', '3⁴ = 81'), values: { mode: 'pow', b: 3, n: 4 } },
    { id: 'sci', label: L('35 000 = 3,5 · 10⁴', '35,000 = 3.5 · 10⁴'), values: { mode: 'sci' } },
  ],
  strings: {
    de: { canvas: 'Zoom durch die Größenordnungen vom Sandkorn bis zur Erde mit Kästchen-Maßstab und Größenstrahl; Potenzen als wiederholte Multiplikation mit Faktorkarten und Würfeln; wissenschaftliche Schreibweise mit wanderndem Komma' },
    en: { canvas: 'Zoom through orders of magnitude from a grain of sand to the Earth with a grid scale and a size line; powers as repeated multiplication with factor cards and cubes; scientific notation with a moving decimal point' },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang as Lang;
    const reduced = prefersReducedMotion();
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const G = (v: number) => new Glide(v, reduced);
    const mode = () => p.mode as Mode;
    const dec = (k: number) => formatDecimal(powerOfTenDecimal(k), lang);
    /** Zahl mit Dreiergruppen (schmales Leerzeichen). */
    const gd = (v: number) => groupDigits(v, lang);

    let now = performance.now();
    let geo: Geo | null = null;
    let hits: Hit[] = [];
    let hover: string | null = null;
    let sceneStart = now + (reduced ? -1e6 : 60);
    /** Einblenden nach dem Laden oder einem Wechsel der Ansicht. */
    const sceneA = () => (reduced ? 1 : ease.outCubic(clamp((now - sceneStart) / 450, 0, 1)));

    /* ---------------- Zustand: Zoom ---------------- */
    const camE = G(p.e);
    let camNext: { ms: number; fn: (t: number) => number } | null = null;
    let tourTimer: ReturnType<typeof setTimeout> | null = null;
    let drag: { kind: 'scene' | 'strip'; x0: number; e0: number; moved: boolean; obj: number | null } | null = null;
    const stars = (() => {
      const rnd = seededRandom(7);
      return Array.from({ length: 90 }, () => ({ x: rnd(), y: rnd(), r: 0.5 + rnd() * 1.1, a: 0.4 + rnd() * 0.6 }));
    })();
    const CLOUDS: [number, number, number][] = [
      [1400, 1700, 900],
      [7600, 2500, 1300],
      [11800, 1300, 800],
      [21000, 1900, 1500],
      [30000, 2400, 1700],
      [47000, 1600, 2200],
    ];

    /* ---------------- Zustand: Potenz ---------------- */
    const lv = G(p.n);

    /* ---------------- Zustand: wissenschaftliche Schreibweise ---------------- */
    let sciStart = now + 500;
    let sciRevealed = p.show;
    let powRevealed = p.show;

    function intro(): void {
      now = performance.now();
      sceneStart = now + (reduced ? -1e6 : 40);
      if (mode() === 'zoom') {
        const from = p.e - 0.8 >= E_MIN ? p.e - 0.8 : p.e + 0.8;
        if (!reduced) {
          camE.snap(from);
          camE.go(p.e, 1700, ease.inOutCubic, 150);
        } else camE.snap(p.e);
      } else if (mode() === 'pow') {
        lv.snap(Math.max(0, p.n - 1));
        lv.go(p.n, 900, ease.linear, 250);
      } else sciStart = now + (reduced ? -1e6 : 600);
    }

    /* ---------------- Zeichenhelfer ---------------- */
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    const accent = () => ctx.theme.series[3]!;

    function halo(value: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', a = 1, bg?: string): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = alpha(bg ?? cardBg(), 0.9);
      g.strokeText(value, x, y);
      g.fillStyle = color;
      g.fillText(value, x, y);
      g.restore();
    }

    function wrap(value: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const rows: string[] = [];
      let cur = '';
      for (const w of value.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    function card(r: Rect, radius = 16): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 20;
      g.shadowOffsetY = 5;
      roundRect(g, r.x, r.y, r.w, r.h, radius);
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

    /** Potenz „bⁿ“ mit hochgestellter Hochzahl. Liefert die Breite. */
    function powText(base: string, exp: string, x: number, y: number, size: number, cBase: string, cExp: string, align: 'left' | 'center' | 'right' = 'left', a = 1): number {
      const g = surface.g;
      const fb = font(800, size);
      const fe = font(800, Math.round(size * 0.6));
      g.font = fb;
      const wb = g.measureText(base).width;
      g.font = fe;
      const we = g.measureText(exp).width;
      const total = wb + we + size * 0.04;
      let x0 = x;
      if (align === 'center') x0 = x - total / 2;
      if (align === 'right') x0 = x - total;
      g.save();
      g.globalAlpha *= a;
      text(g, base, x0, y, { font: fb, color: cBase, align: 'left' });
      text(g, exp, x0 + wb + size * 0.04, y - size * 0.4, { font: fe, color: cExp, align: 'left' });
      g.restore();
      return total;
    }

    function measure(str: string, f: string): number {
      surface.g.font = f;
      return surface.g.measureText(str).width;
    }

    const addHit = (id: string, r: Rect) => hits.push({ id, r });
    const hitAt = (px: number, py: number): Hit | null => {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.r.x && px <= h.r.x + h.r.w && py >= h.r.y && py <= h.r.y + h.r.h) return h;
      }
      return null;
    };

    /* ---------------- Geometrie ---------------- */
    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.27, 210, 300));
        return { W, H, wide, C: { x: 6, y: 6, w: W - pw - 20, h: H - 12 }, panel: { x: W - pw - 6, y: 6, w: pw, h: H - 12 } };
      }
      const ch = Math.round(H * 0.61);
      return { W, H, wide, C: { x: 4, y: 4, w: W - 8, h: ch }, panel: { x: 4, y: ch + 12, w: W - 8, h: H - ch - 16 } };
    }

    /* ================================================================== */
    /* Zoom durch die Größenordnungen                                      */
    /* ================================================================== */

    function zview(gm: Geo): ZView {
      const C = gm.C;
      const stripH = gm.wide ? 78 : 70;
      const S = { x: C.x + 8, y: C.y + 8, w: C.w - 16, h: C.h - stripH - 12 };
      const strip = { x: C.x + 8, y: S.y + S.h + 4, w: C.w - 16, h: stripH };
      const E = camE.at(now);
      const U = 0.42 * Math.min(S.h, S.w * 0.85);
      const k = U / 10 ** E;
      const tb = smooth(5, 7, E);
      const gy = S.y + lerp(0.8 * S.h, 0.5 * S.h - (EARTH_RADIUS * U) / 1e7, tb);
      return { S, strip, E, U, k, ax: S.x + S.w * 0.56, gy, cx: cameraX(E), f: floorExp(E) };
    }
    const sx = (v: ZView, x: number) => v.ax + (x - v.cx) * v.k;
    const sy = (v: ZView, y: number) => v.gy - y * v.k;

    /** Wie stark ein Objekt gerade „im Blick“ ist (1 = genau seine Größenordnung). */
    const focusOf = (o: SizeObject, E: number) => clamp(1.35 - Math.abs(objectExp(o) - E), 0, 1);

    function skyColors(): { low: string; mid: string; high: string; space: string } {
      const theme = ctx.theme;
      const blue = theme.series[0]!;
      if (theme.dark)
        return { low: mixColor(blue, theme.bg, 0.68), mid: mixColor(blue, theme.bg, 0.6), high: mixColor('#1a2450', theme.bg, 0.3), space: '#05070f' };
      return { low: mixColor(blue, '#ffffff', 0.8), mid: mixColor(blue, '#ffffff', 0.58), high: mixColor(blue, '#0b1030', 0.55), space: '#0b1030' };
    }

    function landColors(): [string, string] {
      return ctx.theme.dark ? ['#4e7a3a', '#2f4d24'] : ['#8cbc63', '#5c8b42'];
    }

    function drawSky(v: ZView): void {
      const g = surface.g;
      const { S } = v;
      const c = skyColors();
      const grad = g.createLinearGradient(0, S.y, 0, S.y + S.h);
      const stops: [number, string][] = [
        [1.3e5, c.space],
        [4.5e4, c.high],
        [9e3, c.mid],
        [0, c.low],
      ];
      for (const [alt, col] of stops) grad.addColorStop(clamp((sy(v, alt) - S.y) / S.h, 0, 1), col);
      g.fillStyle = grad;
      g.fillRect(S.x, S.y, S.w, S.h);
      // Von weit draußen ist rings um die Erde nur noch Weltraum
      const outer = smooth(5.6, 6.5, v.E);
      if (outer > 0.01) {
        g.fillStyle = alpha(c.space, outer);
        g.fillRect(S.x, S.y, S.w, S.h);
      }
      // Sterne, wo der Himmel schon Weltraum ist
      for (const st of stars) {
        const y = S.y + st.y * S.h;
        const alt = (v.gy - y) / v.k;
        const a = Math.max(smooth(4e4, 1.4e5, alt), outer) * st.a;
        if (a < 0.03) continue;
        g.fillStyle = `rgba(255,255,255,${(a * (ctx.theme.dark ? 0.8 : 0.9)).toFixed(3)})`;
        g.beginPath();
        g.arc(S.x + st.x * S.w, y, st.r, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawClouds(v: ZView): void {
      const g = surface.g;
      for (const [x, alt, w] of CLOUDS) {
        const pw = w * v.k;
        if (pw < 8 || pw > v.S.w * 2.5) continue;
        const cx = sx(v, x);
        const cy = sy(v, alt);
        if (cx + pw < v.S.x || cx - pw > v.S.x + v.S.w) continue;
        const a = clamp((pw - 8) / 30, 0, 1) * (ctx.theme.dark ? 0.4 : 0.95);
        g.save();
        g.globalAlpha = a;
        const parts: [number, number, number][] = [
          [-0.3, 0.0, 0.17],
          [-0.12, -0.1, 0.22],
          [0.08, -0.14, 0.24],
          [0.27, -0.02, 0.17],
        ];
        roundRect(g, cx - 0.46 * pw, cy - 0.04 * pw, pw * 0.92, 0.17 * pw, 0.085 * pw);
        for (const [dx, dy, r] of parts) {
          g.moveTo(cx + dx * pw + r * pw, cy + dy * pw);
          g.arc(cx + dx * pw, cy + dy * pw, r * pw, 0, Math.PI * 2);
        }
        const cg = g.createLinearGradient(0, cy - 0.38 * pw, 0, cy + 0.13 * pw);
        cg.addColorStop(0, '#ffffff');
        cg.addColorStop(0.65, '#ffffff');
        cg.addColorStop(1, ctx.theme.dark ? '#9aa6b8' : '#dfe7f1');
        g.fillStyle = cg;
        g.shadowColor = 'rgba(40,60,90,0.18)';
        g.shadowBlur = Math.min(12, pw * 0.06);
        g.shadowOffsetY = Math.min(4, pw * 0.02);
        g.fill();
        g.restore();
      }
    }

    function drawGround(v: ZView): void {
      const g = surface.g;
      const { S } = v;
      const [l0, l1] = landColors();
      if (v.E < 4) {
        const grad = g.createLinearGradient(0, v.gy, 0, S.y + S.h);
        grad.addColorStop(0, l0);
        grad.addColorStop(1, l1);
        g.fillStyle = grad;
        g.fillRect(S.x, v.gy, S.w, S.y + S.h - v.gy);
        g.fillStyle = shade(l1, -0.15);
        g.fillRect(S.x, v.gy - 1, S.w, 2.5);
        return;
      }
      // die Erde als Kugel (bei großem Zoom sichtbar gekrümmt)
      const earth = OBJECTS.find((o) => o.id === 'earth')!;
      const cx = sx(v, earth.x);
      const r = EARTH_RADIUS * v.k;
      const cy = v.gy + r;
      const dark = ctx.theme.dark;
      const ballA = smooth(5.6, 6.6, v.E);
      // Lufthülle
      if (ballA > 0.01) {
        const atm = g.createRadialGradient(cx, cy, r * 0.98, cx, cy, r * 1.09);
        atm.addColorStop(0, alpha(ctx.theme.series[0]!, 0.55 * ballA));
        atm.addColorStop(1, alpha(ctx.theme.series[0]!, 0));
        g.fillStyle = atm;
        g.beginPath();
        g.arc(cx, cy, r * 1.09, 0, Math.PI * 2);
        g.fill();
      }
      g.save();
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.clip();
      // Meer
      const sea = g.createRadialGradient(cx - r * 0.35, cy - r * 0.45, r * 0.1, cx, cy, r);
      sea.addColorStop(0, dark ? '#2f69a8' : '#4b92d6');
      sea.addColorStop(1, dark ? '#122c55' : '#1f4f8f');
      g.fillStyle = sea;
      g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      // Land (frei gezeichnete Kontinente, oben das Land, auf dem alles steht)
      const land = g.createLinearGradient(0, cy - r, 0, cy + r);
      land.addColorStop(0, l0);
      land.addColorStop(1, l1);
      g.fillStyle = land;
      const blob = (pts: [number, number][]) => {
        g.beginPath();
        const n = pts.length;
        for (let i = 0; i <= n; i++) {
          const a = pts[i % n]!;
          const b = pts[(i + 1) % n]!;
          const mx = cx + ((a[0] + b[0]) / 2) * r;
          const my = cy + ((a[1] + b[1]) / 2) * r;
          if (i === 0) g.moveTo(mx, my);
          else g.quadraticCurveTo(cx + a[0] * r, cy + a[1] * r, mx, my);
        }
        g.closePath();
        g.fill();
      };
      blob([
        [-0.55, -0.9],
        [-0.25, -1.12],
        [0.2, -1.12],
        [0.58, -0.9],
        [0.66, -0.62],
        [0.46, -0.5],
        [0.36, -0.28],
        [0.42, 0.02],
        [0.26, 0.34],
        [0.08, 0.5],
        [-0.04, 0.22],
        [-0.14, -0.12],
        [-0.36, -0.3],
        [-0.5, -0.56],
      ]);
      blob([
        [-1.02, -0.18],
        [-0.78, -0.08],
        [-0.66, 0.26],
        [-0.72, 0.62],
        [-0.92, 0.74],
        [-1.06, 0.4],
      ]);
      blob([
        [0.72, 0.36],
        [0.92, 0.3],
        [1.0, 0.52],
        [0.84, 0.66],
        [0.68, 0.56],
      ]);
      // Wolken auf der Kugel
      if (ballA > 0.01) {
        g.globalAlpha = 0.5 * ballA;
        g.strokeStyle = '#ffffff';
        g.lineCap = 'round';
        const swirls: [number, number, number, number, number][] = [
          [-0.3, 0.1, 0.5, 3.6, 4.6],
          [0.25, 0.55, 0.32, 3.3, 4.2],
          [0.5, -0.2, 0.4, 0.2, 1.1],
          [-0.55, 0.55, 0.3, 4.6, 5.6],
        ];
        for (const [u, w, rr, a0, a1] of swirls) {
          g.lineWidth = Math.max(1.5, r * 0.05);
          g.beginPath();
          g.arc(cx + u * r, cy + w * r, rr * r, a0, a1);
          g.stroke();
        }
        g.globalAlpha = 1;
      }
      // Tag und Nacht: rechts unten etwas dunkler
      const night = g.createRadialGradient(cx - r * 0.5, cy - r * 0.6, r * 0.3, cx - r * 0.2, cy - r * 0.2, r * 1.5);
      night.addColorStop(0, 'rgba(0,0,0,0)');
      night.addColorStop(1, `rgba(0,0,0,${(0.45 * ballA).toFixed(3)})`);
      g.fillStyle = night;
      g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
      g.restore();
      // Grasnarbe am Horizont (solange die Kugel noch fast flach ist)
      const flatA = 1 - smooth(4.6, 5.6, v.E);
      if (flatA > 0.01) {
        g.save();
        g.globalAlpha = flatA;
        g.strokeStyle = shade(l1, -0.15);
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(cx, cy, r, Math.PI, Math.PI * 2);
        g.stroke();
        g.restore();
      }
    }

    /** Kästchengitter: 10^f m (kräftig), feiner 10^(f−1) m und gröber 10^(f+1) m. */
    function drawGrid(v: ZView): void {
      const g = surface.g;
      const { S } = v;
      const theme = ctx.theme;
      const spaceA = smooth(3.5, 5.5, v.E);
      const lineCol = mixColor(theme.text, '#ffffff', spaceA * (theme.dark ? 0.3 : 0.75));
      for (let lvl = -1; lvl <= 1; lvl++) {
        const step = 10 ** (v.f + lvl);
        const sp = step * v.k;
        if (sp < 5) continue;
        const a = (lvl === -1 ? 0.07 * clamp((sp - 5) / 18, 0, 1) : lvl === 0 ? 0.16 : 0.24) * (theme.dark ? 1.3 : 1);
        g.strokeStyle = alpha(lineCol, a);
        g.lineWidth = lvl === 1 ? 1.3 : 1;
        g.beginPath();
        const x0 = v.cx + (S.x - v.ax) / v.k;
        const x1 = v.cx + (S.x + S.w - v.ax) / v.k;
        for (let i = Math.ceil(x0 / step); i <= Math.floor(x1 / step); i++) {
          if (lvl < 1 && i % 10 === 0) continue;
          const x = Math.round(sx(v, i * step)) + 0.5;
          g.moveTo(x, S.y);
          g.lineTo(x, S.y + S.h);
        }
        const yTop = (v.gy - S.y) / v.k;
        const yBot = (v.gy - S.y - S.h) / v.k;
        for (let i = Math.ceil(yBot / step); i <= Math.floor(yTop / step); i++) {
          if (lvl < 1 && i % 10 === 0) continue;
          const y = Math.round(sy(v, i * step)) + 0.5;
          g.moveTo(S.x, y);
          g.lineTo(S.x + S.w, y);
        }
        g.stroke();
      }
    }

    /* ---------- Objekte (maßstäblich gezeichnet) ---------- */
    function shadowEllipse(x: number, y: number, rx: number, ry: number): void {
      const g = surface.g;
      g.fillStyle = ctx.theme.dark ? 'rgba(0,0,0,0.35)' : 'rgba(20,30,20,0.18)';
      g.beginPath();
      g.ellipse(x, y, Math.max(0.5, rx), Math.max(0.3, ry), 0, 0, Math.PI * 2);
      g.fill();
    }

    function drawSand(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const r = 0.0005 * k;
      shadowEllipse(X, Y, r * 1.1, r * 0.22);
      const cy = Y - r * 0.86;
      g.beginPath();
      for (let i = 0; i <= 14; i++) {
        const t = (i / 14) * Math.PI * 2;
        const rr = r * (1 + 0.09 * Math.sin(3 * t + 0.7) + 0.06 * Math.cos(5 * t + 1.3));
        const px = X + Math.cos(t) * rr * 1.08;
        const py = cy + Math.sin(t) * rr * 0.86;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.closePath();
      const grad = g.createRadialGradient(X - r * 0.4, cy - r * 0.45, r * 0.08, X, cy, r * 1.15);
      grad.addColorStop(0, '#fbe9c2');
      grad.addColorStop(0.55, '#d9b073');
      grad.addColorStop(1, '#9d7442');
      g.fillStyle = grad;
      g.fill();
      if (r > 6) {
        g.fillStyle = 'rgba(110,75,35,0.35)';
        for (const [dx, dy, s] of [
          [0.3, 0.2, 0.07],
          [-0.2, 0.35, 0.05],
          [0.45, -0.25, 0.04],
          [-0.5, 0.05, 0.05],
        ] as const) {
          g.beginPath();
          g.arc(X + dx * r, cy + dy * r, s * r, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = 'rgba(255,255,255,0.45)';
        g.beginPath();
        g.ellipse(X - r * 0.38, cy - r * 0.42, r * 0.22, r * 0.12, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      return { x: X - r * 1.1, y: cy - r, w: r * 2.2, h: r * 1.9 };
    }

    function drawBug(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const Lb = 0.007 * k;
      shadowEllipse(X, Y, Lb * 0.5, Lb * 0.06);
      const legH = Lb * 0.07;
      const bx0 = X - Lb * 0.5;
      const bx1 = X + Lb * 0.28;
      const by = Y - legH;
      const bh = Lb * 0.42;
      // Beine
      g.strokeStyle = '#1c1c1c';
      g.lineWidth = Math.max(0.6, Lb * 0.025);
      g.lineCap = 'round';
      g.beginPath();
      for (const f of [-0.32, -0.08, 0.16]) {
        g.moveTo(X + f * Lb, by);
        g.lineTo(X + f * Lb - Lb * 0.05, Y);
      }
      g.stroke();
      // Kopf
      g.fillStyle = '#1d1d1f';
      g.beginPath();
      g.ellipse(X + Lb * 0.34, by - bh * 0.28, Lb * 0.14, Lb * 0.12, 0, 0, Math.PI * 2);
      g.fill();
      if (Lb > 40) {
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(X + Lb * 0.4, by - bh * 0.36, Lb * 0.025, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#1d1d1f';
        g.beginPath();
        g.moveTo(X + Lb * 0.42, by - bh * 0.5);
        g.quadraticCurveTo(X + Lb * 0.5, by - bh * 0.85, X + Lb * 0.56, by - bh * 0.8);
        g.stroke();
      }
      // Panzer (Kuppel)
      g.beginPath();
      g.moveTo(bx0, by);
      g.bezierCurveTo(bx0, by - bh * 1.3, bx1, by - bh * 1.3, bx1 + Lb * 0.04, by);
      g.closePath();
      const grad = g.createRadialGradient(X - Lb * 0.18, by - bh * 0.85, Lb * 0.03, X - Lb * 0.1, by - bh * 0.3, Lb * 0.5);
      grad.addColorStop(0, '#ff8a6b');
      grad.addColorStop(0.45, '#e2382a');
      grad.addColorStop(1, '#9d1610');
      g.fillStyle = grad;
      g.fill();
      if (Lb > 14) {
        g.fillStyle = '#1d1d1f';
        for (const [dx, dy, s] of [
          [-0.32, 0.45, 0.07],
          [-0.12, 0.72, 0.075],
          [0.08, 0.5, 0.065],
          [-0.18, 0.3, 0.05],
          [0.16, 0.25, 0.05],
        ] as const) {
          g.beginPath();
          g.ellipse(X + dx * Lb, by - dy * bh, s * Lb, s * Lb * 0.85, 0, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = 'rgba(255,255,255,0.5)';
        g.beginPath();
        g.ellipse(X - Lb * 0.22, by - bh * 0.78, Lb * 0.08, Lb * 0.035, -0.4, 0, Math.PI * 2);
        g.fill();
      }
      return { x: bx0, y: by - bh, w: Lb * 0.95, h: bh + legH };
    }

    function drawApple(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const R = 0.04 * k;
      shadowEllipse(X, Y, R * 0.8, R * 0.12);
      const cy = Y - R * 0.95;
      g.beginPath();
      g.moveTo(X, cy - 0.72 * R);
      g.bezierCurveTo(X + 0.35 * R, cy - 1.05 * R, X + 1.05 * R, cy - 0.85 * R, X + 1.0 * R, cy - 0.05 * R);
      g.bezierCurveTo(X + 0.98 * R, cy + 0.65 * R, X + 0.5 * R, cy + 0.98 * R, X + 0.18 * R, cy + 0.92 * R);
      g.bezierCurveTo(X + 0.07 * R, cy + 0.9 * R, X - 0.07 * R, cy + 0.9 * R, X - 0.18 * R, cy + 0.92 * R);
      g.bezierCurveTo(X - 0.5 * R, cy + 0.98 * R, X - 0.98 * R, cy + 0.65 * R, X - 1.0 * R, cy - 0.05 * R);
      g.bezierCurveTo(X - 1.05 * R, cy - 0.85 * R, X - 0.35 * R, cy - 1.05 * R, X, cy - 0.72 * R);
      g.closePath();
      const grad = g.createRadialGradient(X - R * 0.4, cy - R * 0.35, R * 0.05, X, cy, R * 1.1);
      grad.addColorStop(0, '#ff8a6a');
      grad.addColorStop(0.5, '#d33a26');
      grad.addColorStop(1, '#7e1510');
      g.fillStyle = grad;
      g.fill();
      if (R > 5) {
        g.fillStyle = 'rgba(255,255,255,0.4)';
        g.beginPath();
        g.ellipse(X - R * 0.45, cy - R * 0.3, R * 0.14, R * 0.26, 0.4, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#6b4423';
        g.lineWidth = Math.max(1, R * 0.07);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(X, cy - 0.68 * R);
        g.quadraticCurveTo(X + 0.02 * R, cy - 1.0 * R, X + 0.12 * R, cy - 1.2 * R);
        g.stroke();
        g.fillStyle = '#5aa13c';
        g.beginPath();
        g.ellipse(X + 0.36 * R, cy - 1.05 * R, R * 0.26, R * 0.11, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      return { x: X - R, y: cy - 1.2 * R, w: 2 * R, h: 2.15 * R };
    }

    function drawChild(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const H = 1.4 * k;
      shadowEllipse(X, Y, H * 0.16, H * 0.025);
      const skin = '#f0c29d';
      const lw = H * 0.075;
      // Beine
      g.fillStyle = '#3e4f7d';
      roundRect(g, X - lw - H * 0.01, Y - H * 0.47, lw, H * 0.46, lw * 0.4);
      g.fill();
      roundRect(g, X + H * 0.01, Y - H * 0.47, lw, H * 0.46, lw * 0.4);
      g.fill();
      // Schuhe
      g.fillStyle = '#2a2a2e';
      g.beginPath();
      g.ellipse(X - lw * 0.55 - H * 0.01, Y - H * 0.012, lw * 0.75, H * 0.022, 0, 0, Math.PI * 2);
      g.ellipse(X + lw * 0.55 + H * 0.01, Y - H * 0.012, lw * 0.75, H * 0.022, 0, 0, Math.PI * 2);
      g.fill();
      // Arme
      g.strokeStyle = skin;
      g.lineCap = 'round';
      g.lineWidth = H * 0.05;
      g.beginPath();
      g.moveTo(X - H * 0.12, Y - H * 0.76);
      g.lineTo(X - H * 0.17, Y - H * 0.52);
      g.moveTo(X + H * 0.12, Y - H * 0.76);
      g.lineTo(X + H * 0.2, Y - H * 0.55);
      g.stroke();
      // T-Shirt
      const shirt = ctx.theme.series[2]!;
      const sg = g.createLinearGradient(X - H * 0.13, 0, X + H * 0.13, 0);
      sg.addColorStop(0, shade(shirt, 0.15));
      sg.addColorStop(1, shade(shirt, -0.2));
      g.fillStyle = sg;
      g.beginPath();
      g.moveTo(X - H * 0.12, Y - H * 0.8);
      g.lineTo(X + H * 0.12, Y - H * 0.8);
      g.lineTo(X + H * 0.17, Y - H * 0.69);
      g.lineTo(X + H * 0.13, Y - H * 0.66);
      g.lineTo(X + H * 0.12, Y - H * 0.46);
      g.lineTo(X - H * 0.12, Y - H * 0.46);
      g.lineTo(X - H * 0.13, Y - H * 0.66);
      g.lineTo(X - H * 0.17, Y - H * 0.69);
      g.closePath();
      g.fill();
      // Kopf und Haare
      const hy = Y - H * 0.885;
      const hr = H * 0.088;
      g.fillStyle = skin;
      g.beginPath();
      g.arc(X, hy, hr, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#6a4325';
      g.beginPath();
      g.arc(X, hy - hr * 0.1, hr * 1.04, Math.PI * 1.02, Math.PI * 1.98);
      g.quadraticCurveTo(X + hr * 0.4, hy - hr * 0.55, X - hr * 0.3, hy - hr * 0.45);
      g.closePath();
      g.fill();
      if (H > 70) {
        g.fillStyle = '#2a2a2e';
        g.beginPath();
        g.arc(X - hr * 0.35, hy + hr * 0.05, hr * 0.09, 0, Math.PI * 2);
        g.arc(X + hr * 0.35, hy + hr * 0.05, hr * 0.09, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = '#a1533b';
        g.lineWidth = Math.max(1, hr * 0.1);
        g.beginPath();
        g.arc(X, hy + hr * 0.25, hr * 0.32, 0.25 * Math.PI, 0.75 * Math.PI);
        g.stroke();
      }
      return { x: X - H * 0.18, y: Y - H, w: H * 0.36, h: H };
    }

    function drawHouse(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const H = 10 * k;
      const W = 9 * k;
      const wallH = H * 0.58;
      const dark = ctx.theme.dark;
      shadowEllipse(X, Y, W * 0.6, H * 0.02);
      // Schornstein
      g.fillStyle = dark ? '#7b4a3c' : '#9c5a46';
      g.fillRect(X + W * 0.22, Y - H * 0.98, W * 0.1, H * 0.25);
      // Wand
      const wall = g.createLinearGradient(X - W / 2, 0, X + W / 2, 0);
      wall.addColorStop(0, dark ? '#d8ccb6' : '#fbf1de');
      wall.addColorStop(1, dark ? '#b3a68f' : '#e5d5b8');
      g.fillStyle = wall;
      g.fillRect(X - W / 2, Y - wallH, W, wallH);
      // Dach
      const roof = g.createLinearGradient(0, Y - H, 0, Y - wallH);
      roof.addColorStop(0, dark ? '#a8473a' : '#d1583f');
      roof.addColorStop(1, dark ? '#7c2e25' : '#9d3627');
      g.fillStyle = roof;
      g.beginPath();
      g.moveTo(X - W * 0.58, Y - wallH + H * 0.005);
      g.lineTo(X, Y - H);
      g.lineTo(X + W * 0.58, Y - wallH + H * 0.005);
      g.closePath();
      g.fill();
      if (H > 30) {
        g.strokeStyle = 'rgba(0,0,0,0.12)';
        g.lineWidth = 1;
        g.beginPath();
        for (let i = 1; i < 4; i++) {
          const t = i / 4;
          const y = Y - H + t * (H - wallH);
          g.moveTo(X - t * W * 0.58, y);
          g.lineTo(X + t * W * 0.58, y);
        }
        g.stroke();
      }
      // Fenster und Tür
      const win = (x: number, y: number, w: number, h: number) => {
        const glass = g.createLinearGradient(0, y, 0, y + h);
        glass.addColorStop(0, dark ? '#7fb0d8' : '#bfe0f7');
        glass.addColorStop(1, dark ? '#355a7f' : '#6ea6d3');
        g.fillStyle = '#ffffff';
        g.fillRect(x - w * 0.08, y - w * 0.08, w * 1.16, h + w * 0.16);
        g.fillStyle = glass;
        g.fillRect(x, y, w, h);
        if (w > 8) {
          g.strokeStyle = '#ffffff';
          g.lineWidth = Math.max(1, w * 0.07);
          g.beginPath();
          g.moveTo(x + w / 2, y);
          g.lineTo(x + w / 2, y + h);
          g.moveTo(x, y + h / 2);
          g.lineTo(x + w, y + h / 2);
          g.stroke();
        }
      };
      if (H > 12) {
        win(X - W * 0.38, Y - wallH * 0.86, W * 0.18, wallH * 0.24);
        win(X + W * 0.2, Y - wallH * 0.86, W * 0.18, wallH * 0.24);
        win(X - W * 0.38, Y - wallH * 0.44, W * 0.18, wallH * 0.24);
        win(X - W * 0.07, Y - H * 0.82, W * 0.14, H * 0.1);
        g.fillStyle = dark ? '#6d4a32' : '#8a5a3a';
        roundRect(g, X + W * 0.16, Y - wallH * 0.5, W * 0.2, wallH * 0.5, Math.min(4, W * 0.04));
        g.fill();
      }
      return { x: X - W * 0.58, y: Y - H, w: W * 1.16, h: H };
    }

    function drawField(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const Lf = 105 * k;
      const D = 0.2 * Lf;
      const far = Y + D * 0.12;
      const near = Y + D * 1.12;
      const inset = Lf * 0.06;
      const dark = ctx.theme.dark;
      const at = (u: number, w: number) => {
        // u ∈ [0, 1] entlang, w ∈ [0, 1] von hinten nach vorn
        const half = Lf / 2 - inset * (1 - w);
        return [X - half + u * 2 * half, lerp(far, near, w)] as const;
      };
      const quad = (u0: number, u1: number, w0: number, w1: number) => {
        const a = at(u0, w0);
        const b = at(u1, w0);
        const c = at(u1, w1);
        const d = at(u0, w1);
        g.beginPath();
        g.moveTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.lineTo(c[0], c[1]);
        g.lineTo(d[0], d[1]);
        g.closePath();
      };
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      quad(0, 1, 0, 1);
      g.fillStyle = dark ? '#2f6b34' : '#4ea24f';
      g.fill();
      g.restore();
      for (let i = 0; i < 12; i += 2) {
        quad(i / 12, (i + 1) / 12, 0, 1);
        g.fillStyle = dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.12)';
        g.fill();
      }
      if (Lf > 40) {
        g.strokeStyle = 'rgba(255,255,255,0.85)';
        g.lineWidth = Math.max(1, Lf * 0.004);
        const m = 0.04;
        quad(m, 1 - m, 0.08, 0.92);
        g.stroke();
        const c0 = at(0.5, 0.08);
        const c1 = at(0.5, 0.92);
        g.beginPath();
        g.moveTo(c0[0], c0[1]);
        g.lineTo(c1[0], c1[1]);
        g.stroke();
        const mid = at(0.5, 0.5);
        g.beginPath();
        g.ellipse(mid[0], mid[1], Lf * 0.087, D * 0.13, 0, 0, Math.PI * 2);
        g.stroke();
        quad(m, m + 0.157, 0.24, 0.76);
        g.stroke();
        quad(1 - m - 0.157, 1 - m, 0.24, 0.76);
        g.stroke();
        // Tore
        for (const u of [m, 1 - m]) {
          const b0 = at(u, 0.44);
          const b1 = at(u, 0.56);
          const h = 2.44 * k;
          g.strokeStyle = '#ffffff';
          g.lineWidth = Math.max(1, Lf * 0.005);
          g.beginPath();
          g.moveTo(b0[0], b0[1]);
          g.lineTo(b0[0], b0[1] - h);
          g.lineTo(b1[0], b1[1] - h);
          g.lineTo(b1[0], b1[1]);
          g.stroke();
        }
      }
      return { x: X - Lf / 2, y: far - 4, w: Lf, h: near - far + 4 };
    }

    function drawPeak(X: number, Y: number, k: number): Rect {
      const g = surface.g;
      const H = 2962 * k;
      const W = 6000 * k;
      const dark = ctx.theme.dark;
      const ridge: [number, number][] = [
        [-0.5, 0],
        [-0.38, 0.16],
        [-0.3, 0.3],
        [-0.22, 0.28],
        [-0.13, 0.5],
        [-0.07, 0.6],
        [-0.025, 0.85],
        [0, 1],
        [0.035, 0.92],
        [0.08, 0.95],
        [0.14, 0.77],
        [0.22, 0.65],
        [0.3, 0.47],
        [0.36, 0.42],
        [0.44, 0.19],
        [0.5, 0],
      ];
      const P = (q: [number, number]) => [X + q[0] * W, Y - q[1] * H] as const;
      g.beginPath();
      ridge.forEach((q, i) => {
        const [x, y] = P(q);
        if (i === 0) g.moveTo(x, y);
        else g.lineTo(x, y);
      });
      g.closePath();
      const rock = g.createLinearGradient(X - W / 2, 0, X + W / 2, 0);
      rock.addColorStop(0, dark ? '#7d8796' : '#a3abb8');
      rock.addColorStop(0.5, dark ? '#646d7b' : '#8a93a1');
      rock.addColorStop(1, dark ? '#434a56' : '#636b78');
      g.fillStyle = rock;
      g.fill();
      // Schattenseite
      g.fillStyle = 'rgba(0,0,0,0.14)';
      g.beginPath();
      g.moveTo(...P([0, 1]));
      g.lineTo(...P([0.035, 0.92]));
      g.lineTo(...P([0.08, 0.95]));
      g.lineTo(...P([0.14, 0.77]));
      g.lineTo(...P([0.22, 0.65]));
      g.lineTo(...P([0.3, 0.47]));
      g.lineTo(...P([0.36, 0.42]));
      g.lineTo(...P([0.44, 0.19]));
      g.lineTo(...P([0.5, 0]));
      g.lineTo(...P([0.1, 0]));
      g.closePath();
      g.fill();
      // Schnee
      g.fillStyle = dark ? '#dfe7f0' : '#f8fbff';
      g.beginPath();
      g.moveTo(...P([-0.07, 0.6]));
      g.lineTo(...P([-0.025, 0.85]));
      g.lineTo(...P([0, 1]));
      g.lineTo(...P([0.035, 0.92]));
      g.lineTo(...P([0.08, 0.95]));
      g.lineTo(...P([0.14, 0.77]));
      g.lineTo(...P([0.11, 0.72]));
      g.lineTo(...P([0.07, 0.8]));
      g.lineTo(...P([0.03, 0.7]));
      g.lineTo(...P([-0.02, 0.76]));
      g.lineTo(...P([-0.05, 0.63]));
      g.closePath();
      g.fill();
      if (H > 140) {
        const [tx, ty] = P([0, 1]);
        g.strokeStyle = dark ? '#e7c66a' : '#b8902c';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(tx, ty);
        g.lineTo(tx, ty - 12);
        g.moveTo(tx - 4, ty - 8.5);
        g.lineTo(tx + 4, ty - 8.5);
        g.stroke();
      }
      return { x: X - W / 2, y: Y - H, w: W, h: H };
    }

    function drawPlane(cx: number, cy: number, s: number): Rect {
      const g = surface.g;
      const w = 40 * s;
      // Kondensstreifen
      const trail = g.createLinearGradient(cx - w * 4, 0, cx - w * 0.4, 0);
      trail.addColorStop(0, 'rgba(255,255,255,0)');
      trail.addColorStop(1, ctx.theme.dark ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.95)');
      g.strokeStyle = trail;
      g.lineWidth = 3 * s;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - w * 4, cy + w * 0.02);
      g.lineTo(cx - w * 0.4, cy + w * 0.02);
      g.stroke();
      const body = ctx.theme.dark ? '#d9dee6' : '#ffffff';
      const edge = ctx.theme.dark ? '#7d8796' : '#7b8494';
      g.fillStyle = body;
      g.strokeStyle = edge;
      g.lineWidth = 1;
      // Flügel
      g.beginPath();
      g.moveTo(cx - w * 0.05, cy);
      g.lineTo(cx - w * 0.28, cy + w * 0.3);
      g.lineTo(cx - w * 0.16, cy + w * 0.3);
      g.lineTo(cx + w * 0.15, cy);
      g.closePath();
      g.fill();
      g.stroke();
      // Rumpf
      g.beginPath();
      g.ellipse(cx, cy, w * 0.5, w * 0.075, 0, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      // Leitwerk
      g.beginPath();
      g.moveTo(cx - w * 0.36, cy - w * 0.04);
      g.lineTo(cx - w * 0.48, cy - w * 0.26);
      g.lineTo(cx - w * 0.4, cy - w * 0.26);
      g.lineTo(cx - w * 0.22, cy - w * 0.05);
      g.closePath();
      g.fill();
      g.stroke();
      g.fillStyle = ctx.theme.series[0]!;
      g.fillRect(cx - w * 0.3, cy - w * 0.012, w * 0.6, w * 0.025);
      return { x: cx - w * 0.55, y: cy - w * 0.3, w: w * 1.1, h: w * 0.62 };
    }

    function drawISS(cx: number, cy: number, s: number): Rect {
      const g = surface.g;
      const w = 46 * s;
      const panel = ctx.theme.dark ? '#3e5f9c' : '#2d5aa6';
      g.strokeStyle = ctx.theme.dark ? '#cfd6e0' : '#9aa3b2';
      g.lineWidth = Math.max(1, 2 * s);
      g.beginPath();
      g.moveTo(cx - w * 0.5, cy);
      g.lineTo(cx + w * 0.5, cy);
      g.stroke();
      for (const dx of [-0.42, -0.26, 0.26, 0.42]) {
        const x = cx + dx * w;
        const grad = g.createLinearGradient(0, cy - w * 0.3, 0, cy + w * 0.3);
        grad.addColorStop(0, shade(panel, 0.25));
        grad.addColorStop(1, shade(panel, -0.2));
        g.fillStyle = grad;
        g.fillRect(x - w * 0.06, cy - w * 0.32, w * 0.12, w * 0.26);
        g.fillRect(x - w * 0.06, cy + w * 0.06, w * 0.12, w * 0.26);
      }
      g.fillStyle = ctx.theme.dark ? '#e5e9ef' : '#f4f6f9';
      g.strokeStyle = ctx.theme.dark ? '#8790a0' : '#8a93a3';
      g.lineWidth = 1;
      roundRect(g, cx - w * 0.12, cy - w * 0.06, w * 0.24, w * 0.12, w * 0.04);
      g.fill();
      g.stroke();
      return { x: cx - w * 0.5, y: cy - w * 0.34, w, h: w * 0.68 };
    }

    /** Maßpfeil (ohne Zahl): zeigt, was gemessen wird. */
    function dimArrow(x0: number, y0: number, x1: number, y1: number, color: string, a: number): void {
      const g = surface.g;
      if (a < 0.02) return;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 14) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      g.save();
      g.globalAlpha = a;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(x0 + ux * 6, y0 + uy * 6);
      g.lineTo(x1 - ux * 6, y1 - uy * 6);
      g.stroke();
      for (const [px, py, d] of [
        [x0, y0, 1],
        [x1, y1, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px + d * ux * 9 - uy * 4.5, py + d * uy * 9 + ux * 4.5);
        g.lineTo(px + d * ux * 9 + uy * 4.5, py + d * uy * 9 - ux * 4.5);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(px - uy * 7, py + ux * 7);
        g.lineTo(px + uy * 7, py - ux * 7);
        g.stroke();
      }
      g.restore();
    }

    function sizeText(o: SizeObject): string {
      if (!p.show) return '?';
      const t = OBJ_TEXT[o.id];
      const base = o.id === 'field' ? '105 m' : o.id === 'peak' ? `${gd(2962)} m` : o.id === 'earth' ? `${gd(12742)} km` : lengthText(o.size, lang);
      return `${t.approx ? '≈ ' : ''}${base}`;
    }

    /** Größe als a · 10ⁿ m (Text mit hochgestellter Hochzahl). */
    function sciSizeText(o: SizeObject): string {
      const s = approxScientific(o.size, 3);
      const m = s.mantissa === 1 ? '' : `${formatNumber(s.mantissa, lang, { decimals: 2 })} · `;
      return `${m}10${sup(s.exponent)} m`;
    }

    function objLabel(v: ZView, o: SizeObject, x: number, y: number, a0: number, hot: boolean): void {
      // halb ausgeblendete Schilder wirken wie Schatten – lieber schneller ausblenden
      const a = a0 * a0;
      if (a < 0.03) return;
      const theme = ctx.theme;
      const name = T(OBJ_TEXT[o.id].name);
      const size = sizeText(o);
      const small = v.S.w < 420;
      const fN = font(800, small ? 12 : 13);
      const fS = font(650, small ? 11.5 : 12);
      const w = Math.max(measure(name, fN), measure(size, fS)) + 20;
      const h = 38;
      const bx = clamp(x - w / 2, v.S.x + 6, v.S.x + v.S.w - w - 6);
      const by = clamp(y - h, v.S.y + 6, v.S.y + v.S.h - h - 6);
      const g = surface.g;
      g.save();
      g.globalAlpha = a;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.18)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      roundRect(g, bx, by, w, h, 10);
      g.fillStyle = alpha(cardBg(), 0.94);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = hot ? accent() : alpha(theme.text, 0.12);
      g.lineWidth = hot ? 2 : 1;
      g.stroke();
      text(g, name, bx + w / 2, by + 13, { font: fN, color: theme.text });
      text(g, size, bx + w / 2, by + 27, { font: fS, color: shade(accent(), theme.dark ? 0.15 : -0.25) });
      g.restore();
    }

    function drawObjects(v: ZView): void {
      const { S, E, k } = v;
      const g = surface.g;
      const near = nearestObject(E);
      const groundY = v.gy;
      const theme = ctx.theme;
      const dimCol = shade(accent(), theme.dark ? 0.1 : -0.15);
      for (let i = 0; i < OBJECTS.length; i++) {
        const o = OBJECTS[i]!;
        if (o.kind !== 'ground') continue;
        const X = sx(v, o.x);
        const px = o.size * k;
        if (px < 0.7 || px > S.w * 40) continue;
        const halfW: Record<string, number> = { sand: 0.6, bug: 0.55, apple: 0.55, child: 0.2, house: 0.6, field: 0.5, peak: 1.02 };
        const half = (halfW[o.id] ?? 0.6) * o.size * k;
        if (X + half < S.x - 4 || X - half > S.x + S.w + 4) continue;
        let r: Rect;
        if (o.id === 'sand') r = drawSand(X, groundY, k);
        else if (o.id === 'bug') r = drawBug(X, groundY, k);
        else if (o.id === 'apple') r = drawApple(X, groundY, k);
        else if (o.id === 'child') r = drawChild(X, groundY, k);
        else if (o.id === 'house') r = drawHouse(X, groundY, k);
        else if (o.id === 'field') r = drawField(X, groundY, k);
        else r = drawPeak(X, groundY, k);
        const fa = focusOf(o, E);
        const hot = hover === `obj:${i}`;
        // Maßpfeil am Objekt im Blick
        if (i === near && px > 30) {
          const da = clamp(1.2 - Math.abs(objectExp(o) - E) * 1.6, 0, 1);
          if (o.id === 'field') dimArrow(r.x, r.y + r.h + 10, r.x + r.w, r.y + r.h + 10, dimCol, da);
          else if (o.id === 'bug') dimArrow(r.x, groundY + 10, r.x + r.w, groundY + 10, dimCol, da);
          else if (o.id === 'sand' || o.id === 'apple') dimArrow(r.x, groundY + 10, r.x + r.w, groundY + 10, dimCol, da);
          else dimArrow(r.x - 10, groundY, r.x - 10, groundY - px, dimCol, da);
        }
        const labelY = o.id === 'field' ? r.y - 8 : Math.min(r.y, groundY - px) - 8;
        // Beschriftung nur, wenn das Objekt wirklich im Bild ist (nicht an den Rand geklemmt)
        const lx = r.x + r.w / 2;
        if (lx > S.x + 10 && lx < S.x + S.w - 10) objLabel(v, o, lx, labelY, fa * sceneA(), hot);
        const pad = Math.max(0, (26 - Math.min(r.w, r.h)) / 2);
        addHit(`obj:${i}`, { x: r.x - pad, y: r.y - pad, w: r.w + 2 * pad, h: r.h + 2 * pad });
      }
      // Himmelsobjekte
      const plane = OBJECTS.find((o) => o.id === 'plane')!;
      const space = OBJECTS.find((o) => o.id === 'space')!;
      const iss = OBJECTS.find((o) => o.id === 'iss')!;
      const earth = OBJECTS.find((o) => o.id === 'earth')!;
      const groundAt = (x: number) => {
        const dx = x - earth.x;
        return Math.sqrt(Math.max(0, EARTH_RADIUS ** 2 - dx * dx)) - EARTH_RADIUS;
      };
      // Grenze zum Weltraum
      {
        const y = sy(v, space.size);
        const pa = clamp((space.size * k - 25) / 40, 0, 1) * (1 - smooth(6.3, 6.9, E));
        if (pa > 0.01 && y > S.y + 4 && y < S.y + S.h - 4) {
          g.save();
          g.globalAlpha = pa;
          g.setLineDash([7, 6]);
          g.strokeStyle = alpha('#ffffff', theme.dark ? 0.5 : 0.75);
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(S.x, y);
          g.lineTo(S.x + S.w, y);
          g.stroke();
          g.restore();
          const fa = focusOf(space, E);
          const X = S.x + Math.min(S.w * 0.24, 120);
          objLabel(v, space, X, y - 8, fa * pa, hover === `obj:${OBJECTS.indexOf(space)}`);
          addHit(`obj:${OBJECTS.indexOf(space)}`, { x: S.x, y: y - 12, w: S.w, h: 24 });
          if (OBJECTS[near] === space) {
            const ax = S.x + S.w * 0.56;
            dimArrow(ax, sy(v, groundAt(cameraX(E))), ax, y, dimCol, clamp(1.2 - Math.abs(objectExp(space) - E) * 1.6, 0, 1));
          }
        }
      }
      for (const o of [plane, iss]) {
        const alt = o.size;
        const pxAlt = alt * k;
        const pa = o.id === 'plane' ? clamp((pxAlt - 28) / 40, 0, 1) * (1 - smooth(5.6, 6.2, E)) : clamp((pxAlt - 4) / 16, 0, 1);
        if (pa < 0.01) continue;
        const X = sx(v, o.x);
        const Y = sy(v, alt);
        if (X < S.x - 60 || X > S.x + S.w + 60 || Y < S.y - 40) continue;
        const sc = o.id === 'iss' ? clamp(1.25 - smooth(6, 7, E) * 0.6, 0.6, 1.25) : 1;
        const gyx = sy(v, groundAt(o.x));
        const fa = focusOf(o, E);
        g.save();
        g.globalAlpha = pa;
        g.setLineDash([4, 5]);
        g.strokeStyle = alpha(theme.dark ? '#ffffff' : theme.text, 0.35 + 0.35 * fa);
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(X, Y + 8);
        g.lineTo(X, gyx);
        g.stroke();
        g.setLineDash([]);
        const r = o.id === 'plane' ? drawPlane(X, Y, sc) : drawISS(X, Y, sc);
        g.restore();
        if (OBJECTS[near] === o) dimArrow(X + 26, gyx, X + 26, Y, dimCol, clamp(1.2 - Math.abs(objectExp(o) - E) * 1.6, 0, 1) * pa);
        objLabel(v, o, X, r.y - 6, fa * pa, hover === `obj:${OBJECTS.indexOf(o)}`);
        addHit(`obj:${OBJECTS.indexOf(o)}`, { x: r.x - 6, y: r.y - 6, w: r.w + 12, h: r.h + 12 });
      }
      // die Erde
      const ea = smooth(6.2, 6.8, E);
      if (ea > 0.01) {
        const r = EARTH_RADIUS * k;
        const cx = sx(v, earth.x);
        const cy = v.gy + r;
        if (cy < S.y + S.h - 20) {
          dimArrow(cx - r, cy, cx + r, cy, '#ffffff', ea * 0.9);
          objLabel(v, earth, cx, cy - 10, ea * focusOf(earth, E), hover === `obj:${OBJECTS.indexOf(earth)}`);
        }
        addHit(`obj:${OBJECTS.indexOf(earth)}`, { x: cx - r, y: cy - r, w: 2 * r, h: 2 * r });
      }
    }

    /** Maßstabsleiste „1 Kästchen = …“ oben links in der Bühne. */
    function drawScaleBar(v: ZView): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { S } = v;
      const sp = 10 ** v.f * v.k;
      const pl = powerLength(v.f);
      const value = `${pl.value >= 1000 ? gd(pl.value) : formatNumber(pl.value, lang)} ${pl.unit}`;
      const small = S.w < 420;
      const label = `1 ${tt('Kästchen', 'square')} = ${value}`;
      const fL = font(800, small ? 12 : 13);
      const lw = measure(label, fL);
      const w = Math.max(lw + 24, sp + 24);
      const h = small ? 46 : 50;
      const x = S.x + 10;
      const y = S.y + 10;
      g.save();
      g.globalAlpha = sceneA();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      roundRect(g, x, y, w, h, 12);
      g.fillStyle = alpha(cardBg(), 0.93);
      g.fill();
      g.shadowColor = 'transparent';
      text(g, label, x + 12, y + 15, { font: fL, color: theme.text, align: 'left' });
      // Leiste: ein Kästchen lang, unterteilt in Zehntel, wenn genug Platz ist
      const by = y + h - 15;
      const bx = x + 12;
      g.fillStyle = alpha(theme.text, 0.12);
      g.fillRect(bx, by - 3, sp, 6);
      const parts = sp >= 70 ? 10 : sp >= 30 ? 2 : 1;
      for (let i = 0; i < parts; i += 2) {
        g.fillStyle = accent();
        g.fillRect(bx + (i * sp) / parts, by - 3, sp / parts, 6);
      }
      g.strokeStyle = theme.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(bx, by - 6);
      g.lineTo(bx, by + 6);
      g.moveTo(bx + sp, by - 6);
      g.lineTo(bx + sp, by + 6);
      g.stroke();
      g.restore();
    }

    /** Logarithmischer Größenstrahl unten: 10⁻³ … 10⁷ m mit Objekten. */
    function drawStrip(v: ZView): void {
      const g = surface.g;
      const theme = ctx.theme;
      const R = v.strip;
      const small = R.w < 420;
      const x0 = R.x + (small ? 18 : 24);
      const x1 = R.x + R.w - (small ? 18 : 24);
      const xe = (e: number) => x0 + ((e - E_MIN) / (E_MAX - E_MIN)) * (x1 - x0);
      const ay = R.y + 30;
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.fillStyle = alpha(theme.text, theme.dark ? 0.05 : 0.035);
      g.fill();
      // Fenster: aktuelle Größenordnung
      const E = v.E;
      const wx0 = xe(clamp(E - 0.5, E_MIN - 0.3, E_MAX + 0.3));
      const wx1 = xe(clamp(E + 0.5, E_MIN - 0.3, E_MAX + 0.3));
      roundRect(g, wx0, R.y + 6, wx1 - wx0, R.h - 12, 9);
      g.fillStyle = alpha(accent(), theme.dark ? 0.16 : 0.12);
      g.fill();
      // Achse
      g.strokeStyle = theme.axis;
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0 - 6, ay);
      g.lineTo(x1 + 6, ay);
      g.stroke();
      const fU = font(600, 11);
      const units: Record<number, string> = { [-3]: '1 mm', [-2]: '1 cm', 0: '1 m', 3: '1 km', 6: `${gd(1000)} km` };
      for (let e = E_MIN; e <= E_MAX; e++) {
        const x = xe(e);
        const cur = Math.abs(e - E) < 0.5;
        g.strokeStyle = theme.axis;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x, ay - 5);
        g.lineTo(x, ay + 5);
        g.stroke();
        powText('10', expText(e), x, ay + 17, 11.5, cur ? theme.text : theme.muted, cur ? shade(accent(), theme.dark ? 0.1 : -0.2) : theme.muted, 'center');
        const u = units[e];
        if (u) text(g, u, x, ay + 33, { font: fU, color: alpha(theme.muted, 0.9) });
      }
      // Objekte als Punkte
      const near = nearestObject(E);
      OBJECTS.forEach((o, i) => {
        const x = xe(Math.min(objectExp(o), E_MAX + 0.1));
        const isNear = i === near;
        const col = theme.series[i % 6]!;
        const r = isNear ? 6 : 4.2;
        g.save();
        g.shadowColor = alpha(col, 0.45);
        g.shadowBlur = isNear ? 6 : 0;
        g.fillStyle = col;
        g.beginPath();
        g.arc(x, ay - 14, r, 0, Math.PI * 2);
        g.fill();
        g.restore();
        if (isNear) {
          g.strokeStyle = theme.text;
          g.lineWidth = 1.5;
          g.beginPath();
          g.arc(x, ay - 14, r + 2.5, 0, Math.PI * 2);
          g.stroke();
        }
        addHit(`dot:${i}`, { x: x - 9, y: ay - 26, w: 18, h: 22 });
      });
      // Regler-Knopf
      const kx = xe(E);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      g.fillStyle = accent();
      g.beginPath();
      g.arc(kx, ay, 7.5, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = cardBg();
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(kx, ay, 7.5, 0, Math.PI * 2);
      g.stroke();
      addHit('strip', { x: R.x, y: R.y, w: R.w, h: R.h });
      // Dots über dem Streifen behalten Vorrang
      const dots = hits.filter((h) => h.id.startsWith('dot:'));
      hits = hits.filter((h) => !h.id.startsWith('dot:'));
      hits.push(...dots);
    }

    function stripE(px: number): number {
      if (!geo) return p.e;
      const v = zview(geo);
      const R = v.strip;
      const small = R.w < 420;
      const x0 = R.x + (small ? 18 : 24);
      const x1 = R.x + R.w - (small ? 18 : 24);
      let e = E_MIN + ((px - x0) / (x1 - x0)) * (E_MAX - E_MIN);
      const k = Math.round(e);
      if (Math.abs(e - k) < 0.12) e = k;
      return clamp(e, E_MIN, E_MAX);
    }

    function drawZoom(gm: Geo): void {
      const g = surface.g;
      const v = zview(gm);
      card(gm.C);
      g.save();
      roundRect(g, v.S.x, v.S.y, v.S.w, v.S.h, 12);
      g.clip();
      drawSky(v);
      drawClouds(v);
      drawGround(v);
      drawGrid(v);
      drawObjects(v);
      drawScaleBar(v);
      g.restore();
      // Rahmen der Bühne
      roundRect(g, v.S.x, v.S.y, v.S.w, v.S.h, 12);
      g.strokeStyle = alpha(ctx.theme.text, 0.1);
      g.lineWidth = 1;
      g.stroke();
      addHit('scene', v.S);
      // Objekte über der Bühne behalten Vorrang
      const objs = hits.filter((h) => h.id.startsWith('obj:'));
      hits = hits.filter((h) => !h.id.startsWith('obj:'));
      hits.push(...objs);
      drawStrip(v);
      drawZoomPanel(gm, v);
    }

    function conversions(f: number): string[] {
      const main = powerLength(f).unit;
      const units: LengthUnit[] = ['mm', 'cm', 'm', 'km'];
      // je eine kleinere und eine größere Nachbareinheit
      const i = units.indexOf(main);
      return [units[i - 1], units[i + 1]]
        .filter((u): u is LengthUnit => !!u)
        .map((u) => ({ u, k: f - UNIT_EXP[u] }))
        .filter((c) => c.k >= -3 && c.k <= 7)
        .map((c) => `${dec(c.k)} ${c.u}`);
    }

    function drawZoomPanel(gm: Geo, v: ZView): void {
      const R = gm.panel;
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 16);
      g.clip();
      g.globalAlpha = sceneA();
      const f = v.f;
      const pl = powerLength(f);
      const val = `= ${pl.value >= 1000 ? gd(pl.value) : formatNumber(pl.value, lang)} ${pl.unit}`;
      const o = OBJECTS[nearestObject(v.E)]!;
      const ot = OBJ_TEXT[o.id];
      const expCol = shade(accent(), theme.dark ? 0.1 : -0.15);
      if (gm.wide) {
        const x0 = R.x + 16;
        const w = R.w - 32;
        let y = R.y + 24;
        text(g, tt('1 Kästchen entspricht', '1 square stands for'), x0, y, { font: font(650, 12.5), color: theme.muted, align: 'left' });
        y += 38;
        const big = clamp(R.w * 0.17, 34, 46);
        const pw = powText('10', expText(f), x0, y, big, theme.text, expCol, 'left');
        text(g, ' m', x0 + pw + 2, y, { font: font(800, big * 0.62), color: theme.text, align: 'left' });
        y += big * 0.75 + 4;
        text(g, val, x0, y, { font: font(800, 18), color: theme.text, align: 'left' });
        y += 22;
        text(g, T(METER_NAMES[f] ?? L('', '')), x0, y, { font: font(600, 12.5), color: theme.muted, align: 'left' });
        y += 18;
        const conv = conversions(f);
        if (conv.length) text(g, `= ${conv.join(' = ')}`, x0, y, { font: font(650, 12.5), color: theme.muted, align: 'left' });
        y += 20;
        g.strokeStyle = alpha(theme.text, 0.08);
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x0 + w, y);
        g.stroke();
        y += 22;
        // Objekt im Blick
        text(g, tt('Im Blick', 'In view'), x0, y, { font: font(650, 12), color: theme.muted, align: 'left' });
        y += 22;
        const col = theme.series[OBJECTS.indexOf(o) % 6]!;
        g.fillStyle = col;
        g.beginPath();
        g.arc(x0 + 5, y, 5, 0, Math.PI * 2);
        g.fill();
        text(g, T(ot.name), x0 + 16, y, { font: font(800, 15), color: theme.text, align: 'left' });
        y += 21;
        text(g, `${T(ot.what)}: ${sizeText(o)}`, x0, y, { font: font(700, 13), color: expCol, align: 'left' });
        y += 18;
        if (p.show) text(g, `≈ ${sciSizeText(o)}`, x0, y, { font: font(650, 12.5), color: theme.muted, align: 'left' });
        y += 22;
        const rows = wrap(T(ot.fact), w, font(550, 12.5));
        const tipTop = R.h > 420 ? R.y + R.h - 86 : R.y + R.h - 4;
        for (const r of rows) {
          if (y > tipTop - 8) break;
          text(g, r, x0, y, { font: font(550, 12.5), color: theme.text, align: 'left' });
          y += 17;
        }
        // Hinweis unten
        if (R.h > 420) {
          const tr = { x: x0 - 4, y: tipTop, w: w + 8, h: 72 };
          roundRect(g, tr.x, tr.y, tr.w, tr.h, 12);
          g.fillStyle = alpha(accent(), theme.dark ? 0.14 : 0.08);
          g.fill();
          text(g, tt('Hochzahl + 1', 'Exponent + 1'), tr.x + 10, tr.y + 16, { font: font(800, 12), color: expCol, align: 'left' });
          const tip = wrap(tt('Der Ausschnitt wird 10-mal so groß – alles darin erscheint 10-mal kleiner.', 'The view becomes 10 times as large – everything in it looks 10 times smaller.'), tr.w - 20, font(550, 11.5));
          tip.slice(0, 3).forEach((r, i) => text(g, r, tr.x + 10, tr.y + 34 + i * 14.5, { font: font(550, 11.5), color: theme.muted, align: 'left' }));
        }
      } else {
        const colW = R.w / 2;
        const x0 = R.x + 14;
        let y = R.y + 20;
        text(g, tt('1 Kästchen =', '1 square ='), x0, y, { font: font(650, 12), color: theme.muted, align: 'left' });
        y += 30;
        const big = 32;
        const pw = powText('10', expText(f), x0, y, big, theme.text, expCol, 'left');
        text(g, ' m', x0 + pw + 2, y, { font: font(800, 20), color: theme.text, align: 'left' });
        y += 30;
        text(g, val, x0, y, { font: font(800, 15), color: theme.text, align: 'left' });
        y += 19;
        const nameRows = wrap(T(METER_NAMES[f] ?? L('', '')), colW - 22, font(600, 11.5));
        nameRows.slice(0, 2).forEach((r, i) => text(g, r, x0, y + i * 15, { font: font(600, 11.5), color: theme.muted, align: 'left' }));
        y += nameRows.length > 1 ? 32 : 18;
        const conv = conversions(f);
        conv.forEach((c, i) => text(g, `= ${c}`, x0, y + i * 15, { font: font(650, 11.5), color: theme.muted, align: 'left' }));
        // rechts: Objekt
        const rx = R.x + colW + 6;
        const rw = colW - 20;
        let ry = R.y + 20;
        g.strokeStyle = alpha(theme.text, 0.08);
        g.beginPath();
        g.moveTo(R.x + colW - 4, R.y + 14);
        g.lineTo(R.x + colW - 4, R.y + R.h - 14);
        g.stroke();
        text(g, tt('Im Blick', 'In view'), rx, ry, { font: font(650, 12), color: theme.muted, align: 'left' });
        ry += 22;
        const col = theme.series[OBJECTS.indexOf(o) % 6]!;
        g.fillStyle = col;
        g.beginPath();
        g.arc(rx + 5, ry, 4.5, 0, Math.PI * 2);
        g.fill();
        const nm = wrap(T(ot.name), rw - 14, font(800, 13.5));
        nm.slice(0, 2).forEach((r, i) => text(g, r, rx + 15, ry + i * 17, { font: font(800, 13.5), color: theme.text, align: 'left' }));
        ry += nm.length > 1 ? 36 : 20;
        text(g, sizeText(o), rx, ry, { font: font(700, 12.5), color: expCol, align: 'left' });
        ry += 17;
        if (p.show) {
          text(g, `≈ ${sciSizeText(o)}`, rx, ry, { font: font(650, 11.5), color: theme.muted, align: 'left' });
          ry += 17;
        }
        const rows = wrap(T(ot.fact), rw, font(550, 11.5));
        const maxRows = Math.max(0, Math.floor((R.y + R.h - 10 - ry) / 15));
        rows.slice(0, maxRows).forEach((r, i) => text(g, r, rx, ry + i * 15, { font: font(550, 11.5), color: theme.text, align: 'left' }));
      }
      g.restore();
    }

    /* ---------------- Reise ---------------- */
    function setTourLabel(): void {
      ctx.setAction('tour', { label: T(tourTimer ? TOUR_STOP : TOUR_LABEL) });
    }
    function stopTour(): void {
      if (tourTimer) clearTimeout(tourTimer);
      tourTimer = null;
      setTourLabel();
    }
    function tourStep(): void {
      const next = Math.round((p.e + 0.05) * 20) / 20;
      if (next > E_MAX + 1e-9) {
        stopTour();
        return;
      }
      const slow = OBJECTS.some((o) => Math.abs(objectExp(o) - next) < 0.22) || Math.abs(next - Math.round(next)) < 0.06;
      const ms = slow ? 120 : 55;
      camNext = { ms: ms + 20, fn: ease.linear };
      ctx.set({ e: next });
      tourTimer = setTimeout(tourStep, ms);
    }
    function startTour(): void {
      if (reduced) {
        ctx.set({ e: E_MAX });
        return;
      }
      if (p.e > E_MIN + 0.01) {
        camNext = { ms: 1300, fn: ease.inOutCubic };
        ctx.set({ e: E_MIN });
        tourTimer = setTimeout(tourStep, 1700);
      } else tourTimer = setTimeout(tourStep, 300);
      setTourLabel();
    }

    function zoomTo(e: number, ms = 1100): void {
      camNext = { ms, fn: ease.inOutCubic };
      ctx.set({ e: clamp(Math.round(e * 20) / 20, E_MIN, E_MAX) });
    }

    /* ================================================================== */
    /* Potenz als Produkt                                                  */
    /* ================================================================== */

    interface Ext {
      x: number;
      y: number;
      z: number;
    }
    type Axis = 'x' | 'y' | 'z';
    const AXES: Axis[] = ['x', 'z', 'y'];
    const axisOf = (K: number): Axis => AXES[(K - 1) % 3]!;

    /** Ausdehnung der Würfelbauten bᴷ (K = 0 … 9) und Lücken zwischen den Bausteinen. */
    function extents(b: number): { ext: Ext[]; gap: number[] } {
      const ext: Ext[] = [{ x: 1, y: 1, z: 1 }];
      const gap: number[] = [0];
      for (let K = 1; K <= N_MAX; K++) {
        const m = Math.floor((K - 1) / 3);
        const gp = K >= 4 ? 0.16 * ext[3 * m]!.x : 0;
        const a = axisOf(K);
        const e = { ...ext[K - 1]! };
        e[a] = b * e[a] + (b - 1) * gp;
        ext.push(e);
        gap.push(gp);
      }
      return { ext, gap };
    }
    let extCache = { b: p.b, ...extents(p.b) };
    const ext = () => {
      if (extCache.b !== p.b) extCache = { b: p.b, ...extents(p.b) };
      return extCache;
    };

    interface BlockCtx {
      ox: number;
      oy: number;
      s: number;
    }

    function drawBox(bc: BlockCtx, o: Ext, e: Ext, grid: [number, number, number], col: string, a: number): void {
      const g = surface.g;
      const P = (x: number, y: number, z: number): [number, number] => [bc.ox + (x - z) * C30 * bc.s, bc.oy + (x + z) * 0.5 * bc.s - y * bc.s];
      const x0 = o.x;
      const x1 = o.x + e.x;
      const y0 = o.y;
      const y1 = o.y + e.y;
      const z0 = o.z;
      const z1 = o.z + e.z;
      const face = (pts: [number, number][], fill: string) => {
        g.beginPath();
        g.moveTo(pts[0]![0], pts[0]![1]);
        for (let i = 1; i < pts.length; i++) g.lineTo(pts[i]![0], pts[i]![1]);
        g.closePath();
        g.fillStyle = fill;
        g.fill();
      };
      g.save();
      g.globalAlpha *= a;
      const top: [number, number][] = [P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)];
      const right: [number, number][] = [P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)];
      const front: [number, number][] = [P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)];
      const dark = ctx.theme.dark;
      face(top, shade(col, dark ? 0.2 : 0.42));
      face(front, shade(col, dark ? -0.05 : 0.08));
      face(right, shade(col, dark ? -0.35 : -0.22));
      // Rasterlinien (einzelne Würfelchen), wenn sie nicht zu eng werden
      const [gx, gy, gz] = grid;
      const line = alpha(shade(col, dark ? -0.6 : -0.5), dark ? 0.55 : 0.4);
      g.strokeStyle = line;
      g.lineWidth = 1;
      g.beginPath();
      const seg = (a1: [number, number], b1: [number, number]) => {
        g.moveTo(a1[0], a1[1]);
        g.lineTo(b1[0], b1[1]);
      };
      const ok = (n: number, len: number) => n > 1 && (len / n) * bc.s >= 3.2;
      if (ok(gx, e.x))
        for (let i = 1; i < gx; i++) {
          const x = x0 + (e.x * i) / gx;
          seg(P(x, y1, z0), P(x, y1, z1));
          seg(P(x, y0, z1), P(x, y1, z1));
        }
      if (ok(gz, e.z))
        for (let i = 1; i < gz; i++) {
          const z = z0 + (e.z * i) / gz;
          seg(P(x0, y1, z), P(x1, y1, z));
          seg(P(x1, y0, z), P(x1, y1, z));
        }
      if (ok(gy, e.y))
        for (let i = 1; i < gy; i++) {
          const y = y0 + (e.y * i) / gy;
          seg(P(x1, y, z0), P(x1, y, z1));
          seg(P(x0, y, z1), P(x1, y, z1));
        }
      g.stroke();
      // Kanten
      g.strokeStyle = alpha(shade(col, dark ? -0.65 : -0.55), 0.75);
      g.lineWidth = 1.1;
      g.beginPath();
      for (const f of [top, right, front]) {
        g.moveTo(f[0]![0], f[0]![1]);
        for (let i = 1; i < 4; i++) g.lineTo(f[i]![0], f[i]![1]);
        g.closePath();
      }
      g.stroke();
      g.restore();
    }

    /** Würfelbau bᴷ an der Stelle o (rekursiv, kleine Teile als ganzer Würfel). */
    function drawShape(bc: BlockCtx, K: number, o: Ext, col: string, a: number): void {
      const b = p.b;
      const { ext: E, gap } = ext();
      const e = E[K]!;
      if (K <= 3) {
        drawBox(bc, o, e, [K >= 1 ? b : 1, K >= 3 ? b : 1, K >= 2 ? b : 1], col, a);
        return;
      }
      if (K % 3 === 0 && e.x * bc.s < 30) {
        drawBox(bc, o, e, [b, b, b], col, a);
        return;
      }
      const ax = axisOf(K);
      const step = E[K - 1]![ax] + gap[K]!;
      for (let j = 0; j < b; j++) drawShape(bc, K - 1, { ...o, [ax]: o[ax] + j * step }, col, a);
    }

    function fitScale(e: Ext, r: Rect): number {
      const w = (e.x + e.z) * C30;
      const h = e.y + (e.x + e.z) * 0.5;
      return Math.min((r.w * 0.92) / w, (r.h * 0.9) / h, 54);
    }

    function drawBlocks(r: Rect, level: number): void {
      const g = surface.g;
      const b = p.b;
      const { ext: E, gap } = ext();
      const k = Math.floor(level + 1e-6);
      const u = clamp(level - k, 0, 1);
      const K = Math.min(N_MAX, k + 1);
      // erst herauszoomen, dann fliegen die neuen Teile ein (so passt alles ins Bild)
      const eu = ease.inOutCubic(clamp(u / 0.35, 0, 1));
      const eA = E[k]!;
      const eB = u > 1e-6 ? E[K]! : eA;
      const s = Math.exp(lerp(Math.log(fitScale(eA, r)), Math.log(fitScale(eB, r)), eu));
      const em: Ext = { x: lerp(eA.x, eB.x, eu), y: lerp(eA.y, eB.y, eu), z: lerp(eA.z, eB.z, eu) };
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const bc: BlockCtx = { ox: cx - ((em.x - em.z) * C30 * s) / 2, oy: cy - (((em.x + em.z) * 0.5 - em.y) * s) / 2, s };
      const base = ctx.theme.series[0]!;
      const fresh = ctx.theme.series[3]!;
      // Schatten
      g.save();
      const P = (x: number, z: number): [number, number] => [bc.ox + (x - z) * C30 * s, bc.oy + (x + z) * 0.5 * s];
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 6;
      g.fillStyle = ctx.theme.dark ? 'rgba(0,0,0,0.3)' : 'rgba(16,24,40,0.08)';
      g.beginPath();
      const corners = [P(0, 0), P(em.x, 0), P(em.x, em.z), P(0, em.z)];
      corners.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
      g.closePath();
      g.fill();
      g.restore();
      const origin: Ext = { x: 0, y: 0, z: 0 };
      if (u <= 1e-6 || k >= N_MAX) {
        drawShape(bc, k, origin, base, 1);
        return;
      }
      // anfliegende Teile nicht über die Karten darüber zeichnen
      g.save();
      g.beginPath();
      g.rect(r.x - 10, r.y - 4, r.w + 20, r.h + 30);
      g.clip();
      const ax = axisOf(K);
      const step = E[k]![ax] + gap[K]!;
      for (let j = 0; j < b; j++) {
        if (j === 0) {
          drawShape(bc, k, origin, base, 1);
          continue;
        }
        const uj = clamp((u - 0.2 - (0.4 * (j - 1)) / Math.max(1, b - 1)) / 0.4, 0, 1);
        if (uj <= 0) continue;
        const ej = ease.inOutCubic(uj);
        const final = j * step;
        const start = final + (ax === 'y' ? 1.5 : 2.5) * step;
        const lift = ax === 'y' ? 0 : (1 - ej) * E[k]!.y * 0.6;
        const o: Ext = { ...origin, [ax]: lerp(start, final, ej) };
        o.y += lift;
        drawShape(bc, k, o, mixColor(fresh, base, ej), clamp(uj * 2.5, 0, 1));
      }
      g.restore();
    }

    function powLayout(gm: Geo): { A: Rect; B: Rect; D: Rect } {
      const C = gm.C;
      const hA = clamp(C.h * 0.25, 92, 150);
      const A = { x: C.x + 14, y: C.y + 10, w: C.w - 28, h: hA };
      const hB = clamp(C.h * 0.2, 76, 110);
      const B = { x: C.x + 14, y: A.y + A.h + 2, w: C.w - 28, h: hB };
      const D = { x: C.x + 14, y: B.y + B.h + 4, w: C.w - 28, h: C.y + C.h - (B.y + B.h + 4) - 8 };
      return { A, B, D };
    }

    function drawPow(gm: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      card(gm.C);
      const { A, B, D } = powLayout(gm);
      const b = p.b;
      const level = lv.at(now);
      const kS = Math.min(p.n, Math.floor(level + 1e-6));
      const sA = sceneA();
      const visible = p.show || powRevealed;
      const cBase = shade(theme.series[0]!, theme.dark ? 0.15 : -0.1);
      const cExp = shade(accent(), theme.dark ? 0.1 : -0.12);
      g.save();
      g.globalAlpha = sA;
      // --- Zeile A: bⁿ = Wert ---
      const small = A.w < 430;
      const fs = clamp(A.h * 0.46, small ? 36 : 40, 66);
      const cy = A.y + A.h * 0.5;
      const nx = A.x + (small ? 8 : 20);
      const nw = powText(String(b), String(kS), nx, cy, fs, cBase, cExp, 'left');
      // Beschriftungen Grundzahl / Hochzahl
      const bw = measure(String(b), font(800, fs));
      const lf = font(700, small ? 11 : 12);
      halo(tt('Grundzahl', 'base'), nx + bw / 2, cy + fs * 0.62, lf, cBase);
      const exX = nx + bw + fs * 0.2;
      halo(tt('Hochzahl', 'exponent'), Math.min(exX + 28, A.x + A.w - 40), cy - fs * 0.86, lf, cExp, 'left');
      g.strokeStyle = alpha(cExp, 0.7);
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(Math.min(exX + 25, A.x + A.w - 43), cy - fs * 0.84);
      g.quadraticCurveTo(exX + 8, cy - fs * 0.86, exX + 4, cy - fs * 0.62);
      g.stroke();
      // Wert
      const value = power(b, kS);
      const digits = String(value);
      const eqX = nx + nw + (small ? 12 : 20);
      const fEq = font(800, fs * 0.62);
      text(g, '=', eqX, cy, { font: fEq, color: theme.muted, align: 'left' });
      const vx0 = eqX + measure('=', fEq) + (small ? 10 : 16);
      const availW = A.x + A.w - vx0 - 4;
      let vf = fs * 0.72;
      const gapW = (s: number) => (lang === 'de' ? s * 0.28 : s * 0.3);
      const groups = Math.ceil(digits.length / 3);
      const widthAt = (s: number) => digits.length * measure('0', font(800, s)) + (groups - 1) * gapW(s);
      while (vf > 16 && widthAt(vf) > availW) vf -= 1;
      if (!visible) {
        text(g, '?', vx0, cy, { font: font(800, vf), color: theme.muted, align: 'left' });
      } else {
        const adv = measure('0', font(800, vf));
        let x = vx0;
        for (let i = 0; i < digits.length; i++) {
          const place = digits.length - 1 - i;
          const isZero = b === 10 && i > 0;
          text(g, digits[i]!, x + adv / 2, cy, { font: font(800, vf), color: isZero ? cExp : theme.text });
          x += adv;
          if (place % 3 === 0 && place > 0) {
            if (lang === 'en') text(g, ',', x + gapW(vf) / 2, cy + vf * 0.12, { font: font(800, vf), color: theme.muted });
            x += gapW(vf);
          }
        }
        const sub = b === 10 ? `${powerOfTenName(kS, lang)} · ${kS} ${kS === 1 ? tt('Null', 'zero') : tt('Nullen', 'zeros')}` : powerReading(b, kS, lang);
        halo(sub, vx0, cy + vf * 0.78, font(650, small ? 11.5 : 13), theme.muted, 'left');
      }
      // --- Zeile B: Faktorkarten ---
      const N = p.n;
      if (N === 0) {
        const msg = tt(`Hochzahl 0: kein Faktor. Man legt fest: ${b}⁰ = 1.`, `Exponent 0: no factor. By definition ${b}⁰ = 1.`);
        const rows = wrap(msg, B.w - 40, font(650, 13));
        roundRect(g, B.x + 10, B.y + 8, B.w - 20, B.h - 16, 12);
        g.fillStyle = alpha(cExp, theme.dark ? 0.14 : 0.08);
        g.fill();
        rows.slice(0, 3).forEach((r, i) => text(g, r, B.x + B.w / 2, B.y + B.h / 2 + (i - (Math.min(3, rows.length) - 1) / 2) * 17, { font: font(650, 13), color: theme.text }));
      } else {
        const lab = `${N} ${N === 1 ? tt('Faktor', 'factor') : tt('Faktoren', 'factors')} ${b}`;
        halo(lab, B.x + B.w / 2, B.y + 9, font(700, 12), cExp);
        const gap = clamp(B.w * 0.028, 10, 18);
        const cw = Math.min(58, (B.w - (N - 1) * gap) / N);
        const ch = clamp(cw * 0.95, 32, 50);
        const total = N * cw + (N - 1) * gap;
        const x0 = B.x + (B.w - total) / 2;
        const ccy = B.y + 22 + ch / 2;
        const fC = font(800, clamp(cw * 0.42, 13, 22));
        const fP = font(650, 11);
        const partials = Array.from({ length: N }, (_, j) => gd(power(b, j + 1)));
        const maxPW = Math.max(...partials.map((s) => measure(s, fP)));
        // nur jedes zweite (dritte …) Zwischenergebnis, wenn der Platz nicht reicht – das letzte immer
        const stride = Math.max(1, Math.ceil((maxPW + 8) / (cw + gap)));
        for (let j = 0; j < N; j++) {
          const a = clamp(level - j, 0, 1);
          if (a <= 0) continue;
          const e1 = ease.outCubic(a);
          const pop = ease.outBack(a);
          const x = x0 + j * (cw + gap) + (1 - e1) * 46;
          const y = ccy - (1 - e1) * 34;
          g.save();
          g.globalAlpha *= clamp(a * 2.2, 0, 1);
          if (j > 0) text(g, '·', x - gap / 2, ccy, { font: font(900, 20), color: theme.muted });
          g.translate(x + cw / 2, y);
          g.scale(0.6 + 0.4 * pop, 0.6 + 0.4 * pop);
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.15)';
          g.shadowBlur = 8;
          g.shadowOffsetY = 2;
          roundRect(g, -cw / 2, -ch / 2, cw, ch, 9);
          g.fillStyle = theme.dark ? shade(theme.bg, 0.14) : '#ffffff';
          g.fill();
          g.shadowColor = 'transparent';
          g.strokeStyle = alpha(cBase, 0.5);
          g.lineWidth = 1.3;
          g.stroke();
          g.save();
          roundRect(g, -cw / 2, -ch / 2, cw, ch, 9);
          g.clip();
          g.fillStyle = cBase;
          g.fillRect(-cw / 2, -ch / 2, cw, 3.5);
          g.restore();
          text(g, String(b), 0, 1.5, { font: fC, color: cBase });
          g.restore();
          // Zwischenergebnis
          if (visible && (N - 1 - j) % stride === 0) {
            const py = ccy + ch / 2 + 13;
            const last = j === N - 1;
            const f = last ? font(800, 11.5) : fP;
            const hw = measure(partials[j]!, f) / 2 + 2;
            halo(partials[j]!, clamp(x + cw / 2, B.x + hw, B.x + B.w - hw), py, f, last ? cExp : theme.muted, 'center', clamp(a * 1.5 - 0.3, 0, 1));
          }
        }
      }
      // --- Bereich D: Würfelbau ---
      const capH = 26;
      const blockR = { x: D.x, y: D.y + 4, w: D.w, h: D.h - capH - 6 };
      drawBlocks(blockR, Math.min(level, p.n));
      const cap =
        kS === 0
          ? tt('1 Würfelchen', '1 small cube')
          : visible
            ? `${b} · ${gd(power(b, kS - 1))} = ${gd(power(b, kS))} ${tt('Würfelchen', 'small cubes')}`
            : `${b} · ${gd(power(b, kS - 1))} = ?`;
      halo(cap, D.x + D.w / 2, D.y + D.h - capH / 2, font(750, small ? 12 : 13), theme.text);
      g.restore();
      drawPowPanel(gm, kS, visible);
    }

    function drawPowPanel(gm: Geo, kS: number, visible: boolean): void {
      const R = gm.panel;
      const g = surface.g;
      const theme = ctx.theme;
      const b = p.b;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 16);
      g.clip();
      g.globalAlpha = sceneA();
      const cBase = shade(theme.series[0]!, theme.dark ? 0.15 : -0.1);
      const cExp = shade(accent(), theme.dark ? 0.1 : -0.12);
      const x0 = R.x + 14;
      const w = R.w - 28;
      text(g, tt(`Potenzen von ${b}`, `Powers of ${b}`), x0, R.y + 20, { font: font(800, 14), color: theme.text, align: 'left' });
      const def = tt('bⁿ = b · b · … · b  (n Faktoren)', 'bⁿ = b · b · … · b  (n factors)');
      text(g, def, x0, R.y + 39, { font: font(600, 12), color: theme.muted, align: 'left' });
      const cols = gm.wide ? 1 : 2;
      const perCol = Math.ceil((N_MAX + 1) / cols);
      const top = R.y + 54;
      const rowH = clamp((R.y + R.h - top - 8) / perCol, 18, 40);
      const colW = w / cols;
      for (let kk = 0; kk <= N_MAX; kk++) {
        const c = Math.floor(kk / perCol);
        const rr = kk % perCol;
        const rx = x0 + c * colW;
        const ry = top + rr * rowH;
        const cur = kk === p.n;
        const shownNow = kk === kS;
        if (cur) {
          roundRect(g, rx - 6, ry + 1, colW - (cols === 2 ? 6 : -12), rowH - 2, 8);
          g.fillStyle = alpha(cExp, theme.dark ? 0.2 : 0.12);
          g.fill();
        }
        const fsz = cols === 2 ? 12.5 : clamp(rowH * 0.42, 12.5, 15);
        const my = ry + rowH / 2 + 0.5;
        const pw = powText(String(b), String(kk), rx, my, fsz, cur || shownNow ? cBase : theme.text, cExp, 'left');
        const val = visible || kk <= 1 ? gd(power(b, kk)) : '?';
        const eqx = rx + Math.max(pw, measure('10', font(800, fsz)) + fsz * 0.7) + 6;
        text(g, `= ${val}`, eqx, my, { font: font(cur ? 800 : 650, fsz), color: theme.text, align: 'left' });
        if (b === 10 && cols === 1 && visible) {
          const name = powerOfTenName(kk, lang);
          const vw = measure(`= ${val}`, font(cur ? 800 : 650, fsz));
          if (eqx + vw + 8 + measure(name, font(600, 11.5)) < rx + colW) text(g, name, rx + colW, my, { font: font(600, 11.5), color: theme.muted, align: 'right' });
        }
        addHit(`row:${kk}`, { x: rx - 6, y: ry, w: colW, h: rowH });
        // „· b“ zwischen den Zeilen
        if (cols === 1 && kk < N_MAX && rowH >= 30) {
          halo(`· ${b}`, rx - 2 + colW + 6, ry + rowH, font(700, 10.5), alpha(theme.muted, 0.8), 'right');
        }
      }
      g.restore();
    }

    /* ================================================================== */
    /* Wissenschaftliche Schreibweise                                      */
    /* ================================================================== */

    const SCI_EXAMPLES: { z: string; label: Loc }[] = [
      { z: '12742000', label: L('Erde (Durchmesser in m)', 'Earth (diameter in m)') },
      { z: '300000', label: L('Licht pro Sekunde (in km)', 'Light per second (in km)') },
      { z: '0,001', label: L('Sandkorn (in m)', 'Grain of sand (in m)') },
    ];

    function sciTiming(hops: number): { hop: number; startHops: number; endHops: number; zerosEnd: number; resultEnd: number } {
      const n = Math.abs(hops);
      const hop = n ? clamp(2800 / n, 280, 560) : 0;
      const startHops = 0;
      const endHops = n * hop;
      return { hop, startHops, endHops, zerosEnd: endHops + 550, resultEnd: endHops + 1050 };
    }

    function drawSci(gm: Geo): void {
      const g = surface.g;
      const theme = ctx.theme;
      card(gm.C);
      const C = gm.C;
      const sA = sceneA();
      g.save();
      g.globalAlpha = sA;
      const small = C.w < 460;
      const cExp = shade(accent(), theme.dark ? 0.1 : -0.12);
      const cMan = shade(theme.series[0]!, theme.dark ? 0.15 : -0.1);
      // Kopfzeile
      text(g, tt('Zahl = a · 10ⁿ  mit  1 ≤ a < 10', 'number = a · 10ⁿ  with  1 ≤ a < 10'), C.x + C.w / 2, C.y + 26, { font: font(700, small ? 12.5 : 14), color: theme.muted });
      const d = parseDecimal(p.z);
      if (!d || isZero(d)) {
        const msg = !d ? tt('Bitte eine positive Zahl eingeben, z. B. 35 000 oder 0,0042.', 'Please enter a positive number, e.g. 35,000 or 0.0042.') : tt('Die 0 lässt sich nicht als a · 10ⁿ mit 1 ≤ a < 10 schreiben.', '0 cannot be written as a · 10ⁿ with 1 ≤ a < 10.');
        const rows = wrap(msg, C.w - 60, font(650, 14));
        rows.forEach((r, i) => text(g, r, C.x + C.w / 2, C.y + C.h * 0.45 + i * 20, { font: font(650, 14), color: theme.muted }));
        g.restore();
        drawSciPanel(gm, 0);
        return;
      }
      const cs = commaShift(d)!;
      const sc = toScientific(d)!;
      const hops = cs.from - cs.to;
      const tm = sciTiming(hops);
      const active = p.show || sciRevealed;
      const t = active ? (reduced ? 1e9 : now - sciStart) : -1;
      const hopsDone = active ? Math.min(Math.abs(hops), Math.max(0, Math.floor(t / Math.max(1, tm.hop)))) : 0;
      const hopU = Math.abs(hops) && t >= 0 && t < tm.endHops ? (t % tm.hop) / tm.hop : 0;
      const zerosA = active ? clamp((t - tm.endHops) / (tm.zerosEnd - tm.endHops), 0, 1) : 0;
      const resA = active ? clamp((t - tm.endHops - 150) / 500, 0, 1) : 0;
      const checkA = active ? clamp((t - tm.zerosEnd) / 500, 0, 1) : 0;
      // Ziffernreihe
      const row = cs.row;
      const len = row.length;
      const tw = clamp((C.w - 48) / (len + 1.2), 15, 64);
      const th = tw * 1.25;
      const arcH = clamp(tw * 0.5, 10, 24);
      const big = small ? 26 : clamp(C.w / 20, 28, 40);
      const placeH = tw >= 24 ? 20 : 0;
      const gapRes = small ? 30 : 40;
      // ganze Darstellung senkrecht mittig
      const blockH = 18 + 14 + placeH + th + 7 + arcH + 22 + gapRes + big + 50;
      const top0 = C.y + 44;
      const startY = top0 + Math.max(0, (C.y + C.h - 12 - top0 - blockH) / 2);
      const total = len * tw;
      const rx0 = C.x + (C.w - total) / 2;
      const ry = startY + 32 + placeH + th / 2;
      const fD = font(800, tw * 0.6);
      // Stellenwerte über den Ziffern (bezogen auf die ursprüngliche Zahl)
      if (placeH) {
        const INT = lang === 'de' ? ['E', 'Z', 'H', 'T', 'ZT', 'HT', 'Mio', 'ZMio', 'HMio', 'Mrd', 'ZMrd', 'HMrd', 'Bio'] : ['O', 'T', 'H', 'Th', 'TTh', 'HTh', 'M', 'TM', 'HM', 'B', 'TB', 'HB', 'Tr'];
        const FRAC = lang === 'de' ? ['z', 'h', 't', 'zt', 'ht', 'm', 'zm', 'hm', 'mrd', 'zmrd'] : ['t', 'h', 'th', 'tth', 'hth', 'm', 'tm', 'hm', 'b', 'tb'];
        const fP = font(700, clamp(tw * 0.24, 10.5, 12.5));
        for (let i = 0; i < len; i++) {
          const k = cs.from - 1 - i;
          const lab = k >= 0 ? INT[k] : FRAC[-k - 1];
          if (!lab || measure(lab, fP) > tw - 2) continue;
          text(g, lab, rx0 + i * tw + tw / 2, ry - th / 2 - 10, { font: fP, color: alpha(theme.muted, 0.85) });
        }
      }
      for (let i = 0; i < len; i++) {
        const lead = i < cs.first;
        const trail = i > cs.last;
        const fade = lead || trail ? zerosA : 0;
        const x = rx0 + i * tw;
        g.save();
        g.globalAlpha *= 1 - 0.72 * fade;
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        g.shadowBlur = 5;
        g.shadowOffsetY = 1.5;
        roundRect(g, x + 2, ry - th / 2, tw - 4, th, Math.min(8, tw * 0.2));
        g.fillStyle = theme.dark ? shade(theme.bg, 0.13) : '#ffffff';
        g.fill();
        g.shadowColor = 'transparent';
        const sig = i >= cs.first && i <= cs.last;
        g.strokeStyle = sig && zerosA > 0 ? alpha(cMan, 0.4 + 0.4 * zerosA) : alpha(theme.text, 0.14);
        g.lineWidth = sig && zerosA > 0.5 ? 1.8 : 1;
        g.stroke();
        text(g, row[i]!, x + tw / 2, ry + 1 + fade * th * 0.08, { font: fD, color: sig && zerosA > 0.5 ? cMan : theme.text });
        g.restore();
      }
      // Komma: Position zwischen den Kärtchen (Index = Anzahl Ziffern links davon)
      const dir = hops > 0 ? -1 : 1;
      const posIdx = cs.from + dir * (hopsDone + ease.inOutCubic(hopU));
      const commaX = (idx: number) => rx0 + idx * tw;
      const baseY = ry + th / 2 - 3;
      // Sprungbögen unter der Ziffernreihe
      for (let i = 0; i < Math.abs(hops); i++) {
        const shownArc = i < hopsDone ? 1 : i === hopsDone && hopU > 0 ? ease.inOutCubic(hopU) : 0;
        if (shownArc <= 0) continue;
        const a0 = commaX(cs.from + dir * i);
        const a1 = commaX(cs.from + dir * (i + 1));
        g.save();
        g.strokeStyle = cExp;
        g.lineWidth = 2;
        g.lineCap = 'round';
        g.beginPath();
        const steps = 16;
        for (let q = 0; q <= steps; q++) {
          const u = (q / steps) * shownArc;
          const x = lerp(a0, a1, u);
          const y = baseY + 7 + Math.sin(Math.PI * u) * arcH;
          if (q === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        if (shownArc >= 1) {
          // Pfeilspitze am Ende
          g.fillStyle = cExp;
          g.beginPath();
          g.moveTo(a1, baseY + 5);
          g.lineTo(a1 - dir * 6, baseY + 13);
          g.lineTo(a1 + dir * 1.5, baseY + 14);
          g.closePath();
          g.fill();
        }
        g.restore();
        if (shownArc >= 1) halo(String(i + 1), (a0 + a1) / 2, baseY + 7 + arcH + 10, font(800, clamp(tw * 0.3, 11, 13)), cExp);
      }
      // das Komma selbst (hüpft entlang des Bogens)
      const kx = commaX(posIdx);
      const ky = baseY + Math.sin(Math.PI * hopU) * arcH;
      g.save();
      g.shadowColor = alpha(cExp, 0.5);
      g.shadowBlur = 8;
      g.fillStyle = cExp;
      const cr = clamp(tw * 0.12, 3.2, 6);
      g.beginPath();
      g.arc(kx, ky, cr, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(kx + cr * 0.75, ky + cr * 0.3);
      g.quadraticCurveTo(kx + cr * 0.5, ky + cr * 2.3, kx - cr * 0.9, ky + cr * 2.7);
      g.lineTo(kx - cr * 0.4, ky + cr * 1.3);
      g.closePath();
      g.fill();
      g.restore();
      // Zähler
      const moved = active ? hopsDone + (hopU > 0.5 ? 1 : 0) : 0;
      const dirText = hops > 0 ? tt('nach links', 'to the left') : tt('nach rechts', 'to the right');
      const countLabel = !active
        ? tt('Wie weit muss das Komma wandern?', 'How far must the point move?')
        : hops === 0 ? tt('Das Komma steht schon richtig: 1 ≤ a < 10', 'The decimal point is already in place: 1 ≤ a < 10') : `${tt('Komma', 'Point')} ${moved} ${moved === 1 ? tt('Stelle', 'place') : tt('Stellen', 'places')} ${dirText}`;
      halo(countLabel, C.x + C.w / 2, startY + 9, font(750, small ? 12.5 : 14), hops === 0 || !active ? theme.muted : cExp);
      // Ergebnis
      const resY = baseY + 7 + arcH + 22 + gapRes + big / 2;
      const left = `${formatDecimal(d, lang)} =`;
      const fB = font(800, big);
      const man = active && resA > 0 ? mantissaText(sc, lang) : 'a';
      const expShown = active ? (hops > 0 ? moved : -moved) : NaN;
      const expStr = active ? expText(expShown) : 'n';
      const wl = measure(left, fB);
      const wm = measure(man, fB);
      const wd = measure(' · ', fB);
      const w10 = measure('10', fB) + measure(expStr, font(800, Math.round(big * 0.6))) + big * 0.04;
      let totalW = wl + measure(' ', fB) + wm + wd + w10;
      let scale = 1;
      if (totalW > C.w - 30) {
        scale = (C.w - 30) / totalW;
        totalW *= scale;
      }
      const bigS = big * scale;
      let x = C.x + (C.w - totalW) / 2;
      const fBS = font(800, bigS);
      text(g, left, x, resY, { font: fBS, color: theme.text, align: 'left' });
      x += measure(left + ' ', fBS);
      text(g, man, x, resY, { font: fBS, color: resA > 0 ? cMan : theme.muted, align: 'left' });
      x += measure(man, fBS);
      text(g, ' · ', x, resY, { font: fBS, color: theme.muted, align: 'left' });
      x += measure(' · ', fBS);
      powText('10', expStr, x, resY, bigS, theme.text, active ? cExp : theme.muted, 'left');
      // Probe
      if (checkA > 0.01) {
        const p10 = formatDecimal(powerOfTenDecimal(sc.exponent), lang);
        const check = `${mantissaText(sc, lang)} · ${p10} = ${formatDecimal(d, lang)}`;
        halo(`${tt('Probe', 'Check')}: ${check}`, C.x + C.w / 2, resY + bigS * 0.9 + 6, font(650, small ? 12 : 13.5), theme.muted, 'center', checkA);
        if (sc.exponent < 0) halo(tt(`Ausblick: 10${sup(sc.exponent)} = 1 : ${gd(power(10, -sc.exponent))} = ${p10}`, `Outlook: 10${sup(sc.exponent)} = 1 ÷ ${gd(power(10, -sc.exponent))} = ${p10}`), C.x + C.w / 2, resY + bigS * 0.9 + 26, font(600, small ? 11.5 : 12.5), theme.muted, 'center', checkA);
      }
      addHit('digits', { x: rx0 - 10, y: ry - th / 2 - placeH - 10, w: total + 20, h: th + placeH + arcH + 30 });
      g.restore();
      const phase = !active ? 0 : t < tm.endHops ? 1 : t < tm.zerosEnd ? 2 : 3;
      drawSciPanel(gm, phase);
    }

    function drawSciPanel(gm: Geo, phase: number): void {
      const R = gm.panel;
      const g = surface.g;
      const theme = ctx.theme;
      card(R);
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 16);
      g.clip();
      g.globalAlpha = sceneA();
      const cExp = shade(accent(), theme.dark ? 0.1 : -0.12);
      const x0 = R.x + 14;
      const w = R.w - 28;
      const steps: Loc[] = [
        L('Setze das Komma hinter die erste Ziffer, die nicht 0 ist.', 'Put the point after the first digit that is not 0.'),
        L('Zähle die Stellen: nach links → Hochzahl positiv, nach rechts → negativ.', 'Count the places: to the left → positive exponent, to the right → negative.'),
        L('Lass Nullen am Anfang und am Ende weg.', 'Drop zeros at the start and the end.'),
      ];
      if (gm.wide) {
        let y = R.y + 22;
        text(g, tt('So geht’s', 'How it works'), x0, y, { font: font(800, 14), color: theme.text, align: 'left' });
        y += 22;
        steps.forEach((s, i) => {
          const on = phase === i + 1 || (phase === 3 && i === 2) || (phase === 0 && i === 0);
          const rows = wrap(T(s), w - 30, font(600, 12.5));
          const h = rows.length * 16 + 14;
          roundRect(g, x0 - 4, y - 2, w + 8, h, 10);
          g.fillStyle = on ? alpha(cExp, theme.dark ? 0.18 : 0.1) : alpha(theme.text, theme.dark ? 0.04 : 0.025);
          g.fill();
          g.fillStyle = on ? cExp : alpha(theme.muted, 0.7);
          g.beginPath();
          g.arc(x0 + 9, y + 12, 9, 0, Math.PI * 2);
          g.fill();
          text(g, String(i + 1), x0 + 9, y + 12.5, { font: font(800, 11.5), color: '#ffffff' });
          rows.forEach((r, k) => text(g, r, x0 + 26, y + 12 + k * 16, { font: font(600, 12.5), color: theme.text, align: 'left' }));
          y += h + 8;
        });
        y += 10;
        text(g, tt('Beispiele', 'Examples'), x0, y, { font: font(800, 13), color: theme.text, align: 'left' });
        y += 10;
        for (let i = 0; i < SCI_EXAMPLES.length; i++) {
          const ex = SCI_EXAMPLES[i]!;
          const dd = parseDecimal(ex.z)!;
          const s = toScientific(dd)!;
          const rh = 44;
          if (y + rh > R.y + R.h - 8) break;
          const cur = p.z.replace(/\s/g, '') === ex.z;
          const hot = hover === `ex:${i}`;
          roundRect(g, x0 - 4, y + 4, w + 8, rh - 6, 10);
          g.fillStyle = cur ? alpha(theme.series[0]!, theme.dark ? 0.2 : 0.1) : hot ? alpha(theme.text, 0.06) : alpha(theme.text, theme.dark ? 0.03 : 0.02);
          g.fill();
          text(g, T(ex.label), x0 + 4, y + 16, { font: font(600, 11.5), color: theme.muted, align: 'left' });
          const res = p.show ? `${formatDecimal(dd, lang)} = ${mantissaText(s, lang)} · 10${sup(s.exponent)}` : formatDecimal(dd, lang);
          text(g, res, x0 + 4, y + 32, { font: font(750, 12.5), color: theme.text, align: 'left' });
          addHit(`ex:${i}`, { x: x0 - 4, y: y + 4, w: w + 8, h: rh - 6 });
          y += rh;
        }
      } else {
        let y = R.y + 20;
        text(g, tt('So geht’s', 'How it works'), x0, y, { font: font(800, 13), color: theme.text, align: 'left' });
        y += 18;
        steps.forEach((s, i) => {
          const on = phase === i + 1 || (phase === 3 && i === 2) || (phase === 0 && i === 0);
          const rows = wrap(T(s), w - 26, font(600, 11.5));
          g.fillStyle = on ? cExp : alpha(theme.muted, 0.7);
          g.beginPath();
          g.arc(x0 + 8, y + 7, 8, 0, Math.PI * 2);
          g.fill();
          text(g, String(i + 1), x0 + 8, y + 7.5, { font: font(800, 11), color: '#ffffff' });
          rows.forEach((r, k) => text(g, r, x0 + 22, y + 7 + k * 15, { font: font(on ? 700 : 600, 11.5), color: theme.text, align: 'left' }));
          y += rows.length * 15 + 9;
        });
        // Beispiele als Chips
        y += 4;
        let cx = x0;
        for (let i = 0; i < SCI_EXAMPLES.length; i++) {
          const ex = SCI_EXAMPLES[i]!;
          const label = formatDecimal(parseDecimal(ex.z)!, lang);
          const f = font(750, 12);
          const cw = measure(label, f) + 20;
          if (cx + cw > x0 + w) break;
          if (y + 26 > R.y + R.h - 4) break;
          const cur = p.z.replace(/\s/g, '') === ex.z;
          roundRect(g, cx, y, cw, 26, 13);
          g.fillStyle = cur ? alpha(theme.series[0]!, 0.18) : alpha(theme.text, 0.06);
          g.fill();
          text(g, label, cx + cw / 2, y + 13.5, { font: f, color: theme.text });
          addHit(`ex:${i}`, { x: cx, y, w: cw, h: 26 });
          cx += cw + 8;
        }
      }
      g.restore();
    }

    /* ================================================================== */
    /* Ergebnisse                                                          */
    /* ================================================================== */

    const supH = (k: number) => `<sup>${expText(k)}</sup>`;

    function updateReadouts(): void {
      const m = mode();
      const all = ['grid', 'obj', 'units', 'prod', 'val', 'parts', 'sci', 'shift', 'check'];
      const shown = new Set<string>();
      if (m === 'zoom') {
        const f = floorExp(p.e);
        const pl = powerLength(f);
        const main = `${pl.value >= 1000 ? gd(pl.value) : formatNumber(pl.value, lang)} ${pl.unit}`;
        ctx.readout('grid', { html: `10${supH(f)} m = ${main}` });
        const o = OBJECTS[nearestObject(p.e)]!;
        const ot = OBJ_TEXT[o.id];
        const s = approxScientific(o.size, 3);
        const sciH = `${s.mantissa === 1 ? '' : `${formatNumber(s.mantissa, lang, { decimals: 2 })} · `}10${supH(s.exponent)} m`;
        ctx.readout('obj', { html: `${T(ot.name)} (${T(ot.what)}): ${sizeText({ ...o })} ≈ ${sciH}` });
        ctx.readout('units', `${main} = ${conversions(f).join(' = ')}`);
        shown.add('grid').add('obj').add('units');
      } else if (m === 'pow') {
        const b = p.b;
        const n = p.n;
        const factors = n === 0 ? tt('1 (kein Faktor)', '1 (no factor)') : Array.from({ length: n }, () => String(b)).join(' · ');
        ctx.readout('prod', { html: `${b}${supH(n)} = ${factors}` });
        const v = power(b, n);
        ctx.readout('val', b === 10 ? `${gd(v)} (${powerOfTenName(n, lang)}, ${trailingZeros(v)} ${trailingZeros(v) === 1 ? tt('Null', 'zero') : tt('Nullen', 'zeros')})` : gd(v));
        ctx.readout('parts', `${tt('Grundzahl', 'Base')} ${b} · ${tt('Hochzahl', 'Exponent')} ${n}`);
        shown.add('prod').add('val').add('parts');
      } else {
        const d = parseDecimal(p.z);
        if (!d || isZero(d)) {
          ctx.readout('sci', !d ? tt('Keine gültige Zahl', 'Not a valid number') : tt('0 geht nicht', '0 is not possible'));
          shown.add('sci');
        } else {
          const s = toScientific(d)!;
          const c = commaShift(d)!;
          const hops = c.from - c.to;
          ctx.readout('sci', { html: `${formatDecimal(d, lang)} = ${mantissaText(s, lang)} · 10${supH(s.exponent)}` });
          ctx.readout(
            'shift',
            hops === 0 ? tt('gar nicht (Hochzahl 0)', 'not at all (exponent 0)') : `${Math.abs(hops)} ${Math.abs(hops) === 1 ? tt('Stelle', 'place') : tt('Stellen', 'places')} ${hops > 0 ? tt('nach links', 'to the left') : tt('nach rechts', 'to the right')} → ${tt('Hochzahl', 'exponent')} ${expText(hops)}`,
          );
          ctx.readout('check', `${mantissaText(s, lang)} · ${formatDecimal(powerOfTenDecimal(s.exponent), lang)} = ${formatDecimal(d, lang)}`);
          shown.add('sci').add('shift').add('check');
        }
      }
      for (const key of all) if (!shown.has(key)) ctx.readout(key, null);
    }

    function updateActions(): void {
      ctx.setAction('more', { label: `· ${p.b} (${tt('Hochzahl + 1', 'exponent + 1')})`, enabled: p.n < N_MAX && !ctx.locked });
      ctx.setAction('out', { enabled: p.e < E_MAX - 1e-9 && !ctx.locked });
      ctx.setAction('in', { enabled: p.e > E_MIN + 1e-9 && !ctx.locked });
      ctx.setAction('tour', { enabled: !ctx.locked });
      ctx.setAction('build', { enabled: !ctx.locked });
      ctx.setAction('hop', { enabled: !ctx.locked });
      setTourLabel();
    }

    /* ================================================================== */
    /* Zeiger                                                              */
    /* ================================================================== */

    surface.addTarget({
      contains: (px, py) => geo !== null && px >= 0 && py >= 0 && px <= surface.width && py <= surface.height && hitAt(px, py) !== null,
      pointerDown: (pt) => {
        if (ctx.locked) return false;
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        const m = mode();
        if (m === 'zoom') {
          if (h.id === 'strip') {
            stopTour();
            drag = { kind: 'strip', x0: pt.px, e0: p.e, moved: false, obj: null };
            camNext = { ms: 500, fn: ease.inOutCubic };
            ctx.set({ e: stripE(pt.px) });
            return true;
          }
          if (h.id.startsWith('dot:')) {
            stopTour();
            zoomTo(objectExp(OBJECTS[Number(h.id.slice(4))]!));
            return true;
          }
          const obj = h.id.startsWith('obj:') ? Number(h.id.slice(4)) : null;
          drag = { kind: 'scene', x0: pt.px, e0: p.e, moved: false, obj };
          surface.setCursor('grabbing');
          return true;
        }
        if (m === 'pow' && h.id.startsWith('row:')) {
          ctx.set({ n: Number(h.id.slice(4)) });
          return true;
        }
        if (m === 'sci') {
          if (h.id.startsWith('ex:')) {
            ctx.set({ z: SCI_EXAMPLES[Number(h.id.slice(3))]!.z });
            return true;
          }
          if (h.id === 'digits') {
            sciRevealed = true;
            sciStart = performance.now() + 150;
            ctx.requestRender();
            return true;
          }
        }
        return false;
      },
      pointerMove: (pt) => {
        if (!drag || !geo) return;
        if (drag.kind === 'strip') {
          camNext = { ms: 140, fn: ease.outCubic };
          ctx.set({ e: stripE(pt.px) });
          return;
        }
        if (!drag.moved && Math.abs(pt.px - drag.x0) < 5) return;
        if (!drag.moved) stopTour();
        drag.moved = true;
        const v = zview(geo);
        const e = clamp(drag.e0 + (drag.x0 - pt.px) / (0.42 * v.S.w), E_MIN, E_MAX);
        camNext = { ms: 110, fn: ease.outCubic };
        ctx.set({ e });
      },
      pointerUp: () => {
        if (drag && drag.kind === 'scene' && !drag.moved && drag.obj !== null) {
          stopTour();
          const o = OBJECTS[drag.obj]!;
          zoomTo(Math.min(E_MAX, objectExp(o)));
        }
        drag = null;
        surface.setCursor(hover?.startsWith('obj:') ? 'pointer' : mode() === 'zoom' && hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (pt) => {
        const h = pt && !ctx.locked ? hitAt(pt.px, pt.py) : null;
        const id = h?.id ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        if (drag) return;
        surface.setCursor(!id ? '' : id === 'scene' ? 'grab' : id === 'strip' ? 'ew-resize' : 'pointer');
      },
      wheel: (px, py, dy) => {
        if (ctx.locked || mode() !== 'zoom' || !geo) return false;
        const h = hitAt(px, py);
        if (!h || !(h.id === 'scene' || h.id.startsWith('obj:') || h.id === 'strip')) return false;
        stopTour();
        camNext = { ms: 180, fn: ease.outCubic };
        ctx.set({ e: clamp(p.e + dy * 0.003, E_MIN, E_MAX) });
        return true;
      },
    });

    /* ================================================================== */
    /* Ablauf                                                              */
    /* ================================================================== */

    let shownMode = mode();
    intro();
    updateReadouts();
    updateActions();

    return {
      update(changed, source) {
        now = performance.now();
        if (changed.has('mode') && mode() !== shownMode) {
          shownMode = mode();
          stopTour();
          powRevealed = p.show;
          sciRevealed = p.show;
          if (source !== 'init') intro();
        }
        if (changed.has('show') && source !== 'init') {
          powRevealed = p.show;
          sciRevealed = p.show;
          if (p.show && mode() === 'sci') sciStart = now - 1e6;
        }
        if (changed.has('e')) {
          if (source === 'input' || source === 'replace') stopTour();
          const nx = camNext ?? (source === 'replace' ? { ms: 1200, fn: ease.inOutCubic } : { ms: 420, fn: ease.outCubic });
          camNext = null;
          if (source !== 'init') camE.go(p.e, nx.ms, nx.fn);
        }
        if (changed.has('b') && source !== 'init') {
          if (!p.show) powRevealed = false;
          lv.snap(0);
          lv.go(p.n, clamp(p.n * 380, 300, 2600), ease.linear, 150);
        } else if (changed.has('n') && source !== 'init') {
          if (!p.show) powRevealed = false;
          const from = lv.at(now);
          lv.go(p.n, clamp(Math.abs(p.n - from) * 700, 450, 3200), ease.linear);
        }
        if (changed.has('z') && source !== 'init') {
          if (!p.show) sciRevealed = false;
          sciStart = now + 350;
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        if (id === 'tour') {
          if (tourTimer) stopTour();
          else startTour();
        } else if (id === 'out') {
          stopTour();
          zoomTo(Math.min(E_MAX, floorExp(p.e + 1e-6) + 1), 900);
        } else if (id === 'in') {
          const f = floorExp(p.e);
          stopTour();
          zoomTo(Math.max(E_MIN, Math.abs(p.e - f) < 1e-6 ? f - 1 : f), 900);
        } else if (id === 'build') {
          powRevealed = true;
          lv.snap(0);
          lv.go(p.n, Math.max(400, p.n * 950), ease.linear, 250);
        } else if (id === 'more') {
          if (p.n < N_MAX) ctx.set({ n: p.n + 1 });
        } else if (id === 'hop') {
          sciRevealed = true;
          sciStart = now + 200;
        }
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        const sized = !geo || geo.W !== surface.width || geo.H !== surface.height;
        if (sized) geo = computeGeo();
        hits = [];
        surface.begin();
        const gm = geo!;
        const m = mode();
        if (m === 'zoom') drawZoom(gm);
        else if (m === 'pow') drawPow(gm);
        else drawSci(gm);
        let busy = now - sceneStart < 500;
        if (m === 'zoom') busy = busy || camE.busy(now);
        if (m === 'pow') busy = busy || lv.busy(now);
        if (m === 'sci') {
          const d = parseDecimal(p.z);
          const c = d && !isZero(d) ? commaShift(d) : null;
          if (c && (p.show || sciRevealed)) busy = busy || now - sciStart < sciTiming(c.from - c.to).resultEnd + 600;
        }
        if (busy) ctx.requestRender();
      },

      destroy: () => {
        if (tourTimer) clearTimeout(tourTimer);
        surface.destroy();
      },
    };
  },
});
