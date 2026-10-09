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
  type MirrorId,
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
  layout: { aspect: 1.6, aspectNarrow: 0.64 },
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
      label: L('Winkel φ zwischen den Spiegeln', 'Angle φ between the mirrors'),
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
      backHit: 'Das Licht trifft die Rückseite des Spiegels.',
      tableTitle: 'Messreihe',
      colNo: 'Nr.',
      emptyTable: 'Drücke „Messwert aufnehmen“, um Einfalls- und Reflexionswinkel einzutragen.',
      anglesText: 'Einfallswinkel α = {a}° · Reflexionswinkel α′ = {b}°',
      lawText: 'Einfallswinkel = Reflexionswinkel (α = α′). Einfallender Strahl, Lot und reflektierter Strahl liegen in einer Ebene. Beide Winkel werden zum Lot gemessen, nicht zur Spiegelfläche.',
      glanceText: '90° − α = {g}° (zwischen Strahl und Spiegelfläche)',
      turnText: 'Spiegel um {t}° gedreht: Der reflektierte Strahl dreht sich um {t2}°.',
      noRows: 'noch keine Messwerte',
      full: 'Die Messreihe ist voll (höchstens 8 Werte).',
      candle: 'Kerze',
      image: 'Spiegelbild',
      eye: 'Auge',
      eyeImage: 'Bild des Auges',
      world: 'Spiegelwelt (virtuell)',
      room: 'vor dem Spiegel',
      missed: 'verfehlt den Spiegel',
      missedShort: 'verfehlt',
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
      countText: '{n} Bilder',
      countOne: '1 Bild',
      ruleText: '360° : {w}° − 1 = {n}',
      ruleNot: '360° : {w}° ist keine gerade Zahl – die Zahl der Bilder hängt von der Lage der Figur ab.',
      selText: 'Bild nach {k} Spiegelung(en): {seq}{rev}',
      selRev: ' – seitenverkehrt',
      selSame: ' – nicht seitenverkehrt',
      selHidden: ' Vom Auge aus ist dieses Bild nicht zu sehen (der Lichtweg ginge am Spiegel vorbei).',
      tapHint: 'Tippe auf ein Bild, um seinen Lichtweg zu sehen.',
      then: 'dann',
      countCard: 'Bilder',
      mirrorShort: 'Spiegel',
      via: 'über',
      legSame: 'wie die Figur',
      legRev: 'seitenverkehrt',
      legEye: 'vom Auge aus zu sehen',
      chartTitle: 'Anzahl der Bilder bei anderen Winkeln',
    },
    en: {
      canvas: 'Optical disc with a plane mirror and a laser, a candle in front of a vertical mirror with its image and lines of sight, or two angled mirrors with multiple images',
      normal: 'normal',
      mirror: 'Mirror',
      backHit: 'The light hits the back of the mirror.',
      tableTitle: 'Measurements',
      colNo: 'No.',
      emptyTable: 'Press “Record measurement” to add the angles of incidence and reflection.',
      anglesText: 'Angle of incidence α = {a}° · angle of reflection α′ = {b}°',
      lawText: 'Angle of incidence = angle of reflection (α = α′). Incident ray, normal and reflected ray lie in one plane. Both angles are measured from the normal, not from the mirror surface.',
      glanceText: '90° − α = {g}° (between ray and mirror surface)',
      turnText: 'Mirror turned by {t}°: the reflected ray turns by {t2}°.',
      noRows: 'no measurements yet',
      full: 'The table is full (at most 8 values).',
      candle: 'Candle',
      image: 'Image',
      eye: 'Eye',
      eyeImage: 'image of the eye',
      world: 'mirror world (virtual)',
      room: 'in front of the mirror',
      missed: 'misses the mirror',
      missedShort: 'misses',
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
      countText: '{n} images',
      countOne: '1 image',
      ruleText: '360° : {w}° − 1 = {n}',
      ruleNot: '360° : {w}° is not an even number – the number of images depends on where the figure stands.',
      selText: 'Image after {k} reflection(s): {seq}{rev}',
      selRev: ' – reversed',
      selSame: ' – not reversed',
      selHidden: ' This image cannot be seen from the eye (the light path would miss the mirror).',
      tapHint: 'Tap an image to see its light path.',
      then: 'then',
      countCard: 'Images',
      mirrorShort: 'Mirror',
      via: 'via',
      legSame: 'like the figure',
      legRev: 'reversed',
      legEye: 'visible from the eye',
      chartTitle: 'Number of images at other angles',
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
    /** Erst nach dem Aufbau dürfen Bereiche von späteren Hilfsfunktionen abhängen. */
    let ready = false;
    /** Bilder im Winkelspiegel (zwischengespeichert, siehe currentImages). */
    let images: MirrorImage[] = [];
    let imagesKey = '';
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
      // Handy: Szene so hoch, wie die Breite es braucht; darunter Eigenschaften und Beobachtung
      const sh = w >= 640 ? h - 74 : Math.round(Math.min(h - 190, w * 0.86));
      return { scene: { x: 0, y: 0, w, h: sh }, chips: { x: 0, y: sh + 10, w, h: h - sh - 10 } };
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
      x: [0, Math.PI / 2],
      y: [0, Math.PI / 2],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      xAxis: { label: 'α', degrees: true },
      yAxis: { label: 'α′', degrees: true },
      region: (w, h) => (mode() === 'law' ? chartRect(w, h) : OFF),
    });
    const imgPlot = new Plot(surface, { x: [-85, 55], y: [-14, 72], pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'image' ? imageRegions(w, h).scene : OFF) });
    const multiPlot = new Plot(surface, { x: [-11, 11], y: [-11, 11], pan: false, zoom: false, controls: false, region: (w, h) => (mode() === 'multi' ? multiRegions(w, h).scene : OFF) });
    /** Diagramm „Anzahl der Bilder über dem Winkel“ (Winkel im Bogenmaß, beschriftet in Grad). */
    const countPlot = new Plot(surface, {
      x: [rad(30), Math.PI],
      y: [0, 12],
      equalAspect: false,
      pan: false,
      zoom: false,
      controls: false,
      xAxis: { label: 'φ', degrees: true },
      yAxis: { label: 'n', minStep: 2 },
      region: (w, h) => (mode() === 'multi' && ready ? (multiCardLayout(w, h).chart ?? OFF) : OFF),
    });

    /** Aufteilung der Karte im Winkelspiegel: Legende unten, darüber (wenn Platz ist) das Diagramm. */
    function multiCardLayout(w = surface.width, h = surface.height): { card: Rect; legTop: number; legend: { x: number; row: number; key: string }[]; chart: Rect | null } {
      const { card: r } = multiRegions(w, h);
      const small = w < 640;
      g.font = `500 ${small ? 11 : 12}px ${ctx.theme.font}`;
      const legend: { x: number; row: number; key: string }[] = [];
      let lx = r.x + 16;
      let row = 0;
      for (const key of ['legSame', 'legRev', 'legEye']) {
        const iw = 20 + g.measureText(ctx.t(key)).width;
        if (lx + iw > r.x + r.w - 12 && lx > r.x + 16) {
          row++;
          lx = r.x + 16;
        }
        legend.push({ x: lx, row, key });
        lx += iw + 14;
      }
      const legTop = r.y + r.h - 12 - row * (small ? 17 : 19);
      // Das Diagramm nur, wenn die Liste der Bilder trotzdem ganz hineinpasst
      const ch = Math.min(185, Math.round(r.h * 0.37));
      const ruleLines = wrap(tr('ruleNot', { w: fmt.num(wedge, 1) }), r.w - 32, `500 12.5px ${ctx.theme.font}`).length;
      const listTop = r.y + 78 + ruleLines * 18 + 8;
      const need = currentImages().length * 20 + 14;
      const fits = legTop - 24 - ch - 12 - listTop >= need;
      const chart = !small && fits ? { x: r.x + 8, y: legTop - 24 - ch, w: r.w - 16, h: ch } : null;
      return { card: r, legTop, legend, chart };
    }

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
      // sichtbar mindestens x von −70,5 cm bis 45,5 cm (Handy: −61 cm bis 37 cm) und y von −12 cm bis 55 cm
      const [wx, cxw] = r.w < 640 ? [98, -12] : [116, -12.5];
      const s = Math.min(r.w / wx, r.h / 67);
      const xw = r.w / s;
      const yh = r.h / s;
      const yMin = -12 - Math.max(0, yh - 67) * 0.3;
      imgPlot.setRange([cxw - xw / 2, cxw + xw / 2], [yMin, yMin + yh]);
    }
    function fitMulti(): void {
      const r = multiPlot.rect;
      const s = Math.min(r.w / 23, r.h / 23);
      multiPlot.setRange([-r.w / s / 2, r.w / s / 2], [-r.h / s / 2, r.h / s / 2]);
    }

    /* ---------- Geometrie ---------- */
    const alphaNow = () => incidence(laser, p.tilt);
    const laserLen = () => (narrow() ? 38 : 64);
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

    new TapTarget(surface, {
      hit: (px, py) => {
        if (mode() !== 'multi') return null;
        for (const row of rowHits) if (px >= row.r.x && px <= row.r.x + row.r.w && py >= row.r.y && py <= row.r.y + row.r.h) return String(row.id);
        const list = currentImages();
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
      },
    });

    /* ---------- Ergebnisse ---------- */
    const deg0 = (v: number) => fmt.num(Math.abs(v), 0);

    function readoutTable(): string {
      if (!rows.length) return ctx.t('noRows');
      const head = `<tr><th>${ctx.t('colNo')}</th><th>α</th><th>α′</th></tr>`;
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
        ctx.readout('see', seeText());
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
          const path = lightPath(wedge, figure(), img, eyeW(), WEDGE_LEN);
          const seq = (path ? path.seq : img.seq).map((m) => ctx.t(m === 'A' ? 'mirror1' : 'mirror2')).join(` ${ctx.t('then')} `);
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

    /** Beschriftung als Pille, mit Platzbedarf (damit die Skala ausweichen kann). */
    interface Tag {
      txt: string;
      color: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }
    function tagAt(txt: string, color: string, x: number, y: number, size: number): Tag {
      g.font = `700 ${size}px ${ctx.theme.font}`;
      return { txt, color, x, y, w: g.measureText(txt).width + 16, h: size + 10 };
    }
    /** Vorzeichenbehafteter Winkel von `from` nach `to` (−π … π). */
    const sweepOf = (from: number, to: number) => Math.atan2(Math.sin(to - from), Math.cos(to - from));
    /** Bildschirmwinkel (y nach unten) eines Richtungsvektors in Weltkoordinaten. */
    const scr = (v: V2) => Math.atan2(-v[1], v[0]);

    function drawLaw(): void {
      const theme = ctx.theme;
      const dark = theme.dark;
      const small = narrow();
      const { disc, card: cr } = lawRegions();
      const ext = 1.36;
      lawPlot.setRange([-ext, ext], [-ext, ext]);
      lawPlot.begin();
      // Tisch
      const bg = g.createLinearGradient(0, disc.y, 0, disc.y + disc.h);
      bg.addColorStop(0, dark ? '#141b26' : '#eef2f7');
      bg.addColorStop(1, dark ? '#0f151e' : '#e2e8f0');
      g.fillStyle = bg;
      g.fillRect(disc.x, disc.y, disc.w, disc.h);
      const R = lawPlot.scale.x;
      const [cx, cy] = lawPlot.toPx(0, 0);
      const tilt = rad(p.tilt);
      const nrm: V2 = [-Math.sin(tilt), Math.cos(tilt)];
      const mu: V2 = [Math.cos(tilt), Math.sin(tilt)];
      const a = alphaNow();
      const hit = front();
      const inDir = dirFromVertical(laser);
      const out = dirFromVertical(reflectedAngle(laser, p.tilt));
      const nAng = scr(nrm);
      const inAng = scr(inDir);
      const outAng = scr(out);
      const r0 = Math.max(small ? 38 : 46, R * 0.3);
      const size = small ? 11 : 12;

      // Winkelbögen und Beschriftungen vorab planen
      const arcs: { from: number; d: number; r: number; color: string }[] = [];
      const tags: Tag[] = [];
      if (hit && Math.abs(a) > 0.5) {
        const dIn = sweepOf(nAng, inAng);
        const dOut = sweepOf(nAng, outAng);
        arcs.push({ from: nAng, d: dIn, r: r0, color: theme.series[3]! }, { from: nAng, d: dOut, r: r0 * 0.78, color: theme.series[0]! });
        const items: [string, string, number][] = [
          [`α = ${deg0(a)}°`, theme.series[3]!, dIn],
          [`α′ = ${deg0(a)}°`, theme.series[0]!, dOut],
        ];
        const wMax = Math.max(...items.map(([t]) => tagAt(t, '', 0, 0, size).w));
        const rr = r0 + 26;
        const sep = 2 * rr * Math.sin(Math.abs(rad(a)) / 2);
        for (const [t, col, d] of items) {
          if (sep > wMax + 10) {
            const mid = nAng + d / 2;
            tags.push(tagAt(t, col, cx + Math.cos(mid) * rr, cy + Math.sin(mid) * (r0 + 22), size));
          } else {
            // kleine Winkel: neben dem Lot, jeweils auf der Seite des Strahls
            const side = Math.sign(d);
            const nx = cx + Math.cos(nAng) * (r0 + 30);
            const ny = cy + Math.sin(nAng) * (r0 + 30);
            tags.push(tagAt(t, col, nx - Math.sin(nAng) * side * (wMax / 2 + 6), ny + Math.cos(nAng) * side * (wMax / 2 + 6) * 0.35, size));
          }
        }
      }
      if (hit && p.gl) {
        // Winkel zwischen Strahl und Spiegelfläche
        const left = scr([-mu[0], -mu[1]]);
        const right = scr(mu);
        const gtxt = `${fmt.num(glancingAngle(a), 0)}°`;
        const rg = r0 * 1.45;
        const pairs: [number, number][] = [
          [a >= 0 ? left : right, inAng],
          [a >= 0 ? right : left, outAng],
        ];
        for (const [s0, to] of pairs) {
          const d = sweepOf(s0, to);
          arcs.push({ from: s0, d, r: rg, color: theme.series[2]! });
          const mid = s0 + d / 2;
          tags.push(tagAt(gtxt, theme.series[2]!, cx + Math.cos(mid) * (rg + 22), cy + Math.sin(mid) * (rg + 18), size));
        }
      }

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
      if (p.scale) {
        g.save();
        g.strokeStyle = withAlpha(theme.text, 0.55);
        const beams = hit ? [inAng, outAng, nAng] : [inAng, nAng];
        const lf = `600 ${small ? 10.5 : 11}px ${theme.font}`;
        for (let d = 0; d < 360; d += 5) {
          const ang = rad(d) + tilt;
          const len = d % 10 === 0 ? 12 : 6;
          g.lineWidth = d % 10 === 0 ? 1.4 : 0.9;
          g.beginPath();
          g.moveTo(cx + Math.sin(ang) * R, cy - Math.cos(ang) * R);
          g.lineTo(cx + Math.sin(ang) * (R - len), cy - Math.cos(ang) * (R - len));
          g.stroke();
          if (d % 30 !== 0) continue;
          // Zahlen weglassen, wo ein Strahl oder eine Beschriftung liegt
          const lx = cx + Math.sin(ang) * (R - 25);
          const ly = cy - Math.cos(ang) * (R - 25);
          const sa = Math.atan2(ly - cy, lx - cx);
          if (beams.some((b) => Math.abs(sweepOf(b, sa)) * (R - 25) < 11)) continue;
          if (tags.some((t) => Math.abs(t.x - lx) < t.w / 2 + 15 && Math.abs(t.y - ly) < t.h / 2 + 9)) continue;
          const fromNormal = Math.min(d % 180, 180 - (d % 180));
          text(g, `${fromNormal}°`, lx, ly, { font: lf, color: theme.muted });
        }
        g.restore();
      }
      // Lot (senkrecht auf dem Spiegel)
      g.save();
      g.strokeStyle = theme.text;
      g.globalAlpha = 0.75;
      g.setLineDash([7, 6]);
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(cx - nrm[0] * R * 0.34, cy + nrm[1] * R * 0.34);
      g.lineTo(cx + nrm[0] * R * 1.08, cy - nrm[1] * R * 1.08);
      g.stroke();
      g.restore();
      if (Math.abs(a) > (small ? 24 : 14) || !hit) label(ctx.t('normal'), cx + nrm[0] * R * 1.12 + 14, cy - nrm[1] * R * 1.12, { size: 12, color: theme.muted, align: 'left' });
      // Strahlen dicht am Lot: Beschriftung unten am Lot (hinter dem Spiegel)
      else label(ctx.t('normal'), cx - nrm[0] * R * 0.3 + 12, cy + nrm[1] * R * 0.3, { size: 12, color: theme.muted, align: 'left' });
      // Spiegel
      const mlen = R * 0.62;
      mirrorBar(cx - mu[0] * mlen, cy + mu[1] * mlen, cx + mu[0] * mlen, cy - mu[1] * mlen, -nrm[0], -nrm[1], Math.max(8, R * 0.05));
      // Winkelbögen
      for (const arc of arcs) {
        if (Math.abs(arc.d) < 0.01) continue;
        g.save();
        g.fillStyle = withAlpha(arc.color, 0.16);
        g.beginPath();
        g.moveTo(cx, cy);
        g.arc(cx, cy, arc.r, arc.from, arc.from + arc.d, arc.d < 0);
        g.closePath();
        g.fill();
        g.strokeStyle = arc.color;
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(cx, cy, arc.r, arc.from, arc.from + arc.d, arc.d < 0);
        g.stroke();
        g.restore();
      }
      // Strahlen
      const lx = cx + inDir[0] * R * LASER_R;
      const ly = cy - inDir[1] * R * LASER_R;
      if (hit) {
        beam(lx, ly, cx, cy);
        beam(cx, cy, cx + out[0] * R * 1.12, cy - out[1] * R * 1.12);
        // Lichtfleck auf dem Spiegel
        const spot = g.createRadialGradient(cx, cy, 0, cx, cy, 16);
        spot.addColorStop(0, 'rgba(255,240,235,0.95)');
        spot.addColorStop(0.35, 'rgba(255,80,60,0.55)');
        spot.addColorStop(1, 'rgba(255,60,50,0)');
        g.fillStyle = spot;
        g.beginPath();
        g.arc(cx, cy, 16, 0, Math.PI * 2);
        g.fill();
      } else {
        // Licht trifft die Rückseite
        const hitR = Math.max(10, R * 0.06);
        beam(lx, ly, cx + inDir[0] * hitR, cy - inDir[1] * hitR, 1, true);
      }
      for (const t of tags) pill(t.txt, t.x, t.y, t.color, { size });
      drawLaser(lx, ly, Math.atan2(cy - ly, cx - lx));
      lawPlot.end();
      if (!hit) pill(ctx.t('backHit'), disc.x + disc.w / 2, disc.y + 22, theme.series[1]!, { size: small ? 11 : 12, solid: true });
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
      if (small) {
        text(g, ctx.t('tableTitle'), tx, ty + 4, { font: `700 13px ${theme.font}`, color: theme.text, align: 'left' });
        ty += 18;
      }
      const colX = [tx + 4, tx + tw * 0.36, tx + tw * 0.72];
      const head = [ctx.t('colNo'), 'α', 'α′'];
      const rowH = small ? 18 : 21;
      g.fillStyle = theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(16,24,40,0.05)';
      roundRect(g, tx - 4, ty, tw + 8, rowH, 6);
      g.fill();
      head.forEach((h, i) => text(g, h, colX[i]!, ty + rowH / 2 + 0.5, { font: `700 12px ${theme.font}`, color: i === 1 ? theme.series[3]! : i === 2 ? theme.series[0]! : theme.muted, align: 'left' }));
      ty += rowH + 2;
      const maxRows = small ? Math.max(1, Math.floor((r.y + r.h - ty - 8) / rowH)) : MAX_ROWS;
      // Linien des Messprotokolls (auch leer sichtbar)
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.07)' : 'rgba(16,24,40,0.07)';
      g.lineWidth = 1;
      for (let i = 1; i <= maxRows; i++) {
        const y = Math.round(ty + i * rowH) + 0.5;
        g.beginPath();
        g.moveTo(tx - 4, y);
        g.lineTo(tx + tw + 4, y);
        g.stroke();
      }
      if (!rows.length) {
        const lines = wrap(ctx.t('emptyTable'), tw - 8, `500 12px ${theme.font}`);
        const y0 = ty + rowH * Math.max(0, Math.floor((maxRows - lines.length) / 2));
        lines.slice(0, maxRows).forEach((ln, i) => text(g, ln, tx + 2, y0 + rowH / 2 + i * rowH, { font: `500 12px ${theme.font}`, color: theme.muted, align: 'left' }));
      }
      const shown = rows.slice(-maxRows);
      const offset = rows.length - shown.length;
      shown.forEach(([a, b], i) => {
        const y = ty + i * rowH + rowH / 2;
        const isNew = i === shown.length - 1 && rowPop.running;
        const k = isNew ? rowPop.value : 1;
        if (i === shown.length - 1) {
          g.fillStyle = withAlpha(theme.series[0]!, theme.dark ? 0.16 : 0.09);
          roundRect(g, tx - 4, ty + i * rowH + 1, tw + 8, rowH - 2, 5);
          g.fill();
        }
        g.save();
        g.globalAlpha = Math.min(1, Math.max(0, k));
        text(g, String(offset + i + 1), colX[0]!, y, { font: `600 12px ${theme.font}`, color: theme.muted, align: 'left' });
        text(g, `${deg0(a)}°`, colX[1]!, y, { font: `700 ${12 * (0.8 + 0.2 * k)}px ${theme.font}`, color: theme.text, align: 'left' });
        text(g, `${deg0(b)}°`, colX[2]!, y, { font: `700 ${12 * (0.8 + 0.2 * k)}px ${theme.font}`, color: theme.text, align: 'left' });
        g.restore();
      });
      // Diagramm α′ über α (Werte im Bogenmaß, beschriftet in Grad)
      const q = Math.PI / 2;
      chart.setRangePadded([0, q], [0, q], { left: 38, bottom: 24, top: 16, right: 14 });
      chart.begin();
      const cRect = chart.rect;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      g.fillRect(cRect.x, cRect.y, cRect.w, cRect.h);
      chart.grid();
      chart.axes();
      chart.segment([0, 0], [q, q], { color: theme.muted, width: 1.5, dash: [5, 5] });
      chart.text(q * 0.7, q * 0.8, 'α′ = α', { color: theme.muted, size: 11, align: 'right' });
      rows.forEach(([a, b], i) => {
        const pop = i === rows.length - 1 && rowPop.running ? rowPop.value : 1;
        chart.point(rad(Math.abs(a)), rad(Math.abs(b)), { color: theme.series[0]!, radius: 5 * Math.max(0.2, pop) });
      });
      if (front()) chart.point(rad(Math.abs(alphaNow())), rad(Math.abs(alphaNow())), { color: theme.series[3]!, radius: 5, hollow: true });
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
        // nur über der Tischplatte (der Tisch verdeckt den Rest)
        const [, tableY] = imgPlot.toPx(0, 0);
        g.beginPath();
        g.rect(scene.x, scene.y, scene.w, tableY - scene.y);
        g.clip();
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
        // Bild des Auges hinter dem Spiegel (von dort aus wird der Sichtbereich konstruiert)
        const [ix, iy] = imgPlot.toPx(eImg[0], eImg[1]);
        if (ix < scene.x + scene.w + 8) {
          g.save();
          g.globalAlpha = 0.45;
          g.translate(ix, iy);
          g.scale(-1, 1);
          drawEye(0, 0, s);
          g.restore();
          g.font = `600 11px ${theme.font}`;
          const half = g.measureText(ctx.t('eyeImage')).width / 2 + 6;
          label(ctx.t('eyeImage'), Math.min(ix, scene.x + scene.w - half), iy + Math.max(26, 7 * s) * 0.5 + 10, { size: 11, color: theme.series[4]!, weight: 600 });
        }
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
          // passt die Beschriftung nicht zwischen die Marken, steht sie außen daneben
          const size = narrow() ? 11 : 12;
          g.font = `700 ${size}px ${theme.font}`;
          const pw = g.measureText(str).width + 16;
          if (Math.abs(x1 - x0) >= pw + 10) pill(str, (x0 + x1) / 2, dy, color, { size });
          else if (x0 < mx0) pill(str, x0 - 6, dy, color, { size, align: 'right' });
          else pill(str, x1 + 6, dy, color, { size, align: 'left' });
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
          if (p.con) {
            // Lot am Auftreffpunkt und die beiden gleich großen Winkel
            const nl = Math.max(34, 7 * s);
            g.save();
            g.strokeStyle = withAlpha(theme.text, 0.55);
            g.setLineDash([3, 3]);
            g.lineWidth = 1.2;
            g.beginPath();
            g.moveTo(hx, hy);
            g.lineTo(hx - nl, hy);
            g.stroke();
            g.restore();
            const rA = Math.max(20, 4 * s);
            const aIn = Math.atan2(sy - hy, sx - hx);
            const aOut = Math.atan2(ey - hy, ex - hx);
            for (const to of [aIn, aOut]) {
              const d = sweepOf(Math.PI, to);
              g.save();
              g.fillStyle = withAlpha(color, 0.18);
              g.beginPath();
              g.moveTo(hx, hy);
              g.arc(hx, hy, rA, Math.PI, Math.PI + d, d < 0);
              g.closePath();
              g.fill();
              g.strokeStyle = color;
              g.lineWidth = 1.5;
              g.beginPath();
              g.arc(hx, hy, rA, Math.PI, Math.PI + d, d < 0);
              g.stroke();
              g.restore();
            }
          }
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
          label(ctx.t(narrow() ? 'missedShort' : 'missed'), hx + Math.max(7, 1.3 * s) + 8, hy, { size: 11, color: theme.series[1]!, align: 'left' });
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
      const [cxl] = imgPlot.toPx(-candleG - 2.4, 0);
      const [cil] = imgPlot.toPx(candleG + 2.4, 0);
      const [, labY] = imgPlot.toPx(0, Math.max(3, (p.h - 5) * 0.55));
      g.font = `700 12px ${theme.font}`;
      const imgW = g.measureText(ctx.t('image')).width;
      const candW = g.measureText(ctx.t('candle')).width;
      // seitlich neben Kerze und Spiegelbild; am Rand stattdessen über der Flamme
      const [, aboveY] = imgPlot.toPx(0, p.h + 4.5);
      if (cxl - candW > scene.x + 6) label(ctx.t('candle'), cxl, labY, { size: 12, align: 'right' });
      else label(ctx.t('candle'), imgPlot.toPx(-candleG, 0)[0], aboveY, { size: 12 });
      if (cil + imgW < scene.x + scene.w - 6) label(ctx.t('image'), cil, labY, { size: 12, color: theme.series[3]!, align: 'left' });
      else label(ctx.t('image'), Math.min(imgPlot.toPx(candleG, 0)[0], scene.x + scene.w - imgW / 2 - 6), aboveY, { size: 12, color: theme.series[3]! });
      const eyeH = Math.max(26, 7 * s) * 0.5;
      label(ctx.t('eye'), ex, ey - eyeH - 8 < scene.y + 10 ? ey + eyeH + 10 : ey - eyeH - 8, { size: 12, color: theme.series[4]! });
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
        // Beobachtung des Auges (wie im Ergebnis „Was sieht das Auge?“)
        y += 24;
        g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(r.x + 14, y - 10.5);
        g.lineTo(r.x + r.w - 14, y - 10.5);
        g.stroke();
        const font = `500 12px ${theme.font}`;
        for (const ln of wrap(seeText(), r.w - 28, font)) {
          if (y > r.y + r.h - 10) break;
          text(g, ln, r.x + 14, y + 4, { font, color: theme.text, align: 'left' });
          y += 16;
        }
      }
    }

    /** Was sieht das Auge im Spiegel? (Text) */
    function seeText(): string {
      const eye: V2 = [-p.ex, p.ey];
      const tip = seesInMirror([-candleG, p.h], eye, p.mb, p.mt);
      const foot = seesInMirror([-candleG, 0], eye, p.mb, p.mt);
      return ctx.t(tip && foot ? 'seeAll' : tip ? 'seeTip' : foot ? 'seeFoot' : 'seeNone');
    }

    /* =================================================================== */
    /* Winkelspiegel                                                        */
    /* =================================================================== */

    function figurePath(transform: (v: V2) => V2, pts: V2[], scale: number, at: V2): V2[] {
      return pts.map(([x, y]) => transform([at[0] + x * scale, at[1] + y * scale]));
    }

    /** Größe der Figur in Einheiten der Zeichnung (bei engem Winkel kleiner). */
    const figScale = () => clamp(0.5 + wedge / 200, 0.62, 0.92);

    function drawFigure(base: V2, apply: (v: V2) => V2, alpha: number, highlight: boolean, real = false): void {
      const theme = ctx.theme;
      const sc = figScale();
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
        g.strokeStyle = theme.dark ? 'rgba(8,12,18,0.7)' : 'rgba(255,255,255,0.95)';
        g.lineWidth = 1.4;
        g.lineJoin = 'round';
        g.stroke();
      };
      g.save();
      g.globalAlpha = alpha;
      if (highlight) {
        g.shadowColor = withAlpha(theme.series[3]!, 0.95);
        g.shadowBlur = 16;
      } else if (real) softShadow(g, theme.dark, 8, 2);
      poly(figurePath(apply, FIGURE_POLE, sc, base), theme.series[0]!);
      poly(figurePath(apply, FIGURE_FLAG, sc, base), theme.series[1]!);
      g.restore();
    }

    /** Kleine Figur als Symbol (Pixel), gespiegelt = seitenverkehrt. */
    function flagIcon(x: number, y: number, h: number, reversed: boolean, alpha = 1): void {
      const theme = ctx.theme;
      const k = h / 2.45;
      const poly = (pts: V2[], fill: string) => {
        g.beginPath();
        pts.forEach(([px, py], i) => {
          const sx = x + (reversed ? -px : px) * k;
          const sy = y - (py - 0.125) * k;
          if (i === 0) g.moveTo(sx, sy);
          else g.lineTo(sx, sy);
        });
        g.closePath();
        g.fillStyle = fill;
        g.fill();
      };
      g.save();
      g.globalAlpha = alpha;
      poly(FIGURE_POLE, theme.series[0]!);
      poly(FIGURE_FLAG, theme.series[1]!);
      g.restore();
    }

    /** Kleines Auge als Symbol (Pixel); `on = false` blass. */
    function eyeIcon(x: number, y: number, w: number, on: boolean): void {
      const theme = ctx.theme;
      const h = w * 0.52;
      g.save();
      g.globalAlpha = on ? 1 : 0.32;
      g.beginPath();
      g.moveTo(x - w / 2, y);
      g.quadraticCurveTo(x, y - h, x + w / 2, y);
      g.quadraticCurveTo(x, y + h, x - w / 2, y);
      g.closePath();
      g.fillStyle = theme.dark ? '#e8edf4' : '#ffffff';
      g.fill();
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.2;
      g.stroke();
      g.fillStyle = on ? theme.series[4]! : theme.muted;
      g.beginPath();
      g.arc(x, y, h * 0.42, 0, Math.PI * 2);
      g.fill();
      if (!on) {
        g.strokeStyle = theme.muted;
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(x - w / 2 + 1, y + h * 0.6);
        g.lineTo(x + w / 2 - 1, y - h * 0.6);
        g.stroke();
      }
      g.restore();
    }

    /** Spiegelfolge als kurzer Text, z. B. „Spiegel 1 → 2 → 1“. */
    const seqText = (seq: MirrorId[]) => `${ctx.t('mirrorShort')} ${seq.map((m) => (m === 'A' ? '1' : '2')).join(' → ')}`;

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
      g.fillStyle = dark ? 'rgba(255,214,140,0.08)' : 'rgba(255,214,140,0.24)';
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
      const eye = eyeW();
      const sc = figScale();
      const sel = list[selected];
      const path = sel ? lightPath(w, fig, sel, eye, WEDGE_LEN) : null;
      // Bilder (je mehr Spiegelungen, desto blasser)
      list.forEach((img, i) => {
        const apply = (v: V2) => img.seq.reduce<V2>((q, m) => reflectAcross(q, m, w), v);
        drawFigure(fig, apply, Math.max(0.4, 0.92 * 0.85 ** (img.seq.length - 1)), i === selected || i === hoverImg);
      });
      // Nummern (Zahl der Spiegelungen) auf der Seite gegenüber der Fahne
      list.forEach((img, i) => {
        const apply = (v: V2) => img.seq.reduce<V2>((q, m) => reflectAcross(q, m, w), v);
        const fc = apply([fig[0] + 0.55 * sc, fig[1] + 0.3 * sc]);
        const dx = img.pos[0] - fc[0];
        const dy = img.pos[1] - fc[1];
        const dl = Math.hypot(dx, dy) || 1;
        const [x, y] = multiPlot.toPx(img.pos[0] + (dx / dl) * 1.05 * sc, img.pos[1] + (dy / dl) * 1.05 * sc);
        const on = i === selected;
        g.save();
        softShadow(g, dark, 4, 1);
        g.fillStyle = on ? theme.series[3]! : dark ? 'rgba(20,26,36,0.94)' : 'rgba(255,255,255,0.96)';
        g.beginPath();
        g.arc(x, y, 9, 0, Math.PI * 2);
        g.fill();
        g.restore();
        g.strokeStyle = on ? '#ffffff' : withAlpha(theme.muted, 0.6);
        g.lineWidth = 1;
        g.beginPath();
        g.arc(x, y, 9, 0, Math.PI * 2);
        g.stroke();
        text(g, String(img.seq.length), x, y + 0.5, { font: `700 11px ${theme.font}`, color: on ? '#ffffff' : theme.text });
      });
      // Lichtweg zum ausgewählten Bild
      if (sel) {
        const [ix, iy] = multiPlot.toPx(...sel.pos);
        if (path) {
          const pts = path.pts.map((q) => multiPlot.toPx(q[0], q[1]));
          const last = pts[pts.length - 2]!;
          ray(last[0], last[1], ix, iy, theme.series[3]!, { width: 1.6, dash: [6, 5], alpha: 0.75, arrow: false });
          for (let k = 0; k < pts.length - 1; k++) ray(pts[k]![0], pts[k]![1], pts[k + 1]![0], pts[k + 1]![1], theme.series[3]!, { width: 2.6 });
          for (let k = 1; k < pts.length - 1; k++) {
            g.fillStyle = theme.series[3]!;
            g.beginPath();
            g.arc(pts[k]![0], pts[k]![1], 3.5, 0, Math.PI * 2);
            g.fill();
          }
        } else {
          const [ex, ey] = multiPlot.toPx(...eye);
          ray(ex, ey, ix, iy, withAlpha(theme.muted, 0.8), { width: 1.4, dash: [3, 5], arrow: false });
        }
      }
      // Spiegel
      for (const id of ['A', 'B'] as const) {
        const u = mirrorDir(id, w);
        const n = mirrorNormal(id, w);
        const [ex, ey] = multiPlot.toPx(u[0] * WEDGE_LEN, u[1] * WEDGE_LEN);
        mirrorBar(hx, hy, ex, ey, n[0], -n[1], Math.max(7, 0.32 * s));
        if (w < 170 || id === 'A') {
          // hinter dem Ende des Spiegels, aber immer ganz im Bild
          const str = ctx.t(id === 'A' ? 'mirror1' : 'mirror2');
          g.font = `700 12px ${theme.font}`;
          const half = g.measureText(str).width / 2 + 8;
          const [lx, ly] = multiPlot.toPx(u[0] * (WEDGE_LEN + 0.95), u[1] * (WEDGE_LEN + 0.95));
          const cx = clamp(lx, scene.x + half, scene.x + scene.w - half);
          label(str, cx, Math.abs(cx - lx) > 1 ? ly - 18 : Math.max(scene.y + 12, ly), { size: 12, color: theme.muted });
        }
      }
      // Scharnier
      g.fillStyle = dark ? '#cfd6e0' : '#4a5361';
      g.beginPath();
      g.arc(hx, hy, 5, 0, Math.PI * 2);
      g.fill();
      // Figur und Auge (blickt zum ausgewählten Bild)
      drawFigure(fig, (v) => v, 1, false, true);
      const [ex, ey] = multiPlot.toPx(...eye);
      const [tx, ty] = sel && path ? multiPlot.toPx(...sel.pos) : [hx, hy];
      g.save();
      g.translate(ex, ey);
      g.rotate(Math.atan2(ty - ey, tx - ex));
      drawEye(0, 0, Math.max(3.6, s * 0.24));
      g.restore();
      // Winkelbogen
      const ar = Math.max(26, 1.6 * s);
      g.strokeStyle = theme.series[2]!;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(hx, hy, ar, -aA, -aB);
      g.stroke();
      label(`φ = ${fmt.num(w, 0)}°`, hx, hy - ar - 12, { size: 13, color: theme.series[2]! });
      multiPlot.end();
      drawMultiCard(cr, list);
    }

    /** Zeilen der Bilderliste (für das Antippen). */
    let rowHits: { id: number; r: Rect }[] = [];

    /** Anzahl der Bilder für alle Winkel 30° … 180° bei der aktuellen Lage der Figur (zwischengespeichert). */
    let countSeries: V2[] = [];
    let countKey = '';
    function countsOverAngle(): V2[] {
      const key = `${p.r}|${p.f}`;
      if (key !== countKey) {
        countKey = key;
        countSeries = [];
        for (let w = 30; w <= 180; w += 0.5) countSeries.push([rad(w), wedgeImages(w, wedgePoint(p.r, p.f, w)).length]);
      }
      return countSeries;
    }

    function drawMultiCard(r: Rect, list: MirrorImage[]): void {
      const theme = ctx.theme;
      const small = narrow();
      const lay = multiCardLayout();
      card(r);
      rowHits = [];
      const n = list.length;
      const x = r.x + 16;
      // Anzahl groß, darunter die Faustregel
      const big = small ? 26 : 40;
      let y = r.y + (small ? 22 : 34);
      text(g, String(n), x, y + (small ? 2 : 6), { font: `800 ${big}px ${theme.font}`, color: theme.series[3]!, align: 'left' });
      g.font = `800 ${big}px ${theme.font}`;
      const nw = g.measureText(String(n)).width;
      text(g, n === 1 ? ctx.t('countOne').replace(/^1\s*/, '') : ctx.t('countCard'), x + nw + 8, y + (small ? 4 : 10), { font: `700 ${small ? 14 : 16}px ${theme.font}`, color: theme.text, align: 'left' });
      y += small ? 28 : 44;
      const ratio = 360 / wedge;
      const even = Math.abs(ratio - Math.round(ratio)) < 1e-6 && Math.round(ratio) % 2 === 0;
      const ruleStr = even ? tr('ruleText', { w: fmt.num(wedge, 0), n: fmt.num(imageCountRule(wedge), 0) }) : tr('ruleNot', { w: fmt.num(wedge, 1) });
      const ruleFont = even ? `700 ${small ? 12.5 : 14}px ${theme.font}` : `500 ${small ? 11.5 : 12.5}px ${theme.font}`;
      const lh = small ? 15 : 18;
      for (const ln of wrap(ruleStr, r.w - 32, ruleFont)) {
        text(g, ln, x, y, { font: ruleFont, color: even ? theme.series[2]! : theme.muted, align: 'left' });
        y += lh;
      }
      y += small ? 2 : 8;
      // Legende (unten)
      const legFont = `500 ${small ? 11 : 12}px ${theme.font}`;
      const legLh = small ? 17 : 19;
      g.strokeStyle = theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.08)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(r.x + 14, lay.legTop - 13.5);
      g.lineTo(r.x + r.w - 14, lay.legTop - 13.5);
      g.stroke();
      for (const it of lay.legend) {
        const ly = lay.legTop + it.row * legLh;
        if (it.key === 'legEye') eyeIcon(it.x + 7, ly, 16, true);
        else flagIcon(it.x + 7, ly, 14, it.key === 'legRev');
        text(g, ctx.t(it.key), it.x + 20, ly, { font: legFont, color: theme.muted, align: 'left' });
      }
      // Liste der Bilder
      const bottom = (lay.chart ? lay.chart.y - 22 : lay.legTop - 22) - 4;
      const avail = bottom - y;
      let rowH = small ? 21 : 25;
      if (!small && n * rowH > avail) rowH = Math.max(19, Math.floor(avail / n));
      const cols = small && n * rowH > avail ? 2 : 1;
      const perCol = Math.ceil(n / cols);
      if (small && perCol * rowH > avail) rowH = Math.max(17, Math.floor(avail / perCol));
      const perColMax = Math.max(1, Math.floor(avail / rowH));
      const colW = (r.w - 20 - (cols - 1) * 8) / cols;
      const rowFont = `600 ${small ? 11.5 : 12.5}px ${theme.font}`;
      const eye = eyeW();
      const fig = figure();
      const paths = list.map((img) => lightPath(wedge, fig, img, eye, WEDGE_LEN));
      // Spiegelfolgen: lang („Spiegel 1 → 2“), kurz („1 → 2“) oder knapp („1→2“) – für alle Zeilen gleich
      const maxW = colW - 82;
      g.font = rowFont;
      const seqs = list.map((img, i) => (paths[i] ? paths[i]!.seq : img.seq));
      const forms = [(q: MirrorId[]) => seqText(q), (q: MirrorId[]) => seqText(q).replace(ctx.t('mirrorShort'), ctx.t('via')), (q: MirrorId[]) => seqText(q).replace(ctx.t('mirrorShort'), ctx.t('via')).replace(/ → /g, '→')];
      const form = forms.find((f) => seqs.every((q) => g.measureText(f(q)).width <= maxW)) ?? forms[2]!;
      list.forEach((img, i) => {
        const col = Math.floor(i / perCol);
        const row = i % perCol;
        if (row >= perColMax) return;
        const rx = r.x + 10 + col * (colW + 8);
        const ry = y + row * rowH;
        const rr: Rect = { x: rx, y: ry, w: colW, h: rowH - 3 };
        rowHits.push({ id: i, r: rr });
        if (i === selected || i === hoverImg) {
          g.fillStyle = withAlpha(theme.series[3]!, i === selected ? (theme.dark ? 0.2 : 0.12) : 0.07);
          roundRect(g, rr.x, rr.y, rr.w, rr.h, 7);
          g.fill();
        }
        const cy = ry + (rowH - 3) / 2;
        const on = i === selected;
        g.fillStyle = on ? theme.series[3]! : theme.dark ? 'rgba(255,255,255,0.08)' : 'rgba(16,24,40,0.07)';
        g.beginPath();
        g.arc(rx + 14, cy, 8.5, 0, Math.PI * 2);
        g.fill();
        text(g, String(img.seq.length), rx + 14, cy + 0.5, { font: `700 11px ${theme.font}`, color: on ? '#ffffff' : theme.text });
        const right = rx + colW - 10;
        eyeIcon(right - 8, cy, 16, !!paths[i]);
        flagIcon(right - 30, cy, small ? 13 : 15, isReversed(img), 0.95);
        let str = form(seqs[i]!);
        g.font = rowFont;
        while (g.measureText(str).width > maxW && str.length > 4) str = `${str.replace(/…$/, '').slice(0, -1)}…`;
        text(g, str, rx + 30, cy + 0.5, { font: rowFont, color: theme.text, align: 'left' });
      });
      if (perColMax * cols < n) text(g, '…', r.x + r.w / 2, y + perColMax * rowH + 2, { font: rowFont, color: theme.muted });
      const hintY = y + Math.min(perCol, perColMax) * rowH + 10;
      const hintFont = `500 ${small ? 11 : 12}px ${theme.font}`;
      wrap(ctx.t('tapHint'), r.w - 32, hintFont).forEach((ln, k) => {
        if (hintY + k * lh < bottom - 4) text(g, ln, x, hintY + k * lh, { font: hintFont, color: theme.muted, align: 'left' });
      });
      // Diagramm: Anzahl der Bilder bei anderen Winkeln
      if (lay.chart) {
        text(g, ctx.t('chartTitle'), x, lay.chart.y - 6, { font: `700 12px ${theme.font}`, color: theme.text, align: 'left' });
        countPlot.setRangePadded([rad(30), Math.PI], [0, 11.5], { left: 30, bottom: 22, top: 12, right: 16 });
        countPlot.begin();
        const cr = countPlot.rect;
        g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
        g.fillRect(cr.x, cr.y, cr.w, cr.h);
        countPlot.grid();
        countPlot.axes();
        countPlot.fn((t) => (2 * Math.PI) / t - 1, { color: theme.series[2]!, width: 1.6, dash: [5, 4], from: rad(30), to: Math.PI });
        countPlot.polyline(countsOverAngle(), { color: theme.series[3]!, width: 2.2 });
        countPlot.point(rad(wedge), n, { color: theme.series[3]!, radius: 5 });
        countPlot.text(rad(52), 360 / 52 - 1, '360° : φ − 1', { color: theme.series[2]!, size: 11, align: 'left', offset: [8, -4], halo: true });
        countPlot.end();
      }
    }

    /* ---------- Hinweise ---------- */
    function drawHint(): void {
      if (!hint || performance.now() > hintUntil) return;
      const r = lawRegions().disc;
      pill(hint, r.x + r.w / 2, r.y + r.h - 22, ctx.theme.series[1]!, { size: 12, solid: true });
      ctx.requestRender();
    }

    ready = true;
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
        countPlot.resize();
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
