import { defineSimulation, Surface, View3D, type Vec3 } from '../../../sim-core';
import { criticalKind, FUNCTIONS, section, surfaceMesh, type FnId } from './model';

const L = (de: string, en: string) => ({ de, en });
const R = 2;
const N = 28;

/**
 * Funktionen mit zwei Veränderlichen: Wertefläche z = f(x, y) drehbar in 3D,
 * Schnittkurven mit den Ebenen x = x₀ und y = y₀ und die partiellen
 * Ableitungen als Steigungen der Tangenten an diese Schnittkurven.
 */
export default defineSimulation({
  id: 'funktionen-zwei-variablen',
  layout: { aspect: 1.45, aspectNarrow: 0.95 },
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'paraboloid', label: L('Paraboloid ½(x² + y²)', 'Paraboloid ½(x² + y²)') },
        { value: 'sattel', label: L('Sattel ½(x² − y²)', 'Saddle ½(x² − y²)') },
        { value: 'welle', label: L('Welle sin x · cos y', 'Wave sin x · cos y') },
        { value: 'glocke', label: L('Glocke 2·e^(−(x²+y²)/2)', 'Bell 2·e^(−(x²+y²)/2)') },
        { value: 'ebene', label: L('Ebene 0,5x − 0,3y + 1', 'Plane 0.5x − 0.3y + 1') },
      ],
      default: 'sattel',
      display: 'menu',
    },
    { key: 'x0', type: 'number', label: L('Punkt: x₀', 'Point: x₀'), min: -2, max: 2, step: 0.1, default: 1 },
    { key: 'y0', type: 'number', label: L('Punkt: y₀', 'Point: y₀'), min: -2, max: 2, step: 0.1, default: 0.5 },
    {
      key: 'cut',
      type: 'choice',
      label: L('Schnitt', 'Section'),
      options: [
        { value: 'beide', label: L('beide', 'both') },
        { value: 'x', label: L('y = y₀', 'y = y₀') },
        { value: 'y', label: L('x = x₀', 'x = x₀') },
        { value: 'keine', label: L('keiner', 'none') },
      ],
      default: 'beide',
      display: 'buttons',
    },
    { key: 'tan', type: 'boolean', label: L('Tangenten (partielle Ableitungen)', 'Tangents (partial derivatives)'), default: true },
  ],
  hint: () =>
    L(
      'Ziehe den Punkt über die Fläche oder drehe das Bild. Die Steigung der Tangente in x-Richtung ist fₓ, in y-Richtung f_y.',
      'Drag the point across the surface or turn the view. The slope of the tangent in the x-direction is fₓ, in the y-direction f_y.',
    ),
  readouts: [
    { key: 'term', label: L('Funktion', 'Function') },
    { key: 'pt', label: L('Punkt auf der Fläche', 'Point on the surface') },
    { key: 'fx', label: L('Partielle Ableitung nach x', 'Partial derivative with respect to x'), spoiler: true },
    { key: 'fy', label: L('Partielle Ableitung nach y', 'Partial derivative with respect to y'), spoiler: true },
    { key: 'crit', label: L('Besonderer Punkt', 'Special point') },
  ],
  presets: [
    { id: 'sattel', label: L('Sattelpunkt', 'Saddle point'), values: { fn: 'sattel', x0: 0, y0: 0, cut: 'beide', tan: true } },
    { id: 'tief', label: L('Tiefpunkt', 'Minimum'), values: { fn: 'paraboloid', x0: 0, y0: 0, cut: 'beide', tan: true } },
    { id: 'welle', label: L('Welle', 'Wave'), values: { fn: 'welle', x0: 0.5, y0: 1, cut: 'x', tan: true } },
    { id: 'ebene', label: L('Ebene: überall gleiche Steigung', 'Plane: the same slope everywhere'), values: { fn: 'ebene', x0: 1, y0: -1, cut: 'beide', tan: true } },
  ],
  strings: {
    de: {
      canvas: 'Drehbare Wertefläche einer Funktion mit zwei Veränderlichen, mit Schnittkurven und Tangenten im gewählten Punkt',
      pt: 'P({x} | {y} | {z})',
      slope: '{t}  →  {v} im Punkt P',
      max: 'Hochpunkt: beide partiellen Ableitungen sind 0',
      min: 'Tiefpunkt: beide partiellen Ableitungen sind 0',
      sattel: 'Sattelpunkt: in x-Richtung Tiefpunkt, in y-Richtung Hochpunkt',
      unklar: 'Beide partiellen Ableitungen sind 0',
      none: 'kein waagerechter Punkt (Gradient ≠ 0)',
    },
    en: {
      canvas: 'Rotatable surface of a function of two variables, with section curves and tangents at the chosen point',
      pt: 'P({x} | {y} | {z})',
      slope: '{t}  →  {v} at the point P',
      max: 'Maximum: both partial derivatives are 0',
      min: 'Minimum: both partial derivatives are 0',
      sattel: 'Saddle point: a minimum in the x-direction, a maximum in the y-direction',
      unklar: 'Both partial derivatives are 0',
      none: 'not a horizontal point (gradient ≠ 0)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const n = (v: number, d = 2) => fmt.num(Math.abs(v) < 1e-9 ? 0 : v, d);
    const id = () => p.fn as FnId;
    const F = () => FUNCTIONS[id()];
    const view = new View3D(surface, { azimuth: -55, elevation: 26, radius: 3.4, zoom: true });

    let mesh = surfaceMesh('sattel', R, N);
    let meshKey = '';
    let zr: [number, number] = [-2, 2];
    function rebuild(): void {
      if (meshKey === id()) return;
      meshKey = id();
      mesh = surfaceMesh(id(), R, N);
      const zs = mesh.vertices.map((v) => v[2]);
      zr = [Math.min(...zs, 0), Math.max(...zs, 0)];
      view.setScene({ target: [0, 0, (zr[0] + zr[1]) / 2], radius: Math.max(3.2, (zr[1] - zr[0]) * 0.9) });
    }

    view.addHandle({
      get: () => [p.x0, p.y0, F().f(p.x0, p.y0)] as Vec3,
      set: (q) => ctx.set({ x0: Math.max(-R, Math.min(R, Math.round(q[0] * 10) / 10)), y0: Math.max(-R, Math.min(R, Math.round(q[1] * 10) / 10)) }),
      enabled: () => !ctx.locked,
      color: () => ctx.theme.series[1]!,
    });

    function updateReadouts(): void {
      const fn = F();
      const z = fn.f(p.x0, p.y0);
      ctx.readout('term', fn.term);
      ctx.readout('pt', tr('pt', { x: n(p.x0, 1), y: n(p.y0, 1), z: n(z) }));
      ctx.readout('fx', tr('slope', { t: fn.fxTerm, v: n(fn.fx(p.x0, p.y0)) }));
      ctx.readout('fy', tr('slope', { t: fn.fyTerm, v: n(fn.fy(p.x0, p.y0)) }));
      const k = criticalKind(id(), p.x0, p.y0);
      ctx.readout('crit', ctx.t(k ?? 'none'));
    }

    function render(): void {
      const th = ctx.theme;
      surface.begin();
      view.resize();
      view.begin();
      view.axes({ min: [-R - 0.3, -R - 0.3, Math.min(zr[0], 0) - 0.2], max: [R + 0.6, R + 0.6, zr[1] + 0.6], labels: ['x', 'y', 'z'], ticks: 1 });
      view.mesh(mesh, { color: th.series[0]!, alpha: 0.72, edgeColor: th.series[0]!, edgeWidth: 0.6, edgeAngle: 0, cull: false, gloss: 0.2 });
      const fn = F();
      const z0 = fn.f(p.x0, p.y0);
      const P: Vec3 = [p.x0, p.y0, z0];
      const cuts: ('x' | 'y')[] = p.cut === 'beide' ? ['x', 'y'] : p.cut === 'x' ? ['x'] : p.cut === 'y' ? ['y'] : [];
      for (const dir of cuts) {
        const col = dir === 'x' ? th.series[3]! : th.series[2]!;
        const c = dir === 'x' ? p.y0 : p.x0;
        const lo = Math.min(zr[0], 0) - 0.2;
        const hi = zr[1] + 0.3;
        const plane: Vec3[] =
          dir === 'x'
            ? [
                [-R, c, lo],
                [R, c, lo],
                [R, c, hi],
                [-R, c, hi],
              ]
            : [
                [c, -R, lo],
                [c, R, lo],
                [c, R, hi],
                [c, -R, hi],
              ];
        view.face(plane, { color: col, alpha: 0.1, flat: true, cull: false });
        view.polyline(section(id(), dir, c, R), { color: col, width: 3.2, depthBias: 0.02 });
        if (p.tan) {
          const s = dir === 'x' ? fn.fx(p.x0, p.y0) : fn.fy(p.x0, p.y0);
          const d = 0.9;
          const a: Vec3 = dir === 'x' ? [p.x0 - d, p.y0, z0 - s * d] : [p.x0, p.y0 - d, z0 - s * d];
          const b: Vec3 = dir === 'x' ? [p.x0 + d, p.y0, z0 + s * d] : [p.x0, p.y0 + d, z0 + s * d];
          view.segment(a, b, { color: col, width: 2.5, dash: [6, 4], depthBias: 0.05 });
        }
      }
      // Lot vom Punkt auf die x-y-Ebene
      view.segment([p.x0, p.y0, 0], P, { color: th.muted, width: 1.2, dash: [3, 3] });
      view.point([p.x0, p.y0, 0], { color: th.muted, radius: 3 });
      view.end();
    }

    return {
      update() {
        rebuild();
        updateReadouts();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
