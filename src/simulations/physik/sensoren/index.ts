import { defineSimulation, Plot, Surface, subText, text, withAlpha, type Rect } from '../../../sim-core';
import { dividerOutput, ldrResistance, ntcResistance } from './model';

const L = (de: string, en: string) => ({ de, en });
const U0 = 5;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.48);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.5);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Sensoren: Heißleiter oder Fotowiderstand im Spannungsteiler; die Spannung
 * am Festwiderstand schaltet über eine Schwelle einen Lüfter oder eine Lampe.
 */
export default defineSimulation({
  id: 'sensoren',
  layout: { aspect: 1.7, aspectNarrow: 1.05 },
  params: [
    {
      key: 'sensor',
      type: 'choice',
      label: L('Sensor', 'Sensor'),
      options: [
        { value: 'ntc', label: L('Heißleiter (Temperatur)', 'thermistor (temperature)') },
        { value: 'ldr', label: L('Fotowiderstand (Licht)', 'photoresistor (light)') },
      ],
      default: 'ntc',
      display: 'buttons',
    },
    { key: 'T', type: 'number', label: L('Temperatur', 'Temperature'), min: -20, max: 100, step: 1, default: 25, unit: '°C', visibleIf: (v) => v.sensor === 'ntc' },
    { key: 'lg', type: 'number', label: L('Helligkeit (Zehnerpotenz der Lux)', 'Brightness (power of ten of lux)'), min: 0, max: 4, step: 0.1, default: 2, visibleIf: (v) => v.sensor === 'ldr' },
    { key: 'Rf', type: 'number', label: L('Festwiderstand', 'Fixed resistor'), min: 1, max: 100, step: 1, default: 10, unit: 'kΩ' },
    { key: 'Us', type: 'number', label: L('Schaltschwelle', 'Switching threshold'), min: 0.5, max: 4.5, step: 0.1, default: 3, unit: 'V' },
  ],
  hint: (v) =>
    v.sensor === 'ldr'
      ? L('Dämmerungsschalter: Wird es dunkel, sinkt die Spannung unter die Schwelle – die Lampe geht an.', 'Twilight switch: when it gets dark, the voltage drops below the threshold – the lamp switches on.')
      : L('Temperaturschalter: Wird es warm, steigt die Spannung über die Schwelle – der Lüfter springt an.', 'Temperature switch: when it gets warm, the voltage rises above the threshold – the fan switches on.'),
  readouts: [
    { key: 'R', label: L('Widerstand des Sensors', 'Sensor resistance') },
    { key: 'U', label: L('Ausgangsspannung', 'Output voltage'), spoiler: true },
    { key: 'S', label: L('Schalter', 'Switch') },
  ],
  presets: [
    { id: 'kalt', label: L('Heißleiter, kalt', 'Thermistor, cold'), values: { sensor: 'ntc', T: 10, Rf: 10, Us: 3 } },
    { id: 'warm', label: L('Heißleiter, 50 °C', 'Thermistor, 50 °C'), values: { sensor: 'ntc', T: 50, Rf: 10, Us: 3 } },
    { id: 'tag', label: L('Tageslicht', 'Daylight'), values: { sensor: 'ldr', lg: 3, Rf: 10, Us: 2.5 } },
    { id: 'nacht', label: L('Dämmerung', 'Dusk'), values: { sensor: 'ldr', lg: 0.5, Rf: 10, Us: 2.5 } },
  ],
  strings: {
    de: {
      canvas: 'Spannungsteiler aus Sensor und Festwiderstand an 5 V; ein Messgerät zeigt die Spannung am Festwiderstand, ein Schalter steuert Lüfter oder Lampe; daneben Diagramm der Spannung über Temperatur oder Helligkeit',
      RVal: 'R ≈ {R} kΩ',
      UVal: 'U ≈ {U} V',
      fanOn: 'Lüfter an',
      fanOff: 'Lüfter aus',
      lampOn: 'Lampe an',
      lampOff: 'Lampe aus',
      TAx: 'ϑ in °C',
      EAx: 'lg(E in lx)',
      UAx: 'U in V',
      thr: 'Schwelle',
      sensor: 'Sensor',
      fixed: 'Festwiderstand',
      lux: '{E} lx',
    },
    en: {
      canvas: 'Voltage divider made of sensor and fixed resistor at 5 V; a meter shows the voltage across the fixed resistor, a switch controls a fan or lamp; next to it a graph of voltage against temperature or brightness',
      RVal: 'R ≈ {R} kΩ',
      UVal: 'U ≈ {U} V',
      fanOn: 'fan on',
      fanOff: 'fan off',
      lampOn: 'lamp on',
      lampOff: 'lamp off',
      TAx: 'ϑ in °C',
      EAx: 'lg(E in lx)',
      UAx: 'U in V',
      thr: 'threshold',
      sensor: 'sensor',
      fixed: 'fixed resistor',
      lux: '{E} lx',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [-20, 100],
      y: [0, 5],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const isNtc = () => p.sensor === 'ntc';
    const rSensor = () => (isNtc() ? ntcResistance(p.T) : ldrResistance(10 ** p.lg));
    const uOut = () => dividerOutput(U0, rSensor(), p.Rf);
    /** NTC: an bei Überschreiten; LDR (Dämmerungsschalter): an bei Unterschreiten. */
    const on = () => (isNtc() ? uOut() > p.Us : uOut() < p.Us);

    function updateReadouts(): void {
      const R = rSensor();
      ctx.readout('R', tr('RVal', { R: fmt.num(R, R < 10 ? 2 : 1) }));
      ctx.readout('U', tr('UVal', { U: fmt.num(uOut(), 2) }));
      ctx.readout('S', ctx.t(isNtc() ? (on() ? 'fanOn' : 'fanOff') : on() ? 'lampOn' : 'lampOff'));
    }

    function resistor(x: number, y: number, h: number, w: number, label: string, sensor: boolean): void {
      const g = surface.g;
      const th = ctx.theme;
      g.fillStyle = th.bg;
      g.fillRect(x - w / 2, y - h / 2, w, h);
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.strokeRect(x - w / 2, y - h / 2, w, h);
      if (sensor) {
        if (isNtc()) {
          g.beginPath();
          g.moveTo(x - w, y + h / 2 + 4);
          g.lineTo(x - w / 2, y + h / 2 + 4);
          g.lineTo(x + w, y - h / 2 - 4);
          g.stroke();
          subText(g, 'ϑ', x - w - 4, y + h / 2 + 4, { size: 13, family: th.mathFont, weight: 700, color: th.text, align: 'right', halo: th.bg });
        } else {
          g.strokeStyle = th.series[3]!;
          for (const dy of [-8, 6]) {
            g.beginPath();
            g.moveTo(x - w - 16, y + dy - 12);
            g.lineTo(x - w / 2 - 4, y + dy);
            g.stroke();
          }
        }
      }
      subText(g, label, x + w / 2 + 8, y, { size: 12, family: th.font, weight: 600, color: th.muted, align: 'left', halo: th.bg });
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const x = r.x + r.w * 0.32;
      const yTop = r.y + 30;
      const yBot = r.y + r.h - 30;
      const yMid = (yTop + yBot) / 2;
      const rh = Math.min(60, (yBot - yTop) * 0.28);
      const rw = 18;
      // Leitungen
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x + 30, yTop);
      g.lineTo(x, yTop);
      g.lineTo(x, yBot);
      g.lineTo(r.x + 30, yBot);
      g.moveTo(x, yMid);
      g.lineTo(r.x + r.w * 0.62, yMid);
      g.stroke();
      subText(g, '+5 V', r.x + 30, yTop - 12, { size: 13, family: th.font, weight: 700, color: th.text, align: 'left', halo: th.bg });
      subText(g, '0 V', r.x + 30, yBot + 12, { size: 13, family: th.font, weight: 700, color: th.text, align: 'left', halo: th.bg });
      resistor(x, (yTop + yMid) / 2, rh, rw, ctx.t('sensor'), true);
      resistor(x, (yMid + yBot) / 2, rh, rw, `${fmt.num(p.Rf, 0)} kΩ`, false);
      g.fillStyle = th.text;
      g.beginPath();
      g.arc(x, yMid, 4, 0, Math.PI * 2);
      g.fill();
      // Messgerät (Spannung am Festwiderstand)
      const mx = r.x + r.w * 0.62;
      const mr = Math.min(30, r.w * 0.07);
      g.fillStyle = th.bg;
      g.strokeStyle = th.text;
      g.beginPath();
      g.arc(mx, yMid, mr, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      subText(g, `${fmt.num(uOut(), 2)} V`, mx, yMid, { size: 13, family: th.font, weight: 700, color: th.text });
      // Schaltausgang
      const ox = r.x + r.w * 0.86;
      g.strokeStyle = th.muted;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(mx + mr, yMid);
      g.lineTo(ox - 22, yMid);
      g.stroke();
      g.setLineDash([]);
      const active = on();
      const col = isNtc() ? th.series[0]! : th.series[3]!;
      if (isNtc()) {
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(ox, yMid, 20, 0, Math.PI * 2);
        g.stroke();
        for (let k = 0; k < 3; k++) {
          const a = (k * 2 * Math.PI) / 3 + (active ? 0.6 : 0);
          g.fillStyle = withAlpha(col, active ? 0.8 : 0.3);
          g.beginPath();
          g.ellipse(ox + 9 * Math.cos(a), yMid + 9 * Math.sin(a), 9, 4, a, 0, Math.PI * 2);
          g.fill();
        }
      } else {
        g.fillStyle = withAlpha(col, active ? 0.85 : 0.12);
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(ox, yMid, 18, 0, Math.PI * 2);
        g.fill();
        g.stroke();
      }
      text(g, ctx.t(isNtc() ? (active ? 'fanOn' : 'fanOff') : active ? 'lampOn' : 'lampOff'), ox, yMid + 36, { font: `700 12px ${th.font}`, color: active ? col : th.muted });
      if (!isNtc()) subText(g, tr('lux', { E: fmt.num(10 ** p.lg, 10 ** p.lg < 10 ? 1 : 0) }), x - 30, yTop + 16, { size: 12, family: th.font, weight: 600, color: th.series[3]!, align: 'right', halo: th.bg });
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (isNtc()) {
        plot.fn((T) => dividerOutput(U0, ntcResistance(T), p.Rf), { color: th.series[0]!, width: 2.5, from: -20, to: 100 });
        plot.point(p.T, uOut(), { color: th.series[0]!, radius: 5 });
        plot.hline(p.Us, { color: th.series[3]!, dash: [5, 4], width: 1.5 });
        plot.text(-18, p.Us, ctx.t('thr'), { color: th.series[3]!, align: 'left', offset: [0, -10], size: 11 });
      } else {
        plot.fn((l) => dividerOutput(U0, ldrResistance(10 ** l), p.Rf), { color: th.series[0]!, width: 2.5, from: 0, to: 4 });
        plot.point(p.lg, uOut(), { color: th.series[0]!, radius: 5 });
        plot.hline(p.Us, { color: th.series[3]!, dash: [5, 4], width: 1.5 });
        plot.text(0.05, p.Us, ctx.t('thr'), { color: th.series[3]!, align: 'left', offset: [0, -10], size: 11 });
      }
      plot.end();
    }

    return {
      update() {
        if (isNtc()) {
          plot.setRangePadded([-20, 100], [0, 5], { left: 32, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('TAx') }, y: { label: ctx.t('UAx') } });
        } else {
          plot.setRangePadded([0, 4], [0, 5], { left: 32, right: 12, top: 22, bottom: 24 });
          plot.setAxes({ x: { label: ctx.t('EAx') }, y: { label: ctx.t('UAx') } });
        }
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
