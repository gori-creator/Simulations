import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaStyle } from './formula';
import { makeFn, mirrorPath, partner, type FnKey, type SqDom } from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const R0 = 5.5;
const MIRROR_MS = 2600;

/** Rechenweg je Funktion: Gleichung, Umformungen, Ergebnis, Definitions-/Wertemengen. */
interface Steps {
  f: string;
  solve: string[];
  inv: string;
  df: string;
  wf: string;
}
const STEPS: Record<string, Steps> = {
  lin: { f: 'f(x) = 2x − 1', solve: ['y = 2x − 1', 'y + 1 = 2x', 'x = \\f{y + 1}{2}'], inv: 'f^{−1}(x) = \\f{x + 1}{2}', df: 'ℝ', wf: 'ℝ' },
  'sq-pos': { f: 'f(x) = x² \\t{ für } x ≥ 0', solve: ['y = x²', 'x = \\r{y} \\t{ (da } x ≥ 0\\t{)}'], inv: 'f^{−1}(x) = \\r{x}', df: 'ℝ_0^+', wf: 'ℝ_0^+' },
  'sq-neg': { f: 'f(x) = x² \\t{ für } x ≤ 0', solve: ['y = x²', 'x = −\\r{y} \\t{ (da } x ≤ 0\\t{)}'], inv: 'f^{−1}(x) = −\\r{x}', df: 'ℝ_0^−', wf: 'ℝ_0^+' },
  'sq-all': { f: 'f(x) = x²', solve: ['y = x²', 'x = \\r{y} \\t{ oder } x = −\\r{y}'], inv: '', df: 'ℝ', wf: 'ℝ_0^+' },
  cube: { f: 'f(x) = 0,5x³', solve: ['y = 0,5x³', 'x³ = 2y', 'x = \\t{∛}(2y)'], inv: 'f^{−1}(x) = \\t{∛}(2x)', df: 'ℝ', wf: 'ℝ' },
  exp: { f: 'f(x) = e^x', solve: ['y = e^x', 'x = \\t{ln} y'], inv: 'f^{−1}(x) = \\t{ln} x', df: 'ℝ', wf: 'ℝ^+' },
  hyp: { f: 'f(x) = \\f{1}{x}', solve: ['y = \\f{1}{x}', 'x = \\f{1}{y}'], inv: 'f^{−1}(x) = \\f{1}{x}', df: 'ℝ \\ {0}', wf: 'ℝ \\ {0}' },
};

/**
 * Umkehrfunktionen als Spiegelung an y = x: ein ziehbarer Punkt P auf dem
 * Graphen von f und sein Spiegelbild P' auf dem Graphen von f⁻¹, eine
 * Animation, die den Graphen über die Spiegelachse klappt, der Rechenweg
 * „nach x auflösen, x und y tauschen“ und – bei x² auf ganz ℝ – das
 * Gegenbeispiel: gleicher Funktionswert für zwei x-Werte, also nicht umkehrbar.
 */
export default defineSimulation({
  id: 'umkehrfunktion',
  dragHint: true,
  layout: { aspect: 1.62, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'lin', label: L('f(x) = 2x − 1', 'f(x) = 2x − 1') },
        { value: 'sq', label: L('f(x) = x² (Wurzelfunktion)', 'f(x) = x² (square root)') },
        { value: 'cube', label: L('f(x) = 0,5x³', 'f(x) = 0.5x³') },
        { value: 'exp', label: L('f(x) = eˣ (ln-Funktion)', 'f(x) = eˣ (natural log)') },
        { value: 'hyp', label: L('f(x) = 1/x', 'f(x) = 1/x') },
      ],
      default: 'sq',
    },
    {
      key: 'dom',
      type: 'choice',
      label: L('Definitionsmenge von x²', 'Domain of x²'),
      options: [
        { value: 'pos', label: L('x ≥ 0', 'x ≥ 0') },
        { value: 'neg', label: L('x ≤ 0', 'x ≤ 0') },
        { value: 'all', label: L('ganz ℝ', 'all of ℝ') },
      ],
      default: 'pos',
      visibleIf: (v) => v.fn === 'sq',
    },
    { key: 'x', type: 'number', label: L('Punkt P: x', 'Point P: x'), min: -4, max: 4, step: 0.1, default: 1.5, help: L('Auch P auf dem Graphen ziehen.', 'You can also drag P along the graph.') },
    { key: 'inv', type: 'boolean', group: 'view', label: L('Graph von f⁻¹ zeigen', 'Show the graph of f⁻¹'), default: true },
    { key: 'show', type: 'boolean', group: 'view', label: L('Rechenweg zeigen', 'Show the working'), help: L('Aus: Umkehrfunktion selbst bestimmen.', 'Off: find the inverse yourself.'), default: true },
  ],
  actions: [{ id: 'mirror', label: L('An y = x spiegeln', 'Reflect in y = x'), primary: true }],
  readouts: [
    { key: 'inv', label: L('Umkehrfunktion', 'Inverse function'), spoiler: true },
    { key: 'pts', label: L('Punkte', 'Points'), spoiler: true },
  ],
  presets: [
    { id: 'sqrt', label: L('Wurzel als Umkehrung von x²', 'Square root as inverse of x²'), values: {} },
    { id: 'all', label: L('x² auf ganz ℝ: nicht umkehrbar', 'x² on all of ℝ: not invertible'), values: { fn: 'sq', dom: 'all', x: 1.5 } },
    { id: 'neg', label: L('x² für x ≤ 0', 'x² for x ≤ 0'), values: { fn: 'sq', dom: 'neg', x: -1.5 } },
    { id: 'ln', label: L('eˣ und ln x', 'eˣ and ln x'), values: { fn: 'exp', x: 1 } },
    { id: 'lin', label: L('Lineare Funktion', 'Linear function'), values: { fn: 'lin', x: 2 } },
    { id: 'hyp', label: L('1/x ist zu sich selbst invers', '1/x is its own inverse'), values: { fn: 'hyp', x: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit der Spiegelachse y = x, dem Graphen von f, dem Graphen der Umkehrfunktion und einem ziehbaren Punkt P mit seinem Spiegelbild P′. Daneben der Rechenweg zur Umkehrfunktion und die Definitions- und Wertemengen.',
      stepsT: 'Umkehrfunktion bestimmen',
      solve: '1. Nach x auflösen',
      swap: '2. x und y tauschen',
      setsT: 'Definitions- und Wertemenge',
      okT: 'Umkehrbar?',
      ok: 'f ist streng monoton – jeder Funktionswert kommt nur einmal vor. Also ist f umkehrbar.',
      notOk: 'Nicht umkehrbar: f({a}) = f({b}) = {y}. Das Spiegelbild ist kein Funktionsgraph – zu einem x-Wert gehören zwei y-Werte.',
      notOkShort: 'nicht umkehrbar',
      self: '1/x ist zu sich selbst invers: Der Graph ist symmetrisch zu y = x.',
      okHyp: 'Jeder Funktionswert kommt nur einmal vor (auf jedem Ast ist f streng monoton fallend, die Äste haben verschiedene Vorzeichen). Also ist f umkehrbar.',
      swapSets: 'Definitions- und Wertemenge tauschen die Rollen.',
      mirror: 'Spiegelachse',
      noFunction: 'keine Funktion',
    },
    en: {
      canvas: 'Coordinate system with the mirror line y = x, the graph of f, the graph of the inverse and a draggable point P with its image P′. Next to it the steps for finding the inverse and the domains and ranges.',
      stepsT: 'Finding the inverse',
      solve: '1. Solve for x',
      swap: '2. Swap x and y',
      setsT: 'Domain and range',
      okT: 'Invertible?',
      ok: 'f is strictly monotonic – every value occurs only once. So f is invertible.',
      notOk: 'Not invertible: f({a}) = f({b}) = {y}. The reflection is not the graph of a function – one x-value has two y-values.',
      notOkShort: 'not invertible',
      self: '1/x is its own inverse: the graph is symmetric about y = x.',
      okHyp: 'Every value occurs only once (on each branch f is strictly decreasing, and the branches have different signs). So f is invertible.',
      swapSets: 'Domain and range swap roles.',
      mirror: 'mirror line',
      noFunction: 'not a function',
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
    const key = () => p.fn as FnKey;
    const dom = () => p.dom as SqDom;
    const fn = () => makeFn(key(), dom());
    const stepsKey = () => (key() === 'sq' ? `sq-${dom()}` : key());
    const invertible = () => fn().inv !== null;

    const col = {
      f: () => th().series[0]!,
      inv: () => th().series[3]!,
      mirror: () => th().muted,
      P: () => th().series[0]!,
      Q: () => th().series[3]!,
      bad: () => th().series[1]!,
    };

    const n = (v: number) => fmt.num(Math.abs(v) < 5e-3 ? 0 : v, 2);
    /** Gültige x-Position von P (im Definitionsbereich, nicht auf der Lücke). */
    function xP(): number {
      const f = fn();
      let x = clamp(p.x, Math.max(f.lo, -4), Math.min(f.hi, 4));
      if (f.gap0 && Math.abs(x) < 0.2) x = x < 0 ? -0.2 : 0.2;
      if (key() === 'exp') x = Math.min(x, 1.6);
      if (key() === 'cube') x = clamp(x, -2.2, 2.2);
      if (key() === 'sq') x = clamp(x, -2.3, 2.3);
      return x;
    }

    /* ---------- Aufteilung ---------- */
    function regions(): { plot: Rect; col: Rect } {
      const w = surface.width;
      const h = surface.height;
      if (!wideLayout()) {
        const ph = Math.round(clamp(w * 0.95, 260, h * 0.5));
        return { plot: { x: 0, y: 0, w, h: ph }, col: { x: 2, y: ph + 6, w: w - 4, h: h - ph - 8 } };
      }
      const cw = Math.round(clamp(w * 0.38, 270, 370));
      return { plot: { x: 0, y: 0, w: w - cw - 10, h }, col: { x: w - cw, y: 2, w: cw - 2, h: h - 4 } };
    }
    const plot = new Plot(surface, { x: [-R0, R0], y: [-R0, R0], pan: false, zoom: false, controls: false, region: () => regions().plot });

    /* ---------- Griff ---------- */
    let dragging = 0;
    plot.addHandle({
      get: () => [shownX, fn().f(shownX)],
      set: (x) => {
        dragging = performance.now();
        ctx.set({ x: Math.round(clamp(x, -4, 4) * 10) / 10 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !mirrorT.running,
      color: () => col.P(),
    });

    /* ---------- Ergebnisse ---------- */
    const plain = (s: string) =>
      s
        .replace(/\\f\{([^}]*)\}\{([^}]*)\}/g, (_m, a: string, b: string) => `${a.includes(' ') ? `(${a})` : a}/${b.includes(' ') ? `(${b})` : b}`)
        .replace(/\\r\{([^}]*)\}/g, '√$1')
        .replace(/\\t\{([^}]*)\}/g, '$1')
        .replace(/\^\{−1\}/g, '⁻¹')
        .replace(/\^x/g, 'ˣ')
        .replace(/_0\^\+/g, '₀⁺')
        .replace(/_0\^−/g, '₀⁻')
        .replace(/\^\+/g, '⁺');
    function updateReadouts(): void {
      const s = STEPS[stepsKey()]!;
      ctx.readout('inv', s.inv ? plain(s.inv) : ctx.t('notOkShort'));
      const x = xP();
      const y = fn().f(x);
      ctx.readout('pts', invertible() ? `P(${n(x)} | ${n(y)}) ↔ P′(${n(y)} | ${n(x)})` : `P(${n(x)} | ${n(y)})`);
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
      palette: { f: col.f(), i: col.inv(), m: th().muted, b: col.bad() },
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

    /* ---------- Zustand ---------- */
    let shownX = xP();
    let lastFrame = performance.now();
    const mirrorT = new Tween(MIRROR_MS, ease.inOutCubic);
    const intro = new Tween(700, ease.outCubic);

    /** Graph als Punktfolge (in Weltkoordinaten), aufgeteilt an Lücken. */
    function samples(): [number, number][][] {
      const f = fn();
      const { xMin, xMax, yMin, yMax } = plot.bounds;
      const lo = Math.max(f.lo, xMin);
      const hi = Math.min(f.hi, xMax);
      const parts: [number, number][][] = [];
      let cur: [number, number][] = [];
      const N = 400;
      for (let i = 0; i <= N; i++) {
        const x = lo + ((hi - lo) * i) / N;
        if (f.gap0 && Math.abs(x) < 1e-3) {
          if (cur.length) parts.push(cur);
          cur = [];
          continue;
        }
        const y = f.f(x);
        if (!Number.isFinite(y) || y < yMin - 4 || y > yMax + 4) {
          if (cur.length > 1) parts.push(cur);
          cur = [];
          continue;
        }
        if (f.gap0 && cur.length && Math.sign(x) !== Math.sign(cur[cur.length - 1]![0])) {
          parts.push(cur);
          cur = [];
        }
        cur.push([x, y]);
      }
      if (cur.length > 1) parts.push(cur);
      return parts;
    }

    /**
     * Platz für eine Graphenbeschriftung: der Kurvenpunkt (zwischen 15 % und
     * 90 % der sichtbaren Punkte), der am weitesten von P, P′ und dem Ursprung
     * entfernt ist.
     */
    function freeSpot(pts: [number, number][]): [number, number] | undefined {
      if (!pts.length) return undefined;
      const x = shownX;
      const y = fn().f(x);
      const avoid: [number, number][] = [plot.toPx(0, 0)];
      if (Number.isFinite(y)) {
        const [px, py] = plot.toPx(x, y);
        const [qx, qy] = plot.toPx(y, x);
        // auch die Punktbeschriftungen (rechts bzw. links daneben) meiden
        avoid.push([px, py], [qx, qy], [qx + 60, qy], [px + (x < 0 ? -60 : 60), py]);
      }
      let best: [number, number] | undefined;
      let bestD = -1;
      const i0 = Math.floor(pts.length * 0.15);
      const i1 = Math.max(i0 + 1, Math.floor(pts.length * 0.9));
      for (let i = i0; i < i1; i += 4) {
        const q = pts[i]!;
        const [qx, qy] = plot.toPx(q[0], q[1]);
        const d = Math.min(...avoid.map(([ax, ay]) => Math.hypot(qx - ax, qy - ay)));
        if (d > bestD) {
          bestD = d;
          best = q;
        }
      }
      return best;
    }

    /* ---------- Plot ---------- */
    function drawPlot(): void {
      const g = surface.g;
      const theme = th();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const { xMin, xMax } = plot.bounds;
      // Spiegelachse y = x
      g.save();
      g.setLineDash([8, 6]);
      plot.line([0, 0], [1, 1], { color: withAlpha(col.mirror(), 0.9), width: 2 });
      g.restore();
      {
        const t = Math.min(xMax, plot.bounds.yMax) - 0.6;
        const [mx, my] = plot.toPx(t, t);
        tag(mx - 8, my + 14, `y = x`, col.mirror(), 'right', F(12.5, 11.5));
      }
      const parts = samples();
      const reveal = intro.running ? intro.value : 1;
      // Graph von f
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : mixColor(col.f(), '#ffffff', 0.5, 0.6);
      g.shadowBlur = 5;
      for (const part of parts) {
        const k = Math.max(2, Math.round(part.length * reveal));
        plot.polyline(part.slice(0, k), { color: col.f(), width: 3 });
      }
      g.restore();
      // Spiegelbild (Graph von f⁻¹ bzw. gespiegelte Relation)
      const mt = mirrorT.running ? mirrorT.value : p.inv ? 1 : 0;
      if (mt > 0) {
        const c = invertible() ? col.inv() : col.bad();
        for (const part of parts) {
          const pts = part.map((q) => mirrorPath(q, mt));
          plot.polyline(pts, { color: withAlpha(c, mirrorT.running ? 0.85 : 1), width: invertible() ? 3 : 2.5, dash: invertible() && key() !== 'hyp' ? undefined : [7, 5] });
        }
        if (!mirrorT.running) {
          // Beschriftung der Graphen
          const lab = invertible() ? '\\c{i}{f^{−1}}' : `\\c{b}{\\t{${ctx.t('noFunction')}}}`;
          const anchor = parts.flat().map((q) => [q[1], q[0]] as [number, number]).filter((q) => q[0] > xMin + 0.5 && q[0] < xMax - 0.5 && q[1] > plot.bounds.yMin + 0.5 && q[1] < plot.bounds.yMax - 0.5);
          const pick = freeSpot(anchor);
          if (pick) {
            const [px, py] = plot.toPx(pick[0], pick[1]);
            tag(px + 10, py + 14, lab, c, 'left', F(14, 13));
          }
        }
      }
      // Beschriftung f
      {
        const pts = parts.flat().filter((q) => q[0] > xMin + 0.5 && q[0] < xMax - 0.5 && q[1] > plot.bounds.yMin + 0.5 && q[1] < plot.bounds.yMax - 0.5);
        const pick = freeSpot(pts);
        if (pick) {
          const [px, py] = plot.toPx(pick[0], pick[1]);
          tag(px - 10, py - 14, '\\c{f}{f}', col.f(), 'right', F(14, 13));
        }
      }
      // Punkt P, Spiegelpunkt P′ und Verbindung
      const x = shownX;
      const y = fn().f(x);
      if (Number.isFinite(y)) {
        const P: [number, number] = [x, y];
        const Q: [number, number] = [y, x];
        const showQ = invertible() && (p.inv || mirrorT.running);
        if (showQ || !invertible()) {
          const Qt = mirrorT.running ? mirrorPath(P, mirrorT.value) : Q;
          if (showQ) {
            plot.segment(P, Qt, { color: withAlpha(theme.text, 0.55), width: 1.5, dash: [4, 4] });
            // rechter Winkel am Mittelpunkt auf y = x
            const M: [number, number] = [(x + y) / 2, (x + y) / 2];
            const [mx, my] = plot.toPx(M[0], M[1]);
            if (Math.abs(x - y) > 0.3) {
              const s = 8;
              const sx = Math.sign(y - x) || 1;
              g.strokeStyle = withAlpha(theme.text, 0.6);
              g.lineWidth = 1.2;
              g.beginPath();
              // Richtungen in Pixeln: y = x zeigt nach rechts oben, das Lot nach links oben bzw. rechts unten
              const ux = Math.SQRT1_2;
              const uy = -Math.SQRT1_2;
              const vx = -Math.SQRT1_2 * sx;
              const vy = -Math.SQRT1_2 * sx;
              g.moveTo(mx + ux * s, my + uy * s);
              g.lineTo(mx + ux * s + vx * s, my + uy * s + vy * s);
              g.lineTo(mx + vx * s, my + vy * s);
              g.stroke();
            }
            plot.point(Qt[0], Qt[1], { color: col.Q(), radius: 6 });
            if (!mirrorT.running) {
              const [qx, qy] = plot.toPx(Q[0], Q[1]);
              tag(qx + 10, qy + (Q[1] > Q[0] ? -16 : 16), `\\c{i}{P\\t{'}(${n(y)} | ${n(x)})}`, col.Q(), 'left', F(12.5, 11.5));
            }
          }
        }
        // Gegenbeispiel bei x² auf ℝ: waagrechte Gerade schneidet zweimal
        const x2 = partner(key(), dom(), x);
        if (x2 !== null) {
          const py = plot.py(y);
          g.save();
          g.strokeStyle = withAlpha(col.bad(), 0.8);
          g.lineWidth = 1.6;
          g.setLineDash([5, 4]);
          g.beginPath();
          g.moveTo(r.x, py);
          g.lineTo(r.x + r.w, py);
          g.stroke();
          g.restore();
          plot.point(x2, y, { color: col.bad(), radius: 5.5 });
          const [ax, ay] = plot.toPx(x2, y);
          tag(ax + (x2 < 0 ? -10 : 10), ay - 16, `(${n(x2)} | ${n(y)})`, col.bad(), x2 < 0 ? 'right' : 'left', F(12.5, 11.5));
        }
        plot.point(x, y, { color: col.P(), radius: 6.5 });
        const [px, py] = plot.toPx(x, y);
        tag(px + (x < 0 ? -10 : 10), py + (y > x ? -16 : 16), `\\c{f}{P(${n(x)} | ${n(y)})}`, col.P(), x < 0 ? 'right' : 'left', F(12.5, 11.5));
      }
      plot.end();
    }

    /* ---------- Karten ---------- */
    function stepsCard(R: Rect): number {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const s = STEPS[stepsKey()]!;
      const fs = F(15, 13.5);
      const rows: { kind: 'label' | 'f'; src: string; color?: string }[] = [];
      rows.push({ kind: 'f', src: `\\c{f}{${s.f}}` });
      if (p.show) {
        rows.push({ kind: 'label', src: ctx.t('solve') });
        for (const st of s.solve) rows.push({ kind: 'f', src: st });
        if (s.inv) {
          rows.push({ kind: 'label', src: ctx.t('swap') });
          rows.push({ kind: 'f', src: `\\c{i}{${s.inv}}` });
        }
      } else rows.push({ kind: 'f', src: `\\c{i}{f^{−1}(x) = ?}` });
      const boxes = rows.map((row) => (row.kind === 'f' ? fitFormula(row.src, maxW - 10, fs) : null));
      const h = 30 + rows.reduce((sum, row, i) => sum + (row.kind === 'label' ? 20 : boxes[i]!.asc + boxes[i]!.desc + 6), 0) + 6;
      if (R.h <= 0) return h;
      card({ ...R, h }, col.inv(), 0.03);
      title(R.x + pad, R.y + 16, ctx.t('stepsT'), col.inv());
      let y = R.y + 28;
      rows.forEach((row, i) => {
        if (row.kind === 'label') {
          text(g, row.src, R.x + pad, y + 10, { font: font(700, F(12, 11)), color: theme.muted, align: 'left' });
          y += 20;
        } else {
          const b = boxes[i]!;
          b.draw(g, R.x + pad + 8, y + b.asc);
          y += b.asc + b.desc + 6;
        }
      });
      return h;
    }

    function setsCard(R: Rect): void {
      const g = surface.g;
      const theme = th();
      const pad = F(14, 12);
      const maxW = R.w - 2 * pad;
      const s = STEPS[stepsKey()]!;
      card(R, invertible() ? undefined : col.bad(), invertible() ? 0 : 0.04);
      title(R.x + pad, R.y + 16, ctx.t('okT'), invertible() ? theme.muted : col.bad());
      const f = font(600, F(12.5, 11.5));
      let y = R.y + 30;
      let msg = ctx.t('ok');
      if (!invertible()) {
        const x = xP();
        const x2 = partner(key(), dom(), x) ?? -x;
        msg = tr('notOk', { a: n(x2), b: n(x), y: n(fn().f(x)) });
      } else if (key() === 'hyp') msg = `${ctx.t('okHyp')} ${ctx.t('self')}`;
      for (const row of wrap(msg, maxW, f)) {
        if (y > R.y + R.h - 12) return;
        text(g, row, R.x + pad, y + 6, { font: f, color: invertible() ? theme.text : col.bad(), align: 'left' });
        y += 16;
      }
      if (!invertible() || y > R.y + R.h - 70) return;
      y += 8;
      title(R.x + pad, y + 6, ctx.t('setsT'));
      y += 16;
      const fs = F(13.5, 12.5);
      const Q = (v: string) => (p.show ? v : '?');
      y = line(`\\c{f}{D_f = ${s.df}},   \\c{f}{W_f = ${s.wf}}`, R.x + pad + 8, y, maxW - 8, fs) + 6;
      y = line(`\\c{i}{D_{f^{−1}} = ${Q(s.wf)}},   \\c{i}{W_{f^{−1}} = ${Q(s.df)}}`, R.x + pad + 8, y, maxW - 8, fs) + 6;
      if (y < R.y + R.h - 14) text(g, ctx.t('swapSets'), R.x + pad, y + 6, { font: font(600, F(12, 11)), color: theme.muted, align: 'left' });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastFrame) / 1000);
      lastFrame = now;
      if (dragging && now - dragging > 250) dragging = 0;
      let moving = false;
      const goal = xP();
      if (dragging || reduced || Math.abs(goal - shownX) < 1e-3) shownX = goal;
      else {
        shownX += (goal - shownX) * (1 - Math.exp(-dt * 9));
        moving = true;
      }
      surface.begin();
      plot.resize();
      drawPlot();
      const C = regions().col;
      const gap = F(10, 8);
      const h1 = stepsCard({ ...C, h: 0 });
      stepsCard({ x: C.x, y: C.y, w: C.w, h: h1 });
      if (C.h - h1 - gap > 80) setsCard({ x: C.x, y: C.y + h1 + gap, w: C.w, h: Math.min(C.h - h1 - gap, F(190, 180)) });
      if (moving || dragging || mirrorT.running || intro.running) ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('fn') || changed.has('dom')) {
          intro.play(reduced ? 1 : 700);
          if (source === 'input' && Math.abs(xP() - p.x) > 1e-9) ctx.set({ x: Math.round(xP() * 10) / 10 });
        }
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (id !== 'mirror') return;
        mirrorT.play(reduced ? 1 : MIRROR_MS);
        if (!p.inv) ctx.set({ inv: true });
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
