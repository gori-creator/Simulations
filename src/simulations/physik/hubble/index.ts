import { defineSimulation, drawCard, ease, offscreenCanvas, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  ageAtZ,
  ageGyr,
  C_KMS,
  cmbTemp,
  EPOCHS,
  fitThroughOrigin,
  GALAXY_LINES,
  HUBBLE_1929,
  hubbleTimeGyr,
  lcdm,
  makeDots,
  modelKind,
  MODERN,
  MPC_MLY,
  observe,
  omegaK,
  planck,
  q0,
  scaleHistory,
  sumSquares,
  VISIBLE,
  wavelengthRGB,
  wienPeak,
  zClassic,
  zFromComoving,
  type Cosmo,
  type Dot,
  type Galaxy,
  type Observation,
  type Pt2,
  type ScaleHistory,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const TAU = 2 * Math.PI;

/** Feste Farben des Weltraums (Szene ist immer dunkel, in hell und dunkel gleich). */
const SPACE = {
  top: '#050913',
  mid: '#0a1226',
  bottom: '#04060d',
  ink: 'rgba(226,234,252,0.94)',
  inkMuted: 'rgba(196,208,236,0.72)',
  halo: 'rgba(4,8,18,0.82)',
  core: [255, 236, 200] as const,
  arm: [160, 190, 255] as const,
  old: [255, 205, 150] as const,
};

/** Gezeigte Modelle zum Vergleich im Verlauf a(t). */
const MODELS: { id: string; Om: number; OL: number; de: string; en: string }[] = [
  { id: 'lcdm', Om: 0.3, OL: 0.7, de: 'Standardmodell', en: 'standard model' },
  { id: 'eds', Om: 1, OL: 0, de: 'nur Materie', en: 'matter only' },
  { id: 'empty', Om: 0, OL: 0, de: 'leer', en: 'empty' },
  { id: 'closed', Om: 3, OL: 0, de: 'geschlossen', en: 'closed' },
];

/**
 * Expandierendes Universum: Rosinenkuchen-Modell mit frei wählbarer
 * Heimatgalaxie, Rotverschiebung der Spektrallinien einer fernen Galaxie,
 * Hubble-Diagramm (Hubble 1929 und heute) mit ziehbarer Ausgleichsgerade,
 * eigene Messreihe mit Supernovae als Standardkerzen und die Geschichte des
 * Universums: Skalenfaktor a(t) nach Friedmann, Weltalter und
 * Hintergrundstrahlung.
 */
export default defineSimulation({
  id: 'hubble',
  images: { spiral: 'galaxie-spirale.webp', tilted: 'galaxie-schraeg.webp', elliptic: 'galaxie-elliptisch.webp' },
  animated: true,
  hint: (v: { readonly mode?: unknown }) =>
    v.mode === 'raisin'
      ? L('Tipp: Eine Galaxie antippen – sie wird zur Heimat. Von jeder aus fliehen alle anderen.', 'Tip: tap a galaxy – it becomes home. From every one of them, all others recede.')
      : v.mode === 'spectrum'
        ? L('Tipp: Die ferne Galaxie auf dem Maßstab ziehen.', 'Tip: drag the distant galaxy along the scale.')
        : v.mode === 'diagram'
          ? L('Tipp: Den Punkt am Ende der Geraden ziehen und die Gerade selbst anpassen.', 'Tip: drag the point at the end of the line to fit it yourself.')
          : v.mode === 'history'
            ? L('Tipp: Den Punkt auf der Kurve ziehen – so reist du in die Vergangenheit.', 'Tip: drag the point on the curve – that is how you travel into the past.')
            : L('Tipp: „Galaxie beobachten“ antippen und eine Messreihe aufbauen.', 'Tip: tap “Observe a galaxy” and build up a data set.'),
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'raisin', label: L('Rosinenkuchen: alle fliehen voneinander', 'Raisin bread: everything recedes') },
        { value: 'spectrum', label: L('Rotverschiebung im Spektrum', 'Redshift in the spectrum') },
        { value: 'diagram', label: L('Hubble-Diagramm', 'Hubble diagram') },
        { value: 'research', label: L('Selbst forschen: H₀ messen', 'Research: measure H₀ yourself') },
        { value: 'history', label: L('Geschichte des Universums', 'History of the universe') },
      ],
      default: 'raisin',
    },
    {
      key: 'h0',
      type: 'number',
      label: L('Hubble-Konstante H₀', 'Hubble constant H₀'),
      help: (v) => (v.mode === 'research' ? L('Der „wahre“ Wert im Experiment – die Messung soll ihn finden.', 'The “true” value in the experiment – your measurement should find it.') : L('Heutiger Messwert: etwa 67 bis 73 km/(s·Mpc).', 'Measured today: about 67 to 73 km/(s·Mpc).')),
      min: 40,
      max: 100,
      step: 1,
      default: 70,
      unit: 'km/(s·Mpc)',
      visibleIf: (v) => v.mode !== 'diagram',
    },
    { key: 'home', type: 'number', label: L('Heimatgalaxie Nr.', 'Home galaxy no.'), min: 0, max: 80, step: 1, default: 40, visibleIf: (v) => v.mode === 'raisin' },
    { key: 'arrows', type: 'boolean', group: 'view', label: L('Geschwindigkeitspfeile', 'Velocity arrows'), default: true, visibleIf: (v) => v.mode === 'raisin' },
    { key: 'grid', type: 'boolean', group: 'view', label: L('Mitbewegtes Gitter', 'Comoving grid'), default: true, visibleIf: (v) => v.mode === 'raisin' },
    { key: 'trail', type: 'boolean', group: 'view', label: L('Startpositionen zeigen', 'Show starting positions'), default: false, visibleIf: (v) => v.mode === 'raisin' },
    {
      key: 'd',
      type: 'number',
      label: L('Entfernung der Galaxie d', 'Distance of the galaxy d'),
      help: (v) => L(`≈ ${Math.round(Number(v.d) * MPC_MLY).toLocaleString('de-DE')} Mio. Lichtjahre`, `≈ ${Math.round(Number(v.d) * MPC_MLY).toLocaleString('en-GB')} million light years`),
      min: 1,
      max: 8000,
      step: 1,
      default: 100,
      unit: 'Mpc',
      visibleIf: (v) => v.mode === 'spectrum',
    },
    {
      key: 'zc',
      type: 'choice',
      label: L('Rotverschiebung berechnen', 'Compute the redshift'),
      options: [
        { value: 'cosmo', label: L('mit der Ausdehnung des Raums', 'from the expansion of space') },
        { value: 'classic', label: L('einfach: z = v/c mit v = H₀·d', 'simply: z = v/c with v = H₀·d') },
      ],
      default: 'cosmo',
      visibleIf: (v) => v.mode === 'spectrum',
    },
    {
      key: 'set',
      type: 'choice',
      label: L('Messdaten', 'Data'),
      options: [
        { value: 'modern', label: L('heute (Beispielwerte)', 'today (example values)') },
        { value: '1929', label: L('Hubble 1929', 'Hubble 1929') },
      ],
      default: 'modern',
      visibleIf: (v) => v.mode === 'diagram',
    },
    {
      key: 'hu',
      type: 'number',
      label: L('Deine Gerade: Steigung H', 'Your line: slope H'),
      help: L('Oder den Punkt am Ende der Geraden ziehen.', 'Or drag the point at the end of the line.'),
      min: 10,
      max: 800,
      step: 1,
      default: 40,
      unit: 'km/(s·Mpc)',
      visibleIf: (v) => v.mode === 'diagram',
    },
    { key: 'fit', type: 'boolean', group: 'view', label: L('Beste Ausgleichsgerade', 'Best-fit line'), default: false, visibleIf: (v) => v.mode === 'diagram' || v.mode === 'research' },
    { key: 'sq', type: 'boolean', group: 'view', label: L('Abweichungsquadrate zeigen', 'Show squared deviations'), default: false, visibleIf: (v) => v.mode === 'diagram' },
    { key: 'noise', type: 'boolean', label: L('Messfehler und Eigenbewegung', 'Measurement errors and peculiar motion'), default: true, visibleIf: (v) => v.mode === 'research' },
    { key: 'om', type: 'number', label: L('Materie Ω_m', 'Matter Ω_m'), help: L('Anteil der Materie (sichtbar und dunkel) an der kritischen Dichte.', 'Share of matter (visible and dark) of the critical density.'), min: 0, max: 3, step: 0.05, default: 0.3, visibleIf: (v) => v.mode === 'history' },
    { key: 'ol', type: 'number', label: L('Dunkle Energie Ω_Λ', 'Dark energy Ω_Λ'), help: L('Beschleunigt die Ausdehnung.', 'Accelerates the expansion.'), min: -0.5, max: 2, step: 0.05, default: 0.7, visibleIf: (v) => v.mode === 'history' },
    {
      key: 'lz',
      type: 'number',
      label: L('Zeitpunkt: log₁₀(1 + z)', 'Moment: log₁₀(1 + z)'),
      help: (v) => {
        const z = Math.pow(10, Number(v.lz)) - 1;
        const zs = z < 10 ? z.toFixed(2) : Math.round(z).toString();
        return L(`Rotverschiebung z = ${zs.replace('.', ',')} – oder den Punkt auf der Kurve ziehen.`, `Redshift z = ${zs} – or drag the point on the curve.`);
      },
      min: 0,
      max: 3.04,
      step: 0.01,
      default: 0.3,
      visibleIf: (v) => v.mode === 'history',
    },
    { key: 'cmp', type: 'boolean', group: 'view', label: L('Andere Modelle zum Vergleich', 'Other models for comparison'), default: true, visibleIf: (v) => v.mode === 'history' },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'restart', label: L('Ausdehnung neu starten', 'Restart the expansion'), primary: true, visibleIf: (v) => v.mode === 'raisin' },
    { id: 'obs', label: L('Galaxie beobachten', 'Observe a galaxy'), primary: true, visibleIf: (v) => v.mode === 'research' },
    { id: 'obs10', label: L('Zehn auf einmal', 'Ten at once'), visibleIf: (v) => v.mode === 'research' },
    { id: 'clear', label: L('Messreihe löschen', 'Clear the data'), visibleIf: (v) => v.mode === 'research' },
    { id: 'best', label: L('Beste Gerade übernehmen', 'Use the best line'), visibleIf: (v) => v.mode === 'diagram' },
  ],
  readouts: [
    { key: 'law', label: L('Hubble-Beziehung', 'Hubble’s law') },
    { key: 'z', label: L('Rotverschiebung', 'Redshift'), spoiler: true },
    { key: 'H', label: L('Hubble-Konstante', 'Hubble constant'), spoiler: true },
    { key: 'age', label: L('Alter des Universums', 'Age of the universe'), spoiler: true },
  ],
  presets: [
    { id: 'raisin', label: L('Rosinenkuchen: Von der Mitte aus', 'Raisin bread: seen from the middle'), values: { mode: 'raisin', home: 40 } },
    { id: 'edge', label: L('Heimat am Rand: Es gibt keinen Mittelpunkt', 'Home at the edge: there is no centre'), values: { mode: 'raisin', home: 9, trail: true } },
    { id: 'coma', label: L('Coma-Haufen: 100 Mpc', 'Coma cluster: 100 Mpc'), values: { mode: 'spectrum', d: 100, zc: 'cosmo' } },
    { id: 'far', label: L('Sehr fern: Hα im Infraroten', 'Very far: Hα in the infrared'), values: { mode: 'spectrum', d: 1500, zc: 'cosmo' } },
    { id: 'ftl', label: L('v = H₀·d größer als c?', 'v = H₀·d larger than c?'), values: { mode: 'spectrum', d: 5000, zc: 'classic' } },
    { id: 'h1929', label: L('Hubbles Daten von 1929', 'Hubble’s data from 1929'), values: { mode: 'diagram', set: '1929', hu: 300, fit: true } },
    { id: 'modern', label: L('Heutige Daten: Gerade anpassen', 'Today’s data: fit the line'), values: { mode: 'diagram', set: 'modern', hu: 40, sq: true, fit: false } },
    { id: 'research', label: L('Selbst forschen', 'Research yourself'), values: { mode: 'research', h0: 70, noise: true, fit: true } },
    { id: 'lcdm', label: L('Standardmodell: 13,5 Mrd. Jahre alt', 'Standard model: 13.5 billion years old'), values: { mode: 'history', om: 0.3, ol: 0.7, lz: 0.3 } },
    { id: 'eds', label: L('Nur Materie: gebremste Ausdehnung', 'Matter only: decelerating expansion'), values: { mode: 'history', om: 1, ol: 0, lz: 0.3 } },
    { id: 'crunch', label: L('Geschlossen: Endknall', 'Closed: big crunch'), values: { mode: 'history', om: 3, ol: 0, lz: 0.2 } },
    { id: 'cmb', label: L('Hintergrundstrahlung: z = 1090', 'Background radiation: z = 1090'), values: { mode: 'history', om: 0.3, ol: 0.7, lz: 3.04 } },
  ],
  strings: {
    de: {
      canvas: 'Expandierendes Universum: Galaxien entfernen sich voneinander, Spektrallinien sind rotverschoben, ein Hubble-Diagramm zeigt Geschwindigkeit über Entfernung, und der Skalenfaktor des Universums wächst mit der Zeit.',
      home: 'Heimat',
      you: 'Wir',
      milky: 'Milchstraße',
      galaxy: 'Galaxie',
      tNow: 'Zeit seit Start: {t} Mrd. Jahre,  Abstände × {a}',
      simple: 'vereinfacht: gleichbleibende Ausdehnungsrate',
      raisinT: 'Alle Galaxien fliehen – von jeder aus gesehen',
      raisin1: 'Jeder Abstand wächst um denselben Faktor. Eine doppelt so ferne Galaxie entfernt sich doppelt so schnell: v = H₀ · d.',
      raisin2: 'Wähle eine andere Heimat: Das Bild sieht von dort genauso aus. Es gibt keinen Mittelpunkt der Ausdehnung.',
      vd: 'v über d von der Heimat aus',
      dAx: 'd in Mpc',
      vAx: 'v in km/s',
      vAxK: 'v in 1000 km/s',
      specT: 'Licht einer fernen Galaxie',
      lab: 'Labor',
      obs: 'Galaxie',
      ir: 'Infrarot',
      uv: 'UV',
      lambdaAx: 'λ in nm',
      zLine: 'z = Δλ / λ₀ = {z}',
      specCosmo: 'Unterwegs dehnt sich der Raum – und mit ihm die Lichtwelle. Daher stammt die Rotverschiebung: 1 + z = a(heute) / a(damals).',
      specClassic: 'Einfache Rechnung wie beim Doppler-Effekt. Gut für nahe Galaxien, für ferne viel zu groß oder sinnlos (v > c).',
      ftl: 'H₀ · d ist größer als die Lichtgeschwindigkeit. Kein Widerspruch: Nicht die Galaxie rast durch den Raum, der Raum selbst dehnt sich.',
      travel: 'Licht war {t} Mrd. Jahre unterwegs',
      dist: 'Entfernung',
      ruler: 'Entfernung in Mpc (logarithmisch)',
      diagT: 'Hubble-Diagramm',
      diag1929: '1929 lagen die Entfernungen etwa 7-mal zu niedrig (falsch geeichte Cepheiden). Deshalb fand Hubble rund 500 km/(s·Mpc) statt etwa 70.',
      diagModern: 'Galaxien in der Nähe streuen durch ihre Eigenbewegung (M 31 kommt sogar auf uns zu). Weit entfernte Haufen liegen genau auf der Geraden.',
      yours: 'Deine Gerade',
      best: 'beste Gerade',
      ssq: 'Summe der Abweichungsquadrate',
      ratio: '{r} × so groß wie bei der besten Geraden',
      perfect: 'Besser geht es nicht!',
      resT: 'Eigene Messreihe',
      resHow: '1. Supernova vom Typ Ia: scheinbare Helligkeit m → Entfernung d (Standardkerze, M = −19,3).  2. Spektrum: Rotverschiebung z → Geschwindigkeit v.',
      resEmpty: 'Noch keine Galaxie gemessen. Tippe auf „Galaxie beobachten“.',
      resN: '{n} Galaxien gemessen',
      fitH: 'H₀ = {h} ± {s} km/(s·Mpc)',
      resAge: 'Hubble-Zeit 1/H₀ ≈ {t} Mrd. Jahre',
      scope: 'Teleskop',
      sn: 'Supernova',
      histT: 'Wie groß war das Universum?',
      aAx: 'a (Abstände relativ zu heute)',
      tAx: 't in Mrd. Jahren (0 = heute)',
      bang: 'Urknall',
      crunch: 'Endknall',
      today: 'heute',
      tangent: 'Tangente: 1/H₀',
      planckT: 'Hintergrundstrahlung damals',
      lAx: 'Wellenlänge',
      flat: 'flach',
      open: 'offen',
      closed: 'geschlossen',
      acc: 'beschleunigt',
      dec: 'gebremst',
      noBang: 'Dieses Modell hat keinen Urknall: Rückwärts gerechnet wird das Universum nie beliebig klein.',
      epochHead: 'Damals',
      ep_cmb: 'Das Universum wird durchsichtig: Hintergrundstrahlung wird frei (etwa 380 000 Jahre nach dem Urknall).',
      ep_dark: 'Dunkles Zeitalter: noch keine Sterne.',
      ep_stars: 'Die ersten Sterne leuchten auf.',
      ep_reion: 'Erste Galaxien machen das Gas wieder durchsichtig.',
      ep_peak: 'Die meisten Sterne entstehen.',
      ep_sun: 'Die Sonne und die Erde entstehen.',
      ep_now: 'Heute.',
      warmUniverse: 'Das ganze All leuchtet so heiß wie die Oberfläche eines roten Sterns.',
      coldUniverse: 'Die Strahlung ist im Mikrowellenbereich: Radioteleskope messen sie heute.',
    },
    en: {
      canvas: 'Expanding universe: galaxies move apart, spectral lines are redshifted, a Hubble diagram shows velocity against distance, and the scale factor of the universe grows with time.',
      home: 'home',
      you: 'us',
      milky: 'Milky Way',
      galaxy: 'galaxy',
      tNow: 'time since start: {t} billion years,  distances × {a}',
      simple: 'simplified: constant rate of expansion',
      raisinT: 'All galaxies recede – seen from each of them',
      raisin1: 'Every distance grows by the same factor. A galaxy twice as far away recedes twice as fast: v = H₀ · d.',
      raisin2: 'Pick another home: from there the picture looks just the same. The expansion has no centre.',
      vd: 'v against d, seen from home',
      dAx: 'd in Mpc',
      vAx: 'v in km/s',
      vAxK: 'v in 1000 km/s',
      specT: 'Light from a distant galaxy',
      lab: 'laboratory',
      obs: 'galaxy',
      ir: 'infrared',
      uv: 'UV',
      lambdaAx: 'λ in nm',
      zLine: 'z = Δλ / λ₀ = {z}',
      specCosmo: 'On the way, space stretches – and the light wave with it. That is where the redshift comes from: 1 + z = a(today) / a(then).',
      specClassic: 'A simple calculation like the Doppler effect. Fine for nearby galaxies, far too large or meaningless (v > c) for distant ones.',
      ftl: 'H₀ · d is larger than the speed of light. No contradiction: the galaxy is not racing through space, space itself stretches.',
      travel: 'light travelled for {t} billion years',
      dist: 'distance',
      ruler: 'distance in Mpc (logarithmic)',
      diagT: 'Hubble diagram',
      diag1929: 'In 1929 the distances were about 7 times too small (wrongly calibrated Cepheids). So Hubble found about 500 km/(s·Mpc) instead of about 70.',
      diagModern: 'Nearby galaxies scatter because of their own motion (M 31 is even approaching us). Distant clusters lie right on the line.',
      yours: 'your line',
      best: 'best line',
      ssq: 'sum of squared deviations',
      ratio: '{r} × as large as for the best line',
      perfect: 'It does not get any better!',
      resT: 'Your own data set',
      resHow: '1. Type Ia supernova: apparent magnitude m → distance d (standard candle, M = −19.3).  2. Spectrum: redshift z → velocity v.',
      resEmpty: 'No galaxy measured yet. Tap “Observe a galaxy”.',
      resN: '{n} galaxies measured',
      fitH: 'H₀ = {h} ± {s} km/(s·Mpc)',
      resAge: 'Hubble time 1/H₀ ≈ {t} billion years',
      scope: 'telescope',
      sn: 'supernova',
      histT: 'How big was the universe?',
      aAx: 'a (distances relative to today)',
      tAx: 't in billion years (0 = today)',
      bang: 'Big Bang',
      crunch: 'Big Crunch',
      today: 'today',
      tangent: 'tangent: 1/H₀',
      planckT: 'Background radiation back then',
      lAx: 'wavelength',
      flat: 'flat',
      open: 'open',
      closed: 'closed',
      acc: 'accelerating',
      dec: 'decelerating',
      noBang: 'This model has no Big Bang: going backwards, the universe never becomes arbitrarily small.',
      epochHead: 'Back then',
      ep_cmb: 'The universe becomes transparent: the background radiation is released (about 380,000 years after the Big Bang).',
      ep_dark: 'Dark ages: no stars yet.',
      ep_stars: 'The first stars light up.',
      ep_reion: 'The first galaxies make the gas transparent again.',
      ep_peak: 'Most stars are born.',
      ep_sun: 'The Sun and the Earth form.',
      ep_now: 'Today.',
      warmUniverse: 'The whole sky glows as hot as the surface of a red star.',
      coldUniverse: 'The radiation is in the microwave range: radio telescopes measure it today.',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 1e-12 ? 0 : v, d) : '∞');
    const S = (v: number, digits = 3) => (Number.isFinite(v) ? fmt.sig(v, digits) : '∞');
    const narrow = () => surface.width < 640;
    const wide = () => surface.width >= 640 && surface.width >= surface.height * 1.15;
    const OFF: Rect = { x: -1000, y: -1000, w: 10, h: 10 };
    const COL = {
      blue: () => th().series[0]!,
      red: () => th().series[1]!,
      green: () => th().series[2]!,
      orange: () => th().series[3]!,
      purple: () => th().series[4]!,
      teal: () => th().series[5]!,
    };

    /* -------------------------------------------------------------- */
    /* Aufteilung: Szene, Diagramm, Karte                              */
    /* -------------------------------------------------------------- */

    interface Lay {
      scene: Rect;
      chart: Rect | null;
      card: Rect;
    }
    const usesChart = () => p.mode !== 'diagram';
    function layout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide()) {
        const sw = Math.round(W * (p.mode === 'diagram' ? 0.64 : 0.58));
        const scene = { x: pad, y: pad, w: sw - pad, h: H - 2 * pad };
        const cx = sw + pad;
        const cw = W - cx - pad;
        if (!usesChart()) return { scene, chart: null, card: { x: cx, y: pad, w: cw, h: H - 2 * pad } };
        const ch = Math.round((H - 3 * pad) * 0.5);
        return { scene, chart: { x: cx, y: pad, w: cw, h: ch }, card: { x: cx, y: pad * 2 + ch, w: cw, h: H - ch - 3 * pad } };
      }
      const sh = Math.round(H * (usesChart() ? 0.42 : 0.56));
      const scene = { x: pad, y: pad, w: W - 2 * pad, h: sh };
      if (!usesChart()) return { scene, chart: null, card: { x: pad, y: sh + 2 * pad, w: W - 2 * pad, h: H - sh - 3 * pad } };
      const ch = Math.round(H * 0.26);
      return { scene, chart: { x: pad, y: sh + 2 * pad, w: W - 2 * pad, h: ch }, card: { x: pad, y: sh + ch + 3 * pad, w: W - 2 * pad, h: H - sh - ch - 4 * pad } };
    }
    let lay: Lay = layout();
    const inner = (r: Rect, m = 6): Rect => ({ x: r.x + m, y: r.y + m, w: r.w - 2 * m, h: r.h - 2 * m });

    /* -------------------------------------------------------------- */
    /* Diagramme                                                       */
    /* -------------------------------------------------------------- */

    const plotOpts = { zoom: false, pan: false, controls: false, equalAspect: false } as const;
    /** v über d im Rosinenkuchen-Modell */
    const plotRV = new Plot(surface, { ...plotOpts, x: [-5, 150], y: [-500, 10_000], region: () => (p.mode === 'raisin' && lay.chart ? inner(lay.chart, 8) : OFF), xAxis: { label: ctx.t('dAx') }, yAxis: { label: ctx.t('vAxK'), format: (v) => fmt.num(v / 1000, 0) } });
    /** Hubble-Diagramm (Daten bzw. eigene Messreihe) */
    const plotH = new Plot(surface, {
      ...plotOpts,
      x: [-20, 420],
      y: [-1000, 30_000],
      region: () => (p.mode === 'diagram' ? inner(lay.scene, 8) : p.mode === 'research' && lay.chart ? inner(lay.chart, 8) : OFF),
      xAxis: { label: ctx.t('dAx') },
      yAxis: { label: ctx.t('vAxK'), format: (v) => fmt.num(v / 1000, 0) },
    });
    /** Skalenfaktor a(t) */
    const plotA = new Plot(surface, { ...plotOpts, x: [-16, 22], y: [-0.15, 2.6], region: () => (p.mode === 'history' ? inner(lay.scene, 8) : OFF), xAxis: { label: ctx.t('tAx') }, yAxis: { label: 'a' } });
    /** Planck-Spektrum der Hintergrundstrahlung (x = log₁₀ λ/m) */
    const plotP = new Plot(surface, {
      ...plotOpts,
      x: [-7.2, -0.8],
      y: [-0.32, 1.25],
      region: () => {
        if (p.mode !== 'history' || !lay.chart) return OFF;
        const r = inner(lay.chart, 8);
        return { x: r.x, y: r.y + 22, w: r.w, h: r.h - 22 };
      },
      xAxis: { label: ctx.t('lAx'), format: (v) => lambdaLabel(Math.pow(10, v)), minStep: 1 },
      yAxis: { label: '', numbers: false },
    });

    /** Wellenlänge in m → lesbare Angabe (nm, µm, mm, cm). */
    function lambdaLabel(m: number): string {
      if (m < 1e-6) return `${N(m * 1e9, 0)} nm`;
      if (m < 1e-3) return `${N(m * 1e6, m < 1e-5 ? 1 : 0)} µm`;
      if (m < 1e-2) return `${N(m * 1e3, m < 2e-3 ? 2 : 1)} mm`;
      return `${N(m * 1e2, 1)} cm`;
    }

    /* -------------------------------------------------------------- */
    /* Weltraum: Hintergrund und Galaxien                              */
    /* -------------------------------------------------------------- */

    let bgCache: { key: string; canvas: HTMLCanvasElement } | null = null;
    /** Sternenhimmel als zwischengespeichertes Bild (gleich in hell und dunkel). */
    function spaceBackground(g: CanvasRenderingContext2D, r: Rect, seed = 1): void {
      const dpr = Math.min(2, typeof devicePixelRatio === 'number' ? devicePixelRatio : 1);
      const key = `${Math.round(r.w)}x${Math.round(r.h)}@${dpr}#${seed}`;
      if (!bgCache || bgCache.key !== key) {
        const { canvas, g: sg } = offscreenCanvas(r.w, r.h, dpr);
        const bg = sg.createLinearGradient(0, 0, r.w * 0.3, r.h);
        bg.addColorStop(0, SPACE.top);
        bg.addColorStop(0.55, SPACE.mid);
        bg.addColorStop(1, SPACE.bottom);
        sg.fillStyle = bg;
        sg.fillRect(0, 0, r.w, r.h);
        // zarte Nebel
        let s = seed * 7919 + 17;
        const rand = () => {
          s = (s * 16807) % 2147483647;
          return s / 2147483647;
        };
        for (let i = 0; i < 4; i++) {
          const x = rand() * r.w;
          const y = rand() * r.h;
          const rad = (0.25 + rand() * 0.35) * Math.max(r.w, r.h);
          const neb = sg.createRadialGradient(x, y, 0, x, y, rad);
          const hue = rand();
          const c = hue < 0.5 ? '90,110,200' : '150,90,170';
          neb.addColorStop(0, `rgba(${c},0.08)`);
          neb.addColorStop(1, `rgba(${c},0)`);
          sg.fillStyle = neb;
          sg.fillRect(0, 0, r.w, r.h);
        }
        const count = Math.round((r.w * r.h) / 700);
        for (let i = 0; i < count; i++) {
          const x = rand() * r.w;
          const y = rand() * r.h;
          const big = rand() < 0.06;
          const a = 0.25 + rand() * 0.6;
          const tint = rand();
          sg.fillStyle = tint < 0.15 ? `rgba(255,214,170,${a})` : tint < 0.35 ? `rgba(180,205,255,${a})` : `rgba(235,240,255,${a})`;
          sg.beginPath();
          sg.arc(x, y, big ? 1.3 : 0.6 + rand() * 0.4, 0, TAU);
          sg.fill();
          if (big) {
            sg.fillStyle = `rgba(200,215,255,${a * 0.16})`;
            sg.beginPath();
            sg.arc(x, y, 4, 0, TAU);
            sg.fill();
          }
        }
        bgCache = { key, canvas };
      }
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 12);
      g.clip();
      g.drawImage(bgCache.canvas, r.x, r.y, r.w, r.h);
      g.restore();
    }

    /** Farbe als rgba-Text, dazu eine Rotverschiebung 0 … 1 (wärmer, dunkler). */
    function rgb(c: readonly [number, number, number], alpha: number, red = 0): string {
      const r = Math.round(c[0] + (255 - c[0]) * red * 0.3);
      const gg = Math.round(c[1] * (1 - 0.45 * red));
      const b = Math.round(c[2] * (1 - 0.75 * red));
      return `rgba(${r},${gg},${b},${alpha})`;
    }

    /**
     * Gezeichnete Galaxie: Spirale mit hellem Kern und zwei Armen oder
     * elliptische Galaxie als weicher Lichtfleck. red färbt rotverschoben.
     */
    function drawGalaxy(g: CanvasRenderingContext2D, x: number, y: number, size: number, dot: Pick<Dot, 'hue' | 'spiral'>, rot: number, alpha = 1, red = 0): void {
      if (size < 0.6 || alpha <= 0.01) return;
      // Ab mittlerer Größe ein Foto (ohne Rotverschiebung – die zeigt die gezeichnete Galaxie)
      if (size >= 5 && red < 0.02) {
        const tilt0 = 0.45 + dot.hue * 0.45;
        const key = !dot.spiral ? 'elliptic' : tilt0 > 0.72 ? 'spiral' : 'tilted';
        const img = ctx.images.get(key);
        if (img) {
          g.save();
          g.translate(x, y);
          g.rotate(rot);
          g.globalAlpha *= alpha;
          // Galaxie füllt etwa 85 % des Bildes; gezeichnet reicht sie bis 1,5 · size
          const d = size * 3.4;
          g.drawImage(img, -d / 2, -d / 2, d, d);
          g.restore();
          return;
        }
      }
      g.save();
      g.translate(x, y);
      g.rotate(rot);
      g.globalAlpha *= alpha;
      g.globalCompositeOperation = 'lighter';
      const tilt = 0.45 + dot.hue * 0.45;
      if (!dot.spiral) {
        g.scale(1, 0.55 + dot.hue * 0.4);
        const halo = g.createRadialGradient(0, 0, 0, 0, 0, size * 1.3);
        halo.addColorStop(0, rgb(SPACE.core, 0.95, red));
        halo.addColorStop(0.25, rgb(SPACE.old, 0.55, red));
        halo.addColorStop(1, rgb(SPACE.old, 0, red));
        g.fillStyle = halo;
        g.beginPath();
        g.arc(0, 0, size * 1.3, 0, TAU);
        g.fill();
        g.restore();
        return;
      }
      g.scale(1, tilt);
      // Scheibe
      const disk = g.createRadialGradient(0, 0, 0, 0, 0, size * 1.5);
      disk.addColorStop(0, rgb(SPACE.arm, 0.35, red));
      disk.addColorStop(1, rgb(SPACE.arm, 0, red));
      g.fillStyle = disk;
      g.beginPath();
      g.arc(0, 0, size * 1.5, 0, TAU);
      g.fill();
      // zwei logarithmische Spiralarme
      if (size > 3) {
        g.lineCap = 'round';
        for (const arm of [0, Math.PI]) {
          g.beginPath();
          for (let i = 0; i <= 26; i++) {
            const u = i / 26;
            const ang = arm + u * 3.4;
            const rr = size * (0.18 + 1.15 * u);
            const px = rr * Math.cos(ang);
            const py = rr * Math.sin(ang);
            if (i === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.strokeStyle = rgb(SPACE.arm, 0.5, red);
          g.lineWidth = Math.max(1, size * 0.22);
          g.stroke();
          g.strokeStyle = rgb([220, 230, 255], 0.35, red);
          g.lineWidth = Math.max(0.6, size * 0.08);
          g.stroke();
        }
      }
      // Kern
      const core = g.createRadialGradient(0, 0, 0, 0, 0, size * 0.55);
      core.addColorStop(0, rgb([255, 250, 235], 1, red));
      core.addColorStop(0.4, rgb(SPACE.core, 0.75, red));
      core.addColorStop(1, rgb(SPACE.core, 0, red));
      g.fillStyle = core;
      g.beginPath();
      g.arc(0, 0, size * 0.55, 0, TAU);
      g.fill();
      g.restore();
    }

    /** Text mit dunklem Halo auf dem Sternenhimmel. */
    function spaceText(g: CanvasRenderingContext2D, s: string, x: number, y: number, opts: { size?: number; weight?: number; color?: string; align?: CanvasTextAlign; base?: CanvasTextBaseline } = {}): void {
      g.save();
      g.font = `${opts.weight ?? 600} ${opts.size ?? 13}px ${th().font}`;
      g.textAlign = opts.align ?? 'left';
      g.textBaseline = opts.base ?? 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 4;
      g.strokeStyle = SPACE.halo;
      g.strokeText(s, x, y);
      g.fillStyle = opts.color ?? SPACE.ink;
      g.fillText(s, x, y);
      g.restore();
    }

    /** Pfeil in Pixeln. */
    function arrowPx(g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, col: string, w = 2, head = 7): void {
      const L0 = Math.hypot(x1 - x0, y1 - y0);
      if (L0 < 2) return;
      const ux = (x1 - x0) / L0;
      const uy = (y1 - y0) / L0;
      const hd = Math.min(head, L0 * 0.5);
      g.save();
      g.strokeStyle = col;
      g.fillStyle = col;
      g.lineWidth = w;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.6, y1 - uy * hd * 0.6);
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.5, y1 - uy * hd + ux * hd * 0.5);
      g.lineTo(x1 - ux * hd + uy * hd * 0.5, y1 - uy * hd - ux * hd * 0.5);
      g.closePath();
      g.fill();
      g.restore();
    }

    /** Kartentext mit Zeilenumbruch; liefert die Höhe. */
    interface Seg {
      s: string;
      c?: string;
      w?: number;
    }
    function segLine(g: CanvasRenderingContext2D, segs: Seg[], x: number, y: number, maxW: number, size: number): number {
      let s = size;
      const width = (z: number) =>
        segs.reduce((sum, sg) => {
          g.font = `${sg.w ?? 500} ${z}px ${th().font}`;
          return sum + g.measureText(sg.s).width;
        }, 0);
      while (s > 11.5 && width(s) > maxW * 1.6) s -= 0.5;
      g.save();
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of sg.s.split(/(?<= )/)) {
          const ww = g.measureText(wd).width;
          if (cx + ww > x + maxW && cx > x + 4) {
            cx = x;
            cy += s * 1.35;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += ww;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 1: Rosinenkuchen-Modell                                 */
    /* -------------------------------------------------------------- */

    const GRID_N = 9;
    const dots = makeDots(7, 1, GRID_N);
    /** Mitbewegter Abstand 1 entspricht heute 40 Mpc. */
    const UNIT_MPC = 40;
    const A_MAX = 2.6;
    /** Zeit seit Start der Ausdehnung in Mrd. Jahren */
    let tRun = 0;
    const scaleNow = () => Math.exp(tRun / hubbleTimeGyr(p.h0));
    /** Kamera folgt der Heimatgalaxie (weicher Wechsel) */
    let camFrom: [number, number] = [dots[p.home]?.x ?? 0, dots[p.home]?.y ?? 0];
    const camTw = new Tween(900, ease.inOutCubic);
    const intro = new Tween(1100, ease.outCubic);
    intro.play();
    const homeDot = () => dots[clamp(Math.round(p.home), 0, dots.length - 1)]!;
    function cam(): [number, number] {
      const h = homeDot();
      if (!camTw.running) return [h.x, h.y];
      const u = camTw.value;
      return [camFrom[0] + (h.x - camFrom[0]) * u, camFrom[1] + (h.y - camFrom[1]) * u];
    }
    let drawnDots: { i: number; x: number; y: number }[] = [];

    /** Drei Vergleichsgalaxien in etwa einfacher, doppelter und dreifacher Entfernung. */
    function rulerDots(): number[] {
      const h = homeDot();
      const out: number[] = [];
      for (const target of [0.5, 1.0, 1.5]) {
        let best = -1;
        let bd = Infinity;
        dots.forEach((d, i) => {
          if (d === h || out.includes(i)) return;
          const dist = Math.hypot(d.x - h.x, d.y - h.y);
          const angI = Math.atan2(d.y - h.y, d.x - h.x);
          const clash = out.some((o) => {
            const q = dots[o]!;
            const ao = Math.atan2(q.y - h.y, q.x - h.x);
            return Math.abs(Math.atan2(Math.sin(angI - ao), Math.cos(angI - ao))) < 0.6;
          });
          if (clash) return;
          // bevorzugt nach rechts oben, damit die Linien nicht übereinanderliegen
          const ang = Math.atan2(d.y - h.y, d.x - h.x);
          const want = [0.35, -0.6, 2.4][out.length]!;
          const score = Math.abs(dist - target) + 0.25 * Math.abs(Math.atan2(Math.sin(ang - want), Math.cos(ang - want)));
          if (score < bd) {
            bd = score;
            best = i;
          }
        });
        if (best >= 0) out.push(best);
      }
      return out;
    }
    const RULER_COL = () => [COL.teal(), COL.purple(), COL.red()];

    function drawRaisin(g: CanvasRenderingContext2D, R: Rect): void {
      spaceBackground(g, R, 3);
      const a = scaleNow();
      const [camX, camY] = cam();
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2;
      const k = Math.min(R.w, R.h) / 2 / (UNIT_MPC * 1.2);
      const toPx = (x: number, y: number, aa = a): [number, number] => [cx + (x - camX) * UNIT_MPC * aa * k, cy - (y - camY) * UNIT_MPC * aa * k];
      const fade = intro.running ? intro.value : 1;
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.clip();
      // mitbewegtes Gitter
      if (p.grid) {
        g.strokeStyle = 'rgba(120,150,230,0.16)';
        g.lineWidth = 1;
        for (let i = -6; i <= 6; i++) {
          const u = i * 0.25;
          const [x0, y0] = toPx(u, -1.6);
          const [x1, y1] = toPx(u, 1.6);
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
          g.stroke();
          const [x2, y2] = toPx(-1.6, u);
          const [x3, y3] = toPx(1.6, u);
          g.beginPath();
          g.moveTo(x2, y2);
          g.lineTo(x3, y3);
          g.stroke();
        }
      }
      // Startpositionen
      if (p.trail && a > 1.02) {
        for (const d of dots) {
          const [x0, y0] = toPx(d.x, d.y, 1);
          const [x1, y1] = toPx(d.x, d.y);
          g.strokeStyle = 'rgba(200,210,255,0.18)';
          g.lineWidth = 1;
          g.setLineDash([3, 4]);
          g.beginPath();
          g.moveTo(x0, y0);
          g.lineTo(x1, y1);
          g.stroke();
          g.setLineDash([]);
          g.fillStyle = 'rgba(200,210,255,0.35)';
          g.beginPath();
          g.arc(x0, y0, 1.8, 0, TAU);
          g.fill();
        }
      }
      const h = homeDot();
      const sizeK = narrow() ? 0.8 : 1;
      drawnDots = [];
      // Geschwindigkeitspfeile (relativ zur Heimat): Länge ∝ Abstand
      if (p.arrows) {
        const [hx, hy] = toPx(h.x, h.y);
        for (const d of dots) {
          if (d === h) continue;
          const [x, y] = toPx(d.x, d.y);
          if (x < R.x - 40 || x > R.x + R.w + 40 || y < R.y - 40 || y > R.y + R.h + 40) continue;
          const f = 0.32 * fade;
          arrowPx(g, x, y, x + (x - hx) * f, y + (y - hy) * f, 'rgba(255,170,80,0.75)', 1.6, 6);
        }
      }
      // Galaxien (bleiben gleich groß: Galaxien selbst dehnen sich nicht)
      dots.forEach((d, i) => {
        const [x, y] = toPx(d.x, d.y);
        if (x < R.x - 30 || x > R.x + R.w + 30 || y < R.y - 30 || y > R.y + R.h + 30) return;
        drawnDots.push({ i, x, y });
        drawGalaxy(g, x, y, 6.5 * d.size * sizeK, d, d.hue * TAU, fade);
      });
      // Maßstäbe zu drei Galaxien
      const [hx, hy] = toPx(h.x, h.y);
      const rd = rulerDots();
      rd.forEach((idx, n) => {
        const d = dots[idx]!;
        const [x, y] = toPx(d.x, d.y);
        const col = RULER_COL()[n]!;
        g.save();
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.setLineDash([6, 4]);
        g.beginPath();
        g.moveTo(hx, hy);
        g.lineTo(x, y);
        g.stroke();
        g.setLineDash([]);
        g.beginPath();
        g.arc(x, y, 11, 0, TAU);
        g.stroke();
        g.restore();
        if (p.val) {
          const dist = Math.hypot(d.x - h.x, d.y - h.y) * UNIT_MPC * a;
          const lx = clamp((hx + x) / 2, R.x + 80, R.x + R.w - 80);
          const ly = clamp((hy + y) / 2, R.y + 60, R.y + R.h - 16);
          spaceText(g, `${N(dist, 0)} Mpc · ${N(p.h0 * dist, 0)} km/s`, lx, ly - 10, { size: narrow() ? 11 : 12, color: col, align: 'center', weight: 700 });
        }
      });
      // Heimat
      g.save();
      g.strokeStyle = 'rgba(140,230,160,0.95)';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(hx, hy, 15, 0, TAU);
      g.stroke();
      g.restore();
      spaceText(g, ctx.t('home'), hx, hy + 26, { size: 13, weight: 800, color: 'rgba(150,240,170,1)', align: 'center' });
      g.restore();
      // Kopfzeile
      spaceText(g, tr('tNow', { t: N(tRun, 1), a: N(a, 2) }), R.x + 14, R.y + 18, { size: narrow() ? 12 : 13, weight: 700 });
      spaceText(g, ctx.t('simple'), R.x + 14, R.y + 36, { size: 11, weight: 500, color: SPACE.inkMuted });
    }

    function drawRaisinChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const a = scaleNow();
      const h = homeDot();
      const dMax = UNIT_MPC * a * 2.4;
      plotRV.setRange([-dMax * 0.12, dMax], [-p.h0 * dMax * 0.13, p.h0 * dMax * 1.05]);
      plotRV.resize();
      plotRV.begin();
      plotRV.grid();
      plotRV.axes();
      plotRV.fn((x) => p.h0 * x, { color: withAlpha(COL.orange(), 0.85), width: 2 });
      const rd = rulerDots();
      for (const [i, d] of dots.entries()) {
        if (d === h) continue;
        const dist = Math.hypot(d.x - h.x, d.y - h.y) * UNIT_MPC * a;
        if (dist > dMax) continue;
        const n = rd.indexOf(i);
        plotRV.point(dist, p.h0 * dist, { color: n >= 0 ? RULER_COL()[n]! : withAlpha(COL.blue(), 0.55), radius: n >= 0 ? 5.5 : 3 });
      }
      plotRV.text(dMax * 0.62, p.h0 * dMax * 0.62, `v = H₀ · d`, { color: COL.orange(), size: 13, weight: 'bold', align: 'left', offset: [10, 12], halo: true });
      plotRV.end();
      const g2 = surface.g;
      g2.save();
      g2.font = `700 12px ${th().font}`;
      g2.fillStyle = th().muted;
      g2.textAlign = 'right';
      g2.fillText(ctx.t('vd'), R.x + R.w - 14, R.y + 22);
      g2.restore();
    }

    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'raisin' || ctx.locked) return null;
        let best: string | null = null;
        let bd = narrow() ? 22 : 16;
        for (const d of drawnDots) {
          const dd = Math.hypot(px - d.x, py - d.y);
          if (dd < bd) {
            bd = dd;
            best = String(d.i);
          }
        }
        return best;
      },
      onTap: (id) => setHome(Number(id)),
    });
    function setHome(i: number): void {
      if (i === p.home) return;
      camFrom = cam();
      camTw.play();
      ctx.set({ home: i });
    }
    function homeKeys(): void {
      if (p.mode !== 'raisin') {
        ctx.setKeyTargets([]);
        return;
      }
      const i = Math.floor(p.home / GRID_N);
      const j = p.home % GRID_N;
      const de = ctx.lang === 'de';
      const mk = (id: string, di: number, dj: number, de1: string, en1: string) => ({
        id,
        label: de ? `Heimat ${de1}` : `Home ${en1}`,
        activate: () => {
          const ni = clamp(i + di, 0, GRID_N - 1);
          const nj = clamp(j + dj, 0, GRID_N - 1);
          setHome(ni * GRID_N + nj);
        },
      });
      ctx.setKeyTargets([mk('left', -1, 0, 'eine Galaxie nach links', 'one galaxy left'), mk('right', 1, 0, 'eine Galaxie nach rechts', 'one galaxy right'), mk('up', 0, 1, 'eine Galaxie nach oben', 'one galaxy up'), mk('down', 0, -1, 'eine Galaxie nach unten', 'one galaxy down')]);
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 2: Rotverschiebung im Spektrum                          */
    /* -------------------------------------------------------------- */

    const D_MIN = 1;
    const D_MAX = 8000;
    /** berechnete Werte für die aktuelle Entfernung */
    let spec = { zCos: 0, zCla: 0, v: 0, look: 0 as number | null };
    function computeSpectrum(): void {
      const c = lcdm(p.h0);
      const zCos = zFromComoving(c, p.d);
      spec = { zCos, zCla: zClassic(p.h0 * p.d), v: p.h0 * p.d, look: Number.isFinite(zCos) ? (ageGyr(c, 1500) ?? 0) - (ageAtZ(c, zCos, 800) ?? 0) : null };
    }
    const zShown = () => (p.zc === 'classic' ? spec.zCla : spec.zCos);
    /** weicher Übergang der Linien bei Änderungen */
    let zFrom = 0;
    const zTw = new Tween(700, ease.inOutCubic);
    const zAnim = () => (zTw.running ? zFrom + (zShown() - zFrom) * zTw.value : zShown());
    let wavePhase = 0;

    /** Lage auf dem logarithmischen Maßstab (0 … 1). */
    const uOfD = (d: number) => Math.log10(d / D_MIN) / Math.log10(D_MAX / D_MIN);
    const dOfU = (u: number) => D_MIN * Math.pow(D_MAX / D_MIN, clamp(u, 0, 1));
    function specGeo(R: Rect) {
      const x0 = R.x + (narrow() ? 44 : 62);
      const x1 = R.x + R.w - (narrow() ? 30 : 46);
      const midY = R.y + R.h * 0.42;
      const rulerY = R.y + R.h - (narrow() ? 46 : 54);
      return { x0, x1, midY, rulerY, gx: (d: number) => x0 + 50 + uOfD(d) * (x1 - x0 - 50) };
    }
    let dragGal = false;
    let hoverGal = false;
    let galPos: [number, number] = [0, 0];

    function drawSpectrumScene(g: CanvasRenderingContext2D, R: Rect): void {
      spaceBackground(g, R, 5);
      const G = specGeo(R);
      const z = zAnim();
      const red = clamp(Math.log10(1 + z) / 0.8, 0, 1);
      const gx = G.gx(p.d);
      const sz = (narrow() ? 13 : 17) * (1 - 0.55 * uOfD(p.d));
      galPos = [gx, G.midY];
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.clip();
      // Lichtwelle von der Galaxie zu uns
      const lam0 = narrow() ? 12 : 16;
      const xa = gx - sz * 1.4;
      const xb = G.x0 + 24;
      if (xa > xb + 4) {
        const len = xa - xb;
        const nSeg = Math.ceil(len / 2);
        let phase = wavePhase;
        let px = xa;
        const amp = narrow() ? 8 : 11;
        g.lineWidth = 2.2;
        g.lineCap = 'round';
        let prev: [number, number] | null = null;
        for (let i = 0; i <= nSeg; i++) {
          const s = i / nSeg; // 0 an der Galaxie, 1 bei uns
          const stretch = p.zc === 'classic' ? 1 + z : 1 + z * s;
          const lamPx = lam0 * Math.min(stretch, 14);
          const x = xa - s * len;
          if (i > 0) phase += (px - x) / lamPx;
          px = x;
          const y = G.midY + amp * Math.sin(TAU * phase);
          const nm = 520 * stretch;
          const [r, gg, b] = nm <= VISIBLE[1] ? wavelengthRGB(nm) : [150, 70, 70];
          if (prev) {
            g.strokeStyle = `rgba(${Math.max(r, 60)},${Math.max(gg, 30)},${Math.max(b, 30)},0.95)`;
            g.beginPath();
            g.moveTo(prev[0], prev[1]);
            g.lineTo(x, y);
            g.stroke();
          }
          prev = [x, y];
        }
      }
      // Milchstraße (wir) und die ferne Galaxie
      drawGalaxy(g, G.x0, G.midY, narrow() ? 17 : 22, { hue: 0.3, spiral: true }, 0.4);
      spaceText(g, ctx.t('milky'), G.x0, G.midY + (narrow() ? 30 : 36), { size: 12, weight: 700, align: 'center' });
      drawGalaxy(g, gx, G.midY, sz, { hue: 0.6, spiral: true }, 1.1, 1, red);
      if (hoverGal || dragGal) {
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(gx, G.midY, sz * 1.6 + 6, 0, TAU);
        g.stroke();
      }
      const lbl = `d = ${N(p.d, 0)} Mpc ≈ ${N((p.d * MPC_MLY) / 1000, p.d < 300 ? 2 : 1)} Mrd. Lj`;
      spaceText(g, ctx.lang === 'de' ? lbl : lbl.replace('Mrd. Lj', 'bn ly'), clamp(gx, R.x + 90, R.x + R.w - 90), G.midY - sz * 1.6 - 16, { size: 12, weight: 700, align: 'center' });
      // logarithmischer Maßstab
      const ry = G.rulerY;
      const rx0 = G.gx(D_MIN);
      const rx1 = G.gx(D_MAX);
      g.strokeStyle = 'rgba(210,220,245,0.6)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(rx0, ry);
      g.lineTo(rx1, ry);
      g.stroke();
      for (let e = 0; e <= 3; e++) {
        for (let m = 1; m < 10; m++) {
          const d = m * Math.pow(10, e);
          if (d > D_MAX) break;
          const x = G.gx(d);
          const major = m === 1;
          g.beginPath();
          g.moveTo(x, ry);
          g.lineTo(x, ry + (major ? 8 : 4));
          g.stroke();
          if (major) {
            spaceText(g, `${N(d, 0)}`, x, ry + 18, { size: 11, weight: 600, align: 'center', color: SPACE.inkMuted });
          }
        }
      }
      spaceText(g, ctx.t('ruler'), rx0, ry + 36, { size: 11, weight: 500, color: SPACE.inkMuted });
      // Marke auf dem Maßstab
      g.fillStyle = 'rgba(255,190,120,1)';
      g.beginPath();
      g.moveTo(gx, ry - 2);
      g.lineTo(gx - 6, ry - 12);
      g.lineTo(gx + 6, ry - 12);
      g.closePath();
      g.fill();
      g.restore();
      // Kopfzeile
      spaceText(g, ctx.t('specT'), R.x + 14, R.y + 18, { size: 13, weight: 800 });
      if (p.val && spec.look !== null && p.zc === 'cosmo') spaceText(g, tr('travel', { t: N(spec.look, 2) }), R.x + 14, R.y + 36, { size: 12, weight: 500, color: SPACE.inkMuted });
    }

    surface.addTarget({
      contains: (px: number, py: number) => p.mode === 'spectrum' && !ctx.locked && Math.hypot(px - galPos[0], py - galPos[1]) < 30,
      pointerDown: (q: { px: number; py: number }) => {
        if (p.mode !== 'spectrum' || ctx.locked || Math.hypot(q.px - galPos[0], q.py - galPos[1]) > 30) return false;
        dragGal = true;
        surface.setCursor('grabbing');
        return true;
      },
      pointerMove: (q: { px: number; py: number }) => {
        if (!dragGal) return;
        const G = specGeo(lay.scene);
        const u = (q.px - G.x0 - 50) / (G.x1 - G.x0 - 50);
        const d = dOfU(u);
        ctx.set({ d: d < 20 ? Math.round(d * 10) / 10 : d < 200 ? Math.round(d) : Math.round(d / 10) * 10 });
      },
      pointerUp: () => {
        dragGal = false;
        surface.setCursor(hoverGal ? 'grab' : '');
        ctx.requestRender();
      },
      hover: (q: { px: number; py: number } | null) => {
        const h = !!q && p.mode === 'spectrum' && !ctx.locked && Math.hypot(q.px - galPos[0], q.py - galPos[1]) < 30;
        if (h !== hoverGal) {
          hoverGal = h;
          ctx.requestRender();
        }
        surface.setCursor(h ? 'grab' : '');
      },
      wheel: () => false,
    });
    function specKeys(): void {
      if (p.mode !== 'spectrum') return;
      const de = ctx.lang === 'de';
      ctx.setKeyTargets([
        { id: 'nearer', label: de ? 'Galaxie näher (Entfernung halbieren)' : 'Galaxy closer (halve the distance)', activate: () => ctx.set({ d: Math.max(D_MIN, Math.round(p.d / 2)) }) },
        { id: 'farther', label: de ? 'Galaxie weiter weg (Entfernung verdoppeln)' : 'Galaxy farther (double the distance)', activate: () => ctx.set({ d: Math.min(D_MAX, Math.round(p.d * 2)) }) },
      ]);
    }

    /** Zwei Spektren übereinander: Labor und Galaxie, mit Linien. */
    function drawSpectra(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const z = zAnim();
      const t = th();
      const pad = narrow() ? 12 : 16;
      const x0 = R.x + pad;
      const x1 = R.x + R.w - pad;
      const top = R.y + (narrow() ? 26 : 34);
      const stripH = Math.max(14, Math.min(34, (R.h - 120) / 2));
      const gap = Math.max(32, Math.min(46, R.h - 2 * stripH - 90));
      const yLab = top + 6;
      const yObs = yLab + stripH + gap;
      const lMin = 350;
      const lMax = Math.min(60_000, Math.max(800, 690 * (1 + Math.max(z, zShown())) * 1.08));
      const X = (nm: number) => x0 + ((Math.log(nm) - Math.log(lMin)) / (Math.log(lMax) - Math.log(lMin))) * (x1 - x0);
      // Regenbogen im sichtbaren Bereich, grau außerhalb
      const strip = (y: number) => {
        g.save();
        roundRect(g, x0, y, x1 - x0, stripH, 5);
        g.clip();
        g.fillStyle = t.dark ? '#2a2f3a' : '#4a505c';
        g.fillRect(x0, y, x1 - x0, stripH);
        const vx0 = X(VISIBLE[0]);
        const vx1 = Math.min(X(VISIBLE[1]), x1);
        for (let x = Math.floor(vx0); x <= vx1; x++) {
          const nm = Math.exp(Math.log(lMin) + ((x - x0) / (x1 - x0)) * (Math.log(lMax) - Math.log(lMin)));
          const [r, gg, b] = wavelengthRGB(nm);
          g.fillStyle = `rgb(${r},${gg},${b})`;
          g.fillRect(x, y, 1.5, stripH);
        }
        g.restore();
      };
      strip(yLab);
      strip(yObs);
      g.save();
      g.font = `700 ${narrow() ? 11 : 12}px ${t.font}`;
      g.fillStyle = t.text;
      g.textBaseline = 'bottom';
      g.fillText(ctx.t('lab'), x0, yLab - 3);
      g.fillText(`${ctx.t('obs')}  (z = ${S(z, 3)})`, x0, yObs - 3);
      g.restore();
      // Linien
      for (const ln of GALAXY_LINES) {
        const xl = X(ln.lambda);
        const xo = X(ln.lambda * (1 + z));
        g.fillStyle = 'rgba(0,0,0,0.85)';
        const w = 1.5 + ln.depth * 1.6;
        g.fillRect(xl - w / 2, yLab, w, stripH);
        if (xo <= x1 + 1) {
          g.fillRect(xo - w / 2, yObs, w, stripH);
          g.strokeStyle = withAlpha(t.muted, ln.id === 'Ha' ? 0.9 : 0.4);
          g.lineWidth = ln.id === 'Ha' ? 1.6 : 1;
          g.beginPath();
          g.moveTo(xl, yLab + stripH);
          g.lineTo(xo, yObs);
          g.stroke();
        }
      }
      // Bezeichnungen ausgewählter Linien
      g.save();
      g.font = `600 11px ${t.font}`;
      g.textAlign = 'center';
      g.fillStyle = t.muted;
      for (const id of narrow() ? ['Hb', 'Ha'] : ['K', 'Hb', 'Na', 'Ha']) {
        const ln = GALAXY_LINES.find((l) => l.id === id)!;
        g.fillText(ln.label, X(ln.lambda), yLab + stripH + 12);
      }
      g.restore();
      // Achse
      const ay = yObs + stripH + 6;
      g.save();
      g.strokeStyle = t.axis;
      g.fillStyle = t.muted;
      g.lineWidth = 1;
      g.font = `500 11px ${t.font}`;
      g.textAlign = 'center';
      g.beginPath();
      g.moveTo(x0, ay);
      g.lineTo(x1, ay);
      g.stroke();
      const ticks = [400, 500, 700, 1000, 2000, 5000, 10_000, 20_000, 50_000].filter((v) => v <= lMax);
      let lastX = -1e9;
      for (const v of ticks) {
        const x = X(v);
        g.beginPath();
        g.moveTo(x, ay);
        g.lineTo(x, ay + 4);
        g.stroke();
        if (x - lastX > 34) {
          g.fillText(fmt.num(v, 0), x, ay + 15);
          lastX = x;
        }
      }
      g.textAlign = 'right';
      g.fillText(ctx.t('lambdaAx'), x1, ay + 28);
      g.textAlign = 'left';
      g.fillStyle = 'rgba(235,240,250,0.9)';
      g.font = `600 11px ${t.font}`;
      if (X(VISIBLE[1]) < x1 - 70) g.fillText(`${ctx.t('ir')} →`, X(VISIBLE[1]) + 8, yLab + stripH / 2 + 4);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 3: Hubble-Diagramm                                      */
    /* -------------------------------------------------------------- */

    const dataSet = (): readonly Galaxy[] => (p.set === '1929' ? HUBBLE_1929 : MODERN);
    const dataPts = (): Pt2[] => dataSet().map((q) => ({ d: q.d, v: q.v }));
    const diagX = () => (p.set === '1929' ? 2.3 : 430);
    function diagRange(): void {
      if (p.set === '1929') {
        plotH.setAxes({ y: { label: ctx.t('vAx') } });
        plotH.setRange([-0.3, 2.3], [-450, 1350]);
      } else {
        plotH.setAxes({ y: { label: ctx.t('vAxK'), format: (v) => fmt.num(v / 1000, 0) } });
        plotH.setRange([-48, 430], [-1800, 31_000]);
      }
    }
    /** Endpunkt der eigenen Geraden (ziehbar) */
    const userEnd = () => diagX() * 0.88;
    plotH.addHandle({
      get: () => [userEnd(), p.hu * userEnd()],
      set: (_x, y) => ctx.set({ hu: clamp(Math.round(y / userEnd()), 10, 800) }),
      enabled: () => p.mode === 'diagram' && !ctx.locked,
      color: () => COL.purple(),
      axis: 'y',
    });
    const LABELLED = new Set(['M 31', 'M 87', 'Coma-Haufen', 'Abell 2142', 'Abell 1795', 'LMC', 'NGC 4649', 'NGC 6822', 'NGC 1068']);

    function drawDiagram(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      diagRange();
      plotH.resize();
      plotH.begin();
      plotH.grid();
      plotH.axes();
      const pts = dataPts();
      const fit = fitThroughOrigin(pts)!;
      const col = p.set === '1929' ? COL.red() : COL.blue();
      const fade = intro.running ? intro.value : 1;
      // Abweichungsquadrate
      if (p.sq) {
        for (const q of pts) {
          const [px, py] = plotH.toPx(q.d, q.v);
          const [, ly] = plotH.toPx(q.d, p.hu * q.d);
          const side = Math.abs(py - ly);
          g.save();
          g.fillStyle = withAlpha(COL.purple(), 0.12 * fade);
          g.strokeStyle = withAlpha(COL.purple(), 0.45 * fade);
          g.lineWidth = 1;
          const left = px + side > R.x + R.w - 20 ? px - side : px;
          g.fillRect(left, Math.min(py, ly), side, side);
          g.strokeRect(left, Math.min(py, ly), side, side);
          g.restore();
        }
      }
      if (p.fit) plotH.fn((x) => fit.H * x, { color: COL.green(), width: 2, dash: [7, 5], from: 0 });
      plotH.fn((x) => p.hu * x, { color: COL.purple(), width: 2.6, from: 0 });
      for (const [i, q] of dataSet().entries()) {
        const s = clamp(fade * 1.6 - i / dataSet().length, 0, 1);
        if (s <= 0) continue;
        plotH.point(q.d, q.v, { color: col, radius: 4.5 * s });
        if (LABELLED.has(q.name) && p.val) {
          const name = ctx.lang === 'en' ? q.name.replace('-Haufen', ' cluster') : q.name;
          plotH.text(q.d, q.v, name, { color: th().muted, size: 11, weight: '600', align: q.d > diagX() * 0.7 ? 'right' : 'left', offset: [q.d > diagX() * 0.7 ? -8 : 8, -10], halo: true });
        }
      }
      plotH.text(userEnd(), p.hu * userEnd(), `${ctx.t('yours')}: H = ${N(p.hu, 0)}`, { color: COL.purple(), size: 12, weight: 'bold', align: 'right', offset: [-14, -16], halo: true });
      if (p.fit) plotH.text(diagX() * 0.95, fit.H * diagX() * 0.95, `${ctx.t('best')}: ${N(fit.H, 1)}`, { color: COL.green(), size: 12, weight: 'bold', align: 'right', offset: [0, 18], halo: true });
      plotH.end();
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 4: Selbst forschen                                      */
    /* -------------------------------------------------------------- */

    let obsList: Observation[] = [];
    let obsNo = 0;
    let current: Observation | null = null;
    const obsTw = new Tween(2600, ease.linear);
    const popTw = new Tween(500, ease.outBack);
    function observeOne(animate: boolean): void {
      obsNo += 1;
      const o = observe(obsNo, p.h0, 1, p.noise ? 1 : 0);
      if (animate) {
        if (current && obsTw.running) obsList.push(current);
        current = o;
        obsTw.play();
      } else {
        obsList.push(o);
        current = o;
      }
      popTw.play();
      updateReadouts();
      ctx.announce(ctx.lang === 'de' ? `${o.name}: d = ${N(o.dMeas, 0)} Mpc, v = ${N(o.vMeas, 0)} km/s` : `${o.name}: d = ${N(o.dMeas, 0)} Mpc, v = ${N(o.vMeas, 0)} km/s`);
    }
    /** Alle Punkte (der gerade gemessene erst nach der Animation). */
    const resPts = (): Pt2[] => {
      const list = obsList.map((o) => ({ d: o.dMeas, v: o.vMeas }));
      if (current && !obsTw.running && !obsList.includes(current)) list.push({ d: current.dMeas, v: current.vMeas });
      return list;
    };
    function settle(): void {
      if (current && !obsTw.running && !obsList.includes(current)) obsList.push(current);
    }

    function drawResearch(g: CanvasRenderingContext2D, R: Rect): void {
      spaceBackground(g, R, 9);
      const t = th();
      const o = current;
      const u = obsTw.running ? obsTw.value : 1;
      // Teleskop-Ausschnitt
      const stacked = R.w < 520;
      const rad = stacked ? Math.min(R.w * 0.26, R.h * 0.22) : Math.min(R.h * 0.3, R.w * 0.18);
      const cx = stacked ? R.x + R.w / 2 : R.x + rad + 26;
      const cy = R.y + rad + 40;
      g.save();
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.fillStyle = 'rgba(2,4,10,0.9)';
      g.fill();
      g.clip();
      if (o) {
        const seed = (o.dTrue * 13.7) % 1;
        drawGalaxy(g, cx, cy, rad * 0.55, { hue: seed, spiral: seed > 0.3 }, seed * 6);
        // Supernova: hell aufleuchten, langsam abklingen
        const flash = u < 0.35 ? u / 0.35 : Math.max(0.35, 1 - (u - 0.35) * 0.9);
        const sx = cx + rad * 0.32;
        const sy = cy - rad * 0.18;
        const glow = g.createRadialGradient(sx, sy, 0, sx, sy, rad * 0.35 * flash);
        glow.addColorStop(0, `rgba(255,255,240,${flash})`);
        glow.addColorStop(0.2, `rgba(200,220,255,${0.6 * flash})`);
        glow.addColorStop(1, 'rgba(200,220,255,0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(sx, sy, rad * 0.35 * flash + 1, 0, TAU);
        g.fill();
        g.strokeStyle = `rgba(255,255,255,${0.8 * flash})`;
        g.lineWidth = 1;
        for (const ang of [0, Math.PI / 2]) {
          g.beginPath();
          g.moveTo(sx - Math.cos(ang) * rad * 0.3 * flash, sy - Math.sin(ang) * rad * 0.3 * flash);
          g.lineTo(sx + Math.cos(ang) * rad * 0.3 * flash, sy + Math.sin(ang) * rad * 0.3 * flash);
          g.stroke();
        }
      } else {
        spaceText(g, '?', cx, cy, { size: 30, weight: 800, align: 'center', color: SPACE.inkMuted });
      }
      g.restore();
      g.strokeStyle = 'rgba(200,215,245,0.55)';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.stroke();
      // Fadenkreuz
      g.strokeStyle = 'rgba(200,215,245,0.22)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx - rad, cy);
      g.lineTo(cx + rad, cy);
      g.moveTo(cx, cy - rad);
      g.lineTo(cx, cy + rad);
      g.stroke();
      spaceText(g, ctx.t('scope'), cx, R.y + 22, { size: 12, weight: 700, align: 'center', color: SPACE.inkMuted });
      if (o) spaceText(g, o.name, cx, cy + rad + 16, { size: 12, weight: 700, align: 'center' });
      // Messwerte daneben
      const tx = stacked ? R.x + 16 : cx + rad + 24;
      const tw = R.x + R.w - tx - 14;
      let ty = stacked ? cy + rad + 42 : R.y + 44;
      const step = narrow() ? 19 : 22;
      const line = (s: string, col = SPACE.ink, w = 600, show = true) => {
        if (show) spaceText(g, s, tx, ty, { size: narrow() ? 12 : 13, weight: w, color: col });
        ty += step;
      };
      if (o) {
        line(`1. ${ctx.t('sn')}: m = ${N(o.m, 2)} mag`, 'rgba(200,220,255,1)', 700, u > 0.15);
        line(`d = 10^((m − M)/5 + 1) pc = ${N(o.dMeas, 1)} Mpc`, SPACE.ink, 600, u > 0.3);
        ty += 4;
        line(`2. Hα: ${N(656.28 * (1 + o.z), 1)} nm → z = ${N(o.z, 4)}`, 'rgba(255,180,160,1)', 700, u > 0.55);
        line(`v ≈ c · z = ${N(o.vMeas, 0)} km/s`, SPACE.ink, 600, u > 0.7);
        // kleines Spektrum mit Hα
        if (u > 0.4 && tw > 80) {
          const sy0 = ty + 4;
          const sh = 14;
          const lMin = 620;
          const lMax = 1000;
          const X = (nm: number) => tx + ((nm - lMin) / (lMax - lMin)) * Math.min(tw, 260);
          for (let x = 0; x <= Math.min(tw, 260); x++) {
            const nm = lMin + (x / Math.min(tw, 260)) * (lMax - lMin);
            const [r, gg, b] = wavelengthRGB(nm);
            g.fillStyle = nm <= VISIBLE[1] ? `rgb(${r},${gg},${b})` : 'rgb(60,40,46)';
            g.fillRect(tx + x, sy0, 1.5, sh);
          }
          const s = clamp((u - 0.4) / 0.25, 0, 1);
          const lam = 656.28 * (1 + o.z * s);
          g.fillStyle = 'rgba(0,0,0,0.9)';
          g.fillRect(X(lam) - 1.5, sy0, 3, sh);
          g.strokeStyle = 'rgba(255,255,255,0.6)';
          g.setLineDash([2, 2]);
          g.beginPath();
          g.moveTo(X(656.28), sy0 - 3);
          g.lineTo(X(656.28), sy0 + sh + 3);
          g.stroke();
          g.setLineDash([]);
        }
      } else {
        spaceText(g, ctx.t('resEmpty'), tx, ty, { size: 13, weight: 600, color: SPACE.inkMuted });
      }
      // Rand
      g.save();
      g.strokeStyle = withAlpha(t.text, 0.1);
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      g.stroke();
      g.restore();
    }

    function drawResearchChart(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const yMax = p.h0 * 430 * 1.1;
      plotH.setAxes({ y: { label: ctx.t('vAxK'), format: (v) => fmt.num(v / 1000, 0) } });
      plotH.setRange([-48, 430], [-yMax * 0.13, yMax]);
      plotH.resize();
      plotH.begin();
      plotH.grid();
      plotH.axes();
      const pts = resPts();
      const fit = pts.length >= 2 ? fitThroughOrigin(pts) : null;
      if (fit && p.fit) {
        const band: [number, number][] = [];
        for (let i = 0; i <= 20; i++) band.push([(430 * i) / 20, (fit.H + fit.sigma) * ((430 * i) / 20)]);
        for (let i = 20; i >= 0; i--) band.push([(430 * i) / 20, (fit.H - fit.sigma) * ((430 * i) / 20)]);
        plotH.polygon(band, { fill: withAlpha(COL.green(), 0.14) });
        plotH.fn((x) => fit.H * x, { color: COL.green(), width: 2.2, from: 0 });
      }
      for (const q of pts) plotH.point(q.d, q.v, { color: withAlpha(COL.blue(), 0.85), radius: 4 });
      if (current && !obsTw.running) {
        const s = popTw.running ? popTw.value : 1;
        plotH.point(current.dMeas, current.vMeas, { color: COL.orange(), radius: 7 * s });
      }
      if (fit && p.fit) plotH.text(400, fit.H * 400, `H₀ ≈ ${N(fit.H, 1)}`, { color: COL.green(), size: 12, weight: 'bold', align: 'right', offset: [0, 18], halo: true });
      plotH.end();
    }

    /* -------------------------------------------------------------- */
    /* Ansicht 5: Geschichte des Universums                            */
    /* -------------------------------------------------------------- */

    const cosmo = (): Cosmo => ({ H0: p.h0, Om: p.om, OL: p.ol, Or: 0 });
    let hist: ScaleHistory = scaleHistory(cosmo(), -30, 25, 0.02);
    let others: { id: string; h: ScaleHistory; label: string }[] = [];
    let age: number | null = ageGyr(cosmo(), 1500);
    function computeHistory(): void {
      hist = scaleHistory(cosmo(), -30, 25, 0.02);
      age = ageGyr(cosmo(), 1500);
      others = MODELS.filter((m) => Math.abs(m.Om - p.om) > 1e-6 || Math.abs(m.OL - p.ol) > 1e-6).map((m) => ({
        id: m.id,
        h: scaleHistory({ H0: p.h0, Om: m.Om, OL: m.OL, Or: 0 }, -30, 25, 0.04),
        label: ctx.lang === 'de' ? m.de : m.en,
      }));
    }
    const zMark = () => Math.pow(10, p.lz) - 1;
    /** Zeitpunkt (relativ zu heute) und a der Marke auf der Kurve, oder null. */
    function markPoint(): { t: number; a: number } | null {
      const a = 1 / (1 + zMark());
      // rückwärts von heute aus suchen
      const i0 = hist.t.findIndex((t) => t >= 0);
      for (let i = i0; i > 0; i--) {
        const a1 = hist.a[i]!;
        const a0 = hist.a[i - 1]!;
        if (a0 <= a && a <= a1) {
          const f = a1 === a0 ? 0 : (a - a0) / (a1 - a0);
          return { t: hist.t[i - 1]! + f * (hist.t[i]! - hist.t[i - 1]!), a };
        }
      }
      return null;
    }
    /** a(t) auf der Kurve (linear interpoliert). */
    function aAt(t: number): number | null {
      for (let i = 1; i < hist.t.length; i++) {
        if (hist.t[i - 1]! <= t && t <= hist.t[i]!) {
          const f = (t - hist.t[i - 1]!) / (hist.t[i]! - hist.t[i - 1]!);
          return hist.a[i - 1]! + f * (hist.a[i]! - hist.a[i - 1]!);
        }
      }
      return null;
    }
    plotA.addHandle({
      get: () => {
        const m = markPoint();
        return m ? [m.t, m.a] : [0, 1];
      },
      set: (x) => {
        const a = aAt(Math.min(0, x));
        if (a === null || a <= 0) return;
        ctx.set({ lz: clamp(Math.round(Math.log10(1 / Math.max(a, 1e-4)) * 100) / 100, 0, 3.04) });
      },
      enabled: () => p.mode === 'history' && !ctx.locked && markPoint() !== null,
      color: () => COL.orange(),
      axis: 'x',
    });
    function epochNow(): string {
      const z = zMark();
      let best = EPOCHS[EPOCHS.length - 1]!;
      for (const e of EPOCHS) if (z >= e.z * 0.85) {
        best = e;
        break;
      }
      return ctx.t(`ep_${best.id}`);
    }

    function drawHistory(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const xMin = Math.max(-30, Math.min(-16, (hist.bang ?? -15) - 1.5));
      plotA.setRange([xMin, 22], [-0.32, 2.6]);
      plotA.resize();
      plotA.begin();
      plotA.grid();
      plotA.axes();
      const fade = intro.running ? intro.value : 1;
      const curve = (h: ScaleHistory) => h.t.map((t, i) => [t, h.a[i]!] as [number, number]).filter((q) => q[1] <= 2.7);
      if (p.cmp) {
        for (const o of others) {
          plotA.polyline(curve(o.h), { color: withAlpha(th().muted, 0.45), width: 1.4, dash: [5, 4] });
          const last = curve(o.h).filter((q) => q[0] <= 21).pop();
          if (last && p.val) plotA.text(last[0], last[1], o.label, { color: th().muted, size: 11, weight: '600', align: 'right', offset: [-4, -8], halo: true });
        }
      }
      // gewähltes Modell, wächst beim Einblenden von heute aus
      const pts = curve(hist);
      const shown = intro.running ? pts.filter((q) => Math.abs(q[0]) <= 30 * fade) : pts;
      plotA.polyline(shown, { color: COL.blue(), width: 3.2 });
      // Tangente heute: Steigung H₀ → schneidet a = 0 bei −1/H₀
      const tH = hubbleTimeGyr(p.h0);
      plotA.segment([-tH, 0], [tH * 1.3, 2.3], { color: withAlpha(COL.orange(), 0.8), width: 1.6, dash: [6, 4] });
      plotA.point(-tH, 0, { color: COL.orange(), radius: 4 });
      if (p.val) plotA.text(-tH, 0, `${ctx.t('tangent')} = ${N(tH, 1)}`, { color: COL.orange(), size: 11, weight: 'bold', align: 'left', offset: [6, -14], halo: true });
      // heute
      plotA.point(0, 1, { color: COL.green(), radius: 5.5 });
      plotA.text(0, 1, ctx.t('today'), { color: COL.green(), size: 12, weight: 'bold', align: 'left', offset: [8, 14], halo: true });
      // Urknall / Endknall
      if (hist.bang !== null) {
        plotA.point(hist.bang, 0, { color: COL.red(), radius: 6 });
        plotA.text(hist.bang, 0, `${ctx.t('bang')} (−${N(-hist.bang, 1)})`, { color: COL.red(), size: 12, weight: 'bold', align: 'left', offset: [6, 16], halo: true });
      }
      if (hist.crunch !== null && hist.crunch < 22) {
        plotA.point(hist.crunch, 0, { color: COL.purple(), radius: 6 });
        plotA.text(hist.crunch, 0, ctx.t('crunch'), { color: COL.purple(), size: 12, weight: 'bold', align: 'right', offset: [-6, 16], halo: true });
      }
      // Stationen der Geschichte
      for (const e of EPOCHS) {
        if (e.id === 'now' || e.z > 30) continue;
        const a = 1 / (1 + e.z);
        const i0 = hist.t.findIndex((t) => t >= 0);
        for (let i = i0; i > 0; i--) {
          if (hist.a[i - 1]! <= a && a <= hist.a[i]!) {
            plotA.point(hist.t[i]!, a, { color: withAlpha(COL.teal(), 0.9), radius: 3 });
            break;
          }
        }
      }
      // Marke
      const m = markPoint();
      if (m) {
        plotA.segment([m.t, 0], [m.t, m.a], { color: withAlpha(COL.orange(), 0.5), width: 1, dash: [3, 3] });
        plotA.segment([xMin, m.a], [m.t, m.a], { color: withAlpha(COL.orange(), 0.5), width: 1, dash: [3, 3] });
        if (p.val && zMark() < 20) plotA.text(m.t, m.a, `z = ${S(zMark(), 3)}`, { color: COL.orange(), size: 12, weight: 'bold', align: 'left', offset: [10, -12], halo: true });
      }
      plotA.end();
      // kleines Fenster: so dicht standen die Galaxien damals
      const box = narrow() ? 64 : 88;
      const bx = R.x + 64;
      const by = R.y + 22;
      const a = m ? m.a : 1;
      const T = cmbTemp(zMark());
      g.save();
      roundRect(g, bx, by, box, box, 8);
      g.clip();
      g.fillStyle = SPACE.top;
      g.fillRect(bx, by, box, box);
      if (T > 600) {
        const glow = Math.min(1, (T - 600) / 2500);
        g.fillStyle = `rgba(255,${Math.round(120 + 80 * glow)},${Math.round(60 * glow)},${0.25 + 0.6 * glow})`;
        g.fillRect(bx, by, box, box);
      }
      const spacing = (box / 4) * Math.max(a, 0.06);
      for (let i = -12; i <= 12; i++) {
        for (let j = -12; j <= 12; j++) {
          const x = bx + box / 2 + i * spacing;
          const y = by + box / 2 + j * spacing;
          if (x < bx - 4 || x > bx + box + 4 || y < by - 4 || y > by + box + 4) continue;
          drawGalaxy(g, x, y, Math.max(1.5, 3.5 * Math.min(1, a * 3)), { hue: ((i * 7 + j * 3) & 7) / 8, spiral: (i + j) % 3 !== 0 }, i + j, zMark() > 30 ? 0.0 : 1);
        }
      }
      g.restore();
      g.strokeStyle = withAlpha(th().text, 0.3);
      g.lineWidth = 1;
      roundRect(g, bx, by, box, box, 8);
      g.stroke();
      g.save();
      g.font = `600 11px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'center';
      g.fillText(`a = ${S(a, 3)}`, bx + box / 2, by + box + 13);
      g.restore();
    }

    function drawPlanck(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const T = cmbTemp(zMark());
      plotP.resize();
      plotP.begin();
      plotP.grid();
      plotP.axes();
      // sichtbarer Bereich als Regenbogen
      const v0 = Math.log10(VISIBLE[0] * 1e-9);
      const v1 = Math.log10(VISIBLE[1] * 1e-9);
      const nB = 24;
      for (let i = 0; i < nB; i++) {
        const xa = v0 + ((v1 - v0) * i) / nB;
        const xb = v0 + ((v1 - v0) * (i + 1)) / nB;
        const [r, gg, b] = wavelengthRGB(Math.pow(10, (xa + xb) / 2) * 1e9);
        plotP.polygon(
          [
            [xa, -0.05],
            [xb, -0.05],
            [xb, 1.15],
            [xa, 1.15],
          ],
          { fill: `rgba(${r},${gg},${b},0.22)` },
        );
      }
      // λ·B_λ normiert
      let mx = 0;
      for (let x = -7.2; x <= -0.8; x += 0.01) mx = Math.max(mx, planck(Math.pow(10, x), T) * Math.pow(10, x));
      plotP.fn((x) => (planck(Math.pow(10, x), T) * Math.pow(10, x)) / mx, { color: COL.red(), width: 2.6 });
      const lp = wienPeak(T);
      const xp = Math.log10(lp);
      plotP.segment([xp, 0], [xp, (planck(lp, T) * lp) / mx], { color: withAlpha(COL.red(), 0.6), width: 1.2, dash: [4, 3] });
      if (p.val) plotP.text(xp, 1.04, `λ_max = ${lambdaLabel(lp)}`, { color: COL.red(), size: 12, weight: 'bold', align: xp > -2.5 ? 'right' : 'left', offset: [xp > -2.5 ? -8 : 8, 0], halo: true });
      plotP.end();
      g.save();
      g.font = `700 ${narrow() ? 12 : 13}px ${th().font}`;
      g.fillStyle = th().text;
      g.fillText(`${ctx.t('planckT')}: T = ${T < 100 ? N(T, 2) : N(T, 0)} K`, R.x + 14, R.y + 22);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

    function drawInfo(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.blue());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : 14;
      let y = R.y + 22;
      const bottom = R.y + R.h - 8;
      const line = (segs: Seg[], d = 0) => {
        if (y > bottom) return;
        y += segLine(g, segs, x, y, maxW, size + d);
      };
      const muted = (s: string) => line([{ s, c: t.muted }], -1.5);
      switch (p.mode) {
        case 'raisin': {
          const a = scaleNow();
          line([{ s: ctx.t('raisinT'), c: COL.blue(), w: 800 }]);
          line([{ s: `v = H₀ · d,  H₀ = ${N(p.h0, 0)} km/(s·Mpc)`, w: 700 }], 0.5);
          if (p.val) {
            const h = homeDot();
            rulerDots().forEach((idx, n) => {
              const d = dots[idx]!;
              const dist = Math.hypot(d.x - h.x, d.y - h.y) * UNIT_MPC * a;
              line([{ s: `d = ${N(dist, 1)} Mpc  →  v = ${N(p.h0 * dist, 0)} km/s`, c: RULER_COL()[n]!, w: 700 }], -1);
            });
          }
          y += 4;
          muted(ctx.t('raisin1'));
          muted(ctx.t('raisin2'));
          return;
        }
        case 'spectrum': {
          const z = zShown();
          line([{ s: ctx.t('specT'), c: COL.blue(), w: 800 }]);
          line([{ s: `d = ${N(p.d, 0)} Mpc ≈ ${N(p.d * MPC_MLY, 0)} ${ctx.lang === 'de' ? 'Mio. Lj' : 'million ly'}`, w: 700 }], -0.5);
          if (p.val) {
            line([{ s: `H₀ · d = ${N(spec.v, 0)} km/s = ${N(spec.v / C_KMS, 3)} · c`, c: spec.v > C_KMS ? COL.red() : t.text, w: 600 }], -1);
            line([{ s: tr('zLine', { z: S(z, 4) }), c: COL.red(), w: 800 }], 0.5);
            line([{ s: `Hα: 656,3 nm → ${N(656.28 * (1 + z), 1)} nm`, w: 600 }], -1);
            if (p.zc === 'classic') line([{ s: `${ctx.lang === 'de' ? 'mit Ausdehnung' : 'with expansion'}: z = ${S(spec.zCos, 4)}`, c: t.muted }], -1.5);
            else line([{ s: `${ctx.lang === 'de' ? 'einfach' : 'simple'} z = v/c = ${S(spec.zCla, 4)}`, c: t.muted }], -1.5);
          }
          y += 4;
          muted(ctx.t(p.zc === 'classic' ? 'specClassic' : 'specCosmo'));
          if (spec.v > C_KMS) line([{ s: ctx.t('ftl'), c: COL.red(), w: 600 }], -1.5);
          return;
        }
        case 'diagram': {
          const pts = dataPts();
          const fit = fitThroughOrigin(pts)!;
          const ssU = sumSquares(pts, p.hu);
          const ssB = sumSquares(pts, fit.H);
          line([{ s: `${ctx.t('diagT')} · ${p.set === '1929' ? 'Hubble 1929' : ctx.lang === 'de' ? 'heute' : 'today'}`, c: p.set === '1929' ? COL.red() : COL.blue(), w: 800 }]);
          line([{ s: `${ctx.t('yours')}: v = ${N(p.hu, 0)} km/(s·Mpc) · d`, c: COL.purple(), w: 700 }], 0);
          line([{ s: `1/H = ${N(hubbleTimeGyr(p.hu), 2)} ${ctx.lang === 'de' ? 'Mrd. Jahre' : 'billion years'}`, w: 600 }], -1);
          if (p.val) {
            line([{ s: `${ctx.t('ssq')}: `, c: t.muted }, { s: tr('ratio', { r: N(ssU / ssB, 2) }), c: ssU / ssB < 1.02 ? COL.green() : t.text, w: 700 }], -1.5);
            if (ssU / ssB < 1.02) line([{ s: ctx.t('perfect'), c: COL.green(), w: 800 }], -0.5);
            if (p.fit) line([{ s: `${ctx.t('best')}: H = Σ d·v / Σ d² = ${N(fit.H, 1)}`, c: COL.green(), w: 700 }], -1);
          }
          y += 4;
          muted(ctx.t(p.set === '1929' ? 'diag1929' : 'diagModern'));
          return;
        }
        case 'research': {
          const pts = resPts();
          line([{ s: ctx.t('resT'), c: COL.blue(), w: 800 }]);
          if (!pts.length) {
            muted(ctx.t('resHow'));
            return;
          }
          line([{ s: tr('resN', { n: pts.length }), w: 700 }], -0.5);
          const fit = pts.length >= 2 ? fitThroughOrigin(pts) : null;
          if (fit) {
            line([{ s: tr('fitH', { h: N(fit.H, 1), s: N(fit.sigma, 1) }), c: COL.green(), w: 800 }], 0.5);
            line([{ s: tr('resAge', { t: N(hubbleTimeGyr(fit.H), 1) }), w: 600 }], -1);
          }
          y += 4;
          muted(ctx.t('resHow'));
          return;
        }
        case 'history': {
          const c = cosmo();
          const kind = modelKind(c);
          const m = markPoint();
          line([{ s: ctx.t('histT'), c: COL.blue(), w: 800 }]);
          line([{ s: `Ωₘ = ${N(p.om, 2)},  ΩΛ = ${N(p.ol, 2)},  Ωₖ = ${N(omegaK(c), 2)}`, w: 700 }], -1);
          line([{ s: `${ctx.t(kind.curvature)}, ${ctx.t(kind.accelerating ? 'acc' : 'dec')} (q₀ = ${N(q0(c), 2)})`, c: t.muted, w: 600 }], -1.5);
          if (age !== null && p.val) line([{ s: `${ctx.lang === 'de' ? 'Alter' : 'age'}: ${N(age, 2)} ${ctx.lang === 'de' ? 'Mrd. Jahre' : 'billion years'}  (1/H₀ = ${N(hubbleTimeGyr(p.h0), 2)})`, c: COL.red(), w: 800 }], 0);
          if (!kind.bang) line([{ s: ctx.t('noBang'), c: COL.red(), w: 600 }], -1.5);
          y += 4;
          line([{ s: `${ctx.t('epochHead')}: z = ${S(zMark(), 3)}, a = ${S(1 / (1 + zMark()), 3)}`, c: COL.orange(), w: 700 }], -0.5);
          if (m && age !== null && p.val) line([{ s: `${N(age + m.t, age + m.t < 0.01 ? 4 : 2)} ${ctx.lang === 'de' ? 'Mrd. Jahre nach dem Urknall' : 'billion years after the Big Bang'}`, w: 600 }], -1);
          muted(epochNow());
          muted(ctx.t(cmbTemp(zMark()) > 1500 ? 'warmUniverse' : 'coldUniverse'));
          return;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Ablauf                                           */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      ctx.readout('law', `v = ${N(p.mode === 'diagram' ? p.hu : p.h0, 0)} km/(s·Mpc) · d`);
      const ageTxt = (h: number) => `1/H₀ = ${N(hubbleTimeGyr(h), 2)} ${ctx.lang === 'de' ? 'Mrd. Jahre' : 'billion years'}`;
      switch (p.mode) {
        case 'raisin':
          ctx.readout('z', '–');
          ctx.readout('H', `${N(p.h0, 0)} km/(s·Mpc)`);
          ctx.readout('age', ageTxt(p.h0));
          break;
        case 'spectrum':
          ctx.readout('z', `z = ${S(zShown(), 4)}`);
          ctx.readout('H', `${N(p.h0, 0)} km/(s·Mpc)`);
          ctx.readout('age', spec.look !== null ? `${ageTxt(p.h0)}; ${tr('travel', { t: N(spec.look, 2) })}` : ageTxt(p.h0));
          break;
        case 'diagram': {
          const fit = fitThroughOrigin(dataPts())!;
          ctx.readout('z', '–');
          ctx.readout('H', `${ctx.t('best')}: ${N(fit.H, 1)} km/(s·Mpc)`);
          ctx.readout('age', ageTxt(fit.H));
          break;
        }
        case 'research': {
          const pts = resPts();
          const fit = pts.length >= 2 ? fitThroughOrigin(pts) : null;
          ctx.readout('z', current ? `z = ${N(current.z, 4)}` : '–');
          ctx.readout('H', fit ? `${N(fit.H, 1)} ± ${N(fit.sigma, 1)} km/(s·Mpc) (${ctx.lang === 'de' ? 'wahr' : 'true'}: ${N(p.h0, 0)})` : '–');
          ctx.readout('age', fit ? ageTxt(fit.H) : '–');
          break;
        }
        case 'history':
          ctx.readout('z', `z = ${S(zMark(), 3)}, T = ${N(cmbTemp(zMark()), 1)} K`);
          ctx.readout('H', `${N(p.h0, 0)} km/(s·Mpc)`);
          ctx.readout('age', age !== null ? `${N(age, 2)} ${ctx.lang === 'de' ? 'Mrd. Jahre' : 'billion years'} (${ageTxt(p.h0)})` : ctx.t('noBang'));
          break;
      }
    }

    computeSpectrum();
    computeHistory();

    return {
      update(changed, source) {
        const modeChanged = changed.has('mode') || source === 'init' || source === 'replace';
        if (['d', 'h0', 'zc'].some((k) => changed.has(k)) || source === 'init' || source === 'replace') {
          zFrom = zAnim();
          computeSpectrum();
          if (source !== 'init') zTw.play();
        }
        if (['om', 'ol', 'h0'].some((k) => changed.has(k)) || source === 'init' || source === 'replace') computeHistory();
        if (changed.has('noise') || (changed.has('h0') && p.mode === 'research')) {
          obsList = [];
          current = null;
          obsNo = 0;
        }
        if (modeChanged) {
          intro.play();
          // Bei „reduzierter Bewegung“ keine Daueranimation: ein fester, aussagekräftiger Zustand
          // (Abstände × 1,42). Abspielen startet sie trotzdem auf Wunsch.
          if (prefersReducedMotion()) {
            if (p.mode === 'raisin') tRun = hubbleTimeGyr(p.h0) * Math.log(1.42);
          } else {
            if (p.mode === 'raisin' || p.mode === 'spectrum') ctx.clock.play();
            if (p.mode === 'raisin' && source !== 'init') tRun = 0;
          }
        }
        if (changed.has('home') && source !== 'input') camTw.play();
        homeKeys();
        specKeys();
        if (p.mode !== 'raisin' && p.mode !== 'spectrum') ctx.setKeyTargets([]);
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'restart') {
          tRun = 0;
          ctx.clock.play();
        }
        if (id === 'obs') observeOne(true);
        if (id === 'obs10') {
          settle();
          for (let i = 0; i < 10; i++) observeOne(false);
        }
        if (id === 'clear') {
          obsList = [];
          current = null;
          obsNo = 0;
        }
        if (id === 'best') ctx.set({ hu: Math.round(fitThroughOrigin(dataPts())!.H) });
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        if (p.mode === 'raisin') {
          tRun += dt * 1.6;
          if (scaleNow() >= A_MAX) {
            tRun = hubbleTimeGyr(p.h0) * Math.log(A_MAX);
            ctx.clock.pause();
          }
          updateReadouts();
        } else if (p.mode === 'spectrum') {
          wavePhase += dt * 1.3;
        }
      },
      resetTime() {
        tRun = 0;
        wavePhase = 0;
      },
      render() {
        lay = layout();
        const g = surface.begin();
        if (!obsTw.running) settle();
        switch (p.mode) {
          case 'raisin':
            drawRaisin(g, lay.scene);
            if (lay.chart) drawRaisinChart(g, lay.chart);
            break;
          case 'spectrum':
            drawSpectrumScene(g, lay.scene);
            if (lay.chart) drawSpectra(g, lay.chart);
            break;
          case 'diagram':
            drawDiagram(g, lay.scene);
            break;
          case 'research':
            drawResearch(g, lay.scene);
            if (lay.chart) drawResearchChart(g, lay.chart);
            break;
          case 'history':
            drawHistory(g, lay.scene);
            if (lay.chart) drawPlanck(g, lay.chart);
            break;
        }
        drawInfo(g, lay.card);
        if (intro.running || camTw.running || zTw.running || obsTw.running || popTw.running) ctx.requestRender();
      },
      destroy: () => surface.destroy(),
    };
  },
});
