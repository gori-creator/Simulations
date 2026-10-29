import { clamp, defineSimulation, ease, Plot, roundRect, Surface, Tween } from '../../../sim-core';
import { differenceQuotient, FUNCTIONS, isDifferentiable, isExactAt, type FunctionId } from './model';

const L = (de: string, en: string) => ({ de, en });
const H_MIN = 0.001;
const RANGES: Record<FunctionId, { x: [number, number]; y: [number, number]; x0: [number, number] }> = {
  x2: { x: [-3.5, 3.5], y: [-1.5, 9], x0: [-3, 3] },
  cubic: { x: [-4, 4], y: [-3.2, 3.2], x0: [-3.5, 3.5] },
  sin: { x: [-1, 7.3], y: [-1.8, 1.8], x0: [-0.8, 7] },
  exp: { x: [-3, 2.6], y: [-0.8, 7.5], x0: [-2.8, 2] },
  abs: { x: [-3.5, 3.5], y: [-1.5, 4.5], x0: [-3, 3] },
};

/**
 * Von der Sekante zur Tangente: Der Differenzenquotient
 * (f(x₀ + h) − f(x₀)) / h ist die Steigung der Sekante durch P und Q. Für
 * h → 0 wird aus der Sekante die Tangente in P.
 */
export default defineSimulation({
  id: 'sekante-tangente',
  dragHint: true,
  hint: { de: 'Tipp: Zieh die Punkte P und Q – wird h klein, wird die Sekante zur Tangente.', en: 'Tip: Drag points P and Q – as h gets small, the secant becomes the tangent.' },
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
        { value: 'abs', label: L('f(x) = |x| (Knick)', 'f(x) = |x| (kink)') },
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
    { id: 'kink', label: L('Knick bei |x|', 'Kink of |x|'), values: { fn: 'abs', x0: 0, h: 1 } },
  ],
  strings: {
    de: {
      canvas:
        'Graph einer Funktion mit dem Punkt P an der Stelle x₀ und dem Punkt Q an der Stelle x₀ + h. Die Sekante durch P und Q ist durchgezogen, die Tangente in P gestrichelt. Das Steigungsdreieck zeigt h und Δy; auf Wunsch entsteht der Graph der Ableitung f′.',
      secant: 'Sekante',
      tangent: 'Tangente',
      zero: 'h = 0: Der Differenzenquotient ist nicht definiert (Division durch 0) – gezeichnet ist die Tangente.',
      zeroKink: 'h = 0: Der Differenzenquotient ist nicht definiert (Division durch 0). Hier gibt es auch keine Tangente: Der Graph hat einen Knick.',
      noTangent: 'keine (Knick)',
      kink: 'existiert nicht: Knick. Für h > 0 ist der Differenzenquotient 1, für h < 0 ist er −1.',
      derivative: 'Ableitung',
    },
    en: {
      canvas:
        'Graph of a function with the point P at x₀ and the point Q at x₀ + h. The secant through P and Q is a solid line, the tangent at P is dashed. The slope triangle shows h and Δy; optionally the graph of the derivative f′ is traced.',
      secant: 'Secant',
      tangent: 'Tangent',
      zero: 'h = 0: the difference quotient is undefined (division by 0) – the tangent is shown.',
      zeroKink: 'h = 0: the difference quotient is undefined (division by 0). There is no tangent here either: the graph has a kink.',
      noTangent: 'none (kink)',
      kink: 'does not exist: kink. For h > 0 the difference quotient is 1, for h < 0 it is −1.',
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
    /** „=“, wenn die Zahl auf d Stellen exakt ist, sonst „≈“. */
    const eq = (v: number, d = 3) => (isExactAt(v, d) ? '=' : '≈');
    /** Negative Zahlen als Subtrahend in Klammern: 1 − (−0,77). */
    /** Gerundete Zahlen mit fester Stellenzahl (0,0099998 → „0,0100“), exakte ohne Endnullen. */
    const val = (v: number, d: number) => (isExactAt(v, d) ? num(v, d) : fmt.fixed(v, d));
    /** Negative Zahlen als Subtrahend in Klammern: 1 − (−0,77). */
    const paren = (v: number, d: number) => (val(v, d).startsWith('−') ? `(${val(v, d)})` : val(v, d));

    function updateReadouts(): void {
      const f = fn();
      const h = hNow();
      const x0 = p.x0;
      const diff = isDifferentiable(f, x0);
      if (Math.abs(h) < 1e-9) {
        ctx.readout('dq', ctx.t(diff ? 'zero' : 'zeroKink'));
      } else {
        const m = differenceQuotient(f.f, x0, h);
        // Bei kleinem h unterscheiden sich die Funktionswerte erst in späteren Nachkommastellen
        const dv = Math.abs(h) < 0.01 ? 6 : Math.abs(h) < 0.1 ? 4 : 3;
        // h hat die Schrittweite 0,001: immer bis zu 3 Stellen (num lässt Endnullen weg)
        const dh = 3;
        const y1 = f.f(x0 + h);
        const y0 = f.f(x0);
        // „=“ nur, wenn alle eingesetzten Zahlen exakt sind, sonst „≈“
        const inserted = isExactAt(y1, dv) && isExactAt(y0, dv) && isExactAt(h, dh) ? '=' : '≈';
        ctx.readout('dq', {
          html:
            `<var>m</var><sub>s</sub> = <span class="frac"><span><var>f</var>(${num(x0 + h, dh + 1)}) − <var>f</var>(${num(x0, 2)})</span><span>${num(h, dh)}</span></span>` +
            ` ${inserted} <span class="frac"><span>${val(y1, dv)} − ${paren(y0, dv)}</span><span>${num(h, dh)}</span></span> ${eq(m)} <strong>${val(m, 3)}</strong>`,
        });
      }
      const sign = h < 0 ? -1 : 1;
      const rows = [1, 0.1, 0.01, 0.001]
        .map((value) => {
          const hh = sign * value;
          const current = Math.abs(Math.abs(h) - value) < value * 0.05;
          const mm = differenceQuotient(f.f, x0, hh);
          // Gerundete Werte mit fester Stellenzahl (0,99998 → „1,0000“, nicht „1“)
          const ms = isExactAt(mm, 4) ? num(mm, 4) : fmt.fixed(mm, 4);
          return `<tr${current ? ' class="is-current"' : ''}><td>${num(hh, value < 0.01 ? 3 : value < 0.1 ? 2 : 1)}</td><td>${ms}</td></tr>`;
        })
        .join('');
      ctx.readout('table', { html: `<table class="mini-table"><tr><th><var>h</var></th><th><var>m</var><sub>s</sub></th></tr>${rows}</table>` });
      const d = f.df(x0);
      ctx.readout('tangent', {
        html: diff
          ? `<var>f</var>′(<var>x</var>) = ${dec(f.derivative)}, &nbsp;<var>f</var>′(${num(x0, 2)}) ${eq(d)} <strong>${num(d)}</strong>`
          : `<var>f</var>′(${num(x0, 2)}) ${ctx.t('kink')}`,
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
        const slope = f.df(x0);
        const hasTangent = Number.isFinite(slope);
        const m = isZero ? slope : differenceQuotient(f.f, x0, h);
        const showTangent = (p.tangent || isZero) && hasTangent;

        plot.begin();
        if (p.grid) plot.grid();
        plot.axes();

        // Ableitungsgraph (bis zur aktuellen Stelle „gezeichnet“)
        if (p.trace) {
          // An Knickstellen getrennt zeichnen (keine senkrechte Verbindungslinie)
          const cuts = [plot.bounds.xMin, ...(f.kinks ?? []), plot.bounds.xMax];
          for (let i = 0; i + 1 < cuts.length; i++) {
            const a = cuts[i]!;
            const b = cuts[i + 1]!;
            plot.fn(f.df, { color: color.derivative(), width: 1.5, dash: [5, 5], alpha: 0.45, from: a, to: b });
            plot.fn(f.df, { color: color.derivative(), width: 3, from: a, to: Math.min(b, x0) });
          }
          if (hasTangent) {
            plot.point(x0, slope, { color: color.derivative(), radius: 5 });
            plot.segment([x0, y0], [x0, slope], { color: color.derivative(), width: 1, dash: [3, 4], alpha: 0.7 });
            // Links vom Punkt beschriften; passt das nicht (linker Rand), rechts – aber nur,
            // wenn dort nicht Q liegt (h < 0). Sonst entfällt die Beschriftung statt abgeschnitten zu werden.
            const nearLeft = (x0 - plot.bounds.xMin) * plot.scale.x < 90;
            if (!nearLeft || h < 0) {
              plot.text(x0, slope, `(${fmt.num(x0, 2)} | ${fmt.num(slope, 2)})`, {
                color: color.derivative(),
                offset: [nearLeft ? 10 : -10, -12],
                align: nearLeft ? 'left' : 'right',
                size: 12,
              });
            }
          }
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
            const dh = 3;
            // Bei negativem h rechtsbündig links neben P, damit die Beschriftung P nicht überdeckt
            plot.text(h < 0 ? x0 : (x0 + xq) / 2, y0, `h ${eq(h, dh)} ${fmt.num(h, dh)}`, {
              color: color.secant(),
              offset: [h < 0 ? -14 : 0, yq >= y0 ? 14 : -14],
              align: h < 0 ? 'right' : 'center',
              size: 13,
              weight: '600',
            });
          }
          if (Math.abs(yq - y0) * plot.scale.y > 30) {
            plot.text(xq, (y0 + yq) / 2, `Δy ${eq(yq - y0, 2)} ${fmt.num(yq - y0, 2)}`, {
              color: color.secant(),
              offset: [h >= 0 ? 10 : -10, 0],
              align: h >= 0 ? 'left' : 'right',
              size: 13,
              weight: '600',
            });
          }
        }

        // Tangente (gestrichelt) und Sekante
        if (showTangent) {
          plot.line([x0, y0], [x0 + 1, y0 + slope], { color: color.tangent(), width: 2.5, dash: [8, 6] });
        }
        if (!isZero) {
          plot.line([x0, y0], [x0 + 1, y0 + m], { color: color.secant(), width: 2.5 });
        }

        // Punkte
        plot.point(x0, y0, { color: color.f(), radius: 5 });
        // P und Q auf der jeweils abgewandten Seite beschriften (auch bei negativem h)
        const side = h < 0 ? -1 : 1;
        plot.text(x0, y0, 'P', { color: color.f(), math: true, offset: [-12 * side, -14], size: 16, weight: 'bold' });
        if (!isZero) {
          plot.point(xq, yq, { color: color.q(), radius: 5 });
          plot.text(xq, yq, 'Q', { color: color.q(), math: true, offset: [12 * side, yq >= y0 ? -14 : 18], size: 16, weight: 'bold' });
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
        // Legende mit Linienmuster: Sekante durchgezogen, Tangente gestrichelt (nicht nur Farbe)
        const legend: [string, string, number[]][] = [[`f(x) = ${dec(f.term)}`, color.f(), []]];
        if (!isZero) legend.push([`${ctx.t('secant')}: m ${eq(m)} ${fmt.num(m, 3)}`, color.secant(), []]);
        if (p.tangent || isZero) {
          legend.push([
            hasTangent ? `${ctx.t('tangent')}: m ${eq(slope)} ${fmt.num(slope, 3)}` : `${ctx.t('tangent')}: ${ctx.t('noTangent')}`,
            color.tangent(),
            [6, 4],
          ]);
        }
        // Ohne Term: Welche Funktion entsteht, sollen die Lernenden selbst erkennen (Term steht in der verdeckten Karte)
        if (p.trace) legend.push([`${ctx.t('derivative')} f′`, color.derivative(), []]);
        const g = surface.g;
        g.font = `600 14px ${theme.font}`;
        const sample = 22;
        const legendW = Math.max(...legend.map(([label]) => g.measureText(label).width)) + 28 + sample;
        g.save();
        g.globalAlpha = 0.86;
        g.fillStyle = theme.bg;
        roundRect(g, r.x + 6, r.y + 8, legendW, legend.length * 22 + 6, 8);
        g.fill();
        g.restore();
        legend.forEach(([label, c, dash], i) => {
          const y = r.y + 22 + i * 22;
          g.save();
          g.strokeStyle = c;
          g.lineWidth = 2.5;
          g.setLineDash(dash);
          g.beginPath();
          g.moveTo(r.x + 16, y);
          g.lineTo(r.x + 16 + sample, y);
          g.stroke();
          g.restore();
          plot.textPx(r.x + 24 + sample, y, label, { color: c, align: 'left', size: 14, weight: '600', halo: false });
        });
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
