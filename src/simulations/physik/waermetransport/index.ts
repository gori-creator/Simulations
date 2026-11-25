import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { conductionPower, conductionStep, diffusivity, MATERIALS, netRadiation, radiatedPower, uValue, wallTemperatures, type MaterialId } from './model';

const L = (de: string, en: string) => ({ de, en });

/** Stab: 20 cm in 41 Stützstellen, Querschnitt 1 cm². */
const ROD_LEN = 0.2;
const N = 41;
const AREA = 1e-4;
/** Wandfläche für die Dämmung (m²). */
const WALL_AREA = 10;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.56);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Wärmetransport: Wärmeleitung im Stab (Materialvergleich), Wärmeströmung im
 * Wassertopf, Wärmestrahlung (Stefan-Boltzmann) und Dämmung einer Hauswand.
 */
export default defineSimulation({
  id: 'waermetransport',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.8 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Art des Wärmetransports', 'Kind of heat transfer'),
      options: [
        { value: 'leitung', label: L('Wärmeleitung', 'Conduction') },
        { value: 'stroemung', label: L('Wärmeströmung', 'Convection') },
        { value: 'strahlung', label: L('Wärmestrahlung', 'Radiation') },
        { value: 'daemmung', label: L('Wärmedämmung (Hauswand)', 'Insulation (house wall)') },
      ],
      default: 'leitung',
    },
    {
      key: 'mat',
      type: 'choice',
      label: L('Material des Stabs', 'Material of the rod'),
      options: [
        { value: 'copper', label: L('Kupfer', 'copper') },
        { value: 'aluminium', label: L('Aluminium', 'aluminium') },
        { value: 'iron', label: L('Eisen', 'iron') },
        { value: 'glass', label: L('Glas', 'glass') },
        { value: 'wood', label: L('Holz', 'wood') },
      ],
      default: 'copper',
      visibleIf: (v) => v.mode === 'leitung',
    },
    { key: 'th', type: 'number', label: L('Temperatur heißes Ende', 'Temperature of hot end'), min: 30, max: 100, step: 5, default: 100, unit: '°C', visibleIf: (v) => v.mode === 'leitung' },
    {
      key: 'raffer',
      type: 'choice',
      label: L('Zeitraffer', 'Time-lapse'),
      options: [
        { value: '100', label: L('100-fach', '100×') },
        { value: '1000', label: L('1000-fach', '1000×') },
        { value: '10000', label: L('10 000-fach', '10,000×') },
      ],
      default: '100',
      visibleIf: (v) => v.mode === 'leitung',
    },
    { key: 'heiz', type: 'number', label: L('Heizleistung', 'Heating power'), min: 0, max: 100, step: 5, default: 60, unit: '%', visibleIf: (v) => v.mode === 'stroemung' },
    { key: 'tk', type: 'number', label: L('Temperatur des Körpers', 'Temperature of the body'), min: 20, max: 800, step: 10, default: 200, unit: '°C', visibleIf: (v) => v.mode === 'strahlung' },
    {
      key: 'surf',
      type: 'choice',
      label: L('Oberfläche', 'Surface'),
      options: [
        { value: '0.95', label: L('matt schwarz', 'matt black') },
        { value: '0.5', label: L('grau', 'grey') },
        { value: '0.05', label: L('blank (Metall)', 'shiny (metal)') },
      ],
      default: '0.95',
      visibleIf: (v) => v.mode === 'strahlung',
    },
    { key: 'dw', type: 'number', label: L('Mauerwerk (Ziegel)', 'Masonry (brick)'), min: 10, max: 50, step: 1, default: 24, unit: 'cm', visibleIf: (v) => v.mode === 'daemmung' },
    { key: 'di', type: 'number', label: L('Dämmung (Styropor)', 'Insulation (polystyrene)'), min: 0, max: 30, step: 1, default: 0, unit: 'cm', visibleIf: (v) => v.mode === 'daemmung' },
    { key: 'ta', type: 'number', label: L('Außentemperatur', 'Outside temperature'), min: -20, max: 15, step: 1, default: -5, unit: '°C', visibleIf: (v) => v.mode === 'daemmung' },
  ],
  hint: (v) =>
    v.mode === 'leitung'
      ? L('Das linke Ende wird heiß gehalten, das rechte kalt. Vergleiche die Materialien.', 'The left end is kept hot, the right end cold. Compare the materials.')
      : v.mode === 'stroemung'
        ? L('Das erwärmte Wasser steigt auf und nimmt die Wärme mit.', 'The heated water rises and carries the heat with it.')
        : v.mode === 'strahlung'
          ? L('Jeder Körper strahlt – je heißer, desto viel mehr. Auch durch das Vakuum.', 'Every body radiates – the hotter, the much more. Even through a vacuum.')
          : L('Innen 20 °C, außen kalt. Wie viel Wärme geht durch die Wand verloren?', 'Inside 20 °C, outside cold. How much heat is lost through the wall?'),
  actions: [{ id: 'reset', label: L('Neu starten', 'Restart'), visibleIf: (v) => v.mode === 'leitung' }],
  readouts: [
    { key: 'time', label: L('Zeit', 'Time') },
    { key: 'lam', label: L('Wärmeleitfähigkeit', 'Thermal conductivity') },
    { key: 'P', label: L('Wärmestrom', 'Heat flow'), spoiler: true },
    { key: 'rad', label: L('Abgestrahlte Leistung', 'Radiated power'), spoiler: true },
    { key: 'U', label: L('U-Wert', 'U-value'), spoiler: true },
    { key: 'loss', label: L('Verlust durch 10 m² Wand', 'Loss through 10 m² of wall'), spoiler: true },
  ],
  presets: [
    { id: 'cu', label: L('Kupfer', 'Copper'), values: { mode: 'leitung', mat: 'copper' } },
    { id: 'wood', label: L('Holz', 'Wood'), values: { mode: 'leitung', mat: 'wood', raffer: '10000' } },
    { id: 'conv', label: L('Wassertopf', 'Pot of water'), values: { mode: 'stroemung' } },
    { id: 'rad', label: L('Herdplatte (500 °C)', 'Hotplate (500 °C)'), values: { mode: 'strahlung', tk: 500 } },
    { id: 'old', label: L('Altbau ohne Dämmung', 'Old wall without insulation'), values: { mode: 'daemmung', dw: 24, di: 0 } },
    { id: 'new', label: L('Mit 16 cm Dämmung', 'With 16 cm insulation'), values: { mode: 'daemmung', dw: 24, di: 16 } },
  ],
  strings: {
    de: {
      canvas: 'Wärmetransport: ein Stab zwischen heißem und kaltem Ende mit Temperaturverlauf, ein beheizter Wassertopf mit Strömung, ein strahlender Körper oder eine Hauswand mit Dämmung und Temperaturverlauf',
      x: 'x in cm',
      T: 'T in °C',
      hot: 'heiß',
      cold: 'kalt',
      inside: 'innen',
      outside: 'außen',
      brick: 'Ziegel',
      insul: 'Dämmung',
      lamVal: 'λ = {v} W/(m · K)',
      Pval: 'P = λ · A · ΔT / l ≈ {P} W (Stab 20 cm, 1 cm², im Gleichgewicht)',
      radVal: 'P = ε · σ · A · T⁴ ≈ {P} W je m² (T = {K} K); Netto an die 20 °C warme Umgebung: {N} W je m²',
      Uval: 'U = 1 / (R_si + d₁/λ₁ + d₂/λ₂ + R_se) ≈ {U} W/(m² · K)',
      lossVal: 'P = U · A · ΔT ≈ {P} W, also {E} kWh pro Tag',
      water: 'Wasser',
      heater: 'Heizplatte',
      vacuum: 'Strahlung braucht keinen Stoff',
      sec: '{s} s',
      min: '{m} min {s} s',
      h: '{h} h {m} min',
      m_copper: 'Kupfer',
      m_aluminium: 'Aluminium',
      m_iron: 'Eisen',
      m_glass: 'Glas',
      m_wood: 'Holz',
    },
    en: {
      canvas: 'Heat transfer: a rod between a hot and a cold end with a temperature profile, a heated pot of water with convection, a radiating body or a house wall with insulation and temperature profile',
      x: 'x in cm',
      T: 'T in °C',
      hot: 'hot',
      cold: 'cold',
      inside: 'inside',
      outside: 'outside',
      brick: 'brick',
      insul: 'insulation',
      lamVal: 'λ = {v} W/(m · K)',
      Pval: 'P = λ · A · ΔT / l ≈ {P} W (rod 20 cm, 1 cm², steady state)',
      radVal: 'P = ε · σ · A · T⁴ ≈ {P} W per m² (T = {K} K); net to the 20 °C surroundings: {N} W per m²',
      Uval: 'U = 1 / (R_si + d₁/λ₁ + d₂/λ₂ + R_se) ≈ {U} W/(m² · K)',
      lossVal: 'P = U · A · ΔT ≈ {P} W, i.e. {E} kWh per day',
      water: 'water',
      heater: 'hotplate',
      vacuum: 'radiation needs no material',
      sec: '{s} s',
      min: '{m} min {s} s',
      h: '{h} h {m} min',
      m_copper: 'copper',
      m_aluminium: 'aluminium',
      m_iron: 'iron',
      m_glass: 'glass',
      m_wood: 'wood',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 20],
      y: [0, 100],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const T_COLD = 20;
    let T: number[] = [];
    let time = 0;
    let anim = 0;
    function resetRod(): void {
      T = Array.from({ length: N }, (_, i) => (i === 0 ? p.th : T_COLD));
      time = 0;
    }
    resetRod();

    /** Farbe für eine Temperatur zwischen kalt (blau) und heiß (rot). */
    function tempColor(t: number, lo: number, hi: number): string {
      const th = ctx.theme;
      const k = Math.max(0, Math.min(1, (t - lo) / Math.max(1e-9, hi - lo)));
      const a = hexToRgb(th.series[0]!);
      const b = hexToRgb(th.series[1]!);
      const m = (i: number) => Math.round(a[i]! + (b[i]! - a[i]!) * k);
      return `rgb(${m(0)},${m(1)},${m(2)})`;
    }
    function hexToRgb(c: string): number[] {
      const s = c.trim();
      if (s.startsWith('#')) {
        const h = s.length === 4 ? s.replace(/#(.)(.)(.)/, '#$1$1$2$2$3$3') : s;
        return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      }
      const m = s.match(/\d+(\.\d+)?/g);
      return m ? m.slice(0, 3).map(Number) : [128, 128, 128];
    }

    function timeText(s: number): string {
      if (s < 60) return tr('sec', { s: fmt.num(s, 0) });
      if (s < 3600) return tr('min', { m: Math.floor(s / 60), s: Math.floor(s % 60) });
      return tr('h', { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60) });
    }

    function layers() {
      return [
        { lambda: MATERIALS.brick.lambda, d: p.dw / 100 },
        { lambda: MATERIALS.polystyrene.lambda, d: p.di / 100 },
      ];
    }

    function setupPlot(): void {
      if (p.mode === 'leitung') {
        plot.setRangePadded([0, 20], [0, 110], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('x') }, y: { label: ctx.t('T') } });
      } else if (p.mode === 'daemmung') {
        const total = (p.dw + p.di) as number;
        plot.setRangePadded([-6, total + 6], [-22, 24], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('x') }, y: { label: ctx.t('T') } });
      } else if (p.mode === 'strahlung') {
        plot.setRangePadded([0, 800], [0, 50], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: 'ϑ in °C' }, y: { label: 'P in kW/m²' } });
      }
    }

    function updateReadouts(): void {
      for (const k of ['time', 'lam', 'P', 'rad', 'U', 'loss']) ctx.readout(k, null);
      if (p.mode === 'leitung') {
        const m = MATERIALS[p.mat as MaterialId];
        ctx.readout('time', timeText(time));
        ctx.readout('lam', tr('lamVal', { v: fmt.num(m.lambda, m.lambda < 1 ? 2 : 0) }));
        ctx.readout('P', tr('Pval', { P: fmt.num(conductionPower(m.lambda, AREA, p.th - T_COLD, ROD_LEN), 3) }));
      } else if (p.mode === 'strahlung') {
        const K = p.tk + 273.15;
        const eps = Number(p.surf);
        ctx.readout('rad', tr('radVal', { P: fmt.num(radiatedPower(eps, 1, K), 0), K: fmt.num(K, 0), N: fmt.num(netRadiation(eps, 1, K, 293.15), 0) }));
      } else if (p.mode === 'daemmung') {
        const U = uValue(layers());
        const P = U * WALL_AREA * (20 - p.ta);
        ctx.readout('U', tr('Uval', { U: fmt.num(U, 2) }));
        ctx.readout('loss', tr('lossVal', { P: fmt.num(P, 0), E: fmt.num((P * 24) / 1000, 1) }));
      }
    }

    /* ---------- Wärmeleitung ---------- */
    function drawRod(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x0 = r.x + 70;
      const x1 = r.x + r.w - 60;
      const cy = r.y + r.h / 2;
      const hh = Math.min(46, r.h * 0.18);
      // Wärmequelle links, Kühlung rechts
      roundRect(g, r.x + 16, cy - hh * 1.6, 54, hh * 3.2, 10);
      g.fillStyle = tempColor(p.th, T_COLD, 100);
      g.fill();
      text(g, ctx.t('hot'), r.x + 43, cy - hh * 1.6 - 12, { font: `700 13px ${th.font}`, color: th.text });
      text(g, `${fmt.num(p.th, 0)} °C`, r.x + 43, cy, { font: `700 13px ${th.font}`, color: '#ffffff' });
      roundRect(g, x1, cy - hh * 1.6, 44, hh * 3.2, 10);
      g.fillStyle = tempColor(T_COLD, T_COLD, 100);
      g.fill();
      text(g, ctx.t('cold'), x1 + 22, cy - hh * 1.6 - 12, { font: `700 13px ${th.font}`, color: th.text });
      text(g, '20 °C', x1 + 22, cy, { font: `700 12px ${th.font}`, color: '#ffffff' });
      // Stab in Abschnitten
      const seg = (x1 - x0) / (N - 1);
      for (let i = 0; i < N - 1; i++) {
        g.fillStyle = tempColor((T[i]! + T[i + 1]!) / 2, T_COLD, 100);
        g.fillRect(x0 + i * seg, cy - hh / 2, seg + 1, hh);
      }
      g.strokeStyle = th.text;
      g.lineWidth = 1.5;
      g.strokeRect(x0, cy - hh / 2, x1 - x0, hh);
      // Teilchen schwingen umso stärker, je wärmer
      g.fillStyle = withAlpha(th.text, 0.75);
      for (let i = 1; i < N - 1; i += 2) {
        const amp = 1 + (4 * (T[i]! - T[COLD_I]!)) / 80;
        for (const row of [-0.25, 0.25]) {
          const ph = anim * (9 + i * 0.37) + row * 7 + i;
          g.beginPath();
          g.arc(x0 + i * seg + amp * Math.sin(ph), cy + row * hh + amp * Math.cos(ph * 1.3), 2.6, 0, Math.PI * 2);
          g.fill();
        }
      }
      text(g, ctx.t(`m_${p.mat}`), (x0 + x1) / 2, cy + hh / 2 + 22, { font: `700 14px ${th.font}`, color: th.text });
    }
    const COLD_I = N - 1;

    function drawRodChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      // Endzustand (linear) gestrichelt
      plot.polyline(
        [
          [0, p.th],
          [20, T_COLD],
        ],
        { color: withAlpha(th.muted, 0.7), width: 1.5, dash: [6, 5] },
      );
      plot.polyline(
        T.map((t, i) => [(i / (N - 1)) * 20, t] as [number, number]),
        { color: th.series[1]!, width: 3 },
      );
      plot.end();
    }

    /* ---------- Wärmeströmung ---------- */
    function drawConvection(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const pw = Math.min(r.w * 0.8, 420);
      const ph = Math.min(r.h * 0.62, 280);
      const px = r.x + (r.w - pw) / 2;
      const py = r.y + (r.h - ph) / 2 - 10;
      // Topf mit Wasser
      g.fillStyle = withAlpha(th.series[0]!, 0.12);
      g.fillRect(px, py + ph * 0.1, pw, ph * 0.9);
      g.strokeStyle = th.text;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px, py + ph);
      g.lineTo(px + pw, py + ph);
      g.lineTo(px + pw, py);
      g.stroke();
      // Heizplatte
      const k = p.heiz / 100;
      roundRect(g, px + pw * 0.3, py + ph + 6, pw * 0.4, 14, 4);
      g.fillStyle = k > 0 ? tempColor(20 + 80 * k, 20, 100) : th.muted;
      g.fill();
      text(g, ctx.t('heater'), px + pw / 2, py + ph + 34, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.muted });
      text(g, ctx.t('water'), px + 30, py + ph * 0.1 + 16, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      // Zwei Walzen: in der Mitte hoch, an den Seiten herunter
      const cells = [
        { cx: px + pw * 0.27, dir: -1 },
        { cx: px + pw * 0.73, dir: 1 },
      ];
      const ry = ph * 0.33;
      const rx = pw * 0.19;
      const cyc = py + ph * 0.55;
      const n = 14;
      for (const c of cells) {
        g.strokeStyle = withAlpha(th.muted, 0.35);
        g.lineWidth = 1.5;
        g.setLineDash([5, 6]);
        g.beginPath();
        g.ellipse(c.cx, cyc, rx, ry, 0, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + c.dir * anim * 0.9 * k;
          const x = c.cx + rx * Math.cos(a);
          const y = cyc + ry * Math.sin(a);
          // innen (zur Mitte) warm, außen kalt
          // zur Topfmitte hin warm (dort steigt das Wasser auf), außen kalt
          const inner = -c.dir * Math.cos(a);
          const temp = 0.5 + 0.5 * inner;
          g.fillStyle = k > 0 ? tempColor(temp, 0, 1) : tempColor(0, 0, 1);
          g.beginPath();
          g.arc(x, y, 6, 0, Math.PI * 2);
          g.fill();
        }
        // Pfeil in der Mitte nach oben
      }
      if (k > 0) {
        const ax = px + pw / 2;
        g.strokeStyle = th.series[1]!;
        g.fillStyle = th.series[1]!;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(ax, cyc + ry * 0.6);
        g.lineTo(ax, cyc - ry * 0.6);
        g.stroke();
        g.beginPath();
        g.moveTo(ax, cyc - ry * 0.6 - 10);
        g.lineTo(ax - 7, cyc - ry * 0.6 + 2);
        g.lineTo(ax + 7, cyc - ry * 0.6 + 2);
        g.closePath();
        g.fill();
      }
    }

    /* ---------- Wärmestrahlung ---------- */
    function drawRadiation(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w * 0.3;
      const cy = r.y + r.h / 2;
      const rad = Math.min(r.w, r.h) * 0.16;
      const eps = Number(p.surf);
      const K = p.tk + 273.15;
      const glow = Math.max(0, Math.min(1, (p.tk - 500) / 300));
      // Körper
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.fillStyle = eps > 0.9 ? '#1f2937' : eps > 0.3 ? '#6b7280' : '#d1d5db';
      g.fill();
      if (glow > 0) {
        g.fillStyle = `rgba(255,${Math.round(80 + 120 * glow)},40,${0.25 + 0.6 * glow})`;
        g.fill();
      }
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.stroke();
      text(g, `${fmt.num(p.tk, 0)} °C`, cx, cy, { font: `700 13px ${th.font}`, color: eps > 0.3 || glow > 0.3 ? '#ffffff' : '#111827' });
      // Wellige Strahlen, Anzahl/Helligkeit ∝ Leistung
      const P = radiatedPower(eps, 1, K);
      const Pmax = radiatedPower(0.95, 1, 1073.15);
      const strength = Math.sqrt(P / Pmax);
      const rays = 10;
      const len = Math.max(20, Math.min(r.w * 0.3 - 8, r.h / 2 - rad - 14));
      g.strokeStyle = withAlpha(th.series[1]!, 0.25 + 0.75 * strength);
      g.lineWidth = 1.5 + 3 * strength;
      for (let k = 0; k < rays; k++) {
        const a = (k / rays) * Math.PI * 2;
        g.beginPath();
        for (let s = 0; s <= 40; s++) {
          const d = rad + 8 + (s / 40) * len * (0.3 + 0.7 * strength);
          const wob = 5 * Math.sin(s * 0.9 - anim * 6);
          const x = cx + d * Math.cos(a) - wob * Math.sin(a);
          const y = cy + d * Math.sin(a) + wob * Math.cos(a);
          if (s) g.lineTo(x, y);
          else g.moveTo(x, y);
        }
        g.stroke();
      }
      text(g, ctx.t('vacuum'), r.x + r.w / 2, r.y + r.h - 18, { font: `600 12px ${th.font}`, color: th.muted });
    }

    function drawRadChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const eps = Number(p.surf);
      for (const [e, a] of [
        [0.95, 0.3],
        [0.5, 0.3],
        [0.05, 0.3],
      ] as const) {
        if (e === eps) continue;
        plot.fn((t) => radiatedPower(e, 1, t + 273.15) / 1000, { color: withAlpha(th.muted, a + 0.2), width: 1.5, from: 0, to: 800 });
      }
      plot.fn((t) => radiatedPower(eps, 1, t + 273.15) / 1000, { color: th.series[1]!, width: 3, from: 0, to: 800 });
      plot.point(p.tk, radiatedPower(eps, 1, p.tk + 273.15) / 1000, { color: th.series[1]!, radius: 6 });
      plot.end();
    }

    /* ---------- Dämmung ---------- */
    function drawWall(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const total = p.dw + p.di;
      const scale = Math.min((r.w - 140) / 80, 6);
      const w = total * scale;
      const wx = r.x + (r.w - w) / 2;
      const top = r.y + 40;
      const bot = r.y + r.h - 30;
      // Innen- und Außenraum
      g.fillStyle = withAlpha(th.series[1]!, 0.12);
      g.fillRect(r.x + 8, top, wx - r.x - 8, bot - top);
      g.fillStyle = withAlpha(th.series[0]!, 0.12);
      g.fillRect(wx + w, top, r.x + r.w - 8 - wx - w, bot - top);
      text(g, `${ctx.t('inside')} 20 °C`, (r.x + wx) / 2, top - 14, { font: `700 13px ${th.font}`, color: th.series[1]! });
      text(g, `${ctx.t('outside')} ${fmt.num(p.ta, 0)} °C`, (wx + w + r.x + r.w) / 2, top - 14, { font: `700 13px ${th.font}`, color: th.series[0]! });
      // Ziegel
      const bw = p.dw * scale;
      g.fillStyle = '#b45f3c';
      g.fillRect(wx, top, bw, bot - top);
      g.strokeStyle = 'rgba(255,255,255,0.45)';
      g.lineWidth = 1;
      for (let y = top; y < bot; y += 14) {
        g.beginPath();
        g.moveTo(wx, y);
        g.lineTo(wx + bw, y);
        g.stroke();
      }
      text(g, ctx.t('brick'), wx + bw / 2, (top + bot) / 2, { font: `700 12px ${th.font}`, color: '#ffffff' });
      if (p.di > 0) {
        const iw = p.di * scale;
        g.fillStyle = '#e5e7eb';
        g.fillRect(wx + bw, top, iw, bot - top);
        g.fillStyle = 'rgba(148,163,184,0.6)';
        for (let y = top + 4; y < bot; y += 9) for (let x = wx + bw + 4; x < wx + bw + iw - 2; x += 9) g.fillRect(x, y, 3, 3);
        if (iw > 40) text(g, ctx.t('insul'), wx + bw + iw / 2, (top + bot) / 2 + 22, { font: `700 12px ${th.font}`, color: '#374151' });
      }
    }

    function drawWallChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const ts = wallTemperatures(layers(), 20, p.ta);
      const xs = [0, p.dw, p.dw + p.di];
      const pts: [number, number][] = [[-6, 20], [0, ts[0]!]];
      for (let i = 1; i < ts.length; i++) pts.push([xs[i]!, ts[i]!]);
      pts.push([p.dw + p.di + 6, p.ta]);
      plot.vline(0, { color: withAlpha(th.muted, 0.6), width: 1 });
      plot.vline(p.dw, { color: withAlpha(th.muted, 0.6), width: 1 });
      if (p.di > 0) plot.vline(p.dw + p.di, { color: withAlpha(th.muted, 0.6), width: 1 });
      plot.polyline(pts, { color: th.series[1]!, width: 3 });
      plot.end();
    }

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode') || changed.has('mat') || changed.has('th')) resetRod();
        if (source === 'init' || changed.has('mode') || changed.has('dw') || changed.has('di')) setupPlot();
        updateReadouts();
      },

      action(id) {
        if (id === 'reset') {
          resetRod();
          ctx.clock.play();
          updateReadouts();
          ctx.requestRender();
        }
      },

      tick(dt) {
        anim += dt;
        if (p.mode === 'leitung') {
          const step = dt * Number(p.raffer);
          conductionStep(T, diffusivity(p.mat as MaterialId), ROD_LEN / (N - 1), step);
          T[0] = p.th;
          time += step;
          updateReadouts();
        }
      },

      resetTime() {
        resetRod();
        anim = 0;
        updateReadouts();
      },

      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        if (p.mode === 'leitung') {
          drawRod(s.scene);
          drawRodChart();
        } else if (p.mode === 'stroemung') {
          drawConvection({ x: 0, y: 0, w: surface.width, h: surface.height });
        } else if (p.mode === 'strahlung') {
          drawRadiation(s.scene);
          drawRadChart();
        } else {
          drawWall(s.scene);
          drawWallChart();
        }
      },

      destroy: () => surface.destroy(),
    };
  },
});
