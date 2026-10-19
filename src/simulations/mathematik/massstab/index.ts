import { defineSimulation, ease, mixColor, prefersReducedMotion, roundRect, shade, Surface, text, type Rect } from '../../../sim-core';
import {
  CALC_SCALES,
  closestOnSegment,
  decimalIn,
  dist,
  enlargement,
  groupDigits,
  intText,
  lengthText,
  MAP_SCALES,
  mapMmFromMetres,
  OBJECTS,
  randomCalcTask,
  realFromImage,
  realUmFromMapMm,
  routePiecesMm,
  shortestRoute,
  snapToGraph,
  solve,
  UM,
  unitChain,
  ZOOM_SCALES,
  type Lang,
  type LenUnit,
  type ObjId,
  type Pt,
  type Sought,
} from './model';
import {
  BASE_LEVEL,
  buildFields,
  buildHouses,
  CONTOUR_STEP,
  contours,
  FORESTS,
  HILLS,
  inPolygon,
  LAKE,
  POIS,
  RAIL,
  RIVER,
  ROAD_LINES,
  ROADS,
  STREAMS,
  VILLAGES,
  WORLD,
  type Poi,
  type PoiKind,
} from './landscape';

const L = (de: string, en: string) => ({ de, en });
type Loc = { de: string; en: string };
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

type Mode = 'map' | 'zoom' | 'calc';

/* ------------------------------------------------------------------ */
/* Parameter                                                           */
/* ------------------------------------------------------------------ */

const scaleLabel = (n: number) => L(`1 : ${groupDigits(String(n), 'de')}`, `1 : ${groupDigits(String(n), 'en')}`);
const isMap = (v: Record<string, unknown>) => v.mode === 'map';

const OBJ_TEXT: Record<ObjId, { name: Loc; what: Loc; approx: boolean }> = {
  bug: { name: L('Marienkäfer', 'Ladybird'), what: L('Länge', 'length'), approx: true },
  ant: { name: L('Ameise', 'Ant'), what: L('Länge', 'length'), approx: true },
  stamp: { name: L('Briefmarke', 'Postage stamp'), what: L('Breite', 'width'), approx: false },
  sand: { name: L('Sandkorn', 'Grain of sand'), what: L('Durchmesser', 'diameter'), approx: true },
};

/** Kurze Hinweise zu den Kartenmaßstäben (große/kleine Maßstabszahl). */
const SCALE_HINT: Record<number, Loc> = {
  5000: L('Ortsplan: jedes Haus, kleiner Ausschnitt', 'Town plan: every house, small area'),
  25000: L('Wanderkarte: Häuser, Wege, Höhenlinien', 'Hiking map: houses, paths, contours'),
  50000: L('Radkarte: Orte als Flächen', 'Cycling map: villages as areas'),
  100000: L('Straßenkarte: großer Ausschnitt, wenig Einzelheiten', 'Road map: large area, few details'),
};

/**
 * Maßstab: eine gezeichnete, erfundene Landkarte mit Maßstabsleiste. Mit
 * einem Lineal zwischen zwei Griffen wird die Kartenlänge gemessen und über
 * den Maßstab in die wirkliche Entfernung umgerechnet (auch als Wegstrecke
 * entlang der Straßen). Beim Wechsel des Maßstabs zoomt die Karte weich.
 * Dazu Vergrößerungen (10 : 1, 50 : 1) mit Lupe und Rechenaufgaben, bei
 * denen aus zwei der drei Größen die dritte bestimmt wird.
 */
export default defineSimulation({
  id: 'massstab',
  dragHint: true,
  layout: { aspect: 1.6, aspectNarrow: 0.6 },
  groups: [{ id: 'pts', label: L('Messstrecke (Lage in m, von der Nordwestecke aus)', 'Measured line (position in m from the north-west corner)') }],
  params: [
    {
      key: 'mode',
      type: 'choice',
      label: L('Ansicht', 'View'),
      options: [
        { value: 'map', label: L('Karte', 'Map') },
        { value: 'zoom', label: L('Vergrößern', 'Enlarge') },
        { value: 'calc', label: L('Rechnen', 'Calculate') },
      ],
      default: 'map',
    },
    {
      key: 's',
      type: 'choice',
      label: L('Maßstab der Karte', 'Map scale'),
      options: MAP_SCALES.map((n) => ({ value: String(n), label: scaleLabel(n) })),
      default: '25000',
      help: L('Große Maßstabszahl: großer Ausschnitt, wenig Einzelheiten.', 'Large scale number: large area, few details.'),
      visibleIf: isMap,
    },
    {
      key: 'r',
      type: 'boolean',
      label: L('Wegstrecke entlang der Straße messen', 'Measure the route along the roads'),
      default: false,
      help: L('Sonst wird die Luftlinie gemessen.', 'Otherwise the straight line is measured.'),
      visibleIf: isMap,
    },
    { key: 'ax', type: 'number', group: 'pts', label: L('Start A: nach Osten', 'Start A: east'), min: 0, max: WORLD.w, step: 1, default: 8000, unit: 'm', visibleIf: isMap },
    { key: 'ay', type: 'number', group: 'pts', label: L('Start A: nach Süden', 'Start A: south'), min: 0, max: WORLD.h, step: 1, default: 7000, unit: 'm', visibleIf: isMap },
    { key: 'bx', type: 'number', group: 'pts', label: L('Ziel B: nach Osten', 'End B: east'), min: 0, max: WORLD.w, step: 1, default: 7400, unit: 'm', visibleIf: isMap },
    { key: 'by', type: 'number', group: 'pts', label: L('Ziel B: nach Süden', 'End B: south'), min: 0, max: WORLD.h, step: 1, default: 7800, unit: 'm', visibleIf: isMap },
    {
      key: 'o',
      type: 'choice',
      label: L('Objekt', 'Object'),
      options: [
        { value: 'bug', label: OBJ_TEXT.bug.name },
        { value: 'ant', label: OBJ_TEXT.ant.name },
        { value: 'stamp', label: OBJ_TEXT.stamp.name },
        { value: 'sand', label: OBJ_TEXT.sand.name },
      ],
      default: 'bug',
      visibleIf: (v) => v.mode === 'zoom',
    },
    {
      key: 'z',
      type: 'choice',
      label: L('Maßstab der Vergrößerung', 'Scale of the enlargement'),
      options: ZOOM_SCALES.map((z) => ({ value: String(z), label: L(`${z} : 1`, `${z} : 1`) })),
      default: '10',
      visibleIf: (v) => v.mode === 'zoom',
    },
    {
      key: 'cq',
      type: 'choice',
      label: L('Gesucht ist', 'Find'),
      options: [
        { value: 'real', label: L('wirkliche Länge', 'real length') },
        { value: 'map', label: L('Kartenlänge', 'map length') },
        { value: 'scale', label: L('Maßstab', 'scale') },
      ],
      default: 'real',
      visibleIf: (v) => v.mode === 'calc',
    },
    { key: 'cm', type: 'number', label: L('Länge auf der Karte', 'Length on the map'), min: 0, max: 40, step: 0.1, default: 6, unit: 'cm', visibleIf: (v) => v.mode === 'calc' && v.cq !== 'map' },
    { key: 'rw', type: 'number', label: L('Länge in Wirklichkeit', 'Real length'), min: 0, max: 100000, step: 0.1, default: 3000, unit: 'm', visibleIf: (v) => v.mode === 'calc' && v.cq !== 'real' },
    {
      key: 'cs',
      type: 'choice',
      label: L('Maßstab', 'Scale'),
      options: CALC_SCALES.map((n) => ({ value: String(n), label: scaleLabel(n) })),
      default: '50000',
      visibleIf: (v) => v.mode === 'calc' && v.cq !== 'scale',
    },
    {
      key: 'show',
      type: 'boolean',
      label: L('Ergebnis sofort anzeigen', 'Show the result right away'),
      default: true,
      help: L('Ausgeschaltet erst selbst rechnen, dann „Ergebnis anzeigen“ antippen.', 'When off, work it out first, then tap “Show result”.'),
      visibleIf: (v) => v.mode !== 'zoom',
    },
  ],
  actions: [
    { id: 'task', label: L('Neue Messaufgabe', 'New measuring task'), primary: true, visibleIf: isMap },
    { id: 'route', label: L('Wegstrecke messen', 'Measure the route'), visibleIf: isMap },
    { id: 'ctask', label: L('Neue Aufgabe', 'New task'), primary: true, visibleIf: (v) => v.mode === 'calc' },
    { id: 'go', label: L('Ergebnis anzeigen', 'Show result'), visibleIf: (v) => v.mode !== 'zoom' },
    { id: 'zin', label: L('Stärker vergrößern', 'Enlarge more'), primary: true, visibleIf: (v) => v.mode === 'zoom' },
    { id: 'zout', label: L('Weniger vergrößern', 'Enlarge less'), visibleIf: (v) => v.mode === 'zoom' },
  ],
  readouts: [
    { key: 'task', label: L('Aufgabe', 'Task') },
    { key: 'scale', label: L('Maßstab', 'Scale') },
    { key: 'map', label: L('Auf der Karte', 'On the map') },
    { key: 'img', label: L('Im Bild', 'In the picture') },
    { key: 'real', label: L('In Wirklichkeit', 'In reality'), spoiler: true },
    { key: 'res', label: L('Lösung', 'Solution'), spoiler: true },
    { key: 'calc', label: L('Rechnung', 'Calculation'), spoiler: true },
  ],
  presets: [
    { id: 'start', label: L('1 : 25 000 – Kirche bis Bahnhof', '1 : 25,000 – church to station'), values: {} },
    { id: 'town', label: L('1 : 5 000 – Kirche bis Schule', '1 : 5,000 – church to school'), values: { s: '5000', bx: 8240, by: 6680 } },
    { id: 'far', label: L('1 : 100 000 – Burgruine bis Eulenbrunn', '1 : 100,000 – castle ruin to Eulenbrunn'), values: { s: '100000', ax: 3200, ay: 3400, bx: 12800, by: 10600 } },
    { id: 'route', label: L('Wegstrecke zur Badestelle', 'Route to the bathing spot'), values: { r: true, bx: 9500, by: 5000 } },
    { id: 'sand', label: L('Sandkorn 50 : 1', 'Grain of sand 50 : 1'), values: { mode: 'zoom', o: 'sand', z: '50' } },
    { id: 'calc', label: L('6 cm ≙ 3 km – welcher Maßstab?', '6 cm ≙ 3 km – which scale?'), values: { mode: 'calc', cq: 'scale', cm: 6, rw: 3000 } },
  ],
  strings: {
    de: {
      canvas:
        'Gezeichnete Landkarte mit Dorf, Wald, See, Bach, Straßen, Bahnlinie und Höhenlinien, Maßstabsleiste und Lineal zum Messen zwischen zwei Griffen; daneben die Umrechnung von der Kartenlänge in die wirkliche Länge. Weitere Ansichten: Vergrößerung kleiner Objekte mit Lupe und Rechenaufgaben zum Maßstab.',
    },
    en: {
      canvas:
        'Drawn map with a village, forest, lake, stream, roads, railway and contour lines, a scale bar and a ruler for measuring between two handles; next to it the conversion from map length to real length. Further views: enlarging small objects with a magnifier and scale calculation tasks.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang as Lang;
    const reduced = prefersReducedMotion();
    const T = (l: Loc) => l[lang];
    const tt = (de: string, en: string) => (lang === 'de' ? de : en);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const mode = () => p.mode as Mode;
    const N = () => Number(p.s) || 25000;
    const font = (w: number, s: number) => `${w} ${s}px ${ctx.theme.font}`;
    const gi = (v: number) => intText(v, lang);
    /** Länge (µm) in Einheit als Text. */
    const lt = (um: number, unit?: LenUnit) => lengthText(um, lang, unit);
    /** Kartenlänge in cm mit einer Nachkommastelle („4,0 cm“). */
    const cm1 = (mm: number) => `${decimalIn(Math.floor(Math.abs(mm) / 10) * UM.cm, 'cm', lang).text}${lang === 'de' ? ',' : '.'}${Math.abs(mm) % 10} cm`;

    /* ---------------- weich gleitende Werte ---------------- */
    class Glide {
      private from: number;
      private to: number;
      private t0 = 0;
      private ms = 0;
      private fn: (t: number) => number = ease.inOutCubic;
      constructor(v: number) {
        this.from = v;
        this.to = v;
      }
      get target(): number {
        return this.to;
      }
      at(t: number): number {
        if (this.ms <= 0) return this.to;
        const u = clamp((t - this.t0) / this.ms, 0, 1);
        return this.from + (this.to - this.from) * this.fn(u);
      }
      busy(t: number): boolean {
        return this.ms > 0 && t < this.t0 + this.ms;
      }
      go(to: number, ms = 650, fn: (t: number) => number = ease.inOutCubic, delay = 0): void {
        const t = performance.now();
        if (to === this.to && !this.busy(t)) return;
        this.from = this.at(t);
        this.to = to;
        this.t0 = t + delay;
        this.ms = reduced ? 0 : ms;
        this.fn = fn;
      }
      snap(v: number): void {
        this.from = v;
        this.to = v;
        this.ms = 0;
      }
    }

    let now = performance.now();
    let sceneStart = now + (reduced ? -1e6 : 40);
    const sceneA = () => (reduced ? 1 : ease.outCubic(clamp((now - sceneStart) / 500, 0, 1)));
    /** Zeitstempel → Fortschritt 0 … 1 */
    const prog = (t0: number, ms: number) => (reduced ? 1 : clamp((now - t0) / ms, 0, 1));

    interface Geo {
      W: number;
      H: number;
      wide: boolean;
      C: Rect;
      panel: Rect;
    }
    let geo: Geo | null = null;
    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      if (wide) {
        const pw = Math.round(clamp(W * 0.3, 220, 340));
        return { W, H, wide, C: { x: 6, y: 6, w: W - pw - 20, h: H - 12 }, panel: { x: W - pw - 6, y: 6, w: pw, h: H - 12 } };
      }
      const ch = Math.round(H * (mode() === 'map' ? 0.72 : mode() === 'zoom' ? 0.66 : 0.6));
      return { W, H, wide, C: { x: 4, y: 4, w: W - 8, h: ch }, panel: { x: 4, y: ch + 10, w: W - 8, h: H - ch - 14 } };
    }

    /* ---------------- Treffer (Zeiger) ---------------- */
    interface Hit {
      id: string;
      x: number;
      y: number;
      w: number;
      h: number;
      cursor: string;
    }
    let hits: Hit[] = [];
    let hover: string | null = null;
    const addHit = (id: string, r: Rect, cursor = 'pointer') => hits.push({ id, ...r, cursor });
    const hitAt = (px: number, py: number): Hit | null => {
      for (let i = hits.length - 1; i >= 0; i--) {
        const h = hits[i]!;
        if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return h;
      }
      return null;
    };

    /* ---------------- Zeichenhelfer ---------------- */
    function measure(str: string, f: string): number {
      surface.g.font = f;
      return surface.g.measureText(str).width;
    }
    function wrap(str: string, maxW: number, f: string): string[] {
      const rows: string[] = [];
      let cur = '';
      const words = str.replace(/ (cm|mm|m|km)(?=[\s.,;:)–?]|$)/g, ' $1').split(' ');
      for (const w of words) {
        const next = cur ? `${cur} ${w}` : w;
        if (measure(next, f) > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }
    function fitSize(str: string, weight: number, size: number, maxW: number, min = 11): number {
      const w = measure(str, font(weight, size));
      return w <= maxW ? size : Math.max(min, Math.floor((size * maxW) / w));
    }
    const cardBg = () => (ctx.theme.dark ? shade(ctx.theme.bg, 0.06) : '#ffffff');
    function halo(str: string, x: number, y: number, f: string, color: string, align: CanvasTextAlign = 'center', a = 1, bg = cardBg(), lw = 4): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.font = f;
      g.textAlign = align;
      g.textBaseline = 'middle';
      g.lineJoin = 'round';
      g.lineWidth = lw;
      g.strokeStyle = alpha(bg, 0.9);
      g.strokeText(str, x, y);
      g.fillStyle = color;
      g.fillText(str, x, y);
      g.restore();
    }
    function card(r: Rect, accent?: string, tint = 0): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, r.x, r.y, r.w, r.h, 14);
      const grad = g.createLinearGradient(0, r.y, 0, r.y + r.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.075) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.035) : shade(theme.bg, -0.018));
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      if (accent && tint > 0) {
        g.fillStyle = alpha(accent, theme.dark ? tint * 1.6 : tint);
        g.fill();
      }
      g.strokeStyle = accent ? alpha(accent, 0.45) : alpha(theme.text, theme.dark ? 0.1 : 0.07);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }
    function pill(label: string, x: number, y: number, fill: string, color: string, size: number, a = 1): Rect {
      const g = surface.g;
      const f = font(800, size);
      const w = measure(label, f) + size * 1.1;
      const h = size * 1.75;
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 2;
      g.fillStyle = fill;
      roundRect(g, x - w / 2, y - h / 2, w, h, h / 2);
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha *= a;
      text(g, label, x, y + 0.5, { font: f, color });
      g.restore();
      return { x: x - w / 2, y: y - h / 2, w, h };
    }

    /* ---------------- Farben ---------------- */
    const cMap = () => shade(ctx.theme.series[1]!, ctx.theme.dark ? 0.12 : -0.05);
    const cScale = () => shade(ctx.theme.series[4]!, ctx.theme.dark ? 0.2 : -0.05);
    const cReal = () => shade(ctx.theme.series[5]!, ctx.theme.dark ? 0.15 : -0.1);
    const cAsk = () => shade(ctx.theme.series[3]!, ctx.theme.dark ? 0.1 : -0.1);

    interface Palette {
      key: string;
      paper: string;
      paperEdge: string;
      fieldA: string;
      fieldB: string;
      forest: string;
      forestEdge: string;
      tree: string;
      water: string;
      waterEdge: string;
      waterText: string;
      built: string;
      house: string;
      houseRoof: string;
      garden: string;
      gardenTree: string;
      mainFill: string;
      mainCase: string;
      minorFill: string;
      minorCase: string;
      track: string;
      rail: string;
      railDash: string;
      contour: string;
      contourText: string;
      label: string;
      forestText: string;
      paved: string;
      sport: string;
      track2: string;
      sand: string;
    }
    let palCache: Palette | null = null;
    function pal(): Palette {
      const th = ctx.theme;
      const key = `${th.dark}|${th.bg}|${th.series.join(',')}`;
      if (palCache && palCache.key === key) return palCache;
      const d = th.dark;
      const s = th.series;
      const paper = d ? mixColor(shade(th.bg, 0.07), s[2]!, 0.07) : mixColor('#fbfaf2', s[2]!, 0.035);
      const straw = mixColor(s[3]!, s[2]!, 0.4);
      const forest = mixColor(paper, s[2]!, d ? 0.34 : 0.36);
      const water = mixColor(paper, s[0]!, d ? 0.4 : 0.34);
      palCache = {
        key,
        paper,
        paperEdge: d ? shade(paper, -0.25) : mixColor(paper, s[3]!, 0.12),
        fieldA: mixColor(paper, s[2]!, d ? 0.09 : 0.12),
        fieldB: mixColor(paper, straw, d ? 0.09 : 0.16),
        forest,
        forestEdge: shade(forest, d ? -0.25 : -0.2),
        tree: shade(forest, d ? -0.22 : -0.16),
        water,
        waterEdge: shade(water, d ? 0.08 : -0.22),
        waterText: d ? shade(s[0]!, 0.35) : shade(s[0]!, -0.2),
        built: mixColor(paper, mixColor(s[1]!, '#8a8a8a', 0.55), d ? 0.16 : 0.15),
        house: d ? mixColor('#a39693', s[1]!, 0.18) : mixColor('#5e5350', s[1]!, 0.18),
        houseRoof: d ? mixColor('#c8b8b2', s[1]!, 0.2) : mixColor('#9b7f78', s[1]!, 0.25),
        garden: mixColor(paper, s[2]!, d ? 0.16 : 0.2),
        gardenTree: mixColor(paper, s[2]!, d ? 0.42 : 0.5),
        mainFill: d ? mixColor(paper, s[3]!, 0.55) : mixColor('#ffffff', s[3]!, 0.42),
        mainCase: d ? shade(s[3]!, -0.45) : shade(s[3]!, -0.3),
        minorFill: d ? mixColor(paper, '#ffffff', 0.32) : '#ffffff',
        minorCase: d ? shade(paper, -0.45) : mixColor(paper, th.text, 0.42),
        track: d ? mixColor(paper, s[3]!, 0.5) : mixColor(paper, '#6b4a2a', 0.55),
        rail: d ? mixColor(paper, th.text, 0.75) : mixColor(paper, th.text, 0.85),
        railDash: d ? shade(paper, -0.2) : '#ffffff',
        contour: d ? mixColor(paper, s[3]!, 0.45) : mixColor(paper, mixColor(s[3]!, '#5a3412', 0.45), 0.5),
        contourText: d ? mixColor(paper, s[3]!, 0.7) : mixColor(s[3]!, '#5a3412', 0.55),
        label: d ? shade(th.text, -0.03) : shade(th.text, 0.05),
        forestText: d ? shade(s[2]!, 0.3) : shade(s[2]!, -0.35),
        paved: d ? mixColor(paper, '#ffffff', 0.12) : mixColor(paper, '#8a8f99', 0.16),
        sport: mixColor(paper, s[2]!, d ? 0.3 : 0.42),
        track2: d ? mixColor(paper, s[1]!, 0.35) : mixColor(paper, s[1]!, 0.38),
        sand: d ? mixColor(paper, '#d8b46a', 0.35) : mixColor(paper, '#e8c77a', 0.6),
      };
      return palCache;
    }

    /* ================================================================== */
    /* Karte: Ansicht                                                      */
    /* ================================================================== */

    const houses = buildHouses();
    const fields = buildFields();
    const contourSets = HILLS.map((h) => ({ hill: h, lines: contours(h) }));
    const bbox = (pts: readonly Pt[]) => {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const q of pts) {
        x0 = Math.min(x0, q.x);
        y0 = Math.min(y0, q.y);
        x1 = Math.max(x1, q.x);
        y1 = Math.max(y1, q.y);
      }
      return { x0, y0, x1, y1 };
    };
    const forestBoxes = FORESTS.map(bbox);

    interface View {
      R: Rect;
      n: number;
      /** Pixel pro Meter */
      k: number;
      cx: number;
      cy: number;
      ppc: number;
    }
    const logN = new Glide(Math.log(N()));
    const camX = new Glide(0);
    const camY = new Glide(0);

    function mapRect(gm: Geo): Rect {
      const C = gm.C;
      return { x: C.x + 6, y: C.y + 6, w: C.w - 12, h: C.h - 12 };
    }
    /** Pixel pro „Kartenzentimeter“ (die Zentimeter des Lineals in der Simulation). */
    function pxPerCm(R: Rect): number {
      return clamp(Math.min(R.w / 14.5, R.h / 9.2), 22, 44);
    }
    function centreFor(R: Rect, n: number, a: Pt, b: Pt): Pt {
      const k = (pxPerCm(R) * 100) / n;
      const hw = R.w / 2 / k;
      const hh = R.h / 2 / k;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      return {
        x: WORLD.w > 2 * hw ? clamp(mx, hw, WORLD.w - hw) : WORLD.w / 2,
        y: WORLD.h > 2 * hh ? clamp(my, hh, WORLD.h - hh) : WORLD.h / 2,
      };
    }
    function viewNow(R: Rect): View {
      const n = Math.exp(logN.at(now));
      const ppc = pxPerCm(R);
      return { R, n, k: (ppc * 100) / n, cx: camX.at(now), cy: camY.at(now), ppc };
    }
    const toPx = (v: View, x: number, y: number): [number, number] => [v.R.x + v.R.w / 2 + (x - v.cx) * v.k, v.R.y + v.R.h / 2 + (y - v.cy) * v.k];
    const toWorld = (v: View, px: number, py: number): Pt => ({ x: v.cx + (px - v.R.x - v.R.w / 2) / v.k, y: v.cy + (py - v.R.y - v.R.h / 2) / v.k });

    const A = (): Pt => ({ x: p.ax, y: p.ay });
    const B = (): Pt => ({ x: p.bx, y: p.by });

    /** Kamera auf die Messstrecke ausrichten (weich oder sofort). */
    function aimCamera(ms: number, snap = false): void {
      if (!geo) return;
      const R = mapRect(geo);
      let a = A();
      let b = B();
      if (p.r) {
        const rt = shortestRoute(ROADS, a, b);
        if (rt.length > 1) {
          const bb = bbox(rt);
          a = { x: bb.x0, y: bb.y0 };
          b = { x: bb.x1, y: bb.y1 };
        }
      }
      const c = centreFor(R, N(), a, b);
      if (snap || ms <= 0) {
        logN.snap(Math.log(N()));
        camX.snap(c.x);
        camY.snap(c.y);
      } else {
        logN.go(Math.log(N()), ms, ease.inOutCubic);
        camX.go(c.x, ms, ease.inOutCubic);
        camY.go(c.y, ms, ease.inOutCubic);
      }
    }

    /* ---------------- Messung ---------------- */
    interface Measure {
      key: string;
      n: number;
      route: Pt[] | null;
      pieces: { mm: number[]; from: number[] } | null;
      mm: number;
      realUm: number;
      fromName: string | null;
      toName: string | null;
    }
    let measCache: Measure | null = null;
    const poiAt = (q: Pt) => POIS.find((o) => Math.hypot(o.x - q.x, o.y - q.y) < 6) ?? null;
    function meas(): Measure {
      const n = N();
      const key = `${p.ax}|${p.ay}|${p.bx}|${p.by}|${n}|${p.r}`;
      if (measCache && measCache.key === key) return measCache;
      const a = A();
      const b = B();
      let route: Pt[] | null = null;
      let pieces: Measure['pieces'] = null;
      let mm: number;
      if (p.r) {
        route = shortestRoute(ROADS, a, b);
        const pc = routePiecesMm(route, n);
        pieces = { mm: pc.mm, from: pc.from };
        mm = pc.total;
      } else mm = mapMmFromMetres(dist(a, b), n);
      const fa = poiAt(a);
      const fb = poiAt(b);
      measCache = { key, n, route, pieces, mm, realUm: realUmFromMapMm(mm, n), fromName: fa ? T(fa.name) : null, toName: fb ? T(fb.name) : null };
      return measCache;
    }

    let revealed = p.show;
    const mmShown = new Glide(0);
    let rulerAt = now + 500;
    let chainAt = now + 1100;
    let routeAt = now + 500;
    let note: { text: string; at: number } | null = null;
    let nextEnd: 'a' | 'b' = 'a';
    let drag: { kind: 'a' | 'b' | 'line' | 'poi'; id?: string; x0: number; y0: number; moved: boolean; a0?: Pt; b0?: Pt } | null = null;
    const toast = (s: string) => (note = { text: s, at: performance.now() });

    /** Strecke so kürzen, dass sie beim Maßstab n auf den Ausschnitt passt (nur nach eigener Bedienung). */
    function fitted(n: number, a: Pt, b: Pt): { a: Pt; b: Pt } | null {
      if (!geo) return null;
      const R = mapRect(geo);
      const ppc = pxPerCm(R);
      const k = (ppc * 100) / n;
      const margin = 16 / k;
      const hw = R.w / 2 / k - margin;
      const hh = R.h / 2 / k - margin;
      const c = centreFor(R, n, a, b);
      const inside = (q: Pt) => Math.abs(q.x - c.x) <= hw && Math.abs(q.y - c.y) <= hh;
      if (inside(a) && inside(b)) return null;
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const cc = centreFor(R, n, m, m);
      const dx = (b.x - a.x) / 2;
      const dy = (b.y - a.y) / 2;
      let t = 1;
      if (Math.abs(dx) > 1e-9) t = Math.min(t, (hw - Math.abs(m.x - cc.x)) / Math.abs(dx));
      if (Math.abs(dy) > 1e-9) t = Math.min(t, (hh - Math.abs(m.y - cc.y)) / Math.abs(dy));
      t = clamp(t, 0, 1);
      return { a: { x: Math.round(m.x - dx * t), y: Math.round(m.y - dy * t) }, b: { x: Math.round(m.x + dx * t), y: Math.round(m.y + dy * t) } };
    }

    function restartMeasureAnim(delay = 120): void {
      now = performance.now();
      rulerAt = now + (reduced ? -1e6 : delay);
      chainAt = now + (reduced ? -1e6 : delay + 650);
      routeAt = now + (reduced ? -1e6 : delay);
    }

    /* ---------------- Landschaft zeichnen ---------------- */
    function pathPoly(v: View, pts: readonly Pt[], closed: boolean, smoothOn: boolean): void {
      const g = surface.g;
      const P = pts.map((q) => toPx(v, q.x, q.y));
      g.beginPath();
      if (!smoothOn || P.length < 3) {
        P.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        if (closed) g.closePath();
        return;
      }
      if (closed) {
        const m0 = [(P[0]![0] + P[P.length - 1]![0]) / 2, (P[0]![1] + P[P.length - 1]![1]) / 2];
        g.moveTo(m0[0]!, m0[1]!);
        for (let i = 0; i < P.length; i++) {
          const a = P[i]!;
          const b = P[(i + 1) % P.length]!;
          g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        }
        g.closePath();
      } else {
        g.moveTo(P[0]![0], P[0]![1]);
        for (let i = 1; i < P.length - 1; i++) {
          const a = P[i]!;
          const b = P[i + 1]!;
          g.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
        }
        g.lineTo(P[P.length - 1]![0], P[P.length - 1]![1]);
      }
    }

    function visibleBox(v: View, pad = 0): { x0: number; y0: number; x1: number; y1: number } {
      const a = toWorld(v, v.R.x - pad, v.R.y - pad);
      const b = toWorld(v, v.R.x + v.R.w + pad, v.R.y + v.R.h + pad);
      return { x0: a.x, y0: a.y, x1: b.x, y1: b.y };
    }
    const overlaps = (a: { x0: number; y0: number; x1: number; y1: number }, b: { x0: number; y0: number; x1: number; y1: number }) => a.x0 <= b.x1 && a.x1 >= b.x0 && a.y0 <= b.y1 && a.y1 >= b.y0;

    /** Kleines Pseudo-Zufallsrauschen aus ganzzahligen Zellen (für Bäume). */
    const hash = (i: number, j: number, s: number) => {
      let h = (i * 374761393 + j * 668265263 + s * 2147483647) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
    };

    function drawTrees(v: View, a: number): void {
      if (a <= 0.02) return;
      const g = surface.g;
      const P = pal();
      const vb = visibleBox(v, 10);
      // Abstand der Baumsymbole in m: bei großem Maßstab dichter
      const step = v.n < 12000 ? 40 : 130;
      const r = clamp(step * v.k * 0.32, 1.6, 5);
      g.save();
      g.globalAlpha *= a;
      for (let f = 0; f < FORESTS.length; f++) {
        const fb = forestBoxes[f]!;
        if (!overlaps(fb, vb)) continue;
        const i0 = Math.floor(Math.max(fb.x0, vb.x0) / step);
        const i1 = Math.ceil(Math.min(fb.x1, vb.x1) / step);
        const j0 = Math.floor(Math.max(fb.y0, vb.y0) / step);
        const j1 = Math.ceil(Math.min(fb.y1, vb.y1) / step);
        if ((i1 - i0) * (j1 - j0) > 4000) continue;
        for (let i = i0; i <= i1; i++)
          for (let j = j0; j <= j1; j++) {
            const q = { x: (i + 0.15 + hash(i, j, 1) * 0.7) * step, y: (j + 0.15 + hash(i, j, 2) * 0.7) * step };
            if (!inPolygon(q, FORESTS[f]!)) continue;
            const [x, y] = toPx(v, q.x, q.y);
            const leaf = hash(i, j, 3) < 0.7;
            g.fillStyle = P.tree;
            g.strokeStyle = P.tree;
            g.lineWidth = 1;
            if (leaf) {
              g.beginPath();
              g.arc(x, y, r, 0, Math.PI * 2);
              g.globalAlpha = a * 0.75;
              g.stroke();
            } else {
              // Nadelbaum: kleines Dreieck
              g.globalAlpha = a * 0.7;
              g.beginPath();
              g.moveTo(x, y - r * 1.2);
              g.lineTo(x + r * 0.9, y + r * 0.8);
              g.lineTo(x - r * 0.9, y + r * 0.8);
              g.closePath();
              g.fill();
            }
          }
      }
      g.restore();
    }

    function drawHouse(v: View, h: (typeof houses)[number], detail: number, idx: number): void {
      const g = surface.g;
      const P = pal();
      const [x, y] = toPx(v, h.x, h.y);
      const w = Math.max(h.w * v.k, 3.8);
      const d = Math.max(h.d * v.k, 3.2);
      g.save();
      g.translate(x, y);
      g.rotate(h.a);
      if (detail > 0.02) {
        // Grundstück mit Garten hinter dem Haus, Zaun und Gartenbaum
        const pw = 25 * v.k;
        const pd = 34 * v.k;
        const y0 = h.side > 0 ? -d / 2 - 3 * v.k : d / 2 + 3 * v.k - pd;
        g.globalAlpha = detail;
        g.fillStyle = P.garden;
        g.fillRect(-pw / 2, y0, pw, pd);
        g.strokeStyle = alpha(P.forestEdge, 0.35);
        g.lineWidth = 0.8;
        g.strokeRect(-pw / 2, y0, pw, pd);
        const tr = (3 + hash(idx, 1, 5) * 2.5) * v.k;
        const tx = (hash(idx, 2, 5) - 0.5) * (pw - 2 * tr);
        const ty = h.side > 0 ? y0 + pd - tr - 2 * v.k : y0 + tr + 2 * v.k;
        g.fillStyle = P.gardenTree;
        g.beginPath();
        g.arc(tx, ty, tr, 0, Math.PI * 2);
        g.fill();
        g.globalAlpha = 1;
      }
      g.fillStyle = P.house;
      g.fillRect(-w / 2, -d / 2, w, d);
      if (detail > 0.02 && w > 6) {
        g.globalAlpha = detail;
        g.fillStyle = P.houseRoof;
        g.fillRect(-w / 2 + 1, -d / 2 + 1, w - 2, d / 2 - 1);
        g.strokeStyle = shade(P.house, -0.2);
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(-w / 2 + 1, 0);
        g.lineTo(w / 2 - 1, 0);
        g.stroke();
      }
      g.restore();
    }

    /** Ein Gebäude als gedrehtes Rechteck (Weltmaße in m). */
    function building(v: View, x: number, y: number, w: number, h: number, rot: number, fill: string, a: number): void {
      const g = surface.g;
      const [px, py] = toPx(v, x, y);
      g.save();
      g.globalAlpha *= a;
      g.translate(px, py);
      g.rotate(rot);
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.4)' : 'rgba(40,30,20,0.25)';
      g.shadowBlur = 3;
      g.shadowOffsetY = 1;
      g.fillStyle = fill;
      g.fillRect((-w / 2) * v.k, (-h / 2) * v.k, w * v.k, h * v.k);
      g.restore();
    }

    function drawPoiDetail(v: View, o: Poi, a: number): void {
      if (a <= 0.02) return;
      const g = surface.g;
      const P = pal();
      const th = ctx.theme;
      const [x, y] = toPx(v, o.x, o.y);
      const k = v.k;
      const dark = shade(P.house, -0.12);
      g.save();
      g.globalAlpha *= a;
      switch (o.kind) {
        case 'church': {
          g.fillStyle = P.paved;
          g.beginPath();
          g.arc(x, y, 46 * k, 0, Math.PI * 2);
          g.fill();
          building(v, o.x + 6, o.y, 34, 15, 0, dark, 1);
          building(v, o.x - 16, o.y, 10, 10, 0, shade(dark, -0.15), 1);
          // Kreuz auf dem Turm
          g.strokeStyle = P.paper;
          g.lineWidth = Math.max(1, 1.6 * k);
          const tx = x - 16 * k;
          g.beginPath();
          g.moveTo(tx, y - 3.5 * k);
          g.lineTo(tx, y + 3.5 * k);
          g.moveTo(tx - 2.5 * k, y - 1 * k);
          g.lineTo(tx + 2.5 * k, y - 1 * k);
          g.stroke();
          break;
        }
        case 'school': {
          g.fillStyle = P.paved;
          g.fillRect(x - 40 * k, y + 2 * k, 60 * k, 34 * k);
          building(v, o.x - 6, o.y - 8, 56, 16, 0, dark, 1);
          building(v, o.x + 24, o.y + 12, 14, 30, 0, dark, 1);
          break;
        }
        case 'hall': {
          g.fillStyle = P.paved;
          g.fillRect(x - 26 * k, y + 8 * k, 52 * k, 24 * k);
          building(v, o.x, o.y, 28, 17, 0, dark, 1);
          break;
        }
        case 'sport': {
          g.save();
          g.translate(x, y);
          g.rotate(-0.08);
          const fw = 104 * k;
          const fh = 66 * k;
          roundRect(g, -fw / 2 - 8 * k, -fh / 2 - 8 * k, fw + 16 * k, fh + 16 * k, 30 * k);
          g.fillStyle = P.track2;
          g.fill();
          g.fillStyle = P.sport;
          g.fillRect(-fw / 2, -fh / 2, fw, fh);
          g.strokeStyle = alpha('#ffffff', th.dark ? 0.55 : 0.9);
          g.lineWidth = Math.max(1, 0.9 * k);
          g.strokeRect(-fw / 2 + 2 * k, -fh / 2 + 2 * k, fw - 4 * k, fh - 4 * k);
          g.beginPath();
          g.moveTo(0, -fh / 2 + 2 * k);
          g.lineTo(0, fh / 2 - 2 * k);
          g.stroke();
          g.beginPath();
          g.arc(0, 0, 9 * k, 0, Math.PI * 2);
          g.stroke();
          g.restore();
          break;
        }
        case 'station': {
          // Bahnsteig entlang der Gleise
          const ang = Math.atan2(7870 - 7800, 7400 - 6800);
          g.save();
          g.translate(x, y);
          g.rotate(ang);
          g.fillStyle = P.paved;
          g.fillRect(-90 * k, 34 * k, 180 * k, 9 * k);
          g.restore();
          building(v, o.x, o.y, 40, 13, ang, dark, 1);
          break;
        }
        case 'farm': {
          g.fillStyle = P.paved;
          g.fillRect(x - 30 * k, y - 22 * k, 60 * k, 44 * k);
          building(v, o.x - 20, o.y, 14, 40, 0, dark, 1);
          building(v, o.x + 8, o.y - 16, 40, 12, 0, dark, 1);
          building(v, o.x + 18, o.y + 14, 22, 14, 0, P.house, 1);
          break;
        }
        case 'mill': {
          building(v, o.x, o.y, 24, 16, 0.3, dark, 1);
          break;
        }
        case 'tower': {
          building(v, o.x, o.y, 9, 9, 0.6, dark, 1);
          break;
        }
        case 'castle': {
          g.strokeStyle = dark;
          g.lineWidth = Math.max(1.5, 4 * k);
          g.beginPath();
          g.rect(x - 36 * k, y - 26 * k, 72 * k, 52 * k);
          g.stroke();
          for (const [dx, dy] of [
            [-36, -26],
            [36, -26],
            [36, 26],
            [-36, 26],
          ] as const) {
            g.fillStyle = dark;
            g.beginPath();
            g.arc(x + dx * k, y + dy * k, 7 * k, 0, Math.PI * 2);
            g.fill();
          }
          break;
        }
        case 'beach': {
          g.fillStyle = P.sand;
          g.beginPath();
          g.ellipse(x + 30 * k, y - 20 * k, 70 * k, 30 * k, -0.5, 0, Math.PI * 2);
          g.fill();
          break;
        }
        default:
          break;
      }
      g.restore();
    }

    /** Kartenzeichen eines Ortes (feste Größe in Pixeln). */
    function drawSymbol(kind: PoiKind, x: number, y: number, s: number, a: number, hot: boolean): void {
      if (a <= 0.02) return;
      const g = surface.g;
      const th = ctx.theme;
      const P = pal();
      const ink = th.dark ? shade(th.text, -0.05) : shade(th.text, 0.1);
      g.save();
      g.globalAlpha *= a;
      if (kind === 'village') {
        g.restore();
        return;
      }
      const r = s;
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
      g.shadowBlur = hot ? 8 : 4;
      g.shadowOffsetY = 1;
      g.beginPath();
      g.arc(x, y, r * (hot ? 1.15 : 1), 0, Math.PI * 2);
      g.fillStyle = th.dark ? shade(P.paper, 0.12) : '#ffffff';
      g.fill();
      g.shadowColor = 'transparent';
      g.lineWidth = 1.4;
      g.strokeStyle = hot ? cMap() : alpha(ink, 0.65);
      g.stroke();
      g.strokeStyle = ink;
      g.fillStyle = ink;
      g.lineWidth = 1.5;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const u = r * 0.55;
      g.beginPath();
      switch (kind) {
        case 'church':
          g.moveTo(x, y - u);
          g.lineTo(x, y + u);
          g.moveTo(x - u * 0.6, y - u * 0.3);
          g.lineTo(x + u * 0.6, y - u * 0.3);
          g.stroke();
          break;
        case 'school':
          g.moveTo(x - u * 0.9, y + u * 0.7);
          g.lineTo(x - u * 0.9, y - u * 0.1);
          g.lineTo(x, y - u * 0.8);
          g.lineTo(x + u * 0.9, y - u * 0.1);
          g.lineTo(x + u * 0.9, y + u * 0.7);
          g.closePath();
          g.stroke();
          g.beginPath();
          g.arc(x, y + u * 0.05, u * 0.22, 0, Math.PI * 2);
          g.fill();
          break;
        case 'hall':
          g.moveTo(x - u * 0.5, y + u * 0.9);
          g.lineTo(x - u * 0.5, y - u * 0.9);
          g.stroke();
          g.beginPath();
          g.moveTo(x - u * 0.5, y - u * 0.9);
          g.lineTo(x + u * 0.8, y - u * 0.55);
          g.lineTo(x - u * 0.5, y - u * 0.15);
          g.closePath();
          g.fillStyle = cScale();
          g.fill();
          break;
        case 'sport':
          g.ellipse(x, y, u * 0.95, u * 0.62, 0, 0, Math.PI * 2);
          g.stroke();
          g.beginPath();
          g.moveTo(x, y - u * 0.62);
          g.lineTo(x, y + u * 0.62);
          g.stroke();
          break;
        case 'station':
          g.fillRect(x - u * 0.85, y - u * 0.55, u * 1.7, u * 1.1);
          g.fillStyle = th.dark ? shade(P.paper, 0.12) : '#ffffff';
          g.fillRect(x - u * 0.6, y - u * 0.35, u * 0.5, u * 0.4);
          g.fillRect(x + u * 0.1, y - u * 0.35, u * 0.5, u * 0.4);
          break;
        case 'beach':
          for (let i = -1; i <= 1; i += 2) {
            g.beginPath();
            const yy = y + i * u * 0.35;
            g.moveTo(x - u * 0.9, yy);
            g.quadraticCurveTo(x - u * 0.45, yy - u * 0.4, x, yy);
            g.quadraticCurveTo(x + u * 0.45, yy + u * 0.4, x + u * 0.9, yy);
            g.strokeStyle = P.waterText;
            g.stroke();
          }
          break;
        case 'tower':
          g.moveTo(x - u * 0.7, y + u * 0.8);
          g.lineTo(x, y - u * 0.9);
          g.lineTo(x + u * 0.7, y + u * 0.8);
          g.moveTo(x - u * 0.35, y);
          g.lineTo(x + u * 0.35, y);
          g.stroke();
          break;
        case 'mill':
          g.arc(x, y, u * 0.75, 0, Math.PI * 2);
          for (let i = 0; i < 4; i++) {
            const an = (i * Math.PI) / 4;
            g.moveTo(x - Math.cos(an) * u * 0.75, y - Math.sin(an) * u * 0.75);
            g.lineTo(x + Math.cos(an) * u * 0.75, y + Math.sin(an) * u * 0.75);
          }
          g.stroke();
          break;
        case 'farm':
          g.moveTo(x - u * 0.8, y + u * 0.7);
          g.lineTo(x - u * 0.8, y - u * 0.1);
          g.lineTo(x, y - u * 0.8);
          g.lineTo(x + u * 0.8, y - u * 0.1);
          g.lineTo(x + u * 0.8, y + u * 0.7);
          g.closePath();
          g.fill();
          break;
        case 'castle':
          g.moveTo(x - u * 0.8, y + u * 0.8);
          g.lineTo(x - u * 0.8, y - u * 0.7);
          g.lineTo(x - u * 0.4, y - u * 0.7);
          g.lineTo(x - u * 0.4, y - u * 0.35);
          g.lineTo(x, y - u * 0.35);
          g.lineTo(x, y - u * 0.7);
          g.lineTo(x + u * 0.4, y - u * 0.7);
          g.lineTo(x + u * 0.4, y - u * 0.35);
          g.lineTo(x + u * 0.8, y - u * 0.35);
          g.lineTo(x + u * 0.8, y + u * 0.8);
          g.closePath();
          g.fill();
          break;
        default:
          break;
      }
      g.restore();
    }

    /* ---------------- Beschriftungen ohne Überlappung ---------------- */
    interface Box {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    }
    let placed: Box[] = [];
    const freeBox = (b: Box) => !placed.some((q) => b.x0 < q.x1 && b.x1 > q.x0 && b.y0 < q.y1 && b.y1 > q.y0);
    /** Beschriftung an einer der Kandidatenstellen setzen, falls frei. */
    function placeLabel(str: string, x: number, y: number, f: string, color: string, offs: [number, number, CanvasTextAlign][], a: number, R: Rect, bg: string): boolean {
      const w = measure(str, f);
      const size = parseFloat(/(\d+(\.\d+)?)px/.exec(f)?.[1] ?? '12');
      const h = size * 1.2;
      for (const [dx, dy, al] of offs) {
        const lx = x + dx;
        const ly = y + dy;
        const x0 = al === 'left' ? lx : al === 'right' ? lx - w : lx - w / 2;
        const b = { x0: x0 - 3, y0: ly - h / 2 - 1, x1: x0 + w + 3, y1: ly + h / 2 + 1 };
        if (b.x0 < R.x + 2 || b.x1 > R.x + R.w - 2 || b.y0 < R.y + 2 || b.y1 > R.y + R.h - 2) continue;
        if (!freeBox(b)) continue;
        placed.push(b);
        halo(str, lx, ly, f, color, al, a, bg, 3.5);
        return true;
      }
      return false;
    }

    function drawLandscape(v: View): void {
      const g = surface.g;
      const P = pal();
      const th = ctx.theme;
      const R = v.R;
      const z = Math.log10(v.n);
      const vb = visibleBox(v, 40);
      // Grund und Feldflur
      g.fillStyle = P.paper;
      g.fillRect(R.x, R.y, R.w, R.h);
      const fa = 0.55 + 0.45 * (1 - smooth(4.4, 5, z));
      g.save();
      g.globalAlpha = fa;
      for (const f of fields) {
        const fb = bbox(f.pts);
        if (!overlaps(fb, vb)) continue;
        g.fillStyle = f.tone > 0.7 ? P.fieldB : P.fieldA;
        pathPoly(v, f.pts, true, false);
        g.fill();
      }
      g.restore();
      // Höhenlinien
      g.save();
      g.lineJoin = 'round';
      for (const cs of contourSets) {
        for (const c of cs.lines) {
          const cb = bbox(c.pts);
          if (!overlaps(cb, vb)) continue;
          const index = (c.level - BASE_LEVEL) % (CONTOUR_STEP * 5) === 0;
          const show = index ? 1 : 1 - smooth(4.75, 4.95, z);
          if (show <= 0.02) continue;
          g.globalAlpha = show * (th.dark ? 0.75 : 0.8);
          g.strokeStyle = P.contour;
          g.lineWidth = index ? 1.5 : 0.9;
          pathPoly(v, c.pts, true, true);
          g.stroke();
        }
      }
      g.restore();
      // Wälder
      for (let f = 0; f < FORESTS.length; f++) {
        if (!overlaps(forestBoxes[f]!, vb)) continue;
        g.fillStyle = P.forest;
        pathPoly(v, FORESTS[f]!, true, true);
        g.fill();
        g.strokeStyle = P.forestEdge;
        g.lineWidth = 1;
        g.stroke();
      }
      drawTrees(v, 1 - smooth(4.45, 4.62, z));
      // Siedlungsflächen
      const housesA = 1 - smooth(4.48, 4.64, z);
      for (const vil of VILLAGES) {
        g.save();
        g.globalAlpha = 0.45 + 0.55 * (1 - housesA);
        g.fillStyle = P.built;
        pathPoly(v, vil.outline, true, true);
        g.fill();
        g.globalAlpha = (1 - housesA) * 0.6;
        g.strokeStyle = shade(P.built, th.dark ? 0.2 : -0.15);
        g.lineWidth = 1;
        g.stroke();
        g.restore();
      }
      // Gewässer
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      for (const s of STREAMS) {
        pathPoly(v, s, false, true);
        g.strokeStyle = P.waterEdge;
        g.lineWidth = Math.max(1.4, 4 * v.k);
        g.stroke();
      }
      const rw = Math.max(2.6, 12 * v.k);
      pathPoly(v, RIVER, false, true);
      g.strokeStyle = P.waterEdge;
      g.lineWidth = rw + 1.6;
      g.stroke();
      g.strokeStyle = P.water;
      g.lineWidth = rw;
      g.stroke();
      pathPoly(v, LAKE, true, true);
      g.fillStyle = P.water;
      g.fill();
      g.strokeStyle = P.waterEdge;
      g.lineWidth = 1.2;
      g.stroke();
      g.restore();
      // Strand an der Badestelle, Sportplatz usw. (Einzelheiten unter den Straßen)
      const detailA = 1 - smooth(3.85, 4.2, z);
      const midA = 1 - smooth(4.2, 4.5, z);
      for (const o of POIS) if (o.kind === 'beach' || o.kind === 'sport') drawPoiDetail(v, o, o.kind === 'sport' ? midA : detailA * 0.9 + midA * 0.1);
      // Bahn (unter den Straßen)
      g.save();
      g.lineCap = 'butt';
      g.lineJoin = 'round';
      pathPoly(v, RAIL, false, false);
      g.strokeStyle = P.rail;
      g.lineWidth = 4;
      g.stroke();
      g.setLineDash([9, 9]);
      g.strokeStyle = P.railDash;
      g.lineWidth = 2;
      g.stroke();
      g.setLineDash([]);
      g.restore();
      // Straßen: erst Ränder, dann Füllung; Feldwege gestrichelt
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      const trackA = 1 - smooth(4.6, 4.85, z);
      for (const l of ROAD_LINES) {
        if (l.cls !== 'track' || trackA <= 0.02) continue;
        pathPoly(v, l.pts, false, false);
        g.globalAlpha = trackA;
        g.setLineDash([5, 4]);
        g.strokeStyle = P.track;
        g.lineWidth = Math.max(1.2, 3 * v.k);
        g.stroke();
        g.setLineDash([]);
      }
      g.globalAlpha = 1;
      const width = (cls: string) => (cls === 'main' ? Math.max(3.4, 10 * v.k) : Math.max(2.2, 7 * v.k));
      for (const cls of ['minor', 'main']) {
        for (const l of ROAD_LINES) {
          if (l.cls !== cls) continue;
          pathPoly(v, l.pts, false, false);
          g.strokeStyle = cls === 'main' ? P.mainCase : P.minorCase;
          g.lineWidth = width(cls) + 2.2;
          g.stroke();
        }
        for (const l of ROAD_LINES) {
          if (l.cls !== cls) continue;
          pathPoly(v, l.pts, false, false);
          g.strokeStyle = cls === 'main' ? P.mainFill : P.minorFill;
          g.lineWidth = width(cls);
          g.stroke();
        }
      }
      g.restore();
      // Häuser
      if (housesA > 0.02) {
        g.save();
        g.globalAlpha = housesA;
        for (const h of houses) {
          if (h.x < vb.x0 || h.x > vb.x1 || h.y < vb.y0 || h.y > vb.y1) continue;
          drawHouse(v, h, detailA, houses.indexOf(h));
        }
        g.restore();
      }
      // Gebäude der Orte bei großem Maßstab
      for (const o of POIS) if (o.kind !== 'beach' && o.kind !== 'sport') drawPoiDetail(v, o, o.kind === 'castle' || o.kind === 'farm' || o.kind === 'mill' ? midA : detailA);
    }

    /** Sichtbarkeit eines Ortes bei der aktuellen (gleitenden) Maßstabszahl. */
    const poiA = (o: Poi, n: number) => 1 - smooth(Math.log10(o.maxN) + 0.04, Math.log10(o.maxN) + 0.2, Math.log10(n));

    function drawPoisAndLabels(v: View, fromId: string | null, toId: string | null, phase: 'sym' | 'lab'): void {
      const P = pal();
      const th = ctx.theme;
      const R = v.R;
      const z = Math.log10(v.n);
      const narrowMap = R.w < 420;
      const lf = font(650, narrowMap ? 11 : 12);
      // Ortssymbole
      const s = narrowMap ? 8.5 : 9.5;
      const symA = smooth(3.85, 4.2, z) * 0.65 + 0.35;
      const vis: { o: Poi; x: number; y: number; a: number }[] = [];
      for (const o of POIS) {
        const a = poiA(o, v.n);
        if (a <= 0.02) continue;
        const [x, y] = toPx(v, o.x, o.y);
        if (x < R.x - 20 || x > R.x + R.w + 20 || y < R.y - 20 || y > R.y + R.h + 20) continue;
        vis.push({ o, x, y, a });
      }
      if (phase === 'sym') {
      // Platz für Symbole und Griffe freihalten
      for (const q of vis) if (q.o.kind !== 'village') placed.push({ x0: q.x - s, y0: q.y - s, x1: q.x + s, y1: q.y + s });
      for (const q of vis) {
        if (q.o.kind === 'village') continue;
        const hot = hover === `poi:${q.o.id}` || q.o.id === fromId || q.o.id === toId;
        if (q.o.id === fromId || q.o.id === toId) continue;
        drawSymbol(q.o.kind, q.x, q.y, s, q.a * (hot ? 1 : symA), hover === `poi:${q.o.id}`);
        if (!ctx.locked) addHit(`poi:${q.o.id}`, { x: q.x - s - 4, y: q.y - s - 4, w: 2 * s + 8, h: 2 * s + 8 });
      }
      return;
      }
      // Ortsnamen (Dörfer) zuerst, groß
      const vf = font(800, narrowMap ? 13 : clamp(15 - (z - 4.4) * 3, 13, 17));
      for (const vil of VILLAGES) {
        const nm = vil.id === 'v2' ? POIS.find((o) => o.id === 'village2')!.name : vil.name;
        if (!nm) continue;
        const [x, y] = toPx(v, vil.label.x, vil.label.y);
        if (vil.id === 'v2') {
          const q = vis.find((o) => o.o.id === 'village2');
          if (q && !ctx.locked && fromId !== 'village2' && toId !== 'village2') addHit('poi:village2', { x: x - 30, y: y - 14, w: 60, h: 28 });
        }
        placeLabel(T(nm).toUpperCase(), x, y, vf, P.label, [[0, 0, 'center'], [0, -18, 'center'], [0, 18, 'center']], 1, R, P.paper);
      }
      // Namen der Orte
      for (const q of vis) {
        if (q.o.kind === 'village') continue;
        const hot = q.o.id === fromId || q.o.id === toId;
        placeLabel(T(q.o.name), q.x, q.y, hot ? font(800, narrowMap ? 11 : 12) : lf, hot ? cMap() : P.label, [
          [s + 6, 0, 'left'],
          [-s - 6, 0, 'right'],
          [0, -s - 11, 'center'],
          [0, s + 11, 'center'],
        ], q.a, R, P.paper);
      }
      // Natur: See, Bach, Wald, Gipfelhöhen
      const ital = font(600, narrowMap ? 11 : 12).replace(/^/, 'italic ');
      const lake = toPx(v, 10300, 4480);
      placeLabel(tt('See', 'Lake'), lake[0], lake[1], ital, P.waterText, [[0, 0, 'center']], 1, R, P.water);
      const riverPts = [
        { x: 7180, y: 6100 },
        { x: 9600, y: 10250 },
        { x: 6000, y: 2900 },
        { x: 14200, y: 12450 },
      ];
      for (const rp of riverPts) {
        const [x, y] = toPx(v, rp.x, rp.y);
        if (placeLabel('Sonnbach', x, y, ital, P.waterText, [[10, -10, 'left'], [-10, -10, 'right']], 1, R, P.paper)) break;
      }
      const fl = [
        { x: 4400, y: 6700, nm: 'Eichwald' },
        { x: 13700, y: 2700, nm: 'Hochholz' },
      ];
      for (const f of fl) {
        const [x, y] = toPx(v, f.x, f.y);
        placeLabel(f.nm, x, y, ital, P.forestText, [[0, 0, 'center']], 1, R, P.forest);
      }
      const pf = font(650, 11);
      for (const cs of contourSets) {
        const [x, y] = toPx(v, cs.hill.c.x, cs.hill.c.y);
        const top = POIS.some((o) => Math.hypot(o.x - cs.hill.c.x, o.y - cs.hill.c.y) < 60);
        if (top && z < 4.3) continue;
        placeLabel(`▲ ${cs.hill.peak}`, x, y + (top ? 16 : 0), pf, P.contourText, [[0, 0, 'center'], [0, 14, 'center']], 0.95, R, P.paper);
      }
      void th;
    }

    /* ---------------- Kartenrahmen, Maßstabsleiste, Nordpfeil ---------------- */
    function drawMapFurniture(v: View): void {
      const g = surface.g;
      const th = ctx.theme;
      const P = pal();
      const R = v.R;
      const narrowMap = R.w < 420;
      // Kartusche „Maßstab 1 : 25 000“
      const target = N();
      const nDisp = Math.abs(v.n - target) / target < 0.002 ? target : Math.round(v.n / 10) * 10;
      const lab = `${tt('Maßstab', 'Scale')} 1 : ${gi(nDisp)}`;
      const f = font(800, narrowMap ? 12 : 13.5);
      const w = measure(lab, f) + 22;
      const h = narrowMap ? 26 : 30;
      const x0 = R.x + 10;
      const y0 = R.y + 10;
      g.save();
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, x0, y0, w, h, 8);
      g.fillStyle = alpha(th.dark ? shade(P.paper, 0.1) : '#ffffff', 0.94);
      g.fill();
      g.restore();
      roundRect(g, x0, y0, w, h, 8);
      g.strokeStyle = alpha(cScale(), 0.55);
      g.lineWidth = 1.2;
      g.stroke();
      text(g, lab, x0 + 11, y0 + h / 2 + 0.5, { font: f, color: cScale(), align: 'left' });
      placed.push({ x0: x0 - 4, y0: y0 - 4, x1: x0 + w + 4, y1: y0 + h + 4 });

      // Maßstabsleiste: Abschnitte zu je 1 cm auf der Karte
      const segs = R.w < 360 ? 3 : 4;
      const ppc = v.ppc;
      const bx = R.x + 14;
      const byy = R.y + R.h - 20;
      const barW = segs * ppc;
      const unitKm = target >= 50000;
      const boxH = 40;
      g.save();
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, bx - 8, byy - boxH + 12, barW + 46, boxH, 8);
      g.fillStyle = alpha(th.dark ? shade(P.paper, 0.1) : '#ffffff', 0.92);
      g.fill();
      g.restore();
      placed.push({ x0: bx - 12, y0: byy - boxH + 8, x1: bx + barW + 42, y1: byy + 16 });
      const ink = th.text;
      for (let i = 0; i < segs; i++) {
        g.fillStyle = i % 2 === 0 ? ink : th.dark ? shade(P.paper, 0.25) : '#ffffff';
        g.fillRect(bx + i * ppc, byy - 5, ppc, 6);
      }
      g.strokeStyle = ink;
      g.lineWidth = 1;
      g.strokeRect(bx + 0.5, byy - 5 + 0.5, barW - 1, 6);
      const lf = font(700, 10.5);
      const lw = Math.max(...Array.from({ length: segs + 1 }, (_, i) => measure(unitKm ? decimalIn(Math.round((i * nDisp) / 100) * UM.m, 'km', lang, 2).text : gi(Math.round((i * nDisp) / 100)), lf)));
      const lstep = lw + 6 > ppc ? 2 : 1;
      for (let i = 0; i <= segs; i += lstep) {
        const m = (i * nDisp) / 100;
        const s = unitKm ? decimalIn(Math.round(m) * UM.m, 'km', lang, 2).text : gi(Math.round(m));
        text(g, s, bx + i * ppc, byy - 13, { font: lf, color: ink });
      }
      text(g, unitKm ? 'km' : 'm', bx + barW + 9, byy - 2, { font: font(700, 11), color: th.muted, align: 'left' });

      // Nordpfeil
      const nx = R.x + R.w - 22;
      const ny = R.y + 26;
      g.save();
      g.fillStyle = alpha(th.dark ? shade(P.paper, 0.1) : '#ffffff', 0.85);
      g.beginPath();
      g.arc(nx, ny, 15, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = ink;
      g.beginPath();
      g.moveTo(nx, ny - 11);
      g.lineTo(nx + 5, ny + 5);
      g.lineTo(nx, ny + 2);
      g.closePath();
      g.fill();
      g.fillStyle = alpha(ink, 0.35);
      g.beginPath();
      g.moveTo(nx, ny - 11);
      g.lineTo(nx - 5, ny + 5);
      g.lineTo(nx, ny + 2);
      g.closePath();
      g.fill();
      g.restore();
      text(g, 'N', nx, ny + 21, { font: font(800, 10), color: ink });
      placed.push({ x0: nx - 18, y0: ny - 18, x1: nx + 18, y1: ny + 28 });
    }

    /* ---------------- Lineal, Messstrecke, Griffe ---------------- */
    function drawRuler(ax: number, ay: number, bx: number, by: number, ppc: number, a: number, lay: number): void {
      const g = surface.g;
      const th = ctx.theme;
      const len = Math.hypot(bx - ax, by - ay);
      let ang = Math.atan2(by - ay, bx - ax);
      if (len < 0.5) ang = 0;
      const cmLen = len / ppc;
      const total = Math.max(2, Math.ceil(cmLen + 0.05) + 1);
      const rw = clamp(ppc * 0.95, 22, 36);
      const lead = Math.min(10, ppc * 0.3);
      // Lineal liegt auf der „rechten“ Seite der Strecke (bei Blick von A nach B), Zahlen lesbar
      const flip = Math.cos(ang) < -0.01 || (Math.abs(Math.cos(ang)) <= 0.01 && Math.sin(ang) < 0);
      g.save();
      g.globalAlpha *= a;
      g.translate(ax, ay);
      g.rotate(ang);
      // Hineinlegen: leicht gedreht und versetzt
      const off = (1 - lay) * 28;
      g.translate(0, flip ? -off : off);
      g.rotate((1 - lay) * 0.12);
      const side = flip ? -1 : 1;
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      const ry = side > 0 ? 0 : -rw;
      roundRect(g, -lead, ry, total * ppc + lead * 2, rw, 4);
      const grad = g.createLinearGradient(0, ry, 0, ry + rw);
      grad.addColorStop(0, th.dark ? 'rgba(52,60,72,0.86)' : 'rgba(255,255,255,0.86)');
      grad.addColorStop(1, th.dark ? 'rgba(38,44,54,0.86)' : 'rgba(236,240,246,0.86)');
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(th.text, th.dark ? 0.3 : 0.22);
      g.lineWidth = 1;
      g.stroke();
      // Striche: mm, halbe cm, cm
      const ink = th.dark ? '#e8edf3' : '#1f2733';
      const showMm = ppc / 10 >= 2.4;
      for (let i = 0; i <= total * 10; i++) {
        const isCm = i % 10 === 0;
        const isHalf = i % 5 === 0;
        if (!isCm && !isHalf && !showMm) continue;
        const x = (i * ppc) / 10;
        const l = isCm ? rw * 0.42 : isHalf ? rw * 0.3 : rw * 0.18;
        g.strokeStyle = alpha(ink, isCm ? 0.9 : 0.55);
        g.lineWidth = isCm ? 1.2 : 0.8;
        g.beginPath();
        g.moveTo(x, 0);
        g.lineTo(x, side * l);
        g.stroke();
      }
      const every = ppc >= 18 ? 1 : 2;
      const nf = font(700, clamp(ppc * 0.34, 9.5, 12));
      for (let c = 0; c <= total; c += every) {
        const x = c * ppc;
        const yy = side * rw * 0.7;
        g.save();
        g.translate(x, yy);
        if (flip) g.rotate(Math.PI);
        text(g, String(c), 0, 0, { font: nf, color: alpha(ink, 0.9) });
        g.restore();
      }
      // „cm“ am Ende
      g.save();
      g.translate(total * ppc - ppc * 0.5, side * rw * 0.7);
      if (flip) g.rotate(Math.PI);
      text(g, 'cm', 0, 0, { font: font(700, 9.5), color: alpha(ink, 0.6) });
      g.restore();
      g.restore();
    }

    function handleDot(x: number, y: number, id: 'a' | 'b', color: string, a: number): void {
      const g = surface.g;
      const th = ctx.theme;
      const active = hover === `h:${id}` || drag?.kind === id;
      const r = 9;
      g.save();
      g.globalAlpha *= a;
      if (!ctx.locked && active) {
        g.fillStyle = alpha(color, 0.22);
        g.beginPath();
        g.arc(x, y, r + 8, 0, Math.PI * 2);
        g.fill();
      }
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 6;
      g.shadowOffsetY = 1.5;
      g.fillStyle = th.dark ? shade(th.bg, 0.15) : '#ffffff';
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = color;
      g.lineWidth = 3;
      g.stroke();
      text(g, id === 'a' ? 'A' : 'B', x, y + 0.5, { font: font(800, 10), color });
      g.restore();
    }

    function drawMeasure(v: View, m: Measure): void {
      const g = surface.g;
      const th = ctx.theme;
      const col = cMap();
      const [ax, ay] = toPx(v, p.ax, p.ay);
      const [bx, by] = toPx(v, p.bx, p.by);
      const lay = drag ? 1 : ease.outCubic(prog(rulerAt, 650));
      const appear = drag ? 1 : clamp(prog(rulerAt, 300), 0, 1);
      const lineP = drag ? 1 : ease.inOutCubic(prog(rulerAt + 250, 550));
      if (!m.route) {
        drawRuler(ax, ay, bx, by, v.ppc, appear, lay);
        // Messstrecke
        if (lineP > 0) {
          g.save();
          g.strokeStyle = col;
          g.lineWidth = 3;
          g.lineCap = 'round';
          g.shadowColor = alpha(col, 0.35);
          g.shadowBlur = 4;
          g.beginPath();
          g.moveTo(ax, ay);
          g.lineTo(lerp(ax, bx, lineP), lerp(ay, by, lineP));
          g.stroke();
          g.restore();
        }
        const len = Math.hypot(bx - ax, by - ay);
        if (lineP >= 1 && len > 30) {
          // Längenangabe auf der Gegenseite des Lineals
          const ang = Math.atan2(by - ay, bx - ax);
          const flip = Math.cos(ang) < -0.01 || (Math.abs(Math.cos(ang)) <= 0.01 && Math.sin(ang) < 0);
          const nx = -Math.sin(ang) * (flip ? 1 : -1);
          const ny = Math.cos(ang) * (flip ? 1 : -1);
          const lab = cm1(Math.round(mmShown.at(now)));
          let px = (ax + bx) / 2 + nx * 18;
          let py = (ay + by) / 2 + ny * 18;
          px = clamp(px, v.R.x + 40, v.R.x + v.R.w - 40);
          py = clamp(py, v.R.y + 16, v.R.y + v.R.h - 16);
          const r = pill(lab, px, py, col, '#ffffff', 12.5, prog(rulerAt + 650, 300));
          placed.push({ x0: r.x, y0: r.y, x1: r.x + r.w, y1: r.y + r.h });
        }
      } else {
        drawRoute(v, m, col);
      }
      handleDot(ax, ay, 'a', col, appear);
      handleDot(bx, by, 'b', col, appear);
      if (!ctx.locked) {
        // Strecke selbst (zum Verschieben) unter den Griffen
        addHit('line', { x: Math.min(ax, bx) - 4, y: Math.min(ay, by) - 4, w: Math.abs(bx - ax) + 8, h: Math.abs(by - ay) + 8 }, 'move');
        addHit('h:a', { x: ax - 16, y: ay - 16, w: 32, h: 32 }, 'grab');
        addHit('h:b', { x: bx - 16, y: by - 16, w: 32, h: 32 }, 'grab');
      }
      void th;
    }

    function drawRoute(v: View, m: Measure, col: string): void {
      const g = surface.g;
      const th = ctx.theme;
      const pts = m.route!.map((q) => toPx(v, q.x, q.y));
      if (pts.length < 2) return;
      const segLen = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i]![0], q[1] - pts[i]![1]));
      const total = segLen.reduce((s, x) => s + x, 0);
      const u = drag ? 1 : ease.inOutCubic(prog(routeAt + 200, clamp(total * 3, 700, 2200)));
      const goal = u * total;
      // Linienzug bis zum Fortschritt
      g.save();
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.strokeStyle = alpha(col, 0.28);
      g.lineWidth = 9;
      g.beginPath();
      pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      g.stroke();
      g.strokeStyle = col;
      g.lineWidth = 3.4;
      g.beginPath();
      let acc = 0;
      let head: [number, number] = pts[0]!;
      g.moveTo(pts[0]![0], pts[0]![1]);
      for (let i = 1; i < pts.length; i++) {
        const l = segLen[i - 1]!;
        if (acc + l <= goal) {
          g.lineTo(pts[i]![0], pts[i]![1]);
          head = pts[i]!;
        } else {
          const t = (goal - acc) / Math.max(1e-9, l);
          head = [lerp(pts[i - 1]![0], pts[i]![0], t), lerp(pts[i - 1]![1], pts[i]![1], t)];
          g.lineTo(head[0], head[1]);
          break;
        }
        acc += l;
      }
      g.stroke();
      g.restore();
      // Abschnittsgrenzen und -längen
      const pc = m.pieces!;
      const bounds = [...pc.from, pts.length - 1];
      let reached = 0;
      for (let i = 1; i < pts.length; i++) {
        reached += segLen[i - 1]!;
        if (reached > goal + 0.5) break;
        if (bounds.includes(i) && i < pts.length - 1) {
          const [x, y] = pts[i]!;
          g.save();
          g.fillStyle = th.dark ? shade(th.bg, 0.15) : '#ffffff';
          g.strokeStyle = col;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(x, y, 4.5, 0, Math.PI * 2);
          g.fill();
          g.stroke();
          g.restore();
        }
      }
      // Längen der Abschnitte an ihrer Mitte
      let accPx = 0;
      const cumul = [0];
      for (const l of segLen) cumul.push((accPx += l));
      pc.mm.forEach((mm, k) => {
        const i0 = pc.from[k]!;
        const i1 = k + 1 < pc.from.length ? pc.from[k + 1]! : pts.length - 1;
        if (cumul[i1]! > goal + 0.5) return;
        const mid = (cumul[i0]! + cumul[i1]!) / 2;
        let j = i0;
        while (j < i1 - 1 && cumul[j + 1]! < mid) j++;
        const t = (mid - cumul[j]!) / Math.max(1e-9, segLen[j]!);
        const x = lerp(pts[j]![0], pts[j + 1]![0], t);
        const y = lerp(pts[j]![1], pts[j + 1]![1], t);
        if (cumul[i1]! - cumul[i0]! < 34) return;
        const lab = cm1(mm);
        const f = font(800, 11);
        const w = measure(lab, f) + 10;
        const b = { x0: x - w / 2, y0: y - 9, x1: x + w / 2, y1: y + 9 };
        if (!freeBox(b)) return;
        placed.push(b);
        g.save();
        roundRect(g, b.x0, b.y0, w, 18, 9);
        g.fillStyle = alpha(th.dark ? shade(th.bg, 0.12) : '#ffffff', 0.94);
        g.fill();
        g.strokeStyle = alpha(col, 0.7);
        g.lineWidth = 1.2;
        g.stroke();
        g.restore();
        text(g, lab, x, y + 0.5, { font: f, color: col });
      });
      // laufender Punkt
      if (u < 1) {
        g.save();
        g.shadowColor = alpha(col, 0.7);
        g.shadowBlur = 10;
        g.fillStyle = col;
        g.beginPath();
        g.arc(head[0], head[1], 6, 0, Math.PI * 2);
        g.fill();
        g.restore();
      }
    }

    function drawMapScene(gm: Geo): void {
      const g = surface.g;
      const th = ctx.theme;
      const C = gm.C;
      card(C);
      const R = mapRect(gm);
      const v = viewNow(R);
      const m = meas();
      g.save();
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.clip();
      g.globalAlpha = sceneA();
      placed = [];
      drawLandscape(v);
      const fromPoi = poiAt(A());
      const toPoi = poiAt(B());
      {
        const [ax, ay] = toPx(v, p.ax, p.ay);
        const [bx, by] = toPx(v, p.bx, p.by);
        placed.push({ x0: ax - 11, y0: ay - 11, x1: ax + 11, y1: ay + 11 }, { x0: bx - 11, y0: by - 11, x1: bx + 11, y1: by + 11 });
      }
      drawPoisAndLabels(v, fromPoi?.id ?? null, toPoi?.id ?? null, 'sym');
      drawMapFurniture(v);
      drawMeasure(v, m);
      drawPoisAndLabels(v, fromPoi?.id ?? null, toPoi?.id ?? null, 'lab');
      // Hinweis (z. B. Strecke gekürzt, Ort antippen)
      if (note) {
        const age = now - note.at;
        const a = clamp(age / 200, 0, 1) * clamp((3200 - age) / 400, 0, 1);
        if (a > 0) {
          const f = font(700, R.w < 420 ? 11.5 : 12.5);
          const rows = wrap(note.text, R.w - 80, f);
          const w = Math.max(...rows.map((r) => measure(r, f))) + 24;
          const h = rows.length * 17 + 12;
          const x = R.x + R.w / 2 - w / 2;
          const y = R.y + (R.w < 420 ? 44 : 50);
          g.save();
          g.globalAlpha *= a;
          g.shadowColor = th.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
          g.shadowBlur = 10;
          roundRect(g, x, y, w, h, 10);
          g.fillStyle = th.dark ? shade(th.bg, 0.14) : '#ffffff';
          g.fill();
          g.shadowColor = 'transparent';
          g.strokeStyle = alpha(cAsk(), 0.6);
          g.lineWidth = 1.2;
          g.stroke();
          rows.forEach((r, i) => text(g, r, R.x + R.w / 2, y + 6 + 8.5 + i * 17, { font: f, color: th.text }));
          g.restore();
        } else note = null;
      }
      g.restore();
      // innerer Kartenrand
      g.save();
      roundRect(g, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 10);
      g.strokeStyle = alpha(th.text, th.dark ? 0.3 : 0.22);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
    }

    /* ================================================================== */
    /* Karten (rechte Spalte bzw. unten)                                   */
    /* ================================================================== */

    interface Seg {
      t: string;
      c?: string;
      w?: number;
    }
    type Item =
      | { kind: 'title'; text: string; color?: string }
      | { kind: 'rich'; segs: Seg[]; size: number; a?: number; dy?: number }
      | { kind: 'big'; segs: Seg[]; size: number; a?: number; pop?: number }
      | { kind: 'note'; text: string; color?: string; a?: number }
      | { kind: 'chips'; chips: { id: string; label: string; active: boolean }[] }
      | { kind: 'gap'; h: number };
    interface CardSpec {
      items: Item[];
      accent?: string;
      tint?: number;
      /** Wird auf schmalen Bühnen als erstes weggelassen. */
      optional?: boolean;
    }
    const S = (t: string, c?: string, w?: number): Seg => ({ t, c, w });
    const small = () => !!geo && !geo.wide;
    const noteSize = () => (small() ? 11.5 : 12.5);

    function segWidth(segs: Seg[], size: number, weight: number): number {
      return segs.reduce((s, x) => s + measure(x.t, font(x.w ?? weight, size)), 0);
    }
    function drawSegs(segs: Seg[], x: number, y: number, size: number, weight: number, maxW: number): void {
      let s = size;
      const w0 = segWidth(segs, s, weight);
      if (w0 > maxW) s = Math.max(10.5, (s * maxW) / w0);
      let cx = x;
      for (const sg of segs) {
        const f = font(sg.w ?? weight, s);
        text(surface.g, sg.t, cx, y, { font: f, color: sg.c ?? ctx.theme.text, align: 'left' });
        cx += measure(sg.t, f);
      }
    }
    function itemHeight(it: Item, w: number): number {
      switch (it.kind) {
        case 'title':
          return 20;
        case 'rich':
          return it.size * 1.5;
        case 'big':
          return it.size * 1.45;
        case 'note':
          return wrap(it.text, w, font(600, noteSize())).length * noteSize() * 1.38 + 4;
        case 'chips':
          return chipRows(it.chips, w).length * 30 + 4;
        case 'gap':
          return it.h;
      }
    }
    function chipRows(chips: { id: string; label: string; active: boolean }[], w: number): { id: string; label: string; active: boolean; x: number; w: number }[][] {
      const f = font(750, 12);
      const rows: { id: string; label: string; active: boolean; x: number; w: number }[][] = [[]];
      let x = 0;
      for (const c of chips) {
        const cw = measure(c.label, f) + 18;
        if (x + cw > w && rows[rows.length - 1]!.length) {
          rows.push([]);
          x = 0;
        }
        rows[rows.length - 1]!.push({ ...c, x, w: cw });
        x += cw + 6;
      }
      return rows;
    }
    function drawItem(it: Item, x: number, y: number, w: number): number {
      const g = surface.g;
      const th = ctx.theme;
      const h = itemHeight(it, w);
      switch (it.kind) {
        case 'title':
          text(g, it.text, x, y + 9, { font: font(750, small() ? 11 : 12), color: it.color ?? th.muted, align: 'left' });
          break;
        case 'rich': {
          const a = it.a ?? 1;
          if (a <= 0.01) break;
          g.save();
          g.globalAlpha *= a;
          drawSegs(it.segs, x, y + h / 2 + (it.dy ?? 0), it.size, 650, w);
          g.restore();
          break;
        }
        case 'big': {
          const a = it.a ?? 1;
          if (a <= 0.01) break;
          g.save();
          g.globalAlpha *= a;
          const k = it.pop ?? 1;
          g.translate(x, y + h / 2);
          g.scale(k, k);
          drawSegs(it.segs, 0, 0, it.size, 800, w / k);
          g.restore();
          break;
        }
        case 'note': {
          const f = font(600, noteSize());
          g.save();
          g.globalAlpha *= it.a ?? 1;
          wrap(it.text, w, f).forEach((row, i) => text(g, row, x, y + noteSize() * 0.75 + i * noteSize() * 1.38, { font: f, color: it.color ?? th.muted, align: 'left' }));
          g.restore();
          break;
        }
        case 'chips': {
          const f = font(750, 12);
          chipRows(it.chips, w).forEach((row, ri) => {
            for (const c of row) {
              const cy = y + ri * 30 + 2;
              const hot = hover === c.id;
              roundRect(g, x + c.x, cy, c.w, 25, 12.5);
              g.fillStyle = c.active ? alpha(cScale(), th.dark ? 0.35 : 0.16) : hot ? alpha(th.text, 0.08) : alpha(th.text, th.dark ? 0.05 : 0.035);
              g.fill();
              g.strokeStyle = c.active ? cScale() : alpha(th.text, hot ? 0.35 : 0.15);
              g.lineWidth = c.active ? 1.6 : 1;
              g.stroke();
              text(g, c.label, x + c.x + c.w / 2, cy + 13, { font: f, color: c.active ? cScale() : th.text });
              if (!ctx.locked && !c.active) addHit(c.id, { x: x + c.x, y: cy, w: c.w, h: 25 });
            }
          });
          break;
        }
        case 'gap':
          break;
      }
      return h;
    }
    const cardPad = () => (small() ? 10 : 14);
    function cardHeight(c: CardSpec, inner: number): number {
      return c.items.reduce((s, it) => s + itemHeight(it, inner), 0) + cardPad() + 8;
    }
    /** Karten untereinander (breit) bzw. nebeneinander (schmal). */
    function drawCards(R: Rect, cards: CardSpec[], columns: boolean): void {
      const pad = cardPad();
      const gap = small() ? 8 : 10;
      if (columns) {
        const list = cards.filter((c) => !c.optional);
        const n = list.length;
        const cw = (R.w - gap * (n - 1)) / n;
        list.forEach((c, i) => {
          const r = { x: R.x + i * (cw + gap), y: R.y, w: cw, h: R.h };
          card(r, c.accent, c.tint ?? 0);
          let yy = r.y + pad - 2;
          for (const it of c.items) {
            if (yy + itemHeight(it, cw - 2 * pad) > r.y + r.h - 4) break;
            yy += drawItem(it, r.x + pad, yy, cw - 2 * pad);
          }
        });
        return;
      }
      const inner = R.w - 2 * pad;
      const heights = cards.map((c) => cardHeight(c, inner));
      let n = cards.length;
      while (n > 1 && heights.slice(0, n).reduce((s, h) => s + h, 0) + gap * (n - 1) > R.h) n--;
      const used = heights.slice(0, n).reduce((s, h) => s + h, 0) + gap * (n - 1);
      const extra = Math.max(0, R.h - used);
      let y = R.y;
      for (let i = 0; i < n; i++) {
        const c = cards[i]!;
        let h = heights[i]!;
        if (i === n - 1) h += extra;
        card({ x: R.x, y, w: R.w, h }, c.accent, c.tint ?? 0);
        let yy = y + pad - 2;
        for (const it of c.items) {
          if (yy + itemHeight(it, inner) > y + h + 2) break;
          yy += drawItem(it, R.x + pad, yy, inner);
        }
        y += h + gap;
      }
    }

    /** Schritte einer Rechnung, die nacheinander einblenden. */
    function stepItems(rows: Seg[][], bigRow: Seg[] | null, t0: number, sz: number, bigSz: number): Item[] {
      const out: Item[] = [];
      const st = 380;
      rows.forEach((segs, i) => {
        const u = drag ? 1 : prog(t0 + i * st, 360);
        out.push({ kind: 'rich', segs, size: sz, a: u, dy: (1 - ease.outCubic(u)) * 6 });
      });
      if (bigRow) {
        const u = drag ? 1 : prog(t0 + rows.length * st, 420);
        out.push({ kind: 'big', segs: bigRow, size: bigSz, a: clamp(u * 1.6, 0, 1), pop: 0.85 + 0.15 * ease.outBack(u) });
      }
      return out;
    }
    const chainBusy = (t0: number, n: number) => !reduced && now < t0 + n * 380 + 500;

    function mapCards(): CardSpec[] {
      const th = ctx.theme;
      const m = meas();
      const n = N();
      const sm = small();
      const mm = Math.round(mmShown.at(now));
      const cards: CardSpec[] = [];
      // 1) Messung auf der Karte
      const head = p.r ? tt('Wegstrecke auf der Karte', 'Route on the map') : tt('Luftlinie auf der Karte', 'Straight line on the map');
      const items1: Item[] = [{ kind: 'title', text: head }];
      if (m.fromName || m.toName) items1.push({ kind: 'rich', segs: [S(`${m.fromName ?? 'A'} → ${m.toName ?? 'B'}`, th.text, 700)], size: sm ? 12 : 13 });
      items1.push({ kind: 'big', segs: [S(cm1(mm), cMap())], size: sm ? 22 : 28 });
      if (m.pieces && m.pieces.mm.length > 1) {
        const parts = m.pieces.mm.map((x) => decimalIn(x * UM.mm, 'cm', lang).text);
        const shown = parts.length > 6 ? [...parts.slice(0, 5), '…'] : parts;
        items1.push({ kind: 'note', text: `${shown.join(' + ')} = ${cm1(m.mm)} (${m.pieces.mm.length} ${tt('Abschnitte', 'pieces')})`, color: th.text });
      } else if (!sm && (geo?.panel.h ?? 0) > 560) items1.push({ kind: 'note', text: m.mm === 0 ? tt('Beide Griffe liegen aufeinander – die Strecke ist 0 cm lang.', 'Both handles are on top of each other – the line is 0 cm long.') : tt('Mit dem Lineal gemessen, auf 1 mm gerundet.', 'Measured with the ruler, rounded to 1 mm.') });
      cards.push({ items: items1 });
      // 2) Umrechnung
      const items2: Item[] = [{ kind: 'title', text: tt('In Wirklichkeit', 'In reality') }];
      const mapCm = decimalIn(m.mm * UM.mm, 'cm', lang).text;
      const first: Seg[] = [S(`${mapCm} cm`, cMap(), 800), S(' · ', th.muted), S(gi(n), cScale(), 800)];
      if (!revealed) {
        items2.push({ kind: 'rich', segs: [...first, S(' = ', th.muted), S('?', cAsk(), 800)], size: sm ? 14 : 16 });
        items2.push({ kind: 'note', text: tt('Rechne selbst – dann „Ergebnis anzeigen“ antippen.', 'Work it out – then tap “Show result”.') });
      } else if (m.mm === 0) {
        items2.push({ kind: 'big', segs: [S('0 m', cReal())], size: sm ? 20 : 26 });
      } else {
        const chain = unitChain(m.realUm, 'cm');
        const rows: Seg[][] = [first, ...chain.slice(0, -1).map((c) => [S('= ', th.muted), S(c.text(lang), th.text, 700)])];
        const last = chain[chain.length - 1]!;
        if (sm) {
          // schmal: kürzer
          items2.push(...stepItems([first, ...(chain.length > 1 ? [[S('= ', th.muted), S(chain[0]!.text(lang), th.text, 700)]] : [])], [S('= ', th.muted), S(last.text(lang), cReal())], chainAt, 13, 19));
        } else items2.push(...stepItems(rows, [S('= ', th.muted), S(last.text(lang), cReal())], chainAt, 15, 26));
      }
      cards.push({ items: items2, accent: cReal(), tint: revealed ? 0.04 : 0 });
      // 3) Maßstab
      const oneCm = lt((UM.cm * n) as number);
      const items3: Item[] = [
        { kind: 'title', text: `${tt('Maßstab', 'Scale')} 1 : ${gi(n)}` },
        { kind: 'note', text: tt(`1 cm auf der Karte ≙ ${gi(n)} cm = ${oneCm} in Wirklichkeit.`, `1 cm on the map ≙ ${gi(n)} cm = ${oneCm} in reality.`), color: th.text },
        { kind: 'chips', chips: MAP_SCALES.map((x) => ({ id: `sc:${x}`, label: `1 : ${gi(x)}`, active: x === n })) },
        { kind: 'note', text: T(SCALE_HINT[n] ?? SCALE_HINT[25000]!) },
      ];
      cards.push({ items: items3, optional: true, accent: cScale(), tint: 0.03 });
      return cards;
    }

    /* ================================================================== */
    /* Vergrößern                                                          */
    /* ================================================================== */

    const zLog = new Glide(Math.log(Number(p.z) || 10));
    const ppcZ = new Glide(0);
    let objAt = now;
    let zChainAt = now + 400;

    function drawObject(id: ObjId, cx: number, cy: number, Lp: number, a: number): void {
      const g = surface.g;
      const th = ctx.theme;
      const dk = th.dark;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.translate(cx, cy);
      const s = Lp;
      if (s < 3) {
        // winzig: nur ein Punkt in passender Größe
        g.fillStyle = id === 'bug' ? '#c62f1f' : id === 'ant' ? (dk ? '#c78b5a' : '#3b2416') : id === 'stamp' ? (dk ? '#8fb3d9' : '#3d6fa8') : dk ? '#d9b97a' : '#b48a4a';
        g.beginPath();
        g.arc(0, 0, Math.max(0.8, s / 2), 0, Math.PI * 2);
        g.fill();
        g.restore();
        return;
      }
      g.shadowColor = dk ? 'rgba(0,0,0,0.5)' : 'rgba(40,30,20,0.25)';
      g.shadowBlur = Math.min(14, s * 0.06);
      g.shadowOffsetY = Math.min(5, s * 0.02);
      if (id === 'bug') {
        // Beine und Fühler
        g.shadowColor = 'transparent';
        g.strokeStyle = '#1a1414';
        g.lineCap = 'round';
        g.lineWidth = Math.max(1, s * 0.022);
        for (const side of [-1, 1])
          for (let i = 0; i < 3; i++) {
            const bx = s * (0.12 - i * 0.16);
            g.beginPath();
            g.moveTo(bx, side * s * 0.2);
            g.lineTo(bx + s * (0.04 - i * 0.03), side * s * 0.38);
            g.lineTo(bx + s * (0.02 - i * 0.07), side * s * 0.43);
            g.stroke();
          }
        for (const side of [-1, 1]) {
          g.beginPath();
          g.moveTo(s * 0.44, side * s * 0.06);
          g.quadraticCurveTo(s * 0.52, side * s * 0.1, s * 0.55, side * s * 0.16);
          g.stroke();
        }
        g.shadowColor = dk ? 'rgba(0,0,0,0.5)' : 'rgba(40,30,20,0.28)';
        // Flügeldecken
        const el = g.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, -s * 0.05, 0, s * 0.45);
        el.addColorStop(0, '#ff6b4a');
        el.addColorStop(0.55, '#d8321f');
        el.addColorStop(1, '#8e1a0e');
        g.fillStyle = el;
        g.beginPath();
        g.ellipse(-s * 0.08, 0, s * 0.42, s * 0.36, 0, 0, Math.PI * 2);
        g.fill();
        g.shadowColor = 'transparent';
        // Halsschild und Kopf
        g.fillStyle = '#16120f';
        g.beginPath();
        g.ellipse(s * 0.32, 0, s * 0.11, s * 0.2, 0, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.ellipse(s * 0.43, 0, s * 0.07, s * 0.1, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#f4efe6';
        for (const side of [-1, 1]) {
          g.beginPath();
          g.ellipse(s * 0.3, side * s * 0.12, s * 0.04, s * 0.05, 0, 0, Math.PI * 2);
          g.fill();
        }
        // Naht und Punkte
        g.strokeStyle = 'rgba(30,10,5,0.75)';
        g.lineWidth = Math.max(1, s * 0.012);
        g.beginPath();
        g.moveTo(s * 0.24, 0);
        g.lineTo(-s * 0.5, 0);
        g.stroke();
        g.fillStyle = '#16120f';
        const spots: [number, number, number][] = [
          [0.12, 0, 0.07],
          [-0.05, -0.2, 0.065],
          [-0.05, 0.2, 0.065],
          [-0.27, -0.13, 0.06],
          [-0.27, 0.13, 0.06],
          [0.12, -0.2, 0.045],
          [0.12, 0.2, 0.045],
        ];
        for (const [x, y, r] of spots) {
          g.beginPath();
          g.arc(x * s, y * s, r * s, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = 'rgba(255,255,255,0.35)';
        g.beginPath();
        g.ellipse(-s * 0.15, -s * 0.18, s * 0.12, s * 0.05, -0.4, 0, Math.PI * 2);
        g.fill();
      } else if (id === 'ant') {
        const body = dk ? '#b07a4c' : '#3b2416';
        const shine = dk ? '#e9c39b' : '#80553a';
        g.shadowColor = 'transparent';
        g.strokeStyle = body;
        g.lineCap = 'round';
        g.lineJoin = 'round';
        g.lineWidth = Math.max(1, s * 0.022);
        for (const side of [-1, 1])
          for (let i = 0; i < 3; i++) {
            const bx = s * (0.06 - i * 0.07);
            g.beginPath();
            g.moveTo(bx, 0);
            g.lineTo(bx + (1 - i) * s * 0.1, side * s * 0.16);
            g.lineTo(bx + (1 - i) * s * 0.24 - i * s * 0.05, side * s * 0.32);
            g.stroke();
          }
        for (const side of [-1, 1]) {
          g.beginPath();
          g.moveTo(s * 0.4, side * s * 0.03);
          g.lineTo(s * 0.5, side * s * 0.1);
          g.lineTo(s * 0.62, side * s * 0.07);
          g.stroke();
        }
        g.shadowColor = dk ? 'rgba(0,0,0,0.5)' : 'rgba(40,30,20,0.25)';
        const blob = (cx0: number, rx: number, ry: number) => {
          const gr = g.createRadialGradient(cx0 - rx * 0.3, -ry * 0.35, rx * 0.1, cx0, 0, rx * 1.1);
          gr.addColorStop(0, shine);
          gr.addColorStop(1, body);
          g.fillStyle = gr;
          g.beginPath();
          g.ellipse(cx0, 0, rx, ry, 0, 0, Math.PI * 2);
          g.fill();
        };
        blob(-s * 0.3, s * 0.2, s * 0.14);
        blob(-s * 0.08, s * 0.045, s * 0.035);
        blob(s * 0.05, s * 0.13, s * 0.065);
        blob(s * 0.35, s * 0.12, s * 0.1);
        // Kiefer bis zur Messlinie
        g.fillStyle = body;
        g.beginPath();
        g.moveTo(s * 0.44, -s * 0.04);
        g.lineTo(s * 0.5, 0);
        g.lineTo(s * 0.44, s * 0.04);
        g.closePath();
        g.fill();
      } else if (id === 'stamp') {
        const w = s;
        const h = s * 1.2;
        // gezackter Rand
        const r = w / 30;
        g.fillStyle = dk ? '#e6e2d8' : '#fbf9f3';
        g.beginPath();
        g.rect(-w / 2, -h / 2, w, h);
        g.fill();
        g.shadowColor = 'transparent';
        g.globalCompositeOperation = 'destination-out';
        const holes = (x0: number, y0: number, x1: number, y1: number, cnt: number) => {
          for (let i = 0; i <= cnt; i++) {
            g.beginPath();
            g.arc(lerp(x0, x1, i / cnt), lerp(y0, y1, i / cnt), r, 0, Math.PI * 2);
            g.fill();
          }
        };
        holes(-w / 2, -h / 2, w / 2, -h / 2, 15);
        holes(-w / 2, h / 2, w / 2, h / 2, 15);
        holes(-w / 2, -h / 2, -w / 2, h / 2, 18);
        holes(w / 2, -h / 2, w / 2, h / 2, 18);
        g.globalCompositeOperation = 'source-over';
        // Bild auf der Marke: Himmel, Sonne, Berge, Wiese (ohne Schrift)
        const ix = -w / 2 + w * 0.1;
        const iy = -h / 2 + w * 0.1;
        const iw = w * 0.8;
        const ih = h - w * 0.2;
        const sky = g.createLinearGradient(0, iy, 0, iy + ih);
        sky.addColorStop(0, dk ? '#4f78a8' : '#7fb2e5');
        sky.addColorStop(1, dk ? '#a9c3db' : '#e3f0fb');
        g.fillStyle = sky;
        g.fillRect(ix, iy, iw, ih);
        g.fillStyle = dk ? '#e8c45a' : '#ffd24d';
        g.beginPath();
        g.arc(ix + iw * 0.72, iy + ih * 0.25, iw * 0.11, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = dk ? '#5e6f86' : '#7d8fa8';
        g.beginPath();
        g.moveTo(ix, iy + ih * 0.7);
        g.lineTo(ix + iw * 0.32, iy + ih * 0.36);
        g.lineTo(ix + iw * 0.55, iy + ih * 0.6);
        g.lineTo(ix + iw * 0.75, iy + ih * 0.44);
        g.lineTo(ix + iw, iy + ih * 0.66);
        g.lineTo(ix + iw, iy + ih);
        g.lineTo(ix, iy + ih);
        g.closePath();
        g.fill();
        g.fillStyle = '#ffffff';
        g.beginPath();
        g.moveTo(ix + iw * 0.25, iy + ih * 0.43);
        g.lineTo(ix + iw * 0.32, iy + ih * 0.36);
        g.lineTo(ix + iw * 0.39, iy + ih * 0.43);
        g.closePath();
        g.fill();
        g.fillStyle = dk ? '#4f8a4a' : '#6db35d';
        g.beginPath();
        g.moveTo(ix, iy + ih * 0.8);
        g.quadraticCurveTo(ix + iw * 0.5, iy + ih * 0.68, ix + iw, iy + ih * 0.78);
        g.lineTo(ix + iw, iy + ih);
        g.lineTo(ix, iy + ih);
        g.closePath();
        g.fill();
        g.strokeStyle = dk ? '#8a3a32' : '#b8453a';
        g.lineWidth = Math.max(1, w * 0.012);
        g.strokeRect(ix, iy, iw, ih);
      } else {
        // Sandkorn: unregelmäßige, gerundete Form
        const pts: [number, number][] = [];
        for (let i = 0; i < 14; i++) {
          const an = (i / 14) * Math.PI * 2;
          const rr = s * 0.5 * (0.82 + 0.18 * Math.sin(an * 3 + 1) * Math.cos(an * 2));
          pts.push([Math.cos(an) * rr * (i === 0 || i === 7 ? 1.22 : 1), Math.sin(an) * rr * 0.78]);
        }
        const gr = g.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.05, 0, 0, s * 0.6);
        gr.addColorStop(0, dk ? '#f0dcb0' : '#f6e3b8');
        gr.addColorStop(0.6, dk ? '#c9a46a' : '#d9b278');
        gr.addColorStop(1, dk ? '#8a6a3a' : '#a07840');
        g.fillStyle = gr;
        g.beginPath();
        pts.forEach(([x, y], i) => {
          const nx2 = pts[(i + 1) % pts.length]!;
          const mx = (x + nx2[0]) / 2;
          const my = (y + nx2[1]) / 2;
          if (i === 0) g.moveTo(mx, my);
          else g.quadraticCurveTo(x, y, mx, my);
        });
        const p0 = pts[0]!;
        const p1 = pts[1]!;
        g.quadraticCurveTo(p0[0], p0[1], (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
        g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = 'rgba(90,60,20,0.35)';
        for (let i = 0; i < 12; i++) {
          const an = i * 2.4;
          const rr = s * 0.3 * ((i * 37) % 10) * 0.1;
          g.beginPath();
          g.arc(Math.cos(an) * rr, Math.sin(an) * rr * 0.7, s * 0.015 + (i % 3) * s * 0.006, 0, Math.PI * 2);
          g.fill();
        }
        g.fillStyle = 'rgba(255,255,255,0.45)';
        g.beginPath();
        g.ellipse(-s * 0.14, -s * 0.16, s * 0.12, s * 0.06, -0.5, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }

    /** Waagerechtes Lineal (Bildlänge), Nullpunkt bei x0. */
    function hRuler(x0: number, y: number, cmCount: number, ppc: number, a: number, unitLabel = 'cm'): void {
      const g = surface.g;
      const th = ctx.theme;
      const rw = clamp(ppc * 0.9, 22, 34);
      const lead = 10;
      g.save();
      g.globalAlpha *= a;
      g.shadowColor = th.dark ? 'rgba(0,0,0,0.55)' : 'rgba(60,45,10,0.2)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      roundRect(g, x0 - lead, y, cmCount * ppc + 2 * lead, rw, 4);
      const grad = g.createLinearGradient(0, y, 0, y + rw);
      grad.addColorStop(0, th.dark ? '#7a6a3a' : '#fbefc4');
      grad.addColorStop(1, th.dark ? '#5a4c26' : '#efd486');
      g.fillStyle = grad;
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = th.dark ? 'rgba(255,240,200,0.25)' : 'rgba(120,90,20,0.35)';
      g.lineWidth = 1;
      g.stroke();
      const ink = th.dark ? '#f3e9c8' : '#3d3222';
      const showMm = ppc / 10 >= 2.4;
      const showHalf = ppc / 2 >= 3;
      for (let i = 0; i <= cmCount * 10; i++) {
        const isCm = i % 10 === 0;
        const isHalf = i % 5 === 0;
        if (!isCm && !(isHalf && showHalf) && !showMm) continue;
        const x = Math.round(x0 + (i * ppc) / 10) + 0.5;
        const l = isCm ? rw * 0.42 : isHalf ? rw * 0.3 : rw * 0.18;
        g.strokeStyle = alpha(ink, isCm ? 0.9 : 0.55);
        g.lineWidth = isCm ? 1.2 : 0.8;
        g.beginPath();
        g.moveTo(x, y + 1);
        g.lineTo(x, y + 1 + l);
        g.stroke();
      }
      const nf = font(700, clamp(ppc * 0.32, 9.5, 12));
      let every = 1;
      for (const e of [1, 2, 5, 10, 20]) {
        every = e;
        if (ppc * e >= 18) break;
      }
      for (let c = 0; c <= cmCount; c += every) text(g, String(c), x0 + c * ppc, y + rw * 0.72, { font: nf, color: alpha(ink, 0.9) });
      text(g, unitLabel, x0 + cmCount * ppc + lead - 2, y + rw * 0.72, { font: font(700, 9.5), color: alpha(ink, 0.65), align: 'right' });
      g.restore();
    }

    /** Maßpfeil zwischen x0 und x1 mit Beschriftung. */
    function dimArrow(x0: number, x1: number, y: number, lab: string, col: string, a: number, size = 13): void {
      const g = surface.g;
      if (a <= 0.01) return;
      g.save();
      g.globalAlpha *= a;
      g.strokeStyle = col;
      g.fillStyle = col;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(x0, y);
      g.lineTo(x1, y);
      g.stroke();
      const head = Math.min(7, Math.abs(x1 - x0) / 3);
      for (const [x, d] of [
        [x0, 1],
        [x1, -1],
      ] as const) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + d * head, y - head * 0.55);
        g.lineTo(x + d * head, y + head * 0.55);
        g.closePath();
        g.fill();
        g.beginPath();
        g.moveTo(x, y - 7);
        g.lineTo(x, y + 7);
        g.stroke();
      }
      g.restore();
      pill(lab, (x0 + x1) / 2, y - size - 4, col, '#ffffff', size, a);
    }

    interface ZoomLayout {
      inset: Rect;
      main: Rect;
      ppc: number;
    }
    function zoomLayout(gm: Geo, z: number): ZoomLayout {
      const C = gm.C;
      const narrowC = C.w < 500;
      const pad = narrowC ? 8 : 12;
      const iw = narrowC ? Math.round(C.w * 0.46) : Math.round(clamp(C.w * 0.32, 160, 240));
      const ih = narrowC ? Math.round(clamp(C.h * 0.36, 100, 140)) : Math.round(clamp(C.h * 0.4, 130, 200));
      const inset: Rect = { x: C.x + pad, y: C.y + pad + 26, w: iw, h: ih };
      const main: Rect = narrowC ? { x: C.x + pad, y: inset.y + ih + 8, w: C.w - 2 * pad, h: C.y + C.h - pad - (inset.y + ih + 8) } : { x: inset.x + iw + 16, y: C.y + pad + 26, w: C.x + C.w - pad - (inset.x + iw + 16), h: C.h - 2 * pad - 26 };
      const o = OBJECTS[p.o as ObjId] ?? OBJECTS.bug;
      const base = clamp(Math.min(main.w / 13, main.h / 7.5), 20, 44);
      const imgCm = (o.lengthUm * z) / UM.cm;
      const hk = p.o === 'stamp' ? 1.2 : p.o === 'sand' ? 0.8 : 0.9;
      const fit = Math.min((main.w * 0.78) / imgCm, (main.h - 90) / (imgCm * hk));
      return { inset, main, ppc: Math.min(base, fit) };
    }

    function drawZoomScene(gm: Geo): void {
      const g = surface.g;
      const th = ctx.theme;
      const C = gm.C;
      card(C);
      g.save();
      g.globalAlpha = sceneA();
      const id = (p.o as ObjId) in OBJECTS ? (p.o as ObjId) : 'bug';
      const o = OBJECTS[id];
      const z = Number(p.z) || 10;
      const zd = Math.exp(zLog.at(now));
      const lay = zoomLayout(gm, z);
      if (!ppcZ.busy(now) && Math.abs(ppcZ.target - lay.ppc) > 0.01) {
        if (ppcZ.target === 0) ppcZ.snap(lay.ppc);
        else ppcZ.go(lay.ppc, 800);
      }
      const ppc = ppcZ.at(now) || lay.ppc;
      const objA = prog(objAt, 450);
      const narrowC = C.w < 500;
      text(g, `${T(OBJ_TEXT[id].name)} · ${tt('Vergrößerung', 'enlargement')} ${z} : 1`, C.x + 14, C.y + 20, { font: font(750, narrowC ? 11.5 : 12.5), color: th.muted, align: 'left' });

      // Wirklichkeit (1 : 1)
      const I = lay.inset;
      g.save();
      roundRect(g, I.x, I.y, I.w, I.h, 10);
      const paperC = th.dark ? shade(th.bg, 0.12) : '#fffdf6';
      g.fillStyle = paperC;
      g.fill();
      g.clip();
      // Millimeterpapier
      const mmPx = ppc / 10;
      if (mmPx >= 2.2) {
        g.strokeStyle = alpha(th.series[3]!, th.dark ? 0.14 : 0.12);
        g.lineWidth = 0.6;
        g.beginPath();
        for (let x = I.x; x < I.x + I.w; x += mmPx) {
          g.moveTo(Math.round(x) + 0.5, I.y);
          g.lineTo(Math.round(x) + 0.5, I.y + I.h);
        }
        for (let y = I.y; y < I.y + I.h; y += mmPx) {
          g.moveTo(I.x, Math.round(y) + 0.5);
          g.lineTo(I.x + I.w, Math.round(y) + 0.5);
        }
        g.stroke();
      }
      g.strokeStyle = alpha(th.series[3]!, th.dark ? 0.3 : 0.28);
      g.lineWidth = 0.9;
      g.beginPath();
      for (let x = I.x; ppc >= 8 && x < I.x + I.w; x += ppc) {
        g.moveTo(Math.round(x) + 0.5, I.y);
        g.lineTo(Math.round(x) + 0.5, I.y + I.h);
      }
      for (let y = I.y; ppc >= 8 && y < I.y + I.h; y += ppc) {
        g.moveTo(I.x, Math.round(y) + 0.5);
        g.lineTo(I.x + I.w, Math.round(y) + 0.5);
      }
      g.stroke();
      const realPx = (o.lengthUm / UM.cm) * ppc;
      const ox = I.x + I.w * 0.5;
      const oy = I.y + I.h * 0.42;
      drawObject(id, ox, oy, realPx, objA);
      // kleines Lineal unten
      const rc = Math.max(1, Math.ceil((o.lengthUm / UM.cm) * 1.2));
      const rcm = Math.min(rc, Math.floor((I.w - 30) / ppc));
      hRuler(ox - realPx / 2, I.y + I.h - clamp(ppc * 0.9, 22, 34) - 6, Math.max(1, rcm), ppc, 1);
      g.restore();
      roundRect(g, I.x, I.y, I.w, I.h, 10);
      g.strokeStyle = alpha(th.text, th.dark ? 0.3 : 0.2);
      g.lineWidth = 1;
      g.stroke();
      halo(tt('In Wirklichkeit (1 : 1)', 'Real size (1 : 1)'), I.x + 8, I.y + 13, font(750, 11.5), th.muted, 'left', 1, paperC);
      halo(`${OBJ_TEXT[id].approx ? '≈ ' : ''}${lt(o.lengthUm)}`, I.x + 8, I.y + 30, font(800, 13), cReal(), 'left', 1, paperC);

      // Lupe über dem Objekt und Blickkegel zum Bild
      const M = lay.main;
      const lr = clamp(Math.max(realPx * 0.9, 18), 18, Math.min(I.w, I.h) * 0.3);
      const imgPx = (o.lengthUm * zd * ppc) / UM.cm;
      const icx = M.x + M.w / 2;
      const icy = M.y + (M.h - 70) * 0.45 + 6;
      g.save();
      g.strokeStyle = alpha(cScale(), th.dark ? 0.35 : 0.28);
      g.setLineDash([5, 5]);
      g.lineWidth = 1.2;
      const half = Math.max(30, imgPx * 0.6);
      g.beginPath();
      if (narrowC) {
        g.moveTo(ox - lr, oy);
        g.lineTo(icx - half, icy - half * 0.5);
        g.moveTo(ox + lr, oy);
        g.lineTo(icx + half, icy - half * 0.5);
      } else {
        g.moveTo(ox, oy - lr);
        g.lineTo(icx - half, icy - half * 0.8);
        g.moveTo(ox, oy + lr);
        g.lineTo(icx - half, icy + half * 0.8);
      }
      g.stroke();
      g.restore();
      g.save();
      g.beginPath();
      g.arc(ox, oy, lr, 0, Math.PI * 2);
      const glass = g.createRadialGradient(ox - lr * 0.35, oy - lr * 0.4, lr * 0.1, ox, oy, lr);
      glass.addColorStop(0, 'rgba(255,255,255,0.45)');
      glass.addColorStop(0.7, alpha(th.series[5]!, 0.08));
      glass.addColorStop(1, alpha(th.series[5]!, 0.2));
      g.fillStyle = glass;
      g.fill();
      g.lineWidth = 4;
      g.strokeStyle = th.dark ? '#8b95a5' : '#4a5260';
      g.stroke();
      g.lineCap = 'round';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(ox + lr * 0.72, oy + lr * 0.72);
      g.lineTo(ox + lr * 1.5, oy + lr * 1.5);
      g.strokeStyle = th.dark ? '#6b5236' : '#5a3d22';
      g.stroke();
      g.restore();

      // Bild (vergrößert)
      g.save();
      roundRect(g, M.x, M.y, M.w, M.h, 10);
      g.fillStyle = alpha(cScale(), th.dark ? 0.06 : 0.035);
      g.fill();
      g.strokeStyle = alpha(cScale(), 0.35);
      g.lineWidth = 1.2;
      g.setLineDash([6, 4]);
      g.stroke();
      g.restore();
      g.save();
      roundRect(g, M.x, M.y, M.w, M.h, 10);
      g.clip();
      drawObject(id, icx, icy, imgPx, objA);
      halo(`${tt('Bild im Maßstab', 'Picture at scale')} ${z} : 1`, M.x + 10, M.y + 14, font(750, 12), cScale(), 'left');
      // Maßpfeil und Lineal unter dem Bild
      const rx0 = icx - imgPx / 2;
      const rulerY = Math.min(M.y + M.h - clamp(ppc * 0.9, 22, 34) - 8, icy + imgPx * (id === 'stamp' ? 0.6 : 0.45) + 50);
      const imgCm = (o.lengthUm * zd) / UM.cm;
      const cmCount = Math.max(1, Math.ceil(imgCm - 1e-6));
      hRuler(rx0, rulerY, cmCount, ppc, 1);
      g.strokeStyle = alpha(cMap(), 0.6);
      g.setLineDash([4, 3]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(rx0, icy);
      g.lineTo(rx0, rulerY);
      g.moveTo(rx0 + imgPx, icy);
      g.lineTo(rx0 + imgPx, rulerY);
      g.stroke();
      g.setLineDash([]);
      const disp = Math.round((o.lengthUm * zd) / UM.mm);
      dimArrow(rx0, rx0 + imgPx, rulerY - 12, lt(disp * UM.mm, 'cm'), cMap(), objA, 12.5);
      g.restore();
      g.restore();
    }

    function zoomCards(): CardSpec[] {
      const th = ctx.theme;
      const sm = small();
      const id = (p.o as ObjId) in OBJECTS ? (p.o as ObjId) : 'bug';
      const o = OBJECTS[id];
      const z = Number(p.z) || 10;
      const imgUm = o.lengthUm * z;
      const zd = Math.exp(zLog.at(now));
      const dispMm = Math.round((o.lengthUm * zd) / UM.mm);
      const cards: CardSpec[] = [];
      cards.push({
        items: [
          { kind: 'title', text: tt('Im Bild gemessen', 'Measured in the picture') },
          { kind: 'big', segs: [S(lt(dispMm * UM.mm, 'cm'), cMap())], size: sm ? 22 : 28 },
          { kind: 'note', text: tt(`${T(OBJ_TEXT[id].what)} des Bildes im Maßstab ${z} : 1`, `${T(OBJ_TEXT[id].what)} of the picture at a scale of ${z} : 1`) },
        ],
      });
      const real = realFromImage(imgUm, enlargement(z))!;
      const chain = unitChain(real.um, 'cm');
      const first: Seg[] = [S(lt(imgUm, 'cm'), cMap(), 800), S(' : ', th.muted), S(String(z), cScale(), 800)];
      const rows: Seg[][] = [first, ...chain.slice(0, -1).map((c) => [S('= ', th.muted), S(c.text(lang), th.text, 700)])];
      const last = chain[chain.length - 1]!;
      cards.push({
        items: [{ kind: 'title', text: tt('In Wirklichkeit', 'In reality') }, ...(sm ? stepItems([[...first, ...(chain.length > 1 ? [S(' = ', th.muted), S(chain[0]!.text(lang), th.text, 700)] : [])]], [S('= ', th.muted), S(last.text(lang), cReal())], zChainAt, 13, 20) : stepItems(rows, [S('= ', th.muted), S(last.text(lang), cReal())], zChainAt, 15, 26))],
        accent: cReal(),
        tint: 0.04,
      });
      cards.push({
        optional: true,
        accent: cScale(),
        tint: 0.03,
        items: [
          { kind: 'title', text: tt('Merke', 'Remember'), color: cScale() },
          { kind: 'note', text: tt(`${z} : 1 heißt: ${z} cm im Bild sind 1 cm in Wirklichkeit. Das Bild ist ${z}-mal so groß wie das Objekt.`, `${z} : 1 means: ${z} cm in the picture are 1 cm in reality. The picture is ${z} times as large as the object.`), color: th.text },
          { kind: 'note', text: tt('Bei einer Vergrößerung steht die größere Zahl vorn, bei einer Karte (Verkleinerung) hinten.', 'For an enlargement the larger number comes first, for a map (reduction) it comes last.') },
        ],
      });
      return cards;
    }

    /* ================================================================== */
    /* Rechnen                                                             */
    /* ================================================================== */

    let calcAt = now + 300;
    let lastSought = p.cq as Sought;
    interface CalcState {
      sought: Sought;
      mapUm: number;
      realUm: number;
      n: number;
      sol: ReturnType<typeof solve>;
    }
    function calcState(): CalcState {
      const sought = p.cq as Sought;
      const mapUm = Math.round(p.cm * 10) * UM.mm;
      const realUm = Math.round(p.rw * 10) * (UM.m / 10);
      const n = Number(p.cs) || 50000;
      return { sought, mapUm, realUm, n, sol: solve(sought, mapUm, realUm, n) };
    }
    const mapText = (um: number, exact = true) => `${exact ? '' : '≈ '}${decimalIn(um, 'cm', lang, exact ? 6 : 2).text} cm`;

    function calcTexts(cs: CalcState): { task: string; rows: Seg[][]; big: Seg[] | null } {
      const th = ctx.theme;
      const sol = cs.sol;
      const scl = (n: number) => `1 : ${gi(n)}`;
      if (cs.sought === 'real') {
        const task = tt(
          `Auf einer Karte im Maßstab ${scl(cs.n)} sind zwei Orte ${mapText(cs.mapUm)} voneinander entfernt. Wie weit sind sie in Wirklichkeit auseinander?`,
          `On a map at a scale of ${scl(cs.n)} two places are ${mapText(cs.mapUm)} apart. How far apart are they in reality?`,
        );
        if (!sol || cs.mapUm === 0) return { task, rows: [], big: sol ? [S('0 m', cReal())] : null };
        const chain = unitChain(sol.realUm, 'cm');
        return {
          task,
          rows: [[S(mapText(cs.mapUm), cMap(), 800), S(' · ', th.muted), S(gi(cs.n), cScale(), 800), S(' = ', th.muted), S(chain[0]!.text(lang), th.text, 700)], ...chain.slice(1, -1).map((c) => [S('= ', th.muted), S(c.text(lang), th.text, 700)])],
          big: chain.length > 1 ? [S('= ', th.muted), S(chain[chain.length - 1]!.text(lang), cReal())] : null,
        };
      }
      if (cs.sought === 'map') {
        const task = tt(
          `Zwei Orte sind in Wirklichkeit ${lt(cs.realUm)} voneinander entfernt. Wie lang ist die Strecke auf einer Karte im Maßstab ${scl(cs.n)}?`,
          `Two places are ${lt(cs.realUm)} apart in reality. How long is the line on a map at a scale of ${scl(cs.n)}?`,
        );
        if (!sol || cs.realUm === 0) return { task, rows: [], big: sol ? [S('0 cm', cMap())] : null };
        const back = unitChain(cs.realUm, 'cm').reverse();
        const rows: Seg[][] = [];
        if (back.length > 1) rows.push([S(back[0]!.text(lang), cReal(), 800), ...back.slice(1).flatMap((c) => [S(' = ', th.muted), S(c.text(lang), th.text, 700)])]);
        rows.push([S(lt(cs.realUm, 'cm'), th.text, 700), S(' : ', th.muted), S(gi(cs.n), cScale(), 800)]);
        return { task, rows, big: [S(sol.exact ? '= ' : '≈ ', th.muted), S(mapText(sol.mapUm), cMap())] };
      }
      const task = tt(
        `Auf einer Karte sind zwei Orte ${mapText(cs.mapUm)} voneinander entfernt, in Wirklichkeit sind es ${lt(cs.realUm)}. Welchen Maßstab hat die Karte?`,
        `On a map two places are ${mapText(cs.mapUm)} apart; in reality they are ${lt(cs.realUm)} apart. What is the scale of the map?`,
      );
      if (!sol) return { task, rows: [], big: null };
      const back = unitChain(cs.realUm, 'cm').reverse();
      const rows: Seg[][] = [];
      if (back.length > 1) rows.push([S(back[0]!.text(lang), cReal(), 800), S(' = ', th.muted), S(back[back.length - 1]!.text(lang), th.text, 700)]);
      rows.push([S(lt(cs.realUm, 'cm'), th.text, 700), S(' : ', th.muted), S(mapText(cs.mapUm), cMap(), 800), S(sol.exact ? ' = ' : ' ≈ ', th.muted), S(gi(sol.n), cScale(), 800)]);
      return { task, rows, big: [S(sol.exact ? tt('Maßstab ', 'Scale ') : tt('etwa ', 'about '), th.muted, 700), S(`1 : ${gi(sol.n)}`, cScale())] };
    }

    function drawCalcScene(gm: Geo): void {
      const g = surface.g;
      const th = ctx.theme;
      const C = gm.C;
      card(C);
      g.save();
      g.globalAlpha = sceneA();
      const cs = calcState();
      const { task } = calcTexts(cs);
      const narrowC = C.w < 500;
      const pad = narrowC ? 12 : 20;
      text(g, tt('Aufgabe', 'Task'), C.x + pad, C.y + 20, { font: font(750, narrowC ? 11.5 : 12.5), color: th.muted, align: 'left' });
      const tf = font(650, narrowC ? 13 : clamp(C.w / 38, 14, 17));
      const rows = wrap(task, C.w - 2 * pad, tf);
      const lh = narrowC ? 18 : 23;
      const ta = prog(calcAt - 300, 400);
      g.save();
      g.globalAlpha *= ta;
      rows.forEach((r, i) => text(g, r, C.x + pad, C.y + 44 + i * lh, { font: tf, color: th.text, align: 'left' }));
      g.restore();
      // drei Kästchen: Karte – Maßstab – Wirklichkeit
      const ty = C.y + 44 + rows.length * lh + (narrowC ? 6 : 14);
      const tileH = narrowC ? 54 : 70;
      const gapW = narrowC ? 18 : 34;
      const tw = (C.w - 2 * pad - 2 * gapW) / 3;
      const sol = cs.sol;
      const ru = revealed ? prog(calcAt + 300, 500) : 0;
      const tiles: { label: string; value: string; color: string; sought: boolean }[] = [
        { label: tt('Karte', 'Map'), value: mapText(cs.sought === 'map' ? (sol?.mapUm ?? 0) : cs.mapUm, cs.sought !== 'map' || !!sol?.exact), color: cMap(), sought: cs.sought === 'map' },
        { label: tt('Maßstab', 'Scale'), value: `1 : ${gi(cs.sought === 'scale' ? (sol?.n ?? 0) : cs.n)}`, color: cScale(), sought: cs.sought === 'scale' },
        { label: tt('Wirklichkeit', 'Reality'), value: lt(cs.sought === 'real' ? (sol?.realUm ?? 0) : cs.realUm), color: cReal(), sought: cs.sought === 'real' },
      ];
      tiles.forEach((tl, i) => {
        const x = C.x + pad + i * (tw + gapW);
        const show = !tl.sought || ru > 0;
        g.save();
        g.shadowColor = th.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.1)';
        g.shadowBlur = 10;
        g.shadowOffsetY = 3;
        roundRect(g, x, ty, tw, tileH, 12);
        g.fillStyle = th.dark ? shade(th.bg, 0.1) : '#ffffff';
        g.fill();
        g.shadowColor = 'transparent';
        g.fillStyle = alpha(tl.sought ? cAsk() : tl.color, th.dark ? 0.16 : 0.08);
        g.fill();
        if (tl.sought) g.setLineDash([6, 4]);
        g.strokeStyle = alpha(tl.sought ? cAsk() : tl.color, 0.7);
        g.lineWidth = tl.sought ? 2 : 1.4;
        g.stroke();
        g.restore();
        text(g, tl.label, x + tw / 2, ty + (narrowC ? 14 : 18), { font: font(700, narrowC ? 11 : 12), color: th.muted });
        const vf = (s: number) => font(800, s);
        if (show) {
          const k = tl.sought ? 0.8 + 0.2 * ease.outBack(ru) : 1;
          const sz = fitSize(tl.value, 800, narrowC ? 14 : 19, (tw - 12) / k, 10);
          g.save();
          g.globalAlpha *= tl.sought ? clamp(ru * 1.5, 0, 1) : 1;
          g.translate(x + tw / 2, ty + tileH * 0.64);
          g.scale(k, k);
          text(g, tl.value, 0, 0, { font: vf(sz), color: tl.sought ? cAsk() : tl.color });
          g.restore();
        } else text(g, '?', x + tw / 2, ty + tileH * 0.64, { font: vf(narrowC ? 20 : 26), color: cAsk() });
        if (i < 2) {
          const ax = x + tw + 3;
          const bx = x + tw + gapW - 3;
          const ay = ty + tileH / 2;
          g.save();
          g.strokeStyle = alpha(th.muted, 0.7);
          g.fillStyle = alpha(th.muted, 0.7);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(ax, ay);
          g.lineTo(bx - 4, ay);
          g.stroke();
          g.beginPath();
          g.moveTo(bx, ay);
          g.lineTo(bx - 6, ay - 4);
          g.lineTo(bx - 6, ay + 4);
          g.closePath();
          g.fill();
          g.restore();
        }
      });
      // Anschauung: Strecke auf der Karte und in Wirklichkeit
      const iy = ty + tileH + (narrowC ? 14 : 26);
      const ih = C.y + C.h - pad - iy;
      if (ih > 90) drawCalcPicture({ x: C.x + pad, y: iy, w: C.w - 2 * pad, h: ih }, cs, ru);
      g.restore();
    }

    function drawCalcPicture(R: Rect, cs: CalcState, ru: number): void {
      const g = surface.g;
      const th = ctx.theme;
      const sol = cs.sol;
      const mapUm = cs.sought === 'map' ? (sol?.mapUm ?? 0) : cs.mapUm;
      const realUm = cs.sought === 'real' ? (sol?.realUm ?? 0) : cs.realUm;
      const known = (k: Sought) => cs.sought !== k || ru > 0.5;
      const P = pal();
      const half = Math.min(R.h / 2 - 4, 90);
      // Karte (oben)
      const mr: Rect = { x: R.x, y: R.y, w: R.w, h: half };
      g.save();
      roundRect(g, mr.x, mr.y, mr.w, mr.h, 10);
      g.fillStyle = P.paper;
      g.fill();
      g.clip();
      g.globalAlpha = 0.6;
      g.fillStyle = P.forest;
      g.beginPath();
      g.ellipse(mr.x + mr.w * 0.82, mr.y + mr.h * 0.3, mr.w * 0.14, mr.h * 0.35, 0.3, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = P.water;
      g.beginPath();
      g.ellipse(mr.x + mr.w * 0.18, mr.y + mr.h * 0.8, mr.w * 0.12, mr.h * 0.25, -0.2, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
      g.restore();
      roundRect(g, mr.x, mr.y, mr.w, mr.h, 10);
      g.strokeStyle = alpha(th.text, th.dark ? 0.3 : 0.2);
      g.lineWidth = 1;
      g.stroke();
      halo(tt('Karte', 'Map'), mr.x + 10, mr.y + 13, font(750, 11.5), th.muted, 'left', 1, P.paper);
      const cmLen = mapUm / UM.cm;
      const avail = mr.w - 80;
      const ppc = cmLen > 0 ? Math.min(clamp(avail / 12, 18, 40), avail / cmLen) : 30;
      const lx0 = mr.x + 40;
      const lineY = mr.y + mr.h * 0.42;
      const grow = ease.inOutCubic(prog(calcAt, 700));
      const lenPx = cmLen * ppc * grow;
      const rulerTop = lineY + 6;
      if (rulerTop + 22 < mr.y + mr.h + 4) hRuler(lx0, rulerTop, Math.max(1, Math.ceil(cmLen - 1e-6)), ppc, 0.95);
      g.save();
      g.strokeStyle = cMap();
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(lx0, lineY);
      g.lineTo(lx0 + lenPx, lineY);
      g.stroke();
      g.fillStyle = cMap();
      for (const x of [lx0, lx0 + lenPx]) {
        g.beginPath();
        g.arc(x, lineY, 4, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
      if (known('map')) pill(mapText(mapUm, cs.sought !== 'map' || !!sol?.exact), lx0 + lenPx / 2, lineY - 15, cMap(), '#ffffff', 12, grow);
      else pill('?', lx0 + Math.max(lenPx, 40) / 2, lineY - 15, cAsk(), '#ffffff', 12, 1);
      // Wirklichkeit (unten): Landschaft mit zwei Fahnen
      const rr: Rect = { x: R.x, y: R.y + R.h - half, w: R.w, h: half };
      g.save();
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 10);
      const sky = g.createLinearGradient(0, rr.y, 0, rr.y + rr.h);
      sky.addColorStop(0, th.dark ? shade(th.series[0]!, -0.55) : mixColor('#ffffff', th.series[0]!, 0.18));
      sky.addColorStop(1, th.dark ? shade(th.series[0]!, -0.7) : mixColor('#ffffff', th.series[0]!, 0.06));
      g.fillStyle = sky;
      g.fill();
      g.clip();
      const groundY = rr.y + rr.h * 0.66;
      g.fillStyle = th.dark ? shade(th.series[2]!, -0.5) : mixColor('#ffffff', th.series[2]!, 0.4);
      g.beginPath();
      g.moveTo(rr.x, groundY);
      for (let i = 0; i <= 20; i++) {
        const x = rr.x + (rr.w * i) / 20;
        g.lineTo(x, groundY - Math.sin(i * 0.9) * 5 - Math.sin(i * 0.37) * 9 - 6);
      }
      g.lineTo(rr.x + rr.w, rr.y + rr.h);
      g.lineTo(rr.x, rr.y + rr.h);
      g.closePath();
      g.fill();
      // ferne Hügel
      g.fillStyle = th.dark ? shade(th.series[2]!, -0.62) : mixColor('#ffffff', th.series[2]!, 0.22);
      g.beginPath();
      g.moveTo(rr.x, groundY - 10);
      g.quadraticCurveTo(rr.x + rr.w * 0.3, groundY - rr.h * 0.42, rr.x + rr.w * 0.55, groundY - 14);
      g.quadraticCurveTo(rr.x + rr.w * 0.8, groundY - rr.h * 0.3, rr.x + rr.w, groundY - 8);
      g.lineTo(rr.x + rr.w, groundY);
      g.lineTo(rr.x, groundY);
      g.closePath();
      g.fill();
      g.restore();
      roundRect(g, rr.x, rr.y, rr.w, rr.h, 10);
      g.strokeStyle = alpha(th.text, th.dark ? 0.3 : 0.2);
      g.lineWidth = 1;
      g.stroke();
      halo(tt('Wirklichkeit', 'Reality'), rr.x + 10, rr.y + 13, font(750, 11.5), th.muted, 'left', 1, th.dark ? shade(th.series[0]!, -0.55) : '#ffffff');
      const fx0 = rr.x + 40;
      const fx1 = rr.x + rr.w - 40;
      const flag = (x: number) => {
        g.save();
        g.strokeStyle = th.dark ? '#d0d6de' : '#3b4554';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, groundY - 4);
        g.lineTo(x, groundY - 34);
        g.stroke();
        g.fillStyle = cReal();
        g.beginPath();
        g.moveTo(x, groundY - 34);
        g.lineTo(x + 14, groundY - 29);
        g.lineTo(x, groundY - 24);
        g.closePath();
        g.fill();
        g.restore();
      };
      flag(fx0);
      flag(fx1);
      // Projektion von der Karte in die Wirklichkeit
      g.save();
      g.setLineDash([4, 4]);
      g.strokeStyle = alpha(th.muted, 0.45);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(lx0, lineY + 4);
      g.lineTo(fx0, groundY - 36);
      g.moveTo(lx0 + cmLen * ppc, lineY + 4);
      g.lineTo(fx1, groundY - 36);
      g.stroke();
      g.restore();
      const ay = groundY + (rr.y + rr.h - groundY) * 0.55;
      const lab = known('real') ? lt(realUm) : '?';
      dimArrow(fx0, fx1, ay, lab, known('real') ? cReal() : cAsk(), grow, 12);
      void known;
    }

    function calcCards(): CardSpec[] {
      const th = ctx.theme;
      const sm = small();
      const cs = calcState();
      const { rows, big } = calcTexts(cs);
      const items: Item[] = [{ kind: 'title', text: tt('Lösungsweg', 'Solution') }];
      if (!cs.sol) items.push({ kind: 'note', text: tt('Bitte Längen größer als 0 eingeben.', 'Please enter lengths greater than 0.'), color: cAsk() });
      else if (!revealed) {
        items.push({ kind: 'big', segs: [S('?', cAsk())], size: sm ? 22 : 28 });
        items.push({ kind: 'note', text: tt('Rechne selbst – dann „Ergebnis anzeigen“ antippen.', 'Work it out – then tap “Show result”.') });
      } else items.push(...stepItems(rows, big, calcAt + 300, sm ? 12.5 : 14.5, sm ? 19 : 24));
      if (cs.sol && !cs.sol.exact && revealed) items.push({ kind: 'note', text: tt('Die Rechnung geht nicht auf – das Ergebnis ist gerundet.', 'The division does not come out exactly – the result is rounded.') });
      const tip: Item[] = [
        { kind: 'title', text: tt('Merke', 'Remember'), color: cScale() },
        { kind: 'note', text: tt('Maßstab 1 : n: Karte · n = Wirklichkeit, Wirklichkeit : n = Karte.', 'Scale 1 : n: map · n = reality, reality ÷ n = map.'), color: th.text },
        { kind: 'note', text: tt('Vorher beide Längen in dieselbe Einheit (meist cm) umrechnen.', 'First convert both lengths to the same unit (usually cm).') },
      ];
      return [
        { items, accent: cReal(), tint: revealed ? 0.04 : 0 },
        { items: tip, optional: true, accent: cScale(), tint: 0.03 },
      ];
    }

    /* ================================================================== */
    /* Ergebnisse und Aktionen                                             */
    /* ================================================================== */

    function updateReadouts(): void {
      const th = ctx.theme;
      void th;
      const show = new Set<string>();
      const m = mode();
      if (m === 'map') {
        const me = meas();
        const n = N();
        ctx.readout('scale', `1 : ${gi(n)} · 1 cm ≙ ${lt(UM.cm * n)}`);
        const names = me.fromName || me.toName ? ` (${me.fromName ?? 'A'} → ${me.toName ?? 'B'})` : '';
        ctx.readout('map', `${cm1(me.mm)}${p.r ? ` ${tt('Wegstrecke', 'route')}` : ''}${names}`);
        ctx.readout('real', lt(me.realUm));
        const chain = unitChain(me.realUm, 'cm').map((c) => c.text(lang));
        ctx.readout('calc', `${decimalIn(me.mm * UM.mm, 'cm', lang).text} cm · ${gi(n)} = ${chain.join(' = ')}`);
        show.add('scale').add('map').add('real').add('calc');
      } else if (m === 'zoom') {
        const id = (p.o as ObjId) in OBJECTS ? (p.o as ObjId) : 'bug';
        const o = OBJECTS[id];
        const z = Number(p.z) || 10;
        ctx.readout('scale', `${z} : 1 (${tt('Vergrößerung', 'enlargement')})`);
        ctx.readout('img', lt(o.lengthUm * z, 'cm'));
        ctx.readout('real', `${OBJ_TEXT[id].approx ? '≈ ' : ''}${lt(o.lengthUm)}`);
        const chain = unitChain(o.lengthUm, 'cm').map((c) => c.text(lang));
        ctx.readout('calc', `${lt(o.lengthUm * z, 'cm')} : ${z} = ${chain.join(' = ')}`);
        show.add('scale').add('img').add('real').add('calc');
      } else {
        const cs = calcState();
        const { task } = calcTexts(cs);
        ctx.readout('task', task);
        show.add('task');
        if (cs.sol) {
          const sol = cs.sol;
          ctx.readout('res', cs.sought === 'real' ? lt(sol.realUm) : cs.sought === 'map' ? mapText(sol.mapUm, sol.exact) : `${sol.exact ? '' : '≈ '}1 : ${gi(sol.n)}`);
          ctx.readout(
            'calc',
            cs.sought === 'real'
              ? `${mapText(cs.mapUm)} · ${gi(cs.n)} = ${lt(sol.realUm, 'cm')} = ${lt(sol.realUm)}`
              : cs.sought === 'map'
                ? `${lt(cs.realUm, 'cm')} : ${gi(cs.n)} ${sol.exact ? '=' : '≈'} ${mapText(sol.mapUm, sol.exact)}`
                : `${lt(cs.realUm, 'cm')} : ${mapText(cs.mapUm)} ${sol.exact ? '=' : '≈'} ${gi(sol.n)}`,
          );
          show.add('res').add('calc');
        }
      }
      for (const k of ['task', 'scale', 'map', 'img', 'real', 'res', 'calc']) if (!show.has(k)) ctx.readout(k, null);
    }

    function updateActions(): void {
      ctx.setAction('task', { enabled: !ctx.locked });
      ctx.setAction('route', { enabled: !ctx.locked, label: p.r ? tt('Luftlinie messen', 'Measure straight line') : tt('Wegstrecke messen', 'Measure the route') });
      ctx.setAction('ctask', { enabled: !ctx.locked });
      ctx.setAction('go', { enabled: !ctx.locked && !revealed });
      const zi = ZOOM_SCALES.indexOf(Number(p.z) as (typeof ZOOM_SCALES)[number]);
      ctx.setAction('zin', { enabled: !ctx.locked && zi < ZOOM_SCALES.length - 1 });
      ctx.setAction('zout', { enabled: !ctx.locked && zi > 0 });
    }

    /** Neue Messaufgabe: zwei Orte, die beim aktuellen Maßstab gut auf die Karte passen. */
    function newMapTask(): void {
      if (!geo) return;
      const n = N();
      const R = mapRect(geo);
      const k = (pxPerCm(R) * 100) / n;
      const hw = R.w / 2 / k - 30 / k;
      const hh = R.h / 2 / k - 30 / k;
      const vis = POIS.filter((o) => n <= o.maxN);
      const pairs: [Poi, Poi][] = [];
      for (const a of vis)
        for (const b of vis) {
          if (a === b) continue;
          if (Math.abs(a.x - b.x) > 2 * hw || Math.abs(a.y - b.y) > 2 * hh) continue;
          const mm = mapMmFromMetres(dist(a, b), n);
          if (mm < 15) continue;
          if (a.x === p.ax && a.y === p.ay && b.x === p.bx && b.y === p.by) continue;
          pairs.push([a, b]);
        }
      if (!pairs.length) return;
      const [a, b] = pairs[Math.floor(Math.random() * pairs.length)]!;
      revealed = false;
      ctx.set({ ax: a.x, ay: a.y, bx: b.x, by: b.y });
      toast(tt(`Miss die Strecke ${T(a.name)} → ${T(b.name)} und rechne sie in die Wirklichkeit um.`, `Measure ${T(a.name)} → ${T(b.name)} and convert it to reality.`));
    }

    /* ---------------- Zeiger ---------------- */
    function setEnd(which: 'a' | 'b', q: Pt): void {
      let w = { x: clamp(Math.round(q.x), 0, WORLD.w), y: clamp(Math.round(q.y), 0, WORLD.h) };
      if (p.r) {
        const s = snapToGraph(ROADS, w);
        if (s) w = { x: Math.round(s.pt.x), y: Math.round(s.pt.y) };
      }
      if (which === 'a') ctx.set({ ax: w.x, ay: w.y });
      else ctx.set({ bx: w.x, by: w.y });
    }

    surface.addTarget({
      contains: (px, py) => geo !== null && hitAt(px, py) !== null,
      pointerDown: (pt) => {
        if (ctx.locked || !geo) return false;
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        if (h.id.startsWith('sc:')) {
          const n = Number(h.id.slice(3));
          const f = fitted(n, A(), B());
          ctx.set({ s: String(n), ...(f ? { ax: f.a.x, ay: f.a.y, bx: f.b.x, by: f.b.y } : {}) });
          if (f) toast(tt('Die Strecke wurde gekürzt, damit sie auf den Kartenausschnitt passt.', 'The line was shortened so that it fits the map section.'));
          return true;
        }
        if (mode() !== 'map') return false;
        if (h.id === 'h:a' || h.id === 'h:b') {
          drag = { kind: h.id === 'h:a' ? 'a' : 'b', x0: pt.px, y0: pt.py, moved: false };
          surface.setCursor('grabbing');
          ctx.requestRender();
          return true;
        }
        if (h.id.startsWith('poi:')) {
          drag = { kind: 'poi', id: h.id.slice(4), x0: pt.px, y0: pt.py, moved: false };
          return true;
        }
        if (h.id === 'line') {
          // nur nahe an der Strecke greifen
          const v = viewNow(mapRect(geo));
          const [ax, ay] = toPx(v, p.ax, p.ay);
          const [bx, by] = toPx(v, p.bx, p.by);
          const c = closestOnSegment({ x: pt.px, y: pt.py }, { x: ax, y: ay }, { x: bx, y: by });
          if (c.d > 12 || p.r) return false;
          drag = { kind: 'line', x0: pt.px, y0: pt.py, moved: false, a0: A(), b0: B() };
          surface.setCursor('grabbing');
          return true;
        }
        return false;
      },
      pointerMove: (pt) => {
        if (!drag || !geo) return;
        if (!drag.moved && Math.hypot(pt.px - drag.x0, pt.py - drag.y0) < 4) return;
        drag.moved = true;
        const R = mapRect(geo);
        const v = viewNow(R);
        if (drag.kind === 'a' || drag.kind === 'b') {
          const px = clamp(pt.px, R.x + 8, R.x + R.w - 8);
          const py = clamp(pt.py, R.y + 8, R.y + R.h - 8);
          let q = toWorld(v, px, py);
          // in der Nähe eines Ortes einrasten
          for (const o of POIS) {
            if (poiA(o, v.n) < 0.5) continue;
            const [ox, oy] = toPx(v, o.x, o.y);
            if (Math.hypot(ox - px, oy - py) < 10) q = { x: o.x, y: o.y };
          }
          if (q.x === Math.round(q.x) && POIS.some((o) => o.x === q.x && o.y === q.y)) {
            if (drag.kind === 'a') ctx.set({ ax: q.x, ay: q.y });
            else ctx.set({ bx: q.x, by: q.y });
          } else setEnd(drag.kind, q);
        } else if (drag.kind === 'line' && drag.a0 && drag.b0) {
          let dx = (pt.px - drag.x0) / v.k;
          let dy = (pt.py - drag.y0) / v.k;
          const w0 = toWorld(v, R.x + 8, R.y + 8);
          const w1 = toWorld(v, R.x + R.w - 8, R.y + R.h - 8);
          dx = clamp(dx, w0.x - Math.min(drag.a0.x, drag.b0.x), w1.x - Math.max(drag.a0.x, drag.b0.x));
          dy = clamp(dy, w0.y - Math.min(drag.a0.y, drag.b0.y), w1.y - Math.max(drag.a0.y, drag.b0.y));
          ctx.set({ ax: Math.round(drag.a0.x + dx), ay: Math.round(drag.a0.y + dy), bx: Math.round(drag.b0.x + dx), by: Math.round(drag.b0.y + dy) });
        }
      },
      pointerUp: () => {
        if (!drag) return;
        if (drag.kind === 'poi' && !drag.moved && drag.id) {
          const o = POIS.find((q) => q.id === drag!.id);
          if (o) {
            const which = nextEnd;
            nextEnd = which === 'a' ? 'b' : 'a';
            drag = null;
            if (which === 'a') {
              ctx.set({ ax: o.x, ay: o.y });
              toast(tt(`Start: ${T(o.name)} – jetzt das Ziel antippen.`, `Start: ${T(o.name)} – now tap the destination.`));
            } else {
              ctx.set({ bx: o.x, by: o.y });
            }
            restartMeasureAnim(60);
          }
        } else if (drag.moved) {
          chainAt = performance.now() + (reduced ? -1e6 : 80);
          routeAt = performance.now() - 1e6;
        }
        drag = null;
        surface.setCursor(hover ? (hits.find((h) => h.id === hover)?.cursor ?? '') : '');
        ctx.requestRender();
      },
      hover: (pt) => {
        const h = pt && !ctx.locked ? hitAt(pt.px, pt.py) : null;
        let id = h?.id ?? null;
        if (id === 'line' && pt && geo) {
          const v = viewNow(mapRect(geo));
          const [ax, ay] = toPx(v, p.ax, p.ay);
          const [bx, by] = toPx(v, p.bx, p.by);
          if (p.r || closestOnSegment({ x: pt.px, y: pt.py }, { x: ax, y: ay }, { x: bx, y: by }).d > 12) id = null;
        }
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        if (drag) return;
        surface.setCursor(id ? (hits.find((x) => x.id === id)?.cursor ?? 'pointer') : '');
      },
      wheel: () => false,
    });

    /* ================================================================== */
    /* Ablauf                                                              */
    /* ================================================================== */

    function intro(): void {
      now = performance.now();
      sceneStart = now + (reduced ? -1e6 : 40);
      if (mode() === 'map' && geo) {
        const R = mapRect(geo);
        const c = centreFor(R, N(), A(), B());
        if (!reduced) {
          logN.snap(Math.log(N() * 1.9));
          const c0 = centreFor(R, N() * 1.9, A(), B());
          camX.snap(c0.x);
          camY.snap(c0.y);
          logN.go(Math.log(N()), 1500, ease.inOutCubic, 100);
          camX.go(c.x, 1500, ease.inOutCubic, 100);
          camY.go(c.y, 1500, ease.inOutCubic, 100);
        } else aimCamera(0, true);
        mmShown.snap(0);
        mmShown.go(meas().mm, 700, ease.outCubic, 1300);
        restartMeasureAnim(1100);
      } else if (mode() === 'zoom') {
        const z = Number(p.z) || 10;
        zLog.snap(Math.log(Math.max(1, z / 4)));
        zLog.go(Math.log(z), 1300, ease.inOutCubic, 250);
        objAt = now + (reduced ? -1e6 : 100);
        zChainAt = now + (reduced ? -1e6 : 1600);
        ppcZ.snap(0);
      } else {
        calcAt = now + (reduced ? -1e6 : 400);
      }
    }

    let shownMode = mode();
    let needIntro = true;
    updateReadouts();
    updateActions();

    return {
      update(changed, source) {
        now = performance.now();
        const m = mode();
        if (changed.has('show') && source !== 'init') revealed = p.show;
        if (source === 'replace') revealed = p.show;
        if (changed.has('mode') && m !== shownMode) {
          shownMode = m;
          revealed = p.show;
          if (source !== 'init') {
            geo = null;
            needIntro = true;
          }
        }
        if (m === 'map' && source !== 'init') {
          const nChanged = changed.has('s');
          if (nChanged && source === 'input') {
            const f = fitted(N(), A(), B());
            if (f) {
              ctx.set({ ax: f.a.x, ay: f.a.y, bx: f.b.x, by: f.b.y });
              toast(tt('Die Strecke wurde gekürzt, damit sie auf den Kartenausschnitt passt.', 'The line was shortened so that it fits the map section.'));
            }
          }
          if (changed.has('r') && p.r && (source === 'input' || source === 'sim') && !drag) {
            // Endpunkte auf die Straße setzen
            const sa = snapToGraph(ROADS, A());
            const sb = snapToGraph(ROADS, B());
            if (sa && sb && (sa.d > 0.5 || sb.d > 0.5) && !POIS.some((o) => o.x === p.ax && o.y === p.ay) && !POIS.some((o) => o.x === p.bx && o.y === p.by)) {
              ctx.set({ ax: Math.round(sa.pt.x), ay: Math.round(sa.pt.y), bx: Math.round(sb.pt.x), by: Math.round(sb.pt.y) });
            }
          }
          const ptsChanged = ['ax', 'ay', 'bx', 'by'].some((k) => changed.has(k));
          if (nChanged || source === 'replace' || (ptsChanged && !drag && source !== 'sim')) aimCamera(source === 'replace' ? 1100 : 900);
          else if (ptsChanged && !drag && source === 'sim') aimCamera(700);
          const mm = meas().mm;
          if (drag) mmShown.snap(mm);
          else mmShown.go(mm, nChanged ? 900 : 450, ease.outCubic);
          if (source === 'replace' || changed.has('r')) restartMeasureAnim(source === 'replace' ? 500 : 100);
          else if (nChanged) chainAt = now + (reduced ? -1e6 : 950);
          else if (ptsChanged && !drag) chainAt = now + (reduced ? -1e6 : 300);
        }
        if (m === 'zoom' && source !== 'init') {
          if (changed.has('o')) {
            objAt = now + (reduced ? -1e6 : 60);
            zLog.snap(Math.log(Number(p.z) || 10));
          } else if (changed.has('z')) zLog.go(Math.log(Number(p.z) || 10), 900, ease.inOutCubic);
          if (changed.has('o') || changed.has('z')) zChainAt = now + (reduced ? -1e6 : 500);
        }
        if (m === 'calc') {
          if (changed.has('cq') && source === 'input') {
            // gleiche Aufgabe, nur eine andere Größe gesucht: die bisher gesuchte wird nun vorgegeben
            const old = solve(lastSought, Math.round(p.cm * 10) * UM.mm, Math.round(p.rw * 10) * (UM.m / 10), Number(p.cs) || 50000);
            if (old) {
              const vals: Record<string, number | string> = { cm: Math.round(old.mapUm / UM.mm) / 10, rw: Math.round(old.realUm / (UM.m / 10)) / 10 };
              if ((CALC_SCALES as readonly number[]).includes(old.n)) vals.cs = String(old.n);
              ctx.set(vals as never);
            }
          }
          lastSought = p.cq as Sought;
          if (source !== 'init' && ['cq', 'cm', 'rw', 'cs'].some((k) => changed.has(k))) calcAt = now + (reduced ? -1e6 : 150);
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        now = performance.now();
        if (id === 'task') newMapTask();
        else if (id === 'route') ctx.set({ r: !p.r });
        else if (id === 'go') {
          revealed = true;
          if (mode() === 'map') chainAt = now + (reduced ? -1e6 : 100);
          else calcAt = now - 250;
        } else if (id === 'ctask') {
          const t = randomCalcTask(Math.random, p.cq as Sought);
          revealed = false;
          ctx.set({ cm: t.mapMm / 10, rw: realUmFromMapMm(t.mapMm, t.n) / UM.m, cs: String(t.n) });
          calcAt = now + (reduced ? -1e6 : 150);
        } else if (id === 'zin' || id === 'zout') {
          const zi = ZOOM_SCALES.indexOf(Number(p.z) as (typeof ZOOM_SCALES)[number]);
          const ni = clamp(zi + (id === 'zin' ? 1 : -1), 0, ZOOM_SCALES.length - 1);
          ctx.set({ z: String(ZOOM_SCALES[ni]) });
        }
        updateReadouts();
        updateActions();
        ctx.requestRender();
      },

      render() {
        now = performance.now();
        const sized = !geo || geo.W !== surface.width || geo.H !== surface.height;
        if (sized) {
          geo = computeGeo();
          if (needIntro) {
            needIntro = false;
            intro();
          } else if (mode() === 'map') aimCamera(0, true);
        }
        hits = [];
        surface.begin();
        const gm = geo!;
        const m = mode();
        let cards: CardSpec[];
        if (m === 'map') {
          drawMapScene(gm);
          cards = mapCards();
        } else if (m === 'zoom') {
          drawZoomScene(gm);
          cards = zoomCards();
        } else {
          drawCalcScene(gm);
          cards = calcCards();
        }
        const g = surface.g;
        g.save();
        g.globalAlpha = sceneA();
        drawCards(gm.panel, cards, !gm.wide);
        g.restore();
        let busy = now - sceneStart < 600;
        if (m === 'map') busy = busy || logN.busy(now) || camX.busy(now) || camY.busy(now) || mmShown.busy(now) || now < rulerAt + 1000 || chainBusy(chainAt, 5) || now < routeAt + 2600 || note !== null;
        else if (m === 'zoom') busy = busy || zLog.busy(now) || ppcZ.busy(now) || now < objAt + 600 || chainBusy(zChainAt, 4);
        else busy = busy || now < calcAt + 2200;
        if (busy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
