import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { boxDeriv, boxOptimum, boxVolume, canDeriv, canHeight, canOptimum, canSurface, rectArea, rectDeriv, rectF, rectOptimum, type ProbKey } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const START: Record<ProbKey, number> = { box: 2, can: 3, rect: 0.8 };

/**
 * Extremwertprobleme mit Differentialrechnung: offene Schachtel aus einem
 * Karton, Dose mit kleinster Oberfläche und Rechteck unter einer
 * e-Funktion. Links das Bild, das sich mit der Variablen verändert, darunter
 * der Graph der Zielfunktion mit Tangente; daneben der Lösungsweg von der
 * Zielfunktion bis zum Optimum.
 */
export default defineSimulation({
  id: 'extremwertprobleme',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.44 },
  groups: [
    { id: 'data', label: L('Daten', 'Data') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'prob',
      type: 'choice',
      label: L('Problem', 'Problem'),
      options: [
        { value: 'box', label: L('Schachtel aus Karton', 'Box from a sheet of card') },
        { value: 'can', label: L('Dose mit kleinster Oberfläche', 'Can with the smallest surface') },
        { value: 'rect', label: L('Rechteck unter einer e-Funktion', 'Rectangle under an exponential') },
      ],
      default: 'box',
    },
    { key: 'x', type: 'number', label: L('Variable (x, r bzw. u)', 'Variable (x, r or u)'), min: 0, max: 15, step: 0.05, default: 2, help: L('Auch den Punkt auf dem Graphen ziehen.', 'You can also drag the point on the graph.') },
    { key: 'a', type: 'number', group: 'data', label: L('Karton: Länge a', 'Card: length a'), min: 16, max: 40, step: 1, default: 30, unit: 'cm', visibleIf: (v) => v.prob === 'box' },
    { key: 'b', type: 'number', group: 'data', label: L('Karton: Breite b', 'Card: width b'), min: 10, max: 30, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.prob === 'box' },
    { key: 'v', type: 'number', group: 'data', label: L('Volumen der Dose', 'Volume of the can'), min: 250, max: 2000, step: 50, default: 1000, unit: 'cm³', visibleIf: (v) => v.prob === 'can' },
    { key: 'show', type: 'boolean', group: 'view', label: L('Lösungsweg zeigen', 'Show the solution'), help: L('Aus: Optimum selbst berechnen.', 'Off: work out the optimum yourself.'), default: true },
  ],
  actions: [{ id: 'opt', label: L('Zum Optimum', 'Go to the optimum'), primary: true }],
  readouts: [
    { key: 'cur', label: L('Aktueller Wert', 'Current value'), spoiler: true },
    { key: 'opt', label: L('Optimum', 'Optimum'), spoiler: true },
  ],
  presets: [
    { id: 'box', label: L('Schachtel 30 cm × 20 cm', 'Box 30 cm × 20 cm'), values: {} },
    { id: 'square', label: L('Quadratischer Karton', 'Square sheet'), values: { prob: 'box', a: 24, b: 24, x: 2 } },
    { id: 'can', label: L('1-Liter-Dose', '1-litre can'), values: { prob: 'can', v: 1000, x: 3 } },
    { id: 'can330', label: L('Getränkedose 330 ml', 'Drinks can 330 ml'), values: { prob: 'can', v: 350, x: 3.3 } },
    { id: 'rect', label: L('Rechteck unter 3e^(−0,5x)', 'Rectangle under 3e^(−0.5x)'), values: { prob: 'rect', x: 0.8 } },
  ],
  strings: {
    de: {
      canvas: 'Links ein Bild des Problems (Karton mit ausgeschnittenen Ecken und Schachtel, Dose oder Rechteck unter einem Graphen), das sich mit der Variablen ändert; darunter der Graph der Zielfunktion mit ziehbarem Punkt und Tangente. Daneben der Lösungsweg.',
      stepsT: 'Lösungsweg',
      s1: '1. Zielfunktion',
      s2: '2. Nebenbedingung',
      s3: '3. Definitionsbereich',
      s4: '4. Notwendige Bedingung',
      s5: '5. Ergebnis',
      goal: 'Zielfunktion',
      box1: 'V = Länge · Breite · Höhe',
      box2: 'Höhe x; Länge a − 2x, Breite b − 2x',
      can1: 'O = 2 · Grundfläche + Mantel',
      can2: 'V = πr²h  ⇒  h = V/(πr²)',
      rect1: 'A = Breite · Höhe',
      rect2: 'Ecke auf dem Graphen: Höhe = f(u)',
      max: 'Maximum',
      min: 'Minimum',
      margin: 'An den Rändern ist der Wert schlechter – also globales Extremum.',
      sheet: 'Karton',
      box: 'Schachtel',
      can: 'Dose',
    },
    en: {
      canvas: 'Left: a picture of the problem (sheet with cut-out corners and box, can or rectangle under a graph) that changes with the variable; below it the graph of the objective function with a draggable point and tangent. Next to it the solution.',
      stepsT: 'Solution',
      s1: '1. Objective function',
      s2: '2. Constraint',
      s3: '3. Domain',
      s4: '4. Necessary condition',
      s5: '5. Result',
      goal: 'objective',
      box1: 'V = length · width · height',
      box2: 'height x; length a − 2x, width b − 2x',
      can1: 'S = 2 · base + lateral surface',
      can2: 'V = πr²h  ⇒  h = V/(πr²)',
      rect1: 'A = width · height',
      rect2: 'corner on the graph: height = f(u)',
      max: 'maximum',
      min: 'minimum',
      margin: 'At the boundaries the value is worse – so this is the global extremum.',
      sheet: 'sheet',
      box: 'box',
      can: 'can',
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
    const prob = () => p.prob as ProbKey;
    const n2 = (v: number) => fmt.num(v, 2);
    const n1 = (v: number) => fmt.num(v, 1);
    const Q = (s: string) => (p.show ? s : '?');

    const col = {
      Z: () => th().series[0]!,
      x: () => th().series[3]!,
      cut: () => th().series[1]!,
      opt: () => th().series[2]!,
      fill: () => th().series[4]!,
      tan: () => th().series[5]!,
    };

    /* ---------- Problemdaten ---------- */
    function domain(): [number, number] {
      if (prob() === 'box') return [0, Math.min(p.a, p.b) / 2];
      if (prob() === 'can') return [0.5, 12];
      return [0, 7];
    }
    const Z = (x: number): number => (prob() === 'box' ? boxVolume({ a: p.a, b: p.b }, x) : prob() === 'can' ? canSurface(p.v, x) : rectArea(x));
    const dZ = (x: number): number => (prob() === 'box' ? boxDeriv({ a: p.a, b: p.b }, x) : prob() === 'can' ? canDeriv(p.v, x) : rectDeriv(x));
    const xOpt = (): number => (prob() === 'box' ? boxOptimum({ a: p.a, b: p.b }) : prob() === 'can' ? canOptimum(p.v) : rectOptimum);
    const xEff = () => {
      const [lo, hi] = domain();
      return clamp(p.x, lo + 0.05, hi - 0.05);
    };
    const varName = () => (prob() === 'can' ? 'r' : prob() === 'rect' ? 'u' : 'x');
    const zName = () => (prob() === 'box' ? 'V' : prob() === 'can' ? 'O' : 'A');
    const unitZ = () => (prob() === 'box' ? 'cm³' : prob() === 'can' ? 'cm²' : 'FE');
    const unitX = () => (prob() === 'rect' ? 'LE' : 'cm');

    /* ---------- Aufteilung ---------- */
    function regions(): { pic: Rect; graph: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      let left: Rect;
      let colR: Rect;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.15, 320, h * 0.58));
        left = { x: 0, y: 0, w, h: ph };
        colR = { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 };
      } else {
        const cw = Math.round(clamp(w * 0.38, 270, 370));
        left = { x: 0, y: 0, w: w - cw - 10, h };
        colR = { x: w - cw, y: 2, w: cw - 2, h: h - 4 };
      }
      const t1 = Math.round(left.h * 0.5);
      return { pic: { ...left, h: t1 }, graph: { x: left.x, y: left.y + t1 + 6, w: left.w, h: left.h - t1 - 6 }, col: colR };
    }
    const plot = new Plot(surface, { x: [0, 10], y: [0, 1000], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().graph, xAxis: { label: '' }, yAxis: { label: '' } });

    /* ---------- Zustand ---------- */
    let shownX = xEff();
    let lastFrame = performance.now();
    let dragging = 0;
    const toOpt = new Tween(1400, ease.inOutCubic);
    let optFrom = shownX;

    plot.addHandle({
      get: () => [shownX, Z(shownX)],
      set: (x) => {
        dragging = performance.now();
        const [lo, hi] = domain();
        ctx.set({ x: Math.round(clamp(x, lo + 0.05, hi - 0.05) * 20) / 20 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !toOpt.running,
      color: () => col.x(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const x = xEff();
      const eq = (v: number, d: number) => (Math.abs(v - Math.round(v * 10 ** d) / 10 ** d) < 1e-9 ? '=' : '≈');
      ctx.readout('cur', `${varName()} = ${n2(x)} ${unitX()}: ${zName()} ${eq(Z(x), 1)} ${n1(Z(x))} ${unitZ()}`);
      const xo = xOpt();
      ctx.readout('opt', `${varName()} ${eq(xo, 2)} ${n2(xo)} ${unitX()}: ${zName()} ${eq(Z(xo), 1)} ${n1(Z(xo))} ${unitZ()}`);
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
      palette: { z: col.Z(), x: col.x(), o: col.opt(), c: col.cut(), m: th().muted },
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
    function label(x: number, y: number, str: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.save();
      g.font = font(700, F(12, 11));
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = th().bg;
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }

    /* ---------- Bilder ---------- */
    function drawBox(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const { a, b } = p;
      const x = shownX;
      // Karton (links)
      const sheetW = R.w * 0.46;
      const sc = Math.min((sheetW - 30) / a, (R.h - 50) / b);
      const sx = R.x + 20;
      const sy = R.y + (R.h - b * sc) / 2 + 6;
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.22 : 0.14);
      g.fillRect(sx, sy, a * sc, b * sc);
      g.strokeStyle = theme.text;
      g.lineWidth = 1.6;
      g.strokeRect(sx, sy, a * sc, b * sc);
      g.fillStyle = withAlpha(col.cut(), theme.dark ? 0.5 : 0.35);
      for (const [cx, cy] of [
        [0, 0],
        [a - x, 0],
        [0, b - x],
        [a - x, b - x],
      ] as const) {
        g.fillRect(sx + cx * sc, sy + cy * sc, x * sc, x * sc);
      }
      g.save();
      g.setLineDash([4, 4]);
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.beginPath();
      g.moveTo(sx + x * sc, sy);
      g.lineTo(sx + x * sc, sy + b * sc);
      g.moveTo(sx + (a - x) * sc, sy);
      g.lineTo(sx + (a - x) * sc, sy + b * sc);
      g.moveTo(sx, sy + x * sc);
      g.lineTo(sx + a * sc, sy + x * sc);
      g.moveTo(sx, sy + (b - x) * sc);
      g.lineTo(sx + a * sc, sy + (b - x) * sc);
      g.stroke();
      g.restore();
      label(sx + (a * sc) / 2, sy - 10, `a = ${n1(a)} cm`, theme.muted);
      label(sx - 4, sy + (b * sc) / 2, `b`, theme.muted, 'right');
      label(sx + (x * sc) / 2, sy + (x * sc) / 2, 'x', col.cut());
      text(g, ctx.t('sheet'), sx, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
      // Schachtel (rechts, Schrägbild)
      const L0 = a - 2 * x;
      const B0 = b - 2 * x;
      const H0 = x;
      const bx0 = R.x + R.w * 0.5;
      const bw = R.w * 0.48;
      const k = 0.45;
      const sc2 = Math.min((bw - 20) / (L0 + B0 * k * 0.7 + 1e-6), (R.h - 50) / (H0 + B0 * k * 0.7 + 1e-6), sc * 1.6);
      const ox = bx0 + 10;
      const oy = R.y + R.h - 26;
      const P = (u: number, v: number, w: number): [number, number] => [ox + (u + v * k * 0.7) * sc2, oy - (w + v * k * 0.7) * sc2];
      const face = (pts: [number, number][], alpha: number) => {
        g.beginPath();
        g.moveTo(...pts[0]!);
        for (const q of pts.slice(1)) g.lineTo(...q);
        g.closePath();
        g.fillStyle = withAlpha(col.fill(), alpha);
        g.fill();
        g.strokeStyle = theme.text;
        g.lineWidth = 1.4;
        g.stroke();
      };
      face([P(0, B0, 0), P(L0, B0, 0), P(L0, B0, H0), P(0, B0, H0)], theme.dark ? 0.25 : 0.18);
      face([P(0, 0, 0), P(0, B0, 0), P(0, B0, H0), P(0, 0, H0)], theme.dark ? 0.3 : 0.22);
      face([P(0, 0, 0), P(L0, 0, 0), P(L0, B0, 0), P(0, B0, 0)], theme.dark ? 0.2 : 0.12);
      face([P(L0, 0, 0), P(L0, B0, 0), P(L0, B0, H0), P(L0, 0, H0)], theme.dark ? 0.38 : 0.3);
      face([P(0, 0, 0), P(L0, 0, 0), P(L0, 0, H0), P(0, 0, H0)], theme.dark ? 0.45 : 0.36);
      const [lx, ly] = P(L0 / 2, 0, 0);
      label(lx, ly + 12, `${n1(L0)} cm`, theme.muted);
      const [hx, hy] = P(0, 0, H0 / 2);
      label(hx - 6, hy, `x = ${n2(x)}`, col.cut(), 'right');
      text(g, ctx.t('box'), bx0 + 10, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
    }

    function drawCan(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const r = shownX;
      const h = canHeight(p.v, r);
      const maxW = 2 * 12;
      const maxH = canHeight(p.v, 2.2);
      const sc = Math.min((R.w * 0.8) / maxW, (R.h - 50) / Math.min(maxH, 40));
      const cx = R.x + R.w / 2;
      const yb = R.y + R.h - 24;
      const hw = r * sc;
      const hh = Math.min(h * sc, R.h - 50);
      const e = Math.max(4, hw * 0.25);
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.3 : 0.2);
      g.beginPath();
      g.ellipse(cx, yb, hw, e, 0, 0, Math.PI);
      g.lineTo(cx - hw, yb - hh);
      g.ellipse(cx, yb - hh, hw, e, 0, Math.PI, 0, true);
      g.closePath();
      g.fill();
      g.strokeStyle = theme.text;
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(cx, yb - hh, hw, e, 0, 0, Math.PI * 2);
      g.moveTo(cx - hw, yb - hh);
      g.lineTo(cx - hw, yb);
      g.ellipse(cx, yb, hw, e, 0, Math.PI, 0, true);
      g.lineTo(cx + hw, yb - hh);
      g.stroke();
      // Maße
      g.strokeStyle = col.cut();
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx, yb - hh);
      g.lineTo(cx + hw, yb - hh);
      g.stroke();
      label(cx + hw / 2, yb - hh - 12, `r = ${n2(r)} cm`, col.cut());
      label(cx + hw + 10, yb - hh / 2, `h ≈ ${n2(h)} cm${h * sc > R.h - 50 ? ' (…)' : ''}`, theme.muted, 'left');
      text(g, `${ctx.t('can')}: V = ${fmt.num(p.v, 0)} cm³`, R.x + 12, R.y + 12, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
    }

    function drawRect(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const u = shownX;
      const X0 = R.x + 30;
      const Y0 = R.y + R.h - 20;
      const sx = (R.w - 50) / 7;
      const sy = (R.h - 40) / 3.3;
      const P = (x: number, y: number): [number, number] => [X0 + x * sx, Y0 - y * sy];
      g.strokeStyle = withAlpha(theme.text, 0.5);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(...P(0, 0));
      g.lineTo(...P(7, 0));
      g.moveTo(...P(0, 0));
      g.lineTo(...P(0, 3.2));
      g.stroke();
      const [r0x, r0y] = P(0, rectF(u));
      const [r1x, r1y] = P(u, 0);
      g.fillStyle = withAlpha(col.fill(), theme.dark ? 0.35 : 0.25);
      g.fillRect(r0x, r0y, r1x - r0x, r1y - r0y);
      g.strokeStyle = col.cut();
      g.lineWidth = 2;
      g.strokeRect(r0x, r0y, r1x - r0x, r1y - r0y);
      g.strokeStyle = col.Z();
      g.lineWidth = 2.6;
      g.beginPath();
      for (let i = 0; i <= 100; i++) {
        const x = (7 * i) / 100;
        const [qx, qy] = P(x, rectF(x));
        if (i) g.lineTo(qx, qy);
        else g.moveTo(qx, qy);
      }
      g.stroke();
      g.beginPath();
      g.arc(...P(u, rectF(u)), 5, 0, Math.PI * 2);
      g.fillStyle = col.x();
      g.fill();
      label(...P(5, rectF(5) + 0.45), 'f(x) = 3e^(−0,5x)', col.Z());
      label(...P(u / 2, -0.25), `u = ${n2(u)}`, col.cut());
    }

    /* ---------- Graph der Zielfunktion ---------- */
    function drawGraph(): void {
      const g = surface.g;
      const theme = th();
      const [lo, hi] = domain();
      let yMax = 0;
      let yMin = Infinity;
      for (let i = 1; i < 100; i++) {
        const v = Z(lo + ((hi - lo) * i) / 100);
        yMax = Math.max(yMax, v);
        yMin = Math.min(yMin, v);
      }
      if (prob() === 'can') yMax = Math.min(yMax, yMin * 3);
      plot.setRangePadded([lo, hi], [0, yMax * 1.12], { left: F(46, 40), bottom: F(24, 22), top: 22, right: 12 });
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.Z(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      plot.fn(Z, { color: col.Z(), width: 3, from: lo + 1e-3, to: hi - 1e-3 });
      g.restore();
      const x = shownX;
      const m = dZ(x);
      const span = (hi - lo) * 0.12;
      plot.segment([x - span, Z(x) - m * span], [x + span, Z(x) + m * span], { color: col.tan(), width: 2 });
      if (p.show) {
        const xo = xOpt();
        plot.vline(xo, { color: withAlpha(col.opt(), 0.5), width: 1.4, dash: [5, 4] });
        plot.point(xo, Z(xo), { color: col.opt(), radius: 5.5, hollow: true });
      }
      plot.point(x, Z(x), { color: col.x(), radius: 6.5 });
      const zn = zName();
      const vn = varName();
      text(g, `${ctx.t('goal')}: ${zn}(${vn}) in ${unitZ()}`, plot.px(lo) + 8, r.y + 10, { font: font(700, F(12, 11)), color: col.Z(), align: 'left' });
      text(g, `${vn} in ${unitX()}`, r.x + r.w - 4, plot.py(0) - 12, { font: font(600, F(11, 10)), color: theme.muted, align: 'right' });
      const [px, py] = plot.toPx(x, Z(x));
      label(px, py - 16, `${zn} ≈ ${n1(Z(x))}`, col.x());
      plot.end();
    }

    /* ---------- Karte ---------- */
    function stepsCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R, col.Z(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('stepsT'), col.Z());
      const maxW = R.w - 2 * pad - 6;
      const fs = F(13.5, 12.5);
      const lf = font(700, F(11.5, 10.5));
      const xo = xOpt();
      const pr = prob();
      let y = R.y + 26;
      const line = (src: string, color = theme.text) => {
        if (y > R.y + R.h - 14) return;
        const b = fitFormula(src, maxW, fs, color);
        b.draw(g, R.x + pad + 6, y + b.asc);
        y += b.asc + b.desc + 5;
      };
      const head = (k: string) => {
        if (y > R.y + R.h - 20) return;
        text(g, ctx.t(k), R.x + pad, y + 9, { font: lf, color: theme.muted, align: 'left' });
        y += 18;
      };
      const a = n1(p.a);
      const b = n1(p.b);
      head('s1');
      if (pr === 'box') line(`\\t{${ctx.t('box1')}}`);
      else if (pr === 'can') line(`O = 2πr² + 2πrh`);
      else line(`\\t{${ctx.t('rect1')}}`);
      head('s2');
      if (pr === 'box') {
        line(`\\t{${ctx.t('box2')}}`);
        line(`\\c{z}{V(x) = x(${a} − 2x)(${b} − 2x)}`);
      } else if (pr === 'can') {
        line(`\\t{${ctx.t('can2')}}`);
        line(`\\c{z}{O(r) = 2πr² + \\f{${fmt.num(2 * p.v, 0)}}{r}}`);
      } else {
        line(`\\t{${ctx.t('rect2')}}`);
        line(`\\c{z}{A(u) = u · 3e^{−0,5u}}`);
      }
      head('s3');
      if (pr === 'box') line(`0 < x < ${n1(Math.min(p.a, p.b) / 2)}`);
      else line(`${varName()} > 0`);
      head('s4');
      if (pr === 'box') line(`V′(x) = 12x² − ${fmt.num(4 * (p.a + p.b), 0)}x + ${fmt.num(p.a * p.b, 0)} = 0`);
      else if (pr === 'can') line(`O′(r) = 4πr − \\f{${fmt.num(2 * p.v, 0)}}{r²} = 0  ⇒  r = \\t{∛}(\\f{V}{2π})`);
      else line(`A′(u) = 3e^{−0,5u}(1 − 0,5u) = 0  ⇒  u = 2`);
      head('s5');
      const kind = pr === 'can' ? 'min' : 'max';
      line(`\\c{o}{${varName()} ≈ ${Q(n2(xo))} \\t{${unitX()}},  ${zName()} ≈ ${Q(n1(Z(xo)))} \\t{${unitZ()}}  (\\t{${ctx.t(kind)}})}`);
      if (pr === 'box' && p.show) line(`\\t{${ctx.t('box')}:} ${n1(p.a - 2 * xo)} × ${n1(p.b - 2 * xo)} × ${n2(xo)} \\t{cm}`, theme.muted);
      if (pr === 'can' && p.show) line(`h ≈ ${n2(canHeight(p.v, xo))} \\t{cm} = 2r`, theme.muted);
      if (y < R.y + R.h - 30) {
        const nf = font(600, F(11.5, 10.5));
        g.font = nf;
        const words = ctx.t('margin').split(' ');
        let cur = '';
        const rows: string[] = [];
        for (const w of words) {
          const next = cur ? `${cur} ${w}` : w;
          if (g.measureText(next).width > R.w - 2 * pad && cur) {
            rows.push(cur);
            cur = w;
          } else cur = next;
        }
        rows.push(cur);
        rows.forEach((row, i) => text(g, row, R.x + pad, y + 8 + i * 14, { font: nf, color: theme.muted, align: 'left' }));
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      if (toOpt.running) shownX = lerp(optFrom, xOpt(), toOpt.value);
      else {
        const goal = xEff();
        if (dragging || reduced || Math.abs(goal - shownX) < 1e-3) shownX = goal;
        else {
          shownX += (goal - shownX) * (1 - Math.exp(-dt * 9));
          moving = true;
        }
      }
      surface.begin();
      plot.resize();
      const R = regions();
      const pr = prob();
      if (pr === 'box') drawBox(R.pic);
      else if (pr === 'can') drawCan(R.pic);
      else drawRect(R.pic);
      drawGraph();
      stepsCard(R.col);
      if (moving || dragging || toOpt.running) ctx.requestRender();
      else if (optEnd) {
        optEnd = false;
        ctx.set({ x: Math.round(xOpt() * 20) / 20 });
      }
    }
    let optEnd = false;

    return {
      update(changed, source) {
        if (changed.has('prob') && source === 'input') ctx.set({ x: START[prob()] });
        if (changed.has('prob')) shownX = xEff();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'opt') return;
        optFrom = shownX;
        toOpt.play(reduced ? 1 : 1400);
        optEnd = true;
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
