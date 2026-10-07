import { defineSimulation, Plot, radToDeg, Surface, term } from '../../../sim-core';
import { lineRelation } from './model';

const L = (de: string, en: string) => ({ de, en });

/**
 * Lineare Funktion f(x) = m·x + b
 *
 * Ziehbare Punkte: y-Achsenabschnitt (ändert b) und Spitze des
 * Steigungsdreiecks (ändert m). Optional eine zweite Gerade g zum Vergleich
 * (parallel, senkrecht, Schnittpunkt).
 */
export default defineSimulation({
  id: 'lineare-funktion',
  dragHint: true,
  groups: [
    { id: 'g', label: L('Zweite Gerade g', 'Second line g') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'm', type: 'number', label: L('Steigung m', 'Slope m'), min: -5, max: 5, step: 0.1, default: 0.5 },
    { key: 'b', type: 'number', label: L('y-Achsenabschnitt b', 'y-intercept b'), min: -8, max: 8, step: 0.1, default: 1 },
    { key: 'second', type: 'boolean', group: 'g', label: L('Zweite Gerade g(x) = m₂x + b₂', 'Second line g(x) = m₂x + b₂'), default: false },
    {
      key: 'm2',
      type: 'number',
      group: 'g',
      label: L('Steigung m₂', 'Slope m₂'),
      min: -5,
      max: 5,
      step: 0.1,
      default: -2,
      visibleIf: (v) => v.second === true,
    },
    {
      key: 'b2',
      type: 'number',
      group: 'g',
      label: L('y-Achsenabschnitt b₂', 'y-intercept b₂'),
      min: -8,
      max: 8,
      step: 0.1,
      default: 3,
      visibleIf: (v) => v.second === true,
    },
    { key: 'triangle', type: 'boolean', group: 'view', label: L('Steigungsdreieck', 'Slope triangle'), default: true },
    { key: 'zero', type: 'boolean', group: 'view', label: L('Nullstelle', 'Zero (x-intercept)'), default: true },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  readouts: [
    { key: 'f', label: L('Funktionsgleichung', 'Equation'), spoiler: true },
    { key: 'course', label: L('Verlauf', 'Behaviour') },
    { key: 'angle', label: L('Steigungswinkel', 'Angle of inclination'), spoiler: true },
    { key: 'zero', label: L('Nullstelle', 'Zero'), spoiler: true },
    { key: 'g', label: L('Zweite Gerade', 'Second line'), spoiler: true },
    { key: 'relation', label: L('Lage der Geraden', 'Relative position'), spoiler: true },
  ],
  presets: [
    { id: 'origin', label: L('Ursprungsgerade', 'Line through origin'), values: { m: 1, b: 0 } },
    { id: 'falling', label: L('Fallende Gerade', 'Decreasing line'), values: { m: -2, b: 3 } },
    { id: 'constant', label: L('Konstante Funktion', 'Constant function'), values: { m: 0, b: 2 } },
    { id: 'parallel', label: L('Parallele Geraden', 'Parallel lines'), values: { m: 0.5, b: 1, second: true, m2: 0.5, b2: -2 } },
    { id: 'perpendicular', label: L('Senkrechte Geraden', 'Perpendicular lines'), values: { m: 2, b: -1, second: true, m2: -0.5, b2: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Koordinatensystem mit dem Graphen der linearen Funktion',
      rising: 'steigend (m > 0)',
      falling: 'fallend (m < 0)',
      constant: 'konstant (m = 0), parallel zur x-Achse',
      none: 'keine – die Gerade ist parallel zur x-Achse',
      everywhere: 'unendlich viele – der Graph liegt auf der x-Achse',
      identical: 'identisch (gleiche Steigung und gleicher y-Achsenabschnitt)',
      parallel: 'parallel – kein Schnittpunkt (gleiche Steigung)',
      perpendicular: 'senkrecht zueinander (m · m₂ = −1), Schnittpunkt',
      intersect: 'Schnittpunkt',
    },
    en: {
      canvas: 'Coordinate system with the graph of the linear function',
      rising: 'increasing (m > 0)',
      falling: 'decreasing (m < 0)',
      constant: 'constant (m = 0), parallel to the x-axis',
      none: 'none – the line is parallel to the x-axis',
      everywhere: 'infinitely many – the graph lies on the x-axis',
      identical: 'identical (same slope and same y-intercept)',
      parallel: 'parallel – no intersection (same slope)',
      perpendicular: 'perpendicular (m · m₂ = −1), intersection',
      intersect: 'Intersection',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const plot = new Plot(surface, { x: [-10, 10], y: [-7, 7] });
    const p = ctx.params;
    const color = {
      f: () => ctx.theme.series[0]!,
      g: () => ctx.theme.series[1]!,
      triangle: () => ctx.theme.series[2]!,
      zero: () => ctx.theme.series[3]!,
    };
    const editable = () => !ctx.locked;

    plot.addHandle({ get: () => [0, p.b], set: (_x, y) => ctx.set({ b: y }), axis: 'y', enabled: editable, color: color.f });
    plot.addHandle({ get: () => [1, p.b + p.m], set: (_x, y) => ctx.set({ m: y - p.b }), axis: 'y', enabled: editable, color: color.triangle });
    plot.addHandle({
      get: () => [0, p.b2],
      set: (_x, y) => ctx.set({ b2: y }),
      axis: 'y',
      enabled: () => editable() && p.second,
      color: color.g,
    });
    plot.addHandle({
      get: () => [1, p.b2 + p.m2],
      set: (_x, y) => ctx.set({ m2: y - p.b2 }),
      axis: 'y',
      enabled: () => editable() && p.second,
      color: color.g,
    });

    const fmt = ctx.fmt;
    const lineTerm = (name: string, m: number, b: number) =>
      term.fnDef(name, term.sum([{ coef: m, body: term.x }, { coef: b, body: '' }], fmt));

    /** Position für die Beschriftung einer Geraden am Rand des sichtbaren Bereichs. */
    function labelPosition(m: number, b: number): [number, number] {
      const { xMin, xMax, yMin, yMax } = plot.bounds;
      const margin = 34 / plot.scale.x;
      let x = xMax - margin;
      let y = m * x + b;
      const top = yMax - 24 / plot.scale.y;
      const bottom = yMin + 24 / plot.scale.y;
      if (y > top && m !== 0) x = (top - b) / m;
      else if (y < bottom && m !== 0) x = (bottom - b) / m;
      x = Math.max(xMin + margin, Math.min(xMax - margin, x));
      y = m * x + b;
      return [x, y];
    }

    return {
      update() {
        ctx.readout('f', { html: lineTerm('f', p.m, p.b) });
        ctx.readout('course', p.m > 0 ? ctx.t('rising') : p.m < 0 ? ctx.t('falling') : ctx.t('constant'));
        ctx.readout('angle', `α ≈ ${fmt.num(radToDeg(Math.atan(p.m)), 1)}°`);

        if (p.m !== 0) {
          const x0 = -p.b / p.m;
          ctx.readout('zero', { html: `${term.v('x')}<sub>0</sub> = ${fmt.num(x0)} &nbsp;→&nbsp; N${fmt.point(x0, 0)}` });
        } else {
          ctx.readout('zero', p.b === 0 ? ctx.t('everywhere') : ctx.t('none'));
        }

        if (p.second) {
          ctx.readout('g', { html: lineTerm('g', p.m2, p.b2) });
          const rel = lineRelation(p.m, p.b, p.m2, p.b2);
          if (rel.kind === 'identical') ctx.readout('relation', ctx.t('identical'));
          else if (rel.kind === 'parallel') ctx.readout('relation', ctx.t('parallel'));
          else {
            const label = rel.perpendicular ? ctx.t('perpendicular') : ctx.t('intersect');
            ctx.readout('relation', `${label} S${fmt.point(rel.x, rel.y)}`);
          }
        } else {
          ctx.readout('g', null);
          ctx.readout('relation', null);
        }
      },

      render() {
        surface.begin();
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        const f = (x: number) => p.m * x + p.b;
        const muted = ctx.theme.muted;

        if (p.second) {
          plot.line([0, p.b2], [1, p.b2 + p.m2], { color: color.g(), width: 2.5 });
          const [lx, ly] = labelPosition(p.m2, p.b2);
          plot.text(lx, ly, 'g', { color: color.g(), math: true, size: 18, offset: [6, -8] });
        }

        plot.line([0, p.b], [1, p.b + p.m], { color: color.f(), width: 3 });
        const [lx, ly] = labelPosition(p.m, p.b);
        plot.text(lx, ly, 'f', { color: color.f(), math: true, size: 18, offset: [6, -8] });

        if (p.triangle) {
          const c = color.triangle();
          plot.polygon(
            [
              [0, f(0)],
              [1, f(0)],
              [1, f(1)],
            ],
            { fill: c, alpha: 0.14 },
          );
          plot.segment([0, f(0)], [1, f(0)], { color: c, width: 2 });
          plot.segment([1, f(0)], [1, f(1)], { color: c, width: 2 });
          const below = p.m >= 0;
          plot.text(0.5, f(0), '1', { color: c, align: 'center', baseline: below ? 'top' : 'bottom', offset: [0, below ? 5 : -5], weight: '600' });
          plot.text(1, (f(0) + f(1)) / 2, `m = ${fmt.num(p.m, 1)}`, { color: c, baseline: 'middle', offset: [8, 0], weight: '600' });
          plot.point(1, f(1), { color: c, radius: 5 });
        }

        if (p.second) {
          const rel = lineRelation(p.m, p.b, p.m2, p.b2);
          if (rel.kind === 'intersect') {
            plot.point(rel.x, rel.y, { color: ctx.theme.text, radius: 5 });
            plot.text(rel.x, rel.y, 'S', { math: true, size: 16, offset: [8, -8] });
          }
          plot.point(0, p.b2, { color: color.g(), radius: 5 });
          plot.point(1, p.b2 + p.m2, { color: color.g(), radius: 4, hollow: true });
        }

        if (p.zero && p.m !== 0) {
          const x0 = -p.b / p.m;
          plot.point(x0, 0, { color: color.zero(), radius: 5 });
          // Beschriftung auf die Seite, auf der die Gerade nicht verläuft
          const right = p.m < 0;
          plot.text(x0, 0, 'N', { color: color.zero(), math: true, size: 16, align: right ? 'left' : 'right', offset: [right ? 8 : -8, -9] });
        }

        plot.point(0, p.b, { color: color.f(), radius: 6 });
        plot.text(0, p.b, `b = ${fmt.num(p.b, 1)}`, { color: muted, offset: [-10, -10], align: 'right', size: 13 });
        plot.end();
      },

      resetView: () => plot.resetView(),
      destroy: () => surface.destroy(),
    };
  },
});
