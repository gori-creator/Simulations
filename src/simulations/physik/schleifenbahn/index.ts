import { defineSimulation, Plot, Surface, subText, withAlpha, type Rect } from '../../../sim-core';
import { earthPos, elongation, geocentric, lonRate, PLANETS, planetPos, T_ALIGN } from './model';

const L = (de: string, en: string) => ({ de, en });
/** Halbe Breite des Himmelsausschnitts in Grad. */
const HALF = 40;
const LAT = 9;

function split(w: number, h: number): { scene: Rect; chart: Rect } {
  if (w >= 700) {
    const sw = Math.round(w * 0.45);
    return { scene: { x: 0, y: 0, w: sw, h }, chart: { x: sw, y: 0, w: w - sw, h } };
  }
  const sh = Math.round(h * 0.52);
  return { scene: { x: 0, y: 0, w, h: sh }, chart: { x: 0, y: sh, w, h: h - sh } };
}

function hash(i: number): number {
  const v = Math.sin(i * 51.73 + 3.1) * 43758.5453;
  return v - Math.floor(v);
}

/** Feste Hintergrundsterne in ekliptikalen Koordinaten. */
const STARS: [number, number, number][] = Array.from({ length: 260 }, (_, i) => [hash(i) * 360, (hash(i + 500) - 0.5) * 2 * LAT, 1 + 2 * hash(i + 900)]);

const wrap180 = (d: number) => ((((d + 180) % 360) + 360) % 360) - 180;

/**
 * Schleifenbahnen: Draufsicht auf Sonne, Erde und Planet; daneben der
 * Himmelsausschnitt, in dem der Planet vor den Sternen eine Schleife zieht.
 */
export default defineSimulation({
  id: 'schleifenbahn',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 1.05 },
  params: [
    {
      key: 'planet',
      type: 'choice',
      label: L('Planet', 'Planet'),
      options: [
        { value: 'venus', label: L('Venus', 'Venus') },
        { value: 'mars', label: L('Mars', 'Mars') },
        { value: 'jupiter', label: L('Jupiter', 'Jupiter') },
        { value: 'saturn', label: L('Saturn', 'Saturn') },
      ],
      default: 'mars',
      display: 'buttons',
    },
    {
      key: 'tempo',
      type: 'choice',
      label: L('Tempo', 'Speed'),
      options: [
        { value: '0.1', label: L('langsam', 'slow') },
        { value: '0.25', label: L('mittel', 'medium') },
        { value: '0.5', label: L('schnell', 'fast') },
      ],
      default: '0.25',
      display: 'buttons',
    },
  ],
  hint: L(
    'Drücke Start: Wenn die Erde den Planeten auf der Innenbahn überholt, scheint er vor den Sternen rückwärts zu laufen.',
    'Press play: when Earth overtakes the planet on the inside track, it seems to move backwards against the stars.',
  ),
  readouts: [
    { key: 't', label: L('Zeit', 'Time') },
    { key: 'dir', label: L('Bewegung am Himmel', 'Motion in the sky'), spoiler: true },
    { key: 'vis', label: L('Sichtbarkeit', 'Visibility'), spoiler: true },
  ],
  presets: [
    { id: 'mars', label: L('Mars', 'Mars'), values: { planet: 'mars' } },
    { id: 'jupiter', label: L('Jupiter', 'Jupiter'), values: { planet: 'jupiter' } },
    { id: 'venus', label: L('Venus', 'Venus'), values: { planet: 'venus' } },
  ],
  strings: {
    de: {
      canvas: 'Links Draufsicht auf die Bahnen von Erde und Planet um die Sonne mit der Blickrichtung von der Erde zum Planeten; rechts der Sternhimmel, vor dem der Planet eine Schleife zieht',
      tVal: 't ≈ {t} Jahre ({m} Monate)',
      pro: 'rechtläufig (vorwärts, {r}° pro Tag)',
      retro: 'rückläufig (rückwärts, {r}° pro Tag)',
      near: 'nahe der Sonne ({e}°) – nicht zu sehen',
      opp: 'Opposition ({e}°) – die ganze Nacht sichtbar',
      evening: '{e}° östlich der Sonne – am Abendhimmel',
      morning: '{e}° westlich der Sonne – am Morgenhimmel',
      sun: 'Sonne',
      earth: 'Erde',
      lonAx: 'ekliptikale Länge in °',
      latAx: 'Breite in ° (überhöht)',
      sight: 'Blickrichtung',
      venus: 'Venus',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturn',
    },
    en: {
      canvas: 'Left: top view of the orbits of Earth and the planet around the Sun with the line of sight from Earth to the planet; right: the starry sky in front of which the planet traces a loop',
      tVal: 't ≈ {t} years ({m} months)',
      pro: 'prograde (forwards, {r}° per day)',
      retro: 'retrograde (backwards, {r}° per day)',
      near: 'close to the Sun ({e}°) – not visible',
      opp: 'opposition ({e}°) – visible all night',
      evening: '{e}° east of the Sun – in the evening sky',
      morning: '{e}° west of the Sun – in the morning sky',
      sun: 'Sun',
      earth: 'Earth',
      lonAx: 'ecliptic longitude in °',
      latAx: 'latitude in ° (exaggerated)',
      sight: 'line of sight',
      venus: 'Venus',
      mars: 'Mars',
      jupiter: 'Jupiter',
      saturn: 'Saturn',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const plot = new Plot(surface, {
      x: [0, 80],
      y: [-LAT, LAT],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const r = split(w, h).chart;
        return { x: r.x + 6, y: r.y + 6, w: r.w - 12, h: r.h - 12 };
      },
    });

    const planet = () => PLANETS[p.planet]!;
    /** Start kurz vor der Opposition bzw. unteren Konjunktion. */
    const t0 = () => T_ALIGN - Math.min(0.3, planet().T * 0.15);
    let t = t0();

    function updateReadouts(): void {
      const pl = planet();
      ctx.readout('t', tr('tVal', { t: fmt.num(t - t0(), 2), m: fmt.num((t - t0()) * 12, 1) }));
      const rate = lonRate(pl, t) / 365.25;
      ctx.readout('dir', tr(rate < 0 ? 'retro' : 'pro', { r: fmt.num(Math.abs(rate), 2) }));
      const e = elongation(pl, t);
      const sunLon = geocentric({ id: 'x', a: 0, T: 1, inc: 0 }, t).lon;
      const east = wrap180(geocentric(pl, t).lon - sunLon) > 0;
      const key = e < 15 ? 'near' : e > 150 ? 'opp' : east ? 'evening' : 'morning';
      ctx.readout('vis', tr(key, { e: fmt.num(e, 0) }));
    }

    function drawOrbits(r: Rect): void {
      const g = surface.g;
      const th = ctx.theme;
      const pl = planet();
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const R = Math.min(r.w, r.h) / 2 - 22;
      const rMax = Math.max(pl.a, 1);
      const s = R / rMax;
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      // Sternring
      g.fillStyle = withAlpha(th.muted, 0.7);
      for (let i = 0; i < 90; i++) {
        const a = (i / 90) * 2 * Math.PI + hash(i) * 0.05;
        const rr = R + 10 + hash(i + 7) * 8;
        g.beginPath();
        g.arc(cx + rr * Math.cos(a), cy - rr * Math.sin(a), 1 + hash(i + 3), 0, Math.PI * 2);
        g.fill();
      }
      // Bahnen
      g.strokeStyle = withAlpha(th.muted, 0.6);
      g.lineWidth = 1;
      for (const a of [1, pl.a]) {
        g.beginPath();
        g.arc(cx, cy, a * s, 0, Math.PI * 2);
        g.stroke();
      }
      const e = earthPos(t);
      const q = planetPos(pl, t);
      const E: [number, number] = [cx + e[0] * s, cy - e[1] * s];
      const Q: [number, number] = [cx + q[0] * s, cy - q[1] * s];
      // Blickrichtung Erde → Planet bis zum Sternring
      const dx = Q[0] - E[0];
      const dy = Q[1] - E[1];
      const len = Math.hypot(dx, dy) || 1;
      const reach = 2 * (R + 20);
      g.strokeStyle = withAlpha(th.series[1]!, 0.7);
      g.setLineDash([6, 4]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(E[0], E[1]);
      g.lineTo(E[0] + (dx / len) * reach, E[1] + (dy / len) * reach);
      g.stroke();
      g.setLineDash([]);
      // Sonne, Erde, Planet
      g.fillStyle = th.series[3]!;
      g.beginPath();
      g.arc(cx, cy, 9, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = th.series[0]!;
      g.beginPath();
      g.arc(E[0], E[1], 6, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = th.series[1]!;
      g.beginPath();
      g.arc(Q[0], Q[1], 6, 0, Math.PI * 2);
      g.fill();
      const lab = (str: string, x: number, y: number, color: string) => subText(g, str, x + 10, y - 10, { size: 12, family: th.font, weight: 700, color, align: 'left', halo: th.bg });
      subText(g, ctx.t('sun'), cx, cy + 22, { size: 12, family: th.font, weight: 700, color: th.series[3]!, halo: th.bg });
      lab(ctx.t('earth'), E[0], E[1], th.series[0]!);
      lab(ctx.t(pl.id), Q[0], Q[1], th.series[1]!);
      g.restore();
    }

    function drawSky(): void {
      const th = ctx.theme;
      const pl = planet();
      const c = geocentric(pl, t);
      const lc = c.lon;
      plot.setRangePadded([lc - HALF, lc + HALF], [-LAT, LAT], { left: 34, right: 12, top: 22, bottom: 24 });
      plot.begin();
      for (const [lon, lat, sz] of STARS) {
        const x = lc + wrap180(lon - lc);
        if (Math.abs(x - lc) <= HALF) plot.point(x, lat, { color: withAlpha(th.muted, 0.7), radius: sz });
      }
      plot.hline(0, { color: withAlpha(th.series[3]!, 0.5), dash: [5, 4], width: 1 });
      const span = Math.min(0.7, pl.T * 0.35);
      const past: [number, number][] = [];
      const future: [number, number][] = [];
      for (let k = -60; k <= 60; k++) {
        const tt = t + (k / 60) * span;
        const g2 = geocentric(pl, tt);
        const pt: [number, number] = [lc + wrap180(g2.lon - lc), g2.lat];
        if (k <= 0) past.push(pt);
        if (k >= 0) future.push(pt);
      }
      plot.polyline(future, { color: withAlpha(th.series[1]!, 0.35), width: 1.5, dash: [4, 4] });
      plot.polyline(past, { color: th.series[1]!, width: 2.5 });
      plot.point(lc, c.lat, { color: th.series[1]!, radius: 6 });
      plot.text(lc, c.lat, ctx.t(pl.id), { color: th.series[1]!, align: 'left', offset: [10, -10], size: 12, weight: 'bold' });
      plot.end();
    }

    return {
      update(changed, source) {
        if (source === 'init' || changed.has('planet')) t = t0();
        plot.setAxes({ x: { label: ctx.t('lonAx'), format: (v) => fmt.num(((v % 360) + 360) % 360, 0) }, y: { label: ctx.t('latAx') } });
        updateReadouts();
      },
      tick(dt) {
        t += Math.min(dt, 0.05) * Number(p.tempo) * (p.planet === 'saturn' ? 2 : p.planet === 'jupiter' ? 1.5 : 1);
        updateReadouts();
      },
      resetTime() {
        t = t0();
        updateReadouts();
      },
      render() {
        surface.begin();
        const sp = split(surface.width, surface.height);
        plot.resize();
        drawOrbits(sp.scene);
        drawSky();
      },
      destroy: () => surface.destroy(),
    };
  },
});
