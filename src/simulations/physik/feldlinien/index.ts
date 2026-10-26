import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { chargeAt, fieldAt, lineCount, plateField, pointField, potentialAt, traceLine, type Charge } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
const NC = 1e-9;
/** Sichtbarer Ausschnitt in cm (mindestens). */
const VIEW_W = 50;
const VIEW_H = 30;
/** Probeladung in C. */
const Q0 = 1e-9;
/** Höhe der Kondensatorplatten in cm. */
const PLATE_H = 22;

type Grab = 'c0' | 'c1' | 'c2' | 'probe';

interface Lay {
  side: boolean;
  scene: Rect;
  info: Rect;
}

interface Geo {
  r: Rect;
  sm: boolean;
  /** Pixel je cm und Mittelpunkt. */
  k: number;
  cx: number;
  cy: number;
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

/**
 * Feldlinien von Punktladungen: bis zu drei ziehbare Ladungen (+/−,
 * verschiedene Beträge), Feldlinien von + nach − mit wandernden Pfeilen,
 * Feldstärke als Farbe, Äquipotentiallinien, ziehbare Probeladung mit
 * Kraftpfeil (Länge ∝ |E|) und Vektorsumme; dazu der idealisierte
 * Plattenkondensator mit homogenem Feld.
 */
export default defineSimulation({
  id: 'feldlinien',
  animated: true,
  dragHint: true,
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'plates'
      ? L('Tipp: Ziehe die Probeladung q₀ zwischen den Platten hin und her.', 'Tip: drag the test charge q₀ between the plates.')
      : L('Tipp: Ziehe die Ladungen und die Probeladung q₀ mit Maus oder Finger.', 'Tip: drag the charges and the test charge q₀ with the mouse or a finger.'),
  layout: { aspect: 1.55, aspectNarrow: 0.62 },
  groups: [
    { id: 'charges', label: L('Ladungen', 'Charges') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Anordnung', 'Arrangement'),
      options: [
        { value: 'points', label: L('Punktladungen', 'Point charges') },
        { value: 'plates', label: L('Plattenkondensator', 'Parallel-plate capacitor') },
      ],
      default: 'points',
    },
    { key: 'n', type: 'number', label: L('Anzahl der Ladungen', 'Number of charges'), min: 1, max: 3, step: 1, default: 2, visibleIf: (v) => v.mode === 'points' },
    { key: 'q1', type: 'number', group: 'charges', label: L('Ladung Q₁', 'Charge Q₁'), help: L('Ladungen im Bild ziehen, um sie zu verschieben.', 'Drag the charges in the picture to move them.'), min: -5, max: 5, step: 0.5, default: 1, unit: 'nC', visibleIf: (v) => v.mode === 'points' },
    { key: 'q2', type: 'number', group: 'charges', label: L('Ladung Q₂', 'Charge Q₂'), min: -5, max: 5, step: 0.5, default: -1, unit: 'nC', visibleIf: (v) => v.mode === 'points' && Number(v.n) >= 2 },
    { key: 'q3', type: 'number', group: 'charges', label: L('Ladung Q₃', 'Charge Q₃'), min: -5, max: 5, step: 0.5, default: 1, unit: 'nC', visibleIf: (v) => v.mode === 'points' && Number(v.n) >= 3 },
    { key: 'x1', type: 'number', group: 'charges', label: L('Q₁: x', 'Q₁: x'), min: -22, max: 22, step: 0.5, default: -10, unit: 'cm', visibleIf: (v) => v.mode === 'points' },
    { key: 'y1', type: 'number', group: 'charges', label: L('Q₁: y', 'Q₁: y'), min: -14, max: 14, step: 0.5, default: 0, unit: 'cm', visibleIf: (v) => v.mode === 'points' },
    { key: 'x2', type: 'number', group: 'charges', label: L('Q₂: x', 'Q₂: x'), min: -22, max: 22, step: 0.5, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'points' && Number(v.n) >= 2 },
    { key: 'y2', type: 'number', group: 'charges', label: L('Q₂: y', 'Q₂: y'), min: -14, max: 14, step: 0.5, default: 0, unit: 'cm', visibleIf: (v) => v.mode === 'points' && Number(v.n) >= 2 },
    { key: 'x3', type: 'number', group: 'charges', label: L('Q₃: x', 'Q₃: x'), min: -22, max: 22, step: 0.5, default: 0, unit: 'cm', visibleIf: (v) => v.mode === 'points' && Number(v.n) >= 3 },
    { key: 'y3', type: 'number', group: 'charges', label: L('Q₃: y', 'Q₃: y'), min: -14, max: 14, step: 0.5, default: 9, unit: 'cm', visibleIf: (v) => v.mode === 'points' && Number(v.n) >= 3 },
    { key: 'U', type: 'number', label: L('Spannung U', 'Voltage U'), min: 100, max: 5000, step: 100, default: 1000, unit: 'V', visibleIf: (v) => v.mode === 'plates' },
    { key: 'd', type: 'number', label: L('Plattenabstand d', 'Plate distance d'), min: 4, max: 30, step: 1, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'plates' },
    { key: 'px', type: 'number', group: 'view', label: L('Probeladung: x', 'Test charge: x'), help: L('Oder: die Probeladung im Bild ziehen.', 'Or drag the test charge in the picture.'), min: -24, max: 24, step: 0.5, default: 0, unit: 'cm', visibleIf: (v) => v.probe === true },
    { key: 'py', type: 'number', group: 'view', label: L('Probeladung: y', 'Test charge: y'), min: -14, max: 14, step: 0.5, default: 0, unit: 'cm', visibleIf: (v) => v.probe === true },
    { key: 'probe', type: 'boolean', group: 'view', label: L('Probeladung q₀ = +1 nC mit Kraftpfeil', 'Test charge q₀ = +1 nC with force arrow'), default: true },
    { key: 'heat', type: 'boolean', group: 'view', label: L('Feldstärke als Farbe', 'Field strength as colour'), default: true },
    { key: 'eq', type: 'boolean', group: 'view', label: L('Äquipotentiallinien', 'Equipotential lines'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  readouts: [
    { key: 'E', label: L('Feldstärke bei der Probeladung', 'Field strength at the test charge'), spoiler: true },
    { key: 'F', label: L('Kraft auf die Probeladung', 'Force on the test charge'), spoiler: true },
    { key: 'phi', label: L('Potential', 'Potential'), spoiler: true },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'dipole', label: L('Dipol ±1 nC, Mitte', 'Dipole ±1 nC, midpoint'), values: {} },
    { id: 'single', label: L('Einzelne Ladung, r = 10 cm', 'Single charge, r = 10 cm'), values: { n: 1, x1: 0, y1: 0, px: 10, py: 0 } },
    { id: 'equal', label: L('Zwei gleiche Ladungen', 'Two equal charges'), values: { q2: 1, eq: true, px: 0, py: 6 } },
    { id: 'unequal', label: L('+3 nC und −1 nC', '+3 nC and −1 nC'), values: { q1: 3, q2: -1, px: 0, py: 8 } },
    { id: 'three', label: L('Drei Ladungen', 'Three charges'), values: { n: 3, q3: -2, px: 5, py: -6 } },
    { id: 'plates', label: L('Plattenkondensator: homogenes Feld', 'Capacitor: homogeneous field'), values: { mode: 'plates', eq: true, px: 0, py: 3 } },
  ],
  strings: {
    de: {
      canvas:
        'Elektrisches Feld: Punktladungen (rot positiv, blau negativ) mit Feldlinien von plus nach minus, auf denen kleine Pfeile wandern; die Hintergrundfarbe zeigt die Feldstärke, gestrichelte Linien zeigen gleiches Potential. Eine Probeladung zeigt mit einem Pfeil die Kraft. Die Ladungen und die Probeladung lassen sich ziehen. Als zweite Anordnung ein Plattenkondensator mit homogenem Feld.',
      title: 'Elektrisches Feld',
      plates: 'Plattenkondensator (idealisiert)',
      platesS: 'Kondensator',
      scale: '10 cm',
      q0: 'q₀',
      near: 'zu nah an einer Ladung',
      infoTitle: 'Feld bei der Probeladung',
      infoTitleS: 'Feld bei q₀',
      sum: 'E = |E⃗₁ + E⃗₂ + …|',
      dirL: 'Richtung: {a}°',
      heatTitle: 'Feldstärke in N/C',
      none: 'Probeladung ausgeblendet.',
      noCharge: 'Q = 0: keine Feldlinien',
      ideal: 'Randeffekte vernachlässigt',
      E: '{list}<br>Vektorsumme: <strong><var>E</var> = {E} N/C</strong>, Richtung {a}° gegen die x-Achse',
      Ei: '<var>E</var><sub>{i}</sub> = <var>k</var> · <span class="frac"><span>|<var>Q</var><sub>{i}</sub>|</span><span><var>r</var><sub>{i}</sub><sup>2</sup></span></span> = 8,99 · 10<sup>9</sup> <span class="frac"><span>N m<sup>2</sup></span><span>C<sup>2</sup></span></span> · <span class="frac"><span>{q} · 10<sup>−9</sup> C</span><span>({r} m)<sup>2</sup></span></span> = {E} N/C ({dir})',
      away: 'weg von Q<sub>{i}</sub>',
      toward: 'hin zu Q<sub>{i}</sub>',
      zeroQ: '<var>Q</var><sub>{i}</sub> = 0: kein Beitrag',
      Ezero: '{list}<br>Vektorsumme: <strong><var>E</var> = 0 N/C</strong>: Die Einzelfelder heben sich auf (feldfreier Punkt), keine Kraft auf die Probeladung.',
      onCharge: 'Die Probeladung sitzt genau auf <var>Q</var><sub>{i}</sub>: Der Abstand ist <var>r</var> = 0, dort ist die Feldstärke nicht definiert (Division durch 0). Verschiebe die Probeladung.',
      onChargeS: 'r = 0: E nicht definiert',
      Eplates: '<var>E</var> = <span class="frac"><span><var>U</var></span><span><var>d</var></span></span> = <span class="frac"><span>{U} V</span><span>{d} m</span></span> = <strong>{E} N/C</strong> (überall zwischen den Platten gleich)',
      F: '<var>F</var> = <var>q</var><sub>0</sub> · <var>E</var> = 1 · 10<sup>−9</sup> C · {E} N/C = <strong>{F} µN</strong>, in Richtung von <var>E</var> (positive Probeladung)',
      phi: 'Potential bei der Probeladung: <var>φ</var> = Σ <var>k</var> · <var>Q</var><sub><var>i</var></sub> / <var>r</var><sub><var>i</var></sub> = <strong>{V} V</strong> (Bezug: unendlich fern)',
      phiPlates: 'Potential bezogen auf die negative Platte: <var>φ</var> = <var>E</var> · <var>s</var> = <strong>{V} V</strong> ({s} cm von der negativen Platte)',
      phiOut: 'Die Probeladung liegt außerhalb des Kondensators: Dort ist (idealisiert) kein Feld.',
    },
    en: {
      canvas:
        'Electric field: point charges (red positive, blue negative) with field lines from plus to minus along which small arrows move; the background colour shows the field strength, dashed lines show equal potential. A test charge shows the force with an arrow. The charges and the test charge can be dragged. As a second arrangement a parallel-plate capacitor with a homogeneous field.',
      title: 'Electric field',
      plates: 'Parallel-plate capacitor (ideal)',
      platesS: 'Capacitor',
      scale: '10 cm',
      q0: 'q₀',
      near: 'too close to a charge',
      infoTitle: 'Field at the test charge',
      infoTitleS: 'Field at q₀',
      sum: 'E = |E⃗₁ + E⃗₂ + …|',
      dirL: 'direction: {a}°',
      heatTitle: 'Field strength in N/C',
      none: 'Test charge hidden.',
      noCharge: 'Q = 0: no field lines',
      ideal: 'edge effects neglected',
      E: '{list}<br>Vector sum: <strong><var>E</var> = {E} N/C</strong>, direction {a}° to the x axis',
      Ei: '<var>E</var><sub>{i}</sub> = <var>k</var> · <span class="frac"><span>|<var>Q</var><sub>{i}</sub>|</span><span><var>r</var><sub>{i}</sub><sup>2</sup></span></span> = 8.99 · 10<sup>9</sup> <span class="frac"><span>N m<sup>2</sup></span><span>C<sup>2</sup></span></span> · <span class="frac"><span>{q} · 10<sup>−9</sup> C</span><span>({r} m)<sup>2</sup></span></span> = {E} N/C ({dir})',
      away: 'away from Q<sub>{i}</sub>',
      toward: 'towards Q<sub>{i}</sub>',
      zeroQ: '<var>Q</var><sub>{i}</sub> = 0: no contribution',
      Ezero: '{list}<br>Vector sum: <strong><var>E</var> = 0 N/C</strong>: the single fields cancel (field-free point), no force on the test charge.',
      onCharge: 'The test charge sits exactly on <var>Q</var><sub>{i}</sub>: the distance is <var>r</var> = 0, the field strength is not defined there (division by zero). Move the test charge.',
      onChargeS: 'r = 0: E not defined',
      Eplates: '<var>E</var> = <span class="frac"><span><var>U</var></span><span><var>d</var></span></span> = <span class="frac"><span>{U} V</span><span>{d} m</span></span> = <strong>{E} N/C</strong> (the same everywhere between the plates)',
      F: '<var>F</var> = <var>q</var><sub>0</sub> · <var>E</var> = 1 · 10<sup>−9</sup> C · {E} N/C = <strong>{F} µN</strong>, in the direction of <var>E</var> (positive test charge)',
      phi: 'Potential at the test charge: <var>φ</var> = Σ <var>k</var> · <var>Q</var><sub><var>i</var></sub> / <var>r</var><sub><var>i</var></sub> = <strong>{V} V</strong> (zero at infinity)',
      phiPlates: 'Potential relative to the negative plate: <var>φ</var> = <var>E</var> · <var>s</var> = <strong>{V} V</strong> ({s} cm from the negative plate)',
      phiOut: 'The test charge is outside the capacitor: there is (ideally) no field there.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    /** Kraft in µN: 2 Nachkommastellen, ab 100 µN ganzzahlig (keine Scheingenauigkeit wie „125,00 µN“). */
    const fFmt = (v: number) => (v >= 99.995 ? n(Math.round(v), 0) : v >= 9.995 ? fx(v, 1) : fx(v, 2));
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;
    const isPlates = () => p.mode === 'plates';

    /** Ladungen in m und C (aus den Reglern). */
    function charges(): Charge[] {
      if (isPlates()) return [];
      const list: Charge[] = [
        { x: p.x1 / 100, y: p.y1 / 100, q: p.q1 * NC },
        { x: p.x2 / 100, y: p.y2 / 100, q: p.q2 * NC },
        { x: p.x3 / 100, y: p.y3 / 100, q: p.q3 * NC },
      ];
      return list.slice(0, p.n);
    }

    /** Feld am Ort in N/C (Kondensator: ideal homogen zwischen den Platten). */
    function E(xm: number, ym: number): [number, number] {
      if (isPlates()) {
        const d = p.d / 100;
        const inside = Math.abs(xm) <= d / 2 && Math.abs(ym) <= PLATE_H / 200;
        return inside ? [plateField(p.U, d), 0] : [0, 0];
      }
      return fieldAt(charges(), xm, ym);
    }

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, instant = false): number {
      const cur = soft.get(key);
      if (cur === undefined || instant || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= 1e-3 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1600, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    const fade = new Tween(380, ease.outCubic);
    let flow = 0;

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.28, 220, 320));
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, info: { x: w - pw, y: 0, w: pw, h } };
      }
      const sh = Math.round(h * 0.6);
      return { side, scene: { x: 0, y: 0, w, h: sh }, info: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }

    function geo(r: Rect): Geo {
      const sm = r.w < 440;
      const k = Math.min(r.w / VIEW_W, r.h / VIEW_H);
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      return { r, sm, k, cx, cy, x0: -r.w / 2 / k, x1: r.w / 2 / k, y0: -r.h / 2 / k, y1: r.h / 2 / k };
    }
    /** cm → Pixel (y nach oben). */
    const X = (G: Geo, x: number) => G.cx + x * G.k;
    const Y = (G: Geo, y: number) => G.cy - y * G.k;

    /* ---------- Zwischenspeicher: Feldlinien, Farbbild, Äquipotentiallinien ---------- */
    interface Cache {
      key: string;
      lines: { pts: [number, number][]; len: number }[];
      equi: { pts: [number, number][]; v: number }[];
      heat: HTMLCanvasElement | null;
    }
    let cache: Cache = { key: '', lines: [], equi: [], heat: null };
    let prevCache: Cache | null = null;

    function cacheKey(G: Geo): string {
      return [p.mode, p.n, p.q1, p.q2, p.q3, p.x1, p.y1, p.x2, p.y2, p.x3, p.y3, p.U, p.d, Math.round(G.r.w), Math.round(G.r.h), ctx.theme.dark].join('|');
    }

    function buildLines(G: Geo): { pts: [number, number][]; len: number }[] {
      const out: { pts: [number, number][]; len: number }[] = [];
      const withLen = (pts: [number, number][]) => {
        let len = 0;
        for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
        out.push({ pts, len });
      };
      if (isPlates()) {
        const hd = p.d / 2;
        const m = 9;
        for (let i = 0; i < m; i++) {
          const y = -PLATE_H / 2 + 1 + ((PLATE_H - 2) * i) / (m - 1);
          withLen([
            [-hd, y],
            [hd, y],
          ]);
        }
        return out;
      }
      const cs = charges();
      const bounds = { x0: (G.x0 - 4) / 100, x1: (G.x1 + 4) / 100, y0: (G.y0 - 4) / 100, y1: (G.y1 + 4) / 100 };
      const r0 = 0.9 / 100;
      const opts = { step: 0.0035, maxSteps: 900, stopRadius: 0.008, bounds };
      const arrivals: number[][] = cs.map(() => []);
      cs.forEach((c, i) => {
        if (c.q <= 0) return;
        const m = lineCount(c.q);
        // Liegen gleichnamige Ladungen übereinander, Startwinkel versetzen (sonst decken sich die Linien)
        const same = cs.slice(0, i).filter((o) => o.q > 0 && Math.hypot(o.x - c.x, o.y - c.y) < 0.005).length;
        const phase = 0.5 + ([0, 0.5, 0.25][same] ?? 0);
        for (let j = 0; j < m; j++) {
          const a = (TAU * (j + phase)) / m;
          const res = traceLine(cs, c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0, i, opts);
          withLen(res.points.map(([x, y]) => [x * 100, y * 100]));
          if (res.end >= 0) {
            const prev = res.points[res.points.length - 2] ?? res.points[0]!;
            arrivals[res.end]!.push(Math.atan2(prev[1] - cs[res.end]!.y, prev[0] - cs[res.end]!.x));
          }
        }
      });
      // negative Ladungen: fehlende Linien rückwärts ergänzen (in die größten Lücken)
      cs.forEach((c, i) => {
        if (c.q >= 0) return;
        const need = lineCount(c.q) - arrivals[i]!.length;
        const angles = [...arrivals[i]!];
        for (let j = 0; j < need; j++) {
          let a: number;
          if (!angles.length) a = (TAU * (j + 0.5)) / Math.max(1, need);
          else {
            const sorted = [...angles].sort((u, v) => u - v);
            let best = 0;
            let gap = -1;
            for (let q = 0; q < sorted.length; q++) {
              const cur = sorted[q]!;
              const next = q + 1 < sorted.length ? sorted[q + 1]! : sorted[0]! + TAU;
              if (next - cur > gap) {
                gap = next - cur;
                best = cur + gap / 2;
              }
            }
            a = best;
          }
          angles.push(((a + Math.PI) % TAU) - Math.PI);
          const res = traceLine(cs, c.x + Math.cos(a) * r0, c.y + Math.sin(a) * r0, i, { ...opts, backward: true });
          // rückwärts verfolgt: für die Pfeilrichtung umdrehen
          withLen(res.points.map(([x, y]) => [x * 100, y * 100] as [number, number]).reverse());
        }
      });
      return out;
    }

    function buildHeat(G: Geo): HTMLCanvasElement {
      const cell = 4;
      const w = Math.ceil(G.r.w / cell);
      const h = Math.ceil(G.r.h / cell);
      const cv = document.createElement('canvas');
      cv.width = w;
      cv.height = h;
      const cg = cv.getContext('2d')!;
      const img = cg.createImageData(w, h);
      const lo = blue();
      const mid = ctx.theme.series[4]!;
      const hi = orange();
      const parse = (c: string) => {
        const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i.exec(c.trim());
        return m ? [parseInt(m[1]!, 16), parseInt(m[2]!, 16), parseInt(m[3]!, 16)] : [120, 120, 200];
      };
      const [lr, lg, lb] = parse(lo);
      const [mr, mg, mb] = parse(mid);
      const [hr, hg, hb] = parse(hi);
      let o = 0;
      for (let j = 0; j < h; j++) {
        for (let i = 0; i < w; i++) {
          const xm = ((G.r.x + (i + 0.5) * cell - G.cx) / G.k) / 100;
          const ym = ((G.cy - (G.r.y + (j + 0.5) * cell)) / G.k) / 100;
          const [ex, ey] = E(xm, ym);
          const m = Math.hypot(ex, ey);
          // logarithmische Skala 10 … 10⁵ N/C
          const u = clamp((Math.log10(Math.max(m, 1)) - 1) / 4, 0, 1);
          let r: number;
          let g: number;
          let b: number;
          if (u < 0.5) {
            const s = u / 0.5;
            r = lr! + (mr! - lr!) * s;
            g = lg! + (mg! - lg!) * s;
            b = lb! + (mb! - lb!) * s;
          } else {
            const s = (u - 0.5) / 0.5;
            r = mr! + (hr! - mr!) * s;
            g = mg! + (hg! - mg!) * s;
            b = mb! + (hb! - mb!) * s;
          }
          img.data[o] = r;
          img.data[o + 1] = g;
          img.data[o + 2] = b;
          img.data[o + 3] = Math.round(255 * (m < 10 ? 0 : (ctx.theme.dark ? 0.12 : 0.09) + 0.3 * u));
          o += 4;
        }
      }
      cg.putImageData(img, 0, 0);
      return cv;
    }

    /** Äquipotentiallinien (Marching Squares auf einem groben Gitter). */
    function buildEqui(G: Geo): { pts: [number, number][]; v: number }[] {
      const out: { pts: [number, number][]; v: number }[] = [];
      if (isPlates()) {
        const hd = p.d / 2;
        for (let i = 1; i < 5; i++) {
          const x = -hd + (p.d * i) / 5;
          out.push({
            pts: [
              [x, -PLATE_H / 2],
              [x, PLATE_H / 2],
            ],
            v: (p.U * (5 - i)) / 5,
          });
        }
        return out;
      }
      const cs = charges();
      const nx = Math.ceil(G.r.w / 6);
      const ny = Math.ceil(G.r.h / 6);
      const vals = new Float64Array((nx + 1) * (ny + 1));
      const xAt = (i: number) => G.x0 + ((G.x1 - G.x0) * i) / nx;
      const yAt = (j: number) => G.y1 - ((G.y1 - G.y0) * j) / ny;
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) vals[j * (nx + 1) + i] = potentialAt(cs, xAt(i) / 100, yAt(j) / 100);
      const levels = [20, 50, 100, 200, 400, 800].flatMap((v) => [v, -v]);
      for (const lv of levels) {
        const segs: [number, number][] = [];
        for (let j = 0; j < ny; j++) {
          for (let i = 0; i < nx; i++) {
            const a = vals[j * (nx + 1) + i]!;
            const b = vals[j * (nx + 1) + i + 1]!;
            const c = vals[(j + 1) * (nx + 1) + i + 1]!;
            const d = vals[(j + 1) * (nx + 1) + i]!;
            const pts: [number, number][] = [];
            const edge = (v1: number, v2: number, x1: number, y1: number, x2: number, y2: number) => {
              if ((v1 - lv) * (v2 - lv) < 0) {
                const t = (lv - v1) / (v2 - v1);
                pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
              }
            };
            edge(a, b, xAt(i), yAt(j), xAt(i + 1), yAt(j));
            edge(b, c, xAt(i + 1), yAt(j), xAt(i + 1), yAt(j + 1));
            edge(c, d, xAt(i + 1), yAt(j + 1), xAt(i), yAt(j + 1));
            edge(d, a, xAt(i), yAt(j + 1), xAt(i), yAt(j));
            if (pts.length >= 2) segs.push(pts[0]!, pts[1]!);
            if (pts.length === 4) segs.push(pts[2]!, pts[3]!);
          }
        }
        if (segs.length) out.push({ pts: segs, v: lv });
      }
      return out;
    }

    function ensureCache(G: Geo, smooth: boolean): void {
      const key = cacheKey(G);
      if (key === cache.key) return;
      if (smooth && cache.key && !prefersReducedMotion()) {
        prevCache = cache;
        fade.play();
      } else prevCache = null;
      cache = { key, lines: buildLines(G), equi: buildEqui(G), heat: buildHeat(G) };
    }

    /* ---------- Zeichenhilfen ---------- */
    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      g.font = `${weight} ${size}px ${ctx.theme.font}`;
      return g.measureText(str).width;
    }
    function textAt(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      g.font = `${weight} ${size}px ${ctx.theme.font}`;
      g.textAlign = align;
      g.textBaseline = 'middle';
      if (halo) {
        g.lineWidth = 3.5;
        g.lineJoin = 'round';
        g.strokeStyle = halo;
        g.strokeText(str, x, y);
      }
      g.fillStyle = color;
      g.fillText(str, x, y);
      return g.measureText(str).width;
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.5);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      textAt(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center');
      return { x: x0, y, w, h };
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }

    /** Pfeillänge in Pixel (proportional zu E, gekappt); beim Kondensator kürzer und höchstens 0,8 · d. */
    function arrowLen(m: number, G: Geo): { len: number; capped: boolean } {
      const raw = isPlates() ? (m / 1000) * 0.4 * G.k : m * (G.sm ? 0.034 : 0.042);
      // Kondensator: Pfeil endet vor der negativen Platte
      const cap = isPlates() ? Math.max(0.9 * (p.d / 2 - p.px), 1.5) * G.k : G.sm ? 110 : 150;
      return { len: Math.min(raw, cap), capped: raw > cap };
    }

    /* ---------- Szene ---------- */
    let lastGeo: Geo | null = null;
    /** Belegte Flächen (Ladungen und ihre Beschriftungen) im aktuellen Bild, damit die E-Pille sie nicht verdeckt. */
    let obstacles: Rect[] = [];
    const overlap = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    let grab: Grab | null = null;
    let hover: Grab | null = null;

    function drawLines(G: Geo, c: Cache, alpha: number, grow: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = withAlpha(theme.text, theme.dark ? 0.62 : 0.55);
      g.lineWidth = G.sm ? 1.3 : 1.6;
      g.lineJoin = 'round';
      for (const ln of c.lines) {
        const limit = ln.len * grow;
        g.beginPath();
        let acc = 0;
        ln.pts.forEach(([x, y], i) => {
          if (i) {
            const prev = ln.pts[i - 1]!;
            acc += Math.hypot(x - prev[0], y - prev[1]);
            if (acc > limit) return;
            g.lineTo(X(G, x), Y(G, y));
          } else g.moveTo(X(G, x), Y(G, y));
        });
        g.stroke();
      }
      // wandernde Pfeilspitzen (Richtung von E)
      const spacing = 70 / G.k;
      g.fillStyle = withAlpha(theme.text, theme.dark ? 0.85 : 0.75);
      for (const ln of c.lines) {
        if (ln.len < spacing * 0.8) continue;
        for (let s = ((flow * 10) % spacing + spacing) % spacing + spacing * 0.4; s < ln.len * grow - 1; s += spacing) {
          let acc = 0;
          for (let i = 1; i < ln.pts.length; i++) {
            const a = ln.pts[i - 1]!;
            const b = ln.pts[i]!;
            const l = Math.hypot(b[0] - a[0], b[1] - a[1]);
            if (acc + l >= s) {
              const u = (s - acc) / l;
              const x = X(G, a[0] + (b[0] - a[0]) * u);
              const y = Y(G, a[1] + (b[1] - a[1]) * u);
              const ang = Math.atan2(-(b[1] - a[1]), b[0] - a[0]);
              const h = G.sm ? 5 : 6;
              g.beginPath();
              g.moveTo(x + Math.cos(ang) * h, y + Math.sin(ang) * h);
              g.lineTo(x + Math.cos(ang + 2.5) * h, y + Math.sin(ang + 2.5) * h);
              g.lineTo(x + Math.cos(ang - 2.5) * h, y + Math.sin(ang - 2.5) * h);
              g.closePath();
              g.fill();
              break;
            }
            acc += l;
          }
        }
      }
      g.restore();
    }

    function drawEqui(G: Geo, c: Cache, alpha: number): void {
      if (alpha < 0.01 || !c.equi.length) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = withAlpha(green(), 0.85);
      g.lineWidth = 1.4;
      g.setLineDash([4, 4]);
      for (const e of c.equi) {
        g.beginPath();
        if (isPlates()) {
          g.moveTo(X(G, e.pts[0]![0]), Y(G, e.pts[0]![1]));
          g.lineTo(X(G, e.pts[1]![0]), Y(G, e.pts[1]![1]));
        } else
          for (let i = 0; i + 1 < e.pts.length; i += 2) {
            g.moveTo(X(G, e.pts[i]![0]), Y(G, e.pts[i]![1]));
            g.lineTo(X(G, e.pts[i + 1]![0]), Y(G, e.pts[i + 1]![1]));
          }
        g.stroke();
      }
      g.setLineDash([]);
      if (isPlates() && p.val) {
        // nur so viele Beschriftungen, wie nebeneinander Platz haben
        const size = G.sm ? 10 : 11;
        const gap = (p.d / 5) * G.k;
        const wMax = richWidth(`${n(p.U, 0)} V`, size) + 8;
        const every = clamp(Math.ceil(wMax / gap), 1, 4);
        c.equi.forEach((e, i) => {
          if ((i + 1) % every === 0) textAt(`${n(e.v, 0)} V`, X(G, e.pts[0]![0]), Y(G, e.pts[1]![1]) - 9, size, green(), 'center', 700, haloCol());
        });
      }
      g.restore();
    }

    function drawCharge(G: Geo, c: { x: number; y: number; q: number }, idx: number, pop: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const x = X(G, c.x);
      const y = Y(G, c.y);
      const r = (G.sm ? 11 : 14) * (0.75 + 0.25 * Math.min(1, Math.sqrt(Math.abs(c.q) / 2))) * pop;
      if (r < 0.5) return;
      obstacles.push({ x: x - r - 2, y: y - r - 2, w: 2 * r + 4, h: 2 * r + 4 });
      const col = c.q > 0 ? red() : c.q < 0 ? blue() : theme.muted;
      const hot = hover === (`c${idx}` as Grab) || grab === (`c${idx}` as Grab);
      if (hot && !ctx.locked) {
        g.fillStyle = withAlpha(col, 0.25);
        g.beginPath();
        g.arc(x, y, r + 9, 0, TAU);
        g.fill();
      }
      g.save();
      g.shadowColor = withAlpha(col, 0.55);
      g.shadowBlur = 14;
      const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      gr.addColorStop(0, mixColor(col, '#ffffff', 0.55));
      gr.addColorStop(0.55, col);
      gr.addColorStop(1, mixColor(col, '#000000', 0.35));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = '#ffffff';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x - r * 0.45, y);
      g.lineTo(x + r * 0.45, y);
      if (c.q > 0) {
        g.moveTo(x, y - r * 0.45);
        g.lineTo(x, y + r * 0.45);
      }
      g.stroke();
      if (p.val && pop > 0.9) {
        const q = c.q / NC;
        const lab = `Q${['₁', '₂', '₃'][idx]} = ${q > 0 ? '+' : q < 0 ? '−' : ''}${n(Math.abs(q), 1)} nC`;
        // Beschriftung nach oben, wenn eine frühere Ladung darunter zu nah wäre
        const lw = richWidth(lab, G.sm ? 10.5 : 11.5) + 6;
        const clash = charges()
          .slice(0, idx)
          .some((o) => Math.abs(X(G, o.x * 100) - x) < lw && Math.abs(Y(G, o.y * 100) - y) < 30);
        const ly = clash ? y - r - (G.sm ? 11 : 13) : y + r + (G.sm ? 11 : 13);
        textAt(lab, x, ly, G.sm ? 10.5 : 11.5, col, 'center', 750, haloCol());
        obstacles.push({ x: x - lw / 2, y: ly - 8, w: lw, h: 16 });
      }
    }

    function drawPlates(G: Geo, ik: number): void {
      const g = surface.g;
      const hd = p.d / 2;
      g.save();
      g.globalAlpha *= ik;
      for (const [side, col, sign] of [
        [-1, red(), '+'],
        [1, blue(), '−'],
      ] as const) {
        const x = X(G, side * hd);
        const t = G.sm ? 7 : 9;
        g.save();
        g.shadowColor = withAlpha(col, 0.4);
        g.shadowBlur = 10;
        const pg = g.createLinearGradient(x - t / 2, 0, x + t / 2, 0);
        pg.addColorStop(0, mixColor(col, '#000000', 0.25));
        pg.addColorStop(0.5, mixColor(col, '#ffffff', 0.25));
        pg.addColorStop(1, mixColor(col, '#000000', 0.25));
        g.fillStyle = pg;
        roundRect(g, x - t / 2, Y(G, PLATE_H / 2), t, PLATE_H * G.k, 3);
        g.fill();
        g.restore();
        for (let i = 0; i < 7; i++) {
          const y = Y(G, -PLATE_H / 2 + 1.5 + ((PLATE_H - 3) * i) / 6);
          // Zeichen innen an der Platte; bei engem Spalt außen, damit sich + und − nicht berühren
          const inner = p.d * G.k > 2 * (t + 8) + 24;
          textAt(sign, x + (inner ? -1 : 1) * side * (t + 8), y, G.sm ? 13 : 15, col, 'center', 800);
        }
      }
      // Spannung und Abstand
      const yb = Y(G, -PLATE_H / 2) + (G.sm ? 16 : 20);
      const xa = X(G, -hd);
      const xb = X(G, hd);
      g.strokeStyle = ctx.theme.muted;
      g.lineWidth = 1;
      arrowPx((xa + xb) / 2, yb, xa + 2, yb, ctx.theme.muted, 1.2, 6);
      arrowPx((xa + xb) / 2, yb, xb - 2, yb, ctx.theme.muted, 1.2, 6);
      textAt(`d = ${n(p.d, 0)} cm · U = ${n(p.U, 0)} V`, (xa + xb) / 2, yb + 13, G.sm ? 10.5 : 11.5, ctx.theme.text, 'center', 700, haloCol());
      g.restore();
    }

    const r0Probe = 9;
    function drawProbe(G: Geo, ik: number): void {
      const a = ease2('probeA', p.probe ? 1 : 0, 7) * ik;
      if (a < 0.01) {
        probePx = null;
        return;
      }
      const g = surface.g;
      const theme = ctx.theme;
      const px = ease2('px', p.px, 14, grab === 'probe');
      const py = ease2('py', p.py, 14, grab === 'probe');
      const [ex, ey] = E(px / 100, py / 100);
      const m = Math.hypot(ex, ey);
      const x = X(G, px);
      const y = Y(G, py);
      probePx = { x, y };
      const cs = charges();
      const near = cs.some((c) => Math.hypot(c.x * 100 - px, c.y * 100 - py) < 1.2);
      g.save();
      g.globalAlpha *= a;
      // Kraftpfeil (Länge ∝ |E|, gekappt)
      if (m > 1 && !near) {
        const { len, capped } = arrowLen(m, G);
        const ux = ex / m;
        const uy = -ey / m;
        g.save();
        g.shadowColor = withAlpha(orange(), 0.5);
        g.shadowBlur = 6;
        arrowPx(x, y, x + ux * len, y + uy * len, orange(), G.sm ? 3 : 3.6, G.sm ? 10 : 12);
        g.restore();
        if (capped) textAt('≫', x + ux * (len + 12), y + uy * (len + 12), 13, orange(), 'center', 800, haloCol());
        if (p.val) {
          const lab = `E = ${n(Math.round(m), 0)} N/C`;
          const size = G.sm ? 10.5 : 12;
          const pw = richWidth(lab, size) + 16;
          const ph = size + 11;
          // Kandidaten: neben der Pfeilmitte, sonst über/unter/links/rechts der Probeladung;
          // gewählt wird der erste, der weder Ladungen noch Beschriftungen, q₀ oder den Pfeil verdeckt.
          const mx = x + ux * len * 0.5;
          const my = y + uy * len * 0.5;
          const steep = Math.abs(uy) > 0.7;
          const cands: [number, number][] = [
            [mx + (steep ? 12 : 0), my - (steep ? 0 : 26)],
            [mx + (steep ? 12 : 0), my + (steep ? 0 : 8)],
            [mx - pw - 12, my - ph / 2],
            [x - pw / 2, y - r0Probe - ph - 22],
            [x - pw / 2, y + r0Probe + 10],
            [x + 16, y - ph / 2],
            [x - pw - 16, y - ph / 2],
          ];
          const probeBox: Rect = { x: x - 30, y: y - 24, w: 42, h: 36 };
          let best: Rect | null = null;
          for (const [cx0, cy0] of cands) {
            const rc: Rect = { x: clamp(cx0, G.r.x + 8, G.r.x + G.r.w - 8 - pw), y: clamp(cy0, G.r.y + 40, G.r.y + G.r.h - 30), w: pw, h: ph };
            best ??= rc;
            const onArrow = [0.2, 0.4, 0.6, 0.8, 1].some((t) => overlap(rc, { x: x + ux * len * t, y: y + uy * len * t, w: 0, h: 0 }));
            const blocked = onArrow || [...obstacles, probeBox].some((o) => overlap(rc, o));
            if (!blocked) {
              best = rc;
              break;
            }
          }
          pill(best!.x, best!.y, lab, orange(), 'left', size);
        }
      }
      const hot = hover === 'probe' || grab === 'probe';
      const r = G.sm ? 7 : 8.5;
      if (hot && !ctx.locked) {
        g.fillStyle = withAlpha(orange(), 0.3);
        g.beginPath();
        g.arc(x, y, r + 8, 0, TAU);
        g.fill();
      }
      const gr = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      gr.addColorStop(0, '#fff6d6');
      gr.addColorStop(0.6, '#f2c14e');
      gr.addColorStop(1, '#a6741a');
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.strokeStyle = theme.dark ? '#1b1f25' : '#5a3e0e';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x - r * 0.45, y);
      g.lineTo(x + r * 0.45, y);
      g.moveTo(x, y - r * 0.45);
      g.lineTo(x, y + r * 0.45);
      g.stroke();
      textAt(ctx.t('q0'), x - r - 4, y - r - 4, G.sm ? 11 : 12, theme.text, 'right', 750, haloCol());
      if (near) textAt(ctx.t('near'), x, y + r + 14, 11, theme.muted, 'center', 650, haloCol());
      g.restore();
    }
    let probePx: { x: number; y: number } | null = null;

    function drawScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const G = geo(r);
      lastGeo = G;
      ensureCache(G, grab === null);
      const ik = stage(0, 0.5);
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      // Hintergrund mit cm-Gitter
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, theme.dark ? '#141c29' : '#fbfcfe');
      bg.addColorStop(1, theme.dark ? '#0f1520' : '#f1f4f9');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
      const heatA = ease2('heatA', p.heat ? 1 : 0, 6) * stage(0.1, 0.6);
      if (heatA > 0.01) {
        g.save();
        g.globalAlpha *= heatA;
        g.imageSmoothingEnabled = true;
        if (prevCache?.heat && fade.running) {
          g.globalAlpha *= 1 - fade.value;
          g.drawImage(prevCache.heat, r.x, r.y, prevCache.heat.width * 4, prevCache.heat.height * 4);
          g.globalAlpha /= Math.max(1e-3, 1 - fade.value);
          g.globalAlpha *= fade.value;
        }
        if (cache.heat) g.drawImage(cache.heat, r.x, r.y, cache.heat.width * 4, cache.heat.height * 4);
        g.restore();
      }
      g.strokeStyle = theme.gridMinor;
      g.lineWidth = 1;
      g.beginPath();
      for (let xc = Math.ceil(G.x0 / 5) * 5; xc <= G.x1; xc += 5) {
        g.moveTo(Math.round(X(G, xc)) + 0.5, r.y);
        g.lineTo(Math.round(X(G, xc)) + 0.5, r.y + r.h);
      }
      for (let yc = Math.ceil(G.y0 / 5) * 5; yc <= G.y1; yc += 5) {
        g.moveTo(r.x, Math.round(Y(G, yc)) + 0.5);
        g.lineTo(r.x + r.w, Math.round(Y(G, yc)) + 0.5);
      }
      g.stroke();
      const grow = stage(0.2, 0.9, ease.inOutCubic);
      const eqA = ease2('eqA', p.eq ? 1 : 0, 6) * ik;
      if (prevCache && fade.running) {
        drawEqui(G, prevCache, eqA * (1 - fade.value));
        drawLines(G, prevCache, 1 - fade.value, 1);
        drawEqui(G, cache, eqA * fade.value);
        drawLines(G, cache, fade.value, 1);
      } else {
        drawEqui(G, cache, eqA);
        drawLines(G, cache, ik, grow);
      }
      obstacles = [];
      if (isPlates()) drawPlates(G, ik);
      else
        charges().forEach((c, i) => {
          const pop = intro.running ? ease.outBack(clamp((intro.t - i * 0.08) / 0.35, 0, 1)) : ease2(`pop${i}`, 1, 9);
          drawCharge(G, { x: c.x * 100, y: c.y * 100, q: c.q }, i, pop);
        });
      drawProbe(G, stage(0.5, 0.4));
      // Kopfzeile und Maßstab
      const title = isPlates() ? ctx.t(G.sm ? 'platesS' : 'plates') : ctx.t('title');
      textAt(title, r.x + 14, r.y + (G.sm ? 16 : 19), G.sm ? 12 : 13, theme.text, 'left', 750, haloCol());
      if (isPlates()) textAt(ctx.t('ideal'), r.x + 14, r.y + (G.sm ? 32 : 37), G.sm ? 10 : 11, theme.muted, 'left', 600, haloCol());
      const sb = 10 * G.k;
      const sx = r.x + r.w - 16 - sb;
      const sy = r.y + r.h - 16;
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(sx, sy - 5);
      g.lineTo(sx, sy);
      g.lineTo(sx + sb, sy);
      g.lineTo(sx + sb, sy - 5);
      g.stroke();
      textAt(ctx.t('scale'), sx + sb / 2, sy - 10, G.sm ? 10.5 : 11, theme.text, 'center', 700, haloCol());
      g.restore();
    }

    /* ---------- Karte „Feld bei der Probeladung“ ---------- */
    function drawInfo(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 300 || R.h < 220;
      const pad = sm ? 12 : 16;
      let y = R.y + (sm ? 17 : 20);
      textAt(ctx.t(R.w < 260 ? 'infoTitleS' : 'infoTitle'), R.x + pad, y, sm ? 12 : 13, theme.text, 'left', 750);
      const fs = sm ? 11 : 12;
      const lh = sm ? 18 : 22;
      y += sm ? 22 : 28;
      const px = p.px / 100;
      const py = p.py / 100;
      const [ex, ey] = E(px, py);
      const m = Math.hypot(ex, ey);
      const v = p.val;
      if (!p.probe) {
        textAt(ctx.t('none'), R.x + pad, y, fs, theme.muted, 'left', 600);
      } else if (isPlates()) {
        textAt('E = U / d', R.x + pad, y, fs + 2, theme.text, 'left', 750);
        y += lh + 2;
        textAt(`= ${n(p.U, 0)} V / ${fx(p.d / 100, 2)} m`, R.x + pad, y, fs, theme.muted, 'left', 650);
        y += lh;
        textAt(`= ${v ? n(Math.round(plateField(p.U, p.d / 100)), 0) : '?'} N/C`, R.x + pad, y, fs + 2, orange(), 'left', 800);
        y += lh + 4;
        const out = m > 0 ? '' : ctx.lang === 'de' ? '(außen) ' : '(outside) ';
        textAt(`${out}E(q₀) = ${v ? n(Math.round(m), 0) : '?'} N/C`, R.x + pad, y, fs, theme.text, 'left', 700);
        y += lh;
        textAt(`F = q₀ · E = ${v ? fFmt(m * Q0 * 1e6) : '?'} µN`, R.x + pad, y, fs, theme.text, 'left', 700);
      } else {
        textAt('E = k · |Q| / r²', R.x + pad, y, fs + 2, theme.text, 'left', 750);
        y += lh + 2;
        const on = chargeAt(charges(), px, py) >= 0;
        charges().forEach((c, i) => {
          const r = Math.hypot(px - c.x, py - c.y);
          const Ei = pointField(c.q, r);
          const col = c.q > 0 ? red() : c.q < 0 ? blue() : theme.muted;
          let lab = `E${['₁', '₂', '₃'][i]} = ${v && Number.isFinite(Ei) ? n(Math.round(Ei), 0) : '?'} N/C  (r = ${fx(r * 100, 1)} cm)`;
          let s = fs;
          while (s > 9.5 && richWidth(lab, s, 700) > R.w - 2 * pad) s -= 0.5;
          if (s <= 9.5) lab = `E${['₁', '₂', '₃'][i]} = ${v && Number.isFinite(Ei) ? n(Math.round(Ei), 0) : '?'} N/C`;
          textAt(lab, R.x + pad, y, s, col, 'left', 700);
          y += lh;
        });
        y += 4;
        g.strokeStyle = theme.grid;
        g.beginPath();
        g.moveTo(R.x + pad, y - lh / 2);
        g.lineTo(R.x + R.w - pad, y - lh / 2);
        g.stroke();
        y += 4;
        if (on) {
          // r = 0: Feldstärke nicht definiert (Division durch 0)
          textAt(ctx.t('onChargeS'), R.x + pad, y, fs + 2, orange(), 'left', 800);
          y += 2 * lh + 2;
        } else {
          textAt(`E = ${v ? n(Math.round(m), 0) : '?'} N/C`, R.x + pad, y, fs + 4, orange(), 'left', 800);
          y += lh + 2;
          const ang = (Math.atan2(ey, ex) * 180) / Math.PI;
          if (v && m >= 0.5) textAt(tr('dirL', { a: n(Math.round(ang), 0) }), R.x + pad, y, fs, theme.muted, 'left', 650);
          y += lh;
          textAt(`F = q₀ · E = ${v ? fFmt(m * Q0 * 1e6) : '?'} µN`, R.x + pad, y, fs, theme.text, 'left', 700);
        }
        y += lh;
        // Vektoraddition: Einzelfelder aneinandergehängt, Summe in Orange
        const boxTop = y + 4;
        const boxBot = R.y + R.h - (sm ? 34 : 42) - (p.heat ? 30 : 0);
        if (boxBot - boxTop > 90 && m > 1 && !on) drawVectorSum({ x: R.x + pad, y: boxTop, w: R.w - 2 * pad, h: boxBot - boxTop }, px, py, sm);
      }
      // Farbskala der Feldstärke
      const hA = ease2('heatA2', p.heat ? 1 : 0, 6);
      const by = R.y + R.h - (sm ? 34 : 42);
      if (hA > 0.02 && by > y + 30) {
        g.save();
        g.globalAlpha *= hA;
        textAt(ctx.t('heatTitle'), R.x + pad, by - 14, sm ? 10.5 : 11, theme.muted, 'left', 650);
        const bw = R.w - 2 * pad;
        const grad = g.createLinearGradient(R.x + pad, 0, R.x + pad + bw, 0);
        grad.addColorStop(0, withAlpha(blue(), 0.45));
        grad.addColorStop(0.5, withAlpha(ctx.theme.series[4]!, 0.55));
        grad.addColorStop(1, withAlpha(orange(), 0.75));
        g.fillStyle = grad;
        roundRect(g, R.x + pad, by, bw, 8, 4);
        g.fill();
        const labs = ['10', '100', '10³', '10⁴', '10⁵'];
        labs.forEach((l, i) => textAt(l, R.x + pad + (bw * i) / 4, by + 18, sm ? 9.5 : 10, theme.muted, i === 0 ? 'left' : i === 4 ? 'right' : 'center', 600));
        g.restore();
      }
      g.restore();
    }

    /** Kleines Vektorbild: E⃗₁ + E⃗₂ (+ E⃗₃) = E⃗, maßstäblich in den Kasten eingepasst. */
    function drawVectorSum(B: Rect, px: number, py: number, sm: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const cs = charges();
      const vecs = cs.map((c) => {
        const [vx, vy] = fieldAt([c], px, py);
        return { vx, vy, col: c.q > 0 ? red() : c.q < 0 ? blue() : theme.muted };
      });
      if (vecs.length < 2) return;
      // Ausdehnung der Kette (y nach oben)
      const pts: [number, number][] = [[0, 0]];
      let sx = 0;
      let sy = 0;
      for (const v of vecs) {
        sx += v.vx;
        sy += v.vy;
        pts.push([sx, sy]);
      }
      const xs = pts.map((q) => q[0]);
      const ys = pts.map((q) => q[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const titleH = 18;
      const iw = B.w - 16;
      const ih = B.h - titleH - 16;
      const span = Math.max(maxX - minX, maxY - minY, 1e-9);
      const sc = Math.min(iw / Math.max(maxX - minX, span * 0.25), ih / Math.max(maxY - minY, span * 0.25));
      if (!Number.isFinite(sc) || sc <= 0) return;
      const ox = B.x + 8 + (iw - (maxX - minX) * sc) / 2 - minX * sc;
      const oy = B.y + titleH + 8 + (ih - (maxY - minY) * sc) / 2 + maxY * sc;
      textAt(ctx.lang === 'de' ? 'Vektoraddition' : 'Vector addition', B.x, B.y + 6, sm ? 10.5 : 11, theme.muted, 'left', 650);
      g.save();
      g.globalAlpha *= 0.9;
      arrowPx(ox, oy, ox + sx * sc, oy - sy * sc, orange(), sm ? 3 : 3.4, 10);
      g.restore();
      let ax = ox;
      let ay = oy;
      vecs.forEach((v) => {
        const bx = ax + v.vx * sc;
        const by = ay - v.vy * sc;
        if (Math.hypot(bx - ax, by - ay) > 4) arrowPx(ax, ay, bx, by, v.col, 2, 8);
        ax = bx;
        ay = by;
      });
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      if (!p.probe) {
        ctx.readout('E', ctx.t('none'));
        ctx.readout('F', null);
        ctx.readout('phi', null);
        return;
      }
      const px = p.px / 100;
      const py = p.py / 100;
      const [ex, ey] = E(px, py);
      const m = Math.hypot(ex, ey);
      const ang = (Math.atan2(ey, ex) * 180) / Math.PI;
      if (isPlates()) {
        ctx.readout('E', { html: tr('Eplates', { U: n(p.U, 0), d: fx(p.d / 100, 2), E: n(Math.round(plateField(p.U, p.d / 100)), 0) }) });
        const inside = m > 0;
        const s = p.d / 2 - p.px;
        ctx.readout('phi', { html: inside ? tr('phiPlates', { V: n(Math.round(plateField(p.U, p.d / 100) * (s / 100)), 0), s: fx(s, 1) }) : ctx.t('phiOut') });
      } else {
        const cs = charges();
        // Probeladung genau auf einer Ladung: r = 0, Feldstärke nicht definiert
        const on = chargeAt(cs, px, py);
        if (on >= 0) {
          ctx.readout('E', { html: tr('onCharge', { i: String(on + 1) }) });
          ctx.readout('F', null);
          ctx.readout('phi', null);
          return;
        }
        const list = cs
          .map((c, i) => {
            if (c.q === 0) return tr('zeroQ', { i: String(i + 1) });
            const r = Math.hypot(px - c.x, py - c.y);
            const Ei = pointField(c.q, r);
            const dir = tr(c.q > 0 ? 'away' : 'toward', { i: String(i + 1) });
            return tr('Ei', { i: String(i + 1), q: n(Math.abs(c.q) / NC, 1), r: fx(r, 3), E: n(Math.round(Ei), 0), dir });
          })
          .join('<br>');
        // Betrag unter 0,5 N/C wird als 0 angezeigt: dann ist keine Richtung sinnvoll
        ctx.readout('E', { html: m < 0.5 ? tr('Ezero', { list }) : tr('E', { list, E: n(Math.round(m), 0), a: n(Math.round(ang), 0) }) });
        ctx.readout('phi', { html: tr('phi', { V: n(Math.round(potentialAt(cs, px, py)), 0) }) });
      }
      ctx.readout('F', { html: tr('F', { E: n(Math.round(m), 0), F: fFmt(m * Q0 * 1e6) }) });
    }

    /* ---------- Ziehen ---------- */
    function hitTest(px: number, py: number): Grab | null {
      const G = lastGeo;
      if (!G || ctx.locked) return null;
      let best: Grab | null = null;
      let bd = G.sm ? 26 : 24;
      if (probePx && p.probe) {
        const d = Math.hypot(px - probePx.x, py - probePx.y);
        if (d < bd) {
          bd = d;
          best = 'probe';
        }
      }
      if (!isPlates())
        charges().forEach((c, i) => {
          const d = Math.hypot(px - X(G, c.x * 100), py - Y(G, c.y * 100));
          if (d < bd) {
            bd = d;
            best = `c${i}` as Grab;
          }
        });
      return best;
    }
    function dragTo(px: number, py: number): void {
      const G = lastGeo;
      if (!G || !grab) return;
      const xc = Math.round(clamp((px - G.cx) / G.k, -24, 24) * 2) / 2;
      const yc = Math.round(clamp((G.cy - py) / G.k, -14, 14) * 2) / 2;
      if (grab === 'probe') ctx.set({ px: xc, py: yc });
      else {
        const i = Number(grab[1]) + 1;
        ctx.set({ [`x${i}`]: clamp(xc, -22, 22), [`y${i}`]: yc } as Record<string, number>);
      }
    }
    surface.addTarget({
      contains: (px: number, py: number) => hitTest(px, py) !== null,
      pointerDown: (q: { px: number; py: number }) => {
        const h = hitTest(q.px, q.py);
        if (!h) return false;
        grab = h;
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (grab) dragTo(q.px, q.py);
      },
      pointerUp: () => {
        grab = null;
        surface.setCursor(hover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitTest(q.px, q.py) : null;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'init') {
          intro.play();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        }
        if (changed.has('n') && source !== 'init') for (let i = 0; i < 3; i++) if (i >= p.n) soft.set(`pop${i}`, 0);
        if (changed.has('n')) for (let i = 0; i < p.n; i++) if (!soft.has(`pop${i}`) || source === 'init') soft.set(`pop${i}`, source === 'init' ? 1 : 0);
        if (source === 'replace' && !prefersReducedMotion()) ctx.clock.play();
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        flow += dt;
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        const lay = computeLayout();
        surface.begin();
        drawScene(lay.scene);
        drawInfo(lay.info, stage(0.3, 0.5));
        if (animating || intro.running || fade.running || grab || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
