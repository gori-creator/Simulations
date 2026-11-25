import { defineSimulation, drawArrowHead, Plot, Surface, text } from '../../../sim-core';
import { holds, inSolution, REL_SYMBOL, solve, steps, type Rel } from './model';

const L = (de: string, en: string) => ({ de, en });
const X_RANGE: [number, number] = [-10, 10];

/**
 * Lineare Ungleichungen: beide Seiten als Geraden, Lösungsbereich farbig,
 * Lösungsmenge am Zahlenstrahl und die Umformungsschritte.
 */
export default defineSimulation({
  id: 'ungleichungen',
  layout: { aspect: 1.25, aspectNarrow: 0.62 },
  params: [
    { key: 'a', type: 'number', label: L('links: Faktor a vor x', 'left: coefficient a of x'), min: -5, max: 5, step: 0.5, default: 2 },
    { key: 'b', type: 'number', label: L('links: Zahl b', 'left: number b'), min: -10, max: 10, step: 0.5, default: 1 },
    {
      key: 'rel',
      type: 'choice',
      label: L('Zeichen', 'Sign'),
      options: [
        { value: 'lt', label: L('<', '<') },
        { value: 'le', label: L('≤', '≤') },
        { value: 'gt', label: L('>', '>') },
        { value: 'ge', label: L('≥', '≥') },
      ],
      default: 'lt',
      display: 'buttons',
    },
    { key: 'c', type: 'number', label: L('rechts: Faktor c vor x', 'right: coefficient c of x'), min: -5, max: 5, step: 0.5, default: 0 },
    { key: 'd', type: 'number', label: L('rechts: Zahl d', 'right: number d'), min: -10, max: 10, step: 0.5, default: 7 },
    { key: 't', type: 'number', label: L('Probe: x einsetzen', 'Check: substitute x'), min: -10, max: 10, step: 0.5, default: 1 },
  ],
  hint: () =>
    L(
      'Wo liegt die linke Gerade unter (oder über) der rechten? Ziehe den Probepunkt. Teilt man durch eine negative Zahl, dreht sich das Zeichen um.',
      'Where is the left line below (or above) the right one? Drag the test point. Dividing by a negative number reverses the sign.',
    ),
  readouts: [
    { key: 'ineq', label: L('Ungleichung', 'Inequality') },
    { key: 'sol', label: L('Lösungsmenge', 'Solution set'), spoiler: true },
    { key: 'chk', label: L('Probe', 'Check') },
  ],
  presets: [
    { id: 'einfach', label: L('2x + 1 < 7', '2x + 1 < 7'), values: { a: 2, b: 1, rel: 'lt', c: 0, d: 7, t: 1 } },
    { id: 'dreh', label: L('Zeichen dreht sich: −2x + 4 ≥ 0', 'Sign reverses: −2x + 4 ≥ 0'), values: { a: -2, b: 4, rel: 'ge', c: 0, d: 0, t: 0 } },
    { id: 'beide', label: L('3x − 2 > x + 4', '3x − 2 > x + 4'), values: { a: 3, b: -2, rel: 'gt', c: 1, d: 4, t: 5 } },
    { id: 'tarif', label: L('Tarifvergleich', 'Comparing tariffs'), values: { a: 0.5, b: 2, rel: 'lt', c: 1, d: 0, t: 6 } },
    { id: 'immer', label: L('Immer wahr: x + 1 > x', 'Always true: x + 1 > x'), values: { a: 1, b: 1, rel: 'gt', c: 1, d: 0, t: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Zwei Geraden für die linke und die rechte Seite der Ungleichung, der Bereich der Lösungen ist farbig; darunter die Lösungsmenge am Zahlenstrahl und die Umformungsschritte',
      setBound: 'L = {x | x {r} {v}}',
      setAll: 'L = ℝ (immer erfüllt)',
      setNone: 'L = { } (nie erfüllt)',
      chkYes: '{l} {r} {rr} ✓ stimmt',
      chkNo: '{l} {r} {rr} ✗ stimmt nicht',
      left: 'links',
      right: 'rechts',
      collectX: '| {op}   (x nach links)',
      collectN: '| {op}   (Zahlen nach rechts)',
      divide: '| : {k}',
      flipNote: 'Zeichen umdrehen!',
      allLine: 'Die x fallen weg: {s} ist {w}.',
      wTrue: 'immer wahr',
      wFalse: 'nie wahr',
      solLabel: 'Lösungsmenge',
    },
    en: {
      canvas: 'Two lines for the left and right side of the inequality, the region of solutions is shaded; below, the solution set on the number line and the steps of the transformation',
      setBound: 'S = {x | x {r} {v}}',
      setAll: 'S = ℝ (always true)',
      setNone: 'S = { } (never true)',
      chkYes: '{l} {r} {rr} ✓ true',
      chkNo: '{l} {r} {rr} ✗ false',
      left: 'left',
      right: 'right',
      collectX: '| {op}   (x to the left)',
      collectN: '| {op}   (numbers to the right)',
      divide: '| : {k}',
      flipNote: 'reverse the sign!',
      allLine: 'The x terms cancel: {s} is {w}.',
      wTrue: 'always true',
      wFalse: 'never true',
      solLabel: 'Solution set',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const rel = () => p.rel as Rel;
    const sym = (r: Rel) => REL_SYMBOL[r];
    const n = (v: number) => fmt.num(v === 0 ? 0 : v, 2);

    /** Term k·x + m lesbar („2x + 1“, „−x“, „3“). */
    function term(k: number, m: number): string {
      let s = '';
      if (k !== 0) s = k === 1 ? 'x' : k === -1 ? '−x' : `${n(k)}x`;
      if (m !== 0 || s === '') {
        if (s === '') s = n(m);
        else s += m < 0 ? ` − ${n(-m)}` : ` + ${n(m)}`;
      }
      return s;
    }
    const xTerm = (k: number) => (k === 1 ? 'x' : k === -1 ? '−x' : `${n(k)}x`);
    const signed = (v: number, unit = '') => (v < 0 ? `− ${n(-v)}${unit}` : `+ ${n(v)}${unit}`);

    const regionPlot = (w: number, h: number) => ({ x: 0, y: 0, w, h: Math.round(h * (w < 560 ? 0.56 : 0.6)) });
    const plot = new Plot(surface, { x: X_RANGE, y: [-10, 10], equalAspect: false, pan: false, zoom: false, controls: false, region: regionPlot });
    const f = (x: number) => p.a * x + p.b;
    const g = (x: number) => p.c * x + p.d;

    plot.addHandle({
      get: () => [p.t, f(p.t)],
      set: (x) => ctx.set({ t: Math.max(-10, Math.min(10, Math.round(x * 2) / 2)) }),
      axis: 'x',
      enabled: () => !ctx.locked,
      color: () => ctx.theme.series[0]!,
    });

    function setRange(): void {
      const vals = [f(X_RANGE[0]), f(X_RANGE[1]), g(X_RANGE[0]), g(X_RANGE[1])];
      let lo = Math.max(-40, Math.min(-2, ...vals));
      let hi = Math.min(40, Math.max(2, ...vals));
      if (hi - lo < 6) {
        lo -= 3;
        hi += 3;
      }
      plot.setRangePadded(X_RANGE, [lo, hi], { left: 40, right: 14, top: 14, bottom: 22 });
      plot.setAxes({ x: { label: 'x', minStep: 1 }, y: { label: 'y' } });
    }

    function updateReadouts(): void {
      const sol = solve(p.a, p.b, p.c, p.d, rel());
      ctx.readout('ineq', `${term(p.a, p.b)} ${sym(rel())} ${term(p.c, p.d)}`);
      ctx.readout('sol', sol.kind === 'all' ? ctx.t('setAll') : sol.kind === 'none' ? ctx.t('setNone') : tr('setBound', { r: sym(sol.rel), v: fmt.approx(sol.x, 2).replace(/^= /, '') }));
      const l = f(p.t);
      const r = g(p.t);
      ctx.readout('chk', tr(holds(l, r, rel()) ? 'chkYes' : 'chkNo', { l: n(l), r: sym(rel()), rr: n(r) }));
    }

    function drawPlot(): void {
      const th = ctx.theme;
      const sol = solve(p.a, p.b, p.c, p.d, rel());
      plot.begin();
      // Lösungsbereich als senkrechter Streifen
      const band = (from: number, to: number) => plot.fillBetween(() => 1e4, () => -1e4, from, to, { fill: th.series[2]!, alpha: 0.12 });
      if (sol.kind === 'all') band(X_RANGE[0] - 1, X_RANGE[1] + 1);
      else if (sol.kind === 'bound') {
        if (sol.rel === 'lt' || sol.rel === 'le') band(X_RANGE[0] - 1, Math.min(sol.x, X_RANGE[1] + 1));
        else band(Math.max(sol.x, X_RANGE[0] - 1), X_RANGE[1] + 1);
      }
      plot.grid({ minor: false });
      plot.axes();
      plot.fn(g, { color: th.series[1]!, width: 2.5 });
      plot.fn(f, { color: th.series[0]!, width: 2.5 });
      if (sol.kind === 'bound') {
        plot.vline(sol.x, { color: th.series[2]!, width: 1.5, dash: [5, 4] });
        plot.point(sol.x, f(sol.x), { color: th.series[2]!, radius: 5 });
      }
      // Probe
      const ok = holds(f(p.t), g(p.t), rel());
      plot.segment([p.t, f(p.t)], [p.t, g(p.t)], { color: ok ? th.series[2]! : th.muted, width: 2, dash: [3, 3] });
      plot.point(p.t, g(p.t), { color: th.series[1]!, radius: 4.5 });
      plot.end();
    }

    function drawBelow(): void {
      const g2 = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 560;
      const fs = narrow ? 12 : 14;
      const top = regionPlot(W, H).h;
      const sol = solve(p.a, p.b, p.c, p.d, rel());

      // Zahlenstrahl
      const x0 = plot.px(X_RANGE[0]);
      const x1 = plot.px(X_RANGE[1]);
      const ly = top + (narrow ? 34 : 40);
      text(g2, ctx.t('solLabel'), 14, top + 12, { font: `600 ${fs - 1}px ${th.font}`, color: th.muted, align: 'left' });
      g2.strokeStyle = th.axis;
      g2.lineWidth = 1.5;
      g2.beginPath();
      g2.moveTo(x0 - 6, ly);
      g2.lineTo(x1 + 6, ly);
      g2.stroke();
      drawArrowHead(g2, x1 + 10, ly, 0, 8, th.axis);
      for (let v = X_RANGE[0]; v <= X_RANGE[1]; v++) {
        const big = v % (narrow ? 5 : 2) === 0;
        g2.strokeStyle = big ? th.axis : th.grid;
        g2.lineWidth = 1;
        g2.beginPath();
        g2.moveTo(plot.px(v), ly - (big ? 5 : 3));
        g2.lineTo(plot.px(v), ly + (big ? 5 : 3));
        g2.stroke();
        if (big) text(g2, n(v), plot.px(v), ly + 15, { font: `500 ${fs - 2}px ${th.font}`, color: th.muted });
      }
      const col = th.series[2]!;
      g2.strokeStyle = col;
      g2.lineWidth = 6;
      g2.lineCap = 'round';
      const seg = (a: number, b: number) => {
        g2.beginPath();
        g2.moveTo(a, ly);
        g2.lineTo(b, ly);
        g2.stroke();
      };
      if (sol.kind === 'all') {
        seg(x0, x1);
        drawArrowHead(g2, x1 + 12, ly, 0, 12, col);
        drawArrowHead(g2, x0 - 12, ly, Math.PI, 12, col);
      } else if (sol.kind === 'bound') {
        const bx = Math.max(x0 - 4, Math.min(x1 + 4, plot.px(sol.x)));
        const left = sol.rel === 'lt' || sol.rel === 'le';
        if (left) {
          if (bx > x0) seg(x0, bx);
          drawArrowHead(g2, x0 - 12, ly, Math.PI, 12, col);
        } else {
          if (bx < x1) seg(bx, x1);
          drawArrowHead(g2, x1 + 12, ly, 0, 12, col);
        }
        if (sol.x >= X_RANGE[0] && sol.x <= X_RANGE[1]) {
          const closed = sol.rel === 'le' || sol.rel === 'ge';
          g2.beginPath();
          g2.arc(bx, ly, 6.5, 0, Math.PI * 2);
          g2.fillStyle = closed ? col : th.bg;
          g2.fill();
          g2.lineWidth = 2.5;
          g2.strokeStyle = col;
          g2.stroke();
        }
      }
      g2.lineCap = 'butt';
      // Probepunkt auf dem Zahlenstrahl
      const ok = inSolution(sol, p.t);
      g2.fillStyle = ok ? th.series[0]! : th.muted;
      g2.beginPath();
      g2.moveTo(plot.px(p.t), ly - 9);
      g2.lineTo(plot.px(p.t) - 6, ly - 18);
      g2.lineTo(plot.px(p.t) + 6, ly - 18);
      g2.closePath();
      g2.fill();

      // Umformungsschritte
      const st = steps(p.a, p.b, p.c, p.d, rel());
      const lines: { t: string; note?: string; c: string; b?: boolean }[] = [];
      lines.push({ t: `${term(p.a, p.b)} ${sym(rel())} ${term(p.c, p.d)}`, c: th.text, b: true });
      if (p.c !== 0) lines.push({ t: `${term(st.k, p.b)} ${sym(rel())} ${n(p.d)}`, note: tr('collectX', { op: p.c > 0 ? `− ${xTerm(p.c)}` : `+ ${xTerm(-p.c)}` }), c: th.text });
      if (st.k === 0) {
        lines.push({ t: tr('allLine', { s: `${n(p.b)} ${sym(rel())} ${n(p.d)}`, w: ctx.t(holds(p.b, p.d, rel()) ? 'wTrue' : 'wFalse') }), c: th.series[2]!, b: true });
      } else {
        if (p.b !== 0) lines.push({ t: `${xTerm(st.k)} ${sym(rel())} ${n(st.m)}`, note: tr('collectN', { op: signed(-p.b) }), c: th.text });
        if (st.k !== 1) lines.push({ t: `x ${sym(st.rel)} ${fmt.approx(st.m / st.k, 2).replace(/^= /, '')}`, note: tr('divide', { k: st.k < 0 ? `(${n(st.k)})` : n(st.k) }) + (st.flipped ? `  ${ctx.t('flipNote')}` : ''), c: st.flipped ? th.series[1]! : th.series[2]!, b: true });
        else lines[lines.length - 1]!.c = th.series[2]!;
      }
      const sy = ly + (narrow ? 34 : 40);
      const lh = Math.min(fs * 1.9, (H - sy - 4) / Math.max(1, lines.length));
      const colX = narrow ? 14 : Math.max(14, plot.px(X_RANGE[0]));
      const noteX = colX + (narrow ? Math.min(W * 0.5, 190) : 250);
      lines.forEach((l, i) => {
        const y = sy + lh * (i + 0.5);
        text(g2, l.t, colX, y, { font: `${l.b ? 700 : 500} ${fs + 1}px ${th.font}`, color: l.c, align: 'left' });
        // Die Umformung steht in der Zeile, auf die sie angewendet wird (also eine Zeile höher).
        if (l.note) text(g2, l.note, noteX, y - lh, { font: `500 ${fs - 1}px ${th.font}`, color: l.c === th.series[1] ? th.series[1]! : th.muted, align: 'left' });
      });
    }

    return {
      update() {
        setRange();
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        drawPlot();
        drawBelow();
      },
      destroy: () => surface.destroy(),
    };
  },
});
