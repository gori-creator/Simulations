import { defineSimulation, ease, Plot, pointInPolygon, prefersReducedMotion, roundRect, softShadow, Surface, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import { blurRadius, focalFor, imageCase, lensImage, refractSlope, type CaseId, type LensImage } from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'con' | 'bundle';
type App = 'none' | 'loupe' | 'camera' | 'projector' | 'eye';
type V2 = [number, number];

/** Halbe Höhe der gezeichneten Linse und Radius des Lichtbündels in cm. */
const LENS_H = 12;
const APERTURE = 11;
/** Halbe Höhe des Schirms in cm. */
const SCREEN_H = 17;
/** Bildweite im (vergrößert gezeichneten) Auge: Abstand Linse – Netzhaut in cm. */
const EYE_B = 10;

/** Leuchtpfeil (Gegenstand im Schirmbild), Höhe 1, Fuß im Ursprung. */
const ARROW_SHAPE: V2[] = [
  [-0.09, 0],
  [0.09, 0],
  [0.09, 0.62],
  [0.26, 0.62],
  [0, 1],
  [-0.26, 0.62],
  [-0.09, 0.62],
];

/**
 * Linsen und Bildentstehung: Gegenstand, Sammel- oder Zerstreuungslinse mit
 * Brennpunkten, Konstruktionsstrahlen und Bild; Linsengleichung und
 * Abbildungsmaßstab; Lichtbündel auf einem Schirm (scharf/unscharf) und
 * Anwendungen wie Lupe, Projektor, Kamera und Auge.
 */
export default defineSimulation({
  id: 'linsen',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Darstellung', 'View'),
      options: [
        { value: 'con', label: L('Bildkonstruktion', 'Ray construction') },
        { value: 'bundle', label: L('Lichtbündel und Schirm', 'Light beam and screen') },
      ],
      default: 'con',
    },
    {
      key: 'typ',
      type: 'choice',
      label: L('Linse', 'Lens'),
      options: [
        { value: 'conv', label: L('Sammellinse', 'Converging lens') },
        { value: 'div', label: L('Zerstreuungslinse', 'Diverging lens') },
      ],
      default: 'conv',
      visibleIf: (v) => v.app !== 'eye',
    },
    {
      key: 'f',
      type: 'number',
      label: L('Brennweite f', 'Focal length f'),
      help: L('Oder den Brennpunkt F′ auf der Achse ziehen.', 'Or drag the focal point F′ along the axis.'),
      min: 2,
      max: 25,
      step: 0.5,
      default: 10,
      unit: 'cm',
      visibleIf: (v) => v.app !== 'eye',
    },
    { key: 'g', type: 'number', label: L('Gegenstandsweite g', 'Object distance g'), help: L('Oder die Pfeilspitze ziehen.', 'Or drag the tip of the arrow.'), min: 1, max: 50, step: 0.5, default: 25, unit: 'cm' },
    { key: 'h', type: 'number', label: L('Gegenstandsgröße G', 'Object size G'), min: 1, max: 12, step: 0.5, default: 5, unit: 'cm' },
    { key: 's', type: 'number', label: L('Abstand Linse – Schirm', 'Distance lens – screen'), help: L('Oder den Schirm ziehen, bis das Bild scharf ist.', 'Or drag the screen until the image is sharp.'), min: 1, max: 60, step: 0.5, default: 20, unit: 'cm', visibleIf: (v) => v.mode === 'bundle' && v.app !== 'eye' },
    {
      key: 'app',
      type: 'choice',
      label: L('Anwendung', 'Application'),
      options: [
        { value: 'none', label: L('keine', 'none') },
        { value: 'loupe', label: L('Lupe', 'Magnifier') },
        { value: 'camera', label: L('Kamera', 'Camera') },
        { value: 'projector', label: L('Projektor', 'Projector') },
        { value: 'eye', label: L('Auge', 'Eye') },
      ],
      default: 'none',
    },
    { key: 'rays', type: 'boolean', group: 'view', label: L('Konstruktionsstrahlen', 'Construction rays'), default: true, visibleIf: (v) => v.mode === 'con' },
    { key: 'f2', type: 'boolean', group: 'view', label: L('Doppelte Brennweite 2F markieren', 'Mark twice the focal length 2F'), default: true },
    { key: 'ruler', type: 'boolean', group: 'view', label: L('Zentimeterskala', 'Centimetre scale'), default: true },
  ],
  readouts: [
    { key: 'eq', label: L('Linsengleichung', 'Lens equation'), spoiler: true },
    { key: 'img', label: L('Bild', 'Image'), spoiler: true },
    { key: 'mag', label: L('Abbildungsmaßstab', 'Magnification'), spoiler: true },
    { key: 'sharp', label: L('Schirm', 'Screen'), spoiler: true },
    { key: 'acc', label: L('Augenlinse', 'Eye lens') },
  ],
  presets: [
    { id: 'start', label: L('Sammellinse', 'Converging lens'), values: {} },
    { id: 'loupe', label: L('Lupe', 'Magnifier'), values: { app: 'loupe', g: 6, h: 3 } },
    { id: 'projector', label: L('Projektor', 'Projector'), values: { app: 'projector', mode: 'bundle', g: 13, h: 3, s: 43.5 } },
    { id: 'camera', label: L('Kamera', 'Camera'), values: { app: 'camera', mode: 'bundle', g: 45, f: 8, h: 10, s: 9.5 } },
    { id: 'eye', label: L('Auge', 'Eye'), values: { app: 'eye', g: 40, h: 8 } },
    { id: 'div', label: L('Zerstreuungslinse', 'Diverging lens'), values: { typ: 'div', g: 20 } },
  ],
  strings: {
    de: {
      canvas: 'Optische Achse mit Linse, Brennpunkten, Gegenstand und Bild, Konstruktionsstrahlen oder Lichtbündel auf einem Schirm',
      object: 'Gegenstand G',
      image: 'Bild B',
      virtualImage: 'virtuelles Bild',
      noImage: 'kein Bild – die Strahlen verlaufen parallel',
      offView: 'Bild außerhalb (b ≈ {b} cm)',
      lens: 'Linse',
      screen: 'Schirm',
      legend: 'Konstruktionsstrahlen',
      rayPar: 'Parallelstrahl → Brennpunktstrahl',
      rayMid: 'Mittelpunktstrahl (geht gerade durch)',
      rayFoc: 'Brennpunktstrahl → Parallelstrahl',
      rayParDiv: 'Parallelstrahl → scheinbar von F′',
      rayFocDiv: 'auf F gerichtet → Parallelstrahl',
      dashed: 'gestrichelt: rückwärts verlängert (virtuell)',
      cases: 'Bildeigenschaften',
      c_far: 'g > 2f',
      c_twoF: 'g = 2f',
      c_between: 'f < g < 2f',
      c_focus: 'g = f',
      c_inside: 'g < f',
      c_diverging: 'Zerstreuungslinse',
      p_far: 'reell · umgekehrt · verkleinert',
      p_twoF: 'reell · umgekehrt · gleich groß',
      p_between: 'reell · umgekehrt · vergrößert',
      p_focus: 'kein Bild',
      p_inside: 'virtuell · aufrecht · vergrößert',
      p_diverging: 'virtuell · aufrecht · verkleinert',
      e_far: 'Kamera, Auge',
      e_twoF: '',
      e_between: 'Projektor',
      e_focus: 'Scheinwerfer',
      e_inside: 'Lupe',
      e_diverging: 'Brille bei Kurzsichtigkeit',
      screenView: 'Bild auf dem Schirm',
      sharp: 'scharf',
      blurry: 'unscharf',
      noScreenImage: 'Auf dem Schirm entsteht kein Bild – nur ein heller Fleck.',
      sharpText: 'Das Bild ist scharf: Der Schirm steht genau in der Bildweite b.',
      nearText: 'unscharf: Der Schirm steht {d} cm zu nah an der Linse (b ≈ {b} cm).',
      farText: 'unscharf: Der Schirm steht {d} cm zu weit von der Linse entfernt (b ≈ {b} cm).',
      virtText: 'Das Bild ist virtuell – es lässt sich mit keinem Schirm auffangen.',
      eqText: '1/f = 1/g + 1/b',
      imgReal: 'B ≈ {B} cm, reell, {orient}, {size}',
      imgVirtual: 'B ≈ {B} cm, virtuell, {orient}, {size} (b ≈ {b} cm: auf der Seite des Gegenstands)',
      imgNone: 'Kein Bild: g = f, die Strahlen verlaufen hinter der Linse parallel.',
      upright: 'aufrecht',
      inverted: 'umgekehrt',
      bigger: 'vergrößert',
      smaller: 'verkleinert',
      same: 'gleich groß',
      accText: 'f ≈ {f} cm – die Linse krümmt sich so, dass das Bild immer auf der Netzhaut ({b} cm hinter der Linse) liegt (Akkommodation).',
      retina: 'Netzhaut',
      eyeLens: 'Augenlinse',
      sensor: 'Bildsensor',
      lamp: 'Lampe',
      slide: 'Dia',
      viewer: 'Auge',
      loupeText: 'Das Auge sieht ein vergrößertes, aufrechtes Bild.',
      nearShort: 'Unscharf: Schiebe den Schirm weiter von der Linse weg.',
      screenTip: 'Ist das Bild scharf, ist der Abstand Linse – Schirm genau die Bildweite b.',
      eyeHint: 'Das Bild liegt immer auf der Netzhaut: Die Augenlinse passt ihre Brennweite an.',
      divNote: 'Eine Zerstreuungslinse erzeugt immer ein virtuelles, aufrechtes und verkleinertes Bild – egal, wo der Gegenstand steht. Das Bild liegt zwischen F′ und der Linse.',
      span: 'Ausschnitt {w} cm breit',
      farShort: 'Unscharf: Schiebe den Schirm näher an die Linse.',
    },
    en: {
      canvas: 'Optical axis with a lens, focal points, object and image, construction rays or a beam of light on a screen',
      object: 'Object G',
      image: 'Image B',
      virtualImage: 'virtual image',
      noImage: 'no image – the rays leave parallel',
      offView: 'Image out of view (b ≈ {b} cm)',
      lens: 'Lens',
      screen: 'Screen',
      legend: 'Construction rays',
      rayPar: 'parallel ray → focal ray',
      rayMid: 'central ray (goes straight through)',
      rayFoc: 'focal ray → parallel ray',
      rayParDiv: 'parallel ray → seems to come from F′',
      rayFocDiv: 'aimed at F → parallel ray',
      dashed: 'dashed: traced back (virtual)',
      cases: 'Image properties',
      c_far: 'g > 2f',
      c_twoF: 'g = 2f',
      c_between: 'f < g < 2f',
      c_focus: 'g = f',
      c_inside: 'g < f',
      c_diverging: 'Diverging lens',
      p_far: 'real · inverted · smaller',
      p_twoF: 'real · inverted · same size',
      p_between: 'real · inverted · larger',
      p_focus: 'no image',
      p_inside: 'virtual · upright · larger',
      p_diverging: 'virtual · upright · smaller',
      e_far: 'camera, eye',
      e_twoF: '',
      e_between: 'projector',
      e_focus: 'spotlight',
      e_inside: 'magnifier',
      e_diverging: 'glasses for short sight',
      screenView: 'Image on the screen',
      sharp: 'sharp',
      blurry: 'blurred',
      noScreenImage: 'No image forms on the screen – only a bright patch.',
      sharpText: 'The image is sharp: the screen is exactly at the image distance b.',
      nearText: 'blurred: the screen is {d} cm too close to the lens (b ≈ {b} cm).',
      farText: 'blurred: the screen is {d} cm too far from the lens (b ≈ {b} cm).',
      virtText: 'The image is virtual – no screen can catch it.',
      eqText: '1/f = 1/g + 1/b',
      imgReal: 'B ≈ {B} cm, real, {orient}, {size}',
      imgVirtual: 'B ≈ {B} cm, virtual, {orient}, {size} (b ≈ {b} cm: on the side of the object)',
      imgNone: 'No image: g = f, the rays leave the lens parallel.',
      upright: 'upright',
      inverted: 'inverted',
      bigger: 'larger',
      smaller: 'smaller',
      same: 'same size',
      accText: 'f ≈ {f} cm – the lens changes its shape so that the image always lies on the retina ({b} cm behind the lens) (accommodation).',
      retina: 'Retina',
      eyeLens: 'Eye lens',
      sensor: 'Image sensor',
      lamp: 'Lamp',
      slide: 'Slide',
      viewer: 'Eye',
      loupeText: 'The eye sees a larger, upright image.',
      nearShort: 'Blurred: move the screen away from the lens.',
      screenTip: 'When the image is sharp, the distance lens – screen equals the image distance b.',
      eyeHint: 'The image always lies on the retina: the eye lens adjusts its focal length.',
      divNote: 'A diverging lens always forms a virtual, upright, smaller image – wherever the object is. The image lies between F′ and the lens.',
      span: 'Section {w} cm wide',
      farShort: 'Blurred: move the screen closer to the lens.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const tr = (key: string, vars: Record<string, string>) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
    const narrow = () => surface.width < 640;
    const mode = () => p.mode as Mode;
    const app = () => p.app as App;
    const g = surface.g;

    /* ---------- Zustand ---------- */
    let objG = p.g;
    let objDir = -1;
    const fade = new Tween(380, ease.outCubic);
    const lensMorph = new Tween(450, ease.inOutCubic);
    let lensFrom = 0;
    let lensK = 1;

    /** Brennweite mit Vorzeichen (beim Auge aus g und der Netzhaut berechnet). */
    const fSigned = () => (app() === 'eye' ? focalFor(objG, EYE_B) : p.typ === 'div' ? -p.f : p.f);
    const image = (): LensImage => lensImage(fSigned(), objG, p.h);
    const screenX = () => (app() === 'eye' ? EYE_B : p.s);
    /** Scharf, wenn der Schirm (mit der Schrittweite 0,5 cm) so nah wie möglich an der Bildweite steht. */
    const isSharp = (img: LensImage) => img.real && Math.abs(screenX() - img.b) <= 0.25 + 1e-9;

    /* ---------- Bereiche ---------- */
    function regions(w = surface.width, h = surface.height): { scene: Rect; side: Rect | null; row: Rect } {
      if (w >= 640) {
        const sh = Math.round(h * 0.66);
        const row = { x: 0, y: sh + 10, w, h: h - sh - 10 };
        if (mode() !== 'bundle') return { scene: { x: 0, y: 0, w, h: sh }, side: null, row };
        const sw = Math.round(Math.min(240, Math.max(190, w * 0.25)));
        return { scene: { x: 0, y: 0, w: w - sw - 12, h: sh }, side: { x: w - sw, y: 0, w: sw, h: sh }, row };
      }
      const sh = Math.round(w * 0.62);
      return { scene: { x: 0, y: 0, w, h: sh }, side: null, row: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }
    const plot = new Plot(surface, { x: [-55, 60], y: [-22, 22], pan: false, zoom: false, controls: false, region: (w, h) => regions(w, h).scene });
    /** Schmale Bildschirme: Ausschnitt passt sich (in Stufen und weich) dem Inhalt an. */
    let viewHalf = 40;
    function targetHalf(): number {
      const img = image();
      const fa = Math.abs(fSigned());
      let need = Math.max(objG + 4, (p.f2 ? 2 * fa : fa) + 4, mode() === 'bundle' ? screenX() + 4 : 0);
      if (!img.none && Math.abs(img.b) < 52) need = Math.max(need, Math.abs(img.b) + 4);
      if (app() === 'eye') need = Math.max(need, EYE_B + 6);
      return Math.min(52, Math.max(24, Math.ceil(need / 8) * 8));
    }
    function fit(): void {
      const r = plot.rect;
      if (narrow()) {
        const t = targetHalf();
        if (Math.abs(t - viewHalf) > 0.05) {
          viewHalf += (t - viewHalf) * (prefersReducedMotion() ? 1 : 0.18);
          ctx.requestRender();
        } else viewHalf = t;
      }
      const [x0, x1] = narrow() ? [-viewHalf, viewHalf] : mode() === 'bundle' ? [-52, 47] : [-53, 52];
      const s = Math.min(r.w / (x1 - x0), r.h / 38);
      const xw = r.w / s;
      const yh = r.h / s;
      const xc = (x0 + x1) / 2;
      plot.setRange([xc - xw / 2, xc + xw / 2], [-yh / 2 - 1.5, yh / 2 - 1.5]);
    }

    /* ---------- Ziehen ---------- */
    const stop = () => {
      if (ctx.clock.playing) ctx.clock.pause();
    };
    plot.addHandle({
      get: () => [-objG, p.h],
      set: (x, y) => {
        stop();
        ctx.set({ g: Math.round(-x * 2) / 2, h: Math.round(y * 2) / 2 });
      },
      enabled: () => !ctx.locked,
      color: () => ctx.theme.series[0]!,
    });
    plot.addHandle({
      get: () => [p.f, 0],
      set: (x) => {
        stop();
        ctx.set({ f: Math.round(Math.abs(x) * 2) / 2 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && app() !== 'eye',
      color: () => ctx.theme.series[4]!,
    });
    plot.addHandle({
      get: () => [p.s, -SCREEN_H + 3],
      set: (x) => {
        stop();
        ctx.set({ s: Math.round(x * 2) / 2 });
      },
      axis: 'x',
      enabled: () => !ctx.locked && mode() === 'bundle' && app() !== 'eye',
      color: () => ctx.theme.series[5]!,
    });

    ctx.clock.onChange((playing) => {
      if (!playing && Math.round(objG * 2) / 2 !== p.g) ctx.set({ g: Math.round(objG * 2) / 2 });
    });

    /* ---------- Ergebnisse ---------- */
    const v = (s: string) => `<var>${s}</var>`;
    const frac = (a: string, b: string) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;
    const n1 = (x: number) => fmt.num(x, 1);
    const n2 = (x: number) => fmt.num(x, 2);

    function sizeWord(img: LensImage): string {
      if (Math.abs(img.scale - 1) < 0.005) return ctx.t('same');
      return ctx.t(img.scale > 1 ? 'bigger' : 'smaller');
    }

    function updateReadouts(): void {
      const f = fSigned();
      const gg = objG;
      const img = image();
      if (img.none) {
        ctx.readout('eq', { html: `${v('b')} = ${frac(`${v('f')} · ${v('g')}`, `${v('g')} − ${v('f')}`)}: ${v('g')} − ${v('f')} = 0 → ${lang() === 'de' ? 'kein Bild' : 'no image'}` });
        ctx.readout('img', ctx.t('imgNone'));
        ctx.readout('mag', null);
      } else {
        ctx.readout('eq', {
          html:
            `${frac('1', v('f'))} = ${frac('1', v('g'))} + ${frac('1', v('b'))} &nbsp;⇒&nbsp; ${v('b')} = ${frac(`${v('f')} · ${v('g')}`, `${v('g')} − ${v('f')}`)} = ${frac(`${n1(f)} cm · ${n1(gg)} cm`, `${n1(gg)} cm − ${f < 0 ? `(${n1(f)} cm)` : `${n1(f)} cm`}`)} ≈ ${n1(img.b)} cm`,
        });
        const vars = { B: n1(Math.abs(img.B)), b: n1(img.b), orient: ctx.t(img.inverted ? 'inverted' : 'upright'), size: sizeWord(img) };
        ctx.readout('img', tr(img.real ? 'imgReal' : 'imgVirtual', vars));
        ctx.readout('mag', { html: `${v('A')} = ${frac(v('B'), v('G'))} = ${frac(`|${v('b')}|`, v('g'))} = ${frac(`${n1(Math.abs(img.b))} cm`, `${n1(gg)} cm`)} ≈ ${n2(img.scale)}` });
      }
      if (mode() === 'bundle' && app() !== 'eye') {
        if (img.none || !img.real) ctx.readout('sharp', ctx.t(img.none ? 'noScreenImage' : 'virtText'));
        else {
          const d = p.s - img.b;
          ctx.readout('sharp', isSharp(img) ? ctx.t('sharpText') : tr(d < 0 ? 'nearText' : 'farText', { d: n1(Math.abs(d)), b: n1(img.b) }));
        }
      } else ctx.readout('sharp', null);
      ctx.readout('acc', app() === 'eye' ? tr('accText', { f: n2(f), b: fmt.num(EYE_B, 0) }) : null);
    }
    const lang = () => ctx.lang;

    /* ---------- Zeichenhilfen ---------- */
    function label(str: string, x: number, y: number, opts: { size?: number; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; weight?: number; italic?: boolean } = {}): void {
      const size = opts.size ?? 12;
      g.font = `${opts.italic ? 'italic ' : ''}${opts.weight ?? 700} ${size}px ${opts.italic ? ctx.theme.mathFont : ctx.theme.font}`;
      g.textAlign = opts.align ?? 'center';
      g.textBaseline = opts.baseline ?? 'middle';
      g.lineJoin = 'round';
      g.lineWidth = 3.5;
      g.strokeStyle = ctx.theme.bg;
      g.strokeText(str, x, y);
      g.fillStyle = opts.color ?? ctx.theme.text;
      g.fillText(str, x, y);
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

    /** Strecke in Weltkoordinaten (mit Pfeil in der Mitte, optional gestrichelt). */
    function seg(a: V2, b: V2, color: string, opts: { dash?: boolean; width?: number; alpha?: number; arrow?: boolean } = {}): void {
      const [ax, ay] = plot.toPx(a[0], a[1]);
      const [bx, by] = plot.toPx(b[0], b[1]);
      g.save();
      g.strokeStyle = color;
      g.globalAlpha = opts.alpha ?? 1;
      g.lineWidth = opts.width ?? (opts.dash ? 1.5 : 2.2);
      g.lineCap = 'round';
      g.setLineDash(opts.dash ? [6, 5] : []);
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.stroke();
      g.restore();
      const len = Math.hypot(bx - ax, by - ay);
      if (opts.arrow && len > 40) {
        // Pfeil im sichtbaren Teil
        const r = plot.rect;
        let t = 0.5;
        const mx = ax + (bx - ax) * t;
        const my = ay + (by - ay) * t;
        if (mx < r.x || mx > r.x + r.w || my < r.y || my > r.y + r.h) t = 0.25;
        arrowHead(ax + (bx - ax) * t, ay + (by - ay) * t, Math.atan2(by - ay, bx - ax), 9, color);
      }
    }

    /** Pfeil (Gegenstand oder Bild) von (x | 0) bis (x | hgt). */
    function arrowObj(x: number, hgt: number, color: string, opts: { dashed?: boolean; alpha?: number; width?: number } = {}): void {
      const [px, p0] = plot.toPx(x, 0);
      const [, p1] = plot.toPx(x, hgt);
      const dir = Math.sign(p1 - p0) || 1;
      const head = Math.min(12, Math.abs(p1 - p0) * 0.45);
      g.save();
      g.globalAlpha = opts.alpha ?? 1;
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = opts.width ?? 3.2;
      g.lineCap = 'round';
      g.setLineDash(opts.dashed ? [5, 4] : []);
      g.beginPath();
      g.moveTo(px, p0);
      g.lineTo(px, p1 - dir * head * 0.6);
      g.stroke();
      g.setLineDash([]);
      g.beginPath();
      g.moveTo(px, p1);
      g.lineTo(px - head * 0.55, p1 - dir * head);
      g.lineTo(px + head * 0.55, p1 - dir * head);
      g.closePath();
      if (opts.dashed) {
        g.lineWidth = 1.6;
        g.stroke();
        g.globalAlpha = (opts.alpha ?? 1) * 0.25;
        g.fill();
      } else g.fill();
      g.restore();
    }

    /* ---------- Szene ---------- */
    function drawBackground(r: Rect): void {
      const dark = ctx.theme.dark;
      const bg = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      bg.addColorStop(0, dark ? '#131a25' : '#f5f8fb');
      bg.addColorStop(1, dark ? '#0f151e' : '#e9eef4');
      g.fillStyle = bg;
      g.fillRect(r.x, r.y, r.w, r.h);
    }

    function drawAxis(r: Rect): void {
      const theme = ctx.theme;
      const [, ay] = plot.toPx(0, 0);
      g.strokeStyle = withAlpha(theme.text, 0.7);
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(r.x, ay);
      g.lineTo(r.x + r.w, ay);
      g.stroke();
      if (p.ruler) {
        const b = plot.bounds;
        g.strokeStyle = withAlpha(theme.text, 0.45);
        for (let c = Math.ceil(b.xMin); c <= b.xMax; c++) {
          const [x] = plot.toPx(c, 0);
          const len = c % 10 === 0 ? 7 : c % 5 === 0 ? 4.5 : 2.5;
          if (narrow() && c % 5 !== 0) continue;
          g.lineWidth = c % 10 === 0 ? 1.2 : 0.8;
          g.beginPath();
          g.moveTo(x, ay);
          g.lineTo(x, ay + len);
          g.stroke();
          if (c % (narrow() ? 20 : 10) === 0 && c !== 0 && x > r.x + 14 && x < r.x + r.w - 14) text(g, String(c), x, ay + 16, { font: `500 10.5px ${theme.font}`, color: theme.muted });
        }
      }
    }

    /** Linse als Glaskörper; die Dicke hängt von der Brennweite ab. */
    function drawLens(f: number): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const s = plot.scale.x;
      const [cx, cy] = plot.toPx(0, 0);
      const hh = LENS_H * s;
      const morph = lensMorph.running ? lensMorph.value : 1;
      const strength = clampN((1 / Math.max(2, Math.abs(f))) * 14, 0.45, 3.4);
      const target = f >= 0 ? strength : -strength;
      const k = lensFrom + (target - lensFrom) * morph;
      lensK = k;
      const half = Math.abs(k) * 0.55 * s + 1.5; // halbe Dicke in der Mitte bzw. am Rand
      const edge = 1.2 * s * 0.35 + 1;
      g.save();
      softShadow(g, dark, 10, 2);
      const glass = g.createLinearGradient(cx - half - edge, 0, cx + half + edge, 0);
      glass.addColorStop(0, dark ? 'rgba(120,200,235,0.30)' : 'rgba(120,190,230,0.35)');
      glass.addColorStop(0.5, dark ? 'rgba(190,235,255,0.20)' : 'rgba(225,245,255,0.55)');
      glass.addColorStop(1, dark ? 'rgba(120,200,235,0.30)' : 'rgba(120,190,230,0.35)');
      g.fillStyle = glass;
      g.beginPath();
      if (k >= 0) {
        // Sammellinse: in der Mitte dick
        g.moveTo(cx - edge, cy - hh);
        g.quadraticCurveTo(cx - edge - 2 * half, cy, cx - edge, cy + hh);
        g.lineTo(cx + edge, cy + hh);
        g.quadraticCurveTo(cx + edge + 2 * half, cy, cx + edge, cy - hh);
      } else {
        // Zerstreuungslinse: am Rand dick
        g.moveTo(cx - edge - half, cy - hh);
        g.quadraticCurveTo(cx - edge + half, cy, cx - edge - half, cy + hh);
        g.lineTo(cx + edge + half, cy + hh);
        g.quadraticCurveTo(cx + edge - half, cy, cx + edge + half, cy - hh);
      }
      g.closePath();
      g.fill();
      g.restore();
      g.strokeStyle = dark ? 'rgba(170,220,245,0.85)' : 'rgba(40,110,160,0.75)';
      g.lineWidth = 1.5;
      g.stroke();
      // Glanzlicht
      g.strokeStyle = 'rgba(255,255,255,0.6)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(cx - edge * 0.3, cy - hh * 0.75);
      g.lineTo(cx - edge * 0.3, cy - hh * 0.35);
      g.stroke();
      // Mittelebene mit Linsensymbol
      g.save();
      g.strokeStyle = withAlpha(theme.text, 0.55);
      g.setLineDash([3, 4]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(cx, plot.rect.y + 6);
      g.lineTo(cx, plot.rect.y + plot.rect.h - 6);
      g.stroke();
      g.restore();
      const sym = (y: number, up: boolean) => {
        const d = up ? -1 : 1;
        g.strokeStyle = withAlpha(theme.text, 0.8);
        g.lineWidth = 1.6;
        g.beginPath();
        if (f >= 0) {
          g.moveTo(cx - 6, y - d * 6);
          g.lineTo(cx, y);
          g.lineTo(cx + 6, y - d * 6);
        } else {
          g.moveTo(cx - 6, y + d * 6);
          g.lineTo(cx, y);
          g.lineTo(cx + 6, y + d * 6);
        }
        g.stroke();
      };
      sym(cy - hh - 4, true);
      sym(cy + hh + 4, false);
    }

    function focalMarks(f: number): void {
      const theme = ctx.theme;
      const fa = Math.abs(f);
      const conv = f >= 0;
      const marks: [number, string, boolean][] = [
        [conv ? -fa : fa, 'F', true],
        [conv ? fa : -fa, 'F′', true],
      ];
      if (p.f2) marks.push([-2 * fa, conv ? '2F' : '2F′', false], [2 * fa, conv ? '2F′' : '2F', false]);
      for (const [x, name, main] of marks) {
        const [px, py] = plot.toPx(x, 0);
        if (px < plot.rect.x - 10 || px > plot.rect.x + plot.rect.w + 10) continue;
        g.fillStyle = main ? theme.series[4]! : withAlpha(theme.series[4]!, 0.6);
        g.beginPath();
        g.arc(px, py, main ? 4.5 : 3, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = theme.bg;
        g.lineWidth = 1.5;
        g.stroke();
        label(name, px, py - 13, { size: main ? 13 : 11.5, color: main ? theme.series[4]! : withAlpha(theme.series[4]!, 0.8), italic: true });
      }
    }

    /** Konstruktionsstrahlen vom Pfeilkopf. */
    function drawConstruction(f: number, img: LensImage): void {
      const theme = ctx.theme;
      const gg = objG;
      const G = p.h;
      const T: V2 = [-gg, G];
      const xEnd = plot.bounds.xMax + 5;
      const cPar = theme.series[3]!;
      const cMid = theme.series[2]!;
      const cFoc = theme.series[0]!;
      const virt = !img.none && !img.real;
      const I: V2 = [img.b, img.B];
      const along = (from: V2, dir: V2, x: number): V2 => [x, from[1] + (dir[1] / dir[0]) * (x - from[0])];
      if (f > 0) {
        // Parallelstrahl → durch F′
        seg(T, [0, G], cPar, { arrow: true });
        const d1: V2 = [f, -G];
        seg([0, G], along([0, G], d1, xEnd), cPar, { arrow: true });
        if (virt) seg([0, G], I, cPar, { dash: true });
        // Mittelpunktstrahl
        seg(T, [0, 0], cMid, { arrow: true });
        seg([0, 0], along([0, 0], [gg, -G], xEnd), cMid, { arrow: true });
        if (virt) seg([0, 0], I, cMid, { dash: true });
        // Brennpunktstrahl → parallel
        if (Math.abs(gg - f) > 1e-6) {
          const y1 = (G * f) / (f - gg);
          if (gg < f) seg([-f, 0], T, cFoc, { dash: true, alpha: 0.7 });
          seg(T, [0, y1], cFoc, { arrow: true });
          seg([0, y1], [xEnd, y1], cFoc, { arrow: true });
          if (virt) seg([0, y1], [img.b, y1], cFoc, { dash: true });
        }
      } else {
        const fa = -f;
        // Parallelstrahl → scheinbar von F′ (links)
        seg(T, [0, G], cPar, { arrow: true });
        seg([0, G], along([0, G], [fa, G], xEnd), cPar, { arrow: true });
        seg([-fa, 0], [0, G], cPar, { dash: true });
        // Mittelpunktstrahl
        seg(T, [0, 0], cMid, { arrow: true });
        seg([0, 0], along([0, 0], [gg, -G], xEnd), cMid, { arrow: true });
        seg([0, 0], I, cMid, { dash: true });
        // auf F (rechts) gerichtet → parallel
        const y1 = (G * fa) / (gg + fa);
        seg(T, [0, y1], cFoc, { arrow: true });
        seg([0, y1], [fa, 0], cFoc, { dash: true, alpha: 0.7 });
        seg([0, y1], [xEnd, y1], cFoc, { arrow: true });
        seg([0, y1], [img.b, y1], cFoc, { dash: true });
      }
    }

    /** Lichtbündel von einem Punkt durch die ganze Linse (bis zum Schirm oder Rand). */
    function drawBundle(src: V2, f: number, color: string, xStop: number, alpha: number): void {
      const n = 13;
      const pts: { yl: number; yEnd: number }[] = [];
      for (let i = 0; i < n; i++) {
        const yl = -APERTURE + (2 * APERTURE * i) / (n - 1);
        const m = (yl - src[1]) / (0 - src[0]);
        const m2 = refractSlope(m, yl, f);
        pts.push({ yl, yEnd: yl + m2 * xStop });
      }
      const P = (x: number, y: number) => plot.toPx(x, y);
      // Lichtkegel vor der Linse
      const [sx, sy] = P(src[0], src[1]);
      const [t0x, t0y] = P(0, pts[0]!.yl);
      const [t1x, t1y] = P(0, pts[n - 1]!.yl);
      g.save();
      g.fillStyle = withAlpha(color, 0.13 * alpha);
      g.beginPath();
      g.moveTo(sx, sy);
      g.lineTo(t0x, t0y);
      g.lineTo(t1x, t1y);
      g.closePath();
      g.fill();
      // hinter der Linse: Fläche zwischen den Randstrahlen
      const [e0x, e0y] = P(xStop, pts[0]!.yEnd);
      const [e1x, e1y] = P(xStop, pts[n - 1]!.yEnd);
      g.beginPath();
      g.moveTo(t0x, t0y);
      g.lineTo(e0x, e0y);
      g.lineTo(e1x, e1y);
      g.lineTo(t1x, t1y);
      g.closePath();
      g.fill();
      g.restore();
      for (const q of pts) {
        seg(src, [0, q.yl], color, { width: 1.1, alpha: 0.75 * alpha });
        seg([0, q.yl], [xStop, q.yEnd], color, { width: 1.1, alpha: 0.75 * alpha });
      }
    }

    function drawScreen(x: number): void {
      const s = plot.scale.x;
      const [px, top] = plot.toPx(x, SCREEN_H);
      const [, bot] = plot.toPx(x, -SCREEN_H);
      const w = Math.max(6, 1.2 * s);
      g.save();
      softShadow(g, ctx.theme.dark, 8, 2);
      const board = g.createLinearGradient(px, 0, px + w, 0);
      board.addColorStop(0, '#f4f5f7');
      board.addColorStop(1, '#a9b0bb');
      g.fillStyle = board;
      g.fillRect(px, top, w, bot - top);
      g.restore();
      label(ctx.t('screen'), px + w / 2, top - 10, { size: 12 });
    }

    /** Anwendungen: Lupe, Kamera, Projektor, Auge als Rahmen um die Linse. */
    function drawApp(img: LensImage): void {
      const theme = ctx.theme;
      const s = plot.scale.x;
      const P = (x: number, y: number) => plot.toPx(x, y);
      const a = app();
      if (a === 'camera') {
        const back = mode() === 'bundle' ? p.s : img.real ? img.b : 10;
        const [x0, y0] = P(-1.5, 14.5);
        const [x1, y1] = P(Math.max(3, back + 1.8), -14.5);
        // Gehäuse (aufgeschnitten gezeichnet)
        g.save();
        softShadow(g, theme.dark, 12, 3);
        g.fillStyle = theme.dark ? 'rgba(70,78,92,0.5)' : 'rgba(40,46,58,0.12)';
        roundRect(g, x0, y0, x1 - x0, y1 - y0, 12);
        g.fill();
        g.restore();
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 2.5;
        roundRect(g, x0, y0, x1 - x0, y1 - y0, 12);
        g.stroke();
        // Auslöser und Sucher
        g.fillStyle = withAlpha(theme.text, 0.5);
        roundRect(g, x1 - Math.min(26, (x1 - x0) * 0.3), y0 - 6, Math.min(18, (x1 - x0) * 0.2), 6, 2);
        g.fill();
        // Objektivtubus vor der Linse
        const [tx0, ty0] = P(-5, 13.2);
        const [, ty1] = P(-5, -13.2);
        g.fillStyle = withAlpha(theme.text, 0.14);
        g.strokeStyle = withAlpha(theme.text, 0.5);
        g.lineWidth = 1.5;
        roundRect(g, tx0, ty0, x0 - tx0 + 3, ty1 - ty0, 5);
        g.fill();
        g.stroke();
        // Bildsensor
        const [sx, sy0] = P(back, 9);
        const [, sy1] = P(back, -9);
        g.fillStyle = theme.series[2]!;
        roundRect(g, sx - 2.5, sy0, 5, sy1 - sy0, 2);
        g.fill();
        label(ctx.t('sensor'), sx, P(0, -14.5)[1] + 14, { size: 11, color: theme.series[2]! });
      } else if (a === 'eye') {
        // Augapfel mit Netzhaut
        const [cx, cy] = P(EYE_B / 2 - 0.6, 0);
        const R = (EYE_B / 2 + 0.6) * s;
        g.save();
        g.fillStyle = theme.dark ? 'rgba(235,240,248,0.06)' : 'rgba(255,255,255,0.75)';
        g.strokeStyle = withAlpha(theme.text, 0.55);
        g.lineWidth = 2;
        g.beginPath();
        g.arc(cx, cy, R, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        // Hornhaut
        g.beginPath();
        g.arc(cx - R * 0.55, cy, R * 0.55, Math.PI * 0.62, Math.PI * 1.38);
        g.stroke();
        // Netzhaut
        g.strokeStyle = theme.series[1]!;
        g.lineWidth = 4;
        g.beginPath();
        g.arc(cx, cy, R - 2, -0.75, 0.75);
        g.stroke();
        g.restore();
        const [rx, ry] = P(EYE_B + 0.8, -R / s * 0.72);
        label(ctx.t('retina'), rx, ry + 14, { size: 11, color: theme.series[1]!, align: 'left' });
        const [lx, ly] = P(0, LENS_H);
        label(ctx.t('eyeLens'), lx, ly - 18, { size: 11, color: theme.muted });
      } else if (a === 'projector') {
        // Lampe und Kondensor hinter dem Dia
        const [lx, ly] = P(-objG - 4.5, p.h / 2);
        const R = 3.2 * s;
        g.save();
        const glow = g.createRadialGradient(lx, ly, 0, lx, ly, R * 3);
        glow.addColorStop(0, 'rgba(255,230,150,0.75)');
        glow.addColorStop(1, 'rgba(255,220,120,0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(lx, ly, R * 3, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#fff6d0';
        g.beginPath();
        g.arc(lx, ly, R * 0.6, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 2.5;
        g.beginPath();
        g.arc(lx, ly, R * 1.4, Math.PI * 0.6, Math.PI * 1.4);
        g.stroke();
        g.restore();
        label(ctx.t('lamp'), lx, ly + R * 1.4 + 12, { size: 11, color: theme.muted });
        if (mode() === 'con' && img.real) drawScreen(img.b);
      } else if (a === 'loupe') {
        // Auge hinter der Lupe
        const [ex, ey] = P(4, p.h * 0.5);
        drawEyeGlyph(ex, ey, Math.max(26, 2.4 * s));
        label(ctx.t('viewer'), ex, ey - 18, { size: 11, color: theme.muted });
      }
    }

    function drawEyeGlyph(x: number, y: number, w: number): void {
      // Auge blickt nach links (zur Linse)
      const h = w * 0.5;
      g.save();
      g.translate(x, y);
      g.scale(-1, 1);
      g.beginPath();
      g.moveTo(-w / 2, 0);
      g.quadraticCurveTo(0, -h, w / 2, 0);
      g.quadraticCurveTo(0, h, -w / 2, 0);
      g.closePath();
      g.fillStyle = '#ffffff';
      g.fill();
      g.strokeStyle = ctx.theme.dark ? '#c9d2df' : '#2b3442';
      g.lineWidth = 2;
      g.stroke();
      g.clip();
      g.fillStyle = '#2f7bc8';
      g.beginPath();
      g.arc(w * 0.12, 0, h * 0.62, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#0b0f16';
      g.beginPath();
      g.arc(w * 0.16, 0, h * 0.28, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    function drawScene(): void {
      const theme = ctx.theme;
      const { scene } = regions();
      fit();
      plot.begin();
      drawBackground(scene);
      const f = fSigned();
      const img = image();
      drawAxis(scene);
      if (app() !== 'none') drawApp(img);
      if (mode() === 'bundle') {
        const xs = app() === 'eye' ? EYE_B : p.s;
        const xStop = Math.max(0.5, xs);
        drawBundle([-objG, 0], f, theme.series[0]!, xStop, 0.55);
        drawBundle([-objG, p.h], f, theme.series[3]!, xStop, 1);
        if (!img.none && !img.real) {
          // gestrichelte Rückverlängerung zum virtuellen Bildpunkt
          for (const yl of [-APERTURE, APERTURE]) seg([0, yl], [img.b, img.B], theme.series[3]!, { dash: true, alpha: 0.7 });
        }
        if (app() !== 'eye' && app() !== 'camera') drawScreen(xs);
      } else if (p.rays) drawConstruction(f, img);
      drawLens(f);
      focalMarks(f);
      // Gegenstand
      arrowObj(-objG, p.h, theme.text);
      const [ox, oy] = plot.toPx(-objG, p.h);
      label('G', ox - 12, (oy + plot.toPx(0, 0)[1]) / 2, { size: 14, italic: true, color: theme.text, align: 'right' });
      // Bild
      if (img.none) {
        const r = plot.rect;
        label(ctx.t('noImage'), r.x + r.w - 12, r.y + 18, { size: 12, color: theme.series[1]!, align: 'right' });
      } else {
        const b = plot.bounds;
        const inView = img.b > b.xMin && img.b < b.xMax;
        if (inView) {
          const showImg = mode() === 'con' || !img.real || isSharp(img) || app() === 'eye';
          if (showImg || mode() === 'con') arrowObj(img.b, img.B, theme.series[1]!, { dashed: !img.real });
          else arrowObj(img.b, img.B, theme.series[1]!, { alpha: 0.35, width: 2 });
          const [ix, iy] = plot.toPx(img.b, img.B);
          const [, ay] = plot.toPx(0, 0);
          const yClamp = Math.max(plot.rect.y + 12, Math.min(plot.rect.y + plot.rect.h - 12, iy + (img.B > 0 ? -12 : 14)));
          label('B', ix + 12, (yClamp + ay) / 2, { size: 14, italic: true, color: theme.series[1]!, align: 'left' });
          if (!img.real) label(ctx.t('virtualImage'), ix, ay + (img.B > 0 ? 32 : -30), { size: 11, color: theme.series[1]! });
        } else {
          const r = plot.rect;
          const right = img.b > 0;
          label((right ? '' : '← ') + tr('offView', { b: fmt.num(img.b, 0) }) + (right ? ' →' : ''), right ? r.x + r.w - 12 : r.x + 12, r.y + 18, { size: 12, color: theme.series[1]!, align: right ? 'right' : 'left' });
        }
      }
      plot.end();
    }

    /* ---------- Karten unter der Szene ---------- */
    const CASES: CaseId[] = ['far', 'twoF', 'between', 'focus', 'inside'];

    function drawCaseCard(r: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      const top = card(r, ctx.t('cases'));
      const f = fSigned();
      const current = imageCase(f, objG, 1e-6);
      const list: CaseId[] = f < 0 ? ['diverging'] : CASES;
      const rowH = Math.min(24, (r.y + r.h - top - 6) / Math.max(list.length, 3));
      const fontSize = small ? 11 : 12;
      list.forEach((c, i) => {
        const y = top + i * rowH;
        const active = c === current;
        if (active) {
          g.fillStyle = withAlpha(theme.series[1]!, theme.dark ? 0.2 : 0.11);
          roundRect(g, r.x + 8, y, r.w - 16, rowH - 2, 7);
          g.fill();
          g.fillStyle = theme.series[1]!;
          roundRect(g, r.x + 8, y, 4, rowH - 2, 2);
          g.fill();
        }
        const cy = y + (rowH - 2) / 2;
        const col1 = small ? 74 : 100;
        text(g, ctx.t(`c_${c}`), r.x + 18, cy, { font: `${active ? 800 : 600} ${fontSize}px ${theme.font}`, color: active ? theme.series[1]! : theme.text, align: 'left' });
        text(g, ctx.t(`p_${c}`), r.x + 18 + col1 + (c === 'diverging' ? 40 : 0), cy, { font: `${active ? 700 : 500} ${fontSize}px ${theme.font}`, color: theme.text, align: 'left' });
        const ex = ctx.t(`e_${c}`);
        if (!small && ex) text(g, ex, r.x + r.w - 14, cy, { font: `500 ${fontSize}px ${theme.font}`, color: theme.muted, align: 'right' });
      });
      if (f < 0) {
        const font = `500 ${fontSize}px ${theme.font}`;
        let y = top + rowH + 14;
        g.font = font;
        let line = '';
        for (const w of ctx.t('divNote').split(' ')) {
          const test = line ? `${line} ${w}` : w;
          if (g.measureText(test).width > r.w - 36 && line) {
            text(g, line, r.x + 18, y, { font, color: theme.muted, align: 'left' });
            y += 16;
            line = w;
          } else line = test;
        }
        if (line) text(g, line, r.x + 18, y, { font, color: theme.muted, align: 'left' });
      }
    }

    function drawLegendCard(r: Rect): void {
      const theme = ctx.theme;
      const top = card(r, ctx.t('legend'));
      const div = fSigned() < 0;
      const rows: [string, string, boolean][] = [
        [theme.series[3]!, ctx.t(div ? 'rayParDiv' : 'rayPar'), false],
        [theme.series[2]!, ctx.t('rayMid'), false],
        [theme.series[0]!, ctx.t(div ? 'rayFocDiv' : 'rayFoc'), false],
        [theme.muted, ctx.t('dashed'), true],
      ];
      const rowH = Math.min(24, (r.y + r.h - top - 6) / rows.length);
      rows.forEach(([col, str, dash], i) => {
        const y = top + i * rowH + rowH / 2 - 2;
        g.save();
        g.strokeStyle = col;
        g.lineWidth = dash ? 1.6 : 2.6;
        g.setLineDash(dash ? [5, 4] : []);
        g.beginPath();
        g.moveTo(r.x + 14, y);
        g.lineTo(r.x + 40, y);
        g.stroke();
        g.restore();
        text(g, str, r.x + 50, y, { font: `500 ${narrow() ? 11 : 12}px ${theme.font}`, color: theme.text, align: 'left' });
      });
    }

    /** Schirmbild von vorn: umgekehrter, je nach Schirmlage unscharfer Leuchtpfeil. */
    const screenCanvas = document.createElement('canvas');
    let screenKey = '';

    /**
     * Jeder Punkt des Pfeils wird auf dem Schirm zu einem Unschärfekreis.
     * Für jede Zelle des Schirms wird gezählt, welcher Anteil dieses Kreises
     * vom (verkleinerten bzw. vergrößerten, umgekehrten) Pfeil bedeckt ist.
     */
    function screenImage(n: number, span: number, xs: number, img: LensImage): HTMLCanvasElement {
      const key = `${n}|${span.toFixed(3)}|${xs}|${objG.toFixed(3)}|${p.h}|${img.b.toFixed(4)}|${ctx.theme.dark}`;
      if (key === screenKey) return screenCanvas;
      screenKey = key;
      screenCanvas.width = n;
      screenCanvas.height = n;
      const sg = screenCanvas.getContext('2d')!;
      const data = sg.createImageData(n, n);
      const k = -xs / objG; // Mittelpunktstrahl: Lage und Größe auf dem Schirm
      const H = p.h * k;
      const poly: [number, number][] = ARROW_SHAPE.map(([ax, ay]) => [ax * Math.abs(H) * 1.15, ay * H]);
      const cell = span / n;
      const blur = blurRadius(APERTURE, img.b, xs);
      const base = ctx.theme.dark ? [34, 38, 46] : [46, 51, 60];
      const lit = [255, 226, 140];
      // Großer Unschärfekreis: Pfeilfläche dicht mit Punkten belegen und zählen,
      // wie viele davon im Kreis um die Schirmstelle liegen (glatte Faltung).
      const wide = blur > 2 * cell;
      let pts: number[][] = [];
      let weight = 0;
      if (wide) {
        const xs0 = Math.min(...poly.map((q) => q[0]));
        const xs1 = Math.max(...poly.map((q) => q[0]));
        const ys0 = Math.min(...poly.map((q) => q[1]));
        const ys1 = Math.max(...poly.map((q) => q[1]));
        const step = Math.max((xs1 - xs0) / 40, (ys1 - ys0) / 60, 0.02);
        for (let y = ys0 + step / 2; y < ys1; y += step) for (let x = xs0 + step / 2; x < xs1; x += step) if (pointInPolygon(x, y, poly)) pts.push([x, y]);
        weight = (step * step) / (Math.PI * blur * blur);
      }
      const samples = wide ? [] : discSamples(Math.max(blur, cell * 0.6), 12);
      const r2 = blur * blur;
      for (let j = 0; j < n; j++) {
        const v = span / 2 - (j + 0.5) * cell;
        for (let i = 0; i < n; i++) {
          const u = -span / 2 + (i + 0.5) * cell;
          let cov = 0;
          if (wide) {
            let hit = 0;
            for (const [px, py] of pts) {
              const dx = px! - u;
              const dy = py! - v;
              if (dx * dx + dy * dy <= r2) hit++;
            }
            cov = Math.min(1, hit * weight);
          } else {
            let hit = 0;
            for (const [dx, dy] of samples) if (pointInPolygon(u + dx!, v + dy!, poly)) hit++;
            cov = hit / samples.length;
          }
          // etwas aufgehellt, damit auch ein schwacher, verschmierter Lichtfleck sichtbar bleibt
          const c = Math.pow(cov, 0.7);
          const o = (j * n + i) * 4;
          data.data[o] = base[0]! + (lit[0]! - base[0]!) * c;
          data.data[o + 1] = base[1]! + (lit[1]! - base[1]!) * c;
          data.data[o + 2] = base[2]! + (lit[2]! - base[2]!) * c;
          data.data[o + 3] = 255;
        }
      }
      sg.putImageData(data, 0, 0);
      return screenCanvas;
    }

    function drawScreenCard(r: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      const top = card(r, small ? undefined : ctx.t(app() === 'camera' ? 'sensor' : app() === 'eye' ? 'retina' : 'screenView'));
      const img = image();
      const xs = screenX();
      const capH = small ? 30 : 38;
      const vw = Math.floor(Math.min(r.w - 24, r.y + r.h - top - capH));
      const vx = Math.round(r.x + (r.w - vw) / 2);
      const vy = top + 2;
      g.save();
      roundRect(g, vx, vy, vw, vw, 8);
      g.clip();
      let state: 'sharp' | 'blurry' | 'none' = 'none';
      // Ausschnitt so, dass das scharfe Bild gut zu sehen ist
      const span = Math.min(2 * SCREEN_H, Math.max(6, 10 * Math.abs(Number.isFinite(img.B) ? img.B : 10)));
      if (!img.none && img.real) {
        state = isSharp(img) ? 'sharp' : 'blurry';
        const n = blurRadius(APERTURE, img.b, xs) > span * 0.08 ? 56 : Math.min(110, Math.max(48, Math.round(vw * 0.75)));
        g.imageSmoothingEnabled = true;
        g.drawImage(screenImage(n, span, xs, img), vx, vy, vw, vw);
      } else {
        // kein (reelles) Bild: nur ein großer, schwacher Lichtfleck
        g.fillStyle = theme.dark ? '#22262e' : '#2e333c';
        g.fillRect(vx, vy, vw, vw);
        const glow = g.createRadialGradient(vx + vw / 2, vy + vw / 2, 0, vx + vw / 2, vy + vw / 2, vw * 0.7);
        glow.addColorStop(0, 'rgba(255,226,140,0.35)');
        glow.addColorStop(1, 'rgba(255,226,140,0.08)');
        g.fillStyle = glow;
        g.fillRect(vx, vy, vw, vw);
      }
      g.restore();
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.25)';
      g.lineWidth = 1;
      roundRect(g, vx + 0.5, vy + 0.5, vw - 1, vw - 1, 8);
      g.stroke();
      const word = state === 'sharp' ? ctx.t('sharp') : state === 'blurry' ? ctx.t('blurry') : '—';
      const col = state === 'sharp' ? theme.series[2]! : state === 'blurry' ? theme.series[3]! : theme.muted;
      text(g, word, vx + vw / 2, vy + vw + 13, { font: `800 13px ${theme.font}`, color: col });
      if (!small && state !== 'none') text(g, tr('span', { w: fmt.num(span, 0) }), vx + vw / 2, vy + vw + 28, { font: `500 11px ${theme.font}`, color: theme.muted });
    }

    /** Punkte, die eine Kreisscheibe gleichmäßig füllen (für die Unschärfe). */
    function discSamples(radius: number, n: number): number[][] {
      const out: number[][] = [];
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const rr = radius * Math.sqrt((i + 0.5) / n);
        const a = i * golden;
        out.push([rr * Math.cos(a), rr * Math.sin(a)]);
      }
      return out;
    }

    function drawRow(): void {
      const { row, side } = regions();
      const small = narrow();
      if (small) {
        const h1 = Math.round(row.h * 0.42);
        if (mode() === 'bundle') {
          const w1 = Math.round(Math.min(row.w * 0.46, h1 + 10));
          drawScreenCard({ x: row.x, y: row.y, w: w1, h: h1 });
          drawLegendOrHint({ x: row.x + w1 + 10, y: row.y, w: row.w - w1 - 10, h: h1 });
        } else drawLegendCard({ x: row.x, y: row.y, w: row.w, h: h1 });
        drawCaseCard({ x: row.x, y: row.y + h1 + 10, w: row.w, h: row.h - h1 - 10 });
        return;
      }
      if (side) drawScreenCard(side);
      const w1 = Math.round(row.w * 0.38);
      if (mode() === 'bundle') drawLegendOrHint({ x: row.x, y: row.y, w: w1, h: row.h });
      else drawLegendCard({ x: row.x, y: row.y, w: w1, h: row.h });
      drawCaseCard({ x: row.x + w1 + 12, y: row.y, w: row.w - w1 - 12, h: row.h });
    }

    /** Schmale Ansicht: kurze Rückmeldung zur Schärfe neben dem Schirmbild. */
    function drawLegendOrHint(r: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      const top = card(r, small ? undefined : ctx.t(app() === 'camera' ? 'sensor' : app() === 'eye' ? 'retina' : 'screen'));
      const img = image();
      let msg: string;
      let col = theme.text;
      if (app() === 'eye') msg = ctx.t('eyeHint');
      else if (img.none || !img.real) msg = ctx.t(img.none ? 'noScreenImage' : 'virtText');
      else {
        const d = screenX() - img.b;
        const ok = isSharp(img);
        msg = ok ? ctx.t('sharpText') : ctx.t(d < 0 ? 'nearShort' : 'farShort');
        col = ok ? theme.series[2]! : theme.series[3]!;
      }
      const font = `600 ${small ? 12 : 13}px ${theme.font}`;
      const lines = (str: string, f: string) => {
        g.font = f;
        const out: string[] = [];
        let line = '';
        for (const w of str.split(' ')) {
          const test = line ? `${line} ${w}` : w;
          if (g.measureText(test).width > r.w - 28 && line) {
            out.push(line);
            line = w;
          } else line = test;
        }
        if (line) out.push(line);
        return out;
      };
      let y = small ? r.y + 22 : top + 6;
      for (const ln of lines(msg, font)) {
        text(g, ln, r.x + 14, y, { font, color: col, align: 'left' });
        y += small ? 16 : 18;
      }
      if (!small) {
        const tip = `500 12px ${theme.font}`;
        y += 6;
        for (const ln of lines(ctx.t('screenTip'), tip)) {
          if (y > r.y + r.h - 10) break;
          text(g, ln, r.x + 14, y, { font: tip, color: theme.muted, align: 'left' });
          y += 16;
        }
      }
    }

    function clampN(v: number, lo: number, hi: number): number {
      return Math.min(hi, Math.max(lo, v));
    }

    return {
      update(changed, source) {
        if (changed.has('g') || source !== 'sim') objG = p.g;
        if (source === 'init') viewHalf = targetHalf();
        if (changed.has('typ') && source !== 'init') {
          // Linse verformt sich weich von der alten zur neuen Form
          lensFrom = lensK;
          lensMorph.play();
        }
        if (changed.has('mode') && source !== 'init') fade.play();
        updateReadouts();
      },

      tick(dt) {
        objG += objDir * 4 * dt;
        if (objG <= 1.5) [objG, objDir] = [1.5, 1];
        if (objG >= 50) [objG, objDir] = [50, -1];
        updateReadouts();
      },

      resetTime() {
        objG = p.g;
        updateReadouts();
      },

      render() {
        plot.resize();
        surface.begin();
        drawScene();
        drawRow();
        if (fade.running) {
          g.fillStyle = withAlpha(ctx.theme.bg, 1 - fade.value);
          g.fillRect(0, 0, surface.width, surface.height);
          ctx.requestRender();
        }
        if (lensMorph.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
