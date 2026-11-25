import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { boxDeceleration, G, pulleyAcceleration, pushOff, ropeForce } from './model';

const L = (de: string, en: string) => ({ de, en });

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  const sh = Math.round(h * (w >= 700 ? 0.52 : 0.5));
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

/** Trägheit: Geschwindigkeit vor dem Bremsen, Bremsverzögerung, Abstand Kiste–Stirnwand. */
const V0 = 6;
const BRAKE = 8;
const T_BRAKE = 0.8;
const GAP = 0.9;
/** Grundgleichung: Länge der Fahrstrecke (m). */
const TRACK = 1.6;
/** Wechselwirkung: Dauer des Abstoßens (s). */
const PUSH = 0.1;

/**
 * Newton’sche Gesetze: Trägheit beim Bremsen, Grundgleichung F = m · a mit
 * Zuggewicht über eine Rolle, Wechselwirkung beim Abstoßen zweier Wagen.
 */
export default defineSimulation({
  id: 'newtonsche-gesetze',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.85 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Gesetz', 'Law'),
      options: [
        { value: 'traeg', label: L('1. Trägheitsgesetz', '1st law: inertia') },
        { value: 'grund', label: L('2. Grundgleichung F = m · a', '2nd law: F = m · a') },
        { value: 'wechsel', label: L('3. Wechselwirkung', '3rd law: action and reaction') },
      ],
      default: 'grund',
    },
    { key: 'gurt', type: 'boolean', label: L('Kiste festgeschnallt', 'Box strapped down'), default: false, visibleIf: (v) => v.mode === 'traeg' },
    { key: 'mub', type: 'number', label: L('Reibungszahl Kiste – Ladefläche', 'Friction coefficient box – platform'), min: 0, max: 0.8, step: 0.05, default: 0.3, visibleIf: (v) => v.mode === 'traeg' && !v.gurt },
    { key: 'mc', type: 'number', label: L('Masse des Wagens', 'Mass of the cart'), min: 0.2, max: 2, step: 0.1, default: 0.5, unit: 'kg', visibleIf: (v) => v.mode === 'grund' },
    { key: 'mh', type: 'number', label: L('Masse des Zuggewichts', 'Mass of the hanging weight'), min: 0.01, max: 0.5, step: 0.01, default: 0.1, unit: 'kg', visibleIf: (v) => v.mode === 'grund' },
    { key: 'mu', type: 'number', label: L('Reibungszahl der Bahn', 'Friction coefficient of the track'), min: 0, max: 0.3, step: 0.01, default: 0, visibleIf: (v) => v.mode === 'grund' },
    { key: 'm1', type: 'number', label: L('Masse Wagen links', 'Mass left cart'), min: 0.5, max: 4, step: 0.5, default: 1, unit: 'kg', visibleIf: (v) => v.mode === 'wechsel' },
    { key: 'm2', type: 'number', label: L('Masse Wagen rechts', 'Mass right cart'), min: 0.5, max: 4, step: 0.5, default: 2, unit: 'kg', visibleIf: (v) => v.mode === 'wechsel' },
    { key: 'F', type: 'number', label: L('Kraft der Feder', 'Spring force'), min: 5, max: 40, step: 1, default: 20, unit: 'N', visibleIf: (v) => v.mode === 'wechsel' },
  ],
  hint: (v) =>
    v.mode === 'traeg'
      ? L('Der Wagen fährt und bremst dann scharf. Was macht die Kiste?', 'The truck drives and then brakes hard. What does the box do?')
      : v.mode === 'grund'
        ? L('Das Zuggewicht zieht den Wagen über die Rolle. Ohne Reibung gilt F = m · a.', 'The hanging weight pulls the cart over the pulley. Without friction F = m · a.')
        : L('Eine gespannte Feder drückt beide Wagen auseinander – mit gleich großen Kräften.', 'A compressed spring pushes both carts apart – with equal forces.'),
  actions: [{ id: 'go', label: L('Start', 'Start'), primary: true }],
  readouts: [
    { key: 'a', label: L('Beschleunigung', 'Acceleration'), spoiler: true },
    { key: 'F', label: L('Kraft', 'Force'), spoiler: true },
    { key: 'v', label: L('Geschwindigkeiten', 'Velocities'), spoiler: true },
    { key: 'now', label: L('Messung', 'Measurement') },
  ],
  presets: [
    { id: 'loose', label: L('Lose Kiste', 'Loose box'), values: { mode: 'traeg', gurt: false } },
    { id: 'belt', label: L('Festgeschnallt', 'Strapped down'), values: { mode: 'traeg', gurt: true } },
    { id: 'base', label: L('F = m · a', 'F = m · a'), values: { mode: 'grund', mc: 0.5, mh: 0.1, mu: 0 } },
    { id: 'double', label: L('Doppelte Wagenmasse', 'Double cart mass'), values: { mode: 'grund', mc: 1, mh: 0.1, mu: 0 } },
    { id: 'fric', label: L('Mit Reibung', 'With friction'), values: { mode: 'grund', mu: 0.1 } },
    { id: 'push', label: L('Abstoßen 1 kg / 2 kg', 'Push-off 1 kg / 2 kg'), values: { mode: 'wechsel', m1: 1, m2: 2 } },
  ],
  strings: {
    de: {
      canvas: 'Wagen auf einer Fahrbahn: ein Lastwagen mit Kiste, ein Wagen mit Zuggewicht über eine Rolle oder zwei Wagen mit Feder; darunter ein Geschwindigkeit-Zeit-Diagramm',
      t: 't in s',
      v: 'v in m/s',
      cart: 'Wagen',
      box: 'Kiste',
      start: 'Start',
      again: 'Noch einmal',
      aGrund: 'a = (m_Z · g − μ · m_W · g) / (m_W + m_Z) ≈ {a} m/s²',
      aZero: 'Die Zugkraft reicht nicht gegen die Reibung: Der Wagen bleibt stehen.',
      FGrund: 'Zugkraft F = m_Z · g ≈ {F} N, Seilkraft ≈ {S} N',
      aTraeg: 'Wagen bremst mit {b} m/s², die Kiste {how}',
      boxBelt: 'wird vom Gurt mitgebremst',
      boxLoose: 'nur mit μ · g ≈ {d} m/s² – sie rutscht nach vorn',
      boxSame: 'wird durch Reibung voll mitgebremst',
      FWechsel: 'Beide Wagen erfahren {F} N, aber in entgegengesetzte Richtungen.',
      vWechsel: 'v₁ ≈ {v1} m/s, v₂ ≈ {v2} m/s; m₁ · v₁ + m₂ · v₂ = 0',
      nowGrund: 't ≈ {t} s, s ≈ {s} m, v ≈ {v} m/s',
      nowTraeg: 't ≈ {t} s, Wagen {vc} m/s, Kiste {vb} m/s',
      nowWechsel: 't ≈ {t} s',
      hit: 'Die Kiste prallt gegen die Stirnwand!',
    },
    en: {
      canvas: 'Carts on a track: a truck with a box, a cart pulled by a weight over a pulley or two carts with a spring; below a velocity–time graph',
      t: 't in s',
      v: 'v in m/s',
      cart: 'cart',
      box: 'box',
      start: 'Start',
      again: 'Again',
      aGrund: 'a = (m_h · g − μ · m_c · g) / (m_c + m_h) ≈ {a} m/s²',
      aZero: 'The pulling force cannot overcome friction: the cart stays put.',
      FGrund: 'pulling force F = m_h · g ≈ {F} N, rope tension ≈ {S} N',
      aTraeg: 'the truck brakes at {b} m/s², the box {how}',
      boxBelt: 'is braked along by the strap',
      boxLoose: 'only at μ · g ≈ {d} m/s² – it slides forward',
      boxSame: 'is fully braked by friction',
      FWechsel: 'Both carts feel {F} N, but in opposite directions.',
      vWechsel: 'v₁ ≈ {v1} m/s, v₂ ≈ {v2} m/s; m₁ · v₁ + m₂ · v₂ = 0',
      nowGrund: 't ≈ {t} s, s ≈ {s} m, v ≈ {v} m/s',
      nowTraeg: 't ≈ {t} s, truck {vc} m/s, box {vb} m/s',
      nowWechsel: 't ≈ {t} s',
      hit: 'The box crashes into the front wall!',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 2],
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

    /** Zustand der Bewegung (Weltkoordinaten in m, m/s). */
    let t = 0;
    let running = false;
    let xc = 0;
    let vc = 0;
    let xb = 0;
    let vb = 0;
    let hit = false;
    let hist: [number, number, number][] = [];

    const accel = () => pulleyAcceleration(p.mc, p.mh, p.mu);
    const tEnd = () => {
      if (p.mode === 'grund') {
        const a = accel();
        return a > 0 ? Math.sqrt((2 * TRACK) / a) : 1;
      }
      if (p.mode === 'traeg') return T_BRAKE + V0 / BRAKE + 1.2;
      return 2.5;
    };

    function reset(): void {
      t = 0;
      running = false;
      hit = false;
      hist = [];
      if (p.mode === 'traeg') {
        xc = 0;
        vc = V0;
        xb = 0;
        vb = V0;
      } else if (p.mode === 'grund') {
        xc = 0;
        vc = 0;
      } else {
        xc = 0;
        vc = 0;
        xb = 0;
        vb = 0;
      }
      hist.push([0, vc, vb]);
    }

    function setupPlot(): void {
      if (p.mode === 'grund') {
        const a = accel();
        const vmax = Math.max(0.5, Math.sqrt(2 * Math.max(a, 0.01) * TRACK));
        plot.setRangePadded([0, Math.max(1, tEnd())], [0, vmax * 1.15], { left: 46, right: 14, top: 22, bottom: 24 });
      } else if (p.mode === 'traeg') plot.setRangePadded([0, tEnd()], [0, V0 * 1.15], { left: 46, right: 14, top: 22, bottom: 24 });
      else {
        const r = pushOff(p.m1, p.m2, p.F, PUSH);
        const m = Math.max(Math.abs(r.v1), Math.abs(r.v2)) * 1.2;
        plot.setRangePadded([0, tEnd()], [-m, m], { left: 46, right: 14, top: 22, bottom: 24 });
      }
      plot.setAxes({ x: { label: ctx.t('t') }, y: { label: ctx.t('v') } });
    }

    function step(dt: number): void {
      if (p.mode === 'grund') {
        const a = accel();
        vc += a * dt;
        xc += vc * dt;
        if (xc >= TRACK) {
          xc = TRACK;
          running = false;
        }
      } else if (p.mode === 'traeg') {
        // Wagen
        const braking = t >= T_BRAKE && vc > 0;
        const ac = braking ? -BRAKE : 0;
        vc = Math.max(0, vc + ac * dt);
        xc += vc * dt;
        // Kiste
        if (p.gurt) {
          vb = vc;
          xb = xc;
        } else if (hit) {
          // liegt an der Stirnwand an und wird mitgebremst
          vb = vc;
          xb = xc + GAP;
        } else {
          const db = braking || vb > vc ? boxDeceleration(BRAKE, p.mub) : 0;
          const target = vb - db * dt;
          // Haftung: nie langsamer als der Wagen, solange sie mitrutscht
          vb = vb > vc ? Math.max(vc, target) : vc;
          xb += vb * dt;
          if (xb - xc >= GAP) {
            xb = xc + GAP;
            vb = vc;
            hit = true;
          }
        }
        if (vc === 0 && vb === 0 && t > T_BRAKE + 0.3) running = false;
      } else {
        // Feder drückt die ersten PUSH Sekunden
        const pushing = t < PUSH;
        const a1 = pushing ? -p.F / p.m1 : 0;
        const a2 = pushing ? p.F / p.m2 : 0;
        vc += a1 * dt;
        vb += a2 * dt;
        xc += vc * dt;
        xb += vb * dt;
        if (t > tEnd()) running = false;
      }
      t += dt;
    }

    function updateReadouts(): void {
      for (const k of ['a', 'F', 'v', 'now']) ctx.readout(k, null);
      if (p.mode === 'grund') {
        const a = accel();
        ctx.readout('a', a > 0 ? tr('aGrund', { a: fmt.num(a, 3) }) : ctx.t('aZero'));
        ctx.readout('F', tr('FGrund', { F: fmt.num(p.mh * G, 3), S: fmt.num(ropeForce(p.mh, a), 3) }));
        ctx.readout('now', tr('nowGrund', { t: fmt.num(t, 2), s: fmt.num(xc, 2), v: fmt.num(vc, 2) }));
      } else if (p.mode === 'traeg') {
        const d = boxDeceleration(BRAKE, p.mub);
        const how = p.gurt ? ctx.t('boxBelt') : d >= BRAKE ? ctx.t('boxSame') : tr('boxLoose', { d: fmt.num(d, 2) });
        ctx.readout('a', tr('aTraeg', { b: fmt.num(BRAKE, 0), how }));
        ctx.readout('now', hit ? ctx.t('hit') : tr('nowTraeg', { t: fmt.num(t, 2), vc: fmt.num(vc, 1), vb: fmt.num(vb, 1) }));
      } else {
        const r = pushOff(p.m1, p.m2, p.F, PUSH);
        ctx.readout('F', tr('FWechsel', { F: fmt.num(p.F, 0) }));
        ctx.readout('v', tr('vWechsel', { v1: fmt.num(r.v1, 2), v2: fmt.num(r.v2, 2) }));
        ctx.readout('now', tr('nowWechsel', { t: fmt.num(t, 2) }));
      }
    }

    /* ---------- Zeichnen ---------- */
    function wheels(g: CanvasRenderingContext2D, x: number, y: number, w: number, r: number, color: string): void {
      g.fillStyle = color;
      for (const wx of [x + w * 0.2, x + w * 0.8]) {
        g.beginPath();
        g.arc(wx, y, r, 0, Math.PI * 2);
        g.fill();
      }
    }

    function forceArrow(g: CanvasRenderingContext2D, x: number, y: number, len: number, color: string, label: string): void {
      if (Math.abs(len) < 2) return;
      const th = ctx.theme;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + len - Math.sign(len) * 10, y);
      g.stroke();
      g.beginPath();
      g.moveTo(x + len, y);
      g.lineTo(x + len - Math.sign(len) * 12, y - 7);
      g.lineTo(x + len - Math.sign(len) * 12, y + 7);
      g.closePath();
      g.fill();
      text(g, label, x + len / 2, y - 14, { font: `700 13px ${th.font}`, color });
    }

    function drawScene(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const narrow = surface.width < 700;
      const ground = r.y + r.h * 0.72;
      g.strokeStyle = th.text;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(r.x + 10, ground);
      g.lineTo(r.x + r.w - 10, ground);
      g.stroke();
      if (p.mode === 'traeg') {
        // Lastwagen: Welt 0 … 9 m auf die Breite, der Wagen bleibt im Bild
        const total = V0 * T_BRAKE + (V0 * V0) / (2 * BRAKE) + 1.5;
        const sx = (r.w - 40 - 150) / total;
        const cw = Math.min(170, r.w * 0.38);
        const chh = Math.min(50, r.h * 0.2);
        const x = r.x + 20 + xc * sx;
        // Ladefläche
        roundRect(g, x, ground - chh - 14, cw, chh * 0.35, 4);
        g.fillStyle = th.series[0]!;
        g.fill();
        // Führerhaus
        roundRect(g, x + cw, ground - chh * 1.5 - 14, cw * 0.28, chh * 1.5, 6);
        g.fillStyle = th.series[0]!;
        g.fill();
        g.fillStyle = withAlpha(th.bg, 0.85);
        g.fillRect(x + cw + cw * 0.06, ground - chh * 1.35 - 14, cw * 0.16, chh * 0.45);
        wheels(g, x, ground - 9, cw * 1.28, 9, th.text);
        // Stirnwand
        g.fillStyle = th.text;
        g.fillRect(x + cw - 6, ground - chh * 1.3 - 14, 6, chh * 1.3 - chh * 0.35 + chh * 0.35);
        // Kiste
        const bw = cw * 0.3;
        const bx = x + 10 + (xb - xc) * ((cw - 16 - bw) / GAP);
        const by = ground - chh - 14 - bw * 0.8;
        roundRect(g, bx, by, bw, bw * 0.8, 4);
        g.fillStyle = th.series[3]!;
        g.fill();
        text(g, ctx.t('box'), bx + bw / 2, by + bw * 0.4, { font: `700 ${narrow ? 10 : 12}px ${th.font}`, color: '#ffffff' });
        if (p.gurt) {
          g.strokeStyle = th.text;
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(bx - 4, ground - chh - 14);
          g.lineTo(bx + bw / 2, by);
          g.lineTo(bx + bw + 4, ground - chh - 14);
          g.stroke();
        }
      } else if (p.mode === 'grund') {
        const px = r.x + r.w - 60;
        const x0 = r.x + 30;
        const cw = Math.min(110, r.w * 0.2);
        const sx = (px - 20 - cw - x0) / TRACK;
        const chh = Math.min(40, r.h * 0.18);
        const x = x0 + xc * sx;
        roundRect(g, x, ground - chh - 12, cw, chh, 6);
        g.fillStyle = th.series[0]!;
        g.fill();
        text(g, `${fmt.num(p.mc, 1)} kg`, x + cw / 2, ground - chh / 2 - 12, { font: `700 13px ${th.font}`, color: '#ffffff' });
        wheels(g, x, ground - 7, cw, 7, th.text);
        // Rolle und Faden
        const ry = ground - chh / 2 - 12;
        g.strokeStyle = th.text;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(px, ry + 10, 10, 0, Math.PI * 2);
        g.stroke();
        g.fillStyle = th.text;
        g.fillRect(px - 2, ry + 10, 4, ground - ry - 10);
        const drop = 30 + xc * sx * 0.6;
        g.strokeStyle = th.muted;
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(x + cw, ry);
        g.lineTo(px, ry);
        g.moveTo(px + 10, ry + 10);
        g.lineTo(px + 10, ry + 10 + Math.min(drop, r.y + r.h - ry - 40));
        g.stroke();
        const hy = ry + 10 + Math.min(drop, r.y + r.h - ry - 40);
        const hs = 16 + 40 * Math.sqrt(p.mh / 0.5);
        roundRect(g, px + 10 - hs / 2, hy, hs, hs * 0.8, 4);
        g.fillStyle = th.series[3]!;
        g.fill();
        text(g, `${fmt.num(p.mh * 1000, 0)} g`, px + 10, hy + hs * 0.4, { font: `700 11px ${th.font}`, color: '#ffffff' });
        // Zugkraft-Pfeil am Wagen
        forceArrow(g, x + cw / 2, ground - chh - 30, 30 + 120 * (p.mh / 0.5), th.series[1]!, 'F');
      } else {
        const cx = r.x + r.w / 2;
        const cw = Math.min(90, r.w * 0.18);
        const pv = pushOff(p.m1, p.m2, p.F, PUSH);
        const maxDist = Math.max(Math.abs(pv.v1), Math.abs(pv.v2)) * tEnd();
        // Maßstab so, dass beide Wagen bis zum Ende im Bild bleiben
        const sx = Math.min(120, (r.w / 2 - cw * 1.3 - 16) / maxDist);
        const chh = Math.min(40, r.h * 0.18);
        const size = (m: number) => 0.7 + 0.15 * m;
        const x1 = cx - 6 + xc * sx - cw * size(p.m1);
        const x2 = cx + 6 + xb * sx;
        roundRect(g, x1, ground - chh * size(p.m1) - 12, cw * size(p.m1), chh * size(p.m1), 6);
        g.fillStyle = th.series[0]!;
        g.fill();
        text(g, `${fmt.num(p.m1, 1)} kg`, x1 + (cw * size(p.m1)) / 2, ground - (chh * size(p.m1)) / 2 - 12, { font: `700 12px ${th.font}`, color: '#ffffff' });
        wheels(g, x1, ground - 7, cw * size(p.m1), 7, th.text);
        roundRect(g, x2, ground - chh * size(p.m2) - 12, cw * size(p.m2), chh * size(p.m2), 6);
        g.fillStyle = th.series[2]!;
        g.fill();
        text(g, `${fmt.num(p.m2, 1)} kg`, x2 + (cw * size(p.m2)) / 2, ground - (chh * size(p.m2)) / 2 - 12, { font: `700 12px ${th.font}`, color: '#ffffff' });
        wheels(g, x2, ground - 7, cw * size(p.m2), 7, th.text);
        // Feder (gespannt vor dem Start)
        if (t < PUSH) {
          g.strokeStyle = th.text;
          g.lineWidth = 2;
          g.beginPath();
          const sx0 = x1 + cw * size(p.m1);
          const yy = ground - 30;
          g.moveTo(sx0, yy);
          for (let k = 1; k <= 6; k++) g.lineTo(sx0 + ((x2 - sx0) * k) / 6, yy + (k % 2 ? -6 : 6));
          g.stroke();
        }
        // Kräfte: gleich lang, entgegengesetzt (während des Abstoßens bzw. vorher angedeutet)
        if (t < PUSH) {
          const len = 20 + 3 * p.F;
          forceArrow(g, x1 + (cw * size(p.m1)) / 2, ground - chh * 1.6 - 20, -len, th.series[1]!, 'F₁');
          forceArrow(g, x2 + (cw * size(p.m2)) / 2, ground - chh * 1.6 - 20, len, th.series[1]!, 'F₂');
        }
      }
    }

    function drawChart(): void {
      const th = ctx.theme;
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      if (p.mode === 'grund') {
        const a = accel();
        plot.fn((x) => a * x, { color: withAlpha(th.muted, 0.6), width: 1.5, dash: [6, 5], from: 0, to: tEnd() });
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[0]!, width: 3 });
      } else if (p.mode === 'traeg') {
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[0]!, width: 3 });
        plot.polyline(hist.map(([tt, , v]) => [tt, v] as [number, number]), { color: th.series[3]!, width: 3, dash: [7, 5] });
        plot.text(tEnd() * 0.05, V0, ctx.t('cart'), { color: th.series[0]!, size: 12, weight: 'bold', offset: [0, -10] });
        plot.text(tEnd() * 0.25, V0, ctx.t('box'), { color: th.series[3]!, size: 12, weight: 'bold', offset: [0, -10] });
      } else {
        plot.polyline(hist.map(([tt, v]) => [tt, v] as [number, number]), { color: th.series[0]!, width: 3 });
        plot.polyline(hist.map(([tt, , v]) => [tt, v] as [number, number]), { color: th.series[2]!, width: 3 });
      }
      plot.end();
    }

    reset();

    return {
      update(changed, source) {
        if (source === 'init' || changed.size > 0) {
          reset();
          setupPlot();
        }
        ctx.setAction('go', { label: ctx.t('start') });
        updateReadouts();
      },

      action(id) {
        if (id !== 'go') return;
        reset();
        running = true;
        ctx.setAction('go', { label: ctx.t('again') });
        if (prefersReducedMotion()) {
          while (running && t < 20) {
            step(0.002);
            hist.push([t, vc, vb]);
          }
        } else ctx.clock.play();
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        if (!running) {
          ctx.clock.pause();
          return;
        }
        const n = 20;
        for (let k = 0; k < n; k++) step(Math.min(dt, 0.05) / n);
        hist.push([t, vc, vb]);
        updateReadouts();
      },

      resetTime() {
        reset();
        updateReadouts();
      },

      render() {
        const s = split(surface.width, surface.height);
        plot.resize();
        surface.begin();
        drawScene(s.scene);
        drawChart();
      },

      destroy: () => surface.destroy(),
    };
  },
});
