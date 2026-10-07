import { clamp, defineSimulation, ease, Plot, roundRect, Surface, Tween } from '../../../sim-core';
import { differenceQuotient, FUNCTIONS, type FunctionId } from './model';

const L = (de: string, en: string) => ({ de, en });
const H_MIN = 0.001;
const RANGES: Record<FunctionId, { x: [number, number]; y: [number, number]; x0: [number, number] }> = {
  x2: { x: [-3.5, 3.5], y: [-1.5, 9], x0: [-3, 3] },
  cubic: { x: [-4, 4], y: [-3.2, 3.2], x0: [-3.5, 3.5] },
  sin: { x: [-1, 7.3], y: [-1.8, 1.8], x0: [-0.8, 7] },
  exp: { x: [-3, 2.6], y: [-0.8, 7.5], x0: [-2.8, 2] },
};

/**
 * Von der Sekante zur Tangente: Der Differenzenquotient
 * (f(x₀ + h) − f(x₀)) / h ist die Steigung der Sekante durch P und Q. Für
 * h → 0 wird aus der Sekante die Tangente in P.
 */
export default defineSimulation({
  id: 'sekante-tangente',
  dragHint: true,
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'fn',
      type: 'choice',
      label: L('Funktion', 'Function'),
      options: [
        { value: 'x2', label: L('f(x) = x²', 'f(x) = x²') },
        { value: 'cubic', label: L('f(x) = 0,25x³ − x', 'f(x) = 0.25x³ − x') },
        { value: 'sin', label: L('f(x) = sin x', 'f(x) = sin x') },
        { value: 'exp', label: L('f(x) = eˣ', 'f(x) = eˣ') },
      ],
      default: 'x2',
    },
    { key: 'x0', type: 'number', label: L('Stelle x₀', 'Point x₀'), min: -3.5, max: 7, step: 0.01, default: 1 },
    { key: 'h', type: 'number', label: L('Abstand h', 'Distance h'), min: -3, max: 3, step: 0.001, default: 1.5 },
    { key: 'triangle', type: 'boolean', group: 'view', label: L('Steigungsdreieck', 'Slope triangle'), default: true },
    { key: 'tangent', type: 'boolean', group: 'view', label: L('Tangente einzeichnen', 'Show tangent'), default: false },
    { key: 'trace', type: 'boolean', group: 'view', label: L('Ableitungsgraph f′ entstehen lassen', 'Trace the derivative f′'), default: false },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Gitternetz', 'Grid'), default: true },
  ],
  actions: [
    { id: 'limit', label: L('h → 0', 'h → 0'), primary: true },
    { id: 'back', label: L('h zurücksetzen', 'Reset h') },
  ],
  readouts: [
    { key: 'dq', label: L('Differenzenquotient (Sekantensteigung)', 'Difference quotient (secant slope)') },
    { key: 'table', label: L('Annäherung für kleiner werdendes h', 'Approximation as h gets smaller') },
    { key: 'tangent', label: L('Tangentensteigung f′(x₀)', 'Tangent slope f′(x₀)'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Parabel', 'Parabola'), values: {} },
    { id: 'negative', label: L('h negativ', 'Negative h'), values: { h: -1.5 } },
    { id: 'cubic', label: L('Kubische Funktion', 'Cubic function'), values: { fn: 'cubic', x0: -1, h: 2 } },
    { id: 'sine', label: L('Sinus mit Ableitungsgraph', 'Sine with derivative'), values: { fn: 'sin', x0: 0.5, h: 1, trace: true } },
    { id: 'exp', label: L('e-Funktion', 'Exponential function'), values: { fn: 'exp', x0: 0, h: 1.2, tangent: true } },
  ],
  strings: {
    de: {
      canvas: 'Graph einer Funktion mit Sekante durch die Punkte P und Q und der Tangente in P',
      secant: 'Sekante',
      tangent: 'Tangente',
      zero: 'h = 0: Der Differenzenquotient ist nicht definiert – gezeichnet ist die Tangente.',
      derivative: 'Ableitung',
    },
    en: {
      canvas: 'Graph of a function with the secant through P and Q and the tangent at P',
      secant: 'Secant',
      tangent: 'Tangent',
      zero: 'h = 0: the difference quotient is undefined – the tangent is shown.',
      derivative: 'Derivative',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const fn = () => FUNCTIONS[p.fn as FunctionId];
    const range = () => RANGES[p.fn as FunctionId];
    const plot = new Plot(surface, { x: RANGES.x2.x, y: RANGES.x2.y });
    const color = {
      f: () => ctx.theme.series[0]!,
      secant: () => ctx.theme.series[3]!,
      tangent: () => ctx.theme.series[2]!,
      q: () => ctx.theme.series[1]!,
      derivative: () => ctx.theme.series[4]!,
    };
    const editable = () => !ctx.locked && !limit.running;

    // Animation h → 0 (logarithmisch, damit man das Annähern sieht)
    const limit = new Tween(2600, ease.inOutCubic);
    let hFrom = 1;
    let hTo = 1;
    let animating = false;
    const hNow = (): number => {
      if (!animating) return p.h;
      const t = limit.value;
      const sign = Math.sign(hFrom) || 1;
      return sign * Math.abs(hFrom) * (Math.abs(hTo) / Math.abs(hFrom)) ** t;
    };

    const clampX0 = (x: number) => clamp(x, range().x0[0], range().x0[1]);
    plot.addHandle({
      get: () => [p.x0, fn().f(p.x0)],
      set: (x) => ctx.set({ x0: clampX0(x) }),
      axis: 'x',
      enabled: editable,
      color: color.f,
    });
    plot.addHandle({
      get: () => {
        const xq = p.x0 + hNow();
        return [xq, fn().f(xq)];
      },
      set: (x) => {
        const h = clamp(x - p.x0, -3, 3);
        ctx.set({ h: Math.abs(h) < H_MIN ? 0 : h });
      },
      axis: 'x',
      enabled: editable,
      color: color.q,
    });

    const dec = (x: string) => (ctx.lang === 'de' ? x : x.replace(/(\d),(\d)/g, '$1.$2'));
    const num = (v: number, d = 3) => fmt.num(v, d);

    function updateReadouts(): void {
      const f = fn();
      const h = hNow();
      const x0 = p.x0;
      if (Math.abs(h) < 1e-9) {
        ctx.readout('dq', ctx.t('zero'));
      } else {
        const m = differenceQuotient(f.f, x0, h);
        // Bei kleinem h unterscheiden sich die Funktionswerte erst in späteren Nachkommastellen
        const dv = Math.abs(h) < 0.01 ? 6 : Math.abs(h) < 0.1 ? 4 : 3;
        const dh = Math.abs(h) < 0.01 ? 3 : 2;
        ctx.readout('dq', {
          html:
            `<var>m</var><sub>s</sub> = <span class="frac"><span><var>f</var>(${num(x0 + h, dh + 1)}) − <var>f</var>(${num(x0, 2)})</span><span>${num(h, dh)}</span></span>` +
            ` = <span class="frac"><span>${num(f.f(x0 + h), dv)} − ${num(f.f(x0), dv)}</span><span>${num(h, dh)}</span></span> ≈ <strong>${num(m)}</strong>`,
        });
      }
      const sign = h < 0 ? -1 : 1;
      const rows = [1, 0.1, 0.01, 0.001]
        .map((value) => {
          const hh = sign * value;
          const current = Math.abs(Math.abs(h) - value) < value * 0.05;
          return `<tr${current ? ' class="is-current"' : ''}><td>${num(hh, value < 0.01 ? 3 : value < 0.1 ? 2 : 1)}</td><td>${num(differenceQuotient(f.f, x0, hh), 4)}</td></tr>`;
        })
        .join('');
      ctx.readout('table', { html: `<table class="mini-table"><tr><th><var>h</var></th><th><var>m</var><sub>s</sub></th></tr>${rows}</table>` });
      ctx.readout('tangent', {
        html: `<var>f</var>′(<var>x</var>) = ${dec(f.derivative)}, &nbsp;<var>f</var>′(${num(x0, 2)}) ≈ <strong>${num(f.df(x0))}</strong>`,
      });
    }

    function fitRange(): void {
      const r = range();
      plot.setRange(r.x, r.y);
    }

    return {
      update(changed, source) {
        if (changed.has('fn')) {
          fitRange();
          // Nur bei eigener Auswahl x₀ in den sinnvollen Bereich holen
          if (source === 'input' && clampX0(p.x0) !== p.x0) ctx.set({ x0: clampX0(p.x0) });
        }
        if ((changed.has('h') || changed.has('x0') || changed.has('fn')) && source !== 'sim') animating = false;
        updateReadouts();
      },

      action(id) {
        if (id === 'limit') {
          const h = Math.abs(p.h) < H_MIN ? 1.5 : p.h;
          hFrom = h;
          hTo = Math.sign(h) * H_MIN;
          animating = true;
          limit.play();
        } else {
          animating = false;
          limit.finish();
          ctx.set({ h: Math.sign(p.h || 1) * 1.5 });
        }
        ctx.requestRender();
      },

      resetView() {
        fitRange();
      },

      render() {
        const theme = ctx.theme;
        const f = fn();
        if (animating && !limit.running) {
          animating = false;
          ctx.set({ h: hTo });
        }
        const h = hNow();
        const x0 = p.x0;
        const y0 = f.f(x0);
        const xq = x0 + h;
        const yq = f.f(xq);
        const isZero = Math.abs(h) < 1e-9;
        const m = isZero ? f.df(x0) : differenceQuotient(f.f, x0, h);
        const slope = f.df(x0);

        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        // Ableitungsgraph (bis zur aktuellen Stelle „gezeichnet“)
        if (p.trace) {
          const from = plot.bounds.xMin;
          plot.fn(f.df, { color: color.derivative(), width: 1.5, dash: [5, 5], alpha: 0.45 });
          plot.fn(f.df, { color: color.derivative(), width: 3, from, to: x0 });
          plot.point(x0, slope, { color: color.derivative(), radius: 5 });
          plot.segment([x0, y0], [x0, slope], { color: color.derivative(), width: 1, dash: [3, 4], alpha: 0.7 });
          plot.text(x0, slope, `(${fmt.num(x0, 2)} | ${fmt.num(slope, 2)})`, { color: color.derivative(), offset: [-10, -12], align: 'right', size: 12 });
        }

        plot.fn(f.f, { color: color.f(), width: 3 });

        // Steigungsdreieck
        if (p.triangle && !isZero) {
          plot.polygon(
            [
              [x0, y0],
              [xq, y0],
              [xq, yq],
            ],
            { fill: color.secant(), alpha: 0.13 },
          );
          plot.segment([x0, y0], [xq, y0], { color: color.secant(), width: 2 });
          plot.segment([xq, y0], [xq, yq], { color: color.secant(), width: 2 });
          const big = Math.abs(h) * plot.scale.x > 46;
          if (big) {
            plot.text((x0 + xq) / 2, y0, `h = ${fmt.num(h, Math.abs(h) < 0.1 ? 3 : 2)}`, {
              color: color.secant(),
              offset: [0, yq >= y0 ? 14 : -14],
              size: 13,
              weight: '600',
            });
          }
          if (Math.abs(yq - y0) * plot.scale.y > 30) {
            plot.text(xq, (y0 + yq) / 2, `Δy = ${fmt.num(yq - y0, 2)}`, {
              color: color.secant(),
              offset: [h >= 0 ? 10 : -10, 0],
              align: h >= 0 ? 'left' : 'right',
              size: 13,
              weight: '600',
            });
          }
        }

        // Tangente (gestrichelt) und Sekante
        if (p.tangent || isZero) {
          plot.line([x0, y0], [x0 + 1, y0 + slope], { color: color.tangent(), width: 2.5, dash: isZero ? undefined : [8, 6] });
        }
        if (!isZero) {
          plot.line([x0, y0], [x0 + 1, y0 + m], { color: color.secant(), width: 2.5 });
        }

        // Punkte
        plot.point(x0, y0, { color: color.f(), radius: 5 });
        plot.text(x0, y0, 'P', { color: color.f(), math: true, offset: [-12, -14], size: 16, weight: 'bold' });
        if (!isZero) {
          plot.point(xq, yq, { color: color.q(), radius: 5 });
          plot.text(xq, yq, 'Q', { color: color.q(), math: true, offset: [12, -14], size: 16, weight: 'bold' });
        }
        // Markierungen auf der x-Achse
        plot.segment([x0, 0], [x0, y0], { color: theme.muted, width: 1, dash: [3, 4], alpha: 0.6 });
        plot.text(x0, 0, 'x₀', { color: theme.muted, math: true, offset: [0, 16], size: 14 });
        if (!isZero && Math.abs(h) * plot.scale.x > 30) {
          plot.segment([xq, 0], [xq, yq], { color: theme.muted, width: 1, dash: [3, 4], alpha: 0.6 });
          plot.text(xq, 0, 'x₀ + h', { color: theme.muted, math: true, offset: [0, 16], size: 14 });
        }

        // Legende oben links
        const r = plot.rect;
        const legend: [string, string][] = [[`f(x) = ${dec(f.term)}`, color.f()]];
        if (!isZero) legend.push([`${ctx.t('secant')}: m = ${fmt.num(m, 3)}`, color.secant()]);
        if (p.tangent || isZero) legend.push([`${ctx.t('tangent')}: m = ${fmt.num(slope, 3)}`, color.tangent()]);
        if (p.trace) legend.push([`f′(x) = ${dec(f.derivative)}`, color.derivative()]);
        const g = surface.g;
        g.font = `600 14px ${theme.font}`;
        const legendW = Math.max(...legend.map(([label]) => g.measureText(label).width)) + 20;
        g.fillStyle = theme.dark ? 'rgba(15,20,30,0.82)' : 'rgba(255,255,255,0.86)';
        roundRect(g, r.x + 6, r.y + 8, legendW, legend.length * 22 + 6, 8);
        g.fill();
        legend.forEach(([label, c], i) => plot.textPx(r.x + 16, r.y + 22 + i * 22, label, { color: c, align: 'left', size: 14, weight: '600', halo: false }));
        plot.end();

        if (animating) {
          updateReadouts();
          ctx.requestRender();
        }
      },

      destroy: () => surface.destroy(),
    };
  },
});
