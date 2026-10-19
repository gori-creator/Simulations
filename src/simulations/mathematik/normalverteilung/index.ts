import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { cdf, pdf, prob, sigmaRule, zScore } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Sit = 'abs' | 'iq' | 'fill';
type Typ = 'between' | 'le' | 'ge';

/**
 * Normalverteilung: Dichtekurve mit ziehbaren Grenzen a und b, die
 * Wahrscheinlichkeit als Fläche, darunter die Verteilungsfunktion Φ mit der
 * Differenz Φ(b) − Φ(a). Sigma-Regeln per Knopfdruck, Standardisierung
 * z = (x − μ)/σ und zwei Sachsituationen (IQ, Abfüllmenge).
 */
export default defineSimulation({
  id: 'normalverteilung',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.46 },
  groups: [
    { id: 'dist', label: L('Verteilung', 'Distribution') },
    { id: 'int', label: L('Ereignis', 'Event') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'abs', label: L('allgemein (μ, σ wählbar)', 'general (choose μ, σ)') },
        { value: 'iq', label: L('Intelligenzquotient (μ = 100, σ = 15)', 'IQ (μ = 100, σ = 15)') },
        { value: 'fill', label: L('Abfüllmenge (μ = 500 ml, σ = 4 ml)', 'Filling volume (μ = 500 ml, σ = 4 ml)') },
      ],
      default: 'abs',
    },
    { key: 'mu', type: 'number', group: 'dist', label: L('Erwartungswert μ', 'Mean μ'), min: -3, max: 3, step: 0.1, default: 0, visibleIf: (v) => v.sit === 'abs' },
    { key: 'sg', type: 'number', group: 'dist', label: L('Standardabweichung σ', 'Standard deviation σ'), min: 0.4, max: 2.5, step: 0.1, default: 1, visibleIf: (v) => v.sit === 'abs' },
    {
      key: 'typ',
      type: 'choice',
      group: 'int',
      label: L('Art', 'Type'),
      options: [
        { value: 'between', label: L('a ≤ X ≤ b', 'a ≤ X ≤ b') },
        { value: 'le', label: L('X ≤ b', 'X ≤ b') },
        { value: 'ge', label: L('X ≥ a', 'X ≥ a') },
      ],
      default: 'between',
    },
    { key: 'a', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: -6, max: 6, step: 0.1, default: -1, visibleIf: (v) => v.sit === 'abs' && v.typ !== 'le' },
    { key: 'b', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: -6, max: 6, step: 0.1, default: 1, visibleIf: (v) => v.sit === 'abs' && v.typ !== 'ge' },
    { key: 'ia', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: 40, max: 160, step: 1, default: 85, visibleIf: (v) => v.sit === 'iq' && v.typ !== 'le' },
    { key: 'ib', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: 40, max: 160, step: 1, default: 115, visibleIf: (v) => v.sit === 'iq' && v.typ !== 'ge' },
    { key: 'fa', type: 'number', group: 'int', label: L('Grenze a', 'Bound a'), min: 484, max: 516, step: 0.5, default: 496, unit: 'ml', visibleIf: (v) => v.sit === 'fill' && v.typ !== 'le' },
    { key: 'fb', type: 'number', group: 'int', label: L('Grenze b', 'Bound b'), min: 484, max: 516, step: 0.5, default: 504, unit: 'ml', visibleIf: (v) => v.sit === 'fill' && v.typ !== 'ge' },
    { key: 'cdf', type: 'boolean', group: 'view', label: L('Verteilungsfunktion Φ zeigen', 'Show the distribution function Φ'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Wahrscheinlichkeit zeigen', 'Show the probability'), help: L('Aus: Wahrscheinlichkeit selbst bestimmen.', 'Off: find the probability yourself.'), default: true },
  ],
  actions: [
    { id: 'r1', label: L('μ ± σ', 'μ ± σ'), primary: true },
    { id: 'r2', label: L('μ ± 2σ', 'μ ± 2σ') },
    { id: 'r3', label: L('μ ± 3σ', 'μ ± 3σ') },
  ],
  readouts: [
    { key: 'p', label: L('Wahrscheinlichkeit', 'Probability'), spoiler: true },
    { key: 'z', label: L('Standardisiert', 'Standardised'), spoiler: true },
  ],
  presets: [
    { id: 'std', label: L('Standardnormalverteilung', 'Standard normal distribution'), values: {} },
    { id: 'wide', label: L('Breite Glocke: σ = 2', 'Wide bell: σ = 2'), values: { sg: 2, a: -2, b: 2 } },
    { id: 'iq', label: L('IQ über 130', 'IQ above 130'), values: { sit: 'iq', typ: 'ge', ia: 130 } },
    { id: 'iq2', label: L('IQ zwischen 85 und 115', 'IQ between 85 and 115'), values: { sit: 'iq', typ: 'between', ia: 85, ib: 115 } },
    { id: 'fill', label: L('Flasche mit weniger als 495 ml', 'Bottle with less than 495 ml'), values: { sit: 'fill', typ: 'le', fb: 495 } },
  ],
  strings: {
    de: {
      canvas: 'Glockenkurve der Normalverteilung mit ziehbaren Grenzen a und b; die Fläche darunter ist die Wahrscheinlichkeit. Darunter die Verteilungsfunktion Φ, an der man die Wahrscheinlichkeit als Differenz Φ(b) − Φ(a) abliest. Daneben Rechnung, Standardisierung und Sigma-Regeln.',
      probT: 'Wahrscheinlichkeit',
      rulesT: 'Sigma-Regeln',
      densT: 'Dichtefunktion',
      std: 'Standardisiert',
      area: 'Fläche',
      inflect: 'Wendestelle',
      iqUnit: 'IQ',
      ml: 'ml',
      cdfT: 'Verteilungsfunktion Φ(x) = P(X ≤ x)',
    },
    en: {
      canvas: 'Bell curve of the normal distribution with draggable bounds a and b; the area under it is the probability. Below it the distribution function Φ, where the probability is the difference Φ(b) − Φ(a). Next to it the calculation, standardisation and sigma rules.',
      probT: 'Probability',
      rulesT: 'Sigma rules',
      densT: 'Density',
      std: 'Standardised',
      area: 'area',
      inflect: 'point of inflection',
      iqUnit: 'IQ',
      ml: 'ml',
      cdfT: 'Distribution function Φ(x) = P(X ≤ x)',
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
    const sit = () => p.sit as Sit;
    const typ = () => p.typ as Typ;

    const col = {
      f: () => th().series[0]!,
      area: () => th().series[4]!,
      cdf: () => th().series[5]!,
      a: () => th().series[3]!,
      b: () => th().series[1]!,
      rule: () => th().series[2]!,
    };

    /* ---------- Verteilung und Ereignis ---------- */
    function dist(): { mu: number; s: number; a: number; b: number; unit: string; dec: number; step: number } {
      if (sit() === 'iq') return { mu: 100, s: 15, a: p.ia, b: p.ib, unit: '', dec: 0, step: 1 };
      if (sit() === 'fill') return { mu: 500, s: 4, a: p.fa, b: p.fb, unit: ` ${ctx.t('ml')}`, dec: 1, step: 0.5 };
      return { mu: p.mu, s: p.sg, a: p.a, b: p.b, unit: '', dec: 1, step: 0.1 };
    }
    /** Wirksame Grenzen (−∞ / +∞ bei einseitigen Ereignissen). */
    function bounds(): { lo: number; hi: number } {
      const d = dist();
      const lo = typ() === 'le' ? -Infinity : Math.min(d.a, typ() === 'between' ? d.b : Infinity);
      const hi = typ() === 'ge' ? Infinity : Math.max(d.b, typ() === 'between' ? d.a : -Infinity);
      return { lo, hi };
    }
    function P(): number {
      const d = dist();
      const { lo, hi } = bounds();
      return prob(lo, hi, d.mu, d.s);
    }
    const xRange = (): [number, number] => {
      const d = dist();
      return sit() === 'abs' ? [-6, 6] : [d.mu - 4 * d.s, d.mu + 4 * d.s];
    };

    /* ---------- Zahlen ---------- */
    const pct = (v: number) => `${fmt.num(v * 100, v < 0.001 ? 3 : 1)} %`;
    const p4 = (v: number) => fmt.fixed(v, 4);
    const xn = (v: number) => fmt.num(v, dist().dec);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { dens: Rect; cdf: Rect | null; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * (p.cdf ? 1.15 : 0.75), 260, h * 0.56));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.38, 270, 370));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      if (!p.cdf) return { dens: left, cdf: null, col: colR };
      const dh = Math.round(left.h * 0.6);
      return { dens: { ...left, h: dh }, cdf: { x: left.x, y: left.y + dh + 6, w: left.w, h: left.h - dh - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [-6, 6], y: [0, 0.45], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().dens, xAxis: { label: 'x' }, yAxis: { label: '' } });
    const plotC = new Plot(surface, { x: [-6, 6], y: [0, 1], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().cdf ?? { x: -10, y: -10, w: 1, h: 1 }, xAxis: { label: 'x' }, yAxis: { label: '' } });

    /* ---------- Griffe ---------- */
    let dragging = 0;
    const setBound = (which: 'a' | 'b', x: number) => {
      dragging = performance.now();
      const d = dist();
      const [x0, x1] = xRange();
      const v = Math.round(clamp(x, x0, x1) / d.step) * d.step;
      const key = sit() === 'abs' ? which : sit() === 'iq' ? (which === 'a' ? 'ia' : 'ib') : which === 'a' ? 'fa' : 'fb';
      ctx.set({ [key]: Number(v.toFixed(2)) });
    };
    plot.addHandle({ get: () => [shown.a, 0], set: (x) => setBound('a', x), axis: 'x', enabled: () => !ctx.locked && typ() !== 'le', color: () => col.a() });
    plot.addHandle({ get: () => [shown.b, 0], set: (x) => setBound('b', x), axis: 'x', enabled: () => !ctx.locked && typ() !== 'ge', color: () => col.b() });

    /* ---------- Ergebnisse ---------- */
    function evLabel(): string {
      const d = dist();
      if (typ() === 'le') return `P(X ≤ ${xn(d.b)})`;
      if (typ() === 'ge') return `P(X ≥ ${xn(d.a)})`;
      const { lo, hi } = bounds();
      return `P(${xn(lo)} ≤ X ≤ ${xn(hi)})`;
    }
    function updateReadouts(): void {
      const d = dist();
      ctx.readout('p', `${evLabel()} ≈ ${p4(P())} ≈ ${pct(P())}`);
      const z = (x: number) => fmt.num(zScore(x, d.mu, d.s), 2);
      if (typ() === 'le') ctx.readout('z', `z = ${z(d.b)}`);
      else if (typ() === 'ge') ctx.readout('z', `z = ${z(d.a)}`);
      else ctx.readout('z', `z₁ = ${z(Math.min(d.a, d.b))}, z₂ = ${z(Math.max(d.a, d.b))}`);
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
      palette: { f: col.f(), A: col.area(), c: col.cdf(), a: col.a(), b: col.b(), r: col.rule(), m: th().muted },
    });
    function fitFormula(src: string, maxW: number, size: number, color = th().text, weight = 600) {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > 9.5) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    function line(src: string, x: number, y: number, maxW: number, size: number, color = th().text): number {
      const box = fitFormula(src, maxW, size, color);
      box.draw(surface.g, x, y + box.asc);
      return y + box.asc + box.desc;
    }
    function tag(pl: Plot, x: number, y: number, src: string, color: string, align: 'left' | 'center' | 'right' = 'left', size = F(13, 12)): void {
      const g = surface.g;
      const box = formula(g, src, fstyle(size, color, 700));
      const r = pl.rect;
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

    /* ---------- weiche Anzeige ---------- */
    const d0 = dist();
    let shown = { mu: d0.mu, s: d0.s, a: d0.a, b: d0.b, x0: xRange()[0], x1: xRange()[1] };
    let lastFrame = performance.now();
    const intro = new Tween(900, ease.outCubic);

    /* ---------- Dichte ---------- */
    function drawDensity(): void {
      const g = surface.g;
      const theme = th();
      const { mu, s } = shown;
      const yMax = Math.max(sit() === 'abs' ? 0.42 : 0, pdf(mu, mu, s)) * 1.18;
      plot.setRangePadded([shown.x0, shown.x1], [0, yMax], { left: F(40, 32), bottom: F(26, 24), top: 10, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const f = (x: number) => pdf(x, mu, s);
      // Fläche
      const lo = typ() === 'le' ? shown.x0 - 1 : Math.min(shown.a, typ() === 'between' ? shown.b : Infinity);
      const hi = typ() === 'ge' ? shown.x1 + 1 : Math.max(shown.b, typ() === 'between' ? shown.a : -Infinity);
      const reveal = intro.running ? intro.value : 1;
      plot.fillBetween(f, () => 0, lo, hi, { fill: withAlpha(col.area(), (theme.dark ? 0.42 : 0.3) * reveal) });
      // σ-Markierungen: Wendestellen μ ± σ
      for (const k of [-1, 1]) {
        const x = mu + k * s;
        plot.segment([x, 0], [x, f(x)], { color: withAlpha(theme.text, 0.35), width: 1.2, dash: [3, 4] });
        plot.point(x, f(x), { color: col.f(), radius: 3.5 });
      }
      plot.segment([mu, 0], [mu, f(mu)], { color: withAlpha(theme.text, 0.45), width: 1.4, dash: [6, 4] });
      // σ-Klammer
      const yb = f(mu + s) * 0.55;
      const [x1p, ybp] = plot.toPx(mu, yb);
      const x2p = plot.px(mu + s);
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.65);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(x1p, ybp - 4);
      g.lineTo(x1p, ybp + 4);
      g.moveTo(x1p, ybp);
      g.lineTo(x2p, ybp);
      g.moveTo(x2p, ybp - 4);
      g.lineTo(x2p, ybp + 4);
      g.stroke();
      g.restore();
      tag(plot, (x1p + x2p) / 2, ybp - 12, 'σ', theme.text, 'center', F(13, 12));
      tag(plot, x1p + 6, r.y + 12, 'μ', theme.text, 'left', F(13, 12));
      // Kurve
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(f, { color: col.f(), width: 3 });
      g.restore();
      // Grenzen
      const bound = (x: number, c: string, name: string) => {
        plot.segment([x, 0], [x, f(x)], { color: c, width: 2.2 });
        plot.point(x, 0, { color: c, radius: 6.5 });
        const [px] = plot.toPx(x, 0);
        tag(plot, px, plot.py(0) - 14, `\\c{${name}}{${name}}`, c, 'center', F(13, 12));
      };
      if (typ() !== 'le') bound(shown.a, col.a(), 'a');
      if (typ() !== 'ge') bound(shown.b, col.b(), 'b');
      // Flächenwert
      if (p.show) {
        const xm = clamp((Math.max(lo, shown.x0) + Math.min(hi, shown.x1)) / 2, shown.x0 + 0.5, shown.x1 - 0.5);
        const ym = f(clamp(mu, Math.max(lo, shown.x0), Math.min(hi, shown.x1))) * 0.42;
        const [px, py] = plot.toPx(xm, ym);
        tag(plot, px, py, `\\c{A}{${pct(P())}}`, col.area(), 'center', F(15, 13.5));
      }
      plot.end();
    }

    /* ---------- Verteilungsfunktion ---------- */
    function drawCdf(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const { mu, s } = shown;
      plotC.setRangePadded([shown.x0, shown.x1], [0, 1], { left: F(40, 32), bottom: F(22, 20), top: 18, right: 12 });
      plotC.begin();
      plotC.grid();
      plotC.axes();
      const F_ = (x: number) => cdf(x, mu, s);
      plotC.fn(F_, { color: col.cdf(), width: 2.6 });
      const r = plotC.rect;
      text(g, ctx.t('cdfT'), r.x + 8, R.y + 9, { font: font(700, F(11.5, 10.5)), color: col.cdf(), align: 'left' });
      const hasA = typ() !== 'le';
      const hasB = typ() !== 'ge';
      const fa = hasA ? F_(shown.a) : 0;
      const fb = hasB ? F_(shown.b) : 1;
      const mark = (x: number, v: number, c: string, name: string) => {
        plotC.segment([x, 0], [x, v], { color: withAlpha(c, 0.6), width: 1.4, dash: [4, 3] });
        plotC.segment([shown.x0, v], [x, v], { color: withAlpha(c, 0.6), width: 1.4, dash: [4, 3] });
        plotC.point(x, v, { color: c, radius: 4.5 });
        if (p.show) tag(plotC, plotC.px(shown.x0) + 6, plotC.py(v) + (v > 0.8 ? 10 : -10), `Φ(\\c{${name}}{${name}}) ≈ ${p4(v)}`, c, 'left', F(11.5, 10.5));
      };
      if (hasA) mark(shown.a, fa, col.a(), 'a');
      if (hasB) mark(shown.b, fb, col.b(), 'b');
      // Differenz als Balken am rechten Rand
      const xr = r.x + r.w - 18;
      const y1 = plotC.py(Math.min(fa, fb));
      const y2 = plotC.py(Math.max(fa, fb));
      g.save();
      g.fillStyle = withAlpha(col.area(), theme.dark ? 0.6 : 0.45);
      g.fillRect(xr - 5, y2, 10, y1 - y2);
      g.strokeStyle = col.area();
      g.lineWidth = 1.5;
      g.strokeRect(xr - 5, y2, 10, y1 - y2);
      g.restore();
      plotC.end();
    }

    /* ---------- Karten ---------- */
    function probCard(R: Rect): number {
      const g = surface.g;
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const d = dist();
      const fs = F(14.5, 13);
      const rows: string[] = [];
      const z = (x: number) => fmt.num(zScore(x, d.mu, d.s), 2);
      const pv = P();
      const head = sit() === 'abs' ? `X \\t{~} N(μ = ${fmt.num(d.mu, 1)}; σ = ${fmt.num(d.s, 1)})` : `μ = ${fmt.num(d.mu, 0)}${d.unit}, σ = ${fmt.num(d.s, 0)}${d.unit}`;
      rows.push(head);
      if (typ() === 'le') {
        rows.push(`\\c{A}{P(X ≤ \\c{b}{${xn(d.b)}})} = Φ(\\c{b}{${xn(d.b)}}) ≈ \\c{A}{${Q(p4(pv))}}`);
        rows.push(`\\t{${ctx.t('std')}:} z = \\f{${xn(d.b)} − ${xn(d.mu)}}{${xn(d.s)}} = ${z(d.b)}`);
      } else if (typ() === 'ge') {
        rows.push(`\\c{A}{P(X ≥ \\c{a}{${xn(d.a)}})} = 1 − Φ(\\c{a}{${xn(d.a)}}) ≈ \\c{A}{${Q(p4(pv))}}`);
        rows.push(`\\t{${ctx.t('std')}:} z = \\f{${xn(d.a)} − ${xn(d.mu)}}{${xn(d.s)}} = ${z(d.a)}`);
      } else {
        const lo = Math.min(d.a, d.b);
        const hi = Math.max(d.a, d.b);
        rows.push(`\\c{A}{P(\\c{a}{${xn(lo)}} ≤ X ≤ \\c{b}{${xn(hi)}})} = Φ(\\c{b}{${xn(hi)}}) − Φ(\\c{a}{${xn(lo)}})`);
        rows.push(`≈ ${Q(p4(cdf(hi, d.mu, d.s)))} − ${Q(p4(cdf(lo, d.mu, d.s)))} ≈ \\c{A}{${Q(p4(pv))}}`);
        rows.push(`\\t{${ctx.t('std')}:} z_1 = ${z(lo)},  z_2 = ${z(hi)}`);
      }
      const boxes = rows.map((src) => fitFormula(src, maxW, fs));
      const h = 28 + boxes.reduce((s, b) => s + b.asc + b.desc + 8, 0) + 4;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.area(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('probT'), col.area());
      let y = R.y + 28;
      boxes.forEach((b) => {
        b.draw(g, R.x + pad, y + b.asc);
        y += b.asc + b.desc + 8;
      });
      return h;
    }

    function rulesCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      title(R.x + pad, R.y + 16, ctx.t('rulesT'));
      const d = dist();
      const { lo, hi } = bounds();
      const lh = Math.min(F(24, 22), (R.h - 34 - 50) / 3);
      const fs = F(13.5, 12.5);
      for (let k = 1; k <= 3; k++) {
        const y = R.y + 28 + (k - 1) * lh;
        const hit = typ() === 'between' && Math.abs(lo - (d.mu - k * d.s)) < 1e-6 && Math.abs(hi - (d.mu + k * d.s)) < 1e-6;
        if (hit) {
          g.fillStyle = withAlpha(col.rule(), theme.dark ? 0.22 : 0.14);
          roundRect(g, R.x + pad - 6, y - 2, R.w - 2 * pad + 12, lh - 2, 6);
          g.fill();
        }
        const kk = k === 1 ? '' : String(k);
        const b1 = fitFormula(`P(μ − ${kk}σ ≤ X ≤ μ + ${kk}σ)`, (R.w - 2 * pad) * 0.66, fs, hit ? col.rule() : theme.text);
        b1.draw(g, R.x + pad, y + lh / 2 + (b1.asc - b1.desc) / 2 - 1);
        text(g, `≈ ${fmt.num(sigmaRule(k) * 100, 1)} %`, R.x + R.w - pad, y + lh / 2 - 1, { font: font(700, fs), color: hit ? col.rule() : theme.text, align: 'right' });
      }
      // Dichtefunktion
      const y = R.y + 28 + 3 * lh + 10;
      if (y + 30 < R.y + R.h) {
        title(R.x + pad, y + 6, ctx.t('densT'));
        line('φ(x) = \\f{1}{σ\\r{2π}} · e^{−(x − μ)²/(2σ²)}', R.x + pad, y + 14, R.w - 2 * pad, F(14, 13));
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      const d = dist();
      const [gx0, gx1] = xRange();
      const goal = { mu: d.mu, s: d.s, a: d.a, b: d.b, x0: gx0, x1: gx1 };
      let moving = false;
      const k = reduced ? 1 : 1 - Math.exp(-dt * 9);
      const next = { ...shown };
      for (const key of Object.keys(goal) as (keyof typeof goal)[]) {
        const diff = goal[key] - shown[key];
        const kk = (key === 'a' || key === 'b') && dragging ? 1 : k;
        if (Math.abs(diff) > 1e-4 * (1 + Math.abs(goal[key]))) {
          next[key] = shown[key] + diff * kk;
          moving = true;
        } else next[key] = goal[key];
      }
      shown = next;
      surface.begin();
      plot.resize();
      plotC.resize();
      drawDensity();
      const R = regions();
      if (R.cdf) drawCdf(R.cdf);
      const C = R.col;
      const gap = F(10, 8);
      const h1 = probCard({ ...C, h: 0 });
      probCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 110) rulesCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(190, 180)) });
      if (moving || dragging || intro.running) ctx.requestRender();
    }

    function setRule(k: number): void {
      const d = dist();
      const lo = d.mu - k * d.s;
      const hi = d.mu + k * d.s;
      if (sit() === 'abs') ctx.set({ typ: 'between', a: Number(lo.toFixed(2)), b: Number(hi.toFixed(2)) });
      else if (sit() === 'iq') ctx.set({ typ: 'between', ia: lo, ib: hi });
      else ctx.set({ typ: 'between', fa: lo, fb: hi });
    }

    return {
      update(changed) {
        if (changed.has('sit') || changed.has('typ')) intro.play(reduced ? 1 : 900);
        if (changed.has('sit')) {
          const [x0, x1] = xRange();
          const d = dist();
          shown = { mu: d.mu, s: d.s, a: d.a, b: d.b, x0, x1 };
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id === 'r1') setRule(1);
        else if (id === 'r2') setRule(2);
        else if (id === 'r3') setRule(3);
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
