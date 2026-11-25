import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { airPressure, breeze, hydraulic, hydrostatic, P0, pressure } from './model';

const L = (de: string, en: string) => ({ de, en });

/** Auflageflächen in cm² (beide Füße zusammen). */
const AREAS: Record<string, number> = { absatz: 4, schuh: 300, schneeschuh: 2000, ski: 3200 };

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Druck: Auflagedruck im Schnee, hydraulische Presse, Schweredruck beim
 * Tauchen, Luftdruck in der Höhe und Land-See-Wind als Druckausgleich.
 */
export default defineSimulation({
  id: 'druck',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'auflage', label: L('Druck = Kraft / Fläche', 'Pressure = force / area') },
        { value: 'hydraulik', label: L('Hydraulische Presse', 'Hydraulic press') },
        { value: 'wasser', label: L('Druck im Wasser', 'Pressure in water') },
        { value: 'luft', label: L('Luftdruck in der Höhe', 'Air pressure at altitude') },
        { value: 'wind', label: L('Wind durch Druckunterschiede', 'Wind from pressure differences') },
      ],
      default: 'auflage',
    },
    { key: 'F', type: 'number', label: L('Gewichtskraft der Person', 'Weight of the person'), min: 200, max: 1000, step: 10, default: 700, unit: 'N', visibleIf: (v) => v.mode === 'auflage' },
    {
      key: 'flaeche',
      type: 'choice',
      label: L('Schuhwerk', 'Footwear'),
      options: [
        { value: 'absatz', label: L('Stöckelschuhe (nur Absätze)', 'high heels (heels only)') },
        { value: 'schuh', label: L('Turnschuhe', 'trainers') },
        { value: 'schneeschuh', label: L('Schneeschuhe', 'snowshoes') },
        { value: 'ski', label: L('Ski', 'skis') },
      ],
      default: 'schuh',
      visibleIf: (v) => v.mode === 'auflage',
    },
    { key: 'F1', type: 'number', label: L('Kraft am kleinen Kolben', 'Force on the small piston'), min: 10, max: 500, step: 10, default: 100, unit: 'N', visibleIf: (v) => v.mode === 'hydraulik' },
    { key: 'd1', type: 'number', label: L('Durchmesser kleiner Kolben', 'Diameter small piston'), min: 1, max: 10, step: 0.5, default: 2, unit: 'cm', visibleIf: (v) => v.mode === 'hydraulik' },
    { key: 'd2', type: 'number', label: L('Durchmesser großer Kolben', 'Diameter large piston'), min: 5, max: 40, step: 1, default: 20, unit: 'cm', visibleIf: (v) => v.mode === 'hydraulik' },
    { key: 'h', type: 'number', label: L('Tauchtiefe', 'Diving depth'), min: 0, max: 40, step: 0.5, default: 10, unit: 'm', visibleIf: (v) => v.mode === 'wasser' },
    { key: 'salz', type: 'boolean', label: L('Meerwasser (ρ = 1025 kg/m³)', 'Sea water (ρ = 1025 kg/m³)'), default: false, visibleIf: (v) => v.mode === 'wasser' },
    { key: 'hoehe', type: 'number', label: L('Höhe über dem Meer', 'Height above sea level'), min: 0, max: 9000, step: 1, default: 2000, unit: 'm', visibleIf: (v) => v.mode === 'luft' },
    { key: 'tag', type: 'boolean', label: L('Tag (Sonne scheint)', 'Day (sun shining)'), default: true, visibleIf: (v) => v.mode === 'wind' },
  ],
  hint: (v) =>
    v.mode === 'auflage'
      ? L('Dieselbe Kraft, verschiedene Flächen: Wie tief sinkt man im Schnee ein?', 'Same force, different areas: how deep do you sink into the snow?')
      : v.mode === 'hydraulik'
        ? L('Der Druck ist in der ganzen Flüssigkeit gleich – am großen Kolben wirkt eine viel größere Kraft.', 'Pressure is the same throughout the liquid – the large piston feels a much larger force.')
        : v.mode === 'wasser'
          ? L('Alle 10 m Wassertiefe kommt etwa 1 bar dazu.', 'Every 10 m of water adds about 1 bar.')
          : v.mode === 'luft'
            ? L('Je höher, desto weniger Luft liegt über uns.', 'The higher up, the less air lies above us.')
            : L('Wo die Luft warm wird, steigt sie auf; am Boden entsteht tiefer Druck, und Wind strömt nach.', 'Where air gets warm it rises; low pressure forms at the ground and wind flows in.'),
  readouts: [
    { key: 'p', label: L('Druck', 'Pressure'), spoiler: true },
    { key: 'F2', label: L('Kraft am großen Kolben', 'Force on the large piston'), spoiler: true },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'heel', label: L('Stöckelschuh', 'High heel'), values: { mode: 'auflage', flaeche: 'absatz' } },
    { id: 'snow', label: L('Schneeschuh', 'Snowshoe'), values: { mode: 'auflage', flaeche: 'schneeschuh' } },
    { id: 'car', label: L('Auto heben', 'Lift a car'), values: { mode: 'hydraulik', F1: 100, d1: 2, d2: 20 } },
    { id: 'dive', label: L('Tauchen 10 m', 'Diving 10 m'), values: { mode: 'wasser', h: 10 } },
    { id: 'zug', label: L('Zugspitze', 'Zugspitze'), values: { mode: 'luft', hoehe: 2962 } },
    { id: 'everest', label: L('Mount Everest', 'Mount Everest'), values: { mode: 'luft', hoehe: 8849 } },
    { id: 'day', label: L('Seewind am Tag', 'Sea breeze by day'), values: { mode: 'wind', tag: true } },
    { id: 'night', label: L('Landwind in der Nacht', 'Land breeze at night'), values: { mode: 'wind', tag: false } },
  ],
  strings: {
    de: {
      canvas: 'Druck: Person im Schnee, hydraulische Presse mit zwei Kolben, Taucher im Wasser, Berg mit Luftdruck oder Küste mit Wind; daneben Diagramme',
      pAuflage: 'p = F / A = {F} N / {A} cm² ≈ {p}',
      pHyd: 'p = F₁ / A₁ ≈ {p} (überall in der Flüssigkeit gleich)',
      F2Val: 'F₂ = p · A₂ ≈ {F} N – {k}-mal so groß; dafür bewegt sich der große Kolben nur 1/{k} des Weges.',
      pWater: 'p = p_Luft + ρ · g · h ≈ 1,013 bar + {w} bar = {p} bar',
      pAir: 'p ≈ {p} hPa ({r} % des Drucks auf Meereshöhe)',
      windDay: 'Tagsüber wird das Land wärmer als das Meer. Über dem Land steigt warme Luft auf, am Boden entsteht ein Tief (T). Die Luft strömt vom Hoch (H) über dem Meer zum Land: Seewind.',
      windNight: 'Nachts kühlt das Land schneller ab als das Meer. Jetzt steigt die Luft über dem wärmeren Meer auf, und der Wind weht vom Land aufs Meer: Landwind.',
      depth: 'Einsinktiefe',
      kPa: 'p in kPa',
      bar: 'p in bar',
      hPa: 'p in hPa',
      hm: 'h in m',
      hkm: 'h in m',
      land: 'Land',
      sea: 'Meer',
      car: 'Auto',
    },
    en: {
      canvas: 'Pressure: person in snow, hydraulic press with two pistons, diver in water, mountain with air pressure or coast with wind; next to it graphs',
      pAuflage: 'p = F / A = {F} N / {A} cm² ≈ {p}',
      pHyd: 'p = F₁ / A₁ ≈ {p} (the same everywhere in the liquid)',
      F2Val: 'F₂ = p · A₂ ≈ {F} N – {k} times as large; in return the large piston moves only 1/{k} of the distance.',
      pWater: 'p = p_air + ρ · g · h ≈ 1.013 bar + {w} bar = {p} bar',
      pAir: 'p ≈ {p} hPa ({r} % of the pressure at sea level)',
      windDay: 'By day the land gets warmer than the sea. Warm air rises over the land, a low (L) forms at the ground. Air flows from the high (H) over the sea to the land: sea breeze.',
      windNight: 'At night the land cools faster than the sea. Now air rises over the warmer sea and the wind blows from land to sea: land breeze.',
      depth: 'sinking depth',
      kPa: 'p in kPa',
      bar: 'p in bar',
      hPa: 'p in hPa',
      hm: 'h in m',
      hkm: 'h in m',
      land: 'land',
      sea: 'sea',
      car: 'car',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const en = () => ctx.lang === 'en';
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
    let anim = 0;

    const rho = () => (p.salz ? 1025 : 1000);
    const pText = (pa: number) => (pa >= 1e5 ? `${fmt.num(pa / 1e5, 2)} bar` : pa >= 1000 ? `${fmt.num(pa / 1000, 1)} kPa` : `${fmt.num(pa, 0)} Pa`);
    const area = (d: number) => (Math.PI * (d / 100) ** 2) / 4;

    function setupPlot(): void {
      if (p.mode === 'auflage') {
        plot.setRangePadded([0, 4.6], [0, 3000], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: '' }, y: { label: ctx.t('kPa') } });
      } else if (p.mode === 'wasser') {
        plot.setRangePadded([0, 40], [0, 5.5], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('hm') }, y: { label: ctx.t('bar') } });
      } else if (p.mode === 'luft') {
        plot.setRangePadded([0, 9000], [0, 1100], { left: 52, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('hkm') }, y: { label: ctx.t('hPa') } });
      }
    }

    function updateReadouts(): void {
      for (const k of ['p', 'F2', 'info']) ctx.readout(k, null);
      if (p.mode === 'auflage') {
        const A = AREAS[p.flaeche]!;
        ctx.readout('p', tr('pAuflage', { F: fmt.num(p.F, 0), A: fmt.num(A, 0), p: pText(pressure(p.F, A / 1e4)) }));
      } else if (p.mode === 'hydraulik') {
        const h = hydraulic(p.F1, area(p.d1), area(p.d2), 1);
        ctx.readout('p', tr('pHyd', { p: pText(h.p) }));
        ctx.readout('F2', tr('F2Val', { F: fmt.num(h.F2, 0), k: fmt.num(h.F2 / p.F1, 0) }));
      } else if (p.mode === 'wasser') {
        const w = hydrostatic(rho(), p.h) / 1e5;
        ctx.readout('p', tr('pWater', { w: fmt.num(w, 2), p: fmt.num(1.013 + w, 2) }));
      } else if (p.mode === 'luft') {
        const pa = airPressure(p.hoehe);
        ctx.readout('p', tr('pAir', { p: fmt.num(pa, 0), r: fmt.num((100 * pa) / P0, 0) }));
      } else {
        ctx.readout('info', ctx.t(p.tag ? 'windDay' : 'windNight'));
      }
    }

    function arrow(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, color: string, w = 3): void {
      const a = Math.atan2(y1 - y0, x1 - x0);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - 8 * Math.cos(a), y1 - 8 * Math.sin(a));
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - 12 * Math.cos(a) + 6 * Math.sin(a), y1 - 12 * Math.sin(a) - 6 * Math.cos(a));
      g.lineTo(x1 - 12 * Math.cos(a) - 6 * Math.sin(a), y1 - 12 * Math.sin(a) + 6 * Math.cos(a));
      g.closePath();
      g.fill();
    }

    function drawAuflage(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const A = AREAS[p.flaeche]!;
      const pr = pressure(p.F, A / 1e4);
      const snowTop = r.y + r.h * 0.62;
      // Schnee
      g.fillStyle = th.dark ? '#cbd5e1' : '#e2e8f0';
      g.fillRect(r.x + 10, snowTop, r.w - 20, r.y + r.h - snowTop - 10);
      // Einsinken: logarithmisch, damit alle Fälle ins Bild passen
      const sink = Math.min(r.h * 0.3, 6 * Math.log10(1 + pr / 200) * 6);
      const cx = r.x + r.w / 2;
      const footW = Math.min(r.w * 0.5, 30 + Math.sqrt(A) * 3.2);
      const foot = snowTop + sink;
      g.fillStyle = th.text;
      // Person als einfache Figur
      const bodyH = Math.min(r.h * 0.4, 130);
      const top = foot - bodyH - 12;
      g.lineWidth = 5;
      g.strokeStyle = th.text;
      g.beginPath();
      g.arc(cx, top + 12, 12, 0, Math.PI * 2);
      g.moveTo(cx, top + 24);
      g.lineTo(cx, top + bodyH * 0.6);
      g.lineTo(cx - 14, foot - 8);
      g.moveTo(cx, top + bodyH * 0.6);
      g.lineTo(cx + 14, foot - 8);
      g.moveTo(cx - 24, top + 40);
      g.lineTo(cx + 24, top + 40);
      g.stroke();
      // Schuh / Auflage
      g.fillStyle = th.series[0]!;
      if (p.flaeche === 'absatz') {
        g.fillRect(cx - 18, foot - 8, 6, 8);
        g.fillRect(cx + 12, foot - 8, 6, 8);
      } else {
        roundRect(g, cx - footW / 2, foot - 8, footW, 8, 3);
        g.fill();
      }
      // Loch im Schnee
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(r.x + 10, snowTop);
      g.lineTo(r.x + r.w - 10, snowTop);
      g.stroke();
      g.setLineDash([]);
      arrow(g, cx + footW / 2 + 30, top + 30, cx + footW / 2 + 30, top + 30 + 40 + p.F / 15, th.series[1]!);
      text(g, `F = ${fmt.num(p.F, 0)} N`, cx + footW / 2 + 40, top + 40, { font: `700 13px ${th.font}`, color: th.series[1]!, align: 'left' });
      text(g, `A = ${fmt.num(A, 0)} cm²`, cx, r.y + r.h - 26, { font: `700 13px ${th.font}`, color: '#0f172a' });
    }

    function drawAuflageChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const keys = ['absatz', 'schuh', 'schneeschuh', 'ski'];
      const names: Record<string, [string, string]> = { absatz: ['Absatz', 'heel'], schuh: ['Schuh', 'shoe'], schneeschuh: ['Schneeschuh', 'snowshoe'], ski: ['Ski', 'ski'] };
      keys.forEach((k, i) => {
        const v = pressure(p.F, AREAS[k]! / 1e4) / 1000;
        const shown = Math.min(v, 2900);
        const x = 0.6 + i * 1.1;
        plot.polygon(
          [
            [x - 0.35, 0],
            [x + 0.35, 0],
            [x + 0.35, shown],
            [x - 0.35, shown],
          ],
          { fill: k === p.flaeche ? th.series[1]! : withAlpha(th.muted, 0.4) },
        );
        plot.text(x, shown, fmt.num(v, v < 10 ? 1 : 0), { color: th.text, size: 12, weight: 'bold', align: 'center', offset: [0, -8] });
        plot.text(x, shown, names[k]![en() ? 1 : 0], { color: th.muted, size: 11, align: 'center', offset: [0, -24] });
      });
      plot.end();
    }

    function drawHydraulik(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const h = hydraulic(p.F1, area(p.d1), area(p.d2), 1);
      const base = r.y + r.h - 40;
      const maxW = r.w * 0.42;
      const w2 = Math.max(40, (maxW * p.d2) / 40);
      const w1 = Math.max(10, (maxW * p.d1) / 40);
      const x1 = r.x + r.w * 0.22;
      const x2 = r.x + r.w * 0.68;
      const lvl = base - r.h * 0.35;
      g.fillStyle = withAlpha(th.series[0]!, 0.35);
      g.fillRect(x1 - w1 / 2, lvl, w1, base - lvl);
      g.fillRect(x2 - w2 / 2, lvl, w2, base - lvl);
      g.fillRect(x1 - w1 / 2, base - 24, x2 - x1, 24);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(x1 - w1 / 2, lvl - 50);
      g.lineTo(x1 - w1 / 2, base);
      g.lineTo(x2 + w2 / 2, base);
      g.lineTo(x2 + w2 / 2, lvl - 50);
      g.moveTo(x1 + w1 / 2, lvl - 50);
      g.lineTo(x1 + w1 / 2, base - 24);
      g.lineTo(x2 - w2 / 2, base - 24);
      g.lineTo(x2 - w2 / 2, lvl - 50);
      g.stroke();
      g.fillStyle = th.muted;
      g.fillRect(x1 - w1 / 2, lvl - 8, w1, 8);
      g.fillRect(x2 - w2 / 2, lvl - 8, w2, 8);
      // Kraftpfeile
      arrow(g, x1, lvl - 70, x1, lvl - 10, th.series[1]!);
      text(g, `F₁ = ${fmt.num(p.F1, 0)} N`, x1, lvl - 82, { font: `700 13px ${th.font}`, color: th.series[1]! });
      const l2 = Math.min(r.h * 0.3, 20 + 8 * Math.log2(1 + h.F2 / p.F1) * 6);
      arrow(g, x2, lvl - 10, x2, lvl - 10 - l2, th.series[2]!, 4);
      text(g, `F₂ = ${fmt.num(h.F2, 0)} N`, x2, lvl - 22 - l2, { font: `700 13px ${th.font}`, color: th.series[2]! });
    }

    function drawWasser(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const top = r.y + 30;
      const bot = r.y + r.h - 16;
      g.fillStyle = withAlpha(th.series[0]!, 0.25);
      g.fillRect(r.x + 10, top, r.w - 20, bot - top);
      for (let d = 0; d <= 40; d += 10) {
        const y = top + ((bot - top) * d) / 40;
        g.strokeStyle = withAlpha(th.muted, 0.5);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + 10, y);
        g.lineTo(r.x + 30, y);
        g.stroke();
        text(g, `${d} m`, r.x + 34, y, { font: `11px ${th.font}`, color: th.muted, align: 'left' });
      }
      const y = Math.max(top + 10, Math.min(bot - 10, top + ((bot - top) * p.h) / 40));
      const cx = r.x + r.w / 2;
      // Taucher
      g.fillStyle = th.text;
      roundRect(g, cx - 30, y - 8, 60, 16, 8);
      g.fill();
      g.beginPath();
      g.arc(cx + 36, y, 9, 0, Math.PI * 2);
      g.fill();
      // Druckpfeile von allen Seiten
      const len = Math.min(26, 6 + 4 * (1 + hydrostatic(rho(), p.h) / 1e5));
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2;
        const ex = cx + Math.cos(a) * 44;
        const ey = y + Math.sin(a) * 18;
        arrow(g, ex + Math.cos(a) * len, ey + Math.sin(a) * len, ex, ey, th.series[1]!, 2);
      }
    }

    function drawLuft(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const base = r.y + r.h - 20;
      const top = r.y + 20;
      const yOf = (hm: number) => base - ((base - top) * hm) / 9000;
      // Luft dünner nach oben
      for (let i = 0; i < 30; i++) {
        const hm = (i / 30) * 9000;
        g.fillStyle = withAlpha(th.series[0]!, 0.35 * (airPressure(hm) / P0));
        g.fillRect(r.x + 10, yOf(hm + 300), r.w - 20, yOf(hm) - yOf(hm + 300) + 1);
      }
      // Berg
      g.fillStyle = th.dark ? '#475569' : '#94a3b8';
      g.beginPath();
      g.moveTo(r.x + 20, base);
      g.lineTo(r.x + r.w * 0.45, yOf(8849));
      g.lineTo(r.x + r.w - 20, base);
      g.closePath();
      g.fill();
      const y = yOf(p.hoehe);
      // Punkt auf der linken Bergflanke
      const x = r.x + 20 + (r.w * 0.45 - 20) * Math.min(1, p.hoehe / 8849);
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.arc(x, y, 7, 0, Math.PI * 2);
      g.fill();
      text(g, `${fmt.num(p.hoehe, 0)} m: ${fmt.num(airPressure(p.hoehe), 0)} hPa`, x + 12, y - 12, { font: `700 13px ${th.font}`, color: th.text, align: 'left' });
    }

    function drawWind(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const ground = H * 0.72;
      const mid = W / 2;
      const day = p.tag;
      g.fillStyle = withAlpha(day ? th.series[0]! : '#0f172a', day ? 0.08 : 0.35);
      g.fillRect(0, 0, W, ground);
      g.fillStyle = day ? '#a3a36b' : '#5b5b3e';
      g.fillRect(0, ground, mid, H - ground);
      g.fillStyle = withAlpha(th.series[0]!, 0.6);
      g.fillRect(mid, ground, W - mid, H - ground);
      text(g, `${ctx.t('land')} ${day ? '28' : '12'} °C`, mid / 2, ground + (H - ground) / 2, { font: `700 14px ${th.font}`, color: '#ffffff' });
      text(g, `${ctx.t('sea')} ${day ? '20' : '18'} °C`, mid + mid / 2, ground + (H - ground) / 2, { font: `700 14px ${th.font}`, color: '#ffffff' });
      if (day) {
        g.fillStyle = '#facc15';
        g.beginPath();
        g.arc(W * 0.12, H * 0.14, 22, 0, Math.PI * 2);
        g.fill();
      } else {
        g.fillStyle = '#e5e7eb';
        g.beginPath();
        g.arc(W * 0.12, H * 0.14, 16, 0, Math.PI * 2);
        g.fill();
      }
      const b = breeze(day ? 28 : 12, day ? 20 : 18);
      // Umlauf: Boden zum Tief, aufsteigen, oben zurück, absinken
      const low = b === 'land' ? mid / 2 : mid + mid / 2;
      const high = b === 'land' ? mid + mid / 2 : mid / 2;
      const yLow = ground - 26;
      const yHigh = H * 0.22;
      const path: [number, number][] = [
        [high, yLow],
        [low, yLow],
        [low, yHigh],
        [high, yHigh],
      ];
      text(g, en() ? 'L' : 'T', low, ground - 50, { font: `800 26px ${th.font}`, color: th.series[1]! });
      text(g, 'H', high, ground - 50, { font: `800 26px ${th.font}`, color: th.series[0]! });
      g.strokeStyle = withAlpha(th.text, 0.35);
      g.lineWidth = 2;
      g.setLineDash([6, 6]);
      g.beginPath();
      path.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.closePath();
      g.stroke();
      g.setLineDash([]);
      // Bodenwind als Pfeil
      arrow(g, high + (low - high) * 0.15, yLow, high + (low - high) * 0.85, yLow, th.series[3]!, 5);
      // Teilchen auf dem Umlauf
      const segs = path.map((pt, i) => [pt, path[(i + 1) % 4]!] as const);
      const lens = segs.map(([a, c]) => Math.hypot(c[0] - a[0], c[1] - a[1]));
      const total = lens.reduce((s, v) => s + v, 0);
      g.fillStyle = th.series[3]!;
      for (let k = 0; k < 16; k++) {
        let d = ((k / 16) * total + anim * 60) % total;
        let i = 0;
        while (d > lens[i]!) {
          d -= lens[i]!;
          i++;
        }
        const [a, c] = segs[i]!;
        const f = d / lens[i]!;
        g.beginPath();
        g.arc(a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, 4, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      if (p.mode === 'auflage') {
        drawAuflageChart();
        return;
      }
      if (p.mode === 'hydraulik' || p.mode === 'wind') return;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'wasser') {
        plot.fn((hh) => 1.013 + hydrostatic(rho(), hh) / 1e5, { color: th.series[0]!, width: 3, from: 0, to: 40 });
        plot.point(p.h, 1.013 + hydrostatic(rho(), p.h) / 1e5, { color: th.series[1]!, radius: 6 });
      } else {
        plot.fn((hh) => airPressure(hh), { color: th.series[0]!, width: 3, from: 0, to: 9000 });
        plot.point(p.hoehe, airPressure(p.hoehe), { color: th.series[1]!, radius: 6 });
      }
      plot.end();
    }

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('mode')) setupPlot();
        updateReadouts();
      },
      tick(dt) {
        anim += dt;
      },
      resetTime() {
        anim = 0;
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        const full: Rect = { x: 0, y: 0, w: surface.width, h: surface.height };
        if (p.mode === 'auflage') drawAuflage(s.scene);
        else if (p.mode === 'hydraulik') drawHydraulik(full);
        else if (p.mode === 'wasser') drawWasser(s.scene);
        else if (p.mode === 'luft') drawLuft(s.scene);
        else drawWind();
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});

