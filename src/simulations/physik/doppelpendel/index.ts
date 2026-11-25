import { defineSimulation, Plot, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { energy, positions, step, type State } from './model';

const L = (de: string, en: string) => ({ de, en });
const P = { m1: 1, m2: 1, l1: 1, l2: 1 };
const DEG = Math.PI / 180;
const T_MAX = 30;
const H = 0.002;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.5);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.58);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Doppelpendel und deterministisches Chaos: zwei Pendel mit fast gleichen
 * Anfangswerten laufen auseinander; der Abstand wächst exponentiell.
 */
export default defineSimulation({
  id: 'doppelpendel',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    { key: 'a1', type: 'number', label: L('Startwinkel oberes Pendel', 'Start angle upper pendulum'), min: 5, max: 179, step: 1, default: 120, unit: '°' },
    { key: 'a2', type: 'number', label: L('Startwinkel unteres Pendel', 'Start angle lower pendulum'), min: -179, max: 179, step: 1, default: 120, unit: '°' },
    {
      key: 'delta',
      type: 'choice',
      label: L('Unterschied beim zweiten Pendel', 'Difference for the second pendulum'),
      options: [
        { value: '0.1', label: L('0,1°', '0.1°') },
        { value: '0.001', label: L('0,001°', '0.001°') },
        { value: '0.00001', label: L('0,00001°', '0.00001°') },
      ],
      default: '0.001',
    },
    { key: 'spur', type: 'boolean', label: L('Spur zeichnen', 'Draw trace'), default: true },
  ],
  hint: L(
    'Zwei Doppelpendel starten fast gleich. Drücke Start und beobachte, wann sie sich trennen.',
    'Two double pendulums start almost identically. Press play and watch when they separate.',
  ),
  readouts: [
    { key: 't', label: L('Zeit', 'Time') },
    { key: 'diff', label: L('Unterschied', 'Difference'), spoiler: true },
    { key: 'E', label: L('Energie', 'Energy') },
  ],
  presets: [
    { id: 'chaos', label: L('Chaotisch (120°)', 'Chaotic (120°)'), values: { a1: 120, a2: 120, delta: '0.001' } },
    { id: 'small', label: L('Kleine Auslenkung (10°)', 'Small swing (10°)'), values: { a1: 10, a2: 10, delta: '0.1' } },
    { id: 'tiny', label: L('Winziger Unterschied', 'Tiny difference'), values: { a1: 120, a2: 120, delta: '0.00001' } },
  ],
  strings: {
    de: {
      canvas: 'Zwei Doppelpendel nebeneinander mit Spuren der unteren Massen; daneben ein Diagramm, wie der Unterschied der Winkel mit der Zeit wächst',
      tVal: 't ≈ {t} s',
      diffVal: 'Δφ₂ ≈ {d}° ({f}-fach des Anfangsunterschieds)',
      EVal: 'E ≈ {E} J (bleibt erhalten)',
      lg: 'lg(|Δφ₂| in °)',
      ts: 't in s',
      a: 'Pendel A',
      b: 'Pendel B',
    },
    en: {
      canvas: 'Two double pendulums side by side with traces of the lower masses; next to it a graph of how the difference in angle grows over time',
      tVal: 't ≈ {t} s',
      diffVal: 'Δφ₂ ≈ {d}° ({f} times the initial difference)',
      EVal: 'E ≈ {E} J (conserved)',
      lg: 'lg(|Δφ₂| in °)',
      ts: 't in s',
      a: 'pendulum A',
      b: 'pendulum B',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, T_MAX],
      y: [-6, 3],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    let A: State = [0, 0, 0, 0];
    let B: State = [0, 0, 0, 0];
    let t = 0;
    let trailA: [number, number][] = [];
    let trailB: [number, number][] = [];
    let hist: [number, number][] = [];
    const d0 = () => Number(p.delta) || 0.001;

    function reset(): void {
      A = [p.a1 * DEG, p.a2 * DEG, 0, 0];
      B = [(p.a1 + d0()) * DEG, p.a2 * DEG, 0, 0];
      t = 0;
      trailA = [];
      trailB = [];
      hist = [[0, Math.log10(d0())]];
    }

    function diff(): number {
      // Winkelunterschied des unteren Pendels, auf −180°…180° gebracht
      let d = (A[1] - B[1]) / DEG;
      d = ((((d + 180) % 360) + 360) % 360) - 180;
      return Math.abs(d);
    }

    function updateReadouts(): void {
      ctx.readout('t', tr('tVal', { t: fmt.num(t, 1) }));
      const d = Math.max(diff(), 1e-12);
      ctx.readout('diff', tr('diffVal', { d: d < 0.01 ? d.toExponential(1).replace('.', ctx.lang === 'de' ? ',' : '.') : fmt.num(d, 2), f: fmt.num(d / d0(), 0) }));
      ctx.readout('E', tr('EVal', { E: fmt.num(energy(A, P), 2) }));
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = Math.min(r.w, r.h) * 0.22;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h * 0.48;
      const toPx = (q: [number, number]): [number, number] => [cx + q[0] * s, cy - q[1] * s];
      const drawOne = (S: State, trail: [number, number][], color: string) => {
        if (p.spur && trail.length > 1) {
          g.strokeStyle = withAlpha(color, 0.45);
          g.lineWidth = 1.5;
          g.beginPath();
          trail.forEach((q, i) => {
            const [x, y] = toPx(q);
            if (i) g.lineTo(x, y);
            else g.moveTo(x, y);
          });
          g.stroke();
        }
        const [p1, p2] = positions(S, P);
        const a = toPx(p1);
        const b = toPx(p2);
        g.strokeStyle = color;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(a[0], a[1]);
        g.lineTo(b[0], b[1]);
        g.stroke();
        g.fillStyle = color;
        for (const q of [a, b]) {
          g.beginPath();
          g.arc(q[0], q[1], 8, 0, Math.PI * 2);
          g.fill();
        }
      };
      drawOne(B, trailB, th.series[3]!);
      drawOne(A, trailA, th.series[0]!);
      g.fillStyle = th.text;
      g.beginPath();
      g.arc(cx, cy, 4, 0, Math.PI * 2);
      g.fill();
      text(g, ctx.t('a'), r.x + 12, r.y + 16, { font: `700 12px ${th.font}`, color: th.series[0]!, align: 'left' });
      text(g, ctx.t('b'), r.x + 12, r.y + 34, { font: `700 12px ${th.font}`, color: th.series[3]!, align: 'left' });
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      plot.polyline(hist, { color: th.series[1]!, width: 2 });
      const last = hist[hist.length - 1]!;
      plot.point(last[0], last[1], { color: th.series[1]!, radius: 5 });
      plot.end();
    }

    reset();

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('a1') || changed.has('a2') || changed.has('delta')) reset();
        plot.setRangePadded([0, T_MAX], [-6, 3], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('ts') }, y: { label: ctx.t('lg') } });
        updateReadouts();
      },
      tick(dt) {
        if (t >= T_MAX) {
          ctx.clock.pause();
          return;
        }
        const n = Math.max(1, Math.round(Math.min(dt, 0.05) / H));
        for (let i = 0; i < n; i++) {
          A = step(A, P, H);
          B = step(B, P, H);
        }
        t += n * H;
        trailA.push(positions(A, P)[1]);
        trailB.push(positions(B, P)[1]);
        if (trailA.length > 600) trailA.shift();
        if (trailB.length > 600) trailB.shift();
        hist.push([t, Math.log10(Math.max(1e-6, diff()))]);
        updateReadouts();
      },
      resetTime() {
        reset();
        updateReadouts();
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        drawScene(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
