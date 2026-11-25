import { defineSimulation, Plot, Surface } from '../../../sim-core';
import { attractor, koch, kochArea, kochPerimeter, logistic, lotkaVolterra, lvEquilibrium, period, sierpinski, similarityDimension, type Pt } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'raeuber' | 'logistisch' | 'fraktal';
const T_END = 40;
const R_MIN = 2.5;

/**
 * Dynamische Systeme und Fraktale: Räuber-Beute-Modell mit Zeit- und
 * Phasendiagramm, logistische Gleichung mit Feigenbaum-Diagramm,
 * Koch-Schneeflocke und Sierpinski-Dreieck.
 */
export default defineSimulation({
  id: 'dynamische-systeme',
  layout: { aspect: 1.5, aspectNarrow: 0.8 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'raeuber', label: L('Räuber und Beute', 'Predator and prey') },
        { value: 'logistisch', label: L('Feigenbaum-Diagramm', 'Feigenbaum diagram') },
        { value: 'fraktal', label: L('Fraktale', 'Fractals') },
      ],
      default: 'raeuber',
      display: 'buttons',
    },
    { key: 'x0', type: 'number', label: L('Beute am Anfang', 'Prey at the start'), min: 5, max: 60, step: 1, default: 30, visibleIf: (v) => v.mode === 'raeuber' },
    { key: 'y0', type: 'number', label: L('Räuber am Anfang', 'Predators at the start'), min: 1, max: 30, step: 1, default: 5, visibleIf: (v) => v.mode === 'raeuber' },
    { key: 'a', type: 'number', label: L('Vermehrung der Beute a', 'Growth of the prey a'), min: 0.2, max: 2, step: 0.05, default: 1, visibleIf: (v) => v.mode === 'raeuber' },
    { key: 'c', type: 'number', label: L('Sterben der Räuber c', 'Death of the predators c'), min: 0.2, max: 2, step: 0.05, default: 1.5, visibleIf: (v) => v.mode === 'raeuber' },
    { key: 'u', type: 'number', label: L('Zeitpunkt', 'Point in time'), min: 0, max: 1, step: 0.005, default: 0.3, visibleIf: (v) => v.mode === 'raeuber' },
    { key: 'r', type: 'number', label: L('Wachstumsfaktor r', 'Growth factor r'), min: 0.5, max: 4, step: 0.005, default: 3.2, visibleIf: (v) => v.mode === 'logistisch' },
    { key: 'xs', type: 'number', label: L('Startwert x₀', 'Starting value x₀'), min: 0.01, max: 0.99, step: 0.01, default: 0.2, visibleIf: (v) => v.mode === 'logistisch' },
    {
      key: 'f',
      type: 'choice',
      label: L('Fraktal', 'Fractal'),
      options: [
        { value: 'koch', label: L('Koch-Schneeflocke', 'Koch snowflake') },
        { value: 'sierpinski', label: L('Sierpinski-Dreieck', 'Sierpinski triangle') },
      ],
      default: 'koch',
      display: 'buttons',
      visibleIf: (v) => v.mode === 'fraktal',
    },
    { key: 'n', type: 'number', label: L('Stufe', 'Level'), min: 0, max: 6, step: 1, default: 3, visibleIf: (v) => v.mode === 'fraktal' },
  ],
  hint: (v) =>
    v.mode === 'logistisch'
      ? L('Erhöhe r langsam: Aus einem Grenzwert werden zwei, vier, acht … – und ab etwa 3,57 herrscht Chaos.', 'Increase r slowly: one limit becomes two, four, eight … – and from about 3.57 on there is chaos.')
      : v.mode === 'fraktal'
        ? L('Jede Stufe wiederholt dieselbe Regel im Kleinen. Der Umfang wächst ohne Ende, die Fläche bleibt endlich.', 'Each level repeats the same rule on a smaller scale. The perimeter grows without end, the area stays finite.')
        : L('Viel Beute → mehr Räuber → weniger Beute → weniger Räuber … Im Phasendiagramm wird daraus eine geschlossene Bahn.', 'Lots of prey → more predators → less prey → fewer predators … In the phase diagram this becomes a closed orbit.'),
  readouts: [
    { key: 'a', label: L('Zustand', 'State') },
    { key: 'b', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'lv', label: L('Hasen und Füchse', 'Hares and foxes'), values: { mode: 'raeuber', x0: 30, y0: 5, a: 1, c: 1.5, u: 0.3 } },
    { id: 'gg', label: L('Start im Gleichgewicht', 'Start at equilibrium'), values: { mode: 'raeuber', x0: 20, y0: 10, a: 1, c: 1.5, u: 0.5 } },
    { id: 'p2', label: L('Periode 2', 'Period 2'), values: { mode: 'logistisch', r: 3.2, xs: 0.2 } },
    { id: 'chaos', label: L('Chaos bei r = 3,9', 'Chaos at r = 3.9'), values: { mode: 'logistisch', r: 3.9, xs: 0.2 } },
    { id: 'koch', label: L('Koch-Schneeflocke', 'Koch snowflake'), values: { mode: 'fraktal', f: 'koch', n: 4 } },
    { id: 'sier', label: L('Sierpinski-Dreieck', 'Sierpinski triangle'), values: { mode: 'fraktal', f: 'sierpinski', n: 5 } },
  ],
  strings: {
    de: {
      canvas: 'Diagramme zu dynamischen Systemen: Bestände über der Zeit und im Phasendiagramm, Folgenglieder und Feigenbaum-Diagramm oder ein Fraktal',
      lvState: 't = {t}: Beute ≈ {x}, Räuber ≈ {y}',
      lvEq: 'Gleichgewicht bei {x} Beutetieren und {y} Räubern',
      logState: 'x₅₀ ≈ {x}',
      fixed: 'Die Folge strebt gegen {x}.',
      per: 'Die Folge pendelt zwischen {p} Werten.',
      chaos: 'Kein Muster – deterministisches Chaos.',
      dead: 'Die Population stirbt aus (Grenzwert 0).',
      kochS: '{e} Strecken, Umfang ≈ {u}, Fläche ≈ {a}',
      kochR: 'Umfang wächst ohne Ende (·4/3 je Stufe), Fläche → 1,6 · Startfläche; Dimension ≈ {d}',
      sierS: '{t} Dreiecke, Fläche = (3/4)^{n} ≈ {a} der Startfläche',
      sierR: 'Fläche → 0, trotzdem unendlich viele Punkte; Dimension ≈ {d}',
      time: 't',
      count: 'Anzahl',
      prey: 'Beute',
      pred: 'Räuber',
      n: 'n',
      xn: 'xₙ',
      r: 'r',
    },
    en: {
      canvas: 'Charts of dynamical systems: populations over time and in the phase diagram, sequence terms and Feigenbaum diagram, or a fractal',
      lvState: 't = {t}: prey ≈ {x}, predators ≈ {y}',
      lvEq: 'Equilibrium at {x} prey and {y} predators',
      logState: 'x₅₀ ≈ {x}',
      fixed: 'The sequence tends to {x}.',
      per: 'The sequence cycles between {p} values.',
      chaos: 'No pattern – deterministic chaos.',
      dead: 'The population dies out (limit 0).',
      kochS: '{e} segments, perimeter ≈ {u}, area ≈ {a}',
      kochR: 'The perimeter grows without end (·4/3 per level), the area → 1.6 · starting area; dimension ≈ {d}',
      sierS: '{t} triangles, area = (3/4)^{n} ≈ {a} of the starting area',
      sierR: 'Area → 0, yet infinitely many points; dimension ≈ {d}',
      time: 't',
      count: 'number',
      prey: 'prey',
      pred: 'predators',
      n: 'n',
      xn: 'xₙ',
      r: 'r',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mode = () => p.mode as Mode;
    const n = (v: number, d = 2) => fmt.num(v, d);
    const lv = () => ({ a: p.a, b: 0.1, c: p.c, d: 0.075 });

    const narrow = (w: number) => w < 640;
    const plot1 = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'fraktal' ? { x: 0, y: h, w, h: 1 } : mode() === 'raeuber' && !narrow(w) ? { x: 0, y: 0, w: Math.round(w * 0.56), h } : { x: 0, y: 0, w, h: Math.round(h * 0.45) }),
    });
    const plot2 = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'fraktal' ? { x: 0, y: h, w, h: 1 } : mode() === 'raeuber' && !narrow(w) ? { x: Math.round(w * 0.56) + 4, y: 0, w: w - Math.round(w * 0.56) - 4, h } : { x: 0, y: Math.round(h * 0.45) + 6, w, h: h - Math.round(h * 0.45) - 6 }),
    });
    const frac = new Plot(surface, { x: [-0.1, 1.1], y: [-0.4, 1.1], equalAspect: true, pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'fraktal' ? { x: 0, y: 0, w, h } : { x: 0, y: h, w, h: 1 }) });

    let sim = lotkaVolterra(lv(), p.x0, p.y0, T_END, 0.02);
    let simKey = '';
    function simulate(): void {
      const k = `${p.x0}|${p.y0}|${p.a}|${p.c}`;
      if (k === simKey) return;
      simKey = k;
      sim = lotkaVolterra(lv(), p.x0, p.y0, T_END, 0.02);
    }

    /** Feigenbaum-Diagramm einmal berechnen. */
    let bif: { r: number; xs: number[] }[] | null = null;
    function bifurcation(): { r: number; xs: number[] }[] {
      if (bif) return bif;
      bif = [];
      for (let i = 0; i <= 500; i++) {
        const r = R_MIN + ((4 - R_MIN) * i) / 500;
        bif.push({ r, xs: attractor(r, 300, 100) });
      }
      return bif;
    }

    function setRanges(): void {
      const pad = { left: 44, right: 14, top: 14, bottom: 24 };
      if (mode() === 'raeuber') {
        const yMax = Math.max(...sim.x, ...sim.y) * 1.08;
        plot1.setRangePadded([0, T_END], [0, yMax], pad);
        plot1.setAxes({ x: { label: ctx.t('time') }, y: { label: ctx.t('count') } });
        plot2.setRangePadded([0, Math.max(...sim.x) * 1.08], [0, Math.max(...sim.y) * 1.08], pad);
        plot2.setAxes({ x: { label: ctx.t('prey') }, y: { label: ctx.t('pred') } });
      } else if (mode() === 'logistisch') {
        plot1.setRangePadded([0, 50], [0, 1], pad);
        plot1.setAxes({ x: { label: ctx.t('n'), minStep: 1 }, y: { label: ctx.t('xn') } });
        plot2.setRangePadded([R_MIN, 4], [0, 1], pad);
        plot2.setAxes({ x: { label: ctx.t('r') }, y: { label: 'x' } });
      } else {
        frac.setRangePadded([-0.05, 1.05], p.f === 'koch' ? [-0.33, 0.9] : [-0.05, 0.92], { left: 12, right: 12, top: 12, bottom: 12 });
      }
    }

    function updateReadouts(): void {
      let a = '';
      let b = '';
      if (mode() === 'raeuber') {
        const i = Math.round(p.u * (sim.t.length - 1));
        a = tr('lvState', { t: n(sim.t[i]!, 1), x: n(sim.x[i]!, 1), y: n(sim.y[i]!, 1) });
        const [xe, ye] = lvEquilibrium(lv());
        b = tr('lvEq', { x: n(xe, 1), y: n(ye, 1) });
      } else if (mode() === 'logistisch') {
        const seq = logistic(p.r, p.xs, 50);
        a = tr('logState', { x: n(seq[50]!, 4) });
        if (p.r <= 1) b = ctx.t('dead');
        else {
          const per = period(p.r);
          b = per === 1 ? tr('fixed', { x: n(1 - 1 / p.r, 4) }) : per === 0 ? ctx.t('chaos') : tr('per', { p: per });
        }
      } else if (p.f === 'koch') {
        a = tr('kochS', { e: 3 * Math.pow(4, p.n), u: n(kochPerimeter(p.n), 3), a: n(kochArea(p.n), 4) });
        b = tr('kochR', { d: n(similarityDimension(4, 3), 3) });
      } else {
        a = tr('sierS', { t: Math.pow(3, p.n), n: p.n, a: n(Math.pow(0.75, p.n), 4) });
        b = tr('sierR', { d: n(similarityDimension(3, 2), 3) });
      }
      ctx.readout('a', a);
      ctx.readout('b', b);
    }

    function drawRaeuber(): void {
      const th = ctx.theme;
      const i = Math.round(p.u * (sim.t.length - 1));
      const xs: Pt[] = sim.t.map((t, k) => [t, sim.x[k]!]);
      const ys: Pt[] = sim.t.map((t, k) => [t, sim.y[k]!]);
      plot1.begin();
      plot1.grid({ minor: false });
      plot1.axes();
      plot1.polyline(xs, { color: th.series[2]!, width: 2.2 });
      plot1.polyline(ys, { color: th.series[1]!, width: 2.2 });
      plot1.vline(sim.t[i]!, { color: th.muted, width: 1, dash: [4, 4] });
      plot1.point(sim.t[i]!, sim.x[i]!, { color: th.series[2]!, radius: 5 });
      plot1.point(sim.t[i]!, sim.y[i]!, { color: th.series[1]!, radius: 5 });
      plot1.text(T_END, sim.x[sim.x.length - 1]!, ctx.t('prey'), { size: 12, weight: 'bold', color: th.series[2]!, align: 'right', offset: [-4, sim.x[sim.x.length - 1]! >= sim.y[sim.y.length - 1]! ? -14 : 14] });
      plot1.text(T_END, sim.y[sim.y.length - 1]!, ctx.t('pred'), { size: 12, weight: 'bold', color: th.series[1]!, align: 'right', offset: [-4, sim.y[sim.y.length - 1]! > sim.x[sim.x.length - 1]! ? -14 : 14] });
      plot1.end();
      plot2.begin();
      plot2.grid({ minor: false });
      plot2.axes();
      const phase: Pt[] = sim.x.map((x, k) => [x, sim.y[k]!]);
      plot2.polyline(phase, { color: th.series[0]!, width: 2 });
      const [xe, ye] = lvEquilibrium(lv());
      plot2.point(xe, ye, { color: th.series[3]!, radius: 5 });
      plot2.point(sim.x[i]!, sim.y[i]!, { color: th.series[0]!, radius: 6 });
      plot2.end();
    }

    function drawLogistic(): void {
      const th = ctx.theme;
      const seq = logistic(p.r, p.xs, 50);
      plot1.begin();
      plot1.grid({ minor: false });
      plot1.axes();
      plot1.polyline(
        seq.map((x, k) => [k, x] as Pt),
        { color: th.series[0]!, width: 1.2, alpha: 0.5 },
      );
      seq.forEach((x, k) => plot1.point(k, x, { color: th.series[0]!, radius: 3 }));
      plot1.end();
      const g = plot2.begin();
      plot2.grid({ minor: false });
      plot2.axes();
      g.fillStyle = th.text;
      g.globalAlpha = 0.5;
      for (const col of bifurcation()) {
        const X = plot2.px(col.r);
        for (const x of col.xs) g.fillRect(X, plot2.py(x), 1.2, 1.2);
      }
      g.globalAlpha = 1;
      plot2.vline(p.r, { color: th.series[1]!, width: 1.8 });
      if (p.r >= R_MIN) for (const x of attractor(p.r, 400, 64)) plot2.point(p.r, x, { color: th.series[1]!, radius: 3 });
      plot2.end();
    }

    function drawFractal(): void {
      const th = ctx.theme;
      frac.begin();
      if (p.f === 'koch') {
        frac.polygon(koch(p.n), { fill: th.series[0]!, alpha: 0.2, stroke: th.series[0]!, width: 1.5 });
      } else {
        for (const t of sierpinski(p.n)) frac.polygon(t, { fill: th.series[3]!, alpha: 0.75 });
      }
      frac.end();
    }

    return {
      update() {
        simulate();
        setRanges();
        updateReadouts();
      },
      render() {
        surface.begin();
        plot1.resize();
        plot2.resize();
        frac.resize();
        if (mode() === 'raeuber') drawRaeuber();
        else if (mode() === 'logistisch') drawLogistic();
        else drawFractal();
      },
      destroy: () => surface.destroy(),
    };
  },
});
