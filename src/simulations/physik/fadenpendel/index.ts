import { defineSimulation, FixedStepper, Plot, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import { energies, exactPeriod, smallAnglePeriod, step } from './model';

const L = (de: string, en: string) => ({ de, en });
const PLANETS = { erde: 9.81, mond: 1.62, mars: 3.71, jupiter: 24.79 } as const;
type PlanetId = keyof typeof PLANETS;
const WINDOW = 10;

function layout(w: number, h: number): { pendulum: Rect; chart: Rect; energy: Rect } {
  if (w >= 700) {
    const pw = Math.min(w * 0.46, h * 1.05);
    return {
      pendulum: { x: 0, y: 0, w: pw, h },
      chart: { x: pw + 12, y: 10, w: w - pw - 22, h: h * 0.62 - 10 },
      energy: { x: pw + 12, y: h * 0.62 + 10, w: w - pw - 22, h: h * 0.38 - 20 },
    };
  }
  const ph = h * 0.5;
  return {
    pendulum: { x: 0, y: 0, w, h: ph },
    chart: { x: 6, y: ph + 6, w: w - 12, h: h * 0.3 - 6 },
    energy: { x: 6, y: ph + h * 0.3 + 6, w: w - 12, h: h * 0.2 - 12 },
  };
}

/**
 * Fadenpendel: Auslenken, loslassen, beobachten. Exakte Bewegung (auch bei
 * großen Winkeln) im Vergleich zur Kleinwinkelnäherung, Energieumwandlung,
 * Dämpfung und gemessene Periodendauer.
 */
export default defineSimulation({
  id: 'fadenpendel',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.75, aspectNarrow: 0.62 },
  groups: [
    { id: 'world', label: L('Ort und Reibung', 'Location and friction') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    { key: 'l', type: 'number', label: L('Pendellänge l', 'Length l'), min: 0.2, max: 2.5, step: 0.05, default: 1, unit: 'm' },
    { key: 'amp', type: 'number', label: L('Auslenkung beim Loslassen φ₀', 'Release angle φ₀'), min: -170, max: 170, step: 1, default: 20, unit: '°' },
    { key: 'm', type: 'number', label: L('Masse m', 'Mass m'), min: 0.1, max: 2, step: 0.1, default: 0.5, unit: 'kg' },
    {
      key: 'planet',
      type: 'choice',
      group: 'world',
      label: L('Ort', 'Location'),
      options: [
        { value: 'erde', label: L('Erde', 'Earth') },
        { value: 'mond', label: L('Mond', 'Moon') },
        { value: 'mars', label: L('Mars', 'Mars') },
        { value: 'jupiter', label: L('Jupiter', 'Jupiter') },
      ],
      default: 'erde',
    },
    { key: 'damping', type: 'number', group: 'world', label: L('Dämpfung γ', 'Damping γ'), min: 0, max: 0.5, step: 0.01, default: 0, unit: '1/s' },
    { key: 'compare', type: 'boolean', group: 'view', label: L('Vergleich: Kleinwinkelnäherung', 'Compare: small-angle approximation'), default: false },
    { key: 'energy', type: 'boolean', group: 'view', label: L('Energien anzeigen', 'Show energies'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [{ id: 'release', label: L('Loslassen', 'Release'), primary: true }],
  images: { bob: 'pendelkugel.webp' },
  readouts: [
    { key: 'formula', label: L('Periodendauer (Kleinwinkelnäherung)', 'Period (small-angle approximation)') },
    { key: 'exact', label: L('Periodendauer bei φ₀ (exakt)', 'Period at φ₀ (exact)'), spoiler: true },
    { key: 'measured', label: L('Gemessene Periodendauer', 'Measured period') },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Kleine Auslenkung', 'Small amplitude'), values: {} },
    { id: 'large', label: L('Große Auslenkung im Vergleich', 'Large amplitude compared'), values: { amp: 120, compare: true } },
    { id: 'long', label: L('Langes Pendel (2 m)', 'Long pendulum (2 m)'), values: { l: 2 } },
    { id: 'moon', label: L('Auf dem Mond', 'On the Moon'), values: { planet: 'mond' } },
    { id: 'damped', label: L('Gedämpft', 'Damped'), values: { amp: 40, damping: 0.25 } },
  ],
  strings: {
    de: {
      canvas: 'Fadenpendel mit Diagramm der Auslenkung über der Zeit und Energiebalken',
      chart: 'φ in °',
      time: 't in s',
      pot: 'Lageenergie',
      kin: 'Bewegungsenergie',
      loss: 'innere Energie',
      approx: 'Näherung',
      measuring: 'wird gemessen …',
      ruler: '{l} m',
      exactText: '{t} s ({d} % länger als die Näherung)',
    },
    en: {
      canvas: 'Simple pendulum with a chart of the angle over time and energy bars',
      chart: 'φ in °',
      time: 't in s',
      pot: 'Potential energy',
      kin: 'Kinetic energy',
      loss: 'Internal energy',
      approx: 'approximation',
      measuring: 'measuring …',
      ruler: '{l} m',
      exactText: '{t} s ({d} % longer than the approximation)',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const g = () => PLANETS[p.planet as PlanetId];
    const rad = (deg: number) => (deg * Math.PI) / 180;
    const deg = (r: number) => (r * 180) / Math.PI;

    const scene = new Plot(surface, {
      x: [-1.5, 1.5],
      y: [-1.3, 0.3],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = layout(w, h).pendulum;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });
    const chart = new Plot(surface, {
      x: [0, WINDOW],
      y: [-30, 30],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => layout(w, h).chart,
      xAxis: { label: ctx.t('time'), minStep: 1 },
      yAxis: { label: ctx.t('chart') },
    });

    let state: [number, number] = [rad(p.amp), 0];
    let ghost: [number, number] = [rad(p.amp), 0];
    let t = 0;
    let history: [number, number, number][] = [];
    let crossings: number[] = [];
    const stepper = new FixedStepper(0.0005);
    let dragging = false;

    function restart(): void {
      state = [rad(p.amp), 0];
      ghost = [rad(p.amp), 0];
      t = 0;
      history = [[0, p.amp, p.amp]];
      crossings = [];
      stepper.reset();
    }

    function fitScene(): void {
      const a = Math.min(Math.PI, Math.abs(rad(p.amp)));
      const up = Math.max(0, -Math.cos(a)) * p.l;
      const side = Math.max(Math.sin(Math.min(a, Math.PI / 2)) * p.l, 0.35 * p.l);
      scene.setRange([-(side + 0.25 * p.l), side + 0.25 * p.l], [-(p.l * 1.18 + 0.08), up + 0.12 * p.l + 0.1]);
    }

    function updateReadouts(): void {
      const t0 = smallAnglePeriod(p.l, g());
      const te = exactPeriod(p.l, g(), rad(p.amp));
      ctx.readout('formula', { html: `<var>T</var>₀ = 2π · √(<var>l</var>/<var>g</var>) ≈ <strong>${fmt.num(t0, 3)} s</strong>` });
      ctx.readout('exact', ctx.t('exactText').replace('{t}', fmt.num(te, 3)).replace('{d}', fmt.num((te / t0 - 1) * 100, 1)));
      if (crossings.length >= 2) {
        const periods = crossings.slice(1).map((c, i) => c - crossings[i]!);
        const last = periods[periods.length - 1]!;
        ctx.readout('measured', `${fmt.num(last, 3)} s`);
      } else ctx.readout('measured', ctx.t('measuring'));
      const e = energies(state, p.l, g(), p.m);
      ctx.readout(
        'now',
        `φ = ${fmt.num(deg(state[0]), 1)}° · v = ${fmt.num(Math.abs(state[1] * p.l), 2)} m/s · E_pot = ${fmt.num(e.pot, 3)} J · E_kin = ${fmt.num(e.kin, 3)} J`,
      );
    }

    // Pendelkörper ziehen: neue Anfangsauslenkung
    scene.addHandle({
      get: () => [p.l * Math.sin(state[0]), -p.l * Math.cos(state[0])],
      set: (x, y) => {
        dragging = true;
        ctx.clock.pause();
        const angle = Math.round(deg(Math.atan2(x, -y)));
        ctx.set({ amp: Math.max(-170, Math.min(170, angle)) });
      },
      enabled: () => !ctx.locked,
      color: () => ctx.theme.series[3]!,
    });

    /* ---------- Zeichnen ---------- */
    function drawScene(): void {
      const gx = scene.begin();
      const theme = ctx.theme;
      const r = scene.rect;
      // Decke mit Schraffur
      const [px, py] = scene.toPx(0, 0);
      gx.fillStyle = theme.dark ? '#3a4150' : '#c5cbd4';
      gx.fillRect(px - 70, py - 14, 140, 14);
      gx.strokeStyle = theme.muted;
      gx.lineWidth = 1;
      for (let x = px - 70; x < px + 70; x += 9) {
        gx.beginPath();
        gx.moveTo(x, py - 14);
        gx.lineTo(x + 9, py);
        gx.stroke();
      }
      // Bahn des Pendelkörpers (Kreisbogen)
      const a0 = Math.abs(rad(p.amp));
      scene.arc(0, 0, p.l, -Math.PI / 2 - a0, -Math.PI / 2 + a0, { stroke: theme.muted, width: 1.5, dash: [4, 5] });
      // Lot
      scene.segment([0, 0], [0, -p.l * 1.1], { color: theme.muted, width: 1, dash: [3, 4] });
      // Maßstab
      const rx = -(scene.bounds.xMax - scene.bounds.xMin) * 0.42;
      scene.segment([rx, 0], [rx, -p.l], { color: theme.muted, width: 2 });
      scene.segment([rx - 0.03 * p.l, 0], [rx + 0.03 * p.l, 0], { color: theme.muted, width: 2 });
      scene.segment([rx - 0.03 * p.l, -p.l], [rx + 0.03 * p.l, -p.l], { color: theme.muted, width: 2 });
      scene.text(rx, -p.l / 2, `l = ${fmt.num(p.l, 2)} m`, { color: theme.muted, size: 13, align: 'right', offset: [-8, 0] });

      const bobPx = 10 + 7 * Math.cbrt(p.m);
      const drawBob = (angle: number, alpha: number, color: string) => {
        const x = p.l * Math.sin(angle);
        const y = -p.l * Math.cos(angle);
        scene.segment([0, 0], [x, y], { color: theme.text, width: 1.6, alpha });
        const [bx, by] = scene.toPx(x, y);
        const img = ctx.images.get('bob');
        gx.save();
        gx.globalAlpha = alpha;
        gx.shadowColor = 'rgba(0,0,0,0.35)';
        gx.shadowBlur = 8;
        gx.shadowOffsetY = 3;
        if (img && alpha > 0.9) {
          gx.drawImage(img, bx - bobPx, by - bobPx, bobPx * 2, bobPx * 2);
        } else {
          const grad = gx.createRadialGradient(bx - bobPx * 0.35, by - bobPx * 0.35, 1, bx, by, bobPx);
          grad.addColorStop(0, '#fff6d6');
          grad.addColorStop(0.45, color);
          grad.addColorStop(1, withAlpha('#5a4210', 1));
          gx.fillStyle = grad;
          gx.beginPath();
          gx.arc(bx, by, bobPx, 0, Math.PI * 2);
          gx.fill();
        }
        gx.restore();
      };
      if (p.compare) drawBob(ghost[0], 0.4, theme.series[4]!);
      drawBob(state[0], 1, '#d9a93f');
      // Winkel
      const ang = state[0];
      if (Math.abs(ang) > 0.02) {
        const from = -Math.PI / 2;
        scene.arcPx(0, 0, 46, Math.min(from, from + ang), Math.max(from, from + ang), { stroke: theme.series[3], width: 2, fill: theme.series[3], alpha: 0.15, sector: true });
        scene.textPx(px + 62 * Math.sin(ang / 2), py + 62 * Math.cos(ang / 2), `φ = ${fmt.num(deg(ang), 0)}°`, { color: theme.series[3], size: 13, weight: '600' });
      }
      // Pfeil für die Geschwindigkeit
      if (Math.abs(state[1]) > 0.02 && !dragging) {
        const x = p.l * Math.sin(ang);
        const y = -p.l * Math.cos(ang);
        const v = state[1] * p.l;
        const k = 0.12;
        scene.arrow([x, y], [x + v * k * Math.cos(ang), y + v * k * Math.sin(ang)], { color: theme.series[0], width: 2.5 });
      }
      // Ortsangabe
      text(gx, `g = ${fmt.num(g(), 2)} m/s²`, r.x + r.w - 10, r.y + r.h - 14, { font: `600 12px ${theme.font}`, color: theme.muted, align: 'right' });
      scene.end();
    }

    function drawChart(): void {
      const theme = ctx.theme;
      const range = Math.max(5, Math.abs(p.amp) * 1.12);
      const x0 = Math.max(0, t - WINDOW);
      chart.setRangePadded([x0, x0 + WINDOW], [-range, range], { left: 46, right: 14, top: 18, bottom: 8 });
      chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      if (history.length > 1) {
        if (p.compare) chart.polyline(history.map(([tt, , gh]) => [tt, gh]), { color: theme.series[4], width: 2, alpha: 0.6, dash: [6, 4] });
        chart.polyline(history.map(([tt, a]) => [tt, a]), { color: theme.series[3], width: 2.5 });
      }
      for (const c of crossings) chart.vline(c, { color: theme.muted, width: 1, dash: [2, 4], alpha: 0.7 });
      chart.end();
    }

    function drawEnergy(r: Rect): void {
      if (!p.energy) return;
      const gx = surface.g;
      const theme = ctx.theme;
      const e = energies(state, p.l, g(), p.m);
      const e0 = energies([rad(p.amp), 0], p.l, g(), p.m).pot || 1;
      const loss = Math.max(0, e0 - e.pot - e.kin);
      const rows: [string, number, string][] = [
        [ctx.t('pot'), e.pot, theme.series[0]!],
        [ctx.t('kin'), e.kin, theme.series[1]!],
      ];
      if (p.damping > 0) rows.push([ctx.t('loss'), loss, theme.series[3]!]);
      const labelW = Math.min(170, r.w * 0.38);
      const rowH = Math.min(26, (r.h - 4) / rows.length);
      rows.forEach(([label, value, color], i) => {
        const y = r.y + i * rowH;
        text(gx, label, r.x + labelW - 8, y + rowH / 2, { font: `600 12px ${theme.font}`, color: theme.muted, align: 'right' });
        const bw = r.w - labelW - 70;
        gx.fillStyle = withAlpha(theme.muted, 0.15);
        roundRect(gx, r.x + labelW, y + 4, bw, rowH - 8, 4);
        gx.fill();
        gx.fillStyle = color;
        roundRect(gx, r.x + labelW, y + 4, Math.max(0, (bw * value) / e0), rowH - 8, 4);
        gx.fill();
        text(gx, `${fmt.num(value, 3)} J`, r.x + labelW + bw + 6, y + rowH / 2, { font: `600 12px ${theme.font}`, color: theme.text, align: 'left' });
      });
    }

    /** Kleinwinkelnäherung: lineare Differentialgleichung φ'' = −(g/l)·φ − γ·φ'. */
    function stepLinear(s: [number, number], h: number): [number, number] {
      const k = g() / p.l;
      const f = (y: readonly [number, number]): [number, number] => [y[1], -k * y[0] - p.damping * y[1]];
      const k1 = f(s);
      const k2 = f([s[0] + (h / 2) * k1[0], s[1] + (h / 2) * k1[1]]);
      const k3 = f([s[0] + (h / 2) * k2[0], s[1] + (h / 2) * k2[1]]);
      const k4 = f([s[0] + h * k3[0], s[1] + h * k3[1]]);
      return [s[0] + (h / 6) * (k1[0] + 2 * k2[0] + 2 * k3[0] + k4[0]), s[1] + (h / 6) * (k1[1] + 2 * k2[1] + 2 * k3[1] + k4[1])];
    }

    restart();

    return {
      update(changed, source) {
        if (changed.has('amp') || changed.has('l') || changed.has('planet') || source === 'replace' || source === 'init') {
          restart();
          if (source !== 'sim') dragging = false;
        }
        if (changed.has('amp') || changed.has('l') || source !== 'sim') fitScene();
        updateReadouts();
      },

      action(id) {
        if (id === 'release') {
          dragging = false;
          restart();
          ctx.clock.play();
        }
      },

      tick(dt) {
        dragging = false;
        const speed = p.slow ? 0.25 : 1;
        stepper.run(dt * speed, (h) => {
          const before = state[0];
          state = step(state, p.l, g(), p.damping, h);
          ghost = stepLinear(ghost, h);
          t += h;
          // Nulldurchgang von + nach − (eine volle Periode zwischen zwei solchen)
          if (before > 0 && state[0] <= 0) crossings.push(t - (h * state[0]) / (state[0] - before));
        });
        if (crossings.length > 12) crossings = crossings.slice(-12);
        history.push([t, deg(state[0]), deg(ghost[0])]);
        const cut = t - WINDOW - 1;
        if (history.length > 2000 || (history[0] && history[0][0] < cut)) history = history.filter(([tt]) => tt >= cut);
        updateReadouts();
      },

      resetTime() {
        restart();
        updateReadouts();
      },

      render() {
        const r = layout(surface.width, surface.height);
        surface.begin();
        drawScene();
        drawChart();
        drawEnergy(r.energy);
      },

      destroy: () => surface.destroy(),
    };
  },
});
