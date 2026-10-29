import { clamp, defineSimulation, ease, measureSubText, mixColor, prefersReducedMotion, roundRect, scaledSprite, subText, Surface, Tween, withAlpha, type Rect, type SubTextStyle } from '../../../sim-core';
import { COILS, currentForRadius, E_CHARGE, electronSpeed, fitSpecificCharge, helmholtzField, lorentzForce, orbitRadius, SPECIFIC_CHARGE } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Innenradius der Glaskugel in cm. */
const SPHERE = 7.5;
/**
 * Fadenstrahlrohr mit Helmholtzspulen (fadenstrahlrohr.webp, 913 × 1166):
 * Mitte und Radius der Glaskugel (Bildpixel). Die Spulen liegen im Foto etwas
 * enger um die Kugel als maßstäblich (R = 15 cm).
 */
const TUBE_IMG = { cx: 456, cy: 427, r: 303 };
/** Austrittspunkt der Elektronenkanone (cm, Kugelmitte = Ursprung, y nach oben). */
const GUN_X = -5;
/** Marken der Messleiter: Kreisdurchmesser in cm. */
const MARKS = [2, 4, 6, 8, 10];
/** Toleranz, ab der der Strahl „auf der Marke“ liegt (Durchmesser in cm). */
const MARK_TOL = 0.15;
/** Beschleunigungsspannungen der automatischen Messreihe (Durchmesser 8 cm). */
const AUTO_U = [150, 175, 200, 225, 250, 275, 300];
/** Farbe des leuchtenden Strahls (Gasleuchten, Objektfarbe). */
const BEAM = '#7cd3ff';

interface Lay {
  side: boolean;
  scene: Rect;
  info: Rect;
  chart: Rect;
}

interface Point {
  U: number;
  I: number;
  /** Abgelesener Durchmesser in cm. */
  d: number;
  born: number;
}

/**
 * Fadenstrahlrohr in Helmholtzspulen: Elektronen werden mit U beschleunigt und
 * im Feld B der Spulen auf eine leuchtende Kreisbahn gezwungen. Der Durchmesser
 * wird an der Messleiter im Rohr abgelesen (Marken bei 2 bis 10 cm). Aus einer
 * Messreihe folgt e/m über die Ausgleichsgerade 2U über B²r². Einblendbar:
 * Vektoren v, F und B sowie die Linke-Hand-Regel für Elektronen.
 */
export default defineSimulation({
  id: 'lorentzkraft',
  animated: true,
  dragHint: false,
  layout: { aspect: 1.5, aspectNarrow: 0.56 },
  images: { tube: 'fadenstrahlrohr.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    { key: 'U', type: 'number', label: L('Beschleunigungsspannung U', 'Accelerating voltage U'), min: 100, max: 300, step: 5, default: 200, unit: 'V' },
    { key: 'I', type: 'number', label: L('Spulenstrom I', 'Coil current I'), help: L('Helmholtzspulen: n = 130 Windungen, R = 15 cm', 'Helmholtz coils: n = 130 turns, R = 15 cm'), min: 0, max: 3, step: 0.01, default: 1.4, unit: 'A' },
    { key: 'vec', type: 'boolean', group: 'view', label: L('Vektoren v, F und Feld B', 'Vectors v, F and field B'), default: true },
    { key: 'hand', type: 'boolean', group: 'view', label: L('Linke-Hand-Regel (Elektronen)', 'Left-hand rule (electrons)'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  actions: [
    { id: 'snap', label: L('Strahl auf nächste Marke einstellen', 'Set the beam to the nearest mark'), primary: true },
    { id: 'rec', label: L('Messwert aufnehmen', 'Record a data point') },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series') },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data') },
  ],
  readouts: [
    { key: 'B', label: L('Magnetfeld der Spulen', 'Magnetic field of the coils'), spoiler: true },
    { key: 'r', label: L('Bahnradius', 'Orbit radius'), spoiler: true },
    { key: 'em', label: L('Spezifische Ladung aus der Messreihe', 'Specific charge from the series') },
  ],
  resultsParam: 'val',
  presets: [
    { id: 'std', label: L('U = 200 V, I = 1,4 A', 'U = 200 V, I = 1.4 A'), values: {} },
    { id: 'b1', label: L('B ≈ 1 mT (I = 1,28 A)', 'B ≈ 1 mT (I = 1.28 A)'), values: { I: 1.28 } },
    { id: 'mark8', label: L('Auf Marke 8 cm', 'On the 8 cm mark'), values: { I: 1.53 } },
    { id: 'none', label: L('Ohne Magnetfeld', 'Without magnetic field'), values: { I: 0 } },
    { id: 'small', label: L('Starkes Feld, kleiner Kreis', 'Strong field, small circle'), values: { U: 150, I: 3 } },
    { id: 'hand', label: L('Linke-Hand-Regel', 'Left-hand rule'), values: { hand: true } },
  ],
  strings: {
    de: {
      canvas:
        'Fadenstrahlrohr: eine Glaskugel zwischen zwei Helmholtzspulen. Die Elektronenkanone schießt Elektronen nach oben, das Magnetfeld zeigt in die Zeichenebene hinein und zwingt sie auf eine leuchtende Kreisbahn. An der waagerechten Messleiter mit Marken bei 2, 4, 6, 8 und 10 cm wird der Kreisdurchmesser abgelesen. Daneben Rechnung und Messreihe zur Bestimmung von e/m.',
      title: 'Fadenstrahlrohr',
      sub: 'Helmholtzspulen: n = 130, R = 15 cm',
      ladder: 'Durchmesser in cm',
      onMark: 'auf Marke {d} cm',
      hits: 'Strahl trifft das Glas',
      Bin: 'B zeigt in die Zeichenebene',
      handTitle: 'Linke Hand (Elektronen)',
      thumb: 'Daumen: v',
      index: 'Zeigefinger: B ⊗',
      middle: 'Mittelfinger: F',
      infoTitle: 'Rechnung',
      chartTitle: 'Messreihe: 2U über B²r²',
      chartX: 'B²r² in 10^−9 T²m²',
      chartY: '2U in V',
      empty: 'Strahl auf eine Marke einstellen und „Messwert aufnehmen“ – oder die Messreihe automatisch aufnehmen.',
      fit: 'Steigung = e/m ≈ {em} C/kg',
      lit: 'Literatur: 1,759 · 10^11 C/kg',
      Bro: '<var>B</var> = (4/5)<sup>3/2</sup> · <var>μ</var><sub>0</sub> · <span class="frac"><span><var>n</var> · <var>I</var></span><span><var>R</var></span></span> = 0,716 · 1,257 · 10<sup>−6</sup> <span class="frac"><span>T m</span><span>A</span></span> · <span class="frac"><span>130 · {I} A</span><span>0,15 m</span></span> = <strong>{B} mT</strong>',
      rro: '<var>v</var> = √(2 · <var>e</var>/<var>m</var> · <var>U</var>) = {v} m/s; <var>r</var> = <span class="frac"><span><var>v</var></span><span><var>e</var>/<var>m</var> · <var>B</var></span></span> = <span class="frac"><span>√(2 <var>U</var> <var>m</var>/<var>e</var>)</span><span><var>B</var></span></span> = <strong>{r} cm</strong> (Durchmesser {d} cm)',
      rnone: 'Ohne Magnetfeld fliegen die Elektronen geradeaus.',
      emro: '<var>e</var>/<var>m</var> = <span class="frac"><span>2 <var>U</var></span><span><var>B</var><sup>2</sup> <var>r</var><sup>2</sup></span></span> ≈ <strong>{em} · 10<sup>11</sup> C/kg</strong> aus {n} (Literatur 1,759 · 10<sup>11</sup> C/kg, Abweichung {dev} %)',
      emnone: 'Noch keine Messwerte.',
      pt1: '1 Messwert',
      ptN: '{n} Messwerten',
    },
    en: {
      canvas:
        'Fine-beam tube: a glass bulb between two Helmholtz coils. The electron gun fires electrons upwards, the magnetic field points into the page and forces them onto a glowing circular path. The circle diameter is read on the horizontal ladder with marks at 2, 4, 6, 8 and 10 cm. Next to it the calculation and a series of measurements to determine e/m.',
      title: 'Fine-beam tube',
      sub: 'Helmholtz coils: n = 130, R = 15 cm',
      ladder: 'diameter in cm',
      onMark: 'on the {d} cm mark',
      hits: 'beam hits the glass',
      Bin: 'B points into the page',
      handTitle: 'Left hand (electrons)',
      thumb: 'thumb: v',
      index: 'index finger: B ⊗',
      middle: 'middle finger: F',
      infoTitle: 'Calculation',
      chartTitle: 'Series: 2U against B²r²',
      chartX: 'B²r² in 10^−9 T²m²',
      chartY: '2U in V',
      empty: 'Set the beam to a mark and “Record a data point” – or record the series automatically.',
      fit: 'slope = e/m ≈ {em} C/kg',
      lit: 'literature: 1.759 · 10^11 C/kg',
      Bro: '<var>B</var> = (4/5)<sup>3/2</sup> · <var>μ</var><sub>0</sub> · <span class="frac"><span><var>n</var> · <var>I</var></span><span><var>R</var></span></span> = 0.716 · 1.257 · 10<sup>−6</sup> <span class="frac"><span>T m</span><span>A</span></span> · <span class="frac"><span>130 · {I} A</span><span>0.15 m</span></span> = <strong>{B} mT</strong>',
      rro: '<var>v</var> = √(2 · <var>e</var>/<var>m</var> · <var>U</var>) = {v} m/s; <var>r</var> = <span class="frac"><span><var>v</var></span><span><var>e</var>/<var>m</var> · <var>B</var></span></span> = <span class="frac"><span>√(2 <var>U</var> <var>m</var>/<var>e</var>)</span><span><var>B</var></span></span> = <strong>{r} cm</strong> (diameter {d} cm)',
      rnone: 'Without a magnetic field the electrons fly straight on.',
      emro: '<var>e</var>/<var>m</var> = <span class="frac"><span>2 <var>U</var></span><span><var>B</var><sup>2</sup> <var>r</var><sup>2</sup></span></span> ≈ <strong>{em} · 10<sup>11</sup> C/kg</strong> from {n} (literature 1.759 · 10<sup>11</sup> C/kg, deviation {dev} %)',
      emnone: 'No data yet.',
      pt1: '1 data point',
      ptN: '{n} data points',
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
    const green = () => ctx.theme.series[2]!;
    const orange = () => ctx.theme.series[3]!;

    /* ---------- Physik ---------- */
    const Bnow = () => helmholtzField(COILS.n, p.I, COILS.R);
    /** Bahnradius in cm (unendlich ohne Feld). */
    const rNow = () => orbitRadius(p.U, Bnow()) * 100;
    /** Marke, auf der der Strahl gerade liegt (oder null). */
    function markHit(): number | null {
      const d = 2 * rNow();
      for (const m of MARKS) if (Math.abs(d - m) <= MARK_TOL) return m;
      return null;
    }
    /** Zahl als „1,76 · 10^11“ (für richText). */
    function sci(v: number, digits = 3): string {
      if (!Number.isFinite(v) || v === 0) return '0';
      const [m, e] = mantissa(v, digits);
      return `${fx(m, digits - 1)} · 10^${e < 0 ? '−' : ''}${Math.abs(e)}`;
    }
    /** Mantisse und Exponent; die gerundete Mantisse bleibt unter 10 (9,996 → 1,00 · 10^(e+1)). */
    function mantissa(v: number, digits: number): [number, number] {
      let e = Math.floor(Math.log10(Math.abs(v)));
      let m = v / Math.pow(10, e);
      if (Math.abs(Number(m.toFixed(digits - 1))) >= 10) {
        e += 1;
        m /= 10;
      }
      return [m, e];
    }
    /** Zahl als „1,76 · 10<sup>11</sup>“ (für Ergebnisse unter der Bühne). */
    function sciHtml(v: number, digits = 3): string {
      if (!Number.isFinite(v) || v === 0) return '0';
      const [m, e] = mantissa(v, digits);
      return `${fx(m, digits - 1)} · 10<sup>${e < 0 ? '−' : ''}${Math.abs(e)}</sup>`;
    }

    /* ---------- Messreihe ---------- */
    let points: Point[] = [];
    let autoRun = false;
    let autoIdx = 0;
    let autoWait = 0;
    const warn = new Tween(700, ease.outCubic);

    function record(): boolean {
      const m = markHit();
      if (m === null) {
        warn.play();
        return false;
      }
      const pt: Point = { U: p.U, I: p.I, d: m, born: prefersReducedMotion() ? -1e9 : performance.now() };
      points = [...points.filter((q) => !(q.U === pt.U && q.d === pt.d)), pt].slice(-14);
      updateReadouts();
      return true;
    }
    function snap(): void {
      // nächste erreichbare Marke zum aktuellen Durchmesser
      const d = 2 * rNow();
      const cands = MARKS.map((m) => ({ m, I: Math.round(currentForRadius(p.U, m / 200) * 100) / 100 }))
        .filter((c) => c.I <= 3 && c.I > 0)
        .sort((a, b) => Math.abs(a.m - (Number.isFinite(d) ? d : 99)) - Math.abs(b.m - (Number.isFinite(d) ? d : 99)));
      const c = cands[0];
      if (c) ctx.set({ I: c.I });
    }
    function autoTick(dt: number): void {
      if (!autoRun) return;
      const U = AUTO_U[autoIdx]!;
      const I = Math.round(currentForRadius(U, 0.04) * 100) / 100;
      if (p.U !== U || p.I !== I) {
        ctx.set({ U, I });
        autoWait = 0;
        return;
      }
      autoWait += dt;
      if (autoWait < (prefersReducedMotion() ? 0 : 0.55)) return;
      record();
      autoIdx++;
      autoWait = 0;
      if (autoIdx >= AUTO_U.length) autoRun = false;
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
    let phase = 0;

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const lw = Math.round(w * 0.56);
        const rw = w - lw - 12;
        const ih = Math.round(h * 0.34);
        return { side, scene: { x: 0, y: 0, w: lw, h }, info: { x: lw + 12, y: 0, w: rw, h: ih }, chart: { x: lw + 12, y: ih + 10, w: rw, h: h - ih - 10 } };
      }
      const sh = Math.round(h * 0.5);
      const ih = Math.round(h * 0.2);
      return { side, scene: { x: 0, y: 0, w, h: sh }, info: { x: 0, y: sh + 10, w, h: ih }, chart: { x: 0, y: sh + ih + 20, w, h: h - sh - ih - 20 } };
    }

    /* ---------- Zeichenhilfen ---------- */
    /*
     * Text mit tiefgestelltem Index über den Kern-Helfer `subText` (`I_H`, `μ_0`), dazu Hochzahlen
     * „10^−3“ (die zeichnet der Kern nicht). Index- und Hochzahlgröße wie bisher auf ganze Pixel gerundet.
     */
    const subStyle = (size: number, color: string, weight: number): SubTextStyle => ({
      size,
      family: ctx.theme.font,
      weight,
      color,
      align: 'left',
      subScale: Math.round(size * 0.72) / size,
      subShift: 0.3,
    });
    /** Zerlegt in Textstücke (mit Index) und Hochzahlen. */
    function pieces(str: string): { t: string; sup: boolean }[] {
      const out: { t: string; sup: boolean }[] = [];
      const re = /\^(−?\d+)/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sup: false });
        out.push({ t: mm[1]!, sup: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sup: false });
      return out;
    }
    const supFont = (size: number, weight: number) => `${weight} ${Math.round(size * 0.72)}px ${ctx.theme.font}`;
    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return pieces(str).reduce((w, q) => {
        if (!q.sup) return w + measureSubText(g, q.t, subStyle(size, '', weight));
        g.font = supFont(size, weight);
        return w + g.measureText(q.t).width;
      }, 0);
    }
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      const list = pieces(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      // erst alle Ränder, dann die Schrift (sonst überdeckt ein Rand die vorige Schrift)
      for (const pass of halo ? ['halo', 'fill'] : ['fill']) {
        let cx = start;
        for (const q of list) {
          if (!q.sup) {
            const st = subStyle(size, pass === 'halo' ? 'rgba(0,0,0,0)' : color, weight);
            cx += subText(g, q.t, cx, y, pass === 'halo' ? { ...st, halo: halo! } : st);
            continue;
          }
          g.save();
          g.font = supFont(size, weight);
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          if (pass === 'halo') {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = halo!;
            g.strokeText(q.t, cx, y - size * 0.36);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, y - size * 0.36);
          }
          cx += g.measureText(q.t).width;
          g.restore();
        }
      }
      return total;
    }
    const haloCol = () => (ctx.theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.92)');
    const darkHalo = 'rgba(8,12,20,0.85)';

    /** Beschriftung auf dunklem Grund (im Rohr ist es immer dunkel). */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12): Rect {
      const g = surface.g;
      const fill = 'rgba(12,18,28,0.88)';
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill;
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      g.strokeStyle = withAlpha(color, 0.55);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, color, 'center');
      return { x: x0, y, w, h };
    }

    function card(r: Rect, fill?: string): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = fill ?? theme.bg;
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

    /* ---------- Strahlbahn ---------- */
    /** Punkte der Bahn in cm (Start an der Kanone, nach oben, im Uhrzeigersinn), Ende am Glas oder nach einem Umlauf. */
    function beamPath(r: number): { pts: [number, number][]; hit: boolean } {
      const pts: [number, number][] = [];
      const lim = SPHERE - 0.15;
      if (!Number.isFinite(r) || r > 400) {
        const yEnd = Math.sqrt(lim * lim - GUN_X * GUN_X);
        for (let i = 0; i <= 20; i++) pts.push([GUN_X, (yEnd * i) / 20]);
        return { pts, hit: true };
      }
      const cx = GUN_X + r;
      const total = TAU * r;
      const N = 220;
      for (let i = 0; i <= N; i++) {
        const s = (total * i) / N;
        const th = Math.PI - s / r;
        const x = cx + r * Math.cos(th);
        const y = r * Math.sin(th);
        if (Math.hypot(x, y) > lim) {
          pts.push([x, y]);
          return { pts, hit: true };
        }
        pts.push([x, y]);
      }
      return { pts, hit: false };
    }

    /* ---------- Szene ---------- */
    function drawScene(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      card(R, theme.dark ? '#0d121a' : '#1a2230');
      g.save();
      roundRect(g, R.x + 1.5, R.y + 1.5, R.w - 3, R.h - 3, 12);
      g.clip();
      const sm = R.w < 440;
      const k = Math.max(Math.min(R.w, R.h) / 33, (0.31 * Math.min(R.w, R.h)) / SPHERE);
      const cx = R.x + R.w / 2 + (sm ? 0 : k * 0.6);
      const cy = R.y + R.h / 2 - k * 1.2;
      const X = (x: number) => cx + x * k;
      const Y = (y: number) => cy - y * k;
      const txt = '#e6edf6';
      const mut = 'rgba(214,224,238,0.62)';

      const rs = SPHERE * k;
      const photo = ctx.images.get('tube');
      if (photo) {
        // Foto: Spulen, Hals und Sockel; die Kugel genau auf der gezeichneten
        const kp = rs / TUBE_IMG.r;
        const w = photo.width * kp;
        const h = photo.height * kp;
        g.drawImage(scaledSprite(photo, w, h, surface.dpr), cx - TUBE_IMG.cx * kp, cy - TUBE_IMG.cy * kp, w, h);
      } else {
        // Helmholtzspulen (Kupferwicklung, von vorn gesehen, dahinter versetzt die zweite)
        const copper = '#c47a3a';
        for (const [off, a] of [
          [0.9, 0.45],
          [0, 1],
        ] as const) {
          const rr = COILS.R * 100 * k;
          g.save();
          g.globalAlpha *= a;
          g.lineWidth = 2.2 * k;
          const gr = g.createRadialGradient(cx + off * k, cy - off * k, rr - 1.2 * k, cx + off * k, cy - off * k, rr + 1.2 * k);
          gr.addColorStop(0, mixColor(copper, '#000000', 0.35));
          gr.addColorStop(0.5, mixColor(copper, '#ffffff', 0.25));
          gr.addColorStop(1, mixColor(copper, '#000000', 0.4));
          g.strokeStyle = gr;
          g.beginPath();
          g.arc(cx + off * k, cy - off * k, rr, 0, TAU);
          g.stroke();
          // Wicklungslinien
          g.strokeStyle = 'rgba(0,0,0,0.18)';
          g.lineWidth = 1;
          for (let i = -2; i <= 2; i++) {
            g.beginPath();
            g.arc(cx + off * k, cy - off * k, rr + i * 0.4 * k, 0, TAU);
            g.stroke();
          }
          g.restore();
        }

        // Hals und Sockel
        const neckW = 2.6 * k;
        g.fillStyle = 'rgba(190,210,230,0.16)';
        g.strokeStyle = 'rgba(200,220,240,0.35)';
        g.lineWidth = 1.2;
        roundRect(g, cx - neckW / 2, Y(-SPHERE + 0.6), neckW, 3.2 * k, 4);
        g.fill();
        g.stroke();
        g.fillStyle = '#2b3442';
        roundRect(g, cx - 2.4 * k, Y(-SPHERE - 2.4), 4.8 * k, 1.6 * k, 4);
        g.fill();
      }

      // Glaskugel mit leichtem Gasleuchten (mit Foto: dunkles Innere hinter dem Glas)
      const bg = g.createRadialGradient(cx - rs * 0.3, cy - rs * 0.35, rs * 0.1, cx, cy, rs * 1.05);
      bg.addColorStop(0, 'rgba(40,58,86,0.95)');
      bg.addColorStop(1, 'rgba(10,15,26,0.98)');
      g.fillStyle = bg;
      g.beginPath();
      g.arc(cx, cy, photo ? rs * 0.97 : rs + 0.3 * k, 0, TAU);
      if (photo) g.globalAlpha *= 0.9;
      g.fill();
      if (photo) g.globalAlpha /= 0.9;
      g.strokeStyle = 'rgba(200,225,255,0.45)';
      g.lineWidth = 1.6;
      g.stroke();
      // Glanzlicht
      g.strokeStyle = 'rgba(255,255,255,0.10)';
      g.lineWidth = 0.35 * k;
      g.lineCap = 'round';
      g.beginPath();
      g.arc(cx, cy, rs - 0.8 * k, Math.PI * 1.08, Math.PI * 1.38);
      g.stroke();

      // Feld B in die Zeichenebene (⊗)
      const vecA = ease2('vecA', p.vec ? 1 : 0, 6);
      const B = Bnow();
      if (vecA > 0.02 && B > 0) {
        g.save();
        g.globalAlpha *= vecA * clamp(0.2 + B / 3e-3, 0.2, 0.55);
        g.strokeStyle = '#a9c8ff';
        g.lineWidth = 1.1;
        const st = 2.5;
        for (let x = -7.5; x <= 7.5; x += st) {
          for (let y = -7.5; y <= 7.5; y += st) {
            const xx = x + 1.25;
            const yy = y + 1.25;
            if (Math.hypot(xx, yy) > SPHERE - 0.9) continue;
            if (Math.abs(yy) < 1.4 || (Math.abs(xx - GUN_X) < 1.2 && yy < 0)) continue;
            const px = X(xx);
            const py = Y(yy);
            const s = Math.max(3, 0.32 * k);
            g.beginPath();
            g.arc(px, py, s, 0, TAU);
            g.moveTo(px - s * 0.7, py - s * 0.7);
            g.lineTo(px + s * 0.7, py + s * 0.7);
            g.moveTo(px + s * 0.7, py - s * 0.7);
            g.lineTo(px - s * 0.7, py + s * 0.7);
            g.stroke();
          }
        }
        g.restore();
      }

      // Messleiter (waagerecht durch den Austrittspunkt)
      const hitM = markHit();
      g.strokeStyle = 'rgba(220,230,245,0.55)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(X(GUN_X), Y(0));
      g.lineTo(X(GUN_X + 10.4), Y(0));
      g.stroke();
      for (const m of MARKS) {
        const on = hitM === m;
        const xm = X(GUN_X + m);
        if (on) {
          const gl = g.createRadialGradient(xm, Y(0), 0, xm, Y(0), 1.1 * k);
          gl.addColorStop(0, withAlpha(BEAM, 0.9));
          gl.addColorStop(1, withAlpha(BEAM, 0));
          g.fillStyle = gl;
          g.beginPath();
          g.arc(xm, Y(0), 1.1 * k, 0, TAU);
          g.fill();
        }
        g.strokeStyle = on ? '#ffffff' : 'rgba(220,230,245,0.8)';
        g.lineWidth = on ? 2.4 : 1.6;
        g.beginPath();
        g.moveTo(xm, Y(0) - 0.45 * k);
        g.lineTo(xm, Y(0) + 0.45 * k);
        g.stroke();
        richText(String(m), xm, Y(0) + 0.45 * k + (sm ? 8 : 10), sm ? 9.5 : 11, on ? '#ffffff' : mut, 'center', on ? 800 : 650);
      }

      // Elektronenkanone (zeigt nach oben)
      const gunTop = Y(0) + 0.15 * k;
      const gw = 1.0 * k;
      g.strokeStyle = 'rgba(200,220,240,0.28)';
      g.lineWidth = Math.max(2, 0.22 * k);
      g.beginPath();
      g.moveTo(X(GUN_X), Y(-3.3));
      g.lineTo(X(-0.9), Y(-SPHERE + 0.7));
      g.stroke();
      const gg = g.createLinearGradient(X(GUN_X) - gw / 2, 0, X(GUN_X) + gw / 2, 0);
      gg.addColorStop(0, '#59616d');
      gg.addColorStop(0.5, '#b7c0cc');
      gg.addColorStop(1, '#59616d');
      g.fillStyle = gg;
      roundRect(g, X(GUN_X) - gw / 2, gunTop + 0.5 * k, gw, 2.9 * k, 2);
      g.fill();
      g.fillStyle = '#c9d1db';
      roundRect(g, X(GUN_X) - gw * 0.9, gunTop, gw * 1.8, 0.4 * k, 2);
      g.fill();

      // Strahl
      const rT = rNow();
      const rS = Number.isFinite(rT) ? ease2('r', Math.min(rT, 500), 7) : 1e9;
      if (!Number.isFinite(rT)) soft.delete('r');
      const { pts, hit } = beamPath(rS);
      const bright = clamp(0.55 + (p.U - 100) / 400, 0.55, 1);
      g.save();
      g.lineJoin = 'round';
      g.lineCap = 'round';
      for (const [wd, al] of [
        [1.1 * k, 0.1],
        [0.5 * k, 0.25],
        [0.18 * k, 0.6],
        [Math.max(1.4, 0.07 * k), 1],
      ] as const) {
        g.strokeStyle = withAlpha(al === 1 ? '#e8f8ff' : BEAM, al * bright);
        g.lineWidth = wd;
        g.beginPath();
        pts.forEach((q, i) => (i ? g.lineTo(X(q[0]), Y(q[1])) : g.moveTo(X(q[0]), Y(q[1]))));
        g.stroke();
      }
      // wandernde Elektronenpakete
      let total = 0;
      const segL: number[] = [];
      for (let i = 1; i < pts.length; i++) {
        const l = Math.hypot(pts[i]![0] - pts[i - 1]![0], pts[i]![1] - pts[i - 1]![1]);
        segL.push(l);
        total += l;
      }
      const at = (s: number): [number, number, number, number] => {
        let rest = clamp(s, 0, total);
        for (let i = 0; i < segL.length; i++) {
          const l = segL[i]!;
          if (rest <= l || i === segL.length - 1) {
            const a = pts[i]!;
            const b = pts[i + 1]!;
            const f = l > 0 ? clamp(rest / l, 0, 1) : 0;
            return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, (b[0] - a[0]) / (l || 1), (b[1] - a[1]) / (l || 1)];
          }
          rest -= l;
        }
        const a = pts[0]!;
        return [a[0], a[1], 0, 1];
      };
      const spacing = 1.6;
      for (let s = (phase * 6) % spacing; s < total; s += spacing) {
        const [x, y] = at(s);
        g.fillStyle = withAlpha('#ffffff', 0.75 * bright);
        g.beginPath();
        g.arc(X(x), Y(y), Math.max(1.4, 0.09 * k), 0, TAU);
        g.fill();
      }
      // Auftreffpunkt am Glas
      if (hit) {
        const e = pts[pts.length - 1]!;
        const gl = g.createRadialGradient(X(e[0]), Y(e[1]), 0, X(e[0]), Y(e[1]), 1.2 * k);
        gl.addColorStop(0, withAlpha('#d6ff9c', 0.9));
        gl.addColorStop(1, withAlpha('#d6ff9c', 0));
        g.fillStyle = gl;
        g.beginPath();
        g.arc(X(e[0]), Y(e[1]), 1.2 * k, 0, TAU);
        g.fill();
      }
      g.restore();

      // Vektoren an einem umlaufenden Elektron
      if (vecA > 0.02 && total > 0) {
        g.save();
        g.globalAlpha *= vecA;
        // Das Elektron mit den Pfeilen läuft nur durch den Teil der Bahn, der mindestens 1,5 cm über
        // Kanone und Leiter liegt (sonst streifen v und F die Kanone bzw. „Durchmesser in cm“);
        // an den Enden blendet es kurz aus und ein
        let s0 = 0;
        let s1 = total;
        if (!hit) {
          const N = 120;
          let first = -1;
          let last = -1;
          for (let i = 0; i <= N; i++) {
            if (at((i / N) * total)[1] >= 1.5) {
              if (first < 0) first = i;
              last = i;
            }
          }
          if (first >= 0 && last > first) {
            s0 = (first / N) * total;
            s1 = (last / N) * total;
          }
        }
        // Start bei einem Viertel des Wegs: im Stand (vor dem Abspielen) gut sichtbar
        const frac = (phase * 0.9 + 0.25) % 1;
        if (!hit) g.globalAlpha *= clamp(Math.min(frac, 1 - frac) / 0.06, 0, 1);
        const sE = hit ? Math.min(total * 0.35, 3) : s0 + frac * (s1 - s0);
        const [x, y, tx, ty] = at(sE);
        const ex = X(x);
        const ey = Y(y);
        const vl = (sm ? 1.6 : 1.9) * k;
        arrowPx(ex, ey, ex + tx * vl, ey - ty * vl, green(), sm ? 2.6 : 3, sm ? 9 : 11);
        richText('v', ex + tx * vl + 8, ey - ty * vl - 4, sm ? 12 : 14, green(), 'left', 800, darkHalo);
        if (Number.isFinite(rS) && rS < 400 && B > 0) {
          // Kraft zur Kreismitte (senkrecht zu v, nach rechts gedreht)
          const fxn = ty;
          const fyn = -tx;
          const fl = clamp(0.6 + B / 1.5e-3, 0.6, 2.2) * k;
          arrowPx(ex, ey, ex + fxn * fl, ey - fyn * fl, orange(), sm ? 2.6 : 3, sm ? 9 : 11);
          richText('F', ex + fxn * fl + 6, ey - fyn * fl + 10, sm ? 12 : 14, orange(), 'left', 800, darkHalo);
        }
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(ex, ey, Math.max(3, 0.2 * k), 0, TAU);
        g.fill();
        g.restore();
      }

      // Titel und Werte
      richText(ctx.t('title'), R.x + 14, R.y + (sm ? 16 : 20), sm ? 12 : 13, txt, 'left', 750, darkHalo);
      // Auf schmaler Bühne liegt die Hand-Karte über dem Untertitel: dann ausblenden (n, R stehen auch am Regler)
      const hA = ease2('handA', p.hand ? 1 : 0, 7);
      const subA = sm ? 1 - hA : 1;
      if (subA > 0.02) {
        g.save();
        g.globalAlpha *= subA;
        richText(ctx.t('sub'), R.x + 14, R.y + (sm ? 31 : 38), sm ? 10 : 11, mut, 'left', 600, darkHalo);
        g.restore();
      }
      if (vecA > 0.02 && B > 0 && !sm) richText(ctx.t('Bin'), R.x + 14, R.y + 56, 11, '#a9c8ff', 'left', 650, darkHalo);
      richText(ctx.t('ladder'), X(GUN_X + 5), Y(0) + 0.45 * k + (sm ? 21 : 26), sm ? 9.5 : 10.5, mut, 'center', 600, darkHalo);
      if (p.val) {
        const s = sm ? 10.5 : 12;
        let y = R.y + R.h - (sm ? 30 : 40);
        const xR = R.x + R.w - 12;
        pill(xR, y, `U = ${n(p.U, 0)} V`, '#9fb4cc', 'right', s);
        y -= s + 17;
        pill(xR, y, `I = ${fx(p.I, 2)} A → B = ${fx(B * 1e3, 3)} mT`, '#9fb4cc', 'right', s);
        const lab = hitM !== null ? tr('onMark', { d: n(hitM, 0) }) : hit ? ctx.t('hits') : `d = ${fx(2 * rT, 2)} cm`;
        const wA = warn.running ? Math.sin(warn.t * Math.PI * 4) * (1 - warn.t) : 0;
        pill(R.x + 12 + wA * 6, R.y + R.h - (sm ? 30 : 40), lab, hitM !== null ? '#7cd3ff' : hit ? '#ffb86b' : '#c9d6e6', 'left', s);
      }

      // Linke-Hand-Regel
      if (hA > 0.02) drawHand(R, hA, sm);
      g.restore();
      g.restore();
    }

    /** Drei-Finger-Regel der linken Hand für Elektronen am Austrittspunkt (v nach oben, B hinein, F nach rechts). */
    function drawHand(R: Rect, a: number, sm: boolean): void {
      const g = surface.g;
      const fs = sm ? 9.5 : 10.5;
      const items: [string, string][] = [
        [ctx.t('thumb'), green()],
        [ctx.t('index'), '#a9c8ff'],
        [ctx.t('middle'), orange()],
      ];
      const legW = Math.max(...items.map((q) => richWidth(q[0], fs, 700)));
      const draw = sm ? 70 : 88;
      const w = Math.max(draw + legW + 18, richWidth(ctx.t('handTitle'), fs + 0.5, 750) + 20);
      const h = sm ? 104 : 124;
      const x0 = R.x + R.w - w - 10;
      const y0 = R.y + 10;
      g.save();
      g.globalAlpha *= a;
      g.translate((1 - a) * 20, 0);
      g.fillStyle = 'rgba(14,20,30,0.92)';
      roundRect(g, x0, y0, w, h, 10);
      g.fill();
      g.strokeStyle = 'rgba(200,220,240,0.3)';
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y0 + 0.5, w - 1, h - 1, 10);
      g.stroke();
      richText(ctx.t('handTitle'), x0 + 10, y0 + 13, fs + 0.5, '#e6edf6', 'left', 750);
      // stilisierte Hand: Handballen, drei Finger als Pfeile
      const ox = x0 + (sm ? 24 : 28);
      const oy = y0 + h - (sm ? 22 : 26);
      const L1 = sm ? 42 : 52;
      const skin = '#e0b48f';
      g.fillStyle = withAlpha(skin, 0.85);
      g.beginPath();
      g.ellipse(ox - 4, oy + 6, sm ? 12 : 15, sm ? 9 : 11, -0.5, 0, TAU);
      g.fill();
      const finger = (dx: number, dy: number, col: string) => {
        g.strokeStyle = withAlpha(skin, 0.9);
        g.lineWidth = sm ? 8 : 10;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(ox, oy);
        g.lineTo(ox + dx * 0.8, oy + dy * 0.8);
        g.stroke();
        arrowPx(ox, oy, ox + dx, oy + dy, col, 2.4, 8);
      };
      finger(L1 * 0.45, -L1 * 0.45, '#a9c8ff');
      finger(0, -L1 * 0.95, green());
      finger(L1, 0, orange());
      // Legende
      const lx = x0 + draw;
      items.forEach(([t, c], i) => richText(t, lx, y0 + (sm ? 38 : 44) + i * (sm ? 20 : 24), fs, c, 'left', 700));
      g.restore();
    }

    /* ---------- Rechenkarte ---------- */
    function drawInfo(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 300 || R.h < 150;
      const pad = sm ? 12 : 16;
      const v = p.val;
      const B = Bnow();
      const vel = electronSpeed(p.U);
      const r = rNow();
      const rows: [string, string][] = [
        [`B = ${fx(0.716, 3)} · μ_0 · n · I / R = ${v ? fx(B * 1e3, 3) : '?'} mT`, blue()],
        [`v = √(2 · e/m · U) = ${v ? sci(vel, 3) : '?'} m/s`, green()],
        [Number.isFinite(r) ? `r = v / (e/m · B) = ${v ? fx(r, 2) : '?'} cm` : `r → ∞ (B = 0)`, theme.text],
        [`F = e · v · B = ${v ? sci(lorentzForce(E_CHARGE, vel, B), 3) : '?'} N`, orange()],
      ];
      richText(ctx.t('infoTitle'), R.x + pad, R.y + (sm ? 15 : 19), sm ? 11.5 : 13, theme.text, 'left', 750);
      const top = R.y + (sm ? 27 : 36);
      const lh = clamp((R.y + R.h - top - (sm ? 6 : 10)) / rows.length, 14, sm ? 21 : 27);
      let y = top + lh / 2;
      for (const [txt, c] of rows) {
        let s = clamp(lh * 0.56, 10, sm ? 12.5 : 14);
        while (s > 9.5 && richWidth(txt, s, 700) > R.w - 2 * pad) s -= 0.5;
        richText(txt, R.x + pad, y, s, c, 'left', 700);
        y += lh;
      }
      g.restore();
    }

    /* ---------- Messreihe als Diagramm ---------- */
    function drawChart(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 14);
      card(R);
      const sm = R.w < 380 || R.h < 170;
      const fs = sm ? 10 : 11;
      richText(ctx.t('chartTitle'), R.x + 14, R.y + (sm ? 15 : 19), sm ? 11.5 : 13, theme.text, 'left', 750);
      const padL = sm ? 40 : 48;
      const top = R.y + (sm ? 28 : 36);
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 12 : 16), h: R.y + R.h - top - (sm ? 24 : 28) };
      if (A.w < 60 || A.h < 30) {
        g.restore();
        return;
      }
      // Achsen: x = B² r² in 10⁻⁹ T² m² (0 … 4), y = 2U in V (0 … 600)
      const xMax = 4;
      const yMax = 600;
      const X = (x: number) => A.x + (x / xMax) * A.w;
      const Y = (y: number) => A.y + A.h - (y / yMax) * A.h;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let x = 1; x <= xMax; x++) {
        g.moveTo(Math.round(X(x)) + 0.5, A.y);
        g.lineTo(Math.round(X(x)) + 0.5, A.y + A.h);
      }
      for (let y = 200; y <= yMax; y += 200) {
        g.moveTo(A.x, Math.round(Y(y)) + 0.5);
        g.lineTo(A.x + A.w, Math.round(Y(y)) + 0.5);
      }
      g.stroke();
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y);
      g.lineTo(A.x + 0.5, A.y + A.h);
      g.lineTo(A.x + A.w, A.y + A.h);
      g.stroke();
      const xl = ctx.t('chartX');
      const xlw = richWidth(xl, fs, 600);
      for (let x = 0; x <= xMax; x++) {
        if (X(x) > A.x + A.w - xlw - 14) continue;
        richText(String(x), X(x), A.y + A.h + 11, fs, theme.muted, 'center', 500);
      }
      richText(xl, A.x + A.w, A.y + A.h + 11, fs, theme.muted, 'right', 600);
      for (let y = 0; y <= yMax; y += 200) richText(String(y), A.x - 6, Y(y), fs, theme.muted, 'right', 500);
      richText(ctx.t('chartY'), R.x + R.w - 14, R.y + (sm ? 15 : 19), fs, theme.muted, 'right', 600);
      // Literaturgerade blass
      g.save();
      g.beginPath();
      g.rect(A.x, A.y, A.w, A.h);
      g.clip();
      g.strokeStyle = withAlpha(theme.muted, 0.5);
      g.setLineDash([4, 4]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(X(0), Y(0));
      g.lineTo(X(xMax), Y(SPECIFIC_CHARGE * xMax * 1e-9));
      g.stroke();
      g.setLineDash([]);
      // Noch keine Messung: blasse Beispielpunkte entlang der Geraden zeigen, wie die Messreihe aussehen wird
      if (!points.length) {
        g.strokeStyle = withAlpha(theme.muted, 0.6);
        g.lineWidth = 1.4;
        [0.18, 0.34, 0.5, 0.66, 0.82].forEach((f, i) => {
          const x = xMax * f;
          const y = SPECIFIC_CHARGE * x * 1e-9 * (1 + [0.04, -0.03, 0.02, -0.04, 0.03][i]!);
          g.beginPath();
          g.arc(X(x), Y(y), sm ? 3.5 : 4.5, 0, TAU);
          g.stroke();
        });
      }
      const data = points.map((q) => ({ U: q.U, B: helmholtzField(COILS.n, q.I, COILS.R), r: q.d / 200 }));
      const em = fitSpecificCharge(data);
      if (em !== null) {
        g.strokeStyle = red();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(X(0), Y(0));
        g.lineTo(X(xMax), Y(em * xMax * 1e-9));
        g.stroke();
      }
      g.restore();
      const now = performance.now();
      for (const [i, q] of data.entries()) {
        const x = q.B * q.B * q.r * q.r * 1e9;
        const age = clamp((now - points[i]!.born) / 450, 0, 1);
        if (age < 1) animating = true;
        const s = (sm ? 4 : 5) * (age < 1 ? ease.outBack(age) : 1);
        g.fillStyle = blue();
        g.beginPath();
        g.arc(X(x), Y(2 * q.U), s, 0, TAU);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.5;
        g.stroke();
      }
      if (em !== null) {
        const lab = tr('fit', { em: sci(em, 3) });
        richText(lab, A.x + 10, A.y + 10, sm ? 10.5 : 12, red(), 'left', 750, haloCol());
        richText(ctx.t('lit'), A.x + 10, A.y + (sm ? 25 : 28), fs, theme.muted, 'left', 600, haloCol());
      } else {
        // Hinweis, wenn noch keine Messwerte vorliegen
        const words = ctx.t('empty').split(' ');
        const lines: string[] = [];
        let cur = '';
        for (const wd of words) {
          const t = cur ? `${cur} ${wd}` : wd;
          if (richWidth(t, fs, 600) > A.w - 24 && cur) {
            lines.push(cur);
            cur = wd;
          } else cur = t;
        }
        if (cur) lines.push(cur);
        lines.forEach((l, i) => richText(l, A.x + A.w / 2, A.y + A.h / 2 + (i - (lines.length - 1) / 2) * (fs + 5), fs, theme.muted, 'center', 600, haloCol()));
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const B = Bnow();
      const r = rNow();
      ctx.readout('B', { html: tr('Bro', { I: fx(p.I, 2), B: fx(B * 1e3, 3) }) });
      ctx.readout('r', { html: Number.isFinite(r) ? tr('rro', { v: sciHtml(electronSpeed(p.U), 3), r: fx(r, 2), d: fx(2 * r, 2) }) : ctx.t('rnone') });
      const data = points.map((q) => ({ U: q.U, B: helmholtzField(COILS.n, q.I, COILS.R), r: q.d / 200 }));
      const em = fitSpecificCharge(data);
      ctx.readout('em', em === null ? ctx.t('emnone') : { html: tr('emro', { em: fx(em / 1e11, 3), n: points.length === 1 ? ctx.t('pt1') : tr('ptN', { n: String(points.length) }), dev: fx((Math.abs(em - SPECIFIC_CHARGE) / SPECIFIC_CHARGE) * 100, 1) }) });
      ctx.setAction('snap', { enabled: !ctx.locked && !autoRun });
      ctx.setAction('rec', { enabled: !ctx.locked && !autoRun });
      ctx.setAction('auto', { enabled: !ctx.locked && !autoRun });
      ctx.setAction('clear', { enabled: points.length > 0 && !ctx.locked && !autoRun });
    }

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(_changed, source) {
        if (source === 'init') {
          intro.play();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        }
        if (source === 'replace' || source === 'input') autoRun = false;
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (id === 'snap') snap();
        else if (id === 'rec') record();
        else if (id === 'auto') {
          points = [];
          autoRun = true;
          autoIdx = 0;
          autoWait = 0;
          if (!ctx.clock.playing) ctx.clock.play();
        } else if (id === 'clear') points = [];
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        const h = Math.min(dt, 0.1);
        phase += h;
        const was = autoRun;
        autoTick(h);
        if (was !== autoRun) updateReadouts();
      },

      resetTime() {
        phase = 0;
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        const lay = computeLayout();
        surface.begin();
        drawScene(lay.scene, stage(0, 0.5));
        drawInfo(lay.info, stage(0.2, 0.5));
        drawChart(lay.chart, stage(0.3, 0.5));
        if (animating || intro.running || warn.running || autoRun || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
