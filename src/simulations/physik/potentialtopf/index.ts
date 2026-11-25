import { defineSimulation, Plot, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { deBroglie, E, energy, ME, MN, probability, psi, transitionWavelength } from './model';

const L = (de: string, en: string) => ({ de, en });
const NMAX = 5;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.45);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Linearer Potentialtopf: Energiestufen mit Wellenfunktionen, Aufenthalts-
 * wahrscheinlichkeit in einem Bereich und Photonen bei Übergängen; für ein
 * Elektron (nm) oder ein Nukleon im Atomkern (fm).
 */
export default defineSimulation({
  id: 'potentialtopf',
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'teil',
      type: 'choice',
      label: L('Teilchen', 'Particle'),
      options: [
        { value: 'e', label: L('Elektron (Topf in nm)', 'electron (well in nm)') },
        { value: 'n', label: L('Nukleon im Kern (Topf in fm)', 'nucleon in a nucleus (well in fm)') },
      ],
      default: 'e',
    },
    { key: 'Lnm', type: 'number', label: L('Breite des Topfs L', 'Width of the well L'), min: 0.2, max: 2, step: 0.05, default: 1, unit: 'nm', visibleIf: (v) => v.teil === 'e' },
    { key: 'Lfm', type: 'number', label: L('Breite des Topfs L', 'Width of the well L'), min: 4, max: 20, step: 1, default: 10, unit: 'fm', visibleIf: (v) => v.teil === 'n' },
    { key: 'n', type: 'number', label: L('Zustand n', 'State n'), min: 1, max: NMAX, step: 1, default: 1 },
    {
      key: 'zeige',
      type: 'choice',
      label: L('Diagramm', 'Graph'),
      options: [
        { value: 'psi2', label: L('|ψ|² (Wahrscheinlichkeitsdichte)', '|ψ|² (probability density)') },
        { value: 'psi', label: L('ψ (Wellenfunktion)', 'ψ (wave function)') },
      ],
      default: 'psi2',
    },
    { key: 'xa', type: 'number', label: L('Bereich von', 'Region from'), min: 0, max: 1, step: 0.05, default: 0.4, unit: '· L' },
    { key: 'xb', type: 'number', label: L('Bereich bis', 'Region to'), min: 0, max: 1, step: 0.05, default: 0.6, unit: '· L' },
    { key: 'n2', type: 'number', label: L('Übergang hinunter nach', 'Transition down to'), min: 1, max: NMAX, step: 1, default: 1 },
  ],
  hint: L(
    'Links die erlaubten Energiestufen mit ihren stehenden Wellen, rechts die Wahrscheinlichkeitsdichte. Die Fläche im markierten Bereich ist die Aufenthaltswahrscheinlichkeit.',
    'Left: the allowed energy levels with their standing waves; right: the probability density. The area in the marked region is the probability of finding the particle there.',
  ),
  readouts: [
    { key: 'En', label: L('Energie', 'Energy'), spoiler: true },
    { key: 'lam', label: L('de-Broglie-Wellenlänge', 'de Broglie wavelength') },
    { key: 'P', label: L('Aufenthaltswahrscheinlichkeit im Bereich', 'Probability in the region'), spoiler: true },
    { key: 'ph', label: L('Photon beim Übergang', 'Photon at the transition'), spoiler: true },
  ],
  presets: [
    { id: 'g', label: L('Grundzustand', 'Ground state'), values: { teil: 'e', n: 1 } },
    { id: 'n2', label: L('n = 2: Mitte leer', 'n = 2: empty middle'), values: { teil: 'e', n: 2, xa: 0.45, xb: 0.55 } },
    { id: 'big', label: L('Großes n: fast gleichmäßig', 'Large n: almost uniform'), values: { teil: 'e', n: 5, xa: 0, xb: 0.5 } },
    { id: 'farbe', label: L('Sichtbares Licht (0,65 nm)', 'Visible light (0.65 nm)'), values: { teil: 'e', Lnm: 0.65, n: 2, n2: 1 } },
    { id: 'kern', label: L('Nukleon im Kern', 'Nucleon in a nucleus'), values: { teil: 'n', Lfm: 10, n: 2, n2: 1 } },
  ],
  strings: {
    de: {
      canvas: 'Potentialtopf mit Energiestufen und eingezeichneten stehenden Wellen, daneben das Diagramm der Wellenfunktion oder Wahrscheinlichkeitsdichte mit markiertem Bereich',
      Eval: 'E_{n} = n² · h² / (8 m L²) ≈ {E} (E₁ ≈ {E1})',
      lamVal: 'λ = 2L / n = {l} – genau {n} halbe Wellen passen in den Topf',
      Pval: 'P ≈ {P} % (klassisch wären es {k} %)',
      phVal: 'ΔE ≈ {dE}, λ = h c / ΔE ≈ {l} ({where})',
      phNone: 'Wähle einen tieferen Zustand als n.',
      x: 'x / L',
      psi: 'ψ',
      psi2: '|ψ|²',
      vis: 'sichtbares Licht',
      ir: 'Infrarot',
      uv: 'Ultraviolett',
      gamma: 'Gammastrahlung',
      xray: 'Röntgen',
      level: 'n = {n}',
    },
    en: {
      canvas: 'Potential well with energy levels and standing waves drawn in, next to it the graph of the wave function or probability density with a marked region',
      Eval: 'E_{n} = n² · h² / (8 m L²) ≈ {E} (E₁ ≈ {E1})',
      lamVal: 'λ = 2L / n = {l} – exactly {n} half waves fit into the well',
      Pval: 'P ≈ {P} % (classically {k} %)',
      phVal: 'ΔE ≈ {dE}, λ = h c / ΔE ≈ {l} ({where})',
      phNone: 'Choose a lower state than n.',
      x: 'x / L',
      psi: 'ψ',
      psi2: '|ψ|²',
      vis: 'visible light',
      ir: 'infrared',
      uv: 'ultraviolet',
      gamma: 'gamma rays',
      xray: 'X-rays',
      level: 'n = {n}',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 2],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const nuc = () => p.teil === 'n';
    const Lm = () => (nuc() ? p.Lfm * 1e-15 : p.Lnm * 1e-9);
    const mass = () => (nuc() ? MN : ME);
    const a = () => Math.min(p.xa, p.xb);
    const b = () => Math.max(p.xa, p.xb);

    function energyText(J: number): string {
      const eV = J / E;
      if (eV >= 1e6) return `${fmt.num(eV / 1e6, 2)} MeV`;
      if (eV >= 1e3) return `${fmt.num(eV / 1e3, 2)} keV`;
      return `${fmt.num(eV, eV < 1 ? 3 : 2)} eV`;
    }
    function lenText(m: number): string {
      if (m >= 1e-6) return `${fmt.num(m * 1e6, 2)} µm`;
      if (m >= 1e-9) return `${fmt.num(m * 1e9, m < 1e-8 ? 2 : 0)} nm`;
      if (m >= 1e-12) return `${fmt.num(m * 1e12, 1)} pm`;
      return `${fmt.num(m * 1e15, 1)} fm`;
    }
    function region(l: number): string {
      if (l > 780e-9) return ctx.t('ir');
      if (l >= 380e-9) return ctx.t('vis');
      if (l >= 10e-9) return ctx.t('uv');
      if (l >= 1e-11) return ctx.t('xray');
      return ctx.t('gamma');
    }

    function setupPlot(): void {
      const peak = p.zeige === 'psi2' ? 2 : 1.5;
      plot.setRangePadded([0, 1], p.zeige === 'psi2' ? [0, peak * 1.1] : [-peak, peak], { left: 40, right: 14, top: 22, bottom: 24 });
      plot.setAxes({ x: { label: ctx.t('x') }, y: { label: ctx.t(p.zeige) } });
    }

    function updateReadouts(): void {
      const L0 = Lm();
      const En = energy(p.n, L0, mass());
      ctx.readout('En', tr('Eval', { n: p.n, E: energyText(En), E1: energyText(energy(1, L0, mass())) }).replace('E_{n}', `E${'₀₁₂₃₄₅₆₇₈₉'[p.n]}`));
      ctx.readout('lam', tr('lamVal', { l: lenText(deBroglie(p.n, L0)), n: p.n }));
      const P = probability(p.n, a() * L0, b() * L0, L0);
      ctx.readout('P', tr('Pval', { P: fmt.num(100 * P, 1), k: fmt.num(100 * (b() - a()), 0) }));
      if (p.n2 >= p.n) ctx.readout('ph', ctx.t('phNone'));
      else {
        const l = transitionWavelength(p.n, p.n2, L0, mass());
        ctx.readout('ph', tr('phVal', { dE: energyText(energy(p.n, L0, mass()) - energy(p.n2, L0, mass())), l: lenText(l), where: region(l) }));
      }
    }

    function drawWell(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + r.w * 0.22;
      const x1 = r.x + r.w * 0.82;
      const top = r.y + 24;
      const bot = r.y + r.h - 24;
      // Wände
      g.fillStyle = withAlpha(th.muted, 0.35);
      g.fillRect(x0 - 12, top, 12, bot - top);
      g.fillRect(x1, top, 12, bot - top);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, top);
      g.lineTo(x0, bot);
      g.lineTo(x1, bot);
      g.lineTo(x1, top);
      g.stroke();
      const yOf = (n: number) => bot - ((bot - top - 30) * n * n) / (NMAX * NMAX);
      for (let n = 1; n <= NMAX; n++) {
        const y = yOf(n);
        const sel = n === p.n;
        g.strokeStyle = sel ? th.series[1]! : withAlpha(th.muted, 0.7);
        g.lineWidth = sel ? 2.5 : 1.2;
        g.setLineDash(sel ? [] : [4, 4]);
        g.beginPath();
        g.moveTo(x0, y);
        g.lineTo(x1, y);
        g.stroke();
        g.setLineDash([]);
        text(g, tr('level', { n }), x0 - 18, y, { font: `${sel ? 700 : 500} 11px ${th.font}`, color: sel ? th.series[1]! : th.muted, align: 'right' });
        // Welle auf der Stufe (nur ausgewählte und Grundzustand deutlich)
        const amp = Math.min(14, (yOf(n) - yOf(n + 1 > NMAX ? NMAX : n + 1)) * 0.35 + (n === NMAX ? 10 : 0));
        g.strokeStyle = sel ? th.series[0]! : withAlpha(th.series[0]!, 0.35);
        g.lineWidth = sel ? 2.5 : 1.2;
        g.beginPath();
        for (let i = 0; i <= 80; i++) {
          const f = i / 80;
          const yy = y - Math.max(6, amp) * Math.sin(n * Math.PI * f);
          const xx = x0 + (x1 - x0) * f;
          if (i) g.lineTo(xx, yy);
          else g.moveTo(xx, yy);
        }
        g.stroke();
      }
      // Übergangspfeil
      if (p.n2 < p.n) {
        const xa = x1 + 26;
        g.strokeStyle = th.series[3]!;
        g.fillStyle = th.series[3]!;
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(xa, yOf(p.n));
        g.lineTo(xa, yOf(p.n2) - 8);
        g.stroke();
        g.beginPath();
        g.moveTo(xa, yOf(p.n2));
        g.lineTo(xa - 6, yOf(p.n2) - 10);
        g.lineTo(xa + 6, yOf(p.n2) - 10);
        g.closePath();
        g.fill();
      }
      text(g, `L = ${nuc() ? `${fmt.num(p.Lfm, 0)} fm` : `${fmt.num(p.Lnm, 2)} nm`}`, (x0 + x1) / 2, bot + 14, { font: `600 12px ${th.font}`, color: th.text });
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const f = (x: number) => {
        const v = psi(p.n, x, 1);
        return p.zeige === 'psi2' ? v * v : v;
      };
      if (p.zeige === 'psi2') {
        const pts: [number, number][] = [[a(), 0]];
        for (let i = 0; i <= 100; i++) {
          const x = a() + ((b() - a()) * i) / 100;
          pts.push([x, f(x)]);
        }
        pts.push([b(), 0]);
        plot.polygon(pts, { fill: withAlpha(th.series[1]!, 0.25) });
        plot.hline(1, { color: withAlpha(th.muted, 0.6), width: 1.5, dash: [5, 5] });
      } else {
        plot.vline(a(), { color: withAlpha(th.series[1]!, 0.5), width: 1, dash: [4, 4] });
        plot.vline(b(), { color: withAlpha(th.series[1]!, 0.5), width: 1, dash: [4, 4] });
      }
      plot.fn(f, { color: th.series[0]!, width: 3, from: 0, to: 1 });
      plot.end();
    }

    return {
      update() {
        setupPlot();
        updateReadouts();
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        drawWell(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
