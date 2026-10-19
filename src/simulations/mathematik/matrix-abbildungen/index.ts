import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { apply, classify, det, eigen, IDENTITY, lerpMat, type Mat, type Vec } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const R0 = 4.2;
const MORPH_MS = 1800;

/** Buchstabe F (zeigt Drehsinn und Spiegelung) als Polygon. */
const F_SHAPE: Vec[] = [
  [0, 0],
  [0.4, 0],
  [0.4, 1],
  [1, 1],
  [1, 1.4],
  [0.4, 1.4],
  [0.4, 1.8],
  [1.2, 1.8],
  [1.2, 2.2],
  [0, 2.2],
];

/**
 * Matrizen als lineare Abbildungen der Ebene: Die Bilder der Einheitsvektoren
 * (= Spalten der Matrix) lassen sich ziehen; Gitter, Einheitsquadrat und ein
 * Buchstabe F werden mit abgebildet. Die Determinante erscheint als
 * Flächeninhalt des Bildparallelogramms, Eigenrichtungen als Geraden, die
 * auf sich selbst abgebildet werden. Eine Animation verformt E stetig zu A.
 */
export default defineSimulation({
  id: 'matrix-abbildungen',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [
    { id: 'mat', label: L('Matrix A', 'Matrix A') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'a', type: 'number', group: 'mat', label: L('a₁₁', 'a₁₁'), min: -3, max: 3, step: 0.1, default: 2 },
    { key: 'b', type: 'number', group: 'mat', label: L('a₁₂', 'a₁₂'), min: -3, max: 3, step: 0.1, default: 1 },
    { key: 'c', type: 'number', group: 'mat', label: L('a₂₁', 'a₂₁'), min: -3, max: 3, step: 0.1, default: 0 },
    { key: 'd', type: 'number', group: 'mat', label: L('a₂₂', 'a₂₂'), min: -3, max: 3, step: 0.1, default: 1 },
    { key: 'eig', type: 'boolean', group: 'view', label: L('Eigenrichtungen zeigen', 'Show eigendirections'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Bildgitter zeigen', 'Show the transformed grid'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Determinante und Eigenwerte selbst berechnen.', 'Off: compute the determinant and eigenvalues yourself.'), default: true },
  ],
  actions: [{ id: 'morph', label: L('Abbildung abspielen', 'Play the transformation'), primary: true }],
  readouts: [
    { key: 'det', label: L('Determinante', 'Determinant'), spoiler: true },
    { key: 'eig', label: L('Eigenwerte', 'Eigenvalues'), spoiler: true },
  ],
  presets: [
    { id: 'gen', label: L('Allgemein', 'General'), values: {} },
    { id: 'rot', label: L('Drehung um 90°', 'Rotation by 90°'), values: { a: 0, b: -1, c: 1, d: 0 } },
    { id: 'refl', label: L('Spiegelung an der x-Achse', 'Reflection in the x-axis'), values: { a: 1, b: 0, c: 0, d: -1 } },
    { id: 'scale', label: L('Streckung', 'Scaling'), values: { a: 2, b: 0, c: 0, d: 0.5 } },
    { id: 'shear', label: L('Scherung', 'Shear'), values: { a: 1, b: 1, c: 0, d: 1 } },
    { id: 'proj', label: L('Projektion: det = 0', 'Projection: det = 0'), values: { a: 1, b: 0, c: 0, d: 0 } },
    { id: 'sym', label: L('Symmetrisch: zwei Eigenrichtungen', 'Symmetric: two eigendirections'), values: { a: 2, b: 1, c: 1, d: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatenebene mit dem Einheitsquadrat, einem Buchstaben F und dem Gitter vor und nach der Abbildung mit der Matrix A; die Bilder der Einheitsvektoren lassen sich ziehen. Eigenrichtungen erscheinen als gestrichelte Geraden. Daneben Matrix, Determinante, Art der Abbildung und Eigenwerte.',
      matT: 'Matrix und Bilder der Einheitsvektoren',
      detT: 'Determinante',
      eigT: 'Eigenwerte und Eigenvektoren',
      kind: 'Art',
      area: 'Flächeninhalte werden mit |det A| = {f} multipliziert.',
      orient: 'det A < 0: Der Umlaufsinn kehrt sich um (das F ist gespiegelt).',
      zero: 'det A = 0: Die Ebene wird auf eine Gerade (oder einen Punkt) abgebildet – A ist nicht umkehrbar.',
      noEig: 'Keine reellen Eigenwerte – keine Richtung bleibt erhalten (Drehanteil).',
      allEig: 'Jede Richtung ist Eigenrichtung.',
      k_identity: 'Identität',
      k_rotation: 'Drehung',
      k_reflection: 'Spiegelung',
      k_scaling: 'Streckung entlang der Achsen',
      k_shear: 'Scherung',
      k_projection: 'Projektion (nicht umkehrbar)',
      k_general: 'allgemeine lineare Abbildung',
    },
    en: {
      canvas: 'Coordinate plane with the unit square, a letter F and the grid before and after the map with the matrix A; the images of the unit vectors can be dragged. Eigendirections appear as dashed lines. Next to it the matrix, determinant, type of map and eigenvalues.',
      matT: 'Matrix and images of the unit vectors',
      detT: 'Determinant',
      eigT: 'Eigenvalues and eigenvectors',
      kind: 'Type',
      area: 'Areas are multiplied by |det A| = {f}.',
      orient: 'det A < 0: the orientation is reversed (the F is mirrored).',
      zero: 'det A = 0: the plane is mapped onto a line (or a point) – A is not invertible.',
      noEig: 'No real eigenvalues – no direction is preserved (rotation part).',
      allEig: 'Every direction is an eigendirection.',
      k_identity: 'identity',
      k_rotation: 'rotation',
      k_reflection: 'reflection',
      k_scaling: 'scaling along the axes',
      k_shear: 'shear',
      k_projection: 'projection (not invertible)',
      k_general: 'general linear map',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const reduced = prefersReducedMotion();
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (m, k: string) => String(vars[k] ?? m));
    const wideLayout = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const F = (w: number, n: number) => (surface.width >= 640 ? w : n);
    const font = (weight: number, size: number) => `${weight} ${size}px ${th().font}`;
    const target = (): Mat => ({ a: p.a, b: p.b, c: p.c, d: p.d });

    const col = {
      e1: () => th().series[1]!,
      e2: () => th().series[0]!,
      shape: () => th().series[4]!,
      sq: () => th().series[2]!,
      eig: () => th().series[3]!,
    };
    const n2 = (v: number) => fmt.num(Math.abs(v) < 5e-4 ? 0 : v, 2);
    const Q = (s: string) => (p.show ? s : '?');

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 1.0, 280, h * 0.52));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.38, 270, 370));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-R0, R0], y: [-R0, R0], pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Zustand ---------- */
    let shown: Mat = target();
    let lastFrame = performance.now();
    let dragging = 0;
    const morph = new Tween(MORPH_MS, ease.inOutCubic);

    const snap = (v: number) => Math.round(clamp(v, -3, 3) * 10) / 10;
    plot.addHandle({
      get: () => [shown.a, shown.c],
      set: (x, y) => {
        dragging = performance.now();
        ctx.set({ a: snap(x), c: snap(y) });
      },
      enabled: () => !ctx.locked && !morph.running,
      color: () => col.e1(),
    });
    plot.addHandle({
      get: () => [shown.b, shown.d],
      set: (x, y) => {
        dragging = performance.now();
        ctx.set({ b: snap(x), d: snap(y) });
      },
      enabled: () => !ctx.locked && !morph.running,
      color: () => col.e2(),
    });

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = target();
      ctx.readout('det', `det A = ${n2(det(m))}`);
      const e = eigen(m);
      ctx.readout('eig', e.length ? [...new Set(e.map((q) => `λ = ${n2(q.value)}`))].join(', ') : ctx.t('noEig'));
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
    function wrap(str: string, maxW: number, f: string): string[] {
      const g = surface.g;
      g.font = f;
      const rows: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { r: col.e1(), b: col.e2(), s: col.sq(), e: col.eig(), m: th().muted },
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
    function arrow(from: Vec, to: Vec, color: string, width = 3): void {
      const g = surface.g;
      const [x0, y0] = plot.toPx(from[0], from[1]);
      const [x1, y1] = plot.toPx(to[0], to[1]);
      const ang = Math.atan2(y1 - y0, x1 - x0);
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const hl = Math.min(12, len * 0.4);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - Math.cos(ang) * hl * 0.6, y1 - Math.sin(ang) * hl * 0.6);
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - hl * Math.cos(ang - 0.4), y1 - hl * Math.sin(ang - 0.4));
      g.lineTo(x1 - hl * Math.cos(ang + 0.4), y1 - hl * Math.sin(ang + 0.4));
      g.closePath();
      g.fill();
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      plot.begin();
      plot.grid();
      plot.axes();
      const m = shown;
      const A = (v: Vec) => apply(m, v);
      // Bildgitter
      if (p.grid) {
        g.save();
        for (let k = -6; k <= 6; k++) {
          plot.segment(A([k, -6]), A([k, 6]), { color: withAlpha(col.shape(), theme.dark ? 0.35 : 0.25), width: k === 0 ? 1.6 : 1 });
          plot.segment(A([-6, k]), A([6, k]), { color: withAlpha(col.shape(), theme.dark ? 0.35 : 0.25), width: k === 0 ? 1.6 : 1 });
        }
        g.restore();
      }
      // Eigenrichtungen
      if (p.eig && !morph.running) {
        const e = eigen(m);
        const all = e.length === 2 && Math.abs(m.b) < 1e-9 && Math.abs(m.c) < 1e-9 && Math.abs(m.a - m.d) < 1e-9;
        if (!all) {
          for (const q of e) {
            plot.line([0, 0], q.vector, { color: withAlpha(col.eig(), 0.85), width: 2, dash: [8, 6] });
            const tip: Vec = [q.vector[0] * 3.4, q.vector[1] * 3.4];
            const [tx, ty] = plot.toPx(tip[0], tip[1]);
            if (p.show) text(g, `λ = ${n2(q.value)}`, tx + 6, ty - 8, { font: font(700, F(12, 11)), color: col.eig(), align: 'left' });
          }
        }
      }
      // Original: Einheitsquadrat und F (blass)
      const sq: Vec[] = [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ];
      plot.polygon(sq, { stroke: withAlpha(theme.text, 0.35), width: 1.4, dash: [4, 4] });
      // F im Einheitsquadrat: zeigt Drehsinn und Spiegelung, bleibt immer im Bildparallelogramm
      const fx: Vec[] = F_SHAPE.map(([x, y]) => [0.3 + x * 0.35, 0.11 + y * 0.35]);
      plot.polygon(fx, { stroke: withAlpha(theme.text, 0.35), width: 1.4, dash: [4, 4] });
      // Bilder
      plot.polygon(sq.map(A), { fill: withAlpha(col.sq(), theme.dark ? 0.35 : 0.25), stroke: col.sq(), width: 2 });
      plot.polygon(fx.map(A), { fill: withAlpha(col.shape(), theme.dark ? 0.4 : 0.3), stroke: col.shape(), width: 2 });
      // Bildvektoren
      arrow([0, 0], A([1, 0]), col.e1());
      arrow([0, 0], A([0, 1]), col.e2());
      const [ax, ay] = plot.toPx(...A([1, 0]));
      const [bx, by] = plot.toPx(...A([0, 1]));
      const fA = fitFormula('\\c{r}{A\\t{·}e_1}', 120, F(14, 13));
      fA.draw(g, ax + 10, ay - 8);
      const fB = fitFormula('\\c{b}{A\\t{·}e_2}', 120, F(14, 13));
      fB.draw(g, bx + 10, by - 8);
      plot.end();
    }

    /* ---------- Karten ---------- */
    function matCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const h = F(118, 110);
      if (R.h <= 0) return h;
      card({ ...R, h }, col.sq(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('matT'), col.sq());
      const m = target();
      // Matrix mit farbigen Spalten
      const fs = F(17, 15);
      const fnum = font(700, fs);
      g.font = fnum;
      const cw = Math.max(g.measureText(n2(m.a)).width, g.measureText(n2(m.c)).width, g.measureText(n2(m.b)).width, g.measureText(n2(m.d)).width) + 14;
      const x0 = R.x + pad + 50;
      const y0 = R.y + 44;
      const lh = fs * 1.35;
      text(g, 'A =', R.x + pad, y0 + lh / 2, { font: `italic 700 ${fs}px ${theme.mathFont}`, color: theme.text, align: 'left' });
      g.strokeStyle = theme.text;
      g.lineWidth = 1.6;
      const bh = lh * 2;
      g.beginPath();
      g.arc(x0 + 10, y0 + lh / 2, bh * 0.62, Math.PI * 0.72, Math.PI * 1.28);
      g.stroke();
      g.beginPath();
      g.arc(x0 + 2 * cw - 2, y0 + lh / 2, bh * 0.62, -Math.PI * 0.28, Math.PI * 0.28);
      g.stroke();
      text(g, n2(m.a), x0 + cw / 2 + 4, y0, { font: fnum, color: col.e1() });
      text(g, n2(m.c), x0 + cw / 2 + 4, y0 + lh, { font: fnum, color: col.e1() });
      text(g, n2(m.b), x0 + cw * 1.5 + 4, y0, { font: fnum, color: col.e2() });
      text(g, n2(m.d), x0 + cw * 1.5 + 4, y0 + lh, { font: fnum, color: col.e2() });
      // Bilder der Einheitsvektoren
      const xr = x0 + 2 * cw + 30;
      const maxW = R.x + R.w - pad - xr;
      const b1 = fitFormula(`\\c{r}{A\\t{·}e_1 = (${n2(m.a)} | ${n2(m.c)})}`, maxW, F(13.5, 12.5));
      b1.draw(g, xr, y0 + 4);
      const b2 = fitFormula(`\\c{b}{A\\t{·}e_2 = (${n2(m.b)} | ${n2(m.d)})}`, maxW, F(13.5, 12.5));
      b2.draw(g, xr, y0 + lh + 4);
      const k = classify(m, 0.02);
      text(g, `${ctx.t('kind')}: ${p.show ? ctx.t(`k_${k}`) : '?'}`, R.x + pad, R.y + h - 14, { font: font(700, F(12.5, 11.5)), color: theme.text, align: 'left' });
      return h;
    }

    function detCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      card(R);
      const m = target();
      const D = det(m);
      const maxW = R.w - 2 * pad;
      let y = R.y + 16;
      title(R.x + pad, y, ctx.t('detT'), col.sq());
      y += 12;
      const b = fitFormula(`\\c{s}{\\t{det} A = ${n2(m.a)} · ${n2(m.d)} − ${n2(m.b)} · ${n2(m.c)} = ${Q(n2(D))}}`, maxW, F(14, 13));
      b.draw(g, R.x + pad, y + b.asc);
      y += b.asc + b.desc + 6;
      const nf = font(600, F(12, 11));
      const msgs: string[] = [];
      if (p.show) {
        if (Math.abs(D) < 1e-9) msgs.push(ctx.t('zero'));
        else {
          msgs.push(tr('area', { f: n2(Math.abs(D)) }));
          if (D < 0) msgs.push(ctx.t('orient'));
        }
      }
      for (const msg of msgs)
        for (const row of wrap(msg, maxW, nf)) {
          text(g, row, R.x + pad, y + 7, { font: nf, color: theme.text, align: 'left' });
          y += 15;
        }
      y += 10;
      if (y + 30 > R.y + R.h) return;
      title(R.x + pad, y + 4, ctx.t('eigT'), col.eig());
      y += 14;
      const e = eigen(m);
      const all = e.length === 2 && Math.abs(m.b) < 1e-9 && Math.abs(m.c) < 1e-9 && Math.abs(m.a - m.d) < 1e-9;
      if (!p.show) {
        const bb = fitFormula(`\\c{e}{λ = ?}`, maxW, F(14, 13));
        bb.draw(g, R.x + pad, y + bb.asc);
        return;
      }
      if (!e.length) {
        for (const row of wrap(ctx.t('noEig'), maxW, nf)) {
          text(g, row, R.x + pad, y + 7, { font: nf, color: theme.text, align: 'left' });
          y += 15;
        }
        return;
      }
      if (all) {
        const bb = fitFormula(`\\c{e}{λ = ${n2(e[0]!.value)}}`, maxW, F(14, 13));
        bb.draw(g, R.x + pad, y + bb.asc);
        y += bb.asc + bb.desc + 6;
        text(g, ctx.t('allEig'), R.x + pad, y + 7, { font: nf, color: theme.text, align: 'left' });
        return;
      }
      for (const q of e) {
        if (y > R.y + R.h - 16) return;
        const bb = fitFormula(`\\c{e}{λ = ${n2(q.value)}:  v = (${n2(q.vector[0])} | ${n2(q.vector[1])})}`, maxW, F(14, 13));
        bb.draw(g, R.x + pad, y + bb.asc);
        y += bb.asc + bb.desc + 6;
      }
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const goal = target();
      if (morph.running) shown = lerpMat(IDENTITY, goal, morph.value);
      else if (dragging || reduced) shown = goal;
      else {
        const k = 1 - Math.exp(-dt * 9);
        const next = lerpMat(shown, goal, k);
        const diff = Math.abs(next.a - goal.a) + Math.abs(next.b - goal.b) + Math.abs(next.c - goal.c) + Math.abs(next.d - goal.d);
        shown = diff < 1e-3 ? goal : next;
        moving = diff >= 1e-3;
      }
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = matCard({ ...C, h: 0 });
      matCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 100) detCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(230, 220)) });
      if (moving || dragging || morph.running) ctx.requestRender();
    }

    return {
      update() {
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'morph') return;
        morph.play(reduced ? 1 : MORPH_MS);
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
