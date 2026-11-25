import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { bestLattice, feasible, latticePoints, optimum, type Constraint, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
type Scenario = 'werkstatt' | 'futter' | 'eigen';
const M = 12;

interface Setup {
  cons: Constraint[];
  names: { de: string; en: string }[];
  goal: 'max' | 'min';
  view: number;
}

/**
 * Lineare Optimierung: Planungsvieleck aus Ungleichungen, verschiebbare
 * Zielgerade, optimale Ecke, wahlweise nur ganzzahlige Lösungen.
 */
export default defineSimulation({
  id: 'lineare-optimierung',
  layout: { aspect: 1.35, aspectNarrow: 0.95 },
  params: [
    {
      key: 'sz',
      type: 'choice',
      label: L('Aufgabe', 'Problem'),
      options: [
        { value: 'werkstatt', label: L('Werkstatt: Gewinn maximieren', 'Workshop: maximise profit') },
        { value: 'futter', label: L('Futtermischung: Kosten minimieren', 'Feed mix: minimise cost') },
        { value: 'eigen', label: L('Eigene Bedingungen', 'Own constraints') },
      ],
      default: 'werkstatt',
      display: 'menu',
    },
    { key: 'p', type: 'number', label: L('Zielfunktion: Faktor p vor x', 'Objective: coefficient p of x'), min: 0, max: 50, step: 0.5, default: 30 },
    { key: 'q', type: 'number', label: L('Zielfunktion: Faktor q vor y', 'Objective: coefficient q of y'), min: 0, max: 50, step: 0.5, default: 20 },
    {
      key: 'goal',
      type: 'choice',
      label: L('Ziel', 'Goal'),
      options: [
        { value: 'max', label: L('maximieren', 'maximise') },
        { value: 'min', label: L('minimieren', 'minimise') },
      ],
      default: 'max',
      display: 'buttons',
      visibleIf: (v) => v.sz === 'eigen',
    },
    { key: 'a1', type: 'number', label: L('1. Bedingung: a₁', '1st constraint: a₁'), min: 0, max: 5, step: 0.5, default: 1, visibleIf: (v) => v.sz === 'eigen' },
    { key: 'b1', type: 'number', label: L('1. Bedingung: b₁', '1st constraint: b₁'), min: 0, max: 5, step: 0.5, default: 1, visibleIf: (v) => v.sz === 'eigen' },
    { key: 'c1', type: 'number', label: L('1. Bedingung: c₁', '1st constraint: c₁'), min: 1, max: 30, step: 1, default: 9, visibleIf: (v) => v.sz === 'eigen' },
    { key: 'a2', type: 'number', label: L('2. Bedingung: a₂', '2nd constraint: a₂'), min: 0, max: 5, step: 0.5, default: 3, visibleIf: (v) => v.sz === 'eigen' },
    { key: 'b2', type: 'number', label: L('2. Bedingung: b₂', '2nd constraint: b₂'), min: 0, max: 5, step: 0.5, default: 1, visibleIf: (v) => v.sz === 'eigen' },
    { key: 'c2', type: 'number', label: L('2. Bedingung: c₂', '2nd constraint: c₂'), min: 1, max: 30, step: 1, default: 18, visibleIf: (v) => v.sz === 'eigen' },
    { key: 'zl', type: 'number', label: L('Zielgerade verschieben', 'Move the objective line'), min: 0, max: 1, step: 0.01, default: 0.4 },
    { key: 'int', type: 'boolean', label: L('nur ganze Zahlen', 'whole numbers only'), default: false },
    { key: 'sol', type: 'boolean', label: L('Optimum anzeigen', 'Show the optimum'), default: false },
  ],
  hint: () =>
    L(
      'Schiebe die Zielgerade parallel, bis sie das Vieleck gerade noch berührt. Dort liegt das Optimum – fast immer in einer Ecke.',
      'Slide the objective line parallel until it only just touches the polygon. That is where the optimum lies – almost always at a vertex.',
    ),
  readouts: [
    { key: 'nb', label: L('Bedingungen', 'Constraints') },
    { key: 'ziel', label: L('Zielfunktion', 'Objective function') },
    { key: 'z', label: L('Zielgerade', 'Objective line') },
    { key: 'opt', label: L('Optimum', 'Optimum'), spoiler: true },
  ],
  presets: [
    { id: 'werk', label: L('Tische und Stühle', 'Tables and chairs'), values: { sz: 'werkstatt', p: 30, q: 20, zl: 0.4, sol: false, int: false } },
    { id: 'parallel', label: L('Zielgerade parallel zu einer Kante', 'Objective line parallel to an edge'), values: { sz: 'werkstatt', p: 20, q: 10, zl: 0.8, sol: true } },
    { id: 'futter', label: L('Futtermischung', 'Feed mix'), values: { sz: 'futter', p: 3, q: 2, zl: 0.3, sol: false } },
    { id: 'ganz', label: L('Ganzzahlige Lösung', 'Whole-number solution'), values: { sz: 'eigen', a1: 2, b1: 3, c1: 12, a2: 3, b2: 1, c2: 11, p: 4, q: 5, goal: 'max', int: true, sol: true } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem farbigen Planungsvieleck, den Begrenzungsgeraden, der verschiebbaren Zielgeraden und der optimalen Ecke',
      zVal: 'z = {z}',
      opt: 'x = {x}, y = {y}  →  z = {z}',
      optInt: 'ganzzahlig: x = {x}, y = {y}  →  z = {z}',
      tie: ' (ebenso jeder Punkt der Kante)',
      unb: 'kein Maximum – der Bereich ist in dieser Richtung offen',
      empty: 'Die Bedingungen widersprechen sich – kein zulässiger Punkt.',
      wood: 'Holz',
      time: 'Arbeitszeit',
      store: 'Lager',
      prot: 'Eiweiß',
      energy: 'Energie',
      fibre: 'Ballaststoffe',
      k1: '1. Bedingung',
      k2: '2. Bedingung',
      xT: 'x Tische',
      yS: 'y Stühle',
      xA: 'x Sack A',
      yB: 'y Sack B',
    },
    en: {
      canvas: 'Coordinate system with the shaded feasible polygon, the boundary lines, the movable objective line and the optimal vertex',
      zVal: 'z = {z}',
      opt: 'x = {x}, y = {y}  →  z = {z}',
      optInt: 'whole numbers: x = {x}, y = {y}  →  z = {z}',
      tie: ' (as is every point on that edge)',
      unb: 'no maximum – the region is open in this direction',
      empty: 'The constraints contradict each other – no feasible point.',
      wood: 'wood',
      time: 'working time',
      store: 'storage',
      prot: 'protein',
      energy: 'energy',
      fibre: 'fibre',
      k1: '1st constraint',
      k2: '2nd constraint',
      xT: 'x tables',
      yS: 'y chairs',
      xA: 'x bag A',
      yB: 'y bag B',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const n = (v: number, d = 2) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, d);
    const plot = new Plot(surface, { x: [0, M], y: [0, M], equalAspect: false, pan: false, zoom: false, controls: false });

    function setup(): Setup {
      const sz = p.sz as Scenario;
      if (sz === 'werkstatt')
        return {
          cons: [
            { a: 2, b: 1, c: 16 },
            { a: 1, b: 2, c: 14 },
            { a: 0, b: 1, c: 6 },
          ],
          names: [L('Holz', 'wood'), L('Arbeitszeit', 'working time'), L('Lager', 'storage')],
          goal: 'max',
          view: 10,
        };
      if (sz === 'futter')
        return {
          cons: [
            { a: -1, b: -1, c: -6 },
            { a: -2, b: -1, c: -8 },
            { a: -1, b: -3, c: -9 },
          ],
          names: [L('Energie', 'energy'), L('Eiweiß', 'protein'), L('Ballaststoffe', 'fibre')],
          goal: 'min',
          view: M,
        };
      return {
        cons: [
          { a: p.a1, b: p.b1, c: p.c1 },
          { a: p.a2, b: p.b2, c: p.c2 },
        ],
        names: [L('1. Bedingung', '1st constraint'), L('2. Bedingung', '2nd constraint')],
        goal: p.goal as 'max' | 'min',
        view: M,
      };
    }

    /** Ungleichung lesbar: „2x + y ≤ 16“ bzw. bei negativen Koeffizienten „x + y ≥ 6“. */
    function ineq(k: Constraint): string {
      const ge = k.c < 0 || (k.a <= 0 && k.b <= 0 && (k.a < 0 || k.b < 0));
      const s = ge ? -1 : 1;
      const a = s * k.a;
      const b = s * k.b;
      const parts: string[] = [];
      if (a !== 0) parts.push(a === 1 ? 'x' : `${n(a)}x`);
      if (b !== 0) parts.push(b === 1 ? 'y' : `${n(b)}y`);
      return `${parts.join(' + ') || '0'} ${ge ? '≥' : '≤'} ${n(s * k.c)}`;
    }

    function zRange(poly: Pt[]): [number, number] {
      const zs = poly.map((v) => p.p * v[0] + p.q * v[1]);
      return [Math.min(...zs), Math.max(...zs)];
    }

    function updateReadouts(): void {
      const S = setup();
      ctx.readout('nb', [...S.cons.map(ineq), 'x ≥ 0', 'y ≥ 0'].join(';  '));
      ctx.readout('ziel', `z = ${n(p.p)}x + ${n(p.q)}y → ${S.goal}`);
      const poly = feasible(S.cons, M);
      if (!poly.length) {
        ctx.readout('z', null);
        ctx.readout('opt', ctx.t('empty'));
        return;
      }
      const [z0, z1] = zRange(poly);
      ctx.readout('z', tr('zVal', { z: n(z0 + p.zl * (z1 - z0)) }));
      if (p.int) {
        const b = bestLattice(latticePoints(S.cons, M), p.p, p.q, S.goal);
        ctx.readout('opt', b ? tr('optInt', { x: b.point[0], y: b.point[1], z: n(b.z) }) : ctx.t('empty'));
        return;
      }
      const o = optimum(poly, p.p, p.q, S.goal, M)!;
      ctx.readout('opt', o.unbounded ? ctx.t('unb') : tr('opt', { x: n(o.point[0]), y: n(o.point[1]), z: n(o.z) }) + (o.tie ? ctx.t('tie') : ''));
    }

    function draw(): void {
      const th = ctx.theme;
      const S = setup();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const poly = feasible(S.cons, M);
      if (poly.length) plot.polygon(poly, { fill: th.series[2]!, alpha: 0.2 });
      const cols = [th.series[0]!, th.series[3]!, th.series[4]!];
      const placed: Pt[] = [];
      S.cons.forEach((k, i) => {
        const col = cols[i % 3]!;
        if (Math.abs(k.b) > 1e-9) plot.line([0, k.c / k.b], [1, (k.c - k.a) / k.b], { color: col, width: 2 });
        else if (Math.abs(k.a) > 1e-9) plot.line([k.c / k.a, 0], [k.c / k.a, 1], { color: col, width: 2 });
        // Beschriftung an einer sichtbaren Stelle der Geraden
        const V = S.view;
        let lp: Pt | null = null;
        const ts = [0.12, 0.42, 0.72, 0.27, 0.57];
        for (const t of [...ts.slice(i), ...ts.slice(0, i)]) {
          const x = t * V;
          const y = Math.abs(k.b) > 1e-9 ? (k.c - k.a * x) / k.b : NaN;
          const free = placed.every((q) => Math.abs(q[0] - x) > 0.18 * V || Math.abs(q[1] - y) > 0.08 * V);
          if (Number.isFinite(y) && y > 0.4 && y < V - 0.4 && free) {
            lp = [x, y];
            break;
          }
        }
        if (!lp && Math.abs(k.a) > 1e-9 && Math.abs(k.b) < 1e-9) lp = [k.c / k.a, V * 0.85];
        if (lp) placed.push(lp);
        if (lp) plot.text(lp[0], lp[1], S.names[i]![ctx.lang], { size: 12, weight: 'bold', color: col, align: 'left', offset: [6, -10] });
      });
      if (poly.length) {
        const [z0, z1] = zRange(poly);
        const z = z0 + p.zl * (z1 - z0);
        if (Math.abs(p.q) > 1e-9) plot.line([0, z / p.q], [1, (z - p.p) / p.q], { color: th.series[1]!, width: 2.5, dash: [8, 5] });
        else if (Math.abs(p.p) > 1e-9) plot.line([z / p.p, 0], [z / p.p, 1], { color: th.series[1]!, width: 2.5, dash: [8, 5] });
        // Richtung, in der z wächst
        const len = Math.hypot(p.p, p.q);
        if (len > 1e-9) {
          const c: Pt = [S.view * 0.82, S.view * 0.12];
          const dir = S.goal === 'max' ? 1 : -1;
          plot.arrow(c, [c[0] + (dir * p.p * 1.2) / len, c[1] + (dir * p.q * 1.2) / len], { color: th.series[1]!, width: 2 });
        }
        if (p.int) for (const q of latticePoints(S.cons, M)) if (q[0] <= S.view && q[1] <= S.view) plot.point(q[0], q[1], { color: th.muted, radius: 2.5 });
        if (p.sol) {
          if (p.int) {
            const b = bestLattice(latticePoints(S.cons, M), p.p, p.q, S.goal);
            if (b) plot.point(b.point[0], b.point[1], { color: th.series[1]!, radius: 7 });
          } else {
            const o = optimum(poly, p.p, p.q, S.goal, M);
            if (o && !o.unbounded) plot.point(o.point[0], o.point[1], { color: th.series[1]!, radius: 7 });
          }
        }
      }
      plot.end();
    }

    return {
      update(changed, source) {
        // Beim Wechsel der Aufgabe passende Zielfunktion einstellen (nur bei Bedienung, nicht bei geteilten Links)
        if (source === 'input' && changed.has('sz')) {
          if (p.sz === 'werkstatt') ctx.set({ p: 30, q: 20 });
          else if (p.sz === 'futter') ctx.set({ p: 3, q: 2 });
          else ctx.set({ p: 4, q: 5 });
        }
        const S = setup();
        plot.setRangePadded([0, S.view], [0, S.view], { left: 34, right: 14, top: 14, bottom: 24 });
        const sz = p.sz as Scenario;
        plot.setAxes({
          x: { label: sz === 'werkstatt' ? ctx.t('xT') : sz === 'futter' ? ctx.t('xA') : 'x', minStep: 1 },
          y: { label: sz === 'werkstatt' ? ctx.t('yS') : sz === 'futter' ? ctx.t('yB') : 'y', minStep: 1 },
        });
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
