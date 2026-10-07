import { defineSimulation, Plot, roundRect, Surface, text, type Rect } from '../../../sim-core';
import {
  dragFlight,
  footballDrag,
  PLANETS,
  sampleAt,
  vacuumFlight,
  vacuumState,
  type Flight,
  type FlightState,
  type Launch,
  type PlanetId,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const FAMILY = [15, 30, 45, 60, 75];
const BALL_PX = 9;

const GROUND: Record<PlanetId, { top: string; bottom: string; sky: [string, string] }> = {
  erde: { top: '#5fa846', bottom: '#3d6b2c', sky: ['#7fb8f0', '#dcefff'] },
  mond: { top: '#9a9a9a', bottom: '#5c5c5c', sky: ['#05060a', '#1b1e27'] },
  mars: { top: '#c4673a', bottom: '#7d3519', sky: ['#c99a78', '#f0d3b8'] },
};

/**
 * Waagerechter und schiefer Wurf: Ein Ball wird mit v₀ unter dem Winkel α aus
 * der Höhe h₀ geworfen – auf der Erde, dem Mond oder dem Mars, wahlweise mit
 * Luftwiderstand. Bahn, Stroboskop-Positionen und Geschwindigkeitsvektoren.
 */
export default defineSimulation({
  id: 'schiefer-wurf',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.75, aspectNarrow: 0.95 },
  groups: [
    { id: 'world', label: L('Ort und Luft', 'Location and air') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'v0', type: 'number', label: L('Abwurfgeschwindigkeit v₀', 'Launch speed v₀'), min: 1, max: 40, step: 0.5, default: 15, unit: 'm/s' },
    { key: 'angle', type: 'number', label: L('Abwurfwinkel α', 'Launch angle α'), min: -45, max: 90, step: 1, default: 30, unit: '°' },
    { key: 'h0', type: 'number', label: L('Abwurfhöhe h₀', 'Launch height h₀'), min: 0, max: 40, step: 0.5, default: 0, unit: 'm' },
    {
      key: 'planet',
      type: 'choice',
      group: 'world',
      label: L('Ort', 'Location'),
      options: [
        { value: 'erde', label: L('Erde', 'Earth') },
        { value: 'mond', label: L('Mond', 'Moon') },
        { value: 'mars', label: L('Mars', 'Mars') },
      ],
      default: 'erde',
    },
    {
      key: 'air',
      type: 'boolean',
      group: 'world',
      label: L('Luftwiderstand (Fußball)', 'Air resistance (football)'),
      help: L('Auf dem Mond gibt es keine Luft, auf dem Mars nur sehr wenig.', 'There is no air on the Moon and very little on Mars.'),
      default: false,
    },
    { key: 'vectors', type: 'boolean', group: 'view', label: L('Geschwindigkeit und Komponenten', 'Velocity and components'), default: true },
    { key: 'strobe', type: 'boolean', group: 'view', label: L('Positionen in gleichen Zeitabständen', 'Positions at equal time intervals'), default: true },
    { key: 'family', type: 'boolean', group: 'view', label: L('Vergleich: Winkel 15° bis 75°', 'Compare: angles 15° to 75°'), default: false },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [{ id: 'throw', label: L('Werfen', 'Throw'), primary: true }],
  images: {
    erde: 'hintergrund-erde.webp',
    mond: 'hintergrund-mond.webp',
    mars: 'hintergrund-mars.webp',
    ball: 'ball.webp',
  },
  readouts: [
    { key: 'time', label: L('Flugzeit', 'Time of flight'), spoiler: true },
    { key: 'range', label: L('Wurfweite', 'Range'), spoiler: true },
    { key: 'height', label: L('Maximale Höhe', 'Maximum height'), spoiler: true },
    { key: 'impact', label: L('Aufprallgeschwindigkeit', 'Impact speed'), spoiler: true },
    { key: 'path', label: L('Bahngleichung (ohne Luftwiderstand)', 'Trajectory equation (no air resistance)'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Schräger Wurf', 'Oblique throw'), values: {} },
    { id: 'horizontal', label: L('Waagerecht vom Turm', 'Horizontal from a tower'), values: { v0: 8, angle: 0, h0: 20 } },
    { id: 'compare', label: L('Welcher Winkel ist am weitesten?', 'Which angle goes furthest?'), values: { family: true, v0: 15, angle: 45 } },
    { id: 'moon', label: L('Auf dem Mond', 'On the Moon'), values: { planet: 'mond', angle: 45, v0: 10 } },
    { id: 'air', label: L('Fußball mit Luftwiderstand', 'Football with air resistance'), values: { air: true, v0: 28, angle: 35 } },
  ],
  strings: {
    de: {
      canvas: 'Wurfbahn eines Balls mit Boden, Abwurfstelle und Geschwindigkeitspfeilen',
      vacuum: 'ohne Luft',
      range: 'Wurfweite',
      height: 'höchster Punkt',
      t: 't',
      speedAt: '{v} m/s unter {a}° zur Waagerechten',
      g: 'g = {g} m/s²',
    },
    en: {
      canvas: 'Trajectory of a ball with ground, launch point and velocity arrows',
      vacuum: 'no air',
      range: 'Range',
      height: 'highest point',
      t: 't',
      speedAt: '{v} m/s at {a}° to the horizontal',
      g: 'g = {g} m/s²',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const plot = new Plot(surface, { x: [-2, 30], y: [-2, 12], pan: false, zoom: false, controls: false, xAxis: { label: 'x in m' }, yAxis: { label: 'y in m' } });
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');

    let t = 0;
    let launch: Launch = { v0: p.v0, angle: p.angle, h0: p.h0, g: 9.81 };
    let flight: Flight = vacuumFlight(launch);
    let samples: FlightState[] | null = null;
    let vacuum: Flight = flight;
    let family: { angle: number; points: [number, number][] }[] = [];
    let view = { xMin: -2, xMax: 30, yMin: -2, yMax: 12 };
    let lastRect = '';

    const planet = () => PLANETS[p.planet as PlanetId];
    const dragK = () => (p.air ? footballDrag(planet().rho) : 0);
    const stateAt = (time: number): FlightState => {
      const tt = Math.min(Math.max(0, time), flight.time);
      if (samples) return sampleAt(samples, tt);
      const s = vacuumState(launch, tt);
      return tt >= flight.time ? { ...s, y: 0 } : s;
    };
    /** Länge des Geschwindigkeitspfeils pro m/s (in m). */
    const arrowScale = () => Math.max((view.xMax - view.xMin) / 110, ((view.xMax - view.xMin) * 0.09) / Math.max(launch.v0, 1));

    function trajectory(l: Launch, k: number, n = 120): [number, number][] {
      if (k > 0) {
        const res = dragFlight(l, k, 0.01);
        const step = Math.max(1, Math.floor(res.samples.length / n));
        const pts = res.samples.filter((_, i) => i % step === 0).map((s) => [s.x, s.y] as [number, number]);
        pts.push([res.flight.range, 0]);
        return pts;
      }
      const f = vacuumFlight(l);
      return Array.from({ length: n + 1 }, (_, i) => {
        const s = vacuumState(l, (f.time * i) / n);
        return [s.x, i === n ? 0 : s.y] as [number, number];
      });
    }

    function compute(): void {
      launch = { v0: p.v0, angle: p.angle, h0: p.h0, g: planet().g };
      vacuum = vacuumFlight(launch);
      const k = dragK();
      if (k > 0) {
        const res = dragFlight(launch, k);
        samples = res.samples;
        flight = res.flight;
      } else {
        samples = null;
        flight = vacuum;
      }
      family = p.family ? FAMILY.map((angle) => ({ angle, points: trajectory({ ...launch, angle }, k, 80) })) : [];
      t = Math.min(t, flight.time);
    }

    /** Sichtbaren Bereich an Bahn und Zeichenfläche anpassen (Boden bleibt unten). */
    function fitView(allowShrink: boolean): void {
      let xMax = Math.max(flight.range, 4);
      let yMax = Math.max(flight.maxHeight, launch.h0, 2);
      if (p.air) {
        xMax = Math.max(xMax, vacuum.range);
        yMax = Math.max(yMax, vacuum.maxHeight);
      }
      for (const f of family) for (const [x, y] of f.points) [xMax, yMax] = [Math.max(xMax, x), Math.max(yMax, y)];
      // Platz für den Abwurfpfeil
      const a = (launch.angle * Math.PI) / 180;
      const span = Math.max(xMax, yMax);
      const pad = span * 0.06 + 0.5;
      let next = { xMin: -Math.max(pad, launch.h0 > 0 ? span * 0.08 : pad), xMax: xMax + pad * 1.6, yMin: -span * 0.07, yMax: yMax * 1.12 + pad + Math.max(0, Math.sin(a)) * span * 0.04 };
      const r = plot.rect;
      const aspect = r.w / Math.max(1, r.h);
      const w = next.xMax - next.xMin;
      const h = next.yMax - next.yMin;
      if (w / h > aspect) next.yMax = next.yMin + w / aspect;
      else next.xMax = next.xMin + h * aspect;
      if (!allowShrink) {
        const fits = next.xMax <= view.xMax * 1.0001 && next.yMax <= view.yMax * 1.0001 && next.xMin >= view.xMin * 1.0001;
        if (fits) return;
        next = { xMin: Math.min(next.xMin, view.xMin), xMax: Math.max(next.xMax, view.xMax), yMin: Math.min(next.yMin, view.yMin), yMax: Math.max(next.yMax, view.yMax) };
      }
      view = next;
      plot.setRange([view.xMin, view.xMax], [view.yMin, view.yMax]);
    }

    function updateReadouts(): void {
      const s = stateAt(t);
      ctx.readout('time', `T ≈ ${fmt.num(flight.time, 2)} s`);
      ctx.readout('range', `w ≈ ${fmt.num(flight.range, 2)} m`);
      ctx.readout('height', `h_max ≈ ${fmt.num(flight.maxHeight, 2)} m`);
      const iv = Math.hypot(flight.impact.vx, flight.impact.vy);
      const ia = (Math.atan2(-flight.impact.vy, flight.impact.vx) * 180) / Math.PI;
      ctx.readout('impact', tr('speedAt', { v: fmt.num(iv, 1), a: fmt.num(ia, 0) }));
      if (p.air && dragK() > 0) ctx.readout('path', null);
      else if (Math.abs(launch.angle) >= 89.5) ctx.readout('path', { html: `senkrechter Wurf: <var>x</var> = 0` });
      else {
        const a = (launch.angle * Math.PI) / 180;
        const c = launch.g / (2 * launch.v0 ** 2 * Math.cos(a) ** 2);
        const parts = [`−${fmt.num(c, 4)}<var>x</var>²`];
        const tan = Math.tan(a);
        if (Math.abs(tan) > 1e-9) parts.push(`${tan < 0 ? '−' : '+'} ${Math.abs(Math.abs(tan) - 1) < 1e-9 ? '' : fmt.num(Math.abs(tan), 3)}<var>x</var>`);
        if (launch.h0 > 0) parts.push(`+ ${fmt.num(launch.h0, 1)}`);
        ctx.readout('path', { html: `<var>y</var> = ${parts.join(' ')}` });
      }
      ctx.readout(
        'now',
        `t = ${fmt.num(s.t, 2)} s · x = ${fmt.num(s.x, 1)} m · y = ${fmt.num(Math.max(0, s.y), 1)} m · v = ${fmt.num(Math.hypot(s.vx, s.vy), 1)} m/s`,
      );
    }

    // Ziehbarer Abwurfpfeil (v₀ und α) und Abwurfhöhe
    const editable = () => !ctx.locked && t === 0;
    plot.addHandle({
      get: () => {
        const a = (launch.angle * Math.PI) / 180;
        const k = arrowScale();
        return [launch.v0 * k * Math.cos(a), launch.h0 + launch.v0 * k * Math.sin(a)];
      },
      set: (x, y) => {
        const k = arrowScale();
        const dx = x;
        const dy = y - launch.h0;
        ctx.set({ v0: Math.hypot(dx, dy) / k, angle: Math.round((Math.atan2(dy, dx) * 180) / Math.PI) });
      },
      enabled: editable,
      color: () => ctx.theme.series[3]!,
    });
    plot.addHandle({
      get: () => [0, launch.h0],
      set: (_x, y) => ctx.set({ h0: Math.max(0, y) }),
      axis: 'y',
      enabled: editable,
      color: () => ctx.theme.series[4]!,
    });

    /* ---------- Zeichnen ---------- */
    function drawBackground(): void {
      const g = surface.g;
      const r = plot.rect;
      const groundY = Math.min(r.y + r.h, Math.max(r.y, plot.py(0)));
      const colors = GROUND[p.planet as PlanetId];
      const img = ctx.images.get(p.planet as string);
      const sky: Rect = { x: r.x, y: r.y, w: r.w, h: groundY - r.y };
      if (img && sky.h > 2) {
        g.save();
        g.beginPath();
        g.rect(sky.x, sky.y, sky.w, sky.h);
        g.clip();
        // Horizont des Bildes liegt am unteren Bildrand → auf den Boden setzen
        const scale = Math.max(sky.w / img.width, sky.h / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        g.drawImage(img, sky.x + (sky.w - w) / 2, groundY - h, w, h);
        if (ctx.theme.dark) {
          g.fillStyle = 'rgba(0,0,0,0.3)';
          g.fillRect(sky.x, sky.y, sky.w, sky.h);
        }
        g.restore();
      } else {
        const grad = g.createLinearGradient(0, r.y, 0, groundY);
        const dark = ctx.theme.dark && p.planet !== 'mond';
        grad.addColorStop(0, dark ? '#16243a' : colors.sky[0]);
        grad.addColorStop(1, dark ? '#2b3a52' : colors.sky[1]);
        g.fillStyle = grad;
        g.fillRect(sky.x, sky.y, sky.w, sky.h);
        if (p.planet === 'mond') {
          // ein paar Sterne
          g.fillStyle = 'rgba(255,255,255,0.8)';
          for (let i = 0; i < 60; i++) {
            const sx = r.x + ((i * 97.3) % r.w);
            const sy = r.y + ((i * 53.7) % Math.max(1, sky.h * 0.9));
            g.fillRect(sx, sy, i % 7 === 0 ? 2 : 1, i % 7 === 0 ? 2 : 1);
          }
        }
      }
      // Boden
      const ground = g.createLinearGradient(0, groundY, 0, r.y + r.h);
      ground.addColorStop(0, colors.top);
      ground.addColorStop(1, colors.bottom);
      g.fillStyle = ground;
      g.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
      g.fillStyle = 'rgba(255,255,255,0.18)';
      g.fillRect(r.x, groundY, r.w, 2);
    }

    function drawTower(): void {
      if (launch.h0 <= 0) return;
      const g = surface.g;
      const x0 = plot.px(0);
      const top = plot.py(launch.h0);
      const bottom = plot.py(0);
      const w = Math.max(16, Math.min(60, (bottom - top) * 0.35));
      const grad = g.createLinearGradient(x0 - w, 0, x0, 0);
      grad.addColorStop(0, '#8a8f98');
      grad.addColorStop(1, '#b9bec6');
      g.fillStyle = grad;
      g.fillRect(x0 - w, top, w, bottom - top);
      g.strokeStyle = 'rgba(0,0,0,0.18)';
      g.lineWidth = 1;
      const rowH = 9;
      for (let y = top + rowH, row = 0; y < bottom; y += rowH, row++) {
        g.beginPath();
        g.moveTo(x0 - w, y);
        g.lineTo(x0, y);
        g.stroke();
        for (let x = x0 - w + (row % 2 ? 8 : 16); x < x0; x += 16) {
          g.beginPath();
          g.moveTo(x, y - rowH);
          g.lineTo(x, y);
          g.stroke();
        }
      }
      g.fillStyle = '#6d727b';
      g.fillRect(x0 - w - 3, top - 4, w + 6, 5);
    }

    function drawBall(x: number, y: number): void {
      const g = surface.g;
      const [px, py] = plot.toPx(x, Math.max(0, y));
      const yy = py - BALL_PX + 1;
      const img = ctx.images.get('ball');
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      if (img) {
        g.translate(px, yy);
        g.rotate(t * 6);
        g.drawImage(img, -BALL_PX, -BALL_PX, BALL_PX * 2, BALL_PX * 2);
      } else {
        const grad = g.createRadialGradient(px - 3, yy - 3, 1, px, yy, BALL_PX);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#c9ced6');
        g.fillStyle = grad;
        g.beginPath();
        g.arc(px, yy, BALL_PX, 0, Math.PI * 2);
        g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = '#2b2f36';
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = t * 6 + (i * 2 * Math.PI) / 5;
          const qx = px + Math.cos(a) * 3.6;
          const qy = yy + Math.sin(a) * 3.6;
          if (i === 0) g.moveTo(qx, qy);
          else g.lineTo(qx, qy);
        }
        g.closePath();
        g.fill();
      }
      g.restore();
    }

    function strobeInterval(): number {
      for (const dt of [0.1, 0.2, 0.25, 0.5, 1, 2]) if (flight.time / dt <= 30) return dt;
      return 5;
    }

    return {
      update(changed, source) {
        compute();
        if (source !== 'sim') {
          if (changed.has('v0') || changed.has('angle') || changed.has('h0') || changed.has('planet') || changed.has('air')) t = 0;
          fitView(true);
        } else fitView(false);
        if (t === 0) ctx.clock.pause();
        updateReadouts();
      },

      action(id) {
        if (id === 'throw') {
          t = 0;
          ctx.clock.play();
        }
      },

      tick(dt) {
        if (t >= flight.time) t = 0;
        t = Math.min(flight.time, t + dt * (p.slow ? 0.25 : 1));
        if (t >= flight.time) ctx.clock.pause();
        updateReadouts();
      },

      resetTime() {
        t = 0;
        updateReadouts();
      },

      render() {
        const theme = ctx.theme;
        const rectKey = `${plot.rect.w}x${plot.rect.h}`;
        if (rectKey !== lastRect) {
          lastRect = rectKey;
          fitView(true);
        }
        const g = plot.begin();
        drawBackground();
        plot.axes();
        drawTower();

        // Vergleichsbahnen
        for (const f of family) {
          plot.polyline(f.points, { color: theme.text, width: 1.5, alpha: 0.35, dash: [4, 4] });
          const last = f.points[f.points.length - 1]!;
          plot.text(last[0], 0, `${f.angle}°`, { color: theme.text, size: 12, offset: [0, -12], weight: '600' });
        }
        // Bahn ohne Luft zum Vergleich
        if (samples) {
          plot.polyline(trajectory(launch, 0), { color: theme.text, width: 1.5, alpha: 0.45, dash: [7, 6] });
          plot.text(vacuum.range, 0, ctx.t('vacuum'), { color: theme.text, size: 12, offset: [0, -14] });
        }
        // vorausberechnete Bahn (dünn) und zurückgelegter Teil (kräftig)
        const full = trajectory(launch, dragK(), 160);
        plot.polyline(full, { color: theme.series[0], width: 1.5, alpha: 0.5, dash: [3, 5] });
        if (t > 0) {
          const n = 120;
          const done: [number, number][] = Array.from({ length: n + 1 }, (_, i) => {
            const s = stateAt((t * i) / n);
            return [s.x, Math.max(0, s.y)];
          });
          plot.polyline(done, { color: theme.series[0], width: 3 });
        }
        // Stroboskop
        if (p.strobe && t > 0) {
          const dt = strobeInterval();
          for (let k = 0; k * dt <= t + 1e-9; k++) {
            const s = stateAt(k * dt);
            plot.point(s.x, Math.max(0, s.y), { color: theme.series[0], radius: 3.5, hollow: true });
          }
        }

        // Höchster Punkt und Wurfweite markieren
        const s = stateAt(t);
        if (t >= flight.apexTime && flight.apexTime > 0) {
          const apex = stateAt(flight.apexTime);
          plot.segment([apex.x, 0], [apex.x, apex.y], { color: theme.series[4], width: 1.5, dash: [5, 4] });
          plot.text(apex.x, apex.y, `${ctx.t('height')}: ${fmt.num(flight.maxHeight, 1)} m`, { color: theme.series[4], size: 13, weight: '600', offset: [0, -16] });
        }
        if (t >= flight.time) {
          plot.segment([0, 0], [flight.range, 0], { color: theme.series[3], width: 4 });
          plot.text(flight.range / 2, 0, `${ctx.t('range')}: ${fmt.num(flight.range, 1)} m`, { color: theme.series[3], size: 14, weight: 'bold', offset: [0, -14] });
        }

        // Abwurfpfeil (vor dem Wurf) bzw. Geschwindigkeitsvektoren
        const k = arrowScale();
        if (t === 0) {
          const a = (launch.angle * Math.PI) / 180;
          const tip: [number, number] = [launch.v0 * k * Math.cos(a), launch.h0 + launch.v0 * k * Math.sin(a)];
          plot.arrow([0, launch.h0], tip, { color: theme.series[3], width: 3.5 });
          plot.segment([0, launch.h0], [Math.max(1, launch.v0 * k), launch.h0], { color: theme.muted, width: 1, dash: [4, 4] });
          const from = Math.min(0, a);
          const to = Math.max(0, a);
          if (Math.abs(a) > 0.01) plot.arcPx(0, launch.h0, 34, from, to, { stroke: theme.series[3], width: 2 });
          plot.text(tip[0], tip[1], `v₀ = ${fmt.num(launch.v0, 1)} m/s`, { color: theme.series[3], size: 13, weight: '600', offset: [10, -12], align: 'left' });
          plot.textPx(plot.px(0) + 40 * Math.cos(a / 2), plot.py(launch.h0) - 40 * Math.sin(a / 2), `α = ${fmt.num(launch.angle, 0)}°`, {
            color: theme.series[3],
            size: 12,
            align: 'left',
          });
        } else if (p.vectors && t < flight.time) {
          const base: [number, number] = [s.x, Math.max(0, s.y)];
          plot.arrow(base, [base[0] + s.vx * k, base[1]], { color: theme.series[0], width: 2.5 });
          plot.arrow(base, [base[0], base[1] + s.vy * k], { color: theme.series[1], width: 2.5 });
          plot.arrow(base, [base[0] + s.vx * k, base[1] + s.vy * k], { color: theme.text, width: 3 });
          plot.text(base[0] + s.vx * k, base[1], 'vₓ', { color: theme.series[0], math: true, size: 14, offset: [10, 12], align: 'left' });
          plot.text(base[0], base[1] + s.vy * k, 'vᵧ', { color: theme.series[1], math: true, size: 14, offset: [-8, 0], align: 'right' });
        }
        drawBall(s.x, s.y);

        // Infokasten oben rechts
        const r = plot.rect;
        const label = `${tr('g', { g: fmt.num(planet().g, 2) })} · t = ${fmt.num(s.t, 2)} s`;
        g.font = `700 13px ${theme.font}`;
        const tw = g.measureText(label).width + 20;
        g.fillStyle = theme.dark ? 'rgba(15,20,30,0.82)' : 'rgba(255,255,255,0.88)';
        roundRect(g, r.x + r.w - tw - 10, r.y + 10, tw, 26, 8);
        g.fill();
        text(g, label, r.x + r.w - tw / 2 - 10, r.y + 23, { font: `700 13px ${theme.font}`, color: theme.text });
        plot.end();
      },

      destroy: () => surface.destroy(),
    };
  },
});
