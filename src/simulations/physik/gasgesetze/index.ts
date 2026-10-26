import {
  clamp,
  defineSimulation,
  ease,
  FixedStepper,
  mixColor,
  offscreenCanvas,
  prefersReducedMotion,
  roundRect,
  scaledSprite,
  seededRandom,
  shade,
  Surface,
  text,
  tintedSprite,
  Tween,
  withAlpha,
  type Rect,
} from '../../../sim-core';
import {
  AVOGADRO,
  celsius,
  equilibrium,
  fitHyperbola,
  fitLine,
  fitOrigin,
  GasBox,
  gaugeRange,
  idealPressure2D,
  kelvin,
  meanSpeed,
  M_N2,
  MODEL_KT0,
  modelKT,
  noisy,
  N_MAX,
  N_MIN,
  P_MAX,
  P_MIN,
  particleCount,
  pressure,
  R as GAS_R,
  THETA_MAX,
  THETA_MIN,
  V_CAP,
  V_MAX,
  V_MIN,
  WALL_BOTTOM,
  WALL_LEFT,
  WALL_PISTON,
  WALL_RIGHT,
  xIntercept,
  ZERO_CELSIUS,
  type GasState,
  type Mode,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const TAU = 2 * Math.PI;
/** Breite des Zylinders im Teilchenmodell (Einheiten) und gezeichneter Teilchenradius. */
const BOX_W = 12;
const R_DRAW = 0.27;
const CAP = 64;
/** Farbskala der Teilchen (Geschwindigkeit im Modell, Vielfache der mittleren Geschwindigkeit bei 0 °C). */
const V_REF = Math.sqrt((Math.PI * MODEL_KT0) / 2);
const V_LO = 0.35 * V_REF;
const V_HI = 2.1 * V_REF;
const SHADES = 28;
/** Thermometer-Skala in °C. */
const SCALE_LO = THETA_MIN;
const SCALE_HI = THETA_MAX;
/** Diagrammachsen. */
const T_AXIS = 600;
const INV_AXIS = 0.11;
/** Messrauschen (relative Standardabweichung). */
const NOISE = 0.01;
/** Auf so viele Punkte ist die Messreihe begrenzt. */
const MAX_POINTS = 12;
/** Isothermen der blassen Schar (°C). */
const FAMILY = [-50, 0, 50, 100, 150, 200, 250];
/** Automatische Messreihen. */
const AUTO_V = [50, 40, 30, 25, 20, 15, 12.5, 10];
const AUTO_T = [-50, 0, 50, 100, 150, 200, 250];

type Chart = 'pV' | 'pinv' | 'VT' | 'pT';

interface Lay {
  side: boolean;
  scene: Rect;
  a: Rect;
  b: Rect;
}

interface Point {
  p: number;
  V: number;
  T: number;
  mode: Mode;
  /** Zeitpunkt der Aufnahme (ms, für das Hineingleiten). */
  born: number;
  from: [number, number];
}

interface Flash {
  x: number;
  y: number;
  wall: number;
  age: number;
}

interface Geo {
  r: Rect;
  sm: boolean;
  pad: number;
  hdrY: number;
  tableY: number;
  plateTop: number;
  /** Innenraum des Zylinders: links, Breite, oben (V_CAP), Boden; Höhe in Pixeln; Pixel je Modelleinheit. */
  ix: number;
  iw: number;
  iy0: number;
  iyB: number;
  Hc: number;
  s: number;
  cx: number;
  gw: number;
  glassX: number;
  glassW: number;
  /** Manometer. */
  mx: number;
  my: number;
  mr: number;
  /** Thermometer: Mitte, oben, Kugelmitte, Skala. */
  tx: number;
  tTop: number;
  tBulb: number;
  tScaleTop: number;
  tScaleBot: number;
}

interface Seg {
  t: string;
  c: string;
  /** v: Variable (kursiv), b: fett, n: normal */
  f?: 'v' | 'b' | 'n';
  /** Vor diesem Teil darf umbrochen werden. */
  br?: boolean;
}

/**
 * Gasgesetze: Gas in einem Zylinder mit beweglichem Kolben im Teilchenbild.
 * Drei Versuche mit festgehaltener Größe (isotherm mit Wärmebad, isobar mit
 * Gewicht auf dem Kolben, isochor mit arretiertem Kolben), gezeichnetes
 * Manometer und Thermometer, p-V-, p-1/V-, V-T- und p-T-Diagramm mit
 * Messreihe und Extrapolation auf den absoluten Nullpunkt, dazu die
 * allgemeine Gasgleichung mit eingesetzten Werten.
 */
export default defineSimulation({
  id: 'gasgesetze',
  animated: true,
  // Tipp je Versuch: der Kolben lässt sich nur im isothermen Versuch ziehen
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'isotherm'
      ? L(
          'Tipp: Den Kolben am Griff und das Thermometer kannst du mit Maus oder Finger ziehen. Die Reiter über dem Diagramm wechseln die Darstellung.',
          'Tip: Drag the piston by its handle or the thermometer with the mouse or a finger. The tabs above the graph switch the view.',
        )
      : L(
          'Tipp: Das Thermometer kannst du mit Maus oder Finger ziehen. Die Reiter über dem Diagramm wechseln die Darstellung.',
          'Tip: Drag the thermometer with the mouse or a finger. The tabs above the graph switch the view.',
        ),
  layout: { aspect: 1.55, aspectNarrow: 0.46 },
  images: { gauge: 'manometer.webp', thermo: 'thermometer.webp', plate: 'heizplatte.webp', table: 'tischkante.webp' },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Experiment'),
      options: [
        { value: 'isotherm', label: L('isotherm (T konstant)', 'isothermal (T constant)') },
        { value: 'isobar', label: L('isobar (p konstant)', 'isobaric (p constant)') },
        { value: 'isochor', label: L('isochor (V konstant)', 'isochoric (V constant)') },
      ],
      default: 'isotherm',
    },
    {
      key: 'V',
      type: 'number',
      label: L('Volumen V', 'Volume V'),
      help: (v: { readonly mode?: unknown }) => (v.mode === 'isotherm' ? L('Oder: den Kolben am Griff ziehen.', 'Or drag the piston by its handle.') : null),
      min: V_MIN,
      max: V_MAX,
      step: 0.1,
      default: 22.4,
      unit: 'L',
      visibleIf: (v) => v.mode !== 'isobar',
    },
    {
      key: 'p',
      type: 'number',
      label: L('Druck p (Gewicht auf dem Kolben)', 'Pressure p (weight on the piston)'),
      min: P_MIN,
      max: P_MAX,
      step: 0.1,
      default: 101.3,
      unit: 'kPa',
      visibleIf: (v) => v.mode === 'isobar',
    },
    {
      key: 'T',
      type: 'number',
      label: L('Temperatur ϑ', 'Temperature ϑ'),
      help: L('Oder: am Thermometer ziehen. Das Gas nimmt die Temperatur von Wärmebad bzw. Heizplatte an.', 'Or drag the thermometer. The gas takes on the temperature of the bath or the hot plate.'),
      min: THETA_MIN,
      max: THETA_MAX,
      step: 1,
      default: 0,
      unit: '°C',
    },
    { key: 'n', type: 'number', label: L('Stoffmenge n', 'Amount of substance n'), help: L('Im Bild: 24 Teilchen je mol.', 'On screen: 24 particles per mol.'), min: N_MIN, max: N_MAX, step: 0.1, default: 1, unit: 'mol' },
    {
      key: 'ch',
      type: 'choice',
      label: L('Diagramm', 'Graph'),
      options: [
        { value: 'pV', label: L('p-V', 'p–V') },
        { value: 'pinv', label: L('p-1/V', 'p–1/V') },
        { value: 'VT', label: L('V-T', 'V–T') },
        { value: 'pT', label: L('p-T', 'p–T') },
      ],
      default: 'pV',
    },
    { key: 'noise', type: 'boolean', group: 'view', label: L('Messunsicherheit (etwa ±1 %)', 'Measurement uncertainty (about ±1 %)'), default: true },
    { key: 'hits', type: 'boolean', group: 'view', label: L('Stöße an den Wänden aufblitzen lassen', 'Flash the collisions with the walls'), default: true },
    { key: 'area', type: 'boolean', group: 'view', label: L('p · V als Rechteck im p-V-Diagramm', 'p · V as a rectangle in the p–V graph'), default: true, visibleIf: (v) => v.ch === 'pV' },
  ],
  actions: [
    { id: 'rec', label: L('Messwert aufnehmen', 'Record a data point'), primary: true },
    { id: 'auto', label: L('Messreihe automatisch', 'Automatic series') },
    { id: 'clear', label: L('Messwerte löschen', 'Clear data') },
  ],
  readouts: [
    { key: 'now', label: L('Zustand', 'State'), spoiler: true },
    { key: 'law', label: L('Gesetz', 'Law'), spoiler: true },
    { key: 'gas', label: L('Allgemeine Gasgleichung', 'Ideal gas law'), spoiler: true },
    { key: 'kin', label: L('Druck im Teilchenbild', 'Pressure in the particle model'), spoiler: true },
    { key: 'table', label: L('Messtabelle', 'Table of measurements') },
    { key: 'fit', label: L('Auswertung', 'Analysis'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Boyle-Mariotte: 1 mol bei 0 °C', 'Boyle–Mariotte: 1 mol at 0 °C'), values: {} },
    { id: 'half', label: L('Volumen halbiert', 'Volume halved'), values: { V: 11.2 } },
    { id: 'lin', label: L('Linearisierung: p über 1/V', 'Linearisation: p against 1/V'), values: { ch: 'pinv', V: 15 } },
    { id: 'isobar', label: L('Gay-Lussac: Heizen bei konstantem Druck', 'Gay-Lussac: heating at constant pressure'), values: { mode: 'isobar', ch: 'VT', T: 100 } },
    { id: 'isochor', label: L('Amontons: Heizen bei konstantem Volumen', 'Amontons: heating at constant volume'), values: { mode: 'isochor', ch: 'pT', T: 100 } },
    { id: 'double', label: L('Doppelte Teilchenzahl', 'Twice the number of particles'), values: { n: 2 } },
  ],
  strings: {
    de: {
      canvas:
        'Gas im Teilchenbild in einem Glaszylinder mit beweglichem Kolben, links ein Manometer, rechts ein Thermometer mit Celsius- und Kelvin-Skala, darunter Heizplatte bzw. Wärmebad. Die Teilchen stoßen an Wände und Kolben, Stöße blitzen kurz auf. Rechts das gewählte Diagramm (p-V, p über 1/V, V-T oder p-T) mit Messpunkten und darunter die allgemeine Gasgleichung mit eingesetzten Werten.',
      hintT: 'Wärmebad hält ϑ konstant · Kolben am Griff ziehen',
      hintTS: 'ϑ konstant · Griff ziehen',
      hintP: 'Gewicht hält p konstant · Thermometer ziehen',
      hintPS: 'p konstant · Thermometer ziehen',
      hintV: 'Kolben arretiert: V konstant · Thermometer ziehen',
      hintVS: 'V konstant · Thermometer ziehen',
      bath: 'Wärmebad',
      locked: 'arretiert',
      stopHi: 'Anschlag oben – p nicht mehr konstant',
      stopLo: 'Anschlag unten – p nicht mehr konstant',
      stopS: 'Anschlag!',
      kinShort: 'aus Stößen ≈ {p} kPa',
      kinShortS: 'Stöße ≈ {p}',
      gasTitle: 'Allgemeine Gasgleichung',
      gasTitleS: 'Gasgleichung',
      lawT: 'Boyle-Mariotte',
      lawP: 'Gay-Lussac',
      lawV: 'Amontons',
      fixed: 'fest',
      konst: 'konst.',
      emptyPts: '„Messwert aufnehmen“ – hier erscheinen die Messpunkte.',
      emptyPtsS: 'Messwerte aufnehmen …',
      axisV: 'V in L',
      axisP: 'p in kPa',
      axisInv: '1/V in 1/L',
      axisT: 'T in K',
      axisTh: 'ϑ in °C',
      zero: 'absoluter Nullpunkt',
      zeroS: '0 K',
      zeroVal: '0 K = −273,15 °C',
      fitZero: 'ϑ₀ ≈ {t} °C',
      isoLabel: 'ϑ = {t} °C',
      isobarLabel: 'p = {p} kPa',
      isochorLabel: 'V = {v} L',
      slope: 'Steigung ≈ {c} J',
      pvArea: 'p · V ≈ {c} J',
      now: '<var>p</var> = <strong>{p} kPa</strong> · <var>V</var> = <strong>{V} L</strong> · <var>ϑ</var> = <strong>{th} °C</strong> (<var>T</var> = {T} K) · <var>n</var> = {n} mol',
      lawIso:
        '<strong>isotherm</strong> (Boyle-Mariotte): <var>T</var> fest ⇒ <var>p</var> · <var>V</var> = konstant<br><var>p</var> · <var>V</var> = {p} kPa · {V} L ≈ <strong>{c} J</strong> – halbes Volumen, doppelter Druck',
      lawBar:
        '<strong>isobar</strong> (Gay-Lussac): <var>p</var> fest ⇒ <span class="frac"><span><var>V</var></span><span><var>T</var></span></span> = konstant<br><span class="frac"><span><var>V</var></span><span><var>T</var></span></span> = <span class="frac"><span>{V} L</span><span>{T} K</span></span> ≈ <strong>{c} L/K</strong>',
      lawCho:
        '<strong>isochor</strong> (Amontons): <var>V</var> fest ⇒ <span class="frac"><span><var>p</var></span><span><var>T</var></span></span> = konstant<br><span class="frac"><span><var>p</var></span><span><var>T</var></span></span> = <span class="frac"><span>{p} kPa</span><span>{T} K</span></span> ≈ <strong>{c} kPa/K</strong>',
      lawStop: '<br><span style="color: var(--series-3)">Der Kolben liegt am Anschlag – der Druck ist nicht mehr durch das Gewicht festgelegt.</span>',
      gas:
        '<var>p</var> · <var>V</var> = <var>n</var> · <var>R</var> · <var>T</var> mit <var>R</var> = 8,314 <span class="frac"><span>J</span><span>mol · K</span></span><br>{n} mol · 8,314 <span class="frac"><span>J</span><span>mol · K</span></span> · {T} K ≈ {c} J = {p} kPa · {V} L (1 kPa · 1 L = 1 J)<br>Teilchenzahl <var>N</var> = <var>n</var> · <var>N</var><sub>A</sub> ≈ {N} · 10<sup>23</sup>',
      kin: 'Aus den Stößen der Teilchen an Wände und Kolben (Modell, eben): <strong>≈ {pc} kPa</strong>, Formel: {p} kPa.<br>Stickstoff-Teilchen sind bei {th} °C im Mittel etwa <strong>{v} m/s</strong> schnell.',
      kinWait: 'Uhr läuft nicht – „Abspielen“, damit die Teilchen stoßen.',
      kinMeas: 'Die Stöße werden gezählt, sobald Kolben und Temperatur zur Ruhe gekommen sind …',
      thV: 'V in L',
      thP: 'p in kPa',
      thTh: 'ϑ in °C',
      thT: 'T in K',
      thPV: 'p · V in J',
      thVT: 'V/T in L/K',
      thPT: 'p/T in kPa/K',
      none: 'Noch keine Messwerte – „Messwert aufnehmen“ oder „Messreihe automatisch“.',
      fitIso: 'Mittelwert von <var>p</var> · <var>V</var>: <strong>{c} J</strong> (Formel <var>n</var> · <var>R</var> · <var>T</var> = {e} J). Im p-1/V-Diagramm liegen die Punkte auf einer Ursprungsgeraden mit dieser Steigung.',
      fitLin: 'Ausgleichsgerade: <var>{y}</var> = {m} · <var>ϑ</var> + {b}. Sie schneidet die ϑ-Achse bei <strong>ϑ₀ ≈ {t} °C</strong> – nahe am absoluten Nullpunkt −273,15 °C.',
      fitFew: 'Für die Auswertung fehlen noch Messwerte (mindestens zwei).',
      fitOther: 'Diese Messreihe gehört zum Versuch „{m}“.',
    },
    en: {
      canvas:
        'Gas in the particle model inside a glass cylinder with a movable piston, a pressure gauge on the left, a thermometer with Celsius and kelvin scales on the right, below them a hot plate or a water bath. The particles hit the walls and the piston; collisions flash briefly. On the right the selected graph (p–V, p against 1/V, V–T or p–T) with data points and below it the ideal gas law with the values substituted.',
      hintT: 'water bath keeps ϑ constant · drag the handle',
      hintTS: 'ϑ constant · drag the handle',
      hintP: 'weight keeps p constant · drag the thermometer',
      hintPS: 'p constant · drag thermometer',
      hintV: 'piston locked: V constant · drag the thermometer',
      hintVS: 'V constant · drag thermometer',
      bath: 'water bath',
      locked: 'locked',
      stopHi: 'top stop reached – p no longer constant',
      stopLo: 'bottom stop reached – p no longer constant',
      stopS: 'stop!',
      kinShort: 'from collisions ≈ {p} kPa',
      kinShortS: 'collisions ≈ {p}',
      gasTitle: 'Ideal gas law',
      gasTitleS: 'Ideal gas law',
      lawT: 'Boyle–Mariotte',
      lawP: 'Gay-Lussac',
      lawV: 'Amontons',
      fixed: 'fixed',
      konst: 'const.',
      emptyPts: '“Record a data point” – the points appear here.',
      emptyPtsS: 'Record data …',
      axisV: 'V in L',
      axisP: 'p in kPa',
      axisInv: '1/V in 1/L',
      axisT: 'T in K',
      axisTh: 'ϑ in °C',
      zero: 'absolute zero',
      zeroS: '0 K',
      zeroVal: '0 K = −273.15 °C',
      fitZero: 'ϑ₀ ≈ {t} °C',
      isoLabel: 'ϑ = {t} °C',
      isobarLabel: 'p = {p} kPa',
      isochorLabel: 'V = {v} L',
      slope: 'slope ≈ {c} J',
      pvArea: 'p · V ≈ {c} J',
      now: '<var>p</var> = <strong>{p} kPa</strong> · <var>V</var> = <strong>{V} L</strong> · <var>ϑ</var> = <strong>{th} °C</strong> (<var>T</var> = {T} K) · <var>n</var> = {n} mol',
      lawIso:
        '<strong>isothermal</strong> (Boyle–Mariotte): <var>T</var> fixed ⇒ <var>p</var> · <var>V</var> = constant<br><var>p</var> · <var>V</var> = {p} kPa · {V} L ≈ <strong>{c} J</strong> – half the volume, twice the pressure',
      lawBar:
        '<strong>isobaric</strong> (Gay-Lussac): <var>p</var> fixed ⇒ <span class="frac"><span><var>V</var></span><span><var>T</var></span></span> = constant<br><span class="frac"><span><var>V</var></span><span><var>T</var></span></span> = <span class="frac"><span>{V} L</span><span>{T} K</span></span> ≈ <strong>{c} L/K</strong>',
      lawCho:
        '<strong>isochoric</strong> (Amontons): <var>V</var> fixed ⇒ <span class="frac"><span><var>p</var></span><span><var>T</var></span></span> = constant<br><span class="frac"><span><var>p</var></span><span><var>T</var></span></span> = <span class="frac"><span>{p} kPa</span><span>{T} K</span></span> ≈ <strong>{c} kPa/K</strong>',
      lawStop: '<br><span style="color: var(--series-3)">The piston rests against a stop – the pressure is no longer set by the weight.</span>',
      gas:
        '<var>p</var> · <var>V</var> = <var>n</var> · <var>R</var> · <var>T</var> with <var>R</var> = 8.314 <span class="frac"><span>J</span><span>mol · K</span></span><br>{n} mol · 8.314 <span class="frac"><span>J</span><span>mol · K</span></span> · {T} K ≈ {c} J = {p} kPa · {V} L (1 kPa · 1 L = 1 J)<br>number of particles <var>N</var> = <var>n</var> · <var>N</var><sub>A</sub> ≈ {N} · 10<sup>23</sup>',
      kin: 'From the collisions of the particles with the walls and the piston (model, two-dimensional): <strong>≈ {pc} kPa</strong>, formula: {p} kPa.<br>At {th} °C nitrogen particles move at about <strong>{v} m/s</strong> on average.',
      kinWait: 'The clock is stopped – press “Play” so that the particles collide.',
      kinMeas: 'The collisions are counted as soon as the piston and the temperature have settled …',
      thV: 'V in L',
      thP: 'p in kPa',
      thTh: 'ϑ in °C',
      thT: 'T in K',
      thPV: 'p · V in J',
      thVT: 'V/T in L/K',
      thPT: 'p/T in kPa/K',
      none: 'No data yet – “Record a data point” or “Automatic series”.',
      fitIso: 'Mean of <var>p</var> · <var>V</var>: <strong>{c} J</strong> (formula <var>n</var> · <var>R</var> · <var>T</var> = {e} J). In the p–1/V graph the points lie on a line through the origin with this slope.',
      fitLin: 'Line of best fit: <var>{y}</var> = {m} · <var>ϑ</var> + {b}. It meets the ϑ axis at <strong>ϑ₀ ≈ {t} °C</strong> – close to absolute zero, −273.15 °C.',
      fitFew: 'More data are needed for the analysis (at least two points).',
      fitOther: 'This series belongs to the “{m}” experiment.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const n = (v: number, d: number) => fmt.num(v, d);
    const fx = (v: number, d: number) => fmt.fixed(v, d);
    const mode = (): Mode => (p.mode === 'isobar' ? 'isobar' : p.mode === 'isochor' ? 'isochor' : 'isotherm');
    const chart = (): Chart => (p.ch === 'pinv' || p.ch === 'VT' || p.ch === 'pT' ? p.ch : 'pV');
    const natural = (m: Mode): Chart => (m === 'isotherm' ? 'pV' : m === 'isobar' ? 'VT' : 'pT');
    const pCol = () => ctx.theme.series[0]!;
    const tCol = () => ctx.theme.series[1]!;
    const vCol = () => ctx.theme.series[2]!;
    const fitCol = () => ctx.theme.series[3]!;
    const nCol = () => ctx.theme.series[4]!;
    const fixedCol = (m: Mode) => (m === 'isotherm' ? tCol() : m === 'isobar' ? pCol() : vCol());
    /**
     * Aufgabenmodus: Die vom Versuch abhängige Größe (p bei isotherm/isochor,
     * V bei isobar) und daraus berechnete Produkte werden im Bild als „?“
     * gezeigt – sonst liest man die Lösung der Rechenaufgaben direkt ab.
     * Manometer, Skala am Glas und Diagrammachsen bleiben (ungenaues Ablesen ist erwünscht).
     */
    const hideP = () => ctx.hidden && mode() !== 'isobar';
    const hideV = () => ctx.hidden && mode() === 'isobar';
    const qm = (hide: boolean, s: string) => (hide ? '?' : s);

    /* ---------- weiche Werte ---------- */
    const soft = new Map<string, number>();
    let lastFrame = performance.now();
    let frameDt = 0;
    let animating = false;
    function ease2(key: string, target: number, rate = 8, eps = 1e-3): number {
      const cur = soft.get(key);
      if (cur === undefined || prefersReducedMotion() || !Number.isFinite(target) || !Number.isFinite(cur)) {
        soft.set(key, target);
        return target;
      }
      const v = cur + (target - cur) * (1 - Math.exp(-frameDt * rate));
      const done = Math.abs(v - target) <= eps;
      soft.set(key, done ? target : v);
      if (!done) animating = true;
      return done ? target : v;
    }
    const intro = new Tween(1500, ease.linear);
    const stage = (delay: number, span = 0.45, fn = ease.outCubic) => (intro.running ? fn(clamp((intro.t - delay) / span, 0, 1)) : 1);

    /* ---------- Zustand (Ziel aus den Reglern, angezeigt weich nachgeführt) ---------- */
    let nD = p.n;
    let TD = kelvin(p.T);
    let VD = p.V;
    let pWD = p.p;
    let rangeD = gaugeRange(mode(), p.n, kelvin(p.T), p.V, p.p);
    let cur: GasState = equilibrium(mode(), nD, TD, VD, pWD);
    let dragV = false;
    let dragT = false;

    function snapState(): void {
      nD = p.n;
      TD = kelvin(p.T);
      VD = p.V;
      pWD = p.p;
      rangeD = gaugeRange(mode(), p.n, kelvin(p.T), p.V, p.p);
      cur = equilibrium(mode(), nD, TD, VD, pWD);
      if (mode() === 'isobar') VD = cur.V;
      else pWD = cur.p;
    }

    /** Angezeigten Zustand ein Stück zum Ziel bewegen (Kolben gleitet, Gas nimmt die Temperatur an …). */
    function advance(dt: number): void {
      const rm = prefersReducedMotion();
      const k = (rate: number) => (rm ? 1 : 1 - Math.exp(-dt * rate));
      const step = (curV: number, target: number, rate: number, eps: number) => {
        const v = curV + (target - curV) * k(rate);
        if (Math.abs(v - target) <= eps) return target;
        animating = true;
        return v;
      };
      nD = step(nD, p.n, 3.5, 1e-4);
      TD = step(TD, kelvin(p.T), dragT ? 9 : autoRun ? 3.4 : 2.6, 0.004);
      if (mode() === 'isobar') pWD = step(pWD, p.p, 4, 0.004);
      else VD = step(VD, p.V, dragV ? 30 : 6, 0.0015);
      cur = equilibrium(mode(), nD, TD, VD, pWD);
      // die jeweils nicht vorgegebene Größe mitführen, damit ein Wechsel des Versuchs nicht springt
      if (mode() === 'isobar') VD = cur.V;
      else pWD = cur.p;
      rangeD = step(rangeD, gaugeRange(mode(), p.n, kelvin(p.T), p.V, p.p), 4, 0.05);
    }

    /* ---------- Aufteilung ---------- */
    function computeLayout(): Lay {
      const w = surface.width;
      const h = surface.height;
      const side = w >= 640 || w >= h * 1.3;
      if (side) {
        const pw = Math.round(clamp(w * 0.42, 250, 440));
        const ah = Math.round((h - 10) * 0.6);
        return { side, scene: { x: 0, y: 0, w: w - pw - 12, h }, a: { x: w - pw, y: 0, w: pw, h: ah }, b: { x: w - pw, y: ah + 10, w: pw, h: h - ah - 10 } };
      }
      const sh = Math.round(h * 0.52);
      const ah = Math.round((h - sh - 20) * 0.6);
      return { side, scene: { x: 0, y: 0, w, h: sh }, a: { x: 0, y: sh + 10, w, h: ah }, b: { x: 0, y: sh + 20 + ah, w, h: h - sh - 20 - ah } };
    }

    function sceneGeo(r: Rect): Geo {
      const sm = r.w < 440;
      const pad = sm ? 8 : 14;
      const hdrY = r.y + (sm ? 8 : 12);
      const tableH = sm ? 22 : 28;
      const tableY = r.y + r.h - tableH;
      const plateH = sm ? 18 : 24;
      const plateTop = tableY - plateH;
      const mr = sm ? clamp(r.w * 0.105, 30, 40) : clamp(r.w * 0.1, 42, 62);
      const leftZone = 2 * mr + 2 * pad + (sm ? 4 : 10);
      const thermoZone = sm ? 64 : 84;
      const scaleLab = sm ? 12 : 16;
      const gw = sm ? 5 : 7;
      const iy0 = r.y + (sm ? 62 : 76);
      const iyB = plateTop - (sm ? 6 : 8);
      const Hc = iyB - iy0;
      const zoneX = r.x + leftZone;
      const zoneW = r.w - leftZone - thermoZone - scaleLab;
      const iw = clamp(Math.min(zoneW - 2 * gw - 8, Hc * 0.74), 70, 320);
      const cx = zoneX + zoneW / 2;
      const ix = cx - iw / 2;
      const tx = r.x + r.w - pad - thermoZone / 2 + (sm ? 2 : 4);
      const tTop = iy0 - 6;
      const tBulb = tableY - (sm ? 13 : 16);
      const my = clamp(iyB - Hc * 0.52, iy0 + mr + 4, iyB - mr - 30);
      return {
        r,
        sm,
        pad,
        hdrY,
        tableY,
        plateTop,
        ix,
        iw,
        iy0,
        iyB,
        Hc,
        s: iw / BOX_W,
        cx,
        gw,
        glassX: ix - gw,
        glassW: iw + 2 * gw,
        mx: r.x + pad + mr + (sm ? 2 : 4),
        my,
        mr,
        tx,
        tTop,
        tBulb,
        tScaleTop: tTop + 16,
        tScaleBot: tBulb - (sm ? 20 : 24),
      };
    }

    const vToY = (G: Geo, V: number) => G.iyB - (V / V_CAP) * G.Hc;
    const yToV = (G: Geo, y: number) => ((G.iyB - y) / G.Hc) * V_CAP;
    const thetaToY = (G: Geo, th: number) => G.tScaleBot - ((th - SCALE_LO) / (SCALE_HI - SCALE_LO)) * (G.tScaleBot - G.tScaleTop);
    const yToTheta = (G: Geo, y: number) => SCALE_LO + ((G.tScaleBot - y) / (G.tScaleBot - G.tScaleTop)) * (SCALE_HI - SCALE_LO);
    /** Höhe des Gasraums in Modelleinheiten. */
    const boxHeight = (G: Geo, V: number) => ((V / V_CAP) * G.Hc) / G.s;

    /* ---------- Farben und vorgerenderte Kugeln ---------- */
    let paletteKey = '';
    let palette: string[] = [];
    function speedPalette(): string[] {
      const th = ctx.theme;
      const key = `${th.dark}|${th.series.join(',')}`;
      if (key === paletteKey) return palette;
      paletteKey = key;
      const b = th.series[0]!;
      const o = th.series[3]!;
      const r = th.series[1]!;
      const stops: [number, string][] = [
        [0, mixColor(b, '#0a1a44', 0.35)],
        [0.24, b],
        [0.46, mixColor(b, '#eef3fa', 0.72)],
        [0.6, mixColor(o, '#fff4e6', 0.55)],
        [0.78, o],
        [1, r],
      ];
      palette = [];
      for (let i = 0; i < SHADES; i++) {
        const t = i / (SHADES - 1);
        let k = 0;
        while (k < stops.length - 2 && t > stops[k + 1]![0]) k++;
        const [t0, c0] = stops[k]!;
        const [t1, c1] = stops[k + 1]!;
        palette.push(mixColor(c0, c1, (t - t0) / (t1 - t0)));
      }
      return palette;
    }
    const shadeOf = (v: number) => Math.round(clamp((v - V_LO) / (V_HI - V_LO), 0, 1) * (SHADES - 1));

    const sprites = new Map<string, HTMLCanvasElement>();
    function ball(color: string, r: number): HTMLCanvasElement {
      const rr = Math.max(2, Math.round(r * 4) / 4);
      const key = `${color}|${rr}|${surface.dpr}|${ctx.theme.dark}`;
      const hit = sprites.get(key);
      if (hit) return hit;
      if (sprites.size > 160) sprites.clear();
      const m = rr * 0.9;
      const size = 2 * (rr + m);
      const { canvas, g } = offscreenCanvas(size, size, surface.dpr);
      const c = rr + m;
      const dpr = surface.dpr;
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,32,56,0.28)';
      g.shadowBlur = rr * 0.7 * dpr;
      g.shadowOffsetX = rr * 0.14 * dpr;
      g.shadowOffsetY = rr * 0.32 * dpr;
      g.fillStyle = shade(color, -0.3);
      g.beginPath();
      g.arc(c, c, rr * 0.96, 0, TAU);
      g.fill();
      g.restore();
      const body = g.createRadialGradient(c - rr * 0.38, c - rr * 0.42, rr * 0.08, c, c, rr);
      body.addColorStop(0, mixColor(color, '#ffffff', 0.62));
      body.addColorStop(0.42, color);
      body.addColorStop(1, shade(color, -0.38));
      g.fillStyle = body;
      g.beginPath();
      g.arc(c, c, rr, 0, TAU);
      g.fill();
      const gl = g.createRadialGradient(c - rr * 0.36, c - rr * 0.44, 0, c - rr * 0.36, c - rr * 0.44, rr * 0.5);
      gl.addColorStop(0, 'rgba(255,255,255,0.85)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.beginPath();
      g.arc(c, c, rr, 0, TAU);
      g.fill();
      sprites.set(key, canvas);
      return canvas;
    }
    function drawBall(color: string, x: number, y: number, r: number, scale = 1, alpha = 1): void {
      if (scale <= 0.01 || alpha <= 0.01) return;
      const g = surface.g;
      const sp = ball(color, r);
      const rr = Math.max(2, Math.round(r * 4) / 4);
      const half = (rr + rr * 0.9) * scale;
      if (alpha < 1) {
        g.save();
        g.globalAlpha *= alpha;
      }
      g.drawImage(sp, x - half, y - half, 2 * half, 2 * half);
      if (alpha < 1) g.restore();
    }

    /** Weicher Lichtfleck für die Wandstöße (vorab gerendert). */
    let glowKey = '';
    let glowSprite: HTMLCanvasElement | null = null;
    function glow(): HTMLCanvasElement {
      const col = ctx.theme.dark ? mixColor(pCol(), '#ffffff', 0.45) : pCol();
      const key = `${col}|${surface.dpr}`;
      if (glowSprite && key === glowKey) return glowSprite;
      glowKey = key;
      const size = 32;
      const { canvas, g } = offscreenCanvas(size, size, surface.dpr);
      // weißer Verlauf als Deckkraft, danach eingefärbt (funktioniert mit jeder Farbangabe)
      const gr = g.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, 'rgba(255,255,255,1)');
      gr.addColorStop(0.35, 'rgba(255,255,255,0.5)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, size, size);
      g.globalCompositeOperation = 'source-in';
      g.fillStyle = col;
      g.fillRect(0, 0, size, size);
      glowSprite = canvas;
      return canvas;
    }

    /* ---------- Zeichenhilfen ---------- */
    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, fill?: string): Rect {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(label).width + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      g.fillStyle = fill ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!fill) {
        g.strokeStyle = withAlpha(color, 0.45);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, label, x0 + w / 2, y + h / 2 + 0.5, { font: `700 ${size}px ${theme.font}`, color: fill ? '#ffffff' : color });
      return { x: x0, y, w, h };
    }

    function pillWidth(label: string, size = 12): number {
      const g = surface.g;
      g.font = `700 ${size}px ${ctx.theme.font}`;
      return g.measureText(label).width + 16;
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

    function haloText(label: string, x: number, y: number, font: string, color: string, align: CanvasTextAlign = 'center'): void {
      const g = surface.g;
      g.font = font;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineWidth = 3.5;
      g.lineJoin = 'round';
      g.strokeStyle = ctx.theme.dark ? 'rgba(16,22,31,0.85)' : 'rgba(250,251,252,0.92)';
      g.strokeText(label, x, y);
      g.fillStyle = color;
      g.fillText(label, x, y);
    }

    function niceStep(x: number): number {
      const q = 10 ** Math.floor(Math.log10(Math.max(1e-9, x)));
      for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
      return 10 * q;
    }

    function segFont(s: Seg, size: number): string {
      const theme = ctx.theme;
      if (s.f === 'v') return `italic 600 ${size * 1.08}px ${theme.mathFont}`;
      return `${s.f === 'b' ? 800 : 600} ${size}px ${theme.font}`;
    }
    function segsWidth(segs: Seg[], size: number): number {
      const g = surface.g;
      let w = 0;
      for (const s of segs) {
        g.font = segFont(s, size);
        w += g.measureText(s.t).width;
      }
      return w;
    }
    function drawSegs(segs: Seg[], x: number, y: number, size: number): void {
      const g = surface.g;
      let xx = x;
      for (const s of segs) {
        const font = segFont(s, size);
        g.font = font;
        text(g, s.t, xx, y, { font, color: s.c, align: 'left' });
        xx += g.measureText(s.t).width;
      }
    }
    /** Teile an erlaubten Stellen auf Zeilen der Breite w verteilen. */
    function wrapSegs(segs: Seg[], size: number, w: number): Seg[][] {
      const out: Seg[][] = [];
      let line: Seg[] = [];
      let chunk: Seg[] = [];
      const flush = () => {
        if (!chunk.length) return;
        if (line.length && segsWidth([...line, ...chunk], size) > w) {
          out.push(line);
          line = [];
        }
        line.push(...chunk);
        chunk = [];
      };
      for (const s of segs) {
        if (s.br) flush();
        chunk.push(s);
      }
      flush();
      if (line.length) out.push(line);
      return out;
    }

    function drawRoom(r: Rect, tableY: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const wall = g.createLinearGradient(0, r.y, 0, tableY);
      wall.addColorStop(0, dark ? '#172131' : '#f4f7fb');
      wall.addColorStop(1, dark ? '#101824' : '#e1e8f0');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, tableY - r.y);
      const gl = g.createRadialGradient(r.x + r.w * 0.3, r.y, 10, r.x + r.w * 0.3, r.y, r.w * 0.85);
      gl.addColorStop(0, dark ? 'rgba(120,160,220,0.08)' : 'rgba(255,255,255,0.7)');
      gl.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gl;
      g.fillRect(r.x, r.y, r.w, tableY - r.y);
      const wood = ctx.images.get('table');
      if (wood) {
        // Foto der Tischkante, waagerecht abwechselnd gespiegelt gekachelt (keine
        // Nahtstellen trotz leichtem Helligkeitsverlauf), Seitenverhältnis bleibt
        const th = r.y + r.h - tableY;
        // ganzzahlige Kachelbreite und 1 px Überlappung, sonst bleibt am Kachelrand ein heller Pixelstreifen
        const tw = Math.round((th * wood.width) / wood.height);
        for (let i = 0, x = r.x; x < r.x + r.w; i++, x += tw) {
          g.drawImage(scaledSprite(wood, tw + 1, th, surface.dpr, { flipX: i % 2 === 1 }), x, tableY, tw + 1, th);
        }
        if (dark) {
          g.fillStyle = 'rgba(0,0,0,0.45)';
          g.fillRect(r.x, tableY, r.w, th);
        }
        g.fillStyle = 'rgba(255,255,255,0.22)';
        g.fillRect(r.x, tableY, r.w, 1.5);
        return;
      }
      const table = g.createLinearGradient(0, tableY, 0, r.y + r.h);
      table.addColorStop(0, dark ? '#4a3a2b' : '#c9a273');
      table.addColorStop(1, dark ? '#30251b' : '#9f774c');
      g.fillStyle = table;
      g.fillRect(r.x, tableY, r.w, r.y + r.h - tableY);
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.fillRect(r.x, tableY, r.w, 1.5);
      g.strokeStyle = dark ? 'rgba(0,0,0,0.16)' : 'rgba(90,60,30,0.12)';
      g.lineWidth = 1;
      g.beginPath();
      const th = r.y + r.h - tableY;
      for (let k = 1; k <= 3; k++) {
        const yy = tableY + (k * th) / 4;
        g.moveTo(r.x, yy);
        for (let x = r.x; x <= r.x + r.w; x += 40) g.lineTo(x, yy + Math.sin(x * 0.03 + k) * 1.2);
      }
      g.stroke();
    }

    /* ---------- Teilchen ---------- */
    const rand = seededRandom(20261019);
    const noiseRand = seededRandom(73);
    let box: GasBox | null = null;
    /** Zeitpunkt (ms), zu dem ein Teilchen erschienen ist (für das Aufploppen). */
    const born = new Float64Array(CAP);
    let ghosts: { x: number; y: number; vx: number; vy: number; t0: number }[] = [];
    const stepper = new FixedStepper(1 / 240);
    let flashes: Flash[] = [];
    /** Messfenster (etwa 15 s; Streuung bei 24 Teilchen dann etwa ±4 %) für den Druck aus den Stößen: [Impuls, Wandlänge·Zeit, idealer Druck·Zeit, Zeit]. */
    let kinWin: [number, number, number, number][] = [];
    let kinRatio = 1;
    let kinValid = false;

    function ensureBox(G: Geo): void {
      if (!box) {
        box = new GasBox(CAP, BOX_W, boxHeight(G, cur.V), R_DRAW, rand);
        box.setCount(particleCount(nD), modelKT(TD));
        born.fill(-1e9);
      }
    }

    /** Teilchenzahl an die (weich nachgeführte) Stoffmenge anpassen. */
    function syncCount(): void {
      if (!box) return;
      const want = particleCount(nD);
      if (want === box.count) return;
      const now = performance.now();
      if (want > box.count) {
        const first = box.setCount(want, modelKT(TD));
        for (let i = first; i < want; i++) born[i] = now;
      } else {
        for (let i = want; i < box.count; i++) ghosts.push({ x: box.x[i]!, y: box.y[i]!, vx: box.vx[i]!, vy: box.vy[i]!, t0: now });
        box.setCount(want, modelKT(TD));
      }
      if (ghosts.length > 40) ghosts = ghosts.slice(-40);
    }

    function tickParticles(dt: number): void {
      const G = lastGeo;
      if (!G || !box) return;
      dt = Math.min(dt, 0.05);
      const b = box;
      const target = boxHeight(G, cur.V);
      const u = dt > 0 ? clamp((target - b.height) / dt, -60, 60) : 0;
      const kT = modelKT(TD);
      const J0 = b.impulse;
      const P0 = b.perimeterTime;
      const want = p.hits;
      stepper.run(dt, (h) =>
        b.step(h, {
          kT,
          pistonSpeed: u,
          tau: 0.25,
          shuffle: 2,
          onHit: want ? (x, y, wall) => flashes.push({ x, y, wall, age: 0 }) : undefined,
        }),
      );
      if (Math.abs(b.height - target) > 1e-6) b.squeeze(target);
      if (flashes.length > 160) flashes = flashes.slice(-160);
      for (const gh of ghosts) {
        gh.x += gh.vx * dt;
        gh.y += gh.vy * dt;
      }
      for (const f of flashes) f.age += dt;
      flashes = flashes.filter((f) => f.age < 0.32);
      // Druck aus den Stößen: nur bei ruhendem Kolben und gleichbleibender Temperatur messen
      // (am bewegten Kolben ändert sich die Energie der Teilchen, das wäre kein Gleichgewicht)
      if (Math.abs(u) > 0.02 || Math.abs(kelvin(p.T) - TD) > 0.5) {
        kinWin = [];
        kinValid = false;
        return;
      }
      kinWin.push([b.impulse - J0, b.perimeterTime - P0, idealPressure2D(b.count, kT, b.area()) * dt, dt]);
      let tsum = 0;
      for (let i = kinWin.length - 1; i >= 0; i--) {
        tsum += kinWin[i]![3];
        if (tsum > 15) {
          kinWin = kinWin.slice(i);
          break;
        }
      }
      let J = 0;
      let PT = 0;
      let I = 0;
      let T = 0;
      for (const [a, bb, c, d] of kinWin) {
        J += a;
        PT += bb;
        I += c;
        T += d;
      }
      if (PT > 0 && I > 0 && T > 6) {
        kinRatio = J / PT / (I / T);
        kinValid = true;
      }
    }

    /* ---------- Messreihe ---------- */
    let points: Point[] = [];
    let seriesMode: Mode = mode();
    let autoRun = false;
    let autoIdx = 0;
    let autoWait = 0;
    const pulse = new Tween(700, ease.outCubic);
    let lastGeo: Geo | null = null;
    let lastChartMap: ChartMap | null = null;

    function clearPoints(): void {
      points = [];
      seriesMode = mode();
    }

    function record(): void {
      const m = mode();
      if (points.length && seriesMode !== m) clearPoints();
      seriesMode = m;
      const rel = p.noise ? NOISE : 0;
      const pt: Point = {
        p: m === 'isobar' && cur.stop === 0 ? cur.p : noisy(cur.p, rel, noiseRand),
        V: m === 'isobar' ? noisy(cur.V, rel, noiseRand) : cur.V,
        T: cur.T,
        mode: m,
        born: performance.now(),
        from: sourcePoint(),
      };
      if (prefersReducedMotion()) pt.born = -1e9;
      const last = points[points.length - 1];
      if (last && Math.abs(last.T - pt.T) < 0.05 && Math.abs(last.V - cur.V) < 0.05 && Math.abs(last.p - cur.p) < 0.05 * Math.max(1, cur.p / 100)) {
        pulse.play();
        return;
      }
      points = [...points, pt].slice(-MAX_POINTS);
      updateTable();
    }

    /** Startpunkt eines neuen Messpunkts: Manometer (Druck gemessen) bzw. Kolben (Volumen gemessen). */
    function sourcePoint(): [number, number] {
      const G = lastGeo;
      if (!G) return [0, 0];
      if (mode() === 'isobar') return [G.cx, vToY(G, cur.V) + 14];
      return [G.mx, G.my];
    }

    function startAuto(): void {
      clearPoints();
      autoRun = true;
      autoIdx = 0;
      autoWait = 0;
      setAutoTarget();
      updateTable();
    }

    function setAutoTarget(): void {
      if (mode() === 'isotherm') ctx.set({ V: AUTO_V[autoIdx]! });
      else ctx.set({ T: AUTO_T[autoIdx]! });
    }

    function autoStep(now: number): void {
      if (!autoRun) return;
      const list = mode() === 'isotherm' ? AUTO_V : AUTO_T;
      const settled = Math.abs(TD - kelvin(p.T)) < 0.05 && Math.abs(nD - p.n) < 1e-3 && (mode() === 'isobar' ? Math.abs(pWD - p.p) < 0.02 : Math.abs(VD - p.V) < 0.005);
      if (!settled) {
        autoWait = 0;
        return;
      }
      if (!autoWait) {
        autoWait = now + 320;
        return;
      }
      if (now < autoWait) return;
      // auf den Zielwert einrasten, damit Tabelle (ϑ und T) und Anzeige zusammenpassen
      snapState();
      record();
      autoIdx++;
      autoWait = 0;
      if (autoIdx >= list.length) {
        autoRun = false;
        return;
      }
      setAutoTarget();
    }

    /* ---------- Zeichnen: Szene ---------- */
    function drawPlate(G: Geo, heatVis: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const px0 = G.glassX - (G.sm ? 14 : 22);
      const pw0 = G.glassW + (G.sm ? 28 : 44);
      const top = G.plateTop;
      const bot = G.tableY;
      const photo = ctx.images.get('plate');
      if (photo) {
        drawPlatePhoto(photo, px0, top, pw0, bot - top, heatVis, G);
        return;
      }
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.25)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const body = g.createLinearGradient(0, top, 0, bot);
      body.addColorStop(0, dark ? '#3a424e' : '#5b6572');
      body.addColorStop(1, dark ? '#20252d' : '#353c46');
      g.fillStyle = body;
      roundRect(g, px0, top + 4, pw0, bot - top - 3, 5);
      g.fill();
      g.restore();
      const hot = Math.max(0, heatVis);
      const cold = Math.max(0, -heatVis);
      let plate = dark ? '#6c7480' : '#8d96a3';
      if (hot > 0) plate = mixColor(plate, '#ff5a1f', hot * 0.9);
      if (cold > 0) plate = mixColor(plate, dark ? '#9fd3ff' : '#d8efff', cold * 0.85);
      const pg = g.createLinearGradient(0, top, 0, top + 7);
      pg.addColorStop(0, shade(plate, 0.25));
      pg.addColorStop(1, shade(plate, -0.15));
      g.fillStyle = pg;
      roundRect(g, px0 + 6, top, pw0 - 12, 7, 3);
      g.fill();
      if (hot > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.8);
        gl.addColorStop(0, `rgba(255,110,40,${0.42 * hot})`);
        gl.addColorStop(1, 'rgba(255,110,40,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.8, G.glassW * 2, G.glassW * 0.8 + 8);
        g.strokeStyle = `rgba(255,${Math.round(150 + 60 * hot)},90,${0.75 * hot})`;
        g.lineWidth = 1.6;
        g.beginPath();
        const yy = top + 3.5;
        for (let x = px0 + 14; x < px0 + pw0 - 14; x += 9) {
          g.moveTo(x, yy);
          g.quadraticCurveTo(x + 4.5, yy - 2.2, x + 9, yy);
        }
        g.stroke();
      }
      if (cold > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.7);
        gl.addColorStop(0, `rgba(120,190,255,${0.36 * cold})`);
        gl.addColorStop(1, 'rgba(120,190,255,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.7, G.glassW * 2, G.glassW * 0.7 + 8);
      }
      const kx = px0 + pw0 - (G.sm ? 13 : 17);
      const ky = top + (bot - top) / 2 + 3;
      const kr = G.sm ? 4.5 : 6;
      g.fillStyle = dark ? '#151a20' : '#23282f';
      g.beginPath();
      g.arc(kx, ky, kr, 0, TAU);
      g.fill();
      g.strokeStyle = heatVis > 0.05 ? '#ff8a4c' : heatVis < -0.05 ? '#8fd0ff' : '#c9d1da';
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      const ang = -Math.PI / 2 + heatVis * 1.1;
      g.beginPath();
      g.moveTo(kx, ky);
      g.lineTo(kx + Math.cos(ang) * kr * 0.8, ky + Math.sin(ang) * kr * 0.8);
      g.stroke();
      const lx = px0 + (G.sm ? 11 : 15);
      g.fillStyle = heatVis > 0.05 ? `rgba(255,120,50,${0.4 + 0.6 * hot})` : heatVis < -0.05 ? `rgba(110,190,255,${0.4 + 0.6 * cold})` : dark ? '#404854' : '#6b7480';
      g.beginPath();
      g.arc(lx, ky, G.sm ? 2.5 : 3, 0, TAU);
      g.fill();
    }

    /**
     * Heizplatte als Foto. Das Foto ist höher als die flache Platte im Aufbau;
     * damit nichts verzerrt wird, bleiben die Enden (rechts mit Drehknopf und
     * Kontrolllampe) maßstabsgetreu, nur das gleichförmige Mittelstück wird
     * waagerecht gestreckt. Glühen, Knopfstellung und Lampe kommen darüber.
     */
    const PLATE_SRC = { top: 16, bottom: 303, left: 300, right: 1250, width: 1600, glass: 50, knobX: 1375, knobY: 180, knobR: 60, ledX: 1497, ledY: 180 };
    function drawPlatePhoto(img: HTMLImageElement, x: number, top: number, w: number, h: number, heatVis: number, G: Geo): void {
      const g = surface.g;
      const P = PLATE_SRC;
      const k = h / (P.bottom - P.top);
      const lw = P.left * k;
      const rw = (P.width - P.right) * k;
      const mw = Math.max(1, w - lw - rw);
      const piece = (sx: number, sw: number, dx: number, dw: number) => {
        const crop = { x: sx, y: P.top, w: sw, h: P.bottom - P.top };
        g.drawImage(scaledSprite(img, dw, h, surface.dpr, { crop }), dx, top, dw, h);
      };
      g.save();
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.25)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      piece(0, P.left, x, lw + 0.5);
      piece(P.left, P.right - P.left, x + lw, mw + 0.5);
      piece(P.right, P.width - P.right, x + lw + mw, rw);
      g.restore();
      const hot = Math.max(0, heatVis);
      const cold = Math.max(0, -heatVis);
      // Glaskeramik oben: glüht beim Heizen, wird beim Kühlen bläulich
      const gh = (P.glass - P.top) * k;
      if (hot > 0.01 || cold > 0.01) {
        g.fillStyle = hot > 0 ? `rgba(255,90,31,${0.75 * hot})` : `rgba(150,205,255,${0.6 * cold})`;
        roundRect(g, x + 20 * k, top + 0.5, w - 40 * k, gh, Math.min(3, gh / 2));
        g.fill();
      }
      if (hot > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.8);
        gl.addColorStop(0, `rgba(255,110,40,${0.42 * hot})`);
        gl.addColorStop(1, 'rgba(255,110,40,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.8, G.glassW * 2, G.glassW * 0.8 + 8);
      }
      if (cold > 0.01) {
        const gl = g.createRadialGradient(G.cx, top, 4, G.cx, top, G.glassW * 0.7);
        gl.addColorStop(0, `rgba(120,190,255,${0.36 * cold})`);
        gl.addColorStop(1, 'rgba(120,190,255,0)');
        g.fillStyle = gl;
        g.fillRect(G.cx - G.glassW, top - G.glassW * 0.7, G.glassW * 2, G.glassW * 0.7 + 8);
      }
      // Stellung des Drehknopfs und Kontrolllampe
      const rx = x + lw + mw - P.right * k;
      const kx = rx + P.knobX * k;
      const ky = top + (P.knobY - P.top) * k;
      const kr = P.knobR * k;
      g.strokeStyle = heatVis > 0.05 ? '#ff8a4c' : heatVis < -0.05 ? '#8fd0ff' : '#c9d1da';
      g.lineWidth = Math.max(1.2, kr * 0.25);
      g.lineCap = 'round';
      const ang = -Math.PI / 2 + heatVis * 1.1;
      g.beginPath();
      g.moveTo(kx, ky);
      g.lineTo(kx + Math.cos(ang) * kr * 0.75, ky + Math.sin(ang) * kr * 0.75);
      g.stroke();
      if (Math.abs(heatVis) > 0.05) {
        g.fillStyle = heatVis > 0 ? `rgba(255,120,50,${0.4 + 0.6 * hot})` : `rgba(110,190,255,${0.4 + 0.6 * cold})`;
        g.beginPath();
        g.arc(rx + P.ledX * k, top + (P.ledY - P.top) * k, Math.max(2, 14 * k), 0, TAU);
        g.fill();
      }
    }

    /** Wärmebad (isotherm): Wanne mit Wasser um den unteren Teil des Zylinders. */
    function bathRect(G: Geo): Rect {
      const m = G.sm ? 10 : 16;
      const top = G.iyB - G.Hc * 0.36;
      return { x: G.glassX - m, y: top, w: G.glassW + 2 * m, h: G.plateTop - top };
    }
    /** Farbe des Wassers (kalt hellblau, warm rötlich) mit Deckkraft. */
    function bathColor(alpha: number): string {
      const warm = clamp((celsius(TD) - 25) / 150, 0, 1);
      const cold = clamp((10 - celsius(TD)) / 60, 0, 1);
      let c = ctx.theme.dark ? '#3d7fc4' : '#7fb6ea';
      if (warm > 0) c = mixColor(c, ctx.theme.dark ? '#c4643d' : '#f0a070', warm);
      if (cold > 0) c = mixColor(c, ctx.theme.dark ? '#7fc4e8' : '#bfe6fb', cold * 0.6);
      return mixColor(c, c, 0, alpha);
    }
    function drawBath(G: Geo, a: number, front: boolean): void {
      if (a < 0.01) return;
      const g = surface.g;
      const dark = ctx.theme.dark;
      const B = bathRect(G);
      const lift = (1 - a) * 10;
      const waterTop = B.y + 8 + lift;
      g.save();
      g.globalAlpha *= a;
      if (!front) {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.45)' : 'rgba(20,30,45,0.18)';
        g.shadowBlur = 12;
        g.shadowOffsetY = 4;
        g.fillStyle = dark ? 'rgba(40,56,78,0.55)' : 'rgba(236,242,249,0.85)';
        roundRect(g, B.x, B.y, B.w, B.h, 7);
        g.fill();
        g.restore();
        const wg = g.createLinearGradient(0, waterTop, 0, B.y + B.h);
        wg.addColorStop(0, bathColor(dark ? 0.35 : 0.42));
        wg.addColorStop(1, bathColor(dark ? 0.55 : 0.62));
        g.fillStyle = wg;
        roundRect(g, B.x + 2, waterTop, B.w - 4, B.y + B.h - waterTop - 1, 5);
        g.fill();
      } else {
        // Wasser vor dem Glas (leicht durchscheinend), Oberfläche mit kleinen Wellen
        g.fillStyle = bathColor(dark ? 0.16 : 0.18);
        g.fillRect(G.glassX, waterTop, G.glassW, B.y + B.h - waterTop - 1);
        const t = prefersReducedMotion() ? 0 : performance.now() / 1000;
        g.strokeStyle = dark ? 'rgba(190,220,250,0.55)' : 'rgba(255,255,255,0.9)';
        g.lineWidth = 1.5;
        g.beginPath();
        for (let x = B.x + 3; x <= B.x + B.w - 3; x += 3) {
          const yy = waterTop + Math.sin(x * 0.12 + t * 2.2) * 0.9;
          if (x === B.x + 3) g.moveTo(x, yy);
          else g.lineTo(x, yy);
        }
        g.stroke();
        if (!prefersReducedMotion()) animating = true;
        // Glaswanne vorn
        g.strokeStyle = dark ? 'rgba(200,220,245,0.4)' : 'rgba(110,135,165,0.5)';
        g.lineWidth = 1.4;
        roundRect(g, B.x + 0.5, B.y + 0.5, B.w - 1, B.h - 1, 7);
        g.stroke();
        g.fillStyle = dark ? 'rgba(210,228,250,0.45)' : 'rgba(255,255,255,0.95)';
        roundRect(g, B.x - 2, B.y - 2, 6, 5, 2);
        g.fill();
        roundRect(g, B.x + B.w - 4, B.y - 2, 6, 5, 2);
        g.fill();
        const lab = ctx.t('bath');
        const fs = G.sm ? 10.5 : 11.5;
        text(g, lab, B.x + B.w / 2, B.y + B.h - (G.sm ? 9 : 11), { font: `700 ${fs}px ${ctx.theme.font}`, color: dark ? 'rgba(220,235,255,0.85)' : 'rgba(30,60,100,0.75)' });
      }
      g.restore();
    }

    function drawCylinder(G: Geo, front: boolean, ik: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const top = G.iy0 - 4;
      const bot = G.plateTop;
      const x0 = G.glassX;
      const w = G.glassW;
      if (!front) {
        const inner = g.createLinearGradient(0, G.iy0, 0, G.iyB);
        inner.addColorStop(0, dark ? 'rgba(30,44,64,0.55)' : 'rgba(234,241,249,0.9)');
        inner.addColorStop(1, dark ? 'rgba(20,30,46,0.75)' : 'rgba(218,228,240,0.95)');
        g.save();
        g.globalAlpha *= ik;
        g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.18)';
        g.shadowBlur = 14;
        g.shadowOffsetY = 4;
        g.fillStyle = inner;
        roundRect(g, x0, top, w, bot - top, 6);
        g.fill();
        g.restore();
        // Gasraum: zarter Farbton nach Temperatur
        const yP = vToY(G, cur.V);
        const warm = clamp((celsius(TD) + 50) / 300, 0, 1);
        const tint = mixColor(pCol(), tCol(), warm);
        g.save();
        g.globalAlpha *= ik * (dark ? 0.1 : 0.07);
        g.fillStyle = tint;
        g.fillRect(G.ix, yP, G.iw, G.iyB - yP);
        g.restore();
        return;
      }
      g.save();
      g.globalAlpha *= ik;
      const wall = (xa: number, left: boolean) => {
        const gr = g.createLinearGradient(xa, 0, xa + G.gw, 0);
        gr.addColorStop(0, dark ? 'rgba(170,200,235,0.30)' : 'rgba(150,175,205,0.55)');
        gr.addColorStop(left ? 0.35 : 0.65, dark ? 'rgba(220,235,255,0.42)' : 'rgba(255,255,255,0.85)');
        gr.addColorStop(1, dark ? 'rgba(150,180,220,0.22)' : 'rgba(140,165,195,0.5)');
        g.fillStyle = gr;
        g.fillRect(xa, top, G.gw, bot - top);
      };
      wall(x0, true);
      wall(x0 + w - G.gw, false);
      const bg = g.createLinearGradient(0, G.iyB, 0, bot);
      bg.addColorStop(0, dark ? 'rgba(190,215,245,0.35)' : 'rgba(255,255,255,0.8)');
      bg.addColorStop(1, dark ? 'rgba(120,150,190,0.3)' : 'rgba(150,175,205,0.6)');
      g.fillStyle = bg;
      g.fillRect(x0, G.iyB, w, bot - G.iyB);
      g.fillStyle = dark ? 'rgba(210,228,250,0.5)' : 'rgba(255,255,255,0.95)';
      roundRect(g, x0 - 2, top - 2, G.gw + 4, 5, 2);
      g.fill();
      roundRect(g, x0 + w - G.gw - 2, top - 2, G.gw + 4, 5, 2);
      g.fill();
      const sh = g.createLinearGradient(x0, 0, x0 + w, 0);
      sh.addColorStop(0, 'rgba(255,255,255,0)');
      sh.addColorStop(0.08, dark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.28)');
      sh.addColorStop(0.16, 'rgba(255,255,255,0)');
      sh.addColorStop(0.86, 'rgba(255,255,255,0)');
      sh.addColorStop(0.92, dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.18)');
      sh.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = sh;
      g.fillRect(x0, top, w, bot - top);
      // Anschläge bei V_MIN und V_MAX
      g.fillStyle = dark ? 'rgba(20,26,34,0.85)' : 'rgba(60,70,84,0.8)';
      for (const V of [V_MIN, V_MAX]) {
        const yy = vToY(G, V);
        g.fillRect(G.ix, yy - 1.5, 4, 3);
        g.fillRect(G.ix + G.iw - 4, yy - 1.5, 4, 3);
      }
      // Volumenskala innen links am Glas (eingeätzt), Marke rechts außen
      const xr = x0 + w;
      g.strokeStyle = withAlpha(ctx.theme.text, 0.45);
      g.lineWidth = 1;
      g.beginPath();
      for (let V = 5; V <= V_CAP - 1e-9; V += 5) {
        const yy = Math.round(vToY(G, V)) + 0.5;
        const big = V % 10 === 0;
        g.moveTo(G.ix, yy);
        g.lineTo(G.ix + (big ? 8 : 4), yy);
        g.moveTo(xr - G.gw - (big ? 6 : 3), yy);
        g.lineTo(xr - G.gw, yy);
      }
      g.stroke();
      const font = `700 ${G.sm ? 10 : 11}px ${ctx.theme.font}`;
      const yNow = vToY(G, cur.V);
      const labCol = ctx.theme.dark ? 'rgba(220,232,250,0.7)' : 'rgba(40,60,90,0.62)';
      for (let V = 10; V <= 50; V += 10) {
        const yy = vToY(G, V);
        const a = clamp((Math.abs(yy - yNow) - 9) / 8, 0, 1);
        if (a < 0.02) continue;
        g.save();
        g.globalAlpha *= a;
        // heller bzw. dunkler Rand in der Farbe des Glases, damit Wasserspiegel und Teilchen die Zahl nicht stören
        g.font = font;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.lineJoin = 'round';
        g.lineWidth = 4;
        g.strokeStyle = ctx.theme.dark ? 'rgba(32,48,70,0.75)' : 'rgba(240,245,251,0.92)';
        g.strokeText(String(V), G.ix + (G.sm ? 10 : 12), yy);
        text(g, String(V), G.ix + (G.sm ? 10 : 12), yy, { font, color: labCol, align: 'left' });
        g.restore();
      }
      text(g, 'V in L', G.ix + (G.sm ? 6 : 8), G.iy0 + 2, { font: `700 ${G.sm ? 10 : 10.5}px ${ctx.theme.font}`, color: labCol, align: 'left' });
      // Marke am aktuellen Volumen
      const vc = vCol();
      g.fillStyle = vc;
      g.beginPath();
      g.moveTo(xr + 1, yNow);
      g.lineTo(xr + 8, yNow - 4.5);
      g.lineTo(xr + 8, yNow + 4.5);
      g.closePath();
      g.fill();
      g.restore();
    }

    function drawFlashes(G: Geo): void {
      if (!flashes.length || !box) return;
      const g = surface.g;
      const sp = glow();
      const X = (x: number) => G.ix + x * G.s;
      const Y = (y: number) => G.iyB - y * G.s;
      g.save();
      for (const f of flashes) {
        const a = 1 - f.age / 0.32;
        let px = X(f.x);
        let py = Y(f.y);
        const r = R_DRAW * G.s;
        // Lichtfleck genau an der Wand (außerhalb der Kugel)
        if (f.wall === WALL_LEFT) px -= r;
        else if (f.wall === WALL_RIGHT) px += r;
        else if (f.wall === WALL_BOTTOM) py += r;
        else if (f.wall === WALL_PISTON) py -= r;
        const horiz = f.wall === WALL_BOTTOM || f.wall === WALL_PISTON;
        const L1 = (G.sm ? 12 : 16) * (0.7 + 0.3 * a);
        const L2 = (G.sm ? 5 : 6) * (0.7 + 0.3 * a);
        g.globalAlpha = a * a * 0.9;
        g.drawImage(sp, px - (horiz ? L1 : L2) / 2, py - (horiz ? L2 : L1) / 2, horiz ? L1 : L2, horiz ? L2 : L1);
      }
      g.restore();
    }

    function drawParticles(G: Geo): void {
      const g = surface.g;
      const b = box!;
      const X = (x: number) => G.ix + x * G.s;
      const Y = (y: number) => G.iyB - y * G.s;
      const rad = R_DRAW * G.s;
      const pal = speedPalette();
      const now = performance.now();
      g.save();
      g.beginPath();
      g.rect(G.ix, vToY(G, cur.V) - 1, G.iw, G.iyB - vToY(G, cur.V) + 1);
      g.clip();
      drawFlashes(G);
      for (let i = 0; i < b.count; i++) {
        const introPop = intro.running ? ease.outBack(clamp((intro.t - 0.12 - (i / Math.max(1, b.count)) * 0.45) / 0.35, 0, 1)) : 1;
        const age = (now - born[i]!) / 450;
        const pop = Math.min(introPop, age < 1 ? ease.outBack(clamp(age, 0, 1)) : 1);
        if (age < 1) animating = true;
        const v = Math.hypot(b.vx[i]!, b.vy[i]!);
        drawBall(pal[shadeOf(v)]!, X(b.x[i]!), Y(b.y[i]!), rad, pop);
      }
      ghosts = ghosts.filter((gh) => now - gh.t0 < 400);
      for (const gh of ghosts) {
        const u = (now - gh.t0) / 400;
        drawBall(pal[shadeOf(Math.hypot(gh.vx, gh.vy))]!, X(gh.x), Y(gh.y), rad, 1 - u * 0.6, 1 - u);
        animating = true;
      }
      g.restore();
    }

    function drawPiston(G: Geo, ik: number, aT: number, aP: number, aV: number): void {
      const g = surface.g;
      const dark = ctx.theme.dark;
      const yb = vToY(G, cur.V);
      const th = clamp(G.Hc * 0.035, 8, 13);
      const x0 = G.ix + 0.5;
      const w = G.iw - 1;
      g.save();
      g.globalAlpha *= ik;
      // Kolbenstange und Griff (isotherm)
      if (aT > 0.01) {
        g.save();
        g.globalAlpha *= aT;
        const hot = gripHover || dragV;
        const gy = Math.max(G.r.y + (G.sm ? 10 : 14), yb - th - clamp(G.Hc * 0.2, 30, 70) - (1 - aT) * 12);
        const rw = G.sm ? 6 : 8;
        const rg = g.createLinearGradient(G.cx - rw / 2, 0, G.cx + rw / 2, 0);
        rg.addColorStop(0, dark ? '#59616d' : '#8e98a5');
        rg.addColorStop(0.45, dark ? '#c5ccd6' : '#f2f4f7');
        rg.addColorStop(1, dark ? '#4a515c' : '#7b8592');
        g.fillStyle = rg;
        g.fillRect(G.cx - rw / 2, gy + 6, rw, yb - th - gy - 6);
        const gwid = Math.min(G.iw * 0.62, G.sm ? 70 : 104);
        const gh = G.sm ? 13 : 16;
        g.save();
        g.shadowColor = hot ? withAlpha(vCol(), 0.6) : dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = hot ? 14 : 8;
        g.shadowOffsetY = hot ? 0 : 3;
        const kg = g.createLinearGradient(0, gy, 0, gy + gh);
        kg.addColorStop(0, dark ? '#3a4250' : '#4a5361');
        kg.addColorStop(0.5, dark ? '#262c35' : '#2f353e');
        kg.addColorStop(1, dark ? '#1a1e25' : '#20252c');
        g.fillStyle = kg;
        roundRect(g, G.cx - gwid / 2, gy, gwid, gh, gh / 2);
        g.fill();
        g.restore();
        g.strokeStyle = 'rgba(255,255,255,0.14)';
        g.lineWidth = 1;
        g.beginPath();
        for (let x = G.cx - gwid / 2 + gh / 2 + 3; x < G.cx + gwid / 2 - gh / 2 - 2; x += 4) {
          g.moveTo(x, gy + 3.5);
          g.lineTo(x, gy + gh - 3.5);
        }
        g.stroke();
        if (hot) {
          g.strokeStyle = vCol();
          g.lineWidth = 2;
          roundRect(g, G.cx - gwid / 2 - 2, gy - 2, gwid + 4, gh + 4, gh / 2 + 2);
          g.stroke();
        }
        lastGrip = { x: G.cx - gwid / 2 - 8, y: gy - 8, w: gwid + 16, h: yb - gy + 8 };
        g.restore();
      } else lastGrip = null;
      // Kolbenscheibe
      g.save();
      g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const mg = g.createLinearGradient(0, yb - th, 0, yb);
      mg.addColorStop(0, dark ? '#c5ccd6' : '#eef1f5');
      mg.addColorStop(0.5, dark ? '#8d96a3' : '#b9c1cc');
      mg.addColorStop(1, dark ? '#5d6570' : '#87909c');
      g.fillStyle = mg;
      roundRect(g, x0, yb - th, w, th, 3);
      g.fill();
      g.restore();
      g.fillStyle = dark ? '#1b1f25' : '#2c3138';
      g.fillRect(x0, yb - th * 0.62, 3, th * 0.26);
      g.fillRect(x0 + w - 3, yb - th * 0.62, 3, th * 0.26);
      // Gewichtsstücke (isobar): je angefangene 50 kPa ein Stück, das oberste blendet ein
      if (aP > 0.01) {
        const count = clamp(Math.round(p.p / 50), 1, 6);
        const dh = clamp(G.Hc * 0.028, 7, 11);
        const ww = Math.min(w * 0.56, G.sm ? 70 : 110);
        let yTop = yb - th;
        for (let k = 0; k < 6; k++) {
          const a = ease2(`disc${k}`, k < count ? 1 : 0, 7) * aP;
          if (a < 0.01) break;
          const drop = (1 - a) * 14;
          const wk = ww * (1 - k * 0.05);
          const y = yTop - dh - drop;
          g.save();
          g.globalAlpha *= a;
          g.shadowColor = dark ? 'rgba(0,0,0,0.55)' : 'rgba(20,30,45,0.28)';
          g.shadowBlur = 5;
          g.shadowOffsetY = 2;
          const iron = g.createLinearGradient(G.cx - wk / 2, 0, G.cx + wk / 2, 0);
          iron.addColorStop(0, dark ? '#2b3038' : '#3c434d');
          iron.addColorStop(0.35, dark ? '#5d6672' : '#76808c');
          iron.addColorStop(1, dark ? '#23272e' : '#30363e');
          g.fillStyle = iron;
          roundRect(g, G.cx - wk / 2, y, wk, dh - 1, 3);
          g.fill();
          g.restore();
          g.save();
          g.globalAlpha *= a;
          g.fillStyle = 'rgba(255,255,255,0.2)';
          g.fillRect(G.cx - wk / 2 + 3, y + 1.5, wk - 6, 1.2);
          g.restore();
          yTop = y + drop;
        }
      }
      // Arretierung (isochor): Bolzen durch die Glaswand direkt über dem Kolben
      if (aV > 0.01) {
        g.save();
        g.globalAlpha *= aV;
        const by = yb - th - 5;
        const bl = (G.sm ? 12 : 16) * aV;
        for (const side of [-1, 1]) {
          const xw = side < 0 ? G.glassX : G.glassX + G.glassW;
          const bx = side < 0 ? xw - 6 : xw + 6 - (G.gw + bl + 6);
          const bw = G.gw + bl + 6;
          const bg = g.createLinearGradient(0, by - 3.5, 0, by + 3.5);
          bg.addColorStop(0, dark ? '#d6a94a' : '#e7c060');
          bg.addColorStop(1, dark ? '#8a6420' : '#a87a26');
          g.fillStyle = bg;
          roundRect(g, side < 0 ? bx : bx, by - 3.5, bw, 7, 3);
          g.fill();
          g.fillStyle = dark ? '#6b4e18' : '#8a6420';
          g.beginPath();
          g.arc(side < 0 ? xw - 6 : xw + 6, by, 5, 0, TAU);
          g.fill();
        }
        g.restore();
      }
      g.restore();
    }

    /** Manometer mit gleitendem Zeiger. */
    let shownRange = 0;
    let prevRange = 0;
    const rangeSwap = new Tween(600, ease.inOutCubic);
    function drawGauge(G: Geo, pShown: number, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const { mx: cx, my: cy, mr: r } = G;
      const a0 = 0.75 * Math.PI;
      const sweep = 1.5 * Math.PI;
      const ang = (pp: number, range: number) => a0 + sweep * clamp(pp / range, 0, 1.04);
      const pop = stage(0.08, 0.5);
      g.save();
      g.globalAlpha *= ik * pop;
      g.translate(cx, cy);
      g.scale(0.85 + 0.15 * pop, 0.85 + 0.15 * pop);
      g.translate(-cx, -cy);
      // Leitung zum Zylinder (Messing)
      const portY = G.iyB - (G.sm ? 10 : 14);
      const pipe = (w: number, color: string) => {
        g.strokeStyle = color;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.beginPath();
        g.moveTo(cx, cy + r * 0.8);
        g.lineTo(cx, portY - 8);
        g.quadraticCurveTo(cx, portY, cx + 8, portY);
        g.lineTo(G.glassX + 2, portY);
        g.stroke();
      };
      pipe(G.sm ? 6 : 7, dark ? '#7a6230' : '#a5843f');
      pipe(G.sm ? 2.5 : 3, dark ? '#c9a95c' : '#e3c57d');
      g.fillStyle = dark ? '#8a7036' : '#b8954a';
      roundRect(g, G.glassX - 7, portY - 6, 9, 12, 2);
      g.fill();
      // Gehäuse (Foto: Mitte des Zifferblatts genau auf dem Drehpunkt des Zeigers)
      const photo = ctx.images.get('gauge');
      let fr: number;
      if (photo) {
        const k = r / GAUGE_SRC.r;
        const w = photo.width * k;
        // Gewindestutzen unten nur bis zur Leitung zeigen
        const srcBot = Math.min(photo.height, GAUGE_SRC.cy + (portY - 4 - cy) / k);
        const h = srcBot * k;
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = 14;
        g.shadowOffsetY = 4;
        const sprite = scaledSprite(photo, w, h, surface.dpr, { crop: { x: 0, y: 0, w: photo.width, h: srcBot } });
        g.drawImage(sprite, cx - GAUGE_SRC.cx * k, cy - GAUGE_SRC.cy * k, w, h);
        g.restore();
        fr = GAUGE_SRC.face * k;
        if (dark) {
          // Zifferblatt im Dunkelmodus abdunkeln, damit die helle Schrift lesbar bleibt
          g.fillStyle = 'rgba(20,26,35,0.86)';
          g.beginPath();
          g.arc(cx, cy, fr, 0, TAU);
          g.fill();
        }
      } else {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.6)' : 'rgba(20,30,45,0.3)';
        g.shadowBlur = 14;
        g.shadowOffsetY = 4;
        const bez = g.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
        bez.addColorStop(0, dark ? '#d3d9e1' : '#f4f6f8');
        bez.addColorStop(0.5, dark ? '#7d8693' : '#a8b1bc');
        bez.addColorStop(1, dark ? '#3e4550' : '#68717d');
        g.fillStyle = bez;
        g.beginPath();
        g.arc(cx, cy, r, 0, TAU);
        g.fill();
        g.restore();
        fr = r * 0.86;
        const face = g.createRadialGradient(cx - fr * 0.3, cy - fr * 0.35, fr * 0.1, cx, cy, fr);
        face.addColorStop(0, dark ? '#2a323e' : '#ffffff');
        face.addColorStop(1, dark ? '#1a2029' : '#eef1f5');
        g.fillStyle = face;
        g.beginPath();
        g.arc(cx, cy, fr, 0, TAU);
        g.fill();
      }
      // Skala (Messbereich blendet beim Umschalten über)
      const target = gaugeRange(mode(), p.n, kelvin(p.T), p.V, p.p);
      if (shownRange === 0) shownRange = target;
      if (target !== shownRange) {
        prevRange = shownRange;
        shownRange = target;
        rangeSwap.play();
      }
      const drawScale = (range: number, alpha: number) => {
        if (alpha < 0.01) return;
        g.save();
        g.globalAlpha *= alpha;
        const major = niceStep(range / 5);
        const minor = major / (major % 4 === 0 || major === 100 ? 4 : 5);
        // roter Bereich am Ende
        g.strokeStyle = withAlpha(tCol(), 0.55);
        g.lineWidth = fr * 0.09;
        g.beginPath();
        g.arc(cx, cy, fr * 0.84, ang(range * 0.9, range), ang(range, range));
        g.stroke();
        g.strokeStyle = withAlpha(theme.text, 0.75);
        g.lineCap = 'butt';
        for (let v = 0; v <= range + 1e-9; v += minor) {
          const big = Math.abs(v / major - Math.round(v / major)) < 1e-6;
          const a = ang(v, range);
          const r1 = fr * 0.9;
          const r0 = fr * (big ? 0.74 : 0.8);
          g.lineWidth = big ? 1.6 : 0.9;
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
          g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
          g.stroke();
        }
        const fs = clamp(fr * 0.2, 8.5, 11);
        const every = r < 48 && range / major > 3 ? 2 : 1;
        let k = 0;
        for (let v = 0; v <= range + 1e-9; v += major, k++) {
          if (k % every !== 0) continue;
          const a = ang(v, range);
          text(g, n(v, 0), cx + Math.cos(a) * fr * 0.55, cy + Math.sin(a) * fr * 0.55, { font: `600 ${fs}px ${theme.font}`, color: theme.text });
        }
        g.restore();
      };
      const sw = rangeSwap.running ? rangeSwap.value : 1;
      if (rangeSwap.running) drawScale(prevRange, 1 - sw);
      drawScale(shownRange, sw);
      text(g, 'kPa', cx, cy + fr * 0.56, { font: `700 ${clamp(fr * 0.19, 8.5, 11)}px ${theme.font}`, color: theme.muted });
      text(g, 'p', cx, cy + fr * 0.32, { font: `italic 700 ${clamp(fr * 0.26, 10, 15)}px ${theme.mathFont}`, color: pCol() });
      // Zeiger
      const a = ang(pShown, rangeD);
      const len = fr * 0.8;
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 4;
      g.shadowOffsetX = 1.5;
      g.shadowOffsetY = 2;
      g.fillStyle = pCol();
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len);
      g.lineTo(cx + Math.cos(a + Math.PI / 2) * 2.6, cy + Math.sin(a + Math.PI / 2) * 2.6);
      g.lineTo(cx - Math.cos(a) * fr * 0.18, cy - Math.sin(a) * fr * 0.18);
      g.lineTo(cx + Math.cos(a - Math.PI / 2) * 2.6, cy + Math.sin(a - Math.PI / 2) * 2.6);
      g.closePath();
      g.fill();
      g.restore();
      const hub = g.createRadialGradient(cx - 1.5, cy - 1.5, 0.5, cx, cy, 6);
      hub.addColorStop(0, '#f2f4f7');
      hub.addColorStop(1, '#4a525d');
      g.fillStyle = hub;
      g.beginPath();
      g.arc(cx, cy, G.sm ? 4 : 5, 0, TAU);
      g.fill();
      // Glas (das Foto hat eigene Glanzlichter)
      if (!photo) {
        const gl = g.createLinearGradient(cx - fr, cy - fr, cx + fr * 0.3, cy + fr * 0.3);
        gl.addColorStop(0, 'rgba(255,255,255,0.35)');
        gl.addColorStop(0.5, 'rgba(255,255,255,0.03)');
        gl.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = gl;
        g.beginPath();
        g.arc(cx, cy, fr, 0, TAU);
        g.fill();
      }
      g.restore();
      if (rangeSwap.running) animating = true;
    }

    /** Manometer-Foto: Mitte des Zifferblatts, Außenradius und Radius des Zifferblatts (Bildpixel). */
    const GAUGE_SRC = { cx: 505, cy: 505, r: 503, face: 395 };
    /**
     * Thermometer-Foto (Glasröhre ohne Skala, nur die Kugel gefüllt): Mitte der
     * Röhre, Kugelmitte und -radius, Oberkante der Röhre und Grenzen des
     * gleichförmigen Röhrenstücks (Bildpixel). Nur dieses Stück wird in der
     * Länge gestreckt; Kopf und Kugel bleiben maßstabsgetreu.
     */
    const THERMO_SRC = { cx: 99.5, bulbY: 1310, bulbR: 100, top: 10, tubeA: 60, tubeB: 1180 };
    function drawThermoPhoto(img: HTMLImageElement, x: number, top: number, by: number, br: number, color: string): void {
      const g = surface.g;
      const T = THERMO_SRC;
      const k = br / T.bulbR;
      const w = img.width * k;
      const x0 = x - T.cx * k;
      const yA = top + (T.tubeA - T.top) * k;
      const yB = by - (T.bulbY - T.tubeB) * k;
      const hBot = (img.height - T.tubeB) * k;
      const dpr = surface.dpr;
      const head = { x: 0, y: T.top, w: img.width, h: T.tubeA - T.top };
      g.drawImage(scaledSprite(img, w, yA - top, dpr, { crop: head }), x0, top, w, yA - top + 0.5);
      if (yB > yA) {
        const tube = { x: 0, y: T.tubeA, w: img.width, h: T.tubeB - T.tubeA };
        g.drawImage(scaledSprite(img, w, yB - yA, dpr, { crop: tube }), x0, yA, w, yB - yA + 0.5);
      }
      // Kugel in der Farbe der Säule
      const bulb = { x: 0, y: T.tubeB, w: img.width, h: img.height - T.tubeB };
      g.drawImage(tintedSprite(img, w, hBot, dpr, color, { crop: bulb, lift: 0.35 }), x0, yB, w, hBot);
    }

    let thermoHover = false;
    let gripHover = false;
    let lastGrip: Rect | null = null;
    function drawThermo(G: Geo, shown: number, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const dark = theme.dark;
      const sm = G.sm;
      const tw = sm ? 12 : 14;
      const br = sm ? 10 : 12;
      const x = G.tx;
      const top = G.tTop;
      const by = G.tBulb;
      const liquid = tCol();
      g.save();
      g.globalAlpha *= stage(0.15, 0.5) * ik;
      g.fillStyle = dark ? '#2a3039' : '#4a525d';
      roundRect(g, x - br - 6, G.tableY - 5, 2 * br + 12, 5, 2);
      g.fill();
      const photo = ctx.images.get('thermo');
      if (photo) drawThermoPhoto(photo, x, top, by, br, liquid);
      else {
        g.save();
        g.shadowColor = dark ? 'rgba(0,0,0,0.5)' : 'rgba(20,30,45,0.2)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        g.fillStyle = dark ? 'rgba(200,220,245,0.16)' : 'rgba(255,255,255,0.9)';
        g.beginPath();
        g.moveTo(x - tw / 2, top + tw / 2);
        g.arc(x, top + tw / 2, tw / 2, Math.PI, 0);
        g.lineTo(x + tw / 2, by - br * 0.7);
        g.arc(x, by, br, -Math.PI / 2 + 0.6, Math.PI * 1.5 - 0.6);
        g.closePath();
        g.fill();
        g.restore();
        g.strokeStyle = dark ? 'rgba(200,220,245,0.45)' : 'rgba(110,130,160,0.55)';
        g.lineWidth = 1.2;
        g.stroke();
      }
      const cap = sm ? 4 : 5;
      const yTop = clamp(thetaToY(G, shown), top + 6, by);
      g.fillStyle = liquid;
      if (photo) {
        // Säule bis in den Hals der fotografierten Kugel
        roundRect(g, x - cap / 2, yTop, cap, by - br * 0.6 - yTop, cap / 2);
        g.fill();
      } else {
        g.beginPath();
        g.arc(x, by, br - 3, 0, TAU);
        g.fill();
        roundRect(g, x - cap / 2, yTop, cap, by - yTop, cap / 2);
        g.fill();
        const hl = g.createRadialGradient(x - br * 0.35, by - br * 0.35, 1, x, by, br);
        hl.addColorStop(0, 'rgba(255,255,255,0.55)');
        hl.addColorStop(0.5, 'rgba(255,255,255,0)');
        g.fillStyle = hl;
        g.beginPath();
        g.arc(x, by, br - 3, 0, TAU);
        g.fill();
      }
      // Doppelskala: links °C, rechts K
      const lxR = x + tw / 2 + 3;
      const lxL = x - tw / 2 - 3;
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.lineWidth = 1;
      g.beginPath();
      for (let th = SCALE_LO; th <= SCALE_HI; th += 25) {
        const yy = Math.round(thetaToY(G, th)) + 0.5;
        const big = th % 50 === 0;
        g.moveTo(lxL, yy);
        g.lineTo(lxL - (big ? 6 : 3), yy);
      }
      for (let T = 250; T <= 500; T += 50) {
        const yy = Math.round(thetaToY(G, T - ZERO_CELSIUS)) + 0.5;
        const big = T % 100 === 0;
        g.moveTo(lxR, yy);
        g.lineTo(lxR + (big ? 6 : 3), yy);
      }
      g.stroke();
      const fs = sm ? 10 : 10.5;
      const font = `600 ${fs}px ${theme.font}`;
      const tall = G.tScaleBot - G.tScaleTop > 170;
      for (let th = SCALE_LO; th <= SCALE_HI; th += tall ? 50 : 100) {
        text(g, th < 0 ? `−${-th}` : String(th), lxL - 8, thetaToY(G, th), { font: th === 0 ? `800 ${fs}px ${theme.font}` : font, color: th === 0 ? liquid : theme.muted, align: 'right' });
      }
      for (let T = 300; T <= 500; T += 100) text(g, String(T), lxR + 8, thetaToY(G, T - ZERO_CELSIUS), { font, color: theme.muted, align: 'left' });
      text(g, '°C', lxL - 8, G.tScaleTop - 12, { font: `700 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      text(g, 'K', lxR + 8, G.tScaleTop - 12, { font: `700 ${fs}px ${theme.font}`, color: theme.muted, align: 'left' });
      const hot = thermoHover || dragT;
      if (!ctx.locked) {
        g.fillStyle = withAlpha(liquid, hot ? 0.3 : 0.14);
        g.beginPath();
        g.arc(x, yTop, hot ? 11 : 8, 0, TAU);
        g.fill();
        g.fillStyle = dark ? '#10161f' : '#ffffff';
        g.beginPath();
        g.arc(x, yTop, 4.5, 0, TAU);
        g.fill();
        g.strokeStyle = liquid;
        g.lineWidth = 2;
        g.stroke();
      }
      g.restore();
    }

    /** Kopfzeile: Druck über dem Manometer, Temperatur über dem Thermometer. */
    function drawHeader(G: Geo, pShown: number, thShown: number, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = G.sm;
      const size = sm ? 12 : 13;
      g.save();
      g.globalAlpha *= ik;
      const pl = `${qm(hideP(), fx(pShown, 1))} kPa`;
      const pw = pillWidth(pl, size);
      const px = clamp(G.mx, G.r.x + pw / 2 + 4, G.glassX - pw / 2 - 2);
      pill(px, G.hdrY, pl, pCol(), 'center', size);
      const kinTxt = kinValid && ctx.clock.playing && !hideP() ? tr(sm ? 'kinShortS' : 'kinShort', { p: n(Math.round(cur.p * kinRatio), 0) }) : '';
      if (kinTxt) {
        const ka = ease2('kinA', 1, 4);
        g.save();
        g.globalAlpha *= ka;
        text(g, kinTxt, clamp(px, G.r.x + 4 + g.measureText(kinTxt).width / 2, 1e9), G.hdrY + size + 21, { font: `600 ${sm ? 10.5 : 11}px ${theme.font}`, color: theme.muted });
        g.restore();
      } else soft.set('kinA', 0);
      const tl = `${n(Math.round(thShown), 0)} °C`;
      const tw = pillWidth(tl, size);
      const tx = clamp(G.tx, G.r.x + G.r.w - tw / 2 - 4, G.tx);
      const tpx = Math.min(tx, G.r.x + G.r.w - tw / 2 - 4);
      pill(tpx, G.hdrY, tl, tCol(), 'center', size);
      // Kelvin aus der gerundeten °C-Angabe, sonst stünde z. B. „373,07 K“ neben „100 °C“
      text(g, `${fx(kelvin(Math.round(thShown)), 2)} K`, tpx, G.hdrY + size + 21, { font: `600 ${sm ? 10.5 : 11}px ${theme.font}`, color: theme.muted });
      g.restore();
    }

    function drawScene(r: Rect): Geo {
      const g = surface.g;
      const G = sceneGeo(r);
      lastGeo = G;
      ensureBox(G);
      syncCount();
      if (box && !ctx.clock.playing) {
        const h = boxHeight(G, cur.V);
        if (Math.abs(box.height - h) > 1e-6) box.squeeze(h);
      }
      const ik = stage(0, 0.5);
      const m = mode();
      const aT = ease2('aT', m === 'isotherm' ? 1 : 0, 7);
      const aP = ease2('aP', m === 'isobar' ? 1 : 0, 7);
      const aV = ease2('aV', m === 'isochor' ? 1 : 0, 7);
      g.save();
      g.beginPath();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      drawRoom(r, G.tableY);
      const heatVis = ease2('heat', clamp((kelvin(p.T) - TD) / 12, -1, 1), 5);
      drawPlate(G, heatVis);
      drawBath(G, aT * ik, false);
      drawCylinder(G, false, ik);
      drawParticles(G);
      drawPiston(G, ik, aT, aP, aV);
      const pShown = intro.running ? cur.p * stage(0.25, 0.8, ease.inOutCubic) : ease2('needle', cur.p, 14, 0.01);
      drawGauge(G, pShown, ik);
      drawBath(G, aT * ik, true);
      drawCylinder(G, true, ik);
      const thShown = intro.running ? SCALE_LO + (celsius(TD) - SCALE_LO) * stage(0.2, 0.8, ease.inOutCubic) : celsius(TD);
      drawThermo(G, thShown, 1);
      drawHeader(G, pShown, celsius(TD), ik);
      // Volumen unter dem Kolben
      const yb = vToY(G, cur.V);
      const vl = `V = ${qm(hideV(), fx(cur.V, 1))} L`;
      const vs = G.sm ? 11 : 12;
      const vh = vs + 11;
      const vy = clamp(yb + 8, yb + 4, G.iyB - vh - 4);
      g.save();
      g.globalAlpha *= ik * 0.97;
      pill(G.cx, vy, vl, vCol(), 'center', vs);
      g.restore();
      // Anschlag (isobar)
      if (m === 'isobar' && cur.stop !== 0) {
        const lab = ctx.t(G.sm ? 'stopS' : cur.stop > 0 ? 'stopHi' : 'stopLo');
        const w = pillWidth(lab, G.sm ? 11 : 11.5);
        const x = clamp(G.cx, r.x + w / 2 + 4, r.x + r.w - w / 2 - 4);
        pill(x, Math.min(yb + vh + 14, G.iyB - vh - 4), lab, fitCol(), 'center', G.sm ? 11 : 11.5);
      }
      // Arretiert (isochor)
      if (aV > 0.01) {
        g.save();
        g.globalAlpha *= aV * ik;
        const lab = ctx.t('locked');
        const th = clamp(G.Hc * 0.035, 8, 13);
        haloText(lab, G.cx, yb - th - 12, `700 ${G.sm ? 10.5 : 11}px ${ctx.theme.font}`, ctx.theme.dark ? '#e7c060' : '#8a6420');
        g.restore();
      }
      // Hinweis auf dem Tisch
      const key = m === 'isotherm' ? 'hintT' : m === 'isobar' ? 'hintP' : 'hintV';
      text(g, ctx.t(G.sm ? `${key}S` : key), r.x + r.w / 2, G.tableY + (r.y + r.h - G.tableY) / 2 + 1, {
        font: `600 ${G.sm ? 11 : 11.5}px ${ctx.theme.font}`,
        color: ctx.theme.dark ? 'rgba(236,224,206,0.85)' : 'rgba(58,38,18,0.82)',
      });
      g.restore();
      if (Math.abs(heatVis) > 0.01) animating = true;
      return G;
    }

    /* ---------- Diagramm ---------- */
    interface ChartMap {
      ch: Chart;
      A: Rect;
      xMax: number;
      yMax: number;
      X: (x: number) => number;
      Y: (y: number) => number;
      xOf: (s: { p: number; V: number; T: number }) => number;
      yOf: (s: { p: number; V: number; T: number }) => number;
    }

    let shownCh: Chart = chart();
    let fromCh: Chart = shownCh;
    const chSwap = new Tween(520, ease.linear);
    let tabRects: { ch: Chart; r: Rect }[] = [];
    let trail: { x: number; y: number; ch: Chart; t: number }[] = [];

    function chartMap(R: Rect, ch: Chart): ChartMap {
      const sm = R.w < 340 || R.h < 220;
      const dual = ch === 'VT' || ch === 'pT';
      const padL = sm ? 40 : 46;
      const top = R.y + (sm ? 52 : 58);
      const bottom = dual ? (sm ? 40 : 44) : sm ? 26 : 30;
      const A: Rect = { x: R.x + padL, y: top, w: R.w - padL - (sm ? 14 : 18), h: R.y + R.h - top - bottom };
      const xMax = ch === 'pV' ? V_CAP : ch === 'pinv' ? INV_AXIS : T_AXIS;
      const yMax = ch === 'VT' ? V_CAP : rangeD;
      const xOf = (s: { p: number; V: number; T: number }) => (ch === 'pV' ? s.V : ch === 'pinv' ? 1 / s.V : s.T);
      const yOf = (s: { p: number; V: number; T: number }) => (ch === 'VT' ? s.V : s.p);
      return { ch, A, xMax, yMax, X: (x) => A.x + (x / xMax) * A.w, Y: (y) => A.y + A.h - (y / yMax) * A.h, xOf, yOf };
    }

    function drawTabs(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const sm = R.w < 340;
      const labels: [Chart, string][] = [
        ['pV', 'p-V'],
        ['pinv', 'p-1/V'],
        ['VT', 'V-T'],
        ['pT', 'p-T'],
      ];
      const size = sm ? 11.5 : 12.5;
      const h = size + 12;
      let x = R.x + (sm ? 10 : 14);
      const y = R.y + (sm ? 10 : 12);
      tabRects = [];
      g.save();
      g.globalAlpha *= ik;
      for (const [ch, lab] of labels) {
        const w = pillWidth(lab, size) + (sm ? 0 : 4);
        const on = ease2(`tab${ch}`, chart() === ch ? 1 : 0, 10);
        const hover = tabHover === ch;
        const col = ch === 'VT' ? vCol() : pCol();
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        g.shadowBlur = 4 + 4 * on;
        g.shadowOffsetY = 1;
        g.fillStyle = mixColor(theme.dark ? '#18202b' : '#f3f5f8', col, on * 0.92);
        roundRect(g, x, y, w, h, h / 2);
        g.fill();
        g.restore();
        if (hover && on < 0.5) {
          g.strokeStyle = withAlpha(col, 0.7);
          g.lineWidth = 1.5;
          roundRect(g, x + 0.75, y + 0.75, w - 1.5, h - 1.5, h / 2);
          g.stroke();
        }
        const tc = mixColor(theme.text, '#ffffff', on);
        text(g, lab, x + w / 2, y + h / 2 + 0.5, { font: `${on > 0.5 ? 800 : 700} ${size}px ${theme.font}`, color: tc });
        tabRects.push({ ch, r: { x, y, w, h } });
        x += w + (sm ? 5 : 7);
      }
      g.restore();
    }

    function drawAxes(M: ChartMap, sm: boolean): void {
      const g = surface.g;
      const theme = ctx.theme;
      const { A, ch } = M;
      const fs = sm ? 10.5 : 11.5;
      const font = `${fs}px ${theme.font}`;
      const xs = ch === 'pV' ? 10 : ch === 'pinv' ? 0.02 : 100;
      const ys = ch === 'VT' ? 10 : niceStep(M.yMax / (A.h < 140 ? 3 : 5));
      g.strokeStyle = theme.grid;
      g.lineWidth = 1;
      g.beginPath();
      for (let y = ys; y < M.yMax - 1e-9; y += ys) {
        const yy = Math.round(M.Y(y)) + 0.5;
        g.moveTo(A.x, yy);
        g.lineTo(A.x + A.w, yy);
      }
      for (let x = xs; x < M.xMax + 1e-9; x += xs) {
        const xx = Math.round(M.X(x)) + 0.5;
        g.moveTo(xx, A.y);
        g.lineTo(xx, A.y + A.h);
      }
      g.stroke();
      for (let y = 0; y < M.yMax + 1e-9; y += ys) {
        if (M.Y(y) < A.y + 6) continue;
        text(g, n(y, 0), A.x - 6, M.Y(y), { font, color: theme.muted, align: 'right' });
      }
      const xTitle = ch === 'pV' ? ctx.t('axisV') : ch === 'pinv' ? ctx.t('axisInv') : ctx.t('axisT');
      g.font = `600 ${fs}px ${theme.font}`;
      const titleW = g.measureText(xTitle).width;
      for (let x = 0; x < M.xMax + 1e-9; x += xs) {
        const xx = M.X(x);
        const lab = ch === 'pinv' ? n(x, 2) : n(x, 0);
        if (xx + g.measureText(lab).width / 2 > A.x + A.w - titleW - 8 && x > 0) continue;
        text(g, lab, xx, A.y + A.h + 11, { font, color: theme.muted });
      }
      text(g, xTitle, A.x + A.w, A.y + A.h + 11, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      if (ch === 'VT' || ch === 'pT') {
        // zweite Achse in °C
        const y2 = A.y + A.h + 27;
        const th2 = ctx.t('axisTh');
        const tw2 = g.measureText(th2).width;
        g.strokeStyle = withAlpha(theme.muted, 0.6);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(A.x, y2 - 7.5);
        g.lineTo(A.x + A.w, y2 - 7.5);
        for (const th of [-273.15, -200, -100, 0, 100, 200, 300]) {
          const xx = Math.round(M.X(kelvin(th))) + 0.5;
          g.moveTo(xx, y2 - 7.5);
          g.lineTo(xx, y2 - 4);
        }
        g.stroke();
        const tight = M.X(kelvin(-200)) - M.X(0) < 46;
        for (const th of [-273.15, -200, -100, 0, 100, 200, 300]) {
          const xx = M.X(kelvin(th));
          if (xx + 14 > A.x + A.w - tw2 - 8) continue;
          if (tight && th === -200) continue;
          const lab = th === -273.15 ? '−273' : th < 0 ? `−${-th}` : String(th);
          text(g, lab, xx, y2 + 3, { font: th === -273.15 || th === 0 ? `700 ${fs}px ${theme.font}` : font, color: th === 0 ? tCol() : theme.muted, align: th === -273.15 ? 'left' : 'center' });
        }
        text(g, th2, A.x + A.w, y2 + 3, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'right' });
      }
      text(g, ch === 'VT' ? ctx.t('axisV') : ctx.t('axisP'), A.x - (sm ? 34 : 40), A.y - 12, { font: `600 ${fs}px ${theme.font}`, color: theme.muted, align: 'left' });
      g.strokeStyle = theme.axis;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(A.x + 0.5, A.y - 4);
      g.lineTo(A.x + 0.5, A.y + A.h + 0.5);
      g.lineTo(A.x + A.w + 4, A.y + A.h + 0.5);
      g.stroke();
    }

    function strokeFn(M: ChartMap, f: (x: number) => number, x0: number, x1: number, color: string, width: number, dash: number[] = [], steps = 80): void {
      const g = surface.g;
      g.strokeStyle = color;
      g.lineWidth = width;
      g.setLineDash(dash);
      g.lineJoin = 'round';
      g.lineCap = 'round';
      g.beginPath();
      let started = false;
      for (let i = 0; i <= steps; i++) {
        const x = x0 + ((x1 - x0) * i) / steps;
        const y = f(x);
        if (!Number.isFinite(y)) continue;
        const px = M.X(x);
        const py = clamp(M.Y(y), M.A.y - 40, M.A.y + M.A.h + 40);
        if (!started) {
          g.moveTo(px, py);
          started = true;
        } else g.lineTo(px, py);
      }
      g.stroke();
      g.setLineDash([]);
    }

    function drawChartContent(R: Rect, ch: Chart, alpha: number, reveal: number): ChartMap {
      const g = surface.g;
      const theme = ctx.theme;
      const M = chartMap(R, ch);
      const { A } = M;
      const sm = R.w < 340 || R.h < 220;
      if (A.w < 50 || A.h < 40) return M;
      g.save();
      g.globalAlpha *= alpha;
      drawAxes(M, sm);
      g.save();
      g.beginPath();
      g.rect(A.x, A.y - 6, (A.w + 8) * reveal, A.h + 6);
      g.clip();
      const s = cur;
      const nn = nD;
      const lf = `700 ${sm ? 10.5 : 11.5}px ${theme.font}`;
      const series = points.length ? points[0]!.mode : mode();
      if (ch === 'pV') {
        // p · V als Rechteck
        const ra = ease2('areaA', p.area ? 1 : 0, 6);
        if (ra > 0.01) {
          g.fillStyle = withAlpha(nCol(), 0.1 * ra);
          g.fillRect(A.x, M.Y(s.p), M.X(s.V) - A.x, A.y + A.h - M.Y(s.p));
          g.strokeStyle = withAlpha(nCol(), 0.45 * ra);
          g.lineWidth = 1;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.moveTo(A.x, M.Y(s.p) + 0.5);
          g.lineTo(M.X(s.V), M.Y(s.p) + 0.5);
          g.lineTo(M.X(s.V) + 0.5, A.y + A.h);
          g.stroke();
          g.setLineDash([]);
          const lab = tr('pvArea', { c: qm(ctx.hidden, n(Math.round(s.p * s.V), 0)) });
          g.font = lf;
          const lw = g.measureText(lab).width;
          const w = M.X(s.V) - A.x;
          const h = A.y + A.h - M.Y(s.p);
          const hintLow = !points.length && pressure(nn, s.T, V_CAP * 0.75) > 0.55 * M.yMax;
          if (w > lw + 12 && h > 22) {
            g.save();
            g.globalAlpha *= ra;
            haloText(lab, A.x + w / 2, hintLow ? M.Y(s.p) + Math.min(h / 2, 16) : A.y + A.h - Math.min(h / 2, 16), lf, nCol());
            g.restore();
          }
        }
        // blasse Isothermenschar
        for (const th of FAMILY) {
          const T = kelvin(th);
          strokeFn(M, (V) => pressure(nn, T, V), 4, V_CAP, withAlpha(tCol(), theme.dark ? 0.22 : 0.18), 1.2);
        }
        // aktuelle Isotherme
        strokeFn(M, (V) => pressure(nn, s.T, V), 3, V_CAP, tCol(), sm ? 2.2 : 2.6);
        const lab = tr('isoLabel', { t: n(Math.round(celsius(s.T)), 0) });
        g.font = lf;
        const lw = g.measureText(lab).width;
        const lx = A.x + A.w - lw - 4;
        const cy0 = M.Y(pressure(nn, s.T, V_CAP * ((lx - A.x + lw / 2) / A.w)));
        let ly = cy0 - 11 < A.y + 34 ? cy0 + 13 : cy0 - 11;
        // nicht auf den Zustandspunkt legen
        if (Math.abs(M.X(s.V) - (lx + lw / 2)) < lw / 2 + 12 && Math.abs(M.Y(s.p) - ly) < 16) ly = M.Y(s.p) + (ly > M.Y(s.p) ? 20 : -20);
        haloText(lab, lx, clamp(ly, A.y + 8, A.y + A.h - 10), lf, tCol(), 'left');
        if (mode() === 'isobar') strokeFn(M, () => s.p, 0, V_CAP, withAlpha(pCol(), 0.8), 1.6, [6, 4], 2);
        if (mode() === 'isochor') {
          g.strokeStyle = withAlpha(vCol(), 0.8);
          g.lineWidth = 1.6;
          g.setLineDash([6, 4]);
          g.beginPath();
          g.moveTo(M.X(s.V), A.y);
          g.lineTo(M.X(s.V), A.y + A.h);
          g.stroke();
          g.setLineDash([]);
        }
        // Hyperbel durch die Messwerte
        const iso = points.filter((q) => q.mode === 'isotherm');
        const c = series === 'isotherm' && iso.length >= 3 ? fitHyperbola(iso) : null;
        if (c) strokeFn(M, (V) => c / V, 3, V_CAP, fitCol(), 1.8, [7, 5]);
      } else if (ch === 'pinv') {
        const c = nn * GAS_R * s.T;
        strokeFn(M, (u) => c * u, 0, 1 / V_MAX, withAlpha(tCol(), 0.8), sm ? 2 : 2.4, [5, 4], 2);
        strokeFn(M, (u) => c * u, 1 / V_MAX, INV_AXIS, tCol(), sm ? 2.2 : 2.6, [], 2);
        const iso = points.filter((q) => q.mode === 'isotherm');
        const cf = series === 'isotherm' && iso.length >= 2 ? fitOrigin(iso.map((q) => [1 / q.V, q.p] as const)) : null;
        if (cf) {
          strokeFn(M, (u) => cf * u, 0, INV_AXIS, fitCol(), 1.8, [7, 5], 2);
          const lab = tr('slope', { c: qm(ctx.hidden, n(Math.round(cf), 0)) });
          g.font = lf;
          const lw = g.measureText(lab).width;
          const ux = Math.min(INV_AXIS * 0.62, (M.yMax * 0.82) / cf);
          haloText(lab, M.X(ux) - lw - 8, M.Y(cf * ux) - 4, lf, fitCol(), 'left');
        } else {
          const lab = tr('isoLabel', { t: n(Math.round(celsius(s.T)), 0) });
          const ux = Math.min(INV_AXIS * 0.9, (M.yMax * 0.86) / c);
          g.font = lf;
          const lw = g.measureText(lab).width;
          haloText(lab, M.X(ux) - lw - 10, M.Y(c * ux), lf, tCol(), 'left');
        }
      } else {
        // V-T bzw. p-T: Gerade durch den absoluten Nullpunkt
        const isVT = ch === 'VT';
        const k = isVT ? (nn * GAS_R) / s.p : (nn * GAS_R) / s.V;
        const col = isVT ? pCol() : vCol();
        const T0 = kelvin(THETA_MIN);
        const T1 = kelvin(THETA_MAX);
        const ptsMine = points.filter((q) => q.mode === (isVT ? 'isobar' : 'isochor'));
        const fit = series === (isVT ? 'isobar' : 'isochor') && ptsMine.length >= 2 ? fitLine(ptsMine.map((q) => [q.T, isVT ? q.V : q.p] as const)) : null;
        const fitA = ease2(`fitA${ch}`, fit ? 1 : 0, 5);
        const thA = 1 - 0.55 * fitA;
        // Bereich, der nicht gemessen werden kann (unterhalb von −50 °C)
        g.fillStyle = withAlpha(theme.muted, theme.dark ? 0.07 : 0.05);
        g.fillRect(A.x, A.y, M.X(T0) - A.x, A.h);
        strokeFn(M, (T) => k * T, 0, T0, withAlpha(col, 0.75 * thA), sm ? 1.8 : 2, [5, 5], 2);
        strokeFn(M, (T) => k * T, T0, T1, withAlpha(col, thA), sm ? 2.2 : 2.6, [], 2);
        const lab = isVT ? tr('isobarLabel', { p: fx(s.p, 1) }) : tr('isochorLabel', { v: fx(s.V, 1) });
        g.font = lf;
        const lw = g.measureText(lab).width;
        const tx = Math.min(T1, (M.yMax * 0.95) / k) * 0.78;
        g.save();
        g.globalAlpha *= thA;
        haloText(lab, clamp(M.X(tx) + 8, A.x + 4, A.x + A.w - lw - 4), clamp(M.Y(k * tx) + 14, A.y + 8, A.y + A.h - 10), lf, col, 'left');
        g.restore();
        if (fit && fitA > 0.01) {
          const t0 = xIntercept(fit);
          g.save();
          g.globalAlpha *= fitA;
          const xa = Math.max(0, Math.min(t0, T0));
          strokeFn(M, (T) => fit.m * T + fit.b, xa, T0, fitCol(), 1.8, [7, 5], 2);
          strokeFn(M, (T) => fit.m * T + fit.b, T0, T1, fitCol(), 2, [], 2);
          if (t0 > -30 && t0 < 150) {
            const zx = M.X(t0);
            const zy = A.y + A.h;
            g.fillStyle = fitCol();
            g.beginPath();
            g.arc(zx, zy, 5, 0, TAU);
            g.fill();
            g.strokeStyle = theme.bg;
            g.lineWidth = 2;
            g.stroke();
            const zl = tr('fitZero', { t: qm(ctx.hidden, n(Math.round(celsius(t0)), 0)) });
            pill(clamp(zx + 6, A.x + 2, A.x + A.w - pillWidth(zl, sm ? 10.5 : 11) - 2), zy - (sm ? 54 : 60), zl, fitCol(), 'left', sm ? 10.5 : 11);
          }
          g.restore();
        }
        // absoluter Nullpunkt
        const zx = M.X(0);
        const zy = A.y + A.h;
        g.fillStyle = theme.bg;
        g.strokeStyle = theme.text;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(zx, zy, 4.5, 0, TAU);
        g.fill();
        g.stroke();
        const zl = ctx.t(A.w < 260 ? 'zeroS' : 'zero');
        const ly = A.y + A.h * 0.55;
        g.strokeStyle = withAlpha(theme.text, 0.35);
        g.lineWidth = 1;
        g.setLineDash([2, 3]);
        g.beginPath();
        g.moveTo(zx + 0.5, zy - 6);
        g.lineTo(zx + 0.5, ly + 8);
        g.stroke();
        g.setLineDash([]);
        haloText(zl, zx + 6, ly, `700 ${sm ? 10.5 : 11}px ${theme.font}`, theme.text, 'left');
        if (A.w >= 260 && A.h > 120) haloText(ctx.t('zeroVal'), zx + 6, ly + 14, `600 ${sm ? 10 : 10.5}px ${theme.font}`, theme.muted, 'left');
      }
      // Spur des Zustands
      const now = performance.now();
      const tr2 = trail.filter((q) => q.ch === ch);
      if (tr2.length > 1) {
        g.lineCap = 'round';
        for (let i = 1; i < tr2.length; i++) {
          const a = clamp(1 - (now - tr2[i]!.t) / 3000, 0, 1);
          g.strokeStyle = withAlpha(theme.text, 0.35 * a);
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(M.X(tr2[i - 1]!.x), M.Y(tr2[i - 1]!.y));
          g.lineTo(M.X(tr2[i]!.x), M.Y(tr2[i]!.y));
          g.stroke();
        }
      }
      // Messpunkte (gleiten aus der Szene herein)
      for (const q of points) {
        const u = clamp((now - q.born) / 750, 0, 1);
        const tx = M.X(M.xOf(q));
        const ty = M.Y(M.yOf(q));
        if (u < 1) continue;
        const pop = clamp((now - q.born - 750) / 350, 0, 1);
        if (pop < 1) {
          g.strokeStyle = withAlpha(fitCol(), 0.6 * (1 - pop));
          g.lineWidth = 2;
          g.beginPath();
          g.arc(tx, ty, 5 + 12 * pop, 0, TAU);
          g.stroke();
          animating = true;
        }
        g.fillStyle = fitCol();
        g.beginPath();
        g.arc(tx, ty, 5, 0, TAU);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.8;
        g.stroke();
      }
      g.restore();
      // aktueller Zustand
      const sx = M.X(M.xOf(s));
      const sy = M.Y(M.yOf(s));
      if (sx >= A.x - 2 && sx <= A.x + A.w + 2 && sy >= A.y - 2 && sy <= A.y + A.h + 2 && reveal > 0.98) {
        const pl = pulse.running ? 1 - pulse.value : 0;
        const breathe = prefersReducedMotion() || !ctx.clock.playing ? 0 : 0.5 + 0.5 * Math.sin(now / 320);
        g.fillStyle = withAlpha(theme.text, 0.12 + 0.08 * breathe + 0.3 * pl);
        g.beginPath();
        g.arc(sx, sy, 10 + 3 * breathe + 6 * pl, 0, TAU);
        g.fill();
        g.fillStyle = theme.bg;
        g.beginPath();
        g.arc(sx, sy, 6, 0, TAU);
        g.fill();
        g.strokeStyle = theme.text;
        g.lineWidth = 2.6;
        g.stroke();
        if (breathe > 0 || pl > 0) animating = true;
      }
      if (!points.length) {
        const fs = sm ? 10.5 : 11.5;
        g.font = `600 ${fs}px ${theme.font}`;
        const long = ctx.t('emptyPts');
        const msg = g.measureText(long).width + 22 < A.w * 0.8 ? long : ctx.t('emptyPtsS');
        const w = Math.min(A.w - 8, g.measureText(msg).width + 22);
        // Platz suchen, an dem keine Kurve verläuft
        const highRight = ch === 'pV' && pressure(nD, cur.T, V_CAP * 0.75) > 0.55 * M.yMax;
        const ex = ch === 'pV' || ch === 'pinv' ? A.x + A.w - w - 4 : A.x + 4;
        const y = ch === 'pinv' || highRight ? A.y + A.h - fs - 18 : A.y + 4;
        // sichtbarer Hintergrund mit Rand, damit der Hinweis nicht auf den Gitterlinien liegt
        g.save();
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.12)';
        g.shadowBlur = 5;
        g.shadowOffsetY = 1;
        g.fillStyle = theme.dark ? 'rgba(30,38,50,0.96)' : 'rgba(246,248,251,0.97)';
        roundRect(g, ex, y, w, fs + 12, (fs + 12) / 2);
        g.fill();
        g.restore();
        g.strokeStyle = withAlpha(theme.muted, 0.4);
        g.lineWidth = 1;
        roundRect(g, ex + 0.5, y + 0.5, w - 1, fs + 11, (fs + 11) / 2);
        g.stroke();
        text(g, msg, ex + w / 2, y + (fs + 12) / 2 + 0.5, { font: g.font, color: theme.muted });
      }
      g.restore();
      return M;
    }

    function drawChart(R: Rect, ik: number): void {
      const g = surface.g;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      drawTabs(R, 1);
      const reveal = stage(0.35, 0.8, ease.inOutCubic);
      if (chSwap.running) {
        const u = chSwap.t;
        if (u < 0.45) drawChartContent(R, fromCh, 1 - u / 0.45, 1);
        else lastChartMap = drawChartContent(R, shownCh, (u - 0.45) / 0.55, 1);
      } else lastChartMap = drawChartContent(R, shownCh, 1, reveal);
      g.restore();
    }

    /** Messpunkte, die gerade aus der Szene ins Diagramm gleiten. */
    function drawFlyers(): void {
      const M = lastChartMap;
      if (!M) return;
      const g = surface.g;
      const now = performance.now();
      for (const q of points) {
        const u = (now - q.born) / 750;
        if (u >= 1 || u < 0) continue;
        animating = true;
        const e = ease.inOutCubic(u);
        const [x0, y0] = q.from;
        const x1 = M.X(M.xOf(q));
        const y1 = M.Y(M.yOf(q));
        const cxp = (x0 + x1) / 2;
        const cyp = Math.min(y0, y1) - 60;
        const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cxp + e * e * x1;
        const y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cyp + e * e * y1;
        g.save();
        g.shadowColor = withAlpha(fitCol(), 0.7);
        g.shadowBlur = 12;
        g.fillStyle = fitCol();
        g.beginPath();
        g.arc(x, y, 6 - u, 0, TAU);
        g.fill();
        g.restore();
      }
    }

    /* ---------- Gasgleichung als Karte ---------- */
    function drawEquation(R: Rect, ik: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= ik;
      g.translate((1 - ik) * 18, 0);
      card(R);
      const sm = R.w < 340 || R.h < 150;
      const padX = sm ? 12 : 16;
      const m = mode();
      const s = cur;
      const title = ctx.t(R.w < 300 ? 'gasTitleS' : 'gasTitle');
      const ty = R.y + (sm ? 17 : 20);
      text(g, title, R.x + padX, ty, { font: `700 ${sm ? 12 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      const law = ctx.t(m === 'isotherm' ? 'lawT' : m === 'isobar' ? 'lawP' : 'lawV');
      const lawSize = sm ? 10.5 : 11.5;
      g.font = `700 ${sm ? 12 : 13}px ${theme.font}`;
      if (R.w - 2 * padX - g.measureText(title).width > pillWidth(law, lawSize) + 8) pill(R.x + R.w - padX, ty - (lawSize + 11) / 2, law, fixedCol(m), 'right', lawSize);
      const P = pCol();
      const V = vCol();
      const T = tCol();
      const N = nCol();
      const mu = theme.muted;
      const tx = theme.text;
      const big: Seg[] = [
        { t: 'p', c: P, f: 'v' },
        { t: ' · ', c: tx },
        { t: 'V', c: V, f: 'v' },
        { t: '  =  ', c: tx },
        { t: 'n', c: N, f: 'v' },
        { t: ' · ', c: tx },
        { t: 'R', c: mu, f: 'v' },
        { t: ' · ', c: tx },
        { t: 'T', c: T, f: 'v' },
      ];
      const pv = s.p * s.V;
      const l1: Seg[] = [
        { t: 'p', c: P, f: 'v' },
        { t: ' · ', c: tx },
        { t: 'V', c: V, f: 'v' },
        { t: ' = ', c: tx, br: true },
        { t: `${qm(hideP(), fx(s.p, 1))} kPa`, c: P, f: 'b' },
        { t: ' · ', c: tx },
        { t: `${qm(hideV(), fx(s.V, 1))} L`, c: V, f: 'b' },
        { t: ' ≈ ', c: tx, br: true },
        { t: `${qm(ctx.hidden, n(Math.round(pv), 0))} J`, c: tx, f: 'b' },
      ];
      const l2: Seg[] = [
        { t: 'n', c: N, f: 'v' },
        { t: ' · ', c: tx },
        { t: 'R', c: mu, f: 'v' },
        { t: ' · ', c: tx },
        { t: 'T', c: T, f: 'v' },
        { t: ' = ', c: tx, br: true },
        { t: `${fx(nD, 2)} mol`, c: N, f: 'b' },
        { t: ' · ', c: tx },
        { t: ctx.lang === 'de' ? '8,314 J/(mol·K)' : '8.314 J/(mol·K)', c: mu, f: 'n', br: true },
        { t: ' · ', c: tx },
        { t: `${fx(s.T, 2)} K`, c: T, f: 'b' },
        { t: ' ≈ ', c: tx, br: true },
        { t: `${qm(ctx.hidden, n(Math.round(nD * GAS_R * s.T), 0))} J`, c: tx, f: 'b' },
      ];
      let l3: Seg[];
      if (m === 'isobar' && s.stop !== 0) l3 = [{ t: ctx.t(s.stop > 0 ? 'stopHi' : 'stopLo'), c: fitCol(), f: 'b' }];
      else if (m === 'isotherm')
        l3 = [
          { t: 'T', c: T, f: 'v' },
          { t: ` ${ctx.t('fixed')}  ⇒  `, c: mu },
          { t: 'p', c: P, f: 'v', br: true },
          { t: ' · ', c: tx },
          { t: 'V', c: V, f: 'v' },
          { t: ` = ${ctx.t('konst')}`, c: tx, f: 'b' },
        ];
      else {
        const isBar = m === 'isobar';
        const val = isBar ? s.V / s.T : s.p / s.T;
        l3 = [
          { t: isBar ? 'p' : 'V', c: isBar ? P : V, f: 'v' },
          { t: ` ${ctx.t('fixed')}  ⇒  `, c: mu },
          { t: isBar ? 'V' : 'p', c: isBar ? V : P, f: 'v', br: true },
          { t: ' / ', c: tx },
          { t: 'T', c: T, f: 'v' },
          { t: ` ≈ ${qm(ctx.hidden, fx(val, isBar ? 4 : 3))} ${isBar ? 'L/K' : 'kPa/K'}`, c: tx, f: 'b' },
          { t: ` = ${ctx.t('konst')}`, c: mu, br: true },
        ];
      }
      const availW = R.w - 2 * padX;
      const top = ty + (sm ? 14 : 18);
      const availH = R.y + R.h - top - (sm ? 8 : 12);
      let size = sm ? 12.5 : 13.5;
      let bigSize = sm ? 18 : 22;
      let showBig = true;
      let lines: Seg[][] = [];
      for (let tries = 0; tries < 12; tries++) {
        lines = [l1, l2, l3].flatMap((l) => wrapSegs(l, size, availW));
        const lh = size * 1.75;
        const need = (showBig ? bigSize * 1.6 + 4 : 0) + lines.length * lh;
        if (need <= availH) break;
        if (size > 11.5) size -= 0.5;
        else if (bigSize > 15) bigSize -= 1.5;
        else if (showBig) showBig = false;
        else break;
      }
      const lh = size * 1.75;
      const total = (showBig ? bigSize * 1.6 + 4 : 0) + lines.length * lh;
      let y = top + Math.max(0, (availH - total) / 2);
      if (showBig) {
        const bw = segsWidth(big, bigSize);
        const bx = R.x + R.w / 2 - bw / 2;
        drawSegs(big, bx, y + bigSize * 0.8, bigSize);
        // feste Größe markieren
        const idx = m === 'isotherm' ? 8 : m === 'isobar' ? 0 : 2;
        const before = segsWidth(big.slice(0, idx), bigSize);
        const wv = segsWidth([big[idx]!], bigSize);
        g.strokeStyle = fixedCol(m);
        g.lineWidth = 2.2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(bx + before - 1, y + bigSize * 1.38);
        g.lineTo(bx + before + wv + 1, y + bigSize * 1.38);
        g.stroke();
        y += bigSize * 1.6 + 4;
      }
      for (const [i, line] of lines.entries()) {
        const first = i === 0 || line[0]!.br !== true;
        drawSegs(line, R.x + padX + (first ? 0 : 14), y + lh / 2, size);
        y += lh;
      }
      g.restore();
    }

    /* ---------- Ergebnisse ---------- */
    let lastNow = '';
    function updateNow(): void {
      const s = cur;
      const th = celsius(s.T);
      const key = [
        tr('now', { p: fx(s.p, 1), V: fx(s.V, 1), th: n(Math.round(th * 10) / 10, 1), T: fx(s.T, 2), n: fx(nD, 2) }),
        mode() === 'isotherm'
          ? tr('lawIso', { p: fx(s.p, 1), V: fx(s.V, 1), c: n(Math.round(s.p * s.V), 0) })
          : mode() === 'isobar'
            ? tr('lawBar', { V: fx(s.V, 1), T: fx(s.T, 2), c: fx(s.V / s.T, 4) }) + (s.stop !== 0 ? ctx.t('lawStop') : '')
            : tr('lawCho', { p: fx(s.p, 1), T: fx(s.T, 2), c: fx(s.p / s.T, 3) }),
        tr('gas', { n: fx(nD, 2), T: fx(s.T, 2), c: n(Math.round(nD * GAS_R * s.T), 0), p: fx(s.p, 1), V: fx(s.V, 1), N: fx((nD * AVOGADRO) / 1e23, 2) }),
        !ctx.clock.playing ? ctx.t('kinWait') : !kinValid ? ctx.t('kinMeas') : tr('kin', { pc: n(Math.round(s.p * kinRatio), 0), p: fx(s.p, 1), th: n(Math.round(th), 0), v: n(Math.round(meanSpeed(s.T, M_N2) / 10) * 10, 0) }),
      ];
      const joined = key.join('|');
      if (joined === lastNow) return;
      lastNow = joined;
      ctx.readout('now', { html: key[0]! });
      ctx.readout('law', { html: key[1]! });
      ctx.readout('gas', { html: key[2]! });
      ctx.readout('kin', { html: key[3]! });
    }

    function updateTable(): void {
      const m = points.length ? points[0]!.mode : mode();
      if (!points.length) {
        ctx.readout('table', ctx.t('none'));
        ctx.readout('fit', ctx.t('fitFew'));
      } else {
        let head: string[];
        let rows: string[];
        if (m === 'isotherm') {
          head = [ctx.t('thV'), ctx.t('thP'), ctx.t('thPV')];
          rows = points.map((q) => `<tr><td>${fx(q.V, 1)}</td><td>${fx(q.p, 1)}</td><td>${n(Math.round(q.p * q.V), 0)}</td></tr>`);
        } else if (m === 'isobar') {
          head = [ctx.t('thTh'), ctx.t('thT'), ctx.t('thV'), ctx.t('thVT')];
          rows = points.map((q) => `<tr><td>${n(Math.round(celsius(q.T)), 0)}</td><td>${fx(q.T, 2)}</td><td>${fx(q.V, 2)}</td><td>${fx(q.V / q.T, 4)}</td></tr>`);
        } else {
          head = [ctx.t('thTh'), ctx.t('thT'), ctx.t('thP'), ctx.t('thPT')];
          rows = points.map((q) => `<tr><td>${n(Math.round(celsius(q.T)), 0)}</td><td>${fx(q.T, 2)}</td><td>${fx(q.p, 1)}</td><td>${fx(q.p / q.T, 3)}</td></tr>`);
        }
        ctx.readout('table', { html: `<table class="mini-table"><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr>${rows.join('')}</table>` });
        if (points.length < 2) ctx.readout('fit', ctx.t('fitFew'));
        else if (m === 'isotherm') {
          const c = points.reduce((a, q) => a + q.p * q.V, 0) / points.length;
          ctx.readout('fit', { html: tr('fitIso', { c: n(Math.round(c), 0), e: n(Math.round(points[0]!.T * GAS_R * p.n), 0) }) });
        } else {
          const isBar = m === 'isobar';
          const fit = fitLine(points.map((q) => [celsius(q.T), isBar ? q.V : q.p] as const));
          if (!fit) ctx.readout('fit', ctx.t('fitFew'));
          else {
            const t0 = xIntercept(fit);
            const unit = isBar ? 'L/°C' : 'kPa/°C';
            ctx.readout('fit', {
              html: tr('fitLin', {
                y: isBar ? 'V' : 'p',
                m: `${fx(fit.m, isBar ? 4 : 3)} ${unit}`,
                b: `${fx(fit.b, isBar ? 2 : 1)} ${isBar ? 'L' : 'kPa'}`,
                t: n(Math.round(t0), 0),
              }),
            });
          }
        }
      }
      ctx.setAction('clear', { enabled: points.length > 0 && !ctx.locked });
    }

    /* ---------- Zeiger: Griff, Thermometer, Diagramm-Reiter ---------- */
    let tabHover: Chart | null = null;
    let grabOffset = 0;
    function hitTab(px: number, py: number): Chart | null {
      for (const t of tabRects) if (px >= t.r.x && px <= t.r.x + t.r.w && py >= t.r.y - 3 && py <= t.r.y + t.r.h + 3) return t.ch;
      return null;
    }
    function hitGrip(px: number, py: number): boolean {
      const G = lastGeo;
      if (!G || mode() !== 'isotherm' || ctx.locked) return false;
      const yb = vToY(G, cur.V);
      if (lastGrip && px >= lastGrip.x && px <= lastGrip.x + lastGrip.w && py >= lastGrip.y && py <= lastGrip.y + lastGrip.h) return true;
      return px >= G.ix && px <= G.ix + G.iw && Math.abs(py - (yb - 6)) < 14;
    }
    function hitThermo(px: number, py: number): boolean {
      const G = lastGeo;
      if (!G || ctx.locked) return false;
      return Math.abs(px - G.tx) < 22 && py > G.tTop - 6 && py < G.tBulb + 16;
    }
    function thermoTo(py: number): void {
      const G = lastGeo;
      if (!G) return;
      const th = Math.round(clamp(yToTheta(G, py), THETA_MIN, THETA_MAX));
      if (th === p.T) return;
      autoRun = false;
      if (mode() === 'isotherm' && points.length) {
        clearPoints();
        updateTable();
      }
      ctx.set({ T: th });
    }
    function gripTo(py: number): void {
      const G = lastGeo;
      if (!G) return;
      const V = Math.round(clamp(yToV(G, py - grabOffset), V_MIN, V_MAX) * 10) / 10;
      if (V === p.V) return;
      autoRun = false;
      ctx.set({ V });
    }

    surface.addTarget({
      contains: (px: number, py: number) => hitTab(px, py) !== null || hitGrip(px, py) || hitThermo(px, py),
      pointerDown: (q: { px: number; py: number }) => {
        const t = hitTab(q.px, q.py);
        if (t) {
          if (t !== chart()) ctx.set({ ch: t });
          return true;
        }
        if (hitGrip(q.px, q.py)) {
          const G = lastGeo!;
          dragV = true;
          grabOffset = q.py - vToY(G, cur.V);
          surface.setCursor('grabbing');
          return true;
        }
        if (hitThermo(q.px, q.py)) {
          dragT = true;
          surface.setCursor('grabbing');
          thermoTo(q.py);
          return true;
        }
        return false;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (dragV) gripTo(q.py);
        else if (dragT) thermoTo(q.py);
      },
      pointerUp: () => {
        dragV = false;
        dragT = false;
        surface.setCursor('');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const t = q ? hitTab(q.px, q.py) : null;
        const gr = q && !t ? hitGrip(q.px, q.py) : false;
        const th = q && !t && !gr ? hitThermo(q.px, q.py) : false;
        if (t !== tabHover || gr !== gripHover || th !== thermoHover) {
          tabHover = t;
          gripHover = gr;
          thermoHover = th;
          ctx.requestRender();
        }
        surface.setCursor(t ? 'pointer' : gr || th ? 'grab' : '');
      },
      wheel: () => false,
    });

    /* ---------- Ablauf ---------- */
    const offClock = ctx.clock.onChange(() => {
      lastNow = '';
      ctx.requestRender();
    });

    function pushTrail(): void {
      const now = performance.now();
      const ch = shownCh;
      const M = { xOf: (s: GasState) => (ch === 'pV' ? s.V : ch === 'pinv' ? 1 / s.V : s.T), yOf: (s: GasState) => (ch === 'VT' ? s.V : s.p) };
      const x = M.xOf(cur);
      const y = M.yOf(cur);
      const last = trail[trail.length - 1];
      if (!last || last.ch !== ch || Math.abs(last.x - x) > 1e-4 * (ch === 'pinv' ? 0.01 : 1) || Math.abs(last.y - y) > 1e-3) {
        if (last && last.ch !== ch) trail = [];
        trail.push({ x, y, ch, t: now });
      }
      trail = trail.filter((q) => now - q.t < 3000).slice(-160);
      if (trail.length > 1) animating = true;
    }

    return {
      update(changed, source) {
        const m = mode();
        if (source === 'init') {
          snapState();
          shownCh = chart();
          intro.play();
          if (!prefersReducedMotion()) queueMicrotask(() => ctx.clock.play());
        }
        if (source === 'input' && changed.has('mode')) {
          // Übergang ohne Sprung: der neue Versuch beginnt im aktuellen Zustand
          const V = Math.round(clamp(cur.V, V_MIN, V_MAX) * 10) / 10;
          const pp = Math.round(clamp(cur.p, P_MIN, P_MAX) * 10) / 10;
          ctx.set({ V, p: pp, ch: natural(m) });
        }
        if (source !== 'sim') autoRun = false;
        const fixedKey = m === 'isotherm' ? 'T' : m === 'isobar' ? 'p' : 'V';
        if (source === 'init' || source === 'replace' || (source === 'input' && (changed.has('mode') || changed.has('n') || changed.has(fixedKey)))) clearPoints();
        if (source === 'replace' && !prefersReducedMotion() && !ctx.clock.playing) ctx.clock.play();
        lastNow = '';
        updateNow();
        updateTable();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'rec') {
          autoRun = false;
          record();
        } else if (id === 'auto') startAuto();
        else if (id === 'clear') {
          autoRun = false;
          clearPoints();
          updateTable();
        }
        ctx.requestRender();
      },

      tick(dt) {
        tickParticles(dt);
      },

      resetTime() {
        if (box) {
          box.resetMeasurement();
          kinWin = [];
          kinValid = false;
        }
      },

      render() {
        const now = performance.now();
        frameDt = Math.min(0.1, (now - lastFrame) / 1000);
        lastFrame = now;
        animating = false;
        advance(frameDt);
        autoStep(now);
        if (chart() !== shownCh) {
          fromCh = shownCh;
          shownCh = chart();
          trail = [];
          chSwap.play();
        }
        pushTrail();
        const lay = computeLayout();
        surface.begin();
        drawScene(lay.scene);
        drawChart(lay.a, stage(0.2, 0.5));
        drawEquation(lay.b, stage(0.32, 0.5));
        drawFlyers();
        updateNow();
        if (animating || autoRun || intro.running || chSwap.running || pulse.running || dragV || dragT) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
