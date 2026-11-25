import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { addVelocities, gamma, interval, lorentz } from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Minkowski-Diagramm mit Lorentz-Transformation eines Ereignisses und
 * relativistische Addition von Geschwindigkeiten.
 */
export default defineSimulation({
  id: 'minkowski',
  layout: { aspect: 1.5, aspectNarrow: 1 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'diagramm', label: L('Minkowski-Diagramm', 'Minkowski diagram') },
        { value: 'addition', label: L('Geschwindigkeiten addieren', 'Adding velocities') },
      ],
      default: 'diagramm',
      display: 'buttons',
    },
    { key: 'beta', type: 'number', label: L('Geschwindigkeit von S′ (in c)', 'Velocity of S′ (in c)'), min: -0.8, max: 0.8, step: 0.05, default: 0.5, visibleIf: (v) => v.mode === 'diagramm' },
    { key: 'ex', type: 'number', label: L('Ereignis: Ort x', 'Event: position x'), min: -3, max: 4.5, step: 0.1, default: 2, visibleIf: (v) => v.mode === 'diagramm' },
    { key: 'et', type: 'number', label: L('Ereignis: Zeit ct', 'Event: time ct'), min: -0.5, max: 4.5, step: 0.1, default: 3, visibleIf: (v) => v.mode === 'diagramm' },
    { key: 'v', type: 'number', label: L('Geschwindigkeit des Zugs v (in c)', 'Speed of the train v (in c)'), min: 0, max: 0.99, step: 0.01, default: 0.6, visibleIf: (v) => v.mode === 'addition' },
    { key: 'u', type: 'number', label: L('Geschwindigkeit im Zug u′ (in c)', 'Speed inside the train u′ (in c)'), min: -0.99, max: 0.99, step: 0.01, default: 0.6, visibleIf: (v) => v.mode === 'addition' },
  ],
  hint: (v) =>
    v.mode === 'addition'
      ? L('Im Zug, der mit v fährt, fliegt eine Rakete mit u′ nach vorn. Wie schnell ist sie vom Bahnsteig aus? Nie schneller als das Licht.', 'Inside a train moving at v, a rocket flies forward at u′. How fast is it seen from the platform? Never faster than light.')
      : L('Die gekippten Achsen gehören zum bewegten System S′. Die gestrichelten Hilfslinien zeigen, welche Koordinaten das Ereignis dort hat.', 'The tilted axes belong to the moving frame S′. The dashed helper lines show the coordinates of the event there.'),
  readouts: [
    { key: 'g', label: L('Lorentz-Faktor', 'Lorentz factor') },
    { key: 'ev', label: L('Ereignis in S′', 'Event in S′'), spoiler: true },
    { key: 's', label: L('Abstand in der Raumzeit', 'Spacetime interval') },
    { key: 'ur', label: L('Geschwindigkeit vom Bahnsteig aus', 'Speed seen from the platform'), spoiler: true },
    { key: 'uk', label: L('Klassisch gerechnet', 'Classical calculation') },
  ],
  presets: [
    { id: 'gleich', label: L('Gleichzeitig in S, nicht in S′', 'Simultaneous in S, not in S′'), values: { mode: 'diagramm', beta: 0.5, ex: 3, et: 0 } },
    { id: 'licht', label: L('Lichtsignal', 'Light signal'), values: { mode: 'diagramm', beta: 0.6, ex: 3, et: 3 } },
    { id: 'add', label: L('0,6c + 0,6c', '0.6c + 0.6c'), values: { mode: 'addition', v: 0.6, u: 0.6 } },
    { id: 'add2', label: L('0,9c + 0,9c', '0.9c + 0.9c'), values: { mode: 'addition', v: 0.9, u: 0.9 } },
  ],
  strings: {
    de: {
      canvasD: 'Minkowski-Diagramm: waagerecht der Ort x, senkrecht die Zeit ct; gekippte Achsen des bewegten Systems, Lichtlinien unter 45° und ein Ereignis mit Hilfslinien zu beiden Achsenpaaren',
      canvasA: 'Diagramm: Geschwindigkeit vom Bahnsteig aus über der Geschwindigkeit im Zug, relativistisch und klassisch, mit der Lichtgeschwindigkeit als Grenze',
      gVal: 'γ = 1/√(1 − β²) ≈ {g}',
      evVal: "x′ ≈ {x}, ct′ ≈ {t}",
      sVal: 's² = (ct)² − x² = {s} (in S und S′ gleich)',
      urVal: 'u = (u′ + v)/(1 + u′v/c²) ≈ {u} c',
      ukVal: 'u′ + v = {u} c{w}',
      wrong: ' – schneller als Licht, falsch!',
      x: 'x',
      ct: 'ct',
      xp: "x′",
      ctp: "ct′",
      E: 'E',
      light: 'Licht',
      upAx: 'u′ in c',
      uAx: 'u in c',
      c: 'c',
      rel: 'relativistisch',
      cls: 'klassisch',
    },
    en: {
      canvasD: 'Minkowski diagram: position x horizontally, time ct vertically; tilted axes of the moving frame, light lines at 45° and an event with helper lines to both pairs of axes',
      canvasA: 'Graph: speed seen from the platform against speed inside the train, relativistic and classical, with the speed of light as the limit',
      gVal: 'γ = 1/√(1 − β²) ≈ {g}',
      evVal: "x′ ≈ {x}, ct′ ≈ {t}",
      sVal: 's² = (ct)² − x² = {s} (the same in S and S′)',
      urVal: 'u = (u′ + v)/(1 + u′v/c²) ≈ {u} c',
      ukVal: 'u′ + v = {u} c{w}',
      wrong: ' – faster than light, wrong!',
      x: 'x',
      ct: 'ct',
      xp: "x′",
      ctp: "ct′",
      E: 'E',
      light: 'light',
      upAx: 'u′ in c',
      uAx: 'u in c',
      c: 'c',
      rel: 'relativistic',
      cls: 'classical',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvasD'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [-3.5, 5],
      y: [-1, 5],
      equalAspect: true,
      pan: false,
      zoom: false,
      controls: false,
    });

    function updateReadouts(): void {
      const show: Record<string, string | null> = {};
      if (p.mode === 'diagramm') {
        const e = lorentz(p.ex, p.et, p.beta);
        show.g = tr('gVal', { g: fmt.num(gamma(p.beta), 3) });
        show.ev = tr('evVal', { x: fmt.num(e.x, 2), t: fmt.num(e.ct, 2) });
        show.s = tr('sVal', { s: fmt.num(interval(p.ex, p.et), 2) });
      } else {
        const sum = p.u + p.v;
        show.ur = tr('urVal', { u: fmt.num(addVelocities(p.u, p.v), 3) });
        show.uk = tr('ukVal', { u: fmt.num(sum, 2), w: Math.abs(sum) > 1 ? ctx.t('wrong') : '' });
      }
      for (const k of ['g', 'ev', 's', 'ur', 'uk']) ctx.readout(k, show[k] ?? null);
    }

    function drawDiagram(): void {
      const th = ctx.theme;
      const b = p.beta;
      const g = gamma(b);
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      // Lichtlinien
      plot.segment([-6, -6], [6, 6], { color: th.series[2]!, width: 1.5, dash: [6, 4] });
      plot.segment([6, -6], [-6, 6], { color: th.series[2]!, width: 1.5, dash: [6, 4] });
      plot.text(4.3, 4.3, ctx.t('light'), { color: th.series[2]!, align: 'right', offset: [-6, 0], size: 12 });
      // Achsen von S′
      const sp = th.series[1]!;
      plot.segment([-6, -6 * b], [6, 6 * b], { color: sp, width: 2 });
      plot.segment([-6 * b, -6], [6 * b, 6], { color: sp, width: 2 });
      for (let k = -4; k <= 6; k++) {
        if (k === 0) continue;
        plot.point(k * g, k * g * b, { color: sp, radius: 2.5 });
        plot.point(k * g * b, k * g, { color: sp, radius: 2.5 });
      }
      const xEnd: [number, number] = [4.8, 4.8 * b];
      const tEnd: [number, number] = [4.8 * b, 4.8];
      plot.text(xEnd[0], xEnd[1], ctx.t('xp'), { color: sp, align: 'right', offset: [-4, -10], size: 14, weight: 'bold' });
      plot.text(tEnd[0], tEnd[1], ctx.t('ctp'), { color: sp, align: 'left', offset: [8, 6], size: 14, weight: 'bold' });
      // Ereignis und Hilfslinien
      const e = lorentz(p.ex, p.et, b);
      const ev: [number, number] = [p.ex, p.et];
      const fx: [number, number] = [e.x * g, e.x * g * b];
      const ft: [number, number] = [e.ct * g * b, e.ct * g];
      plot.segment(ev, fx, { color: sp, width: 1.5, dash: [5, 4] });
      plot.segment(ev, ft, { color: sp, width: 1.5, dash: [5, 4] });
      plot.segment(ev, [p.ex, 0], { color: th.muted, width: 1, dash: [2, 3] });
      plot.segment(ev, [0, p.et], { color: th.muted, width: 1, dash: [2, 3] });
      plot.point(fx[0], fx[1], { color: sp, radius: 4 });
      plot.point(ft[0], ft[1], { color: sp, radius: 4 });
      plot.point(p.ex, p.et, { color: th.series[3]!, radius: 6 });
      plot.text(p.ex, p.et, ctx.t('E'), { color: th.series[3]!, align: 'left', offset: [8, -8], size: 14, weight: 'bold' });
      plot.end();
    }

    function drawAddition(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.hline(1, { color: th.series[2]!, width: 1.5, dash: [6, 4] });
      plot.hline(-1, { color: th.series[2]!, width: 1.5, dash: [6, 4] });
      plot.text(-0.95, 1, ctx.t('c'), { color: th.series[2]!, align: 'left', offset: [0, -10], size: 12 });
      plot.fn((u) => u + p.v, { color: th.muted, width: 1.5, dash: [5, 4], from: -1, to: 1 });
      plot.fn((u) => addVelocities(u, p.v), { color: th.series[1]!, width: 2.5, from: -0.999, to: 0.999 });
      plot.point(p.u, addVelocities(p.u, p.v), { color: th.series[1]!, radius: 5 });
      if (p.u + p.v <= 1.9) plot.point(p.u, p.u + p.v, { color: th.muted, radius: 4 });
      plot.text(0.95, addVelocities(0.95, p.v), ctx.t('rel'), { color: th.series[1]!, align: 'right', offset: [0, 14], size: 12 });
      plot.text(Math.min(0.9, 1.75 - p.v), Math.min(1.75, 0.9 + p.v), ctx.t('cls'), { color: th.muted, align: 'right', offset: [-6, -4], size: 12 });
      plot.end();
    }

    return {
      update() {
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'addition' ? 'canvasA' : 'canvasD'));
        if (p.mode === 'addition') {
          plot.setRangePadded([-1, 1], [-1, 1.9], { left: 34, right: 12, top: 20, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('upAx') }, y: { label: ctx.t('uAx') } });
        } else {
          plot.setRangePadded([-3.5, 5], [-1, 5], { left: 20, right: 12, top: 20, bottom: 20 });
          plot.setAxes({ x: { label: ctx.t('x') }, y: { label: ctx.t('ct') } });
        }
        updateReadouts();
      },
      render() {
        surface.begin();
        plot.resize();
        if (p.mode === 'addition') drawAddition();
        else drawDiagram();
      },
      destroy: () => surface.destroy(),
    };
  },
});
