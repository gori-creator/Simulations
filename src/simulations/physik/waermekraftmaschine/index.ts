import { defineSimulation, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { carnot, carnotEfficiency, entropyDirect, heatPumpCop, stateAt } from './model';

const L = (de: string, en: string) => ({ de, en });
const N_MOL = 0.1;
const V1 = 1;
const V2 = 2;
/** Wärme beim direkten Wärmeübergang (J) */
const Q_DIRECT = 1000;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.42);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.46);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Wärmekraftmaschine und Wärmepumpe: Carnot-Kreisprozess im p-V-Diagramm mit
 * Zylinder, Wirkungsgrad, Leistungszahl und Entropie; dazu der irreversible
 * direkte Wärmeübergang.
 */
export default defineSimulation({
  id: 'waermekraftmaschine',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Maschine', 'Machine'),
      options: [
        { value: 'motor', label: L('Wärmekraftmaschine (Motor)', 'Heat engine') },
        { value: 'pumpe', label: L('Wärmepumpe / Kühlschrank', 'Heat pump / fridge') },
        { value: 'direkt', label: L('Wärme fließt direkt (irreversibel)', 'Heat flows directly (irreversible)') },
      ],
      default: 'motor',
    },
    { key: 'th', type: 'number', label: L('Temperatur heiß', 'Hot temperature'), min: 30, max: 600, step: 1, default: 327, unit: '°C' },
    { key: 'tc', type: 'number', label: L('Temperatur kalt', 'Cold temperature'), min: -30, max: 100, step: 1, default: 27, unit: '°C' },
    {
      key: 'tempo',
      type: 'choice',
      label: L('Tempo', 'Speed'),
      options: [
        { value: '0.25', label: L('langsam', 'slow') },
        { value: '0.5', label: L('mittel', 'medium') },
        { value: '1', label: L('schnell', 'fast') },
      ],
      default: '0.5',
      visibleIf: (v) => v.mode !== 'direkt',
    },
  ],
  hint: (v) =>
    v.mode === 'motor'
      ? L('Die Fläche im p-V-Diagramm ist die Arbeit, die der Motor pro Umlauf abgibt.', 'The area in the p-V diagram is the work the engine delivers per cycle.')
      : v.mode === 'pumpe'
        ? L('Rückwärts durchlaufen: Mit Arbeit wird Wärme vom Kalten ins Warme gepumpt.', 'Run backwards: work pumps heat from cold to warm.')
        : L('Ohne Maschine fließt Wärme von selbst vom Heißen zum Kalten – dabei entsteht Entropie.', 'Without a machine heat flows by itself from hot to cold – producing entropy.'),
  readouts: [
    { key: 'eta', label: L('Wirkungsgrad', 'Efficiency'), spoiler: true },
    { key: 'cop', label: L('Leistungszahl', 'Coefficient of performance'), spoiler: true },
    { key: 'Q', label: L('Energie pro Umlauf', 'Energy per cycle'), spoiler: true },
    { key: 'S', label: L('Entropie', 'Entropy'), spoiler: true },
    { key: 'stage', label: L('Gerade', 'Now') },
  ],
  presets: [
    { id: 'motor', label: L('Motor 327 °C / 27 °C', 'Engine 327 °C / 27 °C'), values: { mode: 'motor', th: 327, tc: 27 } },
    { id: 'kraftwerk', label: L('Kraftwerk 550 °C / 30 °C', 'Power plant 550 °C / 30 °C'), values: { mode: 'motor', th: 550, tc: 30 } },
    { id: 'pumpe', label: L('Wärmepumpe 35 °C / 5 °C', 'Heat pump 35 °C / 5 °C'), values: { mode: 'pumpe', th: 35, tc: 5 } },
    { id: 'kalt', label: L('Wärmepumpe bei −15 °C', 'Heat pump at −15 °C'), values: { mode: 'pumpe', th: 35, tc: -15 } },
    { id: 'direkt', label: L('Direkter Wärmefluss', 'Direct heat flow'), values: { mode: 'direkt', th: 227, tc: -23 } },
  ],
  strings: {
    de: {
      canvas: 'Zylinder mit Kolben und Gas zwischen heißem und kaltem Wärmespeicher, daneben das p-V-Diagramm des Carnot-Kreisprozesses; oder zwei Körper mit direktem Wärmefluss und Entropie-Balken',
      V: 'V in L',
      p: 'p in kPa',
      hot: 'heiß',
      cold: 'kalt',
      etaVal: 'η = 1 − T_k / T_h = 1 − {c} K / {h} K ≈ {eta} %',
      etaBad: 'Die heiße Seite muss wärmer sein als die kalte.',
      copVal: 'ε = T_h / (T_h − T_k) ≈ {cop}: Für 1 J Arbeit landen {cop} J Wärme auf der warmen Seite.',
      QMotor: 'aufgenommen Q_h ≈ {qh} J, abgegeben Q_k ≈ {qc} J, Arbeit W ≈ {w} J',
      QPumpe: 'aufgenommen (kalt) ≈ {qc} J, Arbeit ≈ {w} J, abgegeben (warm) ≈ {qh} J',
      SCarnot: 'reversibel: Q_h / T_h = Q_k / T_k ≈ {s} J/K – die Entropie bleibt gleich.',
      SDirect: 'heißer Körper {h} J/K, kalter Körper +{c} J/K, zusammen +{t} J/K – die Entropie nimmt zu.',
      st0: 'isotherme Ausdehnung: Gas nimmt Wärme vom heißen Speicher auf',
      st1: 'adiabatische Ausdehnung: Gas kühlt ab, ohne Wärmeaustausch',
      st2: 'isotherme Verdichtung: Gas gibt Wärme an den kalten Speicher ab',
      st3: 'adiabatische Verdichtung: Gas wird wärmer, ohne Wärmeaustausch',
      pst0: 'isotherme Verdichtung: Gas gibt Wärme an die warme Seite ab',
      pst1: 'adiabatische Verdichtung: Gas wird heiß',
      pst2: 'isotherme Ausdehnung: Gas nimmt Wärme von der kalten Seite auf',
      pst3: 'adiabatische Ausdehnung: Gas kühlt unter die kalte Temperatur ab',
      direct: 'Q = {q} J fließen vom heißen zum kalten Körper.',
      Sbar: 'Entropieänderung in J/K',
      hotBody: 'heißer Körper',
      coldBody: 'kalter Körper',
      total: 'zusammen',
      work: 'Arbeit',
    },
    en: {
      canvas: 'Cylinder with piston and gas between a hot and a cold reservoir, next to it the p-V diagram of the Carnot cycle; or two bodies with direct heat flow and entropy bars',
      V: 'V in L',
      p: 'p in kPa',
      hot: 'hot',
      cold: 'cold',
      etaVal: 'η = 1 − T_c / T_h = 1 − {c} K / {h} K ≈ {eta} %',
      etaBad: 'The hot side must be warmer than the cold side.',
      copVal: 'ε = T_h / (T_h − T_c) ≈ {cop}: for 1 J of work, {cop} J of heat arrive on the warm side.',
      QMotor: 'absorbed Q_h ≈ {qh} J, released Q_c ≈ {qc} J, work W ≈ {w} J',
      QPumpe: 'absorbed (cold) ≈ {qc} J, work ≈ {w} J, released (warm) ≈ {qh} J',
      SCarnot: 'reversible: Q_h / T_h = Q_c / T_c ≈ {s} J/K – entropy stays the same.',
      SDirect: 'hot body {h} J/K, cold body +{c} J/K, together +{t} J/K – entropy increases.',
      st0: 'isothermal expansion: gas takes in heat from the hot reservoir',
      st1: 'adiabatic expansion: gas cools down without exchanging heat',
      st2: 'isothermal compression: gas gives heat to the cold reservoir',
      st3: 'adiabatic compression: gas warms up without exchanging heat',
      pst0: 'isothermal compression: gas gives heat to the warm side',
      pst1: 'adiabatic compression: gas gets hot',
      pst2: 'isothermal expansion: gas takes in heat from the cold side',
      pst3: 'adiabatic expansion: gas cools below the cold temperature',
      direct: 'Q = {q} J flow from the hot to the cold body.',
      Sbar: 'entropy change in J/K',
      hotBody: 'hot body',
      coldBody: 'cold body',
      total: 'together',
      work: 'work',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 10],
      y: [0, 600],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    let s = 0;
    let flow = 0;
    const Th = () => p.th + 273.15;
    const Tc = () => p.tc + 273.15;
    const valid = () => Th() > Tc() + 1;
    const cyc = () => carnot(N_MOL, Th(), Tc(), V1, V2);

    function setupPlot(): void {
      if (p.mode === 'direkt' || !valid()) return;
      const c = cyc();
      const pmax = (N_MOL * 8.314 * Th()) / V1;
      plot.setRangePadded([0, c.V[2] * 1.08], [0, pmax * 1.1], { left: 52, right: 14, top: 22, bottom: 24 });
      plot.setAxes({ x: { label: ctx.t('V') }, y: { label: ctx.t('p') } });
    }

    function updateReadouts(): void {
      for (const k of ['eta', 'cop', 'Q', 'S', 'stage']) ctx.readout(k, null);
      if (!valid()) {
        ctx.readout('eta', ctx.t('etaBad'));
        return;
      }
      if (p.mode === 'direkt') {
        const e = entropyDirect(Q_DIRECT, Th(), Tc());
        ctx.readout('Q', tr('direct', { q: fmt.num(Q_DIRECT, 0) }));
        ctx.readout('S', tr('SDirect', { h: fmt.num(e.hot, 2), c: fmt.num(e.cold, 2), t: fmt.num(e.total, 2) }));
        return;
      }
      const c = cyc();
      if (p.mode === 'motor') {
        ctx.readout('eta', tr('etaVal', { c: fmt.num(Tc(), 0), h: fmt.num(Th(), 0), eta: fmt.num(100 * carnotEfficiency(Th(), Tc()), 1) }));
        ctx.readout('Q', tr('QMotor', { qh: fmt.num(c.Qh, 1), qc: fmt.num(c.Qc, 1), w: fmt.num(c.W, 1) }));
      } else {
        ctx.readout('cop', tr('copVal', { cop: fmt.num(heatPumpCop(Th(), Tc()), 1) }));
        ctx.readout('Q', tr('QPumpe', { qh: fmt.num(c.Qh, 1), qc: fmt.num(c.Qc, 1), w: fmt.num(c.W, 1) }));
      }
      ctx.readout('S', tr('SCarnot', { s: fmt.num(c.Qh / Th(), 3) }));
      const st = stateAt(c, N_MOL, Th(), Tc(), s).stage;
      ctx.readout('stage', ctx.t(p.mode === 'motor' ? `st${st}` : `pst${(3 - st + 4) % 4}`));
    }

    function tempColor(T: number): string {
      const th = ctx.theme;
      const k = Math.max(0, Math.min(1, (T - Tc()) / Math.max(1, Th() - Tc())));
      return k > 0.5 ? withAlpha(th.series[1]!, 0.3 + 0.6 * (k - 0.5) * 2) : withAlpha(th.series[0]!, 0.3 + 0.6 * (0.5 - k) * 2);
    }

    function drawCylinder(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const c = cyc();
      const st = stateAt(c, N_MOL, Th(), Tc(), s);
      const narrow = surface.width < 700;
      const cw = Math.min(r.w * 0.34, 140);
      const cx = r.x + r.w / 2;
      const bottom = r.y + r.h - 50;
      const maxH = r.h - 110;
      const hgt = 20 + (maxH - 20) * (st.V / c.V[2]);
      // Speicher: heiß links unten, kalt rechts unten; aktiver Speicher berührt den Zylinder
      const resW = Math.min(r.w * 0.28, 110);
      const pump = p.mode === 'pumpe';
      // Im Pumpenbetrieb läuft der Kreis rückwärts; Stufe 0 (heiß) und 2 (kalt) bleiben die Isothermen
      const touchHot = st.stage === 0;
      const touchCold = st.stage === 2;
      roundRect(g, r.x + 10, bottom + 6, resW, 34, 8);
      g.fillStyle = withAlpha(th.series[1]!, touchHot ? 0.9 : 0.35);
      g.fill();
      text(g, `${ctx.t('hot')} ${fmt.num(p.th, 0)} °C`, r.x + 10 + resW / 2, bottom + 23, { font: `700 ${narrow ? 11 : 12}px ${th.font}`, color: '#ffffff' });
      roundRect(g, r.x + r.w - 10 - resW, bottom + 6, resW, 34, 8);
      g.fillStyle = withAlpha(th.series[0]!, touchCold ? 0.9 : 0.35);
      g.fill();
      text(g, `${ctx.t('cold')} ${fmt.num(p.tc, 0)} °C`, r.x + r.w - 10 - resW / 2, bottom + 23, { font: `700 ${narrow ? 11 : 12}px ${th.font}`, color: '#ffffff' });
      // Wärmepfeil
      if (touchHot || touchCold) {
        const fromRes = touchHot ? !pump : pump;
        const rx = touchHot ? r.x + 10 + resW / 2 : r.x + r.w - 10 - resW / 2;
        g.strokeStyle = touchHot ? th.series[1]! : th.series[0]!;
        g.lineWidth = 3;
        g.beginPath();
        const ya = bottom + 4;
        g.moveTo(rx, ya);
        g.quadraticCurveTo(rx, bottom - 20, cx + (rx < cx ? -cw / 2 : cw / 2), bottom - 20);
        g.stroke();
        const ex = fromRes ? cx + (rx < cx ? -cw / 2 : cw / 2) : rx;
        const ey = fromRes ? bottom - 20 : ya;
        g.fillStyle = g.strokeStyle;
        g.beginPath();
        if (fromRes) {
          const d = rx < cx ? 1 : -1;
          g.moveTo(ex + d * 2, ey);
          g.lineTo(ex - d * 10, ey - 6);
          g.lineTo(ex - d * 10, ey + 6);
        } else {
          g.moveTo(ex, ey + 2);
          g.lineTo(ex - 6, ey - 10);
          g.lineTo(ex + 6, ey - 10);
        }
        g.closePath();
        g.fill();
        text(g, 'Q', (rx + cx) / 2, bottom - 32, { font: `italic 700 14px ${th.mathFont}`, color: g.strokeStyle as string });
      }
      // Zylinder
      g.fillStyle = tempColor(st.T);
      g.fillRect(cx - cw / 2, bottom - hgt, cw, hgt);
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx - cw / 2, bottom - maxH - 10);
      g.lineTo(cx - cw / 2, bottom);
      g.lineTo(cx + cw / 2, bottom);
      g.lineTo(cx + cw / 2, bottom - maxH - 10);
      g.stroke();
      // Kolben und Stange
      g.fillStyle = th.muted;
      g.fillRect(cx - cw / 2 + 2, bottom - hgt - 12, cw - 4, 12);
      g.fillRect(cx - 4, bottom - hgt - 12 - 40, 8, 40);
      // Teilchen
      g.fillStyle = withAlpha(th.text, 0.7);
      const speed = Math.sqrt(st.T / 300);
      for (let k = 0; k < 18; k++) {
        const px = cx - cw / 2 + 8 + ((k * 37 + flow * 60 * speed * (1 + (k % 3))) % (cw - 16));
        const py = bottom - 6 - ((k * 53 + flow * 45 * speed * (1 + (k % 2))) % Math.max(8, hgt - 12));
        g.beginPath();
        g.arc(px, py, 2.5, 0, Math.PI * 2);
        g.fill();
      }
      text(g, `${fmt.num(st.T - 273.15, 0)} °C`, cx, bottom - hgt / 2, { font: `700 13px ${th.font}`, color: th.text });
    }

    function drawPV(): void {
      const th = ctx.theme;
      const c = cyc();
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const pts: [number, number][] = [];
      for (let k = 0; k <= 400; k++) {
        const st = stateAt(c, N_MOL, Th(), Tc(), (k / 400) * 4 - 1e-9);
        pts.push([st.V, st.p]);
      }
      plot.polygon(pts, { fill: withAlpha(p.mode === 'motor' ? th.series[2]! : th.series[4]!, 0.18) });
      const colors = [th.series[1]!, th.muted, th.series[0]!, th.muted];
      for (let stg = 0; stg < 4; stg++) plot.polyline(pts.slice(stg * 100, stg * 100 + 101), { color: colors[stg], width: 3 });
      const st = stateAt(c, N_MOL, Th(), Tc(), s);
      plot.point(st.V, st.p, { color: th.text, radius: 6 });
      const mid = stateAt(c, N_MOL, Th(), Tc(), 0.5);
      plot.text((c.V[1] + c.V[3]) / 2, (mid.p + stateAt(c, N_MOL, Th(), Tc(), 2.5).p) / 2, `${ctx.t('work')} ${p.mode === 'motor' ? '↻' : '↺'}`, { color: th.text, size: 13, weight: 'bold' });
      plot.end();
    }

    function drawDirect(scene: Rect, chart: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const bw = Math.min(scene.w * 0.3, 130);
      const by = scene.y + scene.h / 2 - bw / 2;
      const xh = scene.x + scene.w * 0.25 - bw / 2;
      const xc = scene.x + scene.w * 0.75 - bw / 2;
      roundRect(g, xh, by, bw, bw, 10);
      g.fillStyle = withAlpha(th.series[1]!, 0.85);
      g.fill();
      roundRect(g, xc, by, bw, bw, 10);
      g.fillStyle = withAlpha(th.series[0]!, 0.85);
      g.fill();
      text(g, `${fmt.num(p.th, 0)} °C`, xh + bw / 2, by + bw / 2, { font: `700 15px ${th.font}`, color: '#ffffff' });
      text(g, `${fmt.num(p.tc, 0)} °C`, xc + bw / 2, by + bw / 2, { font: `700 15px ${th.font}`, color: '#ffffff' });
      // Wärmestrom als wandernde Punkte
      g.fillStyle = th.series[3]!;
      for (let k = 0; k < 6; k++) {
        const f = (k / 6 + flow * 0.4) % 1;
        g.beginPath();
        g.arc(xh + bw + 6 + f * (xc - xh - bw - 12), by + bw / 2, 5, 0, Math.PI * 2);
        g.fill();
      }
      text(g, `Q = ${fmt.num(Q_DIRECT, 0)} J`, (xh + bw + xc) / 2, by - 14, { font: `700 13px ${th.font}`, color: th.text });
      // Entropie-Balken
      if (!valid()) return;
      const e = entropyDirect(Q_DIRECT, Th(), Tc());
      const items: [string, number, string][] = [
        [ctx.t('hotBody'), e.hot, th.series[1]!],
        [ctx.t('coldBody'), e.cold, th.series[0]!],
        [ctx.t('total'), e.total, th.series[2]!],
      ];
      const maxV = Math.max(...items.map((i) => Math.abs(i[1])));
      const x0 = chart.x + chart.w / 2;
      const half = chart.w * 0.3;
      const rowH = Math.min(46, (chart.h - 60) / 3);
      text(g, ctx.t('Sbar'), x0, chart.y + 22, { font: `600 13px ${th.font}`, color: th.muted });
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x0, chart.y + 36);
      g.lineTo(x0, chart.y + 40 + rowH * 3);
      g.stroke();
      items.forEach(([label, v, col], k) => {
        const y = chart.y + 44 + k * rowH;
        const w = (half * v) / maxV;
        g.fillStyle = col;
        g.fillRect(Math.min(x0, x0 + w), y, Math.abs(w), rowH - 14);
        text(g, `${label}: ${v > 0 ? '+' : ''}${fmt.num(v, 2)}`, v >= 0 ? x0 - 8 : x0 + 8, y + (rowH - 14) / 2, { font: `600 12px ${th.font}`, color: th.text, align: v >= 0 ? 'right' : 'left' });
      });
    }

    return {
      update(_changed, source) {
        setupPlot();
        if (source === 'init') s = 0;
        updateReadouts();
      },
      tick(dt) {
        const sp = Number(p.tempo) || 0.5;
        if (p.mode === 'motor') s = (s + dt * sp) % 4;
        else if (p.mode === 'pumpe') s = (s - dt * sp + 4) % 4;
        flow += dt;
        updateReadouts();
      },
      resetTime() {
        s = 0;
        flow = 0;
        updateReadouts();
      },
      render() {
        const l = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        if (p.mode === 'direkt') {
          drawDirect(l.scene, l.chart);
          return;
        }
        if (!valid()) {
          text(surface.g, ctx.t('etaBad'), surface.width / 2, surface.height / 2, { font: `600 14px ${ctx.theme.font}`, color: ctx.theme.text });
          return;
        }
        drawCylinder(l.scene);
        drawPV();
      },
      destroy: () => surface.destroy(),
    };
  },
});
