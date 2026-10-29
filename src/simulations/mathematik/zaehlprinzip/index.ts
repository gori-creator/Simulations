import { defineSimulation, ease, prefersReducedMotion, roundRect, scaledSprite, shade, Surface, text, type Rect } from '../../../sim-core';
import { drawIcon, type IconKind, type IconStyle } from './icons';
import {
  childOptions,
  groupDigits,
  independentPlan,
  pathKey,
  pathsBelow,
  pathsWithPrefix,
  poolPlan,
  stageCounts,
  visibleTree,
  type Plan,
  type TreeNode,
  type VisibleTree,
} from './model';

const L = (de: string, en: string) => ({ de, en });
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

type Sit = 'outfit' | 'eis' | 'pin' | 'menu' | 'podest';
type View = 'baum' | 'liste';
/** Was die Farben der Gegenstände vom Theme brauchen. */
interface Theme {
  dark: boolean;
  text: string;
  series: readonly string[];
}

/* ------------------------------------------------------------------ */
/* Sachsituationen                                                     */
/* ------------------------------------------------------------------ */

interface ItemDef {
  de: string;
  en: string;
  icon: IconKind;
  color: (t: Theme) => string;
  label?: string;
}

const fixed = (c: string) => () => c;
const ser = (i: number) => (t: Theme) => t.series[i] ?? t.text;

const PANTS: ItemDef[] = [
  { de: 'Jeans', en: 'jeans', icon: 'pants', color: fixed('#41639b') },
  { de: 'schwarze Hose', en: 'black trousers', icon: 'pants', color: (t) => (t.dark ? '#50545f' : '#30333a') },
  { de: 'beige Hose', en: 'beige trousers', icon: 'pants', color: fixed('#c9ab7c') },
  { de: 'grüne Hose', en: 'green trousers', icon: 'pants', color: fixed('#5f7d4c') },
];
const SHIRTS: ItemDef[] = [
  { de: 'rotes T-Shirt', en: 'red T-shirt', icon: 'shirt', color: ser(1) },
  { de: 'weißes T-Shirt', en: 'white T-shirt', icon: 'shirt', color: (t) => (t.dark ? '#e4e6ea' : '#f7f7f5') },
  { de: 'grünes T-Shirt', en: 'green T-shirt', icon: 'shirt', color: ser(2) },
  { de: 'oranges T-Shirt', en: 'orange T-shirt', icon: 'shirt', color: ser(3) },
  { de: 'lila T-Shirt', en: 'purple T-shirt', icon: 'shirt', color: ser(4) },
];
const HATS: ItemDef[] = [
  { de: 'gelbe Mütze', en: 'yellow hat', icon: 'hat', color: fixed('#e7b52a') },
  { de: 'türkise Mütze', en: 'turquoise hat', icon: 'hat', color: ser(5) },
  { de: 'graue Mütze', en: 'grey hat', icon: 'hat', color: fixed('#8e949d') },
  { de: 'blaue Mütze', en: 'blue hat', icon: 'hat', color: ser(0) },
];
const FLAVOURS: ItemDef[] = [
  { de: 'Vanille', en: 'vanilla', icon: 'scoop', color: fixed('#f1df9e') },
  { de: 'Schokolade', en: 'chocolate', icon: 'scoop', color: fixed('#7d4b2c') },
  { de: 'Erdbeere', en: 'strawberry', icon: 'scoop', color: fixed('#ee879f') },
  { de: 'Pistazie', en: 'pistachio', icon: 'scoop', color: fixed('#9cc46e') },
  { de: 'Mango', en: 'mango', icon: 'scoop', color: fixed('#f4a640') },
  { de: 'Heidelbeere', en: 'blueberry', icon: 'scoop', color: fixed('#6d5fb8') },
];
const DIGITS: ItemDef[] = Array.from({ length: 10 }, (_, i) => ({ de: String(i), en: String(i), icon: 'key' as const, color: (t: Theme) => t.text, label: String(i) }));
const STARTERS: ItemDef[] = [
  { de: 'Tomatensuppe', en: 'tomato soup', icon: 'soup', color: fixed('#e0703a') },
  { de: 'Salat', en: 'salad', icon: 'salad', color: fixed('#7fb35a') },
  { de: 'Tomate-Mozzarella', en: 'tomato & mozzarella', icon: 'caprese', color: fixed('#d8402f') },
];
const MAINS: ItemDef[] = [
  { de: 'Pizza', en: 'pizza', icon: 'pizza', color: fixed('#e3a33b') },
  { de: 'Nudeln', en: 'pasta', icon: 'pasta', color: fixed('#e9c45a') },
  { de: 'Fisch', en: 'fish', icon: 'fish', color: fixed('#7f9cc0') },
  { de: 'Burger', en: 'burger', icon: 'burger', color: fixed('#d58c3f') },
];
const DESSERTS: ItemDef[] = [
  { de: 'Eisbecher', en: 'sundae', icon: 'icecup', color: fixed('#f2b6c8') },
  { de: 'Kuchen', en: 'cake', icon: 'cake', color: fixed('#c98b55') },
  { de: 'Obstsalat', en: 'fruit salad', icon: 'fruit', color: fixed('#e8574c') },
];
const RUNNERS: ItemDef[] = ['Anna', 'Ben', 'Cem', 'Dana', 'Emil', 'Finn', 'Greta', 'Hana'].map((name, i) => ({
  de: name,
  en: name,
  icon: 'runner' as const,
  color: i < 6 ? ser(i) : fixed(i === 6 ? '#8d6e63' : '#546e7a'),
  label: name[0],
}));

function stageItems(sit: Sit, stage: number): ItemDef[] {
  switch (sit) {
    case 'outfit':
      return [PANTS, SHIRTS, HATS][stage] ?? HATS;
    case 'menu':
      return [STARTERS, MAINS, DESSERTS][stage] ?? DESSERTS;
    case 'eis':
      return FLAVOURS;
    case 'pin':
      return DIGITS;
    default:
      return RUNNERS;
  }
}

const ord = (n: number) => `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}`;

/**
 * Zählprinzip und Baumdiagramm: Auswahlvorgänge in Stufen (Outfit, Eistüte,
 * Zahlenschloss, Menü, Siegerpodest). Das Baumdiagramm wächst Stufe für Stufe,
 * jeder Pfad ist ein Ergebnis-Kärtchen; die Anzahl ist das Produkt der
 * Anzahlen je Stufe. Mit/ohne Wiederholung, Fakultät, systematische Tabelle.
 */
export default defineSimulation({
  id: 'zaehlprinzip',
  layout: { aspect: 1.55, aspectNarrow: 0.5 },
  groups: [{ id: 'view', label: L('Anzeige', 'Display') }],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'outfit', label: L('Outfits', 'Outfits') },
        { value: 'eis', label: L('Eistüte', 'Ice-cream cone') },
        { value: 'pin', label: L('Zahlenschloss', 'Combination lock') },
        { value: 'menu', label: L('Menü', 'Menu') },
        { value: 'podest', label: L('Siegerpodest', 'Winners’ podium') },
      ],
      default: 'outfit',
    },
    { key: 'a', type: 'number', label: L('Hosen', 'Trousers'), min: 1, max: 4, step: 1, default: 3, visibleIf: (v) => v.sit === 'outfit' },
    { key: 'b', type: 'number', label: L('T-Shirts', 'T-shirts'), min: 1, max: 5, step: 1, default: 4, visibleIf: (v) => v.sit === 'outfit' },
    { key: 'c', type: 'number', label: L('Mützen', 'Hats'), min: 1, max: 4, step: 1, default: 2, visibleIf: (v) => v.sit === 'outfit' },
    { key: 'n', type: 'number', label: L('Sorten', 'Flavours'), min: 2, max: 6, step: 1, default: 4, visibleIf: (v) => v.sit === 'eis' },
    { key: 'k', type: 'number', label: L('Kugeln', 'Scoops'), min: 1, max: 4, step: 1, default: 2, visibleIf: (v) => v.sit === 'eis' },
    { key: 'z', type: 'number', label: L('Ziffern zur Auswahl', 'Digits to choose from'), min: 2, max: 10, step: 1, default: 10, visibleIf: (v) => v.sit === 'pin', help: L('Bei 10 Ziffern: 0 bis 9.', 'With 10 digits: 0 to 9.') },
    { key: 's', type: 'number', label: L('Stellen', 'Positions'), min: 1, max: 5, step: 1, default: 4, visibleIf: (v) => v.sit === 'pin' },
    { key: 'v', type: 'number', label: L('Vorspeisen', 'Starters'), min: 1, max: 3, step: 1, default: 2, visibleIf: (v) => v.sit === 'menu' },
    { key: 'h', type: 'number', label: L('Hauptgerichte', 'Main courses'), min: 1, max: 4, step: 1, default: 3, visibleIf: (v) => v.sit === 'menu' },
    { key: 'd', type: 'number', label: L('Nachtische', 'Desserts'), min: 1, max: 3, step: 1, default: 2, visibleIf: (v) => v.sit === 'menu' },
    { key: 'l', type: 'number', label: L('Läuferinnen und Läufer', 'Runners'), min: 2, max: 8, step: 1, default: 8, visibleIf: (v) => v.sit === 'podest' },
    {
      key: 'p',
      type: 'number',
      label: L('Plätze', 'Places'),
      min: 1,
      max: 8,
      step: 1,
      default: 3,
      visibleIf: (v) => v.sit === 'podest',
      help: L('So viele Plätze wie Läufer: alle in eine Reihenfolge bringen.', 'As many places as runners: put them all in order.'),
    },
    {
      key: 'rep',
      type: 'boolean',
      label: L('mit Wiederholung', 'with repetition'),
      help: L('Darf dieselbe Sorte bzw. Ziffer mehrmals vorkommen?', 'May the same flavour or digit occur more than once?'),
      default: true,
      visibleIf: (v) => v.sit === 'eis' || v.sit === 'pin',
    },
    {
      key: 'view',
      type: 'choice',
      group: 'view',
      label: L('Darstellung', 'Representation'),
      options: [
        { value: 'baum', label: L('Baumdiagramm', 'Tree diagram') },
        { value: 'liste', label: L('Tabelle (systematisch)', 'Table (systematic)') },
      ],
      default: 'baum',
    },
    { key: 'show', type: 'boolean', group: 'view', label: L('Anzahl anzeigen', 'Show the number'), default: true },
  ],
  images: { cone: 'waffel.webp', lock: 'zahlenschloss.webp', pants: 'hose.webp', shirt: 't-shirt.webp', hat: 'muetze.webp' },
  actions: [
    { id: 'walk', label: L('Alle Pfade ablaufen', 'Walk all paths'), primary: true },
    { id: 'grow', label: L('Neu wachsen lassen', 'Grow again') },
  ],
  readouts: [
    { key: 'stages', label: L('Möglichkeiten je Stufe', 'Choices per stage') },
    { key: 'count', label: L('Zählprinzip', 'Counting principle'), spoiler: true },
    { key: 'formula', label: L('Kurz geschrieben', 'In short'), spoiler: true },
    { key: 'sel', label: L('Gewählter Pfad', 'Chosen path') },
  ],
  resultsParam: 'show',
  presets: [
    { id: 'start', label: L('Outfits: 3 · 4 · 2', 'Outfits: 3 · 4 · 2'), values: {} },
    { id: 'eis', label: L('Eistüte: 3 verschiedene Sorten', 'Cone: 3 different flavours'), values: { sit: 'eis', n: 4, k: 3, rep: false } },
    { id: 'pin', label: L('PIN mit 4 Ziffern', '4-digit PIN'), values: { sit: 'pin' } },
    { id: 'podest', label: L('Podest bei 8 Läufern', 'Podium with 8 runners'), values: { sit: 'podest' } },
    { id: 'fak', label: L('5 Läufer, alle Plätze: 5!', '5 runners, all places: 5!'), values: { sit: 'podest', l: 5, p: 5 } },
    { id: 'table', label: L('Menü als Tabelle', 'Menu as a table'), values: { sit: 'menu', view: 'liste' } },
  ],
  strings: {
    de: {
      canvas: 'Baumdiagramm, das Stufe für Stufe wächst, daneben alle Ergebnisse als Kärtchen und die Anzahl als Produkt',
      start: 'Start',
      paths: 'Pfade',
      path1: 'Pfad',
      results: 'Ergebnisse',
      more: '… und {n} weitere',
      moreAny: '… und weitere',
      hint: 'Tippe auf einen Pfad im Baum oder auf ein Kärtchen.',
      hintList: 'Jede Zeile beginnt mit derselben Wahl in der 1. Stufe.',
      pathOf: 'Pfad {i} von {n}',
      pathNo: 'Pfad {i}',
      prefix: '{n} {noun} beginnen so',
      prefixAny: 'Alle Pfade, die so beginnen',
      prefixOne: 'Nur 1 {noun} beginnt so',
      walked: 'Alle {n} gezeichneten Pfade abgelaufen.',
      walkedAll: 'Alle {n} Pfade abgelaufen – jeder ist ein anderes Ergebnis.',
      capIndep: 'Zählprinzip: Die Anzahlen der Stufen werden multipliziert.',
      capIndepShort: 'Anzahlen der Stufen multiplizieren',
      capRep: '{k} Stufen mit je {n} Möglichkeiten: ',
      capRepShort: 'je {n} Möglichkeiten: ',
      capNoRep: 'Ohne Wiederholung: Jede Stufe hat eine Möglichkeit weniger.',
      capNoRepShort: 'ohne Wiederholung: jede Stufe eine weniger',
      capFact: 'Alle {n} in eine Reihenfolge bringen: ',
      capFactShort: 'alle {n} anordnen: ',
      capFactTail: ' (Fakultät)',
      capNone: 'Mehr Stufen als Möglichkeiten – es bleibt nichts übrig.',
      rows: 'Zeilen',
      perRow: 'je Zeile',
      impossible: 'Nicht möglich: In einer Stufe ist keine Möglichkeit mehr übrig.',
      listCap: 'Systematisch: zuerst nach der 1. Stufe ordnen, dann jede Zeile der Reihe nach.',
      listCapShort: 'zuerst nach der 1. Stufe ordnen',
    },
    en: {
      canvas: 'Tree diagram growing stage by stage, next to it all outcomes as cards and the number as a product',
      start: 'Start',
      paths: 'paths',
      path1: 'path',
      results: 'Outcomes',
      more: '… and {n} more',
      moreAny: '… and more',
      hint: 'Tap a path in the tree or a card.',
      hintList: 'Each row starts with the same choice in stage 1.',
      pathOf: 'Path {i} of {n}',
      pathNo: 'Path {i}',
      prefix: '{n} {noun} start like this',
      prefixAny: 'All paths that start like this',
      prefixOne: 'Only 1 {noun} starts like this',
      walked: 'Walked all {n} paths drawn.',
      walkedAll: 'Walked all {n} paths – each one is a different outcome.',
      capIndep: 'Counting principle: multiply the numbers of choices.',
      capIndepShort: 'multiply the numbers of choices',
      capRep: '{k} stages with {n} choices each: ',
      capRepShort: '{n} choices each: ',
      capNoRep: 'Without repetition: each stage has one choice fewer.',
      capNoRepShort: 'without repetition: one fewer each time',
      capFact: 'Put all {n} in order: ',
      capFactShort: 'order all {n}: ',
      capFactTail: ' (factorial)',
      capNone: 'More stages than choices – nothing is left.',
      rows: 'rows',
      perRow: 'per row',
      impossible: 'Not possible: one stage has no choice left.',
      listCap: 'Systematic: sort by stage 1 first, then go through each row in order.',
      listCapShort: 'sort by stage 1 first',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const lang = ctx.lang;
    const reduced = prefersReducedMotion();
    const T = (de: string, en: string) => (lang === 'de' ? de : en);
    const tr = (key: string, vars: Record<string, string | number> = {}) => ctx.t(key).replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ''));
    const num = (n: number) => groupDigits(n, lang);
    const alpha = (c: string, a: number) => shade(c, 0, a);
    const sit = () => p.sit as Sit;
    const view = () => p.view as View;
    const dur = (ms: number) => (reduced ? 0 : ms);
    const pin0 = () => p.sit === 'pin';

    /** Zeitkonstanten der Animationen (ms). */
    const EDGE = 380;
    const POP = 420;
    const LEVEL = 430;
    const DIE = 520;

    /* ---------------- Plan und Texte ---------------- */
    function makePlan(): Plan {
      switch (sit()) {
        case 'outfit':
          return independentPlan([p.a, p.b, p.c]);
        case 'menu':
          return independentPlan([p.v, p.h, p.d]);
        case 'eis':
          return poolPlan(p.n, p.k, p.rep);
        case 'pin':
          return poolPlan(p.z, p.s, p.rep);
        default:
          return poolPlan(p.l, p.p, false);
      }
    }

    function stageName(i: number, short = false): string {
      const s = sit();
      if (s === 'outfit') return [T('Hose', 'Trousers'), T('T-Shirt', 'T-shirt'), T('Mütze', 'Hat')][i] ?? '';
      if (s === 'menu') return [T('Vorspeise', 'Starter'), T('Hauptgang', 'Main'), T('Nachtisch', 'Dessert')][i] ?? '';
      if (short) return lang === 'de' ? `${i + 1}.` : ord(i + 1);
      const word = s === 'eis' ? T('Kugel', 'scoop') : s === 'pin' ? T('Ziffer', 'digit') : T('Platz', 'place');
      return lang === 'de' ? `${i + 1}. ${word}` : `${ord(i + 1)} ${word}`;
    }

    function noun(count: number): string {
      const one = count === 1;
      switch (sit()) {
        case 'outfit':
          return one ? 'Outfit' : 'Outfits';
        case 'menu':
          return T(one ? 'Menü' : 'Menüs', one ? 'menu' : 'menus');
        case 'eis':
          return T(one ? 'Eistüte' : 'Eistüten', one ? 'cone' : 'cones');
        case 'pin':
          return T(one ? 'Code' : 'Codes', one ? 'code' : 'codes');
        default:
          return T(one ? 'Reihenfolge' : 'Reihenfolgen', one ? 'ranking' : 'rankings');
      }
    }

    const itemOf = (stage: number, idx: number): ItemDef => stageItems(sit(), stage)[idx] ?? stageItems(sit(), stage)[0]!;
    const itemName = (stage: number, idx: number) => itemOf(stage, idx)[lang];

    const iconStyle = (label?: string): IconStyle => ({ dark: ctx.theme.dark, font: ctx.theme.font, ink: ctx.theme.text, paper: ctx.theme.bg, label });

    function icon(stage: number, idx: number, x: number, y: number, s: number, contour = true): void {
      const it = itemOf(stage, idx);
      drawItem(surface.g, it.icon, it.color(ctx.theme), x, y, s, iconStyle(it.label), contour);
    }

    /* Kleidung als Foto (hellgrau, eingefärbt); ohne Foto die gezeichneten Symbole */
    const CLOTHES: readonly IconKind[] = ['pants', 'shirt', 'hat'];
    const clothCache = new Map<string, HTMLCanvasElement>();

    /**
     * Einmal je Kleidungsstück und Farbe in fester Größe einfärben: Jedes Pixel
     * bekommt die Zielfarbe, mal seiner Helligkeit relativ zum Mittel des Fotos.
     * So bleiben Falten und Strickmuster erhalten, und auch eine schwarze Hose
     * wird wirklich dunkel (anders als beim Mischmodus „color“).
     */
    function clothSprite(kind: IconKind, color: string): HTMLCanvasElement | null {
      if (!CLOTHES.includes(kind)) return null;
      const img = ctx.images.get(kind);
      if (!img) return null;
      const key = `${kind}|${color}`;
      const hit = clothCache.get(key);
      if (hit) return hit;
      const k = 192 / Math.max(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * k);
      canvas.height = Math.round(img.naturalHeight * k);
      const c = canvas.getContext('2d', { willReadFrequently: true })!;
      c.fillStyle = color;
      c.fillRect(0, 0, 1, 1);
      const [cr, cg, cb] = c.getImageData(0, 0, 1, 1).data;
      c.clearRect(0, 0, 1, 1);
      c.imageSmoothingQuality = 'high';
      c.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = c.getImageData(0, 0, canvas.width, canvas.height);
      const p = data.data;
      let sum = 0;
      let n = 0;
      for (let i = 0; i < p.length; i += 4) {
        if (p[i + 3]! < 128) continue;
        sum += 0.3 * p[i]! + 0.59 * p[i + 1]! + 0.11 * p[i + 2]!;
        n++;
      }
      const mean = n ? sum / n : 1;
      for (let i = 0; i < p.length; i += 4) {
        const l = (0.3 * p[i]! + 0.59 * p[i + 1]! + 0.11 * p[i + 2]!) / mean;
        p[i] = Math.min(255, cr! * l);
        p[i + 1] = Math.min(255, cg! * l);
        p[i + 2] = Math.min(255, cb! * l);
      }
      c.putImageData(data, 0, 0);
      clothCache.set(key, canvas);
      return canvas;
    }

    function drawItem(g: CanvasRenderingContext2D, kind: IconKind, color: string, x: number, y: number, s: number, st: IconStyle, contour = true): void {
      const sprite = clothSprite(kind, color);
      if (!sprite) {
        drawIcon(g, kind, color, x, y, s, st);
        return;
      }
      const k = (s * 0.92) / Math.max(sprite.width, sprite.height);
      const w = sprite.width * k;
      const h = sprite.height * k;
      g.save();
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = 'high';
      // feiner Rand als Schatten: weißes T-Shirt auf Weiß, schwarze Hose im Dunkeln
      if (contour) {
        g.shadowOffsetX = 0;
        g.shadowOffsetY = 0;
        g.shadowColor = ctx.theme.dark ? 'rgba(255,255,255,0.35)' : 'rgba(16,24,40,0.6)';
        g.shadowBlur = Math.max(1.5, s * 0.05);
      }
      g.drawImage(sprite, x - w / 2, y - h / 2, w, h);
      g.restore();
    }

    /* ---------------- Zustand ---------------- */
    let plan = makePlan();
    let counts = stageCounts(plan);
    let tree: VisibleTree = visibleTree(plan, 30);
    let epoch = 1;
    let structureDirty = true;
    let lastW = 0;
    let lastH = 0;
    let lastFrame = performance.now();

    /** Ausgewählter (Teil-)Pfad. */
    let sel: number[] | null = null;
    let selStart = -1e9;
    let hover: string | null = null;
    /** Ablaufen aller Pfade. */
    let walking = false;
    let walkStart = 0;
    let walkStep = 400;
    let walkIdx = -1;
    let walkDone = -1e9;
    const visited = new Set<string>();

    /** Weiche Zahl (zählt zum Ziel). */
    class Smooth {
      v: number;
      target: number;
      from: number;
      at = 0;
      ms = 900;
      pulse = -1e9;
      constructor(v: number) {
        this.v = v;
        this.target = v;
        this.from = v;
      }
      set(t: number, at: number): void {
        if (t === this.target) return;
        this.from = this.v;
        this.target = t;
        this.at = at;
        // große Sprünge etwas länger zählen lassen
        this.ms = Math.abs(t - this.v) > 200 ? 1300 : Math.abs(t - this.v) > 3 ? 950 : 600;
        if (reduced) this.v = t;
      }
      step(_dt: number, now: number): boolean {
        if (this.v === this.target) return false;
        if (now < this.at) return true;
        const u = clamp((now - this.at) / this.ms, 0, 1);
        this.v = this.from + (this.target - this.from) * ease.outCubic(u);
        if (u >= 1 || reduced) {
          this.v = this.target;
          this.pulse = now;
        }
        return true;
      }
      get shown(): number {
        return Math.round(this.v);
      }
    }
    const prodS = new Smooth(0);
    let pillS: Smooth[] = [];
    let rowsS = new Smooth(0);
    let perRowS = new Smooth(0);

    /* ---------------- Geometrie ---------------- */
    interface Geo {
      wide: boolean;
      tree: Rect;
      body: Rect;
      headY: number;
      pillY: number;
      capY: number;
      colX: number[];
      panel: Rect;
      spot: Rect;
      gridHead: number;
      grid: Rect;
      list: Rect;
    }
    let geo: Geo;

    function computeGeo(): Geo {
      const W = surface.width;
      const H = surface.height;
      const wide = W >= 640 || W >= H * 1.3;
      const g = surface.g;
      const treeR: Rect = wide ? { x: 6, y: 6, w: Math.round(W * 0.57) - 10, h: H - 12 } : { x: 4, y: 4, w: W - 8, h: Math.round(H * 0.57) };
      const panel: Rect = wide ? { x: treeR.x + treeR.w + 10, y: 6, w: W - treeR.w - 22, h: H - 12 } : { x: 4, y: treeR.y + treeR.h + 8, w: W - 8, h: H - treeR.h - 16 };
      const footer = wide ? 66 : 58;
      const body: Rect = { x: treeR.x, y: treeR.y + 32, w: treeR.w, h: treeR.h - 32 - footer };
      const pillY = body.y + body.h + 22;
      const capY = pillY + (wide ? 30 : 27);
      // Spalten: Start links, letzte Stufe so weit rechts, dass „= 10 000“ daneben passt
      const k = counts.length;
      g.font = `800 ${wide ? 22 : 18}px ${ctx.theme.font}`;
      const prodW = g.measureText(`= ${p.show ? num(tree.total) : '?'}`).width;
      const rootX = treeR.x + (wide ? 26 : 18);
      const lastX = treeR.x + treeR.w - Math.max(prodW + 32, 34);
      const colX = Array.from({ length: k + 1 }, (_, i) => (k ? rootX + ((lastX - rootX) * i) / k : rootX));
      const spotH = wide ? clamp(panel.h * 0.32, 112, 150) : 100;
      const spot: Rect = { x: panel.x + 8, y: panel.y + 8, w: panel.w - 16, h: spotH };
      const gridHead = spot.y + spot.h + (wide ? 22 : 18);
      const grid: Rect = { x: panel.x + 10, y: gridHead + 14, w: panel.w - 20, h: panel.y + panel.h - gridHead - 22 };
      const list: Rect = { x: 6, y: 6, w: W - 12, h: H - 12 };
      return { wide, tree: treeR, body, headY: treeR.y + 15, pillY, capY, colX, panel, spot, gridHead, grid, list };
    }

    /* ---------------- Animierte Knoten und Kärtchen ---------------- */
    interface NodeAnim {
      node: TreeNode;
      parent: string | null;
      x: number;
      y: number;
      tx: number;
      ty: number;
      r: number;
      tr: number;
      born: number;
      dead: number;
      vy: number;
    }
    interface CardAnim {
      key: string;
      path: number[];
      kind: 'card' | 'more' | 'rowmore';
      label: string;
      x: number;
      y: number;
      w: number;
      h: number;
      tx: number;
      ty: number;
      tw: number;
      th: number;
      s: number;
      ts: number;
      born: number;
      dead: number;
      index: number;
    }
    const nodes = new Map<string, NodeAnim>();
    const cards = new Map<string, CardAnim>();
    const ek = (key: string) => `${epoch}|${key}`;
    const levelBorn: number[] = [];
    let treeAlpha = view() === 'baum' ? 1 : 0;
    let growStart = performance.now() + dur(150);
    let listRows: { y: number; h: number; prefix: number; count: number }[] = [];

    /** Zielpositionen der Baumknoten. */
    function layoutTree(): Map<string, { x: number; y: number; r: number }> {
      const pos = new Map<string, { x: number; y: number; r: number }>();
      const rows = Math.max(1, tree.rows);
      const rowH = Math.min(geo.wide ? 56 : 46, geo.body.h / rows);
      const top = geo.body.y + (geo.body.h - rowH * rows) / 2;
      const ys = new Map<string, number>();
      const yOf = (n: TreeNode): number => {
        const known = ys.get(n.key);
        if (known !== undefined) return known;
        let y: number;
        if (n.row >= 0) y = top + (n.row + 0.5) * rowH;
        else if (n.children.length) {
          const first = tree.byKey.get(n.children[0]!)!;
          const last = tree.byKey.get(n.children[n.children.length - 1]!)!;
          y = (yOf(first) + yOf(last)) / 2;
        } else y = top + rowH / 2;
        ys.set(n.key, y);
        return y;
      };
      // Radius je Stufe aus dem kleinsten Abstand benachbarter Knoten
      const byLevel = new Map<number, number[]>();
      for (const n of tree.nodes) {
        const list = byLevel.get(n.level) ?? [];
        list.push(yOf(n));
        byLevel.set(n.level, list);
      }
      const colW = geo.colX.length > 1 ? geo.colX[1]! - geo.colX[0]! : 80;
      const rMax = geo.wide ? 19 : 15;
      const radius = new Map<number, number>();
      byLevel.forEach((list, level) => {
        list.sort((a, b) => a - b);
        let gap = Infinity;
        for (let i = 1; i < list.length; i++) gap = Math.min(gap, list[i]! - list[i - 1]!);
        if (!Number.isFinite(gap)) gap = rowH * 2;
        radius.set(level, level === 0 ? clamp(Math.min(gap * 0.4, 8), 5, 8) : clamp(Math.min(gap * 0.44, colW * 0.3, rMax), 3.5, rMax));
      });
      for (const n of tree.nodes) pos.set(n.key, { x: geo.colX[n.level] ?? geo.colX[geo.colX.length - 1]!, y: yOf(n), r: radius.get(n.level) ?? 6 });
      return pos;
    }

    function syncTree(now: number, snap: boolean): void {
      const pos = layoutTree();
      const seen = new Set<string>();
      for (const n of tree.nodes) {
        const key = ek(n.key);
        seen.add(key);
        const t = pos.get(n.key)!;
        let a = nodes.get(key);
        if (!a || a.dead) {
          const parent = n.parent === null ? null : ek(n.parent);
          const pa = parent ? nodes.get(parent) : undefined;
          const siblings = pa ? pa.node.children.length : 1;
          const idx = pa ? Math.max(0, pa.node.children.indexOf(n.key)) : 0;
          const step = Math.min(45, 320 / Math.max(1, siblings));
          const base = n.parent === null ? Math.max(now, growStart) : Math.max(now, (pa?.born ?? now) + LEVEL);
          const born = reduced ? -1e9 : base + idx * step;
          if (a && a.dead) {
            a.dead = 0;
            a.vy = 0;
            a.y = t.y;
            a.born = Math.min(a.born, now - EDGE - POP);
          } else a = { node: n, parent, x: t.x, y: t.y, tx: t.x, ty: t.y, r: t.r, tr: t.r, born, dead: 0, vy: 0 };
          nodes.set(key, a);
        }
        a.node = n;
        a.tx = t.x;
        a.ty = t.y;
        a.tr = t.r;
        if (snap || reduced) {
          a.x = t.x;
          a.y = t.y;
          a.r = t.r;
        }
      }
      nodes.forEach((a, key) => {
        if (!seen.has(key) && !a.dead) a.dead = reduced ? now - DIE : now;
      });
      levelBorn.length = 0;
      nodes.forEach((a) => {
        if (a.dead) return;
        const L0 = a.node.level;
        levelBorn[L0] = Math.min(levelBorn[L0] ?? Infinity, a.born);
      });
    }

    /** Raster für Kärtchen: größtes Symbol, bei dem `n` Kärtchen in die Fläche passen. */
    function fitGrid(area: Rect, n: number, k: number, maxS: number, minS: number): { cols: number; rows: number; s: number; cw: number; ch: number; gap: number; cap: number } {
      const gap = 6;
      let best = { cols: 1, rows: 1, s: minS, cw: 0, ch: 0, gap, cap: 1 };
      for (let s = maxS; s >= minS; s -= 0.5) {
        const cw = k * s + (k - 1) * s * 0.1 + 14;
        const ch = s + 12;
        const cols = Math.max(1, Math.floor((area.w + gap) / (cw + gap)));
        const rows = Math.max(1, Math.floor((area.h + gap) / (ch + gap)));
        best = { cols, rows, s, cw, ch, gap, cap: cols * rows };
        if (cols * rows >= n) break;
      }
      return best;
    }

    function cardTargets(now: number): Map<string, { path: number[]; kind: CardAnim['kind']; label: string; x: number; y: number; w: number; h: number; s: number; born: number; index: number }> {
      const out = new Map<string, { path: number[]; kind: CardAnim['kind']; label: string; x: number; y: number; w: number; h: number; s: number; born: number; index: number }>();
      const k = counts.length;
      if (tree.total === 0 || k === 0) {
        listRows = [];
        return out;
      }
      if (view() === 'baum') {
        const R = geo.grid;
        const leaves = tree.leaves;
        const hiddenAll = tree.total - leaves.length;
        const want = leaves.length + (hiddenAll > 0 ? 1 : 0);
        const fg = fitGrid(R, want, k, geo.wide ? 30 : 24, 9);
        const shown = fg.cap >= want ? leaves.length : Math.max(0, fg.cap - 1);
        const hidden = tree.total - shown;
        const total = shown + (hidden > 0 ? 1 : 0);
        const usedRows = Math.ceil(total / fg.cols);
        const gw = Math.min(total, fg.cols) * (fg.cw + fg.gap) - fg.gap;
        const x0 = R.x + (R.w - gw) / 2;
        const y0 = R.y + Math.max(0, Math.min((R.h - usedRows * (fg.ch + fg.gap)) / 2, 6));
        for (let i = 0; i < total; i++) {
          const x = x0 + (i % fg.cols) * (fg.cw + fg.gap);
          const y = y0 + Math.floor(i / fg.cols) * (fg.ch + fg.gap);
          if (i < shown) {
            const path = leaves[i]!;
            const leaf = nodes.get(ek(pathKey(path)));
            const born = leaf ? leaf.born + EDGE + POP * 0.55 + 40 : now + i * 25;
            out.set(ek(pathKey(path)), { path, kind: 'card', label: '', x, y, w: fg.cw, h: fg.ch, s: fg.s, born, index: i });
          } else {
            const last = nodes.get(ek(pathKey(leaves[leaves.length - 1] ?? [])));
            out.set(ek('+'), { path: [], kind: 'more', label: p.show ? `${tr('more', { n: num(hidden) })}|+ ${num(hidden)}` : `${ctx.t('moreAny')}|+ …`, x, y, w: Math.max(fg.cw, Math.min(R.x + R.w - x, 150)), h: fg.ch, s: fg.s, born: (last?.born ?? now) + EDGE + POP + 120, index: i });
          }
        }
        listRows = [];
        return out;
      }
      // Tabelle: eine Zeile je Wahl in der 1. Stufe
      const R = geo.list;
      const first = childOptions(plan, []);
      const top = R.y + 34;
      const bottom = R.y + R.h - (geo.wide ? 58 : 54);
      const rowH = (bottom - top) / Math.max(1, first.length);
      const headW = geo.wide ? 150 : 46;
      const tailW = geo.wide ? 50 : 36;
      const perRow = pathsBelow(plan, 1);
      listRows = [];
      let index = 0;
      first.forEach((o, r) => {
        const y = top + r * rowH;
        const area: Rect = { x: R.x + headW, y: y + 4, w: R.w - headW - tailW, h: rowH - 8 };
        const fg = fitGrid(area, perRow, k, geo.wide ? 28 : 22, 9);
        if (fg.cols < perRow && fg.cap >= perRow) {
          // Spaltenzahl so wählen, dass die Zeile aufgeht (z. B. 8 = 2 · 4 statt 5 + 3)
          for (let c = fg.cols; c >= Math.max(2, Math.ceil(fg.cols * 0.55)); c--) {
            if (perRow % c === 0 && Math.ceil(perRow / c) <= fg.rows) {
              fg.cols = c;
              break;
            }
          }
        }
        const shown = fg.cap >= perRow ? perRow : Math.max(0, fg.cap - 1);
        const paths = pathsWithPrefix(plan, [o], shown);
        const total = shown + (shown < perRow ? 1 : 0);
        const usedRows = Math.ceil(total / fg.cols);
        const y0 = area.y + (area.h - (usedRows * (fg.ch + fg.gap) - fg.gap)) / 2;
        for (let i = 0; i < total; i++) {
          const x = area.x + (i % fg.cols) * (fg.cw + fg.gap);
          const yy = y0 + Math.floor(i / fg.cols) * (fg.ch + fg.gap);
          if (i < shown) {
            const path = paths[i]!;
            out.set(ek(pathKey(path)), { path, kind: 'card', label: '', x, y: yy, w: fg.cw, h: fg.ch, s: fg.s, born: now + dur(index * 18), index: index++ });
          } else {
            const rest = perRow - shown;
            out.set(ek(`r${o}+`), { path: [o], kind: 'rowmore', label: p.show ? `+ ${num(rest)}` : '+ …', x, y: yy, w: fg.cw, h: fg.ch, s: fg.s, born: now + dur(index * 18), index: index++ });
          }
        }
        listRows.push({ y, h: rowH, prefix: o, count: perRow });
      });
      return out;
    }

    function syncCards(now: number, snap: boolean): void {
      const targets = cardTargets(now);
      targets.forEach((t, key) => {
        let c = cards.get(key);
        if (!c || c.dead) {
          const born = reduced ? -1e9 : Math.max(now, t.born);
          if (c && c.dead) {
            c.dead = 0;
            c.born = Math.min(c.born, now - 300);
          } else c = { key, path: t.path, kind: t.kind, label: t.label, x: t.x, y: t.y, w: t.w, h: t.h, tx: t.x, ty: t.y, tw: t.w, th: t.h, s: t.s, ts: t.s, born, dead: 0, index: t.index };
          cards.set(key, c);
        }
        Object.assign(c, { tx: t.x, ty: t.y, tw: t.w, th: t.h, ts: t.s, label: t.label, index: t.index, kind: t.kind, path: t.path });
        if (snap || reduced) Object.assign(c, { x: t.x, y: t.y, w: t.w, h: t.h, s: t.s });
      });
      cards.forEach((c, key) => {
        if (!targets.has(key) && !c.dead) c.dead = reduced ? now - DIE : now;
      });
    }

    function rebuild(now: number): void {
      plan = makePlan();
      counts = stageCounts(plan);
      geo = computeGeo();
      const budget = Math.max(6, Math.floor(geo.body.h / (geo.wide ? 15 : 11)));
      tree = visibleTree(plan, budget);
      geo = computeGeo();
      const snap = surface.width !== lastW || surface.height !== lastH;
      const resized = snap && lastW > 0;
      lastW = surface.width;
      lastH = surface.height;
      syncTree(now, resized);
      syncCards(now, resized);
      // Zahlen: Stufen zählen, sobald ihre Stufe wächst; das Produkt, wenn der Baum steht
      while (pillS.length < counts.length) pillS.push(new Smooth(0));
      pillS.length = counts.length;
      counts.forEach((c, i) => pillS[i]!.set(c, (levelBorn[i + 1] ?? now) + EDGE * 0.6));
      let lastBorn = now;
      nodes.forEach((a) => {
        if (!a.dead) lastBorn = Math.max(lastBorn, a.born);
      });
      prodS.set(tree.total, lastBorn + EDGE * 0.5);
      rowsS.set(counts[0] ?? 0, now);
      perRowS.set(pathsBelow(plan, 1), now);
      structureDirty = false;
    }

    /* ---------------- Auswahl ---------------- */
    const selKey = () => (sel ? pathKey(sel) : null);
    /** Zeitpunkt, ab dem Gegenstand i der großen Kombination neu erscheint. */
    const itemTime: number[] = [];
    function select(path: number[] | null): void {
      const now = performance.now();
      let changedIdx = 0;
      for (let i = 0; i < Math.max(counts.length, 1); i++) {
        if (path?.[i] !== sel?.[i] || !sel) itemTime[i] = now + changedIdx++ * 90;
      }
      sel = path;
      selStart = now;
      updateReadouts();
    }
    const isPrefix = (prefix: readonly number[], path: readonly number[]) => prefix.length <= path.length && prefix.every((v, i) => path[i] === v);

    function stopWalk(): void {
      walking = false;
      walkIdx = -1;
    }

    /* ---------------- Ergebnisse ---------------- */
    function updateReadouts(): void {
      const k = counts.length;
      const names = counts.map((c, i) => `${stageName(i)} ${c}`);
      ctx.readout('stages', k ? names.join(' · ') : '–');
      const total = tree.total;
      ctx.readout('count', { html: `${counts.join(' · ')} = <strong>${num(total)}</strong> ${noun(total)}` });
      const s = sit();
      if (s === 'outfit' || s === 'menu') ctx.readout('formula', null);
      else {
        const n = plan.options[0] ?? 0;
        if (plan.rep) ctx.readout('formula', { html: `${n}<sup>${k}</sup> = ${num(total)}` });
        else if (k === n) ctx.readout('formula', { html: `${n}! = ${counts.join(' · ')} = ${num(total)}` });
        else if (k > n) ctx.readout('formula', { html: `0 (${ctx.t('capNone')})` });
        else ctx.readout('formula', { html: `${counts.join(' · ')} = <span class="frac"><span>${n}!</span><span>${n - k}!</span></span> = ${num(total)}` });
      }
      if (sel) {
        const parts = sel.map((o, i) => itemName(i, o));
        const rest = sel.length < k ? ` → … (${p.show ? `${num(pathsBelow(plan, sel.length))} ${noun(pathsBelow(plan, sel.length))}` : '…'})` : '';
        ctx.readout('sel', `${parts.join(' → ')}${rest}`);
      } else ctx.readout('sel', '–');
    }

    /* ---------------- Zeichnen: Hilfen ---------------- */
    function wrap(value: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const rows: string[] = [];
      let cur = '';
      for (const w of value.split(' ')) {
        const next = cur ? `${cur} ${w}` : w;
        if (g.measureText(next).width > maxW && cur) {
          rows.push(cur);
          cur = w;
        } else cur = next;
      }
      if (cur) rows.push(cur);
      return rows;
    }

    /** Text in eine Breite einpassen (kleinere Schrift, sonst Ersatztext). */
    function fitFont(values: string[], maxW: number, size: number, weight = 600, min = 11): { value: string; font: string } {
      const g = surface.g;
      for (const value of values) {
        for (let s = size; s >= min; s -= 0.5) {
          const font = `${weight} ${s}px ${ctx.theme.font}`;
          g.font = font;
          if (g.measureText(value).width <= maxW) return { value, font };
        }
      }
      return { value: values[values.length - 1]!, font: `${weight} ${min}px ${ctx.theme.font}` };
    }

    function pill(x: number, y: number, label: string, color: string, a: number, scale = 1, size = 15, h = 26): number {
      const g = surface.g;
      const theme = ctx.theme;
      g.font = `800 ${size}px ${theme.font}`;
      const w = Math.max(h, g.measureText(label).width + 16) * scale;
      const hh = h * scale;
      g.save();
      g.globalAlpha = a;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.16)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, x - w / 2, y - hh / 2, w, hh, hh / 2);
      const grad = g.createLinearGradient(0, y - hh / 2, 0, y + hh / 2);
      grad.addColorStop(0, shade(color, 0.16));
      grad.addColorStop(1, shade(color, -0.08));
      g.fillStyle = grad;
      g.fill();
      g.restore();
      g.save();
      g.globalAlpha = a;
      text(g, label, x, y + 0.5, { font: `800 ${size * scale}px ${theme.font}`, color: '#ffffff' });
      g.restore();
      return w;
    }

    /** Malpunkt zwischen den Anzahlen. */
    function mulDot(x: number, y: number): void {
      const g = surface.g;
      g.beginPath();
      g.arc(x, y, geo.wide ? 2.8 : 2.4, 0, TAU);
      g.fillStyle = ctx.theme.muted;
      g.fill();
    }

    function bezierPts(x0: number, y0: number, x1: number, y1: number, t: number): [number, number][] {
      const cx = (x1 - x0) * 0.5;
      const pts: [number, number][] = [];
      const n = 16;
      for (let i = 0; i <= n; i++) {
        const u = (i / n) * t;
        const m = 1 - u;
        const bx = m * m * m * x0 + 3 * m * m * u * (x0 + cx) + 3 * m * u * u * (x1 - cx) + u * u * u * x1;
        const by = m * m * m * y0 + 3 * m * m * u * y0 + 3 * m * u * u * y1 + u * u * u * y1;
        pts.push([bx, by]);
      }
      return pts;
    }

    function strokeEdge(x0: number, y0: number, x1: number, y1: number, t: number): void {
      const g = surface.g;
      g.beginPath();
      if (t >= 1) {
        const cx = (x1 - x0) * 0.5;
        g.moveTo(x0, y0);
        g.bezierCurveTo(x0 + cx, y0, x1 - cx, y1, x1, y1);
      } else {
        const pts = bezierPts(x0, y0, x1, y1, t);
        g.moveTo(pts[0]![0], pts[0]![1]);
        for (const q of pts) g.lineTo(q[0], q[1]);
      }
      g.stroke();
    }

    /* ---------------- Zeichnen: Baum ---------------- */
    interface Hit {
      key: string;
      kind: 'node' | 'card';
      path: number[];
      x: number;
      y: number;
      w: number;
      h: number;
      round: boolean;
    }
    let hits: Hit[] = [];
    let prevHits: Hit[] = [];

    const nodeAlpha = (a: NodeAnim, now: number) => (a.dead ? clamp(1 - (now - a.dead) / DIE, 0, 1) : 1);
    const popOf = (a: NodeAnim, now: number) => clamp((now - a.born - EDGE * 0.7) / POP, 0, 1);
    const edgeOf = (a: NodeAnim, now: number) => clamp((now - a.born) / EDGE, 0, 1);

    function drawBands(now: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const k = counts.length;
      const colW = k ? geo.colX[1]! - geo.colX[0]! : 60;
      const bw = Math.min(colW * 0.86, 120);
      for (let i = 1; i <= k; i++) {
        const born = levelBorn[i] ?? deepestBorn();
        const u = reduced ? 1 : ease.outCubic(clamp((now - born + 120) / 420, 0, 1));
        if (u <= 0) continue;
        const x = geo.colX[i]!;
        g.save();
        g.globalAlpha = A * u;
        const top = geo.tree.y + 2;
        const h = geo.pillY + 16 - top;
        const grad = g.createLinearGradient(0, top, 0, top + h);
        const base = theme.text;
        grad.addColorStop(0, alpha(base, theme.dark ? 0.07 : 0.045));
        grad.addColorStop(1, alpha(base, theme.dark ? 0.03 : 0.018));
        g.fillStyle = grad;
        roundRect(g, x - bw / 2, top, bw, h, Math.min(14, bw / 3));
        g.fill();
        g.restore();
        // Stufenname
        const label = fitFont([stageName(i - 1), stageName(i - 1, true)], colW - 12, geo.wide ? 13 : 12, 700, 11);
        g.save();
        g.globalAlpha = A * u;
        text(g, label.value, x, geo.headY, { font: label.font, color: theme.muted });
        g.restore();
      }
      if (k) {
        g.save();
        g.globalAlpha = A;
        text(g, ctx.t('start'), geo.colX[0]!, geo.headY, { font: `700 ${geo.wide ? 12.5 : 11}px ${ctx.theme.font}`, color: theme.muted });
        g.restore();
      }
    }

    function drawTree(now: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const hi = theme.series[0]!;
      const sk = selKey();
      const selActive = sel !== null;
      const selT = (level: number) => (reduced ? 1 : clamp((now - selStart) / 130 - (level - 1), 0, 1));
      const inSel = (n: TreeNode) => (sel ? isPrefix(sel, n.path) || isPrefix(n.path, sel) : false);
      const onSelPath = (n: TreeNode) => (sel ? isPrefix(n.path, sel) && n.kind !== 'more' : false);
      const hoverPath = hover ? (prevHits.find((h) => h.key === hover)?.path ?? null) : null;
      // Kanten
      nodes.forEach((a) => {
        if (!a.parent) return;
        const pa = nodes.get(a.parent);
        if (!pa) return;
        const e = ease.outCubic(edgeOf(a, now));
        if (e <= 0) return;
        const al = A * Math.min(nodeAlpha(a, now), nodeAlpha(pa, now) + (a.dead ? 0 : 1));
        if (al <= 0) return;
        const x0 = pa.x + pa.r * 0.95;
        const y0 = pa.y;
        const x1 = a.x - a.r * 0.95;
        const y1 = a.y;
        const n = a.node;
        g.save();
        g.globalAlpha = al;
        g.lineCap = 'round';
        const dim = selActive && !inSel(n) && !a.dead;
        g.strokeStyle = alpha(theme.text, dim ? 0.13 : 0.28);
        g.lineWidth = geo.wide ? 1.8 : 1.5;
        if (n.kind === 'more') g.setLineDash([3, 4]);
        strokeEdge(x0, y0, x1, y1, e);
        g.setLineDash([]);
        // Teilbaum der Auswahl
        if (selActive && !a.dead && sel && isPrefix(sel, n.path) && n.path.length > sel.length) {
          g.strokeStyle = alpha(hi, 0.45);
          g.lineWidth = geo.wide ? 2.4 : 2;
          strokeEdge(x0, y0, x1, y1, e * selT(n.level - sel.length + 1));
        }
        if (!a.dead && hoverPath && isPrefix(n.path, hoverPath) && !(sk && isPrefix(n.path, sel!))) {
          g.strokeStyle = alpha(hi, 0.4);
          g.lineWidth = geo.wide ? 3 : 2.5;
          strokeEdge(x0, y0, x1, y1, e);
        }
        if (!a.dead && onSelPath(n)) {
          const t = selT(n.level);
          if (t > 0) {
            g.shadowColor = alpha(hi, 0.6);
            g.shadowBlur = 10;
            g.strokeStyle = hi;
            g.lineWidth = geo.wide ? 4 : 3.4;
            strokeEdge(x0, y0, x1, y1, e * ease.outCubic(t));
          }
        }
        g.restore();
      });
      // Knoten
      nodes.forEach((a) => {
        const n = a.node;
        const al = A * nodeAlpha(a, now);
        if (al <= 0) return;
        const u = n.level === 0 ? clamp((now - a.born) / POP, 0, 1) : popOf(a, now);
        if (u <= 0) return;
        const sc = reduced ? 1 : ease.outBack(u);
        const r = a.r * sc;
        const dim = selActive && !inSel(n) && !a.dead;
        g.save();
        g.globalAlpha = al * (dim ? 0.45 : 1);
        if (n.kind === 'more') {
          drawMore(a, r, al);
        } else if (n.level === 0) {
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.25)';
          g.shadowBlur = 6;
          g.beginPath();
          g.arc(a.x, a.y, r, 0, TAU);
          g.fillStyle = theme.text;
          g.fill();
          g.shadowColor = 'transparent';
          g.beginPath();
          g.arc(a.x, a.y, r * 0.45, 0, TAU);
          g.fillStyle = theme.bg;
          g.fill();
        } else {
          const stage = n.level - 1;
          const idx = n.path[stage]!;
          const it = itemOf(stage, idx);
          const color = it.color(theme);
          if (a.r >= 7.5 && sit() !== 'pin') {
            g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.18)';
            g.shadowBlur = Math.min(10, r * 0.7);
            g.shadowOffsetY = r * 0.12;
            g.beginPath();
            g.arc(a.x, a.y, r, 0, TAU);
            const grad = g.createRadialGradient(a.x - r * 0.35, a.y - r * 0.4, r * 0.1, a.x, a.y, r);
            grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.16) : '#ffffff');
            grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.05) : shade(theme.bg, -0.04));
            g.fillStyle = grad;
            g.fill();
            g.shadowColor = 'transparent';
            g.strokeStyle = alpha(color === theme.text ? theme.muted : color, 0.55);
            g.lineWidth = 1.4;
            g.stroke();
            drawItem(g, it.icon, color, a.x, a.y, r * 1.42, iconStyle(it.label));
          } else {
            g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
            g.shadowBlur = pin0() ? 6 : 3;
            g.beginPath();
            g.arc(a.x, a.y, r, 0, TAU);
            const pin = sit() === 'pin';
            g.fillStyle = pin ? (theme.dark ? shade(theme.bg, 0.25) : '#ffffff') : color;
            g.fill();
            g.shadowColor = 'transparent';
            g.strokeStyle = pin ? alpha(theme.text, 0.35) : alpha(theme.bg, 0.9);
            g.lineWidth = 1;
            g.stroke();
            if (pin && r >= 5) text(g, String(idx), a.x, a.y + 0.5, { font: `800 ${clamp(r * 1.3, 9.5, 17)}px ${theme.font}`, color: theme.text });
          }
          if (!a.dead && (onSelPath(n) || hover === `n:${n.key}`)) {
            const t = onSelPath(n) ? selT(n.level) : 1;
            g.globalAlpha = al * t;
            g.strokeStyle = hi;
            g.lineWidth = geo.wide ? 2.6 : 2.2;
            g.beginPath();
            g.arc(a.x, a.y, r + 3, 0, TAU);
            g.stroke();
          }
          if (n.kind === 'stub') drawStub(a, r, al * (dim ? 0.45 : 1));
          if (n.kind === 'dead') {
            text(g, '✕', a.x + r + 9, a.y + 0.5, { font: `800 ${geo.wide ? 13 : 11}px ${theme.font}`, color: theme.series[1]! });
          }
          if (n.kind === 'leaf' && visited.has(n.key) && !a.dead) {
            const cx = a.x + r * 0.78;
            const cy = a.y - r * 0.78;
            const br = Math.max(4.5, Math.min(7, r * 0.42));
            g.beginPath();
            g.arc(cx, cy, br, 0, TAU);
            g.fillStyle = theme.series[2]!;
            g.fill();
            text(g, '✓', cx, cy + 0.5, { font: `800 ${br * 1.5}px ${theme.font}`, color: '#ffffff' });
          }
        }
        g.restore();
        if (!a.dead && A > 0.5 && n.level > 0 && n.kind !== 'dead' && u >= 0.6) {
          hits.push({ key: `n:${n.key}`, kind: 'node', path: n.kind === 'more' ? n.path : n.path, x: a.x, y: a.y, w: Math.max(a.r, 10), h: Math.max(a.r, 10), round: true });
        }
      });
    }

    function drawStub(a: NodeAnim, r: number, al: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const colW = geo.colX.length > 1 ? geo.colX[1]! - geo.colX[0]! : 60;
      const len = Math.min(colW * 0.42, 24);
      g.save();
      g.globalAlpha = al;
      g.strokeStyle = alpha(theme.text, 0.25);
      g.lineWidth = 1.3;
      g.lineCap = 'round';
      for (const dy of [-0.55, 0, 0.55]) {
        g.beginPath();
        g.moveTo(a.x + r + 2, a.y);
        g.lineTo(a.x + r + 2 + len, a.y + dy * Math.min(r * 1.3, 9));
        g.stroke();
      }
      const label = p.show ? `${num(a.node.hidden)} ${a.node.hidden === 1 ? ctx.t('path1') : ctx.t('paths')}` : '…';
      text(g, label, a.x + r + len + 7, a.y + 0.5, { font: `600 ${geo.wide ? 12 : 11}px ${theme.font}`, color: theme.muted, align: 'left' });
      g.restore();
    }

    function drawMore(a: NodeAnim, r: number, al: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const size = geo.wide ? 12 : 11;
      g.save();
      g.globalAlpha = al;
      const label = `+${a.node.siblings}`;
      g.font = `800 ${size}px ${theme.font}`;
      const w = Math.max(24, g.measureText(label).width + 12) * (r / Math.max(1, a.r));
      const h = Math.max(15, Math.min(20, a.r * 1.6)) * (r / Math.max(1, a.r));
      roundRect(g, a.x - w / 2, a.y - h / 2, w, h, h / 2);
      g.fillStyle = alpha(theme.text, theme.dark ? 0.14 : 0.08);
      g.fill();
      g.setLineDash([3, 3]);
      g.strokeStyle = alpha(theme.text, 0.3);
      g.lineWidth = 1;
      g.stroke();
      g.setLineDash([]);
      text(g, label, a.x, a.y + 0.5, { font: `800 ${size}px ${theme.font}`, color: theme.muted });
      if (p.show) {
        const tail = `${num(a.node.hidden)} ${ctx.t('paths')}`;
        text(g, tail, a.x + w / 2 + 6, a.y + 0.5, { font: `600 ${size}px ${theme.font}`, color: alpha(theme.muted, 0.85), align: 'left' });
      }
      g.restore();
    }

    /** Wachstumsbeginn der tiefsten gezeichneten Stufe (für Sackgassen). */
    function deepestBorn(): number {
      for (let i = levelBorn.length - 1; i >= 0; i--) if (levelBorn[i] !== undefined) return levelBorn[i]!;
      return -1e9;
    }

    /** Anzahlen je Stufe unter den Spalten und das Produkt. */
    function drawProduct(now: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const k = counts.length;
      if (!k) return;
      const y = geo.pillY;
      const colW = geo.colX[1]! - geo.colX[0]!;
      const size = colW < 40 ? 12.5 : geo.wide ? 15 : 14;
      const h = colW < 40 ? 22 : 26;
      for (let i = 0; i < k; i++) {
        const born = levelBorn[i + 1] ?? deepestBorn();
        const u = reduced ? 1 : clamp((now - born - EDGE * 0.4) / 360, 0, 1);
        if (u <= 0) continue;
        const x = geo.colX[i + 1]!;
        const sm = pillS[i]!;
        const bump = 1 + 0.18 * Math.max(0, 1 - (now - sm.pulse) / 320) * Math.sin(Math.min(1, (now - sm.pulse) / 320) * Math.PI);
        pill(x, y, String(sm.shown), counts[i] === 0 ? theme.series[1]! : theme.series[0]!, A * u, ease.outBack(u) * bump, size, h);
        if (i > 0) {
          const xm = (geo.colX[i]! + x) / 2;
          g.save();
          g.globalAlpha = A * u;
          mulDot(xm, y);
          g.restore();
        }
      }
      // Produkt
      const lastBorn = levelBorn[k] ?? deepestBorn();
      const u = reduced ? 1 : clamp((now - lastBorn - EDGE) / 420, 0, 1);
      if (u > 0) {
        const x = geo.colX[k]! + (colW < 40 ? 16 : 22);
        const bump = 1 + 0.12 * Math.max(0, 1 - (now - prodS.pulse) / 420) * Math.sin(Math.min(1, (now - prodS.pulse) / 420) * Math.PI);
        const fs = (geo.wide ? 22 : 18) * bump;
        g.save();
        g.globalAlpha = A * ease.outCubic(u);
        text(g, `= ${p.show ? num(prodS.shown) : '?'}`, x, y + 1, { font: `800 ${fs}px ${theme.font}`, color: theme.text, align: 'left' });
        g.restore();
      }
      drawCaption(A * (reduced ? 1 : clamp((now - lastBorn - EDGE) / 500, 0, 1)));
    }

    function drawCaption(A: number): void {
      if (A <= 0) return;
      const g = surface.g;
      const theme = ctx.theme;
      const s = sit();
      const k = counts.length;
      const n = plan.options[0] ?? 0;
      const maxW = geo.tree.w - 12;
      const cx = geo.tree.x + geo.tree.w / 2;
      const y = geo.capY;
      let long: string;
      let short: string;
      let sup = '';
      let tail = '';
      if (s === 'outfit' || s === 'menu') {
        long = ctx.t('capIndep');
        short = ctx.t('capIndepShort');
      } else if (plan.rep) {
        long = k === 1 ? T(`1 Stufe mit ${n} Möglichkeiten: `, `1 stage with ${n} choices: `) : tr('capRep', { k, n });
        short = tr('capRepShort', { n });
        if (p.show) {
          long += String(n);
          short += String(n);
          sup = String(k);
        } else {
          long = long.replace(/: $/, '');
          short = short.replace(/: $/, '');
        }
      } else if (k > n) {
        long = ctx.t('capNone');
        short = ctx.t('capNone');
      } else if (k === n) {
        long = tr('capFact', { n }) + (p.show ? `${n}!` : '');
        short = tr('capFactShort', { n }) + (p.show ? `${n}!` : '');
        tail = ctx.t('capFactTail');
        if (!p.show) {
          long = long.replace(/: $/, '');
          short = short.replace(/: $/, '');
          tail = '';
        }
      } else {
        long = ctx.t('capNoRep');
        short = ctx.t('capNoRepShort');
      }
      const size = geo.wide ? 13 : 12;
      const supW = (font: string) => {
        g.font = font.replace(/\d+(\.\d+)?px/, (m) => `${parseFloat(m) * 0.7}px`);
        return sup ? g.measureText(sup).width + 1 : 0;
      };
      let chosen = long + tail;
      let font = `600 ${size}px ${theme.font}`;
      let ok = false;
      for (const cand of [long, short]) {
        for (let fs = size; fs >= 11; fs -= 0.5) {
          font = `600 ${fs}px ${theme.font}`;
          g.font = font;
          const w = g.measureText(cand).width + supW(font) + (g.font = font, g.measureText(tail).width);
          if (w <= maxW) {
            chosen = cand;
            ok = true;
            break;
          }
        }
        if (ok) break;
      }
      g.font = font;
      const fsz = parseFloat(/(\d+(\.\d+)?)px/.exec(font)![1]!);
      const wMain = g.measureText(chosen).width;
      const wSup = supW(font);
      g.font = font;
      const wTail = g.measureText(tail).width;
      let x = cx - (wMain + wSup + wTail) / 2;
      g.save();
      g.globalAlpha = A;
      text(g, chosen, x, y, { font, color: theme.muted, align: 'left' });
      x += wMain;
      if (sup) {
        text(g, sup, x + 1, y - fsz * 0.38, { font: `700 ${fsz * 0.7}px ${theme.font}`, color: theme.muted, align: 'left' });
        x += wSup;
      }
      if (tail) text(g, tail, x, y, { font, color: theme.muted, align: 'left' });
      g.restore();
    }

    /* ---------------- Zeichnen: Kärtchen ---------------- */
    function drawCards(now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const hi = theme.series[0]!;
      const k = counts.length;
      cards.forEach((c) => {
        const appear = reduced ? 1 : clamp((now - c.born) / 420, 0, 1);
        const die = c.dead ? clamp((now - c.dead) / DIE, 0, 1) : 0;
        if (appear <= 0) return;
        const al = ease.outCubic(appear) * (1 - die);
        if (al <= 0) return;
        const sc = lerp(0.75, 1, ease.outBack(appear)) * (1 - 0.15 * die);
        const pk = pathKey(c.path);
        const matches = c.kind === 'card' && sel !== null && isPrefix(sel, c.path);
        const exact = c.kind === 'card' && sel !== null && sel.length === k && pk === selKey();
        const isHover = hover === `c:${c.key}`;
        const dim = sel !== null && !matches && !c.dead;
        const lift = (exact ? 1 : 0) + (isHover ? 0.5 : 0);
        const cx = c.x + c.w / 2;
        const cy = c.y + c.h / 2 - lift * 1.5;
        const w = c.w * sc * (1 + lift * 0.04);
        const h = c.h * sc * (1 + lift * 0.04);
        g.save();
        g.globalAlpha = al * (dim ? 0.5 : 1);
        g.shadowColor = theme.dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.16)';
        g.shadowBlur = 6 + lift * 8;
        g.shadowOffsetY = 2 + lift * 2;
        roundRect(g, cx - w / 2, cy - h / 2, w, h, Math.min(10, h * 0.3));
        if (c.kind === 'card') {
          const grad = g.createLinearGradient(0, cy - h / 2, 0, cy + h / 2);
          grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.12) : '#ffffff');
          grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.05) : shade(theme.bg, -0.035));
          g.fillStyle = grad;
          g.fill();
          g.shadowColor = 'transparent';
          g.strokeStyle = matches ? alpha(hi, exact ? 1 : 0.6) : alpha(theme.text, 0.12);
          g.lineWidth = exact ? 2.4 : matches ? 1.8 : 1;
          g.stroke();
          const s = c.s * sc;
          const step = s * 1.1;
          const x0 = cx - (step * (k - 1)) / 2;
          c.path.forEach((o, i) => icon(i, o, x0 + i * step, cy, s));
          if (visited.has(pk) && !c.dead) {
            const br = Math.max(5, Math.min(7.5, c.h * 0.2));
            const bx = cx + w / 2 - br * 0.6;
            const by = cy - h / 2 + br * 0.6;
            g.beginPath();
            g.arc(bx, by, br, 0, TAU);
            g.fillStyle = theme.series[2]!;
            g.fill();
            text(g, '✓', bx, by + 0.5, { font: `800 ${br * 1.5}px ${theme.font}`, color: '#ffffff' });
          }
        } else {
          g.fillStyle = alpha(theme.text, theme.dark ? 0.08 : 0.045);
          g.fill();
          g.shadowColor = 'transparent';
          g.setLineDash([4, 4]);
          g.strokeStyle = alpha(theme.text, 0.25);
          g.lineWidth = 1.2;
          g.stroke();
          g.setLineDash([]);
          const f = fitFont(c.label.split('|'), w - 10, geo.wide ? 13 : 12, 700, 11);
          text(g, f.value, cx, cy + 0.5, { font: f.font, color: theme.muted });
        }
        g.restore();
        if (!c.dead && c.kind === 'card' && appear > 0.5) hits.push({ key: `c:${c.key}`, kind: 'card', path: c.path, x: c.x, y: c.y, w: c.w, h: c.h, round: false });
      });
    }

    function drawPanel(now: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const P = geo.panel;
      if (A <= 0) return;
      g.save();
      g.globalAlpha = A;
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 18;
      g.shadowOffsetY = 4;
      roundRect(g, P.x, P.y, P.w, P.h, 16);
      g.fillStyle = theme.dark ? shade(theme.bg, 0.04) : shade(theme.bg, -0.018);
      g.fill();
      g.shadowColor = 'transparent';
      g.strokeStyle = alpha(theme.text, 0.08);
      g.lineWidth = 1;
      g.stroke();
      g.restore();
      // Überschrift über den Kärtchen
      const total = tree.total;
      const label = p.show ? `${ctx.t('results')}: ${num(prodS.shown)} ${noun(total)}` : ctx.t('results');
      g.save();
      g.globalAlpha = A;
      text(g, total === 0 ? ctx.t('results') : label, geo.grid.x + 2, geo.gridHead, { font: `800 ${geo.wide ? 14 : 13}px ${theme.font}`, color: theme.text, align: 'left' });
      if (total === 0) {
        const lines = wrap(ctx.t('impossible'), geo.grid.w - 8, `600 13px ${theme.font}`);
        lines.forEach((ln, i) => text(g, ln, geo.grid.x + geo.grid.w / 2, geo.grid.y + 30 + i * 18, { font: `600 13px ${theme.font}`, color: theme.series[1]! }));
      }
      g.restore();
      drawSpot(now, A);
    }

    /* ---------------- Große Kombination ---------------- */
    function ghost(x: number, y: number, s: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      g.save();
      g.setLineDash([4, 4]);
      g.strokeStyle = alpha(theme.text, 0.28);
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, s * 0.34, 0, TAU);
      g.stroke();
      g.setLineDash([]);
      text(g, '?', x, y + 1, { font: `800 ${s * 0.36}px ${theme.font}`, color: alpha(theme.text, 0.35) });
      g.restore();
    }

    /** Gegenstand i der Kombination mit Ploppen (oder Platzhalter). */
    function comboItem(path: number[] | null, i: number, x: number, y: number, s: number, now: number): void {
      const g = surface.g;
      const o = path?.[i];
      if (o === undefined) {
        ghost(x, y, s);
        return;
      }
      const u = reduced ? 1 : clamp((now - (itemTime[i] ?? selStart)) / 380, 0, 1);
      const sc = ease.outBack(u);
      if (sc <= 0.01) {
        ghost(x, y, s);
        return;
      }
      g.save();
      g.globalAlpha *= clamp(u * 2, 0, 1);
      g.shadowColor = ctx.theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 3;
      icon(i, o, x, y, s * sc, false);
      g.restore();
    }

    function comboWidth(R: Rect): number {
      const k = counts.length;
      switch (sit()) {
        case 'outfit':
          return Math.min(R.h * 0.62, R.w * 0.36);
        case 'eis':
          return Math.min(R.h * 0.55, R.w * 0.3);
        case 'pin': {
          const photo = lockPhoto();
          if (photo) return Math.min(R.w * 0.5, (R.h - 2) * (photo.width / photo.height));
          return Math.min(R.w * 0.5, k * Math.min(R.h * 0.34, 34) + 36);
        }
        case 'menu':
          return Math.min(R.w * 0.5, R.h * 1.55);
        default:
          return k <= 3 ? Math.min(R.w * 0.46, R.h * 1.35) : Math.min(R.w * 0.55, k * Math.min(R.h * 0.42, 30) + 12);
      }
    }

    /* Zahlenschloss-Foto: vier leere Rädchen (Mitten in Bildpixeln); nur bei vier Stellen, sonst gezeichnet. */
    const LOCK_IMG = { wheels: [182, 325, 469, 617], wheelW: 108, wheelY: 802, wheelH: 290 };
    const lockPhoto = (): HTMLImageElement | null => (counts.length === LOCK_IMG.wheels.length ? ctx.images.get('lock') : null);

    function drawLockPhoto(img: HTMLImageElement, path: number[] | null, R: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      let h = R.h - 2;
      let w = h * (img.width / img.height);
      if (w > R.w) {
        w = R.w;
        h = w * (img.height / img.width);
      }
      const x0 = R.x + (R.w - w) / 2;
      const y0 = R.y + R.h - h - 1;
      const s = h / img.height;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
      g.shadowBlur = 10;
      g.shadowOffsetY = 3;
      g.drawImage(scaledSprite(img, w, h, surface.dpr), x0, y0, w, h);
      g.restore();
      // Ziffern auf den Messingrädchen (dunkle Gravur, unabhängig vom Farbschema)
      const ink = '#3a2a0c';
      const ww = LOCK_IMG.wheelW * s;
      const wh = LOCK_IMG.wheelH * s;
      const y = y0 + LOCK_IMG.wheelY * s;
      LOCK_IMG.wheels.forEach((wx, i) => {
        const x = x0 + wx * s;
        const o = path?.[i];
        const u = o === undefined ? 0 : reduced ? 1 : clamp((now - (itemTime[i] ?? selStart)) / 380, 0, 1);
        if (o === undefined || u <= 0) text(g, '?', x, y + 1, { font: `800 ${ww * 0.7}px ${theme.font}`, color: alpha(ink, 0.45) });
        else {
          // Ziffer rollt von oben herein
          g.save();
          g.beginPath();
          g.rect(x - ww / 2, y - wh / 2, ww, wh);
          g.clip();
          const dy = (1 - ease.outBack(u)) * -wh * 0.6;
          text(g, String(o), x, y + 1 + dy, { font: `800 ${ww * 0.85}px ${theme.font}`, color: ink });
          g.restore();
        }
      });
    }

    function drawCombo(path: number[] | null, R: Rect, now: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const k = counts.length;
      const cx = R.x + R.w / 2;
      switch (sit()) {
        case 'outfit': {
          const S = Math.min(R.h / 2.4, R.w * 0.95);
          const hatY = R.y + S * 0.36;
          const shirtY = hatY + S * 0.7;
          const pantsY = shirtY + S * 0.86;
          comboItem(path, 2, cx, hatY, S * 0.72, now);
          comboItem(path, 1, cx, shirtY, S, now);
          comboItem(path, 0, cx, pantsY, S, now);
          break;
        }
        case 'eis': {
          const S = Math.min(R.w * 0.9, R.h / (1.0 + k * 0.62 + 0.25));
          const coneTop = R.y + R.h - S * 1.0;
          const cone = ctx.images.get('cone');
          if (cone) {
            // Waffel-Foto: Rand knapp über coneTop, Spitze unten, Seitenverhältnis bleibt
            const h = R.y + R.h - 1 - (coneTop - S * 0.06);
            const w = h * (cone.width / cone.height);
            g.save();
            g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.2)';
            g.shadowBlur = 8;
            g.shadowOffsetY = 3;
            g.drawImage(scaledSprite(cone, w, h, surface.dpr), cx - w / 2, coneTop - S * 0.06, w, h);
            g.restore();
            for (let i = 0; i < k; i++) comboItem(path, i, cx, coneTop - S * 0.18 - i * S * 0.6, S * 0.86, now);
            break;
          }
          // Waffel
          g.save();
          g.beginPath();
          g.moveTo(cx - S * 0.36, coneTop);
          g.lineTo(cx + S * 0.36, coneTop);
          g.lineTo(cx, R.y + R.h - 2);
          g.closePath();
          const grad = g.createLinearGradient(cx - S * 0.36, 0, cx + S * 0.36, 0);
          grad.addColorStop(0, '#e2a95c');
          grad.addColorStop(1, '#b97a35');
          g.fillStyle = grad;
          g.fill();
          g.clip();
          g.strokeStyle = 'rgba(120,70,20,0.45)';
          g.lineWidth = 1;
          for (let i = -6; i <= 6; i++) {
            g.beginPath();
            g.moveTo(cx + i * S * 0.12, coneTop);
            g.lineTo(cx + i * S * 0.12 + S * 0.6, coneTop + S);
            g.moveTo(cx + i * S * 0.12, coneTop);
            g.lineTo(cx + i * S * 0.12 - S * 0.6, coneTop + S);
            g.stroke();
          }
          g.restore();
          for (let i = 0; i < k; i++) comboItem(path, i, cx, coneTop - S * 0.18 - i * S * 0.6, S * 0.86, now);
          break;
        }
        case 'pin': {
          const photo = lockPhoto();
          if (photo) {
            drawLockPhoto(photo, path, R, now);
            break;
          }
          const cell = Math.min(R.h * 0.34, 34, (R.w - 20) / Math.max(1, k));
          const bw = k * cell + 18;
          const bh = cell + 22;
          const by = R.y + R.h - bh - 2;
          // Bügel
          g.save();
          g.strokeStyle = theme.dark ? '#9aa4b2' : '#8b95a3';
          g.lineWidth = Math.max(4, cell * 0.22);
          g.lineCap = 'round';
          const sw = Math.min(bw * 0.32, 34);
          g.beginPath();
          g.moveTo(cx - sw, by + 2);
          g.lineTo(cx - sw, by - Math.min(R.h - bh - 14, sw * 1.1) + sw);
          g.arc(cx, by - Math.min(R.h - bh - 14, sw * 1.1) + sw, sw, Math.PI, 0);
          g.lineTo(cx + sw, by + 2);
          g.stroke();
          g.restore();
          // Körper
          g.save();
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.22)';
          g.shadowBlur = 10;
          g.shadowOffsetY = 3;
          roundRect(g, cx - bw / 2, by, bw, bh, 10);
          const grad = g.createLinearGradient(0, by, 0, by + bh);
          grad.addColorStop(0, '#f2c14e');
          grad.addColorStop(1, '#c8902a');
          g.fillStyle = grad;
          g.fill();
          g.restore();
          for (let i = 0; i < k; i++) {
            const x = cx - (k * cell) / 2 + cell * (i + 0.5);
            const y = by + bh / 2;
            roundRect(g, x - cell * 0.42, y - cell * 0.48, cell * 0.84, cell * 0.96, 5);
            g.fillStyle = theme.dark ? '#1f2530' : '#fdfdfb';
            g.fill();
            const o = path?.[i];
            const u = o === undefined ? 0 : reduced ? 1 : clamp((now - (itemTime[i] ?? selStart)) / 380, 0, 1);
            if (o === undefined || u <= 0) text(g, '?', x, y + 1, { font: `800 ${cell * 0.5}px ${theme.font}`, color: alpha(theme.text, 0.3) });
            else {
              // Ziffer rollt von oben herein
              g.save();
              roundRect(g, x - cell * 0.42, y - cell * 0.48, cell * 0.84, cell * 0.96, 5);
              g.clip();
              const dy = (1 - ease.outBack(u)) * -cell;
              text(g, String(o), x, y + 1 + dy, { font: `800 ${cell * 0.62}px ${theme.font}`, color: theme.text });
              g.restore();
            }
          }
          break;
        }
        case 'menu': {
          const S = Math.min(R.h * 0.7, (R.w - 10) / 3.1);
          const ty = R.y + R.h / 2 + 4;
          g.save();
          g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
          g.shadowBlur = 10;
          g.shadowOffsetY = 3;
          roundRect(g, cx - S * 1.6, ty - S * 0.62, S * 3.2, S * 1.24, 12);
          g.fillStyle = theme.dark ? '#5b4636' : '#c9a57c';
          g.fill();
          g.restore();
          for (let i = 0; i < 3; i++) comboItem(path, i, cx + (i - 1) * S * 1.04, ty, S * 0.95, now);
          break;
        }
        default: {
          if (k <= 3) {
            const bw = R.w / 3;
            const tok = Math.min(bw * 0.72, R.h * 0.4);
            const base = R.y + R.h - 1;
            const heights = [0.4, 0.3, 0.22].map((f) => (R.h - tok - 6) * f * 1.6);
            const order = [1, 0, 2];
            order.forEach((place, j) => {
              if (place >= k) return;
              const x = R.x + bw * j;
              const hgt = Math.min(heights[place]!, R.h - tok - 4);
              g.save();
              g.shadowColor = theme.dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.16)';
              g.shadowBlur = 8;
              g.shadowOffsetY = 2;
              roundRect(g, x + 2, base - hgt, bw - 4, hgt, 5);
              const grad = g.createLinearGradient(0, base - hgt, 0, base);
              const tone = ['#e8c04a', '#b9c1cc', '#c98a52'][place]!;
              grad.addColorStop(0, shade(tone, 0.2));
              grad.addColorStop(1, shade(tone, -0.12));
              g.fillStyle = grad;
              g.fill();
              g.restore();
              text(g, String(place + 1), x + bw / 2, base - hgt / 2 + 1, { font: `800 ${Math.min(hgt * 0.55, 20)}px ${theme.font}`, color: 'rgba(40,30,10,0.65)' });
              comboItem(path, place, x + bw / 2, base - hgt - tok / 2 - 2, tok, now);
            });
          } else {
            const s = Math.min((R.w - 4) / k, R.h * 0.55, 30);
            for (let i = 0; i < k; i++) {
              const x = R.x + R.w / 2 + (i - (k - 1) / 2) * s;
              comboItem(path, i, x, R.y + R.h * 0.42, s * 0.92, now);
              text(g, lang === 'de' ? `${i + 1}.` : ord(i + 1), x, R.y + R.h * 0.42 + s * 0.62 + 6, { font: `700 11px ${theme.font}`, color: theme.muted });
            }
          }
        }
      }
    }

    function drawSpot(now: number, A: number): void {
      const g = surface.g;
      const theme = ctx.theme;
      const R = geo.spot;
      const k = counts.length;
      if (!k) return;
      g.save();
      g.globalAlpha = A;
      roundRect(g, R.x, R.y, R.w, R.h, 12);
      const grad = g.createLinearGradient(0, R.y, 0, R.y + R.h);
      grad.addColorStop(0, theme.dark ? shade(theme.bg, 0.1) : '#ffffff');
      grad.addColorStop(1, theme.dark ? shade(theme.bg, 0.05) : shade(theme.bg, -0.01));
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = sel ? alpha(theme.series[0]!, 0.35) : alpha(theme.text, 0.08);
      g.lineWidth = 1.2;
      g.stroke();
      // Grafik links
      const cw = comboWidth({ x: R.x, y: R.y, w: R.w, h: R.h - 16 });
      const G: Rect = { x: R.x + 10, y: R.y + 8, w: cw, h: R.h - 16 };
      g.globalAlpha = A * (sel ? 1 : 0.85);
      drawCombo(sel, G, now);
      g.globalAlpha = A;
      // Text rechts
      const tx = G.x + G.w + 14;
      const tw = R.x + R.w - tx - 10;
      const small = geo.wide ? 12 : 11;
      const big = geo.wide ? 14 : 12.5;
      const lines: { text: string; font: string; color: string }[] = [];
      const total = tree.total;
      if (sel) {
        const full = sel.length === k;
        if (full) {
          const idx = tree.leaves.findIndex((q) => pathKey(q) === selKey());
          const head = walking || idx >= 0 ? (p.show ? tr('pathOf', { i: idx + 1, n: num(total) }) : tr('pathNo', { i: idx + 1 })) : '';
          if (head) lines.push({ text: head, font: `700 ${small}px ${theme.font}`, color: theme.series[0]! });
        }
        if (k <= 3) sel.forEach((o, i) => lines.push({ text: `${stageName(i)}: ${itemName(i, o)}`, font: `700 ${big}px ${theme.font}`, color: theme.text }));
        else {
          for (const ln of wrap(sel.map((o, i) => itemName(i, o)).join(sit() === 'pin' ? ' ' : ' · '), tw, `700 ${big}px ${theme.font}`)) lines.push({ text: ln, font: `700 ${big}px ${theme.font}`, color: theme.text });
        }
        if (!full) {
          const m = pathsBelow(plan, sel.length);
          const rest = counts.slice(sel.length).join(' · ');
          const msg = !p.show ? ctx.t('prefixAny') : m === 1 ? tr('prefixOne', { noun: noun(1) }) : `${tr('prefix', { n: num(m), noun: noun(m) })}: ${rest} = ${num(m)}`;
          for (const ln of wrap(msg, tw, `600 ${small}px ${theme.font}`)) lines.push({ text: ln, font: `600 ${small}px ${theme.font}`, color: theme.muted });
        }
      } else if (now - walkDone < 6000 && walkDone > 0) {
        const msg = tree.leaves.length < total ? tr('walked', { n: num(tree.leaves.length) }) : tr('walkedAll', { n: num(total) });
        for (const ln of wrap(msg, tw, `700 ${big}px ${theme.font}`)) lines.push({ text: ln, font: `700 ${big}px ${theme.font}`, color: theme.text });
      } else {
        for (const ln of wrap(ctx.t('hint'), tw, `600 ${big}px ${theme.font}`)) lines.push({ text: ln, font: `600 ${big}px ${theme.font}`, color: theme.muted });
      }
      const lh = (f: string) => parseFloat(/(\d+(\.\d+)?)px/.exec(f)![1]!) * 1.38;
      const totalH = lines.reduce((s, l) => s + lh(l.font), 0);
      let y = R.y + Math.max(8, (R.h - totalH) / 2);
      for (const l of lines) {
        const h = lh(l.font);
        const f = fitFont([l.text], tw, parseFloat(/(\d+(\.\d+)?)px/.exec(l.font)![1]!), Number(l.font.split(' ')[0]), 10.5);
        text(g, f.value, tx, y + h / 2, { font: f.font, color: l.color, align: 'left' });
        y += h;
      }
      // Fortschritt beim Ablaufen
      if (walking && tree.leaves.length) {
        const frac = clamp((now - walkStart) / (walkStep * tree.leaves.length), 0, 1);
        roundRect(g, R.x + 12, R.y + R.h - 6, R.w - 24, 3, 1.5);
        g.fillStyle = alpha(theme.text, 0.08);
        g.fill();
        roundRect(g, R.x + 12, R.y + R.h - 6, (R.w - 24) * frac, 3, 1.5);
        g.fillStyle = theme.series[0]!;
        g.fill();
      }
      g.restore();
    }

    /* ---------------- Zeichnen: Tabelle ---------------- */
    function drawList(A: number): void {
      if (A <= 0) return;
      const g = surface.g;
      const theme = ctx.theme;
      const R = geo.list;
      const k = counts.length;
      g.save();
      g.globalAlpha = A;
      const cap = fitFont([ctx.t('listCap'), ctx.t('listCapShort')], R.w - 12, geo.wide ? 13 : 12, 600, 11);
      text(g, cap.value, R.x + R.w / 2, R.y + 14, { font: cap.font, color: theme.muted });
      listRows.forEach((row, r) => {
        // Zeilenhintergrund
        roundRect(g, R.x, row.y + 2, R.w, row.h - 4, 12);
        g.fillStyle = alpha(theme.text, r % 2 ? (theme.dark ? 0.035 : 0.022) : theme.dark ? 0.065 : 0.045);
        g.fill();
        const hx = R.x + (geo.wide ? 30 : 23);
        const s = Math.min(row.h * 0.55, geo.wide ? 34 : 26);
        if (k) icon(0, row.prefix, hx, row.y + row.h / 2, s);
        if (geo.wide) {
          const f = fitFont([itemName(0, row.prefix)], 150 - 58, 13, 700, 10.5);
          text(g, f.value, R.x + 54, row.y + row.h / 2, { font: f.font, color: theme.text, align: 'left' });
        }
        const tailW = geo.wide ? 50 : 36;
        if (p.show) text(g, num(row.count), R.x + R.w - tailW / 2, row.y + row.h / 2, { font: `800 ${geo.wide ? 15 : 13}px ${theme.font}`, color: theme.series[0]! });
      });
      // Fußzeile: Zeilen · je Zeile = Anzahl
      const y = R.y + R.h - (geo.wide ? 30 : 28);
      const cx = R.x + R.w / 2;
      const size = geo.wide ? 15 : 14;
      const gapX = geo.wide ? 60 : 48;
      pill(cx - gapX * 1.5, y, String(rowsS.shown), theme.series[0]!, 1, 1, size);
      mulDot(cx - gapX * 0.75, y);
      pill(cx, y, String(perRowS.shown), theme.series[0]!, 1, 1, size);
      text(g, `= ${p.show ? num(prodS.shown) : '?'}`, cx + gapX * 0.65, y + 1, { font: `800 ${geo.wide ? 20 : 17}px ${theme.font}`, color: theme.text, align: 'left' });
      text(g, ctx.t('rows'), cx - gapX * 1.5, y + 22, { font: `600 11px ${theme.font}`, color: theme.muted });
      text(g, ctx.t('perRow'), cx, y + 22, { font: `600 11px ${theme.font}`, color: theme.muted });
      g.restore();
    }

    /* ---------------- Zeiger ---------------- */
    /** Ast oder Ergebniskarte antippen: Pfad auswählen (nochmals: abwählen). */
    function tapHit(h: Hit): void {
      stopWalk();
      const key = pathKey(h.path);
      const node = tree.byKey.get(key);
      let path = h.path;
      if (h.kind === 'node' && node && node.kind === 'more') path = node.path;
      if (selKey() === pathKey(path) || path.length === 0) select(null);
      else select(path.slice());
      ctx.requestRender();
    }

    /** Tastatur wie Antippen: Äste des Baums und Ergebniskarten. */
    function updateKeyTargets(): void {
      if (ctx.locked) {
        ctx.setKeyTargets([]);
        return;
      }
      const de = lang === 'de';
      ctx.setKeyTargets(
        hits
          .filter((h) => h.path.length > 0)
          .map((h) => {
            const names = h.path.map((idx, stage) => itemName(stage, idx)).join(' – ');
            const kind = h.kind === 'card' ? (de ? 'Ergebnis' : 'Outcome') : de ? 'Ast' : 'Branch';
            const chosen = selKey() === pathKey(h.path) ? (de ? ' – gewählt' : ' – selected') : '';
            const rect = h.round ? { x: h.x - h.w, y: h.y - h.w, w: 2 * h.w, h: 2 * h.w } : { x: h.x, y: h.y, w: h.w, h: h.h };
            return { id: h.key, label: `${kind}: ${names}${chosen}`, rect, activate: () => tapHit(h) };
          }),
      );
    }

    function hitAt(px: number, py: number): Hit | null {
      let best: Hit | null = null;
      let bestD = Infinity;
      for (const h of hits) {
        if (h.round) {
          const d = Math.hypot(px - h.x, py - h.y);
          if (d <= h.w + 3 && d < bestD) {
            best = h;
            bestD = d;
          }
        } else if (px >= h.x && px <= h.x + h.w && py >= h.y && py <= h.y + h.h) return h;
      }
      return best;
    }

    surface.addTarget({
      contains: (px: number, py: number) => !ctx.locked && hitAt(px, py) !== null,
      pointerDown: (pt: { px: number; py: number }) => {
        if (ctx.locked) return false;
        const h = hitAt(pt.px, pt.py);
        if (!h) return false;
        tapHit(h);
        return true;
      },
      pointerMove: () => {},
      pointerUp: () => {},
      hover: (pt: { px: number; py: number } | null) => {
        const h = pt && !ctx.locked ? hitAt(pt.px, pt.py) : null;
        const id = h?.key ?? null;
        if (id !== hover) {
          hover = id;
          ctx.requestRender();
        }
        surface.setCursor(id ? 'pointer' : '');
      },
      wheel: () => false,
    });

    /* ---------------- Ablauf je Bild ---------------- */
    function stepAnims(now: number, dt: number): boolean {
      let busy = false;
      const kk = reduced ? 1 : 1 - Math.exp(-dt * 10);
      nodes.forEach((a, key) => {
        if (a.dead) {
          a.vy += 1500 * dt;
          a.y += a.vy * dt;
          if (now - a.dead > DIE) nodes.delete(key);
          busy = true;
          return;
        }
        a.x += (a.tx - a.x) * kk;
        a.y += (a.ty - a.y) * kk;
        a.r += (a.tr - a.r) * kk;
        if (Math.abs(a.tx - a.x) > 0.2 || Math.abs(a.ty - a.y) > 0.2 || Math.abs(a.tr - a.r) > 0.05) busy = true;
        if (now - a.born < EDGE + POP + 50) busy = true;
      });
      cards.forEach((c, key) => {
        if (c.dead) {
          if (now - c.dead > DIE) cards.delete(key);
          busy = true;
          return;
        }
        c.x += (c.tx - c.x) * kk;
        c.y += (c.ty - c.y) * kk;
        c.w += (c.tw - c.w) * kk;
        c.h += (c.th - c.h) * kk;
        c.s += (c.ts - c.s) * kk;
        if (Math.abs(c.tx - c.x) > 0.2 || Math.abs(c.ty - c.y) > 0.2 || Math.abs(c.tw - c.w) > 0.2) busy = true;
        if (now - c.born < 460) busy = true;
      });
      for (const s of [prodS, rowsS, perRowS, ...pillS]) {
        if (s.step(dt, now)) busy = true;
        if (now - s.pulse < 450) busy = true;
      }
      const targetAlpha = view() === 'baum' ? 1 : 0;
      if (treeAlpha !== targetAlpha) {
        treeAlpha = reduced ? targetAlpha : clamp(treeAlpha + Math.sign(targetAlpha - treeAlpha) * dt * 3.2, 0, 1);
        busy = true;
      }
      if (now - selStart < 900) busy = true;
      return busy;
    }

    function stepWalk(now: number): boolean {
      if (!walking) return now - walkDone < 6100 && walkDone > 0;
      const n = tree.leaves.length;
      const idx = Math.floor((now - walkStart) / walkStep);
      if (idx >= n) {
        walking = false;
        walkDone = now;
        select(null);
        return true;
      }
      if (idx !== walkIdx) {
        for (let i = Math.max(0, walkIdx); i <= idx; i++) visited.add(pathKey(tree.leaves[i]!));
        walkIdx = idx;
        select(tree.leaves[idx]!.slice());
      }
      return true;
    }

    function startWalk(): void {
      const n = tree.leaves.length;
      if (!n) return;
      visited.clear();
      walking = true;
      walkIdx = -1;
      walkStep = reduced ? 700 : clamp(9000 / n, 260, 700);
      walkStart = performance.now();
      walkDone = -1e9;
    }

    function regrow(): void {
      epoch++;
      const now = performance.now();
      nodes.forEach((a) => {
        if (!a.dead) a.dead = reduced ? now - DIE : now + Math.random() * 120;
      });
      cards.forEach((c) => {
        if (!c.dead) c.dead = reduced ? now - DIE : now;
      });
      growStart = now + dur(200);
      prodS.v = 0;
      prodS.target = 0;
      pillS.forEach((s) => {
        s.v = 0;
        s.target = 0;
      });
      structureDirty = true;
    }

    updateReadouts();

    return {
      update(changed, source) {
        if (source === 'input') {
          if (p.sit === 'podest' && p.p > p.l) ctx.set({ p: p.l });
          if (p.sit === 'pin' && !p.rep && p.s > p.z) ctx.set({ s: p.z });
          if (p.sit === 'eis' && !p.rep && p.k > p.n) ctx.set({ k: p.n });
        }
        const structural = ['sit', 'a', 'b', 'c', 'n', 'k', 'z', 's', 'v', 'h', 'd', 'l', 'p', 'rep'].some((key) => (changed as Set<string>).has(key));
        if (source !== 'init') {
          if (changed.has('sit')) {
            regrow();
            select(null);
          } else if (structural) {
            structureDirty = true;
            if (sel) {
              const ok = sel.every((o, i) => {
                const prev = sel!.slice(0, i);
                return childOptions(makePlan(), prev).includes(o);
              }) && sel.length <= stageCounts(makePlan()).length;
              if (!ok) sel = null;
            }
          }
          if (structural || changed.has('view') || changed.has('show')) {
            stopWalk();
            visited.clear();
            structureDirty = true;
          }
        }
        plan = makePlan();
        counts = stageCounts(plan);
        updateReadouts();
        ctx.requestRender();
      },

      action(id) {
        if (ctx.locked) return;
        if (id === 'walk') {
          if (walking) stopWalk();
          else startWalk();
        } else if (id === 'grow') {
          stopWalk();
          visited.clear();
          select(null);
          regrow();
        }
        ctx.requestRender();
      },

      render() {
        const now = performance.now();
        const dt = Math.min(0.06, (now - lastFrame) / 1000);
        lastFrame = now;
        if (structureDirty || surface.width !== lastW || surface.height !== lastH) {
          rebuild(now);
          updateReadouts();
        }
        prevHits = hits;
        hits = [];
        surface.begin();
        const busy = stepAnims(now, dt);
        const walkBusy = stepWalk(now);
        const A = ease.inOutCubic(treeAlpha);
        if (A > 0) {
          drawBands(now, A);
          drawTree(now, A);
          drawProduct(now, A);
          drawPanel(now, A);
        }
        drawList(1 - A);
        drawCards(now);
        updateKeyTargets();
        if (busy || walkBusy) ctx.requestRender();
      },

      destroy: () => surface.destroy(),
    };
  },
});
