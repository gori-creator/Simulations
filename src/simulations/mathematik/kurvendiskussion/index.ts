import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { analyze, degree, evalPoly, type Analysis, type Poly } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const XR = 4.5;
const STEPS = 5;

/**
 * Monotonie, Extrem- und Wendestellen Schritt für Schritt: Ableitungen,
 * notwendige Bedingung f′(x) = 0, hinreichende Bedingung über den
 * Vorzeichenwechsel, Wendestellen und schließlich Monotonie- und
 * Krümmungsintervalle. Die Koeffizienten sind frei wählbar; eine
 * Vorzeichentabelle fasst das Verhalten zusammen.
 */
export default defineSimulation({
  id: 'kurvendiskussion',
  layout: { aspect: 1.62, aspectNarrow: 0.44 },
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
    { key: 'der', type: 'boolean', group: 'view', label: L('Graphen von f′ und f″ zeigen', 'Show the graphs of f′ and f″'), default: false },
    { key: 'show', type: 'boolean', group: 'view', label: L('Ergebnisse zeigen', 'Show the results'), help: L('Aus: Werte selbst berechnen; die Schritte bleiben sichtbar.', 'Off: work out the values yourself; the steps stay visible.'), default: true },
  ],
  actions: [
    { id: 'next', label: L('Nächster Schritt', 'Next step'), primary: true },
    { id: 'restart', label: L('Von vorn', 'Start again') },
  ],
  readouts: [
    { key: 'ext', label: L('Extrempunkte', 'Extrema'), spoiler: true },
    { key: 'infl', label: L('Wendepunkte', 'Inflection points'), spoiler: true },
  ],
  presets: [
    { id: 'cubic', label: L('f(x) = x³ − 3x', 'f(x) = x³ − 3x'), values: {} },
    { id: 'hill', label: L('f(x) = −x³ + 3x²', 'f(x) = −x³ + 3x²'), values: { q: 0, a: -1, b: 3, c: 0, d: 0 } },
    { id: 'w', label: L('W-Form: 0,5x⁴ − 2x²', 'W shape: 0.5x⁴ − 2x²'), values: { q: 0.5, a: 0, b: -2, c: 0, d: 0 } },
    { id: 'terrace', label: L('Terrassenpunkt: x³', 'Terrace point: x³'), values: { q: 0, a: 1, b: 0, c: 0, d: 0, st: 4 } },
    { id: 'x4', label: L('x⁴: f″(0) = 0, trotzdem Tiefpunkt', 'x⁴: f″(0) = 0, yet a minimum'), values: { q: 1, a: 0, b: 0, c: 0, d: 0, st: 4 } },
  ],
  strings: {
    de: {
      canvas: 'Graph einer ganzrationalen Funktion bis Grad 4. Schritt für Schritt erscheinen die Kandidaten für Extremstellen, Hoch-, Tief- und Terrassenpunkte, Wendepunkte sowie farbige Monotonie- und Krümmungsintervalle. Daneben die Rechnung und eine Vorzeichentabelle.',
      stepsT: 'Untersuchung',
      s1: '1. Ableitungen bilden',
      s2: '2. Notwendige Bedingung: f′(x) = 0',
      s3: '3. Hinreichend: Vorzeichenwechsel von f′',
      s4: '4. Wendestellen: f″(x) = 0 mit VZW',
      s5: '5. Monotonie und Krümmung',
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
      s2: '2. Necessary condition: f′(x) = 0',
      s3: '3. Sufficient: sign change of f′',
      s4: '4. Inflection points: f″(x) = 0 with sign change',
      s5: '5. Monotonicity and curvature',
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
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.85, 250, h * 0.42));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.42, 290, 410));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-XR, XR], y: [-5, 5], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- weiche Anzeige ---------- */
    let shown: Poly = poly();
    let view = { y0: -5, y1: 5 };
    let lastFrame = performance.now();
    const stepT = new Tween(700, ease.outCubic);

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
      // Monotonie- und Krümmungsbänder (Schritt 5)
      if (st >= 5) {
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
      // Ableitungsgraphen
      if (p.der) {
        plot.fn((x) => evalPoly(A.d1, x), { color: withAlpha(col.d1(), 0.7), width: 2, dash: [7, 5] });
        plot.fn((x) => evalPoly(A.d2, x), { color: withAlpha(col.d2(), 0.6), width: 1.8, dash: [2, 4] });
        tag(r.x + 8, r.y + 38, `\\c{d}{f′}`, col.d1(), 'left', F(12.5, 11.5));
        tag(r.x + 40, r.y + 38, `\\c{e}{f″}`, col.d2(), 'left', F(12.5, 11.5));
      }
      // Graph von f
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f, { color: col.f(), width: 3 });
      g.restore();
      tag(r.x + 8, r.y + 14, `\\c{f}{f(x) = ${polySrc(poly())}}`, col.f(), 'left', F(13, 12));
      // Kandidaten (Schritt 2)
      if (st >= 2) {
        g.save();
        g.globalAlpha = st === 2 ? fade : 1;
        for (const x of A.candidates) {
          if (Math.abs(x) > XR) continue;
          plot.vline(x, { color: withAlpha(col.ext(), 0.45), width: 1.4, dash: [5, 4] });
          plot.point(x, 0, { color: col.ext(), radius: 4 });
        }
        g.restore();
      }
      // Extrempunkte (Schritt 3)
      if (st >= 3) {
        g.save();
        g.globalAlpha = st === 3 ? fade : 1;
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
      // Wendepunkte (Schritt 4)
      if (st >= 4) {
        g.save();
        g.globalAlpha = st === 4 ? fade : 1;
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
      plot.end();
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
      if (st >= 2) {
        rows.push({ label: ctx.t('s2'), active: st === 2 });
        rows.push({ src: lin ? `\\t{${ctx.t('const')}}` : A.candidates.length ? A.candidates.map((x, i) => `x_${i + 1} ${p.show ? `${Math.abs(x - Math.round(x * 100) / 100) < 1e-9 ? '=' : '≈'} ${n2(x)}` : '= ?'}`).join(';  ') : `\\t{${ctx.t('none')}}`, active: st === 2 });
      }
      if (st >= 3 && !lin) {
        rows.push({ label: ctx.t('s3'), active: st === 3 });
        rows.push({ src: A.extrema.length ? A.extrema.map((e) => `\\t{${kindName(e.kind)}} (${Q(n2(e.x))} | ${Q(n2(e.y))})`).join(';  ') : `\\t{${ctx.t('none')}}`, color: col.ext(), active: st === 3 });
      }
      if (st >= 4 && !lin) {
        rows.push({ label: ctx.t('s4'), active: st === 4 });
        rows.push({ src: A.inflections.length ? A.inflections.map((w) => `W(${Q(n2(w.x))} | ${Q(n2(w.y))})`).join(';  ') : `\\t{${ctx.t('none')}}`, color: col.infl(), active: st === 4 });
      }
      if (st >= 5 && !lin) {
        rows.push({ label: ctx.t('s5'), active: st === 5 });
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
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = stepsCard({ ...C, h: 0 });
      stepsCard({ x: C.x, y: C.y, w: C.w, h: Math.min(h1, C.h) });
      const tabH = F(132, 124);
      if (p.st >= 3 && A.candidates.length <= 4 && C.h - h1 - gap >= tabH) tableCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: tabH });
      if (moving || stepT.running) ctx.requestRender();
    }

    return {
      update(changed) {
        A = analyze(poly());
        if (changed.has('st')) stepT.play(reduced ? 1 : 700);
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'restart') ctx.set({ st: 1 });
        else if (id === 'next' && p.st < STEPS) ctx.set({ st: p.st + 1 });
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
