import { defineSimulation, Plot, prefersReducedMotion, roundRect, Surface, text, withAlpha, type Rect } from '../../../sim-core';
import {
  airMass,
  rainbowAngle,
  sunAndSky,
  transmission,
  waterIndex,
  additiveMix,
  checkTask,
  colorName,
  coneFromMix,
  coneResponse,
  filterPasses,
  LIGHTS,
  makeTask,
  objectColor,
  PRIMARY_NM,
  prismDeviation,
  REFLECT,
  refractiveIndex,
  spectralName,
  subtractiveMix,
  wavelengthToRgb,
  type ColorTask,
  type FilterId,
  type LightId,
  type ObjectId,
  type Rgb,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const DEG = Math.PI / 180;

const rgbCss = ([r, g, b]: Rgb, a = 1) => `rgba(${Math.round(255 * r)},${Math.round(255 * g)},${Math.round(255 * b)},${a})`;

/**
 * Farben: weißes Licht am Prisma zerlegen, Farbfilter, additive (Licht) und
 * subtraktive (Filter, Farbstoffe) Farbmischung, Bildpunkte eines Bildschirms,
 * Körperfarben unter farbigem Licht, Farbensehen mit drei Zapfenarten und eine Übung.
 */
export default defineSimulation({
  id: 'farben',
  animated: true,
  layout: { aspect: 1.7, aspectNarrow: 0.9 },
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Thema', 'Topic'),
      options: [
        { value: 'prisma', label: L('Prisma und Filter', 'Prism and filter') },
        { value: 'add', label: L('Additive Mischung (Licht)', 'Additive mixing (light)') },
        { value: 'sub', label: L('Subtraktive Mischung (Filter, Farbe)', 'Subtractive mixing (filters, paint)') },
        { value: 'pixel', label: L('Bildschirm: Bildpunkte', 'Screen: pixels') },
        { value: 'koerper', label: L('Körperfarben: Gegenstände unter farbigem Licht', 'Object colours under coloured light') },
        { value: 'auge', label: L('Farbensehen: drei Zapfen im Auge', 'Colour vision: three cones in the eye') },
        { value: 'regen', label: L('Regenbogen: Licht im Regentropfen', 'Rainbow: light in a raindrop') },
        { value: 'himmel', label: L('Himmelsblau und Abendrot', 'Blue sky and red sunset') },
        { value: 'ueben', label: L('Üben: Aufgaben zu Farben', 'Practice: colour tasks') },
      ],
      default: 'prisma',
      display: 'menu',
    },
    {
      key: 'filter',
      type: 'choice',
      label: L('Farbfilter vor dem Schirm', 'Colour filter before the screen'),
      options: [
        { value: 'none', label: L('kein', 'none') },
        { value: 'red', label: L('Rot', 'red') },
        { value: 'green', label: L('Grün', 'green') },
        { value: 'blue', label: L('Blau', 'blue') },
        { value: 'cyan', label: L('Cyan', 'cyan') },
        { value: 'magenta', label: L('Magenta', 'magenta') },
        { value: 'yellow', label: L('Gelb', 'yellow') },
      ],
      default: 'none',
      visibleIf: (v) => v.mode === 'prisma',
    },
    { key: 'r', type: 'number', label: L('Rot', 'Red'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'add' || v.mode === 'pixel' },
    { key: 'g', type: 'number', label: L('Grün', 'Green'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'add' || v.mode === 'pixel' },
    { key: 'b', type: 'number', label: L('Blau', 'Blue'), min: 0, max: 100, step: 5, default: 0, unit: '%', visibleIf: (v) => v.mode === 'add' || v.mode === 'pixel' },
    { key: 'c', type: 'number', label: L('Cyan-Filter', 'Cyan filter'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'sub' },
    { key: 'm', type: 'number', label: L('Magenta-Filter', 'Magenta filter'), min: 0, max: 100, step: 5, default: 0, unit: '%', visibleIf: (v) => v.mode === 'sub' },
    { key: 'y', type: 'number', label: L('Gelb-Filter', 'Yellow filter'), min: 0, max: 100, step: 5, default: 100, unit: '%', visibleIf: (v) => v.mode === 'sub' },
    {
      key: 'light',
      type: 'choice',
      label: L('Lampe', 'Lamp'),
      options: [
        { value: 'white', label: L('weißes Licht', 'white light') },
        { value: 'red', label: L('rotes Licht', 'red light') },
        { value: 'green', label: L('grünes Licht', 'green light') },
        { value: 'blue', label: L('blaues Licht', 'blue light') },
        { value: 'yellow', label: L('gelbes Licht (Rot + Grün)', 'yellow light (red + green)') },
        { value: 'sodium', label: L('Natriumdampflampe', 'sodium lamp') },
      ],
      default: 'white',
      visibleIf: (v) => v.mode === 'koerper',
    },
    { key: 'lam', type: 'number', label: L('Wellenlänge des Lichts', 'Wavelength of the light'), min: 380, max: 720, step: 5, default: 580, unit: 'nm', visibleIf: (v) => v.mode === 'auge' },
    {
      key: 'mixe',
      type: 'boolean',
      label: L('Zum Vergleich: Bildschirm-Mischung aus Rot und Grün', 'For comparison: screen mix of red and green'),
      default: true,
      visibleIf: (v) => v.mode === 'auge',
    },
    {
      key: 'rb',
      type: 'number',
      label: L('Einfall: Abstand vom Tropfenmittelpunkt', 'Entry: distance from the centre of the drop'),
      min: 10,
      max: 95,
      step: 1,
      default: 86,
      unit: '%',
      visibleIf: (v) => v.mode === 'regen',
    },
    { key: 'el', type: 'number', label: L('Sonnenhöhe über dem Horizont', 'Sun’s height above the horizon'), min: 0, max: 70, step: 1, default: 40, unit: '°', visibleIf: (v) => v.mode === 'himmel' },
    { key: 'qn', type: 'number', label: L('Aufgabe Nr.', 'Task no.'), min: 1, max: 999, step: 1, default: 1, visibleIf: (v) => v.mode === 'ueben' },
    { key: 'qa', type: 'text', label: L('Deine Antwort', 'Your answer'), default: '', maxLength: 8, placeholder: L('Nummer oder Zahl', 'number'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  hint: (v) =>
    v.mode === 'regen'
      ? L(
          'Jeder Tropfen wirkt wie ein kleines Prisma mit Spiegel. Verschiebe den Einfallspunkt: Beim Regenbogenwinkel drängen sich die Strahlen.',
          'Each drop acts like a small prism with a mirror. Move the entry point: at the rainbow angle the rays crowd together.',
        )
      : v.mode === 'himmel'
        ? L(
            'Drücke Start und lass die Sonne untergehen. Je länger der Weg durchs Licht der Luft, desto mehr Blau wird herausgestreut.',
            'Press play and let the Sun set. The longer the path through the air, the more blue is scattered out.',
          )
        : v.mode === 'prisma'
          ? L(
              'Der Farbfächer ist zur Verdeutlichung aufgeweitet. Wähle einen Filter und sieh, welche Farben durchkommen.',
              'The colour fan is widened for clarity. Pick a filter and see which colours get through.',
            )
          : v.mode === 'add'
            ? L('Drei farbige Scheinwerfer auf einer dunklen Wand. Wo sie sich überlappen, addiert sich das Licht.', 'Three coloured spotlights on a dark wall. Where they overlap, the light adds up.')
            : v.mode === 'sub'
              ? L(
                  'Drei Farbfilter vor weißem Licht. Jeder Filter schluckt einen Teil – übrig bleibt die Mischfarbe.',
                  'Three colour filters in front of white light. Each filter absorbs a part – what is left is the mixed colour.',
                )
              : v.mode === 'pixel'
                ? L('Von Weitem siehst du eine Farbe, aus der Nähe nur rote, grüne und blaue Leuchtpunkte.', 'From afar you see one colour; close up only red, green and blue dots.')
                : v.mode === 'koerper'
                  ? L(
                      'Ein Gegenstand kann nur das Licht zurückwerfen, das ihn auch trifft. Wähle eine farbige Lampe.',
                      'An object can only reflect the light that falls on it. Choose a coloured lamp.',
                    )
                  : v.mode === 'auge'
                    ? L(
                        'Jede Lichtfarbe reizt die drei Zapfenarten verschieden stark. Gleicher Reiz – gleiche gesehene Farbe.',
                        'Each colour of light stimulates the three kinds of cone differently. Same stimulus – same colour seen.',
                      )
                    : L(
                        'Gib die Nummer der richtigen Antwort ein (bei Prozent die Zahl) und drücke „Prüfen“.',
                        'Enter the number of the correct answer (for percentages, the number) and press “Check”.',
                      ),
  actions: [
    { id: 'sunset', label: L('Sonnenuntergang', 'Sunset'), primary: true, visibleIf: (v) => v.mode === 'himmel' },
    { id: 'check', label: L('Prüfen', 'Check'), primary: true, visibleIf: (v) => v.mode === 'ueben' },
    { id: 'next', label: L('Nächste Aufgabe', 'Next task'), visibleIf: (v) => v.mode === 'ueben' },
  ],
  readouts: [
    { key: 'mix', label: L('Mischfarbe', 'Mixed colour'), spoiler: true },
    { key: 'pass', label: L('Durch den Filter', 'Through the filter'), spoiler: true },
    { key: 'info', label: L('Erklärung', 'Explanation') },
  ],
  presets: [
    { id: 'prisma', label: L('Prisma', 'Prism'), values: { mode: 'prisma', filter: 'none' } },
    { id: 'filter', label: L('Gelbfilter', 'Yellow filter'), values: { mode: 'prisma', filter: 'yellow' } },
    { id: 'gelb', label: L('Rot + Grün', 'Red + green'), values: { mode: 'add', r: 100, g: 100, b: 0 } },
    { id: 'weiss', label: L('Weiß aus Licht', 'White from light'), values: { mode: 'add', r: 100, g: 100, b: 100 } },
    { id: 'gruen', label: L('Cyan + Gelb', 'Cyan + yellow'), values: { mode: 'sub', c: 100, m: 0, y: 100 } },
    { id: 'orange', label: L('Bildschirm: Orange', 'Screen: orange'), values: { mode: 'pixel', r: 100, g: 50, b: 0 } },
    { id: 'magenta', label: L('Rot + Blau = Magenta', 'Red + blue = magenta'), values: { mode: 'add', r: 100, g: 0, b: 100 } },
    { id: 'black', label: L('Alle drei Filter: Schwarz', 'All three filters: black'), values: { mode: 'sub', c: 100, m: 100, y: 100 } },
    { id: 'redf', label: L('Rotfilter', 'Red filter'), values: { mode: 'prisma', filter: 'red' } },
    { id: 'kwhite', label: L('Obstteller im weißen Licht', 'Fruit plate in white light'), values: { mode: 'koerper', light: 'white' } },
    { id: 'kred', label: L('Obstteller im roten Licht', 'Fruit plate in red light'), values: { mode: 'koerper', light: 'red' } },
    { id: 'regen', label: L('Regenbogen: Strahl beim Regenbogenwinkel', 'Rainbow: ray at the rainbow angle'), values: { mode: 'regen', rb: 86 } },
    { id: 'regenMitte', label: L('Strahl nahe der Mitte', 'Ray near the centre'), values: { mode: 'regen', rb: 30 } },
    { id: 'mittag', label: L('Mittags: blauer Himmel', 'Midday: blue sky'), values: { mode: 'himmel', el: 60 } },
    { id: 'abend', label: L('Abendrot', 'Red sunset'), values: { mode: 'himmel', el: 2 } },
    { id: 'kgreen', label: L('Obstteller im grünen Licht', 'Fruit plate in green light'), values: { mode: 'koerper', light: 'green' } },
    { id: 'ksod', label: L('Natriumlampe: alles gelb oder grau', 'Sodium lamp: everything yellow or grey'), values: { mode: 'koerper', light: 'sodium' } },
    { id: 'eye580', label: L('Auge: Gelb 580 nm = Rot + Grün?', 'Eye: yellow 580 nm = red + green?'), values: { mode: 'auge', lam: 580, mixe: true } },
    { id: 'eye450', label: L('Auge: Blau 450 nm', 'Eye: blue 450 nm'), values: { mode: 'auge', lam: 450, mixe: false } },
    { id: 'quiz', label: L('Üben: sechs Aufgaben', 'Practice: six tasks'), values: { mode: 'ueben', qn: 1, qa: '' } },
  ],
  strings: {
    de: {
      canvasR: 'Querschnitt eines Regentropfens mit rotem, grünem und blauem Strahl, die gebrochen, gespiegelt und wieder gebrochen werden; daneben eine Landschaft mit Beobachter und Regenbogen',
      canvasH: 'Landschaft mit Sonne und Himmel, deren Farben von der Sonnenhöhe abhängen; darunter, wie viel jeder Farbe durch die Luft kommt',
      rAngle: 'Rot kommt unter {r}°, Blau unter {b}° zurück',
      rNow: 'dieser Strahl: Rot {r}°, Blau {b}°',
      rInfo: 'Unter etwa 42° (Rot) bzw. 40° (Blau) kommen besonders viele Strahlen zurück. Darum sieht man den Bogen immer im selben Winkel um den Punkt gegenüber der Sonne – Rot außen, Blau innen.',
      rDrop: 'Regentropfen (stark vergrößert)',
      rSun: 'Sonnenlicht',
      rEye: 'Beobachter',
      rShadow: 'Gegenpunkt der Sonne',
      hPath: 'Weg durch die Luft: {m}-mal so lang wie bei senkrechter Sonne',
      hBlue: 'Vom blauen Sonnenlicht kommen {b} % unten an',
      hInfo:
        'Die Luft streut kurzwelliges (blaues) Licht viel stärker als langwelliges (rotes). Das gestreute Blau kommt von überall am Himmel. Bei tiefer Sonne ist das Blau schon unterwegs herausgestreut – die Sonne wird gelb, orange und rot.',
      hThrough: 'kommt durch',
      canvas: 'Farben: Prisma mit Farbfächer und Schirm, drei farbige Lichtkreise, drei Farbfilter oder vergrößerte Bildpunkte eines Bildschirms',
      black: 'Schwarz',
      white: 'Weiß',
      grey: 'Grau',
      red: 'Rot',
      orange: 'Orange',
      yellow: 'Gelb',
      green: 'Grün',
      cyan: 'Cyan (Blaugrün)',
      blue: 'Blau',
      magenta: 'Magenta (Purpur)',
      mixAdd: '{name} – Licht: R {r} %, G {g} %, B {b} %',
      mixSub: '{name} – übrig bleiben R {r} %, G {g} %, B {b} %',
      passNone: 'Alle Farben erreichen den Schirm: weißes Licht.',
      passSome: 'Durch kommt nur {list}; der Rest wird verschluckt (absorbiert). Auf dem Schirm erscheint {name}.',
      white_light: 'weißes Licht',
      screen: 'Schirm',
      ir: 'IR (unsichtbar)',
      uv: 'UV (unsichtbar)',
      far: 'von Weitem',
      near: 'aus der Nähe',
      filterLabel: 'Filter',
      partR: 'Rot',
      partG: 'Grün',
      partB: 'Blau',
      and: 'und',
      canvasQuiz: 'Übungsaufgabe zu Farben mit Rückmeldung',
      kInfo: 'Unter {light} sieht der Apfel {apple}, das Blatt {leaf} und die Banane {banana} aus.',
      kWhy: 'Ein Gegenstand wirft nur die Farben zurück, die im Licht stecken und die er nicht verschluckt. Fehlt eine Farbe im Licht, kann er sie nicht zeigen.',
      kLight_white: 'weißem Licht',
      kLight_red: 'rotem Licht',
      kLight_green: 'grünem Licht',
      kLight_blue: 'blauem Licht',
      kLight_yellow: 'gelbem Licht',
      kLight_sodium: 'Natriumdampflicht',
      obj_apple: 'Apfel',
      obj_leaf: 'Blatt',
      obj_banana: 'Banane',
      obj_sky: 'Heft',
      obj_paper: 'Papier',
      obj_coal: 'Kohle',
      lamp: 'Lampe',
      kUnder: 'Unter {light}',
      eyeVal: 'Reiz der Zapfen: L {l} %, M {m} %, S {s} % – gesehen: {name}',
      eyeMix: 'Rot + Grün vom Bildschirm reizt fast genauso: L {l} %, M {m} %, S {s} % – das Auge sieht keinen Unterschied.',
      eyeInfo: 'Wir haben drei Zapfenarten (L für lange, M für mittlere, S für kurze Wellenlängen). Das Gehirn vergleicht ihre Reize – daraus entsteht die Farbe.',
      cones: 'Empfindlichkeit',
      lamAx: 'λ in nm',
      stim: 'Reiz',
      screenMix: 'Bildschirm',
      spectral: 'Spektralfarbe',
      qTitle: 'Aufgabe {n}',
      qHow: 'Gib die Nummer der richtigen Antwort ein und drücke „Prüfen“.',
      qHowNum: 'Gib die Zahl ein und drücke „Prüfen“.',
      qOk: 'Richtig!',
      qNo: 'Noch nicht – versuche es noch einmal.',
      qSol: 'Lösung',
      qScore: '{k} von {n} richtig · Serie {s}',
      qYour: 'Deine Antwort: {a}',
      qBad: 'Bitte eine Nummer oder Zahl eingeben.',
    },
    en: {
      canvasR: 'Cross-section of a raindrop with a red, a green and a blue ray that are refracted, reflected and refracted again; next to it a landscape with an observer and a rainbow',
      canvasH: 'Landscape with the Sun and the sky, whose colours depend on the Sun’s height; below, how much of each colour gets through the air',
      rAngle: 'red returns at {r}°, blue at {b}°',
      rNow: 'this ray: red {r}°, blue {b}°',
      rInfo: 'At about 42° (red) and 40° (blue) particularly many rays return. That is why the bow is always seen at the same angle around the point opposite the Sun – red outside, blue inside.',
      rDrop: 'raindrop (greatly enlarged)',
      rSun: 'sunlight',
      rEye: 'observer',
      rShadow: 'point opposite the Sun',
      hPath: 'path through the air: {m} times as long as with the Sun overhead',
      hBlue: '{b} % of the Sun’s blue light reaches the ground',
      hInfo:
        'Air scatters short-wavelength (blue) light much more strongly than long-wavelength (red) light. The scattered blue comes from all over the sky. When the Sun is low, the blue has already been scattered out on the way – the Sun turns yellow, orange and red.',
      hThrough: 'gets through',
      canvas: 'Colours: prism with a colour fan and a screen, three coloured light circles, three colour filters or magnified screen pixels',
      black: 'black',
      white: 'white',
      grey: 'grey',
      red: 'red',
      orange: 'orange',
      yellow: 'yellow',
      green: 'green',
      cyan: 'cyan',
      blue: 'blue',
      magenta: 'magenta',
      mixAdd: '{name} – light: R {r} %, G {g} %, B {b} %',
      mixSub: '{name} – remaining R {r} %, G {g} %, B {b} %',
      passNone: 'All colours reach the screen: white light.',
      passSome: 'Only {list} gets through; the rest is absorbed. The screen shows {name}.',
      white_light: 'white light',
      screen: 'screen',
      ir: 'IR (invisible)',
      uv: 'UV (invisible)',
      far: 'from afar',
      near: 'close up',
      filterLabel: 'filter',
      partR: 'red',
      partG: 'green',
      partB: 'blue',
      and: 'and',
      canvasQuiz: 'Practice task on colours with feedback',
      kInfo: 'Under {light} the apple looks {apple}, the leaf {leaf} and the banana {banana}.',
      kWhy: 'An object only reflects the colours that are in the light and that it does not absorb. If a colour is missing from the light, the object cannot show it.',
      kLight_white: 'white light',
      kLight_red: 'red light',
      kLight_green: 'green light',
      kLight_blue: 'blue light',
      kLight_yellow: 'yellow light',
      kLight_sodium: 'sodium light',
      obj_apple: 'apple',
      obj_leaf: 'leaf',
      obj_banana: 'banana',
      obj_sky: 'exercise book',
      obj_paper: 'paper',
      obj_coal: 'coal',
      lamp: 'lamp',
      kUnder: 'Under {light}',
      eyeVal: 'cone stimulus: L {l} %, M {m} %, S {s} % – seen: {name}',
      eyeMix: 'Red + green from a screen stimulates almost the same: L {l} %, M {m} %, S {s} % – the eye sees no difference.',
      eyeInfo: 'We have three kinds of cone (L for long, M for medium, S for short wavelengths). The brain compares their stimuli – that is where colour comes from.',
      cones: 'sensitivity',
      lamAx: 'λ in nm',
      stim: 'stimulus',
      screenMix: 'screen',
      spectral: 'spectral colour',
      qTitle: 'Task {n}',
      qHow: 'Enter the number of the correct answer and press “Check”.',
      qHowNum: 'Enter the number and press “Check”.',
      qOk: 'Correct!',
      qNo: 'Not yet – try again.',
      qSol: 'Solution',
      qScore: '{k} of {n} correct · streak {s}',
      qYour: 'Your answer: {a}',
      qBad: 'Please enter a number.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const tr = (key: string, vars: Record<string, string | number>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const pct = (v: number) => Math.round(v * 100);
    const fmt = ctx.fmt;
    const plot = new Plot(surface, {
      x: [380, 720],
      y: [0, 1.1],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      region: (w, h) => (w >= 700 ? { x: w * 0.5 + 6, y: 6, w: w * 0.5 - 12, h: h - 12 } : { x: 6, y: h * 0.5 + 6, w: w - 12, h: h * 0.5 - 12 }),
    });
    plot.setRangePadded([380, 720], [0, 1.1], { left: 46, right: 14, top: 22, bottom: 24 });

    /* Übung */
    let task: ColorTask = makeTask(1);
    let verdict: boolean | null = null;
    let tries = 0;
    let badInput = false;
    let score = { right: 0, all: 0, streak: 0 };
    const OBJS: ObjectId[] = ['apple', 'leaf', 'banana', 'sky', 'paper', 'coal'];

    function filterRgb(f: FilterId): Rgb {
      const pass = (l: number) => (filterPasses(f, l) ? 1 : 0);
      return [pass(650), pass(540), pass(450)];
    }

    /* Regenbogen und Himmel */
    let phase = 0;
    let elAnim: number | null = null;
    const elev = () => (elAnim === null ? p.el : elAnim);

    function updateReadouts(): void {
      ctx.readout('mix', null);
      ctx.readout('pass', null);
      ctx.readout('info', null);
      if (p.mode === 'regen') {
        ctx.readout('mix', tr('rAngle', { r: fmt.num(rainbowAngle(680), 1), b: fmt.num(rainbowAngle(440), 1) }));
        const b = p.rb / 100;
        ctx.readout('pass', tr('rNow', { r: fmt.num(dropAngleDeg(b, 680), 1), b: fmt.num(dropAngleDeg(b, 440), 1) }));
        ctx.readout('info', ctx.t('rInfo'));
        return;
      }
      if (p.mode === 'himmel') {
        ctx.readout('mix', tr('hPath', { m: fmt.num(airMass(elev()), 1) }));
        ctx.readout('pass', tr('hBlue', { b: fmt.num(transmission(450, airMass(elev())) * 100, 0) }));
        ctx.readout('info', ctx.t('hInfo'));
        return;
      }
      if (p.mode === 'koerper') {
        const L0 = LIGHTS[p.light as LightId];
        const nm = (o: ObjectId) => ctx.t(colorName(objectColor(L0, REFLECT[o]))).toLowerCase();
        ctx.readout('mix', tr('kInfo', { light: ctx.t(`kLight_${p.light}`), apple: nm('apple'), leaf: nm('leaf'), banana: nm('banana') }));
        ctx.readout('info', ctx.t('kWhy'));
        return;
      }
      if (p.mode === 'auge') {
        const c = coneResponse(p.lam);
        const sn = spectralName(p.lam);
        ctx.readout('mix', tr('eyeVal', { l: pct(c[0]), m: pct(c[1]), s: pct(c[2]), name: ctx.t(sn) }));
        if (p.mixe) {
          const mx = matchMix();
          const cm = coneFromMix(mx[0], mx[1], mx[2]);
          ctx.readout('pass', tr('eyeMix', { l: pct(cm[0]), m: pct(cm[1]), s: pct(cm[2]) }));
        }
        ctx.readout('info', ctx.t('eyeInfo'));
        return;
      }
      if (p.mode === 'ueben') {
        ctx.readout('info', tr('qScore', { k: score.right, n: score.all, s: score.streak }));
        return;
      }
      if (p.mode === 'add' || p.mode === 'pixel') {
        const c = additiveMix(p.r / 100, p.g / 100, p.b / 100);
        ctx.readout('mix', tr('mixAdd', { name: ctx.t(colorName(c)), r: pct(c[0]), g: pct(c[1]), b: pct(c[2]) }));
      } else if (p.mode === 'sub') {
        const c = subtractiveMix(p.c / 100, p.m / 100, p.y / 100);
        ctx.readout('mix', tr('mixSub', { name: ctx.t(colorName(c)), r: pct(c[0]), g: pct(c[1]), b: pct(c[2]) }));
      } else {
        const f = p.filter as FilterId;
        if (f === 'none') ctx.readout('pass', ctx.t('passNone'));
        else {
          const c = filterRgb(f);
          const parts = [c[0] ? ctx.t('partR') : '', c[1] ? ctx.t('partG') : '', c[2] ? ctx.t('partB') : ''].filter(Boolean);
          ctx.readout('pass', tr('passSome', { list: parts.join(` ${ctx.t('and')} `), name: ctx.t(colorName(c)) }));
        }
      }
    }

    /* ---------- Prisma ---------- */
    function drawPrism(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      // Dunkler Raum, damit die Farben leuchten
      roundRect(g, 8, 8, W - 16, H - 16, 14);
      g.fillStyle = '#0b0f19';
      g.fill();
      const size = Math.min(H * 0.5, W * 0.3);
      const pcx = W * (narrow ? 0.42 : 0.32);
      const pcy = H * 0.52;
      const apex: [number, number] = [pcx, pcy - size * 0.58];
      const left: [number, number] = [pcx - size / 2, pcy + size * 0.29];
      const right: [number, number] = [pcx + size / 2, pcy + size * 0.29];
      // Eintrittspunkt auf der linken Fläche (40 % von der Spitze)
      const t = 0.45;
      const P: [number, number] = [apex[0] + (left[0] - apex[0]) * t, apex[1] + (left[1] - apex[1]) * t];
      const thIn = 18 * DEG; // Strahl steigt leicht an
      const src: [number, number] = [20, P[1] + Math.tan(thIn) * (P[0] - 20)];
      // Austrittspunkt auf der rechten Fläche (symmetrisch)
      const Q: [number, number] = [apex[0] + (right[0] - apex[0]) * t, apex[1] + (right[1] - apex[1]) * t];
      // Einfallender weißer Strahl
      g.strokeStyle = '#ffffff';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(src[0], src[1]);
      g.lineTo(P[0], P[1]);
      g.stroke();
      text(g, ctx.t('white_light'), src[0] + 6, src[1] + 18, { font: `600 ${narrow ? 10 : 12}px ${th.font}`, color: '#e5e7eb', align: 'left' });
      // Im Glas: helles Band
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(P[0], P[1]);
      g.lineTo(Q[0], Q[1]);
      g.stroke();
      // Prisma
      g.beginPath();
      g.moveTo(apex[0], apex[1]);
      g.lineTo(left[0], left[1]);
      g.lineTo(right[0], right[1]);
      g.closePath();
      g.fillStyle = 'rgba(160,200,255,0.18)';
      g.fill();
      g.strokeStyle = 'rgba(200,220,255,0.85)';
      g.lineWidth = 2;
      g.stroke();
      // Schirm
      const sx = W - (narrow ? 34 : 60);
      const filterX = sx - (narrow ? 50 : 90);
      const f = p.filter as FilterId;
      const mean = prismDeviation(refractiveIndex(550), 60 * DEG, 50 * DEG);
      const spread = 5; // Aufweitung zur Verdeutlichung
      const dirOf = (l: number) => {
        const d = prismDeviation(refractiveIndex(l), 60 * DEG, 50 * DEG);
        return thIn - (mean + (d - mean) * spread);
      };
      const hitY = (ang: number, x: number) => Q[1] - Math.tan(ang) * (x - Q[0]);
      for (let l = 400; l <= 700; l += 4) {
        const [cr, cg, cb] = wavelengthToRgb(l);
        const ang = dirOf(l);
        const pass = filterPasses(f, l);
        const endX = f === 'none' || pass ? sx : filterX;
        g.strokeStyle = `rgb(${cr},${cg},${cb})`;
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(Q[0], Q[1]);
        g.lineTo(endX, hitY(ang, endX));
        g.stroke();
        if (endX === sx) {
          g.fillStyle = `rgb(${cr},${cg},${cb})`;
          g.fillRect(sx, hitY(ang, sx) - 3, 12, 6);
        }
      }
      // Unsichtbare Bereiche: IR oberhalb von Rot, UV unterhalb von Violett
      const yIR = hitY(dirOf(700), sx) - 26;
      const yUV = hitY(dirOf(400), sx) + 26;
      g.setLineDash([5, 5]);
      g.strokeStyle = 'rgba(255,255,255,0.4)';
      g.lineWidth = 1.5;
      for (const y of [yIR, yUV]) {
        g.beginPath();
        g.moveTo(Q[0], Q[1]);
        g.lineTo(f === 'none' ? sx : filterX, Q[1] + ((y - Q[1]) * ((f === 'none' ? sx : filterX) - Q[0])) / (sx - Q[0]));
        g.stroke();
      }
      g.setLineDash([]);
      const fs = narrow ? 10 : 12;
      const lx = (f === 'none' ? sx : filterX) - 10;
      const yAt = (yEnd: number, x: number) => Q[1] + ((yEnd - Q[1]) * (x - Q[0])) / (sx - Q[0]);
      text(g, narrow ? 'IR' : ctx.t('ir'), lx, yAt(yIR, lx) - 16, { font: `600 ${fs}px ${th.font}`, color: '#fca5a5', align: 'right' });
      text(g, narrow ? 'UV' : ctx.t('uv'), lx, yAt(yUV, lx) + 18, { font: `600 ${fs}px ${th.font}`, color: '#c4b5fd', align: 'right' });
      // Schirm zeichnen
      g.fillStyle = 'rgba(255,255,255,0.15)';
      g.fillRect(sx + 12, 30, 8, H - 60);
      text(g, ctx.t('screen'), sx + 16, 20, { font: `600 ${fs}px ${th.font}`, color: '#e5e7eb', align: 'right' });
      // Filter
      if (f !== 'none') {
        g.fillStyle = rgbCss(filterRgb(f), 0.45);
        g.fillRect(filterX - 5, 40, 10, H - 80);
        g.strokeStyle = rgbCss(filterRgb(f), 0.9);
        g.lineWidth = 1.5;
        g.strokeRect(filterX - 5, 40, 10, H - 80);
        text(g, ctx.t('filterLabel'), filterX, 28, { font: `600 ${fs}px ${th.font}`, color: '#e5e7eb' });
      }
    }

    /* ---------- Mischung ---------- */
    function drawCircles(sub: boolean): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const boxW = narrow ? W - 16 : W * 0.66;
      roundRect(g, 8, 8, boxW, H - 16, 14);
      g.fillStyle = sub ? '#ffffff' : '#000000';
      g.fill();
      const cx = 8 + boxW / 2;
      const cy = H / 2 + (narrow ? -H * 0.08 : 0);
      const rad = Math.min(boxW, H) * 0.24;
      const d = rad * 0.62;
      const pos: [number, number][] = [
        [cx - d * Math.cos(30 * DEG), cy + d * 0.5],
        [cx + d * Math.cos(30 * DEG), cy + d * 0.5],
        [cx, cy - d],
      ];
      const lights: [Rgb, number][] = sub
        ? [
            [[0, 1, 1], p.c / 100],
            [[1, 0, 1], p.m / 100],
            [[1, 1, 0], p.y / 100],
          ]
        : [
            [[1, 0, 0], p.r / 100],
            [[0, 1, 0], p.g / 100],
            [[0, 0, 1], p.b / 100],
          ];
      // Reihenfolge: oben Rot/Cyan wirkt natürlicher
      const order = [2, 0, 1];
      g.save();
      g.beginPath();
      roundRect(g, 8, 8, boxW, H - 16, 14);
      g.clip();
      g.globalCompositeOperation = sub ? 'multiply' : 'lighter';
      order.forEach((k, i) => {
        const [col, s] = lights[k]!;
        const c: Rgb = sub ? [1 - (1 - col[0]) * s, 1 - (1 - col[1]) * s, 1 - (1 - col[2]) * s] : [col[0] * s, col[1] * s, col[2] * s];
        g.fillStyle = rgbCss(c);
        g.beginPath();
        g.arc(pos[i]![0], pos[i]![1], rad, 0, Math.PI * 2);
        g.fill();
      });
      g.restore();
      // Umrisse, damit auch ein abgeschalteter Kreis zu sehen ist
      g.strokeStyle = sub ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.3)';
      g.lineWidth = 1.5;
      g.setLineDash([6, 5]);
      for (const [x, y] of pos) {
        g.beginPath();
        g.arc(x, y, rad, 0, Math.PI * 2);
        g.stroke();
      }
      g.setLineDash([]);
      // Beschriftung der Kreise
      const names = sub ? ['cyan', 'magenta', 'yellow'] : ['red', 'green', 'blue'];
      order.forEach((k, i) => {
        const [x, y] = pos[i]!;
        const dx = x - cx;
        const dy = y - cy;
        const len = Math.hypot(dx, dy) || 1;
        const lx = x + (dx / len) * rad * 0.55;
        const ly = y + (dy / len) * rad * 0.55;
        text(g, ctx.t(names[k]!).replace(/ \(.*\)/, ''), lx, ly, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: sub ? '#111827' : '#f9fafb' });
      });
      // Ergebnisfeld
      const mix = sub ? subtractiveMix(p.c / 100, p.m / 100, p.y / 100) : additiveMix(p.r / 100, p.g / 100, p.b / 100);
      const sw = narrow ? { x: 16, y: H - 16 - 64, w: W - 32, h: 52 } : { x: boxW + 24, y: H / 2 - 70, w: W - boxW - 40, h: 140 };
      roundRect(g, sw.x, sw.y, sw.w, sw.h, 12);
      // Im Aufgabenmodus bleibt das Ergebnisfeld grau
      g.fillStyle = ctx.hidden ? th.grid : rgbCss(mix);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.stroke();
      const lum = 0.3 * mix[0] + 0.59 * mix[1] + 0.11 * mix[2];
      const name = ctx.hidden ? '?' : ctx.t(colorName(mix));
      text(g, name, sw.x + sw.w / 2, sw.y + sw.h / 2, { font: `700 ${narrow ? 15 : 18}px ${th.font}`, color: lum > 0.55 ? '#111827' : '#f9fafb' });
    }

    /* ---------- Bildschirm ---------- */
    function drawPixels(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const mix = additiveMix(p.r / 100, p.g / 100, p.b / 100);
      const far = narrow ? { x: 16, y: 34, w: W - 32, h: H * 0.3 } : { x: 20, y: 40, w: W * 0.3, h: H - 80 };
      const near = narrow ? { x: 16, y: far.y + far.h + 40, w: W - 32, h: H - far.h - 90 } : { x: far.x + far.w + 40, y: 40, w: W - far.w - 80, h: H - 80 };
      roundRect(g, far.x, far.y, far.w, far.h, 10);
      g.fillStyle = rgbCss(mix);
      g.fill();
      g.strokeStyle = th.muted;
      g.lineWidth = 1.5;
      g.stroke();
      text(g, ctx.t('far'), far.x + far.w / 2, far.y - 14, { font: `600 13px ${th.font}`, color: th.text });
      text(g, ctx.t('near'), near.x + near.w / 2, near.y - 14, { font: `600 13px ${th.font}`, color: th.text });
      roundRect(g, near.x, near.y, near.w, near.h, 10);
      g.fillStyle = '#000000';
      g.fill();
      const cols = narrow ? 4 : 5;
      const rows = Math.max(2, Math.round((cols * near.h) / near.w));
      const cw = near.w / cols;
      const ch = near.h / rows;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = near.x + i * cw;
          const y = near.y + j * ch;
          const sw = cw / 3;
          const parts: Rgb[] = [
            [mix[0], 0, 0],
            [0, mix[1], 0],
            [0, 0, mix[2]],
          ];
          parts.forEach((c, k) => {
            roundRect(g, x + k * sw + sw * 0.15, y + ch * 0.08, sw * 0.7, ch * 0.84, Math.min(6, sw * 0.2));
            g.fillStyle = rgbCss([Math.max(c[0], k === 0 ? 0.08 : 0), Math.max(c[1], k === 1 ? 0.08 : 0), Math.max(c[2], k === 2 ? 0.08 : 0)]);
            g.fill();
          });
        }
      }
    }

    /** Bildschirm-Mischung (R, G, B), die die Zapfen fast genauso reizt wie die Spektralfarbe λ. */
    function matchMix(): Rgb {
      // kleinste Quadrate über die drei Zapfenreize, Anteile auf 0…1 begrenzt (einfache Suche)
      const target = coneResponse(p.lam);
      let best: Rgb = [0, 0, 0];
      let err = Infinity;
      for (let r = 0; r <= 20; r++)
        for (let g = 0; g <= 20; g++)
          for (let b = 0; b <= 20; b++) {
            const c = coneFromMix(r / 20, g / 20, b / 20);
            const e = (c[0] - target[0]) ** 2 + (c[1] - target[1]) ** 2 + (c[2] - target[2]) ** 2;
            if (e < err) {
              err = e;
              best = [r / 20, g / 20, b / 20];
            }
          }
      return best;
    }

    /* ---------- Körperfarben ---------- */
    function drawObjects(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const L0 = LIGHTS[p.light as LightId];
      // dunkler Raum, Lichtkegel von oben
      g.fillStyle = withAlpha(th.text, th.dark ? 0.0 : 0.85);
      g.fillRect(0, 0, W, H);
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, rgbCss(L0, 0.35));
      grad.addColorStop(1, rgbCss(L0, 0.05));
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(W * 0.45, 0);
      g.lineTo(W * 0.55, 0);
      g.lineTo(W * 0.95, H * 0.82);
      g.lineTo(W * 0.05, H * 0.82);
      g.closePath();
      g.fill();
      // Lampe
      roundRect(g, W * 0.45, 0, W * 0.1, 18, 6);
      g.fillStyle = rgbCss(L0);
      g.fill();
      // Gegenstände
      const n = OBJS.length;
      const cols = narrow ? 3 : 6;
      const rows = Math.ceil(n / cols);
      const cw = W / cols;
      const top = H * (narrow ? 0.22 : 0.4);
      const rh = (H * 0.75 - top) / rows;
      OBJS.forEach((o, i) => {
        const cx = cw * ((i % cols) + 0.5);
        const cy = top + rh * Math.floor(i / cols) + rh * 0.4;
        const R = Math.min(cw * 0.3, rh * 0.32);
        const c = objectColor(L0, REFLECT[o]);
        g.fillStyle = rgbCss(c);
        g.strokeStyle = withAlpha(th.bg, 0.35);
        g.lineWidth = 1.5;
        g.beginPath();
        if (o === 'apple') g.arc(cx, cy, R, 0, Math.PI * 2);
        else if (o === 'leaf') g.ellipse(cx, cy, R, R * 0.5, -0.5, 0, Math.PI * 2);
        else if (o === 'banana') g.ellipse(cx, cy, R, R * 0.35, 0.4, 0, Math.PI * 2);
        else g.rect(cx - R * 0.8, cy - R, R * 1.6, R * 2);
        g.fill();
        g.stroke();
        text(g, ctx.t(`obj_${o}`), cx, cy + R + 14, { font: `600 ${narrow ? 11 : 12}px ${th.font}`, color: th.dark ? th.text : th.bg });
        text(g, ctx.t(colorName(c)), cx, cy + R + 30, { font: `700 ${narrow ? 11 : 12}px ${th.font}`, color: th.dark ? th.muted : withAlpha(th.bg, 0.8) });
      });
      text(g, tr('kUnder', { light: ctx.t(`kLight_${p.light}`) }), W / 2, H - 16, { font: `700 13px ${th.font}`, color: th.dark ? th.text : th.bg });
    }

    /* ---------- Farbensehen ---------- */
    function drawEye(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 700;
      const r: Rect = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: H * 0.5 };
      const c = coneResponse(p.lam);
      const mx = matchMix();
      const cm = coneFromMix(mx[0], mx[1], mx[2]);
      // Farbfelder: Spektralfarbe und Bildschirm-Mischung
      const sw = Math.min(r.w * 0.38, 150);
      const sh = Math.min(r.h * 0.3, 90);
      const spec = wavelengthToRgb(p.lam);
      roundRect(g, r.x + r.w * 0.25 - sw / 2, r.y + 20, sw, sh, 10);
      g.fillStyle = `rgb(${spec[0]},${spec[1]},${spec[2]})`;
      g.fill();
      text(g, `${ctx.t('spectral')} ${p.lam} nm`, r.x + r.w * 0.25, r.y + 20 + sh + 14, { font: `600 11px ${th.font}`, color: th.text });
      if (p.mixe) {
        // Gleicher Zapfenreiz → gleiche gesehene Farbe: Feld in der Spektralfarbe
        roundRect(g, r.x + r.w * 0.75 - sw / 2, r.y + 20, sw, sh, 10);
        g.fillStyle = `rgb(${spec[0]},${spec[1]},${spec[2]})`;
        g.fill();
        const mixLabel = r.w < 420 ? `R ${pct(mx[0])} · G ${pct(mx[1])} · B ${pct(mx[2])} %` : `${ctx.t('screenMix')}: R ${pct(mx[0])} %, G ${pct(mx[1])} %, B ${pct(mx[2])} %`;
        text(g, mixLabel, r.x + r.w * 0.75, r.y + 20 + sh + 14, { font: `600 11px ${th.font}`, color: th.text });
      }
      // Säulen: Zapfenreize
      const by = r.y + r.h - 26;
      const bh = r.h - sh - 80;
      const names = ['L', 'M', 'S'];
      const cols = [th.series[1]!, th.series[2]!, th.series[0]!];
      const bw = Math.min(28, r.w / 12);
      names.forEach((nm, i) => {
        const x = r.x + r.w * (0.15 + i * 0.12);
        g.fillStyle = cols[i]!;
        g.fillRect(x, by - c[i]! * bh, bw, c[i]! * bh);
        text(g, nm, x + bw / 2, by + 12, { font: `700 12px ${th.font}`, color: th.text });
        if (p.mixe) {
          const x2 = r.x + r.w * (0.6 + i * 0.12);
          g.fillStyle = withAlpha(cols[i]!, 0.7);
          g.fillRect(x2, by - cm[i]! * bh, bw, cm[i]! * bh);
          text(g, nm, x2 + bw / 2, by + 12, { font: `700 12px ${th.font}`, color: th.text });
        }
      });
      text(g, ctx.t('stim'), r.x + 8, by - bh - 6, { font: `500 11px ${th.font}`, color: th.muted, align: 'left' });
      // Diagramm: Empfindlichkeitskurven
      plot.resize();
      plot.setAxes({ x: { label: ctx.t('lamAx') }, y: { label: ctx.t('cones') } });
      plot.begin();
      plot.grid({ minor: false });
      plot.axes();
      for (let l = 380; l < 720; l += 4) {
        const col = wavelengthToRgb(l + 2);
        plot.polygon(
          [
            [l, 0],
            [l + 4, 0],
            [l + 4, 0.05],
            [l, 0.05],
          ],
          { fill: `rgb(${col[0]},${col[1]},${col[2]})` },
        );
      }
      [0, 1, 2].forEach((i) => plot.fn((l) => coneResponse(l)[i]!, { color: cols[i]!, width: 2.5, from: 380, to: 720 }));
      plot.vline(p.lam, { color: th.text, width: 1.5, dash: [5, 4] });
      if (p.mixe) PRIMARY_NM.forEach((nm) => plot.vline(nm, { color: withAlpha(th.muted, 0.5), width: 1, dash: [2, 4] }));
      plot.end();
    }

    /* ---------- Übung ---------- */
    function wrap(g: CanvasRenderingContext2D, str: string, maxW: number): string[] {
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) lines.push(cur);
      return lines;
    }

    function drawQuiz(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 600;
      const pad = narrow ? 18 : 36;
      const maxW = W - 2 * pad;
      let y = pad;
      g.textAlign = 'left';
      g.textBaseline = 'top';
      g.font = `700 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.series[0]!;
      g.fillText(tr('qTitle', { n: p.qn }), pad, y);
      y += narrow ? 26 : 32;
      const fs = narrow ? 16 : 21;
      g.font = `600 ${fs}px ${th.font}`;
      g.fillStyle = th.text;
      for (const line of wrap(g, task.text[ctx.lang], maxW)) {
        g.fillText(line, pad, y);
        y += fs * 1.35;
      }
      y += 8;
      if (task.choices) {
        g.font = `600 ${narrow ? 14 : 16}px ${th.font}`;
        task.choices.forEach((c, i) => {
          const sel = p.qa.trim() === String(i + 1);
          g.fillStyle = sel ? th.series[0]! : th.text;
          g.fillText(`${i + 1}  ${c[ctx.lang]}`, pad + 12, y);
          y += narrow ? 22 : 26;
        });
        y += 6;
      }
      g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
      g.fillStyle = th.muted;
      const ans = p.qa.trim();
      g.fillText(ans ? tr('qYour', { a: ans }) : ctx.t(task.choices ? 'qHow' : 'qHowNum'), pad, y);
      y += 28;
      if (badInput) {
        g.fillStyle = th.series[3]!;
        g.fillText(ctx.t('qBad'), pad, y);
        y += 26;
      }
      if (verdict !== null) {
        g.font = `800 ${narrow ? 20 : 26}px ${th.font}`;
        g.fillStyle = verdict ? th.series[2]! : th.series[3]!;
        for (const line of wrap(g, ctx.t(verdict ? 'qOk' : 'qNo'), maxW)) {
          g.fillText(line, pad, y);
          y += narrow ? 26 : 34;
        }
        y += 4;
        if (verdict || tries >= 2) {
          g.font = `500 ${narrow ? 13 : 15}px ${th.font}`;
          g.fillStyle = th.text;
          for (const line of wrap(g, `${ctx.t('qSol')}: ${task.solution[ctx.lang]}`, maxW)) {
            g.fillText(line, pad, y);
            y += (narrow ? 13 : 15) * 1.4;
          }
        }
      }
      const n = Math.min(10, score.all);
      for (let i = 0; i < 10; i++) {
        g.beginPath();
        g.arc(W / 2 - 90 + i * 20, H - 22, 6, 0, Math.PI * 2);
        g.fillStyle = i < n ? (i < score.right ? th.series[2]! : th.series[3]!) : withAlpha(th.muted, 0.25);
        g.fill();
      }
    }

    function runCheck(): void {
      const r = checkTask(task, p.qa);
      if (r === null) {
        badInput = true;
        return;
      }
      badInput = false;
      verdict = r;
      tries += 1;
      if (tries === 1) score = { right: score.right + (r ? 1 : 0), all: score.all + 1, streak: r ? score.streak + 1 : 0 };
    }

    /* ---------- Regenbogen ---------- */
    function dropAngleDeg(b: number, lam: number): number {
      const n = waterIndex(lam);
      return ((4 * Math.asin(b / n) - 2 * Math.asin(b)) * 180) / Math.PI;
    }

    /** Strahlweg im Tropfen (Einheitskreis): Eintritt, Reflexion hinten, Austritt, Richtung danach. */
    function rayPath(b: number, lam: number): { pts: [number, number][]; out: [number, number] } {
      // Farbaufspaltung zur Verdeutlichung achtfach vergrößert
      const n = waterIndex(550) + (waterIndex(lam) - waterIndex(550)) * 8;
      const a = Math.asin(b);
      const be = Math.asin(b / n);
      // Licht kommt von links (+x), trifft oben bei Winkel (π − a)
      const P1: [number, number] = [-Math.cos(a), b];
      // im Tropfen: jede Sehne überstreicht den Mittelpunktswinkel π − 2β
      const step = Math.PI - 2 * be;
      const ang1 = Math.PI - a;
      const ang2 = ang1 - step;
      const ang3 = ang2 - step;
      const P2: [number, number] = [Math.cos(ang2), Math.sin(ang2)];
      const P3: [number, number] = [Math.cos(ang3), Math.sin(ang3)];
      // Austrittsrichtung: zurück nach links, um θ = 4β − 2α nach unten geneigt
      const theta = 4 * be - 2 * a;
      return { pts: [P1, P2, P3], out: [-Math.cos(theta), -Math.sin(theta)] };
    }

    function drawRain(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 700;
      const dropR: Rect = wide ? { x: 0, y: 0, w: W * 0.5, h: H } : { x: 0, y: 0, w: W, h: H * 0.55 };
      const R = Math.min(dropR.w, dropR.h) * 0.32;
      const cx = dropR.x + dropR.w * 0.55;
      const cy = dropR.y + dropR.h * 0.5;
      // Tropfen
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fillStyle = withAlpha(th.series[0]!, 0.12);
      g.fill();
      g.strokeStyle = withAlpha(th.series[0]!, 0.6);
      g.lineWidth = 2;
      g.stroke();
      text(g, ctx.t('rDrop'), cx + R * 0.9, cy - R - 12, { font: `600 12px ${th.font}`, color: th.muted });
      const b = p.rb / 100;
      const lams = [680, 540, 440];
      const P = (q: [number, number]): [number, number] => [cx + q[0] * R, cy - q[1] * R];
      // einfallender weißer Strahl
      const [ex, ey] = P([-Math.sqrt(1 - b * b), b]);
      g.strokeStyle = th.text;
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(dropR.x + 10, ey);
      g.lineTo(ex, ey);
      g.stroke();
      text(g, ctx.t('rSun'), dropR.x + 12, ey - 12, { font: `600 12px ${th.font}`, color: th.text, align: 'left' });
      lams.forEach((lam) => {
        const { pts, out } = rayPath(b, lam);
        const [r0, g0, b0] = wavelengthToRgb(lam);
        const col = `rgb(${r0},${g0},${b0})`;
        g.strokeStyle = col;
        g.lineWidth = 2;
        g.beginPath();
        const p0 = P(pts[0]!);
        g.moveTo(p0[0], p0[1]);
        for (const q of pts.slice(1)) {
          const pp = P(q);
          g.lineTo(pp[0], pp[1]);
        }
        const last = P(pts[2]!);
        const len = R * 1.6;
        g.lineTo(last[0] + out[0] * len, last[1] - out[1] * len);
        g.stroke();
        // Lichtpuls entlang des Weges
        const u = (phase * 0.4) % 1;
        const seg = [p0, P(pts[1]!), last, [last[0] + out[0] * len, last[1] - out[1] * len] as [number, number]];
        const k = Math.min(2, Math.floor(u * 3));
        const f = u * 3 - k;
        const a0 = seg[k]!;
        const a1 = seg[k + 1]!;
        g.beginPath();
        g.arc(a0[0] + (a1[0] - a0[0]) * f, a0[1] + (a1[1] - a0[1]) * f, 3.5, 0, Math.PI * 2);
        g.fillStyle = col;
        g.fill();
      });
      text(g, `${fmt.num(dropAngleDeg(b, 680), 1)}° / ${fmt.num(dropAngleDeg(b, 440), 1)}°`, dropR.x + 12, dropR.y + dropR.h - 14, { font: `700 13px ${th.font}`, color: th.text, align: 'left' });

      // Landschaft mit Beobachter und Bogen
      const sc: Rect = wide ? { x: W * 0.5, y: 0, w: W * 0.5, h: H } : { x: 0, y: H * 0.55, w: W, h: H * 0.45 };
      const ground = sc.y + sc.h * 0.78;
      g.fillStyle = withAlpha(th.series[2]!, 0.25);
      g.fillRect(sc.x, ground, sc.w, sc.y + sc.h - ground);
      const ox = sc.x + sc.w * 0.2;
      const oy = ground;
      // Beobachter
      g.strokeStyle = th.text;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(ox, oy - 26, 5, 0, Math.PI * 2);
      g.moveTo(ox, oy - 21);
      g.lineTo(ox, oy - 8);
      g.lineTo(ox - 5, oy);
      g.moveTo(ox, oy - 8);
      g.lineTo(ox + 5, oy);
      g.stroke();
      text(g, ctx.t('rEye'), ox, oy + 14, { font: `600 11px ${th.font}`, color: th.muted });
      // Bogen um den Gegenpunkt der Sonne (Sonne tief hinter dem Beobachter → Gegenpunkt knapp unter dem Horizont)
      const ax = sc.x + sc.w * 0.62;
      const ay = ground + sc.h * 0.06;
      const Rb = Math.min(sc.w * 0.34, sc.h * 0.62);
      g.save();
      g.beginPath();
      g.rect(sc.x, sc.y, sc.w, ground - sc.y);
      g.clip();
      for (let l = 440; l <= 680; l += 6) {
        const ang = rainbowAngle(l);
        const rr = Rb * (ang / 42.5);
        const [r0, g0, b0] = wavelengthToRgb(l);
        g.strokeStyle = `rgba(${r0},${g0},${b0},0.85)`;
        g.lineWidth = Math.max(1.5, Rb * 0.012);
        g.beginPath();
        g.arc(ax, ay, rr, Math.PI, 2 * Math.PI);
        g.stroke();
      }
      g.restore();
      g.setLineDash([4, 4]);
      g.strokeStyle = th.muted;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(ox, oy - 26);
      g.lineTo(ax, ay);
      g.moveTo(ox, oy - 26);
      g.lineTo(ax, ay - Rb);
      g.stroke();
      g.setLineDash([]);
      text(g, '42°', ox + (ax - ox) * 0.35, oy - 26 + (ay - Rb - oy + 26) * 0.18 - 6, { font: `700 12px ${th.font}`, color: th.text });
    }

    /* ---------- Himmel ---------- */
    function drawSky(): void {
      const g = surface.g;
      const th = ctx.theme;
      const W = surface.width;
      const H = surface.height;
      const narrow = W < 700;
      const e = elev();
      const sk = sunAndSky(e);
      const top = 0;
      const horizon = H * (narrow ? 0.5 : 0.58);
      const bright = Math.min(1, 0.25 + e / 25);
      // Himmel: oben Streulicht, am Horizont heller und bei tiefer Sonne rötlich
      const grad = g.createLinearGradient(0, top, 0, horizon);
      const mix = (a: Rgb, b: Rgb, f: number): Rgb => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
      const dim = (c: Rgb, f: number): Rgb => [c[0] * f, c[1] * f, c[2] * f];
      grad.addColorStop(0, rgbCss(dim(sk.sky, bright * 0.75)));
      grad.addColorStop(1, rgbCss(dim(mix(sk.sky, sk.sun, e < 15 ? 0.8 : 0.35), bright)));
      g.fillStyle = grad;
      g.fillRect(0, top, W, horizon - top);
      // Sonne auf einer Bahn
      const sx = W * 0.15 + (W * 0.6 * (70 - e)) / 70;
      const sy = horizon - ((horizon - top - 30) * Math.sin((Math.max(0, e) * Math.PI) / 180)) / Math.sin((70 * Math.PI) / 180);
      g.beginPath();
      g.arc(sx, Math.min(horizon - 4, sy), 18, 0, Math.PI * 2);
      g.fillStyle = rgbCss(sk.sun);
      g.fill();
      // Boden
      const groundCol = rgbCss(dim(sk.sky, 0.18));
      const onGround = rgbCss([0.95, 0.95, 0.95]);
      g.fillStyle = groundCol;
      g.beginPath();
      g.moveTo(0, horizon);
      for (let x = 0; x <= W; x += 20) g.lineTo(x, horizon - 6 - 6 * Math.sin(x * 0.03));
      g.lineTo(W, H);
      g.lineTo(0, H);
      g.closePath();
      g.fill();
      text(g, `${fmt.num(e, 0)}°`, sx, Math.min(horizon - 4, sy) - 28, { font: `700 13px ${th.font}`, color: onGround });
      // Durchlass je Farbe
      const bx = 20;
      const bw = Math.min(W - 40, 460);
      const by = horizon + 30;
      const bh = H - by - 46;
      text(g, ctx.t('hThrough'), bx, by - 10, { font: `600 12px ${th.font}`, color: onGround, align: 'left' });
      const m = airMass(e);
      const n = 16;
      for (let i = 0; i < n; i++) {
        const l = 400 + (300 * (i + 0.5)) / n;
        const t = transmission(l, m);
        const [r0, g0, b0] = wavelengthToRgb(l);
        const x = bx + (i * bw) / n;
        g.fillStyle = `rgba(${r0},${g0},${b0},0.9)`;
        g.fillRect(x + 1, by + bh * (1 - t), bw / n - 2, bh * t);
      }
      text(g, tr('hBlue', { b: fmt.num(transmission(450, m) * 100, 0) }), bx, H - 16, { font: `700 ${narrow ? 12 : 14}px ${th.font}`, color: onGround, align: 'left' });
    }

    return {
      update(changed, source) {
        if (source === 'init' || source === 'replace' || changed.has('qn')) {
          task = makeTask(p.qn);
          verdict = null;
          tries = 0;
          badInput = false;
        }
        if (changed.has('qa')) {
          if (verdict === false) verdict = null;
          badInput = false;
        }
        if (changed.has('el') || changed.has('mode')) elAnim = null;
        surface.canvas.setAttribute('aria-label', ctx.t(p.mode === 'ueben' ? 'canvasQuiz' : p.mode === 'regen' ? 'canvasR' : p.mode === 'himmel' ? 'canvasH' : 'canvas'));
        updateReadouts();
      },
      action(id) {
        if (id === 'sunset') {
          elAnim = prefersReducedMotion() ? 0 : p.el;
          ctx.clock.play();
        } else if (id === 'check') runCheck();
        else if (id === 'next') {
          ctx.set({ qn: p.qn >= 999 ? 1 : p.qn + 1, qa: '' });
          return;
        }
        updateReadouts();
        ctx.requestRender();
      },
      tick(dt) {
        phase += dt;
        if (elAnim !== null) {
          elAnim = Math.max(0, elAnim - dt * 6);
          updateReadouts();
        }
      },
      render() {
        surface.begin();
        if (p.mode === 'regen') return drawRain();
        if (p.mode === 'himmel') return drawSky();
        if (p.mode === 'koerper') return drawObjects();
        if (p.mode === 'auge') return drawEye();
        if (p.mode === 'ueben') return drawQuiz();
        if (p.mode === 'prisma') drawPrism();
        else if (p.mode === 'add') drawCircles(false);
        else if (p.mode === 'sub') drawCircles(true);
        else drawPixels();
      },
      destroy: () => surface.destroy(),
    };
  },
});
