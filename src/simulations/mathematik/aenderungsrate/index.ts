import { defineSimulation, ease, mixColor, Plot, prefersReducedMotion, roundRect, Surface, withAlpha, type Rect } from '../../../sim-core';
import { formula, type FormulaBox, type FormulaStyle } from './formula';
import {
  distance,
  DOUBLING,
  emptyAt,
  errorLadder,
  monotony,
  nextDouble,
  ownSituation,
  partialSums,
  rateExtent,
  riemannSum,
  sampleHeights,
  samplePoint,
  signChanges,
  signedAreas,
  SITS,
  stockExtent,
  type Rule,
  type Situation,
  type SitKey,
} from './model';

const L = (de: string, en: string) => ({ de, en });
type Txt = { de: string; en: string };
type Lng = 'de' | 'en';
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (t: number) => clamp(t, 0, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const TAU = Math.PI * 2;

/** Dauer eines ganzen Ablaufs 0 → T bei normaler Geschwindigkeit (s). */
const RUN_S = 8;
const OWN_KEYS = ['r0', 'r1', 'r2', 'r3', 'r4'] as const;
const RULES: Rule[] = ['l', 'r', 'm'];

type Target = Parameters<Surface['addTarget']>[0];
type Ptr = Parameters<Target['pointerDown']>[0];

/** Ein angezeigter Wert, der seinem Ziel weich folgt (exponentiell) oder in einem Übergang gleitet. */
class Chan {
  v: number;
  goal: number;
  private tau = 0;
  private tw: { from: number; to: number; t0: number; dur: number; e: (t: number) => number } | null = null;
  constructor(v: number) {
    this.v = v;
    this.goal = v;
  }
  jump(v: number): void {
    this.v = v;
    this.goal = v;
    this.tw = null;
  }
  follow(goal: number, tau: number): void {
    this.tw = null;
    this.goal = goal;
    this.tau = tau;
  }
  glide(goal: number, dur: number, delay: number, now: number, e: (t: number) => number = ease.inOutCubic): void {
    this.goal = goal;
    this.tw = { from: this.v, to: goal, t0: now + delay, dur: Math.max(1, dur), e };
  }
  get busy(): boolean {
    return this.tw !== null || this.v !== this.goal;
  }
  /** Einen Schritt weiter; true, solange noch Bewegung ist. */
  step(now: number, dt: number): boolean {
    const tw = this.tw;
    if (tw) {
      const t = (now - tw.t0) / tw.dur;
      if (t >= 1) {
        this.v = tw.to;
        this.tw = null;
        return true;
      }
      this.v = lerp(tw.from, tw.to, tw.e(clamp01(t)));
      return true;
    }
    if (this.v === this.goal) return false;
    if (this.tau <= 0) {
      this.v = this.goal;
      return true;
    }
    this.v += (this.goal - this.v) * (1 - Math.exp(-dt / this.tau));
    if (Math.abs(this.goal - this.v) <= 1e-6 * (1 + Math.abs(this.goal))) this.v = this.goal;
    return true;
  }
}

/** Bezeichnungen, Einheiten und Deutung je Situation. */
interface Meta {
  title: Txt;
  /** kurzer Name für schmale Bildschirme */
  short: Txt;
  /** Einheiten: Zeit, Rate, Bestand */
  tu: string;
  ru: string;
  bu: string;
  /** Namen von Rate und Bestand (Formelzeichen) */
  r: string;
  b: string;
  rate: Txt;
  stock: Txt;
  /** Rechte Seite(n) des Terms der Rate (Kurzschrift aus formula.ts) */
  src: Txt[];
  note: Txt;
  /** Bewegung (Straße) oder Behälter (Tank) */
  road: boolean;
  /** Name der mittleren Rate */
  mean: Txt;
  /** Name von ∫|r| */
  absName: Txt;
}

const META: Record<SitKey, Meta> = {
  car: {
    title: L('Autofahrt: Geschwindigkeit → Weg', 'Car journey: velocity → distance'),
    short: L('Autofahrt', 'Car journey'),
    tu: 's',
    ru: 'm/s',
    bu: 'm',
    r: 'v',
    b: 's',
    rate: L('Geschwindigkeit', 'velocity'),
    stock: L('zurückgelegter Weg', 'distance travelled'),
    src: [L('v(t) = 2t  \\c{m}{(0 ≤ t ≤ 10)}', 'v(t) = 2t  \\c{m}{(0 ≤ t ≤ 10)}'), L('v(t) = 20  \\c{m}{(10 ≤ t ≤ 40)}', 'v(t) = 20  \\c{m}{(10 ≤ t ≤ 40)}'), L('v(t) = 100 − 2t  \\c{m}{(40 ≤ t ≤ 50)}, \\t{dann} 0', 'v(t) = 100 − 2t  \\c{m}{(40 ≤ t ≤ 50)}, \\t{then} 0')],
    note: L('Anfahren mit 2 m/s², 30 s mit 20 m/s (72 km/h), gleichmäßig bremsen, dann stehen.', 'Starting off at 2 m/s², 30 s at 20 m/s (72 km/h), braking evenly, then standing still.'),
    road: true,
    mean: L('Durchschnittsgeschwindigkeit', 'average velocity'),
    absName: L('zurückgelegter Weg', 'distance travelled'),
  },
  bike: {
    title: L('Radfahrt: Geschwindigkeit → Weg', 'Bike ride: velocity → distance'),
    short: L('Radfahrt', 'Bike ride'),
    tu: 's',
    ru: 'm/s',
    bu: 'm',
    r: 'v',
    b: 's',
    rate: L('Geschwindigkeit', 'velocity'),
    stock: L('zurückgelegter Weg', 'distance travelled'),
    src: [L('v(t) = 5 + 3 · \\t{sin}(\\f{π}{30}t)', 'v(t) = 5 + 3 · \\t{sin}(\\f{π}{30}t)')],
    note: L('Hügelige Strecke: bergauf langsamer, bergab schneller – immer zwischen 2 und 8 m/s.', 'Hilly route: slower uphill, faster downhill – always between 2 and 8 m/s.'),
    road: true,
    mean: L('Durchschnittsgeschwindigkeit', 'average velocity'),
    absName: L('zurückgelegter Weg', 'distance travelled'),
  },
  back: {
    title: L('Vor und zurück: Geschwindigkeit → Position', 'Forwards and back: velocity → position'),
    short: L('Vor und zurück', 'Forwards and back'),
    tu: 's',
    ru: 'm/s',
    bu: 'm',
    r: 'v',
    b: 's',
    rate: L('Geschwindigkeit (negativ: rückwärts)', 'velocity (negative: backwards)'),
    stock: L('Position (Abstand vom Start)', 'position (distance from the start)'),
    src: [L('v > 0: \\t{vorwärts},  v < 0: \\t{rückwärts}', 'v > 0: \\t{forwards},  v < 0: \\t{backwards}')],
    note: L('Rangieren: 20 s vorwärts (bis 4 m/s), dann 20 s rückwärts (bis 2 m/s). Der Wegzähler zählt jeden Meter, die Position nur die Gesamtänderung.', 'Manoeuvring: 20 s forwards (up to 4 m/s), then 20 s backwards (up to 2 m/s). The trip meter counts every metre, the position only the total change.'),
    road: true,
    mean: L('mittlere Geschwindigkeit', 'average velocity'),
    absName: L('zurückgelegter Weg (Wegzähler)', 'distance travelled (trip meter)'),
  },
  tank: {
    title: L('Wassertank: Zuflussrate → Füllmenge', 'Water tank: inflow rate → volume'),
    short: L('Wassertank', 'Water tank'),
    tu: 'min',
    ru: 'L/min',
    bu: 'L',
    r: 'r',
    b: 'V',
    rate: L('Zuflussrate (negativ: Abfluss)', 'inflow rate (negative: outflow)'),
    stock: L('Füllmenge', 'volume'),
    src: [L('r(t) = 4 − 0,2t', 'r(t) = 4 − 0.2t')],
    note: L('Anfangs fließen 4 L pro Minute zu; der Zufluss lässt nach, ab 20 min fließt mehr ab als zu.', 'At first 4 L per minute flow in; the inflow weakens, after 20 min more flows out than in.'),
    road: false,
    mean: L('mittlere Zuflussrate', 'average inflow rate'),
    absName: L('insgesamt geflossen (Zu- und Abfluss)', 'total flow (in and out)'),
  },
  own: {
    title: L('Eigene Zuflussrate → Füllmenge', 'Your own inflow rate → volume'),
    short: L('Eigene Rate', 'Own rate'),
    tu: 'min',
    ru: 'L/min',
    bu: 'L',
    r: 'r',
    b: 'V',
    rate: L('Zuflussrate (negativ: Abfluss)', 'inflow rate (negative: outflow)'),
    stock: L('Füllmenge', 'volume'),
    src: [L('\\t{Streckenzug durch fünf Punkte}', '\\t{polyline through five points}')],
    note: L('Ziehe die fünf blauen Punkte im Diagramm der Rate. Zwischen den Punkten ändert sich die Rate gleichmäßig – die Flächen sind Trapeze und Dreiecke.', 'Drag the five blue points in the rate chart. Between the points the rate changes evenly – the areas are trapezoids and triangles.'),
    road: false,
    mean: L('mittlere Zuflussrate', 'average inflow rate'),
    absName: L('insgesamt geflossen (Zu- und Abfluss)', 'total flow (in and out)'),
  },
};

/**
 * Integral als Gesamtänderung. Oben eine kleine Szene (Auto bzw. Fahrrad auf
 * der Straße mit Tacho und Wegzähler, Wassertank mit Zu- und Abfluss) mit
 * Zeitleiste und Abspielknopf, darunter das Diagramm der Änderungsrate r(t)
 * mit der Fläche bis zum Zeitpunkt t (oberhalb der Achse grün, unterhalb rot)
 * und wahlweise Rechteckstreifen (linker Rand, rechter Rand, Mitte), ganz
 * unten der rekonstruierte Bestand B(t) = B(0) + ∫₀ᵗ r(u) du – in denselben
 * Farben wie die Flächen – mit Änderungspfeil, Tangente, Extremstellen und der
 * Treppe der Teilsummen. Herzstück ist „Zeit läuft“ (Uhr): Die Fläche füllt
 * sich, die Szene bewegt sich, die Zahlen zählen mit. „Rechtecke stapeln“
 * trägt die Streifen nacheinander als Stufen in den Bestand ein, „Streifen
 * verdoppeln“ zeigt den Fehler beim Verfeinern. Bei „vor und zurück“ sieht man
 * den Unterschied zwischen Gesamtänderung und zurückgelegtem Weg. Bei der
 * eigenen Zuflussrate zieht man fünf Punkte eines Streckenzugs. Rechts Karten
 * mit Rechnung und Einheiten, Rechtecksummen, Fehler und Deutung. Mit
 * „Werte zeigen“ aus sind die Lösungen verdeckt (Aufgaben), „Aufdecken“ löst auf.
 */
export default defineSimulation({
  id: 'aenderungsrate',
  dragHint: true,
  animated: true,
  layout: { aspect: 1.32, aspectNarrow: 0.34 },
  groups: [
    { id: 'own', label: L('Eigene Zuflussrate', 'Your own inflow rate') },
    { id: 'view', label: L('Anzeige', 'Display') },
  ],
  params: [
    {
      key: 'sit',
      type: 'choice',
      label: L('Situation', 'Situation'),
      options: [
        { value: 'car', label: L('Autofahrt (Geschwindigkeit → Weg)', 'Car journey (velocity → distance)') },
        { value: 'bike', label: L('Radfahrt (Geschwindigkeit → Weg)', 'Bike ride (velocity → distance)') },
        { value: 'back', label: L('Vor und zurück (Geschwindigkeit → Position)', 'Forwards and back (velocity → position)') },
        { value: 'tank', label: L('Wassertank (Zufluss → Füllmenge)', 'Water tank (inflow → volume)') },
        { value: 'own', label: L('Eigene Zuflussrate (Punkte ziehen)', 'Your own inflow rate (drag points)') },
      ],
      default: 'car',
    },
    {
      key: 't',
      type: 'number',
      label: L('Zeitpunkt t', 'Time t'),
      help: L('Auch im Diagramm ziehen oder die Zeitleiste in der Szene benutzen.', 'You can also drag in the chart or use the timeline in the scene.'),
      min: 0,
      max: 120,
      step: 0.5,
      default: 25,
    },
    { key: 'n', type: 'number', label: L('Rechteckstreifen n', 'Rectangles n'), min: 0, max: 64, step: 1, default: 0, help: L('0: keine Streifen, nur die exakte Fläche.', '0: no rectangles, only the exact area.') },
    {
      key: 'rule',
      type: 'choice',
      label: L('Höhe der Rechtecke', 'Height of the rectangles'),
      options: [
        { value: 'l', label: L('linker Rand', 'left edge') },
        { value: 'r', label: L('rechter Rand', 'right edge') },
        { value: 'm', label: L('Mitte', 'midpoint') },
      ],
      default: 'l',
      visibleIf: (v) => Number(v.n) > 0,
    },
    { key: 'v0', type: 'number', label: L('Anfangsmenge im Tank V(0)', 'Initial volume in the tank V(0)'), min: 0, max: 60, step: 1, default: 30, unit: 'L', visibleIf: (v) => v.sit === 'tank' || v.sit === 'own' },
    ...OWN_KEYS.map((key, i) => ({
      key,
      type: 'number' as const,
      group: 'own',
      label: L(`r(${i * 10})`, `r(${i * 10})`),
      help: i === 0 ? L('Auch die blauen Punkte im Diagramm ziehen.', 'You can also drag the blue points in the chart.') : undefined,
      min: -5,
      max: 5,
      step: 0.5,
      default: [2, 4, 0, -3, 1][i]!,
      unit: 'L/min',
      visibleIf: (v: Record<string, unknown>) => v.sit === 'own',
    })),
    { key: 'show', type: 'boolean', group: 'view', label: L('Werte zeigen', 'Show values'), help: L('Aus: Bestand und Ergebnisse sind verdeckt – erst selbst rechnen, dann aufdecken.', 'Off: amount and results are hidden – work them out first, then reveal.'), default: true },
  ],
  actions: [
    { id: 'play', label: L('Ablauf abspielen', 'Play the process'), primary: true },
    { id: 'stack', label: L('Rechtecke stapeln', 'Stack the rectangles') },
    { id: 'dbl', label: L('Streifen verdoppeln', 'Double the strips') },
    { id: 'reveal', label: L('Lösung aufdecken', 'Reveal the solution'), primary: true, visibleIf: (v) => v.show !== true },
  ],
  readouts: [
    { key: 'chg', label: L('Gesamtänderung', 'Total change'), spoiler: true },
    { key: 'stock', label: L('Bestand', 'Amount'), spoiler: true },
    { key: 'sum', label: L('Rechtecksumme', 'Rectangle sum'), spoiler: true },
    { key: 'dist', label: L('Insgesamt bewegt (Betrag)', 'Total moved (absolute)'), spoiler: true },
  ],
  presets: [
    { id: 'car', label: L('Autofahrt: Fläche = Weg', 'Car journey: area = distance'), values: {} },
    { id: 'rect', label: L('Rechtecke: links, rechts, Mitte', 'Rectangles: left, right, midpoint'), values: { sit: 'car', t: 25, n: 5 } },
    { id: 'mid', label: L('Mittelpunkt-Rechtecke: exakt bei linearer Rate', 'Midpoint rectangles: exact for a linear rate'), values: { sit: 'tank', t: 20, n: 2, rule: 'm' } },
    { id: 'tank', label: L('Tank: Zufluss wird Abfluss', 'Tank: inflow turns into outflow'), values: { sit: 'tank', t: 30, v0: 30 } },
    { id: 'back', label: L('Vor und zurück: 30 m Änderung, 90 m Weg', 'Forwards and back: 30 m change, 90 m distance'), values: { sit: 'back', t: 40 } },
    { id: 'own', label: L('Eigene Rate mit Maximum und Minimum', 'Own rate with maximum and minimum'), values: { sit: 'own', t: 40, v0: 30 } },
    { id: 'bike', label: L('Radfahrt: feine Mittelpunkt-Streifen', 'Bike ride: fine midpoint strips'), values: { sit: 'bike', t: 90, n: 32, rule: 'm' } },
  ],
  strings: {
    de: {
      canvas:
        'Oben eine Szene: ein Auto oder Fahrrad auf einer Straße mit Tacho und Wegzähler bzw. ein Wassertank mit Zu- und Abfluss, darunter eine Zeitleiste mit Abspielknopf. Darunter das Diagramm der Änderungsrate über der Zeit mit der Fläche bis zum Zeitpunkt t – oberhalb der Achse grün, unterhalb rot – und wahlweise Rechteckstreifen; ganz unten der daraus rekonstruierte Bestand (Weg, Position oder Füllmenge) in denselben Farben, mit Änderungspfeil, Tangente, Extremstellen und der Treppe der Rechtecksummen. Rechts Karten mit Rechnung und Einheiten, Rechtecksummen, Fehler beim Verdoppeln und Deutung.',
    },
    en: {
      canvas:
        'At the top a scene: a car or bike on a road with speedometer and trip meter, or a water tank with inflow and outflow, with a timeline and a play button below. Underneath the chart of the rate of change over time with the area up to time t – green above the axis, red below – and optional rectangles; at the bottom the reconstructed amount (distance, position or volume) in the same colours, with change arrow, tangent, extrema and the staircase of rectangle sums. On the right cards with the calculation and units, rectangle sums, the error when doubling and interpretation.',
    },
  },

  mount(ctx) {
    const surface = new Surface(ctx, ctx.t('canvas'));
    const p = ctx.params;
    const fmt = ctx.fmt;
    const th = () => ctx.theme;
    const reduced = () => prefersReducedMotion();
    const lang = ctx.lang as Lng;
    const say = (s: Txt) => s[lang];
    const T2 = (de: string, en: string) => (lang === 'de' ? de : en);
    const editable = () => !ctx.locked;
    const setP = (vals: Record<string, number | boolean | string>) => ctx.set(vals as never);
    const sitKey = () => p.sit as SitKey;
    const rule = () => p.rule as Rule;
    const isTank = (k: SitKey = sitKey()) => k === 'tank' || k === 'own';

    /* ---------- Farben (gleiche Farbe = gleiche Größe in Szene, Diagrammen und Karten) ---------- */
    const col = {
      r: () => th().series[0]!,
      neg: () => th().series[1]!,
      pos: () => th().series[2]!,
      t: () => th().series[3]!,
      q: () => th().series[4]!,
      w: () => th().series[5]!,
    };
    /** Farbe einer Änderung: grün bei Zunahme, rot bei Abnahme */
    const sc = (v: number) => (v < -1e-9 ? col.neg() : col.pos());
    /** Textfarbe zu einer Akzentfarbe (dunkler bzw. heller, gut lesbar) */
    const ink = (c: string) => mixColor(c, th().text, 0.3);

    /* ---------- Zahlen ---------- */
    const clean = (v: number, d: number) => (Math.abs(v) < 0.5 * 10 ** -d ? 0 : v);
    const N = (v: number, d = 1) => (Number.isFinite(v) ? fmt.num(clean(v, d), d) : '–');
    const S = (v: number, d = 1) => {
      const c = clean(v, d);
      return c > 0 ? `+ ${N(c, d)}` : c < 0 ? `− ${N(-c, d)}` : '± 0';
    };
    const isExact = (v: number, d = 1) => Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
    const eq = (v: number, d = 1) => (isExact(v, d) ? '=' : '≈');

    /* ---------- Situation (exakt aus den Reglern) ---------- */
    let ownKey = '';
    let ownExact: Situation = ownSituation([2, 4, 0, -3, 1]);
    function sitOf(k: SitKey, vals?: number[]): Situation {
      if (k !== 'own') return SITS[k];
      const v = vals ?? OWN_KEYS.map((key) => p[key] as number);
      const id = v.join(',');
      if (!vals && id === ownKey) return ownExact;
      const s = ownSituation(v);
      if (!vals) {
        ownKey = id;
        ownExact = s;
      }
      return s;
    }
    const exactSit = () => sitOf(sitKey());
    const tEff = () => clamp(p.t, 0, exactSit().T);
    const b0Of = (k: SitKey) => (isTank(k) ? p.v0 : 0);

    /* ---------- angezeigter Zustand ---------- */
    const TT = new Chan(tEff());
    const B0 = new Chan(b0Of(sitKey()));
    const OWN = OWN_KEYS.map((k) => new Chan(p[k] as number));
    const rng = { T: new Chan(exactSit().T), ry0: new Chan(-2), ry1: new Chan(24), sy0: new Chan(-60), sy1: new Chan(900) };
    const kShow = new Chan(p.show ? 1 : 0);
    const kRect = new Chan(p.n > 0 ? 1 : 0);
    const cardH = new Map<string, Chan>();
    const cardA = new Map<string, Chan>();
    const chans = () => [TT, B0, ...OWN, ...Object.values(rng), kShow, kRect, ...cardH.values(), ...cardA.values()];

    let intro: number | null = null;
    /** Übergang beim Wechsel der Situation: alte Situation blendet in die neue über */
    let morph: { from: SitKey; fromSit: Situation; fromB0: number; fromT: number; t0: number; dur: number } | null = null;
    let morphK = 1;
    /** Rechtecke wachsen aus den alten (Wechsel von n oder der Regel) */
    let nFrom: { n: number; rule: Rule; t0: number } | null = null;
    /** Rechtecke stapeln: Streifen für Streifen in den Bestand */
    let stack: { t0: number; n: number; per: number } | null = null;
    /** Aufdecken der Lösung */
    let revealT: number | null = null;
    /** Ende des Ablaufs (kleines Aufleuchten) */
    let finishT: number | null = null;
    /** laufende Zeit des Ablaufs (Uhr) */
    let runT = tEff();
    let lastTime = performance.now();
    let frameNow = performance.now();
    let frameDt = 0;
    let numsBusy = false;
    let lastDrag = -Infinity;
    let drag: { kind: 'time'; from: 'plot' | 'track' } | { kind: 'own'; i: number } | null = null;
    let hover: { id: string; px: number; py: number } | null = null;
    const dragging = () => drag !== null || performance.now() - lastDrag < 250;
    const running = () => ctx.clock.playing;

    /* ---------- weich zählende Zahlen ---------- */
    const nums = new Map<string, { c: Chan; at: number }>();
    /** Zahl, die im Bild und in den Karten weich zu ihrem Wert zählt. */
    function cnt(id: string, v: number): number {
      if (!Number.isFinite(v) || reduced()) return v;
      let e = nums.get(id);
      if (!e) {
        e = { c: new Chan(intro !== null ? 0 : v), at: -1 };
        nums.set(id, e);
      }
      if (e.at !== frameNow) {
        e.at = frameNow;
        if (running() || dragging()) e.c.jump(v);
        else e.c.follow(v, 0.18);
        if (e.c.step(frameNow, frameDt)) numsBusy = true;
      }
      return e.c.v;
    }
    /** gezählte, formatierte Zahl; am Ziel exakt */
    const cN = (id: string, v: number, d = 1) => {
      const s = cnt(id, v);
      return Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? N(v, d) : N(s, d);
    };
    const cSc = (id: string, v: number, d = 1) => cS(id, v, d).replace(/^([+−]) /, '$1');
    const cS = (id: string, v: number, d = 1) => {
      const s = cnt(id, v);
      return S(Math.abs(s - v) < 1e-9 * Math.max(1, Math.abs(v)) ? v : s, d);
    };

    /* ---------- Aufteilung (nach Breite UND Höhe) ---------- */
    const isWide = () => surface.width >= 640 || surface.width >= surface.height * 1.3;
    const sm = () => surface.width < 560;
    const fs = (big: number, small: number) => (sm() ? small : big);
    function regions(): { scene: Rect; top: Rect; bot: Rect; col: Rect; wide: boolean } {
      const w = surface.width;
      const h = surface.height;
      if (isWide()) {
        const cw = Math.round(clamp(w * 0.31, 236, 350));
        const lw = w - cw - 12;
        const sh = Math.round(clamp(h * 0.26, 112, 168));
        const rest = h - sh - 8;
        const t1 = Math.round(rest * 0.5);
        return {
          scene: { x: 0, y: 0, w: lw, h: sh },
          top: { x: 0, y: sh + 8, w: lw, h: t1 },
          bot: { x: 0, y: sh + 8 + t1 + 4, w: lw, h: rest - t1 - 4 },
          col: { x: w - cw, y: 0, w: cw, h },
          wide: true,
        };
      }
      const sh = Math.round(clamp(w * 0.44, 150, 176));
      const ph = Math.round(clamp(w * 0.6, 196, 250));
      return {
        scene: { x: 0, y: 0, w, h: sh },
        top: { x: 0, y: sh + 8, w, h: ph },
        bot: { x: 0, y: sh + 8 + ph + 4, w, h: ph },
        col: { x: 0, y: sh + 8 + 2 * ph + 4 + 12, w, h: h - (sh + 8 + 2 * ph + 4 + 12) },
        wide: false,
      };
    }
    const PAD = () => ({ left: fs(48, 42), bottom: fs(24, 22), top: fs(36, 34), right: fs(16, 12) });
    const plot = new Plot(surface, { x: [0, 60], y: [-2, 24], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().top });
    const plotB = new Plot(surface, { x: [0, 60], y: [0, 900], equalAspect: false, pan: false, zoom: false, controls: false, region: () => regions().bot });

    /* ---------- Formeln ---------- */
    const fstyle = (size: number, color = th().text, weight = 600): FormulaStyle => ({
      size,
      font: th().font,
      mathFont: th().mathFont,
      color,
      weight,
      palette: { r: col.r(), p: ink(col.pos()), n: col.neg(), t: ink(col.t()), q: ink(col.q()), w: ink(col.w()), m: th().muted, x: th().text },
    });
    function fit(src: string, maxW: number, size: number, color = th().text, weight = 600, minSize = 11): FormulaBox {
      const g = surface.g;
      let s = size;
      let box = formula(g, src, fstyle(s, color, weight));
      while (box.w > maxW && s > minSize) {
        s -= 0.5;
        box = formula(g, src, fstyle(s, color, weight));
      }
      return box;
    }
    const u = (unit: string) => `\\t{${unit}}`;

    /* ---------- Zeichenhilfen ---------- */
    type PillOpts = { color?: string; border?: string; align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; weight?: number; dry?: boolean; fill?: string; dashed?: boolean };
    /** Beschriftung als Formel in einer runden „Pille“ mit weichem Schatten. */
    function fpill(x: number, y: number, src: string, opts: PillOpts = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const color = opts.color ?? th().text;
      const box = formula(g, src, fstyle(size, color, opts.weight ?? 700));
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - box.w : x - box.w / 2;
      if (opts.bounds) left = clamp(left, opts.bounds.x + 10, opts.bounds.x + opts.bounds.w - box.w - 10);
      let bl = y + (box.asc - box.desc) / 2;
      if (opts.bounds) bl = clamp(bl, opts.bounds.y + box.asc + 7, opts.bounds.y + opts.bounds.h - box.desc - 7);
      const rr = { x: left - 8, y: bl - box.asc - 5, w: box.w + 16, h: box.asc + box.desc + 10 };
      const a = opts.alpha ?? 1;
      if (opts.dry || a <= 0.01) return rr;
      g.save();
      g.globalAlpha *= a;
      g.save();
      g.fillStyle = opts.fill ?? (th().dark ? 'rgba(15,20,30,0.9)' : 'rgba(255,255,255,0.94)');
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.45)' : 'rgba(16,24,40,0.14)';
      g.shadowBlur = 8;
      g.shadowOffsetY = 2;
      roundRect(g, rr.x, rr.y, rr.w, rr.h, Math.min(11, rr.h / 2));
      g.fill();
      g.restore();
      if (opts.border) {
        g.strokeStyle = opts.border;
        g.lineWidth = 1.3;
        if (opts.dashed) g.setLineDash([4, 3]);
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, Math.min(11, rr.h / 2));
        g.stroke();
        g.setLineDash([]);
      }
      box.draw(g, left, bl);
      g.restore();
      return rr;
    }
    const pillW = (src: string, size: number) => formula(surface.g, src, fstyle(size, th().text, 700)).w + 16;

    /** Gestalteter Platzhalter für verdeckte Werte: gestrichelte Pille mit Schloss und „?“. */
    function placeholder(x: number, y: number, opts: { align?: 'left' | 'center' | 'right'; size?: number; alpha?: number; bounds?: Rect; label?: string; color?: string } = {}): Rect {
      const g = surface.g;
      const size = opts.size ?? fs(13, 12);
      const label = opts.label ?? '?';
      g.font = `750 ${size}px ${th().font}`;
      const tw = g.measureText(label).width;
      const w = tw + 34;
      const h = size + 12;
      const align = opts.align ?? 'center';
      let left = align === 'left' ? x : align === 'right' ? x - w : x - w / 2;
      let top = y - h / 2;
      if (opts.bounds) {
        left = clamp(left, opts.bounds.x + 4, opts.bounds.x + opts.bounds.w - w - 4);
        top = clamp(top, opts.bounds.y + 4, opts.bounds.y + opts.bounds.h - h - 4);
      }
      const rr = { x: left, y: top, w, h };
      const a = opts.alpha ?? 1;
      if (a <= 0.01) return rr;
      const c = opts.color ?? th().muted;
      g.save();
      g.globalAlpha *= a;
      const grad = g.createLinearGradient(0, top, 0, top + h);
      grad.addColorStop(0, withAlpha(th().dark ? '#2a3446' : '#eef2f7', 0.95));
      grad.addColorStop(1, withAlpha(th().dark ? '#1c2533' : '#e2e8f0', 0.95));
      g.fillStyle = grad;
      roundRect(g, left, top, w, h, h / 2);
      g.fill();
      g.strokeStyle = withAlpha(th().dark ? '#7c8aa3' : '#94a3b8', 0.9);
      g.lineWidth = 1.2;
      g.setLineDash([4, 3]);
      roundRect(g, left + 0.5, top + 0.5, w - 1, h - 1, h / 2);
      g.stroke();
      g.setLineDash([]);
      // Schloss
      const lx = left + 12;
      const ly = top + h / 2 + 1;
      g.strokeStyle = c;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(lx, ly - 3.2, 2.6, Math.PI, 0);
      g.stroke();
      g.fillStyle = c;
      roundRect(g, lx - 4, ly - 3, 8, 6.5, 1.5);
      g.fill();
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = c;
      g.fillText(label, left + 23, top + h / 2 + 0.5);
      g.restore();
      return rr;
    }

    function halo(x: number, y: number, color: string, r: number, alpha: number): void {
      if (alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      const g = surface.g;
      g.save();
      const grad = g.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, withAlpha(color, 0.42 * alpha));
      grad.addColorStop(1, withAlpha(color, 0));
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
    }
    function dot(x: number, y: number, color: string, r: number, alpha = 1, hollow = false): void {
      const g = surface.g;
      if (r <= 0.2 || alpha <= 0.01 || !Number.isFinite(x) || !Number.isFinite(y)) return;
      g.save();
      g.globalAlpha *= alpha;
      if (hollow) {
        g.fillStyle = th().bg;
        g.strokeStyle = color;
        g.lineWidth = 2.2;
        g.beginPath();
        g.arc(x, y, r, 0, TAU);
        g.fill();
        g.stroke();
        g.restore();
        return;
      }
      g.save();
      g.shadowColor = th().dark ? 'rgba(0,0,0,0.55)' : 'rgba(16,24,40,0.28)';
      g.shadowBlur = 5;
      g.shadowOffsetY = 1;
      const grad = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0.5, x, y, r);
      grad.addColorStop(0, mixColor(color, '#ffffff', 0.45));
      grad.addColorStop(1, color);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
      g.restore();
      g.strokeStyle = th().bg;
      g.lineWidth = 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.stroke();
      g.restore();
    }
    function arrowPx(x0: number, y0: number, x1: number, y1: number, color: string, width: number, head = 9): void {
      const g = surface.g;
      const len = Math.hypot(x1 - x0, y1 - y0);
      if (len < 1.5 || !Number.isFinite(len)) return;
      const ux = (x1 - x0) / len;
      const uy = (y1 - y0) / len;
      const hd = Math.min(head, len * 0.5);
      g.strokeStyle = color;
      g.fillStyle = color;
      g.lineWidth = width;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x1 - ux * hd * 0.7, y1 - uy * hd * 0.7);
      g.stroke();
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x1 - ux * hd - uy * hd * 0.55, y1 - uy * hd + ux * hd * 0.55);
      g.lineTo(x1 - ux * hd + uy * hd * 0.55, y1 - uy * hd - ux * hd * 0.55);
      g.closePath();
      g.fill();
    }
    function card(r: Rect, accent?: string, dashed = false): void {
      const g = surface.g;
      const theme = th();
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : 'rgba(16,24,40,0.10)';
      g.shadowBlur = 12;
      g.shadowOffsetY = 3;
      g.fillStyle = theme.dark ? '#151c27' : '#ffffff';
      roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
      g.fill();
      g.restore();
      if (accent) {
        const grad = g.createLinearGradient(r.x, r.y, r.x, r.y + Math.min(80, r.h));
        grad.addColorStop(0, withAlpha(accent, theme.dark ? 0.13 : 0.075));
        grad.addColorStop(1, withAlpha(accent, 0));
        g.fillStyle = grad;
        roundRect(g, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 12);
        g.fill();
      }
      g.save();
      g.strokeStyle = dashed && accent ? withAlpha(accent, 0.55) : theme.dark ? '#273142' : '#e1e6ee';
      g.lineWidth = 1.2;
      if (dashed) g.setLineDash([5, 4]);
      roundRect(g, r.x + 1.5, r.y + 1.5, r.w - 3, r.h - 3, 12);
      g.stroke();
      g.restore();
    }
    const wOf = (src: string, size: number, weight = 700) => formula(surface.g, src, fstyle(size, th().text, weight)).w;
    function cardTitle(R: Rect, title: string, color: string, right?: string): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const ty = R.y + pad + 7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(R.x + pad + 4.5, ty, 4.5, 0, TAU);
      g.fill();
      let tsz = fs(13.5, 12.5);
      g.font = `750 ${tsz}px ${th().font}`;
      if (right && g.measureText(title).width > R.w - 2 * pad - 15 - wOf(right, fs(12, 11)) - 12) right = undefined;
      const room0 = R.w - 2 * pad - 15 - (right ? wOf(right, fs(12, 11)) + 12 : 0);
      while (g.measureText(title).width > room0 && tsz > 11) {
        tsz -= 0.5;
        g.font = `750 ${tsz}px ${th().font}`;
      }
      let shown = title;
      while (g.measureText(shown).width > room0 && shown.length > 4) shown = `${shown.slice(0, -2).trimEnd()}…`;
      g.textAlign = 'left';
      g.textBaseline = 'middle';
      g.fillStyle = th().text;
      g.fillText(shown, R.x + pad + 15, ty);
      if (right) {
        const rb = formula(g, right, fstyle(fs(12, 11), color, 700));
        rb.draw(g, R.x + R.w - pad - rb.w, ty + (rb.asc - rb.desc) / 2);
      }
      return ty;
    }
    function wrapText(str: string, maxW: number, font: string): string[] {
      const g = surface.g;
      g.font = font;
      const lines: string[] = [];
      let cur = '';
      for (const w of str.split(' ')) {
        const test = cur ? `${cur} ${w}` : w;
        if (g.measureText(test).width > maxW && cur) {
          lines.push(cur);
          cur = w;
        } else cur = test;
      }
      if (cur) lines.push(cur);
      return lines;
    }
    /** Kurve in Pixeln (mit weichem Schatten und Glanzlicht). */
    function strokePts(pts: [number, number][], color: string, width: number, opts: { glow?: boolean; dash?: number[]; alpha?: number } = {}): void {
      if (pts.length < 2) return;
      const g = surface.g;
      g.save();
      g.globalAlpha *= opts.alpha ?? 1;
      g.lineJoin = 'round';
      g.lineCap = 'round';
      if (opts.dash) g.setLineDash(opts.dash);
      const path = () => {
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
      };
      if (opts.glow) {
        g.save();
        g.shadowColor = th().dark ? 'rgba(0,0,0,0.65)' : mixColor(color, '#ffffff', 0.4, 0.55);
        g.shadowBlur = th().dark ? 9 : 7;
        g.shadowOffsetY = 2;
        g.strokeStyle = color;
        g.lineWidth = width;
        path();
        g.stroke();
        g.restore();
      }
      g.strokeStyle = color;
      g.lineWidth = width;
      path();
      g.stroke();
      if (opts.glow && width >= 2.5) {
        g.translate(0, -width * 0.22);
        g.strokeStyle = withAlpha('#ffffff', th().dark ? 0.2 : 0.38);
        g.lineWidth = Math.max(1, width * 0.3);
        path();
        g.stroke();
      }
      g.restore();
    }
    /** Werte einer Funktion als Pixelpunkte im Koordinatensystem pl (mit den Knickstellen als Stützstellen). */
    function sample(pl: Plot, f: (x: number) => number, x0: number, x1: number, kinks: number[] = []): [number, number][] {
      if (!(x1 > x0)) return [];
      const count = Math.round(clamp(Math.abs(pl.px(x1) - pl.px(x0)) * 0.8, 16, 700));
      const xs: number[] = [];
      for (let i = 0; i <= count; i++) xs.push(x0 + ((x1 - x0) * i) / count);
      for (const k of kinks) if (k > x0 && k < x1) xs.push(k);
      xs.sort((a, b) => a - b);
      const r = pl.rect;
      return xs.map((x) => [pl.px(x), clamp(pl.py(f(x)), r.y - r.h * 2, r.y + r.h * 3)] as [number, number]);
    }

    /* ---------- Einstieg ---------- */
    interface Intro {
      panel: number;
      reveal: number;
      labels: number;
      cards: number;
      stagger: number;
    }
    const DONE: Intro = { panel: 1, reveal: 1, labels: 1, cards: 1, stagger: 1 };
    function introState(now: number): Intro {
      if (intro === null) return DONE;
      const t = now - intro;
      if (t > 3400) {
        intro = null;
        return DONE;
      }
      return {
        panel: ease.outCubic(clamp01(t / 450)),
        reveal: ease.inOutCubic(clamp01((t - 120) / 1100)),
        labels: ease.outCubic(clamp01((t - 1500) / 600)),
        cards: clamp01((t - 300) / 900),
        stagger: clamp01((t - 700) / 1700),
      };
    }

    /* ---------- angezeigte Situation (mit Übergang) ---------- */
    interface View {
      k: SitKey;
      /** Bezeichnungen (beim Übergang zur Hälfte umgeschaltet) */
      m: Meta;
      /** angezeigte Rate (beim Übergang gemischt) */
      s: Situation;
      T: number;
      b0: number;
      t: number;
      B: (x: number) => number;
      kinks: number[];
      ext: { t: number; kind: 'max' | 'min' }[];
      areas: { pos: number; neg: number };
      dist: number;
    }
    function curShownSit(): Situation {
      return sitKey() === 'own' ? sitOf('own', OWN.map((c) => c.v)) : SITS[sitKey() as Exclude<SitKey, 'own'>];
    }
    function viewOf(): View {
      const cur = curShownSit();
      let s = cur;
      let kinks = cur.kinks ?? [];
      const k = morphK;
      if (morph && k < 1) {
        const old = morph.fromSit;
        s = {
          rate: (x) => lerp(old.rate(x), cur.rate(x), k),
          change: (x) => lerp(old.change(x), cur.change(x), k),
          abs: (x) => lerp(distance(old, x), distance(cur, x), k),
          T: lerp(old.T, cur.T, k),
        };
        kinks = [...(old.kinks ?? []), ...kinks];
      }
      const b0 = B0.v;
      const t = clamp(TT.v, 0, rng.T.v);
      const m = META[morph && k < 0.5 ? morph.from : sitKey()];
      const ext = signChanges(s, 600);
      return {
        k: sitKey(),
        m,
        s,
        T: rng.T.v,
        b0,
        t,
        B: (x) => b0 + s.change(x),
        kinks,
        ext,
        areas: signedAreas(s, t, 600),
        dist: distance(s, t, 600),
      };
    }

    /* =====================================================================
     * Szene: Straße mit Fahrzeug bzw. Wassertank, Instrumente, Zeitleiste
     * ===================================================================== */
    /** Länge der Straße (größte Position) je Situation. */
    const ROAD_MAX: Record<SitKey, number> = { car: 800, bike: 600, back: 60, tank: 0, own: 0 };
    /** Skala des Tachos bzw. Durchflussmessers. */
    const GAUGE: Record<SitKey, [number, number]> = { car: [0, 25], bike: [0, 10], back: [-5, 5], tank: [-5, 5], own: [-5, 5] };
    /** Fassungsvermögen des Tanks (bei der eigenen Rate passend gerundet). */
    function capOf(k: SitKey): number {
      if (k === 'tank') return 100;
      if (k !== 'own') return 100;
      const e = stockExtent(exactSit(), p.v0);
      return Math.max(100, Math.ceil(e.hi / 50) * 50);
    }
    const CAP = new Chan(capOf(sitKey()));

    function sceneGeom(S: Rect): { pic: Rect; inst: Rect | null; play: { x: number; y: number; r: number }; tx0: number; tx1: number; ty: number } {
      const pad = 8;
      const bottom = 34;
      const wideInst = S.w >= 470;
      const iw = wideInst ? Math.round(clamp(S.w * 0.36, 170, 250)) : 0;
      const pic = { x: S.x + pad, y: S.y + pad, w: S.w - 2 * pad - (wideInst ? iw + 8 : 0), h: S.h - pad - bottom };
      const inst = wideInst ? { x: pic.x + pic.w + 8, y: pic.y, w: iw, h: pic.h } : null;
      const ty = S.y + S.h - bottom / 2 - 1;
      const play = { x: S.x + 25, y: ty, r: 13 };
      const lw = fs(92, 84);
      return { pic, inst, play, tx0: S.x + 50, tx1: S.x + S.w - lw - 10, ty };
    }

    /** Wert, der im Bild steht – oder verdeckt (beim Aufdecken überblendet). */
    const shownA = () => kShow.v;

    function drawScene(S: Rect, V: View, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const G = sceneGeom(S);
      card(S);
      // Bild (beim Wechsel zwischen Straße und Tank überblendet)
      const P = G.pic;
      g.save();
      roundRect(g, P.x, P.y, P.w, P.h, 9);
      g.clip();
      const newRoad = META[V.k].road;
      const oldRoad = morph ? META[morph.from].road : newRoad;
      const kk = morph && oldRoad !== newRoad ? morphK : 1;
      if (kk < 1) {
        g.save();
        g.globalAlpha *= 1 - kk;
        if (oldRoad) drawRoad(P, V, morph!.from);
        else drawTank(P, V, morph!.from, now);
        g.restore();
      }
      g.save();
      g.globalAlpha *= kk;
      if (newRoad) drawRoad(P, V, V.k);
      else drawTank(P, V, V.k, now);
      g.restore();
      g.restore();
      // feiner Rand ums Bild
      g.strokeStyle = theme.dark ? '#2b3547' : '#dde3ec';
      g.lineWidth = 1;
      roundRect(g, P.x + 0.5, P.y + 0.5, P.w - 1, P.h - 1, 9);
      g.stroke();
      if (G.inst) drawInstruments(G.inst, V, k);
      else drawMiniInstruments(P, V, k);
      drawTimeline(G, V, k, now);
    }

    /* ---------- Straße ---------- */
    function drawRoad(P: Rect, V: View, key: SitKey): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      const ry0 = P.y + P.h * 0.5;
      const ry1 = P.y + P.h * 0.8;
      // Himmel
      const sky = g.createLinearGradient(0, P.y, 0, ry0);
      sky.addColorStop(0, dark ? '#0d1626' : '#cfe3f7');
      sky.addColorStop(1, dark ? '#1a2740' : '#eef6fd');
      g.fillStyle = sky;
      g.fillRect(P.x, P.y, P.w, ry0 - P.y);
      // Hügel im Hintergrund
      const hill = (amp: number, base: number, ph: number, color: string) => {
        g.fillStyle = color;
        g.beginPath();
        g.moveTo(P.x, ry0);
        for (let x = 0; x <= P.w; x += 6) g.lineTo(P.x + x, base - amp * (0.55 + 0.45 * Math.sin(x / 70 + ph)) * (0.6 + 0.4 * Math.sin(x / 190 + ph * 2)));
        g.lineTo(P.x + P.w, ry0);
        g.closePath();
        g.fill();
      };
      hill(P.h * 0.2, ry0, 0.6, dark ? '#1b2b3a' : '#d5e8d9');
      hill(P.h * 0.12, ry0, 2.3, dark ? '#20352a' : '#bcdcb8');
      // Wiese
      g.fillStyle = dark ? '#1a2a20' : '#cfe6c3';
      g.fillRect(P.x, ry0, P.w, P.y + P.h - ry0);
      // Fahrbahn
      const road = g.createLinearGradient(0, ry0, 0, ry1);
      road.addColorStop(0, dark ? '#2e3540' : '#5f6875');
      road.addColorStop(1, dark ? '#252b34' : '#4d5562');
      g.fillStyle = road;
      g.fillRect(P.x, ry0, P.w, ry1 - ry0);
      g.fillStyle = withAlpha('#ffffff', dark ? 0.35 : 0.75);
      g.fillRect(P.x, ry0 + 1.5, P.w, 1.4);
      g.fillRect(P.x, ry1 - 3, P.w, 1.4);
      const rx0 = P.x + 34;
      const rx1 = P.x + P.w - 46;
      const max = morph && META[morph.from].road && morph.from !== key ? lerp(ROAD_MAX[morph.from], ROAD_MAX[key], morphK) : ROAD_MAX[key];
      const X = (s: number) => rx0 + ((rx1 - rx0) * s) / Math.max(1, max);
      // Mittellinie
      g.save();
      g.strokeStyle = withAlpha('#ffffff', dark ? 0.4 : 0.8);
      g.lineWidth = 1.6;
      g.setLineDash([10, 9]);
      g.beginPath();
      g.moveTo(P.x, (ry0 + ry1) / 2);
      g.lineTo(P.x + P.w, (ry0 + ry1) / 2);
      g.stroke();
      g.restore();
      // Spur: vorwärts oben (grün), rückwärts unten (rot)
      const t = V.t;
      if (t > 0) {
        const steps = Math.max(8, Math.round(clamp((t / Math.max(1e-6, V.T)) * 160, 8, 160)));
        const laneP = ry0 + (ry1 - ry0) * 0.26;
        const laneN = ry0 + (ry1 - ry0) * 0.74;
        g.save();
        g.lineCap = 'round';
        g.lineWidth = 4;
        let prev = V.s.change(0);
        for (let i = 1; i <= steps; i++) {
          const u = (t * i) / steps;
          const cur = V.s.change(u);
          if (Math.abs(cur - prev) > 1e-9) {
            const fwd = cur > prev;
            g.strokeStyle = withAlpha(fwd ? col.pos() : col.neg(), 0.9);
            g.beginPath();
            g.moveTo(X(prev), fwd ? laneP : laneN);
            g.lineTo(X(cur), fwd ? laneP : laneN);
            g.stroke();
          }
          prev = cur;
        }
        g.restore();
      }
      // Kilometersteine
      const lab = ry1 + 10 < P.y + P.h - 4;
      for (let i = 0; i <= 4; i++) {
        const sv = (max * i) / 4;
        const x = X(sv);
        g.fillStyle = dark ? '#cbd5e1' : '#ffffff';
        roundRect(g, x - 2, ry0 - 9, 4, 9, 1.5);
        g.fill();
        g.fillStyle = col.neg();
        g.fillRect(x - 2, ry0 - 9, 4, 2.4);
        if (!lab) continue;
        const txt = i === 0 ? '0 m' : `${N(sv, 0)} m`;
        const a = i === 0 ? 1 : shownA();
        if (a <= 0.02) continue;
        g.save();
        g.globalAlpha *= a;
        g.font = `650 11px ${theme.font}`;
        g.fillStyle = dark ? '#a7b4c6' : '#3f4a59';
        g.textAlign = i === 0 ? 'left' : i === 4 ? 'right' : 'center';
        g.textBaseline = 'middle';
        g.fillText(txt, i === 0 ? x - 4 : i === 4 ? x + 4 : x, ry1 + 9);
        g.restore();
      }
      // Fahrzeug
      const pos = V.s.change(t);
      const v = V.s.rate(t);
      const dv = V.s.rate(Math.min(V.T, t + 0.3)) - V.s.rate(Math.max(0, t - 0.3));
      const x = X(pos);
      const ymid = (ry0 + ry1) / 2;
      const size = clamp(P.h * 0.44, 30, 58);
      const vmax = Math.max(1e-6, Math.abs(GAUGE[key][1]), Math.abs(GAUGE[key][0]));
      // Fahrtwind-Striche
      const sp = Math.abs(v) / vmax;
      if (sp > 0.15) {
        g.save();
        g.strokeStyle = withAlpha(dark ? '#e2e8f0' : '#ffffff', 0.35 + 0.4 * sp);
        g.lineWidth = 1.6;
        g.lineCap = 'round';
        const dir = v >= 0 ? -1 : 1;
        for (let j = 0; j < 3; j++) {
          const yy = ymid - size * 0.42 + j * size * 0.2;
          const x0 = x + dir * size * (0.62 + j * 0.06);
          g.beginPath();
          g.moveTo(x0, yy);
          g.lineTo(x0 + dir * size * 0.5 * sp, yy);
          g.stroke();
        }
        g.restore();
      }
      const roll = ((rx1 - rx0) * pos) / Math.max(1, max);
      if (key === 'bike') drawBike(x, ymid + size * 0.12, size, roll);
      else drawCar(x, ymid + size * 0.05, size, roll, { brake: v > 0.05 && dv < -1e-3, reverse: v < -0.05 });
    }

    function drawCar(x: number, y: number, L: number, roll: number, lights: { brake: boolean; reverse: boolean }): void {
      const g = surface.g;
      const dark = th().dark;
      const w = L * 1.25;
      const h = L * 0.34;
      const wr = L * 0.16;
      const left = x - w / 2;
      const base = y + h * 0.15;
      // Schatten
      g.save();
      g.fillStyle = 'rgba(0,0,0,0.28)';
      g.beginPath();
      g.ellipse(x, base + wr * 0.95, w * 0.52, wr * 0.35, 0, 0, TAU);
      g.fill();
      g.restore();
      // Karosserie
      const body = g.createLinearGradient(0, base - h * 1.9, 0, base);
      body.addColorStop(0, dark ? '#e2e8f0' : '#64748b');
      body.addColorStop(1, dark ? '#94a3b8' : '#334155');
      g.fillStyle = body;
      g.beginPath();
      g.moveTo(left + w * 0.04, base);
      g.lineTo(left + w * 0.02, base - h * 0.75);
      g.quadraticCurveTo(left + w * 0.04, base - h * 1.05, left + w * 0.2, base - h * 1.08);
      g.lineTo(left + w * 0.32, base - h * 1.85);
      g.quadraticCurveTo(left + w * 0.36, base - h * 2.0, left + w * 0.44, base - h * 2.0);
      g.lineTo(left + w * 0.68, base - h * 2.0);
      g.quadraticCurveTo(left + w * 0.74, base - h * 2.0, left + w * 0.8, base - h * 1.2);
      g.lineTo(left + w * 0.95, base - h * 1.02);
      g.quadraticCurveTo(left + w * 1.0, base - h * 0.95, left + w * 0.99, base - h * 0.45);
      g.lineTo(left + w * 0.97, base);
      g.closePath();
      g.fill();
      // Zierstreifen in der Zeitfarbe
      g.fillStyle = withAlpha(col.t(), 0.9);
      g.fillRect(left + w * 0.05, base - h * 0.62, w * 0.9, h * 0.16);
      // Fenster
      g.fillStyle = dark ? 'rgba(30,41,59,0.85)' : 'rgba(219,234,254,0.92)';
      g.beginPath();
      g.moveTo(left + w * 0.35, base - h * 1.15);
      g.lineTo(left + w * 0.42, base - h * 1.82);
      g.lineTo(left + w * 0.54, base - h * 1.82);
      g.lineTo(left + w * 0.54, base - h * 1.15);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(left + w * 0.58, base - h * 1.15);
      g.lineTo(left + w * 0.58, base - h * 1.82);
      g.lineTo(left + w * 0.67, base - h * 1.82);
      g.lineTo(left + w * 0.74, base - h * 1.15);
      g.closePath();
      g.fill();
      // Scheinwerfer vorn, Rücklicht hinten
      g.fillStyle = '#fde68a';
      roundRect(g, left + w * 0.93, base - h * 0.95, w * 0.05, h * 0.28, 2);
      g.fill();
      const tail = lights.brake ? '#ef4444' : '#b91c1c';
      if (lights.brake) halo(left + w * 0.03, base - h * 0.8, '#ef4444', L * 0.35, 1);
      g.fillStyle = tail;
      roundRect(g, left + w * 0.015, base - h * 0.98, w * 0.045, h * 0.3, 2);
      g.fill();
      if (lights.reverse) {
        halo(left + w * 0.02, base - h * 0.45, '#ffffff', L * 0.3, 1);
        g.fillStyle = '#ffffff';
        roundRect(g, left + w * 0.015, base - h * 0.6, w * 0.04, h * 0.18, 2);
        g.fill();
      }
      for (const cx of [left + w * 0.24, left + w * 0.78]) wheel(cx, base, wr, roll);
    }

    function wheel(cx: number, cy: number, r: number, roll: number): void {
      const g = surface.g;
      const dark = th().dark;
      g.fillStyle = dark ? '#0b0f16' : '#1f2937';
      g.beginPath();
      g.arc(cx, cy, r, 0, TAU);
      g.fill();
      g.fillStyle = dark ? '#94a3b8' : '#cbd5e1';
      g.beginPath();
      g.arc(cx, cy, r * 0.55, 0, TAU);
      g.fill();
      const a = roll / r;
      g.strokeStyle = dark ? '#334155' : '#64748b';
      g.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const ang = a + (i * TAU) / 3;
        g.beginPath();
        g.moveTo(cx, cy);
        g.lineTo(cx + Math.cos(ang) * r * 0.52, cy + Math.sin(ang) * r * 0.52);
        g.stroke();
      }
    }

    function drawBike(x: number, y: number, L: number, roll: number): void {
      const g = surface.g;
      const dark = th().dark;
      const r = L * 0.3;
      const xa = x - L * 0.42;
      const xb = x + L * 0.42;
      // Schatten
      g.fillStyle = 'rgba(0,0,0,0.25)';
      g.beginPath();
      g.ellipse(x, y + r * 1.02, L * 0.7, r * 0.18, 0, 0, TAU);
      g.fill();
      // Räder mit Speichen
      for (const cx of [xa, xb]) {
        g.strokeStyle = dark ? '#cbd5e1' : '#1f2937';
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(cx, y, r, 0, TAU);
        g.stroke();
        g.strokeStyle = withAlpha(dark ? '#cbd5e1' : '#475569', 0.7);
        g.lineWidth = 1;
        const a = roll / r;
        for (let i = 0; i < 6; i++) {
          const ang = a + (i * Math.PI) / 3;
          g.beginPath();
          g.moveTo(cx - Math.cos(ang) * r * 0.92, y - Math.sin(ang) * r * 0.92);
          g.lineTo(cx + Math.cos(ang) * r * 0.92, y + Math.sin(ang) * r * 0.92);
          g.stroke();
        }
      }
      // Rahmen
      const pedal = { x: x - L * 0.04, y };
      const seat = { x: x - L * 0.16, y: y - L * 0.5 };
      const bar = { x: x + L * 0.28, y: y - L * 0.56 };
      g.strokeStyle = col.t();
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.lineJoin = 'round';
      g.beginPath();
      g.moveTo(xa, y);
      g.lineTo(pedal.x, pedal.y);
      g.lineTo(seat.x, seat.y);
      g.lineTo(xa, y);
      g.moveTo(pedal.x, pedal.y);
      g.lineTo(bar.x - L * 0.04, bar.y + L * 0.12);
      g.lineTo(seat.x + L * 0.02, seat.y + L * 0.06);
      g.moveTo(xb, y);
      g.lineTo(bar.x, bar.y);
      g.stroke();
      g.strokeStyle = dark ? '#e2e8f0' : '#1f2937';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(seat.x - L * 0.1, seat.y - L * 0.04);
      g.lineTo(seat.x + L * 0.08, seat.y - L * 0.04);
      g.moveTo(bar.x, bar.y);
      g.lineTo(bar.x - L * 0.1, bar.y - L * 0.06);
      g.stroke();
      // Tretkurbel dreht sich mit
      const a = roll / (r * 1.6);
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(pedal.x - Math.cos(a) * L * 0.1, pedal.y - Math.sin(a) * L * 0.1);
      g.lineTo(pedal.x + Math.cos(a) * L * 0.1, pedal.y + Math.sin(a) * L * 0.1);
      g.stroke();
    }

    /* ---------- Tank ---------- */
    function drawTank(P: Rect, V: View, key: SitKey, now: number): void {
      const g = surface.g;
      const theme = th();
      const dark = theme.dark;
      // Wand und Boden
      const wall = g.createLinearGradient(0, P.y, 0, P.y + P.h);
      wall.addColorStop(0, dark ? '#141c2a' : '#f3f6fa');
      wall.addColorStop(1, dark ? '#1b2536' : '#e6ecf3');
      g.fillStyle = wall;
      g.fillRect(P.x, P.y, P.w, P.h);
      const floorY = P.y + P.h - 8;
      g.fillStyle = dark ? '#273244' : '#d5dde8';
      g.fillRect(P.x, floorY, P.w, 8);
      const cap = CAP.v;
      const tw = clamp(P.w * 0.24, 62, 120);
      const tx = P.x + clamp(P.w * (P.w < 420 ? 0.5 : 0.36), 60, P.w - tw - 90) - tw / 2;
      const ty = P.y + 15;
      const tH = floorY - ty - 6;
      const vol = V.B(V.t);
      const level = clamp01(vol / cap);
      const rate = V.s.rate(V.t);
      const flowing = running() || TT.busy || dragging();
      const phase = flowing && !reduced() ? now / 260 : 0;
      // Standfüße
      g.fillStyle = dark ? '#475569' : '#94a3b8';
      g.fillRect(tx + 8, floorY - 6, 6, 6);
      g.fillRect(tx + tw - 14, floorY - 6, 6, 6);
      // Glas
      g.save();
      roundRect(g, tx, ty, tw, tH, 8);
      g.fillStyle = dark ? 'rgba(148,163,184,0.10)' : 'rgba(255,255,255,0.7)';
      g.fill();
      g.clip();
      // Wasser mit Wellen
      const wc = col.w();
      const top = ty + tH * (1 - level);
      const amp = level > 0.005 ? Math.min(3, 0.6 + Math.abs(rate) * 0.6) : 0;
      const water = g.createLinearGradient(0, top, 0, ty + tH);
      water.addColorStop(0, mixColor(wc, '#ffffff', 0.25, dark ? 0.75 : 0.7));
      water.addColorStop(1, mixColor(wc, '#1e3a8a', 0.35, dark ? 0.85 : 0.8));
      g.fillStyle = water;
      g.beginPath();
      g.moveTo(tx, top);
      for (let x = 0; x <= tw; x += 3) g.lineTo(tx + x, top + amp * Math.sin(x / 9 + phase));
      g.lineTo(tx + tw, ty + tH);
      g.lineTo(tx, ty + tH);
      g.closePath();
      g.fill();
      // Glanzlicht
      g.fillStyle = withAlpha('#ffffff', dark ? 0.08 : 0.35);
      g.fillRect(tx + tw * 0.12, ty + 4, tw * 0.08, tH - 8);
      g.restore();
      g.strokeStyle = dark ? '#94a3b8' : '#475569';
      g.lineWidth = 2;
      roundRect(g, tx, ty, tw, tH, 8);
      g.stroke();
      // Skala
      g.font = `650 11px ${theme.font}`;
      g.textBaseline = 'middle';
      for (let i = 0; i <= 4; i++) {
        const yy = ty + tH * (1 - i / 4);
        g.strokeStyle = withAlpha(theme.muted, 0.9);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(tx - (i % 2 ? 4 : 7), yy);
        g.lineTo(tx, yy);
        g.stroke();
        if (i % 2) continue;
        const a = i === 0 ? 1 : shownA();
        if (a <= 0.02) continue;
        g.save();
        g.globalAlpha *= a;
        g.fillStyle = theme.muted;
        g.textAlign = 'right';
        g.fillText(`${N((cap * i) / 4, 0)} L`, tx - 9, clamp(yy, ty + 5, ty + tH - 4));
        g.restore();
      }
      // Zulauf oben
      const spoutX = tx + tw * 0.68;
      const pipeY = P.y + 6;
      const pipeEnd = Math.min(P.x + P.w - 4, tx + tw + 70);
      g.strokeStyle = dark ? '#64748b' : '#94a3b8';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(pipeEnd, pipeY);
      g.lineTo(spoutX, pipeY);
      g.lineTo(spoutX, pipeY + 7);
      g.stroke();
      if (rate > 0.02) {
        const wdt = clamp(1.5 + rate * 1.4, 1.5, 8);
        drawStream(spoutX, pipeY + 10, top, wdt, phase);
      }
      // Ablauf unten
      const outY = ty + tH - 9;
      const outEnd = tx + tw + 30;
      g.strokeStyle = dark ? '#64748b' : '#94a3b8';
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(tx + tw, outY);
      g.lineTo(outEnd, outY);
      g.lineTo(outEnd, outY + 6);
      g.stroke();
      // Ventil: offen bei Abfluss
      g.fillStyle = rate < -0.02 ? col.neg() : dark ? '#94a3b8' : '#64748b';
      g.beginPath();
      g.arc(tx + tw + 14, outY - 6, 4, 0, TAU);
      g.fill();
      if (rate < -0.02 && vol > 0.01) {
        const wdt = clamp(1.5 + -rate * 1.4, 1.5, 8);
        drawStream(outEnd, outY + 9, floorY, wdt, phase);
      }
      // Füllmenge im Tank
      const k = shownA();
      const cy = clamp(top + (ty + tH - top) / 2, ty + 14, ty + tH - 12);
      const lblY = level > 0.22 ? cy : ty + tH * 0.5;
      if (k > 0.5) fpill(tx + tw / 2, lblY, `${cN('tankV', vol)} ${u('L')}`, { size: fs(13, 12), alpha: (2 * k - 1) * 0.98, color: theme.text });
      else placeholder(tx + tw / 2, lblY, { size: fs(12, 11), alpha: 1 - 2 * k, label: 'L' });
      if (vol < -0.05) fpill(P.x + P.w / 2, P.y + P.h - 22, `\\c{n}{\\t{${T2('Tank leer – so geht es nicht weiter!', 'Tank empty – this cannot go on!')}}}`, { size: 11, color: col.neg(), bounds: P });
      void key;
    }

    function drawStream(x: number, y0: number, y1: number, w: number, phase: number): void {
      if (y1 <= y0 + 2) return;
      const g = surface.g;
      const wc = col.w();
      const grad = g.createLinearGradient(0, y0, 0, y1);
      grad.addColorStop(0, withAlpha(wc, 0.85));
      grad.addColorStop(1, withAlpha(wc, 0.45));
      g.fillStyle = grad;
      g.fillRect(x - w / 2, y0, w, y1 - y0);
      // fallende Tropfen-Glanzlichter
      g.save();
      g.strokeStyle = withAlpha('#ffffff', 0.55);
      g.lineWidth = Math.max(1, w * 0.3);
      g.setLineDash([4, 7]);
      g.lineDashOffset = -phase * 14;
      g.beginPath();
      g.moveTo(x, y0);
      g.lineTo(x, y1);
      g.stroke();
      g.restore();
      // Spritzer unten
      g.fillStyle = withAlpha(wc, 0.5);
      g.beginPath();
      g.ellipse(x, y1, w * 1.4, 2, 0, 0, TAU);
      g.fill();
    }

    /* ---------- Instrumente ---------- */
    function gauge(cx: number, cy: number, R: number, V: View, key: SitKey, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const [lo, hi] = GAUGE[key];
      const a0 = Math.PI * 0.85;
      const a1 = Math.PI * 2.15;
      const ang = (v: number) => a0 + ((clamp(v, lo, hi) - lo) / (hi - lo)) * (a1 - a0);
      g.save();
      g.globalAlpha *= alpha;
      // Zifferblatt
      const face = g.createRadialGradient(cx, cy - R * 0.3, R * 0.1, cx, cy, R * 1.1);
      face.addColorStop(0, theme.dark ? '#1f2a3b' : '#ffffff');
      face.addColorStop(1, theme.dark ? '#121925' : '#eef2f7');
      g.fillStyle = face;
      g.beginPath();
      g.arc(cx, cy, R, 0, TAU);
      g.fill();
      g.strokeStyle = theme.dark ? '#334155' : '#cbd5e1';
      g.lineWidth = 1.2;
      g.stroke();
      // Bogen: rot für negative, grün für positive Raten
      g.lineWidth = Math.max(3, R * 0.1);
      g.lineCap = 'butt';
      if (lo < 0) {
        g.strokeStyle = withAlpha(col.neg(), 0.7);
        g.beginPath();
        g.arc(cx, cy, R * 0.82, ang(lo), ang(0));
        g.stroke();
      }
      g.strokeStyle = withAlpha(col.pos(), 0.7);
      g.beginPath();
      g.arc(cx, cy, R * 0.82, ang(Math.max(0, lo)), ang(hi));
      g.stroke();
      // Striche
      g.strokeStyle = theme.muted;
      g.lineWidth = 1.2;
      for (let i = 0; i <= 10; i++) {
        const a = a0 + ((a1 - a0) * i) / 10;
        const r0 = R * (i % 5 === 0 ? 0.6 : 0.68);
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0);
        g.lineTo(cx + Math.cos(a) * R * 0.74, cy + Math.sin(a) * R * 0.74);
        g.stroke();
      }
      if (R >= 30) {
        g.font = `650 ${R >= 40 ? 11 : 10}px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'center';
        g.textBaseline = 'middle';
        for (const v of lo < 0 ? [lo, 0, hi] : [lo, hi]) {
          const a = ang(v);
          g.fillText(N(v, 0), cx + Math.cos(a) * R * 0.44, cy + Math.sin(a) * R * 0.44);
        }
      }
      // Zeiger
      const v = V.s.rate(V.t);
      const a = ang(v);
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.6)' : 'rgba(16,24,40,0.3)';
      g.shadowBlur = 4;
      g.strokeStyle = col.r();
      g.lineWidth = Math.max(2.2, R * 0.07);
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - Math.cos(a) * R * 0.12, cy - Math.sin(a) * R * 0.12);
      g.lineTo(cx + Math.cos(a) * R * 0.8, cy + Math.sin(a) * R * 0.8);
      g.stroke();
      g.restore();
      dot(cx, cy, col.r(), Math.max(3, R * 0.1));
      g.restore();
    }

    /** Zähler für den Bestand (und bei „vor und zurück“ den Wegzähler). */
    function counters(V: View): { label: string; src: string; color: string; hidden: boolean; id: string }[] {
      const m = V.m;
      const out: { label: string; src: string; color: string; hidden: boolean; id: string }[] = [];
      const Bt = V.B(V.t);
      const chg = Bt - V.b0;
      const name = META[V.k].road ? (V.k === 'back' ? T2('Position', 'Position') : T2('Weg', 'Distance')) : T2('Füllmenge', 'Volume');
      out.push({ label: name, src: `${m.b} = ${cN('cB', Bt)} ${u(m.bu)}`, color: ink(sc(chg)), hidden: true, id: 'cB' });
      if (V.k === 'back') out.push({ label: T2('Wegzähler', 'Trip meter'), src: `${cN('cD', V.dist)} ${u(m.bu)}`, color: th().text, hidden: true, id: 'cD' });
      return out;
    }

    function drawInstruments(I: Rect, V: View, k: Intro): void {
      const g = surface.g;
      const theme = th();
      const m = V.m;
      const key = morph && morphK < 0.5 ? morph.from : V.k;
      const gw = Math.min(I.w * 0.48, I.h * 1.05);
      const R = Math.min(gw * 0.46, (I.h - 30) / 2);
      const gx = I.x + gw / 2;
      const gy = I.y + R + 3;
      gauge(gx, gy, R, V, key, k.panel);
      const v = V.s.rate(V.t);
      const vy = Math.min(I.y + I.h - 11, gy + R + 13);
      fpill(gx, vy, `\\c{r}{${m.r} = ${cN('cv', v)} ${u(m.ru)}}`, { size: fs(12, 11), alpha: k.panel, color: col.r() });
      // Zähler rechts daneben
      const cx = I.x + gw + 8;
      const cw = I.x + I.w - cx;
      const list = counters(V);
      const boxH = Math.min(46, (I.h - 6 * (list.length - 1)) / list.length);
      const y0 = I.y + (I.h - (list.length * boxH + (list.length - 1) * 6)) / 2;
      list.forEach((c, i) => {
        const y = y0 + i * (boxH + 6);
        const rr = { x: cx, y, w: cw, h: boxH };
        g.save();
        g.fillStyle = theme.dark ? '#0f1520' : '#f6f8fb';
        roundRect(g, rr.x, rr.y, rr.w, rr.h, 9);
        g.fill();
        g.strokeStyle = theme.dark ? '#2b3547' : '#dde3ec';
        g.lineWidth = 1;
        roundRect(g, rr.x + 0.5, rr.y + 0.5, rr.w - 1, rr.h - 1, 9);
        g.stroke();
        g.font = `650 11px ${theme.font}`;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        g.fillText(c.label, rr.x + 9, rr.y + 11);
        const ka = shownA();
        if (ka > 0.5) {
          const b = fit(c.src, rr.w - 16, fs(14, 13), c.color, 750);
          g.globalAlpha *= 2 * ka - 1;
          b.draw(g, rr.x + 9, rr.y + rr.h - 9 - b.desc);
        } else placeholder(rr.x + 8, rr.y + rr.h - 14, { align: 'left', size: 11, alpha: 1 - 2 * ka, label: m.bu });
        g.restore();
      });
    }

    function drawMiniInstruments(P: Rect, V: View, k: Intro): void {
      const m = V.m;
      const key = morph && morphK < 0.5 ? morph.from : V.k;
      const R = clamp(P.h * 0.2, 18, 24);
      const gx = P.x + P.w - R - 8;
      const gy = P.y + R + 8;
      gauge(gx, gy, R, V, key, k.panel);
      const v = V.s.rate(V.t);
      fpill(gx - R - 8, gy, `\\c{r}{${m.r} = ${cN('cv', v)} ${u(m.ru)}}`, { size: 11, alpha: k.panel, color: col.r(), align: 'right' });
      // Zähler oben links
      let y = P.y + 14;
      for (const c of counters(V)) {
        const ka = shownA();
        const src = c.id === 'cD' ? `\\t{${c.label}} ${c.src}` : c.src;
        if (ka > 0.5) fpill(P.x + 6, y, src, { size: 11, alpha: (2 * ka - 1) * k.panel, color: c.color, align: 'left' });
        else placeholder(P.x + 4, y, { align: 'left', size: 11, alpha: 1 - 2 * ka, label: `${m.b}` });
        y += 24;
      }
    }

    /* ---------- Zeitleiste ---------- */
    function drawTimeline(G: ReturnType<typeof sceneGeom>, V: View, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const tc = col.t();
      // Abspielknopf
      const playing = running();
      const hp = hover?.id === 'play';
      g.save();
      g.globalAlpha *= k.panel;
      g.save();
      g.shadowColor = theme.dark ? 'rgba(0,0,0,0.5)' : withAlpha(tc, 0.4);
      g.shadowBlur = hp ? 10 : 6;
      g.shadowOffsetY = 1.5;
      const grad = g.createLinearGradient(0, G.play.y - G.play.r, 0, G.play.y + G.play.r);
      grad.addColorStop(0, mixColor(tc, '#ffffff', hp ? 0.3 : 0.16));
      grad.addColorStop(1, tc);
      g.fillStyle = grad;
      g.beginPath();
      g.arc(G.play.x, G.play.y, G.play.r * (hp ? 1.07 : 1), 0, TAU);
      g.fill();
      g.restore();
      g.fillStyle = '#ffffff';
      if (playing) {
        g.fillRect(G.play.x - 4.5, G.play.y - 5.5, 3.2, 11);
        g.fillRect(G.play.x + 1.3, G.play.y - 5.5, 3.2, 11);
      } else {
        g.beginPath();
        g.moveTo(G.play.x - 3.5, G.play.y - 6);
        g.lineTo(G.play.x + 6.5, G.play.y);
        g.lineTo(G.play.x - 3.5, G.play.y + 6);
        g.closePath();
        g.fill();
      }
      // Spur
      const X = (t: number) => lerp(G.tx0, G.tx1, clamp01(t / Math.max(1e-6, V.T)));
      g.lineCap = 'round';
      g.strokeStyle = withAlpha(theme.text, theme.dark ? 0.2 : 0.12);
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(G.tx0, G.ty);
      g.lineTo(G.tx1, G.ty);
      g.stroke();
      // Vorzeichen der Rate als feines Band (grün: Zunahme, rot: Abnahme)
      const n = 80;
      for (let i = 0; i < n; i++) {
        const a = (V.T * i) / n;
        const b = (V.T * (i + 1)) / n;
        const r = V.s.rate((a + b) / 2);
        if (Math.abs(r) < 1e-6) continue;
        g.fillStyle = withAlpha(r > 0 ? col.pos() : col.neg(), theme.dark ? 0.55 : 0.45);
        g.fillRect(X(a), G.ty + 5, X(b) - X(a) + 0.4, 2.5);
      }
      if (V.t > 0) {
        g.strokeStyle = tc;
        g.lineWidth = 6;
        g.beginPath();
        g.moveTo(G.tx0, G.ty);
        g.lineTo(X(V.t), G.ty);
        g.stroke();
      }
      const hk = hover?.id === 'track' || drag?.kind === 'time';
      if (finishT !== null) {
        const q = clamp01((now - finishT) / 900);
        halo(X(V.t), G.ty, tc, 14 + 16 * q, 1 - q);
      }
      dot(X(V.t), G.ty, tc, hk ? 8 : 7);
      // Beschriftung
      const lx = G.tx1 + 14;
      fpill(lx, G.ty, `\\c{t}{t = ${N(V.t, 1)} ${u(V.m.tu)}}`, { size: fs(12, 11), align: 'left', color: ink(tc) });
      g.restore();
    }

    /* =====================================================================
     * Diagramm der Änderungsrate
     * ===================================================================== */
    /** Rechtecke, wie sie gerade gezeichnet werden (mit Übergang aus den alten). */
    function shownBoxes(V: View, now: number): { l: number; r: number; h: number; at: number; grow: number }[] {
      const n = p.n;
      if (n <= 0 || V.t <= 0) return [];
      const dt = V.t / n;
      const out: { l: number; r: number; h: number; at: number; grow: number }[] = [];
      let k = 1;
      let old: { l: number; r: number; h: number }[] | null = null;
      if (nFrom) {
        k = ease.inOutCubic(clamp01((now - nFrom.t0) / 650));
        if (k >= 1) nFrom = null;
        else if (nFrom.n > 0) {
          const od = V.t / nFrom.n;
          old = Array.from({ length: nFrom.n }, (_, i) => ({ l: i * od, r: (i + 1) * od, h: V.s.rate(samplePoint(i, od, nFrom!.rule)) }));
        }
      }
      for (let i = 0; i < n; i++) {
        const at = samplePoint(i, dt, rule());
        let h = V.s.rate(at);
        let grow = 1;
        const c = (i + 0.5) * dt;
        if (old) {
          const o = old.find((b) => c >= b.l - 1e-9 && c <= b.r + 1e-9);
          if (o) h = lerp(o.h, h, k);
        } else if (nFrom) {
          // aus dem Nichts: gestaffelt von links nach rechts wachsen
          grow = ease.outCubic(clamp01(k * 1.7 - (i / Math.max(1, n)) * 0.7));
        }
        out.push({ l: i * dt, r: (i + 1) * dt, h: h * grow, at, grow });
      }
      return out;
    }
    /** Wie weit ist das Stapeln? (Anzahl fertig übertragener Streifen, Bruchteil möglich; sonst alle) */
    function stackDone(now: number): number {
      if (!stack) return Infinity;
      return (now - stack.t0) / stack.per;
    }

    function drawRate(V: View, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const m = V.m;
      plot.setAxes({ x: { label: `t in ${m.tu}` }, y: { label: '' } });
      plot.setRangePadded([0, V.T], [rng.ry0.v, rng.ry1.v], PAD());
      plot.resize();
      plot.begin();
      plot.grid();
      plot.axes();
      const r = plot.rect;
      const y0 = plot.py(0);
      const t = V.t;
      // Fläche bis t: grün oberhalb, rot unterhalb der Achse
      const fillA = 1 - 0.55 * kRect.v;
      if (t > 0 && fillA > 0.01) {
        for (const sign of [1, -1]) {
          const color = sign > 0 ? col.pos() : col.neg();
          const pts = sample(plot, (x) => (sign > 0 ? Math.max(V.s.rate(x), 0) : Math.min(V.s.rate(x), 0)), 0, t, V.kinks);
          g.save();
          g.globalAlpha *= fillA;
          const top = sign > 0 ? plot.py(rng.ry1.v) : plot.py(rng.ry0.v);
          const grad = g.createLinearGradient(0, top, 0, y0);
          grad.addColorStop(0, withAlpha(color, theme.dark ? 0.55 : 0.42));
          grad.addColorStop(1, withAlpha(color, theme.dark ? 0.2 : 0.13));
          g.fillStyle = grad;
          g.beginPath();
          g.moveTo(plot.px(0), y0);
          for (const [px, py] of pts) g.lineTo(px, py);
          g.lineTo(plot.px(t), y0);
          g.closePath();
          g.fill();
          g.restore();
        }
      }
      // Vorzeichenwechsel der Rate (dort Extremstelle des Bestands)
      for (const e of V.ext) {
        g.save();
        g.globalAlpha *= k.labels * 0.8;
        g.strokeStyle = withAlpha(theme.muted, 0.7);
        g.setLineDash([3, 4]);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(Math.round(plot.px(e.t)) + 0.5, r.y + PAD().top - 6);
        g.lineTo(Math.round(plot.px(e.t)) + 0.5, r.y + r.h);
        g.stroke();
        g.restore();
        dot(plot.px(e.t), y0, e.kind === 'max' ? col.pos() : col.neg(), 4, k.labels, true);
      }
      // Rechteckstreifen
      if (kRect.v > 0.01) drawBoxes(V, now, kRect.v);
      // Graph der Rate (beim Einstieg von links nach rechts)
      const xr = lerp(0, V.T, k.reveal);
      strokePts(sample(plot, V.s.rate, 0, xr, V.kinks), col.r(), fs(3.2, 2.7), { glow: true });
      // Zeitmarke
      const tc = col.t();
      g.save();
      g.globalAlpha *= k.labels;
      g.strokeStyle = tc;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(plot.px(t), y0);
      g.lineTo(plot.px(t), plot.py(V.s.rate(t)));
      g.stroke();
      g.restore();
      const hot = hover?.id === 'tm' || (drag?.kind === 'time' && drag.from === 'plot');
      if (hot) halo(plot.px(t), y0, tc, 20, 1);
      dot(plot.px(t), plot.py(V.s.rate(t)), col.r(), 4.5, k.labels);
      dot(plot.px(t), y0, tc, hot ? 8 : 7, k.labels);
      // Flächenwerte in den Teilflächen
      if (kRect.v < 0.5 && t > 0) areaLabels(V, k);
      // Stützpunkte der eigenen Rate
      if (V.k === 'own' && !(morph && morphK < 1)) {
        OWN.forEach((c, i) => {
          const px = plot.px(i * 10);
          const py = plot.py(c.v);
          const hi = hover?.id === `own${i}` || (drag?.kind === 'own' && drag.i === i);
          if (editable()) halo(px, py, col.r(), hi ? 22 : 15, hi ? 1 : 0.7);
          dot(px, py, col.r(), hi ? 7.5 : 6.5, k.labels);
          if (hi) fpill(px, py - 22, `\\c{r}{r(${i * 10}) = ${N(c.v, 1)} ${u('L/min')}}`, { size: fs(12, 11), bounds: r, color: col.r() });
        });
      }
      // Titel
      fpill(r.x + PAD().left + 6, r.y + 17, `\\c{r}{${m.r}(t)} \\c{m}{\\t{in ${m.ru} · ${say(m.rate)}}}`, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.r(), 0.5), bounds: { ...r, w: r.w } });
      if (hover?.id === 'plotR' || hover?.id === 'plotB') hoverGuide(plot, V, hover.px, 'R');
      plot.end();
    }

    /** Beschriftung der Teilflächen: +… oberhalb, −… unterhalb der Achse. */
    function areaLabels(V: View, k: Intro): void {
      const r = plot.rect;
      const y0 = plot.py(0);
      const t = V.t;
      const parts = [
        { which: 'pos' as const, A: V.areas.pos },
        { which: 'neg' as const, A: V.areas.neg },
      ];
      const tot = Math.abs(V.areas.pos) + Math.abs(V.areas.neg);
      for (const q of parts) {
        if (Math.abs(q.A) < 0.04 * Math.max(1e-6, tot) || Math.abs(q.A) < 1e-6) continue;
        // Schwerpunkt der Teilfläche (in Pixeln)
        let sw = 0;
        let sx = 0;
        let sy = 0;
        const K = 120;
        for (let i = 0; i < K; i++) {
          const x = ((i + 0.5) * t) / K;
          const v = V.s.rate(x);
          const y = q.which === 'pos' ? Math.max(v, 0) : Math.min(v, 0);
          const hpx = Math.abs(plot.py(y) - y0);
          sw += hpx;
          sx += plot.px(x) * hpx;
          sy += (y0 + plot.py(y)) / 2 * hpx;
        }
        if (sw <= 0) continue;
        const color = q.which === 'pos' ? col.pos() : col.neg();
        const cx = sx / sw;
        const cy = sy / sw;
        const ka = shownA();
        const a = k.labels * (1 - kRect.v * 2);
        if (a <= 0.01) continue;
        if (ka > 0.5) {
          const src = `\\c{${q.which === 'pos' ? 'p' : 'n'}}{${cSc(`ar${q.which}`, q.A)} ${u(V.m.bu)}}`;
          const w = pillW(src, fs(12.5, 11.5));
          const inside = Math.abs(sw / K) > 26 && Math.abs(plot.px(t) - plot.px(0)) > w + 6;
          const py = inside ? cy : q.which === 'pos' ? Math.min(cy, y0) - 18 : Math.max(cy, y0) + 18;
          fpill(cx, py, src, { size: fs(12.5, 11.5), alpha: a * (2 * ka - 1), border: withAlpha(color, 0.6), bounds: r });
        } else placeholder(cx, cy, { size: 11, alpha: a * (1 - 2 * ka), label: V.m.bu, bounds: r });
      }
    }

    function drawBoxes(V: View, now: number, alpha: number): void {
      const g = surface.g;
      const theme = th();
      const bx = shownBoxes(V, now);
      if (!bx.length) return;
      const y0 = plot.py(0);
      const thin = Math.abs(plot.px(bx[0]!.r) - plot.px(bx[0]!.l)) < 7;
      const done = stackDone(now);
      const qc = col.q();
      g.save();
      g.globalAlpha *= alpha;
      bx.forEach((b, i) => {
        const xl = plot.px(b.l);
        const xr = plot.px(b.r);
        const yt = plot.py(b.h);
        const active = stack !== null && i === Math.floor(done);
        const movedOn = stack !== null && i < Math.floor(done);
        const fill = active ? (theme.dark ? 0.55 : 0.42) : movedOn ? 0.1 : theme.dark ? 0.3 : 0.2;
        g.fillStyle = b.h >= 0 ? withAlpha(qc, fill) : mixColor(qc, col.neg(), 0.45, fill);
        g.fillRect(Math.min(xl, xr), Math.min(yt, y0), Math.abs(xr - xl), Math.abs(y0 - yt));
        g.strokeStyle = withAlpha(qc, thin ? 0.55 : movedOn ? 0.45 : 0.95);
        g.lineWidth = active ? 2.4 : thin ? 0.8 : 1.4;
        g.strokeRect(Math.min(xl, xr) + 0.5, Math.min(yt, y0) + 0.5, Math.abs(xr - xl) - 1, Math.abs(y0 - yt));
        if (!thin && b.grow > 0.98) dot(plot.px(b.at), yt, qc, 3.2, 1);
      });
      g.restore();
    }

    /** Senkrechte Hilfslinie unter dem Zeiger mit den Werten an dieser Stelle. */
    function hoverGuide(pl: Plot, V: View, px: number, which: 'R' | 'B'): void {
      if (drag) return;
      const g = surface.g;
      const r = pl.rect;
      const x = clamp(pl.toWorld(px, 0)[0], 0, V.T);
      const hx = pl.px(x);
      if (hx < r.x + PAD().left - 2 || hx > r.x + r.w - 6) return;
      g.save();
      g.strokeStyle = withAlpha(th().muted, 0.7);
      g.setLineDash([2, 4]);
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(Math.round(hx) + 0.5, r.y + PAD().top - 4);
      g.lineTo(Math.round(hx) + 0.5, r.y + r.h - PAD().bottom);
      g.stroke();
      g.restore();
      const m = V.m;
      const right = hx < r.x + r.w * 0.62;
      if (which === 'R') {
        const v = V.s.rate(x);
        dot(hx, pl.py(v), col.r(), 4, 0.9);
        fpill(hx + (right ? 10 : -10), clamp(pl.py(v) - 18, r.y + 46, r.y + r.h - 30), `\\c{r}{${m.r}(${N(x, 1)}) = ${N(v, 1)} ${u(m.ru)}}`, { align: right ? 'left' : 'right', size: fs(11.5, 11), bounds: r, color: col.r() });
      } else if (shownA() > 0.5) {
        const B = V.B(x);
        dot(hx, pl.py(B), ink(col.pos()), 4, 0.9);
        fpill(hx + (right ? 10 : -10), clamp(pl.py(B) - 18, r.y + 46, r.y + r.h - 30), `${m.b}(${N(x, 1)}) = ${N(B, 1)} ${u(m.bu)}`, { align: right ? 'left' : 'right', size: fs(11.5, 11), bounds: r });
      }
    }

    /* =====================================================================
     * Diagramm des Bestands
     * ===================================================================== */
    function drawStock(V: View, k: Intro, now: number): void {
      const g = surface.g;
      const theme = th();
      const m = V.m;
      plotB.setAxes({ x: { label: `t in ${m.tu}` }, y: { label: '' } });
      plotB.setRangePadded([0, V.T], [rng.sy0.v, rng.sy1.v], PAD());
      plotB.resize();
      plotB.begin();
      plotB.grid();
      plotB.axes();
      const r = plotB.rect;
      const t = V.t;
      const ka = shownA();
      const B = V.B;
      // Anfangsbestand
      if (Math.abs(V.b0) > 1e-6) {
        g.save();
        g.strokeStyle = withAlpha(theme.muted, 0.85);
        g.setLineDash([5, 4]);
        g.lineWidth = 1.3;
        g.beginPath();
        g.moveTo(r.x + PAD().left, Math.round(plotB.py(V.b0)) + 0.5);
        g.lineTo(r.x + r.w - PAD().right, Math.round(plotB.py(V.b0)) + 0.5);
        g.stroke();
        g.restore();
      }
      g.save();
      g.globalAlpha *= ka;
      // ganzer Bestand blass
      strokePts(sample(plotB, B, 0, lerp(0, V.T, k.reveal), V.kinks), withAlpha(theme.muted, 0.55), 1.6, { dash: [6, 5] });
      // Wegzähler (Betrag) bei Vor und zurück
      if (V.k === 'back' || (morph && morph.from === 'back' && morphK < 1)) {
        const a = V.k === 'back' ? (morph ? morphK : 1) : 1 - morphK;
        strokePts(sample(plotB, (x) => V.b0 + distance(V.s, x, 300), 0, t, V.kinks), withAlpha(theme.text, 0.8), 2, { dash: [2, 4], alpha: a });
        if (t > 1) fpill(plotB.px(t) + 8, plotB.py(V.b0 + V.dist) - 2, `\\t{${T2('Wegzähler', 'trip meter')}} ${cN('bD', V.dist)} ${u(m.bu)}`, { align: 'left', size: fs(11.5, 11), bounds: r, alpha: a * k.labels, color: theme.text });
      }
      // Treppe der Rechtecksummen
      if (p.n > 0 && t > 0 && kRect.v > 0.01) drawStairs(V, now, kRect.v);
      // Bestand bis t – in den Farben der Flächen
      const pts = sample(plotB, B, 0, t, V.kinks);
      if (pts.length > 1) {
        let run: [number, number][] = [pts[0]!];
        let runSign = 0;
        const flush = () => {
          if (run.length > 1) strokePts(run, runSign < 0 ? col.neg() : runSign > 0 ? col.pos() : theme.muted, fs(3.4, 2.8), { glow: true });
        };
        for (let i = 1; i < pts.length; i++) {
          const xm = plotB.toWorld((pts[i - 1]![0] + pts[i]![0]) / 2, 0)[0];
          const v = V.s.rate(xm);
          const sgn = Math.abs(v) < 1e-9 ? 0 : Math.sign(v);
          if (i === 1) runSign = sgn;
          if (sgn !== runSign) {
            flush();
            run = [pts[i - 1]!];
            runSign = sgn;
          }
          run.push(pts[i]!);
        }
        flush();
      }
      // Extremstellen des Bestands
      for (const e of V.ext) {
        const y = B(e.t);
        const c = e.kind === 'max' ? col.pos() : col.neg();
        dot(plotB.px(e.t), plotB.py(y), c, 5, k.labels, true);
        if (Math.abs(plotB.px(e.t) - plotB.px(t)) < 64) continue;
        const lbl = `${e.kind === 'max' ? T2('Max.', 'max.') : T2('Min.', 'min.')} ${N(y, 1)} ${u(m.bu)}`;
        fpill(plotB.px(e.t), plotB.py(y) + (e.kind === 'max' ? -17 : 17), `\\t{${lbl}}`, { size: fs(11.5, 11), bounds: r, alpha: k.labels * 0.95, color: ink(c) });
      }
      // Änderung als Pfeil von B(0) nach B(t)
      const yb0 = plotB.py(V.b0);
      const ybt = plotB.py(B(t));
      const chg = B(t) - V.b0;
      const xt = plotB.px(t);
      if (Math.abs(ybt - yb0) > 6 && t > 0) {
        g.save();
        g.globalAlpha *= k.labels;
        const grad = g.createLinearGradient(0, ybt, 0, yb0);
        grad.addColorStop(0, withAlpha(sc(chg), theme.dark ? 0.55 : 0.42));
        grad.addColorStop(1, withAlpha(sc(chg), 0.08));
        g.fillStyle = grad;
        roundRect(g, xt - 4, Math.min(ybt, yb0), 8, Math.abs(ybt - yb0), 4);
        g.fill();
        arrowPx(xt, yb0, xt, ybt, sc(chg), 2, 8);
        g.restore();
        if (Math.abs(ybt - yb0) > 34) {
          const left = xt > r.x + r.w - PAD().right - 120;
          fpill(xt + (left ? -12 : 12), (yb0 + ybt) / 2, `\\c{${chg < 0 ? 'n' : 'p'}}{Δ${m.b} = ${cSc('dB', chg)} ${u(m.bu)}}`, { align: left ? 'right' : 'left', size: fs(12, 11), bounds: r, alpha: k.labels, border: withAlpha(sc(chg), 0.6) });
        }
      }
      // Tangente: Steigung = Rate
      const d = V.T * 0.07;
      const mm = V.s.rate(t);
      g.save();
      g.globalAlpha *= k.labels * 0.9;
      plotB.segment([t - d, B(t) - mm * d], [t + d, B(t) + mm * d], { color: col.r(), width: 2 });
      g.restore();
      if (revealT !== null) {
        const q = clamp01((frameNow - revealT) / 1300);
        halo(xt, ybt, col.pos(), 16 + 30 * q, 1 - q);
      }
      dot(xt, ybt, sc(mm), 6, k.labels);
      // Wert am Punkt
      const right = xt < r.x + r.w * 0.66;
      fpill(xt + (right ? 12 : -12), clamp(ybt - 20, r.y + 46, r.y + r.h - 30), `${m.b}(${N(t, 1)}) = ${cN('bt', B(t))} ${u(m.bu)}`, { align: right ? 'left' : 'right', size: fs(12, 11), bounds: r, alpha: k.labels, color: theme.text });
      g.restore();
      // Anfangswert
      if (Math.abs(V.b0) > 1e-6) fpill(r.x + PAD().left + 8, yb0 + (yb0 > r.y + r.h - 50 ? -14 : 14), `\\c{m}{${m.b}(0) = ${N(V.b0, 1)} ${u(m.bu)}}`, { align: 'left', size: fs(11.5, 11), bounds: r, alpha: k.labels });
      // Verdeckt: Bestand erst selbst bestimmen
      if (ka < 0.99) drawVeil(r, 1 - ka, V);
      fpill(r.x + PAD().left + 6, r.y + 17, `\\c{p}{${m.b}(t)} \\c{m}{\\t{in ${m.bu} · ${say(m.stock)}}}`, { align: 'left', size: fs(12.5, 11.5), alpha: k.panel, border: withAlpha(col.pos(), 0.55), bounds: r });
      if ((hover?.id === 'plotR' || hover?.id === 'plotB') && ka > 0.5) hoverGuide(plotB, V, hover.px, 'B');
      plotB.end();
    }

    /** Milchglas über dem Bestand, solange die Lösung verdeckt ist. */
    function drawVeil(r: Rect, a: number, V: View): void {
      const g = surface.g;
      const theme = th();
      const pad = PAD();
      const R = { x: r.x + pad.left + 2, y: r.y + pad.top - 4, w: r.w - pad.left - pad.right - 4, h: r.h - pad.top - pad.bottom - 22 };
      g.save();
      g.globalAlpha *= a;
      const grad = g.createLinearGradient(0, R.y, 0, R.y + R.h);
      grad.addColorStop(0, withAlpha(theme.dark ? '#1a2333' : '#f4f6fa', 0.94));
      grad.addColorStop(1, withAlpha(theme.dark ? '#141b28' : '#e9eef5', 0.94));
      g.fillStyle = grad;
      roundRect(g, R.x, R.y, R.w, R.h, 10);
      g.fill();
      g.strokeStyle = withAlpha(theme.dark ? '#64748b' : '#94a3b8', 0.8);
      g.setLineDash([6, 5]);
      g.lineWidth = 1.3;
      roundRect(g, R.x + 0.5, R.y + 0.5, R.w - 1, R.h - 1, 10);
      g.stroke();
      g.setLineDash([]);
      const cx = R.x + R.w / 2;
      const cy = R.y + R.h / 2;
      const small = R.h < 110;
      const line1 = T2(`Wie groß ist ${V.m.b}(t)?`, `How large is ${V.m.b}(t)?`);
      const line2 = T2('Erst die Fläche berechnen, dann „Lösung aufdecken“.', 'Work out the area first, then “Reveal the solution”.');
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      // Schloss
      const ly = small ? cy - 16 : cy - 26;
      g.strokeStyle = theme.muted;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx, ly - 5, 5, Math.PI, 0);
      g.stroke();
      g.fillStyle = theme.muted;
      roundRect(g, cx - 8, ly - 5, 16, 12, 3);
      g.fill();
      g.font = `750 ${fs(14, 12.5)}px ${theme.font}`;
      g.fillStyle = theme.text;
      g.fillText(line1, cx, ly + 22);
      const lines = wrapText(line2, R.w - 30, `550 ${fs(12, 11)}px ${theme.font}`);
      g.font = `550 ${fs(12, 11)}px ${theme.font}`;
      g.fillStyle = theme.muted;
      lines.slice(0, 2).forEach((ln, i) => g.fillText(ln, cx, ly + 40 + i * 15));
      g.restore();
    }

    /** Treppe: Jeder Streifen r(tᵢ) · Δt wird zur Stufe im Bestand. */
    function drawStairs(V: View, now: number, alpha: number): void {
      const g = surface.g;
      const n = p.n;
      const t = V.t;
      const dt = t / n;
      const ps = partialSums(V.s, t, n, rule());
      const done = stackDone(now);
      const qc = col.q();
      const thin = Math.abs(plotB.px(dt) - plotB.px(0)) < 7;
      const pts: [number, number][] = [[plotB.px(0), plotB.py(V.b0)]];
      g.save();
      g.globalAlpha *= alpha;
      for (let i = 0; i < n; i++) {
        const f = clamp01(done - i);
        if (f <= 0) break;
        const ya = V.b0 + ps[i]!;
        const yb = ya + (ps[i + 1]! - ps[i]!) * ease.outCubic(f);
        const x0 = plotB.px(i * dt);
        const x1 = plotB.px((i + 1) * dt);
        if (!thin) {
          g.fillStyle = yb >= ya ? withAlpha(qc, f < 1 ? 0.5 : 0.16) : mixColor(qc, col.neg(), 0.45, f < 1 ? 0.5 : 0.16);
          g.fillRect(x0, Math.min(plotB.py(ya), plotB.py(yb)), x1 - x0, Math.abs(plotB.py(yb) - plotB.py(ya)));
        }
        pts.push([x0, plotB.py(ya)], [x0, plotB.py(yb)], [x1, plotB.py(yb)]);
      }
      strokePts(pts, qc, thin ? 1.3 : 1.8);
      if (!thin) for (let i = 1; i <= Math.min(n, Math.floor(done)); i++) dot(plotB.px(i * dt), plotB.py(V.b0 + ps[i]!), qc, 3.2, 1, true);
      g.restore();
    }

    /** Gestrichelte Verbindung der Zeitmarke zwischen den beiden Diagrammen. */
    function drawLink(V: View, k: Intro): void {
      const g = surface.g;
      const px = plot.px(V.t);
      const top = plot.py(0);
      const bot = plotB.py(V.B(V.t));
      g.save();
      g.globalAlpha *= 0.55 * k.labels;
      g.strokeStyle = col.t();
      g.lineWidth = 1.2;
      g.setLineDash([2, 4]);
      g.beginPath();
      g.moveTo(px, top + 8);
      g.lineTo(px, shownA() > 0.5 ? bot : plotB.rect.y + PAD().top);
      g.stroke();
      g.restore();
    }

    /* =====================================================================
     * Karten
     * ===================================================================== */
    type CardFn = (R: Rect, measure: boolean, compact: boolean) => number;
    /** Zeile einer Karte: Formel (Kurzschrift) oder Fließtext; „hidden“: Formel + Platzhalter, solange verdeckt */
    type RowSpec = { src: string; hidden?: string; color?: string; size?: number; weight?: number; gap?: number; text?: boolean; hl?: string };
    const rowH = (b: FormulaBox) => Math.max(b.asc + b.desc, 15);
    const noteRow = (txt: string, size = fs(12, 11), color = th().muted): RowSpec => ({ src: txt, text: true, size, color, gap: 6 });

    function formulaCard(R: Rect, measure: boolean, k: Intro, title: string, accent: string, rows: RowSpec[], right?: string, extra?: { h: number; draw: (y: number) => void }): number {
      const g = surface.g;
      const pad = fs(14, 12);
      const maxW = R.w - 2 * pad - 4;
      const ka = shownA();
      const items = rows.map((r) => {
        const size = r.size ?? fs(13.5, 12.5);
        if (r.text) {
          const font = `${r.weight ?? 550} ${size}px ${th().font}`;
          const lines = wrapText(r.src, maxW, font);
          return { box: null, hbox: null, lines, font, h: lines.length * size * 1.32 };
        }
        const box = fit(r.src, maxW, size, r.color ?? th().text, r.weight ?? 600, 11);
        const hbox = r.hidden !== undefined ? fit(r.hidden, maxW - 64, size, r.color ?? th().text, r.weight ?? 600, 11) : null;
        return { box, hbox, lines: [] as string[], font: '', h: Math.max(rowH(box), hbox ? size + 12 : 0) };
      });
      const h = 38 + items.reduce((s, it, i) => s + it.h + (rows[i]!.gap ?? 8), 0) + (extra ? extra.h + 4 : 0) + 4;
      if (measure) return h;
      card(R, accent);
      cardTitle(R, title, accent, right);
      let y = R.y + 38;
      items.forEach((it, i) => {
        const row = rows[i]!;
        const a = clamp01(k.stagger * (rows.length + 2) - i);
        if (y + it.h > R.y + R.h - 2) return;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        if (row.hl) {
          g.fillStyle = withAlpha(row.hl, th().dark ? 0.2 : 0.12);
          roundRect(g, R.x + pad - 6, y - 3, R.w - 2 * pad + 12, it.h + 6, 7);
          g.fill();
        }
        const dx = R.x + pad + (1 - ease.outCubic(a)) * 10;
        if (it.box) {
          if (it.hbox && ka < 0.5) {
            g.save();
            g.globalAlpha *= 1 - 2 * ka;
            const base = y + it.h / 2 + (it.hbox.asc - it.hbox.desc) / 2;
            it.hbox.draw(g, dx, base);
            g.restore();
            placeholder(dx + it.hbox.w + 6, y + it.h / 2, { align: 'left', size: 11, alpha: 1 - 2 * ka, label: row.color === undefined ? '?' : '?' });
          } else {
            g.save();
            if (it.hbox) g.globalAlpha *= 2 * ka - 1;
            it.box.draw(g, dx, y + (it.h - rowH(it.box)) / 2 + it.box.asc);
            g.restore();
          }
        } else {
          const size = row.size ?? fs(13.5, 12.5);
          g.font = it.font;
          g.fillStyle = row.color ?? th().text;
          g.textAlign = 'left';
          g.textBaseline = 'middle';
          it.lines.forEach((ln, j) => g.fillText(ln, dx, y + size * 0.66 + j * size * 1.32));
        }
        g.restore();
        y += it.h + (row.gap ?? 8);
      });
      if (extra && y + extra.h <= R.y + R.h + 1) {
        g.save();
        g.globalAlpha *= ease.outCubic(clamp01(k.stagger * 2 - 0.6));
        extra.draw(y);
        g.restore();
      }
      return h;
    }

    /** Karte „Gesamtänderung“: Rechnung mit Einheiten. */
    function calcCard(V: View, k: Intro): CardFn {
      return (R, measure, compact) => {
        const m = V.m;
        const t = V.t;
        const tt = N(t, 1);
        const chg = V.B(t) - V.b0;
        const Bt = V.B(t);
        const rows: RowSpec[] = [
          { src: `\\c{p}{${m.b}(t)} = ${m.b}(0) + \\i{0}{t} \\c{r}{${m.r}(u)} du`, size: fs(14.5, 13), gap: 9 },
          {
            src: `${m.b}(${tt}) = ${N(V.b0, 1)} ${u(m.bu)} ${cS('kC', chg)} ${u(m.bu)} = \\b{\\c{p}{${cN('kB', Bt)} ${u(m.bu)}}}`,
            hidden: `${m.b}(${tt}) = ${N(V.b0, 1)} ${u(m.bu)} + \\i{0}{${tt}} \\c{r}{${m.r}} du =`,
            size: fs(14, 12.5),
            gap: 8,
            hl: col.pos(),
          },
        ];
        if (!compact) rows.push({ src: `\\c{m}{\\t{${T2('Einheit', 'Unit')}:}  ${u(m.ru)} · ${u(m.tu)} = ${u(m.bu)}}`, size: fs(12, 11), color: th().muted, gap: 8 });
        const a = V.areas;
        if (a.neg < -0.05 && a.pos > 0.05) {
          const road = META[V.k].road;
          const pl = road ? T2('vorwärts', 'forwards') : T2('Zufluss', 'inflow');
          const mi = road ? T2('rückwärts', 'backwards') : T2('Abfluss', 'outflow');
          rows.push({
            src: `\\c{p}{${cS('kP', a.pos)} ${u(m.bu)}} \\c{m}{\\t{(${pl})}}  \\c{n}{${cS('kN', a.neg)} ${u(m.bu)}} \\c{m}{\\t{(${mi})}}`,
            hidden: `\\c{p}{\\t{${pl}}} + \\c{n}{\\t{${mi}}} =`,
            size: fs(12.5, 11.5),
            gap: 8,
          });
          rows.push({
            src: `\\i{0}{${tt}} |\\c{r}{${m.r}(u)}| du = ${cN('kD', V.dist)} ${u(m.bu)}`,
            hidden: `\\i{0}{${tt}} |\\c{r}{${m.r}(u)}| du =`,
            size: fs(12.5, 11.5),
            gap: 3,
          });
          rows.push(noteRow(T2(`Betrag: ${say(m.absName)}`, `absolute value: ${say(m.absName)}`), fs(11.5, 11)));
        }
        if (!compact && t > 0.4) {
          const mean = chg / t;
          rows.push({
            src: `\\f{Δ${m.b}}{Δt} = ${N(mean, 2)} ${u(m.ru)}  \\c{m}{\\t{(${T2('Mittelwert', 'mean')})}}`,
            hidden: `\\f{Δ${m.b}}{Δt} =`,
            size: fs(12.5, 11.5),
            gap: 6,
          });
        }
        return formulaCard(R, measure, k, T2('Gesamtänderung', 'Total change'), col.pos(), rows, `\\c{t}{t = ${tt} ${u(m.tu)}}`);
      };
    }

    const RULE_NAME: Record<Rule, Txt> = { l: L('linker Rand', 'left edge'), r: L('rechter Rand', 'right edge'), m: L('Mitte', 'midpoint') };
    const RULE_SHORT: Record<Rule, Txt> = { l: L('links', 'left'), r: L('rechts', 'right'), m: L('Mitte', 'midpoint') };

    /** Karte „Rechtecksumme“: Δt, Summe mit eingesetzten Höhen, Vergleich links/rechts/Mitte. */
    function sumCard(V: View, k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const m = V.m;
        const n = p.n;
        const t = V.t;
        const dt = t / n;
        const ru = rule();
        const idx = ru === 'l' ? ['0', 'n−1'] : ru === 'r' ? ['1', 'n'] : ['', ''];
        const S0 = riemannSum(V.s, t, n, ru);
        const rows: RowSpec[] = [{ src: `Δt = \\f{${N(t, 1)} ${u(m.tu)}}{${n}} ${eq(dt, 3)} ${N(dt, 3)} ${u(m.tu)}`, size: fs(13.5, 12.5), gap: 8 }];
        if (ru === 'm') rows.push({ src: `\\c{q}{S_{${n}}} = Δt · (${m.r}(\\f{t_0 + t_1}{2}) + … )`, size: fs(13, 12), gap: 8 });
        else rows.push({ src: `\\c{q}{S_{${n}}} = Δt · (${m.r}(t_{${idx[0]}}) + … + ${m.r}(t_{${idx[1]}}))`, size: fs(13, 12), gap: 8 });
        const hs = sampleHeights(V.s, t, n, ru);
        const sumH = hs.length <= 5 ? `(${hs.map((h) => N(h, 1)).join(' + ')})` : null;
        rows.push({
          src: sumH ? `= ${N(dt, 2)} · ${sumH} = \\b{\\c{q}{${cN('sS', S0)} ${u(m.bu)}}}` : `≈ \\b{\\c{q}{${cN('sS', S0)} ${u(m.bu)}}}`,
          hidden: sumH ? `= ${N(dt, 2)} · ${sumH} =` : `\\c{q}{S_{${n}}} ≈`,
          size: fs(13.5, 12.5),
          gap: 8,
          hl: col.q(),
        });
        // Vergleich der drei Regeln
        const rH = fs(20, 19);
        const exact = V.s.change(t);
        const table = compact
          ? undefined
          : {
              h: 22 + 3 * rH,
              draw: (y: number) => {
                const pad = fs(14, 12);
                const cols = [R.x + pad + 14, R.x + pad + (R.w - 2 * pad) * 0.6, R.x + R.w - pad];
                g.font = `700 ${fs(11.5, 11)}px ${theme.font}`;
                g.fillStyle = theme.muted;
                g.textBaseline = 'middle';
                g.textAlign = 'left';
                g.fillText(T2('Höhe', 'height'), cols[0]!, y + 8);
                g.textAlign = 'right';
                g.fillText(`S${String(n).split('').map((d) => '₀₁₂₃₄₅₆₇₈₉'[Number(d)]).join('')}`, cols[1]!, y + 8);
                g.fillText(T2('Fehler', 'error'), cols[2]!, y + 8);
                const ka = shownA();
                RULES.forEach((q, i) => {
                  const yy = y + 22 + i * rH + rH / 2 - 2;
                  const v = riemannSum(V.s, t, n, q);
                  if (q === ru) {
                    g.fillStyle = withAlpha(col.q(), theme.dark ? 0.22 : 0.12);
                    roundRect(g, R.x + pad - 6, yy - rH / 2 + 1, R.w - 2 * pad + 12, rH - 2, 7);
                    g.fill();
                  }
                  g.fillStyle = q === ru ? col.q() : withAlpha(theme.muted, 0.8);
                  g.beginPath();
                  g.arc(R.x + pad + 4, yy, 3.5, 0, TAU);
                  g.fill();
                  g.font = `650 ${fs(12, 11.5)}px ${theme.font}`;
                  g.fillStyle = theme.text;
                  g.textAlign = 'left';
                  g.fillText(say(RULE_SHORT[q]), cols[0]!, yy);
                  g.textAlign = 'right';
                  g.save();
                  g.globalAlpha *= Math.abs(2 * ka - 1);
                  g.fillText(ka > 0.5 ? `${N(cnt(`sv${q}`, v), 1)} ${m.bu}` : '?', cols[1]!, yy);
                  g.fillStyle = theme.muted;
                  g.fillText(ka > 0.5 ? `${S(cnt(`se${q}`, v - exact), 1).replace(' ', '')} ${m.bu}` : '?', cols[2]!, yy);
                  g.restore();
                });
              },
            };
        const mono = monotony(V.s, 0, t);
        const linear = errorLadder(V.s, t, 'm', [1, 2]).every((e) => Math.abs(e.err) < 1e-6 * Math.max(1, Math.abs(exact)));
        let note = '';
        if (mono === 'inc') note = T2(`${m.r} wächst auf [0; t]: linke Summe ≤ exakt ≤ rechte Summe.`, `${m.r} increases on [0, t]: left sum ≤ exact ≤ right sum.`);
        else if (mono === 'dec') note = T2(`${m.r} fällt auf [0; t]: rechte Summe ≤ exakt ≤ linke Summe.`, `${m.r} decreases on [0, t]: right sum ≤ exact ≤ left sum.`);
        if (linear && mono !== 'const') note += (note ? ' ' : '') + T2('Gerade Rate: Die Mittelsumme ist exakt.', 'Straight-line rate: the midpoint sum is exact.');
        if (note && !compact) rows.push(noteRow(note));
        return formulaCard(R, measure, k, T2('Rechtecksumme', 'Rectangle sum'), col.q(), rows, `\\c{q}{n = ${n}, ${say(RULE_SHORT[ru])}}`, table);
      };
    }

    /** Karte „Fehler beim Verdoppeln“: Säulen für n = 1, 2, 4, …, 64. */
    function errCard(V: View, k: Intro): CardFn {
      return (R, measure, compact) => {
        const g = surface.g;
        const theme = th();
        const pad = fs(14, 12);
        const chartH = compact ? 54 : 74;
        const ru = rule();
        const lad = errorLadder(V.s, V.t, ru);
        const maxE = Math.max(...lad.map((e) => Math.abs(e.err)));
        const zero = maxE < 1e-6 * Math.max(1, Math.abs(V.s.change(V.t)));
        const hint = zero ? T2('Hier ist jede Rechtecksumme exakt – die Fehler heben sich auf.', 'Here every rectangle sum is exact – the errors cancel out.') : ru === 'm' ? T2('Mitte: doppelt so viele Streifen – Fehler etwa ein Viertel.', 'Midpoint: twice as many strips – about a quarter of the error.') : T2('Doppelt so viele Streifen – Fehler etwa halb so groß.', 'Twice as many strips – the error roughly halves.');
        const hf = `550 ${fs(12, 11)}px ${theme.font}`;
        const hl = wrapText(hint, R.w - 2 * pad, hf);
        const h = 38 + chartH + 20 + hl.length * fs(12, 11) * 1.32 + 10;
        if (measure) return h;
        card(R, col.q());
        const cur = riemannSum(V.s, V.t, p.n, ru) - V.s.change(V.t);
        const ka = shownA();
        cardTitle(R, T2('Fehler beim Verdoppeln', 'Error when doubling'), col.q(), ka > 0.5 ? `\\c{q}{${T2('Fehler', 'error')} ${cSc('eC', cur)} ${u(V.m.bu)}}` : undefined);
        const C = { x: R.x + pad + 2, y: R.y + 40, w: R.w - 2 * pad - 4, h: chartH };
        const bw = C.w / lad.length;
        const base = C.y + C.h;
        g.strokeStyle = theme.muted;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(C.x, base + 0.5);
        g.lineTo(C.x + C.w, base + 0.5);
        g.stroke();
        const grow = ease.outCubic(clamp01(k.stagger * 2));
        lad.forEach((e, i) => {
          const hh = zero ? 0 : (Math.abs(e.err) / maxE) * (C.h - 4) * grow;
          const on = e.n === p.n;
          const x = C.x + i * bw + bw * 0.18;
          const w = bw * 0.64;
          const grad = g.createLinearGradient(0, base - hh, 0, base);
          const c = on ? col.q() : withAlpha(theme.muted, theme.dark ? 0.6 : 0.45);
          grad.addColorStop(0, on ? mixColor(col.q(), '#ffffff', 0.2) : c);
          grad.addColorStop(1, c);
          g.fillStyle = grad;
          roundRect(g, x, base - Math.max(hh, 1), w, Math.max(hh, 1), Math.min(4, w / 2));
          g.fill();
          g.font = `${on ? 750 : 600} 11px ${theme.font}`;
          g.fillStyle = on ? ink(col.q()) : theme.muted;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(String(e.n), x + w / 2, base + 10);
        });
        if (!DOUBLING.includes(p.n as (typeof DOUBLING)[number])) {
          // aktuelles n liegt zwischen zwei Säulen
          const j = DOUBLING.findIndex((d) => d > p.n);
          const pos = j <= 0 ? 0 : j - 1 + Math.log2(p.n / DOUBLING[j - 1]!) / Math.log2(DOUBLING[j]! / DOUBLING[j - 1]!);
          const x = C.x + (pos + 0.5) * bw;
          g.strokeStyle = col.q();
          g.lineWidth = 1.6;
          g.setLineDash([3, 3]);
          g.beginPath();
          g.moveTo(x, C.y);
          g.lineTo(x, base);
          g.stroke();
          g.setLineDash([]);
        }
        g.font = hf;
        g.fillStyle = theme.muted;
        g.textAlign = 'left';
        g.textBaseline = 'middle';
        hl.forEach((ln, i) => g.fillText(ln, R.x + pad, base + 28 + i * fs(12, 11) * 1.32));
        return h;
      };
    }

    /** Karte „Rate und Bestand“: Steigung, Extremstellen, Abfluss. */
    function linkCard(V: View, k: Intro): CardFn {
      return (R, measure, compact) => {
        const m = V.m;
        const rows: RowSpec[] = [{ src: `\\c{p}{${m.b}′(t)} = \\c{r}{${m.r}(t)}`, size: fs(14.5, 13), gap: 6 }];
        rows.push(noteRow(T2(`Die Steigung des Bestands ist die Rate: Je größer ${m.r}(t), desto steiler steigt ${m.b}.`, `The slope of the amount is the rate: the larger ${m.r}(t), the steeper ${m.b} rises.`), fs(12, 11), th().text));
        if (!V.ext.length) {
          const lo = rateExtent(V.s, 200).lo;
          if (lo >= -1e-9) rows.push(noteRow(T2(`${m.r}(t) ≥ 0: Der Bestand nimmt nie ab.`, `${m.r}(t) ≥ 0: the amount never decreases.`), fs(12, 11), ink(col.pos())));
        }
        for (const e of V.ext) {
          const base =
            e.kind === 'max'
              ? T2(`t = ${N(e.t, 1)} ${m.tu}: ${m.r} wechselt von + nach − → ${m.b} maximal`, `t = ${N(e.t, 1)} ${m.tu}: ${m.r} changes from + to − → ${m.b} maximal`)
              : T2(`t = ${N(e.t, 1)} ${m.tu}: ${m.r} wechselt von − nach + → ${m.b} minimal`, `t = ${N(e.t, 1)} ${m.tu}: ${m.r} changes from − to + → ${m.b} minimal`);
          rows.push(noteRow(shownA() > 0.5 ? `${base} (${N(V.B(e.t), 1)} ${m.bu})` : base, fs(12, 11), e.kind === 'max' ? ink(col.pos()) : col.neg()));
        }
        if (isTank(V.k)) {
          const ea = emptyAt(V.s, V.b0);
          if (ea !== null) rows.push(noteRow(T2(`Bei t ≈ ${N(ea, 1)} min wäre der Tank leer – das Modell gilt nur, solange Wasser drin ist.`, `At t ≈ ${N(ea, 1)} min the tank would be empty – the model only holds while there is water inside.`), fs(12, 11), col.neg()));
        }
        if (!compact && V.k === 'back') rows.push(noteRow(T2('Rückwärts fahren verkleinert die Position, der Wegzähler läuft trotzdem weiter.', 'Reversing reduces the position, but the trip meter keeps counting.'), fs(12, 11)));
        return formulaCard(R, measure, k, T2('Rate und Bestand', 'Rate and amount'), col.r(), rows);
      };
    }

    /** Karte zur Situation: Term der Rate und Beschreibung. */
    function sitCard(V: View, k: Intro): CardFn {
      return (R, measure, compact) => {
        const m = V.m;
        const rows: RowSpec[] = m.src.map((s, i) => ({ src: `\\c{r}{${say(s)}}`, size: fs(12.5, 11.5), gap: i === m.src.length - 1 ? 8 : 4 }));
        if (!compact) rows.push(noteRow(say(m.note)));
        return formulaCard(R, measure, k, say(m.title), col.t(), rows);
      };
    }

    function drawColumn(C: Rect, V: View, k: Intro): void {
      const g = surface.g;
      const gap = fs(10, 8);
      const list: { id: string; fn: CardFn }[] = [{ id: 'calc', fn: calcCard(V, k) }];
      if (p.n > 0) list.push({ id: 'sum', fn: sumCard(V, k) }, { id: 'err', fn: errCard(V, k) });
      else list.push({ id: 'link', fn: linkCard(V, k) });
      list.push({ id: 'sit', fn: sitCard(V, k) });
      const room = { x: C.x, y: C.y, w: C.w, h: C.h };
      const full = list.map((c) => c.fn(room, true, false));
      const short = list.map((c) => c.fn(room, true, true));
      const compactSet = new Set<number>();
      const total = () => list.reduce((s, _, i) => s + (compactSet.has(i) ? short[i]! : full[i]!) + gap, -gap);
      // erst die Karte zur Situation kürzen bzw. weglassen, dann die übrigen kürzen
      const last = list.length - 1;
      if (total() > C.h + 1) compactSet.add(last);
      if (total() > C.h + 1) {
        list.pop();
        full.pop();
        short.pop();
        compactSet.delete(last);
      }
      for (const i of [2, 1, 0]) {
        if (i >= list.length) continue;
        if (total() <= C.h + 1) break;
        if (short[i]! < full[i]!) compactSet.add(i);
      }
      const ids = new Set(list.map((c) => c.id));
      for (const id of [...cardA.keys()]) if (!ids.has(id)) cardA.delete(id);
      let y = C.y;
      list.forEach((c, i) => {
        const compact = compactSet.has(i);
        const goal = compact ? short[i]! : full[i]!;
        if (y + goal > C.y + C.h + 1) return;
        let ch = cardH.get(c.id);
        if (!ch) {
          ch = new Chan(goal);
          cardH.set(c.id, ch);
        }
        if (ch.goal !== goal) {
          if (reduced()) ch.jump(goal);
          else ch.follow(goal, 0.12);
        }
        let ca = cardA.get(c.id);
        if (!ca) {
          ca = new Chan(intro !== null || reduced() ? 1 : 0);
          if (!reduced()) ca.glide(1, 450, 0, frameNow, ease.outCubic);
          cardA.set(c.id, ca);
        }
        const hh = Math.min(ch.v, goal + 40);
        const a = clamp01(k.cards * 1.6 - i * 0.22) * ca.v;
        g.save();
        g.globalAlpha *= ease.outCubic(a);
        g.translate((1 - ease.outCubic(a)) * 18, 0);
        const R = { x: C.x, y, w: C.w, h: hh };
        g.save();
        g.beginPath();
        g.rect(R.x - 20, R.y - 20, R.w + 40, R.h + 26);
        g.clip();
        c.fn(R, false, compact);
        g.restore();
        g.restore();
        y += hh + gap;
      });
    }

    /* ---------- Ergebnisse unter der Bühne ---------- */
    function updateReadouts(): void {
      const s = exactSit();
      const m = META[sitKey()];
      const t = tEff();
      const b0 = b0Of(sitKey());
      const c = s.change(t);
      const v = (x: string) => `<var>${x}</var>`;
      const tt = N(t, 1);
      ctx.readout('chg', { html: `Δ${v(m.b)} = ∫<sub>0</sub><sup>${tt}</sup> ${v(m.r)}(${v('u')}) d${v('u')} = <strong>${S(c, 1).replace('+ ', '+').replace('− ', '−')} ${m.bu}</strong>` });
      ctx.readout('stock', { html: `${v(m.b)}(${tt}) = ${v(m.b)}(0) + Δ${v(m.b)} = ${N(b0, 1)} ${m.bu} ${S(c, 1)} ${m.bu} = <strong>${N(b0 + c, 1)} ${m.bu}</strong>` });
      if (p.n > 0) {
        const sum = riemannSum(s, t, p.n, rule());
        ctx.readout('sum', { html: `${v('S')}<sub>${p.n}</sub> (${say(RULE_NAME[rule()])}) ≈ <strong>${N(sum, 2)} ${m.bu}</strong> · ${T2('Fehler', 'error')} ${S(sum - c, 2).replace(' ', '')} ${m.bu}` });
      } else ctx.readout('sum', null);
      const a = signedAreas(s, t);
      if (a.neg < -1e-6) ctx.readout('dist', { html: `∫<sub>0</sub><sup>${tt}</sup> |${v(m.r)}(${v('u')})| d${v('u')} = <strong>${N(distance(s, t), 1)} ${m.bu}</strong> – ${say(m.absName)}` });
      else ctx.readout('dist', null);
    }

    /* =====================================================================
     * Bereiche der Diagramme
     * ===================================================================== */
    function retargetRanges(now: number, mode: 'jump' | 'follow' | 'glide'): void {
      const s = exactSit();
      const key = sitKey();
      const b0 = b0Of(key);
      let rlo: number;
      let rhi: number;
      if (key === 'own') {
        rlo = -5.6;
        rhi = 6.4;
      } else {
        const e = rateExtent(s);
        const lo = Math.min(0, e.lo);
        const hi = Math.max(0, e.hi);
        const span = Math.max(1, hi - lo);
        rlo = lo - span * (lo < 0 ? 0.1 : 0.05);
        rhi = hi + span * 0.18;
      }
      const se = stockExtent(s, b0);
      let lo = Math.min(0, se.lo);
      let hi = Math.max(0, se.hi);
      if (p.n > 0) for (const v of partialSums(s, tEff(), p.n, rule())) {
        lo = Math.min(lo, b0 + v);
        hi = Math.max(hi, b0 + v);
      }
      if (key === 'back') hi = Math.max(hi, b0 + distance(s, s.T));
      const span = Math.max(1, hi - lo);
      const goals: [Chan, number][] = [
        [rng.T, s.T],
        [rng.ry0, rlo],
        [rng.ry1, rhi],
        [rng.sy0, lo - span * 0.08],
        [rng.sy1, hi + span * 0.2],
        [CAP, capOf(key)],
      ];
      for (const [c, goal] of goals) {
        if (mode === 'jump' || reduced()) c.jump(goal);
        else if (mode === 'follow') c.follow(goal, 0.2);
        else if (Math.abs(c.goal - goal) > 1e-9) c.glide(goal, 800, 0, now);
      }
    }

    /* =====================================================================
     * Zeiger: Abspielknopf, Zeitleiste, Zeitmarke, eigene Punkte
     * ===================================================================== */
    function hit(px: number, py: number, touch: boolean): string | null {
      const R = regions();
      const S = R.scene;
      if (px >= S.x && px <= S.x + S.w && py >= S.y && py <= S.y + S.h) {
        const G = sceneGeom(S);
        if (Math.hypot(px - G.play.x, py - G.play.y) < G.play.r + 6) return 'play';
        if (px >= G.tx0 - 12 && px <= G.tx1 + 12 && Math.abs(py - G.ty) < (touch ? 18 : 13)) return 'track';
        return null;
      }
      const inR = (r: Rect) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
      if (inR(plot.rect)) {
        if (sitKey() === 'own' && !(morph && morphK < 1)) {
          for (let i = 0; i < OWN.length; i++) if (Math.hypot(px - plot.px(i * 10), py - plot.py(OWN[i]!.v)) < (touch ? 24 : 14)) return `own${i}`;
        }
        if (Math.hypot(px - plot.px(TT.v), py - plot.py(0)) < (touch ? 24 : 14)) return 'tm';
        return 'plotR';
      }
      if (inR(plotB.rect)) return 'plotB';
      return null;
    }
    const cursorFor = (id: string | null) => (id === 'play' ? 'pointer' : id === 'track' || id === 'tm' ? 'ew-resize' : id?.startsWith('own') ? 'ns-resize' : id === 'plotR' || id === 'plotB' ? 'crosshair' : '');

    function timeFromPx(px: number, from: 'plot' | 'track'): number {
      const T = exactSit().T;
      let t: number;
      if (from === 'track') {
        const G = sceneGeom(regions().scene);
        t = clamp01((px - G.tx0) / (G.tx1 - G.tx0)) * T;
      } else t = plot.toWorld(px, 0)[0];
      return Math.round(clamp(t, 0, T) * 2) / 2;
    }
    function scrub(px: number, from: 'plot' | 'track'): void {
      if (running()) ctx.clock.pause();
      stack = null;
      lastDrag = performance.now();
      const t = timeFromPx(px, from);
      runT = t;
      if (t !== p.t) setP({ t });
    }
    const target: Target = {
      contains: (px: number, py: number) => hit(px, py, false) !== null,
      pointerDown: (q: Ptr) => {
        const id = hit(q.px, q.py, q.type === 'touch');
        if (!id || !editable()) return false;
        if (id === 'play') {
          ctx.clock.toggle();
          ctx.requestRender();
          return true;
        }
        if (id.startsWith('own')) {
          if (running()) ctx.clock.pause();
          drag = { kind: 'own', i: Number(id.slice(3)) };
          surface.setCursor('ns-resize');
        } else {
          drag = { kind: 'time', from: id === 'track' ? 'track' : 'plot' };
          surface.setCursor('ew-resize');
          scrub(q.px, drag.from);
        }
        hover = { id, px: q.px, py: q.py };
        ctx.requestRender();
        return true;
      },
      pointerMove: (q: Ptr) => {
        if (!drag) return;
        lastDrag = performance.now();
        if (drag.kind === 'time') scrub(q.px, drag.from);
        else {
          const [, wy] = plot.toWorld(q.px, q.py);
          const key = OWN_KEYS[drag.i]!;
          const v = Math.round(clamp(wy, -5, 5) * 2) / 2;
          if (v !== p[key]) setP({ [key]: v });
        }
        ctx.requestRender();
      },
      pointerUp: (q: Ptr) => {
        drag = null;
        lastDrag = performance.now();
        const id = hit(q.px, q.py, false);
        hover = id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(cursorFor(id));
        retargetRanges(performance.now(), 'glide');
        ctx.requestRender();
      },
      hover: (q: Ptr | null) => {
        const id = q ? hit(q.px, q.py, false) : null;
        hover = q && id ? { id, px: q.px, py: q.py } : null;
        surface.setCursor(editable() ? cursorFor(id) : '');
        ctx.requestRender();
      },
      wheel: () => false,
    };
    surface.addTarget(target);

    /* ---------- Ablauf (Uhr) ---------- */
    /** Startet den Ablauf; am Ende (oder auf Wunsch) erst zurück zum Anfang gleiten. */
    function startRun(now: number, fromStart: boolean): void {
      stack = null;
      finishT = null;
      const T = exactSit().T;
      if (fromStart || TT.v >= T - 1e-6) {
        runT = 0;
        if (reduced()) TT.jump(0);
        else if (TT.v > 1e-6) TT.glide(0, 450 + 350 * clamp01(TT.v / T), 0, now);
      } else runT = TT.v;
      if (!ctx.clock.playing) ctx.clock.play();
    }
    ctx.clock.onChange((playing) => {
      const now = performance.now();
      if (playing) {
        if (ctx.locked) {
          ctx.clock.pause();
          return;
        }
        const T = exactSit().T;
        if (TT.v >= T - 1e-6 && !(TT.busy && TT.goal < TT.v)) startRun(now, true);
        else if (!(TT.busy && TT.goal < TT.v)) runT = TT.v;
      } else {
        const t = Math.round(clamp(runT, 0, exactSit().T) * 2) / 2;
        if (t !== p.t) setP({ t });
      }
      setLabels();
      ctx.requestRender();
    });

    function setLabels(): void {
      ctx.setAction('play', { enabled: editable(), label: running() ? T2('Ablauf läuft …', 'Running …') : T2('Ablauf abspielen', 'Play the process') });
      ctx.setAction('stack', { enabled: editable() });
      ctx.setAction('dbl', { enabled: editable() && p.n < 64 });
      ctx.setAction('reveal', { enabled: editable() });
    }

    /* ---------- Rendern ---------- */
    function render(): void {
      const now = performance.now();
      const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      frameNow = now;
      frameDt = dt;
      numsBusy = false;
      let anim = false;
      if (morph) {
        const q = (now - morph.t0) / morph.dur;
        if (q >= 1) {
          morph = null;
          morphK = 1;
        } else {
          morphK = ease.inOutCubic(clamp01(q));
          anim = true;
        }
      }
      for (const c of chans()) if (c.step(now, dt)) anim = true;
      if (stack && stackDone(now) > stack.n + 0.6) stack = null;
      if (finishT !== null && now - finishT > 1000) finishT = null;
      if (revealT !== null && now - revealT > 1300) revealT = null;
      if (intro !== null || stack || nFrom || finishT !== null || revealT !== null || dragging() || running()) anim = true;
      const k = introState(now);
      const V = viewOf();
      const R = regions();
      surface.begin();
      const g = surface.g;
      g.fillStyle = th().bg;
      g.fillRect(0, 0, surface.width, surface.height);
      g.save();
      g.globalAlpha = k.panel;
      g.translate(0, (1 - k.panel) * 10);
      drawScene(R.scene, V, k, now);
      drawRate(V, k, now);
      drawStock(V, k, now);
      drawLink(V, k);
      g.restore();
      drawColumn(R.col, V, k);
      if (numsBusy) anim = true;
      if (anim) ctx.requestRender();
    }

    /* ---------- Übergänge ---------- */
    let prevKey: SitKey = sitKey();
    let prevN = p.n;
    let prevRule: Rule = rule();

    return {
      update(changed, source) {
        const now = performance.now();
        const instant = source === 'init' || reduced();
        // abgeleiteter Wert: Zeitpunkt im Zeitraum der neuen Situation halten (nur beim Bedienen)
        if (changed.has('sit') && source === 'input' && p.t > exactSit().T) setP({ t: exactSit().T });
        const userish = source === 'input' || source === 'replace';
        if (userish && running()) ctx.clock.pause();
        if (userish && [...changed].some((key) => key !== 'show')) stack = null;
        // Wechsel der Situation: alte Situation blendet in die neue über
        if (changed.has('sit') && source !== 'init' && sitKey() !== prevKey) {
          const fromSit = prevKey === 'own' ? sitOf('own', OWN.map((c) => c.v)) : SITS[prevKey as Exclude<SitKey, 'own'>];
          if (!reduced()) {
            morph = { from: prevKey, fromSit, fromB0: B0.v, fromT: rng.T.v, t0: now, dur: 850 };
            morphK = 0;
          }
          nFrom = null;
          finishT = null;
        }
        // Anfangsbestand und eigene Punkte
        const b0 = b0Of(sitKey());
        if (instant) B0.jump(b0);
        else if (B0.goal !== b0) B0.glide(b0, 700, 0, now);
        OWN_KEYS.forEach((key, i) => {
          const v = p[key] as number;
          const c = OWN[i]!;
          if (instant) c.jump(v);
          else if (drag?.kind === 'own') c.follow(v, 0.05);
          else if (source === 'replace') c.glide(v, 750, 0, now);
          else if (c.goal !== v) c.follow(v, 0.15);
        });
        // Zeitpunkt
        if (!running()) {
          const goal = tEff();
          if (instant) TT.jump(goal);
          else if (drag?.kind === 'time') TT.follow(goal, 0.04);
          else if (source === 'replace' || changed.has('sit')) TT.glide(goal, 900, 120, now);
          else if (TT.goal !== goal && !(TT.busy && TT.goal < TT.v && goal === 0)) TT.follow(goal, 0.14);
          runT = goal;
        }
        // Anzeige-Schalter
        if (changed.has('show')) {
          if (instant) kShow.jump(p.show ? 1 : 0);
          else kShow.glide(p.show ? 1 : 0, 750, 0, now);
          if (p.show && source !== 'init' && !reduced()) revealT = now;
        }
        const nOn = p.n > 0 ? 1 : 0;
        if (instant) kRect.jump(nOn);
        else if (kRect.goal !== nOn) kRect.glide(nOn, 500, 0, now);
        if ((changed.has('n') || changed.has('rule')) && source !== 'init' && !reduced() && (p.n !== prevN || rule() !== prevRule)) nFrom = { n: prevN, rule: prevRule, t0: now };
        retargetRanges(now, instant ? 'jump' : dragging() ? 'follow' : 'glide');
        if (source === 'init' && !reduced()) {
          intro = now;
          // Einstieg: Die Zeit läuft von 0 bis t, die Fläche füllt sich
          TT.jump(0);
          TT.glide(tEff(), 1700, 650, now, ease.inOutCubic);
        }
        prevKey = sitKey();
        prevN = p.n;
        prevRule = rule();
        setLabels();
        updateReadouts();
        ctx.requestRender();
      },
      action(id) {
        if (ctx.locked) return;
        const now = performance.now();
        if (id === 'play') startRun(now, true);
        else if (id === 'dbl') setP({ n: nextDouble(p.n) });
        else if (id === 'reveal') setP({ show: true });
        else if (id === 'stack') {
          if (running()) ctx.clock.pause();
          if (p.n === 0) setP({ n: 6 });
          const n = p.n;
          const per = clamp(3600 / n, 140, 600);
          stack = reduced() ? null : { t0: now + (nFrom ? 650 : 150), n, per };
        }
        setLabels();
        ctx.requestRender();
      },
      tick(dt) {
        if (ctx.locked) {
          ctx.clock.pause();
          return;
        }
        // erst zurück zum Anfang gleiten
        if (TT.busy && TT.goal < TT.v - 1e-9) return;
        const T = exactSit().T;
        runT = reduced() ? T : Math.min(T, runT + (dt * T) / RUN_S);
        TT.jump(runT);
        const q = Math.round(runT * 2) / 2;
        if (q !== p.t) setP({ t: q });
        if (runT >= T - 1e-9) {
          ctx.clock.pause();
          finishT = reduced() ? null : performance.now();
        }
      },
      resetTime() {
        ctx.clock.pause();
        stack = null;
        runT = 0;
        if (reduced()) TT.jump(0);
        else TT.glide(0, 700, 0, performance.now());
        if (p.t !== 0) setP({ t: 0 });
        ctx.requestRender();
      },
      render,
      destroy: () => surface.destroy(),
    };
  },
});
