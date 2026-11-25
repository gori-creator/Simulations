import { defineSimulation, Plot, Surface, withAlpha, type Rect } from '../../../sim-core';
import { chain, curve, fissionEnergy, fusionEnergy, multiplication } from './model';

const L = (de: string, en: string) => ({ de, en });
const NU = 2.5;
const COLS = 16;
const ROWS = 9;
const MAXGEN = 10;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Kleiner, reproduzierbarer Zufallsgenerator. */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Kernspaltung und Kernfusion: Bindungsenergie pro Nukleon mit Spaltung und
 * Fusion, Kettenreaktion Generation für Generation mit Steuerstäben.
 */
export default defineSimulation({
  id: 'kernspaltung',
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'bindung', label: L('Bindungsenergie: Spaltung und Fusion', 'Binding energy: fission and fusion') },
        { value: 'kette', label: L('Kettenreaktion', 'Chain reaction') },
      ],
      default: 'bindung',
    },
    { key: 'A', type: 'number', label: L('Massenzahl A', 'Mass number A'), min: 2, max: 240, step: 1, default: 235, visibleIf: (v) => v.mode === 'bindung' },
    { key: 'stab', type: 'number', label: L('Steuerstäbe: absorbierte Neutronen', 'Control rods: absorbed neutrons'), min: 0, max: 90, step: 5, default: 40, unit: '%', visibleIf: (v) => v.mode === 'kette' },
    { key: 'leck', type: 'number', label: L('Neutronen, die entweichen', 'Neutrons escaping'), min: 0, max: 80, step: 5, default: 30, unit: '%', visibleIf: (v) => v.mode === 'kette' },
  ],
  hint: (v) =>
    v.mode === 'bindung'
      ? L('Je höher die Kurve, desto fester sind die Nukleonen gebunden. Energie wird frei, wenn Kerne zur Mitte hin „aufsteigen“.', 'The higher the curve, the more tightly the nucleons are bound. Energy is released when nuclei “climb” towards the middle.')
      : L('Jede Spaltung setzt 2–3 Neutronen frei. Wie viele davon eine neue Spaltung auslösen, entscheidet, ob die Reaktion erlischt oder anwächst.', 'Each fission releases 2–3 neutrons. How many of them cause a new fission decides whether the reaction dies out or grows.'),
  actions: [
    { id: 'gen', label: L('Nächste Generation', 'Next generation'), primary: true, visibleIf: (v) => v.mode === 'kette' },
    { id: 'reset', label: L('Neu starten', 'Restart'), visibleIf: (v) => v.mode === 'kette' },
  ],
  readouts: [
    { key: 'B', label: L('Bindungsenergie', 'Binding energy'), spoiler: true },
    { key: 'E', label: L('Freigesetzte Energie', 'Energy released'), spoiler: true },
    { key: 'k', label: L('Vermehrungsfaktor', 'Multiplication factor'), spoiler: true },
    { key: 'gen', label: L('Generation', 'Generation') },
  ],
  presets: [
    { id: 'u', label: L('Uran-235', 'Uranium-235'), values: { mode: 'bindung', A: 235 } },
    { id: 'fe', label: L('Eisen-56', 'Iron-56'), values: { mode: 'bindung', A: 56 } },
    { id: 'he', label: L('Helium-4', 'Helium-4'), values: { mode: 'bindung', A: 4 } },
    { id: 'krit', label: L('Kritisch (k = 1)', 'Critical (k = 1)'), values: { mode: 'kette', stab: 40, leck: 30 } },
    { id: 'sub', label: L('Unterkritisch', 'Subcritical'), values: { mode: 'kette', stab: 70, leck: 30 } },
    { id: 'super', label: L('Überkritisch', 'Supercritical'), values: { mode: 'kette', stab: 10, leck: 30 } },
  ],
  strings: {
    de: {
      canvas: 'Kernphysik: Kurve der Bindungsenergie pro Nukleon mit Spaltung und Fusion, oder ein Gitter aus Urankernen, die durch Neutronen gespalten werden, mit Diagramm der Neutronenzahl je Generation',
      A: 'Massenzahl A',
      BA: 'B/A in MeV',
      Bval: 'A = {A}: etwa {b} MeV pro Nukleon, zusammen etwa {B} MeV',
      Eval: 'Spaltung U-235 → Ba-141 + Kr-92: etwa {f} MeV (≈ 0,85 MeV pro Nukleon); Fusion D + T → He-4: etwa {u} MeV (≈ 3,5 MeV pro Nukleon)',
      kVal: 'k = ν · p = 2,5 · {p} ≈ {k} ({state})',
      sub: 'unterkritisch – die Reaktion erlischt',
      crit: 'kritisch – gleichbleibende Leistung wie im Kraftwerk',
      sup: 'überkritisch – die Reaktion wächst lawinenartig',
      genVal: 'Generation {g}: {n} Neutronen, bisher {s} Spaltungen (erwartet etwa {e} Neutronen)',
      fission: 'Spaltung',
      fusion: 'Fusion',
      g: 'Generation',
      n: 'Neutronen',
    },
    en: {
      canvas: 'Nuclear physics: curve of binding energy per nucleon with fission and fusion, or a grid of uranium nuclei split by neutrons with a graph of the neutron number per generation',
      A: 'mass number A',
      BA: 'B/A in MeV',
      Bval: 'A = {A}: about {b} MeV per nucleon, in total about {B} MeV',
      Eval: 'fission U-235 → Ba-141 + Kr-92: about {f} MeV (≈ 0.85 MeV per nucleon); fusion D + T → He-4: about {u} MeV (≈ 3.5 MeV per nucleon)',
      kVal: 'k = ν · p = 2.5 · {p} ≈ {k} ({state})',
      sub: 'subcritical – the reaction dies out',
      crit: 'critical – constant power as in a power plant',
      sup: 'supercritical – the reaction grows like an avalanche',
      genVal: 'generation {g}: {n} neutrons, {s} fissions so far (expected about {e} neutrons)',
      fission: 'fission',
      fusion: 'fusion',
      g: 'generation',
      n: 'neutrons',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 240],
      y: [0, 10],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = (p.mode === 'bindung' ? { x: 0, y: 0, w, h } : split(w, h).chart) as Rect;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    // Kettenreaktion
    let random = rng(42);
    let split2: boolean[] = [];
    let active: number[] = [];
    let history: number[] = [];
    let fissions = 0;
    const prob = () => (1 - p.stab / 100) * (1 - p.leck / 100);
    const k = () => multiplication(NU, prob());

    function resetChain(): void {
      random = rng(42);
      split2 = Array.from({ length: COLS * ROWS }, () => false);
      // Start: ein Neutron trifft den mittleren Kern
      const mid = Math.floor(ROWS / 2) * COLS + Math.floor(COLS / 2);
      split2[mid] = true;
      fissions = 1;
      active = [mid];
      history = [1];
    }

    function nextGen(): void {
      if (history.length > MAXGEN) return;
      const next: number[] = [];
      let neutrons = 0;
      for (const _ of active) {
        const nu = random() < 0.5 ? 2 : 3;
        for (let i = 0; i < nu; i++) {
          if (random() >= prob()) continue;
          neutrons++;
          // trifft einen zufälligen noch ungespaltenen Kern (wenn es noch welche gibt)
          const free = split2.map((s, idx) => (s ? -1 : idx)).filter((i2) => i2 >= 0);
          if (free.length === 0) continue;
          const idx = free[Math.floor(random() * free.length)]!;
          split2[idx] = true;
          next.push(idx);
        }
      }
      fissions += next.length;
      active = next;
      history.push(neutrons);
    }

    function setupPlot(): void {
      if (p.mode === 'bindung') {
        plot.setRangePadded([0, 240], [0, 10], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('A') }, y: { label: ctx.t('BA') } });
      } else {
        const maxN = Math.max(8, ...history, chain(1, k(), MAXGEN) > 60 ? 60 : chain(1, k(), MAXGEN));
        plot.setRangePadded([0, MAXGEN], [0, Math.min(80, maxN) * 1.1], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('g') }, y: { label: ctx.t('n') } });
      }
    }

    function updateReadouts(): void {
      for (const key of ['B', 'E', 'k', 'gen']) ctx.readout(key, null);
      if (p.mode === 'bindung') {
        const b = curve(p.A);
        ctx.readout('B', tr('Bval', { A: p.A, b: fmt.num(b, 2), B: fmt.num(b * p.A, 0) }));
        ctx.readout('E', tr('Eval', { f: fmt.num(fissionEnergy(), 0), u: fmt.num(fusionEnergy(), 1) }));
      } else {
        const kk = k();
        const state = Math.abs(kk - 1) < 0.03 ? 'crit' : kk < 1 ? 'sub' : 'sup';
        ctx.readout('k', tr('kVal', { p: fmt.num(prob(), 2), k: fmt.num(kk, 2), state: ctx.t(state) }));
        const g = history.length - 1;
        ctx.readout('gen', tr('genVal', { g, n: history[g] ?? 0, s: fissions, e: fmt.num(chain(1, kk, g), 1) }));
      }
    }

    function drawGrid(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cw = (r.w - 20) / COLS;
      const ch = (r.h - 20) / ROWS;
      const rad = Math.min(cw, ch) * 0.32;
      const activeSet = new Set(active);
      for (let i = 0; i < COLS * ROWS; i++) {
        const x = r.x + 10 + ((i % COLS) + 0.5) * cw;
        const y = r.y + 10 + (Math.floor(i / COLS) + 0.5) * ch;
        if (!split2[i]) {
          g.fillStyle = withAlpha(th.series[2]!, 0.75);
          g.beginPath();
          g.arc(x, y, rad, 0, Math.PI * 2);
          g.fill();
        } else {
          const hot = activeSet.has(i);
          g.fillStyle = hot ? th.series[1]! : withAlpha(th.muted, 0.5);
          for (const d of [-1, 1]) {
            g.beginPath();
            g.arc(x + d * rad * 0.55, y + d * rad * 0.2, rad * 0.62, 0, Math.PI * 2);
            g.fill();
          }
          if (hot) {
            g.strokeStyle = withAlpha(th.series[3]!, 0.9);
            g.lineWidth = 1.5;
            for (let a = 0; a < 3; a++) {
              const ang = (a / 3) * Math.PI * 2 + i;
              g.beginPath();
              g.moveTo(x + Math.cos(ang) * rad, y + Math.sin(ang) * rad);
              g.lineTo(x + Math.cos(ang) * rad * 2, y + Math.sin(ang) * rad * 2);
              g.stroke();
            }
          }
        }
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'bindung') {
        plot.fn((A) => curve(A), { color: th.series[0]!, width: 3, from: 2, to: 240 });
        for (const [A, name] of [
          [2, 'H-2'],
          [4, 'He-4'],
          [56, 'Fe-56'],
          [235, 'U-235'],
        ] as const) {
          plot.point(A, curve(A), { color: th.muted, radius: 4 });
          plot.text(A, curve(A), name, { color: th.muted, size: 11, offset: A === 235 ? [-6, -12] : [6, 14], align: A === 235 ? 'right' : 'left' });
        }
        // Spaltung: U-235 → zwei mittlere Kerne
        plot.arrow([232, curve(232) + 0.35], [140, curve(140) + 0.35], { color: th.series[1]!, width: 2.5 });
        plot.arrow([232, curve(232) + 0.35], [95, curve(95) + 0.35], { color: th.series[1]!, width: 2.5 });
        plot.text(190, curve(190) + 0.75, ctx.t('fission'), { color: th.series[1]!, size: 12, weight: 'bold' });
        // Fusion: H-2 → He-4
        plot.arrow([2, curve(2)], [4, curve(4) - 0.1], { color: th.series[3]!, width: 2.5 });
        plot.text(8, 3.5, ctx.t('fusion'), { color: th.series[3]!, size: 12, weight: 'bold' });
        plot.point(p.A, curve(p.A), { color: th.series[2]!, radius: 7 });
      } else {
        history.forEach((n, gi) => {
          plot.polygon(
            [
              [gi - 0.35, 0],
              [gi + 0.35, 0],
              [gi + 0.35, Math.min(80, n)],
              [gi - 0.35, Math.min(80, n)],
            ],
            { fill: withAlpha(th.series[1]!, 0.7) },
          );
        });
        plot.fn((x) => Math.min(80, chain(1, k(), x)), { color: th.series[0]!, width: 2, dash: [6, 5], from: 0, to: MAXGEN });
      }
      plot.end();
    }

    resetChain();

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode') || changed.has('stab') || changed.has('leck')) resetChain();
        setupPlot();
        updateReadouts();
      },
      action(id) {
        if (id === 'gen') nextGen();
        else resetChain();
        setupPlot();
        updateReadouts();
        ctx.requestRender();
      },
      render() {
        plot.resize();
        surface.begin();
        if (p.mode === 'kette') {
          const s = split(surface.width, surface.height);
          drawGrid(s.scene);
        }
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
