import { clamp, defineSimulation, ease, lerp, Plot, prefersReducedMotion, roundRect, scaledSprite, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  acceptanceAngle,
  apexPrism,
  apparentDepth,
  brewsterAngle,
  cauchyIndex,
  criticalAngle,
  fiberDelivery,
  fiberEdges,
  fresnel,
  gemEdges,
  gemOutline,
  indexFromSeries,
  lightSpeed,
  mainPath,
  MEDIA,
  minDeviation,
  nearestSample,
  plateEdges,
  plateShift,
  polygonEdges,
  prismEdges,
  prismPath,
  readAngle,
  refractionAngle,
  SAMPLES,
  toDeg,
  toRad,
  traceFiber,
  traceShape,
  type Edge,
  type MediumId,
  type TraceResult,
  type V2,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'ray' | 'graph' | 'total' | 'measure' | 'optics';
type App = 'fiber' | 'prism' | 'gem';
type Ex = 'plate' | 'prism' | 'depth';
type Kind = 'law' | 'fresnel' | 'beta' | 'sin' | 'app' | 'bend' | 'crit' | 'table' | 'fit' | 'opt' | 'shift' | 'dev' | 'lift';
type Pt = [number, number];

const MEDIUM_OPTIONS = [
  { value: 'luft', label: L('Luft (n = 1,00)', 'Air (n = 1.00)') },
  { value: 'wasser', label: L('Wasser (n = 1,33)', 'Water (n = 1.33)') },
  { value: 'plexiglas', label: L('Plexiglas (n = 1,49)', 'Acrylic (n = 1.49)') },
  { value: 'glas', label: L('Glas (n = 1,52)', 'Glass (n = 1.52)') },
  { value: 'diamant', label: L('Diamant (n = 2,42)', 'Diamond (n = 2.42)') },
] as const;
const MEDIUM_NAME: Record<MediumId, { de: string; en: string }> = {
  luft: L('Luft', 'Air'),
  wasser: L('Wasser', 'Water'),
  plexiglas: L('Plexiglas', 'Acrylic'),
  glas: L('Glas', 'Glass'),
  diamant: L('Diamant', 'Diamond'),
};
/** Färbung der Stoffe (gegenständlich, in beiden Modi abgestimmt). */
const TINT: Record<MediumId, [string, number]> = {
  luft: ['#ffffff', 0],
  wasser: ['#2f8fd8', 0.2],
  plexiglas: ['#9fd6e8', 0.24],
  glas: ['#7fc8b6', 0.26],
  diamant: ['#b9a6f0', 0.3],
};
/** Farbe der unbekannten Probe in der Messreihe. */
const SAMPLE_TINT: [string, number] = ['#c9a86a', 0.26];
/** Laser (laser.webp, 700 × 200): Höhe der Austrittsöffnung. */
const LASER_IMG = { noseY: 78 };
/** Laserstrahl (gegenständliche Farbe wie bei den anderen Optik-Simulationen). */
const BEAM = [255, 59, 48] as const;
/** Abstand der Laseröffnung vom Mittelpunkt der Scheibe (Radius 1). */
const LASER_R = 1.04;
const MAX_ROWS = 8;
/** Glasfaser: Dicke 1 mm, gerades Stück 6 mm, 90°-Bogen, Endstück 4 mm. */
const FIBER = { d: 1, L1: 6, L2: 4 };
/** Spektralfarben für die Farbzerlegung (Wellenlänge in nm). */
const SPECTRUM: [number, string][] = [
  [410, '#8f45ff'],
  [450, '#3f5cff'],
  [490, '#1fb6e8'],
  [530, '#2fcc49'],
  [575, '#f2d21b'],
  [610, '#ff8a1a'],
  [660, '#ff2b1a'],
];
const GEM_X = [-0.36, 0, 0.36];
const PRISM_Y = [1.3, 2, 2.7];
const TAU = Math.PI * 2;

/** „Schöne“ Schrittweite (1, 2, 2,5, 5 · 10^k) von mindestens x. */
function niceStep(x: number): number {
  if (!(x > 0)) return 1;
  const q = 10 ** Math.floor(Math.log10(x));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * q >= x - 1e-12) return m * q;
  return 10 * q;
}

/**
 * Brechung und Totalreflexion: optische Scheibe mit drehbarem Laser,
 * Fresnel-Anteilen und Huygens-Wellenfronten; Snellius-Diagramme (β über α,
 * sin β über sin α); Totalreflexion an Glasfaser, Umlenkprisma und Brillant;
 * Messreihe zur Brechzahl eines unbekannten Stoffs; planparallele Platte,
 * Prisma mit Farbzerlegung und scheinbare Hebung.
 */
export default defineSimulation({
  id: 'brechung',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.56 },
  images: { laser: 'laser.webp' },
  groups: [
    { id: 'app', label: L('Aufbau', 'Setup') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'ray', label: L('Brechung', 'Refraction') },
        { value: 'graph', label: L('Snellius-Diagramm', 'Snell diagram') },
        { value: 'total', label: L('Totalreflexion anwenden', 'Total reflection at work') },
        { value: 'measure', label: L('Brechzahl bestimmen', 'Find the refractive index') },
        { value: 'optics', label: L('Platte, Prisma, Hebung', 'Plate, prism, apparent depth') },
      ],
      default: 'ray',
    },
    {
      key: 'alpha',
      type: 'number',
      label: L('Einfallswinkel α', 'Angle of incidence α'),
      help: L('Oder den Laser im Bild ziehen.', 'Or drag the laser in the picture.'),
      min: 0,
      max: 89,
      step: 1,
      default: 40,
      unit: '°',
      visibleIf: (v) => v.mode !== 'total',
    },
    {
      key: 'from',
      type: 'choice',
      label: L('Licht kommt von', 'Light comes from'),
      options: [
        { value: 'top', label: L('oben', 'above') },
        { value: 'bottom', label: L('unten', 'below') },
      ],
      default: 'top',
      visibleIf: (v) => v.mode === 'ray' || v.mode === 'graph',
    },
    { key: 'top', type: 'choice', label: L('Stoff oben', 'Material above'), options: MEDIUM_OPTIONS, default: 'luft', visibleIf: (v) => v.mode === 'ray' || v.mode === 'graph' },
    { key: 'bottom', type: 'choice', label: L('Stoff unten', 'Material below'), options: MEDIUM_OPTIONS, default: 'wasser', visibleIf: (v) => v.mode === 'ray' || v.mode === 'graph' },
    {
      key: 'app',
      type: 'choice',
      group: 'app',
      label: L('Anwendung', 'Application'),
      options: [
        { value: 'fiber', label: L('Lichtleiter (Glasfaser)', 'Light guide (optical fibre)') },
        { value: 'prism', label: L('Umlenkprisma', 'Reflecting prism') },
        { value: 'gem', label: L('Brillant', 'Brilliant-cut gem') },
      ],
      default: 'fiber',
      visibleIf: (v) => v.mode === 'total',
    },
    {
      key: 'ex',
      type: 'choice',
      group: 'app',
      label: L('Versuch', 'Setup'),
      options: [
        { value: 'plate', label: L('Planparallele Platte', 'Parallel-sided plate') },
        { value: 'prism', label: L('Prisma', 'Prism') },
        { value: 'depth', label: L('Scheinbare Hebung', 'Apparent depth') },
      ],
      default: 'plate',
      visibleIf: (v) => v.mode === 'optics',
    },
    {
      key: 'mat',
      type: 'choice',
      group: 'app',
      label: L('Stoff des Körpers', 'Material of the body'),
      options: MEDIUM_OPTIONS,
      default: 'glas',
      visibleIf: (v) => v.mode === 'total' || v.mode === 'optics',
    },
    {
      key: 'clad',
      type: 'choice',
      group: 'app',
      label: L('Umgebung der Faser (Mantel)', 'Around the fibre (cladding)'),
      options: MEDIUM_OPTIONS,
      default: 'luft',
      visibleIf: (v) => v.mode === 'total' && v.app === 'fiber',
    },
    {
      key: 'ain',
      type: 'number',
      group: 'app',
      label: L('Neigung des Lichts', 'Tilt of the light'),
      help: L('Oder den Laser im Bild ziehen.', 'Or drag the laser in the picture.'),
      min: -60,
      max: 60,
      step: 1,
      default: 30,
      unit: '°',
      visibleIf: (v) => v.mode === 'total',
    },
    {
      key: 'rb',
      type: 'number',
      group: 'app',
      label: L('Biegeradius der Faser', 'Bending radius of the fibre'),
      help: L('Die Faser ist 1 mm dick. Oder am Bogen ziehen.', 'The fibre is 1 mm thick. Or drag the bend.'),
      min: 1,
      max: 15,
      step: 0.5,
      default: 6,
      unit: 'mm',
      visibleIf: (v) => v.mode === 'total' && v.app === 'fiber',
    },
    { key: 'pa', type: 'number', group: 'app', label: L('Brechender Winkel γ des Prismas', 'Apex angle γ of the prism'), min: 30, max: 75, step: 1, default: 60, unit: '°', visibleIf: (v) => v.mode === 'optics' && v.ex === 'prism' },
    {
      key: 'disp',
      type: 'boolean',
      group: 'app',
      label: L('Weißes Licht: Farbzerlegung (Glas)', 'White light: dispersion (glass)'),
      help: L('Brechzahl von Kronglas nach der Cauchy-Formel – eine Näherung.', 'Refractive index of crown glass from Cauchy’s formula – an approximation.'),
      default: true,
      visibleIf: (v) => v.mode === 'optics' && v.ex === 'prism',
    },
    { key: 'dep', type: 'number', group: 'app', label: L('Tiefe h des Fisches', 'Depth h of the fish'), min: 0.2, max: 3, step: 0.1, default: 1, unit: 'm', visibleIf: (v) => v.mode === 'optics' && v.ex === 'depth' },
    {
      key: 'x',
      type: 'number',
      label: L('Unbekannte Probe Nr.', 'Unknown sample no.'),
      help: L('Oder „Neue Probe“ drücken.', 'Or press “New sample”.'),
      min: 1,
      max: 8,
      step: 1,
      default: 3,
      visibleIf: (v) => v.mode === 'measure',
    },
    { key: 'scale', type: 'boolean', group: 'view', label: L('Winkelmesser', 'Protractor'), default: true, visibleIf: (v) => v.mode === 'ray' || v.mode === 'graph' || v.mode === 'measure' },
    { key: 'critical', type: 'boolean', group: 'view', label: L('Grenzwinkel einzeichnen', 'Show critical angle'), default: true, visibleIf: (v) => v.mode === 'ray' || v.mode === 'graph' },
    { key: 'intensity', type: 'boolean', group: 'view', label: L('Helligkeit nach Anteil (Teilreflexion)', 'Brightness by share (partial reflection)'), default: true },
    {
      key: 'wave',
      type: 'boolean',
      group: 'view',
      label: L('Wellenfronten (Huygens)', 'Wavefronts (Huygens)'),
      help: L('Im optisch dichteren Stoff ist das Licht langsamer (c = c₀/n), die Wellenfronten rücken enger zusammen und knicken ab.', 'In the optically denser material light is slower (c = c₀/n); the wavefronts move closer together and bend.'),
      default: false,
      visibleIf: (v) => v.mode === 'ray',
    },
  ],
  actions: [
    { id: 'measure', label: L('Messwert aufnehmen', 'Record measurement'), primary: true, visibleIf: (v) => v.mode === 'measure' },
    { id: 'new', label: L('Neue Probe', 'New sample'), visibleIf: (v) => v.mode === 'measure' },
    { id: 'clear', label: L('Messreihe löschen', 'Clear measurements'), visibleIf: (v) => v.mode === 'measure' },
    { id: 'pulse', label: L('Lichtpuls senden', 'Send a light pulse'), primary: true, visibleIf: (v) => v.mode === 'total' && v.app === 'fiber' },
  ],
  readouts: [
    { key: 'angles', label: L('Winkel', 'Angles'), spoiler: true },
    { key: 'law', label: L('Brechungsgesetz', 'Law of refraction'), spoiler: true },
    { key: 'critical', label: L('Grenzwinkel der Totalreflexion', 'Critical angle'), spoiler: true },
    { key: 'reflect', label: L('Reflektierter Anteil', 'Reflected share') },
    { key: 'speed', label: L('Lichtgeschwindigkeit', 'Speed of light') },
    { key: 'slope', label: L('Steigung im Diagramm', 'Slope in the diagram'), spoiler: true },
    { key: 'app', label: L('Totalreflexion', 'Total internal reflection') },
    { key: 'table', label: L('Messreihe', 'Measurements') },
    { key: 'fit', label: L('Auswertung', 'Evaluation'), spoiler: true },
    { key: 'opt', label: L('Rechnung', 'Calculation'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('Luft → Wasser', 'Air → water'), values: {} },
    { id: 'glass', label: L('Luft → Glas', 'Air → glass'), values: { bottom: 'glas', alpha: 50 } },
    { id: 'reverse', label: L('Wasser → Luft', 'Water → air'), values: { from: 'bottom', alpha: 30 } },
    { id: 'total', label: L('Totalreflexion', 'Total internal reflection'), values: { from: 'bottom', bottom: 'glas', alpha: 50 } },
    { id: 'diamond', label: L('Diamant funkelt', 'Diamond sparkles'), values: { from: 'bottom', bottom: 'diamant', alpha: 30 } },
    { id: 'graph', label: L('Snellius-Diagramm: Glas → Luft', 'Snell diagram: glass → air'), values: { mode: 'graph', from: 'bottom', bottom: 'glas', alpha: 30 } },
    { id: 'fiber', label: L('Lichtleiter aus Plexiglas', 'Acrylic light guide'), values: { mode: 'total', mat: 'plexiglas', ain: 40, rb: 3 } },
    { id: 'measure', label: L('Unbekannten Stoff bestimmen', 'Identify an unknown material'), values: { mode: 'measure' } },
    { id: 'spectrum', label: L('Prisma: Farbzerlegung', 'Prism: dispersion'), values: { mode: 'optics', ex: 'prism', alpha: 50 } },
    { id: 'depth', label: L('Fisch im Wasser', 'Fish in water'), values: { mode: 'optics', ex: 'depth', mat: 'wasser', alpha: 30 } },
  ],
  strings: {
    de: {
      canvas:
        'Je nach Ansicht: optische Scheibe mit Laser, Lot, einfallendem, reflektiertem und gebrochenem Strahl samt Winkeln; Diagramme zum Brechungsgesetz; Glasfaser, Umlenkprisma oder Brillant mit Totalreflexion; Messreihe zu einer unbekannten Probe; planparallele Platte, Prisma mit Spektrum oder Fisch im Wasser',
      total: 'Totalreflexion!',
      normal: 'Lot',
      none: 'keiner – Licht geht ins optisch dichtere Medium',
      reflectText: '{r} % reflektiert, {t} % gebrochen',
      totalText: '100 % reflektiert (Totalreflexion)',
      denser: 'optisch dichter',
      thinner: 'optisch dünner',
      speedText: 'oben {top} km/s · unten {bottom} km/s',
      anglesTotal: 'α = {a}° · Reflexionswinkel α′ = {a}° · kein gebrochener Strahl',
      angles: 'α = {a}° · Reflexionswinkel α′ = {a}° · Brechungswinkel β = {b}°',
      anglesMeasure: 'α = {a}° · abgelesener Brechungswinkel β ≈ {b}°',
      hSame: 'Gleiche Stoffe (n₁ = n₂): kein Knick, keine Reflexion',
      hZero: 'α = 0°: senkrechter Einfall – kein Knick',
      hGrazing: 'Knapp unter dem Grenzwinkel: β ≈ 90°, das Licht streift die Grenzfläche',
      hBrewster: 'Brewster-Winkel: Das reflektierte Licht ist vollständig polarisiert',
      hTowards: 'zum Lot hin gebrochen',
      hAway: 'vom Lot weg gebrochen',
      hStraight: 'kein Knick',
      lawTitle: 'Brechungsgesetz',
      shares: 'Anteile',
      refl: 'reflektiert',
      refr: 'gebrochen',
      cText: 'c = c₀/n: c_{1} = {c1} km/s · c_{2} = {c2} km/s',
      lambda: 'λ_{2} = λ_{1} · n_{1}/n_{2} = {f} · λ_{1}',
      tFresnel: 'Anteile R, T in % über α',
      tBeta: 'β in ° über α',
      tSin: 'sin β über sin α',
      tFit: 'Auswertung: sin β über sin α',
      tBend: 'Ankommender Anteil in % über R',
      tShift: 'Versatz Δ in cm über α',
      tDev: 'Ablenkung δ in ° über α',
      tLift: 'Scheinbare Tiefe h′/h über α',
      tCrit: 'Grenzwinkel gegen Luft',
      totalZone: 'Totalreflexion',
      slopeLbl: 'Steigung n_{1}/n_{2} = {k}',
      same: 'β = α (gleiche Stoffe)',
      brewster: 'Brewster',
      dragChart: 'Ziehen: α einstellen',
      sample: 'Probe {x}',
      sampleN: 'n = ?',
      thNo: 'Nr.',
      emptyRows: 'Laser einstellen und „Messwert aufnehmen“ drücken.',
      emptyFit: 'Hier erscheinen die Messpunkte.',
      fitResult: 'n = 1/k ≈ {n}',
      fitReveal: 'Tabelle: {name} ({n})',
      fitMore: 'Noch {k} Messung(en) bis zur Auflösung',
      full: 'Die Messreihe ist voll (höchstens 8 Werte).',
      zeroAngle: 'Bei α = 0° lässt sich n nicht bestimmen – Laser schräg stellen.',
      fiberTitle: 'Lichtleiter',
      prismTitle: 'Umlenkprisma',
      gemTitle: 'Brillant',
      critLine: 'Grenzwinkel α_{G} = arcsin({n2}/{n1}) = {g}°',
      critNone: 'kein Grenzwinkel – die Umgebung ist optisch dichter',
      accept: 'Akzeptanzwinkel θ_{max} = {a}°',
      acceptAll: 'Akzeptanzwinkel: alle Winkel bis 90°',
      bendLine: 'Biegeradius R = {r} mm ({k} · Dicke)',
      minHit: 'kleinster Auftreffwinkel {a}°',
      arrive: 'kommen am Ende an',
      deflect: 'werden umgelenkt',
      leakHyp: 'treten an der Schrägfläche aus',
      sparkle: 'kommen oben wieder heraus',
      lost: 'gehen unten verloren',
      hitHyp: 'Auftreffwinkel an der Schrägfläche {a}°',
      pavilion: 'Auftreffwinkel unten ≈ {a}°',
      leak: 'tritt aus',
      tir: 'Totalreflexion',
      pulse: 'Lichtpuls',
      hFiberSame: 'Kern und Mantel gleich: Das Licht wird nicht geführt.',
      hFiberDense: 'Mantel optisch dichter als der Kern: keine Totalreflexion.',
      hBendLoss: 'Zu starke Biegung: In der Kurve trifft das Licht steiler auf die Wand und tritt aus.',
      hAccept: 'Zu schräg eingekoppelt: Der Winkel an der Wand ist kleiner als der Grenzwinkel.',
      hPrismLeak: '{m}: Grenzwinkel {g}° > 45° – keine Totalreflexion an der Schrägfläche.',
      hGemGlass: 'Glas: Grenzwinkel 41,1° – viel Licht geht unten verloren.',
      hAir: 'Luft in Luft: kein Körper – keine Brechung.',
      plateTitle: 'Planparallele Platte (d = 2 cm)',
      prismOptTitle: 'Prisma',
      depthTitle: 'Scheinbare Hebung',
      parallel: 'Austretender Strahl ∥ einfallendem Strahl',
      shiftLine: 'Δ = d · sin(α − β)/cos β = {d} cm',
      betaLine: 'β = {b}° im Stoff',
      devLine: 'δ = α + β_{2} − γ = {a}° + {b}° − {g}° = {d}°',
      devMin: 'kleinste Ablenkung δ_{min} = {d}°',
      devTotal: 'Totalreflexion an der zweiten Fläche (α_{2} = {a}°)',
      dispLine: 'n_{rot} = {r} · n_{violett} = {v} (Cauchy-Näherung)',
      dispOnly: 'Farbzerlegung nur für Glas berechnet',
      depthLine: 'h′ = h · tan α / tan β = {h} m',
      depthNear: 'fast senkrecht: h′ ≈ h · n_{Luft}/n_{Stoff} = {h} m',
      depthTotal: 'Totalreflexion – von oben unsichtbar',
      fish: 'Fisch',
      image: 'scheinbar',
      eye: 'Auge',
      screen: 'Schirm',
    },
    en: {
      canvas:
        'Depending on the view: optical disc with laser, normal, incident, reflected and refracted ray with angles; diagrams of Snell’s law; optical fibre, reflecting prism or gem with total internal reflection; measurements on an unknown sample; parallel-sided plate, prism with spectrum or a fish in water',
      total: 'Total internal reflection!',
      normal: 'normal',
      none: 'none – light enters the optically denser medium',
      reflectText: '{r} % reflected, {t} % refracted',
      totalText: '100 % reflected (total internal reflection)',
      denser: 'optically denser',
      thinner: 'optically less dense',
      speedText: 'above {top} km/s · below {bottom} km/s',
      anglesTotal: 'α = {a}° · angle of reflection α′ = {a}° · no refracted ray',
      angles: 'α = {a}° · angle of reflection α′ = {a}° · angle of refraction β = {b}°',
      anglesMeasure: 'α = {a}° · reading of the angle of refraction β ≈ {b}°',
      hSame: 'Same materials (n₁ = n₂): no bending, no reflection',
      hZero: 'α = 0°: normal incidence – no bending',
      hGrazing: 'Just below the critical angle: β ≈ 90°, the light grazes the surface',
      hBrewster: 'Brewster angle: the reflected light is completely polarised',
      hTowards: 'bent towards the normal',
      hAway: 'bent away from the normal',
      hStraight: 'no bending',
      lawTitle: 'Snell’s law',
      shares: 'Shares',
      refl: 'reflected',
      refr: 'refracted',
      cText: 'c = c₀/n: c_{1} = {c1} km/s · c_{2} = {c2} km/s',
      lambda: 'λ_{2} = λ_{1} · n_{1}/n_{2} = {f} · λ_{1}',
      tFresnel: 'Shares R, T in % against α',
      tBeta: 'β in ° against α',
      tSin: 'sin β against sin α',
      tFit: 'Evaluation: sin β against sin α',
      tBend: 'Share arriving in % against R',
      tShift: 'Shift Δ in cm against α',
      tDev: 'Deviation δ in ° against α',
      tLift: 'Apparent depth h′/h against α',
      tCrit: 'Critical angle against air',
      totalZone: 'total reflection',
      slopeLbl: 'slope n_{1}/n_{2} = {k}',
      same: 'β = α (same materials)',
      brewster: 'Brewster',
      dragChart: 'Drag: set α',
      sample: 'Sample {x}',
      sampleN: 'n = ?',
      thNo: 'No.',
      emptyRows: 'Set the laser and press “Record measurement”.',
      emptyFit: 'The measured points appear here.',
      fitResult: 'n = 1/k ≈ {n}',
      fitReveal: 'Table: {name} ({n})',
      fitMore: '{k} more measurement(s) to reveal',
      full: 'The table is full (at most 8 values).',
      zeroAngle: 'At α = 0° n cannot be found – tilt the laser.',
      fiberTitle: 'Light guide',
      prismTitle: 'Reflecting prism',
      gemTitle: 'Brilliant cut',
      critLine: 'critical angle α_{c} = arcsin({n2}/{n1}) = {g}°',
      critNone: 'no critical angle – the surroundings are optically denser',
      accept: 'acceptance angle θ_{max} = {a}°',
      acceptAll: 'acceptance angle: all angles up to 90°',
      bendLine: 'bending radius R = {r} mm ({k} · thickness)',
      minHit: 'smallest angle at the wall {a}°',
      arrive: 'arrive at the end',
      deflect: 'are deflected',
      leakHyp: 'leave through the slanted face',
      sparkle: 'come back out at the top',
      lost: 'are lost at the bottom',
      hitHyp: 'angle at the slanted face {a}°',
      pavilion: 'angle at the bottom ≈ {a}°',
      leak: 'leaves',
      tir: 'total reflection',
      pulse: 'light pulse',
      hFiberSame: 'Core and cladding are the same: the light is not guided.',
      hFiberDense: 'Cladding optically denser than the core: no total reflection.',
      hBendLoss: 'Bent too tightly: in the curve the light hits the wall more steeply and escapes.',
      hAccept: 'Coupled in too steeply: the angle at the wall is smaller than the critical angle.',
      hPrismLeak: '{m}: critical angle {g}° > 45° – no total reflection at the slanted face.',
      hGemGlass: 'Glass: critical angle 41.1° – a lot of light is lost at the bottom.',
      hAir: 'Air in air: no body – no refraction.',
      plateTitle: 'Parallel-sided plate (d = 2 cm)',
      prismOptTitle: 'Prism',
      depthTitle: 'Apparent depth',
      parallel: 'Emerging ray ∥ incident ray',
      shiftLine: 'Δ = d · sin(α − β)/cos β = {d} cm',
      betaLine: 'β = {b}° inside',
      devLine: 'δ = α + β_{2} − γ = {a}° + {b}° − {g}° = {d}°',
      devMin: 'minimum deviation δ_{min} = {d}°',
      devTotal: 'total reflection at the second face (α_{2} = {a}°)',
      dispLine: 'n_{red} = {r} · n_{violet} = {v} (Cauchy approximation)',
      dispOnly: 'dispersion only calculated for glass',
      depthLine: 'h′ = h · tan α / tan β = {h} m',
      depthNear: 'nearly vertical: h′ ≈ h · n_{air}/n_{mat} = {h} m',
      depthTotal: 'total reflection – invisible from above',
      fish: 'fish',
      image: 'apparent',
      eye: 'eye',
      screen: 'screen',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const g = surface.g;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (all: string, k: string) => vars[k] ?? all);
    const tx = (de: string, en: string) => (ctx.lang === 'de' ? de : en);
    const n = (v: number, d: number) => fmt.num(v, d);
    const deg1 = (v: number) => fmt.fixed(v, 1);
    const mode = () => p.mode as Mode;
    const app = () => p.app as App;
    const ex = () => p.ex as Ex;
    const mat = () => p.mat as MediumId;
    const nMat = () => MEDIA[mat()];
    const C = {
      a: () => ctx.theme.series[3]!,
      r: () => ctx.theme.series[0]!,
      b: () => ctx.theme.series[2]!,
      crit: () => ctx.theme.series[4]!,
      s: () => ctx.theme.series[5]!,
      p: () => ctx.theme.series[1]!,
    };
    const beamColor = (a: number) => `rgba(${BEAM[0]},${BEAM[1]},${BEAM[2]},${a})`;

    /** Stoffe der optischen Scheibe (in der Messreihe: Luft über der Probe). */
    const media = () => {
      if (mode() === 'measure') return { fromTop: true, n1: 1, n2: SAMPLES[p.x - 1]!.n };
      const fromTop = p.from === 'top';
      const top = MEDIA[p.top as MediumId];
      const bottom = MEDIA[p.bottom as MediumId];
      return { fromTop, n1: fromTop ? top : bottom, n2: fromTop ? bottom : top };
    };

    /* ---------- Zustand ---------- */
    /** Live-Winkel (beim automatischen Schwenken) und angezeigte, weich nachgeführte Werte. */
    let alpha = p.alpha;
    let sweepDir = 1;
    /** Neigung des Lichts beim automatischen Schwenken (Umlenkprisma, Brillant). */
    let ainLive = p.ain;
    let ainDir = 1;
    const sweepsAin = () => mode() === 'total' && app() !== 'fiber';
    const shown = { alpha: p.alpha, n1: media().n1 as number, n2: media().n2 as number, rb: p.rb, ain: p.ain, pa: p.pa, dep: p.dep, deliv: -1, share: -1 };
    let rows: [number, number][] = [];
    let hint: { text: string; until: number } | null = null;
    let split = -1;
    let lastFrame = performance.now();
    let wavePhase = 0;
    let pulse = -1;
    let view: [number, number, number, number] | null = null;
    let viewTarget: [number, number, number, number] | null = null;
    let prevMedia: { top: MediumId; bottom: MediumId } = { top: p.top as MediumId, bottom: p.bottom as MediumId };
    let chartDrag = -1;
    const intro = new Tween(1100, ease.outCubic);
    const fade = new Tween(480, ease.inOutCubic);
    const mediaFade = new Tween(520, ease.inOutCubic);
    const rowPop = new Tween(520, ease.outBack);
    const flash = new Tween(700, ease.outCubic);

    /* ---------- Aufteilung der Bühne ---------- */
    const wide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const SCENE_FRAC: Record<Mode, number> = { ray: 0.56, graph: 0.5, total: 0.6, measure: 0.52, optics: 0.56 };
    const panelsOf = (m: Mode): Kind[] =>
      m === 'ray' ? ['law', 'fresnel'] : m === 'graph' ? ['beta', 'sin'] : m === 'total' ? ['app', app() === 'fiber' ? 'bend' : 'crit'] : m === 'measure' ? ['table', 'fit'] : ['opt', ex() === 'plate' ? 'shift' : ex() === 'prism' ? 'dev' : 'lift'];
    const CHART_KINDS: Kind[] = ['fresnel', 'beta', 'sin', 'bend', 'fit', 'shift', 'dev', 'lift'];
    const splitTarget = () => (wide() ? SCENE_FRAC[mode()] : 0.5);
    const HIDDEN: Rect = { x: -40, y: -40, w: 1, h: 1 };

    function regions(): { scene: Rect; panels: Rect[] } {
      const w = surface.width;
      const h = surface.height;
      const s = split < 0 ? splitTarget() : split;
      const kinds = panelsOf(mode());
      const gap = 10;
      const first = kinds[0] === 'beta' ? 0.5 : kinds[0] === 'table' || (kinds[0] === 'law' && !wide()) ? 0.5 : 0.44;
      const col = (r: Rect): Rect[] => {
        const h1 = Math.round((r.h - gap) * first);
        return [
          { x: r.x, y: r.y, w: r.w, h: h1 },
          { x: r.x, y: r.y + h1 + gap, w: r.w, h: r.h - h1 - gap },
        ];
      };
      if (wide()) {
        const sw = Math.round(w * s);
        return { scene: { x: 0, y: 0, w: sw, h }, panels: col({ x: sw + gap, y: 0, w: w - sw - gap, h }) };
      }
      const sh = Math.round(h * s);
      return { scene: { x: 0, y: 0, w, h: sh }, panels: col({ x: 0, y: sh + gap, w, h: h - sh - gap }) };
    }

    const sp = new Plot(surface, { x: [-1.4, 1.4], y: [-1.4, 1.4], pan: false, zoom: false, controls: false, region: () => regions().scene });
    const charts = [0, 1].map(
      (i) =>
        new Plot(surface, {
          x: [0, 1],
          y: [0, 1],
          equalAspect: false,
          pan: false,
          zoom: false,
          controls: false,
          region: () => (CHART_KINDS.includes(panelsOf(mode())[i]!) ? (regions().panels[i] ?? HIDDEN) : HIDDEN),
          xAxis: { label: '' },
          yAxis: { label: '' },
        }),
    );

    /* ---------- Ergebnisse ---------- */
    function updateReadouts(): void {
      const m = mode();
      const keys = ['angles', 'law', 'critical', 'reflect', 'speed', 'slope', 'app', 'table', 'fit', 'opt'];
      const show: Record<Mode, string[]> = {
        ray: ['angles', 'law', 'critical', 'reflect', 'speed'],
        graph: ['angles', 'law', 'critical', 'slope'],
        total: ['app'],
        measure: ['angles', 'table', 'fit'],
        optics: ['opt'],
      };
      for (const k of keys) if (!show[m].includes(k)) ctx.readout(k, null);
      const { n1, n2 } = media();
      const a = Math.round(alpha);
      const beta = refractionAngle(n1, n2, a);
      const as = fmt.num(a, 0);
      if (m === 'ray' || m === 'graph') {
        ctx.readout('angles', beta === null ? tr('anglesTotal', { a: as }) : tr('angles', { a: as, b: fmt.num(beta, 1) }));
        ctx.readout(
          'law',
          beta === null
            ? { html: `<var>n</var><sub>1</sub> · sin α = ${fmt.fixed(n1, 2)} · sin ${as}° ≈ ${fmt.fixed(n1 * Math.sin(toRad(a)), 3)} &gt; ${fmt.fixed(n2, 2)} = <var>n</var><sub>2</sub> · sin 90°` }
            : { html: `<var>n</var><sub>1</sub> · sin α = <var>n</var><sub>2</sub> · sin β: &nbsp;${fmt.fixed(n1, 2)} · sin ${as}° ≈ ${fmt.fixed(n1 * Math.sin(toRad(a)), 3)} ≈ ${fmt.fixed(n2, 2)} · sin ${fmt.num(beta, 1)}°` },
        );
        const c = criticalAngle(n1, n2);
        ctx.readout('critical', c === null ? ctx.t('none') : { html: `α<sub>G</sub> = arcsin(${fmt.fixed(n2, 2)} / ${fmt.fixed(n1, 2)}) ≈ ${fmt.num(c, 1)}°` });
      }
      if (m === 'ray') {
        const f = fresnel(n1, n2, a);
        const brew = brewsterAngle(n1, n2);
        ctx.readout(
          'reflect',
          f.total
            ? ctx.t('totalText')
            : { html: `${tr('reflectText', { r: fmt.num(f.R * 100, 1), t: fmt.num(f.T * 100, 1) })}<br><var>R</var><sub>s</sub> = ${fmt.num(f.rs * 100, 1)} %, <var>R</var><sub>p</sub> = ${fmt.num(f.rp * 100, 1)} % · Brewster-${tx('Winkel', 'angle')} arctan(${n(n2, 2)}/${n(n1, 2)}) ≈ ${fmt.num(brew, 1)}°` },
        );
        const top = MEDIA[p.top as MediumId];
        const bottom = MEDIA[p.bottom as MediumId];
        ctx.readout('speed', tr('speedText', { top: fmt.num(lightSpeed(top), 0), bottom: fmt.num(lightSpeed(bottom), 0) }));
      }
      if (m === 'graph') ctx.readout('slope', { html: `sin β / sin α = <var>n</var><sub>1</sub>/<var>n</var><sub>2</sub> = ${fmt.fixed(n1, 2)}/${fmt.fixed(n2, 2)} ≈ ${fmt.fixed(n1 / n2, 3)}` });
      if (m === 'measure') {
        const b = beta === null ? 0 : readAngle(beta);
        ctx.readout('angles', tr('anglesMeasure', { a: as, b: fmt.num(b, 1) }));
        if (!rows.length) ctx.readout('table', ctx.t('emptyRows'));
        else {
          const head = `<tr><th>${ctx.t('thNo')}</th><th>α</th><th>β</th><th>sin α</th><th>sin β</th></tr>`;
          const body = rows.map(([x, y], i) => `<tr${i === rows.length - 1 ? ' class="is-current"' : ''}><td>${i + 1}</td><td>${fmt.num(x, 0)}°</td><td>${fmt.num(y, 1)}°</td><td>${fmt.fixed(Math.sin(toRad(x)), 3)}</td><td>${fmt.fixed(Math.sin(toRad(y)), 3)}</td></tr>`).join('');
          ctx.readout('table', { html: `<table class="mini-table">${head}${body}</table>` });
        }
        const nn = indexFromSeries(rows);
        const s = SAMPLES[p.x - 1]!;
        ctx.readout('fit', nn === null ? ctx.t('emptyFit') : { html: `sin β = <var>k</var> · sin α mit <var>k</var> ≈ ${fmt.fixed(1 / nn, 3)} → <var>n</var> = 1/<var>k</var> ≈ <strong>${fmt.fixed(nn, 2)}</strong> · ${tx('Tabellenwert', 'table value')} ${s[ctx.lang]} ${n(s.n, 2)}` });
      }
      if (m === 'total') ctx.readout('app', { html: appLines().join('<br>') });
      if (m === 'optics') ctx.readout('opt', { html: optLines(true).join('<br>') });
      ctx.setAction('measure', { enabled: !ctx.locked && rows.length < MAX_ROWS });
      ctx.setAction('clear', { enabled: !ctx.locked && rows.length > 0 });
    }

    /** Zeilen der Karte (und des Ergebnisses) in der Ansicht „Totalreflexion“. */
    function appLines(): string[] {
      const html = (s: string) => s.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>');
      const out: string[] = [];
      const nc = nMat();
      if (app() === 'fiber') {
        const ncl = MEDIA[p.clad as MediumId];
        const c = criticalAngle(nc, ncl);
        out.push(html(c === null ? ctx.t('critNone') : tr('critLine', { n2: fmt.fixed(ncl, 2), n1: fmt.fixed(nc, 2), g: n(c, 1) })));
        const acc = acceptanceAngle(nc, ncl);
        if (acc !== null) out.push(html(acc >= 90 ? ctx.t('acceptAll') : tr('accept', { a: n(acc, 1) })));
        out.push(tr('bendLine', { r: n(p.rb, 1), k: n(p.rb / FIBER.d, 1) }));
        out.push(`${fmt.num(fiberDelivery({ ...FIBER, R: p.rb }, p.ain, nc, ncl) * 100, 0)} % ${ctx.t('arrive')}`);
      } else if (app() === 'prism') {
        const c = criticalAngle(nc, 1);
        out.push(html(c === null ? ctx.t('critNone') : tr('critLine', { n2: fmt.fixed(1, 2), n1: n(nc, 2), g: n(c, 1) })));
        const st = prismStats(p.ain);
        out.push(tr('hitHyp', { a: n(st.hyp, 1) }));
        out.push(`${fmt.num(st.out * 100, 0)} % ${ctx.t('deflect')} · ${fmt.num(st.leak * 100, 0)} % ${ctx.t('leakHyp')}`);
      } else {
        const c = criticalAngle(nc, 1);
        out.push(html(c === null ? ctx.t('critNone') : tr('critLine', { n2: fmt.fixed(1, 2), n1: n(nc, 2), g: n(c, 1) })));
        const st = gemStats(p.ain);
        out.push(`${fmt.num(st.top * 100, 0)} % ${ctx.t('sparkle')} · ${fmt.num(st.bottom * 100, 0)} % ${ctx.t('lost')}`);
      }
      return out;
    }

    /** Zeilen der Karte (und des Ergebnisses) in der Ansicht „Platte, Prisma, Hebung“. */
    function optLines(exact: boolean): string[] {
      const html = (s: string) => (exact ? s.replace(/_\{([^}]*)\}/g, '<sub>$1</sub>') : s);
      const a = exact ? p.alpha : shown.alpha;
      const nm = nMat();
      if (ex() === 'plate') {
        const b = refractionAngle(1, nm, a)!;
        return [tr('shiftLine', { d: fmt.fixed(plateShift(a, nm, 1, 2), 2) }), tr('betaLine', { b: deg1(b) }), ctx.t('parallel')];
      }
      if (ex() === 'prism') {
        const gam = exact ? p.pa : shown.pa;
        const path = prismPath(gam, a, nm);
        const out = [path ? html(tr('devLine', { a: deg1(a), b: deg1(path.beta2), g: deg1(gam), d: deg1(path.delta) })) : html(tr('devTotal', { a: deg1(gam - refractionAngle(1, nm, a)!) }))];
        const dm = minDeviation(gam, nm);
        if (dm !== null) out.push(html(tr('devMin', { d: deg1(dm) })));
        if (p.disp) out.push(mat() === 'glas' ? html(tr('dispLine', { r: fmt.fixed(cauchyIndex(660), 3), v: fmt.fixed(cauchyIndex(410), 3) })) : ctx.t('dispOnly'));
        return out;
      }
      const h = exact ? p.dep : shown.dep;
      const hp = apparentDepth(h, nm, 1, a);
      return [hp === null ? ctx.t('depthTotal') : tr('depthLine', { h: fmt.fixed(hp, 2) }), html(tr('depthNear', { h: fmt.fixed((h * 1) / nm, 2) }))];
    }

    /* ---------- Zeichenhilfen (Texte mit tiefgestellten Teilen: „n_{1}“) ---------- */
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
      return parts(str).reduce((w, q) => {
        g.font = `${weight} ${q.sub ? Math.round(size * 0.74) : size}px ${ctx.theme.font}`;
        return w + g.measureText(q.t).width;
      }, 0);
    }

    function richText(str: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'center', halo = true, weight = 700): number {
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

    /** Text auf höchstens maxW Pixel gekürzt (mit „…“). */
    function fitText(str: string, maxW: number, size: number, weight = 700): string {
      if (richWidth(str, size, weight) <= maxW) return str;
      let s = str;
      while (s.length > 4 && richWidth(`${s}…`, size, weight) > maxW) s = s.slice(0, -1);
      return `${s.trimEnd()}…`;
    }

    function pill(x: number, y: number, label: string, color: string, align: 'left' | 'right' | 'center', size = 12, solid?: string): { w: number; h: number } {
      const theme = ctx.theme;
      const w = richWidth(label, size) + 16;
      const h = size + 11;
      const x0 = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      g.save();
      softShadow(g, theme.dark, 6, 1);
      g.fillStyle = solid ?? (theme.dark ? 'rgba(16,22,31,0.92)' : 'rgba(255,255,255,0.95)');
      roundRect(g, x0, y, w, h, h / 2);
      g.fill();
      g.restore();
      if (!solid) {
        g.strokeStyle = withAlpha(color, 0.5);
        g.lineWidth = 1;
        roundRect(g, x0 + 0.5, y + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      richText(label, x0 + w / 2, y + h / 2 + 0.5, size, solid ? '#ffffff' : color, 'center', false);
      return { w, h };
    }

    function frame(r: Rect): void {
      g.save();
      g.strokeStyle = ctx.theme.dark ? '#273142' : '#dfe4ec';
      g.lineWidth = 1.2;
      roundRect(g, r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1, 12);
      g.stroke();
      g.restore();
    }

    function card(r: Rect): void {
      const theme = ctx.theme;
      g.save();
      softShadow(g, theme.dark, 12, 3);
      g.fillStyle = theme.bg;
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      frame(r);
    }

    function titleChip(R: Rect, label: string, color: string, right?: string, rightColor?: string): void {
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const x = R.x + 8;
      const y = R.y + 6;
      const lab = fitText(label, R.w - 30, fs);
      const w = richWidth(lab, fs) + 14;
      g.fillStyle = ctx.theme.dark ? 'rgba(16,22,31,0.9)' : 'rgba(255,255,255,0.94)';
      roundRect(g, x, y, w, fs + 9, 6);
      g.fill();
      richText(lab, x + 7, y + (fs + 9) / 2 + 0.5, fs, color, 'left', false);
      if (right) {
        const wr = richWidth(right, fs - 0.5, 600);
        if (x + w + wr + 16 < R.x + R.w) richText(right, R.x + R.w - 10, y + (fs + 9) / 2 + 0.5, fs - 0.5, rightColor ?? ctx.theme.muted, 'right', false, 600);
      }
    }

    const chartPad = (R: Rect) => {
      const small = R.w < 300 || R.h < 170;
      return { left: small ? 38 : 46, right: small ? 12 : 16, top: small ? 30 : 36, bottom: small ? 24 : 28 };
    };

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

    /** Leuchtender Lichtstrahl (Pixel); strength 0…1 steuert Deckkraft und Leuchten. */
    function beam(x1: number, y1: number, x2: number, y2: number, strength: number, opts: { arrow?: boolean; color?: [number, number, number]; width?: number; fadeOut?: boolean } = {}): void {
      const a = clamp(strength, 0, 1);
      if (a < 0.02 || Math.hypot(x2 - x1, y2 - y1) < 0.5) return;
      const [r0, g0, b0] = opts.color ?? [BEAM[0], BEAM[1], BEAM[2]];
      const col = (k: number) => `rgba(${r0},${g0},${b0},${k})`;
      g.save();
      g.lineCap = 'round';
      if (opts.fadeOut) {
        const grad = g.createLinearGradient(x1, y1, x2, y2);
        grad.addColorStop(0, col(a));
        grad.addColorStop(1, col(0));
        g.strokeStyle = grad;
      } else g.strokeStyle = col(a);
      g.shadowColor = col(0.85 * a);
      g.shadowBlur = 12;
      g.lineWidth = opts.width ?? 4;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.shadowBlur = 0;
      if (!opts.fadeOut) {
        g.strokeStyle = `rgba(255,240,234,${0.8 * a})`;
        g.lineWidth = Math.max(1, (opts.width ?? 4) * 0.35);
        g.stroke();
      }
      g.restore();
      if (opts.arrow !== false && Math.hypot(x2 - x1, y2 - y1) > 34) arrowHead((x1 + x2) / 2, (y1 + y2) / 2, Math.atan2(y2 - y1, x2 - x1), 11, col(a));
    }

    /** Winkelbogen um (cx, cy) vom Bildschirmwinkel `from` um `d` (Bogenmaß, Pixel). */
    function angleArc(cx: number, cy: number, r: number, from: number, d: number, color: string): void {
      if (Math.abs(d) < 0.004) return;
      g.save();
      g.fillStyle = withAlpha(color, 0.16);
      g.beginPath();
      g.moveTo(cx, cy);
      g.arc(cx, cy, r, from, from + d, d < 0);
      g.closePath();
      g.fill();
      g.strokeStyle = color;
      g.lineWidth = 2.2;
      g.beginPath();
      g.arc(cx, cy, r, from, from + d, d < 0);
      g.stroke();
      g.restore();
    }
    /** Vorzeichenbehafteter Winkel von `from` nach `to` (−π … π). */
    const sweepOf = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
    /** Bildschirmwinkel eines Richtungsvektors in Weltkoordinaten (y nach oben). */
    const scr = (v: V2) => Math.atan2(-v[1], v[0]);

    function drawLaser(x: number, y: number, ang: number, small: boolean): void {
      const len = small ? 46 : 74;
      const hgt = small ? 15 : 20;
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      softShadow(g, ctx.theme.dark, 8, 2);
      const photo = ctx.images.get('laser');
      if (photo) {
        const ph = (len * photo.height) / photo.width;
        g.drawImage(scaledSprite(photo, len, ph, surface.dpr), -len, -LASER_IMG.noseY * (ph / photo.height), len, ph);
        g.restore();
        return;
      }
      const body = g.createLinearGradient(0, -hgt / 2, 0, hgt / 2);
      body.addColorStop(0, '#5b6270');
      body.addColorStop(0.45, '#b7bfcc');
      body.addColorStop(1, '#3d434e');
      g.fillStyle = body;
      roundRect(g, -len, -hgt / 2, len, hgt, 6);
      g.fill();
      g.shadowColor = 'transparent';
      g.fillStyle = '#2b2f36';
      g.fillRect(-7, -hgt / 2 + 3, 7, hgt - 6);
      g.fillStyle = '#ff3b30';
      g.beginPath();
      g.arc(-len * 0.62, 0, 3.5, 0, TAU);
      g.fill();
      g.restore();
    }
    const laserLen = () => (sceneSmall() ? 46 : 74);
    const sceneSmall = () => regions().scene.w < 520;

    /** Stoffe färben (Glas, Wasser …); Luft bleibt klar. */
    function tintFill(id: MediumId | 'sample', alpha = 1): string {
      const [c, a] = id === 'sample' ? SAMPLE_TINT : TINT[id];
      return withAlpha(c, (ctx.theme.dark ? a * 1.35 : a) * alpha);
    }

    /** Lichtfleck an einem Auftreffpunkt (Pixel). */
    function spot(x: number, y: number, r: number, a: number): void {
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(255,240,235,${0.95 * a})`);
      grad.addColorStop(0.35, beamColor(0.55 * a));
      grad.addColorStop(1, beamColor(0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }

    /* =================================================================== */
    /* Optische Scheibe (Brechung, Snellius-Diagramm, Messreihe)            */
    /* =================================================================== */

    /** Punkt auf dem einfallenden Strahl im Abstand d vom Auftreffpunkt (Laser links). */
    function laserPoint(d: number, a = shown.alpha): Pt {
      const s = media().fromTop ? 1 : -1;
      return [-d * Math.sin(toRad(a)), s * d * Math.cos(toRad(a))];
    }

    /** Hinweise in der Szene (Sonderfälle); nur, wenn sie wirklich zutreffen. */
    function discHints(n1: number, n2: number, a: number, beta: number | null): { text: string; color: string; solid?: boolean }[] {
      const out: { text: string; color: string; solid?: boolean }[] = [];
      const theme = ctx.theme;
      if (hint && hint.until > performance.now()) out.push({ text: hint.text, color: theme.series[1]! });
      if (mode() === 'measure') {
        if (Math.round(a) === 0) out.push({ text: ctx.t('zeroAngle'), color: C.crit() });
        return out;
      }
      if (beta === null) out.push({ text: ctx.t('total'), color: C.crit(), solid: true });
      if (Math.abs(n1 - n2) < 1e-6) out.push({ text: ctx.t('hSame'), color: C.crit() });
      else if (Math.round(a) === 0) out.push({ text: ctx.t('hZero'), color: C.crit() });
      const c = criticalAngle(n1, n2);
      if (c !== null && beta !== null && c - a <= 3 && c - a > 0) out.push({ text: ctx.t('hGrazing'), color: C.crit() });
      if (p.intensity && mode() === 'ray' && Math.abs(n1 - n2) > 1e-6 && beta !== null && Math.abs(a - brewsterAngle(n1, n2)) < 0.75) out.push({ text: ctx.t('hBrewster'), color: C.p() });
      return out.slice(0, 2);
    }

    function drawDisc(r: Rect): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = r.w < 520;
      const meas = mode() === 'measure';
      sp.setRangePadded([-1.36, 1.36], [-1.36, 1.36], { top: 6, bottom: 6, left: 6, right: 6 });
      sp.begin();
      const R = sp.scale.x;
      const [cx, cy] = sp.toPx(0, 0);
      const { fromTop } = media();
      const s = fromTop ? 1 : -1;
      const n1 = shown.n1;
      const n2 = shown.n2;
      const a = shown.alpha;
      const beta = refractionAngle(n1, n2, a);
      const f = fresnel(n1, n2, a);
      const it = intro.running ? intro.t : 1;
      const grow1 = clamp(it / 0.45, 0, 1);
      const grow2 = clamp((it - 0.4) / 0.6, 0, 1);
      // Tisch und Stoffe oben/unten
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#141b26' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0f151e' : '#e2e8f0');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
      const topId: MediumId | 'sample' = meas ? 'luft' : (p.top as MediumId);
      const botId: MediumId | 'sample' = meas ? 'sample' : (p.bottom as MediumId);
      const half = (id: MediumId | 'sample', y0: number, y1: number, k: number) => {
        g.fillStyle = tintFill(id, k);
        g.fillRect(r.x, y0, r.w, y1 - y0);
      };
      if (mediaFade.running && !meas) {
        half(prevMedia.top, r.y, cy, 1 - mediaFade.value);
        half(prevMedia.bottom, cy, r.y + r.h, 1 - mediaFade.value);
        half(topId, r.y, cy, mediaFade.value);
        half(botId, cy, r.y + r.h, mediaFade.value);
      } else {
        half(topId, r.y, cy, 1);
        half(botId, cy, r.y + r.h, 1);
      }
      // Scheibe
      g.save();
      softShadow(g, dark, 18, 5);
      g.fillStyle = dark ? 'rgba(43,52,67,0.55)' : 'rgba(255,255,255,0.55)';
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = dark ? 'rgba(255,255,255,0.2)' : 'rgba(30,40,55,0.3)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.stroke();
      // Grenzfläche
      g.strokeStyle = theme.text;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x, cy);
      g.lineTo(r.x + r.w, cy);
      g.stroke();
      // Richtungen (Welt) und Bildschirmwinkel
      const inDir: V2 = [Math.sin(toRad(a)), -s * Math.cos(toRad(a))];
      const fromLaser: V2 = [-inDir[0], -inDir[1]];
      const refl: V2 = [Math.sin(toRad(a)), s * Math.cos(toRad(a))];
      const refr: V2 | null = beta === null ? null : [Math.sin(toRad(beta)), -s * Math.cos(toRad(beta))];
      const nIn = scr([0, s]);
      const nOut = scr([0, -s]);
      const r0 = clamp(R * 0.3, small ? 36 : 44, 70);
      const size = small ? 11 : 12;
      // Beschriftungen der Winkel vorab planen (die Skala weicht ihnen aus)
      const tags: { txt: string; color: string; x: number; y: number; w: number }[] = [];
      const showArcs = !intro.running || it > 0.85;
      if (showArcs && a > 0.5) {
        const items: [string, string, number, number, number][] = [[`α = ${deg1(a)}°`, C.a(), sweepOf(nIn, scr(fromLaser)), nIn, r0]];
        if (!meas) items.push([`α′ = ${deg1(a)}°`, C.r(), sweepOf(nIn, scr(refl)), nIn, r0 * 0.78]);
        if (refr && beta! > 0.5) items.push([`β = ${meas ? '?' : deg1(beta!)}°`, C.b(), sweepOf(nOut, scr(refr)), nOut, r0]);
        for (const [t, col, d, base, rr] of items) {
          const w = richWidth(t, size) + 16;
          const mid = base + d / 2;
          const rl = r0 + (small ? 30 : 34);
          if (Math.abs(d) * rl > w * 0.75 + 12) tags.push({ txt: t, color: col, x: cx + Math.cos(mid) * rl, y: cy + Math.sin(mid) * rl, w });
          else {
            // kleine Winkel: neben dem Lot, auf der Seite des Strahls
            const side = Math.cos(mid) < 0 ? -1 : 1;
            tags.push({ txt: t, color: col, x: cx + side * (w / 2 + 8), y: cy + Math.sin(base) * (r0 + 30), w });
          }
          angleArc(cx, cy, rr, base, d, col);
        }
      }
      // Winkelmesser (Zahlen zum Lot, 0° oben und unten)
      if (p.scale) {
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.55);
        const rays = [scr(fromLaser), scr(refl), nIn, nOut, ...(refr ? [scr(refr)] : [])];
        const lf = `600 ${small ? 10.5 : 11}px ${theme.font}`;
        for (let d = 0; d < 360; d += 5) {
          const ang = toRad(d);
          const len = d % 10 === 0 ? 12 : 6;
          g.lineWidth = d % 10 === 0 ? 1.4 : 0.9;
          g.beginPath();
          g.moveTo(cx + Math.sin(ang) * R, cy - Math.cos(ang) * R);
          g.lineTo(cx + Math.sin(ang) * (R - len), cy - Math.cos(ang) * (R - len));
          g.stroke();
          if (d % 30 !== 0 || d % 180 === 90) continue;
          const lx = cx + Math.sin(ang) * (R - 25);
          const ly = cy - Math.cos(ang) * (R - 25);
          const sa = Math.atan2(ly - cy, lx - cx);
          if (rays.some((b) => Math.abs(sweepOf(b, sa)) * (R - 25) < 12)) continue;
          if (tags.some((t) => Math.abs(t.x - lx) < t.w / 2 + 14 && Math.abs(t.y - ly) < 20)) continue;
          const fromNormal = Math.min(d % 180, 180 - (d % 180));
          text(g, `${fromNormal}°`, lx, ly, { font: lf, color: theme.muted });
        }
        g.restore();
      }
      // Lot
      g.save();
      g.strokeStyle = theme.text;
      g.globalAlpha = 0.75;
      g.setLineDash([7, 6]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx, cy - R * 1.1);
      g.lineTo(cx, cy + R * 1.1);
      g.stroke();
      g.restore();
      richText(ctx.t('normal'), cx + 8, cy - s * R * 1.12, 12, theme.muted, 'left', true, 600);
      // Grenzwinkel
      const c = criticalAngle(n1, n2);
      if (p.critical && c !== null && !meas) {
        g.save();
        g.strokeStyle = C.crit();
        g.setLineDash([3, 4]);
        g.lineWidth = 1.6;
        for (const side of [-1, 1]) {
          g.beginPath();
          g.moveTo(cx, cy);
          g.lineTo(cx + side * Math.sin(toRad(c)) * R, cy - s * Math.cos(toRad(c)) * R);
          g.stroke();
        }
        g.restore();
        const [qx, qy] = [cx + Math.sin(toRad(c)) * R * 1.03, cy - s * Math.cos(toRad(c)) * R * 1.03];
        richText(`α_{G} = ${deg1(c)}°`, Math.min(qx + 6, r.x + r.w - 6 - richWidth(`α_{G} = ${deg1(c)}°`, 12)), qy - s * 10, 12, C.crit(), 'left', true, 700);
      }
      // Wellenfronten (Huygens)
      if (p.wave && mode() === 'ray') drawWaves(cx, cy, R, inDir, refl, refr, n1, n2, s, f.R);
      // Strahlen mit Helligkeit nach Fresnel-Anteil
      const strength = (x: number) => (p.intensity ? 0.15 + 0.85 * x : 1);
      const lp = laserPoint(LASER_R);
      const [lx, ly] = sp.toPx(lp[0], lp[1]);
      beam(lx, ly, lerp(lx, cx, grow1), lerp(ly, cy, grow1), 1);
      if (grow2 > 0) {
        const L1 = R * 1.12 * grow2;
        if (!meas || p.intensity) beam(cx, cy, cx + refl[0] * L1, cy - refl[1] * L1, strength(f.R) * (meas ? 0.8 : 1));
        if (refr) beam(cx, cy, cx + refr[0] * L1, cy - refr[1] * L1, strength(f.T));
        spot(cx, cy, 15, grow2);
      }
      for (const t of tags) pill(t.x - t.w / 2, t.y - (size + 11) / 2, t.txt, t.color, 'left', size);
      drawLaser(lx, ly, Math.atan2(cy - ly, cx - lx), small);
      // Stoffe beschriften
      const labelMedium = (id: MediumId | 'sample', y: number, top: boolean) => {
        const nOwn = top ? (fromTop ? n1 : n2) : fromTop ? n2 : n1;
        const nOther = top ? (fromTop ? n2 : n1) : fromTop ? n1 : n2;
        const name = id === 'sample' ? tr('sample', { x: String(p.x) }) : `${MEDIUM_NAME[id][ctx.lang]} · n = ${fmt.fixed(MEDIA[id], 2)}`;
        const sub = id === 'sample' ? ctx.t('sampleN') : nOwn > nOther + 1e-6 ? ctx.t('denser') : nOwn < nOther - 1e-6 ? ctx.t('thinner') : '';
        richText(name, r.x + r.w - 12, y, small ? 12 : 13, theme.text, 'right', true, 700);
        if (sub) richText(sub, r.x + r.w - 12, y + (top ? 17 : -17), small ? 11 : 12, theme.muted, 'right', true, 600);
      };
      labelMedium(topId, r.y + 16, true);
      labelMedium(botId, r.y + r.h - 16, false);
      // Hinweise
      // Hinweise links oben; neben der Beschriftung des oberen Stoffs (schmal: darunter)
      const topW = richWidth(`${MEDIUM_NAME[topId][ctx.lang]} · n = ${fmt.fixed(MEDIA[topId], 2)}`, small ? 12 : 13);
      const room = r.w - topW - 40;
      const below = room < r.w * 0.55;
      let hy = below ? r.y + 46 : r.y + 8;
      for (const h of discHints(n1, n2, a, beta)) {
        const label = fitText(h.text, below ? r.w - 30 : room, size);
        pill(r.x + 8, hy, label, h.color, 'left', size, h.solid ? withAlpha(h.color, 0.95) : undefined);
        hy += size + 17;
      }
      sp.end();
    }

    /**
     * Wellenfronten: senkrecht zur Ausbreitung, Abstand λ₁ bzw. λ₂ = λ₁ · n₁/n₂.
     * Auf der Grenzfläche passen die Fronten genau zusammen (daraus folgt das Brechungsgesetz).
     */
    function drawWaves(cx: number, cy: number, R: number, inDir: V2, refl: V2, refr: V2 | null, n1: number, n2: number, s: number, Rr: number): void {
      const lam1 = R * 0.1;
      const band = R * 0.5;
      const ph = wavePhase % 1;
      const ca = Math.abs(inDir[1]);
      /** Breites Bündel mit Wellenfronten; abgeschnitten an der Grenzfläche (Halbebene des Stoffs). */
      const draw = (d: V2, lam: number, width: number, upper: boolean, alpha: number) => {
        const r = regions().scene;
        g.save();
        g.beginPath();
        if (upper) g.rect(r.x, r.y, r.w, cy - r.y);
        else g.rect(r.x, cy, r.w, r.y + r.h - cy);
        g.clip();
        const dx = d[0];
        const dy = -d[1];
        const px = -dy;
        const py = dx;
        const from = -R * 1.25;
        const to = R * 1.12;
        g.fillStyle = beamColor(0.1 * alpha);
        g.beginPath();
        g.moveTo(cx + dx * from + (px * width) / 2, cy + dy * from + (py * width) / 2);
        g.lineTo(cx + dx * to + (px * width) / 2, cy + dy * to + (py * width) / 2);
        g.lineTo(cx + dx * to - (px * width) / 2, cy + dy * to - (py * width) / 2);
        g.lineTo(cx + dx * from - (px * width) / 2, cy + dy * from - (py * width) / 2);
        g.closePath();
        g.fill();
        g.strokeStyle = beamColor(0.7 * alpha);
        g.lineWidth = 1.5;
        g.lineCap = 'round';
        for (let k = Math.floor(from / lam) - 1; k <= Math.ceil(to / lam) + 1; k++) {
          const t = (k + ph) * lam;
          if (t < from || t > to) continue;
          g.beginPath();
          g.moveTo(cx + dx * t + (px * width) / 2, cy + dy * t + (py * width) / 2);
          g.lineTo(cx + dx * t - (px * width) / 2, cy + dy * t - (py * width) / 2);
          g.stroke();
        }
        g.restore();
      };
      // Einfallendes Bündel im Stoff des Lasers, gebrochenes Bündel mit gleicher Spur auf der Grenzfläche
      draw(inDir, lam1, band, s > 0, 1);
      if (refr) draw(refr, lam1 * (n1 / n2), (band * Math.abs(refr[1])) / Math.max(1e-6, ca), s < 0, 0.45 + 0.55 * (1 - Rr));
      if (p.intensity && Rr > 0.08) draw(refl, lam1, band, s > 0, Rr * 0.8);
    }

    /* =================================================================== */
    /* Totalreflexion: Glasfaser, Umlenkprisma, Brillant                    */
    /* =================================================================== */

    let fiberCache: { key: string; res: TraceResult[]; deliv: number } | null = null;
    function fiberTraces(): { res: TraceResult[]; deliv: number } {
      const key = `${mat()}|${p.clad}|${shown.ain.toFixed(3)}|${shown.rb.toFixed(4)}`;
      if (!fiberCache || fiberCache.key !== key) {
        const f = { ...FIBER, R: shown.rb };
        const nc = nMat();
        const ncl = MEDIA[p.clad as MediumId];
        fiberCache = { key, res: [-0.28, 0, 0.28].map((y0) => traceFiber(f, shown.ain, nc, ncl, y0)), deliv: fiberDelivery(f, shown.ain, nc, ncl) };
      }
      return fiberCache;
    }

    let bendCache: { key: string; pts: Pt[] } | null = null;
    function bendCurve(): Pt[] {
      const key = `${mat()}|${p.clad}|${p.ain}`;
      if (!bendCache || bendCache.key !== key) {
        const pts: Pt[] = [];
        for (let R = 1; R <= 15.0001; R += 0.25) pts.push([R, 100 * fiberDelivery({ ...FIBER, R }, p.ain, nMat(), MEDIA[p.clad as MediumId])]);
        bendCache = { key, pts };
      }
      return bendCache.pts;
    }

    const statCache = new Map<string, unknown>();
    function memo<T>(key: string, make: () => T): T {
      if (!statCache.has(key)) {
        if (statCache.size > 40) statCache.clear();
        statCache.set(key, make());
      }
      return statCache.get(key) as T;
    }

    function prismStats(ain: number): { out: number; leak: number; hyp: number; res: TraceResult[] } {
      return memo(`p|${mat()}|${ain.toFixed(3)}`, () => prismStatsRaw(ain));
    }
    function prismStatsRaw(ain: number): { out: number; leak: number; hyp: number; res: TraceResult[] } {
      const t = toRad(ain);
      const d: V2 = [Math.cos(t), -Math.sin(t)];
      const res = PRISM_Y.map((y) => traceShape(prismEdges(4), nMat(), 1, [-3 * d[0], y - 3 * d[1]], d, { minI: 0.004 }));
      const hypSeg = res[1]!.segs.find((q) => q.inside && q.tag === 'hyp');
      return { out: res.reduce((s, q) => s + (q.left.out ?? 0), 0) / 3, leak: res.reduce((s, q) => s + (q.left.hyp ?? 0), 0) / 3, hyp: hypSeg ? hypSeg.angle : 0, res };
    }

    function gemStats(ain: number): { top: number; bottom: number; res: TraceResult[] } {
      return memo(`g|${mat()}|${ain.toFixed(3)}`, () => gemStatsRaw(ain));
    }
    function gemStatsRaw(ain: number): { top: number; bottom: number; res: TraceResult[] } {
      const t = toRad(ain);
      const d: V2 = [Math.sin(t), -Math.cos(t)];
      const top = gemOutline()[0]![1];
      const res = GEM_X.map((x) => traceShape(gemEdges(), nMat(), 1, [x - 1.4 * d[0], top - 1.4 * d[1]], d, { minI: 0.002, maxSegs: 700 }));
      const enter = fresnel(1, nMat(), Math.abs(ain)).T;
      const sum = (k: string) => res.reduce((s, q) => s + (q.left[k] ?? 0), 0) / 3 / Math.max(1e-9, enter);
      return { top: sum('top'), bottom: sum('bottom'), res };
    }

    /** Erster Auftreffwinkel des mittleren Strahls auf der Unterseite des Brillanten. */
    function gemPavilionAngle(): number {
      const hit = gemStats(shown.ain).res[1]!.segs.find((q) => q.inside && q.tag === 'bottom');
      return hit ? hit.angle : 40.75;
    }

    /** Sichtbaren Ausschnitt weich nachführen (z. B. wenn sich die Faser stärker biegt). */
    function glideView(target: [number, number, number, number], dt: number): [number, number, number, number] {
      viewTarget = target;
      if (!view || prefersReducedMotion()) view = target;
      else {
        const u = 1 - Math.exp(-dt * 9);
        view = view.map((v, i) => lerp(v, target[i]!, u)) as [number, number, number, number];
        if (view.every((v, i) => Math.abs(v - target[i]!) < 1e-3)) view = target;
      }
      return view;
    }

    /** Hintergrund der Anwendungs-Szenen (Labortisch). */
    function benchBg(r: Rect): void {
      const dark = ctx.theme.dark;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#121925' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0d131c' : '#e1e7ef');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
    }

    /** Lichtwege eines verfolgten Strahls zeichnen (schwache Anteile blass, austretende Strahlen verblassen). */
    function drawTrace(res: TraceResult, weight: number, opts: { color?: [number, number, number]; width?: number; outLen?: number } = {}): void {
      const outLen = opts.outLen ?? 2.2;
      for (const sg of res.segs) {
        if (sg.I < 0.015) continue;
        let b = sg.b;
        const free = sg.tag === null;
        if (free) {
          const dx = sg.b[0] - sg.a[0];
          const dy = sg.b[1] - sg.a[1];
          const l = Math.hypot(dx, dy) || 1;
          b = [sg.a[0] + (dx / l) * outLen, sg.a[1] + (dy / l) * outLen];
        }
        const [x1, y1] = sp.toPx(sg.a[0], sg.a[1]);
        const [x2, y2] = sp.toPx(b[0], b[1]);
        const k = p.intensity ? 0.12 + 0.88 * sg.I : 1;
        beam(x1, y1, x2, y2, k * weight, { color: opts.color, width: opts.width ?? 3.4, fadeOut: free && sg.inside === false && sg.parent >= 0, arrow: !free && sg.parent < 0 });
      }
    }

    /** Umriss eines Körpers aus Strecken und Bögen als Pfad (Pixel). */
    function shapePath(edges: Edge[]): void {
      g.beginPath();
      edges.forEach((e, i) => {
        if (e.kind === 'seg') {
          const [ax, ay] = sp.toPx(e.a[0], e.a[1]);
          const [bx, by] = sp.toPx(e.b[0], e.b[1]);
          if (i === 0) g.moveTo(ax, ay);
          else g.lineTo(ax, ay);
          g.lineTo(bx, by);
        } else {
          // Bögen in der Reihenfolge der Kanten: außen gegen den Uhrzeigersinn rückwärts, innen vorwärts
          const steps = 36;
          const outer = i < edges.length / 2;
          for (let k = 0; k <= steps; k++) {
            const t = outer ? e.to - ((e.to - e.from) * k) / steps : e.from + ((e.to - e.from) * k) / steps;
            const [x, y] = sp.toPx(e.c[0] + e.r * Math.cos(t), e.c[1] + e.r * Math.sin(t));
            g.lineTo(x, y);
          }
        }
      });
      g.closePath();
    }

    /** Glaskörper mit Verlauf, Glanzkante und Schatten. */
    function glassBody(edges: Edge[], id: MediumId, alpha = 1): void {
      const theme = ctx.theme;
      g.save();
      g.globalAlpha *= alpha;
      softShadow(g, theme.dark, 14, 4);
      shapePath(edges);
      const [c, a] = TINT[id];
      g.fillStyle = withAlpha(c, Math.max(0.12, (theme.dark ? a * 1.5 : a * 1.25) + 0.08));
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha *= alpha;
      shapePath(edges);
      g.strokeStyle = theme.dark ? 'rgba(220,235,255,0.7)' : 'rgba(30,60,90,0.55)';
      g.lineWidth = 1.6;
      g.lineJoin = 'round';
      g.stroke();
      g.restore();
    }

    function drawFiber(r: Rect, dt: number): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const R = shown.rb;
      const x1 = FIBER.L1 + R + FIBER.d;
      const target: [number, number, number, number] = [-4.2, Math.max(x1 + 1.6, 9), -R - FIBER.L2 - 1.4, 3.2];
      const v = glideView(target, dt);
      sp.setRangePadded([v[0], v[1]], [v[2], v[3]], { top: small ? 40 : 46, left: 6, right: 6, bottom: 6 });
      sp.begin();
      benchBg(r);
      const edges = fiberEdges({ ...FIBER, R });
      const clad = p.clad as MediumId;
      // Mantel (falls nicht Luft): als breiter Saum um den Kern
      if (clad !== 'luft') {
        g.save();
        shapePath(edges);
        g.strokeStyle = tintFill(clad, 2.2);
        g.lineWidth = Math.max(8, sp.scale.x * 0.5);
        g.lineJoin = 'round';
        g.stroke();
        g.restore();
      }
      glassBody(edges, mat());
      const { res, deliv } = fiberTraces();
      res.forEach((q, i) => drawTrace(q, i === 1 ? 1 : 0.55, { width: i === 1 ? 3.6 : 2.2, outLen: 2.4 }));
      // Lichtpuls entlang des Hauptwegs
      const mainRes = res[1]!;
      const path = mainPath(mainRes).map((i) => mainRes.segs[i]!).filter((q, k) => k === 0 || q.inside);
      if (pulse >= 0 && path.length) {
        const lens = path.map((q) => Math.hypot(q.b[0] - q.a[0], q.b[1] - q.a[1]));
        let dist = pulse * lens.reduce((s, l) => s + l, 0);
        for (let k = 0; k < path.length; k++) {
          if (dist <= lens[k]! || k === path.length - 1) {
            const q = path[k]!;
            const u = clamp(dist / Math.max(1e-9, lens[k]!), 0, 1);
            const [px, py] = sp.toPx(lerp(q.a[0], q.b[0], u), lerp(q.a[1], q.b[1], u));
            const glow = g.createRadialGradient(px, py, 0, px, py, 22);
            glow.addColorStop(0, 'rgba(255,255,240,1)');
            glow.addColorStop(0.3, beamColor(0.8));
            glow.addColorStop(1, beamColor(0));
            g.fillStyle = glow;
            g.beginPath();
            g.arc(px, py, 22, 0, TAU);
            g.fill();
            break;
          }
          dist -= lens[k]!;
        }
      }
      // Leuchten am Ende (nach Anteil)
      const ex0 = FIBER.L1 + R;
      const [ox, oy] = sp.toPx(ex0, -R - FIBER.L2);
      const shine = (shown.deliv < 0 ? deliv : shown.deliv) * (1 + 0.6 * (flash.running ? 1 - flash.value : 0));
      const glow = g.createRadialGradient(ox, oy, 0, ox, oy, 46);
      glow.addColorStop(0, beamColor(0.65 * Math.min(1, shine)));
      glow.addColorStop(1, beamColor(0));
      g.fillStyle = glow;
      g.beginPath();
      g.arc(ox, oy, 46, 0, TAU);
      g.fill();
      // Auftreffwinkel an der Wand: kleinster Winkel auf dem Hauptweg
      const nc = nMat();
      const ncl = MEDIA[clad];
      const c = criticalAngle(nc, ncl);
      // kleinster Auftreffwinkel an der Wand über alle Hauptwege des Bündels
      const walls = res.flatMap((q) =>
        mainPath(q)
          .map((i) => q.segs[i]!)
          .filter((sg) => sg.inside && sg.tag === 'wall'),
      );
      const worst = walls.reduce<(typeof walls)[0] | null>((m, q) => (!m || q.angle < m.angle ? q : m), null);
      if (worst) {
        const [hx, hy] = sp.toPx(worst.b[0], worst.b[1]);
        const ok = worst.tir;
        const col = ok ? C.b() : C.p();
        g.fillStyle = col;
        g.beginPath();
        g.arc(hx, hy, 4.5, 0, TAU);
        g.fill();
        const label = `${deg1(worst.angle)}° ${ok ? '>' : '<'} α_{G} = ${c === null ? '–' : deg1(c)}°`;
        const w = richWidth(label, small ? 11 : 12) + 16;
        const lxp = clamp(hx - w / 2, r.x + 6, r.x + r.w - w - 6);
        const lyp = clamp(hy + (worst.b[1] > 0 ? -34 : 12), r.y + 50, r.y + r.h - 30);
        pill(lxp, lyp, label, col, 'left', small ? 11 : 12);
      }
      // Griff am Bogen (Biegeradius ziehen)
      if (!ctx.locked) {
        const [kx, ky] = sp.toPx(FIBER.L1 + R * Math.SQRT1_2, -R + R * Math.SQRT1_2);
        g.save();
        softShadow(g, theme.dark, 6, 1);
        g.fillStyle = theme.dark ? '#1c2533' : '#ffffff';
        g.beginPath();
        g.arc(kx, ky, 9, 0, TAU);
        g.fill();
        g.restore();
        g.strokeStyle = C.r();
        g.lineWidth = 2;
        g.beginPath();
        g.arc(kx, ky, 9, 0, TAU);
        g.stroke();
        arrowHead(kx + 5, ky - 5, -Math.PI / 4, 7, C.r());
        arrowHead(kx - 5, ky + 5, (3 * Math.PI) / 4, 7, C.r());
      }
      // Laser
      const t = toRad(shown.ain);
      const dIn: V2 = [Math.cos(t), -Math.sin(t)];
      const [ex, ey] = sp.toPx(-dIn[0] * 3, -dIn[1] * 3);
      drawLaser(ex, ey, Math.atan2(dIn[1] * -1, dIn[0]), small);
      // Kopfzeile
      const size = small ? 11 : 12;
      let x = r.x + 8;
      x += pill(x, r.y + 8, `θ = ${fmt.num(shown.ain, 0)}°`, C.a(), 'left', size).w + 6;
      x += pill(x, r.y + 8, `R = ${fmt.num(R, 1)} mm`, theme.text, 'left', size).w + 6;
      pill(r.x + r.w - 8, r.y + 8, `${fmt.num((shown.deliv < 0 ? deliv : shown.deliv) * 100, 0)} % ${ctx.t('arrive')}`, C.b(), 'right', size);
      const h = fiberHint();
      if (h) pill(r.x + 8, r.y + 8 + size + 17, fitText(h, r.w - 30, size), C.crit(), 'left', size);
      sp.end();
    }

    function fiberHint(): string | null {
      const nc = nMat();
      const ncl = MEDIA[p.clad as MediumId];
      if (Math.abs(nc - ncl) < 1e-6) return ctx.t('hFiberSame');
      if (ncl > nc) return ctx.t('hFiberDense');
      const straight = fiberDelivery({ ...FIBER, R: 15 }, p.ain, nc, ncl);
      const now = fiberDelivery({ ...FIBER, R: p.rb }, p.ain, nc, ncl);
      if (straight < 0.5) return ctx.t('hAccept');
      if (now < straight - 0.05) return ctx.t('hBendLoss');
      return null;
    }

    function drawPrismApp(r: Rect, dt: number): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const v = glideView([-4.4, 5.6, -4.4, 4.9], dt);
      sp.setRangePadded([v[0], v[1]], [v[2], v[3]], { top: small ? 40 : 46, left: 6, right: 6, bottom: 6 });
      sp.begin();
      benchBg(r);
      const edges = prismEdges(4);
      glassBody(edges, mat());
      const st = prismStats(shown.ain);
      st.res.forEach((q, i) => drawTrace(q, i === 1 ? 1 : 0.6, { width: i === 1 ? 3.6 : 2.4, outLen: 3.6 }));
      // Winkel an der Schrägfläche (mittlerer Strahl)
      const hs = st.res[1]!.segs.find((q) => q.inside && q.tag === 'hyp');
      const c = criticalAngle(nMat(), 1);
      if (hs) {
        const [hx, hy] = sp.toPx(hs.b[0], hs.b[1]);
        const nrm = scr([Math.SQRT1_2, Math.SQRT1_2]);
        const back = scr([hs.a[0] - hs.b[0], hs.a[1] - hs.b[1]]);
        // Lot innen (gestrichelt)
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.setLineDash([5, 4]);
        g.lineWidth = 1.3;
        const L = sp.scale.x * 1.4;
        g.beginPath();
        g.moveTo(hx - Math.cos(nrm) * L, hy - Math.sin(nrm) * L);
        g.lineTo(hx + Math.cos(nrm) * L, hy + Math.sin(nrm) * L);
        g.stroke();
        g.restore();
        const inward = nrm + Math.PI;
        angleArc(hx, hy, 30, inward, sweepOf(inward, back), C.a());
        const ok = hs.tir;
        const label = `${deg1(hs.angle)}° ${ok ? '>' : '<'} α_{G} = ${c === null ? '–' : deg1(c)}°`;
        pill(clamp(hx + 18, r.x + 6, r.x + r.w - richWidth(label, 12) - 24), hy - 40, label, ok ? C.b() : C.p(), 'left', small ? 11 : 12);
      }
      const t = toRad(shown.ain);
      const d: V2 = [Math.cos(t), -Math.sin(t)];
      const [lx, ly] = sp.toPx(-3.2 * d[0], 2 - 3.2 * d[1]);
      drawLaser(lx, ly, Math.atan2(-d[1], d[0]), small);
      const size = small ? 11 : 12;
      pill(r.x + 8, r.y + 8, `θ = ${fmt.num(shown.ain, 0)}°`, C.a(), 'left', size);
      pill(r.x + r.w - 8, r.y + 8, `${fmt.num(st.out * 100, 0)} % ${ctx.t('deflect')}`, C.b(), 'right', size);
      if (c === null || c > 45) pill(r.x + 8, r.y + 8 + size + 17, fitText(tr('hPrismLeak', { m: MEDIUM_NAME[mat()][ctx.lang], g: c === null ? '90' : deg1(c) }), r.w - 30, size), C.crit(), 'left', size);
      sp.end();
    }

    function drawGem(r: Rect, dt: number): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const v = glideView([-1.5, 1.5, -1.05, 1.6], dt);
      sp.setRangePadded([v[0], v[1]], [v[2], v[3]], { top: small ? 40 : 46, left: 6, right: 6, bottom: 6 });
      sp.begin();
      benchBg(r);
      const edges = gemEdges();
      glassBody(edges, mat());
      // Facettenlinien (Tafel, Rundiste)
      const out = gemOutline();
      g.save();
      g.strokeStyle = theme.dark ? 'rgba(220,235,255,0.35)' : 'rgba(30,60,90,0.25)';
      g.lineWidth = 1;
      const [ax, ay] = sp.toPx(-1, 0);
      const [bx, by] = sp.toPx(1, 0);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      for (const q of [out[0]!, out[1]!]) {
        const [qx, qy] = sp.toPx(q[0], q[1]);
        const [kx, ky] = sp.toPx(0, out[3]![1]);
        g.moveTo(qx, qy);
        g.lineTo(kx, ky);
      }
      g.stroke();
      g.restore();
      const st = gemStats(shown.ain);
      st.res.forEach((q, i) => drawTrace(q, i === 1 ? 1 : 0.7, { width: i === 1 ? 3.2 : 2.4, outLen: 1.2 }));
      // Funkeln oben, wo viel Licht austritt
      for (const q of st.res) {
        for (const sg of q.segs) {
          if (sg.inside || sg.tag !== null || sg.I < 0.08 || sg.a[1] < 0.05) continue;
          const [x, y] = sp.toPx(sg.a[0], sg.a[1]);
          const k = Math.min(1, sg.I * 2.2);
          g.save();
          g.translate(x, y);
          g.fillStyle = `rgba(255,255,255,${0.85 * k})`;
          g.beginPath();
          for (let j = 0; j < 8; j++) {
            const rr = j % 2 === 0 ? 11 * k + 3 : 2.5;
            const ang = (j * Math.PI) / 4;
            g.lineTo(Math.cos(ang) * rr, Math.sin(ang) * rr);
          }
          g.closePath();
          g.fill();
          g.restore();
        }
      }
      const t = toRad(shown.ain);
      const d: V2 = [Math.sin(t), -Math.cos(t)];
      const top = out[0]![1];
      const [lx, ly] = sp.toPx(-1.25 * d[0], top - 1.25 * d[1]);
      drawLaser(lx, ly, Math.atan2(-d[1], d[0]), small);
      const size = small ? 11 : 12;
      pill(r.x + 8, r.y + 8, `θ = ${fmt.num(shown.ain, 0)}°`, C.a(), 'left', size);
      pill(r.x + r.w - 8, r.y + 8, `${fmt.num(st.top * 100, 0)} % ${ctx.t('sparkle')}`, C.b(), 'right', size);
      if (mat() === 'glas') pill(r.x + 8, r.y + 8 + size + 17, fitText(ctx.t('hGemGlass'), r.w - 30, size), C.crit(), 'left', size);
      else if (mat() === 'luft') pill(r.x + 8, r.y + 8 + size + 17, fitText(ctx.t('hAir'), r.w - 30, size), C.crit(), 'left', size);
      sp.end();
    }

    /* =================================================================== */
    /* Platte, Prisma, scheinbare Hebung                                    */
    /* =================================================================== */

    function drawPlate(r: Rect, dt: number): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const v = glideView([-2.9, 3.9, -2.7, 2.9], dt);
      sp.setRangePadded([v[0], v[1]], [v[2], v[3]], { top: small ? 40 : 46, left: 6, right: 6, bottom: 6 });
      sp.begin();
      benchBg(r);
      const a = shown.alpha;
      const nm = nMat();
      const edges = plateEdges(2);
      glassBody(edges, mat());
      const d: V2 = [Math.sin(toRad(a)), -Math.cos(toRad(a))];
      const res = traceShape(edges, nm, 1, [-3.4 * d[0], 1 - 3.4 * d[1]], d, { minI: 0.01 });
      // Verlängerung des einfallenden Strahls (gestrichelt)
      const [p0x, p0y] = sp.toPx(0, 1);
      const [p1x, p1y] = sp.toPx(d[0] * 4.5, 1 + d[1] * 4.5);
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.setLineDash([6, 5]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(p0x, p0y);
      g.lineTo(p1x, p1y);
      g.stroke();
      g.restore();
      // Lote an Ein- und Austritt
      const exitSeg = res.segs.find((q) => q.inside && q.tag === 'bottom');
      for (const q of [[0, 1] as V2, exitSeg ? exitSeg.b : null]) {
        if (!q) continue;
        const [x, y] = sp.toPx(q[0], q[1]);
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x, y - sp.scale.x * 0.9);
        g.lineTo(x, y + sp.scale.x * 0.9);
        g.stroke();
        g.restore();
      }
      drawTrace(res, 1, { outLen: 3.2 });
      const beta = refractionAngle(1, nm, a)!;
      const [ix, iy] = sp.toPx(0, 1);
      const r0 = clamp(sp.scale.x * 0.55, 30, 54);
      if (a > 0.5) {
        angleArc(ix, iy, r0, -Math.PI / 2, sweepOf(-Math.PI / 2, scr([-d[0], -d[1]])), C.a());
        angleArc(ix, iy, r0, Math.PI / 2, sweepOf(Math.PI / 2, scr([Math.sin(toRad(beta)), -Math.cos(toRad(beta))])), C.b());
      }
      const size = small ? 11 : 12;
      pill(clamp(ix - r0 - 90, r.x + 6, r.x + r.w - 100), iy - r0 - 26, `α = ${deg1(a)}°`, C.a(), 'left', size);
      pill(ix + 10, iy + r0 * 0.4, `β = ${deg1(beta)}°`, C.b(), 'left', size);
      // Versatz Δ zwischen Verlängerung und austretendem Strahl
      if (exitSeg) {
        const q = exitSeg.b;
        const tt = (q[0] - 0) * d[0] + (q[1] - 1) * d[1];
        const foot: V2 = [d[0] * tt, 1 + d[1] * tt];
        const [qx, qy] = sp.toPx(q[0], q[1]);
        const [fx, fy] = sp.toPx(foot[0], foot[1]);
        if (Math.hypot(qx - fx, qy - fy) > 4) {
          g.strokeStyle = C.crit();
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(qx, qy);
          g.lineTo(fx, fy);
          g.stroke();
          const ang = Math.atan2(fy - qy, fx - qx);
          arrowHead(fx, fy, ang, 9, C.crit());
          arrowHead(qx, qy, ang + Math.PI, 9, C.crit());
          const sh = plateShift(a, nm, 1, 2);
          pill(clamp((qx + fx) / 2 + 12, r.x + 6, r.x + r.w - 110), (qy + fy) / 2 + 6, `Δ = ${fmt.fixed(sh, 2)} cm`, C.crit(), 'left', size);
        }
      }
      const lp: V2 = [-3.1 * d[0], 1 - 3.1 * d[1]];
      const [lx, ly] = sp.toPx(lp[0], lp[1]);
      drawLaser(lx, ly, Math.atan2(-d[1], d[0]), small);
      pill(r.x + r.w - 8, r.y + 8, fitText(`${ctx.t('plateTitle')} · ${MEDIUM_NAME[mat()][ctx.lang]}`, r.w - 40, size), theme.text, 'right', size);
      if (mat() === 'luft') pill(r.x + r.w - 8, r.y + 8 + size + 17, fitText(ctx.t('hAir'), r.w - 30, size), C.crit(), 'right', size);
      else if (Math.round(a) === 0) pill(r.x + r.w - 8, r.y + 8 + size + 17, fitText(ctx.t('hZero'), r.w - 30, size), C.crit(), 'right', size);
      sp.end();
    }

    /** Prisma (Spitze oben): Eintrittspunkt, Richtung des einfallenden Lichts. */
    function prismGeometry(gam: number, a: number): { pts: V2[]; M: V2; d: V2; ni: V2 } {
      const pts = apexPrism(gam, 4);
      const apex = pts[0]!;
      const left = pts[2]!;
      const M: V2 = [(apex[0] + left[0]) / 2, (apex[1] + left[1]) / 2];
      const half = toRad(gam / 2);
      const ni: V2 = [Math.cos(half), -Math.sin(half)];
      const t = toRad(a);
      const d: V2 = [ni[0] * Math.cos(t) - ni[1] * Math.sin(t), ni[0] * Math.sin(t) + ni[1] * Math.cos(t)];
      return { pts, M, d, ni };
    }

    function drawPrismOpt(r: Rect, dt: number): void {
      const theme = ctx.theme;
      const small = r.w < 520;
      const v = glideView([-5.4, 6.6, -1.6, 5.0], dt);
      sp.setRangePadded([v[0], v[1]], [v[2], v[3]], { top: small ? 40 : 46, left: 6, right: 6, bottom: 6 });
      sp.begin();
      benchBg(r);
      const gam = shown.pa;
      const a = shown.alpha;
      const { pts, M, d } = prismGeometry(gam, a);
      const edges = polygonEdges(pts, ['r', 'base', 'l']);
      glassBody(edges, mat());
      const start: V2 = [M[0] - d[0] * 4, M[1] - d[1] * 4];
      const white = p.disp && mat() === 'glas';
      // Schirm rechts
      const sx = 5.6;
      const [scx, scy0] = sp.toPx(sx, -1.2);
      const [, scy1] = sp.toPx(sx, 4.6);
      g.fillStyle = theme.dark ? '#2a3240' : '#d5dbe4';
      roundRect(g, scx - 3, scy1, 6, scy0 - scy1, 3);
      g.fill();
      const toScreen = (q: TraceResult): V2[] => {
        const path = mainPath(q).map((i) => q.segs[i]!);
        const pts2: V2[] = [path[0]!.a];
        for (const sg of path) {
          if (sg.tag === null) {
            const dx = sg.b[0] - sg.a[0];
            const dy = sg.b[1] - sg.a[1];
            const tt = dx > 1e-9 ? (sx - sg.a[0]) / dx : 0.2;
            pts2.push([sg.a[0] + dx * clamp(tt, 0, 1), sg.a[1] + dy * clamp(tt, 0, 1)]);
          } else pts2.push(sg.b);
          if (sg.tag === null) break;
        }
        return pts2;
      };
      const line = (q: V2[], color: string, width: number, from = 0) => {
        g.save();
        g.strokeStyle = color;
        g.lineWidth = width;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.shadowColor = color;
        g.shadowBlur = 8;
        g.beginPath();
        q.slice(from).forEach((pt, i) => {
          const [x, y] = sp.toPx(pt[0], pt[1]);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        });
        g.stroke();
        g.restore();
      };
      if (white) {
        const [ax, ay] = sp.toPx(start[0], start[1]);
        const [mx, my] = sp.toPx(M[0], M[1]);
        beam(ax, ay, mx, my, 1, { color: [255, 252, 240], width: 4.5 });
        const hits: [number, string][] = [];
        for (const [lam, col] of SPECTRUM) {
          const q = traceShape(edges, cauchyIndex(lam), 1, start, d, { minI: 0.3 });
          const way = toScreen(q);
          line(way, col, 2.4, 1);
          const end = way[way.length - 1]!;
          if (Math.abs(end[0] - sx) < 0.01) hits.push([sp.toPx(end[0], end[1])[1], col]);
        }
        if (hits.length === SPECTRUM.length) drawSpectrumInset(r, scx, hits, small);
      } else {
        const q = traceShape(edges, nMat(), 1, start, d, { minI: 0.02 });
        drawTrace(q, 1, { outLen: 5 });
      }
      // Ablenkwinkel δ am Austrittspunkt
      const path = prismPath(gam, a, nMat());
      const size = small ? 11 : 12;
      const main = traceShape(edges, nMat(), 1, start, d, { minI: 0.3 });
      const exitSeg = mainPath(main)
        .map((i) => main.segs[i]!)
        .find((q) => q.inside && q.tag === 'r' && !q.tir);
      if (path && exitSeg) {
        const [qx, qy] = sp.toPx(exitSeg.b[0], exitSeg.b[1]);
        const outDir = mainPath(main).map((i) => main.segs[i]!).find((q) => q.tag === null && !q.inside);
        if (outDir) {
          const od: V2 = [outDir.b[0] - outDir.a[0], outDir.b[1] - outDir.a[1]];
          g.save();
          g.strokeStyle = withAlpha(theme.text, 0.5);
          g.setLineDash([6, 5]);
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(qx, qy);
          g.lineTo(qx + d[0] * sp.scale.x * 2.2, qy - d[1] * sp.scale.x * 2.2);
          g.stroke();
          g.restore();
          const rr = clamp(sp.scale.x * 1.2, 34, 70);
          angleArc(qx, qy, rr, scr(d), sweepOf(scr(d), scr(od)), C.crit());
          pill(qx + rr + 6, qy + 4, `δ = ${deg1(path.delta)}°`, C.crit(), 'left', size);
        }
      }
      // Laser und Winkel am Eintritt
      const [lx, ly] = sp.toPx(M[0] - d[0] * 3.6, M[1] - d[1] * 3.6);
      drawLaser(lx, ly, Math.atan2(-d[1], d[0]), small);
      const [mx, my] = sp.toPx(M[0], M[1]);
      const half = toRad(gam / 2);
      const outward: V2 = [-Math.cos(half), Math.sin(half)];
      const r0 = clamp(sp.scale.x * 0.55, 26, 46);
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.setLineDash([4, 4]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(mx + outward[0] * r0 * 1.8, my - outward[1] * r0 * 1.8);
      g.lineTo(mx - outward[0] * r0 * 1.8, my + outward[1] * r0 * 1.8);
      g.stroke();
      g.restore();
      if (a > 0.5) angleArc(mx, my, r0, scr(outward), sweepOf(scr(outward), scr([-d[0], -d[1]])), C.a());
      pill(clamp(mx - r0 - 100, r.x + 6, r.x + r.w - 90), my + r0 * 0.6, `α = ${deg1(a)}°`, C.a(), 'left', size);
      // brechender Winkel γ an der Spitze
      const [tx, ty] = sp.toPx(pts[0]![0], pts[0]![1]);
      angleArc(tx, ty, 22, Math.PI / 2 - half, 2 * half, C.s());
      richText(`γ = ${fmt.num(gam, 0)}°`, tx, ty - 14, size, C.s(), 'center', true, 700);
      pill(r.x + 8, r.y + 8, `${ctx.t('prismOptTitle')} · ${MEDIUM_NAME[mat()][ctx.lang]}`, theme.text, 'left', size);
      if (!path) pill(r.x + 8, r.y + 8 + size + 17, fitText(ctx.t('total'), r.w - 30, size), C.crit(), 'left', size, withAlpha(C.crit(), 0.95));
      else if (p.disp && mat() !== 'glas') pill(r.x + 8, r.y + 8 + size + 17, fitText(ctx.t('dispOnly'), r.w - 30, size), C.crit(), 'left', size);
      sp.end();
    }

    /**
     * Ausschnitt des Schirms, vergrößert: Die Farben liegen auf dem Schirm nur wenige
     * Pixel auseinander, im Ausschnitt mit ehrlich angegebenem Vergrößerungsfaktor.
     */
    function drawSpectrumInset(r: Rect, scx: number, hits: [number, string][], small: boolean): void {
      const theme = ctx.theme;
      const ys = hits.map(([y]) => y);
      const yc = (Math.min(...ys) + Math.max(...ys)) / 2;
      const spread = Math.max(0.5, Math.max(...ys) - Math.min(...ys));
      const want = small ? 70 : 100;
      const mag = [2, 5, 10, 20, 50, 100].find((m) => spread * m >= want * 0.6) ?? 100;
      const w = small ? 44 : 54;
      const h = Math.min(spread * mag + 34, r.h - 80);
      const x0 = scx - w - 22;
      const y0 = clamp(yc - h / 2, r.y + 50, r.y + r.h - h - 26);
      g.save();
      softShadow(g, theme.dark, 10, 2);
      g.fillStyle = theme.dark ? '#0b1018' : '#ffffff';
      roundRect(g, x0, y0, w, h, 8);
      g.fill();
      g.restore();
      g.save();
      roundRect(g, x0, y0, w, h, 8);
      g.clip();
      const mid = y0 + h / 2;
      for (const [y, col] of hits) {
        const yy = mid + (y - yc) * mag;
        const grad = g.createLinearGradient(0, yy - 7, 0, yy + 7);
        grad.addColorStop(0, withAlpha(col, 0));
        grad.addColorStop(0.5, col);
        grad.addColorStop(1, withAlpha(col, 0));
        g.fillStyle = grad;
        g.fillRect(x0 + 6, yy - 7, w - 12, 14);
      }
      g.restore();
      g.strokeStyle = withAlpha(theme.muted, 0.6);
      g.lineWidth = 1;
      roundRect(g, x0 + 0.5, y0 + 0.5, w - 1, h - 1, 8);
      g.stroke();
      // Verbindung zum Schirm
      g.save();
      g.strokeStyle = withAlpha(theme.muted, 0.6);
      g.setLineDash([3, 3]);
      g.beginPath();
      g.moveTo(x0 + w, y0 + 4);
      g.lineTo(scx - 3, yc - 3);
      g.moveTo(x0 + w, y0 + h - 4);
      g.lineTo(scx - 3, yc + 3);
      g.stroke();
      g.restore();
      richText(`×${mag}`, x0 + w / 2, y0 + h + 12, 11, theme.muted, 'center', true, 700);
    }

    /** Fisch (Seitenansicht), Mitte bei (x, y) in Pixeln. */
    function fishIcon(x: number, y: number, w: number, alpha: number, ghost: boolean): void {
      const h = w * 0.45;
      g.save();
      g.globalAlpha *= alpha;
      g.translate(x, y);
      g.beginPath();
      g.moveTo(w * 0.5, 0);
      g.quadraticCurveTo(w * 0.15, -h, -w * 0.3, -h * 0.15);
      g.lineTo(-w * 0.55, -h * 0.55);
      g.lineTo(-w * 0.5, 0);
      g.lineTo(-w * 0.55, h * 0.55);
      g.lineTo(-w * 0.3, h * 0.15);
      g.quadraticCurveTo(w * 0.15, h, w * 0.5, 0);
      g.closePath();
      if (ghost) {
        g.setLineDash([4, 3]);
        g.strokeStyle = C.a();
        g.lineWidth = 1.6;
        g.stroke();
      } else {
        const grad = g.createLinearGradient(0, -h, 0, h);
        grad.addColorStop(0, '#ffb347');
        grad.addColorStop(1, '#e8682a');
        g.fillStyle = grad;
        g.fill();
        g.fillStyle = '#1b1f27';
        g.beginPath();
        g.arc(w * 0.28, -h * 0.15, Math.max(1.5, w * 0.05), 0, TAU);
        g.fill();
      }
      g.restore();
    }

    function depthEye(h: number, a: number): { S: V2; E: V2; beta: number | null } {
      const nm = nMat();
      const beta = refractionAngle(nm, 1, a);
      const S: V2 = [h * Math.tan(toRad(a)), 0];
      if (beta === null) return { S, E: [S[0], 0.9], beta };
      const L = clamp(h * 0.95, 0.7, 1.8);
      return { S, E: [S[0] + Math.sin(toRad(beta)) * L, Math.cos(toRad(beta)) * L], beta };
    }

    function drawDepth(r: Rect, dt: number): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = r.w < 520;
      const h = shown.dep;
      const a = shown.alpha;
      const { S, E, beta } = depthEye(h, a);
      const v = glideView([-0.95, Math.max(1.2, Math.min(S[0] + 0.5, 4.5), E[0] + 0.35), -h - 0.4, Math.max(0.8, E[1]) + 0.3], dt);
      sp.setRangePadded([v[0], v[1]], [v[2], v[3]], { top: small ? 40 : 46, left: 6, right: 6, bottom: 6 });
      sp.begin();
      // Himmel, Wasser, Grund
      const [, sy] = sp.toPx(0, 0);
      const sky = g.createLinearGradient(0, r.y, 0, sy);
      sky.addColorStop(0, dark ? '#16243a' : '#dcefff');
      sky.addColorStop(1, dark ? '#24344d' : '#f4f9ff');
      g.fillStyle = sky;
      g.fillRect(r.x, r.y, r.w, sy - r.y);
      const water = g.createLinearGradient(0, sy, 0, r.y + r.h);
      const [wc] = TINT[mat()];
      water.addColorStop(0, withAlpha(wc, mat() === 'luft' ? 0.04 : dark ? 0.42 : 0.3));
      water.addColorStop(1, withAlpha(wc, mat() === 'luft' ? 0.08 : dark ? 0.6 : 0.5));
      g.fillStyle = water;
      g.fillRect(r.x, sy, r.w, r.y + r.h - sy);
      g.strokeStyle = dark ? 'rgba(200,225,255,0.8)' : 'rgba(30,90,150,0.7)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(r.x, sy);
      g.lineTo(r.x + r.w, sy);
      g.stroke();
      const [fx, fy] = sp.toPx(0, -h);
      const fw = clamp(sp.scale.x * 0.42, 28, 64);
      // Lot über dem Fisch
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.45);
      g.setLineDash([4, 5]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(fx, fy);
      g.lineTo(fx, sy - sp.scale.x * 0.8);
      g.stroke();
      g.restore();
      const [px, py] = sp.toPx(S[0], S[1]);
      const hp = apparentDepth(h, nMat(), 1, a);
      const size = small ? 11 : 12;
      beam(fx, fy, px, py, 1, { color: [255, 170, 60], width: 3 });
      if (beta !== null) {
        const [ex, ey] = sp.toPx(E[0], E[1]);
        beam(px, py, ex, ey, 1, { color: [255, 170, 60], width: 3 });
        // zurückverlängert: scheinbarer Ort
        if (hp !== null) {
          const [gx, gy] = sp.toPx(0, -hp);
          g.save();
          g.strokeStyle = withAlpha(C.a(), 0.8);
          g.setLineDash([6, 5]);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(px, py);
          g.lineTo(gx, gy);
          g.stroke();
          g.restore();
          fishIcon(gx, gy, fw, 0.9, true);
          // Maßpfeile h und h′ links
          const dim = (y0: number, y1: number, x: number, label: string, color: string) => {
            g.strokeStyle = color;
            g.lineWidth = 1.6;
            g.beginPath();
            g.moveTo(x, y0);
            g.lineTo(x, y1);
            g.moveTo(x - 5, y0);
            g.lineTo(x + 5, y0);
            g.moveTo(x - 5, y1);
            g.lineTo(x + 5, y1);
            g.stroke();
            pill(x - 8, (y0 + y1) / 2 - (size + 11) / 2, label, color, 'right', size);
          };
          const [xd] = sp.toPx(-0.45, 0);
          dim(sy, fy, xd, `h = ${fmt.fixed(h, 2)} m`, theme.text);
          richText(`h′ = ${fmt.fixed(hp, 2)} m`, gx + fw * 0.65, gy + fw * 0.15, size, C.a(), 'left', true, 700);
        }
        // Lot an der Oberfläche und Winkel
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(px, py - sp.scale.x * 0.7);
        g.lineTo(px, py + sp.scale.x * 0.7);
        g.stroke();
        g.restore();
        const r0 = clamp(sp.scale.x * 0.35, 26, 46);
        if (a > 0.5) {
          angleArc(px, py, r0, Math.PI / 2, sweepOf(Math.PI / 2, Math.atan2(fy - py, fx - px)), C.a());
          angleArc(px, py, r0, -Math.PI / 2, sweepOf(-Math.PI / 2, Math.atan2(ey - py, ex - px)), C.b());
        }
        pill(px + 8, py + r0 * 0.5, `α = ${deg1(a)}°`, C.a(), 'left', size);
        pill(px + 8, py - r0 - 22, `β = ${deg1(beta)}°`, C.b(), 'left', size);
        // Auge
        g.save();
        g.translate(ex, ey);
        g.rotate(Math.atan2(py - ey, px - ex));
        const w = small ? 28 : 34;
        const hh = w * 0.5;
        g.beginPath();
        g.moveTo(-w / 2, 0);
        g.quadraticCurveTo(0, -hh, w / 2, 0);
        g.quadraticCurveTo(0, hh, -w / 2, 0);
        g.closePath();
        g.fillStyle = '#ffffff';
        g.fill();
        g.strokeStyle = dark ? '#c9d2df' : '#2b3442';
        g.lineWidth = 2;
        g.stroke();
        g.fillStyle = '#2b6cb0';
        g.beginPath();
        g.arc(w * 0.12, 0, hh * 0.55, 0, TAU);
        g.fill();
        g.fillStyle = '#0b0f16';
        g.beginPath();
        g.arc(w * 0.16, 0, hh * 0.25, 0, TAU);
        g.fill();
        g.restore();
      } else {
        // Totalreflexion an der Oberfläche
        const back: V2 = [S[0] * 2, -h];
        const [bx, by] = sp.toPx(back[0], back[1]);
        beam(px, py, bx, by, 1, { color: [255, 170, 60], width: 3 });
      }
      fishIcon(fx, fy, fw, 1, false);
      pill(r.x + 8, r.y + 8, `${ctx.t('depthTitle')} · ${MEDIUM_NAME[mat()][ctx.lang]}`, theme.text, 'left', size);
      if (beta === null) pill(r.x + 8, r.y + 8 + size + 17, fitText(ctx.t('depthTotal'), r.w - 30, size), C.crit(), 'left', size, withAlpha(C.crit(), 0.95));
      else if (mat() === 'luft') pill(r.x + 8, r.y + 8 + size + 17, fitText(ctx.t('hAir'), r.w - 30, size), C.crit(), 'left', size);
      sp.end();
    }

    /* =================================================================== */
    /* Karten                                                               */
    /* =================================================================== */

    function drawLawCard(R: Rect): void {
      const theme = ctx.theme;
      card(R);
      const small = R.w < 300 || R.h < 200;
      const fs = small ? 11.5 : 13;
      const x = R.x + 14;
      const maxW = R.w - 28;
      let y = R.y + 20;
      const n1 = shown.n1;
      const n2 = shown.n2;
      const a = shown.alpha;
      const beta = refractionAngle(n1, n2, a);
      const f = fresnel(n1, n2, a);
      const line = (str: string, color: string, size = fs, weight = 700) => {
        if (y > R.y + R.h - 10) return;
        richText(fitText(str, maxW, size, weight), x, y, size, color, 'left', false, weight);
        y += size + (small ? 7 : 9);
      };
      line(ctx.t('lawTitle'), theme.text, fs + 0.5);
      line('n_{1} · sin α = n_{2} · sin β', theme.text, fs + (small ? 0.5 : 2));
      if (beta === null) {
        line(`${fmt.fixed(n1, 2)} · sin ${deg1(a)}° = ${fmt.fixed(n1 * Math.sin(toRad(a)), 3)} > ${fmt.fixed(n2, 2)}`, C.crit());
        line(ctx.t('total'), C.crit(), fs, 650);
      } else {
        line(`${fmt.fixed(n1, 2)} · sin ${deg1(a)}° = ${fmt.fixed(n2, 2)} · sin ${deg1(beta)}°`, theme.text, fs, 650);
        line(`${fmt.fixed(n1 * Math.sin(toRad(a)), 3)} = ${fmt.fixed(n2 * Math.sin(toRad(beta)), 3)}  →  β = ${deg1(beta)}°`, C.b(), fs, 700);
        const dir = Math.abs(n1 - n2) < 1e-6 || a < 0.5 ? ctx.t('hStraight') : n2 > n1 ? ctx.t('hTowards') : ctx.t('hAway');
        line(dir, theme.muted, fs - 1, 600);
      }
      // Anteile als Balken
      y += 2;
      const bars: [string, number, string][] = [
        [ctx.t('refl'), f.R, C.r()],
        [ctx.t('refr'), f.T, C.b()],
      ];
      const lw = Math.max(...bars.map(([l]) => richWidth(l, fs - 1, 600))) + 10;
      const bw = Math.max(40, maxW - lw - 58);
      const bh = small ? 12 : 14;
      for (const [label, val, col] of bars) {
        if (y + bh / 2 > R.y + R.h - 8) break;
        richText(label, x, y, fs - 1, theme.text, 'left', false, 600);
        g.fillStyle = withAlpha(theme.muted, 0.14);
        roundRect(g, x + lw, y - bh / 2, bw, bh, 4);
        g.fill();
        g.fillStyle = col;
        roundRect(g, x + lw, y - bh / 2, Math.max(0, bw * clamp(val, 0, 1)), bh, 4);
        g.fill();
        richText(`${fmt.fixed(val * 100, 1)} %`, x + lw + bw + 6, y, fs - 1, theme.text, 'left', false, 700);
        y += bh + (small ? 8 : 10);
      }
      if (mode() === 'ray') {
        line(tr('cText', { c1: fmt.num(lightSpeed(n1), 0), c2: fmt.num(lightSpeed(n2), 0) }), theme.muted, fs - 1.5, 600);
        if (p.wave) line(tr('lambda', { f: fmt.fixed(n1 / n2, 3) }), theme.muted, fs - 1.5, 600);
      }
    }

    function drawAppCard(R: Rect): void {
      const theme = ctx.theme;
      card(R);
      const small = R.w < 300 || R.h < 200;
      const fs = small ? 11.5 : 12.5;
      const x = R.x + 14;
      let y = R.y + 20;
      const title = ctx.t(app() === 'fiber' ? 'fiberTitle' : app() === 'prism' ? 'prismTitle' : 'gemTitle');
      richText(`${title} · ${MEDIUM_NAME[mat()][ctx.lang]}`, x, y, fs + 1, theme.text, 'left', false);
      y += fs + 12;
      const lines = appLines();
      // Großer Anteil (zählt weich)
      const share = shown.share < 0 ? 0 : shown.share;
      const big = small ? 26 : 34;
      const bigText = `${fmt.num(share * 100, 0)} %`;
      const label = app() === 'fiber' ? ctx.t('arrive') : app() === 'prism' ? ctx.t('deflect') : ctx.t('sparkle');
      for (const ln of lines.slice(0, lines.length - 1)) {
        if (y > R.y + R.h - big - 16) break;
        richText(fitText(ln.replace(/<\/?sub>/g, ''), R.w - 28, fs - 0.5, 600), x, y, fs - 0.5, theme.muted, 'left', false, 600);
        y += fs + 8;
      }
      const by = Math.min(R.y + R.h - big / 2 - 10, y + big / 2 + 4);
      g.font = `800 ${big}px ${theme.font}`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = share > 0.6 ? C.b() : C.p();
      g.fillText(bigText, x, by);
      const bw = g.measureText(bigText).width;
      richText(fitText(label, R.w - bw - 40, fs, 650), x + bw + 10, by + 2, fs, theme.text, 'left', false, 650);
    }

    /** Grenzwinkel aller Stoffe gegen Luft als Balken, mit dem Auftreffwinkel als Marke. */
    function drawCritBars(R: Rect): void {
      const theme = ctx.theme;
      card(R);
      const small = R.w < 300 || R.h < 170;
      titleChip(R, ctx.t('tCrit'), theme.text);
      const ids: MediumId[] = ['wasser', 'plexiglas', 'glas', 'diamant'];
      const top = R.y + (small ? 40 : 46);
      const bottom = R.y + R.h - (small ? 30 : 34);
      const rowH = (bottom - top) / ids.length;
      const lw = Math.max(...ids.map((id) => richWidth(MEDIUM_NAME[id][ctx.lang], small ? 11 : 12, 650))) + 12;
      const x0 = R.x + 12 + lw;
      const x1 = R.x + R.w - 50;
      const px = (deg: number) => x0 + ((x1 - x0) * deg) / 90;
      const mark = app() === 'prism' ? prismStats(shown.ain).hyp || 45 : gemPavilionAngle();
      ids.forEach((id, i) => {
        const c = criticalAngle(MEDIA[id], 1)!;
        const y = top + rowH * (i + 0.5);
        const on = id === mat();
        const bh = Math.min(18, rowH * 0.55);
        richText(MEDIUM_NAME[id][ctx.lang], R.x + 12, y, small ? 11 : 12, on ? theme.text : theme.muted, 'left', false, on ? 750 : 600);
        g.fillStyle = withAlpha(on ? C.crit() : theme.muted, on ? 0.9 : 0.35);
        roundRect(g, x0, y - bh / 2, px(c) - x0, bh, 4);
        g.fill();
        richText(`${deg1(c)}°`, px(c) + 6, y, small ? 11 : 12, on ? C.crit() : theme.muted, 'left', false, 700);
      });
      g.save();
      g.strokeStyle = C.a();
      g.lineWidth = 2;
      g.setLineDash([5, 4]);
      g.beginPath();
      g.moveTo(px(mark), top - 4);
      g.lineTo(px(mark), bottom + 4);
      g.stroke();
      g.restore();
      const lab = app() === 'prism' ? tr('hitHyp', { a: deg1(mark) }) : tr('pavilion', { a: deg1(mark) });
      richText(fitText(lab, R.w - 24, small ? 11 : 12, 650), R.x + R.w / 2, bottom + (small ? 15 : 18), small ? 11 : 12, C.a(), 'center', false, 650);
    }

    function drawTableCard(R: Rect): void {
      const theme = ctx.theme;
      card(R);
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      const x = R.x + 12;
      const w = R.w - 24;
      richText(`${tx('Messreihe', 'Measurements')} · ${tr('sample', { x: String(p.x) })}`, x, R.y + 18, fs + 1, theme.text, 'left', false);
      const cols = [0, 0.16, 0.38, 0.62, 0.84].map((f) => x + 4 + f * w);
      const head = [ctx.t('thNo'), 'α', 'β', 'sin α', 'sin β'];
      const rowH = clamp((R.h - 52) / (MAX_ROWS + 1), 14, 22);
      let y = R.y + 36;
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.05)';
      roundRect(g, x - 4, y, w + 8, rowH, 6);
      g.fill();
      head.forEach((h, i) => text(g, h, cols[i]!, y + rowH / 2 + 0.5, { font: `700 ${fs}px ${theme.font}`, color: i === 1 ? C.a() : i === 2 ? C.b() : theme.muted, align: 'left' }));
      y += rowH + 2;
      const maxRows = Math.max(1, Math.floor((R.y + R.h - 8 - y) / rowH));
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(16,24,40,0.07)';
      g.lineWidth = 1;
      for (let i = 1; i <= maxRows; i++) {
        const yy = Math.round(y + i * rowH) + 0.5;
        g.beginPath();
        g.moveTo(x - 4, yy);
        g.lineTo(x + w + 4, yy);
        g.stroke();
      }
      if (!rows.length) {
        richText(fitText(ctx.t('emptyRows'), w - 8, fs, 500), x + 2, y + rowH * 1.5, fs, theme.muted, 'left', false, 500);
        return;
      }
      const shownRows = rows.slice(-maxRows);
      const off = rows.length - shownRows.length;
      shownRows.forEach(([aa, bb], i) => {
        const yy = y + i * rowH + rowH / 2;
        const last = i === shownRows.length - 1;
        const k = last && rowPop.running ? rowPop.value : 1;
        if (last) {
          g.fillStyle = withAlpha(C.r(), theme.dark ? 0.16 : 0.09);
          roundRect(g, x - 4, y + i * rowH + 1, w + 8, rowH - 2, 5);
          g.fill();
        }
        g.save();
        g.globalAlpha = clamp(k, 0, 1);
        const vals = [String(off + i + 1), `${fmt.num(aa, 0)}°`, `${fmt.fixed(bb, 1)}°`, fmt.fixed(Math.sin(toRad(aa)), 3), fmt.fixed(Math.sin(toRad(bb)), 3)];
        vals.forEach((s, j) => text(g, s, cols[j]!, yy, { font: `${j === 0 ? 600 : 700} ${fs * (0.85 + 0.15 * k)}px ${theme.font}`, color: j === 0 ? theme.muted : theme.text, align: 'left' }));
        g.restore();
      });
    }

    function drawOptCard(R: Rect): void {
      const theme = ctx.theme;
      card(R);
      const small = R.w < 300 || R.h < 170;
      const fs = small ? 11.5 : 12.5;
      const x = R.x + 14;
      let y = R.y + 20;
      const title = ex() === 'plate' ? ctx.t('plateTitle') : ex() === 'prism' ? ctx.t('prismOptTitle') : ctx.t('depthTitle');
      richText(fitText(title, R.w - 28, fs + 1), x, y, fs + 1, theme.text, 'left', false);
      y += fs + 14;
      const lines = optLines(false);
      lines.forEach((ln, i) => {
        if (y > R.y + R.h - 10) return;
        richText(fitText(ln, R.w - 28, fs, i === 0 ? 700 : 600), x, y, fs, i === 0 ? C.crit() : theme.muted, 'left', false, i === 0 ? 700 : 600);
        y += fs + 10;
      });
      // Formel bzw. Merksatz
      if (y < R.y + R.h - 20) {
        const law = ex() === 'depth' ? 'n_{Stoff} · sin α = n_{Luft} · sin β' : 'n_{1} · sin α = n_{2} · sin β';
        richText(fitText(ctx.lang === 'de' ? law : law.replace('Stoff', 'mat').replace('Luft', 'air'), R.w - 28, fs, 600), x, Math.max(y, R.y + R.h - 18), fs, theme.muted, 'left', false, 600);
      }
    }

    /* =================================================================== */
    /* Diagramme                                                            */
    /* =================================================================== */

    function chartCurve(f: (x: number) => number | null, x0: number, x1: number, steps = 180): Pt[][] {
      const out: Pt[][] = [];
      let cur: Pt[] = [];
      for (let k = 0; k <= steps; k++) {
        const x = x0 + ((x1 - x0) * k) / steps;
        const y = f(x);
        if (y === null || !Number.isFinite(y)) {
          if (cur.length > 1) out.push(cur);
          cur = [];
        } else cur.push([x, y]);
      }
      if (cur.length > 1) out.push(cur);
      return out;
    }

    function drawFresnelChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const { n1, n2 } = { n1: shown.n1, n2: shown.n2 };
      plot.setAxes({ x: { label: 'α in °', minStep: 15 }, y: { label: '', minStep: 20 } });
      plot.setRangePadded([0, 90], [0, 100], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const c = criticalAngle(n1, n2);
      if (c !== null) plot.polygon([[c, 0], [90, 0], [90, 100], [c, 100]], { fill: withAlpha(C.crit(), 0.1) });
      const F = (k: 'R' | 'T' | 'rs' | 'rp') => chartCurve((a) => 100 * fresnel(n1, n2, a)[k], 0, 90, 360);
      for (const q of F('rs')) plot.polyline(q, { color: C.s(), width: 1.5, dash: [5, 4] });
      for (const q of F('rp')) plot.polyline(q, { color: C.p(), width: 1.5, dash: [5, 4] });
      for (const q of F('T')) plot.polyline(q, { color: C.b(), width: 2.6 });
      for (const q of F('R')) plot.polyline(q, { color: C.r(), width: 2.6 });
      const a = shown.alpha;
      const f = fresnel(n1, n2, a);
      plot.vline(a, { color: C.a(), width: 1.4, alpha: 0.6 });
      plot.point(a, 100 * f.R, { color: C.r(), radius: 5.5 });
      plot.point(a, 100 * f.T, { color: C.b(), radius: 5.5 });
      if (Math.abs(n1 - n2) > 1e-6) {
        const bA = brewsterAngle(n1, n2);
        if (c === null || bA < c) {
          plot.point(bA, 0, { color: C.p(), radius: 4, hollow: true });
          if (!small) plot.text(bA, 0, ctx.t('brewster'), { color: C.p(), size: 11, weight: 'bold', align: 'center', offset: [0, -12] });
        }
      }
      plot.end();
      const fs = small ? 11 : 11.5;
      if (R.h > 150) {
        const lg: [string, string, boolean][] = [
          ['R', C.r(), false],
          ['T', C.b(), false],
          ['R_{s}', C.s(), true],
          ['R_{p}', C.p(), true],
        ];
        let lx = plot.px(0) + 10;
        const ly = plot.py(68);
        for (const [label, color, dash] of lg) {
          g.save();
          g.strokeStyle = color;
          g.lineWidth = dash ? 1.5 : 2.6;
          g.setLineDash(dash ? [4, 3] : []);
          g.beginPath();
          g.moveTo(lx, ly);
          g.lineTo(lx + 14, ly);
          g.stroke();
          g.restore();
          lx += 18 + richText(label, lx + 18, ly, fs, color, 'left') + 10;
        }
      }
      titleChip(R, ctx.t('tFresnel'), theme.text, small ? undefined : `R = ${fmt.fixed(f.R * 100, 1)} %`, C.r());
    }

    function drawBetaChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const { n1, n2 } = { n1: shown.n1, n2: shown.n2 };
      plot.setAxes({ x: { label: 'α in °', minStep: 15 }, y: { label: '', minStep: 15 } });
      plot.setRangePadded([0, 90], [0, 90], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const c = criticalAngle(n1, n2);
      if (c !== null) {
        plot.polygon([[c, 0], [90, 0], [90, 90], [c, 90]], { fill: withAlpha(C.crit(), 0.12) });
        plot.text((c + 90) / 2, 45, ctx.t('totalZone'), { color: C.crit(), size: small ? 11 : 12, weight: 'bold', align: 'center' });
      }
      plot.segment([0, 0], [90, 90], { color: theme.muted, width: 1.4, dash: [5, 5] });
      if (!small && (c === null || c > 70)) {
        const xs = Math.min(c ?? 90, 90) * 0.6;
        plot.text(xs, xs, ctx.t('same'), { color: theme.muted, size: 11, align: 'left', offset: [8, 12] });
      }
      for (const q of chartCurve((a) => refractionAngle(n1, n2, a), 0, c ?? 90, 240)) plot.polyline(q, { color: C.b(), width: 2.8 });
      if (c !== null) {
        plot.point(c, 90, { color: C.crit(), radius: 5 });
        plot.segment([c, 0], [c, 90], { color: C.crit(), width: 1.4, dash: [3, 4] });
      }
      const a = shown.alpha;
      const b = refractionAngle(n1, n2, a);
      plot.vline(a, { color: C.a(), width: 1.4, alpha: 0.55 });
      if (b !== null) {
        plot.segment([0, b], [a, b], { color: C.b(), width: 1.2, dash: [3, 3], alpha: 0.7 });
        plot.point(a, b, { color: C.b(), radius: 6 });
      }
      plot.end();
      if (c !== null) richText(`α_{G} = ${deg1(c)}°`, plot.px(c) + (c > 60 ? -8 : 8), plot.py(90) + 12, small ? 11 : 12, C.crit(), c > 60 ? 'right' : 'left', true, 700);
      titleChip(R, ctx.t('tBeta'), theme.text, small ? undefined : b === null ? ctx.t('totalZone') : `β = ${deg1(b)}°`, b === null ? C.crit() : C.b());
    }

    function drawSinChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const { n1, n2 } = { n1: shown.n1, n2: shown.n2 };
      const k = n1 / n2;
      plot.setAxes({ x: { label: 'sin α', minStep: 0.2 }, y: { label: '', minStep: 0.2 } });
      plot.setRangePadded([0, 1], [0, 1], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const xEnd = Math.min(1, 1 / k);
      if (xEnd < 1) plot.polygon([[xEnd, 0], [1, 0], [1, 1], [xEnd, 1]], { fill: withAlpha(C.crit(), 0.12) });
      plot.segment([0, 0], [xEnd, k * xEnd], { color: C.b(), width: 2.8 });
      // Steigungsdreieck
      const x0 = 0.25 * xEnd;
      const x1 = 0.65 * xEnd;
      plot.segment([x0, k * x0], [x1, k * x0], { color: theme.text, width: 1.3, alpha: 0.7 });
      plot.segment([x1, k * x0], [x1, k * x1], { color: theme.text, width: 1.3, alpha: 0.7 });
      const slopeTxt = tr('slopeLbl', { k: fmt.fixed(k, 3) });
      const slopePos: Pt = [plot.px(x1) + 8, plot.py((k * x0 + k * x1) / 2)];
      const a = shown.alpha;
      const sa = Math.sin(toRad(a));
      plot.vline(sa, { color: C.a(), width: 1.4, alpha: 0.55 });
      if (k * sa <= 1 + 1e-9) plot.point(sa, k * sa, { color: C.b(), radius: 6 });
      plot.end();
      const sw = richWidth(slopeTxt, small ? 11 : 12);
      richText(slopeTxt, Math.min(slopePos[0], plot.rect.x + plot.rect.w - sw - 6), slopePos[1], small ? 11 : 12, theme.text, 'left', true, 700);
      titleChip(R, ctx.t('tSin'), theme.text, small ? undefined : `sin α = ${fmt.fixed(sa, 3)}`, C.a());
    }

    function drawFitChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const fs = small ? 11 : 12;
      plot.setAxes({ x: { label: 'sin α', minStep: 0.2 }, y: { label: '', minStep: 0.2 } });
      plot.setRangePadded([0, 1], [0, 0.8], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const nn = indexFromSeries(rows);
      if (nn !== null && rows.length >= 2) plot.segment([0, 0], [1, 1 / nn], { color: C.r(), width: 2, dash: [6, 4] });
      rows.forEach(([aa, bb], i) => {
        const u = i === rows.length - 1 && rowPop.running ? rowPop.value : 1;
        plot.point(Math.sin(toRad(aa)), Math.sin(toRad(bb)), { color: C.r(), radius: 5.5 * Math.max(0.2, u) });
      });
      const a = Math.round(alpha);
      const b = refractionAngle(1, SAMPLES[p.x - 1]!.n, a);
      if (b !== null) plot.point(Math.sin(toRad(a)), Math.sin(toRad(readAngle(b))), { color: C.a(), radius: 5, hollow: true });
      plot.end();
      titleChip(R, ctx.t('tFit'), theme.text);
      if (!rows.length) {
        richText(ctx.t('emptyFit'), R.x + R.w / 2, R.y + R.h * 0.45, fs, theme.muted, 'center', true, 600);
        return;
      }
      if (nn !== null && rows.length >= 2) {
        const s = SAMPLES[p.x - 1]!;
        const u = rowPop.running ? clamp(rowPop.value, 0, 1.2) : 1;
        g.save();
        g.translate(plot.rect.x + plot.rect.w * 0.62, R.y + 50);
        g.scale(u, u);
        pill(0, -10, tr('fitResult', { n: fmt.fixed(nn, 2) }), C.r(), 'center', fs + 1, C.r());
        g.restore();
        const reveal = rows.length >= 3;
        const near = nearestSample(nn);
        const label = reveal ? tr('fitReveal', { name: s[ctx.lang], n: n(s.n, 2) }) : tr('fitMore', { k: String(3 - rows.length) });
        const ok = reveal && near === p.x - 1;
        richText(fitText(label, plot.rect.w - 12, fs, 650), plot.rect.x + plot.rect.w * 0.62, R.y + 80, fs, reveal ? (ok ? C.b() : C.a()) : theme.muted, 'center', true, 650);
      }
    }

    function drawBendChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      plot.setAxes({ x: { label: 'R in mm', minStep: 2 }, y: { label: '', minStep: 20 } });
      plot.setRangePadded([1, 15], [0, 100], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const pts = bendCurve();
      plot.polygon([...pts, [15, 0], [1, 0]], { fill: withAlpha(C.b(), 0.12) });
      plot.polyline(pts, { color: C.b(), width: 2.6 });
      const R0 = shown.rb;
      const y = shown.deliv < 0 ? 0 : 100 * shown.deliv;
      plot.vline(R0, { color: C.a(), width: 1.4, alpha: 0.6 });
      plot.point(R0, y, { color: C.b(), radius: 6 });
      plot.end();
      titleChip(R, ctx.t('tBend'), theme.text, small ? undefined : `${fmt.num(y, 0)} %`, C.b());
    }

    function drawShiftChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      plot.setAxes({ x: { label: 'α in °', minStep: 15 }, y: { label: '', minStep: 0.5 } });
      plot.setRangePadded([0, 90], [0, 2.1], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const ids: MediumId[] = ['wasser', 'glas', 'diamant'];
      for (const id of ids) if (id !== mat()) for (const q of chartCurve((a) => plateShift(a, MEDIA[id], 1, 2), 0, 89.5)) plot.polyline(q, { color: theme.muted, width: 1.2, alpha: 0.5 });
      for (const q of chartCurve((a) => plateShift(a, nMat(), 1, 2), 0, 89.5)) plot.polyline(q, { color: C.crit(), width: 2.6 });
      const a = shown.alpha;
      const sh = plateShift(a, nMat(), 1, 2);
      plot.vline(a, { color: C.a(), width: 1.4, alpha: 0.6 });
      plot.point(a, sh, { color: C.crit(), radius: 6 });
      plot.end();
      titleChip(R, ctx.t('tShift'), theme.text, small ? undefined : `Δ = ${fmt.fixed(sh, 2)} cm`, C.crit());
    }

    function drawDevChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const gam = shown.pa;
      const white = p.disp && mat() === 'glas';
      const series: [number, string, number][] = white
        ? [
            [cauchyIndex(410), SPECTRUM[0]![1], 2],
            [cauchyIndex(660), SPECTRUM[6]![1], 2],
          ]
        : [[nMat(), C.crit(), 2.6]];
      let yMax = 10;
      for (const [nn] of series) for (let a = 0; a <= 89; a += 1) yMax = Math.max(yMax, prismPath(gam, a, nn)?.delta ?? 0);
      const top = Math.ceil((yMax * 1.1) / niceStep(yMax / 4)) * niceStep(yMax / 4);
      plot.setAxes({ x: { label: 'α in °', minStep: 15 }, y: { label: '', minStep: 10 } });
      plot.setRangePadded([0, 90], [0, top], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      for (const [nn, col, w] of series) for (const q of chartCurve((a) => prismPath(gam, a, nn)?.delta ?? null, 0, 89.5, 300)) plot.polyline(q, { color: col, width: w });
      const nMain = nMat();
      const dm = minDeviation(gam, nMain);
      if (dm !== null) {
        const aMin = (dm + gam) / 2;
        plot.hline(dm, { color: theme.muted, width: 1.2, dash: [4, 4] });
        plot.point(aMin, dm, { color: theme.text, radius: 4, hollow: true });
      }
      const a = shown.alpha;
      const path = prismPath(gam, a, nMain);
      plot.vline(a, { color: C.a(), width: 1.4, alpha: 0.6 });
      if (path) plot.point(a, path.delta, { color: C.crit(), radius: 6 });
      plot.end();
      if (dm !== null && !small) richText(`δ_{min} = ${deg1(dm)}°`, plot.px((dm + gam) / 2), plot.py(dm) + 15, 11.5, theme.text, 'center', true, 700);
      titleChip(R, ctx.t('tDev'), theme.text, small ? undefined : path ? `δ = ${deg1(path.delta)}°` : ctx.t('totalZone'), C.crit());
    }

    function drawLiftChart(plot: Plot, R: Rect): void {
      const theme = ctx.theme;
      const small = R.w < 300;
      const nm = nMat();
      plot.setAxes({ x: { label: 'α in °', minStep: 15 }, y: { label: '', minStep: 0.25 } });
      plot.setRangePadded([0, 90], [0, 1.05], chartPad(R));
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      const c = criticalAngle(nm, 1);
      if (c !== null) plot.polygon([[c, 0], [90, 0], [90, 1.05], [c, 1.05]], { fill: withAlpha(C.crit(), 0.12) });
      for (const q of chartCurve((a) => apparentDepth(1, nm, 1, a), 0, c === null ? 89.5 : c - 0.01, 300)) plot.polyline(q, { color: C.a(), width: 2.6 });
      plot.hline(1 / nm, { color: theme.muted, width: 1.2, dash: [4, 4] });
      if (!small) plot.text(4, 1 / nm, `1/n = ${fmt.fixed(1 / nm, 3)}`, { color: theme.muted, size: 11, align: 'left', offset: [0, -10] });
      const a = shown.alpha;
      const hp = apparentDepth(1, nm, 1, a);
      plot.vline(a, { color: C.a(), width: 1.4, alpha: 0.6 });
      if (hp !== null) plot.point(a, hp, { color: C.a(), radius: 6 });
      plot.end();
      titleChip(R, ctx.t('tLift'), theme.text, small ? undefined : hp === null ? ctx.t('totalZone') : `h′/h = ${fmt.fixed(hp, 3)}`, C.a());
    }

    function drawPanels(reg: { panels: Rect[] }): void {
      const kinds = panelsOf(mode());
      const alphaF = (fade.running ? fade.value : 1) * (intro.running ? clamp(intro.t * 1.6, 0, 1) : 1);
      kinds.forEach((kind, i) => {
        const R = reg.panels[i];
        if (!R || R.w < 60 || R.h < 50) return;
        g.save();
        g.globalAlpha = alphaF;
        if (kind === 'law') drawLawCard(R);
        else if (kind === 'app') drawAppCard(R);
        else if (kind === 'crit') drawCritBars(R);
        else if (kind === 'table') drawTableCard(R);
        else if (kind === 'opt') drawOptCard(R);
        else {
          card(R);
          const plot = charts[i]!;
          if (kind === 'fresnel') drawFresnelChart(plot, R);
          else if (kind === 'beta') drawBetaChart(plot, R);
          else if (kind === 'sin') drawSinChart(plot, R);
          else if (kind === 'fit') drawFitChart(plot, R);
          else if (kind === 'bend') drawBendChart(plot, R);
          else if (kind === 'shift') drawShiftChart(plot, R);
          else if (kind === 'dev') drawDevChart(plot, R);
          else drawLiftChart(plot, R);
        }
        g.restore();
      });
    }

    /* =================================================================== */
    /* Bedienung                                                            */
    /* =================================================================== */

    const stop = () => {
      if (ctx.clock.playing && mode() !== 'total') ctx.clock.pause();
    };
    const discMode = () => mode() === 'ray' || mode() === 'graph' || mode() === 'measure';

    // Laser auf der optischen Scheibe: Einfallswinkel und Seite
    sp.addHandle({
      get: () => laserPoint(LASER_R + laserLen() / 2 / sp.scale.x),
      set: (x, y) => {
        stop();
        const fromTop = mode() === 'measure' ? true : y >= 0;
        const a = Math.round(toDeg(Math.atan2(Math.abs(x), Math.abs(y))));
        if (mode() === 'measure') ctx.set({ alpha: Math.min(89, a) });
        else ctx.set({ alpha: Math.min(89, a), from: fromTop ? 'top' : 'bottom' });
      },
      enabled: () => !ctx.locked && discMode(),
      color: () => '#ff3b30',
    });
    // Glasfaser: Laser (Neigung) und Bogen (Biegeradius)
    const fiberLaser = (): V2 => {
      const t = toRad(shown.ain);
      return [-Math.cos(t) * 3.4, Math.sin(t) * 3.4];
    };
    sp.addHandle({
      get: fiberLaser,
      set: (x, y) => ctx.set({ ain: clamp(Math.round(toDeg(Math.atan2(y, -x))), -60, 60) }),
      enabled: () => !ctx.locked && mode() === 'total' && app() === 'fiber',
      color: () => '#ff3b30',
    });
    sp.addHandle({
      get: () => [FIBER.L1 + shown.rb * Math.SQRT1_2, -shown.rb + shown.rb * Math.SQRT1_2],
      set: (x, y) => {
        const ux = Math.SQRT1_2;
        const uy = Math.SQRT1_2 - 1;
        const Rn = ((x - FIBER.L1) * ux + y * uy) / (ux * ux + uy * uy);
        ctx.set({ rb: clamp(Math.round(Rn * 2) / 2, 1, 15) });
      },
      enabled: () => !ctx.locked && mode() === 'total' && app() === 'fiber',
      color: () => ctx.theme.series[0]!,
    });
    // Umlenkprisma und Brillant: Laser
    sp.addHandle({
      get: () => {
        const t = toRad(shown.ain);
        return [-3.6 * Math.cos(t), 2 + 3.6 * Math.sin(t)];
      },
      set: (x, y) => ctx.set({ ain: clamp(Math.round(toDeg(Math.atan2(y - 2, -x))), -60, 60) }),
      enabled: () => !ctx.locked && mode() === 'total' && app() === 'prism',
      color: () => '#ff3b30',
    });
    sp.addHandle({
      get: () => {
        const t = toRad(shown.ain);
        const top = gemOutline()[0]![1];
        return [-1.45 * Math.sin(t), top + 1.45 * Math.cos(t)];
      },
      set: (x, y) => {
        const top = gemOutline()[0]![1];
        ctx.set({ ain: clamp(Math.round(toDeg(Math.atan2(-x, y - top))), -60, 60) });
      },
      enabled: () => !ctx.locked && mode() === 'total' && app() === 'gem',
      color: () => '#ff3b30',
    });
    // Platte und Prisma: Laser
    sp.addHandle({
      get: () => {
        const t = toRad(shown.alpha);
        return [-3.4 * Math.sin(t), 1 + 3.4 * Math.cos(t)];
      },
      set: (x, y) => {
        stop();
        ctx.set({ alpha: clamp(Math.round(toDeg(Math.atan2(-x, y - 1))), 0, 89) });
      },
      enabled: () => !ctx.locked && mode() === 'optics' && ex() === 'plate',
      color: () => '#ff3b30',
    });
    sp.addHandle({
      get: () => {
        const { M, d } = prismGeometry(shown.pa, shown.alpha);
        return [M[0] - d[0] * 4.0, M[1] - d[1] * 4.0];
      },
      set: (x, y) => {
        stop();
        const { M, ni } = prismGeometry(shown.pa, 0);
        const v: V2 = [M[0] - x, M[1] - y];
        const ang = toDeg(Math.atan2(ni[0] * v[1] - ni[1] * v[0], ni[0] * v[0] + ni[1] * v[1]));
        ctx.set({ alpha: clamp(Math.round(ang), 0, 89) });
      },
      enabled: () => !ctx.locked && mode() === 'optics' && ex() === 'prism',
      color: () => '#ff3b30',
    });
    // Scheinbare Hebung: Auge ziehen
    sp.addHandle({
      get: () => depthEye(shown.dep, shown.alpha).E,
      set: (x, y) => {
        stop();
        const h = p.dep;
        const nm = nMat();
        const yy = Math.max(0.05, y);
        const c = criticalAngle(nm, 1) ?? 89.5;
        const reach = (a: number) => h * Math.tan(toRad(a)) + yy * Math.tan(toRad(refractionAngle(nm, 1, a) ?? 89.9));
        let lo = 0;
        let hi = Math.min(89, c - 0.05);
        if (x <= 0) hi = 0;
        for (let k = 0; k < 40 && hi > lo; k++) {
          const mid = (lo + hi) / 2;
          if (reach(mid) < x) lo = mid;
          else hi = mid;
        }
        ctx.set({ alpha: clamp(Math.round(lo), 0, 89) });
      },
      enabled: () => !ctx.locked && mode() === 'optics' && ex() === 'depth',
      color: () => ctx.theme.series[0]!,
    });

    /* ---------- Diagramme antippen und ziehen ---------- */
    function inRect(r: Rect, px: number, py: number): boolean {
      return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
    }
    function panelHit(px: number, py: number): number {
      const kinds = panelsOf(mode());
      return regions().panels.findIndex((r, i) => inRect(r, px, py) && CHART_KINDS.includes(kinds[i]!));
    }
    function chartSet(i: number, px: number): void {
      const kind = panelsOf(mode())[i]!;
      const x = charts[i]!.toWorld(px, 0)[0];
      stop();
      if (kind === 'bend') ctx.set({ rb: clamp(Math.round(x * 2) / 2, 1, 15) });
      else if (kind === 'sin' || kind === 'fit') ctx.set({ alpha: clamp(Math.round(toDeg(Math.asin(clamp(x, 0, 1)))), 0, 89) });
      else if (kind === 'lift') {
        const c = criticalAngle(nMat(), 1);
        ctx.set({ alpha: clamp(Math.round(x), 0, c === null ? 89 : Math.floor(c)) });
      } else ctx.set({ alpha: clamp(Math.round(x), 0, 89) });
    }
    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && panelHit(px, py) >= 0,
      pointerDown: (q: { px: number; py: number }) => {
        const i = panelHit(q.px, q.py);
        if (i < 0 || ctx.locked) return false;
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
      hover: (q: { px: number; py: number } | null) => {
        surface.setCursor(q && panelHit(q.px, q.py) >= 0 ? 'ew-resize' : '');
      },
      wheel: () => false,
    });

    const offClock = ctx.clock.onChange((playing) => {
      if (!playing && mode() !== 'total' && Math.round(alpha) !== p.alpha) ctx.set({ alpha: Math.round(alpha) });
      if (!playing && sweepsAin() && Math.round(ainLive) !== p.ain) ctx.set({ ain: Math.round(ainLive) });
      if (playing && sweepsAin()) ainLive = p.ain;
      if (playing && mode() === 'total' && pulse < 0) pulse = 0;
    });

    intro.play();
    updateReadouts();

    return {
      update(changed, source) {
        // Ziehen und automatisches Schwenken zeigen sofort den neuen Wert; Regler und Beispiele gleiten
        const snap = source === 'sim' || source === 'init';
        if (changed.has('alpha') || source !== 'sim') {
          alpha = p.alpha;
          if (snap) shown.alpha = p.alpha;
        }
        if (snap) {
          for (const k of ['rb', 'ain', 'pa', 'dep'] as const) shown[k] = p[k];
        }
        if (changed.has('ain') || source !== 'sim') ainLive = p.ain;
        if (source === 'init') {
          const m0 = media();
          shown.n1 = m0.n1;
          shown.n2 = m0.n2;
        }
        if ((changed.has('top') || changed.has('bottom')) && source !== 'init') mediaFade.play();
        if (source !== 'init' && (changed.has('top') || changed.has('bottom') || changed.has('mode'))) prevMedia = { top: p.top as MediumId, bottom: p.bottom as MediumId };
        if (changed.has('from') && source !== 'init') fade.play(320);
        if (changed.has('mode') || changed.has('app') || changed.has('ex')) {
          if (source !== 'init') fade.play();
          view = null;
          pulse = -1;
          shown.deliv = -1;
          shown.share = -1;
          if (ctx.clock.playing && source === 'input') ctx.clock.pause();
        }
        if (changed.has('x') || source === 'replace' || source === 'init') rows = [];
        // Beim Umschalten von Hand passende Ausgangswerte setzen (geteilte Links bringen ihre Werte mit)
        if (source === 'input' && changed.has('app')) ctx.set({ ain: app() === 'fiber' ? 30 : 0 });
        if (source === 'input' && changed.has('ex')) ctx.set({ mat: ex() === 'depth' ? 'wasser' : 'glas' });
        updateReadouts();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'measure' && mode() === 'measure') {
          const a = Math.round(alpha);
          if (a === 0) {
            hint = { text: ctx.t('zeroAngle'), until: performance.now() + 2600 };
          } else if (rows.length >= MAX_ROWS) {
            hint = { text: ctx.t('full'), until: performance.now() + 2600 };
          } else {
            const b = refractionAngle(1, SAMPLES[p.x - 1]!.n, a)!;
            rows.push([a, readAngle(b)]);
            rowPop.play();
          }
        } else if (id === 'clear') rows = [];
        else if (id === 'new') {
          let k = p.x;
          while (k === p.x) k = 1 + Math.floor(Math.random() * SAMPLES.length);
          ctx.set({ x: k });
          rows = [];
          fade.play(320);
        } else if (id === 'pulse') {
          pulse = 0;
          ctx.clock.play();
        }
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        if (sweepsAin()) {
          ainLive += ainDir * 8 * dt;
          if (ainLive >= 30) [ainLive, ainDir] = [30, -1];
          if (ainLive <= -30) [ainLive, ainDir] = [-30, 1];
          shown.ain = ainLive;
          return;
        }
        if (mode() === 'total') {
          if (pulse < 0) pulse = 0;
          pulse += dt * 0.42;
          if (pulse >= 1) {
            pulse = 0;
            flash.play();
          }
          return;
        }
        alpha += sweepDir * 12 * dt;
        if (alpha >= 89) [alpha, sweepDir] = [89, -1];
        if (alpha <= 0) [alpha, sweepDir] = [0, 1];
        shown.alpha = alpha;
        updateReadouts();
      },

      resetTime() {
        alpha = mode() === 'total' ? p.alpha : 0;
        shown.alpha = alpha;
        sweepDir = 1;
        pulse = -1;
        updateReadouts();
      },

      render() {
        const nowMs = performance.now();
        const dt = Math.min(0.1, (nowMs - lastFrame) / 1000);
        lastFrame = nowMs;
        const reduced = prefersReducedMotion();
        // Bühne teilen (gleitet beim Wechsel der Ansicht)
        const st = splitTarget();
        if (split < 0 || reduced) split = st;
        else {
          split += (st - split) * (1 - Math.exp(-dt * 9));
          if (Math.abs(split - st) < 0.002) split = st;
        }
        // Werte weich nachführen
        const k = reduced ? 1 : 1 - Math.exp(-dt * 10);
        const m0 = media();
        const targetA = ctx.clock.playing && mode() !== 'total' ? alpha : p.alpha;
        shown.alpha = lerp(shown.alpha, targetA, k);
        shown.n1 = lerp(shown.n1, m0.n1, k);
        shown.n2 = lerp(shown.n2, m0.n2, k);
        shown.rb = lerp(shown.rb, p.rb, k);
        const targetAin = ctx.clock.playing && sweepsAin() ? ainLive : p.ain;
        shown.ain = lerp(shown.ain, targetAin, k);
        shown.pa = lerp(shown.pa, p.pa, k);
        shown.dep = lerp(shown.dep, p.dep, k);
        const near = (a: number, b: number, e: number) => Math.abs(a - b) < e;
        const settled =
          near(shown.alpha, targetA, 0.01) && near(shown.n1, m0.n1, 1e-4) && near(shown.n2, m0.n2, 1e-4) && near(shown.rb, p.rb, 1e-3) && near(shown.ain, targetAin, 0.01) && near(shown.pa, p.pa, 0.01) && near(shown.dep, p.dep, 1e-3);
        if (settled) {
          shown.alpha = targetA;
          shown.n1 = m0.n1;
          shown.n2 = m0.n2;
          shown.rb = p.rb;
          shown.ain = targetAin;
          shown.pa = p.pa;
          shown.dep = p.dep;
        }
        // Anteil für die große Zahl der Anwendungskarte (zählt weich)
        let shareMoving = false;
        if (mode() === 'total') {
          const target = app() === 'fiber' ? fiberTraces().deliv : app() === 'prism' ? prismStats(shown.ain).out : gemStats(shown.ain).top;
          if (app() === 'fiber') shown.deliv = shown.deliv < 0 || reduced ? target : lerp(shown.deliv, target, k);
          shown.share = shown.share < 0 || reduced ? target : lerp(shown.share, target, k);
          if (Math.abs(shown.share - target) < 1e-3) shown.share = target;
          if (app() === 'fiber' && Math.abs(shown.deliv - target) < 1e-3) shown.deliv = target;
          shareMoving = shown.share !== target || (app() === 'fiber' && shown.deliv !== target);
        }
        if (p.wave && mode() === 'ray' && !reduced) wavePhase += dt * 0.9;
        const reg = regions();
        sp.resize();
        for (const c of charts) c.resize();
        surface.begin();
        const r = reg.scene;
        g.save();
        roundRect(g, r.x, r.y, r.w, r.h, 12);
        g.clip();
        const m = mode();
        if (m === 'total') {
          if (app() === 'fiber') drawFiber(r, dt);
          else if (app() === 'prism') drawPrismApp(r, dt);
          else drawGem(r, dt);
        } else if (m === 'optics') {
          if (ex() === 'plate') drawPlate(r, dt);
          else if (ex() === 'prism') drawPrismOpt(r, dt);
          else drawDepth(r, dt);
        } else drawDisc(r);
        g.restore();
        frame(r);
        drawPanels(reg);
        if (fade.running) {
          g.fillStyle = withAlpha(ctx.theme.bg, 1 - fade.value);
          g.fillRect(0, 0, surface.width, surface.height);
        }
        const busy =
          !settled ||
          shareMoving ||
          split !== st ||
          intro.running ||
          fade.running ||
          mediaFade.running ||
          rowPop.running ||
          flash.running ||
          (p.wave && m === 'ray' && !reduced) ||
          (hint !== null && hint.until > nowMs) ||
          (!discMode() && view !== null && viewTarget !== null && view !== viewTarget);
        if (busy) ctx.requestRender();
      },

      destroy: () => {
        offClock();
        surface.destroy();
      },
    };
  },
});
