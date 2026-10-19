import { clamp, defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import { gratingConstant, intensity, maxAngle, maxOrder, screenPosition, SLIT_RATIO, slitFactor, spacingSmallAngle, wavelengthToRgb } from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Beim Gitter beleuchtete Striche im Bild (Modell für scharfe Maxima). */
const N_GRATING = 24;

interface Lay {
  side: boolean;
  setup: Rect;
  screen: Rect;
  info: Rect;
}

/** Angezeigter (weich nachgeführter) Zustand. */
interface View {
  lam: number;
  g: number;
  a: number;
  /** halbe Breite des gezeigten Schirmausschnitts in m. */
  Xh: number;
}

/**
 * Doppelspalt, Mehrfachspalt und Gitter: Laser, Spaltblende mit Huygens-
 * Wellenfeld dahinter, Strahlen zu den Maxima auf dem Schirm (Seitenansicht),
 * das Schirmbild von vorn mit Intensitätskurve und ziehbarer Messmarke,
 * daneben die Maxima sin α_k = k · λ / g mit Winkeln und Abständen.
 */
export default defineSimulation({
  id: 'doppelspalt',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.5, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Anordnung', 'Arrangement'),
      options: [
        { value: 'slits', label: L('Doppel- und Mehrfachspalt', 'Double and multiple slit') },
        { value: 'grating', label: L('Gitter', 'Grating') },
      ],
      default: 'slits',
    },
    { key: 'N', type: 'number', label: L('Anzahl der Spalte N', 'Number of slits N'), help: L('N = 1: Einzelspalt, N = 2: Doppelspalt.', 'N = 1: single slit, N = 2: double slit.'), min: 1, max: 10, step: 1, default: 2, visibleIf: (v) => v.mode === 'slits' },
    { key: 'g', type: 'number', label: L('Spaltabstand g', 'Slit spacing g'), help: L('Abstand der Spaltmitten. Die Spaltbreite ist im Modell b = g/6.', 'Distance between the slit centres. In the model the slit width is b = g/6.'), min: 0.05, max: 1, step: 0.01, default: 0.1, unit: 'mm', visibleIf: (v) => v.mode === 'slits' },
    { key: 'gl', type: 'number', label: L('Gitter: Striche pro mm', 'Grating: lines per mm'), help: L('Gitterkonstante g = 1 mm / Strichzahl.', 'Grating constant g = 1 mm / number of lines.'), min: 50, max: 1000, step: 10, default: 500, visibleIf: (v) => v.mode === 'grating' },
    { key: 'lam', type: 'number', label: L('Wellenlänge λ', 'Wavelength λ'), min: 400, max: 700, step: 1, default: 650, unit: 'nm' },
    { key: 'a', type: 'number', label: L('Schirmabstand a', 'Screen distance a'), min: 0.2, max: 5, step: 0.1, default: 2, unit: 'm' },
    { key: 'xm', type: 'number', label: L('Messmarke x', 'Measuring mark x'), help: L('Oder: die Marke auf dem Schirm ziehen. Abstand von der Mitte.', 'Or drag the mark on the screen. Distance from the centre.'), min: 0, max: 3000, step: 0.5, default: 20, unit: 'mm', visibleIf: (v) => v.meas === true },
    { key: 'meas', type: 'boolean', group: 'view', label: L('Messmarke', 'Measuring mark'), default: true },
    { key: 'env', type: 'boolean', group: 'view', label: L('Einzelspalt-Hülle im Diagramm', 'Single-slit envelope in the graph'), default: false },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte im Bild anzeigen', 'Show values in the picture'), default: true },
  ],
  readouts: [
    { key: 'max', label: L('Maxima', 'Maxima'), spoiler: true },
    { key: 'orders', label: L('Anzahl der Maxima', 'Number of maxima'), spoiler: true },
    { key: 'meas', label: L('Messung', 'Measurement') },
  ],
  presets: [
    { id: 'start', label: L('Doppelspalt mit rotem Laser', 'Double slit with red laser'), values: {} },
    { id: 'single', label: L('Einzelspalt', 'Single slit'), values: { N: 1, xm: 40 } },
    { id: 'five', label: L('Fünf Spalte: schärfere Maxima', 'Five slits: sharper maxima'), values: { N: 5, env: true } },
    { id: 'green', label: L('Grüner Laser, kleiner Spaltabstand', 'Green laser, smaller slit spacing'), values: { lam: 532, g: 0.05 } },
    { id: 'grating', label: L('Gitter 500 Striche/mm', 'Grating 500 lines/mm'), values: { mode: 'grating', gl: 500, lam: 500, a: 1, xm: 258 } },
  ],
  strings: {
    de: {
      canvas:
        'Versuchsaufbau von der Seite: Ein Laser beleuchtet eine Blende mit einem, zwei oder mehreren Spalten bzw. ein Gitter; dahinter breiten sich von jedem Spalt Kreiswellen aus und überlagern sich. Strahlen führen zu den Maxima auf dem Schirm. Darunter das Schirmbild von vorn mit der Intensitätsverteilung, einer Skala und einer ziehbaren Messmarke; daneben die Maxima mit Ordnung, Winkel und Abstand.',
      setup: 'Aufbau von der Seite',
      setupS: 'Aufbau',
      laser: 'Laser',
      slits1: 'Einzelspalt',
      slits2: 'Doppelspalt',
      slitsN: '{n} Spalte',
      grating: 'Gitter',
      zoom: 'stark vergrößert',
      screen: 'Schirm',
      dist: 'a = {a} m',
      scaleNote: 'nicht maßstäblich',
      front: 'Schirmbild',
      axisX: 'x in mm',
      axisI: 'I / I_[0]',
      env: 'Einzelspalt',
      mark: 'x = {x} mm',
      infoTitle: 'Maxima auf dem Schirm',
      infoTitleS: 'Maxima',
      thK: 'k',
      thKmin: 'Minimum k',
      thA: 'α_[k]',
      thX: 'x_[k]',
      more: '… bis k = {k}',
      dx: 'Δx ≈ λ · a / g = {d} mm',
      markInfo: 'Marke: tan α = x / a → α = {al}°',
      noMax: 'keine weiteren Maxima',
      max:
        'Hauptmaxima: sin <var>α</var><sub><var>k</var></sub> = <span class="frac"><span><var>k</var> · <var>λ</var></span><span><var>g</var></span></span>, Ort auf dem Schirm <var>x</var><sub><var>k</var></sub> = <var>a</var> · tan <var>α</var><sub><var>k</var></sub><br>1. Ordnung: sin <var>α</var><sub>1</sub> = <span class="frac"><span>{lam} nm</span><span>{g}</span></span> = {s1} → <var>α</var><sub>1</sub> = <strong>{a1}°</strong>, <var>x</var><sub>1</sub> = {a} m · tan {a1}° = <strong>{x1}</strong>{small}',
      small: '<br>Kleine Winkel: Abstand benachbarter Maxima Δ<var>x</var> ≈ <span class="frac"><span><var>λ</var> · <var>a</var></span><span><var>g</var></span></span> = <span class="frac"><span>{lam} nm · {a} m</span><span>{g}</span></span> = <strong>{dx} mm</strong>',
      noFirst: 'Für <var>λ</var> ≥ <var>g</var> gibt es außer der Mitte kein Hauptmaximum.',
      orders: 'Höchste Ordnung: <var>k</var> &lt; <span class="frac"><span><var>g</var></span><span><var>λ</var></span></span> = {q} → <var>k</var><sub>max</sub> = <strong>{k}</strong>, insgesamt {n} Hauptmaxima ({ks}).',
      ordersSlit: 'Einzelspalt: helles Hauptmaximum in der Mitte, Minima bei sin <var>α</var> = <var>k</var> · <span class="frac"><span><var>λ</var></span><span><var>b</var></span></span> mit <var>b</var> = {b} (erstes Minimum bei <var>x</var> ≈ {x0}).',
      meas: 'Messmarke bei <var>x</var> = <strong>{x} mm</strong>: tan <var>α</var> = <span class="frac"><span><var>x</var></span><span><var>a</var></span></span> = {t} → <var>α</var> = {al}°. Intensität dort: {I} % von <var>I</var><sub>0</sub>.',
      measOff: 'Messmarke ausgeblendet.',
    },
    en: {
      canvas:
        'Set-up seen from the side: a laser illuminates a slit plate with one, two or more slits or a grating; behind it circular waves spread out from each slit and overlap. Rays lead to the maxima on the screen. Below it the screen seen from the front with the intensity distribution, a scale and a draggable measuring mark; next to it the maxima with order, angle and position.',
      setup: 'Set-up from the side',
      setupS: 'Set-up',
      laser: 'laser',
      slits1: 'single slit',
      slits2: 'double slit',
      slitsN: '{n} slits',
      grating: 'grating',
      zoom: 'greatly enlarged',
      screen: 'screen',
      dist: 'a = {a} m',
      scaleNote: 'not to scale',
      front: 'Screen',
      axisX: 'x in mm',
      axisI: 'I / I_[0]',
      env: 'single slit',
      mark: 'x = {x} mm',
      infoTitle: 'Maxima on the screen',
      infoTitleS: 'Maxima',
      thK: 'k',
      thKmin: 'minimum k',
      thA: 'α_[k]',
      thX: 'x_[k]',
      more: '… up to k = {k}',
      dx: 'Δx ≈ λ · a / g = {d} mm',
      markInfo: 'mark: tan α = x / a → α = {al}°',
      noMax: 'no further maxima',
      max:
        'Principal maxima: sin <var>α</var><sub><var>k</var></sub> = <span class="frac"><span><var>k</var> · <var>λ</var></span><span><var>g</var></span></span>, position on the screen <var>x</var><sub><var>k</var></sub> = <var>a</var> · tan <var>α</var><sub><var>k</var></sub><br>1st order: sin <var>α</var><sub>1</sub> = <span class="frac"><span>{lam} nm</span><span>{g}</span></span> = {s1} → <var>α</var><sub>1</sub> = <strong>{a1}°</strong>, <var>x</var><sub>1</sub> = {a} m · tan {a1}° = <strong>{x1}</strong>{small}',
      small: '<br>Small angles: distance between neighbouring maxima Δ<var>x</var> ≈ <span class="frac"><span><var>λ</var> · <var>a</var></span><span><var>g</var></span></span> = <span class="frac"><span>{lam} nm · {a} m</span><span>{g}</span></span> = <strong>{dx} mm</strong>',
      noFirst: 'For <var>λ</var> ≥ <var>g</var> there is no principal maximum apart from the centre.',
      orders: 'Highest order: <var>k</var> &lt; <span class="frac"><span><var>g</var></span><span><var>λ</var></span></span> = {q} → <var>k</var><sub>max</sub> = <strong>{k}</strong>, {n} principal maxima in total ({ks}).',
      ordersSlit: 'Single slit: bright central maximum, minima at sin <var>α</var> = <var>k</var> · <span class="frac"><span><var>λ</var></span><span><var>b</var></span></span> with <var>b</var> = {b} (first minimum at <var>x</var> ≈ {x0}).',
      meas: 'Measuring mark at <var>x</var> = <strong>{x} mm</strong>: tan <var>α</var> = <span class="frac"><span><var>x</var></span><span><var>a</var></span></span> = {t} → <var>α</var> = {al}°. Intensity there: {I} % of <var>I</var><sub>0</sub>.',
      measOff: 'Measuring mark hidden.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const orange = () => ctx.theme.series[3]!;
    const isGrating = () => p.mode === 'grating';
    /** Gitterkonstante in m. */
    const gOf = () => (isGrating() ? gratingConstant(p.gl) : p.g * 1e-3);
    const Nof = () => (isGrating() ? N_GRATING : p.N);
    const deg = (r: number) => (r * 180) / Math.PI;

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
      const done = Math.abs(v - target) <= 1e-4 * Math.max(1, Math.abs(target));
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);
    /** Überblenden beim Wechsel der Spaltanzahl. */
    let nFrom = Nof();
    let nTo = Nof();
    const nSwap = new Tween(450, ease.inOutCubic);
    let phase = 0;

    /* ---------- Farben ---------- */
    const rgbOf = (lam: number) => wavelengthToRgb(lam);
    function laserColor(lam: number, a = 1): string {
      const [r, g, b] = rgbOf(lam);
      const m = Math.max(r, g, b, 1);
      const k = m < 200 ? 200 / m : 1;
      return `rgba(${Math.min(255, Math.round(r * k))},${Math.min(255, Math.round(g * k))},${Math.min(255, Math.round(b * k))},${a})`;
    }
    /** Laserfarbe als Text- oder Linienfarbe auf der Karte. */
    const inkOf = (lam: number) => {
      const c = laserColor(lam);
      return ctx.theme.dark ? mixColor(c, '#ffffff', lam < 450 ? 0.35 : 0.05) : mixColor(c, '#1b2330', lam > 500 && lam < 600 ? 0.42 : 0.15);
    };

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.3, 220, 330));
        const sw = w - pw - 12;
        const sh = Math.round(h * 0.44);
        return { side, setup: { x: 0, y: 0, w: sw, h: sh }, screen: { x: 0, y: sh + 10, w: sw, h: h - sh - 10 }, info: { x: sw + 12, y: 0, w: pw, h } };
      }
      const sh = Math.round(h * 0.27);
      const fh = Math.round(h * 0.33);
      return { side, setup: { x: 0, y: 0, w, h: sh }, screen: { x: 0, y: sh + 10, w, h: fh }, info: { x: 0, y: sh + fh + 20, w, h: h - sh - fh - 20 } };
    }

    /** Ausschnitt des Schirms: Doppelspalt etwa 3,6 Abstände, Gitter bis zur höchsten Ordnung. */
    function targetXh(lam: number, g: number, a: number): number {
      if (isGrating()) {
        // nur Ordnungen zeigen, die unter der Einzelspalt-Hülle noch gut sichtbar sind
        let k = maxOrder(lam, g);
        while (k > 1 && slitFactor(2 * Math.PI * k * SLIT_RATIO) < 0.04) k--;
        if (k < 1) return a * 1.5;
        const x = screenPosition(maxAngle(k, lam, g)!, a);
        return Math.min(x * 1.14, a * 6);
      }
      if (p.N === 1) return spacingSmallAngle(lam, a, g * SLIT_RATIO) * 2.6;
      return spacingSmallAngle(lam, a, g) * 3.6;
    }

    function view(): View {
      const lam = ease2('lam', p.lam, 8);
      const lg = ease2('lg', Math.log10(gOf()), 7);
      const g = 10 ** lg;
      const a = ease2('a', p.a, 8);
      const Xh = 10 ** ease2('lXh', Math.log10(targetXh(p.lam, gOf(), p.a)), 5);
      return { lam, g, a, Xh };
    }

    /** Intensität am Schirmort x, mit Überblenden der Spaltanzahl. */
    function Iat(x: number, v: View): number {
      const al = Math.atan2(x, v.a);
      if (!nSwap.running || nFrom === nTo) return intensity(al, nTo, v.lam, v.g);
      const u = nSwap.value;
      return (1 - u) * intensity(al, nFrom, v.lam, v.g) + u * intensity(al, nTo, v.lam, v.g);
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
    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight = 700, halo: string | null = null): number {
      const g = surface.g;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
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

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string, onDark = false): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark || onDark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (onDark ? 'rgba(10,14,22,0.82)' : theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = color.startsWith('#') ? withAlpha(color, 0.5) : mixColor(color, color, 0, 0.5);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center');
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

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 6): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.45);
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

    /** Länge in m schön formatiert (mm, cm oder m). */
    function lenText(x: number, d = 1): string {
      const ax = Math.abs(x);
      if (ax < 0.1) return `${fx(x * 1000, d)} mm`;
      if (ax < 1) return `${fx(x * 100, d)} cm`;
      return `${fx(x, 2)} m`;
    }
    const gText = (g: number) => (g >= 1e-5 ? `${fx(g * 1000, 2)} mm` : `${fx(g * 1e6, 2)} µm`);

    /* ---------- Aufbau von der Seite ---------- */
    const field = document.createElement('canvas');
    const fg = field.getContext('2d')!;
    let img: ImageData | null = null;

    function drawSetup(R: Rect, v: View, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = R.w < 440;
      g.save();
      g.globalAlpha *= ik;
      // dunkler Raum (Laser im abgedunkelten Raum)
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,30,50,0.25)';
      g.shadowBlur = 14;
      g.shadowOffsetY = 4;
      const bg = g.createLinearGradient(0, R.y, 0, R.y + R.h);
      bg.addColorStop(0, dark ? '#0b111b' : '#142033');
      bg.addColorStop(1, dark ? '#070b12' : '#0c1522');
      g.fillStyle = bg;
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 12);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, R.x + 1, R.y + 1, R.w - 2, R.h - 2, 12);
      g.clip();
      const cy = R.y + R.h * 0.56;
      const half = R.h * 0.34;
      const lx = R.x + (sm ? 10 : 16);
      const lw = sm ? 44 : 64;
      const lh = sm ? 18 : 24;
      const xs = R.x + R.w * (sm ? 0.3 : 0.28);
      const xf = xs + Math.min(R.w * 0.3, half * 1.9);
      const xr = R.x + R.w - (sm ? 20 : 30);
      const col = laserColor(v.lam);
      // Strahl zur Blende mit ebenen Wellenfronten
      const lamPx = sm ? 8 : 10;
      g.fillStyle = laserColor(v.lam, 0.2);
      g.fillRect(lx + lw, cy - (sm ? 9 : 12), xs - lx - lw, sm ? 18 : 24);
      g.strokeStyle = laserColor(v.lam, 0.75);
      g.lineWidth = 1.4;
      g.beginPath();
      const off = ((phase * lamPx) % lamPx + lamPx) % lamPx;
      for (let x = lx + lw + off; x < xs; x += lamPx) {
        g.moveTo(x, cy - (sm ? 8 : 11));
        g.lineTo(x, cy + (sm ? 8 : 11));
      }
      g.stroke();
      // Laser
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const lb = g.createLinearGradient(0, cy - lh / 2, 0, cy + lh / 2);
      lb.addColorStop(0, '#6b7583');
      lb.addColorStop(0.5, '#3a414c');
      lb.addColorStop(1, '#1f242b');
      g.fillStyle = lb;
      roundRect(g, lx, cy - lh / 2, lw, lh, 5);
      g.fill();
      g.restore();
      g.fillStyle = col;
      g.beginPath();
      g.arc(lx + lw - 3, cy, 3, 0, TAU);
      g.fill();
      richText(ctx.t('laser'), lx + lw / 2, cy - lh / 2 - 9, sm ? 10 : 11, 'rgba(210,220,236,0.85)', 'center', 650);
      // Wellenfeld hinter der Blende (Huygens): Kreiswellen von jedem Spalt
      const Nd = Math.min(isGrating() ? 7 : p.N, 7);
      const ratio = clamp(v.g / (v.lam * 1e-9), 1.5, 5);
      const gPx = lamPx * ratio;
      const ys: number[] = [];
      for (let i = 0; i < Nd; i++) ys.push(cy + (i - (Nd - 1) / 2) * gPx);
      const fw = Math.max(8, Math.round((xf - xs) / 3));
      const fh = Math.max(8, Math.round((2 * half) / 3));
      if (field.width !== fw || field.height !== fh || !img) {
        field.width = fw;
        field.height = fh;
        img = fg.createImageData(fw, fh);
      }
      const data = img.data;
      const [cr, cg, cb] = rgbOf(v.lam);
      const kk = TAU / lamPx;
      let o = 0;
      for (let j = 0; j < fh; j++) {
        const y = cy - half + j * 3 + 1.5;
        for (let i = 0; i < fw; i++) {
          const x = i * 3 + 1.5;
          let s = 0;
          for (const yy of ys) {
            const r = Math.hypot(x, y - yy) + 1;
            s += Math.cos(kk * r - phase * TAU) / Math.sqrt(r / lamPx + 0.6);
          }
          const h = s / Math.sqrt(Nd);
          const b = clamp(0.5 + 0.5 * h, 0, 1);
          const fade = Math.min(1, x / 12) * Math.min(1, (xf - xs - x) / 30);
          const k2 = b * b * fade;
          data[o] = cr * k2;
          data[o + 1] = cg * k2;
          data[o + 2] = cb * k2;
          data[o + 3] = Math.round(255 * Math.min(1, k2 * 1.6));
          o += 4;
        }
      }
      fg.putImageData(img, 0, 0);
      g.save();
      g.imageSmoothingEnabled = true;
      g.drawImage(field, 0, 0, fw, fh, xs, cy - half, fw * 3, fh * 3);
      g.restore();
      // Strahlen von der Blende zu den Maxima auf dem Schirm
      const k = maxOrder(v.lam, v.g);
      const kShow = isGrating() ? k : Math.min(k, 3);
      const yOfX = (x: number) => cy - (x / v.Xh) * half;
      for (let q = -kShow; q <= kShow; q++) {
        const al = maxAngle(q, v.lam, v.g);
        if (al === null) continue;
        const xk = screenPosition(al, v.a);
        if (Math.abs(xk) > v.Xh * 1.02) continue;
        const I = Iat(xk, v);
        const yk = yOfX(xk);
        const gr = g.createLinearGradient(xf, 0, xr, 0);
        gr.addColorStop(0, laserColor(v.lam, 0.05));
        gr.addColorStop(1, laserColor(v.lam, 0.25 + 0.55 * I));
        g.strokeStyle = gr;
        g.lineWidth = q === 0 ? 2.4 : 1.8;
        g.beginPath();
        g.moveTo(xs, cy);
        g.lineTo(xr, yk);
        g.stroke();
      }
      // Blende mit Spalten
      g.fillStyle = '#2b3038';
      const slitW = Math.max(2, gPx * (isGrating() ? 0.45 : 0.3));
      g.save();
      g.beginPath();
      g.rect(xs - 4, R.y, 7, R.h);
      for (const yy of ys) g.rect(xs - 5, yy - slitW / 2, 9, slitW);
      g.clip('evenodd');
      const pg = g.createLinearGradient(xs - 4, 0, xs + 3, 0);
      pg.addColorStop(0, '#59616d');
      pg.addColorStop(0.5, '#a6aeb9');
      pg.addColorStop(1, '#3d444e');
      g.fillStyle = pg;
      g.fillRect(xs - 4, R.y, 7, R.h);
      g.restore();
      // Schirm von der Seite mit Leuchtprofil
      g.fillStyle = '#e8ecf1';
      g.fillRect(xr, cy - half - 6, 5, 2 * half + 12);
      const steps = 160;
      for (let i = 0; i < steps; i++) {
        const y0 = cy - half + (2 * half * i) / steps;
        const x = ((cy - (y0 + half / steps)) / half) * v.Xh;
        const I = Iat(x, v);
        if (I < 0.01) continue;
        g.fillStyle = laserColor(v.lam, Math.min(1, Math.sqrt(I)));
        g.fillRect(xr - 3, y0, 3 + 7 * I, (2 * half) / steps + 0.5);
      }
      // Beschriftungen
      const fs = sm ? 10 : 11;
      const kind = isGrating() ? ctx.t('grating') : p.N === 1 ? ctx.t('slits1') : p.N === 2 ? ctx.t('slits2') : tr('slitsN', { n: String(p.N) });
      const ly = Math.max(R.y + (sm ? 32 : 38), cy - half - 10);
      richText(kind + (ratio >= 4.99 && !sm ? ` (${ctx.t('zoom')})` : ''), xs + 8, ly, fs, 'rgba(225,232,244,0.9)', 'left', 700);
      richText(ctx.t('screen'), xr + 2, Math.max(R.y + (sm ? 15 : 18), cy - half - 14), fs, 'rgba(225,232,244,0.9)', 'right', 700);
      // Maß a
      const yy = R.y + R.h - (sm ? 12 : 14);
      g.strokeStyle = 'rgba(210,220,236,0.75)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(xs, yy - 4);
      g.lineTo(xs, yy + 4);
      g.moveTo(xr, yy - 4);
      g.lineTo(xr, yy + 4);
      g.stroke();
      const mid = (xs + xr) / 2;
      arrowPx(mid, yy, xs + 1, yy, 'rgba(210,220,236,0.75)', 1.1, 5);
      arrowPx(mid, yy, xr - 1, yy, 'rgba(210,220,236,0.75)', 1.1, 5);
      const dl = `${tr('dist', { a: fx(v.a, 1) })} (${ctx.t('scaleNote')})`;
      const w = richWidth(dl, fs, 650) + 12;
      g.fillStyle = dark ? '#090e16' : '#101a2a';
      g.fillRect(mid - w / 2, yy - 8, w, 16);
      richText(dl, mid, yy, fs, 'rgba(210,220,236,0.9)', 'center', 650);
      g.restore();
      // Titel
      richText(ctx.t(R.w < 380 ? 'setupS' : 'setup'), R.x + 14, R.y + (sm ? 15 : 18), sm ? 12 : 13, '#e8eef6', 'left', 750, 'rgba(10,16,26,0.95)');
      g.restore();
    }

    /* ---------- Schirmbild und Intensitätskurve ---------- */
    interface ScreenGeo {
      x0: number;
      x1: number;
      cx: number;
      sy: number;
      sh: number;
      gy: number;
      gh: number;
    }
    let lastScreen: ScreenGeo | null = null;
    let markHover = false;
    let markDrag = false;

    function niceStep(x: number): number {
      const q = 10 ** Math.floor(Math.log10(Math.max(1e-12, x)));
      for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
      return 10 * q;
    }

    function drawScreen(R: Rect, v: View, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate(0, (1 - ik) * 12);
      card(R);
      const sm = R.w < 440 || R.h < 220;
      const fs = sm ? 10.5 : 11.5;
      richText(ctx.t('front'), R.x + 14, R.y + (sm ? 16 : 19), sm ? 12 : 13, theme.text, 'left', 750);
      const x0 = R.x + (sm ? 14 : 20);
      const x1 = R.x + R.w - (sm ? 14 : 20);
      const cx = (x0 + x1) / 2;
      const sy = R.y + (sm ? 32 : 38);
      const sh = clamp(R.h * 0.2, 28, 56);
      const gy = sy + sh + (sm ? 46 : 52);
      const gh = R.y + R.h - gy - (sm ? 10 : 14);
      lastScreen = { x0, x1, cx, sy, sh, gy, gh };
      const X = (x: number) => cx + (x / v.Xh) * (x1 - cx);
      // Leuchtbild (dunkler Schirm, Laserfarbe, Helligkeit mit Gamma für schwache Nebenmaxima)
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = '#05070b';
      roundRect(g, x0 - 3, sy - 3, x1 - x0 + 6, sh + 6, 6);
      g.fill();
      g.restore();
      const [cr, cgc, cb] = rgbOf(v.lam);
      const m = Math.max(cr, cgc, cb, 1);
      const W = Math.round(x1 - x0);
      const prof = new Float64Array(W);
      for (let i = 0; i < W; i++) {
        let best = 0;
        for (let s = 0; s < 3; s++) {
          const x = (((x0 + i + (s + 0.5) / 3 - cx) / (x1 - cx)) * v.Xh);
          best = Math.max(best, Iat(x, v));
        }
        prof[i] = best;
      }
      for (let i = 0; i < W; i++) {
        const I = prof[i]!;
        if (I < 0.003) continue;
        const b = Math.pow(I, 0.5);
        const k = 255 / m;
        g.fillStyle = `rgb(${Math.round(Math.min(255, cr * k * b + 60 * I * I))},${Math.round(Math.min(255, cgc * k * b + 60 * I * I))},${Math.round(Math.min(255, cb * k * b + 60 * I * I))})`;
        g.fillRect(x0 + i, sy + sh * (0.5 - 0.42 * Math.sqrt(b)), 1.2, sh * 0.84 * Math.sqrt(b));
      }
      // Skala unter dem Schirmbild
      const XhMM = v.Xh * 1000;
      const step = niceStep(XhMM / (sm ? 2.5 : 4));
      g.strokeStyle = theme.axis;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, sy + sh + 5.5);
      g.lineTo(x1, sy + sh + 5.5);
      for (let t = -Math.floor(XhMM / step) * step; t <= XhMM + 1e-9; t += step) {
        const x = X(t / 1000);
        g.moveTo(Math.round(x) + 0.5, sy + sh + 2);
        g.lineTo(Math.round(x) + 0.5, sy + sh + 9);
      }
      g.stroke();
      const xt = ctx.t('axisX');
      const xtw = richWidth(xt, fs, 600);
      for (let t = -Math.floor(XhMM / step) * step; t <= XhMM + 1e-9; t += step) {
        const x = X(t / 1000);
        if (x > x1 - xtw - 16 || x < x0 + 8) continue;
        richText(t < 0 ? `−${n(-t, 1)}` : n(t, 1), x, sy + sh + 18, fs, theme.muted, 'center', 500);
      }
      richText(xt, x1, sy + sh + 18, fs, theme.muted, 'right', 600);
      // Intensitätskurve
      if (gh > 30) {
        const Y = (I: number) => gy + gh - I * gh;
        g.strokeStyle = theme.grid;
        g.beginPath();
        for (const q of [0.25, 0.5, 0.75, 1]) {
          g.moveTo(x0, Math.round(Y(q)) + 0.5);
          g.lineTo(x1, Math.round(Y(q)) + 0.5);
        }
        g.stroke();
        richText(ctx.t('axisI'), x0 + 2, gy - 9, fs, theme.muted, 'left', 600);
        // Hülle des Einzelspalts
        const envA = ease2('envA', p.env && Nof() > 1 ? 1 : 0, 6);
        if (envA > 0.01) {
          g.save();
          g.globalAlpha *= envA;
          g.strokeStyle = withAlpha(theme.muted, 0.9);
          g.lineWidth = 1.4;
          g.setLineDash([5, 4]);
          g.beginPath();
          for (let i = 0; i <= W; i += 2) {
            const x = ((x0 + i - cx) / (x1 - cx)) * v.Xh;
            const y = Y(intensity(Math.atan2(x, v.a), 1, v.lam, v.g));
            if (i) g.lineTo(x0 + i, y);
            else g.moveTo(x0 + i, y);
          }
          g.stroke();
          g.setLineDash([]);
          if (!sm) richText(ctx.t('env'), x1 - 4, Y(intensity(Math.atan2(v.Xh * 0.9, v.a), 1, v.lam, v.g)) - 9, fs - 0.5, theme.muted, 'right', 600, haloCol());
          g.restore();
        }
        const lc = inkOf(v.lam);
        g.save();
        g.strokeStyle = lc;
        g.lineWidth = sm ? 1.8 : 2.2;
        g.lineJoin = 'round';
        g.beginPath();
        for (let i = 0; i < W; i++) {
          const y = Y(prof[i]!);
          if (i) g.lineTo(x0 + i, y);
          else g.moveTo(x0 + i, y);
        }
        g.stroke();
        const fill = g.createLinearGradient(0, gy, 0, gy + gh);
        fill.addColorStop(0, laserColor(v.lam, 0.22));
        fill.addColorStop(1, laserColor(v.lam, 0.02));
        g.fillStyle = fill;
        g.lineTo(x1, gy + gh);
        g.lineTo(x0, gy + gh);
        g.closePath();
        g.fill();
        g.restore();
        g.strokeStyle = theme.axis;
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x0, gy + gh + 0.5);
        g.lineTo(x1, gy + gh + 0.5);
        g.moveTo(cx + 0.5, gy - 2);
        g.lineTo(cx + 0.5, gy + gh);
        g.stroke();
        // Ordnungen an den Hauptmaxima
        if (p.val && Nof() > 1) {
          const k = maxOrder(v.lam, v.g);
          let lastX = -1e9;
          for (let q = 0; q <= Math.min(k, 8); q++) {
            const al = maxAngle(q, v.lam, v.g);
            if (al === null) continue;
            const x = X(screenPosition(al, v.a));
            if (x > x1 - 8) break;
            const lab = `k = ${q}`;
            const w = richWidth(lab, fs - 0.5, 700) + 12;
            if (x - w / 2 < lastX + 4 || x - w / 2 < x0 + 34) continue;
            lastX = x + w / 2;
            richText(lab, x, gy - 9, fs - 0.5, lc, 'center', 750, haloCol());
          }
        }
      }
      // Messmarke
      const mA = ease2('measA', p.meas ? 1 : 0, 6);
      if (mA > 0.01) {
        const xm = ease2('xm', p.xm / 1000, 14, markDrag);
        const xp = clamp(X(xm), x0, x1);
        const out = X(xm) > x1 + 1;
        g.save();
        g.globalAlpha *= mA;
        g.strokeStyle = orange();
        g.lineWidth = 1.6;
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(xp, sy - 6);
        g.lineTo(xp, gy + gh);
        g.stroke();
        g.setLineDash([]);
        const hot = markHover || markDrag;
        if (!ctx.locked) {
          g.fillStyle = withAlpha(orange(), hot ? 0.35 : 0.18);
          g.beginPath();
          g.arc(xp, sy - 8, hot ? 12 : 9, 0, TAU);
          g.fill();
        }
        g.fillStyle = theme.bg;
        g.strokeStyle = orange();
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(xp, sy - 1);
        g.lineTo(xp - 6, sy - 10);
        g.lineTo(xp + 6, sy - 10);
        g.closePath();
        g.fill();
        g.stroke();
        const lab = tr('mark', { x: fx(p.xm, 1) }) + (out ? ' →' : '');
        const w = richWidth(lab, fs) + 16;
        const right = xp + 12 + w < R.x + R.w - 6;
        pill(right ? xp + 10 : xp - 10 - w, gy + 2, lab, orange(), 'left', fs);
        markHandle = { x: xp, y: sy - 8 };
        g.restore();
      } else markHandle = null;
      g.restore();
    }
    let markHandle: { x: number; y: number } | null = null;

    /* ---------- Karte „Maxima“ ---------- */
    function drawInfo(R: Rect, v: View, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 300 || R.h < 200;
      const pad = sm ? 12 : 16;
      const fs = sm ? 11 : 12;
      let y = R.y + (sm ? 17 : 20);
      richText(ctx.t(R.w < 260 ? 'infoTitleS' : 'infoTitle'), R.x + pad, y, sm ? 12 : 13, theme.text, 'left', 750);
      const lc = inkOf(v.lam);
      // Formel groß
      y += sm ? 26 : 32;
      richText('sin α_[k] = k · λ / g', R.x + pad, y, sm ? 14 : 16, theme.text, 'left', 700);
      y += sm ? 22 : 28;
      const gTxt = gText(v.g);
      const vals: [string, string][] = [
        [`λ = ${n(Math.round(v.lam), 0)} nm`, lc],
        [`g = ${gTxt}${isGrating() ? ` (${n(p.gl, 0)}/mm)` : ''}`, theme.text],
        [`a = ${fx(v.a, 1)} m`, theme.text],
      ];
      if (R.h < 300) {
        // flache Karte: Werte in einer Zeile
        let x = R.x + pad;
        for (const [lab, col] of vals) {
          x += richText(lab, x, y, fs - 0.5, col, 'left', 650) + 12;
        }
        y += sm ? 17 : 20;
      } else
        for (const [lab, col] of vals) {
          let s = fs;
          while (s > 10 && richWidth(lab, s, 650) > R.w - 2 * pad) s -= 0.5;
          richText(lab, R.x + pad, y, s, col, 'left', 650);
          y += sm ? 17 : 20;
        }
      // Tabelle der Maxima (beim Einzelspalt: Minima)
      y += sm ? 6 : 10;
      const single = Nof() === 1;
      const kmax = single ? Math.floor((v.g * SLIT_RATIO) / (v.lam * 1e-9)) : maxOrder(v.lam, v.g);
      const angleOf = (q: number) => (single ? (q === 0 ? null : maxAngle(q, v.lam, v.g * SLIT_RATIO)) : maxAngle(q, v.lam, v.g));
      const colK = R.x + pad + 10;
      const colA = R.x + pad + (R.w - 2 * pad) * 0.48;
      const colX = R.x + R.w - pad;
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + pad, y + 10.5);
      g.lineTo(R.x + R.w - pad, y + 10.5);
      g.stroke();
      richText(ctx.t(single ? 'thKmin' : 'thK'), single ? R.x + pad : colK, y, fs, theme.muted, single ? 'left' : 'center', 700);
      richText(ctx.t('thA'), colA, y, fs, theme.muted, 'right', 700);
      richText(ctx.t('thX'), colX, y, fs, theme.muted, 'right', 700);
      y += sm ? 18 : 22;
      const rowH = sm ? 17 : 21;
      const footer = sm ? 52 : 62;
      const fit = Math.max(1, Math.floor((R.y + R.h - footer - y + rowH / 2) / rowH));
      const first = single ? 1 : 0;
      const total = kmax - first + 1;
      let rows = Math.min(total, 6, fit);
      if (rows < total && rows >= fit) rows = Math.max(1, fit - 1);
      const xmM = p.xm / 1000;
      let best = -1;
      let bd = Infinity;
      for (let q = first; q < first + rows; q++) {
        const al = angleOf(q);
        if (al === null) continue;
        const d = Math.abs(screenPosition(al, v.a) - xmM);
        if (d < bd) {
          bd = d;
          best = q;
        }
      }
      const a1 = angleOf(1);
      const tol = 0.12 * (a1 === null ? v.Xh : screenPosition(a1, v.a));
      for (let q = first; q < first + rows; q++) {
        const al = angleOf(q);
        if (al === null) break;
        if (p.meas && q === best && bd < tol) {
          g.fillStyle = withAlpha(orange(), theme.dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 4, y - rowH / 2, R.w - 2 * pad + 8, rowH, 5);
          g.fill();
        }
        const val = p.val || q === 0;
        richText(String(q), colK, y, fs, theme.text, 'center', 700);
        richText(val ? `${fx(deg(al), 2)}°` : '?', colA, y, fs, theme.text, 'right', 600);
        richText(val ? lenText(screenPosition(al, v.a)) : '?', colX, y, fs, lc, 'right', 700);
        y += rowH;
      }
      if (rows < total) richText(tr('more', { k: String(kmax) }), R.x + pad, y, fs - 0.5, theme.muted, 'left', 600);
      // Fußzeile: Kleinwinkelnäherung und Messmarke
      const fy = R.y + R.h - (sm ? 34 : 42);
      g.strokeStyle = theme.grid;
      g.beginPath();
      g.moveTo(R.x + pad, fy - (sm ? 12 : 14));
      g.lineTo(R.x + R.w - pad, fy - (sm ? 12 : 14));
      g.stroke();
      if (!isGrating() && Nof() > 1) {
        const d = p.val ? fx(spacingSmallAngle(v.lam, v.a, v.g) * 1000, 1) : '?';
        let s = fs;
        const lab = tr('dx', { d });
        while (s > 10 && richWidth(lab, s, 700) > R.w - 2 * pad) s -= 0.5;
        richText(lab, R.x + pad, fy, s, lc, 'left', 700);
      }
      if (p.meas) {
        const al = Math.atan2(p.xm / 1000, v.a);
        const lab = tr('markInfo', { al: fx(deg(al), 2) });
        let s = fs - 0.5;
        while (s > 9.5 && richWidth(lab, s, 650) > R.w - 2 * pad) s -= 0.5;
        richText(lab, R.x + pad, fy + (sm ? 16 : 20), s, orange(), 'left', 650);
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const g = gOf();
      const a1 = maxAngle(1, p.lam, g);
      const gT = gText(g);
      if (p.N === 1 && !isGrating()) {
        const b = g * SLIT_RATIO;
        const x0 = screenPosition(Math.asin(Math.min(0.999, (p.lam * 1e-9) / b)), p.a);
        ctx.readout('max', { html: tr('ordersSlit', { b: gText(b), x0: lenText(x0) }) });
        ctx.readout('orders', null);
      } else {
        if (a1 === null) ctx.readout('max', { html: ctx.t('noFirst') });
        else {
          const small = isGrating() ? '' : tr('small', { lam: n(p.lam, 0), a: fx(p.a, 1), g: gT, dx: fx(spacingSmallAngle(p.lam, p.a, g) * 1000, 1) });
          ctx.readout('max', { html: tr('max', { lam: n(p.lam, 0), g: gT, s1: fx(Math.sin(a1), 4), a1: fx(deg(a1), 2), a: fx(p.a, 1), x1: lenText(screenPosition(a1, p.a), 2), small }) });
        }
        const k = maxOrder(p.lam, g);
        const ks = k === 0 ? '0' : `−${k} … ${k}`;
        ctx.readout('orders', { html: tr('orders', { q: fx(g / (p.lam * 1e-9), 2), k: String(k), n: String(2 * k + 1), ks }) });
      }
      if (!p.meas) ctx.readout('meas', ctx.t('measOff'));
      else {
        const t = p.xm / 1000 / p.a;
        const al = Math.atan(t);
        const I = intensity(al, Nof(), p.lam, g);
        ctx.readout('meas', { html: tr('meas', { x: fx(p.xm, 1), t: fx(t, 4), al: fx(deg(al), 2), I: n(Math.round(I * 100), 0) }) });
      }
    }

    /* ---------- Ziehen der Messmarke ---------- */
    function hitMark(px: number, py: number): boolean {
      if (!markHandle || ctx.locked || !p.meas) return false;
      const S = lastScreen;
      if (Math.hypot(px - markHandle.x, py - markHandle.y) < 16) return true;
      return !!S && Math.abs(px - markHandle.x) < 12 && py > S.sy - 20 && py < S.gy + S.gh;
    }
    function markTo(px: number): void {
      const S = lastScreen;
      if (!S) return;
      const Xh = 10 ** (soft.get('lXh') ?? Math.log10(targetXh(p.lam, gOf(), p.a)));
      const x = (Math.abs(px - S.cx) / (S.x1 - S.cx)) * Xh * 1000;
      const xm = Math.round(clamp(x, 0, 3000) * 2) / 2;
      if (xm !== p.xm) ctx.set({ xm });
    }
    surface.addTarget({
      contains: (px: number, py: number) => hitMark(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        if (!hitMark(q.px, q.py)) return false;
        markDrag = true;
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (markDrag) markTo(q.px);
      },
      pointerUp: () => {
        markDrag = false;
        surface.setCursor(markHover ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = q ? hitMark(q.px, q.py) : false;
        if (h !== markHover) {
          markHover = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'ew-resize' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => ctx.requestRender());

    return {
      update(changed, source) {
        if (source === 'init') {
          intro.play();
          nFrom = nTo = Nof();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        }
        if (Nof() !== nTo) {
          nFrom = nTo;
          nTo = Nof();
          nSwap.play();
        }
        if (source === 'replace' && !prefersReducedMotion()) ctx.clock.play();
        void changed;
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        phase += dt * 0.9;
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
        const v = view();
        surface.begin();
        drawSetup(lay.setup, v, stage(0, 0.5));
        drawScreen(lay.screen, v, stage(0.2, 0.5));
        drawInfo(lay.info, v, stage(0.32, 0.5));
        if (animating || intro.running || nSwap.running || markDrag || ctx.clock.playing) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
