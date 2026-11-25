import { defineSimulation, Plot, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { omegaAfter, rollAcceleration, rotEnergy, SHAPE, skaterInertia, type BodyId } from './model';

const L = (de: string, en: string) => ({ de, en });
const MB = 50;
const RB = 0.15;
const MA = 4;
const R0 = 0.8;
const RAMP = 2;
const BODIES: BodyId[] = ['ball', 'disk', 'ring', 'box'];

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.55);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.55);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/**
 * Drehimpuls und Trägheitsmoment: Pirouette einer Eiskunstläuferin
 * (Drehimpulserhaltung) und Wettrollen von Kugel, Scheibe und Ring.
 */
export default defineSimulation({
  id: 'drehimpuls',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'pirouette', label: L('Pirouette (Drehimpulserhaltung)', 'Pirouette (conservation of angular momentum)') },
        { value: 'rollen', label: L('Wettrollen (Trägheitsmoment)', 'Rolling race (moment of inertia)') },
      ],
      default: 'pirouette',
    },
    { key: 'r', type: 'number', label: L('Abstand der Hände von der Drehachse', 'Distance of the hands from the axis'), min: 0.2, max: 0.9, step: 0.05, default: 0.8, unit: 'm', visibleIf: (v) => v.mode === 'pirouette' },
    { key: 'w0', type: 'number', label: L('Drehzahl mit ausgestreckten Armen (0,8 m)', 'Rotation rate with outstretched arms (0.8 m)'), min: 0.5, max: 2, step: 0.1, default: 1, unit: '1/s', visibleIf: (v) => v.mode === 'pirouette' },
    { key: 'alpha', type: 'number', label: L('Neigung der Rampe', 'Slope of the ramp'), min: 5, max: 40, step: 1, default: 15, unit: '°', visibleIf: (v) => v.mode === 'rollen' },
  ],
  hint: (v) =>
    v.mode === 'pirouette'
      ? L('Zieh die Arme an (Regler nach links): Die Läuferin dreht sich schneller, der Drehimpuls bleibt gleich.', 'Pull the arms in (slider to the left): the skater spins faster, angular momentum stays the same.')
      : L('Alle Körper haben dieselbe Masse und denselben Radius. Wer ist zuerst unten?', 'All bodies have the same mass and radius. Who reaches the bottom first?'),
  actions: [{ id: 'go', label: L('Loslassen', 'Release'), primary: true, visibleIf: (v) => v.mode === 'rollen' }],
  readouts: [
    { key: 'J', label: L('Trägheitsmoment', 'Moment of inertia'), spoiler: true },
    { key: 'w', label: L('Drehzahl', 'Rotation rate'), spoiler: true },
    { key: 'Lv', label: L('Drehimpuls', 'Angular momentum') },
    { key: 'E', label: L('Rotationsenergie', 'Rotational energy'), spoiler: true },
    { key: 'race', label: L('Ergebnis', 'Result'), spoiler: true },
  ],
  presets: [
    { id: 'out', label: L('Arme ausgestreckt', 'Arms out'), values: { mode: 'pirouette', r: 0.8 } },
    { id: 'in', label: L('Arme angezogen', 'Arms in'), values: { mode: 'pirouette', r: 0.2 } },
    { id: 'race', label: L('Wettrollen 15°', 'Rolling race 15°'), values: { mode: 'rollen', alpha: 15 } },
  ],
  strings: {
    de: {
      canvas: 'Eiskunstläuferin von oben mit ausgestreckten oder angezogenen Armen und Diagramm der Drehzahl; oder eine Rampe, auf der Kugel, Scheibe, Ring und Kiste um die Wette rollen',
      Jval: 'J = ½ · m_Rumpf · r_Rumpf² + 2 · m_Arm · r² ≈ {J} kg · m²',
      wval: 'ω = ω₀ · J₀ / J ≈ {w} 1/s',
      Lval: 'L = J · ω ≈ {L} kg · m²/s (bleibt gleich)',
      Eval: 'E = ½ · J · ω² ≈ {E} J (ausgestreckt: {E0} J)',
      race: 'Reihenfolge: {order}',
      r: 'r in m',
      wAxis: 'ω in 1/s',
      t: 't in s',
      s: 's in m',
      ball: 'Kugel',
      disk: 'Scheibe',
      ring: 'Ring',
      box: 'Kiste (gleitet reibungsfrei)',
      boxShort: 'Kiste',
      go: 'Loslassen',
      again: 'Noch einmal',
    },
    en: {
      canvas: 'Figure skater seen from above with arms out or in and a graph of the rotation rate; or a ramp on which a ball, disc, ring and box race',
      Jval: 'J = ½ · m_body · r_body² + 2 · m_arm · r² ≈ {J} kg · m²',
      wval: 'ω = ω₀ · J₀ / J ≈ {w} 1/s',
      Lval: 'L = J · ω ≈ {L} kg · m²/s (stays the same)',
      Eval: 'E = ½ · J · ω² ≈ {E} J (arms out: {E0} J)',
      race: 'order: {order}',
      r: 'r in m',
      wAxis: 'ω in 1/s',
      t: 't in s',
      s: 's in m',
      ball: 'ball',
      disk: 'disc',
      ring: 'ring',
      box: 'box (slides without friction)',
      boxShort: 'box',
      go: 'Release',
      again: 'Again',
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
    let angle = 0;
    let t = 0;
    let running = false;

    const J0 = () => skaterInertia(MB, RB, MA, R0);
    const J = () => skaterInertia(MB, RB, MA, p.r);
    const w = () => omegaAfter(J0(), p.w0, J()); // in 1/s
    const acc = (b: BodyId) => rollAcceleration(SHAPE[b], (p.alpha * Math.PI) / 180);
    const tEnd = () => Math.sqrt((2 * RAMP) / acc('ring')) * 1.05;

    function setupPlot(): void {
      if (p.mode === 'pirouette') {
        plot.setRangePadded([0, 0.9], [0, omegaAfter(J0(), p.w0, skaterInertia(MB, RB, MA, 0.2)) * 1.1], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('r') }, y: { label: ctx.t('wAxis') } });
      } else {
        plot.setRangePadded([0, tEnd()], [0, RAMP * 1.08], { left: 46, right: 14, top: 22, bottom: 24 });
        plot.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('s') } });
      }
    }

    function updateReadouts(): void {
      for (const k of ['J', 'w', 'Lv', 'E', 'race']) ctx.readout(k, null);
      if (p.mode === 'pirouette') {
        const W = 2 * Math.PI;
        ctx.readout('J', tr('Jval', { J: fmt.num(J(), 2) }));
        ctx.readout('w', tr('wval', { w: fmt.num(w(), 2) }));
        ctx.readout('Lv', tr('Lval', { L: fmt.num(J() * w() * W, 1) }));
        ctx.readout('E', tr('Eval', { E: fmt.num(rotEnergy(J(), w() * W), 0), E0: fmt.num(rotEnergy(J0(), p.w0 * W), 0) }));
      } else {
        const order = [...BODIES].sort((a, b) => acc(b) - acc(a)).map((b) => ctx.t(b === 'box' ? 'boxShort' : b));
        ctx.readout('race', tr('race', { order: order.join(' – ') }));
      }
    }

    function drawSkater(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const scale = Math.min(r.w, r.h) * 0.45;
      // Eisfläche
      g.fillStyle = withAlpha(th.series[0]!, 0.06);
      g.beginPath();
      g.arc(cx, cy, scale * 1.05, 0, Math.PI * 2);
      g.fill();
      const rr = p.r * scale;
      const ca = Math.cos(angle);
      const sa = Math.sin(angle);
      // Arme
      g.strokeStyle = th.text;
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - ca * rr, cy - sa * rr);
      g.lineTo(cx + ca * rr, cy + sa * rr);
      g.stroke();
      g.lineCap = 'butt';
      // Hände (Massen)
      g.fillStyle = th.series[1]!;
      for (const sgn of [-1, 1]) {
        g.beginPath();
        g.arc(cx + sgn * ca * rr, cy + sgn * sa * rr, 10, 0, Math.PI * 2);
        g.fill();
      }
      // Rumpf und Kopf
      g.fillStyle = th.series[0]!;
      g.beginPath();
      g.ellipse(cx, cy, RB * scale * 1.6, RB * scale * 1.1, angle, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = th.bg;
      g.beginPath();
      g.arc(cx + Math.cos(angle + Math.PI / 2) * 6, cy + Math.sin(angle + Math.PI / 2) * 6, 9, 0, Math.PI * 2);
      g.fill();
      // Drehpfeil
      g.strokeStyle = th.series[2]!;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, scale * 1.0, -0.4, 0.6);
      g.stroke();
      const ex = cx + Math.cos(0.6) * scale;
      const ey = cy + Math.sin(0.6) * scale;
      g.fillStyle = th.series[2]!;
      g.beginPath();
      g.moveTo(ex - 9, ey - 2);
      g.lineTo(ex + 6, ey - 9);
      g.lineTo(ex + 3, ey + 8);
      g.closePath();
      g.fill();
      text(g, `ω ≈ ${fmt.num(w(), 2)} 1/s`, cx, r.y + r.h - 14, { font: `700 14px ${th.font}`, color: th.text });
    }

    function drawRamp(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const a = (p.alpha * Math.PI) / 180;
      const x0 = r.x + 30;
      const y1 = r.y + r.h - 96;
      const len = Math.min((r.w - 80) / Math.cos(a), (r.h - 90) / Math.sin(a));
      const xEnd = x0 + len * Math.cos(a);
      const yTop = y1 - len * Math.sin(a);
      g.fillStyle = withAlpha(th.muted, 0.2);
      g.beginPath();
      g.moveTo(x0, yTop);
      g.lineTo(xEnd, y1);
      g.lineTo(x0, y1);
      g.closePath();
      g.fill();
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(x0, yTop);
      g.lineTo(xEnd, y1);
      g.lineTo(r.x + r.w - 10, y1);
      g.stroke();
      const rad = 12;
      const laneGap = Math.min(30, (r.y + r.h - 6 - y1) / 3);
      const colors: Record<BodyId, string> = { ball: th.series[1]!, disk: th.series[2]!, ring: th.series[0]!, box: th.series[3]! };
      BODIES.forEach((b, k) => {
        const s = Math.min(RAMP, 0.5 * acc(b) * Math.min(t, Math.sqrt((2 * RAMP) / acc(b))) ** 2);
        const f = s / RAMP;
        // jede Bahn etwas tiefer (vier parallele Rampen)
        const lane = k * laneGap;
        const px = x0 + f * (xEnd - x0) + Math.sin(a) * rad;
        const py = yTop + lane + f * (y1 - yTop) - Math.cos(a) * rad;
        if (k > 0) {
          g.strokeStyle = withAlpha(th.muted, 0.6);
          g.lineWidth = 1.5;
          g.beginPath();
          g.moveTo(x0, yTop + lane);
          g.lineTo(xEnd, y1 + lane);
          g.stroke();
        }
        g.strokeStyle = colors[b];
        g.fillStyle = colors[b];
        g.lineWidth = 3;
        if (b === 'box') {
          g.save();
          g.translate(px, py);
          g.rotate(a);
          g.fillRect(-rad, -rad, rad * 2, rad * 2);
          g.restore();
        } else {
          g.beginPath();
          g.arc(px, py, rad, 0, Math.PI * 2);
          if (b === 'ring') g.stroke();
          else if (b === 'disk') {
            g.fill();
            g.fillStyle = th.bg;
            g.beginPath();
            g.arc(px, py, 3, 0, Math.PI * 2);
            g.fill();
          } else g.fill();
        }
      });
      // Legende
      BODIES.forEach((b, k) => {
        text(g, ctx.t(b === 'box' ? 'boxShort' : b), r.x + r.w - 14, r.y + 18 + k * 18, { font: `700 12px ${th.font}`, color: colors[b], align: 'right' });
      });
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'pirouette') {
        plot.fn((rr) => omegaAfter(J0(), p.w0, skaterInertia(MB, RB, MA, rr)), { color: th.series[2]!, width: 3, from: 0.2, to: 0.9 });
        plot.point(p.r, w(), { color: th.series[1]!, radius: 6 });
      } else {
        const colors: Record<BodyId, string> = { ball: th.series[1]!, disk: th.series[2]!, ring: th.series[0]!, box: th.series[3]! };
        for (const b of BODIES) {
          const tb = Math.sqrt((2 * RAMP) / acc(b));
          plot.fn((x) => 0.5 * acc(b) * x * x, { color: withAlpha(colors[b], 0.3), width: 1.5, from: 0, to: tb });
          const tt = Math.min(t, tb);
          plot.fn((x) => 0.5 * acc(b) * x * x, { color: colors[b], width: 3, from: 0, to: Math.max(1e-6, tt) });
        }
      }
      plot.end();
    }

    return {
      update(_changed, source) {
        if (source !== 'init') t = 0;
        setupPlot();
        ctx.setAction('go', { label: ctx.t('go') });
        updateReadouts();
      },
      action(id) {
        if (id !== 'go') return;
        t = 0;
        running = true;
        ctx.setAction('go', { label: ctx.t('again') });
        ctx.clock.play();
      },
      tick(dt) {
        if (p.mode === 'pirouette') angle += w() * 2 * Math.PI * dt * 0.5;
        else if (running) {
          t += dt * 0.6;
          if (t >= tEnd()) {
            t = tEnd();
            running = false;
          }
        }
      },
      resetTime() {
        t = 0;
        angle = 0;
      },
      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        if (p.mode === 'pirouette') drawSkater(s.scene);
        else drawRamp(s.scene);
        drawChart();
      },
      destroy: () => surface.destroy(),
    };
  },
});
