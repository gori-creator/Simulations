import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { circleCircle, generalForm, lineCircle, pointPosition, tangentAt, tangentPoints, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
const LIM = 10;

type Mode = 'punkt' | 'gerade' | 'zwei' | 'tangente';

/**
 * Kreise in der Ebene: Kreisgleichung, Lage von Punkt, Gerade und zweitem
 * Kreis, Tangenten (auch von einem Punkt außerhalb, mit Thaleskreis).
 */
export default defineSimulation({
  id: 'kreisgleichung',
  layout: { aspect: 1.35, aspectNarrow: 0.95 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'punkt', label: L('Punkt und Kreis', 'Point and circle') },
        { value: 'gerade', label: L('Gerade und Kreis', 'Line and circle') },
        { value: 'zwei', label: L('Zwei Kreise', 'Two circles') },
        { value: 'tangente', label: L('Tangenten', 'Tangents') },
      ],
      default: 'punkt',
      display: 'buttons',
    },
    { key: 'a', type: 'number', label: L('Mittelpunkt: x-Koordinate a', 'Centre: x-coordinate a'), min: -8, max: 8, step: 0.5, default: 1 },
    { key: 'b', type: 'number', label: L('Mittelpunkt: y-Koordinate b', 'Centre: y-coordinate b'), min: -6, max: 6, step: 0.5, default: -1 },
    { key: 'r', type: 'number', label: L('Radius r', 'Radius r'), min: 0.5, max: 8, step: 0.5, default: 4 },
    { key: 'px', type: 'number', label: L('Punkt P: x', 'Point P: x'), min: -10, max: 10, step: 0.5, default: 5, visibleIf: (v) => v.mode === 'punkt' || v.mode === 'tangente' },
    { key: 'py', type: 'number', label: L('Punkt P: y', 'Point P: y'), min: -8, max: 8, step: 0.5, default: 3, visibleIf: (v) => v.mode === 'punkt' || v.mode === 'tangente' },
    { key: 'm', type: 'number', label: L('Gerade: Steigung m', 'Line: slope m'), min: -4, max: 4, step: 0.25, default: 0.5, visibleIf: (v) => v.mode === 'gerade' },
    { key: 'n', type: 'number', label: L('Gerade: y-Achsenabschnitt n', 'Line: y-intercept n'), min: -10, max: 10, step: 0.5, default: 1, visibleIf: (v) => v.mode === 'gerade' },
    { key: 'c', type: 'number', label: L('2. Kreis: Mittelpunkt x', '2nd circle: centre x'), min: -8, max: 8, step: 0.5, default: 5, visibleIf: (v) => v.mode === 'zwei' },
    { key: 'e', type: 'number', label: L('2. Kreis: Mittelpunkt y', '2nd circle: centre y'), min: -6, max: 6, step: 0.5, default: 1, visibleIf: (v) => v.mode === 'zwei' },
    { key: 's', type: 'number', label: L('2. Kreis: Radius', '2nd circle: radius'), min: 0.5, max: 8, step: 0.5, default: 3, visibleIf: (v) => v.mode === 'zwei' },
  ],
  hint: (v) =>
    v.mode === 'gerade'
      ? L('Vergleiche den Abstand d des Mittelpunkts von der Geraden mit dem Radius r.', 'Compare the distance d of the centre from the line with the radius r.')
      : v.mode === 'zwei'
        ? L('Vergleiche den Abstand der Mittelpunkte mit r₁ + r₂ und |r₁ − r₂|.', 'Compare the distance between the centres with r₁ + r₂ and |r₁ − r₂|.')
        : v.mode === 'tangente'
          ? L('Die Tangente steht senkrecht auf dem Radius. Von außen findet man die Berührpunkte mit dem Thaleskreis über MP.', 'The tangent is perpendicular to the radius. From outside, the Thales circle over MP gives the points of contact.')
          : L('Ziehe M oder P. Setzt man P in die Kreisgleichung ein, zeigt der Vergleich mit r², wo P liegt.', 'Drag M or P. Substituting P into the equation of the circle and comparing with r² shows where P lies.'),
  readouts: [
    { key: 'eq', label: L('Kreisgleichung', 'Equation of the circle') },
    { key: 'gen', label: L('Allgemeine Form', 'General form') },
    { key: 'eq2', label: L('2. Kreis', '2nd circle') },
    { key: 'line', label: L('Gerade', 'Line') },
    { key: 'ins', label: L('P einsetzen', 'Substitute P') },
    { key: 'd', label: L('Abstand', 'Distance') },
    { key: 'res', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'ursprung', label: L('Kreis um den Ursprung, P(3|4)', 'Circle about the origin, P(3|4)'), values: { mode: 'punkt', a: 0, b: 0, r: 5, px: 3, py: 4 } },
    { id: 'sekante', label: L('Sekante', 'Secant'), values: { mode: 'gerade', a: 1, b: -1, r: 4, m: 0.5, n: 1 } },
    { id: 'beruehr', label: L('Tangente y = 5', 'Tangent y = 5'), values: { mode: 'gerade', a: 0, b: 0, r: 5, m: 0, n: 5 } },
    { id: 'zwei', label: L('Zwei Kreise schneiden sich', 'Two circles intersect'), values: { mode: 'zwei', a: 0, b: 0, r: 4, c: 5, e: 1, s: 3 } },
    { id: 'aussen', label: L('Tangenten von außen', 'Tangents from outside'), values: { mode: 'tangente', a: 0, b: 0, r: 3, px: 7, py: 2 } },
    { id: 'imPunkt', label: L('Tangente in P(3|4)', 'Tangent at P(3|4)'), values: { mode: 'tangente', a: 0, b: 0, r: 5, px: 3, py: 4 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit einem Kreis um M; je nach Ansicht mit Punkt P, einer Geraden, einem zweiten Kreis oder Tangenten',
      in: 'P liegt innerhalb des Kreises.',
      on: 'P liegt auf dem Kreis.',
      out: 'P liegt außerhalb des Kreises.',
      secant: 'Sekante: zwei Schnittpunkte {p}',
      tangent: 'Tangente: ein Berührpunkt {p}',
      passant: 'Passante: kein gemeinsamer Punkt',
      dLine: 'd = {d}, r = {r}',
      dCenters: '|M₁M₂| = {D};  r₁ + r₂ = {s};  |r₁ − r₂| = {f}',
      dP: '|MP| = {d}, r = {r}',
      apart: 'Die Kreise liegen außerhalb voneinander.',
      touchOut: 'Die Kreise berühren sich von außen in {p}.',
      cut: 'Die Kreise schneiden sich in {p}.',
      touchIn: 'Die Kreise berühren sich von innen in {p}.',
      inside: 'Ein Kreis liegt im anderen, ohne ihn zu berühren.',
      same: 'Die Kreise sind gleich.',
      concentric: 'Die Kreise haben denselben Mittelpunkt (konzentrisch).',
      noTangent: 'P liegt im Kreis – keine Tangente durch P.',
      tangents: 'Tangenten: {t}',
      tangentOn: 'Tangente in P: {t}',
      and: ' und ',
      thales: 'Thaleskreis',
    },
    en: {
      canvas: 'Coordinate system with a circle around M; depending on the view with a point P, a line, a second circle or tangents',
      in: 'P lies inside the circle.',
      on: 'P lies on the circle.',
      out: 'P lies outside the circle.',
      secant: 'Secant: two intersection points {p}',
      tangent: 'Tangent: one point of contact {p}',
      passant: 'Non-intersecting line: no common point',
      dLine: 'd = {d}, r = {r}',
      dCenters: '|M₁M₂| = {D};  r₁ + r₂ = {s};  |r₁ − r₂| = {f}',
      dP: '|MP| = {d}, r = {r}',
      apart: 'The circles lie outside each other.',
      touchOut: 'The circles touch from outside at {p}.',
      cut: 'The circles intersect at {p}.',
      touchIn: 'The circles touch from inside at {p}.',
      inside: 'One circle lies inside the other without touching it.',
      same: 'The circles are identical.',
      concentric: 'The circles have the same centre (concentric).',
      noTangent: 'P lies inside the circle – no tangent through P.',
      tangents: 'Tangents: {t}',
      tangentOn: 'Tangent at P: {t}',
      and: ' and ',
      thales: 'Thales circle',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const n = (v: number, d = 2) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, d);
    const pt = (q: Pt) => fmt.point(q[0], q[1], 2);
    const snap = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, Math.round(v * 2) / 2));

    /** „(x − 2)²“, „(y + 3)²“ oder „x²“ */
    const sq = (name: string, c: number) => (c === 0 ? `${name}²` : c > 0 ? `(${name} − ${n(c)})²` : `(${name} + ${n(-c)})²`);
    const circleEq = (a: number, b: number, r: number) => `${sq('x', a)} + ${sq('y', b)} = ${n(r * r)}`;
    function generalEq(a: number, b: number, r: number): string {
      const { D, E, F } = generalForm(a, b, r);
      let s = 'x² + y²';
      const add = (v: number, t: string) => {
        if (Math.abs(v) < 1e-9) return;
        s += v < 0 ? ` − ${n(-v)}${t}` : ` + ${n(v)}${t}`;
      };
      add(D, 'x');
      add(E, 'y');
      add(F, '');
      return `${s} = 0`;
    }
    function lineEq(k: number, c: number): string {
      const kx = Math.abs(k) < 1e-9 ? '' : `${n(k)}x`;
      if (kx === '') return `y = ${n(c)}`;
      return Math.abs(c) < 1e-9 ? `y = ${kx}` : `y = ${kx} ${c < 0 ? '−' : '+'} ${n(Math.abs(c))}`;
    }
    const tangentEq = (t: Pt) => {
      const tl = tangentAt(p.a, p.b, t);
      return tl.vertical ? `x = ${n(tl.c)}` : lineEq(tl.k, tl.c);
    };

    const plot = new Plot(surface, { x: [-LIM, LIM], y: [-8, 8], equalAspect: true, pan: false, zoom: false, controls: false });
    plot.addHandle({
      get: () => [p.a, p.b],
      set: (x, y) => ctx.set({ a: snap(x, -8, 8), b: snap(y, -6, 6) }),
      enabled: () => !ctx.locked,
      color: () => ctx.theme.series[0]!,
    });
    plot.addHandle({
      get: () => [p.px, p.py],
      set: (x, y) => ctx.set({ px: snap(x, -10, 10), py: snap(y, -8, 8) }),
      enabled: () => !ctx.locked && (mode() === 'punkt' || mode() === 'tangente'),
      color: () => ctx.theme.series[1]!,
    });
    plot.addHandle({
      get: () => [p.c, p.e],
      set: (x, y) => ctx.set({ c: snap(x, -8, 8), e: snap(y, -6, 6) }),
      enabled: () => !ctx.locked && mode() === 'zwei',
      color: () => ctx.theme.series[1]!,
    });
    plot.addHandle({
      get: () => [0, p.n],
      set: (_x, y) => ctx.set({ n: snap(y, -10, 10) }),
      axis: 'y',
      enabled: () => !ctx.locked && mode() === 'gerade',
      color: () => ctx.theme.series[1]!,
    });

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      show.eq = circleEq(p.a, p.b, p.r);
      if (mode() === 'punkt') {
        show.gen = generalEq(p.a, p.b, p.r);
        const pp = pointPosition(p.a, p.b, p.r, p.px, p.py);
        const cmp = pp.pos === 'on' ? '=' : pp.pos === 'in' ? '<' : '>';
        show.ins = `${sq(n(p.px), p.a)} + ${sq(n(p.py), p.b)} = ${n(pp.value)} ${cmp} ${n(p.r * p.r)}`;
        show.d = tr('dP', { d: n(pp.d), r: n(p.r) });
        show.res = ctx.t(pp.pos);
      } else if (mode() === 'gerade') {
        show.line = lineEq(p.m, p.n);
        const lc = lineCircle(p.a, p.b, p.r, p.m, p.n);
        show.d = tr('dLine', { d: n(lc.d), r: n(p.r) });
        show.res = tr(lc.kind, { p: lc.points.map(pt).join(ctx.t('and')) });
      } else if (mode() === 'zwei') {
        show.eq2 = circleEq(p.c, p.e, p.s);
        const cc = circleCircle(p.a, p.b, p.r, p.c, p.e, p.s);
        show.d = tr('dCenters', { D: n(cc.D), s: n(p.r + p.s), f: n(Math.abs(p.r - p.s)) });
        show.res = tr(cc.kind, { p: cc.points.map(pt).join(ctx.t('and')) });
      } else {
        const pp = pointPosition(p.a, p.b, p.r, p.px, p.py);
        show.d = tr('dP', { d: n(pp.d), r: n(p.r) });
        const ts = tangentPoints(p.a, p.b, p.r, p.px, p.py);
        show.res = ts.length === 0 ? ctx.t('noTangent') : ts.length === 1 ? tr('tangentOn', { t: tangentEq(ts[0]!) }) : tr('tangents', { t: ts.map(tangentEq).join(ctx.t('and')) });
      }
      for (const k of ['eq', 'gen', 'eq2', 'line', 'ins', 'd', 'res']) ctx.readout(k, show[k] ?? null);
    }

    function drawTangentLine(t: Pt, color: string): void {
      const tl = tangentAt(p.a, p.b, t);
      if (tl.vertical) plot.line([tl.c, 0], [tl.c, 1], { color, width: 2 });
      else plot.line([0, tl.c], [1, tl.k + tl.c], { color, width: 2 });
    }

    function draw(): void {
      const th = ctx.theme;
      const c0 = th.series[0]!;
      const c1 = th.series[1]!;
      const cx = th.series[3]!;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.circle(p.a, p.b, p.r, { fill: c0, alpha: 0.07 });
      plot.circle(p.a, p.b, p.r, { stroke: c0, width: 2.5 });
      const lbl = { size: 13, weight: 'bold' as const };

      if (mode() === 'punkt') {
        const pp = pointPosition(p.a, p.b, p.r, p.px, p.py);
        plot.segment([p.a, p.b], [p.px, p.py], { color: th.muted, width: 1.5, dash: [5, 4] });
        plot.point(p.px, p.py, { color: pp.pos === 'on' ? th.series[2]! : c1, radius: 5 });
        plot.text(p.px, p.py, 'P', { ...lbl, color: c1, align: 'left', offset: [9, -10] });
      } else if (mode() === 'gerade') {
        plot.line([0, p.n], [1, p.m + p.n], { color: c1, width: 2.5 });
        // Lotfußpunkt von M auf die Gerade
        const t = (p.a + p.m * (p.b - p.n)) / (1 + p.m * p.m);
        const foot: Pt = [t, p.m * t + p.n];
        plot.segment([p.a, p.b], foot, { color: th.muted, width: 1.5, dash: [5, 4] });
        plot.point(foot[0], foot[1], { color: th.muted, radius: 3 });
        plot.text((p.a + foot[0]) / 2, (p.b + foot[1]) / 2, 'd', { size: 13, color: th.muted, align: 'left', offset: [6, 0] });
        for (const q of lineCircle(p.a, p.b, p.r, p.m, p.n).points) plot.point(q[0], q[1], { color: cx, radius: 5.5 });
      } else if (mode() === 'zwei') {
        plot.circle(p.c, p.e, p.s, { fill: c1, alpha: 0.06 });
        plot.circle(p.c, p.e, p.s, { stroke: c1, width: 2.5 });
        plot.segment([p.a, p.b], [p.c, p.e], { color: th.muted, width: 1.5, dash: [5, 4] });
        plot.text(p.c, p.e, 'M₂', { ...lbl, color: c1, align: 'left', offset: [9, -10] });
        for (const q of circleCircle(p.a, p.b, p.r, p.c, p.e, p.s).points) plot.point(q[0], q[1], { color: cx, radius: 5.5 });
      } else {
        const ts = tangentPoints(p.a, p.b, p.r, p.px, p.py);
        if (ts.length === 2) {
          const mx = (p.a + p.px) / 2;
          const my = (p.b + p.py) / 2;
          const rr = Math.hypot(p.px - p.a, p.py - p.b) / 2;
          plot.circle(mx, my, rr, { stroke: th.muted, width: 1.2, dash: [4, 4] });
          plot.text(mx, my + rr, ctx.t('thales'), { size: 12, color: th.muted, offset: [0, -10] });
        }
        for (const t of ts) {
          drawTangentLine(t, th.series[2]!);
          plot.segment([p.a, p.b], t, { color: c0, width: 1.5, dash: [5, 4] });
          plot.point(t[0], t[1], { color: cx, radius: 5.5 });
        }
        plot.point(p.px, p.py, { color: c1, radius: 5 });
        plot.text(p.px, p.py, 'P', { ...lbl, color: c1, align: 'left', offset: [9, -10] });
      }
      plot.text(p.a, p.b, mode() === 'zwei' ? 'M₁' : 'M', { ...lbl, color: c0, align: 'left', offset: [9, -10] });
      plot.end();
    }

    return {
      update() {
        plot.setRangePadded([-LIM, LIM], [-8, 8], { left: 30, right: 12, top: 12, bottom: 22 });
        plot.setAxes({ x: { label: 'x', minStep: 1 }, y: { label: 'y', minStep: 1 } });
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        draw();
      },
      destroy: () => surface.destroy(),
    };
  },
});
