import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { ALPHA, gasVolume, lengthChange, waterDensity, type SolidId } from './model';

const L = (de: string, en: string) => ({ de, en });
const T0 = 20;
/** Vergrößerung der Längenänderung in der Zeichnung */
const ZOOM = 400;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.52);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Wärmeausdehnung: Stäbe und Bimetall, Gas bei konstantem Druck,
 * Dichteanomalie des Wassers mit Temperaturschichtung eines Sees.
 */
export default defineSimulation({
  id: 'waermeausdehnung',
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Stoff', 'Substance'),
      options: [
        { value: 'fest', label: L('Feste Körper und Bimetall', 'Solids and bimetal') },
        { value: 'gas', label: L('Gas', 'Gas') },
        { value: 'wasser', label: L('Anomalie des Wassers', 'Anomaly of water') },
      ],
      default: 'fest',
    },
    {
      key: 'mat',
      type: 'choice',
      label: L('Material des oberen Stabs', 'Material of the upper rod'),
      options: [
        { value: 'aluminium', label: L('Aluminium', 'aluminium') },
        { value: 'copper', label: L('Kupfer', 'copper') },
        { value: 'steel', label: L('Stahl', 'steel') },
        { value: 'glass', label: L('Glas', 'glass') },
        { value: 'invar', label: L('Invar', 'Invar') },
      ],
      default: 'aluminium',
      visibleIf: (v) => v.mode === 'fest',
    },
    { key: 't', type: 'number', label: L('Temperatur', 'Temperature'), min: -20, max: 100, step: 1, default: 60, unit: '°C', visibleIf: (v) => v.mode !== 'wasser' },
    { key: 'L0', type: 'number', label: L('Länge bei 20 °C', 'Length at 20 °C'), min: 1, max: 100, step: 1, default: 1, unit: 'm', visibleIf: (v) => v.mode === 'fest' },
    { key: 'luft', type: 'number', label: L('Lufttemperatur über dem See', 'Air temperature above the lake'), min: -10, max: 20, step: 1, default: 2, unit: '°C', visibleIf: (v) => v.mode === 'wasser' },
  ],
  hint: (v) =>
    v.mode === 'fest'
      ? L('Die Längenänderung ist stark vergrößert gezeichnet. Unten: Stahl als Vergleich.', 'The change in length is drawn strongly magnified. Below: steel for comparison.')
      : v.mode === 'gas'
        ? L('Gase dehnen sich viel stärker aus als feste Stoffe – alle etwa gleich.', 'Gases expand much more than solids – all of them by about the same amount.')
        : L('Wasser ist bei 4 °C am schwersten. Darum frieren Seen von oben zu.', 'Water is densest at 4 °C. That is why lakes freeze from the top.'),
  readouts: [
    { key: 'dL', label: L('Längenänderung', 'Change in length'), spoiler: true },
    { key: 'V', label: L('Volumen', 'Volume'), spoiler: true },
    { key: 'rho', label: L('Dichte', 'Density'), spoiler: true },
    { key: 'lake', label: L('Im See', 'In the lake') },
  ],
  presets: [
    { id: 'alu', label: L('Aluminium gegen Stahl', 'Aluminium vs steel'), values: { mode: 'fest', mat: 'aluminium', t: 80 } },
    { id: 'bridge', label: L('Stahlbrücke 100 m im Sommer', 'Steel bridge 100 m in summer'), values: { mode: 'fest', mat: 'steel', L0: 100, t: 60 } },
    { id: 'gas', label: L('Gas erwärmen', 'Heat a gas'), values: { mode: 'gas', t: 80 } },
    { id: 'cold', label: L('Gas abkühlen', 'Cool a gas'), values: { mode: 'gas', t: -20 } },
    { id: 'autumn', label: L('See im Herbst', 'Lake in autumn'), values: { mode: 'wasser', luft: 8 } },
    { id: 'winter', label: L('See im Winter', 'Lake in winter'), values: { mode: 'wasser', luft: -6 } },
  ],
  strings: {
    de: {
      canvas: 'Wärmeausdehnung: zwei Stäbe und ein Bimetallstreifen, ein Kolben mit Gas oder ein See mit Temperaturschichtung; daneben ein Diagramm',
      dLVal: 'ΔL = α · L₀ · ΔT = {a} · 10⁻⁶ 1/K · {L} m · {dT} K ≈ {d}',
      steelVal: 'Stahl zum Vergleich: {d}',
      Vval: 'V = V₀ · T / T₀ = 1 L · {T} K / 293 K ≈ {V} L',
      rhoVal: 'Wasser bei {t} °C: {r} kg/m³ (am dichtesten bei 4 °C: 999,97 kg/m³; Eis: 917 kg/m³)',
      lakeWarm: 'Oben warmes, leichteres Wasser, unten 4 °C.',
      lakeCool: 'Das Oberflächenwasser kühlt ab, wird schwerer und sinkt, bis überall 4 °C herrschen.',
      lakeCold: 'Unter 4 °C wird das Wasser wieder leichter und bleibt oben.',
      lakeIce: 'Oben bildet sich Eis, es schwimmt. Darunter bleibt am Grund 4 °C warmes Wasser – Fische überleben.',
      steel: 'Stahl',
      bimetal: 'Bimetall',
      tC: 'ϑ in °C',
      Vl: 'V in L',
      rho: 'ρ in kg/m³',
      zero: 'absoluter Nullpunkt −273 °C',
      ice: 'Eis',
      bottom: 'Grund',
      zoomNote: 'Längenänderung {z}-fach vergrößert',
      m_aluminium: 'Aluminium',
      m_copper: 'Kupfer',
      m_steel: 'Stahl',
      m_glass: 'Glas',
      m_invar: 'Invar',
    },
    en: {
      canvas: 'Thermal expansion: two rods and a bimetallic strip, a piston with gas or a lake with temperature layers; next to it a graph',
      dLVal: 'ΔL = α · L₀ · ΔT = {a} · 10⁻⁶ 1/K · {L} m · {dT} K ≈ {d}',
      steelVal: 'steel for comparison: {d}',
      Vval: 'V = V₀ · T / T₀ = 1 L · {T} K / 293 K ≈ {V} L',
      rhoVal: 'water at {t} °C: {r} kg/m³ (densest at 4 °C: 999.97 kg/m³; ice: 917 kg/m³)',
      lakeWarm: 'Warm, lighter water on top, 4 °C at the bottom.',
      lakeCool: 'Surface water cools, gets heavier and sinks until it is 4 °C everywhere.',
      lakeCold: 'Below 4 °C water becomes lighter again and stays on top.',
      lakeIce: 'Ice forms on top and floats. Below it 4 °C water remains at the bottom – fish survive.',
      steel: 'steel',
      bimetal: 'bimetal',
      tC: 'ϑ in °C',
      Vl: 'V in L',
      rho: 'ρ in kg/m³',
      zero: 'absolute zero −273 °C',
      ice: 'ice',
      bottom: 'bottom',
      zoomNote: 'change in length magnified {z} times',
      m_aluminium: 'aluminium',
      m_copper: 'copper',
      m_steel: 'steel',
      m_glass: 'glass',
      m_invar: 'Invar',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const len = (m: number) => (m >= 1 ? `${fmt.num(m, 3)} m` : m >= 0.01 || m <= -0.01 ? `${fmt.num(m * 100, 2)} cm` : `${fmt.num(m * 1000, 2)} mm`);

    function setupPlot(): void {
      if (p.mode === 'fest') {
        plot.setRangePadded([-20, 100], [-1.6, 2.2], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: 'ΔL in mm/m' } });
      } else if (p.mode === 'gas') {
        plot.setRangePadded([-280, 110], [0, 1.4], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: ctx.t('Vl') } });
      } else {
        plot.setRangePadded([0, 20], [998, 1000.2], { left: 62, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('tC') }, y: { label: ctx.t('rho') } });
      }
    }

    /** Temperaturprofil im See von oben (0) nach unten (1). */
    function lakeProfile(z: number): number {
      const a = p.luft;
      if (a >= 4) return 4 + (a - 4) * Math.max(0, 1 - z / 0.35);
      if (a > 0) return 4 - (4 - a) * Math.max(0, 1 - z / 0.25);
      // unter Eis: 0 °C an der Eisunterseite, 4 °C am Grund
      return Math.min(4, 4 * z ** 0.5);
    }

    function updateReadouts(): void {
      for (const k of ['dL', 'V', 'rho', 'lake']) ctx.readout(k, null);
      if (p.mode === 'fest') {
        const a = ALPHA[p.mat as SolidId];
        const d = lengthChange(a, p.L0, p.t - T0);
        ctx.readout('dL', `${tr('dLVal', { a: fmt.num(a * 1e6, 1), L: fmt.num(p.L0, 0), dT: fmt.num(p.t - T0, 0), d: len(d) })}; ${tr('steelVal', { d: len(lengthChange(ALPHA.steel, p.L0, p.t - T0)) })}`);
      } else if (p.mode === 'gas') {
        ctx.readout('V', tr('Vval', { T: fmt.num(p.t + 273.15, 0), V: fmt.num(gasVolume(1, T0, p.t), 3) }));
      } else {
        const tt = Math.max(0, p.luft);
        ctx.readout('rho', tr('rhoVal', { t: fmt.num(tt, 0), r: fmt.num(waterDensity(tt), 2) }));
        ctx.readout('lake', ctx.t(p.luft >= 4 ? (p.luft > 6 ? 'lakeWarm' : 'lakeCool') : p.luft > 0 ? 'lakeCold' : 'lakeIce'));
      }
    }

    function tempColor(t: number, lo: number, hi: number): string {
      const th = ctx.theme;
      const k = Math.max(0, Math.min(1, (t - lo) / (hi - lo)));
      return k > 0.5 ? withAlpha(th.series[1]!, 0.25 + 0.7 * (k - 0.5) * 2) : withAlpha(th.series[0]!, 0.25 + 0.7 * (0.5 - k) * 2);
    }

    function drawSolids(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const x0 = r.x + 30;
      const base = r.w * 0.6;
      const dT = p.t - T0;
      const rods: [string, number][] = [
        [ctx.t(`m_${p.mat}`), ALPHA[p.mat as SolidId]],
        [ctx.t('steel'), ALPHA.steel],
      ];
      const yTop = r.y + r.h * 0.18;
      rods.forEach(([name, a], k) => {
        const y = yTop + k * 54;
        const ext = a * dT * ZOOM * base;
        g.fillStyle = tempColor(p.t, -20, 100);
        g.fillRect(x0, y, base + ext, 22);
        g.strokeStyle = th.text;
        g.lineWidth = 1.5;
        g.strokeRect(x0, y, base + ext, 22);
        g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(x0 + base, y - 6);
        g.lineTo(x0 + base, y + 28);
        g.stroke();
        g.setLineDash([]);
        text(g, name, x0 + 8, y + 11, { font: `700 12px ${th.font}`, color: th.text, align: 'left' });
      });
      // Wand links
      g.fillStyle = th.muted;
      g.fillRect(x0 - 10, yTop - 10, 10, 54 + 42);
      text(g, tr('zoomNote', { z: ZOOM }), x0, yTop - 22, { font: `${narrow ? 10 : 11}px ${th.font}`, color: th.muted, align: 'left' });
      // Bimetall: oben das gewählte Material, unten Stahl
      const da = (ALPHA[p.mat as SolidId] - ALPHA.steel) * dT;
      const bx = x0;
      const by = r.y + r.h * 0.72;
      const bl = base * 0.9;
      // Krümmung (übertrieben): positiver Wert biegt nach unten (oben dehnt sich mehr)
      const curv = Math.max(-1, Math.min(1, da * 4000));
      const pts = (off: number): [number, number][] => {
        const a: [number, number][] = [];
        for (let i = 0; i <= 40; i++) {
          const s = i / 40;
          a.push([bx + bl * s, by + off + curv * 70 * s * s]);
        }
        return a;
      };
      g.lineWidth = 8;
      g.lineCap = 'butt';
      for (const [off, col] of [
        [-4, th.series[3]!],
        [4, th.muted],
      ] as const) {
        g.strokeStyle = col;
        g.beginPath();
        pts(off).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
      }
      g.fillStyle = th.muted;
      g.fillRect(bx - 10, by - 16, 10, 32);
      text(g, `${ctx.t('bimetal')}: ${ctx.t(`m_${p.mat}`)} / ${ctx.t('steel')}`, bx, by - 28, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.text, align: 'left' });
    }

    function drawGas(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cw = Math.min(r.w * 0.36, 150);
      const cx = r.x + r.w / 2;
      const bottom = r.y + r.h - 30;
      const maxH = r.h - 90;
      const V = gasVolume(1, T0, p.t);
      const h = (maxH * V) / 1.4;
      g.fillStyle = tempColor(p.t, -20, 100);
      g.fillRect(cx - cw / 2, bottom - h, cw, h);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx - cw / 2, bottom - maxH);
      g.lineTo(cx - cw / 2, bottom);
      g.lineTo(cx + cw / 2, bottom);
      g.lineTo(cx + cw / 2, bottom - maxH);
      g.stroke();
      g.fillStyle = th.muted;
      g.fillRect(cx - cw / 2 + 2, bottom - h - 12, cw - 4, 12);
      g.fillRect(cx - 4, bottom - h - 50, 8, 38);
      // Markierung bei 20 °C
      const h0 = maxH / 1.4;
      g.setLineDash([5, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - cw / 2 - 12, bottom - h0);
      g.lineTo(cx + cw / 2 + 12, bottom - h0);
      g.stroke();
      g.setLineDash([]);
      text(g, '20 °C', cx + cw / 2 + 16, bottom - h0, { font: `600 11px ${th.font}`, color: th.muted, align: 'left' });
      text(g, `${fmt.num(V, 2)} L`, cx, bottom - h / 2, { font: `700 14px ${th.font}`, color: th.text });
    }

    function drawLake(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + 20;
      const w = r.w - 40;
      const top = r.y + 50;
      const bot = r.y + r.h - 24;
      const ice = p.luft < 0 ? Math.min(30, 6 + -p.luft * 3) : 0;
      // Wasser in Streifen nach Temperatur
      const n = 40;
      for (let i = 0; i < n; i++) {
        const z = i / n;
        const y = top + ice + (bot - top - ice) * z;
        g.fillStyle = tempColor(lakeProfile(z), 0, 12);
        g.fillRect(x0, y, w, (bot - top - ice) / n + 1);
      }
      if (ice > 0) {
        g.fillStyle = 'rgba(224,242,254,0.95)';
        g.fillRect(x0, top, w, ice);
        text(g, `${ctx.t('ice')} 0 °C`, x0 + w / 2, top + ice / 2, { font: `700 12px ${th.font}`, color: '#0f172a' });
      }
      // Luft
      text(g, `${fmt.num(p.luft, 0)} °C`, x0 + w / 2, top - 22, { font: `700 14px ${th.font}`, color: th.text });
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.strokeRect(x0, top, w, bot - top);
      // Temperaturen am Rand
      for (const z of [0.1, 0.5, 0.9]) {
        const y = top + ice + (bot - top - ice) * z;
        text(g, `${fmt.num(lakeProfile(z), 1)} °C`, x0 + 8, y, { font: `600 12px ${th.font}`, color: th.text, align: 'left' });
      }
      text(g, ctx.t('bottom'), x0 + w - 8, bot - 10, { font: `600 11px ${th.font}`, color: th.muted, align: 'right' });
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'fest') {
        const a = ALPHA[p.mat as SolidId];
        plot.fn((t) => a * (t - T0) * 1000, { color: th.series[3]!, width: 3, from: -20, to: 100 });
        plot.fn((t) => ALPHA.steel * (t - T0) * 1000, { color: th.muted, width: 2, from: -20, to: 100 });
        plot.point(p.t, a * (p.t - T0) * 1000, { color: th.series[3]!, radius: 6 });
      } else if (p.mode === 'gas') {
        plot.fn((t) => gasVolume(1, T0, t), { color: withAlpha(th.series[1]!, 0.5), width: 2, dash: [6, 5], from: -273.15, to: -20 });
        plot.fn((t) => gasVolume(1, T0, t), { color: th.series[1]!, width: 3, from: -20, to: 100 });
        plot.point(-273.15, 0, { color: th.text, radius: 5 });
        plot.text(-273.15, 0.06, ctx.t('zero'), { color: th.muted, size: 11, offset: [4, -6] });
        plot.point(p.t, gasVolume(1, T0, p.t), { color: th.series[1]!, radius: 6 });
      } else {
        plot.fn((t) => waterDensity(t), { color: th.series[0]!, width: 3, from: 0, to: 20 });
        plot.vline(3.98, { color: withAlpha(th.muted, 0.7), width: 1.5, dash: [5, 4] });
        plot.text(3.98, 1000.05, '4 °C', { color: th.muted, size: 12, offset: [4, -4] });
        const tt = Math.max(0, p.luft);
        plot.point(tt, waterDensity(tt), { color: th.series[0]!, radius: 6 });
      }
      plot.end();
    }

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode')) setupPlot();
        updateReadouts();
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        if (p.mode === 'fest') drawSolids(s.scene);
        else if (p.mode === 'gas') drawGas(s.scene);
        else drawLake(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
