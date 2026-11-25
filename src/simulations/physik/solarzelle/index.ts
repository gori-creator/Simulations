import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { arrayCurrent, arrayVoc, ISC_STC, maxPower, operatingPoint, type Array } from './model';

const L = (de: string, en: string) => ({ de, en });

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.46);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.45);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Solarmodule: Kennlinie, Arbeitspunkt mit Lastwiderstand und Punkt maximaler
 * Leistung; Reihen- und Parallelschaltung, Licht, Einfallswinkel, Schatten.
 */
export default defineSimulation({
  id: 'solarzelle',
  layout: { aspect: 1.7, aspectNarrow: 1.05 },
  params: [
    { key: 'E', type: 'number', label: L('Bestrahlungsstärke', 'Irradiance'), min: 0, max: 1000, step: 10, default: 800, unit: 'W/m²' },
    { key: 'w', type: 'number', label: L('Einfallswinkel des Lichts', 'Angle of incidence'), min: 0, max: 85, step: 5, default: 0, unit: '°' },
    { key: 'ns', type: 'number', label: L('Module in Reihe', 'Modules in series'), min: 1, max: 4, step: 1, default: 2 },
    { key: 'np', type: 'number', label: L('Stränge parallel', 'Strings in parallel'), min: 1, max: 3, step: 1, default: 1 },
    { key: 'sch', type: 'number', label: L('Schatten auf einem Modul', 'Shade on one module'), min: 0, max: 100, step: 5, default: 0, unit: '%' },
    { key: 'R', type: 'number', label: L('Lastwiderstand', 'Load resistance'), min: 0.5, max: 100, step: 0.5, default: 8, unit: 'Ω' },
  ],
  hint: L(
    'Verändere den Lastwiderstand, bis der Arbeitspunkt im Leistungsmaximum liegt. Was bewirkt Schatten auf nur einem Modul?',
    'Change the load resistance until the operating point lies at maximum power. What does shade on just one module do?',
  ),
  readouts: [
    { key: 'oc', label: L('Leerlauf / Kurzschluss', 'Open circuit / short circuit') },
    { key: 'op', label: L('Arbeitspunkt', 'Operating point'), spoiler: true },
    { key: 'mpp', label: L('Maximale Leistung', 'Maximum power'), spoiler: true },
  ],
  presets: [
    { id: 'eins', label: L('Ein Modul', 'One module'), values: { E: 1000, w: 0, ns: 1, np: 1, sch: 0, R: 4 } },
    { id: 'reihe', label: L('Drei in Reihe', 'Three in series'), values: { E: 1000, w: 0, ns: 3, np: 1, sch: 0, R: 12 } },
    { id: 'parallel', label: L('Drei parallel', 'Three in parallel'), values: { E: 1000, w: 0, ns: 1, np: 3, sch: 0, R: 1.5 } },
    { id: 'schatten', label: L('Ein Modul halb im Schatten', 'One module half shaded'), values: { E: 1000, w: 0, ns: 3, np: 1, sch: 50, R: 12 } },
    { id: 'abend', label: L('Abendsonne, flach', 'Evening sun, low'), values: { E: 400, w: 70, ns: 2, np: 1, sch: 0, R: 8 } },
  ],
  strings: {
    de: {
      canvas: 'Solarmodule in Reihe und parallel unter der Sonne, ein Modul eventuell teilweise im Schatten; daneben die Strom-Spannungs-Kennlinie mit Widerstandsgerade, Arbeitspunkt und Leistungsmaximum',
      ocVal: 'U₀ ≈ {U} V, I_K ≈ {I} A',
      opVal: 'U ≈ {U} V, I ≈ {I} A, P ≈ {P} W',
      mppVal: 'P_max ≈ {P} W bei U ≈ {U} V (R ≈ {R} Ω)',
      UAx: 'U in V',
      IAx: 'I in A',
      load: 'R',
      mpp: 'MPP',
      Pcurve: 'P(U)',
      sun: '{E} W/m²',
      angle: '{w}°',
      shade: 'Schatten',
    },
    en: {
      canvas: 'Solar modules in series and parallel under the sun, one module possibly partly shaded; next to it the current-voltage characteristic with load line, operating point and maximum power point',
      ocVal: 'U₀ ≈ {U} V, I_sc ≈ {I} A',
      opVal: 'U ≈ {U} V, I ≈ {I} A, P ≈ {P} W',
      mppVal: 'P_max ≈ {P} W at U ≈ {U} V (R ≈ {R} Ω)',
      UAx: 'U in V',
      IAx: 'I in A',
      load: 'R',
      mpp: 'MPP',
      Pcurve: 'P(U)',
      sun: '{E} W/m²',
      angle: '{w}°',
      shade: 'shade',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 10],
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

    const arr = (): Array => ({ series: p.ns, parallel: p.np, E: p.E, angle: p.w, shade: p.sch / 100 });
    const uMax = () => p.ns * 2.5;
    const iMax = () => p.np * ISC_STC * 1.1;

    function updateReadouts(): void {
      const a = arr();
      const op = operatingPoint(a, p.R);
      const m = maxPower(a);
      ctx.readout('oc', { html: tr('ocVal', { U: fmt.num(arrayVoc(a), 2), I: fmt.num(arrayCurrent(0, a), 3) }).replace('I_K', 'I<sub>K</sub>').replace('I_sc', 'I<sub>sc</sub>') });
      ctx.readout('op', tr('opVal', { U: fmt.num(op.U, 2), I: fmt.num(op.I, 3), P: fmt.num(op.U * op.I, 2) }));
      ctx.readout(
        'mpp',
        { html: tr('mppVal', { P: fmt.num(m.P, 2), U: fmt.num(m.U, 2), R: m.I > 0 ? fmt.num(m.U / m.I, 1) : '–' }).replace('P_max', 'P<sub>max</sub>') },
      );
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      // Sonne
      const sx = r.x + 34;
      const sy = r.y + 34;
      const sunC = th.series[3]!;
      const glow = Math.min(1, p.E / 1000);
      g.fillStyle = withAlpha(sunC, 0.25 + 0.7 * glow);
      g.beginPath();
      g.arc(sx, sy, 16, 0, Math.PI * 2);
      g.fill();
      subText(g, tr('sun', { E: fmt.num(p.E, 0) }), sx + 24, sy, { size: 12, family: th.font, weight: 600, color: th.text, align: 'left', halo: th.bg });
      // Modulfeld
      const top = r.y + 76;
      const bottom = r.y + r.h - 20;
      const left = r.x + 20;
      const right = r.x + r.w - 20;
      const cols = p.ns;
      const rows = p.np;
      const gap = 10;
      const mw = Math.min(90, (right - left - gap * (cols - 1)) / cols);
      const mh = Math.min(mw * 0.7, (bottom - top - gap * (rows - 1)) / rows);
      const x0 = left + (right - left - (mw * cols + gap * (cols - 1))) / 2;
      const y0 = top + (bottom - top - (mh * rows + gap * (rows - 1))) / 2;
      // Lichtstrahlen unter dem Einfallswinkel
      const a = (p.w * Math.PI) / 180;
      if (p.E > 0) {
        g.strokeStyle = withAlpha(sunC, 0.25 + 0.5 * glow);
        g.lineWidth = 1.5;
        for (let k = 0; k < 4; k++) {
          const tx = x0 + ((k + 0.5) / 4) * (mw * cols + gap * (cols - 1));
          const ty = y0;
          const len = 40;
          g.beginPath();
          g.moveTo(tx - len * Math.sin(a), ty - len * Math.cos(a));
          g.lineTo(tx, ty);
          g.stroke();
        }
        subText(g, tr('angle', { w: p.w }), x0 + mw * cols + gap * (cols - 1), y0 - 18, { size: 12, family: th.font, weight: 600, color: th.muted, align: 'right', halo: th.bg });
      }
      const lit = Math.max(0, Math.cos(a)) * (p.E / 1000);
      for (let rr = 0; rr < rows; rr++) {
        for (let c = 0; c < cols; c++) {
          const x = x0 + c * (mw + gap);
          const y = y0 + rr * (mh + gap);
          g.fillStyle = withAlpha(th.series[0]!, 0.25 + 0.5 * lit);
          g.fillRect(x, y, mw, mh);
          g.strokeStyle = th.text;
          g.lineWidth = 1.5;
          g.strokeRect(x, y, mw, mh);
          g.strokeStyle = withAlpha(th.text, 0.4);
          g.lineWidth = 1;
          for (let k = 1; k < 4; k++) {
            g.beginPath();
            g.moveTo(x + (k * mw) / 4, y);
            g.lineTo(x + (k * mw) / 4, y + mh);
            g.stroke();
          }
          if (rr === 0 && c === 0 && p.sch > 0) {
            g.fillStyle = withAlpha(th.text, 0.55);
            g.fillRect(x, y, (mw * p.sch) / 100, mh);
            subText(g, ctx.t('shade'), x + 4, y + mh + 12, { size: 11, family: th.font, weight: 600, color: th.muted, align: 'left', halo: th.bg });
          }
          // Verbindungen in Reihe
          if (c > 0) {
            g.strokeStyle = th.text;
            g.lineWidth = 2;
            g.beginPath();
            g.moveTo(x - gap, y + mh / 2);
            g.lineTo(x, y + mh / 2);
            g.stroke();
          }
        }
      }
      // Sammelleitungen für parallele Stränge
      if (rows > 1) {
        const xl = x0 - 8;
        const xr = x0 + mw * cols + gap * (cols - 1) + 8;
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(xl, y0 + mh / 2);
        g.lineTo(xl, y0 + (rows - 1) * (mh + gap) + mh / 2);
        g.moveTo(xr, y0 + mh / 2);
        g.lineTo(xr, y0 + (rows - 1) * (mh + gap) + mh / 2);
        for (let rr = 0; rr < rows; rr++) {
          const y = y0 + rr * (mh + gap) + mh / 2;
          g.moveTo(xl, y);
          g.lineTo(x0, y);
          g.moveTo(xr, y);
          g.lineTo(xr - 8, y);
        }
        g.stroke();
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      const a = arr();
      const ref: Array = { ...a, E: 1000, angle: 0, shade: 0 };
      const pRef = maxPower(ref).P || 1;
      const k = (iMax() * 0.95) / pRef;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const voc = arrayVoc(a);
      if (voc > 0) plot.fn((U) => U * arrayCurrent(U, a) * k, { color: th.series[2]!, width: 1.5, dash: [5, 4], from: 0, to: Math.min(voc, uMax()) });
      if (voc > 0) plot.fn((U) => arrayCurrent(U, a), { color: th.series[0]!, width: 2.5, from: 0, to: Math.min(voc, uMax()) });
      plot.fn((U) => U / p.R, { color: th.muted, width: 1.5, from: 0, to: uMax() });
      const op = operatingPoint(a, p.R);
      const m = maxPower(a);
      if (m.P > 0) {
        plot.point(m.U, m.I, { color: th.series[2]!, radius: 5 });
        plot.text(m.U, m.I, ctx.t('mpp'), { color: th.series[2]!, align: 'left', offset: [8, -10], size: 12, weight: 'bold' });
        plot.text(m.U, m.P * k, ctx.t('Pcurve'), { color: th.series[2]!, align: 'right', offset: [-6, -8], size: 11 });
      }
      plot.point(op.U, op.I, { color: th.series[3]!, radius: 6 });
      const lx = Math.min(uMax() * 0.92, iMax() * p.R * 0.9);
      plot.text(lx, lx / p.R, ctx.t('load'), { color: th.muted, align: 'left', offset: [6, 0], size: 13, weight: 'bold' });
      plot.end();
    }

    return {
      update() {
        plot.setRangePadded([0, uMax()], [0, iMax()], { left: 40, right: 12, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('UAx') }, y: { label: ctx.t('IAx') } });
        updateReadouts();
      },
      render() {
        surface.begin();
        const sp = split(surface.width, surface.height);
        plot.resize();
        drawScene(sp.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
