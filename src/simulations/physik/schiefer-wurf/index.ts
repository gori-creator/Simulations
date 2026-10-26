import { defineSimulation, ease, Plot, prefersReducedMotion, roundRect, scaledSprite, shade, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  aimAngles,
  directionOf,
  dragConstant,
  dragFlight,
  judgeShot,
  minSpeed,
  optimalAngleWith,
  PLANETS,
  randomTarget,
  sampleAt,
  specificEnergy,
  speedOf,
  strobeInterval,
  targetRadius,
  vacuumFlight,
  vacuumState,
  type Flight,
  type FlightState,
  type Launch,
  type PlanetId,
  type ProjectileId,
  type ShotResult,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'throw' | 'parts' | 'angles' | 'target' | 'drag';
type Pt = [number, number];
type ChartKind = 'x' | 'y' | 'vx' | 'vy' | 'range' | 'energy';

const FAMILY = [15, 30, 45, 60, 75];
/**
 * Zielscheibe `zielscheibe.webp` (918 × 1186 px): Mitte und Radius der Scheibe,
 * Zeile, ab der nur noch der Pfosten kommt, und dessen Breite.
 */
const TARGET_IMG = { w: 918, h: 1186, cx: 459, cy: 459, r: 458, post: 918, postX: [397, 525] } as const;
const RAD = Math.PI / 180;
/** Anzahl der Stützpunkte der vorausberechneten Bahn (für das weiche Überblenden). */
const PREVIEW_N = 140;
const PHYSICS = ['v0', 'angle', 'h0', 'planet', 'air', 'obj', 'mode', 'tx', 'ty'];

const GROUND: Record<PlanetId, { top: string; bottom: string; sky: [string, string]; skyDark: [string, string] }> = {
  erde: { top: '#5fa846', bottom: '#3d6b2c', sky: ['#7fb8f0', '#dcefff'], skyDark: ['#16243a', '#2b3a52'] },
  mond: { top: '#9a9a9a', bottom: '#5c5c5c', sky: ['#05060a', '#1b1e27'], skyDark: ['#05060a', '#1b1e27'] },
  mars: { top: '#c4673a', bottom: '#7d3519', sky: ['#c99a78', '#f0d3b8'], skyDark: ['#3a2418', '#5a3a2a'] },
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;

/** „Schöne“ Schrittweite (1, 2, 2,5, 5 · 10^k) von mindestens x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const q = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
  return 10 * q;
}

/** Obere Grenze eines Diagramms: etwas Luft über x, auf runde Werte. */
function niceTop(x: number): number {
  if (!(x > 0)) return 1;
  const step = niceStep(x / 4);
  return Math.ceil((x * 1.08) / step - 1e-9) * step;
}

/**
 * Waagerechter und schiefer Wurf: Ein Ball wird mit v₀ unter dem Winkel α aus
 * der Höhe h₀ geworfen – auf der Erde, dem Mond oder dem Mars, wahlweise mit
 * Luftwiderstand. Fünf Ansichten: Wurf mit Stroboskop und Vektoren,
 * Zerlegung in x- und y-Bewegung mit synchronen Diagrammen, Winkelvergleich
 * mit Wurfweite über dem Winkel, Zielwurf als Entdeckungsaufgabe und
 * Vergleich mit/ohne Luftwiderstand mit Energiediagramm.
 */
export default defineSimulation({
  id: 'schiefer-wurf',
  animated: true,
  hint: L(
    'Tipp: Pfeilspitze ziehen (v₀ und α), Abwurfpunkt nach oben ziehen (h₀). Nach dem Wurf lässt sich der Ball entlang der Bahn ziehen; in den Diagrammen verschiebt Ziehen die Zeit bzw. den Winkel.',
    'Tip: drag the arrow tip (v₀ and α) or the launch point upwards (h₀). After the throw you can drag the ball along its path; dragging in the graphs moves the time or the angle.',
  ),
  layout: { aspect: 1.75, aspectNarrow: 0.72 },
  groups: [
    { id: 'target', label: L('Ziel', 'Target') },
    { id: 'world', label: L('Ort und Luft', 'Location and air') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'throw', label: L('Wurf', 'Throw') },
        { value: 'parts', label: L('Zerlegung', 'Components') },
        { value: 'angles', label: L('Winkel vergleichen', 'Compare angles') },
        { value: 'target', label: L('Zielwurf', 'Hit the target') },
        { value: 'drag', label: L('Luftwiderstand', 'Air resistance') },
      ],
      default: 'throw',
    },
    {
      key: 'v0',
      type: 'number',
      label: L('Abwurfgeschwindigkeit v₀', 'Launch speed v₀'),
      help: L('Oder: an der Spitze des orangefarbenen Pfeils ziehen.', 'Or: drag the tip of the orange arrow.'),
      min: 1,
      max: 40,
      step: 0.5,
      default: 15,
      unit: 'm/s',
    },
    { key: 'angle', type: 'number', label: L('Abwurfwinkel α', 'Launch angle α'), min: -45, max: 90, step: 1, default: 30, unit: '°' },
    {
      key: 'h0',
      type: 'number',
      label: L('Abwurfhöhe h₀', 'Launch height h₀'),
      help: L('Oder: den Abwurfpunkt nach oben ziehen.', 'Or: drag the launch point upwards.'),
      min: 0,
      max: 40,
      step: 0.5,
      default: 0,
      unit: 'm',
    },
    { key: 'tx', type: 'number', group: 'target', label: L('Entfernung des Ziels', 'Distance of the target'), min: 3, max: 150, step: 0.5, default: 18, unit: 'm', visibleIf: (v) => v.mode === 'target' },
    { key: 'ty', type: 'number', group: 'target', label: L('Höhe des Ziels', 'Height of the target'), min: 0, max: 30, step: 0.5, default: 2, unit: 'm', visibleIf: (v) => v.mode === 'target' },
    {
      key: 'sol',
      type: 'boolean',
      group: 'target',
      label: L('Lösungswinkel zeigen', 'Show the solution angles'),
      help: L('Nach dem ersten Treffer erscheinen die Lösungen von selbst.', 'After the first hit the solutions appear automatically.'),
      default: false,
      visibleIf: (v) => v.mode === 'target',
    },
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
      label: L('Luftwiderstand', 'Air resistance'),
      help: L('Auf dem Mond gibt es keine Luft, auf dem Mars nur sehr wenig.', 'There is no air on the Moon and very little on Mars.'),
      default: false,
      visibleIf: (v) => v.mode !== 'drag',
    },
    {
      key: 'obj',
      type: 'choice',
      group: 'world',
      label: L('Wurfkörper', 'Projectile'),
      options: [
        { value: 'fb', label: L('Fußball', 'Football') },
        { value: 'tt', label: L('Tischtennisball', 'Table tennis ball') },
        { value: 'kugel', label: L('Stoßkugel', 'Shot put') },
      ],
      default: 'fb',
      visibleIf: (v) => v.air === true || v.mode === 'drag',
    },
    { key: 'vectors', type: 'boolean', group: 'view', label: L('Geschwindigkeit und Komponenten', 'Velocity and components'), default: true },
    { key: 'strobe', type: 'boolean', group: 'view', label: L('Positionen in gleichen Zeitabständen', 'Positions at equal time intervals'), default: true },
    { key: 'family', type: 'boolean', group: 'view', label: L('Vergleich: Winkel 15° bis 75°', 'Compare: angles 15° to 75°'), default: false, visibleIf: (v) => v.mode === 'throw' },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'throw', label: L('Werfen', 'Throw'), primary: true },
    { id: 'newtarget', label: L('Neues Ziel', 'New target'), visibleIf: (v) => v.mode === 'target' },
  ],
  images: {
    erde: 'hintergrund-erde.webp',
    mond: 'hintergrund-mond.webp',
    mars: 'hintergrund-mars.webp',
    ball: 'ball.webp',
    tt: 'tischtennisball.webp',
    kugel: 'stosskugel.webp',
    target: 'zielscheibe.webp',
  },
  readouts: [
    { key: 'score', label: L('Zielwurf', 'Target practice') },
    { key: 'time', label: L('Flugzeit', 'Time of flight'), spoiler: true },
    { key: 'range', label: L('Wurfweite', 'Range'), spoiler: true },
    { key: 'height', label: L('Maximale Höhe', 'Maximum height'), spoiler: true },
    { key: 'impact', label: L('Aufprallgeschwindigkeit', 'Impact speed'), spoiler: true },
    { key: 'path', label: L('Bahngleichung (ohne Luftwiderstand)', 'Trajectory equation (no air resistance)'), spoiler: true },
    { key: 'super', label: L('Superposition', 'Superposition') },
    { key: 'opt', label: L('Größte Wurfweite', 'Largest range'), spoiler: true },
    { key: 'cmp', label: L('Mit und ohne Luft', 'With and without air'), spoiler: true },
    { key: 'aim', label: L('Lösung des Zielwurfs', 'Solution for the target'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Schräger Wurf', 'Oblique throw'), values: {} },
    { id: 'horizontal', label: L('Waagerecht vom Turm', 'Horizontal from a tower'), values: { v0: 10, angle: 0, h0: 20 } },
    { id: 'parts', label: L('Zerlegung in x und y', 'Split into x and y'), values: { mode: 'parts', v0: 14, angle: 50 } },
    { id: 'compare', label: L('Welcher Winkel ist am weitesten?', 'Which angle goes furthest?'), values: { mode: 'angles', v0: 15, angle: 45 } },
    { id: 'target', label: L('Zielwurf', 'Hit the target'), values: { mode: 'target' } },
    { id: 'moon', label: L('Auf dem Mond', 'On the Moon'), values: { planet: 'mond', angle: 45, v0: 10 } },
    { id: 'air', label: L('Fußball mit und ohne Luft', 'Football with and without air'), values: { mode: 'drag', v0: 28, angle: 35 } },
  ],
  strings: {
    de: {
      canvas: 'Wurfbahn eines Balls mit Boden, Abwurfstelle, Geschwindigkeitspfeilen und je nach Ansicht Diagrammen zur Zerlegung, Wurfweite über dem Winkel, Zielscheibe oder Energie',
      axisT: 't in s',
      axisA: 'α in °',
      vacuum: 'ohne Luft',
      withAir: 'mit Luft',
      range: 'Wurfweite',
      height: 'Scheitel',
      speedAt: '{v} m/s unter {a}° zur Waagerechten',
      g: 'g = {g} m/s²',
      erde: 'Erde',
      mond: 'Mond',
      mars: 'Mars',
      fb: 'Fußball',
      tt: 'Tischtennisball',
      kugel: 'Stoßkugel',
      tX: 'x(t) in m',
      tY: 'y(t) in m',
      tVX: 'vₓ(t) in m/s',
      tVY: 'v_y(t) in m/s',
      tRange: 'Wurfweite w in m',
      tEnergy: 'Energie pro kg in J/kg',
      constVX: 'vₓ bleibt gleich',
      slopeVY: 'Steigung −g',
      apex: 'Scheitel: v_{y} = 0',
      best: 'beste: {a}°',
      same: 'gleiche Weite',
      now: 't = {t} s · x = {x} m · y = {y} m · v = {v} m/s',
      hVert: 'α = 90°: senkrechter Wurf – Weite 0',
      hHor: 'α = 0°: waagerechter Wurf',
      hDown: 'α < 0°: Wurf schräg nach unten',
      hNone: 'Vom Boden aus waagerecht oder nach unten: kein Flug',
      hBest: 'α = 45° bei h₀ = 0: größte Wurfweite',
      hMoon: 'Mond: keine Luft – kein Luftwiderstand',
      hMoonDrag: 'Mond: keine Luft – beide Bahnen gleich',
      hHigh: 'h₀ > 0: beste Weite unter 45°',
      hit: 'Treffer!',
      short: 'zu kurz',
      long: 'zu weit',
      shortLong: 'zu kurz – unter dem Ziel',
      longLong: 'zu weit – über das Ziel',
      score: 'Treffer: {h} von {n}',
      scoreText: '{h} Treffer bei {n} Würfen',
      scoreNone: 'Stelle v₀ und α ein (oder ziehe am Pfeil) und triff die Scheibe!',
      solTwo: 'Lösungen: {a}° (flach) und {b}° (steil)',
      solOne: 'Lösung: {a}°',
      solNone: 'mit v₀ = {v} m/s unerreichbar – nötig: v₀ ≥ {m} m/s',
      solAir: 'Lösungswinkel ohne Luftwiderstand',
      aimTwo: 'Treffer ohne Luftwiderstand mit α ≈ {a}° (flache Bahn) oder α ≈ {b}° (steile Bahn).',
      aimOne: 'Treffer nur mit α ≈ {a}° – v₀ reicht gerade aus.',
      aimNone: 'Mit v₀ = {v} m/s ist das Ziel unerreichbar. Kleinste nötige Abwurfgeschwindigkeit: {m} m/s.',
      optText: 'ohne Luft: größte Weite bei α ≈ {a}° (w ≈ {w} m)',
      optAir: 'mit Luft: bei α ≈ {a}° (w ≈ {w} m)',
      cmpText: 'Weite ohne Luft {w0} m, mit Luft {w1} m (−{p} %) · Scheitel {h0} m bzw. {h1} m',
      superX: '<var>x</var>(<var>t</var>) = <var>v</var>₀ · cos <var>α</var> · <var>t</var> = {vx} m/s · <var>t</var> (gleichförmig)',
      superY: '<var>y</var>(<var>t</var>) = <var>h</var>₀ + <var>v</var>₀ · sin <var>α</var> · <var>t</var> − ½ · <var>g</var> · <var>t</var>² = {h0}{vy} − {g2} m/s² · <var>t</var>² (senkrechter Wurf)',
      vert: 'senkrechter Wurf: <var>x</var> = 0',
      noFlight: 'kein Flug',
    },
    en: {
      canvas: 'Trajectory of a ball with ground, launch point, velocity arrows and, depending on the view, graphs of the components, range against angle, a target or energy',
      axisT: 't in s',
      axisA: 'α in °',
      vacuum: 'no air',
      withAir: 'with air',
      range: 'Range',
      height: 'apex',
      speedAt: '{v} m/s at {a}° to the horizontal',
      g: 'g = {g} m/s²',
      erde: 'Earth',
      mond: 'Moon',
      mars: 'Mars',
      fb: 'football',
      tt: 'table tennis ball',
      kugel: 'shot put',
      tX: 'x(t) in m',
      tY: 'y(t) in m',
      tVX: 'vₓ(t) in m/s',
      tVY: 'v_y(t) in m/s',
      tRange: 'Range w in m',
      tEnergy: 'Energy per kg in J/kg',
      constVX: 'vₓ stays the same',
      slopeVY: 'slope −g',
      apex: 'apex: v_{y} = 0',
      best: 'best: {a}°',
      same: 'same range',
      now: 't = {t} s · x = {x} m · y = {y} m · v = {v} m/s',
      hVert: 'α = 90°: vertical throw – range 0',
      hHor: 'α = 0°: horizontal throw',
      hDown: 'α < 0°: thrown downwards',
      hNone: 'Horizontal or downwards from the ground: no flight',
      hBest: 'α = 45° with h₀ = 0: largest range',
      hMoon: 'Moon: no air – no air resistance',
      hMoonDrag: 'Moon: no air – both paths are the same',
      hHigh: 'h₀ > 0: best range below 45°',
      hit: 'Hit!',
      short: 'too short',
      long: 'too far',
      shortLong: 'too short – below the target',
      longLong: 'too far – over the target',
      score: 'Hits: {h} of {n}',
      scoreText: '{h} hits in {n} throws',
      scoreNone: 'Set v₀ and α (or drag the arrow) and hit the target!',
      solTwo: 'Solutions: {a}° (flat) and {b}° (steep)',
      solOne: 'Solution: {a}°',
      solNone: 'out of reach with v₀ = {v} m/s – needs v₀ ≥ {m} m/s',
      solAir: 'solution angles without air resistance',
      aimTwo: 'Hit without air resistance with α ≈ {a}° (flat path) or α ≈ {b}° (steep path).',
      aimOne: 'Hit only with α ≈ {a}° – v₀ is just enough.',
      aimNone: 'With v₀ = {v} m/s the target is out of reach. Smallest launch speed needed: {m} m/s.',
      optText: 'no air: largest range at α ≈ {a}° (w ≈ {w} m)',
      optAir: 'with air: at α ≈ {a}° (w ≈ {w} m)',
      cmpText: 'range without air {w0} m, with air {w1} m (−{p} %) · apex {h0} m and {h1} m',
      superX: '<var>x</var>(<var>t</var>) = <var>v</var>₀ · cos <var>α</var> · <var>t</var> = {vx} m/s · <var>t</var> (uniform)',
      superY: '<var>y</var>(<var>t</var>) = <var>h</var>₀ + <var>v</var>₀ · sin <var>α</var> · <var>t</var> − ½ · <var>g</var> · <var>t</var>² = {h0}{vy} − {g2} m/s² · <var>t</var>² (vertical throw)',
      vert: 'vertical throw: <var>x</var> = 0',
      noFlight: 'no flight',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const mode = () => p.mode as Mode;
    const planet = () => PLANETS[p.planet as PlanetId];
    const obj = () => p.obj as ProjectileId;
    /** Luftwiderstandsbeiwert des gewählten Körpers am gewählten Ort. */
    const kAir = () => dragConstant(planet().rho, obj());
    /** Beiwert der Hauptbahn: im Modus „Luftwiderstand“ immer mit Luft, sonst nach Schalter. */
    const kMain = () => (mode() === 'drag' || p.air ? kAir() : 0);
    const C = {
      v: () => ctx.theme.series[3]!,
      x: () => ctx.theme.series[0]!,
      y: () => ctx.theme.series[1]!,
      path: () => ctx.theme.series[5]!,
      air: () => ctx.theme.series[4]!,
      good: () => ctx.theme.series[2]!,
    };

    /* ---------- Aufteilung der Bühne (gleitet beim Wechsel der Ansicht) ---------- */
    const chartsOf = (m: Mode): ChartKind[] => (m === 'parts' ? ['x', 'y', 'vx', 'vy'] : m === 'angles' ? ['range'] : m === 'drag' ? ['range', 'energy'] : []);
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const splitTarget = () => {
      const n = chartsOf(mode()).length;
      if (wide()) return n === 0 ? 1 : n === 4 ? (surface.width < 760 ? 0.46 : 0.56) : 0.6;
      return n === 0 ? 0.68 : 0.5;
    };
    let split = -1;
    const HIDDEN: Rect = { x: -20, y: -20, w: 1, h: 1 };

    function regions(): { scene: Rect; charts: Rect[]; tiles: Rect | null; gap: number } {
      const w = surface.width;
      const h = surface.height;
      const s = split < 0 ? splitTarget() : split;
      const kinds = chartsOf(mode());
      const gap = 8;
      if (wide()) {
        const sw = Math.round(w * s);
        const scene: Rect = { x: 0, y: 0, w: sw >= w - 4 ? w : sw, h };
        const col: Rect = { x: sw + 10, y: 0, w: w - sw - 10, h };
        if (col.w < 30 || !kinds.length) return { scene, charts: [], tiles: null, gap };
        return { scene, charts: gridRects(col, kinds.length, gap), tiles: null, gap };
      }
      const sh = Math.round(h * s);
      const scene: Rect = { x: 0, y: 0, w, h: sh };
      const rest: Rect = { x: 0, y: sh + gap, w, h: h - sh - gap };
      if (!kinds.length) return { scene, charts: [], tiles: rest, gap };
      return { scene, charts: gridRects(rest, kinds.length, gap), tiles: null, gap };
    }

    function gridRects(r: Rect, n: number, gap: number): Rect[] {
      if (n === 4) {
        const cw = (r.w - gap) / 2;
        const ch = (r.h - gap) / 2;
        return [0, 1, 2, 3].map((i) => ({ x: r.x + (i % 2) * (cw + gap), y: r.y + Math.floor(i / 2) * (ch + gap), w: cw, h: ch }));
      }
      const ch = (r.h - gap * (n - 1)) / n;
      return Array.from({ length: n }, (_, i) => ({ x: r.x, y: r.y + i * (ch + gap), w: r.w, h: ch }));
    }

    /* ---------- Koordinatensysteme ---------- */
    /** Unterkante der Anzeigen oben links (inkl. „y in m“) im letzten Bild: darüber keine Achsenzahlen. */
    let chipBottom = 0;
    const scene: Plot = new Plot(surface, {
      x: [-2, 30],
      y: [-2, 12],
      pan: false,
      zoom: false,
      controls: false,
      region: () => regions().scene,
      xAxis: { label: 'x in m' },
      yAxis: { label: '', format: (v: number): string => (scene.py(v) < chipBottom ? '' : fmt.num(v, 2)) },
    });
    const charts = [0, 1, 2, 3].map(
      (i) =>
        new Plot(surface, {
          x: [0, 1],
          y: [0, 1],
          equalAspect: false,
          pan: false,
          zoom: false,
          controls: false,
          region: () => regions().charts[i] ?? HIDDEN,
          xAxis: { label: ctx.t('axisT') },
          yAxis: { label: '' },
        }),
    );

    /* ---------- Zustand ---------- */
    let t = 0;
    let launch: Launch = { v0: p.v0, angle: p.angle, h0: p.h0, g: planet().g };
    let main: Flight = vacuumFlight(launch);
    let samples: FlightState[] | null = null;
    let vac: Flight = main;
    /** Ende der Hauptbahn (beim Treffer: an der Zielscheibe). */
    let endMain = main.time;
    let shot: { result: ShotResult; t: number; y: number } | null = null;
    let preview: Pt[] = [];
    let previewFrom: Pt[] | null = null;
    let family: { angle: number; pts: Pt[]; apex: Pt; range: number }[] = [];
    let rangeCurve: { vac: Pt[]; air: Pt[] | null; key: string } = { vac: [], air: null, key: '' };
    let optVac = { angle: 45, range: 0 };
    let optAir: { angle: number; range: number } | null = null;
    let solutions: { angle: number; pts: Pt[] }[] = [];
    /** Inhalt der Szene (Weltkoordinaten), aus dem der sichtbare Bereich berechnet wird. */
    let content = { xMax: 10, yMax: 5 };

    // Zielwurf
    let shots = 0;
    let hits = 0;
    let solved = false;
    let flying = false;
    let lastResult: ShotResult | null = null;

    // Übergänge
    const intro = new Tween(1100, ease.outCubic);
    const morph = new Tween(380, ease.inOutCubic);
    const fade = new Tween(520, ease.inOutCubic);
    const apexPop = new Tween(650, ease.outCubic);
    const landPop = new Tween(750, ease.outCubic);
    const resultPop = new Tween(600, ease.outBack);
    const flash = new Tween(700, ease.outCubic);
    let view: { x0: number; y0: number; s: number } | null = null;
    let dragging = false;
    let lastFrame = performance.now();

    const tEnd = () => Math.max(endMain, mode() === 'drag' ? vac.time : 0);

    /** Zustand der Hauptbahn zur Zeit tt (am Ende: auf dem Boden bzw. an der Scheibe). */
    function stateAt(tt: number): FlightState {
      const time = clamp(tt, 0, endMain);
      if (samples) return sampleAt(samples, time);
      const s = vacuumState(launch, time);
      return time >= main.time ? { ...s, y: 0 } : s;
    }
    /** Zustand ohne Luftwiderstand (Vergleichsball). */
    function ghostAt(tt: number): FlightState {
      const time = clamp(tt, 0, vac.time);
      const s = vacuumState(launch, time);
      return time >= vac.time ? { ...s, y: 0 } : s;
    }

    function trajectory(l: Launch, k: number, n: number, until = Infinity): Pt[] {
      if (k > 0) {
        const res = dragFlight(l, k, 0.01);
        const T = Math.min(res.flight.time, until);
        return Array.from({ length: n + 1 }, (_, i) => {
          const s = sampleAt(res.samples, (T * i) / n);
          return [s.x, Math.max(0, s.y)] as Pt;
        });
      }
      const f = vacuumFlight(l);
      const T = Math.min(f.time, until);
      return Array.from({ length: n + 1 }, (_, i) => {
        const s = vacuumState(l, (T * i) / n);
        return [s.x, i === n && T >= f.time ? 0 : s.y] as Pt;
      });
    }

    function compute(): void {
      const m = mode();
      launch = { v0: p.v0, angle: p.angle, h0: p.h0, g: planet().g };
      vac = vacuumFlight(launch);
      const k = kMain();
      if (k > 0) {
        const res = dragFlight(launch, k);
        samples = res.samples;
        main = res.flight;
      } else {
        samples = null;
        main = vac;
      }
      endMain = main.time;
      shot = null;
      if (m === 'target' && main.time > 0) {
        shot = judgeShot((tt) => (samples ? sampleAt(samples, tt) : vacuumState(launch, tt)), main.time, p.tx, p.ty);
        if (shot.result === 'hit') endMain = shot.t;
      }
      preview = Array.from({ length: PREVIEW_N + 1 }, (_, i) => {
        const s = stateAt((endMain * i) / PREVIEW_N);
        return [s.x, Math.max(0, s.y)] as Pt;
      });
      const showFamily = m === 'angles' || (m === 'throw' && p.family);
      family = showFamily
        ? FAMILY.map((angle) => {
            const l = { ...launch, angle };
            const pts = trajectory(l, k, 90);
            let apex = pts[0]!;
            for (const q of pts) if (q[1] > apex[1]) apex = q;
            return { angle, pts, apex, range: pts[pts.length - 1]![0] };
          })
        : [];
      // Wurfweite über dem Winkel (nur neu rechnen, wenn sich etwas Wesentliches ändert)
      if (m === 'angles' || m === 'drag') {
        const key = `${launch.v0}|${launch.h0}|${launch.g}|${m === 'drag' || p.air ? kAir() : 0}`;
        if (key !== rangeCurve.key) {
          const vacPts: Pt[] = [];
          for (let a = 0; a <= 90; a += 1) vacPts.push([a, vacuumFlight({ ...launch, angle: a }).range]);
          const ka = m === 'drag' || p.air ? kAir() : 0;
          let air: Pt[] | null = null;
          if (ka > 0) {
            air = [];
            for (let a = 0; a <= 90; a += 2) air.push([a, dragFlight({ ...launch, angle: a }, ka, 0.01).flight.range]);
          }
          rangeCurve = { vac: vacPts, air, key };
          optVac = optimalAngleWith(launch.v0, launch.h0, launch.g, 0);
          optAir = ka > 0 ? optimalAngleWith(launch.v0, launch.h0, launch.g, ka) : null;
        }
      }
      // Lösungswinkel beim Zielwurf
      solutions = m === 'target' ? aimAngles(launch.v0, p.tx, p.ty - launch.h0, launch.g).map((angle) => ({ angle, pts: trajectory({ ...launch, angle }, 0, 90, p.tx / Math.max(1e-6, launch.v0 * Math.cos(angle * RAD))) })) : [];
      // Inhalt für den sichtbaren Bereich
      let xMax = Math.max(main.range, 4);
      let yMax = Math.max(main.maxHeight, launch.h0, 2);
      if (m === 'drag' || (p.air && m === 'throw')) {
        xMax = Math.max(xMax, vac.range);
        yMax = Math.max(yMax, vac.maxHeight);
      }
      for (const f of family) {
        xMax = Math.max(xMax, f.range);
        yMax = Math.max(yMax, f.apex[1]);
      }
      if (m === 'target') {
        xMax = Math.max(xMax, p.tx + targetRadius(p.tx) + 1);
        yMax = Math.max(yMax, p.ty + targetRadius(p.tx) + 0.5);
        for (const s of solutions) for (const q of s.pts) yMax = Math.max(yMax, q[1]);
      }
      content = { xMax, yMax };
    }

    /* ---------- Sichtbarer Bereich (gleiche Einheiten, Boden unten) ---------- */
    const pxPerV = () => {
      const r = scene.rect;
      return clamp(Math.min(r.w, r.h) * 0.0095, 2.6, 4.6);
    };
    const towerPx = () => (launch.h0 > 0 ? 34 : 0);
    const railX = () => scene.px(0) - towerPx() - 44;

    function targetView(): { x0: number; y0: number; s: number } {
      const r = scene.rect;
      const small = r.w < 520;
      const PL = (small ? 30 : 44) + towerPx() + (mode() === 'parts' ? 52 : 0);
      const PR = small ? 22 : 34;
      const PB = small ? 26 : 32;
      let PT = small ? 64 : 58;
      // Platz für den Abwurfpfeil
      const a = launch.angle * RAD;
      const arrowUp = Math.max(0, Math.sin(a)) * launch.v0 * pxPerV() + 26;
      const arrowRight = Math.max(0, Math.cos(a)) * launch.v0 * pxPerV() + 70;
      let s = Math.min((r.w - PL - PR) / content.xMax, (r.h - PT - PB) / content.yMax);
      // Pfeilspitze über dem Abwurfpunkt muss ins Bild passen
      const headroom = r.h - PB - launch.h0 * s - PT * 0.4;
      if (arrowUp > headroom) {
        PT += arrowUp - headroom;
        s = Math.min((r.w - PL - PR) / content.xMax, (r.h - PT - PB) / Math.max(content.yMax, launch.h0 + 1e-6));
      }
      if (arrowRight > r.w - PL - PR) s = Math.min(s, (r.w - PL - PR) / content.xMax);
      s = Math.max(1e-3, s);
      return { x0: -PL / s, y0: -PB / s, s };
    }

    function applyView(): void {
      if (!view) return;
      const r = scene.rect;
      scene.setRange([view.x0, view.x0 + r.w / view.s], [view.y0, view.y0 + r.h / view.s]);
    }

    function stepView(dt: number): boolean {
      const target = targetView();
      if (!view || prefersReducedMotion()) {
        view = target;
        applyView();
        return false;
      }
      if (dragging) {
        // Beim Ziehen bleibt der Ausschnitt stehen, außer der Inhalt passt nicht mehr hinein
        const r = scene.rect;
        const fits = content.xMax <= view.x0 + r.w / view.s && content.yMax <= view.y0 + r.h / view.s;
        if (!fits) view = { ...view, s: Math.min(view.s, target.s) };
        applyView();
        return false;
      }
      const u = 1 - Math.exp(-dt * 7);
      const ls = Math.log(view.s) + (Math.log(target.s) - Math.log(view.s)) * u;
      // Ränder in Pixeln interpolieren, damit der Boden nicht wandert
      const pl = -view.x0 * view.s + (-target.x0 * target.s + view.x0 * view.s) * u;
      const pb = -view.y0 * view.s + (-target.y0 * target.s + view.y0 * view.s) * u;
      const s = Math.exp(ls);
      view = { x0: -pl / s, y0: -pb / s, s };
      const done = Math.abs(ls - Math.log(target.s)) < 0.002 && Math.abs(pl + target.x0 * target.s) < 0.3 && Math.abs(pb + target.y0 * target.s) < 0.3;
      if (done) view = target;
      applyView();
      return !done;
    }

    /* ---------- Ergebnisse ---------- */
    const n = (v: number, d: number) => fmt.num(v, d);
    /** Rechenergebnisse mit fester Stellenzahl (Zeiten 2, Strecken 2 bzw. 1 im Bild, Geschwindigkeiten 1). */
    const f = (v: number, d: number) => fmt.fixed(v, d);
    /** Aufgabenmodus: Momentanwerte im Bild verdecken, solange „Momentan“ verdeckt ist. */
    const hideNow = () => ctx.isHidden('now');
    const q = (v: string) => (hideNow() ? '?' : v);
    const planetName = () => ctx.t(p.planet as string);

    function updateNow(): void {
      const s = stateAt(t);
      ctx.readout('now', tr('now', { t: f(Math.min(t, endMain), 2), x: f(s.x, 2), y: f(Math.max(0, s.y), 2), v: f(speedOf(s), 1) }));
    }

    function updateReadouts(): void {
      const m = mode();
      if (main.time <= 0) {
        for (const key of ['time', 'range', 'height', 'impact', 'path', 'super']) ctx.readout(key, key === 'time' ? ctx.t('noFlight') : null);
      } else {
        ctx.readout('time', { html: launch.h0 === 0 && !samples ? `<var>T</var> = <span class="frac"><span>2 · <var>v</var>₀ · sin <var>α</var></span><span><var>g</var></span></span> ≈ <strong>${f(main.time, 2)} s</strong>` : `<var>T</var> ≈ <strong>${f(main.time, 2)} s</strong>` });
        ctx.readout('range', { html: launch.h0 === 0 && !samples ? `<var>w</var> = <span class="frac"><span><var>v</var>₀² · sin(2<var>α</var>)</span><span><var>g</var></span></span> ≈ <strong>${f(main.range, 2)} m</strong>` : `<var>w</var> ≈ <strong>${f(main.range, 2)} m</strong>` });
        ctx.readout('height', { html: !samples && launch.angle > 0 ? `<var>h</var><sub>max</sub> = <var>h</var>₀ + <span class="frac"><span>(<var>v</var>₀ · sin <var>α</var>)²</span><span>2<var>g</var></span></span> ≈ <strong>${f(main.maxHeight, 2)} m</strong>` : `<var>h</var><sub>max</sub> ≈ <strong>${f(main.maxHeight, 2)} m</strong>` });
        const iv = speedOf(main.impact);
        ctx.readout('impact', tr('speedAt', { v: f(iv, 1), a: f(-directionOf(main.impact), 0) }));
        if (samples) ctx.readout('path', null);
        else if (Math.abs(launch.angle) >= 89.5) ctx.readout('path', { html: ctx.t('vert') });
        else {
          const a = launch.angle * RAD;
          const c = launch.g / (2 * launch.v0 ** 2 * Math.cos(a) ** 2);
          const parts = [`−${n(c, 4)}<var>x</var>²`];
          const tan = Math.tan(a);
          if (Math.abs(tan) > 1e-9) parts.push(`${tan < 0 ? '−' : '+'} ${Math.abs(Math.abs(tan) - 1) < 1e-9 ? '' : n(Math.abs(tan), 3)}<var>x</var>`);
          if (launch.h0 > 0) parts.push(`+ ${n(launch.h0, 1)}`);
          ctx.readout('path', { html: `<var>y</var> = ${parts.join(' ')}` });
        }
        if (m === 'parts' && !samples) {
          const vx = launch.v0 * Math.cos(launch.angle * RAD);
          const vy = launch.v0 * Math.sin(launch.angle * RAD);
          const h0 = launch.h0 > 0 ? `${n(launch.h0, 1)} m ` : '';
          const vyT = Math.abs(vy) < 1e-9 ? '' : `${h0 ? (vy < 0 ? '− ' : '+ ') : vy < 0 ? '−' : ''}${f(Math.abs(vy), 2)} m/s · <var>t</var> `;
          ctx.readout('super', { html: `${tr('superX', { vx: f(Math.abs(vx) < 1e-9 ? 0 : vx, 2) })}<br>${tr('superY', { h0, vy: vyT, g2: n(launch.g / 2, 3) })}` });
        } else ctx.readout('super', null);
      }
      if ((m === 'angles' || m === 'drag') && rangeCurve.vac.length) {
        let html = tr('optText', { a: f(optVac.angle, 1), w: f(optVac.range, 2) });
        if (optAir) html += `<br>${tr('optAir', { a: f(optAir.angle, 1), w: f(optAir.range, 2) })}`;
        ctx.readout('opt', { html });
      } else ctx.readout('opt', null);
      if (m === 'drag' && vac.range > 0) {
        ctx.readout('cmp', tr('cmpText', { w0: f(vac.range, 2), w1: f(main.range, 2), p: f(Math.max(0, (1 - main.range / vac.range) * 100), 0), h0: f(vac.maxHeight, 2), h1: f(main.maxHeight, 2) }));
      } else ctx.readout('cmp', null);
      if (m === 'target') {
        ctx.readout('score', shots ? tr('scoreText', { h: String(hits), n: String(shots) }) : ctx.t('scoreNone'));
        const sol = solutions.map((s) => f(s.angle, 1));
        // Lösung erst, wenn sie auch im Bild steht (nach dem ersten Treffer oder mit „Lösungswinkel zeigen“)
        if (!solved && !p.sol) ctx.readout('aim', null);
        else ctx.readout('aim', sol.length === 2 ? tr('aimTwo', { a: sol[0]!, b: sol[1]! }) : sol.length === 1 ? tr('aimOne', { a: sol[0]! }) : tr('aimNone', { v: n(launch.v0, 1), m: f(minSpeed(p.tx, p.ty - launch.h0, launch.g), 1) }));
      } else {
        ctx.readout('score', null);
        ctx.readout('aim', null);
      }
      ctx.setAction('throw', { enabled: main.time > 0 });
      updateNow();
    }

    /* ---------- Ziehen im Bild ---------- */
    const idle = () => !ctx.locked && !ctx.clock.playing;
    const launchPx = (): Pt => [scene.px(0), scene.py(launch.h0)];
    /** Abwurfpfeil: Länge proportional zu v₀ (in Pixeln, unabhängig vom Maßstab). */
    scene.addHandle({
      get: () => {
        const [x0, y0] = launchPx();
        const a = launch.angle * RAD;
        const len = launch.v0 * pxPerV();
        return scene.toWorld(x0 + len * Math.cos(a), y0 - len * Math.sin(a));
      },
      set: (x, y) => {
        dragging = true;
        const [x0, y0] = launchPx();
        const dx = scene.px(x) - x0;
        const dy = y0 - scene.py(y);
        ctx.set({ v0: Math.hypot(dx, dy) / pxPerV(), angle: Math.round(Math.atan2(dy, dx) / RAD) });
      },
      enabled: () => idle() && t === 0,
      color: () => C.v(),
    });
    // Abwurfhöhe
    scene.addHandle({
      get: () => [0, launch.h0],
      set: (_x, y) => {
        dragging = true;
        ctx.set({ h0: Math.max(0, y) });
      },
      axis: 'y',
      enabled: () => idle() && t === 0,
      color: () => ctx.theme.series[4]!,
    });
    // Zielscheibe
    scene.addHandle({
      get: () => (mode() === 'target' ? [p.tx, p.ty] : [NaN, NaN]),
      set: (x, y) => {
        dragging = true;
        ctx.set({ tx: x, ty: Math.max(0, y) });
      },
      enabled: () => idle() && mode() === 'target',
      color: () => ctx.theme.series[1]!,
    });
    // Ball entlang der Bahn ziehen: Zeit einstellen
    scene.addHandle({
      get: () => {
        const s = stateAt(t);
        return [s.x, Math.max(0, s.y)];
      },
      set: (x, y) => {
        ctx.clock.pause();
        let best = 0;
        let bestD = Infinity;
        const steps = 240;
        for (let i = 0; i <= steps; i++) {
          const tt = (endMain * i) / steps;
          const s = stateAt(tt);
          const d = Math.hypot(scene.px(s.x) - scene.px(x), scene.py(Math.max(0, s.y)) - scene.py(y));
          if (d < bestD) [best, bestD] = [tt, d];
        }
        t = Math.max(1e-6, best);
        finishPops();
        updateNow();
      },
      enabled: () => idle() && t > 0 && mode() !== 'target',
      color: () => C.path(),
    });

    // Diagramme antippen oder darüberziehen: Zeit bzw. Winkel einstellen
    function chartHit(px: number, py: number): number {
      const reg = regions().charts;
      return reg.findIndex((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h);
    }
    let chartDrag = -1;
    function chartSet(i: number, px: number): void {
      const kind = chartsOf(mode())[i];
      if (!kind) return;
      const x = charts[i]!.toWorld(px, 0)[0];
      if (kind === 'range') {
        ctx.set({ angle: clamp(Math.round(x), 0, 90) });
        return;
      }
      ctx.clock.pause();
      t = clamp(x, 0, tEnd());
      if (t <= 0) t = 1e-6;
      finishPops();
      updateNow();
      ctx.requestRender();
    }
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && chartHit(px, py) >= 0 && tEnd() > 0,
      pointerDown: (q: { px: number; py: number }) => {
        const i = chartHit(q.px, q.py);
        if (i < 0 || ctx.locked || tEnd() <= 0) return false;
        chartDrag = i;
        chartSet(i, q.px);
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (chartDrag >= 0) chartSet(chartDrag, q.px);
      },
      pointerUp: () => {
        chartDrag = -1;
      },
      hover: (q: { px: number; py: number } | null) => surface.setCursor(q && chartHit(q.px, q.py) >= 0 ? 'ew-resize' : ''),
      wheel: () => false,
    });

    const release = () => {
      if (!dragging) return;
      dragging = false;
      ctx.requestRender();
    };
    surface.canvas.addEventListener('pointerup', release);
    surface.canvas.addEventListener('pointercancel', release);

    function finishPops(): void {
      apexPop.finish();
      landPop.finish();
      flash.finish();
    }

    /* ---------- Zeichenhilfen ---------- */
    /** Text mit tiefgestellten Teilen: „v_{y} = 3 m/s“. */
    function parts(str: string): { t: string; sub: boolean }[] {
      const out: { t: string; sub: boolean }[] = [];
      const re = /_\{([^}]*)\}/g;
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

    /** Beschriftung, die innerhalb des Rechtecks r bleibt. */
    function clampedText(str: string, x: number, y: number, size: number, color: string, r: Rect, align: CanvasTextAlign = 'center'): void {
      const w = richWidth(str, size);
      let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      left = clamp(left, r.x + 6, r.x + r.w - w - 6);
      richText(str, left, clamp(y, r.y + size, r.y + r.h - size), size, color, 'left');
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid?: string): { w: number; h: number } {
      const g = surface.g;
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1;
      g.fillStyle = solid ?? (theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!solid) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, solid ? '#ffffff' : color, 'center', false);
      return { w, h };
    }

    function frame(r: Rect): void {
      const g = surface.g;
      g.save();
      g.strokeStyle = ctx.theme.dark ? '#273142' : '#dfe4ec';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 10);
      g.stroke();
      g.restore();
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 10): void {
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
      g.lineTo(x1 - ux * h - uy * h * 0.5, y1 - uy * h + ux * h * 0.5);
      g.lineTo(x1 - ux * h + uy * h * 0.5, y1 - uy * h - ux * h * 0.5);
      g.closePath();
      g.fill();
    }

    /** Polylinie in Pixeln, nur ein Anteil `frac` (0…1) der Punkte. */
    function pathPx(pts: Pt[], frac = 1): void {
      const g = surface.g;
      const last = Math.max(1, (pts.length - 1) * clamp(frac, 0, 1));
      const iMax = Math.floor(last);
      g.beginPath();
      for (let i = 0; i <= iMax && i < pts.length; i++) {
        const [x, y] = pts[i]!;
        if (i === 0) g.moveTo(scene.px(x), scene.py(y));
        else g.lineTo(scene.px(x), scene.py(y));
      }
      if (iMax < pts.length - 1 && last > iMax) {
        const a = pts[iMax]!;
        const b = pts[iMax + 1]!;
        const u = last - iMax;
        g.lineTo(scene.px(lerp(a[0], b[0], u)), scene.py(lerp(a[1], b[1], u)));
      }
    }

    function strokePath(pts: Pt[], color: string, width: number, dash: number[] = [], alpha = 1, frac = 1): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= alpha;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.setLineDash(dash);
      pathPx(pts, frac);
      g.stroke();
      g.restore();
    }

    /* ---------- Szene: Hintergrund, Turm, Ball ---------- */
    function drawBackground(r: Rect): void {
      const g = surface.g;
      const id = p.planet as PlanetId;
      const groundY = clamp(scene.py(0), r.y, r.y + r.h);
      const colors = GROUND[id];
      const img = ctx.images.get(id);
      const sky: Rect = { x: r.x, y: r.y, w: r.w, h: groundY - r.y };
      if (img && sky.h > 2) {
        // Horizont des Bildes liegt am unteren Bildrand → auf den Boden setzen
        const k = Math.max(sky.w / img.width, sky.h / img.height);
        const w = img.width * k;
        const h = img.height * k;
        g.drawImage(scaledSprite(img, w, h, surface.dpr), sky.x + (sky.w - w) / 2, groundY - h, w, h);
        if (ctx.theme.dark) {
          g.fillStyle = 'rgba(5,10,20,0.32)';
          g.fillRect(sky.x, sky.y, sky.w, sky.h);
        }
      } else {
        const grad = g.createLinearGradient(0, r.y, 0, groundY);
        const [c0, c1] = ctx.theme.dark ? colors.skyDark : colors.sky;
        grad.addColorStop(0, c0);
        grad.addColorStop(1, c1);
        g.fillStyle = grad;
        g.fillRect(sky.x, sky.y, sky.w, sky.h);
        if (id === 'mond' || ctx.theme.dark) {
          // Sterne (fest verteilt)
          g.fillStyle = id === 'mond' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.35)';
          for (let i = 0; i < 70; i++) {
            const sx = r.x + ((i * 97.3) % r.w);
            const sy = r.y + ((i * 53.7) % Math.max(1, sky.h * 0.85));
            const big = i % 7 === 0 ? 2 : 1;
            g.fillRect(sx, sy, big, big);
          }
        } else {
          // ferne Hügel als Ersatz für das Foto
          g.fillStyle = id === 'erde' ? 'rgba(80,140,90,0.35)' : 'rgba(150,80,50,0.3)';
          g.beginPath();
          g.moveTo(r.x, groundY);
          for (let x = 0; x <= r.w; x += 8) g.lineTo(r.x + x, groundY - 14 - 10 * Math.sin(x / 70) - 6 * Math.sin(x / 23 + 1));
          g.lineTo(r.x + r.w, groundY);
          g.fill();
        }
      }
      const ground = g.createLinearGradient(0, groundY, 0, r.y + r.h);
      ground.addColorStop(0, ctx.theme.dark ? shade(colors.top, -0.25) : colors.top);
      ground.addColorStop(1, ctx.theme.dark ? shade(colors.bottom, -0.3) : colors.bottom);
      g.fillStyle = ground;
      g.fillRect(r.x, groundY, r.w, r.y + r.h - groundY);
      g.fillStyle = 'rgba(255,255,255,0.2)';
      g.fillRect(r.x, groundY, r.w, 1.5);
    }

    function drawTower(): void {
      if (launch.h0 <= 0) {
        // kleine Abwurfplatte am Boden
        const g = surface.g;
        const x0 = scene.px(0);
        const y0 = scene.py(0);
        g.fillStyle = ctx.theme.dark ? '#6d727b' : '#8a8f98';
        roundRect(g, x0 - 14, y0 - 3, 20, 5, 2);
        g.fill();
        return;
      }
      const g = surface.g;
      const x0 = scene.px(0);
      const top = scene.py(launch.h0);
      const bottom = scene.py(0);
      const w = towerPx() - 6;
      const grad = g.createLinearGradient(x0 - w, 0, x0, 0);
      grad.addColorStop(0, ctx.theme.dark ? '#5a5f68' : '#8a8f98');
      grad.addColorStop(1, ctx.theme.dark ? '#7d828a' : '#b9bec6');
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.25)';
      g.shadowBlur = 8;
      g.shadowOffsetX = 2;
      g.fillStyle = grad;
      g.fillRect(x0 - w, top, w, bottom - top);
      g.restore();
      g.strokeStyle = 'rgba(0,0,0,0.18)';
      g.lineWidth = 1;
      const rowH = 9;
      g.beginPath();
      for (let y = top + rowH, row = 0; y < bottom; y += rowH, row++) {
        g.moveTo(x0 - w, y);
        g.lineTo(x0, y);
        for (let x = x0 - w + (row % 2 ? 7 : 14); x < x0; x += 14) {
          g.moveTo(x, y - rowH);
          g.lineTo(x, y);
        }
      }
      g.stroke();
      g.fillStyle = ctx.theme.dark ? '#4d525b' : '#6d727b';
      g.fillRect(x0 - w - 3, top - 4, w + 6, 5);
      // Höhenmaß h₀
      const mx = x0 - w - 10;
      g.strokeStyle = withAlpha(ctx.theme.series[4]!, 0.85);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(mx, top);
      g.lineTo(mx, bottom);
      g.moveTo(mx - 4, top);
      g.lineTo(mx + 4, top);
      g.moveTo(mx - 4, bottom);
      g.lineTo(mx + 4, bottom);
      g.stroke();
      if (bottom - top > 30 && mode() !== 'parts') clampedText(`h_{0} = ${n(launch.h0, 1)} m`, mx - 6, (top + bottom) / 2, 11, ctx.theme.series[4]!, scene.rect, 'right');
    }

    function ballRadius(): number {
      const small = scene.rect.w < 520;
      const k = mode() === 'drag' || p.air ? obj() : 'fb';
      return (k === 'tt' ? 6 : k === 'kugel' ? 8 : 9) * (small ? 0.85 : 1);
    }

    function drawBall(x: number, y: number, alpha = 1, spin = t): void {
      const g = surface.g;
      const R = ballRadius();
      const [px, py0] = scene.toPx(x, Math.max(0, y));
      const py = py0 - R + 1;
      const kind = mode() === 'drag' || p.air ? obj() : 'fb';
      g.save();
      g.globalAlpha *= alpha;
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      // Fotos: Fußball, Tischtennisball, Stoßkugel (drehen sich im Flug)
      const img = ctx.images.get(kind === 'fb' ? 'ball' : kind);
      if (img) {
        g.translate(px, py);
        g.rotate(spin * 6);
        g.drawImage(scaledSprite(img, 2 * R, 2 * R, surface.dpr), -R, -R, 2 * R, 2 * R);
      } else if (kind === 'fb') {
        const grad = g.createRadialGradient(px - 3, py - 3, 1, px, py, R);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(1, '#c9ced6');
        g.fillStyle = grad;
        g.beginPath();
        g.arc(px, py, R, 0, Math.PI * 2);
        g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = '#2b2f36';
        g.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = spin * 6 + (i * 2 * Math.PI) / 5;
          const qx = px + Math.cos(a) * R * 0.4;
          const qy = py + Math.sin(a) * R * 0.4;
          if (i === 0) g.moveTo(qx, qy);
          else g.lineTo(qx, qy);
        }
        g.closePath();
        g.fill();
      } else {
        const grad = g.createRadialGradient(px - R * 0.35, py - R * 0.4, R * 0.1, px, py, R);
        if (kind === 'tt') {
          grad.addColorStop(0, '#fffaf0');
          grad.addColorStop(1, '#f2a65a');
        } else {
          grad.addColorStop(0, '#e8ecf1');
          grad.addColorStop(0.4, '#8b939e');
          grad.addColorStop(1, '#2f353d');
        }
        g.fillStyle = grad;
        g.beginPath();
        g.arc(px, py, R, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    /* ---------- Szene: Bahnen ---------- */
    function morphed(): Pt[] {
      if (!previewFrom || !morph.running) return preview;
      const u = morph.value;
      return preview.map((q, i) => {
        const a = previewFrom![i] ?? q;
        return [lerp(a[0], q[0], u), lerp(a[1], q[1], u)] as Pt;
      });
    }

    function donePath(fn: (tt: number) => FlightState, upTo: number): Pt[] {
      const N = 120;
      return Array.from({ length: N + 1 }, (_, i) => {
        const s = fn((upTo * i) / N);
        return [s.x, Math.max(0, s.y)] as Pt;
      });
    }

    function drawStrobe(fn: (tt: number) => FlightState, upTo: number, color: string, hollow = true): void {
      if (!p.strobe || upTo <= 0) return;
      const g = surface.g;
      const dt = strobeInterval(tEnd());
      g.strokeStyle = color;
      g.fillStyle = withAlpha(color, 0.25);
      g.lineWidth = 1.6;
      for (let k = 0; k * dt <= upTo + 1e-9; k++) {
        const s = fn(k * dt);
        const [x, y] = scene.toPx(s.x, Math.max(0, s.y));
        g.beginPath();
        g.arc(x, y - ballRadius() + 1, 3.6, 0, Math.PI * 2);
        if (!hollow) g.fill();
        g.stroke();
      }
    }

    function drawFamily(r: Rect, alpha: number): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      for (const f of family) {
        const current = Math.abs(f.angle - launch.angle) < 0.5;
        strokePath(f.pts, current ? C.path() : theme.text, current ? 2.5 : 1.6, current ? [] : [5, 4], alpha * (current ? 0.9 : 0.42));
      }
      // Beschriftung am Scheitel (30° und 60° landen am selben Punkt)
      for (const f of family) {
        const [x, y] = scene.toPx(f.apex[0], f.apex[1]);
        if (y < r.y + 50) continue;
        const g = surface.g;
        g.save();
        g.globalAlpha *= alpha;
        richText(`${f.angle}°`, clamp(x, r.x + 20, r.x + r.w - 20), y - 10, small ? 11 : 12, theme.text, 'center');
        g.restore();
      }
      // gleiche Weite markieren (nur ohne Abwurfhöhe und ohne Luft)
      if (launch.h0 === 0 && kMain() === 0 && family.length) {
        const g = surface.g;
        g.save();
        g.globalAlpha *= alpha;
        for (const [a, b] of [
          [30, 60],
          [15, 75],
        ] as const) {
          const f = family.find((q) => q.angle === a)!;
          const [x, y] = scene.toPx(f.range, 0);
          g.fillStyle = theme.text;
          g.beginPath();
          g.arc(x, y, 3.5, 0, Math.PI * 2);
          g.fill();
          if (!small) richText(`${a}° = ${b}°`, x, y - 14, small ? 11 : 11.5, theme.text, 'center');
        }
        g.restore();
      }
    }

    function drawTarget(r: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const [cx, cy] = scene.toPx(p.tx, p.ty);
      const R = Math.max(6, targetRadius(p.tx) * scene.scale.x);
      const ground = scene.py(0);
      // Scheibe schräg von vorn gesehen: schmale Ellipse
      const rx = Math.max(4, R * 0.42);
      const targetImg = ctx.images.get('target');
      if (targetImg) {
        // Foto, in der Breite gestaucht (Schrägblick); nur der gleichförmige Pfosten wird bis zum Boden gestreckt
        const T = TARGET_IMG;
        const kx = rx / T.r;
        const ky = R / T.r;
        const w = T.w * kx;
        const postTop = cy + (T.post - T.cy) * ky;
        if (ground > postTop) {
          const pc = { x: T.postX[0], y: T.post, w: T.postX[1] - T.postX[0], h: T.h - T.post };
          const pw = pc.w * kx;
          g.drawImage(scaledSprite(targetImg, Math.max(1, pw), Math.max(1, ground - postTop), surface.dpr, { crop: pc }), cx + (T.postX[0] - T.cx) * kx, postTop, pw, ground - postTop);
        }
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.3)';
        g.shadowBlur = 6;
        g.shadowOffsetX = 2;
        const dh = T.post * ky;
        g.drawImage(scaledSprite(targetImg, w, dh, surface.dpr, { crop: { x: 0, y: 0, w: T.w, h: T.post } }), cx - T.cx * kx, cy - T.cy * ky, w, dh);
        g.restore();
      } else {
        // Pfahl
        g.fillStyle = theme.dark ? '#7a5d3f' : '#8d6a45';
        g.fillRect(cx - 2.5, cy, 5, ground - cy);
        // Scheibe mit Ringen
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.3)';
        g.shadowBlur = 6;
        g.shadowOffsetX = 2;
        const rings = ['#ffffff', '#d6336c', '#ffffff', '#d6336c'];
        rings.forEach((c, i) => {
          const k = 1 - i * 0.24;
          g.fillStyle = c;
          g.beginPath();
          g.ellipse(cx, cy, rx * k, R * k, 0, 0, Math.PI * 2);
          g.fill();
          if (i === 0) g.shadowColor = 'transparent';
        });
        g.restore();
        g.strokeStyle = 'rgba(0,0,0,0.35)';
        g.lineWidth = 1;
        g.beginPath();
        g.ellipse(cx, cy, rx, R, 0, 0, Math.PI * 2);
        g.stroke();
      }
      // Treffer-Blitz
      if (flash.running && lastResult === 'hit') {
        const u = flash.value;
        g.strokeStyle = withAlpha(C.good(), 0.9 * (1 - u));
        g.lineWidth = 3;
        g.beginPath();
        g.arc(cx, cy, R + 4 + u * 30, 0, Math.PI * 2);
        g.stroke();
      }
      // Maße des Ziels
      const label = `${n(p.tx, 1)} m | ${n(p.ty, 1)} m`;
      clampedText(label, cx + R * 0.5 + 8, cy - R - 10, r.w < 520 ? 11 : 12, theme.series[1]!, r, 'left');
    }

    /* ---------- Szene: Zerlegung (Schatten auf den Achsen) ---------- */
    function drawShadows(r: Rect, s: FlightState): void {
      const g = surface.g;
      const ground = scene.py(0);
      const rx = railX();
      const top = r.y + 54;
      const [bx, by0] = scene.toPx(s.x, Math.max(0, s.y));
      const by = by0 - ballRadius() + 1;
      // senkrechte Schiene für den y-Schatten
      g.strokeStyle = withAlpha(C.y(), 0.55);
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(rx, top);
      g.lineTo(rx, ground);
      g.stroke();
      // Stroboskop-Bilder der Schatten
      if (p.strobe && t > 0) {
        const dt = strobeInterval(tEnd());
        for (let k = 0; k * dt <= Math.min(t, endMain) + 1e-9; k++) {
          const q = stateAt(k * dt);
          g.fillStyle = withAlpha(C.x(), 0.45);
          g.beginPath();
          g.arc(scene.px(q.x), ground, 3, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = withAlpha(C.y(), 0.45);
          g.beginPath();
          g.arc(rx, scene.py(Math.max(0, q.y)), 3, 0, Math.PI * 2);
          g.fill();
        }
      }
      // Lotlinien vom Ball zu den Schatten
      g.setLineDash([3, 4]);
      g.lineWidth = 1.2;
      g.strokeStyle = withAlpha(C.x(), 0.7);
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(bx, ground);
      g.stroke();
      g.strokeStyle = withAlpha(C.y(), 0.7);
      g.beginPath();
      g.moveTo(bx, by);
      g.lineTo(rx, by);
      g.stroke();
      g.setLineDash([]);
      // Schattenbälle
      for (const [x, y, c] of [
        [bx, ground - 1, C.x()],
        [rx, by, C.y()],
      ] as const) {
        g.save();
        g.shadowColor = withAlpha(c, 0.6);
        g.shadowBlur = 8;
        g.fillStyle = c;
        g.beginPath();
        g.arc(x, y, 6, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.strokeStyle = '#ffffff';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(x, y, 6, 0, Math.PI * 2);
        g.stroke();
      }
      const small = r.w < 520;
      // x-Wert als Etikett auf der Zahlenleiste (verdeckt die Achsenzahlen darunter, statt sie zu überlappen)
      pill(clamp(bx, r.x + 44, r.x + r.w - 44), ground + 4, `x = ${q(f(s.x, 1))} m`, C.x(), 'center', small ? 11 : 12);
      pill(rx - 6, clamp(by - 30, top + 4, ground - 30), `y = ${q(f(Math.max(0, s.y), 1))} m`, C.y(), 'left', 11);
    }

    /* ---------- Szene: Pfeile ---------- */
    function drawLaunchArrow(r: Rect): void {
      const theme = ctx.theme;
      const [x0, y0] = launchPx();
      const a = launch.angle * RAD;
      const grow = intro.running ? ease.outBack(clamp((intro.t - 0.25) / 0.75, 0, 1)) : 1;
      const len = launch.v0 * pxPerV() * grow;
      const tipX = x0 + len * Math.cos(a);
      const tipY = y0 - len * Math.sin(a);
      const g = surface.g;
      // Waagerechte als Bezug und Winkelbogen
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.lineWidth = 1;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x0 + Math.max(40, len * 0.9), y0);
      g.stroke();
      g.setLineDash([]);
      if (Math.abs(a) > 0.01) {
        g.strokeStyle = C.v();
        g.lineWidth = 2;
        g.beginPath();
        g.arc(x0, y0, 30, -Math.max(0, a), -Math.min(0, a));
        g.stroke();
      }
      arrowPx(x0, y0, tipX, tipY, C.v(), 3.5, 12);
      const small = r.w < 520;
      const fs = small ? 11 : 12.5;
      clampedText(`v_{0} = ${n(launch.v0, 1)} m/s`, tipX + 10, tipY - 12, fs, C.v(), r, 'left');
      const mid = a / 2;
      richText(`α = ${n(launch.angle, 0)}°`, x0 + 38 * Math.cos(mid), y0 - 38 * Math.sin(mid) + (a < 0 ? 6 : -2), fs, C.v(), 'left');
    }

    function drawVectors(r: Rect, s: FlightState): void {
      const k = pxPerV();
      const [bx, by0] = scene.toPx(s.x, Math.max(0, s.y));
      const by = by0 - ballRadius() + 1;
      const ex = bx + s.vx * k;
      const ey = by - s.vy * k;
      const small = r.w < 520;
      const fs = small ? 11 : 12.5;
      arrowPx(bx, by, ex, by, C.x(), 2.6, 9);
      arrowPx(bx, by, bx, ey, C.y(), 2.6, 9);
      const g = surface.g;
      g.strokeStyle = withAlpha(ctx.theme.text, 0.35);
      g.lineWidth = 1;
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(ex, by);
      g.lineTo(ex, ey);
      g.lineTo(bx, ey);
      g.stroke();
      g.setLineDash([]);
      arrowPx(bx, by, ex, ey, C.v(), 3.2, 11);
      // fällt der Ball, steht vₓ oberhalb und v unterhalb des Pfeils (und umgekehrt)
      const down = ey >= by;
      if (Math.abs(s.vx * k) > 14) clampedText(`v_{x} = ${q(f(s.vx, 1))} m/s`, ex + 6, down ? by - 12 : by + 13, fs, C.x(), r, 'left');
      if (Math.abs(s.vy * k) > 10) clampedText(`v_{y} = ${q(f(s.vy, 1))} m/s`, bx - 8, (by + ey) / 2, fs, C.y(), r, 'right');
      else if (Math.abs(s.vy) < 1) clampedText(ctx.t('apex'), bx, by - 24, fs, C.y(), r, 'center');
      clampedText(`v = ${q(f(speedOf(s), 1))} m/s`, ex + 8, down ? ey + 14 : ey - 10, fs, C.v(), r, 'left');
    }

    /* ---------- Szene: Markierungen und Anzeigen ---------- */
    function drawMarkers(r: Rect): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const fs = small ? 11 : 12.5;
      const g = surface.g;
      // Scheitel
      if (main.apexTime > 0 && t >= main.apexTime && endMain >= main.apexTime) {
        const u = apexPop.running ? apexPop.value : 1;
        const apex = stateAt(main.apexTime);
        const [ax, ay] = scene.toPx(apex.x, apex.y);
        const gy = scene.py(0);
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 1.4;
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(ax, gy);
        g.lineTo(ax, lerp(gy, ay, u));
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = theme.text;
        g.beginPath();
        g.arc(ax, ay, 3.5 * u, 0, Math.PI * 2);
        g.fill();
        if (mode() !== 'angles') clampedText(`${ctx.t('height')}: ${ctx.isHidden('height') ? '?' : f(main.maxHeight * u, 2)} m`, ax, ay - 20, fs, theme.text, r, 'center');
      }
      // Wurfweite
      if (main.time > 0 && t >= endMain && !(shot?.result === 'hit')) {
        const u = landPop.running ? landPop.value : 1;
        const y = scene.py(0);
        const x0 = scene.px(0);
        const x1 = scene.px(main.range * u);
        g.strokeStyle = C.good();
        g.lineWidth = 4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x0, y + 1);
        g.lineTo(x1, y + 1);
        g.stroke();
        for (const x of [x0, x1]) {
          g.beginPath();
          g.moveTo(x, y - 6);
          g.lineTo(x, y + 7);
          g.stroke();
        }
        if (main.range > 0.01) clampedText(`${ctx.t('range')}: ${ctx.isHidden('range') ? '?' : f(main.range * u, 2)} m`, (x0 + x1) / 2, y - 16, fs + 0.5, C.good(), r, 'center');
        // Aufprallring
        if (landPop.running) {
          g.strokeStyle = withAlpha(theme.text, 0.6 * (1 - landPop.value));
          g.lineWidth = 2;
          g.beginPath();
          g.ellipse(x1, y, 6 + landPop.value * 26, 2 + landPop.value * 6, 0, Math.PI, 0);
          g.stroke();
        }
      }
    }

    function hint(): string | null {
      const m = mode();
      if (main.time <= 0) return ctx.t('hNone');
      if (p.planet === 'mond' && m === 'drag') return ctx.t('hMoonDrag');
      if (p.planet === 'mond' && p.air) return ctx.t('hMoon');
      if (launch.angle === 90) return ctx.t('hVert');
      if (launch.angle === 0) return ctx.t('hHor');
      if (launch.angle < 0) return ctx.t('hDown');
      if (launch.h0 === 0 && launch.angle === 45 && kMain() === 0) return ctx.t('hBest');
      if (m === 'angles' && launch.h0 > 0) return ctx.t('hHigh');
      return null;
    }

    function drawChips(r: Rect): number {
      const theme = ctx.theme;
      const small = r.w < 520;
      const size = small ? 11 : 12;
      const s = stateAt(t);
      const row = size + 17;
      const tw = pill(r.x + 8, r.y + 8, `t = ${q(f(Math.min(t, tEnd()), 2))} s`, theme.text, 'left').w;
      const gLabel = `${small ? '' : `${planetName()} · `}${tr('g', { g: n(planet().g, 2) })}`;
      pill(r.x + r.w - 8, r.y + 8, gLabel, theme.text, 'right', size);
      if (!small && mode() !== 'parts') pill(r.x + 8 + tw + 6, r.y + 8, `v = ${q(f(speedOf(s), 1))} m/s`, C.v(), 'left', size);
      let y = r.y + 8 + row;
      // Legende im Modus „Luftwiderstand“ (bzw. Wurf mit Luft)
      if (mode() === 'drag' || (p.air && mode() === 'throw' && kMain() > 0)) {
        const w1 = pill(r.x + 8, y, `— ${ctx.t('withAir')} (${ctx.t(obj())})`, C.air(), 'left', size).w;
        if (r.w - w1 > 150) pill(r.x + 8 + w1 + 6, y, `- - ${ctx.t('vacuum')}`, C.path(), 'left', size);
        else {
          y += row;
          pill(r.x + 8, y, `- - ${ctx.t('vacuum')}`, C.path(), 'left', size);
        }
        y += row;
      }
      // Zielwurf: Zähler, Ergebnis, Lösungen
      if (mode() === 'target') {
        if (!small) pill(r.x + r.w - 8, r.y + 8 + row, tr('score', { h: String(hits), n: String(shots) }), C.good(), 'right', size);
        if (lastResult) {
          const u = resultPop.running ? resultPop.value : 1;
          const label = lastResult === 'hit' ? ctx.t('hit') : ctx.t(small ? lastResult : `${lastResult}Long`);
          const color = lastResult === 'hit' ? C.good() : ctx.theme.series[1]!;
          const g = surface.g;
          g.save();
          const cx = r.x + r.w / 2;
          const cy = r.y + r.h * 0.3;
          g.translate(cx, cy);
          g.scale(u, u);
          pill(0, -14, label, color, 'center', small ? 14 : 17, color);
          g.restore();
        }
        if (solved || p.sol) {
          const label = solutions.length === 2 ? tr('solTwo', { a: f(solutions[0]!.angle, 1), b: f(solutions[1]!.angle, 1) }) : solutions.length === 1 ? tr('solOne', { a: f(solutions[0]!.angle, 1) }) : tr('solNone', { v: n(launch.v0, 1), m: f(minSpeed(p.tx, p.ty - launch.h0, launch.g), 1) });
          pill(r.x + 8, y, label, theme.series[4]!, 'left', size);
          y += row;
          if (kMain() > 0) {
            pill(r.x + 8, y, ctx.t('solAir'), theme.muted, 'left', size);
            y += row;
          }
        }
      }
      const h = hint();
      if (h) {
        pill(r.x + 8, y, h, theme.series[4]!, 'left', size);
        y += row;
      }
      // Beschriftung der Hochachse unter den Anzeigen
      const ax = scene.px(0);
      const fsY = small ? 11 : 12;
      if (ax > r.x && ax < r.x + r.w - 40) {
        const left = ax - 7 - richWidth('y in m', fsY, 600) > r.x + 4;
        richText('y in m', left ? ax - 7 : ax + 7, y + 8, fsY, theme.axis, left ? 'right' : 'left', true, 600);
      }
      return y;
    }

    function drawScene(r: Rect): void {
      const theme = ctx.theme;
      const g = scene.begin();
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawBackground(r);
      scene.axes();
      drawTower();
      const m = mode();
      const modeAlpha = fade.running ? fade.value : 1;
      const s = stateAt(t);
      if (family.length) drawFamily(r, modeAlpha);
      // Vergleichsbahn ohne Luft
      const showVac = m === 'drag' || (m === 'throw' && kMain() > 0);
      if (showVac && main.time > 0) {
        strokePath(trajectory(launch, 0, 140), C.path(), 1.8, [7, 6], 0.75 * modeAlpha);
        if (m === 'drag' && t > 0) {
          strokePath(donePath(ghostAt, Math.min(t, vac.time)), C.path(), 2.6, [], 0.9);
          drawStrobe(ghostAt, Math.min(t, vac.time), C.path());
        }
      }
      // Lösungsbahnen beim Zielwurf
      if (m === 'target') {
        if ((solved || p.sol) && solutions.length) for (const q of solutions) strokePath(q.pts, theme.series[4]!, 2, [2, 5], 0.85);
        drawTarget(r);
      }
      // Hauptbahn: vorausberechnet (gestrichelt) und zurückgelegt
      const color = kMain() > 0 ? C.air() : C.path();
      if (main.time > 0) {
        const reveal = intro.running ? intro.value : 1;
        strokePath(morphed(), color, 1.8, [3, 5], 0.6, reveal);
        if (t > 0) strokePath(donePath(stateAt, Math.min(t, endMain)), color, 3.2);
        drawStrobe(stateAt, Math.min(t, endMain), color);
      }
      drawMarkers(r);
      if (m === 'parts' && main.time > 0) drawShadows(r, s);
      if (m === 'drag' && t > 0) drawBall(ghostAt(t).x, ghostAt(t).y, 0.75, Math.min(t, vac.time));
      if (t === 0 && !ctx.clock.playing) drawLaunchArrow(r);
      else if (p.vectors && t < endMain) drawVectors(r, s);
      drawBall(s.x, s.y);
      chipBottom = drawChips(r) + 18;
      if (wide() && chartsOf(m).length === 0) drawInfoCard(r, s);
      g.restore();
      scene.end();
      // Rahmen
      g.strokeStyle = theme.dark ? '#273142' : '#dfe4ec';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
    }

    /* ---------- Diagramme ---------- */
    const chartTitle = (kind: ChartKind) => ({ x: 'tX', y: 'tY', vx: 'tVX', vy: 'tVY', range: 'tRange', energy: 'tEnergy' })[kind];
    const chartColor = (kind: ChartKind) => (kind === 'x' || kind === 'vx' ? C.x() : kind === 'y' || kind === 'vy' ? C.y() : C.path());

    function curvePts(fn: (tt: number) => number, from: number, to: number, nPts = 120): Pt[] {
      return Array.from({ length: nPts + 1 }, (_, i) => {
        const tt = from + ((to - from) * i) / nPts;
        return [tt, fn(tt)] as Pt;
      });
    }

    function chartPad(R: Rect): { left: number; right: number; top: number; bottom: number } {
      const small = R.w < 300;
      return { left: small ? 38 : 46, right: small ? 10 : 14, top: small ? 30 : 34, bottom: small ? 22 : 26 };
    }

    function titleChip(R: Rect, label: string, color: string, right?: string, rightColor?: string): void {
      const g = surface.g;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const x = R.x + 8;
      const y = R.y + 6;
      const w = richWidth(label, fs) + 14;
      g.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
      roundRect(g, x, y, w, fs + 9, 6);
      g.fill();
      richText(label, x + 7, y + (fs + 9) / 2 + 0.5, fs, color, 'left', false);
      if (right) {
        const wr = richWidth(right, fs - 0.5, 600);
        if (x + w + wr + 16 < R.x + R.w) richText(right, R.x + R.w - 10, y + (fs + 9) / 2 + 0.5, fs - 0.5, rightColor ?? ctx.theme.muted, 'right', false, 600);
      }
    }

    function timeCursor(plot: Plot, value: number, color: string): void {
      const tt = Math.min(t, tEnd());
      plot.vline(tt, { color: ctx.theme.text, width: 1.4, alpha: 0.35 });
      plot.point(tt, value, { color, radius: 5.5 });
    }

    function drawPartsChart(kind: 'x' | 'y' | 'vx' | 'vy', plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const T = Math.max(endMain, 0.1);
      const color = chartColor(kind);
      const val = (s: FlightState) => (kind === 'x' ? s.x : kind === 'y' ? Math.max(0, s.y) : kind === 'vx' ? s.vx : s.vy);
      let lo = 0;
      let hi = 1;
      if (kind === 'x') hi = niceTop(Math.max(main.range, stateAt(endMain).x, 0.5));
      else if (kind === 'y') hi = niceTop(Math.max(main.maxHeight, 0.5));
      else {
        const vs = [stateAt(0), stateAt(endMain), stateAt(main.apexTime)].map(val);
        const big = Math.max(0.5, ...vs.map(Math.abs));
        hi = Math.max(0, ...vs) > 1e-6 ? niceTop(big) : niceTop(big) * 0.25;
        lo = Math.min(0, ...vs) < -1e-6 ? -niceTop(big) : -niceTop(big) * 0.25;
      }
      plot.setRangePadded([0, T], [lo, hi], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const fn = (tt: number) => val(stateAt(tt));
      plot.polyline(curvePts(fn, 0, T), { color, width: 2, dash: [5, 4], alpha: 0.4 });
      const now = Math.min(t, endMain);
      if (now > 0) plot.polyline(curvePts(fn, 0, now, 90), { color, width: 3 });
      // Hilfen: vₓ konstant, Steigung −g, Scheitel
      let right: string | undefined;
      if (kind === 'vx' && !samples) right = ctx.t('constVX');
      if (kind === 'vy' && !samples) right = ctx.t('slopeVY');
      if ((kind === 'vy' || kind === 'y') && main.apexTime > 0 && main.apexTime < endMain) {
        plot.vline(main.apexTime, { color: theme.muted, width: 1, dash: [3, 4], alpha: 0.8 });
      }
      if (kind === 'vy') plot.hline(0, { color: theme.axis, width: 1.2 });
      if (p.strobe && now > 0) {
        const dt = strobeInterval(tEnd());
        for (let k = 0; k * dt <= now + 1e-9; k++) plot.point(k * dt, fn(k * dt), { color, radius: 2.8, hollow: true });
      }
      timeCursor(plot, fn(now), color);
      plot.end();
      titleChip(R, ctx.t(chartTitle(kind)).replace('v_y', 'v_{y}'), color, right);
      // Wert an der Zeitmarke
      const v = fn(now);
      const unit = kind === 'x' || kind === 'y' ? 'm' : 'm/s';
      const fsV = R.w < 300 ? 11 : 12;
      const px = clamp(plot.px(now) + 8, R.x + 50, R.x + R.w - 74);
      // nahe der t-Achse über deren Beschriftung „t in s“ ausweichen
      const nearAxis = Math.abs(plot.py(v) - plot.py(0)) < 26 && plot.px(now) > R.x + R.w - 120;
      const py = clamp(nearAxis ? plot.py(0) - 34 : plot.py(v) - 12, R.y + 40, R.y + R.h - 30);
      // als Etikett mit Hintergrund, damit Kurve, Gitter und „t in s“ den Wert nicht durchkreuzen
      pill(px, py - (fsV + 11) / 2, `${q(f(v, 1))} ${unit}`, color, 'left', fsV);
      frame(R);
    }

    function drawRangeChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const allMax = Math.max(optVac.range, ...(rangeCurve.air ?? []).map((q) => q[1]), 1);
      plot.setAxes({ x: { label: ctx.t('axisA') } });
      plot.setRangePadded([0, 90], [0, niceTop(allMax)], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const reveal = fade.running ? fade.value : 1;
      const vacPts = rangeCurve.vac.slice(0, Math.max(2, Math.round(rangeCurve.vac.length * reveal)));
      plot.polyline(vacPts, { color: C.path(), width: 2.6, dash: mode() === 'drag' ? [6, 4] : [] });
      if (rangeCurve.air) plot.polyline(rangeCurve.air.slice(0, Math.max(2, Math.round(rangeCurve.air.length * reveal))), { color: C.air(), width: 2.8 });
      // Maxima (zweite Marke unter den Punkt, damit sich die Beschriftungen nicht überdecken)
      const mark = (o: { angle: number; range: number }, color: string, row: number) => {
        plot.segment([o.angle, 0], [o.angle, o.range], { color, width: 1.3, dash: [4, 4], alpha: 0.85 });
        plot.point(o.angle, o.range, { color, radius: 4.5, hollow: true });
        plot.text(o.angle, o.range, ctx.isHidden('opt') ? tr('best', { a: '?' }) : tr('best', { a: f(o.angle, 1) }), { color, size: small ? 11 : 12, weight: 'bold', align: o.angle > 60 ? 'right' : 'left', offset: [o.angle > 60 ? -8 : 8, row ? 16 : -8] });
      };
      mark(optVac, C.path(), 0);
      if (optAir) mark(optAir, C.air(), optAir.range > optVac.range * 0.75 ? 1 : 0);
      // aktueller Winkel und Partnerwinkel gleicher Weite
      const a = clamp(launch.angle, 0, 90);
      const cur = kMain() > 0 && rangeCurve.air ? dragFlight({ ...launch, angle: a }, kMain(), 0.01).flight.range : vacuumFlight({ ...launch, angle: a }).range;
      if (kMain() === 0 && a > 0 && a < 90) {
        const partner = aimAngles(launch.v0, cur, -launch.h0, launch.g).find((q) => Math.abs(q - a) > 0.5);
        if (partner !== undefined && partner > 0) {
          plot.segment([a, cur], [partner, cur], { color: theme.text, width: 1.3, dash: [3, 3], alpha: 0.7 });
          plot.point(partner, cur, { color: theme.text, radius: 4, hollow: true });
          if (Math.abs(partner - a) > 16) plot.text((a + partner) / 2, cur, ctx.t('same'), { color: theme.text, size: small ? 11 : 11.5, weight: '600', align: 'center', offset: [0, 15] });
        }
      }
      plot.vline(a, { color: C.v(), width: 1.4, alpha: 0.5 });
      plot.point(a, cur, { color: C.v(), radius: 6 });
      plot.end();
      titleChip(R, ctx.t('tRange'), theme.text, `α = ${n(a, 0)}° → ${ctx.isHidden('range') ? '?' : f(cur, 1)} m`, C.v());
      frame(R);
    }

    function drawEnergyChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const T = Math.max(tEnd(), 0.1);
      const g0 = launch.g;
      const e0 = specificEnergy(vacuumState(launch, 0), g0);
      plot.setAxes({ x: { label: ctx.t('axisT') } });
      plot.setRangePadded([0, T], [0, niceTop(e0)], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const eAir = (tt: number) => specificEnergy(stateAt(tt), g0);
      // ohne Luft bleibt E/m = ½v₀² + g·h₀ konstant, mit Luft nimmt sie ab
      const now = Math.min(t, endMain);
      plot.polyline([[0, e0], [vac.time, e0]], { color: C.path(), width: 2.4, dash: [6, 4] });
      plot.polyline(curvePts(eAir, 0, endMain), { color: C.air(), width: 2, dash: [5, 4], alpha: 0.4 });
      if (now > 0) plot.polyline(curvePts(eAir, 0, now, 90), { color: C.air(), width: 3 });
      // Zeitlinie läuft bis zum Ende des Vergleichsballs, der Punkt bleibt am Ende der Kurve mit Luft
      plot.vline(Math.min(t, tEnd()), { color: theme.text, width: 1.4, alpha: 0.35 });
      plot.point(now, eAir(now), { color: C.air(), radius: 5.5 });
      const lost = e0 - eAir(now);
      plot.end();
      titleChip(R, ctx.t('tEnergy'), theme.text, now > 0 && lost > 0.005 * e0 ? `−${n((lost / e0) * 100, 0)} %` : undefined, C.air());
      frame(R);
    }

    function drawCharts(reg: { charts: Rect[] }): void {
      const kinds = chartsOf(mode());
      const g = surface.g;
      g.save();
      g.globalAlpha = fade.running ? fade.value : 1;
      kinds.forEach((kind, i) => {
        const R = reg.charts[i];
        if (!R || R.w < 60 || R.h < 50) return;
        const plot = charts[i]!;
        if (kind === 'range') drawRangeChart(plot, R);
        else if (kind === 'energy') drawEnergyChart(plot, R);
        else {
          plot.setAxes({ x: { label: ctx.t('axisT') } });
          drawPartsChart(kind, plot, R);
        }
      });
      g.restore();
    }

    /** Messwerte-Karte oben rechts im freien Himmel (breite Bühne, Ansichten ohne Diagramm). */
    function drawInfoCard(r: Rect, s: FlightState): void {
      const theme = ctx.theme;
      const g = surface.g;
      const rowH = 22;
      const items: [string, string, string][] = [
        ['t', `${q(f(Math.min(t, tEnd()), 2))} s`, theme.text],
        ['v_{x}', `${q(f(s.vx, 1))} m/s`, C.x()],
        ['v_{y}', `${q(f(s.vy, 1))} m/s`, C.y()],
        ['v', `${q(f(speedOf(s), 1))} m/s`, C.v()],
      ];
      const w = 156;
      const h = items.length * rowH + 14;
      const x = r.x + r.w - w - 10;
      const y = r.y + 8 + (mode() === 'target' ? 3 : 2) * 29;
      // nur, wenn die Bahn darunter bleibt
      if (scene.py(content.yMax) - 24 < y + h || r.h < 300) return;
      g.save();
      g.globalAlpha = intro.running ? intro.value : 1;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 2;
      g.fillStyle = theme.dark ? 'rgba(16,22,31,0.88)' : 'rgba(255,255,255,0.9)';
      roundRect(g, x, y, w, h, 10);
      g.fill();
      g.shadowColor = 'transparent';
      items.forEach(([name, value, color], i) => {
        const yy = y + 7 + i * rowH + rowH / 2;
        g.fillStyle = color;
        roundRect(g, x + 10, yy - 7, 3, 14, 1.5);
        g.fill();
        richText(name, x + 20, yy, 13, color, 'left', false);
        text(g, value, x + w - 12, yy, { font: `700 13px ${theme.font}`, color: theme.text, align: 'right' });
      });
      g.restore();
    }

    /* ---------- Messwerte unter der Szene (Handy, Ansichten ohne Diagramm) ---------- */
    function drawTiles(R: Rect): void {
      const g = surface.g;
      const theme = ctx.theme;
      const s = stateAt(t);
      const items: [string, string, string][] = [
        ['t', `${q(f(Math.min(t, tEnd()), 2))} s`, theme.text],
        ['x', `${q(f(s.x, 1))} m`, C.x()],
        ['y', `${q(f(Math.max(0, s.y), 1))} m`, C.y()],
        ['v', `${q(f(speedOf(s), 1))} m/s`, C.v()],
      ];
      const gap = 8;
      const cols = 2;
      const rows = 2;
      const w = (R.w - gap * (cols - 1)) / cols;
      const extra = mode() === 'target' ? 24 : 0;
      const h = Math.min(64, (R.h - gap * (rows - 1) - extra) / rows);
      const top = R.y + Math.max(0, (R.h - rows * h - gap - extra) / 2);
      items.forEach(([name, value, color], i) => {
        const x = R.x + (i % cols) * (w + gap);
        const y = top + Math.floor(i / cols) * (h + gap);
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.1)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 2;
        g.fillStyle = theme.bg;
        roundRect(g, x, y, w, h, 10);
        g.fill();
        g.restore();
        g.fillStyle = withAlpha(color, 0.9);
        roundRect(g, x, y + 8, 4, h - 16, 2);
        g.fill();
        text(g, name, x + 14, y + h / 2, { font: `italic 700 15px ${theme.mathFont}`, color, align: 'left' });
        text(g, value, x + w - 12, y + h / 2, { font: `700 15px ${theme.font}`, color: theme.text, align: 'right' });
      });
      if (mode() === 'target') {
        const label = tr('score', { h: String(hits), n: String(shots) });
        text(g, label, R.x + R.w / 2, top + rows * h + gap + 12, { font: `700 12px ${theme.font}`, color: C.good() });
      }
    }

    /* ---------- Ablauf ---------- */
    function resetMotion(): void {
      t = 0;
      flying = false;
      finishPops();
    }

    compute();
    intro.play();

    return {
      update(changed, source) {
        const physics = source === 'init' || source === 'replace' || PHYSICS.some((key) => changed.has(key)) || changed.has('family');
        if (physics) {
          const before = preview;
          compute();
          if (PHYSICS.some((key) => changed.has(key)) || source === 'init' || source === 'replace') {
            ctx.clock.pause();
            resetMotion();
          }
          if (source !== 'init' && !dragging && before.length === preview.length) {
            previewFrom = before;
            morph.play();
          } else previewFrom = null;
          if (changed.has('tx') || changed.has('ty') || changed.has('planet') || changed.has('mode') || source === 'replace') {
            solved = false;
            lastResult = null;
          }
          if (source === 'replace' || source === 'init') {
            shots = 0;
            hits = 0;
          }
        }
        if (changed.has('mode') && source !== 'init') fade.play();
        if (source === 'init' || source === 'replace') split = -1;
        updateReadouts();
      },

      action(id) {
        if (id === 'throw') {
          if (main.time <= 0) return;
          resetMotion();
          lastResult = null;
          flying = true;
          ctx.clock.play();
        } else if (id === 'newtarget') {
          if (ctx.locked) return;
          const q = randomTarget(Math.random, launch.g, launch.h0);
          ctx.set({ tx: q.tx, ty: q.ty });
        }
      },

      tick(dt) {
        const end = tEnd();
        if (end <= 0) {
          ctx.clock.pause();
          return;
        }
        if (t >= end) resetMotion();
        if (t === 0) {
          flying = true;
          lastResult = null;
        }
        const before = t;
        t = Math.min(end, t + dt * (p.slow ? 0.25 : 1));
        if (before < main.apexTime && t >= main.apexTime && main.apexTime < endMain) apexPop.play();
        if (before < endMain && t >= endMain) {
          landPop.play();
          if (mode() === 'target' && shot) {
            lastResult = shot.result;
            if (flying) {
              shots++;
              if (shot.result === 'hit') {
                hits++;
                solved = true;
              }
              flying = false;
            }
            resultPop.play();
            flash.play();
            updateReadouts();
          }
        }
        if (t >= end) ctx.clock.pause();
        updateNow();
      },

      resetTime() {
        resetMotion();
        updateNow();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        // Aufteilung gleitet zur Zielaufteilung der Ansicht
        const st = splitTarget();
        if (split < 0 || prefersReducedMotion()) split = st;
        else {
          split += (st - split) * (1 - Math.exp(-dt * 9));
          if (Math.abs(split - st) < 0.002) split = st;
        }
        const reg = regions();
        scene.resize();
        for (const c of charts) c.resize();
        const moving = stepView(dt);
        surface.begin();
        drawScene(reg.scene);
        drawCharts(reg);
        if (reg.tiles && reg.tiles.h > 40) drawTiles(reg.tiles);
        const busy = moving || split !== st || intro.running || morph.running || fade.running || apexPop.running || landPop.running || resultPop.running || flash.running;
        if (busy) ctx.requestRender();
      },

      destroy: () => {
        surface.canvas.removeEventListener('pointerup', release);
        surface.canvas.removeEventListener('pointercancel', release);
        surface.destroy();
      },
    };
  },
});
