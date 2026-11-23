import { defineSimulation, drawCard, ease, Plot, prefersReducedMotion, roundRect, Surface, TapTarget, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  absMag,
  appMag,
  nakedEye,
  sunsInside,
  surfaceFluxMW,
  evolutionTrack,
  LY,
  lyFromParallax,
  msLifetime,
  msLuminosity,
  msTemperature,
  parsecFromParallax,
  quizStar,
  planck,
  population,
  radiusFrom,
  regionOf,
  remnant,
  rng,
  spectralClass,
  starById,
  starRGB,
  STARS,
  T_SUN,
  trackAt,
  wienPeakNm,
  type Phase,
  type Region,
  type TrackPoint,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const TAU = 2 * Math.PI;
const lg = Math.log10;

/** Achsenbereich des HR-Diagramms: x = −log T (heiß links), y = log L. */
const X_HOT = -lg(45000);
const X_COOL = -lg(2300);
const Y_LO = -4.6;
const Y_HI = 6.4;

/** Parallaxen bekannter naher Sterne in Bogensekunden (gerundet). */
const PARALLAX: Record<string, number> = { proxima: 0.768, barnard: 0.547, sirius: 0.379, procyon: 0.285, altair: 0.195, vega: 0.13, arcturus: 0.089, aldebaran: 0.05 };

/**
 * Sterne und Hertzsprung-Russell-Diagramm: echte Sterne und eine typische
 * Sternpopulation im HR-Diagramm mit Linien gleichen Radius, ein eigener
 * Stern zum Ziehen (Stefan-Boltzmann), Größen- und Spektrenvergleich
 * (Wien, Planck), der Lebensweg eines Sterns nach seiner Masse und die
 * Entfernungsmessung mit der Parallaxe.
 */
export default defineSimulation({
  id: 'hr-diagramm',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.55, aspectNarrow: 0.62 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'hrd', label: L('HR-Diagramm', 'HR diagram') },
        { value: 'compare', label: L('Sterne vergleichen', 'Compare stars') },
        { value: 'life', label: L('Lebensweg eines Sterns', 'Life of a star') },
        { value: 'parallax', label: L('Entfernung: Parallaxe', 'Distance: parallax') },
        { value: 'quiz', label: L('Üben: Sterne einordnen', 'Practice: place the stars') },
      ],
      default: 'hrd',
    },
    {
      key: 'star',
      type: 'choice',
      label: L('Stern', 'Star'),
      options: STARS.map((s) => ({ value: s.id, label: L(s.de, s.en) })),
      default: 'sun',
      visibleIf: (v) => v.mode === 'hrd' || v.mode === 'compare',
    },
    { key: 'own', type: 'boolean', label: L('Eigenen Stern einzeichnen', 'Draw your own star'), default: false, visibleIf: (v) => v.mode === 'hrd' },
    {
      key: 'T',
      type: 'number',
      label: L('Temperatur T', 'Temperature T'),
      min: 2500,
      max: 40000,
      step: 100,
      default: 8000,
      unit: 'K',
      visibleIf: (v) => (v.mode === 'hrd' && v.own === true) || v.mode === 'compare',
    },
    {
      key: 'lr',
      type: 'number',
      label: L('Radius R', 'Radius R'),
      help: L('In Sonnenradien. Der Regler arbeitet in Zehnerpotenzen: von 0,01 bis 1000.', 'In solar radii. The slider works in powers of ten: from 0.01 to 1000.'),
      min: -2,
      max: 3,
      step: 0.05,
      default: 0.3,
      display: (v, lang) => {
        const R = 10 ** v;
        const d = R < 0.1 ? 3 : R < 10 ? 2 : R < 100 ? 1 : 0;
        const s = R.toFixed(d);
        return `${lang === 'de' ? s.replace('.', ',') : s} R☉`;
      },
      visibleIf: (v) => (v.mode === 'hrd' && v.own === true) || v.mode === 'compare',
    },
    { key: 'lines', type: 'boolean', group: 'view', label: L('Linien gleichen Radius', 'Lines of equal radius'), default: true, visibleIf: (v) => v.mode === 'hrd' },
    { key: 'classes', type: 'boolean', group: 'view', label: L('Spektralklassen O B A F G K M', 'Spectral classes O B A F G K M'), default: false, visibleIf: (v) => v.mode === 'hrd' || v.mode === 'quiz' },
    { key: 'pop', type: 'boolean', group: 'view', label: L('Viele weitere Sterne', 'Many more stars'), default: true, visibleIf: (v) => v.mode === 'hrd' },
    { key: 'm', type: 'number', label: L('Masse des Sterns', 'Mass of the star'), min: 0.5, max: 30, step: 0.1, default: 1, unit: 'M☉', visibleIf: (v) => v.mode === 'life' },
    { key: 'age', type: 'number', label: L('Lebensabschnitt', 'Stage of life'), min: 0, max: 100, step: 0.5, default: 30, unit: '%', visibleIf: (v) => v.mode === 'life' },
    {
      key: 'pstar',
      type: 'choice',
      label: L('Naher Stern', 'Nearby star'),
      options: [
        { value: 'custom', label: L('eigene Parallaxe', 'own parallax') },
        ...Object.keys(PARALLAX).map((id) => ({ value: id, label: L(starById(id)!.de, starById(id)!.en) })),
      ],
      default: 'sirius',
      visibleIf: (v) => v.mode === 'parallax',
    },
    { key: 'p', type: 'number', label: L('Parallaxe p', 'Parallax p'), min: 0.02, max: 1, step: 0.001, default: 0.379, unit: '″', visibleIf: (v) => v.mode === 'parallax' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'quiz' },
    {
      key: 'qa',
      type: 'choice',
      label: L('Deine Antwort', 'Your answer'),
      options: [
        { value: 'ms', label: L('Hauptreihe', 'main sequence') },
        { value: 'giant', label: L('Roter Riese', 'red giant') },
        { value: 'supergiant', label: L('Überriese', 'supergiant') },
        { value: 'wd', label: L('Weißer Zwerg', 'white dwarf') },
      ],
      default: 'ms',
      visibleIf: (v) => v.mode === 'quiz',
    },
    { key: 'val', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), default: true },
  ],
  resultsParam: 'val',
  actions: [
    { id: 'next', label: L('Nächster Stern', 'Next star'), visibleIf: (v) => v.mode === 'hrd' },
    { id: 'play', label: L('Leben abspielen', 'Play the life'), primary: true, visibleIf: (v) => v.mode === 'life' },
    { id: 'orbit', label: L('Ein Jahr abspielen', 'Play one year'), primary: true, visibleIf: (v) => v.mode === 'parallax' },
    { id: 'qcheck', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'quiz' },
    { id: 'qnext', label: L('Neuer Stern', 'New star'), visibleIf: (v) => v.mode === 'quiz' },
  ],
  readouts: [
    { key: 'L', label: L('Leuchtkraft', 'Luminosity'), spoiler: true },
    { key: 'formula', label: L('Formel', 'Formula') },
    { key: 'extra', label: L('Außerdem', 'Also'), spoiler: true },
  ],
  presets: [
    { id: 'sun', label: L('Die Sonne im HR-Diagramm', 'The Sun in the HR diagram'), values: { mode: 'hrd', star: 'sun', own: false } },
    { id: 'betel', label: L('Beteigeuze: ein Überriese', 'Betelgeuse: a supergiant'), values: { mode: 'hrd', star: 'betelgeuse', own: false } },
    { id: 'siriusb', label: L('Sirius B: ein Weißer Zwerg', 'Sirius B: a white dwarf'), values: { mode: 'hrd', star: 'siriusb', own: false } },
    { id: 'own', label: L('Eigener Stern: 8000 K, 2 R☉', 'Own star: 8000 K, 2 R☉'), values: { mode: 'hrd', own: true, T: 8000, lr: 0.3 } },
    { id: 'hot', label: L('Doppelte Temperatur, gleicher Radius', 'Double temperature, same radius'), values: { mode: 'compare', star: 'sun', T: 11500, lr: 0 } },
    { id: 'cmpb', label: L('Beteigeuze neben der Sonne', 'Betelgeuse next to the Sun'), values: { mode: 'compare', star: 'betelgeuse', T: 5800, lr: 0 } },
    { id: 'life1', label: L('Lebensweg der Sonne', 'Life of the Sun'), values: { mode: 'life', m: 1, age: 30 } },
    { id: 'life20', label: L('Massereicher Stern: Supernova', 'Massive star: supernova'), values: { mode: 'life', m: 20, age: 30 } },
    { id: 'life05', label: L('Roter Zwerg: lebt sehr lange', 'Red dwarf: lives very long'), values: { mode: 'life', m: 0.5, age: 30 } },
    { id: 'prox', label: L('Parallaxe von Proxima Centauri', 'Parallax of Proxima Centauri'), values: { mode: 'parallax', pstar: 'proxima', p: 0.768 } },
    { id: 'classes', label: L('Spektralklassen im HR-Diagramm', 'Spectral classes in the HR diagram'), values: { mode: 'hrd', classes: true, star: 'sun', own: false } },
    { id: 'quiz', label: L('Üben: Sterne einordnen', 'Practice: place the stars'), values: { mode: 'quiz', qn: 1, qa: 'ms' } },
    { id: 'p01', label: L('Parallaxe 0,1″ → 10 pc', 'Parallax 0.1″ → 10 pc'), values: { mode: 'parallax', pstar: 'custom', p: 0.1 } },
  ],
  strings: {
    de: {
      mag: 'scheinbare Helligkeit ≈ {m} mag (Modell)',
      eyeYes: 'mit bloßem Auge sichtbar',
      eyeNo: 'nur mit Fernrohr sichtbar',
      magG: 'Je kleiner die Zahl, desto heller: Sirius ≈ −1,5 mag, die schwächsten Sterne, die man mit bloßem Auge sieht, ≈ 6 mag. Das Modell zählt alles Licht, auch das unsichtbare, deshalb wirken rote Zwerge hier heller als in Wirklichkeit.',
      suns: 'Es passen etwa {n} Sonnen hinein.',
      fluxL: 'Jeder Quadratmeter strahlt {f} MW ab (Sonne: 63 MW).',
      sunTrack: 'Weg der Sonne',
      legend: 'Phasen',
      quizT: 'Üben: Wo liegt dieser Stern?',
      quizTask: 'Ein Stern hat T = {T} K und R = {R} R☉. In welches Gebiet des HR-Diagramms gehört er?',
      quizHow: 'Wähle deine Antwort und tippe auf „Prüfen“.',
      quizHint: 'Tipp: Rechne zuerst L = R² · (T / 5772)⁴ aus und suche den Punkt im Diagramm.',
      quizOk: 'Richtig!',
      quizNo: 'Nicht ganz – es ist ein {r}.',
      quizL: 'L = {R}² · ({T} / 5772)⁴ ≈ {L} L☉',
      quizScore: '{k} von {n} richtig',
      mystery: 'unbekannter Stern',
      scope: 'Blick durchs Fernrohr',
      sunNow: 'Sonne heute',
      classesG: 'Farbstreifen oben: Spektralklassen von O (heiß, blau) bis M (kühl, rot).',
      canvas: 'Sterne: Hertzsprung-Russell-Diagramm mit echten Sternen, Vergleich von Größe und Spektrum zweier Sterne, Lebensweg eines Sterns und Entfernungsmessung mit der Parallaxe.',
      xAx: 'Temperatur in K',
      yAx: 'Leuchtkraft in L☉',
      hot: '← heiß',
      cool: 'kühl →',
      bright: 'hell',
      ms: 'Hauptreihe',
      giants: 'Riesen',
      supergiants: 'Überriesen',
      wds: 'Weiße Zwerge',
      own: 'dein Stern',
      hrdT: 'Das Hertzsprung-Russell-Diagramm',
      hrdG: 'Jeder Punkt ist ein Stern: links heiß und blau, rechts kühl und rot, oben hell, unten lichtschwach. Die meisten Sterne liegen auf der Hauptreihe. Dort verschmelzen sie Wasserstoff zu Helium.',
      hrdHow: 'Tippe auf einen Stern oder zieh deinen eigenen Stern durch das Diagramm.',
      hrdLines: 'Gestrichelt: Linien gleichen Radius. Oben rechts sind Sterne riesig, unten links winzig.',
      region: 'Gebiet: {r}',
      reg_ms: 'Hauptreihe',
      reg_giant: 'Roter Riese',
      reg_supergiant: 'Überriese',
      reg_wd: 'Weißer Zwerg',
      cls: 'Spektralklasse {c}',
      dist: '{d} Lichtjahre entfernt',
      here: 'unser Stern',
      compT: 'Sterne vergleichen',
      compG: 'Leuchtkraft L = R² · (T / 5772 K)⁴ in Sonneneinheiten (Stefan-Boltzmann). Doppelte Temperatur ergibt 16-fache Leuchtkraft, doppelter Radius 4-fache.',
      compW: 'Je heißer, desto weiter links liegt das Maximum des Spektrums (Wien): λ_max = 2,898 mm·K / T.',
      ratio: 'L₁ / L₂ = {r}',
      lambda: 'λ in nm',
      flux: 'Strahlung pro Fläche',
      visible: 'sichtbar',
      lifeT: 'Lebensweg eines Sterns mit {m} M☉',
      lifeG: 'Die Masse entscheidet: Schwere Sterne verbrauchen ihren Brennstoff schnell und leben kurz. Leichte Sterne leuchten schwach und leben sehr lange.',
      lifeAge: 'Alter: {a}',
      lifeMs: 'Zeit auf der Hauptreihe: {t}',
      lifeEnd: 'Ende als {e}',
      lifeDraft: 'Der Weg ist schematisch (vereinfacht).',
      ph_ms: 'Hauptreihe: Wasserstoff wird zu Helium',
      ph_sub: 'Unterriese: Wasserstoff im Kern verbraucht',
      ph_rgb: 'Roter Riese: die Hülle bläht sich auf',
      ph_hb: 'Heliumbrennen im Kern',
      ph_agb: 'Roter Riese zum zweiten Mal',
      ph_pn: 'Planetarischer Nebel: die Hülle wird abgestoßen',
      ph_wd: 'Weißer Zwerg: kühlt langsam aus',
      ph_rsg: 'Roter Überriese',
      ph_sn: 'Supernova!',
      ph_ns: 'Neutronenstern',
      ph_bh: 'Schwarzes Loch',
      end_wd: 'Weißer Zwerg',
      end_ns: 'Neutronenstern',
      end_bh: 'Schwarzes Loch',
      years: 'Jahre',
      mio: 'Mio. Jahre',
      mrd: 'Mrd. Jahre',
      paraT: 'Entfernung messen mit der Parallaxe',
      paraG: 'Die Erde läuft in einem Jahr um die Sonne. Von zwei gegenüberliegenden Punkten ihrer Bahn aus sieht man einen nahen Stern vor verschiedenen fernen Sternen. Der halbe Winkel ist die Parallaxe p.',
      paraD: 'd = 1 / p = {pc} pc ≈ {ly} Lichtjahre',
      paraLight: 'Das Licht ist {ly} Jahre zu uns unterwegs.',
      paraCar: 'Mit dem Auto (100 km/h) bräuchte man etwa {y} Jahre.',
      paraScale: 'Nicht maßstäblich: In Wirklichkeit ist der Winkel winzig. 1″ ist der Winkel, unter dem eine 1-Euro-Münze aus 4,8 km Entfernung erscheint.',
      jan: 'Januar',
      jul: 'Juli',
      earth: 'Erde',
      sun: 'Sonne',
      star: 'naher Stern',
      bg: 'ferne Sterne',
    },
    en: {
      mag: 'apparent magnitude ≈ {m} mag (model)',
      eyeYes: 'visible to the naked eye',
      eyeNo: 'only visible with a telescope',
      magG: 'The smaller the number, the brighter: Sirius ≈ −1.5 mag, the faintest stars seen with the naked eye ≈ 6 mag. The model counts all light, including the invisible part, so red dwarfs appear brighter here than in reality.',
      suns: 'About {n} Suns would fit inside.',
      fluxL: 'Each square metre radiates {f} MW (Sun: 63 MW).',
      sunTrack: 'path of the Sun',
      legend: 'phases',
      quizT: 'Practice: where does this star belong?',
      quizTask: 'A star has T = {T} K and R = {R} R☉. Which region of the HR diagram does it belong to?',
      quizHow: 'Choose your answer and tap “Check”.',
      quizHint: 'Hint: first work out L = R² · (T / 5772)⁴ and find the point in the diagram.',
      quizOk: 'Correct!',
      quizNo: 'Not quite – it is a {r}.',
      quizL: 'L = {R}² · ({T} / 5772)⁴ ≈ {L} L☉',
      quizScore: '{k} of {n} correct',
      mystery: 'unknown star',
      scope: 'view through the telescope',
      sunNow: 'Sun today',
      classesG: 'Colour strip at the top: spectral classes from O (hot, blue) to M (cool, red).',
      canvas: 'Stars: Hertzsprung–Russell diagram with real stars, comparing size and spectrum of two stars, the life of a star and measuring distance with parallax.',
      xAx: 'temperature in K',
      yAx: 'luminosity in L☉',
      hot: '← hot',
      cool: 'cool →',
      bright: 'bright',
      ms: 'main sequence',
      giants: 'giants',
      supergiants: 'supergiants',
      wds: 'white dwarfs',
      own: 'your star',
      hrdT: 'The Hertzsprung–Russell diagram',
      hrdG: 'Each dot is a star: hot and blue on the left, cool and red on the right, bright at the top, faint at the bottom. Most stars lie on the main sequence, where they fuse hydrogen into helium.',
      hrdHow: 'Tap a star or drag your own star through the diagram.',
      hrdLines: 'Dashed: lines of equal radius. Top right the stars are huge, bottom left tiny.',
      region: 'region: {r}',
      reg_ms: 'main sequence',
      reg_giant: 'red giant',
      reg_supergiant: 'supergiant',
      reg_wd: 'white dwarf',
      cls: 'spectral class {c}',
      dist: '{d} light years away',
      here: 'our star',
      compT: 'Compare stars',
      compG: 'Luminosity L = R² · (T / 5772 K)⁴ in solar units (Stefan–Boltzmann). Double the temperature gives 16 times the luminosity, double the radius 4 times.',
      compW: 'The hotter the star, the further left the peak of the spectrum (Wien): λ_max = 2.898 mm·K / T.',
      ratio: 'L₁ / L₂ = {r}',
      lambda: 'λ in nm',
      flux: 'radiation per area',
      visible: 'visible',
      lifeT: 'Life of a star with {m} M☉',
      lifeG: 'Mass decides: heavy stars use up their fuel quickly and live briefly. Light stars shine faintly and live very long.',
      lifeAge: 'age: {a}',
      lifeMs: 'time on the main sequence: {t}',
      lifeEnd: 'ends as a {e}',
      lifeDraft: 'The path is schematic (simplified).',
      ph_ms: 'main sequence: hydrogen becomes helium',
      ph_sub: 'subgiant: hydrogen in the core used up',
      ph_rgb: 'red giant: the envelope swells',
      ph_hb: 'helium burning in the core',
      ph_agb: 'red giant for the second time',
      ph_pn: 'planetary nebula: the envelope is ejected',
      ph_wd: 'white dwarf: slowly cools down',
      ph_rsg: 'red supergiant',
      ph_sn: 'supernova!',
      ph_ns: 'neutron star',
      ph_bh: 'black hole',
      end_wd: 'white dwarf',
      end_ns: 'neutron star',
      end_bh: 'black hole',
      years: 'years',
      mio: 'million years',
      mrd: 'billion years',
      paraT: 'Measuring distance with parallax',
      paraG: 'The Earth goes round the Sun once a year. From two opposite points of its orbit a nearby star is seen against different distant stars. Half the angle is the parallax p.',
      paraD: 'd = 1 / p = {pc} pc ≈ {ly} light years',
      paraLight: 'Its light has been travelling to us for {ly} years.',
      paraCar: 'By car (100 km/h) it would take about {y} years.',
      paraScale: 'Not to scale: in reality the angle is tiny. 1″ is the angle of a 1 euro coin seen from 4.8 km away.',
      jan: 'January',
      jul: 'July',
      earth: 'Earth',
      sun: 'Sun',
      star: 'nearby star',
      bg: 'distant stars',
    },
  },
  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const N = (v: number, d = 2) => (Number.isFinite(v) ? fmt.num(Math.abs(v) < 1e-15 ? 0 : v, d) : '–');
    const reduced = prefersReducedMotion();
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
    const rgb = (T: number, a = 1) => {
      const [r, g, b] = starRGB(T);
      return `rgba(${r},${g},${b},${a})`;
    };
    /** Zahl mit sinnvoller Stellenzahl (auch sehr groß oder sehr klein). */
    function S(v: number): string {
      const a = Math.abs(v);
      if (a === 0) return '0';
      if (a >= 100000) return fmt.num(Math.round(v / 1000) * 1000, 0);
      if (a >= 100) return fmt.num(v, 0);
      if (a >= 10) return fmt.num(v, 1);
      if (a >= 1) return fmt.num(v, 2);
      const d = Math.min(6, Math.ceil(-lg(a)) + 1);
      return fmt.num(v, d);
    }
    function years(gyr: number): string {
      if (gyr >= 1) return `${S(gyr)} ${ctx.t('mrd')}`;
      if (gyr >= 0.001) return `${S(gyr * 1000)} ${ctx.t('mio')}`;
      return `${S(gyr * 1e9)} ${ctx.t('years')}`;
    }

    /* -------------------------------------------------------------- */
    /* Aufteilung                                                      */
    /* -------------------------------------------------------------- */

    interface Lay {
      scene: Rect;
      card: Rect;
    }
    function layout(): Lay {
      const W = surface.width;
      const H = surface.height;
      const pad = 10;
      if (wide() || W >= H * 1.3) {
        const sw = Math.round(W * (wide() ? 0.63 : 0.58));
        return { scene: { x: pad, y: pad, w: sw - pad, h: H - 2 * pad }, card: { x: sw + pad, y: pad, w: W - sw - 2 * pad, h: H - 2 * pad } };
      }
      const sh = Math.round(H * 0.6);
      return { scene: { x: pad, y: pad, w: W - 2 * pad, h: sh }, card: { x: pad, y: sh + 2 * pad, w: W - 2 * pad, h: H - sh - 3 * pad } };
    }
    let lay: Lay = layout();
    /** Bereich des HR-Diagramms innerhalb der Bühne (bei „Lebensweg“ nur ein Teil). */
    function hrdRect(): Rect {
      const R = lay.scene;
      if (p.mode === 'hrd') return { x: R.x + 46, y: R.y + 10, w: R.w - 58, h: R.h - 52 };
      if (p.mode === 'quiz') {
        if (R.w > R.h * 1.05) return { x: R.x + 46, y: R.y + 10, w: R.w * 0.64 - 52, h: R.h - 52 };
        return { x: R.x + 46, y: R.y + 10, w: R.w - 58, h: R.h * 0.64 - 52 };
      }
      if (p.mode === 'life') {
        const tl = 64;
        if (R.w > R.h * 1.1) return { x: R.x + 46, y: R.y + 10, w: R.w * 0.55 - 52, h: R.h - tl - 44 };
        return { x: R.x + 46, y: R.y + 10, w: R.w - 58, h: (R.h - tl) * 0.55 - 40 };
      }
      return OFF;
    }
    const hrd = new Plot(surface, {
      x: [X_HOT, X_COOL],
      y: [Y_LO, Y_HI],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => hrdRect(),
    });
    /** Spektren-Diagramm (Ansicht „Sterne vergleichen“). */
    let specRect: Rect = OFF;
    const spec = new Plot(surface, {
      x: [-60, 2000],
      y: [-0.08, 1],
      equalAspect: false,
      zoom: false,
      pan: false,
      controls: false,
      region: () => (p.mode === 'compare' ? specRect : OFF),
    });

    /* -------------------------------------------------------------- */
    /* Zustand                                                         */
    /* -------------------------------------------------------------- */

    const intro = new Tween(1400, ease.outCubic);
    intro.play();
    const pop = population(narrow() ? 360 : 560, 7);
    const ownT = () => p.T;
    const ownR = () => 10 ** p.lr;
    const ownL = () => ownR() ** 2 * (ownT() / T_SUN) ** 4;
    const sel = () => starById(p.star) ?? STARS[0]!;
    const selR = () => radiusFrom(sel().L, sel().T);
    const toXY = (T: number, Lum: number): [number, number] => [-lg(T), lg(Lum)];

    // eigener Stern zum Ziehen
    hrd.addHandle({
      get: () => toXY(ownT(), ownL()),
      set: (x, y) => {
        const T = clamp(Math.round(10 ** -x / 100) * 100, 2500, 40000);
        const Lum = 10 ** y;
        const R = radiusFrom(Lum, T);
        ctx.set({ T, lr: clamp(Math.round(lg(R) * 20) / 20, -2, 3) });
      },
      enabled: () => p.mode === 'hrd' && p.own && !ctx.locked,
      color: () => COL.purple(),
      axis: 'both',
    });
    // Sterne antippen
    new TapTarget(surface, {
      hit: (px, py) => {
        if (p.mode !== 'hrd') return null;
        let best: string | null = null;
        let bd = 22;
        for (const s of STARS) {
          const [x, y] = hrd.toPx(...toXY(s.T, s.L));
          const d = Math.hypot(px - x, py - y);
          if (d < bd) {
            bd = d;
            best = s.id;
          }
        }
        return best;
      },
      onTap: (id) => {
        if (ctx.locked) return;
        ctx.set({ star: id as typeof p.star });
        selPulse.play();
      },
    });
    const selPulse = new Tween(700, ease.outCubic);

    // Lebensweg
    let track: TrackPoint[] = evolutionTrack(p.m);
    let lifeU = p.age / 100;
    const lifeTw = new Tween(14000, ease.linear);
    let lifeFrom = 0;
    let lifePlaying = false;
    const snFlash = new Tween(1800, ease.outCubic);
    let lastPhase: Phase = 'ms';
    /** Zeitanteil u → Lebenszeit: die Hauptreihe dauert 86 % des Weges. */
    const totalGyr = () => msLifetime(p.m) / 0.86;
    /** Für die Anzeige: Zeitachse nichtlinear, damit die kurzen Spätphasen sichtbar werden. */
    const displayU = (u: number) => (u < 0.86 ? (u / 0.86) * 0.5 : 0.5 + ((u - 0.86) / 0.14) * 0.5);
    const fromDisplay = (d: number) => (d < 0.5 ? (d / 0.5) * 0.86 : 0.86 + ((d - 0.5) / 0.5) * 0.14);

    // Übung
    let quiz = quizStar(p.qn);
    let verdict: boolean | null = null;
    let score = { right: 0, all: 0 };
    const revealTw = new Tween(900, ease.outBack);

    // Parallaxe
    let yearPhase = 0.25;
    const yearTw = new Tween(6000, ease.linear);
    let yearFrom = 0;

    /* -------------------------------------------------------------- */
    /* Zeichenhilfen                                                   */
    /* -------------------------------------------------------------- */

    function tag(g: CanvasRenderingContext2D, x: number, y: number, txt: string, col: string, R: Rect, size = 13, align: 'center' | 'left' | 'right' = 'center'): void {
      g.save();
      g.font = `700 ${size}px ${th().font}`;
      const w = g.measureText(txt).width + 12;
      const h = size + 9;
      const x0 = align === 'center' ? x - w / 2 : align === 'left' ? x : x - w;
      const lx = clamp(x0, R.x + 4, R.x + R.w - w - 4);
      const ly = clamp(y - h / 2, R.y + 4, R.y + R.h - h - 4);
      // auf dem Nachthimmel immer dunkel hinterlegen, damit helle Schrift lesbar bleibt
      const onSky = col === LABEL || col === '#8fd0ff' || p.mode === 'parallax' || p.mode === 'compare';
      g.fillStyle = th().dark || onSky ? 'rgba(20,27,38,0.9)' : 'rgba(255,255,255,0.92)';
      roundRect(g, lx, ly, w, h, 6);
      g.fill();
      g.strokeStyle = withAlpha(col, 0.55);
      g.lineWidth = 1;
      g.stroke();
      g.fillStyle = col;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillText(txt, lx + 6, ly + h / 2 + 0.5);
      g.restore();
    }
    /** Leuchtender Stern als Scheibe mit Schein. */
    function glowStar(g: CanvasRenderingContext2D, x: number, y: number, r: number, T: number, glow = 1): void {
      g.save();
      const halo = r * (1.8 + glow * 1.2) + 6;
      const gr = g.createRadialGradient(x, y, r * 0.3, x, y, halo);
      gr.addColorStop(0, rgb(T, 0.55 * glow));
      gr.addColorStop(1, rgb(T, 0));
      g.fillStyle = gr;
      g.beginPath();
      g.arc(x, y, halo, 0, TAU);
      g.fill();
      const body = g.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r);
      body.addColorStop(0, 'rgba(255,255,255,0.95)');
      body.addColorStop(0.35, rgb(T, 1));
      body.addColorStop(1, rgb(T * 0.8, 1));
      g.fillStyle = body;
      g.beginPath();
      g.arc(x, y, Math.max(0.8, r), 0, TAU);
      g.fill();
      g.restore();
    }
    /** Hintergrund wie ein Nachthimmel (auch im hellen Modus dunkel, damit Sternfarben stimmen). */
    function sky(g: CanvasRenderingContext2D, r: Rect, seed = 3, n = 80): void {
      g.save();
      roundRect(g, r.x, r.y, r.w, r.h, 10);
      g.clip();
      const gr = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      gr.addColorStop(0, th().dark ? '#05080f' : '#0c1426');
      gr.addColorStop(1, th().dark ? '#0b1120' : '#17213a');
      g.fillStyle = gr;
      g.fillRect(r.x, r.y, r.w, r.h);
      const sr = rng(seed);
      for (let i = 0; i < n; i++) {
        g.fillStyle = `rgba(255,255,255,${0.25 + sr() * 0.5})`;
        g.beginPath();
        g.arc(r.x + sr() * r.w, r.y + sr() * r.h, sr() * 1.1 + 0.3, 0, TAU);
        g.fill();
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* HR-Diagramm (Rahmen, Achsen, Linien)                            */
    /* -------------------------------------------------------------- */

    const LABEL = '#dfe6f3';
    const GRIDC = 'rgba(200,215,240,0.12)';
    function hrdFrame(g: CanvasRenderingContext2D, small = false): void {
      const r = hrd.rect;
      sky(g, { x: r.x - 2, y: r.y - 2, w: r.w + 4, h: r.h + 4 }, 9, small ? 40 : 90);
      g.save();
      g.strokeStyle = GRIDC;
      for (const T of [40000, 20000, 10000, 6000, 4000, 3000]) {
        const [x] = hrd.toPx(-lg(T), 0);
        g.beginPath();
        g.moveTo(x, r.y);
        g.lineTo(x, r.y + r.h);
        g.stroke();
      }
      for (let e = -4; e <= 6; e += small ? 2 : 1) {
        const [, y] = hrd.toPx(0, e);
        g.beginPath();
        g.moveTo(r.x, y);
        g.lineTo(r.x + r.w, y);
        g.stroke();
      }
      g.restore();
    }
    /** Achsenbeschriftung außerhalb des Diagramms (nach hrd.end(), sonst abgeschnitten). */
    function hrdLabels(g: CanvasRenderingContext2D, small = false): void {
      const r = hrd.rect;
      g.save();
      g.font = `600 ${small ? 10 : 11}px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'center';
      g.textBaseline = 'top';
      for (const T of [40000, 20000, 10000, 6000, 4000, 3000]) {
        const [x] = hrd.toPx(-lg(T), 0);
        if (!(small && (T === 6000 || T === 20000)) && !((small || narrow()) && T === 4000)) g.fillText(N(T, 0), x, r.y + r.h + 4);
      }
      g.textAlign = 'right';
      g.textBaseline = 'middle';
      for (let e = -4; e <= 6; e += small ? 2 : 1) {
        const [, y] = hrd.toPx(0, e);
        g.fillText(e === 0 ? '1' : e === 1 ? '10' : `10${sup(e)}`, r.x - 5, y);
      }
      g.textAlign = 'center';
      g.textBaseline = 'bottom';
      g.font = `700 ${small ? 10 : 12}px ${th().font}`;
      g.fillText(`${ctx.t('hot')}   ${ctx.t('xAx')}   ${ctx.t('cool')}`, r.x + r.w / 2, r.y + r.h + (small ? 30 : 34));
      g.save();
      g.translate(r.x - (small ? 34 : 38), r.y + r.h / 2);
      g.rotate(-Math.PI / 2);
      g.fillText(ctx.t('yAx'), 0, 0);
      g.restore();
      g.restore();
    }
    function sup(e: number): string {
      const map: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
      return String(e)
        .split('')
        .map((c) => map[c] ?? c)
        .join('');
    }
    function radiusLines(g: CanvasRenderingContext2D): void {
      const r = hrd.rect;
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      g.setLineDash([5, 6]);
      g.lineWidth = 1;
      g.font = `600 11px ${th().font}`;
      for (const R of [0.01, 0.1, 1, 10, 100, 1000]) {
        // log L = 2 log R + 4 (log T − log T☉)
        const at = (x: number) => 2 * lg(R) + 4 * (-x - lg(T_SUN));
        const [x0, y0] = hrd.toPx(X_HOT, at(X_HOT));
        const [x1, y1] = hrd.toPx(X_COOL, at(X_COOL));
        g.strokeStyle = 'rgba(160,190,240,0.35)';
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x1, y1);
        g.stroke();
        // Beschriftung dort, wo die Linie im Bild ist
        const xl = X_COOL - (X_COOL - X_HOT) * 0.1;
        const yl = at(xl);
        if (yl > Y_LO + 0.3 && yl < Y_HI - 0.3) {
          const [px, py] = hrd.toPx(xl, yl);
          g.fillStyle = 'rgba(190,210,245,0.55)';
          g.textAlign = 'center';
          g.fillText(`${R < 1 ? N(R, R < 0.1 ? 2 : 1) : N(R, 0)} R☉`, px, py - 6);
        }
      }
      g.restore();
    }
    function regionLabels(g: CanvasRenderingContext2D): void {
      const lbl = (txt: string, T: number, Lum: number, rot = 0) => {
        const [x, y] = hrd.toPx(...toXY(T, Lum));
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        g.font = `800 ${narrow() ? 11 : 13}px ${th().font}`;
        g.fillStyle = 'rgba(230,238,252,0.55)';
        g.textAlign = 'center';
        g.fillText(txt, 0, 0);
        g.restore();
      };
      const [ax, ay] = hrd.toPx(...toXY(20000, 5000));
      const [bx, by] = hrd.toPx(...toXY(4000, 0.06));
      const rot = Math.atan2(by - ay, bx - ax);
      lbl(ctx.t('ms'), 9000, 60 * 0.3, rot);
      lbl(ctx.t('giants'), 5600, 3000);
      lbl(ctx.t('supergiants'), 9000, p.classes ? 2.5e5 : 6e5);
      lbl(ctx.t('wds'), 14000, 2e-4);
    }
    function drawPopulation(g: CanvasRenderingContext2D): void {
      const r = hrd.rect;
      const n = Math.round(pop.length * (reduced ? 1 : intro.value));
      g.save();
      g.beginPath();
      g.rect(r.x, r.y, r.w, r.h);
      g.clip();
      for (let i = 0; i < n; i++) {
        const s = pop[i]!;
        const [x, y] = hrd.toPx(...toXY(s.T, s.L));
        const R = radiusFrom(s.L, s.T);
        const rad = clamp(1.4 + lg(R + 1) * 1.1, 1.1, 4);
        g.fillStyle = rgb(s.T, 0.8);
        g.beginPath();
        g.arc(x, y, rad, 0, TAU);
        g.fill();
      }
      g.restore();
    }
    function drawNamedStars(g: CanvasRenderingContext2D, R: Rect): void {
      const appear = reduced ? 1 : clamp(intro.value * 1.6 - 0.4, 0, 1);
      for (const s of STARS) {
        const [x, y] = hrd.toPx(...toXY(s.T, s.L));
        const rad = clamp(3 + lg(radiusFrom(s.L, s.T) + 1) * 1.8, 3, 9) * appear;
        glowStar(g, x, y, rad, s.T, 0.6);
        const isSel = s.id === p.star;
        if (isSel) {
          const pulse = selPulse.running ? 1 + (1 - selPulse.value) * 1.5 : 1;
          g.save();
          g.strokeStyle = '#ffffff';
          g.lineWidth = 2;
          g.beginPath();
          g.arc(x, y, (rad + 7) * pulse, 0, TAU);
          g.stroke();
          g.restore();
        }
        if (isSel || (!narrow() && ['sun', 'betelgeuse', 'rigel', 'siriusb', 'proxima', 'vega', 'aldebaran'].includes(s.id))) {
          g.save();
          g.font = `${isSel ? 800 : 600} ${isSel ? 13 : 11}px ${th().font}`;
          g.fillStyle = isSel ? '#ffffff' : LABEL;
          g.textAlign = x > R.x + R.w * 0.75 ? 'right' : 'left';
          g.textBaseline = 'middle';
          const dx = g.textAlign === 'right' ? -(rad + 8) : rad + 8;
          g.fillText(ctx.lang === 'de' ? s.de : s.en, x + dx, y - 1);
          g.restore();
        }
      }
    }

    function drawHRD(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      hrd.resize();
      hrd.begin();
      hrdFrame(g);
      if (p.lines) radiusLines(g);
      if (p.pop) drawPopulation(g);
      regionLabels(g);
      if (p.classes) classStrip(g);
      drawNamedStars(g, hrd.rect);
      if (p.own) {
        const [x, y] = hrd.toPx(...toXY(ownT(), ownL()));
        glowStar(g, x, y, clamp(4 + lg(ownR() + 1) * 2.4, 4, 12), ownT(), 1);
        tag(g, x, y - 24, ctx.t('own'), COL.purple(), hrd.rect, 12);
      }
      hrd.end();
      hrdLabels(g);
    }

    /* -------------------------------------------------------------- */
    /* Sterne vergleichen                                              */
    /* -------------------------------------------------------------- */

    const growTw = new Tween(900, ease.outCubic);
    growTw.play();
    function drawCompare(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const topH = Math.round(R.h * 0.52);
      const top: Rect = { x: R.x + 6, y: R.y + 6, w: R.w - 12, h: topH - 6 };
      sky(g, top, 4, 60);
      specRect = { x: R.x + 48, y: R.y + topH + 18, w: R.w - 62, h: R.h - topH - 66 };
      const a = { T: ownT(), R: ownR(), name: ctx.t('own') };
      const b = { T: sel().T, R: selR(), name: ctx.lang === 'de' ? sel().de : sel().en };
      // Maßstab: der größere Stern füllt höchstens 40 % der Breite
      const maxPx = Math.min(top.w * 0.2, top.h * 0.38);
      const big = Math.max(a.R, b.R);
      const k = maxPx / big;
      const grow = reduced ? 1 : growTw.value;
      const cy = top.y + top.h * 0.52;
      const pos = [top.x + top.w * 0.28, top.x + top.w * 0.72];
      [a, b].forEach((s, i) => {
        const r = Math.max(1.2, s.R * k * grow);
        glowStar(g, pos[i]!, cy, r, s.T, 0.8);
        g.save();
        g.font = `700 ${narrow() ? 12 : 13}px ${th().font}`;
        g.fillStyle = LABEL;
        g.textAlign = 'center';
        g.fillText(s.name, pos[i]!, top.y + 18);
        g.font = `600 ${narrow() ? 11 : 12}px ${th().font}`;
        g.fillStyle = 'rgba(223,230,243,0.8)';
        g.fillText(`${N(s.T, 0)} K · ${S(s.R)} R☉`, pos[i]!, top.y + top.h - 10);
        // Sonne zum Größenvergleich als Umriss im großen Stern
        if (i === 1 && s.R > 5 && k > 1.5) {
          g.strokeStyle = 'rgba(255,255,255,0.75)';
          g.setLineDash([3, 3]);
          g.beginPath();
          g.arc(pos[i]!, cy, Math.max(1.5, k * grow), 0, TAU);
          g.stroke();
          g.setLineDash([]);
        }
        if (r < 3) {
          g.strokeStyle = 'rgba(255,255,255,0.6)';
          g.beginPath();
          g.arc(pos[i]!, cy, 10, 0, TAU);
          g.stroke();
        }
        g.restore();
      });
      // Spektren
      spec.setRange([-80, 2000], [-0.2, 1.05]);
      spec.setAxes({ x: { label: ctx.t('lambda') }, y: { label: ctx.t('flux'), numbers: false } });
      spec.resize();
      spec.begin();
      // sichtbarer Bereich als Regenbogen
      const sr = spec.rect;
      const [vx0] = spec.toPx(380, 0);
      const [vx1] = spec.toPx(750, 0);
      const rb = g.createLinearGradient(vx0, 0, vx1, 0);
      ['#7b2cff', '#2a5bff', '#00b7ff', '#18d14a', '#ffe11a', '#ff8a00', '#ff2a1a'].forEach((c, i, arr) => rb.addColorStop(i / (arr.length - 1), c));
      g.save();
      g.globalAlpha = 0.18;
      g.fillStyle = rb;
      g.fillRect(vx0, sr.y, vx1 - vx0, sr.h);
      g.restore();
      spec.grid({ minor: false });
      spec.axes();
      const peak = Math.max(planck(wienPeakNm(a.T), a.T), planck(wienPeakNm(b.T), b.T));
      const cols = [COL.purple(), COL.orange()];
      [a, b].forEach((s, i) => {
        spec.fn((l) => (l <= 20 ? 0 : planck(l, s.T) / peak), { color: cols[i]!, width: 2.6, from: 20, to: 2000 });
        const lp = wienPeakNm(s.T);
        const yp = planck(lp, s.T) / peak;
        spec.segment([lp, 0], [lp, yp], { color: withAlpha(cols[i]!, 0.6), width: 1.2, dash: [4, 4] });
        spec.point(lp, yp, { color: cols[i]!, radius: 4 });
        if (p.val) spec.text(lp, yp, `${N(lp, 0)} nm`, { color: cols[i]!, size: 11, weight: 'bold', offset: [i === 0 ? 6 : -6, -12], align: i === 0 ? 'left' : 'right' });
      });
      spec.text(565, 0.93, ctx.t('visible'), { color: th().muted, size: 11, weight: 'bold' });
      spec.end();
    }

    /* -------------------------------------------------------------- */
    /* Lebensweg                                                       */
    /* -------------------------------------------------------------- */

    function phaseColor(ph: Phase): string {
      if (ph === 'ms') return COL.blue();
      if (ph === 'sub' || ph === 'hb') return COL.orange();
      if (ph === 'rgb' || ph === 'agb' || ph === 'rsg') return COL.red();
      if (ph === 'pn') return COL.teal();
      if (ph === 'sn') return COL.purple();
      return COL.green();
    }
    function drawLife(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      hrd.resize();
      hrd.begin();
      hrdFrame(g, true);
      if (p.lines) radiusLines(g);
      // Hauptreihe angedeutet
      const ms: [number, number][] = [];
      for (let k = 0; k <= 40; k++) {
        const M = 0.1 * 400 ** (k / 40);
        ms.push(toXY(msTemperature(M), msLuminosity(M)));
      }
      hrd.polyline(ms, { color: 'rgba(160,190,240,0.35)', width: 8 });
      // Weg
      const u = lifeU;
      const pts: [number, number][] = [];
      const steps = 400;
      for (let k = 0; k <= steps; k++) {
        const uu = fromDisplay(k / steps);
        if (uu > u) break;
        const q = trackAt(track, uu);
        pts.push(toXY(q.T, q.L));
      }
      const full: [number, number][] = [];
      for (let k = 0; k <= steps; k++) {
        const q = trackAt(track, fromDisplay(k / steps));
        full.push(toXY(q.T, q.L));
      }
      hrd.polyline(full, { color: 'rgba(255,255,255,0.22)', width: 1.4, dash: [4, 4] });
      if (Math.abs(p.m - 1) > 0.05) {
        const sunTr = evolutionTrack(1);
        const sp: [number, number][] = [];
        for (let k = 0; k <= 200; k++) {
          const q = trackAt(sunTr, fromDisplay(k / 200));
          sp.push(toXY(q.T, q.L));
        }
        hrd.polyline(sp, { color: 'rgba(255,209,102,0.28)', width: 1.2, dash: [2, 5] });
        const [sx, sy] = hrd.toPx(...toXY(T_SUN, 1));
        g.save();
        g.font = `600 10px ${th().font}`;
        g.fillStyle = 'rgba(255,209,102,0.7)';
        g.textAlign = 'left';
        g.fillText(ctx.t('sunTrack'), sx + 8, sy + 12);
        g.restore();
      }
      if (pts.length > 1) hrd.polyline(pts, { color: '#ffd166', width: 2.6 });
      const cur = trackAt(track, u);
      const [cx, cy] = hrd.toPx(...toXY(cur.T, cur.L));
      glowStar(g, cx, cy, 5, cur.T, 1);
      hrd.end();
      hrdLabels(g, true);
      // großes Sternbild
      const hr = hrd.rect;
      const side = R.w > R.h * 1.1;
      const tlH = 64;
      const pic: Rect = side ? { x: hr.x + hr.w + 14, y: R.y + 10, w: R.x + R.w - (hr.x + hr.w + 14) - 8, h: R.h - tlH - 20 } : { x: R.x + 8, y: hr.y + hr.h + 40, w: R.w - 16, h: R.y + R.h - tlH - (hr.y + hr.h + 40) - 8 };
      sky(g, pic, 12, 50);
      const px = pic.x + pic.w / 2;
      const py = pic.y + pic.h / 2;
      const Rst = radiusFrom(cur.L, cur.T);
      const maxR = Math.min(pic.w, pic.h) * 0.42;
      // Radius logarithmisch, damit Weiße Zwerge und Überriesen beide sichtbar sind
      const rPx = clamp(maxR * (0.18 + 0.82 * clamp((lg(Rst) + 2) / 5, 0, 1)), 2, maxR);
      const ph = cur.phase;
      if (ph === 'pn') {
        const ringR = maxR * 0.85;
        g.save();
        const rg = g.createRadialGradient(px, py, ringR * 0.5, px, py, ringR);
        rg.addColorStop(0, 'rgba(80,220,200,0)');
        rg.addColorStop(0.75, 'rgba(80,220,200,0.45)');
        rg.addColorStop(1, 'rgba(255,90,120,0)');
        g.fillStyle = rg;
        g.beginPath();
        g.arc(px, py, ringR, 0, TAU);
        g.fill();
        g.restore();
        glowStar(g, px, py, 4, cur.T, 1.4);
      } else if (ph === 'sn' || (u >= 1 && p.m >= 8)) {
        const f = reduced ? 1 : snFlash.running ? snFlash.value : 1;
        const rem = remnant(p.m);
        g.save();
        const blast = maxR * (0.3 + 0.9 * f);
        const bg = g.createRadialGradient(px, py, 0, px, py, blast);
        bg.addColorStop(0, `rgba(255,255,255,${0.9 * (1 - f) + 0.1})`);
        bg.addColorStop(0.4, `rgba(180,150,255,${0.6 * (1 - f) + 0.15})`);
        bg.addColorStop(1, 'rgba(255,80,60,0)');
        g.fillStyle = bg;
        g.beginPath();
        g.arc(px, py, blast, 0, TAU);
        g.fill();
        // Überrest
        if (rem === 'bh') {
          g.fillStyle = '#000';
          g.strokeStyle = 'rgba(255,190,120,0.8)';
          g.lineWidth = 3;
          g.beginPath();
          g.arc(px, py, 9, 0, TAU);
          g.fill();
          g.stroke();
        } else glowStar(g, px, py, 3, 1e5, 1.2);
        g.restore();
      } else glowStar(g, px, py, rPx, cur.T, 1);
      if (p.val) {
        g.save();
        g.font = `600 ${narrow() ? 11 : 12}px ${th().font}`;
        g.fillStyle = LABEL;
        g.textAlign = 'center';
        if (ph !== 'sn') g.fillText(`${N(cur.T, 0)} K · ${S(cur.L)} L☉ · ${S(Rst)} R☉`, px, pic.y + pic.h - 10);
        g.restore();
      }
      // Zeitleiste
      const tl: Rect = { x: R.x + 14, y: R.y + R.h - tlH + 8, w: R.w - 28, h: 16 };
      for (let i = 1; i < track.length; i++) {
        const a = track[i - 1]!;
        const b = track[i]!;
        const x0 = tl.x + displayU(a.t) * tl.w;
        const x1 = tl.x + displayU(b.t) * tl.w;
        g.fillStyle = withAlpha(phaseColor(b.phase), 0.75);
        g.fillRect(x0, tl.y, Math.max(1, x1 - x0), tl.h);
      }
      g.save();
      g.strokeStyle = withAlpha(th().text, 0.3);
      g.strokeRect(tl.x, tl.y, tl.w, tl.h);
      if (Math.abs(p.m - 1) < 0.05) {
        const sx = tl.x + displayU(4.6 / totalGyr()) * tl.w;
        g.strokeStyle = COL.orange();
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(sx, tl.y - 3);
        g.lineTo(sx, tl.y + tl.h + 3);
        g.stroke();
        g.font = `700 10px ${th().font}`;
        g.fillStyle = COL.orange();
        g.textAlign = 'center';
        g.textBaseline = 'bottom';
        g.fillText(ctx.t('sunNow'), sx, tl.y - 4);
      }
      const mx = tl.x + displayU(u) * tl.w;
      g.fillStyle = th().text;
      g.beginPath();
      g.moveTo(mx, tl.y - 2);
      g.lineTo(mx - 6, tl.y - 10);
      g.lineTo(mx + 6, tl.y - 10);
      g.closePath();
      g.fill();
      g.font = `600 11px ${th().font}`;
      g.fillStyle = th().muted;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.fillText(ctx.t('ms'), tl.x + 4, tl.y + tl.h + 4);
      g.textAlign = 'right';
      g.fillText('→ ' + ctx.t(`end_${remnant(p.m)}`), tl.x + tl.w, tl.y + tl.h + 4);
      // Legende der Phasen (nur breit genug)
      if (tl.w > 520) {
        const seen: Phase[] = [];
        for (const q of track) if (!seen.includes(q.phase)) seen.push(q.phase);
        let lx = tl.x + tl.w * 0.22;
        g.textAlign = 'left';
        g.font = `600 10px ${th().font}`;
        for (const ph of seen) {
          const name = ctx.t(`ph_${ph}`).split(':')[0]!;
          g.fillStyle = withAlpha(phaseColor(ph), 0.85);
          g.fillRect(lx, tl.y + tl.h + 7, 8, 8);
          g.fillStyle = th().muted;
          g.fillText(name, lx + 11, tl.y + tl.h + 6);
          lx += g.measureText(name).width + 24;
          if (lx > tl.x + tl.w * 0.8) break;
        }
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Parallaxe                                                       */
    /* -------------------------------------------------------------- */

    function drawParallax(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      const inner: Rect = { x: R.x + 6, y: R.y + 6, w: R.w - 12, h: R.h - 12 };
      sky(g, inner, 21, 0);
      const cx = inner.x + inner.w / 2;
      const orbitR = Math.min(inner.w * 0.2, inner.h * 0.16);
      const sunY = inner.y + inner.h * 0.78;
      // Hintergrundsterne als Streifen oben
      const stripY = inner.y + 30;
      const br = rng(77);
      g.save();
      for (let i = 0; i < 26; i++) {
        const x = inner.x + 10 + br() * (inner.w - 20);
        const y = stripY - 12 + br() * 24;
        g.fillStyle = `rgba(255,255,255,${0.5 + br() * 0.5})`;
        g.beginPath();
        g.arc(x, y, 1 + br() * 1.6, 0, TAU);
        g.fill();
      }
      g.font = `600 11px ${th().font}`;
      g.fillStyle = 'rgba(223,230,243,0.7)';
      g.textAlign = 'left';
      g.fillText(ctx.t('bg'), inner.x + 8, stripY + 28);
      g.restore();
      // naher Stern: Abstand übertrieben (nicht maßstäblich), kleiner p → weiter weg
      const starY = sunY - orbitR * (1.3 + 2.4 * clamp((0.8 - lg(p.p * 10) * 0.55) / 1.4, 0.15, 1.4));
      const starYc = Math.max(stripY + 50, starY);
      // Erdbahn
      g.save();
      g.strokeStyle = 'rgba(140,180,255,0.5)';
      g.setLineDash([5, 5]);
      g.beginPath();
      g.ellipse(cx, sunY, orbitR, orbitR * 0.35, 0, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      g.restore();
      glowStar(g, cx, sunY, 9, 5772, 1);
      tag(g, cx, sunY + 26, ctx.t('sun'), LABEL, inner, 11);
      // Erde
      const ang = yearPhase * TAU;
      const ex = cx + Math.cos(ang) * orbitR;
      const ey = sunY + Math.sin(ang) * orbitR * 0.35;
      // Sichtlinie Erde → Stern → Hintergrund
      const proj = (x0: number, y0: number) => {
        const t = (stripY - y0) / (starYc - y0);
        return x0 + (cx - x0) * t;
      };
      const appX = proj(ex, ey);
      g.save();
      g.strokeStyle = 'rgba(255,209,102,0.75)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(ex, ey);
      g.lineTo(appX, stripY);
      g.stroke();
      // Januar- und Juli-Stellung
      const jx = cx + orbitR;
      const kx = cx - orbitR;
      for (const [x, lbl] of [
        [jx, ctx.t('jan')],
        [kx, ctx.t('jul')],
      ] as const) {
        g.strokeStyle = 'rgba(255,255,255,0.28)';
        g.setLineDash([3, 4]);
        g.beginPath();
        g.moveTo(x, sunY);
        g.lineTo(proj(x, sunY), stripY);
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = 'rgba(223,230,243,0.75)';
        g.font = `600 11px ${th().font}`;
        g.textAlign = 'center';
        g.fillText(lbl, x, sunY + 22 + (x > cx ? 0 : 0));
      }
      // Winkel p am Stern (halber Winkel zwischen den Sichtlinien)
      const a1 = Math.atan2(sunY - starYc, jx - cx);
      const a0 = Math.atan2(sunY - starYc, 0);
      g.strokeStyle = COL.orange();
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, starYc, 34, Math.min(a0, a1), Math.max(a0, a1));
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.35)';
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(cx, starYc);
      g.lineTo(cx, sunY);
      g.stroke();
      g.setLineDash([]);
      g.restore();
      if (p.val) tag(g, cx + 50, starYc + 30, `p = ${N(p.p, 3)}″`, COL.orange(), inner, 12, 'left');
      // scheinbare Lage vor den Hintergrundsternen
      g.save();
      g.strokeStyle = 'rgba(255,209,102,0.9)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(appX, stripY, 7, 0, TAU);
      g.stroke();
      g.restore();
      glowStar(g, cx, starYc, 6, 3500, 1);
      tag(g, cx - 14, starYc - 4, ctx.t('star'), LABEL, inner, 11, 'right');
      // Erde
      g.save();
      const eg = g.createRadialGradient(ex - 2, ey - 2, 1, ex, ey, 7);
      eg.addColorStop(0, '#8fd0ff');
      eg.addColorStop(1, '#1d5fbf');
      g.fillStyle = eg;
      g.beginPath();
      g.arc(ex, ey, 7, 0, TAU);
      g.fill();
      g.restore();
      tag(g, ex + 12, ey - 16, ctx.t('earth'), '#8fd0ff', inner, 11, 'left');
      // Helligkeitsskala rechts: wo liegt der Stern zwischen hell und schwach?
      if (p.pstar !== 'custom' && p.val) {
        const st = starById(p.pstar)!;
        const mApp = appMag(absMag(st.L), parsecFromParallax(p.p));
        const bx = inner.x + inner.w - 34;
        const by0 = inner.y + inner.h * 0.3;
        const by1 = inner.y + inner.h * 0.8;
        const yOf = (m: number) => by0 + ((clamp(m, -2, 10) + 2) / 12) * (by1 - by0);
        g.save();
        const gr = g.createLinearGradient(0, by0, 0, by1);
        gr.addColorStop(0, 'rgba(255,255,255,0.9)');
        gr.addColorStop(1, 'rgba(255,255,255,0.05)');
        g.fillStyle = gr;
        g.fillRect(bx - 4, by0, 8, by1 - by0);
        g.font = `600 10px ${th().font}`;
        g.fillStyle = 'rgba(223,230,243,0.75)';
        g.textAlign = 'right';
        g.textBaseline = 'middle';
        for (const m of [-2, 0, 2, 4, 6, 8, 10]) g.fillText(fmt.num(m, 0).replace('-', '−'), bx - 8, yOf(m));
        g.strokeStyle = 'rgba(255,120,120,0.8)';
        g.setLineDash([3, 3]);
        g.beginPath();
        g.moveTo(bx - 6, yOf(6));
        g.lineTo(bx + 8, yOf(6));
        g.stroke();
        g.setLineDash([]);
        g.fillStyle = COL.purple();
        g.beginPath();
        g.moveTo(bx + 6, yOf(mApp));
        g.lineTo(bx + 14, yOf(mApp) - 5);
        g.lineTo(bx + 14, yOf(mApp) + 5);
        g.closePath();
        g.fill();
        g.textAlign = 'center';
        g.textBaseline = 'bottom';
        g.fillStyle = 'rgba(223,230,243,0.75)';
        g.fillText('mag', bx, by0 - 4);
        g.restore();
      }
      // Fernrohr unten links
      const sc = Math.min(inner.w * 0.26, inner.h * 0.22, 120);
      drawScope(g, { x: inner.x + 14, y: inner.y + inner.h - sc - 34, w: sc, h: sc });
      // Hinweis „nicht maßstäblich“ klein unten
      g.save();
      g.font = `600 10px ${th().font}`;
      g.fillStyle = 'rgba(223,230,243,0.55)';
      g.textAlign = 'right';
      g.fillText(ctx.lang === 'de' ? 'nicht maßstäblich' : 'not to scale', inner.x + inner.w - 8, inner.y + inner.h - 8);
      g.restore();
    }


    /* -------------------------------------------------------------- */
    /* Spektralklassen als Farbstreifen                                */
    /* -------------------------------------------------------------- */

    const CLASS_RANGES: [string, number, number][] = [
      ['O', 30000, 45000],
      ['B', 10000, 30000],
      ['A', 7500, 10000],
      ['F', 6000, 7500],
      ['G', 5200, 6000],
      ['K', 3700, 5200],
      ['M', 2300, 3700],
    ];
    function classStrip(g: CanvasRenderingContext2D): void {
      const r = hrd.rect;
      const h = narrow() ? 16 : 18;
      g.save();
      for (const [c, lo, hi] of CLASS_RANGES) {
        const [x0] = hrd.toPx(-lg(hi), 0);
        const [x1] = hrd.toPx(-lg(lo), 0);
        const mid = Math.sqrt(lo * hi);
        g.fillStyle = rgb(mid, 0.85);
        g.fillRect(x0, r.y, x1 - x0, h);
        // senkrechte Grenze zart im Diagramm
        g.strokeStyle = 'rgba(255,255,255,0.08)';
        g.beginPath();
        g.moveTo(x1, r.y + h);
        g.lineTo(x1, r.y + r.h);
        g.stroke();
        if (x1 - x0 > 9) {
          g.fillStyle = '#10182a';
          g.font = `800 ${narrow() ? 10 : 12}px ${th().font}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(c, (x0 + x1) / 2, r.y + h / 2 + 0.5);
        }
      }
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Übung: Sterne einordnen                                         */
    /* -------------------------------------------------------------- */

    function drawQuiz(g: CanvasRenderingContext2D, R: Rect): void {
      drawCard(g, R, th());
      hrd.resize();
      hrd.begin();
      hrdFrame(g);
      radiusLines(g);
      // Population schwach im Hintergrund
      g.save();
      g.globalAlpha = 0.45;
      drawPopulation(g);
      g.restore();
      regionLabels(g);
      if (p.classes) classStrip(g);
      if (verdict !== null) {
        const [x, y] = hrd.toPx(...toXY(quiz.T, quiz.L));
        const k = reduced ? 1 : revealTw.value;
        glowStar(g, x, y, clamp(4 + lg(quiz.R + 1) * 2.4, 4, 12) * k, quiz.T, 1.2);
        g.save();
        g.strokeStyle = verdict ? COL.green() : COL.red();
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(x, y, 16 + (1 - k) * 30, 0, TAU);
        g.stroke();
        g.restore();
        tag(g, x, y - 30, `${S(quiz.L)} L☉`, verdict ? COL.green() : COL.red(), hrd.rect, 12);
      }
      hrd.end();
      hrdLabels(g);
      // Steckbrief des unbekannten Sterns
      const hr = hrd.rect;
      const side = R.w > R.h * 1.05;
      const box: Rect = side ? { x: hr.x + hr.w + 16, y: R.y + 10, w: R.x + R.w - (hr.x + hr.w + 16) - 10, h: R.h - 20 } : { x: R.x + 10, y: hr.y + hr.h + 44, w: R.w - 20, h: R.y + R.h - (hr.y + hr.h + 44) - 10 };
      sky(g, box, 31 + p.qn, 50);
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h * (side ? 0.42 : 0.45);
      const maxR = Math.min(box.w, box.h) * 0.28;
      const rPx = clamp(maxR * (0.15 + 0.85 * clamp((lg(quiz.R) + 2) / 5, 0, 1)), 3, maxR);
      glowStar(g, cx, cy, rPx, quiz.T, 1);
      g.save();
      g.textAlign = 'center';
      g.fillStyle = LABEL;
      g.font = `700 ${narrow() ? 12 : 13}px ${th().font}`;
      g.fillText(ctx.t('mystery'), cx, box.y + 20);
      g.font = `700 ${narrow() ? 13 : 15}px ${th().font}`;
      g.fillText(`T = ${N(quiz.T, 0)} K`, cx, box.y + box.h - (side ? 46 : 30));
      g.fillText(`R = ${S(quiz.R)} R☉`, cx, box.y + box.h - (side ? 24 : 10));
      g.restore();
    }
    function checkQuiz(): void {
      if (verdict !== null) return;
      verdict = p.qa === quiz.region;
      score = { right: score.right + (verdict ? 1 : 0), all: score.all + 1 };
      revealTw.play();
      ctx.announce(`${verdict ? ctx.t('quizOk') : tr('quizNo', { r: regName(quiz.region) })} ${tr('quizL', { R: S(quiz.R), T: N(quiz.T, 0), L: S(quiz.L) })}`);
      updateReadouts();
    }

    /* -------------------------------------------------------------- */
    /* Fernrohr-Ausschnitt (Parallaxe)                                 */
    /* -------------------------------------------------------------- */

    function drawScope(g: CanvasRenderingContext2D, box: Rect): void {
      g.save();
      g.beginPath();
      g.arc(box.x + box.w / 2, box.y + box.h / 2, Math.min(box.w, box.h) / 2, 0, TAU);
      g.fillStyle = '#03060c';
      g.fill();
      g.clip();
      const cx = box.x + box.w / 2;
      const cy = box.y + box.h / 2;
      const rad = Math.min(box.w, box.h) / 2;
      const sr = rng(91);
      for (let i = 0; i < 40; i++) {
        g.fillStyle = `rgba(255,255,255,${0.35 + sr() * 0.6})`;
        g.beginPath();
        g.arc(cx + (sr() - 0.5) * 2 * rad, cy + (sr() - 0.5) * 2 * rad, 0.6 + sr() * 1.3, 0, TAU);
        g.fill();
      }
      // Bahn des nahen Sterns im Jahr: kleine Ellipse, Größe übertrieben ∝ p
      const amp = rad * clamp(0.12 + p.p * 0.7, 0.12, 0.8);
      g.strokeStyle = 'rgba(255,209,102,0.35)';
      g.setLineDash([3, 4]);
      g.beginPath();
      g.ellipse(cx, cy, amp, amp * 0.35, 0, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      const a = yearPhase * TAU;
      glowStar(g, cx - Math.cos(a) * amp, cy - Math.sin(a) * amp * 0.35, 4, 3500, 1);
      g.restore();
      g.save();
      g.strokeStyle = 'rgba(200,210,230,0.6)';
      g.lineWidth = 3;
      g.beginPath();
      g.arc(cx, cy, rad, 0, TAU);
      g.stroke();
      g.font = `600 11px ${th().font}`;
      g.fillStyle = 'rgba(223,230,243,0.8)';
      g.textAlign = 'center';
      g.fillText(ctx.t('scope'), cx, box.y + box.h + 14);
      g.restore();
    }

    /* -------------------------------------------------------------- */
    /* Karte                                                           */
    /* -------------------------------------------------------------- */

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
      while (s > 11 && width(s) > maxW) s -= 0.5;
      g.save();
      g.textBaseline = 'middle';
      g.textAlign = 'left';
      let cx = x;
      let cy = y;
      for (const sg of segs) {
        g.font = `${sg.w ?? 500} ${s}px ${th().font}`;
        for (const wd of sg.s.split(/(?<= )/)) {
          const w = g.measureText(wd).width;
          if (cx + w > x + maxW && cx > x + 20) {
            cx = x;
            cy += s * 1.38;
          }
          g.fillStyle = sg.c ?? th().text;
          g.fillText(wd, cx, cy);
          cx += w;
        }
      }
      g.restore();
      return cy - y + s * 1.45;
    }
    const regName = (r: Region) => ctx.t(`reg_${r}`);
    function drawInfo(g: CanvasRenderingContext2D, R: Rect): void {
      const t = th();
      drawCard(g, R, t, COL.blue());
      const x = R.x + 16;
      const maxW = R.w - 32;
      const size = R.w < 330 ? 13 : R.w < 440 ? 14 : 15;
      let y = R.y + 22;
      const line = (segs: Seg[], d = 0) => (y += segLine(g, segs, x, y, maxW, size + d));
      const gap = (h = 5) => (y += h);
      switch (p.mode) {
        case 'hrd': {
          const s = sel();
          const Rr = selR();
          line([{ s: ctx.t('hrdT'), c: COL.blue(), w: 800 }], 1);
          line([{ s: ctx.lang === 'de' ? s.de : s.en, w: 800 }, { s: `  ${tr('cls', { c: spectralClass(s.T) })} · ${regName(regionOf(s.T, s.L))}`, c: t.muted, w: 600 }], 0);
          if (p.val) {
            line([{ s: `T = ${N(s.T, 0)} K,  L = ${S(s.L)} L☉,  R = ${S(Rr)} R☉`, c: COL.purple(), w: 700 }], -1);
            line([{ s: s.ly ? tr('dist', { d: S(s.ly) }) : ctx.t('here'), c: t.text }], -1.5);
          }
          if (p.own) {
            gap(3);
            line([{ s: `${ctx.t('own')}: `, c: COL.purple(), w: 800 }, { s: `L = ${S(ownR())}² · (${N(ownT(), 0)} / 5772)⁴ = ${S(ownL())} L☉`, w: 600 }], -1);
            line([{ s: `${tr('cls', { c: spectralClass(ownT()) })} · ${regName(regionOf(ownT(), ownL()))}`, c: t.muted }], -1.5);
          }
          gap();
          line([{ s: ctx.t('hrdG'), c: t.text }], -1.5);
          if (p.lines && !narrow()) line([{ s: ctx.t('hrdLines'), c: t.muted }], -2);
          if (p.classes && !narrow()) line([{ s: ctx.t('classesG'), c: t.muted }], -2);
          line([{ s: ctx.t('hrdHow'), c: t.muted }], -2);
          break;
        }
        case 'compare': {
          const La = ownL();
          const Lb = sel().L;
          line([{ s: ctx.t('compT'), c: COL.blue(), w: 800 }], 1);
          if (p.val) {
            line([{ s: `${ctx.t('own')}: `, c: COL.purple(), w: 800 }, { s: `L = ${S(ownR())}² · (${N(ownT(), 0)} / 5772)⁴ = ${S(La)} L☉`, w: 600 }], -1);
            line([{ s: `${ctx.lang === 'de' ? sel().de : sel().en}: `, c: COL.orange(), w: 800 }, { s: `L = ${S(Lb)} L☉, R = ${S(selR())} R☉`, w: 600 }], -1);
            line([{ s: tr('ratio', { r: S(La / Lb) }), c: t.text, w: 800 }], 0);
            line([{ s: `λ_max: ${N(wienPeakNm(ownT()), 0)} nm / ${N(wienPeakNm(sel().T), 0)} nm`, c: t.text, w: 600 }], -1.5);
          }
          if (p.val) {
            const bigR = Math.max(ownR(), selR());
            if (bigR > 2) line([{ s: tr('suns', { n: S(sunsInside(bigR)) }), c: t.text }], -1.5);
            line([{ s: tr('fluxL', { f: S(surfaceFluxMW(ownT())) }), c: t.text }], -1.5);
          }
          gap();
          line([{ s: ctx.t('compG'), c: t.text }], -1.5);
          line([{ s: ctx.t('compW'), c: t.muted }], -2);
          break;
        }
        case 'life': {
          const cur = trackAt(track, lifeU);
          const age = lifeU * totalGyr();
          line([{ s: tr('lifeT', { m: N(p.m, 1) }), c: COL.blue(), w: 800 }], 1);
          line([{ s: ctx.t(`ph_${cur.phase}`), c: phaseColor(cur.phase), w: 800 }], 0);
          if (p.val) {
            line([{ s: tr('lifeAge', { a: years(age) }), w: 700 }], -1);
            line([{ s: tr('lifeMs', { t: years(msLifetime(p.m)) }), c: t.text, w: 600 }], -1.5);
            line([{ s: tr('lifeEnd', { e: ctx.t(`end_${remnant(p.m)}`) }), c: t.text, w: 600 }], -1.5);
          }
          gap();
          line([{ s: ctx.t('lifeG'), c: t.text }], -1.5);
          line([{ s: ctx.t('lifeDraft'), c: t.muted }], -2);
          break;
        }
        case 'quiz': {
          line([{ s: ctx.t('quizT'), c: COL.blue(), w: 800 }], 1);
          line([{ s: tr('quizTask', { T: N(quiz.T, 0), R: S(quiz.R) }), w: 700 }], -0.5);
          if (verdict === null) {
            line([{ s: ctx.t('quizHow'), c: t.muted }], -1.5);
            gap();
            line([{ s: ctx.t('quizHint'), c: t.muted }], -2);
          } else {
            line([{ s: verdict ? ctx.t('quizOk') : tr('quizNo', { r: regName(quiz.region) }), c: verdict ? COL.green() : COL.red(), w: 800 }], 1);
            line([{ s: tr('quizL', { R: S(quiz.R), T: N(quiz.T, 0), L: S(quiz.L) }), c: COL.purple(), w: 700 }], -1);
          }
          if (score.all) line([{ s: tr('quizScore', { k: score.right, n: score.all }), c: t.muted, w: 600 }], -1.5);
          if (p.classes) line([{ s: ctx.t('classesG'), c: t.muted }], -2);
          break;
        }
        case 'parallax': {
          const pc = parsecFromParallax(p.p);
          const ly = lyFromParallax(p.p);
          line([{ s: ctx.t('paraT'), c: COL.blue(), w: 800 }], 1);
          if (p.pstar !== 'custom') line([{ s: `${ctx.lang === 'de' ? starById(p.pstar)!.de : starById(p.pstar)!.en}: p = ${N(p.p, 3)}″`, c: t.text, w: 700 }], -1);
          if (p.val) {
            line([{ s: tr('paraD', { pc: S(pc), ly: S(ly) }), c: COL.orange(), w: 800 }], 0);
            line([{ s: tr('paraLight', { ly: S(ly) }), c: t.text, w: 600 }], -1.5);
            const carYears = (ly * LY) / (100 / 3.6) / (365.25 * 86400);
            line([{ s: tr('paraCar', { y: fmt.num(Math.round(carYears / 1e6) * 1e6, 0) }), c: t.text }], -1.5);
          }
          gap();
          if (p.val && p.pstar !== 'custom') {
            const st = starById(p.pstar)!;
            const mApp = appMag(absMag(st.L), parsecFromParallax(p.p));
            line([{ s: tr('mag', { m: N(mApp, 1) }), c: COL.purple(), w: 700 }, { s: ` · ${ctx.t(nakedEye(mApp) ? 'eyeYes' : 'eyeNo')}`, c: t.text, w: 600 }], -1.5);
            if (!narrow()) line([{ s: ctx.t('magG'), c: t.muted }], -2.5);
          }
          line([{ s: ctx.t('paraG'), c: t.text }], -1.5);
          if (!narrow()) line([{ s: ctx.t('paraScale'), c: t.muted }], -2);
          break;
        }
      }
    }

    /* -------------------------------------------------------------- */
    /* Ergebnisse und Tastatur                                         */
    /* -------------------------------------------------------------- */

    function updateReadouts(): void {
      switch (p.mode) {
        case 'hrd': {
          const s = sel();
          ctx.readout('L', p.own ? `${S(ownL())} L☉` : `${S(s.L)} L☉`);
          ctx.readout('formula', 'L = 4π · R² · σ · T⁴');
          ctx.readout('extra', `${ctx.lang === 'de' ? s.de : s.en}: R = ${S(selR())} R☉, M_abs = ${N(absMag(s.L), 1)} mag`);
          break;
        }
        case 'compare':
          ctx.readout('L', `${S(ownL())} L☉`);
          ctx.readout('formula', 'L / L☉ = (R / R☉)² · (T / T☉)⁴');
          ctx.readout('extra', `λ_max = ${N(wienPeakNm(ownT()), 0)} nm`);
          break;
        case 'life': {
          const cur = trackAt(track, lifeU);
          ctx.readout('L', `${S(cur.L)} L☉`);
          ctx.readout('formula', 't ≈ 10 Mrd. a · M / L');
          ctx.readout('extra', ctx.t(`ph_${cur.phase}`));
          break;
        }
        case 'quiz':
          ctx.readout('L', verdict === null ? '?' : `${S(quiz.L)} L☉`);
          ctx.readout('formula', 'L / L☉ = (R / R☉)² · (T / T☉)⁴');
          ctx.readout('extra', score.all ? tr('quizScore', { k: score.right, n: score.all }) : ctx.t('quizHint'));
          break;
        case 'parallax':
          ctx.readout('L', `d = ${S(parsecFromParallax(p.p))} pc`);
          ctx.readout('formula', 'd = 1 / p  (d in pc, p in ″)');
          ctx.readout('extra', `${S(lyFromParallax(p.p))} Lj · ${fmt.num(Math.round((206265 / p.p) / 1000) * 1000, 0)} AE`);
          break;
      }
    }
    function keys(): void {
      const de = ctx.lang === 'de';
      if (p.mode === 'hrd') {
        const idx = STARS.findIndex((s) => s.id === p.star);
        const go = (d: number) => () => ctx.set({ star: STARS[(idx + d + STARS.length) % STARS.length]!.id as typeof p.star });
        ctx.setKeyTargets([
          { id: 'prev', label: de ? 'Vorheriger Stern' : 'Previous star', activate: go(-1) },
          { id: 'next', label: de ? 'Nächster Stern' : 'Next star', activate: go(1) },
        ]);
      } else if (p.mode === 'life') {
        ctx.setKeyTargets([
          { id: 'older', label: de ? 'Älter: Lebensabschnitt +5 %' : 'Older: stage +5 %', activate: () => ctx.set({ age: clamp(p.age + 5, 0, 100) }) },
          { id: 'younger', label: de ? 'Jünger: Lebensabschnitt −5 %' : 'Younger: stage −5 %', activate: () => ctx.set({ age: clamp(p.age - 5, 0, 100) }) },
        ]);
      } else if (p.mode === 'quiz') {
        ctx.setKeyTargets([{ id: 'check', label: de ? 'Antwort prüfen' : 'Check the answer', activate: () => checkQuiz() }]);
      } else ctx.setKeyTargets([]);
    }
    function announcePhase(): void {
      const cur = trackAt(track, lifeU);
      if (cur.phase !== lastPhase) {
        lastPhase = cur.phase;
        if (cur.phase === 'sn') snFlash.play();
        ctx.announce(ctx.t(`ph_${cur.phase}`));
        updateReadouts();
      }
    }

    return {
      update(changed, source) {
        if (changed.has('mode') || source === 'init' || source === 'replace') {
          intro.play();
          growTw.play();
          ctx.clock.play();
        }
        if (changed.has('m') || source === 'init' || source === 'replace') {
          track = evolutionTrack(p.m);
          lastPhase = trackAt(track, lifeU).phase;
        }
        if (changed.has('age') || source === 'init' || source === 'replace') {
          lifeU = fromDisplay(p.age / 100);
          if (source !== 'sim') {
            lifeTw.finish();
            lifePlaying = false;
          }
          if (trackAt(track, lifeU).phase === 'sn' && source === 'input') snFlash.play();
          lastPhase = trackAt(track, lifeU).phase;
        }
        if (changed.has('T') || changed.has('lr') || changed.has('star')) growTw.play();
        if (changed.has('pstar') && p.pstar !== 'custom' && source === 'input') ctx.set({ p: PARALLAX[p.pstar]! });
        if (changed.has('p') && source === 'input' && p.pstar !== 'custom' && Math.abs(PARALLAX[p.pstar]! - p.p) > 1e-9) ctx.set({ pstar: 'custom' });
        if (changed.has('qn') || source === 'init' || source === 'replace') {
          quiz = quizStar(p.qn);
          verdict = null;
        }
        if (changed.has('qa') && verdict !== null && source === 'input') verdict = null;
        if (changed.has('star') && source !== 'init') selPulse.play();
        keys();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        if (id === 'next') {
          const idx = STARS.findIndex((s) => s.id === p.star);
          ctx.set({ star: STARS[(idx + 1) % STARS.length]!.id as typeof p.star });
        }
        if (id === 'play') {
          lifeFrom = lifeU >= 0.999 ? 0 : lifeU;
          lifeTw.play(14000 * (1 - displayU(lifeFrom)));
          lifePlaying = true;
          if (reduced) {
            lifeU = 1;
            ctx.set({ age: 100 });
          }
        }
        if (id === 'qcheck' && p.mode === 'quiz') checkQuiz();
        if (id === 'qnext' && p.mode === 'quiz') ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1 });
        if (id === 'orbit') {
          yearFrom = yearPhase;
          yearTw.play();
        }
        ctx.requestRender();
      },
      tick() {
        if (p.mode === 'life' && lifePlaying) {
          const d0 = displayU(lifeFrom);
          lifeU = fromDisplay(d0 + (1 - d0) * lifeTw.value);
          announcePhase();
          updateReadouts();
          if (!lifeTw.running) {
            lifePlaying = false;
            ctx.set({ age: 100 });
          }
        }
        if (p.mode === 'parallax') {
          if (yearTw.running) yearPhase = yearFrom + yearTw.value;
          else if (!reduced) yearPhase += 0.0007;
        }
      },
      resetView() {
        intro.play();
      },
      render() {
        lay = layout();
        const g = surface.begin();
        if (p.mode === 'hrd') drawHRD(g, lay.scene);
        else if (p.mode === 'compare') drawCompare(g, lay.scene);
        else if (p.mode === 'life') drawLife(g, lay.scene);
        else if (p.mode === 'quiz') drawQuiz(g, lay.scene);
        else drawParallax(g, lay.scene);
        drawInfo(g, lay.card);
      },
      destroy: () => surface.destroy(),
    };
  },
});
