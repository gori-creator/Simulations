import { defineSimulation, ease, Plot, roundRect, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { blurRadius, constructionRays, describeImage, imageDistance, isSharp, power, rayThrough, rayY, screenScale, zoneOf, type RayId, type Zone } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'con' | 'bench';

/** Stelle der Linse auf der optischen Bank (cm). */
const LENS_X = 50;
/** Länge der optischen Bank (cm). */
const BENCH_LEN = 120;
/** Oberkante der Schiene (cm unter der optischen Achse). */
const BENCH_TOP = -19;
/** Halbe Höhe des Schirms (cm). */
const SCREEN_H = 10;
/** Radius der Linse auf der optischen Bank (cm). */
const BENCH_LENS_R = 4;
/** Größter Schirmabstand (cm). */
const S_MAX = 70;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Linsen und Bildentstehung: Bildkonstruktion mit Parallel-, Mittelpunkt-
 * und Brennpunktstrahl an Sammel- und Zerstreuungslinse (mit Lichtbündel,
 * Bereichen f und 2f und Anwendungen) sowie die optische Bank mit Kerze,
 * Linse, Blende und Schirm, auf dem man das Bild scharf stellt.
 */
export default defineSimulation({
  id: 'linsen',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.64 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Setup'),
      options: [
        { value: 'con', label: L('Bildkonstruktion', 'Ray construction') },
        { value: 'bench', label: L('Optische Bank mit Schirm', 'Optical bench with screen') },
      ],
      default: 'con',
    },
    {
      key: 'lt',
      type: 'choice',
      label: L('Linse', 'Lens'),
      options: [
        { value: 'sam', label: L('Sammellinse', 'Converging lens') },
        { value: 'zer', label: L('Zerstreuungslinse', 'Diverging lens') },
      ],
      default: 'sam',
      visibleIf: (v) => v.mode === 'con',
    },
    {
      key: 'f',
      type: 'number',
      label: L('Brennweite f', 'Focal length f'),
      help: L('Bei der Zerstreuungslinse rechnet man mit negativer Brennweite.', 'For a diverging lens the focal length counts as negative.'),
      min: 4,
      max: 20,
      step: 0.5,
      default: 10,
      unit: 'cm',
    },
    { key: 'g', type: 'number', label: L('Gegenstandsweite g', 'Object distance g'), help: L('Oder den Gegenstand ziehen.', 'Or drag the object.'), min: 2, max: 50, step: 0.5, default: 15, unit: 'cm' },
    { key: 'gs', type: 'number', label: L('Gegenstandsgröße G', 'Object size G'), min: 1, max: 12, step: 0.5, default: 5, unit: 'cm' },
    {
      key: 's',
      type: 'number',
      label: L('Schirmabstand s (Linse – Schirm)', 'Screen distance s (lens – screen)'),
      help: L('Oder den Schirm ziehen.', 'Or drag the screen.'),
      min: 2,
      max: S_MAX,
      step: 0.5,
      default: 25,
      unit: 'cm',
      visibleIf: (v) => v.mode === 'bench',
    },
    {
      key: 'd',
      type: 'number',
      label: L('Blende: Öffnung d', 'Aperture: opening d'),
      help: L('Kleinere Öffnung: dunkleres Bild, aber größere Schärfentiefe.', 'Smaller opening: darker image but greater depth of field.'),
      min: 1,
      max: 8,
      step: 0.5,
      default: 6,
      unit: 'cm',
      visibleIf: (v) => v.mode === 'bench',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Bild und Strahlen zeigen', 'Show image and rays'), default: true, visibleIf: (v) => v.mode === 'con' },
    { key: 'rp', type: 'boolean', group: 'view', label: L('Parallelstrahl', 'Parallel ray'), default: true, visibleIf: (v) => v.mode === 'con' && v.show === true },
    { key: 'rm', type: 'boolean', group: 'view', label: L('Mittelpunktstrahl', 'Central ray'), default: true, visibleIf: (v) => v.mode === 'con' && v.show === true },
    { key: 'rf', type: 'boolean', group: 'view', label: L('Brennpunktstrahl', 'Focal ray'), default: true, visibleIf: (v) => v.mode === 'con' && v.show === true },
    { key: 'bun', type: 'boolean', group: 'view', label: L('Lichtbündel von der Pfeilspitze', 'Light bundle from the arrow tip'), default: false, visibleIf: (v) => v.mode === 'con' && v.show === true },
    { key: 'zones', type: 'boolean', group: 'view', label: L('Bereiche (f, 2f) mit Anwendungen', 'Ranges (f, 2f) with applications'), default: true, visibleIf: (v) => v.mode === 'con' },
    { key: 'cones', type: 'boolean', group: 'view', label: L('Lichtbündel zeigen', 'Show light bundles'), default: true, visibleIf: (v) => v.mode === 'bench' },
    { key: 'dia', type: 'boolean', group: 'view', label: L('Diagramm: Unschärfe über s', 'Chart: blur over s'), default: true, visibleIf: (v) => v.mode === 'bench' },
  ],
  actions: [{ id: 'focus', label: L('Scharf stellen', 'Focus'), primary: true, visibleIf: (v) => v.mode === 'bench' }],
  readouts: [
    { key: 'lens', label: L('Linse', 'Lens') },
    { key: 'eq', label: L('Linsengleichung', 'Lens equation'), spoiler: true },
    { key: 'mag', label: L('Abbildungsmaßstab', 'Magnification'), spoiler: true },
    { key: 'props', label: L('Bild', 'Image'), spoiler: true },
    { key: 'use', label: L('Anwendung', 'Application') },
    { key: 'sharp', label: L('Schirmbild', 'Screen image'), spoiler: true },
  ],
  presets: [
    { id: 'proj', label: L('Projektor: f < g < 2f', 'Projector: f < g < 2f'), values: {} },
    { id: 'cam', label: L('Kamera: g > 2f', 'Camera: g > 2f'), values: { g: 35, gs: 8 } },
    { id: 'lupe', label: L('Lupe: g < f', 'Magnifier: g < f'), values: { g: 6, gs: 4 } },
    { id: 'focal', label: L('Sonderfall g = f', 'Special case g = f'), values: { g: 10, bun: true } },
    { id: 'div', label: L('Zerstreuungslinse', 'Diverging lens'), values: { lt: 'zer', g: 20, gs: 8 } },
    { id: 'bench', label: L('Bild scharf stellen', 'Focusing the image'), values: { mode: 'bench' } },
  ],
  strings: {
    de: {
      canvas: 'Bildkonstruktion an einer Linse mit Gegenstand, Brennpunkten, Konstruktionsstrahlen und Bild oder optische Bank mit Kerze, Linse und Schirm samt Schirmbild',
      axis: 'optische Achse',
      virt: 'virtuelles Bild',
      par: 'Parallelstrahl',
      mid: 'Mittelpunktstrahl',
      foc: 'Brennpunktstrahl',
      noImage: 'g = f: kein Bild – hinter der Linse laufen die Strahlen parallel',
      noImageShort: 'g = f: kein Bild',
      outRight: 'Bild bei b = {b} cm',
      outLeft: 'virtuelles Bild bei b = {b} cm',
      objOut: 'Gegenstand bei g = {g} cm',
      imgLabel: 'Bild:',
      kReal: 'reell',
      kVirtual: 'virtuell',
      kNone: 'kein Bild',
      oInv: 'umgekehrt',
      oUp: 'aufrecht',
      sLarger: 'vergrößert',
      sSmaller: 'verkleinert',
      sSame: 'gleich groß',
      hidden: 'Bild ausgeblendet – konstruiere es selbst mit zwei der drei Strahlen!',
      hiddenShort: 'Bild ausgeblendet',
      z_far: 'g > 2f: reell, umgekehrt, verkleinert – so entsteht das Bild in der Kamera und im Auge.',
      z_twice: 'g = 2f: reell, umgekehrt und gleich groß (b = 2f).',
      z_mid: 'f < g < 2f: reell, umgekehrt, vergrößert – so arbeiten Projektor und Beamer.',
      z_focal: 'g = f: Die Strahlen laufen hinter der Linse parallel – es entsteht kein Bild.',
      z_near: 'g < f: virtuell, aufrecht, vergrößert – so wirkt eine Lupe.',
      z_diverging: 'Zerstreuungslinse: Das Bild ist immer virtuell, aufrecht und verkleinert – z. B. Brille bei Kurzsichtigkeit, Türspion.',
      zs_far: 'Kamera, Auge',
      zs_mid: 'Projektor',
      zs_near: 'Lupe',
      zs_div: 'Brille (kurzsichtig)',
      imgHere: 'hier entsteht das Bild',
      lensSam: 'Sammellinse',
      lensZer: 'Zerstreuungslinse',
      lensText: '{kind} mit f = {f} cm · Brechkraft D = 1/f = {D} dpt',
      propsReal: 'reell (auf einem Schirm auffangbar), {o}, {s}',
      propsVirtual: 'virtuell (nur beim Blick durch die Linse zu sehen), {o}, {s}',
      propsNone: 'kein Bild – die Strahlen laufen hinter der Linse parallel',
      eqNone: 'g = f ⇒ 1/b = 1/f − 1/g = 0: kein Bild (b → ∞)',
      magNone: 'kein Bild',
      virtNote: ' (negativ: virtuelles Bild vor der Linse)',
      candle: 'Kerze',
      lens: 'Linse',
      screen: 'Schirm',
      front: 'Schirm von vorn',
      focusTitle: 'Bild scharf stellen',
      sharp: 'scharf',
      blurry: 'unscharf',
      noReal: 'kein Bild auffangbar',
      tSharp: 'Scharf! Der Schirm steht genau dort, wo sich die Lichtbündel treffen: in der Bildweite b.',
      tFront: 'Unscharf: Die Lichtbündel treffen sich erst hinter dem Schirm. Schiebe den Schirm von der Linse weg – oder drücke „Scharf stellen“.',
      tBack: 'Unscharf: Die Lichtbündel haben sich schon vor dem Schirm getroffen. Schiebe den Schirm näher an die Linse – oder drücke „Scharf stellen“.',
      tFar: 'Das scharfe Bild entstünde erst {b} cm hinter der Linse – zu weit für die Bank. Rücke die Kerze weiter von der Linse weg.',
      tInside: 'Kerze innerhalb der Brennweite (g ≤ f): Hinter der Linse laufen die Strahlen auseinander – es entsteht kein reelles Bild. Durch die Linse sieht man ein vergrößertes virtuelles Bild (Lupe).',
      tAperture: 'Kleinere Blende: dunkleres Bild, aber größere Schärfentiefe.',
      tSharpDof: 'Scharf genug: Der Schirm steht nicht genau in der Bildweite, aber die Lichtbündel sind hier noch so schmal, dass die Unschärfe kaum auffällt (Schärfentiefe).',
      blurChart: 'Unschärfekreis Ø (mm) über s (cm)',
      blurText: 'Unschärfekreis: {d} mm',
      sharpText: 'Schirm bei s = {s} cm · scharfes Bild bei b = {b} cm · Unschärfekreis {d} mm',
      sharpNone: 'Schirm bei s = {s} cm · kein reelles Bild (g ≤ f)',
      tooFar: 'kein reelles Bild in Reichweite der Bank',
      dist: 'g = {g} cm',
      distS: 's = {s} cm',
    },
    en: {
      canvas: 'Ray construction at a lens with object, focal points, construction rays and image, or an optical bench with candle, lens and screen including the screen image',
      axis: 'optical axis',
      virt: 'virtual image',
      par: 'parallel ray',
      mid: 'central ray',
      foc: 'focal ray',
      noImage: 'g = f: no image – behind the lens the rays run parallel',
      noImageShort: 'g = f: no image',
      outRight: 'image at b = {b} cm',
      outLeft: 'virtual image at b = {b} cm',
      objOut: 'object at g = {g} cm',
      imgLabel: 'Image:',
      kReal: 'real',
      kVirtual: 'virtual',
      kNone: 'no image',
      oInv: 'inverted',
      oUp: 'upright',
      sLarger: 'magnified',
      sSmaller: 'reduced',
      sSame: 'same size',
      hidden: 'Image hidden – construct it yourself with two of the three rays!',
      hiddenShort: 'Image hidden',
      z_far: 'g > 2f: real, inverted, reduced – this is how the image forms in a camera and in the eye.',
      z_twice: 'g = 2f: real, inverted and the same size (b = 2f).',
      z_mid: 'f < g < 2f: real, inverted, magnified – this is how projectors work.',
      z_focal: 'g = f: behind the lens the rays run parallel – there is no image.',
      z_near: 'g < f: virtual, upright, magnified – this is how a magnifying glass works.',
      z_diverging: 'Diverging lens: the image is always virtual, upright and reduced – e.g. glasses for short sight, door viewer.',
      zs_far: 'camera, eye',
      zs_mid: 'projector',
      zs_near: 'magnifier',
      zs_div: 'glasses (short sight)',
      imgHere: 'the image forms here',
      lensSam: 'Converging lens',
      lensZer: 'Diverging lens',
      lensText: '{kind} with f = {f} cm · power D = 1/f = {D} dpt',
      propsReal: 'real (can be caught on a screen), {o}, {s}',
      propsVirtual: 'virtual (only seen when looking through the lens), {o}, {s}',
      propsNone: 'no image – behind the lens the rays run parallel',
      eqNone: 'g = f ⇒ 1/b = 1/f − 1/g = 0: no image (b → ∞)',
      magNone: 'no image',
      virtNote: ' (negative: virtual image in front of the lens)',
      candle: 'Candle',
      lens: 'Lens',
      screen: 'Screen',
      front: 'Screen from the front',
      focusTitle: 'Focusing the image',
      sharp: 'sharp',
      blurry: 'blurred',
      noReal: 'no image on the screen',
      tSharp: 'Sharp! The screen is exactly where the light bundles meet: at the image distance b.',
      tFront: 'Blurred: the light bundles only meet behind the screen. Move the screen away from the lens – or press “Focus”.',
      tBack: 'Blurred: the light bundles have already met in front of the screen. Move the screen towards the lens – or press “Focus”.',
      tFar: 'The sharp image would only form {b} cm behind the lens – too far for the bench. Move the candle further away from the lens.',
      tInside: 'Candle inside the focal length (g ≤ f): behind the lens the rays spread out – there is no real image. Looking through the lens you see a magnified virtual image (magnifier).',
      tAperture: 'Smaller aperture: darker image but greater depth of field.',
      tSharpDof: 'Sharp enough: the screen is not exactly at the image distance, but the light bundles are still so narrow here that the blur is hardly noticeable (depth of field).',
      blurChart: 'blur circle Ø (mm) over s (cm)',
      blurText: 'Blur circle: {d} mm',
      sharpText: 'Screen at s = {s} cm · sharp image at b = {b} cm · blur circle {d} mm',
      sharpNone: 'Screen at s = {s} cm · no real image (g ≤ f)',
      tooFar: 'no real image within reach of the bench',
      dist: 'g = {g} cm',
      distS: 's = {s} cm',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const mode = () => p.mode as Mode;
    const g = surface.g;

    /* ---------- Zustand ---------- */
    let gNow = p.g;
    let gDir = -1;
    let sNow = p.s;
    let focusFrom = p.s;
    let focusTo = p.s;
    let focusPending = false;
    const focusTw = new Tween(750, ease.inOutCubic);
    let shape = p.lt === 'zer' ? -1 : 1;
    let shapeFrom = shape;
    const shapeTw = new Tween(450, ease.inOutCubic);
    const fade = new Tween(380, ease.outCubic);
    let hint = '';
    let hintUntil = 0;

    /** Brennweite mit Vorzeichen (Zerstreuungslinse negativ; auf der Bank immer Sammellinse). */
    const fS = () => (mode() === 'con' && p.lt === 'zer' ? -p.f : p.f);

    /* ---------- Bereiche ---------- */
    const OFF: Rect = { x: -60, y: -60, w: 1, h: 1 };
    function conRegions(w = surface.width, h = surface.height): { scene: Rect; card: Rect } {
      if (w >= 640) {
        const ch = 104;
        return { scene: { x: 0, y: 0, w, h: h - ch - 10 }, card: { x: 0, y: h - ch, w, h: ch } };
      }
      const sh = Math.round(h - 275);
      return { scene: { x: 0, y: 0, w, h: sh }, card: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }
    function benchRegions(w = surface.width, h = surface.height): { scene: Rect; view: Rect; info: Rect } {
      if (w >= 640) {
        const sh = Math.round(h * 0.5);
        const rh = h - sh - 10;
        const vw = Math.round(Math.min(w * 0.42, rh * 1.12));
        return { scene: { x: 0, y: 0, w, h: sh }, view: { x: 0, y: sh + 10, w: vw, h: rh }, info: { x: vw + 10, y: sh + 10, w: w - vw - 10, h: rh } };
      }
      const sh = Math.round(h * 0.36);
      const rh = h - sh - 10;
      const vw = Math.round(w * 0.5) - 5;
      return { scene: { x: 0, y: 0, w, h: sh }, view: { x: 0, y: sh + 10, w: vw, h: rh }, info: { x: vw + 10, y: sh + 10, w: w - vw - 10, h: rh } };
    }

    const conPlot = new Plot(surface, { x: [-55, 75], y: [-24, 24], pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'con' ? conRegions(w, h).scene : OFF) });
    const blurPlot = new Plot(surface, {
      x: [0, S_MAX],
      y: [0, 40],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      xAxis: { label: 's' },
      yAxis: { label: 'Ø' },
      region: (w, h) => (mode() === 'bench' ? (blurRect(w, h) ?? OFF) : OFF),
    });
    const bench = new Plot(surface, { x: [-4, BENCH_LEN + 4], y: [-27, 18], equalAspect: false, pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'bench' ? benchRegions(w, h).scene : OFF) });

    /** Halbe Höhe der gezeichneten Linse (cm), passt sich der Brennweite an. */
    let lensH = 14;
    /**
     * Ausschnitt der Konstruktion: proportional zur Brennweite (wie man eine
     * Zeichnung im passenden Maßstab anlegt), Platz für Gegenstände bis 12 cm
     * und unten für Bereichsstreifen und Maße.
     */
    function fitCon(): void {
      const r = conPlot.rect;
      const f = Math.abs(fS());
      const [x0, x1] = narrow() ? [-(3.5 * f + 3), 4.2 * f + 2] : [-(4.4 * f + 3), 5.6 * f + 3];
      const reserve = (p.zones ? 34 : 0) + 34;
      const axisPx = Math.max(r.h * 0.3, (r.h - reserve) / 2 + 4);
      const sc = Math.min(r.w / (x1 - x0), axisPx / 15);
      const xc = (x0 + x1) / 2;
      const yMax = axisPx / sc;
      conPlot.setRange([xc - r.w / sc / 2, xc + r.w / sc / 2], [yMax - r.h / sc, yMax]);
      lensH = clamp(1.3 * f + 2, 7, yMax * 0.86);
    }
    /** Bank: waagerecht ganze Bank; senkrecht auf dem Handy etwas überhöht, damit Kerze und Bündel gut sichtbar sind. */
    function fitBench(): void {
      const r = bench.rect;
      const x0 = -4;
      const x1 = BENCH_LEN + 4;
      const sx = r.w / (x1 - x0);
      const sy = Math.min(sx * (narrow() ? 1.8 : 1), r.h / 36);
      const yh = r.h / sy;
      const yMin = BENCH_TOP - 8 - Math.max(0, yh - 36) * 0.3;
      bench.setRange([x0, x1], [yMin, yMin + yh]);
    }

    /* ---------- Ziehen ---------- */
    const stop = () => {
      if (ctx.clock.playing) ctx.clock.pause();
    };
    conPlot.addHandle({
      get: () => [-gNow, p.gs],
      set: (x, y) => {
        stop();
        ctx.set({ g: clamp(-x, 2, 50), gs: clamp(y, 1, 12) });
      },
      enabled: () => mode() === 'con' && !ctx.locked,
      color: () => ctx.theme.series[2]!,
    });
    bench.addHandle({
      get: () => [LENS_X - gNow, 0],
      set: (x) => {
        stop();
        ctx.set({ g: clamp(LENS_X - x, 2, 50) });
      },
      axis: 'x',
      enabled: () => mode() === 'bench' && !ctx.locked,
      color: () => ctx.theme.series[3]!,
    });
    bench.addHandle({
      get: () => [LENS_X + sNow, SCREEN_H * 0.55],
      set: (x) => {
        focusTw.finish();
        focusPending = false;
        ctx.set({ s: clamp(x - LENS_X, 2, S_MAX) });
      },
      axis: 'x',
      enabled: () => mode() === 'bench' && !ctx.locked,
      color: () => ctx.theme.series[5]!,
    });

    ctx.clock.onChange((playing) => {
      if (!playing && Math.abs(gNow - p.g) > 1e-6) ctx.set({ g: Math.round(gNow * 2) / 2 });
    });

    /* ---------- Ergebnisse ---------- */
    const cm = (v: number, d = 1) => `${fmt.num(v, d)} cm`;
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const v = (s: string) => `<var>${s}</var>`;

    function propsText(f: number, gg: number): string {
      const info = describeImage(f, gg, p.gs);
      if (info.kind === 'none') return ctx.t('propsNone');
      const o = ctx.t(info.upright ? 'oUp' : 'oInv');
      const s = ctx.t(info.size === 'larger' ? 'sLarger' : info.size === 'smaller' ? 'sSmaller' : 'sSame');
      return tr(info.kind === 'real' ? 'propsReal' : 'propsVirtual', { o, s });
    }

    /** „=“ bei Werten, die mit einer Nachkommastelle exakt sind, sonst „≈“. */
    const eqSign = (v: number, d = 1) => (Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-9 ? '=' : '≈');

    function updateReadouts(): void {
      const f = fS();
      const gg = gNow;
      const b = imageDistance(f, gg);
      ctx.readout('lens', tr('lensText', { kind: ctx.t(f > 0 ? 'lensSam' : 'lensZer'), f: fmt.num(f, 1), D: fmt.num(power(f), 1) }));
      if (b === null) {
        ctx.readout('eq', ctx.t('eqNone'));
        ctx.readout('mag', ctx.t('magNone'));
      } else {
        ctx.readout('eq', {
          html: `${frac('1', v('f'))} = ${frac('1', v('g'))} + ${frac('1', v('b'))} &nbsp;⇒&nbsp; ${v('b')} = ${frac(`${v('f')} · ${v('g')}`, `${v('g')} − ${v('f')}`)} = ${frac(`${cm(f)} · ${cm(gg)}`, `${cm(gg)} − ${f < 0 ? `(${cm(f)})` : cm(f)}`)} ${eqSign(b)} <strong>${cm(b)}</strong>${b < 0 ? ctx.t('virtNote') : ''}`,
        });
        const m = Math.abs(b) / gg;
        ctx.readout('mag', {
          html: `${frac(v('B'), v('G'))} = ${frac(`|${v('b')}|`, v('g'))} = ${frac(cm(Math.abs(b)), cm(gg))} ${eqSign(m, 2)} ${fmt.num(m, 2)} &nbsp;⇒&nbsp; ${v('B')} ${eqSign(m, 2)} ${fmt.num(m, 2)} · ${cm(p.gs)} ${eqSign(m * p.gs)} <strong>${cm(m * p.gs)}</strong>`,
        });
      }
      ctx.readout('props', propsText(f, gg));
      if (mode() === 'con') {
        ctx.readout('use', ctx.t(`z_${zoneOf(f, gg)}`));
        ctx.readout('sharp', null);
      } else {
        ctx.readout('use', null);
        const a = p.d / 2;
        if (b !== null && b > 0) ctx.readout('sharp', tr('sharpText', { s: fmt.num(sNow, 1), b: fmt.num(b, 1), d: fmt.num(20 * blurRadius(a, sNow, b), 1) }));
        else ctx.readout('sharp', tr('sharpNone', { s: fmt.num(sNow, 1) }));
      }
    }

    /* ---------- Zeichenhilfen ---------- */
    function label(str: string, x: number, y: number, opts: { size?: number; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; weight?: number; halo?: string; italic?: boolean } = {}): void {
      const size = opts.size ?? 12;
      g.font = opts.italic ? `italic ${opts.weight ?? 600} ${size + 1}px ${ctx.theme.mathFont}` : `${opts.weight ?? 700} ${size}px ${ctx.theme.font}`;
      g.textAlign = opts.align ?? 'center';
      g.textBaseline = opts.baseline ?? 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 3.5;
      g.strokeStyle = opts.halo ?? ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = opts.color ?? ctx.theme.text;
      g.fillText(str, x, y);
    }

    function pill(str: string, x: number, y: number, color: string, opts: { size?: number; solid?: boolean; align?: 'left' | 'center' | 'right' } = {}): number {
      const theme = ctx.theme;
      const size = opts.size ?? 12;
      g.font = `700 ${size}px ${theme.font}`;
      const w = g.measureText(str).width + 16;
      const h = size + 10;
      const left = opts.align === 'left' ? x : opts.align === 'right' ? x - w : x - w / 2;
      g.save();
      softShadow(g, theme.dark, 6, 1);
      g.fillStyle = opts.solid ? color : theme.dark ? 'rgba(18,24,34,0.94)' : 'rgba(255,255,255,0.96)';
      roundRect(g, left, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      if (!opts.solid) {
        g.strokeStyle = withAlpha(color, 0.55);
        g.lineWidth = 1;
        roundRect(g, left + 0.5, y - h / 2 + 0.5, w - 1, h - 1, h / 2);
        g.stroke();
      }
      text(g, str, left + w / 2, y + 0.5, { font: `700 ${size}px ${theme.font}`, color: opts.solid ? '#ffffff' : color });
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
      text(g, title, r.x + 14, r.y + 20, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
      return r.y + 34;
    }

    function wrap(str: string, maxW: number, font: string): string[] {
      g.font = font;
      const lines: string[] = [];
      let line = '';
      for (const w of str.split(' ')) {
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

    /** Strahl als Linie (Pixel), optional gestrichelt und mit Pfeil in der Mitte. */
    function line(x1: number, y1: number, x2: number, y2: number, color: string, opts: { width?: number; dash?: number[]; alpha?: number; arrow?: boolean } = {}): void {
      g.save();
      g.strokeStyle = color;
      g.globalAlpha = opts.alpha ?? 1;
      g.lineWidth = opts.width ?? 2;
      g.lineCap = 'round';
      g.setLineDash(opts.dash ?? []);
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.restore();
      if (opts.arrow && Math.hypot(x2 - x1, y2 - y1) > 34) arrowHead((x1 + x2) / 2, (y1 + y2) / 2, Math.atan2(y2 - y1, x2 - x1), 10, color);
    }

    /** Pfeil für Gegenstand und Bild (Pixel). */
    function bigArrow(x: number, y0: number, y1: number, color: string, opts: { dashed?: boolean; alpha?: number } = {}): void {
      const dir = Math.sign(y1 - y0) || -1;
      const head = Math.min(13, Math.abs(y1 - y0) * 0.45);
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.strokeStyle = color;
      g.lineWidth = 3.5;
      g.lineCap = 'round';
      if (opts.dashed) g.setLineDash([6, 5]);
      g.beginPath();
      g.moveTo(x, y0);
      g.lineTo(x, y1 - dir * head * 0.6);
      g.stroke();
      g.setLineDash([]);
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(x, y1);
      g.lineTo(x - head * 0.62, y1 - dir * head);
      g.lineTo(x + head * 0.62, y1 - dir * head);
      g.closePath();
      if (opts.dashed) {
        g.globalAlpha = (opts.alpha ?? 1) * 0.35;
        g.fill();
        g.globalAlpha = opts.alpha ?? 1;
        g.lineWidth = 1.8;
        g.stroke();
      } else g.fill();
      g.restore();
    }

    /** Linsenkörper (Pixel): `form` 1 = bikonvex, −1 = bikonkav; Dicke nach Brennweite. */
    function lensBody(cx: number, top: number, bottom: number, form: number, f: number, scaleX: number): void {
      const theme = ctx.theme;
      const hh = (bottom - top) / 2;
      const cy = top + hh;
      const strength = Math.sqrt(10 / Math.abs(f));
      const bulge = form * clamp(hh * 0.16 * strength, 4, hh * 0.32);
      const edge = lerp(Math.max(5, hh * 0.1), Math.max(1.8, 0.25 * scaleX), (form + 1) / 2);
      g.save();
      g.beginPath();
      g.moveTo(cx - edge, top);
      g.quadraticCurveTo(cx - edge - 2 * bulge, cy, cx - edge, bottom);
      g.lineTo(cx + edge, bottom);
      g.quadraticCurveTo(cx + edge + 2 * bulge, cy, cx + edge, top);
      g.closePath();
      const glass = g.createLinearGradient(cx - edge - Math.abs(bulge), 0, cx + edge + Math.abs(bulge), 0);
      glass.addColorStop(0, theme.dark ? 'rgba(120,190,240,0.32)' : 'rgba(150,205,240,0.5)');
      glass.addColorStop(0.45, theme.dark ? 'rgba(200,235,255,0.42)' : 'rgba(225,244,255,0.75)');
      glass.addColorStop(1, theme.dark ? 'rgba(90,160,220,0.3)' : 'rgba(120,185,230,0.5)');
      g.fillStyle = glass;
      g.fill();
      g.strokeStyle = theme.dark ? 'rgba(170,215,250,0.9)' : 'rgba(50,110,165,0.85)';
      g.lineWidth = 1.6;
      g.stroke();
      // Glanzlicht
      g.clip();
      g.strokeStyle = 'rgba(255,255,255,0.55)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx - edge * 0.3 - bulge * 0.6, top + hh * 0.25);
      g.quadraticCurveTo(cx - edge * 0.3 - bulge * 1.1, cy - hh * 0.2, cx - edge * 0.3 - bulge * 0.9, cy + hh * 0.1);
      g.stroke();
      g.restore();
    }

    /* ---------- Symbole für die Anwendungen ---------- */
    function icon(kind: 'cam' | 'proj' | 'lupe' | 'eye' | 'glasses', x: number, y: number, color: string): void {
      g.save();
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      if (kind === 'cam') {
        roundRect(g, x - 9, y - 5.5, 18, 12, 2.5);
        g.moveTo(x - 4, y - 5.5);
        g.lineTo(x - 2.5, y - 8);
        g.lineTo(x + 2.5, y - 8);
        g.lineTo(x + 4, y - 5.5);
        g.stroke();
        g.beginPath();
        g.arc(x, y + 0.5, 3.4, 0, Math.PI * 2);
        g.stroke();
      } else if (kind === 'proj') {
        roundRect(g, x - 10, y - 5, 12, 10, 2);
        g.stroke();
        g.beginPath();
        g.arc(x + 4, y, 2.6, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.moveTo(x + 6.5, y - 1.5);
        g.lineTo(x + 11, y - 6);
        g.moveTo(x + 6.5, y + 1.5);
        g.lineTo(x + 11, y + 6);
        g.stroke();
      } else if (kind === 'lupe') {
        g.arc(x - 2, y - 2, 5.5, 0, Math.PI * 2);
        g.moveTo(x + 2, y + 2);
        g.lineTo(x + 8, y + 8);
        g.stroke();
      } else if (kind === 'eye') {
        g.moveTo(x - 9, y);
        g.quadraticCurveTo(x, y - 8, x + 9, y);
        g.quadraticCurveTo(x, y + 8, x - 9, y);
        g.stroke();
        g.beginPath();
        g.arc(x, y, 2.8, 0, Math.PI * 2);
        g.fill();
      } else {
        g.arc(x - 5, y, 4, 0, Math.PI * 2);
        g.moveTo(x + 9, y);
        g.arc(x + 5, y, 4, 0, Math.PI * 2);
        g.moveTo(x - 1, y - 1);
        g.quadraticCurveTo(x, y - 2.5, x + 1, y - 1);
        g.stroke();
      }
      g.restore();
    }

    /* =================================================================== */
    /* Bildkonstruktion                                                     */
    /* =================================================================== */

    const RAY_COLOR = (id: RayId) => ctx.theme.series[id === 'par' ? 0 : id === 'mid' ? 3 : 4]!;
    const rayOn = (id: RayId) => (id === 'par' ? p.rp : id === 'mid' ? p.rm : p.rf);

    function drawCon(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const { scene, card: cr } = conRegions();
      fitCon();
      conPlot.begin();
      const s = conPlot.scale.x;
      const P = (x: number, y: number) => conPlot.toPx(x, y);
      const bnd = conPlot.bounds;
      const f = fS();
      const gg = gNow;
      const G = p.gs;
      const info = describeImage(f, gg, G);
      const [lx, ly] = P(0, 0);
      // Hintergrund: Zeichenpapier mit Zentimeterraster
      const bg = g.createLinearGradient(0, scene.y, 0, scene.y + scene.h);
      bg.addColorStop(0, dark ? '#131a25' : '#f7f9fc');
      bg.addColorStop(1, dark ? '#0f151e' : '#eef2f7');
      g.fillStyle = bg;
      g.fillRect(scene.x, scene.y, scene.w, scene.h);
      g.lineWidth = 1;
      for (let x = Math.ceil(bnd.xMin); x <= bnd.xMax; x++) {
        const [px] = P(x, 0);
        g.strokeStyle = dark ? (x % 5 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)') : x % 5 === 0 ? 'rgba(16,24,40,0.07)' : 'rgba(16,24,40,0.03)';
        if (x % 5 !== 0 && s < 5) continue;
        g.beginPath();
        g.moveTo(Math.round(px) + 0.5, scene.y);
        g.lineTo(Math.round(px) + 0.5, scene.y + scene.h);
        g.stroke();
      }
      for (let y = Math.ceil(bnd.yMin); y <= bnd.yMax; y++) {
        const [, py] = P(0, y);
        g.strokeStyle = dark ? (y % 5 === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.025)') : y % 5 === 0 ? 'rgba(16,24,40,0.07)' : 'rgba(16,24,40,0.03)';
        if (y % 5 !== 0 && s < 5) continue;
        g.beginPath();
        g.moveTo(scene.x, Math.round(py) + 0.5);
        g.lineTo(scene.x + scene.w, Math.round(py) + 0.5);
        g.stroke();
      }
      // Bereiche f und 2f (unten)
      const stripH = small ? 22 : 26;
      const stripY = scene.y + scene.h - stripH - 6;
      if (p.zones) drawZones(scene, stripY, stripH, f, gg);
      // Optische Achse und Mittelebene
      g.strokeStyle = withAlpha(theme.text, 0.75);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(scene.x, ly);
      g.lineTo(scene.x + scene.w, ly);
      g.stroke();
      label(ctx.t('axis'), scene.x + scene.w - 8, ly - 10, { size: 11, color: theme.muted, align: 'right', weight: 600 });
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.4);
      g.setLineDash([5, 5]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(lx, scene.y + 4);
      g.lineTo(lx, (p.zones ? stripY : scene.y + scene.h) - 4);
      g.stroke();
      g.restore();
      // Linse
      const lensForm = shapeTw.running ? lerp(shapeFrom, shape, shapeTw.value) : shape;
      const [, lTop] = P(0, lensH);
      const [, lBot] = P(0, -lensH);
      lensBody(lx, lTop, lBot, lensForm, f, s);
      label(ctx.t(f > 0 ? 'lensSam' : 'lensZer'), lx, lTop - 12, { size: 12, color: theme.muted });
      // Brennpunkte F und 2F
      const fa = Math.abs(f);
      for (const sgn of [-1, 1]) {
        for (const k of [1, 2]) {
          const [fx] = P(sgn * k * fa, 0);
          if (fx < scene.x + 6 || fx > scene.x + scene.w - 6) continue;
          if (k === 1) {
            g.fillStyle = theme.text;
            g.beginPath();
            g.arc(fx, ly, 4, 0, Math.PI * 2);
            g.fill();
          } else {
            g.strokeStyle = theme.text;
            g.lineWidth = 1.6;
            g.beginPath();
            g.moveTo(fx, ly - 5);
            g.lineTo(fx, ly + 5);
            g.stroke();
          }
          // Beschriftung weicht einem nach unten zeigenden Bild aus
          const imgX = p.show && info.b !== null && info.B !== null && info.B < 0 ? P(info.b, 0)[0] : null;
          const clash = imgX !== null && Math.abs(imgX - fx) < 14;
          label(k === 1 ? 'F' : '2F', clash ? fx - 10 : fx, ly + 15, { size: 13, color: theme.text, italic: true, align: clash ? 'right' : 'center' });
        }
      }
      const show = p.show;
      g.save();
      g.beginPath();
      g.rect(scene.x, scene.y, scene.w, (p.zones ? stripY - 3 : scene.y + scene.h) - scene.y);
      g.clip();
      // Lichtbündel von der Pfeilspitze
      if (show && p.bun) drawBundle(f, gg, G, info.b);
      // Konstruktionsstrahlen
      if (show) {
        const [ox, oy] = P(-gg, G);
        const xEnd = bnd.xMax + 2;
        for (const r of constructionRays(f, gg, G)) {
          if (!rayOn(r.id)) continue;
          const col = RAY_COLOR(r.id);
          const [hx, hy] = P(0, r.hit);
          const [ex, ey] = P(xEnd, rayY(r, xEnd));
          // Verlängerung nach vorn bei virtuellem Bild (gestrichelt)
          if (info.kind === 'virtual' && info.b !== null) {
            const xb = Math.min(info.b, r.id === 'par' && f < 0 ? f : info.b) - 2;
            const [bx, by] = P(xb, rayY(r, xb));
            line(hx, hy, bx, by, col, { width: 1.6, dash: [6, 5], alpha: 0.75 });
          }
          line(ox, oy, hx, hy, col, { width: 2.4, arrow: true });
          line(hx, hy, ex, ey, col, { width: 2.4, arrow: true });
          g.fillStyle = col;
          g.beginPath();
          g.arc(hx, hy, 3, 0, Math.PI * 2);
          g.fill();
        }
      }
      // Gegenstand
      const [ox0, oy0] = P(-gg, 0);
      const [, oy1] = P(-gg, G);
      bigArrow(ox0, oy0, oy1, theme.series[2]!);
      if (ox0 > scene.x + 22) label('G', ox0 - 12, (oy0 + oy1) / 2, { size: 14, color: theme.series[2]!, italic: true, align: 'right' });
      else if (ox0 >= scene.x + 2) label('G', ox0 + 12, (oy0 + oy1) / 2, { size: 14, color: theme.series[2]!, italic: true, align: 'left' });
      else pill(`← ${tr('objOut', { g: fmt.num(gg, 1) })}`, scene.x + 8, ly - 26, theme.series[2]!, { size: 11, align: 'left' });
      // Bild
      if (show && info.b !== null && info.B !== null) {
        const [ix, iy0] = P(info.b, 0);
        const [, iy1] = P(info.b, info.B);
        const inView = ix > scene.x + 4 && ix < scene.x + scene.w - 4;
        if (inView) {
          bigArrow(ix, iy0, iy1, theme.series[1]!, { dashed: info.kind === 'virtual', alpha: info.kind === 'virtual' ? 0.9 : 1 });
          const right = info.kind === 'real';
          label('B', ix + (right ? 12 : -12), (iy0 + Math.max(scene.y + 12, Math.min(scene.y + scene.h - 12, iy1))) / 2, { size: 14, color: theme.series[1]!, italic: true, align: right ? 'left' : 'right' });
          if (info.kind === 'virtual') {
            const off = Math.abs(iy1 - iy0) < 34 ? 30 : 14;
            const ty = clamp(iy1 + (info.B > 0 ? -off : off), scene.y + 12, stripY - 12);
            label(ctx.t('virt'), ix, ty, { size: 11, color: theme.series[1]!, weight: 600 });
          }
        } else {
          const str = tr(info.b > 0 ? 'outRight' : 'outLeft', { b: fmt.num(info.b, 0) });
          if (info.b > 0) pill(`${str} →`, scene.x + scene.w - 8, ly + 26, theme.series[1]!, { size: 11, align: 'right' });
          else pill(`← ${str}`, scene.x + 8, ly + 26, theme.series[1]!, { size: 11, align: 'left' });
        }
      }
      g.restore();
      // Maße g und b über dem Bereichsstreifen
      drawDims(scene, (p.zones ? stripY : scene.y + scene.h) - 16, gg, show ? info.b : null);
      // Sonderfall g = f
      if (show && info.kind === 'none') {
        if (small) pill(ctx.t('noImageShort'), scene.x + scene.w - 8, scene.y + 18, theme.series[4]!, { size: 11, solid: true, align: 'right' });
        else pill(ctx.t('noImage'), (lx + scene.x + scene.w) / 2 + 20, scene.y + 22, theme.series[4]!, { size: 12, solid: true });
      }
      // Legende der Strahlen (auf dem Handy in der Karte)
      if (show && !small) drawRayLegend(scene);
      conPlot.end();
      drawConCard(cr, f, gg);
    }

    function drawBundle(f: number, gg: number, G: number, b: number | null): void {
      const theme = ctx.theme;
      const P = (x: number, y: number) => conPlot.toPx(x, y);
      const xEnd = conPlot.bounds.xMax + 2;
      const top = rayThrough(f, gg, G, lensH);
      const bot = rayThrough(f, gg, G, -lensH);
      const warm = theme.dark ? 'rgba(255,214,120,0.12)' : 'rgba(255,190,60,0.15)';
      const poly = (pts: [number, number][]) => {
        g.beginPath();
        pts.forEach(([x, y], i) => {
          const [px, py] = P(x, y);
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        });
        g.closePath();
        g.fill();
      };
      g.save();
      g.fillStyle = warm;
      poly([
        [-gg, G],
        [0, lensH],
        [0, -lensH],
      ]);
      if (b !== null && b > 0) {
        const yb = rayY(top, b);
        poly([
          [0, lensH],
          [0, -lensH],
          [b, yb],
        ]);
        poly([
          [b, yb],
          [xEnd, rayY(top, xEnd)],
          [xEnd, rayY(bot, xEnd)],
        ]);
      } else {
        poly([
          [0, lensH],
          [0, -lensH],
          [xEnd, rayY(bot, xEnd)],
          [xEnd, rayY(top, xEnd)],
        ]);
      }
      g.restore();
      // einzelne Strahlen des Bündels
      const col = theme.dark ? 'rgba(255,214,120,0.42)' : 'rgba(214,140,20,0.42)';
      for (let k = 0; k <= 6; k++) {
        const hit = -lensH + (2 * lensH * k) / 6;
        const r = rayThrough(f, gg, G, hit);
        const [ox, oy] = P(-gg, G);
        const [hx, hy] = P(0, hit);
        const [ex, ey] = P(xEnd, rayY(r, xEnd));
        line(ox, oy, hx, hy, col, { width: 1 });
        line(hx, hy, ex, ey, col, { width: 1 });
        if (b !== null && b < 0) {
          const [bx, by] = P(b, rayY(r, b));
          line(hx, hy, bx, by, col, { width: 1, dash: [3, 4], alpha: 0.8 });
        }
      }
    }

    function drawDims(scene: Rect, y: number, gg: number, b: number | null): void {
      const theme = ctx.theme;
      const [lx] = conPlot.toPx(0, 0);
      const dim = (x0: number, x1: number, str: string, color: string, yy: number, dashed = false) => {
        const a = Math.max(scene.x + 2, Math.min(x0, x1));
        const c = Math.min(scene.x + scene.w - 2, Math.max(x0, x1));
        if (c - a < 4) return;
        g.save();
        g.strokeStyle = color;
        g.lineWidth = 1.5;
        if (dashed) g.setLineDash([4, 4]);
        g.beginPath();
        g.moveTo(a, yy);
        g.lineTo(c, yy);
        g.stroke();
        g.setLineDash([]);
        g.beginPath();
        for (const xx of [x0, x1]) {
          if (xx < scene.x || xx > scene.x + scene.w) continue;
          g.moveTo(xx, yy - 5);
          g.lineTo(xx, yy + 5);
        }
        g.stroke();
        g.restore();
        const size = narrow() ? 11 : 12;
        g.font = `700 ${size}px ${theme.font}`;
        const pw = g.measureText(str).width + 16;
        if (c - a >= pw + 8) pill(str, (a + c) / 2, yy, color, { size });
        else if (Math.max(x0, x1) <= lx + 1) pill(str, a - 4, yy, color, { size, align: 'right' });
        else pill(str, c + 4, yy, color, { size, align: 'left' });
      };
      const [ox] = conPlot.toPx(-gg, 0);
      dim(ox, lx, `g = ${cm(gg)}`, theme.series[2]!, y);
      if (b === null) return;
      const [bx] = conPlot.toPx(b, 0);
      // virtuelles Bild: b negativ, Maß auf der Gegenstandsseite eine Zeile höher
      if (b > 0) dim(lx, bx, `b = ${cm(b)}`, theme.series[1]!, y);
      else dim(bx, lx, `b = ${cm(b)}`, theme.series[1]!, y - 26, true);
    }

    function drawRayLegend(scene: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      const items = (['par', 'mid', 'foc'] as RayId[]).filter((id) => rayOn(id));
      if (!items.length) return;
      const font = `600 ${small ? 11 : 12}px ${theme.font}`;
      g.font = font;
      const w = Math.max(...items.map((id) => g.measureText(ctx.t(id)).width)) + 44;
      const lh = small ? 17 : 19;
      const h = items.length * lh + 12;
      const x = scene.x + 10;
      const y = scene.y + 10;
      g.save();
      g.fillStyle = theme.dark ? 'rgba(21,28,39,0.88)' : 'rgba(255,255,255,0.9)';
      softShadow(g, theme.dark, 8, 2);
      roundRect(g, x, y, w, h, 8);
      g.fill();
      g.restore();
      items.forEach((id, i) => {
        const yy = y + 6 + lh / 2 + i * lh;
        line(x + 10, yy, x + 30, yy, RAY_COLOR(id), { width: 2.6 });
        text(g, ctx.t(id), x + 38, yy + 0.5, { font, color: theme.text, align: 'left' });
      });
    }

    function drawZones(scene: Rect, y: number, h: number, f: number, gg: number): void {
      const theme = ctx.theme;
      const small = narrow();
      const P = (x: number) => conPlot.toPx(x, 0)[0];
      const zone: Zone | null = p.show ? zoneOf(f, gg) : null;
      const left = scene.x + 4;
      const right = scene.x + scene.w - 4;
      const [lx] = conPlot.toPx(0, 0);
      type Seg = { a: number; b: number; color: string; on: boolean; str: string; icons: ('cam' | 'proj' | 'lupe' | 'eye' | 'glasses')[] };
      const segs: Seg[] = [];
      const c0 = theme.series[0]!;
      const c3 = theme.series[3]!;
      const c4 = theme.series[4]!;
      if (f > 0) {
        segs.push({ a: left, b: P(-2 * f), color: c0, on: zone === 'far', str: ctx.t('zs_far'), icons: ['cam', 'eye'] });
        segs.push({ a: P(-2 * f), b: P(-f), color: c3, on: zone === 'mid', str: ctx.t('zs_mid'), icons: ['proj'] });
        segs.push({ a: P(-f), b: lx, color: c4, on: zone === 'near', str: ctx.t('zs_near'), icons: ['lupe'] });
        // Bildseite: wo das Bild entsteht (gleiche Farbe wie der Bereich des Gegenstands)
        segs.push({ a: P(f), b: P(2 * f), color: c0, on: zone === 'far', str: zone === 'far' ? ctx.t('imgHere') : '', icons: [] });
        segs.push({ a: P(2 * f), b: right, color: c3, on: zone === 'mid', str: zone === 'mid' ? ctx.t('imgHere') : '', icons: [] });
      } else {
        segs.push({ a: left, b: lx, color: c4, on: zone !== null, str: ctx.t('zs_div'), icons: ['glasses'] });
      }
      for (const sg of segs) {
        const a = Math.max(left, sg.a);
        const b = Math.min(right, sg.b);
        if (b - a < 3) continue;
        g.save();
        g.fillStyle = withAlpha(sg.color, sg.on ? (theme.dark ? 0.3 : 0.2) : theme.dark ? 0.09 : 0.07);
        roundRect(g, a + 1, y, b - a - 2, h, 6);
        g.fill();
        if (sg.on) {
          g.strokeStyle = withAlpha(sg.color, 0.8);
          g.lineWidth = 1.2;
          roundRect(g, a + 1.5, y + 0.5, b - a - 3, h - 1, 6);
          g.stroke();
        }
        g.restore();
        if (!sg.str) continue;
        const font = `${sg.on ? 700 : 600} ${small ? 10.5 : 11.5}px ${theme.font}`;
        g.font = font;
        const tw = g.measureText(sg.str).width;
        const iw = sg.icons.length * 24;
        const col = sg.on ? sg.color : withAlpha(theme.muted, 0.95);
        if (b - a > tw + iw + 14) {
          const x0 = (a + b) / 2 - (tw + iw) / 2;
          sg.icons.forEach((ic, i) => icon(ic, x0 + 10 + i * 24, y + h / 2, col));
          text(g, sg.str, x0 + iw, y + h / 2 + 0.5, { font, color: col, align: 'left' });
        } else if (b - a > tw + 10) {
          text(g, sg.str, (a + b) / 2, y + h / 2 + 0.5, { font, color: col });
        } else if (b - a > iw + 6 && iw) {
          sg.icons.forEach((ic, i) => icon(ic, (a + b) / 2 - iw / 2 + 12 + i * 24, y + h / 2, col));
        }
      }
      // Grenzmarken am Streifen: 2F und F (Gegenstandsseite)
      if (f > 0) {
        for (const k of [2, 1]) {
          const x = P(-k * f);
          if (x < left + 2) continue;
          g.strokeStyle = withAlpha(theme.text, 0.35);
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x, y - 3);
          g.lineTo(x, y + h + 3);
          g.stroke();
        }
      }
    }

    /** Bruch auf der Zeichenfläche; gibt die Breite zurück. */
    function fracPx(x: number, y: number, num: string, den: string, size: number, color: string, math = false): number {
      const font = math ? `italic 600 ${size}px ${ctx.theme.mathFont}` : `600 ${size}px ${ctx.theme.font}`;
      g.font = font;
      const w = Math.max(g.measureText(num).width, g.measureText(den).width) + 6;
      text(g, num, x + w / 2, y - size * 0.62, { font, color });
      text(g, den, x + w / 2, y + size * 0.68, { font, color });
      g.strokeStyle = color;
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(x, y + 0.5);
      g.lineTo(x + w, y + 0.5);
      g.stroke();
      return w;
    }

    function drawConCard(r: Rect, f: number, gg: number): void {
      const theme = ctx.theme;
      const small = narrow();
      card(r);
      const info = describeImage(f, gg, p.gs);
      const show = p.show;
      // Spalten: links Eigenschaften und Anwendung, rechts die Rechnung
      const formulaW = small ? r.w - 28 : Math.min(330, r.w * 0.4);
      const leftW = small ? r.w - 28 : r.w - formulaW - 42;
      const x = r.x + 14;
      let y = r.y + (small ? 22 : 24);
      text(g, ctx.t('imgLabel'), x, y, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
      g.font = `700 13px ${theme.font}`;
      let cx = x + g.measureText(ctx.t('imgLabel')).width + 10;
      const size = small ? 11.5 : 12.5;
      const chips: [string, string][] = [];
      if (!show) chips.push([ctx.t('hiddenShort'), theme.muted]);
      else if (info.kind === 'none') chips.push([ctx.t('kNone'), theme.series[4]!]);
      else {
        chips.push([ctx.t(info.kind === 'real' ? 'kReal' : 'kVirtual'), info.kind === 'real' ? theme.series[1]! : theme.series[4]!]);
        chips.push([ctx.t(info.upright ? 'oUp' : 'oInv'), theme.series[2]!]);
        chips.push([ctx.t(info.size === 'larger' ? 'sLarger' : info.size === 'smaller' ? 'sSmaller' : 'sSame'), theme.series[0]!]);
      }
      for (const [str, col] of chips) {
        g.font = `700 ${size}px ${theme.font}`;
        const w = g.measureText(str).width + 16;
        if (cx + w > x + leftW) {
          cx = x;
          y += 26;
        }
        pill(str, cx, y, col, { size, align: 'left' });
        cx += w + 8;
      }
      y += small ? 26 : 30;
      // Anwendung bzw. Hinweis
      const zone = zoneOf(f, gg);
      const appText = show ? ctx.t(`z_${zone}`) : ctx.t('hidden');
      const ic: 'cam' | 'proj' | 'lupe' | 'eye' | 'glasses' | null = !show ? null : zone === 'far' ? 'cam' : zone === 'mid' || zone === 'twice' ? 'proj' : zone === 'near' ? 'lupe' : zone === 'diverging' ? 'glasses' : null;
      const font = `500 ${small ? 12 : 12.5}px ${theme.font}`;
      const tx = ic ? x + 28 : x;
      if (ic) icon(ic, x + 10, y + 1, theme.muted);
      const lines = wrap(appText, leftW - (tx - x), font);
      lines.forEach((ln, i) => text(g, ln, tx, y + i * 17, { font, color: theme.text, align: 'left' }));
      y += lines.length * 17;
      // Rechnung
      let fx: number;
      let fy: number;
      if (small) {
        fx = x;
        fy = y + 26;
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + 14, y + 4);
        g.lineTo(r.x + r.w - 14, y + 4);
        g.stroke();
      } else {
        fx = r.x + r.w - formulaW - 14;
        fy = r.y + 30;
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(fx - 14, r.y + 12);
        g.lineTo(fx - 14, r.y + r.h - 12);
        g.stroke();
      }
      drawFormula(fx, fy, gg, info.b, show, small);
      if (small && show) {
        // Legende der Strahlen
        const items = (['par', 'mid', 'foc'] as RayId[]).filter((id) => rayOn(id));
        const lf = `600 11px ${theme.font}`;
        g.font = lf;
        let lx = x;
        let ly = r.y + r.h - 16;
        const rows: [number, number, RayId][] = [];
        for (const id of items) {
          const w = g.measureText(ctx.t(id)).width + 30;
          if (lx + w > r.x + r.w - 10) {
            lx = x;
            ly += 17;
          }
          rows.push([lx, ly, id]);
          lx += w + 10;
        }
        const shift = ly - (r.y + r.h - 16);
        for (const [ax, ay, id] of rows) {
          line(ax, ay - shift, ax + 20, ay - shift, RAY_COLOR(id), { width: 2.6 });
          text(g, ctx.t(id), ax + 26, ay - shift + 0.5, { font: lf, color: theme.text, align: 'left' });
        }
      }
    }

    function drawFormula(x: number, y: number, gg: number, b: number | null, show: boolean, small: boolean): void {
      const theme = ctx.theme;
      const sz = small ? 13 : 14;
      const opF = `600 ${sz}px ${theme.font}`;
      const red = theme.series[1]!;
      // Zeile 1: 1/f = 1/g + 1/b  ⇒  b = …
      let cx = x;
      cx += fracPx(cx, y, '1', 'f', sz, theme.text, true) + 6;
      text(g, '=', cx + 5, y, { font: opF, color: theme.text });
      cx += 16;
      cx += fracPx(cx, y, '1', 'g', sz, theme.series[2]!, true) + 6;
      text(g, '+', cx + 5, y, { font: opF, color: theme.text });
      cx += 16;
      cx += fracPx(cx, y, '1', 'b', sz, red, true) + 10;
      const bStr = !show ? '?' : b === null ? '∞' : cm(b);
      text(g, `⇒  b = ${bStr}`, cx, y + 0.5, { font: `700 ${sz}px ${theme.font}`, color: red, align: 'left' });
      // Zeile 2: B/G = |b|/g  ⇒  B = …
      const y2 = y + (small ? 44 : 44);
      cx = x;
      cx += fracPx(cx, y2, 'B', 'G', sz, theme.text, true) + 6;
      text(g, '=', cx + 5, y2, { font: opF, color: theme.text });
      cx += 16;
      cx += fracPx(cx, y2, '|b|', 'g', sz, theme.text, true) + 10;
      const BStr = !show ? '?' : b === null ? '–' : cm((Math.abs(b) / gg) * p.gs);
      text(g, `⇒  B = ${BStr}`, cx, y2 + 0.5, { font: `700 ${sz}px ${theme.font}`, color: red, align: 'left' });
    }

    /* =================================================================== */
    /* Optische Bank                                                        */
    /* =================================================================== */

    function drawBench(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const { scene, view, info } = benchRegions();
      fitBench();
      bench.begin();
      const B = (x: number, y: number) => bench.toPx(x, y);
      const sx = bench.scale.x;
      const sy = bench.scale.y;
      const f = p.f;
      const gg = gNow;
      const b = imageDistance(f, gg);
      const a = p.d / 2;
      // abgedunkelter Raum
      const wall = g.createLinearGradient(0, scene.y, 0, scene.y + scene.h);
      wall.addColorStop(0, dark ? '#080b11' : '#121822');
      wall.addColorStop(1, dark ? '#0f151f' : '#1b2330');
      g.fillStyle = wall;
      g.fillRect(scene.x, scene.y, scene.w, scene.h);
      const [, railY] = B(0, BENCH_TOP);
      const railH = Math.max(14, 4.2 * sy);
      // Tisch
      const tableY = railY + railH;
      const table = g.createLinearGradient(0, tableY, 0, scene.y + scene.h);
      table.addColorStop(0, dark ? '#3a2d22' : '#4a392a');
      table.addColorStop(1, dark ? '#251c15' : '#2f241b');
      g.fillStyle = table;
      g.fillRect(scene.x, tableY, scene.w, scene.y + scene.h - tableY);
      g.fillStyle = 'rgba(255,255,255,0.08)';
      g.fillRect(scene.x, tableY, scene.w, 1);
      // optische Achse
      const [, axisY] = B(0, 0);
      g.save();
      g.strokeStyle = 'rgba(200,210,225,0.25)';
      g.setLineDash([6, 6]);
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(scene.x, axisY);
      g.lineTo(scene.x + scene.w, axisY);
      g.stroke();
      g.restore();
      // Brennpunkte
      for (const k of [-2, -1, 1, 2]) {
        const [fx] = B(LENS_X + k * f, 0);
        g.fillStyle = 'rgba(220,228,240,0.75)';
        g.beginPath();
        g.arc(fx, axisY, Math.abs(k) === 1 ? 3 : 2, 0, Math.PI * 2);
        g.fill();
        text(g, Math.abs(k) === 1 ? 'F' : '2F', fx, axisY + 11, { font: `italic 600 ${small ? 11 : 12}px ${theme.mathFont}`, color: 'rgba(220,228,240,0.8)' });
      }
      const candleX = LENS_X - gg;
      const screenX = LENS_X + sNow;
      const top = p.gs / 2;
      // Lichtbündel von Flammenspitze und Kerzenfuß
      if (p.cones) {
        g.save();
        g.globalCompositeOperation = 'lighter';
        drawCone(candleX, top, screenX, f, gg, a, 'rgba(255,200,90,0.22)');
        drawCone(candleX, -top, screenX, f, gg, a, 'rgba(150,190,255,0.16)');
        g.restore();
      }
      // Schiene mit Skala
      const [x0] = B(-2.5, 0);
      const [x1] = B(BENCH_LEN + 2.5, 0);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      const rail = g.createLinearGradient(0, railY, 0, railY + railH);
      rail.addColorStop(0, '#c9d0da');
      rail.addColorStop(0.18, '#9aa3b0');
      rail.addColorStop(1, '#5d6673');
      g.fillStyle = rail;
      roundRect(g, x0, railY, x1 - x0, railH, 3);
      g.fill();
      g.restore();
      g.strokeStyle = 'rgba(20,24,32,0.75)';
      for (let c = 0; c <= BENCH_LEN; c++) {
        if (small && c % 5 !== 0) continue;
        const [x] = B(c, 0);
        const len = c % 10 === 0 ? railH * 0.42 : c % 5 === 0 ? railH * 0.3 : railH * 0.16;
        g.lineWidth = c % 10 === 0 ? 1.2 : 0.8;
        g.beginPath();
        g.moveTo(x, railY + 1);
        g.lineTo(x, railY + 1 + len);
        g.stroke();
        if (c % (small ? 20 : 10) === 0) text(g, String(c), x, railY + railH * 0.74, { font: `600 ${small ? 9.5 : 10}px ${theme.font}`, color: '#1b2230' });
      }
      // Kerze, Linse und Schirm auf Reitern
      drawCandle(candleX, top, sx, sy, railY);
      drawBenchLens(sx, sy, railY, a);
      drawScreen(screenX, sx, sy, railY, f, gg, a);
      rider(candleX, railY, sx, theme.series[3]!);
      rider(LENS_X, railY, sx, theme.series[0]!);
      rider(screenX, railY, sx, theme.series[5]!);
      // Beschriftungen unter der Bank
      const ly = Math.min(scene.y + scene.h - 9, tableY + 12);
      const names: [number, string][] = [
        [candleX, ctx.t('candle')],
        [LENS_X, ctx.t('lens')],
        [screenX, ctx.t('screen')],
      ];
      g.font = `700 12px ${theme.font}`;
      let lastRight = -1e9;
      for (const [xx, str] of names) {
        const [px] = B(xx, 0);
        const w = g.measureText(str).width;
        const cxp = Math.max(px, lastRight + w / 2 + 6);
        text(g, str, cxp, ly, { font: `700 12px ${theme.font}`, color: 'rgba(235,240,248,0.92)' });
        lastRight = cxp + w / 2;
      }
      // Maße g und s über der Schiene
      const dy = railY - Math.max(18, 4 * sy);
      const dim = (xa: number, xb: number, str: string, color: string) => {
        const [pa] = B(xa, 0);
        const [pb] = B(xb, 0);
        g.strokeStyle = color;
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(pa, dy);
        g.lineTo(pb, dy);
        g.moveTo(pa, dy - 4);
        g.lineTo(pa, dy + 4);
        g.moveTo(pb, dy - 4);
        g.lineTo(pb, dy + 4);
        g.stroke();
        const size = small ? 10.5 : 11.5;
        g.font = `700 ${size}px ${theme.font}`;
        const pw = g.measureText(str).width + 16;
        if (Math.abs(pb - pa) > pw + 6) pill(str, (pa + pb) / 2, dy, color, { size });
        else pill(str, xa < LENS_X ? Math.min(pa, pb) - 4 : Math.max(pa, pb) + 4, dy, color, { size, align: xa < LENS_X ? 'right' : 'left' });
      };
      dim(candleX, LENS_X, tr('dist', { g: fmt.num(gg, 1) }), theme.series[3]!);
      dim(LENS_X, screenX, tr('distS', { s: fmt.num(sNow, 1) }), theme.series[5]!);
      bench.end();
      drawScreenView(view, f, gg, a, b);
      drawFocusCard(info, f, gg, a, b);
      // Hinweis (z. B. kein Bild in Reichweite)
      if (hint && performance.now() < hintUntil) {
        pill(hint, scene.x + scene.w / 2, scene.y + 20, theme.series[1]!, { size: 12, solid: true });
        ctx.requestRender();
      }
    }

    function rider(x: number, railY: number, sx: number, color: string): void {
      const [px] = bench.toPx(x, 0);
      const w = Math.max(16, 4.5 * sx);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.45)';
      g.shadowBlur = 4;
      g.shadowOffsetY = 1;
      const body = g.createLinearGradient(0, railY - 7, 0, railY + 2);
      body.addColorStop(0, '#4b5462');
      body.addColorStop(1, '#262c35');
      g.fillStyle = body;
      roundRect(g, px - w / 2, railY - 7, w, 9, 2);
      g.fill();
      g.restore();
      g.fillStyle = color;
      g.beginPath();
      g.moveTo(px, railY + 3.5);
      g.lineTo(px - 3.5, railY - 1.5);
      g.lineTo(px + 3.5, railY - 1.5);
      g.closePath();
      g.fill();
    }

    /** Stativstange von der Schiene bis zu einem Bauteil. */
    function rod(x: number, yTop: number, railY: number, sx: number): void {
      const [px, py] = bench.toPx(x, yTop);
      const w = Math.max(3, sx * 0.7);
      const m = g.createLinearGradient(px - w / 2, 0, px + w / 2, 0);
      m.addColorStop(0, '#4c5563');
      m.addColorStop(0.45, '#aeb6c2');
      m.addColorStop(1, '#3e4652');
      g.fillStyle = m;
      g.fillRect(px - w / 2, py, w, railY - py - 6);
    }

    function drawCandle(x: number, top: number, sx: number, sy: number, railY: number): void {
      const bottom = -top;
      const flameH = Math.min(2.6, (top - bottom) * 0.38);
      const bodyTop = top - flameH;
      const [px, pBot] = bench.toPx(x, bottom);
      const [, pBodyTop] = bench.toPx(x, bodyTop);
      const [, pTip] = bench.toPx(x, top);
      const w = Math.max(6, 1.8 * sx);
      rod(x, bottom - 0.6, railY, sx);
      // Teller
      g.fillStyle = '#7d8592';
      roundRect(g, px - w * 0.95, pBot, w * 1.9, Math.max(3, 0.6 * sy), 1.5);
      g.fill();
      const wax = g.createLinearGradient(px - w / 2, 0, px + w / 2, 0);
      wax.addColorStop(0, '#d9c7a8');
      wax.addColorStop(0.35, '#fbf3e3');
      wax.addColorStop(1, '#bfa983');
      g.fillStyle = wax;
      roundRect(g, px - w / 2, pBodyTop, w, pBot - pBodyTop, Math.min(3, w / 3));
      g.fill();
      // Flamme mit Lichthof
      const fh = pBodyTop - pTip;
      const fw = Math.max(3.5, w * 0.42);
      const glow = g.createRadialGradient(px, pTip + fh * 0.6, 0, px, pTip + fh * 0.6, fh * 3);
      glow.addColorStop(0, 'rgba(255,190,80,0.55)');
      glow.addColorStop(1, 'rgba(255,170,60,0)');
      g.fillStyle = glow;
      g.beginPath();
      g.arc(px, pTip + fh * 0.6, fh * 3, 0, Math.PI * 2);
      g.fill();
      const fl = g.createLinearGradient(0, pTip, 0, pBodyTop);
      fl.addColorStop(0, '#fff3b0');
      fl.addColorStop(0.45, '#ffc23d');
      fl.addColorStop(0.85, '#ff7a1a');
      fl.addColorStop(1, '#4a7bff');
      g.fillStyle = fl;
      g.beginPath();
      g.moveTo(px, pTip);
      g.bezierCurveTo(px + fw * 0.9, pTip + fh * 0.45, px + fw, pBodyTop - fh * 0.05, px, pBodyTop);
      g.bezierCurveTo(px - fw, pBodyTop - fh * 0.05, px - fw * 0.9, pTip + fh * 0.45, px, pTip);
      g.fill();
    }

    function drawBenchLens(sx: number, sy: number, railY: number, a: number): void {
      const R = BENCH_LENS_R;
      const [px, pTop] = bench.toPx(LENS_X, R + 0.8);
      const [, pBot] = bench.toPx(LENS_X, -R - 0.8);
      rod(LENS_X, -R - 0.8, railY, sx);
      // Fassung
      const fw = Math.max(7, 1.6 * sx);
      g.fillStyle = '#2c333e';
      roundRect(g, px - fw / 2, pTop, fw, pBot - pTop, 3);
      g.fill();
      const [, lTop] = bench.toPx(LENS_X, R);
      const [, lBot] = bench.toPx(LENS_X, -R);
      lensBody(px, lTop, lBot, 1, p.f, sx * 0.9);
      // Blende (Lochblende vor der Linse)
      if (a < R - 1e-6) {
        const [, aTop] = bench.toPx(LENS_X, a);
        const [, aBot] = bench.toPx(LENS_X, -a);
        const bx = px - fw / 2 - Math.max(3, 0.7 * sx);
        const bw = Math.max(3, 0.6 * sx);
        g.fillStyle = '#11151b';
        g.fillRect(bx, pTop - 2, bw, aTop - pTop + 2);
        g.fillRect(bx, aBot, bw, pBot - aBot + 2);
        g.strokeStyle = 'rgba(200,210,225,0.35)';
        g.lineWidth = 1;
        g.strokeRect(bx + 0.5, pTop - 1.5, bw - 1, aTop - pTop + 1);
        g.strokeRect(bx + 0.5, aBot + 0.5, bw - 1, pBot - aBot + 1);
      }
      void sy;
    }

    /** Lichtbündel von einem Punkt der Kerze durch die Blende bis zum Schirm. */
    function drawCone(x0: number, y0: number, screenX: number, f: number, gg: number, a: number, fill: string): void {
      const B = (x: number, y: number) => bench.toPx(x, y);
      const t = rayThrough(f, gg, y0, a);
      const u = rayThrough(f, gg, y0, -a);
      const s = screenX - LENS_X;
      const poly = (pts: [number, number][]) => {
        g.beginPath();
        pts.forEach(([x, y], i) => {
          const [px, py] = B(x, y);
          if (i === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        });
        g.closePath();
        g.fill();
      };
      g.fillStyle = fill;
      poly([
        [x0, y0],
        [LENS_X, a],
        [LENS_X, -a],
      ]);
      const b = imageDistance(f, gg);
      const clampY = (y: number) => clamp(y, -60, 60);
      if (b !== null && b > 0 && b < s) {
        const yb = rayY(t, b);
        poly([
          [LENS_X, a],
          [LENS_X, -a],
          [LENS_X + b, yb],
        ]);
        poly([
          [LENS_X + b, yb],
          [screenX, clampY(rayY(t, s))],
          [screenX, clampY(rayY(u, s))],
        ]);
      } else {
        poly([
          [LENS_X, a],
          [LENS_X, -a],
          [screenX, clampY(rayY(u, s))],
          [screenX, clampY(rayY(t, s))],
        ]);
      }
    }

    function drawScreen(x: number, sx: number, sy: number, railY: number, f: number, gg: number, a: number): void {
      const [px, pTop] = bench.toPx(x, SCREEN_H);
      const [, pBot] = bench.toPx(x, -SCREEN_H);
      rod(x, -SCREEN_H, railY, sx);
      const w = Math.max(5, 1.1 * sx);
      g.save();
      g.shadowColor = 'rgba(0,0,0,0.5)';
      g.shadowBlur = 6;
      const board = g.createLinearGradient(px, 0, px + w, 0);
      board.addColorStop(0, '#e9e4d8');
      board.addColorStop(1, '#a9a395');
      g.fillStyle = board;
      g.fillRect(px, pTop, w, pBot - pTop);
      g.restore();
      // beleuchtete Stellen auf der Vorderseite
      if (!p.cones) return;
      const s = x - LENS_X;
      for (const y0 of [p.gs / 2, -p.gs / 2]) {
        const t = rayThrough(f, gg, y0, a);
        const u = rayThrough(f, gg, y0, -a);
        const y1 = clamp(rayY(t, s), -SCREEN_H, SCREEN_H);
        const y2 = clamp(rayY(u, s), -SCREEN_H, SCREEN_H);
        const [, q1] = bench.toPx(x, Math.max(y1, y2));
        const [, q2] = bench.toPx(x, Math.min(y1, y2));
        g.fillStyle = y0 > 0 ? 'rgba(255,224,150,0.95)' : 'rgba(200,220,255,0.85)';
        g.fillRect(px - 1, q1 - 0.5, 2.5, Math.max(1.5, q2 - q1 + 1));
      }
      void sy;
    }

    /* ---------- Schirmbild (von vorn) ---------- */
    let sharpCanvas: HTMLCanvasElement | null = null;
    let blurCanvas: HTMLCanvasElement | null = null;
    let viewKey = '';

    /** Zeichnet das Schirmbild: scharfes Bild (Maßstab s/g, umgekehrt) gefaltet mit dem Unschärfekreis. */
    function renderScreenImage(n: number, f: number, gg: number, a: number, b: number | null): HTMLCanvasElement {
      const dpr = surface.dpr || 1;
      const N = Math.max(40, Math.round(n * dpr));
      const key = `${N}|${f}|${gg.toFixed(3)}|${p.gs}|${a}|${sNow.toFixed(3)}`;
      if (key === viewKey && blurCanvas) return blurCanvas;
      viewKey = key;
      if (!sharpCanvas) sharpCanvas = document.createElement('canvas');
      if (!blurCanvas) blurCanvas = document.createElement('canvas');
      for (const c of [sharpCanvas, blurCanvas]) {
        if (c.width !== N) {
          c.width = N;
          c.height = N;
        }
      }
      const pxPerCm = N / (2 * SCREEN_H);
      const m = screenScale(sNow, gg);
      const sc = sharpCanvas.getContext('2d')!;
      sc.setTransform(1, 0, 0, 1, 0, 0);
      sc.clearRect(0, 0, N, N);
      // Umgekehrtes Bild: Ein Punkt in der Höhe y landet bei −y · s/g. In Zeichenkoordinaten
      // (y nach unten) heißt das: die Kerze mit ihren Gegenstandshöhen direkt eintragen.
      sc.translate(N / 2, N / 2);
      sc.scale(pxPerCm * m, pxPerCm * m);
      const top = p.gs / 2;
      const flameH = Math.min(2.6, p.gs * 0.38);
      const bodyTop = top - flameH;
      const wBody = 1.8;
      // Körper (schwach von der Flamme beleuchtet)
      sc.fillStyle = 'rgba(255,214,160,0.34)';
      sc.fillRect(-wBody / 2, -top, wBody, top + bodyTop);
      // Flamme (hell) – im Schirmbild unten
      const fl = sc.createLinearGradient(0, bodyTop, 0, top);
      fl.addColorStop(0, 'rgba(255,170,70,1)');
      fl.addColorStop(0.5, 'rgba(255,230,150,1)');
      fl.addColorStop(1, 'rgba(255,250,215,1)');
      sc.fillStyle = fl;
      const fw = 0.55;
      sc.beginPath();
      sc.moveTo(0, top);
      sc.bezierCurveTo(fw * 0.9, top - flameH * 0.45, fw, bodyTop + flameH * 0.05, 0, bodyTop);
      sc.bezierCurveTo(-fw, bodyTop + flameH * 0.05, -fw * 0.9, top - flameH * 0.45, 0, top);
      sc.fill();
      // Unschärfe: Überlagerung vieler verschobener Kopien (Kreisscheibe)
      const bc = blurCanvas.getContext('2d')!;
      bc.setTransform(1, 0, 0, 1, 0, 0);
      bc.clearRect(0, 0, N, N);
      const r = blurRadius(a, sNow, b) * pxPerCm;
      bc.globalCompositeOperation = 'lighter';
      // Helligkeit wächst mit der Blendenfläche
      const bright = clamp(0.35 + 0.65 * (a / 3) ** 2, 0.3, 1.2);
      if (r < 0.7) {
        bc.globalAlpha = Math.min(1, bright);
        bc.drawImage(sharpCanvas, 0, 0);
      } else {
        const K = Math.round(clamp(10 + r * 1.2, 12, 56));
        bc.globalAlpha = (bright * 1.15) / K;
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let k = 0; k < K; k++) {
          const rr = r * Math.sqrt((k + 0.5) / K);
          const th = k * golden;
          bc.drawImage(sharpCanvas, rr * Math.cos(th), rr * Math.sin(th));
        }
      }
      bc.globalAlpha = 1;
      bc.globalCompositeOperation = 'source-over';
      return blurCanvas;
    }

    function drawScreenView(r: Rect, f: number, gg: number, a: number, b: number | null): void {
      const theme = ctx.theme;
      const small = narrow();
      const top = card(r, ctx.t('front'));
      const capH = 26;
      const n = Math.floor(Math.min(r.w - 28, r.y + r.h - top - capH - 6));
      const vx = r.x + (r.w - n) / 2;
      const vy = top;
      // Schirm im dunklen Raum
      g.save();
      softShadow(g, theme.dark, 8, 2);
      const paper = g.createLinearGradient(vx, vy, vx + n, vy + n);
      paper.addColorStop(0, '#2a2a2c');
      paper.addColorStop(1, '#1d1d20');
      g.fillStyle = paper;
      g.fillRect(vx, vy, n, n);
      g.restore();
      const img = renderScreenImage(n, f, gg, a, b);
      g.save();
      g.beginPath();
      g.rect(vx, vy, n, n);
      g.clip();
      g.globalCompositeOperation = 'lighter';
      g.drawImage(img, vx, vy, n, n);
      g.restore();
      // Achsenkreuz
      g.save();
      g.strokeStyle = 'rgba(200,200,210,0.18)';
      g.setLineDash([3, 4]);
      g.beginPath();
      g.moveTo(vx + n / 2, vy);
      g.lineTo(vx + n / 2, vy + n);
      g.moveTo(vx, vy + n / 2);
      g.lineTo(vx + n, vy + n / 2);
      g.stroke();
      g.restore();
      // Unterschrift: scharf / unscharf
      const sharp = isSharp(a, sNow, b);
      const real = b !== null && b > 0;
      const cy = vy + n + capH / 2 + 2;
      if (sharp) pill(`✓ ${ctx.t('sharp')}`, r.x + r.w / 2, cy, theme.series[2]!, { size: small ? 11 : 12, solid: true });
      else text(g, ctx.t(real ? 'blurry' : 'noReal'), r.x + r.w / 2, cy, { font: `600 ${small ? 11 : 12}px ${theme.font}`, color: theme.muted });
    }

    /** Bereich des Diagramms „Unschärfe über s“ in der rechten Hälfte der Karte (nur auf breiten Bildschirmen). */
    function blurRect(w = surface.width, h = surface.height): Rect | null {
      if (w < 640 || !p.dia) return null;
      const { info } = benchRegions(w, h);
      const cw = Math.round(info.w * 0.47);
      return { x: info.x + info.w - cw - 8, y: info.y + 30, w: cw, h: info.h - 38 };
    }

    function drawFocusCard(r: Rect, f: number, gg: number, a: number, b: number | null): void {
      const theme = ctx.theme;
      const small = narrow();
      let y = card(r, ctx.t('focusTitle'));
      const chartR = blurRect();
      const x = r.x + 14;
      const w = (chartR ? chartR.x - 16 : r.x + r.w - 14) - x;
      const real = b !== null && b > 0;
      const sharp = isSharp(a, sNow, b);
      const blur = blurRadius(a, sNow, b);
      // Unschärfe-Anzeige (nur, wenn es ein reelles Bild gibt)
      const k = real ? clamp(1 - Math.log10(1 + blur * 6) / Math.log10(1 + 4 * 6), 0, 1) : 0;
      const barH = 8;
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
      roundRect(g, x, y + 2, w, barH, 4);
      g.fill();
      const col = sharp ? theme.series[2]! : theme.series[3]!;
      if (real) {
        g.fillStyle = col;
        roundRect(g, x, y + 2, Math.max(barH, w * k), barH, 4);
        g.fill();
      }
      y += barH + 16;
      text(g, real ? tr('blurText', { d: fmt.num(20 * blur, 1) }) : ctx.t('noReal'), x, y, { font: `600 ${small ? 11 : 12}px ${theme.font}`, color: theme.muted, align: 'left' });
      y += small ? 18 : 22;
      // Erklärung
      let msg: string;
      if (!real) msg = ctx.t('tInside');
      else if (sharp) msg = ctx.t(Math.abs(sNow - b!) < 0.3 ? 'tSharp' : 'tSharpDof');
      else if (b! > S_MAX) msg = tr('tFar', { b: fmt.num(b!, 0) });
      else msg = ctx.t(sNow < b! ? 'tFront' : 'tBack');
      const font = `500 ${small ? 11.5 : 12.5}px ${theme.font}`;
      const lh = small ? 15 : 17;
      const lines = wrap(msg, w, font);
      const avail = Math.floor((r.y + r.h - 12 - y) / lh);
      lines.slice(0, Math.max(1, avail)).forEach((ln, i) => text(g, ln, x, y + i * lh, { font, color: sharp ? theme.series[2]! : theme.text, align: 'left' }));
      y += Math.min(lines.length, avail) * lh + 6;
      // Eigenschaften des scharfen Bildes bzw. Hinweis zur Blende
      if (y + 26 < r.y + r.h - 8 && real && sharp) {
        const info = describeImage(f, gg, p.gs);
        let cx = x;
        const size = small ? 11 : 12;
        for (const [str, c] of [
          [ctx.t('kReal'), theme.series[1]!],
          [ctx.t('oInv'), theme.series[2]!],
          [ctx.t(info.size === 'larger' ? 'sLarger' : info.size === 'smaller' ? 'sSmaller' : 'sSame'), theme.series[0]!],
        ] as [string, string][]) {
          g.font = `700 ${size}px ${theme.font}`;
          const pw = g.measureText(str).width + 16;
          if (cx + pw > x + w) break;
          pill(str, cx, y + 8, c, { size, align: 'left' });
          cx += pw + 6;
        }
      } else if (y + lh < r.y + r.h - 8 && real) {
        wrap(ctx.t('tAperture'), w, font).forEach((ln, i) => {
          if (y + i * lh < r.y + r.h - 10) text(g, ln, x, y + i * lh, { font, color: theme.muted, align: 'left' });
        });
      }
      if (chartR) drawBlurChart(chartR, a, b);
    }

    /** Diagramm: Durchmesser des Unschärfekreises (mm) über dem Schirmabstand s. */
    function drawBlurChart(r: Rect, a: number, b: number | null): void {
      const theme = ctx.theme;
      text(g, ctx.t('blurChart'), r.x + 6, r.y - 10, { font: `700 12px ${theme.font}`, color: theme.text, align: 'left' });
      blurPlot.setRangePadded([0, S_MAX], [0, 40], { left: 32, bottom: 22, top: 12, right: 14 });
      blurPlot.begin();
      const cr = blurPlot.rect;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      g.fillRect(cr.x, cr.y, cr.w, cr.h);
      blurPlot.grid();
      // Bereich „scharf genug“ (Unschärfekreis bis 3 mm)
      blurPlot.polygon(
        [
          [0, 0],
          [S_MAX, 0],
          [S_MAX, 3],
          [0, 3],
        ],
        { fill: theme.series[2]!, alpha: 0.16 },
      );
      blurPlot.axes();
      blurPlot.fn((s) => Math.min(60, 20 * blurRadius(a, s, b)), { color: theme.series[3]!, width: 2.4, from: 2, to: S_MAX });
      const d = 20 * blurRadius(a, sNow, b);
      blurPlot.segment([sNow, 0], [sNow, Math.min(40, d)], { color: theme.series[5]!, width: 1.6, dash: [4, 4] });
      if (d <= 40) blurPlot.point(sNow, d, { color: theme.series[5]!, radius: 5 });
      blurPlot.end();
    }

    return {
      update(changed, source) {
        if (changed.has('g') || source !== 'sim') gNow = p.g;
        if (changed.has('s') || source !== 'sim') {
          if (!focusPending) sNow = p.s;
        }
        if (changed.has('lt')) {
          const target = p.lt === 'zer' ? -1 : 1;
          if (source === 'init') shape = target;
          else if (target !== shape) {
            shapeFrom = shapeTw.running ? lerp(shapeFrom, shape, shapeTw.value) : shape;
            shape = target;
            shapeTw.play();
          }
        }
        if (changed.has('mode') && source !== 'init') {
          if (ctx.clock.playing) ctx.clock.pause();
          fade.play();
        }
        updateReadouts();
      },

      action(id) {
        if (ctx.locked || mode() !== 'bench' || id !== 'focus') return;
        const b = imageDistance(p.f, gNow);
        if (b === null || b <= 0 || b > S_MAX) {
          hint = ctx.t('tooFar');
          hintUntil = performance.now() + 2600;
          ctx.requestRender();
          return;
        }
        if (ctx.clock.playing) ctx.clock.pause();
        focusFrom = sNow;
        focusTo = clamp(Math.round(b * 2) / 2, 2, S_MAX);
        focusPending = true;
        focusTw.play();
        ctx.requestRender();
      },

      tick(dt) {
        gNow += gDir * 4 * dt;
        if (gNow <= 2) [gNow, gDir] = [2, 1];
        if (gNow >= 50) [gNow, gDir] = [50, -1];
        updateReadouts();
      },

      resetTime() {
        gNow = p.g;
        updateReadouts();
      },

      render() {
        conPlot.resize();
        bench.resize();
        blurPlot.resize();
        if (focusPending) {
          sNow = focusTw.running ? lerp(focusFrom, focusTo, focusTw.value) : focusTo;
          if (!focusTw.running) {
            focusPending = false;
            ctx.set({ s: focusTo });
          } else updateReadouts();
        }
        surface.begin();
        if (mode() === 'con') drawCon();
        else drawBench();
        if (fade.running) {
          g.fillStyle = withAlpha(ctx.theme.bg, 1 - fade.value);
          g.fillRect(0, 0, surface.width, surface.height);
        }
        if (fade.running || shapeTw.running || focusTw.running || focusPending) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});

