import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { analyze, degree, evalPoly, limits, symmetry, zeros, type Analysis, type Poly } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const XR = 4.5;
const STEPS = 7;
const TAN_MS = 6000;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Kurvendiskussion Schritt für Schritt: Ableitungen, Symmetrie und
 * Verhalten im Unendlichen, Nullstellen, notwendige Bedingung f′(x) = 0,
 * hinreichende Bedingung (Vorzeichenwechsel von f′ und f″-Kriterium),
 * Wendestellen und schließlich Monotonie- und Krümmungsintervalle. Unter
 * dem Graphen von f liegen die Graphen von f′ und f″ mit eingefärbtem
 * Vorzeichen, sodass man die Zusammenhänge senkrecht ablesen kann; eine
 * wandernde Tangente verbindet die Steigung von f mit dem Wert von f′.
 * Die Koeffizienten sind frei wählbar; eine Vorzeichentabelle fasst das
 * Verhalten zusammen.
 */
export default defineSimulation({
  id: 'kurvendiskussion',
  layout: { aspect: 1.62, aspectNarrow: 0.32 },
  groups: [
    { id: 'coef', label: L('Koeffizienten von f', 'Coefficients of f') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'st', type: 'number', label: L('Schritt der Untersuchung', 'Step of the investigation'), min: 1, max: STEPS, step: 1, default: 1 },
    { key: 'q', type: 'number', group: 'coef', label: L('vor x⁴', 'of x⁴'), min: -1, max: 1, step: 0.05, default: 0 },
    { key: 'a', type: 'number', group: 'coef', label: L('vor x³', 'of x³'), min: -2, max: 2, step: 0.1, default: 1 },
    { key: 'b', type: 'number', group: 'coef', label: L('vor x²', 'of x²'), min: -4, max: 4, step: 0.1, default: 0 },
    { key: 'c', type: 'number', group: 'coef', label: L('vor x', 'of x'), min: -6, max: 6, step: 0.1, default: -3 },
    { key: 'd', type: 'number', group: 'coef', label: L('Absolutglied', 'Constant'), min: -5, max: 5, step: 0.1, default: 0 },
    { key: 'der', type: 'boolean', group: 'view', label: L('Graphen von f′ und f″ darunter zeigen', 'Show the graphs of f′ and f″ below'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse zeigen', 'Show the results'), help: L('Aus: Werte selbst berechnen; die Schritte bleiben sichtbar.', 'Off: work out the values yourself; the steps stay visible.'), default: true },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'restart', label: L('Von vorn', 'Start again') },
    { id: 'tan', label: L('Tangente wandern lassen', 'Move the tangent') },
  ],
  readouts: [
    { key: 'ext', label: L('Extrempunkte', 'Extrema'), spoiler: true },
    { key: 'infl', label: L('Wendepunkte', 'Inflection points'), spoiler: true },
    { key: 'zer', label: L('Nullstellen', 'Zeros'), spoiler: true },
  ],
  presets: [
    { id: 'cubic', label: L('f(x) = x³ − 3x', 'f(x) = x³ − 3x'), values: {} },
    { id: 'hill', label: L('f(x) = −x³ + 3x²', 'f(x) = −x³ + 3x²'), values: { q: 0, a: -1, b: 3, c: 0, d: 0 } },
    { id: 'w', label: L('W-Form: 0,5x⁴ − 2x²', 'W shape: 0.5x⁴ − 2x²'), values: { q: 0.5, a: 0, b: -2, c: 0, d: 0 } },
    { id: 'terrace', label: L('Terrassenpunkt: x³', 'Terrace point: x³'), values: { q: 0, a: 1, b: 0, c: 0, d: 0, st: 6 } },
    { id: 'x4', label: L('x⁴: f″(0) = 0, trotzdem Tiefpunkt', 'x⁴: f″(0) = 0, yet a minimum'), values: { q: 1, a: 0, b: 0, c: 0, d: 0, st: 6 } },
    { id: 'full', label: L('Vollständig: −0,25x⁴ + x³', 'Complete: −0.25x⁴ + x³'), values: { q: -0.25, a: 1, b: 0, c: 0, d: 0, st: 7 } },
  ],
  strings: {
    de: {
      canvas: 'Graph einer ganzrationalen Funktion bis Grad 4. Schritt für Schritt erscheinen die Kandidaten für Extremstellen, Hoch-, Tief- und Terrassenpunkte, Wendepunkte sowie farbige Monotonie- und Krümmungsintervalle. Daneben die Rechnung und eine Vorzeichentabelle.',
      stepsT: 'Untersuchung',
      s1: '1. Ableitungen bilden',
      s2: '2. Symmetrie und Verhalten für x → ±∞',
      s3: '3. Nullstellen: f(x) = 0',
      s4: '4. Notwendige Bedingung: f′(x) = 0',
      s5: '5. Hinreichend: Vorzeichenwechsel von f′',
      s6: '6. Wendestellen: f″(x) = 0 mit VZW',
      s7: '7. Monotonie und Krümmung',
      even: 'nur gerade Exponenten: achsensymmetrisch zur y-Achse',
      odd: 'nur ungerade Exponenten: punktsymmetrisch zum Ursprung',
      nosym: 'gerade und ungerade Exponenten: keine einfache Symmetrie',
      lim: 'für x → −∞: f(x) → {a};  für x → +∞: f(x) → {b}',
      limConst: 'f ist konstant',
      f2test: 'f″-Kriterium',
      f2zero: 'f″ = 0: keine Aussage, Vorzeichenwechsel nötig',
      slope: 'Steigung',
      tabT: 'Vorzeichentabelle',
      none: 'keine',
      max: 'Hochpunkt',
      min: 'Tiefpunkt',
      saddle: 'Terrassenpunkt',
      up: 'steigt',
      down: 'fällt',
      left: 'Linkskurve',
      right: 'Rechtskurve',
      monoUp: 'streng monoton steigend',
      monoDown: 'streng monoton fallend',
      const: 'f ist konstant oder linear – keine Extrem- und Wendestellen.',
      far: '(außerhalb des Bildes)',
    },
    en: {
      canvas: 'Graph of a polynomial of degree up to 4. Step by step the candidates for extrema, maxima, minima and terrace points, inflection points and coloured intervals of monotonicity and curvature appear. Next to it the calculation and a sign chart.',
      stepsT: 'Investigation',
      s1: '1. Find the derivatives',
      s2: '2. Symmetry and behaviour for x → ±∞',
      s3: '3. Zeros: f(x) = 0',
      s4: '4. Necessary condition: f′(x) = 0',
      s5: '5. Sufficient: sign change of f′',
      s6: '6. Inflection points: f″(x) = 0 with sign change',
      s7: '7. Monotonicity and curvature',
      even: 'only even exponents: symmetric about the y-axis',
      odd: 'only odd exponents: symmetric about the origin',
      nosym: 'even and odd exponents: no simple symmetry',
      lim: 'for x → −∞: f(x) → {a};  for x → +∞: f(x) → {b}',
      limConst: 'f is constant',
      f2test: 'second-derivative test',
      f2zero: 'f″ = 0: no conclusion, check the sign change',
      slope: 'slope',
      tabT: 'Sign chart',
      none: 'none',
      max: 'maximum',
      min: 'minimum',
      saddle: 'terrace point',
      up: 'increases',
      down: 'decreases',
      left: 'concave up',
      right: 'concave down',
      monoUp: 'strictly increasing',
      monoDown: 'strictly decreasing',
      const: 'f is constant or linear – no extrema or inflection points.',
      far: '(outside the picture)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;

    const col = {
      f: () => th().series[0]!,
      d1: () => th().series[3]!,
      d2: () => th().series[4]!,
      ext: () => th().series[1]!,
      infl: () => th().series[5]!,
      up: () => th().series[2]!,
      down: () => th().series[1]!,
    };

    const poly = (): Poly => [p.d, p.c, p.b, p.a, p.q];
    let A: Analysis = analyze(poly());
    let Z: number[] = zeros(poly());
    const n2 = (v: number) => fmt.num(Math.abs(v) < 5e-4 ? 0 : v, 2);
    const Q = (s: string) => (p.show ? s : '?');

    /** Polynom als Formelquelle. */
    function polySrc(c: Poly): string {
      const d = degree(c);
      if (d < 0) return '0';
      const parts: string[] = [];
      for (let i = d; i >= 0; i--) {
        const v = Math.round(c[i]! * 1000) / 1000;
        if (Math.abs(v) < 1e-9) continue;
        const abs = Math.abs(v);
        const coef = i > 0 && Math.abs(abs - 1) < 1e-9 ? '' : fmt.num(abs, 2);
        const xs = i === 0 ? '' : i === 1 ? 'x' : `x^${i}`;
        parts.push(parts.length ? ` ${v < 0 ? '−' : '+'} ${coef}${xs}` : `${v < 0 ? '−' : ''}${coef}${xs}`);
      }
      return parts.join('') || '0';
    }

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; d1: Rect | null; d2: Rect | null; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * (p.der ? 1.35 : 0.85), 250, h * (p.der ? 0.55 : 0.42)));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.42, 290, 410));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      if (!p.der) return { plot: left, d1: null, d2: null, col: colR };
      const hf = Math.round(left.h * 0.58);
      const hd = Math.round((left.h - hf - 8) / 2);
      return {
        plot: { ...left, h: hf },
        d1: { x: left.x, y: left.y + hf + 4, w: left.w, h: hd },
        d2: { x: left.x, y: left.y + hf + 8 + hd, w: left.w, h: left.h - hf - 8 - hd },
        col: colR,
      };
    }
    const plot = new Plot(surface, { x: [-XR, XR], y: [-5, 5], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });
    const none: Rect = { x: 0, y: 0, w: 1, h: 1 };
    const plotD1 = new Plot(surface, { x: [-XR, XR], y: [-1, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().d1 ?? none, xAxis: { label: '' }, yAxis: { label: '' } });
    const plotD2 = new Plot(surface, { x: [-XR, XR], y: [-1, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().d2 ?? none, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- weiche Anzeige ---------- */
    let shown: Poly = poly();
    let view = { y0: -5, y1: 5 };
    let lastFrame = performance.now();
    const stepT = new Tween(700, ease.outCubic);
    const tanT = new Tween(TAN_MS, ease.inOutCubic);
    /** Stelle der wandernden Tangente (null: keine). */
    // Bei „Bewegung reduzieren“ steht die Tangente einige Sekunden still an einer Stelle.
    let tanStill = 0;
    const tanX = (): number | null => (tanT.running ? lerp(-XR + 0.3, XR - 0.3, tanT.value) : performance.now() < tanStill ? XR * 0.4 : null);

    function viewGoal(): { y0: number; y1: number } {
      const f = poly();
      // Bildausschnitt an den besonderen Punkten ausrichten, nicht an den steilen Rändern
      const pts = [...A.extrema, ...A.inflections].filter((e) => Math.abs(e.x) <= XR).map((e) => e.y);
      const ys = pts.length ? [...pts, evalPoly(f, 0)] : Array.from({ length: 41 }, (_, i) => evalPoly(f, -2 + i / 10));
      let lo = Math.min(...ys, 0);
      let hi = Math.max(...ys, 0);
      const pad = Math.max(1.2, (hi - lo) * 0.45);
      lo -= pad;
      hi += pad;
      return { y0: clamp(lo, -40, -0.5), y1: clamp(hi, 0.5, 40) };
    }

    /* ---------- Ergebnisse ---------- */
    const kindName = (k: string) => ctx.t(k);
    function updateReadouts(): void {
      ctx.readout('ext', A.extrema.length ? A.extrema.map((e) => `${kindName(e.kind)} (${n2(e.x)} | ${n2(e.y)})`).join('; ') : ctx.t('none'));
      ctx.readout('infl', A.inflections.length ? A.inflections.map((e) => `(${n2(e.x)} | ${n2(e.y)})`).join('; ') : ctx.t('none'));
      ctx.readout('zer', degree(poly()) <= 0 ? ctx.t('none') : Z.length ? Z.map((x) => n2(x)).join('; ') : ctx.t('none'));
    }

    /* ---------- Bausteine ---------- */
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = th();
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
    function title(x: number, y: number, label: string, color = th().muted): void {
      text(surface.g, label, x, y, { font: font(700, F(12, 11)), color, align: 'left' });
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { f: col.f(), d: col.d1(), e: col.d2(), x: col.ext(), w: col.infl(), u: col.up(), n: col.down(), m: th().muted },
    });
    function fitFormula(src: string, maxW: number, size: number, color = th().text, weight = 600) {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    function tag(x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = plot.rect;
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      left = clamp(left, r.x + 4, r.x + r.w - box.w - 4);
      const base = clamp(y + (box.asc - box.desc) / 2, r.y + box.asc + 4, r.y + r.h - box.desc - 4);
      g.save();
      g.globalAlpha = 0.88;
      g.fillStyle = th().bg;
      roundRect(g, left - 4, base - box.asc - 2, box.w + 8, box.asc + box.desc + 4, 6);
      g.fill();
      g.globalAlpha = 1;
      box.draw(g, left, base);
      g.restore();
    }

    /* ---------- Plot ---------- */
    /** Senkrechte Hilfslinien an Extrem- und Wendestellen (verbinden f, f′ und f″). */
    function guides(pl: Plot): void {
      const st = p.st;
      if (st >= 4) for (const x of A.candidates) if (Math.abs(x) <= XR) pl.vline(x, { color: withAlpha(col.ext(), 0.45), width: 1.3, dash: [5, 4] });
      if (st >= 6) for (const w of A.inflections) if (Math.abs(w.x) <= XR) pl.vline(w.x, { color: withAlpha(col.infl(), 0.5), width: 1.3, dash: [2, 4] });
    }

    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      plot.setRange([-XR, XR], [view.y0, view.y1]);
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const st = p.st;
      const fade = stepT.running ? stepT.value : 1;
      const f = (x: number) => evalPoly(shown, x);
      const fin = (k: number) => (st === k ? fade : 1);
      // Monotonie- und Krümmungsbänder (Schritt 7)
      if (st >= 7) {
        const y0 = plot.py(0);
        g.save();
        g.globalAlpha = fade;
        for (const m of A.mono) {
          if (m.sign === 0) continue;
          const a = plot.px(clamp(m.from, -XR, XR));
          const b = plot.px(clamp(m.to, -XR, XR));
          g.fillStyle = withAlpha(m.sign > 0 ? col.up() : col.down(), 0.85);
          g.fillRect(a, y0 + 3, b - a, 6);
        }
        for (const c of A.curv) {
          if (c.sign === 0) continue;
          const a = plot.px(clamp(c.from, -XR, XR));
          const b = plot.px(clamp(c.to, -XR, XR));
          g.fillStyle = withAlpha(col.infl(), c.sign > 0 ? (theme.dark ? 0.1 : 0.06) : 0);
          g.fillRect(a, r.y, b - a, r.h);
          if (b - a > 70) text(g, ctx.t(c.sign > 0 ? 'left' : 'right'), (a + b) / 2, r.y + r.h - 12, { font: font(700, F(11.5, 10.5)), color: col.infl() });
        }
        g.restore();
      }
      // Symmetrie und Verhalten im Unendlichen (Schritt 2)
      if (st >= 2 && degree(poly()) >= 1) {
        g.save();
        g.globalAlpha = fin(2);
        const sym = symmetry(poly());
        if (sym === 'even') {
          g.strokeStyle = withAlpha(col.d2(), 0.8);
          g.lineWidth = 3;
          g.setLineDash([10, 6]);
          g.beginPath();
          g.moveTo(plot.px(0), r.y);
          g.lineTo(plot.px(0), r.y + r.h);
          g.stroke();
        } else if (sym === 'odd') {
          g.fillStyle = withAlpha(col.d2(), 0.25);
          g.beginPath();
          g.arc(plot.px(0), plot.py(0), 13, 0, Math.PI * 2);
          g.fill();
          plot.point(0, 0, { color: col.d2(), radius: 4 });
        }
        const [la, lb] = limits(poly());
        const arrow = (x: number, up: boolean) => {
          const yy = up ? r.y + 30 : r.y + r.h - 30;
          g.fillStyle = col.f();
          g.beginPath();
          g.moveTo(x, yy + (up ? -12 : 12));
          g.lineTo(x - 8, yy + (up ? 2 : -2));
          g.lineTo(x + 8, yy + (up ? 2 : -2));
          g.closePath();
          g.fill();
        };
        if (la) arrow(r.x + 22, la > 0);
        if (lb) arrow(r.x + r.w - 22, lb > 0);
        g.restore();
      }
      // Graph von f
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f, { color: col.f(), width: 3 });
      g.restore();
      tag(r.x + 8, r.y + 14, `\\c{f}{f(x) = ${polySrc(poly())}}`, col.f(), 'left', F(13, 12));
      // Nullstellen (Schritt 3)
      if (st >= 3) {
        g.save();
        g.globalAlpha = fin(3);
        Z.forEach((x, i) => {
          if (Math.abs(x) > XR) return;
          plot.point(x, 0, { color: theme.text, radius: 5, hollow: true });
          if (p.show && st === 3) {
            const [px, py] = plot.toPx(x, 0);
            tag(px, py + 18, `N_${i + 1}(${n2(x)} | 0)`, theme.text, 'center', F(11.5, 10.5));
          }
        });
        g.restore();
      }
      // Kandidaten (Schritt 4)
      if (st >= 4) {
        g.save();
        g.globalAlpha = fin(4);
        guides(plot);
        for (const x of A.candidates) if (Math.abs(x) <= XR) plot.point(x, 0, { color: col.ext(), radius: 4 });
        g.restore();
      }
      // Extrempunkte (Schritt 5)
      if (st >= 5) {
        g.save();
        g.globalAlpha = fin(5);
        for (const e of A.extrema) {
          if (Math.abs(e.x) > XR) continue;
          plot.point(e.x, e.y, { color: col.ext(), radius: 6.5, hollow: e.kind === 'saddle' });
          const [px, py] = plot.toPx(e.x, e.y);
          const short = e.kind === 'max' ? 'H' : e.kind === 'min' ? 'T' : 'TP';
          const lab = p.show ? `\\c{x}{${short}(${n2(e.x)} | ${n2(e.y)})}` : `\\c{x}{${short}}`;
          tag(px, py + (e.kind === 'max' ? -18 : 18), lab, col.ext(), 'center', F(12.5, 11.5));
        }
        g.restore();
      }
      // Wendepunkte (Schritt 6)
      if (st >= 6) {
        g.save();
        g.globalAlpha = fin(6);
        for (const w of A.inflections) {
          if (Math.abs(w.x) > XR) continue;
          plot.point(w.x, w.y, { color: col.infl(), radius: 6 });
          // Wendetangente
          const m = evalPoly(A.d1, w.x);
          plot.segment([w.x - 0.8, w.y - 0.8 * m], [w.x + 0.8, w.y + 0.8 * m], { color: withAlpha(col.infl(), 0.8), width: 1.8 });
          const [px, py] = plot.toPx(w.x, w.y);
          tag(px + 10, py + 2, p.show ? `\\c{w}{W(${n2(w.x)} | ${n2(w.y)})}` : '\\c{w}{W}', col.infl(), 'left', F(12.5, 11.5));
        }
        g.restore();
      }
      // wandernde Tangente
      const tx = tanX();
      if (tx !== null) {
        const y = f(tx);
        const m = evalPoly(A.d1, tx);
        // feste Länge auf dem Bildschirm, egal wie steil
        const d = 60 / Math.hypot(r.w / (2 * XR), (m * r.h) / (view.y1 - view.y0));
        plot.segment([tx - d, y - m * d], [tx + d, y + m * d], { color: col.d1(), width: 2.6 });
        plot.point(tx, y, { color: col.d1(), radius: 6 });
        const [px, py] = plot.toPx(tx, y);
        tag(px, py - 20, `\\c{d}{\\t{${ctx.t('slope')}} m = ${n2(m)}}`, col.d1(), 'center', F(12, 11));
      }
      plot.end();
    }

    /** Graph von f′ bzw. f″ unter dem Graphen von f, Vorzeichen eingefärbt. */
    function drawDeriv(pl: Plot, c: Poly, name: string, color: string): void {
      const g = surface.g;
      const theme = th();
      // Maßstab an den besonderen Stellen ausrichten, damit Vorzeichenwechsel sichtbar bleiben
      const xs = [...A.candidates, ...A.inflections.map((w) => w.x), ...Z].filter((x) => Math.abs(x) <= XR);
      const R0 = clamp(Math.max(0, ...xs.map(Math.abs)) + 0.8, 1.5, XR);
      let mx = 0.5;
      for (let i = 0; i <= 90; i++) mx = Math.max(mx, Math.abs(evalPoly(c, -R0 + (2 * R0 * i) / 90)));
      pl.setRangePadded([-XR, XR], [-mx, mx], { top: 8, bottom: 8 });
      pl.begin();
      pl.axes();
      const r = pl.rect;
      const yc = (v: number) => clamp(v, -mx * 1.3, mx * 1.3);
      pl.fillBetween((u) => Math.max(yc(evalPoly(c, u)), 0), () => 0, -XR, XR, { fill: withAlpha(col.up(), theme.dark ? 0.32 : 0.2) });
      pl.fillBetween((u) => Math.min(yc(evalPoly(c, u)), 0), () => 0, -XR, XR, { fill: withAlpha(col.down(), theme.dark ? 0.32 : 0.2) });
      pl.fn((u) => yc(evalPoly(c, u)), { color, width: 2.2 });
      if (p.st >= 4) guides(pl);
      const tx = tanX();
      if (tx !== null && name === 'f′') {
        pl.segment([tx, 0], [tx, yc(evalPoly(c, tx))], { color, width: 2 });
        pl.point(tx, yc(evalPoly(c, tx)), { color, radius: 5 });
      }
      text(g, `${name}(x)`, r.x + 8, r.y + 10, { font: `italic 700 ${F(12.5, 11.5)}px ${theme.mathFont}`, color, align: 'left' });
      pl.end();
    }

    /* ---------- Karten ---------- */
    function stepsCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad - 8;
      const fs = F(13.5, 12.5);
      const st = p.st;
      type Row = { label?: string; src?: string; color?: string; active: boolean };
      const rows: Row[] = [];
      const f = poly();
      const lin = degree(f) <= 1;
      rows.push({ label: ctx.t('s1'), active: st === 1 });
      rows.push({ src: `\\c{d}{f′(x) = ${polySrc(A.d1)}}`, active: st === 1 });
      rows.push({ src: `\\c{e}{f″(x) = ${polySrc(A.d2)}}`, active: st === 1 });
      const nonconst = degree(f) >= 1;
      if (st >= 2) {
        rows.push({ label: ctx.t('s2'), active: st === 2 });
        if (!nonconst) rows.push({ src: `\\t{${ctx.t('limConst')}}`, active: st === 2 });
        else {
          rows.push({ src: `\\t{${ctx.t(symmetry(f) === 'even' ? 'even' : symmetry(f) === 'odd' ? 'odd' : 'nosym')}}`, color: col.d2(), active: st === 2 });
          const [la, lb] = limits(f);
          const inf = (v: number) => (v > 0 ? '+∞' : '−∞');
          rows.push({ src: `\\t{${tr('lim', { a: p.show ? inf(la) : '?', b: p.show ? inf(lb) : '?' })}}`, active: st === 2 });
        }
      }
      if (st >= 3) {
        rows.push({ label: ctx.t('s3'), active: st === 3 });
        rows.push({ src: !nonconst ? `\\t{${ctx.t('none')}}` : Z.length ? Z.map((x, i) => `x_${i + 1} ${p.show ? `${Math.abs(x - Math.round(x * 100) / 100) < 1e-9 ? '=' : '≈'} ${n2(x)}` : '= ?'}`).join(';  ') : `\\t{${ctx.t('none')}}`, active: st === 3 });
      }
      if (st >= 4) {
        rows.push({ label: ctx.t('s4'), active: st === 4 });
        rows.push({ src: lin ? `\\t{${ctx.t('const')}}` : A.candidates.length ? A.candidates.map((x, i) => `x_${i + 1} ${p.show ? `${Math.abs(x - Math.round(x * 100) / 100) < 1e-9 ? '=' : '≈'} ${n2(x)}` : '= ?'}`).join(';  ') : `\\t{${ctx.t('none')}}`, active: st === 4 });
      }
      if (st >= 5 && !lin) {
        rows.push({ label: ctx.t('s5'), active: st === 5 });
        // je Extrempunkt eine Zeile, dahinter das f″-Kriterium als Gegenprobe
        if (!A.extrema.length) rows.push({ src: `\\t{${ctx.t('none')}}`, color: col.ext(), active: st === 5 });
        for (const e of A.extrema) {
          const v = evalPoly(A.d2, e.x);
          const test = Math.abs(v) < 1e-9 ? 'f″ = 0' : `f″(${Q(n2(e.x))}) ${p.show ? `≈ ${n2(v)} ` : ''}${v < 0 ? '< 0' : '> 0'}`;
          rows.push({ src: `\\t{${kindName(e.kind)}} (${Q(n2(e.x))} | ${Q(n2(e.y))})   \\c{m}{${test}}`, color: col.ext(), active: st === 5 });
        }
        if (A.extrema.length) rows.push({ src: `\\t{${ctx.t('f2test')}: f″ < 0 ⇒ ${ctx.t('max')}, f″ > 0 ⇒ ${ctx.t('min')}}`, color: theme.muted, active: st === 5 });
        if (A.extrema.some((e) => Math.abs(evalPoly(A.d2, e.x)) < 1e-9)) rows.push({ src: `\\t{${ctx.t('f2zero')}}`, color: theme.muted, active: st === 5 });
      }
      if (st >= 6 && !lin) {
        rows.push({ label: ctx.t('s6'), active: st === 6 });
        rows.push({ src: A.inflections.length ? A.inflections.map((w) => `W(${Q(n2(w.x))} | ${Q(n2(w.y))})`).join(';  ') : `\\t{${ctx.t('none')}}`, color: col.infl(), active: st === 6 });
      }
      if (st >= 7 && !lin) {
        rows.push({ label: ctx.t('s7'), active: st === 7 });
        const iv = (from: number, to: number) => (!Number.isFinite(from) && !Number.isFinite(to) ? 'ℝ' : !Number.isFinite(from) ? `x ≤ ${Q(n2(to))}` : !Number.isFinite(to) ? `x ≥ ${Q(n2(from))}` : `${Q(n2(from))} ≤ x ≤ ${Q(n2(to))}`);
        for (const m of A.mono) if (m.sign !== 0) rows.push({ src: `\\t{${ctx.t(m.sign > 0 ? 'monoUp' : 'monoDown')}:} ${iv(m.from, m.to)}`, color: m.sign > 0 ? col.up() : col.down(), active: true });
      }
      const boxes = rows.map((r) => (r.src ? fitFormula(r.src, maxW, fs, r.color ?? theme.text) : null));
      const h = 28 + rows.reduce((s, r, i) => s + (r.label ? 19 : boxes[i]!.asc + boxes[i]!.desc + 5), 0) + 8;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.f(), 0.03);
      title(R.x + pad, R.y + 16, `${ctx.t('stepsT')} (${st}/${STEPS})`, col.f());
      let y = R.y + 26;
      rows.forEach((r, i) => {
        if (r.label) {
          text(g, r.label, R.x + pad, y + 10, { font: font(700, F(12, 11)), color: r.active ? theme.text : theme.muted, align: 'left' });
          y += 19;
        } else {
          const b = boxes[i]!;
          b.draw(g, R.x + pad + 8, y + b.asc);
          y += b.asc + b.desc + 5;
        }
      });
      return h;
    }

    function tableCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('tabT'));
      const xs = A.candidates;
      const cols = 2 * xs.length + 1;
      const lw = F(42, 36);
      const cw = (R.w - 2 * pad - lw) / cols;
      const y1 = R.y + 38;
      const y2 = y1 + F(26, 24);
      const y3 = y2 + F(26, 24);
      const fl = `italic 700 ${F(13, 12)}px ${theme.mathFont}`;
      text(g, 'x', R.x + pad, y1, { font: fl, color: theme.muted, align: 'left' });
      text(g, 'f′(x)', R.x + pad, y2, { font: fl, color: col.d1(), align: 'left' });
      text(g, 'f', R.x + pad, y3, { font: fl, color: col.f(), align: 'left' });
      const cx = (i: number) => R.x + pad + lw + cw * (i + 0.5);
      const fv = font(700, F(12.5, 11.5));
      for (let i = 0; i < cols; i++) {
        const isPt = i % 2 === 1;
        const k = (i - 1) / 2;
        // Kopfzeile
        let head: string;
        if (isPt) head = `${Q(n2(xs[k]!))}`;
        else if (xs.length === 0) head = 'ℝ';
        else if (i === 0) head = `< ${Q(n2(xs[0]!))}`;
        else if (i === cols - 1) head = `> ${Q(n2(xs[xs.length - 1]!))}`;
        else head = '…';
        text(g, head, cx(i), y1, { font: font(600, F(11.5, 10.5)), color: theme.muted });
        // Vorzeichen von f′
        const mid = isPt ? xs[k]! : xs.length === 0 ? 0 : i === 0 ? xs[0]! - 1 : i === cols - 1 ? xs[xs.length - 1]! + 1 : (xs[(i - 2) / 2]! + xs[i / 2]!) / 2;
        const s = isPt ? 0 : Math.sign(evalPoly(A.d1, mid));
        const show = p.show;
        text(g, show ? (s > 0 ? '+' : s < 0 ? '−' : '0') : '?', cx(i), y2, { font: fv, color: s > 0 ? col.up() : s < 0 ? col.down() : theme.text });
        // Verhalten von f
        let fb = s > 0 ? '↗' : s < 0 ? '↘' : '';
        if (isPt) {
          const e = A.extrema[k];
          fb = e ? (e.kind === 'max' ? 'H' : e.kind === 'min' ? 'T' : 'TP') : '';
        }
        text(g, show ? fb : '?', cx(i), y3, { font: font(700, F(15, 13.5)), color: isPt ? col.ext() : s > 0 ? col.up() : col.down() });
      }
      // Trennlinien
      g.strokeStyle = theme.dark ? '#273142' : '#e3e8ef';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + pad, y1 + 12);
      g.lineTo(R.x + R.w - pad, y1 + 12);
      g.moveTo(R.x + pad + lw - 6, y1 - 10);
      g.lineTo(R.x + pad + lw - 6, y3 + 12);
      g.stroke();
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 9);
      let moving = false;
      const goal = poly();
      shown = shown.map((c, i) => {
        const d = goal[i]! - c;
        if (Math.abs(d) < 1e-4) return goal[i]!;
        moving = true;
        return c + d * k;
      });
      const vg = viewGoal();
      const kv = reduced ? 1 : 1 - Math.exp(-dt * 5);
      for (const key of ['y0', 'y1'] as const) {
        const d = vg[key] - view[key];
        if (Math.abs(d) < 1e-3) view[key] = vg[key];
        else {
          view[key] += d * kv;
          moving = true;
        }
      }
      surface.begin();
      plot.resize();
      plotD1.resize();
      plotD2.resize();
      drawPlot();
      if (p.der) {
        drawDeriv(plotD1, A.d1, 'f′', col.d1());
        drawDeriv(plotD2, A.d2, 'f″', col.d2());
      }
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = stepsCard({ ...C, h: 0 });
      stepsCard({ x: C.x, y: C.y, w: C.w, h: Math.min(h1, C.h) });
      const tabH = F(132, 124);
      if (p.st >= 5 && A.candidates.length <= 4 && C.h - h1 - gap >= tabH) tableCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: tabH });
      if (moving || stepT.running || tanT.running) ctx.requestRender();
    }

    return {
      update(changed) {
        A = analyze(poly());
        Z = zeros(poly());
        if (changed.has('st')) stepT.play(reduced ? 1 : 700);
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'restart') ctx.set({ st: 1 });
        else if (id === 'next' && p.st < STEPS) ctx.set({ st: p.st + 1 });
        else if (id === 'tan') {
          if (reduced) {
            tanStill = performance.now() + 5000;
            setTimeout(() => ctx.requestRender(), 5100);
          } else tanT.play(TAN_MS);
          ctx.requestRender();
        }
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
