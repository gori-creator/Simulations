import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, textOn, withAlpha, type Rect } from '../../../sim-core';
import {
  dampedPeriod,
  dampingCase,
  decay,
  energies,
  fieldEnergy,
  lcState,
  switchOff,
  switchOn,
  thomsonPeriod,
  timeConstant,
} from './model';

const L = (de: string, en: string) => ({ de, en });

interface Lay {
  scene: Rect;
  bars: Rect;
  chart1: Rect;
  chart2: Rect;
}

function layout(w: number, h: number): Lay {
  if (w >= 700) {
    const lw = Math.round(w * 0.47);
    const sh = Math.round(h * 0.64);
    return {
      scene: { x: 0, y: 0, w: lw, h: sh },
      bars: { x: 0, y: sh, w: lw, h: h - sh },
      chart1: { x: lw, y: 0, w: w - lw, h: Math.round(h / 2) },
      chart2: { x: lw, y: Math.round(h / 2), w: w - lw, h: h - Math.round(h / 2) },
    };
  }
  const sh = Math.round(h * 0.4);
  const bh = Math.round(h * 0.16);
  const ch = Math.round((h - sh - bh) / 2);
  return {
    scene: { x: 0, y: 0, w, h: sh },
    bars: { x: 0, y: sh, w, h: bh },
    chart1: { x: 0, y: sh + bh, w, h: ch },
    chart2: { x: 0, y: sh + bh + ch, w, h: h - sh - bh - ch },
  };
}

/**
 * Elektromagnetischer Schwingkreis: Die Energie pendelt zwischen dem elektrischen
 * Feld des Kondensators und dem Magnetfeld der Spule (Thomson-Gleichung, Dämpfung
 * durch einen Widerstand), im Vergleich mit einem Federpendel gleicher Periode.
 * Dazu die Selbstinduktion beim Ein- und Ausschalten einer Spule.
 */
export default defineSimulation({
  id: 'schwingkreis',
  animated: true,
  layout: { aspect: 1.6, aspectNarrow: 0.62 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'lc', label: L('Schwingkreis', 'LC circuit') },
        { value: 'pendel', label: L('Vergleich mit dem Federpendel', 'Compared with a spring pendulum') },
        { value: 'spule', label: L('Selbstinduktion: Ein- und Ausschalten', 'Self-induction: switching on and off') },
      ],
      default: 'lc',
    },
    { key: 'C', type: 'number', label: L('Kapazität C', 'Capacitance C'), min: 10, max: 200, step: 5, default: 40, unit: 'µF', visibleIf: (v) => v.mode !== 'spule' },
    { key: 'Lh', type: 'number', label: L('Induktivität L', 'Inductance L'), min: 100, max: 1000, step: 10, default: 500, unit: 'H' },
    { key: 'R', type: 'number', label: L('Widerstand R (Dämpfung)', 'Resistance R (damping)'), min: 0, max: 8000, step: 10, default: 0, unit: 'Ω', visibleIf: (v) => v.mode !== 'spule' },
    { key: 'Rz', type: 'number', label: L('Widerstand je Zweig R', 'Resistance per branch R'), min: 20, max: 500, step: 10, default: 100, unit: 'Ω', visibleIf: (v) => v.mode === 'spule' },
    { key: 'U0', type: 'number', label: L('Spannung U₀', 'Voltage U₀'), min: 2, max: 12, step: 1, default: 10, unit: 'V' },
    {
      key: 'tempo',
      type: 'choice',
      label: L('Zeitlupe', 'Slow motion'),
      options: [
        { value: '0.25', label: L('¼', '¼') },
        { value: '0.5', label: L('½', '½') },
        { value: '1', label: L('1', '1') },
      ],
      default: '0.5',
    },
  ],
  hint: (v) =>
    v.mode === 'spule'
      ? L('Tipp: „Schalter umlegen“ und auf die beiden Lampen achten.', 'Tip: “Flip the switch” and watch the two lamps.')
      : L('Tipp: „Laden und loslassen“ startet die Schwingung.', 'Tip: “Charge and release” starts the oscillation.'),
  actions: [
    { id: 'start', label: L('Laden und loslassen', 'Charge and release'), primary: true, visibleIf: (v) => v.mode !== 'spule' },
    { id: 'toggle', label: L('Schalter umlegen', 'Flip the switch'), primary: true, visibleIf: (v) => v.mode === 'spule' },
  ],
  readouts: [
    { key: 'T', label: L('Periodendauer (Thomson)', 'Period (Thomson)'), spoiler: true },
    { key: 'damp', label: L('Dämpfung', 'Damping') },
    { key: 'now', label: L('Jetzt', 'Now') },
    { key: 'analogy', label: L('Entsprechungen', 'Correspondences') },
    { key: 'tau', label: L('Zeitkonstante', 'Time constant'), spoiler: true },
    { key: 'energy', label: L('Energie im Magnetfeld', 'Energy in the magnetic field'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Ungedämpft', 'Undamped'), values: {} },
    { id: 'weak', label: L('Schwach gedämpft', 'Weakly damped'), values: { R: 400 } },
    { id: 'critical', label: L('Aperiodischer Grenzfall', 'Critically damped'), values: { R: 7070 } },
    { id: 'slow', label: L('Größeres C: langsamer', 'Larger C: slower'), values: { C: 160 } },
    { id: 'pendel', label: L('Federpendel im Vergleich', 'Spring pendulum'), values: { mode: 'pendel' } },
    { id: 'spule', label: L('Selbstinduktion', 'Self-induction'), values: { mode: 'spule' } },
  ],
  strings: {
    de: {
      canvas:
        'Schwingkreis aus Kondensator und Spule mit fließenden Ladungen, Energiebalken und den Diagrammen von Spannung und Strom; wahlweise mit Federpendel oder als Schaltung mit zwei Lampen zur Selbstinduktion',
      uc: 'U_C in V',
      i: 'I in mA',
      t: 't in s',
      iCoil: 'Spule',
      iRes: 'Widerstand',
      ul: 'u_L in V',
      el: 'el. Feld',
      mag: 'Magnetfeld',
      heat: 'Wärme',
      kin: 'Bewegung',
      spring: 'Feder',
      lamp1: 'Lampe mit Spule',
      lamp2: 'Lampe mit Widerstand',
      on: 'Schalter zu',
      off: 'Schalter offen',
      Tval: 'T = 2π · √(L · C) = 2π · √({L} H · {C} µF) ≈ {T} s, f ≈ {f} Hz',
      none: 'ungedämpft: Die Energie bleibt im Kreis.',
      weak: 'schwach gedämpft: T_d ≈ {T} s, die Amplitude nimmt mit e^(−δt) ab (δ ≈ {d} 1/s).',
      critical: 'aperiodischer Grenzfall: kein Überschwingen, schnellstes Abklingen.',
      strong: 'Kriechfall: Die Ladung fließt langsam ab, ohne zu schwingen.',
      nowLc: 't ≈ {t} s: U_C ≈ {u} V, I ≈ {i} mA',
      nowSp: 'I_Spule ≈ {a} mA, I_Widerstand ≈ {b} mA, u_L ≈ {u} V',
      tauVal: 'τ = L / R = {L} H / {R} Ω = {tau} s (Ausschalten: L / (2R) = {tau2} s)',
      energyVal: 'W = ½ · L · I² = ½ · {L} H · ({I} A)² ≈ {W} J',
      analogyHtml:
        '<table class="mini-table"><tr><th>Schwingkreis</th><th>Federpendel</th></tr><tr><td>Ladung q</td><td>Auslenkung s</td></tr><tr><td>Stromstärke I</td><td>Geschwindigkeit v</td></tr><tr><td>Induktivität L</td><td>Masse m</td></tr><tr><td>1/C</td><td>Federhärte D</td></tr><tr><td>Widerstand R</td><td>Reibung</td></tr><tr><td>Energie im el. Feld</td><td>Spannenergie</td></tr><tr><td>Energie im Magnetfeld</td><td>Bewegungsenergie</td></tr></table>',
      start: 'Laden und loslassen',
      again: 'Noch einmal',
    },
    en: {
      canvas:
        'LC circuit of a capacitor and a coil with moving charges, energy bars and graphs of voltage and current; optionally with a spring pendulum or as a circuit with two lamps for self-induction',
      uc: 'U_C in V',
      i: 'I in mA',
      t: 't in s',
      iCoil: 'coil',
      iRes: 'resistor',
      ul: 'u_L in V',
      el: 'el. field',
      mag: 'magnetic field',
      heat: 'heat',
      kin: 'motion',
      spring: 'spring',
      lamp1: 'lamp with coil',
      lamp2: 'lamp with resistor',
      on: 'switch closed',
      off: 'switch open',
      Tval: 'T = 2π · √(L · C) = 2π · √({L} H · {C} µF) ≈ {T} s, f ≈ {f} Hz',
      none: 'undamped: the energy stays in the circuit.',
      weak: 'weakly damped: T_d ≈ {T} s, the amplitude decreases as e^(−δt) (δ ≈ {d} 1/s).',
      critical: 'critically damped: no overshoot, fastest decay.',
      strong: 'overdamped: the charge drains slowly without oscillating.',
      nowLc: 't ≈ {t} s: U_C ≈ {u} V, I ≈ {i} mA',
      nowSp: 'I_coil ≈ {a} mA, I_resistor ≈ {b} mA, u_L ≈ {u} V',
      tauVal: 'τ = L / R = {L} H / {R} Ω = {tau} s (switching off: L / (2R) = {tau2} s)',
      energyVal: 'W = ½ · L · I² = ½ · {L} H · ({I} A)² ≈ {W} J',
      analogyHtml:
        '<table class="mini-table"><tr><th>LC circuit</th><th>Spring pendulum</th></tr><tr><td>charge q</td><td>displacement s</td></tr><tr><td>current I</td><td>velocity v</td></tr><tr><td>inductance L</td><td>mass m</td></tr><tr><td>1/C</td><td>spring constant D</td></tr><tr><td>resistance R</td><td>friction</td></tr><tr><td>energy in the el. field</td><td>elastic energy</td></tr><tr><td>energy in the magnetic field</td><td>kinetic energy</td></tr></table>',
      start: 'Charge and release',
      again: 'Again',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const mk = (pick: (l: Lay) => Rect) =>
      new Plot(surface, {
        x: [0, 4],
        y: [-12, 12],
        equalAspect: false,
        pan: false,
        zoom: false,
        controls: false,
        region: (w, h) => {
          const r = pick(layout(w, h));
          return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
        },
      });
    const plot1 = mk((l) => l.chart1);
    const plot2 = mk((l) => l.chart2);

    /** Zeit seit dem Start bzw. seit dem letzten Umschalten (s). */
    let t = 0;
    /** Schalter (nur Selbstinduktion): zu = eingeschaltet. */
    let closed = false;
    /** Strom im Spulenzweig beim Umschalten (für weiches Weiterlaufen). */
    let dotPhase = 0;

    const Cf = () => p.C * 1e-6;
    const q0 = () => Cf() * p.U0;
    const lc = (time: number) => lcState(p.Lh, Cf(), p.R, q0(), time);
    const T0 = () => thomsonPeriod(p.Lh, Cf());
    const span = () => {
      if (p.mode === 'spule') return 5 * timeConstant(p.Lh, p.Rz);
      const c = dampingCase(p.Lh, Cf(), p.R);
      if (c === 'strong' || c === 'critical') return Math.min(12 * T0(), 6 / Math.max(1e-9, decay(p.R, p.Lh) - Math.sqrt(Math.max(0, decay(p.R, p.Lh) ** 2 - 1 / (p.Lh * Cf())))));
      return 4 * T0();
    };
    const sp = (time: number) => (closed ? switchOn(p.U0, p.Rz, p.Lh, time) : switchOff(p.U0, p.Rz, p.Lh, time));
    const iMax = () => (p.mode === 'spule' ? p.U0 / p.Rz : q0() / Math.sqrt(p.Lh * Cf()));

    function setupPlots(): void {
      const W = span();
      if (p.mode === 'spule') {
        const I = (1000 * p.U0) / p.Rz;
        plot1.setRangePadded([0, W], [-I * 1.15, I * 1.15], { left: 52, right: 14, top: 22, bottom: 24 });
        plot1.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('i') } });
        plot2.setRangePadded([0, W], [-2.2 * p.U0, 1.2 * p.U0], { left: 52, right: 14, top: 22, bottom: 24 });
        plot2.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('ul') } });
        return;
      }
      plot1.setRangePadded([0, W], [-p.U0 * 1.15, p.U0 * 1.15], { left: 52, right: 14, top: 22, bottom: 24 });
      plot1.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('uc') } });
      const I = 1000 * iMax();
      plot2.setRangePadded([0, W], [-I * 1.15, I * 1.15], { left: 52, right: 14, top: 22, bottom: 24 });
      plot2.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('i') } });
    }

    function updateReadouts(): void {
      for (const k of ['T', 'damp', 'now', 'analogy', 'tau', 'energy']) ctx.readout(k, null);
      if (p.mode === 'spule') {
        const s = sp(t);
        ctx.readout('now', `${ctx.t(closed ? 'on' : 'off')}: ${tr('nowSp', { a: fmt.num(1000 * s.iCoil, 1), b: fmt.num(1000 * s.iRes, 1), u: fmt.num(s.uL, 1) })}`);
        ctx.readout('tau', tr('tauVal', { L: fmt.num(p.Lh, 0), R: fmt.num(p.Rz, 0), tau: fmt.num(timeConstant(p.Lh, p.Rz), 2), tau2: fmt.num(p.Lh / (2 * p.Rz), 2) }));
        const I0 = p.U0 / p.Rz;
        ctx.readout('energy', tr('energyVal', { L: fmt.num(p.Lh, 0), I: fmt.num(I0, 3), W: fmt.num(fieldEnergy(p.Lh, I0), 3) }));
        return;
      }
      const T = T0();
      ctx.readout('T', tr('Tval', { L: fmt.num(p.Lh, 0), C: fmt.num(p.C, 0), T: fmt.num(T, 3), f: fmt.num(1 / T, 2) }));
      const c = dampingCase(p.Lh, Cf(), p.R);
      ctx.readout('damp', tr(c, { T: fmt.num(dampedPeriod(p.Lh, Cf(), p.R), 3), d: fmt.num(decay(p.R, p.Lh), 2) }));
      const s = lc(t);
      ctx.readout('now', tr('nowLc', { t: fmt.num(t, 2), u: fmt.num(s.q / Cf(), 2), i: fmt.num(1000 * s.i, 1) }));
      if (p.mode === 'pendel') ctx.readout('analogy', { html: ctx.t('analogyHtml') });
    }

    /* ---------- Zeichnen ---------- */

    /** Weg entlang eines Rechtecks: Punkt bei Bogenlänge s (im Uhrzeigersinn ab oben links). */
    function alongRect(r: Rect, s: number): [number, number] {
      const per = 2 * (r.w + r.h);
      let d = ((s % per) + per) % per;
      if (d < r.w) return [r.x + d, r.y];
      d -= r.w;
      if (d < r.h) return [r.x + r.w, r.y + d];
      d -= r.h;
      if (d < r.w) return [r.x + r.w - d, r.y + r.h];
      d -= r.w;
      return [r.x, r.y + r.h - d];
    }

    function wire(g: CanvasRenderingContext2D, pts: [number, number][]): void {
      g.beginPath();
      pts.forEach(([x, y], k) => (k ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
    }

    /** Kondensator (waagrechte Platten) an Position (cx, cy); q/q₀ zwischen −1 und 1. */
    function capacitor(g: CanvasRenderingContext2D, cx: number, cy: number, s: number, rel: number): void {
      const th = ctx.theme;
      const w = s * 0.9;
      const gap = s * 0.32;
      g.fillStyle = th.bg;
      g.fillRect(cx - w / 2 - 4, cy - gap / 2, w + 8, gap);
      const plus = th.series[1]!;
      const minus = th.series[0]!;
      const top = rel >= 0 ? plus : minus;
      const bottom = rel >= 0 ? minus : plus;
      const a = Math.min(1, Math.abs(rel));
      g.lineWidth = 5;
      g.strokeStyle = withAlpha(top, 0.35 + 0.65 * a);
      wire(g, [
        [cx - w / 2, cy - gap / 2],
        [cx + w / 2, cy - gap / 2],
      ]);
      g.strokeStyle = withAlpha(bottom, 0.35 + 0.65 * a);
      wire(g, [
        [cx - w / 2, cy + gap / 2],
        [cx + w / 2, cy + gap / 2],
      ]);
      // Feldlinien zwischen den Platten (Anzahl ∝ Ladung)
      const n = Math.round(5 * a);
      g.strokeStyle = withAlpha(th.series[3]!, 0.8);
      g.lineWidth = 1.5;
      for (let k = 0; k < n; k++) {
        const x = cx - w / 2 + ((k + 0.5) * w) / n;
        wire(g, [
          [x, cy - gap / 2 + 4],
          [x, cy + gap / 2 - 4],
        ]);
      }
      if (a > 0.05) {
        g.font = `800 ${Math.round(s * 0.28)}px ${th.font}`;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        g.fillStyle = top;
        g.fillText(rel >= 0 ? '+' : '−', cx - w / 2 - s * 0.22, cy - gap / 2 - 2);
        g.fillStyle = bottom;
        g.fillText(rel >= 0 ? '−' : '+', cx - w / 2 - s * 0.22, cy + gap / 2 + 4);
      }
    }

    /** Spule (senkrecht) mit Magnetfeld innen; i/iMax zwischen −1 und 1. */
    function coil(g: CanvasRenderingContext2D, cx: number, cy: number, len: number, rel: number): void {
      const th = ctx.theme;
      const turns = 6;
      const rad = len / turns / 2;
      g.fillStyle = th.bg;
      g.fillRect(cx - rad * 2.2, cy - len / 2 - 2, rad * 4.4, len + 4);
      // Feld innen
      const a = Math.min(1, Math.abs(rel));
      if (a > 0.03) {
        g.strokeStyle = withAlpha(th.series[2]!, 0.25 + 0.7 * a);
        g.fillStyle = g.strokeStyle;
        g.lineWidth = 2;
        for (const dx of [-rad * 0.6, rad * 0.6]) {
          wire(g, [
            [cx + dx, cy - len / 2 + 6],
            [cx + dx, cy + len / 2 - 6],
          ]);
          const tip = rel > 0 ? cy - len / 2 + 6 : cy + len / 2 - 6;
          const dir = rel > 0 ? 1 : -1;
          g.beginPath();
          g.moveTo(cx + dx, tip);
          g.lineTo(cx + dx - 5, tip + 9 * dir);
          g.lineTo(cx + dx + 5, tip + 9 * dir);
          g.closePath();
          g.fill();
        }
      }
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      for (let k = 0; k < turns; k++) {
        const y = cy - len / 2 + rad + k * 2 * rad;
        g.beginPath();
        g.ellipse(cx, y, rad * 1.8, rad, 0, -Math.PI / 2, Math.PI / 2);
        g.stroke();
      }
    }

    function resistor(g: CanvasRenderingContext2D, cx: number, cy: number, w: number, horizontal: boolean): void {
      const th = ctx.theme;
      const h = w * 0.36;
      g.fillStyle = th.bg;
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      if (horizontal) {
        g.fillRect(cx - w / 2, cy - h / 2, w, h);
        g.strokeRect(cx - w / 2, cy - h / 2, w, h);
      } else {
        g.fillRect(cx - h / 2, cy - w / 2, h, w);
        g.strokeRect(cx - h / 2, cy - w / 2, h, w);
      }
    }

    function lamp(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, glow: number): void {
      const th = ctx.theme;
      const a = Math.max(0, Math.min(1, glow));
      if (a > 0.02) {
        const grad = g.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 3.2);
        grad.addColorStop(0, withAlpha('#ffd54a', 0.85 * a));
        grad.addColorStop(1, withAlpha('#ffd54a', 0));
        g.fillStyle = grad;
        g.beginPath();
        g.arc(cx, cy, r * 3.2, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = a > 0.02 ? withAlpha('#ffe27a', 0.4 + 0.6 * a) : th.bg;
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(cx, cy, r, 0, Math.PI * 2);
      g.fill();
      g.stroke();
      g.lineWidth = 1.8;
      const d = r * 0.7;
      wire(g, [
        [cx - d, cy - d],
        [cx + d, cy + d],
      ]);
      wire(g, [
        [cx + d, cy - d],
        [cx - d, cy + d],
      ]);
    }

    /** Elektronen als Punkte entlang des Rechtecks, Geschwindigkeit ∝ Strom. */
    function dots(g: CanvasRenderingContext2D, r: Rect, phase: number, color: string): void {
      const per = 2 * (r.w + r.h);
      const n = Math.max(12, Math.round(per / 34));
      g.fillStyle = color;
      for (let k = 0; k < n; k++) {
        const [x, y] = alongRect(r, (k * per) / n + phase);
        g.beginPath();
        g.arc(x, y, 3, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawLc(scene: Rect, withPendulum: boolean): void {
      const g = surface.g;
      const th = ctx.theme;
      const circW = withPendulum ? scene.w * 0.6 : scene.w;
      const pad = Math.min(circW, scene.h) * 0.16;
      const lm = Math.max(pad + 14, Math.min(70, scene.w * 0.12) + 30);
      const loop: Rect = { x: scene.x + lm, y: scene.y + pad, w: circW - pad - lm, h: scene.h - 2 * pad };
      const s = lc(t);
      const rel = s.q / q0();
      const irel = s.i / iMax();
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      g.strokeRect(loop.x, loop.y, loop.w, loop.h);
      dots(g, loop, dotPhase, withAlpha(th.series[0]!, 0.85));
      const size = Math.min(loop.h * 0.42, 70);
      capacitor(g, loop.x, loop.y + loop.h / 2, size, rel);
      coil(g, loop.x + loop.w, loop.y + loop.h / 2, Math.min(loop.h * 0.62, 130), irel);
      if (p.R > 0) resistor(g, loop.x + loop.w / 2, loop.y, Math.min(60, loop.w * 0.3), true);
      const fs = surface.width < 560 ? 12 : 13;
      const label = (value: string, x: number, y: number) => {
        g.font = `700 ${fs}px ${th.font}`;
        const w = g.measureText(value).width + 8;
        g.fillStyle = th.bg;
        g.fillRect(x - w / 2, y - fs * 0.7, w, fs * 1.4);
        text(g, value, x, y, { font: `700 ${fs}px ${th.font}`, color: th.text });
      };
      const coilLen = Math.min(loop.h * 0.62, 130);
      label(`C = ${fmt.num(p.C, 0)} µF`, loop.x, loop.y + loop.h / 2 + size * 0.42);
      label(`L = ${fmt.num(p.Lh, 0)} H`, loop.x + loop.w, loop.y + loop.h / 2 + coilLen / 2 + fs);
      if (p.R > 0) text(g, `R = ${fmt.num(p.R, 0)} Ω`, loop.x + loop.w / 2, loop.y + 26, { font: `700 ${fs}px ${th.font}`, color: th.text });
      if (!withPendulum) return;
      // Federpendel mit gleicher Periode: Auslenkung ∝ Ladung
      const px = scene.x + circW + (scene.w - circW) / 2;
      const top = scene.y + 18;
      const rest = scene.y + scene.h * 0.52;
      const amp = scene.h * 0.24;
      const y = rest + amp * rel;
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      wire(g, [
        [px - 30, top],
        [px + 30, top],
      ]);
      g.lineWidth = 2;
      const coils = 12;
      g.beginPath();
      g.moveTo(px, top);
      for (let k = 1; k <= coils; k++) g.lineTo(px + (k % 2 ? 12 : -12), top + ((y - 22 - top) * k) / (coils + 1));
      g.lineTo(px, y - 22);
      g.stroke();
      const bw = 44;
      roundRect(g, px - bw / 2, y - 22, bw, 40, 6);
      g.fillStyle = withAlpha(th.series[4]!, 0.85);
      g.fill();
      text(g, 'm', px, y - 2, { font: `italic 800 16px ${th.mathFont}`, color: textOn(th.series[4]!, th) });
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.setLineDash([4, 4]);
      wire(g, [
        [px - 40, rest - 2],
        [px + 40, rest - 2],
      ]);
      g.setLineDash([]);
      // Geschwindigkeitspfeil ∝ Strom
      if (Math.abs(irel) > 0.05) {
        const len = 40 * irel;
        g.strokeStyle = th.series[2]!;
        g.fillStyle = th.series[2]!;
        g.lineWidth = 3;
        wire(g, [
          [px + 36, y - 2],
          [px + 36, y - 2 - len],
        ]);
        const dir = Math.sign(len);
        g.beginPath();
        g.moveTo(px + 36, y - 2 - len - 6 * dir);
        g.lineTo(px + 30, y - 2 - len + 3 * dir);
        g.lineTo(px + 42, y - 2 - len + 3 * dir);
        g.closePath();
        g.fill();
        text(g, 'v', px + 52, y - 2 - len / 2, { font: `italic 700 14px ${th.mathFont}`, color: th.series[2]! });
      }
    }

    function drawSpule(scene: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const s = sp(t);
      const I0 = p.U0 / p.Rz;
      const pad = Math.min(scene.w, scene.h) * 0.12;
      const x0 = scene.x + pad + 20;
      const x1 = scene.x + scene.w - pad;
      const yT = scene.y + Math.max(pad, 36) + 12;
      const yB = scene.y + scene.h - pad;
      const yM = (yT + yB) / 2;
      const xs = x0 + (x1 - x0) * 0.28;
      // Zwei Zweige zwischen linker Schiene (xs) und rechter Schiene (x1): oben Spule + Lampe 1 (yT), Mitte Widerstand + Lampe 2 (yM);
      // die Quelle (links) ist über den Schalter mit der linken und über die untere Leitung mit der rechten Schiene verbunden.
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      wire(g, [
        [xs, yT],
        [x1, yT],
        [x1, yB],
        [x0, yB],
        [x0, yT],
        [xs - 46, yT],
      ]);
      wire(g, [
        [xs, yM],
        [x1, yM],
      ]);
      wire(g, [
        [xs, yT],
        [xs, yM],
      ]);
      // Quelle
      g.fillStyle = th.bg;
      g.fillRect(x0 - 16, yM - 14, 32, 28);
      g.lineWidth = 4;
      wire(g, [
        [x0 - 14, yM - 6],
        [x0 + 14, yM - 6],
      ]);
      g.lineWidth = 2;
      wire(g, [
        [x0 - 8, yM + 6],
        [x0 + 8, yM + 6],
      ]);
      text(g, `${fmt.num(p.U0, 0)} V`, x0 + 22, yM, { font: `700 13px ${th.font}`, color: th.text, align: 'left' });
      // Schalter
      g.lineWidth = 3;
      g.strokeStyle = th.series[3]!;
      wire(g, [[xs - 46, yT], closed ? [xs, yT] : [xs - 8, yT - 26]]);
      g.fillStyle = th.text;
      for (const x of [xs - 46, xs]) {
        g.beginPath();
        g.arc(x, yT, 4, 0, Math.PI * 2);
        g.fill();
      }
      text(g, ctx.t(closed ? 'on' : 'off'), xs - 23, yT - 34, { font: `600 12px ${th.font}`, color: th.muted });
      const bx = xs + (x1 - xs) * 0.36;
      const lx = xs + (x1 - xs) * 0.76;
      const lampR = Math.min(16, (yM - yT) * 0.3);
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      // Spule auf dem oberen Zweig
      const cl = Math.min(110, (x1 - xs) * 0.34);
      g.fillStyle = th.bg;
      g.fillRect(bx - cl / 2, yT - 16, cl, 20);
      const turns = 6;
      for (let k = 0; k < turns; k++) {
        const cx = bx - cl / 2 + (k + 0.5) * (cl / turns);
        g.beginPath();
        g.ellipse(cx, yT, cl / turns / 2, 14, 0, Math.PI, 0);
        g.stroke();
      }
      text(g, `L = ${fmt.num(p.Lh, 0)} H`, bx, yT + 16, { font: `700 12px ${th.font}`, color: th.text });
      resistor(g, bx, yM, Math.min(60, cl * 0.6), true);
      text(g, 'R', bx, yM, { font: `italic 700 13px ${th.mathFont}`, color: th.text });
      lamp(g, lx, yT, lampR, (s.iCoil / I0) ** 2);
      lamp(g, lx, yM, lampR, (s.iRes / I0) ** 2);
      const fs = surface.width < 560 ? 11 : 12;
      const lampFont = `600 ${fs}px ${th.font}`;
      g.font = lampFont;
      // Beschriftung unter der Lampe, aber nie über die rechte Schiene hinaus
      for (const [key, y] of [['lamp1', yT], ['lamp2', yM]] as const) {
        const label = ctx.t(key);
        const cx = Math.min(lx, x1 - g.measureText(label).width / 2 - 6);
        text(g, label, cx, y + lampR + 12, { font: lampFont, color: th.muted });
      }
    }

    function drawBars(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      let items: { label: string; value: number; color: string }[];
      if (p.mode === 'spule') {
        const s = sp(t);
        const I0 = p.U0 / p.Rz;
        const W0 = fieldEnergy(p.Lh, I0);
        items = [{ label: ctx.t('mag'), value: fieldEnergy(p.Lh, s.iCoil) / W0, color: th.series[2]! }];
      } else {
        const s = lc(t);
        const e = energies(p.Lh, Cf(), s.q, s.i);
        const E0 = energies(p.Lh, Cf(), q0(), 0).el;
        const elLabel = p.mode === 'pendel' ? `${ctx.t('el')} ↔ ${ctx.t('spring')}` : ctx.t('el');
        const magLabel = p.mode === 'pendel' ? `${ctx.t('mag')} ↔ ${ctx.t('kin')}` : ctx.t('mag');
        items = [
          { label: elLabel, value: e.el / E0, color: th.series[3]! },
          { label: magLabel, value: e.mag / E0, color: th.series[2]! },
          { label: ctx.t('heat'), value: Math.max(0, 1 - (e.el + e.mag) / E0), color: th.series[1]! },
        ];
      }
      const pad = 14;
      const narrow = surface.width < 700;
      const rowH = Math.min(28, (r.h - 2 * pad) / items.length);
      const labelFont = `600 ${narrow ? 11 : 13}px ${th.font}`;
      g.font = labelFont;
      const widest = Math.max(...items.map((it) => g.measureText(it.label).width));
      const labelW = Math.min(widest + 14, r.w * 0.55);
      items.forEach((it, k) => {
        const y = r.y + pad + k * rowH + (r.h - 2 * pad - items.length * rowH) / 2;
        text(g, it.label, r.x + pad + labelW - 8, y + rowH / 2, { font: labelFont, color: th.text, align: 'right' });
        const bx = r.x + pad + labelW;
        const bw = r.w - 2 * pad - labelW - 44;
        roundRect(g, bx, y + 5, bw, rowH - 10, 5);
        g.fillStyle = withAlpha(th.muted, 0.15);
        g.fill();
        roundRect(g, bx, y + 5, Math.max(0, bw * Math.min(1, it.value)), rowH - 10, 5);
        g.fillStyle = it.color;
        g.fill();
        text(g, `${fmt.num(Math.min(1, it.value) * 100, 0)} %`, bx + bw + 6, y + rowH / 2, { font: `600 12px ${th.font}`, color: th.muted, align: 'left' });
      });
    }

    function drawCharts(): void {
      const th = ctx.theme;
      const W = span();
      const n = 300;
      const tt = Math.min(t, W);
      if (p.mode === 'spule') {
        const curve = (f: (s: ReturnType<typeof sp>) => number, plot: Plot, color: string, label: string, scale = 1, at = 0.75) => {
          const all: [number, number][] = [];
          const done: [number, number][] = [];
          for (let k = 0; k <= n; k++) {
            const x = (W * k) / n;
            const v = scale * f(sp(x));
            all.push([x, v]);
            if (x <= tt) done.push([x, v]);
          }
          done.push([tt, scale * f(sp(tt))]);
          plot.polyline(all, { color: withAlpha(color, 0.25), width: 2 });
          plot.polyline(done, { color, width: 3 });
          plot.point(tt, scale * f(sp(tt)), { color, radius: 5 });
          const last = all[Math.round(n * at)]!;
          plot.text(last[0], last[1], label, { color, size: 12, weight: 'bold', offset: [0, -12] });
        };
        plot1.begin();
        plot1.grid({ minor: false });
        plot1.axes();
        curve((s) => s.iCoil, plot1, th.series[2]!, ctx.t('iCoil'), 1000, 0.45);
        curve((s) => s.iRes, plot1, th.series[0]!, ctx.t('iRes'), 1000);
        plot1.end();
        plot2.begin();
        plot2.grid({ minor: false });
        plot2.axes();
        curve((s) => s.uL, plot2, th.series[1]!, 'u_L');
        plot2.end();
        return;
      }
      const draw = (plot: Plot, f: (time: number) => number, color: string) => {
        plot.begin();
        plot.grid({ minor: false });
        plot.axes();
        const all: [number, number][] = [];
        const done: [number, number][] = [];
        for (let k = 0; k <= n; k++) {
          const x = (W * k) / n;
          all.push([x, f(x)]);
          if (x <= tt) done.push([x, f(x)]);
        }
        done.push([tt, f(tt)]);
        plot.polyline(all, { color: withAlpha(color, 0.22), width: 2 });
        plot.polyline(done, { color, width: 3 });
        plot.point(tt, f(tt), { color, radius: 5 });
        // Perioden markieren
        if (p.R === 0) for (let k = 1; k * T0() <= W + 1e-9; k++) plot.vline(k * T0(), { color: withAlpha(th.muted, 0.5), width: 1, dash: [4, 4] });
        plot.end();
      };
      draw(plot1, (x) => lc(x).q / Cf(), th.series[3]!);
      draw(plot2, (x) => 1000 * lc(x).i, th.series[2]!);
    }

    return {
      update(changed, source) {
        if (changed.has('mode') || changed.has('C') || changed.has('Lh') || changed.has('R') || changed.has('Rz') || changed.has('U0') || source === 'init') {
          if (changed.has('mode') && p.mode === 'spule') closed = false;
          if (source !== 'init' && (changed.has('mode') || changed.has('C') || changed.has('Lh') || changed.has('R'))) t = 0;
          setupPlots();
        }
        ctx.setAction('start', { label: ctx.t(t > 0 ? 'again' : 'start') });
        updateReadouts();
      },

      action(id) {
        if (id === 'start') {
          t = 0;
          ctx.clock.play();
        } else if (id === 'toggle') {
          closed = !closed;
          t = 0;
          ctx.clock.play();
        }
        if (prefersReducedMotion()) {
          t = span();
          ctx.clock.pause();
        }
        ctx.setAction('start', { label: ctx.t('again') });
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        // Selbstinduktion dauert Sekunden (τ = L/R): dort viermal schneller
        const speed = (Number(p.tempo) || 0.5) * (p.mode === 'spule' ? 4 : 1);
        const step = dt * speed;
        t += step;
        const W = span();
        if (t >= W) {
          t = W;
          ctx.clock.pause();
        }
        // Elektronen bewegen sich mit dem Strom (Bildschirm-Pixel pro Sekunde)
        const irel = p.mode === 'spule' ? sp(t).iCoil / iMax() : lc(t).i / iMax();
        dotPhase -= irel * 160 * dt;
        updateReadouts();
      },

      resetTime() {
        t = 0;
        updateReadouts();
      },

      render() {
        const l = layout(surface.width, surface.height);
        plot1.resize();
        plot2.resize();
        surface.begin();
        if (p.mode === 'spule') drawSpule(l.scene);
        else drawLc(l.scene, p.mode === 'pendel');
        drawBars(l.bars);
        drawCharts();
      },

      destroy: () => surface.destroy(),
    };
  },
});
