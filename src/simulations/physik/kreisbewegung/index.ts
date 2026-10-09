import { defineSimulation, ease, Plot, roundRect, shade, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  breakingPeriod,
  breakingSpeed,
  centripetalAcceleration,
  centripetalForce,
  freeFlight,
  G,
  maxCornerSpeed,
  maxFriction,
  minRadius,
  onCircle,
  period,
  ROADS,
  slidePosition,
  speed,
  tangentVelocity,
  type RoadId,
  type Vec,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'string' | 'car';

/** Halbe Breite des sichtbaren Bereichs (Schnur: in m; Auto: in Vielfachen von r). */
const VIEW_STRING = 1.75;
const VIEW_CAR = 1.75;
/** Halbe Fahrbahnbreite in Vielfachen von r (nicht maßstäblich). */
const ROAD = 0.13;
/** Startwinkel: unten, Bewegung gegen den Uhrzeigersinn. */
const PHI0 = -Math.PI / 2;
const ROAD_ORDER: RoadId[] = ['dry', 'wet', 'snow', 'ice'];

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Aufrunden auf 1, 2, 2,5 oder 5 · 10^k. */
function niceCeil(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= x - 1e-12) return m * p;
  return 10 * p;
}

/** Bühne: links die Draufsicht, rechts Kraftvergleich und Diagramm (Handy: untereinander). */
function regions(w: number, h: number): { scene: Rect; gauge: Rect; chart: Rect } {
  if (w >= 640) {
    const sw = Math.round(w * 0.56);
    const x = sw + 10;
    const cw = w - x;
    const gh = 100;
    return { scene: { x: 0, y: 0, w: sw, h }, gauge: { x, y: 0, w: cw, h: gh }, chart: { x, y: gh + 10, w: cw, h: h - gh - 10 } };
  }
  const sh = Math.round(h * 0.5);
  const gh = 92;
  return { scene: { x: 0, y: 0, w, h: sh }, gauge: { x: 0, y: sh + 8, w, h: gh }, chart: { x: 0, y: sh + gh + 16, w, h: h - sh - gh - 16 } };
}

/**
 * Kreisbewegung und Zentripetalkraft: Kugel an einer Schnur auf einem glatten
 * Tisch (Draufsicht) oder Auto in einer Kreiskurve. Geschwindigkeit,
 * Zentripetalkraft, Diagramm F_Z(v) bzw. F_Z(r); die Schnur kann reißen, das
 * Auto kann aus der Kurve rutschen.
 */
export default defineSimulation({
  id: 'kreisbewegung',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.52 },
  groups: [
    { id: 'body', label: L('Körper und Bahn', 'Body and path') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'string', label: L('Kugel an der Schnur', 'Ball on a string') },
        { value: 'car', label: L('Auto in der Kurve', 'Car in a bend') },
      ],
      default: 'string',
    },
    { key: 'r', type: 'number', group: 'body', label: L('Radius r', 'Radius r'), min: 0.2, max: 1.5, step: 0.05, default: 0.8, unit: 'm', visibleIf: (v) => v.mode === 'string' },
    {
      key: 'T',
      type: 'number',
      group: 'body',
      label: L('Umlaufdauer T', 'Period T'),
      help: L('Zeit für einen Umlauf; die Frequenz ist f = 1/T.', 'Time for one revolution; the frequency is f = 1/T.'),
      min: 0.2,
      max: 3,
      step: 0.05,
      default: 1.2,
      unit: 's',
      visibleIf: (v) => v.mode === 'string',
    },
    { key: 'm', type: 'number', group: 'body', label: L('Masse m', 'Mass m'), min: 0.05, max: 1, step: 0.05, default: 0.2, unit: 'kg', visibleIf: (v) => v.mode === 'string' },
    {
      key: 'Fr',
      type: 'number',
      group: 'body',
      label: L('Reißkraft der Schnur', 'Breaking force of the string'),
      help: L('Braucht die Kugel eine größere Zentripetalkraft, reißt die Schnur.', 'If the ball needs a larger centripetal force, the string breaks.'),
      min: 5,
      max: 100,
      step: 5,
      default: 30,
      unit: 'N',
      visibleIf: (v) => v.mode === 'string',
    },
    { key: 'rc', type: 'number', group: 'body', label: L('Kurvenradius r', 'Radius of the bend r'), min: 10, max: 200, step: 5, default: 50, unit: 'm', visibleIf: (v) => v.mode === 'car' },
    {
      key: 'vc',
      type: 'number',
      group: 'body',
      label: L('Geschwindigkeit v', 'Speed v'),
      help: L('10 m/s = 36 km/h; 1 m/s = 3,6 km/h.', '10 m/s = 36 km/h; 1 m/s = 3.6 km/h.'),
      min: 2,
      max: 40,
      step: 0.5,
      default: 15,
      unit: 'm/s',
      visibleIf: (v) => v.mode === 'car',
    },
    { key: 'mc', type: 'number', group: 'body', label: L('Masse des Autos m', 'Mass of the car m'), min: 800, max: 2500, step: 50, default: 1200, unit: 'kg', visibleIf: (v) => v.mode === 'car' },
    {
      key: 'road',
      type: 'choice',
      group: 'body',
      label: L('Fahrbahn (Haftreibungszahl μ)', 'Road (coefficient of static friction μ)'),
      options: [
        { value: 'dry', label: L('trocken (0,8)', 'dry (0.8)') },
        { value: 'wet', label: L('nass (0,5)', 'wet (0.5)') },
        { value: 'snow', label: L('Schnee (0,2)', 'snow (0.2)') },
        { value: 'ice', label: L('Eis (0,1)', 'ice (0.1)') },
      ],
      default: 'dry',
      visibleIf: (v) => v.mode === 'car',
    },
    {
      key: 'chart',
      type: 'choice',
      group: 'view',
      label: L('Diagramm', 'Graph'),
      options: [
        { value: 'v', label: L('Kraft über Geschwindigkeit', 'force against speed') },
        { value: 'r', label: L('Kraft über Radius', 'force against radius') },
      ],
      default: 'v',
    },
    {
      key: 'vec',
      type: 'choice',
      group: 'view',
      label: L('Pfeile', 'Arrows'),
      options: [
        { value: 'F', label: L('v und Kraft', 'v and force') },
        { value: 'a', label: L('v und Beschleunigung', 'v and acceleration') },
        { value: 'off', label: L('keine', 'none') },
      ],
      default: 'F',
    },
    { key: 'trace', type: 'boolean', group: 'view', label: L('Positionen in gleichen Zeitabständen', 'Positions at equal time intervals'), default: false },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'go', label: L('Start', 'Start'), primary: true },
    { id: 'cut', label: L('Schnur durchschneiden', 'Cut the string'), visibleIf: (v) => v.mode === 'string' },
  ],
  readouts: [
    { key: 'motion', label: L('Bewegung', 'Motion') },
    { key: 'az', label: L('Zentripetalbeschleunigung', 'Centripetal acceleration'), spoiler: true },
    { key: 'fz', label: L('Zentripetalkraft', 'Centripetal force'), spoiler: true },
    { key: 'limit', label: L('Grenze', 'Limit'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Kugel an der Schnur', 'Ball on a string'), values: {} },
    { id: 'double', label: L('Halbe Umlaufdauer', 'Half the period'), values: { T: 0.6 } },
    { id: 'break', label: L('Zu schnell: Schnur reißt', 'Too fast: the string breaks'), values: { T: 0.4 } },
    { id: 'car', label: L('Kurvenfahrt auf trockener Straße', 'Cornering on a dry road'), values: { mode: 'car' } },
    { id: 'wet', label: L('Nasse Fahrbahn: rutscht', 'Wet road: skids'), values: { mode: 'car', road: 'wet', vc: 18 } },
    { id: 'ice', label: L('Glatteis', 'Black ice'), values: { mode: 'car', road: 'ice', vc: 10, chart: 'r' } },
  ],
  strings: {
    de: {
      canvas: 'Draufsicht einer Kreisbewegung mit Geschwindigkeits- und Kraftpfeil, daneben ein Kraftvergleich und ein Diagramm der Zentripetalkraft',
      axisV: 'v in m/s',
      axisR: 'r in m',
      axisN: 'F in N',
      axisKN: 'F in kN',
      titleV: 'Zentripetalkraft F_[Z] über v',
      titleR: 'Zentripetalkraft F_[Z] über r',
      gaugeTitle: 'Zentripetalkraft F_[Z]',
      need: 'nötig: F_[Z] = m · v² / r = {f}',
      limitString: 'Die Schnur hält höchstens {f} aus (Reißkraft).',
      limitCar: 'Haftreibung höchstens μ · m · g = {f}',
      cut: 'Schnur gerissen',
      noForce: 'keine Kraft mehr: F_[Z] = 0',
      holds: 'Schnur hält',
      breaks: 'Schnur reißt!',
      grips: 'Auto hält die Spur',
      skids: 'Auto rutscht!',
      broken: 'Schnur gerissen: Die Kugel fliegt geradeaus weiter.',
      brokenShort: 'Kugel fliegt geradeaus weiter',
      offRoad: 'Das Auto rutscht aus der Kurve!',
      offRoadShort: 'Auto rutscht aus der Kurve!',
      fixT: 'T fest',
      fixV: 'v fest',
      breakLine: 'Reißkraft',
      slip: 'rutscht',
      laps: 'Umläufe: {n}',
      dry: 'trocken',
      wet: 'nass',
      snow: 'Schnee',
      ice: 'Eis',
      grid: 'Raster 10 cm',
      notToScale: 'nicht maßstäblich',
      motionString: 'v = 2π · r / T = 2π · {r} m / {T} s ≈ <strong>{v} m/s</strong><br>f = 1/T ≈ {f} Hz · ω = 2π/T ≈ {w} 1/s',
      motionCar: 'v = <strong>{v} m/s</strong> = {kmh} km/h<br>T = 2π · r / v ≈ {T} s · ω = v/r ≈ {w} 1/s',
      limitTextString: 'Die Schnur reißt ab v = √(F_max · r / m) ≈ {v} m/s, also bei T < {T} s.',
      limitTextCar: 'v_max = √(μ · g · r) = √({mu} · 9,81 m/s² · {r} m) ≈ {v} m/s ({kmh} km/h)',
      now: 't = {t} s · φ = {phi}° · {laps} Umläufe',
      nowBroken: 't = {t} s · Schnur gerissen bei t = {tb} s',
      nowCar: 't = {t} s · Strecke {s} m',
      nowSkid: 't = {t} s · das Auto rutscht',
    },
    en: {
      canvas: 'Top view of a circular motion with velocity and force arrows, next to it a force comparison and a graph of the centripetal force',
      axisV: 'v in m/s',
      axisR: 'r in m',
      axisN: 'F in N',
      axisKN: 'F in kN',
      titleV: 'Centripetal force F_[Z] against v',
      titleR: 'Centripetal force F_[Z] against r',
      gaugeTitle: 'Centripetal force F_[Z]',
      need: 'needed: F_[Z] = m · v² / r = {f}',
      limitString: 'The string withstands at most {f} (breaking force).',
      limitCar: 'static friction at most μ · m · g = {f}',
      cut: 'string broken',
      noForce: 'no force any more: F_[Z] = 0',
      holds: 'string holds',
      breaks: 'string breaks!',
      grips: 'car keeps its line',
      skids: 'car skids!',
      broken: 'String broken: the ball flies on in a straight line.',
      brokenShort: 'ball flies straight on',
      offRoad: 'The car skids out of the bend!',
      offRoadShort: 'Car skids out of the bend!',
      fixT: 'T fixed',
      fixV: 'v fixed',
      breakLine: 'breaking force',
      slip: 'skids',
      laps: 'revolutions: {n}',
      dry: 'dry',
      wet: 'wet',
      snow: 'snow',
      ice: 'ice',
      grid: 'grid 10 cm',
      notToScale: 'not to scale',
      motionString: 'v = 2π · r / T = 2π · {r} m / {T} s ≈ <strong>{v} m/s</strong><br>f = 1/T ≈ {f} Hz · ω = 2π/T ≈ {w} 1/s',
      motionCar: 'v = <strong>{v} m/s</strong> = {kmh} km/h<br>T = 2π · r / v ≈ {T} s · ω = v/r ≈ {w} 1/s',
      limitTextString: 'The string breaks from v = √(F_max · r / m) ≈ {v} m/s, i.e. for T < {T} s.',
      limitTextCar: 'v_max = √(μ · g · r) = √({mu} · 9.81 m/s² · {r} m) ≈ {v} m/s ({kmh} km/h)',
      now: 't = {t} s · φ = {phi}° · {laps} revolutions',
      nowBroken: 't = {t} s · string broke at t = {tb} s',
      nowCar: 't = {t} s · distance {s} m',
      nowSkid: 't = {t} s · the car is skidding',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const mode = () => p.mode as Mode;
    const vColor = () => ctx.theme.series[0]!;
    const fColor = () => ctx.theme.series[1]!;
    const okColor = () => ctx.theme.series[2]!;

    /* ---------- Größen ---------- */
    const mu = () => ROADS[p.road as RoadId];
    /** Radius (m), Geschwindigkeit (m/s), Masse (kg) des aktuellen Versuchs. */
    const R = () => (mode() === 'car' ? p.rc : p.r);
    const V = () => (mode() === 'car' ? p.vc : speed(p.r, p.T));
    const M = () => (mode() === 'car' ? p.mc : p.m);
    const force = () => centripetalForce(M(), R(), V());
    const limit = () => (mode() === 'car' ? maxFriction(mu(), p.mc) : p.Fr);
    const omega = () => V() / R();

    /* ---------- Koordinatensysteme ---------- */
    const scene = new Plot(surface, {
      x: [-VIEW_STRING, VIEW_STRING],
      y: [-VIEW_STRING, VIEW_STRING],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => regions(w, h).scene,
    });
    const chartRect = (r: Rect): Rect => ({ x: r.x + 2, y: r.y + 32, w: r.w - 4, h: r.h - 34 });
    const chart = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => chartRect(regions(w, h).chart),
      xAxis: { label: ctx.t('axisV') },
      yAxis: { label: ctx.t('axisN') },
    });
    let viewKey = '';
    function fitScene(): void {
      const key = mode();
      if (key === viewKey) return;
      viewKey = key;
      const h = key === 'car' ? VIEW_CAR : VIEW_STRING;
      scene.setRange([-h, h], [-h, h]);
    }
    function fitAxes(): void {
      const car = mode() === 'car';
      chart.setAxes({ x: { label: ctx.t(p.chart === 'r' ? 'axisR' : 'axisV') }, y: { label: ctx.t(car ? 'axisKN' : 'axisN') } });
    }

    /* ---------- Zustand ---------- */
    let t = 0;
    let phi = PHI0;
    /** Gesamter überstrichener Winkel (für die Zahl der Umläufe). */
    let swept = 0;
    let broken: { t: number; pos: Vec; vel: Vec } | null = null;
    let slide: { t: number; phi: number; v: number; mu: number } | null = null;
    let done = false;
    const snap = new Tween(500, ease.outCubic);
    /** Spur: Orte in gleichen Zeitabständen. */
    let marks: Vec[] = [];
    let nextMark = 0;

    function reset(): void {
      t = 0;
      phi = PHI0;
      swept = 0;
      broken = null;
      slide = null;
      done = false;
      marks = [];
      nextMark = 0;
    }

    /** Ort des Körpers in Szenen-Koordinaten (Schnur: m; Auto: Vielfache von r). */
    function position(): Vec {
      if (mode() === 'string') {
        if (broken) return freeFlight(broken.pos, broken.vel, t - broken.t);
        return onCircle(p.r, phi);
      }
      if (slide) {
        const q = slidePosition(p.rc, slide.phi, slide.v, slide.mu, t - slide.t);
        return [q[0] / p.rc, q[1] / p.rc];
      }
      return onCircle(1, phi);
    }

    /** Bewegungsrichtung (Winkel) des Körpers. */
    function heading(): number {
      if (mode() === 'string' && broken) return Math.atan2(broken.vel[1], broken.vel[0]);
      if (mode() === 'car' && slide) {
        const rs = minRadius(slide.mu, slide.v);
        return slide.phi + (slide.v * (t - slide.t)) / rs + Math.PI / 2;
      }
      return phi + Math.PI / 2;
    }

    function breakString(): void {
      if (broken || mode() !== 'string') return;
      broken = { t, pos: onCircle(p.r, phi), vel: tangentVelocity(speed(p.r, p.T), phi) };
      snap.play();
    }

    /* ---------- Ergebnisse ---------- */
    const n = (v: number, d: number) => fmt.num(v, d);
    function updateNow(): void {
      if (mode() === 'string') {
        if (broken) ctx.readout('now', tr('nowBroken', { t: fmt.fixed(t, 2), tb: fmt.fixed(broken.t, 2) }));
        else ctx.readout('now', tr('now', { t: fmt.fixed(t, 2), phi: n((((phi - PHI0) * 180) / Math.PI) % 360, 0), laps: n(Math.floor(swept / (2 * Math.PI) + 1e-9), 0) }));
      } else if (slide) ctx.readout('now', tr('nowSkid', { t: fmt.fixed(t, 2) }));
      else ctx.readout('now', tr('nowCar', { t: fmt.fixed(t, 2), s: n(p.vc * t, 1) }));
    }

    function updateReadouts(): void {
      const r = R();
      const v = V();
      const m = M();
      const a = centripetalAcceleration(r, v);
      const F = force();
      const car = mode() === 'car';
      if (car) {
        ctx.readout('motion', { html: tr('motionCar', { v: n(v, 1), kmh: n(v * 3.6, 0), T: n(period(r, v), 1), w: n(v / r, 3) }) });
      } else {
        ctx.readout('motion', { html: tr('motionString', { r: n(r, 2), T: n(p.T, 2), v: n(v, 2), f: n(1 / p.T, 2), w: n((2 * Math.PI) / p.T, 2) }) });
      }
      ctx.readout('az', { html: `<var>a</var><sub>Z</sub> = <span class="frac"><span><var>v</var>²</span><span><var>r</var></span></span> = ω² · <var>r</var> ≈ <strong>${n(a, 2)} m/s²</strong>${car ? ` (${n(a / G, 2)} · <var>g</var>)` : ''}` });
      const Ftxt = car ? `${n(F / 1000, 2)} kN` : `${n(F, 2)} N`;
      ctx.readout('fz', {
        html: `<var>F</var><sub>Z</sub> = <var>m</var> · <span class="frac"><span><var>v</var>²</span><span><var>r</var></span></span> = ${n(m, 2)} kg · <span class="frac"><span>(${n(v, 2)} m/s)²</span><span>${n(r, 2)} m</span></span> ≈ <strong>${Ftxt}</strong>`,
      });
      if (car) {
        const vm = maxCornerSpeed(mu(), r);
        ctx.readout('limit', tr('limitTextCar', { mu: n(mu(), 1), r: n(r, 0), v: n(vm, 1), kmh: n(vm * 3.6, 0) }));
      } else {
        ctx.readout('limit', tr('limitTextString', { v: n(breakingSpeed(p.Fr, p.m, p.r), 2), T: n(breakingPeriod(p.Fr, p.m, p.r), 2) }));
      }
      updateNow();
    }

    /* ---------- Ziehen ---------- */
    const idle = () => !ctx.locked && !ctx.clock.playing && !broken && !slide;
    /** Länge des Geschwindigkeitspfeils in Szenen-Einheiten pro m/s. */
    const vScale = () => (mode() === 'car' ? 0.024 : 0.1);
    const vLen = (v: number) => Math.min(v * vScale(), mode() === 'car' ? 1.1 : 1.45);
    // Kugel radial ziehen → Radius
    scene.addHandle({
      get: () => position(),
      set: (x, y) => ctx.set({ r: clamp(Math.hypot(x, y), 0.2, 1.5) }),
      enabled: () => idle() && mode() === 'string',
      color: () => ctx.theme.series[3]!,
    });
    // Spitze des Geschwindigkeitspfeils → v (Schnur: über T)
    scene.addHandle({
      get: () => {
        const pos = position();
        const h = heading();
        const len = vLen(V());
        return [pos[0] + Math.cos(h) * len, pos[1] + Math.sin(h) * len];
      },
      set: (x, y) => {
        const pos = position();
        const h = heading();
        const along = (x - pos[0]) * Math.cos(h) + (y - pos[1]) * Math.sin(h);
        const v = Math.max(0.05, along / vScale());
        if (mode() === 'car') ctx.set({ vc: v });
        else ctx.set({ T: (2 * Math.PI * p.r) / v });
      },
      enabled: () => idle() && p.vec !== 'off',
      color: () => vColor(),
    });
    // Punkt im Diagramm entlang der Kurve verschieben
    chart.addHandle({
      get: () => [p.chart === 'r' ? R() : V(), mode() === 'car' ? force() / 1000 : force()],
      set: (x) => {
        if (p.chart === 'r') ctx.set(mode() === 'car' ? { rc: x } : { r: x });
        else if (mode() === 'car') ctx.set({ vc: x });
        else ctx.set({ T: (2 * Math.PI * p.r) / Math.max(0.05, x) });
      },
      axis: 'x',
      enabled: () => !ctx.locked && !broken && !slide,
      color: () => fColor(),
    });

    /* ---------- Zeichenhilfen ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): number {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center', false);
      return w;
    }

    function card(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
    }

    /** Text mit tiefgestellten Teilen: „F_[Z] = 4 N“. */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\[([^\]]*)\]/g;
      let last = 0;
      let mm: RegExpExecArray | null;
      while ((mm = re.exec(str))) {
        if (mm.index > last) out.push({ t: str.slice(last, mm.index), sub: false });
        out.push({ t: mm[1]!, sub: true });
        last = re.lastIndex;
      }
      if (last < str.length) out.push({ t: str.slice(last), sub: false });
      return out;
    }

    function richWidth(str: string, size: number, weight = 700): number {
      const g = surface.g;
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
      const g = surface.g;
      const theme = ctx.theme;
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
            g.strokeText(q.t, cx, yy);
          } else {
            g.fillStyle = color;
            g.fillText(q.t, cx, yy);
          }
          cx += g.measureText(q.t).width;
        }
      }
      return total;
    }

    /** Pfeil in Pixeln. */
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 11): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 2) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const h = Math.min(head, len * 0.6);
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * h * 0.7, y1 - uy * h * 0.7);
      g.stroke();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * h - uy * h * 0.55, y1 - uy * h + ux * h * 0.55);
      g.lineTo(x1 - ux * h + uy * h * 0.55, y1 - uy * h - ux * h * 0.55);
      g.closePath();
      g.fill();
    }

    /** Feste Maßlinie für den Radius (schräg nach links oben), damit sie nicht mit der Bewegung wandert. */
    function dimension(cx: number, cy: number, rp: number, label: string, color: string): void {
      const g = surface.g;
      const a = (3 * Math.PI) / 4;
      const ux = Math.cos(a);
      const uy = -Math.sin(a);
      const x1 = cx + ux * rp;
      const y1 = cy + uy * rp;
      g.strokeStyle = withAlpha(color.startsWith('#') && color.length === 7 ? color : '#808080', 0.7);
      g.lineWidth = 1.3;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(cx + ux * 6, cy + uy * 6);
      g.lineTo(x1 - ux * 6, y1 - uy * 6);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = g.strokeStyle;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * 8 - uy * 4, y1 - uy * 8 + ux * 4);
      g.lineTo(x1 - ux * 8 + uy * 4, y1 - uy * 8 - ux * 4);
      g.closePath();
      g.fill();
      const size = narrow() ? 11 : 12.5;
      // Beschriftung rechts oberhalb der Linienmitte (bei kleinem Kreis außerhalb)
      const inside = rp > 72;
      const mx = inside ? (cx + x1) / 2 + 12 : x1 - 4;
      const my = inside ? (cy + y1) / 2 - 10 : y1 - 12;
      const w = richText(label, mx, my, size, color, inside ? 'left' : 'right');
      dimBox = { x: inside ? mx : mx - w, y: my - size / 2 - 2, w, h: size + 4 };
    }
    /** Lage der Radius-Beschriftung (andere Beschriftungen weichen ihr aus). */
    let dimBox: Rect | null = null;

    /* ---------- Szene: Kugel an der Schnur ---------- */
    function drawTable(r: Rect): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const bg = g.createRadialGradient(r.x + r.w / 2, r.y + r.h / 2, 10, r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 0.75);
      bg.addColorStop(0, dark ? '#1b2433' : '#f7f9fb');
      bg.addColorStop(1, dark ? '#121925' : '#e3e8ef');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
      // Messraster: 10 cm fein, 50 cm kräftig
      const { xMin, xMax, yMin, yMax } = scene.bounds;
      for (const [step, alpha] of [
        [0.1, dark ? 0.05 : 0.07],
        [0.5, dark ? 0.12 : 0.16],
      ] as const) {
        g.strokeStyle = dark ? `rgba(160,180,210,${alpha})` : `rgba(40,60,90,${alpha})`;
        g.lineWidth = 1;
        g.beginPath();
        for (let k = Math.ceil(xMin / step); k * step <= xMax; k++) {
          const x = Math.round(scene.px(k * step)) + 0.5;
          g.moveTo(x, r.y);
          g.lineTo(x, r.y + r.h);
        }
        for (let k = Math.ceil(yMin / step); k * step <= yMax; k++) {
          const y = Math.round(scene.py(k * step)) + 0.5;
          g.moveTo(r.x, y);
          g.lineTo(r.x + r.w, y);
        }
        g.stroke();
      }
    }

    function drawSteelBall(x: number, y: number, rad: number): void {
      const g = surface.g;
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.35)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 2;
      g.shadowOffsetY = 3;
      const grad = g.createRadialGradient(x - rad * 0.38, y - rad * 0.42, rad * 0.1, x, y, rad);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, '#c9d0d9');
      grad.addColorStop(0.8, '#6c7682');
      grad.addColorStop(1, '#3d454f');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    function drawHub(cx: number, cy: number, rad: number): void {
      const g = surface.g;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      const grad = g.createRadialGradient(cx - rad * 0.3, cy - rad * 0.3, 1, cx, cy, rad);
      grad.addColorStop(0, '#f2f4f7');
      grad.addColorStop(1, '#7a838f');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(cx, cy, rad, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.fillStyle = '#3a414b';
      g.beginPath();
      g.arc(cx, cy, rad * 0.35, 0, Math.PI * 2);
      g.fill();
    }

    function drawStringScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      drawTable(r);
      const [cx, cy] = scene.toPx(0, 0);
      const rp = p.r * scene.scale.x;
      // Kreisbahn
      g.strokeStyle = withAlpha(theme.text, 0.35);
      g.lineWidth = 1.5;
      g.setLineDash([5, 6]);
      g.beginPath();
      g.arc(cx, cy, rp, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      const pos = position();
      const [bx, by] = scene.toPx(pos[0], pos[1]);
      const ballR = small ? 9 : 12;
      // Spur
      if (p.trace) {
        for (const q of marks) {
          const [qx, qy] = scene.toPx(q[0], q[1]);
          g.fillStyle = withAlpha(theme.text, 0.18);
          g.beginPath();
          g.arc(qx, qy, ballR * 0.55, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = withAlpha(theme.text, 0.45);
          g.lineWidth = 1;
          g.stroke();
        }
      } else if (!broken && ctx.clock.playing) {
        // kurzer, verblassender Schweif
        const tail = Math.min(1.4, omega() * 0.25);
        for (let i = 0; i < 12; i++) {
          const a0 = phi - (tail * (i + 1)) / 12;
          const a1 = phi - (tail * i) / 12;
          g.strokeStyle = withAlpha(theme.series[3]!, 0.35 * (1 - i / 12));
          g.lineWidth = ballR * 1.1 * (1 - i / 16);
          g.beginPath();
          g.arc(cx, cy, rp, -a1, -a0);
          g.stroke();
        }
      }
      dimension(cx, cy, rp, `r = ${n(p.r, 2)} m`, theme.muted);
      // Schnur
      g.strokeStyle = theme.dark ? '#d8c9a8' : '#8a6d3b';
      g.lineWidth = 2;
      g.lineCap = 'round';
      if (!broken) {
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(bx, by);
        g.stroke();
      } else {
        // Reststück an der Achse, schlaff
        const a = Math.atan2(broken.pos[1], broken.pos[0]);
        const lag = snap.running ? 1 - snap.value : 0;
        const len = rp * 0.35;
        const ex = cx + Math.cos(a + 0.25 * lag) * len;
        const ey = cy - Math.sin(a + 0.25 * lag) * len;
        g.beginPath();
        g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + Math.cos(a - 0.5) * len * 0.6, cy - Math.sin(a - 0.5) * len * 0.6, ex, ey);
        g.stroke();
        // Tangente und Flugbahn
        const [sx, sy] = scene.toPx(broken.pos[0], broken.pos[1]);
        const h = heading();
        g.strokeStyle = withAlpha(vColor(), 0.55);
        g.lineWidth = 1.5;
        g.setLineDash([6, 5]);
        g.beginPath();
        g.moveTo(sx - Math.cos(h) * 400, sy + Math.sin(h) * 400);
        g.lineTo(sx + Math.cos(h) * 900, sy - Math.sin(h) * 900);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = vColor();
        g.beginPath();
        g.arc(sx, sy, 3.5, 0, Math.PI * 2);
        g.fill();
        // kurzes Schnurstück hängt noch an der Kugel
        g.strokeStyle = theme.dark ? '#d8c9a8' : '#8a6d3b';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(bx - Math.cos(h + 0.4) * ballR * 2.2, by + Math.sin(h + 0.4) * ballR * 2.2);
        g.stroke();
      }
      drawHub(cx, cy, small ? 9 : 11);
      text(g, 'M', cx + (small ? 12 : 15), cy + (small ? 12 : 15), { font: `italic 700 ${small ? 12 : 13}px ${theme.mathFont}`, color: theme.muted });
      drawVectors(bx, by, ballR);
      drawSteelBall(bx, by, ballR);
    }

    /* ---------- Szene: Auto in der Kurve ---------- */
    function roadColors(): { asphalt: [string, string]; tint: string | null } {
      const dark = ctx.theme.dark;
      switch (p.road as RoadId) {
        case 'wet':
          return { asphalt: dark ? ['#2a2f37', '#1d2128'] : ['#4e555f', '#3a4049'], tint: 'rgba(170,200,235,0.16)' };
        case 'snow':
          return { asphalt: dark ? ['#5d646f', '#4c525c'] : ['#9aa1ab', '#878e98'], tint: 'rgba(255,255,255,0.35)' };
        case 'ice':
          return { asphalt: dark ? ['#46576b', '#394758'] : ['#8fa6bd', '#7d93aa'], tint: 'rgba(210,235,255,0.35)' };
        default:
          return { asphalt: dark ? ['#3b4049', '#30343b'] : ['#666c75', '#545a62'], tint: null };
      }
    }

    function drawCarScene(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      // Wiese mit Mährillen
      g.fillStyle = dark ? '#1f3324' : '#7fb365';
      g.fillRect(r.x, r.y, r.w, r.h);
      const stripe = small ? 22 : 30;
      g.fillStyle = dark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.08)';
      for (let x = r.x - r.h; x < r.x + r.w; x += stripe * 2) {
        g.beginPath();
        g.moveTo(x, r.y + r.h);
        g.lineTo(x + stripe, r.y + r.h);
        g.lineTo(x + stripe + r.h, r.y);
        g.lineTo(x + r.h, r.y);
        g.closePath();
        g.fill();
      }
      const [cx, cy] = scene.toPx(0, 0);
      const s = scene.scale.x;
      const rIn = (1 - ROAD) * s;
      const rOut = (1 + ROAD) * s;
      // Fahrbahn (Ring)
      const col = roadColors();
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 8;
      const asphalt = g.createRadialGradient(cx, cy, rIn, cx, cy, rOut);
      asphalt.addColorStop(0, col.asphalt[0]);
      asphalt.addColorStop(1, col.asphalt[1]);
      g.fillStyle = asphalt;
      g.beginPath();
      g.arc(cx, cy, rOut, 0, Math.PI * 2);
      g.arc(cx, cy, rIn, 0, Math.PI * 2, true);
      g.fill('evenodd');
      g.restore();
      if (col.tint) {
        g.fillStyle = col.tint;
        g.beginPath();
        g.arc(cx, cy, rOut, 0, Math.PI * 2);
        g.arc(cx, cy, rIn, 0, Math.PI * 2, true);
        g.fill('evenodd');
        const road = p.road as RoadId;
        const ring = (rr: number, width: number, color: string, dash: number[] = []) => {
          g.strokeStyle = color;
          g.lineWidth = width;
          g.setLineDash(dash);
          g.beginPath();
          g.arc(cx, cy, rr, 0, Math.PI * 2);
          g.stroke();
          g.setLineDash([]);
        };
        if (road === 'snow') {
          // Schneewälle am Rand, festgefahrene Fahrspuren in der Mitte
          ring(rOut - 4, 7, 'rgba(255,255,255,0.75)');
          ring(rIn + 4, 7, 'rgba(255,255,255,0.75)');
          for (const k of [-0.045, 0.045]) ring((1 + k) * s, 5, ctx.theme.dark ? 'rgba(60,66,76,0.55)' : 'rgba(120,128,140,0.45)');
          g.fillStyle = 'rgba(255,255,255,0.8)';
          for (let i = 0; i < 90; i++) {
            const a = i * 2.39996;
            const rr = (1 + ROAD * ((((i * 37) % 23) / 11.5 - 1) * 0.92)) * s;
            g.beginPath();
            g.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 0.8 + (i % 3) * 0.5, 0, Math.PI * 2);
            g.fill();
          }
        } else {
          // Spiegelungen: nasse Fahrbahn bzw. glänzendes Eis
          const ice = road === 'ice';
          for (let i = 0; i < 18; i++) {
            const a = i * 2.39996;
            const rr = (1 + ROAD * ((((i * 37) % 17) / 8.5 - 1) * 0.7)) * s;
            g.strokeStyle = ice ? 'rgba(255,255,255,0.55)' : 'rgba(220,235,255,0.28)';
            g.lineWidth = ice ? 1.4 : 2.5;
            g.lineCap = 'round';
            g.beginPath();
            g.arc(cx, cy, rr, a, a + 0.1 + (i % 3) * 0.06);
            g.stroke();
          }
          if (ice) ring(s, 2 * ROAD * s - 10, 'rgba(225,242,255,0.12)');
        }
      }
      // Randlinien und Mittellinie
      g.strokeStyle = 'rgba(255,255,255,0.85)';
      g.lineWidth = 2;
      for (const rr of [rIn + 3, rOut - 3]) {
        g.beginPath();
        g.arc(cx, cy, rr, 0, Math.PI * 2);
        g.stroke();
      }
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.setLineDash([10, 12]);
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(cx, cy, s, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      // Mittelpunkt und Radius
      const pos = position();
      const [px, py] = scene.toPx(pos[0], pos[1]);
      dimension(cx, cy, s, `r = ${n(p.rc, 0)} m`, dark ? '#e6eaf0' : '#10202a');
      g.fillStyle = dark ? '#e6eaf0' : '#10202a';
      g.beginPath();
      g.arc(cx, cy, 3.5, 0, Math.PI * 2);
      g.fill();
      text(g, 'M', cx + 12, cy + 12, { font: `italic 700 ${small ? 12 : 13}px ${theme.mathFont}`, color: dark ? '#e6eaf0' : '#10202a' });
      // Bremsspuren beim Rutschen
      if (slide) {
        const steps = 60;
        const dur = t - slide.t;
        for (const side of [-1, 1]) {
          g.strokeStyle = 'rgba(20,20,20,0.55)';
          g.lineWidth = 2.2;
          g.beginPath();
          for (let i = 0; i <= steps; i++) {
            const tt = (dur * i) / steps;
            const q = slidePosition(p.rc, slide.phi, slide.v, slide.mu, tt);
            const rs = minRadius(slide.mu, slide.v);
            const hd = slide.phi + (slide.v * tt) / rs + Math.PI / 2;
            const off = side * (small ? 5 : 7);
            const [x, y] = scene.toPx(q[0] / p.rc - (Math.sin(hd) * off) / s, q[1] / p.rc + (Math.cos(hd) * off) / s);
            if (i === 0) g.moveTo(x, y);
            else g.lineTo(x, y);
          }
          g.stroke();
        }
      }
      // Spur in gleichen Zeitabständen
      if (p.trace) {
        for (const q of marks) {
          const [qx, qy] = scene.toPx(q[0], q[1]);
          g.fillStyle = 'rgba(255,255,255,0.7)';
          g.beginPath();
          g.arc(qx, qy, 3.2, 0, Math.PI * 2);
          g.fill();
          g.strokeStyle = 'rgba(0,0,0,0.35)';
          g.lineWidth = 1;
          g.stroke();
        }
      }
      const carL = small ? 30 : 40;
      drawVectors(px, py, carL * 0.3);
      paintCar(px, py, heading(), carL);
      text(g, ctx.t('notToScale'), r.x + r.w - 10, r.y + r.h - 12, { font: `600 ${small ? 10 : 11}px ${theme.font}`, color: dark ? 'rgba(230,234,240,0.7)' : 'rgba(255,255,255,0.9)', align: 'right' });
    }

    /** Auto in Draufsicht; Fahrtrichtung `angle` (mathematisch, y nach oben). */
    function paintCar(x: number, y: number, angle: number, len: number): void {
      const g = surface.g;
      const w = len * 0.48;
      g.save();
      g.translate(x, y);
      g.rotate(-angle);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.45)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 2;
      g.shadowOffsetY = 3;
      const body = g.createLinearGradient(0, -w / 2, 0, w / 2);
      body.addColorStop(0, '#ffd166');
      body.addColorStop(0.5, '#f4a321');
      body.addColorStop(1, '#c97a06');
      g.fillStyle = body;
      roundRect(g, -len / 2, -w / 2, len, w, w * 0.32);
      g.fill();
      g.restore();
      // Räder (seitlich angedeutet)
      g.fillStyle = '#1d2027';
      for (const fx of [-0.3, 0.3]) for (const sy of [-1, 1]) g.fillRect(fx * len - len * 0.08, sy * (w / 2) - (sy > 0 ? 1 : 1.6), len * 0.16, 2.6);
      // Scheiben und Dach
      g.fillStyle = '#26313f';
      g.beginPath();
      g.moveTo(len * 0.12, -w * 0.36);
      g.lineTo(len * 0.27, -w * 0.3);
      g.lineTo(len * 0.27, w * 0.3);
      g.lineTo(len * 0.12, w * 0.36);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(-len * 0.24, -w * 0.33);
      g.lineTo(-len * 0.34, -w * 0.28);
      g.lineTo(-len * 0.34, w * 0.28);
      g.lineTo(-len * 0.24, w * 0.33);
      g.closePath();
      g.fill();
      const roof = g.createLinearGradient(0, -w * 0.34, 0, w * 0.34);
      roof.addColorStop(0, '#ffe08a');
      roof.addColorStop(1, '#e39418');
      g.fillStyle = roof;
      roundRect(g, -len * 0.22, -w * 0.34, len * 0.33, w * 0.68, w * 0.12);
      g.fill();
      // Lichter
      g.fillStyle = '#fff6cf';
      for (const sy of [-1, 1]) {
        g.beginPath();
        g.ellipse(len * 0.47, sy * w * 0.3, len * 0.025, w * 0.09, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#c0261f';
      for (const sy of [-1, 1]) g.fillRect(-len * 0.5, sy * w * 0.3 - w * 0.07, len * 0.03, w * 0.14);
      g.restore();
    }

    /**
     * Länge des Kraft- bzw. Beschleunigungspfeils in Szenen-Einheiten
     * (feste Maßstäbe, damit man Pfeile verschiedener Einstellungen vergleichen kann).
     */
    function sideLen(F: number): number {
      const car = mode() === 'car';
      if (p.vec === 'a') return (F / M()) * (car ? 0.08 : 0.02);
      return car ? (F / 1000) * 0.05 : F * 0.07;
    }

    /** Beschriftung mittig hinter einem Punkt in Richtung (ux, uy) – innerhalb der Szene. */
    function labelBeyond(str: string, x: number, y: number, ux: number, uy: number, color: string, gap = 9, avoid: Rect[] = []): Rect {
      const small = narrow();
      const size = small ? 11 : 12.5;
      const w = richWidth(str, size);
      const h = size + 4;
      const r = regions(surface.width, surface.height).scene;
      // Abstand so, dass das Textfeld (w × h) die Spitze nicht überdeckt; anderen Beschriftungen ausweichen
      let d = gap + Math.abs(ux) * (w / 2) + Math.abs(uy) * (h / 2);
      let box: Rect = { x: 0, y: 0, w, h };
      for (let k = 0; k < 30; k++) {
        const lx = clamp(x + ux * d, r.x + w / 2 + 6, r.x + r.w - w / 2 - 6);
        const ly = clamp(y + uy * d, r.y + 42, r.y + r.h - 14);
        box = { x: lx - w / 2, y: ly - h / 2, w, h };
        const hit = avoid.some((a) => box.x < a.x + a.w + 4 && a.x < box.x + box.w + 4 && box.y < a.y + a.h + 2 && a.y < box.y + box.h + 2);
        if (!hit) break;
        d += 4;
      }
      richText(str, box.x + w / 2, box.y + h / 2, size, color, 'center');
      return box;
    }

    /** Geschwindigkeits- und Kraftpfeil (bzw. Beschleunigungspfeil) am Körper (Pixel). */
    function drawVectors(bx: number, by: number, bodyR: number): void {
      if (p.vec === 'off') return;
      const small = narrow();
      const s = scene.scale.x;
      const h = heading();
      const vl = vLen(V()) * s;
      const ux = Math.cos(h);
      const uy = -Math.sin(h);
      const car = mode() === 'car';
      // Kraft zum Mittelpunkt bzw. beim Rutschen die größte Haftreibung zum Mittelpunkt des größeren Kreises
      let F = force();
      let label = '';
      let dir: Vec | null = null;
      if (mode() === 'string' && broken) dir = null;
      else if (car && slide) {
        F = limit();
        dir = [-Math.cos(h - Math.PI / 2), Math.sin(h - Math.PI / 2)];
        label = p.vec === 'a' ? `a = μ · g = ${n(F / M(), 2)} m/s²` : `F_[H,max] = ${n(F / 1000, 2)} kN`;
      } else {
        const [cx, cy] = scene.toPx(0, 0);
        const dist = Math.hypot(cx - bx, cy - by) || 1;
        dir = [(cx - bx) / dist, (cy - by) / dist];
        label = p.vec === 'a' ? `a_[Z] = ${n(F / M(), car ? 2 : 1)} m/s²` : car ? `F_[Z] = ${n(F / 1000, 2)} kN` : `F_[Z] = ${n(F, 2)} N`;
      }
      let fx = bx;
      let fy = by;
      if (dir) {
        const [cx, cy] = scene.toPx(0, 0);
        const maxLen = car && slide ? 0.9 * s : Math.hypot(cx - bx, cy - by) - (small ? 13 : 16) - bodyR * 0.2;
        const fl = clamp(sideLen(F) * s, 12, Math.max(12, maxLen));
        const x0 = bx + dir[0] * bodyR * 0.2;
        const y0 = by + dir[1] * bodyR * 0.2;
        fx = x0 + dir[0] * fl;
        fy = y0 + dir[1] * fl;
        arrowPx(x0, y0, fx, fy, fColor(), small ? 3 : 3.5, small ? 10 : 12);
      }
      arrowPx(bx, by, bx + ux * vl, by + uy * vl, vColor(), small ? 3 : 3.5, small ? 10 : 12);
      const vText = `v = ${n(V(), car ? 1 : 2)} m/s`;
      let vBox: Rect;
      if (mode() === 'string' && broken) {
        // nach dem Reißen: Beschriftung fest an der Stelle, an der die Schnur riss (nach außen versetzt)
        const [sx, sy] = scene.toPx(broken.pos[0], broken.pos[1]);
        const out = Math.hypot(broken.pos[0], broken.pos[1]) || 1;
        vBox = labelBeyond(vText, sx, sy, broken.pos[0] / out, -broken.pos[1] / out, vColor(), 10, dimBox ? [dimBox] : []);
      } else vBox = labelBeyond(vText, bx + ux * vl, by + uy * vl, ux, uy, vColor(), 9, dimBox ? [dimBox] : []);
      const [mx0, my0] = scene.toPx(0, 0);
      const mBox: Rect = { x: mx0 - 6, y: my0 - 6, w: 30, h: 28 };
      if (dir) labelBeyond(label, fx, fy, dir[0], dir[1], fColor(), 7, dimBox ? [vBox, dimBox, mBox] : [vBox, mBox]);
    }

    function drawScene(): void {
      const r = regions(surface.width, surface.height).scene;
      const g = scene.begin();
      const theme = ctx.theme;
      const small = narrow();
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      if (mode() === 'car') drawCarScene(r);
      else drawStringScene(r);
      // Anzeigen oben
      const size = small ? 11 : 12;
      const w1 = pill(r.x + 8, r.y + 8, `t = ${fmt.fixed(t, 2)} s`, theme.text, 'left', size);
      if (mode() === 'string') {
        if (!broken) pill(r.x + 8 + w1 + 6, r.y + 8, tr('laps', { n: n(Math.floor(swept / (2 * Math.PI) + 1e-9), 0) }), theme.muted, 'left', size);
        pill(r.x + r.w - 8, r.y + 8, small ? `T = ${n(p.T, 2)} s` : `T = ${n(p.T, 2)} s · f = ${n(1 / p.T, 2)} Hz`, theme.text, 'right', size);
      } else {
        pill(r.x + r.w - 8, r.y + 8, `μ = ${n(mu(), 1)} · ${n(p.vc * 3.6, 0)} km/h`, theme.text, 'right', size);
      }
      // Meldungen (zweite Zeile oben)
      const msgY = r.y + (small ? 38 : 42);
      if (broken) pill(r.x + r.w / 2, msgY, ctx.t(small ? 'brokenShort' : 'broken'), vColor(), 'center', size + 0.5, withAlpha(vColor(), 0.92));
      if (slide && done) pill(r.x + r.w / 2, msgY, ctx.t(small ? 'offRoadShort' : 'offRoad'), fColor(), 'center', size + 0.5, withAlpha(fColor(), 0.92));
      if (mode() === 'string' && !small) text(g, ctx.t('grid'), r.x + r.w - 10, r.y + r.h - 12, { font: `600 11px ${theme.font}`, color: theme.muted, align: 'right' });
      g.restore();
      scene.end();
    }

    /* ---------- Kraftvergleich ---------- */
    function drawGauge(R0: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const small = narrow();
      card(R0);
      const car = mode() === 'car';
      const cut = !car && !!broken;
      const F = cut ? 0 : force();
      const lim = limit();
      const over = F > lim * (1 + 1e-9);
      const unitF = (x: number) => (car ? `${n(x / 1000, 2)} kN` : `${n(x, 2)} N`);
      const pad = small ? 12 : 14;
      richText(ctx.t('gaugeTitle'), R0.x + pad, R0.y + 18, small ? 12 : 13, theme.text, 'left', false);
      // Status
      const status = cut ? ctx.t('cut') : ctx.t(car ? (over ? 'skids' : 'grips') : over ? 'breaks' : 'holds');
      const sc = cut ? theme.muted : over ? fColor() : okColor();
      pill(R0.x + R0.w - pad + 4, R0.y + 7, status, sc, 'right', small ? 10.5 : 11, withAlpha(sc, 0.9));
      const max = Math.max(lim * 1.3, F * 1.06);
      const x0 = R0.x + pad;
      const x1 = R0.x + R0.w - pad;
      const X = (v: number) => x0 + (v / max) * (x1 - x0);
      const by = R0.y + (small ? 32 : 36);
      const bh = small ? 13 : 15;
      g.fillStyle = withAlpha(theme.muted, 0.14);
      roundRect(g, x0, by, x1 - x0, bh, bh / 2);
      g.fill();
      // Bereich jenseits der Grenze
      g.save();
      roundRect(g, x0, by, x1 - x0, bh, bh / 2);
      g.clip();
      g.fillStyle = withAlpha(fColor(), theme.dark ? 0.22 : 0.14);
      g.fillRect(X(lim), by, x1 - X(lim), bh);
      g.restore();
      if (F > 0) {
        const grad = g.createLinearGradient(x0, 0, X(F), 0);
        grad.addColorStop(0, shade(over ? fColor() : okColor(), 0.25));
        grad.addColorStop(1, over ? fColor() : okColor());
        g.fillStyle = grad;
        roundRect(g, x0, by, Math.max(bh, X(F) - x0), bh, bh / 2);
        g.fill();
      }
      // Grenze
      const mark = (x: number, y0: number, y1: number) => {
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, y0);
        g.lineTo(x, y1);
        g.stroke();
      };
      mark(X(lim), by - 4, by + bh + 4);
      const fs = small ? 11 : 12;
      const rowA = by + bh + (small ? 14 : 16);
      const rowB = rowA + (small ? 17 : 19);
      g.fillStyle = sc;
      roundRect(g, x0, rowA - 4, 12, 8, 3);
      g.fill();
      richText(cut ? ctx.t('noForce') : tr('need', { f: unitF(F) }), x0 + 18, rowA, fs, cut ? theme.muted : over ? fColor() : theme.text, 'left', false);
      mark(x0 + 6, rowB - 6, rowB + 6);
      richText(tr(car ? 'limitCar' : 'limitString', { f: unitF(lim) }), x0 + 18, rowB, fs, theme.muted, 'left', false);
    }

    /* ---------- Diagramm ---------- */
    function drawChart(R0: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      const car = mode() === 'car';
      const byR = p.chart === 'r';
      card(R0);
      richText(ctx.t(byR ? 'titleR' : 'titleV'), R0.x + 14, R0.y + 18, small ? 12 : 13, theme.text, 'left', false);
      const k = car ? 1000 : 1;
      const m = M();
      const r = R();
      const v = V();
      const F = force() / k;
      const lim = limit() / k;
      const xMax = byR ? (car ? 210 : 1.6) : car ? 42 : niceCeil(Math.max(v * 1.3, breakingSpeed(p.Fr, p.m, p.r) * 1.15));
      const maxLim = car ? maxFriction(ROADS.dry, p.mc) / k : lim;
      const yMax = niceCeil(Math.max(maxLim, F) * 1.22);
      chart.setRangePadded([0, xMax], [0, yMax], { left: small ? 40 : 46, right: 14, top: 12, bottom: 24 });
      chart.begin();
      // Bereich oberhalb der Grenze: rutscht / reißt
      chart.polygon(
        [
          [0, lim],
          [xMax, lim],
          [xMax, yMax * 2],
          [0, yMax * 2],
        ],
        { fill: fColor(), alpha: theme.dark ? 0.1 : 0.07 },
      );
      chart.grid({ minor: false });
      chart.axes();
      // Grenzlinien
      if (car) {
        // ausgewählte Fahrbahn zuerst beschriften, andere nur, wenn Platz ist
        const taken: number[] = [];
        const order = [p.road as RoadId, ...ROAD_ORDER.filter((id) => id !== p.road)];
        for (const id of order) {
          const fl = maxFriction(ROADS[id], p.mc) / k;
          const sel = id === p.road;
          chart.hline(fl, { color: sel ? theme.text : theme.muted, width: sel ? 2 : 1, dash: sel ? [] : [4, 4], alpha: sel ? 0.9 : 0.6 });
          const py = chart.py(fl);
          if (taken.some((q) => Math.abs(q - py) < 14)) continue;
          taken.push(py);
          chart.text(xMax, fl, ctx.t(id), { color: sel ? theme.text : theme.muted, size: 11, weight: sel ? 'bold' : '600', align: 'right', baseline: 'bottom', offset: [-4, -3] });
        }
      } else {
        chart.hline(lim, { color: theme.text, width: 2, alpha: 0.85 });
        chart.text(xMax, lim, ctx.t('breakLine'), { color: theme.text, size: 11, weight: 'bold', align: 'right', baseline: 'bottom', offset: [-4, -3] });
      }
      const clip = yMax * 1.5;
      if (!byR) {
        chart.fn((x) => Math.min(clip, (m * x * x) / r / k), { color: fColor(), width: 3, from: 0, to: xMax });
        // Grenzgeschwindigkeit
        const vb = car ? maxCornerSpeed(mu(), r) : breakingSpeed(p.Fr, p.m, p.r);
        if (vb <= xMax) {
          chart.segment([vb, 0], [vb, lim], { color: theme.muted, width: 1.4, dash: [4, 4] });
          if (car) chart.text(vb, 0, 'vₘₐₓ', { color: theme.muted, size: 11, weight: '600', align: 'center', baseline: 'bottom', offset: [0, -4] });
        }
      } else {
        // F_Z(r) bei fester Geschwindigkeit (Hyperbel)
        chart.fn((x) => (x > 1e-6 ? Math.min(clip, (m * v * v) / x / k) : clip), { color: fColor(), width: 3, dash: car ? [] : [7, 5], from: xMax / 400, to: xMax });
        if (!car) {
          // … und bei fester Umlaufdauer (Ursprungsgerade)
          const w2 = ((2 * Math.PI) / p.T) ** 2;
          chart.fn((x) => Math.min(clip, m * w2 * x), { color: fColor(), width: 3, from: 0, to: xMax });
          const xl = Math.min(xMax * 0.92, (yMax * 0.86) / (m * w2));
          chart.text(xl, m * w2 * xl, ctx.t('fixT'), { color: fColor(), size: 11.5, weight: 'bold', align: 'right', baseline: 'bottom', offset: [-6, -2] });
          const xh = Math.max(xMax * 0.08, (m * v * v) / (yMax * 0.86));
          const xh2 = Math.min(xMax * 0.9, Math.max(xh, r * 1.6));
          chart.text(xh2, (m * v * v) / xh2, ctx.t('fixV'), { color: fColor(), size: 11.5, weight: 'bold', align: 'left', baseline: 'bottom', offset: [4, -4] });
        } else {
          const rmin = minRadius(mu(), v);
          if (rmin <= xMax) {
            chart.segment([rmin, 0], [rmin, lim], { color: theme.muted, width: 1.4, dash: [4, 4] });
            chart.text(rmin, 0, 'rₘᵢₙ', { color: theme.muted, size: 11, weight: '600', align: 'center', baseline: 'bottom', offset: [0, -4] });
          }
        }
      }
      // aktueller Punkt mit Hilfslinien
      const X = byR ? r : v;
      const over = F > lim * (1 + 1e-9);
      chart.segment([X, 0], [X, F], { color: fColor(), width: 1.2, dash: [3, 3], alpha: 0.7 });
      chart.segment([0, F], [X, F], { color: fColor(), width: 1.2, dash: [3, 3], alpha: 0.7 });
      chart.point(X, Math.min(F, yMax * 1.02), { color: over ? fColor() : theme.text, radius: 6 });
      const label = car ? `${n(F, 1)} kN` : `${n(F, 1)} N`;
      const right = chart.px(X) < chart.rect.x + chart.rect.w - 80;
      chart.text(X, Math.min(F, yMax), label, { color: fColor(), size: 12, weight: 'bold', align: right ? 'left' : 'right', baseline: 'top', offset: [right ? 9 : -9, 6] });
      chart.end();
    }

    /* ---------- Ablauf ---------- */
    function markInterval(): number {
      return mode() === 'car' ? period(p.rc, p.vc) / 16 : p.T / 12;
    }

    reset();
    fitScene();
    fitAxes();

    return {
      update(changed, source) {
        if (changed.has('mode') || source === 'replace' || source === 'init') {
          ctx.clock.pause();
          reset();
          fitScene();
        }
        const physics = ['r', 'T', 'm', 'Fr', 'rc', 'vc', 'mc', 'road'].some((key) => changed.has(key));
        if (physics && source !== 'sim' && (broken || slide || done)) {
          ctx.clock.pause();
          reset();
        }
        if (physics && p.trace) {
          marks = [];
          nextMark = t;
        }
        if (changed.has('chart') || changed.has('mode') || source !== 'sim') fitAxes();
        updateReadouts();
      },

      action(id) {
        if (id === 'go') {
          reset();
          ctx.clock.play();
        } else if (id === 'cut' && mode() === 'string') {
          if (broken) return;
          breakString();
          ctx.clock.play();
        }
      },

      tick(dt) {
        if (done) {
          reset();
        }
        const h = dt * (p.slow ? 0.25 : 1);
        const view = mode() === 'car' ? VIEW_CAR : VIEW_STRING;
        // Spur in gleichen Zeitabständen
        const step = markInterval();
        while (p.trace && nextMark <= t + 1e-9) {
          marks.push(position());
          nextMark += step;
          if (marks.length > (mode() === 'string' && !broken ? 12 : 48)) marks.shift();
        }
        if (mode() === 'string') {
          if (!broken) {
            if (force() > p.Fr * (1 + 1e-9)) breakString();
            else {
              phi += omega() * h;
              swept += omega() * h;
            }
          }
          t += h;
          if (broken) {
            const q = position();
            const [qx, qy] = scene.toPx(q[0], q[1]);
            const sr = regions(surface.width, surface.height).scene;
            const m0 = narrow() ? 16 : 20;
            if (qx < sr.x + m0 || qx > sr.x + sr.w - m0 || qy < sr.y + m0 + 30 || qy > sr.y + sr.h - m0) {
              done = true;
              ctx.clock.pause();
            }
          }
        } else {
          if (!slide && p.vc > maxCornerSpeed(mu(), p.rc) * (1 + 1e-9)) slide = { t, phi, v: p.vc, mu: mu() };
          if (!slide) {
            phi += (p.vc / p.rc) * h;
            swept += (p.vc / p.rc) * h;
          }
          t += h;
          if (slide) {
            const q = position();
            if (Math.hypot(q[0], q[1]) > 1 + ROAD + 0.2 || Math.max(Math.abs(q[0]), Math.abs(q[1])) > view * 0.95) {
              done = true;
              ctx.clock.pause();
            }
          }
        }
        updateNow();
      },

      resetTime() {
        reset();
        updateNow();
      },

      render() {
        const reg = regions(surface.width, surface.height);
        fitScene();
        scene.resize();
        chart.resize();
        surface.begin();
        drawScene();
        drawGauge(reg.gauge);
        drawChart(reg.chart);
        if (snap.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
