import { defineSimulation, ease, Plot, roundRect, softShadow, Surface, TapTarget, text, Tween, withAlpha, type Rect } from '../../../sim-core';
import {
  dirFromVertical,
  glancingAngle,
  hitsFront,
  imageCountRule,
  incidence,
  isReversed,
  lightPath,
  mirrorDir,
  mirrorImage,
  mirrorNormal,
  neededMirror,
  reflectAcross,
  reflectedAngle,
  reflectionPoint,
  seesInMirror,
  wedgeImages,
  type MirrorImage,
  type V2,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Mode = 'law' | 'image' | 'multi';

/** Länge der Spiegel im Winkelspiegel (Einheiten der Zeichnung). */
const WEDGE_LEN = 10;
/** Abstand der Laseröffnung vom Mittelpunkt der Scheibe (Scheibenradius 1). */
const LASER_R = 1.04;
/** Höchstens so viele Messwerte in der Messreihe. */
const MAX_ROWS = 8;
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Umriss der Figur im Winkelspiegel (Stab mit Fähnchen), Spitze nach oben, Mitte im Ursprung. */
const FIGURE_POLE: V2[] = [
  [-0.16, -1.1],
  [0.16, -1.1],
  [0.16, 0.8],
  [0.42, 0.8],
  [0, 1.35],
  [-0.42, 0.8],
  [-0.16, 0.8],
];
const FIGURE_FLAG: V2[] = [
  [0.16, 0.55],
  [1.15, 0.25],
  [0.16, -0.05],
];

/**
 * Reflexion am ebenen Spiegel: Reflexionsgesetz auf der optischen Scheibe
 * (mit Messreihe), Spiegelbild einer Kerze mit Sehstrahlen und Sichtbereich
 * sowie ein Winkelspiegel mit Mehrfachbildern und Lichtwegen.
 */
export default defineSimulation({
  id: 'reflexion',
  animated: true,
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.74 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Versuch', 'Setup'),
      options: [
        { value: 'law', label: L('Reflexionsgesetz', 'Law of reflection') },
        { value: 'image', label: L('Spiegelbild', 'Mirror image') },
        { value: 'multi', label: L('Winkelspiegel', 'Angled mirrors') },
      ],
      default: 'law',
    },
    {
      key: 'la',
      type: 'number',
      label: L('Richtung des Lasers (Winkel zur Senkrechten)', 'Direction of the laser (angle to the vertical)'),
      help: L('Oder den Laser um die Scheibe ziehen.', 'Or drag the laser around the disc.'),
      min: -85,
      max: 85,
      step: 1,
      default: 40,
      unit: '°',
      visibleIf: (v) => v.mode === 'law',
    },
    {
      key: 'tilt',
      type: 'number',
      label: L('Drehung von Spiegel und Scheibe', 'Rotation of mirror and disc'),
      help: L('Oder am Ende des Spiegels ziehen.', 'Or drag the end of the mirror.'),
      min: -45,
      max: 45,
      step: 1,
      default: 0,
      unit: '°',
      visibleIf: (v) => v.mode === 'law',
    },
    { key: 'g', type: 'number', label: L('Abstand Kerze – Spiegel g', 'Distance candle – mirror g'), min: 5, max: 40, step: 1, default: 25, unit: 'cm', visibleIf: (v) => v.mode === 'image' },
    { key: 'h', type: 'number', label: L('Höhe der Kerze', 'Height of the candle'), min: 8, max: 30, step: 1, default: 18, unit: 'cm', visibleIf: (v) => v.mode === 'image' },
    { key: 'ex', type: 'number', label: L('Auge: Abstand vom Spiegel', 'Eye: distance from the mirror'), min: 5, max: 65, step: 1, default: 50, unit: 'cm', visibleIf: (v) => v.mode === 'image' },
    { key: 'ey', type: 'number', label: L('Auge: Höhe über dem Tisch', 'Eye: height above the table'), min: 2, max: 50, step: 1, default: 32, unit: 'cm', visibleIf: (v) => v.mode === 'image' },
    { key: 'mb', type: 'number', label: L('Spiegel: Unterkante', 'Mirror: bottom edge'), min: 0, max: 45, step: 1, default: 4, unit: 'cm', visibleIf: (v) => v.mode === 'image' },
    { key: 'mt', type: 'number', label: L('Spiegel: Oberkante', 'Mirror: top edge'), min: 5, max: 50, step: 1, default: 44, unit: 'cm', visibleIf: (v) => v.mode === 'image' },
    {
      key: 'w',
      type: 'number',
      label: L('Winkel zwischen den Spiegeln', 'Angle between the mirrors'),
      help: L('Oder am Ende des rechten Spiegels ziehen.', 'Or drag the end of the right-hand mirror.'),
      min: 30,
      max: 180,
      step: 1,
      default: 90,
      unit: '°',
      visibleIf: (v) => v.mode === 'multi',
    },
    { key: 'r', type: 'number', label: L('Figur: Abstand vom Scharnier', 'Figure: distance from the hinge'), min: 2, max: 9, step: 0.1, default: 5, visibleIf: (v) => v.mode === 'multi' },
    { key: 'f', type: 'number', label: L('Figur: Lage von Spiegel 1 zu Spiegel 2', 'Figure: position from mirror 1 to mirror 2'), min: 0.05, max: 0.95, step: 0.01, default: 0.36, display: (v) => `${Math.round(v * 100)} %`, visibleIf: (v) => v.mode === 'multi' },
    { key: 'er', type: 'number', label: L('Auge: Abstand vom Scharnier', 'Eye: distance from the hinge'), min: 2, max: 9.5, step: 0.1, default: 8.4, visibleIf: (v) => v.mode === 'multi' },
    { key: 'ef', type: 'number', label: L('Auge: Lage von Spiegel 1 zu Spiegel 2', 'Eye: position from mirror 1 to mirror 2'), min: 0.05, max: 0.95, step: 0.01, default: 0.62, display: (v) => `${Math.round(v * 100)} %`, visibleIf: (v) => v.mode === 'multi' },
    { key: 'scale', type: 'boolean', group: 'view', label: L('Winkelskala', 'Angle scale'), default: true, visibleIf: (v) => v.mode === 'law' },
    { key: 'gl', type: 'boolean', group: 'view', label: L('Winkel zur Spiegelfläche zeigen', 'Show angle to the mirror surface'), default: false, visibleIf: (v) => v.mode === 'law' },
    { key: 'con', type: 'boolean', group: 'view', label: L('Konstruktion: Lot und Abstände', 'Construction: perpendiculars and distances'), default: true, visibleIf: (v) => v.mode === 'image' },
    { key: 'fov', type: 'boolean', group: 'view', label: L('Sichtbereich des Auges im Spiegel', 'What the eye can see in the mirror'), default: false, visibleIf: (v) => v.mode === 'image' },
    { key: 'sect', type: 'boolean', group: 'view', label: L('Spiegelräume einzeichnen', 'Show mirror rooms'), default: true, visibleIf: (v) => v.mode === 'multi' },
  ],
  actions: [
    { id: 'measure', label: L('Messwert aufnehmen', 'Record measurement'), primary: true, visibleIf: (v) => v.mode === 'law' },
    { id: 'clear', label: L('Messreihe löschen', 'Clear measurements'), visibleIf: (v) => v.mode === 'law' },
  ],
  readouts: [
    { key: 'angles', label: L('Winkel', 'Angles'), spoiler: true },
    { key: 'law', label: L('Reflexionsgesetz', 'Law of reflection') },
    { key: 'glance', label: L('Winkel zur Spiegelfläche', 'Angle to the mirror surface'), spoiler: true },
    { key: 'table', label: L('Messreihe', 'Measurements') },
    { key: 'dist', label: L('Gegenstandsweite und Bildweite', 'Object and image distance'), spoiler: true },
    { key: 'see', label: L('Was sieht das Auge?', 'What does the eye see?') },
    { key: 'need', label: L('Nötiger Teil des Spiegels', 'Part of the mirror needed'), spoiler: true },
    { key: 'count', label: L('Anzahl der Bilder', 'Number of images'), spoiler: true },
    { key: 'path', label: L('Ausgewähltes Bild', 'Selected image') },
  ],
  presets: [
    { id: 'law', label: L('Reflexionsgesetz', 'Law of reflection'), values: {} },
    { id: 'tilt', label: L('Spiegel drehen', 'Turning the mirror'), values: { tilt: 15, la: 40, gl: true } },
    { id: 'image', label: L('Kerze vor dem Spiegel', 'Candle in front of a mirror'), values: { mode: 'image' } },
    { id: 'small', label: L('Zu kleiner Spiegel', 'Mirror too small'), values: { mode: 'image', mb: 14, mt: 24, fov: true } },
    { id: 'w90', label: L('Winkelspiegel 90°', 'Mirrors at 90°'), values: { mode: 'multi' } },
    { id: 'w60', label: L('Winkelspiegel 60°', 'Mirrors at 60°'), values: { mode: 'multi', w: 60, f: 0.4, r: 4.5 } },
  ],
  strings: {
    de: {
      canvas: 'Optische Scheibe mit Planspiegel und Laser, Kerze vor einem senkrechten Spiegel mit Spiegelbild und Sehstrahlen oder Winkelspiegel mit Mehrfachbildern',
      normal: 'Lot',
      mirror: 'Spiegel',
      back: 'Rückseite',
      backHit: 'Das Licht trifft die Rückseite des Spiegels.',
      tableTitle: 'Messreihe',
      emptyTable: 'Drücke „Messwert aufnehmen“, um Einfalls- und Reflexionswinkel einzutragen.',
      chartX: 'α in °',
      chartY: 'α′ in °',
      anglesText: 'Einfallswinkel α = {a}° · Reflexionswinkel α′ = {b}°',
      lawText: 'Einfallswinkel = Reflexionswinkel (α = α′). Einfallender Strahl, Lot und reflektierter Strahl liegen in einer Ebene. Beide Winkel werden zum Lot gemessen, nicht zur Spiegelfläche.',
      glanceText: '90° − α = {g}° (zwischen Strahl und Spiegelfläche)',
      turnText: 'Spiegel um {t}° gedreht: Der reflektierte Strahl dreht sich um {t2}°.',
      noRows: 'noch keine Messwerte',
      full: 'Die Messreihe ist voll (höchstens 8 Werte).',
      candle: 'Kerze',
      image: 'Spiegelbild',
      eye: 'Auge',
      world: 'Spiegelwelt (virtuell)',
      room: 'vor dem Spiegel',
      missed: 'verfehlt den Spiegel',
      distText: 'g = {g} cm vor dem Spiegel, Bild b = {g} cm dahinter: b = g',
      seeAll: 'Das Auge sieht die ganze Kerze im Spiegel. Die Sehstrahlen kommen scheinbar vom Spiegelbild hinter dem Spiegel.',
      seeTip: 'Das Auge sieht nur die Flamme – das Licht vom Kerzenfuß trifft nicht auf den Spiegel.',
      seeFoot: 'Das Auge sieht nur den unteren Teil der Kerze – das Licht von der Flamme trifft nicht auf den Spiegel.',
      seeNone: 'Das Auge sieht die Kerze nicht im Spiegel – die Lichtwege gehen am Spiegel vorbei.',
      needText: 'Von {a} cm bis {b} cm Höhe ({l} cm lang) – nur dieser Teil des Spiegels wird gebraucht.',
      props: 'Spiegelbild',
      pVirtual: 'virtuell',
      pUpright: 'aufrecht',
      pSame: 'gleich groß',
      pDist: 'b = g',
      pRev: 'vorne ↔ hinten vertauscht',
      pVirtualLong: 'virtuell: nicht auf einem Schirm auffangbar',
      pRevLong: 'vorne und hinten vertauscht',
      mirror1: 'Spiegel 1',
      mirror2: 'Spiegel 2',
      object: 'Figur',
      countText: '{n} Bilder',
      countOne: '1 Bild',
      ruleText: '360° : {w}° − 1 = {n}',
      ruleNot: '360° : {w}° ist keine gerade Zahl – die Zahl der Bilder hängt von der Lage der Figur ab.',
      selText: 'Bild nach {k} Spiegelung(en): {seq}{rev}',
      selRev: ' – seitenverkehrt',
      selSame: ' – seitenrichtig (nicht seitenverkehrt)',
      selHidden: ' Vom Auge aus ist dieses Bild nicht zu sehen (der Lichtweg ginge am Spiegel vorbei).',
      tapHint: 'Tippe auf ein Bild, um seinen Lichtweg zu sehen.',
      listTitle: 'Die Bilder (Zahl = Anzahl der Spiegelungen)',
      mirrorShort: 'Spiegel',
      more: '… und {n} weitere',
      countCard: 'Bilder',
      reversed: 'seitenverkehrt',
      notReversed: 'seitenrichtig',
    },
    en: {
      canvas: 'Optical disc with a plane mirror and a laser, a candle in front of a vertical mirror with its image and lines of sight, or two angled mirrors with multiple images',
      normal: 'normal',
      mirror: 'Mirror',
      back: 'back',
      backHit: 'The light hits the back of the mirror.',
      tableTitle: 'Measurements',
      emptyTable: 'Press “Record measurement” to add the angles of incidence and reflection.',
      chartX: 'α in °',
      chartY: 'α′ in °',
      anglesText: 'Angle of incidence α = {a}° · angle of reflection α′ = {b}°',
      lawText: 'Angle of incidence = angle of reflection (α = α′). Incident ray, normal and reflected ray lie in one plane. Both angles are measured from the normal, not from the mirror surface.',
      glanceText: '90° − α = {g}° (between ray and mirror surface)',
      turnText: 'Mirror turned by {t}°: the reflected ray turns by {t2}°.',
      noRows: 'no measurements yet',
      full: 'The table is full (at most 8 values).',
      candle: 'Candle',
      image: 'Image',
      eye: 'Eye',
      world: 'mirror world (virtual)',
      room: 'in front of the mirror',
      missed: 'misses the mirror',
      distText: 'g = {g} cm in front of the mirror, image b = {g} cm behind it: b = g',
      seeAll: 'The eye sees the whole candle in the mirror. The lines of sight seem to come from the image behind the mirror.',
      seeTip: 'The eye only sees the flame – light from the foot of the candle misses the mirror.',
      seeFoot: 'The eye only sees the lower part of the candle – light from the flame misses the mirror.',
      seeNone: 'The eye cannot see the candle in the mirror – the light paths miss the mirror.',
      needText: 'From {a} cm to {b} cm height ({l} cm long) – only this part of the mirror is needed.',
      props: 'Mirror image',
      pVirtual: 'virtual',
      pUpright: 'upright',
      pSame: 'same size',
      pDist: 'b = g',
      pRev: 'front ↔ back swapped',
      pVirtualLong: 'virtual: cannot be caught on a screen',
      pRevLong: 'front and back swapped',
      mirror1: 'Mirror 1',
      mirror2: 'Mirror 2',
      object: 'Figure',
      countText: '{n} images',
      countOne: '1 image',
      ruleText: '360° : {w}° − 1 = {n}',
      ruleNot: '360° : {w}° is not an even number – the number of images depends on where the figure stands.',
      selText: 'Image after {k} reflection(s): {seq}{rev}',
      selRev: ' – reversed',
      selSame: ' – not reversed',
      selHidden: ' This image cannot be seen from the eye (the light path would miss the mirror).',
      tapHint: 'Tap an image to see its light path.',
      listTitle: 'The images (number = reflections)',
      mirrorShort: 'Mirror',
      more: '… and {n} more',
      countCard: 'Images',
      reversed: 'reversed',
      notReversed: 'not reversed',
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
    let laser = p.la;
    let sweep = 1;
    let candleG = p.g;
    let candleDir = 1;
    let wedge = p.w;
    let wedgeDir = -1;
    const rows: [number, number][] = [];
    let selected = 0;
    let hoverImg = -1;
    let hint = '';
    let hintUntil = 0;
    const fade = new Tween(380, ease.outCubic);
    const rowPop = new Tween(500, ease.outBack);

    /* ---------- Bereiche ---------- */
    const OFF: Rect = { x: -60, y: -60, w: 1, h: 1 };
    function lawRegions(w = surface.width, h = surface.height): { disc: Rect; card: Rect } {
      if (w >= 640) {
        const cw = Math.round(clamp(w * 0.36, 250, 340));
        return { disc: { x: 0, y: 0, w: w - cw - 12, h }, card: { x: w - cw, y: 0, w: cw, h } };
      }
      const dh = Math.round(Math.min(w * 0.92, h * 0.6));
      return { disc: { x: 0, y: 0, w, h: dh }, card: { x: 0, y: dh + 10, w, h: h - dh - 10 } };
    }
    function imageRegions(w = surface.width, h = surface.height): { scene: Rect; chips: Rect } {
      const ch = w >= 640 ? 64 : Math.round(h * 0.3);
      return { scene: { x: 0, y: 0, w, h: h - ch - 10 }, chips: { x: 0, y: h - ch, w, h: ch } };
    }
    function multiRegions(w = surface.width, h = surface.height): { scene: Rect; card: Rect } {
      if (w >= 640) {
        const sw = Math.min(h * 1.12, w * 0.64);
        return { scene: { x: 0, y: 0, w: sw, h }, card: { x: sw + 12, y: 0, w: w - sw - 12, h } };
      }
      const sh = Math.round(Math.min(w * 0.86, h * 0.68));
      return { scene: { x: 0, y: 0, w, h: sh }, card: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
    }

    const lawPlot = new Plot(surface, { x: [-1.36, 1.36], y: [-1.36, 1.36], pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'law' ? lawRegions(w, h).disc : OFF) });
    const chart = new Plot(surface, {
      x: [0, 90],
      y: [0, 90],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      xAxis: { label: 'α', minStep: 15 },
      yAxis: { label: 'α′', minStep: 15 },
      region: (w, h) => (mode() === 'law' ? chartRect(w, h) : OFF),
    });
    const imgPlot = new Plot(surface, { x: [-85, 55], y: [-14, 72], pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'image' ? imageRegions(w, h).scene : OFF) });
    const multiPlot = new Plot(surface, { x: [-11, 11], y: [-11, 11], pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'multi' ? multiRegions(w, h).scene : OFF) });

    /** Lage des Diagramms in der Karte „Messreihe“. */
    function chartRect(w = surface.width, h = surface.height): Rect {
      const { card } = lawRegions(w, h);
      if (w >= 640) {
        const top = card.y + 52 + MAX_ROWS * 21 + 30;
        return { x: card.x + 8, y: top, w: card.w - 16, h: card.y + card.h - top - 8 };
      }
      const half = Math.round(card.w * 0.5);
      return { x: card.x + half + 4, y: card.y + 8, w: card.w - half - 12, h: card.h - 16 };
    }

    function fitImage(): void {
      const r = imgPlot.rect;
      const s = Math.min(r.w / 116, r.h / 67);
      const xw = r.w / s;
      const yh = r.h / s;
      const yMin = -12 - Math.max(0, yh - 67) * 0.3;
      imgPlot.setRange([-12.5 - xw / 2, -12.5 + xw / 2], [yMin, yMin + yh]);
    }
    function fitMulti(): void {
      const r = multiPlot.rect;
      const s = Math.min(r.w / 23, r.h / 23);
      multiPlot.setRange([-r.w / s / 2, r.w / s / 2], [-r.h / s / 2, r.h / s / 2]);
    }

    /* ---------- Geometrie ---------- */
    const alphaNow = () => incidence(laser, p.tilt);
    const laserLen = () => (narrow() ? 44 : 64);
    const front = () => hitsFront(laser, p.tilt);

    /** Lage eines Punktes zwischen den Spiegeln (Abstand r, Anteil f des Winkels vom linken Spiegel aus). */
    function wedgePoint(r: number, f: number, w = wedge): V2 {
      const a = rad(90 + w / 2 - f * w);
      return [r * Math.cos(a), r * Math.sin(a)];
    }
    function wedgeParams(x: number, y: number, w = wedge): { r: number; f: number } {
      const r = Math.hypot(x, y);
      let a = (Math.atan2(y, x) * 180) / Math.PI;
      if (a < -90) a += 360;
      return { r, f: (90 + w / 2 - a) / w };
    }
    const figure = () => wedgePoint(p.r, p.f);
    const eyeW = () => wedgePoint(p.er, p.ef);

    /* ---------- Ziehen ---------- */
    const stop = () => {
      if (ctx.clock.playing) ctx.clock.pause();
    };
    const on = (m: Mode) => () => mode() === m && !ctx.locked;
    lawPlot.addHandle({
      get: () => {
        const d = dirFromVertical(laser);
        const k = LASER_R + laserLen() / 2 / lawPlot.scale.x;
        return [d[0] * k, d[1] * k];
      },
      set: (x, y) => {
        stop();
        ctx.set({ la: clamp(Math.round((Math.atan2(-x, y) * 180) / Math.PI), -85, 85) });
      },
      enabled: on('law'),
      color: () => '#ff3b30',
    });
    lawPlot.addHandle({
      get: () => {
        const a = rad(p.tilt);
        return [Math.cos(a) * 0.62, Math.sin(a) * 0.62];
      },
      set: (x, y) => {
        stop();
        let a = (Math.atan2(y, x) * 180) / Math.PI;
        if (a > 90) a -= 180;
        if (a < -90) a += 180;
        ctx.set({ tilt: clamp(Math.round(a), -45, 45) });
      },
      enabled: on('law'),
      color: () => ctx.theme.series[0]!,
    });
    imgPlot.addHandle({
      get: () => [-candleG, p.h * 0.42],
      set: (x) => {
        stop();
        ctx.set({ g: Math.round(-x) });
      },
      axis: 'x',
      enabled: on('image'),
      color: () => ctx.theme.series[3]!,
    });
    imgPlot.addHandle({
      get: () => [-candleG, p.h + 1.5],
      set: (_x, y) => {
        stop();
        ctx.set({ h: Math.round(y - 1.5) });
      },
      axis: 'y',
      enabled: on('image'),
      color: () => ctx.theme.series[3]!,
    });
    imgPlot.addHandle({
      get: () => [-p.ex, p.ey],
      set: (x, y) => {
        stop();
        ctx.set({ ex: Math.round(-x), ey: Math.round(y) });
      },
      enabled: on('image'),
      color: () => ctx.theme.series[4]!,
    });
    imgPlot.addHandle({
      get: () => [0, p.mt],
      set: (_x, y) => ctx.set({ mt: Math.max(Math.round(y), p.mb + 3) }),
      axis: 'y',
      enabled: on('image'),
      color: () => ctx.theme.series[5]!,
    });
    imgPlot.addHandle({
      get: () => [0, p.mb],
      set: (_x, y) => ctx.set({ mb: Math.min(Math.round(y), p.mt - 3) }),
      axis: 'y',
      enabled: on('image'),
      color: () => ctx.theme.series[5]!,
    });
    multiPlot.addHandle({
      get: figure,
      set: (x, y) => {
        stop();
        const { r, f } = wedgeParams(x, y);
        ctx.set({ r: clamp(r, 2, 9), f: clamp(f, 0.05, 0.95) });
      },
      enabled: on('multi'),
      color: () => ctx.theme.series[1]!,
    });
    multiPlot.addHandle({
      get: eyeW,
      set: (x, y) => {
        stop();
        const { r, f } = wedgeParams(x, y);
        ctx.set({ er: clamp(r, 2, 9.5), ef: clamp(f, 0.05, 0.95) });
      },
      enabled: on('multi'),
      color: () => ctx.theme.series[4]!,
    });
    multiPlot.addHandle({
      get: () => {
        const u = mirrorDir('B', wedge);
        return [u[0] * WEDGE_LEN, u[1] * WEDGE_LEN];
      },
      set: (x, y) => {
        stop();
        let a = (Math.atan2(y, x) * 180) / Math.PI;
        if (a < -90) a += 360;
        ctx.set({ w: clamp(Math.round(2 * (90 - a)), 30, 180) });
      },
      enabled: on('multi'),
      color: () => ctx.theme.series[0]!,
    });

    ctx.clock.onChange((playing) => {
      if (playing) return;
      if (mode() === 'law' && Math.round(laser) !== p.la) ctx.set({ la: Math.round(laser) });
      if (mode() === 'image' && Math.round(candleG) !== p.g) ctx.set({ g: Math.round(candleG) });
      if (mode() === 'multi' && Math.round(wedge) !== p.w) ctx.set({ w: Math.round(wedge) });
    });

    /* ---------- Bilder im Winkelspiegel ---------- */
    let images: MirrorImage[] = [];
    let imagesKey = '';
    function currentImages(): MirrorImage[] {
      const key = `${wedge.toFixed(3)}|${p.r}|${p.f}`;
      if (key !== imagesKey) {
        imagesKey = key;
        images = wedgeImages(wedge, figure()).sort((a, b) => a.seq.length - b.seq.length);
        if (selected >= images.length) selected = 0;
      }
      return images;
    }
    const imgPos = (img: MirrorImage): V2 => img.pos;
    const rowRects: { rect: Rect; index: number }[] = [];
    /** Reihenfolge der Spiegel, z. B. „Spiegel 1 → 2 → 1“. */
    const seqText = (img: MirrorImage) => `${ctx.t('mirrorShort')} ${img.seq.map((m) => (m === 'A' ? '1' : '2')).join(' → ')}`;

    new TapTarget(surface, {
      hit: (px, py) => {
        if (mode() !== 'multi') return null;
        const list = currentImages();
        for (const row of rowRects) {
          const q = row.rect;
          if (px >= q.x && px <= q.x + q.w && py >= q.y && py <= q.y + q.h) return String(row.index);
        }
        const R = Math.max(14, 1.3 * multiPlot.scale.x);
        for (let i = 0; i < list.length; i++) {
          const [x, y] = multiPlot.toPx(...imgPos(list[i]!));
          if (Math.hypot(px - x, py - y) < R) return String(i);
        }
        return null;
      },
      onTap: (id) => {
        selected = Number(id);
        updateReadouts();
        ctx.requestRender();
      },
      onHover: (id) => {
        hoverImg = id === null ? -1 : Number(id);
        ctx.requestRender();
      },
    });

    /* ---------- Ergebnisse ---------- */
    const deg0 = (v: number) => fmt.num(Math.abs(v), 0);

    function readoutTable(): string {
      if (!rows.length) return ctx.t('noRows');
      const head = `<tr><th>Nr.</th><th>α</th><th>α′</th></tr>`;
      const body = rows.map(([a, b], i) => `<tr${i === rows.length - 1 ? ' class="is-current"' : ''}><td>${i + 1}</td><td>${deg0(a)}°</td><td>${deg0(b)}°</td></tr>`).join('');
      return `<table class="mini-table">${head}${body}</table>`;
    }

    function updateReadouts(): void {
      const all = ['angles', 'law', 'glance', 'table', 'dist', 'see', 'need', 'count', 'path'];
      const show: Record<Mode, string[]> = { law: ['angles', 'law', 'glance', 'table'], image: ['dist', 'see', 'need'], multi: ['count', 'path'] };
      for (const k of all) if (!show[mode()].includes(k)) ctx.readout(k, null);
      if (mode() === 'law') {
        const a = alphaNow();
        if (front()) {
          ctx.readout('angles', tr('anglesText', { a: deg0(a), b: deg0(a) }));
          ctx.readout('glance', tr('glanceText', { g: fmt.num(glancingAngle(a), 0) }) + (p.tilt !== 0 ? ` · ${tr('turnText', { t: fmt.num(Math.abs(p.tilt), 0), t2: fmt.num(2 * Math.abs(p.tilt), 0) })}` : ''));
        } else {
          ctx.readout('angles', ctx.t('backHit'));
          ctx.readout('glance', null);
        }
        ctx.readout('law', ctx.t('lawText'));
        ctx.readout('table', { html: readoutTable() });
      } else if (mode() === 'image') {
        ctx.readout('dist', tr('distText', { g: fmt.num(candleG, 0) }));
        const eye: V2 = [-p.ex, p.ey];
        const tip = seesInMirror([-candleG, p.h], eye, p.mb, p.mt);
        const foot = seesInMirror([-candleG, 0], eye, p.mb, p.mt);
        ctx.readout('see', ctx.t(tip && foot ? 'seeAll' : tip ? 'seeTip' : foot ? 'seeFoot' : 'seeNone'));
        const [lo, hi] = neededMirror([-candleG, 0], [-candleG, p.h], eye);
        ctx.readout('need', tr('needText', { a: fmt.num(lo, 1), b: fmt.num(hi, 1), l: fmt.num(hi - lo, 1) }));
      } else {
        const list = currentImages();
        const n = list.length;
        const ratio = 360 / wedge;
        const even = Math.abs(ratio - Math.round(ratio)) < 1e-6 && Math.round(ratio) % 2 === 0;
        ctx.readout('count', {
          html: `<strong>${n === 1 ? ctx.t('countOne') : tr('countText', { n: String(n) })}</strong> · ${even ? tr('ruleText', { w: fmt.num(wedge, 0), n: fmt.num(imageCountRule(wedge), 0) }) : tr('ruleNot', { w: fmt.num(wedge, 1) })}`,
        });
        const img = list[selected];
        if (img) {
          const seq = seqText(img);
          const path = lightPath(wedge, figure(), img, eyeW(), WEDGE_LEN);
          ctx.readout('path', tr('selText', { k: String(img.seq.length), seq, rev: ctx.t(isReversed(img) ? 'selRev' : 'selSame') }) + (path ? '' : ctx.t('selHidden')));
        } else ctx.readout('path', null);
      }
    }

    /* ---------- Zeichenhilfen ---------- */
    function label(str: string, x: number, y: number, opts: { size?: number; color?: string; align?: CanvasTextAlign; baseline?: CanvasTextBaseline; weight?: number; halo?: string } = {}): void {
      const size = opts.size ?? 12;
      g.font = `${opts.weight ?? 700} ${size}px ${ctx.theme.font}`;
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

    /** Leuchtender Laserstrahl (Pixelkoordinaten). */
    function beam(x1: number, y1: number, x2: number, y2: number, strength = 1, arrow = true): void {
      g.save();
      g.lineCap = 'round';
      g.shadowColor = `rgba(255,40,40,${0.85 * strength})`;
      g.shadowBlur = 14;
      g.strokeStyle = `rgba(255,59,48,${strength})`;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.stroke();
      g.shadowBlur = 0;
      g.strokeStyle = `rgba(255,236,230,${0.85 * strength})`;
      g.lineWidth = 1.4;
      g.stroke();
      g.restore();
      if (arrow) arrowHead((x1 + x2) / 2, (y1 + y2) / 2, Math.atan2(y2 - y1, x2 - x1), 11, `rgba(255,59,48,${strength})`);
    }

    /** Lichtstrahl als Linie mit Pfeil (Pixelkoordinaten). */
    function ray(x1: number, y1: number, x2: number, y2: number, color: string, opts: { width?: number; dash?: number[]; alpha?: number; arrow?: boolean } = {}): void {
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
      if (opts.arrow !== false && Math.hypot(x2 - x1, y2 - y1) > 30) arrowHead((x1 + x2) / 2, (y1 + y2) / 2, Math.atan2(y2 - y1, x2 - x1), 9, color);
    }

    /** Spiegel als silberner Balken mit schraffierter Rückseite (Pixel, von a nach b, Vorderseite links von a→b … per Normale). */
    function mirrorBar(ax: number, ay: number, bx: number, by: number, nx: number, ny: number, thick: number): void {
      // n: Einheitsnormale zur Vorderseite (in Pixelrichtung)
      const len = Math.hypot(bx - ax, by - ay);
      const ux = (bx - ax) / len;
      const uy = (by - ay) / len;
      const bxn = -nx * thick;
      const byn = -ny * thick;
      g.save();
      softShadow(g, ctx.theme.dark, 6, 2);
      const grad = g.createLinearGradient(ax, ay, ax + bxn, ay + byn);
      grad.addColorStop(0, '#f4f7fb');
      grad.addColorStop(0.35, '#b9c3cf');
      grad.addColorStop(1, '#6b7684');
      g.fillStyle = grad;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.lineTo(bx + bxn, by + byn);
      g.lineTo(ax + bxn, ay + byn);
      g.closePath();
      g.fill();
      g.restore();
      // Schraffur der Rückseite
      g.save();
      g.strokeStyle = ctx.theme.dark ? 'rgba(200,210,225,0.55)' : 'rgba(40,48,60,0.55)';
      g.lineWidth = 1.2;
      const step = 7;
      for (let s = step / 2; s < len; s += step) {
        const x0 = ax + ux * s + bxn;
        const y0 = ay + uy * s + byn;
        g.beginPath();
        g.moveTo(x0, y0);
        g.lineTo(x0 - nx * 6 - ux * 5, y0 - ny * 6 - uy * 5);
        g.stroke();
      }
      g.restore();
      // glänzende Vorderkante
      g.strokeStyle = 'rgba(255,255,255,0.95)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(ax, ay);
      g.lineTo(bx, by);
      g.stroke();
    }

    /* =================================================================== */
    /* Reflexionsgesetz                                                     */
    /* =================================================================== */

    function drawLaw(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const { disc, card: cr } = lawRegions();
      lawPlot.begin();
      // Tisch
      const bg = g.createLinearGradient(0, disc.y, 0, disc.y + disc.h);
      bg.addColorStop(0, dark ? '#141b26' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0f151e' : '#e2e8f0');
      g.fillStyle = bg;
      g.fillRect(disc.x, disc.y, disc.w, disc.h);
      const ext = narrow() ? 1.44 : 1.36;
      lawPlot.setRange([-ext, ext], [-ext, ext]);
      const s = lawPlot.scale.x;
      const [cx, cy] = lawPlot.toPx(0, 0);
      const R = s;
      // Scheibe (dreht sich mit dem Spiegel)
      g.save();
      softShadow(g, dark, 18, 5);
      const dg = g.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
      dg.addColorStop(0, dark ? '#2b3443' : '#ffffff');
      dg.addColorStop(1, dark ? '#1d2430' : '#eef1f5');
      g.fillStyle = dg;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.strokeStyle = dark ? 'rgba(255,255,255,0.18)' : 'rgba(30,40,55,0.3)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.stroke();
      const tilt = rad(p.tilt);
      if (p.scale) {
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.55);
        for (let d = 0; d < 360; d += 2) {
          const a = rad(d) + tilt;
          const len = d % 10 === 0 ? 12 : d % 2 === 0 && d % 10 === 5 ? 8 : 5;
          if (d % 10 !== 0 && d % 5 !== 0 && R < 150) continue;
          g.lineWidth = d % 10 === 0 ? 1.4 : 0.9;
          g.beginPath();
          g.moveTo(cx + Math.sin(a) * R, cy - Math.cos(a) * R);
          g.lineTo(cx + Math.sin(a) * (R - len), cy - Math.cos(a) * (R - len));
          g.stroke();
          if (d % 30 === 0) {
            const fromNormal = Math.min(d % 180, 180 - (d % 180));
            text(g, `${fromNormal}°`, cx + Math.sin(a) * (R - 25), cy - Math.cos(a) * (R - 25), { font: `600 ${narrow() ? 10.5 : 11}px ${theme.font}`, color: theme.muted });
          }
        }
        g.restore();
      }
      // Lot (senkrecht auf dem Spiegel)
      const nrm: V2 = [-Math.sin(tilt), Math.cos(tilt)];
      g.save();
      g.strokeStyle = theme.text;
      g.globalAlpha = 0.75;
      g.setLineDash([7, 6]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - nrm[0] * R * 0.2, cy + nrm[1] * R * 0.2);
      g.lineTo(cx + nrm[0] * R * 1.08, cy - nrm[1] * R * 1.08);
      g.stroke();
      g.restore();
      // Spiegel
      const mu: V2 = [Math.cos(tilt), Math.sin(tilt)];
      const mlen = R * 0.62;
      mirrorBar(cx - mu[0] * mlen, cy + mu[1] * mlen, cx + mu[0] * mlen, cy - mu[1] * mlen, -nrm[0], -nrm[1], Math.max(8, R * 0.05));
      // Strahlen
      const a = alphaNow();
      const inDir = dirFromVertical(laser);
      const [lx, ly] = [cx + inDir[0] * R * LASER_R, cy - inDir[1] * R * LASER_R];
      if (front()) {
        beam(lx, ly, cx, cy);
        const out = dirFromVertical(reflectedAngle(laser, p.tilt));
        const ex = cx + out[0] * R * 1.12;
        const ey = cy - out[1] * R * 1.12;
        beam(cx, cy, ex, ey);
        // Winkelbögen (Bildschirmwinkel: Lot zeigt nach oben bei −π/2 − tilt)
        const nAng = Math.atan2(-nrm[1], nrm[0]);
        const inAng = Math.atan2(-inDir[1], inDir[0]);
        const outAng = Math.atan2(-out[1], out[0]);
        const arc = (from: number, to: number, r0: number, color: string, txt: string) => {
          let d = to - from;
          d = Math.atan2(Math.sin(d), Math.cos(d));
          if (Math.abs(d) < 0.01) return;
          g.save();
          g.fillStyle = withAlpha(color, 0.16);
          g.beginPath();
          g.moveTo(cx, cy);
          g.arc(cx, cy, r0, from, from + d, d < 0);
          g.closePath();
          g.fill();
          g.strokeStyle = color;
          g.lineWidth = 2.2;
          g.beginPath();
          g.arc(cx, cy, r0, from, from + d, d < 0);
          g.stroke();
          g.restore();
          const mid = from + d / 2;
          labels.push({ txt, color, mid, r: r0, side: Math.sign(d) });
        };
        const labels: { txt: string; color: string; mid: number; r: number; side: number }[] = [];
        const r0 = Math.max(46, R * 0.3);
        if (Math.abs(a) > 0.5) {
          arc(nAng, inAng, r0, theme.series[3]!, `α = ${deg0(a)}°`);
          arc(nAng, outAng, r0 * 0.78, theme.series[0]!, `α′ = ${deg0(a)}°`);
        }
        // Beschriftungen: auf der Winkelhalbierenden oder (bei kleinen Winkeln) seitlich neben dem Lot
        const size = narrow() ? 11 : 12;
        g.font = `700 ${size}px ${theme.font}`;
        const pair = labels.slice(0, 2);
        const wMax = Math.max(...pair.map((l) => g.measureText(l.txt).width + 16), 0);
        const rr = r0 + 24;
        const sep = 2 * rr * Math.sin(Math.abs(rad(a)) / 2);
        for (const l of pair) {
          if (sep > wMax + 8) pill(l.txt, cx + Math.cos(l.mid) * (l.r + 24), cy + Math.sin(l.mid) * (l.r + 20), l.color, { size });
          else {
            const nx = cx + Math.cos(nAng) * (r0 + 30);
            const ny = cy + Math.sin(nAng) * (r0 + 30);
            // senkrecht zum Lot zur Seite des jeweiligen Strahls
            const px = -Math.sin(nAng) * l.side;
            const py = Math.cos(nAng) * l.side;
            pill(l.txt, nx + px * (wMax / 2 + 6), ny + py * (wMax / 2 + 6) * 0.35, l.color, { size });
          }
        }
        labels.length = 0;
        if (p.gl) {
          // Winkel zwischen Strahl und Spiegelfläche
          const sIn: number = a >= 0 ? Math.atan2(mu[1], -mu[0]) : Math.atan2(-mu[1], mu[0]);
          const sOut: number = a >= 0 ? Math.atan2(-mu[1], mu[0]) : Math.atan2(mu[1], -mu[0]);
          arc(sIn, inAng, r0 * 1.45, theme.series[2]!, `${fmt.num(glancingAngle(a), 0)}°`);
          arc(sOut, outAng, r0 * 1.45, theme.series[2]!, `${fmt.num(glancingAngle(a), 0)}°`);
          for (const l of labels) pill(l.txt, cx + Math.cos(l.mid) * (l.r + 22), cy + Math.sin(l.mid) * (l.r + 18), l.color, { size });
        }
      } else {
        // Licht trifft die Rückseite
        const hitR = Math.max(10, R * 0.06);
        beam(lx, ly, cx + inDir[0] * hitR, cy - inDir[1] * hitR, 1, true);
        pill(ctx.t('backHit'), cx, disc.y + 24, theme.series[1]!, { size: 12, solid: true });
      }
      drawLaser(lx, ly, Math.atan2(cy - ly, cx - lx));
      // „Lot“ auf der vom Laser abgewandten Seite des Lots
      const side = alphaNow() >= 0 ? 1 : -1;
      const lpX = cx + nrm[0] * R * 0.84 + nrm[1] * 16 * side;
      const lpY = cy - nrm[1] * R * 0.84 + nrm[0] * 16 * side;
      label(ctx.t('normal'), lpX, lpY, { size: 12, color: theme.muted, align: side > 0 ? 'left' : 'right' });
      lawPlot.end();
      drawTableCard(cr);
    }

    function drawLaser(x: number, y: number, ang: number): void {
      const len = laserLen();
      const hgt = narrow() ? 15 : 19;
      g.save();
      g.translate(x, y);
      g.rotate(ang);
      g.shadowColor = 'rgba(0,0,0,0.35)';
      g.shadowBlur = 8;
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
      g.arc(-len * 0.62, 0, 3.5, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    function drawTableCard(r: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      card(r, small ? undefined : ctx.t('tableTitle'));
      const tw = small ? Math.round(r.w * 0.5) - 12 : r.w - 28;
      const tx = r.x + 14;
      let ty = small ? r.y + 14 : r.y + 40;
      if (small) text(g, ctx.t('tableTitle'), tx, ty + 4, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
      if (small) ty += 18;
      const colX = [tx + 4, tx + tw * 0.36, tx + tw * 0.72];
      const head = ['Nr.', 'α', 'α′'];
      const rowH = small ? 17 : 21;
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.05)' : 'rgba(16,24,40,0.05)';
      roundRect(g, tx - 4, ty, tw + 8, rowH, 6);
      g.fill();
      head.forEach((h, i) => text(g, h, colX[i]!, ty + rowH / 2 + 0.5, { font: `700 12px ${theme.font}`, color: i === 1 ? theme.series[3]! : i === 2 ? theme.series[0]! : theme.muted, align: 'left' }));
      ty += rowH + 2;
      const maxRows = small ? Math.max(1, Math.floor((r.y + r.h - ty - 6) / rowH)) : MAX_ROWS;
      if (!rows.length) {
        const lines = wrap(ctx.t('emptyTable'), tw, `500 12px ${theme.font}`);
        lines.slice(0, maxRows).forEach((ln, i) => text(g, ln, tx, ty + 10 + i * 16, { font: `500 12px ${theme.font}`, color: theme.muted, align: 'left' }));
      }
      const shown = rows.slice(-maxRows);
      const offset = rows.length - shown.length;
      shown.forEach(([a, b], i) => {
        const y = ty + i * rowH + rowH / 2;
        const isNew = i === shown.length - 1 && rowPop.running;
        const k = isNew ? rowPop.value : 1;
        g.save();
        g.globalAlpha = Math.min(1, k);
        text(g, String(offset + i + 1), colX[0]!, y, { font: `600 12px ${theme.font}`, color: theme.muted, align: 'left' });
        text(g, `${deg0(a)}°`, colX[1]!, y, { font: `700 ${12 * (0.8 + 0.2 * k)}px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, `${deg0(b)}°`, colX[2]!, y, { font: `700 ${12 * (0.8 + 0.2 * k)}px ${theme.font}`, color: theme.text, align: 'left' });
        g.restore();
      });
      // Diagramm α′ über α
      chart.setRangePadded([0, 90], [0, 90], { left: 34, bottom: 24, top: 12, right: 12 });
      chart.begin();
      const cr = chart.rect;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      g.fillRect(cr.x, cr.y, cr.w, cr.h);
      chart.grid();
      chart.axes();
      chart.segment([0, 0], [90, 90], { color: theme.muted, width: 1.5, dash: [5, 5] });
      chart.text(62, 70, 'α′ = α', { color: theme.muted, size: 11, align: 'right' });
      for (const [a, b] of rows) chart.point(Math.abs(a), Math.abs(b), { color: theme.series[0]!, radius: 5 });
      if (front()) chart.point(Math.abs(alphaNow()), Math.abs(alphaNow()), { color: theme.series[3]!, radius: 5, hollow: true });
      chart.end();
    }

    /* =================================================================== */
    /* Spiegelbild                                                          */
    /* =================================================================== */

    function drawCandle(x: number, h: number, alpha: number, ghost: boolean): void {
      // x, h in Welt-cm; Docht oben bei h − 4,5, Flammenspitze bei h
      const s = imgPlot.scale.x;
      const [px, py0] = imgPlot.toPx(x, 0);
      const bodyTop = h - 5;
      const [, pyT] = imgPlot.toPx(x, bodyTop);
      const w = 3.2 * s;
      g.save();
      g.globalAlpha = alpha;
      // Kerzenkörper
      const wax = g.createLinearGradient(px - w / 2, 0, px + w / 2, 0);
      wax.addColorStop(0, '#d9c7a8');
      wax.addColorStop(0.35, '#fbf3e3');
      wax.addColorStop(1, '#c8b38f');
      g.fillStyle = wax;
      roundRect(g, px - w / 2, pyT, w, py0 - pyT, Math.min(4, w / 3));
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.35)';
      g.beginPath();
      g.ellipse(px, pyT + 1.5, w / 2 - 1, Math.max(1.5, w * 0.12), 0, 0, Math.PI * 2);
      g.fill();
      // Docht
      const [, pyW] = imgPlot.toPx(x, bodyTop + 1.2);
      g.strokeStyle = '#2b2118';
      g.lineWidth = Math.max(1.5, 0.25 * s);
      g.beginPath();
      g.moveTo(px, pyT);
      g.lineTo(px, pyW);
      g.stroke();
      // Flamme
      const [, pyTip] = imgPlot.toPx(x, h);
      const [, pyBase] = imgPlot.toPx(x, bodyTop + 0.6);
      const fh = pyBase - pyTip;
      const fw = Math.max(5, 1.15 * s);
      if (!ghost) {
        const glow = g.createRadialGradient(px, pyTip + fh * 0.6, 0, px, pyTip + fh * 0.6, fh * 2.6);
        glow.addColorStop(0, 'rgba(255,190,80,0.45)');
        glow.addColorStop(1, 'rgba(255,170,60,0)');
        g.fillStyle = glow;
        g.beginPath();
        g.arc(px, pyTip + fh * 0.6, fh * 2.6, 0, Math.PI * 2);
        g.fill();
      }
      const fl = g.createLinearGradient(0, pyTip, 0, pyBase);
      fl.addColorStop(0, '#fff3b0');
      fl.addColorStop(0.45, '#ffc23d');
      fl.addColorStop(0.85, '#ff7a1a');
      fl.addColorStop(1, '#4a7bff');
      g.fillStyle = fl;
      g.beginPath();
      g.moveTo(px, pyTip);
      g.bezierCurveTo(px + fw * 0.9, pyTip + fh * 0.45, px + fw, pyBase - fh * 0.05, px, pyBase);
      g.bezierCurveTo(px - fw, pyBase - fh * 0.05, px - fw * 0.9, pyTip + fh * 0.45, px, pyTip);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.7)';
      g.beginPath();
      g.ellipse(px, pyBase - fh * 0.32, fw * 0.32, fh * 0.2, 0, 0, Math.PI * 2);
      g.fill();
      g.restore();
      if (ghost) {
        g.save();
        g.strokeStyle = withAlpha(ctx.theme.series[3]!, 0.85);
        g.setLineDash([4, 4]);
        g.lineWidth = 1.3;
        roundRect(g, px - w / 2, pyT, w, py0 - pyT, Math.min(4, w / 3));
        g.stroke();
        g.restore();
      }
    }

    function drawEye(x: number, y: number, s: number): void {
      // Auge schaut nach rechts (zum Spiegel)
      const w = Math.max(26, 7 * s);
      const h = w * 0.5;
      g.save();
      g.translate(x, y);
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
      g.save();
      g.clip();
      const iris = g.createRadialGradient(w * 0.12, 0, 0, w * 0.12, 0, h * 0.62);
      iris.addColorStop(0, '#1d5ea8');
      iris.addColorStop(0.7, '#3d8bd6');
      iris.addColorStop(1, '#174777');
      g.fillStyle = iris;
      g.beginPath();
      g.arc(w * 0.12, 0, h * 0.62, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#0b0f16';
      g.beginPath();
      g.arc(w * 0.16, 0, h * 0.28, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.9)';
      g.beginPath();
      g.arc(w * 0.06, -h * 0.18, h * 0.12, 0, Math.PI * 2);
      g.fill();
      g.restore();
      g.restore();
    }

    function drawImageMode(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const { scene, chips } = imageRegions();
      fitImage();
      imgPlot.begin();
      const s = imgPlot.scale.x;
      const [mx0] = imgPlot.toPx(0, 0);
      // Raum vor dem Spiegel und „Spiegelwelt“ dahinter
      const wall = g.createLinearGradient(0, scene.y, 0, scene.y + scene.h);
      wall.addColorStop(0, dark ? '#18202c' : '#f3f6fa');
      wall.addColorStop(1, dark ? '#121923' : '#e6ebf1');
      g.fillStyle = wall;
      g.fillRect(scene.x, scene.y, mx0 - scene.x, scene.h);
      const mw = g.createLinearGradient(0, scene.y, 0, scene.y + scene.h);
      mw.addColorStop(0, dark ? '#1b2433' : '#e7edf6');
      mw.addColorStop(1, dark ? '#151c28' : '#dbe3ee');
      g.fillStyle = mw;
      g.fillRect(mx0, scene.y, scene.x + scene.w - mx0, scene.h);
      // Tisch (und sein Spiegelbild)
      const [, tY] = imgPlot.toPx(0, 0);
      const [, tB] = imgPlot.toPx(0, -3.5);
      const table = (x0: number, x1: number, alpha: number) => {
        g.save();
        g.globalAlpha = alpha;
        const wood = g.createLinearGradient(0, tY, 0, tB);
        wood.addColorStop(0, dark ? '#7a5a3c' : '#c79a69');
        wood.addColorStop(1, dark ? '#4f3a27' : '#9a7048');
        g.fillStyle = wood;
        g.fillRect(x0, tY, x1 - x0, tB - tY);
        g.fillStyle = dark ? 'rgba(0,0,0,0.25)' : 'rgba(80,55,30,0.18)';
        g.fillRect(x0, tB, x1 - x0, scene.y + scene.h - tB);
        g.restore();
      };
      table(scene.x, mx0, 1);
      table(mx0, scene.x + scene.w, 0.38);
      label(ctx.t('world'), mx0 + (scene.x + scene.w - mx0) / 2, scene.y + 18, { size: 12, color: theme.muted, weight: 600 });
      label(ctx.t('room'), scene.x + (mx0 - scene.x) / 2, scene.y + 18, { size: 12, color: theme.muted, weight: 600 });

      const eye: V2 = [-p.ex, p.ey];
      const tip: V2 = [-candleG, p.h];
      const foot: V2 = [-candleG, 0.4];
      const tipImg = mirrorImage(tip);
      const footImg = mirrorImage(foot);
      const [ex, ey] = imgPlot.toPx(eye[0], eye[1]);
      // Sichtbereich des Auges im Spiegel
      if (p.fov) {
        const eImg = mirrorImage(eye);
        const far = (y0: number) => {
          // Strahl von E′ durch (0, y0) in den Raum vor dem Spiegel verlängern
          const t = 200;
          return [eImg[0] + (0 - eImg[0]) * t, eImg[1] + (y0 - eImg[1]) * t] as V2;
        };
        const a = far(p.mt);
        const b = far(p.mb);
        const pts: V2[] = [[0, p.mt], a, b, [0, p.mb]];
        g.save();
        g.fillStyle = withAlpha(theme.series[4]!, dark ? 0.14 : 0.1);
        g.beginPath();
        pts.forEach(([x, y], i) => {
          const [qx, qy] = imgPlot.toPx(x, y);
          if (i === 0) g.moveTo(qx, qy);
          else g.lineTo(qx, qy);
        });
        g.closePath();
        g.fill();
        g.strokeStyle = withAlpha(theme.series[4]!, 0.7);
        g.setLineDash([6, 5]);
        g.lineWidth = 1.3;
        for (const yy of [p.mt, p.mb]) {
          const [qx, qy] = imgPlot.toPx(0, yy);
          const f = far(yy);
          const [fx, fy] = imgPlot.toPx(f[0], f[1]);
          g.beginPath();
          g.moveTo(qx, qy);
          g.lineTo(fx, fy);
          g.stroke();
          // gestrichelt nach hinten zum Bild des Auges
          const [ix, iy] = imgPlot.toPx(eImg[0], eImg[1]);
          g.globalAlpha = 0.45;
          g.beginPath();
          g.moveTo(qx, qy);
          g.lineTo(ix, iy);
          g.stroke();
          g.globalAlpha = 1;
        }
        g.restore();
      }
      // Konstruktion: Lote und Abstände
      if (p.con) {
        const [tx, ty] = imgPlot.toPx(tip[0], tip[1]);
        const [ix, iy] = imgPlot.toPx(tipImg[0], tipImg[1]);
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.5);
        g.setLineDash([2, 4]);
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(tx, ty);
        g.lineTo(ix, iy);
        g.stroke();
        g.restore();
        // rechter Winkel am Spiegel
        const q = 7;
        g.strokeStyle = withAlpha(theme.text, 0.6);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(mx0 - q, ty);
        g.lineTo(mx0 - q, ty - q);
        g.lineTo(mx0, ty - q);
        g.stroke();
        // Maßpfeile g und b unter dem Tisch
        const [, dy] = imgPlot.toPx(0, -8);
        const dim = (x0: number, x1: number, str: string, color: string) => {
          g.strokeStyle = color;
          g.fillStyle = color;
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(x0, dy);
          g.lineTo(x1, dy);
          g.moveTo(x0, dy - 5);
          g.lineTo(x0, dy + 5);
          g.moveTo(x1, dy - 5);
          g.lineTo(x1, dy + 5);
          g.stroke();
          pill(str, (x0 + x1) / 2, dy, color, { size: narrow() ? 11 : 12 });
        };
        const [cx] = imgPlot.toPx(-candleG, 0);
        const [cix] = imgPlot.toPx(candleG, 0);
        dim(cx, mx0, `g = ${fmt.num(candleG, 0)} cm`, theme.series[3]!);
        dim(mx0, cix, `b = ${fmt.num(candleG, 0)} cm`, theme.series[0]!);
      }
      // Spiegelbild der Kerze
      drawCandle(candleG, p.h, 0.42, true);
      // Sehstrahlen
      const rays: [V2, V2, string][] = [
        [tip, tipImg, theme.series[3]!],
        [foot, footImg, theme.series[5]!],
      ];
      for (const [src, img, color] of rays) {
        const hitP = reflectionPoint(src, eye);
        const ok = hitP[1] >= p.mb - 1e-9 && hitP[1] <= p.mt + 1e-9;
        const [sx, sy] = imgPlot.toPx(src[0], src[1]);
        const [hx, hy] = imgPlot.toPx(hitP[0], hitP[1]);
        const [ix, iy] = imgPlot.toPx(img[0], img[1]);
        if (ok) {
          ray(sx, sy, hx, hy, color, { width: 2.2 });
          ray(hx, hy, ex, ey, color, { width: 2.2 });
          ray(hx, hy, ix, iy, color, { width: 1.6, dash: [6, 5], alpha: 0.8, arrow: false });
          g.fillStyle = color;
          g.beginPath();
          g.arc(hx, hy, 3.5, 0, Math.PI * 2);
          g.fill();
        } else {
          ray(ex, ey, hx, hy, withAlpha(theme.muted, 0.9), { width: 1.4, dash: [3, 5], arrow: false });
          ray(hx, hy, ix, iy, withAlpha(theme.muted, 0.6), { width: 1.2, dash: [3, 5], arrow: false });
          g.strokeStyle = theme.series[1]!;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(hx - 5, hy - 5);
          g.lineTo(hx + 5, hy + 5);
          g.moveTo(hx + 5, hy - 5);
          g.lineTo(hx - 5, hy + 5);
          g.stroke();
          label(ctx.t('missed'), hx - 8, hy, { size: 11, color: theme.series[1]!, align: 'right' });
        }
      }
      // Wand über und unter dem Spiegel, Spiegel
      const [, mTop] = imgPlot.toPx(0, p.mt);
      const [, mBot] = imgPlot.toPx(0, p.mb);
      g.fillStyle = dark ? '#2a3240' : '#c9d1dc';
      g.fillRect(mx0, scene.y, 4, scene.h);
      mirrorBar(mx0, mBot, mx0, mTop, -1, 0, Math.max(7, 1.3 * s));
      // Kerze und Auge
      drawCandle(-candleG, p.h, 1, false);
      drawEye(ex, ey, s);
      // Beschriftungen
      const [cxl] = imgPlot.toPx(-candleG, 0);
      const [cil] = imgPlot.toPx(candleG, 0);
      const [, labY] = imgPlot.toPx(0, p.h + 4.5);
      label(ctx.t('candle'), cxl, labY, { size: 12 });
      label(ctx.t('image'), cil, labY, { size: 12, color: theme.series[3]! });
      label(ctx.t('eye'), ex, ey - Math.max(26, 7 * s) * 0.5 - 8, { size: 12, color: theme.series[4]! });
      label(ctx.t('mirror'), mx0 + 10, mTop - 10, { size: 12, align: 'left' });
      imgPlot.end();
      drawChips(chips);
    }

    function drawChips(r: Rect): void {
      const theme = ctx.theme;
      const small = narrow();
      card(r);
      const items: [string, string][] = [
        [ctx.t(small ? 'pVirtualLong' : 'pVirtual'), theme.series[4]!],
        [ctx.t('pUpright'), theme.series[2]!],
        [ctx.t('pSame'), theme.series[5]!],
        [ctx.t('pDist'), theme.series[0]!],
        [ctx.t(small ? 'pRevLong' : 'pRev'), theme.series[3]!],
      ];
      const size = small ? 12 : 12.5;
      let x = r.x + 14;
      let y = r.y + r.h / 2;
      if (!small) {
        text(g, `${ctx.t('props')}:`, x, y, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
        g.font = `700 13px ${theme.font}`;
        x += g.measureText(`${ctx.t('props')}:`).width + 12;
        for (const [str, col] of items) {
          g.font = `700 ${size}px ${theme.font}`;
          const w = g.measureText(str).width + 16;
          if (x + w > r.x + r.w - 10) break;
          pill(str, x, y, col, { size, align: 'left' });
          x += w + 8;
        }
      } else {
        y = r.y + 22;
        text(g, ctx.t('props'), x, y, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
        y += 26;
        for (const [str, col] of items) {
          g.font = `700 ${size}px ${theme.font}`;
          const w = g.measureText(str).width + 16;
          if (x + w > r.x + r.w - 10) {
            x = r.x + 14;
            y += 28;
          }
          if (y > r.y + r.h - 12) break;
          pill(str, x, y, col, { size, align: 'left' });
          x += w + 8;
        }
      }
    }

    /* =================================================================== */
    /* Winkelspiegel                                                        */
    /* =================================================================== */

    function figurePath(transform: (v: V2) => V2, pts: V2[], scale: number, at: V2): V2[] {
      return pts.map(([x, y]) => transform([at[0] + x * scale, at[1] + y * scale]));
    }

    function drawFigure(base: V2, apply: (v: V2) => V2, alpha: number, highlight: boolean): void {
      const theme = ctx.theme;
      const sc = 0.85;
      const poly = (pts: V2[], fill: string) => {
        g.beginPath();
        pts.forEach((pt, i) => {
          const [x, y] = multiPlot.toPx(pt[0], pt[1]);
          if (i === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        });
        g.closePath();
        g.fillStyle = fill;
        g.fill();
        g.strokeStyle = 'rgba(0,0,0,0.35)';
        g.lineWidth = 1;
        g.stroke();
      };
      g.save();
      g.globalAlpha = alpha;
      if (highlight) {
        g.shadowColor = withAlpha(theme.series[3]!, 0.9);
        g.shadowBlur = 14;
      }
      poly(figurePath(apply, FIGURE_POLE, sc, base), theme.series[0]!);
      poly(figurePath(apply, FIGURE_FLAG, sc, base), theme.series[1]!);
      g.restore();
    }

    function drawMulti(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const { scene, card: cr } = multiRegions();
      fitMulti();
      multiPlot.begin();
      const s = multiPlot.scale.x;
      const [hx, hy] = multiPlot.toPx(0, 0);
      // Tischplatte
      const bg = g.createLinearGradient(0, scene.y, 0, scene.y + scene.h);
      bg.addColorStop(0, dark ? '#121925' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0f141d' : '#e4e9f0');
      g.fillStyle = bg;
      g.fillRect(scene.x, scene.y, scene.w, scene.h);
      const w = wedge;
      const aA = rad(90 + w / 2);
      const aB = rad(90 - w / 2);
      const R = Math.hypot(scene.w, scene.h);
      // echter Raum zwischen den Spiegeln
      g.save();
      g.fillStyle = dark ? 'rgba(255,214,140,0.07)' : 'rgba(255,214,140,0.22)';
      g.beginPath();
      g.moveTo(hx, hy);
      g.arc(hx, hy, R, -aA, -aB);
      g.closePath();
      g.fill();
      g.restore();
      // Spiegelräume
      if (p.sect && w < 180) {
        g.save();
        g.strokeStyle = withAlpha(theme.muted, 0.45);
        g.setLineDash([4, 6]);
        g.lineWidth = 1.2;
        for (let k = 1; k * w < 360 - 1e-6; k++) {
          for (const sgn of [1, -1]) {
            const a = sgn > 0 ? aA + k * rad(w) : aB - k * rad(w);
            g.beginPath();
            g.moveTo(hx, hy);
            g.lineTo(hx + Math.cos(a) * WEDGE_LEN * s, hy - Math.sin(a) * WEDGE_LEN * s);
            g.stroke();
          }
        }
        g.restore();
      }
      const list = currentImages();
      const fig = figure();
      // Bilder (je mehr Spiegelungen, desto blasser)
      list.forEach((img, i) => {
        const apply = (v: V2) => img.seq.reduce<V2>((q, m) => reflectAcross(q, m, w), v);
        drawFigure(fig, apply, Math.max(0.35, 0.9 * 0.82 ** (img.seq.length - 1)), i === selected || i === hoverImg);
        const [x, y] = multiPlot.toPx(...img.pos);
        const badge = String(img.seq.length);
        g.font = `700 11px ${theme.font}`;
        g.fillStyle = i === selected ? theme.series[3]! : dark ? 'rgba(20,26,36,0.9)' : 'rgba(255,255,255,0.92)';
        g.beginPath();
        g.arc(x + 0.95 * s, y - 0.95 * s, 9, 0, Math.PI * 2);
        g.fill();
        g.strokeStyle = i === selected ? '#ffffff' : withAlpha(theme.muted, 0.6);
        g.lineWidth = 1;
        g.stroke();
        text(g, badge, x + 0.95 * s, y - 0.95 * s + 0.5, { font: `700 11px ${theme.font}`, color: i === selected ? '#ffffff' : theme.text });
      });
      // Lichtweg zum ausgewählten Bild
      const sel = list[selected];
      const eye = eyeW();
      if (sel) {
        const path = lightPath(w, fig, sel, eye, WEDGE_LEN);
        if (path) {
          const pts = path.map((q) => multiPlot.toPx(q[0], q[1]));
          for (let k = 0; k < pts.length - 1; k++) ray(pts[k]![0], pts[k]![1], pts[k + 1]![0], pts[k + 1]![1], theme.series[3]!, { width: 2.4 });
          const last = pts[pts.length - 2]!;
          const [ix, iy] = multiPlot.toPx(...sel.pos);
          ray(last[0], last[1], ix, iy, theme.series[3]!, { width: 1.6, dash: [6, 5], alpha: 0.75, arrow: false });
          for (let k = 1; k < pts.length - 1; k++) {
            g.fillStyle = theme.series[3]!;
            g.beginPath();
            g.arc(pts[k]![0], pts[k]![1], 3.5, 0, Math.PI * 2);
            g.fill();
          }
        } else {
          const [ex, ey] = multiPlot.toPx(...eye);
          const [ix, iy] = multiPlot.toPx(...sel.pos);
          ray(ex, ey, ix, iy, withAlpha(theme.muted, 0.8), { width: 1.4, dash: [3, 5], arrow: false });
        }
      }
      // Spiegel
      for (const id of ['A', 'B'] as const) {
        const u = mirrorDir(id, w);
        const n = mirrorNormal(id, w);
        const [ex, ey] = multiPlot.toPx(u[0] * WEDGE_LEN, u[1] * WEDGE_LEN);
        mirrorBar(hx, hy, ex, ey, n[0], -n[1], Math.max(7, 0.32 * s));
        const [lx, ly] = multiPlot.toPx(u[0] * (WEDGE_LEN + 0.9), u[1] * (WEDGE_LEN + 0.9));
        if (w < 170 || id === 'A') label(ctx.t(id === 'A' ? 'mirror1' : 'mirror2'), lx, ly, { size: 12, color: theme.muted });
      }
      // Scharnier
      g.fillStyle = dark ? '#cfd6e0' : '#4a5361';
      g.beginPath();
      g.arc(hx, hy, 5, 0, Math.PI * 2);
      g.fill();
      // Figur und Auge
      drawFigure(fig, (v) => v, 1, false);
      const [ex, ey] = multiPlot.toPx(...eye);
      g.save();
      // Auge blickt zum Scharnier hin
      g.translate(ex, ey);
      g.rotate(Math.atan2(hy - ey, hx - ex));
      drawEye(0, 0, Math.max(3.4, s * 0.22));
      g.restore();
      // Winkelbogen
      g.strokeStyle = theme.series[2]!;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(hx, hy, Math.max(26, 1.6 * s), -aA, -aB);
      g.stroke();
      label(`${fmt.num(w, 0)}°`, hx, hy - Math.max(26, 1.6 * s) - 12, { size: 13, color: theme.series[2]! });
      multiPlot.end();
      drawMultiCard(cr, list);
    }

    function drawMultiCard(r: Rect, list: MirrorImage[]): void {
      const theme = ctx.theme;
      const small = narrow();
      card(r);
      const n = list.length;
      let y = r.y + (small ? 24 : 34);
      const x = r.x + 16;
      text(g, String(n), x, y + (small ? 2 : 6), { font: `800 ${small ? 26 : 40}px ${theme.font}`, color: theme.series[3]!, align: 'left', baseline: 'middle' });
      g.font = `800 ${small ? 26 : 40}px ${theme.font}`;
      const nw = g.measureText(String(n)).width;
      text(g, n === 1 ? ctx.t('countOne').replace(/^1\s*/, '') : ctx.t('countCard'), x + nw + 8, y + (small ? 4 : 10), { font: `700 ${small ? 14 : 16}px ${theme.font}`, color: theme.text, align: 'left' });
      y += small ? 30 : 44;
      const ratio = 360 / wedge;
      const even = Math.abs(ratio - Math.round(ratio)) < 1e-6 && Math.round(ratio) % 2 === 0;
      const ruleStr = even ? tr('ruleText', { w: fmt.num(wedge, 0), n: fmt.num(imageCountRule(wedge), 0) }) : tr('ruleNot', { w: fmt.num(wedge, 1) });
      const font = `500 ${small ? 11.5 : 12.5}px ${theme.font}`;
      const lh = small ? 15 : 18;
      for (const ln of wrap(ruleStr, r.w - 32, even ? `700 ${small ? 12 : 14}px ${theme.font}` : font)) {
        text(g, ln, x, y, { font: even ? `700 ${small ? 12 : 14}px ${theme.font}` : font, color: even ? theme.series[2]! : theme.muted, align: 'left' });
        y += lh;
      }
      y += 6;
      rowRects.length = 0;
      const sel = list[selected];
      if (small) {
        // schmal: nur das ausgewählte Bild beschreiben
        const lines: string[] = [];
        if (sel) {
          const seq = seqText(sel);
          lines.push(tr('selText', { k: String(sel.seq.length), seq, rev: ctx.t(isReversed(sel) ? 'selRev' : 'selSame') }));
          if (!lightPath(wedge, figure(), sel, eyeW(), WEDGE_LEN)) lines.push(ctx.t('selHidden').trim());
        }
        lines.push(ctx.t('tapHint'));
        for (const para of lines) {
          for (const ln of wrap(para, r.w - 32, font)) {
            if (y > r.y + r.h - 10) break;
            text(g, ln, x, y, { font, color: para === ctx.t('tapHint') ? theme.muted : theme.text, align: 'left' });
            y += lh;
          }
          y += 4;
        }
        return;
      }
      // Liste aller Bilder: Zahl im Kreis = Anzahl der Spiegelungen (antippbar)
      text(g, ctx.t('listTitle'), x, y + 2, { font: `700 12px ${theme.font}`, color: theme.muted, align: 'left' });
      y += 14;
      const rowH = 30;
      const bottom = r.y + r.h - 44;
      const fits = Math.max(1, Math.floor((bottom - y) / rowH));
      const shown = list.slice(0, list.length > fits ? fits - 1 : fits);
      shown.forEach((img, i) => {
        const rr: Rect = { x: r.x + 8, y, w: r.w - 16, h: rowH - 4 };
        rowRects.push({ rect: rr, index: i });
        const active = i === selected;
        if (active || i === hoverImg) {
          g.fillStyle = active ? withAlpha(theme.series[3]!, theme.dark ? 0.22 : 0.14) : withAlpha(theme.muted, 0.1);
          roundRect(g, rr.x, rr.y, rr.w, rr.h, 8);
          g.fill();
        }
        const cyy = rr.y + rr.h / 2;
        g.fillStyle = active ? theme.series[3]! : withAlpha(theme.muted, 0.18);
        g.beginPath();
        g.arc(rr.x + 16, cyy, 9.5, 0, Math.PI * 2);
        g.fill();
        text(g, String(img.seq.length), rr.x + 16, cyy + 0.5, { font: `700 11px ${theme.font}`, color: active ? '#ffffff' : theme.text });
        const rev = ctx.t(isReversed(img) ? 'reversed' : 'notReversed');
        g.font = `500 11.5px ${theme.font}`;
        const revW = g.measureText(rev).width;
        g.font = `600 12px ${theme.font}`;
        let seq = `${ctx.t('mirrorShort')} ${img.seq.map((m) => (m === 'A' ? '1' : '2')).join(' → ')}`;
        if (g.measureText(seq).width > rr.w - 34 - revW - 18) seq = img.seq.map((m) => (m === 'A' ? '1' : '2')).join('→');
        text(g, seq, rr.x + 34, cyy, { font: `600 12px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, rev, rr.x + rr.w - 8, cyy, { font: `500 11.5px ${theme.font}`, color: isReversed(img) ? theme.series[1]! : theme.series[2]!, align: 'right' });
        y += rowH;
      });
      if (shown.length < list.length) {
        text(g, tr('more', { n: String(list.length - shown.length) }), x, y + 8, { font: `500 12px ${theme.font}`, color: theme.muted, align: 'left' });
      }
      const hidden = sel && !lightPath(wedge, figure(), sel, eyeW(), WEDGE_LEN);
      const foot = hidden ? ctx.t('selHidden').trim() : ctx.t('tapHint');
      wrap(foot, r.w - 32, font)
        .slice(0, 2)
        .forEach((ln, i, arr) => text(g, ln, x, r.y + r.h - 14 - (arr.length - 1 - i) * lh, { font, color: hidden ? theme.series[1]! : theme.muted, align: 'left' }));
    }

    /* ---------- Hinweise ---------- */
    function drawHint(): void {
      if (!hint || performance.now() > hintUntil) return;
      const r = lawRegions().disc;
      pill(hint, r.x + r.w / 2, r.y + r.h - 22, ctx.theme.series[1]!, { size: 12, solid: true });
      ctx.requestRender();
    }

    return {
      update(changed, source) {
        if (changed.has('la') || source !== 'sim') laser = p.la;
        if (changed.has('g') || source !== 'sim') candleG = p.g;
        if (changed.has('w') || source !== 'sim') wedge = p.w;
        if (source === 'input' && changed.has('mb') && p.mb > p.mt - 3) ctx.set({ mt: Math.min(50, p.mb + 3) });
        if (source === 'input' && changed.has('mt') && p.mt < p.mb + 3) ctx.set({ mb: Math.max(0, p.mt - 3) });
        if (changed.has('mode') && source !== 'init') {
          if (ctx.clock.playing) ctx.clock.pause();
          fade.play();
        }
        if (changed.has('r') || changed.has('f') || changed.has('w')) imagesKey = '';
        updateReadouts();
      },

      action(id) {
        if (ctx.locked || mode() !== 'law') return;
        if (id === 'measure') {
          if (!front()) return;
          if (rows.length >= MAX_ROWS) {
            hint = ctx.t('full');
            hintUntil = performance.now() + 2500;
          } else {
            const a = Math.round(alphaNow());
            rows.push([a, a]);
            rowPop.play();
          }
        } else if (id === 'clear') rows.length = 0;
        updateReadouts();
        ctx.requestRender();
      },

      tick(dt) {
        if (mode() === 'law') {
          laser += sweep * 12 * dt;
          const lo = p.tilt - 85;
          const hi = p.tilt + 85;
          if (laser >= Math.min(85, hi)) [laser, sweep] = [Math.min(85, hi), -1];
          if (laser <= Math.max(-85, lo)) [laser, sweep] = [Math.max(-85, lo), 1];
        } else if (mode() === 'image') {
          candleG += candleDir * 6 * dt;
          if (candleG >= 40) [candleG, candleDir] = [40, -1];
          if (candleG <= 6) [candleG, candleDir] = [6, 1];
        } else {
          wedge += wedgeDir * 6 * dt;
          if (wedge <= 30) [wedge, wedgeDir] = [30, 1];
          if (wedge >= 180) [wedge, wedgeDir] = [180, -1];
          imagesKey = '';
        }
        updateReadouts();
      },

      resetTime() {
        laser = p.la;
        candleG = p.g;
        wedge = p.w;
        imagesKey = '';
        updateReadouts();
      },

      render() {
        lawPlot.resize();
        chart.resize();
        imgPlot.resize();
        multiPlot.resize();
        surface.begin();
        if (mode() === 'law') {
          drawLaw();
          drawHint();
        } else if (mode() === 'image') drawImageMode();
        else drawMulti();
        if (fade.running) {
          g.fillStyle = withAlpha(ctx.theme.bg, 1 - fade.value);
          g.fillRect(0, 0, surface.width, surface.height);
          ctx.requestRender();
        }
        if (rowPop.running) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
