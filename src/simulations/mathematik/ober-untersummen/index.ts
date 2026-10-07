import { defineSimulation, ease, Plot, roundRect, Surface, Tween } from '../../../sim-core';
import { exactIntegral, FUNCTIONS, strips, sumOf, type FunctionId, type Strip, type SumKind } from './model';

const L = (de: string, en: string) => ({ de, en });
const VIEW: Record<FunctionId, { x: [number, number]; y: [number, number] }> = {
  x2: { x: [-0.6, 3.2], y: [-0.8, 9.5] },
  sqrt: { x: [-0.5, 9.5], y: [-0.6, 3.6] },
  sin: { x: [-0.6, 6.9], y: [-1.5, 1.5] },
  cubic: { x: [-3.4, 3.4], y: [-4.2, 4.2] },
  exp: { x: [-3.2, 3.6], y: [-0.5, 6.5] },
};
const START: Record<FunctionId, [number, number]> = { x2: [0, 2], sqrt: [0, 9], sin: [0, 6.28], cubic: [-2, 3], exp: [-2, 3] };

/**
 * Integral als Flächenbilanz: Die Fläche zwischen Graph und x-Achse wird durch
 * Rechtecke (Unter-, Ober-, Links-, Rechts-, Mittelsumme) oder Trapeze
 * angenähert. Mit wachsendem n nähern sich die Summen dem Integral.
 */
export default defineSimulation({
  id: 'ober-untersummen',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'x2', label: L('f(x) = x²', 'f(x) = x²') },
        { value: 'sqrt', label: L('f(x) = √x', 'f(x) = √x') },
        { value: 'sin', label: L('f(x) = sin x', 'f(x) = sin x') },
        { value: 'cubic', label: L('f(x) = 0,5x³ − 2x', 'f(x) = 0.5x³ − 2x') },
        { value: 'exp', label: L('f(x) = e^(x/2)', 'f(x) = e^(x/2)') },
      ],
      default: 'x2',
    },
    { key: 'a', type: 'number', label: L('Untere Grenze a', 'Lower limit a'), min: -5, max: 9, step: 0.05, default: 0 },
    { key: 'b', type: 'number', label: L('Obere Grenze b', 'Upper limit b'), min: -5, max: 9, step: 0.05, default: 2 },
    { key: 'n', type: 'number', label: L('Anzahl der Streifen n', 'Number of strips n'), min: 1, max: 128, step: 1, default: 4 },
    {
      key: 'kind',
      type: 'choice',
      label: L('Art der Summe', 'Type of sum'),
      options: [
        { value: 'both', label: L('Unter- und Obersumme', 'Lower and upper sum') },
        { value: 'lower', label: L('Untersumme', 'Lower sum') },
        { value: 'upper', label: L('Obersumme', 'Upper sum') },
        { value: 'left', label: L('Linkssumme', 'Left sum') },
        { value: 'right', label: L('Rechtssumme', 'Right sum') },
        { value: 'mid', label: L('Mittelsumme', 'Midpoint sum') },
        { value: 'trapez', label: L('Trapezsumme', 'Trapezoidal sum') },
      ],
      default: 'both',
    },
    { key: 'area', type: 'boolean', group: 'view', label: L('Exakte Fläche einfärben', 'Shade the exact area'), default: false },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'double', label: L('n verdoppeln', 'Double n'), primary: true },
    { id: 'halve', label: L('n halbieren', 'Halve n') },
  ],
  readouts: [
    { key: 'sum', label: L('Summe', 'Sum') },
    { key: 'exact', label: L('Integral (exakt)', 'Integral (exact)'), spoiler: true },
    { key: 'table', label: L('Annäherung für wachsendes n', 'Approximation as n grows') },
  ],
  presets: [
    { id: 'start', label: L('x² von 0 bis 2', 'x² from 0 to 2'), values: {} },
    { id: 'fine', label: L('64 Streifen', '64 strips'), values: { n: 64 } },
    { id: 'sine', label: L('sin x: Flächenbilanz', 'sin x: signed area'), values: { fn: 'sin', a: 0, b: 6.3, kind: 'mid', n: 12 } },
    { id: 'cubic', label: L('Fläche unter der x-Achse', 'Area below the x-axis'), values: { fn: 'cubic', a: -2, b: 3, kind: 'mid', n: 10 } },
    { id: 'trapez', label: L('Trapezsumme', 'Trapezoidal sum'), values: { fn: 'sqrt', a: 0, b: 9, kind: 'trapez', n: 6 } },
  ],
  strings: {
    de: {
      canvas: 'Graph einer Funktion mit Rechtecken bzw. Trapezen zwischen Graph und x-Achse',
      lower: 'Untersumme',
      upper: 'Obersumme',
      left: 'Linkssumme',
      right: 'Rechtssumme',
      mid: 'Mittelsumme',
      trapez: 'Trapezsumme',
      diff: 'Differenz',
      sumText: '{name} mit n = {n}: {v}',
    },
    en: {
      canvas: 'Graph of a function with rectangles or trapezoids between the graph and the x-axis',
      lower: 'Lower sum',
      upper: 'Upper sum',
      left: 'Left sum',
      right: 'Right sum',
      mid: 'Midpoint sum',
      trapez: 'Trapezoidal sum',
      diff: 'Difference',
      sumText: '{name} with n = {n}: {v}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const plot = new Plot(surface, { x: VIEW.x2.x, y: VIEW.x2.y, equalAspect: false });
    const def = () => FUNCTIONS[p.fn as FunctionId];
    const lo = () => Math.min(p.a, p.b);
    const hi = () => Math.max(p.a, p.b);
    const clampToDomain = (x: number) => Math.min(def().domain[1], Math.max(def().domain[0], x));

    // Übergang beim Ändern von n: neue Streifen wachsen aus den alten heraus
    const split = new Tween(700, ease.outCubic);
    let previous: Strip[] = [];
    let previousKind = '';

    function kinds(): SumKind[] {
      return p.kind === 'both' ? ['upper', 'lower'] : [p.kind as SumKind];
    }

    function heightBefore(list: Strip[], x: number, fallback: number): number {
      const s = list.find((q) => x >= q.x0 - 1e-12 && x <= q.x1 + 1e-12);
      return s ? (s.h0 + s.h1) / 2 : fallback;
    }

    function updateReadouts(): void {
      const f = def().f;
      const a = lo();
      const b = hi();
      const values = kinds().map((k) => [k, sumOf(strips(f, a, b, p.n, k))] as const);
      if (p.kind === 'both') {
        const up = values[0]![1];
        const low = values[1]![1];
        ctx.readout('sum', { html: `<var>U</var><sub>${p.n}</sub> ≈ ${fmt.num(low, 4)} · <var>O</var><sub>${p.n}</sub> ≈ ${fmt.num(up, 4)} · ${ctx.t('diff')} ≈ ${fmt.num(up - low, 4)}` });
      } else {
        ctx.readout('sum', ctx.t('sumText').replace('{name}', ctx.t(p.kind)).replace('{n}', String(p.n)).replace('{v}', fmt.num(values[0]![1], 4)));
      }
      const exact = exactIntegral(def(), a, b);
      ctx.readout('exact', { html: `∫<sub>${fmt.num(a, 2)}</sub><sup>${fmt.num(b, 2)}</sup> <var>f</var>(<var>x</var>) d<var>x</var> ≈ <strong>${fmt.num(exact, 4)}</strong>` });
      const kind = p.kind === 'both' ? (['lower', 'upper'] as SumKind[]) : [p.kind as SumKind];
      const rows = [4, 8, 16, 32, 64, 128]
        .map((n) => `<tr${n === p.n ? ' class="is-current"' : ''}><td>${n}</td>${kind.map((k) => `<td>${fmt.num(sumOf(strips(f, a, b, n, k)), 4)}</td>`).join('')}</tr>`)
        .join('');
      const head = kind.map((k) => `<th>${ctx.t(k)}</th>`).join('');
      ctx.readout('table', { html: `<table class="mini-table"><tr><th><var>n</var></th>${head}</tr>${rows}</table>` });
    }

    // Grenzen auf der x-Achse ziehen
    const editable = () => !ctx.locked;
    plot.addHandle({ get: () => [p.a, 0], set: (x) => ctx.set({ a: clampToDomain(x) }), axis: 'x', enabled: editable, color: () => ctx.theme.series[4]! });
    plot.addHandle({ get: () => [p.b, 0], set: (x) => ctx.set({ b: clampToDomain(x) }), axis: 'x', enabled: editable, color: () => ctx.theme.series[4]! });

    function snapshot(): void {
      previous = strips(def().f, lo(), hi(), p.n, kinds()[0]!);
      previousKind = String(p.kind);
    }

    return {
      update(changed, source) {
        if (changed.has('fn')) {
          const v = VIEW[p.fn as FunctionId];
          plot.setRange(v.x, v.y);
          if (source === 'input') {
            const [a, b] = START[p.fn as FunctionId];
            ctx.set({ a, b });
          }
        }
        if (!changed.has('n')) snapshot();
        updateReadouts();
      },

      action(id) {
        snapshot();
        const n = id === 'double' ? Math.min(128, p.n * 2) : Math.max(1, Math.floor(p.n / 2));
        split.play();
        ctx.set({ n });
      },

      resetView() {
        const v = VIEW[p.fn as FunctionId];
        plot.setRange(v.x, v.y);
      },

      render() {
        const theme = ctx.theme;
        const f = def().f;
        const a = lo();
        const b = hi();
        const [d0, d1] = def().domain;
        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();
        if (p.area) {
          plot.fillBetween(f, () => 0, a, b, { fill: theme.series[2], alpha: 0.28 });
        }
        const t = split.value;
        const anim = split.running && previousKind === String(p.kind);
        kinds().forEach((kind) => {
          const list = strips(f, a, b, p.n, kind);
          const outline = kind === 'upper' && p.kind === 'both';
          for (const s of list) {
            let h0 = s.h0;
            let h1 = s.h1;
            if (anim) {
              const before = heightBefore(previous, (s.x0 + s.x1) / 2, h0);
              h0 = before + (h0 - before) * t;
              h1 = before + (h1 - before) * t;
            }
            const positive = (h0 + h1) / 2 >= 0;
            const color = positive ? theme.series[0]! : theme.series[1]!;
            const pts: [number, number][] = [
              [s.x0, 0],
              [s.x0, h0],
              [s.x1, h1],
              [s.x1, 0],
            ];
            plot.polygon(pts, { fill: color, alpha: outline ? 0.12 : 0.32, stroke: color, width: p.n > 64 ? 0.6 : 1.4 });
            if (kind === 'mid' && p.n <= 32) plot.point((s.x0 + s.x1) / 2, f((s.x0 + s.x1) / 2), { color: theme.series[3], radius: 3 });
          }
        });
        plot.fn(f, { color: theme.text, width: 3, from: d0, to: d1 });
        // Grenzen
        for (const [x, name] of [
          [p.a, 'a'],
          [p.b, 'b'],
        ] as const) {
          plot.vline(x, { color: theme.series[4], width: 1.5, dash: [5, 4] });
          plot.text(x, 0, name, { color: theme.series[4], math: true, size: 16, weight: 'bold', offset: [0, 22] });
        }
        const r = plot.rect;
        const label = `f(x) = ${ctx.lang === 'de' ? def().term : def().term.replace(',', '.')}`;
        const g = surface.g;
        g.font = `700 15px ${theme.font}`;
        g.fillStyle = theme.dark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.9)';
        roundRect(g, r.x + 8, r.y + 8, g.measureText(label).width + 18, 28, 8);
        g.fill();
        plot.textPx(r.x + 17, r.y + 22, label, { color: theme.text, size: 15, weight: 'bold', align: 'left', halo: false });
        plot.end();
        if (split.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
