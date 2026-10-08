import { defineSimulation, ease, Plot, roundRect, seededRandom, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  commonTangents,
  EARTH,
  illuminatedFraction,
  intersect,
  litFraction,
  localTime,
  lunarEclipse,
  mixLight,
  moonPhase,
  moonPosition,
  observerPosition,
  pointShadowSize,
  rayY,
  shadowOnScreen,
  solarView,
  solarZones,
  SPACE,
  SUN,
  sunlightAt,
  type Disc,
  type P2,
  type RGB,
  type Vec3,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'lab' | 'space';
type Src = 'point' | 'wide' | 'two';
type Lang = 'de' | 'en';

/** Oberkante der optischen Bank (cm unter der optischen Achse). */
const BENCH_TOP = -38;
/** Halbe Höhe (und halbe Breite) des Schirms in cm. */
const SCREEN_H = 30;
/** Dicke des Schirms in cm. */
const SCREEN_T = 1.6;
/** Mindestabstand zwischen Lampe, Gegenstand und Schirm in cm. */
const MIN_GAP = 3;
/** Zellgröße (in Pixeln) für das Bild des Lichtbündels. */
const FIELD_CELL = 2;

/** Lichtfarben (linear, 0 … 1). */
const WHITE: RGB = [1, 0.95, 0.84];
const RED: RGB = [1, 0.16, 0.12];
const GREEN: RGB = [0.12, 1, 0.22];
/** Papier des Schirms: unbeleuchtet (im abgedunkelten Raum) und voll beleuchtet. */
const PAPER_DARK: RGB = [27, 31, 40];
const PAPER_LIT: RGB = [250, 246, 236];

const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Ortszeit als Uhrzeit, z. B. „13:20 Uhr“. */
function clockText(ob: number, lang: Lang): string {
  const t = localTime(ob);
  let h = Math.floor(t);
  let m = Math.round((t - h) * 60);
  if (m === 60) {
    h += 1;
    m = 0;
  }
  return `${h}:${String(m).padStart(2, '0')}${lang === 'de' ? ' Uhr' : ''}`;
}

/** Farbe des Schirmpapiers bei gegebenem Licht (je Farbkanal 0 … 1). */
function paperColor(light: readonly number[]): [number, number, number] {
  return [0, 1, 2].map((c) => Math.round(PAPER_DARK[c]! + (PAPER_LIT[c]! - PAPER_DARK[c]!) * Math.min(1, light[c] ?? 0))) as [number, number, number];
}

const css = (c: readonly number[], a = 1) => `rgba(${Math.round(c[0]!)},${Math.round(c[1]!)},${Math.round(c[2]!)},${a})`;
const lampCss = (c: RGB, a = 1) => css([255 * c[0], 255 * c[1], 255 * c[2]], a);

/* ---------- Oberflächen von Erde und Mond (Ersatzgrafik ohne Foto) ---------- */

const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Die Lampen strahlen (wie Experimentierleuchten) nach vorn in einen weiten Kegel. */
const beam = (dx: number, dy: number, dz = 0) => smooth(0.26, 0.77, dx / (Math.hypot(dx, dy, dz) || 1));

/** Erde von oben (Nordpol in der Mitte): Polkappe, Ozeane, Kontinente, Wolken. */
function earthAlbedo(u: number, v: number): [number, number, number] {
  const rho = Math.hypot(u, v);
  const a = Math.atan2(v, u);
  const capEdge = 0.27 + 0.04 * Math.sin(5 * a) + 0.025 * Math.sin(11 * a + 1);
  let col: [number, number, number] = [0.08 + 0.05 * rho, 0.3 + 0.08 * rho, 0.6 + 0.06 * rho];
  const land = 0.55 * Math.sin(3 * a + 0.5 + rho * 1.5) + 0.3 * Math.sin(7 * a + 2.1) + 0.35 * Math.sin(2 * a - 1.3 + rho * 6) + 0.2 * Math.cos(rho * 11 + a * 4);
  if (land > 0.42 && rho > capEdge + 0.04) {
    const dry = 0.5 + 0.5 * Math.sin(5 * a + rho * 9);
    col = [0.3 + 0.22 * dry, 0.46 + 0.04 * dry, 0.22 + 0.06 * dry];
  }
  const ice = 1 - smooth(capEdge - 0.03, capEdge + 0.03, rho);
  const cloud = smooth(0.5, 0.85, Math.sin(13 * a + rho * 21) * Math.sin(4 * a - rho * 11) + 0.25 * Math.sin(29 * a + rho * 5));
  const w = Math.max(ice, cloud * 0.75);
  return [col[0] + (0.95 - col[0]) * w, col[1] + (0.96 - col[1]) * w, col[2] + (0.98 - col[2]) * w];
}

/** Meere (Maria) der Mondvorderseite: Mitte, Halbachsen, Dunkelheit. */
const MARIA: [number, number, number, number, number][] = [
  [-0.32, 0.42, 0.27, 0.22, 0.42],
  [0.16, 0.42, 0.16, 0.14, 0.4],
  [0.32, 0.12, 0.2, 0.15, 0.4],
  [0.67, 0.3, 0.1, 0.09, 0.42],
  [-0.62, 0.02, 0.24, 0.42, 0.36],
  [-0.18, -0.38, 0.2, 0.14, 0.32],
  [0.52, -0.16, 0.12, 0.17, 0.34],
  [0.12, 0.05, 0.12, 0.1, 0.3],
];

function moonAlbedo(u: number, v: number): [number, number, number] {
  let a = 0.74 + 0.05 * Math.sin(u * 23 + v * 17) * Math.sin(v * 19 - u * 7);
  for (const [cx, cy, rx, ry, k] of MARIA) {
    const d = Math.hypot((u - cx) / rx, (v - cy) / ry);
    a -= k * (1 - smooth(0.55, 1.15, d)) * 0.62;
  }
  // heller Krater Tycho mit Strahlen
  const dt = Math.hypot(u + 0.12, v + 0.68);
  a += 0.2 * (1 - smooth(0.02, 0.07, dt)) + 0.05 * (1 - smooth(0.1, 0.5, dt)) * Math.max(0, Math.sin(Math.atan2(v + 0.68, u + 0.12) * 9));
  return [a * 0.98, a * 0.97, a * 0.94];
}

/**
 * Licht und Schatten: Auf einer optischen Bank wirft eine runde Scheibe den
 * Schatten einer punktförmigen oder ausgedehnten Lampe (oder zweier, auch
 * farbiger Lampen) auf einen Schirm – mit Randstrahlen, Kern- und
 * Halbschatten und dem Schirmbild von vorn. Zweiter Teil: Sonnen- und
 * Mondfinsternis als schematisches Modell mit Schattenkegeln.
 */
export default defineSimulation({
  id: 'licht-schatten',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.7, aspectNarrow: 0.68 },
  groups: [
    { id: 'lamp', label: L('Lampe', 'Lamp') },
    { id: 'obj', label: L('Gegenstand (runde Scheibe)', 'Object (round disc)') },
    { id: 'screen', label: L('Schirm', 'Screen') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Setup'),
      options: [
        { value: 'lab', label: L('Schatten auf der optischen Bank', 'Shadows on the optical bench') },
        { value: 'space', label: L('Sonnen- und Mondfinsternis', 'Solar and lunar eclipses') },
      ],
      default: 'lab',
    },
    {
      key: 'src',
      type: 'choice',
      label: L('Lichtquelle', 'Light source'),
      options: [
        { value: 'point', label: L('punktförmig', 'point-like') },
        { value: 'wide', label: L('ausgedehnt', 'extended') },
        { value: 'two', label: L('zwei Lampen', 'two lamps') },
      ],
      default: 'point',
      visibleIf: (v) => v.mode === 'lab',
    },
    {
      key: 'ld',
      type: 'number',
      group: 'lamp',
      label: L('Durchmesser der leuchtenden Kugel d', 'Diameter of the glowing bulb d'),
      min: 2,
      max: 16,
      step: 1,
      default: 8,
      unit: 'cm',
      visibleIf: (v) => v.mode === 'lab' && v.src === 'wide',
    },
    {
      key: 'col',
      type: 'boolean',
      group: 'lamp',
      label: L('Farbige Lampen (rot und grün)', 'Coloured lamps (red and green)'),
      default: false,
      visibleIf: (v) => v.mode === 'lab' && v.src === 'two',
    },
    { key: 'lx', type: 'number', group: 'lamp', label: L('Stelle auf der Bank', 'Position on the bench'), min: 0, max: 50, step: 1, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'lab' },
    { key: 'ly', type: 'number', group: 'lamp', label: L('Höhe über der Achse', 'Height above the axis'), min: -15, max: 15, step: 1, default: 0, unit: 'cm', visibleIf: (v) => v.mode === 'lab' },
    { key: 'mx', type: 'number', group: 'lamp', label: L('Lampe 2: Stelle auf der Bank', 'Lamp 2: position on the bench'), min: 0, max: 50, step: 1, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'lab' && v.src === 'two' },
    { key: 'my', type: 'number', group: 'lamp', label: L('Lampe 2: Höhe über der Achse', 'Lamp 2: height above the axis'), min: -15, max: 15, step: 1, default: 8, unit: 'cm', visibleIf: (v) => v.mode === 'lab' && v.src === 'two' },
    { key: 'ox', type: 'number', group: 'obj', label: L('Stelle auf der Bank', 'Position on the bench'), min: 5, max: 95, step: 1, default: 40, unit: 'cm', visibleIf: (v) => v.mode === 'lab' },
    { key: 'oy', type: 'number', group: 'obj', label: L('Höhe über der Achse', 'Height above the axis'), min: -15, max: 15, step: 1, default: 0, unit: 'cm', visibleIf: (v) => v.mode === 'lab' },
    { key: 'od', type: 'number', group: 'obj', label: L('Durchmesser G', 'Diameter G'), min: 2, max: 20, step: 1, default: 10, unit: 'cm', visibleIf: (v) => v.mode === 'lab' },
    { key: 'sx', type: 'number', group: 'screen', label: L('Stelle auf der Bank', 'Position on the bench'), min: 15, max: 100, step: 1, default: 100, unit: 'cm', visibleIf: (v) => v.mode === 'lab' },
    {
      key: 'pos',
      type: 'number',
      label: L('Stellung des Mondes (Winkel seit Neumond)', 'Position of the Moon (angle since new moon)'),
      help: L('0° Neumond, 90° erstes Viertel, 180° Vollmond, 270° letztes Viertel. Oder den Mond auf seiner Bahn ziehen.', '0° new moon, 90° first quarter, 180° full moon, 270° last quarter. Or drag the Moon along its orbit.'),
      min: 0,
      max: 359,
      step: 1,
      default: 0,
      unit: '°',
      visibleIf: (v) => v.mode === 'space',
    },
    {
      key: 'ob',
      type: 'number',
      label: L('Ort des Beobachters auf der Erde (Ortszeit)', 'Observer on Earth (local time)'),
      help: L('Den Beobachter auf der Tagseite der Erde verschieben – Mittag ist dort, wo die Sonne senkrecht steht.', 'Move the observer across the day side of the Earth – noon is where the Sun is overhead.'),
      min: -85,
      max: 85,
      step: 1,
      default: 0,
      display: (v, lang) => clockText(v, lang),
      visibleIf: (v) => v.mode === 'space',
    },
    { key: 'rays', type: 'boolean', group: 'view', label: L('Randstrahlen', 'Edge rays'), default: true },
    { key: 'names', type: 'boolean', group: 'view', label: L('Kern- und Halbschatten beschriften', 'Label umbra and penumbra'), default: true },
    { key: 'slow', type: 'boolean', group: 'view', label: L('Zeitlupe (beim Abspielen)', 'Slow motion (when playing)'), default: false },
  ],
  images: { sun: 'sonne.webp', earth: 'erde.webp', moon: 'mond.webp' },
  readouts: [
    { key: 'dist', label: L('Abstände', 'Distances') },
    { key: 'size', label: L('Schatten auf dem Schirm', 'Shadow on the screen'), spoiler: true },
    { key: 'law', label: L('Schattengröße berechnen', 'Calculating the shadow size'), spoiler: true },
    { key: 'kind', label: L('Beobachtung', 'Observation') },
    { key: 'phase', label: L('Stellung des Mondes', 'Position of the Moon') },
    { key: 'ecl', label: L('Finsternis', 'Eclipse') },
    { key: 'cover', label: L('Blick des Beobachters', 'Observer’s view') },
  ],
  presets: [
    { id: 'point', label: L('Punktförmige Lampe', 'Point-like lamp'), values: {} },
    { id: 'wide', label: L('Ausgedehnte Lampe', 'Extended lamp'), values: { src: 'wide' } },
    { id: 'two', label: L('Zwei Lampen', 'Two lamps'), values: { src: 'two', ly: -5, my: 5 } },
    { id: 'colour', label: L('Farbige Schatten', 'Coloured shadows'), values: { src: 'two', col: true, ly: -5, my: 5 } },
    { id: 'solar', label: L('Sonnenfinsternis', 'Solar eclipse'), values: { mode: 'space' } },
    { id: 'lunar', label: L('Mondfinsternis', 'Lunar eclipse'), values: { mode: 'space', pos: 180 } },
  ],
  strings: {
    de: {
      canvas: 'Optische Bank mit Lampe, runder Scheibe und Schirm: Lichtbündel, Randstrahlen, Kern- und Halbschatten und der Schirm von vorn; oder Sonne, Erde und Mond mit ihren Schattenkegeln bei Sonnen- und Mondfinsternis',
      lamp: 'Lampe',
      lamp1: 'Lampe 1',
      lamp2: 'Lampe 2',
      lamps: 'Lampen',
      obj: 'Gegenstand',
      screen: 'Schirm',
      umbra: 'Kernschatten',
      penumbra: 'Halbschatten',
      front: 'Schirm von vorn',
      scale: 'Skala in cm',
      legend: 'Was du siehst',
      lit: 'voll beleuchtet',
      half: 'Halbschatten: ein Teil des Lichts fehlt',
      core: 'Kernschatten: kein Licht',
      yellow: 'Rot + Grün = Gelb',
      onlyGreen: 'Schatten der roten Lampe: nur Grün',
      onlyRed: 'Schatten der grünen Lampe: nur Rot',
      ruleP: 'Punktförmige Lichtquelle: scharfer Schatten ohne Halbschatten.',
      ruleW: 'Ausgedehnte Lichtquelle: Kernschatten mit unscharfem Rand aus Halbschatten.',
      ruleT: 'Zwei Lampen: Wo sich die Schatten überlappen, entsteht Kernschatten.',
      ruleC: 'Im Schatten einer Lampe leuchtet nur noch die andere Farbe.',
      sun: 'Sonne',
      earth: 'Erde',
      moon: 'Mond',
      orbit: 'Mondbahn',
      sunlight: 'Sonnenlicht',
      notToScale: 'schematisch – nicht maßstäblich',
      observer: 'Beobachter',
      viewSun: 'Blick zur Sonne',
      viewMoon: 'Blick zum Mond',
      covered: 'Sonne zu {p} % bedeckt',
      notInFront: 'Der Mond steht nicht vor der Sonne.',
      umbraE: 'Kernschatten der Erde',
      penumbraE: 'Halbschatten der Erde',
      zoneTotal: 'total',
      zonePartial: 'partiell',
      legSun: 'Sonnenlicht',
      legHalf: 'Halbschatten → partielle Finsternis',
      legCore: 'Kernschatten → totale Finsternis',
      solTotal: 'Totale Sonnenfinsternis',
      solPartial: 'Partielle Sonnenfinsternis',
      solAnnular: 'Ringförmige Sonnenfinsternis',
      solElsewhere: 'Sonnenfinsternis – nur anderswo',
      lunTotal: 'Totale Mondfinsternis',
      lunPartial: 'Partielle Mondfinsternis',
      lunPen: 'Halbschattenfinsternis',
      none: 'Keine Finsternis',
      solTotalText: 'Der Beobachter steht im Kernschatten des Mondes: Der Mond verdeckt die Sonne ganz, es wird dunkel und der Strahlenkranz der Sonne (Korona) leuchtet.',
      solPartialText: 'Der Beobachter steht im Halbschatten des Mondes: Der Mond verdeckt nur einen Teil der Sonne.',
      solAnnularText: 'Der Kernschatten des Mondes reicht nicht bis zum Beobachter: Der Mond wirkt kleiner als die Sonne, ein heller Ring bleibt sichtbar.',
      solElsewhereText: 'Der Schatten des Mondes trifft die Erde, aber nicht diesen Beobachter. Ziehe den Beobachter in den Schatten.',
      lunTotalText: 'Der Mond steht ganz im Kernschatten der Erde. Er wird nicht schwarz, sondern leuchtet kupferrot: Die Lufthülle der Erde lenkt etwas rotes Sonnenlicht in den Schatten.',
      lunPartialText: 'Ein Teil des Mondes steht im Kernschatten der Erde und wird dunkel.',
      lunPenText: 'Der Mond steht nur im Halbschatten der Erde – er wird kaum merklich dunkler.',
      noneText: 'Sonne, Erde und Mond stehen nicht auf einer Linie – der Schatten des Mondes geht an der Erde vorbei, und der Mond steht nicht im Erdschatten.',
      ph_new: 'Neumond',
      ph_waxCrescent: 'zunehmende Sichel',
      ph_firstQuarter: 'erstes Viertel (zunehmender Halbmond)',
      ph_waxGibbous: 'zunehmender Mond',
      ph_full: 'Vollmond',
      ph_wanGibbous: 'abnehmender Mond',
      ph_lastQuarter: 'letztes Viertel (abnehmender Halbmond)',
      ph_wanCrescent: 'abnehmende Sichel',
      phaseNewText: 'Neumond: Der Mond steht zwischen Sonne und Erde – nur dann kann es eine Sonnenfinsternis geben.',
      phaseFullText: 'Vollmond: Die Erde steht zwischen Sonne und Mond – nur dann kann es eine Mondfinsternis geben.',
      phaseText: '{name} – {p} % der sichtbaren Mondscheibe sind beleuchtet.',
      coverText: 'Sonne zu {p} % bedeckt · Ortszeit etwa {t}',
      distText: 'Lampe → Gegenstand a = {a} cm · Lampe → Schirm b = {b} cm',
      distTwo: 'Lampe 1 → Gegenstand {a1} cm · Lampe 2 → Gegenstand {a2} cm · Gegenstand → Schirm {c} cm',
      sizePoint: 'Schatten S = {s} cm hoch (nur Kernschatten, scharf begrenzt)',
      sizeWide: 'Kernschatten {u} cm · mit Halbschatten {o} cm',
      sizeWideNo: 'kein Kernschatten · Halbschatten {o} cm',
      sizeTwo: 'Schatten von Lampe 1: {s1} cm · von Lampe 2: {s2} cm · Kernschatten (Überlappung): {k} cm',
      larger: ' – größer als der Schirm (60 cm)',
      kindPoint: 'Punktförmige Lampe: Hinter dem Gegenstand entsteht ein Kernschatten mit scharfem Rand – dorthin gelangt überhaupt kein Licht.',
      kindWide: 'Ausgedehnte Lampe: Im Kernschatten kommt von keiner Stelle der Lampe Licht an. Im Halbschatten ringsum sieht man noch einen Teil der Lampe – der Schattenrand wird unscharf.',
      kindApex: 'Der Schirm steht hinter der Spitze des Kernschattenkegels: Von der Schirmmitte aus sieht man den Rand der Lampe rings um die Scheibe – es gibt nur noch Halbschatten.',
      kindTwo: 'Zwei Lampen: Jede Lampe wirft ihren eigenen Schatten. Wo nur eine Lampe verdeckt ist, entsteht Halbschatten; wo sich die Schatten überlappen, Kernschatten.',
      kindNoCore: 'Die beiden Schatten überlappen sich nicht – es gibt keinen Kernschatten, nur zwei Halbschatten.',
      kindColor: 'Farbige Schatten: Im Schatten der roten Lampe leuchtet nur noch das grüne Licht und umgekehrt. Wo beide Lampen hinscheinen, mischen sich Rot und Grün zu Gelb.',
    },
    en: {
      canvas: 'Optical bench with a lamp, a round disc and a screen: light beam, edge rays, umbra and penumbra and the screen seen from the front; or the Sun, the Earth and the Moon with their shadow cones during solar and lunar eclipses',
      lamp: 'Lamp',
      lamp1: 'Lamp 1',
      lamp2: 'Lamp 2',
      lamps: 'Lamps',
      obj: 'Object',
      screen: 'Screen',
      umbra: 'Umbra',
      penumbra: 'Penumbra',
      front: 'Screen from the front',
      scale: 'Scale in cm',
      legend: 'What you see',
      lit: 'fully lit',
      half: 'penumbra: part of the light is missing',
      core: 'umbra: no light',
      yellow: 'red + green = yellow',
      onlyGreen: 'shadow of the red lamp: green only',
      onlyRed: 'shadow of the green lamp: red only',
      ruleP: 'Point-like source: sharp shadow without penumbra.',
      ruleW: 'Extended source: umbra with a blurred edge of penumbra.',
      ruleT: 'Two lamps: where the shadows overlap there is umbra.',
      ruleC: 'In the shadow of one lamp only the other colour remains.',
      sun: 'Sun',
      earth: 'Earth',
      moon: 'Moon',
      orbit: 'Moon’s orbit',
      sunlight: 'sunlight',
      notToScale: 'schematic – not to scale',
      observer: 'Observer',
      viewSun: 'Looking at the Sun',
      viewMoon: 'Looking at the Moon',
      covered: 'Sun {p} % covered',
      notInFront: 'The Moon is not in front of the Sun.',
      umbraE: 'Earth’s umbra',
      penumbraE: 'Earth’s penumbra',
      zoneTotal: 'total',
      zonePartial: 'partial',
      legSun: 'sunlight',
      legHalf: 'penumbra → partial eclipse',
      legCore: 'umbra → total eclipse',
      solTotal: 'Total solar eclipse',
      solPartial: 'Partial solar eclipse',
      solAnnular: 'Annular solar eclipse',
      solElsewhere: 'Solar eclipse – elsewhere only',
      lunTotal: 'Total lunar eclipse',
      lunPartial: 'Partial lunar eclipse',
      lunPen: 'Penumbral lunar eclipse',
      none: 'No eclipse',
      solTotalText: 'The observer is in the Moon’s umbra: the Moon covers the whole Sun, it gets dark and the Sun’s corona shines.',
      solPartialText: 'The observer is in the Moon’s penumbra: the Moon covers only part of the Sun.',
      solAnnularText: 'The Moon’s umbra does not reach the observer: the Moon looks smaller than the Sun and a bright ring remains.',
      solElsewhereText: 'The Moon’s shadow hits the Earth, but not this observer. Drag the observer into the shadow.',
      lunTotalText: 'The Moon is completely inside the Earth’s umbra. It does not turn black but glows copper red: the Earth’s atmosphere bends some red sunlight into the shadow.',
      lunPartialText: 'Part of the Moon is inside the Earth’s umbra and turns dark.',
      lunPenText: 'The Moon is only in the Earth’s penumbra – it gets barely darker.',
      noneText: 'The Sun, the Earth and the Moon are not in a line – the Moon’s shadow misses the Earth and the Moon is not in the Earth’s shadow.',
      ph_new: 'new moon',
      ph_waxCrescent: 'waxing crescent',
      ph_firstQuarter: 'first quarter',
      ph_waxGibbous: 'waxing gibbous',
      ph_full: 'full moon',
      ph_wanGibbous: 'waning gibbous',
      ph_lastQuarter: 'last quarter',
      ph_wanCrescent: 'waning crescent',
      phaseNewText: 'New moon: the Moon is between the Sun and the Earth – only then can a solar eclipse happen.',
      phaseFullText: 'Full moon: the Earth is between the Sun and the Moon – only then can a lunar eclipse happen.',
      phaseText: '{name} – {p} % of the visible disc is lit.',
      coverText: 'Sun {p} % covered · local time about {t}',
      distText: 'Lamp → object a = {a} cm · lamp → screen b = {b} cm',
      distTwo: 'Lamp 1 → object {a1} cm · lamp 2 → object {a2} cm · object → screen {c} cm',
      sizePoint: 'Shadow S = {s} cm high (umbra only, sharp edge)',
      sizeWide: 'Umbra {u} cm · including penumbra {o} cm',
      sizeWideNo: 'no umbra · penumbra {o} cm',
      sizeTwo: 'Shadow of lamp 1: {s1} cm · of lamp 2: {s2} cm · umbra (overlap): {k} cm',
      larger: ' – larger than the screen (60 cm)',
      kindPoint: 'Point-like lamp: behind the object there is an umbra with a sharp edge – no light at all reaches it.',
      kindWide: 'Extended lamp: no part of the lamp shines into the umbra. In the penumbra around it part of the lamp is still visible – the edge of the shadow is blurred.',
      kindApex: 'The screen is behind the tip of the umbra cone: from the centre of the screen you can see the rim of the lamp around the disc – there is only penumbra.',
      kindTwo: 'Two lamps: each lamp casts its own shadow. Where only one lamp is blocked there is penumbra; where the shadows overlap there is umbra.',
      kindNoCore: 'The two shadows do not overlap – there is no umbra, just two penumbras.',
      kindColor: 'Coloured shadows: in the shadow of the red lamp only green light arrives, and vice versa. Where both lamps shine, red and green mix to yellow.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const lang = ctx.lang as Lang;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const mode = () => p.mode as Mode;
    const src = () => p.src as Src;

    /* ---------- animierter Zustand ---------- */
    let objX = p.ox;
    let objDir = 1;
    let moonPos = p.pos;
    const fade = new Tween(420, ease.outCubic);
    const pop = new Tween(650, ease.outBack);

    /* ---------- Bereiche ---------- */
    const OFF: Rect = { x: -60, y: -60, w: 1, h: 1 };
    function labRegions(w = surface.width, h = surface.height): { side: Rect; panel: Rect } {
      if (w >= 640) {
        const pw = Math.round(clamp(w * 0.26, 200, 260));
        return { side: { x: 0, y: 0, w: w - pw - 12, h }, panel: { x: w - pw, y: 0, w: pw, h } };
      }
      const sh = Math.round(Math.min(h * 0.56, w * 0.82));
      return { side: { x: 0, y: 0, w, h: sh }, panel: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }
    function spaceRegions(w = surface.width, h = surface.height): { scene: Rect; row: Rect } {
      const sh = Math.round(h * (w >= 640 ? 0.6 : 0.56));
      return { scene: { x: 0, y: 0, w, h: sh }, row: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }

    const lab = new Plot(surface, {
      x: [-4, 126],
      y: [-46, 34],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'lab' ? labRegions(w, h).side : OFF),
    });
    const space = new Plot(surface, {
      x: [-122, 44],
      y: [-30, 30],
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (mode() === 'space' ? spaceRegions(w, h).scene : OFF),
    });

    function fitLab(): void {
      const r = lab.rect;
      const s = Math.min(r.w / 110, r.h / 82);
      const xw = r.w / s;
      const yh = r.h / s;
      const yMin = -47 - Math.max(0, yh - 82) * 0.3;
      lab.setRange([51 - xw / 2, 51 + xw / 2], [yMin, yMin + yh]);
    }
    function fitSpace(): void {
      const r = space.rect;
      const [x0, x1] = narrow() ? [-52, 33] : [-103, 37];
      const s = Math.min(r.w / (x1 - x0), r.h / 54);
      const xw = r.w / s;
      const yh = r.h / s;
      const xc = (x0 + x1) / 2;
      space.setRange([xc - xw / 2, xc + xw / 2], [-yh / 2, yh / 2]);
    }

    /* ---------- Geometrie des Versuchs ---------- */
    interface LabGeo {
      lamps: Disc[];
      colors: RGB[];
      weights: number[];
      obj: Disc;
      sx: number;
    }
    function labGeo(): LabGeo {
      const ox = objX;
      const s = src();
      const lamps: Disc[] = [{ x: Math.min(p.lx, ox - 1), y: p.ly, r: s === 'wide' ? p.ld / 2 : 0 }];
      if (s === 'two') lamps.push({ x: Math.min(p.mx, ox - 1), y: p.my, r: 0 });
      const coloured = s === 'two' && p.col;
      return {
        lamps,
        colors: coloured ? [RED, GREEN] : lamps.map(() => WHITE),
        weights: lamps.length === 2 && !coloured ? [0.56, 0.56] : [1, 1],
        obj: { x: ox, y: p.oy, r: p.od / 2 },
        sx: Math.max(p.sx, ox + 1),
      };
    }
    const lampMaxX = () => Math.max(p.lx, src() === 'two' ? p.mx : -Infinity);

    /** Licht am Schirmpunkt (y, z) je Farbkanal. */
    function screenLight(geo: LabGeo, y: number, z: number): [number, number, number] {
      const fr = geo.lamps.map((lamp, i) => {
        const d0 = geo.sx - lamp.x;
        const d = Math.hypot(d0, y - lamp.y, z);
        return litFraction(lamp, geo.obj, geo.sx, y, z) * geo.weights[i]! * (d0 / d) ** 3 * beam(d0, y - lamp.y, z);
      });
      return mixLight(geo.colors, fr);
    }

    /* ---------- Ziehen ---------- */
    const labOn = () => mode() === 'lab' && !ctx.locked;
    const spaceOn = () => mode() === 'space' && !ctx.locked;
    const stopAnim = () => {
      if (ctx.clock.playing) ctx.clock.pause();
    };
    lab.addHandle({
      get: () => [Math.min(p.lx, objX - 1), p.ly],
      set: (x, y) => {
        stopAnim();
        ctx.set({ lx: Math.min(Math.round(x), Math.round(objX) - MIN_GAP), ly: Math.round(y) });
      },
      enabled: labOn,
      color: () => ctx.theme.series[3]!,
    });
    lab.addHandle({
      get: () => [Math.min(p.mx, objX - 1), p.my],
      set: (x, y) => {
        stopAnim();
        ctx.set({ mx: Math.min(Math.round(x), Math.round(objX) - MIN_GAP), my: Math.round(y) });
      },
      enabled: () => labOn() && src() === 'two',
      color: () => ctx.theme.series[3]!,
    });
    lab.addHandle({
      get: () => [objX, p.oy],
      set: (x, y) => {
        stopAnim();
        ctx.set({ ox: clamp(Math.round(x), lampMaxX() + MIN_GAP, p.sx - MIN_GAP), oy: Math.round(y) });
      },
      enabled: labOn,
      color: () => ctx.theme.series[0]!,
    });
    lab.addHandle({
      get: () => [objX, p.oy + p.od / 2 + 1.6],
      set: (_x, y) => {
        stopAnim();
        ctx.set({ od: Math.round(2 * (y - 1.6 - p.oy)) });
      },
      axis: 'y',
      enabled: labOn,
      color: () => ctx.theme.series[0]!,
    });
    lab.addHandle({
      get: () => [Math.max(p.sx, objX + 1) + SCREEN_T / 2, -SCREEN_H + 8],
      set: (x) => {
        stopAnim();
        ctx.set({ sx: Math.max(Math.round(x - SCREEN_T / 2), Math.round(objX) + MIN_GAP) });
      },
      axis: 'x',
      enabled: labOn,
      color: () => ctx.theme.series[5]!,
    });
    space.addHandle({
      get: () => {
        const m = moonPosition(moonPos);
        return [m[0], m[1]];
      },
      set: (x, y) => {
        stopAnim();
        const a = (Math.atan2(y, x) * 180) / Math.PI - 180;
        ctx.set({ pos: ((Math.round(a) % 360) + 360) % 360 });
      },
      enabled: spaceOn,
      color: () => ctx.theme.series[5]!,
    });
    space.addHandle({
      get: () => {
        const o = observerPosition(p.ob);
        return [o[0] * 1.55, o[1] * 1.55];
      },
      set: (x, y) => {
        stopAnim();
        let a = (Math.atan2(y, x) * 180) / Math.PI - 180;
        a = ((((a + 180) % 360) + 360) % 360) - 180;
        ctx.set({ ob: clamp(Math.round(a), -85, 85) });
      },
      enabled: () => spaceOn() && solarSide(),
      color: () => ctx.theme.series[3]!,
    });

    ctx.clock.onChange((playing) => {
      if (playing) return;
      if (mode() === 'lab' && Math.round(objX) !== p.ox) ctx.set({ ox: Math.round(objX) });
      const mp = ((Math.round(moonPos) % 360) + 360) % 360;
      if (mode() === 'space' && mp !== p.pos) ctx.set({ pos: mp });
    });

    /** Steht der Mond auf der Sonnenseite der Erde (dann zählt der Blick zur Sonne)? */
    const solarSide = () => Math.cos(rad(moonPos)) > 0;

    /* ---------- Ergebnisse ---------- */
    const v = (s: string) => `<var>${s}</var>`;
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const cm = (x: number, d = 1) => `${fmt.num(x, d)} cm`;

    function labReadouts(): void {
      const geo = labGeo();
      const s = src();
      const G = p.od;
      const ox = geo.obj.x;
      const sx = geo.sx;
      if (s !== 'two') {
        const lamp = geo.lamps[0]!;
        const a = ox - lamp.x;
        const b = sx - lamp.x;
        ctx.readout('dist', tr('distText', { a: fmt.num(a, 0), b: fmt.num(b, 0) }));
        if (s === 'point') {
          const S = pointShadowSize(G, a, b);
          ctx.readout('size', tr('sizePoint', { s: fmt.num(S, 1) }) + (S > 2 * SCREEN_H ? ctx.t('larger') : ''));
          ctx.readout('law', {
            html: `${v('S')} = ${v('G')} · ${frac(v('b'), v('a'))} = ${cm(G, 0)} · ${frac(cm(b, 0), cm(a, 0))} ≈ ${cm(S)}`,
          });
          ctx.readout('kind', ctx.t('kindPoint'));
        } else {
          const sh = shadowOnScreen(lamp, geo.obj, sx);
          const d = 2 * lamp.r;
          const core = (G * b - d * (b - a)) / a;
          const out = (G * b + d * (b - a)) / a;
          ctx.readout('size', (sh.umbra ? tr('sizeWide', { u: fmt.num(core, 1), o: fmt.num(out, 1) }) : tr('sizeWideNo', { o: fmt.num(out, 1) })) + (out > 2 * SCREEN_H ? ctx.t('larger') : ''));
          ctx.readout('law', {
            html:
              `${v('S')}<sub>Kern</sub> = ${frac(`${v('G')} · ${v('b')} − ${v('d')} · (${v('b')} − ${v('a')})`, v('a'))} ≈ ${cm(core)}` +
              (core <= 0 ? (lang === 'de' ? ' → kein Kernschatten' : ' → no umbra') : '') +
              `<br>${v('S')}<sub>${lang === 'de' ? 'außen' : 'outer'}</sub> = ${frac(`${v('G')} · ${v('b')} + ${v('d')} · (${v('b')} − ${v('a')})`, v('a'))} ≈ ${cm(out)}`,
          });
          ctx.readout('kind', ctx.t(sh.beyondApex ? 'kindApex' : 'kindWide'));
        }
      } else {
        const [l1, l2] = geo.lamps as [Disc, Disc];
        const a1 = ox - l1.x;
        const a2 = ox - l2.x;
        ctx.readout('dist', tr('distTwo', { a1: fmt.num(a1, 0), a2: fmt.num(a2, 0), c: fmt.num(sx - ox, 0) }));
        const sh1 = shadowOnScreen(l1, geo.obj, sx).outer;
        const sh2 = shadowOnScreen(l2, geo.obj, sx).outer;
        const core = intersect(sh1, sh2);
        ctx.readout('size', tr('sizeTwo', { s1: fmt.num(sh1.hi - sh1.lo, 1), s2: fmt.num(sh2.hi - sh2.lo, 1), k: fmt.num(core ? core.hi - core.lo : 0, 1) }));
        ctx.readout('law', {
          html: `${v('S')} = ${v('G')} · ${frac(v('b'), v('a'))}: &nbsp;${cm(G, 0)} · ${frac(cm(sx - l1.x, 0), cm(a1, 0))} ≈ ${cm(sh1.hi - sh1.lo)} &nbsp;bzw.&nbsp; ${cm(G, 0)} · ${frac(cm(sx - l2.x, 0), cm(a2, 0))} ≈ ${cm(sh2.hi - sh2.lo)}`.replace(
            'bzw.',
            lang === 'de' ? 'bzw.' : 'and',
          ),
        });
        ctx.readout('kind', ctx.t(p.col ? 'kindColor' : core ? 'kindTwo' : 'kindNoCore'));
      }
    }

    type Status = 'solTotal' | 'solPartial' | 'solAnnular' | 'solElsewhere' | 'lunTotal' | 'lunPartial' | 'lunPen' | 'none';
    function spaceStatus(): Status {
      if (solarSide()) {
        const sv = solarView(moonPos, p.ob);
        if (sv.kind === 'total') return 'solTotal';
        if (sv.kind === 'annular') return 'solAnnular';
        if (sv.kind === 'partial') return 'solPartial';
        return solarZones(moonPos, 2).some((z) => z.kind !== 'none') ? 'solElsewhere' : 'none';
      }
      const le = lunarEclipse(moonPos);
      return le.kind === 'total' ? 'lunTotal' : le.kind === 'partial' ? 'lunPartial' : le.kind === 'penumbral' ? 'lunPen' : 'none';
    }

    function spaceReadouts(): void {
      const ph = moonPhase(moonPos);
      ctx.readout(
        'phase',
        ph === 'new' ? ctx.t('phaseNewText') : ph === 'full' ? ctx.t('phaseFullText') : tr('phaseText', { name: ctx.t(`ph_${ph}`), p: fmt.num(illuminatedFraction(moonPos) * 100, 0) }),
      );
      const st = spaceStatus();
      ctx.readout('ecl', { html: `<strong>${ctx.t(st)}</strong> – ${ctx.t(st === 'none' ? 'noneText' : `${st}Text`)}` });
      if (solarSide()) {
        const sv = solarView(moonPos, p.ob);
        ctx.readout('cover', tr('coverText', { p: fmt.num(sv.covered * 100, 0), t: clockText(p.ob, lang) }));
      } else ctx.readout('cover', null);
    }

    function updateReadouts(): void {
      const labKeys = ['dist', 'size', 'law', 'kind'];
      const spaceKeys = ['phase', 'ecl', 'cover'];
      if (mode() === 'lab') {
        spaceKeys.forEach((k) => ctx.readout(k, null));
        labReadouts();
      } else {
        labKeys.forEach((k) => ctx.readout(k, null));
        spaceReadouts();
      }
    }

    /* ---------- Zeichenhilfen ---------- */
    const g = surface.g;

    function label(str: string, x: number, y: number, opts: { size?: number; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; weight?: number; halo?: string } = {}): void {
      const size = opts.size ?? 12;
      g.font = `${opts.weight ?? 700} ${size}px ${ctx.theme.font}`;
      g.textAlign = opts.align ?? 'center';
      g.textBaseline = opts.baseline ?? 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 3.5;
      g.strokeStyle = opts.halo ?? 'rgba(8,11,18,0.85)';
      g.strokeText(str, x, y);
      g.fillStyle = opts.color ?? '#eef2f7';
      g.fillText(str, x, y);
    }

    /** Beschriftung auf dunklem, abgerundetem Schild. */
    function tag(str: string, x: number, y: number, color = '#f1f4f8', size = 12, bg = 'rgba(9,12,19,0.72)'): number {
      g.font = `700 ${size}px ${ctx.theme.font}`;
      const w = g.measureText(str).width + 14;
      const h = size + 9;
      g.fillStyle = bg;
      roundRect(g, x - w / 2, y - h / 2, w, h, h / 2);
      g.fill();
      text(g, str, x, y + 0.5, { font: `700 ${size}px ${ctx.theme.font}`, color });
      return w;
    }

    function card(r: Rect, title?: string): number {
      const theme = ctx.theme;
      g.save();
      softShadow(g, theme.dark, 14, 3);
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.fill();
      g.restore();
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.1)';
      g.lineWidth = 1;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      if (!title) return r.y + 12;
      text(g, title, r.x + 14, r.y + 19, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
      return r.y + 32;
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      g.font = font;
      const words = str.split(' ');
      const lines: string[] = [];
      let line = '';
      for (const w of words) {
        const test = line ? `${line} ${w}` : w;
        if (g.measureText(test).width > maxW && line) {
          lines.push(line);
          line = w;
        } else line = test;
      }
      if (line) lines.push(line);
      return lines;
    }

    function arrowHead(x: number, y: number, ang: number, size: number, color: string): void {
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(size * 0.6, 0);
      g.lineTo(-size * 0.5, -size * 0.45);
      g.lineTo(-size * 0.5, size * 0.45);
      g.closePath();
      g.fill();
      g.restore();
    }

    /* =================================================================== */
    /* Versuch auf der optischen Bank                                       */
    /* =================================================================== */

    const fieldCanvas = document.createElement('canvas');
    let fieldKey = '';
    const frontCanvas = document.createElement('canvas');
    let frontKey = '';

    function geoKey(geo: LabGeo): string {
      return JSON.stringify([geo.lamps, geo.obj, geo.sx, geo.colors, geo.weights]);
    }

    /** Lichtbündel im (leicht dunstigen) Raum als Bild mit grober Auflösung. */
    function sideField(geo: LabGeo, r: Rect): HTMLCanvasElement {
      const cell = FIELD_CELL;
      const cw = Math.ceil(r.w / cell);
      const ch = Math.ceil(r.h / cell);
      const b = lab.bounds;
      const key = `${cw}x${ch}|${b.xMin.toFixed(3)},${b.yMax.toFixed(3)}|${geoKey(geo)}`;
      if (key === fieldKey) return fieldCanvas;
      fieldKey = key;
      fieldCanvas.width = cw;
      fieldCanvas.height = ch;
      const fg = fieldCanvas.getContext('2d')!;
      const img = fg.createImageData(cw, ch);
      const data = img.data;
      const sxScale = lab.scale.x;
      for (let j = 0; j < ch; j++) {
        const wy = b.yMax - ((j + 0.5) * cell) / sxScale;
        for (let i = 0; i < cw; i++) {
          const wx = b.xMin + ((i + 0.5) * cell) / sxScale;
          let R = 0;
          let G = 0;
          let B = 0;
          geo.lamps.forEach((lamp, k) => {
            // hinter dem Schirm kommt kein Licht an
            if (wx > geo.sx) {
              if (Math.abs(wy) <= SCREEN_H) return;
              const yc = rayY(lamp.x, lamp.y, wx, wy, geo.sx);
              if (Math.abs(yc) <= SCREEN_H) return;
            }
            const f = litFraction(lamp, geo.obj, wx, wy);
            if (f <= 0) return;
            const d = Math.hypot(wx - lamp.x, wy - lamp.y);
            // Helligkeit des Lichtbündels im Dunst: nimmt mit der Entfernung ab
            const e = f * geo.weights[k]! * beam(wx - lamp.x, wy - lamp.y) * (0.34 + 0.66 / (1 + (d / 26) ** 2));
            const c = geo.colors[k]!;
            R += c[0] * e;
            G += c[1] * e;
            B += c[2] * e;
          });
          const o = (j * cw + i) * 4;
          data[o] = Math.min(255, 150 * R);
          data[o + 1] = Math.min(255, 142 * G);
          data[o + 2] = Math.min(255, 118 * B);
          data[o + 3] = 255;
        }
      }
      fg.putImageData(img, 0, 0);
      return fieldCanvas;
    }

    /** Schirmbild von vorn (n × n Zellen über 60 cm × 60 cm). */
    function frontField(geo: LabGeo, n: number): HTMLCanvasElement {
      const key = `${n}|${geoKey(geo)}`;
      if (key === frontKey) return frontCanvas;
      frontKey = key;
      frontCanvas.width = n;
      frontCanvas.height = n;
      const fg = frontCanvas.getContext('2d')!;
      const img = fg.createImageData(n, n);
      const data = img.data;
      for (let j = 0; j < n; j++) {
        const y = SCREEN_H - ((j + 0.5) * 2 * SCREEN_H) / n;
        for (let i = 0; i < n; i++) {
          const z = -SCREEN_H + ((i + 0.5) * 2 * SCREEN_H) / n;
          const c = paperColor(screenLight(geo, y, z));
          const o = (j * n + i) * 4;
          data[o] = c[0];
          data[o + 1] = c[1];
          data[o + 2] = c[2];
          data[o + 3] = 255;
        }
      }
      fg.putImageData(img, 0, 0);
      return frontCanvas;
    }

    function drawRoom(r: Rect): void {
      const dark = ctx.theme.dark;
      const wall = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      wall.addColorStop(0, dark ? '#080b11' : '#10151e');
      wall.addColorStop(1, dark ? '#0f151f' : '#18202c');
      g.fillStyle = wall;
      g.fillRect(r.x, r.y, r.w, r.h);
    }

    function drawBench(r: Rect, geo: LabGeo): void {
      const s = lab.scale.x;
      const [, yTop] = lab.toPx(0, BENCH_TOP);
      const railH = 5 * s;
      // Tisch
      const tableY = yTop + railH;
      const table = g.createLinearGradient(0, tableY, 0, r.y + r.h);
      table.addColorStop(0, ctx.theme.dark ? '#3a2d22' : '#4a392a');
      table.addColorStop(1, ctx.theme.dark ? '#251c15' : '#2f241b');
      g.fillStyle = table;
      g.fillRect(r.x, tableY, r.w, r.y + r.h - tableY);
      g.fillStyle = 'rgba(255,255,255,0.08)';
      g.fillRect(r.x, tableY, r.w, 1);
      // Schiene der optischen Bank
      const [x0] = lab.toPx(-2.5, 0);
      const [x1] = lab.toPx(104, 0);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const rail = g.createLinearGradient(0, yTop, 0, yTop + railH);
      rail.addColorStop(0, '#c9d0da');
      rail.addColorStop(0.18, '#9aa3b0');
      rail.addColorStop(1, '#5d6673');
      g.fillStyle = rail;
      roundRect(g, x0, yTop, x1 - x0, railH, 3);
      g.fill();
      g.restore();
      // Zentimeterskala
      const small = narrow();
      g.strokeStyle = 'rgba(20,24,32,0.75)';
      for (let c = 0; c <= 100; c++) {
        const [x] = lab.toPx(c, 0);
        const len = c % 10 === 0 ? railH * 0.42 : c % 5 === 0 ? railH * 0.3 : railH * 0.16;
        if (small && c % 5 !== 0) continue;
        g.lineWidth = c % 10 === 0 ? 1.2 : 0.8;
        g.beginPath();
        g.moveTo(x, yTop + 1);
        g.lineTo(x, yTop + 1 + len);
        g.stroke();
        if (c % (small ? 20 : 10) === 0) {
          text(g, String(c), x, yTop + railH * 0.72, { font: `600 ${small ? 9.5 : 10}px ${ctx.theme.font}`, color: '#1b2230' });
        }
      }
      // Reiter (Halter) mit Marke an der genauen Stelle
      const rider = (x: number, color: string) => {
        const [px] = lab.toPx(x, 0);
        const w = Math.max(16, 4.5 * s);
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.45)';
        g.shadowBlur = 4;
        g.shadowOffsetY = 1;
        const body = g.createLinearGradient(0, yTop - 7, 0, yTop + 2);
        body.addColorStop(0, '#4b5462');
        body.addColorStop(1, '#262c35');
        g.fillStyle = body;
        roundRect(g, px - w / 2, yTop - 7, w, 9, 2);
        g.fill();
        g.restore();
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(px, yTop + 3.5);
        g.lineTo(px - 3.5, yTop - 1.5);
        g.lineTo(px + 3.5, yTop - 1.5);
        g.closePath();
        g.fill();
      };
      const theme = ctx.theme;
      geo.lamps.forEach((l) => rider(l.x, theme.series[3]!));
      rider(geo.obj.x, theme.series[0]!);
      rider(geo.sx + SCREEN_T / 2, theme.series[5]!);
    }

    /** Stativstange von der Bank bis zur Unterkante eines Bauteils. */
    function rod(x: number, yBottom: number): void {
      const [px, py] = lab.toPx(x, yBottom);
      const [, pb] = lab.toPx(x, BENCH_TOP);
      const w = Math.max(3, lab.scale.x * 0.8);
      const m = g.createLinearGradient(px - w / 2, 0, px + w / 2, 0);
      m.addColorStop(0, '#4c5563');
      m.addColorStop(0.45, '#aeb6c2');
      m.addColorStop(1, '#3e4652');
      g.fillStyle = m;
      g.fillRect(px - w / 2, py, w, pb - py - 6);
    }

    function drawLamp(lamp: Disc, color: RGB, scale: number): void {
      const s = lab.scale.x;
      const [cx, cy] = lab.toPx(lamp.x, lamp.y);
      const R = lamp.r * s * scale;
      // Lichthof nach vorn
      const glowR = Math.max(46, R * 3.4);
      const glow = g.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, lampCss(color, 0.6));
      glow.addColorStop(0.3, lampCss(color, 0.2));
      glow.addColorStop(1, lampCss(color, 0));
      g.fillStyle = glow;
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, glowR, -1.25, 1.25);
      g.closePath();
      g.fill();
      const metal = (y0: number, y1: number) => {
        const m = g.createLinearGradient(0, y0, 0, y1);
        m.addColorStop(0, '#9aa3b0');
        m.addColorStop(0.35, '#e3e7ec');
        m.addColorStop(0.6, '#7d8693');
        m.addColorStop(1, '#3d4450');
        return m;
      };
      if (lamp.r > 0) {
        // Milchglaskugel in einem Reflektor, der nach rechts offen ist
        const Rr = R * 1.3 + 4;
        rod(lamp.x - (Rr * 0.55) / s, lamp.y - (Rr * 0.75) / s);
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.5)';
        g.shadowBlur = 6;
        g.fillStyle = metal(cy - Rr, cy + Rr);
        g.beginPath();
        g.arc(cx, cy, Rr, Math.PI / 2 - 0.25, (3 * Math.PI) / 2 + 0.25);
        g.arc(cx, cy, Rr - Math.max(3, Rr * 0.12), (3 * Math.PI) / 2 + 0.25, Math.PI / 2 - 0.25, true);
        g.closePath();
        g.fill();
        g.restore();
        // Innenseite des Reflektors spiegelt das Licht
        const inner = g.createRadialGradient(cx, cy, R * 0.8, cx, cy, Rr);
        inner.addColorStop(0, lampCss(color, 0.55));
        inner.addColorStop(1, lampCss(color, 0.05));
        g.fillStyle = inner;
        g.beginPath();
        g.arc(cx, cy, Rr - Math.max(3, Rr * 0.12), Math.PI / 2 - 0.25, (3 * Math.PI) / 2 + 0.25);
        g.closePath();
        g.fill();
        const bulb = g.createRadialGradient(cx - R * 0.25, cy - R * 0.3, R * 0.1, cx, cy, R);
        bulb.addColorStop(0, '#ffffff');
        bulb.addColorStop(0.55, lampCss([1, 0.97, 0.88]));
        bulb.addColorStop(1, lampCss([1, 0.86, 0.55]));
        g.fillStyle = bulb;
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.fill();
      } else {
        // Experimentierleuchte: Gehäuse links, leuchtende Öffnung rechts
        const k = clamp(s / 5, 0.8, 1.35) * scale;
        rod(lamp.x - (14 * k) / s, lamp.y - (8 * k) / s);
        g.save();
        g.shadowColor = 'rgba(0,0,0,0.5)';
        g.shadowBlur = 6;
        g.fillStyle = metal(cy - 8 * k, cy + 8 * k);
        roundRect(g, cx - 27 * k, cy - 7.5 * k, 23 * k, 15 * k, 4 * k);
        g.fill();
        g.restore();
        g.fillStyle = '#2a3039';
        roundRect(g, cx - 6 * k, cy - 9 * k, 5 * k, 18 * k, 2 * k);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.18)';
        g.fillRect(cx - 24 * k, cy - 5 * k, 17 * k, 1.5 * k);
        const core = g.createRadialGradient(cx, cy, 0, cx, cy, 9 * k);
        core.addColorStop(0, '#ffffff');
        core.addColorStop(0.35, lampCss(color));
        core.addColorStop(1, lampCss(color, 0));
        g.fillStyle = core;
        g.beginPath();
        g.arc(cx, cy, 9 * k, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.arc(cx, cy, 2.4 * k, 0, Math.PI * 2);
        g.fill();
      }
    }

    function drawObject(obj: Disc): void {
      const s = lab.scale.x;
      rod(obj.x, obj.y - obj.r);
      const [cx, top] = lab.toPx(obj.x, obj.y + obj.r);
      const [, bottom] = lab.toPx(obj.x, obj.y - obj.r);
      const w = Math.max(5, 1.3 * s);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 6;
      const board = g.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0);
      board.addColorStop(0, '#d9dde3');
      board.addColorStop(0.3, '#7c8594');
      board.addColorStop(1, '#2b313b');
      g.fillStyle = board;
      roundRect(g, cx - w / 2, top, w, bottom - top, Math.min(3, w / 2));
      g.fill();
      g.restore();
      // Griff zum Ändern der Größe
      const [, gy] = lab.toPx(obj.x, obj.y + obj.r + 1.6);
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - 5, gy);
      g.lineTo(cx + 5, gy);
      g.moveTo(cx - 3, gy - 3);
      g.lineTo(cx, gy - 6);
      g.lineTo(cx + 3, gy - 3);
      g.stroke();
    }

    function drawScreen(geo: LabGeo): void {
      const s = lab.scale.x;
      rod(geo.sx + SCREEN_T / 2, -SCREEN_H);
      const [x0, y0] = lab.toPx(geo.sx, SCREEN_H);
      const [x1, y1] = lab.toPx(geo.sx + SCREEN_T, -SCREEN_H);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 8;
      g.fillStyle = '#c9ced6';
      g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.restore();
      // beleuchtete Vorderseite: Helligkeitsverlauf längs des Schirms
      const n = Math.max(30, Math.round((y1 - y0) / 2));
      const strip = Math.max(2.5, 0.55 * s);
      for (let k = 0; k < n; k++) {
        const y = SCREEN_H - ((k + 0.5) * 2 * SCREEN_H) / n;
        g.fillStyle = css(paperColor(screenLight(geo, y, 0)));
        g.fillRect(x0, y0 + ((y1 - y0) * k) / n, strip, (y1 - y0) / n + 0.6);
      }
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.fillRect(x1 - 1.5, y0, 1.5, y1 - y0);
    }

    function drawRays(geo: LabGeo): void {
      const obj = geo.obj;
      const r = lab.rect;
      geo.lamps.forEach((lamp, k) => {
        const color = geo.colors[k] === WHITE ? '#ffd36b' : lampCss(geo.colors[k]!);
        const ends: [number, number, boolean][] = lamp.r > 0 ? [[1, 1, true], [-1, -1, true], [-1, 1, false], [1, -1, false]] : [[0, 1, true], [0, -1, true]];
        for (const [ls, os, main] of ends) {
          const ax = lamp.x;
          const ay = lamp.y + ls * lamp.r;
          const bx = obj.x;
          const by = obj.y + os * obj.r;
          // Ende: am Schirm oder (an ihm vorbei) am Bildrand
          let ex = geo.sx;
          let ey = rayY(ax, ay, bx, by, ex);
          if (Math.abs(ey) > SCREEN_H) {
            ex = lab.toWorld(r.x + r.w, 0)[0];
            ey = rayY(ax, ay, bx, by, ex);
          }
          if (ey < BENCH_TOP) {
            // trifft vorher die optische Bank
            ex = ax + ((bx - ax) * (BENCH_TOP - ay)) / (by - ay);
            ey = BENCH_TOP;
          }
          const [pa, qa] = lab.toPx(ax, ay);
          const [pb, qb] = lab.toPx(bx, by);
          const [pe, qe] = lab.toPx(ex, ey);
          g.save();
          g.strokeStyle = color;
          g.globalAlpha = main ? 0.95 : 0.7;
          g.lineWidth = main ? 1.6 : 1.2;
          g.setLineDash(main ? [] : [7, 5]);
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(pa, qa);
          g.lineTo(pe, qe);
          g.stroke();
          g.restore();
          const ang = Math.atan2(qb - qa, pb - pa);
          arrowHead((pa + pb) / 2, (qa + qb) / 2, ang, 8, color);
          if (Math.hypot(pe - pb, qe - qb) > 40) arrowHead((pb + pe) / 2, (qb + qe) / 2, ang, 8, color);
        }
      });
    }

    /** Beschriftung der Schattenräume zwischen Gegenstand und Schirm. */
    function drawShadowLabels(geo: LabGeo): void {
      const s = lab.scale.x;
      const xm = geo.obj.x + (geo.sx - geo.obj.x) * 0.62;
      const gapPx = (geo.sx - geo.obj.x) * s;
      const size = narrow() ? 11 : 12;
      g.font = `700 ${size}px ${ctx.theme.font}`;
      const need = (str: string) => g.measureText(str).width + 22;
      const regions: { lo: number; hi: number; key: 'umbra' | 'penumbra' }[] = [];
      if (geo.lamps.length === 1) {
        const sh = shadowOnScreen(geo.lamps[0]!, geo.obj, xm);
        if (sh.umbra) {
          regions.push({ ...sh.umbra, key: 'umbra' });
          if (geo.lamps[0]!.r > 0) {
            regions.push({ lo: sh.umbra.hi, hi: sh.outer.hi, key: 'penumbra' });
            regions.push({ lo: sh.outer.lo, hi: sh.umbra.lo, key: 'penumbra' });
          }
        } else {
          regions.push({ ...sh.outer, key: 'penumbra' });
        }
      } else {
        const a = shadowOnScreen(geo.lamps[0]!, geo.obj, xm).outer;
        const b = shadowOnScreen(geo.lamps[1]!, geo.obj, xm).outer;
        const core = intersect(a, b);
        if (core) regions.push({ ...core, key: 'umbra' });
        for (const iv of [a, b]) {
          if (!core) regions.push({ ...iv, key: 'penumbra' });
          else {
            if (iv.hi > core.hi + 1e-6) regions.push({ lo: core.hi, hi: iv.hi, key: 'penumbra' });
            if (iv.lo < core.lo - 1e-6) regions.push({ lo: iv.lo, hi: core.lo, key: 'penumbra' });
          }
        }
      }
      for (const reg of regions) {
        const lo = Math.max(reg.lo, -SCREEN_H);
        const hi = Math.min(reg.hi, SCREEN_H);
        const str = ctx.t(reg.key);
        if ((hi - lo) * s < size + 10 || gapPx < need(str)) continue;
        const [px, py] = lab.toPx(xm, (lo + hi) / 2);
        const x = Math.min(px, lab.toPx(geo.sx, 0)[0] - need(str) / 2 - 4);
        tag(str, Math.max(x, lab.toPx(geo.obj.x, 0)[0] + need(str) / 2 + 4), py, reg.key === 'umbra' ? '#ffffff' : '#ffe7a8', size);
      }
    }

    function drawLab(): void {
      const theme = ctx.theme;
      const { side, panel } = labRegions();
      const geo = labGeo();
      fitLab();
      lab.begin();
      g.save();
      roundRect(g, side.x, side.y, side.w, side.h, 12);
      g.clip();
      drawRoom(side);
      g.imageSmoothingEnabled = true;
      const fc = sideField(geo, side);
      g.save();
      g.globalCompositeOperation = 'lighter';
      g.drawImage(fc, side.x, side.y, fc.width * FIELD_CELL, fc.height * FIELD_CELL);
      g.restore();
      drawBench(side, geo);
      if (p.rays) drawRays(geo);
      drawScreen(geo);
      drawObject(geo.obj);
      const popScale = pop.running ? 0.55 + 0.45 * pop.value : 1;
      geo.lamps.forEach((l, i) => drawLamp(l, geo.colors[i]!, popScale));
      if (p.names) drawShadowLabels(geo);
      // Namen an der Bank
      const small = narrow();
      const [, yb] = lab.toPx(0, BENCH_TOP - 5);
      const nameY = yb + (small ? 11 : 13);
      const close = geo.lamps.length > 1 && Math.abs(geo.lamps[0]!.x - geo.lamps[1]!.x) < 12;
      const names: [number, string][] = close
        ? [[(geo.lamps[0]!.x + geo.lamps[1]!.x) / 2, ctx.t('lamps')]]
        : geo.lamps.map((l, i) => [l.x, ctx.t(geo.lamps.length > 1 ? `lamp${i + 1}` : 'lamp')]);
      names.push([geo.obj.x, ctx.t('obj')], [geo.sx, ctx.t('screen')]);
      names.sort((a, b) => a[0] - b[0]);
      let lastRight = -Infinity;
      for (const [x, n] of names) {
        g.font = `700 ${small ? 11 : 12}px ${theme.font}`;
        const w = g.measureText(n).width;
        let px = lab.toPx(x, 0)[0];
        px = Math.max(px, lastRight + w / 2 + 6, side.x + w / 2 + 4);
        px = Math.min(px, side.x + side.w - w / 2 - 4);
        label(n, px, nameY, { size: small ? 11 : 12, color: '#e9edf3', halo: 'rgba(20,15,10,0.8)' });
        lastRight = px + w / 2;
      }
      g.restore();
      lab.end();
      drawLabPanel(panel, geo);
    }

    function drawLabPanel(r: Rect, geo: LabGeo): void {
      const theme = ctx.theme;
      const small = narrow();
      const coloured = geo.colors[0] === RED;
      // Karte 1: Schirm von vorn
      const cardW = small ? Math.round(r.w * 0.56) : r.w;
      const sq = Math.floor(Math.min(cardW - 52, small ? r.h - 66 : r.h * 0.62));
      const c1: Rect = { x: r.x, y: r.y, w: cardW, h: small ? r.h : sq + 70 };
      const top = card(c1, ctx.t('front'));
      const vx = c1.x + 36;
      const vy = top + 4;
      const n = Math.min(300, Math.max(60, Math.round(sq * Math.min(2, surface.dpr || 1))));
      const fc = frontField(geo, n);
      g.save();
      softShadow(g, theme.dark, 8, 2);
      g.fillStyle = '#000';
      g.fillRect(vx, vy, sq, sq);
      g.restore();
      g.imageSmoothingEnabled = true;
      g.drawImage(fc, vx, vy, sq, sq);
      // Achsenkreuz (optische Achse)
      g.strokeStyle = 'rgba(120,130,145,0.45)';
      g.lineWidth = 1;
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(vx + sq / 2, vy);
      g.lineTo(vx + sq / 2, vy + sq);
      g.moveTo(vx, vy + sq / 2);
      g.lineTo(vx + sq, vy + sq / 2);
      g.stroke();
      g.setLineDash([]);
      // Skalen links und unten (0 … 60 cm)
      g.strokeStyle = theme.muted;
      for (let c = 0; c <= 60; c += 5) {
        const t = (c / 60) * sq;
        const len = c % 10 === 0 ? 6 : 3.5;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(vx - 2, vy + sq - t);
        g.lineTo(vx - 2 - len, vy + sq - t);
        g.moveTo(vx + t, vy + sq + 2);
        g.lineTo(vx + t, vy + sq + 2 + len);
        g.stroke();
        if (c % (small ? 20 : 10) === 0) {
          text(g, String(c), vx - 11, vy + sq - t, { font: `600 10.5px ${theme.font}`, color: theme.muted, align: 'right' });
          text(g, String(c), vx + t, vy + sq + 16, { font: `600 10.5px ${theme.font}`, color: theme.muted });
        }
      }
      g.font = `700 13px ${theme.font}`;
      const titleW = g.measureText(ctx.t('front')).width;
      g.font = `500 11px ${theme.font}`;
      if (14 + titleW + 12 + g.measureText(ctx.t('scale')).width < c1.w - 12) text(g, ctx.t('scale'), c1.x + c1.w - 12, c1.y + 19, { font: `500 11px ${theme.font}`, color: theme.muted, align: 'right' });

      // Karte 2: Legende
      const c2: Rect = small ? { x: r.x + cardW + 10, y: r.y, w: r.w - cardW - 10, h: c1.h } : { x: r.x, y: c1.y + c1.h + 12, w: r.w, h: r.h - c1.h - 12 };
      const t2 = card(c2, ctx.t('legend'));
      const rows: [readonly number[], string][] = [];
      const pc = (l: readonly number[]) => paperColor(l);
      if (coloured) {
        rows.push([pc(mixLight([RED, GREEN], [1, 1])), ctx.t('yellow')]);
        rows.push([pc(GREEN), ctx.t('onlyGreen')]);
        rows.push([pc(RED), ctx.t('onlyRed')]);
        rows.push([pc([0, 0, 0]), ctx.t('core')]);
      } else {
        rows.push([pc(WHITE), ctx.t('lit')]);
        if (src() !== 'point') rows.push([pc(WHITE.map((c) => c * 0.5)), ctx.t('half')]);
        rows.push([pc([0, 0, 0]), ctx.t('core')]);
      }
      const font = `500 ${small ? 11 : 12}px ${theme.font}`;
      let y = t2 + 4;
      const textW = c2.w - 14 - 26 - 10;
      for (const [col, str] of rows) {
        const lines = wrap(str, textW, font);
        const h = Math.max(20, lines.length * 15 + 4);
        if (y + h > c2.y + c2.h - 6) break;
        g.fillStyle = css(col);
        roundRect(g, c2.x + 14, y + 2, 20, 14, 4);
        g.fill();
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.15)';
        g.lineWidth = 1;
        roundRect(g, c2.x + 14.5, y + 2.5, 19, 13, 4);
        g.stroke();
        lines.forEach((ln, i) => text(g, ln, c2.x + 44, y + 9 + i * 15, { font, color: theme.text, align: 'left' }));
        y += h + 4;
      }
      // Merksatz, wenn Platz ist
      const rule = ctx.t(coloured ? 'ruleC' : src() === 'two' ? 'ruleT' : src() === 'wide' ? 'ruleW' : 'ruleP');
      const rf = `600 ${small ? 11 : 12}px ${theme.font}`;
      const rl = wrap(rule, c2.w - 28, rf);
      if (y + 8 + rl.length * 16 < c2.y + c2.h - 8) {
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
        g.beginPath();
        g.moveTo(c2.x + 14, y + 4);
        g.lineTo(c2.x + c2.w - 14, y + 4);
        g.stroke();
        rl.forEach((ln, i) => text(g, ln, c2.x + 14, y + 20 + i * 16, { font: rf, color: theme.series[0]!, align: 'left' }));
      }
    }

    /* =================================================================== */
    /* Sonne, Erde, Mond                                                    */
    /* =================================================================== */

    const rnd = seededRandom(11);
    const stars = Array.from({ length: 170 }, () => ({ x: rnd(), y: rnd(), s: 0.4 + rnd() * 1.1, a: 0.25 + rnd() * 0.6 }));
    const spaceCanvas = document.createElement('canvas');
    let spaceKey = '';
    const bodyCanvases = new Map<string, HTMLCanvasElement>();
    const bodyKeys = new Map<string, string>();
    const albedoCache = new Map<string, { size: number; data: Uint8ClampedArray } | null>();

    /** Farben eines Fotos (falls vorhanden) als Oberfläche für die Schattierung. */
    function photoAlbedo(key: 'earth' | 'moon', size: number): ((u: number, v: number) => [number, number, number]) | null {
      const img = ctx.images.get(key);
      if (!img) return null;
      const ck = `${key}:${size}`;
      if (!albedoCache.has(ck)) {
        const c = document.createElement('canvas');
        c.width = size;
        c.height = size;
        const cg = c.getContext('2d')!;
        cg.drawImage(img, 0, 0, size, size);
        try {
          albedoCache.set(ck, { size, data: cg.getImageData(0, 0, size, size).data });
        } catch {
          albedoCache.set(ck, null);
        }
      }
      const entry = albedoCache.get(ck);
      if (!entry) return null;
      return (u, w) => {
        const i = clamp(Math.floor(((u + 1) / 2) * size), 0, size - 1);
        const j = clamp(Math.floor(((1 - w) / 2) * size), 0, size - 1);
        const o = (j * size + i) * 4;
        return [entry.data[o]! / 255, entry.data[o + 1]! / 255, entry.data[o + 2]! / 255];
      };
    }

    /**
     * Kugel Pixel für Pixel schattieren: Beleuchtung durch die Sonne (Lambert)
     * und Schatten eines anderen Körpers – so entstehen Tag/Nacht, Mondphasen
     * und die Schatten bei Finsternissen ganz von selbst.
     */
    function renderBody(
      id: string,
      radiusPx: number,
      center: Vec3,
      R: number,
      basis: { right: Vec3; up: Vec3; toViewer: Vec3 },
      albedo: (u: number, v: number) => [number, number, number],
      occluder: { c: Vec3; r: number },
      opts: { red?: boolean; atmosphere?: boolean } = {},
    ): HTMLCanvasElement {
      const dpr = Math.min(2, surface.dpr || 1);
      const size = Math.max(4, Math.ceil(radiusPx * 2 * dpr));
      const key = `${size}|${center.map((x) => x.toFixed(4)).join(',')}|${occluder.c.map((x) => x.toFixed(4)).join(',')}|${basis.toViewer.map((x) => x.toFixed(3)).join(',')}|${!!ctx.images.get(id === 'earth' ? 'earth' : 'moon')}`;
      let canvas = bodyCanvases.get(id);
      if (!canvas) {
        canvas = document.createElement('canvas');
        bodyCanvases.set(id, canvas);
      }
      if (bodyKeys.get(id) === key) return canvas;
      bodyKeys.set(id, key);
      canvas.width = size;
      canvas.height = size;
      const cg = canvas.getContext('2d')!;
      const img = cg.createImageData(size, size);
      const data = img.data;
      const rp = size / 2;
      const { right, up, toViewer } = basis;
      for (let j = 0; j < size; j++) {
        const v = -(j + 0.5 - rp) / rp;
        for (let i = 0; i < size; i++) {
          const u = (i + 0.5 - rp) / rp;
          const rho2 = u * u + v * v;
          const rho = Math.sqrt(rho2);
          const edge = clamp((1 - rho) * rp + 0.5, 0, 1);
          if (edge <= 0) continue;
          const w = Math.sqrt(Math.max(0, 1 - rho2));
          const n: Vec3 = [toViewer[0] * w + right[0] * u + up[0] * v, toViewer[1] * w + right[1] * u + up[1] * v, toViewer[2] * w + right[2] * u + up[2] * v];
          const P: Vec3 = [center[0] + R * n[0], center[1] + R * n[1], center[2] + R * n[2]];
          const sx = SUN[0] - P[0];
          const sy = SUN[1] - P[1];
          const sz = SUN[2] - P[2];
          const sl = Math.hypot(sx, sy, sz);
          const lambert = Math.max(0, (n[0] * sx + n[1] * sy + n[2] * sz) / sl);
          const f = lambert > 0 ? sunlightAt(P, occluder.c, occluder.r) : 1;
          const light = lambert * Math.pow(f, 0.6);
          const a = albedo(u, v);
          let r = a[0] * (0.035 + 0.965 * light);
          let gg = a[1] * (0.035 + 0.965 * light);
          let b = a[2] * (0.045 + 0.955 * light);
          if (opts.red) {
            const k = lambert * (1 - smooth(0, 0.12, f)) * 0.62;
            r += k * 1.0 * a[0];
            gg += k * 0.34 * a[1];
            b += k * 0.15 * a[2];
          }
          if (opts.atmosphere) {
            const rim = Math.pow(rho, 6) * (0.25 + 0.75 * light);
            r += rim * 0.18;
            gg += rim * 0.38;
            b += rim * 0.75;
          }
          const o = (j * size + i) * 4;
          data[o] = clamp(r * 255, 0, 255);
          data[o + 1] = clamp(gg * 255, 0, 255);
          data[o + 2] = clamp(b * 255, 0, 255);
          data[o + 3] = edge * 255;
        }
      }
      cg.putImageData(img, 0, 0);
      return canvas;
    }

    const TOP_VIEW = { right: [1, 0, 0] as Vec3, up: [0, 1, 0] as Vec3, toViewer: [0, 0, 1] as Vec3 };

    /** Sonnenlicht und Schatten im Raum (grobe Auflösung). */
    function spaceField(r: Rect, moon: Vec3): HTMLCanvasElement {
      const cell = 3;
      const cw = Math.ceil(r.w / cell);
      const ch = Math.ceil(r.h / cell);
      const b = space.bounds;
      const key = `${cw}x${ch}|${b.xMin.toFixed(3)},${b.yMax.toFixed(3)}|${moon[0].toFixed(4)},${moon[1].toFixed(4)}`;
      if (key === spaceKey) return spaceCanvas;
      spaceKey = key;
      spaceCanvas.width = cw;
      spaceCanvas.height = ch;
      const fg = spaceCanvas.getContext('2d')!;
      const img = fg.createImageData(cw, ch);
      const data = img.data;
      const sc = space.scale.x;
      for (let j = 0; j < ch; j++) {
        const wy = b.yMax - ((j + 0.5) * cell) / sc;
        for (let i = 0; i < cw; i++) {
          const wx = b.xMin + ((i + 0.5) * cell) / sc;
          const P: Vec3 = [wx, wy, 0];
          let f = wx > -SPACE.earthR - 1 ? sunlightAt(P, EARTH, SPACE.earthR) : 1;
          if (f > 0 && wx > moon[0] - SPACE.moonR) f *= sunlightAt(P, moon, SPACE.moonR);
          const o = (j * cw + i) * 4;
          // Licht: warm, Schatten: tiefes Blauschwarz
          data[o] = 255 * f + 2 * (1 - f);
          data[o + 1] = 214 * f + 4 * (1 - f);
          data[o + 2] = 140 * f + 10 * (1 - f);
          data[o + 3] = 255 * (0.17 * f + 0.6 * (1 - f));
        }
      }
      fg.putImageData(img, 0, 0);
      return spaceCanvas;
    }

    function drawStars(r: Rect): void {
      for (const s of stars) {
        g.fillStyle = `rgba(230,236,255,${s.a})`;
        g.fillRect(r.x + s.x * r.w, r.y + s.y * r.h, s.s, s.s);
      }
    }

    function drawSun(): void {
      const [cx, cy] = space.toPx(SUN[0], 0);
      const R = SPACE.sunR * space.scale.x;
      const glow = g.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.9);
      glow.addColorStop(0, 'rgba(255,190,80,0.55)');
      glow.addColorStop(1, 'rgba(255,150,40,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(cx, cy, R * 1.9, 0, Math.PI * 2);
      g.fill();
      const img = ctx.images.get('sun');
      if (img) {
        g.drawImage(img, cx - R, cy - R, 2 * R, 2 * R);
      } else {
        const body = g.createRadialGradient(cx - R * 0.15, cy - R * 0.15, R * 0.05, cx, cy, R);
        body.addColorStop(0, '#fffdf0');
        body.addColorStop(0.45, '#ffe58a');
        body.addColorStop(0.85, '#ffb238');
        body.addColorStop(1, '#ff8a1e');
        g.fillStyle = body;
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.fill();
        // feine Körnung (Granulation)
        const rr = seededRandom(5);
        g.fillStyle = 'rgba(255,140,30,0.16)';
        for (let k = 0; k < 90; k++) {
          const a = rr() * Math.PI * 2;
          const d = Math.sqrt(rr()) * R * 0.92;
          g.beginPath();
          g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 1 + rr() * R * 0.05, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    function line2(a: P2, b: P2, color: string, width: number, alpha: number, dash: number[] = []): void {
      const [ax, ay] = space.toPx(a[0], a[1]);
      const [bx, by] = space.toPx(b[0], b[1]);
      g.save();
      g.strokeStyle = color;
      g.globalAlpha = alpha;
      g.lineWidth = width;
      g.setLineDash(dash);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.stroke();
      g.restore();
    }

    /** Strahl von a über b hinaus bis zum Rand bzw. bis er die Erde trifft. */
    function extend(a: P2, b: P2, stopAtEarth: boolean): P2 {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const l = Math.hypot(dx, dy);
      const ux = dx / l;
      const uy = dy / l;
      let tEnd = 400;
      if (stopAtEarth) {
        // Schnitt mit dem Erdkreis (vom Punkt b aus)
        const fx = b[0] - EARTH[0];
        const fy = b[1] - EARTH[1];
        const B = fx * ux + fy * uy;
        const C = fx * fx + fy * fy - SPACE.earthR ** 2;
        const disc = B * B - C;
        if (disc > 0) {
          const t = -B - Math.sqrt(disc);
          if (t > 0) tEnd = t;
        }
      }
      return [b[0] + ux * tEnd, b[1] + uy * tEnd];
    }

    function drawConeRays(c: P2, r: number, isMoon: boolean): void {
      const t = commonTangents([SUN[0], 0], SPACE.sunR, c, r);
      const sunCol = '#ffd680';
      for (const [a, b] of t.outer) line2(a, extend(a, b, isMoon), sunCol, 1.3, 0.75);
      for (const [a, b] of t.inner) line2(a, extend(a, b, isMoon), sunCol, 1, 0.45, [6, 5]);
    }

    function drawSpace(): void {
      const theme = ctx.theme;
      const small = narrow();
      const { scene, row } = spaceRegions();
      fitSpace();
      const moon = moonPosition(moonPos);
      const s = space.scale.x;
      space.begin();
      g.save();
      roundRect(g, scene.x, scene.y, scene.w, scene.h, 12);
      g.clip();
      const bg = g.createLinearGradient(scene.x, scene.y, scene.x + scene.w, scene.y + scene.h);
      bg.addColorStop(0, '#04060d');
      bg.addColorStop(1, '#0b1326');
      g.fillStyle = bg;
      g.fillRect(scene.x, scene.y, scene.w, scene.h);
      drawStars(scene);
      g.imageSmoothingEnabled = true;
      const fc = spaceField(scene, moon);
      g.drawImage(fc, scene.x, scene.y, fc.width * 3, fc.height * 3);
      // Mondbahn
      const [ex, ey] = space.toPx(0, 0);
      g.strokeStyle = 'rgba(200,215,240,0.35)';
      g.lineWidth = 1.2;
      g.setLineDash([4, 6]);
      g.beginPath();
      g.arc(ex, ey, SPACE.orbitR * s, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      if (p.rays) {
        drawConeRays([0, 0], SPACE.earthR, false);
        drawConeRays([moon[0], moon[1]], SPACE.moonR, true);
      }
      drawSun();
      if (space.bounds.xMin > SUN[0] + SPACE.sunR) {
        // Sonne außerhalb: Hinweis am linken Rand
        const glow = g.createLinearGradient(scene.x, 0, scene.x + 60, 0);
        glow.addColorStop(0, 'rgba(255,200,90,0.45)');
        glow.addColorStop(1, 'rgba(255,200,90,0)');
        g.fillStyle = glow;
        g.fillRect(scene.x, scene.y, 60, scene.h);
        label(`← ${ctx.t('sun')}`, scene.x + 8, scene.y + 16, { align: 'left', size: 12, color: '#ffe3a3' });
      }
      // Erde und Mond (pixelweise schattiert)
      const eR = SPACE.earthR * s;
      const earthAlb = photoAlbedo('earth', Math.ceil(eR * 4)) ?? earthAlbedo;
      const ec = renderBody('earth', eR, EARTH, SPACE.earthR, TOP_VIEW, earthAlb, { c: moon, r: SPACE.moonR }, { atmosphere: true });
      g.drawImage(ec, ex - eR, ey - eR, 2 * eR, 2 * eR);
      const mR = SPACE.moonR * s;
      const [mx, my] = space.toPx(moon[0], moon[1]);
      const moonAlb = photoAlbedo('moon', Math.ceil(mR * 4)) ?? moonAlbedo;
      const mc = renderBody('moonTop', mR, moon, SPACE.moonR, TOP_VIEW, moonAlb, { c: EARTH, r: SPACE.earthR }, { red: true });
      g.drawImage(mc, mx - mR, my - mR, 2 * mR, 2 * mR);
      // feiner Rand, damit der Mond auch im Erdschatten zu finden ist
      g.strokeStyle = 'rgba(220,228,245,0.28)';
      g.lineWidth = 1;
      g.beginPath();
      g.arc(mx, my, mR + 0.5, 0, Math.PI * 2);
      g.stroke();

      // Beobachter
      if (solarSide()) {
        const o = observerPosition(p.ob);
        const [ox, oy] = space.toPx(o[0], o[1]);
        const [hx, hy] = space.toPx(o[0] * 1.55, o[1] * 1.55);
        g.strokeStyle = '#ffffff';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(ox, oy);
        g.lineTo(hx, hy);
        g.stroke();
        g.fillStyle = theme.series[3]!;
        g.strokeStyle = '#ffffff';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(hx, hy, 5, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Beschriftung nur, wenn der Mond nicht im Weg ist
        const lxp = hx + (hx - ox) * 1.4;
        const lyp = hy + (hy - oy) * 1.4;
        if (!small && Math.hypot(lxp - mx, lyp - my) > mR + 46) label(ctx.t('observer'), lxp, lyp, { size: 11, color: '#ffd9a8' });
      }
      // Finsterniszonen auf der Erde (Bogen am Erdrand)
      if (solarSide()) {
        const zones = solarZones(moonPos, 0.5);
        const drawZone = (kind: 'partial' | 'total', color: string, width: number) => {
          let start: number | null = null;
          const flush = (end: number) => {
            if (start === null) return;
            const a0 = rad(180 + start);
            const a1 = rad(180 + end);
            g.strokeStyle = color;
            g.lineWidth = width;
            g.lineCap = 'round';
            g.beginPath();
            g.arc(ex, ey, eR + 5, -a0, -a1, true);
            g.stroke();
            start = null;
          };
          for (const z of zones) {
            const hit = kind === 'partial' ? z.kind !== 'none' : z.kind === 'total' || z.kind === 'annular';
            if (hit && start === null) start = z.ob - 0.25;
            if (!hit) flush(z.ob - 0.25);
          }
          flush(90);
        };
        drawZone('partial', withAlpha(theme.series[3]!, 0.95), 4);
        // Kernschattengebiet: sehr klein, deshalb zusätzlich als Punkt markiert
        const tot = zones.filter((z) => z.kind === 'total' || z.kind === 'annular');
        if (tot.length) {
          const annular = tot.every((z) => z.kind === 'annular');
          const mid = rad(180 + (tot[0]!.ob + tot[tot.length - 1]!.ob) / 2);
          const zx = ex + Math.cos(mid) * (eR + 5);
          const zy = ey - Math.sin(mid) * (eR + 5);
          g.fillStyle = '#0a0c12';
          g.beginPath();
          g.arc(zx, zy, 5.5, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = theme.series[1]!;
          g.strokeStyle = theme.series[1]!;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(zx, zy, annular ? 3 : 3.6, 0, Math.PI * 2);
          if (annular) g.stroke();
          else g.fill();
        }
      }
      // Beschriftungen (nicht über dem Mond)
      const free = (x: number, y: number, w: number, h: number) => {
        const nx = clamp(mx, x - w / 2, x + w / 2);
        const ny = clamp(my, y - h / 2, y + h / 2);
        return Math.hypot(nx - mx, ny - my) > mR + 4;
      };
      if (p.names) {
        const obsBelow = solarSide() && p.ob > 20;
        label(ctx.t('earth'), ex, obsBelow ? ey - eR - 14 : ey + eR + 16, { size: 12 });
        g.font = `700 12px ${theme.font}`;
        const mw = g.measureText(ctx.t('moon')).width;
        const leftSide = moon[0] < 0;
        if (!leftSide && mx + mR + 8 + mw > scene.x + scene.w - 6) label(ctx.t('moon'), mx, my + (moon[1] > 0 ? mR + 13 : -mR - 11), { size: 12 });
        else label(ctx.t('moon'), leftSide ? mx - mR - 8 : mx + mR + 8, my, { size: 12, align: leftSide ? 'right' : 'left' });
        if (!small) {
          const right = scene.x + scene.w - 10;
          g.font = `700 11.5px ${theme.font}`;
          const uw = g.measureText(ctx.t('umbraE')).width;
          const [, ly] = space.toPx(0, 0);
          if (free(right - uw / 2, ly, uw + 8, 18)) label(ctx.t('umbraE'), right, ly, { size: 11.5, color: '#cfd8ea', align: 'right' });
          const xr = space.toWorld(right, 0)[0];
          const pen = (xr + 30) * Math.tan(Math.asin(22 / 110));
          const um = Math.max(0, (66 - xr) * Math.tan(Math.asin(10 / 110)));
          const pw = g.measureText(ctx.t('penumbraE')).width;
          const [, py] = space.toPx(0, (pen + um) / 2);
          if (free(right - pw / 2, py, pw + 8, 18)) label(ctx.t('penumbraE'), right, py, { size: 11.5, color: '#e9dcc0', align: 'right' });
          const oa = rad(122);
          label(ctx.t('orbit'), ex + Math.cos(oa) * (SPACE.orbitR * s + 14), ey - Math.sin(oa) * (SPACE.orbitR * s + 14), { size: 11, color: 'rgba(210,222,245,0.85)' });
        }
        // Sonne (ganz oder teilweise sichtbar)
        const [sxp] = space.toPx(SUN[0] + SPACE.sunR, 0);
        if (sxp > scene.x + 20) tag(ctx.t('sun'), Math.max(scene.x + 34, sxp - 34), ey, '#ffe9b0', 12, 'rgba(90,40,0,0.55)');
      }
      label(ctx.t('notToScale'), scene.x + scene.w - 10, scene.y + 14, { align: 'right', size: 11, color: 'rgba(210,220,240,0.8)', weight: 600 });
      g.restore();
      space.end();
      drawSpaceRow(row);
    }

    function drawSpaceRow(r: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      const viewW = small ? Math.round(r.w * 0.47) : Math.round(Math.min(300, r.w * 0.36));
      const c1: Rect = { x: r.x, y: r.y, w: viewW, h: r.h };
      const solar = solarSide();
      const top = card(c1, ctx.t(solar ? 'viewSun' : 'viewMoon'));
      const capH = 18;
      const vr = Math.max(20, Math.min((c1.w - 24) / 2, (c1.y + c1.h - top - capH - 10) / 2));
      const vx = c1.x + c1.w / 2;
      const vy = top + 2 + vr;
      if (solar) drawSolarView(vx, vy, vr);
      else drawLunarView(vx, vy, vr);
      // Unterschrift
      let caption = '';
      if (solar) {
        const sv = solarView(moonPos, p.ob);
        caption = sv.covered > 0.0005 ? tr('covered', { p: fmt.num(sv.covered * 100, 0) }) : ctx.t('notInFront');
      } else {
        caption = ctx.t(`ph_${moonPhase(moonPos)}`);
        caption = caption.charAt(0).toUpperCase() + caption.slice(1);
      }
      g.font = `600 11.5px ${theme.font}`;
      const capLines = wrap(caption, c1.w - 16, g.font);
      text(g, capLines[0] ?? '', vx, Math.min(c1.y + c1.h - 12, vy + vr + 14), { font: `600 11.5px ${theme.font}`, color: theme.muted });

      // Karte 2: Zustand und Legende
      const c2: Rect = { x: r.x + viewW + 10, y: r.y, w: r.w - viewW - 10, h: r.h };
      card(c2);
      const st = spaceStatus();
      const accent = st.startsWith('sol') ? theme.series[3]! : st.startsWith('lun') ? theme.series[1]! : theme.muted;
      const titleFont = `800 ${small ? 14 : 16}px ${theme.font}`;
      const tl = wrap(ctx.t(st), c2.w - 28, titleFont);
      let y = c2.y + 22;
      tl.forEach((ln) => {
        text(g, ln, c2.x + 14, y, { font: titleFont, color: st === 'none' ? theme.text : accent, align: 'left' });
        y += small ? 18 : 20;
      });
      // Legende: Kästchen mit Text, bei Bedarf in mehreren Zeilen
      const items: [string, string][] = [
        ['rgba(255,214,140,0.9)', ctx.t('legSun')],
        ['#5b5f6b', ctx.t(small ? 'penumbra' : 'legHalf')],
        ['#0b0e16', ctx.t(small ? 'umbra' : 'legCore')],
      ];
      const legFont = `500 ${small ? 11 : 11.5}px ${theme.font}`;
      g.font = legFont;
      const placed: { x: number; row: number; col: string; str: string }[] = [];
      let lx = c2.x + 14;
      let rowN = 0;
      for (const [col, str] of small ? [] : items) {
        const w = g.measureText(str).width;
        if (lx + 22 + w > c2.x + c2.w - 10 && lx > c2.x + 14) {
          rowN++;
          lx = c2.x + 14;
        }
        placed.push({ x: lx, row: rowN, col, str });
        lx += 22 + w + 16;
      }
      const rowH = small ? 17 : 19;
      const legendH = placed.length ? (rowN + 1) * rowH + 6 : 0;
      // Auf breiten Bildschirmen die größte Schrift wählen, bei der der Text ganz passt
      const bodyStr = ctx.t(st === 'none' ? 'noneText' : `${st}Text`);
      let bodyFont = `500 ${small ? 11 : 12.5}px ${theme.font}`;
      let lh = small ? 14.5 : 17;
      let body = wrap(bodyStr, c2.w - 28, bodyFont);
      if (!small) {
        for (const size of [14.5, 14, 13.5, 13]) {
          const f = `500 ${size}px ${theme.font}`;
          const ls = wrap(bodyStr, c2.w - 28, f);
          if (ls.length * Math.round(size * 1.42) <= c2.y + c2.h - legendH - 10 - y) {
            [bodyFont, lh, body] = [f, Math.round(size * 1.42), ls];
            break;
          }
        }
      }
      const fit = Math.max(1, Math.floor((c2.y + c2.h - legendH - 6 - y) / lh));
      body.slice(0, fit).forEach((ln, i) => {
        const last = i === fit - 1 && body.length > fit;
        text(g, last ? `${ln.replace(/[\s,.:;–-]+\S*$/, '')} …` : ln, c2.x + 14, y + 2, { font: bodyFont, color: theme.text, align: 'left' });
        y += lh;
      });
      for (const it of placed) {
        const ly = c2.y + c2.h - 14 - (rowN - it.row) * rowH;
        g.fillStyle = it.col;
        roundRect(g, it.x, ly - 6, 16, 12, 3);
        g.fill();
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)';
        g.lineWidth = 1;
        roundRect(g, it.x + 0.5, ly - 5.5, 15, 11, 3);
        g.stroke();
        text(g, it.str, it.x + 22, ly, { font: legFont, color: theme.muted, align: 'left' });
      }
    }

    /** Blick des Beobachters zur Sonne (Sonne und Mondscheibe am Himmel). */
    function drawSolarView(cx: number, cy: number, R: number): void {
      const sv = solarView(moonPos, p.ob);
      const k = 1 - sv.covered;
      const total = sv.kind === 'total';
      // Himmel: blau, bei starker Bedeckung dunkel
      const day = Math.pow(k, 0.55);
      const mix = (a: number[], b: number[], t: number) => a.map((x, i) => x + (b[i]! - x) * t);
      const skyTop = mix([7, 12, 30], [52, 120, 205], day);
      const skyBot = mix([16, 24, 52], [140, 190, 238], day);
      g.save();
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.clip();
      const sky = g.createLinearGradient(0, cy - R, 0, cy + R);
      sky.addColorStop(0, css(skyTop));
      sky.addColorStop(1, css(skyBot));
      g.fillStyle = sky;
      g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      if (day < 0.35) {
        for (const st of stars.slice(0, 26)) {
          g.fillStyle = `rgba(235,240,255,${st.a * (1 - day / 0.35)})`;
          g.fillRect(cx - R + st.x * 2 * R, cy - R + st.y * 2 * R, 1.3, 1.3);
        }
      }
      const scale = (0.3 * R) / sv.sunR;
      const sR = sv.sunR * scale;
      const mR = sv.moonR * scale;
      const mx = cx + sv.offset * scale;
      if (total) {
        // Korona
        const cor = g.createRadialGradient(cx, cy, sR * 0.9, cx, cy, sR * 2.6);
        cor.addColorStop(0, 'rgba(240,244,255,0.95)');
        cor.addColorStop(0.3, 'rgba(210,225,255,0.45)');
        cor.addColorStop(1, 'rgba(200,215,255,0)');
        g.fillStyle = cor;
        g.beginPath();
        g.arc(cx, cy, sR * 2.6, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = 'rgba(235,240,255,0.35)';
        g.lineCap = 'round';
        for (let i = 0; i < 14; i++) {
          const a = (i / 14) * Math.PI * 2 + 0.2 * Math.sin(i * 7.3);
          const l = sR * (1.7 + 0.8 * Math.abs(Math.sin(i * 2.1)));
          g.lineWidth = 1 + (i % 3);
          g.beginPath();
          g.moveTo(cx + Math.cos(a) * sR, cy + Math.sin(a) * sR);
          g.lineTo(cx + Math.cos(a) * l, cy + Math.sin(a) * l);
          g.stroke();
        }
      } else {
        const glow = g.createRadialGradient(cx, cy, sR, cx, cy, sR * 2.4);
        glow.addColorStop(0, `rgba(255,250,225,${0.75 * k})`);
        glow.addColorStop(1, 'rgba(255,250,225,0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(cx, cy, sR * 2.4, 0, Math.PI * 2);
        g.fill();
      }
      const sun = g.createRadialGradient(cx, cy, 0, cx, cy, sR);
      sun.addColorStop(0, '#fffef6');
      sun.addColorStop(0.75, '#fff3c4');
      sun.addColorStop(1, '#ffd77a');
      g.fillStyle = sun;
      g.beginPath();
      g.arc(cx, cy, sR, 0, Math.PI * 2);
      g.fill();
      // Mond als dunkle Scheibe davor
      if (sv.covered > 0) {
        // Der Neumond ist am hellen Taghimmel unsichtbar – man sieht ihn nur vor der Sonne.
        if (!total) {
          g.beginPath();
          g.arc(cx, cy, sR, 0, Math.PI * 2);
          g.clip();
        }
        const mg = g.createRadialGradient(mx - mR * 0.3, cy - mR * 0.3, 0, mx, cy, mR);
        mg.addColorStop(0, total ? '#1a1d26' : '#2a2e38');
        mg.addColorStop(1, '#0d0f14');
        g.fillStyle = mg;
        g.beginPath();
        g.arc(mx, cy, mR, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      g.strokeStyle = ctx.theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.stroke();
    }

    /** Blick von der Erde zum Mond: Mondphase und Erdschatten. */
    function drawLunarView(cx: number, cy: number, R: number): void {
      const moon = moonPosition(moonPos);
      const dl = Math.hypot(moon[0], moon[1]);
      const d: Vec3 = [moon[0] / dl, moon[1] / dl, 0];
      const basis = { right: [d[1], -d[0], 0] as Vec3, up: [0, 0, 1] as Vec3, toViewer: [-d[0], -d[1], 0] as Vec3 };
      g.save();
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.clip();
      const sky = g.createLinearGradient(0, cy - R, 0, cy + R);
      sky.addColorStop(0, '#060a16');
      sky.addColorStop(1, '#101a33');
      g.fillStyle = sky;
      g.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      for (const st of stars.slice(30, 60)) {
        g.fillStyle = `rgba(235,240,255,${st.a * 0.8})`;
        g.fillRect(cx - R + st.x * 2 * R, cy - R + st.y * 2 * R, 1.2, 1.2);
      }
      const mR = R * 0.62;
      const alb = photoAlbedo('moon', Math.ceil(mR * 4)) ?? moonAlbedo;
      const mc = renderBody('moonView', mR, moon, SPACE.moonR, basis, alb, { c: EARTH, r: SPACE.earthR }, { red: true });
      g.drawImage(mc, cx - mR, cy - mR, 2 * mR, 2 * mR);
      g.restore();
      g.strokeStyle = ctx.theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.18)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.stroke();
    }

    return {
      update(changed, source) {
        if (source === 'input') {
          const push: Record<string, number> = {};
          const two = src() === 'two';
          if (changed.has('ox')) {
            if (p.lx > p.ox - MIN_GAP) push.lx = Math.max(0, p.ox - MIN_GAP);
            if (two && p.mx > p.ox - MIN_GAP) push.mx = Math.max(0, p.ox - MIN_GAP);
            if (p.sx < p.ox + MIN_GAP) push.sx = p.ox + MIN_GAP;
          }
          for (const key of ['lx', 'mx'] as const) {
            if (changed.has(key) && p[key] > p.ox - MIN_GAP && (key === 'lx' || two)) {
              push.ox = p[key] + MIN_GAP;
              if (p.sx < push.ox + MIN_GAP) push.sx = push.ox + MIN_GAP;
            }
          }
          if (changed.has('sx') && p.sx < p.ox + MIN_GAP) {
            push.ox = p.sx - MIN_GAP;
            if (p.lx > push.ox - MIN_GAP) push.lx = Math.max(0, push.ox - MIN_GAP);
            if (two && p.mx > push.ox - MIN_GAP) push.mx = Math.max(0, push.ox - MIN_GAP);
          }
          if (Object.keys(push).length) ctx.set(push);
        }
        if (changed.has('ox') || source !== 'sim') objX = p.ox;
        if (changed.has('pos') || source !== 'sim') moonPos = p.pos;
        if (changed.has('mode') && source !== 'init') {
          if (ctx.clock.playing) ctx.clock.pause();
          fade.play();
        }
        if (changed.has('src') && source !== 'init' && p.src !== 'point') pop.play();
        ctx.clock.speed = p.slow ? 0.25 : 1;
        updateReadouts();
      },

      tick(dt) {
        if (mode() === 'lab') {
          const lo = lampMaxX() + MIN_GAP;
          const hi = p.sx - MIN_GAP;
          if (hi <= lo) return;
          objX += objDir * 10 * dt;
          if (objX >= hi) [objX, objDir] = [hi, -1];
          if (objX <= lo) [objX, objDir] = [lo, 1];
        } else {
          moonPos = (moonPos + 8 * dt) % 360;
        }
        updateReadouts();
      },

      resetTime() {
        objX = p.ox;
        objDir = 1;
        moonPos = p.pos;
        updateReadouts();
      },

      render() {
        lab.resize();
        space.resize();
        surface.begin();
        if (mode() === 'lab') drawLab();
        else drawSpace();
        if (fade.running) {
          g.fillStyle = withAlpha(ctx.theme.bg, 1 - fade.value);
          g.fillRect(0, 0, surface.width, surface.height);
          ctx.requestRender();
        }
        if (pop.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
