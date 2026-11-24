import { defineSimulation, Plot, Surface, withAlpha, type Rect } from '../../../sim-core';
import { instant, resonanceFrequency, seriesAc, type AcResult, type Circuit } from './model';

const L = (de: string, en: string) => ({ de, en });

interface Lay {
  scene: Rect;
  chart1: Rect;
  chart2: Rect;
}

function layout(w: number, h: number): Lay {
  if (w >= 700) {
    const lw = Math.round(w * 0.4);
    return {
      scene: { x: 0, y: 0, w: lw, h },
      chart1: { x: lw, y: 0, w: w - lw, h: Math.round(h / 2) },
      chart2: { x: lw, y: Math.round(h / 2), w: w - lw, h: h - Math.round(h / 2) },
    };
  }
  const sh = Math.round(h * 0.42);
  const ch = Math.round((h - sh) / 2);
  return {
    scene: { x: 0, y: 0, w, h: sh },
    chart1: { x: 0, y: sh, w, h: ch },
    chart2: { x: 0, y: sh + ch, w, h: h - sh - ch },
  };
}

/**
 * Wechselstromkreise: Zeigerdiagramm für Spannung und Strom, Liniendiagramme
 * von u(t), i(t) und p(t) mit Wirkleistung; Reihenschaltungen aus R, L und C.
 */
export default defineSimulation({
  id: 'wechselstrom',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.62 },
  params: [
    {
      key: 'kreis',
      type: 'choice',
      label: L('Schaltung', 'Circuit'),
      options: [
        { value: 'R', label: L('nur Widerstand R', 'resistor R only') },
        { value: 'L', label: L('nur Spule L', 'coil L only') },
        { value: 'C', label: L('nur Kondensator C', 'capacitor C only') },
        { value: 'RL', label: L('R und L in Reihe', 'R and L in series') },
        { value: 'RC', label: L('R und C in Reihe', 'R and C in series') },
        { value: 'RLC', label: L('R, L und C in Reihe', 'R, L and C in series') },
      ],
      default: 'RL',
    },
    { key: 'U', type: 'number', label: L('Effektivspannung U', 'RMS voltage U'), min: 1, max: 24, step: 1, default: 12, unit: 'V' },
    { key: 'f', type: 'number', label: L('Frequenz f', 'Frequency f'), min: 10, max: 1000, step: 1, default: 50, unit: 'Hz' },
    { key: 'R', type: 'number', label: L('Widerstand R', 'Resistance R'), min: 10, max: 1000, step: 10, default: 100, unit: 'Ω', visibleIf: (v) => String(v.kreis).includes('R') },
    { key: 'Lm', type: 'number', label: L('Induktivität L', 'Inductance L'), min: 10, max: 2000, step: 10, default: 300, unit: 'mH', visibleIf: (v) => String(v.kreis).includes('L') },
    { key: 'C', type: 'number', label: L('Kapazität C', 'Capacitance C'), min: 1, max: 200, step: 1, default: 20, unit: 'µF', visibleIf: (v) => String(v.kreis).includes('C') },
    {
      key: 'tempo',
      type: 'choice',
      label: L('Zeitlupe (Zeiger)', 'Slow motion (phasors)'),
      options: [
        { value: '0.25', label: L('¼', '¼') },
        { value: '0.5', label: L('½', '½') },
        { value: '1', label: L('1', '1') },
      ],
      default: '0.5',
    },
  ],
  hint: L(
    'Die Zeiger drehen sich in Zeitlupe; ihre Höhe ist der Momentanwert. Der Abstand zwischen u und i ist die Phasenverschiebung φ.',
    'The phasors rotate in slow motion; their height is the instantaneous value. The angle between u and i is the phase shift φ.',
  ),
  readouts: [
    { key: 'X', label: L('Blindwiderstände', 'Reactances'), spoiler: true },
    { key: 'Z', label: L('Scheinwiderstand', 'Impedance'), spoiler: true },
    { key: 'phi', label: L('Phasenverschiebung', 'Phase shift'), spoiler: true },
    { key: 'I', label: L('Stromstärke', 'Current'), spoiler: true },
    { key: 'parts', label: L('Teilspannungen', 'Partial voltages'), spoiler: true },
    { key: 'P', label: L('Leistung', 'Power'), spoiler: true },
    { key: 'res', label: L('Resonanz', 'Resonance') },
  ],
  presets: [
    { id: 'r', label: L('Nur Widerstand', 'Resistor only'), values: { kreis: 'R' } },
    { id: 'l', label: L('Nur Spule', 'Coil only'), values: { kreis: 'L' } },
    { id: 'c', label: L('Nur Kondensator', 'Capacitor only'), values: { kreis: 'C' } },
    { id: 'rlc', label: L('Reihenschwingkreis', 'Series RLC'), values: { kreis: 'RLC', f: 50 } },
    { id: 'res', label: L('Resonanz', 'Resonance'), values: { kreis: 'RLC', Lm: 500, C: 20, f: 50, R: 50 } },
  ],
  strings: {
    de: {
      canvas: 'Zeigerdiagramm mit sich drehenden Zeigern für Spannung und Strom, darunter bzw. daneben die Liniendiagramme u(t), i(t) und p(t)',
      t: 't in ms',
      u: 'u in V',
      p: 'p in W',
      iScaled: 'i (skaliert)',
      Xval: 'X_L = 2π · f · L ≈ {XL} Ω, X_C = 1 / (2π · f · C) ≈ {XC} Ω',
      XvalL: 'X_L = 2π · f · L = 2π · {f} Hz · {L} H ≈ {XL} Ω',
      XvalC: 'X_C = 1 / (2π · f · C) = 1 / (2π · {f} Hz · {C} µF) ≈ {XC} Ω',
      XvalR: 'kein Blindwiderstand',
      Zval: 'Z = √(R² + (X_L − X_C)²) ≈ {Z} Ω',
      phiVal: 'φ ≈ {deg}° ({how})',
      lag: 'der Strom eilt der Spannung nach',
      lead: 'der Strom eilt der Spannung voraus',
      inPhase: 'Strom und Spannung sind in Phase',
      Ival: 'I = U / Z ≈ {I} mA (Spitzenwert Î = √2 · I ≈ {Ip} mA)',
      partsVal: 'U_R ≈ {UR} V, U_L ≈ {UL} V, U_C ≈ {UC} V – sie addieren sich als Zeiger, nicht als Zahlen.',
      Pval: 'Wirkleistung P = U · I · cos φ ≈ {P} W, Blindleistung Q ≈ {Q} var, Scheinleistung S = U · I ≈ {S} VA',
      resVal: 'f₀ = 1 / (2π · √(L · C)) ≈ {f0} Hz',
      mean: 'P (Mittelwert)',
    },
    en: {
      canvas: 'Phasor diagram with rotating phasors for voltage and current, with line graphs of u(t), i(t) and p(t)',
      t: 't in ms',
      u: 'u in V',
      p: 'p in W',
      iScaled: 'i (rescaled)',
      Xval: 'X_L = 2π · f · L ≈ {XL} Ω, X_C = 1 / (2π · f · C) ≈ {XC} Ω',
      XvalL: 'X_L = 2π · f · L = 2π · {f} Hz · {L} H ≈ {XL} Ω',
      XvalC: 'X_C = 1 / (2π · f · C) = 1 / (2π · {f} Hz · {C} µF) ≈ {XC} Ω',
      XvalR: 'no reactance',
      Zval: 'Z = √(R² + (X_L − X_C)²) ≈ {Z} Ω',
      phiVal: 'φ ≈ {deg}° ({how})',
      lag: 'the current lags behind the voltage',
      lead: 'the current leads the voltage',
      inPhase: 'current and voltage are in phase',
      Ival: 'I = U / Z ≈ {I} mA (peak Î = √2 · I ≈ {Ip} mA)',
      partsVal: 'U_R ≈ {UR} V, U_L ≈ {UL} V, U_C ≈ {UC} V – they add as phasors, not as numbers.',
      Pval: 'real power P = U · I · cos φ ≈ {P} W, reactive power Q ≈ {Q} var, apparent power S = U · I ≈ {S} VA',
      resVal: 'f₀ = 1 / (2π · √(L · C)) ≈ {f0} Hz',
      mean: 'P (mean)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mk = (pick: (l: Lay) => Rect, equal: boolean) =>
      new Plot(surface, {
        x: [0, 1],
        y: [-1, 1],
        equalAspect: equal,
        pan: false,
        zoom: false,
        controls: false,
        region: (w, h) => {
          const r = pick(layout(w, h));
          return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
        },
      });
    const phasor = mk((l) => l.scene, true);
    const plot1 = mk((l) => l.chart1, false);
    const plot2 = mk((l) => l.chart2, false);
    phasor.setRange([-1.25, 1.25], [-1.25, 1.25]);

    /** Phase θ = ωt der Zeiger (läuft in Zeitlupe). */
    let theta = Math.PI / 3;
    let res: AcResult = calc();

    function calc(): AcResult {
      return seriesAc(p.kreis as Circuit, p.U, p.f, p.R, p.Lm / 1000, p.C * 1e-6);
    }
    const period = () => 1000 / p.f;

    function setupPlots(): void {
      const W = 2 * period();
      const U = Math.SQRT2 * p.U;
      plot1.setRangePadded([0, W], [-U * 1.2, U * 1.2], { left: 52, right: 14, top: 22, bottom: 24 });
      plot1.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('u') } });
      const lo = Math.min(-0.15 * res.S, res.P - res.S);
      const hi = res.P + res.S;
      plot2.setRangePadded([0, W], [lo * 1.15, hi * 1.15], { left: 52, right: 14, top: 22, bottom: 24 });
      plot2.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('p') } });
    }

    function updateReadouts(): void {
      const k = p.kreis as Circuit;
      const hasL = k.includes('L');
      const hasC = k.includes('C');
      if (hasL && hasC) ctx.readout('X', tr('Xval', { XL: fmt.num(res.XL, 1), XC: fmt.num(res.XC, 1) }));
      else if (hasL) ctx.readout('X', tr('XvalL', { f: fmt.num(p.f, 0), L: fmt.num(p.Lm / 1000, 3), XL: fmt.num(res.XL, 1) }));
      else if (hasC) ctx.readout('X', tr('XvalC', { f: fmt.num(p.f, 0), C: fmt.num(p.C, 0), XC: fmt.num(res.XC, 1) }));
      else ctx.readout('X', ctx.t('XvalR'));
      ctx.readout('Z', k.length > 1 ? tr('Zval', { Z: fmt.num(res.Z, 1) }) : `Z = ${fmt.num(res.Z, 1)} Ω`);
      const deg = (res.phi * 180) / Math.PI;
      const how = Math.abs(deg) < 0.05 ? 'inPhase' : deg > 0 ? 'lag' : 'lead';
      ctx.readout('phi', tr('phiVal', { deg: fmt.signed(Math.round(deg * 10) / 10), how: ctx.t(how) }));
      ctx.readout('I', tr('Ival', { I: fmt.num(1000 * res.Ieff, 1), Ip: fmt.num(1000 * Math.SQRT2 * res.Ieff, 1) }));
      ctx.readout('parts', k.length > 1 ? tr('partsVal', { UR: fmt.num(res.UR, 2), UL: fmt.num(res.UL, 2), UC: fmt.num(res.UC, 2) }) : null);
      ctx.readout('P', tr('Pval', { P: fmt.num(res.P, 3), Q: fmt.num(res.Q, 3), S: fmt.num(res.S, 3) }));
      ctx.readout('res', hasL && hasC ? tr('resVal', { f0: fmt.num(resonanceFrequency(p.Lm / 1000, p.C * 1e-6), 1) }) : null);
    }

    function drawPhasors(): void {
      const th = ctx.theme;
      const g = phasor.begin();
      const cu = th.series[0]!;
      const ci = th.series[1]!;
      phasor.circle(0, 0, 1, { stroke: withAlpha(th.muted, 0.35), width: 1.5 });
      phasor.segment([-1.15, 0], [1.15, 0], { color: withAlpha(th.muted, 0.5), width: 1 });
      phasor.segment([0, -1.15], [0, 1.15], { color: withAlpha(th.muted, 0.5), width: 1 });
      const k = p.kreis as Circuit;
      // Maßstab: der längste Spannungszeiger passt in den Kreis
      // Die Kette U_R → U_L → U_C kann weiter hinausreichen als U selbst
      const maxU = Math.max(p.U, res.UR, Math.hypot(res.UR, res.UL), Math.hypot(res.UR, res.UC));
      const s = 1 / maxU;
      const dir = (a: number): [number, number] => [Math.cos(a), Math.sin(a)];
      const ai = theta - res.phi;
      // Teilspannungen Kopf an Fuß (nur bei mehreren Bauteilen)
      if (k.length > 1) {
        let x = 0;
        let y = 0;
        const parts: [number, number, string, string][] = [];
        if (k.includes('R')) parts.push([res.UR, ai, th.series[2]!, 'U_R']);
        if (k.includes('L')) parts.push([res.UL, ai + Math.PI / 2, th.series[3]!, 'U_L']);
        if (k.includes('C')) parts.push([res.UC, ai - Math.PI / 2, th.series[4]!, 'U_C']);
        for (const [len, a, color, label] of parts) {
          const [dx, dy] = dir(a);
          const nx = x + dx * len * s;
          const ny = y + dy * len * s;
          if (len * s > 0.02) {
            phasor.arrow([x, y], [nx, ny], { color, width: 2.5, dash: [6, 4] });
            // Beschriftung seitlich neben der Pfeilmitte (rechts der Laufrichtung)
            const ox = dy * 14;
            const oy = dx * 14;
            phasor.text((x + nx) / 2, (y + ny) / 2, label, { color, size: 12, weight: 'bold', offset: [ox, oy], align: 'center', baseline: 'middle' });
          }
          x = nx;
          y = ny;
        }
      }
      // Gesamtspannung und Strom
      const [ux, uy] = dir(theta);
      phasor.arrow([0, 0], [ux * p.U * s, uy * p.U * s], { color: cu, width: 4 });
      const [ix, iy] = dir(ai);
      const il = 0.55;
      phasor.arrow([0, 0], [ix * il, iy * il], { color: ci, width: 4 });
      phasor.text(ux * p.U * s, uy * p.U * s, 'U', { color: cu, size: 14, weight: 'bold', offset: [ux * 16, -uy * 16], align: 'center', baseline: 'middle' });
      phasor.text(ix * il, iy * il, 'I', { color: ci, size: 14, weight: 'bold', offset: [ix * 16, -iy * 16], align: 'center', baseline: 'middle' });
      // Winkel φ
      if (Math.abs(res.phi) > 0.03) {
        const a0 = Math.min(theta, ai);
        const a1 = Math.max(theta, ai);
        phasor.arc(0, 0, 0.25, a0, a1, { stroke: th.text, width: 1.5 });
        const am = (a0 + a1) / 2;
        phasor.text(0.36 * Math.cos(am), 0.36 * Math.sin(am), 'φ', { color: th.text, size: 13, weight: 'bold' });
      }
      // Projektion: Momentanwerte
      phasor.segment([ux * p.U * s, uy * p.U * s], [1.2, uy * p.U * s], { color: withAlpha(cu, 0.5), width: 1, dash: [3, 4] });
      phasor.point(1.2, uy * p.U * s, { color: cu, radius: 4 });
      phasor.end();
      void g;
    }

    function drawCharts(): void {
      const th = ctx.theme;
      const W = 2 * period();
      const n = 320;
      const T = period();
      const tNow = ((((theta / (2 * Math.PI)) % 2) + 2) % 2) * T;
      const scaleI = res.Ieff > 0 ? p.U / res.Ieff : 1;
      const at = (ms: number) => instant(p.U, res, (2 * Math.PI * ms) / T);
      const pts = (f: (ms: number) => number) => {
        const a: [number, number][] = [];
        for (let k = 0; k <= n; k++) a.push([(W * k) / n, f((W * k) / n)]);
        return a;
      };
      plot1.begin();
      plot1.grid({ minor: false });
      plot1.axes();
      plot1.polyline(pts((ms) => at(ms).u), { color: th.series[0]!, width: 3 });
      plot1.polyline(pts((ms) => at(ms).i * scaleI), { color: th.series[1]!, width: 3 });
      plot1.vline(tNow, { color: withAlpha(th.muted, 0.6), width: 1.5, dash: [4, 4] });
      plot1.point(tNow, at(tNow).u, { color: th.series[0]!, radius: 5 });
      plot1.point(tNow, at(tNow).i * scaleI, { color: th.series[1]!, radius: 5 });
      plot1.text(W * 0.13, Math.SQRT2 * p.U * 1.02, 'u', { color: th.series[0]!, size: 13, weight: 'bold', offset: [0, -12] });
      plot1.text(W * 0.7, -Math.SQRT2 * p.U * 1.05, ctx.t('iScaled'), { color: th.series[1]!, size: 12, weight: 'bold', offset: [0, 0] });
      plot1.end();
      plot2.begin();
      plot2.grid({ minor: false });
      plot2.axes();
      const pp = pts((ms) => at(ms).p);
      plot2.polygon([[0, 0], ...pp, [W, 0]], { fill: withAlpha(th.series[2]!, 0.15) });
      plot2.polyline(pp, { color: th.series[2]!, width: 3 });
      plot2.hline(res.P, { color: th.series[3]!, width: 2, dash: [7, 5] });
      plot2.text(W * 0.97, res.P, ctx.t('mean'), { color: th.series[3]!, size: 12, weight: 'bold', align: 'right', offset: [0, -12] });
      plot2.vline(tNow, { color: withAlpha(th.muted, 0.6), width: 1.5, dash: [4, 4] });
      plot2.point(tNow, at(tNow).p, { color: th.series[2]!, radius: 5 });
      plot2.end();
    }

    return {
      update() {
        res = calc();
        setupPlots();
        updateReadouts();
      },

      tick(dt) {
        const speed = Number(p.tempo) || 0.5;
        // eine Umdrehung in 4 s bei Zeitlupe 1
        theta = (theta + ((2 * Math.PI) / 4) * speed * dt) % (4 * Math.PI);
      },

      resetTime() {
        theta = Math.PI / 3;
      },

      render() {
        phasor.resize();
        plot1.resize();
        plot2.resize();
        surface.begin();
        drawPhasors();
        drawCharts();
      },

      destroy: () => surface.destroy(),
    };
  },
});
