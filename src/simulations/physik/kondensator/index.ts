import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { currentAt, energy, halfLife, timeConstant, voltageAt } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Größte einstellbare Quellenspannung in V (für die Darstellung). */
const U_MAX = 12;

interface Lay {
  side: boolean;
  scene: Rect;
  info: Rect;
  chartU: Rect;
  chartI: Rect;
}

/** Punkte eines Stromkreises (Pixel) und ob ein Abschnitt unsichtbar ist (Lücke im Kondensator, Quelle). */
interface Loop {
  pts: [number, number][];
  hide: boolean[];
  len: number[];
  total: number;
}

/** Schöne Zahl ≥ v aus der Reihe 1 – 1,5 – 2 – 2,5 – 3 – 4 – 5 – 6 – 8 – 10. */
function niceCeil(v: number): number {
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * e >= v * 0.999) return m * e;
  return 10 * e;
}
/** Teilstrich-Abstand (1 – 2 – 2,5 – 5) für höchstens `max` Abschnitte. */
function niceStep(span: number, max: number): number {
  const raw = span / max;
  const e = Math.pow(10, Math.floor(Math.log10(raw)));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * e >= raw * 0.999) return m * e;
  return 10 * e;
}
/** Zeitfaktor (Simulationszeit pro echter Sekunde), so dass τ etwa 1–4 s dauert. */
function timeFactor(tau: number): number {
  if (tau >= 0.8 && tau <= 4) return 1;
  let best = 1;
  let bd = Infinity;
  for (let k = -4; k <= 3; k++) {
    for (const m of [1, 2, 5]) {
      const f = m * Math.pow(10, k);
      const d = Math.abs(Math.log((tau / f) / 2));
      if (d < bd) {
        bd = d;
        best = f;
      }
    }
  }
  return best;
}

/**
 * Lade- und Entladekurve des Kondensators: RC-Kreis mit Quelle, Umschalter,
 * Widerstand und Kondensator. Elektronen fließen sichtbar (Geschwindigkeit ∝ I),
 * die Platten laden sich auf. Rechts die Diagramme U_C(t) und I(t) mit
 * Tangente bei t = 0 (trifft den Endwert bei t = τ) und Halbwertszeit.
 * Sehr kleine oder große Zeitkonstanten laufen im Zeitraffer bzw. in Zeitlupe.
 */
export default defineSimulation({
  id: 'kondensator',
  animated: true,
  dragHint: false,
  layout: { aspect: 1.5, aspectNarrow: 0.52 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'sw',
      type: 'choice',
      label: L('Schalter', 'Switch'),
      help: L('Oder: den Schalter im Bild antippen.', 'Or tap the switch in the picture.'),
      options: [
        { value: 'charge', label: L('1: Laden', '1: Charge') },
        { value: 'discharge', label: L('2: Entladen', '2: Discharge') },
      ],
      default: 'charge',
    },
    { key: 'U', type: 'number', label: L('Quellenspannung U₀', 'Source voltage U₀'), min: 1, max: U_MAX, step: 0.5, default: 10, unit: 'V' },
    { key: 'R', type: 'number', label: L('Widerstand R', 'Resistance R'), min: 1, max: 100, step: 1, default: 10, unit: 'kΩ' },
    { key: 'C', type: 'number', label: L('Kapazität C', 'Capacitance C'), min: 10, max: 1000, step: 10, default: 100, unit: 'µF' },
    { key: 'tan', type: 'boolean', group: 'view', label: L('Tangente bei t = 0 und τ', 'Tangent at t = 0 and τ'), default: true },
    { key: 'half', type: 'boolean', group: 'view', label: L('Halbwertszeit t½', 'Half-life t½'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  actions: [
    { id: 'toggle', label: L('Umschalten', 'Toggle switch'), primary: true },
    { id: 'restart', label: L('Vorgang neu starten', 'Restart the process') },
  ],
  readouts: [
    { key: 'tau', label: L('Zeitkonstante', 'Time constant'), spoiler: true },
    { key: 'I0', label: L('Anfangsstrom', 'Initial current'), spoiler: true },
    { key: 'half', label: L('Halbwertszeit', 'Half-life'), spoiler: true },
    { key: 'W', label: L('Energie im vollen Kondensator', 'Energy in the full capacitor'), spoiler: true },
  ],
  presets: [
    { id: 'std', label: L('Laden: 10 kΩ, 100 µF, 10 V', 'Charge: 10 kΩ, 100 µF, 10 V'), values: {} },
    { id: 'dis', label: L('Entladen', 'Discharge'), values: { sw: 'discharge' } },
    { id: 'bigR', label: L('Großer Widerstand (47 kΩ)', 'Large resistance (47 kΩ)'), values: { R: 47 } },
    { id: 'smallC', label: L('Kleine Kapazität (20 µF)', 'Small capacitance (20 µF)'), values: { C: 20 } },
    { id: 'halfL', label: L('Halbwertszeit ablesen', 'Read the half-life'), values: { sw: 'discharge', half: true, tan: false } },
  ],
  strings: {
    de: {
      canvas:
        'Stromkreis mit Spannungsquelle, Umschalter, Widerstand und Kondensator. In Stellung 1 wird der Kondensator geladen, in Stellung 2 über den Widerstand entladen. Kleine Punkte zeigen die fließenden Elektronen, Plus- und Minuszeichen die Ladung auf den Platten. Daneben die Diagramme der Kondensatorspannung und der Stromstärke über der Zeit, mit Tangente, Zeitkonstante τ und Halbwertszeit. Der Schalter lässt sich antippen.',
      circuit: 'RC-Kreis',
      c1: '1 Laden',
      c2: '2 Entladen',
      tapHint: 'antippen',
      electrons: 'Elektronen',
      real: 'Echtzeit',
      fast: 'Zeitraffer ×{f}',
      slow: 'Zeitlupe 1 : {f}',
      chartU: 'Kondensatorspannung U_[C]',
      chartI: 'Stromstärke I',
      axisT: 't in s',
      axisU: 'U in V',
      axisI: 'I in mA',
      axisIu: 'I in µA',
      infoTitle: 'Rechnung',
      charge63: '63 %',
      charge37: '37 %',
      tau: '<var>τ</var> = <var>R</var> · <var>C</var> = {R} kΩ · {C} µF = <strong>{tau} s</strong>',
      I0: '<var>I</var><sub>0</sub> = <span class="frac"><span><var>U</var><sub>0</sub></span><span><var>R</var></span></span> = <span class="frac"><span>{U} V</span><span>{R} kΩ</span></span> = <strong>{I}</strong> (zu Beginn, dann exponentiell fallend)',
      half: '<var>t</var><sub>½</sub> = <var>τ</var> · ln 2 = {tau} s · 0,693 = <strong>{h} s</strong>; nach <var>τ</var> ist die Spannung beim Laden auf 63 % gestiegen, beim Entladen auf 37 % gefallen.',
      W: '<var>W</var> = ½ · <var>C</var> · <var>U</var><sub>0</sub><sup>2</sup> = ½ · {C} µF · ({U} V)<sup>2</sup> = <strong>{W}</strong>',
    },
    en: {
      canvas:
        'Circuit with voltage source, two-way switch, resistor and capacitor. In position 1 the capacitor charges, in position 2 it discharges through the resistor. Small dots show the moving electrons, plus and minus signs the charge on the plates. Next to it the graphs of capacitor voltage and current over time, with tangent, time constant τ and half-life. The switch can be tapped.',
      circuit: 'RC circuit',
      c1: '1 charge',
      c2: '2 discharge',
      tapHint: 'tap',
      electrons: 'electrons',
      real: 'real time',
      fast: 'time lapse ×{f}',
      slow: 'slow motion 1 : {f}',
      chartU: 'Capacitor voltage U_[C]',
      chartI: 'Current I',
      axisT: 't in s',
      axisU: 'U in V',
      axisI: 'I in mA',
      axisIu: 'I in µA',
      infoTitle: 'Calculation',
      charge63: '63 %',
      charge37: '37 %',
      tau: '<var>τ</var> = <var>R</var> · <var>C</var> = {R} kΩ · {C} µF = <strong>{tau} s</strong>',
      I0: '<var>I</var><sub>0</sub> = <span class="frac"><span><var>U</var><sub>0</sub></span><span><var>R</var></span></span> = <span class="frac"><span>{U} V</span><span>{R} kΩ</span></span> = <strong>{I}</strong> (at the start, then decaying exponentially)',
      half: '<var>t</var><sub>½</sub> = <var>τ</var> · ln 2 = {tau} s · 0.693 = <strong>{h} s</strong>; after <var>τ</var> the voltage has risen to 63 % when charging and fallen to 37 % when discharging.',
      W: '<var>W</var> = ½ · <var>C</var> · <var>U</var><sub>0</sub><sup>2</sup> = ½ · {C} µF · ({U} V)<sup>2</sup> = <strong>{W}</strong>',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const blue = () => ctx.theme.series[0]!;
    const red = () => ctx.theme.series[1]!;
    const orange = () => ctx.theme.series[3]!;
    const purple = () => ctx.theme.series[4]!;
    const charging = () => p.sw !== 'discharge';

    /* ---------- Größen in SI ---------- */
    const Rsi = () => p.R * 1e3;
    const Csi = () => p.C * 1e-6;
    const tau = () => timeConstant(Rsi(), Csi());
    /** Zeitfenster der Diagramme (≥ 5 τ). */
    const tEnd = () => niceCeil(5 * tau());

    /** Anzahl Dezimalen für Zeiten passend zur Größenordnung. */
    const tDec = (v: number) => (v >= 10 ? 1 : v >= 1 ? 2 : 3);
    /** Strom mit passender Einheit. */
    function fmtI(A: number, withUnit = true): string {
      const a = Math.abs(A);
      if (a < 1e-3 - 1e-12) return `${A < 0 ? '−' : ''}${fx(a * 1e6, a * 1e6 >= 100 ? 0 : 1)}${withUnit ? ' µA' : ''}`;
      return `${A < 0 ? '−' : ''}${fx(a * 1e3, a * 1e3 >= 10 ? 1 : 2)}${withUnit ? ' mA' : ''}`;
    }
    function fmtW(J: number): string {
      if (J < 1e-4) return `${fx(J * 1e6, J * 1e6 >= 10 ? 1 : 2)} µJ`;
      return `${fx(J * 1e3, J * 1e3 >= 10 ? 1 : 2)} mJ`;
    }

    /* ---------- Zustand des Vorgangs ---------- */
    let t = 0;
    let Ua = 0;
    let Ue = 0;
    let flow = 0;
    const Uc = () => voltageAt(Ua, Ue, t, tau());
    const Inow = () => currentAt(Ua, Ue, t, Rsi(), Csi());

    /** Neuer Vorgang: frisch (leer laden / voll entladen) oder aus dem aktuellen Zustand heraus. */
    function start(fresh: boolean): void {
      const from = fresh ? (charging() ? 0 : p.U) : Uc();
      Ua = from;
      Ue = charging() ? p.U : 0;
      t = 0;
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
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    /** Kurzes Aufleuchten beim Umschalten. */
    const flash = new Tween(600, ease.outCubic);

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const lw = Math.round(w * 0.52);
        const sh = Math.round(h * 0.6);
        const ch = Math.round((h - 10) / 2);
        return {
          side,
          scene: { x: 0, y: 0, w: lw, h: sh },
          info: { x: 0, y: sh + 10, w: lw, h: h - sh - 10 },
          chartU: { x: lw + 12, y: 0, w: w - lw - 12, h: ch },
          chartI: { x: lw + 12, y: ch + 10, w: w - lw - 12, h: h - ch - 10 },
        };
      }
      const sh = Math.round(h * 0.36);
      const ch = Math.round(h * 0.22);
      const ih = h - sh - 2 * ch - 30;
      return {
        side,
        scene: { x: 0, y: 0, w, h: sh },
        chartU: { x: 0, y: sh + 10, w, h: ch },
        chartI: { x: 0, y: sh + ch + 20, w, h: ch },
        info: { x: 0, y: sh + 2 * ch + 30, w, h: ih },
      };
    }

    /* ---------- Zeichenhilfen ---------- */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }
    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }
    function richText(str: string, x0: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start0 = align === 'left' ? x0 : align === 'right' ? x0 - total : x0 - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start0;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${ctx.theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = halo!;
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');

    function pill(x0: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const xa = align === 'left' ? x0 : align === 'right' ? x0 - w : x0 - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, xa, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.5);
        g.lineWidth = 1;
        roundRect(g, xa + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, xa + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center');
      return { x: xa, y, w, h };
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

    /* ---------- Schaltplan ---------- */
    interface Geo {
      r: Rect;
      sm: boolean;
      xL: number;
      xC: number;
      xP: number;
      xR: number;
      yT: number;
      yB: number;
      y2: number;
      yM: number;
      gap: number;
      plate: number;
      resX0: number;
      resX1: number;
      resH: number;
      batTop: number;
      batBot: number;
    }
    function geo(r: Rect): Geo {
      const sm = r.w < 440;
      // links Platz für die Beschriftung der Quelle, rechts nur für die Platten
      const lw = richWidth(u0Label(), sm ? 10.5 : 12, 750);
      const xL = r.x + 18 + lw + (sm ? 16 : 22);
      const plate0 = sm ? 26 : 34;
      const xR = r.x + r.w - plate0 - (sm ? 14 : 22);
      const yT = r.y + (sm ? 46 : 64);
      const yB = r.y + r.h - (sm ? 26 : 38);
      const yM = (yT + yB) / 2;
      const xC = xL + (xR - xL) * 0.26;
      const xP = xC + clamp((xR - xL) * 0.16, 30, 64);
      const y2 = yT + clamp((yB - yT) * 0.36, 30, 70);
      const gap = sm ? 7 : 9;
      const plate = plate0;
      const resX0 = xP + (xR - xP) * 0.24;
      const resX1 = xP + (xR - xP) * 0.76;
      const bat = sm ? 6 : 8;
      return { r, sm, xL, xC, xP, xR, yT, yB, y2, yM, gap, plate, resX0, resX1, resH: sm ? 14 : 18, batTop: yM - bat, batBot: yM + bat };
    }

    const u0Label = () => `U_[0] = ${n(p.U, 1)} V`;

    function makeLoop(pts: [number, number][], hide: boolean[]): Loop {
      const len: number[] = [];
      let total = 0;
      for (let i = 0; i + 1 < pts.length; i++) {
        const l = Math.hypot(pts[i + 1]![0] - pts[i]![0], pts[i + 1]![1] - pts[i]![1]);
        len.push(l);
        total += l;
      }
      return { pts, hide, len, total };
    }
    /**
     * Stromkreis in technischer Stromrichtung beim Laden (oben von links nach rechts).
     * Beim Entladen ist I negativ – die Punkte laufen dann rückwärts.
     */
    function loopFor(G: Geo, charge: boolean): Loop {
      const { xL, xC, xP, xR, yT, yB, y2, yM, gap } = G;
      if (charge) {
        return makeLoop(
          [
            [xL, G.batTop],
            [xL, yT],
            [xC, yT],
            [xP, yT],
            [xR, yT],
            [xR, yM - gap],
            [xR, yM + gap],
            [xR, yB],
            [xL, yB],
            [xL, G.batBot],
            [xL, G.batTop],
          ],
          [false, false, false, false, false, true, false, false, false, true],
        );
      }
      return makeLoop(
        [
          [xC, y2],
          [xP, yT],
          [xR, yT],
          [xR, yM - gap],
          [xR, yM + gap],
          [xR, yB],
          [xC, yB],
          [xC, y2],
        ],
        [false, false, false, true, false, false, false],
      );
    }
    function pointOn(l: Loop, s: number): { x: number; y: number; hidden: boolean; edge: number } {
      let rest = ((s % l.total) + l.total) % l.total;
      for (let i = 0; i < l.len.length; i++) {
        const li = l.len[i]!;
        if (rest <= li) {
          const a = l.pts[i]!;
          const b = l.pts[i + 1]!;
          const f = li > 0 ? rest / li : 0;
          return { x: a[0] + (b[0] - a[0]) * f, y: a[1] + (b[1] - a[1]) * f, hidden: l.hide[i]!, edge: Math.min(rest, li - rest) };
        }
        rest -= li;
      }
      const a = l.pts[0]!;
      return { x: a[0], y: a[1], hidden: false, edge: 0 };
    }

    let lastGeo: Geo | null = null;
    let hover = false;

    function wire(pts: [number, number][], color: string, width: number): void {
      const g = surface.g;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      pts.forEach((q, i) => (i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])));
      g.stroke();
    }
    function node(x: number, y: number, color: string, r = 3.2): void {
      const g = surface.g;
      g.fillStyle = color;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }

    function drawScene(r: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const G = geo(r);
      lastGeo = G;
      g.save();
      g.globalAlpha *= ik;
      card(r);
      const sm = G.sm;
      richText(ctx.t('circuit'), r.x + 14, r.y + (sm ? 16 : 20), sm ? 12 : 13, theme.text, 'left', 750);
      // Zeitfaktor
      const f = timeFactor(tau());
      const fl = f === 1 ? ctx.t('real') : f > 1 ? tr('fast', { f: n(f, 0) }) : tr('slow', { f: n(1 / f, 0) });
      pill(r.x + r.w - 12, r.y + (sm ? 6 : 9), fl, f === 1 ? theme.muted : purple(), 'right', sm ? 10 : 11);
      // Zeit (unten links)
      richText(`t = ${fx(t, tDec(tEnd()))} s`, r.x + 14, r.y + r.h - (sm ? 12 : 16), sm ? 11 : 12, theme.text, 'left', 700);

      const wc = theme.dark ? '#c9d2df' : '#3b4656';
      const wm = withAlpha(wc, 0.35);
      const ww = sm ? 2 : 2.4;
      const ch = charging();
      const { xL, xC, xP, xR, yT, yB, y2, yM, gap, plate } = G;
      // Leitungen: aktiver Kreis kräftig, der andere blass
      wire([[xL, G.batTop], [xL, yT], [xC, yT]], ch ? wc : wm, ww);
      wire([[xL, G.batBot], [xL, yB], [xC, yB]], ch ? wc : wm, ww);
      wire([[xC, y2], [xC, yB]], ch ? wm : wc, ww);
      wire([[xC, yB], [xR, yB], [xR, yM + gap]], wc, ww);
      wire([[xP, yT], [G.resX0, yT]], wc, ww);
      wire([[G.resX1, yT], [xR, yT], [xR, yM - gap]], wc, ww);
      node(xC, yB, wc);

      // Quelle
      const bw = sm ? 16 : 22;
      g.strokeStyle = wc;
      g.lineCap = 'butt';
      g.lineWidth = sm ? 2 : 2.4;
      g.beginPath();
      g.moveTo(xL - bw, G.batTop);
      g.lineTo(xL + bw, G.batTop);
      g.stroke();
      g.lineWidth = sm ? 5 : 6;
      g.beginPath();
      g.moveTo(xL - bw * 0.5, G.batBot);
      g.lineTo(xL + bw * 0.5, G.batBot);
      g.stroke();
      richText('+', xL + bw + 6, G.batTop - 6, sm ? 12 : 14, red(), 'left', 800);
      richText('−', xL + bw * 0.5 + 6, G.batBot + 7, sm ? 12 : 14, blue(), 'left', 800);
      richText(u0Label(), xL - bw - 6, yM, sm ? 10.5 : 12, theme.text, 'right', 750, haloCol());

      // Widerstand
      g.fillStyle = theme.bg;
      g.strokeStyle = wc;
      g.lineWidth = ww;
      roundRect(g, G.resX0, yT - G.resH / 2, G.resX1 - G.resX0, G.resH, 2);
      g.fill();
      g.stroke();
      // Wärme im Widerstand ∝ I²
      const I = Inow();
      const I0max = p.U / Rsi();
      const heat = clamp((I / I0max) ** 2, 0, 1);
      if (heat > 0.01) {
        g.fillStyle = withAlpha(orange(), 0.55 * heat);
        roundRect(g, G.resX0 + 2, yT - G.resH / 2 + 2, G.resX1 - G.resX0 - 4, G.resH - 4, 1);
        g.fill();
      }
      richText(`R = ${n(p.R, 0)} kΩ`, (G.resX0 + G.resX1) / 2, yT - G.resH / 2 - (sm ? 9 : 11), sm ? 10.5 : 12, theme.text, 'center', 750, haloCol());

      // Kondensator
      const u = Uc();
      const qFrac = clamp(u / U_MAX, 0, 1);
      g.save();
      if (qFrac > 0.02) {
        g.shadowColor = withAlpha(blue(), 0.6 * qFrac);
        g.shadowBlur = 14 * qFrac;
      }
      g.lineCap = 'butt';
      g.lineWidth = sm ? 4 : 5;
      g.strokeStyle = mixColor(wc, red(), clamp(qFrac * 1.4, 0, 1));
      g.beginPath();
      g.moveTo(xR - plate, yM - gap);
      g.lineTo(xR + plate, yM - gap);
      g.stroke();
      g.strokeStyle = mixColor(wc, blue(), clamp(qFrac * 1.4, 0, 1));
      g.beginPath();
      g.moveTo(xR - plate, yM + gap);
      g.lineTo(xR + plate, yM + gap);
      g.stroke();
      g.restore();
      // Feld zwischen den Platten
      if (qFrac > 0.02) {
        g.strokeStyle = withAlpha(theme.text, 0.35 * clamp(qFrac * 1.5, 0, 1));
        g.lineWidth = 1;
        g.beginPath();
        for (let i = -2; i <= 2; i++) {
          g.moveTo(xR + (i * plate) / 2.6, yM - gap + 3);
          g.lineTo(xR + (i * plate) / 2.6, yM + gap - 3);
        }
        g.stroke();
      }
      // Ladungen auf den Platten (Anzahl ∝ U_C)
      const nq = Math.round(7 * qFrac);
      for (let i = 0; i < nq; i++) {
        const xx = xR - plate + ((i + 0.5) * 2 * plate) / 7;
        richText('+', xx, yM - gap - (sm ? 7 : 9), sm ? 10 : 12, red(), 'center', 800);
        richText('−', xx, yM + gap + (sm ? 8 : 10), sm ? 10 : 12, blue(), 'center', 800);
      }
      richText(`C = ${n(p.C, 0)} µF`, xR - plate - 8, yM - gap - (sm ? 12 : 15), sm ? 10.5 : 12, theme.text, 'right', 750, haloCol());

      // Elektronen (laufen gegen die technische Stromrichtung)
      const loop = loopFor(G, ch);
      const sp = sm ? 18 : 22;
      const nDots = Math.floor(loop.total / sp);
      const ec = theme.dark ? '#9cc7ff' : mixColor(blue(), '#000000', 0.15);
      for (let k = 0; k < nDots; k++) {
        const q = pointOn(loop, k * sp - flow);
        if (q.hidden) continue;
        const a = clamp(q.edge / 8, 0, 1);
        g.fillStyle = withAlpha(ec, 0.9 * a);
        g.beginPath();
        g.arc(q.x, q.y, sm ? 2.4 : 2.9, 0, TAU);
        g.fill();
      }

      // Schalter
      const blade = ease2('blade', ch ? 0 : 1, 9);
      const ex = xC;
      const ey = yT + (y2 - yT) * blade;
      const fA = flash.running ? 1 - flash.t : 0;
      if ((hover || fA > 0) && !ctx.locked) {
        g.fillStyle = withAlpha(orange(), 0.18 + 0.2 * fA);
        g.beginPath();
        g.arc((xC + xP) / 2, (yT + y2) / 2, Math.max(xP - xC, y2 - yT) * 0.75, 0, TAU);
        g.fill();
      }
      node(xC, yT, ch ? orange() : wc, sm ? 3.6 : 4.2);
      node(xC, y2, ch ? wc : orange(), sm ? 3.6 : 4.2);
      g.strokeStyle = orange();
      g.lineWidth = sm ? 3 : 3.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(xP, yT);
      g.lineTo(ex, ey);
      g.stroke();
      node(xP, yT, wc, sm ? 4 : 4.8);
      richText(ctx.t('c1'), xC - 6, yT - (sm ? 11 : 13), sm ? 10 : 11, ch ? orange() : theme.muted, 'right', 750, haloCol());
      richText(ctx.t('c2'), xC - 8, y2, sm ? 10 : 11, ch ? theme.muted : orange(), 'right', 750, haloCol());
      if (!sm && !ctx.locked) richText(`(${ctx.t('tapHint')})`, (xC + xP) / 2, y2 + 16, 10, theme.muted, 'center', 600, haloCol());

      // Messwerte
      if (p.val) {
        const s = sm ? 10.5 : 12;
        pill(xR - plate - 6, yM + (sm ? 2 : 4), `U_[C] = ${fx(u, 2)} V`, blue(), 'right', s);
        pill((G.resX0 + G.resX1) / 2, yT + G.resH / 2 + 8, `I = ${fmtI(I)}`, red(), 'center', s);
      }
      // technische Stromrichtung
      if (Math.abs(I) > I0max * 0.02) {
        const dir = Math.sign(I);
        const ax = (xR + G.resX1) / 2;
        const al = sm ? 12 : 16;
        arrowPx(ax - (dir * al) / 2, yT - (sm ? 9 : 11), ax + (dir * al) / 2, yT - (sm ? 9 : 11), red(), 2, 7);
      }
      {
        const ly = r.y + r.h - (sm ? 12 : 16);
        const lw2 = richText(ctx.t('electrons'), r.x + r.w - 14, ly, sm ? 10 : 10.5, theme.muted, 'right', 600);
        node(r.x + r.w - 22 - lw2, ly, ec, sm ? 2.4 : 2.9);
      }
      g.restore();
    }

    /* ---------- Diagramme ---------- */
    function drawChart(R: Rect, ik: number, kind: 'U' | 'I'): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 14);
      card(R);
      const sm = R.w < 440 || R.h < 170;
      const fs = sm ? 10 : 11;
      const col = kind === 'U' ? blue() : red();
      richText(ctx.t(kind === 'U' ? 'chartU' : 'chartI'), R.x + 14, R.y + (sm ? 15 : 19), sm ? 11.5 : 13, theme.text, 'left', 750);
      const I0max = p.U / Rsi();
      const micro = I0max < 1e-3;
      const iScale = micro ? 1e6 : 1e3;
      richText(ctx.t(kind === 'U' ? 'axisU' : micro ? 'axisIu' : 'axisI'), R.x + R.w - 14, R.y + (sm ? 15 : 19), fs, theme.muted, 'right', 600);
      const padL = sm ? 38 : 46;
      const top = R.y + (sm ? 28 : 36);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 12 : 16), h: R.y + R.h - top - (sm ? 22 : 26) };
      if (A.w < 60 || A.h < 30) {
        g.restore();
        return;
      }
      const T = tEnd();
      const tc = tau();
      const iMax = niceCeil(I0max * iScale) / iScale;
      const yMax = kind === 'U' ? niceCeil(p.U) : iMax;
      const yMin = kind === 'U' ? 0 : -iMax;
      const X = (tt: number) => A.x + (tt / T) * A.w;
      const Y = (v: number) => A.y + A.h - ((v - yMin) / (yMax - yMin)) * A.h;
      const val = (tt: number) => (kind === 'U' ? voltageAt(Ua, Ue, tt, tc) : currentAt(Ua, Ue, tt, Rsi(), Csi()));
      // Gitter
      const ts = niceStep(T, sm ? 4 : 5);
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let tt = ts; tt <= T + 1e-9; tt += ts) {
        g.moveTo(Math.round(X(tt)) + 0.5, A.y);
        g.lineTo(Math.round(X(tt)) + 0.5, A.y + A.h);
      }
      const ys = kind === 'U' ? niceStep(yMax, 4) : iMax / 2;
      for (let v = yMin; v <= yMax + 1e-12; v += ys) {
        g.moveTo(A.x, Math.round(Y(v)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(v)) + 0.5);
      }
      g.stroke();
      // Achsen
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.moveTo(A.x, Math.round(Y(0)) + 0.5);
      g.lineTo(A.x + A.w, Math.round(Y(0)) + 0.5);
      g.stroke();
      // Beschriftung
      const xt = ctx.t('axisT');
      const xtw = richWidth(xt, fs, 600);
      for (let tt = 0; tt <= T + 1e-9; tt += ts) {
        const xx = X(tt);
        if (xx > A.x + A.w - xtw - 16) continue;
        richText(tt === 0 ? '0' : n(tt, 3), xx, A.y + A.h + 11, fs, theme.muted, 'center', 500);
      }
      richText(xt, A.x + A.w, A.y + A.h + 11, fs, theme.muted, 'right', 600);
      if (kind === 'U') {
        for (let v = 0; v <= yMax + 1e-9; v += ys) richText(n(v, 2), A.x - 6, Y(v), fs, theme.muted, 'right', 500);
      } else {
        for (const v of [-iMax, 0, iMax]) richText(v === 0 ? '0' : `${v < 0 ? '−' : ''}${n(Math.abs(v) * iScale, 3)}`, A.x - 6, Y(v), fs, theme.muted, 'right', 500);
      }
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 3, A.w + 3, A.h + 6);
      g.clip();
      // ganzer Verlauf blass, bisheriger Verlauf kräftig
      const N = 160;
      g.strokeStyle = withAlpha(col, 0.25);
      g.lineWidth = 1.6;
      g.setLineDash([4, 4]);
      g.beginPath();
      for (let i = 0; i <= N; i++) {
        const tt = (T * i) / N;
        if (i) g.lineTo(X(tt), Y(val(tt)));
        else g.moveTo(X(tt), Y(val(tt)));
      }
      g.stroke();
      g.setLineDash([]);
      const tNow = Math.min(t, T);
      g.strokeStyle = col;
      g.lineWidth = sm ? 2.4 : 2.8;
      g.lineJoin = 'round';
      g.beginPath();
      const steps = Math.max(2, Math.ceil((N * tNow) / T));
      for (let i = 0; i <= steps; i++) {
        const tt = (tNow * i) / steps;
        if (i) g.lineTo(X(tt), Y(val(tt)));
        else g.moveTo(X(tt), Y(val(tt)));
      }
      g.stroke();
      // Tangente bei t = 0 und τ
      if (p.tan) {
        const v0 = val(0);
        const vEnd = kind === 'U' ? Ue : 0;
        g.strokeStyle = orange();
        g.lineWidth = 1.6;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(X(0), Y(v0));
        g.lineTo(X(tc * 1.25), Y(v0 + (vEnd - v0) * 1.25));
        g.stroke();
        g.setLineDash([3, 3]);
        g.strokeStyle = withAlpha(orange(), 0.8);
        g.beginPath();
        g.moveTo(X(tc), A.y);
        g.lineTo(X(tc), A.y + A.h);
        g.moveTo(A.x, Y(vEnd));
        g.lineTo(A.x + A.w, Y(vEnd));
        g.stroke();
        g.setLineDash([]);
        const vt = val(tc);
        g.fillStyle = orange();
        g.beginPath();
        g.arc(X(tc), Y(vt), 4, 0, TAU);
        g.fill();
        node(X(tc), Y(vEnd), orange(), 3);
        // Anteil nach τ: beim Laden 63 % von U₀, beim Entladen und für I noch 37 % des Anfangswerts
        const pct = kind === 'I' ? vt / v0 : Math.abs(vt) / Math.max(Math.abs(v0), Math.abs(vEnd));
        const showPct = kind === 'I' || Math.abs(Ua) < 1e-9 || Math.abs(Ue) < 1e-9;
        const lab = `τ = ${fx(tc, tDec(tc))} s`;
        richText(lab, X(tc) + 6, A.y + 9, fs, orange(), 'left', 750, haloCol());
        if (p.val && showPct && Math.abs(v0 - vEnd) > 1e-12) richText(`${n(Math.round(pct * 100), 0)} %`, X(tc) + 8, Y(vt) + (vt > (yMax + yMin) / 2 ? 12 : -12), fs, orange(), 'left', 750, haloCol());
      }
      // Halbwertszeit
      if (p.half) {
        const th = halfLife(tc);
        const v0 = val(0);
        const vEnd = kind === 'U' ? Ue : 0;
        const vh = (v0 + vEnd) / 2;
        g.strokeStyle = purple();
        g.lineWidth = 1.4;
        g.setLineDash([2, 3]);
        g.beginPath();
        g.moveTo(X(th), Y(vh));
        g.lineTo(X(th), Y(0));
        g.moveTo(A.x, Y(vh));
        g.lineTo(X(th), Y(vh));
        // zweite Halbwertszeit
        const vh2 = vEnd + (v0 - vEnd) / 4;
        g.moveTo(X(2 * th), Y(vh2));
        g.lineTo(X(2 * th), Y(0));
        g.moveTo(X(th), Y(vh2));
        g.lineTo(X(2 * th), Y(vh2));
        g.stroke();
        g.setLineDash([]);
        node(X(th), Y(vh), purple(), 3.5);
        node(X(2 * th), Y(vh2), purple(), 3);
        richText('t_[½]', X(th) + 4, Y(0) + (vh >= 0 ? -9 : 9), fs, purple(), 'left', 750, haloCol());
        richText('2 t_[½]', X(2 * th) + 4, Y(0) + (vh >= 0 ? -9 : 9), fs, purple(), 'left', 750, haloCol());
      }
      g.restore();
      // aktueller Punkt
      const vn = val(tNow);
      g.fillStyle = col;
      g.beginPath();
      g.arc(X(tNow), Y(vn), sm ? 4 : 5, 0, TAU);
      g.fill();
      g.strokeStyle = theme.bg;
      g.lineWidth = 1.5;
      g.stroke();
      g.restore();
    }

    /* ---------- Rechenkarte ---------- */
    function drawInfo(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 14);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      const v = p.val;
      const tc = tau();
      const u = Uc();
      const I = Inow();
      const rows: [string, string][] = [
        [`τ = R · C = ${n(p.R, 0)} kΩ · ${n(p.C, 0)} µF = ${v ? fx(tc, tDec(tc)) : '?'} s`, theme.text],
        [`I_[0] = ΔU / R = ${v ? fmtI((Ue - Ua) / Rsi()) : '?'}`, red()],
        [`t_[½] = τ · ln 2 = ${v ? fx(halfLife(tc), tDec(tc)) : '?'} s`, purple()],
        [`U_[C] = ${fx(u, 2)} V   I = ${fmtI(I)}`, blue()],
        [`W = ½ · C · U_[C]² = ${fmtW(energy(Csi(), u))}`, orange()],
      ];
      richText(ctx.t('infoTitle'), R.x + pad, R.y + (sm ? 15 : 19), sm ? 11.5 : 13, theme.text, 'left', 750);
      const topY = R.y + (sm ? 27 : 36);
      const lh = clamp((R.y + R.h - topY - (sm ? 6 : 10)) / rows.length, 14, sm ? 21 : 26);
      let y = topY + lh / 2;
      for (const [txt, c] of rows) {
        let s = clamp(lh * 0.56, 10, sm ? 12.5 : 14);
        while (s > 9.5 && richWidth(txt, s, 700) > R.w - 2 * pad) s -= 0.5;
        richText(txt, R.x + pad, y, s, c, 'left', 700);
        y += lh;
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const tc = tau();
      ctx.readout('tau', { html: tr('tau', { R: n(p.R, 0), C: n(p.C, 0), tau: fx(tc, tDec(tc)) }) });
      ctx.readout('I0', { html: tr('I0', { U: fx(p.U, 1), R: n(p.R, 0), I: fmtI(p.U / Rsi()) }) });
      ctx.readout('half', { html: tr('half', { tau: fx(tc, tDec(tc)), h: fx(halfLife(tc), tDec(tc) + 1) }) });
      ctx.readout('W', { html: tr('W', { C: n(p.C, 0), U: fx(p.U, 1), W: fmtW(energy(Csi(), p.U)) }) });
    }

    /* ---------- Schalter antippen ---------- */
    function onSwitch(px: number, py: number): boolean {
      const G = lastGeo;
      if (!G || ctx.locked) return false;
      const pad = G.sm ? 16 : 14;
      return px > G.xC - pad - 20 && px < G.xP + pad && py > G.yT - pad - 6 && py < G.y2 + pad;
    }
    function toggle(): void {
      ctx.set({ sw: charging() ? 'discharge' : 'charge' });
    }
    surface.addTarget({
      contains: (px: number, py: number) => onSwitch(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (!onSwitch(q.px, q.py)) return false;
        toggle();
        return true;
      },
      pointerMove: () => {},
      pointerUp: () => {},
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? onSwitch(q.px, q.py) : false;
        if (h !== hover) {
          hover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => {
      // nach Ende des Vorgangs: Abspielen startet ihn neu
      if (ctx.clock.playing && t >= tEnd() - 1e-9) start(true);
      ctx.requestRender();
    });

    return {
      update(changed, source) {
        if (source === 'init') {
          intro.play();
          start(true);
          if (prefersReducedMotion()) t = tEnd();
          else queueMicrotask(() => ctx.clock.play());
        } else if (source === 'replace') {
          start(true);
          if (prefersReducedMotion()) t = tEnd();
          else ctx.clock.play();
        } else if (changed.has('sw')) {
          // Umschalten mitten im Vorgang: weiter vom aktuellen Zustand aus
          start(false);
          flash.play();
          if (!ctx.clock.playing && !prefersReducedMotion()) ctx.clock.play();
          if (prefersReducedMotion()) t = tEnd();
        } else if (changed.has('U') || changed.has('R') || changed.has('C')) {
          start(true);
          if (!ctx.clock.playing && !prefersReducedMotion()) ctx.clock.play();
          if (prefersReducedMotion()) t = tEnd();
        }
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (id === 'toggle') toggle();
        else if (id === 'restart') {
          start(true);
          if (!prefersReducedMotion()) ctx.clock.play();
          else t = tEnd();
          ctx.requestRender();
        }
      },

      tick(dt) {
        const h = Math.min(dt, 0.1);
        const T = tEnd();
        if (t < T) t = Math.min(T, t + h * timeFactor(tau()));
        const I0max = p.U / Rsi();
        // Elektronen: Geschwindigkeit ∝ I, entgegen der technischen Stromrichtung
        flow -= (Inow() / I0max) * (lastGeo?.sm ? 70 : 95) * h;
      },

      resetTime() {
        start(true);
        flow = 0;
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        const lay = computeLayout();
        surface.begin();
        drawScene(lay.scene, stage(0, 0.5));
        drawChart(lay.chartU, stage(0.15, 0.5), 'U');
        drawChart(lay.chartI, stage(0.25, 0.5), 'I');
        drawInfo(lay.info, stage(0.35, 0.5));
        if (animating || intro.running || flash.running || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
