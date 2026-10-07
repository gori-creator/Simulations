import { defineSimulation, FixedStepper, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { buildTrack, LOOP_RADIUS, normalAcceleration, stepCart, type CartState, type Track, type TrackId } from './model';

const L = (de: string, en: string) => ({ de, en });
const G = 9.81;
const CAR_LENGTH = 3.2;
const CAR_HEIGHT = 1.7;

function layout(w: number, h: number): { scene: Rect; bars: Rect } {
  if (w >= 700) {
    const bw = Math.min(250, w * 0.27);
    return { scene: { x: 0, y: 0, w: w - bw, h }, bars: { x: w - bw, y: 0, w: bw, h } };
  }
  return { scene: { x: 0, y: 0, w, h: h * 0.66 }, bars: { x: 0, y: h * 0.66, w, h: h * 0.34 } };
}

/**
 * Energieerhaltung an der Achterbahn: Der Wagen rollt los, Lageenergie wird
 * zu Bewegungsenergie und zurück. Mit Reibung wird ein Teil in innere Energie
 * umgewandelt. Im Looping zeigt die Simulation, ob der Wagen ohne
 * Sicherungsräder abheben würde.
 */
export default defineSimulation({
  id: 'energieerhaltung',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.75, aspectNarrow: 0.85 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'track',
      type: 'choice',
      label: L('Bahn', 'Track'),
      options: [
        { value: 'tal', label: L('Tal', 'Valley') },
        { value: 'huegel', label: L('Hügel', 'Hills') },
        { value: 'looping', label: L('Looping', 'Loop') },
      ],
      default: 'huegel',
    },
    { key: 'h0', type: 'number', label: L('Starthöhe h₀', 'Starting height h₀'), min: 2, max: 26, step: 0.5, default: 20, unit: 'm' },
    { key: 'm', type: 'number', label: L('Masse des Wagens m', 'Mass of the car m'), min: 100, max: 800, step: 50, default: 400, unit: 'kg' },
    {
      key: 'mu',
      type: 'number',
      label: L('Reibungszahl μ', 'Friction coefficient μ'),
      help: L('0 bedeutet: keine Reibung (Idealfall).', '0 means: no friction (ideal case).'),
      min: 0,
      max: 0.06,
      step: 0.005,
      default: 0,
    },
    { key: 'bars', type: 'boolean', group: 'view', label: L('Energie-Säulen', 'Energy bars'), default: true },
    { key: 'level', type: 'boolean', group: 'view', label: L('Linie in Starthöhe', 'Line at the starting height'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [{ id: 'start', label: L('Losfahren', 'Go'), primary: true }],
  images: { car: 'wagen.webp', sky: 'himmel.webp' },
  readouts: [
    { key: 'motion', label: L('Höhe und Geschwindigkeit', 'Height and speed') },
    { key: 'energy', label: L('Energien', 'Energies') },
    { key: 'vmax', label: L('Höchstgeschwindigkeit ohne Reibung', 'Top speed without friction'), spoiler: true },
    { key: 'loop', label: L('Looping', 'Loop') },
  ],
  presets: [
    { id: 'start', label: L('Hügel ohne Reibung', 'Hills without friction'), values: {} },
    { id: 'friction', label: L('Mit Reibung', 'With friction'), values: { mu: 0.03 } },
    { id: 'valley', label: L('Tal: hin und her', 'Valley: back and forth'), values: { track: 'tal', h0: 15 } },
    { id: 'loop', label: L('Looping', 'Loop'), values: { track: 'looping', h0: 20 } },
    { id: 'loopLow', label: L('Looping: zu niedrig gestartet', 'Loop: start too low'), values: { track: 'looping', h0: 13 } },
  ],
  strings: {
    de: {
      canvas: 'Achterbahn mit Wagen und Diagramm der Energien',
      pot: 'Lage',
      kin: 'Bewegung',
      heat: 'innere',
      total: 'gesamt',
      energyUnit: 'Energie in kJ',
      motion: 'h = {h} m · v = {v} m/s ({kmh} km/h)',
      energy: 'E_pot = {pot} kJ · E_kin = {kin} kJ · innere Energie = {heat} kJ · Summe = {sum} kJ',
      vmax: 'v = √(2 · g · Δh) = {v} m/s ({kmh} km/h) im tiefsten Punkt',
      loopOk: 'Mindest-Starthöhe ohne Reibung: 2,5 · r = {h} m (Radius r = {r} m). Oben gilt dann v² ≥ g · r.',
      lift: 'Hier würde der Wagen ohne Sicherungsräder abheben!',
      liftShort: 'Wagen würde hier abheben!',
      levelLabel: 'Starthöhe',
    },
    en: {
      canvas: 'Roller coaster with a car and a chart of the energies',
      pot: 'potential',
      kin: 'kinetic',
      heat: 'internal',
      total: 'total',
      energyUnit: 'Energy in kJ',
      motion: 'h = {h} m · v = {v} m/s ({kmh} km/h)',
      energy: 'E_pot = {pot} kJ · E_kin = {kin} kJ · internal = {heat} kJ · total = {sum} kJ',
      vmax: 'v = √(2 · g · Δh) = {v} m/s ({kmh} km/h) at the lowest point',
      loopOk: 'Minimum starting height without friction: 2.5 · r = {h} m (radius r = {r} m). At the top v² ≥ g · r then holds.',
      lift: 'Without safety wheels the car would lift off here!',
      liftShort: 'The car would lift off here!',
      levelLabel: 'starting height',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const plot = new Plot(surface, {
      x: [-40, 40],
      y: [-2, 28],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => layout(w, h).scene,
    });

    let trackId: TrackId = p.track as TrackId;
    let track: Track = buildTrack(trackId);
    let cart: CartState = { s: 0, v: 0, w: 0 };
    let startY = 0;
    let lifted = false;
    let restTime = 0;
    const stepper = new FixedStepper(0.002);

    function restart(): void {
      const h = Math.min(p.h0, track.maxHeight - 0.5);
      cart = { s: track.startAt(h), v: 0, w: 0 };
      startY = track.at(cart.s).y;
      lifted = false;
      restTime = 0;
      stepper.reset();
    }

    let lastRect = '';
    /** Bahn einpassen; der Boden bleibt unten, zusätzlicher Platz kommt in den Himmel. */
    function fitView(): void {
      const xs = track.points.map((q) => q.x);
      let x0 = Math.min(...xs) - 3;
      let x1 = Math.max(...xs) + 3;
      const y0 = -3;
      let y1 = track.maxHeight + 7;
      const r = plot.rect;
      const aspect = r.w / Math.max(1, r.h);
      if ((x1 - x0) / (y1 - y0) > aspect) y1 = y0 + (x1 - x0) / aspect;
      else {
        const extra = ((y1 - y0) * aspect - (x1 - x0)) / 2;
        x0 -= extra;
        x1 += extra;
      }
      plot.setRange([x0, x1], [y0, y1]);
      lastRect = `${r.w}x${r.h}`;
    }

    function energies(): { pot: number; kin: number; heat: number } {
      const y = track.at(cart.s).y;
      return { pot: p.m * G * y, kin: 0.5 * p.m * cart.v * cart.v, heat: p.m * cart.w };
    }

    function updateReadouts(): void {
      const y = track.at(cart.s).y;
      const v = Math.abs(cart.v);
      ctx.readout('motion', tr('motion', { h: fmt.num(y, 1), v: fmt.num(v, 1), kmh: fmt.num(v * 3.6, 0) }));
      const e = energies();
      const kj = (x: number) => fmt.num(x / 1000, 1);
      ctx.readout('energy', tr('energy', { pot: kj(e.pot), kin: kj(e.kin), heat: kj(e.heat), sum: kj(e.pot + e.kin + e.heat) }));
      const vmax = Math.sqrt(2 * G * Math.max(0, startY - track.minHeight));
      ctx.readout('vmax', tr('vmax', { v: fmt.num(vmax, 1), kmh: fmt.num(vmax * 3.6, 0) }));
      ctx.readout('loop', trackId === 'looping' ? tr('loopOk', { h: fmt.num(2.5 * LOOP_RADIUS, 1), r: fmt.num(LOOP_RADIUS, 0) }) : null);
    }

    // Wagen an der Startstelle verschieben (nur vor der Fahrt)
    const atStart = () => cart.v === 0 && cart.w === 0 && Math.abs(track.at(cart.s).y - startY) < 1e-6;
    plot.addHandle({
      get: () => {
        const q = track.at(cart.s);
        return [q.x - Math.sin(q.theta) * CAR_HEIGHT * 0.5, q.y + Math.cos(q.theta) * CAR_HEIGHT * 0.5];
      },
      set: (x, y) => {
        let best = track.points[0]!;
        let bestD = Infinity;
        for (const q of track.points) {
          const d = (q.x - x) ** 2 + (q.y - y) ** 2;
          if (d < bestD) [best, bestD] = [q, d];
        }
        ctx.clock.pause();
        ctx.set({ h0: Math.max(2, best.y) });
      },
      enabled: () => !ctx.locked && atStart(),
      color: () => ctx.theme.series[3]!,
    });

    /* ---------- Zeichnen ---------- */
    function drawSky(): void {
      const g = surface.g;
      const r = plot.rect;
      const img = ctx.images.get('sky');
      if (img) {
        const scale = Math.max(r.w / img.width, r.h / img.height);
        g.drawImage(img, r.x + (r.w - img.width * scale) / 2, r.y + r.h - img.height * scale, img.width * scale, img.height * scale);
        if (ctx.theme.dark) {
          g.fillStyle = 'rgba(5,10,25,0.5)';
          g.fillRect(r.x, r.y, r.w, r.h);
        }
      } else {
        const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
        grad.addColorStop(0, ctx.theme.dark ? '#0f1b30' : '#8cc4f2');
        grad.addColorStop(1, ctx.theme.dark ? '#22324d' : '#e6f3ff');
        g.fillStyle = grad;
        g.fillRect(r.x, r.y, r.w, r.h);
      }
      // Boden
      const groundY = plot.py(-0.8);
      const ground = g.createLinearGradient(0, groundY, 0, r.y + r.h);
      ground.addColorStop(0, ctx.theme.dark ? '#2f4a2a' : '#6db357');
      ground.addColorStop(1, ctx.theme.dark ? '#1d2e1a' : '#3f7a33');
      g.fillStyle = ground;
      g.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
    }

    function drawTrack(): void {
      const g = surface.g;
      const pts = track.points;
      const dark = ctx.theme.dark;
      // Stützen
      g.strokeStyle = dark ? 'rgba(170,180,195,0.45)' : 'rgba(90,100,115,0.55)';
      g.lineWidth = 2;
      const groundY = plot.py(-0.8);
      let nextX = -Infinity;
      for (const q of pts) {
        if (q.x < nextX || Math.cos(q.theta) < 0.2) continue;
        // im Looping nur am unteren Teil abstützen
        if (trackId === 'looping' && q.x > -0.5 && q.x < 4 && q.y > 1) continue;
        nextX = q.x + 2.5;
        const [px, py] = plot.toPx(q.x, q.y);
        g.beginPath();
        g.moveTo(px, py + 4);
        g.lineTo(px, groundY);
        g.stroke();
      }
      // Schwellen
      g.strokeStyle = dark ? '#8d6e57' : '#6b4b33';
      g.lineWidth = 3;
      let nextS = 0;
      for (const q of pts) {
        if (q.s < nextS) continue;
        nextS = q.s + 0.9;
        const [px, py] = plot.toPx(q.x, q.y);
        const nx = -Math.sin(q.theta);
        const ny = Math.cos(q.theta);
        g.beginPath();
        g.moveTo(px - nx * 5, py + ny * 5);
        g.lineTo(px + nx * 2, py - ny * 2);
        g.stroke();
      }
      // Schienen
      const rail = (offset: number, color: string, width: number) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.beginPath();
        pts.forEach((q, i) => {
          const [px, py] = plot.toPx(q.x, q.y);
          const x = px - Math.sin(q.theta) * offset;
          const y = py - Math.cos(q.theta) * offset;
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        });
        g.stroke();
      };
      rail(-4, dark ? '#c43f3f' : '#b3261e', 4);
      rail(0, dark ? '#e4e8ee' : '#3b4252', 3);
      // Prellböcke
      for (const q of [pts[0]!, pts[pts.length - 1]!]) {
        const [px, py] = plot.toPx(q.x, q.y);
        g.fillStyle = '#e8b931';
        g.fillRect(px - 4, py - 14, 8, 14);
      }
    }

    function drawCar(): void {
      const g = surface.g;
      const q = track.at(cart.s);
      const scale = plot.scale.x;
      // Wagen etwas größer als maßstäblich, damit er gut sichtbar ist
      const len = Math.max(CAR_LENGTH * scale, 52);
      const hgt = len * (CAR_HEIGHT / CAR_LENGTH);
      const [px, py] = plot.toPx(q.x, q.y);
      g.save();
      g.translate(px, py);
      g.rotate(-q.theta);
      g.shadowColor = 'rgba(0,0,0,0.3)';
      g.shadowBlur = 6;
      const img = ctx.images.get('car');
      if (img) {
        g.drawImage(img, -len / 2, -hgt - 2, len, hgt);
      } else {
        // Wagenkasten
        const body = g.createLinearGradient(0, -hgt, 0, 0);
        body.addColorStop(0, '#ff6b5e');
        body.addColorStop(1, '#c4271c');
        g.fillStyle = body;
        roundRect(g, -len / 2, -hgt * 0.78, len, hgt * 0.55, hgt * 0.15);
        g.fill();
        g.shadowColor = 'transparent';
        // Fahrgast
        g.fillStyle = '#ffd7b0';
        g.beginPath();
        g.arc(-len * 0.05, -hgt * 0.92, hgt * 0.16, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#3b4252';
        g.fillRect(-len * 0.2, -hgt * 0.95, len * 0.08, hgt * 0.2);
        // Räder
        g.fillStyle = '#2b2f36';
        for (const x of [-len * 0.3, len * 0.3]) {
          g.beginPath();
          g.arc(x, -hgt * 0.16, hgt * 0.16, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#9aa3ad';
          g.beginPath();
          g.arc(x, -hgt * 0.16, hgt * 0.06, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#2b2f36';
        }
      }
      g.restore();
    }

    function drawSpeedometer(): void {
      const g = surface.g;
      const r = plot.rect;
      const cx = r.x + 66;
      const cy = r.y + 70;
      const rad = 46;
      const vmax = Math.max(10, Math.sqrt(2 * G * Math.max(1, startY - track.minHeight)) * 3.6);
      const max = Math.ceil(vmax / 20) * 20;
      const v = Math.abs(cart.v) * 3.6;
      g.save();
      g.fillStyle = ctx.theme.dark ? 'rgba(15,20,30,0.85)' : 'rgba(255,255,255,0.9)';
      g.beginPath();
      g.arc(cx, cy, rad + 10, 0, Math.PI * 2);
      g.fill();
      const a0 = Math.PI * 0.75;
      const a1 = Math.PI * 2.25;
      g.strokeStyle = withAlpha(ctx.theme.muted, 0.4);
      g.lineWidth = 6;
      g.beginPath();
      g.arc(cx, cy, rad, a0, a1);
      g.stroke();
      g.strokeStyle = ctx.theme.series[1]!;
      g.beginPath();
      g.arc(cx, cy, rad, a0, a0 + ((a1 - a0) * Math.min(v, max)) / max);
      g.stroke();
      for (let k = 0; k <= max; k += 20) {
        const a = a0 + ((a1 - a0) * k) / max;
        text(g, String(k), cx + Math.cos(a) * (rad - 14), cy + Math.sin(a) * (rad - 14), { font: `600 9px ${ctx.theme.font}`, color: ctx.theme.muted });
      }
      const a = a0 + ((a1 - a0) * Math.min(v, max)) / max;
      g.strokeStyle = ctx.theme.text;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(a) * (rad - 6), cy + Math.sin(a) * (rad - 6));
      g.stroke();
      text(g, `${fmt.num(v, 0)} km/h`, cx, cy + rad * 0.86, { font: `700 12px ${ctx.theme.font}`, color: ctx.theme.text });
      g.restore();
    }

    function drawBars(area: Rect): void {
      if (!p.bars) return;
      const g = surface.g;
      const theme = ctx.theme;
      const e = energies();
      const total = p.m * G * startY || 1;
      const pad = 14;
      const box: Rect = { x: area.x + pad, y: area.y + pad, w: area.w - pad * 2, h: area.h - pad * 2 };
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.03)' : 'rgba(16,24,40,0.03)';
      roundRect(g, box.x, box.y, box.w, box.h, 12);
      g.fill();
      text(g, ctx.t('energyUnit'), box.x + box.w / 2, box.y + 14, { font: `700 12px ${theme.font}`, color: theme.muted });
      const items: [string, number, string][] = [
        [ctx.t('pot'), e.pot, theme.series[0]!],
        [ctx.t('kin'), e.kin, theme.series[1]!],
        [ctx.t('heat'), e.heat, theme.series[3]!],
      ];
      const top = box.y + 40;
      const bottom = box.y + box.h - 34;
      const slot = box.w / 4;
      const barW = Math.min(36, slot * 0.6);
      const height = (v: number) => ((bottom - top) * Math.max(0, v)) / total;
      items.forEach(([label, value, color], i) => {
        const x = box.x + slot * i + (slot - barW) / 2;
        g.fillStyle = color;
        roundRect(g, x, bottom - height(value), barW, Math.max(1, height(value)), 4);
        g.fill();
        text(g, fmt.num(value / 1000, 0), x + barW / 2, bottom - height(value) - 9, { font: `600 11px ${theme.font}`, color: theme.text });
        text(g, label, x + barW / 2, bottom + 14, { font: `600 11px ${theme.font}`, color: color });
      });
      // Gesamtsäule (gestapelt)
      const x = box.x + slot * 3 + (slot - barW) / 2;
      let y = bottom;
      for (const [, value, color] of items) {
        const h = height(value);
        g.fillStyle = color;
        g.fillRect(x, y - h, barW, h);
        y -= h;
      }
      g.strokeStyle = theme.text;
      g.lineWidth = 1.5;
      g.strokeRect(x, bottom - (bottom - top), barW, bottom - top);
      text(g, ctx.t('total'), x + barW / 2, bottom + 14, { font: `700 11px ${theme.font}`, color: theme.text });
      g.strokeStyle = theme.axis;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(box.x + 6, bottom + 0.5);
      g.lineTo(box.x + box.w - 6, bottom + 0.5);
      g.stroke();
    }

    restart();
    fitView();

    return {
      update(changed, source) {
        if (changed.has('track')) {
          trackId = p.track as TrackId;
          track = buildTrack(trackId);
          fitView();
        }
        if (changed.has('track') || changed.has('h0') || source === 'replace' || source === 'init') {
          if (source !== 'sim') ctx.clock.pause();
          restart();
        }
        updateReadouts();
      },

      action(id) {
        if (id === 'start') {
          restart();
          ctx.clock.play();
        }
      },

      tick(dt) {
        stepper.run(dt * (p.slow ? 0.25 : 1), (h) => {
          cart = stepCart(track, cart, G, p.mu, h);
          if (trackId === 'looping' && track.at(cart.s).y > LOOP_RADIUS && normalAcceleration(track, cart.s, cart.v, G) < 0) lifted = true;
        });
        restTime = cart.v === 0 ? restTime + dt : 0;
        if (restTime > 1.2 && p.mu > 0) ctx.clock.pause();
        updateReadouts();
      },

      resetTime() {
        restart();
        updateReadouts();
      },

      render() {
        const area = layout(surface.width, surface.height);
        if (`${plot.rect.w}x${plot.rect.h}` !== lastRect) fitView();
        surface.begin();
        plot.begin();
        drawSky();
        if (p.level) {
          plot.hline(startY, { color: ctx.theme.series[0], width: 1.5, dash: [8, 6], alpha: 0.8 });
          plot.text(plot.bounds.xMax, startY, ctx.t('levelLabel'), { color: ctx.theme.series[0], size: 12, align: 'right', offset: [-8, -10], weight: '600' });
        }
        drawTrack();
        drawCar();
        drawSpeedometer();
        if (lifted) {
          const r = plot.rect;
          const g = surface.g;
          g.font = `700 14px ${ctx.theme.font}`;
          const msg = ctx.t(r.w < 520 ? 'liftShort' : 'lift');
          const tw = g.measureText(msg).width + 24;
          g.fillStyle = 'rgba(200,30,30,0.9)';
          roundRect(g, r.x + (r.w - tw) / 2, r.y + 12, tw, 30, 10);
          g.fill();
          text(g, msg, r.x + r.w / 2, r.y + 27, { font: `700 14px ${ctx.theme.font}`, color: '#ffffff' });
        }
        plot.end();
        drawBars(area.bars);
      },

      destroy: () => surface.destroy(),
    };
  },
});
