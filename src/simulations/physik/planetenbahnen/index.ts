import { defineSimulation, ease, mixColor, Plot, roundRect, seededRandom, Surface, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  circularSpeed,
  conicPoint,
  energies,
  escapeSpeed,
  GM_SUN,
  keplerConstant,
  keplerPeriod,
  keplerRatio,
  maxTrueAnomaly,
  orbitFromState,
  OrbitRun,
  planetPeriod,
  PLANETS,
  startState,
  timeFromPerihelion,
  trueAnomalyAt,
  trueAnomalyOf,
  YEAR,
  AU,
  MU_SUN,
  R_SUN,
  type Orbit,
  type OrbitKind,
  type Vec,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Panel = 'k2' | 'k3' | 'energy';
type Done = 'crash' | 'escape' | 'far' | null;

/** Länge des Pfeils für v = v_K in Vielfachen von r₀. */
const ARROW = 0.5;
/** Echtzeit (s) für eine Bezugszeit (bei geschlossenen Bahnen: ein Umlauf). */
const LOOP_SECONDS = 8;
/** Bis zu dieser Exzentrizität wird die ganze Ellipse gezeigt. */
const MAX_CLOSED_E = 0.975;
/** Sichtbereich offener Bahnen: bis zum Abstand OPEN_REACH · r₀ vom Stern. */
const OPEN_REACH = 2.3;
/** Höchstens so viele eigene Messungen in der Tabelle. */
const MAX_MEAS = 4;

/** Farben der Planeten in der Tabelle (gegenständlich). */
const PLANET_COLORS: Record<string, string> = {
  mercury: '#a8a29e',
  venus: '#e9cf8f',
  earth: '#4f8fe6',
  mars: '#d4643a',
  jupiter: '#d9a66c',
  saturn: '#e4c66f',
  uranus: '#7fd3dc',
  neptune: '#4a6fe0',
};

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));
const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻' };
const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('');

/** Aufrunden auf 1, 1,5, 2, 2,5, 3, 4, 5, 6, 8 · 10^k. */
function niceCeil(x: number): number {
  if (!(x > 0)) return 1;
  const p = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= x - 1e-12) return m * p;
  return 10 * p;
}

/**
 * Obergrenze einer Achse knapp über v, so gewählt, dass auf `px` Pixeln
 * mindestens zwei beschriftete Teilstriche (Abstand ≥ 56 px, Schritte 1, 2, 5 · 10^k) passen.
 */
function niceTop(v: number, px: number): number {
  if (!(v > 0)) return 1;
  const n = Math.max(2, Math.floor(px / 56));
  const raw = (v * 1.04) / n;
  const p = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 5, 10].map((m) => m * p).find((s) => s >= raw - 1e-12) ?? 10 * p;
  return Math.ceil((v * 1.04) / step - 1e-9) * step;
}

/** Bühne: links der Blick auf die Bahnebene, rechts die Auswertung (Handy: untereinander). */
function regions(w: number, h: number): { scene: Rect; panel: Rect } {
  if (w >= 640) {
    const sw = Math.round(Math.min(h, w * 0.6));
    return { scene: { x: 0, y: 0, w: sw, h }, panel: { x: sw + 10, y: 0, w: w - sw - 10, h } };
  }
  const sh = Math.round(Math.min(w * 1.02, h * 0.55));
  return { scene: { x: 0, y: 0, w, h: sh }, panel: { x: 0, y: sh + 8, w, h: h - sh - 8 } };
}

/**
 * Planetenbahnen und Keplersche Gesetze: Ein Planet startet mit wählbarer
 * Geschwindigkeit (Pfeil ziehen) und bewegt sich nur unter der Gravitation des
 * Sterns – numerisch berechnet. Es entstehen Kreis, Ellipse, Parabel oder
 * Hyperbel. Brennpunkte, Halbachsen, Perihel/Aphel, Flächen in gleichen
 * Zeiten, Tabelle T²/a³ mit Messungen und realen Planeten, Energiebilanz.
 */
export default defineSimulation({
  id: 'planetenbahnen',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.46 },
  groups: [
    { id: 'start', label: L('Start des Planeten', 'Launch of the planet') },
    { id: 'star', label: L('Zentralstern', 'Central star') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'r0',
      type: 'number',
      group: 'start',
      label: L('Startabstand r₀ in AE', 'Initial distance r₀ in AU'),
      help: L('1 AE (astronomische Einheit) = 1,496 · 10¹¹ m, der mittlere Abstand Erde–Sonne. Auch durch Ziehen am Planeten.', '1 AU (astronomical unit) = 1.496 · 10¹¹ m, the mean Earth–Sun distance. You can also drag the planet.'),
      min: 0.3,
      max: 5.5,
      step: 0.01,
      default: 1,
    },
    {
      key: 'v0',
      type: 'number',
      group: 'start',
      label: L('Startgeschwindigkeit v₀', 'Initial speed v₀'),
      help: L('Auch durch Ziehen an der Pfeilspitze. Die Ringe zeigen die Kreisbahngeschwindigkeit v_K und die Fluchtgeschwindigkeit v_F.', 'You can also drag the arrow tip. The rings show the circular speed v_K and the escape speed v_F.'),
      min: 2,
      max: 80,
      step: 0.01,
      default: 36,
      unit: 'km/s',
    },
    {
      key: 'al',
      type: 'number',
      group: 'start',
      label: L('Winkel α zwischen Fahrstrahl und v₀', 'Angle α between radius vector and v₀'),
      help: L('α = 90°: Der Planet startet senkrecht zur Verbindungslinie Stern–Planet.', 'α = 90°: the planet starts perpendicular to the star–planet line.'),
      min: 30,
      max: 150,
      step: 1,
      default: 90,
      unit: '°',
    },
    {
      key: 'M',
      type: 'number',
      group: 'star',
      label: L('Masse des Sterns M', 'Mass of the star M'),
      help: L('In Sonnenmassen: 1 M☉ ≈ 1,99 · 10³⁰ kg.', 'In solar masses: 1 M☉ ≈ 1.99 · 10³⁰ kg.'),
      min: 0.2,
      max: 3,
      step: 0.1,
      default: 1,
      unit: 'M☉',
    },
    {
      key: 'panel',
      type: 'choice',
      group: 'view',
      label: L('Auswertung', 'Analysis'),
      options: [
        { value: 'k2', label: L('Flächen (2. Keplersches Gesetz)', 'Areas (Kepler’s second law)') },
        { value: 'k3', label: L('Tabelle T²/a³ (3. Keplersches Gesetz)', 'Table T²/a³ (Kepler’s third law)') },
        { value: 'energy', label: L('Energie', 'Energy') },
      ],
      default: 'k2',
    },
    { key: 'sec', type: 'boolean', group: 'view', label: L('Flächen in gleichen Zeiten', 'Areas in equal times'), default: true },
    {
      key: 'n',
      type: 'number',
      group: 'view',
      label: L('Zeitabschnitte pro Umlauf', 'Time intervals per orbit'),
      min: 4,
      max: 24,
      step: 1,
      default: 12,
      visibleIf: (v) => v.sec === true || v.panel === 'k2',
    },
    { key: 'geo', type: 'boolean', group: 'view', label: L('Ellipse: Halbachsen, Brennpunkte, Perihel und Aphel', 'Ellipse: semi-axes, foci, perihelion and aphelion'), default: true },
    { key: 'str', type: 'boolean', group: 'view', label: L('Fadenkonstruktion r₁ + r₂ = 2a', 'String construction r₁ + r₂ = 2a'), default: false },
    { key: 'vec', type: 'boolean', group: 'view', label: L('Pfeile für Geschwindigkeit und Gravitationskraft', 'Arrows for velocity and gravitational force'), default: true },
    { key: 'pl', type: 'boolean', group: 'view', label: L('Bahnen der Planeten zum Vergleich', 'Orbits of the planets for comparison'), default: false },
    { key: 'num', type: 'boolean', group: 'view', label: L('Zahlenwerte im Bild', 'Values in the picture'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe', 'Slow motion'), default: false },
  ],
  actions: [
    { id: 'go', label: L('Start', 'Start'), primary: true },
    { id: 'vk', label: L('Kreisbahn: v₀ = v_K', 'Circular orbit: v₀ = v_K') },
    { id: 'vf', label: L('Fluchtgeschwindigkeit: v₀ = v_F', 'Escape speed: v₀ = v_F') },
    { id: 'clear', label: L('Messungen löschen', 'Clear measurements'), visibleIf: (v) => v.panel === 'k3' },
  ],
  images: { sun: 'sonne.webp', planet: 'erde.webp' },
  readouts: [
    { key: 'kind', label: L('Bahnform', 'Shape of the orbit'), spoiler: true },
    { key: 'speeds', label: L('Kreisbahn- und Fluchtgeschwindigkeit bei r₀', 'Circular and escape speed at r₀'), spoiler: true },
    { key: 'ellipse', label: L('Ellipse (1. Keplersches Gesetz)', 'Ellipse (Kepler’s first law)'), spoiler: true },
    { key: 'pa', label: L('Perihel und Aphel (2. Keplersches Gesetz)', 'Perihelion and aphelion (Kepler’s second law)'), spoiler: true },
    { key: 'period', label: L('Umlaufdauer (3. Keplersches Gesetz)', 'Orbital period (Kepler’s third law)'), spoiler: true },
    { key: 'energy', label: L('Energie pro kg Planetenmasse', 'Energy per kg of planet mass'), spoiler: true },
    { key: 'now', label: L('Momentan', 'Right now') },
  ],
  presets: [
    { id: 'start', label: L('Ellipse (Start im Perihel)', 'Ellipse (launch at perihelion)'), values: {} },
    { id: 'circle', label: L('Kreisbahn', 'Circular orbit'), values: { v0: 29.78 } },
    { id: 'aphel', label: L('Start im Aphel', 'Launch at aphelion'), values: { v0: 22, n: 8 } },
    { id: 'escape', label: L('Fluchtbahn (Hyperbel)', 'Escape orbit (hyperbola)'), values: { v0: 46, geo: false, panel: 'energy' } },
    { id: 'mars', label: L('Marsbahn und Planeten', 'Orbit of Mars and the planets'), values: { r0: 1.38, v0: 26.51, panel: 'k3', pl: true, sec: false } },
    { id: 'comet', label: L('Komet wie Halley', 'Comet like Halley'), values: { r0: 0.59, v0: 54.38, n: 8 } },
  ],
  strings: {
    de: {
      canvas: 'Blick von oben auf die Bahnebene: Ein Planet bewegt sich unter der Gravitation eines Sterns auf einer Kreis-, Ellipsen-, Parabel- oder Hyperbelbahn. Eingezeichnet sind Brennpunkte, Halbachsen, Perihel und Aphel sowie die Flächen, die der Fahrstrahl in gleichen Zeiten überstreicht. Daneben Diagramme bzw. eine Tabelle zu den Keplerschen Gesetzen.',
      au: 'AE',
      yr: 'a',
      sun: 'Sonne',
      star: 'Stern',
      circle: 'Kreisbahn',
      ellipse: 'Ellipse',
      parabola: 'Parabel',
      hyperbola: 'Hyperbel',
      crash: 'Sturz in den Stern',
      perihel: 'Perihel',
      aphel: 'Aphel',
      notToScale: 'Stern und Planet nicht maßstäblich',
      notToScaleShort: 'nicht maßstäblich',
      linEcc: 'e',
      eps: 'ε',
      msgCrash: 'Der Planet stürzt in den Stern.',
      msgEscape: 'Fluchtbahn: Der Planet verlässt das System.',
      msgEscapeShort: 'Der Planet entkommt.',
      msgFar: 'Weite Ellipse: Rückkehr erst nach T = {T}',
      msgFarShort: 'Rückkehr nach {T}',
      laps: 'Umläufe: {n}',
      k2Title: 'Gleiche Zeiten – gleiche Flächen',
      k2TitleShort: 'Gleiche Zeiten – gleiche Flächen',
      k2Dt: 'Δt = T/{n} = {dt}',
      k2DtOpen: 'Δt = {dt}',
      k2Empty: '„Start“ – hier wachsen die Flächen.',
      k2Axis: 'A in AE²',
      k2Equal: 'je {A}',
      vTitle: 'Bahngeschwindigkeit v',
      axisV: 'v in km/s',
      axisTd: 't in d',
      axisTa: 't in a',
      chartEmpty: 'Hier entsteht das Diagramm.',
      k3Title: '3. Keplersches Gesetz',
      k3Body: 'Körper',
      k3a: 'a',
      k3aUnit: 'in AE',
      k3T: 'T',
      k3TUnit: 'in a',
      k3Q: 'T²/a³',
      k3QUnit: 'in 10⁻¹⁹ s²/m³',
      k3Own: 'Bahn {n}',
      k3OwnM: 'Bahn {n} ({M} M☉)',
      k3Pending: 'deine Bahn',
      k3PendingNote: 'nach einem Umlauf',
      k3Open: 'offene Bahn: kein Umlauf',
      k3Far: 'zu weit für eine Messung',
      k3Note: '1 AE = 1,496 · 10¹¹ m · 1 a = 3,156 · 10⁷ s',
      logTitle: 'T über a, doppelt logarithmisch',
      logAxisA: 'a in AE',
      logAxisT: 'T in a',
      logSlope: 'Gerade mit Steigung 3/2: T² ~ a³',
      k3Formula: 'T²/a³ = 4π²/(G · M) = {q} · 10⁻¹⁹ s²/m³ bei M = {M} M☉',
      k3FormulaShort: 'Theorie: 4π²/(G · M) = {q} · 10⁻¹⁹ s²/m³',
      enTitle: 'Energie pro kg Planetenmasse',
      enTitleShort: 'Energie pro kg',
      enUnit: 'Werte in 10{k} J/kg',
      enBound: 'E_[ges] < 0: gebunden – Kreis oder Ellipse',
      enParabola: 'E_[ges] = 0: Grenzfall Parabel',
      enFree: 'E_[ges] > 0: Fluchtbahn – Hyperbel',
      enChart: 'Energien über der Zeit',
      axisE: 'E in 10{k} J/kg',
      kindCircle: '<strong>Kreisbahn</strong>: v₀ = <var>v</var><sub>K</sub> = √(<var>G</var> · <var>M</var> / <var>r</var>₀) ≈ {vk} km/s, senkrecht zum Fahrstrahl',
      kindEllipse: '<strong>Ellipse</strong> (gebunden): v₀ = {v0} km/s ist kleiner als <var>v</var><sub>F</sub> ≈ {vf} km/s',
      kindParabola: '<strong>Parabel</strong> (Grenzfall): v₀ = <var>v</var><sub>F</sub> = √(2 · <var>G</var> · <var>M</var> / <var>r</var>₀) ≈ {vf} km/s',
      kindHyperbola: '<strong>Hyperbel</strong> (Fluchtbahn): v₀ = {v0} km/s ist größer als <var>v</var><sub>F</sub> ≈ {vf} km/s',
      kindCrash: '<br>Achtung: Das Perihel liegt im Stern – der Planet stürzt hinein.',
      speeds: '<var>v</var><sub>K</sub> = √(<var>G</var> · <var>M</var> / <var>r</var>₀) ≈ <strong>{vk} km/s</strong> · <var>v</var><sub>F</sub> = √2 · <var>v</var><sub>K</sub> ≈ <strong>{vf} km/s</strong>',
      ellipseText:
        '<var>a</var> = (<var>r</var><sub>P</sub> + <var>r</var><sub>A</sub>) / 2 ≈ <strong>{a} AE</strong> ({am} m) · <var>b</var> ≈ {b} AE<br>lineare Exzentrizität <var>e</var> = <var>a</var> − <var>r</var><sub>P</sub> ≈ {c} AE · numerische Exzentrizität ε = <var>e</var> / <var>a</var> ≈ <strong>{eps}</strong>',
      circleText: 'Kreis mit <var>r</var> = {a} AE: beide Brennpunkte fallen in den Mittelpunkt (ε = 0).',
      openText: 'Keine Ellipse: ε = {eps} ≥ 1, die Bahn ist offen.',
      paText:
        'Perihel: <var>r</var><sub>P</sub> ≈ {rp} AE, <var>v</var><sub>P</sub> ≈ <strong>{vp} km/s</strong> · Aphel: <var>r</var><sub>A</sub> ≈ {ra} AE, <var>v</var><sub>A</sub> ≈ <strong>{va} km/s</strong><br><var>r</var><sub>P</sub> · <var>v</var><sub>P</sub> = <var>r</var><sub>A</sub> · <var>v</var><sub>A</sub> ≈ {L} AE · km/s (Flächensatz)',
      paOpen: 'Perihel: <var>r</var><sub>P</sub> ≈ {rp} AE, <var>v</var><sub>P</sub> ≈ <strong>{vp} km/s</strong> · kein Aphel (offene Bahn)',
      periodText:
        '<var>T</var> = 2π · √(<var>a</var>³ / (<var>G</var> · <var>M</var>)) ≈ <strong>{T} a</strong> = {Td} d<br><var>T</var>² / <var>a</var>³ = 4π² / (<var>G</var> · <var>M</var>) ≈ {q} s²/m³',
      periodOpen: 'Keine Umlaufdauer: Die Bahn ist offen.',
      energyText: '<var>E</var><sub>ges</sub> = ½ · <var>v</var>₀² − <var>G</var> · <var>M</var> / <var>r</var>₀ ≈ {kin} − {pot} = <strong>{tot} J/kg</strong> {rel} 0',
      now: 't = {t} · r = {r} AE · v = {v} km/s',
      nowLaps: 't = {t} · r = {r} AE · v = {v} km/s · {n} Umläufe',
    },
    en: {
      canvas: 'Top view of the orbital plane: a planet moves under the gravity of a star on a circular, elliptical, parabolic or hyperbolic orbit. Foci, semi-axes, perihelion and aphelion are drawn, as well as the areas swept by the radius vector in equal times. Next to it graphs or a table on Kepler’s laws.',
      au: 'AU',
      yr: 'yr',
      sun: 'Sun',
      star: 'Star',
      circle: 'Circle',
      ellipse: 'Ellipse',
      parabola: 'Parabola',
      hyperbola: 'Hyperbola',
      crash: 'Falls into the star',
      perihel: 'Perihelion',
      aphel: 'Aphelion',
      notToScale: 'star and planet not to scale',
      notToScaleShort: 'not to scale',
      linEcc: 'c',
      eps: 'e',
      msgCrash: 'The planet falls into the star.',
      msgEscape: 'Escape orbit: the planet leaves the system.',
      msgEscapeShort: 'The planet escapes.',
      msgFar: 'Wide ellipse: returns only after T = {T}',
      msgFarShort: 'returns after {T}',
      laps: 'orbits: {n}',
      k2Title: 'Equal times – equal areas',
      k2TitleShort: 'Equal times – equal areas',
      k2Dt: 'Δt = T/{n} = {dt}',
      k2DtOpen: 'Δt = {dt}',
      k2Empty: '“Start” – the areas grow here.',
      k2Axis: 'A in AU²',
      k2Equal: 'each {A}',
      vTitle: 'Orbital speed v',
      axisV: 'v in km/s',
      axisTd: 't in d',
      axisTa: 't in yr',
      chartEmpty: 'The graph appears here.',
      k3Title: 'Kepler’s third law',
      k3Body: 'Body',
      k3a: 'a',
      k3aUnit: 'in AU',
      k3T: 'T',
      k3TUnit: 'in yr',
      k3Q: 'T²/a³',
      k3QUnit: 'in 10⁻¹⁹ s²/m³',
      k3Own: 'orbit {n}',
      k3OwnM: 'orbit {n} ({M} M☉)',
      k3Pending: 'your orbit',
      k3PendingNote: 'after one orbit',
      k3Open: 'open orbit: no period',
      k3Far: 'too far to measure',
      k3Note: '1 AU = 1.496 · 10¹¹ m · 1 yr = 3.156 · 10⁷ s',
      logTitle: 'T against a, log–log',
      logAxisA: 'a in AU',
      logAxisT: 'T in yr',
      logSlope: 'line with slope 3/2: T² ~ a³',
      k3Formula: 'T²/a³ = 4π²/(G · M) = {q} · 10⁻¹⁹ s²/m³ for M = {M} M☉',
      k3FormulaShort: 'theory: 4π²/(G · M) = {q} · 10⁻¹⁹ s²/m³',
      enTitle: 'Energy per kg of planet mass',
      enTitleShort: 'Energy per kg',
      enUnit: 'values in 10{k} J/kg',
      enBound: 'E_[tot] < 0: bound – circle or ellipse',
      enParabola: 'E_[tot] = 0: limiting case parabola',
      enFree: 'E_[tot] > 0: escape orbit – hyperbola',
      enChart: 'Energies against time',
      axisE: 'E in 10{k} J/kg',
      kindCircle: '<strong>Circular orbit</strong>: v₀ = <var>v</var><sub>K</sub> = √(<var>G</var> · <var>M</var> / <var>r</var>₀) ≈ {vk} km/s, perpendicular to the radius vector',
      kindEllipse: '<strong>Ellipse</strong> (bound): v₀ = {v0} km/s is less than <var>v</var><sub>F</sub> ≈ {vf} km/s',
      kindParabola: '<strong>Parabola</strong> (limiting case): v₀ = <var>v</var><sub>F</sub> = √(2 · <var>G</var> · <var>M</var> / <var>r</var>₀) ≈ {vf} km/s',
      kindHyperbola: '<strong>Hyperbola</strong> (escape orbit): v₀ = {v0} km/s is greater than <var>v</var><sub>F</sub> ≈ {vf} km/s',
      kindCrash: '<br>Note: the perihelion lies inside the star – the planet falls into it.',
      speeds: '<var>v</var><sub>K</sub> = √(<var>G</var> · <var>M</var> / <var>r</var>₀) ≈ <strong>{vk} km/s</strong> · <var>v</var><sub>F</sub> = √2 · <var>v</var><sub>K</sub> ≈ <strong>{vf} km/s</strong>',
      ellipseText:
        '<var>a</var> = (<var>r</var><sub>P</sub> + <var>r</var><sub>A</sub>) / 2 ≈ <strong>{a} AU</strong> ({am} m) · <var>b</var> ≈ {b} AU<br>focal distance <var>c</var> = <var>a</var> − <var>r</var><sub>P</sub> ≈ {c} AU · eccentricity <var>e</var> = <var>c</var> / <var>a</var> ≈ <strong>{eps}</strong>',
      circleText: 'Circle with <var>r</var> = {a} AU: both foci coincide with the centre (e = 0).',
      openText: 'No ellipse: e = {eps} ≥ 1, the orbit is open.',
      paText:
        'Perihelion: <var>r</var><sub>P</sub> ≈ {rp} AU, <var>v</var><sub>P</sub> ≈ <strong>{vp} km/s</strong> · aphelion: <var>r</var><sub>A</sub> ≈ {ra} AU, <var>v</var><sub>A</sub> ≈ <strong>{va} km/s</strong><br><var>r</var><sub>P</sub> · <var>v</var><sub>P</sub> = <var>r</var><sub>A</sub> · <var>v</var><sub>A</sub> ≈ {L} AU · km/s (law of areas)',
      paOpen: 'Perihelion: <var>r</var><sub>P</sub> ≈ {rp} AU, <var>v</var><sub>P</sub> ≈ <strong>{vp} km/s</strong> · no aphelion (open orbit)',
      periodText:
        '<var>T</var> = 2π · √(<var>a</var>³ / (<var>G</var> · <var>M</var>)) ≈ <strong>{T} yr</strong> = {Td} d<br><var>T</var>² / <var>a</var>³ = 4π² / (<var>G</var> · <var>M</var>) ≈ {q} s²/m³',
      periodOpen: 'No period: the orbit is open.',
      energyText: '<var>E</var><sub>tot</sub> = ½ · <var>v</var>₀² − <var>G</var> · <var>M</var> / <var>r</var>₀ ≈ {kin} − {pot} = <strong>{tot} J/kg</strong> {rel} 0',
      now: 't = {t} · r = {r} AU · v = {v} km/s',
      nowLaps: 't = {t} · r = {r} AU · v = {v} km/s · {n} orbits',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const g = surface.g;
    const p = ctx.params;
    const fmt = ctx.fmt;
    const de = ctx.lang === 'de';
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const AE = ctx.t('au');

    /* ---------- Farben ---------- */
    /** Reihenfarbe für den dunklen Weltraum (im hellen Modus aufgehellt). */
    const sp = (i: number, alpha = 1) => {
      const c = ctx.theme.series[i]!;
      return ctx.theme.dark ? withAlpha(c, alpha) : mixColor(c, '#ffffff', 0.38, alpha);
    };
    const colV = (a = 1) => sp(0, a);
    const colF = (a = 1) => sp(1, a);
    const colGeo = (a = 1) => sp(2, a);
    const colStr = (a = 1) => sp(4, a);
    const secCol = (i: number, a = 1) => sp(i % 2 === 0 ? 3 : 5, a);
    const INK = '#e8eefc';
    const INK_MUTED = 'rgba(214,224,245,0.78)';
    const HALO = 'rgba(5,9,20,0.86)';

    /* ---------- Koordinatensysteme ---------- */
    const scene = new Plot(surface, { x: [-2, 2], y: [-2, 2], pan: false, zoom: false, controls: false, region: (w, h) => regions(w, h).scene });

    /** Aufteilung der Auswertung: oben Balken bzw. Tabelle, unten ein Diagramm. */
    function panelParts(R: Rect): { bars: Rect; chartTitle: number; chart: Rect } {
      const small = R.w < 360 || narrow();
      const top = R.y + (small ? 50 : 54);
      const barsH = Math.round((R.y + R.h - top) * (narrow() ? 0.4 : 0.38));
      const ct = top + barsH + (small ? 12 : 16);
      return {
        bars: { x: R.x + 12, y: top, w: R.w - 24, h: barsH },
        chartTitle: ct,
        chart: { x: R.x + 2, y: ct + 10, w: R.w - 4, h: R.y + R.h - ct - 12 },
      };
    }
    /** Zustand ist angelegt (vorher darf die Diagrammfläche nicht von ihm abhängen). */
    let ready = false;

    /** Tabelle zum 3. Keplerschen Gesetz: Zeilenhöhe und (wenn Platz ist) ein doppelt-logarithmisches Diagramm. */
    function k3Layout(R: Rect): { headY: number; top: number; foot: number; rh: number; chartTitle: number; chart: Rect | null } {
      const small = narrow() || R.w < 360;
      const headY = R.y + (small ? 40 : 44);
      const top = headY + 32;
      const foot = small ? 40 : 46;
      const rows = PLANETS.length + meas.length + (run.complete ? 0 : 1);
      const avail = R.y + R.h - foot - top;
      const compact = small ? 17 : 20;
      const rest = avail - rows * compact;
      if (rest >= 150) {
        const ct = top + rows * compact + 16;
        return { headY, top, foot, rh: compact, chartTitle: ct, chart: { x: R.x + 2, y: ct + 8, w: R.w - 4, h: R.y + R.h - foot - ct - 10 } };
      }
      return { headY, top, foot, rh: clamp(avail / rows, 15, 25), chartTitle: 0, chart: null };
    }

    const chart = new Plot(surface, {
      x: [0, 1],
      y: [0, 1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => {
        const R = regions(w, h).panel;
        if (p.panel !== 'k3' || !ready) return panelParts(R).chart;
        return k3Layout(R).chart ?? { x: R.x, y: R.y + R.h - 2, w: R.w, h: 1 };
      },
      xAxis: { label: ctx.t('axisTa') },
      yAxis: { label: ctx.t('axisV') },
    });

    /* ---------- Zustand ---------- */
    const startOrbit = (): Orbit => orbitFromState(startState(p.r0, p.v0, p.al), p.M);
    const isClosed = (o: Orbit) => o.bound && (o.e <= MAX_CLOSED_E || o.rA <= OPEN_REACH * p.r0);
    const makeRun = () => {
      const o = startOrbit();
      return new OrbitRun({ r0: p.r0, v0: p.v0, alpha: p.al, M: p.M, n: p.n, closed: isClosed(o) });
    };
    let run = makeRun();
    let done: Done = null;
    let dragging = false;
    interface Meas {
      a: number;
      T: number;
      M: number;
      id: number;
    }
    let meas: Meas[] = [];
    let measCount = 0;
    let lapSeen = false;
    let lastMeasId = -1;
    const pop = new Tween(700, ease.outBack);
    const grow = new Tween(600, ease.outCubic);

    /** Bahnpunkte der exakten Kegelschnittbahn (für die gestrichelte Vorhersage). */
    let conicPts: Vec[] = [];
    /** Offene Bahnen: ungefähre Zeit bis zum Verlassen des Bildes (für die Zeitachse). */
    let exitTime = 1;
    function buildConic(): void {
      const o = run.orbit;
      const pts: Vec[] = [];
      exitTime = run.tRef;
      if (o.bound) {
        for (let i = 0; i <= 720; i++) pts.push(conicPoint(o, (i / 720) * 2 * Math.PI - Math.PI));
      } else {
        // nur der zukünftige Teil: vom Startpunkt bis weit nach außen
        const nu0 = trueAnomalyOf(o, p.r0, 0);
        const nuR = trueAnomalyAt(o, OPEN_REACH * Math.max(p.r0, o.rP) * 3);
        const lim = Math.min(Number.isNaN(nuR) ? Math.PI : nuR, maxTrueAnomaly(o) - 1e-3);
        for (let i = 0; i <= 400; i++) pts.push(conicPoint(o, nu0 + ((lim - nu0) * i) / 400));
      }
      if (!run.closed) {
        const nu0 = trueAnomalyOf(o, p.r0, 0);
        const nuX = trueAnomalyAt(o, OPEN_REACH * Math.max(p.r0, o.rP) * 1.4);
        if (!Number.isNaN(nuX) && nuX > nu0) exitTime = timeFromPerihelion(o, nuX, p.M) - timeFromPerihelion(o, nu0, p.M);
      }
      conicPts = pts;
    }
    buildConic();

    /* ---------- Ansicht (Weltausschnitt), weich nachgeführt ---------- */
    interface View {
      cx: number;
      cy: number;
      s: number;
    }
    let view: View = { cx: 0, cy: 0, s: 100 };
    let viewFrom: View = view;
    let viewTo: View = view;
    const zoomTw = new Tween(650, ease.inOutCubic);
    let rectKey = '';

    /** Pfeillänge in AE pro km/s (der Pfeil für v_K ist ARROW · r₀ lang). */
    const kArrow = () => (ARROW * p.r0) / circularSpeed(p.r0, p.M);
    /** Pfeilmaßstab während des Laufs: der schnellste Pfeil (Perihel) bleibt kürzer als 0,42 · a. */
    const kLive = () => {
      const o = run.orbit;
      const size = run.closed ? o.a : Math.max(p.r0, o.rP);
      return Math.min(kArrow(), (0.42 * size) / Math.max(o.vP, 1e-9));
    };
    /** Vor dem Start: Ausschnitt mit Startpfeil und Ringen. */
    const idleView = () => run.t === 0 && !ctx.clock.playing;

    function targetView(): View {
      const r = regions(surface.width, surface.height).scene;
      const o = run.orbit;
      const small = narrow();
      let x0 = 0;
      let x1 = 0;
      let y0 = 0;
      let y1 = 0;
      const add = (x: number, y: number) => {
        x0 = Math.min(x0, x);
        x1 = Math.max(x1, x);
        y0 = Math.min(y0, y);
        y1 = Math.max(y1, y);
      };
      if (isClosed(o)) {
        const cw = Math.cos(o.omega);
        const sw = Math.sin(o.omega);
        const hw = Math.sqrt(o.a * o.a * cw * cw + o.b * o.b * sw * sw);
        const hh = Math.sqrt(o.a * o.a * sw * sw + o.b * o.b * cw * cw);
        add(o.center[0] - hw, o.center[1] - hh);
        add(o.center[0] + hw, o.center[1] + hh);
      } else {
        const reach = OPEN_REACH * Math.max(p.r0, o.rP);
        for (const [x, y] of conicPts) if (Math.hypot(x, y) <= reach) add(x, y);
        // etwas Raum rund um den Stern
        const m = 0.4 * Math.max(p.r0, o.rP);
        add(-m, -m);
        add(m, m);
      }
      // vor dem Start: Startpunkt mit Ringen (v_K, v_F) und Pfeil
      if (idleView()) {
        const k = kArrow();
        const ring = k * escapeSpeed(p.r0, p.M) * 1.08;
        add(p.r0 - ring, -ring);
        add(p.r0 + ring, ring);
        const a = (p.al * Math.PI) / 180;
        add(p.r0 + Math.cos(a) * k * p.v0 * 1.1, Math.sin(a) * k * p.v0 * 1.1);
      } else add(p.r0, 0);
      const pad = small ? { l: 16, r: 16, t: 44, b: 30 } : { l: 26, r: 26, t: 52, b: 36 };
      const bw = Math.max(1e-6, x1 - x0);
      const bh = Math.max(1e-6, y1 - y0);
      const s = Math.min((r.w - pad.l - pad.r) / bw, (r.h - pad.t - pad.b) / bh);
      return {
        cx: (x0 + x1) / 2 - (pad.l - pad.r) / 2 / s,
        cy: (y0 + y1) / 2 + (pad.t - pad.b) / 2 / s,
        s,
      };
    }

    function applyView(v: View): void {
      const r = regions(surface.width, surface.height).scene;
      scene.setRange([v.cx - r.w / 2 / v.s, v.cx + r.w / 2 / v.s], [v.cy - r.h / 2 / v.s, v.cy + r.h / 2 / v.s]);
    }

    function retarget(animate: boolean): void {
      viewTo = targetView();
      if (animate && !zoomTw.running && Math.abs(Math.log(viewTo.s / view.s)) < 1e-3 && Math.hypot(viewTo.cx - view.cx, viewTo.cy - view.cy) * view.s < 0.5) return;
      if (animate) {
        viewFrom = { ...view };
        zoomTw.play();
      } else {
        zoomTw.finish();
        view = viewTo;
      }
      ctx.requestRender();
    }

    function stepView(): void {
      if (zoomTw.running) {
        const u = zoomTw.value;
        view = {
          cx: viewFrom.cx + (viewTo.cx - viewFrom.cx) * u,
          cy: viewFrom.cy + (viewTo.cy - viewFrom.cy) * u,
          s: Math.exp(Math.log(viewFrom.s) + (Math.log(viewTo.s) - Math.log(viewFrom.s)) * u),
        };
      } else if (!dragging) view = viewTo;
      applyView(view);
    }

    /* ---------- Hilfsgrößen ---------- */
    const n2 = (v: number, d: number) => fmt.num(v, d);
    /** Abstand in AE mit sinnvoller Stellenzahl. */
    const dist = (r: number) => (r < 10 ? fmt.fixed(r, r < 1 ? 3 : 2) : r < 100 ? fmt.fixed(r, 1) : fmt.num(r, 0));
    const daysMode = () => run.tRef <= 2;
    /** Kleinster Abstand der Bahn (bei einem Sturz: die Sternoberfläche). */
    const rLow = () => Math.max(run.orbit.rP, R_SUN);
    /** Größte Bahngeschwindigkeit in km/s (im Perihel bzw. an der Sternoberfläche). */
    const vPeak = () => (run.orbit.hitsStar ? Math.sqrt(2 * (run.orbit.energy + (MU_SUN * p.M) / R_SUN)) * (AU / YEAR / 1000) : run.orbit.vP);
    /** Zahl mit n geltenden Ziffern. */
    const sig = (v: number, n: number) => fmt.fixed(v, Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v) || 1))));
    /** Dauer: unter einem Jahr in Tagen, sonst in Jahren. */
    const durText = (t: number) => (t < 1 ? `${fmt.num(t * 365.25, t * 365.25 < 100 ? 1 : 0)} d` : `${fmt.fixed(t, t < 10 ? 2 : 1)} ${ctx.t('yr')}`);
    const timeText = (t: number) => (daysMode() ? `${fmt.num(t * 365.25, t * 365.25 < 100 ? 1 : 0)} d` : `${fmt.fixed(t, t < 10 ? 2 : 1)} ${ctx.t('yr')}`);
    function sciHtml(v: number, d = 2): string {
      if (v === 0) return '0';
      const k = Math.floor(Math.log10(Math.abs(v)));
      return `${fmt.num(v / 10 ** k, d)} · 10<sup>${k < 0 ? '−' : ''}${Math.abs(k)}</sup>`;
    }
    const kindName = (o: Orbit) => (o.hitsStar ? ctx.t('crash') : ctx.t(o.kind));
    const kindColor = (o: Orbit): string => {
      if (o.hitsStar) return colF();
      const map: Record<OrbitKind, number> = { circle: 2, ellipse: 2, parabola: 3, hyperbola: 1 };
      return sp(map[o.kind]);
    };

    /* ---------- Ergebnisse ---------- */
    function updateNow(): void {
      const t = timeText(run.t);
      const laps = run.closed ? Math.floor(run.t / run.tRef + 1e-9) : 0;
      const vars = { t, r: dist(run.r), v: n2(run.v, 2), n: String(laps) };
      ctx.readout('now', tr(run.closed ? 'nowLaps' : 'now', vars));
    }

    function updateReadouts(): void {
      const o = run.orbit;
      const vk = circularSpeed(p.r0, p.M);
      const vf = escapeSpeed(p.r0, p.M);
      const vars = { vk: n2(vk, 2), vf: n2(vf, 2), v0: n2(p.v0, 2) };
      const key = { circle: 'kindCircle', ellipse: 'kindEllipse', parabola: 'kindParabola', hyperbola: 'kindHyperbola' }[o.kind];
      ctx.readout('kind', { html: tr(key, vars) + (o.hitsStar ? ctx.t('kindCrash') : '') });
      ctx.readout('speeds', { html: tr('speeds', vars) });
      if (o.kind === 'circle') ctx.readout('ellipse', { html: tr('circleText', { a: dist(o.a) }) });
      else if (o.bound) {
        ctx.readout('ellipse', {
          html: tr('ellipseText', { a: dist(o.a), am: sciHtml(o.a * AU, 3), b: dist(o.b), c: dist(o.c), eps: fmt.fixed(o.e, 3) }),
        });
      } else ctx.readout('ellipse', { html: tr('openText', { eps: fmt.fixed(o.e, 3) }) });
      if (o.bound) {
        ctx.readout('pa', {
          html: tr('paText', { rp: dist(o.rP), vp: n2(o.vP, 2), ra: dist(o.rA), va: n2(o.vA, 2), L: n2(o.rP * o.vP, 2) }),
        });
        ctx.readout('period', {
          html: tr('periodText', { T: n2(o.T, 3), Td: n2(o.T * 365.25, 1), q: sciHtml(keplerConstant(p.M), 3) }),
        });
      } else {
        ctx.readout('pa', { html: tr('paOpen', { rp: dist(o.rP), vp: n2(o.vP, 2) }) });
        ctx.readout('period', { html: ctx.t('periodOpen') });
      }
      const e0 = energies(startState(p.r0, p.v0, p.al), p.M);
      ctx.readout('energy', {
        html: tr('energyText', {
          kin: sciHtml(e0.kin, 2),
          pot: sciHtml(-e0.pot, 2),
          tot: (e0.total < 0 ? '−' : '') + sciHtml(Math.abs(e0.total), 2),
          rel: o.kind === 'parabola' ? '≈' : e0.total < 0 ? '<' : '>',
        }),
      });
      updateNow();
    }

    /* ---------- Ziehen ---------- */
    const editable = () => !ctx.locked && !ctx.clock.playing && run.t === 0;
    function arrowTip(): Vec {
      const a = (p.al * Math.PI) / 180;
      const k = kArrow();
      return [p.r0 + Math.cos(a) * k * p.v0, Math.sin(a) * k * p.v0];
    }
    /** Hervorhebung, wenn der Pfeil auf einem Ring einrastet. */
    let snapped: 'vk' | 'vf' | null = null;
    scene.addHandle({
      get: () => arrowTip(),
      set: (x, y) => {
        dragging = true;
        const k = kArrow();
        const s = scene.scale.x;
        const dx = x - p.r0;
        const dy = y;
        let v = Math.hypot(dx, dy) / k;
        let al = (Math.atan2(dy, dx) * 180) / Math.PI;
        if (al < -90) al = 150;
        else if (al < 30) al = 30;
        al = clamp(al, 30, 150);
        const vk = circularSpeed(p.r0, p.M);
        const vf = escapeSpeed(p.r0, p.M);
        snapped = null;
        // Einrasten: Kreisbahn (v_K, senkrecht) bzw. Fluchtgeschwindigkeit
        if (Math.hypot(dx, dy - k * vk) * s < 10) {
          v = vk;
          al = 90;
          snapped = 'vk';
        } else if (Math.abs(v - vf) * k * s < 6) {
          v = vf;
          snapped = 'vf';
        }
        ctx.set({ v0: clamp(v, 2, 80), al: Math.round(al) });
      },
      enabled: editable,
      color: () => colV(),
    });
    scene.addHandle({
      get: () => [p.r0, 0],
      set: (x) => {
        dragging = true;
        const b = scene.bounds;
        ctx.set({ r0: clamp(x, Math.max(0.3, b.xMin + 0.02 * (b.xMax - b.xMin)), Math.min(5.5, b.xMax - 0.04 * (b.xMax - b.xMin))) });
      },
      axis: 'x',
      enabled: editable,
      color: () => '#9cc3ff',
    });
    const release = () => {
      if (!dragging) return;
      dragging = false;
      snapped = null;
      retarget(true);
    };
    surface.canvas.addEventListener('pointerup', release);
    surface.canvas.addEventListener('pointercancel', release);

    /* ---------- Text ---------- */
    /** Teile eines Textes mit Tiefstellungen „v_[P]“. */
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
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }
    /** Text mit Tiefstellungen; `halo` = Farbe des Hofs oder null. */
    function rich(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo: string | null = HALO, weight = 700): number {
      const list = parts(str);
      const total = richWidth(str, size, weight);
      const start = align === 'left' ? x : align === 'right' ? x - total : x - total / 2;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      for (const pass of halo ? [0, 1] : [1]) {
        let cx = start;
        for (const q of list) {
          const s = q.sub ? Math.round(size * 0.74) : size;
          g.font = `${weight} ${s}px ${ctx.theme.font}`;
          const yy = y + (q.sub ? size * 0.3 : 0);
          if (pass === 0) {
            g.lineWidth = 3.5;
            g.lineJoin = 'round';
            g.strokeStyle = halo!;
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
    const panelHalo = () => (ctx.theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(255,255,255,0.92)');

    /** Bereits beschriftete Stellen der Szene (andere Beschriftungen weichen aus). */
    let placed: Rect[] = [];
    const overlaps = (b: Rect) => placed.some((a) => b.x < a.x + a.w + 2 && a.x < b.x + b.w + 2 && b.y < a.y + a.h + 1 && a.y < b.y + b.h + 1);

    /** Beschriftung hinter einem Punkt in Richtung (ux, uy), innerhalb der Szene. */
    function labelAt(str: string, x: number, y: number, ux: number, uy: number, color: string, size: number, gap = 8): Rect {
      const r = regions(surface.width, surface.height).scene;
      const w = richWidth(str, size);
      const h = size + 4;
      const d0 = gap + Math.abs(ux) * (w / 2) + Math.abs(uy) * (h / 2);
      // Kandidaten: weiter hinaus, dann seitlich versetzt – der erste freie Platz gewinnt
      const cands: [number, number][] = [];
      for (let k = 0; k < 8; k++) cands.push([d0 + k * 5, 0]);
      for (const side of [1, -1]) for (let k = 1; k <= 3; k++) cands.push([d0, side * k * (h + 2)]);
      let box: Rect | null = null;
      let first: Rect | null = null;
      for (const [d, q] of cands) {
        const lx = clamp(x + ux * d - uy * q, r.x + w / 2 + 6, r.x + r.w - w / 2 - 6);
        const ly = clamp(y + uy * d + ux * q, r.y + 38 + h / 2, r.y + r.h - h / 2 - 4);
        const b = { x: lx - w / 2, y: ly - h / 2, w, h };
        first ??= b;
        if (!overlaps(b)) {
          box = b;
          break;
        }
      }
      box ??= first!;
      rich(str, box.x + w / 2, box.y + h / 2, size, color);
      placed.push(box);
      return box;
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size: number, fill?: string): number {
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.45)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 1;
      g.fillStyle = fill ?? 'rgba(12,18,32,0.82)';
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = color.startsWith('#') ? withAlpha(color, 0.5) : 'rgba(200,215,245,0.35)';
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      rich(label, x0 + w / 2, y + h / 2 + 0.5, size, fill ? '#ffffff' : color, 'center', null);
      return w;
    }

    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 11): void {
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

    function card(r: Rect): void {
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

    const wx = (x: number) => scene.px(x);
    const wy = (y: number) => scene.py(y);
    function path(pts: readonly Vec[], close = false): void {
      g.beginPath();
      pts.forEach(([x, y], i) => (i === 0 ? g.moveTo(wx(x), wy(y)) : g.lineTo(wx(x), wy(y))));
      if (close) g.closePath();
    }

    /* ---------- Weltraum ---------- */
    const starCanvas = document.createElement('canvas');
    let starKey = '';
    function stars(r: Rect): HTMLCanvasElement {
      const dpr = surface.dpr || 1;
      const key = `${r.w}x${r.h}@${dpr}`;
      if (key === starKey) return starCanvas;
      starKey = key;
      starCanvas.width = Math.ceil(r.w * dpr);
      starCanvas.height = Math.ceil(r.h * dpr);
      const sg = starCanvas.getContext('2d')!;
      sg.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Hintergrund: tiefes Blau mit zarter Milchstraße
      const bg = sg.createLinearGradient(0, 0, r.w, r.h);
      bg.addColorStop(0, '#060a17');
      bg.addColorStop(0.55, '#0a1124');
      bg.addColorStop(1, '#05070f');
      sg.fillStyle = bg;
      sg.fillRect(0, 0, r.w, r.h);
      const band = sg.createLinearGradient(0, r.h * 0.9, r.w, r.h * 0.1);
      band.addColorStop(0, 'rgba(90,110,190,0)');
      band.addColorStop(0.45, 'rgba(110,125,200,0.07)');
      band.addColorStop(0.55, 'rgba(150,130,200,0.08)');
      band.addColorStop(1, 'rgba(90,110,190,0)');
      sg.fillStyle = band;
      sg.fillRect(0, 0, r.w, r.h);
      const rnd = seededRandom(7);
      const count = Math.round((r.w * r.h) / 900);
      for (let i = 0; i < count; i++) {
        const x = rnd() * r.w;
        const y = rnd() * r.h;
        const big = rnd() < 0.06;
        const a = 0.25 + rnd() * 0.6;
        const tint = rnd();
        sg.fillStyle = tint < 0.15 ? `rgba(255,214,170,${a})` : tint < 0.3 ? `rgba(180,205,255,${a})` : `rgba(235,240,255,${a})`;
        sg.beginPath();
        sg.arc(x, y, big ? 1.1 + rnd() * 0.5 : 0.45 + rnd() * 0.45, 0, Math.PI * 2);
        sg.fill();
        if (big) {
          sg.fillStyle = `rgba(200,215,255,${a * 0.18})`;
          sg.beginPath();
          sg.arc(x, y, 3.2, 0, Math.PI * 2);
          sg.fill();
        }
      }
      return starCanvas;
    }

    /** Radius des Sterns in Pixeln (nicht maßstäblich, aber nie größer als das Perihel). */
    function starRadius(): number {
      const small = narrow();
      const max = small ? 12 : 15;
      const rp = run.orbit.hitsStar ? Infinity : run.orbit.rP * scene.scale.x;
      return clamp(Math.min(max, rp * 0.45), 4.5, max) * Math.cbrt(clamp(p.M, 0.2, 3));
    }

    function drawStar(cx: number, cy: number, R: number): void {
      const glow = g.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 3.4);
      glow.addColorStop(0, 'rgba(255,200,100,0.55)');
      glow.addColorStop(0.35, 'rgba(255,160,60,0.16)');
      glow.addColorStop(1, 'rgba(255,140,40,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(cx, cy, R * 3.4, 0, Math.PI * 2);
      g.fill();
      const img = ctx.images.get('sun');
      if (img) {
        g.drawImage(img, cx - R, cy - R, 2 * R, 2 * R);
        return;
      }
      const body = g.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
      body.addColorStop(0, '#fffef4');
      body.addColorStop(0.4, '#ffe796');
      body.addColorStop(0.82, '#ffb43c');
      body.addColorStop(1, '#f2801c');
      g.fillStyle = body;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      if (R > 8) {
        // feine Körnung
        const rr = seededRandom(5);
        g.fillStyle = 'rgba(230,120,20,0.18)';
        for (let k = 0; k < 26; k++) {
          const a = rr() * Math.PI * 2;
          const d = Math.sqrt(rr()) * R * 0.85;
          g.beginPath();
          g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 0.6 + rr() * R * 0.08, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    /** Planet mit Tag- und Nachtseite (Licht kommt vom Stern). */
    function drawPlanet(x: number, y: number, R: number, ghost = false): void {
      const [sx, sy] = [wx(0), wy(0)];
      const d = Math.hypot(sx - x, sy - y) || 1;
      const ux = (sx - x) / d;
      const uy = (sy - y) / d;
      g.save();
      if (ghost) g.globalAlpha = 0.45;
      g.shadowColor = 'rgba(120,170,255,0.55)';
      g.shadowBlur = 10;
      const img = ctx.images.get('planet');
      g.beginPath();
      g.arc(x, y, R, 0, Math.PI * 2);
      if (img) {
        g.fillStyle = '#1d3d7a';
        g.fill();
        g.shadowColor = 'transparent';
        g.save();
        g.clip();
        g.drawImage(img, x - R, y - R, 2 * R, 2 * R);
        g.restore();
      } else {
        const body = g.createRadialGradient(x + ux * R * 0.45, y + uy * R * 0.45, R * 0.1, x, y, R * 1.05);
        body.addColorStop(0, '#b9e3ff');
        body.addColorStop(0.35, '#4d9be8');
        body.addColorStop(0.75, '#2a62b8');
        body.addColorStop(1, '#173a78');
        g.fillStyle = body;
        g.fill();
        g.shadowColor = 'transparent';
        // angedeutete Kontinente
        g.save();
        g.beginPath();
        g.arc(x, y, R, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = 'rgba(96,160,90,0.75)';
        g.beginPath();
        g.ellipse(x - R * 0.25, y - R * 0.15, R * 0.42, R * 0.28, 0.6, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.ellipse(x + R * 0.35, y + R * 0.35, R * 0.26, R * 0.2, -0.4, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
      // Nachtseite: zum Stern abgewandte Hälfte abdunkeln
      const night = g.createLinearGradient(x + ux * R, y + uy * R, x - ux * R, y - uy * R);
      night.addColorStop(0, 'rgba(4,8,20,0)');
      night.addColorStop(0.45, 'rgba(4,8,20,0.08)');
      night.addColorStop(0.62, 'rgba(4,8,20,0.6)');
      night.addColorStop(1, 'rgba(4,8,20,0.85)');
      g.fillStyle = night;
      g.beginPath();
      g.arc(x, y, R, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = 'rgba(170,210,255,0.55)';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(x, y, R + 0.5, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }

    /* ---------- Szene: Zeichnen ---------- */
    function drawScaleBar(r: Rect): void {
      const s = scene.scale.x;
      const small = narrow();
      let len = 1;
      for (const c of [0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]) {
        len = c;
        if (c * s >= (small ? 46 : 60)) break;
      }
      const x0 = r.x + (small ? 12 : 16);
      const y0 = r.y + r.h - (small ? 14 : 18);
      const x1 = x0 + len * s;
      g.strokeStyle = INK_MUTED;
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x0, y0 - 4);
      g.lineTo(x0, y0);
      g.lineTo(x1, y0);
      g.lineTo(x1, y0 - 4);
      g.stroke();
      rich(`${fmt.num(len, 2)} ${AE}`, (x0 + x1) / 2, y0 - 9, small ? 11 : 11.5, INK_MUTED, 'center', HALO, 600);
    }

    function drawPlanetOrbits(): void {
      const b = scene.bounds;
      const span = Math.hypot(b.xMax - b.xMin, b.yMax - b.yMin);
      for (const pl of PLANETS) {
        const o = { e: pl.e, p: pl.a * (1 - pl.e * pl.e), omega: (pl.varpi * Math.PI) / 180, h: 1 } as Orbit;
        const rpx = pl.a * scene.scale.x;
        if (rpx < 5 || pl.a * (1 - pl.e) > span) continue;
        g.strokeStyle = withAlpha(PLANET_COLORS[pl.id]!, 0.5);
        g.lineWidth = 1.2;
        g.setLineDash([2, 4]);
        g.beginPath();
        for (let i = 0; i <= 180; i++) {
          const [x, y] = conicPoint(o, (i / 180) * 2 * Math.PI);
          if (i === 0) g.moveTo(wx(x), wy(y));
          else g.lineTo(wx(x), wy(y));
        }
        g.stroke();
        g.setLineDash([]);
      }
    }

    /** Namen der Planeten an ihren Bahnen – an der ersten freien Stelle. */
    function drawPlanetNames(): void {
      if (!p.pl) return;
      const small = narrow();
      const size = small ? 10.5 : 11;
      const sr = regions(surface.width, surface.height).scene;
      for (const pl of PLANETS) {
        if (pl.a * scene.scale.x < 18) continue;
        const o = { e: pl.e, p: pl.a * (1 - pl.e * pl.e), omega: (pl.varpi * Math.PI) / 180, h: 1 } as Orbit;
        const name = pl.name[ctx.lang];
        const w = richWidth(name, size, 600) + 4;
        for (const deg of [125, 235, 55, 305, 160, 200, 20, 340]) {
          const a = (deg * Math.PI) / 180;
          const r = conicRadiusAt(o, a - o.omega);
          const lx = wx(Math.cos(a) * r);
          const ly = wy(Math.sin(a) * r) - 7;
          const box = { x: lx - w / 2, y: ly - size / 2 - 2, w, h: size + 4 };
          if (box.x < sr.x + 6 || box.x + w > sr.x + sr.w - 6 || box.y < sr.y + 40 || box.y + box.h > sr.y + sr.h - 28 || overlaps(box)) continue;
          rich(name, lx, ly, size, withAlpha(PLANET_COLORS[pl.id]!, 0.95), 'center', HALO, 600);
          placed.push(box);
          break;
        }
      }
    }
    const conicRadiusAt = (o: Orbit, nu: number) => o.p / (1 + o.e * Math.cos(nu));

    function drawSectors(): void {
      if (!p.sec) return;
      const cur = run.sectorIndex;
      const [sx, sy] = [wx(0), wy(0)];
      for (const sec of run.sectors) {
        if (sec.pts.length < 2) continue;
        const live = !sec.done || (run.complete && sec.index === cur);
        g.beginPath();
        g.moveTo(sx, sy);
        for (const [x, y] of sec.pts) g.lineTo(wx(x), wy(y));
        if (!sec.done) g.lineTo(wx(run.s.x), wy(run.s.y));
        g.closePath();
        g.fillStyle = secCol(sec.index, live ? 0.5 : 0.3);
        g.fill();
        g.strokeStyle = secCol(sec.index, live ? 0.95 : 0.6);
        g.lineWidth = live ? 1.4 : 1;
        g.stroke();
      }
    }

    /** Nummern der fertigen Abschnitte (wenn genug Platz und frei von anderen Beschriftungen). */
    function drawSectorNumbers(): void {
      if (!p.sec) return;
      const small = narrow();
      const size = small ? 10.5 : 11.5;
      const [sx, sy] = [wx(0), wy(0)];
      for (const sec of run.sectors) {
        if (!sec.done || sec.pts.length < 2) continue;
        const mid = sec.pts[Math.floor(sec.pts.length / 2)]!;
        const mx = wx(mid[0]);
        const my = wy(mid[1]);
        const len = Math.hypot(mx - sx, my - sy);
        const first = sec.pts[0]!;
        const last = sec.pts[sec.pts.length - 1]!;
        const chord = Math.hypot(wx(first[0]) - wx(last[0]), wy(first[1]) - wy(last[1]));
        if (len < 44 || chord < 16) continue;
        const label = String(sec.index + 1);
        const w = richWidth(label, size) + 4;
        for (const f of [0.74, 0.6, 0.86, 0.48]) {
          const x = sx + (mx - sx) * f;
          const y = sy + (my - sy) * f;
          const box = { x: x - w / 2, y: y - size / 2 - 2, w, h: size + 4 };
          if (overlaps(box)) continue;
          rich(label, x, y, size, secCol(sec.index, 1), 'center', HALO, 700);
          placed.push(box);
          break;
        }
      }
    }

    function drawGeometry(): void {
      const o = run.orbit;
      const small = narrow();
      const fs = small ? 11 : 12;
      const s = scene.scale.x;
      const ux = Math.cos(o.omega);
      const uy = Math.sin(o.omega);
      // Bildschirmrichtungen (y nach unten)
      const sux = ux;
      const suy = -uy;
      const [fx, fy] = [wx(0), wy(0)];
      const geo = colGeo();
      const num = p.num;
      const atIdle = run.t === 0;
      if (o.kind === 'circle') {
        const a = (135 * Math.PI) / 180;
        const ex = wx(Math.cos(a) * o.a);
        const ey = wy(Math.sin(a) * o.a);
        g.strokeStyle = geo;
        g.lineWidth = 2;
        g.setLineDash([5, 4]);
        g.beginPath();
        g.moveTo(fx, fy);
        g.lineTo(ex, ey);
        g.stroke();
        g.setLineDash([]);
        rich(num ? `r = ${dist(o.a)} ${AE}` : 'r', (fx + ex) / 2 + 10, (fy + ey) / 2 - 10, fs, geo, 'left');
        return;
      }
      if (!o.bound) {
        // offene Bahn: Perihel und (bei der Hyperbel) Asymptoten
        if (o.kind === 'hyperbola') {
          const beta = Math.acos(1 / o.e);
          const cx = wx(o.center[0]);
          const cy = wy(o.center[1]);
          g.strokeStyle = colGeo(0.45);
          g.lineWidth = 1.2;
          g.setLineDash([6, 6]);
          for (const sgn of [-1, 1]) {
            const ang = Math.atan2(-uy, -ux) + sgn * beta;
            g.beginPath();
            g.moveTo(cx, cy);
            g.lineTo(cx + Math.cos(ang) * 3000, cy - Math.sin(ang) * 3000);
            g.stroke();
          }
          g.setLineDash([]);
        }
        const P: Vec = [o.rP * ux, o.rP * uy];
        g.fillStyle = geo;
        g.beginPath();
        g.arc(wx(P[0]), wy(P[1]), 3.5, 0, Math.PI * 2);
        g.fill();
        if (!(atIdle && Math.abs(o.rP - p.r0) < 1e-6)) labelAt(small ? 'P' : ctx.t('perihel'), wx(P[0]), wy(P[1]), sux, suy, geo, fs, 8);
        return;
      }
      const P: Vec = [o.rP * ux, o.rP * uy];
      const A: Vec = [-o.rA * ux, -o.rA * uy];
      const C = o.center;
      const F2 = o.focus2;
      const nx = -uy;
      const ny = ux;
      const B1: Vec = [C[0] + o.b * nx, C[1] + o.b * ny];
      const B2: Vec = [C[0] - o.b * nx, C[1] - o.b * ny];
      // Achsen gestrichelt
      g.strokeStyle = colGeo(0.55);
      g.lineWidth = 1.2;
      g.setLineDash([6, 5]);
      g.beginPath();
      g.moveTo(wx(P[0]), wy(P[1]));
      g.lineTo(wx(A[0]), wy(A[1]));
      g.moveTo(wx(B1[0]), wy(B1[1]));
      g.lineTo(wx(B2[0]), wy(B2[1]));
      g.stroke();
      g.setLineDash([]);
      // große Halbachse a (Mittelpunkt → Aphel) und kleine Halbachse b
      const seg = (q: Vec, r: Vec, width: number, color: string) => {
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(wx(q[0]), wy(q[1]));
        g.lineTo(wx(r[0]), wy(r[1]));
        g.stroke();
      };
      seg(C, A, 3, geo);
      const thin = o.b * s < 16;
      if (!thin) seg(C, B1, 3, colGeo(0.85));
      // lineare Exzentrizität: Klammer zwischen Mittelpunkt und F₁ (unterhalb der Achse)
      const cpx = o.c * s;
      const off = small ? 9 : 11;
      const onx = -nx;
      const ony = ny; // Bildschirm: −n̂ (y gespiegelt)
      if (cpx > 18) {
        const ax0 = wx(C[0]) + onx * off;
        const ay0 = wy(C[1]) + ony * off;
        const ax1 = fx + onx * off;
        const ay1 = fy + ony * off;
        g.strokeStyle = colGeo(0.9);
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(wx(C[0]) + onx * 4, wy(C[1]) + ony * 4);
        g.lineTo(ax0 + onx * 3, ay0 + ony * 3);
        g.moveTo(ax0, ay0);
        g.lineTo(ax1, ay1);
        g.moveTo(fx + onx * 4, fy + ony * 4);
        g.lineTo(ax1 + onx * 3, ay1 + ony * 3);
        g.stroke();
        const lab = num ? `${ctx.t('linEcc')} = ${dist(o.c)} ${AE}` : ctx.t('linEcc');
        if (richWidth(lab, fs) < cpx + 30) labelAt(lab, (ax0 + ax1) / 2, (ay0 + ay1) / 2, onx, ony, geo, fs, 4);
      }
      // Beschriftungen der Halbachsen
      const am = [(wx(C[0]) + wx(A[0])) / 2, (wy(C[1]) + wy(A[1])) / 2];
      labelAt(num ? `a = ${dist(o.a)} ${AE}` : 'a', am[0]!, am[1]!, onx, ony, geo, fs + 0.5, 6);
      const bm = [(wx(C[0]) + wx(B1[0])) / 2, (wy(C[1]) + wy(B1[1])) / 2];
      if (!thin) labelAt(num ? `b = ${dist(o.b)} ${AE}` : 'b', bm[0]!, bm[1]!, -sux, -suy, colGeo(0.95), fs, 6);
      // Mittelpunkt und zweiter Brennpunkt
      g.fillStyle = geo;
      g.beginPath();
      g.arc(wx(C[0]), wy(C[1]), 2.6, 0, Math.PI * 2);
      g.fill();
      const f2x = wx(F2[0]);
      const f2y = wy(F2[1]);
      g.strokeStyle = INK;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(f2x - 5, f2y - 5);
      g.lineTo(f2x + 5, f2y + 5);
      g.moveTo(f2x + 5, f2y - 5);
      g.lineTo(f2x - 5, f2y + 5);
      g.stroke();
      labelAt('F_[2]', f2x, f2y, -onx, -ony, INK, fs, 7);
      // Perihel und Aphel mit Geschwindigkeiten
      const k = kLive() * s;
      const startAt = (q: Vec) => atIdle && Math.hypot(q[0] - p.r0, q[1]) < 1e-6 * Math.max(1, p.r0);
      for (const [q, v, name, sign] of [
        [P, o.vP, 'P', 1],
        [A, o.vA, 'A', -1],
      ] as const) {
        const qx = wx(q[0]);
        const qy = wy(q[1]);
        g.fillStyle = geo;
        g.beginPath();
        g.arc(qx, qy, 3.5, 0, Math.PI * 2);
        g.fill();
        const out = name === 'P' ? 1 : -1;
        const word = name === 'P' ? ctx.t('perihel') : ctx.t('aphel');
        const isStart = startAt(q);
        // Läuft der Planet gerade hier vorbei, zeigt sein eigener Pfeil die Geschwindigkeit.
        const near = run.t > 0 && Math.hypot(wx(run.s.x) - qx, wy(run.s.y) - qy) < 70;
        if (isStart || (name === 'P' && o.hitsStar)) continue;
        labelAt(small ? name : word, qx, qy, sux * out, suy * out, geo, fs, 8);
        if (near || !p.vec) continue;
        // Geschwindigkeit im Perihel bzw. Aphel (tangential); vor dem Start nur als Text
        const tx = nx * sign * Math.sign(o.h || 1);
        const ty = -ny * sign * Math.sign(o.h || 1);
        const vLab = num ? `v_[${name}] = ${n2(v, 1)} km/s` : `v_[${name}]`;
        if (atIdle) {
          labelAt(vLab, qx, qy, tx, ty, colV(0.95), small ? 10.5 : 11, 10);
        } else {
          const len = clamp(v * k, 10, 160);
          arrowPx(qx, qy, qx + tx * len, qy + ty * len, colV(0.6), 2.2, 9);
          labelAt(vLab, qx + tx * len, qy + ty * len, tx, ty, colV(0.95), small ? 10.5 : 11, 4);
        }
      }
    }

    /** Fadenkonstruktion: r₁ + r₂ = 2a vom Planeten zu beiden Brennpunkten. */
    function drawString(): void {
      const o = run.orbit;
      if (!p.str || !o.bound || o.kind === 'circle') return;
      const small = narrow();
      const px = wx(run.s.x);
      const py = wy(run.s.y);
      const [f1x, f1y] = [wx(0), wy(0)];
      const f2x = wx(o.focus2[0]);
      const f2y = wy(o.focus2[1]);
      g.strokeStyle = colStr(0.95);
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(f1x, f1y);
      g.lineTo(px, py);
      g.lineTo(f2x, f2y);
      g.stroke();
      // Stecknadeln
      for (const [x, y] of [
        [f1x, f1y],
        [f2x, f2y],
      ] as const) {
        g.fillStyle = colStr();
        g.beginPath();
        g.arc(x, y, 2.6, 0, Math.PI * 2);
        g.fill();
      }
      const fs = small ? 11 : 12;
      const lab = (x0: number, y0: number, t: string) => {
        const mx = (x0 + px) / 2;
        const my = (y0 + py) / 2;
        const d = Math.hypot(px - x0, py - y0) || 1;
        labelAt(t, mx, my, -(py - y0) / d, (px - x0) / d, colStr(), fs, 5);
      };
      lab(f1x, f1y, 'r_[1]');
      lab(f2x, f2y, 'r_[2]');
      const r1 = Math.hypot(run.s.x, run.s.y);
      const r2 = Math.hypot(run.s.x - o.focus2[0], run.s.y - o.focus2[1]);
      const r = regions(surface.width, surface.height).scene;
      const text = p.num ? `r_[1] + r_[2] = ${dist(r1)} + ${dist(r2)} = ${dist(r1 + r2)} ${AE} = 2a` : 'r_[1] + r_[2] = 2a';
      pill(r.x + r.w / 2, r.y + r.h - (small ? 54 : 60), text, colStr(), 'center', small ? 11 : 12);
    }

    /** Ringe, Winkel und Startpfeil vor dem Start. */
    function drawLaunch(): void {
      const small = narrow();
      const s = scene.scale.x;
      const k = kArrow() * s;
      const px = wx(p.r0);
      const py = wy(0);
      const vk = circularSpeed(p.r0, p.M);
      const vf = escapeSpeed(p.r0, p.M);
      const fs = small ? 10.5 : 11.5;
      // Ringe v_K und v_F um den Startpunkt
      const rings: [number, string, string, string, boolean][] = [
        [vk, colGeo(snapped === 'vk' ? 0.95 : 0.6), colGeo(), p.num ? `v_[K] = ${n2(vk, 1)} km/s` : 'v_[K]', snapped === 'vk'],
        [vf, colF(snapped === 'vf' ? 0.95 : 0.6), colF(), p.num ? `v_[F] = ${n2(vf, 1)} km/s` : 'v_[F]', snapped === 'vf'],
      ];
      for (const [v, color, ink, label, hot] of rings) {
        g.strokeStyle = color;
        g.lineWidth = hot ? 2.2 : 1.3;
        g.setLineDash(hot ? [] : [4, 4]);
        g.beginPath();
        g.arc(px, py, v * k, 0, Math.PI * 2);
        g.stroke();
        g.setLineDash([]);
        // Beschriftung unten am Ring (innerhalb der Szene)
        labelAt(label, px, py + v * k, 0, 1, ink, fs, 3);
      }
      // Zielmarke „Kreisbahn“: v_K senkrecht zum Fahrstrahl
      const mx = px;
      const my = py - vk * k;
      g.fillStyle = colGeo(0.9);
      g.beginPath();
      g.moveTo(mx, my - 5);
      g.lineTo(mx + 5, my);
      g.lineTo(mx, my + 5);
      g.lineTo(mx - 5, my);
      g.closePath();
      g.fill();
      // Fahrstrahl verlängert und Winkel α
      const a = (p.al * Math.PI) / 180;
      g.strokeStyle = 'rgba(214,224,245,0.45)';
      g.lineWidth = 1.2;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(px, py);
      g.lineTo(px + 40, py);
      g.stroke();
      g.setLineDash([]);
      const ar = small ? 20 : 24;
      g.strokeStyle = 'rgba(232,238,252,0.85)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(px, py, ar, 0, -a, true);
      g.stroke();
      if (Math.abs(p.al - 90) < 0.5) {
        // rechter Winkel: Punkt im Winkelbogen
        g.fillStyle = 'rgba(232,238,252,0.9)';
        g.beginPath();
        g.arc(px + Math.cos(a / 2) * ar * 0.55, py - Math.sin(a / 2) * ar * 0.55, 1.6, 0, Math.PI * 2);
        g.fill();
      }
      rich(`α = ${fmt.num(p.al, 0)}°`, px + Math.cos(a / 2) * (ar + 14) + 6, py - Math.sin(a / 2) * (ar + 14), fs, INK, 'left');
      // Startpfeil
      const tx = px + Math.cos(a) * p.v0 * k;
      const ty = py - Math.sin(a) * p.v0 * k;
      arrowPx(px, py, tx, ty, colV(), small ? 3.2 : 3.8, small ? 11 : 13);
      const lab = p.num ? `v_[0] = ${n2(p.v0, 2)} km/s` : 'v_[0]';
      labelAt(lab, tx, ty, Math.cos(a), -Math.sin(a), colV(), small ? 11.5 : 12.5, 15);
    }

    /** Pfeile v und F_G am laufenden Planeten. */
    function drawLiveVectors(x: number, y: number, R: number): void {
      if (!p.vec) return;
      const sr = regions(surface.width, surface.height).scene;
      if (x < sr.x + 4 || x > sr.x + sr.w - 4 || y < sr.y + 4 || y > sr.y + sr.h - 4) return;
      const small = narrow();
      const s = scene.scale.x;
      const v = Math.hypot(run.s.vx, run.s.vy);
      const sx = wx(0);
      const sy = wy(0);
      const d = Math.hypot(sx - x, sy - y) || 1;
      // Gravitationskraft: Länge ∝ 1/r² (bei r₀ etwa 0,24 · r₀)
      const r = run.r;
      const lenF = clamp(((0.24 * p.r0 * p.r0 * p.r0) / (r * r)) * s, 10, Math.max(10, Math.min(d * 0.62, d - starRadius() - 8)));
      arrowPx(x + ((sx - x) / d) * R * 0.6, y + ((sy - y) / d) * R * 0.6, x + ((sx - x) / d) * (R * 0.6 + lenF), y + ((sy - y) / d) * (R * 0.6 + lenF), colF(), small ? 2.6 : 3, small ? 9 : 11);
      if (run.t > 0) {
        const vx = run.s.vx / v;
        const vy = -run.s.vy / v;
        const lenV = clamp(toKmsLocal(v) * kLive() * s, 10, Math.min(sr.w, sr.h) * 0.42);
        arrowPx(x, y, x + vx * lenV, y + vy * lenV, colV(), small ? 3 : 3.4, small ? 10 : 12);
        labelAt(p.num ? `v = ${n2(run.v, 1)} km/s` : 'v', x + vx * lenV, y + vy * lenV, vx, vy, colV(), small ? 11 : 12, 6);
      }
      labelAt('F_[G]', x + ((sx - x) / d) * (R * 0.6 + lenF), y + ((sy - y) / d) * (R * 0.6 + lenF), -(sy - y) / d, (sx - x) / d, colF(), small ? 11 : 12, 6);
    }
    const toKmsLocal = (v: number) => (v * AU) / YEAR / 1000;

    function drawScene(): void {
      const r = regions(surface.width, surface.height).scene;
      const small = narrow();
      const o = run.orbit;
      placed = [];
      scene.begin();
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      g.drawImage(stars(r), r.x, r.y, r.w, r.h);
      if (p.pl) drawPlanetOrbits();
      drawSectors();
      // vorhergesagte Bahn (gestrichelt)
      g.strokeStyle = o.hitsStar ? colF(0.6) : 'rgba(205,218,245,0.62)';
      g.lineWidth = 1.5;
      g.setLineDash([5, 6]);
      path(conicPts, false);
      g.stroke();
      g.setLineDash([]);
      // zurückgelegte Bahn
      if (run.t > 0 && run.trail.length > 1) {
        g.save();
        g.shadowColor = 'rgba(140,190,255,0.6)';
        g.shadowBlur = 6;
        g.strokeStyle = 'rgba(226,236,255,0.92)';
        g.lineWidth = 2;
        g.lineJoin = 'round';
        path(run.trail);
        if (!run.complete) g.lineTo(wx(run.s.x), wy(run.s.y));
        g.stroke();
        g.restore();
      }
      if (p.geo) drawGeometry();
      // Fahrstrahl
      const px = wx(run.s.x);
      const py = wy(run.s.y);
      const [sx, sy] = [wx(0), wy(0)];
      if (p.sec && run.t > 0) {
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(px, py);
        g.stroke();
      }
      drawString();
      const R = starRadius();
      drawStar(sx, sy, R);
      placed.push({ x: sx - R - 2, y: sy - R - 2, w: 2 * R + 4, h: 2 * R + 4 });
      if (p.geo && o.bound && o.kind !== 'circle') labelAt('F_[1]', sx - R * 0.7, sy - R * 0.7, -0.7, -0.7, INK, small ? 11 : 12, 4);
      const atIdle = run.t === 0;
      if (atIdle) drawLaunch();
      const PR = small ? 6.5 : 8;
      if (!run.crashed) {
        drawLiveVectors(px, py, PR);
        placed.push({ x: px - PR - 2, y: py - PR - 2, w: 2 * PR + 4, h: 2 * PR + 4 });
      }
      drawPlanetNames();
      drawSectorNumbers();
      if (!run.crashed) drawPlanet(px, py, PR);
      // Planet außerhalb des Bildes: Hinweis am Rand
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) {
        const cx = r.x + r.w / 2;
        const cy = r.y + r.h / 2;
        const dx = px - cx;
        const dy = py - cy;
        const f = Math.min((r.w / 2 - 22) / Math.abs(dx || 1e-9), (r.h / 2 - 22) / Math.abs(dy || 1e-9));
        const ex = cx + dx * f;
        const ey = cy + dy * f;
        const d = Math.hypot(dx, dy) || 1;
        arrowPx(ex - (dx / d) * 16, ey - (dy / d) * 16, ex, ey, INK, 2.4, 9);
        labelAt(`r = ${dist(run.r)} ${AE}`, ex - (dx / d) * 16, ey - (dy / d) * 16, -dx / d, -dy / d, INK, small ? 11 : 12, 6);
      }
      // Anzeigen oben
      const size = small ? 11 : 12;
      const tText = `t = ${timeText(run.t)}`;
      const w1 = pill(r.x + 8, r.y + 8, run.closed && p.num && !small ? `${tText} · T = ${timeText(run.tRef)}` : tText, INK, 'left', size);
      if (run.closed && run.t >= run.tRef && !small) {
        const laps = Math.floor(run.t / run.tRef + 1e-9);
        pill(r.x + 8 + w1 + 6, r.y + 8, tr('laps', { n: String(laps) }), INK_MUTED, 'left', size);
      }
      const eps = o.kind === 'circle' ? '' : ` · ${ctx.t('eps')} = ${o.kind === 'parabola' ? '1' : fmt.fixed(o.e, small ? 2 : 3)}`;
      pill(r.x + r.w - 8, r.y + 8, kindName(o) + (p.num && !o.hitsStar ? eps : ''), '#ffffff', 'right', size, mixColor(kindColor(o), '#000000', 0.25, 0.92));
      // Meldungen
      const msgY = r.y + (small ? 38 : 42);
      if (done === 'crash') pill(r.x + r.w / 2, msgY, ctx.t('msgCrash'), '#fff', 'center', size + 0.5, colF(0.92));
      else if (done === 'escape') pill(r.x + r.w / 2, msgY, ctx.t(small ? 'msgEscapeShort' : 'msgEscape'), '#fff', 'center', size + 0.5, sp(3, 0.92));
      else if (done === 'far') pill(r.x + r.w / 2, msgY, tr(small ? 'msgFarShort' : 'msgFar', { T: timeText(o.T) }), '#fff', 'center', size + 0.5, sp(5, 0.9));
      drawScaleBar(r);
      rich(ctx.t(small ? 'notToScaleShort' : 'notToScale'), r.x + r.w - 12, r.y + r.h - (small ? 14 : 16), small ? 10.5 : 11, 'rgba(200,212,240,0.7)', 'right', null, 600);
      g.restore();
      scene.end();
    }

    /* ---------- Auswertung: 2. Keplersches Gesetz ---------- */
    function panelTitle(R: Rect, title: string, sub?: string): void {
      const small = narrow() || R.w < 360;
      rich(title, R.x + 14, R.y + 19, small ? 12.5 : 13.5, ctx.theme.text, 'left', null, 700);
      if (sub) rich(sub, R.x + 14, R.y + 37, small ? 11 : 11.5, ctx.theme.muted, 'left', null, 600);
    }

    function emptyNote(cx: number, cy: number, msg: string): void {
      const small = narrow();
      g.font = `600 ${small ? 11.5 : 12}px ${ctx.theme.font}`;
      const w = g.measureText(msg).width + 24;
      g.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.92)';
      roundRect(g, cx - w / 2, cy - 13, w, 26, 13);
      g.fill();
      g.strokeStyle = withAlpha(ctx.theme.muted, 0.3);
      g.lineWidth = 1;
      g.stroke();
      rich(msg, cx, cy + 0.5, small ? 11.5 : 12, ctx.theme.muted, 'center', null, 600);
    }

    function drawAreas(R: Rect): void {
      const theme = ctx.theme;
      const small = narrow() || R.w < 360;
      const parts2 = panelParts(R);
      const B = parts2.bars;
      const dtText = durText(run.dtSector);
      panelTitle(R, ctx.t('k2Title'), run.closed ? tr('k2Dt', { n: String(run.n), dt: dtText }) : tr('k2DtOpen', { dt: dtText }));
      const o = run.orbit;
      const expected = o.arealVelocity * run.dtSector;
      const list = run.sectors.filter((s) => s.area > 0 || !s.done).slice(-run.n);
      const count = run.closed ? run.n : Math.max(run.n, list.length);
      const yMax = expected * 1.3;
      const left = B.x + (small ? 30 : 34);
      const right = B.x + B.w;
      const base = B.y + B.h - 14;
      const top = B.y + 6;
      const Y = (A: number) => base - (A / yMax) * (base - top);
      // Achse und Bezugslinie
      g.strokeStyle = withAlpha(theme.muted, 0.5);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(left, top - 2);
      g.lineTo(left, base);
      g.lineTo(right, base);
      g.stroke();
      rich(ctx.t('k2Axis'), left - 4, top - 1, small ? 10.5 : 11, theme.muted, 'left', null, 600);
      const slot = (right - left - 6) / count;
      const bw = Math.min(26, slot * 0.72);
      const started = run.t > 0;
      // Bezugslinie: erwartete Fläche L/(2m) · Δt
      g.strokeStyle = theme.text;
      g.globalAlpha = 0.65;
      g.setLineDash([4, 4]);
      g.beginPath();
      g.moveTo(left, Y(expected));
      g.lineTo(right, Y(expected));
      g.stroke();
      g.setLineDash([]);
      g.globalAlpha = 1;
      const eqText = tr('k2Equal', { A: p.num ? `${sig(expected, 3)} ${AE}²` : 'A' });
      rich(eqText, right, Y(expected) - 9, small ? 11 : 11.5, theme.text, 'right', panelHalo(), 700);
      for (let i = 0; i < count; i++) {
        const sec = run.closed ? run.sectors.find((s) => s.index === i) : list[i];
        const x = left + 6 + slot * i + (slot - bw) / 2;
        const idx = sec ? sec.index : i;
        if (!sec || !started) {
          g.strokeStyle = withAlpha(theme.muted, 0.35);
          g.setLineDash([3, 3]);
          roundRect(g, x + 0.5, Y(expected) + 0.5, bw - 1, base - Y(expected) - 1, 3);
          g.stroke();
          g.setLineDash([]);
        } else {
          const live = !sec.done || (run.complete && sec.index === run.sectorIndex);
          const yTop = Y(sec.area);
          const col = theme.series[idx % 2 === 0 ? 3 : 5]!;
          const grad = g.createLinearGradient(0, yTop, 0, base);
          grad.addColorStop(0, withAlpha(col, live ? 1 : 0.85));
          grad.addColorStop(1, withAlpha(col, live ? 0.7 : 0.5));
          g.fillStyle = grad;
          roundRect(g, x, yTop, bw, base - yTop, 3);
          g.fill();
          if (live) {
            g.strokeStyle = theme.text;
            g.lineWidth = 1.5;
            roundRect(g, x - 1, yTop - 1, bw + 2, base - yTop + 2, 4);
            g.stroke();
          }
        }
        if (slot >= 13 || i % 2 === 0) rich(String(idx + 1), x + bw / 2, base + 8, small ? 10 : 10.5, theme.muted, 'center', null, 600);
      }
      if (!started) emptyNote((left + right) / 2, (top + base) / 2 - 8, ctx.t('k2Empty'));
      drawSpeedChart(R, parts2.chartTitle);
    }

    function chartRanges(): { tf: number; xMax: number } {
      const tf = daysMode() ? 365.25 : 1;
      if (run.closed) return { tf, xMax: run.tRef * tf };
      return { tf, xMax: niceCeil(Math.max(exitTime, run.t) * 1.04 * tf) };
    }

    function drawSpeedChart(R: Rect, titleY: number): void {
      const theme = ctx.theme;
      const small = narrow() || R.w < 360;
      rich(ctx.t('vTitle'), R.x + 14, titleY, small ? 12 : 13, theme.text, 'left', null, 700);
      const o = run.orbit;
      const { tf, xMax } = chartRanges();
      const vRef = vPeak();
      const vTop = niceTop(Math.max(vRef, run.vMax), chart.rect.h - 18 - 24);
      chart.setAxes({ x: { label: ctx.t(daysMode() ? 'axisTd' : 'axisTa') }, y: { label: ctx.t('axisV') } });
      chart.setRangePadded([0, xMax], [0, vTop], { left: small ? 36 : 42, right: 14, top: 18, bottom: 24 });
      chart.begin();
      // Zeitabschnitte als Streifen (gleiche Breite = gleiche Zeit)
      if (p.sec) {
        const dt = run.dtSector * tf;
        const t0 = run.closed ? 0 : Math.max(0, Math.floor(run.t / run.dtSector) - run.n + 1) * dt;
        for (let i = 0; t0 + i * dt < xMax; i++) {
          const a = t0 + i * dt;
          const idx = Math.round(a / dt);
          chart.polygon(
            [
              [a, 0],
              [Math.min(xMax, a + dt), 0],
              [Math.min(xMax, a + dt), vTop * 2],
              [a, vTop * 2],
            ],
            { fill: theme.series[idx % 2 === 0 ? 3 : 5]!, alpha: theme.dark ? 0.1 : 0.08 },
          );
        }
      }
      chart.grid({ minor: false });
      chart.axes();
      const samples = run.samples;
      if (run.t > 0 && samples.length > 1) {
        chart.polyline(
          samples.map((q) => [q.t * tf, q.v] as [number, number]),
          { color: theme.series[0], width: 2.6 },
        );
        const cur = run.closed ? (run.t % run.tRef) * tf : run.t * tf;
        const vNow = run.v;
        chart.point(cur, vNow, { color: theme.series[0], radius: 5 });
        if (o.bound && run.complete && o.kind !== 'circle') {
          const tP = samples.reduce((b, q) => (q.v > b.v ? q : b), samples[0]!);
          const tA = samples.reduce((b, q) => (q.v < b.v ? q : b), samples[0]!);
          const cr = chart.rect;
          for (const [q, name, dy] of [
            [tP, 'P', -12],
            [tA, 'A', -12],
          ] as const) {
            const label = p.num ? `v_[${name}] = ${n2(q.v, 1)}` : `v_[${name}]`;
            const w = richWidth(label, 11.5);
            const x = clamp(chart.px(q.t * tf), cr.x + w / 2 + 44, cr.x + cr.w - w / 2 - 6);
            rich(label, x, chart.py(q.v) + dy, small ? 11 : 11.5, theme.series[0]!, 'center', panelHalo(), 700);
          }
        }
      } else {
        const cr = chart.rect;
        emptyNote(cr.x + cr.w / 2 + 14, cr.y + cr.h * 0.4, ctx.t('chartEmpty'));
      }
      chart.end();
    }

    /* ---------- Auswertung: 3. Keplersches Gesetz ---------- */
    function drawTable(R: Rect): void {
      const theme = ctx.theme;
      const small = narrow() || R.w < 360;
      panelTitle(R, ctx.t('k3Title'));
      const fs = small ? 11.5 : 12;
      const pad = 12;
      const xName = R.x + pad;
      const cA = R.x + R.w * (small ? 0.5 : 0.49);
      const cT = R.x + R.w * (small ? 0.71 : 0.7);
      const cQ = R.x + R.w - pad;
      const lay = k3Layout(R);
      const headY = lay.headY;
      // Kopfzeile (zweizeilig)
      const head = (x: number, a: string, b: string, align: CanvasTextAlign) => {
        rich(a, x, headY, fs, theme.text, align, null, 700);
        rich(b, x, headY + 14, small ? 10 : 10.5, theme.muted, align, null, 600);
      };
      head(xName, ctx.t('k3Body'), '', 'left');
      head(cA, ctx.t('k3a'), ctx.t('k3aUnit'), 'right');
      head(cT, ctx.t('k3T'), ctx.t('k3TUnit'), 'right');
      head(cQ, ctx.t('k3Q'), ctx.t('k3QUnit'), 'right');
      g.strokeStyle = withAlpha(theme.muted, 0.35);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(R.x + pad, headY + 24.5);
      g.lineTo(R.x + R.w - pad, headY + 24.5);
      g.stroke();
      // Zeilen
      interface Row {
        name: string;
        dot: string;
        a: string;
        T: string;
        q: string;
        own: boolean;
        hot: boolean;
        note?: string;
      }
      const rows: Row[] = PLANETS.map((pl) => {
        const T = planetPeriod(pl);
        return {
          name: pl.name[ctx.lang],
          dot: PLANET_COLORS[pl.id]!,
          a: fmt.fixed(pl.a, pl.a < 10 ? 3 : 2),
          T: fmt.fixed(T, T < 10 ? 3 : T < 100 ? 2 : 1),
          q: fmt.fixed(keplerRatio(pl.a, T) * 1e19, 3),
          own: false,
          hot: false,
        };
      });
      const ownColor = theme.series[0]!;
      for (const m of meas) {
        rows.push({
          name: Math.abs(m.M - 1) < 1e-9 ? tr('k3Own', { n: String(m.id) }) : tr('k3OwnM', { n: String(m.id), M: fmt.num(m.M, 1) }),
          dot: ownColor,
          a: p.num ? fmt.fixed(m.a, m.a < 10 ? 3 : 2) : '?',
          T: p.num ? fmt.fixed(m.T, m.T < 10 ? 3 : 2) : '?',
          q: p.num ? fmt.fixed(keplerRatio(m.a, m.T) * 1e19, 3) : '?',
          own: true,
          hot: m.id === lastMeasId && run.complete,
        });
      }
      const measuredNow = run.complete;
      if (!measuredNow) {
        const note = !run.orbit.bound || run.orbit.hitsStar ? ctx.t('k3Open') : !run.closed ? ctx.t('k3Far') : ctx.t('k3PendingNote');
        rows.push({ name: ctx.t('k3Pending'), dot: ownColor, a: '', T: '', q: '', own: true, hot: true, note });
      }
      const { top, foot, rh } = lay;
      let y = top + rh / 2;
      let sepDone = false;
      for (const row of rows) {
        if (row.own && !sepDone) {
          sepDone = true;
          g.strokeStyle = withAlpha(theme.muted, 0.25);
          g.beginPath();
          g.moveTo(R.x + pad, y - rh / 2 + 0.5);
          g.lineTo(R.x + R.w - pad, y - rh / 2 + 0.5);
          g.stroke();
        }
        if (row.hot) {
          g.fillStyle = withAlpha(ownColor, theme.dark ? 0.16 : 0.09);
          roundRect(g, R.x + 6, y - rh / 2 + 1, R.w - 12, rh - 2, 5);
          g.fill();
          if (pop.running && row.note === undefined) {
            g.strokeStyle = withAlpha(ownColor, 0.8 * (1 - pop.t));
            g.lineWidth = 2;
            roundRect(g, R.x + 6, y - rh / 2 + 1, R.w - 12, rh - 2, 5);
            g.stroke();
          }
        }
        g.fillStyle = row.dot;
        g.beginPath();
        g.arc(xName + 4, y, 4, 0, Math.PI * 2);
        g.fill();
        const col = row.own ? ownColor : theme.text;
        rich(row.name, xName + 13, y + 0.5, fs, col, 'left', null, row.own ? 700 : 600);
        if (row.note) rich(row.note, cQ, y + 0.5, small ? 10.5 : 11, theme.muted, 'right', null, 600);
        else {
          rich(row.a, cA, y + 0.5, fs, theme.text, 'right', null, 500);
          rich(row.T, cT, y + 0.5, fs, theme.text, 'right', null, 500);
          rich(row.q, cQ, y + 0.5, fs, row.own ? ownColor : theme.text, 'right', null, 700);
        }
        y += rh;
      }
      if (lay.chart) drawLogChart(R, lay.chartTitle);
      // Fußzeile
      const fy = R.y + R.h - foot + 12;
      const q = fmt.fixed(keplerConstant(p.M) * 1e19, 3);
      const formula = small ? tr('k3FormulaShort', { q }) : tr('k3Formula', { q, M: fmt.num(p.M, 1) });
      rich(formula, R.x + R.w / 2, fy, small ? 10.5 : 11, theme.text, 'center', null, 600);
      rich(ctx.t('k3Note'), R.x + R.w / 2, fy + (small ? 15 : 17), small ? 10 : 10.5, theme.muted, 'center', null, 500);
    }

    /** Doppelt-logarithmisches Diagramm T über a: Gerade mit Steigung 3/2. */
    function drawLogChart(R: Rect, titleY: number): void {
      const theme = ctx.theme;
      const small = narrow() || R.w < 360;
      rich(ctx.t('logTitle'), R.x + 14, titleY, small ? 12 : 12.5, theme.text, 'left', null, 700);
      // Achsen in Zehnerpotenzen: x = lg(a/AE), y = lg(T/a)
      const x0 = Math.log10(0.2);
      const x1 = Math.log10(60);
      const y0 = Math.log10(0.05);
      const y1 = Math.log10(500);
      chart.setRangePadded([x0, x1], [y0, y1], { left: 34, right: 14, top: 16, bottom: 22 });
      chart.begin();
      const cr = chart.rect;
      const L = chart.px(x0);
      const B = chart.py(y0);
      const Rr = chart.px(x1);
      const T = chart.py(y1);
      // Gitter und Beschriftung der Zehnerpotenzen
      g.lineWidth = 1;
      g.strokeStyle = theme.grid;
      g.beginPath();
      for (let k = Math.ceil(x0); k <= x1; k++) {
        g.moveTo(Math.round(chart.px(k)) + 0.5, B);
        g.lineTo(Math.round(chart.px(k)) + 0.5, T);
      }
      for (let k = Math.ceil(y0); k <= y1; k++) {
        g.moveTo(L, Math.round(chart.py(k)) + 0.5);
        g.lineTo(Rr, Math.round(chart.py(k)) + 0.5);
      }
      g.stroke();
      const tick = (v: number) => fmt.num(10 ** v, v < 0 ? -v : 0);
      for (let k = Math.ceil(x0); k <= x1; k++) rich(tick(k), chart.px(k), B + 10, 11, theme.muted, 'center', null, 500);
      for (let k = Math.ceil(y0); k <= y1; k++) rich(tick(k), L - 5, chart.py(k), 11, theme.muted, 'right', null, 500);
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(L, T - 4);
      g.lineTo(L, B);
      g.lineTo(Rr + 4, B);
      g.stroke();
      rich(ctx.t('logAxisA'), Rr, B - 9, 11, theme.text, 'right', panelHalo(), 600);
      rich(ctx.t('logAxisT'), L + 6, T + 2, 11, theme.text, 'left', panelHalo(), 600);
      // Kepler-Gerade für die aktuelle Zentralmasse
      chart.segment([x0, Math.log10(keplerPeriod(10 ** x0, p.M))], [x1, Math.log10(keplerPeriod(10 ** x1, p.M))], { color: theme.muted, width: 1.6, dash: [5, 4] });
      for (const pl of PLANETS) chart.point(Math.log10(pl.a), Math.log10(planetPeriod(pl)), { color: PLANET_COLORS[pl.id]!, radius: 4.5 });
      for (const m of meas) chart.point(Math.log10(m.a), Math.log10(m.T), { color: theme.series[0], radius: m.id === lastMeasId ? 6 : 4.5, hollow: m.id !== lastMeasId });
      rich(ctx.t('logSlope'), cr.x + cr.w - 10, B - 26, small ? 10.5 : 11, theme.muted, 'right', panelHalo(), 600);
      chart.end();
    }

    /* ---------- Auswertung: Energie ---------- */
    function drawEnergy(R: Rect): void {
      const theme = ctx.theme;
      const small = narrow() || R.w < 360;
      const parts2 = panelParts(R);
      const B = parts2.bars;
      const o = run.orbit;
      const m = GM_SUN * p.M;
      const potMax = m / (rLow() * AU);
      const kinMax = 0.5 * (vPeak() * 1000) ** 2;
      const k = Math.floor(Math.log10(Math.max(potMax, kinMax) / 2));
      panelTitle(R, ctx.t(small ? 'enTitleShort' : 'enTitle'), tr('enUnit', { k: sup(k) }));
      const unit = 10 ** k;
      const en = energies(run.s, p.M);
      const rows: [string, number, string][] = [
        ['E_[kin]', en.kin, theme.series[0]!],
        ['E_[pot]', en.pot, theme.series[1]!],
        [de ? 'E_[ges]' : 'E_[tot]', en.total, theme.series[4]!],
      ];
      const labW = small ? 40 : 46;
      const x0 = B.x + labW;
      const x1 = B.x + B.w;
      const neg = potMax;
      const pos = Math.max(kinMax, en.total, 0);
      const xz = x0 + ((x1 - x0) * neg) / (neg + pos);
      const X = (v: number) => xz + ((x1 - x0) * v) / (neg + pos);
      const statusH = 24;
      const rowH = (B.h - statusH - 4) / 3;
      rows.forEach(([name, val, col], i) => {
        const yc = B.y + 8 + rowH * i + rowH / 2;
        const bh = clamp(rowH * 0.42, 9, 16);
        rich(name, B.x, yc, small ? 12 : 13, col, 'left', null, 700);
        g.fillStyle = withAlpha(theme.muted, 0.1);
        roundRect(g, x0, yc - bh / 2, x1 - x0, bh, 3);
        g.fill();
        const xa = Math.min(xz, X(val));
        const xb = Math.max(xz, X(val));
        const grad = g.createLinearGradient(0, yc - bh / 2, 0, yc + bh / 2);
        grad.addColorStop(0, withAlpha(col, 1));
        grad.addColorStop(1, withAlpha(col, 0.72));
        g.fillStyle = grad;
        roundRect(g, xa, yc - bh / 2, Math.max(1.5, xb - xa), bh, 3);
        g.fill();
        // Wert über dem Balken
        const txt = `${val < 0 ? '−' : '+'}${fmt.fixed(Math.abs(val) / unit, 2)}`;
        const right = val >= 0;
        const tw = richWidth(txt, 11);
        let tx = right ? xb + 5 : xa - 5;
        let al: CanvasTextAlign = right ? 'left' : 'right';
        if (right && tx + tw > x1) [tx, al] = [xb - 5, 'right'];
        if (!right && tx - tw < x0) [tx, al] = [xa + 5, 'left'];
        const inside = (al === 'right' && right) || (al === 'left' && !right);
        rich(txt, tx, yc - bh / 2 - 7, small ? 10.5 : 11, inside ? theme.text : col, al, panelHalo(), 700);
      });
      // Nulllinie
      g.strokeStyle = theme.text;
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(xz, B.y + 6);
      g.lineTo(xz, B.y + 8 + rowH * 3);
      g.stroke();
      rich('0', xz, B.y + 1, 10.5, theme.muted, 'center', null, 600);
      const status = o.kind === 'parabola' ? 'enParabola' : o.bound ? 'enBound' : 'enFree';
      const sc = o.kind === 'parabola' ? theme.series[3]! : o.bound ? theme.series[2]! : theme.series[1]!;
      rich(ctx.t(status), B.x + B.w / 2, B.y + B.h - statusH / 2 + 2, small ? 11 : 12, sc, 'center', null, 700);
      drawEnergyChart(R, parts2.chartTitle, k);
    }

    function drawEnergyChart(R: Rect, titleY: number, k: number): void {
      const theme = ctx.theme;
      const small = narrow() || R.w < 360;
      rich(ctx.t('enChart'), R.x + 14, titleY, small ? 12 : 13, theme.text, 'left', null, 700);
      const unit = 10 ** k;
      const { tf, xMax } = chartRanges();
      const potMax = (GM_SUN * p.M) / (rLow() * AU) / unit;
      const kinMax = (0.5 * (vPeak() * 1000) ** 2) / unit;
      const H = chart.rect.h - 18 - 14;
      const yHi = niceTop(Math.max(kinMax, 0.1), (H * kinMax) / (kinMax + potMax));
      const yLo = -niceTop(potMax, (H * potMax) / (kinMax + potMax));
      chart.setAxes({ x: { label: ctx.t(daysMode() ? 'axisTd' : 'axisTa') }, y: { label: tr('axisE', { k: sup(k) }) } });
      chart.setRangePadded([0, xMax], [yLo, yHi], { left: small ? 36 : 42, right: 14, top: 18, bottom: 14 });
      chart.begin();
      chart.grid({ minor: false });
      chart.axes();
      const samples = run.samples;
      if (run.t > 0 && samples.length > 1) {
        const pts = (f: (q: (typeof samples)[number]) => number) => samples.map((q) => [q.t * tf, f(q) / unit] as [number, number]);
        chart.polyline(pts((q) => q.kin), { color: theme.series[0], width: 2.4 });
        chart.polyline(pts((q) => q.pot), { color: theme.series[1], width: 2.4 });
        chart.polyline(pts((q) => q.kin + q.pot), { color: theme.series[4], width: 2.8 });
        const cur = run.closed ? (run.t % run.tRef) * tf : run.t * tf;
        const en = energies(run.s, p.M);
        chart.point(cur, en.kin / unit, { color: theme.series[0], radius: 4 });
        chart.point(cur, en.pot / unit, { color: theme.series[1], radius: 4 });
        chart.point(cur, en.total / unit, { color: theme.series[4], radius: 4 });
      } else {
        const cr = chart.rect;
        emptyNote(cr.x + cr.w / 2 + 14, cr.y + cr.h * 0.3, ctx.t('chartEmpty'));
      }
      chart.end();
    }

    function drawPanel(): void {
      const R = regions(surface.width, surface.height).panel;
      card(R);
      const panel = p.panel as Panel;
      if (panel === 'k3') drawTable(R);
      else if (panel === 'energy') drawEnergy(R);
      else drawAreas(R);
    }

    /* ---------- Ablauf ---------- */
    function newRun(): void {
      run = makeRun();
      done = null;
      lapSeen = false;
      buildConic();
    }

    function recordLap(): void {
      if (!run.lap || lapSeen) return;
      lapSeen = true;
      const { a, T } = run.lap;
      const same = meas.find((m) => Math.abs(m.a / a - 1) < 2e-3 && Math.abs(m.M - p.M) < 1e-9);
      if (same) {
        lastMeasId = same.id;
      } else {
        measCount++;
        meas.push({ a, T, M: p.M, id: measCount });
        if (meas.length > MAX_MEAS) meas.shift();
        lastMeasId = measCount;
      }
      pop.play();
      grow.play();
    }

    retarget(false);
    ready = true;

    return {
      update(changed, source) {
        const physics = ['r0', 'v0', 'al', 'M', 'n'].some((key) => changed.has(key));
        if (physics || source === 'init' || source === 'replace') {
          ctx.clock.pause();
          newRun();
          if (!dragging) retarget(source !== 'init');
        }
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'go') {
          newRun();
          ctx.clock.play();
          retarget(true);
        } else if (id === 'vk') {
          ctx.set({ v0: circularSpeed(p.r0, p.M), al: 90 });
        } else if (id === 'vf') {
          ctx.set({ v0: escapeSpeed(p.r0, p.M) });
        } else if (id === 'clear') {
          meas = [];
          measCount = 0;
          lastMeasId = -1;
          lapSeen = run.lap !== null;
          ctx.requestRender();
        }
      },

      tick(dt) {
        if (done) newRun();
        // Start aus der Ruhe: Ausschnitt ohne Startpfeil und Ringe (weich zoomen)
        if (run.t === 0) retarget(true);
        const rate = (run.tRef / LOOP_SECONDS) * (p.slow ? 0.25 : 1);
        run.advance(dt * rate, 40000);
        if (run.crashed) {
          done = 'crash';
          ctx.clock.pause();
        } else if (!run.closed) {
          // offene Bahn: Ende, wenn der Planet weit außerhalb des Bildes ist
          const r = regions(surface.width, surface.height).scene;
          const x = scene.px(run.s.x);
          const y = scene.py(run.s.y);
          const out = x < r.x - 40 || x > r.x + r.w + 40 || y < r.y - 40 || y > r.y + r.h + 40;
          const rv = run.s.x * run.s.vx + run.s.y * run.s.vy;
          if (out && rv > 0) {
            done = run.orbit.bound ? 'far' : 'escape';
            ctx.clock.pause();
          }
        }
        recordLap();
        updateNow();
      },

      resetTime() {
        newRun();
        retarget(true);
        updateNow();
      },

      render() {
        const reg = regions(surface.width, surface.height);
        const key = `${reg.scene.w}x${reg.scene.h}`;
        if (key !== rectKey) {
          rectKey = key;
          scene.resize();
          retarget(false);
        }
        stepView();
        scene.resize();
        chart.resize();
        surface.begin();
        drawScene();
        drawPanel();
        if (zoomTw.running || pop.running || grow.running) ctx.requestRender();
      },

      destroy: () => {
        surface.canvas.removeEventListener('pointerup', release);
        surface.canvas.removeEventListener('pointercancel', release);
        surface.destroy();
      },
    };
  },
});

